/*jslint browser: true*/
define(['lodash'], function (_) {
    'use strict';

    return {
        configure : configure,
        getConfig : getConfig,
        start : start,
        setCurrent : setCurrent,
        refresh : refresh,

        private : {
            config : {
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
                captureFocusAttribute : 'capture-focus'
            },
            canMove : true,
            currentlyFocusedElement : null,
            knownElements : [],
                // Each element will get the following properties when registered:
                // magicFocusFinderPosition = the elements position.
                // magicFocusFinderDirectionOverrides = if the element had any direction overrides.
            move : {
                up : _moveUp,
                down : _moveDown,
                left : _moveLeft,
                right : _moveRight,
                enter : _fireEnter
            },
            domObserver : null
        }
    };

    function configure(options) {
        _.merge(this.private.config, options);

        return this;
    }

    function getConfig() {
        return this.private.config;
    }

    function start() {
        if(this.private.config.defaultFocusedElement) {
            this.setCurrent(this.private.config.defaultFocusedElement);
        }

        this.refresh();

        _setupAndStartWatchingMutations.call(this);
    }

    function setCurrent(querySelector) {
        var currentlyFocusedElement = this.private.currentlyFocusedElement,
            element;

        element = querySelector && querySelector.nodeName ? querySelector : document.querySelector(querySelector);

        if(element) {
            if(currentlyFocusedElement) {

                _fireEvent(currentlyFocusedElement, 'losing-focus');
                currentlyFocusedElement.classList.remove(this.private.config.focusedClass);
                currentlyFocusedElement.blur();
                _fireEvent(currentlyFocusedElement, 'focus-lost');
            }


            _fireEvent(element, 'gaining-focus');
            element.classList.add(this.private.config.focusedClass);
            element.focus();
            _fireEvent(element, 'focus-gained');

            this.private.currentlyFocusedElement = element;
        }

        return this;
    }

    function refresh() {
        var container;

        if(this.private.config.container === 'document') {
            container = document;
        } else {
            container = document.querySelector(this.private.config.container);
        }

        _.once(_setupBodyKeypressListener.bind(this))();

        this.private.knownElements = [];

        [].forEach.call(container.querySelectorAll('['+ this.private.config.focusableAttribute +']'), _registerElement.bind(this));
    }

    function _eventManager(event) {
        var mappedKey;

        if(!this.private.canMove) {
            return;
        }

        if(this.private.currentlyFocusedElement) {
            mappedKey = _.findWhere(this.private.config.keymap, { code : event.keyCode });

            if(mappedKey && this.private.currentlyFocusedElement.magicFocusFinderDirectionOverrides[mappedKey.direction]) {
                this.setCurrent(this.private.currentlyFocusedElement.magicFocusFinderDirectionOverrides[mappedKey.direction]);
            } else if(mappedKey) {
                this.private.move[mappedKey.direction].call(this);
            }
        } else {
            _setDefaultFocus.call(this);
        }
    }

    function _setDefaultFocus() {
        if(this.private.config.defaultFocusedElement) {
            this.setCurrent(this.private.config.defaultFocusedElement);
        } else {
            this.setCurrent(_.first(this.private.knownElements));
        }
    }

    function _registerElement(element) {
        var computedStyle = window.getComputedStyle(element);

        if(computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return false;
        }

        element.magicFocusFinderPosition = _getPosition(element);
        element.magicFocusFinderDirectionOverrides = _getDirectionOverrides.call(this, element);

        if(element.hasAttribute(this.private.config.captureFocusAttribute)) {
            this.setCurrent(element);
        }

        this.private.knownElements.push(element);
    }

    function _unregisterElement(element) {
        this.private.knownElements = _.reject(this.private.knownElements, function(knownElement) {
            return knownElement.isEqualNode(element);
        });
    }

    function _getPosition(element) {
        var boundingRect = element.getBoundingClientRect(),
            centerX = Math.round(boundingRect.left + (boundingRect.width / 2)),
            centerY = Math.round(boundingRect.top + (boundingRect.height / 2));

        return {
            // Top-left corner coords
            x : boundingRect.left,
            y : boundingRect.top,
            // Outer top center coords
            otx : centerX,
            oty : boundingRect.top,
            // Outer bottom center coords
            obx : centerX,
            oby : boundingRect.bottom,
            // Outer left center coords
            olx : boundingRect.left,
            oly : centerY,
            // Outer right center coords
            orx : boundingRect.right,
            ory : centerY
        };
    }

    function _moveUp() {
        var closeElements = _findCloseElements.call(this, function(current, other){
            return current.oty >= other.oby;
        });

        _activateClosest.call(this, closeElements, 'up', function(current, other){
            return Math.sqrt(Math.pow(current.oty - other.oby, 2) + Math.pow(current.otx - other.obx, 2));
        });
    }

    function _moveDown() {
        var closeElements = _findCloseElements.call(this, function(current, other){
            return current.oby <= other.oty;
        });

        _activateClosest.call(this, closeElements, 'down', function(current, other){
            return Math.sqrt(Math.pow(current.obx - other.otx, 2) + Math.pow(current.oby - other.oty, 2));
        });
    }

    function _moveLeft() {
        var closeElements = _findCloseElements.call(this, function(current, other){
            return current.olx >= other.orx;
        });

        _activateClosest.call(this, closeElements, 'left', function(current, other){
            return Math.sqrt(Math.pow(current.olx - other.orx, 2) + Math.pow(current.oly - other.ory, 2));
        });
    }

    function _moveRight() {
        var closeElements = _findCloseElements.call(this, function(current, other){
            return current.orx <= other.olx;
        });

        _activateClosest.call(this, closeElements, 'right', function(current, other){
            return Math.sqrt(Math.pow(current.orx - other.olx, 2) + Math.pow(current.ory - other.oly, 2));
        });
    }

    function _fireEnter() {
        var event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });

        this.private.currentlyFocusedElement.dispatchEvent(event);
    }

    function _getDirectionOverrides(element) {
        if(element.hasAttribute(this.private.config.overrideDirectionAttribute)) {
            return _.zipObject(['up', 'right', 'down', 'left'], _.map(element.getAttribute(this.private.config.overrideDirectionAttribute).split(' '), function(direction) {
                return direction !== 'null' ? direction : null;
            }));
        } else {
            return {};
        }
    }

    function _findCloseElements(isClose) {
        var currentElementsPosition = this.private.currentlyFocusedElement.magicFocusFinderPosition;

        return _.filter(this.private.knownElements, function(element) {
            var isCloseElement = isClose(currentElementsPosition, element.magicFocusFinderPosition);

            return isCloseElement && !this.private.currentlyFocusedElement.isEqualNode(element);
        }.bind(this));
    }

    function _activateClosest(closeElements, direction, getDistance) {
        var closestElement,
            closestDistance,
            currentElementsPosition = this.private.currentlyFocusedElement.magicFocusFinderPosition;

        // Find closest element within the close elements
        _.each(closeElements, function(closeElement) {
            var closeElementsPosition = closeElement.magicFocusFinderPosition,
                currentDistance;

            // Find distance between 2 elements
            currentDistance = getDistance(currentElementsPosition, closeElementsPosition);

            // Check if is the closest found yet
            if(_.isUndefined(closestDistance) || currentDistance < closestDistance) {
                closestDistance = currentDistance;
                closestElement = closeElement;
            }

            if(currentDistance === 0) {
                return false; // exit early for speed.
            }
        });

        if(closestElement){
            this.setCurrent(closestElement);
        }
    }

    function _setupBodyKeypressListener() {
        document.querySelector('body').addEventListener('keydown', _eventManager.bind(this));
    }

    function _setupAndStartWatchingMutations() {
        var self = this;

        // Home baked mutation observer. The shim was VERY slow. This is much faster.
        if(window.MutationObserver || window.WebKitMutationObserver) {
            this.private.domObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    _.each(mutation.addedNodes, function(addedNode) {
                        if(addedNode.hasAttribute(self.private.config.focusableAttribute) && addedNode.nodeName !== '#comment') {
                            _registerElement.call(self, addedNode);
                        }
                    });

                    _.each(mutation.removedNodes, function(removedNode) {
                        if(removedNode.hasAttribute(self.private.config.focusableAttribute)) {
                            _unregisterElement.call(self, removedNode);
                        }
                        if(self.private.currentlyFocusedElement.isEqualNode(removedNode)) {
                            _setDefaultFocus.call(self);
                        }
                    });
                });
            });

            this.private.domObserver.observe(document, { childList: true, subtree : true });
        } else {
            document.querySelector('body').addEventListener('DOMNodeInserted', function(event) {
                if(event.target.hasAttribute(self.private.config.focusableAttribute) && event.target.nodeName !== '#comment') {
                    _registerElement.call(self, event.target);
                }
            });

            document.querySelector('body').addEventListener('DOMNodeRemoves', function(event) {
                if(event.target.hasAttribute(self.private.config.focusableAttribute) && event.target.nodeName !== '#comment') {
                    _unregisterElement.call(self, event.target);
                }
                if(self.private.currentlyFocusedElement.isEqualNode(event.target)) {
                    _setDefaultFocus.call(self);
                }
            });
        }
    }

    function _fireEvent(element, eventName) {
        var event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
        element.dispatchEvent(event);
    }
});
