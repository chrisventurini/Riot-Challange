/** Because all data is maintained in memory, each repository should be maintained
 *  as a singleton so the data remains consistent. This factory module resolves
 *  the required repository singleton instance or creates a new one if required.
 * @type {ThumbUpsCategoryRepository} - The repository type that the factory is manufacturing
 */
const ThumbUpsCategoryRepository = require('./ThumbsUpCategoryRepository');

/**
 * Resolves the required repository singleton instance or manufactures a new one if required.
 * @param categoryName - the category name that the repository will be used for
 * @returns {ThumbUpsCategoryRepository} Instance
 */
module.exports = (categoryName) => {

    // Normalize the category name as a key
    let normalizedCatName = categoryName.toUpperCase().replace(/ /g, '');

    // Because node modules are cached and case sensitive ( required('name') will be
    //  cached separately than required('Name'), this attaches the singleton instance to
    //  global object using a resolved symbol to make sure the same instance is always used
    const REPO_SYMBOL_KEY = Symbol.for(`${normalizedCatName}ThumbCategoryRepo`);
    let globalSymbols = Object.getOwnPropertySymbols(global);

    if(globalSymbols.indexOf(REPO_SYMBOL_KEY) === -1) {
        global[REPO_SYMBOL_KEY] = new ThumbUpsCategoryRepository(categoryName);
    }

    return global[REPO_SYMBOL_KEY]
};
