const sinon = require('sinon'),
    random = require('random'),
    uuid = require('uuid/v4');

function buildResponseStub() {
    let respStub = {
        status: sinon.stub(),
        json: sinon.stub(),
    };

    respStub.status.returns(respStub);
    respStub.json.returns(respStub);

    return respStub;
}

function randomCategory() {
    let category = 'clean';

    switch (random.int(0, 3)) {
        case 0:
            category = 'friendly';
            break;
        case 1:
            category = 'prompt';
            break;
    }

    return category;
}

function randomDate() {
    return new Date(Math.random() * new Date().getTime());
}

function randomThumb(options) {
    options = options || {};

    let thumb = {
        category: options.category,
        name: options.name
    };

    if(!thumb.name)
        thumb.name = uuid();

    if(!thumb.category)
        thumb.category = randomCategory();

    if(options.date)
        thumb.date = options.date;
    else if(options.dateAsString)
        thumb.date = randomDate().toISOString();
    else
        thumb.date = randomDate();

    return thumb;
}

module.exports = {
    buildResponseStub,
    randomCategory,
    randomDate,
    randomThumb
};