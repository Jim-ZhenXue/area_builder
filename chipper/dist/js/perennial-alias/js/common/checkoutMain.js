// Copyright 2017, University of Colorado Boulder
/**
 * Checks out main for a repository and all of its dependencies.
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
const npmUpdate = require('./npmUpdate');
const winston = require('winston');
/**
 * Checks out main for a repository and all of its dependencies.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {boolean} includeNpmUpdate - Whether npm updates should be done to repositories.
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, includeNpmUpdate) {
    winston.info(`checking out main for ${repo}`);
    const dependencies = yield getDependencies(repo);
    // Ignore the comment
    const repoNames = Object.keys(dependencies).filter((key)=>key !== 'comment');
    for (const repoName of repoNames){
        yield gitCheckout(repoName, 'main');
    }
    if (includeNpmUpdate) {
        yield npmUpdate(repo);
        yield npmUpdate('chipper');
        yield npmUpdate('perennial-alias');
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2hlY2tvdXRNYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3Mgb3V0IG1haW4gZm9yIGEgcmVwb3NpdG9yeSBhbmQgYWxsIG9mIGl0cyBkZXBlbmRlbmNpZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGdldERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2dldERlcGVuZGVuY2llcycgKTtcbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4vZ2l0Q2hlY2tvdXQnICk7XG5jb25zdCBucG1VcGRhdGUgPSByZXF1aXJlKCAnLi9ucG1VcGRhdGUnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbi8qKlxuICogQ2hlY2tzIG91dCBtYWluIGZvciBhIHJlcG9zaXRvcnkgYW5kIGFsbCBvZiBpdHMgZGVwZW5kZW5jaWVzLlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxuICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlTnBtVXBkYXRlIC0gV2hldGhlciBucG0gdXBkYXRlcyBzaG91bGQgYmUgZG9uZSB0byByZXBvc2l0b3JpZXMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgaW5jbHVkZU5wbVVwZGF0ZSApIHtcbiAgd2luc3Rvbi5pbmZvKCBgY2hlY2tpbmcgb3V0IG1haW4gZm9yICR7cmVwb31gICk7XG5cbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XG5cbiAgLy8gSWdub3JlIHRoZSBjb21tZW50XG4gIGNvbnN0IHJlcG9OYW1lcyA9IE9iamVjdC5rZXlzKCBkZXBlbmRlbmNpZXMgKS5maWx0ZXIoIGtleSA9PiBrZXkgIT09ICdjb21tZW50JyApO1xuXG4gIGZvciAoIGNvbnN0IHJlcG9OYW1lIG9mIHJlcG9OYW1lcyApIHtcbiAgICBhd2FpdCBnaXRDaGVja291dCggcmVwb05hbWUsICdtYWluJyApO1xuICB9XG5cbiAgaWYgKCBpbmNsdWRlTnBtVXBkYXRlICkge1xuICAgIGF3YWl0IG5wbVVwZGF0ZSggcmVwbyApO1xuICAgIGF3YWl0IG5wbVVwZGF0ZSggJ2NoaXBwZXInICk7XG4gICAgYXdhaXQgbnBtVXBkYXRlKCAncGVyZW5uaWFsLWFsaWFzJyApO1xuICB9XG59OyJdLCJuYW1lcyI6WyJnZXREZXBlbmRlbmNpZXMiLCJyZXF1aXJlIiwiZ2l0Q2hlY2tvdXQiLCJucG1VcGRhdGUiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5mbyIsImRlcGVuZGVuY2llcyIsInJlcG9OYW1lcyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJrZXkiLCJyZXBvTmFtZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsa0JBQWtCQyxRQUFTO0FBQ2pDLE1BQU1DLGNBQWNELFFBQVM7QUFDN0IsTUFBTUUsWUFBWUYsUUFBUztBQUMzQixNQUFNRyxVQUFVSCxRQUFTO0FBRXpCOzs7Ozs7O0NBT0MsR0FDREksT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxnQkFBZ0I7SUFDckRKLFFBQVFLLElBQUksQ0FBRSxDQUFDLHNCQUFzQixFQUFFRixNQUFNO0lBRTdDLE1BQU1HLGVBQWUsTUFBTVYsZ0JBQWlCTztJQUU1QyxxQkFBcUI7SUFDckIsTUFBTUksWUFBWUMsT0FBT0MsSUFBSSxDQUFFSCxjQUFlSSxNQUFNLENBQUVDLENBQUFBLE1BQU9BLFFBQVE7SUFFckUsS0FBTSxNQUFNQyxZQUFZTCxVQUFZO1FBQ2xDLE1BQU1ULFlBQWFjLFVBQVU7SUFDL0I7SUFFQSxJQUFLUixrQkFBbUI7UUFDdEIsTUFBTUwsVUFBV0k7UUFDakIsTUFBTUosVUFBVztRQUNqQixNQUFNQSxVQUFXO0lBQ25CO0FBQ0YifQ==