const proxyquire = require('proxyquire'),
    expect = require('chai').expect,
    sinon = require('sinon'),
    random = require('random'),
    moment = require('moment'),
    uuid = require('uuid/v4'),

    LimitedExecuteTree = require('../../../src/data/LimitedExecuteTree'),

    utils = require('../../utils');


describe('ThumbsUpRepository', () => {
    let SUT,
        treeStub,
        treeStubConstructor,
        CategoryRepository,
        category;

    beforeEach(() => {
        treeStub= sinon.createStubInstance(LimitedExecuteTree);
        treeStubConstructor = sinon.stub();
        treeStubConstructor.returns(treeStub);

        CategoryRepository = proxyquire('../../../src/data/ThumbsUpCategoryRepository',
            {
                './LimitedExecuteTree': treeStubConstructor
            });

        category = uuid();

        SUT = new CategoryRepository(category);
    });

    describe('When constructing', () => {

        it('should set the name property', () => {
            expect(SUT).to.have.property('name', category);
        });

        it('should set an empty _drivers property', () => {
            expect(SUT).to.have.property('_drivers');
        });

        it('should construct a new AVLTree and set it to the _tree property', () => {
            expect(treeStubConstructor.calledOnce).to.be.true;
            expect(SUT).to.have.property('_tree', treeStub);
        });

        it('should be of a ThumbCategoryRepository type', () => {
           expect(SUT).to.be.a('ThumbsUpCategoryRepository');
        });

    });

    describe('When saving a thumbs up', () => {
        let name;

        beforeEach(() => {
            name = uuid();
        });

        describe('With a category that does not match the repositories category', () => {

            it('should throw an error', () => {
                let testFunc = () => {
                    SUT.save(utils.randomThumb({ category: uuid() }));
                };

                expect(testFunc).to.throw();
            });

        });

        describe('With a new driver', () => {

            beforeEach(() => {
                SUT.save(utils.randomThumb({ category, name }));
            });

            it('should insert the driver into the AVL tree', () => {
                sinon.assert.calledOnce(treeStub.insert);
                sinon.assert.calledWith(treeStub.insert, 1, sinon.match.has('name', name));
            });

            it('should insert the driver into the _drivers object with a total of 1', () => {
                expect(SUT._drivers).to.have.property(name);
                expect(SUT._drivers[name]).to.include({ total: 1, name});
            });

        });

        describe('With an existing driver', () => {
            let total,
                date;

            beforeEach(() => {
                total = random.int(0, 100);
                SUT._drivers = {
                    [name]: {
                        date: new Date(),
                        name,
                        total
                    }
                };
            });

            describe('With a newer date', () => {

                beforeEach(() => {
                    date = moment(new Date()).add(5, 'days').toDate();

                    SUT.save({ category, name, date });
                });

                it('should delete the existing value in the tree', () => {
                    sinon.assert.calledOnce(treeStub.delete);
                    sinon.assert.calledWith(treeStub.delete, total, sinon.match.has('name', name));
                });

                it('should insert the driver into the _drivers object with a incremented total and updated date', () => {
                    expect(SUT._drivers[name]).to.include({ total: (total + 1), name, date });
                });

            });

            describe('With an older date', () => {

                beforeEach(() => {
                    date = moment(new Date()).add(-5, 'days').toDate();

                    SUT.save({ category, name, date });
                });

                it('should delete the existing value in the tree', () => {
                    sinon.assert.calledOnce(treeStub.delete);
                    sinon.assert.calledWith(treeStub.delete, total, sinon.match.has('name', name));
                });

                it('should insert the driver into the _drivers object with a incremented total and an untouched date', () => {
                    expect(SUT._drivers[name]).to.include({ total: (total + 1), name, date: SUT._drivers[name].date });
                });

            });

        });

    });

    describe('When getting the top ten', () => {
        let results,
            callArgs;

        beforeEach(() => {
            treeStub.executeOnEveryNodeReverse.callsFake((dataFun) => {
                callArgs.forEach((callArg) => {
                    dataFun(callArg[0], callArg[1]);
                });
            });
        });

        describe('with less than 10 results', () => {

            beforeEach(() => {
                callArgs = [
                    [ random.int(0, 100), [ utils.randomThumb() ]],
                    [ random.int(0, 100), [ utils.randomThumb(), utils.randomThumb() ]] // Same tree key with multiple values
                ];

                results = SUT.getTopTen();
            });

            it('should call executeOnEveryNodeReverse with a function', () => {
                sinon.assert.calledOnce(treeStub.executeOnEveryNodeReverse);
                sinon.assert.calledWith(treeStub.executeOnEveryNodeReverse, sinon.match.func);
            });

            it('should return all the available data from the tree', () => {
                let expectedResults = callArgs[0][1];
                expectedResults = expectedResults.concat(callArgs[1][1]);

                expect(results).to.have.length(3);
                expect(results).to.eql(expectedResults)
            });

        });

        describe('with more than 10 results', () => {

            beforeEach(() => {
                callArgs = [];

                for(let i = 0; i < 15; i++) {
                    let values = [ utils.randomThumb() ];

                    // Add some keys to have multiple values
                    if(random.int(0, 100) > 30)
                        values.push(utils.randomThumb());

                    callArgs.push([random.int(0, 100), values]);
                }

                results = SUT.getTopTen();
            });

            it('should only return 10 values', () => {
                expect(results).to.have.length(10);
            });

            it('Should return keys with multiple data elements in order of date', () => {
                let expectedResults = [];

                callArgs.forEach((vals) => {
                    let orderedVals = vals[1].sort((a, b) => b.date - a.date);
                    expectedResults = expectedResults.concat(orderedVals)
                });

                expectedResults = expectedResults.slice(0, 10);
                expect(results).to.eql(expectedResults);
            });

        });

    });

});