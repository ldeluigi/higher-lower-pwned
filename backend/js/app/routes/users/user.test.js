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
            salt: "testpasswordsalt",
            lastLogin: new Date(),
            save: async function (user) { }
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
        console.log(result)
        response = await request.get("/users/testid").set("Authentication", "Bearer " + result.token);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ data: user.toDto(userMock) });
        mock.mockRestore();
        mock2.mockRestore();
        done();
    });
});