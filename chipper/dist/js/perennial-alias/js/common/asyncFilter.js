// Copyright 2020, University of Colorado Boulder
/**
 * Returns an array filtered asynchronously
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Returns an array filtered asynchronously
 *
 * @param {Array.<*>} list
 * @param {function({*}):*})} f
 * @returns {Promise.<Array.<*>>}
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
const asyncFilter = /*#__PURE__*/ _async_to_generator(function*(list, f) {
    const items = [];
    for (const item of list){
        if (yield f(item)) {
            items.push(item);
        }
    }
    return items;
});
module.exports = asyncFilter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYXN5bmNGaWx0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgZmlsdGVyZWQgYXN5bmNocm9ub3VzbHlcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IGZpbHRlcmVkIGFzeW5jaHJvbm91c2x5XG4gKlxuICogQHBhcmFtIHtBcnJheS48Kj59IGxpc3RcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oeyp9KToqfSl9IGZcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheS48Kj4+fVxuICovXG5jb25zdCBhc3luY0ZpbHRlciA9IGFzeW5jICggbGlzdCwgZiApID0+IHtcbiAgY29uc3QgaXRlbXMgPSBbXTtcbiAgZm9yICggY29uc3QgaXRlbSBvZiBsaXN0ICkge1xuICAgIGlmICggYXdhaXQgZiggaXRlbSApICkge1xuICAgICAgaXRlbXMucHVzaCggaXRlbSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlbXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jRmlsdGVyOyJdLCJuYW1lcyI6WyJhc3luY0ZpbHRlciIsImxpc3QiLCJmIiwiaXRlbXMiLCJpdGVtIiwicHVzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNELE1BQU1BLGdEQUFjLFVBQVFDLE1BQU1DO0lBQ2hDLE1BQU1DLFFBQVEsRUFBRTtJQUNoQixLQUFNLE1BQU1DLFFBQVFILEtBQU87UUFDekIsSUFBSyxNQUFNQyxFQUFHRSxPQUFTO1lBQ3JCRCxNQUFNRSxJQUFJLENBQUVEO1FBQ2Q7SUFDRjtJQUNBLE9BQU9EO0FBQ1Q7QUFFQUcsT0FBT0MsT0FBTyxHQUFHUCJ9