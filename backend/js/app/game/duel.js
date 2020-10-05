const passwords = require("./passwords");
const duelSchema = require('../model/battle').schema;
const scoreSchema = require('../model/score').schema;


const startTimeMillis = 1000 * 10;
const correctGuessMillis = 1000 * 5;
const correctGuessScore = 100;

module.exports = {
  newGame: async function (gameID1, gameID2, userID1, userID2) {
    if (gameID1 == gameID2 ||
      (userID1 !== undefined && userID2 !== undefined && userID1 == userID2)) {
      throw new Error("You can't play against yourself");
    }
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = {
      games: [
        {
          gameID: gameID1,
          score: 0,
          guesses: 0,
          expiration: new Date(gameStart.getTime() + startTimeMillis),
        },
        {
          gameID: gameID2,
          score: 0,
          guesses: 0,
          expiration: new Date(gameStart.getTime() + startTimeMillis)
        }
      ],
      start: gameStart,
      currentP1: p1.password,
      currentP2: p2.password,
      valueP1: p1.value,
      valueP2: p2.value
    };
    if (userID1) {
      newGame.games[0].user = userID1;
    }
    if (userID2) {
      newGame.games[1].user = userID2;
    }
    try {
      let gameQuery = await duelSchema.findOne({
        games: {
          $or: [
            {
              gameID: {
                $in: [gameID1, gameID2]
              }
            },
            {
              user: {
                $in: [userID1, userID2]
              }
            }
          ]
        }
      });
      if (gameQuery === null) await duelSchema.create(newGame);
      else throw new Error("Already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  currentGuess: async function (gameID) {
    try {
      let gameQuery = await duelSchema.findOne({
        games: {
          gameID: gameID
        }
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let index = gameQuery.games.findIndex(e => e.gameID == gameID);
      if (index < 0) throw new Error("ID not found");
      let minGuesses = Math.min(...gameQuery.games.map(e => e.guesses));
      let now = Date.now();
      let playerObjs = gameQuery.games.map(game => {
        let timeout = game.guesses > minGuesses ?
          Number.MAX_SAFE_INTEGER :
          game.expiration.getTime() - now;
        return {
          password1: gameQuery.currentP1,
          value1: gameQuery.valueP1,
          password2: gameQuery.currentP2,
          timeout: timeout,
          score: game.score,
          guesses: game.guesses,
          duration: Date.now() - gameQuery.start.getTime(),
          lost: timeout < 0
        };
      });
      return {
        index: index,
        data: playerObjs
      };
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  deleteGame: async function (gameID, forceLose = false) {
    try {
      let gameQuery = await duelSchema.findOne({
        games: {
          gameID: gameID
        }
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let index = gameQuery.games.findIndex(e => e.gameID == gameID);
      if (index < 0) throw new Error("ID not found");
      let now = Date.now();
      let minGuesses = Math.min(...gameQuery.games.map(e => e.guesses));
      let scores = gameQuery.games.map(game => {
        let timeout = game.guesses > minGuesses ?
          Number.MAX_SAFE_INTEGER :
          game.expiration.getTime() - now;
        let res = {
          score: game.score,
          end: new Date(),
          guesses: game.guesses,
          start: gameQuery.start,
          mode: "duel." + (timeout < 0 || (game.gameID == gameID && forceLose) ? "lose" : "win")
        };
        if (game.user) {
          res.user = game.user;
        }
        return res;
      });

      await Promise.all(scores.map(element => scoreSchema.create(element)));

      try {
        await duelSchema.deleteOne({
          games: {
            gameID: gameID
          }
        });

        let playerObjs = gameQuery.games.map(game => {
          let timeout = game.guesses > minGuesses ?
            Number.MAX_SAFE_INTEGER :
            game.expiration.getTime() - now;
          return {
            password1: gameQuery.currentP1,
            value1: gameQuery.valueP1,
            password2: gameQuery.currentP2,
            value2: gameQuery.valueP2,
            timeout: timeout,
            score: game.score,
            guesses: game.guesses,
            duration: Date.now() - gameQuery.start.getTime(),
            lost: timeout < 0
          };
        });

        return {
          index: index,
          data: playerObjs
        };
      } catch (err) {
        throw new Error("Could not delete game data. (" + err.message + ")");
      }
    } catch (err) {
      throw new Error("Could not create score data. (" + err.message + ")");
    }
  },
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = await duelSchema.findOne({
        games: {
          gameID: gameID
        }
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let index = gameQuery.games.findIndex(e => e.gameID == gameID);
      if (index < 0) throw new Error("ID not found");

      let game = gameQuery.games[index];

      if (game.expiration < new Date()) {
        return false;
      }

      let minGuesses = Math.min(...gameQuery.games.map(e => e.guesses));
      let leftBehind = gameQuery.games.filter(e => e.guesses == minGuesses).length;

      if ((gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
        (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)) {
        if (game.guesses == minGuesses && leftBehind == 1) {
          game.guesses += 1;
          game.score += correctGuessScore + Math.floor((game.expiration.getTime() - Date.now()) / 1000);
          game.lastGuess = new Date();
          gameQuery.games.forEach(g => {
            g.expiration = new Date(g.expiration.getTime() + game.lastGuess.getTime() - g.lastGuess.getTime());
          });
          game.expiration += correctGuessMillis;
          gameQuery.currentP1 = gameQuery.currentP2;
          gameQuery.valueP1 = gameQuery.valueP2;
          let newP = await passwords.pickPasswordAndValue();
          gameQuery.currentP2 = newP.password;
          gameQuery.valueP2 = newP.value;
        } else if (game.guesses == minGuesses) {
          game.guesses += 1;
          game.score += correctGuessScore + Math.floor((game.expiration.getTime() - Date.now()) / 1000);
          game.expiration = new Date(game.expiration.getTime() + correctGuessMillis);
          game.lastGuess = new Date();
        } else {
          throw new Error("Guess already submitted. Wait for your opponents.");
        }
        await gameQuery.save();
      } else {
        return false;
      }
    } catch (err) {
      throw new Error("Could not alter game data. (" + err.message + ")");
    }
    return true;
  }
}
