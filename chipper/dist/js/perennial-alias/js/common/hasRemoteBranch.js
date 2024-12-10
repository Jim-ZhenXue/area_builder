// Copyright 2017, University of Colorado Boulder
/**
 * Whether there is a remote branch for a given repo.
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
 * Whether there is a remote branch for a given repo.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The potential branch
 * @returns {Promise.<boolean>} - Whether there was the branch on the remote server
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, branch) {
    winston.debug(`checking for remote branch ${branch} for ${repo}`);
    const stdout = yield execute('git', [
        'ls-remote',
        '--heads',
        `https://github.com/phetsims/${repo}.git`,
        branch
    ], `../${repo}`);
    if (stdout.trim().length === 0) {
        return false;
    } else if (stdout.indexOf(`refs/heads/${branch}`) >= 0) {
        return true;
    } else {
        throw new Error(`Failure trying to check for a remote branch ${branch} for ${repo}`);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaGFzUmVtb3RlQnJhbmNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXaGV0aGVyIHRoZXJlIGlzIGEgcmVtb3RlIGJyYW5jaCBmb3IgYSBnaXZlbiByZXBvLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIFdoZXRoZXIgdGhlcmUgaXMgYSByZW1vdGUgYnJhbmNoIGZvciBhIGdpdmVuIHJlcG8uXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gVGhlIHBvdGVudGlhbCBicmFuY2hcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn0gLSBXaGV0aGVyIHRoZXJlIHdhcyB0aGUgYnJhbmNoIG9uIHRoZSByZW1vdGUgc2VydmVyXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIGJyYW5jaCApIHtcbiAgd2luc3Rvbi5kZWJ1ZyggYGNoZWNraW5nIGZvciByZW1vdGUgYnJhbmNoICR7YnJhbmNofSBmb3IgJHtyZXBvfWAgKTtcblxuICBjb25zdCBzdGRvdXQgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnbHMtcmVtb3RlJywgJy0taGVhZHMnLCBgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zLyR7cmVwb30uZ2l0YCwgYnJhbmNoIF0sIGAuLi8ke3JlcG99YCApO1xuXG4gIGlmICggc3Rkb3V0LnRyaW0oKS5sZW5ndGggPT09IDAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGVsc2UgaWYgKCBzdGRvdXQuaW5kZXhPZiggYHJlZnMvaGVhZHMvJHticmFuY2h9YCApID49IDAgKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgRmFpbHVyZSB0cnlpbmcgdG8gY2hlY2sgZm9yIGEgcmVtb3RlIGJyYW5jaCAke2JyYW5jaH0gZm9yICR7cmVwb31gICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5jaCIsImRlYnVnIiwic3Rkb3V0IiwidHJpbSIsImxlbmd0aCIsImluZGV4T2YiLCJFcnJvciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsVUFBVUMsUUFBUyxhQUFjQyxPQUFPO0FBQzlDLE1BQU1DLFVBQVVGLFFBQVM7QUFFekI7Ozs7Ozs7Q0FPQyxHQUNERyxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLE1BQU07SUFDM0NKLFFBQVFLLEtBQUssQ0FBRSxDQUFDLDJCQUEyQixFQUFFRCxPQUFPLEtBQUssRUFBRUQsTUFBTTtJQUVqRSxNQUFNRyxTQUFTLE1BQU1ULFFBQVMsT0FBTztRQUFFO1FBQWE7UUFBVyxDQUFDLDRCQUE0QixFQUFFTSxLQUFLLElBQUksQ0FBQztRQUFFQztLQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUVELE1BQU07SUFFaEksSUFBS0csT0FBT0MsSUFBSSxHQUFHQyxNQUFNLEtBQUssR0FBSTtRQUNoQyxPQUFPO0lBQ1QsT0FDSyxJQUFLRixPQUFPRyxPQUFPLENBQUUsQ0FBQyxXQUFXLEVBQUVMLFFBQVEsS0FBTSxHQUFJO1FBQ3hELE9BQU87SUFDVCxPQUNLO1FBQ0gsTUFBTSxJQUFJTSxNQUFPLENBQUMsNENBQTRDLEVBQUVOLE9BQU8sS0FBSyxFQUFFRCxNQUFNO0lBQ3RGO0FBQ0YifQ==