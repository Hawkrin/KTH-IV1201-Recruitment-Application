/* eslint-disable */
const jwt = require("jsonwebtoken");
const User = require("../model/user.model")

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

        User.findById(_id)
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