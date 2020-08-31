const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const documents = {};
function start(accountService) {
  io.on("connection", (socket) => {
    let previousId;
    const safeJoin = (currentId) => {
      socket.leave(previousId);
      socket.join(currentId);
      previousId = currentId;
    };

    socket.on("status", (status) => {
      if (status === "ready") {
        socket.emit(
          "start",
          accountService.userValue() !== null
            ? accountService.userValue().token
            : ""
        );
      }
    });

    socket.on("guess", (obj) => {
      show(obj);
    });

    const higher = null;
    socket.emit("answer", higher);

    socket.on("gameEnd", (obj) => {
      obj.score;
      obj.guesses;
      obj.duration;
    });

    socket.on("failed", (error) => {
      console.log(error.description);
    });
  });
}
