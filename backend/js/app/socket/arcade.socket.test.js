const app = require("../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const ioClient = require("socket.io-client");
const http = require("http");
const ioBack = require("socket.io");
const arcade = require("./arcade.io");
const passwordsSetup = require("../game/passwords").setup;
const ScoreSchema = require("../model/score.model").schema;

var httpServer;
var serverAddress;
var ioServer;
var socket;

beforeAll(async (done) => {
  jest.spyOn(ScoreSchema.prototype, 'save').mockImplementationOnce(() => Promise.resolve())
  await passwordsSetup();
  httpServer = http.createServer().listen();
  serverAddress = httpServer.address();
  ioServer = arcade(ioBack(httpServer));
  setTimeout(done, 100)
});


afterAll(async (done) => {
  await ioServer.close();
  await httpServer.close();
  done();
});


beforeEach((done) => {
  // Setup
  socket = ioClient.connect(
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


afterEach(async (done) => {
  // Cleanup
  if (socket.connected) {
    await socket.close();
  }
  done();
});


describe("arcade socket.io API", function () {
  it("should start a game without jwt", async (done) => {
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
