const passwords = require("./passwords");
const gameSchema = require('../model/game.model').schema;
const scoreSchema = require('../model/score.model').schema;


const startTimeMillis = 1000 * 12;
const correctGuessMillis = 1000 * 6;
const correctGuessScore = 100;

module.exports = {
  newGame: async function (gameID, userID) {
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = {
      score: 0,
      guesses: 0,
      start: gameStart,
      gameID: gameID,
      currentP1: p1.password,
      currentP2: p2.password,
      valueP1: p1.value,
      valueP2: p2.value,
      expiration: new Date(gameStart.getTime() + startTimeMillis)
    };
    if (userID) {
      newGame.user = userID;
    }
    try {
      let gameQuery = await gameSchema.findOne({ gameID: gameID });
      if (gameQuery === null) await gameSchema.create(newGame);
      else throw new Error("Already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  currentGuess: async function (gameID) {
    try {
      let gameQuery = await gameSchema.findOne({ gameID: gameID });
      if (gameQuery === null) throw new Error("Game not found.");
      let timeout = gameQuery.expiration.getTime() - Date.now();
      return {
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        timeout: timeout,
        score: gameQuery.score,
        guesses: gameQuery.guesses,
        duration: Date.now() - gameQuery.start.getTime(),
        lost: timeout <= 0
      };
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  deleteGame: async function (gameID) {
    try {
      let gameQuery = await gameSchema.findOne({ gameID: gameID });
      if (gameQuery === null) throw new Error("Game not found.");
      let newScore = {
        score: gameQuery.score,
        end: new Date(),
        guesses: gameQuery.guesses,
        start: gameQuery.start,
        mode: "arcade"
      };
      if (gameQuery.user) {
        newScore.user = gameQuery.user;
      }
      await scoreSchema.create(newScore);
      try {
        await gameSchema.deleteOne({ gameID: gameID });
        return {
          score: gameQuery.score,
          guesses: gameQuery.guesses,
          duration: newScore.end - newScore.start,
          password1: gameQuery.currentP1,
          value1: gameQuery.valueP1,
          password2: gameQuery.currentP2,
          value2: gameQuery.valueP2
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
      let gameQuery = await gameSchema.findOne({ gameID: gameID });
      if (gameQuery === null) throw new Error("Game not found.");
      if (gameQuery.expiration < new Date()) {
        return false;
      }
      if ((gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
        (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)) {
        gameQuery.currentP1 = gameQuery.currentP2;
        gameQuery.valueP1 = gameQuery.valueP2;
        let newP = await passwords.pickPasswordAndValue();
        gameQuery.currentP2 = newP.password;
        gameQuery.valueP2 = newP.value;
        gameQuery.guesses += 1;
        gameQuery.score += correctGuessScore + Math.floor((gameQuery.expiration.getTime() - Date.now()) / 1000);
        gameQuery.expiration = new Date(gameQuery.expiration.getTime() + correctGuessMillis);
        gameQuery.lastGuess = new Date();
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
