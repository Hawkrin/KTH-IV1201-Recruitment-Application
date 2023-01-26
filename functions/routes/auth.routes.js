/* eslint-disable */
const { Router } = require("express");
const _ = require("lodash");
const { fullUrl } = require("../util/url");
const { check, validationResult } = require('express-validator/check');
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
            return res.redirect(fullUrl(req));
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
        return res.cookie("Authenticate", null).redirect("/");
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
            // .custom(async (confirmPassword, {req}) => {
            //     const password = req.body.password;

            //     if (password !== confirmPassword) {
            //         throw new Error("Password must be same.");
            //     }
            // })
    ],
    
    
    (req, res) => {
        const {username, password, confirmpassword, email} = _.pick(req.body, ["username", "password", "confirmpassword", "email"]);
        
        //Form errors.
        const errors = validationResult(req);
        if (errors.errors.length > 0) {
            req.flash("form-error", formErrorFormatter(errors));
            return res.redirect(fullUrl(req));
        }

        
        registerUser(username, password, confirmpassword, email)
            .then((user) => {
                const token = jwt.sign(user._id.toString(), process.env.JWT_TOKEN);
                return res.cookie("Authenticate", token).redirect("/");
            })
            .catch((error) => {
                req.flash("error", error);
                return res.redirect(fullUrl(req));
            })
    })

module.exports = router;
