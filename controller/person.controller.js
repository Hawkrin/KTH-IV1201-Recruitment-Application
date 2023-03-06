const Person = require("../model/person.model"); // Connection to User model
const Code_Vault = require("../model/code_vault.model"); // Connection to Code_vault model
const bcrypt = require("bcrypt");
const Sequelize = require('sequelize');

/**
 * Looks up a user via the user_id and then returns the user.
 * The promise gets rejected if no user can be found.
 * 
 * @param {Integer} id retrieves the person_id of a person
 * @returns {Promise} the person "object"
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
 * @param {String} username the username of the user
 * @param {Integer} password the password of the user
 * @param {String} name the name of the user
 * @param {String} surname the surname of the user
 * @param {Integer} pnr the personal number of the user
 * @param {String} email the email of the user
 * @param {Integer} role_id the users role_id
 * @returns {Promise} the new person as an object
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
            confirmpassword,
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
 * @param {String} usernameOrEmail Both username and email are valid 
 * @param {String} password the password of the user
 * @returns {Promise} returns the person as an object
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

        if (user.role_id == "1") {
            const isMatch = await Person.findOne({ where: { password: user.password } });
            if (!isMatch) {
                throw new Error("Password does not match.");
            }
        }
        if (user.role_id == "2") {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error("Password does not match.");
            }
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
 * @param {Integer} pnr the personal number of the user
 * @param {Integer} password the password of the user
 * @param {Integer} code temporary code used for validation
 * @returns success if the pnr is correct and the new passwords match. Otherwise reject
 */
const changePassword = (code, password) => {
    return new Promise(async (resolve, reject) => {

        const code_vault = await Code_Vault.findOne({ where: { code } });

        if (!code_vault) {
            reject(new Error("Invalid code"));
            return;
        }

        const person_id = code_vault.person_id;

        Person.update({password: bcrypt.hashSync(password, 10),},
            {
                where: {person_id},
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
 * Checks if there's a user in the database with the given personal number if so
 * then the function stores the generated code together with the persons person_id
 * for 10 minutes and then it's deleted
 * 
 * @param {Integer} pnr the personal number of the person
 * @returns success if the pnr is correct and the new passwords match. Otherwise reject
 */
const checkIfPnrExistsAndStoreCodeVault = (pnr) => {

    return new Promise(async (resolve, reject) => {

        const person = await Person.findOne({ where: { pnr } });

        if (person) {
            let codeVaultId = 1;
            let codeVaultExists = true;

            while (codeVaultExists) {
                const existingCodeVault = await Code_Vault.findOne({ where: { code_vault_id: codeVaultId } });
                if (existingCodeVault) {
                    codeVaultId++;
                } else {
                    codeVaultExists = false;
                }
            }

            const code = await generateRandomCode(6);
            const codeVault = await Code_Vault.create({
                code_vault_id: codeVaultId,
                person_id: person.person_id,
                code
            });

            setTimeout(async () => {
                await codeVault.destroy();
            }, 10 * 60 * 1000);

            resolve(codeVault);
        } else {
            reject(new Error('Invalid personal number'));
        }

    });
};

/**
 * Checks if there's a user in the database with the given username if so
 * then the function stores the generated code together with the persons person_id
 * for 10 minutes and then it's deleted
 * 
 * @param {Integer} pnr the personal number of the person
 * @returns success if the pnr is correct and the new passwords match. Otherwise reject
 */
const checkIfUsernameExistsAndStoreCodeVault = (username) => {

    return new Promise(async (resolve, reject) => {

        const person = await Person.findOne({ where: { username } });

        if (person && person.role_id == '1') {
            let codeVaultId = 1;
            let codeVaultExists = true;

            while (codeVaultExists) {
                const existingCodeVault = await Code_Vault.findOne({ where: { code_vault_id: codeVaultId } });
                if (existingCodeVault) {
                    codeVaultId++;
                } else {
                    codeVaultExists = false;
                }
            }

            const code = await generateRandomCode(6);
            const codeVault = await Code_Vault.create({
                code_vault_id: codeVaultId,
                person_id: person.person_id,
                code
            });

            setTimeout(async () => {
                await codeVault.destroy();
            }, 10 * 60 * 1000);

            resolve(codeVault);
        } else {
            reject(new Error('Invalid username'));
        }

    });
};

/**
 * A function that generates a random number and returns the result.
 * 
 * @param {Integer} length the length of the code
 * @returns the code.
 */
const generateRandomCode = async (length) => {
    let result = "";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Checks the Person table in the db and hashes all passwords that aren't currently hashed.
 */
const hashUnhashedPasswords = async () => {

    const persons = await Person.findAll();

    for (const person of persons) {
        if (person.password && !person.password.startsWith('$2b$')) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(person.password, salt);
    
            await person.update({ password: hashedPassword });
        }
    }
}


module.exports = { registerUser, loginUser, getUser, changePassword, generateRandomCode, checkIfPnrExistsAndStoreCodeVault, hashUnhashedPasswords, checkIfUsernameExistsAndStoreCodeVault }