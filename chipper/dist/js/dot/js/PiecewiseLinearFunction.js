// Copyright 2019-2024, University of Colorado Boulder
/**
 * Evaluates points on a piecewise linear function.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import dot from './dot.js';
import Utils from './Utils.js';
let PiecewiseLinearFunction = class PiecewiseLinearFunction {
    evaluate(x) {
        return PiecewiseLinearFunction.evaluate(this.array, x);
    }
    /**
   * This algorithm generates no garbage
   * @param array - in the form x0,y0, x1,y1, x2,y2, etc.  Points do not have to be ordered from low to high x
   *                         - points cannot have a different y value for the same x value (not checked)
   * @param x
   */ static evaluate(array, x) {
        // Find the points in the range by a single pass through the anchors
        let lowerIndex = -1;
        let lowerDelta = Number.POSITIVE_INFINITY;
        let upperIndex = -1;
        let upperDelta = Number.POSITIVE_INFINITY;
        for(let i = 0; i < array.length; i += 2){
            const arrayElement = array[i];
            const delta = x - arrayElement;
            const abs = Math.abs(delta);
            // Check for exact match
            if (arrayElement === x) {
                return array[i + 1];
            }
            if (arrayElement <= x && abs < lowerDelta) {
                lowerIndex = i;
                lowerDelta = abs;
            }
            if (arrayElement >= x && abs < upperDelta) {
                upperIndex = i;
                upperDelta = abs;
            }
        }
        assert && assert(lowerIndex >= 0, 'lower bound not found');
        assert && assert(upperIndex >= 0, 'upper bound not found');
        const anchor1X = array[lowerIndex];
        const anchor1Y = array[lowerIndex + 1];
        const anchor2X = array[upperIndex];
        const anchor2Y = array[upperIndex + 1];
        return Utils.linear(anchor1X, anchor2X, anchor1Y, anchor2Y, x);
    }
    /**
   * @param array - in the form x0,y0, x1,y1, x2,y2, etc.  Points do not have to be in order.
   *              - points cannot have a different y value for the same x value (not checked)
   */ constructor(array){
        this.array = array;
        assert && assert(array.length % 2 === 0, 'array length should be even');
        assert && assert(array.length > 0, 'array must have elements');
        assert && assert(Array.isArray(array), 'array should be an array');
    }
};
dot.register('PiecewiseLinearFunction', PiecewiseLinearFunction);
export default PiecewiseLinearFunction;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9QaWVjZXdpc2VMaW5lYXJGdW5jdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFdmFsdWF0ZXMgcG9pbnRzIG9uIGEgcGllY2V3aXNlIGxpbmVhciBmdW5jdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuXG5jbGFzcyBQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhcnJheSAtIGluIHRoZSBmb3JtIHgwLHkwLCB4MSx5MSwgeDIseTIsIGV0Yy4gIFBvaW50cyBkbyBub3QgaGF2ZSB0byBiZSBpbiBvcmRlci5cbiAgICogICAgICAgICAgICAgIC0gcG9pbnRzIGNhbm5vdCBoYXZlIGEgZGlmZmVyZW50IHkgdmFsdWUgZm9yIHRoZSBzYW1lIHggdmFsdWUgKG5vdCBjaGVja2VkKVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcml2YXRlIHJlYWRvbmx5IGFycmF5OiBudW1iZXJbXSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnJheS5sZW5ndGggJSAyID09PSAwLCAnYXJyYXkgbGVuZ3RoIHNob3VsZCBiZSBldmVuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFycmF5Lmxlbmd0aCA+IDAsICdhcnJheSBtdXN0IGhhdmUgZWxlbWVudHMnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYXJyYXkgKSwgJ2FycmF5IHNob3VsZCBiZSBhbiBhcnJheScgKTtcbiAgfVxuXG4gIHB1YmxpYyBldmFsdWF0ZSggeDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLmV2YWx1YXRlKCB0aGlzLmFycmF5LCB4ICk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBhbGdvcml0aG0gZ2VuZXJhdGVzIG5vIGdhcmJhZ2VcbiAgICogQHBhcmFtIGFycmF5IC0gaW4gdGhlIGZvcm0geDAseTAsIHgxLHkxLCB4Mix5MiwgZXRjLiAgUG9pbnRzIGRvIG5vdCBoYXZlIHRvIGJlIG9yZGVyZWQgZnJvbSBsb3cgdG8gaGlnaCB4XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgIC0gcG9pbnRzIGNhbm5vdCBoYXZlIGEgZGlmZmVyZW50IHkgdmFsdWUgZm9yIHRoZSBzYW1lIHggdmFsdWUgKG5vdCBjaGVja2VkKVxuICAgKiBAcGFyYW0geFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBldmFsdWF0ZSggYXJyYXk6IG51bWJlcltdLCB4OiBudW1iZXIgKTogbnVtYmVyIHtcblxuICAgIC8vIEZpbmQgdGhlIHBvaW50cyBpbiB0aGUgcmFuZ2UgYnkgYSBzaW5nbGUgcGFzcyB0aHJvdWdoIHRoZSBhbmNob3JzXG4gICAgbGV0IGxvd2VySW5kZXggPSAtMTtcbiAgICBsZXQgbG93ZXJEZWx0YSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBsZXQgdXBwZXJJbmRleCA9IC0xO1xuICAgIGxldCB1cHBlckRlbHRhID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSArPSAyICkge1xuICAgICAgY29uc3QgYXJyYXlFbGVtZW50ID0gYXJyYXlbIGkgXTtcbiAgICAgIGNvbnN0IGRlbHRhID0geCAtIGFycmF5RWxlbWVudDtcbiAgICAgIGNvbnN0IGFicyA9IE1hdGguYWJzKCBkZWx0YSApO1xuXG4gICAgICAvLyBDaGVjayBmb3IgZXhhY3QgbWF0Y2hcbiAgICAgIGlmICggYXJyYXlFbGVtZW50ID09PSB4ICkge1xuICAgICAgICByZXR1cm4gYXJyYXlbIGkgKyAxIF07XG4gICAgICB9XG4gICAgICBpZiAoIGFycmF5RWxlbWVudCA8PSB4ICYmIGFicyA8IGxvd2VyRGVsdGEgKSB7XG4gICAgICAgIGxvd2VySW5kZXggPSBpO1xuICAgICAgICBsb3dlckRlbHRhID0gYWJzO1xuICAgICAgfVxuICAgICAgaWYgKCBhcnJheUVsZW1lbnQgPj0geCAmJiBhYnMgPCB1cHBlckRlbHRhICkge1xuICAgICAgICB1cHBlckluZGV4ID0gaTtcbiAgICAgICAgdXBwZXJEZWx0YSA9IGFicztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb3dlckluZGV4ID49IDAsICdsb3dlciBib3VuZCBub3QgZm91bmQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdXBwZXJJbmRleCA+PSAwLCAndXBwZXIgYm91bmQgbm90IGZvdW5kJyApO1xuXG4gICAgY29uc3QgYW5jaG9yMVggPSBhcnJheVsgbG93ZXJJbmRleCBdO1xuICAgIGNvbnN0IGFuY2hvcjFZID0gYXJyYXlbIGxvd2VySW5kZXggKyAxIF07XG4gICAgY29uc3QgYW5jaG9yMlggPSBhcnJheVsgdXBwZXJJbmRleCBdO1xuICAgIGNvbnN0IGFuY2hvcjJZID0gYXJyYXlbIHVwcGVySW5kZXggKyAxIF07XG4gICAgcmV0dXJuIFV0aWxzLmxpbmVhciggYW5jaG9yMVgsIGFuY2hvcjJYLCBhbmNob3IxWSwgYW5jaG9yMlksIHggKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbicsIFBpZWNld2lzZUxpbmVhckZ1bmN0aW9uICk7XG5leHBvcnQgZGVmYXVsdCBQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbjsiXSwibmFtZXMiOlsiZG90IiwiVXRpbHMiLCJQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiIsImV2YWx1YXRlIiwieCIsImFycmF5IiwibG93ZXJJbmRleCIsImxvd2VyRGVsdGEiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInVwcGVySW5kZXgiLCJ1cHBlckRlbHRhIiwiaSIsImxlbmd0aCIsImFycmF5RWxlbWVudCIsImRlbHRhIiwiYWJzIiwiTWF0aCIsImFzc2VydCIsImFuY2hvcjFYIiwiYW5jaG9yMVkiLCJhbmNob3IyWCIsImFuY2hvcjJZIiwibGluZWFyIiwiQXJyYXkiLCJpc0FycmF5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixJQUFBLEFBQU1DLDBCQUFOLE1BQU1BO0lBWUdDLFNBQVVDLENBQVMsRUFBVztRQUNuQyxPQUFPRix3QkFBd0JDLFFBQVEsQ0FBRSxJQUFJLENBQUNFLEtBQUssRUFBRUQ7SUFDdkQ7SUFFQTs7Ozs7R0FLQyxHQUNELE9BQWNELFNBQVVFLEtBQWUsRUFBRUQsQ0FBUyxFQUFXO1FBRTNELG9FQUFvRTtRQUNwRSxJQUFJRSxhQUFhLENBQUM7UUFDbEIsSUFBSUMsYUFBYUMsT0FBT0MsaUJBQWlCO1FBQ3pDLElBQUlDLGFBQWEsQ0FBQztRQUNsQixJQUFJQyxhQUFhSCxPQUFPQyxpQkFBaUI7UUFDekMsSUFBTSxJQUFJRyxJQUFJLEdBQUdBLElBQUlQLE1BQU1RLE1BQU0sRUFBRUQsS0FBSyxFQUFJO1lBQzFDLE1BQU1FLGVBQWVULEtBQUssQ0FBRU8sRUFBRztZQUMvQixNQUFNRyxRQUFRWCxJQUFJVTtZQUNsQixNQUFNRSxNQUFNQyxLQUFLRCxHQUFHLENBQUVEO1lBRXRCLHdCQUF3QjtZQUN4QixJQUFLRCxpQkFBaUJWLEdBQUk7Z0JBQ3hCLE9BQU9DLEtBQUssQ0FBRU8sSUFBSSxFQUFHO1lBQ3ZCO1lBQ0EsSUFBS0UsZ0JBQWdCVixLQUFLWSxNQUFNVCxZQUFhO2dCQUMzQ0QsYUFBYU07Z0JBQ2JMLGFBQWFTO1lBQ2Y7WUFDQSxJQUFLRixnQkFBZ0JWLEtBQUtZLE1BQU1MLFlBQWE7Z0JBQzNDRCxhQUFhRTtnQkFDYkQsYUFBYUs7WUFDZjtRQUNGO1FBRUFFLFVBQVVBLE9BQVFaLGNBQWMsR0FBRztRQUNuQ1ksVUFBVUEsT0FBUVIsY0FBYyxHQUFHO1FBRW5DLE1BQU1TLFdBQVdkLEtBQUssQ0FBRUMsV0FBWTtRQUNwQyxNQUFNYyxXQUFXZixLQUFLLENBQUVDLGFBQWEsRUFBRztRQUN4QyxNQUFNZSxXQUFXaEIsS0FBSyxDQUFFSyxXQUFZO1FBQ3BDLE1BQU1ZLFdBQVdqQixLQUFLLENBQUVLLGFBQWEsRUFBRztRQUN4QyxPQUFPVCxNQUFNc0IsTUFBTSxDQUFFSixVQUFVRSxVQUFVRCxVQUFVRSxVQUFVbEI7SUFDL0Q7SUF0REE7OztHQUdDLEdBQ0QsWUFBb0IsQUFBaUJDLEtBQWUsQ0FBRzthQUFsQkEsUUFBQUE7UUFDbkNhLFVBQVVBLE9BQVFiLE1BQU1RLE1BQU0sR0FBRyxNQUFNLEdBQUc7UUFDMUNLLFVBQVVBLE9BQVFiLE1BQU1RLE1BQU0sR0FBRyxHQUFHO1FBQ3BDSyxVQUFVQSxPQUFRTSxNQUFNQyxPQUFPLENBQUVwQixRQUFTO0lBQzVDO0FBK0NGO0FBRUFMLElBQUkwQixRQUFRLENBQUUsMkJBQTJCeEI7QUFDekMsZUFBZUEsd0JBQXdCIn0=