// Copyright 2024, University of Colorado Boulder
/**
 * Deploys a one-off version of the simulation (using the current or specified branch)
 * --repo : The name of the repository to deploy
 * --branch : The name of the one-off branch (the name of the one-off)
 * --brands : A comma-separated list of brand names to deploy
 * --noninteractive : If specified, prompts will be skipped. Some prompts that should not be automated will fail out
 * --message : An optional message that will be appended on version-change commits.
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
import getBranch from '../../common/getBranch.js';
import dev from '../dev.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    const brands = getOption('brands');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(brands, 'Requires specifying brands (comma-separated) with --brands={{BRANDS}}');
    assertIsValidRepoName(repo);
    let branch = getOption('branch');
    if (!branch) {
        branch = yield getBranch(repo);
        console.log(`--branch not provided, using ${branch} detected from ${repo}`);
    }
    assert(branch !== 'main', 'One-off deploys for main are unsupported.');
    yield dev(repo, brands.split(','), !!getOption('noninteractive'), branch, getOption('message'));
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9vbmUtb2ZmLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZXBsb3lzIGEgb25lLW9mZiB2ZXJzaW9uIG9mIHRoZSBzaW11bGF0aW9uICh1c2luZyB0aGUgY3VycmVudCBvciBzcGVjaWZpZWQgYnJhbmNoKVxuICogLS1yZXBvIDogVGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgdG8gZGVwbG95XG4gKiAtLWJyYW5jaCA6IFRoZSBuYW1lIG9mIHRoZSBvbmUtb2ZmIGJyYW5jaCAodGhlIG5hbWUgb2YgdGhlIG9uZS1vZmYpXG4gKiAtLWJyYW5kcyA6IEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgYnJhbmQgbmFtZXMgdG8gZGVwbG95XG4gKiAtLW5vbmludGVyYWN0aXZlIDogSWYgc3BlY2lmaWVkLCBwcm9tcHRzIHdpbGwgYmUgc2tpcHBlZC4gU29tZSBwcm9tcHRzIHRoYXQgc2hvdWxkIG5vdCBiZSBhdXRvbWF0ZWQgd2lsbCBmYWlsIG91dFxuICogLS1tZXNzYWdlIDogQW4gb3B0aW9uYWwgbWVzc2FnZSB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgb24gdmVyc2lvbi1jaGFuZ2UgY29tbWl0cy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIGZyb20gJy4uLy4uL2NvbW1vbi9hc3NlcnRJc1ZhbGlkUmVwb05hbWUuanMnO1xuaW1wb3J0IGdldEJyYW5jaCBmcm9tICcuLi8uLi9jb21tb24vZ2V0QnJhbmNoLmpzJztcbmltcG9ydCBkZXYgZnJvbSAnLi4vZGV2LmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gIGNvbnN0IHJlcG8gPSBnZXRPcHRpb24oICdyZXBvJyApO1xuICBjb25zdCBicmFuZHMgPSBnZXRPcHRpb24oICdicmFuZHMnICk7XG5cbiAgYXNzZXJ0KCByZXBvLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBhIHJlcG9zaXRvcnkgd2l0aCAtLXJlcG89e3tSRVBPU0lUT1JZfX0nICk7XG4gIGFzc2VydCggYnJhbmRzLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBicmFuZHMgKGNvbW1hLXNlcGFyYXRlZCkgd2l0aCAtLWJyYW5kcz17e0JSQU5EU319JyApO1xuICBhc3NlcnRJc1ZhbGlkUmVwb05hbWUoIHJlcG8gKTtcblxuICBsZXQgYnJhbmNoID0gZ2V0T3B0aW9uKCAnYnJhbmNoJyApO1xuICBpZiAoICFicmFuY2ggKSB7XG4gICAgYnJhbmNoID0gYXdhaXQgZ2V0QnJhbmNoKCByZXBvICk7XG4gICAgY29uc29sZS5sb2coIGAtLWJyYW5jaCBub3QgcHJvdmlkZWQsIHVzaW5nICR7YnJhbmNofSBkZXRlY3RlZCBmcm9tICR7cmVwb31gICk7XG4gIH1cbiAgYXNzZXJ0KCBicmFuY2ggIT09ICdtYWluJywgJ09uZS1vZmYgZGVwbG95cyBmb3IgbWFpbiBhcmUgdW5zdXBwb3J0ZWQuJyApO1xuXG4gIGF3YWl0IGRldiggcmVwbywgYnJhbmRzLnNwbGl0KCAnLCcgKSwgISFnZXRPcHRpb24oICdub25pbnRlcmFjdGl2ZScgKSwgYnJhbmNoLCBnZXRPcHRpb24oICdtZXNzYWdlJyApICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsImdldEJyYW5jaCIsImRldiIsImdldE9wdGlvbiIsInJlcG8iLCJicmFuZHMiLCJicmFuY2giLCJjb25zb2xlIiwibG9nIiwic3BsaXQiLCJwcm9jZXNzIiwiZXhpdCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7OztDQVFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQywyQkFBMkIsd0NBQXdDO0FBQzFFLE9BQU9DLGVBQWUsNEJBQTRCO0FBQ2xELE9BQU9DLFNBQVMsWUFBWTtBQUM1QixPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUVBLE1BQU1DLE9BQU9ELFVBQVc7SUFDeEIsTUFBTUUsU0FBU0YsVUFBVztJQUUxQkosT0FBUUssTUFBTTtJQUNkTCxPQUFRTSxRQUFRO0lBQ2hCTCxzQkFBdUJJO0lBRXZCLElBQUlFLFNBQVNILFVBQVc7SUFDeEIsSUFBSyxDQUFDRyxRQUFTO1FBQ2JBLFNBQVMsTUFBTUwsVUFBV0c7UUFDMUJHLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLDZCQUE2QixFQUFFRixPQUFPLGVBQWUsRUFBRUYsTUFBTTtJQUM3RTtJQUNBTCxPQUFRTyxXQUFXLFFBQVE7SUFFM0IsTUFBTUosSUFBS0UsTUFBTUMsT0FBT0ksS0FBSyxDQUFFLE1BQU8sQ0FBQyxDQUFDTixVQUFXLG1CQUFvQkcsUUFBUUgsVUFBVztJQUUxRixrS0FBa0s7SUFDbEtPLFFBQVFDLElBQUksQ0FBRTtBQUNoQiJ9