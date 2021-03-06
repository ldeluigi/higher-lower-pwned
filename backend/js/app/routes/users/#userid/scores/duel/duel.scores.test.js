const app = require("../../../../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../../../../model/user.model");
const score = require("../../../../../model/score.model");
const token = require("../../../../../model/token.model");
const pwd = require("../../../../../utils/password");
const jwtTools = require("../../../../../utils/jwt");



describe("scores royale API", function () {
  it("should GET duel user score after login", async (done) => {
    const mock = jest.spyOn(user.schema, 'findOne');
    const userMock = {
      username: "testusername",
      _id: "testid",
      password: pwd.hash("testpassword", "testpasswordsalt"),
      email: "testemail@email.com",
      salt: "testpasswordsalt",
      createdAt: new Date(),
      lastLogin: new Date(),
      save: async function () { }
    };

    const fakeScores = [
      {
        _id: userMock._id,
        score: 1000,
        end: new Date("2020-08-26T20:26:20.202Z"),
        guesses: 100,
        start: new Date("2020-08-26T20:22:20.202Z"),
        user: userMock._id
      }
    ];

    mock.mockImplementation((input) => Promise.resolve(userMock));
    const mock2 = jest.spyOn(token.schema, 'create');
    mock2.mockImplementation((input) => {
      input._id = "createdID";
      return Promise.resolve(input)
    });
    let response = await request.post("/users/login").send({
      username: "testusername",
      password: "testpassword"
    });
    let result = response.body.data;

    const mock3 = jest.spyOn(score.schema, 'aggregate');
    mock3.mockImplementation((input) => {
      return Promise.resolve([{
        totalCount: [{ count: 1 }],
        totalData: fakeScores
      }]);
    });

    const payload = { limit: 30 }
    response = await request.get("/users/testid/scores/duel").query(payload).set("Authorization", "Bearer " + result.token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.meta).toEqual({
      total: 1,
      page: 0,
      size: 30
    });
    expect(response.body.data).toEqual([
      {
        score: fakeScores[0].score,
        guesses: fakeScores[0].guesses,
        date: fakeScores[0].end.toISOString(),
        duration: fakeScores[0].end.getTime() - fakeScores[0].start.getTime(),
      }
    ]);

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    done();
  });

  it("should GET duel/win user score after login", async (done) => {
    const mock = jest.spyOn(user.schema, 'findOne');
    const userMock = {
      username: "testusername",
      _id: "testid",
      password: pwd.hash("testpassword", "testpasswordsalt"),
      email: "testemail@email.com",
      salt: "testpasswordsalt",
      createdAt: new Date(),
      lastLogin: new Date(),
      save: async function () { }
    };

    const fakeScores = [
      {
        _id: userMock._id,
        score: 1000,
        end: new Date("2020-08-26T20:26:20.202Z"),
        guesses: 100,
        start: new Date("2020-08-26T20:22:20.202Z"),
        user: userMock._id
      }
    ];

    mock.mockImplementation((input) => Promise.resolve(userMock));
    const mock2 = jest.spyOn(token.schema, 'create');
    mock2.mockImplementation((input) => {
      input._id = "createdID";
      return Promise.resolve(input)
    });
    let response = await request.post("/users/login").send({
      username: "testusername",
      password: "testpassword"
    });
    let result = response.body.data;

    const mock3 = jest.spyOn(score.schema, 'aggregate');
    mock3.mockImplementation((input) => {
      return Promise.resolve([{
        totalCount: [{ count: 1 }],
        totalData: fakeScores
      }]);
    });

    const payload = { limit: 30 }
    response = await request.get("/users/testid/scores/duel/win").query(payload).set("Authorization", "Bearer " + result.token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.meta).toEqual({
      total: 1,
      page: 0,
      size: 30
    });
    expect(response.body.data).toEqual([
      {
        score: fakeScores[0].score,
        guesses: fakeScores[0].guesses,
        date: fakeScores[0].end.toISOString(),
        duration: fakeScores[0].end.getTime() - fakeScores[0].start.getTime(),
      }
    ]);

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    done();
  });

  it("should GET duel/lose user score after login", async (done) => {
    const mock = jest.spyOn(user.schema, 'findOne');
    const userMock = {
      username: "testusername",
      _id: "testid",
      password: pwd.hash("testpassword", "testpasswordsalt"),
      email: "testemail@email.com",
      salt: "testpasswordsalt",
      createdAt: new Date(),
      lastLogin: new Date(),
      save: async function () { }
    };

    const fakeScores = [
      {
        _id: userMock._id,
        score: 1000,
        end: new Date("2020-08-26T20:26:20.202Z"),
        guesses: 100,
        start: new Date("2020-08-26T20:22:20.202Z"),
        user: userMock._id
      }
    ];

    mock.mockImplementation((input) => Promise.resolve(userMock));
    const mock2 = jest.spyOn(token.schema, 'create');
    mock2.mockImplementation((input) => {
      input._id = "createdID";
      return Promise.resolve(input)
    });
    let response = await request.post("/users/login").send({
      username: "testusername",
      password: "testpassword"
    });
    let result = response.body.data;

    const mock3 = jest.spyOn(score.schema, 'aggregate');
    mock3.mockImplementation((input) => {
      return Promise.resolve([{
        totalCount: [{ count: 1 }],
        totalData: fakeScores
      }]);
    });

    const payload = { limit: 30 }
    response = await request.get("/users/testid/scores/duel/lose").query(payload).set("Authorization", "Bearer " + result.token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.meta).toEqual({
      total: 1,
      page: 0,
      size: 30
    });
    expect(response.body.data).toEqual([
      {
        score: fakeScores[0].score,
        guesses: fakeScores[0].guesses,
        date: fakeScores[0].end.toISOString(),
        duration: fakeScores[0].end.getTime() - fakeScores[0].start.getTime(),
      }
    ]);

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();

    done();
  });
});
