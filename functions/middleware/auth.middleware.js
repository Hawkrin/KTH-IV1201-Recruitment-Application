const jwt = require('jsonwebtoken');
const User = require('../model/person.model');
const english = require('../lang/english.lang');
const swedish = require('../lang/swedish.lang');

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
 * Swaps between languages, and saves them to the current session.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const selectLanguage = (req, res, next) => {
  let selectedLanguage = req.query.language || req.session.language || 'english';

  let language;
  if (selectedLanguage === 'english') {
    language = english;
  } else if (selectedLanguage === 'swedish') {
    language = swedish;
  } else {
    // Default to English
    language = english;
  }

  req.session.language = selectedLanguage;
  res.locals.language = language;
  res.locals.selectedLanguage = selectedLanguage;

  next();
}



module.exports =  {authenticated, selectLanguage}
