const newSocket = require("../helpers/socket-battle").newSocket("/duel", "duellobby@", 2);

module.exports = function (sio) {
  return newSocket(sio);
};
