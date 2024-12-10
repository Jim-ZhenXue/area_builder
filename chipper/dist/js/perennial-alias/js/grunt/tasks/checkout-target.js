// Copyright 2024, University of Colorado Boulder
/**
 * Check out a specific branch/SHA for a simulation and all of its declared dependencies
 * --repo : repository name where package.json should be read from
 * --target : the branch/SHA to check out
 * --branch : alias for --target
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
import checkoutTarget from '../../common/checkoutTarget.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assert(!(getOption('target') && getOption('branch')), '--target and --branch are the same option, only use one.');
    const target = getOption('target') || getOption('branch');
    assert(target, 'Requires specifying a branch/SHA with --target={{BRANCH}}');
    assertIsValidRepoName(repo);
    yield checkoutTarget(repo, target, !getOption('skipNpmUpdate'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jaGVja291dC10YXJnZXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENoZWNrIG91dCBhIHNwZWNpZmljIGJyYW5jaC9TSEEgZm9yIGEgc2ltdWxhdGlvbiBhbmQgYWxsIG9mIGl0cyBkZWNsYXJlZCBkZXBlbmRlbmNpZXNcbiAqIC0tcmVwbyA6IHJlcG9zaXRvcnkgbmFtZSB3aGVyZSBwYWNrYWdlLmpzb24gc2hvdWxkIGJlIHJlYWQgZnJvbVxuICogLS10YXJnZXQgOiB0aGUgYnJhbmNoL1NIQSB0byBjaGVjayBvdXRcbiAqIC0tYnJhbmNoIDogYWxpYXMgZm9yIC0tdGFyZ2V0XG4gKiAtLXNraXBOcG1VcGRhdGUgOiBJZiBwcm92aWRlZCwgd2lsbCBwcmV2ZW50IHRoZSB1c3VhbCBucG0gdXBkYXRlXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBhc3NlcnRJc1ZhbGlkUmVwb05hbWUgZnJvbSAnLi4vLi4vY29tbW9uL2Fzc2VydElzVmFsaWRSZXBvTmFtZS5qcyc7XG5pbXBvcnQgY2hlY2tvdXRUYXJnZXQgZnJvbSAnLi4vLi4vY29tbW9uL2NoZWNrb3V0VGFyZ2V0LmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKTtcblxuICBhc3NlcnQoIHJlcG8sICdSZXF1aXJlcyBzcGVjaWZ5aW5nIGEgcmVwb3NpdG9yeSB3aXRoIC0tcmVwbz17e1JFUE9TSVRPUll9fScgKTtcbiAgYXNzZXJ0KCAhKCBnZXRPcHRpb24oICd0YXJnZXQnICkgJiYgZ2V0T3B0aW9uKCAnYnJhbmNoJyApICksICctLXRhcmdldCBhbmQgLS1icmFuY2ggYXJlIHRoZSBzYW1lIG9wdGlvbiwgb25seSB1c2Ugb25lLicgKTtcbiAgY29uc3QgdGFyZ2V0ID0gZ2V0T3B0aW9uKCAndGFyZ2V0JyApIHx8IGdldE9wdGlvbiggJ2JyYW5jaCcgKTtcbiAgYXNzZXJ0KCB0YXJnZXQsICdSZXF1aXJlcyBzcGVjaWZ5aW5nIGEgYnJhbmNoL1NIQSB3aXRoIC0tdGFyZ2V0PXt7QlJBTkNIfX0nICk7XG5cbiAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG5cblxuICBhd2FpdCBjaGVja291dFRhcmdldCggcmVwbywgdGFyZ2V0LCAhZ2V0T3B0aW9uKCAnc2tpcE5wbVVwZGF0ZScgKSApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsImNoZWNrb3V0VGFyZ2V0IiwiZ2V0T3B0aW9uIiwicmVwbyIsInRhcmdldCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7O0NBT0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0QsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLDJCQUEyQix3Q0FBd0M7QUFDMUUsT0FBT0Msb0JBQW9CLGlDQUFpQztBQUM1RCxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUNBLE1BQU1DLE9BQU9ELFVBQVc7SUFFeEJILE9BQVFJLE1BQU07SUFDZEosT0FBUSxDQUFHRyxDQUFBQSxVQUFXLGFBQWNBLFVBQVcsU0FBUyxHQUFLO0lBQzdELE1BQU1FLFNBQVNGLFVBQVcsYUFBY0EsVUFBVztJQUNuREgsT0FBUUssUUFBUTtJQUVoQkosc0JBQXVCRztJQUd2QixNQUFNRixlQUFnQkUsTUFBTUMsUUFBUSxDQUFDRixVQUFXO0FBQ2xEIn0=