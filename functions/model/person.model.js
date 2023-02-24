const Sequelize = require('sequelize') // ORM for connection with postgres
const validator = require('validator') // Framework for string validation
const bcrypt = require('bcrypt') // Library for encrypting data
const { db } = require('../db') // Connection to database
const Role = require('./role.model') // Role model

/**
 * Person table in the database.
 */
const Person = db.define("person", 
{ 
    person_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        required: true,
        validate: {
            is: /^[a-öA-Ö]+$/,
            notEmpty: true,
        }
    },
    surname: {
        type: Sequelize.STRING,
        required: true,
        validate: {
            is: /^[a-öA-Ö]+$/,
            notEmpty: true,
        }
    },
    pnr: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
        validate: {
            is: /^\d{8}-\d{4}$/,
        }
    },
    email: {
        type: Sequelize.STRING,
        required: true,
        unique: true,
        validate: {
            isEmail: true,
            isLowercase: true
        }
    },
    password: {
        type: Sequelize.STRING,
        required: true,
    },
    role_id: {
        type: Sequelize.INTEGER,
        required: true,
        validate: {
            isValidRoleId: function (value) {
                return Role.findOne({ where: { role_id: value } })
                    .then(role => {
                        if (!role) {
                            throw new Error("Invalid role_id");
                        }
                    });
            }
        }
    }, 
    username: {
        type: Sequelize.STRING,
        unique: true,
        required: true,
    }, 
},
{
    tableName: "person",
    timestamps: false
}
);

// Adds a beforeCreate hook to hash the password
Person.beforeCreate(async (person) => {

    // Checks if person has changed password and email, if not just continue.
    if (!person.changed('password') && !person.changed('email')) return next()

    // Validate password
    if (!validator.isLength(person.password, { min: 8, max: 16 })) {
        return next(new Error('Password is not strong.'))
    }

     // Validate Email
    if (!validator.isEmail(person.email)) {
        return next(new Error('Email is not a valid email.'))
    }

    // Generate encrypted password and setting password to the hash.
    const salt = bcrypt.genSaltSync(10)
    const encryptedPassword = bcrypt.hashSync(person.password, salt)
    person.password = encryptedPassword

    // Set role_id
    const role = await Role.findOne({
        where: {
            name: "applicant"
        }
    }).catch(error => {
        console.error(error);
        return next(new Error("Error finding Role"));
    });
    
    if (!role) {
        return next(new Error("Role not found"));
    }
    
    person.role_id = role.role_id;
    
});

Person.beforeUpdate(async (person) => {

    // Generate encrypted password and setting password to the hash.
    const salt = bcrypt.genSaltSync(10)
    const encryptedPassword = bcrypt.hashSync(person.password, salt)
    person.password = encryptedPassword
});


// Synchronize the model with the database
db.sync({ force: false })

module.exports = Person

