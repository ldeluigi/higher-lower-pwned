const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const user = require("../../model/user");
const score = require("../../model/score");
const token = require("../../model/token");
const pwd = require("../../utils/password");
const jwtTools = require("../../utils/jwt");



describe("scores arcade API", function () {
    it("should GET arcade user score after login", async (done) => {
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

        const fakeScores = [
            {
                _id: userMock._id,
                score: 1000,
                end: new Date("2020-08-26T20:26:20.202Z").toString(),
                guesses: 100,
                start: new Date("2020-08-26T20:26:20.202Z").toString(),
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

        const mock3 = jest.spyOn(score.schema, 'find');
        mock3.mockImplementation((input) => {
            var x = {
                skip: (_) => x,
                limit: (_) => x,
                sort: (_) => Promise.resolve(fakeScores)
            };
            return x;
        });

        const payload = { limit: 30, period: 'year' }
        response = await request.get("/scores/testid/arcade", params = payload).set("Authorization", "Bearer " + result.token);
        expect(response.body.data).toEqual(fakeScores);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");

        mock.mockRestore();
        mock2.mockRestore();
        mock3.mockRestore();

        done();
    });
});