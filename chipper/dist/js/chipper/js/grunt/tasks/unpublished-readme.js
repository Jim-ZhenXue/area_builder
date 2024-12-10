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
 * Generates README.md file for an unpublished simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield generateREADME(repo, false);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3VucHVibGlzaGVkLXJlYWRtZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVSRUFETUUgZnJvbSAnLi4vZ2VuZXJhdGVSRUFETUUuanMnO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBSRUFETUUubWQgZmlsZSBmb3IgYW4gdW5wdWJsaXNoZWQgc2ltdWxhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5jb25zdCByZXBvID0gZ2V0UmVwbygpO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgYXdhaXQgZ2VuZXJhdGVSRUFETUUoIHJlcG8sIGZhbHNlIC8qIHB1Ymxpc2hlZCAqLyApO1xufSApKCk7Il0sIm5hbWVzIjpbImdldFJlcG8iLCJnZW5lcmF0ZVJFQURNRSIsInJlcG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLG9CQUFvQix1QkFBdUI7QUFFbEQ7Ozs7Q0FJQyxHQUNELE1BQU1DLE9BQU9GO0FBRVgsb0JBQUE7SUFDQSxNQUFNQyxlQUFnQkMsTUFBTTtBQUM5QiJ9