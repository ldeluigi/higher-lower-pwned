const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user");
const score = require("../../model/score");
const token = require("../../model/token");
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");



describe("user stats API", function () {
    it("should GET user stats after login", async (done) => {
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

        const userStatsMock = [
            {
                maxScore: 1000,
                avgScore: 1000,
                maxGuesses: 100,
                avgGuesses: 100,
                maxDuration: 14400000,
                avgDuration: 14400000,
                avgPlaysPerDay: 0.14,
                periodNumber: 28,
                year: 2020
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
        mock3.mockImplementation((input) => Promise.resolve(userStatsMock));

        const payload = { limit: 30, period: 'week' }
        response = await request.get("/users/testid/stats", params = payload).set("Authorization", "Bearer " + result.token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual({ id: "testid", history: userStatsMock });
        mock.mockRestore();
        mock2.mockRestore();
        mock3.mockRestore();

        done();
    });
});