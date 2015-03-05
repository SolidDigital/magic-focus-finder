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
                    }
                ],
                focusableAttribute : 'focusable',
                defaultFocusedElement : null,
                container : 'document',
                eventNamespace : 'magicFocusFinder',
                focusedClass : 'focused'
            },
            currentlyFocusedElement : null,
            knownElements : []
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
        if(this.private.config.defaultFocusedElement){
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

        this.private.knownElements = [];

        [].forEach.call(container.querySelectorAll('['+ this.private.config.focusableAttribute +']'), _registerElement.bind(this));
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

});
