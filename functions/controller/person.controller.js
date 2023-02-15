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
 * can change his password by entering the new password twice. And a special check is being
 * done by validating the user with a code being sent.
 * 
 * @param {Integer} pnr 
 * @param {Integer} newPassword 
 * @param {Integer} code 
 * @returns success if the pnr is correct and the new passwords match. Otherwise reject
 */
const changePassword = (pnr, password, code) => {
    return new Promise((resolve, reject) => {

        if (req.session.code !== code) {
            reject(new Error("Invalid code"));
            return;
        }
        Person.update({password: bcrypt.hashSync(password, 10),},
            {
                where: {pnr},
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
};

/**
 * Checks if there's a user in the database with the given personal number.
 * If yes, then it returns the person, if no an error is thrown
 * 
 * @param {Integer} pnr 
 * @returns 
 */
const checkIfPnrExists = async (pnr) => {
    return Person.findOne({ where: { pnr } })
        .then(person => {
            if (person) {
            return person;
            } else {
            throw new Error('Invalid personal number');
            }
        });
}

/**
 * A function that generates a random number and returns the result.
 * 
 * @param {Integer} length 
 * @returns 
 */
const generateRandomCode = async (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = { registerUser, loginUser, getUser, changePassword, generateRandomCode, checkIfPnrExists }