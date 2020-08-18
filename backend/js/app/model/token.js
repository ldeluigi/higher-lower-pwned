const mongoose = require("mongoose");

const Schema = mongoose.Schema,
  ObjectId = Schema.Types.ObjectId;

let token = new Schema(
  {
    token: {
      type: String,
      required: true
    },
    expire: {
      type: Date,
    },
    jwtRef: {
      type: String,
      required: true
    },
    user: {
      type: ObjectId,
      required: true
    }
  },
  { collection: "Tokens" }
);

token.set("timestamps", true);

module.exports = {
  schema: mongoose.model("tokens", token)
}
