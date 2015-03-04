/**
 * jquery.keyJumper
 *
 * Version:     1.2.0
 * Last Update: 2013/06/26
 * Manuel Bitto (manuel.bitto@gmail.com)
 *
 * This plugin is intended to help keyboard navigation through html nodes.
 *
 * changelog:
 *
 * version 1.0.1 -> Skip visibility:hidden elements
 * version 1.0.2 -> Removed scanned area
 * version 1.1.0 -> Changed helper logic to be more intuitive
 * version 1.1.1 -> Fixed rendering bug on setCurrent
 * version 1.2.0 -> Refresh will take in account modifies to elements
 *
 */

(function($) {

    var _options,
        knownElements = [],
        currentElement = null,
        $currentElement = null,
        canMove = true,
        onAfterChange = [];

    var init = function(options) {

        _options = $.extend({
            navigableClass : '',
            onClass : '',
            offClass : ''
        }, options);

        if(currentElement === null){
            if(_options.onClass === ''){
                console.error('keyNavigator has no class name defined for active (on) element');
            }
            currentElement = $('.' + _options.onClass).filter(function(){
                return $(this).not(":hidden") && $(this).css("visibility") === "visible";
            }).first()[0];
            if(typeof currentElement === "undefined"){
                currentElement = $('.' + _options.navigableClass).first();
                currentElement.addClass(_options.onClass);
            }
            $currentElement = $(currentElement);
        }

        var inputOrTextarea = $currentElement.find('input', 'textarea');
        if(inputOrTextarea.length > 0){
            inputOrTextarea.trigger('focus');
        }
        else{
            $currentElement.trigger('focus');
        }

        // Register all the visible elements
        return this.each(function() {
            registerElement(this);
        });
    };

    // Register an element setting some interesting properties
    var registerElement = function(element) {
        var $element = $(element);

        // If element is hidden
        if($element.is(':hidden') || $element.css("visibility") === "hidden"){
            return false;
        }

        $element.data('position', getPosition(element));
        $element.data('onClass', _options.onClass);
        $element.data('offClass', _options.offClass);
        $element.mouseover(function(){
            setActive(this);
        });

        knownElements.push(element);
    };

    // Get position of element
    var getPosition = function (element) {

        var $element = $(element),
            offsetLeft = $element.offset().left,
            offsetTop = $element.offset().top,
            outerHeight = $element.outerHeight(),
            outerWidth = $element.outerWidth(),
            centerX = Math.round(offsetLeft + (outerWidth / 2)),
            centerY = Math.round(offsetTop + (outerHeight / 2)),
            outerBottomY = Math.round(centerY + (outerHeight / 2)),
            outerRightX = Math.round(centerX + (outerWidth / 2));

        return {
            // Top-left corner coords
            x : offsetLeft,
            y : offsetTop,
            // Outer top center coords
            otx : centerX,
            oty : offsetTop,
            // Outer bottom center coords
            obx : centerX,
            oby : outerBottomY,
            // Outer left center coords
            olx : offsetLeft,
            oly : centerY,
            // Outer right center coords
            orx : outerRightX,
            ory : centerY
        };
    };

    // Find elements close to current element
    var findCloseElements = function(isClose){

        var closeElements = [];
        var currentElementPosition = $currentElement.data("position");

        // Check within each known element
        for(var i = 0; i < knownElements.length; i++) {

            var $knownElement = $(knownElements[i]);
            var knownElementPosition = $knownElement.data("position");

            // Check if known element is close to current element
            var isCloseElement = isClose(currentElementPosition, knownElementPosition);

            if(isCloseElement && currentElement != knownElements[i]) {
                closeElements.push(knownElements[i]);
            }
        }

        return closeElements;
    };

    var findHelper = function(){

        if(typeof $(currentElement).data("keynav-helper") === "undefined"){
            return { up: null, right: null, down: null, left: null };
        }

        // Parse helper content
        var helperContentArray = $(currentElement).data("keynav-helper").split(" ");
        return{
            up: helperContentArray[0],
            right: helperContentArray[1],
            down: helperContentArray[2],
            left: helperContentArray[3]
        }
    };

    // Activate closest element (if exist)
    var activateClosest = function(closeElements, direction, getDistance) {

        var closestElement,
            closestDistance,
            distance,
            closeElementsPosition,
            i,
            currentElementPosition = $currentElement.data("position");

        // Find closest element within the close elements
        for(i = 0; i < closeElements.length; i++) {
            closeElementsPosition = $(closeElements[i]).data("position");

            // Find distance between 2 elements
            distance = getDistance(currentElementPosition, closeElementsPosition);

            // Check if is the closest found yet
            if(typeof closestDistance === "undefined" || distance < closestDistance) {
                closestDistance = distance;
                closestElement = closeElements[i];
            }
        }

        // If closest element is found activate it
        if(typeof closestElement !== "undefined"){
            setActive(closestElement);
        }
    };

    // Manage keyboard events
    var eventsManager = function(event){
        if(canMove){
            var closeElements,
                helper;

            switch(event.keyCode){
                case 37:    // Left
                    helper = findHelper().left;
                    if(helper && typeof $(helper)[0] !== "undefined"){
                        setActive($(helper));
                    }
                    else{
                        closeElements = findCloseElements(function(current, other){
                            return current.olx >= other.orx;
                        });
                        activateClosest(closeElements, 'left', function(current, other){
                            return Math.sqrt(Math.pow(current.olx - other.orx, 2) + Math.pow(current.oly - other.ory, 2));
                        });
                    }
                    break;
                case 38:    // Up
                    helper = findHelper().up;
                    if(helper && typeof $(helper)[0] !== "undefined"){
                        setActive($(helper));
                    }
                    else{
                        closeElements = findCloseElements(function(current, other){
                            return current.oty >= other.oby;
                        });
                        activateClosest(closeElements, 'up', function(current, other){
                            return Math.sqrt(Math.pow(current.oty - other.oby, 2) + Math.pow(current.otx - other.obx, 2));
                        });
                    }
                    break;
                case 39:    // Right
                    helper = findHelper().right;
                    if(helper && typeof $(helper)[0] !== "undefined"){
                        setActive($(helper));
                    }
                    else{
                        closeElements = findCloseElements(function(current, other){
                            return current.orx <= other.olx;
                        });
                        activateClosest(closeElements, 'right', function(current, other){
                            return Math.sqrt(Math.pow(current.orx - other.olx, 2) + Math.pow(current.ory - other.oly, 2));
                        });
                    }
                    break;
                case 40:    // Down
                    helper = findHelper().down;
                    if(helper && typeof $(helper)[0] !== "undefined"){
                        setActive($(helper));
                    }
                    else{
                        closeElements = findCloseElements(function(current, other){
                            return current.oby <= other.oty;
                        });
                        activateClosest(closeElements, 'down', function(current, other){
                            return Math.sqrt(Math.pow(current.obx - other.otx, 2) + Math.pow(current.oby - other.oty, 2));
                        });
                    }
                    break;
                case 13:    // Enter
                    $currentElement.trigger('keynav.enter');
                    break;
                default: // nothing to do
            }
        }
    };

    // Set selected element as active
    var setActive = function(element, silently) {

        // Set active but tell no one
        silently = silently || false;

        var oldElement = currentElement;
        var $oldElement = $(oldElement);

        currentElement = element;
        $currentElement = $(currentElement);

        $oldElement.removeClass(_options.onClass).addClass(_options.offClass);
        $currentElement.removeClass(_options.offClass).addClass(_options.onClass);

        if(!silently){
            if(onAfterChange !== null){
                $oldElement.trigger('blur');
                $currentElement.trigger('focus');
                $currentElement.trigger('changeSelected');
                for(var i = 0; i < onAfterChange.length; i++){
                    onAfterChange[i]($currentElement, $oldElement);
                }
            }
        }
    };

    var publicMethods = {

        // Get current element
        getCurrent : function(){
            return $currentElement;
        },

        // Set current element
        setCurrent : function(element, silently){
            if(typeof element[0] !== "undefined"){
                element = element[0];
            }
            setTimeout(function(){
                setActive(element, silently);
            }, 0);
            publicMethods.refresh.call(this);
        },

        // After change selected element event callback
        onAfterChange : function(callback){
            onAfterChange.push(callback);
        },

        // Lock movements
        lock : function(state){
            canMove = !state;
        },

        // Refresh keyJumper
        refresh : function(){
            knownElements = [];
            currentElement = null;
            var currentElements = $('.' + _options.navigableClass);
            init.call(currentElements, _options);
        },

        destroy : function(){
            knownElements = [];
            currentElement = null;
            $currentElement = null;
            canMove = true;
            onAfterChange = [];
            $(document).off('keyup.keyJumper');
        }
    };

    // Plug keyJumper in
    $.fn.keyJumper = function(method){

        // We have a method like $('page').keyJumper("setActive");
        if ( publicMethods[method] ) {
            return publicMethods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        // We have a initialization of keyJumper
        else if ( typeof method === 'object' || ! method ) {
            $(document).on('keyup.keyJumper', eventsManager);

            return init.apply( this, arguments );
        }
        // We've done something wrong here
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.keyJumper' );
        }
    };
})(jQuery);
