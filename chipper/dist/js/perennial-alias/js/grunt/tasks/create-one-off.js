// Copyright 2024, University of Colorado Boulder
/**
 * Creates a new release branch for a given simulation
 * --repo : The repository to add the release branch to
 * --branch : The branch/one-off name, which should be anything without dashes or periods
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
import createOneOff from '../createOneOff.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    const branch = getOption('branch');
    const message = getOption('message');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(branch, 'Requires specifying a branch with --branch={{BRANCH}}');
    assert(!branch.includes('-') && !branch.includes('.'), 'Branch should not contain dashes or periods');
    assertIsValidRepoName(repo);
    yield createOneOff(repo, branch, message);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jcmVhdGUtb25lLW9mZi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyByZWxlYXNlIGJyYW5jaCBmb3IgYSBnaXZlbiBzaW11bGF0aW9uXG4gKiAtLXJlcG8gOiBUaGUgcmVwb3NpdG9yeSB0byBhZGQgdGhlIHJlbGVhc2UgYnJhbmNoIHRvXG4gKiAtLWJyYW5jaCA6IFRoZSBicmFuY2gvb25lLW9mZiBuYW1lLCB3aGljaCBzaG91bGQgYmUgYW55dGhpbmcgd2l0aG91dCBkYXNoZXMgb3IgcGVyaW9kc1xuICogLS1tZXNzYWdlIDogQW4gb3B0aW9uYWwgbWVzc2FnZSB0aGF0IHdpbGwgYmUgYXBwZW5kZWQgb24gdmVyc2lvbi1jaGFuZ2UgY29tbWl0cy5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBjcmVhdGVPbmVPZmYgZnJvbSAnLi4vY3JlYXRlT25lT2ZmLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gIGNvbnN0IHJlcG8gPSBnZXRPcHRpb24oICdyZXBvJyApO1xuXG4gIGNvbnN0IGJyYW5jaCA9IGdldE9wdGlvbiggJ2JyYW5jaCcgKTtcbiAgY29uc3QgbWVzc2FnZSA9IGdldE9wdGlvbiggJ21lc3NhZ2UnICk7XG4gIGFzc2VydCggcmVwbywgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1yZXBvPXt7UkVQT1NJVE9SWX19JyApO1xuICBhc3NlcnQoIGJyYW5jaCwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBicmFuY2ggd2l0aCAtLWJyYW5jaD17e0JSQU5DSH19JyApO1xuICBhc3NlcnQoICFicmFuY2guaW5jbHVkZXMoICctJyApICYmICFicmFuY2guaW5jbHVkZXMoICcuJyApLCAnQnJhbmNoIHNob3VsZCBub3QgY29udGFpbiBkYXNoZXMgb3IgcGVyaW9kcycgKTtcbiAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG5cbiAgYXdhaXQgY3JlYXRlT25lT2ZmKCByZXBvLCBicmFuY2gsIG1lc3NhZ2UgKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJhc3NlcnRJc1ZhbGlkUmVwb05hbWUiLCJjcmVhdGVPbmVPZmYiLCJnZXRPcHRpb24iLCJyZXBvIiwiYnJhbmNoIiwibWVzc2FnZSIsImluY2x1ZGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQywyQkFBMkIsd0NBQXdDO0FBQzFFLE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0MsZUFBZSxzQkFBc0I7QUFFMUMsb0JBQUE7SUFFQSxNQUFNQyxPQUFPRCxVQUFXO0lBRXhCLE1BQU1FLFNBQVNGLFVBQVc7SUFDMUIsTUFBTUcsVUFBVUgsVUFBVztJQUMzQkgsT0FBUUksTUFBTTtJQUNkSixPQUFRSyxRQUFRO0lBQ2hCTCxPQUFRLENBQUNLLE9BQU9FLFFBQVEsQ0FBRSxRQUFTLENBQUNGLE9BQU9FLFFBQVEsQ0FBRSxNQUFPO0lBQzVETixzQkFBdUJHO0lBRXZCLE1BQU1GLGFBQWNFLE1BQU1DLFFBQVFDO0FBQ3BDIn0=