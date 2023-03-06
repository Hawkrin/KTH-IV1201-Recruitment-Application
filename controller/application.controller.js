const Availability = require('../model/availability.model')
const Sequelize = require('sequelize')
const CompetenceProfile = require('../model/competence_profile.model')
const Competence = require('../model/competence.model')
const Applicant = require("../model/person.model")
const ApplicationsStatus = require("../model/applications.model")

/**
 * Registers availability for a person.
 * 
 * @param {number} person_id - The ID of the person.
 * @param {Date} from_date - The start date of the availability.
 * @param {Date} to_date - The end date of the availability. 
 * @returns {Object} newAvailability - The newly created availability object. 
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

    const newApplication = await ApplicationsStatus.create({
      availability_id: newAvailability.availability_id,
      person_id: newAvailability.person_id,
      open_application_status: false,
      status: 'Unhandled',
    });


    return newAvailability
  } catch (error) {
    throw error
  }
}



/**
 * Registers a new competence profile.
 * 
 * @param {number} person_id The ID of the person to register the competence profile for.
 * @param {number} competence_id The ID of the competence to register. 
 * @param {number} years_of_experience The number of years of experience with the specified competence. 
 * 
 * @returns {Object} The newly created competence profile. 
 */
const registerCompetence = async (
  person_id,
  competence_id,
  years_of_experience,
) => {
  try {


    // Input validation
    if (!person_id || !competence_id || !years_of_experience) {
      throw new Error('Invalid input values')
    }


    const competenceProfileExists = await CompetenceProfile.findOne({
      where: {
        person_id: person_id,
        competence_id: competence_id,
        years_of_experience: years_of_experience,
      },
    })
    if (competenceProfileExists) {
      throw new Error('Competence profile already exists')
    }
    const newCompetenceProfile = await CompetenceProfile.create({
      person_id: person_id,
      competence_id: competence_id,
      years_of_experience: years_of_experience,
    })
    return newCompetenceProfile
  } catch (error) {
    throw error
  }
}

/**
 * calculates the difference in years between two dates. 
 * 
 * @param {Date} start - The start date. 
 * @param {Date} end - The end date. 
 * @returns {Number} The difference in years between two dates, rounded to one decimal place. 
 */
const calculate = (start, end) => {
  start = new Date(start)
  end = new Date(end)
  let timeDiff = end.getTime() - start.getTime()
  let diffDays = timeDiff / (1000 * 3600 * 24)
  let diffYears = diffDays / 365
  return diffYears.toFixed(1)
}

/**
 * Retrieves all competences from the competence table in the database
 * 
 * @returns all competences in the table
 */
const getAllCompetences = async () => {
  const competences = await Competence.findAll({
    attributes: ['name', 'competence_id'],
  });

  return competences;
}

/**
 * Get all availability records from the database
 * @returns availability - An array of availability objects
 *  */
const getAllAvailability = async () => {
  const availability = await Availability.findAll({
    attributes: ['availability_id', 'person_id', 'from_date', 'to_date'],
    order: [['availability_id', 'DESC']],
  });
  return availability;
}

/**
 * Retrieves all applicants from the database.
 * @returns applicant - An array of Applicant objects.
 */
const getAllApplicant = async () => {
  const applicant = await Applicant.findAll({
    attributes: ['person_id', 'name', 'surname', 'pnr', 'email', 'password', 'role_id', 'username'],
    where: { role_id: "2" },
    order: [['person_id', 'DESC']]
  })
  return applicant;
}

/**
 * Retrieves all applications from the database.
 * @returns applications - An array of Applications objects.
 */
const getAllApplicationsStatus = async () => {
  const applicationsStatus = await ApplicationsStatus.findAll({
    attributes: ['applications_id', 'availability_id', 'person_id', 'open_application_status', 'status'],
    order: [['person_id', 'DESC']]
  })
  return applicationsStatus;
}

module.exports = { registerAvailability, registerCompetence, calculate, getAllCompetences, getAllAvailability, getAllApplicant, getAllApplicationsStatus }
