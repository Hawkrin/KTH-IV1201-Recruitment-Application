const express = require('express');
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require('../util/errorFormatter');
const _ = require('lodash');
const { requestLogger, queryLogger, errorLogger } = require('../middleware/logger.middleware');
const { authenticated, adminAccess } = require('../middleware/auth.middleware');
const selectLanguage = require('../middleware/languageChanger.middleware');
const { registerAvailability, registerCompetence, calculate, getAllCompetences, getAllAvailability, getAllApplicant, getAllApplicationsStatus } = require('../controller/application.controller');
const { db } = require('../dbconfig');
const { application_APPLICATION_FORM, application_APPLICATIONS, application_SENT_APPLICATION } = require("../util/url");

const router = express.Router();

router.use(authenticated, selectLanguage, requestLogger, queryLogger, errorLogger);

const requireRole1 = adminAccess(1);

router

  /*Show-Application*/
  .get('/show-application', requireRole1, async (req, res) => {
    res.render('show-application', {
      user: req.user,
      cookie: req.session.cookie,
    })
  })

  /*Application List*/
  .get('/applications', requireRole1, async (req, res, next) => {
    const availability = await getAllAvailability();
    const applicant = await getAllApplicant();
    const applicationsStatus = await getAllApplicationsStatus();

    const applicationsData = availability
      .flatMap(avail => {
        const applicantData = applicant.find(a => a.person_id === avail.person_id);
        const statusData = applicationsStatus.find(s => s.availability_id === avail.availability_id && s.person_id === avail.person_id);
        return applicantData && statusData ? [{ applicant: applicantData, availability: avail, applicationsStatus: statusData }] : [];
      });

    res.render('applications', {
      user: req.user,
      availability: availability,

      applicationsData: applicationsData,
      cookie: req.session.cookie,
    })
  })

  .post('/applications', requireRole1,

    async (req, res) => {
      return res.redirect(application_APPLICATIONS);
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
      cookie: req.session.cookie,
    });

  })

  .post('/application-form',
    [
      check('from_date', 'You have to enter the start date of your availability period')
        .isDate(),
      check('to_date', 'You have to enter the end date of your availability period',)
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
        return res.redirect(application_APPLICATION_FORM)
      }

      try {
        await db.transaction(async (t) => {

          for (const competenceId of competences) {
            const isChecked = req.body.competences.includes(competenceId);

            if (isChecked) {
              const startDate = req.body[`start_date_${competenceId}`];
              const endDate = req.body[`end_date_${competenceId}`];
              const yearsOfExperience = calculate(startDate, endDate);

              if (!startDate && !endDate) {
                req.flash('competence_error', "Enter experience")
              }
              await registerCompetence(person_id, competenceId, yearsOfExperience);
            }
          }
        })
        await db.transaction((t) => {
          registerAvailability(person_id, from_date, to_date)
            .then(() => { })
            .catch(() => { })
        })

        res.redirect(application_SENT_APPLICATION);

      } catch (error) {
        errorLogger(error, req, res, () => {
          req.flash('error', "Fill out the form correctly")
          return res.redirect(application_APPLICATION_FORM)
        })
      }

    })

  /*Show-Application*/
  .get('/application-sent', async (req, res) => {
    res.render('application-sent', {
      user: req.user,
      cookie: req.session.cookie,
    })
  })

module.exports = router
