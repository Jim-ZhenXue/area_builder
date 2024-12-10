// Copyright 2017, University of Colorado Boulder
/**
 * Gives a yes-or-no prompt that the user should respond to.
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
const prompt = require('./prompt');
/**
 * Gives a yes-or-no prompt that the user should respond to.
 * @public
 *
 * @param {string} question - The string to be shown to the user
 * @param {boolean} noninteractive - If true, skips the prompt
 * @returns {Promise.<boolean>}
 */ module.exports = /*#__PURE__*/ function() {
    var _booleanPrompt = _async_to_generator(function*(question, noninteractive) {
        if (noninteractive) {
            return true;
        }
        const answer = yield prompt(`${question} [y/N]?`);
        return !/[Nn]/.test(answer) && /[Yy]/.test(answer);
    });
    function booleanPrompt(question, noninteractive) {
        return _booleanPrompt.apply(this, arguments);
    }
    return booleanPrompt;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vYm9vbGVhblByb21wdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2l2ZXMgYSB5ZXMtb3Itbm8gcHJvbXB0IHRoYXQgdGhlIHVzZXIgc2hvdWxkIHJlc3BvbmQgdG8uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmNvbnN0IHByb21wdCA9IHJlcXVpcmUoICcuL3Byb21wdCcgKTtcblxuLyoqXG4gKiBHaXZlcyBhIHllcy1vci1ubyBwcm9tcHQgdGhhdCB0aGUgdXNlciBzaG91bGQgcmVzcG9uZCB0by5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcXVlc3Rpb24gLSBUaGUgc3RyaW5nIHRvIGJlIHNob3duIHRvIHRoZSB1c2VyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG5vbmludGVyYWN0aXZlIC0gSWYgdHJ1ZSwgc2tpcHMgdGhlIHByb21wdFxuICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIGJvb2xlYW5Qcm9tcHQoIHF1ZXN0aW9uLCBub25pbnRlcmFjdGl2ZSApIHtcbiAgaWYgKCBub25pbnRlcmFjdGl2ZSApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IGFuc3dlciA9IGF3YWl0IHByb21wdCggYCR7cXVlc3Rpb259IFt5L05dP2AgKTtcblxuICByZXR1cm4gISggL1tObl0vLnRlc3QoIGFuc3dlciApICkgJiYgL1tZeV0vLnRlc3QoIGFuc3dlciApO1xufTsiXSwibmFtZXMiOlsicHJvbXB0IiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJib29sZWFuUHJvbXB0IiwicXVlc3Rpb24iLCJub25pbnRlcmFjdGl2ZSIsImFuc3dlciIsInRlc3QiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE1BQU1BLFNBQVNDLFFBQVM7QUFFeEI7Ozs7Ozs7Q0FPQyxHQUNEQyxPQUFPQyxPQUFPO1FBQWtCQyxpQkFBZixvQkFBQSxVQUE4QkMsUUFBUSxFQUFFQyxjQUFjO1FBQ3JFLElBQUtBLGdCQUFpQjtZQUNwQixPQUFPO1FBQ1Q7UUFFQSxNQUFNQyxTQUFTLE1BQU1QLE9BQVEsR0FBR0ssU0FBUyxPQUFPLENBQUM7UUFFakQsT0FBTyxDQUFHLE9BQU9HLElBQUksQ0FBRUQsV0FBYyxPQUFPQyxJQUFJLENBQUVEO0lBQ3BEO2FBUmdDSCxjQUFlQyxRQUFRLEVBQUVDLGNBQWM7ZUFBdkNGOztXQUFBQSJ9