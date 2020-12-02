class Room {
  constructor(n = 0) {
    this.num = n;
    this.users = new Map();
    this.open = true;
  }
}

class MatchMaking {
  constructor() {
    this.room = new Room();
  }
  isInRoom(userID, objUserID) {
    // console.log(objUserID, Array.from(this.room.users.values())
    //.map(x => x.userID))
    return (
      Array.from(this.room.users.keys()).includes(userID) ||
      (objUserID &&
        Array.from(this.room.users.values())
          .map((x) => x.userID)
          .includes(objUserID))
    );
  }
  isOpen() {
    return this.room.open;
  }
  joinRoom(userID, userObj) {
    if (this.isOpen()) {
      this.room.users.set(userID, userObj);
      return true;
    }
    return false;
  }
  leaveRoom(userID) {
    return this.room.users.delete(userID);
  }
  resetRoom() {
    this.room = new Room(this.room.num + 1);
    return true;
  }
  getOpponents(userID) {
    return Array.from(this.room.users.entries()).filter((x) => x[0] != userID);
  }
  /**
   * @param {(id: String, obj) => void} callback
   */
  foreachPlayerIn(callback) {
    Array.from(this.room.users.entries()).forEach((t) => callback(t[0], t[1]));
  }
  closeRoom() {
    this.room.open = false;
  }
  roomName() {
    return this.room.num;
  }
}

module.exports = {
  MatchMaking,
  Room,
};
