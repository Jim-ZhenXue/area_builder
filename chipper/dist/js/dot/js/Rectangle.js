// Copyright 2013-2020, University of Colorado Boulder
/**
 * A 2D rectangle-shaped bounded area, with a convenience name and constructor. Totally functionally
 * equivalent to Bounds2, but with a different constructor.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from './Bounds2.js';
import dot from './dot.js';
let Rectangle = class Rectangle extends Bounds2 {
    /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */ constructor(x, y, width, height){
        assert && assert(height !== undefined, 'Rectangle requires 4 parameters');
        super(x, y, x + width, y + height);
    }
};
dot.register('Rectangle', Rectangle);
export default Rectangle;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSAyRCByZWN0YW5nbGUtc2hhcGVkIGJvdW5kZWQgYXJlYSwgd2l0aCBhIGNvbnZlbmllbmNlIG5hbWUgYW5kIGNvbnN0cnVjdG9yLiBUb3RhbGx5IGZ1bmN0aW9uYWxseVxuICogZXF1aXZhbGVudCB0byBCb3VuZHMyLCBidXQgd2l0aCBhIGRpZmZlcmVudCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG5jbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBCb3VuZHMyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAqL1xuICBjb25zdHJ1Y3RvciggeCwgeSwgd2lkdGgsIGhlaWdodCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgIT09IHVuZGVmaW5lZCwgJ1JlY3RhbmdsZSByZXF1aXJlcyA0IHBhcmFtZXRlcnMnICk7XG4gICAgc3VwZXIoIHgsIHksIHggKyB3aWR0aCwgeSArIGhlaWdodCApO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1JlY3RhbmdsZScsIFJlY3RhbmdsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBSZWN0YW5nbGU7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJkb3QiLCJSZWN0YW5nbGUiLCJjb25zdHJ1Y3RvciIsIngiLCJ5Iiwid2lkdGgiLCJoZWlnaHQiLCJhc3NlcnQiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLFNBQVMsV0FBVztBQUUzQixJQUFBLEFBQU1DLFlBQU4sTUFBTUEsa0JBQWtCRjtJQUN0Qjs7Ozs7R0FLQyxHQUNERyxZQUFhQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsS0FBSyxFQUFFQyxNQUFNLENBQUc7UUFDakNDLFVBQVVBLE9BQVFELFdBQVdFLFdBQVc7UUFDeEMsS0FBSyxDQUFFTCxHQUFHQyxHQUFHRCxJQUFJRSxPQUFPRCxJQUFJRTtJQUM5QjtBQUNGO0FBRUFOLElBQUlTLFFBQVEsQ0FBRSxhQUFhUjtBQUUzQixlQUFlQSxVQUFVIn0=