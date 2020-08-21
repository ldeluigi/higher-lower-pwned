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
            required: true,
        },
    },
    { collection: "Scores" }
);

token.set("timestamps", true);

module.exports = {
    schema: mongoose.model("scores", token),
};
