// Copyright 2023, University of Colorado Boulder
/**
 * Gets a map of branch names (from the origin) to their remote SHAs
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
 * Gets a map of branch names (from the origin) to their remote SHAs
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<Array.<Record<string, string>>>}
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.debug(`retrieving branches from ${repo}`);
    const result = {};
    (yield execute('git', [
        'ls-remote'
    ], `../${repo}`)).split('\n').filter((line)=>line.includes('refs/heads/')).forEach((line)=>{
        const branch = line.match(/refs\/heads\/(.*)/)[1].trim();
        const sha = line.split(/\s+/)[0].trim();
        result[branch] = sha;
    });
    return result;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnJhbmNoTWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZXRzIGEgbWFwIG9mIGJyYW5jaCBuYW1lcyAoZnJvbSB0aGUgb3JpZ2luKSB0byB0aGVpciByZW1vdGUgU0hBc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEdldHMgYSBtYXAgb2YgYnJhbmNoIG5hbWVzIChmcm9tIHRoZSBvcmlnaW4pIHRvIHRoZWlyIHJlbW90ZSBTSEFzXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+Pn1cbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8gKSB7XG4gIHdpbnN0b24uZGVidWcoIGByZXRyaWV2aW5nIGJyYW5jaGVzIGZyb20gJHtyZXBvfWAgKTtcblxuICBjb25zdCByZXN1bHQgPSB7fTtcblxuICAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdscy1yZW1vdGUnIF0sIGAuLi8ke3JlcG99YCApICkuc3BsaXQoICdcXG4nICkuZmlsdGVyKCBsaW5lID0+IGxpbmUuaW5jbHVkZXMoICdyZWZzL2hlYWRzLycgKSApLmZvckVhY2goIGxpbmUgPT4ge1xuICAgIGNvbnN0IGJyYW5jaCA9IGxpbmUubWF0Y2goIC9yZWZzXFwvaGVhZHNcXC8oLiopLyApWyAxIF0udHJpbSgpO1xuICAgIGNvbnN0IHNoYSA9IGxpbmUuc3BsaXQoIC9cXHMrLyApWyAwIF0udHJpbSgpO1xuICAgIHJlc3VsdFsgYnJhbmNoIF0gPSBzaGE7XG4gIH0gKTtcblxuICByZXR1cm4gcmVzdWx0O1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiZGVidWciLCJyZXN1bHQiLCJzcGxpdCIsImZpbHRlciIsImxpbmUiLCJpbmNsdWRlcyIsImZvckVhY2giLCJicmFuY2giLCJtYXRjaCIsInRyaW0iLCJzaGEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUM5QyxNQUFNQyxVQUFVRixRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDREcsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSTtJQUNuQ0gsUUFBUUksS0FBSyxDQUFFLENBQUMseUJBQXlCLEVBQUVELE1BQU07SUFFakQsTUFBTUUsU0FBUyxDQUFDO0lBRWQsQ0FBQSxNQUFNUixRQUFTLE9BQU87UUFBRTtLQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUVNLE1BQU0sQ0FBQyxFQUFJRyxLQUFLLENBQUUsTUFBT0MsTUFBTSxDQUFFQyxDQUFBQSxPQUFRQSxLQUFLQyxRQUFRLENBQUUsZ0JBQWtCQyxPQUFPLENBQUVGLENBQUFBO1FBQ2hJLE1BQU1HLFNBQVNILEtBQUtJLEtBQUssQ0FBRSxvQkFBcUIsQ0FBRSxFQUFHLENBQUNDLElBQUk7UUFDMUQsTUFBTUMsTUFBTU4sS0FBS0YsS0FBSyxDQUFFLE1BQU8sQ0FBRSxFQUFHLENBQUNPLElBQUk7UUFDekNSLE1BQU0sQ0FBRU0sT0FBUSxHQUFHRztJQUNyQjtJQUVBLE9BQU9UO0FBQ1QifQ==