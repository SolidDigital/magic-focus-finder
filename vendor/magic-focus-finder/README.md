# Magic Focus Finder [![Bower version](https://badge.fury.io/bo/magic-focus-finder.png)](http://badge.fury.io/bo/magic-focus-finder) [![Build Status](https://travis-ci.org/Duder-onomy/magic-focus-finder.png?branch=bower)](https://travis-ci.org/Duder-onomy/magic-focus-finder)

Intended to help keyboard navigation through html nodes.

[Try out the demo](http://duder-onomy.github.io/magic-focus-finder/)

Tests can be run in a browser. `python -m SimpleHTTPServer` from the project root, then visit: http://0.0.0.0:8000/test/ .
Should do a bower install first.

To run the test via CLI: `npm test` after doing a bower and npm install.

### This is currently not a complete readme, I wrote this for a project I am on, will flesh out the details this weekend with example page and Travis-ci integration.

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

Options Object

```javascript
{
  keymap : {},  //override the default browser keymap
  focusableAttribute : '', //override the default data attribute used to denote focusability
  focusedClass : '', // a focus class for non focusable elements
  defaultFocusedElement : '', // a element reference, or a selector
  container : '', //the container in which this thing lives, default to the document.,
  eventNamespace : '', //custom namespace for events, default to 'magicFocusFinder'
  overrideDirectionAttribute : 'focus-overrides',
  captureFocusAttribute : 'capture-focus',
  dynamicPositionAttribute : 'dynamic-position'
}
```

All elements with `config.focusableAttribute` can be given focus to. After starting and a key press, focus is given to
`config.defaultFocusedElement`, or the first element found with `config.focusdClass`, or the first element found with
the focusable attribute.

## Events
It will fire the following events.

### Element level
Implemented
1. `losing-focus` before the element loses focus.
1. `focus-lost` when the focus is lost on an element.
1. `gaining-focus` before the next element gains focus.
1. `focus-gained` when the element actually gains focus.

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

### move(direction)
tell the focus to move in a direction
```javascript

```

### destroy()
destroy this thing and free up all memory
```javascript

```
---

Rawk.
