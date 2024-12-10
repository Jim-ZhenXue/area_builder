// Copyright 2017, University of Colorado Boulder
/**
 * git checkout
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
const gitCheckoutDirectory = require('./gitCheckoutDirectory');
const assert = require('assert');
/**
 * Executes git checkout
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} target - The SHA/branch/whatnot to check out
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ function() {
    var _gitCheckout = _async_to_generator(function*(repo, target) {
        assert(typeof repo === 'string');
        assert(typeof target === 'string');
        yield gitCheckoutDirectory(target, `../${repo}`);
    });
    function gitCheckout(repo, target) {
        return _gitCheckout.apply(this, arguments);
    }
    return gitCheckout;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0Q2hlY2tvdXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGdpdCBjaGVja291dFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnaXRDaGVja291dERpcmVjdG9yeSA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0RGlyZWN0b3J5JyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXQgY2hlY2tvdXRcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgLSBUaGUgU0hBL2JyYW5jaC93aGF0bm90IHRvIGNoZWNrIG91dFxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gU3Rkb3V0XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIGdpdENoZWNrb3V0KCByZXBvLCB0YXJnZXQgKSB7XG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XG4gIGFzc2VydCggdHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycgKTtcblxuICBhd2FpdCBnaXRDaGVja291dERpcmVjdG9yeSggdGFyZ2V0LCBgLi4vJHtyZXBvfWAgKTtcbn07Il0sIm5hbWVzIjpbImdpdENoZWNrb3V0RGlyZWN0b3J5IiwicmVxdWlyZSIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJnaXRDaGVja291dCIsInJlcG8iLCJ0YXJnZXQiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLHVCQUF1QkMsUUFBUztBQUN0QyxNQUFNQyxTQUFTRCxRQUFTO0FBRXhCOzs7Ozs7OztDQVFDLEdBQ0RFLE9BQU9DLE9BQU87UUFBa0JDLGVBQWYsb0JBQUEsVUFBNEJDLElBQUksRUFBRUMsTUFBTTtRQUN2REwsT0FBUSxPQUFPSSxTQUFTO1FBQ3hCSixPQUFRLE9BQU9LLFdBQVc7UUFFMUIsTUFBTVAscUJBQXNCTyxRQUFRLENBQUMsR0FBRyxFQUFFRCxNQUFNO0lBQ2xEO2FBTGdDRCxZQUFhQyxJQUFJLEVBQUVDLE1BQU07ZUFBekJGOztXQUFBQSJ9