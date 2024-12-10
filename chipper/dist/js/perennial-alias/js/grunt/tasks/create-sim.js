// Copyright 2024, University of Colorado Boulder
/**
 * Creates a sim based on the simula-rasa template.
 * --repo="string" : the repository name
 * --author="string" : the author name
 * --title="string" : (optional) the simulation title
 * --clean=true : (optional) deletes the repository directory if it exists
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
import createSim from '../createSim.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const repo = getOption('repo');
    const author = getOption('author');
    const title = getOption('title');
    const clean = getOption('clean');
    assert(repo, 'Requires specifying a repository name with --repo={{REPO}}');
    assert(getOption('author'), 'Requires specifying a author with --author={{AUTHOR}}');
    assertIsValidRepoName(repo);
    yield createSim(repo, author, {
        title: title,
        clean: clean
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jcmVhdGUtc2ltLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDcmVhdGVzIGEgc2ltIGJhc2VkIG9uIHRoZSBzaW11bGEtcmFzYSB0ZW1wbGF0ZS5cbiAqIC0tcmVwbz1cInN0cmluZ1wiIDogdGhlIHJlcG9zaXRvcnkgbmFtZVxuICogLS1hdXRob3I9XCJzdHJpbmdcIiA6IHRoZSBhdXRob3IgbmFtZVxuICogLS10aXRsZT1cInN0cmluZ1wiIDogKG9wdGlvbmFsKSB0aGUgc2ltdWxhdGlvbiB0aXRsZVxuICogLS1jbGVhbj10cnVlIDogKG9wdGlvbmFsKSBkZWxldGVzIHRoZSByZXBvc2l0b3J5IGRpcmVjdG9yeSBpZiBpdCBleGlzdHNcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGFzc2VydElzVmFsaWRSZXBvTmFtZSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXJ0SXNWYWxpZFJlcG9OYW1lLmpzJztcbmltcG9ydCBjcmVhdGVTaW0gZnJvbSAnLi4vY3JlYXRlU2ltLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi91dGlsL2dldE9wdGlvbi5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuXG4gICAgY29uc3QgcmVwbyA9IGdldE9wdGlvbiggJ3JlcG8nICk7XG5cbiAgICBjb25zdCBhdXRob3IgPSBnZXRPcHRpb24oICdhdXRob3InICk7XG4gICAgY29uc3QgdGl0bGUgPSBnZXRPcHRpb24oICd0aXRsZScgKTtcbiAgICBjb25zdCBjbGVhbiA9IGdldE9wdGlvbiggJ2NsZWFuJyApO1xuXG4gICAgYXNzZXJ0KCByZXBvLCAnUmVxdWlyZXMgc3BlY2lmeWluZyBhIHJlcG9zaXRvcnkgbmFtZSB3aXRoIC0tcmVwbz17e1JFUE99fScgKTtcbiAgICBhc3NlcnQoIGdldE9wdGlvbiggJ2F1dGhvcicgKSwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSBhdXRob3Igd2l0aCAtLWF1dGhvcj17e0FVVEhPUn19JyApO1xuXG4gICAgYXNzZXJ0SXNWYWxpZFJlcG9OYW1lKCByZXBvICk7XG4gICAgYXdhaXQgY3JlYXRlU2ltKCByZXBvLCBhdXRob3IsIHsgdGl0bGU6IHRpdGxlLCBjbGVhbjogY2xlYW4gfSApO1xufSApKCk7Il0sIm5hbWVzIjpbImFzc2VydCIsImFzc2VydElzVmFsaWRSZXBvTmFtZSIsImNyZWF0ZVNpbSIsImdldE9wdGlvbiIsInJlcG8iLCJhdXRob3IiLCJ0aXRsZSIsImNsZWFuIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Q0FPQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDRCxPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsMkJBQTJCLHdDQUF3QztBQUMxRSxPQUFPQyxlQUFlLGtCQUFrQjtBQUN4QyxPQUFPQyxlQUFlLHNCQUFzQjtBQUUxQyxvQkFBQTtJQUVFLE1BQU1DLE9BQU9ELFVBQVc7SUFFeEIsTUFBTUUsU0FBU0YsVUFBVztJQUMxQixNQUFNRyxRQUFRSCxVQUFXO0lBQ3pCLE1BQU1JLFFBQVFKLFVBQVc7SUFFekJILE9BQVFJLE1BQU07SUFDZEosT0FBUUcsVUFBVyxXQUFZO0lBRS9CRixzQkFBdUJHO0lBQ3ZCLE1BQU1GLFVBQVdFLE1BQU1DLFFBQVE7UUFBRUMsT0FBT0E7UUFBT0MsT0FBT0E7SUFBTTtBQUNoRSJ9