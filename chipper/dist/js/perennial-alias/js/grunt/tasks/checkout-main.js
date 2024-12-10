// Copyright 2024, University of Colorado Boulder
/**
 * Check out main branch for all dependencies, as specified in dependencies.json
 * --repo : repository name where package.json should be read from
 * --skipNpmUpdate : If provided, will prevent the usual npm update
 *
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
import checkoutMain from '../../common/checkoutMain.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    assert(repo, 'Requires specifying a repository with --repo={{REPOSITORY}}');
    assertIsValidRepoName(repo);
    yield checkoutMain(repo, !getOption('skipNpmUpdate'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jaGVja291dC1tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVjayBvdXQgbWFpbiBicmFuY2ggZm9yIGFsbCBkZXBlbmRlbmNpZXMsIGFzIHNwZWNpZmllZCBpbiBkZXBlbmRlbmNpZXMuanNvblxuICogLS1yZXBvIDogcmVwb3NpdG9yeSBuYW1lIHdoZXJlIHBhY2thZ2UuanNvbiBzaG91bGQgYmUgcmVhZCBmcm9tXG4gKiAtLXNraXBOcG1VcGRhdGUgOiBJZiBwcm92aWRlZCwgd2lsbCBwcmV2ZW50IHRoZSB1c3VhbCBucG0gdXBkYXRlXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIGZyb20gJy4uLy4uL2NvbW1vbi9hc3NlcnRJc1ZhbGlkUmVwb05hbWUuanMnO1xuaW1wb3J0IGNoZWNrb3V0TWFpbiBmcm9tICcuLi8uLi9jb21tb24vY2hlY2tvdXRNYWluLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCByZXBvID0gZ2V0T3B0aW9uKCAncmVwbycgKTtcblxuICBhc3NlcnQoIHJlcG8sICdSZXF1aXJlcyBzcGVjaWZ5aW5nIGEgcmVwb3NpdG9yeSB3aXRoIC0tcmVwbz17e1JFUE9TSVRPUll9fScgKTtcblxuICBhc3NlcnRJc1ZhbGlkUmVwb05hbWUoIHJlcG8gKTtcblxuICBhd2FpdCBjaGVja291dE1haW4oIHJlcG8sICFnZXRPcHRpb24oICdza2lwTnBtVXBkYXRlJyApICk7XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiYXNzZXJ0SXNWYWxpZFJlcG9OYW1lIiwiY2hlY2tvdXRNYWluIiwiZ2V0T3B0aW9uIiwicmVwbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Q0FNQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxrQkFBa0IsK0JBQStCO0FBQ3hELE9BQU9DLGVBQWUsc0JBQXNCO0FBRTFDLG9CQUFBO0lBQ0EsTUFBTUMsT0FBT0QsVUFBVztJQUV4QkgsT0FBUUksTUFBTTtJQUVkSCxzQkFBdUJHO0lBRXZCLE1BQU1GLGFBQWNFLE1BQU0sQ0FBQ0QsVUFBVztBQUN4QyJ9