const { Router } = require("express");
const _ = require("lodash");
const { fullUrl, originalURL } = require("../util/url");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const { selectLanguage } = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken")
const { registerUser, loginUser, changePassword } = require('../controller/person.controller')

const router = Router()

router.use(selectLanguage);

router

  /*Login routes*/
  .get("/login", (req, res, next) => {

      res.render('login', {
          error: req.flash("error"), 
          form_error: req.flash("form-error"),
      });
  })

  .post("/login", 
  [
    check("usernameOrEmail", "Username or email must be entered")
      .exists(),
    check("password", "Password must be entered")
      .exists()
  ],
  (req, res) => {
    const {usernameOrEmail, password} = _.pick(req.body, ["password", "usernameOrEmail"]);
    const errors = validationResult(req);
  
    if (errors.errors.length > 0) {
      req.flash("form-error", formErrorFormatter(errors));
      return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");
    }
  
    loginUser(usernameOrEmail, password)
      .then((person) => {
        const token = jwt.sign(person.person_id, process.env.JWT_TOKEN);
        return res
          .cookie("Authenticate", token)
          .redirect("/iv1201-recruitmenapp/us-central1/app/application/application-form");
      })
      .catch((error) => {
        req.flash("error", error);
        return res.redirect(fullUrl(req));
      });
  })

  /*Logout routes*/
  .get('/logout', (req, res, next) => {
    return res
      .cookie('Authenticate', null)
      .redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
  })

  /*Forgotten password routes*/
  .get("/forgotten-password", (req, res, next) => {

    res.render('forgotten-password', {
        error: req.flash("error"), 
        form_error: req.flash("form-error"),
    });
  })

  .post("/forgotten-password",
  [
    check('pnr', 'Enter a valid personal number (8 digits-4 digits)').matches(
      /^\d{8}-\d{4}$/,
    ),
    check("password", "Password must be entered")
        .exists(),
    check('confirmpassword', 'Password does not match')
      .trim()
      .exists()
      .custom((confirmpassword, { req }) => {
        return new Promise((resolve, reject) => {
          const password = req.body.password

          if (password !== confirmpassword) {
            reject(new Error('Password must be same.'))
          } else {
            resolve()
          }
        })
      }),
  ], 
  
  (req, res) => {

      const {pnr, password, confirmpassword} = _.pick(req.body, ["pnr", "password", "confirmpassword"]);

    //Form errors.
    const errors = validationResult(req)
    if (errors.errors.length > 0) {
      req.flash('form-error', formErrorFormatter(errors))
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password')
    }

    changePassword(pnr, password, confirmpassword)
      .then(() => {
        console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS" + pnr, password, confirmpassword)
        req.flash("success", "Password successfully updated!")
        res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login');
      })
      .catch((error) => {
        req.flash("form-error", error.message);
        res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password');
      })
  })


  /*Register routes*/
  .get("/register", (req, res) => {

    return res.render('register', {
      error: req.flash('error'),
      form_error: req.flash('form-error'),
    });
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
        .custom(async (confirmpassword, { req }) => {
          const password = req.body.password

          if (password !== confirmpassword) {
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
        return res.redirect(
          '/iv1201-recruitmenapp/us-central1/app/auth/register',
        )
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
            const token = jwt.sign(
              person.person_id.toString(),
              process.env.JWT_TOKEN,
            )
            return res
              .cookie('Authenticate', token)
              .redirect('/iv1201-recruitmenapp/us-central1/app/application/application-form')
          }
        })
        .catch((error) => {
          req.flash('error', error)
          return res.redirect(
            '/iv1201-recruitmenapp/us-central1/app/auth/register',
          )
        })
    },
  )

module.exports = router
