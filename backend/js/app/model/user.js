const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let user = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { collection: "Users" }
);

user.set("timestamps", true);

module.exports = {
  schema: mongoose.model("users", user),
  toDto: function (schema) {
    return {
      id: schema._id,
      username: schema.username,
      email: schema.email,
      createdAt: schema.createdAt
    };
  }
}
