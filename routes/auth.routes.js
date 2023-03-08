const { Router } = require("express");
const _ = require("lodash");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const selectLanguage = require('../middleware/languageChanger.middleware')
const jwt = require("jsonwebtoken")
const { registerUser, loginUser, changePassword, checkIfPnrExistsAndStoreCodeVault, checkIfUsernameExistsAndStoreCodeVault } = require('../controller/person.controller')
const { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger, fake_mailLogger } = require("../middleware/logger.middleware");
const { db } = require('../dbconfig');
const Person = require('../model/person.model');
const Code_Vault = require('../model/code_vault.model');
const Sequelize = require('sequelize');
const {
  auth_LOGIN,
  auth_REGISTER,
  auth_FORGET_PASSWORD_1,
  auth_FORGET_PASSWORD_2,
  auth_FORGET_PASSWORD_ADMIN,
  application_APPLICATION_FORM,
  application_APPLICATIONS
} = require("../util/url");

const router = Router()

router.use(requestLogger, queryLogger, errorLogger, selectLanguage, loginManyAttemptsLogger, fake_mailLogger);

router

  .get("/", (req, res, next) => {

    res.redirect(auth_LOGIN);

  })

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
      const { usernameOrEmail, password } = _.pick(req.body, ["password", "usernameOrEmail"]);
      const errors = validationResult(req);

      if (errors.errors.length > 0) {
        req.flash("form-error", formErrorFormatter(errors));
        return res.redirect(auth_LOGIN);
      }

      await db.transaction(t => {
        loginUser(usernameOrEmail, password)
          .then((user) => {

            if (user.role_id == "1") {
              const token = jwt.sign(user.person_id, process.env.JWT_TOKEN);
              return res
                .status(200)
                .cookie("Authenticate", token)
                .redirect(application_APPLICATIONS);
            }
            if (user.role_id == "2") {
              const token = jwt.sign(user.person_id, process.env.JWT_TOKEN);
              return res
                .status(200)
                .cookie("Authenticate", token)
                .redirect(application_APPLICATION_FORM);
            }

          })
          .catch((error) => {
            req.flash('error', 'Login Failed, check your login credentials')
            errorLogger(error, req, res, () => {
              return res.redirect(auth_LOGIN);
            });
          });

      });
    })

  /*Logout routes*/
  .get('/logout', (req, res, next) => {
    return res
      .cookie('Authenticate', null)
      .redirect(auth_LOGIN)
  })

  /*Forgotten password routes*/
  .get("/forgotten-password-part1", (req, res, next) => {

    res.render("forgotten-password-part1", {
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
        return res.redirect(auth_FORGET_PASSWORD_1);
      }

      try {
        await db.transaction(async (t) => {
          const codeVault = await checkIfPnrExistsAndStoreCodeVault(pnr);
          if (codeVault) {
            console.log('Promise resolved');
            const randomCode = codeVault.code;
            req.flash('success', 'A code has been sent to your email.');


            fake_mailLogger(randomCode, req, res, () => {

              res.redirect('./forgotten-password-part2');
              req.flash('success', 'A code has been sent to your email.');

            });
          } else {
            throw new Error('Code Vault not created');
          }
        });
      } catch (error) {
        errorLogger(error, req, res, () => {
          req.flash('error', 'The entered personal number cant be found');
          return res.redirect(auth_FORGET_PASSWORD_1);
        });
      }
    })

  .get("/forgotten-password-part2", (req, res, next) => {

    res.render("forgotten-password-part2", {
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

      const { code, password, confirmpassword } = _.pick(req.body, [
        "code",
        "password",
        "confirmpassword",
      ]);

      // Form errors.
      const errors = validationResult(req);
      if (errors.errors.length > 0) {
        req.flash("form-error", formErrorFormatter(errors));
        return res.redirect(auth_FORGET_PASSWORD_2);
      }

      await db.transaction((t) => {
        return changePassword(code, password)
          .then(() => {
            req.flash('success', 'Password changed successfully. Please login with your new password.');
            return res.redirect(auth_LOGIN);

          })
          .catch((error) => {
            errorLogger(error, req, res, () => {
              req.flash('error', 'Make sure that you have entered the right code')
              return res.redirect(auth_FORGET_PASSWORD_2);
            });
          });
      })
    })

  .get("/forgotten-password-admin", (req, res, next) => {

    res.render("forgotten-password-admin", {
      error: req.flash("error"),
      success: req.flash('success'),
      form_error: req.flash("form-error"),
      cookie: null

    });
  })

  .post('/forgotten-password-admin',

    [
      check('username', 'Enter a valid username')
        .exists()
        .isLength({ min: 3 })
        .custom(async (username) => {
          const user = await Person.findOne({ where: { username: username } });
          if (!user) {
            throw new Error('User does not exist');
          }
          if (user.role_id !== 1) {
            throw new Error('User is not an admin');
          }
        })
    ],

    async (req, res) => {
      const { username } = _.pick(req.body, ['username'])



      //Form errors.
      const errors = validationResult(req);
      if (errors.errors.length > 0) {
        req.flash('form-error', formErrorFormatter(errors));
        return res.redirect(auth_FORGET_PASSWORD_ADMIN);
      }

      try {
        await db.transaction(async (t) => {
          const codeVault = await checkIfUsernameExistsAndStoreCodeVault(username);
          if (codeVault) {
            console.log('Promise resolved');
            const randomCode = codeVault.code;
            req.flash('success', 'A code has been sent to your email.');
            fake_mailLogger(randomCode, req, res, () => {
              res.redirect(auth_FORGET_PASSWORD_2);
            });
          } else {
            throw new Error('Code Vault not created');
          }
        });
      } catch (error) {
        errorLogger(error, req, res, () => {
          req.flash('error', 'The entered username cant be found');
          return res.redirect(auth_FORGET_PASSWORD_ADMIN);
        });
      }
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

  .post('/register',

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
        return res.redirect(auth_REGISTER)
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
              req.flash('success', 'Your account has been created, please login');
              return res.redirect(auth_LOGIN)
            }
          })
          .catch((error) => {
            errorLogger(error, req, res, () => {
              req.flash('error', "There're problems registering your account at this moment, please try again.")
              return res.redirect(auth_REGISTER)
            })
          })
      })
    },
  )

module.exports = router
