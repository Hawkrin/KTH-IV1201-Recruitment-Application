
/**
 * Formats error messages used throughout the application
 * 
 * @param {Error} error the error message
 * @returns the error message
 */
function formErrorFormatter(error) {
    const result = {};

    error.errors.forEach(element => {
        result[element.param] = element.msg;
    });

    return result;
}

module.exports = { formErrorFormatter }