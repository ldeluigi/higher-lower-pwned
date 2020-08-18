const config = require("./config/config");
const mongoose = require("mongoose");
const server = require("./config/server").server;

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  console.log("Connected to MongoDB");
  server.listen(config.port, () => {
    console.log("Listening on " + config.port);
  });
});
