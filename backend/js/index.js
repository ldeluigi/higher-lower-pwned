const config = require("./config/config");
const mongoose = require("mongoose");
const server = require("./config/server").server;
const passwords = require("./app/game/passwords");

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    console.log("Waiting 10 seconds for MongoDB");
    await timeout(10 * 1000);
    await mongoose.connect(config.mongoose.url, config.mongoose.options)
    console.log("Connected to MongoDB");
    await passwords.setup();
    console.log("Passwords setup done");
    server.listen(config.port, () => {
      console.log("Listening on " + config.port);
    });
  } catch (err) {
    console.log('Error: ' + err)
  }
})();
