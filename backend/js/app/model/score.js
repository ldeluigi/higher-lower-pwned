const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let score = new Schema(
  {
    score: {
      type: Int32Array,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    guesses: {
      type: Int32Array,
      required: true
    },
    duration: {
      type: Int32Array,
      required: true
    },
  },
  { collection: "Scores" }
);

user.set("timestamps", true);

module.exports = {
  schema: mongoose.model("scores", score),
  toDto: function (schema) {
    return {
      id: schema._id,
      score: schema.score,
      date: schema.date,
      guesses: schema.guesses,
      duration: schema.duration
    };
  }
}
