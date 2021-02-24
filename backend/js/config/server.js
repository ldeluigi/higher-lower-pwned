const express = require("express");
const socket = require("socket.io")
const cors = require("cors");
const corsSettings = {
  origin: function (origin, callback) {
    callback(null /* No Errors */, true /* Allow */)
  },
  credentials: true
};

const socketIOSettings = {
  allowEIO3: true,
  cors: corsSettings
};
const app = express();
const server = new (require("http").Server)(app);
const socketArcadeApi = require("../app/socket/arcade.io");
const socketDuelApi = require("../app/socket/duel.io");
const socketRoyaleApi = require("../app/socket/royale.io");
const io = socketRoyaleApi(socketDuelApi(socketArcadeApi(socket(server, socketIOSettings))));

const route = require("../app/routes");

app.use(cors(corsSettings));

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(express.json());

app.use(function (req, res, next) {
  if (req.url.slice(-1) === '/') {
    req.url = req.url.slice(0, -1);
  }
  if (req.url.startsWith("/api")) {
    req.url = req.url.substring(4);
  }
  next();
});
app.use(route);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      errors: ["Access negated: Invalid token."]
    });
  }
});

app.use(function (req, res, next) {
  res.status(404).json({
    errors: ["Not found. :-/"]
  });
})

module.exports = {
  express: app,
  server: server,
};
