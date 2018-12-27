/**
 * Constants module for the storage of string representations of the categories
 * @type deepFreeze - recursively traverses the passed object and returns a immutable
 *  instance of each element
 */
const deepFreeze = require('deep-freeze');

/**
 * An immutable constant object
 */
module.exports = deepFreeze({
    CATEGORIES: {
        CLEAN: "clean",
        PROMPT: "prompt",
        FRIENDLY: "friendly"
    }
});
