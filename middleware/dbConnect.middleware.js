
const { db } = require('../dbconfig');

/**
 * Authenticates a connection to the db
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const connectToDb = (req, res, next) => {
    db.authenticate()
        .then(() => {
            req.db = db;
            next();
        })
        .catch((error) => {
            console.error('Error connecting to database:', error);
            req.flash('error', 'Unable to connect to the database');
            next();
        });
};


module.exports = connectToDb;