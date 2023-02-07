/* eslint-disable */
const Availability = require("../model/availability.model"); // Connection to Availability model
const Competence_Profile = require("../model/competence_profile.model"); // Connection to Competence profile model
const {db} = require("../db");
const Sequelize = require('sequelize');


/**
 * Register user by taking username, password and email.
 * Encrypting password with hash and salt.
 * Returning a promise, resolve if successfully register user.
 * Reject if probles occured registering user. 
 * 
 * @param {String} username Persons username
 * @param {Integer} password Persons password
 * @param {String} name Persons name
 * @param {String} surname Persons surname
 * @param {Integer} pnr Persons personal number
 * @param {Integer} role_id Persons role_id
 * @param {Integer} confirmpassword  Persons password a second time
 * @param {Database} db Connection to database
 * @returns {Promise}
 */
// const registerApplication = async (from_date, to_date, years_of_experience, competence_id) => {
//     try {
//         const [availabilityExists, competenceProfileExists] = await Promise.all([
//             Availability.findOne({
//                 where: {
//                     person_id: Sequelize.col('person_id')
//                 }
//             }),
//             Competence_Profile.findOne({
//                 where: {
//                     person_id: Sequelize.col('person_id')
//                 }
//             })
//         ]);
        
//         if (availabilityExists || competenceProfileExists) {
//             throw new Error("You have already made an application");
//         }

//         const newAvailability = await Availability.create({
//             from_date,
//             to_date,
//         });

//         const newCompetenceProfiles = await Promise.all(competenceData.map(({competence_id, years_of_experience}) => {
//             return Competence_Profile.create({
//                 competence_id,
//                 years_of_experience
//             });
//         }));

//         return {newAvailability, newCompetenceProfiles};
//     } catch (error) {
//         throw error;
//     }
// };


// module.exports = { registerApplication }