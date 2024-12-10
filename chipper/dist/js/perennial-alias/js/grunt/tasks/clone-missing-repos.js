// Copyright 2024, University of Colorado Boulder
/**
 * Clones any repos not currently checked out in the code base.
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
import cloneMissingRepos from '../../common/cloneMissingRepos.js';
_async_to_generator(function*() {
    return cloneMissingRepos();
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9jbG9uZS1taXNzaW5nLXJlcG9zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDbG9uZXMgYW55IHJlcG9zIG5vdCBjdXJyZW50bHkgY2hlY2tlZCBvdXQgaW4gdGhlIGNvZGUgYmFzZS5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgY2xvbmVNaXNzaW5nUmVwb3MgZnJvbSAnLi4vLi4vY29tbW9uL2Nsb25lTWlzc2luZ1JlcG9zLmpzJztcblxuKCBhc3luYyAoKSA9PiBjbG9uZU1pc3NpbmdSZXBvcygpICkoKTsiXSwibmFtZXMiOlsiY2xvbmVNaXNzaW5nUmVwb3MiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7O0NBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsdUJBQXVCLG9DQUFvQztBQUVoRSxvQkFBQTtJQUFZQSxPQUFBQSJ9