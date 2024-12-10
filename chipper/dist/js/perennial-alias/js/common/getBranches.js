// Copyright 2017, University of Colorado Boulder
/**
 * Gets a list of branch names from the origin
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
const execute = require('./execute').default;
const winston = require('winston');
/**
 * Gets a list of branch names from the origin
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<Array.<string>>}
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.debug(`retrieving branches from ${repo}`);
    return (yield execute('git', [
        'ls-remote'
    ], `../${repo}`)).split('\n').filter((line)=>line.includes('refs/heads/')).map((line)=>{
        return line.match(/refs\/heads\/(.*)/)[1].trim();
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnJhbmNoZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdldHMgYSBsaXN0IG9mIGJyYW5jaCBuYW1lcyBmcm9tIHRoZSBvcmlnaW5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBHZXRzIGEgbGlzdCBvZiBicmFuY2ggbmFtZXMgZnJvbSB0aGUgb3JpZ2luXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fVxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgd2luc3Rvbi5kZWJ1ZyggYHJldHJpZXZpbmcgYnJhbmNoZXMgZnJvbSAke3JlcG99YCApO1xuXG4gIHJldHVybiAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdscy1yZW1vdGUnIF0sIGAuLi8ke3JlcG99YCApICkuc3BsaXQoICdcXG4nICkuZmlsdGVyKCBsaW5lID0+IGxpbmUuaW5jbHVkZXMoICdyZWZzL2hlYWRzLycgKSApLm1hcCggbGluZSA9PiB7XG4gICAgcmV0dXJuIGxpbmUubWF0Y2goIC9yZWZzXFwvaGVhZHNcXC8oLiopLyApWyAxIF0udHJpbSgpO1xuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJkZWJ1ZyIsInNwbGl0IiwiZmlsdGVyIiwibGluZSIsImluY2x1ZGVzIiwibWFwIiwibWF0Y2giLCJ0cmltIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7OztDQU9DLEdBQ0RHLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUk7SUFDbkNILFFBQVFJLEtBQUssQ0FBRSxDQUFDLHlCQUF5QixFQUFFRCxNQUFNO0lBRWpELE9BQU8sQUFBRSxDQUFBLE1BQU1OLFFBQVMsT0FBTztRQUFFO0tBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRU0sTUFBTSxDQUFDLEVBQUlFLEtBQUssQ0FBRSxNQUFPQyxNQUFNLENBQUVDLENBQUFBLE9BQVFBLEtBQUtDLFFBQVEsQ0FBRSxnQkFBa0JDLEdBQUcsQ0FBRUYsQ0FBQUE7UUFDbkksT0FBT0EsS0FBS0csS0FBSyxDQUFFLG9CQUFxQixDQUFFLEVBQUcsQ0FBQ0MsSUFBSTtJQUNwRDtBQUNGIn0=