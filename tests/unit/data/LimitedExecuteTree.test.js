const LimitedExecuteTree = require('../../../src/data/LimitedExecuteTree');
    expect = require('chai').expect,
    random = require('random'),
    uuid = require('uuid/v4');


describe('LimitedExecuteTree', () => {
    let SUT;

    beforeEach(() => {
        SUT = new LimitedExecuteTree();
    });

    describe('When calling executeOnEveryNodeReverse', function () {
        let insertedNodes,
            resultNodes,
            resultKeys;

        beforeEach(() => {
            insertedNodes = {};
            resultNodes = {};
            resultKeys = [];

            for(let i = 0; i < 25; i++) {
                let ranKey = random.int(0, 100);

                if(insertedNodes[ranKey])
                    insertedNodes[ranKey].push(uuid());
                else
                    insertedNodes[ranKey] = [uuid()];
            }

            for (let key in insertedNodes)
                insertedNodes[key].forEach((val) => SUT.insert(parseInt(key), val));
        });

        describe("By always returning true", () => {

            beforeEach(() => {
                SUT.executeOnEveryNodeReverse((key, data) => {
                    resultKeys.push(key);
                    resultNodes[key] = data;

                    return true;
                });
            });

            it('Should return every node in reverse order', () => {
                let expectedKeys = Object.keys(insertedNodes)
                                        .map((val) => parseInt(val))
                                        .sort((a, b) => b - a);

                expect(resultKeys).to.eql(expectedKeys);
                expect(resultNodes).to.eql(insertedNodes);
            });

        });

        describe("By returning false after 5 results", () => {

            beforeEach(() => {
                SUT.executeOnEveryNodeReverse((key, data) => {
                    if(resultKeys.length >= 5)
                        return false;

                    resultKeys.push(key);
                    resultNodes[key] = data;

                    return true;
                });
            });

            it('Should return only 5 keys and their related data elements in reverse order', () => {
                let expectedKeys = Object.keys(insertedNodes)
                                        .map((val) => parseInt(val))
                                        .sort((a, b) => b - a)
                                        .slice(0, 5);

                let expectedNodes = {};
                expectedKeys.forEach((key) => expectedNodes[key] = insertedNodes[key]);

                expect(resultKeys).to.eql(expectedKeys);
                expect(resultNodes).to.eql(expectedNodes);
            });

        });

    });

});