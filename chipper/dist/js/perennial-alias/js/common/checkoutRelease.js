// Copyright 2017, University of Colorado Boulder
/**
 * Checks out the latest deployed production release branch (and dependencies) for a repository.
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
const checkoutTarget = require('./checkoutTarget');
const simMetadata = require('./simMetadata');
const assert = require('assert');
const winston = require('winston');
/**
 * Checks out the latest release branch (and dependencies) for a repository.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {boolean} includeNpmUpdate
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, includeNpmUpdate) {
    winston.info(`checking out release for ${repo}`);
    const data = yield simMetadata({
        simulation: repo
    });
    assert(data.projects.length === 1, 'Metadata request should only return 1 simulation result');
    const branch = `${data.projects[0].version.major}.${data.projects[0].version.minor}`;
    return checkoutTarget(repo, branch, includeNpmUpdate);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vY2hlY2tvdXRSZWxlYXNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3Mgb3V0IHRoZSBsYXRlc3QgZGVwbG95ZWQgcHJvZHVjdGlvbiByZWxlYXNlIGJyYW5jaCAoYW5kIGRlcGVuZGVuY2llcykgZm9yIGEgcmVwb3NpdG9yeS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgY2hlY2tvdXRUYXJnZXQgPSByZXF1aXJlKCAnLi9jaGVja291dFRhcmdldCcgKTtcbmNvbnN0IHNpbU1ldGFkYXRhID0gcmVxdWlyZSggJy4vc2ltTWV0YWRhdGEnICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIENoZWNrcyBvdXQgdGhlIGxhdGVzdCByZWxlYXNlIGJyYW5jaCAoYW5kIGRlcGVuZGVuY2llcykgZm9yIGEgcmVwb3NpdG9yeS5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5jbHVkZU5wbVVwZGF0ZVxuICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxzdHJpbmc+Pn0gLSBSZXNvbHZlcyB3aXRoIGNoZWNrZWRPdXRSZXBvc1xuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBpbmNsdWRlTnBtVXBkYXRlICkge1xuICB3aW5zdG9uLmluZm8oIGBjaGVja2luZyBvdXQgcmVsZWFzZSBmb3IgJHtyZXBvfWAgKTtcblxuICBjb25zdCBkYXRhID0gYXdhaXQgc2ltTWV0YWRhdGEoIHtcbiAgICBzaW11bGF0aW9uOiByZXBvXG4gIH0gKTtcblxuICBhc3NlcnQoIGRhdGEucHJvamVjdHMubGVuZ3RoID09PSAxLCAnTWV0YWRhdGEgcmVxdWVzdCBzaG91bGQgb25seSByZXR1cm4gMSBzaW11bGF0aW9uIHJlc3VsdCcgKTtcblxuICBjb25zdCBicmFuY2ggPSBgJHtkYXRhLnByb2plY3RzWyAwIF0udmVyc2lvbi5tYWpvcn0uJHtkYXRhLnByb2plY3RzWyAwIF0udmVyc2lvbi5taW5vcn1gO1xuXG4gIHJldHVybiBjaGVja291dFRhcmdldCggcmVwbywgYnJhbmNoLCBpbmNsdWRlTnBtVXBkYXRlICk7XG59OyJdLCJuYW1lcyI6WyJjaGVja291dFRhcmdldCIsInJlcXVpcmUiLCJzaW1NZXRhZGF0YSIsImFzc2VydCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImluY2x1ZGVOcG1VcGRhdGUiLCJpbmZvIiwiZGF0YSIsInNpbXVsYXRpb24iLCJwcm9qZWN0cyIsImxlbmd0aCIsImJyYW5jaCIsInZlcnNpb24iLCJtYWpvciIsIm1pbm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxpQkFBaUJDLFFBQVM7QUFDaEMsTUFBTUMsY0FBY0QsUUFBUztBQUM3QixNQUFNRSxTQUFTRixRQUFTO0FBQ3hCLE1BQU1HLFVBQVVILFFBQVM7QUFFekI7Ozs7Ozs7Q0FPQyxHQUNESSxPQUFPQyxPQUFPLHFDQUFHLFVBQWdCQyxJQUFJLEVBQUVDLGdCQUFnQjtJQUNyREosUUFBUUssSUFBSSxDQUFFLENBQUMseUJBQXlCLEVBQUVGLE1BQU07SUFFaEQsTUFBTUcsT0FBTyxNQUFNUixZQUFhO1FBQzlCUyxZQUFZSjtJQUNkO0lBRUFKLE9BQVFPLEtBQUtFLFFBQVEsQ0FBQ0MsTUFBTSxLQUFLLEdBQUc7SUFFcEMsTUFBTUMsU0FBUyxHQUFHSixLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDRyxPQUFPLENBQUNDLEtBQUssQ0FBQyxDQUFDLEVBQUVOLEtBQUtFLFFBQVEsQ0FBRSxFQUFHLENBQUNHLE9BQU8sQ0FBQ0UsS0FBSyxFQUFFO0lBRXhGLE9BQU9qQixlQUFnQk8sTUFBTU8sUUFBUU47QUFDdkMifQ==