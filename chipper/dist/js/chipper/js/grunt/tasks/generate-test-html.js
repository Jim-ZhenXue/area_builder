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
import generateTestHTML from '../generateTestHTML.js';
/**
 * Generates top-level SIM-tests.html file based on the preloads in package.json.  See https://github.com/phetsims/aqua/blob/main/doc/adding-unit-tests.md
 * for more information on automated testing. Usually you should
 * set the "generatedUnitTests":true flag in the sim package.json and run `grunt update` instead of manually generating this.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const repo = getRepo();
_async_to_generator(function*() {
    yield generateTestHTML(repo);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2dlbmVyYXRlLXRlc3QtaHRtbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVUZXN0SFRNTCBmcm9tICcuLi9nZW5lcmF0ZVRlc3RIVE1MLmpzJztcblxuLyoqXG4gKiBHZW5lcmF0ZXMgdG9wLWxldmVsIFNJTS10ZXN0cy5odG1sIGZpbGUgYmFzZWQgb24gdGhlIHByZWxvYWRzIGluIHBhY2thZ2UuanNvbi4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9ibG9iL21haW4vZG9jL2FkZGluZy11bml0LXRlc3RzLm1kXG4gKiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBhdXRvbWF0ZWQgdGVzdGluZy4gVXN1YWxseSB5b3Ugc2hvdWxkXG4gKiBzZXQgdGhlIFwiZ2VuZXJhdGVkVW5pdFRlc3RzXCI6dHJ1ZSBmbGFnIGluIHRoZSBzaW0gcGFja2FnZS5qc29uIGFuZCBydW4gYGdydW50IHVwZGF0ZWAgaW5zdGVhZCBvZiBtYW51YWxseSBnZW5lcmF0aW5nIHRoaXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuY29uc3QgcmVwbyA9IGdldFJlcG8oKTtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IGdlbmVyYXRlVGVzdEhUTUwoIHJlcG8gKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJnZXRSZXBvIiwiZ2VuZXJhdGVUZXN0SFRNTCIsInJlcG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLHNCQUFzQix5QkFBeUI7QUFFdEQ7Ozs7OztDQU1DLEdBQ0QsTUFBTUMsT0FBT0Y7QUFFWCxvQkFBQTtJQUNBLE1BQU1DLGlCQUFrQkM7QUFDMUIifQ==