const { dataBaseConnectionString } = require("./util/url");
const { Sequelize } = require('sequelize');

const db = new Sequelize(dataBaseConnectionString, {
  logging: false // disable logging for all queries
});

db.sync()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(error => {
        console.error('Unable to connect to the database:', error);
    });

module.exports = { db };