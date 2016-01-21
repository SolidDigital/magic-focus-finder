define(['chai', 'mocha', 'lodash', 'magicFocusFinder', 'sinon', 'sinon-chai'], function(chai, mocha, _, mff, sinon, sinonChai) {
    'use strict';

    var expect = chai.expect,
        document = window.document;

    chai.use(sinonChai);

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
                    weightOverrideAttribute : '',
                    focusableAttribute : '',
                    defaultFocusedElement : '',
                    dynamicPositionAttribute : '',
                    captureFocusAttribute: '',
                    focusedClass : '',
                    container : '',
                    eventNamespace : '',
                    overrideDirectionAttribute : '',
                    watchDomMutations: true,
                    useRealFocus : true,
                    azimuthWeight : 5,
                    distanceWeight : 1,
                    debug : false,
                    attributeWatchInterval : 100,
                    useMutationObserverFallbacks : false
                };

                mff.configure(options);

                expect(mff.getConfig()).to.deep.equal(options);
            });

            it('should set the configuration on the module as an extension of all the argmuents passed to it', function() {
                var options = {
                        keymap : {},
                        weightOverrideAttribute : 'weight-override',
                        focusableAttribute : '',
                        defaultFocusedElement : '',
                        dynamicPositionAttribute : '',
                        captureFocusAttribute: '',
                        focusedClass : '',
                        container : '#yo',
                        eventNamespace : '',
                        overrideDirectionAttribute : '',
                        watchDomMutations: true,
                        useRealFocus : true,
                        azimuthWeight : 6,
                        distanceWeight : 6,
                        debug : false,
                        attributeWatchInterval : 100,
                        useMutationObserverFallbacks : false
                    },
                    options1 = {
                        keymap: {},
                        focusableAttribute: '',
                        defaultFocusedElement: '',
                        dynamicPositionAttribute: '',
                        captureFocusAttribute: '',
                        focusedClass: ''
                    },
                    options2 =  {
                        container : '',
                        eventNamespace : '',
                        overrideDirectionAttribute : '',
                        watchDomMutations: true,
                        useRealFocus : true
                    },
                    options3 = {
                        azimuthWeight : 5,
                        distanceWeight : 1,
                        debug : false
                    },
                    options4 = {
                        azimuthWeight : 6,
                        distanceWeight : 6,
                        container : '#yo'
                    };

                mff.configure(options1, options2, options3, options4);

                expect(mff.getConfig()).to.deep.equal(options);
            });

            // TODO: this test says one thing but does another
            // The test says configs should be merged on but it is just resetting the configs to the default configs wholesale
            it('should merge onto the original configs if run more than once', function() {
                var options = {
                    keymap : {},
                    weightOverrideAttribute : '',
                    focusableAttribute : '',
                    defaultFocusedElement : '',
                    dynamicPositionAttribute : '',
                    captureFocusAttribute: '',
                    focusedClass : '',
                    container : '',
                    eventNamespace : '',
                    overrideDirectionAttribute : '',
                    watchDomMutations: true,
                    useRealFocus : true,
                    azimuthWeight : 5,
                    distanceWeight : 1,
                    debug : false,
                    useMutationObserverFallbacks : false
                };

                mff.configure(options);

                mff.configure();

                expect(mff.getConfig()).to.deep.equal(getOriginalOptions());
            });

            // TODO: this test says one thing but does another
            // says to merge configs with current configs, but it is merging with default configs instead
            it('should merge the passed configure with the current one, so as to support partial config updates', function() {
                var options = { keymap : {} };

                mff.configure(options);

                expect(mff.getConfig()).to.deep.equal(_.extend(getOriginalOptions(), options));
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
                    'weightOverrideAttribute',
                    'focusableAttribute',
                    'defaultFocusedElement',
                    'dynamicPositionAttribute',
                    'captureFocusAttribute',
                    'focusedClass',
                    'container',
                    'eventNamespace',
                    'overrideDirectionAttribute',
                    'watchDomMutations',
                    'useRealFocus',
                    'azimuthWeight',
                    'distanceWeight',
                    'debug',
                    'attributeWatchInterval',
                    'useMutationObserverFallbacks'
                ];

                expect(mff.getConfig()).to.have.all.keys(keys);
            });

            it('after updating the configuration, should return the new configuration', function() {
                var options = {
                    keymap : {},
                    weightOverrideAttribute : '',
                    focusableAttribute : '',
                    overrideDirectionAttribute : '',
                    dynamicPositionAttribute : '',
                    captureFocusAttribute: '',
                    focusedClass : '',
                    defaultFocusedElement : '',
                    container : '',
                    eventNamespace : '',
                    watchDomMutations : true,
                    useRealFocus : true,
                    azimuthWeight : 5,
                    distanceWeight : 1,
                    debug : false,
                    attributeWatchInterval : 100,
                    useMutationObserverFallbacks : false
                };

                mff.configure(options);

                expect(mff.getConfig()).to.deep.equal(options);
            });
        });

        describe('the getContainer method', function() {
            it('should return the dom element of the container', function() {
                mff
                    .configure({
                        container: '#example1',
                        defaultFocusedElement : '.box.block1'
                    })
                    .start();

                expect(mff.getContainer()).to.equal(document.querySelector('#example1'));
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

            it('should register elements that are hidden and add the dynamic position class', function() {
                mff.start();

                expect(_.pluck(mff.getKnownElements(), 'id')).to.contain('hiddenInputWithFocusableAttr');
                document.querySelector('#hiddenInputWithFocusableAttr').hasAttribute('dynamic-position');
            });

            describe('the cached-position added to each element', function() {
                it('should add the cached-position to each element', function() {
                    mff.start();

                    expect(_.first(mff.getKnownElements()).magicFocusFinderPosition).to.exist;
                });

                it('should have the properties, x, y, otx, oty, obx, oby, olx, oly, orx, ory, centerX, centerY', function() {
                    var position;

                    mff.start();

                    position = _.first(mff.getKnownElements()).magicFocusFinderPosition;

                    expect(position).to.have.all.keys('x', 'y', 'otx', 'oty', 'obx', 'oby', 'olx', 'oly', 'orx', 'ory', 'centerX', 'centerY');
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

                    expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length);
                });
            });
        });

        describe('the refresh method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('refresh');
            });

            it('will refresh the known elements collection', function() {
                mff.start();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length);

                mff.refresh();

                expect(mff.getKnownElements().length).to.equal(document.querySelectorAll('[focusable]').length);
            });

            xit('will respect and changed config values', function() {
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

            describe('events', function() {
                it('should fire "losing-focus", "focus-lost", "gaining-focus", and "focus-gained" events in order', function() {
                    var spy = sinon.spy();

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    mff.getContainer().addEventListener('losing-focus', spy);
                    mff.getContainer().addEventListener('focus-lost', spy);
                    mff.getContainer().addEventListener('gaining-focus', spy);
                    mff.getContainer().addEventListener('focus-gained', spy);
                    mff.getContainer().addEventListener('focus-moved', spy);

                    mff.move.right();

                    expect(spy.args[0][0].type).to.equal('losing-focus');
                    expect(spy.args[1][0].type).to.equal('focus-lost');
                    expect(spy.args[2][0].type).to.equal('gaining-focus');
                    expect(spy.args[3][0].type).to.equal('focus-gained');
                    expect(spy.args[4][0].type).to.equal('focus-moved');

                    mff.getContainer().removeEventListener('losing-focus', spy);
                    mff.getContainer().removeEventListener('focus-lost', spy);
                    mff.getContainer().removeEventListener('gaining-focus', spy);
                    mff.getContainer().removeEventListener('focus-gained', spy);
                    mff.getContainer().removeEventListener('focus-moved', spy);
                });

                it('should not fire "losing-focus", "focus-lost", "gaining-focus", and "focus-gained" events if options.events is false', function() {
                    var spy = sinon.spy();

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    mff.getContainer().addEventListener('losing-focus', spy);
                    mff.getContainer().addEventListener('focus-lost', spy);
                    mff.getContainer().addEventListener('gaining-focus', spy);
                    mff.getContainer().addEventListener('focus-gained', spy);
                    mff.getContainer().addEventListener('focus-moved', spy);

                    mff.move.right({ events : false });

                    expect(spy).to.not.have.been.called;

                    mff.getContainer().removeEventListener('losing-focus', spy);
                    mff.getContainer().removeEventListener('focus-lost', spy);
                    mff.getContainer().removeEventListener('gaining-focus', spy);
                    mff.getContainer().removeEventListener('focus-gained', spy);
                    mff.getContainer().removeEventListener('focus-moved', spy);
                });

                it('should not fire events if focus is not changed', function() {
                    var spy = sinon.spy();

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('focus-lost', spy);
                    mff.getContainer().addEventListener('focus-gained', spy);

                    mff.move.left();

                    expect(spy).to.not.have.been.called;

                    mff.getContainer().removeEventListener('focus-lost', spy);
                    mff.getContainer().removeEventListener('focus-gained', spy);

                    expect(mff.getCurrent().className).to.equal('box block1 focused');
                });

                it('should fire focus gainining event with element gaining', function(done) {
                    var listener = function(event) {
                        expect(event.data.to).to.equal(document.querySelector('#example1 .box.block2'));
                        mff.getContainer().removeEventListener('gaining-focus', listener);
                        done();
                    };

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('gaining-focus', listener);
                    mff.move.right();
                });

                it('should fire focus gained event with element gaining', function(done) {
                    var listener = function(event) {
                        expect(event.data.to).to.equal(document.querySelector('#example1 .box.block2'));
                        mff.getContainer().removeEventListener('focus-gained', listener);
                        done();
                    };

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('focus-gained', listener);
                    mff.move.right();
                });

                it('should fire losing-focus event with element lost', function(done) {
                    var listener = function(event) {
                        expect(event.data.from).to.equal(document.querySelector('#example1 .box.block1'));
                        mff.getContainer().removeEventListener('losing-focus', listener);
                        done();
                    };

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('losing-focus', listener);
                    mff.move.right();
                });

                it('should fire focus-lost event with element lost', function(done) {
                    var listener = function(event) {
                        expect(event.data.from).to.equal(document.querySelector('#example1 .box.block1'));
                        mff.getContainer().removeEventListener('focus-lost', listener);
                        done();
                    };

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    expect(mff.getCurrent().className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('focus-lost', listener);
                    mff.move.right();
                });

                it('should fire a moved-direction event - with the direction and elements involved - after focus is changed', function() {
                    var spy = sinon.spy(),
                        focus1,
                        focus2,
                        event;

                    mff
                        .configure({
                            container: '#example1',
                            defaultFocusedElement : '.box.block1'
                        })
                        .start();

                    focus1 = mff.getCurrent();
                    expect(focus1.className).to.equal('box block1 focused');

                    mff.getContainer().addEventListener('focus-moved', spy);

                    mff.move.right();
                    focus2 = mff.getCurrent();

                    expect(spy).to.have.been.calledOnce;

                    event = spy.args[0][0];
                    expect(event.type).to.equal('focus-moved');
                    expect(event.data.direction).to.equal('right');
                    expect(event.data.from).to.equal(focus1);
                    expect(event.data.to).to.equal(focus2);

                    mff.getContainer().removeEventListener('focus-moved', spy);

                    expect(focus2.className).to.equal('box block2 focused');
                });
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

            describe('when the config "useRealFocus" is false', function() {
                it('should not give actual focus to the element - actual focus is the :focus psuedo selector', function() {

                    // give real focus to some other input element
                    document.querySelector('#input6').focus();

                    // Start MFF
                    mff
                        .configure({
                            container: '#focusableInputs',
                            defaultFocusedElement : '#input1',
                            useRealFocus : false
                        })
                        .start();

                    // ensure the original still has focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input6'))).to.be.true;
                    // ensure the default focused element does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input1'))).to.be.false;

                    mff.move.right();

                    // ensure the original still has focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input6'))).to.be.true;
                    // ensure the previous does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input1'))).to.be.false;
                    // ensure the element moved too does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input2'))).to.be.false;
                });

                it('should not remove actual focus from the previously focused element', function() {
                    // give real focus to some other input element
                    document.querySelector('#input6').focus();

                    // Start MFF
                    mff
                        .configure({
                            container: '#focusableInputs',
                            defaultFocusedElement : '#input1',
                            useRealFocus : false
                        })
                        .start();

                    // ensure the original still has focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input6'))).to.be.true;
                    // ensure the default focused element does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input1'))).to.be.false;

                    mff.move.right();

                    // ensure the original still has focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input6'))).to.be.true;
                    // ensure the previous does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input1'))).to.be.false;
                    // ensure the element moved too does not have real focus
                    expect(document.activeElement.isEqualNode(document.querySelector('#input2'))).to.be.false;
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

        describe('the lock method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('lock');
            });

            it('should prevent all navigation', function() {
                var event = document.createEvent('HTMLEvents');

                mff
                    .configure({
                        container: '#example1',
                        defaultFocusedElement : '.box.block1'
                    })
                    .start();

                mff.lock();

                event.initEvent('keydown', true, true);
                event.keyCode = 39;
                mff.getCurrent().dispatchEvent(event);

                expect(mff.getCurrent().isEqualNode(document.querySelector('#example1 .box.block1'))).to.be.true;
            });
        });

        describe('the unlock method', function() {
            it('should exist on the module', function() {
                expect(mff).itself.to.respondTo('unlock');
            });

            it('should allow navigation from a previously locked state', function() {
                var event = document.createEvent('HTMLEvents');

                mff
                    .configure({
                        container: '#example1',
                        defaultFocusedElement : '.box.block1'
                    })
                    .start();

                mff.lock();

                event.initEvent('keydown', true, true);
                event.keyCode = 39;
                mff.getCurrent().dispatchEvent(event);

                expect(mff.getCurrent().isEqualNode(document.querySelector('#example1 .box.block1'))).to.be.true;

                mff.unlock();

                event.initEvent('keydown', true, true);
                event.keyCode = 39;
                mff.getCurrent().dispatchEvent(event);

                expect(mff.getCurrent().isEqualNode(document.querySelector('#example1 .box.block2'))).to.be.true;
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

            it('should move directly to the right even if there is something closer to the right but more above', function() {

                mff
                    .configure({
                        container: '#example4'
                    })
                    .start();

                expect(mff.getCurrent().className).to.equal('box block37 focused');

                mff.move.right();

                expect(mff.getCurrent().className).to.equal('box block38 focused');
            });
        });

        describe('azimuth calculation logic', function() {

            var box41 = {
                    top     : 50,
                    bottom  : 100,
                    left    : 50,
                    right   : 100,
                    width : 50,
                    height: 50
                },
                box42 = {
                    top     : 125,
                    bottom  : 175,
                    left    : 75,
                    right   : 125,
                    width : 50,
                    height: 50
                },
                box44 = {
                    top     : 75,
                    bottom  : 125,
                    left    : 150,
                    right   : 175,
                    width   : 50,
                    height  : 50
                };

            describe('should calculate a zero for elements that "overlap" in the direction moved', function() {
                it('down', function() {
                    expect(mff.getAngle(
                        mff.getPosition(null, box41),
                        mff.getPosition(null, box42),
                        'down')).to.equal(90);

                });
                it('up', function() {
                    expect(mff.getAngle(
                        mff.getPosition(null, box42),
                        mff.getPosition(null, box41),
                        'up')).to.equal(270);
                });
                it('right', function() {
                    expect(mff.getAngle(
                        mff.getPosition(null, box41),
                        mff.getPosition(null, box44),
                        'right')).to.equal(0);
                });
                it('left', function() {
                    expect(mff.getAngle(
                        mff.getPosition(null, box44),
                        mff.getPosition(null, box41),
                        'left')).to.equal(180);
                });
            });
            describe('should prefer line of site in direction being moved', function() {
                describe('overlap where other elements side is inside current element', function() {
                    it('up', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block43'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block43 focused');

                        mff.move.up();

                        expect(mff.getCurrent().className).to.equal('box block42 focused');
                    });

                    it('down', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block41'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block41 focused');

                        mff.move.down();

                        expect(mff.getCurrent().className).to.equal('box block42 focused');
                    });

                    it('right', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block41'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block41 focused');

                        mff.move.right();

                        expect(mff.getCurrent().className).to.equal('box block44 focused');
                    });

                    it('left', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block45'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block45 focused');

                        mff.move.left();

                        expect(mff.getCurrent().className).to.equal('box block44 focused');
                    });
                });
                describe('overlap where other element is wider than current', function() {
                    it('up', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block47'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block47 focused');

                        mff.move.up();

                        expect(mff.getCurrent().className).to.equal('box-wide block46 focused');
                    });
                    it('down', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block45'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block45 focused');

                        mff.move.down();

                        expect(mff.getCurrent().className).to.equal('box-wide block46 focused');
                    });
                    it('right', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box-wide.block46'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box-wide block46 focused');

                        mff.move.right();

                        expect(mff.getCurrent().className).to.equal('box-tall block48 focused');
                    });
                    it('left', function() {

                        mff
                            .configure({
                                container: '#example5',
                                defaultFocusedElement : '.box.block49'
                            })
                            .start();

                        expect(mff.getCurrent().className).to.equal('box block49 focused');

                        mff.move.left();

                        expect(mff.getCurrent().className).to.equal('box-tall block48 focused');
                    });
                });
            });
        });

        describe('the mutation observer features', function() {
            it('should be able to be turned off for crappy browsers', function() {
                var appendee = document.createElement('div'),
                    initialFocusableCount = document.querySelector('#edgarRiceBurroughs').querySelectorAll('[focusable]').length;

                appendee.setAttribute('focusable', 'focusable');

                mff
                    .configure({
                        watchDomMutations : false,
                        container : '#edgarRiceBurroughs'
                    })
                    .start();

                expect(mff.getKnownElements().length).to.equal(initialFocusableCount);

                document.querySelector('#edgarRiceBurroughs').appendChild(appendee);

                expect(mff.getKnownElements().length).to.equal(initialFocusableCount);
            });

            describe('when the browser supports mutation observers', function() {
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

                xit('should add elements that are deeply nested into knownElements when the parent is added to the dom', function() {
                    // This should test that if there were deeply nested nodes, and on very deep in there had a focusable.
                    // currently, the mutation event will only fire on the first level children of the container.
                });

                //https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
                it('should only add HTML nodes of type === 1 and no text/comment nodes.', function(done) {
                    var appendee = document.createTextNode('juju bone'),
                        initialFocusableCount = document.querySelectorAll('[focusable]').length;

                    mff.start();

                    document.querySelector('#iContainMoreFocusables').appendChild(appendee);

                    setTimeout(function() {
                        expect(mff.getKnownElements().length).to.equal(initialFocusableCount);
                        done();
                    }, 0);
                });

                it('should watch changes to individual elements attributes', function() {
                    var elementWhoseAttributesChanged;

                    mff
                        .configure({
                            container : '#example6',
                            defaultFocusedElement : '#block50'
                        })
                        .start();

                    // if we modify the attributes on block50 in the dom, we should be able to see those new attributes in the known elements array.
                    document.querySelector('#block50').setAttribute('focus-overrides', 'null #block52 null null');

                    elementWhoseAttributesChanged = mff.getKnownElements().reduce(function(found, element) {
                        if(element.id === 'block50') {
                            found = element;
                        }

                        return found;
                    }, null);

                    expect(elementWhoseAttributesChanged.getAttribute('focus-overrides')).to.equal('null #block52 null null');
                });
            });

            describe('when the browser does not support mutation observers', function() {
                it('should support forcing to use mutation observer fallback for development', function() {
                    mff
                        .configure({
                            useMutationObserverFallbacks : true
                        })
                        .start();

                    expect(mff.getConfig().useMutationObserverFallbacks).to.be.true;
                });

                it('should watch changes to individual elements attributes', function() {
                    var elementWhoseAttributesChanged;

                    mff
                        .configure({
                            container : '#example6',
                            defaultFocusedElement : '#block50',
                            useMutationObserverFallbacks : true
                        })
                        .start();

                    // if we modify the attributes on block50 in the dom, we should be able to see those new attributes in the known elements array.
                    document.querySelector('#block50').setAttribute('focus-overrides', 'null #block52 null null');

                    elementWhoseAttributesChanged = mff.getKnownElements().reduce(function(found, element) {
                        if(element.id === 'block50') {
                            found = element;
                        }

                        return found;
                    }, null);

                    expect(elementWhoseAttributesChanged.getAttribute('focus-overrides')).to.equal('null #block52 null null');
                });
            });
        });

    });

    function getOriginalOptions() {
        return {
            keymap : {
                38 : 'up',
                40 : 'down',
                37 : 'left',
                39 : 'right',
                13 : 'enter'
            },
            weightOverrideAttribute : 'weight-override',
            focusableAttribute : 'focusable',
            defaultFocusedElement : null,
            container : 'document',
            eventNamespace : 'magicFocusFinder',
            focusedClass : 'focused',
            overrideDirectionAttribute : 'focus-overrides',
            captureFocusAttribute : 'capture-focus',
            dynamicPositionAttribute : 'dynamic-position',
            watchDomMutations : true,
            useRealFocus : true,
            azimuthWeight : 1,
            distanceWeight : 1,
            debug : false,
            attributeWatchInterval : 100,
            useMutationObserverFallbacks : false
        };
    }
});
