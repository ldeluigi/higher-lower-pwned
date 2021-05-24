const { v1: uuidv1 } = require('uuid');

class Game {
  /**
   * @param {Date} expiration
   * @param {String} user
   * @param {String} gameID
   */
  constructor(gameID, expiration, user = undefined) {
    this.gameID = gameID;
    this.score = 0;
    this.lastGuess = undefined;
    this.guesses = 0;
    this.user = user || undefined;
    this.expiration = expiration;
    this.lost = false;
    this.victory = false;
  }

}

class Battle {
  /**
   * @param {...Game} games
   * @param {Date} start
   * @param {String} currentP1
   * @param {Number} valueP1
   * @param {String} currentP2
   * @param {Number} valueP2
   * @param {String} mode
   */
  constructor(start, currentP1, valueP1, currentP2, valueP2, mode, ...games) {
    this._id = uuidv1();
    this.games = games;
    this.start = start;
    this.currentP1 = currentP1;
    this.currentP2 = currentP2;
    this.valueP1 = valueP1;
    this.valueP2 = valueP2;
    this.mode = mode;
    this.end = undefined;
  }

  /**
   * @param {string} gameID
   */
  hasGame(gameID) {
    return gameID && this.games.some(g => g.gameID == gameID);
  }

  /**
   * @param {string} userID
   */
  hasUser(userID) {
    return userID && this.games.some(g => g.user == userID);
  }

  /**
   * @param {Boolean} defaultToMaxNumber
   */
  computeMinGuesses(defaultToMaxNumber = false) {
    let v = this.games.filter(e => !e.lost).map(e => e.guesses);
    if (defaultToMaxNumber) {
      v.push(Number.MAX_SAFE_INTEGER);
    }
    return Math.min(...v);
  }

  computeLeftBehind() {
    const minGuesses = this.computeMinGuesses(true);
    return this.games.filter(e => !e.lost && e.guesses == minGuesses).length;
  }

  /**
   * @param {String} gameID
   */
  findGameIndex(gameID) {
    const index = this.games.findIndex(e => e.gameID == gameID);
    if (index < 0) throw new Error("ID not found");
    return index;
  }

  gamesNotLost() {
    return this.games.filter(e => !e.lost);
  }

  /**
   * @param {Number} now
   */
  hasEverybodyExpired(now) {
    let minGuesses = this.computeMinGuesses(true);
    let playingPlayers = this.gamesNotLost();
    return this.games.filter(e => {
      let timeout = e.guesses > minGuesses ?
        Number.MAX_SAFE_INTEGER :
        e.expiration.getTime() - now;
      return timeout < 0 && !e.lost;
    }).length == playingPlayers.length;
  }

  checkVictories() {
    if (this.end !== null && this.end !== undefined)
      return;
    let playingPlayers = this.gamesNotLost();
    if (playingPlayers.length == 1) {
      playingPlayers[0].victory = true;
      this.end = new Date();
    } else {
      let now = Date.now();
      let everyoneExpired = this.hasEverybodyExpired(now);
      if (playingPlayers.length == 0) {
        let maxScore = Math.max(
          ...this.games.map(e => e.score));
        this.games.forEach(e => {
          if (e.score == maxScore) {
            e.victory = true;
            this.end = new Date();
          }
        });
      } else if (everyoneExpired) {
        let maxExpiration = Math.max(
          ...this.games.filter(e => !e.lost).map(e => {
            return e.expiration.getTime();
          })
        );
        this.games.forEach(e => {
          if (e.expiration.getTime() == maxExpiration) {
            e.victory = true;
            this.end = new Date();
          }
        });
      }
    }
  }
}

module.exports = {
  Game,
  Battle
};
