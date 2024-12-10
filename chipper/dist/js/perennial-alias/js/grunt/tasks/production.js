// Copyright 2024, University of Colorado Boulder
/**
 * Marks a simulation as published, and deploys a production version of the simulation
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
import markSimAsPublished from '../../common/markSimAsPublished.js';
import production from '../production.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(getOption('repo'), 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(getOption('branch'), 'Requires specifying a branch with --branch={{BRANCH}}');
    assert(getOption('brands'), 'Requires specifying brands (comma-separated) with --brands={{BRANDS}}');
    assertIsValidRepoName(repo);
    yield markSimAsPublished(repo);
    yield production(repo, getOption('branch'), getOption('brands').split(','), !!getOption('noninteractive'), getOption('redeploy'), getOption('message'));
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9wcm9kdWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYXJrcyBhIHNpbXVsYXRpb24gYXMgcHVibGlzaGVkLCBhbmQgZGVwbG95cyBhIHByb2R1Y3Rpb24gdmVyc2lvbiBvZiB0aGUgc2ltdWxhdGlvblxuICogLS1yZXBvIDogVGhlIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnkgdG8gZGVwbG95XG4gKiAtLWJyYW5jaCA6IFRoZSByZWxlYXNlIGJyYW5jaCBuYW1lIChlLmcuIFwiMS43XCIpIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIGRlcGxveW1lbnRcbiAqIC0tYnJhbmRzIDogQSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBicmFuZCBuYW1lcyB0byBkZXBsb3lcbiAqIC0tbm9uaW50ZXJhY3RpdmUgOiBJZiBzcGVjaWZpZWQsIHByb21wdHMgd2lsbCBiZSBza2lwcGVkLiBTb21lIHByb21wdHMgdGhhdCBzaG91bGQgbm90IGJlIGF1dG9tYXRlZCB3aWxsIGZhaWwgb3V0XG4gKiAtLXJlZGVwbG95OiBJZiBzcGVjaWZpZWQgd2l0aCBub25pbnRlcmFjdGl2ZSwgYWxsb3cgdGhlIHByb2R1Y3Rpb24gZGVwbG95IHRvIGhhdmUgdGhlIHNhbWUgdmVyc2lvbiBhcyB0aGUgcHJldmlvdXMgZGVwbG95XG4gKiAtLW1lc3NhZ2UgOiBBbiBvcHRpb25hbCBtZXNzYWdlIHRoYXQgd2lsbCBiZSBhcHBlbmRlZCBvbiB2ZXJzaW9uLWNoYW5nZSBjb21taXRzLlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIGZyb20gJy4uLy4uL2NvbW1vbi9hc3NlcnRJc1ZhbGlkUmVwb05hbWUuanMnO1xuaW1wb3J0IG1hcmtTaW1Bc1B1Ymxpc2hlZCBmcm9tICcuLi8uLi9jb21tb24vbWFya1NpbUFzUHVibGlzaGVkLmpzJztcbmltcG9ydCBwcm9kdWN0aW9uIGZyb20gJy4uL3Byb2R1Y3Rpb24uanMnO1xuaW1wb3J0IGdldE9wdGlvbiBmcm9tICcuL3V0aWwvZ2V0T3B0aW9uLmpzJztcblxuKCBhc3luYyAoKSA9PiB7XG5cbiAgY29uc3QgcmVwbyA9IGdldE9wdGlvbiggJ3JlcG8nICk7XG4gIGFzc2VydCggZ2V0T3B0aW9uKCAncmVwbycgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1yZXBvPXt7UkVQT1NJVE9SWX19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5jaCcgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBicmFuY2ggd2l0aCAtLWJyYW5jaD17e0JSQU5DSH19JyApO1xuICBhc3NlcnQoIGdldE9wdGlvbiggJ2JyYW5kcycgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYnJhbmRzIChjb21tYS1zZXBhcmF0ZWQpIHdpdGggLS1icmFuZHM9e3tCUkFORFN9fScgKTtcbiAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG5cbiAgYXdhaXQgbWFya1NpbUFzUHVibGlzaGVkKCByZXBvICk7XG5cbiAgYXdhaXQgcHJvZHVjdGlvbiggcmVwbywgZ2V0T3B0aW9uKCAnYnJhbmNoJyApLCBnZXRPcHRpb24oICdicmFuZHMnICkuc3BsaXQoICcsJyApLCAhIWdldE9wdGlvbiggJ25vbmludGVyYWN0aXZlJyApLFxuICAgIGdldE9wdGlvbiggJ3JlZGVwbG95JyApLCBnZXRPcHRpb24oICdtZXNzYWdlJyApICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsIm1hcmtTaW1Bc1B1Ymxpc2hlZCIsInByb2R1Y3Rpb24iLCJnZXRPcHRpb24iLCJyZXBvIiwic3BsaXQiLCJwcm9jZXNzIiwiZXhpdCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Q0FTQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyx3QkFBd0IscUNBQXFDO0FBQ3BFLE9BQU9DLGdCQUFnQixtQkFBbUI7QUFDMUMsT0FBT0MsZUFBZSxzQkFBc0I7QUFFMUMsb0JBQUE7SUFFQSxNQUFNQyxPQUFPRCxVQUFXO0lBQ3hCSixPQUFRSSxVQUFXLFNBQVU7SUFDN0JKLE9BQVFJLFVBQVcsV0FBWTtJQUMvQkosT0FBUUksVUFBVyxXQUFZO0lBQy9CSCxzQkFBdUJJO0lBRXZCLE1BQU1ILG1CQUFvQkc7SUFFMUIsTUFBTUYsV0FBWUUsTUFBTUQsVUFBVyxXQUFZQSxVQUFXLFVBQVdFLEtBQUssQ0FBRSxNQUFPLENBQUMsQ0FBQ0YsVUFBVyxtQkFDOUZBLFVBQVcsYUFBY0EsVUFBVztJQUV0QyxrS0FBa0s7SUFDbEtHLFFBQVFDLElBQUksQ0FBRTtBQUNoQiJ9