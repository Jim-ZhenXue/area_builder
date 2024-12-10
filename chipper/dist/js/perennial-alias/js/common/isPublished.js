// Copyright 2022, University of Colorado Boulder
/**
 * Returns whether a repo is published (not a prototype)
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
const gitCheckout = require('./gitCheckout');
const fs = require('fs');
/**
 * Returns whether a repo is published (not a prototype)
 * @public
 *
 * NOTE: Needs to be on main branch
 *
 * @param {string} repo
 *
 * @returns {Promise<boolean>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    var _packageObject_phet;
    yield gitCheckout(repo, 'main');
    const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
    return !!(packageObject == null ? void 0 : (_packageObject_phet = packageObject.phet) == null ? void 0 : _packageObject_phet.published);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaXNQdWJsaXNoZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBhIHJlcG8gaXMgcHVibGlzaGVkIChub3QgYSBwcm90b3R5cGUpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4vZ2l0Q2hlY2tvdXQnICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgYSByZXBvIGlzIHB1Ymxpc2hlZCAobm90IGEgcHJvdG90eXBlKVxuICogQHB1YmxpY1xuICpcbiAqIE5PVEU6IE5lZWRzIHRvIGJlIG9uIG1haW4gYnJhbmNoXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sICdtYWluJyApO1xuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xuXG4gIHJldHVybiAhIXBhY2thZ2VPYmplY3Q/LnBoZXQ/LnB1Ymxpc2hlZDtcbn07Il0sIm5hbWVzIjpbImdpdENoZWNrb3V0IiwicmVxdWlyZSIsImZzIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwicGhldCIsInB1Ymxpc2hlZCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsY0FBY0MsUUFBUztBQUM3QixNQUFNQyxLQUFLRCxRQUFTO0FBRXBCOzs7Ozs7Ozs7Q0FTQyxHQUNERSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJO1FBSTFCQztJQUhULE1BQU1OLFlBQWFLLE1BQU07SUFDekIsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVOLEdBQUdPLFlBQVksQ0FBRSxDQUFDLEdBQUcsRUFBRUosS0FBSyxhQUFhLENBQUMsRUFBRTtJQUU5RSxPQUFPLENBQUMsRUFBQ0Msa0NBQUFBLHNCQUFBQSxjQUFlSSxJQUFJLHFCQUFuQkosb0JBQXFCSyxTQUFTO0FBQ3pDIn0=