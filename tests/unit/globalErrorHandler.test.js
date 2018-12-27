    sinon = require('sinon'),
    random = require('random'),
    uuid = require('uuid/v4'),
    expect = require('chai').expect,

    globalErrorHandler = require('../../src/globalErrorHandler'),
    errors = require('../../src/errors'),

    utils = require('../utils');


describe('globalErrorHandler', () => {
    let SUT,
        respStub;

    beforeEach(() => {
        respStub = utils.buildResponseStub();

        SUT = globalErrorHandler;
    });

    describe('When handling a validation error', () => {
        let thrownError,
            error,
            msg;

        beforeEach(() => {
            msg = uuid();
            error = new errors.InvalidCategoryError(msg);

            try {
                SUT(error, null, respStub);
            } catch (err) {
                thrownError = err;
            }
        });

        it('should respond with a 400 Bad', () => {
            sinon.assert.calledWith(respStub.status, 400);
            sinon.assert.calledWith(respStub.json, `Bad Request: ${msg}`);
        });

        it('should not throw an error', () => {
            expect(thrownError).to.be.undefined;
        });

    });

    describe('When handling a swagger UI header error', () => {

        it('should not throw an error', () => {
            let error = new Error('Can\'t set headers after they are sent.');
            error.stack = 'node_modules/swagger-ui-express/';

            expect(() => SUT(error)).to.not.throw();
        });

    });

    describe('When handling an unknown error', () => {

        it('should re-throw error', () => {
            let error = new Error(uuid());
            expect(() => SUT(error)).to.throw(error);
        });

    });

});
