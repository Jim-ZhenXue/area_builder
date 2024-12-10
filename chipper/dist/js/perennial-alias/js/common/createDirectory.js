// Copyright 2020, University of Colorado Boulder
/**
 * Creates a directory at the given path
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const fs = require('fs');
const winston = require('winston');
/**
 * Creates a directory at the given path
 * @public
 *
 * @param {string} path
 * @returns {Promise}
 */ module.exports = function(path) {
    winston.info(`Creating directory ${path}`);
    return new Promise((resolve, reject)=>{
        fs.mkdir(path, (err)=>{
            if (err) {
                reject(new Error(`createDirectory: ${err}`));
            } else {
                resolve();
            }
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY3JlYXRlRGlyZWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGlyZWN0b3J5IGF0IHRoZSBnaXZlbiBwYXRoXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkaXJlY3RvcnkgYXQgdGhlIGdpdmVuIHBhdGhcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBhdGggKSB7XG4gIHdpbnN0b24uaW5mbyggYENyZWF0aW5nIGRpcmVjdG9yeSAke3BhdGh9YCApO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XG4gICAgZnMubWtkaXIoIHBhdGgsIGVyciA9PiB7XG4gICAgICBpZiAoIGVyciApIHtcbiAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGBjcmVhdGVEaXJlY3Rvcnk6ICR7ZXJyfWAgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicGF0aCIsImluZm8iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm1rZGlyIiwiZXJyIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsS0FBS0MsUUFBUztBQUNwQixNQUFNQyxVQUFVRCxRQUFTO0FBRXpCOzs7Ozs7Q0FNQyxHQUNERSxPQUFPQyxPQUFPLEdBQUcsU0FBVUMsSUFBSTtJQUM3QkgsUUFBUUksSUFBSSxDQUFFLENBQUMsbUJBQW1CLEVBQUVELE1BQU07SUFFMUMsT0FBTyxJQUFJRSxRQUFTLENBQUVDLFNBQVNDO1FBQzdCVCxHQUFHVSxLQUFLLENBQUVMLE1BQU1NLENBQUFBO1lBQ2QsSUFBS0EsS0FBTTtnQkFDVEYsT0FBUSxJQUFJRyxNQUFPLENBQUMsaUJBQWlCLEVBQUVELEtBQUs7WUFDOUMsT0FDSztnQkFDSEg7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9