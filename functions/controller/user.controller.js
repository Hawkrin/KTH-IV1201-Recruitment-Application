/* eslint-disable */
const User = require("../model/user.model"); // Connection to User model

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
const registerUser = (username, password, confirmpassword, email) => {
    return new Promise((resolve, reject) => {
        User.userAlreadyExists(username, email)
            .then((userExists) => {
                
                if (userExists) { return reject("User Already exists"); }

                const newUser = new User({
                    username,
                    password,
                    email,
                })

                newUser.save((error) => {
                    if (error) { return reject(error);}
                    return resolve(newUser)
                })
            })
            .catch((error) => {
                return reject(error.message);
            })
    })
}

/**
 * Login user by taking in email and password,
 * checks if email exists and if it does we compare the password in the
 * database with the password provided and then log the user in with JWT
 *  
 * @param {String} email
 * @param {String} password
 */
const loginUser = (email, password) => {
    return new Promise((resolve, reject) => {
        User.loginUser(email, password)
            .then((user) => {
                return resolve(user);
            })
            .catch((error) => {
                return reject(error.message);
            })
        
    })
}


module.exports = { registerUser, loginUser }