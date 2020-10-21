const newSocket = require("../helpers/socket-battle").newSocket("/royale", "royalelobby@", 3);

module.exports = function (sio) {
  return newSocket(sio);
};
