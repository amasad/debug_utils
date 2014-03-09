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

### $duf(function ref)

Set a breakpoint on the first line of the function referenced. Works by
searching through the source for the function, so it won't work if you have
multiple functions with the _exact_ same source. See `$dum` to debug a method.

### $dufl(function ref)

Logs the arguments passed to the function.

### $dufr(function ref)

Removes previosly set debugger or log statement.

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
