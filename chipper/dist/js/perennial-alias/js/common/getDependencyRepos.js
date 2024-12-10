// Copyright 2017-2023, University of Colorado Boulder
/**
 * The repos (keys) from dependencies.json of a repository
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const loadJSON = require('./loadJSON');
const winston = require('winston');
/**
 * @public
 *
 * @param {string} repo - The repository name
 * @param {Object} [options]
 * @returns {Promise} - Resolves to the list of repos in the dependencies.json of the provided repo
 */ module.exports = /*#__PURE__*/ function() {
    var _getDependencyRepos = _async_to_generator(function*(repo, options) {
        winston.info(`getting dependencies.json for ${repo}`);
        const { cwd = '..' } = options || {};
        const json = yield loadJSON(`${cwd}/${repo}/dependencies.json`);
        return Object.keys(json).filter((key)=>key !== 'comment');
    });
    function getDependencyRepos(repo, options) {
        return _getDependencyRepos.apply(this, arguments);
    }
    return getDependencyRepos;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0RGVwZW5kZW5jeVJlcG9zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSByZXBvcyAoa2V5cykgZnJvbSBkZXBlbmRlbmNpZXMuanNvbiBvZiBhIHJlcG9zaXRvcnlcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgbG9hZEpTT04gPSByZXF1aXJlKCAnLi9sb2FkSlNPTicgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBSZXNvbHZlcyB0byB0aGUgbGlzdCBvZiByZXBvcyBpbiB0aGUgZGVwZW5kZW5jaWVzLmpzb24gb2YgdGhlIHByb3ZpZGVkIHJlcG9cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiBnZXREZXBlbmRlbmN5UmVwb3MoIHJlcG8sIG9wdGlvbnMgKSB7XG4gIHdpbnN0b24uaW5mbyggYGdldHRpbmcgZGVwZW5kZW5jaWVzLmpzb24gZm9yICR7cmVwb31gICk7XG5cbiAgY29uc3QgeyBjd2QgPSAnLi4nIH0gPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IGpzb24gPSBhd2FpdCBsb2FkSlNPTiggYCR7Y3dkfS8ke3JlcG99L2RlcGVuZGVuY2llcy5qc29uYCApO1xuICByZXR1cm4gT2JqZWN0LmtleXMoIGpzb24gKS5maWx0ZXIoIGtleSA9PiBrZXkgIT09ICdjb21tZW50JyApO1xufTsiXSwibmFtZXMiOlsibG9hZEpTT04iLCJyZXF1aXJlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJnZXREZXBlbmRlbmN5UmVwb3MiLCJyZXBvIiwib3B0aW9ucyIsImluZm8iLCJjd2QiLCJqc29uIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImtleSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFdBQVdDLFFBQVM7QUFDMUIsTUFBTUMsVUFBVUQsUUFBUztBQUV6Qjs7Ozs7O0NBTUMsR0FDREUsT0FBT0MsT0FBTztRQUFrQkMsc0JBQWYsb0JBQUEsVUFBbUNDLElBQUksRUFBRUMsT0FBTztRQUMvREwsUUFBUU0sSUFBSSxDQUFFLENBQUMsOEJBQThCLEVBQUVGLE1BQU07UUFFckQsTUFBTSxFQUFFRyxNQUFNLElBQUksRUFBRSxHQUFHRixXQUFXLENBQUM7UUFFbkMsTUFBTUcsT0FBTyxNQUFNVixTQUFVLEdBQUdTLElBQUksQ0FBQyxFQUFFSCxLQUFLLGtCQUFrQixDQUFDO1FBQy9ELE9BQU9LLE9BQU9DLElBQUksQ0FBRUYsTUFBT0csTUFBTSxDQUFFQyxDQUFBQSxNQUFPQSxRQUFRO0lBQ3BEO2FBUGdDVCxtQkFBb0JDLElBQUksRUFBRUMsT0FBTztlQUFqQ0Y7O1dBQUFBIn0=