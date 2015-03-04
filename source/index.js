define(['lodash'], function (_) {
    'use strict';

    return {
        configure : configure,
        getConfig : getConfig,
        start : start,
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
                eventNamespace : 'magicFocusFinder'
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

    }
});
