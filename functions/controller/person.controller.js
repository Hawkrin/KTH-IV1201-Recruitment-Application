/* eslint-disable */
const Person = require("../model/person.model"); // Connection to Person model
const {db} = require("../db");
const bcrypt = require("bcrypt");
const Sequelize = require('sequelize');


/**
 * Looks up a user via the user_id and then returns the user.
 * The promise gets rejected if no user can be found.
 * 
 * @param {Integer} _id Persons id
 * @param {Database} db Connection to database
 * @returns {Promise}
 */
const getUser = async (db, id) => {
    try {
        const user = await Sequelize.models.Person.finsequelizeyPk(id);
        if (!user) {
            throw new Error("User not found.");
        }
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Register user by taking username, password and email.
 * Encrypting password with hash and salt.
 * Returning a promise, resolve if successfully register user.
 * Reject if probles occured registering user. 
 * 
 * @param {String} username Persons username
 * @param {Integer} password Persons password
 * @param {String} name Persons name
 * @param {String} surname Persons surname
 * @param {Integer} pnr Persons personal number
 * @param {Integer} role_id Persons role_id
 * @param {Integer} confirmpassword  Persons password a second time
 * @param {Database} db Connection to database
 * @returns {Promise}
 */
const registerUser = async (name, surname, pnr, email, password, confirmpassword, role_id, username, db) => {
    
    try {
        const userExists = await Person.findOne({
            where: {
                [Sequelize.Op.or]: [{ username }, { email }, { pnr }]
            }
        });
        if (userExists) { throw new Error("User Already exists"); }

        const newPerson = Person.create({
            name,
            surname,
            pnr,
            email,
            password,
            role_id,
            username
        });

        return newPerson;
    } catch (error) {
        throw error;
    }
};


/**
 * Login user by taking in email and password,
 * checks if email exists and if it does we compare the password in the
 * database with the password provided and then log the user in with JWT
 *  
 * @param {String} email Persons email
 * @param {Integer} password Persons password
 * @param {Database} db Database connection
 * @returns {Promise}
 */
const loginUser = async (email, password, db) => {
    try {
        const user = await Person.findOne({
            where: { email }
        });
        if (!user) { throw new Error("Email does not exist."); }

        const isMatch  = await bcrypt.compare(password, user.password);

        if (!isMatch ) { throw new Error("Password does not match."); }

        return user;
    } catch (error) {
        throw error;
    }
};


module.exports = { registerUser, loginUser, getUser }