module.exports = function (sio) {
  io = sio.of("/arcade");
  io.on("connection", function (socket) {
    console.log("Connected");
  });
  return sio;
};
