// Copyright 2019-2024, University of Colorado Boulder
/**
 * Swap the values of two keys on an object, but only if the value is defined
 *
 * @example
 * swapObjectKeys( { x: 4,y: 3 }, 'x', 'y' ) -> { x: 4, y:3 }
 * swapObjectKeys( { x: 4 }, 'x', 'y' ) -> { y:4 }
 * swapObjectKeys( { x: 4, y: undefined }, 'x', 'y' ) -> { x: undefined, y:4 }
 * swapObjectKeys( { otherStuff: 'hi' }, 'x', 'y' ) -> { otherStuff: 'hi' }
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import phetCore from './phetCore.js';
// Get a unique object reference to compare against. This is preferable to comparing against `undefined` because
// that doesn't differentiate between and object with a key that has a value of undefined, `{x:undefined}` verses
// `{}` in which `x === undefined` also.
const placeholderObject = {};
function swapObjectKeys(object, keyName1, keyName2) {
    const placeholderWithType = placeholderObject;
    // store both values into temp vars before trying to overwrite onto the object
    let value1 = placeholderWithType;
    let value2 = placeholderWithType;
    if (object.hasOwnProperty(keyName1)) {
        value1 = object[keyName1];
    }
    if (object.hasOwnProperty(keyName2)) {
        value2 = object[keyName2];
    }
    // If the value changed, then swap the keys
    if (value1 !== placeholderObject) {
        object[keyName2] = value1;
    } else {
        // if not defined, then make sure it is removed
        delete object[keyName2];
    }
    // If the value changed, then swap the keys
    if (value2 !== placeholderObject) {
        object[keyName1] = value2;
    } else {
        // if not defined, then make sure it is removed
        delete object[keyName1];
    }
    return object; // for chaining
}
phetCore.register('swapObjectKeys', swapObjectKeys);
export default swapObjectKeys;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9zd2FwT2JqZWN0S2V5cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTd2FwIHRoZSB2YWx1ZXMgb2YgdHdvIGtleXMgb24gYW4gb2JqZWN0LCBidXQgb25seSBpZiB0aGUgdmFsdWUgaXMgZGVmaW5lZFxuICpcbiAqIEBleGFtcGxlXG4gKiBzd2FwT2JqZWN0S2V5cyggeyB4OiA0LHk6IDMgfSwgJ3gnLCAneScgKSAtPiB7IHg6IDQsIHk6MyB9XG4gKiBzd2FwT2JqZWN0S2V5cyggeyB4OiA0IH0sICd4JywgJ3knICkgLT4geyB5OjQgfVxuICogc3dhcE9iamVjdEtleXMoIHsgeDogNCwgeTogdW5kZWZpbmVkIH0sICd4JywgJ3knICkgLT4geyB4OiB1bmRlZmluZWQsIHk6NCB9XG4gKiBzd2FwT2JqZWN0S2V5cyggeyBvdGhlclN0dWZmOiAnaGknIH0sICd4JywgJ3knICkgLT4geyBvdGhlclN0dWZmOiAnaGknIH1cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4vdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuXG4vLyBHZXQgYSB1bmlxdWUgb2JqZWN0IHJlZmVyZW5jZSB0byBjb21wYXJlIGFnYWluc3QuIFRoaXMgaXMgcHJlZmVyYWJsZSB0byBjb21wYXJpbmcgYWdhaW5zdCBgdW5kZWZpbmVkYCBiZWNhdXNlXG4vLyB0aGF0IGRvZXNuJ3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGFuZCBvYmplY3Qgd2l0aCBhIGtleSB0aGF0IGhhcyBhIHZhbHVlIG9mIHVuZGVmaW5lZCwgYHt4OnVuZGVmaW5lZH1gIHZlcnNlc1xuLy8gYHt9YCBpbiB3aGljaCBgeCA9PT0gdW5kZWZpbmVkYCBhbHNvLlxuY29uc3QgcGxhY2Vob2xkZXJPYmplY3Q6IEludGVudGlvbmFsQW55ID0ge307XG5cbmZ1bmN0aW9uIHN3YXBPYmplY3RLZXlzPFQgZXh0ZW5kcyBvYmplY3Q+KCBvYmplY3Q6IFQsIGtleU5hbWUxOiBrZXlvZiBULCBrZXlOYW1lMjoga2V5b2YgVCApOiBUIHtcbiAgY29uc3QgcGxhY2Vob2xkZXJXaXRoVHlwZTogVFtrZXlvZiBUXSA9IHBsYWNlaG9sZGVyT2JqZWN0O1xuXG4gIC8vIHN0b3JlIGJvdGggdmFsdWVzIGludG8gdGVtcCB2YXJzIGJlZm9yZSB0cnlpbmcgdG8gb3ZlcndyaXRlIG9udG8gdGhlIG9iamVjdFxuICBsZXQgdmFsdWUxID0gcGxhY2Vob2xkZXJXaXRoVHlwZTtcbiAgbGV0IHZhbHVlMiA9IHBsYWNlaG9sZGVyV2l0aFR5cGU7XG4gIGlmICggb2JqZWN0Lmhhc093blByb3BlcnR5KCBrZXlOYW1lMSApICkge1xuICAgIHZhbHVlMSA9IG9iamVjdFsga2V5TmFtZTEgXTtcbiAgfVxuICBpZiAoIG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgga2V5TmFtZTIgKSApIHtcbiAgICB2YWx1ZTIgPSBvYmplY3RbIGtleU5hbWUyIF07XG4gIH1cblxuICAvLyBJZiB0aGUgdmFsdWUgY2hhbmdlZCwgdGhlbiBzd2FwIHRoZSBrZXlzXG4gIGlmICggdmFsdWUxICE9PSBwbGFjZWhvbGRlck9iamVjdCApIHtcbiAgICBvYmplY3RbIGtleU5hbWUyIF0gPSB2YWx1ZTE7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICAvLyBpZiBub3QgZGVmaW5lZCwgdGhlbiBtYWtlIHN1cmUgaXQgaXMgcmVtb3ZlZFxuICAgIGRlbGV0ZSBvYmplY3RbIGtleU5hbWUyIF07XG4gIH1cblxuICAvLyBJZiB0aGUgdmFsdWUgY2hhbmdlZCwgdGhlbiBzd2FwIHRoZSBrZXlzXG4gIGlmICggdmFsdWUyICE9PSBwbGFjZWhvbGRlck9iamVjdCApIHtcbiAgICBvYmplY3RbIGtleU5hbWUxIF0gPSB2YWx1ZTI7XG4gIH1cbiAgZWxzZSB7XG5cbiAgICAvLyBpZiBub3QgZGVmaW5lZCwgdGhlbiBtYWtlIHN1cmUgaXQgaXMgcmVtb3ZlZFxuICAgIGRlbGV0ZSBvYmplY3RbIGtleU5hbWUxIF07XG4gIH1cbiAgcmV0dXJuIG9iamVjdDsgLy8gZm9yIGNoYWluaW5nXG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnc3dhcE9iamVjdEtleXMnLCBzd2FwT2JqZWN0S2V5cyApO1xuXG5leHBvcnQgZGVmYXVsdCBzd2FwT2JqZWN0S2V5czsiXSwibmFtZXMiOlsicGhldENvcmUiLCJwbGFjZWhvbGRlck9iamVjdCIsInN3YXBPYmplY3RLZXlzIiwib2JqZWN0Iiwia2V5TmFtZTEiLCJrZXlOYW1lMiIsInBsYWNlaG9sZGVyV2l0aFR5cGUiLCJ2YWx1ZTEiLCJ2YWx1ZTIiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLGNBQWMsZ0JBQWdCO0FBR3JDLGdIQUFnSDtBQUNoSCxpSEFBaUg7QUFDakgsd0NBQXdDO0FBQ3hDLE1BQU1DLG9CQUFvQyxDQUFDO0FBRTNDLFNBQVNDLGVBQWtDQyxNQUFTLEVBQUVDLFFBQWlCLEVBQUVDLFFBQWlCO0lBQ3hGLE1BQU1DLHNCQUFrQ0w7SUFFeEMsOEVBQThFO0lBQzlFLElBQUlNLFNBQVNEO0lBQ2IsSUFBSUUsU0FBU0Y7SUFDYixJQUFLSCxPQUFPTSxjQUFjLENBQUVMLFdBQWE7UUFDdkNHLFNBQVNKLE1BQU0sQ0FBRUMsU0FBVTtJQUM3QjtJQUNBLElBQUtELE9BQU9NLGNBQWMsQ0FBRUosV0FBYTtRQUN2Q0csU0FBU0wsTUFBTSxDQUFFRSxTQUFVO0lBQzdCO0lBRUEsMkNBQTJDO0lBQzNDLElBQUtFLFdBQVdOLG1CQUFvQjtRQUNsQ0UsTUFBTSxDQUFFRSxTQUFVLEdBQUdFO0lBQ3ZCLE9BQ0s7UUFFSCwrQ0FBK0M7UUFDL0MsT0FBT0osTUFBTSxDQUFFRSxTQUFVO0lBQzNCO0lBRUEsMkNBQTJDO0lBQzNDLElBQUtHLFdBQVdQLG1CQUFvQjtRQUNsQ0UsTUFBTSxDQUFFQyxTQUFVLEdBQUdJO0lBQ3ZCLE9BQ0s7UUFFSCwrQ0FBK0M7UUFDL0MsT0FBT0wsTUFBTSxDQUFFQyxTQUFVO0lBQzNCO0lBQ0EsT0FBT0QsUUFBUSxlQUFlO0FBQ2hDO0FBRUFILFNBQVNVLFFBQVEsQ0FBRSxrQkFBa0JSO0FBRXJDLGVBQWVBLGVBQWUifQ==