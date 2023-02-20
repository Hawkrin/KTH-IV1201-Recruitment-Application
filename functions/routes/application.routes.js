const express = require('express');
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require('../util/errorFormatter');
const _ = require('lodash');
const { requestLogger, queryLogger, errorLogger } = require('../middleware/logger.middleware');
const authenticated = require('../middleware/auth.middleware');
const  selectLanguage  = require('../middleware/languageChanger.middleware');
const { registerAvailability, registerCompetence, calculate, getAllCompetences } = require('../controller/application.controller');
const {db} = require('../db');

const router = express.Router();

router.use(authenticated, selectLanguage, requestLogger, queryLogger, errorLogger);

router
  /*Application List*/
  .get('/applications', (req, res) => {
    res.render('applications', {
      user: req.user,
      error: req.flash('error'),
      form_error: req.flash('form-error'),
      cookie: req.session.cookie
    });
  })

  /*Application-form*/
  .get('/application-form', async (req, res, next) => {
    const competences = await getAllCompetences();

    res.render('application-form', {
      user: req.user,
      success: req.flash('success'),
      error: req.flash('error'),
      form_error: req.flash('form-error'),
      competence_error: req.flash('competence_error'),
      competences: competences,
      cookie: req.session.cookie
    });
  })

  .post('/application-form', 
  [
    check('from_date', 'You have to enter the start date of your availability period')
      .isDate(),
    check('to_date','You have to enter the end date of your availability period',)
      .isDate(),

  ], 
  
  async (req, res) => {
    const { person_id } = _.pick(req.user, ['person_id'])
    const { from_date, to_date } = _.pick(req.body, ['from_date', 'to_date'])
    const competences = req.body.competences || []

    // Form errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('form-error', formErrorFormatter(errors))
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/application/application-form')
    }
  
    try {

      await db.transaction(async (t) => { 

        for (const competenceId of competences) {
          const isChecked = req.body.competences.includes(competenceId);

          if (isChecked) {
            const startDate = req.body[`start_date_${competenceId}`];
            const endDate = req.body[`end_date_${competenceId}`];
            const yearsOfExperience = calculate(startDate, endDate);

            if(!startDate || !endDate ) {
              competenceErrors.push("If a competence is chosen, then also set the years of experience");
              req.flash('error', "Fill out the form correctly")
            }
            
            if (competenceErrors.length > 0) {
              competenceErrorArray.push(competenceErrors);
              req.flash('error', "Fill out the form correctly")
            }

            await registerCompetence(person_id, competenceId, yearsOfExperience);
          }
        }
      })
  
      // Register new availability
      await db.transaction((t) => {
        registerAvailability(person_id, from_date, to_date)
          .then(() => {})
          .catch(() => {})
      })

      req.flash('success', 'Your application was sent successfully')
      res.redirect('/iv1201-recruitmenapp/us-central1/app/application/application-form')

    } catch (error) {
        req.flash('error', "Fill out the form correctly")
        console.log(error.message)
        return res.redirect('/iv1201-recruitmenapp/us-central1/app/application/application-form')
    }
  })
  
module.exports = router
