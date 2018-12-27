const categoryRepoFactory = require('../data/categoryRepoFactory'),
        moment = require('moment'),
        CONSTS = require('../consts'),
        errors = require('../errors');

class ThumbsUpService {

    constructor() {
        this._categoryRepos = {
            [CONSTS.CATEGORIES.CLEAN]: categoryRepoFactory(CONSTS.CATEGORIES.CLEAN),
            [CONSTS.CATEGORIES.FRIENDLY]: categoryRepoFactory(CONSTS.CATEGORIES.FRIENDLY),
            [CONSTS.CATEGORIES.PROMPT]: categoryRepoFactory(CONSTS.CATEGORIES.PROMPT)
        };
    }

    _validateCategory(category) {
        if(!this._categoryRepos.hasOwnProperty(category))
            throw new errors.InvalidCategoryError(`Not a valid category: ${category}`);
    }

    getDriverLeaderboard(category) {
        this._validateCategory(category);

        return this._categoryRepos[category].getTopTen();
    }

    save(thumbsCollection) {
        thumbsCollection.forEach(thumb => {
            this._validateCategory(thumb.category);

            let momentDate = moment(thumb.date);

            if(!momentDate.isValid())
                throw new errors.InvalidDateError(`${thumb.date} is not a valid date string`);

            thumb.date = momentDate.toDate();
        });

        thumbsCollection.forEach(thumb => this._categoryRepos[thumb.category].save(thumb));
    }

}

module.exports = ThumbsUpService;

