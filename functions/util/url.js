/* eslint-disable */
function fullUrl(req) {
    return req.protocol + "://" + req.hostname + ":" + process.env.PORT + req.originalUrl;
}

const originalURL = "/iv1201-recruitment-application/us-central1/app";


module.exports = { fullUrl, originalURL }