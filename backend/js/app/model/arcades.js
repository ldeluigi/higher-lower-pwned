const { Arcade } = require("./arcade.class");

const arcades = new Map();

/**
 * @param {String} gameID
 * @param {String} userID
 * @returns {Arcade}
 */
function findOneByGame(gameID = undefined, userID = undefined) {
  if (gameID && arcades.has(gameID)) {
    return arcades.get(gameID);
  }
  if (userID) {
    let entryFound = Array.from(arcades.values()).find(entry => entry.user == userID);
    if (entryFound) {
      return entryFound;
    }
  }
  return null;
}

/**
 * @param {Arcade} arcade
 */
function addArcade(arcade) {
  arcades.set(arcade.gameID, arcade);
}

/**
 * @param {Arcade} arcade
 */
function deleteArcade(arcade) {
  arcades.delete(arcade.gameID);
}

module.exports = {
  addArcade,
  deleteArcade,
  findOneByGame
}
