const Sequelize = require('sequelize') // ORM for connection with postgres
const { db } = require('../db') // Connection to database

const Competence = db.define('competence', 

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
}
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Competence