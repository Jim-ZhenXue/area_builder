// Copyright 2020, University of Colorado Boulder
/**
 * Asynchronously checks whether a repo is not up-to-date with origin/main
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
const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');
/**
 * Asynchronously checks whether a repo is not up-to-date with origin/main
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<boolean>}
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    const currentSHA = yield gitRevParse(repo, 'main');
    const remoteSHA = (yield getRemoteBranchSHAs(repo)).main;
    return currentSHA !== remoteSHA;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaXNTdGFsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXN5bmNocm9ub3VzbHkgY2hlY2tzIHdoZXRoZXIgYSByZXBvIGlzIG5vdCB1cC10by1kYXRlIHdpdGggb3JpZ2luL21haW5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZ2V0UmVtb3RlQnJhbmNoU0hBcyA9IHJlcXVpcmUoICcuL2dldFJlbW90ZUJyYW5jaFNIQXMnICk7XG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuL2dpdFJldlBhcnNlJyApO1xuXG4vKipcbiAqIEFzeW5jaHJvbm91c2x5IGNoZWNrcyB3aGV0aGVyIGEgcmVwbyBpcyBub3QgdXAtdG8tZGF0ZSB3aXRoIG9yaWdpbi9tYWluXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvICkge1xuICBjb25zdCBjdXJyZW50U0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHJlcG8sICdtYWluJyApO1xuICBjb25zdCByZW1vdGVTSEEgPSAoIGF3YWl0IGdldFJlbW90ZUJyYW5jaFNIQXMoIHJlcG8gKSApLm1haW47XG5cbiAgcmV0dXJuIGN1cnJlbnRTSEEgIT09IHJlbW90ZVNIQTtcbn07Il0sIm5hbWVzIjpbImdldFJlbW90ZUJyYW5jaFNIQXMiLCJyZXF1aXJlIiwiZ2l0UmV2UGFyc2UiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImN1cnJlbnRTSEEiLCJyZW1vdGVTSEEiLCJtYWluIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxzQkFBc0JDLFFBQVM7QUFDckMsTUFBTUMsY0FBY0QsUUFBUztBQUU3Qjs7Ozs7OztDQU9DLEdBQ0RFLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUk7SUFDbkMsTUFBTUMsYUFBYSxNQUFNSixZQUFhRyxNQUFNO0lBQzVDLE1BQU1FLFlBQVksQUFBRSxDQUFBLE1BQU1QLG9CQUFxQkssS0FBSyxFQUFJRyxJQUFJO0lBRTVELE9BQU9GLGVBQWVDO0FBQ3hCIn0=