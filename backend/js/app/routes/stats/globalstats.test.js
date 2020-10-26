const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const score = require("../../model/score.model");


describe("stats API", function () {
    it("should GET global stats", async (done) => {
        const fakeStats =
        {
            maxScore: 10,
            avgScore: 10,
            maxGuesses: 100,
            avgGuesses: 100,
            maxDuration: 10000,
            avgDuration: 10000,
            avgPlaysPerDay: 0.14,
            maxPlaysPerDay: 28,
        };
        const mock = jest.spyOn(score.schema, 'aggregate');
        mock.mockImplementation((input) => {
            return Promise.resolve([fakeStats]);
        });
        let response = await request.get("/stats", params = { period: "year" })

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual(fakeStats);
        mock.mockRestore();

        done();
    });
});