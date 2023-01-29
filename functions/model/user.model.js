/* eslint-disable */
const mongoose = require("mongoose"); // init mongoose for user
const validator = require("validator"); // init validator for validating strings
const bcrypt = require("bcrypt"); // init bcrypt for hashing passwords

const userSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        default: "default",
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    personal_number: {
        type: String,
        required: true,
        unique: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    }
});

/**
 * Middleware for password validation and hashing
 */
userSchema.pre("save", function(next) {
    // User instance
    const user = this;

    // Checks if user has changed password or email, if not just continue.
    if (!user.isModified("password") && !user.isModified("email")) return next();

    // Validate password
    if (!validator.isLength(user.password, {min: 8, max: 16})) {
        return next(new Error("Password is not strong."));
    }

    // Validate Email
    if (!validator.isEmail(user.email)) {
        return next(new Error("Email is not a valid email."));
    }

    // Generate encrypted password and setting password to the hash.
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(user.password, salt);
    user.password = encryptedPassword;

    next();
});

module.exports = mongoose.model("user", userSchema);
