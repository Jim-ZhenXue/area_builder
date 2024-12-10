// Copyright 2017, University of Colorado Boulder
/**
 * Lints a runnable repository and its dependencies.
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
const execute = require('./execute').default;
const gruntCommand = require('./gruntCommand');
const winston = require('winston');
/**
 * Builds a repository.
 * @public
 *
 * @param {string} repo
 * @returns {Promise.<string>} - The stdout of the process
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.info(`linting ${repo}`);
    return execute(gruntCommand, [
        'lint-all'
    ], `../${repo}`);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vbGludEFsbFJ1bm5hYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBMaW50cyBhIHJ1bm5hYmxlIHJlcG9zaXRvcnkgYW5kIGl0cyBkZXBlbmRlbmNpZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi9ncnVudENvbW1hbmQnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQnVpbGRzIGEgcmVwb3NpdG9yeS5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gVGhlIHN0ZG91dCBvZiB0aGUgcHJvY2Vzc1xuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgd2luc3Rvbi5pbmZvKCBgbGludGluZyAke3JlcG99YCApO1xuXG4gIHJldHVybiBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ2xpbnQtYWxsJyBdLCBgLi4vJHtyZXBvfWAgKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsImdydW50Q29tbWFuZCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImluZm8iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxlQUFlRixRQUFTO0FBQzlCLE1BQU1HLFVBQVVILFFBQVM7QUFFekI7Ozs7Ozs7Q0FPQyxHQUNESSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJO0lBQ25DSCxRQUFRSSxJQUFJLENBQUUsQ0FBQyxRQUFRLEVBQUVELE1BQU07SUFFL0IsT0FBT1AsUUFBU0csY0FBYztRQUFFO0tBQVksRUFBRSxDQUFDLEdBQUcsRUFBRUksTUFBTTtBQUM1RCJ9