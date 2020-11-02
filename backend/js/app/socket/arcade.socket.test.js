const app = require("../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const cio = require("socket.io-client");
const http = require("http");
const sio = require("socket.io");
const ioBack = require("./arcade.io");
const arcade = require("../game/arcade");
const passwordsSetup = require("../game/passwords").setup;

const gameSchema = require("../model/game.model").schema;
const scoreSchema = require("../model/score.model").schema;

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
  serverListen.close();
  done();
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
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    const mock2 = jest.spyOn(gameSchema, 'create');
    mock2.mockImplementation((input) => {
      mock.mockImplementation((input) => Promise.resolve({
        expiration: new Date("03-05-2020"),
        currentP1: "a",
        currentP2: "b",
        valueP1: 1,
        valueP2: 2,
        score: 8,
        guesses: 2,
        start: new Date("02-05-2020")
      }));
      return Promise.resolve(null);
    });
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
      mock2.mockRestore();
      mock.mockRestore();
      done();
    });
    socket.emit("start");
  });
});
