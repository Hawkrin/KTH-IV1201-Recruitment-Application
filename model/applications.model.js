const Sequelize = require('sequelize')
const { db } = require('../dbconfig')
const Availability = require('./availability.model')
const Person = require('./person.model')

/**
 * Applications table in the database, stores info about applications.
 */
const ApplicationsStatus = db.define('applications',
    {
        applications_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        availability_id: {
            type: Sequelize.INTEGER,
            required: true,
            validate: {
                isValidPersonId: function (value) {
                    return Availability.findOne({ where: { availability_id: value } })
                        .then(availability => {
                            if (!availability) {
                                throw new Error("Invalid availability_id");
                            }
                        });
                }
            },
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
        open_application_status: {
            type: Sequelize.BOOLEAN,
            required: true,
        },
        status: {
            type: Sequelize.STRING,
            required: true,
        },
    },
    {
        tableName: 'applications',
        timestamps: false,
    },
)

db.sync({ force: false })

module.exports = ApplicationsStatus
