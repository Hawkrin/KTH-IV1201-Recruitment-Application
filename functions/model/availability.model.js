/* eslint-disable */
const Sequelize = require('sequelize') // ORM for connection with postgres
const validator = require('validator') // Framework for string validation
const bcrypt = require('bcrypt') // Library for encrypting data
const { db } = require('../db') // Connection to database

const Availability = db.define(
  'availability',
  {
    availability_id: {
      primaryKey: true,
      autoIncrement: true,
    },
    pers_id: {
      type: Sequelize.INTEGER,
      required: true,
    },
    from_date: {
      type: date,
      required: true,
    },
    to_date: {
      type: date,
      required: true,
    },
  },
  {
    tableName: 'availability',
    timestamps: false,
  },
)

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Availability
