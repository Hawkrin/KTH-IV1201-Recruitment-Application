
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
// db.close();
db
    .authenticate()
    .then(() => {
        console.log("Database connection has been established successfully.\n");
    })
    .catch((err) => {
        console.error("\n Unable to connect to the database: \n", err + "\n");
    });

module.exports = { db };
