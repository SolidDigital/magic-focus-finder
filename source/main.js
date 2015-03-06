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
                overrideDirectionAttribute : 'focus-overrides'
            },
            canMove : true,
            currentlyFocusedElement : null,
            knownElements : [],
            move : {
                up : _moveUp,
                down : _moveDown,
                left : _moveLeft,
                right : _moveRight,
                enter : _fireEnter
            },
            listenerAdded : false
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
    }

    function setCurrent(querySelector) {
        var currentlyFocusedElement = this.private.currentlyFocusedElement,
            element;

        element = querySelector && querySelector.nodeName ? querySelector : document.querySelector(querySelector);

        if(element) {
            if(currentlyFocusedElement) {
                currentlyFocusedElement.classList.remove(this.private.config.focusedClass);
                currentlyFocusedElement.blur();
            }

            element.classList.add(this.private.config.focusedClass);

            element.focus();

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

        if(!this.private.listenerAdded) {
            document.addEventListener('keyup', _eventManager.bind(this));
            this.private.listenerAdded = true;
        }

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

            if(mappedKey && _currentElementHasThisDirectionsOverride.call(this, mappedKey.direction)) {
                this.setCurrent(_getCurrentElementsOverrideByDirection.call(this, mappedKey.direction));
            } else if(mappedKey) {
                this.private.move[mappedKey.direction].call(this);
            }
        } else if(this.private.config.defaultFocusedElement) {
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

        element.setAttribute('position', JSON.stringify(_getPosition(element)));

        this.private.knownElements.push(element);
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

    function _currentElementHasThisDirectionsOverride(direction) {
        var index = _.indexOf(['up', 'right', 'down', 'left'], direction);

        if(this.private.currentlyFocusedElement.hasAttribute(this.private.config.overrideDirectionAttribute)) {
            return 'null' !== this.private.currentlyFocusedElement.getAttribute(this.private.config.overrideDirectionAttribute).split(' ')[index];
        }

        return false;
    }

    function _getCurrentElementsOverrideByDirection(direction) {
        var index = _.indexOf(['up', 'right', 'down', 'left'], direction);

        return this.private.currentlyFocusedElement.getAttribute(this.private.config.overrideDirectionAttribute).split(' ')[index];
    }

    function _findCloseElements(isClose) {
        var currentElementsPosition = JSON.parse(this.private.currentlyFocusedElement.getAttribute('position'));

        return _.filter(this.private.knownElements, function(element) {
            var thisElementsPosition = JSON.parse(element.getAttribute('position')),
                isCloseElement = isClose(currentElementsPosition, thisElementsPosition);

            return isCloseElement && !this.private.currentlyFocusedElement.isEqualNode(element);
        }.bind(this));
    }

    function _activateClosest(closeElements, direction, getDistance) {
        var closestElement,
            closestDistance,
            currentElementsPosition = JSON.parse(this.private.currentlyFocusedElement.getAttribute('position'));

        // Find closest element within the close elements
        _.each(closeElements, function(closeElement) {
            var closeElementsPosition = JSON.parse(closeElement.getAttribute('position')),
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

});
