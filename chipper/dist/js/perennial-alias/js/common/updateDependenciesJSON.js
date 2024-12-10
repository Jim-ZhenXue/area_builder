// Copyright 2017, University of Colorado Boulder
/**
 * Updates the top-level dependencies.json, given the result of a build in the build directory.
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
const ChipperVersion = require('./ChipperVersion');
const copyFile = require('./copyFile');
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitPush = require('./gitPush');
const winston = require('winston');
/**
 * Updates the top-level dependencies.json, given the result of a build in the build directory.
 * @public
 *
 * @param {string} repo - The repository that was built
 * @param {Array.<string>} brands - The brands that were built
 * @param {string} message
 * @param {string} branch - The branch we're on (to push to)
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, brands, message, branch) {
    winston.info(`updating top-level dependencies.json for ${repo} ${message} to branch ${branch}`);
    const chipperVersion = ChipperVersion.getFromRepository();
    let buildDepdenciesFile;
    // Chipper "1.0" (it was called such) had version 0.0.0 in its package.json
    if (chipperVersion.major === 0 && chipperVersion.minor === 0) {
        buildDepdenciesFile = `../${repo}/build/dependencies.json`;
    } else if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
        buildDepdenciesFile = `../${repo}/build/${brands[0]}/dependencies.json`;
    } else {
        throw new Error(`unsupported chipper version: ${chipperVersion.toString()}`);
    }
    yield copyFile(buildDepdenciesFile, `../${repo}/dependencies.json`);
    yield gitAdd(repo, 'dependencies.json');
    yield gitCommit(repo, `updated dependencies.json for ${message}`);
    yield gitPush(repo, branch);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vdXBkYXRlRGVwZW5kZW5jaWVzSlNPTi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXBkYXRlcyB0aGUgdG9wLWxldmVsIGRlcGVuZGVuY2llcy5qc29uLCBnaXZlbiB0aGUgcmVzdWx0IG9mIGEgYnVpbGQgaW4gdGhlIGJ1aWxkIGRpcmVjdG9yeS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgQ2hpcHBlclZlcnNpb24gPSByZXF1aXJlKCAnLi9DaGlwcGVyVmVyc2lvbicgKTtcbmNvbnN0IGNvcHlGaWxlID0gcmVxdWlyZSggJy4vY29weUZpbGUnICk7XG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi9naXRBZGQnICk7XG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XG5jb25zdCBnaXRQdXNoID0gcmVxdWlyZSggJy4vZ2l0UHVzaCcgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSB0b3AtbGV2ZWwgZGVwZW5kZW5jaWVzLmpzb24sIGdpdmVuIHRoZSByZXN1bHQgb2YgYSBidWlsZCBpbiB0aGUgYnVpbGQgZGlyZWN0b3J5LlxuICogQHB1YmxpY1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgdGhhdCB3YXMgYnVpbHRcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IGJyYW5kcyAtIFRoZSBicmFuZHMgdGhhdCB3ZXJlIGJ1aWx0XG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaCAtIFRoZSBicmFuY2ggd2UncmUgb24gKHRvIHB1c2ggdG8pXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbywgYnJhbmRzLCBtZXNzYWdlLCBicmFuY2ggKSB7XG4gIHdpbnN0b24uaW5mbyggYHVwZGF0aW5nIHRvcC1sZXZlbCBkZXBlbmRlbmNpZXMuanNvbiBmb3IgJHtyZXBvfSAke21lc3NhZ2V9IHRvIGJyYW5jaCAke2JyYW5jaH1gICk7XG5cbiAgY29uc3QgY2hpcHBlclZlcnNpb24gPSBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUmVwb3NpdG9yeSgpO1xuXG4gIGxldCBidWlsZERlcGRlbmNpZXNGaWxlO1xuXG4gIC8vIENoaXBwZXIgXCIxLjBcIiAoaXQgd2FzIGNhbGxlZCBzdWNoKSBoYWQgdmVyc2lvbiAwLjAuMCBpbiBpdHMgcGFja2FnZS5qc29uXG4gIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDAgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XG4gICAgYnVpbGREZXBkZW5jaWVzRmlsZSA9IGAuLi8ke3JlcG99L2J1aWxkL2RlcGVuZGVuY2llcy5qc29uYDtcbiAgfVxuICAvLyBDaGlwcGVyIDIuMFxuICBlbHNlIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDIgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XG4gICAgYnVpbGREZXBkZW5jaWVzRmlsZSA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmRzWyAwIF19L2RlcGVuZGVuY2llcy5qc29uYDtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBjaGlwcGVyIHZlcnNpb246ICR7Y2hpcHBlclZlcnNpb24udG9TdHJpbmcoKX1gICk7XG4gIH1cblxuICBhd2FpdCBjb3B5RmlsZSggYnVpbGREZXBkZW5jaWVzRmlsZSwgYC4uLyR7cmVwb30vZGVwZW5kZW5jaWVzLmpzb25gICk7XG4gIGF3YWl0IGdpdEFkZCggcmVwbywgJ2RlcGVuZGVuY2llcy5qc29uJyApO1xuICBhd2FpdCBnaXRDb21taXQoIHJlcG8sIGB1cGRhdGVkIGRlcGVuZGVuY2llcy5qc29uIGZvciAke21lc3NhZ2V9YCApO1xuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcbn07Il0sIm5hbWVzIjpbIkNoaXBwZXJWZXJzaW9uIiwicmVxdWlyZSIsImNvcHlGaWxlIiwiZ2l0QWRkIiwiZ2l0Q29tbWl0IiwiZ2l0UHVzaCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5kcyIsIm1lc3NhZ2UiLCJicmFuY2giLCJpbmZvIiwiY2hpcHBlclZlcnNpb24iLCJnZXRGcm9tUmVwb3NpdG9yeSIsImJ1aWxkRGVwZGVuY2llc0ZpbGUiLCJtYWpvciIsIm1pbm9yIiwiRXJyb3IiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsaUJBQWlCQyxRQUFTO0FBQ2hDLE1BQU1DLFdBQVdELFFBQVM7QUFDMUIsTUFBTUUsU0FBU0YsUUFBUztBQUN4QixNQUFNRyxZQUFZSCxRQUFTO0FBQzNCLE1BQU1JLFVBQVVKLFFBQVM7QUFDekIsTUFBTUssVUFBVUwsUUFBUztBQUV6Qjs7Ozs7Ozs7O0NBU0MsR0FDRE0sT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRUMsTUFBTTtJQUM1RE4sUUFBUU8sSUFBSSxDQUFFLENBQUMseUNBQXlDLEVBQUVKLEtBQUssQ0FBQyxFQUFFRSxRQUFRLFdBQVcsRUFBRUMsUUFBUTtJQUUvRixNQUFNRSxpQkFBaUJkLGVBQWVlLGlCQUFpQjtJQUV2RCxJQUFJQztJQUVKLDJFQUEyRTtJQUMzRSxJQUFLRixlQUFlRyxLQUFLLEtBQUssS0FBS0gsZUFBZUksS0FBSyxLQUFLLEdBQUk7UUFDOURGLHNCQUFzQixDQUFDLEdBQUcsRUFBRVAsS0FBSyx3QkFBd0IsQ0FBQztJQUM1RCxPQUVLLElBQUtLLGVBQWVHLEtBQUssS0FBSyxLQUFLSCxlQUFlSSxLQUFLLEtBQUssR0FBSTtRQUNuRUYsc0JBQXNCLENBQUMsR0FBRyxFQUFFUCxLQUFLLE9BQU8sRUFBRUMsTUFBTSxDQUFFLEVBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUMzRSxPQUNLO1FBQ0gsTUFBTSxJQUFJUyxNQUFPLENBQUMsNkJBQTZCLEVBQUVMLGVBQWVNLFFBQVEsSUFBSTtJQUM5RTtJQUVBLE1BQU1sQixTQUFVYyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUVQLEtBQUssa0JBQWtCLENBQUM7SUFDbkUsTUFBTU4sT0FBUU0sTUFBTTtJQUNwQixNQUFNTCxVQUFXSyxNQUFNLENBQUMsOEJBQThCLEVBQUVFLFNBQVM7SUFDakUsTUFBTU4sUUFBU0ksTUFBTUc7QUFDdkIifQ==