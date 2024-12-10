// Copyright 2020, University of Colorado Boulder
/**
 * Executes async functions on each element in an array.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Executes async functions on each element in an array.
 *
 * @param {Array.<*>} list
 * @param {function({*})})} f
 * @returns {Promise}
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
const asyncForEach = /*#__PURE__*/ _async_to_generator(function*(list, f) {
    let index = 0;
    for (const item of list){
        yield f(item, index++);
    }
});
module.exports = asyncForEach;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYXN5bmNGb3JFYWNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFeGVjdXRlcyBhc3luYyBmdW5jdGlvbnMgb24gZWFjaCBlbGVtZW50IGluIGFuIGFycmF5LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG4vKipcbiAqIEV4ZWN1dGVzIGFzeW5jIGZ1bmN0aW9ucyBvbiBlYWNoIGVsZW1lbnQgaW4gYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtBcnJheS48Kj59IGxpc3RcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oeyp9KX0pfSBmXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuY29uc3QgYXN5bmNGb3JFYWNoID0gYXN5bmMgKCBsaXN0LCBmICkgPT4ge1xuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKCBjb25zdCBpdGVtIG9mIGxpc3QgKSB7XG4gICAgYXdhaXQgZiggaXRlbSwgaW5kZXgrKyApO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jRm9yRWFjaDsiXSwibmFtZXMiOlsiYXN5bmNGb3JFYWNoIiwibGlzdCIsImYiLCJpbmRleCIsIml0ZW0iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVEOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxNQUFNQSxpREFBZSxVQUFRQyxNQUFNQztJQUNqQyxJQUFJQyxRQUFRO0lBQ1osS0FBTSxNQUFNQyxRQUFRSCxLQUFPO1FBQ3pCLE1BQU1DLEVBQUdFLE1BQU1EO0lBQ2pCO0FBQ0Y7QUFFQUUsT0FBT0MsT0FBTyxHQUFHTiJ9