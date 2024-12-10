// Copyright 2018-2023, University of Colorado Boulder
/**
 * Map for multidimensional arrays.
 *
 * e.g. dimensionMap( 1, array, callback ) is equivalent to array.map( callback )
 * e.g. dimensionMap( 2, [ [ 1, 2 ], [ 3, 4 ] ], f ) will return
 *      [ [ f(1), f(2) ], [ f(3), f(4) ] ]
 *   OR more accurately (since it includes indices indicating how to reach that element:
 *      [ [ f(1,0,0), f(2,0,1) ], [ f(3,1,0), f(3,1,1) ] ]
 *   Notably, f(2,0,1) is called for the element 3 BECAUSE original[ 0 ][ 1 ] is the element 2
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * @param dimension - The dimension of the array (how many levels of nested arrays there are). For instance,
 *   [ 'a' ] is a 1-dimensional array, [ [ 'b' ] ] is a 2-dimensional array, etc.
 * @param array - A multidimensional array of the specified dimension
 * @param map - function( element: {*}, indices...: {Array.<number>} ): {*}. Called for each individual
 *   element. The indices are provided as the 2nd, 3rd, etc. parameters to the function (continues depending on the
 *   dimension). This is a generalization of the normal `map` function, which only provides the first index. Thus:
 *   array[ indices[ 0 ] ]...[ indices[ dimension - 1 ] ] === element
 * @returns - A multidimensional array of the same dimension as our input, but with the
 *   values replaced with the return value of the map() calls for each element.
 */ function dimensionMap(dimension, array, map) {
    // Will get indices pushed when we go deeper into the multidimensional array, and popped when we go back, so that
    // this essentially represents our "position" in the multidimensional array during iteration.
    const indices = [];
    /**
   * Responsible for mapping a multidimensional array of the given dimension, while accumulating
   * indices.
   */ function recur(dim, arr) {
        return arr.map((element, index)=>{
            // To process this element, we need to record our index (in case it is an array that we iterate through).
            indices.push(index);
            // If our dimension is 1, it's our base case (apply the normal map function), otherwise continue recursively.
            const result = dim === 1 ? map(element, ...indices) : recur(dim - 1, element);
            // We are done with iteration
            indices.pop();
            return result;
        });
    }
    return recur(dimension, array);
}
phetCore.register('dimensionMap', dimensionMap);
export default dimensionMap;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kaW1lbnNpb25NYXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWFwIGZvciBtdWx0aWRpbWVuc2lvbmFsIGFycmF5cy5cbiAqXG4gKiBlLmcuIGRpbWVuc2lvbk1hcCggMSwgYXJyYXksIGNhbGxiYWNrICkgaXMgZXF1aXZhbGVudCB0byBhcnJheS5tYXAoIGNhbGxiYWNrIClcbiAqIGUuZy4gZGltZW5zaW9uTWFwKCAyLCBbIFsgMSwgMiBdLCBbIDMsIDQgXSBdLCBmICkgd2lsbCByZXR1cm5cbiAqICAgICAgWyBbIGYoMSksIGYoMikgXSwgWyBmKDMpLCBmKDQpIF0gXVxuICogICBPUiBtb3JlIGFjY3VyYXRlbHkgKHNpbmNlIGl0IGluY2x1ZGVzIGluZGljZXMgaW5kaWNhdGluZyBob3cgdG8gcmVhY2ggdGhhdCBlbGVtZW50OlxuICogICAgICBbIFsgZigxLDAsMCksIGYoMiwwLDEpIF0sIFsgZigzLDEsMCksIGYoMywxLDEpIF0gXVxuICogICBOb3RhYmx5LCBmKDIsMCwxKSBpcyBjYWxsZWQgZm9yIHRoZSBlbGVtZW50IDMgQkVDQVVTRSBvcmlnaW5hbFsgMCBdWyAxIF0gaXMgdGhlIGVsZW1lbnQgMlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbnR5cGUgTXVsdGlkaW1lbnNpb25hbEFycmF5PFQ+ID0gQXJyYXk8TXVsdGlkaW1lbnNpb25hbEFycmF5PFQ+IHwgVD47XG5cblxuLyoqXG4gKiBAcGFyYW0gZGltZW5zaW9uIC0gVGhlIGRpbWVuc2lvbiBvZiB0aGUgYXJyYXkgKGhvdyBtYW55IGxldmVscyBvZiBuZXN0ZWQgYXJyYXlzIHRoZXJlIGFyZSkuIEZvciBpbnN0YW5jZSxcbiAqICAgWyAnYScgXSBpcyBhIDEtZGltZW5zaW9uYWwgYXJyYXksIFsgWyAnYicgXSBdIGlzIGEgMi1kaW1lbnNpb25hbCBhcnJheSwgZXRjLlxuICogQHBhcmFtIGFycmF5IC0gQSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5IG9mIHRoZSBzcGVjaWZpZWQgZGltZW5zaW9uXG4gKiBAcGFyYW0gbWFwIC0gZnVuY3Rpb24oIGVsZW1lbnQ6IHsqfSwgaW5kaWNlcy4uLjoge0FycmF5LjxudW1iZXI+fSApOiB7Kn0uIENhbGxlZCBmb3IgZWFjaCBpbmRpdmlkdWFsXG4gKiAgIGVsZW1lbnQuIFRoZSBpbmRpY2VzIGFyZSBwcm92aWRlZCBhcyB0aGUgMm5kLCAzcmQsIGV0Yy4gcGFyYW1ldGVycyB0byB0aGUgZnVuY3Rpb24gKGNvbnRpbnVlcyBkZXBlbmRpbmcgb24gdGhlXG4gKiAgIGRpbWVuc2lvbikuIFRoaXMgaXMgYSBnZW5lcmFsaXphdGlvbiBvZiB0aGUgbm9ybWFsIGBtYXBgIGZ1bmN0aW9uLCB3aGljaCBvbmx5IHByb3ZpZGVzIHRoZSBmaXJzdCBpbmRleC4gVGh1czpcbiAqICAgYXJyYXlbIGluZGljZXNbIDAgXSBdLi4uWyBpbmRpY2VzWyBkaW1lbnNpb24gLSAxIF0gXSA9PT0gZWxlbWVudFxuICogQHJldHVybnMgLSBBIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIHNhbWUgZGltZW5zaW9uIGFzIG91ciBpbnB1dCwgYnV0IHdpdGggdGhlXG4gKiAgIHZhbHVlcyByZXBsYWNlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIG1hcCgpIGNhbGxzIGZvciBlYWNoIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGRpbWVuc2lvbk1hcDxJbnB1dFR5cGUsIFJldHVyblR5cGU+KCBkaW1lbnNpb246IG51bWJlciwgYXJyYXk6IE11bHRpZGltZW5zaW9uYWxBcnJheTxJbnB1dFR5cGU+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogKCBlbGVtZW50OiBJbnB1dFR5cGUsIC4uLmluZGljZXM6IG51bWJlcltdICkgPT4gUmV0dXJuVHlwZSApOiBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8UmV0dXJuVHlwZT4ge1xuXG4gIC8vIFdpbGwgZ2V0IGluZGljZXMgcHVzaGVkIHdoZW4gd2UgZ28gZGVlcGVyIGludG8gdGhlIG11bHRpZGltZW5zaW9uYWwgYXJyYXksIGFuZCBwb3BwZWQgd2hlbiB3ZSBnbyBiYWNrLCBzbyB0aGF0XG4gIC8vIHRoaXMgZXNzZW50aWFsbHkgcmVwcmVzZW50cyBvdXIgXCJwb3NpdGlvblwiIGluIHRoZSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5IGR1cmluZyBpdGVyYXRpb24uXG4gIGNvbnN0IGluZGljZXM6IG51bWJlcltdID0gW107XG5cbiAgLyoqXG4gICAqIFJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIGEgbXVsdGlkaW1lbnNpb25hbCBhcnJheSBvZiB0aGUgZ2l2ZW4gZGltZW5zaW9uLCB3aGlsZSBhY2N1bXVsYXRpbmdcbiAgICogaW5kaWNlcy5cbiAgICovXG4gIGZ1bmN0aW9uIHJlY3VyKCBkaW06IG51bWJlciwgYXJyOiBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8SW5wdXRUeXBlPiApOiBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8UmV0dXJuVHlwZT4ge1xuICAgIHJldHVybiBhcnIubWFwKCAoIGVsZW1lbnQsIGluZGV4ICkgPT4ge1xuXG4gICAgICAvLyBUbyBwcm9jZXNzIHRoaXMgZWxlbWVudCwgd2UgbmVlZCB0byByZWNvcmQgb3VyIGluZGV4IChpbiBjYXNlIGl0IGlzIGFuIGFycmF5IHRoYXQgd2UgaXRlcmF0ZSB0aHJvdWdoKS5cbiAgICAgIGluZGljZXMucHVzaCggaW5kZXggKTtcblxuICAgICAgLy8gSWYgb3VyIGRpbWVuc2lvbiBpcyAxLCBpdCdzIG91ciBiYXNlIGNhc2UgKGFwcGx5IHRoZSBub3JtYWwgbWFwIGZ1bmN0aW9uKSwgb3RoZXJ3aXNlIGNvbnRpbnVlIHJlY3Vyc2l2ZWx5LlxuICAgICAgY29uc3QgcmVzdWx0OiBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8UmV0dXJuVHlwZT4gfCBSZXR1cm5UeXBlID0gZGltID09PSAxID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcCggZWxlbWVudCBhcyBJbnB1dFR5cGUsIC4uLmluZGljZXMgKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWN1ciggZGltIC0gMSwgZWxlbWVudCBhcyBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8SW5wdXRUeXBlPiApO1xuXG4gICAgICAvLyBXZSBhcmUgZG9uZSB3aXRoIGl0ZXJhdGlvblxuICAgICAgaW5kaWNlcy5wb3AoKTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSApO1xuICB9XG5cbiAgcmV0dXJuIHJlY3VyKCBkaW1lbnNpb24sIGFycmF5ICk7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnZGltZW5zaW9uTWFwJywgZGltZW5zaW9uTWFwICk7XG5cbmV4cG9ydCBkZWZhdWx0IGRpbWVuc2lvbk1hcDsiXSwibmFtZXMiOlsicGhldENvcmUiLCJkaW1lbnNpb25NYXAiLCJkaW1lbnNpb24iLCJhcnJheSIsIm1hcCIsImluZGljZXMiLCJyZWN1ciIsImRpbSIsImFyciIsImVsZW1lbnQiLCJpbmRleCIsInB1c2giLCJyZXN1bHQiLCJwb3AiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7OztDQVdDLEdBRUQsT0FBT0EsY0FBYyxnQkFBZ0I7QUFLckM7Ozs7Ozs7Ozs7Q0FVQyxHQUNELFNBQVNDLGFBQXFDQyxTQUFpQixFQUFFQyxLQUF1QyxFQUMxREMsR0FBK0Q7SUFFM0csaUhBQWlIO0lBQ2pILDZGQUE2RjtJQUM3RixNQUFNQyxVQUFvQixFQUFFO0lBRTVCOzs7R0FHQyxHQUNELFNBQVNDLE1BQU9DLEdBQVcsRUFBRUMsR0FBcUM7UUFDaEUsT0FBT0EsSUFBSUosR0FBRyxDQUFFLENBQUVLLFNBQVNDO1lBRXpCLHlHQUF5RztZQUN6R0wsUUFBUU0sSUFBSSxDQUFFRDtZQUVkLDZHQUE2RztZQUM3RyxNQUFNRSxTQUF5REwsUUFBUSxJQUNSSCxJQUFLSyxZQUF5QkosV0FDOUJDLE1BQU9DLE1BQU0sR0FBR0U7WUFFL0UsNkJBQTZCO1lBQzdCSixRQUFRUSxHQUFHO1lBQ1gsT0FBT0Q7UUFDVDtJQUNGO0lBRUEsT0FBT04sTUFBT0osV0FBV0M7QUFDM0I7QUFFQUgsU0FBU2MsUUFBUSxDQUFFLGdCQUFnQmI7QUFFbkMsZUFBZUEsYUFBYSJ9