// Copyright 2017, University of Colorado Boulder
/**
 * For `grunt create-one-off`, see Gruntfile for details
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
const execute = require('../common/execute').default;
const getRepoVersion = require('../common/getRepoVersion');
const gitAdd = require('../common/gitAdd');
const gitCommit = require('../common/gitCommit');
const gitIsClean = require('../common/gitIsClean');
const gitPush = require('../common/gitPush');
const hasRemoteBranch = require('../common/hasRemoteBranch');
const npmUpdate = require('../common/npmUpdate');
const setRepoVersion = require('../common/setRepoVersion');
const grunt = require('grunt');
/**
 * For `grunt create-one-off`, see Gruntfile for details
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch to create (should be {{MAJOR}}.{{MINOR}})
 * @param {string} [message] - Optional message to append to the version-increment commit.
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo, branch, message) {
    const hasBranchAlready = yield hasRemoteBranch(repo, branch);
    if (hasBranchAlready) {
        grunt.fail.fatal('Branch already exists, aborting');
    }
    const branchedVersion = yield getRepoVersion(repo);
    const newVersion = new SimVersion(branchedVersion.major, branchedVersion.minor, 0, {
        testType: branch,
        testNumber: 0
    });
    const isClean = yield gitIsClean(repo);
    if (!isClean) {
        throw new Error(`Unclean status in ${repo}, cannot create release branch`);
    }
    // Create the branch, update the version info
    yield execute('git', [
        'checkout',
        '-b',
        branch
    ], `../${repo}`);
    yield setRepoVersion(repo, newVersion, message);
    yield gitPush(repo, branch);
    // Update dependencies.json for the release branch
    yield npmUpdate(repo);
    yield npmUpdate('chipper');
    yield npmUpdate('perennial-alias');
    const brand = 'phet';
    yield build(repo, {
        brands: [
            brand
        ]
    });
    yield copyFile(`../${repo}/build/${brand}/dependencies.json`, `../${repo}/dependencies.json`);
    yield gitAdd(repo, 'dependencies.json');
    yield gitCommit(repo, `updated dependencies.json for version ${newVersion.toString()}`);
    yield gitPush(repo, branch);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9jcmVhdGVPbmVPZmYuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvciBgZ3J1bnQgY3JlYXRlLW9uZS1vZmZgLCBzZWUgR3J1bnRmaWxlIGZvciBkZXRhaWxzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IFNpbVZlcnNpb24gPSByZXF1aXJlKCAnLi4vYnJvd3Nlci1hbmQtbm9kZS9TaW1WZXJzaW9uJyApLmRlZmF1bHQ7XG5jb25zdCBidWlsZCA9IHJlcXVpcmUoICcuLi9jb21tb24vYnVpbGQnICk7XG5jb25zdCBjb3B5RmlsZSA9IHJlcXVpcmUoICcuLi9jb21tb24vY29weUZpbGUnICk7XG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uL2NvbW1vbi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBnZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2V0UmVwb1ZlcnNpb24nICk7XG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdEFkZCcgKTtcbmNvbnN0IGdpdENvbW1pdCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0Q29tbWl0JyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdFB1c2gnICk7XG5jb25zdCBoYXNSZW1vdGVCcmFuY2ggPSByZXF1aXJlKCAnLi4vY29tbW9uL2hhc1JlbW90ZUJyYW5jaCcgKTtcbmNvbnN0IG5wbVVwZGF0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vbnBtVXBkYXRlJyApO1xuY29uc3Qgc2V0UmVwb1ZlcnNpb24gPSByZXF1aXJlKCAnLi4vY29tbW9uL3NldFJlcG9WZXJzaW9uJyApO1xuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XG5cbi8qKlxuICogRm9yIGBncnVudCBjcmVhdGUtb25lLW9mZmAsIHNlZSBHcnVudGZpbGUgZm9yIGRldGFpbHNcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIHRvIGNyZWF0ZSAoc2hvdWxkIGJlIHt7TUFKT1J9fS57e01JTk9SfX0pXG4gKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdIC0gT3B0aW9uYWwgbWVzc2FnZSB0byBhcHBlbmQgdG8gdGhlIHZlcnNpb24taW5jcmVtZW50IGNvbW1pdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBicmFuY2gsIG1lc3NhZ2UgKSB7XG4gIGNvbnN0IGhhc0JyYW5jaEFscmVhZHkgPSBhd2FpdCBoYXNSZW1vdGVCcmFuY2goIHJlcG8sIGJyYW5jaCApO1xuICBpZiAoIGhhc0JyYW5jaEFscmVhZHkgKSB7XG4gICAgZ3J1bnQuZmFpbC5mYXRhbCggJ0JyYW5jaCBhbHJlYWR5IGV4aXN0cywgYWJvcnRpbmcnICk7XG4gIH1cblxuICBjb25zdCBicmFuY2hlZFZlcnNpb24gPSBhd2FpdCBnZXRSZXBvVmVyc2lvbiggcmVwbyApO1xuXG4gIGNvbnN0IG5ld1ZlcnNpb24gPSBuZXcgU2ltVmVyc2lvbiggYnJhbmNoZWRWZXJzaW9uLm1ham9yLCBicmFuY2hlZFZlcnNpb24ubWlub3IsIDAsIHtcbiAgICB0ZXN0VHlwZTogYnJhbmNoLFxuICAgIHRlc3ROdW1iZXI6IDBcbiAgfSApO1xuXG4gIGNvbnN0IGlzQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICk7XG4gIGlmICggIWlzQ2xlYW4gKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgVW5jbGVhbiBzdGF0dXMgaW4gJHtyZXBvfSwgY2Fubm90IGNyZWF0ZSByZWxlYXNlIGJyYW5jaGAgKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgYnJhbmNoLCB1cGRhdGUgdGhlIHZlcnNpb24gaW5mb1xuICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnY2hlY2tvdXQnLCAnLWInLCBicmFuY2ggXSwgYC4uLyR7cmVwb31gICk7XG4gIGF3YWl0IHNldFJlcG9WZXJzaW9uKCByZXBvLCBuZXdWZXJzaW9uLCBtZXNzYWdlICk7XG4gIGF3YWl0IGdpdFB1c2goIHJlcG8sIGJyYW5jaCApO1xuXG4gIC8vIFVwZGF0ZSBkZXBlbmRlbmNpZXMuanNvbiBmb3IgdGhlIHJlbGVhc2UgYnJhbmNoXG4gIGF3YWl0IG5wbVVwZGF0ZSggcmVwbyApO1xuICBhd2FpdCBucG1VcGRhdGUoICdjaGlwcGVyJyApO1xuICBhd2FpdCBucG1VcGRhdGUoICdwZXJlbm5pYWwtYWxpYXMnICk7XG5cbiAgY29uc3QgYnJhbmQgPSAncGhldCc7XG4gIGF3YWl0IGJ1aWxkKCByZXBvLCB7XG4gICAgYnJhbmRzOiBbIGJyYW5kIF1cbiAgfSApO1xuICBhd2FpdCBjb3B5RmlsZSggYC4uLyR7cmVwb30vYnVpbGQvJHticmFuZH0vZGVwZW5kZW5jaWVzLmpzb25gLCBgLi4vJHtyZXBvfS9kZXBlbmRlbmNpZXMuanNvbmAgKTtcbiAgYXdhaXQgZ2l0QWRkKCByZXBvLCAnZGVwZW5kZW5jaWVzLmpzb24nICk7XG4gIGF3YWl0IGdpdENvbW1pdCggcmVwbywgYHVwZGF0ZWQgZGVwZW5kZW5jaWVzLmpzb24gZm9yIHZlcnNpb24gJHtuZXdWZXJzaW9uLnRvU3RyaW5nKCl9YCApO1xuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcbn07Il0sIm5hbWVzIjpbIlNpbVZlcnNpb24iLCJyZXF1aXJlIiwiZGVmYXVsdCIsImJ1aWxkIiwiY29weUZpbGUiLCJleGVjdXRlIiwiZ2V0UmVwb1ZlcnNpb24iLCJnaXRBZGQiLCJnaXRDb21taXQiLCJnaXRJc0NsZWFuIiwiZ2l0UHVzaCIsImhhc1JlbW90ZUJyYW5jaCIsIm5wbVVwZGF0ZSIsInNldFJlcG9WZXJzaW9uIiwiZ3J1bnQiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5jaCIsIm1lc3NhZ2UiLCJoYXNCcmFuY2hBbHJlYWR5IiwiZmFpbCIsImZhdGFsIiwiYnJhbmNoZWRWZXJzaW9uIiwibmV3VmVyc2lvbiIsIm1ham9yIiwibWlub3IiLCJ0ZXN0VHlwZSIsInRlc3ROdW1iZXIiLCJpc0NsZWFuIiwiRXJyb3IiLCJicmFuZCIsImJyYW5kcyIsInRvU3RyaW5nIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxhQUFhQyxRQUFTLGtDQUFtQ0MsT0FBTztBQUN0RSxNQUFNQyxRQUFRRixRQUFTO0FBQ3ZCLE1BQU1HLFdBQVdILFFBQVM7QUFDMUIsTUFBTUksVUFBVUosUUFBUyxxQkFBc0JDLE9BQU87QUFDdEQsTUFBTUksaUJBQWlCTCxRQUFTO0FBQ2hDLE1BQU1NLFNBQVNOLFFBQVM7QUFDeEIsTUFBTU8sWUFBWVAsUUFBUztBQUMzQixNQUFNUSxhQUFhUixRQUFTO0FBQzVCLE1BQU1TLFVBQVVULFFBQVM7QUFDekIsTUFBTVUsa0JBQWtCVixRQUFTO0FBQ2pDLE1BQU1XLFlBQVlYLFFBQVM7QUFDM0IsTUFBTVksaUJBQWlCWixRQUFTO0FBQ2hDLE1BQU1hLFFBQVFiLFFBQVM7QUFFdkI7Ozs7Ozs7O0NBUUMsR0FDRGMsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLE9BQU87SUFDcEQsTUFBTUMsbUJBQW1CLE1BQU1ULGdCQUFpQk0sTUFBTUM7SUFDdEQsSUFBS0Usa0JBQW1CO1FBQ3RCTixNQUFNTyxJQUFJLENBQUNDLEtBQUssQ0FBRTtJQUNwQjtJQUVBLE1BQU1DLGtCQUFrQixNQUFNakIsZUFBZ0JXO0lBRTlDLE1BQU1PLGFBQWEsSUFBSXhCLFdBQVl1QixnQkFBZ0JFLEtBQUssRUFBRUYsZ0JBQWdCRyxLQUFLLEVBQUUsR0FBRztRQUNsRkMsVUFBVVQ7UUFDVlUsWUFBWTtJQUNkO0lBRUEsTUFBTUMsVUFBVSxNQUFNcEIsV0FBWVE7SUFDbEMsSUFBSyxDQUFDWSxTQUFVO1FBQ2QsTUFBTSxJQUFJQyxNQUFPLENBQUMsa0JBQWtCLEVBQUViLEtBQUssOEJBQThCLENBQUM7SUFDNUU7SUFFQSw2Q0FBNkM7SUFDN0MsTUFBTVosUUFBUyxPQUFPO1FBQUU7UUFBWTtRQUFNYTtLQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUVELE1BQU07SUFDaEUsTUFBTUosZUFBZ0JJLE1BQU1PLFlBQVlMO0lBQ3hDLE1BQU1ULFFBQVNPLE1BQU1DO0lBRXJCLGtEQUFrRDtJQUNsRCxNQUFNTixVQUFXSztJQUNqQixNQUFNTCxVQUFXO0lBQ2pCLE1BQU1BLFVBQVc7SUFFakIsTUFBTW1CLFFBQVE7SUFDZCxNQUFNNUIsTUFBT2MsTUFBTTtRQUNqQmUsUUFBUTtZQUFFRDtTQUFPO0lBQ25CO0lBQ0EsTUFBTTNCLFNBQVUsQ0FBQyxHQUFHLEVBQUVhLEtBQUssT0FBTyxFQUFFYyxNQUFNLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUVkLEtBQUssa0JBQWtCLENBQUM7SUFDN0YsTUFBTVYsT0FBUVUsTUFBTTtJQUNwQixNQUFNVCxVQUFXUyxNQUFNLENBQUMsc0NBQXNDLEVBQUVPLFdBQVdTLFFBQVEsSUFBSTtJQUN2RixNQUFNdkIsUUFBU08sTUFBTUM7QUFDdkIifQ==