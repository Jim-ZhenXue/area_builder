// Copyright 2017, University of Colorado Boulder
/**
 * Executes a command on a remote server.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Executes a command on a remote server.
 * @public
 *
 * @param {string} username
 * @param {string} host
 * @param {string} cmd - The process to execute.
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = function(username, host, cmd) {
    winston.info(`running ${cmd} remotely on ${host}`);
    return execute('ssh', [
        `${username}@${host}`,
        cmd
    ], '.');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vc3NoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNvbW1hbmQgb24gYSByZW1vdGUgc2VydmVyLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY29tbWFuZCBvbiBhIHJlbW90ZSBzZXJ2ZXIuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVzZXJuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaG9zdFxuICogQHBhcmFtIHtzdHJpbmd9IGNtZCAtIFRoZSBwcm9jZXNzIHRvIGV4ZWN1dGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn0gLSBTdGRvdXRcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHVzZXJuYW1lLCBob3N0LCBjbWQgKSB7XG4gIHdpbnN0b24uaW5mbyggYHJ1bm5pbmcgJHtjbWR9IHJlbW90ZWx5IG9uICR7aG9zdH1gICk7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoICdzc2gnLCBbXG4gICAgYCR7dXNlcm5hbWV9QCR7aG9zdH1gLFxuICAgIGNtZFxuICBdLCAnLicgKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwidXNlcm5hbWUiLCJob3N0IiwiY21kIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7Ozs7O0NBU0MsR0FDREcsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxHQUFHO0lBQzVDTCxRQUFRTSxJQUFJLENBQUUsQ0FBQyxRQUFRLEVBQUVELElBQUksYUFBYSxFQUFFRCxNQUFNO0lBRWxELE9BQU9QLFFBQVMsT0FBTztRQUNyQixHQUFHTSxTQUFTLENBQUMsRUFBRUMsTUFBTTtRQUNyQkM7S0FDRCxFQUFFO0FBQ0wifQ==