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
import fs from 'fs';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import generateDevelopmentStrings from '../generateDevelopmentStrings.js';
// eslint-disable-next-line phet/default-import-match-filename
import _modulify from '../modulify.js';
/**
 * Creates *.js modules for all images/strings/audio/etc in a repo
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ export const modulifyPromise = _async_to_generator(function*() {
    const repo = getRepo();
    yield _modulify(repo);
    if (fs.existsSync(`../${repo}/${repo}-strings_en.json`)) {
        generateDevelopmentStrings(repo);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL21vZHVsaWZ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MgZnJvbSAnLi4vZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MuanMnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcGhldC9kZWZhdWx0LWltcG9ydC1tYXRjaC1maWxlbmFtZVxuaW1wb3J0IF9tb2R1bGlmeSBmcm9tICcuLi9tb2R1bGlmeS5qcyc7XG5cbi8qKlxuICogQ3JlYXRlcyAqLmpzIG1vZHVsZXMgZm9yIGFsbCBpbWFnZXMvc3RyaW5ncy9hdWRpby9ldGMgaW4gYSByZXBvXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGNvbnN0IG1vZHVsaWZ5UHJvbWlzZSA9ICggYXN5bmMgKCkgPT4ge1xuXG4gIGNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5cbiAgYXdhaXQgX21vZHVsaWZ5KCByZXBvICk7XG5cbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAgKSApIHtcbiAgICBnZW5lcmF0ZURldmVsb3BtZW50U3RyaW5ncyggcmVwbyApO1xuICB9XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJnZXRSZXBvIiwiZ2VuZXJhdGVEZXZlbG9wbWVudFN0cmluZ3MiLCJfbW9kdWxpZnkiLCJtb2R1bGlmeVByb21pc2UiLCJyZXBvIiwiZXhpc3RzU3luYyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFdEQsT0FBT0EsUUFBUSxLQUFLO0FBQ3BCLE9BQU9DLGFBQWEsNkRBQTZEO0FBQ2pGLE9BQU9DLGdDQUFnQyxtQ0FBbUM7QUFFMUUsOERBQThEO0FBQzlELE9BQU9DLGVBQWUsaUJBQWlCO0FBRXZDOzs7O0NBSUMsR0FDRCxPQUFPLE1BQU1DLGtCQUFrQixBQUFFLG9CQUFBO0lBRS9CLE1BQU1DLE9BQU9KO0lBRWIsTUFBTUUsVUFBV0U7SUFFakIsSUFBS0wsR0FBR00sVUFBVSxDQUFFLENBQUMsR0FBRyxFQUFFRCxLQUFLLENBQUMsRUFBRUEsS0FBSyxnQkFBZ0IsQ0FBQyxHQUFLO1FBQzNESCwyQkFBNEJHO0lBQzlCO0FBQ0YsS0FBTSJ9