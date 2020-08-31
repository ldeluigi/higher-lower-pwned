
const app = require("../../config/server").express; // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const cio = require("socket.io-client");
const http = require("http");
const sio = require("socket.io");
const ioBack = require("./index");

var serverListen;
var serverAddress;
var ioServer;
var socket;

beforeAll((done) => {
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
        `http://[${serverAddress.address}]:${serverAddress.port}/arcade`,
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
    it("should be ok", async (done) => {
        socket.on("onerror", (msg) => {
            done.fail(new Error(msg.description));
        });
        // TODO mock db and test
        done();
    });
});
