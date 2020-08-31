const fs = require('fs').promises;
const path = require('path');
const gameSchema = require('../model/game').schema;
const scoreSchema = require('../model/score').schema;


const startTimeMillis = 1000 * 10;
const correctGuessMillis = 1000 * 5;
const correctGuessScore = 100;

async function pickPasswordAndValue() {
  return {
    password: "testpassword" + Math.round(Math.random() * 100),
    value: Math.round(Math.random() * 100000)
  };
}

module.exports = {
  setup: async function () {
    let passwordFiles = await fs.readdir(path.join(__dirname, "/passwords"));
    passwordFiles = passwordFiles.filter(fn => fn.endsWith(".csv"));
    if (passwordFiles.length <= 0) throw new Error("Password files missing.");
  },
  newGame: async function (gameID, userID) {
    let p1 = await pickPasswordAndValue();
    let p2 = await pickPasswordAndValue();
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
      return {
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        timeout: gameQuery.expiration.getTime() - Date.now(),
        score: gameQuery.score,
        guesses: gameQuery.guesses,
        duration: Date.now() - gameQuery.start.getTime()
      }
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
        start: gameQuery.start
      };
      if (gameQuery.user) {
        newScore.user = gameQuery.user;
      }
      await scoreSchema.create(newScore);
      await gameSchema.deleteOne({ gameID: gameID });
      return {
        score: gameQuery.score,
        guesses: gameQuery.guesses,
        duration: gameQuery.duration,
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        value2: gameQuery.valueP2
      };
    } catch (err) {
      throw new Error("Could not delete game data. (" + err.message + ")");
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
        let newP = await pickPasswordAndValue();
        gameQuery.currentP2 = newP.password;
        gameQuery.valueP2 = newP.value;
        gameQuery.guesses += 1;
        gameQuery.score += correctGuessScore;
        gameQuery.expiration = new Date(gameQuery.expiration.getTime() + correctGuessMillis);
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
