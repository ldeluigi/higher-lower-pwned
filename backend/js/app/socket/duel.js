const jwtTools = require('../utils/jwt');
const duel = require("../game/duel");

const namespace = "/duel";

const lobbyRoomPrefix = "lobby@";

const matchmaking = {
  lobbies: new Map(),
  isInRoom: function (userID) {
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
  deleteRoom: function (roomName) {
    return this.lobbies.delete(roomName);
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
      if (matchmaking.isInRoom(socket.id)) {
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
        try {
          io.to(myRoomName).emit("player-join");
          let opponents = matchmaking.getOpponents(myRoomName, socket.id);
          // Because it's a duel, the game should start right now:
          await duel.newGame(socket.id, opponents[0][0], socket.userData.id, opponents[0][1].userID);
          try {
            matchmaking.deleteRoom(myRoomName);
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
        if (!nextGuess.data[nextGuess.index].lost) {
          socket.emit("guess", nextGuess);
        } else {
          try {
            // Game ends with the first player to lose
            let endData = await duel.deleteGame(socket.id);
            let myRoomName = Object.keys(socket.rooms).filter(s => s.startsWith(lobbyRoomPrefix))[0];
            io.to(myRoomName).emit("player-lost", endData);
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
          let myRoomName = Object.keys(socket.rooms).filter(s => s.startsWith(lobbyRoomPrefix))[0];
          if (isCorrect) {
            try {
              let cg = await duel.currentGuess(socket.id);
              socket.emit("guess", cg);
              socket.to(myRoomName).emit("player-guess", cg);
            } catch (err) {
              socket.emit("onerror", {
                code: 302,
                description: err.message
              });
            }
          } else {
            try {
              let endData = await duel.deleteGame(socket.id);
              io.to(myRoomName).emit("player-lost", endData);
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
        await duel.deleteGame(socket.id, true);
      } catch (err) { }
    })
  });
  console.log("Mounted socket.io duel module to " + namespace);
  return sio;
};