/**
 * Thumbs controller for swagger API
 * @type {ThumbsUpService} - Domain service for handling Thumbs-Up models
 */
const ThumbsUpService = require('../../services/ThumbsUpService');

let service = new ThumbsUpService();

/**
 * Private helper function to respond with a 400 Bad Request
 * @param resp = http response object
 * @private
 */
let _badRequest = resp => {
    resp.status(400).json('Bad Request');
};

module.exports = {
    /**
     *  Leaderboard controller operation for the /api/thumbsUp/leaderboard/{category} URI path
     *      Confirms the incoming category request is valid and gets the corresponding
     *      leaderboard from the domain service
     *
     *      If the category request is not valid, it responds with a 400 Bad request
     *
     * @param req - http request object
     * @param resp - http response object
     */
    leaderboard: (req, resp) => {
        let model = req.swagger.params.category;

        if(model.valid) {
            let leaderboard = service.getDriverLeaderboard(model.value);
            resp.json(leaderboard);
        } else {
            _badRequest(resp);
        }
    },

    /**
     *  Post controller operation for the /api/thumbsUp/ URI path
     *      Confirms the incoming thumbs-up collection request is valid and then saves collection
     *      in the domain service
     *
     *      If the category request is not valid, it responds with a 400 Bad request
     *
     * @param req - http request object
     * @param resp - http response object
     */
    post: (req, resp) => {
        let model = req.swagger.params.thumbsUpCollection;

        if(model.valid) {
            service.save(req.swagger.params.thumbsUpCollection.value);
            resp.status(201).json('Created');
        } else {
            _badRequest(resp);
        }
    }

};
