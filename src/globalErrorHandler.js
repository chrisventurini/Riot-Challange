/**
 * Global Express error handler module
 */
const errors = require('./errors');

/**
 *  Global error handler for errors that have not been
 *  handled during the Express request lifecycle
 * @param err {Error} - The unhandled error
 * @param req - The incoming request that caused the error
 * @param resp - The Express response object to organize a http response
 * based on a handled error
 * @param next - The cases that there needs to be an asynchronous handling
 * of an error, next needs to be called upon the resolution
 */
module.exports = (err, req, resp, next) => {
    // Translate Validation errors to a 400 Bad Request response
    if(err instanceof  errors.ValidationError) {
        resp.status(400).json(`Bad Request: ${err.message}`);
        return;
    }

    /*
    *   For some reason the swagger-ui-express module is attempting to
    *   set headers after they've been send. This isn't harmful but it is
    *   adding unnecessary noise to the server console
    */
    if(err.message === 'Can\'t set headers after they are sent.' &&
        err.stack.includes('node_modules/swagger-ui-express/')) {
        return;
    }

    throw err;
};
