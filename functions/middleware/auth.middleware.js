const jwt = require('jsonwebtoken');
const User = require('../model/person.model');
const english = require('../lang/english.lang');
const swedish = require('../lang/swedish.lang');
const Translation = require('../model/translation.model');

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

const changeLanguage = async (selectedLanguage, newLanguage) => {
  try {
    // Find all translations with the selected language
    const translations = await Translation.findAll({
      where: { language: selectedLanguage }
    });

    // Update the language field for each translation to the new language
    await Promise.all(translations.map(async (translation) => {
      translation.language = newLanguage;
      await translation.save();
    }));

    console.log(`Successfully updated ${translations.length} translations from ${selectedLanguage} to ${newLanguage}`);
  } catch (error) {
    console.error(`Error updating translations: ${error}`);
  }
};

/**
 * Swaps between languages, and saves them to the current session.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const selectLanguage = (req, res, next) => {

  // Save the code property to a temporary variable
  const code = req.session.code;

  // console.log("ÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅ" + JSON.stringify(req.session))
  // console.log("ÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅ" + code)
  // console.log("ÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅÅ" + req.session.code + "\n")

  // Perform the language selection logic
  const selectedLanguage = req.query.language || req.session.language || 'english';

  let language;
  if (selectedLanguage === 'english') {
    language = english;
    changeLanguage('swedish', 'english');
  } else if (selectedLanguage === 'swedish') {
    language = swedish;
    changeLanguage('english', 'swedish');
  } else {
    // Default to English
    language = english;
    changeLanguage('swedish', 'english');
  }

  

  // Restore the code property to the session object
  if (code) {
    req.session.code = code;
  }

  // Save the language and selectedLanguage properties to the response locals
  res.locals.language = language;
  res.locals.selectedLanguage = selectedLanguage;

  // console.log("ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ" +JSON.stringify(req.session))
  // console.log("ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ" +code)
  // console.log("ÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖÖ" +req.session.code + "\n")

  // Call the next middleware in the chain
  next();
};


module.exports =  {authenticated, selectLanguage}
