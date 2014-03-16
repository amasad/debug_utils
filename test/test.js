var du = require('../du');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

describe('global', function() {

  it('should install all the functions on the global NS', function() {
    du.global();
    assert(global.$duv && global.$dum && global.$dus);
  });

});

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

describe('$dug, $dugl, $dugr, $dus, $dusl, $dusr', function() {

  beforeEach(function() {
    this.obj = {
      foo: 1
    };
  });

  afterEach(function() {
    restoreLog();
  });

  it('add a logger proxy to the getter', function(done) {
    du.$dugl(this.obj, 'foo');
    var _log = console.log;
    replaceLog(function(a, b) {
      assert.equal(b, 'foo');
      done();
    });
    assert.equal(this.obj.foo, 1);
  });

  it('add a logger proxy to the setter', function(done) {
    du.$dusl(this.obj, 'foo');
    var obj = this.obj;
    replaceLog(function() {
      setTimeout(function() {
        assert.equal(obj.foo, 2);
        done();
      });
    });
    this.obj.foo = 2;
  });

  it('remove setter', function(done) {
    du.$dusl(this.obj, 'foo');
    var obj = this.obj;
    var i = 0;
    replaceLog(function() {
      if (++i > 1) done(new Error());
    });
    this.obj.foo = 5;
    du.$dusr(this.obj, 'foo');
    setTimeout(function() {
      assert.equal(obj.foo, 5);
      assert.equal(i, 1);
      done();
    });
  });

  it('should work on property with getter', function(done) {
    var o = {};
    Object.defineProperty(o, 'foo', {
      configurable: true,
      get: function() {
        return 'foo boo';
      }
    });
    du.$dugl(o, 'foo');
    replaceLog(function() {
      done();
    });
    assert.equal(o.foo, 'foo boo');
  });

  it('should work on property with setter', function(done) {
    var called = false;
    var o = {};
    Object.defineProperty(o, 'foo', {
      configurable: true,
      get: function() {return 2;},
      set: function(v) {
        assert.equal(v, 1);
        assert(called, 'log must be called');
        done();
      }
    });
    du.$dusl(o, 'foo');
    replaceLog(function() {
      called = true;
    });
    o.foo = 1;
  });

});

var _log = console.log;
function replaceLog(fn) {
  console.log = fn;
}
function restoreLog() {
  console.log = _log;
}
