/*jslint browser: true*/
require.config({
    paths : {
        lodash : './source/vendor/lodash/lodash',
        classListPolyFill : './source/vendor/classListPolyfill/classList'
    }
});

require(['./source/index', 'classListPolyFill'], function (magicFocusFinder, classListPolyFill) {
    'use strict';

    window.magicFocusFinder  = magicFocusFinder;

    document.getElementById('requireJsLoaded').innerHTML = true;
});
