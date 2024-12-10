// Copyright 2024, University of Colorado Boulder
/**
 * Deploys a production (prototype) version of the simulation
 * --repo : The name of the repository to deploy
 * --branch : The release branch name (e.g. "1.7") that should be used for deployment
 * --brands : A comma-separated list of brand names to deploy
 * --noninteractive : If specified, prompts will be skipped. Some prompts that should not be automated will fail out
 * --redeploy: If specified with noninteractive, allow the production deploy to have the same version as the previous deploy
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
import production from '../production.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(getOption('branch'), 'Requires specifying a branch with --branch={{BRANCH}}');
    assert(getOption('brands'), 'Requires specifying brands (comma-separated) with --brands={{BRANDS}}');
    assertIsValidRepoName(repo);
    yield production(repo, getOption('branch'), getOption('brands').split(','), !!getOption('noninteractive'), getOption('redeploy'), getOption('message'));
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9wcm90b3R5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlcGxveXMgYSBwcm9kdWN0aW9uIChwcm90b3R5cGUpIHZlcnNpb24gb2YgdGhlIHNpbXVsYXRpb25cbiAqIC0tcmVwbyA6IFRoZSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5IHRvIGRlcGxveVxuICogLS1icmFuY2ggOiBUaGUgcmVsZWFzZSBicmFuY2ggbmFtZSAoZS5nLiBcIjEuN1wiKSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBkZXBsb3ltZW50XG4gKiAtLWJyYW5kcyA6IEEgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgYnJhbmQgbmFtZXMgdG8gZGVwbG95XG4gKiAtLW5vbmludGVyYWN0aXZlIDogSWYgc3BlY2lmaWVkLCBwcm9tcHRzIHdpbGwgYmUgc2tpcHBlZC4gU29tZSBwcm9tcHRzIHRoYXQgc2hvdWxkIG5vdCBiZSBhdXRvbWF0ZWQgd2lsbCBmYWlsIG91dFxuICogLS1yZWRlcGxveTogSWYgc3BlY2lmaWVkIHdpdGggbm9uaW50ZXJhY3RpdmUsIGFsbG93IHRoZSBwcm9kdWN0aW9uIGRlcGxveSB0byBoYXZlIHRoZSBzYW1lIHZlcnNpb24gYXMgdGhlIHByZXZpb3VzIGRlcGxveVxuICogLS1tZXNzYWdlIDogQW4gb3B0aW9uYWwgbWVzc2FnZSB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgb24gdmVyc2lvbi1jaGFuZ2UgY29tbWl0cy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBwcm9kdWN0aW9uIGZyb20gJy4uL3Byb2R1Y3Rpb24uanMnO1xuaW1wb3J0IGdldE9wdGlvbiBmcm9tICcuL3V0aWwvZ2V0T3B0aW9uLmpzJztcblxuKCBhc3luYyAoKSA9PiB7XG5cbiAgY29uc3QgcmVwbyA9IGdldE9wdGlvbiggJ3JlcG8nICk7XG4gIGFzc2VydCggcmVwbywgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1yZXBvPXt7UkVQT1NJVE9SWX19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5jaCcgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBicmFuY2ggd2l0aCAtLWJyYW5jaD17e0JSQU5DSH19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5kcycgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYnJhbmRzIChjb21tYS1zZXBhcmF0ZWQpIHdpdGggLS1icmFuZHM9e3tCUkFORFN9fScgKTtcbiAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG5cbiAgYXdhaXQgcHJvZHVjdGlvbiggcmVwbywgZ2V0T3B0aW9uKCAnYnJhbmNoJyApLCBnZXRPcHRpb24oICdicmFuZHMnICkuc3BsaXQoICcsJyApLCAhIWdldE9wdGlvbiggJ25vbmludGVyYWN0aXZlJyApLFxuICAgIGdldE9wdGlvbiggJ3JlZGVwbG95JyApLCBnZXRPcHRpb24oICdtZXNzYWdlJyApICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsInByb2R1Y3Rpb24iLCJnZXRPcHRpb24iLCJyZXBvIiwic3BsaXQiLCJwcm9jZXNzIiwiZXhpdCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Q0FTQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxnQkFBZ0IsbUJBQW1CO0FBQzFDLE9BQU9DLGVBQWUsc0JBQXNCO0FBRTFDLG9CQUFBO0lBRUEsTUFBTUMsT0FBT0QsVUFBVztJQUN4QkgsT0FBUUksTUFBTTtJQUNkSixPQUFRRyxVQUFXLFdBQVk7SUFDL0JILE9BQVFHLFVBQVcsV0FBWTtJQUMvQkYsc0JBQXVCRztJQUV2QixNQUFNRixXQUFZRSxNQUFNRCxVQUFXLFdBQVlBLFVBQVcsVUFBV0UsS0FBSyxDQUFFLE1BQU8sQ0FBQyxDQUFDRixVQUFXLG1CQUM5RkEsVUFBVyxhQUFjQSxVQUFXO0lBRXRDLGtLQUFrSztJQUNsS0csUUFBUUMsSUFBSSxDQUFFO0FBQ2hCIn0=