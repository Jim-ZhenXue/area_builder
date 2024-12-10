// Copyright 2024, University of Colorado Boulder
/**
 * Builds a decaf version of the simulation
 * --project : The name of the project to deploy
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
import buildDecaf from '../decaf/buildDecaf.js';
import getOption from './util/getOption.js';
_async_to_generator(function*() {
    const project = getOption('project');
    assert(project, 'Requires specifying a repository with --project={{PROJECT}}');
    yield buildDecaf(project);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9idWlsZC1kZWNhZi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQnVpbGRzIGEgZGVjYWYgdmVyc2lvbiBvZiB0aGUgc2ltdWxhdGlvblxuICogLS1wcm9qZWN0IDogVGhlIG5hbWUgb2YgdGhlIHByb2plY3QgdG8gZGVwbG95XG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGJ1aWxkRGVjYWYgZnJvbSAnLi4vZGVjYWYvYnVpbGREZWNhZi5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vdXRpbC9nZXRPcHRpb24uanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgcHJvamVjdCA9IGdldE9wdGlvbiggJ3Byb2plY3QnICk7XG4gIGFzc2VydCggcHJvamVjdCwgJ1JlcXVpcmVzIHNwZWNpZnlpbmcgYSByZXBvc2l0b3J5IHdpdGggLS1wcm9qZWN0PXt7UFJPSkVDVH19JyApO1xuICBhd2FpdCBidWlsZERlY2FmKCBwcm9qZWN0ICk7XG59ICkoKTsiXSwibmFtZXMiOlsiYXNzZXJ0IiwiYnVpbGREZWNhZiIsImdldE9wdGlvbiIsInByb2plY3QiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQyxnQkFBZ0IseUJBQXlCO0FBQ2hELE9BQU9DLGVBQWUsc0JBQXNCO0FBRTFDLG9CQUFBO0lBQ0EsTUFBTUMsVUFBVUQsVUFBVztJQUMzQkYsT0FBUUcsU0FBUztJQUNqQixNQUFNRixXQUFZRTtBQUNwQiJ9