/* eslint-disable */
const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

const connect = () => {
  return mongoose.connect("mongodb+srv://" + process.env.USER + ":" + process.env.PASSWORD + "@cluster0.5mad5tg.mongodb.net/?retryWrites=true&w=majority")
}

module.exports = {connect};

