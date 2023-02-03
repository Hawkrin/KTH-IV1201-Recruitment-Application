/* eslint-disable */
const Sequelize = require('sequelize') // ORM for connection with postgres
const validator = require('validator') // Framework for string validation
const bcrypt = require('bcrypt') // Library for encrypting data
const { db } = require('../db') // Connection to database
