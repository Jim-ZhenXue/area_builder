// Copyright 2018-2024, University of Colorado Boulder
/**
 * PhET-iO Type for JS's built-in number type, but adds explicit support for positive and negative infinity.
 * Typical use cases should use NumberIO, but if you have a case that must support infinities, please
 * use this instead.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
const InfiniteNumberIO = new IOType('InfiniteNumberIO', {
    valueType: 'number',
    documentation: 'PhET-iO Type for Javascript\'s number primitive type',
    toStateObject: (value)=>value === Number.POSITIVE_INFINITY ? 'POSITIVE_INFINITY' : value === Number.NEGATIVE_INFINITY ? 'NEGATIVE_INFINITY' : value,
    fromStateObject: (stateObject)=>stateObject === 'POSITIVE_INFINITY' ? Number.POSITIVE_INFINITY : stateObject === 'NEGATIVE_INFINITY' ? Number.NEGATIVE_INFINITY : stateObject,
    stateSchema: StateSchema.asValue('\'POSITIVE_INFINITY\'|\'NEGATIVE_INFINITY\'|number', {
        isValidValue: (value)=>value === 'POSITIVE_INFINITY' || value === 'NEGATIVE_INFINITY' || typeof value === 'number' && !isNaN(value)
    })
});
tandemNamespace.register('InfiniteNumberIO', InfiniteNumberIO);
export default InfiniteNumberIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JbmZpbml0ZU51bWJlcklPLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBoRVQtaU8gVHlwZSBmb3IgSlMncyBidWlsdC1pbiBudW1iZXIgdHlwZSwgYnV0IGFkZHMgZXhwbGljaXQgc3VwcG9ydCBmb3IgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIGluZmluaXR5LlxuICogVHlwaWNhbCB1c2UgY2FzZXMgc2hvdWxkIHVzZSBOdW1iZXJJTywgYnV0IGlmIHlvdSBoYXZlIGEgY2FzZSB0aGF0IG11c3Qgc3VwcG9ydCBpbmZpbml0aWVzLCBwbGVhc2VcbiAqIHVzZSB0aGlzIGluc3RlYWQuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4uL3RhbmRlbU5hbWVzcGFjZS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vSU9UeXBlLmpzJztcbmltcG9ydCBTdGF0ZVNjaGVtYSBmcm9tICcuL1N0YXRlU2NoZW1hLmpzJztcblxuZXhwb3J0IHR5cGUgSW5maW5pdGVOdW1iZXJTdGF0ZU9iamVjdCA9IG51bWJlciB8ICdQT1NJVElWRV9JTkZJTklUWScgfCAnTkVHQVRJVkVfSU5GSU5JVFknO1xuXG5jb25zdCBJbmZpbml0ZU51bWJlcklPID0gbmV3IElPVHlwZTxudW1iZXIsIEluZmluaXRlTnVtYmVyU3RhdGVPYmplY3Q+KCAnSW5maW5pdGVOdW1iZXJJTycsIHtcbiAgdmFsdWVUeXBlOiAnbnVtYmVyJyxcbiAgZG9jdW1lbnRhdGlvbjogJ1BoRVQtaU8gVHlwZSBmb3IgSmF2YXNjcmlwdFxcJ3MgbnVtYmVyIHByaW1pdGl2ZSB0eXBlJyxcbiAgdG9TdGF0ZU9iamVjdDogdmFsdWUgPT4gdmFsdWUgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA/ICdQT1NJVElWRV9JTkZJTklUWScgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZID8gJ05FR0FUSVZFX0lORklOSVRZJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLFxuICBmcm9tU3RhdGVPYmplY3Q6IHN0YXRlT2JqZWN0ID0+IHN0YXRlT2JqZWN0ID09PSAnUE9TSVRJVkVfSU5GSU5JVFknID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZU9iamVjdCA9PT0gJ05FR0FUSVZFX0lORklOSVRZJyA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVPYmplY3QsXG4gIHN0YXRlU2NoZW1hOiBTdGF0ZVNjaGVtYS5hc1ZhbHVlPG51bWJlciwgSW5maW5pdGVOdW1iZXJTdGF0ZU9iamVjdD4oICdcXCdQT1NJVElWRV9JTkZJTklUWVxcJ3xcXCdORUdBVElWRV9JTkZJTklUWVxcJ3xudW1iZXInLCB7XG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBJbmZpbml0ZU51bWJlclN0YXRlT2JqZWN0ICkgPT4gdmFsdWUgPT09ICdQT1NJVElWRV9JTkZJTklUWScgfHwgdmFsdWUgPT09ICdORUdBVElWRV9JTkZJTklUWScgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTiggdmFsdWUgKSApXG4gIH0gKVxufSApO1xuXG50YW5kZW1OYW1lc3BhY2UucmVnaXN0ZXIoICdJbmZpbml0ZU51bWJlcklPJywgSW5maW5pdGVOdW1iZXJJTyApO1xuZXhwb3J0IGRlZmF1bHQgSW5maW5pdGVOdW1iZXJJTzsiXSwibmFtZXMiOlsidGFuZGVtTmFtZXNwYWNlIiwiSU9UeXBlIiwiU3RhdGVTY2hlbWEiLCJJbmZpbml0ZU51bWJlcklPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJ2YWx1ZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwiYXNWYWx1ZSIsImlzVmFsaWRWYWx1ZSIsImlzTmFOIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EscUJBQXFCLHdCQUF3QjtBQUNwRCxPQUFPQyxZQUFZLGNBQWM7QUFDakMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUkzQyxNQUFNQyxtQkFBbUIsSUFBSUYsT0FBMkMsb0JBQW9CO0lBQzFGRyxXQUFXO0lBQ1hDLGVBQWU7SUFDZkMsZUFBZUMsQ0FBQUEsUUFBU0EsVUFBVUMsT0FBT0MsaUJBQWlCLEdBQUcsc0JBQ3JDRixVQUFVQyxPQUFPRSxpQkFBaUIsR0FBRyxzQkFDckNIO0lBQ3hCSSxpQkFBaUJDLENBQUFBLGNBQWVBLGdCQUFnQixzQkFBc0JKLE9BQU9DLGlCQUFpQixHQUM5REcsZ0JBQWdCLHNCQUFzQkosT0FBT0UsaUJBQWlCLEdBQzlERTtJQUNoQ0MsYUFBYVgsWUFBWVksT0FBTyxDQUFxQyxzREFBc0Q7UUFDekhDLGNBQWMsQ0FBRVIsUUFBc0NBLFVBQVUsdUJBQXVCQSxVQUFVLHVCQUF5QixPQUFPQSxVQUFVLFlBQVksQ0FBQ1MsTUFBT1Q7SUFDaks7QUFDRjtBQUVBUCxnQkFBZ0JpQixRQUFRLENBQUUsb0JBQW9CZDtBQUM5QyxlQUFlQSxpQkFBaUIifQ==