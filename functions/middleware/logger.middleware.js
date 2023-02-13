const winston = require("winston");

// Initialize a winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" })
    ]
});

// Function that logs incoming requests
const requestLogger = (req, res, next) => {
    logger.info(`${req.method} request made to ${req.url} at ${new Date()}`);
    next();
};

// Function that logs executed queries
const queryLogger = (req, res, next) => {
    logger.info(`Executing query: ${req.query} with parameters: ${req.params}`);
    next();
};

module.exports = { requestLogger, queryLogger };