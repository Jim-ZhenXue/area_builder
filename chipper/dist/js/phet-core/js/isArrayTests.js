// Copyright 2017-2023, University of Colorado Boulder
/**
 * isArray tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import isArray from './isArray.js';
QUnit.module('isArray');
QUnit.test('isArray', (assert)=>{
    assert.ok(isArray([
        1,
        2,
        3
    ]));
    assert.ok(isArray([]));
    assert.ok(!isArray(0));
    assert.ok(!isArray({}));
    assert.ok(!isArray(()=>{}));
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pc0FycmF5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogaXNBcnJheSB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBpc0FycmF5IGZyb20gJy4vaXNBcnJheS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ2lzQXJyYXknICk7XG5cblFVbml0LnRlc3QoICdpc0FycmF5JywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCBpc0FycmF5KCBbIDEsIDIsIDMgXSApICk7XG4gIGFzc2VydC5vayggaXNBcnJheSggW10gKSApO1xuICBhc3NlcnQub2soICFpc0FycmF5KCAwICkgKTtcbiAgYXNzZXJ0Lm9rKCAhaXNBcnJheSgge30gKSApO1xuICBhc3NlcnQub2soICFpc0FycmF5KCAoKSA9PiB7IC8qIGVtcHR5ICovIH0gKSApO1xufSApOyJdLCJuYW1lcyI6WyJpc0FycmF5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGFBQWEsZUFBZTtBQUVuQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxXQUFXQyxDQUFBQTtJQUNyQkEsT0FBT0MsRUFBRSxDQUFFTCxRQUFTO1FBQUU7UUFBRztRQUFHO0tBQUc7SUFDL0JJLE9BQU9DLEVBQUUsQ0FBRUwsUUFBUyxFQUFFO0lBQ3RCSSxPQUFPQyxFQUFFLENBQUUsQ0FBQ0wsUUFBUztJQUNyQkksT0FBT0MsRUFBRSxDQUFFLENBQUNMLFFBQVMsQ0FBQztJQUN0QkksT0FBT0MsRUFBRSxDQUFFLENBQUNMLFFBQVMsS0FBb0I7QUFDM0MifQ==