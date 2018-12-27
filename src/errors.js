/**
 * Custom domain specific error module
 * @type deepFreeze - recursively traverses the passed object and returns a immutable
 *  instance of each element
 */
const deepFreeze = require('deep-freeze');

// Reusable constant representations of the type names
const VALIDATION_ERROR = 'ValidationError',
    INVAID_DATE_ERROR = 'InvalidDateError';
    INVAID_CATEGORY_ERROR = 'InvalidCategoryError';

/**
 * Base class for domain specific validation errors
 * NOT MEANT TO BE USED DIRECTLY
 */
class ValidationError extends Error {

    /**
     * An over ride of the to string functionality to
     *  return the type's string representation for type comparison.
     * @returns {string} - The name of the type
     */
    get [Symbol.toStringTag] () {
        return VALIDATION_ERROR;
    }

    /**
     * ValidationError Constructor
     * @param message {string} - Specific error message. Defaults to "Validation Error" if not specified
     */
    constructor(message) {
        super(message || "Validation Error");

        this.name = VALIDATION_ERROR;
    }

}

/**
 * Invalid category error. Used when the specified category is not known
 */
class InvalidCategoryError extends ValidationError {

    /**
     * An over ride of the to string functionality to
     *  return the type's string representation for type comparison.
     * @returns {string} - The name of the type
     */
    get [Symbol.toStringTag] () {
        return INVAID_CATEGORY_ERROR;
    }

    /**
     * InvalidCategoryError constructor.
     * @param message {string} - Specific error message. Defaults to "Invalid Category" if not specified
     */
    constructor(message){
        super(message || 'Invalid category');

        this.name = INVAID_CATEGORY_ERROR;
    }

}

/**
 * Invalid date error. Used when the date string specified isn't able to be parsed
 */
class InvalidDateError extends ValidationError {

    /**
     * An over ride of the to string functionality to
     *  return the type's string representation for type comparison.
     * @returns {string} - The name of the type
     */
    get [Symbol.toStringTag]() {
        return INVAID_DATE_ERROR;
    }

    /**
     * InvalidDateError constructor.
     * @param message {string} - Specific error message. Defaults to "Invalid Date" if not specified
     */
    constructor(message) {
        super(message || 'Invalid Date');

        this.name = INVAID_DATE_ERROR;
    }

}

/**
 * Immutable object of domain errors
 */
module.exports = deepFreeze({
    [VALIDATION_ERROR]: ValidationError,
    [INVAID_DATE_ERROR]: InvalidDateError,
    [INVAID_CATEGORY_ERROR]: InvalidCategoryError
});
