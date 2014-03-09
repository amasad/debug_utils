var du = require('../du');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

describe('$duv, $duvl, $duvr', function() {

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


describe('$duf, $dufr', function() {

  beforeEach(function() {
    this.important = function(a, b) {
     // we need to do important stuff
     var added = a + b;
     var subtracted = a - b;
     // we gotta step up our game',
     return added - subtracted * added + subtracted;
    };
    var resource = this.resource = {
      url: 'script.js',
      content: [
        '(function() {',
        '   var foo = 1;',
        '   function log(x){ console.log(x) }',
        '   // log foo for lulz',
        '   log.bind(null, foo);',
        '   var important = ' + this.important.toString(),
        '   return important;',
        '})();'
      ].join('\n'),
      getContent: function() { return this.content; },
      setContent: function(content, cb) {
        this.content = content;
        cb({code: 'OK'})
      }
    }
    var chromeAPI = {};
    chromeAPI.getResources = function(cb) {cb([resource])};
    global.chromeAPI = chromeAPI;
  });

  it('should add a debugger statement to function source', function() {
    du.$duf(this.important);
    assert(this.resource.content.match(/debugger/));
  });

  it('should remove debugger statement', function() {
    du.$duf(this.important);
    var id = this.important.__$duuid;
    this.important = eval(this.resource.content);
    this.important.__$duuid = id;
    du.$dufr(this.important);
    assert(!this.resource.content.match(/debugger/));
  });

  it('should add log statements', function() {
    du.$dufl(this.important);
    assert(this.resource.content.match(/console.log\(arguments\)/));
  });

  it('should handle conflicts between log and debug');
  it('should not deform function');
});

describe('$dum, $duml, $dumr', function() {

  beforeEach(function() {
    this.obj = {
      foo: function(a, b, c) {
        assert(a === 1 && b === 2 && c === 3, 'wrong args');
        return a + b + c;
      }
    }
  });

  it('should wrap a method with a debugger statement', function() {
    du.$dum(this.obj, 'foo');
    assert(this.obj.foo.toString().match(/debugger/));
    assert.equal(this.obj.foo(1, 2, 3), 6);
  });

  it('should wrap a method with a logger statement', function() {
    du.$duml(this.obj, 'foo');
    assert(this.obj.foo.toString().match(/console.log/));
    assert.equal(this.obj.foo(1, 2, 3), 6);
  });

  it('should removed wrapped method', function() {
    du.$dum(this.obj, 'foo');
    du.$dumr(this.obj, 'foo');
    assert(!this.obj.foo.toString().match(/debugger/));
  });

  it('should handle exit wrapping for already wrapped functions');

});
