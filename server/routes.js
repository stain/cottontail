/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var config = require('./config/environment');

module.exports = function (app) {

    // Insert routes below
    app.use('/api/fs', require('./api/fs'));
    app.use('/api/log', require('./api/log'))
    app.use('/api/common', require('./api/common'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the index.html
    //app.route('/*')
    //    .get(function (req, res) {
    //        res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    //    });
};
