const english = require('../lang/english.lang');
const swedish = require('../lang/swedish.lang');
const Competence = require('../model/competence.model');
const Sequelize = require('sequelize')

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

    // Save the language and selectedLanguage properties to the response locals
    res.locals.language = language;
    res.locals.selectedLanguage = selectedLanguage;

    // Call the next middleware in the chain
    next();
};


module.exports =  selectLanguage;