var chai = require('chai'),
    Browser = require('zombie'),
    serverInstance,
    browser;

chai.should();

chai.config.includeStack = true;

describe('Magic Focus Finder Tests', function() {
    'use strict';

    before(function(done) {
        browser = new Browser();

        require('./server').start()
            .then(function() {
                done();
            });
    });

    after(function(done) {
        require('./server').stop();
        done();
    });

    it('should render a page and make assertion with no errors', function(done) {
        browser.visit('http://localhost:3000/')
            .then(function() {
                browser.text('title').should.equal('Magic Focus Finder Tests');
                done();
            })
            .catch(done);
    });

});
