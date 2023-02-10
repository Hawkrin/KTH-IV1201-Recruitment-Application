const Availability = require('../model/availability.model')
const Sequelize = require('sequelize')
const CompetenceProfile = require('../model/competence_profile.model')

/**
 * To check the availability if the person have this time
 * @param {*} person_id
 * @param {*} from_date
 * @param {*} to_date
 * @returns
 */
const registerAvailability = async (person_id, from_date, to_date) => {
  try {
    const availabilityExists = await Availability.findOne({
      where: {
        [Sequelize.Op.and]: [{ person_id }, { from_date }, { to_date }],
      },
    })
    if (availabilityExists) {
      throw new Error('Availability Already exists')
    }
    const newAvailability = await Availability.create({
      person_id,
      from_date,
      to_date,
    })
    return newAvailability
  } catch (error) {
    throw error
  }
}

const registerCompetence = async (
  person_id,
  competence_id,
  years_of_experience,
) => {
  try {
    const competenceProfileExists = await CompetenceProfile.findOne({
      where: {
        [Sequelize.Op.and]: [
          { person_id },
          { competence_id },
          { years_of_experience },
        ],
      },
    })
    if (competenceProfileExists) {
      throw new Error('Competence profile already exists')
    }
    const newCompetenceProfile = await CompetenceProfile.create({
      person_id,
      competence_id,
      years_of_experience,
    })
    return newCompetenceProfile
  } catch (error) {
    throw error
  }
}

module.exports = { registerAvailability, registerCompetence }
