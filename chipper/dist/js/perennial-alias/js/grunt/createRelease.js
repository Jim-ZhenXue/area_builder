// Copyright 2017, University of Colorado Boulder
/**
 * For `grunt create-release`, see Gruntfile for details
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
const SimVersion = require('../browser-and-node/SimVersion').default;
const build = require('../common/build');
const copyFile = require('../common/copyFile');
const getBranch = require('../common/getBranch');
const gitAdd = require('../common/gitAdd');
const gitCheckout = require('../common/gitCheckout');
const gitCommit = require('../common/gitCommit');
const gitCreateBranch = require('../common/gitCreateBranch');
const gitIsClean = require('../common/gitIsClean');
const gitPush = require('../common/gitPush');
const hasRemoteBranch = require('../common/hasRemoteBranch');
const npmUpdate = require('../common/npmUpdate');
const setRepoVersion = require('../common/setRepoVersion');
const setRepoSupportedBrands = require('../common/setRepoSupportedBrands');
const updateHTMLVersion = require('../common/updateHTMLVersion');
const assert = require('assert');
const grunt = require('grunt');
const winston = require('winston');
/**
 * For `grunt create-release`, see Gruntfile for details
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch to create (should be {{MAJOR}}.{{MINOR}})
 * @param {string[]} brands - the supported brands in the release
 * @param {string} [message] - Optional message to append to the brands/version-increment commit.
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ function() {
    var _createRelease = _async_to_generator(function*(repo, branch, brands, message) {
        const major = Number(branch.split('.')[0]);
        const minor = Number(branch.split('.')[1]);
        assert(major > 0, 'Major version for a branch should be greater than zero');
        assert(minor >= 0, 'Minor version for a branch should be greater than (or equal) to zero');
        assert(Array.isArray(brands), 'supported brands required');
        assert(brands.length >= 1, 'must have a supported brand');
        const currentBranch = yield getBranch(repo);
        if (currentBranch !== 'main') {
            grunt.fail.fatal(`Should be on main to create a release branch, not: ${currentBranch ? currentBranch : '(detached head)'}`);
        }
        const hasBranchAlready = yield hasRemoteBranch(repo, branch);
        if (hasBranchAlready) {
            grunt.fail.fatal('Branch already exists, aborting');
        }
        const newVersion = new SimVersion(major, minor, 0, {
            testType: 'rc',
            testNumber: 0
        });
        const isClean = yield gitIsClean(repo);
        if (!isClean) {
            throw new Error(`Unclean status in ${repo}, cannot create release branch`);
        }
        winston.info('Setting the release branch version to rc.0 so it will auto-increment to rc.1 for the first RC deployment');
        // Create the branch, update the version info
        yield gitCreateBranch(repo, branch);
        yield setRepoSupportedBrands(repo, brands);
        yield setRepoVersion(repo, newVersion, message);
        yield gitPush(repo, branch);
        // Update dependencies.json for the release branch
        yield npmUpdate(repo);
        yield npmUpdate('chipper');
        yield npmUpdate('perennial-alias');
        const brand = brands[0];
        yield build(repo, {
            brands: [
                brand
            ]
        });
        yield copyFile(`../${repo}/build/${brand}/dependencies.json`, `../${repo}/dependencies.json`);
        yield gitAdd(repo, 'dependencies.json');
        yield gitCommit(repo, `updated dependencies.json for version ${newVersion.toString()}`);
        yield gitPush(repo, branch);
        // Update the version info in main
        yield gitCheckout(repo, 'main');
        yield setRepoVersion(repo, new SimVersion(major, minor + 1, 0, {
            testType: 'dev',
            testNumber: 0
        }), message);
        yield updateHTMLVersion(repo);
        yield gitPush(repo, 'main');
        // Go back to the branch (as they may want to do a deploy)
        yield gitCheckout(repo, branch);
    });
    function createRelease(repo, branch, brands, message) {
        return _createRelease.apply(this, arguments);
    }
    return createRelease;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jcmVhdGVSZWxlYXNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGb3IgYGdydW50IGNyZWF0ZS1yZWxlYXNlYCwgc2VlIEdydW50ZmlsZSBmb3IgZGV0YWlsc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3QgYnVpbGQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2J1aWxkJyApO1xuY29uc3QgY29weUZpbGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2NvcHlGaWxlJyApO1xuY29uc3QgZ2V0QnJhbmNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRCcmFuY2gnICk7XG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdEFkZCcgKTtcbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdENvbW1pdCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0Q29tbWl0JyApO1xuY29uc3QgZ2l0Q3JlYXRlQnJhbmNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRDcmVhdGVCcmFuY2gnICk7XG5jb25zdCBnaXRJc0NsZWFuID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRJc0NsZWFuJyApO1xuY29uc3QgZ2l0UHVzaCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0UHVzaCcgKTtcbmNvbnN0IGhhc1JlbW90ZUJyYW5jaCA9IHJlcXVpcmUoICcuLi9jb21tb24vaGFzUmVtb3RlQnJhbmNoJyApO1xuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9ucG1VcGRhdGUnICk7XG5jb25zdCBzZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vc2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCBzZXRSZXBvU3VwcG9ydGVkQnJhbmRzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9zZXRSZXBvU3VwcG9ydGVkQnJhbmRzJyApO1xuY29uc3QgdXBkYXRlSFRNTFZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL3VwZGF0ZUhUTUxWZXJzaW9uJyApO1xuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vKipcbiAqIEZvciBgZ3J1bnQgY3JlYXRlLXJlbGVhc2VgLCBzZWUgR3J1bnRmaWxlIGZvciBkZXRhaWxzXG4gKiBAcHVibGljXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoIC0gVGhlIGJyYW5jaCB0byBjcmVhdGUgKHNob3VsZCBiZSB7e01BSk9SfX0ue3tNSU5PUn19KVxuICogQHBhcmFtIHtzdHJpbmdbXX0gYnJhbmRzIC0gdGhlIHN1cHBvcnRlZCBicmFuZHMgaW4gdGhlIHJlbGVhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBPcHRpb25hbCBtZXNzYWdlIHRvIGFwcGVuZCB0byB0aGUgYnJhbmRzL3ZlcnNpb24taW5jcmVtZW50IGNvbW1pdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJlbGVhc2UoIHJlcG8sIGJyYW5jaCwgYnJhbmRzLCBtZXNzYWdlICkge1xuICBjb25zdCBtYWpvciA9IE51bWJlciggYnJhbmNoLnNwbGl0KCAnLicgKVsgMCBdICk7XG4gIGNvbnN0IG1pbm9yID0gTnVtYmVyKCBicmFuY2guc3BsaXQoICcuJyApWyAxIF0gKTtcbiAgYXNzZXJ0KCBtYWpvciA+IDAsICdNYWpvciB2ZXJzaW9uIGZvciBhIGJyYW5jaCBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIHplcm8nICk7XG4gIGFzc2VydCggbWlub3IgPj0gMCwgJ01pbm9yIHZlcnNpb24gZm9yIGEgYnJhbmNoIHNob3VsZCBiZSBncmVhdGVyIHRoYW4gKG9yIGVxdWFsKSB0byB6ZXJvJyApO1xuXG4gIGFzc2VydCggQXJyYXkuaXNBcnJheSggYnJhbmRzICksICdzdXBwb3J0ZWQgYnJhbmRzIHJlcXVpcmVkJyApO1xuICBhc3NlcnQoIGJyYW5kcy5sZW5ndGggPj0gMSwgJ211c3QgaGF2ZSBhIHN1cHBvcnRlZCBicmFuZCcgKTtcblxuICBjb25zdCBjdXJyZW50QnJhbmNoID0gYXdhaXQgZ2V0QnJhbmNoKCByZXBvICk7XG4gIGlmICggY3VycmVudEJyYW5jaCAhPT0gJ21haW4nICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoIGBTaG91bGQgYmUgb24gbWFpbiB0byBjcmVhdGUgYSByZWxlYXNlIGJyYW5jaCwgbm90OiAke2N1cnJlbnRCcmFuY2ggPyBjdXJyZW50QnJhbmNoIDogJyhkZXRhY2hlZCBoZWFkKSd9YCApO1xuICB9XG5cbiAgY29uc3QgaGFzQnJhbmNoQWxyZWFkeSA9IGF3YWl0IGhhc1JlbW90ZUJyYW5jaCggcmVwbywgYnJhbmNoICk7XG4gIGlmICggaGFzQnJhbmNoQWxyZWFkeSApIHtcbiAgICBncnVudC5mYWlsLmZhdGFsKCAnQnJhbmNoIGFscmVhZHkgZXhpc3RzLCBhYm9ydGluZycgKTtcbiAgfVxuXG4gIGNvbnN0IG5ld1ZlcnNpb24gPSBuZXcgU2ltVmVyc2lvbiggbWFqb3IsIG1pbm9yLCAwLCB7XG4gICAgdGVzdFR5cGU6ICdyYycsXG4gICAgdGVzdE51bWJlcjogMFxuICB9ICk7XG5cbiAgY29uc3QgaXNDbGVhbiA9IGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKTtcbiAgaWYgKCAhaXNDbGVhbiApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmNsZWFuIHN0YXR1cyBpbiAke3JlcG99LCBjYW5ub3QgY3JlYXRlIHJlbGVhc2UgYnJhbmNoYCApO1xuICB9XG5cbiAgd2luc3Rvbi5pbmZvKCAnU2V0dGluZyB0aGUgcmVsZWFzZSBicmFuY2ggdmVyc2lvbiB0byByYy4wIHNvIGl0IHdpbGwgYXV0by1pbmNyZW1lbnQgdG8gcmMuMSBmb3IgdGhlIGZpcnN0IFJDIGRlcGxveW1lbnQnICk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBicmFuY2gsIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbmZvXG4gIGF3YWl0IGdpdENyZWF0ZUJyYW5jaCggcmVwbywgYnJhbmNoICk7XG4gIGF3YWl0IHNldFJlcG9TdXBwb3J0ZWRCcmFuZHMoIHJlcG8sIGJyYW5kcyApO1xuICBhd2FpdCBzZXRSZXBvVmVyc2lvbiggcmVwbywgbmV3VmVyc2lvbiwgbWVzc2FnZSApO1xuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcblxuICAvLyBVcGRhdGUgZGVwZW5kZW5jaWVzLmpzb24gZm9yIHRoZSByZWxlYXNlIGJyYW5jaFxuICBhd2FpdCBucG1VcGRhdGUoIHJlcG8gKTtcbiAgYXdhaXQgbnBtVXBkYXRlKCAnY2hpcHBlcicgKTtcbiAgYXdhaXQgbnBtVXBkYXRlKCAncGVyZW5uaWFsLWFsaWFzJyApO1xuXG4gIGNvbnN0IGJyYW5kID0gYnJhbmRzWyAwIF07XG4gIGF3YWl0IGJ1aWxkKCByZXBvLCB7XG4gICAgYnJhbmRzOiBbIGJyYW5kIF1cbiAgfSApO1xuICBhd2FpdCBjb3B5RmlsZSggYC4uLyR7cmVwb30vYnVpbGQvJHticmFuZH0vZGVwZW5kZW5jaWVzLmpzb25gLCBgLi4vJHtyZXBvfS9kZXBlbmRlbmNpZXMuanNvbmAgKTtcbiAgYXdhaXQgZ2l0QWRkKCByZXBvLCAnZGVwZW5kZW5jaWVzLmpzb24nICk7XG4gIGF3YWl0IGdpdENvbW1pdCggcmVwbywgYHVwZGF0ZWQgZGVwZW5kZW5jaWVzLmpzb24gZm9yIHZlcnNpb24gJHtuZXdWZXJzaW9uLnRvU3RyaW5nKCl9YCApO1xuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcblxuICAvLyBVcGRhdGUgdGhlIHZlcnNpb24gaW5mbyBpbiBtYWluXG4gIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCAnbWFpbicgKTtcbiAgYXdhaXQgc2V0UmVwb1ZlcnNpb24oIHJlcG8sIG5ldyBTaW1WZXJzaW9uKCBtYWpvciwgbWlub3IgKyAxLCAwLCB7XG4gICAgdGVzdFR5cGU6ICdkZXYnLFxuICAgIHRlc3ROdW1iZXI6IDBcbiAgfSApLCBtZXNzYWdlICk7XG4gIGF3YWl0IHVwZGF0ZUhUTUxWZXJzaW9uKCByZXBvICk7XG4gIGF3YWl0IGdpdFB1c2goIHJlcG8sICdtYWluJyApO1xuXG4gIC8vIEdvIGJhY2sgdG8gdGhlIGJyYW5jaCAoYXMgdGhleSBtYXkgd2FudCB0byBkbyBhIGRlcGxveSlcbiAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sIGJyYW5jaCApO1xufTsiXSwibmFtZXMiOlsiU2ltVmVyc2lvbiIsInJlcXVpcmUiLCJkZWZhdWx0IiwiYnVpbGQiLCJjb3B5RmlsZSIsImdldEJyYW5jaCIsImdpdEFkZCIsImdpdENoZWNrb3V0IiwiZ2l0Q29tbWl0IiwiZ2l0Q3JlYXRlQnJhbmNoIiwiZ2l0SXNDbGVhbiIsImdpdFB1c2giLCJoYXNSZW1vdGVCcmFuY2giLCJucG1VcGRhdGUiLCJzZXRSZXBvVmVyc2lvbiIsInNldFJlcG9TdXBwb3J0ZWRCcmFuZHMiLCJ1cGRhdGVIVE1MVmVyc2lvbiIsImFzc2VydCIsImdydW50Iiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGVSZWxlYXNlIiwicmVwbyIsImJyYW5jaCIsImJyYW5kcyIsIm1lc3NhZ2UiLCJtYWpvciIsIk51bWJlciIsInNwbGl0IiwibWlub3IiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJjdXJyZW50QnJhbmNoIiwiZmFpbCIsImZhdGFsIiwiaGFzQnJhbmNoQWxyZWFkeSIsIm5ld1ZlcnNpb24iLCJ0ZXN0VHlwZSIsInRlc3ROdW1iZXIiLCJpc0NsZWFuIiwiRXJyb3IiLCJpbmZvIiwiYnJhbmQiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsYUFBYUMsUUFBUyxrQ0FBbUNDLE9BQU87QUFDdEUsTUFBTUMsUUFBUUYsUUFBUztBQUN2QixNQUFNRyxXQUFXSCxRQUFTO0FBQzFCLE1BQU1JLFlBQVlKLFFBQVM7QUFDM0IsTUFBTUssU0FBU0wsUUFBUztBQUN4QixNQUFNTSxjQUFjTixRQUFTO0FBQzdCLE1BQU1PLFlBQVlQLFFBQVM7QUFDM0IsTUFBTVEsa0JBQWtCUixRQUFTO0FBQ2pDLE1BQU1TLGFBQWFULFFBQVM7QUFDNUIsTUFBTVUsVUFBVVYsUUFBUztBQUN6QixNQUFNVyxrQkFBa0JYLFFBQVM7QUFDakMsTUFBTVksWUFBWVosUUFBUztBQUMzQixNQUFNYSxpQkFBaUJiLFFBQVM7QUFDaEMsTUFBTWMseUJBQXlCZCxRQUFTO0FBQ3hDLE1BQU1lLG9CQUFvQmYsUUFBUztBQUNuQyxNQUFNZ0IsU0FBU2hCLFFBQVM7QUFDeEIsTUFBTWlCLFFBQVFqQixRQUFTO0FBQ3ZCLE1BQU1rQixVQUFVbEIsUUFBUztBQUV6Qjs7Ozs7Ozs7O0NBU0MsR0FDRG1CLE9BQU9DLE9BQU87UUFBa0JDLGlCQUFmLG9CQUFBLFVBQThCQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsTUFBTSxFQUFFQyxPQUFPO1FBQzFFLE1BQU1DLFFBQVFDLE9BQVFKLE9BQU9LLEtBQUssQ0FBRSxJQUFLLENBQUUsRUFBRztRQUM5QyxNQUFNQyxRQUFRRixPQUFRSixPQUFPSyxLQUFLLENBQUUsSUFBSyxDQUFFLEVBQUc7UUFDOUNaLE9BQVFVLFFBQVEsR0FBRztRQUNuQlYsT0FBUWEsU0FBUyxHQUFHO1FBRXBCYixPQUFRYyxNQUFNQyxPQUFPLENBQUVQLFNBQVU7UUFDakNSLE9BQVFRLE9BQU9RLE1BQU0sSUFBSSxHQUFHO1FBRTVCLE1BQU1DLGdCQUFnQixNQUFNN0IsVUFBV2tCO1FBQ3ZDLElBQUtXLGtCQUFrQixRQUFTO1lBQzlCaEIsTUFBTWlCLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUMsbURBQW1ELEVBQUVGLGdCQUFnQkEsZ0JBQWdCLG1CQUFtQjtRQUM3SDtRQUVBLE1BQU1HLG1CQUFtQixNQUFNekIsZ0JBQWlCVyxNQUFNQztRQUN0RCxJQUFLYSxrQkFBbUI7WUFDdEJuQixNQUFNaUIsSUFBSSxDQUFDQyxLQUFLLENBQUU7UUFDcEI7UUFFQSxNQUFNRSxhQUFhLElBQUl0QyxXQUFZMkIsT0FBT0csT0FBTyxHQUFHO1lBQ2xEUyxVQUFVO1lBQ1ZDLFlBQVk7UUFDZDtRQUVBLE1BQU1DLFVBQVUsTUFBTS9CLFdBQVlhO1FBQ2xDLElBQUssQ0FBQ2tCLFNBQVU7WUFDZCxNQUFNLElBQUlDLE1BQU8sQ0FBQyxrQkFBa0IsRUFBRW5CLEtBQUssOEJBQThCLENBQUM7UUFDNUU7UUFFQUosUUFBUXdCLElBQUksQ0FBRTtRQUVkLDZDQUE2QztRQUM3QyxNQUFNbEMsZ0JBQWlCYyxNQUFNQztRQUM3QixNQUFNVCx1QkFBd0JRLE1BQU1FO1FBQ3BDLE1BQU1YLGVBQWdCUyxNQUFNZSxZQUFZWjtRQUN4QyxNQUFNZixRQUFTWSxNQUFNQztRQUVyQixrREFBa0Q7UUFDbEQsTUFBTVgsVUFBV1U7UUFDakIsTUFBTVYsVUFBVztRQUNqQixNQUFNQSxVQUFXO1FBRWpCLE1BQU0rQixRQUFRbkIsTUFBTSxDQUFFLEVBQUc7UUFDekIsTUFBTXRCLE1BQU9vQixNQUFNO1lBQ2pCRSxRQUFRO2dCQUFFbUI7YUFBTztRQUNuQjtRQUNBLE1BQU14QyxTQUFVLENBQUMsR0FBRyxFQUFFbUIsS0FBSyxPQUFPLEVBQUVxQixNQUFNLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUVyQixLQUFLLGtCQUFrQixDQUFDO1FBQzdGLE1BQU1qQixPQUFRaUIsTUFBTTtRQUNwQixNQUFNZixVQUFXZSxNQUFNLENBQUMsc0NBQXNDLEVBQUVlLFdBQVdPLFFBQVEsSUFBSTtRQUN2RixNQUFNbEMsUUFBU1ksTUFBTUM7UUFFckIsa0NBQWtDO1FBQ2xDLE1BQU1qQixZQUFhZ0IsTUFBTTtRQUN6QixNQUFNVCxlQUFnQlMsTUFBTSxJQUFJdkIsV0FBWTJCLE9BQU9HLFFBQVEsR0FBRyxHQUFHO1lBQy9EUyxVQUFVO1lBQ1ZDLFlBQVk7UUFDZCxJQUFLZDtRQUNMLE1BQU1WLGtCQUFtQk87UUFDekIsTUFBTVosUUFBU1ksTUFBTTtRQUVyQiwwREFBMEQ7UUFDMUQsTUFBTWhCLFlBQWFnQixNQUFNQztJQUMzQjthQTlEZ0NGLGNBQWVDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLE9BQU87ZUFBNUNKOztXQUFBQSJ9