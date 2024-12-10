// Copyright 2021-2022, University of Colorado Boulder
/**
 * One dimensional (scalar) transforms, which are invertible. Unlike Transform3 and Transform4, Transform1
 * may be nonlinear.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import merge from '../../phet-core/js/merge.js';
import dot from './dot.js';
import Range from './Range.js';
// For assertions that the inverse is correct.
const TOLERANCE = 1E-6;
const approxEquals = (a, b)=>Math.abs(a - b) <= TOLERANCE;
let Transform1 = class Transform1 {
    /**
   * Evaluate the transform at the specified scalar.
   * @param {number} x
   * @returns {number}
   * @public
   */ evaluate(x) {
        assert && assert(this.domain.contains(x), 'Value out of domain');
        const result = this.evaluationFunction(x);
        assert && assert(approxEquals(this.inverseFunction(result), x));
        return result;
    }
    /**
   * Evaluate the inverse at the specified scalar.
   * @param {number} x
   * @returns {number}
   * @public
   */ inverse(x) {
        assert && assert(this.range.contains(x), 'Value out of range');
        const result = this.inverseFunction(x);
        assert && assert(approxEquals(this.evaluationFunction(result), x));
        return result;
    }
    /**
   * @param {function(number):number} evaluationFunction
   * @param {function(number):number} inverseFunction
   * @param {Object} [options]
   */ constructor(evaluationFunction, inverseFunction, options){
        options = merge({
            // Used for asserting the inverse is correct, and that inputs are valid
            domain: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY),
            range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        }, options);
        // @private
        this.evaluationFunction = evaluationFunction;
        this.inverseFunction = inverseFunction;
        this.domain = options.domain;
        this.range = options.range;
    }
};
dot.register('Transform1', Transform1);
export default Transform1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm0xLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE9uZSBkaW1lbnNpb25hbCAoc2NhbGFyKSB0cmFuc2Zvcm1zLCB3aGljaCBhcmUgaW52ZXJ0aWJsZS4gVW5saWtlIFRyYW5zZm9ybTMgYW5kIFRyYW5zZm9ybTQsIFRyYW5zZm9ybTFcbiAqIG1heSBiZSBub25saW5lYXIuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4vUmFuZ2UuanMnO1xuXG4vLyBGb3IgYXNzZXJ0aW9ucyB0aGF0IHRoZSBpbnZlcnNlIGlzIGNvcnJlY3QuXG5jb25zdCBUT0xFUkFOQ0UgPSAxRS02O1xuY29uc3QgYXBwcm94RXF1YWxzID0gKCBhLCBiICkgPT4gTWF0aC5hYnMoIGEgLSBiICkgPD0gVE9MRVJBTkNFO1xuXG5jbGFzcyBUcmFuc2Zvcm0xIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbihudW1iZXIpOm51bWJlcn0gZXZhbHVhdGlvbkZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKTpudW1iZXJ9IGludmVyc2VGdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZXZhbHVhdGlvbkZ1bmN0aW9uLCBpbnZlcnNlRnVuY3Rpb24sIG9wdGlvbnMgKSB7XG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcblxuICAgICAgLy8gVXNlZCBmb3IgYXNzZXJ0aW5nIHRoZSBpbnZlcnNlIGlzIGNvcnJlY3QsIGFuZCB0aGF0IGlucHV0cyBhcmUgdmFsaWRcbiAgICAgIGRvbWFpbjogbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlXG4gICAgdGhpcy5ldmFsdWF0aW9uRnVuY3Rpb24gPSBldmFsdWF0aW9uRnVuY3Rpb247XG4gICAgdGhpcy5pbnZlcnNlRnVuY3Rpb24gPSBpbnZlcnNlRnVuY3Rpb247XG4gICAgdGhpcy5kb21haW4gPSBvcHRpb25zLmRvbWFpbjtcbiAgICB0aGlzLnJhbmdlID0gb3B0aW9ucy5yYW5nZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZSB0aGUgdHJhbnNmb3JtIGF0IHRoZSBzcGVjaWZpZWQgc2NhbGFyLlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBldmFsdWF0ZSggeCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRvbWFpbi5jb250YWlucyggeCApLCAnVmFsdWUgb3V0IG9mIGRvbWFpbicgKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmV2YWx1YXRpb25GdW5jdGlvbiggeCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFwcHJveEVxdWFscyggdGhpcy5pbnZlcnNlRnVuY3Rpb24oIHJlc3VsdCApLCB4ICkgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlIHRoZSBpbnZlcnNlIGF0IHRoZSBzcGVjaWZpZWQgc2NhbGFyLlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBpbnZlcnNlKCB4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucmFuZ2UuY29udGFpbnMoIHggKSwgJ1ZhbHVlIG91dCBvZiByYW5nZScgKTtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmludmVyc2VGdW5jdGlvbiggeCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFwcHJveEVxdWFscyggdGhpcy5ldmFsdWF0aW9uRnVuY3Rpb24oIHJlc3VsdCApLCB4ICkgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1RyYW5zZm9ybTEnLCBUcmFuc2Zvcm0xICk7XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zZm9ybTE7Il0sIm5hbWVzIjpbIm1lcmdlIiwiZG90IiwiUmFuZ2UiLCJUT0xFUkFOQ0UiLCJhcHByb3hFcXVhbHMiLCJhIiwiYiIsIk1hdGgiLCJhYnMiLCJUcmFuc2Zvcm0xIiwiZXZhbHVhdGUiLCJ4IiwiYXNzZXJ0IiwiZG9tYWluIiwiY29udGFpbnMiLCJyZXN1bHQiLCJldmFsdWF0aW9uRnVuY3Rpb24iLCJpbnZlcnNlRnVuY3Rpb24iLCJpbnZlcnNlIiwicmFuZ2UiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJOdW1iZXIiLCJORUdBVElWRV9JTkZJTklUWSIsIlBPU0lUSVZFX0lORklOSVRZIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFFL0IsOENBQThDO0FBQzlDLE1BQU1DLFlBQVk7QUFDbEIsTUFBTUMsZUFBZSxDQUFFQyxHQUFHQyxJQUFPQyxLQUFLQyxHQUFHLENBQUVILElBQUlDLE1BQU9IO0FBRXRELElBQUEsQUFBTU0sYUFBTixNQUFNQTtJQXVCSjs7Ozs7R0FLQyxHQUNEQyxTQUFVQyxDQUFDLEVBQUc7UUFDWkMsVUFBVUEsT0FBUSxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUSxDQUFFSCxJQUFLO1FBQzdDLE1BQU1JLFNBQVMsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRUw7UUFDeENDLFVBQVVBLE9BQVFSLGFBQWMsSUFBSSxDQUFDYSxlQUFlLENBQUVGLFNBQVVKO1FBQ2hFLE9BQU9JO0lBQ1Q7SUFFQTs7Ozs7R0FLQyxHQUNERyxRQUFTUCxDQUFDLEVBQUc7UUFDWEMsVUFBVUEsT0FBUSxJQUFJLENBQUNPLEtBQUssQ0FBQ0wsUUFBUSxDQUFFSCxJQUFLO1FBQzVDLE1BQU1JLFNBQVMsSUFBSSxDQUFDRSxlQUFlLENBQUVOO1FBQ3JDQyxVQUFVQSxPQUFRUixhQUFjLElBQUksQ0FBQ1ksa0JBQWtCLENBQUVELFNBQVVKO1FBQ25FLE9BQU9JO0lBQ1Q7SUE3Q0E7Ozs7R0FJQyxHQUNESyxZQUFhSixrQkFBa0IsRUFBRUMsZUFBZSxFQUFFSSxPQUFPLENBQUc7UUFFMURBLFVBQVVyQixNQUFPO1lBRWYsdUVBQXVFO1lBQ3ZFYSxRQUFRLElBQUlYLE1BQU9vQixPQUFPQyxpQkFBaUIsRUFBRUQsT0FBT0UsaUJBQWlCO1lBQ3JFTCxPQUFPLElBQUlqQixNQUFPb0IsT0FBT0MsaUJBQWlCLEVBQUVELE9BQU9FLGlCQUFpQjtRQUN0RSxHQUFHSDtRQUVILFdBQVc7UUFDWCxJQUFJLENBQUNMLGtCQUFrQixHQUFHQTtRQUMxQixJQUFJLENBQUNDLGVBQWUsR0FBR0E7UUFDdkIsSUFBSSxDQUFDSixNQUFNLEdBQUdRLFFBQVFSLE1BQU07UUFDNUIsSUFBSSxDQUFDTSxLQUFLLEdBQUdFLFFBQVFGLEtBQUs7SUFDNUI7QUEyQkY7QUFFQWxCLElBQUl3QixRQUFRLENBQUUsY0FBY2hCO0FBRTVCLGVBQWVBLFdBQVcifQ==