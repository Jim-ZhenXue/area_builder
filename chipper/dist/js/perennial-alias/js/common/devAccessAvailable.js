// Copyright 2018, University of Colorado Boulder
/**
 * Checks whether access to the dev server is available (usually unavailable if not on VPN or on campus)
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
const devSsh = require('./devSsh');
/**
 * Checks whether access to the dev server is available (usually unavailable if not on VPN or on campus)
 * @public
 *
 * @returns {Promise.<boolean>} - Whether the directory exists
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*() {
    try {
        yield devSsh('ls');
        return true;
    } catch (e) {
        return false;
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZGV2QWNjZXNzQXZhaWxhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhY2Nlc3MgdG8gdGhlIGRldiBzZXJ2ZXIgaXMgYXZhaWxhYmxlICh1c3VhbGx5IHVuYXZhaWxhYmxlIGlmIG5vdCBvbiBWUE4gb3Igb24gY2FtcHVzKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBkZXZTc2ggPSByZXF1aXJlKCAnLi9kZXZTc2gnICk7XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYWNjZXNzIHRvIHRoZSBkZXYgc2VydmVyIGlzIGF2YWlsYWJsZSAodXN1YWxseSB1bmF2YWlsYWJsZSBpZiBub3Qgb24gVlBOIG9yIG9uIGNhbXB1cylcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59IC0gV2hldGhlciB0aGUgZGlyZWN0b3J5IGV4aXN0c1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIGF3YWl0IGRldlNzaCggJ2xzJyApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNhdGNoKCBlICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTsiXSwibmFtZXMiOlsiZGV2U3NoIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxTQUFTQyxRQUFTO0FBRXhCOzs7OztDQUtDLEdBQ0RDLE9BQU9DLE9BQU8scUNBQUc7SUFDZixJQUFJO1FBQ0YsTUFBTUgsT0FBUTtRQUNkLE9BQU87SUFDVCxFQUNBLE9BQU9JLEdBQUk7UUFDVCxPQUFPO0lBQ1Q7QUFDRiJ9