// Copyright 2018, University of Colorado Boulder
/**
 * Checks out a snapshot of a repo (and its dependencies) for a given timestamp/branch.
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
const checkoutDependencies = require('./checkoutDependencies');
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitFromTimestamp = require('./gitFromTimestamp');
const winston = require('winston');
/**
 * Checks out a snapshot of a repo (and its dependencies) for a given timestamp/branch.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} timestamp
 * @param {boolean} includeNpmUpdate
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, timestamp, includeNpmUpdate) {
    winston.info(`checking out timestamp for ${repo} at ${timestamp}`);
    yield gitCheckout(repo, (yield gitFromTimestamp(repo, 'main', timestamp)));
    const dependencies = yield getDependencies(repo);
    const dependencyNames = Object.keys(dependencies).filter((key)=>key !== 'comment' && key !== repo);
    const timestampDependencies = {};
    for (const dependency of dependencyNames){
        timestampDependencies[dependency] = {
            sha: yield gitFromTimestamp(dependency, 'main', timestamp)
        };
    }
    return checkoutDependencies(repo, timestampDependencies, includeNpmUpdate);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2hlY2tvdXRUaW1lc3RhbXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrcyBvdXQgYSBzbmFwc2hvdCBvZiBhIHJlcG8gKGFuZCBpdHMgZGVwZW5kZW5jaWVzKSBmb3IgYSBnaXZlbiB0aW1lc3RhbXAvYnJhbmNoLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBjaGVja291dERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2NoZWNrb3V0RGVwZW5kZW5jaWVzJyApO1xuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vZ2V0RGVwZW5kZW5jaWVzJyApO1xuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdEZyb21UaW1lc3RhbXAgPSByZXF1aXJlKCAnLi9naXRGcm9tVGltZXN0YW1wJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIENoZWNrcyBvdXQgYSBzbmFwc2hvdCBvZiBhIHJlcG8gKGFuZCBpdHMgZGVwZW5kZW5jaWVzKSBmb3IgYSBnaXZlbiB0aW1lc3RhbXAvYnJhbmNoLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHRpbWVzdGFtcFxuICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlTnBtVXBkYXRlXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fSAtIFJlc29sdmVzIHdpdGggY2hlY2tlZE91dFJlcG9zXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIHRpbWVzdGFtcCwgaW5jbHVkZU5wbVVwZGF0ZSApIHtcbiAgd2luc3Rvbi5pbmZvKCBgY2hlY2tpbmcgb3V0IHRpbWVzdGFtcCBmb3IgJHtyZXBvfSBhdCAke3RpbWVzdGFtcH1gICk7XG5cbiAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sIGF3YWl0IGdpdEZyb21UaW1lc3RhbXAoIHJlcG8sICdtYWluJywgdGltZXN0YW1wICkgKTtcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XG4gIGNvbnN0IGRlcGVuZGVuY3lOYW1lcyA9IE9iamVjdC5rZXlzKCBkZXBlbmRlbmNpZXMgKS5maWx0ZXIoIGtleSA9PiBrZXkgIT09ICdjb21tZW50JyAmJiBrZXkgIT09IHJlcG8gKTtcbiAgY29uc3QgdGltZXN0YW1wRGVwZW5kZW5jaWVzID0ge307XG4gIGZvciAoIGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5kZW5jeU5hbWVzICkge1xuICAgIHRpbWVzdGFtcERlcGVuZGVuY2llc1sgZGVwZW5kZW5jeSBdID0ge1xuICAgICAgc2hhOiBhd2FpdCBnaXRGcm9tVGltZXN0YW1wKCBkZXBlbmRlbmN5LCAnbWFpbicsIHRpbWVzdGFtcCApXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjaGVja291dERlcGVuZGVuY2llcyggcmVwbywgdGltZXN0YW1wRGVwZW5kZW5jaWVzLCBpbmNsdWRlTnBtVXBkYXRlICk7XG59OyJdLCJuYW1lcyI6WyJjaGVja291dERlcGVuZGVuY2llcyIsInJlcXVpcmUiLCJnZXREZXBlbmRlbmNpZXMiLCJnaXRDaGVja291dCIsImdpdEZyb21UaW1lc3RhbXAiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ0aW1lc3RhbXAiLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5mbyIsImRlcGVuZGVuY2llcyIsImRlcGVuZGVuY3lOYW1lcyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJrZXkiLCJ0aW1lc3RhbXBEZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmN5Iiwic2hhIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSx1QkFBdUJDLFFBQVM7QUFDdEMsTUFBTUMsa0JBQWtCRCxRQUFTO0FBQ2pDLE1BQU1FLGNBQWNGLFFBQVM7QUFDN0IsTUFBTUcsbUJBQW1CSCxRQUFTO0FBQ2xDLE1BQU1JLFVBQVVKLFFBQVM7QUFFekI7Ozs7Ozs7O0NBUUMsR0FDREssT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLGdCQUFnQjtJQUNoRUwsUUFBUU0sSUFBSSxDQUFFLENBQUMsMkJBQTJCLEVBQUVILEtBQUssSUFBSSxFQUFFQyxXQUFXO0lBRWxFLE1BQU1OLFlBQWFLLE1BQU0sQ0FBQSxNQUFNSixpQkFBa0JJLE1BQU0sUUFBUUMsVUFBVTtJQUN6RSxNQUFNRyxlQUFlLE1BQU1WLGdCQUFpQk07SUFDNUMsTUFBTUssa0JBQWtCQyxPQUFPQyxJQUFJLENBQUVILGNBQWVJLE1BQU0sQ0FBRUMsQ0FBQUEsTUFBT0EsUUFBUSxhQUFhQSxRQUFRVDtJQUNoRyxNQUFNVSx3QkFBd0IsQ0FBQztJQUMvQixLQUFNLE1BQU1DLGNBQWNOLGdCQUFrQjtRQUMxQ0sscUJBQXFCLENBQUVDLFdBQVksR0FBRztZQUNwQ0MsS0FBSyxNQUFNaEIsaUJBQWtCZSxZQUFZLFFBQVFWO1FBQ25EO0lBQ0Y7SUFFQSxPQUFPVCxxQkFBc0JRLE1BQU1VLHVCQUF1QlI7QUFDNUQifQ==