/* eslint-disable */
function fullUrl(req) {
    return req.protocol + "://" + req.hostname + ":" + process.env.PORT + req.originalUrl;
}

const originalURL = "/iv1201-recruitment-application/us-central1/app";

const dataBaseConnectionString = "postgres://" + process.env.USER + ":" + process.env.PASSWORD + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME;


module.exports = { fullUrl, originalURL, dataBaseConnectionString }