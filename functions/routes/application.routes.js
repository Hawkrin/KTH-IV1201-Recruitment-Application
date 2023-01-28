/* eslint-disable */
const {Router} = require("express");
const authenticated = require("../middleware/auth.middleware");

const router = Router();

router

    /*Application List*/
    .get("/applications", authenticated, (req, res) => { 
        res.render('applications', {
            user: req.user
        }); 
    })

    /*Application-form*/
    .get("/application-form", authenticated, (req, res) => { 
        res.render('application-form', {
            user: req.user
        }); 
    })

module.exports = router;