// Copyright 2023, University of Colorado Boulder
/**
 * Gets the contents of a file at a specific git branch/SHA/object
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
/**
 * Gets the contents of a file at a specific git branch/SHA/object
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} gitObject - The branch/SHA/object name
 * @param {string} filename - The filename - relative to the root of the repository
 * @returns {Promise} - Resolves to the file content
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, gitObject, filename) {
    return execute('git', [
        'show',
        `${gitObject}:./${filename}`
    ], `../${repo}`);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0R2l0RmlsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2V0cyB0aGUgY29udGVudHMgb2YgYSBmaWxlIGF0IGEgc3BlY2lmaWMgZ2l0IGJyYW5jaC9TSEEvb2JqZWN0XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5cbi8qKlxuICogR2V0cyB0aGUgY29udGVudHMgb2YgYSBmaWxlIGF0IGEgc3BlY2lmaWMgZ2l0IGJyYW5jaC9TSEEvb2JqZWN0XG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gZ2l0T2JqZWN0IC0gVGhlIGJyYW5jaC9TSEEvb2JqZWN0IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIFRoZSBmaWxlbmFtZSAtIHJlbGF0aXZlIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXNvbHZlcyB0byB0aGUgZmlsZSBjb250ZW50XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBnaXRPYmplY3QsIGZpbGVuYW1lICkge1xuXG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAnc2hvdycsIGAke2dpdE9iamVjdH06Li8ke2ZpbGVuYW1lfWAgXSwgYC4uLyR7cmVwb31gICk7XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImdpdE9iamVjdCIsImZpbGVuYW1lIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFFOUM7Ozs7Ozs7OztDQVNDLEdBQ0RDLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRO0lBRXhELE9BQU9QLFFBQVMsT0FBTztRQUFFO1FBQVEsR0FBR00sVUFBVSxHQUFHLEVBQUVDLFVBQVU7S0FBRSxFQUFFLENBQUMsR0FBRyxFQUFFRixNQUFNO0FBQy9FIn0=