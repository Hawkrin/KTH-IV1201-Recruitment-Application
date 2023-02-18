const { Router } = require("express");
const _ = require("lodash");
const { fullUrl, originalURL } = require("../util/url");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const { selectLanguage, setCodeToSession } = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken")
const { registerUser, loginUser, changePassword, checkIfPnrExistsAndStoreCodeVault } = require('../controller/person.controller')
const { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger, fake_mailLogger } = require("../middleware/logger.middleware");
const {db} = require('../db'); 


const router = Router()

router.use(requestLogger, queryLogger, errorLogger, selectLanguage, loginManyAttemptsLogger, fake_mailLogger);

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
    check("usernameOrEmail", "Can't find a valid username or email")
      .not().isEmpty(),
    check("password", "Password must be entered")
      .not().isEmpty()
  ],
  
  async (req, res) => {
    const {usernameOrEmail, password} = _.pick(req.body, ["password", "usernameOrEmail"]);
    const errors = validationResult(req);

    if (errors.errors.length > 0) {
      req.flash("form-error", formErrorFormatter(errors));
      return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");
    }
  
    await db.transaction(t => {
      loginUser(usernameOrEmail, password)
        .then((person) => {
          const token = jwt.sign(person.person_id, process.env.JWT_TOKEN);
          return res
            .cookie("Authenticate", token)
            .redirect("/iv1201-recruitmenapp/us-central1/app/application/application-form");
        })
        .catch((error) => {
          console.error('Transaction failed: ', error)
          t.rollback()
          req.flash('Problem communicatiing with the database')
          return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login');
        });
    });
  })

  /*Logout routes*/
  .get('/logout', (req, res, next) => {
    return res
      .cookie('Authenticate', null)
      .redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
  })

  /*Forgotten password routes*/
  .get("/forgotten-password-part1", (req, res, next) => {

    res.render('forgotten-password-part1', {
        error: req.flash("error"), 
        form_error: req.flash("form-error"),
    });
  })

  .post('/forgotten-password-part1', 
  [
    check('pnr', 'Enter a valid personal number (8 digits-4 digits)').matches(/^\d{8}-\d{4}$/),
  ],
  
  async (req, res) => {
    const { pnr } = _.pick(req.body, ['pnr']);
  
    //Form errors.
    const errors = validationResult(req);
    if (errors.errors.length > 0) {
      req.flash('form-error', formErrorFormatter(errors));
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part1');
    }
  
    checkIfPnrExistsAndStoreCodeVault(pnr)
      .then((codeVault) => {
        if (codeVault) {
          console.log('Promise resolved');
          res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part2');
        } else {
          throw new Error('Code Vault not created');
        }
      })
      .catch((error) => {
        console.log('Promise rejected');
        req.flash('Problem communicating with the database');
        return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part1');
      });

  })

  .get("/forgotten-password-part2", (req, res, next) => {

    res.render('forgotten-password-part2', {
        error: req.flash("error"), 
        form_error: req.flash("form-error"),
    });
  })

  .post("/forgotten-password-part2", 
  
  [
    check('code', 'Enter a valid code')
      .exists()
      .not().isEmpty(),
    check("password", "Password must be entered").not().isEmpty(),
    check('confirmpassword', 'Password does not match')
      .trim()
      .exists()
      .not().isEmpty()
      .custom((confirmpassword, { req }) => {
        return new Promise((resolve, reject) => {
          const password = req.body.password;

          if (password !== confirmpassword) {
            reject(new Error('Password must be same.'));
          } else {
            resolve();
          }
        });
      }),
  ], 
  
  async (req, res) => {

    const { code, password, confirmpassword} = _.pick(req.body, [
      "code",
      "password",
      "confirmpassword",
    ]);

    // Form errors.
    const errors = validationResult(req);
    if (errors.errors.length > 0) {
      req.flash("form-error", formErrorFormatter(errors));
      return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part2");
    }

    await db.transaction((t) => {
        return changePassword(code, password)
          .then(() => {
            req.flash(
              "success",
              "Password changed successfully. Please login with your new password."
            );
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");

          })
          .catch((error) => {
            console.error("Transaction failed: ", error);
            t.rollback();
            req.flash('Problem communicatiing with the database')
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part2");
          });
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
      check('password', 'Password must be entered').not().isEmpty(),
      check('confirmpassword', 'Password does not match')
        .trim()
        .exists()
        .not().isEmpty()
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

    async (req, res) => {
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
        return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/register')
      }

      await db.transaction(t => {
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
              const token = jwt.sign(person.person_id.toString(), process.env.JWT_TOKEN)
              return res
                .cookie('Authenticate', token)
                .redirect('/iv1201-recruitmenapp/us-central1/app/application/application-form')
            }
          })
          .catch((error) => {
            console.error('Transaction failed: ', error)
            t.rollback()
            req.flash('Problem communicatiing with the database')
            return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/register')
          })
      })
    },
  )

module.exports = router
