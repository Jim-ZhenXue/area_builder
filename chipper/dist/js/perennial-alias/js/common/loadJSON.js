// Copyright 2017, University of Colorado Boulder
/**
 * Handling for loading JSON from a file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const fs = require('fs');
const winston = require('winston');
/**
 * Load JSON from a file, resulting in the parsed result.
 * @public
 *
 * @param {string} file
 * @returns {Promise} - Resolves with {Object} - Result of JSON.parse
 */ module.exports = function(file) {
    return new Promise((resolve, reject)=>{
        winston.debug(`Loading JSON from ${file}`);
        fs.readFile(file, 'utf8', (err, data)=>{
            if (err) {
                winston.error(`Error occurred reading version from json at ${file}: ${err}`);
                reject(new Error(err));
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vbG9hZEpTT04uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhhbmRsaW5nIGZvciBsb2FkaW5nIEpTT04gZnJvbSBhIGZpbGUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIExvYWQgSlNPTiBmcm9tIGEgZmlsZSwgcmVzdWx0aW5nIGluIHRoZSBwYXJzZWQgcmVzdWx0LlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXNvbHZlcyB3aXRoIHtPYmplY3R9IC0gUmVzdWx0IG9mIEpTT04ucGFyc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggZmlsZSApIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICB3aW5zdG9uLmRlYnVnKCBgTG9hZGluZyBKU09OIGZyb20gJHtmaWxlfWAgKTtcblxuICAgIGZzLnJlYWRGaWxlKCBmaWxlLCAndXRmOCcsICggZXJyLCBkYXRhICkgPT4ge1xuICAgICAgaWYgKCBlcnIgKSB7XG4gICAgICAgIHdpbnN0b24uZXJyb3IoIGBFcnJvciBvY2N1cnJlZCByZWFkaW5nIHZlcnNpb24gZnJvbSBqc29uIGF0ICR7ZmlsZX06ICR7ZXJyfWAgKTtcbiAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGVyciApICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSggSlNPTi5wYXJzZSggZGF0YSApICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsImZpbGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRlYnVnIiwicmVhZEZpbGUiLCJlcnIiLCJkYXRhIiwiZXJyb3IiLCJFcnJvciIsIkpTT04iLCJwYXJzZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxNQUFNQSxLQUFLQyxRQUFTO0FBQ3BCLE1BQU1DLFVBQVVELFFBQVM7QUFFekI7Ozs7OztDQU1DLEdBQ0RFLE9BQU9DLE9BQU8sR0FBRyxTQUFVQyxJQUFJO0lBQzdCLE9BQU8sSUFBSUMsUUFBUyxDQUFFQyxTQUFTQztRQUM3Qk4sUUFBUU8sS0FBSyxDQUFFLENBQUMsa0JBQWtCLEVBQUVKLE1BQU07UUFFMUNMLEdBQUdVLFFBQVEsQ0FBRUwsTUFBTSxRQUFRLENBQUVNLEtBQUtDO1lBQ2hDLElBQUtELEtBQU07Z0JBQ1RULFFBQVFXLEtBQUssQ0FBRSxDQUFDLDRDQUE0QyxFQUFFUixLQUFLLEVBQUUsRUFBRU0sS0FBSztnQkFDNUVILE9BQVEsSUFBSU0sTUFBT0g7WUFDckIsT0FDSztnQkFDSEosUUFBU1EsS0FBS0MsS0FBSyxDQUFFSjtZQUN2QjtRQUNGO0lBQ0Y7QUFDRiJ9