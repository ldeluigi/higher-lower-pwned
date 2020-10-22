const e = require("express");
const passwords = require("./passwords");
const battleSchema = require("../model/battle").schema;
const scoreSchema = require("../model/score").schema;

const startTimeMillis = 1000 * 10;
const correctGuessMillis = 1000 * 10;
const correctGuessScore = 100;

function findMinGuesses(gameQuery) {
  console.log("min");
  console.log("min1" + gameQuery);
  console.log("min2" + gameQuery.games);
  console.log(
    "min3" + gameQuery.games.filter((e) => !e.lost).map((e) => e.guesses)
  );
  console.log(...gameQuery.games.filter((e) => !e.lost).map((e) => e.guesses));
  console.log(
    "finding min: " +
      Math.min(
        Number.MAX_SAFE_INTEGER,
        ...gameQuery.games.filter((e) => !e.lost).map((e) => e.guesses)
      )
  );
  return Math.min(
    Number.MAX_SAFE_INTEGER,
    ...gameQuery.games.filter((e) => !e.lost).map((e) => e.guesses)
  );
}

function getIndexCheckingGameID(gameQuery, gameID) {
  console.log("getIndexCheckingGameID: " + gameQuery);
  let index = gameQuery.games.findIndex((e) => e.gameID == gameID);
  console.log("getting index : " + index);
  if (index < 0) throw new Error("ID not found");
  return index;
}

function getPlayingPlayers(gameQuery) {
  console.log("playing players: " + gameQuery.games.filter((e) => !e.lost));
  return gameQuery.games.filter((e) => !e.lost);
}

function getPlayingNumber(gameQuery) {
  console.log("number of players:  " + getPlayingPlayers(gameQuery).length);
  return getPlayingPlayers(gameQuery).length;
}

function getTimeout(game, minGuesses, now) {
  console.log(
    "searching for the timeout : " + game.guesses > minGuesses
      ? Number.MAX_SAFE_INTEGER
      : game.expiration.getTime() - now
  );
  return game.guesses > minGuesses
    ? Number.MAX_SAFE_INTEGER
    : game.expiration.getTime() - now;
}

function isEveryoneExpired(gameQuery, playingNumber, now) {
  console.log(
    "isEveryoneExpired: " +
      gameQuery.games.filter((game) => {
        return (
          getTimeout(game, findMinGuesses(gameQuery), now) < 0 && !game.lost
        );
      }).length ==
      playingNumber
  );
  return (
    gameQuery.games.filter((game) => {
      return getTimeout(game, findMinGuesses(gameQuery), now) < 0 && !game.lost;
    }).length == playingNumber
  );
}

function getLeftsBehind(gameQuery, minGuesses) {
  console.log(
    "getLeftsBehind:" +
      gameQuery.games.filter((e) => !e.lost && e.guesses == minGuesses).length
  );
  return gameQuery.games.filter((e) => !e.lost && e.guesses == minGuesses)
    .length;
}

async function checkVictoriesAndGoNextPassword(gameQuery) {
  try {
    checkVictories(gameQuery);
    console.log("victoryChecked");
    gameQuery.currentP1 = gameQuery.currentP2;
    gameQuery.valueP1 = gameQuery.valueP2;
    let newP = await passwords.pickPasswordAndValue();
    gameQuery.currentP2 = newP.password;
    gameQuery.valueP2 = newP.value;
    console.log("swapt");
  } catch (err) {
    throw new Error("Unable to go next password: " + err);
  }
}

function updateAndCheckExpiration(game, numericNow) {
  console.log("updateAndCheckExpiration : " + game.lastGuess && !game.lost);
  if (game.lastGuess && !game.lost) {
    game.expiration = new Date(
      game.expiration.getTime() + numericNow - game.lastGuess.getTime()
    );
  }
  console.log(
    "updateAndCheckExpiration2: " + game.expiration.getTime() < numericNow
  );
  if (game.expiration.getTime() < numericNow) {
    game.lost = true;
  }
}

async function getAndCheckDefaultGameQuery(gameID) {
  try {
    let gameQuery = await battleSchema.findOne({
      games: {
        $elemMatch: {
          gameID: gameID,
        },
      },
    });
    console.log("getAndCheckDefaultGameQuery: " + gameQuery);
    if (gameQuery === null) throw new Error("Game not found.");
    return gameQuery;
  } catch (err) {
    throw new Error("Unable to fine gameQuery: " + err);
  }
}

async function currentGuessWithGameQuery(gameQuery) {
  let now = Date.now();
  try {
    if (isEveryoneExpired(gameQuery, getPlayingNumber(gameQuery), now)) {
      gameQuery.games.forEach((e) => {
        e.lost = true;
      });
      checkVictories(gameQuery);
    } else {
      let someoneUpdated = false;
      let minGuesses = findMinGuesses(gameQuery);
      gameQuery.games
        .filter((e) => {
          return (
            !e.lost &&
            e.guesses == minGuesses &&
            getTimeout(e, minGuesses, now) <= 0
          );
        })
        .forEach((e) => {
          e.lost = true;
          someoneUpdated = true;
        });
      let someoneIsBehind =
        getLeftsBehind(gameQuery, findMinGuesses(gameQuery)) <
        getPlayingNumber(gameQuery);
      if (!someoneIsBehind && someoneUpdated) {
        gameQuery.games
          .filter((e) => !e.lost)
          .forEach((g) => {
            updateAndCheckExpiration(g, now);
          });
        await checkVictoriesAndGoNextPassword(gameQuery);
      }
    }
    await gameQuery.save();
  } catch (err) {
    throw new Error(
      "Could not update game after someone didn't answer (" + err.message + ")"
    );
  }
  let minGuesses = findMinGuesses(gameQuery);
  let playingNumber = getPlayingNumber(gameQuery);
  let someoneIsBehind = getLeftsBehind(gameQuery, minGuesses) < playingNumber;
  let playerObjs = gameQuery.games.map((game) => {
    let res = {
      password1: gameQuery.currentP1,
      value1: gameQuery.valueP1,
      password2: gameQuery.currentP2,
      guesses: game.guesses,
      duration: Date.now() - gameQuery.start.getTime(),
    };
    if (!someoneIsBehind) {
      res.score = game.score;
      res.timeout = getTimeout(game, minGuesses, now);
      res.lost = game.lost;
    }
    if (playingNumber == 0) {
      res.value2 = gameQuery.valueP2;
    }
    return res;
  });
  return {
    ids: gameQuery.games.map((e) => e.gameID),
    data: playerObjs,
  };
}

module.exports = {
  newGame: async function (gameIDs, userIDs, modeName = "royale") {
    if (
      hasDuplicates(gameIDs) ||
      hasDuplicates(userIDs.filter((e) => e !== undefined && e !== null))
    ) {
      throw new Error("Someone is trying to play with themselves.");
    }
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = {
      games: gameIDs.map((gameID) => {
        return {
          gameID: gameID,
          score: 0,
          guesses: 0,
          expiration: new Date(gameStart.getTime() + startTimeMillis),
        };
      }),
      start: gameStart,
      currentP1: p1.password,
      currentP2: p2.password,
      valueP1: p1.value,
      valueP2: p2.value,
      mode: modeName,
    };
    if (userIDs) {
      for (i = 0; i < userIDs.length; i++) {
        if (userIDs[i]) {
          newGame.games[i].user = userIDs[i];
        }
      }
    }
    try {
      let gameQuery = await battleSchema.findOne({
        games: {
          $elemMatch: {
            $or: [
              {
                gameID: {
                  $in: gameIDs,
                },
              },
              {
                user: {
                  $in: userIDs,
                },
              },
            ],
          },
        },
      });
      if (gameQuery === null) await battleSchema.create(newGame);
      else throw new Error("Someone is already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  isPlaying: async function (gameID, userID) {
    console.log("isPlaying: " + gameID + " " + userID);
    let query = {
      games: {
        $elemMatch: {
          $or: [
            {
              gameID: gameID,
            },
          ],
        },
      },
    };
    if (userID) {
      query.games.$elemMatch.$or.push({
        userID: userID,
      });
    }
    return null != (await battleSchema.findOne(query));
  },
  // -----------------------------------------------------------------------------------------------------------
  currentGuess: async function (gameID) {
    console.log("currentGuess: " + gameID);
    try {
      let gameQuery = await getAndCheckDefaultGameQuery(gameID);
      getIndexCheckingGameID(gameQuery, gameID);
      return await currentGuessWithGameQuery(gameQuery);
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  quitGame: async function (gameID) {
    console.log("quitGame: " + gameID);
    try {
      let gameQuery = await getAndCheckDefaultGameQuery(gameID);
      let now = Date.now();
      let index = getIndexCheckingGameID(gameQuery, gameID);
      let lastOne = gameQuery.games.length == 1;
      checkVictories(gameQuery);
      let score = ((game) => {
        let res = {
          score: game.score,
          end: now,
          guesses: game.guesses,
          start: gameQuery.start,
          mode: gameQuery.mode + "." + (game.victory ? "win" : "lost"),
        };
        if (game.user) {
          res.user = game.user;
        }
        return res;
      })(gameQuery.games[index]);

      await scoreSchema.create(score);
      if (lastOne) {
        try {
          await gameQuery.remove();
          return true;
        } catch (err) {
          throw new Error("Could not delete game data. (" + err.message + ")");
        }
      } else {
        try {
          gameQuery.games.splice(index, 1);
          await gameQuery.save();
          return await currentGuessWithGameQuery(gameQuery);
        } catch (err) {
          throw new Error(
            "Could not delete player from game data. (" + err.message + ")"
          );
        }
      }
    } catch (err) {
      throw new Error("Could not create score data. (" + err.message + ")");
    }
    return false;
  },
  // -----------------------------------------------------------------------------------------------------------
  submitGuess: async function (gameID, guess) {
    console.log("submitGuess: " + gameID + " " + guess);
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = await getAndCheckDefaultGameQuery(gameID);
      let now = new Date();
      let index = getIndexCheckingGameID(gameQuery, gameID);
      let game = gameQuery.games[index];
      let minGuesses = findMinGuesses(gameQuery);
      let leftBehind = getLeftsBehind(gameQuery, minGuesses);

      if (game.lost) {
        return false;
      }

      let guessHandler = () => {
        game.guesses += 1;
        if (
          (gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
          (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)
        ) {
          game.score +=
            correctGuessScore +
            Math.floor((game.expiration.getTime() - now.getTime()) / 1000);
          game.expiration = new Date(
            game.expiration.getTime() + correctGuessMillis
          );
          game.lastGuess = now;
        } else {
          game.lost = true;
        }
      };

      if (game.guesses == minGuesses && leftBehind == 1) {
        gameQuery.games.forEach((g) =>
          updateAndCheckExpiration(g, now.getTime())
        );
        if (!(game.expiration < now)) {
          guessHandler();
        } /*else { should be already done (in updateAndCheckExpiration) 
          gameQuery.games[index].lost = true;
        }*/
        await checkVictoriesAndGoNextPassword(gameQuery);
      } else if (game.guesses == minGuesses) {
        guessHandler();
      } else {
        throw new Error("Guess already submitted. Wait for your opponents.");
      }
      try {
        await gameQuery.save();
      } catch (err) {
        throw new Error("Could not alter game data. (" + err.message + ")");
      }
    } catch (err) {
      throw new Error("Could not retrieve game data. (" + err.message + ")");
    }
    return true;
  },
};

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
}

function checkVictories(gameQuery) {
  console.log("checkVictories: " + gameQuery);
  if (gameQuery.games.filter((e) => e.victory).length > 0) return;
  let playingPlayers = getPlayingPlayers(gameQuery);
  if (playingPlayers.length == 1) {
    playingPlayers[0].victory = true;
  } else {
    let now = Date.now();
    if (playingPlayers.length == 0) {
      let maxScore = Math.max(...gameQuery.games.map((e) => e.score));
      gameQuery.games.forEach((e) => {
        if (e.score == maxScore) {
          e.victory = true;
        }
      });
    } else if (isEveryoneExpired(gameQuery, playingPlayers.length, now)) {
      let maxExpiration = Math.max(
        gameQuery.games
          .filter((e) => !e.lost)
          .map((e) => {
            return e.expiration.getTime();
          })
      );
      gameQuery.games.forEach((e) => {
        if (e.expiration.getTime() == maxExpiration) {
          e.victory = true;
        }
      });
    }
  }
}
