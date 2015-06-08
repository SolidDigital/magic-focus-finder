# Magic Focus Finder [![Bower version](https://badge.fury.io/bo/magic-focus-finder.png)](http://badge.fury.io/bo/magic-focus-finder) [![Build Status](https://travis-ci.org/Solid-Interactive/magic-focus-finder.png?branch=master)](https://travis-ci.org/Solid-Interactive/magic-focus-finder)

Intended to help keyboard navigation through html nodes.

[Try out the demo](http://solid-interactive.github.io/magic-focus-finder/)

Tests can be run in a browser. `python -m SimpleHTTPServer` from the project root, then visit: http://0.0.0.0:8000/test/ .
Should do a bower install first.

To run the test via CLI: `npm test` after doing a bower and npm install.

---

This is heavily influenced by (and sort of a rip off of) this repo: [jquery.keyJumper](https://github.com/mbitto/jquery.keyJumper)

The diff will be

1. no jquery
2. using mutation observers to know when new focusable elements are added / removed from the DOM.
3. full custom event support so that it will work with custom elements and dom binding libraries seemless.
3. customizable key mapping so that I can use it with TV remote controls.
4. wrap in integration tests
5. semvar and bower
6. amd compliant
7. full wiki and examples page

---

how I would like to use it in a AMD module:

```javascript
define(['./vendor/magic-focus-finder/source/index'], function(magicFocusFinder) {
// Basically I want to initialize it with an options object then be able to call start, stop, and refresh etc.
  magicFocusFinder
    .configure(optionsObject)
    .start();
});
```

The configure method can be passed multiple arguments. They will all be extended into each other.

Options Object

```javascript
{
  keymap : {},  //override the default browser keymap
  weightOverrideAttribute : 'weight-override', // weight-override-up, down, left, and right can be set to 'distance' or 'azimuth' and the other will be disregarded
  focusableAttribute : '', //override the default data attribute used to denote focusability
  focusedClass : '', // a focus class for non focusable elements
  defaultFocusedElement : '', // a element reference, or a selector
  container : '', //the container in which this thing lives, default to the document.,
  eventNamespace : '', //custom namespace for events, default to 'magicFocusFinder'
  overrideDirectionAttribute : 'focus-overrides',
  captureFocusAttribute : 'capture-focus',
  dynamicPositionAttribute : 'dynamic-position',
  useRealFocus : true, // Will trigger `blur` and `focus` on the actual elements, if set to false, bypass this.
  azimuthWeight : 5, // Higher value means that it will prefer elements in the direction it is going
  distanceWeigth : 1, // Higher value means that it will prefer elements that are closer
  debug : false // Setting to true will replace the elements innerHTML with the computed distance (weighted azimuth + weighted distance)
}
```

All elements with `config.focusableAttribute` can be given focus to. After starting and a key press, focus is given to
`config.defaultFocusedElement`, or the first element found with `config.focusdClass`, or the first element found with
the focusable attribute.

## Events
It will fire the following events in the following order - events bubble up and are cancelable, so you can listen on `mff.getContainer()` for all these events.

This example moves focus from Element One to Element Two

1. `losing-focus` - on Element One - `event.data` has `{ "from" : domElementOne }`
2. `focus-lost` - on Element One - `event.data` has `{ "from" : domElementOne }`
3. `gaining-focus` - on Element Two - `event.data` has `{ "to" : domElementTwo }`
4. `focus-gained` - on Element Two - `event.data` has `{ "to" : domElementTwo }`
5. `focus-moved` - on Element Two - `event.data` is the object:

    ```json
    {
        "direction" : "up|down|left|right",
        "from"      : domElementOne,
        "to"        : domElementTwo
    }
    ```

### Element level

Not Implemented:
1. `focus` normal focus event
2. `blur` normal blur event
5. `magicFocusFinder:focus:from:<% direction %>` namespaced focus event telling you which direction the focus came  from
6. `magicFocusFinder:blur:to:<% direction %>` namespaced blur event telling you which direction the element was blurred to.

### Container level
Implemented

Not Implemented:
1. `magicFocusFinder:elementAdded` event telling you a focusable element was added to the container.
2. `magicFocusFinder:elementRemoved` event telling you a focusable element was removed from the container.

## Attributes

You can specify on a per element basis whether you want `distance` or `azimuth` to be the only factor in determining the 
next focused element. You have to specify up, down, left, or right following the `weightOverrideAttribute`:

```html
<div weight-override-up='azimuth' focusable> </div>
```

##Methods

### configure(options)
configure the defaults, can be called at anytime to change the configuration
```javascript
magicFocusFinder.configure(options)
```

### getConfig()
returns the current configuration
```javascript
magicFocusFinder.getConfig()
```

### getContainer()
returns the overall container - events bubble up to this

### start()
starts the dang thing, if start is called before configure, then default options will be used.
```javascript

```

### lock()
locks it up
```javascript

```

### refresh()
will refresh the element mapping (should only be used if your browser does not support mutation observers)
Otherwise it will watch the DOM for new elements.
```javascript

```

### setCurrent(element)
set the current focused element, element ref or selector
```javascript

```

### getCurrent()
get the current focused element, element ref of selector
```javascript

```

### move[direction](options)
tell the focus to move in a direction
```javascript
mff.move.right()
mff.move.down({ events : false });
```

Can move up, down, left, or right. Can turn off all events for a move by setting the events key to `false` on the options object.

### destroy()
destroy this thing and free up all memory
```javascript

```
---

Rawk.
