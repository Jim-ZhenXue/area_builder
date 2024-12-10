// Copyright 2017, University of Colorado Boulder
/**
 * git pull with an assumption that your cwd is in the top of a repo, like perennial/ or chipper/.
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
const gitPullDirectory = require('./gitPullDirectory');
/**
 * Executes git pull
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ function() {
    var _gitPull = _async_to_generator(function*(repo) {
        yield gitPullDirectory(`../${repo}`);
    });
    function gitPull(repo) {
        return _gitPull.apply(this, arguments);
    }
    return gitPull;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0UHVsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZ2l0IHB1bGwgd2l0aCBhbiBhc3N1bXB0aW9uIHRoYXQgeW91ciBjd2QgaXMgaW4gdGhlIHRvcCBvZiBhIHJlcG8sIGxpa2UgcGVyZW5uaWFsLyBvciBjaGlwcGVyLy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZ2l0UHVsbERpcmVjdG9yeSA9IHJlcXVpcmUoICcuL2dpdFB1bGxEaXJlY3RvcnknICk7XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l0IHB1bGxcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFN0ZG91dFxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiBnaXRQdWxsKCByZXBvICkge1xuICBhd2FpdCBnaXRQdWxsRGlyZWN0b3J5KCBgLi4vJHtyZXBvfWAgKTtcbn07Il0sIm5hbWVzIjpbImdpdFB1bGxEaXJlY3RvcnkiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsImdpdFB1bGwiLCJyZXBvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxtQkFBbUJDLFFBQVM7QUFFbEM7Ozs7Ozs7Q0FPQyxHQUNEQyxPQUFPQyxPQUFPO1FBQWtCQyxXQUFmLG9CQUFBLFVBQXdCQyxJQUFJO1FBQzNDLE1BQU1MLGlCQUFrQixDQUFDLEdBQUcsRUFBRUssTUFBTTtJQUN0QzthQUZnQ0QsUUFBU0MsSUFBSTtlQUFiRDs7V0FBQUEifQ==