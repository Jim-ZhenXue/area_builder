// Copyright 2017-2018, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const fs = require('graceful-fs'); // eslint-disable-line phet/require-statement-match
module.exports = /*#__PURE__*/ _async_to_generator(function*(src, dest) {
    return new Promise((resolve, reject)=>{
        fs.copyFile(src, dest, (err)=>{
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvY29weUZpbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vLyBAYXV0aG9yIE1hdHQgUGVubmluZ3RvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZ3JhY2VmdWwtZnMnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9yZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCBzcmMsIGRlc3QgKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgZnMuY29weUZpbGUoIHNyYywgZGVzdCwgZXJyID0+IHtcbiAgICAgIGlmICggZXJyICkge1xuICAgICAgICByZWplY3QoIGVyciApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJzcmMiLCJkZXN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjb3B5RmlsZSIsImVyciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELHlEQUF5RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXpELE1BQU1BLEtBQUtDLFFBQVMsZ0JBQWlCLG1EQUFtRDtBQUV4RkMsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsR0FBRyxFQUFFQyxJQUFJO0lBQ3hDLE9BQU8sSUFBSUMsUUFBUyxDQUFFQyxTQUFTQztRQUM3QlIsR0FBR1MsUUFBUSxDQUFFTCxLQUFLQyxNQUFNSyxDQUFBQTtZQUN0QixJQUFLQSxLQUFNO2dCQUNURixPQUFRRTtZQUNWLE9BQ0s7Z0JBQ0hIO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==