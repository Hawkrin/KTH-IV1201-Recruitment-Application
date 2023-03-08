
const { db } = require('../dbconfig');

/**
 * Authenticates a connection to the db
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const connectToDb = (req, res, next) => {
    //db.close()
    db.authenticate()
        .then(() => {
            console.log("Database connection has been established successfully.\n");
            req.db = db;
            next();
        })
        .catch((error) => {
            console.log('Error connecting to database:', error);
            res.status(500)
            .render("500")
            next(error);
        });
};

module.exports =  connectToDb;