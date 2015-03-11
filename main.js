/**
 * Demo - use 'python -m SimpleHTTPServer' to test locally
 */
(function() {
    'use strict';

    require.config({
            'paths' : {
                'magicFocusFinder'  : 'vendor/magic-focus-finder/source/main',
                'lodash'            : 'vendor/lodash/lodash'
            }
        }
    );

    require(['lodash', 'magicFocusFinder'], function (_, mff) {

        var config = {
                numberoOfDivs : 50,
                size : 20,
                colors : [
                    'red',
                    'orange',
                    'yellow',
                    'green',
                    'blue',
                    'violet'
                ]
            },
                size = getWindowSize();

        _
            .range(config.numberoOfDivs)
            .map(function() {
                return draw({
                    x : _.random(0, size.width - config.size),
                    y : _.random(0, size.height - config.size),
                    color : config.colors[_.random(0, config.colors.length - 1)],
                    size : config.size
                });
            });

        mff.start();
    });

    function draw(div) {
        var element = document.createElement('div');
        element.style.background = div.color;
        element.style.position = 'absolute';
        element.style.top       = px(div.y);
        element.style.left      = px(div.x);
        element.style.width     = px(div.size);
        element.style.height    = px(div.size);
        element.setAttribute('focusable', true);

        document.body.appendChild(element);
        return element;
    }

    function px(pixels) {
        return pixels + 'px';
    }

    function getWindowSize() {
        var size = {width:0, height: 0};

        if (window.innerWidth) {
            size.width = window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            size.width = document.documentElement.clientWidth;
        }
        else if (document.body) {
            size.width = document.body.clientWidth;
        }

        if (window.innerHeight) {
            size.height = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            size.height = document.documentElement.clientHeight;
        }
        else if (document.body) {
            size.height = document.body.clientHeight;
        }

        return size;
    }
}());


