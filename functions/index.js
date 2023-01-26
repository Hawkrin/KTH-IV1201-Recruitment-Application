require("dotenv").config(); // init dotenv
// const _= require("lodash"); // init lodash

const functions = require("firebase-functions"); // init firebase functions
const express = require("express"); // init express
const admin = require("firebase-admin"); // init firebase admin

admin.initializeApp(functions.config().firebase);

const app = express();

// Database connection
require("./db").connect();

// App configuration
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// app.use(cookieParser());
app.set("view engine", "ejs");

// Routes
app.use("/auth", require("./routes/auth.routes"));

app.use((req, res) => {
  res.status(404).render("404");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

exports.app = functions.https.onRequest(app);


