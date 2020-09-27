const mongoose = require("mongoose");

const Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

let game = new Schema(
  {
    gameIDA: {
      type: String,
      required: true,
      unique: true
    },
    gameIDB: {
      type: String,
      required: true,
      unique: true
    },
    scoreA: {
      type: Number,
      required: true
    },
    scoreB: {
      type: Number,
      required: true
    },
    lastGuessA: {
      type: Date
    },
    lastGuessB: {
      type: Date
    },
    guessesA: {
      type: Number,
      required: true,
    },
    guessesB: {
      type: Number,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    userA: {
      type: ObjectId,
      ref: 'users'
    },
    userB: {
      type: ObjectId,
      ref: 'users'
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
    expirationA: {
      type: Date,
      required: true
    },
    expirationB: {
      type: Date,
      required: true
    }
  },
  { collection: "Duels" }
);

game.set("timestamps", true);

module.exports = {
  schema: mongoose.model("duels", game)
};
