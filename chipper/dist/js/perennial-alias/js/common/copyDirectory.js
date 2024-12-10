// Copyright 2020, University of Colorado Boulder
/**
 * Copies a directory (recursively) to another location
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const ncp = require('ncp');
const winston = require('winston');
/**
 * Copies a directory (recursively) to another location
 * @public
 *
 * @param {string} path
 * @param {string} location
 * @param {Object} [options]
 * @returns {Promise}
 */ module.exports = function(pathToCopy, location, options) {
    winston.info(`copying ${pathToCopy} into ${location}`);
    return new Promise((resolve, reject)=>{
        ncp.ncp(pathToCopy, location, options, (err)=>{
            if (err) {
                reject(new Error(`copyDirectory error: ${err}`));
            } else {
                resolve();
            }
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY29weURpcmVjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29waWVzIGEgZGlyZWN0b3J5IChyZWN1cnNpdmVseSkgdG8gYW5vdGhlciBsb2NhdGlvblxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBuY3AgPSByZXF1aXJlKCAnbmNwJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIENvcGllcyBhIGRpcmVjdG9yeSAocmVjdXJzaXZlbHkpIHRvIGFub3RoZXIgbG9jYXRpb25cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcGF0aFRvQ29weSwgbG9jYXRpb24sIG9wdGlvbnMgKSB7XG4gIHdpbnN0b24uaW5mbyggYGNvcHlpbmcgJHtwYXRoVG9Db3B5fSBpbnRvICR7bG9jYXRpb259YCApO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgbmNwLm5jcCggcGF0aFRvQ29weSwgbG9jYXRpb24sIG9wdGlvbnMsIGVyciA9PiB7XG4gICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGBjb3B5RGlyZWN0b3J5IGVycm9yOiAke2Vycn1gICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSApO1xuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJuY3AiLCJyZXF1aXJlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJwYXRoVG9Db3B5IiwibG9jYXRpb24iLCJvcHRpb25zIiwiaW5mbyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXJyIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsTUFBTUMsUUFBUztBQUNyQixNQUFNQyxVQUFVRCxRQUFTO0FBRXpCOzs7Ozs7OztDQVFDLEdBQ0RFLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsT0FBTztJQUN0REwsUUFBUU0sSUFBSSxDQUFFLENBQUMsUUFBUSxFQUFFSCxXQUFXLE1BQU0sRUFBRUMsVUFBVTtJQUV0RCxPQUFPLElBQUlHLFFBQVMsQ0FBRUMsU0FBU0M7UUFDN0JYLElBQUlBLEdBQUcsQ0FBRUssWUFBWUMsVUFBVUMsU0FBU0ssQ0FBQUE7WUFDdEMsSUFBS0EsS0FBTTtnQkFDVEQsT0FBUSxJQUFJRSxNQUFPLENBQUMscUJBQXFCLEVBQUVELEtBQUs7WUFDbEQsT0FDSztnQkFDSEY7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9