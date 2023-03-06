const { dataBaseConnectionString } = require("./util/url");
const { Sequelize } = require('sequelize');

const db = new Sequelize(dataBaseConnectionString, {
  logging: false // disable logging for all queries
});

db.sync()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(error => {
        console.error('Unable to connect to the database:', error);
    });

    process.on('SIGINT', () => {
        console.log('Shutting down server...');
        db.close() // Close the database connection
            .then(() => {
                console.log('Database connection closed.');
                process.exit(0); // Exit the process
            })
            .catch((error) => {
                console.error('Error closing database connection:', error);
                process.exit(1); // Exit with an error code
            });
    });

module.exports = { db };