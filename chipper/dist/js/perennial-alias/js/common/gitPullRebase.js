// Copyright 2017, University of Colorado Boulder
/**
 * git pull --rebase
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Executes git pull
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = function(repo) {
    winston.info(`git pull --rebase on ${repo}`);
    return execute('git', [
        'pull',
        '--rebase'
    ], `../${repo}`);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0UHVsbFJlYmFzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZ2l0IHB1bGwgLS1yZWJhc2VcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXQgcHVsbFxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gU3Rkb3V0XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvICkge1xuICB3aW5zdG9uLmluZm8oIGBnaXQgcHVsbCAtLXJlYmFzZSBvbiAke3JlcG99YCApO1xuXG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAncHVsbCcsICctLXJlYmFzZScgXSwgYC4uLyR7cmVwb31gICk7XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJpbmZvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxVQUFVRixRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDREcsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLElBQUk7SUFDN0JILFFBQVFJLElBQUksQ0FBRSxDQUFDLHFCQUFxQixFQUFFRCxNQUFNO0lBRTVDLE9BQU9OLFFBQVMsT0FBTztRQUFFO1FBQVE7S0FBWSxFQUFFLENBQUMsR0FBRyxFQUFFTSxNQUFNO0FBQzdEIn0=