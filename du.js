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

function $duv(object, event) {
  return debugEvent(object, event, false);
}

function $duvl(object, event) {
  return debugEvent(object, event, true);
}

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

function genDebuggerStatement(fn) {
  var id = uid();
  Object.defineProperty(fn, '__$duuid', {
    value: id,
    configurable: false,
    enumerable: false,
    writable: false
  });
  return '\n// ' + id + '\ndebugger;\n';
}

function addDebuggerStatment(sourceFile, fnSource, fn) {
  var m = fnSource.match(/^function\s+[^\(]*\([^\)]*\)\s*\{/);
  if (!m) throw new Error('Error parsing function source.');
  var len = m[0].length;
  var modified =
    fnSource.substr(0, len) + genDebuggerStatement(fn) + fnSource.substr(len);
  sourceFile.setContent(
    sourceFile.getContent().replace(fnSource, modified),
    function(status) {
      if (status.code !== 'OK') {
        throw new Error('Error updating source');
      } else {
        console.log('Debugger statement added succesfully');
      }
    }
  );
}

function $duf(ref, url) {
  console.log('working');

  var source = ref.toString();

  if (source.match('\[native\scode]\s\}$')) {
    throw new Error('Can\'t step debug native code, try $dum()');
  }

  chromeAPI.getResources(function(resources) {
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
    addDebuggerStatment(sourceFile, source, ref);
  });
}

/**
 * Export for testing.
 */

if (typeof module === 'object' && typeof exports === 'object') {
  module.exports = {
    $duv: $duv,
    $duvl: $duvl,
    $duvr: $duvr,
    $duf: $duf
  };
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
