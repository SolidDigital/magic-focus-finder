var chai = require('chai'),
    Browser = require('zombie'),
    expect = chai.expect,
    browser;

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

    beforeEach(function(done) {
        browser.visit('http://localhost:3000/')
            .then(done)
            .catch(done);
    });

    it('should render a page and make assertion with no errors', function() {
        expect(browser.text('title')).to.equal('Magic Focus Finder Tests');
    });

    describe('the configure method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).to.have.property('configure');
        });

        xit('should return the module instance for chaining', function() {
            expect(browser.window.magicFocusFinder.configure()).to.equal(browser.window.magicFocusFinder);
        });

        xit('should set the configuration on the module', function() {

        });

        xit('should be able to be called at any time to change the configuration', function() {

        });
    });

    describe('the getConfig method', function() {
        xit('should return the current configuration', function() {

        });

        xit('after updating the configuration, should return the new configuration', function() {

        });
    });
});
