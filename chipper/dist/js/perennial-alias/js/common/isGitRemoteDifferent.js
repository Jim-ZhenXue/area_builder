// Copyright 2021, University of Colorado Boulder
/**
 * Whether the current branch's remote SHA differs from the current SHA
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const assert = require('assert');
const getBranch = require('./getBranch');
const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');
/**
 * Whether the current branch's remote SHA differs from the current SHA
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<boolean>}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(repo) {
    assert(typeof repo === 'string');
    const branch = yield getBranch(repo);
    const currentSHA = yield gitRevParse(repo, 'HEAD');
    const remoteSHA = (yield getRemoteBranchSHAs(repo))[branch];
    return currentSHA !== remoteSHA;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vaXNHaXRSZW1vdGVEaWZmZXJlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJhbmNoJ3MgcmVtb3RlIFNIQSBkaWZmZXJzIGZyb20gdGhlIGN1cnJlbnQgU0hBXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5jb25zdCBnZXRCcmFuY2ggPSByZXF1aXJlKCAnLi9nZXRCcmFuY2gnICk7XG5jb25zdCBnZXRSZW1vdGVCcmFuY2hTSEFzID0gcmVxdWlyZSggJy4vZ2V0UmVtb3RlQnJhbmNoU0hBcycgKTtcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4vZ2l0UmV2UGFyc2UnICk7XG5cbi8qKlxuICogV2hldGhlciB0aGUgY3VycmVudCBicmFuY2gncyByZW1vdGUgU0hBIGRpZmZlcnMgZnJvbSB0aGUgY3VycmVudCBTSEFcbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcbiAgYXNzZXJ0KCB0eXBlb2YgcmVwbyA9PT0gJ3N0cmluZycgKTtcblxuICBjb25zdCBicmFuY2ggPSBhd2FpdCBnZXRCcmFuY2goIHJlcG8gKTtcbiAgY29uc3QgY3VycmVudFNIQSA9IGF3YWl0IGdpdFJldlBhcnNlKCByZXBvLCAnSEVBRCcgKTtcbiAgY29uc3QgcmVtb3RlU0hBID0gKCBhd2FpdCBnZXRSZW1vdGVCcmFuY2hTSEFzKCByZXBvICkgKVsgYnJhbmNoIF07XG5cbiAgcmV0dXJuIGN1cnJlbnRTSEEgIT09IHJlbW90ZVNIQTtcbn07Il0sIm5hbWVzIjpbImFzc2VydCIsInJlcXVpcmUiLCJnZXRCcmFuY2giLCJnZXRSZW1vdGVCcmFuY2hTSEFzIiwiZ2l0UmV2UGFyc2UiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5jaCIsImN1cnJlbnRTSEEiLCJyZW1vdGVTSEEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFNBQVNDLFFBQVM7QUFDeEIsTUFBTUMsWUFBWUQsUUFBUztBQUMzQixNQUFNRSxzQkFBc0JGLFFBQVM7QUFDckMsTUFBTUcsY0FBY0gsUUFBUztBQUU3Qjs7Ozs7O0NBTUMsR0FDREksT0FBT0MsT0FBTyxxQ0FBRyxVQUFnQkMsSUFBSTtJQUNuQ1AsT0FBUSxPQUFPTyxTQUFTO0lBRXhCLE1BQU1DLFNBQVMsTUFBTU4sVUFBV0s7SUFDaEMsTUFBTUUsYUFBYSxNQUFNTCxZQUFhRyxNQUFNO0lBQzVDLE1BQU1HLFlBQVksQUFBRSxDQUFBLE1BQU1QLG9CQUFxQkksS0FBSyxDQUFHLENBQUVDLE9BQVE7SUFFakUsT0FBT0MsZUFBZUM7QUFDeEIifQ==