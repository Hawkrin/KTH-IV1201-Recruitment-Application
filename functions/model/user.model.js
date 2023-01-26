/* eslint-disable linebreak-style */
const mongoose = require("mongoose");
// const validator = require('validator');

const userSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: "default",
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
});


module.exports = mongoose.model("user", userSchema);
