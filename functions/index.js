/* eslint-disable */
require("dotenv").config(); // init dotenv
// const _= require("lodash"); // init lodash

const functions = require("firebase-functions"); // init firebase functions
const express = require("express"); // init express
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const flash = require("connect-flash"); // init flash


const app = express();

// App configuration
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs"); // framework for view files
app.use(session({
  cookie: {maxAge: 86400000},
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  resave: true,
  saveUninitialized: true,
  secret: "keyboard cat",
}));
app.use(flash()); // used for "global" error messaging

// CSS files
app.use("/assets", express.static("assets"));


// App Routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/", require("./routes/home.routes"));
app.use("/application", require("./routes/application.routes"));

app.use((req, res) => {
  res.status(404).render("404");
});

exports.app = functions.https.onRequest(app);


