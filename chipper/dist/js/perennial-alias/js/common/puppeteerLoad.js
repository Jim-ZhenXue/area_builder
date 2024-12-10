// Copyright 2023, University of Colorado Boulder
/**
 * Uses puppeteer to see whether a page loads without an error. Throws errors it receives
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
const browserPageLoad = require('./browserPageLoad');
const puppeteer = require('puppeteer');
/**
 * Uses puppeteer to see whether a page loads without an error
 * @public
 *
 * Rejects if encountering an error loading the page OR (with option provided within the puppeteer page itself).
 *
 * @param {string} url
 * @param {Object} [options] - see browserPageLoad
 * @returns {Promise.<null|*>} - The eval result/null
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(url, options) {
    return browserPageLoad(puppeteer, url, options);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcHVwcGV0ZWVyTG9hZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXNlcyBwdXBwZXRlZXIgdG8gc2VlIHdoZXRoZXIgYSBwYWdlIGxvYWRzIHdpdGhvdXQgYW4gZXJyb3IuIFRocm93cyBlcnJvcnMgaXQgcmVjZWl2ZXNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgYnJvd3NlclBhZ2VMb2FkID0gcmVxdWlyZSggJy4vYnJvd3NlclBhZ2VMb2FkJyApO1xuY29uc3QgcHVwcGV0ZWVyID0gcmVxdWlyZSggJ3B1cHBldGVlcicgKTtcblxuLyoqXG4gKiBVc2VzIHB1cHBldGVlciB0byBzZWUgd2hldGhlciBhIHBhZ2UgbG9hZHMgd2l0aG91dCBhbiBlcnJvclxuICogQHB1YmxpY1xuICpcbiAqIFJlamVjdHMgaWYgZW5jb3VudGVyaW5nIGFuIGVycm9yIGxvYWRpbmcgdGhlIHBhZ2UgT1IgKHdpdGggb3B0aW9uIHByb3ZpZGVkIHdpdGhpbiB0aGUgcHVwcGV0ZWVyIHBhZ2UgaXRzZWxmKS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gc2VlIGJyb3dzZXJQYWdlTG9hZFxuICogQHJldHVybnMge1Byb21pc2UuPG51bGx8Kj59IC0gVGhlIGV2YWwgcmVzdWx0L251bGxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggdXJsLCBvcHRpb25zICkge1xuICByZXR1cm4gYnJvd3NlclBhZ2VMb2FkKCBwdXBwZXRlZXIsIHVybCwgb3B0aW9ucyApO1xufTsiXSwibmFtZXMiOlsiYnJvd3NlclBhZ2VMb2FkIiwicmVxdWlyZSIsInB1cHBldGVlciIsIm1vZHVsZSIsImV4cG9ydHMiLCJ1cmwiLCJvcHRpb25zIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsa0JBQWtCQyxRQUFTO0FBQ2pDLE1BQU1DLFlBQVlELFFBQVM7QUFFM0I7Ozs7Ozs7OztDQVNDLEdBQ0RFLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLEdBQUcsRUFBRUMsT0FBTztJQUMzQyxPQUFPTixnQkFBaUJFLFdBQVdHLEtBQUtDO0FBQzFDIn0=