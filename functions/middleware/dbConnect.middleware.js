
const { db } = require('../db');

const connectToDb = (req, res, next) => {
    db.authenticate()
        .then(() => {
            req.db = db;
            next();
        })
        .catch((error) => {
            req.flash('error', 'Unable to connect to the database');
            next(error);
        });
};

module.exports = connectToDb;