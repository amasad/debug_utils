Debug Utils
-----------

Useful debug utlities and command line debugger driver for chrome.

## Utils

### $duv(object, event)

Attach an event handler that starts debugger when fired.

### $duvl(object, event)

Attach an event handler that logs its arguments when fired.

### $duvr(object, event)

Remove previously set debug event handler.

### $dum(object, method)

Wraps an object's method with a wrapper function with a debugger statement so
you can step into the original funciton. However, if you have reference to
the function you can just use `$duf`.

### $duml(object, method)

### $dumr(object, method)

### $dug(object, property)

Debug when something tries to get at a `property` of an `object.

### $dus

Debug when something tries to get at a `property` of an `object.

### $dugs

Debug when something tries to get at a `property` of an `object.
