// Copyright 2024, University of Colorado Boulder
/**
 * Creates a new release branch for a given simulation
 * --repo : The repository to add the release branch to
 * --branch : The branch name, which should be {{MAJOR}}.{{MINOR}}, e.g. 1.0
 * --brands : The supported brands for the release, comma separated.
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
import createRelease from '../createRelease.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    const branch = getOption('branch');
    const message = getOption('message');
    const brands = getOption('brands');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(brands, 'Requires specifying brands with --brands={{BRANDS}} (comma separated)');
    assert(branch, 'Requires specifying a branch with --branch={{BRANCH}}');
    assert(branch.split('.').length === 2, 'Branch should be {{MAJOR}}.{{MINOR}}');
    assertIsValidRepoName(repo);
    yield createRelease(repo, branch, brands.split(','), message);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jcmVhdGUtcmVsZWFzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyByZWxlYXNlIGJyYW5jaCBmb3IgYSBnaXZlbiBzaW11bGF0aW9uXG4gKiAtLXJlcG8gOiBUaGUgcmVwb3NpdG9yeSB0byBhZGQgdGhlIHJlbGVhc2UgYnJhbmNoIHRvXG4gKiAtLWJyYW5jaCA6IFRoZSBicmFuY2ggbmFtZSwgd2hpY2ggc2hvdWxkIGJlIHt7TUFKT1J9fS57e01JTk9SfX0sIGUuZy4gMS4wXG4gKiAtLWJyYW5kcyA6IFRoZSBzdXBwb3J0ZWQgYnJhbmRzIGZvciB0aGUgcmVsZWFzZSwgY29tbWEgc2VwYXJhdGVkLlxuICogLS1tZXNzYWdlIDogQW4gb3B0aW9uYWwgbWVzc2FnZSB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgb24gdmVyc2lvbi1jaGFuZ2UgY29tbWl0cy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIGZyb20gJy4uLy4uL2NvbW1vbi9hc3NlcnRJc1ZhbGlkUmVwb05hbWUuanMnO1xuaW1wb3J0IGNyZWF0ZVJlbGVhc2UgZnJvbSAnLi4vY3JlYXRlUmVsZWFzZS5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKTtcblxuICBjb25zdCBicmFuY2ggPSBnZXRPcHRpb24oICdicmFuY2gnICk7XG4gIGNvbnN0IG1lc3NhZ2UgPSBnZXRPcHRpb24oICdtZXNzYWdlJyApO1xuICBjb25zdCBicmFuZHMgPSBnZXRPcHRpb24oICdicmFuZHMnICk7XG5cbiAgYXNzZXJ0KCByZXBvLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBhIHJlcG9zaXRvcnkgd2l0aCAtLXJlcG89e3tSRVBPU0lUT1JZfX0nICk7XG4gIGFzc2VydCggYnJhbmRzLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBicmFuZHMgd2l0aCAtLWJyYW5kcz17e0JSQU5EU319IChjb21tYSBzZXBhcmF0ZWQpJyApO1xuICBhc3NlcnQoIGJyYW5jaCwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBicmFuY2ggd2l0aCAtLWJyYW5jaD17e0JSQU5DSH19JyApO1xuICBhc3NlcnQoIGJyYW5jaC5zcGxpdCggJy4nICkubGVuZ3RoID09PSAyLCAnQnJhbmNoIHNob3VsZCBiZSB7e01BSk9SfX0ue3tNSU5PUn19JyApO1xuXG4gIGFzc2VydElzVmFsaWRSZXBvTmFtZSggcmVwbyApO1xuICBhd2FpdCBjcmVhdGVSZWxlYXNlKCByZXBvLCBicmFuY2gsIGJyYW5kcy5zcGxpdCggJywnICksIG1lc3NhZ2UgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJhc3NlcnRJc1ZhbGlkUmVwb05hbWUiLCJjcmVhdGVSZWxlYXNlIiwiZ2V0T3B0aW9uIiwicmVwbyIsImJyYW5jaCIsIm1lc3NhZ2UiLCJicmFuZHMiLCJzcGxpdCIsImxlbmd0aCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLDJCQUEyQix3Q0FBd0M7QUFDMUUsT0FBT0MsbUJBQW1CLHNCQUFzQjtBQUNoRCxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUVBLE1BQU1DLE9BQU9ELFVBQVc7SUFFeEIsTUFBTUUsU0FBU0YsVUFBVztJQUMxQixNQUFNRyxVQUFVSCxVQUFXO0lBQzNCLE1BQU1JLFNBQVNKLFVBQVc7SUFFMUJILE9BQVFJLE1BQU07SUFDZEosT0FBUU8sUUFBUTtJQUNoQlAsT0FBUUssUUFBUTtJQUNoQkwsT0FBUUssT0FBT0csS0FBSyxDQUFFLEtBQU1DLE1BQU0sS0FBSyxHQUFHO0lBRTFDUixzQkFBdUJHO0lBQ3ZCLE1BQU1GLGNBQWVFLE1BQU1DLFFBQVFFLE9BQU9DLEtBQUssQ0FBRSxNQUFPRjtBQUMxRCJ9