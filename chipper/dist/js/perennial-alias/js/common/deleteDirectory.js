// Copyright 2020, University of Colorado Boulder
/**
 * Deletes a path recursively
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
const winston = require('winston');
/**
 * Deletes a path recursively
 * @public
 *
 * @param {string} path - The path to delete recursively
 * @returns {Promise}
 */ module.exports = function(path) {
    winston.info(`Deleting directory ${path}`);
    return execute('rm', [
        '-Rf',
        path
    ], '../');
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZGVsZXRlRGlyZWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZWxldGVzIGEgcGF0aCByZWN1cnNpdmVseVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIERlbGV0ZXMgYSBwYXRoIHJlY3Vyc2l2ZWx5XG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBUaGUgcGF0aCB0byBkZWxldGUgcmVjdXJzaXZlbHlcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwYXRoICkge1xuICB3aW5zdG9uLmluZm8oIGBEZWxldGluZyBkaXJlY3RvcnkgJHtwYXRofWAgKTtcblxuICByZXR1cm4gZXhlY3V0ZSggJ3JtJywgWyAnLVJmJywgcGF0aCBdLCAnLi4vJyApO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXRoIiwiaW5mbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7O0NBTUMsR0FDREcsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLElBQUk7SUFDN0JILFFBQVFJLElBQUksQ0FBRSxDQUFDLG1CQUFtQixFQUFFRCxNQUFNO0lBRTFDLE9BQU9OLFFBQVMsTUFBTTtRQUFFO1FBQU9NO0tBQU0sRUFBRTtBQUN6QyJ9