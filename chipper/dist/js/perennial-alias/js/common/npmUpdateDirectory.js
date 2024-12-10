// Copyright 2023, University of Colorado Boulder
/**
 * npm update
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const execute = require('./execute').default;
const npmCommand = require('./npmCommand');
const winston = require('winston');
const asyncMutex = require('async-mutex');
const mutex = new asyncMutex.Mutex();
/**
 * Executes an effective "npm update" (with pruning because it's required).
 * @public
 *
 * @param {string} directory
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(directory) {
    winston.info(`npm update in ${directory}`);
    // NOTE: Run these synchronously across all instances!
    yield mutex.runExclusive(/*#__PURE__*/ _async_to_generator(function*() {
        yield execute(npmCommand, [
            'prune'
        ], directory);
        yield execute(npmCommand, [
            'update'
        ], directory);
    }));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vbnBtVXBkYXRlRGlyZWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBucG0gdXBkYXRlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBucG1Db21tYW5kID0gcmVxdWlyZSggJy4vbnBtQ29tbWFuZCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IGFzeW5jTXV0ZXggPSByZXF1aXJlKCAnYXN5bmMtbXV0ZXgnICk7XG5cbmNvbnN0IG11dGV4ID0gbmV3IGFzeW5jTXV0ZXguTXV0ZXgoKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBlZmZlY3RpdmUgXCJucG0gdXBkYXRlXCIgKHdpdGggcHJ1bmluZyBiZWNhdXNlIGl0J3MgcmVxdWlyZWQpLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3RvcnlcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCBkaXJlY3RvcnkgKSB7XG4gIHdpbnN0b24uaW5mbyggYG5wbSB1cGRhdGUgaW4gJHtkaXJlY3Rvcnl9YCApO1xuXG4gIC8vIE5PVEU6IFJ1biB0aGVzZSBzeW5jaHJvbm91c2x5IGFjcm9zcyBhbGwgaW5zdGFuY2VzIVxuICBhd2FpdCBtdXRleC5ydW5FeGNsdXNpdmUoIGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBleGVjdXRlKCBucG1Db21tYW5kLCBbICdwcnVuZScgXSwgZGlyZWN0b3J5ICk7XG4gICAgYXdhaXQgZXhlY3V0ZSggbnBtQ29tbWFuZCwgWyAndXBkYXRlJyBdLCBkaXJlY3RvcnkgKTtcbiAgfSApO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwibnBtQ29tbWFuZCIsIndpbnN0b24iLCJhc3luY011dGV4IiwibXV0ZXgiLCJNdXRleCIsIm1vZHVsZSIsImV4cG9ydHMiLCJkaXJlY3RvcnkiLCJpbmZvIiwicnVuRXhjbHVzaXZlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsYUFBYUYsUUFBUztBQUM1QixNQUFNRyxVQUFVSCxRQUFTO0FBQ3pCLE1BQU1JLGFBQWFKLFFBQVM7QUFFNUIsTUFBTUssUUFBUSxJQUFJRCxXQUFXRSxLQUFLO0FBRWxDOzs7Ozs7Q0FNQyxHQUNEQyxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxTQUFTO0lBQ3hDTixRQUFRTyxJQUFJLENBQUUsQ0FBQyxjQUFjLEVBQUVELFdBQVc7SUFFMUMsc0RBQXNEO0lBQ3RELE1BQU1KLE1BQU1NLFlBQVksbUNBQUU7UUFDeEIsTUFBTVosUUFBU0csWUFBWTtZQUFFO1NBQVMsRUFBRU87UUFDeEMsTUFBTVYsUUFBU0csWUFBWTtZQUFFO1NBQVUsRUFBRU87SUFDM0M7QUFDRiJ9