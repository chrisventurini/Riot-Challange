const categoryRepoFactory = require('../../../src/data/categoryRepoFactory');
    expect = require('chai').expect,
    random = require('random'),
    uuid = require('uuid/v4');


describe('categoryRepoFactory', () => {

    let result,
        categoryName;

    beforeEach(() => {
        categoryName = uuid();
        result = categoryRepoFactory(categoryName);
    });

    describe('When executing once', () => {

        it('Should return a new category repository', () => {
            expect(result).to.be.a('ThumbsUpCategoryRepository');
        });

        it('Should pass the name property of the repository', () => {
            expect(result.name).to.eq(categoryName);
        });

    });

    describe('When executing twice', () => {
        let secondCallResult;

        beforeEach(() => {
            secondCallResult = categoryRepoFactory(categoryName);
        });

        it('Should return the exact same instance', () => {
           expect(secondCallResult).to.eq(result);
        });

    });

});