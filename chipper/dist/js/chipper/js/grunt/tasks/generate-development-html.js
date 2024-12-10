// Copyright 2013-2024, University of Colorado Boulder
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
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import generateDevelopmentHTML from '../generateDevelopmentHTML.js';
/**
 * Generates top-level SIM_en.html file based on the preloads in package.json.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield generateDevelopmentHTML(repo);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLWRldmVsb3BtZW50LWh0bWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBnZXRSZXBvIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldFJlcG8uanMnO1xuaW1wb3J0IGdlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MIGZyb20gJy4uL2dlbmVyYXRlRGV2ZWxvcG1lbnRIVE1MLmpzJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdG9wLWxldmVsIFNJTV9lbi5odG1sIGZpbGUgYmFzZWQgb24gdGhlIHByZWxvYWRzIGluIHBhY2thZ2UuanNvbi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5jb25zdCByZXBvID0gZ2V0UmVwbygpO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgYXdhaXQgZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwoIHJlcG8gKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJnZXRSZXBvIiwiZ2VuZXJhdGVEZXZlbG9wbWVudEhUTUwiLCJyZXBvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV0RCxPQUFPQSxhQUFhLDZEQUE2RDtBQUNqRixPQUFPQyw2QkFBNkIsZ0NBQWdDO0FBRXBFOzs7O0NBSUMsR0FDRCxNQUFNQyxPQUFPRjtBQUVYLG9CQUFBO0lBQ0EsTUFBTUMsd0JBQXlCQztBQUNqQyJ9