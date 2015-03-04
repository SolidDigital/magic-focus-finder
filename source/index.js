/*jslint browser: true*/
define(['lodash'], function (_) {
    'use strict';

    return {
        configure : configure,
        getConfig : getConfig,
        start : start,
        setCurrent : setCurrent,

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
            currentlyFocusedElement : null
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
        // _options = $.extend({
        //     navigableClass : '',
        //     onClass : '',
        //     offClass : ''
        // }, options);

        if(this.private.config.defaultFocusedElement){
            this.setCurrent(this.private.config.defaultFocusedElement);
        }

        // var inputOrTextarea = $currentElement.find('input', 'textarea');
        // if(inputOrTextarea.length > 0){
        //     inputOrTextarea.trigger('focus');
        // }
        // else{
        //     $currentElement.trigger('focus');
        // }
        //
        // // Register all the visible elements
        // return this.each(function() {
        //     registerElement(this);
        // });
    }

    function setCurrent(querySelector) {
        var element = document.querySelector(querySelector),
            currentlyFocusedElement = this.private.currentlyFocusedElement;

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

});
