const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
const socketApi = require("../app/socket");
const io = socketApi(socket(server));

const route = require("../app/routes");

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(express.json());
app.use(route);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      errors: ["Invalid token."]
    });
  }
});

module.exports = {
  express: app,
  server: server,
};
