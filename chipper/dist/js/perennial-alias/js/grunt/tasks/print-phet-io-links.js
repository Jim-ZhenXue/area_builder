// Copyright 2024, University of Colorado Boulder
/**
 * Print the current list of all phet-io sims' links
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
import getPhetioLinks from '../../common/getPhetioLinks.js';
_async_to_generator(function*() {
    const phetioLinks = yield getPhetioLinks();
    console.log('Latest Links:');
    console.log(`\n${phetioLinks.join('\n')}`);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9wcmludC1waGV0LWlvLWxpbmtzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmludCB0aGUgY3VycmVudCBsaXN0IG9mIGFsbCBwaGV0LWlvIHNpbXMnIGxpbmtzXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGdldFBoZXRpb0xpbmtzIGZyb20gJy4uLy4uL2NvbW1vbi9nZXRQaGV0aW9MaW5rcy5qcyc7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwaGV0aW9MaW5rcyA9IGF3YWl0IGdldFBoZXRpb0xpbmtzKCk7XG5cbiAgY29uc29sZS5sb2coICdMYXRlc3QgTGlua3M6JyApO1xuICBjb25zb2xlLmxvZyggYFxcbiR7cGhldGlvTGlua3Muam9pbiggJ1xcbicgKX1gICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZ2V0UGhldGlvTGlua3MiLCJwaGV0aW9MaW5rcyIsImNvbnNvbGUiLCJsb2ciLCJqb2luIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7OztDQUdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLG9CQUFvQixpQ0FBaUM7QUFFMUQsb0JBQUE7SUFDQSxNQUFNQyxjQUFjLE1BQU1EO0lBRTFCRSxRQUFRQyxHQUFHLENBQUU7SUFDYkQsUUFBUUMsR0FBRyxDQUFFLENBQUMsRUFBRSxFQUFFRixZQUFZRyxJQUFJLENBQUUsT0FBUTtBQUM5QyJ9