const jwtTools = require("./jwt");
const jwt = require("jsonwebtoken");
const tokenSchema = require("../model/token").schema;
jest.mock("../../config/config");
const config = require("../../config/config");

test("createJWT should return a valid Json Web Token", async () => {
    const mock = jest.spyOn(tokenSchema, 'create');  // spy on Message.findOne()
    mock.mockImplementation((input) => Promise.resolve(input));
    let result = await jwtTools.createJWT("testid", "testusername");
    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("refresh");
    let token = result.token;
    let tokenPayload = jwt.verify(token, config.jwtSecret);
    expect(tokenPayload.id).toBe("testid");
    expect(tokenPayload.username).toBe("testusername");
    mock.mockRestore();
});