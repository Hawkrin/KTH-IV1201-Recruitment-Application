/* eslint-disable */
const Availability = require('../model/availability.model') // Connection to User model
const Competence_Profile = require('../model/competence_profile.model') // Connection to User model
const Sequelize = require('sequelize')

/**
 * Application User by taking Availability, Competence .
 *
 * Returning a promise, resolve if successfully register user.
 * Reject if problems occured registering Application.
 *
 * @returns {Promise}
 */
const registerApplication = async (from_date, to_date, competenceData) => {
  try {
      const [availabilityExists, competenceProfileExists] = await Promise.all([
        Availability.findOne({
            where: {
                person_id: Sequelize.col('person_id')
            }
        }),
        Competence_Profile.findOne({
            where: {
                person_id: Sequelize.col('person_id')
            }
        })
      ]);
  
      if (availabilityExists || competenceProfileExists) {
          throw new Error("You have already made an application");
      }

      const newAvailability = await Availability.create({
          from_date,
          to_date,
      });

      const newCompetenceProfiles = await Promise.all(competenceData.map(({competence_id, years_of_experience}) => {
          return Competence_Profile.create({
              competence_id,
              years_of_experience
          });
      }));

      return {newAvailability, newCompetenceProfiles};
  } catch (error) {
      throw error;
  }
};


module.exports = { registerApplication }