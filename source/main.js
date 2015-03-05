/*jslint browser: true*/
require.config({
    paths : {
        lodash : './vendor/lodash/lodash',
        classListPolyFill : './vendor/classListPolyfill/classList'
    }
});

require(['./source/magicFocusFinder', 'classListPolyFill'], function (magicFocusFinder, classListPolyFill) {
    'use strict';

});
