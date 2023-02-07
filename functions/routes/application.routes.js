const express = require('express')
const router = express.Router()
const authenticated = require('../middleware/auth.middleware')
const { check, validationResult } = require('express-validator')
const { formErrorFormatter } = require('../util/errorFormatter')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

const { registerAvailability } = require('../controller/application.controller')

/*Application List*/
router.get('/applications', authenticated, (req, res) => {
  res.render('applications', {
    user: req.user,
    error: req.flash('error'),
    form_error: req.flash('form-error'),
  })
})

/*Application-form*/
router.get('/application-form', authenticated, (req, res, next) => {
  res.render('application-form', {
    user: req.user,
    error: req.flash('error'),
    form_error: req.flash('form-error'),
  })
})

router.post(
  '/application-form',
  [
    check(
      'from_date',
      'You have to enter the start date of your availability period',
    ).exists(),
    check(
      'to_date',
      'You have to enter the end date of your availability period',
    ).exists(),
  ],
  (req, res) => {
    const { from_date, to_date } = _.pick(req.body, ['from_date', 'to_date'])

    // Form errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('form-error', formErrorFormatter(errors))
      return res.redirect(
        '/iv1201-recruitmenapp/us-central1/app/application/application-form',
      )
    }

    registerAvailability(from_date, to_date)
      .then((availability) => {
        if (availability) {
          const token = jwt.sign(
            availability.availability_id.toString(),
            process.env.JWT_TOKEN,
          )
          return res.redirect('/')
        }
      })
      .catch((error) => {
        req.flash('error', error)
        return res.redirect(
          '/iv1201-recruitmenapp/us-central1/app/application/application-form',
        )
      })
  },
)

module.exports = router
