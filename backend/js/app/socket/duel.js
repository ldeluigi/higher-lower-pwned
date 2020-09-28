const jwtTools = require('../utils/jwt');
const duel = require("../game/duel");

const namespace = "/duel";

const lobbyRoomPrefix = "lobby@";

module.exports = function (sio) {
  io = sio.of(namespace);
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
      if (Object.keys(socket.rooms).filter(r => r.startsWith(lobbyRoomPrefix)).length > 0) {
        socket.emit("onerror", {
          code: 105,
          description: "Already in a room."
        });
        return;
      }

      let notFullRooms = Object.entries(socket.adapter.rooms)
        .filter(entry =>
          entry[0].startsWith(lobbyRoomPrefix) &&
          entry[1].length > 0 &&
          entry[1].length < 2
        );
      if (notFullRooms.length > 0) {
        let myRoomName = notFullRooms[0][0];
        socket.join(myRoomName);
        let opponentID = myRoomName.slice(lobbyRoomPrefix.length);
        try {
          // TODO get opponent login data
          await duel.newGame(socket.id, opponentID, socket.userData.id);
          try {
            let nextGuess = await duel.currentGuess(socket.id);
            socket.emit("guess", nextGuess);
            let opponentNextGuess = await duel.currentGuess(opponentID);
            socket.to(myRoomName).emit("guess", opponentNextGuess);
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
      } else {
        socket.join(lobbyRoomPrefix + socket.id);
        socket.emit("waiting-opponents");
      }
    });
    socket.on("repeat", async () => {
      try {
        let nextGuess = await duel.currentGuess(socket.id);
        if (!nextGuess.data[0].lost && !nextGuess.data[1].lost) {
          socket.emit("guess", nextGuess);
        } else {
          try {
            let endData = await duel.deleteGame(socket.id, nextGuess.data[0].lost);
            // TODO notify room
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
          let isCorrect = await duel.submitGuess(socket.id, answer.higher);
          if (isCorrect) {
            try {
              let nextGuess = await duel.currentGuess(socket.id);
              // TODO notify room
              socket.emit("guess", nextGuess);
            } catch (err) {
              socket.emit("onerror", {
                code: 302,
                description: err.message
              });
            }
          } else {
            try {
              let endData = await duel.deleteGame(socket.id);
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
        await duel.deleteGame(socket.id);
        // TODO notify room
        console.log(socket.rooms)
      } catch (err) { }
    })
  });
  console.log("Mounted socket.io duel module to " + namespace);
  return sio;
};
