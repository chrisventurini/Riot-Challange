/**
 * Module for a repository pattern type to store the thumbs-up totals by driver
 * @type {LimitedExecuteTree} - The in-memory data store used for the
 *  storage of driver totals.
 */

const LimitedExecuteTree = require('./LimitedExecuteTree');

/**
 * Repository pattern type to store the thumbs-up totals by driver
 */
class ThumbsUpCategoryRepository {

    /**
     * An over ride of the to string functionality to
     *  return the type's string representation for type comparison.
     * @returns {string} - The name of the type
     */
    get [Symbol.toStringTag] () {
        return 'ThumbsUpCategoryRepository';
    }

    /**
     * The constructor of the ThumbsUpCategoryRepository which
     *  sets the name property of the object and initializes the private _drivers
     *  object for quick lookup by driver name.
     * @param name {string} - the name of the category that is contained
     * within the repository.
     */
    constructor(name) {
        this.name = name;

        // Used to retrieve the driver by name which is more performant than
        //  Traversing the tree.
        this._drivers = {};

        // The binary tree used for leaderboard retrieval
        this._tree = new LimitedExecuteTree();
    }

    /**
     * Returns the top 10 drivers by the number of thumbs-up they have
     *  received in the category
     * @returns {object[]} - object representations of the driver record
     */
    getTopTen() {
        let results = [];

        this._tree.executeOnEveryNodeReverse((key, data) => {

            // Because each key can potentially contain more than one
            //  data element and we just concat its greater than or equal to
            if(results.length >= 10)
                return false;

            // Have the last entered by date as the tie breaker on data that has
            //      the same key
            let sortedData = data.sort((a, b) => b.date - a.date);
            results = results.concat(sortedData);

            return true;
        });

        // See comment with if statement above
        return results.slice(0, 10);
    }

    /**
     * Saves the thumbs-up to the drivers total
     * @param thumbsUp {object} a object representation of the driver's thumbs up
     */
    save(thumbsUp) {
        if(thumbsUp.category !== this.name)
            throw new Error('The thumbs-up category does not match the name specified for the repository');

        let { name, date } = thumbsUp,
            driver = this._drivers[name];

        if (!driver) {
            driver = { name, date, total: 1 };
            this._drivers[name] = driver;
            this._tree.insert(driver.total, driver);
        } else {
            // Need to delete the existing key because its no longer valid
            //  since the key is the total
            this._tree.delete(driver.total, driver);

            driver.total++;

            // Only update the drivers date if the thumbs up is newer
            if (date > driver.date)
                driver.date = date;

            this._tree.insert(driver.total, driver);
        }
    }
}

module.exports = ThumbsUpCategoryRepository;