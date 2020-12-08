const { Battle, Game } = require("./battle.class");

const battles = new Map();
const gameIndex = new Map();

/**
 * @param {String} gameID
 * @param {String} userID
 * @returns {Battle}
 */
function findOneByGame(gameID = undefined, userID = undefined) {
  if (gameID && gameIndex.has(gameID)) {
    let gameMatch = gameIndex.get(gameID);
    if (battles.has(gameMatch)) {
      let b = battles.get(gameMatch);
      if (b.hasGame(gameID)) {
        return b;
      }
    }
    gameIndex.delete(gameID);
  }
  let entryFound = Array.from(battles.values()).find(battle => {
    return battle.hasGame(gameID) || battle.hasUser(userID);
  });
  if (entryFound) {
    return entryFound;
  }
  return null;
}

/**
 *
 * @param {Battle} battle
 */
function addBattle(battle) {
  battles.set(battle._id, battle);
  battle.games.forEach(game => {
    gameIndex.set(game.gameID, battle._id);
  });
}

/**
 * @param {Battle} battle
 */
function deleteBattle(battle) {
  battles.delete(battle._id);
  Array.from(gameIndex.entries()).forEach(e => {
    if (e[1] == battle._id) {
      gameIndex.delete(e[0]);
    }
  })
}

module.exports = {
  deleteBattle,
  addBattle,
  findOneByGame
}
