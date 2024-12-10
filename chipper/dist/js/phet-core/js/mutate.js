// Copyright 2021-2023, University of Colorado Boulder
/**
 * Generalized support for mutating objects that take ES5 getters/setters, similar to Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * For example:
 *
 * mutate( something, [ 'left', 'right', 'top', 'bottom' ], { top: 0, left: 5 } );
 *
 * will be equivalent to:
 *
 * something.left = 5;
 * something.top = 0;
 *
 * First param will be mutated
 */ function mutate(target, orderedKeys, options) {
    assert && assert(target);
    assert && assert(Array.isArray(orderedKeys));
    if (!options) {
        return;
    }
    assert && assert(Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on options object is a code smell');
    _.each(orderedKeys, (key)=>{
        // See https://github.com/phetsims/scenery/issues/580 for more about passing undefined.
        // @ts-expect-error
        assert && assert(!options.hasOwnProperty(key) || options[key] !== undefined, `Undefined not allowed for key: ${key}`);
        // @ts-expect-error
        if (options[key] !== undefined) {
            // @ts-expect-error
            target[key] = options[key];
        }
    });
}
phetCore.register('mutate', mutate);
export default mutate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tdXRhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2VuZXJhbGl6ZWQgc3VwcG9ydCBmb3IgbXV0YXRpbmcgb2JqZWN0cyB0aGF0IHRha2UgRVM1IGdldHRlcnMvc2V0dGVycywgc2ltaWxhciB0byBOb2RlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbi8qKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogbXV0YXRlKCBzb21ldGhpbmcsIFsgJ2xlZnQnLCAncmlnaHQnLCAndG9wJywgJ2JvdHRvbScgXSwgeyB0b3A6IDAsIGxlZnQ6IDUgfSApO1xuICpcbiAqIHdpbGwgYmUgZXF1aXZhbGVudCB0bzpcbiAqXG4gKiBzb21ldGhpbmcubGVmdCA9IDU7XG4gKiBzb21ldGhpbmcudG9wID0gMDtcbiAqXG4gKiBGaXJzdCBwYXJhbSB3aWxsIGJlIG11dGF0ZWRcbiAqL1xuZnVuY3Rpb24gbXV0YXRlKCB0YXJnZXQ6IG9iamVjdCwgb3JkZXJlZEtleXM6IHN0cmluZ1tdLCBvcHRpb25zPzogb2JqZWN0ICk6IHZvaWQge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCB0YXJnZXQgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggb3JkZXJlZEtleXMgKSApO1xuXG4gIGlmICggIW9wdGlvbnMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCBvcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBvcHRpb25zIG9iamVjdCBpcyBhIGNvZGUgc21lbGwnICk7XG5cbiAgXy5lYWNoKCBvcmRlcmVkS2V5cywga2V5ID0+IHtcblxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTgwIGZvciBtb3JlIGFib3V0IHBhc3NpbmcgdW5kZWZpbmVkLlxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgfHwgb3B0aW9uc1sga2V5IF0gIT09IHVuZGVmaW5lZCxcbiAgICAgIGBVbmRlZmluZWQgbm90IGFsbG93ZWQgZm9yIGtleTogJHtrZXl9YCApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIGlmICggb3B0aW9uc1sga2V5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHRhcmdldFsga2V5IF0gPSBvcHRpb25zWyBrZXkgXSE7XG4gICAgfVxuICB9ICk7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnbXV0YXRlJywgbXV0YXRlICk7XG5leHBvcnQgZGVmYXVsdCBtdXRhdGU7Il0sIm5hbWVzIjpbInBoZXRDb3JlIiwibXV0YXRlIiwidGFyZ2V0Iiwib3JkZXJlZEtleXMiLCJvcHRpb25zIiwiYXNzZXJ0IiwiQXJyYXkiLCJpc0FycmF5IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJfIiwiZWFjaCIsImtleSIsImhhc093blByb3BlcnR5IiwidW5kZWZpbmVkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxnQkFBZ0I7QUFFckM7Ozs7Ozs7Ozs7O0NBV0MsR0FDRCxTQUFTQyxPQUFRQyxNQUFjLEVBQUVDLFdBQXFCLEVBQUVDLE9BQWdCO0lBQ3RFQyxVQUFVQSxPQUFRSDtJQUNsQkcsVUFBVUEsT0FBUUMsTUFBTUMsT0FBTyxDQUFFSjtJQUVqQyxJQUFLLENBQUNDLFNBQVU7UUFDZDtJQUNGO0lBRUFDLFVBQVVBLE9BQVFHLE9BQU9DLGNBQWMsQ0FBRUwsYUFBY0ksT0FBT0UsU0FBUyxFQUNyRTtJQUVGQyxFQUFFQyxJQUFJLENBQUVULGFBQWFVLENBQUFBO1FBRW5CLHVGQUF1RjtRQUN2RixtQkFBbUI7UUFDbkJSLFVBQVVBLE9BQVEsQ0FBQ0QsUUFBUVUsY0FBYyxDQUFFRCxRQUFTVCxPQUFPLENBQUVTLElBQUssS0FBS0UsV0FDckUsQ0FBQywrQkFBK0IsRUFBRUYsS0FBSztRQUV6QyxtQkFBbUI7UUFDbkIsSUFBS1QsT0FBTyxDQUFFUyxJQUFLLEtBQUtFLFdBQVk7WUFDbEMsbUJBQW1CO1lBQ25CYixNQUFNLENBQUVXLElBQUssR0FBR1QsT0FBTyxDQUFFUyxJQUFLO1FBQ2hDO0lBQ0Y7QUFDRjtBQUVBYixTQUFTZ0IsUUFBUSxDQUFFLFVBQVVmO0FBQzdCLGVBQWVBLE9BQU8ifQ==