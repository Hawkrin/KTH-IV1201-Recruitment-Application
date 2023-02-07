/* eslint-disable */
const {Router} = require("express");
const authenticated = require("../middleware/auth.middleware");
// const { registerApplication } = require('../controller/application_form.controller')

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

//     .post('/application-form', async (req, res) => {
//         try {
//             const { from_date, to_date, years_of_experience, competence_id } = req.body;
//             const result = await registerApplication(from_date, to_date, years_of_experience, competence_id);
//             res.status(200).render({ message: "Application form submitted successfully", result });
//         } catch (error) {
//             res.status(400).render({ message: error.message });
//         }
// });


module.exports = router;