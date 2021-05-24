const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user.model");
const token = require("../../model/token.model");
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");


describe("login API", function () {
  it("should POST a user authentication data and do login", async (done) => {
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
    mock2.mockImplementation((input) => {
      input._id = "createdID";
      return Promise.resolve(input)
    });
    let response = await request.post("/users/login").send({
      username: "testusername",
      password: "testpassword"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("refresh");
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data).toHaveProperty("id", "testid");
    expect(response.body.data).toHaveProperty("username", "testusername");
    let tokenBody = jwtTools.checkJWT(response.body.data.token);
    expect(tokenBody).toHaveProperty("sub", "testid");
    expect(tokenBody).toHaveProperty("username", "testusername");
    expect(tokenBody).toHaveProperty("jti");
    mock.mockRestore();
    mock2.mockRestore();
    done();
  });

});
