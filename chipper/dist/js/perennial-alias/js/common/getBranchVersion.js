// Copyright 2023, University of Colorado Boulder
/**
 * Returns the version of the repo's package.json on a given branch
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
const SimVersion = require('../browser-and-node/SimVersion').default;
const getFileAtBranch = require('./getFileAtBranch');
const winston = require('winston');
/**
 * Returns the version of the repo's package.json on a given branch
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch name
 * @returns {Promise.<SimVersion>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, branch) {
    winston.debug(`Reading version from package.json for ${repo}`);
    return SimVersion.parse(JSON.parse((yield getFileAtBranch(repo, branch, 'package.json'))).version);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnJhbmNoVmVyc2lvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0dXJucyB0aGUgdmVyc2lvbiBvZiB0aGUgcmVwbydzIHBhY2thZ2UuanNvbiBvbiBhIGdpdmVuIGJyYW5jaFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3QgZ2V0RmlsZUF0QnJhbmNoID0gcmVxdWlyZSggJy4vZ2V0RmlsZUF0QnJhbmNoJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZlcnNpb24gb2YgdGhlIHJlcG8ncyBwYWNrYWdlLmpzb24gb24gYSBnaXZlbiBicmFuY2hcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxTaW1WZXJzaW9uPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgYnJhbmNoICkge1xuICB3aW5zdG9uLmRlYnVnKCBgUmVhZGluZyB2ZXJzaW9uIGZyb20gcGFja2FnZS5qc29uIGZvciAke3JlcG99YCApO1xuXG4gIHJldHVybiBTaW1WZXJzaW9uLnBhcnNlKCBKU09OLnBhcnNlKCBhd2FpdCBnZXRGaWxlQXRCcmFuY2goIHJlcG8sIGJyYW5jaCwgJ3BhY2thZ2UuanNvbicgKSApLnZlcnNpb24gKTtcbn07Il0sIm5hbWVzIjpbIlNpbVZlcnNpb24iLCJyZXF1aXJlIiwiZGVmYXVsdCIsImdldEZpbGVBdEJyYW5jaCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5jaCIsImRlYnVnIiwicGFyc2UiLCJKU09OIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsYUFBYUMsUUFBUyxrQ0FBbUNDLE9BQU87QUFDdEUsTUFBTUMsa0JBQWtCRixRQUFTO0FBQ2pDLE1BQU1HLFVBQVVILFFBQVM7QUFFekI7Ozs7Ozs7Q0FPQyxHQUNESSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLE1BQU07SUFDM0NKLFFBQVFLLEtBQUssQ0FBRSxDQUFDLHNDQUFzQyxFQUFFRixNQUFNO0lBRTlELE9BQU9QLFdBQVdVLEtBQUssQ0FBRUMsS0FBS0QsS0FBSyxDQUFFLENBQUEsTUFBTVAsZ0JBQWlCSSxNQUFNQyxRQUFRLGVBQWUsR0FBSUksT0FBTztBQUN0RyJ9