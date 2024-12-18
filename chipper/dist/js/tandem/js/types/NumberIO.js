// Copyright 2018-2024, University of Colorado Boulder
/**
 * PhET-iO Type for JS's built-in number type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import tandemNamespace from '../tandemNamespace.js';
import IOType from './IOType.js';
import StateSchema from './StateSchema.js';
const NumberIO = new IOType('NumberIO', {
    valueType: 'number',
    documentation: 'PhET-iO Type for Javascript\'s number primitive type',
    toStateObject: _.identity,
    fromStateObject: (stateObject)=>stateObject,
    stateSchema: StateSchema.asValue('number', {
        isValidValue: (value)=>typeof value === 'number' && !isNaN(value) && value !== Number.POSITIVE_INFINITY && value !== Number.NEGATIVE_INFINITY
    })
});
tandemNamespace.register('NumberIO', NumberIO);
export default NumberIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQaEVULWlPIFR5cGUgZm9yIEpTJ3MgYnVpbHQtaW4gbnVtYmVyIHR5cGUuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCB0YW5kZW1OYW1lc3BhY2UgZnJvbSAnLi4vdGFuZGVtTmFtZXNwYWNlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi9JT1R5cGUuanMnO1xuaW1wb3J0IFN0YXRlU2NoZW1hIGZyb20gJy4vU3RhdGVTY2hlbWEuanMnO1xuXG5jb25zdCBOdW1iZXJJTyA9IG5ldyBJT1R5cGU8bnVtYmVyLCBudW1iZXI+KCAnTnVtYmVySU8nLCB7XG4gIHZhbHVlVHlwZTogJ251bWJlcicsXG4gIGRvY3VtZW50YXRpb246ICdQaEVULWlPIFR5cGUgZm9yIEphdmFzY3JpcHRcXCdzIG51bWJlciBwcmltaXRpdmUgdHlwZScsXG4gIHRvU3RhdGVPYmplY3Q6IF8uaWRlbnRpdHksXG4gIGZyb21TdGF0ZU9iamVjdDogc3RhdGVPYmplY3QgPT4gc3RhdGVPYmplY3QsXG4gIHN0YXRlU2NoZW1hOiBTdGF0ZVNjaGVtYS5hc1ZhbHVlPG51bWJlciwgbnVtYmVyPiggJ251bWJlcicsIHtcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oIHZhbHVlICkgJiYgdmFsdWUgIT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSAmJiB2YWx1ZSAhPT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIClcbiAgfSApXG59ICk7XG5cbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ051bWJlcklPJywgTnVtYmVySU8gKTtcbmV4cG9ydCBkZWZhdWx0IE51bWJlcklPOyJdLCJuYW1lcyI6WyJ0YW5kZW1OYW1lc3BhY2UiLCJJT1R5cGUiLCJTdGF0ZVNjaGVtYSIsIk51bWJlcklPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJfIiwiaWRlbnRpdHkiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwiYXNWYWx1ZSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwiaXNOYU4iLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLHFCQUFxQix3QkFBd0I7QUFDcEQsT0FBT0MsWUFBWSxjQUFjO0FBQ2pDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsTUFBTUMsV0FBVyxJQUFJRixPQUF3QixZQUFZO0lBQ3ZERyxXQUFXO0lBQ1hDLGVBQWU7SUFDZkMsZUFBZUMsRUFBRUMsUUFBUTtJQUN6QkMsaUJBQWlCQyxDQUFBQSxjQUFlQTtJQUNoQ0MsYUFBYVQsWUFBWVUsT0FBTyxDQUFrQixVQUFVO1FBQzFEQyxjQUFjLENBQUVDLFFBQXFCLE9BQU9BLFVBQVUsWUFBWSxDQUFDQyxNQUFPRCxVQUFXQSxVQUFVRSxPQUFPQyxpQkFBaUIsSUFBSUgsVUFBVUUsT0FBT0UsaUJBQWlCO0lBQy9KO0FBQ0Y7QUFFQWxCLGdCQUFnQm1CLFFBQVEsQ0FBRSxZQUFZaEI7QUFDdEMsZUFBZUEsU0FBUyJ9