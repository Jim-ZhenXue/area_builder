// Copyright 2017-2023, University of Colorado Boulder
/**
 * partition tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import partition from './partition.js';
QUnit.module('partition');
QUnit.test('partition', (assert)=>{
    const parityTest = partition([
        1,
        2,
        3,
        4
    ], (n)=>n % 2 === 0);
    assert.equal(parityTest[0][0], 2);
    assert.equal(parityTest[0][1], 4);
    assert.equal(parityTest[1][0], 1);
    assert.equal(parityTest[1][1], 3);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wYXJ0aXRpb25UZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBwYXJ0aXRpb24gdGVzdHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgcGFydGl0aW9uIGZyb20gJy4vcGFydGl0aW9uLmpzJztcblxuUVVuaXQubW9kdWxlKCAncGFydGl0aW9uJyApO1xuXG5RVW5pdC50ZXN0KCAncGFydGl0aW9uJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcGFyaXR5VGVzdCA9IHBhcnRpdGlvbiggWyAxLCAyLCAzLCA0IF0sIG4gPT4gbiAlIDIgPT09IDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYXJpdHlUZXN0WyAwIF1bIDAgXSwgMiApO1xuICBhc3NlcnQuZXF1YWwoIHBhcml0eVRlc3RbIDAgXVsgMSBdLCA0ICk7XG4gIGFzc2VydC5lcXVhbCggcGFyaXR5VGVzdFsgMSBdWyAwIF0sIDEgKTtcbiAgYXNzZXJ0LmVxdWFsKCBwYXJpdHlUZXN0WyAxIF1bIDEgXSwgMyApO1xufSApOyJdLCJuYW1lcyI6WyJwYXJ0aXRpb24iLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJwYXJpdHlUZXN0IiwibiIsImVxdWFsIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxlQUFlLGlCQUFpQjtBQUV2Q0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxhQUFhQyxDQUFBQTtJQUN2QixNQUFNQyxhQUFhTCxVQUFXO1FBQUU7UUFBRztRQUFHO1FBQUc7S0FBRyxFQUFFTSxDQUFBQSxJQUFLQSxJQUFJLE1BQU07SUFDN0RGLE9BQU9HLEtBQUssQ0FBRUYsVUFBVSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7SUFDcENELE9BQU9HLEtBQUssQ0FBRUYsVUFBVSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7SUFDcENELE9BQU9HLEtBQUssQ0FBRUYsVUFBVSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7SUFDcENELE9BQU9HLEtBQUssQ0FBRUYsVUFBVSxDQUFFLEVBQUcsQ0FBRSxFQUFHLEVBQUU7QUFDdEMifQ==