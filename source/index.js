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
                focusedClass : 'focused'
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
            }
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

        document.addEventListener('keyup', _eventManager.bind(this));

        this.private.knownElements = [];

        [].forEach.call(container.querySelectorAll('['+ this.private.config.focusableAttribute +']'), _registerElement.bind(this));
    }

    function _eventManager(event) {
        var mappedKey;

        if(this.private.canMove) {
            if(this.private.currentlyFocusedElement) {
                mappedKey = _.findWhere(this.private.config.keymap, { code : event.keyCode });

                mappedKey && this.private.move[mappedKey.direction].call(this);
            } else if(this.private.config.defaultFocusedElement) {
                this.setCurrent(this.private.config.defaultFocusedElement);
            } else {
                this.setCurrent(_.first(this.private.knownElements));
            }
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
        var centerX = Math.round(element.offsetLeft + (element.offsetWidth / 2)),
            centerY = Math.round(element.offsetTop + (element.offsetHeight / 2)),
            outerBottomY = Math.round(centerY + (element.offsetHeight / 2)),
            outerRightX = Math.round(centerX + (element.offsetWidth / 2));

        return {
            // Top-left corner coords
            x : element.offsetLeft,
            y : element.offsetTop,
            // Outer top center coords
            otx : centerX,
            oty : element.offsetTop,
            // Outer bottom center coords
            obx : centerX,
            oby : outerBottomY,
            // Outer left center coords
            olx : element.offsetLeft,
            oly : centerY,
            // Outer right center coords
            orx : outerRightX,
            ory : centerY
        };
    }

    function _moveUp() {
        console.log('moving up');
        // helper = findHelper().up;
        //             if(helper && typeof $(helper)[0] !== "undefined"){
        //                 setActive($(helper));
        //             }
        //             else{
        //                 closeElements = findCloseElements(function(current, other){
        //                     return current.oty >= other.oby;
        //                 });
        //                 activateClosest(closeElements, 'up', function(current, other){
        //                     return Math.sqrt(Math.pow(current.oty - other.oby, 2) + Math.pow(current.otx - other.obx, 2));
        //                 });
        //             }
    }

    function _moveDown() {
        console.log('moving down');
        //             helper = findHelper().down;
        //             if(helper && typeof $(helper)[0] !== "undefined"){
        //                 setActive($(helper));
        //             }
        //             else{
        //                 closeElements = findCloseElements(function(current, other){
        //                     return current.oby <= other.oty;
        //                 });
        //                 activateClosest(closeElements, 'down', function(current, other){
        //                     return Math.sqrt(Math.pow(current.obx - other.otx, 2) + Math.pow(current.oby - other.oty, 2));
        //                 });
        //             }
    }

    function _moveLeft() {
        console.log('moving left');
        // helper = findHelper().left;
        //             if(helper && typeof $(helper)[0] !== "undefined"){
        //                 setActive($(helper));
        //             }
        //             else{
        //                 closeElements = findCloseElements(function(current, other){
        //                     return current.olx >= other.orx;
        //                 });
        //                 activateClosest(closeElements, 'left', function(current, other){
        //                     return Math.sqrt(Math.pow(current.olx - other.orx, 2) + Math.pow(current.oly - other.ory, 2));
        //                 });
        //             }
    }

    function _moveRight() {
        console.log('moving right');
        //             helper = findHelper().right;
        //             if(helper && typeof $(helper)[0] !== "undefined"){
        //                 setActive($(helper));
        //             }
        //             else{
        //                 closeElements = findCloseElements(function(current, other){
        //                     return current.orx <= other.olx;
        //                 });
        //                 activateClosest(closeElements, 'right', function(current, other){
        //                     return Math.sqrt(Math.pow(current.orx - other.olx, 2) + Math.pow(current.ory - other.oly, 2));
        //                 });
        //             }
    }

    function _fireEnter() {
        console.log('fire enter');
        // $currentElement.trigger('keynav.enter');
    }

});
