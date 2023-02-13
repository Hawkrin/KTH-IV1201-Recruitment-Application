const Person = require("../model/person.model"); // Connection to User model
const bcrypt = require("bcrypt");
const Sequelize = require('sequelize');


/**
 * Looks up a user via the user_id and then returns the user.
 * The promise gets rejected if no user can be found.
 * 
 * @param {Integer} _id 
 * @returns {Promise}
 */
const getUser = async (id) => {
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
 * @param {String} username 
 * @param {Integer} password 
 * @param {String} name 
 * @param {String} surname 
 * @param {Integer} pnr 
 * @param {String} email 
 * @param {Integer} role_id 
 * @returns {Promise}
 */
const registerUser = async (name, surname, pnr, email, password, role_id, username) => {
    
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
 * Login user by taking in email/username and password,
 * checks if email exists and if it does we compare the password in the
 * database with the password provided and then log the user in with JWT
 *  
 * @param {String} usernameOrEmail
 * @param {String} password
 * @returns {Promise}
 */

const loginUser = async (usernameOrEmail, password) => {
    try {
        let user = await Person.findOne({
            where: { username: usernameOrEmail }
        });
        if (!user) {
            user = await Person.findOne({
                where: { email: usernameOrEmail }
            });
    
            if (!user) {
                throw new Error("Username or email does not exist.");
            }
        }

        const isMatch  = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error("Password does not match.");
        }
        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * A function that helps the users change their password. A user enters his pnr
 * and the function checks if the user is in the db, if that's the case then the user
 * can change his password by entering the new password twice.
 * 
 * @param {Integer} pnr 
 * @param {Integer} newPassword 
 * @returns success if the pnr is correct and the new passwords match. Otherwise reject
 */
const changePassword = async (pnr, password) => {
    try {
        const person = await Person.findOne({ where: { pnr } });
        if (!person) {
            throw new Error(`Person with pnr: ${pnr} not found`);
        }
        
        await person.update({ password });
        return { status: 'success', message: 'Password successfully changed' };
    } catch (error) {
        console.error(error);
        return { status: 'error', message: error.message };
    }
};


module.exports = { registerUser, loginUser, getUser, changePassword }