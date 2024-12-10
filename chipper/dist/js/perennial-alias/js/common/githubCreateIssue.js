// Copyright 2019, University of Colorado Boulder
/**
 * Creates an issue in a phetsims github repository
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
const buildLocal = require('./buildLocal');
const Octokit = require('@octokit/rest'); // eslint-disable-line phet/require-statement-match
const _ = require('lodash');
const winston = require('winston');
/**
 * Creates an issue in a phetsims github repository
 * @public
 *
 * The options include the body/assignees/labels and milestone number, e.g.:
 *
 * githubCreateIssue( 'bumper', 'test issue 2', {
 *   body: 'issue body',
 *   assignees: [ 'jonathanolson' ],
 *   labels: [ 'type:automated-testing' ]
 * } )
 *
 * created https://github.com/phetsims/bumper/issues/3
 *
 * @param {string} repo - The repository name
 * @param {string} title - The title of the issue
 * @param {Object} [options] - Other options to pass in. `body` is recommended. See
 *                             https://octokit.github.io/rest.js/#octokit-routes-issues-create
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, title, options) {
    winston.info(`Creating issue for ${repo}`);
    const octokit = new Octokit({
        auth: buildLocal.phetDevGitHubAccessToken
    });
    yield octokit.issues.create(_.extend({
        owner: 'phetsims',
        repo: repo,
        title: title
    }, options));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0aHViQ3JlYXRlSXNzdWUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTksIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENyZWF0ZXMgYW4gaXNzdWUgaW4gYSBwaGV0c2ltcyBnaXRodWIgcmVwb3NpdG9yeVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4vYnVpbGRMb2NhbCcgKTtcbmNvbnN0IE9jdG9raXQgPSByZXF1aXJlKCAnQG9jdG9raXQvcmVzdCcgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3JlcXVpcmUtc3RhdGVtZW50LW1hdGNoXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGlzc3VlIGluIGEgcGhldHNpbXMgZ2l0aHViIHJlcG9zaXRvcnlcbiAqIEBwdWJsaWNcbiAqXG4gKiBUaGUgb3B0aW9ucyBpbmNsdWRlIHRoZSBib2R5L2Fzc2lnbmVlcy9sYWJlbHMgYW5kIG1pbGVzdG9uZSBudW1iZXIsIGUuZy46XG4gKlxuICogZ2l0aHViQ3JlYXRlSXNzdWUoICdidW1wZXInLCAndGVzdCBpc3N1ZSAyJywge1xuICogICBib2R5OiAnaXNzdWUgYm9keScsXG4gKiAgIGFzc2lnbmVlczogWyAnam9uYXRoYW5vbHNvbicgXSxcbiAqICAgbGFiZWxzOiBbICd0eXBlOmF1dG9tYXRlZC10ZXN0aW5nJyBdXG4gKiB9IClcbiAqXG4gKiBjcmVhdGVkIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idW1wZXIvaXNzdWVzLzNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSAtIFRoZSB0aXRsZSBvZiB0aGUgaXNzdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBPdGhlciBvcHRpb25zIHRvIHBhc3MgaW4uIGBib2R5YCBpcyByZWNvbW1lbmRlZC4gU2VlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cHM6Ly9vY3Rva2l0LmdpdGh1Yi5pby9yZXN0LmpzLyNvY3Rva2l0LXJvdXRlcy1pc3N1ZXMtY3JlYXRlXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fSAtIFJlc29sdmVzIHdpdGggY2hlY2tlZE91dFJlcG9zXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIHRpdGxlLCBvcHRpb25zICkge1xuICB3aW5zdG9uLmluZm8oIGBDcmVhdGluZyBpc3N1ZSBmb3IgJHtyZXBvfWAgKTtcblxuICBjb25zdCBvY3Rva2l0ID0gbmV3IE9jdG9raXQoIHtcbiAgICBhdXRoOiBidWlsZExvY2FsLnBoZXREZXZHaXRIdWJBY2Nlc3NUb2tlblxuICB9ICk7XG4gIGF3YWl0IG9jdG9raXQuaXNzdWVzLmNyZWF0ZSggXy5leHRlbmQoIHtcbiAgICBvd25lcjogJ3BoZXRzaW1zJyxcbiAgICByZXBvOiByZXBvLFxuICAgIHRpdGxlOiB0aXRsZVxuICB9LCBvcHRpb25zICkgKTtcbn07Il0sIm5hbWVzIjpbImJ1aWxkTG9jYWwiLCJyZXF1aXJlIiwiT2N0b2tpdCIsIl8iLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ0aXRsZSIsIm9wdGlvbnMiLCJpbmZvIiwib2N0b2tpdCIsImF1dGgiLCJwaGV0RGV2R2l0SHViQWNjZXNzVG9rZW4iLCJpc3N1ZXMiLCJjcmVhdGUiLCJleHRlbmQiLCJvd25lciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsYUFBYUMsUUFBUztBQUM1QixNQUFNQyxVQUFVRCxRQUFTLGtCQUFtQixtREFBbUQ7QUFDL0YsTUFBTUUsSUFBSUYsUUFBUztBQUNuQixNQUFNRyxVQUFVSCxRQUFTO0FBRXpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBQ0RJLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxPQUFPO0lBQ25ETCxRQUFRTSxJQUFJLENBQUUsQ0FBQyxtQkFBbUIsRUFBRUgsTUFBTTtJQUUxQyxNQUFNSSxVQUFVLElBQUlULFFBQVM7UUFDM0JVLE1BQU1aLFdBQVdhLHdCQUF3QjtJQUMzQztJQUNBLE1BQU1GLFFBQVFHLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFWixFQUFFYSxNQUFNLENBQUU7UUFDckNDLE9BQU87UUFDUFYsTUFBTUE7UUFDTkMsT0FBT0E7SUFDVCxHQUFHQztBQUNMIn0=