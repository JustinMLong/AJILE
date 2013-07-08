AJILE.define({
  name: 'assert',
  version: '1.0a10',
  requirements: [], 
  constructor: function(){
    var exports = {};

    var AssertionError = exports.AssertionError = function(options) {
      this.actual = options.actual;
      this.expected = options.expected;
      this.message = options.message;
    };
    AssertionError.prototype = new Error();
    AssertionError.prototype.constructor = exports.AssertionError;
    AssertionError.prototype.name = 'AssertionError';
    AssertionError.prototype.toString = function() { 
      return (this.name + ': (Expected: '+this.expected+', Acual: '+this.actual+((!!this.message)?(', Details: '+this.message):'')+')'); 
    };


    var ok = exports.ok = function(guard, message_opt) {
      return equal(!!guard, true, message_opt);
    };

    var equal = exports.equal = function(actual, expected, message_opt) {
      if (actual != expected) 
        throw new assert.AssertionError({
          actual   : actual, 
          expected : expected,
          message  : message_opt
        });
      else
        return true;
    };

    var strictEqual = exports.strictEqual = function(actual, expected, message_opt) {
      if (actual !== expected) 
        throw new assert.AssertionError({
          actual   : actual, 
          expected : expected,
          message  : message_opt
        });
      else
        return true;
    };

    exports.deepEqual = function(actual, expected, message_opt) {

    };

    exports.notEqual = function(actual, expected, message_opt) {
      if (actual == expected) 
        throw new assert.AssertionError({
          actual   : actual, 
          expected : expected,
          message  : message_opt
        });
      else
        return true;
    };

    exports.strictNotEqual = function(actual, expected, message_opt) {
      if (actual === expected) 
        throw new assert.AssertionError({
          actual   : actual, 
          expected : expected,
          message  : message_opt
        });
      else
        return true;
    };

    exports.notDeepEqual = function(actual, expected, message_opt) {

    };

    exports.throws = function(block, Error_opt, message_opt) {

    };

    return exports;
  }
});