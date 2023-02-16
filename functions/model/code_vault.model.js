const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database

const Code_Vault = db.define("code_vault", 
    {
        code_vault_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        person_id: {
            type: Sequelize.INTEGER,
        },
        code: {
            type: Sequelize.STRING,
        },
    },
    {
        tableName: "code_vault",
        timestamps: false
    }
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Code_Vault;