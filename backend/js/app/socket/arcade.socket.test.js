const app = require("../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const cio = require("socket.io-client");
const http = require("http");
const sio = require("socket.io");
const ioBack = require("./arcade.io");
const passwordsSetup = require("../game/passwords").setup;

var serverListen;
var serverAddress;
var ioServer;
var socket;

beforeAll(async (done) => {
  await passwordsSetup();
  serverListen = http.createServer().listen();
  serverAddress = serverListen.address();
  ioServer = ioBack(sio(serverListen));
  done();
});


afterAll((done) => {
  ioServer.close();
  serverListen.close(() => {
    done();
  });
});


beforeEach((done) => {
  // Setup
  socket = cio.connect(
    `http://[${serverAddress.address}]:${serverAddress.port}/socket/arcade`,
    {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
    }
  );
  socket.on("connect", () => {
    done();
  });
});


afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});


describe("arcade socket.io API", function () {
  it("should start a game without jwt", (done) => {
    socket.on("on-error", (msg) => {
      done.fail(new Error(msg.description));
    });
    socket.on("guess", (answer) => {
      expect(answer).toHaveProperty("password1");
      expect(answer).toHaveProperty("value1");
      expect(answer).toHaveProperty("password2");
      expect(answer).toHaveProperty("timeout");
      expect(answer).toHaveProperty("score");
      expect(answer).toHaveProperty("guesses");
      done();
    });
    socket.emit("start");
  });
});
