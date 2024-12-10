// Copyright 2018, University of Colorado Boulder
/**
 * Checks whether a sim branch's dependency has an ancestor commit in its tree.
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
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitIsAncestor = require('./gitIsAncestor');
const winston = require('winston');
/**
 * Checks whether a sim branch's dependency has an ancestor commit in its tree.
 * @public
 *
 * @param {string} sim
 * @param {string} branch
 * @param {string} repo
 * @param {string} sha
 * @returns {Promise.<boolean>} - Whether it is an ancestor or not
 * @rejects {ExecuteError}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(sim, branch, repo, sha) {
    winston.info(`Checking whether ${repo} has commit ${sha} in its tree for the branch ${branch} of ${sim}`);
    yield gitCheckout(sim, branch);
    const dependencies = yield getDependencies(sim);
    if (!dependencies[repo]) {
        return false;
    }
    const repoSHA = dependencies[repo].sha;
    const isAncestor = yield gitIsAncestor(repo, sha, repoSHA);
    yield gitCheckout(sim, 'main');
    return isAncestor;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaGFzQW5jZXN0b3JPbkJyYW5jaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBzaW0gYnJhbmNoJ3MgZGVwZW5kZW5jeSBoYXMgYW4gYW5jZXN0b3IgY29tbWl0IGluIGl0cyB0cmVlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBnZXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9nZXREZXBlbmRlbmNpZXMnICk7XG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xuY29uc3QgZ2l0SXNBbmNlc3RvciA9IHJlcXVpcmUoICcuL2dpdElzQW5jZXN0b3InICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBzaW0gYnJhbmNoJ3MgZGVwZW5kZW5jeSBoYXMgYW4gYW5jZXN0b3IgY29tbWl0IGluIGl0cyB0cmVlLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzaW1cbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2hcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXG4gKiBAcGFyYW0ge3N0cmluZ30gc2hhXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59IC0gV2hldGhlciBpdCBpcyBhbiBhbmNlc3RvciBvciBub3RcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHNpbSwgYnJhbmNoLCByZXBvLCBzaGEgKSB7XG4gIHdpbnN0b24uaW5mbyggYENoZWNraW5nIHdoZXRoZXIgJHtyZXBvfSBoYXMgY29tbWl0ICR7c2hhfSBpbiBpdHMgdHJlZSBmb3IgdGhlIGJyYW5jaCAke2JyYW5jaH0gb2YgJHtzaW19YCApO1xuXG4gIGF3YWl0IGdpdENoZWNrb3V0KCBzaW0sIGJyYW5jaCApO1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoIHNpbSApO1xuXG4gIGlmICggIWRlcGVuZGVuY2llc1sgcmVwbyBdICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCByZXBvU0hBID0gZGVwZW5kZW5jaWVzWyByZXBvIF0uc2hhO1xuXG4gIGNvbnN0IGlzQW5jZXN0b3IgPSBhd2FpdCBnaXRJc0FuY2VzdG9yKCByZXBvLCBzaGEsIHJlcG9TSEEgKTtcbiAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHNpbSwgJ21haW4nICk7XG5cbiAgcmV0dXJuIGlzQW5jZXN0b3I7XG59OyJdLCJuYW1lcyI6WyJnZXREZXBlbmRlbmNpZXMiLCJyZXF1aXJlIiwiZ2l0Q2hlY2tvdXQiLCJnaXRJc0FuY2VzdG9yIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJzaW0iLCJicmFuY2giLCJyZXBvIiwic2hhIiwiaW5mbyIsImRlcGVuZGVuY2llcyIsInJlcG9TSEEiLCJpc0FuY2VzdG9yIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxrQkFBa0JDLFFBQVM7QUFDakMsTUFBTUMsY0FBY0QsUUFBUztBQUM3QixNQUFNRSxnQkFBZ0JGLFFBQVM7QUFDL0IsTUFBTUcsVUFBVUgsUUFBUztBQUV6Qjs7Ozs7Ozs7OztDQVVDLEdBQ0RJLE9BQU9DLE9BQU8scUNBQUcsVUFBZ0JDLEdBQUcsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEdBQUc7SUFDckROLFFBQVFPLElBQUksQ0FBRSxDQUFDLGlCQUFpQixFQUFFRixLQUFLLFlBQVksRUFBRUMsSUFBSSw0QkFBNEIsRUFBRUYsT0FBTyxJQUFJLEVBQUVELEtBQUs7SUFFekcsTUFBTUwsWUFBYUssS0FBS0M7SUFDeEIsTUFBTUksZUFBZSxNQUFNWixnQkFBaUJPO0lBRTVDLElBQUssQ0FBQ0ssWUFBWSxDQUFFSCxLQUFNLEVBQUc7UUFDM0IsT0FBTztJQUNUO0lBQ0EsTUFBTUksVUFBVUQsWUFBWSxDQUFFSCxLQUFNLENBQUNDLEdBQUc7SUFFeEMsTUFBTUksYUFBYSxNQUFNWCxjQUFlTSxNQUFNQyxLQUFLRztJQUNuRCxNQUFNWCxZQUFhSyxLQUFLO0lBRXhCLE9BQU9PO0FBQ1QifQ==