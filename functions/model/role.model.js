/* eslint-disable */
const Sequelize = require('sequelize');
const { db } = require('../db');

const Role = db.define("role", {

    role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        required: true,
    },
    },{
        tableName: "role",
        timestamps: false,
    }
);

// Synchronize the model with the database
db.sync({ force: false });

module.exports = Role;