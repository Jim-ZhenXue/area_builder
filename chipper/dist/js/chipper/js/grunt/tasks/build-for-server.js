function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
// Copyright 2024, University of Colorado Boulder
/**
 * Alias for build, meant for use by build-server only.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    yield (yield import('./build.js')).buildPromise;
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2J1aWxkLWZvci1zZXJ2ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFsaWFzIGZvciBidWlsZCwgbWVhbnQgZm9yIHVzZSBieSBidWlsZC1zZXJ2ZXIgb25seS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbiggYXN5bmMgKCkgPT4ge1xuICBhd2FpdCAoIGF3YWl0IGltcG9ydCggJy4vYnVpbGQuanMnICkgKS5idWlsZFByb21pc2U7XG59ICkoKTsiXSwibmFtZXMiOlsiYnVpbGRQcm9taXNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUMsb0JBQUE7SUFDQSxNQUFNLEFBQUUsQ0FBQSxNQUFNLE1BQU0sQ0FBRSxhQUFhLEVBQUlBLFlBQVk7QUFDckQifQ==