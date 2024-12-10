// Copyright 2023-2024, University of Colorado Boulder
/**
 * Wait. Stop. Why do you want to remove the protection rules? Bad things often happen when you want to remove '
 * these. Do you want to delete a release branch? That is probably a bad idea. Maybe just merge main/ into your release '
 * branch. Paper trail about some of the unforeseen troubles can be found here: https://github.com/phetsims/perennial/issues/351
 * Also know that you can set a package flag, "ignoreForAutomatedMaintenanceReleases" to "ditch" a release branch forever.
 *
 * Remove branch protection rules for the provided repo so that main, and release CAN be modified.
 * It is faster to just remove branch protections from the github UI, but this is helpful for automation.
 * For example, you can use this if the automated maintenance release process needs to force push to
 * production branches.
 *
 * USAGE:
 * node perennial/js/scripts/clear-branch-protections-for-repo.js repository-name
 *
 * EXAMPLE:
 * node perennial/js/scripts/clear-branch-protections-for-repo.js john-travoltage
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
const args = process.argv.slice(2);
const repo = args[0];
if (!repo) {
    console.error('Repo name must be provided as first command line argument.');
} else {
    _async_to_generator(function*() {
        yield protectGithubBranches.clearBranchProtections([
            repo
        ]);
    })();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NsZWFyLWJyYW5jaC1wcm90ZWN0aW9ucy1mb3ItcmVwby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXYWl0LiBTdG9wLiBXaHkgZG8geW91IHdhbnQgdG8gcmVtb3ZlIHRoZSBwcm90ZWN0aW9uIHJ1bGVzPyBCYWQgdGhpbmdzIG9mdGVuIGhhcHBlbiB3aGVuIHlvdSB3YW50IHRvIHJlbW92ZSAnXG4gKiB0aGVzZS4gRG8geW91IHdhbnQgdG8gZGVsZXRlIGEgcmVsZWFzZSBicmFuY2g/IFRoYXQgaXMgcHJvYmFibHkgYSBiYWQgaWRlYS4gTWF5YmUganVzdCBtZXJnZSBtYWluLyBpbnRvIHlvdXIgcmVsZWFzZSAnXG4gKiBicmFuY2guIFBhcGVyIHRyYWlsIGFib3V0IHNvbWUgb2YgdGhlIHVuZm9yZXNlZW4gdHJvdWJsZXMgY2FuIGJlIGZvdW5kIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzM1MVxuICogQWxzbyBrbm93IHRoYXQgeW91IGNhbiBzZXQgYSBwYWNrYWdlIGZsYWcsIFwiaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlc1wiIHRvIFwiZGl0Y2hcIiBhIHJlbGVhc2UgYnJhbmNoIGZvcmV2ZXIuXG4gKlxuICogUmVtb3ZlIGJyYW5jaCBwcm90ZWN0aW9uIHJ1bGVzIGZvciB0aGUgcHJvdmlkZWQgcmVwbyBzbyB0aGF0IG1haW4sIGFuZCByZWxlYXNlIENBTiBiZSBtb2RpZmllZC5cbiAqIEl0IGlzIGZhc3RlciB0byBqdXN0IHJlbW92ZSBicmFuY2ggcHJvdGVjdGlvbnMgZnJvbSB0aGUgZ2l0aHViIFVJLCBidXQgdGhpcyBpcyBoZWxwZnVsIGZvciBhdXRvbWF0aW9uLlxuICogRm9yIGV4YW1wbGUsIHlvdSBjYW4gdXNlIHRoaXMgaWYgdGhlIGF1dG9tYXRlZCBtYWludGVuYW5jZSByZWxlYXNlIHByb2Nlc3MgbmVlZHMgdG8gZm9yY2UgcHVzaCB0b1xuICogcHJvZHVjdGlvbiBicmFuY2hlcy5cbiAqXG4gKiBVU0FHRTpcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvY2xlYXItYnJhbmNoLXByb3RlY3Rpb25zLWZvci1yZXBvLmpzIHJlcG9zaXRvcnktbmFtZVxuICpcbiAqIEVYQU1QTEU6XG4gKiBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL2NsZWFyLWJyYW5jaC1wcm90ZWN0aW9ucy1mb3ItcmVwby5qcyBqb2huLXRyYXZvbHRhZ2VcbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5jb25zdCBwcm90ZWN0R2l0aHViQnJhbmNoZXMgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Byb3RlY3RHaXRodWJCcmFuY2hlcycgKTtcblxuY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSggMiApO1xuY29uc3QgcmVwbyA9IGFyZ3NbIDAgXTtcblxuaWYgKCAhcmVwbyApIHtcbiAgY29uc29sZS5lcnJvciggJ1JlcG8gbmFtZSBtdXN0IGJlIHByb3ZpZGVkIGFzIGZpcnN0IGNvbW1hbmQgbGluZSBhcmd1bWVudC4nICk7XG59XG5lbHNlIHtcbiAgKCBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgcHJvdGVjdEdpdGh1YkJyYW5jaGVzLmNsZWFyQnJhbmNoUHJvdGVjdGlvbnMoIFsgcmVwbyBdICk7XG4gIH0gKSgpO1xufSJdLCJuYW1lcyI6WyJwcm90ZWN0R2l0aHViQnJhbmNoZXMiLCJyZXF1aXJlIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJyZXBvIiwiY29uc29sZSIsImVycm9yIiwiY2xlYXJCcmFuY2hQcm90ZWN0aW9ucyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FrQkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsd0JBQXdCQyxRQUFTO0FBRXZDLE1BQU1DLE9BQU9DLFFBQVFDLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0FBQ2pDLE1BQU1DLE9BQU9KLElBQUksQ0FBRSxFQUFHO0FBRXRCLElBQUssQ0FBQ0ksTUFBTztJQUNYQyxRQUFRQyxLQUFLLENBQUU7QUFDakIsT0FDSztJQUNELG9CQUFBO1FBQ0EsTUFBTVIsc0JBQXNCUyxzQkFBc0IsQ0FBRTtZQUFFSDtTQUFNO0lBQzlEO0FBQ0YifQ==