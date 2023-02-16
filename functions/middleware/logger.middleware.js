const winston = require("winston");

/**
 * Creates a logger which outputs the logs to the files combined.log and error.log
 */
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "warn.log", level: "warn" }),
        new winston.transports.File({ filename: "info.log", level: "info" }),
        new winston.transports.File({ filename: "fake_email.log", level: "info"}),
        new winston.transports.File({ filename: "combined.log" })
    ],
});

/**
 * Logs all requests being done
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const requestLogger = (req, res, next) => {
    logger.info(`${req.method} request made to ${req.url} at ${new Date()}`);
    next();
};

/**
 * Logs all the queries being done
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const queryLogger = (req, res, next) => {
    logger.info(`Executing query: ${req.query} with parameters: ${req.params} at ${new Date().toString()}`);
    next();
};

/**
 * Logs all error which are thrown
 * 
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const errorLogger = (err, req, res, next) => {
    logger.error(`An error occurred: ${err} at ${new Date().toString()}`);
    next(err);
};


/**
 * Keeps watch and logs if a user tries to log on more than 10 times.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const loginAttempts = {};
const loginManyAttemptsLogger = (req, res, next) => {
    const ip = req.ip;

    if (!loginAttempts[ip]) {
        loginAttempts[ip] = 0;
    }

    loginAttempts[ip]++;

    if (loginAttempts[ip] > 10) {
        logger.warn(`Too many login attempts from IP address ${ip} at ${new Date().toString()}`);
    }
    next();
};

const fake_mailLogger = (randomCode, req, res, next) => {
    logger.info(`
        An email has been sent to your registered email address with further instructions to reset your password. 
        Please check your inbox and follow the instructions. If you don't receive an email within a few minutes, 
        please check your spam folder. Your one-time verification code is:  ${randomCode}. 
        This code will expire in 10 minutes. Thank you for using our service.

        Date: ${new Date().toString()}`
    );
    next();
    
    
}

module.exports = { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger, fake_mailLogger };