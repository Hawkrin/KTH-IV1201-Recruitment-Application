/* eslint-disable */
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
 * @param {String} password 
 * @param {String} email 
 * @returns {Promise}
 */
const registerUser = async (name, surname, pnr, email, password, confirmpassword, role_id, username) => {
    
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
 * @param {String} username
 * @param {String} password
 * @returns {Promise}
 */
const loginUser = async (username, password) => {
    try {
        const user = await Person.findOne({
            where: { username }
        });
        if (!user) { throw new Error("Username does not exist."); }

        const isMatch  = await bcrypt.compare(password, user.password);

        if (!isMatch ) { throw new Error("Password does not match."); }

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * 
 */
// const encryptPasswordsInDatabase = async () => {
    
//     const saltRounds = 10;
//     const persons = await Person.findAll();

//     if (persons.length > 0) {
//         for (const person of persons) {
//             if (person.password && !person.password.startsWith('$2b$')) {
//                 const encryptedPassword = await bcrypt.hash(person.password, saltRounds);
//                 await person.update({ password: encryptedPassword });
//             }
//         }
//     } else {
//         console.log("No persons found in the database");
//     }
// }



module.exports = { registerUser, loginUser, getUser }