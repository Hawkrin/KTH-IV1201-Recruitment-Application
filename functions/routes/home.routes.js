/* eslint-disable */
const { Router } = require("express");
const authenticated = require("../middleware/auth.middleware");

// const User = require("../model/person.model");

const router = Router();

router

    .get("/", authenticated, (req, res) => { 
        // res.render('home', {
        //     user: req.user
        // }); 
        res.render('application-form', {
            user: req.user
        }); 
    })

module.exports = router;