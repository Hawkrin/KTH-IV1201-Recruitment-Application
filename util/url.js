// Route URLS
const auth_LOGIN = "/auth/login";
const auth_REGISTER = "/auth/register";
const auth_FORGET_PASSWORD_1 = "/auth/forgotten-password-part1";
const auth_FORGET_PASSWORD_2 = "/auth/forgotten-password-part2";
const auth_FORGET_PASSWORD_ADMIN = "/auth/forgotten-password-admin";
const application_APPLICATION_FORM = "/application/application-form";
const application_APPLICATIONS = "/application/applications";
const application_SHOW_APPLICATION = "/application/show-application";
const application_SENT_APPLICATION = "/application/application-sent";

// Database conncection string
const dataBaseConnectionString = "postgres://" + process.env.USER + ":" + process.env.PASSWORD + "@" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_NAME;


module.exports = {
    dataBaseConnectionString,
    auth_LOGIN,
    auth_REGISTER,
    auth_FORGET_PASSWORD_1,
    auth_FORGET_PASSWORD_2,
    auth_FORGET_PASSWORD_ADMIN,
    application_APPLICATION_FORM,
    application_APPLICATIONS,
    application_SENT_APPLICATION


}