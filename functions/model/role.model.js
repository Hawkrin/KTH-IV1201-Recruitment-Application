const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database

const Role = db.define("role", 

{
    role_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        required: true,
        validate: {
            isValidRoleId: function (value) {
                return Role.findOne({ where: { role_id: value } })
                    .then(role => {
                        if (!role) {
                            throw new Error("Invalid role_id");
                        }
                    });
            },
            notEmpty: true,
        }
    },
    name: {
        type: Sequelize.STRING,
        required: true,
        validate: {
            isValidName: function (value) {
                return Role.findOne({ where: { name: value } })
                    .then(role => {
                        if (!role) {
                            throw new Error("Invalid name");
                        }
                    });
            },
            notEmpty: true,
        }
    },
},
{
    tableName: "role",
    timestamps: false
}
);

// Synchronize the model with the database
db.sync({ force: false })

module.exports = Role;