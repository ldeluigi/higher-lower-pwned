const config = require("./config/config");
const mongoose = require("mongoose");
const server = require("./config/server").server;
const passwords = require("./app/game/passwords");

(async () => {
  try {
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
