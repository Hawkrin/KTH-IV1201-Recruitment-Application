const Sequelize = require('sequelize') // ORM for connection with postgres
const { db } = require('../db') // Connection to database
const Competence = require('./competence.model'); //Connection to Competence table

/**
 * Translation table in the database, used for translating the competences
 * in the competence table.
 */
const Translation = db.define('translation', 
    {
        translation_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        competence_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Competence,
                key: 'competence_id'
            }
        },
        swedish: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        english: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },{
        tableName: 'translation',
        timestamps: false,
    }
);

// Used for database internationalization
Translation.belongsTo(Competence, { foreignKey: 'competence_id' });
Competence.hasMany(Translation, { foreignKey: 'competence_id' });

db.sync({ force: false })

module.exports = Translation