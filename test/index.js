var chai = require('chai'),
    Browser = require('zombie'),
    _ = require('lodash'),
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
        browser.open();

        function requireJsLoaded(window) {
            return 'true' === window.document.getElementById('requireJsLoaded').innerHTML;
        }

        browser.wait(requireJsLoaded, done);

        browser.visit('http://localhost:3000/')
            .catch(done);
    });

    afterEach(function() {
        browser.close();
    });

    it('should render a page and make assertion with no errors', function() {
        expect(browser.text('title')).to.equal('Magic Focus Finder Tests');
    });

    describe('the configure method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('configure');
        });

        it('should return the module instance for chaining', function() {
            expect(browser.window.magicFocusFinder.configure()).to.equal(browser.window.magicFocusFinder);
        });

        it('should set the configuration on the module', function() {
            var options = { keymap : {}, focusableAttribute : '', defaultFocusedElement : '', focusedClass : '', container : '', eventNamespace : '' };

            browser.window.magicFocusFinder.configure(options);

            expect(browser.window.magicFocusFinder.private.config).to.deep.equal(options);
        });

        it('should merge the passed configure with the current one, so as to support partial config updates', function() {
            var originalOptions = browser.window.magicFocusFinder.private.config,
                options = { keymap : {} };

            browser.window.magicFocusFinder.configure(options);

            expect(browser.window.magicFocusFinder.private.config).to.deep.equal(_.merge(originalOptions, options));
        });

        xit('should perform basic validation on the options object (keymap has all dirctions, that nothing required is blown out accidentally)', function() {

        });
    });

    describe('the getConfig method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('getConfig');
        });

        it('should return the current configuration', function() {
            expect(browser.window.magicFocusFinder.getConfig()).to.deep.equal(browser.window.magicFocusFinder.private.config);
        });

        it('after updating the configuration, should return the new configuration', function() {
            var options = { keymap : {}, focusableAttribute : '', focusedClass : '', defaultFocusedElement : '', container : '', eventNamespace : '' };

            browser.window.magicFocusFinder.configure(options);

            expect(browser.window.magicFocusFinder.getConfig()).to.deep.equal(options);
        });
    });

    describe('the start method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('start');
        });


    });

    describe('the setCurrent method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('setCurrent');
        });

        it('should accept an element and give that element focus', function() {
            browser.window.magicFocusFinder.setCurrent('#focusableInput');

            expect(browser.document.querySelector(':focus').id).to.equal('focusableInput');
        });

        it('should give class and focus pseudo state to focusable elements', function() {
            browser.window.magicFocusFinder.setCurrent('#focusableInput');

            expect(browser.document.querySelector(':focus').id).to.equal('focusableInput');
            expect(browser.document.querySelector('#focusableInput').classList.contains('focused')).to.be.true;
        });

        it('should give class to non focusable elements', function() {
            browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv');

            expect(browser.document.querySelector('#nonFocusableDiv').classList.contains('focused')).to.be.true;
        });

        it('should return itself for chaining', function() {
            expect(browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv')).to.deep.equal(browser.window.magicFocusFinder);
        });

        it('should still return itself when called with nothing', function() {
            expect(browser.window.magicFocusFinder.setCurrent()).to.deep.equal(browser.window.magicFocusFinder);
        });

        it('should not fail if that element does not exist', function() {
            expect(browser.window.magicFocusFinder.setCurrent('#doesNotExist')).to.not.throw;
        });

        it('should update the currently focued element', function() {
            browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv');

            expect(browser.window.magicFocusFinder.private.currentlyFocusedElement).to.deep.equal(browser.document.querySelector('#nonFocusableDiv'));
        });

        describe('given a previously focused element', function() {
            it('should remove the focused class and pseudo state from the previous element', function() {
                browser.window.magicFocusFinder.setCurrent('#focusableInput');

                browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv');

                expect(browser.document.querySelector('#focusableInput').classList.contains('focused')).to.be.false;
            });
        });
    });
});
