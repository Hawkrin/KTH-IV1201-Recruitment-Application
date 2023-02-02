/* eslint-disable */
const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database

const Application_Form = db.define("application_form", {

    application_form_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        required: true,
    },
    surname: {
        type: Sequelize.STRING,
        required: true,
    },
    pnr: {
        type: Sequelize.INTEGER,
        required: true,
        unique: true,
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
        validate: {
        isEmail: true,
        isLowercase: true
        }
    },
    from_date: {
        type: Sequelize.DATE,
        required: true,
    },
    to_date: {
        type: Sequelize.DATE,
        required: true,
    },
    years_of_experience: {
        type: Sequelize.NUMBER
    },
    },{
        tableName: "application_form",
        timestamps: false
    }
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Application_Form;
