/* eslint-disable */
const Sequelize = require('sequelize') // ORM for connection with postgres
const { db } = require('../db') // Connection to database

const CompetenceProfile = db.define(
  'competence_profile',
  {
    competence_profile_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    person_id: {
      type: Sequelize.INTEGER,
      required: true,
    },
    competence_id: {
      type: Sequelize.INTEGER,
      required: true,
    },
    years_of_experience: {
      type: Sequelize.INTEGER,
      required: true,
    },
  },
  {
    tableName: 'competence_profile',
    timestamps: false,
  },
)

db.sync({ force: false })

module.exports = CompetenceProfile
