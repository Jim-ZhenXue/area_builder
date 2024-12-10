// Copyright 2017, University of Colorado Boulder
/**
 * Handling for writing JSON to a file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const fs = require('fs');
const winston = require('winston');
/**
 * Write JSON to a file
 * @public
 *
 * @param {string} file
 * @param {Object} content
 * @returns {Promise}
 */ module.exports = function(file, content) {
    return new Promise((resolve, reject)=>{
        winston.debug(`Writing JSON to ${file}`);
        fs.writeFile(file, JSON.stringify(content, null, 2), (err)=>{
            if (err) {
                reject(new Error(`Could not write to file: ${file} due to: ${err}`));
            } else {
                resolve();
            }
        });
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd3JpdGVKU09OLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIYW5kbGluZyBmb3Igd3JpdGluZyBKU09OIHRvIGEgZmlsZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogV3JpdGUgSlNPTiB0byBhIGZpbGVcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBmaWxlLCBjb250ZW50ICkge1xuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIHdpbnN0b24uZGVidWcoIGBXcml0aW5nIEpTT04gdG8gJHtmaWxlfWAgKTtcblxuICAgIGZzLndyaXRlRmlsZSggZmlsZSwgSlNPTi5zdHJpbmdpZnkoIGNvbnRlbnQsIG51bGwsIDIgKSwgZXJyID0+IHtcbiAgICAgIGlmICggZXJyICkge1xuICAgICAgICByZWplY3QoIG5ldyBFcnJvciggYENvdWxkIG5vdCB3cml0ZSB0byBmaWxlOiAke2ZpbGV9IGR1ZSB0bzogJHtlcnJ9YCApICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfSApO1xufTsiXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJmaWxlIiwiY29udGVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGVidWciLCJ3cml0ZUZpbGUiLCJKU09OIiwic3RyaW5naWZ5IiwiZXJyIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsTUFBTUEsS0FBS0MsUUFBUztBQUNwQixNQUFNQyxVQUFVRCxRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDREUsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLElBQUksRUFBRUMsT0FBTztJQUN0QyxPQUFPLElBQUlDLFFBQVMsQ0FBRUMsU0FBU0M7UUFDN0JQLFFBQVFRLEtBQUssQ0FBRSxDQUFDLGdCQUFnQixFQUFFTCxNQUFNO1FBRXhDTCxHQUFHVyxTQUFTLENBQUVOLE1BQU1PLEtBQUtDLFNBQVMsQ0FBRVAsU0FBUyxNQUFNLElBQUtRLENBQUFBO1lBQ3RELElBQUtBLEtBQU07Z0JBQ1RMLE9BQVEsSUFBSU0sTUFBTyxDQUFDLHlCQUF5QixFQUFFVixLQUFLLFNBQVMsRUFBRVMsS0FBSztZQUN0RSxPQUNLO2dCQUNITjtZQUNGO1FBQ0Y7SUFDRjtBQUNGIn0=