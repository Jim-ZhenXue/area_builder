// Copyright 2019, University of Colorado Boulder
/**
 * Lint detector for invalid text in chipper
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const getBadTextTester = require('./getBadTextTester');
module.exports = {
    create: function(context) {
        // see getBadTextTester for schema.
        const forbiddenTextObjects = [
            // chipper should use perennial-alias instead of perennial, so that it can check out specific versions
            '../perennial/js/'
        ];
        return {
            Program: getBadTextTester('bad-chipper-text', forbiddenTextObjects, context)
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9iYWQtY2hpcHBlci10ZXh0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuXG4vKipcbiAqIExpbnQgZGV0ZWN0b3IgZm9yIGludmFsaWQgdGV4dCBpbiBjaGlwcGVyXG4gKiBMaW50IGlzIGRpc2FibGVkIGZvciB0aGlzIGZpbGUgc28gdGhlIGJhZCB0ZXh0cyBhcmVuJ3QgdGhlbXNlbHZlcyBmbGFnZ2VkLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgZ2V0QmFkVGV4dFRlc3RlciA9IHJlcXVpcmUoICcuL2dldEJhZFRleHRUZXN0ZXInICk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG4gICAgLy8gc2VlIGdldEJhZFRleHRUZXN0ZXIgZm9yIHNjaGVtYS5cbiAgICBjb25zdCBmb3JiaWRkZW5UZXh0T2JqZWN0cyA9IFtcblxuICAgICAgLy8gY2hpcHBlciBzaG91bGQgdXNlIHBlcmVubmlhbC1hbGlhcyBpbnN0ZWFkIG9mIHBlcmVubmlhbCwgc28gdGhhdCBpdCBjYW4gY2hlY2sgb3V0IHNwZWNpZmljIHZlcnNpb25zXG4gICAgICAnLi4vcGVyZW5uaWFsL2pzLydcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIFByb2dyYW06IGdldEJhZFRleHRUZXN0ZXIoICdiYWQtY2hpcHBlci10ZXh0JywgZm9yYmlkZGVuVGV4dE9iamVjdHMsIGNvbnRleHQgKVxuICAgIH07XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAgLy8gSlNPTiBTY2hlbWEgZm9yIHJ1bGUgb3B0aW9ucyBnb2VzIGhlcmVcbl07Il0sIm5hbWVzIjpbImdldEJhZFRleHRUZXN0ZXIiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJmb3JiaWRkZW5UZXh0T2JqZWN0cyIsIlByb2dyYW0iLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUdqRDs7Ozs7O0NBTUMsR0FFRCxNQUFNQSxtQkFBbUJDLFFBQVM7QUFFbENDLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxRQUFRLFNBQVVDLE9BQU87UUFFdkIsbUNBQW1DO1FBQ25DLE1BQU1DLHVCQUF1QjtZQUUzQixzR0FBc0c7WUFDdEc7U0FDRDtRQUVELE9BQU87WUFDTEMsU0FBU1AsaUJBQWtCLG9CQUFvQk0sc0JBQXNCRDtRQUN2RTtJQUNGO0FBQ0Y7QUFFQUgsT0FBT0MsT0FBTyxDQUFDSyxNQUFNLEdBQUcsRUFFdkIifQ==