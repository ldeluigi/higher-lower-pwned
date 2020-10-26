const e = require("express");
const passwords = require("./passwords");
const battleSchema = require('../model/battle.model').schema;
const scoreSchema = require('../model/score.model').schema;


const startTimeMillis = 1000 * 15;
const correctGuessMillis = 1000 * 5;
const correctGuessScore = 100;

module.exports = {
  newGame: async function (gameIDs, userIDs, modeName = "royale") {
    if (gameIDs.length != userIDs.length) {
      throw new Error("Invalid argument. Game IDs should be as many as user IDs.");
    }
    if (hasDuplicates(gameIDs) || hasDuplicates(userIDs.filter(e => e !== undefined && e !== null))) {
      throw new Error("Someone is trying to play with themselves.");
    }
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = {
      games: gameIDs.map(gameID => {
        return {
          gameID: gameID,
          score: 0,
          guesses: 0,
          expiration: new Date(gameStart.getTime() + startTimeMillis),
        }
      }),
      start: gameStart,
      currentP1: p1.password,
      currentP2: p2.password,
      valueP1: p1.value,
      valueP2: p2.value,
      mode: modeName
    };
    if (userIDs) {
      for (let i = 0; i < userIDs.length; i++) {
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
                  $in: gameIDs
                }
              },
              {
                user: {
                  $in: userIDs
                }
              }
            ]

          }
        }
      });
      if (gameQuery === null) await battleSchema.create(newGame);
      else throw new Error("Someone is already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  isPlaying: async function (gameID, userID) {
    let query = {
      games: {
        $elemMatch: {
          $or: [{
            gameID: gameID
          }]
        }
      }
    };
    if (userID) {
      query.games.$elemMatch.$or.push({
        userID: userID
      });
    }
    return null != await battleSchema.findOne(query);
  },
  // -----------------------------------------------------------------------------------------------------------
  currentGuess: async function (gameID) {
    try {
      let gameQuery = await findGame(gameID);
      return await currentGuessFromQuery(gameQuery);
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  quitGame: async function (gameID) {
    try {
      let gameQuery = await findGame(gameID);
      if (gameQuery === null) throw new Error("Game not found.");
      let now = Date.now();
      let index = findGameIndex(gameQuery, gameID);
      let lastOne = gameQuery.games.length == 1;
      checkVictories(gameQuery);
      let score = (game => {
        let res = {
          score: game.score,
          end: gameQuery.end,
          guesses: game.guesses,
          start: gameQuery.start,
          mode: gameQuery.mode + "." + (game.victory ? "win" : "lose")
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
          return null;
        } catch (err) {
          throw new Error("Could not delete game data. (" + err.message + ")");
        }
      } else {
        try {
          gameQuery.games.splice(index, 1);
          await gameQuery.save();
          return await currentGuessFromQuery(gameQuery);
        } catch (err) {
          throw new Error("Could not delete player from game data. (" + err.message + ")");
        }
      }
    } catch (err) {
      throw new Error("Could not create score data. (" + err.message + ")");
    }
    return null;
  },
  // -----------------------------------------------------------------------------------------------------------
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = await findGame(gameID);
      if (gameQuery === null) throw new Error("Game not found.");
      let index = findGameIndex(gameQuery, gameID);
      let now = new Date();

      let game = gameQuery.games[index];
      let minGuesses = computeMinGuesses(gameQuery);
      let leftBehind = computeLeftBehind(gameQuery);

      if (game.lost) {
        return false;
      }

      let guessHandler = () => {
        game.guesses += 1;
        if ((gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
          (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)) {
          game.score += correctGuessScore + Math.floor((game.expiration.getTime() - now.getTime()) / 1000);
          game.expiration = new Date(game.expiration.getTime() + correctGuessMillis);
          game.lastGuess = now;
        } else {
          game.lost = true;
        }
      };

      if (game.guesses == minGuesses && leftBehind == 1) {
        gameQuery.games.forEach(g => {
          if (g == game) return;
          if (g.lastGuess && !g.lost) {
            g.expiration = new Date(g.expiration.getTime() + now.getTime() - g.lastGuess.getTime());
          }
          if (g.expiration < now) {
            g.lost = true;
          }
        });
        if (game.expiration < now) {
          gameQuery.games[index].lost = true;
        } else {
          guessHandler();
        }
        checkVictories(gameQuery);
        if (gameQuery.games.filter(g => !g.lost).length > 0) {
          gameQuery.currentP1 = gameQuery.currentP2;
          gameQuery.valueP1 = gameQuery.valueP2;
          let newP = await passwords.pickPasswordAndValue();
          gameQuery.currentP2 = newP.password;
          gameQuery.valueP2 = newP.value;
        }
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
  }
}

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------

function computeLeftBehind(gameQuery) {
  const minGuesses = computeMinGuesses(gameQuery, true);
  return gameQuery.games.filter(e => !e.lost && e.guesses == minGuesses).length;
}

function computeMinGuesses(gameQuery, defaultToMaxNumber = false) {
  let v = gameQuery.games.filter(e => !e.lost).map(e => e.guesses);
  if (defaultToMaxNumber) {
    v.push(Number.MAX_SAFE_INTEGER);
  }
  return Math.min(...v);
}

async function findGame(gameID) {
  return await battleSchema.findOne({
    games: {
      $elemMatch: {
        gameID: gameID
      }
    }
  });
}

function findGameIndex(gameQuery, gameID) {
  const index = gameQuery.games.findIndex(e => e.gameID == gameID);
  if (index < 0) throw new Error("ID not found");
  return index;
}

function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

function checkVictories(gameQuery) {
  if (gameQuery.end !== null && gameQuery.end !== undefined)
    return;
  let playingPlayers = gameQuery.games.filter(e => !e.lost);
  if (playingPlayers.length == 1) {
    playingPlayers[0].victory = true;
    gameQuery.end = new Date();
  } else {
    let now = Date.now();
    let minGuesses = computeMinGuesses(gameQuery, true);
    let everyoneExpired = gameQuery.games.filter(e => {
      let timeout = e.guesses > minGuesses ?
        Number.MAX_SAFE_INTEGER :
        e.expiration.getTime() - now;
      return timeout < 0 && !e.lost;
    }).length == playingPlayers.length;
    console.log("[INFO] ", playingPlayers.length, everyoneExpired)
    if (playingPlayers.length == 0) {
      let maxScore = Math.max(...gameQuery.games.map(e => e.score));
      gameQuery.games.forEach(e => {
        if (e.score == maxScore) {
          e.victory = true;
          gameQuery.end = new Date();
        }
      });
    } else if (everyoneExpired) {
      let maxExpiration = Math.max(gameQuery.games.filter(e => !e.lost).map(e => {
        return e.expiration.getTime();
      }));
      gameQuery.games.forEach(e => {
        if (e.expiration.getTime() == maxExpiration) {
          e.victory = true;
          gameQuery.end = new Date();
        }
      });
    }
  }
}

async function currentGuessFromQuery(gameQuery) {
  if (gameQuery === null) throw new Error("Game not found.");
  let now = Date.now();
  let minGuesses = computeMinGuesses(gameQuery, true);
  let playingNumber = gameQuery.games.filter(e => !e.lost).length;
  let everyoneExpired = gameQuery.games.filter(e => {
    let timeout = e.guesses > minGuesses ?
      Number.MAX_SAFE_INTEGER :
      e.expiration.getTime() - now;
    return timeout < 0 && !e.lost;
  }).length == playingNumber;
  try {
    if (everyoneExpired) {
      gameQuery.games.forEach(e => {
        e.lost = true;
      });
      checkVictories(gameQuery);
    } else {
      let magic = false;
      gameQuery.games.filter(e => {
        let timeout = e.guesses > minGuesses ?
          Number.MAX_SAFE_INTEGER :
          e.expiration.getTime() - now;
        return !e.lost && e.guesses == minGuesses && timeout <= 0
      }).forEach(e => {
        e.lost = true;
        magic = true;
      });
      let _minGuesses = computeMinGuesses(gameQuery, true);
      let _leftBehind = computeLeftBehind(gameQuery);
      let _playingNumber = gameQuery.games.filter(e => !e.lost).length;
      let _someoneIsBehind = _leftBehind < _playingNumber;
      /* magic is when a player lost for timeout, and _minGuesses > minGuesses
       checks if the lost player(s) was/were behind evryone else and now the
       game should proceed to be even, or not. */
      if (!_someoneIsBehind && magic && _minGuesses > minGuesses) {
        gameQuery.games.filter(e => !e.lost).forEach(g => {
          if (g.lastGuess && !g.lost) {
            g.expiration = new Date(g.expiration.getTime() + now - g.lastGuess.getTime());
          }
          if (g.expiration.getTime() < now) {
            g.lost = true;
          }
        });
        checkVictories(gameQuery);
        gameQuery.currentP1 = gameQuery.currentP2;
        gameQuery.valueP1 = gameQuery.valueP2;
        let newP = await passwords.pickPasswordAndValue();
        gameQuery.currentP2 = newP.password;
        gameQuery.valueP2 = newP.value;
      }
    }
    await gameQuery.save();
  } catch (err) {
    throw new Error("Could not update game after someone didn't answer (" + err.message + ")");
  }
  minGuesses = computeMinGuesses(gameQuery, true);
  let leftBehind = computeLeftBehind(gameQuery);
  playingNumber = gameQuery.games.filter(e => !e.lost).length;
  let someoneIsBehind = leftBehind < playingNumber;
  let playerObjs = gameQuery.games.map(game => {
    let res = {
      password1: gameQuery.currentP1,
      value1: gameQuery.valueP1,
      password2: gameQuery.currentP2,
      guesses: game.guesses,
      duration: Date.now() - gameQuery.start.getTime()
    };
    if (!someoneIsBehind) {
      let timeout = game.guesses > minGuesses ?
        Number.MAX_SAFE_INTEGER :
        game.expiration.getTime() - now;
      res.score = game.score;
      res.timeout = timeout;
      res.lost = game.lost;
    }
    if (playingNumber == 0) {
      res.value2 = gameQuery.valueP2;
    }
    return res;
  });
  return {
    ids: gameQuery.games.map(e => e.gameID),
    data: playerObjs
  };
}
