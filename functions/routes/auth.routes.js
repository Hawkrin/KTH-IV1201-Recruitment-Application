/* eslint-disable */
const { Router } = require('express')
const _ = require('lodash')
const { fullUrl, originalURL } = require('../util/url')
const { check, validationResult } = require('express-validator')
const { formErrorFormatter } = require('../util/errorFormatter')
const authenticated = require('../middleware/auth.middleware')
const jwt = require('jsonwebtoken')

const router = Router()

const { registerUser, loginUser } = require('../controller/person.controller')

router

  /*Login routes*/
  .get('/login', (req, res, next) => {
    res.render('login', {
      error: req.flash('error'),
      form_error: req.flash('form-error'),
    })
  })
  .post(
    '/login',

    [
      check('email', "Doesn't recognize this email").isEmail().normalizeEmail(),
      check('password', 'Password must be entered').exists(),
    ],

    (req, res) => {
      const { email, password } = _.pick(req.body, ['password', 'email'])

      //Form errors.
      const errors = validationResult(req)
      if (errors.errors.length > 0) {
        req.flash('form-error', formErrorFormatter(errors))
        return res.redirect('/auth/login')
      }

      loginUser(email, password)
        .then((person) => {
          const token = jwt.sign(person.person_id, process.env.JWT_TOKEN)

          return res
            .cookie('Authenticate', token)
            .redirect(
              '/iv1201-recruitment-application/us-central1/app/application/application-form',
            )
        })
        .catch((error) => {
          req.flash('error', error)
          return res.redirect(fullUrl(req))
        })
    },
  )

  /*Logout routes*/
  .get('/logout', (req, res, next) => {
    return res.cookie('Authenticate', null).redirect('/auth/login')
  })

  /*Register routes*/
  .get('/register', (req, res) => {
    return res.render('register', {
      error: req.flash('error'),
      form_error: req.flash('form-error'),
    })
  })
  .post(
    '/register',

    [
      check('username', 'Username has to be 3+ characters long')
        .exists()
        .isLength({ min: 3 }),
      check('email', 'Email is not valid').isEmail().normalizeEmail(),
      check('password', 'Password must be entered').exists(),
      check('confirmpassword', 'Password does not match')
        .trim()
        .exists()
        .custom(async (confirmPassword, { req }) => {
          const password = req.body.password

          if (password !== confirmPassword) {
            throw new Error('Password must be same.')
          }
        }),
      check('pnr', 'Enter a valid personal number (8 digits-4 digits)').matches(
        /^\d{8}-\d{4}$/,
      ),
      check('name', 'Enter your first name').exists().isAlpha(),
      check('surname', 'Enter your last name').exists().isAlpha(),
    ],

    (req, res) => {
      const {
        name,
        surname,
        pnr,
        email,
        password,
        confirmpassword,
        role_id,
        username,
      } = _.pick(req.body, [
        'name',
        'surname',
        'pnr',
        'email',
        'password',
        'confirmpassword',
        'role_id',
        'username',
      ])

      //Form errors.
      const errors = validationResult(req)
      if (errors.errors.length > 0) {
        req.flash('form-error', formErrorFormatter(errors))
        return res.redirect('/app/auth/register')
      }

      registerUser(
        name,
        surname,
        pnr,
        email,
        password,
        confirmpassword,
        role_id,
        username,
      )
        .then((person) => {
          if (person) {
            const token = jwt.sign(person._id.toString(), process.env.JWT_TOKEN)
            return res.cookie('Authenticate', token).redirect('/app/')
          }
        })
        .catch((error) => {
          req.flash('error', error)
          return res.redirect('/app/auth/register')
        })
    },
  )

module.exports = router
