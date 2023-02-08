const Availability = require('../model/availability.model')
const Sequelize = require('sequelize')
const { user } = require('firebase-functions/v1/auth')
const Person = require('../model/person.model') // Connection to User model

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

module.exports = { registerAvailability }
