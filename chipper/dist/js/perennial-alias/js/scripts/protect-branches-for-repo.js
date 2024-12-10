// Copyright 2021, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
/**
 * Set branch protection rules for the provided repo so that main, and release branches cannot be deleted.
 *
 * USAGE:
 * node perennial/js/scripts/protect-branches-for-repo.js repository-name
 *
 * EXAMPLE:
 * node perennial/js/scripts/protect-branches-for-repo.js john-travoltage
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ const args = process.argv.slice(2);
const repo = args[0];
if (!repo) {
    console.error('Repo name must be provided as first command line argument.');
} else {
    _async_to_generator(function*() {
        yield protectGithubBranches.protectBranches([
            repo
        ]);
    })();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3Byb3RlY3QtYnJhbmNoZXMtZm9yLXJlcG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5jb25zdCBwcm90ZWN0R2l0aHViQnJhbmNoZXMgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Byb3RlY3RHaXRodWJCcmFuY2hlcycgKTtcblxuLyoqXG4gKiBTZXQgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgZm9yIHRoZSBwcm92aWRlZCByZXBvIHNvIHRoYXQgbWFpbiwgYW5kIHJlbGVhc2UgYnJhbmNoZXMgY2Fubm90IGJlIGRlbGV0ZWQuXG4gKlxuICogVVNBR0U6XG4gKiBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL3Byb3RlY3QtYnJhbmNoZXMtZm9yLXJlcG8uanMgcmVwb3NpdG9yeS1uYW1lXG4gKlxuICogRVhBTVBMRTpcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvcHJvdGVjdC1icmFuY2hlcy1mb3ItcmVwby5qcyBqb2huLXRyYXZvbHRhZ2VcbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5cbmNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcbmNvbnN0IHJlcG8gPSBhcmdzWyAwIF07XG5cbmlmICggIXJlcG8gKSB7XG4gIGNvbnNvbGUuZXJyb3IoICdSZXBvIG5hbWUgbXVzdCBiZSBwcm92aWRlZCBhcyBmaXJzdCBjb21tYW5kIGxpbmUgYXJndW1lbnQuJyApO1xufVxuZWxzZSB7XG4gICggYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IHByb3RlY3RHaXRodWJCcmFuY2hlcy5wcm90ZWN0QnJhbmNoZXMoIFsgcmVwbyBdICk7XG4gIH0gKSgpO1xufSJdLCJuYW1lcyI6WyJwcm90ZWN0R2l0aHViQnJhbmNoZXMiLCJyZXF1aXJlIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJyZXBvIiwiY29uc29sZSIsImVycm9yIiwicHJvdGVjdEJyYW5jaGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVqRCxNQUFNQSx3QkFBd0JDLFFBQVM7QUFFdkM7Ozs7Ozs7Ozs7Q0FVQyxHQUdELE1BQU1DLE9BQU9DLFFBQVFDLElBQUksQ0FBQ0MsS0FBSyxDQUFFO0FBQ2pDLE1BQU1DLE9BQU9KLElBQUksQ0FBRSxFQUFHO0FBRXRCLElBQUssQ0FBQ0ksTUFBTztJQUNYQyxRQUFRQyxLQUFLLENBQUU7QUFDakIsT0FDSztJQUNELG9CQUFBO1FBQ0EsTUFBTVIsc0JBQXNCUyxlQUFlLENBQUU7WUFBRUg7U0FBTTtJQUN2RDtBQUNGIn0=