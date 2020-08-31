const fs = require('fs').promises;
const path = require('path');

module.exports = {
  setup: async function () {
    let passwordFiles = await fs.readdir(path.join(__dirname, "/passwords"));
    passwordFiles = passwordFiles.filter(fn => fn.endsWith(".csv"));
    if (passwordFiles.length <= 0) throw new Error("Password files missing.");
  }
}
