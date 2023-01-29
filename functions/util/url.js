/* eslint-disable */
function fullUrl(req) {
    return req.protocol + "://" + req.hostname + ":" + process.env.PORT + req.originalUrl;
}

const originalURL = "/iv1201-recruitment-application/us-central1/app";

const dataBaseConnectionString = "mongodb+srv://" + process.env.USER + ":" + process.env.PASSWORD + "@cluster0.5mad5tg.mongodb.net/?retryWrites=true&w=majority";


module.exports = { fullUrl, originalURL, dataBaseConnectionString }