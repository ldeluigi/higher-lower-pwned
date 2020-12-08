const passwords = require("./passwords");
const { Battle, Game } = require('../model/battle.class');
const scoreSchema = require("../model/score.model").schema;
const battles = require("../model/battles");

const startTimeMillis = 1000 * 15;
const correctGuessMillis = 1000 * 6;
const correctGuessScore = 100;
const maxExpirationTimeMillis = 1000 * 30;

module.exports = {
  /**
   * @param {String[]} gameIDs
   * @param {String[]} userIDs
   * @param {String} modeName
   */
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
    let newGame = new Battle(
      gameStart,
      p1.password,
      p1.value,
      p2.password,
      p2.value,
      modeName,
      ...gameIDs.map((gameID, i) => {
        return new Game(
          gameID,
          new Date(gameStart.getTime() + startTimeMillis),
          userIDs && userIDs[i] ? userIDs[i] : undefined
        );
      })
    );
    try {
      let someoneIsAlreadyPlaying =
        gameIDs.some(id => battles.findOneByGame(id, null) != null) ||
        userIDs.some(uid => battles.findOneByGame(null, uid) != null);
      if (!someoneIsAlreadyPlaying) battles.addBattle(newGame);
      else throw new Error("Someone is already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  /**
   * @param {String} gameID
   * @param {String} userID
   */
  isPlaying: function (gameID, userID = undefined) {
    return null != battles.findOneByGame(gameID, userID);
  },
  // -----------------------------------------------------------------------------------------------------------
  /**
   * @param {String} gameID
   */
  currentGuess: async function (gameID) {
    try {
      let gameQuery = battles.findOneByGame(gameID);
      return await currentGuessFromQuery(gameQuery);
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  nextTimeout: async function (gameID) {
    let gameQuery = battles.findOneByGame(gameID);
    if (gameQuery === null) throw new Error("Game not found.");
    await currentGuessFromQuery(gameQuery);
    let now = Date.now();
    let minGuesses = gameQuery.computeMinGuesses(true);
    let filteredGames = gameQuery.games
      .filter(e => !e.lost)
      .map(e => {
        let timeout = e.guesses > minGuesses ?
          Number.MAX_SAFE_INTEGER :
          e.expiration.getTime() - now;
        return timeout;
      })
      .filter(t => t > 0);
    return filteredGames.length > 0 ? Math.min(...filteredGames) : 0;
  },
  // -----------------------------------------------------------------------------------------------------------
  quitGame: async function (gameID) {
    try {
      let gameQuery = battles.findOneByGame(gameID);
      if (gameQuery === null) throw new Error("Game not found.");
      let now = Date.now();
      let index = gameQuery.findGameIndex(gameID);
      let lastOne = gameQuery.games.length == 1;
      gameQuery.checkVictories();
      let score = (game => {
        let res = {
          score: game.score,
          end: gameQuery.end || now,
          guesses: game.guesses,
          start: gameQuery.start,
          mode: gameQuery.mode + "." + (game.victory ? "win" : "lose")
        };
        if (game.user) {
          res.user = game.user;
        }
        return res;
      })(gameQuery.games[index]);
      let res;
      if (lastOne) {
        battles.deleteBattle(gameQuery);
        res = null;
      } else {
        try {
          gameQuery.games.splice(index, 1);
          res = await currentGuessFromQuery(gameQuery);
        } catch (err) {
          throw new Error("Could not delete player from game data. (" + err.message + ")");
        }
      }
      await scoreSchema.create([score]);
      return res;
    } catch (err) {
      throw new Error("Could not create score data. (" + err.message + ")");
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  /**
   * @param {String} userID
   */
  deleteUser: function (userID) {
    if (userID) {
      let gameQuery = battles.findOneByGame(null, userID);
      if (gameQuery) {
        let g = gameQuery.games.find(e => e.user == userID);
        if (g) {
          this.quitGame(g.gameID);
        }
      }
    }
  },
  // -----------------------------------------------------------------------------------------------------------
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = battles.findOneByGame(gameID);
      if (gameQuery === null) throw new Error("Game not found.");
      let index = gameQuery.findGameIndex(gameID);
      let now = new Date();
      let game = gameQuery.games[index];
      let minGuesses = gameQuery.computeMinGuesses();
      let leftBehind = gameQuery.computeLeftBehind();
      if (game.lost) {
        return false;
      }
      let guessHandler = () => {
        game.guesses += 1;
        if ((gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
          (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)) {
          game.score += correctGuessScore + Math.floor((game.expiration.getTime() - now.getTime()) / 1000);
          const futureExpirationMillis = game.expiration.getTime() + correctGuessMillis;
          game.expiration = new Date(Math.min(futureExpirationMillis, now.getTime() + maxExpirationTimeMillis));
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
        gameQuery.checkVictories();
        if (
          gameQuery.games.filter(g => !g.lost).length > 0) {
          await loadNewPassword(gameQuery);
        }
      } else if (game.guesses == minGuesses) {
        guessHandler();
      } else {
        throw new Error("Guess already submitted. Wait for your opponents.");
      }
    } catch (err) {
      throw new Error("Could not retrieve game data. (" + err.message + ")");
    }
    return true;
  }
}

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------



/**
 * @param {any[]} array
 */
function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

/**
 * @param {Battle} gameQuery
 */
async function loadNewPassword(gameQuery) {
  gameQuery.currentP1 = gameQuery.currentP2;
  gameQuery.valueP1 = gameQuery.valueP2;
  let newP = await passwords.pickPasswordAndValue();
  gameQuery.currentP2 = newP.password;
  gameQuery.valueP2 = newP.value;
}

/**
 * @param {Battle} gameQuery
 */
async function currentGuessFromQuery(gameQuery) {
  if (gameQuery === null) throw new Error("Game not found.");
  let mustLoadNewPasswords = false;
  let nowInMillis = Date.now();
  let minGuesses = gameQuery.computeMinGuesses(true);
  let playingNumber = gameQuery.gamesNotLost().length;
  let everyoneExpired = gameQuery.hasEverybodyExpired(nowInMillis);
  if (everyoneExpired) {
    gameQuery.games.forEach(e => {
      e.lost = true;
    });
    gameQuery.checkVictories();
  } else {
    let someoneJustLost = false;
    gameQuery.games.filter(e => {
      let timeout = e.guesses > minGuesses ?
        Number.MAX_SAFE_INTEGER :
        e.expiration.getTime() - nowInMillis;
      return !e.lost && e.guesses == minGuesses && timeout <= 0
    }).forEach(e => {
      e.lost = true;
      someoneJustLost = true;
    });
    let _minGuesses = gameQuery.computeMinGuesses(true);
    let _leftBehind = gameQuery.computeLeftBehind();
    let _playingNumber = gameQuery.gamesNotLost().length;
    let _someoneIsBehind = _leftBehind < _playingNumber;
    /* someoneJustLost is when a player lost for timeout, and _minGuesses > minGuesses
     checks if the lost player(s) was/were behind evryone else and now the
     game should proceed to be even, or not. */
    if (!_someoneIsBehind && someoneJustLost && _minGuesses > minGuesses) {
      gameQuery.games.filter(e => !e.lost).forEach(g => {
        if (g.lastGuess && !g.lost) {
          g.expiration = new Date(g.expiration.getTime() + nowInMillis - g.lastGuess.getTime());
        }
        if (g.expiration.getTime() < nowInMillis) {
          g.lost = true;
        }
      });
      gameQuery.checkVictories();
      mustLoadNewPasswords = true;
    }
  }
  minGuesses = gameQuery.computeMinGuesses(true);
  let leftBehind = gameQuery.computeLeftBehind();
  playingNumber = gameQuery.gamesNotLost().length;
  let someoneIsBehind = leftBehind < playingNumber;
  let playerObjs = gameQuery.games.map(game => {
    let res = {
      password1: gameQuery.currentP1,
      value1: gameQuery.valueP1,
      password2: gameQuery.currentP2,
      guesses: game.guesses,
      duration: nowInMillis - gameQuery.start.getTime()
    };
    if (!someoneIsBehind) {
      let timeout = game.guesses > minGuesses ?
        Number.MAX_SAFE_INTEGER :
        game.expiration.getTime() - nowInMillis;
      res.score = game.score;
      res.timeout = timeout;
      res.lost = game.lost;
    }
    if (playingNumber == 0) {
      res.value2 = gameQuery.valueP2;
      res.won = game.victory;
    }
    return res;
  });
  if (mustLoadNewPasswords) {
    await loadNewPassword(gameQuery);
  }
  return {
    ids: gameQuery.games.map(e => e.gameID),
    data: playerObjs
  };
}
