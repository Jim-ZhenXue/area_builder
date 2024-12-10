// Copyright 2020, University of Colorado Boulder
/**
 * Sleeps for a certain number of milliseconds
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Sleeps for a certain number of milliseconds
 * @public
 *
 * @param {number} milliseconds
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
module.exports = /*#__PURE__*/ _async_to_generator(function*(milliseconds) {
    return new Promise((resolve, reject)=>{
        setTimeout(resolve, milliseconds);
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc2xlZXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNsZWVwcyBmb3IgYSBjZXJ0YWluIG51bWJlciBvZiBtaWxsaXNlY29uZHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuLyoqXG4gKiBTbGVlcHMgZm9yIGEgY2VydGFpbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG1pbGxpc2Vjb25kc1xuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIG1pbGxpc2Vjb25kcyApIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICBzZXRUaW1lb3V0KCByZXNvbHZlLCBtaWxsaXNlY29uZHMgKTtcbiAgfSApO1xufTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1pbGxpc2Vjb25kcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRDs7Ozs7O0NBTUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0RBLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLFlBQVk7SUFDM0MsT0FBTyxJQUFJQyxRQUFTLENBQUVDLFNBQVNDO1FBQzdCQyxXQUFZRixTQUFTRjtJQUN2QjtBQUNGIn0=