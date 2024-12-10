// Copyright 2017, University of Colorado Boulder
/**
 * Checks to see whether a directory on the dev server exists.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const devSsh = require('./devSsh');
/**
 * Checks to see whether a directory on the dev server exists.
 * @public
 *
 * @param {string} directory
 * @returns {Promise.<boolean>} - Whether the directory exists
 */ module.exports = function(directory) {
    return devSsh(`[[ -d "${directory}" ]] && echo exists || echo not`).then((stdout)=>{
        if (stdout.trim() === 'exists') {
            return true;
        } else if (stdout.trim() === 'not') {
            return false;
        } else {
            throw new Error(`Problem determining whether a dev directory exists: ${directory}`);
        }
    }).catch((reason)=>{
        if (reason.stderr.includes('Connection timed out')) {
            throw new Error('Cannot reach the dev server.  Check that you have an internet connection and that you are either on campus or on the VPN.');
        }
        throw new Error(reason);
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZGV2RGlyZWN0b3J5RXhpc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIHdoZXRoZXIgYSBkaXJlY3Rvcnkgb24gdGhlIGRldiBzZXJ2ZXIgZXhpc3RzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5cbmNvbnN0IGRldlNzaCA9IHJlcXVpcmUoICcuL2RldlNzaCcgKTtcblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIHdoZXRoZXIgYSBkaXJlY3Rvcnkgb24gdGhlIGRldiBzZXJ2ZXIgZXhpc3RzLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3RvcnlcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn0gLSBXaGV0aGVyIHRoZSBkaXJlY3RvcnkgZXhpc3RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGRpcmVjdG9yeSApIHtcbiAgcmV0dXJuIGRldlNzaCggYFtbIC1kIFwiJHtkaXJlY3Rvcnl9XCIgXV0gJiYgZWNobyBleGlzdHMgfHwgZWNobyBub3RgICkudGhlbiggc3Rkb3V0ID0+IHtcbiAgICBpZiAoIHN0ZG91dC50cmltKCkgPT09ICdleGlzdHMnICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBzdGRvdXQudHJpbSgpID09PSAnbm90JyApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBQcm9ibGVtIGRldGVybWluaW5nIHdoZXRoZXIgYSBkZXYgZGlyZWN0b3J5IGV4aXN0czogJHtkaXJlY3Rvcnl9YCApO1xuICAgIH1cbiAgfSApLmNhdGNoKCByZWFzb24gPT4ge1xuICAgIGlmICggcmVhc29uLnN0ZGVyci5pbmNsdWRlcyggJ0Nvbm5lY3Rpb24gdGltZWQgb3V0JyApICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IHJlYWNoIHRoZSBkZXYgc2VydmVyLiAgQ2hlY2sgdGhhdCB5b3UgaGF2ZSBhbiBpbnRlcm5ldCBjb25uZWN0aW9uIGFuZCB0aGF0IHlvdSBhcmUgZWl0aGVyIG9uIGNhbXB1cyBvciBvbiB0aGUgVlBOLicgKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCByZWFzb24gKTtcbiAgfSApO1xufTsiXSwibmFtZXMiOlsiZGV2U3NoIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJkaXJlY3RvcnkiLCJ0aGVuIiwic3Rkb3V0IiwidHJpbSIsIkVycm9yIiwiY2F0Y2giLCJyZWFzb24iLCJzdGRlcnIiLCJpbmNsdWRlcyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FHRCxNQUFNQSxTQUFTQyxRQUFTO0FBRXhCOzs7Ozs7Q0FNQyxHQUNEQyxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsU0FBUztJQUNsQyxPQUFPSixPQUFRLENBQUMsT0FBTyxFQUFFSSxVQUFVLCtCQUErQixDQUFDLEVBQUdDLElBQUksQ0FBRUMsQ0FBQUE7UUFDMUUsSUFBS0EsT0FBT0MsSUFBSSxPQUFPLFVBQVc7WUFDaEMsT0FBTztRQUNULE9BQ0ssSUFBS0QsT0FBT0MsSUFBSSxPQUFPLE9BQVE7WUFDbEMsT0FBTztRQUNULE9BQ0s7WUFDSCxNQUFNLElBQUlDLE1BQU8sQ0FBQyxvREFBb0QsRUFBRUosV0FBVztRQUNyRjtJQUNGLEdBQUlLLEtBQUssQ0FBRUMsQ0FBQUE7UUFDVCxJQUFLQSxPQUFPQyxNQUFNLENBQUNDLFFBQVEsQ0FBRSx5QkFBMkI7WUFDdEQsTUFBTSxJQUFJSixNQUFPO1FBQ25CO1FBQ0EsTUFBTSxJQUFJQSxNQUFPRTtJQUNuQjtBQUNGIn0=