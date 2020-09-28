const jwtTools = require('../utils/jwt');
const duel = require("../game/duel");

const namespace = "/duel";

const lobbyRoomPrefix = "lobby@";

const matchmaking = {
  lobbies: new Map(),
  isPlaying: function (userID) {
    return Array.from(this.lobbies.values()).filter(x => Array.from(x.users.keys()).includes(userID)).length > 0;
  },
  openRooms: function () {
    return Array.from(this.lobbies.values()).filter(this.isOpen).map(x => x.name);
  },
  isOpen: function (room) {
    return room != undefined ? room.users.size < 2 : false;
  },
  joinRoom: function (roomName, userID, userObj) {
    let room = this.lobbies.get(roomName);
    if (this.isOpen(room)) {
      this.lobbies.get(roomName).users.set(userID, userObj);
      return true;
    }
    return false;
  },
  createRoom: function (roomName) {
    if (this.lobbies.has(roomName)) {
      return false;
    }
    this.lobbies.set(roomName, {
      users: new Map(),
      name: roomName
    });
    return true;
  },
  getOpponents: function (roomName, userID) {
    return Array.from(this.lobbies.get(roomName).users.entries()).filter(x => x[0] != userID);
  },
  foreachPlayerIn: function (roomName, callback) {
    Array.from(this.lobbies.get(roomName).users.entries()).foreach(t => callback(t[0], t[1]));
  }
};

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
      if (matchmaking.isPlaying(socket.id)) {
        socket.emit("onerror", {
          code: 105,
          description: "Already in a room."
        });
        return;
      }

      let notFullRooms = matchmaking.openRooms();

      if (notFullRooms.length > 0) {
        let myRoomName = notFullRooms[0];
        if (!matchmaking.joinRoom(myRoomName, socket.id, {
          userID: socket.userData.id
        })) {
          socket.emit("onerror", {
            code: 104,
            description: "Internal server error."
          });
          return;
        }
        socket.join(myRoomName);
        let opponent = matchmaking.getOpponents(myRoomName, socket.id)[0];
        try {
          await duel.newGame(socket.id, opponent[0], socket.userData.id, opponent[1].userID);
          try {
            // TODO broadcast guess
            // TODO delete from mm
          } catch (err) {
            socket.emit("onerror", {
              code: 103,
              description: err.message
            });
          }
        } catch (err) {
          socket.emit("onerror", {
            code: 102,
            description: err.message
          });
        }
      } else {
        let myRoomName = lobbyRoomPrefix + socket.id;
        if (matchmaking.createRoom(myRoomName) && matchmaking.joinRoom(myRoomName, socket.id, {
          userID: socket.userData.id
        })) {
          socket.join(myRoomName);
          socket.emit("waiting-opponents");
        } else {
          socket.emit("onerror", {
            code: 101,
            description: "Internal server error."
          });
        }
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
            // TODO change delete game and send endData to everyone
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
              // TODO broadcast query
            } catch (err) {
              socket.emit("onerror", {
                code: 302,
                description: err.message
              });
            }
          } else {
            try {
              let endData = await duel.deleteGame(socket.id);
              // TODO send endData to everyone
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
        // TODO notify everyone
        console.log(socket.rooms)
      } catch (err) { }
    })
  });
  console.log("Mounted socket.io duel module to " + namespace);
  return sio;
};
