// Copyright 2023, University of Colorado Boulder
/**
 * Gets the dependencies.json from a given branch of a repo
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
const getFileAtBranch = require('./getFileAtBranch');
/**
 * Gets the dependencies.json from a given branch of a repo
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch name
 * @returns {Promise} - Resolves to the dependencies.json content
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, branch) {
    return JSON.parse((yield getFileAtBranch(repo, branch, 'dependencies.json')));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnJhbmNoRGVwZW5kZW5jaWVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZXRzIHRoZSBkZXBlbmRlbmNpZXMuanNvbiBmcm9tIGEgZ2l2ZW4gYnJhbmNoIG9mIGEgcmVwb1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnZXRGaWxlQXRCcmFuY2ggPSByZXF1aXJlKCAnLi9nZXRGaWxlQXRCcmFuY2gnICk7XG5cbi8qKlxuICogR2V0cyB0aGUgZGVwZW5kZW5jaWVzLmpzb24gZnJvbSBhIGdpdmVuIGJyYW5jaCBvZiBhIHJlcG9cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJlc29sdmVzIHRvIHRoZSBkZXBlbmRlbmNpZXMuanNvbiBjb250ZW50XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBicmFuY2ggKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKCBhd2FpdCBnZXRGaWxlQXRCcmFuY2goIHJlcG8sIGJyYW5jaCwgJ2RlcGVuZGVuY2llcy5qc29uJyApICk7XG59OyJdLCJuYW1lcyI6WyJnZXRGaWxlQXRCcmFuY2giLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJicmFuY2giLCJKU09OIiwicGFyc2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGtCQUFrQkMsUUFBUztBQUVqQzs7Ozs7Ozs7Q0FRQyxHQUNEQyxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLE1BQU07SUFDM0MsT0FBT0MsS0FBS0MsS0FBSyxDQUFFLENBQUEsTUFBTVAsZ0JBQWlCSSxNQUFNQyxRQUFRLG9CQUFvQjtBQUM5RSJ9