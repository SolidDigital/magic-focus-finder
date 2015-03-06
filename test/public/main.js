/*jslint browser: true*/
require.config({
    shim : {
        mutationObserverPolyfill : {
            deps: ['weakMapPolyfill']
        }
    },
    paths : {
        lodash : './bower_components/lodash/lodash',
        classListPolyFill : './bower_components/classListPolyfill/classList',
        weakMapPolyfill : './bower_components/WeakMap/WeakMap',
        mutationObserverPolyfill : './bower_components/MutationObserver/MutationObserver'
    }
});

require(['./source/main', 'classListPolyFill', 'mutationObserverPolyfill'], function (magicFocusFinder) {
    'use strict';

    window.magicFocusFinder  = magicFocusFinder;

    document.getElementById('requireJsLoaded').innerHTML = true;
});
