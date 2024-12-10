// Copyright 2017, University of Colorado Boulder
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
const npmUpdateDirectory = require('./npmUpdateDirectory');
/**
 * Executes an effective "npm update" (with pruning because it's required).
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    yield npmUpdateDirectory(`../${repo}`);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vbnBtVXBkYXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBucG0gdXBkYXRlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IG5wbVVwZGF0ZURpcmVjdG9yeSA9IHJlcXVpcmUoICcuL25wbVVwZGF0ZURpcmVjdG9yeScgKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBhbiBlZmZlY3RpdmUgXCJucG0gdXBkYXRlXCIgKHdpdGggcHJ1bmluZyBiZWNhdXNlIGl0J3MgcmVxdWlyZWQpLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8gKSB7XG4gIGF3YWl0IG5wbVVwZGF0ZURpcmVjdG9yeSggYC4uLyR7cmVwb31gICk7XG59OyJdLCJuYW1lcyI6WyJucG1VcGRhdGVEaXJlY3RvcnkiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLHFCQUFxQkMsUUFBUztBQUVwQzs7Ozs7O0NBTUMsR0FDREMsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSTtJQUNuQyxNQUFNSixtQkFBb0IsQ0FBQyxHQUFHLEVBQUVJLE1BQU07QUFDeEMifQ==