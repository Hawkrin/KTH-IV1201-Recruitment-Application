require('dotenv').config() // init dotenv
const _= require("lodash"); // init lodash
const express = require("express"); // init express
const cookieParser = require("cookie-parser");
const session = require("express-session"); // init session
const flash = require("connect-flash"); // init flash
const connectToDb = require('./middleware/dbConnect.middleware'); // connects to db
const { requestLogger, queryLogger, errorLogger, loginManyAttemptsLogger } = require('./middleware/logger.middleware'); // loggers used
const MemoryStore = require('memorystore')(session)
const { hashUnhashedPasswords } = require('./controller/person.controller')
const http = require("http");

const app = express()
const PORT = process.env.PORT || 3000;

// Connection to db
app.use(connectToDb);

// App configuration
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// framework for view files
app.set('view engine', 'ejs') 

app.use(session({
  secret: 'your secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // 1 day
  }),
}));

// framework for flashing messages in the app
app.use(flash())
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// CSS files
app.use('/assets', express.static('assets'))

// App Routes
app.get('/', (req, res) => {res.redirect("/auth/login")})
app.use('/auth', require('./routes/auth.routes'))
app.use('/application', require('./routes/application.routes'))
app.use((req, res) => { res.status(404).render("404") });

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



const server = http.createServer(app)

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});