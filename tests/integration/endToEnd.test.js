const expect = require('chai').expect,
    request = require('supertest'),
    uuid = require('uuid/v4'),
    moment = require('moment'),

    app = require('../../src/app'),

    utils = require('../utils');


moment.suppressDeprecationWarnings = true;

let buildEndFunction = (result, done) => {
  return (err, resp) => {
      result.error = err || resp.error;
      result.response = resp;
      done();
  }
};

describe('End to end API tests', () => {

    after(() => {
        // stop the API to clean up resources
        app.ready.then((server) => {
            server.close();
        });
    });

    describe('When querying a leaderboard that is of an empty data set', () => {

        it('should return an empty leaderboard', (done) => {
            request(app).get(`/api/thumbsUp/leaderboard/clean/`)
                .end((err, resp) => {
                    expect(resp.statusCode).to.eq(200);
                    expect(resp.body).to.eql([]);
                    done();
                });
        });

    });

    describe('When posting a new thumbs-up', () => {
        let postedThumb,
            result;

        describe('that is valid', () => {

            before((done) => {
               postedThumb = utils.randomThumb({ category: 'prompt' });

               result = {};

               request(app).post('/api/thumbsUp')
                    .send([ postedThumb ])
                    .end(buildEndFunction(result, done));
            });

            it('should return post successfully with a response of 201 Created', () => {
                expect(result.response.statusCode).to.eq(201);
                expect(result.response.body).to.eq('Created');
            });

            it('should return the posted thumb in the leaderboard', (done) => {
               request(app).get(`/api/thumbsUp/leaderboard/${postedThumb.category}/`)
                   .end((err, resp) => {
                       expect(resp.statusCode).to.eq(200);
                       expect(resp.body).to.deep.include({name: postedThumb.name, total: 1, date: moment(postedThumb.date).toISOString() });
                       done();
                   });
            });

        });

        describe('that has an invalid category', () => {

            before((done) => {
               postedThumb = utils.randomThumb({ category: uuid()});

               result = {};

               request(app).post('/api/thumbsUp')
                    .send([ postedThumb ])
                    .end(buildEndFunction(result, done));
            });

            it('should return a 400 status code', () => {
                expect(result.response.statusCode).to.eql(400);
            });

            it('should return a validation error', () => {
                let errResponse = JSON.parse(result.error.text);

                expect(errResponse.message).to.eq('Validation errors');
                expect(errResponse.errors[0]).to.include({ code: 'INVALID_REQUEST_PARAMETER'});
                expect(errResponse.errors[0].errors[0]).to.include({message: `No enum match for: ${postedThumb.category}` })
            });
        });

        describe('that has an invalid date', () => {

            before((done) => {
               postedThumb = utils.randomThumb({ date: uuid()});

               result = {};

               request(app).post('/api/thumbsUp')
                    .send([ postedThumb ])
                    .end(buildEndFunction(result, done));
            });

            it('should return a 400 status code', function () {
                expect(result.response.statusCode).to.eql(400);
            });

            it('should return a validation error', () => {
                let errResponse = JSON.parse(result.error.text);

                expect(errResponse.message).to.eq('Validation errors');
                expect(errResponse.errors[0]).to.include({ code: 'INVALID_REQUEST_PARAMETER'});
                expect(errResponse.errors[0].errors[0]).to.include({message: `Object didn't pass validation for format date-time: ${postedThumb.date}`});
            });

        });

    });

    describe('When posting a bulk data set of thumbs-up', () => {
        let result;

        before((done) => {
            result = {};

            let bulkData = [
                { name: 'Darius', category: 'clean', date: moment('6/15/1983').toISOString() },
                { name: 'Darius', category: 'clean', date: moment('6/15/2018').toISOString() },
                { name: 'Darius', category: 'prompt', date: moment('6/15/2018').toISOString() },
                { name: 'Darius', category: 'friendly', date: moment('6/15/2018').toISOString() },
                { name: 'Neeko', category: 'clean', date: moment('10/8/1985').toISOString() },
                { name: 'Neeko', category: 'clean', date: moment('10/8/2010').toISOString() },
                { name: 'Garen', category: 'clean', date: moment('12/8/2010').toISOString() },
                { name: 'Rammus', category: 'clean', date: moment('11/8/2010').toISOString() },
                { name: 'Lux', category: 'clean', date: moment('10/8/2010').toISOString() },
                { name: 'Caitlyn', category: 'clean', date: moment('7/8/2010').toISOString() },
                { name: 'Ashe', category: 'clean', date: moment('9/8/2010').toISOString() },
                { name: 'Jax', category: 'clean', date: moment('4/8/2010').toISOString() },
                { name: 'Poppy', category: 'clean', date: moment('8/8/2010').toISOString() },
                { name: 'Master Yi', category: 'clean', date: moment('6/8/2010').toISOString() },
                { name: 'Nasus', category: 'clean', date: moment('8/8/2000').toISOString() },
                { name: 'Gnar', category: 'clean', date: moment('5/8/2010').toISOString() }
            ];

            request(app).post('/api/thumbsUp')
                .send(bulkData)
                .end(buildEndFunction(result, done));
        });

       it('should return post successfully with a response of 201 Created', () => {
            expect(result.response.statusCode).to.eq(201);
            expect(result.response.body).to.eq('Created');
       });

       it('should return the correct leaderboard', function (done) {
           let expectedResponse = [
               { name: 'Darius', total: 2, date: moment('6/15/2018').toISOString() },
               { name: 'Neeko', total: 2, date: moment('10/8/2010').toISOString() },
               { name: 'Garen', total: 1, date: moment('12/8/2010').toISOString() },
               { name: 'Rammus', total: 1, date: moment('11/8/2010').toISOString() },
               { name: 'Lux', total: 1,  date: moment('10/8/2010').toISOString() },
               { name: 'Ashe', total: 1,  date: moment('9/8/2010').toISOString() },
               { name: 'Poppy', total: 1, date: moment('8/8/2010').toISOString() },
               { name: 'Caitlyn', total: 1,  date: moment('7/8/2010').toISOString() },
               { name: 'Master Yi', total: 1, date: moment('6/8/2010').toISOString() },
               { name: 'Gnar', total: 1, date: moment('5/8/2010').toISOString() },
           ];

           request(app).get(`/api/thumbsUp/leaderboard/clean/`)
               .end((err, resp) => {
                   expect(resp.statusCode).to.eq(200);
                   expect(resp.body).to.eql(expectedResponse);
                   done();
               });

       });

    });

    describe('When querying for a leaderboard of an invalid category', () => {
        let result,
            category;

        before((done) => {
            category = uuid();

            result = {};

            request(app).get(`/api/thumbsUp/leaderboard/${category}/`)
                .end(buildEndFunction(result, done));
        });

        it('should return a 400 status code', () => {
            expect(result.response.statusCode).to.eql(400);
        });

        it('should return a validation error', () => {
            let errResponse = JSON.parse(result.error.text);

            expect(errResponse.message).to.eq('Validation errors');
            expect(errResponse.errors[0]).to.include({ code: 'INVALID_REQUEST_PARAMETER'});
            expect(errResponse.errors[0].errors[0]).to.include({message: `No enum match for: ${category}` })
        });
    });

});
