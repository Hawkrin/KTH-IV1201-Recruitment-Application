const { Router } = require("express");
const _ = require("lodash");
const { fullUrl, originalURL } = require("../util/url");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const selectLanguage  = require('../middleware/languageChanger.middleware')
const jwt = require("jsonwebtoken")
const { registerUser, loginUser, changePassword, checkIfPnrExistsAndStoreCodeVault } = require('../controller/person.controller')
const { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger, fake_mailLogger } = require("../middleware/logger.middleware");
const {db} = require('../db'); 
const Person = require('../model/person.model');
const Code_Vault = require('../model/code_vault.model');
const Sequelize = require('sequelize');

const router = Router()

router.use(requestLogger, queryLogger, errorLogger, selectLanguage, loginManyAttemptsLogger, fake_mailLogger);

router

  /*Login routes*/
  .get("/login", (req, res, next) => {

      res.render('login', {
          error: req.flash("error"), 
          form_error: req.flash("form-error"),
          success: req.flash('success'),
          cookie: null
      });
  })

  .post("/login", 

  [
    check("usernameOrEmail", "Can't find a valid username or email")
      .not()
      .isEmpty()
      .custom(async (usernameOrEmail) => {
        const user = await Person.findOne({
          where: {
            [Sequelize.Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
          }
        });
        if (!user) {
          throw new Error('The email or username doesnt exist');
        }
      }),
    check("password", "Password must be entered")
      .not()
      .isEmpty()
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
          req.flash('error', 'Login Failed, check your login credentials')
          errorLogger(error, req, res, () => {
            return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login');
          });
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
        success: req.flash('success'),
        form_error: req.flash("form-error"),
        cookie: null

    });
  })

  .post('/forgotten-password-part1', 
  [
    check('pnr', 'Enter a valid personal number (8 digits-4 digits)')
      .matches(/^\d{8}-\d{4}$/)
      .custom(async (pnr) => {
        const user = await Person.findOne({ where: { pnr: pnr } });
        if (!user) {
          throw new Error('Personal number is not registered');
        }
      })
  ],
  
  async (req, res) => {
    const { pnr } = _.pick(req.body, ['pnr']);
  
    //Form errors.
    const errors = validationResult(req);
    if (errors.errors.length > 0) {
      req.flash('form-error', formErrorFormatter(errors));
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part1');
    }

    try {
      await db.transaction(async (t) => {
        const codeVault = await checkIfPnrExistsAndStoreCodeVault(pnr);
        if (codeVault) {
          console.log('Promise resolved');
          const randomCode = codeVault.code;
          req.flash('success', 'A code has been sent to your email.');
          fake_mailLogger(randomCode, req, res, () => {
            res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part2');
          });
        } else {
          throw new Error('Code Vault not created');
        }
      });
    } catch (error) {
      console.log('Promise rejected');
      req.flash('error', 'The entered personal number cant be found');
      return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part1');
    }
  })

  .get("/forgotten-password-part2", (req, res, next) => {

    res.render('forgotten-password-part2', {
        error: req.flash("error"), 
        success: req.flash('success'),
        form_error: req.flash("form-error"),
        cookie: null

    });
  })

  .post("/forgotten-password-part2", 
  
  [
    check('code', 'Enter a valid code')
      .exists()
      .not()
      .isEmpty()
      .custom(async (code) => {
        const codeVault = await Code_Vault.findOne({ where: { code: code } });
        if (!codeVault) {
          throw new Error('Code is not valid');
        }
      }),
    check("password", "Password must be entered")
      .not()
      .isEmpty(),
    check('confirmpassword', 'Password does not match')
      .trim()
      .exists()
      .not().isEmpty()
      .custom((confirmpassword, { req }) => {
        return new Promise((resolve, reject) => {
          const password = req.body.password;

          if (password !== confirmpassword) {
            reject(new Error('error', 'Password must be same.'));
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
            req.flash('success', 'Password changed successfully. Please login with your new password.');
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");

          })
          .catch((error) => {
            console.error("Transaction failed: ", error);
            req.flash('error', 'Make sure that you have entered the right code')
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/forgotten-password-part2");
          });
      })
  })

  /*Register routes*/
  .get("/register", (req, res) => {

    return res.render('register', {
      error: req.flash('error'),
      form_error: req.flash('form-error'),
      success: req.flash('success'),
      cookie: null

    });
  })

  .post(
    '/register',

    [
      check('username', 'Username has to be 3+ characters long')
        .exists()
        .isLength({ min: 3 })
        .custom(async (username) => {
          const user = await Person.findOne({ where: { username } })
          if (user) {
            throw new Error('Username is already taken')
          }
        }),
      check('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email is not valid')
        .normalizeEmail()
        .custom(async (email) => {
          const user = await Person.findOne({ where: { email } })
          if (user) {
            throw new Error('Email is already registered')
          }
        }),
      check('password', 'Password must be entered')
        .not() 
        .isEmpty(),
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
      check('pnr', 'Enter a valid personal number (8 digits-4 digits)')
        .matches(/^\d{8}-\d{4}$/)
        .custom(async (pnr) => {
          const user = await Person.findOne({ where: { pnr } })
          if (user) {
            throw new Error('Personal number is already registered')
          }
        }),
      check('name', 'Enter your first name')
        .exists()
        .isAlpha(),
      check('surname', 'Enter your last name')
        .exists()
        .isAlpha(),
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
              // const token = jwt.sign(person.person_id.toString(), process.env.JWT_TOKEN)
              req.flash('success', 'Your account has been created, please login');
              return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/login')
            }
          })
          .catch((error) => {
            console.error('Transaction failed: ', error)
            req.flash('error', "There're problems registering your account at this moment, please try again.")
            return res.redirect('/iv1201-recruitmenapp/us-central1/app/auth/register')
          })
      })
    },
  )

module.exports = router
