const userSchema = require("../model/user.model").schema;
const names = require("./animals.json");

async function getRandomName() {
  let i = Math.floor(Math.random() * names.length);
  if (i >= names.length) i = 0;
  return names[i];
}

module.exports = {
  getUsername:
    /**
     * @param {String} userID
     */
    async function (userID) {
      if (userID) {
        let userQuery = await userSchema.findById(userID);
        if (userQuery !== null) return userQuery.username;
      }
      return "Anonymous " + await getRandomName();
    }
}
