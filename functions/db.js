/* eslint-disable */
const mongoose = require("mongoose");
const { dataBaseConnectionString } = require("./util/url");

mongoose.set('strictQuery', true);

mongoose.connect(dataBaseConnectionString, { useNewUrlParser: true });

const db = mongoose.connection;

module.exports = {db};

