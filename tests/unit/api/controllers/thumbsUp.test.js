const proxyquire = require('proxyquire'),
    sinon = require('sinon'),

    ThumbsUpService = require('../../../../src/services/ThumbsUpService'),

    utils = require('../../../utils'),
    uuid = require('uuid/v4');


describe('thumbsUp', () => {
    let SUT,
        reqStub,
        respStub,
        thumbsUpConstructorStub,
        thumbsUpServiceStub;

    beforeEach(() => {
        thumbsUpConstructorStub = sinon.stub();
        thumbsUpServiceStub = sinon.createStubInstance(ThumbsUpService);
        thumbsUpConstructorStub.returns(thumbsUpServiceStub);

        reqStub = {
           swagger: {
                params: { }
            }
        };

        respStub = utils.buildResponseStub();

        SUT = proxyquire('../../../../src/api/controllers/thumbsUp', {
            '../../services/ThumbsUpService': thumbsUpConstructorStub
        });
    });

    describe('When resolving', () => {

        it('Should construct a new ThumbsUpService', () => {
            sinon.assert.calledOnce(thumbsUpConstructorStub)
        });

    });

    describe('When posting new thumbs-up collection', () => {

        beforeEach(() => {
           reqStub.swagger.params.thumbsUpCollection = {
               value: [
                   utils.randomThumb(),
                   utils.randomThumb()
               ]
           };
        });

        describe('that is not valid', () => {

            beforeEach(() => {
                reqStub.swagger.params.thumbsUpCollection.valid = false;

                SUT.post(reqStub, respStub);
            });

            it('Should not save a the posted thumbs-up', () => {
                sinon.assert.notCalled(thumbsUpServiceStub.save);
            });

            it('should return bad request code and message', () => {
                sinon.assert.calledWith(respStub.status, 400);
                sinon.assert.calledWith(respStub.json, 'Bad Request');
            });

        });

    describe('that is valid', () => {

        beforeEach(() => {
            reqStub.swagger.params.thumbsUpCollection.valid = true;

            SUT.post(reqStub, respStub);
        });

        it('Should save a the posted thumbs-up collection', () => {
            sinon.assert.calledWith(thumbsUpServiceStub.save, reqStub.swagger.params.thumbsUpCollection.value);
        });

        it('should return success code and message', () => {
            sinon.assert.calledWith(respStub.status, 201);
            sinon.assert.calledWith(respStub.json, 'Created');
        });

    });

    });

    describe('When getting a leaderboard', () => {

        beforeEach(() => {
            reqStub.swagger.params.category = {
                value: uuid()
            };
        });

        describe('with an invalid category', () => {

            beforeEach(() => {
                reqStub.swagger.params.category.valid = false;

                SUT.leaderboard(reqStub, respStub);
            });

            it('should not get the driver leaderboard from the service', () => {
                sinon.assert.notCalled(thumbsUpServiceStub.getDriverLeaderboard);
            });

            it('should return bad request code and message', () => {
                sinon.assert.calledWith(respStub.status, 400);
                sinon.assert.calledWith(respStub.json, 'Bad Request');
            });
        });

        describe('with an valid category', () => {
            let leaderboard;

            beforeEach(() => {
                reqStub.swagger.params.category.valid = true;

                leaderboard = [];

                for(let i = 0; i < 10; i++)
                    leaderboard.push(utils.randomThumb());

                thumbsUpServiceStub.getDriverLeaderboard.returns(leaderboard);

                SUT.leaderboard(reqStub, respStub);
            });

            it('should get the driver leaderboard from the service', () => {
                sinon.assert.calledOnce(thumbsUpServiceStub.getDriverLeaderboard);
                sinon.assert.calledWith(thumbsUpServiceStub.getDriverLeaderboard, reqStub.swagger.params.category.value);
            });

            it('should return the leaderboard in the response', () => {
                sinon.assert.calledWith(respStub.json, leaderboard);
            });

        });

    });


});
