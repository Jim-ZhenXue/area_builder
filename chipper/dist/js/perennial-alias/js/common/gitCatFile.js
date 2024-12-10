// Copyright 2017, University of Colorado Boulder
/**
 * retrieve the contents of a file without changing the git tree via checkouts.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
const assert = require('assert');
const execute = require('./execute').default;
/**
 * Gets the contents of the file at a given state in the git tree
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} file - Path to the file from the repo root, like js/myFile.js
 * @param {string} branchOrSha - what revision to get the contents of the file at. "buoyancy-1.0" or "main" or
 *                               "{{SHA}}". Defaults to the current checkout (HEAD)
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ function() {
    var _gitCatFile = _async_to_generator(function*(repo, file, branchOrSha = 'HEAD') {
        assert(typeof repo === 'string');
        assert(typeof file === 'string');
        assert(typeof branchOrSha === 'string');
        return execute('git', [
            'cat-file',
            'blob',
            `${branchOrSha}:${file}`
        ], `../${repo}`);
    });
    function gitCatFile(repo, file) {
        return _gitCatFile.apply(this, arguments);
    }
    return gitCatFile;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0Q2F0RmlsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogcmV0cmlldmUgdGhlIGNvbnRlbnRzIG9mIGEgZmlsZSB3aXRob3V0IGNoYW5naW5nIHRoZSBnaXQgdHJlZSB2aWEgY2hlY2tvdXRzLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcblxuLyoqXG4gKiBHZXRzIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSBhdCBhIGdpdmVuIHN0YXRlIGluIHRoZSBnaXQgdHJlZVxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGUgLSBQYXRoIHRvIHRoZSBmaWxlIGZyb20gdGhlIHJlcG8gcm9vdCwgbGlrZSBqcy9teUZpbGUuanNcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2hPclNoYSAtIHdoYXQgcmV2aXNpb24gdG8gZ2V0IHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSBhdC4gXCJidW95YW5jeS0xLjBcIiBvciBcIm1haW5cIiBvclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ7e1NIQX19XCIuIERlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGNoZWNrb3V0IChIRUFEKVxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gU3Rkb3V0XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIGdpdENhdEZpbGUoIHJlcG8sIGZpbGUsIGJyYW5jaE9yU2hhID0gJ0hFQUQnICkge1xuICBhc3NlcnQoIHR5cGVvZiByZXBvID09PSAnc3RyaW5nJyApO1xuICBhc3NlcnQoIHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJyApO1xuICBhc3NlcnQoIHR5cGVvZiBicmFuY2hPclNoYSA9PT0gJ3N0cmluZycgKTtcblxuICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ2NhdC1maWxlJywgJ2Jsb2InLCBgJHticmFuY2hPclNoYX06JHtmaWxlfWAgXSwgYC4uLyR7cmVwb31gICk7XG59OyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiZXhlY3V0ZSIsImRlZmF1bHQiLCJtb2R1bGUiLCJleHBvcnRzIiwiZ2l0Q2F0RmlsZSIsInJlcG8iLCJmaWxlIiwiYnJhbmNoT3JTaGEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Q0FLQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxTQUFTQyxRQUFTO0FBQ3hCLE1BQU1DLFVBQVVELFFBQVMsYUFBY0UsT0FBTztBQUU5Qzs7Ozs7Ozs7OztDQVVDLEdBQ0RDLE9BQU9DLE9BQU87UUFBa0JDLGNBQWYsb0JBQUEsVUFBMkJDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxjQUFjLE1BQU07UUFDMUVULE9BQVEsT0FBT08sU0FBUztRQUN4QlAsT0FBUSxPQUFPUSxTQUFTO1FBQ3hCUixPQUFRLE9BQU9TLGdCQUFnQjtRQUUvQixPQUFPUCxRQUFTLE9BQU87WUFBRTtZQUFZO1lBQVEsR0FBR08sWUFBWSxDQUFDLEVBQUVELE1BQU07U0FBRSxFQUFFLENBQUMsR0FBRyxFQUFFRCxNQUFNO0lBQ3ZGO2FBTmdDRCxXQUFZQyxJQUFJLEVBQUVDLElBQUk7ZUFBdEJGOztXQUFBQSJ9