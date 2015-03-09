/*jslint browser: true*/
require.config({
    paths : {
        lodash : './bower_components/lodash/lodash',
        classListPolyFill : './bower_components/classListPolyfill/classList'
    }
});

require(['./source/main', 'classListPolyFill'], function (magicFocusFinder) {
    'use strict';

    window.magicFocusFinder  = magicFocusFinder;

    document.getElementById('requireJsLoaded').innerHTML = true;
});
