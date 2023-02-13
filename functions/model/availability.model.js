const Sequelize = require('sequelize')
const { db } = require('../db')
const Person = require('./person.model')

const Availability = db.define(
  'availability',
  {
    availability_id: {
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
    from_date: {
      type: Sequelize.DATE,
      required: true,
    },
    to_date: {
      type: Sequelize.DATE,
      required: true,
    },
  },
  {
    tableName: 'availability',
    timestamps: false,
  },
)

db.sync({ force: false })

module.exports = Availability
