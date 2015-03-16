define(['chai', 'mocha', 'lodash', 'magicFocusFinder'], function(chai, mocha, _, mff) {
    'use strict';

    var expect = chai.expect,
        document = window.document;

    mocha.setup('bdd');
    chai.config.includeStack = true;

    describe('Magic Focus Finder Tests', function() {

        afterEach(function() {
            mff.destroy();
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
                    overrideDirectionAttribute : '',
                    watchDomMutations: true
                };

                mff.configure(options);

                expect(mff.getConfig()).to.deep.equal(options);
            });

            it('should merge onto the original configs if run more than once', function() {
                var options = {
                    keymap : {},
                    focusableAttribute : '',
                    defaultFocusedElement : '',
                    dynamicPositionAttribute : '',
                    captureFocusAttribute: '',
                    focusedClass : '',
                    container : '',
                    eventNamespace : '',
                    overrideDirectionAttribute : '',
                    watchDomMutations: true
                };

                mff.configure(options);

                mff.configure();

                expect(mff.getConfig()).to.deep.equal(getOriginalOptions());
            });

            it('should merge the passed configure with the current one, so as to support partial config updates', function() {
                var options = { keymap : {} };

                mff.configure(options);

                expect(mff.getConfig()).to.deep.equal(_.merge(getOriginalOptions(), options));
            });

            xit('should perform basic validation on the options object (keymap has all dirctions, that nothing required is blown out accidentally)', function() {

            });

            it('should use the element from the config when the container is set as an element reference and not a selector', function() {
                var options = {
                    container : document.querySelector('#example1')
                };

                mff.configure(options);

                expect(mff.getConfig().container.isEqualNode(options.container)).to.be.true;
            });
        });

        describe('the getConfig method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('getConfig');
            });

            it('should return the current configuration', function() {
                var keys = [
                    'keymap',
                    'focusableAttribute',
                    'defaultFocusedElement',
                    'dynamicPositionAttribute',
                    'captureFocusAttribute',
                    'focusedClass',
                    'container',
                    'eventNamespace',
                    'overrideDirectionAttribute',
                    'watchDomMutations'
                ];

                expect(mff.getConfig()).to.have.all.keys(keys);
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
                    eventNamespace : '',
                    watchDomMutations : true
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
                    .configure({
                        defaultFocusedElement : '#focusableInput',
                        container : '#something'
                    })
                    .start();

                expect(document.querySelector('#focusableInput').classList.contains('focused')).to.be.true;
            });

            it('should ignore elements that are hidden', function() {
                mff.start();

                expect(_.pluck(mff.getKnownElements(), 'id')).to.not.contain('hiddenInputWithFocusableAttr');
            });

            describe('the cached-position added to each element', function() {
                it('should add the cached-position to each element', function() {
                    mff.start();

                    expect(_.first(mff.getKnownElements()).magicFocusFinderPosition).to.exist;
                });

                it('should have the properties, x, y, otx, oty, obx, oby, olx, oly, orx, ory', function() {
                    var position;

                    mff.start();

                    position = _.first(mff.getKnownElements()).magicFocusFinderPosition;

                    expect(position).to.have.all.keys('x', 'y', 'otx', 'oty', 'obx', 'oby', 'olx', 'oly', 'orx', 'ory');
                });
            });

            describe('when the config.container is set', function() {
                it('should register every element descending from the container', function() {
                    mff
                        .configure({ container : '#iContainMoreFocusables'})
                        .start();

                    expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('#iContainMoreFocusables li').length);
                });
            });

            describe('when the config.container is not set', function() {
                it('should register every element with the default focusable attribute descending from the document', function() {
                    mff.start();

                    expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);
                });
            });
        });

        describe('the refresh method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('refresh');
            });

            it('will refresh the known elements collection', function() {
                mff.start();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);

                mff.refresh();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);
            });

            it('will respect and changed config values', function() {
                mff.start();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length);

                mff
                    .configure({ container : '#iContainMoreFocusables'})
                    .refresh();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('#iContainMoreFocusables li').length);
            });
        });

        describe('the setCurrent method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('setCurrent');
            });

            describe('given a selector', function() {
                it('should accept an element and give that element focus', function() {
                    mff
                        .configure({
                            container: '#something'
                        })
                        .start()
                        .setCurrent('#focusableInput');

                    expect(document.querySelector('.focused').id).to.equal('focusableInput');
                });
                it('should give class and focus pseudo state to focusable elements', function() {
                    mff.setCurrent('#focusableInput');

                    expect(document.querySelector('.focused').id).to.equal('focusableInput');
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

                    expect(mff.getCurrent()).to.equal(document.querySelector('#nonFocusableDiv'));
                });

                it('should focus and add the focus class to the element even if it does not have the focusable attribute', function() {
                    mff.setCurrent('#withNoFocusableAttribute');

                    expect(mff.getCurrent()).to.equal(document.querySelector('#withNoFocusableAttribute'));
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

                    expect(document.querySelector('.focused').id).to.equal('focusableInput');
                });
            });

        });

        describe('the getCurrent method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('getCurrent');
            });

            xit('should return the currently focused element', function() {

            });
        });

        describe('the getKnownElements method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('getKnownElements');
            });

            xit('should return the knownElements array', function() {

            });
        });

        describe('the destroy method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('destroy');
            });

            xit('should reset the config options', function() {

            });

            xit('should clear out the known elements', function() {

            });

            xit('should remove event listeners that were added', function() {

            });

            xit('should stop watching the DOM for changes', function() {

            });
        });

        describe('the eventManager', function() {

        });

        describe('focus change logic', function() {

            describe('in a simple grid', function() {
                it('should move to the right one node when moving right', function() {
                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.move.right();

                    expect(mff.getCurrent().className).to.equal('box block2 focused');
                });
            });

            xit('should move directly to the right even if there is something closer to the right but more above', function() {

                mff
                    .configure({
                        container: '#example4'
                    })
                    .start();

                expect(mff.getCurrent().className).to.equal('box block37 focused');

                mff.move.right();
                // mff.private.move.right.call(mff);
                // looks like zombie has all bounding client rectangles as 0 0
                expect(mff.getCurrent().className).to.equal('box block38 focused');
            });
        });

        describe('the mutation observer features', function() {
            it('should be able to be turned off for crappy browsers', function() {
                var appendee = document.createElement('div'),
                    initialFocusableCount = document.querySelector('#iContainMoreFocusables').querySelectorAll('[focusable]').length;

                appendee.setAttribute('focusable', 'focusable');

                mff
                    .configure({
                        watchDomMutations : false,
                        container : '#iContainMoreFocusables'
                    })
                    .start();

                expect(mff.getKnownElements().length).to.equal(initialFocusableCount);

                document.querySelector('#iContainMoreFocusables').appendChild(appendee);

                expect(mff.getKnownElements().length).to.equal(initialFocusableCount);
            });

            xit('should add an element to the knownElements collection when added to the dom', function(done) {
                var appendee = document.createElement('div'),
                    initialFocusableCount = document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length;

                appendee.setAttribute('focusable', 'focusable');

                mff.start();

                expect(mff.getKnownElements().length).to.equal(initialFocusableCount);

                document.querySelector('#iContainMoreFocusables').appendChild(appendee);

                setTimeout(function() {
                    expect(mff.getKnownElements().length).to.equal(initialFocusableCount + 1);
                    done();
                }, 1000);
            });

            //https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
            it('should only add HTML nodes of type === 1 and no text/comment nodes.', function(done) {
                var appendee = document.createTextNode('juju bone'),
                    initialFocusableCount = document.querySelectorAll('[focusable]').length - document.querySelectorAll('.hidden').length;

                mff.start();

                document.querySelector('#iContainMoreFocusables').appendChild(appendee);

                setTimeout(function() {
                    expect(mff.getKnownElements().length).to.equal(initialFocusableCount);
                    done();
                }, 1000);
            });
        });
    });

    function getOriginalOptions() {
        return {
            keymap : [
                {
                    direction : 'up',
                    code : 38
                },
                {
                    direction : 'down',
                    code : 40
                },
                {
                    direction : 'left',
                    code : 37
                },
                {
                    direction : 'right',
                    code : 39
                },
                {
                    direction : 'enter',
                    code : 13
                }
            ],
            focusableAttribute : 'focusable',
            defaultFocusedElement : null,
            container : 'document',
            eventNamespace : 'magicFocusFinder',
            focusedClass : 'focused',
            overrideDirectionAttribute : 'focus-overrides',
            captureFocusAttribute : 'capture-focus',
            dynamicPositionAttribute : 'dynamic-position',
            watchDomMutations : true
        };
    }
});
