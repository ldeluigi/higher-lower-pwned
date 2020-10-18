let duel = require("./duel");
const duelSchema = require('../model/battle').schema;
const scoreSchema = require("../model/score").schema;
const passwordSetup = require("./passwords").setup;

beforeEach(async (done) => {
  // reset global data
  duel = require("./duel");
  await passwordSetup();
  done();
});


describe("Duel module", function () {
  it("should correctly create a game with two anonymous", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    const mock2 = jest.spyOn(duelSchema, 'create');
    mock2.mockImplementation((input) => {
      expect(input).toHaveProperty('games');
      expect(input.games[0]).toHaveProperty('score', 0);
      expect(input.games[0]).toHaveProperty('guesses', 0);
      return Promise.resolve();
    });
    await duel.newGame("1", "2");
    mock2.mockRestore();
    mock.mockRestore();
    done();
  });

  it("should not create a game if it's already present", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({}));
    const mock2 = jest.spyOn(duelSchema, 'create');
    mock2.mockImplementation((input) => {
      done.fail("Should have not created a new game");
      return Promise.resolve();
    });
    try {
      await duel.newGame("1", "2");
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock2.mockRestore();
    mock.mockRestore();
    done();
  });

  it("should return the current guess if available", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    const mock2 = jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() =>
        new Date('2020-05-02T11:01:58.135Z').valueOf()
      );
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date("03-05-2020"),
          score: 8,
          guesses: 2,
          lost: false
        },
        {
          gameID: "2",
          expiration: new Date("03-05-2020"),
          score: 9,
          guesses: 2,
          lost: false
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date("02-05-2020"),
      save: async function () { }
    }));
    let res = await duel.currentGuess("1");
    expect(res).toHaveProperty("data");
    expect(res.data.length).toBeGreaterThan(1);
    expect(res.data[0]).toHaveProperty("password1", "a");
    expect(res.data[0]).toHaveProperty("password2", "b");
    expect(res.data[0]).toHaveProperty("value1", 1);
    expect(res.data[0]).toHaveProperty("score", 8);
    expect(res.data[1]).toHaveProperty("score", 9);
    expect(res.data[0]).toHaveProperty("guesses", 2);
    expect(res.data[1]).toHaveProperty("guesses", 2);
    mock.mockRestore();
    mock2.mockRestore();
    done();
  });

  it("should not return a game if it's not available", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    try {
      await duel.currentGuess("1");
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should quit a game and save score if available", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() - 10000),
          score: 8,
          guesses: 2
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() + 10000),
          score: 9,
          guesses: 3
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date("02-05-2020"),
      save: async function () { }
    }));
    const mock2 = jest.spyOn(scoreSchema, 'create');
    mock2.mockImplementation((input) => {
      if (input.mode == "duel.lose") {
        expect(input).toHaveProperty("score", 8);
        expect(input).toHaveProperty("guesses", 2);
      } else {
        expect(input).toHaveProperty("score", 9);
        expect(input).toHaveProperty("guesses", 3);
      }
      Promise.resolve(input);
    });
    const mock3 = jest.spyOn(duelSchema, 'deleteOne');
    mock3.mockImplementation((input) => Promise.resolve());
    let res = await duel.quitGame("2");
    expect(res).toBe(true);
    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();
    done();
  });

  it("should not delete a game if it's not available", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      save: async function () { }
    }));
    const mock2 = jest.spyOn(scoreSchema, 'create');
    mock2.mockImplementation((input) => Promise.resolve(input));
    const mock3 = jest.spyOn(duelSchema, 'deleteOne');
    mock3.mockImplementation((input) => {
      done.fail(new Error("Should not delete a game that is not present"));
      Promise.resolve();
    });
    try {
      await duel.deleteGame("1");
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();
    done();
  });

  it("should correctly submit a correct guess", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() + 100000),
          score: 8,
          guesses: 2
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() + 100005),
          score: 8,
          guesses: 2
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await duel.submitGuess("1", 2);
    expect(res).toBe(true);
    mock.mockRestore();
    done();
  });

  it("should submit even a wrong guess", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() + 100000),
          score: 8,
          guesses: 2
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() + 100005),
          score: 8,
          guesses: 2
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await duel.submitGuess("1", 1);
    expect(res).toBe(true);
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if game is not found", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    try {
      await duel.submitGuess("1", 1);
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if guess is illegal", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() + 100000),
          score: 8,
          guesses: 2
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() + 100005),
          score: 8,
          guesses: 2
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    try {
      await duel.submitGuess("1", 3);
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should submit a guess even if game is expired", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() - 100000),
          score: 8,
          guesses: 2
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() - 100005),
          score: 8,
          guesses: 2
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await duel.submitGuess("1", 1);
    expect(res).toBe(true);
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if that player already did it", async (done) => {
    const mock = jest.spyOn(duelSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      games: [
        {
          gameID: "1",
          expiration: new Date(Date.now() + 100000),
          score: 9,
          guesses: 3
        },
        {
          gameID: "2",
          expiration: new Date(Date.now() + 100005),
          score: 8,
          guesses: 2
        }
      ],
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    try {
      await duel.submitGuess("1", 2);
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });
});
