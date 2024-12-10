// Copyright 2017, University of Colorado Boulder
/**
 * Returns the branch (if any) that the repository is on.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ const execute = require('./execute').default;
/**
 * Returns the branch (if any) that the repository is on.
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise} - Resolves to the branch name (or the empty string if not on a branch)
 */ module.exports = function(repo) {
    return execute('git', [
        'symbolic-ref',
        '-q',
        'HEAD'
    ], `../${repo}`).then((stdout)=>stdout.trim().replace('refs/heads/', ''));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2V0QnJhbmNoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBicmFuY2ggKGlmIGFueSkgdGhhdCB0aGUgcmVwb3NpdG9yeSBpcyBvbi5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBicmFuY2ggKGlmIGFueSkgdGhhdCB0aGUgcmVwb3NpdG9yeSBpcyBvbi5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlfSAtIFJlc29sdmVzIHRvIHRoZSBicmFuY2ggbmFtZSAob3IgdGhlIGVtcHR5IHN0cmluZyBpZiBub3Qgb24gYSBicmFuY2gpXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHJlcG8gKSB7XG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAnc3ltYm9saWMtcmVmJywgJy1xJywgJ0hFQUQnIF0sIGAuLi8ke3JlcG99YCApLnRoZW4oIHN0ZG91dCA9PiBzdGRvdXQudHJpbSgpLnJlcGxhY2UoICdyZWZzL2hlYWRzLycsICcnICkgKTtcbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwidGhlbiIsInN0ZG91dCIsInRyaW0iLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUU5Qzs7Ozs7O0NBTUMsR0FDREMsT0FBT0MsT0FBTyxHQUFHLFNBQVVDLElBQUk7SUFDN0IsT0FBT0wsUUFBUyxPQUFPO1FBQUU7UUFBZ0I7UUFBTTtLQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUVLLE1BQU0sRUFBR0MsSUFBSSxDQUFFQyxDQUFBQSxTQUFVQSxPQUFPQyxJQUFJLEdBQUdDLE9BQU8sQ0FBRSxlQUFlO0FBQ2hJIn0=