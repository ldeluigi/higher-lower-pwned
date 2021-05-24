const newSocket = require("./socket-battle").newSocket("duel", 2);

module.exports = function (sio) {
  return newSocket(sio);
};
