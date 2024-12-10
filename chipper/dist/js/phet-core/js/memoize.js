// Copyright 2020-2022, University of Colorado Boulder
/**
 * Caches the results of previous single-argument function applications to the same object.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * @param func - Should take one argument
 * @returns - Returns a function that is equivalent, but caches values from previous keys
 */ function memoize(func) {
    const map = new Map();
    return (key)=>{
        if (map.has(key)) {
            return map.get(key);
        } else {
            const value = func(key);
            map.set(key, value);
            return value;
        }
    };
}
phetCore.register('memoize', memoize);
export default memoize;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhY2hlcyB0aGUgcmVzdWx0cyBvZiBwcmV2aW91cyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb24gYXBwbGljYXRpb25zIHRvIHRoZSBzYW1lIG9iamVjdC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuXG4vKipcbiAqIEBwYXJhbSBmdW5jIC0gU2hvdWxkIHRha2Ugb25lIGFyZ3VtZW50XG4gKiBAcmV0dXJucyAtIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIGVxdWl2YWxlbnQsIGJ1dCBjYWNoZXMgdmFsdWVzIGZyb20gcHJldmlvdXMga2V5c1xuICovXG5mdW5jdGlvbiBtZW1vaXplPEtleSwgVmFsdWU+KCBmdW5jOiAoIGs6IEtleSApID0+IFZhbHVlICk6ICggazogS2V5ICkgPT4gVmFsdWUge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPEtleSwgVmFsdWU+KCk7XG5cbiAgcmV0dXJuICgga2V5OiBLZXkgKTogVmFsdWUgPT4ge1xuICAgIGlmICggbWFwLmhhcygga2V5ICkgKSB7XG4gICAgICByZXR1cm4gbWFwLmdldCgga2V5ICkhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gZnVuYygga2V5ICk7XG4gICAgICBtYXAuc2V0KCBrZXksIHZhbHVlICk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9O1xufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ21lbW9pemUnLCBtZW1vaXplICk7XG5leHBvcnQgZGVmYXVsdCBtZW1vaXplOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsIm1lbW9pemUiLCJmdW5jIiwibWFwIiwiTWFwIiwia2V5IiwiaGFzIiwiZ2V0IiwidmFsdWUiLCJzZXQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUVyQzs7O0NBR0MsR0FDRCxTQUFTQyxRQUFxQkMsSUFBeUI7SUFDckQsTUFBTUMsTUFBTSxJQUFJQztJQUVoQixPQUFPLENBQUVDO1FBQ1AsSUFBS0YsSUFBSUcsR0FBRyxDQUFFRCxNQUFRO1lBQ3BCLE9BQU9GLElBQUlJLEdBQUcsQ0FBRUY7UUFDbEIsT0FDSztZQUNILE1BQU1HLFFBQVFOLEtBQU1HO1lBQ3BCRixJQUFJTSxHQUFHLENBQUVKLEtBQUtHO1lBQ2QsT0FBT0E7UUFDVDtJQUNGO0FBQ0Y7QUFFQVIsU0FBU1UsUUFBUSxDQUFFLFdBQVdUO0FBQzlCLGVBQWVBLFFBQVEifQ==