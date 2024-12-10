// Copyright 2024, University of Colorado Boulder
/**
 * Check out a specific timestamp for a simulation and all of its declared dependencies
 * --repo : repository name where package.json should be read from
 * --timestamp : the timestamp to check things out for, e.g. --timestamp="Jan 08 2018"
 * --skipNpmUpdate : If provided, will prevent the usual npm update
 * @author Michael Kauzmann (PhET Interactive Simulations)
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
import assert from 'assert';
import assertIsValidRepoName from '../../common/assertIsValidRepoName.js';
import checkoutTimestamp from '../../common/checkoutTimestamp.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(getOption('timestamp'), 'Requires specifying a timestamp with --timestamp={{BRANCH}}');
    assertIsValidRepoName(repo);
    yield checkoutTimestamp(repo, getOption('timestamp'), !getOption('skipNpmUpdate'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jaGVja291dC10aW1lc3RhbXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrIG91dCBhIHNwZWNpZmljIHRpbWVzdGFtcCBmb3IgYSBzaW11bGF0aW9uIGFuZCBhbGwgb2YgaXRzIGRlY2xhcmVkIGRlcGVuZGVuY2llc1xuICogLS1yZXBvIDogcmVwb3NpdG9yeSBuYW1lIHdoZXJlIHBhY2thZ2UuanNvbiBzaG91bGQgYmUgcmVhZCBmcm9tXG4gKiAtLXRpbWVzdGFtcCA6IHRoZSB0aW1lc3RhbXAgdG8gY2hlY2sgdGhpbmdzIG91dCBmb3IsIGUuZy4gLS10aW1lc3RhbXA9XCJKYW4gMDggMjAxOFwiXG4gKiAtLXNraXBOcG1VcGRhdGUgOiBJZiBwcm92aWRlZCwgd2lsbCBwcmV2ZW50IHRoZSB1c3VhbCBucG0gdXBkYXRlXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBhc3NlcnRJc1ZhbGlkUmVwb05hbWUgZnJvbSAnLi4vLi4vY29tbW9uL2Fzc2VydElzVmFsaWRSZXBvTmFtZS5qcyc7XG5pbXBvcnQgY2hlY2tvdXRUaW1lc3RhbXAgZnJvbSAnLi4vLi4vY29tbW9uL2NoZWNrb3V0VGltZXN0YW1wLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKTtcblxuICBhc3NlcnQoIHJlcG8sICdSZXF1aXJlcyBzcGVjaWZ5aW5nIGEgcmVwb3NpdG9yeSB3aXRoIC0tcmVwbz17e1JFUE9TSVRPUll9fScgKTtcbiAgYXNzZXJ0KCBnZXRPcHRpb24oICd0aW1lc3RhbXAnICksICdSZXF1aXJlcyBzcGVjaWZ5aW5nIGEgdGltZXN0YW1wIHdpdGggLS10aW1lc3RhbXA9e3tCUkFOQ0h9fScgKTtcblxuICBhc3NlcnRJc1ZhbGlkUmVwb05hbWUoIHJlcG8gKTtcblxuICBhd2FpdCBjaGVja291dFRpbWVzdGFtcCggcmVwbywgZ2V0T3B0aW9uKCAndGltZXN0YW1wJyApLCAhZ2V0T3B0aW9uKCAnc2tpcE5wbVVwZGF0ZScgKSApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsImNoZWNrb3V0VGltZXN0YW1wIiwiZ2V0T3B0aW9uIiwicmVwbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyx1QkFBdUIsb0NBQW9DO0FBQ2xFLE9BQU9DLGVBQWUsc0JBQXNCO0FBRTFDLG9CQUFBO0lBQ0EsTUFBTUMsT0FBT0QsVUFBVztJQUV4QkgsT0FBUUksTUFBTTtJQUNkSixPQUFRRyxVQUFXLGNBQWU7SUFFbENGLHNCQUF1Qkc7SUFFdkIsTUFBTUYsa0JBQW1CRSxNQUFNRCxVQUFXLGNBQWUsQ0FBQ0EsVUFBVztBQUN2RSJ9