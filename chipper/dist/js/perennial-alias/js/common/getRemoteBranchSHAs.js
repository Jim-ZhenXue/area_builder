// Copyright 2017, University of Colorado Boulder
/**
 * Gets a mapping from branch name to branch SHA from the remote
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
 * Gets a mapping from branch name to branch SHA from the remote
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<Object>} - Object map from branch => sha {string}
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    winston.debug(`retrieving branches from ${repo}`);
    const map = {};
    (yield execute('git', [
        'ls-remote'
    ], `../${repo}`)).split('\n').forEach((line)=>{
        const match = line.trim().match(/^(\S+)\s+refs\/heads\/(\S+)$/);
        if (match) {
            map[match[2]] = match[1];
        }
    });
    return map;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0UmVtb3RlQnJhbmNoU0hBcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2V0cyBhIG1hcHBpbmcgZnJvbSBicmFuY2ggbmFtZSB0byBicmFuY2ggU0hBIGZyb20gdGhlIHJlbW90ZVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEdldHMgYSBtYXBwaW5nIGZyb20gYnJhbmNoIG5hbWUgdG8gYnJhbmNoIFNIQSBmcm9tIHRoZSByZW1vdGVcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxPYmplY3Q+fSAtIE9iamVjdCBtYXAgZnJvbSBicmFuY2ggPT4gc2hhIHtzdHJpbmd9XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvICkge1xuICB3aW5zdG9uLmRlYnVnKCBgcmV0cmlldmluZyBicmFuY2hlcyBmcm9tICR7cmVwb31gICk7XG5cbiAgY29uc3QgbWFwID0ge307XG5cbiAgKCBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnbHMtcmVtb3RlJyBdLCBgLi4vJHtyZXBvfWAgKSApLnNwbGl0KCAnXFxuJyApLmZvckVhY2goIGxpbmUgPT4ge1xuICAgIGNvbnN0IG1hdGNoID0gbGluZS50cmltKCkubWF0Y2goIC9eKFxcUyspXFxzK3JlZnNcXC9oZWFkc1xcLyhcXFMrKSQvICk7XG4gICAgaWYgKCBtYXRjaCApIHtcbiAgICAgIG1hcFsgbWF0Y2hbIDIgXSBdID0gbWF0Y2hbIDEgXTtcbiAgICB9XG4gIH0gKTtcblxuICByZXR1cm4gbWFwO1xufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiZGVidWciLCJtYXAiLCJzcGxpdCIsImZvckVhY2giLCJsaW5lIiwibWF0Y2giLCJ0cmltIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLGFBQWNDLE9BQU87QUFDOUMsTUFBTUMsVUFBVUYsUUFBUztBQUV6Qjs7Ozs7OztDQU9DLEdBQ0RHLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUk7SUFDbkNILFFBQVFJLEtBQUssQ0FBRSxDQUFDLHlCQUF5QixFQUFFRCxNQUFNO0lBRWpELE1BQU1FLE1BQU0sQ0FBQztJQUVYLENBQUEsTUFBTVIsUUFBUyxPQUFPO1FBQUU7S0FBYSxFQUFFLENBQUMsR0FBRyxFQUFFTSxNQUFNLENBQUMsRUFBSUcsS0FBSyxDQUFFLE1BQU9DLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDL0UsTUFBTUMsUUFBUUQsS0FBS0UsSUFBSSxHQUFHRCxLQUFLLENBQUU7UUFDakMsSUFBS0EsT0FBUTtZQUNYSixHQUFHLENBQUVJLEtBQUssQ0FBRSxFQUFHLENBQUUsR0FBR0EsS0FBSyxDQUFFLEVBQUc7UUFDaEM7SUFDRjtJQUVBLE9BQU9KO0FBQ1QifQ==