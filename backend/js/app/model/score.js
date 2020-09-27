const mongoose = require("mongoose");

const Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

let score = new Schema(
  {
    score: {
      type: Number,
      required: true
    },
    end: {
      type: Date,
      required: true
    },
    guesses: {
      type: Number,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    user: {
      type: ObjectId,
      ref: 'users',
    },
    mode: {
      type: String,
      required: true
    },
  },
  { collection: "Scores" }
);

score.set("timestamps", true);

module.exports = {
  schema: mongoose.model("scores", score),
  toDto: function (schema, user = "anonymous") {
    return {
      score: schema.score,
      guesses: schema.guesses,
      date: schema.end,
      username: user
    };
  }
};
