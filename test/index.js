'use strict';

var chai = require('chai'),
    Browser = require('zombie'),
    _ = require('lodash'),
    expect = chai.expect,
    browser,
    mff,
    document;

chai.config.includeStack = true;

describe('Magic Focus Finder Tests', function() {

    before(function(done) {
        browser = new Browser();

        require('./server')
            .start()
            .then(done);
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

        browser.wait(requireJsLoaded, function() {
            mff = browser.window.magicFocusFinder;
            document = browser.document;
            done();
        });

        browser
            .visit('http://localhost:3000/')
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
            expect(mff).itself.to.respondTo('configure');
        });

        it('should return the module instance for chaining', function() {
            expect(mff.configure()).to.equal(mff);
        });

        it('should set the configuration on the module', function() {
            var options = {
                keymap : {},
                focusableAttribute : '',
                defaultFocusedElement : '',
                dynamicPositionAttribute : '',
                captureFocusAttribute: '',
                focusedClass : '',
                container : '',
                eventNamespace : '',
                overrideDirectionAttribute : ''
            };

            mff.configure(options);

            expect(mff.private.config).to.deep.equal(options);
        });

        it('should merge the passed configure with the current one, so as to support partial config updates', function() {
            var originalOptions = mff.private.config,
                options = { keymap : {} };

            mff.configure(options);

            expect(mff.private.config).to.deep.equal(_.merge(originalOptions, options));
        });

        xit('should perform basic validation on the options object (keymap has all dirctions, that nothing required is blown out accidentally)', function() {

        });
    });

    describe('the getConfig method', function() {
        it('should exist on the module', function() {
            expect(mff).itself.to.respondTo('getConfig');
        });

        it('should return the current configuration', function() {
            expect(mff.getConfig()).to.deep.equal(mff.private.config);
        });

        it('after updating the configuration, should return the new configuration', function() {
            var options = {
                keymap : {},
                focusableAttribute : '',
                overrideDirectionAttribute : '',
                dynamicPositionAttribute : '',
                captureFocusAttribute: '',
                focusedClass : '',
                defaultFocusedElement : '',
                container : '',
                eventNamespace : ''
            };

            mff.configure(options);

            expect(mff.getConfig()).to.deep.equal(options);
        });
    });

    describe('the start method', function() {
        it('should exist on the module', function() {
            expect(mff).itself.to.respondTo('start');
        });

        it('should set the default focused element if one was set', function() {
            mff
                .configure({ defaultFocusedElement : '#focusableInput' })
                .start();

            expect(document.querySelector('#focusableInput').classList.contains('focused')).to.be.true;
        });

        it('should ignore elements that are hidden', function() {
            mff.start();

            expect(_.pluck(mff.private.knownElements, 'id')).to.not.contain('hiddenInputWithFocusableAttr');
        });

        describe('the cached-position added to each element', function() {
            it('should add the cached-position to each element', function() {
                mff.start();

                expect(_.first(mff.private.knownElements).magicFocusFinderPosition).to.exist;
            });

            it('should have the properties, x, y, otx, oty, obx, oby, olx, oly, orx, ory', function() {
                var position;

                mff.start();

                position = _.first(mff.private.knownElements).magicFocusFinderPosition;

                expect(position).to.have.all.keys('x', 'y', 'otx', 'oty', 'obx', 'oby', 'olx', 'oly', 'orx', 'ory');
            });
        });

        describe('when the config.container is set', function() {
            it('should register every element descending from the container', function() {
                mff
                    .configure({ container : '#iContainMoreFocusables'})
                    .start();

                expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('#iContainMoreFocusables li').length);
            });
        });

        describe('when the config.container is not set', function() {
            it('should register every element with the default focusable attribute descending from the document', function() {
                mff.start();

                expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);
            });
        });
    });

    describe('the refresh method', function() {
        it('should exist on the module', function() {
            expect(mff).itself.to.respondTo('refresh');
        });

        it('will refresh the known elements collection', function() {
            mff.start();

            expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);

            mff.refresh();

            expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);
        });

        it('will respect and changed config values', function() {
            mff.start();

            expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);

            mff
                .configure({ container : '#iContainMoreFocusables'})
                .refresh();

            expect(mff.private.knownElements.length).to.equal(document.querySelectorAll('#iContainMoreFocusables li').length);
        });
    });

    describe('the setCurrent method', function() {
        it('should exist on the module', function() {
            expect(mff).itself.to.respondTo('setCurrent');
        });

        describe('given a selector', function() {
            it('should accept an element and give that element focus', function() {
                mff.setCurrent('#focusableInput');

                expect(document.querySelector(':focus').id).to.equal('focusableInput');
            });
            it('should give class and focus pseudo state to focusable elements', function() {
                mff.setCurrent('#focusableInput');

                expect(document.querySelector(':focus').id).to.equal('focusableInput');
                expect(document.querySelector('#focusableInput').classList.contains('focused')).to.be.true;
            });

            it('should give class to non focusable elements', function() {
                mff.setCurrent('#nonFocusableDiv');

                expect(document.querySelector('#nonFocusableDiv').classList.contains('focused')).to.be.true;
            });

            it('should return itself for chaining', function() {
                expect(mff.setCurrent('#nonFocusableDiv')).to.equal(mff);
            });

            it('should still return itself when called with nothing', function() {
                expect(mff.setCurrent()).to.deep.equal(mff);
            });

            it('should not fail if that element does not exist', function() {
                expect(mff.setCurrent('#doesNotExist')).to.not.throw;
            });

            it('should update the currently focued element', function() {
                mff.setCurrent('#nonFocusableDiv');

                expect(mff.private.currentlyFocusedElement).to.equal(document.querySelector('#nonFocusableDiv'));
            });

            it('should focus and add the focus class to the element even if it does not have the focusable attribute', function() {
                mff.setCurrent('#withNoFocusableAttribute');

                expect(mff.private.currentlyFocusedElement).to.equal(document.querySelector('#withNoFocusableAttribute'));
            });

            describe('given a previously focused element', function() {
                it('should remove the focused class and pseudo state from the previous element', function() {
                    mff.setCurrent('#focusableInput');

                    mff.setCurrent('#nonFocusableDiv');

                    expect(document.querySelector('#focusableInput').classList.contains('focused')).to.be.false;
                });
            });
        });

        describe('given a element reference', function() {
            it('should accept a element reference', function() {
                mff.setCurrent(document.querySelector('#focusableInput'));

                expect(document.querySelector(':focus').id).to.equal('focusableInput');
            });
        });

    });

    describe('the eventManager', function() {

    });

    describe('focus change logic', function() {

        it('should move directly to the right even if there is somethin closer to the right but more above', function() {

            mff
                .configure({
                    container: '#example4'
                })
                .refresh();

            mff.setCurrent('.block37');

            expect(mff.getCurrent().className).to.equal('box block37 focused');

            mff.private.move.right.call(mff);
            expect(mff.getCurrent().className).to.equal('box block38 focused');
        });
    });
});
