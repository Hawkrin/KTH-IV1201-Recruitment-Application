/* eslint-disable */
const { Router } = require("express");
const authenticated = require("../middleware/auth.middleware");

const User = require("../model/user.model");

const router = Router();

router

    .get("/", authenticated, (req, res) => { 
        res.render('home', {
            user: req.user
        }); 
    })

module.exports = router;