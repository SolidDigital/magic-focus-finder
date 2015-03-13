/*jslint browser: true*/
require.config({
    paths : {
        lodash : './bower_components/lodash/lodash',
        classListPolyFill : './bower_components/classListPolyfill/classList',
        happen : './bower_components/happen/happen'
    }
});

require(['./source/main', 'happen', 'classListPolyFill'], function (magicFocusFinder, happen) {
    'use strict';

    window.magicFocusFinder  = magicFocusFinder;

    console.log(happen);
    window.happen = happen;

    document.getElementById('requireJsLoaded').innerHTML = true;
});
