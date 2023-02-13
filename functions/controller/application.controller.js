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

/**
 * 
 * @param {*} person_id 
 * @param {*} competence_id 
 * @param {*} years_of_experience 
 * @returns 
 */
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

/**
 * 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const calculate = (start, end) => {
  start = new Date(start)
  end = new Date(end)
  let timeDiff = end.getTime() - start.getTime()
  let diffDays = timeDiff / (1000 * 3600 * 24)
  let diffYears = diffDays / 365
  return diffYears.toFixed(1)
}

module.exports = { registerAvailability, registerCompetence, calculate }
