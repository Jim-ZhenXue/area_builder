// Copyright 2017, University of Colorado Boulder
/**
 * Checks out a SHA/branch for a repository, and also checks out all of its dependencies.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const checkoutDependencies = require('./checkoutDependencies');
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitPull = require('./gitPull');
const winston = require('winston');
/**
 * Checks out a SHA/branch for a repository, and also checks out all of its dependencies.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} target - branch or SHA
 * @param {boolean} includeNpmUpdate
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, target, includeNpmUpdate) {
    winston.info(`checking out shas for ${repo} ${target}`);
    yield gitCheckout(repo, target);
    yield gitPull(repo); // Does this work for a SHA?
    const dependencies = yield getDependencies(repo);
    return checkoutDependencies(repo, dependencies, includeNpmUpdate);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2hlY2tvdXRUYXJnZXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrcyBvdXQgYSBTSEEvYnJhbmNoIGZvciBhIHJlcG9zaXRvcnksIGFuZCBhbHNvIGNoZWNrcyBvdXQgYWxsIG9mIGl0cyBkZXBlbmRlbmNpZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGNoZWNrb3V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vY2hlY2tvdXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnZXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9nZXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xuY29uc3QgZ2l0UHVsbCA9IHJlcXVpcmUoICcuL2dpdFB1bGwnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQ2hlY2tzIG91dCBhIFNIQS9icmFuY2ggZm9yIGEgcmVwb3NpdG9yeSwgYW5kIGFsc28gY2hlY2tzIG91dCBhbGwgb2YgaXRzIGRlcGVuZGVuY2llcy5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgLSBicmFuY2ggb3IgU0hBXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluY2x1ZGVOcG1VcGRhdGVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheS48c3RyaW5nPj59IC0gUmVzb2x2ZXMgd2l0aCBjaGVja2VkT3V0UmVwb3NcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgdGFyZ2V0LCBpbmNsdWRlTnBtVXBkYXRlICkge1xuICB3aW5zdG9uLmluZm8oIGBjaGVja2luZyBvdXQgc2hhcyBmb3IgJHtyZXBvfSAke3RhcmdldH1gICk7XG5cbiAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sIHRhcmdldCApO1xuICBhd2FpdCBnaXRQdWxsKCByZXBvICk7IC8vIERvZXMgdGhpcyB3b3JrIGZvciBhIFNIQT9cbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XG4gIHJldHVybiBjaGVja291dERlcGVuZGVuY2llcyggcmVwbywgZGVwZW5kZW5jaWVzLCBpbmNsdWRlTnBtVXBkYXRlICk7XG59OyJdLCJuYW1lcyI6WyJjaGVja291dERlcGVuZGVuY2llcyIsInJlcXVpcmUiLCJnZXREZXBlbmRlbmNpZXMiLCJnaXRDaGVja291dCIsImdpdFB1bGwiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ0YXJnZXQiLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5mbyIsImRlcGVuZGVuY2llcyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsdUJBQXVCQyxRQUFTO0FBQ3RDLE1BQU1DLGtCQUFrQkQsUUFBUztBQUNqQyxNQUFNRSxjQUFjRixRQUFTO0FBQzdCLE1BQU1HLFVBQVVILFFBQVM7QUFDekIsTUFBTUksVUFBVUosUUFBUztBQUV6Qjs7Ozs7Ozs7Q0FRQyxHQUNESyxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsZ0JBQWdCO0lBQzdETCxRQUFRTSxJQUFJLENBQUUsQ0FBQyxzQkFBc0IsRUFBRUgsS0FBSyxDQUFDLEVBQUVDLFFBQVE7SUFFdkQsTUFBTU4sWUFBYUssTUFBTUM7SUFDekIsTUFBTUwsUUFBU0ksT0FBUSw0QkFBNEI7SUFDbkQsTUFBTUksZUFBZSxNQUFNVixnQkFBaUJNO0lBQzVDLE9BQU9SLHFCQUFzQlEsTUFBTUksY0FBY0Y7QUFDbkQifQ==