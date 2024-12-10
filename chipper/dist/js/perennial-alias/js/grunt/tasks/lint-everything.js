// Copyright 2024, University of Colorado Boulder
/**
 * lint all js files for all repos
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
import grunt from 'grunt';
import getLintCLIOptions, { getLintEverythingRepos } from '../../eslint/getLintCLIOptions.js';
import lint from '../../eslint/lint.js';
_async_to_generator(function*() {
    const lintSuccess = yield lint(getLintEverythingRepos(), getLintCLIOptions());
    // Output results on errors.
    if (!lintSuccess) {
        grunt.fail.fatal('Lint failed');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy9saW50LWV2ZXJ5dGhpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGxpbnQgYWxsIGpzIGZpbGVzIGZvciBhbGwgcmVwb3NcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZ3J1bnQgZnJvbSAnZ3J1bnQnO1xuaW1wb3J0IGdldExpbnRDTElPcHRpb25zLCB7IGdldExpbnRFdmVyeXRoaW5nUmVwb3MgfSBmcm9tICcuLi8uLi9lc2xpbnQvZ2V0TGludENMSU9wdGlvbnMuanMnO1xuaW1wb3J0IGxpbnQgZnJvbSAnLi4vLi4vZXNsaW50L2xpbnQuanMnO1xuXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgbGludFN1Y2Nlc3MgPSBhd2FpdCBsaW50KCBnZXRMaW50RXZlcnl0aGluZ1JlcG9zKCksIGdldExpbnRDTElPcHRpb25zKCkgKTtcblxuICAvLyBPdXRwdXQgcmVzdWx0cyBvbiBlcnJvcnMuXG4gIGlmICggIWxpbnRTdWNjZXNzICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoICdMaW50IGZhaWxlZCcgKTtcbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbImdydW50IiwiZ2V0TGludENMSU9wdGlvbnMiLCJnZXRMaW50RXZlcnl0aGluZ1JlcG9zIiwibGludCIsImxpbnRTdWNjZXNzIiwiZmFpbCIsImZhdGFsIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7OztDQUdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFdBQVcsUUFBUTtBQUMxQixPQUFPQyxxQkFBcUJDLHNCQUFzQixRQUFRLG9DQUFvQztBQUM5RixPQUFPQyxVQUFVLHVCQUF1QjtBQUV0QyxvQkFBQTtJQUNBLE1BQU1DLGNBQWMsTUFBTUQsS0FBTUQsMEJBQTBCRDtJQUUxRCw0QkFBNEI7SUFDNUIsSUFBSyxDQUFDRyxhQUFjO1FBQ2xCSixNQUFNSyxJQUFJLENBQUNDLEtBQUssQ0FBRTtJQUNwQjtBQUNGIn0=