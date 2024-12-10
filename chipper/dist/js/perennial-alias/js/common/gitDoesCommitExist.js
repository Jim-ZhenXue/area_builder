// Copyright 2021, University of Colorado Boulder
/**
 * Checks whether a git commit exists (locally) in a repo
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
/**
 * Executes git commit
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} sha - The SHA of the commit
 * @returns {Promise.<boolean>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, sha) {
    const result = yield execute('git', [
        'cat-file',
        '-e',
        sha
    ], `../${repo}`, {
        errors: 'resolve'
    });
    if (result.code === 0) {
        return true;
    } else if (result.code === 1) {
        return false;
    } else {
        throw new Error(`Non-zero and non-one exit code from git cat-file: ${result}`);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZ2l0RG9lc0NvbW1pdEV4aXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdCBjb21taXQgZXhpc3RzIChsb2NhbGx5KSBpbiBhIHJlcG9cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcblxuLyoqXG4gKiBFeGVjdXRlcyBnaXQgY29tbWl0XG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gc2hhIC0gVGhlIFNIQSBvZiB0aGUgY29tbWl0XG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIHNoYSApIHtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2F0LWZpbGUnLCAnLWUnLCBzaGEgXSwgYC4uLyR7cmVwb31gLCB7XG4gICAgZXJyb3JzOiAncmVzb2x2ZSdcbiAgfSApO1xuXG4gIGlmICggcmVzdWx0LmNvZGUgPT09IDAgKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZWxzZSBpZiAoIHJlc3VsdC5jb2RlID09PSAxICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBOb24temVybyBhbmQgbm9uLW9uZSBleGl0IGNvZGUgZnJvbSBnaXQgY2F0LWZpbGU6ICR7cmVzdWx0fWAgKTtcbiAgfVxufTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJzaGEiLCJyZXN1bHQiLCJlcnJvcnMiLCJjb2RlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUU5Qzs7Ozs7OztDQU9DLEdBQ0RDLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLElBQUksRUFBRUMsR0FBRztJQUV4QyxNQUFNQyxTQUFTLE1BQU1QLFFBQVMsT0FBTztRQUFFO1FBQVk7UUFBTU07S0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFRCxNQUFNLEVBQUU7UUFDNUVHLFFBQVE7SUFDVjtJQUVBLElBQUtELE9BQU9FLElBQUksS0FBSyxHQUFJO1FBQ3ZCLE9BQU87SUFDVCxPQUNLLElBQUtGLE9BQU9FLElBQUksS0FBSyxHQUFJO1FBQzVCLE9BQU87SUFDVCxPQUNLO1FBQ0gsTUFBTSxJQUFJQyxNQUFPLENBQUMsa0RBQWtELEVBQUVILFFBQVE7SUFDaEY7QUFDRiJ9