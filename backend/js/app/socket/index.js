const jwtTools = require('../utils/jwt');
const arcade = require("../game/arcade");

module.exports = function (sio) {
  io = sio.of("/arcade");
  io.use(function (socket, next) {
    socket.userData = {
      id: null
    };
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        let userData = jwtTools.checkJWT(socket.handshake.query.token);
        socket.userData.id = userData.id;
        return next();
      } catch (err) {
        return next(new Error("Authentication failed: " + err.message));
      }
    }
    return next();
  }).on("connection", function (socket) {
    socket.on("start", async () => {
      try {
        await arcade.newGame(socket.id, socket.userData.id);
        try {
          let nextGuess = await arcade.currentGuess(socket.id);
          socket.emit("guess", nextGuess);
        } catch (err) {
          socket.emit("onerror", {
            code: 102,
            description: err.message
          });
        }
      } catch (err) {
        socket.emit("onerror", {
          code: 101,
          description: err.message
        });
      }
    });
    socket.on("repeat", async () => {
      try {
        let nextGuess = await arcade.currentGuess(socket.id);
        if (nextGuess.expiration > 0) {
          socket.emit("guess", nextGuess);
        } else {
          try {
            let endData = await arcade.deleteGame(socket.id);
            socket.emit("gameEnd", endData);
          } catch (err) {
            socket.emit("onerror", {
              code: 202,
              description: err.message
            });
          }
        }
      } catch (err) {
        socket.emit("onerror", {
          code: 201,
          description: err.message
        });
      }
    });
    socket.on("answer", async (answer) => {
      if (answer.higher === 1 || answer.higher === 2) {
        try {
          let isCorrect = await arcade.submitGuess(socket.id, answer.higher);
          if (isCorrect) {
            try {
              let nextGuess = await arcade.currentGuess(socket.id);
              socket.emit("guess", nextGuess);
            } catch (err) {
              socket.emit("onerror", {
                code: 302,
                description: err.message
              });
            }
          } else {
            try {
              let endData = await arcade.deleteGame(socket.id);
              socket.emit("gameEnd", endData);
            } catch (err) {
              socket.emit("onerror", {
                code: 303,
                description: err.message
              });
            }
          }
        } catch (err) {
          socket.emit("onerror", {
            code: 301,
            description: err.message
          });
        }
      }
    });
    socket.on("disconnect", async (reason) => {
      try {
        await arcade.deleteGame(socket.id);
      } catch (err) { }
    })
  });
  return sio;
};
