const newSocket = require("./socket-battle").newSocket("royale", 3);

module.exports = function (sio) {
  return newSocket(sio);
};
