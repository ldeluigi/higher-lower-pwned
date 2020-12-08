const passwords = require("./passwords");
const scoreSchema = require('../model/score.model').schema;
const { Arcade } = require("../model/arcade.class");
const arcades = require("../model/arcades");


const startTimeMillis = 1000 * 12;
const correctGuessMillis = 1000 * 6;
const correctGuessScore = 100;


module.exports = {
  /**
   * @param {String} gameID
   * @param {String} userID
   */
  newGame: async function (gameID, userID = undefined) {
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = new Arcade(
      gameID,
      gameStart,
      new Date(gameStart.getTime() + startTimeMillis),
      p1.password,
      p1.value,
      p2.password,
      p2.value,
      userID
    );
    try {
      let gameQuery = arcades.findOneByGame(gameID);
      if (gameQuery === null) arcades.addArcade(newGame);
      else throw new Error("Already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  /**
   * @param {String} gameID
   */
  currentGuess: async function (gameID) {
    try {
      let gameQuery = arcades.findOneByGame(gameID);
      if (gameQuery === null) throw new Error("Game not found.");
      let nowInMillis = Date.now();
      let timeout = gameQuery.expiration.getTime() - nowInMillis;
      return {
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        timeout: timeout,
        score: gameQuery.score,
        guesses: gameQuery.guesses,
        duration: nowInMillis - gameQuery.start.getTime(),
        lost: timeout <= 0
      };
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  /**
   * @param {String} gameID
   */
  deleteGame: async function (gameID) {
    try {
      let gameQuery = arcades.findOneByGame(gameID);
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
        arcades.deleteArcade(gameQuery);
        return {
          score: gameQuery.score,
          guesses: gameQuery.guesses,
          duration: newScore.end.getTime() - newScore.start.getTime(),
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
  /**
   * @param {String} gameID
   * @param {Number} guess
   */
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = arcades.findOneByGame(gameID);
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
      } else {
        return false;
      }
    } catch (err) {
      throw new Error("Could not alter game data. (" + err.message + ")");
    }
    return true;
  },
  /**
   * @param {String} userID
   */
  deleteUser: async function (userID) {
    if (userID) {
      let gameQuery = await arcades.findOneByGame(null, userID);
      if (gameQuery) {
        this.deleteGame(gameQuery.gameID);
      }
    }
  }
}
