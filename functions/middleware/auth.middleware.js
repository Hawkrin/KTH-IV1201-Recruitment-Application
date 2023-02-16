const jwt = require('jsonwebtoken');
const User = require('../model/person.model');
const english = require('../lang/english.lang');
const swedish = require('../lang/swedish.lang');
const Translation = require('../model/translation.model');
const Competence = require('../model/competence.model');
const { db } = require('../db');
const Sequelize = require('sequelize')

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
 * Swaps the values in the Competence table depending on which langugage is choose. Used for internationalization.
 * 
 * @param {String} language 
 */
const updateCompetenceNames = async (language) => {
  await Competence.update(
    { name: Sequelize.literal(`(SELECT ${language} FROM translation WHERE translation.competence_id = competence.competence_id )`) },
    { where: {} }
  );
}


/**
 * Swaps between languages, and saves them to the current session.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const selectLanguage = async (req, res, next) => {
  // Save the code property to a temporary variable
  const code = req.session.code;

  // Perform the language selection logic
  const selectedLanguage = req.query.language || req.session.language || 'english';

  let language;
  let newLanguage;
  if (selectedLanguage === 'english') {
    await updateCompetenceNames('english');
    language = english;
    newLanguage = 'swedish';
  } else if (selectedLanguage === 'swedish') {
    language = swedish;
    newLanguage = 'english';
    await updateCompetenceNames('swedish');
  } else {
    // Default to English
    language = english;
    await updateCompetenceNames('english');
  }

  // Restore the code property to the session object
  if (code) {
    req.session.code = code;
  }

  // Save the language and selectedLanguage properties to the response locals
  res.locals.language = language;
  res.locals.selectedLanguage = selectedLanguage;

  // Call the next middleware in the chain
  next();
};


module.exports =  {authenticated, selectLanguage}
