(function() {

/**
 * Export for testing.
 */

var exports = {
  $duv: $duv,
  $duvl: $duvl,
  $duvr: $duvr,
  $duf: $duf,
  $dufl: $dufl,
  $dufr: $dufr,
  $dum: $dum,
  $duml: $duml,
  $dumr: $dumr,
  $dug: $dug,
  $dugl: $dugl,
  $dus: $dus,
  $dusl: $dusl,
  $dugs: $dugs,
  $dugsl: $dugsl,
  $dugsr: $dugsr,
};

if (typeof module === 'object' && typeof exports === 'object') {
  module.exports = exports;
} else {
  this.debugUtils = exports;
}

/**
 *
 * Event debugging
 * ---------------
 *
 */

var listenMethods = [
  'addEventListener',
  'addListener',
  'attachEvent',
  'on'
];

var removeListenerMethods = [
  'removeEventListener',
  'removeListener',
  'off'
];

var dontKnowHowToListenMsg = 'Don\'t how to listen to your object, please ' +
  'open an issue if you think we should be able to.';

var listeners = {};

/**
 * Adds a debugger or logger `event` handler to `object.
 *
 * @param {object} object
 * @param {string} event
 * @param {boolean} isLog
 * @private
 * @return {*} Whatever is returned from the event listener method.
 */

function debugEvent(object, event, isLog) {
  assert(
    object && typeof object === 'object' && typeof event === 'string',
    'Need an object to listen to and an event to listen on.'
  );

  var ret, handler;

  if (isLog) {
    handler = function() {
      console.log('Event %s fired on %s with args', arguments);
    };
  } else {
    handler = function() {
      debugger;
    };
  }

  ret = applyOne(
    object,
    listenMethods,
    [event, handler],
    dontKnowHowToListenMsg
  );

  if (!listeners[event]) listeners[event] = [];
  listeners[event].push({
    object: object,
    handler: handler
  });

  return ret;
}

/**
 * Adds a debugger `event` handler to `object
 *
 * @param {object} object
 * @param {string} event
 * @public
 * @return {*} Whatever is returned from the event listener method.
 */

function $duv(object, event) {
  return debugEvent(object, event, false);
}

/**
 * Adds a logger `event` handler to `object
 *
 * @param {object} object
 * @param {string} event
 * @public
 * @return {*} Whatever is returned from the event listener method.
 */

function $duvl(object, event) {
  return debugEvent(object, event, true);
}

/**
 * Removes previously set `event` handler by `$duv` or `$duvl` from `object`.
 *
 * @param {object} object
 * @param {string} event
 * @public
 */

function $duvr(object, event) {
  listeners[event].filter(function(desc) {
    return desc.object === object;
  }).forEach(function(desc) {
    applyOne(
      object,
      removeListenerMethods,
      [event, desc.handler],
      dontKnowHowToListenMsg
    );
  });
}

/**
 *
 * Function debugging
 * ------------------
 *
 */

function genInjection(fn, injectedCode) {
  var id = uid();
  Object.defineProperty(fn, '__$duuid', {
    value: id,
    configurable: false,
    enumerable: false,
    writable: false
  });
  return '\n// ' + id + '\n' + injectedCode;
}

function removeDebuggerStatement(sourceFile, fnSource, fn) {
  assert(fn.__$duuid, 'Function was not debugged by $duf()');
  var id = fn.__$duuid;
  var source = getSource(fn);
  var lines = source.split('\n');
  assert(
    lines[1] === '// ' + id, 'Cannot find my debugger statement.'
  );
  assert(
    lines[2] === 'debugger;' ||
      lines[2] === 'console.log(arguments);',
    'Cannot find my debugger statement.'
  );
  lines.splice(1, 2);
  modified = lines.join('\n');
  sourceFile.setContent(
    sourceFile.getContent().replace(fnSource, modified),
    function(status) {
      assert(
        status.code === 'OK',
        'Error updating source code for file ' + sourceFile.url
      );
      console.log('Debugger statement removed succesfully');
    }
  )
}

function injectStatement(sourceFile, fnSource, fn, injectedCode) {
  var m = fnSource.match(/^function\s+[^\(]*\([^\)]*\)\s*\{/);
  if (!m) throw new Error('Error parsing function source.');
  var len = m[0].length;
  var modified =
    fnSource.substr(0, len) +
    genInjection(fn, injectedCode) +
    fnSource.substr(len);
  sourceFile.setContent(
    sourceFile.getContent().replace(fnSource, modified),
    function(status) {
      assert(
        status.code === 'OK',
        'Error updating source code for file ' + sourceFile.url
      );
      console.log('Debug statement added succesfully');
    }
  );
}

function addLogStatement(sourceFile, fnSource, fn) {
  injectStatement(sourceFile, fnSource, fn, 'console.log(arguments);');
}

function addDebuggerStatment(sourceFile, fnSource, fn) {
  injectStatement(sourceFile, fnSource, fn, 'debugger;');
}

function getSource(ref) {
  assert(typeof ref === 'function', ref + ' is not a function.');

  var source = ref.toString();

  if (source.match('\[native\scode]\s\}$')) {
    throw new Error('Can\'t step debug native code, try $dum()');
  }

  return source;
}

function getResourceFor(source, url, callback) {
  chrome.devtools.inspectedWindow.getResources(function(resources) {
    var sourceFiles = resources.filter(function(res) {
      if (url && res.url.indexOf(url) === -1) {
        return false;
      } else {
        return res.getContent().indexOf(source) !== -1
      }
    });
    var sourceFile = sourceFiles[0];
    if (!sourceFiles.length) {
      throw new Error('Function not found in loaded resources.');
    } else if (sourceFiles.length > 1) {
      console.warn(
        'Found more than source file with the same function',
        'Try supplying a resource url or using $dum()'
      );
    }
    callback && callback(sourceFile);
  });
}

/**
 * Adds a debugger statement to a function reference.
 *
 * @param {function} ref
 * @param {string} url
 * @public
 */

function $duf(ref, url) {
  var source = getSource(ref);

  getResourceFor(source, url, function(resource) {
    addDebuggerStatment(resource, source, ref);
  });
}

/**
 * Adds a logger statement to a function reference.
 *
 * @param {function} ref
 * @param {string} url
 * @public
 */

function $dufl(ref, url) {
  var source = getSource(ref);

  getResourceFor(source, url, function(resource) {
    addLogStatement(resource, source, ref);
  });
}

/**
 * Removes previously set debugger/logger statement to a function reference.
 *
 * @param {function} ref
 * @param {string} url
 * @public
 */

function $dufr(ref, url) {
  var source = getSource(ref);

  getResourceFor(source, url, function (resource) {
    removeDebuggerStatement(resource, source, ref);
  });
}


/**
 *
 * Method Debugging
 * ----------------
 *
 */

var wrappedMethods = [];

function wrapMethod(object, methodName, isLog) {
  assert(
    typeof object === 'object' &&
      object && typeof object[methodName] === 'function',
    'Illegal object or failed to find method.'
  );

  var method = object[methodName];

  wrappedMethods.push({
    object: object,
    method: method
  });

  var slice = [].slice;
  var replacement;

  if (isLog) {
    replacement = function() {
      console.log(arguments);
      return method.apply(object, slice.call(arguments));
    };
  } else {
    replacement = function() {
      debugger;
      return method.apply(object, slice.call(arguments));
    };
  }

  object[methodName] = replacement;
}

function $dum(object, method) {
  wrapMethod(object, method);
}

function $duml(object, method) {
  wrapMethod(object, method, true);
}

function $dumr(object, method) {
  for (var i = 0; i < wrappedMethods.length; i++) {
    var item = wrappedMethods[i];
    if (item.object === object) {
      object[method] = item.method;
      wrappedMethods.splice(i, 1);
      return true;
    }
  }
  return false;
}

/**
 *
 * Getters and setters debugging
 * -----------------------------
 *
 */

var descriptors = [];

function debugAccessor(object, prop, options) {
  var desc = Object.getOwnPropertyDescriptor(object, prop);

  if (desc.get || desc.set) {
    throw new Error(
      '$dug doesn\'t currently support properties with accessors.'
    );
  }

  var val = desc.value;

  descriptors.push({
    object: object,
    desc: desc,
    getVal: function() { return val }
  });

  var newDesc = {
    configurable: false,
    enumerable: desc.enumerable,
    set: function(v) {
      return val = v;
    },
    get: function() {
      return val;
    }
  };

  if (options.log) {
    if (options.getter) {
      newDesc.get = function() {
        console.log('About to get value from property', prop);
        return val;
      };
    }
    if (options.setter) {
      newDesc.set = function(v) {
        console.log('About to set value on property', prop);
        return val = v;
      };
    }
  } else {
    if (options.getter) {
      newDesc.get = function() {
        debugger;
        return val;
      };
    }
    if (options.setter) {
      newDesc.set = function(v) {
        debugger;
        return val = v;
      };
    }
  }

  Object.defineProperty(object, prop, newDesc);
}

function removeAccessors(object, prop) {
  for (var i = 0; i < descriptors.length; i++) {
    var item = descriptors[i];
    if (item.object === object) {
      item.desc.val = item.getVal();
      object.defineProperty(object, prop, item.desc);
      return true;
    }
  }
  return false;
}

function $dug(object, prop) {
  return debugAccessor(object, prop, { getter: true });
}

function $dugl(object, prop) {
  return debugAccessor(object, prop, { getter: true, log: true });
}

function $dugr(object, prop) {
  return removeAccessors(object, prop);
}

function $dus(object, prop) {
  return debugAccessor(object, prop, { setter: true });
}

function $dusl(object, prop) {
  return debugAccessor(object, prop, { setter: true, log: true});
}

function $dusr(object, prop) {
  return removeAccessors(object, prop);
}

function $dugs(object, prop) {
  return debugAccessor(object, prop, {
    setter: true,
    getter: true
  });
}

function $dugsl(object, prop) {
  return debugAccessor(object, prop, {
    setter: true,
    getter: true,
    log: true
  });
}

function $dugsr(object, prop) {
  return removeAccessors(object, prop);
}

/**
 * Utils.
 */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function applyOne(object, methods, args, message) {
  for (var i = 0; i < methods.length; i++) {
    var fn = object[methods[i]];
    if (typeof fn === 'function') {
      return fn.apply(object, args);
    }
  }
  if (message) {
    throw new Error(message);
  }
}

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

}).call(this);
