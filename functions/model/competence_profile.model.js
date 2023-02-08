const Sequelize = require('sequelize') // ORM for connection with postgres
const { db } = require('../db') // Connection to database

const Competence_Profile = db.define('competence_profile', 

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
        type: Sequelize.NUMBER,
        required: true,
    },
},
{
    tableName: 'competence_profile',
    timestamps: false,
}
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Competence_Profile