const passwords = require("./passwords");
const battle = require("./battle");

module.exports = {
  newGame: async function (gameID1, gameID2, userID1, userID2) {
    return await battle.newGame([gameID1, gameID2], [userID1, userID2], "duel");
  },
  currentGuess: async function (gameID) {
    return await battle.currentGuess(gameID);
  },
  quitGame: async function (gameID) {
    return await battle.quitGame(gameID);
  },
  submitGuess: async function (gameID, guess) {
    return await battle.submitGuess(gameID, guess);
  },
  isPlaying: async function (gameID) {
    return await battle.isPlaying(gameID);
  }
}
