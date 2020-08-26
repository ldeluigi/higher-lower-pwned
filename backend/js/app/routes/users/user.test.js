const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user");
const token = require("../../model/token");
const pwd = require("../../utils/password");


describe("user API", function () {
    it("should GET a user after login", async (done) => {
        const mock = jest.spyOn(user.schema, 'findOne');
        mock.mockImplementation((input) => Promise.resolve({
            username: "testusername",
            _id: "testid",
            password: pwd.sha512("testpassword", "testpasswordsalt"),
            salt: "testpasswordsalt",
            lastLogin: new Date(),
            save: async function (user) { }
        }));
        const mock2 = jest.spyOn(token.schema, 'create');
        mock2.mockImplementation((input) => {
            input._id = "createdID";
            return Promise.resolve(input)
        });
        let response = await request.post("/users/login").send({
            username: "testusername",
            password: "testpassword"
        });
        console.log(response.body);
        expect(response.status).toBe(200);
        let result = response.body.data;
        expect(result).toHaveProperty("id", "testid");
        expect(result).toHaveProperty("username", "testusername");
        expect(result).toHaveProperty("token");
        expect(result).toHaveProperty("refresh");
        mock.mockRestore();
        mock2.mockRestore();
        done();
    });
});