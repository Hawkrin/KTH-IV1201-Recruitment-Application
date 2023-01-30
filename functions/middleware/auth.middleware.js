/* eslint-disable */
const jwt = require("jsonwebtoken");
const User = require("../model/person.model")

/**
 * Function used for authorizing users, verifies JWTs
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const authorization = function(req, res, next) {
    const token = req.cookies.Authenticate;

    if (token == null) {
        return res.sendStatus(401).redirect("/auth/login");
    }

    jwt.verify(token, process.env.JWT_TOKEN, (err, _id) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403).redirect("/auth/login");
        }

        User.findOne({
            where: { person_id : _id }
            })
            .then((user) => {
                req.user = user; 
                next();
            })
            .catch((error) => {
                console.log(error);
                next();
            })
    })
}

module.exports = authorization;