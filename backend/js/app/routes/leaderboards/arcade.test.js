const app = require("../../../config/server").express;
const supertest = require("supertest");
const request = supertest(app);
const score = require("../../model/score");
const pwd = require("../../utils/password");

beforeAll(() => {
  // Lock Time
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1598571872485); // 28/08/2020 01:44
});

afterAll(() => {
  // Unlock Time
  dateNowSpy.mockRestore();
})

describe("leaderboards API", function () {
  it("should GET /arcade scores for last week", async (done) => {
    const mock = jest.spyOn(score.schema, 'find');
    const fakeScores = [

      {
        _id: "5f483ebb859d884db14288c1",
        score: 17,
        end: new Date("2020-08-26T20:26:20.202Z"),
        guesses: 5,
        start: new Date("2020-08-26T20:22:20.202Z"),
        user: {
          _id: "testid",
          username: "testusername"
        }
      },
      {
        _id: "5f483db2859d884db1428861",
        score: 10,
        end: new Date("2020-08-27T20:26:20.202Z"),
        guesses: 5,
        start: new Date("2020-08-27T20:22:20.202Z")
      }
    ];
    mock.mockImplementation((input) => {
      var x = {
        limit: (_) => x,
        sort: (_) => x,
        populate: (_) => Promise.resolve(fakeScores),
      };
      return x;
    });
    let response = await request.get("/leaderboards/arcade");
    expect(response.status).toBe(200);
    expect(response.body)
      .toEqual({
        "data": [
          { "score": 17, "date": "2020-08-26T20:26:20.202Z", "username": "testusername", "guesses": 5 },
          { "score": 10, "date": "2020-08-27T20:26:20.202Z", "username": "anonymous", "guesses": 5 }
        ]
      });
    mock.mockRestore();
    done();
  });

});
