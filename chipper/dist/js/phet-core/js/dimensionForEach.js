// Copyright 2018-2023, University of Colorado Boulder
/**
 * ForEach for multidimensional arrays.
 *
 * e.g. dimensionForEach( 1, array, callback ) is equivalent to array.forEach( callback )
 * e.g. dimensionForEach( 2, [ [ 1, 2 ], [ 3, 4 ] ], f ) will call:
 *      f(1), f(2), f(3), f(4)
 *   OR more accurately (since it includes indices indicating how to reach that element:
 *      f(1,0,0), f(2,0,1), f(3,1,0), f(4,1,1)
 *   Notably, f(2,0,1) is called for the element 3 BECAUSE original[ 0 ][ 1 ] is the element 2
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * @param dimension - The dimension of the array (how many levels of nested arrays there are). For instance,
 *   [ 'a' ] is a 1-dimensional array, [ [ 'b' ] ] is a 2-dimensional array, etc.
 * @param array - A multidimensional array of the specified dimension
 * @param forEach - function( element: {*}, indices...: {Array.<number>} ). Called for each individual
 *   element. The indices are provided as the 2nd, 3rd, etc. parameters to the function (continues depending on the
 *   dimension). This is a generalization of the normal `forEach` function, which only provides the first index. Thus:
 *   array[ indices[ 0 ] ]...[ indices[ dimension - 1 ] ] === element
 */ function dimensionForEach(dimension, array, forEach) {
    // Will get indices pushed when we go deeper into the multidimensional array, and popped when we go back, so that
    // this essentially represents our "position" in the multidimensional array during iteration.
    const indices = [];
    /**
   * Responsible for iterating through a multidimensional array of the given dimension, while accumulating
   * indices.
   */ function recur(dim, arr) {
        return arr.forEach((element, index)=>{
            // To process this element, we need to record our index (in case it is an array that we iterate through).
            indices.push(index);
            // Our base case, where recur was passed a 1-dimensional array
            if (dim === 1) {
                forEach(element, ...indices);
            } else {
                recur(dim - 1, element);
            }
            // We are done with iteration
            indices.pop();
        });
    }
    return recur(dimension, array);
}
phetCore.register('dimensionForEach', dimensionForEach);
export default dimensionForEach;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kaW1lbnNpb25Gb3JFYWNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvckVhY2ggZm9yIG11bHRpZGltZW5zaW9uYWwgYXJyYXlzLlxuICpcbiAqIGUuZy4gZGltZW5zaW9uRm9yRWFjaCggMSwgYXJyYXksIGNhbGxiYWNrICkgaXMgZXF1aXZhbGVudCB0byBhcnJheS5mb3JFYWNoKCBjYWxsYmFjayApXG4gKiBlLmcuIGRpbWVuc2lvbkZvckVhY2goIDIsIFsgWyAxLCAyIF0sIFsgMywgNCBdIF0sIGYgKSB3aWxsIGNhbGw6XG4gKiAgICAgIGYoMSksIGYoMiksIGYoMyksIGYoNClcbiAqICAgT1IgbW9yZSBhY2N1cmF0ZWx5IChzaW5jZSBpdCBpbmNsdWRlcyBpbmRpY2VzIGluZGljYXRpbmcgaG93IHRvIHJlYWNoIHRoYXQgZWxlbWVudDpcbiAqICAgICAgZigxLDAsMCksIGYoMiwwLDEpLCBmKDMsMSwwKSwgZig0LDEsMSlcbiAqICAgTm90YWJseSwgZigyLDAsMSkgaXMgY2FsbGVkIGZvciB0aGUgZWxlbWVudCAzIEJFQ0FVU0Ugb3JpZ2luYWxbIDAgXVsgMSBdIGlzIHRoZSBlbGVtZW50IDJcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBoZXRDb3JlIGZyb20gJy4vcGhldENvcmUuanMnO1xuXG50eXBlIE11bHRpZGltZW5zaW9uYWxBcnJheTxUPiA9IEFycmF5PE11bHRpZGltZW5zaW9uYWxBcnJheTxUPiB8IFQ+O1xuXG4vKipcbiAqIEBwYXJhbSBkaW1lbnNpb24gLSBUaGUgZGltZW5zaW9uIG9mIHRoZSBhcnJheSAoaG93IG1hbnkgbGV2ZWxzIG9mIG5lc3RlZCBhcnJheXMgdGhlcmUgYXJlKS4gRm9yIGluc3RhbmNlLFxuICogICBbICdhJyBdIGlzIGEgMS1kaW1lbnNpb25hbCBhcnJheSwgWyBbICdiJyBdIF0gaXMgYSAyLWRpbWVuc2lvbmFsIGFycmF5LCBldGMuXG4gKiBAcGFyYW0gYXJyYXkgLSBBIG11bHRpZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIHNwZWNpZmllZCBkaW1lbnNpb25cbiAqIEBwYXJhbSBmb3JFYWNoIC0gZnVuY3Rpb24oIGVsZW1lbnQ6IHsqfSwgaW5kaWNlcy4uLjoge0FycmF5LjxudW1iZXI+fSApLiBDYWxsZWQgZm9yIGVhY2ggaW5kaXZpZHVhbFxuICogICBlbGVtZW50LiBUaGUgaW5kaWNlcyBhcmUgcHJvdmlkZWQgYXMgdGhlIDJuZCwgM3JkLCBldGMuIHBhcmFtZXRlcnMgdG8gdGhlIGZ1bmN0aW9uIChjb250aW51ZXMgZGVwZW5kaW5nIG9uIHRoZVxuICogICBkaW1lbnNpb24pLiBUaGlzIGlzIGEgZ2VuZXJhbGl6YXRpb24gb2YgdGhlIG5vcm1hbCBgZm9yRWFjaGAgZnVuY3Rpb24sIHdoaWNoIG9ubHkgcHJvdmlkZXMgdGhlIGZpcnN0IGluZGV4LiBUaHVzOlxuICogICBhcnJheVsgaW5kaWNlc1sgMCBdIF0uLi5bIGluZGljZXNbIGRpbWVuc2lvbiAtIDEgXSBdID09PSBlbGVtZW50XG4gKi9cbmZ1bmN0aW9uIGRpbWVuc2lvbkZvckVhY2g8VD4oIGRpbWVuc2lvbjogbnVtYmVyLCBhcnJheTogTXVsdGlkaW1lbnNpb25hbEFycmF5PFQ+LCBmb3JFYWNoOiAoIGVsZW1lbnQ6IFQsIC4uLmluZGljZXM6IG51bWJlcltdICkgPT4gdm9pZCApOiB2b2lkIHtcblxuICAvLyBXaWxsIGdldCBpbmRpY2VzIHB1c2hlZCB3aGVuIHdlIGdvIGRlZXBlciBpbnRvIHRoZSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5LCBhbmQgcG9wcGVkIHdoZW4gd2UgZ28gYmFjaywgc28gdGhhdFxuICAvLyB0aGlzIGVzc2VudGlhbGx5IHJlcHJlc2VudHMgb3VyIFwicG9zaXRpb25cIiBpbiB0aGUgbXVsdGlkaW1lbnNpb25hbCBhcnJheSBkdXJpbmcgaXRlcmF0aW9uLlxuICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBSZXNwb25zaWJsZSBmb3IgaXRlcmF0aW5nIHRocm91Z2ggYSBtdWx0aWRpbWVuc2lvbmFsIGFycmF5IG9mIHRoZSBnaXZlbiBkaW1lbnNpb24sIHdoaWxlIGFjY3VtdWxhdGluZ1xuICAgKiBpbmRpY2VzLlxuICAgKi9cbiAgZnVuY3Rpb24gcmVjdXIoIGRpbTogbnVtYmVyLCBhcnI6IE11bHRpZGltZW5zaW9uYWxBcnJheTxUPiApOiB2b2lkIHtcbiAgICByZXR1cm4gYXJyLmZvckVhY2goICggZWxlbWVudCwgaW5kZXggKSA9PiB7XG5cbiAgICAgIC8vIFRvIHByb2Nlc3MgdGhpcyBlbGVtZW50LCB3ZSBuZWVkIHRvIHJlY29yZCBvdXIgaW5kZXggKGluIGNhc2UgaXQgaXMgYW4gYXJyYXkgdGhhdCB3ZSBpdGVyYXRlIHRocm91Z2gpLlxuICAgICAgaW5kaWNlcy5wdXNoKCBpbmRleCApO1xuXG4gICAgICAvLyBPdXIgYmFzZSBjYXNlLCB3aGVyZSByZWN1ciB3YXMgcGFzc2VkIGEgMS1kaW1lbnNpb25hbCBhcnJheVxuICAgICAgaWYgKCBkaW0gPT09IDEgKSB7XG4gICAgICAgIGZvckVhY2goIGVsZW1lbnQgYXMgVCwgLi4uaW5kaWNlcyApO1xuICAgICAgfVxuICAgICAgLy8gV2UgaGF2ZSBtb3JlIGRpbWVuc2lvbnNcbiAgICAgIGVsc2Uge1xuICAgICAgICByZWN1ciggZGltIC0gMSwgZWxlbWVudCBhcyBNdWx0aWRpbWVuc2lvbmFsQXJyYXk8VD4gKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UgYXJlIGRvbmUgd2l0aCBpdGVyYXRpb25cbiAgICAgIGluZGljZXMucG9wKCk7XG4gICAgfSApO1xuICB9XG5cbiAgcmV0dXJuIHJlY3VyKCBkaW1lbnNpb24sIGFycmF5ICk7XG59XG5cbnBoZXRDb3JlLnJlZ2lzdGVyKCAnZGltZW5zaW9uRm9yRWFjaCcsIGRpbWVuc2lvbkZvckVhY2ggKTtcblxuZXhwb3J0IGRlZmF1bHQgZGltZW5zaW9uRm9yRWFjaDsiXSwibmFtZXMiOlsicGhldENvcmUiLCJkaW1lbnNpb25Gb3JFYWNoIiwiZGltZW5zaW9uIiwiYXJyYXkiLCJmb3JFYWNoIiwiaW5kaWNlcyIsInJlY3VyIiwiZGltIiwiYXJyIiwiZWxlbWVudCIsImluZGV4IiwicHVzaCIsInBvcCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSxjQUFjLGdCQUFnQjtBQUlyQzs7Ozs7Ozs7Q0FRQyxHQUNELFNBQVNDLGlCQUFxQkMsU0FBaUIsRUFBRUMsS0FBK0IsRUFBRUMsT0FBcUQ7SUFFckksaUhBQWlIO0lBQ2pILDZGQUE2RjtJQUM3RixNQUFNQyxVQUFvQixFQUFFO0lBRTVCOzs7R0FHQyxHQUNELFNBQVNDLE1BQU9DLEdBQVcsRUFBRUMsR0FBNkI7UUFDeEQsT0FBT0EsSUFBSUosT0FBTyxDQUFFLENBQUVLLFNBQVNDO1lBRTdCLHlHQUF5RztZQUN6R0wsUUFBUU0sSUFBSSxDQUFFRDtZQUVkLDhEQUE4RDtZQUM5RCxJQUFLSCxRQUFRLEdBQUk7Z0JBQ2ZILFFBQVNLLFlBQWlCSjtZQUM1QixPQUVLO2dCQUNIQyxNQUFPQyxNQUFNLEdBQUdFO1lBQ2xCO1lBRUEsNkJBQTZCO1lBQzdCSixRQUFRTyxHQUFHO1FBQ2I7SUFDRjtJQUVBLE9BQU9OLE1BQU9KLFdBQVdDO0FBQzNCO0FBRUFILFNBQVNhLFFBQVEsQ0FBRSxvQkFBb0JaO0FBRXZDLGVBQWVBLGlCQUFpQiJ9