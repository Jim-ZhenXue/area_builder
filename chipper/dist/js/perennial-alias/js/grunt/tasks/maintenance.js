// Copyright 2024, University of Colorado Boulder
/**
 * Starts a maintenance REPL
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
import Maintenance from '../../common/Maintenance.js';
_async_to_generator(function*() {
    return Maintenance.startREPL();
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9tYWludGVuYW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3RhcnRzIGEgbWFpbnRlbmFuY2UgUkVQTFxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBNYWludGVuYW5jZSBmcm9tICcuLi8uLi9jb21tb24vTWFpbnRlbmFuY2UuanMnO1xuXG4oIGFzeW5jICgpID0+IE1haW50ZW5hbmNlLnN0YXJ0UkVQTCgpICkoKTsiXSwibmFtZXMiOlsiTWFpbnRlbmFuY2UiLCJzdGFydFJFUEwiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7O0NBR0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsT0FBT0EsaUJBQWlCLDhCQUE4QjtBQUVwRCxvQkFBQTtJQUFZQSxPQUFBQSxZQUFZQyxTQUFTIn0=