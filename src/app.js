const SwaggerExpress = require('swagger-express-mw'),
    swaggerUi = require('swagger-ui-express'),
    express = require('express'),
    globalErrorHandler = require('./globalErrorHandler');

const app = express();

let config = {
  appRoot: __dirname // required config
};

let ready = new Promise((resolve, reject) => {
    SwaggerExpress.create(config, function(err, swaggerExpress) {

        if (err) { reject(err);}

        // install middleware
        swaggerExpress.register(app);

        let port = process.env.PORT || 3000;

        let rootUri = `http://localhost:${port}/`,
            swaggerOptions = {
                swaggerUrl: `${rootUri}api/swagger`
            };

        app.use('/', swaggerUi.serve, swaggerUi.setup(null,swaggerOptions));

        app.use(globalErrorHandler);

        let server = app.listen(port, () => {
            console.log(`Application running and available at: ${rootUri}`);
            resolve(server);
        });
    });
});


module.exports = app; // for testing

// for integration testing
module.exports.ready = ready;

