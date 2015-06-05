/**
 * Demo - use 'python -m SimpleHTTPServer' to test locally
 */
(function() {
    'use strict';

    require.config({
            'paths' : {
                'magicFocusFinder'  : '../source/main',
                'lodash'            : './bower_components/lodash/lodash'
            }
        }
    );

    require(['lodash', 'magicFocusFinder'], function (_, mff) {

        var config = {
            size : 20,
            colors : [
                'red',
                'orange',
                'yellow',
                'green',
                'blue',
                'violet'
            ]
        };

        createFullGrid(config);

        giveColorsToSparseGrid(config);

        createRandomNodes(config);

        mff.start();
    });

    function addClass(className, element) {
        element.className += ' ' + className;
        return element;
    }

    function createFullGrid(config) {
        _.range(48)
            .map(function() {
                var element = document.createElement('div'),
                    childItem = document.createElement('div');

                childItem.style.background = getRandomColor(config);
                childItem.style.width     = px(20);
                childItem.style.height    = px(20);
                childItem.classList.add('item');
                childItem.setAttribute('focusable', true);

                element.classList.add('pure-u-1-12');

                element.appendChild(childItem);

                document.querySelector('#fullGrid .pure-g').appendChild(element);
            });
    }

    function giveColorsToSparseGrid(config) {
        [].forEach.call(document.querySelectorAll('#sparseGrid .item'), function(element) {
            element.style.background = getRandomColor(config);
        });
    }

    function createRandomNodes(config) {
        _.range(30)
            .map(function() {
                var element = document.createElement('div');

                element.style.background = getRandomColor(config);
                element.style.position   = 'absolute';
                element.style.display    = 'inline-block';
                element.style.top        = px(_.random(20, 480));
                element.style.left       = _.random(0, 95) + '%';
                element.style.width      = px(20);
                element.style.height     = px(20);
                element.setAttribute('focusable', true);

                document.querySelector('#random').appendChild(element);
            });
    }

    function px(pixels) {
        return pixels + 'px';
    }

    function getRandomColor(config) {
        return config.colors[_.random(0, config.colors.length - 1)];
    }

}());
