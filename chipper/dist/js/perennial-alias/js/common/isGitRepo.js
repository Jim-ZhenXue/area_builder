// Copyright 2023, University of Colorado Boulder
/**
 * Checks to see if the git repo is initialized.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
const execute = require('./execute').default;
module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    try {
        // an arbitrary command that will fail if the repo is not initialized
        yield execute('git', [
            'status'
        ], `../${repo}`);
        return true;
    } catch (error) {
        return false;
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaXNHaXRSZXBvLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIHRoZSBnaXQgcmVwbyBpcyBpbml0aWFsaXplZC5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcblxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgdHJ5IHtcblxuICAgIC8vIGFuIGFyYml0cmFyeSBjb21tYW5kIHRoYXQgd2lsbCBmYWlsIGlmIHRoZSByZXBvIGlzIG5vdCBpbml0aWFsaXplZFxuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdzdGF0dXMnIF0sIGAuLi8ke3JlcG99YCApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNhdGNoKCBlcnJvciApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07Il0sIm5hbWVzIjpbImV4ZWN1dGUiLCJyZXF1aXJlIiwiZGVmYXVsdCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiZXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNELE1BQU1BLFVBQVVDLFFBQVMsYUFBY0MsT0FBTztBQUU5Q0MsT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSTtJQUNuQyxJQUFJO1FBRUYscUVBQXFFO1FBQ3JFLE1BQU1MLFFBQVMsT0FBTztZQUFFO1NBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRUssTUFBTTtRQUNoRCxPQUFPO0lBQ1QsRUFDQSxPQUFPQyxPQUFRO1FBQ2IsT0FBTztJQUNUO0FBQ0YifQ==