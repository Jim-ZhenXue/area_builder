// Copyright 2017-2023, University of Colorado Boulder
/**
 * cleanArray tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import cleanArray from './cleanArray.js';
QUnit.module('cleanArray');
QUnit.test('cleanArray', (assert)=>{
    assert.ok(cleanArray().length === 0, 'Given no argument, should return a fresh empty array');
    assert.ok(cleanArray(undefined).length === 0, 'Given undefined, should return a fresh empty array');
    assert.ok(cleanArray(null).length === 0, 'Given null, should return a fresh empty array');
    const arr1 = [
        '5'
    ];
    const arr2 = cleanArray(arr1);
    assert.ok(arr1 === arr2, 'Should use the same array object provided');
    assert.ok(arr2.length === 0, 'Should empty it out');
    assert.ok(arr1.length === 0, 'Also empties the original (sanity check)');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogY2xlYW5BcnJheSB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4vY2xlYW5BcnJheS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ2NsZWFuQXJyYXknICk7XG5cblFVbml0LnRlc3QoICdjbGVhbkFycmF5JywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCBjbGVhbkFycmF5KCkubGVuZ3RoID09PSAwLCAnR2l2ZW4gbm8gYXJndW1lbnQsIHNob3VsZCByZXR1cm4gYSBmcmVzaCBlbXB0eSBhcnJheScgKTtcbiAgYXNzZXJ0Lm9rKCBjbGVhbkFycmF5KCB1bmRlZmluZWQgKS5sZW5ndGggPT09IDAsICdHaXZlbiB1bmRlZmluZWQsIHNob3VsZCByZXR1cm4gYSBmcmVzaCBlbXB0eSBhcnJheScgKTtcbiAgYXNzZXJ0Lm9rKCBjbGVhbkFycmF5KCBudWxsICkubGVuZ3RoID09PSAwLCAnR2l2ZW4gbnVsbCwgc2hvdWxkIHJldHVybiBhIGZyZXNoIGVtcHR5IGFycmF5JyApO1xuICBjb25zdCBhcnIxID0gWyAnNScgXTtcbiAgY29uc3QgYXJyMiA9IGNsZWFuQXJyYXkoIGFycjEgKTtcbiAgYXNzZXJ0Lm9rKCBhcnIxID09PSBhcnIyLCAnU2hvdWxkIHVzZSB0aGUgc2FtZSBhcnJheSBvYmplY3QgcHJvdmlkZWQnICk7XG4gIGFzc2VydC5vayggYXJyMi5sZW5ndGggPT09IDAsICdTaG91bGQgZW1wdHkgaXQgb3V0JyApO1xuICBhc3NlcnQub2soIGFycjEubGVuZ3RoID09PSAwLCAnQWxzbyBlbXB0aWVzIHRoZSBvcmlnaW5hbCAoc2FuaXR5IGNoZWNrKScgKTtcbn0gKTsiXSwibmFtZXMiOlsiY2xlYW5BcnJheSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9rIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwiYXJyMSIsImFycjIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGdCQUFnQixrQkFBa0I7QUFFekNDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUsY0FBY0MsQ0FBQUE7SUFDeEJBLE9BQU9DLEVBQUUsQ0FBRUwsYUFBYU0sTUFBTSxLQUFLLEdBQUc7SUFDdENGLE9BQU9DLEVBQUUsQ0FBRUwsV0FBWU8sV0FBWUQsTUFBTSxLQUFLLEdBQUc7SUFDakRGLE9BQU9DLEVBQUUsQ0FBRUwsV0FBWSxNQUFPTSxNQUFNLEtBQUssR0FBRztJQUM1QyxNQUFNRSxPQUFPO1FBQUU7S0FBSztJQUNwQixNQUFNQyxPQUFPVCxXQUFZUTtJQUN6QkosT0FBT0MsRUFBRSxDQUFFRyxTQUFTQyxNQUFNO0lBQzFCTCxPQUFPQyxFQUFFLENBQUVJLEtBQUtILE1BQU0sS0FBSyxHQUFHO0lBQzlCRixPQUFPQyxFQUFFLENBQUVHLEtBQUtGLE1BQU0sS0FBSyxHQUFHO0FBQ2hDIn0=