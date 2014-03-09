(function() {

/**
 * Export for testing.
 */

var exports = {
  $duv: $duv,
  $duvl: $duvl,
  $duvr: $duvr,
  $dum: $dum,
  $duml: $duml,
  $dumr: $dumr,
  $dug: $dug,
  $dugl: $dugl,
  $dugr: $dugr,
  $dus: $dus,
  $dusl: $dusl,
  $dusr: $dusr,
  $dugs: $dugs,
  $dugsl: $dugsl,
  $dugsr: $dugsr,
};

if (typeof module === 'object' && typeof exports === 'object') {
  module.exports = exports;
} else if (typeof console === 'object' && console._commandLineAPI) {
  var proto = console._commandLineAPI.__proto__;
  for (var prop in exports) {
    proto[prop] = exports[prop];
  }
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
      console.log(
        'Event %s fired on object %O with arguments',
        event, object, arguments
      );
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
 * Accessor debugging
 * ------------------
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
        console.log('About to get property %s from object %O', prop, object);
        return val;
      };
    }
    if (options.setter) {
      newDesc.set = function(v) {
        console.log('About to set property %s from object %O', prop, object);
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
