const mongoose = require("mongoose");

const Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

let game = new Schema(
    {
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
        start: {
            type: Date,
            required: true,
        },
        user: {
            type: ObjectId,
            ref: 'users'
        },
    },
    { collection: "Games" }
);

game.set("timestamps", true);

module.exports = {
    schema: mongoose.model("games", game)
};
