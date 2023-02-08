const { db } = require('../db');

const connectToDb = (req, res, next) => {
    req.db = db;
    next();
};

module.exports = connectToDb;