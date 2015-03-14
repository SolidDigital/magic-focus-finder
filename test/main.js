(function() {
    'use strict';

    require.config({
        shim : {
            mocha: {
                exports: 'mocha'
            }
        },
        paths : {
            chai                : './bower_components/chai/chai',
            classListPolyFill   : './bower_components/classListPolyfill/classList',
            lodash              : './bower_components/lodash/lodash',
            magicFocusFinder    : '../source/main',
            mocha               : './bower_components/mocha/mocha'
        }
    });

    require(['mocha', './test', 'classListPolyFill'], function (mocha) {

        if (typeof mochaPhantomJS !== 'undefined') {
            window.mochaPhantomJS.run();
        } else {
            mocha.run();
        }
    });

}());
