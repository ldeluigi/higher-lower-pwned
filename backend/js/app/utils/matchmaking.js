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
        return room != undefined ? room.open : false;
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
      createRoom: function () {
        let roomName = this.createRoomName();
        this.lobbies.set(roomName, {
          users: new Map(),
          name: roomName,
          open: true
        });
        return roomName;
      },
      deleteRoom: function (roomName) {
        return this.lobbies.delete(roomName);
      },
      getOpponents: function (roomName, userID) {
        return Array.from(this.lobbies.get(roomName).users.entries()).filter(x => x[0] != userID);
      },
      foreachPlayerIn: function (roomName, callback) {
        Array.from(this.lobbies.get(roomName).users.entries()).foreach(t => callback(t[0], t[1]));
      },
      closeRoom: function (roomName) {
        this.lobbies.get(roomName).open = false;
      },
      createRoomName() {
        let keys = Array.from(this.lobbies.keys());
        if (keys.length <= 0) return 0;
        keys.sort().reverse();
        if (keys[keys.length - 1] > 0) {
          return 0;
        }
        while (keys.length > 1) {
          var last = keys.pop();
          if (keys[keys.length - 1] - last > 1) {
            return last + 1;
          }
        }
        return (keys[0] + 1);
      }
    };
  }
}
