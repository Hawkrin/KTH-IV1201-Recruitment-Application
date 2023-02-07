const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database

const Role = db.define("role", {

        role_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            required: true,
        }
    },{
        tableName: "role",
        timestamps: false
    }
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Role;