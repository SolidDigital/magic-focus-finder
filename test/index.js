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
            var options = { keymap : {}, focusableAttribute : '', defaultFocusedElement : '', dynamicPositionAttribute : '', captureFocusAttribute: '', focusedClass : '', container : '', eventNamespace : '', overrideDirectionAttribute : '' };

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
            var options = { keymap : {}, focusableAttribute : '', overrideDirectionAttribute : '', dynamicPositionAttribute : '', captureFocusAttribute: '', focusedClass : '', defaultFocusedElement : '', container : '', eventNamespace : '' };

            browser.window.magicFocusFinder.configure(options);

            expect(browser.window.magicFocusFinder.getConfig()).to.deep.equal(options);
        });
    });

    describe('the start method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('start');
        });

        it('should set the default focused element if one was set', function() {
            browser.window.magicFocusFinder
                .configure({ defaultFocusedElement : '#focusableInput' })
                .start();

            expect(browser.document.querySelector('#focusableInput').classList.contains('focused')).to.be.true;
        });

        it('should ignore elements that are hidden', function() {
            browser.window.magicFocusFinder.start();

            expect(_.pluck(browser.window.magicFocusFinder.private.knownElements, 'id')).to.not.contain('hiddenInputWithFocusableAttr');
        });

        describe('the cached-position added to each element', function() {
            it('should add the cached-position to each element', function() {
                browser.window.magicFocusFinder.start();

                expect(_.first(browser.window.magicFocusFinder.private.knownElements).magicFocusFinderPosition).to.exist;
            });

            it('should have the properties, x, y, otx, oty, obx, oby, olx, oly, orx, ory', function() {
                var position;

                browser.window.magicFocusFinder.start();

                position = _.first(browser.window.magicFocusFinder.private.knownElements).magicFocusFinderPosition;

                expect(position).to.have.all.keys('x', 'y', 'otx', 'oty', 'obx', 'oby', 'olx', 'oly', 'orx', 'ory');
            });
        });

        describe('when the config.container is set', function() {
            it('should register every element descending from the container', function() {
                browser.window.magicFocusFinder
                    .configure({ container : '#iContainMoreFocusables'})
                    .start();

                expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('#iContainMoreFocusables li').length);
            });
        });

        describe('when the config.container is not set', function() {
            it('should register every element with the default focusable attribute descending from the document', function() {
                browser.window.magicFocusFinder.start();

                expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('[focusable]').length - browser.document.querySelectorAll('.hidden').length);
            });
        });
    });

    describe('the refresh method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('refresh');
        });

        it('will refresh the known elements collection', function() {
            browser.window.magicFocusFinder.start();

            expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('[focusable]').length - browser.document.querySelectorAll('.hidden').length);

            browser.window.magicFocusFinder.refresh();

            expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('[focusable]').length - browser.document.querySelectorAll('.hidden').length);
        });

        it('will respect and changed config values', function() {
            browser.window.magicFocusFinder.start();

            expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('[focusable]').length - browser.document.querySelectorAll('.hidden').length);

            browser.window.magicFocusFinder
                .configure({ container : '#iContainMoreFocusables'})
                .refresh();

            expect(browser.window.magicFocusFinder.private.knownElements.length).to.equal(browser.document.querySelectorAll('#iContainMoreFocusables li').length);
        });
    });

    describe('the setCurrent method', function() {
        it('should exist on the module', function() {
            expect(browser.window.magicFocusFinder).itself.to.respondTo('setCurrent');
        });

        describe('given a selector', function() {
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
                expect(browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv')).to.equal(browser.window.magicFocusFinder);
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

            it('should focus and add the focus class to the element even if it does not have the focusable attribute', function() {
                browser.window.magicFocusFinder.setCurrent('#withNoFocusableAttribute');

                expect(browser.window.magicFocusFinder.private.currentlyFocusedElement).to.deep.equal(browser.document.querySelector('#withNoFocusableAttribute'));
            });

            describe('given a previously focused element', function() {
                it('should remove the focused class and pseudo state from the previous element', function() {
                    browser.window.magicFocusFinder.setCurrent('#focusableInput');

                    browser.window.magicFocusFinder.setCurrent('#nonFocusableDiv');

                    expect(browser.document.querySelector('#focusableInput').classList.contains('focused')).to.be.false;
                });
            });
        });

        describe('given a element reference', function() {
            it('should accept a element reference', function() {
                browser.window.magicFocusFinder.setCurrent(browser.document.querySelector('#focusableInput'));

                expect(browser.document.querySelector(':focus').id).to.equal('focusableInput');
            });
        });

    });

    describe('the eventManager', function() {

    });
});
