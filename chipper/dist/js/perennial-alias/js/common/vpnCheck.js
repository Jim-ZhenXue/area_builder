// Copyright 2018, University of Colorado Boulder
/**
 * Checks whether we are somewhere that would have access to phet-server2.int.colorado.edu (implies access to bayes).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const dns = require('dns');
/**
 * Checks whether we are somewhere that would have access to phet-server2.int.colorado.edu (implies access to bayes).
 * @public
 *
 * @returns {Promise.<boolean>} - Whether the directory exists
 */ module.exports = function() {
    return new Promise((resolve, reject)=>{
        dns.resolve('phet-server2.int.colorado.edu', (err)=>{
            resolve(!err);
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdnBuQ2hlY2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHdlIGFyZSBzb21ld2hlcmUgdGhhdCB3b3VsZCBoYXZlIGFjY2VzcyB0byBwaGV0LXNlcnZlcjIuaW50LmNvbG9yYWRvLmVkdSAoaW1wbGllcyBhY2Nlc3MgdG8gYmF5ZXMpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBkbnMgPSByZXF1aXJlKCAnZG5zJyApO1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHdlIGFyZSBzb21ld2hlcmUgdGhhdCB3b3VsZCBoYXZlIGFjY2VzcyB0byBwaGV0LXNlcnZlcjIuaW50LmNvbG9yYWRvLmVkdSAoaW1wbGllcyBhY2Nlc3MgdG8gYmF5ZXMpLlxuICogQHB1YmxpY1xuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn0gLSBXaGV0aGVyIHRoZSBkaXJlY3RvcnkgZXhpc3RzXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgZG5zLnJlc29sdmUoICdwaGV0LXNlcnZlcjIuaW50LmNvbG9yYWRvLmVkdScsIGVyciA9PiB7XG4gICAgICByZXNvbHZlKCAhZXJyICk7XG4gICAgfSApO1xuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJkbnMiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXJyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVELE1BQU1BLE1BQU1DLFFBQVM7QUFFckI7Ozs7O0NBS0MsR0FDREMsT0FBT0MsT0FBTyxHQUFHO0lBQ2YsT0FBTyxJQUFJQyxRQUFTLENBQUVDLFNBQVNDO1FBQzdCTixJQUFJSyxPQUFPLENBQUUsaUNBQWlDRSxDQUFBQTtZQUM1Q0YsUUFBUyxDQUFDRTtRQUNaO0lBQ0Y7QUFDRiJ9