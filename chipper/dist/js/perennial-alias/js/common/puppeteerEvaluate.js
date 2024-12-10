// Copyright 2017, University of Colorado Boulder
/**
 * Uses puppeteer to load a page, evaluate some Javascript, and then returns the result
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
const puppeteerLoad = require('./puppeteerLoad');
const _ = require('lodash');
/**
 * Uses puppeteer to load a page, evaluate some Javascript, and then returns the result
 * @public
 *
 * @param {string} url
 * @param {function} evalute - run in the browser
 * @param {Object} [options]
 * @returns {Promise.<*>} - Will reject if there's an error
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(url, evaluate, options) {
    options = _.assignIn({
        evaluate: evaluate
    }, options);
    return puppeteerLoad(url, options);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcHVwcGV0ZWVyRXZhbHVhdGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVzZXMgcHVwcGV0ZWVyIHRvIGxvYWQgYSBwYWdlLCBldmFsdWF0ZSBzb21lIEphdmFzY3JpcHQsIGFuZCB0aGVuIHJldHVybnMgdGhlIHJlc3VsdFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBwdXBwZXRlZXJMb2FkID0gcmVxdWlyZSggJy4vcHVwcGV0ZWVyTG9hZCcgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG4vKipcbiAqIFVzZXMgcHVwcGV0ZWVyIHRvIGxvYWQgYSBwYWdlLCBldmFsdWF0ZSBzb21lIEphdmFzY3JpcHQsIGFuZCB0aGVuIHJldHVybnMgdGhlIHJlc3VsdFxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGV2YWx1dGUgLSBydW4gaW4gdGhlIGJyb3dzZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHtQcm9taXNlLjwqPn0gLSBXaWxsIHJlamVjdCBpZiB0aGVyZSdzIGFuIGVycm9yXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHVybCwgZXZhbHVhdGUsIG9wdGlvbnMgKSB7XG4gIG9wdGlvbnMgPSBfLmFzc2lnbkluKCB7XG4gICAgZXZhbHVhdGU6IGV2YWx1YXRlXG4gIH0sIG9wdGlvbnMgKTtcblxuICByZXR1cm4gcHVwcGV0ZWVyTG9hZCggdXJsLCBvcHRpb25zICk7XG59OyJdLCJuYW1lcyI6WyJwdXBwZXRlZXJMb2FkIiwicmVxdWlyZSIsIl8iLCJtb2R1bGUiLCJleHBvcnRzIiwidXJsIiwiZXZhbHVhdGUiLCJvcHRpb25zIiwiYXNzaWduSW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLGdCQUFnQkMsUUFBUztBQUMvQixNQUFNQyxJQUFJRCxRQUFTO0FBRW5COzs7Ozs7OztDQVFDLEdBQ0RFLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLEdBQUcsRUFBRUMsUUFBUSxFQUFFQyxPQUFPO0lBQ3JEQSxVQUFVTCxFQUFFTSxRQUFRLENBQUU7UUFDcEJGLFVBQVVBO0lBQ1osR0FBR0M7SUFFSCxPQUFPUCxjQUFlSyxLQUFLRTtBQUM3QiJ9