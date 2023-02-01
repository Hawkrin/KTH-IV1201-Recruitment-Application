/* eslint-disable */
const { dataBaseConnectionString } = require("./util/url");
const { Sequelize } = require('sequelize');

const db = new Sequelize(dataBaseConnectionString);


try {
    db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

module.exports = {db};

