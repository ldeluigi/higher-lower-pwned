const fs = require('fs').promises;
const path = require('path');

module.exports = {
  setup: async function () {
    let passwordFiles = await fs.readdir(path.join(__dirname, "/passwords"));
    passwordFiles = passwordFiles.filter(fn => fn.endsWith(".csv"));
    if (passwordFiles.length <= 0) throw new Error("Password files missing.");
  },
  newGame: async function (gameID) {
    return true;
  },
  currentGuess: async function (gameID) {
    return {
      password1: "p1",
      value1: 1000,
      password2: "p2",
      timeout: 10000,
      score: 100,
      guesses: 1,
      duration: 100000
    };
  },
  deleteGame: async function (gameID) {
    return true;
  },
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    return guess === 1;
  }
}
