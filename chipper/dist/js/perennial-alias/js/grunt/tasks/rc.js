// Copyright 2024, University of Colorado Boulder
/**
 * Deploys an rc version of the simulation
 * --repo : The name of the repository to deploy
 * --branch : The release branch name (e.g. "1.7") that should be used for deployment
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
import rc from '../rc.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(getOption('branch'), 'Requires specifying a branch with --branch={{BRANCH}}');
    assert(getOption('brands'), 'Requires specifying brands (comma-separated) with --brands={{BRANDS}}');
    assertIsValidRepoName(repo);
    yield rc(repo, getOption('branch'), getOption('brands').split(','), !!getOption('noninteractive'), getOption('message'));
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9yYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVwbG95cyBhbiByYyB2ZXJzaW9uIG9mIHRoZSBzaW11bGF0aW9uXG4gKiAtLXJlcG8gOiBUaGUgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSB0byBkZXBsb3lcbiAqIC0tYnJhbmNoIDogVGhlIHJlbGVhc2UgYnJhbmNoIG5hbWUgKGUuZy4gXCIxLjdcIikgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgZGVwbG95bWVudFxuICogLS1icmFuZHMgOiBBIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIGJyYW5kIG5hbWVzIHRvIGRlcGxveVxuICogLS1ub25pbnRlcmFjdGl2ZSA6IElmIHNwZWNpZmllZCwgcHJvbXB0cyB3aWxsIGJlIHNraXBwZWQuIFNvbWUgcHJvbXB0cyB0aGF0IHNob3VsZCBub3QgYmUgYXV0b21hdGVkIHdpbGwgZmFpbCBvdXRcbiAqIC0tbWVzc2FnZSA6IEFuIG9wdGlvbmFsIG1lc3NhZ2UgdGhhdCB3aWxsIGJlIGFwcGVuZGVkIG9uIHZlcnNpb24tY2hhbmdlIGNvbW1pdHMuXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCByYyBmcm9tICcuLi9yYy5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgcmVwbyA9IGdldE9wdGlvbiggJ3JlcG8nICk7XG4gIGFzc2VydCggcmVwbywgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1yZXBvPXt7UkVQT1NJVE9SWX19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5jaCcgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBicmFuY2ggd2l0aCAtLWJyYW5jaD17e0JSQU5DSH19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5kcycgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYnJhbmRzIChjb21tYS1zZXBhcmF0ZWQpIHdpdGggLS1icmFuZHM9e3tCUkFORFN9fScgKTtcbiAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG5cbiAgYXdhaXQgcmMoIHJlcG8sIGdldE9wdGlvbiggJ2JyYW5jaCcgKSwgZ2V0T3B0aW9uKCAnYnJhbmRzJyApLnNwbGl0KCAnLCcgKSxcbiAgICAhIWdldE9wdGlvbiggJ25vbmludGVyYWN0aXZlJyApLCBnZXRPcHRpb24oICdtZXNzYWdlJyApICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsInJjIiwiZ2V0T3B0aW9uIiwicmVwbyIsInNwbGl0IiwicHJvY2VzcyIsImV4aXQiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxRQUFRLFdBQVc7QUFDMUIsT0FBT0MsZUFBZSxzQkFBc0I7QUFFMUMsb0JBQUE7SUFDQSxNQUFNQyxPQUFPRCxVQUFXO0lBQ3hCSCxPQUFRSSxNQUFNO0lBQ2RKLE9BQVFHLFVBQVcsV0FBWTtJQUMvQkgsT0FBUUcsVUFBVyxXQUFZO0lBQy9CRixzQkFBdUJHO0lBRXZCLE1BQU1GLEdBQUlFLE1BQU1ELFVBQVcsV0FBWUEsVUFBVyxVQUFXRSxLQUFLLENBQUUsTUFDbEUsQ0FBQyxDQUFDRixVQUFXLG1CQUFvQkEsVUFBVztJQUU5QyxrS0FBa0s7SUFDbEtHLFFBQVFDLElBQUksQ0FBRTtBQUNoQiJ9