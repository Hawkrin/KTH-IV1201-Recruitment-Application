/* eslint-disable */
const User = require("../model/user.model"); // Connection to User model
const {db} = require("../db");
const bcrypt = require("bcrypt");

/**
 * Checks if a users username, email or personal_number exists in the database
 * 
 * @param {String} username 
 * @param {String} email 
 * @param {Integer} personal_number 
 * @returns a user if in database
 */
const userAlreadyExists = (username, email, personal_number, db) => {
    return new Promise((resolve, reject) => {
        User.findOne({ $or: [{ username }, { email }, {personal_number}] }, (err, user) => {
            if (err) { return reject(err); }
            resolve(user !== null);
        });
    });
};

/**
 * Looks up a user via the user_id and then returns the user.
 * The promise gets rejected if no user can be found.
 * 
 * @param {Integer} _id 
 * @returns {Promise}
 */
const getUser = (db, _id) => {
    return new Promise((resolve, reject) => {
        User.findById(_id, (err, user) => {
            if (err) { return reject(err); }
            resolve(user);
        });
    });
};

/**
 * Register user by taking username, password and email.
 * Encrypting password with hash and salt.
 * Returning a promise, resolve if successfully register user.
 * Reject if probles occured registering user. 
 * 
 * @param {String} username 
 * @param {String} password 
 * @param {String} email 
 * @returns {Promise}
 */
const registerUser = (username, password, confirmpassword, email, personal_number, first_name, last_name, db) => {
    return new Promise((resolve, reject) => {
        User.findOne({ $or: [{ username }, { email }, { personal_number }] }, (err, userExists) => {
            if (err) { return reject(err); }
            if (userExists) { return reject("User Already exists"); }

            const newUser = new User({
                username,
                password,
                email,
                personal_number,
                first_name,
                last_name
            });

            newUser.save((error) => {
                if (error) { return reject(error); }
                return resolve(newUser);
            });
        });
    });
};


/**
 * Login user by taking in email and password,
 * checks if email exists and if it does we compare the password in the
 * database with the password provided and then log the user in with JWT
 *  
 * @param {String} email
 * @param {String} password
 * @returns {Promise}
 */
const loginUser = (email, password, db) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
            if (err) { return reject(err); }
            if (!user) { return reject("Email does not exists."); }

            bcrypt.compare(password, user.password, (error, result) => {
                if (error) { return reject(error); }
                if (result) {
                    return resolve(user);
                } else {
                    return reject("Password does not match.");
                }
            });
        });
    });
};


module.exports = { registerUser, loginUser, getUser }