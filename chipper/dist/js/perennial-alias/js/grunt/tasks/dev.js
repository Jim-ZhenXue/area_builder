// Copyright 2024, University of Colorado Boulder
/**
 * Deploys a dev version of the simulation
 * --repo : The name of the repository to deploy
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
import dev from '../dev.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(getOption('brands'), 'Requires specifying brands (comma-separated) with --brands={{BRANDS}}');
    assertIsValidRepoName(repo);
    yield dev(repo, getOption('brands').split(','), !!getOption('noninteractive'), 'main', getOption('message'));
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9kZXYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlcGxveXMgYSBkZXYgdmVyc2lvbiBvZiB0aGUgc2ltdWxhdGlvblxuICogLS1yZXBvIDogVGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgdG8gZGVwbG95XG4gKiAtLWJyYW5kcyA6IEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgYnJhbmQgbmFtZXMgdG8gZGVwbG95XG4gKiAtLW5vbmludGVyYWN0aXZlIDogSWYgc3BlY2lmaWVkLCBwcm9tcHRzIHdpbGwgYmUgc2tpcHBlZC4gU29tZSBwcm9tcHRzIHRoYXQgc2hvdWxkIG5vdCBiZSBhdXRvbWF0ZWQgd2lsbCBmYWlsIG91dFxuICogLS1tZXNzYWdlIDogQW4gb3B0aW9uYWwgbWVzc2FnZSB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgb24gdmVyc2lvbi1jaGFuZ2UgY29tbWl0cy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBkZXYgZnJvbSAnLi4vZGV2LmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKTtcbiAgYXNzZXJ0KCByZXBvLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBhIHJlcG9zaXRvcnkgd2l0aCAtLXJlcG89e3tSRVBPU0lUT1JZfX0nICk7XG4gIGFzc2VydCggZ2V0T3B0aW9uKCAnYnJhbmRzJyApLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBicmFuZHMgKGNvbW1hLXNlcGFyYXRlZCkgd2l0aCAtLWJyYW5kcz17e0JSQU5EU319JyApO1xuXG4gIGFzc2VydElzVmFsaWRSZXBvTmFtZSggcmVwbyApO1xuXG4gIGF3YWl0IGRldiggcmVwbywgZ2V0T3B0aW9uKCAnYnJhbmRzJyApLnNwbGl0KCAnLCcgKSwgISFnZXRPcHRpb24oICdub25pbnRlcmFjdGl2ZScgKSwgJ21haW4nLCBnZXRPcHRpb24oICdtZXNzYWdlJyApICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsImRldiIsImdldE9wdGlvbiIsInJlcG8iLCJzcGxpdCIsInByb2Nlc3MiLCJleGl0Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Q0FPQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxTQUFTLFlBQVk7QUFDNUIsT0FBT0MsZUFBZSxzQkFBc0I7QUFFMUMsb0JBQUE7SUFDQSxNQUFNQyxPQUFPRCxVQUFXO0lBQ3hCSCxPQUFRSSxNQUFNO0lBQ2RKLE9BQVFHLFVBQVcsV0FBWTtJQUUvQkYsc0JBQXVCRztJQUV2QixNQUFNRixJQUFLRSxNQUFNRCxVQUFXLFVBQVdFLEtBQUssQ0FBRSxNQUFPLENBQUMsQ0FBQ0YsVUFBVyxtQkFBb0IsUUFBUUEsVUFBVztJQUV6RyxrS0FBa0s7SUFDbEtHLFFBQVFDLElBQUksQ0FBRTtBQUNoQiJ9