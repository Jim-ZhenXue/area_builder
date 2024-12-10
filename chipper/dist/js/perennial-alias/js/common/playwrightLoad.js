// Copyright 2023, University of Colorado Boulder
/**
 * Uses playwright to see whether a page loads without an error. Throws errors it receives
 *
 * Defaults to using firefox, but you can provide any playwright browser for this
 *
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
const playwright = require('playwright');
const _ = require('lodash');
/**
 * @public
 *
 * Rejects if encountering an error loading the page OR (with option provided within the puppeteer page itself).
 *
 * @param {string} url
 * @param {Object} [options] - see browserPageLoad
 * @returns {Promise.<null|*>} - The eval result/null
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(url, options) {
    options = _.merge({
        testingBrowserCreator: playwright.firefox
    }, options);
    return browserPageLoad(options.testingBrowserCreator, url, options);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcGxheXdyaWdodExvYWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVzZXMgcGxheXdyaWdodCB0byBzZWUgd2hldGhlciBhIHBhZ2UgbG9hZHMgd2l0aG91dCBhbiBlcnJvci4gVGhyb3dzIGVycm9ycyBpdCByZWNlaXZlc1xuICpcbiAqIERlZmF1bHRzIHRvIHVzaW5nIGZpcmVmb3gsIGJ1dCB5b3UgY2FuIHByb3ZpZGUgYW55IHBsYXl3cmlnaHQgYnJvd3NlciBmb3IgdGhpc1xuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBicm93c2VyUGFnZUxvYWQgPSByZXF1aXJlKCAnLi9icm93c2VyUGFnZUxvYWQnICk7XG5jb25zdCBwbGF5d3JpZ2h0ID0gcmVxdWlyZSggJ3BsYXl3cmlnaHQnICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcblxuLyoqXG4gKiBAcHVibGljXG4gKlxuICogUmVqZWN0cyBpZiBlbmNvdW50ZXJpbmcgYW4gZXJyb3IgbG9hZGluZyB0aGUgcGFnZSBPUiAod2l0aCBvcHRpb24gcHJvdmlkZWQgd2l0aGluIHRoZSBwdXBwZXRlZXIgcGFnZSBpdHNlbGYpLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBzZWUgYnJvd3NlclBhZ2VMb2FkXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48bnVsbHwqPn0gLSBUaGUgZXZhbCByZXN1bHQvbnVsbFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCB1cmwsIG9wdGlvbnMgKSB7XG4gIG9wdGlvbnMgPSBfLm1lcmdlKCB7XG4gICAgdGVzdGluZ0Jyb3dzZXJDcmVhdG9yOiBwbGF5d3JpZ2h0LmZpcmVmb3hcbiAgfSwgb3B0aW9ucyApO1xuICByZXR1cm4gYnJvd3NlclBhZ2VMb2FkKCBvcHRpb25zLnRlc3RpbmdCcm93c2VyQ3JlYXRvciwgdXJsLCBvcHRpb25zICk7XG59OyJdLCJuYW1lcyI6WyJicm93c2VyUGFnZUxvYWQiLCJyZXF1aXJlIiwicGxheXdyaWdodCIsIl8iLCJtb2R1bGUiLCJleHBvcnRzIiwidXJsIiwib3B0aW9ucyIsIm1lcmdlIiwidGVzdGluZ0Jyb3dzZXJDcmVhdG9yIiwiZmlyZWZveCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxrQkFBa0JDLFFBQVM7QUFDakMsTUFBTUMsYUFBYUQsUUFBUztBQUM1QixNQUFNRSxJQUFJRixRQUFTO0FBRW5COzs7Ozs7OztDQVFDLEdBQ0RHLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLEdBQUcsRUFBRUMsT0FBTztJQUMzQ0EsVUFBVUosRUFBRUssS0FBSyxDQUFFO1FBQ2pCQyx1QkFBdUJQLFdBQVdRLE9BQU87SUFDM0MsR0FBR0g7SUFDSCxPQUFPUCxnQkFBaUJPLFFBQVFFLHFCQUFxQixFQUFFSCxLQUFLQztBQUM5RCJ9