// Copyright 2023, University of Colorado Boulder
/**
 * git pull the specified path. Needs to work for repos relative to this copy of
 * perennial, AND in ../release-branches/REPO-VERSION/REPO/
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Executes git pull
 * @public
 *
 * @param {string} directory
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = function(directory) {
    winston.info(`git pull in ${directory}`);
    return execute('git', [
        'pull'
    ], directory);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0UHVsbERpcmVjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZ2l0IHB1bGwgdGhlIHNwZWNpZmllZCBwYXRoLiBOZWVkcyB0byB3b3JrIGZvciByZXBvcyByZWxhdGl2ZSB0byB0aGlzIGNvcHkgb2ZcbiAqIHBlcmVubmlhbCwgQU5EIGluIC4uL3JlbGVhc2UtYnJhbmNoZXMvUkVQTy1WRVJTSU9OL1JFUE8vXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l0IHB1bGxcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0b3J5XG4gKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn0gLSBTdGRvdXRcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGRpcmVjdG9yeSApIHtcbiAgd2luc3Rvbi5pbmZvKCBgZ2l0IHB1bGwgaW4gJHtkaXJlY3Rvcnl9YCApO1xuXG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAncHVsbCcgXSwgZGlyZWN0b3J5ICk7XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsImRpcmVjdG9yeSIsImluZm8iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Q0FLQyxHQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxVQUFVRixRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDREcsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLFNBQVM7SUFDbENILFFBQVFJLElBQUksQ0FBRSxDQUFDLFlBQVksRUFBRUQsV0FBVztJQUV4QyxPQUFPTixRQUFTLE9BQU87UUFBRTtLQUFRLEVBQUVNO0FBQ3JDIn0=