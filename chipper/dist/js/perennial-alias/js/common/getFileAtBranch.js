// Copyright 2023, University of Colorado Boulder
/**
 * Gets the dependencies.json from a given branch of a repo
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
const getGitFile = require('./getGitFile');
const createLocalBranchFromRemote = require('./createLocalBranchFromRemote');
/**
 * Gets the dependencies.json from a given branch of a repo
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch name
 * @param {string} filename - The file name
 * @returns {Promise} - Resolves to the file contents
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ function() {
    var _getFileAtBranch = _async_to_generator(function*(repo, branch, filename) {
        try {
            return yield getGitFile(repo, branch, filename);
        } catch (e) {
            if (e.message.includes('invalid object name') && e.message.includes(branch)) {
                yield createLocalBranchFromRemote(repo, branch);
                return getGitFile(repo, branch, filename);
            } else {
                throw e;
            }
        }
    });
    function getFileAtBranch(repo, branch, filename) {
        return _getFileAtBranch.apply(this, arguments);
    }
    return getFileAtBranch;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0RmlsZUF0QnJhbmNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZXRzIHRoZSBkZXBlbmRlbmNpZXMuanNvbiBmcm9tIGEgZ2l2ZW4gYnJhbmNoIG9mIGEgcmVwb1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnZXRHaXRGaWxlID0gcmVxdWlyZSggJy4vZ2V0R2l0RmlsZScgKTtcbmNvbnN0IGNyZWF0ZUxvY2FsQnJhbmNoRnJvbVJlbW90ZSA9IHJlcXVpcmUoICcuL2NyZWF0ZUxvY2FsQnJhbmNoRnJvbVJlbW90ZScgKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkZXBlbmRlbmNpZXMuanNvbiBmcm9tIGEgZ2l2ZW4gYnJhbmNoIG9mIGEgcmVwb1xuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaCAtIFRoZSBicmFuY2ggbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lIC0gVGhlIGZpbGUgbmFtZVxuICogQHJldHVybnMge1Byb21pc2V9IC0gUmVzb2x2ZXMgdG8gdGhlIGZpbGUgY29udGVudHNcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gZ2V0RmlsZUF0QnJhbmNoKCByZXBvLCBicmFuY2gsIGZpbGVuYW1lICkge1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGdldEdpdEZpbGUoIHJlcG8sIGJyYW5jaCwgZmlsZW5hbWUgKTtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICBpZiAoIGUubWVzc2FnZS5pbmNsdWRlcyggJ2ludmFsaWQgb2JqZWN0IG5hbWUnICkgJiYgZS5tZXNzYWdlLmluY2x1ZGVzKCBicmFuY2ggKSApIHtcblxuICAgICAgYXdhaXQgY3JlYXRlTG9jYWxCcmFuY2hGcm9tUmVtb3RlKCByZXBvLCBicmFuY2ggKTtcbiAgICAgIHJldHVybiBnZXRHaXRGaWxlKCByZXBvLCBicmFuY2gsIGZpbGVuYW1lICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn07Il0sIm5hbWVzIjpbImdldEdpdEZpbGUiLCJyZXF1aXJlIiwiY3JlYXRlTG9jYWxCcmFuY2hGcm9tUmVtb3RlIiwibW9kdWxlIiwiZXhwb3J0cyIsImdldEZpbGVBdEJyYW5jaCIsInJlcG8iLCJicmFuY2giLCJmaWxlbmFtZSIsImUiLCJtZXNzYWdlIiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGFBQWFDLFFBQVM7QUFDNUIsTUFBTUMsOEJBQThCRCxRQUFTO0FBRTdDOzs7Ozs7Ozs7Q0FTQyxHQUNERSxPQUFPQyxPQUFPO1FBQWtCQyxtQkFBZixvQkFBQSxVQUFnQ0MsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLFFBQVE7UUFFckUsSUFBSTtZQUNGLE9BQU8sTUFBTVIsV0FBWU0sTUFBTUMsUUFBUUM7UUFDekMsRUFDQSxPQUFPQyxHQUFJO1lBQ1QsSUFBS0EsRUFBRUMsT0FBTyxDQUFDQyxRQUFRLENBQUUsMEJBQTJCRixFQUFFQyxPQUFPLENBQUNDLFFBQVEsQ0FBRUosU0FBVztnQkFFakYsTUFBTUwsNEJBQTZCSSxNQUFNQztnQkFDekMsT0FBT1AsV0FBWU0sTUFBTUMsUUFBUUM7WUFDbkMsT0FDSztnQkFDSCxNQUFNQztZQUNSO1FBQ0Y7SUFDRjthQWZnQ0osZ0JBQWlCQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsUUFBUTtlQUF2Q0g7O1dBQUFBIn0=