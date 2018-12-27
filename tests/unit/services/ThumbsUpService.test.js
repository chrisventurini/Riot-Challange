const proxyquire = require('proxyquire'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    moment = require('moment'),
    random = require('random'),
    utils = require('../../utils'),
    uuid = require('uuid/v4'),

    CategoryRepository = require('../../../src/data/ThumbsUpCategoryRepository'),

    errors = require('../../../src/errors'),
    CONSTS = require('../../../src/consts');


// Because the tests uses a garbage string for a date, moment warns
//      that its going to fallback to the Date type constructor
moment.suppressDeprecationWarnings = true;


describe('ThumbsUpService', () => {

    let SUT,
        repoStubs = {};

    beforeEach(() => {
        let categoryRepoFacStub = sinon.stub();

        repoStubs = {
            clean: sinon.createStubInstance(CategoryRepository),
            friendly: sinon.createStubInstance(CategoryRepository),
            prompt: sinon.createStubInstance(CategoryRepository)
        };

        categoryRepoFacStub.withArgs(CONSTS.CATEGORIES.CLEAN).returns(repoStubs.clean);
        categoryRepoFacStub.withArgs(CONSTS.CATEGORIES.FRIENDLY).returns(repoStubs.friendly);
        categoryRepoFacStub.withArgs(CONSTS.CATEGORIES.PROMPT).returns(repoStubs.prompt);

        const ThumbService = proxyquire('../../../src/services/ThumbsUpService', {
            '../data/categoryRepoFactory': categoryRepoFacStub
        });

        SUT = new ThumbService();
    });

    describe('When constructing', () => {

        it('Should define the _categoryRepos properties with the various category repositories', () => {
            expect(SUT._categoryRepos).to.exist;
            expect(SUT._categoryRepos.clean).to.eq(repoStubs.clean);
            expect(SUT._categoryRepos.prompt).to.eq(repoStubs.prompt);
            expect(SUT._categoryRepos.friendly).to.eq(repoStubs.friendly);
        });

    });

    describe('When saving a thumbs-up collection', () => {
        let thumbsCollection;

        beforeEach(() => {
            thumbsCollection = [];

            for(let i = 0; i < 50; i++)
                thumbsCollection.push(utils.randomThumb({ dateAsString: true }));
        });

        describe('with a thumbs-up with an invalid category', () => {

            beforeEach(() => {
                thumbsCollection[random.int(0, 50)].category = uuid();
            });

            it('should throw an invalid category error', () => {
                expect(() => SUT.save(thumbsCollection)).to.throw(errors.InvalidCategoryError);

            });

        });

        describe('with a thumbs-up with an invalid date', () => {

            beforeEach(() => {
                thumbsCollection[random.int(0, 50)].date = uuid();
            });

            it('should throw an invalid category error', () => {
                expect(() => SUT.save(thumbsCollection)).to.throw(errors.InvalidDateError);
            });

        });

        describe('with all valid categories and dates', () => {

            beforeEach(() => {
                SUT.save(thumbsCollection)
            });

            it('should save the thumbs to the correct corresponding repositories', () => {
                let cleanCount = thumbsCollection.filter(thumb => thumb.category === CONSTS.CATEGORIES.CLEAN).length,
                    friendlyCount = thumbsCollection.filter(thumb => thumb.category === CONSTS.CATEGORIES.FRIENDLY).length,
                    promptCount = thumbsCollection.filter(thumb => thumb.category === CONSTS.CATEGORIES.PROMPT).length;

                sinon.assert.callCount(repoStubs.clean.save, cleanCount);
                sinon.assert.callCount(repoStubs.friendly.save, friendlyCount);
                sinon.assert.callCount(repoStubs.prompt.save, promptCount);
            });

            it('should convert the date string into an Date object', () => {
               expect(thumbsCollection.every(thumb => thumb.date instanceof Date )).to.be.true;
            });

        });

    });

    describe('When getting the driver leaderboard of a thumbs-up category', () => {

        describe('with an invalid category', () => {

            it('should throw an invalid category error', () => {
                expect(() => SUT.getDriverLeaderboard(uuid())).to.throw(errors.InvalidCategoryError);
            });

        });

        describe('with valid category', () => {
            let category,
                catRepoStub,
                returnedThumbs,
                results;

            beforeEach(() => {
                category = utils.randomCategory();
                catRepoStub = repoStubs[category];

                returnedThumbs = [];

                for (let i = 0; i < 10; i++)
                    returnedThumbs.push(utils.randomThumb());

                catRepoStub.getTopTen.returns(returnedThumbs);

                results = SUT.getDriverLeaderboard(category)
            });

            it('Should return the results from the corresponding repository', () => {
                sinon.assert.calledOnce(catRepoStub.getTopTen);
                expect(results).to.eql(returnedThumbs);
            });
        });

    });

});