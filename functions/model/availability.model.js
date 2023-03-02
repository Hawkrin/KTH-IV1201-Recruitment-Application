/* eslint-disable */
const Sequelize = require('sequelize'); // ORM for connection with postgres
const {db} = require('../db'); // Connection to database

const Availability = db.define("availability", {

    availability_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    person_id: {
        type: Sequelize.INTEGER,
        required: true
    },
    from_date: {
        type: Sequelize.DATE,
        required: true,
    },
    to_date: {
        type: Sequelize.DATE,
        required: true,
    }
    },{
        tableName: "availability",
        timestamps: false
    }
);

// Adds a beforeCreate hook to hash the password
// Availability.beforeCreate(async (availability, options) => {
console.log("Hello")
   
// });


// Synchronize the model with the database
db.sync({ force: false })

module.exports = Availability;
