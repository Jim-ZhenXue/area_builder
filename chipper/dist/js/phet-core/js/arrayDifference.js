// Copyright 2018-2023, University of Colorado Boulder
/**
 * Computes what elements are in both arrays, or only one array.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import phetCore from './phetCore.js';
/**
 * Given two arrays, find the items that are only in one of them (mutates the aOnly/bOnly/inBoth parameters)
 *
 * NOTE: Assumes there are no duplicate values in each individual array.
 *
 * For example:
 *   var a = [ 1, 2 ];
 *   var b = [ 5, 2, 0 ];
 *   var aOnly = [];
 *   var bOnly = [];
 *   var inBoth = [];
 *   arrayDifference( a, b, aOnly, bOnly, inBoth );
 *   // aOnly is [ 1 ]
 *   // bOnly is [ 5, 0 ]
 *   // inBoth is [ 2 ]
 *
 * @param a - Input array
 * @param b - Input array
 * @param [aOnly] - Output array (will be filled with all elements that are in `a` but NOT in `b`).
 *                              Ordered based on the order of `a`.
 * @param [bOnly] - Output array (will be filled with all elements that are in `b` but NOT in `a`).
 *                              Ordered based on the order of `b`.
 * @param [inBoth] - Output array (will be filled with all elements that are in both `a` AND `b`).
 *                               Ordered based on the order of `a`.
 * @returns - Returns the value of aOnly (the classic definition of difference)
 */ function arrayDifference(a, b, aOnly, bOnly, inBoth) {
    assert && assert(Array.isArray(a) && _.uniq(a).length === a.length, 'a is not an array of unique items');
    assert && assert(Array.isArray(b) && _.uniq(b).length === b.length, 'b is not an array of unique items');
    aOnly = aOnly || [];
    bOnly = bOnly || [];
    inBoth = inBoth || [];
    assert && assert(Array.isArray(aOnly) && aOnly.length === 0);
    assert && assert(Array.isArray(bOnly) && bOnly.length === 0);
    assert && assert(Array.isArray(inBoth) && inBoth.length === 0);
    Array.prototype.push.apply(aOnly, a);
    Array.prototype.push.apply(bOnly, b);
    outerLoop: for(let i = 0; i < aOnly.length; i++){
        const aItem = aOnly[i];
        for(let j = 0; j < bOnly.length; j++){
            const bItem = bOnly[j];
            if (aItem === bItem) {
                inBoth.push(aItem);
                aOnly.splice(i, 1);
                bOnly.splice(j, 1);
                j = 0;
                if (i === aOnly.length) {
                    break outerLoop; // eslint-disable-line no-labels
                }
                i -= 1;
            }
        }
    }
    // We return the classic meaning of "difference"
    return aOnly;
}
phetCore.register('arrayDifference', arrayDifference);
export default arrayDifference;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheURpZmZlcmVuY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29tcHV0ZXMgd2hhdCBlbGVtZW50cyBhcmUgaW4gYm90aCBhcnJheXMsIG9yIG9ubHkgb25lIGFycmF5LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5cbi8qKlxuICogR2l2ZW4gdHdvIGFycmF5cywgZmluZCB0aGUgaXRlbXMgdGhhdCBhcmUgb25seSBpbiBvbmUgb2YgdGhlbSAobXV0YXRlcyB0aGUgYU9ubHkvYk9ubHkvaW5Cb3RoIHBhcmFtZXRlcnMpXG4gKlxuICogTk9URTogQXNzdW1lcyB0aGVyZSBhcmUgbm8gZHVwbGljYXRlIHZhbHVlcyBpbiBlYWNoIGluZGl2aWR1YWwgYXJyYXkuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKiAgIHZhciBhID0gWyAxLCAyIF07XG4gKiAgIHZhciBiID0gWyA1LCAyLCAwIF07XG4gKiAgIHZhciBhT25seSA9IFtdO1xuICogICB2YXIgYk9ubHkgPSBbXTtcbiAqICAgdmFyIGluQm90aCA9IFtdO1xuICogICBhcnJheURpZmZlcmVuY2UoIGEsIGIsIGFPbmx5LCBiT25seSwgaW5Cb3RoICk7XG4gKiAgIC8vIGFPbmx5IGlzIFsgMSBdXG4gKiAgIC8vIGJPbmx5IGlzIFsgNSwgMCBdXG4gKiAgIC8vIGluQm90aCBpcyBbIDIgXVxuICpcbiAqIEBwYXJhbSBhIC0gSW5wdXQgYXJyYXlcbiAqIEBwYXJhbSBiIC0gSW5wdXQgYXJyYXlcbiAqIEBwYXJhbSBbYU9ubHldIC0gT3V0cHV0IGFycmF5ICh3aWxsIGJlIGZpbGxlZCB3aXRoIGFsbCBlbGVtZW50cyB0aGF0IGFyZSBpbiBgYWAgYnV0IE5PVCBpbiBgYmApLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcmRlcmVkIGJhc2VkIG9uIHRoZSBvcmRlciBvZiBgYWAuXG4gKiBAcGFyYW0gW2JPbmx5XSAtIE91dHB1dCBhcnJheSAod2lsbCBiZSBmaWxsZWQgd2l0aCBhbGwgZWxlbWVudHMgdGhhdCBhcmUgaW4gYGJgIGJ1dCBOT1QgaW4gYGFgKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JkZXJlZCBiYXNlZCBvbiB0aGUgb3JkZXIgb2YgYGJgLlxuICogQHBhcmFtIFtpbkJvdGhdIC0gT3V0cHV0IGFycmF5ICh3aWxsIGJlIGZpbGxlZCB3aXRoIGFsbCBlbGVtZW50cyB0aGF0IGFyZSBpbiBib3RoIGBhYCBBTkQgYGJgKS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yZGVyZWQgYmFzZWQgb24gdGhlIG9yZGVyIG9mIGBhYC5cbiAqIEByZXR1cm5zIC0gUmV0dXJucyB0aGUgdmFsdWUgb2YgYU9ubHkgKHRoZSBjbGFzc2ljIGRlZmluaXRpb24gb2YgZGlmZmVyZW5jZSlcbiAqL1xuZnVuY3Rpb24gYXJyYXlEaWZmZXJlbmNlPFQ+KCBhOiBUW10sIGI6IFRbXSwgYU9ubHk/OiBUW10sIGJPbmx5PzogVFtdLCBpbkJvdGg/OiBUW10gKTogVFtdIHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYSApICYmIF8udW5pcSggYSApLmxlbmd0aCA9PT0gYS5sZW5ndGgsICdhIGlzIG5vdCBhbiBhcnJheSBvZiB1bmlxdWUgaXRlbXMnICk7XG4gIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGIgKSAmJiBfLnVuaXEoIGIgKS5sZW5ndGggPT09IGIubGVuZ3RoLCAnYiBpcyBub3QgYW4gYXJyYXkgb2YgdW5pcXVlIGl0ZW1zJyApO1xuXG4gIGFPbmx5ID0gYU9ubHkgfHwgW107XG4gIGJPbmx5ID0gYk9ubHkgfHwgW107XG4gIGluQm90aCA9IGluQm90aCB8fCBbXTtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBhT25seSApICYmIGFPbmx5Lmxlbmd0aCA9PT0gMCApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBiT25seSApICYmIGJPbmx5Lmxlbmd0aCA9PT0gMCApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBpbkJvdGggKSAmJiBpbkJvdGgubGVuZ3RoID09PSAwICk7XG5cbiAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGFPbmx5LCBhICk7XG4gIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBiT25seSwgYiApO1xuXG4gIG91dGVyTG9vcDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhT25seS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGFJdGVtID0gYU9ubHlbIGkgXTtcblxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgYk9ubHkubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGJJdGVtID0gYk9ubHlbIGogXTtcblxuICAgICAgICBpZiAoIGFJdGVtID09PSBiSXRlbSApIHtcbiAgICAgICAgICBpbkJvdGgucHVzaCggYUl0ZW0gKTtcbiAgICAgICAgICBhT25seS5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgICBiT25seS5zcGxpY2UoIGosIDEgKTtcbiAgICAgICAgICBqID0gMDtcbiAgICAgICAgICBpZiAoIGkgPT09IGFPbmx5Lmxlbmd0aCApIHtcbiAgICAgICAgICAgIGJyZWFrIG91dGVyTG9vcDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICAgICAgICB9XG4gICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIC8vIFdlIHJldHVybiB0aGUgY2xhc3NpYyBtZWFuaW5nIG9mIFwiZGlmZmVyZW5jZVwiXG4gIHJldHVybiBhT25seTtcbn1cblxucGhldENvcmUucmVnaXN0ZXIoICdhcnJheURpZmZlcmVuY2UnLCBhcnJheURpZmZlcmVuY2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgYXJyYXlEaWZmZXJlbmNlOyJdLCJuYW1lcyI6WyJwaGV0Q29yZSIsImFycmF5RGlmZmVyZW5jZSIsImEiLCJiIiwiYU9ubHkiLCJiT25seSIsImluQm90aCIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsIl8iLCJ1bmlxIiwibGVuZ3RoIiwicHJvdG90eXBlIiwicHVzaCIsImFwcGx5Iiwib3V0ZXJMb29wIiwiaSIsImFJdGVtIiwiaiIsImJJdGVtIiwic3BsaWNlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxnQkFBZ0I7QUFFckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5QkMsR0FDRCxTQUFTQyxnQkFBb0JDLENBQU0sRUFBRUMsQ0FBTSxFQUFFQyxLQUFXLEVBQUVDLEtBQVcsRUFBRUMsTUFBWTtJQUNqRkMsVUFBVUEsT0FBUUMsTUFBTUMsT0FBTyxDQUFFUCxNQUFPUSxFQUFFQyxJQUFJLENBQUVULEdBQUlVLE1BQU0sS0FBS1YsRUFBRVUsTUFBTSxFQUFFO0lBQ3pFTCxVQUFVQSxPQUFRQyxNQUFNQyxPQUFPLENBQUVOLE1BQU9PLEVBQUVDLElBQUksQ0FBRVIsR0FBSVMsTUFBTSxLQUFLVCxFQUFFUyxNQUFNLEVBQUU7SUFFekVSLFFBQVFBLFNBQVMsRUFBRTtJQUNuQkMsUUFBUUEsU0FBUyxFQUFFO0lBQ25CQyxTQUFTQSxVQUFVLEVBQUU7SUFFckJDLFVBQVVBLE9BQVFDLE1BQU1DLE9BQU8sQ0FBRUwsVUFBV0EsTUFBTVEsTUFBTSxLQUFLO0lBQzdETCxVQUFVQSxPQUFRQyxNQUFNQyxPQUFPLENBQUVKLFVBQVdBLE1BQU1PLE1BQU0sS0FBSztJQUM3REwsVUFBVUEsT0FBUUMsTUFBTUMsT0FBTyxDQUFFSCxXQUFZQSxPQUFPTSxNQUFNLEtBQUs7SUFFL0RKLE1BQU1LLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUVYLE9BQU9GO0lBQ25DTSxNQUFNSyxTQUFTLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFFVixPQUFPRjtJQUVuQ2EsV0FDRSxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSWIsTUFBTVEsTUFBTSxFQUFFSyxJQUFNO1FBQ3ZDLE1BQU1DLFFBQVFkLEtBQUssQ0FBRWEsRUFBRztRQUV4QixJQUFNLElBQUlFLElBQUksR0FBR0EsSUFBSWQsTUFBTU8sTUFBTSxFQUFFTyxJQUFNO1lBQ3ZDLE1BQU1DLFFBQVFmLEtBQUssQ0FBRWMsRUFBRztZQUV4QixJQUFLRCxVQUFVRSxPQUFRO2dCQUNyQmQsT0FBT1EsSUFBSSxDQUFFSTtnQkFDYmQsTUFBTWlCLE1BQU0sQ0FBRUosR0FBRztnQkFDakJaLE1BQU1nQixNQUFNLENBQUVGLEdBQUc7Z0JBQ2pCQSxJQUFJO2dCQUNKLElBQUtGLE1BQU1iLE1BQU1RLE1BQU0sRUFBRztvQkFDeEIsTUFBTUksV0FBVyxnQ0FBZ0M7Z0JBQ25EO2dCQUNBQyxLQUFLO1lBQ1A7UUFDRjtJQUNGO0lBRUYsZ0RBQWdEO0lBQ2hELE9BQU9iO0FBQ1Q7QUFFQUosU0FBU3NCLFFBQVEsQ0FBRSxtQkFBbUJyQjtBQUV0QyxlQUFlQSxnQkFBZ0IifQ==