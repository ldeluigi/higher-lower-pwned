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
        gameID: {
            type: String,
            unique: true,
            required: true
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
        expiration: {
            type: Date,
            required: true
        }
    },
    { collection: "Games" }
);

game.set("timestamps", true);

module.exports = {
    schema: mongoose.model("games", game)
};
