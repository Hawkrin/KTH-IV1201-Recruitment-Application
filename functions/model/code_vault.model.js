const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database
const Person = require('./person.model'); //Connection to Person table

const Code_Vault = db.define("code_vault", 
    {
        code_vault_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
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
        code: {
            type: Sequelize.STRING,
            required: true,
        },
    },
    {
        tableName: "code_vault",
        timestamps: false
    }
);

Code_Vault.belongsTo(Person, { foreignKey: 'person_id' });

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Code_Vault;