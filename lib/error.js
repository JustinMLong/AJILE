AJILE.define({
  name: 'error',
  requirements: [],
  version: '1.0a10',
  constructor: function() {
    var exports = {};
	
    var errorObj = exports.errorObj = function (fnName, bDesc, lDesc) {
      return {
        name: fnName,
        description: bDesc,
        errorData: {
          completeName: lDesc[0],
          stackTrace: getStack(),
          serverity: lDesc[1]
        }
      };
    };

    var getStack = function () {
        var cCaller = arguments.callee.caller, stack = [];
        while (cCaller != null && typeof cCaller != 'undefined') {
            var m = /function( )*?\b(.*\))/.exec(cCaller.toString())

            stack.push( (m[m.length-1].replace(' ','') != '')?m[m.length-1].replace(' ',''):'Anonymous' );
            cCaller = cCaller.caller;
        }
        return stack;
    };
  }
});