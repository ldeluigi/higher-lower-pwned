const battle = require("../game/battle");
const jwtTools = require('../utils/jwt');
const userUtils = require("../helpers/users");
const matchmakingCreator = require("../utils/matchmaking");


//--------------------------- Classes & DTOs ------------------------------

class UserObject {
  /**
   * @param {String} userID
   * @param {String} username
   */
  constructor(userID, username) {
    this.userID = userID;
    this.name = username
  }
  get dto() {
    return this;
  }
}

class SimplePlayer {
  /**
   * @param {String} name
   * @param {String} id
   */
  constructor(id, name) {
    this.name = name;
    this.id = id;
  }

  /**
   * Pretty prints this player with total player number and max room space.
   * @param {Number} playerNumber
   * @param {Number} maxRoomSpace
   */
  joinDto(playerNumber, maxRoomSpace) {
    return {
      id: this.id,
      name: this.name,
      players: playerNumber,
      max: maxRoomSpace
    }
  }
}

class Player extends SimplePlayer {
  /**
   * @param {String} id
   * @param {UserObject} obj
   */
  constructor(id, obj) {
    super(id, obj.name);
    this.userID = obj.userID;
  }

  /**
   * Returns the DTO.
   */
  get dto() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

class PlayerCollection {
  /**
   * @param {Array<String, UserObject>} array of entries
   */
  constructor(array) {
    this.opponents = array.map(x => {
      return new Player(x[0], x[1]);
    });
  }

  /**
   * Returns an array of playerIDs.
   */
  get playerIDs() {
    return this.opponents.map(o => o.id);
  }

  /**
   * Returns an array of userIDs (could contain multiple undefined/null).
   * UserID is defined for logged users only.
   */
  get userIDs() {
    return this.opponents.map(o => o.userID);
  }

  /**
   * Returns the number of opponents.
   */
  get length() {
    return this.opponents.length;
  }

  /**
   * Returns the DTO.
   */
  get dto() {
    return {
      opponents: this.opponents.map(o => o.dto)
    };
  }
}



//--------------------------- Helper functions ------------------------------

/**
 * @param {Object} element the element containing lost
 */
function notLost(element) {
  return !element.lost;
}

/**
 * @param {Array} array the array of data containing lost
 */
function someoneNotLost(array) {
  return array.filter(notLost).length > 0;
}

/**
 * Finds the lowest timeout between the given data
 * @param {Array} array the array of data containing lost and timeout
 */
function minTimeoutBetweenNotLost(array) {
  if (array.length <= 0) throw new Error("The array is empty.");
  return Math.min(...array.filter(notLost).map(e => e.timeout));
}

/**
 * Creates a user object loading the username from the DB.
 * @param {String} userID
 */
async function createUserObject(userID) {
  return new UserObject(userID, await userUtils.getUsername(userID));
}

//--------------------------- Socket Helpers ------------------------------

/**
 * Emits a custom error.
 * @param {*} socket
 * @param {Number} code
 * @param {String} desc
 */
function emitError(socket, code, desc = "") {
  socket.emit("on-error", {
    code: code,
    description: desc
  });
}

/**
 * Joins a matchmaking room and a socket room.
 * @param {*} socket
 * @param {*} matchmaking
 * @param {String} roomName
 * @param {UserObject} userObject
 */
function joinRoom(socket, matchmaking, roomName, socketRoomName, userObject) {
  if (!matchmaking.joinRoom(roomName, socket.id, userObject)) {
    socket.emitError(socket, 104, "Internal server error.");
    return false;
  }
  socket.join(socketRoomName);
  return true;
}

/**
 * Awaits the async function and if an error is thrown, it's emitted.
 * @param {Function} func an async function to run
 * @param {*} socket
 * @param {Number} code error code
 */
async function tryOrEmitError(func, socket, code) {
  try {
    await func();
  } catch (err) {
    emitError(socket, code, err.message);
  }
}

/**
 *
 * @param {*} socket
 * @param {Array<Array>} opponents
 * @param {String} eventName
 */
function sendOpponents(socket, opponents, eventName = "opponents") {
  socket.emit(eventName, new PlayerCollection(opponents).dto);
}

/**
 *
 * @param {*} socket
 * @param {*} currentGuess
 */
function emitGuess(socket, currentGuess) {
  socket.emit("guess", currentGuess);
}

/**
 *
 * @param {*} socket
 * @param {String} roomPrefix
 */
function myRooms(socket, roomPrefix) {
  return Object.keys(socket.rooms).filter(s => s.startsWith(roomPrefix));
}

//--------------------------- Implementations ------------------------------

/**
 * This function creates a timeout for the player that could lose by inactivity,
 * and restarts itself for each player if it finds one.}.
 * @param {*} io socket.io namespace
 * @param {*} socket socket.io current socket
 * @param {*} myRoomName current room name (taken from socket)
 * @param {*} currentGuessData data taken from current guess
 */
function timeoutForNextPlayerThatCouldLose(io, socket, myRoomName, currentGuessData) {
  if (someoneNotLost(currentGuessData)) {
    let nextTimeout = minTimeoutBetweenNotLost(currentGuessData);
    if (nextTimeout > 0) {
      setTimeout(async function () {
        try {
          let currentGuess = await battle.currentGuess(socket.id);
          io.to(myRoomName).emit("guess", currentGuess);
          if (someoneNotLost(currentGuess.data)) {
            timeoutForNextPlayerThatCouldLose(io, socket, myRoomName, currentGuess.data);
          }
        } catch (err) { }
      }, nextTimeout + 1);
    }
  }
}

/**
 * Checks for authentication and sets socket.userData accordingly to a UserData.
 * @param {*} socket the socket
 * @param {*} next next middlewer passing
 */
function authenticationMiddleware(socket, next) {
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
}

async function onStart(io, socket, code, matchmaking, socketRoomPrefix, maxLobbySpace) {
  let playerID = socket.id;
  if (matchmaking.isInRoom(playerID)) {
    emitError(socket, code, "Already in a room.");
    return;
  }
  if (await battle.isPlaying(playerID)) {
    emitError(socket, code, "Already playing.");
    return;
  }
  let notFullRooms = matchmaking.openRooms();
  let userObject = await createUserObject(socket.userData.id);

  if (notFullRooms.length > 0) {
    let myRoomName = notFullRooms[0];
    let socketRoomName = socketRoomPrefix + myRoomName;
    if (joinRoom(socket, matchmaking, myRoomName, socketRoomName, userObject)) {
      await tryOrEmitError(async () => {
        let opponents = matchmaking.getOpponents(myRoomName, socket.id);
        io.to(socketRoomName).emit("player-join",
          new SimplePlayer(
            socket.id,
            userObject.name
          ).joinDto(opponents.length + 1, maxLobbySpace)
        );
        sendOpponents(socket, opponents);
        if (opponents.length + 1 >= maxLobbySpace) {
          matchmaking.deleteRoom(myRoomName);
          let op = new PlayerCollection(opponents);
          await battle.newGame([socket.id, ...op.playerIDs],
            [socket.userData.id, ...op.userIDs]);
          let cg = await battle.currentGuess(socket.id);
          emitGuess(io.to(socketRoomName), cg);
          timeoutForNextPlayerThatCouldLose(io, socket, socketRoomName, cg.data);
        }
      }, socket, code + 1);
    }
  } else {
    let myRoomName = matchmaking.createRoom();
    let socketRoomName = socketRoomPrefix + myRoomName;
    console.log("New room: " + myRoomName)
    if (myRoomName !== null && joinRoom(socket, matchmaking, myRoomName, socketRoomName, userObject)) {
      let opponents = matchmaking.getOpponents(myRoomName, socket.id);
      sendOpponents(socket, opponents, "waiting-opponents");
      io.to(socketRoomName).emit("player-join", new SimplePlayer(
        socket.id,
        userObject.name
      ).joinDto(opponents.length + 1, maxLobbySpace));
    } else {
      emitError(socket, code + 2, "Internal server error.");
    }
  }
}

async function onRepeat(io, socket, code) {
  await tryOrEmitError(async () => {
    let cg = await battle.currentGuess(socket.id);
    emitGuess(socket, cg);
  }, socket, code);
}

async function onQuit(io, socket, code, matchmaking, socketRoomPrefix) {
  await tryOrEmitError(async () => {
    if (matchmaking.isInRoom(socket.id)) {
      matchmaking.roomsFor(socket.id).forEach(room => {
        matchmaking.leaveRoom(room, socket.id);
      });
    }
    let isPlaying = await battle.isPlaying(socket.id);
    if (isPlaying) {
      let myRoomName = myRooms(socket, socketRoomPrefix)[0];
      let nextGuess = await battle.quitGame(socket.id);
      if (nextGuess !== null) {
        emitGuess(socket.to(myRoomName), nextGuess);
      }
    }
    myRooms(socket, socketRoomPrefix).forEach(room => {
      socket.leave(room);
    });
  }, socket, code);
}

async function onAnswer(io, socket, code, answer, socketRoomPrefix) {
  if (answer.higher === 1 || answer.higher === 2) {
    await tryOrEmitError(async () => {
      let submitted = await battle.submitGuess(socket.id, answer.higher);
      let myRoomName = myRooms(socket, socketRoomPrefix)[0];
      if (submitted) {
        tryOrEmitError(async () => {
          let cg = await battle.currentGuess(socket.id);
          emitGuess(io.to(myRoomName), cg);
        }, socket, code);
      }
    }, socket, code + 1);
  } else {
    emitError(socket, code + 2, "Answer must be 1 (lower) or 2 (higher).");
  }
}

module.exports = {
  newSocket: function (namespace, lobbyRoomPrefix, maxLobbySpace) {
    const matchmaking = matchmakingCreator.newMatchmaking();
    return function (sio) {
      var io = sio.of(namespace);
      io.use(authenticationMiddleware)
        .on("connection", function (socket) {
          socket.on("start", async () => {
            await onStart(io, socket, 100, matchmaking, lobbyRoomPrefix, maxLobbySpace);
          });
          socket.on("repeat", async () => {
            await onRepeat(io, socket, 200);
          });
          socket.on("answer", async (answer) => {
            await onAnswer(io, socket, 300, answer, lobbyRoomPrefix);
          });
          socket.on("quit", async (_) => {
            await onQuit(io, socket, 400, matchmaking, lobbyRoomPrefix);
          });
          socket.on("disconnecting", async (reason) => {
            await onQuit(io, socket, 500, matchmaking, lobbyRoomPrefix);
          });
        });
      console.log("Mounted socket.io " + namespace + " module to " + namespace);
      return sio;
    }
  }
}
