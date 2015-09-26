(function() {

/**
 * Export API.
 */

var exports = {
  $duv: $duv,
  $duvl: $duvl,
  $duvr: $duvr,
  $duEvent: $duv,
  $duEventLogger: $duvl,
  $duEventRemove: $duvr,

  $dum: $dum,
  $duml: $duml,
  $dumr: $dumr,
  $duWrapMethod: $dum,
  $duWrapMethodLogger: $duml,
  $duWrapMethodRemove: $dumr,

  $dug: $dug,
  $dugl: $dugl,
  $dugr: $dugr,
  $duGetter: $dug,
  $duGetterLogger: $dugl,
  $duGetterRemove: $dugr,

  $dus: $dus,
  $dusl: $dusl,
  $dusr: $dusr,
  $duAccessor: $dus,
  $duAccessorLogger: $dusl,
  $duAccessorRemove: $dusr,

  $dugs: $dugs,
  $dugsl: $dugsl,
  $dugsr: $dugsr,
  $duSetter: $dugs,
  $duSetterLogger: $dugsl,
  $duSetterRemove: $dugsr,

  $dudebug: $dudebug,
  $dulog: $dulog,
  $dulogm: $dulogm
};

if (typeof module === 'object' && typeof exports === 'object') {
  // Node.js mostly for testing.
  module.exports = exports;
} else {
  // Global.
  install(this);
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

var dontKnowHowToListenMsg = 'Don\'t know how to listen to your object, please ' +
  'open an issue if you think we should be able to.';

var listeners = [];

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

  listeners.push({
    event: event,
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
  var item = spliceOutItem(listeners, object);
  if (!item) return false;
  applyOne(
    object,
    removeListenerMethods,
    [event, item.handler],
    dontKnowHowToListenMsg
  );
  return true;
}

/**
 *
 * Method Debugging
 * ----------------
 *
 */

var wrappedMethods = [];

/**
 * Wraps a method with a debugger or logger statement.
 *
 * @param {object} object
 * @param {string} methodName
 * @param {boolean} isLog
 * @private
 */

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
      return method.apply(this, slice.call(arguments));
    };
  } else {
    replacement = function() {
      debugger;
      return method.apply(this, slice.call(arguments));
    };
  }

  object[methodName] = replacement;
}

/**
 * Wraps a method with a debugger statement.
 *
 * @param {object} object
 * @param {string} methodName
 * @public
 */

function $dum(object, method) {
  wrapMethod(object, method);
}

/**
 * Wraps a method with a logger statement.
 *
 * @param {object} object
 * @param {string} methodName
 * @public
 */

function $duml(object, method) {
  wrapMethod(object, method, true);
}

/**
 * Removes method wrapping.
 *
 * @param {object} object
 * @param {string} methodName
 * @public
 */

function $dumr(object, method) {
  var item = spliceOutItem(wrappedMethods, object);
  if (!item) return false;
  object[method] = item.method;
  return true;
}

/**
 *
 * Accessor debugging
 * ------------------
 *
 */

var descriptors = [];

/**
 * Adds debug/log accessors to object properties.
 *
 * @param {object} object
 * @param {string} prop
 * @param {object} options
 * @private
 */

function debugAccessor(object, prop, options) {
  var desc = Object.getOwnPropertyDescriptor(object, prop);

  var val = desc.value;

  descriptors.push({
    object: object,
    desc: desc,
    getVal: function() { return val }
  });

  var newDesc = {
    configurable: true,
    enumerable: desc.enumerable,
    set: function(v) {
      return set.call(this, v);
    },
    get: function() {
      return get.call(this);
    }
  };

  if (options.log) {
    if (options.getter) {
      newDesc.get = function() {
        console.log(
          'About to get property %s from object %O with value %O',
          prop,
          object,
          val
        );
        return get.call(this);
      };
    }
    if (options.setter) {
      newDesc.set = function(v) {
        console.log(
          'About to set property %s from object %O to value %O',
          prop,
          object,
          v
        );
        return set.call(this, v);
      };
    }
  } else {
    if (options.getter) {
      newDesc.get = function() {
        debugger;
        return get.call(this);
      };
    }
    if (options.setter) {
      newDesc.set = function(v) {
        debugger;
        return set.call(this, v);
      };
    }
  }

  Object.defineProperty(object, prop, newDesc);

  function set(v) {
    if (desc.set) {
      return desc.set.call(this, v);
    } else {
      return val = v;
    }
  }

  function get() {
    if (desc.get) {
      return desc.get.call(this);
    } else {
      return val;
    }
  }
}

/**
 * Removes debug/log accessors to object properties.
 *
 * @param {object} object
 * @param {string} prop
 * @private
 */

function removeAccessors(object, prop) {
  var item = spliceOutItem(descriptors, object);
  if (!item) return false;
  if (!(item.desc.get || item.desc.set)) item.desc.value = item.getVal();
  Object.defineProperty(object, prop, item.desc);
  return true;
}

/**
 * Adds debug getter to `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dug(object, prop) {
  return debugAccessor(object, prop, { getter: true });
}

/**
 * Adds log getter to `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dugl(object, prop) {
  return debugAccessor(object, prop, { getter: true, log: true });
}

/**
 * Removes debug/log getter from `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dugr(object, prop) {
  return removeAccessors(object, prop);
}

/**
 * Adds debug setter from `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dus(object, prop) {
  return debugAccessor(object, prop, { setter: true });
}

/**
 * Adds log setter from `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dusl(object, prop) {
  return debugAccessor(object, prop, { setter: true, log: true});
}

/**
 * Removes debug/logger setter from `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dusr(object, prop) {
  return removeAccessors(object, prop);
}

/**
 * Adds debug getter and setter to `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dugs(object, prop) {
  return debugAccessor(object, prop, {
    setter: true,
    getter: true
  });
}

/**
 * Adds log getter and setter to `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dugsl(object, prop) {
  return debugAccessor(object, prop, {
    setter: true,
    getter: true,
    log: true
  });
}

/**
 * Removes debug/log getter and setter from `object` property `prop`.
 *
 * @param {object} object
 * @param {string} prop
 * @public
 */

function $dugsr(object, prop) {
  return removeAccessors(object, prop);
}

/**
 *
 * Callbacks Debugging
 * -------------------
 *
 */

/**
 * Break next time this function is called.
 */

function $dudebug() {
  debugger;
}

/**
 * Log arguments.
 */

function $dulog() {
  console.log(arguments);
}

/**
 * Log arguments prefixed with a custom message.
 *
 * @param {string} msg
 * @return {function}
 */

function $dulogm(msg) {
  return function() {
    console.log(msg, arguments);
  };
}

/**
 * Utils.
 */

/**
 * Throw if `conditiont` is not truthy.
 *
 * @param {*} condition
 * @param {string} message
 * @private
 */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Applies the first method that exists on `object` from `methods`. Otherwise
 * throws with `message`.
 *
 * @param {object} object
 * @param {array<string>} methods
 * @param {array<*>} args
 * @param {string} message
 * @private
 */

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

/**
 * Alphanumeric Unique id of `len` length.
 *
 * @param {number} len
 * @private
 */

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

/**
 * Given a list `items`, find the item with the property 'object' that matches
 * `object, splice it out and return it.
 *
 * @param {array<object>} items
 * @param {object} object
 * @return {object|undefined}
 * @private
 */

function spliceOutItem(items, object) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    if (item.object === object) {
      items.splice(i, 1);
      return item;
    }
  }
}

/**
 * Install debug utils functions on a receiver object.
 *
 * @param {object} receiver
 * @private
 */

function install(receiver, force) {
  var added = [];
  for (var prop in exports) {
    if (force || typeof receiver[prop] === 'undefined') {
      receiver[prop] = exports[prop];
      added.push(prop);
    } else {
      exports.global = install.bind(null, receiver, true);
      break;
    }
  }
  receiver.debugUtils = exports;
}

}).call(Function('return this')());
