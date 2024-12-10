// Copyright 2017, University of Colorado Boulder
/**
 * Runs `grunt transpile --all` in current version of chipper. Will hard fail if on old shas that predate this task
 * creation in 10/2024.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
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
const gruntCommand = require('./gruntCommand');
const winston = require('winston');
/**
 * Outputs transpiled JS for all repos
 * @public
 *
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*() {
    winston.info('running transpileAll');
    yield execute(gruntCommand, [
        'transpile',
        '--silent'
    ], '../chipper');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdHJhbnNwaWxlQWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSdW5zIGBncnVudCB0cmFuc3BpbGUgLS1hbGxgIGluIGN1cnJlbnQgdmVyc2lvbiBvZiBjaGlwcGVyLiBXaWxsIGhhcmQgZmFpbCBpZiBvbiBvbGQgc2hhcyB0aGF0IHByZWRhdGUgdGhpcyB0YXNrXG4gKiBjcmVhdGlvbiBpbiAxMC8yMDI0LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuL2dydW50Q29tbWFuZCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBPdXRwdXRzIHRyYW5zcGlsZWQgSlMgZm9yIGFsbCByZXBvc1xuICogQHB1YmxpY1xuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICB3aW5zdG9uLmluZm8oICdydW5uaW5nIHRyYW5zcGlsZUFsbCcgKTtcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICd0cmFuc3BpbGUnLCAnLS1zaWxlbnQnIF0sICcuLi9jaGlwcGVyJyApO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZ3J1bnRDb21tYW5kIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbmZvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxlQUFlRixRQUFTO0FBQzlCLE1BQU1HLFVBQVVILFFBQVM7QUFFekI7Ozs7O0NBS0MsR0FDREksT0FBT0MsT0FBTyxxQ0FBRztJQUNmRixRQUFRRyxJQUFJLENBQUU7SUFDZCxNQUFNUCxRQUFTRyxjQUFjO1FBQUU7UUFBYTtLQUFZLEVBQUU7QUFDNUQifQ==