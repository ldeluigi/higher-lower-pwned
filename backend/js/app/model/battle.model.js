const mongoose = require("mongoose");

const Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

let game = new Schema(
  {
    games: [{
      gameID: {
        type: String,
        unique: true,
        required: true
      },
      score: {
        type: Number,
        required: true
      },
      lastGuess: {
        type: Date
      },
      guesses: {
        type: Number,
        required: true,
      },
      user: {
        type: ObjectId,
        ref: 'users'
      },
      expiration: {
        type: Date,
        required: true
      },
      lost: {
        type: Boolean,
        default: false
      },
      victory: {
        type: Boolean,
        default: false
      }
    }],
    start: {
      type: Date,
      required: true,
    },
    currentP1: {
      type: String,
      required: true
    },
    valueP1: {
      type: Number,
      required: true
    },
    currentP2: {
      type: String,
      required: true
    },
    valueP2: {
      type: Number,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    end: {
      type: Date
    }
  },
  { collection: "Battles" }
);

game.set("timestamps", true);

module.exports = {
  schema: mongoose.model("battles", game)
};
