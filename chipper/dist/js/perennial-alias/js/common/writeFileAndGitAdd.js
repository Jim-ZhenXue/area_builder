// Copyright 2022, University of Colorado Boulder
/**
 * Writes a file with grunt and adds it to git.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
const gitIsClean = require('./gitIsClean');
const grunt = require('grunt');
const isGitRepo = require('./isGitRepo');
/**
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} filePath - File name and potentially path relative to the repo
 * @param {string} content - The content of the file as a string
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, filePath, content) {
    const outputFile = `../${repo}/${filePath}`;
    grunt.file.write(outputFile, content);
    if (yield isGitRepo(repo)) {
        const fileClean = yield gitIsClean(repo, filePath);
        if (!fileClean) {
            yield gitAdd(repo, filePath);
        }
    } else {
        console.warn(`${repo} is not a git repository. Skipping gitAdd.`);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd3JpdGVGaWxlQW5kR2l0QWRkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXcml0ZXMgYSBmaWxlIHdpdGggZ3J1bnQgYW5kIGFkZHMgaXQgdG8gZ2l0LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IGdpdEFkZCA9IHJlcXVpcmUoICcuL2dpdEFkZCcgKTtcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XG5jb25zdCBpc0dpdFJlcG8gPSByZXF1aXJlKCAnLi9pc0dpdFJlcG8nICk7XG5cbi8qKlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gRmlsZSBuYW1lIGFuZCBwb3RlbnRpYWxseSBwYXRoIHJlbGF0aXZlIHRvIHRoZSByZXBvXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCAtIFRoZSBjb250ZW50IG9mIHRoZSBmaWxlIGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn0gLSBTdGRvdXRcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIGZpbGVQYXRoLCBjb250ZW50ICkge1xuICBjb25zdCBvdXRwdXRGaWxlID0gYC4uLyR7cmVwb30vJHtmaWxlUGF0aH1gO1xuICBncnVudC5maWxlLndyaXRlKCBvdXRwdXRGaWxlLCBjb250ZW50ICk7XG5cbiAgaWYgKCBhd2FpdCBpc0dpdFJlcG8oIHJlcG8gKSApIHtcbiAgICBjb25zdCBmaWxlQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvLCBmaWxlUGF0aCApO1xuICAgIGlmICggIWZpbGVDbGVhbiApIHtcbiAgICAgIGF3YWl0IGdpdEFkZCggcmVwbywgZmlsZVBhdGggKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uc29sZS53YXJuKCBgJHtyZXBvfSBpcyBub3QgYSBnaXQgcmVwb3NpdG9yeS4gU2tpcHBpbmcgZ2l0QWRkLmAgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiZ2l0QWRkIiwicmVxdWlyZSIsImdpdElzQ2xlYW4iLCJncnVudCIsImlzR2l0UmVwbyIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiZmlsZVBhdGgiLCJjb250ZW50Iiwib3V0cHV0RmlsZSIsImZpbGUiLCJ3cml0ZSIsImZpbGVDbGVhbiIsImNvbnNvbGUiLCJ3YXJuIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxTQUFTQyxRQUFTO0FBQ3hCLE1BQU1DLGFBQWFELFFBQVM7QUFDNUIsTUFBTUUsUUFBUUYsUUFBUztBQUN2QixNQUFNRyxZQUFZSCxRQUFTO0FBRTNCOzs7Ozs7OztDQVFDLEdBQ0RJLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxPQUFPO0lBQ3RELE1BQU1DLGFBQWEsQ0FBQyxHQUFHLEVBQUVILEtBQUssQ0FBQyxFQUFFQyxVQUFVO0lBQzNDTCxNQUFNUSxJQUFJLENBQUNDLEtBQUssQ0FBRUYsWUFBWUQ7SUFFOUIsSUFBSyxNQUFNTCxVQUFXRyxPQUFTO1FBQzdCLE1BQU1NLFlBQVksTUFBTVgsV0FBWUssTUFBTUM7UUFDMUMsSUFBSyxDQUFDSyxXQUFZO1lBQ2hCLE1BQU1iLE9BQVFPLE1BQU1DO1FBQ3RCO0lBQ0YsT0FDSztRQUNITSxRQUFRQyxJQUFJLENBQUUsR0FBR1IsS0FBSywwQ0FBMEMsQ0FBQztJQUNuRTtBQUNGIn0=