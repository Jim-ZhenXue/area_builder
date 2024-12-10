// Copyright 2020, University of Colorado Boulder
/**
 * Clones missing repositories
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
const cloneRepo = require('./cloneRepo');
const getMissingRepos = require('./getMissingRepos');
const winston = require('winston');
/**
 * Clones missing repositories
 * @public
 *
 * @returns {Promise.<string>} - The names of the repos cloned
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*() {
    winston.info('Cloning missing repos');
    const missingRepos = getMissingRepos();
    for (const repo of missingRepos){
        yield cloneRepo(repo);
    }
    return missingRepos;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2xvbmVNaXNzaW5nUmVwb3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENsb25lcyBtaXNzaW5nIHJlcG9zaXRvcmllc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBjbG9uZVJlcG8gPSByZXF1aXJlKCAnLi9jbG9uZVJlcG8nICk7XG5jb25zdCBnZXRNaXNzaW5nUmVwb3MgPSByZXF1aXJlKCAnLi9nZXRNaXNzaW5nUmVwb3MnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQ2xvbmVzIG1pc3NpbmcgcmVwb3NpdG9yaWVzXG4gKiBAcHVibGljXG4gKlxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gVGhlIG5hbWVzIG9mIHRoZSByZXBvcyBjbG9uZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyAoKSA9PiB7XG4gIHdpbnN0b24uaW5mbyggJ0Nsb25pbmcgbWlzc2luZyByZXBvcycgKTtcblxuICBjb25zdCBtaXNzaW5nUmVwb3MgPSBnZXRNaXNzaW5nUmVwb3MoKTtcblxuICBmb3IgKCBjb25zdCByZXBvIG9mIG1pc3NpbmdSZXBvcyApIHtcbiAgICBhd2FpdCBjbG9uZVJlcG8oIHJlcG8gKTtcbiAgfVxuXG4gIHJldHVybiBtaXNzaW5nUmVwb3M7XG59OyJdLCJuYW1lcyI6WyJjbG9uZVJlcG8iLCJyZXF1aXJlIiwiZ2V0TWlzc2luZ1JlcG9zIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbmZvIiwibWlzc2luZ1JlcG9zIiwicmVwbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsWUFBWUMsUUFBUztBQUMzQixNQUFNQyxrQkFBa0JELFFBQVM7QUFDakMsTUFBTUUsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7Q0FLQyxHQUNERyxPQUFPQyxPQUFPLHFDQUFHO0lBQ2ZGLFFBQVFHLElBQUksQ0FBRTtJQUVkLE1BQU1DLGVBQWVMO0lBRXJCLEtBQU0sTUFBTU0sUUFBUUQsYUFBZTtRQUNqQyxNQUFNUCxVQUFXUTtJQUNuQjtJQUVBLE9BQU9EO0FBQ1QifQ==