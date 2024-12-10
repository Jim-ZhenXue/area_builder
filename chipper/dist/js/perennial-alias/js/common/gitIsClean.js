// Copyright 2017-2022, University of Colorado Boulder
/**
 * Checks to see if the git state/status is clean
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Checks to see if the git state/status is clean
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} [file] - Optional file or path if you only want to check state of a single file or subdirectory
 * @returns {Promise.<boolean>} - Whether it is clean or not
 * @rejects {ExecuteError}
 */ module.exports = function(repo, file) {
    winston.debug(`git status check on ${repo}`);
    const gitArgs = [
        'status',
        '--porcelain'
    ];
    if (file) {
        gitArgs.push(file);
    }
    return execute('git', gitArgs, `../${repo}`).then((stdout)=>Promise.resolve(stdout.length === 0));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0SXNDbGVhbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIHRoZSBnaXQgc3RhdGUvc3RhdHVzIGlzIGNsZWFuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQ2hlY2tzIHRvIHNlZSBpZiB0aGUgZ2l0IHN0YXRlL3N0YXR1cyBpcyBjbGVhblxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IFtmaWxlXSAtIE9wdGlvbmFsIGZpbGUgb3IgcGF0aCBpZiB5b3Ugb25seSB3YW50IHRvIGNoZWNrIHN0YXRlIG9mIGEgc2luZ2xlIGZpbGUgb3Igc3ViZGlyZWN0b3J5XG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59IC0gV2hldGhlciBpdCBpcyBjbGVhbiBvciBub3RcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHJlcG8sIGZpbGUgKSB7XG4gIHdpbnN0b24uZGVidWcoIGBnaXQgc3RhdHVzIGNoZWNrIG9uICR7cmVwb31gICk7XG5cbiAgY29uc3QgZ2l0QXJncyA9IFsgJ3N0YXR1cycsICctLXBvcmNlbGFpbicgXTtcblxuICBpZiAoIGZpbGUgKSB7XG4gICAgZ2l0QXJncy5wdXNoKCBmaWxlICk7XG4gIH1cbiAgcmV0dXJuIGV4ZWN1dGUoICdnaXQnLCBnaXRBcmdzLCBgLi4vJHtyZXBvfWAgKS50aGVuKCBzdGRvdXQgPT4gUHJvbWlzZS5yZXNvbHZlKCBzdGRvdXQubGVuZ3RoID09PSAwICkgKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImZpbGUiLCJkZWJ1ZyIsImdpdEFyZ3MiLCJwdXNoIiwidGhlbiIsInN0ZG91dCIsIlByb21pc2UiLCJyZXNvbHZlIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxVQUFVRixRQUFTO0FBRXpCOzs7Ozs7OztDQVFDLEdBQ0RHLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxJQUFJLEVBQUVDLElBQUk7SUFDbkNKLFFBQVFLLEtBQUssQ0FBRSxDQUFDLG9CQUFvQixFQUFFRixNQUFNO0lBRTVDLE1BQU1HLFVBQVU7UUFBRTtRQUFVO0tBQWU7SUFFM0MsSUFBS0YsTUFBTztRQUNWRSxRQUFRQyxJQUFJLENBQUVIO0lBQ2hCO0lBQ0EsT0FBT1AsUUFBUyxPQUFPUyxTQUFTLENBQUMsR0FBRyxFQUFFSCxNQUFNLEVBQUdLLElBQUksQ0FBRUMsQ0FBQUEsU0FBVUMsUUFBUUMsT0FBTyxDQUFFRixPQUFPRyxNQUFNLEtBQUs7QUFDcEcifQ==