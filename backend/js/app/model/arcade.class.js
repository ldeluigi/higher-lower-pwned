const { v1: uuidv1 } = require('uuid');

class Arcade {
  /**
   * @param {String} gameID
   * @param {Date} start
   * @param {Date} expiration
   * @param {String} currentP1
   * @param {Number} valueP1
   * @param {String} currentP2
   * @param {Number} valueP2
   * @param {String} user
   */
  constructor(gameID, start, expiration, currentP1, valueP1, currentP2, valueP2, user = undefined) {
    this.score = 0;
    this.lastGuess = undefined;
    this.guesses = 0;
    this.start = start;
    this.user = user || undefined;
    this.gameID = gameID;
    this.currentP1 = currentP1;
    this.valueP1 = valueP1;
    this.currentP2 = currentP2;
    this.valueP2 = valueP2;
    this.expiration = expiration;
  }
}

module.exports = {
  Arcade
};
