// Copyright 2022, University of Colorado Boulder
/**
 * Ensures that a simulation is marked as published in its package.json
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
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitPush = require('./gitPush');
const fs = require('fs');
/**
 * Ensures that a simulation is marked as published in its package.json
 * @public
 *
 * @param {string} repo
 *
 * @returns {Promise<void>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
    if (!packageObject.phet.published) {
        packageObject.phet.published = true;
        fs.writeFileSync(`../${repo}/package.json`, JSON.stringify(packageObject, null, 2));
        yield gitAdd(repo, 'package.json');
        yield gitCommit(repo, 'Marking repository as published');
        yield gitPush(repo, 'main');
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vbWFya1NpbUFzUHVibGlzaGVkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFbnN1cmVzIHRoYXQgYSBzaW11bGF0aW9uIGlzIG1hcmtlZCBhcyBwdWJsaXNoZWQgaW4gaXRzIHBhY2thZ2UuanNvblxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi9naXRBZGQnICk7XG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XG5jb25zdCBnaXRQdXNoID0gcmVxdWlyZSggJy4vZ2l0UHVzaCcgKTtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCBhIHNpbXVsYXRpb24gaXMgbWFya2VkIGFzIHB1Ymxpc2hlZCBpbiBpdHMgcGFja2FnZS5qc29uXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcblxuICBpZiAoICFwYWNrYWdlT2JqZWN0LnBoZXQucHVibGlzaGVkICkge1xuICAgIHBhY2thZ2VPYmplY3QucGhldC5wdWJsaXNoZWQgPSB0cnVlO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsIEpTT04uc3RyaW5naWZ5KCBwYWNrYWdlT2JqZWN0LCBudWxsLCAyICkgKTtcblxuICAgIGF3YWl0IGdpdEFkZCggcmVwbywgJ3BhY2thZ2UuanNvbicgKTtcbiAgICBhd2FpdCBnaXRDb21taXQoIHJlcG8sICdNYXJraW5nIHJlcG9zaXRvcnkgYXMgcHVibGlzaGVkJyApO1xuICAgIGF3YWl0IGdpdFB1c2goIHJlcG8sICdtYWluJyApO1xuICB9XG59OyJdLCJuYW1lcyI6WyJnaXRBZGQiLCJyZXF1aXJlIiwiZ2l0Q29tbWl0IiwiZ2l0UHVzaCIsImZzIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwicGhldCIsInB1Ymxpc2hlZCIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFNBQVNDLFFBQVM7QUFDeEIsTUFBTUMsWUFBWUQsUUFBUztBQUMzQixNQUFNRSxVQUFVRixRQUFTO0FBQ3pCLE1BQU1HLEtBQUtILFFBQVM7QUFFcEI7Ozs7Ozs7Q0FPQyxHQUNESSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJO0lBQ25DLE1BQU1DLGdCQUFnQkMsS0FBS0MsS0FBSyxDQUFFTixHQUFHTyxZQUFZLENBQUUsQ0FBQyxHQUFHLEVBQUVKLEtBQUssYUFBYSxDQUFDLEVBQUU7SUFFOUUsSUFBSyxDQUFDQyxjQUFjSSxJQUFJLENBQUNDLFNBQVMsRUFBRztRQUNuQ0wsY0FBY0ksSUFBSSxDQUFDQyxTQUFTLEdBQUc7UUFDL0JULEdBQUdVLGFBQWEsQ0FBRSxDQUFDLEdBQUcsRUFBRVAsS0FBSyxhQUFhLENBQUMsRUFBRUUsS0FBS00sU0FBUyxDQUFFUCxlQUFlLE1BQU07UUFFbEYsTUFBTVIsT0FBUU8sTUFBTTtRQUNwQixNQUFNTCxVQUFXSyxNQUFNO1FBQ3ZCLE1BQU1KLFFBQVNJLE1BQU07SUFDdkI7QUFDRiJ9