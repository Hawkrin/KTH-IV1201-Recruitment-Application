const jwt = require('jsonwebtoken');
const User = require('../model/person.model');

/**
 * Function used for authorizing users, verifies JWTs
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const authenticated = function (req, res, next) {
  const token = req.cookies.Authenticate

  if (token == null) {
    return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
  }

  jwt.verify(token, process.env.JWT_TOKEN, (err, _id) => {
    if (err) {
      console.log(err)
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
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
 *  implements role-based access control (RBAC) - so only admins can access some routes.
 * @param {Integer} roleId the role_id of the user
 * @returns 
 */
function adminAccess(roleId) {
  return function(req, res, next) {
    console.log(req.user.role_id)
    if (req.user.role_id !== roleId) {
      return res.status(403)
      .cookie('Authenticate', null)
      .redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
      
    }
    next();
  }
}


module.exports =  { authenticated, adminAccess };

