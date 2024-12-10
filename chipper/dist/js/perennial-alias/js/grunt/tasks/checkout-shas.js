// Copyright 2024, University of Colorado Boulder
/**
 * Check out shas for a project, as specified in dependencies.json
 * --repo : repository name where package.json should be read from
 * --skipNpmUpdate : If provided, will prevent the usual npm update
 * --buildServer : If provided, it will read dependencies from the build-server temporary location (and will skip npm update)
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
import { readFileSync } from 'fs';
import assertIsValidRepoName from '../../common/assertIsValidRepoName.js';
import checkoutDependencies from '../../common/checkoutDependencies.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    assert(getOption('repo'), 'Requires specifying a repository with --repo={{REPOSITORY}}');
    const repo = getOption('repo');
    assertIsValidRepoName(repo);
    const dependencies = JSON.parse(readFileSync(`../${repo}/dependencies.json`, 'utf8'));
    yield checkoutDependencies(repo, dependencies, !getOption('skipNpmUpdate'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jaGVja291dC1zaGFzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVjayBvdXQgc2hhcyBmb3IgYSBwcm9qZWN0LCBhcyBzcGVjaWZpZWQgaW4gZGVwZW5kZW5jaWVzLmpzb25cbiAqIC0tcmVwbyA6IHJlcG9zaXRvcnkgbmFtZSB3aGVyZSBwYWNrYWdlLmpzb24gc2hvdWxkIGJlIHJlYWQgZnJvbVxuICogLS1za2lwTnBtVXBkYXRlIDogSWYgcHJvdmlkZWQsIHdpbGwgcHJldmVudCB0aGUgdXN1YWwgbnBtIHVwZGF0ZVxuICogLS1idWlsZFNlcnZlciA6IElmIHByb3ZpZGVkLCBpdCB3aWxsIHJlYWQgZGVwZW5kZW5jaWVzIGZyb20gdGhlIGJ1aWxkLXNlcnZlciB0ZW1wb3JhcnkgbG9jYXRpb24gKGFuZCB3aWxsIHNraXAgbnBtIHVwZGF0ZSlcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBjaGVja291dERlcGVuZGVuY2llcyBmcm9tICcuLi8uLi9jb21tb24vY2hlY2tvdXREZXBlbmRlbmNpZXMuanMnO1xuaW1wb3J0IGdldE9wdGlvbiBmcm9tICcuL3V0aWwvZ2V0T3B0aW9uLmpzJztcblxuKCBhc3luYyAoKSA9PiB7XG4gIGFzc2VydCggZ2V0T3B0aW9uKCAncmVwbycgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1yZXBvPXt7UkVQT1NJVE9SWX19JyApO1xuXG4gIGNvbnN0IHJlcG8gPSBnZXRPcHRpb24oICdyZXBvJyApO1xuICBhc3NlcnRJc1ZhbGlkUmVwb05hbWUoIHJlcG8gKTtcblxuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L2RlcGVuZGVuY2llcy5qc29uYCwgJ3V0ZjgnICkgKTtcbiAgYXdhaXQgY2hlY2tvdXREZXBlbmRlbmNpZXMoIHJlcG8sIGRlcGVuZGVuY2llcywgIWdldE9wdGlvbiggJ3NraXBOcG1VcGRhdGUnICkgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJyZWFkRmlsZVN5bmMiLCJhc3NlcnRJc1ZhbGlkUmVwb05hbWUiLCJjaGVja291dERlcGVuZGVuY2llcyIsImdldE9wdGlvbiIsInJlcG8iLCJkZXBlbmRlbmNpZXMiLCJKU09OIiwicGFyc2UiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7O0NBTUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLFNBQVNDLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLDJCQUEyQix3Q0FBd0M7QUFDMUUsT0FBT0MsMEJBQTBCLHVDQUF1QztBQUN4RSxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUNBSixPQUFRSSxVQUFXLFNBQVU7SUFFN0IsTUFBTUMsT0FBT0QsVUFBVztJQUN4QkYsc0JBQXVCRztJQUV2QixNQUFNQyxlQUFlQyxLQUFLQyxLQUFLLENBQUVQLGFBQWMsQ0FBQyxHQUFHLEVBQUVJLEtBQUssa0JBQWtCLENBQUMsRUFBRTtJQUMvRSxNQUFNRixxQkFBc0JFLE1BQU1DLGNBQWMsQ0FBQ0YsVUFBVztBQUM5RCJ9