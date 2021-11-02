const jwtTools = require("./jwt");
const jwt = require("jsonwebtoken");
const tokenSchema = require("../model/token.model").schema;
const config = require("../../config/config");

describe("createJWT", function () {
  it("should return a valid Json Web Token", async () => {
    const mock = jest.spyOn(tokenSchema, 'create');
    mock.mockImplementation((input) => {
      input._id = "createdID";
      return Promise.resolve(input)
    });
    let result = await jwtTools.createJWT("testid", "testusername");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("refresh");
    let token = result.token;
    let tokenPayload = jwt.verify(token, config.jwtSecret);
    expect(tokenPayload).toHaveProperty("jti");
    expect(tokenPayload.sub).toBe("testid");
    expect(tokenPayload.username).toBe("testusername");
    mock.mockRestore();
  });
});
