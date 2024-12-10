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
import generateREADME from '../generateREADME.js';
/**
 * Generates README.md file for a published simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield generateREADME(repo, true);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3B1Ymxpc2hlZC1yZWFkbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBnZXRSZXBvIGZyb20gJy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldFJlcG8uanMnO1xuaW1wb3J0IGdlbmVyYXRlUkVBRE1FIGZyb20gJy4uL2dlbmVyYXRlUkVBRE1FLmpzJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgUkVBRE1FLm1kIGZpbGUgZm9yIGEgcHVibGlzaGVkIHNpbXVsYXRpb24uXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IGdlbmVyYXRlUkVBRE1FKCByZXBvLCB0cnVlIC8qIHB1Ymxpc2hlZCAqLyApO1xufSApKCk7Il0sIm5hbWVzIjpbImdldFJlcG8iLCJnZW5lcmF0ZVJFQURNRSIsInJlcG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLG9CQUFvQix1QkFBdUI7QUFFbEQ7Ozs7Q0FJQyxHQUNELE1BQU1DLE9BQU9GO0FBRVgsb0JBQUE7SUFDQSxNQUFNQyxlQUFnQkMsTUFBTTtBQUM5QiJ9