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
import generateA11yViewHTML from '../generateA11yViewHTML.js';
/**
 * Generates top-level SIM-a11y-view.html file used for visualizing accessible content. Usually you should
 * set the "phet.simFeatures.supportsInteractiveDescription":true flag in the sim package.json and run `grunt update`
 * instead of manually generating this.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield generateA11yViewHTML(repo);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLWExMXktdmlldy1odG1sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBnZW5lcmF0ZUExMXlWaWV3SFRNTCBmcm9tICcuLi9nZW5lcmF0ZUExMXlWaWV3SFRNTC5qcyc7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRvcC1sZXZlbCBTSU0tYTExeS12aWV3Lmh0bWwgZmlsZSB1c2VkIGZvciB2aXN1YWxpemluZyBhY2Nlc3NpYmxlIGNvbnRlbnQuIFVzdWFsbHkgeW91IHNob3VsZFxuICogc2V0IHRoZSBcInBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNJbnRlcmFjdGl2ZURlc2NyaXB0aW9uXCI6dHJ1ZSBmbGFnIGluIHRoZSBzaW0gcGFja2FnZS5qc29uIGFuZCBydW4gYGdydW50IHVwZGF0ZWBcbiAqIGluc3RlYWQgb2YgbWFudWFsbHkgZ2VuZXJhdGluZyB0aGlzLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBhd2FpdCBnZW5lcmF0ZUExMXlWaWV3SFRNTCggcmVwbyApO1xufSApKCk7Il0sIm5hbWVzIjpbImdldFJlcG8iLCJnZW5lcmF0ZUExMXlWaWV3SFRNTCIsInJlcG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLDBCQUEwQiw2QkFBNkI7QUFFOUQ7Ozs7OztDQU1DLEdBQ0QsTUFBTUMsT0FBT0Y7QUFFWCxvQkFBQTtJQUNBLE1BQU1DLHFCQUFzQkM7QUFDOUIifQ==