
const { Sequelize } = require("sequelize");
const { dataBaseConnectionString } = require('./util/url');

const URI =
    process.env.DATABASE_URL || dataBaseConnectionString;

const sequelizeOptions = {
    logging: false,
    dialect: "postgres",
    dialectOptions: {
        ssl: process.env.DATABASE_URL ? { require: true, rejectUnauthorized: false } : false,
    },
};

const db = new Sequelize(URI, sequelizeOptions);

module.exports = { db };
