const jwtTools = require('../utils/jwt');
const game = require("../game/game");

module.exports = function (sio) {
  io = sio.of("/arcade");
  io.use(function (socket, next) {
    socket.userData = {
      id: null
    };
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        let userData = jwtTools.checkJWT(socket.handshake.query.token);
        socket.userData.id = userData.user;
      } catch (err) { }
      next();
    }
    else {
      next();
    }
  }).on("connection", function (socket) {
    console.log("Connected with id " + socket.userData);

  });
  return sio;
};
