// Copyright 2020, University of Colorado Boulder
/**
 * Returns an array mapped asynchronously
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Returns an array mapped asynchronously
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
const asyncMap = /*#__PURE__*/ _async_to_generator(function*(list, f) {
    const items = [];
    let index = 0;
    for (const item of list){
        items.push((yield f(item, index++)));
    }
    return items;
});
module.exports = asyncMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYXN5bmNNYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgbWFwcGVkIGFzeW5jaHJvbm91c2x5XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBtYXBwZWQgYXN5bmNocm9ub3VzbHlcbiAqXG4gKiBAcGFyYW0ge0FycmF5LjwqPn0gbGlzdFxuICogQHBhcmFtIHtmdW5jdGlvbih7Kn0pOip9KX0gZlxuICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjwqPj59XG4gKi9cbmNvbnN0IGFzeW5jTWFwID0gYXN5bmMgKCBsaXN0LCBmICkgPT4ge1xuICBjb25zdCBpdGVtcyA9IFtdO1xuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKCBjb25zdCBpdGVtIG9mIGxpc3QgKSB7XG4gICAgaXRlbXMucHVzaCggYXdhaXQgZiggaXRlbSwgaW5kZXgrKyApICk7XG4gIH1cbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc3luY01hcDsiXSwibmFtZXMiOlsiYXN5bmNNYXAiLCJsaXN0IiwiZiIsIml0ZW1zIiwiaW5kZXgiLCJpdGVtIiwicHVzaCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNELE1BQU1BLDZDQUFXLFVBQVFDLE1BQU1DO0lBQzdCLE1BQU1DLFFBQVEsRUFBRTtJQUNoQixJQUFJQyxRQUFRO0lBQ1osS0FBTSxNQUFNQyxRQUFRSixLQUFPO1FBQ3pCRSxNQUFNRyxJQUFJLENBQUUsQ0FBQSxNQUFNSixFQUFHRyxNQUFNRCxRQUFRO0lBQ3JDO0lBQ0EsT0FBT0Q7QUFDVDtBQUVBSSxPQUFPQyxPQUFPLEdBQUdSIn0=