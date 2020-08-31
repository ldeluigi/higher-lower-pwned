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
        next();
      } catch (err) {
        next(new Error("Authentication failed: " + err.message));
      }
    }
    else {
      next();
    }
  }).on("connection", function (socket) {
    console.log("Connected with id ", socket.userData);
    socket.on("start", async () => {
      await game.newGame(socket.id);
      let nextGuess = await game.currentGuess(socket.id);
      socket.emit("guess", nextGuess);
    });
    socket.on("repeat", async () => {
      let nextGuess = await game.currentGuess(socket.id);
      socket.emit("guess", nextGuess);
    });
    socket.on("answer", async (answer) => {
      if (answer.higher === 1 || answer.higher === 2) {
        let isCorrect = await game.submitGuess(socket.id, answer.higher);
        if (isCorrect) {
          let nextGuess = await game.currentGuess(socket.id);
          socket.emit("guess", nextGuess);
        } else {
          let gameInfo = await game.currentGuess(socket.id);
          socket.emit("gameEnd", {
            score: gameInfo.score,
            guesses: gameInfo.guesses,
            duration: gameInfo.duration
          });
        }
      }
    });
    socket.on("disconnect", async (reason) => {
      await game.deleteGame(socket.id);
    })
  });
  return sio;
};
