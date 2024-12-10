// Copyright 2021, University of Colorado Boulder
/**
 * Applies or updates branch protection rules for all active repos.
 *
 * USAGE:
 * node perennial/js/scripts/protect-branches-in-all-repos.js
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
const protectGithubBranches = require('../common/protectGithubBranches');
const fs = require('fs');
// cannot use getActiveRepos() from root
const contents = fs.readFileSync('perennial/data/active-repos', 'utf8').trim();
const activeRepos = contents.split('\n').map((sim)=>sim.trim());
// perennial-alias is an exception, it is just a clone of the perennial repository
if (activeRepos.includes('perennial-alias')) {
    activeRepos.splice(activeRepos.indexOf('perennial-alias'), 1);
}
// so that execution doesn't finish until githubProtectBranches resolves
_async_to_generator(function*() {
    yield protectGithubBranches.protectBranches(activeRepos);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Byb3RlY3QtYnJhbmNoZXMtaW4tYWxsLXJlcG9zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBcHBsaWVzIG9yIHVwZGF0ZXMgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgZm9yIGFsbCBhY3RpdmUgcmVwb3MuXG4gKlxuICogVVNBR0U6XG4gKiBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL3Byb3RlY3QtYnJhbmNoZXMtaW4tYWxsLXJlcG9zLmpzXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgcHJvdGVjdEdpdGh1YkJyYW5jaGVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9wcm90ZWN0R2l0aHViQnJhbmNoZXMnICk7XG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcblxuLy8gY2Fubm90IHVzZSBnZXRBY3RpdmVSZXBvcygpIGZyb20gcm9vdFxuY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoICdwZXJlbm5pYWwvZGF0YS9hY3RpdmUtcmVwb3MnLCAndXRmOCcgKS50cmltKCk7XG5jb25zdCBhY3RpdmVSZXBvcyA9IGNvbnRlbnRzLnNwbGl0KCAnXFxuJyApLm1hcCggc2ltID0+IHNpbS50cmltKCkgKTtcblxuLy8gcGVyZW5uaWFsLWFsaWFzIGlzIGFuIGV4Y2VwdGlvbiwgaXQgaXMganVzdCBhIGNsb25lIG9mIHRoZSBwZXJlbm5pYWwgcmVwb3NpdG9yeVxuaWYgKCBhY3RpdmVSZXBvcy5pbmNsdWRlcyggJ3BlcmVubmlhbC1hbGlhcycgKSApIHtcbiAgYWN0aXZlUmVwb3Muc3BsaWNlKCBhY3RpdmVSZXBvcy5pbmRleE9mKCAncGVyZW5uaWFsLWFsaWFzJyApLCAxICk7XG59XG5cbi8vIHNvIHRoYXQgZXhlY3V0aW9uIGRvZXNuJ3QgZmluaXNoIHVudGlsIGdpdGh1YlByb3RlY3RCcmFuY2hlcyByZXNvbHZlc1xuKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IHByb3RlY3RHaXRodWJCcmFuY2hlcy5wcm90ZWN0QnJhbmNoZXMoIGFjdGl2ZVJlcG9zICk7XG59ICkoKTsiXSwibmFtZXMiOlsicHJvdGVjdEdpdGh1YkJyYW5jaGVzIiwicmVxdWlyZSIsImZzIiwiY29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJ0cmltIiwiYWN0aXZlUmVwb3MiLCJzcGxpdCIsIm1hcCIsInNpbSIsImluY2x1ZGVzIiwic3BsaWNlIiwiaW5kZXhPZiIsInByb3RlY3RCcmFuY2hlcyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsd0JBQXdCQyxRQUFTO0FBQ3ZDLE1BQU1DLEtBQUtELFFBQVM7QUFFcEIsd0NBQXdDO0FBQ3hDLE1BQU1FLFdBQVdELEdBQUdFLFlBQVksQ0FBRSwrQkFBK0IsUUFBU0MsSUFBSTtBQUM5RSxNQUFNQyxjQUFjSCxTQUFTSSxLQUFLLENBQUUsTUFBT0MsR0FBRyxDQUFFQyxDQUFBQSxNQUFPQSxJQUFJSixJQUFJO0FBRS9ELGtGQUFrRjtBQUNsRixJQUFLQyxZQUFZSSxRQUFRLENBQUUsb0JBQXNCO0lBQy9DSixZQUFZSyxNQUFNLENBQUVMLFlBQVlNLE9BQU8sQ0FBRSxvQkFBcUI7QUFDaEU7QUFFQSx3RUFBd0U7QUFDdEUsb0JBQUE7SUFDQSxNQUFNWixzQkFBc0JhLGVBQWUsQ0FBRVA7QUFDL0MifQ==