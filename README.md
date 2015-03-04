# Magic Focus Finder

Intended to help keyboard navigation through html nodes.

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
  defaultFocusedElement : '' // a element reference, or a selector
  container : '' //the container in which this thing lives, default to the document.,
  eventNamespace : '' //custom namespace for events, default to 'magicFocusFinder'
}
```

## Events
It will fire the following events.

### Element level
1. `focus` normal focus event
2. `blur` normal blur event
3. `magicFocusFinder:focus` namespaced focus event
4. `magicFocusFinder:blur` namespaced blur event
5. `magicFocusFinder:focus:from:<% direction %>` namespaced focus event telling you which direction the focus came from
6. `magicFocusFinder:blur:to:<% direction %>` namespaced blur event telling you which direction the element was blurred to.

### Container level
1. `magicFocusFinder:elementAdded` event telling you a focusable element was added to the container.
2. `magicFocusFinder:elementRemoved` event telling you a focusable element was removed from the container.


##Methods

### configure(options)
configure the defaults, can be called at anytime to change the configuration
```javascript

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
Otherwise it will watch the dom for new elements.
```javascript

```

### setCurrent(element)
set the current focused element, element ref or selector
```javascript

```

### getCurrent()
get the current focues element, element ref of selector
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
