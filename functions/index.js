require('dotenv').config() // init dotenv

const _= require("lodash"); // init lodash
// const functions = require("firebase-functions"); // init firebase functions
const express = require("express"); // init express
const cookieParser = require("cookie-parser");
const session = require("express-session"); // init session
const flash = require("connect-flash"); // init flash
const connectToDb = require('./middleware/dbConnect.middleware'); // connects to db
const { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger } = require('./middleware/logger.middleware'); // loggers used
const MemoryStore = require('memorystore')(session)
const { hashUnhashedPasswords } = require('./controller/person.controller')
const cors = require("cors");

const app = express()

// Connection to db
app.use(connectToDb);
app.use(cors());

// App configuration
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('view engine', 'ejs') // framework for view files

app.use(session({
  secret: 'your secret',
  resave: false,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: 86400000 // 1 day
  }),
}));

app.use(flash()) // used for "global" error messaging

// CSS files
app.use('/assets', express.static('assets'))

// App Routes
app.use('/auth', require('./routes/auth.routes'))
app.use('/application', require('./routes/application.routes'))

app.use((req, res) => {
  res.status(404).render("404");
});

// Loggers
app.use(loginManyAttemptsLogger);
app.use(requestLogger);
app.use(errorLogger);
app.use((req, res, next) => {
  req.logQuery = queryLogger;
  next();
});

// hashes unhashed passwords every hour.
setInterval(() => {
  hashUnhashedPasswords();
}, 30000);


app.listen(3000, () => console.log("App is listening on port 3000" ))

exports.app = functions.https.onRequest(app);

