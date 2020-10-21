module.exports = {
  newMatchmaking: function () {
    return {
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
  }
}
