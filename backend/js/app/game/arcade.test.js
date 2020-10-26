let arcade = require("./arcade");
const gameSchema = require("../model/game.model").schema;
const scoreSchema = require("../model/score.model").schema;
const passwordSetup = require("./passwords").setup;

beforeEach(async (done) => {
  // reset global data
  arcade = require("./arcade");
  await passwordSetup();
  done();
});


describe("Arcade module", function () {
  it("should correctly create a game as anonymous", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    const mock2 = jest.spyOn(gameSchema, 'create');
    mock2.mockImplementation((input) => {
      expect(input).toHaveProperty('score', 0);
      expect(input).toHaveProperty('guesses', 0);
      return Promise.resolve();
    });
    await arcade.newGame("1");
    mock2.mockRestore();
    mock.mockRestore();
    done();
  });

  it("should not create a game if it's already present", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({}));
    const mock2 = jest.spyOn(gameSchema, 'create');
    mock2.mockImplementation((input) => {
      done.fail("Should have not created a new game");
      return Promise.resolve();
    });
    try {
      await arcade.newGame("1");
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock2.mockRestore();
    mock.mockRestore();
    done();
  });

  it("should return the current guess if available", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      expiration: new Date("03-05-2020"),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date("02-05-2020")
    }));
    let res = await arcade.currentGuess("1");
    expect(res).toHaveProperty("password1", "a");
    expect(res).toHaveProperty("password2", "b");
    expect(res).toHaveProperty("value1", 1);
    expect(res).toHaveProperty("score", 8);
    expect(res).toHaveProperty("guesses", 2);
    mock.mockRestore();
    done();
  });

  it("should not return a game if it's not available", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    try {
      await arcade.currentGuess("1");
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should delete a game and save score if available", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      gameID: "1",
      expiration: new Date("03-05-2020"),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date("02-05-2020")
    }));
    const mock2 = jest.spyOn(scoreSchema, 'create');
    mock2.mockImplementation((input) => {
      expect(input).toHaveProperty("score", 8);
      expect(input).toHaveProperty("guesses", 2);
      Promise.resolve(input);
    });
    const mock3 = jest.spyOn(gameSchema, 'deleteOne');
    mock3.mockImplementation((input) => Promise.resolve());
    let res = await arcade.deleteGame("1");
    expect(res).toHaveProperty("score", 8);
    expect(res).toHaveProperty("guesses", 2);
    expect(res).toHaveProperty("password1", "a");
    expect(res).toHaveProperty("password2", "b");
    expect(res).toHaveProperty("value1", 1);
    expect(res).toHaveProperty("value2", 2);
    mock.mockRestore();
    mock2.mockRestore();
    mock3.mockRestore();
    done();
  });

  it("should not delete a game if it's not available", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    const mock2 = jest.spyOn(scoreSchema, 'create');
    mock2.mockImplementation((input) => Promise.resolve(input));
    const mock3 = jest.spyOn(gameSchema, 'deleteOne');
    mock3.mockImplementation((input) => {
      done.fail(new Error("Should not delete a game that is not present"));
      Promise.resolve();
    });
    try {
      await arcade.deleteGame("1");
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
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      gameID: "1",
      expiration: new Date(Date.now() + 100000),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await arcade.submitGuess("1", 2);
    expect(res).toBe(true);
    mock.mockRestore();
    done();
  });

  it("should not submit a wrong guess", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      gameID: "1",
      expiration: new Date(Date.now() + 100000),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await arcade.submitGuess("1", 1);
    expect(res).toBe(false);
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if game is not found", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve(null));
    try {
      await arcade.submitGuess("1", 1);
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if guess is illegal", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      gameID: "1",
      expiration: new Date(Date.now() + 100000),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    try {
      await arcade.submitGuess("1", 3);
      done.fail("Should have thrown an error.");
    } catch (err) {
      expect(err).toHaveProperty("message");
    }
    mock.mockRestore();
    done();
  });

  it("should not submit a guess if game is expired", async (done) => {
    const mock = jest.spyOn(gameSchema, 'findOne');
    mock.mockImplementation((input) => Promise.resolve({
      gameID: "1",
      expiration: new Date(Date.now() - 100000),
      currentP1: "a",
      currentP2: "b",
      valueP1: 1,
      valueP2: 2,
      score: 8,
      guesses: 2,
      start: new Date(Date.now() - 100000),
      save: () => Promise.resolve()
    }));
    let res = await arcade.submitGuess("1", 1);
    expect(res).toBe(false);
    mock.mockRestore();
    done();
  });
});
