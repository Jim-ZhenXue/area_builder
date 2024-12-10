// Copyright 2016-2024, University of Colorado Boulder
/**
 * A numeric range with a required default value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import dot from './dot.js';
import Range from './Range.js';
let RangeWithValue = class RangeWithValue extends Range {
    /**
   * Getter for defaultValue
   */ getDefaultValue() {
        return this._defaultValue;
    }
    get defaultValue() {
        return this.getDefaultValue();
    }
    /**
   * Setter for min
   */ setMin(min) {
        assert && assert(this._defaultValue >= min, `min must be <= defaultValue: ${min}`);
        super.setMin(min);
    }
    /**
   * Setter for max
   */ setMax(max) {
        assert && assert(this._defaultValue <= max, `max must be >= defaultValue: ${max}`);
        super.setMax(max);
    }
    /**
   * Setter for min and max
   */ setMinMax(min, max) {
        assert && assert(this._defaultValue >= min, `min must be <= defaultValue: ${min}`);
        assert && assert(this._defaultValue <= max, `max must be >= defaultValue: ${max}`);
        // REVIEW: Same as setMinMax in Range.ts, returning a value in a setter seems odd...
        return super.setMinMax(min, max);
    }
    /**
   * Converts the attributes of this range to a string
   */ toString() {
        return `[RangeWithValue (min:${this.min} max:${this.max} defaultValue:${this._defaultValue})]`;
    }
    /**
   * Determines if this RangeWithValue is equal to some object.
   */ equals(object) {
        return this.constructor === object.constructor && this._defaultValue === object.defaultValue && super.equals(object);
    }
    /**
   * @param min - the minimum value of the range
   * @param max - the maximum value of the range
   * @param defaultValue - default value inside the range
   */ constructor(min, max, defaultValue){
        super(min, max);
        assert && assert(defaultValue !== undefined, 'default value is required');
        assert && assert(defaultValue >= min && defaultValue <= max, `defaultValue is out of range: ${defaultValue}`);
        this._defaultValue = defaultValue;
    }
};
dot.register('RangeWithValue', RangeWithValue);
export default RangeWithValue;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIG51bWVyaWMgcmFuZ2Ugd2l0aCBhIHJlcXVpcmVkIGRlZmF1bHQgdmFsdWUuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4vUmFuZ2UuanMnO1xuXG5jbGFzcyBSYW5nZVdpdGhWYWx1ZSBleHRlbmRzIFJhbmdlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9kZWZhdWx0VmFsdWU6IG51bWJlcjtcblxuICAvKipcbiAgICogQHBhcmFtIG1pbiAtIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSByYW5nZVxuICAgKiBAcGFyYW0gbWF4IC0gdGhlIG1heGltdW0gdmFsdWUgb2YgdGhlIHJhbmdlXG4gICAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgLSBkZWZhdWx0IHZhbHVlIGluc2lkZSB0aGUgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBkZWZhdWx0VmFsdWU6IG51bWJlciApIHtcblxuICAgIHN1cGVyKCBtaW4sIG1heCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQsICdkZWZhdWx0IHZhbHVlIGlzIHJlcXVpcmVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlZmF1bHRWYWx1ZSA+PSBtaW4gJiYgZGVmYXVsdFZhbHVlIDw9IG1heCwgYGRlZmF1bHRWYWx1ZSBpcyBvdXQgb2YgcmFuZ2U6ICR7ZGVmYXVsdFZhbHVlfWAgKTtcblxuICAgIHRoaXMuX2RlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldHRlciBmb3IgZGVmYXVsdFZhbHVlXG4gICAqL1xuICBwdWJsaWMgZ2V0RGVmYXVsdFZhbHVlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRWYWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBnZXQgZGVmYXVsdFZhbHVlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RGVmYXVsdFZhbHVlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0dGVyIGZvciBtaW5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRNaW4oIG1pbjogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2RlZmF1bHRWYWx1ZSA+PSBtaW4sIGBtaW4gbXVzdCBiZSA8PSBkZWZhdWx0VmFsdWU6ICR7bWlufWAgKTtcbiAgICBzdXBlci5zZXRNaW4oIG1pbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgbWF4XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0TWF4KCBtYXg6IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9kZWZhdWx0VmFsdWUgPD0gbWF4LCBgbWF4IG11c3QgYmUgPj0gZGVmYXVsdFZhbHVlOiAke21heH1gICk7XG4gICAgc3VwZXIuc2V0TWF4KCBtYXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIgZm9yIG1pbiBhbmQgbWF4XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0TWluTWF4KCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fZGVmYXVsdFZhbHVlID49IG1pbiwgYG1pbiBtdXN0IGJlIDw9IGRlZmF1bHRWYWx1ZTogJHttaW59YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2RlZmF1bHRWYWx1ZSA8PSBtYXgsIGBtYXggbXVzdCBiZSA+PSBkZWZhdWx0VmFsdWU6ICR7bWF4fWAgKTtcblxuICAgIC8vIFJFVklFVzogU2FtZSBhcyBzZXRNaW5NYXggaW4gUmFuZ2UudHMsIHJldHVybmluZyBhIHZhbHVlIGluIGEgc2V0dGVyIHNlZW1zIG9kZC4uLlxuICAgIHJldHVybiBzdXBlci5zZXRNaW5NYXgoIG1pbiwgbWF4ICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhpcyByYW5nZSB0byBhIHN0cmluZ1xuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBbUmFuZ2VXaXRoVmFsdWUgKG1pbjoke3RoaXMubWlufSBtYXg6JHt0aGlzLm1heH0gZGVmYXVsdFZhbHVlOiR7dGhpcy5fZGVmYXVsdFZhbHVlfSldYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgUmFuZ2VXaXRoVmFsdWUgaXMgZXF1YWwgdG8gc29tZSBvYmplY3QuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZXF1YWxzKCBvYmplY3Q6IEludGVudGlvbmFsQW55ICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoIHRoaXMuY29uc3RydWN0b3IgPT09IG9iamVjdC5jb25zdHJ1Y3RvciApICYmXG4gICAgICAgICAgICggdGhpcy5fZGVmYXVsdFZhbHVlID09PSBvYmplY3QuZGVmYXVsdFZhbHVlICkgJiZcbiAgICAgICAgICAgc3VwZXIuZXF1YWxzKCBvYmplY3QgKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdSYW5nZVdpdGhWYWx1ZScsIFJhbmdlV2l0aFZhbHVlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJhbmdlV2l0aFZhbHVlOyJdLCJuYW1lcyI6WyJkb3QiLCJSYW5nZSIsIlJhbmdlV2l0aFZhbHVlIiwiZ2V0RGVmYXVsdFZhbHVlIiwiX2RlZmF1bHRWYWx1ZSIsImRlZmF1bHRWYWx1ZSIsInNldE1pbiIsIm1pbiIsImFzc2VydCIsInNldE1heCIsIm1heCIsInNldE1pbk1heCIsInRvU3RyaW5nIiwiZXF1YWxzIiwib2JqZWN0IiwiY29uc3RydWN0b3IiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBR0QsT0FBT0EsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QkQ7SUFvQjNCOztHQUVDLEdBQ0QsQUFBT0Usa0JBQTBCO1FBQy9CLE9BQU8sSUFBSSxDQUFDQyxhQUFhO0lBQzNCO0lBRUEsSUFBb0JDLGVBQXVCO1FBQ3pDLE9BQU8sSUFBSSxDQUFDRixlQUFlO0lBQzdCO0lBRUE7O0dBRUMsR0FDRCxBQUFnQkcsT0FBUUMsR0FBVyxFQUFTO1FBQzFDQyxVQUFVQSxPQUFRLElBQUksQ0FBQ0osYUFBYSxJQUFJRyxLQUFLLENBQUMsNkJBQTZCLEVBQUVBLEtBQUs7UUFDbEYsS0FBSyxDQUFDRCxPQUFRQztJQUNoQjtJQUVBOztHQUVDLEdBQ0QsQUFBZ0JFLE9BQVFDLEdBQVcsRUFBUztRQUMxQ0YsVUFBVUEsT0FBUSxJQUFJLENBQUNKLGFBQWEsSUFBSU0sS0FBSyxDQUFDLDZCQUE2QixFQUFFQSxLQUFLO1FBQ2xGLEtBQUssQ0FBQ0QsT0FBUUM7SUFDaEI7SUFFQTs7R0FFQyxHQUNELEFBQWdCQyxVQUFXSixHQUFXLEVBQUVHLEdBQVcsRUFBUztRQUMxREYsVUFBVUEsT0FBUSxJQUFJLENBQUNKLGFBQWEsSUFBSUcsS0FBSyxDQUFDLDZCQUE2QixFQUFFQSxLQUFLO1FBQ2xGQyxVQUFVQSxPQUFRLElBQUksQ0FBQ0osYUFBYSxJQUFJTSxLQUFLLENBQUMsNkJBQTZCLEVBQUVBLEtBQUs7UUFFbEYsb0ZBQW9GO1FBQ3BGLE9BQU8sS0FBSyxDQUFDQyxVQUFXSixLQUFLRztJQUMvQjtJQUVBOztHQUVDLEdBQ0QsQUFBZ0JFLFdBQW1CO1FBQ2pDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUNMLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDRyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQ04sYUFBYSxDQUFDLEVBQUUsQ0FBQztJQUNoRztJQUVBOztHQUVDLEdBQ0QsQUFBZ0JTLE9BQVFDLE1BQXNCLEVBQVk7UUFDeEQsT0FBTyxBQUFFLElBQUksQ0FBQ0MsV0FBVyxLQUFLRCxPQUFPQyxXQUFXLElBQ3ZDLElBQUksQ0FBQ1gsYUFBYSxLQUFLVSxPQUFPVCxZQUFZLElBQzVDLEtBQUssQ0FBQ1EsT0FBUUM7SUFDdkI7SUFwRUE7Ozs7R0FJQyxHQUNELFlBQW9CUCxHQUFXLEVBQUVHLEdBQVcsRUFBRUwsWUFBb0IsQ0FBRztRQUVuRSxLQUFLLENBQUVFLEtBQUtHO1FBRVpGLFVBQVVBLE9BQVFILGlCQUFpQlcsV0FBVztRQUM5Q1IsVUFBVUEsT0FBUUgsZ0JBQWdCRSxPQUFPRixnQkFBZ0JLLEtBQUssQ0FBQyw4QkFBOEIsRUFBRUwsY0FBYztRQUU3RyxJQUFJLENBQUNELGFBQWEsR0FBR0M7SUFDdkI7QUF3REY7QUFFQUwsSUFBSWlCLFFBQVEsQ0FBRSxrQkFBa0JmO0FBRWhDLGVBQWVBLGVBQWUifQ==