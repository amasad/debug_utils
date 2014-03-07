var du = require('../du');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

describe('$duv, $duvl', function() {

  it('should attach a debug event listener', function() {
    var o = new EventEmitter();
    du.$duv(o, 'foo');
    assert(o.listeners('foo').length == 1, 'should attach listener');
    assert(
      o.listeners('foo')[0].toString().match(/debugger/),
      'should attach a debugger handler'
    );
  });

  it('should attach a log event listener', function() {
    var o = new EventEmitter();
    du.$duvl(o, 'foo');
    assert(
      o.listeners('foo')[0].toString().match(/console\.log/),
      'should attach a log handler'
    );
  });

  it('disable event listener', function() {
    var o = new EventEmitter();
    du.$duv(o, 'foo');
    assert(o.listeners('foo').length == 1, 'should attach listener');
    du.$duvr(o, 'foo');
    assert(o.listeners('foo').length == 0, 'should remove listener');
  });

});


describe('$duf', function() {

  function important(a, b) {
   // we need to do important stuff
   var added = a + b;
   var subtracted = a - b;
   // we gotta step up our game',
   return added - subtracted * added + subtracted;
  }

  var resource = {
    url: 'script.js',
    content: [
      '(function() {',
      '   var foo = 1;',
      '   function log(x){ console.log(x) }',
      '   // log foo for lulz',
      '   log(foo);',
      important.toString(),
      '})();'
    ].join('\n'),
    getContent: function() { return this.content; },
    setContent: function(content, cb) {
      this.content = content;
      cb({code: 'OK'})
    }
  };

  var chromeAPI = {};
  chromeAPI.getResources = function(cb) {cb([resource])};
  global.chromeAPI = chromeAPI;

  it('should add a debugger statement to function source', function() {
    du.$duf(important);
    assert(resource.content.match(/debugger/));
  });

});
