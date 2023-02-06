/* eslint-disable */
const Availbility = require('../model/availability.model') // Connection to User model
const { db } = require('../db')
const bcrypt = require('bcrypt')
const Sequelize = require('sequelize')

/**
 * Application User by taking Availability, Competence .
 *
 * Returning a promise, resolve if successfully register user.
 * Reject if problems occured registering Application.
 *
 * @returns {Promise}
 */
const registerAvailability = async (avStartDate, avEndDate, db) => {
  try {
    const userExists = await Availbility.findOne({
      where: {
        [Sequelize.Op.or]: [{ avStartDate }, { avEndDate }],
      },
    })
    if (userExists) {
      throw new Error('User Already exists')
    }

    const newAvailability = Availbility.create({
      availability_id,
      pers_id,
      from_date,
      to_date,
    })

    return newAvailability
  } catch (error) {
    throw error
  }
}
