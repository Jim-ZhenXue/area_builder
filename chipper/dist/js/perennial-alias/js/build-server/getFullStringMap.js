// Copyright 2023, University of Colorado Boulder
/**
 * Returns an inverse string map (stringMap[ stringKey ][ locale ]) for all strings in all dependencies for a given repo
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
const getDependencyRepos = require('../common/getDependencyRepos');
const getRepoStringMap = require('./getRepoStringMap');
/**
 * Returns an inverse string map (stringMap[ stringKey ][ locale ]) for all strings in all dependencies for a given repo
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} checkoutDir
 * @returns {Promise.<stringMap[ stringKey ][ locale ]>}
 */ module.exports = /*#__PURE__*/ function() {
    var _getFullStringMap = _async_to_generator(function*(repo, checkoutDir) {
        let result = {};
        for (const dependencyRepo of yield getDependencyRepos(repo, {
            cwd: checkoutDir
        })){
            result = _extends({}, result, (yield getRepoStringMap(dependencyRepo, checkoutDir)));
        }
        return result;
    });
    function getFullStringMap(repo, checkoutDir) {
        return _getFullStringMap.apply(this, arguments);
    }
    return getFullStringMap;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvZ2V0RnVsbFN0cmluZ01hcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJucyBhbiBpbnZlcnNlIHN0cmluZyBtYXAgKHN0cmluZ01hcFsgc3RyaW5nS2V5IF1bIGxvY2FsZSBdKSBmb3IgYWxsIHN0cmluZ3MgaW4gYWxsIGRlcGVuZGVuY2llcyBmb3IgYSBnaXZlbiByZXBvXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdldERlcGVuZGVuY3lSZXBvcyA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0RGVwZW5kZW5jeVJlcG9zJyApO1xuY29uc3QgZ2V0UmVwb1N0cmluZ01hcCA9IHJlcXVpcmUoICcuL2dldFJlcG9TdHJpbmdNYXAnICk7XG5cbi8qKlxuICogUmV0dXJucyBhbiBpbnZlcnNlIHN0cmluZyBtYXAgKHN0cmluZ01hcFsgc3RyaW5nS2V5IF1bIGxvY2FsZSBdKSBmb3IgYWxsIHN0cmluZ3MgaW4gYWxsIGRlcGVuZGVuY2llcyBmb3IgYSBnaXZlbiByZXBvXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gY2hlY2tvdXREaXJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmdNYXBbIHN0cmluZ0tleSBdWyBsb2NhbGUgXT59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gZ2V0RnVsbFN0cmluZ01hcCggcmVwbywgY2hlY2tvdXREaXIgKSB7XG5cbiAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gIGZvciAoIGNvbnN0IGRlcGVuZGVuY3lSZXBvIG9mIGF3YWl0IGdldERlcGVuZGVuY3lSZXBvcyggcmVwbywgeyBjd2Q6IGNoZWNrb3V0RGlyIH0gKSApIHtcbiAgICByZXN1bHQgPSB7IC4uLnJlc3VsdCwgLi4uYXdhaXQgZ2V0UmVwb1N0cmluZ01hcCggZGVwZW5kZW5jeVJlcG8sIGNoZWNrb3V0RGlyICkgfTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59OyJdLCJuYW1lcyI6WyJnZXREZXBlbmRlbmN5UmVwb3MiLCJyZXF1aXJlIiwiZ2V0UmVwb1N0cmluZ01hcCIsIm1vZHVsZSIsImV4cG9ydHMiLCJnZXRGdWxsU3RyaW5nTWFwIiwicmVwbyIsImNoZWNrb3V0RGlyIiwicmVzdWx0IiwiZGVwZW5kZW5jeVJlcG8iLCJjd2QiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEscUJBQXFCQyxRQUFTO0FBQ3BDLE1BQU1DLG1CQUFtQkQsUUFBUztBQUVsQzs7Ozs7OztDQU9DLEdBQ0RFLE9BQU9DLE9BQU87UUFBa0JDLG9CQUFmLG9CQUFBLFVBQWlDQyxJQUFJLEVBQUVDLFdBQVc7UUFFakUsSUFBSUMsU0FBUyxDQUFDO1FBRWQsS0FBTSxNQUFNQyxrQkFBa0IsTUFBTVQsbUJBQW9CTSxNQUFNO1lBQUVJLEtBQUtIO1FBQVksR0FBTTtZQUNyRkMsU0FBUyxhQUFLQSxRQUFXLENBQUEsTUFBTU4saUJBQWtCTyxnQkFBZ0JGLFlBQVk7UUFDL0U7UUFFQSxPQUFPQztJQUNUO2FBVGdDSCxpQkFBa0JDLElBQUksRUFBRUMsV0FBVztlQUFuQ0Y7O1dBQUFBIn0=