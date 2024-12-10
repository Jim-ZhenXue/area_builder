// Copyright 2021, University of Colorado Boulder
/**
 * git checkout, for SHAs only, but will fetch if the sha doesn't exist locally
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
const gitCheckout = require('./gitCheckout');
const gitDoesCommitExist = require('./gitDoesCommitExist');
const gitFetch = require('./gitFetch');
const assert = require('assert');
/**
 * Executes git checkout, but will fetch if the sha doesn't exist locally
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} sha - The SHA to check out
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, sha) {
    assert(typeof repo === 'string');
    assert(typeof sha === 'string');
    if (!(yield gitDoesCommitExist(repo, sha))) {
        yield gitFetch(repo);
    }
    return gitCheckout(repo, sha);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0RmV0Y2hDaGVja291dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogZ2l0IGNoZWNrb3V0LCBmb3IgU0hBcyBvbmx5LCBidXQgd2lsbCBmZXRjaCBpZiB0aGUgc2hhIGRvZXNuJ3QgZXhpc3QgbG9jYWxseVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xuY29uc3QgZ2l0RG9lc0NvbW1pdEV4aXN0ID0gcmVxdWlyZSggJy4vZ2l0RG9lc0NvbW1pdEV4aXN0JyApO1xuY29uc3QgZ2l0RmV0Y2ggPSByZXF1aXJlKCAnLi9naXRGZXRjaCcgKTtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5cbi8qKlxuICogRXhlY3V0ZXMgZ2l0IGNoZWNrb3V0LCBidXQgd2lsbCBmZXRjaCBpZiB0aGUgc2hhIGRvZXNuJ3QgZXhpc3QgbG9jYWxseVxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHNoYSAtIFRoZSBTSEEgdG8gY2hlY2sgb3V0XG4gKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn0gLSBTdGRvdXRcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIHNoYSApIHtcbiAgYXNzZXJ0KCB0eXBlb2YgcmVwbyA9PT0gJ3N0cmluZycgKTtcbiAgYXNzZXJ0KCB0eXBlb2Ygc2hhID09PSAnc3RyaW5nJyApO1xuXG4gIGlmICggIWF3YWl0IGdpdERvZXNDb21taXRFeGlzdCggcmVwbywgc2hhICkgKSB7XG4gICAgYXdhaXQgZ2l0RmV0Y2goIHJlcG8gKTtcbiAgfVxuXG4gIHJldHVybiBnaXRDaGVja291dCggcmVwbywgc2hhICk7XG59OyJdLCJuYW1lcyI6WyJnaXRDaGVja291dCIsInJlcXVpcmUiLCJnaXREb2VzQ29tbWl0RXhpc3QiLCJnaXRGZXRjaCIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwic2hhIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxjQUFjQyxRQUFTO0FBQzdCLE1BQU1DLHFCQUFxQkQsUUFBUztBQUNwQyxNQUFNRSxXQUFXRixRQUFTO0FBQzFCLE1BQU1HLFNBQVNILFFBQVM7QUFFeEI7Ozs7Ozs7O0NBUUMsR0FDREksT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxHQUFHO0lBQ3hDSixPQUFRLE9BQU9HLFNBQVM7SUFDeEJILE9BQVEsT0FBT0ksUUFBUTtJQUV2QixJQUFLLENBQUMsQ0FBQSxNQUFNTixtQkFBb0JLLE1BQU1DLElBQUksR0FBSTtRQUM1QyxNQUFNTCxTQUFVSTtJQUNsQjtJQUVBLE9BQU9QLFlBQWFPLE1BQU1DO0FBQzVCIn0=