const express = require('express')
const router = express.Router()
const authenticated = require('../middleware/auth.middleware')
const { check, validationResult } = require('express-validator')
const { formErrorFormatter } = require('../util/errorFormatter')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

const { registerAvailability } = require('../controller/application.controller')

router
  /*Application List*/
  .get('/applications', authenticated, (req, res) => {
    res.render('applications', {
      user: req.user,
      error: req.flash('error'),
      form_error: req.flash('form-error'),
    })
  })

  /*Application-form*/
  .get('/application-form', authenticated, (req, res, next) => {
    res.render('application-form', {
      user: req.user,
      error: req.flash('error'),
      form_error: req.flash('form-error'),
    })
  })
  .post(
    '/application-form',
    authenticated,
    [
      check(
        'from_date',
        'You have to enter the start date of your availability period',
      ).isDate(),
      check(
        'to_date',
        'You have to enter the end date of your availability period',
      ).isDate(),
    ],
    (req, res) => {
      const { person_id } = _.pick(req.user, ['person_id'])
      const { from_date, to_date } = _.pick(req.body, ['from_date', 'to_date'])

      // Form errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('form-error', formErrorFormatter(errors))
        return res.redirect(
          '/iv1201-recruitmenapp/us-central1/app/application/application-form',
        )
      }
      registerAvailability(person_id, from_date, to_date)
        .then((newAvailability) => {
          res.json({
            success: true,
            data: newAvailability,
          })
        })
        .catch((error) => {
          req.flash('error', error.message)
          return res.redirect(
            '/iv1201-recruitmenapp/us-central1/app/application/application-form',
          )
        })
    },
  )

module.exports = router
