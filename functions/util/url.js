/* eslint-disable */
function fullUrl(req) {
    return req.protocol + "://" + req.hostname + ":" + process.env.PORT + req.originalUrl;
}

module.exports = { fullUrl }