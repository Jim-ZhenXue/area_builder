// Copyright 2024, University of Colorado Boulder
/**
 * Check out the latest deployed production release branch for a simulation and all of its declared dependencies
 * --repo : repository name where package.json should be read from
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
import checkoutRelease from '../../common/checkoutRelease.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assertIsValidRepoName(repo);
    yield checkoutRelease(repo, !getOption('skipNpmUpdate'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jaGVja291dC1yZWxlYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVjayBvdXQgdGhlIGxhdGVzdCBkZXBsb3llZCBwcm9kdWN0aW9uIHJlbGVhc2UgYnJhbmNoIGZvciBhIHNpbXVsYXRpb24gYW5kIGFsbCBvZiBpdHMgZGVjbGFyZWQgZGVwZW5kZW5jaWVzXG4gKiAtLXJlcG8gOiByZXBvc2l0b3J5IG5hbWUgd2hlcmUgcGFja2FnZS5qc29uIHNob3VsZCBiZSByZWFkIGZyb21cbiAqIC0tc2tpcE5wbVVwZGF0ZSA6IElmIHByb3ZpZGVkLCB3aWxsIHByZXZlbnQgdGhlIHVzdWFsIG5wbSB1cGRhdGVcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBjaGVja291dFJlbGVhc2UgZnJvbSAnLi4vLi4vY29tbW9uL2NoZWNrb3V0UmVsZWFzZS5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgcmVwbyA9IGdldE9wdGlvbiggJ3JlcG8nICk7XG5cbiAgYXNzZXJ0KCByZXBvLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBhIHJlcG9zaXRvcnkgd2l0aCAtLXJlcG89e3tSRVBPU0lUT1JZfX0nICk7XG4gIGFzc2VydElzVmFsaWRSZXBvTmFtZSggcmVwbyApO1xuXG4gIGF3YWl0IGNoZWNrb3V0UmVsZWFzZSggcmVwbywgIWdldE9wdGlvbiggJ3NraXBOcG1VcGRhdGUnICkgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJhc3NlcnRJc1ZhbGlkUmVwb05hbWUiLCJjaGVja291dFJlbGVhc2UiLCJnZXRPcHRpb24iLCJyZXBvIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7O0NBS0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLDJCQUEyQix3Q0FBd0M7QUFDMUUsT0FBT0MscUJBQXFCLGtDQUFrQztBQUM5RCxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUNBLE1BQU1DLE9BQU9ELFVBQVc7SUFFeEJILE9BQVFJLE1BQU07SUFDZEgsc0JBQXVCRztJQUV2QixNQUFNRixnQkFBaUJFLE1BQU0sQ0FBQ0QsVUFBVztBQUMzQyJ9