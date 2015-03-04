/*jslint browser: true*/
require.config({
    paths : {
        lodash : './vendor/lodash/lodash'
    }
});

require(['./source/index'], function (magicFocusFinder) {
    'use strict';

    window.magicFocusFinder  = magicFocusFinder;

    document.getElementById('requireJsLoaded').innerHTML = true;
});
