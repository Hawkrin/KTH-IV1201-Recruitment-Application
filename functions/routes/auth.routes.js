const { Router } = require("express");
const _ = require("lodash");
const { fullUrl, originalURL } = require("../util/url");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const authenticated = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken")
const english = require('../english.language.env');
const swedish = require('../swedish.language.env');

const router = Router();

const { registerUser, loginUser } = require('../controller/person.controller')

router

    /*Login routes*/
    .get("/login", (req, res, next) => {

        let selectedLanguage = req.query.language || 'english';

        // Select the language
        let language;
        if (selectedLanguage === 'english') {
            language = english;
        } else if (selectedLanguage === 'swedish') {
            language = swedish;
        } else {
            // Default to English
            language = english;
        }
    

        res.render('login', {
            error: req.flash("error"), 
            form_error: req.flash("form-error"),
            language: language
        });
    })

    .post("/login", 
    
    [
        check("username", "Doesn't recognize this username")
            .exists(),
        check("password", "Password must be entered")
            .exists()
    ],

    (req, res) => {
        const {username, password} = _.pick(req.body, ["password", "username"]);

        //Form errors.
        const errors = validationResult(req);
        if (errors.errors.length > 0) {
            req.flash("form-error", formErrorFormatter(errors));
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");
        }

        loginUser(username, password)
            .then((person) => {
                const token = jwt.sign(person.person_id, process.env.JWT_TOKEN);

                return res.cookie("Authenticate", token).redirect("/iv1201-recruitmenapp/us-central1/app/");
                
            })
            .catch((error) => {
                req.flash("error", error);
                return res.redirect(fullUrl(req));
            })

    })

    /*Logout routes*/
    .get("/logout", (req, res, next) => {
        return res.cookie("Authenticate", null).redirect("/iv1201-recruitmenapp/us-central1/app/auth/login");
    })

    /*Register routes*/
    .get("/register", (req, res) => {
        return res.render('register', {
            error: req.flash("error"), 
            form_error: req.flash("form-error")
        });
    })
    .post("/register", 
    
    [
        check("username", "Username has to be 3+ characters long")
            .exists()
            .isLength({min: 3}),
        check("email", "Email is not valid")
            .isEmail()
            .normalizeEmail(),
        check("password", "Password must be entered")
            .exists(),
        check("confirmpassword", "Password does not match")
            .trim()
            .exists()
            .custom(async (confirmPassword, {req}) => {
                const password = req.body.password;

                if (password !== confirmPassword) {
                    throw new Error("Password must be same.");
                }
            }),
        check("pnr", "Enter a valid personal number (8 digits-4 digits)")
            .matches(/^\d{8}-\d{4}$/),
        check("name", "Enter your first name")
            .exists()
            .isAlpha(),
        check("surname", "Enter your last name")
            .exists()
            .isAlpha(),

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
    
            } = _.pick(req.body, ["name", "surname", "pnr", "email","password", "confirmpassword", "role_id", "username"]);
        
        //Form errors.
        const errors = validationResult(req);
        if (errors.errors.length > 0) {
            req.flash("form-error", formErrorFormatter(errors));
            return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/register");
        }

        registerUser(name, surname, pnr, email, password, confirmpassword, role_id, username)
            .then((person) => {
                if(person) {
                    const token = jwt.sign(person.person_id.toString(), process.env.JWT_TOKEN);
                    return res.cookie("Authenticate", token).redirect("/iv1201-recruitmenapp/us-central1/app/");
                }
            })
            .catch((error) => {
                req.flash("error", error);
                return res.redirect("/iv1201-recruitmenapp/us-central1/app/auth/register");
            })
    })

module.exports = router;