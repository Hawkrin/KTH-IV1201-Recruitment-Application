const Sequelize = require('sequelize') // ORM for connection with postgres
const { db } = require('../dbconfig') // Connection to database
const Person = require('./person.model') // Person table connection
const Competence = require('./competence.model') // Competence table connection

/**
 * Competence_profile table in the database, consists of 
 * persons comeptences.
 */
const CompetenceProfile = db.define('competence_profile',
  {
    competence_profile_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    person_id: {
      type: Sequelize.INTEGER,
      required: true,
      validate: {
        isValidPersonId: function (value) {
          return Person.findOne({ where: { person_id: value } })
            .then(person => {
              if (!person) {
                throw new Error("Invalid person_id");
              }
            });
        }
      },
    },
    competence_id: {
      type: Sequelize.INTEGER,
      required: true,
      validate: {
        isValidCompetenceId: function (value) {
          return Competence.findOne({ where: { competence_id: value } })
            .then(competence => {
              if (!competence) {
                throw new Error("Invalid competence_id");
              }
            });
        }
      },
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
