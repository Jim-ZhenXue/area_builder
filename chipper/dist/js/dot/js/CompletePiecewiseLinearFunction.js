// Copyright 2022-2024, University of Colorado Boulder
/**
 * Describes a 1d complete (fully defined for any number) function, where values are extrapolated given the final end
 * points.
 *
 * E.g. if the points (0,0) and (1,1) are provided, it represents the function f(x) = x for ALL values, especially
 * values outside of the range [0,1]. For example, f(6) = 6.
 *
 * If a single point is provided, it represents a constant function.
 *
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
let CompletePiecewiseLinearFunction = class CompletePiecewiseLinearFunction {
    /**
   * Returns the pair of points that the x value is defined by.
   *
   * NOTE: x may NOT be contained in these points, if it's either less than or greater than any points in the points
   * list.
   */ findMatchingPair(x) {
        assert && assert(this.points.length > 1);
        let i = 0;
        while(i < this.points.length - 2 && this.points[i + 1].x < x){
            i++;
        }
        return [
            this.points[i],
            this.points[i + 1]
        ];
    }
    /**
   * Evaluates the function at the given x value, e.g. returns f(x).
   */ evaluate(x) {
        if (this.points.length === 1) {
            return this.points[0].y;
        } else {
            const [leftPoint, rightPoint] = this.findMatchingPair(x);
            if (leftPoint.x === x) {
                return leftPoint.y;
            } else if (rightPoint.x === x) {
                return rightPoint.y;
            } else {
                return Utils.linear(leftPoint.x, rightPoint.x, leftPoint.y, rightPoint.y, x);
            }
        }
    }
    /**
   * Returns an array that combines sorted unique x-values provided by this function and/or the other function.
   */ getCombinedXValues(linearFunction) {
        return CompletePiecewiseLinearFunction.sortedUniqueEpsilon(this.points.map((point)=>point.x).concat(linearFunction.points.map((point)=>point.x)));
    }
    /**
   * Returns an array that combines the sorted unique x-values included in this function and/or the other function, OR the unique x-values
   * that result from the intersection of the two functions.
   */ getIntersectedXValues(linearFunction) {
        const xValues = this.getCombinedXValues(linearFunction);
        const newXValues = [];
        for(let i = 0; i < xValues.length - 1; i++){
            const leftX = xValues[i];
            const rightX = xValues[i + 1];
            const intersectionPoint = Utils.lineLineIntersection(// The linear function defined in this
            new Vector2(leftX, this.evaluate(leftX)), new Vector2(rightX, this.evaluate(rightX)), // The passed in argument linear function
            new Vector2(leftX, linearFunction.evaluate(leftX)), new Vector2(rightX, linearFunction.evaluate(rightX)));
            if (intersectionPoint && // If it's our first pair of points, don't filter out points that are on the left side of the left point
            (i === 0 || intersectionPoint.x > leftX) && // If it's our last pair of points, don't filter out points that are on the right side of the right point
            (i === xValues.length - 2 || intersectionPoint.x < rightX)) {
                newXValues.push(intersectionPoint.x);
            }
        }
        // Remove duplicate values above and sort them
        const criticalXValues = CompletePiecewiseLinearFunction.sortedUniqueEpsilon([
            ...xValues,
            ...newXValues
        ]);
        // To capture the slope at the start/end, we'll add extra points to guarantee this. If they're duplicated, they'll
        // be removed during the collinear check on construction.
        return [
            criticalXValues[0] - 1,
            ...criticalXValues,
            criticalXValues[criticalXValues.length - 1] + 1
        ];
    }
    /**
   * Returns a new function that's the result of applying the binary operation at the given x values.
   */ binaryXOperation(linearFunction, operation, xValues) {
        return new CompletePiecewiseLinearFunction(xValues.map((x)=>{
            return new Vector2(x, operation(this.evaluate(x), linearFunction.evaluate(x)));
        }));
    }
    /**
   * Returns a new function that's the result of applying the binary operation at the x values that already occur
   * in each function.
   */ binaryPointwiseOperation(linearFunction, operation) {
        return this.binaryXOperation(linearFunction, operation, this.getCombinedXValues(linearFunction));
    }
    /**
   * Returns a new function that's the result of applying the binary operation at the x values that either occur in
   * each function OR at the intersection of the two functions.
   */ binaryIntersectingOperation(linearFunction, operation) {
        return this.binaryXOperation(linearFunction, operation, this.getIntersectedXValues(linearFunction));
    }
    /**
   * Returns a CompletePiecewiseLinearFunction that's the result of adding the two functions.
   */ plus(linearFunction) {
        return this.binaryPointwiseOperation(linearFunction, (a, b)=>a + b);
    }
    /**
   * Returns a CompletePiecewiseLinearFunction that's the result of subtracting the two functions.
   */ minus(linearFunction) {
        return this.binaryPointwiseOperation(linearFunction, (a, b)=>a - b);
    }
    /**
   * Returns a CompletePiecewiseLinearFunction that's the result of taking the minimum of the two functions
   */ min(linearFunction) {
        return this.binaryIntersectingOperation(linearFunction, Math.min);
    }
    /**
   * Returns a CompletePiecewiseLinearFunction that's the result of taking the maximum of the two functions
   */ max(linearFunction) {
        return this.binaryIntersectingOperation(linearFunction, Math.max);
    }
    /**
   * Allows redefining or clamping/truncating the function by only representing it from the given x values
   */ withXValues(xValues) {
        return new CompletePiecewiseLinearFunction(xValues.map((x)=>new Vector2(x, this.evaluate(x))));
    }
    /**
   * Returns an inverted form of the function (assuming it is monotonically increasing or monotonically decreasing)
   */ inverted() {
        const points = this.points.map((point)=>new Vector2(point.y, point.x));
        // NOTE: We'll rely on the constructor to make sure that the inverse is valid. Here we'll handle the monotonically
        // decreasing case (which is invertible, just needs a reversal of points)
        if (points.length > 1 && points[0].x > points[1].x) {
            points.reverse();
        }
        return new CompletePiecewiseLinearFunction(points);
    }
    static sum(...functions) {
        return functions.reduce((a, b)=>a.plus(b));
    }
    static min(...functions) {
        return functions.reduce((a, b)=>a.min(b));
    }
    static max(...functions) {
        return functions.reduce((a, b)=>a.max(b));
    }
    static constant(y) {
        return new CompletePiecewiseLinearFunction([
            new Vector2(0, y)
        ]);
    }
    // Represents the function ax+b
    static linear(a, b) {
        return new CompletePiecewiseLinearFunction([
            new Vector2(0, b),
            new Vector2(1, a + b)
        ]);
    }
    /**
   * Returns a sorted list of the input numbers, ensuring no duplicates within a specified epsilon value
   */ static sortedUniqueEpsilon(numbers, epsilon = 1e-10) {
        numbers = _.sortBy(numbers);
        for(let i = 0; i < numbers.length - 1; i++){
            if (Math.abs(numbers[i] - numbers[i + 1]) < epsilon) {
                numbers.splice(i, 1);
                i--;
            }
        }
        return numbers;
    }
    // Assumed to be sorted by x value, and continuous
    constructor(points){
        assert && assert(points.length > 0);
        assert && points.forEach((point, i)=>{
            if (i < points.length - 1) {
                assert && assert(point.x < points[i + 1].x, 'Points should be strictly increasing in x value (ordered by their x value)');
            }
        });
        // We're going to remove collinear points, so we create an extra copy
        this.points = points.slice();
        // NOTE: The removal of collinear points helps improve performance, since we sometimes need to "expand" the number
        // of points. Repeated minimums/maximums for many inputs could otherwise become quite slow.
        for(let i = 0; i < this.points.length - 2; i++){
            const a = this.points[i];
            const b = this.points[i + 1];
            const c = this.points[i + 2];
            if (Utils.arePointsCollinear(a, b, c)) {
                this.points.splice(i + 1, 1);
                i--;
            }
        }
    }
};
dot.register('CompletePiecewiseLinearFunction', CompletePiecewiseLinearFunction);
export default CompletePiecewiseLinearFunction;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Db21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlc2NyaWJlcyBhIDFkIGNvbXBsZXRlIChmdWxseSBkZWZpbmVkIGZvciBhbnkgbnVtYmVyKSBmdW5jdGlvbiwgd2hlcmUgdmFsdWVzIGFyZSBleHRyYXBvbGF0ZWQgZ2l2ZW4gdGhlIGZpbmFsIGVuZFxuICogcG9pbnRzLlxuICpcbiAqIEUuZy4gaWYgdGhlIHBvaW50cyAoMCwwKSBhbmQgKDEsMSkgYXJlIHByb3ZpZGVkLCBpdCByZXByZXNlbnRzIHRoZSBmdW5jdGlvbiBmKHgpID0geCBmb3IgQUxMIHZhbHVlcywgZXNwZWNpYWxseVxuICogdmFsdWVzIG91dHNpZGUgb2YgdGhlIHJhbmdlIFswLDFdLiBGb3IgZXhhbXBsZSwgZig2KSA9IDYuXG4gKlxuICogSWYgYSBzaW5nbGUgcG9pbnQgaXMgcHJvdmlkZWQsIGl0IHJlcHJlc2VudHMgYSBjb25zdGFudCBmdW5jdGlvbi5cbiAqXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcblxuY2xhc3MgQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiB7XG5cbiAgcHVibGljIHBvaW50czogVmVjdG9yMltdO1xuXG4gIC8vIEFzc3VtZWQgdG8gYmUgc29ydGVkIGJ5IHggdmFsdWUsIGFuZCBjb250aW51b3VzXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9pbnRzOiBWZWN0b3IyW10gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnRzLmxlbmd0aCA+IDAgKTtcbiAgICBhc3NlcnQgJiYgcG9pbnRzLmZvckVhY2goICggcG9pbnQsIGkgKSA9PiB7XG4gICAgICBpZiAoIGkgPCBwb2ludHMubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQueCA8IHBvaW50c1sgaSArIDEgXS54LFxuICAgICAgICAgICdQb2ludHMgc2hvdWxkIGJlIHN0cmljdGx5IGluY3JlYXNpbmcgaW4geCB2YWx1ZSAob3JkZXJlZCBieSB0aGVpciB4IHZhbHVlKScgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBXZSdyZSBnb2luZyB0byByZW1vdmUgY29sbGluZWFyIHBvaW50cywgc28gd2UgY3JlYXRlIGFuIGV4dHJhIGNvcHlcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cy5zbGljZSgpO1xuXG4gICAgLy8gTk9URTogVGhlIHJlbW92YWwgb2YgY29sbGluZWFyIHBvaW50cyBoZWxwcyBpbXByb3ZlIHBlcmZvcm1hbmNlLCBzaW5jZSB3ZSBzb21ldGltZXMgbmVlZCB0byBcImV4cGFuZFwiIHRoZSBudW1iZXJcbiAgICAvLyBvZiBwb2ludHMuIFJlcGVhdGVkIG1pbmltdW1zL21heGltdW1zIGZvciBtYW55IGlucHV0cyBjb3VsZCBvdGhlcndpc2UgYmVjb21lIHF1aXRlIHNsb3cuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wb2ludHMubGVuZ3RoIC0gMjsgaSsrICkge1xuICAgICAgY29uc3QgYSA9IHRoaXMucG9pbnRzWyBpIF07XG4gICAgICBjb25zdCBiID0gdGhpcy5wb2ludHNbIGkgKyAxIF07XG4gICAgICBjb25zdCBjID0gdGhpcy5wb2ludHNbIGkgKyAyIF07XG5cbiAgICAgIGlmICggVXRpbHMuYXJlUG9pbnRzQ29sbGluZWFyKCBhLCBiLCBjICkgKSB7XG4gICAgICAgIHRoaXMucG9pbnRzLnNwbGljZSggaSArIDEsIDEgKTtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwYWlyIG9mIHBvaW50cyB0aGF0IHRoZSB4IHZhbHVlIGlzIGRlZmluZWQgYnkuXG4gICAqXG4gICAqIE5PVEU6IHggbWF5IE5PVCBiZSBjb250YWluZWQgaW4gdGhlc2UgcG9pbnRzLCBpZiBpdCdzIGVpdGhlciBsZXNzIHRoYW4gb3IgZ3JlYXRlciB0aGFuIGFueSBwb2ludHMgaW4gdGhlIHBvaW50c1xuICAgKiBsaXN0LlxuICAgKi9cbiAgcHVibGljIGZpbmRNYXRjaGluZ1BhaXIoIHg6IG51bWJlciApOiBbIFZlY3RvcjIsIFZlY3RvcjIgXSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb2ludHMubGVuZ3RoID4gMSApO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIHdoaWxlICggaSA8IHRoaXMucG9pbnRzLmxlbmd0aCAtIDIgJiYgdGhpcy5wb2ludHNbIGkgKyAxIF0ueCA8IHggKSB7XG4gICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiBbIHRoaXMucG9pbnRzWyBpIF0sIHRoaXMucG9pbnRzWyBpICsgMSBdIF07XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGVzIHRoZSBmdW5jdGlvbiBhdCB0aGUgZ2l2ZW4geCB2YWx1ZSwgZS5nLiByZXR1cm5zIGYoeCkuXG4gICAqL1xuICBwdWJsaWMgZXZhbHVhdGUoIHg6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5wb2ludHMubGVuZ3RoID09PSAxICkge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnRzWyAwIF0ueTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBbIGxlZnRQb2ludCwgcmlnaHRQb2ludCBdID0gdGhpcy5maW5kTWF0Y2hpbmdQYWlyKCB4ICk7XG5cbiAgICAgIGlmICggbGVmdFBvaW50LnggPT09IHggKSB7XG4gICAgICAgIHJldHVybiBsZWZ0UG9pbnQueTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCByaWdodFBvaW50LnggPT09IHggKSB7XG4gICAgICAgIHJldHVybiByaWdodFBvaW50Lnk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmxpbmVhciggbGVmdFBvaW50LngsIHJpZ2h0UG9pbnQueCwgbGVmdFBvaW50LnksIHJpZ2h0UG9pbnQueSwgeCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29tYmluZXMgc29ydGVkIHVuaXF1ZSB4LXZhbHVlcyBwcm92aWRlZCBieSB0aGlzIGZ1bmN0aW9uIGFuZC9vciB0aGUgb3RoZXIgZnVuY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIGdldENvbWJpbmVkWFZhbHVlcyggbGluZWFyRnVuY3Rpb246IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gKTogbnVtYmVyW10ge1xuICAgIHJldHVybiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLnNvcnRlZFVuaXF1ZUVwc2lsb24oXG4gICAgICB0aGlzLnBvaW50cy5tYXAoIHBvaW50ID0+IHBvaW50LnggKS5jb25jYXQoIGxpbmVhckZ1bmN0aW9uLnBvaW50cy5tYXAoIHBvaW50ID0+IHBvaW50LnggKSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29tYmluZXMgdGhlIHNvcnRlZCB1bmlxdWUgeC12YWx1ZXMgaW5jbHVkZWQgaW4gdGhpcyBmdW5jdGlvbiBhbmQvb3IgdGhlIG90aGVyIGZ1bmN0aW9uLCBPUiB0aGUgdW5pcXVlIHgtdmFsdWVzXG4gICAqIHRoYXQgcmVzdWx0IGZyb20gdGhlIGludGVyc2VjdGlvbiBvZiB0aGUgdHdvIGZ1bmN0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgZ2V0SW50ZXJzZWN0ZWRYVmFsdWVzKCBsaW5lYXJGdW5jdGlvbjogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiApOiBudW1iZXJbXSB7XG4gICAgY29uc3QgeFZhbHVlcyA9IHRoaXMuZ2V0Q29tYmluZWRYVmFsdWVzKCBsaW5lYXJGdW5jdGlvbiApO1xuICAgIGNvbnN0IG5ld1hWYWx1ZXM6IG51bWJlcltdID0gW107XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB4VmFsdWVzLmxlbmd0aCAtIDE7IGkrKyApIHtcbiAgICAgIGNvbnN0IGxlZnRYID0geFZhbHVlc1sgaSBdO1xuICAgICAgY29uc3QgcmlnaHRYID0geFZhbHVlc1sgaSArIDEgXTtcbiAgICAgIGNvbnN0IGludGVyc2VjdGlvblBvaW50ID0gVXRpbHMubGluZUxpbmVJbnRlcnNlY3Rpb24oXG4gICAgICAgIC8vIFRoZSBsaW5lYXIgZnVuY3Rpb24gZGVmaW5lZCBpbiB0aGlzXG4gICAgICAgIG5ldyBWZWN0b3IyKCBsZWZ0WCwgdGhpcy5ldmFsdWF0ZSggbGVmdFggKSApLFxuICAgICAgICBuZXcgVmVjdG9yMiggcmlnaHRYLCB0aGlzLmV2YWx1YXRlKCByaWdodFggKSApLFxuXG4gICAgICAgIC8vIFRoZSBwYXNzZWQgaW4gYXJndW1lbnQgbGluZWFyIGZ1bmN0aW9uXG4gICAgICAgIG5ldyBWZWN0b3IyKCBsZWZ0WCwgbGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIGxlZnRYICkgKSxcbiAgICAgICAgbmV3IFZlY3RvcjIoIHJpZ2h0WCwgbGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIHJpZ2h0WCApIClcbiAgICAgICk7XG4gICAgICBpZiAoIGludGVyc2VjdGlvblBvaW50ICYmXG4gICAgICAgICAgIC8vIElmIGl0J3Mgb3VyIGZpcnN0IHBhaXIgb2YgcG9pbnRzLCBkb24ndCBmaWx0ZXIgb3V0IHBvaW50cyB0aGF0IGFyZSBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBsZWZ0IHBvaW50XG4gICAgICAgICAgICggaSA9PT0gMCB8fCBpbnRlcnNlY3Rpb25Qb2ludC54ID4gbGVmdFggKSAmJlxuICAgICAgICAgICAvLyBJZiBpdCdzIG91ciBsYXN0IHBhaXIgb2YgcG9pbnRzLCBkb24ndCBmaWx0ZXIgb3V0IHBvaW50cyB0aGF0IGFyZSBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgcmlnaHQgcG9pbnRcbiAgICAgICAgICAgKCBpID09PSB4VmFsdWVzLmxlbmd0aCAtIDIgfHwgaW50ZXJzZWN0aW9uUG9pbnQueCA8IHJpZ2h0WCApXG4gICAgICApIHtcbiAgICAgICAgbmV3WFZhbHVlcy5wdXNoKCBpbnRlcnNlY3Rpb25Qb2ludC54ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGR1cGxpY2F0ZSB2YWx1ZXMgYWJvdmUgYW5kIHNvcnQgdGhlbVxuICAgIGNvbnN0IGNyaXRpY2FsWFZhbHVlcyA9IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24uc29ydGVkVW5pcXVlRXBzaWxvbiggW1xuICAgICAgLi4ueFZhbHVlcyxcbiAgICAgIC4uLm5ld1hWYWx1ZXNcbiAgICBdICk7XG5cbiAgICAvLyBUbyBjYXB0dXJlIHRoZSBzbG9wZSBhdCB0aGUgc3RhcnQvZW5kLCB3ZSdsbCBhZGQgZXh0cmEgcG9pbnRzIHRvIGd1YXJhbnRlZSB0aGlzLiBJZiB0aGV5J3JlIGR1cGxpY2F0ZWQsIHRoZXknbGxcbiAgICAvLyBiZSByZW1vdmVkIGR1cmluZyB0aGUgY29sbGluZWFyIGNoZWNrIG9uIGNvbnN0cnVjdGlvbi5cbiAgICByZXR1cm4gW1xuICAgICAgY3JpdGljYWxYVmFsdWVzWyAwIF0gLSAxLFxuICAgICAgLi4uY3JpdGljYWxYVmFsdWVzLFxuICAgICAgY3JpdGljYWxYVmFsdWVzWyBjcml0aWNhbFhWYWx1ZXMubGVuZ3RoIC0gMSBdICsgMVxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0J3MgdGhlIHJlc3VsdCBvZiBhcHBseWluZyB0aGUgYmluYXJ5IG9wZXJhdGlvbiBhdCB0aGUgZ2l2ZW4geCB2YWx1ZXMuXG4gICAqL1xuICBwcml2YXRlIGJpbmFyeVhPcGVyYXRpb24oIGxpbmVhckZ1bmN0aW9uOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uLCBvcGVyYXRpb246ICggYTogbnVtYmVyLCBiOiBudW1iZXIgKSA9PiBudW1iZXIsIHhWYWx1ZXM6IG51bWJlcltdICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiBuZXcgQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiggeFZhbHVlcy5tYXAoIHggPT4ge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCBvcGVyYXRpb24oIHRoaXMuZXZhbHVhdGUoIHggKSwgbGluZWFyRnVuY3Rpb24uZXZhbHVhdGUoIHggKSApICk7XG4gICAgfSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBmdW5jdGlvbiB0aGF0J3MgdGhlIHJlc3VsdCBvZiBhcHBseWluZyB0aGUgYmluYXJ5IG9wZXJhdGlvbiBhdCB0aGUgeCB2YWx1ZXMgdGhhdCBhbHJlYWR5IG9jY3VyXG4gICAqIGluIGVhY2ggZnVuY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIGJpbmFyeVBvaW50d2lzZU9wZXJhdGlvbiggbGluZWFyRnVuY3Rpb246IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24sIG9wZXJhdGlvbjogKCBhOiBudW1iZXIsIGI6IG51bWJlciApID0+IG51bWJlciApOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5iaW5hcnlYT3BlcmF0aW9uKCBsaW5lYXJGdW5jdGlvbiwgb3BlcmF0aW9uLCB0aGlzLmdldENvbWJpbmVkWFZhbHVlcyggbGluZWFyRnVuY3Rpb24gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCdzIHRoZSByZXN1bHQgb2YgYXBwbHlpbmcgdGhlIGJpbmFyeSBvcGVyYXRpb24gYXQgdGhlIHggdmFsdWVzIHRoYXQgZWl0aGVyIG9jY3VyIGluXG4gICAqIGVhY2ggZnVuY3Rpb24gT1IgYXQgdGhlIGludGVyc2VjdGlvbiBvZiB0aGUgdHdvIGZ1bmN0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgYmluYXJ5SW50ZXJzZWN0aW5nT3BlcmF0aW9uKCBsaW5lYXJGdW5jdGlvbjogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiwgb3BlcmF0aW9uOiAoIGE6IG51bWJlciwgYjogbnVtYmVyICkgPT4gbnVtYmVyICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmJpbmFyeVhPcGVyYXRpb24oIGxpbmVhckZ1bmN0aW9uLCBvcGVyYXRpb24sIHRoaXMuZ2V0SW50ZXJzZWN0ZWRYVmFsdWVzKCBsaW5lYXJGdW5jdGlvbiApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gdGhhdCdzIHRoZSByZXN1bHQgb2YgYWRkaW5nIHRoZSB0d28gZnVuY3Rpb25zLlxuICAgKi9cbiAgcHVibGljIHBsdXMoIGxpbmVhckZ1bmN0aW9uOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmJpbmFyeVBvaW50d2lzZU9wZXJhdGlvbiggbGluZWFyRnVuY3Rpb24sICggYSwgYiApID0+IGEgKyBiICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gdGhhdCdzIHRoZSByZXN1bHQgb2Ygc3VidHJhY3RpbmcgdGhlIHR3byBmdW5jdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgbWludXMoIGxpbmVhckZ1bmN0aW9uOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmJpbmFyeVBvaW50d2lzZU9wZXJhdGlvbiggbGluZWFyRnVuY3Rpb24sICggYSwgYiApID0+IGEgLSBiICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gdGhhdCdzIHRoZSByZXN1bHQgb2YgdGFraW5nIHRoZSBtaW5pbXVtIG9mIHRoZSB0d28gZnVuY3Rpb25zXG4gICAqL1xuICBwdWJsaWMgbWluKCBsaW5lYXJGdW5jdGlvbjogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiApOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5iaW5hcnlJbnRlcnNlY3RpbmdPcGVyYXRpb24oIGxpbmVhckZ1bmN0aW9uLCBNYXRoLm1pbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHRoYXQncyB0aGUgcmVzdWx0IG9mIHRha2luZyB0aGUgbWF4aW11bSBvZiB0aGUgdHdvIGZ1bmN0aW9uc1xuICAgKi9cbiAgcHVibGljIG1heCggbGluZWFyRnVuY3Rpb246IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24gKTogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuYmluYXJ5SW50ZXJzZWN0aW5nT3BlcmF0aW9uKCBsaW5lYXJGdW5jdGlvbiwgTWF0aC5tYXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgcmVkZWZpbmluZyBvciBjbGFtcGluZy90cnVuY2F0aW5nIHRoZSBmdW5jdGlvbiBieSBvbmx5IHJlcHJlc2VudGluZyBpdCBmcm9tIHRoZSBnaXZlbiB4IHZhbHVlc1xuICAgKi9cbiAgcHVibGljIHdpdGhYVmFsdWVzKCB4VmFsdWVzOiBudW1iZXJbXSApOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gbmV3IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24oIHhWYWx1ZXMubWFwKCB4ID0+IG5ldyBWZWN0b3IyKCB4LCB0aGlzLmV2YWx1YXRlKCB4ICkgKSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbnZlcnRlZCBmb3JtIG9mIHRoZSBmdW5jdGlvbiAoYXNzdW1pbmcgaXQgaXMgbW9ub3RvbmljYWxseSBpbmNyZWFzaW5nIG9yIG1vbm90b25pY2FsbHkgZGVjcmVhc2luZylcbiAgICovXG4gIHB1YmxpYyBpbnZlcnRlZCgpOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICBjb25zdCBwb2ludHMgPSB0aGlzLnBvaW50cy5tYXAoIHBvaW50ID0+IG5ldyBWZWN0b3IyKCBwb2ludC55LCBwb2ludC54ICkgKTtcblxuICAgIC8vIE5PVEU6IFdlJ2xsIHJlbHkgb24gdGhlIGNvbnN0cnVjdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBpbnZlcnNlIGlzIHZhbGlkLiBIZXJlIHdlJ2xsIGhhbmRsZSB0aGUgbW9ub3RvbmljYWxseVxuICAgIC8vIGRlY3JlYXNpbmcgY2FzZSAod2hpY2ggaXMgaW52ZXJ0aWJsZSwganVzdCBuZWVkcyBhIHJldmVyc2FsIG9mIHBvaW50cylcbiAgICBpZiAoIHBvaW50cy5sZW5ndGggPiAxICYmIHBvaW50c1sgMCBdLnggPiBwb2ludHNbIDEgXS54ICkge1xuICAgICAgcG9pbnRzLnJldmVyc2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24oIHBvaW50cyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBzdW0oIC4uLmZ1bmN0aW9uczogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbltdICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiBmdW5jdGlvbnMucmVkdWNlKCAoIGEsIGIgKSA9PiBhLnBsdXMoIGIgKSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtaW4oIC4uLmZ1bmN0aW9uczogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbltdICk6IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24ge1xuICAgIHJldHVybiBmdW5jdGlvbnMucmVkdWNlKCAoIGEsIGIgKSA9PiBhLm1pbiggYiApICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1heCggLi4uZnVuY3Rpb25zOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uW10gKTogQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiB7XG4gICAgcmV0dXJuIGZ1bmN0aW9ucy5yZWR1Y2UoICggYSwgYiApID0+IGEubWF4KCBiICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY29uc3RhbnQoIHk6IG51bWJlciApOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gbmV3IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24oIFsgbmV3IFZlY3RvcjIoIDAsIHkgKSBdICk7XG4gIH1cblxuICAvLyBSZXByZXNlbnRzIHRoZSBmdW5jdGlvbiBheCtiXG4gIHB1YmxpYyBzdGF0aWMgbGluZWFyKCBhOiBudW1iZXIsIGI6IG51bWJlciApOiBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIHtcbiAgICByZXR1cm4gbmV3IENvbXBsZXRlUGllY2V3aXNlTGluZWFyRnVuY3Rpb24oIFsgbmV3IFZlY3RvcjIoIDAsIGIgKSwgbmV3IFZlY3RvcjIoIDEsIGEgKyBiICkgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzb3J0ZWQgbGlzdCBvZiB0aGUgaW5wdXQgbnVtYmVycywgZW5zdXJpbmcgbm8gZHVwbGljYXRlcyB3aXRoaW4gYSBzcGVjaWZpZWQgZXBzaWxvbiB2YWx1ZVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgc29ydGVkVW5pcXVlRXBzaWxvbiggbnVtYmVyczogbnVtYmVyW10sIGVwc2lsb24gPSAxZS0xMCApOiBudW1iZXJbXSB7XG4gICAgbnVtYmVycyA9IF8uc29ydEJ5KCBudW1iZXJzICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJzLmxlbmd0aCAtIDE7IGkrKyApIHtcbiAgICAgIGlmICggTWF0aC5hYnMoIG51bWJlcnNbIGkgXSAtIG51bWJlcnNbIGkgKyAxIF0gKSA8IGVwc2lsb24gKSB7XG4gICAgICAgIG51bWJlcnMuc3BsaWNlKCBpLCAxICk7XG4gICAgICAgIGktLTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVtYmVycztcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uJywgQ29tcGxldGVQaWVjZXdpc2VMaW5lYXJGdW5jdGlvbiApO1xuXG5leHBvcnQgZGVmYXVsdCBDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uOyJdLCJuYW1lcyI6WyJkb3QiLCJVdGlscyIsIlZlY3RvcjIiLCJDb21wbGV0ZVBpZWNld2lzZUxpbmVhckZ1bmN0aW9uIiwiZmluZE1hdGNoaW5nUGFpciIsIngiLCJhc3NlcnQiLCJwb2ludHMiLCJsZW5ndGgiLCJpIiwiZXZhbHVhdGUiLCJ5IiwibGVmdFBvaW50IiwicmlnaHRQb2ludCIsImxpbmVhciIsImdldENvbWJpbmVkWFZhbHVlcyIsImxpbmVhckZ1bmN0aW9uIiwic29ydGVkVW5pcXVlRXBzaWxvbiIsIm1hcCIsInBvaW50IiwiY29uY2F0IiwiZ2V0SW50ZXJzZWN0ZWRYVmFsdWVzIiwieFZhbHVlcyIsIm5ld1hWYWx1ZXMiLCJsZWZ0WCIsInJpZ2h0WCIsImludGVyc2VjdGlvblBvaW50IiwibGluZUxpbmVJbnRlcnNlY3Rpb24iLCJwdXNoIiwiY3JpdGljYWxYVmFsdWVzIiwiYmluYXJ5WE9wZXJhdGlvbiIsIm9wZXJhdGlvbiIsImJpbmFyeVBvaW50d2lzZU9wZXJhdGlvbiIsImJpbmFyeUludGVyc2VjdGluZ09wZXJhdGlvbiIsInBsdXMiLCJhIiwiYiIsIm1pbnVzIiwibWluIiwiTWF0aCIsIm1heCIsIndpdGhYVmFsdWVzIiwiaW52ZXJ0ZWQiLCJyZXZlcnNlIiwic3VtIiwiZnVuY3Rpb25zIiwicmVkdWNlIiwiY29uc3RhbnQiLCJudW1iZXJzIiwiZXBzaWxvbiIsIl8iLCJzb3J0QnkiLCJhYnMiLCJzcGxpY2UiLCJmb3JFYWNoIiwic2xpY2UiLCJjIiwiYXJlUG9pbnRzQ29sbGluZWFyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DLElBQUEsQUFBTUMsa0NBQU4sTUFBTUE7SUErQko7Ozs7O0dBS0MsR0FDRCxBQUFPQyxpQkFBa0JDLENBQVMsRUFBeUI7UUFDekRDLFVBQVVBLE9BQVEsSUFBSSxDQUFDQyxNQUFNLENBQUNDLE1BQU0sR0FBRztRQUV2QyxJQUFJQyxJQUFJO1FBQ1IsTUFBUUEsSUFBSSxJQUFJLENBQUNGLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLEtBQUssSUFBSSxDQUFDRCxNQUFNLENBQUVFLElBQUksRUFBRyxDQUFDSixDQUFDLEdBQUdBLEVBQUk7WUFDakVJO1FBQ0Y7UUFDQSxPQUFPO1lBQUUsSUFBSSxDQUFDRixNQUFNLENBQUVFLEVBQUc7WUFBRSxJQUFJLENBQUNGLE1BQU0sQ0FBRUUsSUFBSSxFQUFHO1NBQUU7SUFDbkQ7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFNBQVVMLENBQVMsRUFBVztRQUNuQyxJQUFLLElBQUksQ0FBQ0UsTUFBTSxDQUFDQyxNQUFNLEtBQUssR0FBSTtZQUM5QixPQUFPLElBQUksQ0FBQ0QsTUFBTSxDQUFFLEVBQUcsQ0FBQ0ksQ0FBQztRQUMzQixPQUNLO1lBQ0gsTUFBTSxDQUFFQyxXQUFXQyxXQUFZLEdBQUcsSUFBSSxDQUFDVCxnQkFBZ0IsQ0FBRUM7WUFFekQsSUFBS08sVUFBVVAsQ0FBQyxLQUFLQSxHQUFJO2dCQUN2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