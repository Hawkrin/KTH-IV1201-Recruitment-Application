const Sequelize = require('sequelize') // ORM for connection with postgres
const validator = require('validator') // Framework for string validation
const { db } = require('../db') // Connection to database

const Competence = db.define(
  'competence',
  {
    competence_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      required: true,
    },
  },
  {
    tableName: 'competence',
    timestamps: false,
  },
)

db.sync({ force: false })

module.exports = Competence
