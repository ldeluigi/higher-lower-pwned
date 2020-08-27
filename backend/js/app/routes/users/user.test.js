const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user");
const token = require("../../model/token");
const pwd = require("../../utils/password");


describe("user API", function () {
  it("should GET a user after login", async (done) => {
    const mock = jest.spyOn(user.schema, 'findOne');
    const userMock = {
      username: "testusername",
      _id: "testid",
      password: pwd.sha512("testpassword", "testpasswordsalt"),
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
    let result = response.body.data;
    response = await request.get("/users/testid").set("Authorization", "Bearer " + result.token);
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body))
      .toEqual(JSON.stringify({ data: user.toDto(userMock) }));
    mock.mockRestore();
    mock2.mockRestore();
    done();
  });


  it("should PUT a user after login", async (done) => {
    const mock = jest.spyOn(user.schema, 'findOne');
    const modifyUserBody = {
      password: "newtestpassword",
      email: "newtestemail@email.com"
    };
    const userMock = {
      username: "testusername",
      _id: "testid",
      password: pwd.sha512("testpassword", "testpasswordsalt"),
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
    let result = response.body.data;
    userMock.save = async function () {
      expect(this.password).toBe(pwd.sha512(modifyUserBody.password, this.salt));
      expect(this.email).toBe(modifyUserBody.email);
    };
    response = await request.put("/users/testid").set("Authorization", "Bearer " + result.token)
      .send(modifyUserBody);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("email", modifyUserBody.email);
    expect(response.body.data).toHaveProperty("password", "updated");
    mock.mockRestore();
    mock2.mockRestore();
    done();
  });

  it("should POST a new user", async (done) => {
    const mock = jest.spyOn(user.schema, 'create');
    const nowDate = new Date();
    mock.mockImplementation((input) => {
      input._id = "createdID";
      input.createdAt = nowDate;
      input.lastLogin = undefined;
      return Promise.resolve(input);
    });
    const userData = {
      username: "testusername",
      password: "testpassword",
      email: "test@email.com"
    };
    const expectedResult = {
      registration: nowDate.toJSON(),
      lastLogin: undefined,
      id: "createdID",
      username: userData.username,
      email: userData.email
    };
    let response = await request.post("/users").send(userData);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expectedResult);
    mock.mockRestore();
    done();
  });

});
