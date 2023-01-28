/* eslint-disable */
const { Router } = require("express");
const _ = require("lodash");
const { fullUrl, originalURL } = require("../util/url");
const { check, validationResult } = require('express-validator');
const { formErrorFormatter } = require("../util/errorFormatter");
const authenticated = require("../middleware/auth.middleware");
const jwt = require("jsonwebtoken")

const router = Router();

const { registerUser, loginUser } = require('../controller/user.controller')

router

    //Login routes
    .get("/login", (req, res, next) => {

        res.render('login', {
            error: req.flash("error"), 
            form_error: req.flash("form-error")
        });
    })
    .post("/login", 
    
    [
        check("email", "Doesn't recognize this email")
            .isEmail()
            .normalizeEmail(),
        check("password", "Password must be entered")
            .exists()
    ],

    (req, res) => {
        const {email, password} = _.pick(req.body, ["password", "email"]);

        //Form errors.
        const errors = validationResult(req);
        if (errors.errors.length > 0) {
            req.flash("form-error", formErrorFormatter(errors));
            return res.redirect("/auth/login");
        }

        loginUser(email, password)
            .then((user) => {
                const token = jwt.sign(user._id.toString(), process.env.JWT_TOKEN);
                return res.cookie("Authenticate", token).redirect("/");
                
            })
            .catch((error) => {
                req.flash("error", error);
                return res.redirect(fullUrl(req));
            })

    })

    //Logout routes
    .get("/logout", (req, res, next) => {
        return res.cookie("Authenticate", null).redirect("/auth/login");
    })

    //Register routes
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
        check("personal_number", "Enter your personal number")
            .exists()
            .isNumeric(),
            // .isLength(12),
        check("first_name", "Enter your first name")
            .exists()
            .isAlpha(),
        check("last_name", "Enter your last name")
            .exists()
            .isAlpha(),

    ],
    
    
    (req, res) => {
        const { 
                username, 
                password, 
                confirmpassword, 
                email, 
                personal_number, 
                first_name, 
                last_name 
            } = _.pick(req.body, ["username", "password", "confirmpassword", "email", "personal_number", "first_name", "last_name"]);
        
        //Form errors.
        const errors = validationResult(req);
        if (errors.errors.length > 0) {
            req.flash("form-error", formErrorFormatter(errors));
            return res.redirect("/app/auth/register");
        }

        
        registerUser(username, password, confirmpassword, email, personal_number, first_name, last_name)
            .then((user) => {
                const token = jwt.sign(user._id.toString(), process.env.JWT_TOKEN);
                return res.cookie("Authenticate", token).redirect("/app/");
            })
            .catch((error) => {
                console.log(error)
                req.flash("error", error);
                return res.redirect("/app/auth/register");
            })
    })

module.exports = router;
