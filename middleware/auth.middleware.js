const jwt = require('jsonwebtoken');
const User = require('../model/person.model');
const { application_APPLICATION_FORM, auth_LOGIN } = require("../util/url");


/**
 * Function used for authorizing users, verifies JWTs which are given when login.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const authenticated = (req, res, next) => {
  const token = req.cookies.Authenticate

  if (token == null) {
    return res.redirect(auth_LOGIN)
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, _id) => {
    if (err) {
      console.log(err)
      return res.redirect(auth_LOGIN)
    }

    User.findOne({
      where: { person_id: _id },
    })
      .then((user) => {
        req.user = user
        next()
      })
      .catch((error) => {
        console.log(error)
        next()
      })
  })
}

/**
 *  Implements role-based access control (RBAC) - so only admins can access some routes.
 * @param {Integer} roleId the role_id of the user
 * @returns 
 */
const adminAccess = (roleId) => {
  return function(req, res, next) {
    if (req.user.role_id !== roleId) {
      return res.status(403)
      .redirect(application_APPLICATION_FORM)   
    }
    next();
  }
}

module.exports =  { authenticated, adminAccess };

