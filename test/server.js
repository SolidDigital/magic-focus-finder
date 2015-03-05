'use strict';

var BB = require('bluebird'),
    express = require('express'),
    path = require('path'),
    server;

module.exports = {
    start : start,
    stop : stop
};

function start() {
    return new BB(function(resolve, reject) {
        var app = express();

        app.use(express.static(path.join(process.cwd(), 'test/public')));

        server = app.listen(3000, function(err) {
            if(err) { reject(); }
            resolve();
        });
    });
}

function stop() {
    server.close();
}
