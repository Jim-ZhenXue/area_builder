// Copyright 2017, University of Colorado Boulder
/**
 * Checks out the given dependencies (for a given repository) without modifying the given repository.
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
const gitFetchCheckout = require('./gitFetchCheckout');
const npmUpdate = require('./npmUpdate');
const winston = require('winston');
/**
 * Checks out the given dependencies (for a given repository) without modifying the given repository.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {Object} dependencies - In the format of dependencies.json
 * @param {boolean} includeNpmUpdate - Whether npm update should be included (for the repo and chipper)
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, dependencies, includeNpmUpdate) {
    winston.info(`checking out dependencies for ${repo}`);
    // track checked-out repositories, as it's helpful for future processes
    const checkedOutRepoNames = [
        repo
    ];
    // Ignore the repo we just checked out, and the comment
    const repoNames = Object.keys(dependencies).filter((key)=>key !== 'comment' && key !== repo);
    for(let i = 0; i < repoNames.length; i++){
        const dependencyRepoName = repoNames[i];
        checkedOutRepoNames.push(dependencyRepoName);
        const sha = dependencies[dependencyRepoName].sha;
        if (!sha) {
            throw new Error(`Missing sha for ${dependencyRepoName} in ${repo}`);
        }
        yield gitFetchCheckout(dependencyRepoName, sha);
    }
    if (includeNpmUpdate) {
        yield npmUpdate(repo);
        yield npmUpdate('chipper');
        yield npmUpdate('perennial-alias');
    }
    return checkedOutRepoNames;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2hlY2tvdXREZXBlbmRlbmNpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrcyBvdXQgdGhlIGdpdmVuIGRlcGVuZGVuY2llcyAoZm9yIGEgZ2l2ZW4gcmVwb3NpdG9yeSkgd2l0aG91dCBtb2RpZnlpbmcgdGhlIGdpdmVuIHJlcG9zaXRvcnkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdpdEZldGNoQ2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRGZXRjaENoZWNrb3V0JyApO1xuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4vbnBtVXBkYXRlJyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIENoZWNrcyBvdXQgdGhlIGdpdmVuIGRlcGVuZGVuY2llcyAoZm9yIGEgZ2l2ZW4gcmVwb3NpdG9yeSkgd2l0aG91dCBtb2RpZnlpbmcgdGhlIGdpdmVuIHJlcG9zaXRvcnkuXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdH0gZGVwZW5kZW5jaWVzIC0gSW4gdGhlIGZvcm1hdCBvZiBkZXBlbmRlbmNpZXMuanNvblxuICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlTnBtVXBkYXRlIC0gV2hldGhlciBucG0gdXBkYXRlIHNob3VsZCBiZSBpbmNsdWRlZCAoZm9yIHRoZSByZXBvIGFuZCBjaGlwcGVyKVxuICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxzdHJpbmc+Pn0gLSBSZXNvbHZlcyB3aXRoIGNoZWNrZWRPdXRSZXBvc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBkZXBlbmRlbmNpZXMsIGluY2x1ZGVOcG1VcGRhdGUgKSB7XG4gIHdpbnN0b24uaW5mbyggYGNoZWNraW5nIG91dCBkZXBlbmRlbmNpZXMgZm9yICR7cmVwb31gICk7XG5cbiAgLy8gdHJhY2sgY2hlY2tlZC1vdXQgcmVwb3NpdG9yaWVzLCBhcyBpdCdzIGhlbHBmdWwgZm9yIGZ1dHVyZSBwcm9jZXNzZXNcbiAgY29uc3QgY2hlY2tlZE91dFJlcG9OYW1lcyA9IFsgcmVwbyBdO1xuXG4gIC8vIElnbm9yZSB0aGUgcmVwbyB3ZSBqdXN0IGNoZWNrZWQgb3V0LCBhbmQgdGhlIGNvbW1lbnRcbiAgY29uc3QgcmVwb05hbWVzID0gT2JqZWN0LmtleXMoIGRlcGVuZGVuY2llcyApLmZpbHRlcigga2V5ID0+IGtleSAhPT0gJ2NvbW1lbnQnICYmIGtleSAhPT0gcmVwbyApO1xuXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHJlcG9OYW1lcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBkZXBlbmRlbmN5UmVwb05hbWUgPSByZXBvTmFtZXNbIGkgXTtcblxuICAgIGNoZWNrZWRPdXRSZXBvTmFtZXMucHVzaCggZGVwZW5kZW5jeVJlcG9OYW1lICk7XG4gICAgY29uc3Qgc2hhID0gZGVwZW5kZW5jaWVzWyBkZXBlbmRlbmN5UmVwb05hbWUgXS5zaGE7XG4gICAgaWYgKCAhc2hhICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgTWlzc2luZyBzaGEgZm9yICR7ZGVwZW5kZW5jeVJlcG9OYW1lfSBpbiAke3JlcG99YCApO1xuICAgIH1cblxuICAgIGF3YWl0IGdpdEZldGNoQ2hlY2tvdXQoIGRlcGVuZGVuY3lSZXBvTmFtZSwgc2hhICk7XG4gIH1cblxuICBpZiAoIGluY2x1ZGVOcG1VcGRhdGUgKSB7XG4gICAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XG4gICAgYXdhaXQgbnBtVXBkYXRlKCAnY2hpcHBlcicgKTtcbiAgICBhd2FpdCBucG1VcGRhdGUoICdwZXJlbm5pYWwtYWxpYXMnICk7XG4gIH1cblxuICByZXR1cm4gY2hlY2tlZE91dFJlcG9OYW1lcztcbn07Il0sIm5hbWVzIjpbImdpdEZldGNoQ2hlY2tvdXQiLCJyZXF1aXJlIiwibnBtVXBkYXRlIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiZGVwZW5kZW5jaWVzIiwiaW5jbHVkZU5wbVVwZGF0ZSIsImluZm8iLCJjaGVja2VkT3V0UmVwb05hbWVzIiwicmVwb05hbWVzIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImtleSIsImkiLCJsZW5ndGgiLCJkZXBlbmRlbmN5UmVwb05hbWUiLCJwdXNoIiwic2hhIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLG1CQUFtQkMsUUFBUztBQUNsQyxNQUFNQyxZQUFZRCxRQUFTO0FBQzNCLE1BQU1FLFVBQVVGLFFBQVM7QUFFekI7Ozs7Ozs7O0NBUUMsR0FDREcsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGdCQUFnQjtJQUNuRUwsUUFBUU0sSUFBSSxDQUFFLENBQUMsOEJBQThCLEVBQUVILE1BQU07SUFFckQsdUVBQXVFO0lBQ3ZFLE1BQU1JLHNCQUFzQjtRQUFFSjtLQUFNO0lBRXBDLHVEQUF1RDtJQUN2RCxNQUFNSyxZQUFZQyxPQUFPQyxJQUFJLENBQUVOLGNBQWVPLE1BQU0sQ0FBRUMsQ0FBQUEsTUFBT0EsUUFBUSxhQUFhQSxRQUFRVDtJQUUxRixJQUFNLElBQUlVLElBQUksR0FBR0EsSUFBSUwsVUFBVU0sTUFBTSxFQUFFRCxJQUFNO1FBQzNDLE1BQU1FLHFCQUFxQlAsU0FBUyxDQUFFSyxFQUFHO1FBRXpDTixvQkFBb0JTLElBQUksQ0FBRUQ7UUFDMUIsTUFBTUUsTUFBTWIsWUFBWSxDQUFFVyxtQkFBb0IsQ0FBQ0UsR0FBRztRQUNsRCxJQUFLLENBQUNBLEtBQU07WUFDVixNQUFNLElBQUlDLE1BQU8sQ0FBQyxnQkFBZ0IsRUFBRUgsbUJBQW1CLElBQUksRUFBRVosTUFBTTtRQUNyRTtRQUVBLE1BQU1OLGlCQUFrQmtCLG9CQUFvQkU7SUFDOUM7SUFFQSxJQUFLWixrQkFBbUI7UUFDdEIsTUFBTU4sVUFBV0k7UUFDakIsTUFBTUosVUFBVztRQUNqQixNQUFNQSxVQUFXO0lBQ25CO0lBRUEsT0FBT1E7QUFDVCJ9