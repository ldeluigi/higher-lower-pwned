const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user.model");
const token = require("../../model/token.model");
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");



describe("refresh API", function () {
  it("should POST with a user tokens after login", async (done) => {
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

    mock.mockImplementation((input) => Promise.resolve(userMock));
    const mock2 = jest.spyOn(token.schema, 'create');
    var refToken;
    mock2.mockImplementation((input) => {
      input._id = "createdID";
      input.createdAt = new Date();
      refToken = input;
      return Promise.resolve(input)
    });
    let response = await request.post("/users/login").send({
      username: "testusername",
      password: "testpassword"
    });
    let result = response.body.data;
    const mock3 = jest.spyOn(token.schema, 'findOne');
    mock3.mockImplementation((input) => {
      expect(input).toHaveProperty("token", result.refresh);
      input._id = "createdID"
      return Promise.resolve(refToken)
    });
    const mock4 = jest.spyOn(token.schema, 'deleteOne');
    mock4.mockImplementation((input) => {
      expect(input).toHaveProperty("_id", "createdID");
      return Promise.resolve(input)
    });
    const mock5 = jest.spyOn(user.schema, 'findById');
    mock5.mockImplementation((input) => Promise.resolve(userMock));
    response = await request.post("/users/refresh").send({
      token: result.token,
      refresh: result.refresh
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("id", userMock._id);
    expect(response.body.data).toHaveProperty("username", userMock.username);
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data).toHaveProperty("refresh");

    let tokenBody = jwtTools.checkJWT(response.body.data.token);
    expect(tokenBody).toHaveProperty("id", "testid");
    expect(tokenBody).toHaveProperty("username", "testusername");
    expect(tokenBody).toHaveProperty("refresh");

    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();
    mock4.mockRestore();
    mock5.mockRestore();
    done();
  });
});
