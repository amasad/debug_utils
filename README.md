Debug Utils ![](http://i.imgur.com/C4GDJ9O.png)
-----------

JavaScript debugging utility library.

## Install

### Chrome extension

The easiest way to install is to grab the [chrome extension](https://chrome.google.com/webstore/detail/djailkkojeahmihdpcelmmobkpepmkcl) which will add the
utility functions (described below) to your JavaScript console.

### Script

Grab `du.js` and add it in script tag on your page, which will make all the
the functions (described below) available under the `window.debugUtils`
namespace. To import the functions to the global namespace simply call
`debugUtils.global()`.

### Node.js

I haven't put much consideration into how will this work in node but I use it
for running the tests so it should probably work.

```
$ npm install debug_utils
```

```js
var du = require('debug_utils');
du.$duv(object, 'foo');
// Make the functions available globally.
du.global();
$duv(object, 'bar');
```

## Naming

I tried to name the functions so that they're memorable and easy to type. Here
are the rules that I followed for naming:

* All functions start with `$du` to avoid conflicts.
* Somewhat pronounceable to enable profits via word-of-mouth marketing.
* After `$du` there comes a single letter to hint at the functionality we are
debugging. e.g. `$duv`, v for events.
* `l` at the end of the function means 'log'. e.g. `$duvl`, log events.
* `r` at the end of the function name means 'remove'.


## Event Debugging

As the complexity of a system grows, evented programming can make it very hard
to debug. The following utilities should help you:

### $duv(object, event)

Attach an event handler that starts debugger when trigerred.

Usesful for:

* Making sure the event is being trigerred.
* Stepping through other event handlers.
* Finding out what trigerred the event.

### $duvl(object, event)

Attach an event handler that logs its arguments when fired.

Usesful for:

* Making sure the event is being fired with the correct args.

### $duvr(object, event)

Remove previously set debug event handler.

## Debugging Property Access

Often times you find that some object is changing from under your feet. And you
need to find out what is changing that object. These are utilities for you:

### $dug(object, property)

Debug when something tries to get at a `property` of an `object`.

Useful for:

* Knowing which parts of the code is using your object.
* Tracking the value over calls and time.

### $dugl(object, property)

Like `$dug` but adds logging instead of `debugger`.

### $dugr(object, property)

Removes getters set by `$dugl` and `$dug`.

### $dus(object, property)

Debug when something tries to set a `property` on an `object`.

Useful for:

* Knowing which parts of the code is mutating yo shit.
* Tracking values set over time.

### $dusl(object, property)

Like `$dus` but adds logging instead of `debugger`.

### $dusr(object, property)

Removes setters set by `$dus` or `$dusl`.

### $dugs(object, property)

Debug both getter and setter. It's like calling `$dug` and `$dus` on an object.

### $dugsl(object, property)

Like `$dugs` but adds logging instead.

### $dugsr(object, property)

Removes getters and setters set by `$dugs` and `$dugsl`.

## Method debugging

The JavaScript command line API provides really nice utilities for debugging
functions:

* `monitor`|`unmonitor`: logs function calls.
* `debug`|`undebug`: adds a breakpoint on the first line of the function.

However, they don't work for native methods. The following should help:

### $dum(object, method)

Wraps an object's method with a wrapper function with a `debugger` statement.

Useful for:

* Debugging native methods: `$dum(Event.prototype, 'preventDefault')`

### $duml(object, method)

Like `$dum` but logs arguments instead.

### $dumr(object, method)

Removes debug or log wrappers added by `$dum` or `$duml`.

## Debugging Callbacks

For APIs taking callbacks, it's really useful to be able to drop in a
logger or a debugger statement. The following functions are shorter to type out:

### $dudebug

A function with a debugger statement.

```js
xhr.onreadystatechange = $dudebug;
```

Useful for:

* Making sure callbacks are being called.
* Breaking on callback.

p.s. no pun intended.

### $dulog

Similar to `$dudebug` but logs it's arguments instead of breaking.

### $dulogm(message)

When called returns a function that logs it's arguments prefixed with `message`.

```js
xhr.onreadystatechange = $dulogm('xhr readystate change');
```

## License

MIT  
Copyright (c) 2014 Amjad Masad <amjad.masad@gmail.com>
