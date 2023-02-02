/* eslint-disable */
const Sequelize = require('sequelize'); // ORM for connection with postgres
const validator = require('validator'); // Framework for string validation
const bcrypt = require('bcrypt'); // Library for encrypting data
const {db} = require('../db'); // Connection to database
const Role = require('./role.model'); // Role model


const Person = db.define("person", { 

    person_id: {
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
    password: {
        type: Sequelize.STRING,
        required: true,
    },
    role_id: {
        type: Sequelize.INTEGER,
        required: true,
    }, 
    username: {
        type: Sequelize.STRING,
        unique: true,
        required: true,
    }, 
    },{
        tableName: "person",
        timestamps: false
    }
);

// Adds a beforeCreate hook to hash the password
Person.beforeCreate(async (person, options) => {

    // Checks if person has changed password and email, if not just continue.
    if (!person.changed("password") && !person.changed("email")) return next();

    // Validate password
    if (!validator.isLength(person.password, {min: 8, max: 16})) {
        return next(new Error("Password is not strong."));
    }

    // Validate Email
    if (!validator.isEmail(person.email)) {
        return next(new Error("Email is not a valid email."));
    }

    // Generate encrypted password and setting password to the hash.
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(person.password, salt);
    person.password = encryptedPassword;

    // Set role_id
    const role = await Role.findOne({
        where: {
            name: "applicant"
        }
    });
    person.role_id = role.role_id;
    
});

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Person;
