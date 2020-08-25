const games = new Map();

function newID() {
  let keys = Array.from(games.keys);
  if (keys.length <= 0) return 0;
  keys.sort().reverse();
  if (keys[keys.length - 1] > 0) {
    return 0;
  }
  while (keys.length > 1) {
    var last = keys.pop();
    if (keys[keys.length - 1] - last > 1) {
      return last + 1;
    }
  }
  return keys[0] + 1;
}

function newGame(userID, user) {
  if (userID !== undefined && user !== undefined) {
  }
  // TODO implement
  return {
    ok: "ok"
  };
}

module.exports = {
  newGame: function (userID, username) {
    let gameID = newID();
    games.set(gameID, newGame(userID, username));
    return gameID.toString();
  },
  newGuess: function (gameID) {
    if (!games.has(gameID)) {
      throw new Error("Game not found.");
    }
    // TODO implement
    return games.get(gameID);
  }
}
