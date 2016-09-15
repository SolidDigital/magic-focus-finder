'use strict';

var _ = require('lodash'),
    elementIsVisible = require('element-is-visible');

var _direction = {
        up: {
            name: 'up',
            degrees: 270
        },
        down: {
            name: 'down',
            degrees: 90
        },
        left: {
            name: 'left',
            degrees: 180
        },
        right: {
            name: 'right',
            degrees: 0
        }
    },
    defaultConfig = {
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
        useNativeMutationObserver : true
    },
    internal = {
        configured: false,
        canMove : true,
        currentlyFocusedElement : null,
        knownElements : [],
        // Each element will get the following properties when registered:
        // magicFocusFinderPosition = the elements position.
        // magicFocusFinderDirectionOverrides = if the element had any direction overrides.
        domObserver : null
    },
    mff = {
        configure : configure,
        getConfig : getConfig,
        getContainer : getContainer,
        start : start,
        setCurrent : setCurrent,
        getCurrent : getCurrent,
        getKnownElements : getKnownElements,
        refresh : refresh,
        destroy : destroy,
        lock : lock,
        unlock : unlock,
        move : {
            up : _moveUp,
            down : _moveDown,
            left : _moveLeft,
            right : _moveRight,
            enter : _fireEnter
        },
        getAngle : _getAngle,
        getPosition : _getPosition,
        overlap : _overlap
    };

// for now mff is a singleton
return mff;

function configure() {
    internal.config = _.extend(_.cloneDeep(defaultConfig), _.extend.apply(_, arguments));
    internal.configured = true;
    return mff;
}

function getConfig() {
    return internal.config;
}

function getContainer() {
    return internal.config.container;
}

function start() {
    if (!internal.configured) {
        internal.config = _.cloneDeep(defaultConfig);
    } else {
        // TODO: why is configured set to false?
        internal.configured = false;
    }

    if (internal.config.defaultFocusedElement) {
        setCurrent(internal.config.defaultFocusedElement);
    }

    refresh();

    if(internal.config.watchDomMutations) {
        _setupAndStartWatchingMutations();
    }

    return mff;
}

function setCurrent(querySelector, direction, options) {
    var previouslyFocusedElement = internal.currentlyFocusedElement,
        newlyFocusedElement,
        events;

    options = options || {};

    events = false !== options.events;

    newlyFocusedElement = querySelector && querySelector.nodeName ? querySelector : document.querySelector(querySelector);

    if(newlyFocusedElement) {
        if(previouslyFocusedElement) {

            events && _fireHTMLEvent(previouslyFocusedElement, 'losing-focus', {
                from: previouslyFocusedElement
            });
            previouslyFocusedElement.classList.remove(internal.config.focusedClass);

            internal.config.useRealFocus && previouslyFocusedElement.blur();

            events && _fireHTMLEvent(previouslyFocusedElement, 'focus-lost', {
                from: previouslyFocusedElement
            });
        }


        events && _fireHTMLEvent(newlyFocusedElement, 'gaining-focus', {
            to: newlyFocusedElement
        });
        newlyFocusedElement.classList.add(internal.config.focusedClass);

        internal.config.useRealFocus && newlyFocusedElement.focus();

        events && _fireHTMLEvent(newlyFocusedElement, 'focus-gained', {
            to: newlyFocusedElement
        });

        internal.currentlyFocusedElement = newlyFocusedElement;
        events && _fireHTMLEvent(newlyFocusedElement, 'focus-moved', {
            direction: direction,
            from: previouslyFocusedElement,
            to: newlyFocusedElement
        });
    }

    return mff;
}

function getCurrent() {
    return internal.currentlyFocusedElement;
}

function getKnownElements() {
    return internal.knownElements;
}

function refresh() {
    if(internal.config.container === 'document') {
        internal.config.container = document;
    } else if(internal.config.container.nodeName){
        internal.config.container = internal.config.container;
    } else {
        internal.config.container = document.querySelector(internal.config.container);
    }

    _.once(_setupBodyKeypressListener)();

    internal.knownElements = [];

    [].forEach.call(internal.config.container.querySelectorAll('['+ internal.config.focusableAttribute +']'), _registerElement);

    return mff;
}

function destroy() {
    internal.knownElements = [];
    internal.configured = false;
    internal.canMode = true;
    internal.currentlyFocusedElement = null;
    _removeBodyKeypressListener();
    _removeMutationObservers();
    configure(defaultConfig);
}

function lock() {
    internal.canMove = false;
    return mff;
}

function unlock() {
    internal.canMove = true;
    return mff;
}

function _eventManager(event) {
    var direction;

    if(!internal.canMove) {
        return;
    }

    if(internal.currentlyFocusedElement) {
        direction = internal.config.keymap[event.keyCode];

        internal.currentlyFocusedElement.magicFocusFinderDirectionOverrides =  _getDirectionOverrides(internal.currentlyFocusedElement);

        if(direction && 'skip' === internal.currentlyFocusedElement.magicFocusFinderDirectionOverrides[direction]) {
            return;
        } else if(direction && internal.currentlyFocusedElement.magicFocusFinderDirectionOverrides[direction]) {
            setCurrent(internal.currentlyFocusedElement.magicFocusFinderDirectionOverrides[direction], direction);
        } else if(direction) {
            mff.move[direction]();
        }
    } else {
        _setDefaultFocus();
    }
}

function _setDefaultFocus() {
    if(internal.config.defaultFocusedElement) {
        setCurrent(internal.config.defaultFocusedElement);
    } else {
        setCurrent(_.first(internal.knownElements));
    }
}

function _registerElement(element) {
    var elementsComputedStyle = window.getComputedStyle(element);

    if(elementsComputedStyle.display === 'none' || elementsComputedStyle.visibility === 'hidden') {
        element.setAttribute(internal.config.dynamicPositionAttribute, true);
    }

    element.magicFocusFinderPosition = _getPosition(element);
    element.magicFocusFinderDirectionOverrides = _getDirectionOverrides(element);
    element.magicFocusFinderpreferedWeightOverrides = _getPreferedOverrides(element);

    if(element.hasAttribute(internal.config.captureFocusAttribute)) {
        setCurrent(element);
    }

    internal.knownElements.push(element);
}

function _unregisterElement(element) {
    internal.knownElements = _.reject(internal.knownElements, function(knownElement) {
        return knownElement.isEqualNode(element);
    });

    if(internal.currentlyFocusedElement && internal.currentlyFocusedElement.isEqualNode(element)) {
        _setDefaultFocus();
    }
}

function _getPosition(element, boundingRectIn) {
    var boundingRect = boundingRectIn || element.getBoundingClientRect(),
        centerX = Math.round(boundingRect.left + (boundingRect.width / 2)),
        centerY = Math.round(boundingRect.top + (boundingRect.height / 2));

    return {
        // Top-left corner coords
        centerX : centerX,
        centerY : centerY,
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

function _recalculateDynamicElementPositions() {
    _.each(internal.knownElements, function(knownElement) {
        if(knownElement.hasAttribute(internal.config.dynamicPositionAttribute)) {
            knownElement.magicFocusFinderPosition = _getPosition(knownElement);
        }
    });
}

function _moveUp(options) {
    // TODO: findCloseElement and activateClosest can be combined into one loop with two checks in series
    var closeElements = _findCloseElements(function(current, other){
        return current.oty >= other.oby;
    });

    _activateClosest(closeElements, _direction.up.name, function(current, other){
        var distance = Math.sqrt(Math.pow(current.oty - other.oby, 2) + Math.pow(current.otx - other.obx, 2)),
            azimuth = _getAngleDifference(270, _getAngle(current, other, _direction.up.name));

        // 270 is up (reversed)
        return {
            distance : distance,
            azimuth : azimuth
        };
    }, options);
}

function _moveDown(options) {
    var closeElements = _findCloseElements(function(current, other) {
        return current.oby <= other.oty;
    });

    _activateClosest(closeElements, _direction.down.name, function(current, other) {
        var distance = Math.sqrt(Math.pow(current.obx - other.otx, 2) + Math.pow(current.oby - other.oty, 2)),
            azimuth = _getAngleDifference(90, _getAngle(current, other, _direction.down.name));

        // 90 is down (reversed)
        return {
            distance : distance,
            azimuth : azimuth
        };
    }, options);
}

function _moveLeft(options) {
    var closeElements = _findCloseElements(function(current, other) {
        return current.olx >= other.orx;
    });

    _activateClosest(closeElements, _direction.left.name, function(current, other) {
        var distance = Math.sqrt(Math.pow(current.olx - other.orx, 2) + Math.pow(current.oly - other.ory, 2)),
            azimuth = _getAngleDifference(180, _getAngle(current, other, _direction.left.name));

        // Math.PI is directly left
        return {
            distance : distance,
            azimuth : azimuth
        };
    }, options);
}

function _moveRight(options) {
    var closeElements = _findCloseElements(function(current, other) {
        return current.orx <= other.olx;
    });

    _activateClosest(closeElements, _direction.right.name, function(current, other) {
        var distance = Math.sqrt(Math.pow(current.orx - other.olx, 2) + Math.pow(current.ory - other.oly, 2)),
            azimuth = _getAngleDifference(0, _getAngle(current, other, _direction.right.name));

        // 0 is directly right
        return {
            distance : distance,
            azimuth : azimuth
        };
    }, options);
}

function _getAngle(current, other, direction) {
    // Overlaps return 0
    if (_overlap(current, other, direction)) {
        switch (direction) {
            case _direction.up.name:
                return _direction.up.degrees;
            case _direction.down.name:
                return _direction.down.degrees;
            case _direction.left.name:
                return _direction.left.degrees;
            case _direction.right.name:
                return _direction.right.degrees;
        }
    }

    // Can assume no overlap here
    switch (direction) {
    case _direction.up.name:
        if (other.orx > current.orx) {
            // o: bl c: tr
            return Math.atan2(other.oby - current.oty, other.olx - current.orx) * 180 / Math.PI;
        } else {
            // o: br c: tl
            return Math.atan2(other.oby - current.oty, other.orx - current.olx) * 180 / Math.PI;
        }
        break;
    case _direction.down.name:
        if (other.orx > current.orx) {
            // o: tl c: br
            return Math.atan2(other.oty - current.oby, other.olx - current.orx) * 180 / Math.PI;
        } else {
            // o: tr c: bl
            return Math.atan2(other.oty - current.oby, other.orx - current.olx) * 180 / Math.PI;
        }
        break;
    case _direction.left.name:
        if (other.oty > current.oty) {
            // o: tr c: bl
            return Math.atan2(other.oty - current.oby, other.orx - current.olx) * 180 / Math.PI;
        } else {
            // o: br c: tl
            return Math.atan2(other.oby - current.oty, other.orx - current.olx) * 180 / Math.PI;
        }
        break;
    case _direction.right.name:
        if (other.oty > current.oty) {
            // o: tl c: br
            return Math.atan2(other.oty - current.oby, other.olx - current.orx) * 180 / Math.PI;
        } else {
            // o: bl c: tr
            return Math.atan2(other.oby - current.oty, other.olx - current.orx) * 180 / Math.PI;
        }
        break;
    }
}

function _overlap(current, other, direction) {
    switch (direction) {
    case _direction.up.name:
    case _direction.down.name:
        return  _inside(other.olx, current.olx, current.orx) ||
                _inside(other.orx, current.olx, current.orx) ||
                (_inside(current.olx, other.olx, current.orx) && (_inside(current.orx, other.olx, other.orx)));
    case _direction.left.name:
    case _direction.right.name:
        return  _inside(other.oty, current.oty, current.oby) ||
                _inside(other.oby, current.oty, current.oby) ||
                (_inside(current.oty, other.oty, other.oby) && _inside(current.oby, other.oty, other.oby));
    }
}

function _inside(pin, lower, upper) {
    return pin >= lower && pin <= upper;
}

function _getAngleDifference(angle1, angle2) {
    return Math.abs((angle1 + 180 -  angle2) % 360 - 180);
}

function _getWeightedResult(azimuth, maxAzimuth, azimuthWeight, distance, maxDistance, distanceWeight) {
    var result;

    maxAzimuth = maxAzimuth || 1;
    maxDistance = maxDistance || 1;
    azimuth = Math.abs(azimuth);
    distance = Math.abs(distance);

    result = azimuthWeight * (azimuth / maxAzimuth) + distanceWeight * (distance / maxDistance);

    return result;
}

function _fireEnter() {
    _fireMouseEvent(internal.currentlyFocusedElement, 'click');
}

function _getDirectionOverrides(element) {
    if(element.hasAttribute(internal.config.overrideDirectionAttribute)) {
        return _.zipObject([_direction.up.name, _direction.right.name, _direction.down.name, _direction.left.name], _.map(element.getAttribute(internal.config.overrideDirectionAttribute).split(' '), function(direction) {
            return direction !== 'null' ? direction : null;
        }));
    } else {
        return {};
    }
}

function _getPreferedOverrides(element) {
    return _.reduce([_direction.up.name, _direction.down.name, _direction.left.name, _direction.right.name], function(attributes, direction) {
        var attribute = internal.config.weightOverrideAttribute + '-' + direction;

        if (element.hasAttribute(attribute)) {
            attributes[direction] = element.getAttribute(attribute);
        }

        return attributes;
    }, {});
}

function _findCloseElements(isClose) {
    var currentElementsPosition;

    _recalculateDynamicElementPositions();

    currentElementsPosition = internal.currentlyFocusedElement.magicFocusFinderPosition;

    return _.filter(internal.knownElements, function(element) {
        var isCloseElement = isClose(currentElementsPosition, element.magicFocusFinderPosition);

        return isCloseElement && !internal.currentlyFocusedElement.isEqualNode(element);
    });
}

function _activateClosest(closeElements, direction, getDistance, options) {
    var closestElement,
        currentElementsPosition = internal.currentlyFocusedElement.magicFocusFinderPosition,
        maxDistance = 0,
        maxAzimuth = 0,
        azimuthWeight = internal.config.azimuthWeight,
        distanceWeight = internal.config.distanceWeight,
        weightOverrides = internal.currentlyFocusedElement.magicFocusFinderpreferedWeightOverrides;

    if (weightOverrides && weightOverrides[direction]) {
        // can be distance or azimuth
        switch (weightOverrides[direction]) {
        case 'distance':
            distanceWeight = 1;
            azimuthWeight = 0.001;
            break;
        case 'azimuth':
            azimuthWeight = 1;
            distanceWeight = 0.001;
            break;
        }
    }

    // Find closest element within the close elements
    closestElement = _.chain(closeElements)
        .map(function(closeElement) {

            var result = getDistance(currentElementsPosition, closeElement.magicFocusFinderPosition);

            if(!elementIsVisible(closeElement)) {
                return;
            }

            maxDistance = Math.max(maxDistance, result.distance);
            maxAzimuth = Math.max(maxAzimuth, result.azimuth);
            result.closeElement = closeElement;
            return result;
        })
        .compact()
        .reduce(function(stored, current) {

            var result = {
                azimuth : current.azimuth,
                computed : _getWeightedResult(current.azimuth, maxAzimuth, azimuthWeight, current.distance, maxDistance, distanceWeight),
                closeElement : current.closeElement
            };

            if (internal.config.debug) {
                result.closeElement.innerHTML = result.computed.toPrecision(2);
            }

            if(weightOverrides[direction] !== 'distance') {
                if (0 !== stored.azimuth && 0 === current.azimuth) {
                    return result;
                }

                if (0 === stored.azimuth && 0 !== result.azimuth) {
                    return stored;
                }
            }

            return stored.computed < result.computed ? stored : result;
        }, {
            azimuth: Infinity,
            computed:Infinity
        })
        .value()
        .closeElement;

    if(closestElement){
        setCurrent(closestElement, direction, options);
    }
}

function _setupBodyKeypressListener() {
    document.querySelector('body').addEventListener('keydown', _eventManager);
}

function _removeBodyKeypressListener() {
    document.querySelector('body').removeEventListener('keydown', _eventManager);
}

function _setupAndStartWatchingMutations() {
    // Home baked mutation observer. The shim was VERY slow. This is much faster.
    if((window.MutationObserver || window.WebKitMutationObserver) && internal.config.useNativeMutationObserver) {
        internal.domObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    _.each(mutation.addedNodes, _addNodeFromMutationEvent);
                }

                if (mutation.removedNodes.length) {
                    _.each(mutation.removedNodes, _removeNodeFromMutationEvent);
                }
            });
        });

        internal.domObserver.observe(internal.config.container, {
            childList: true,
            subtree : true
        });
    } else {
        internal.config.container.addEventListener('DOMNodeInserted', _addNodeFromDomNodeAddedEvent);

        internal.config.container.addEventListener('DOMNodeRemoved', _removeNodeFromDomNodeAddedEvent);
    }
}

function _addNodeFromMutationEvent(node) {
    if(node.nodeType === 1 && node.nodeName !== '#comment') {
        // Register Child Nodes
        [].forEach.call(node.querySelectorAll('['+ internal.config.focusableAttribute +']'), _registerElement);

        node.hasAttribute(internal.config.focusableAttribute) && _registerElement(node);
    }
}

function _removeNodeFromMutationEvent(node) {
    if(node.nodeType === 1 && node.nodeName !== '#comment') {
        // Unregister Child Nodes
        [].forEach.call(node.querySelectorAll('['+ internal.config.focusableAttribute +']'), _unregisterElement);

        node.hasAttribute(internal.config.focusableAttribute) && _unregisterElement(node);
    }
}

function _addNodeFromDomNodeAddedEvent(event) {
    if(event.target.nodeType === 1 && event.target.nodeName !== '#comment') {
        // Register Child Nodes
        [].forEach.call(event.target.querySelectorAll('['+ internal.config.focusableAttribute +']'), _registerElement);

        event.target.hasAttribute(internal.config.focusableAttribute) && _registerElement(event.target);
    }
}

function _removeNodeFromDomNodeAddedEvent(event) {
    if(event.target.nodeType === 1 && event.target.nodeName !== '#comment') {
        // Register Child Nodes
        [].forEach.call(event.target.querySelectorAll('['+ internal.config.focusableAttribute +']'), _unregisterElement);

        event.target.hasAttribute(internal.config.focusableAttribute) && _unregisterElement(event.target);
    }
}

function _removeMutationObservers() {
    if(window.MutationObserver || window.WebKitMutationObserver) {
        internal.domObserver && internal.domObserver.disconnect();
        internal.domObserver = null;
    } else if(internal.config && internal.config.container && internal.config.container.nodeName) {
        internal.config.container.removeEventListener('DOMNodeInserted', _addNodeFromDomNodeAddedEvent);
        internal.config.container.removeEventListener('DOMNodeRemoved', _removeNodeFromDomNodeAddedEvent);
    }
}

function _fireHTMLEvent(element, eventName, eventPayload) {
    var event = document.createEvent('HTMLEvents');

    event.initEvent(eventName, true, true);
    event.data = eventPayload;
    element.dispatchEvent(event);
}

function _fireMouseEvent(element, eventName) {
    var event = document.createEvent('MouseEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
}
