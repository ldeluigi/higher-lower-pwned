const passwords = require("./passwords");
const duelSchema = require('../model/duel').schema;
const scoreSchema = require('../model/score').schema;


const startTimeMillis = 1000 * 10;
const correctGuessMillis = 1000 * 5;
const correctGuessScore = 100;

module.exports = {
  newGame: async function (gameID1, gameID2, userID1, userID2) {
    if (gameID1 == gameID2 ||
      (userID1 !== undefined && userID2 !== undefined && userID1 == userID2)) {
      throw new Error("You can't play against yourself");
    }
    let p1 = await passwords.pickPasswordAndValue();
    let p2 = await passwords.pickPasswordAndValue();
    let gameStart = new Date();
    let newGame = {
      gameIDA: gameID1,
      gameIDB: gameID2,
      scoreA: 0,
      scoreB: 0,
      guessesA: 0,
      guessesB: 0,
      start: gameStart,
      currentP1: p1.password,
      currentP2: p2.password,
      valueP1: p1.value,
      valueP2: p2.value,
      expirationA: new Date(gameStart.getTime() + startTimeMillis),
      expirationB: new Date(gameStart.getTime() + startTimeMillis)
    };
    if (userID1) {
      newGame.userA = userID1;
    }
    if (userID2) {
      newGame.userB = userID2;
    }
    try {
      let gameQuery = await duelSchema.findOne({
        $or: [
          { gameIDA: gameID1 },
          { gameIDA: gameID2 },
          { gameIDB: gameID1 },
          { gameIDB: gameID2 }
        ]
      });
      if (gameQuery === null) await duelSchema.create(newGame);
      else throw new Error("Already playing.");
    } catch (err) {
      throw new Error("Could not create a new game. (" + err.message + ")");
    }
  },
  currentGuess: async function (gameID) {
    try {
      let gameQuery = await duelSchema.findOne({
        $or: [
          { gameIDA: gameID },
          { gameIDB: gameID }
        ]
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let isA = (gameQuery.gameIDA == gameID);

      let timeoutA = gameQuery.expirationA.getTime() - Date.now();
      if (gameQuery.guessesA > gameQuery.guessesB) {
        timeoutA = Number.MAX_SAFE_INTEGER;
      }
      let timeoutB = gameQuery.expirationB.getTime() - Date.now();
      if (gameQuery.guessesB > gameQuery.guessesA) {
        timeoutB = Number.MAX_SAFE_INTEGER;
      }
      let Aobj = {
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        timeout: timeoutA,
        score: gameQuery.scoreA,
        guesses: gameQuery.guessesA,
        duration: Date.now() - gameQuery.start.getTime(),
        lost: timeoutA < 0
      };
      let Bobj = {
        password1: gameQuery.currentP1,
        value1: gameQuery.valueP1,
        password2: gameQuery.currentP2,
        timeout: timeoutB,
        score: gameQuery.scoreB,
        guesses: gameQuery.guessesB,
        duration: Date.now() - gameQuery.start.getTime(),
        lost: timeoutB < 0
      };
      if (isA) {
        return {
          data: [
            Aobj,
            Bobj
          ]
        };
      }
      return {
        data: [
          Bobj,
          Aobj
        ]
      };
    } catch (err) {
      throw new Error("Could not fetch game data. (" + err.message + ")");
    }
  },
  deleteGame: async function (gameID, loser = true) {
    try {
      let gameQuery = await duelSchema.findOne({
        $or: [
          { gameIDA: gameID },
          { gameIDB: gameID }
        ]
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let isA = (gameQuery.gameIDA == gameID);
      // A score
      let AnewScore = {
        score: gameQuery.scoreA,
        end: new Date(),
        guesses: gameQuery.guessesA,
        start: gameQuery.start,
        mode: "duel." + (isA == loser ? "lose" : "win")
      };
      if (gameQuery.userA) {
        AnewScore.user = gameQuery.userA;
      }
      await scoreSchema.create(AnewScore);

      // B score
      BnewScore = {
        score: gameQuery.scoreB,
        end: new Date(),
        guesses: gameQuery.guessesB,
        start: gameQuery.start,
        mode: "duel." + (isA != loser ? "lose" : "win")
      };
      if (gameQuery.userB) {
        BnewScore.user = gameQuery.userB;
      }
      await scoreSchema.create(BnewScore);
      try {
        await duelSchema.deleteOne({ gameID: gameID });

        let Aobj = {
          score: gameQuery.scoreA,
          guesses: gameQuery.guessesA,
          duration: AnewScore.end - AnewScore.start,
          password1: gameQuery.currentP1,
          value1: gameQuery.valueP1,
          password2: gameQuery.currentP2,
          value2: gameQuery.valueP2
        };
        let Bobj = {
          score: gameQuery.scoreB,
          guesses: gameQuery.guessesB,
          duration: BnewScore.end - BnewScore.start,
          password1: gameQuery.currentP1,
          value1: gameQuery.valueP1,
          password2: gameQuery.currentP2,
          value2: gameQuery.valueP2
        };
        if (isA) {
          return {
            data: [
              Aobj,
              Bobj
            ]
          };
        }
        return {
          data: [
            Bobj,
            Aobj
          ]
        };
      } catch (err) {
        throw new Error("Could not delete game data. (" + err.message + ")");
      }
    } catch (err) {
      throw new Error("Could not create score data. (" + err.message + ")");
    }
  },
  submitGuess: async function (gameID, guess) {
    if (guess !== 1 && guess !== 2) {
      throw new Error("Guess must be 1 or 2");
    }
    try {
      let gameQuery = await duelSchema.findOne({
        $or: [
          { gameIDA: gameID },
          { gameIDB: gameID }
        ]
      });
      if (gameQuery === null) throw new Error("Game not found.");
      let isA = (gameQuery.gameIDA == gameID);

      if (isA && gameQuery.expirationA < new Date()) {
        return false;
      }

      if (!isA && gameQuery.expirationB < new Date()) {
        return false;
      }

      if ((gameQuery.valueP1 >= gameQuery.valueP2 && guess === 1) ||
        (gameQuery.valueP1 <= gameQuery.valueP2 && guess === 2)) {
        if (isA && gameQuery.guessesA == gameQuery.guessesB) {
          gameQuery.guessesA += 1;
          gameQuery.scoreA += correctGuessScore + Math.floor((gameQuery.expirationA.getTime() - Date.now()) / 1000);
          gameQuery.expirationA = new Date(gameQuery.expirationA.getTime() + correctGuessMillis);
          gameQuery.lastGuessA = new Date();
        } else if (isA && gameQuery.guessesA < gameQuery.guessesB) {
          gameQuery.guessesA += 1;
          gameQuery.scoreA += correctGuessScore + Math.floor((gameQuery.expirationA.getTime() - Date.now()) / 1000);
          gameQuery.expirationA = new Date(gameQuery.expirationA.getTime() + correctGuessMillis);
          gameQuery.lastGuessA = new Date();
          gameQuery.expirationB = new Date(gameQuery.expirationB.getTime() + gameQuery.lastGuessA.getTime() - gameQuery.lastGuessB.getTime());
          gameQuery.currentP1 = gameQuery.currentP2;
          gameQuery.valueP1 = gameQuery.valueP2;
          let newP = await passwords.pickPasswordAndValue();
          gameQuery.currentP2 = newP.password;
          gameQuery.valueP2 = newP.value;
        } else if (gameQuery.guessesA == gameQuery.guessesB) {
          gameQuery.guessesB += 1;
          gameQuery.scoreB += correctGuessScore + Math.floor((gameQuery.expirationB.getTime() - Date.now()) / 1000);
          gameQuery.expirationB = new Date(gameQuery.expirationB.getTime() + correctGuessMillis);
          gameQuery.lastGuessB = new Date();
        } else if (gameQuery.guessesA > gameQuery.guessesB) {
          gameQuery.guessesB += 1;
          gameQuery.scoreB += correctGuessScore + Math.floor((gameQuery.expirationB.getTime() - Date.now()) / 1000);
          gameQuery.expirationB = new Date(gameQuery.expirationB.getTime() + correctGuessMillis);
          gameQuery.lastGuessB = new Date();
          gameQuery.expirationA = new Date(gameQuery.expirationA.getTime() + gameQuery.lastGuessB.getTime() - gameQuery.lastGuessA.getTime());
          gameQuery.currentP1 = gameQuery.currentP2;
          gameQuery.valueP1 = gameQuery.valueP2;
          let newP = await passwords.pickPasswordAndValue();
          gameQuery.currentP2 = newP.password;
          gameQuery.valueP2 = newP.value;
        } else {
          return false;
        }
        await gameQuery.save();
      } else {
        return false;
      }
    } catch (err) {
      throw new Error("Could not alter game data. (" + err.message + ")");
    }
    return true;
  }
}
