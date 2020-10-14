const jwtTools = require('../utils/jwt');
const duel = require("../game/duel");
const userUtils = require("../helpers/users");

const namespace = "/duel";

const lobbyRoomPrefix = "lobby@";

const maxLobbySpace = 2;

const matchmaking = {
  lobbies: new Map(),
  isInRoom: function (userID) {
    return this.roomsFor(userID).length > 0;
  },
  roomsFor: function (userID) {
    return Array.from(this.lobbies.entries()).filter(x => Array.from(x[1].users.keys()).includes(userID)).map(x => x[0]);
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
  leaveRoom: function (roomName, userID) {
    let room = this.lobbies.get(roomName);
    if (room) {
      let ops = this.getOpponents(roomName, userID);
      if (ops.length > 0) {
        return this.lobbies.get(roomName).users.delete(userID);
      } else {
        return this.deleteRoom(roomName);
      }
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
        socket.emit("on-error", {
          code: 105,
          description: "Already in a room."
        });
        return;
      }

      let notFullRooms = matchmaking.openRooms();
      let userObject = {
        userID: socket.userData.id,
        name: await userUtils.getUsername(socket.userData.id)
      };

      if (notFullRooms.length > 0) {
        let myRoomName = notFullRooms[0];
        if (!matchmaking.joinRoom(myRoomName, socket.id, userObject)) {
          socket.emit("on-error", {
            code: 104,
            description: "Internal server error."
          });
          return;
        }
        socket.join(myRoomName);
        try {
          let opponents = matchmaking.getOpponents(myRoomName, socket.id);
          io.to(myRoomName).emit("player-join", {
            name: userObject.name,
            id: socket.id,
            players: opponents.length + 1,
            max: maxLobbySpace
          });
          if (opponents.length + 1 >= maxLobbySpace) {
            try {
              matchmaking.deleteRoom(myRoomName);
            } catch (err) {
              socket.emit("on-error", {
                code: 103,
                description: err.message
              });
            }
            await duel.newGame(socket.id, opponents[0][0], socket.userData.id, opponents[0][1].userID);
            let curr = await duel.currentGuess(socket.id);
            io.to(myRoomName).emit("guess", curr);
          }
        } catch (err) {
          socket.emit("on-error", {
            code: 102,
            description: err.message
          });
        }
      } else {
        let myRoomName = lobbyRoomPrefix + socket.id;
        if (matchmaking.createRoom(myRoomName) && matchmaking.joinRoom(myRoomName, socket.id, userObject)) {
          socket.join(myRoomName);
          let opponents = matchmaking.getOpponents(myRoomName, socket.id);
          socket.emit("waiting-opponents", {
            opponents: opponents.map(x => {
              return {
                id: x[0],
                name: x[1].name
              };
            })
          });
          io.to(myRoomName).emit("player-join", {
            id: socket.id,
            name: userObject.name,
            players: opponents.length + 1,
            max: 2
          });
        } else {
          socket.emit("on-error", {
            code: 101,
            description: "Internal server error."
          });
        }
      }
    });
    socket.on("repeat", async () => {
      try {
        let nextGuess = await duel.currentGuess(socket.id);
        socket.emit("guess", nextGuess);
      } catch (err) {
        socket.emit("on-error", {
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
              io.to(myRoomName).emit("guess", cg);
            } catch (err) {
              socket.emit("on-error", {
                code: 302,
                description: err.message
              });
            }
          }
        } catch (err) {
          socket.emit("on-error", {
            code: 301,
            description: err.message
          });
        }
      }
    });
    socket.on("quit", async (answer) => {
      try {
        if (matchmaking.isInRoom(socket.id)) {
          matchmaking.roomsFor(socket.id).forEach(room => {
            matchmaking.leaveRoom(room, socket.id);
          });
        }
        await duel.quitGame(socket.id);
      } catch (err) {
        socket.emit("on-error", {
          code: 401,
          description: err.message
        });
      }
    });
    socket.on("disconnect", async (reason) => {
      try {
        if (matchmaking.isInRoom(socket.id)) {
          matchmaking.roomsFor(socket.id).forEach(room => {
            matchmaking.leaveRoom(room, socket.id);
          });
        }
        await duel.quitGame(socket.id);
      } catch (err) { }
    })
  });
  console.log("Mounted socket.io duel module to " + namespace);
  return sio;
};
