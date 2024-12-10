// Copyright 2013-2024, University of Colorado Boulder
/**
 * A numeric range.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import InfiniteNumberIO from '../../tandem/js/types/InfiniteNumberIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import dot from './dot.js';
const STATE_SCHEMA = {
    min: InfiniteNumberIO,
    max: InfiniteNumberIO
};
let Range = class Range {
    /**
   * Getter for min
   */ getMin() {
        return this._min;
    }
    get min() {
        return this.getMin();
    }
    set min(min) {
        this.setMin(min);
    }
    /**
   * TODO: Allow chaining, https://github.com/phetsims/dot/issues/122
   * Setter for min
   */ setMin(min) {
        assert && assert(min <= this._max, `min must be <= max: ${min}`);
        this._min = min;
    }
    /**
   * Getter for max
   */ getMax() {
        return this._max;
    }
    get max() {
        return this.getMax();
    }
    set max(max) {
        this.setMax(max);
    }
    /**
   * Setter for max
   */ setMax(max) {
        assert && assert(this._min <= max, `max must be >= to min: ${max}`);
        this._max = max;
    }
    /**
   * Sets the minimum and maximum value of the range
   */ setMinMax(min, max) {
        assert && assert(min <= max, `max must be >= to min. min: ${min}, max: ${max}`);
        this._min = min;
        this._max = max;
        return this;
    }
    /**
   * Sets the minimum and maximum value of this range from the provided Range.
   */ set(range) {
        this.setMinMax(range.min, range.max);
        return this;
    }
    addValue(n) {
        this._min = Math.min(this._min, n);
        this._max = Math.max(this._max, n);
    }
    withValue(n) {
        return new Range(Math.min(this._min, n), Math.max(this._max, n));
    }
    /**
   * Makes a copy of this range
   */ copy() {
        return new Range(this._min, this._max);
    }
    /**
   * Gets the length of this range, that is the difference between the maximum and minimum value of this range
   */ getLength() {
        return this._max - this._min;
    }
    /**
   * Gets the center of this range, that is the average value of the maximum and minimum value of this range
   */ getCenter() {
        return (this._max + this._min) / 2;
    }
    /**
   * Determines if this range contains the value
   */ contains(value) {
        return value >= this._min && value <= this._max;
    }
    /**
   * Does this range contain the specified range?
   */ containsRange(range) {
        return this._min <= range.min && this._max >= range.max;
    }
    /**
   * Determine if this range overlaps (intersects) with another range
   */ intersects(range) {
        return this._max >= range.min && range.max >= this._min;
    }
    /**
   * Do the two ranges overlap with one another?  Note that this assumes that
   * This is a open interval.
   */ intersectsExclusive(range) {
        return this._max > range.min && range.max > this._min;
    }
    /**
   *
   * REVIEW: The naming is not helping me understand that this function is just the immutable version of includeRange().
   *
   * The smallest range that contains both this range and the input range, returned as a copy.
   *
   * The method below is the immutable form of the function includeRange(). The method will return a new range, and will not modify
   * this range.
   */ union(range) {
        return new Range(Math.min(this.min, range.min), Math.max(this.max, range.max));
    }
    /**
   * REVIEW: The naming is not helping me understand that this function is just the immutable version of constrainRange().
   *
   * The smallest range that is contained by both this range and the input range, returned as a copy.
   *
   * The method below the immutable form of the function constrainRange(). The method below will return a new range, and will not modify
   * this range.
   */ intersection(range) {
        return new Range(Math.max(this.min, range.min), Math.min(this.max, range.max));
    }
    /**
   * Modifies this range so that it contains both its original range and the input range.
   *
   * This is the mutable form of the function union(). This will mutate (change) this range, in addition to returning
   * this range itself.
   */ includeRange(range) {
        return this.setMinMax(Math.min(this.min, range.min), Math.max(this.max, range.max));
    }
    /**
   * Modifies this range so that it is the largest range contained both in its original range and in the input range.
   *
   * This is the mutable form of the function intersection(). This will mutate (change) this range, in addition to returning
   * this range itself.
   */ constrainRange(range) {
        return this.setMinMax(Math.max(this.min, range.min), Math.min(this.max, range.max));
    }
    /**
   * REVIEW: do we also need a mutable form of shifted?
   *
   * Returns a new range that is the same as this range, but shifted by the specified amount.
   */ shifted(n) {
        return new Range(this.min + n, this.max + n);
    }
    /**
   * Converts the attributes of this range to a string
   */ toString() {
        return `[Range (min:${this._min} max:${this._max})]`;
    }
    /**
   * Constrains a value to the range.
   */ constrainValue(value) {
        return Math.min(Math.max(value, this._min), this._max);
    }
    /**
   * Multiply the min and max by the provided value, immutable
   */ times(value) {
        return new Range(this._min * value, this._max * value);
    }
    /**
   * Multiply the min and max by the provided value, mutable
   */ multiply(value) {
        this.setMinMax(this._min * value, this._max * value);
        return this;
    }
    /**
   * Determines if this Range is equal to some object.
   */ equals(object) {
        return this.constructor === object.constructor && this._min === object.min && this._max === object.max;
    }
    /**
   * Determines if this Range is approximately equal to some object.
   */ equalsEpsilon(object, epsilon) {
        return this.constructor === object.constructor && Math.abs(this._min - object.min) <= epsilon && Math.abs(this._max - object.max) <= epsilon;
    }
    /**
   * Given a value, normalize it to this Range's length, returning a value between 0 and 1 for values contained in
   * the Range. If the value is not contained in Range, then the return value will not be between 0 and 1.
   */ getNormalizedValue(value) {
        assert && assert(this.getLength() !== 0, 'cannot get normalized value without a range length');
        return (value - this.min) / this.getLength();
    }
    /**
   * Compute the opposite of a normalized value. Given a normalized value (between 0 and 1). Worked with any number
   * though, (even outside of the range). It is the client's responsibility to clamp if that is important to the
   * usage.
   */ expandNormalizedValue(normalizedValue) {
        assert && assert(this.getLength() !== 0, 'cannot get expand normalized value without a range length');
        return normalizedValue * this.getLength() + this.min;
    }
    /**
   * In https://github.com/phetsims/dot/issues/57, defaultValue was moved to RangeWithValue.
   * This ES5 getter catches programming errors where defaultValue is still used with Range.
   */ get defaultValue() {
        throw new Error('defaultValue is undefined, did you mean to use RangeWithValue?');
    }
    toStateObject() {
        return {
            min: InfiniteNumberIO.toStateObject(this.min),
            max: InfiniteNumberIO.toStateObject(this.max)
        };
    }
    // Given a value and a delta to change that value, clamp the delta to make sure the value stays within range.
    clampDelta(value, delta) {
        assert && assert(this.contains(value));
        return value + delta < this.min ? this.min - value : value + delta > this.max ? this.max - value : delta;
    }
    static fromStateObject(stateObject) {
        return new Range(InfiniteNumberIO.fromStateObject(stateObject.min), InfiniteNumberIO.fromStateObject(stateObject.max));
    }
    /**
   * @param min - the minimum value of the range
   * @param max - the maximum value of the range
   */ constructor(min, max){
        this._min = min;
        this._max = max;
    }
};
Range.RangeIO = new IOType('RangeIO', {
    valueType: Range,
    documentation: 'A range with "min" and "max" members.',
    stateSchema: STATE_SCHEMA,
    toStateObject: (range)=>range.toStateObject(),
    fromStateObject: (stateObject)=>Range.fromStateObject(stateObject)
});
Range.EVERYTHING = new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
Range.NOTHING = new Range(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
dot.register('Range', Range);
export default Range;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIG51bWVyaWMgcmFuZ2UuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgSW5maW5pdGVOdW1iZXJJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSW5maW5pdGVOdW1iZXJJTy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IHsgU3RhdGVPYmplY3QgfSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvU3RhdGVTY2hlbWEuanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5cbmV4cG9ydCB0eXBlIFRSYW5nZSA9IHtcbiAgbWluOiBudW1iZXI7XG4gIG1heDogbnVtYmVyO1xufTtcblxuY29uc3QgU1RBVEVfU0NIRU1BID0ge1xuICBtaW46IEluZmluaXRlTnVtYmVySU8sXG4gIG1heDogSW5maW5pdGVOdW1iZXJJT1xufTtcbmV4cG9ydCB0eXBlIFJhbmdlU3RhdGVPYmplY3QgPSBTdGF0ZU9iamVjdDx0eXBlb2YgU1RBVEVfU0NIRU1BPjtcblxuY2xhc3MgUmFuZ2UgaW1wbGVtZW50cyBUUmFuZ2Uge1xuXG4gIC8vIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSByYW5nZVxuICBwcml2YXRlIF9taW46IG51bWJlcjtcblxuICAvLyB0aGUgbWF4aW11bSB2YWx1ZSBvZiB0aGUgcmFuZ2VcbiAgcHJpdmF0ZSBfbWF4OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtaW4gLSB0aGUgbWluaW11bSB2YWx1ZSBvZiB0aGUgcmFuZ2VcbiAgICogQHBhcmFtIG1heCAtIHRoZSBtYXhpbXVtIHZhbHVlIG9mIHRoZSByYW5nZVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5fbWluID0gbWluO1xuICAgIHRoaXMuX21heCA9IG1heDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXR0ZXIgZm9yIG1pblxuICAgKi9cbiAgcHVibGljIGdldE1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9taW47XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1pbigpO1xuICB9XG5cbiAgcHVibGljIHNldCBtaW4oIG1pbjogbnVtYmVyICkge1xuICAgIHRoaXMuc2V0TWluKCBtaW4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPOiBBbGxvdyBjaGFpbmluZywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvMTIyXG4gICAqIFNldHRlciBmb3IgbWluXG4gICAqL1xuICBwdWJsaWMgc2V0TWluKCBtaW46IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaW4gPD0gdGhpcy5fbWF4LCBgbWluIG11c3QgYmUgPD0gbWF4OiAke21pbn1gICk7XG4gICAgdGhpcy5fbWluID0gbWluO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHRlciBmb3IgbWF4XG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX21heDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWF4KCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IG1heCggbWF4OiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXRNYXgoIG1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlciBmb3IgbWF4XG4gICAqL1xuICBwdWJsaWMgc2V0TWF4KCBtYXg6IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9taW4gPD0gbWF4LCBgbWF4IG11c3QgYmUgPj0gdG8gbWluOiAke21heH1gICk7XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gdmFsdWUgb2YgdGhlIHJhbmdlXG4gICAqL1xuICBwdWJsaWMgc2V0TWluTWF4KCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluIDw9IG1heCwgYG1heCBtdXN0IGJlID49IHRvIG1pbi4gbWluOiAke21pbn0sIG1heDogJHttYXh9YCApO1xuICAgIHRoaXMuX21pbiA9IG1pbjtcbiAgICB0aGlzLl9tYXggPSBtYXg7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlIG9mIHRoaXMgcmFuZ2UgZnJvbSB0aGUgcHJvdmlkZWQgUmFuZ2UuXG4gICAqL1xuICBwdWJsaWMgc2V0KCByYW5nZTogUmFuZ2UgKTogdGhpcyB7XG4gICAgdGhpcy5zZXRNaW5NYXgoIHJhbmdlLm1pbiwgcmFuZ2UubWF4ICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdWJsaWMgYWRkVmFsdWUoIG46IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLl9taW4gPSBNYXRoLm1pbiggdGhpcy5fbWluLCBuICk7XG4gICAgdGhpcy5fbWF4ID0gTWF0aC5tYXgoIHRoaXMuX21heCwgbiApO1xuICB9XG5cbiAgcHVibGljIHdpdGhWYWx1ZSggbjogbnVtYmVyICk6IFJhbmdlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKCBNYXRoLm1pbiggdGhpcy5fbWluLCBuICksIE1hdGgubWF4KCB0aGlzLl9tYXgsIG4gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgY29weSBvZiB0aGlzIHJhbmdlXG4gICAqL1xuICBwdWJsaWMgY29weSgpOiBSYW5nZSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZSggdGhpcy5fbWluLCB0aGlzLl9tYXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsZW5ndGggb2YgdGhpcyByYW5nZSwgdGhhdCBpcyB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlIG9mIHRoaXMgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBnZXRMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4IC0gdGhpcy5fbWluO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNlbnRlciBvZiB0aGlzIHJhbmdlLCB0aGF0IGlzIHRoZSBhdmVyYWdlIHZhbHVlIG9mIHRoZSBtYXhpbXVtIGFuZCBtaW5pbXVtIHZhbHVlIG9mIHRoaXMgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBnZXRDZW50ZXIoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKCB0aGlzLl9tYXggKyB0aGlzLl9taW4gKSAvIDI7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGlzIHJhbmdlIGNvbnRhaW5zIHRoZSB2YWx1ZVxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zKCB2YWx1ZTogbnVtYmVyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoIHZhbHVlID49IHRoaXMuX21pbiApICYmICggdmFsdWUgPD0gdGhpcy5fbWF4ICk7XG4gIH1cblxuICAvKipcbiAgICogRG9lcyB0aGlzIHJhbmdlIGNvbnRhaW4gdGhlIHNwZWNpZmllZCByYW5nZT9cbiAgICovXG4gIHB1YmxpYyBjb250YWluc1JhbmdlKCByYW5nZTogUmFuZ2UgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICggdGhpcy5fbWluIDw9IHJhbmdlLm1pbiApICYmICggdGhpcy5fbWF4ID49IHJhbmdlLm1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiB0aGlzIHJhbmdlIG92ZXJsYXBzIChpbnRlcnNlY3RzKSB3aXRoIGFub3RoZXIgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBpbnRlcnNlY3RzKCByYW5nZTogUmFuZ2UgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICggdGhpcy5fbWF4ID49IHJhbmdlLm1pbiApICYmICggcmFuZ2UubWF4ID49IHRoaXMuX21pbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIERvIHRoZSB0d28gcmFuZ2VzIG92ZXJsYXAgd2l0aCBvbmUgYW5vdGhlcj8gIE5vdGUgdGhhdCB0aGlzIGFzc3VtZXMgdGhhdFxuICAgKiBUaGlzIGlzIGEgb3BlbiBpbnRlcnZhbC5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnNlY3RzRXhjbHVzaXZlKCByYW5nZTogUmFuZ2UgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICggdGhpcy5fbWF4ID4gcmFuZ2UubWluICkgJiYgKCByYW5nZS5tYXggPiB0aGlzLl9taW4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBSRVZJRVc6IFRoZSBuYW1pbmcgaXMgbm90IGhlbHBpbmcgbWUgdW5kZXJzdGFuZCB0aGF0IHRoaXMgZnVuY3Rpb24gaXMganVzdCB0aGUgaW1tdXRhYmxlIHZlcnNpb24gb2YgaW5jbHVkZVJhbmdlKCkuXG4gICAqXG4gICAqIFRoZSBzbWFsbGVzdCByYW5nZSB0aGF0IGNvbnRhaW5zIGJvdGggdGhpcyByYW5nZSBhbmQgdGhlIGlucHV0IHJhbmdlLCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqXG4gICAqIFRoZSBtZXRob2QgYmVsb3cgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBpbmNsdWRlUmFuZ2UoKS4gVGhlIG1ldGhvZCB3aWxsIHJldHVybiBhIG5ldyByYW5nZSwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHJhbmdlLlxuICAgKi9cbiAgcHVibGljIHVuaW9uKCByYW5nZTogUmFuZ2UgKTogUmFuZ2Uge1xuICAgIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW4sIHJhbmdlLm1pbiApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4LCByYW5nZS5tYXggKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUkVWSUVXOiBUaGUgbmFtaW5nIGlzIG5vdCBoZWxwaW5nIG1lIHVuZGVyc3RhbmQgdGhhdCB0aGlzIGZ1bmN0aW9uIGlzIGp1c3QgdGhlIGltbXV0YWJsZSB2ZXJzaW9uIG9mIGNvbnN0cmFpblJhbmdlKCkuXG4gICAqXG4gICAqIFRoZSBzbWFsbGVzdCByYW5nZSB0aGF0IGlzIGNvbnRhaW5lZCBieSBib3RoIHRoaXMgcmFuZ2UgYW5kIHRoZSBpbnB1dCByYW5nZSwgcmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKlxuICAgKiBUaGUgbWV0aG9kIGJlbG93IHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29uc3RyYWluUmFuZ2UoKS4gVGhlIG1ldGhvZCBiZWxvdyB3aWxsIHJldHVybiBhIG5ldyByYW5nZSwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHJhbmdlLlxuICAgKi9cbiAgcHVibGljIGludGVyc2VjdGlvbiggcmFuZ2U6IFJhbmdlICk6IFJhbmdlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWluLCByYW5nZS5taW4gKSxcbiAgICAgIE1hdGgubWluKCB0aGlzLm1heCwgcmFuZ2UubWF4IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoaXMgcmFuZ2Ugc28gdGhhdCBpdCBjb250YWlucyBib3RoIGl0cyBvcmlnaW5hbCByYW5nZSBhbmQgdGhlIGlucHV0IHJhbmdlLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHVuaW9uKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyByYW5nZSwgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgcmFuZ2UgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGluY2x1ZGVSYW5nZSggcmFuZ2U6IFJhbmdlICk6IFJhbmdlIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXG4gICAgICBNYXRoLm1pbiggdGhpcy5taW4sIHJhbmdlLm1pbiApLFxuICAgICAgTWF0aC5tYXgoIHRoaXMubWF4LCByYW5nZS5tYXggKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhpcyByYW5nZSBzbyB0aGF0IGl0IGlzIHRoZSBsYXJnZXN0IHJhbmdlIGNvbnRhaW5lZCBib3RoIGluIGl0cyBvcmlnaW5hbCByYW5nZSBhbmQgaW4gdGhlIGlucHV0IHJhbmdlLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGludGVyc2VjdGlvbigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgcmFuZ2UsIGluIGFkZGl0aW9uIHRvIHJldHVybmluZ1xuICAgKiB0aGlzIHJhbmdlIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJhaW5SYW5nZSggcmFuZ2U6IFJhbmdlICk6IFJhbmdlIHtcbiAgICByZXR1cm4gdGhpcy5zZXRNaW5NYXgoXG4gICAgICBNYXRoLm1heCggdGhpcy5taW4sIHJhbmdlLm1pbiApLFxuICAgICAgTWF0aC5taW4oIHRoaXMubWF4LCByYW5nZS5tYXggKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUkVWSUVXOiBkbyB3ZSBhbHNvIG5lZWQgYSBtdXRhYmxlIGZvcm0gb2Ygc2hpZnRlZD9cbiAgICpcbiAgICogUmV0dXJucyBhIG5ldyByYW5nZSB0aGF0IGlzIHRoZSBzYW1lIGFzIHRoaXMgcmFuZ2UsIGJ1dCBzaGlmdGVkIGJ5IHRoZSBzcGVjaWZpZWQgYW1vdW50LlxuICAgKi9cbiAgcHVibGljIHNoaWZ0ZWQoIG46IG51bWJlciApOiBSYW5nZSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZSggdGhpcy5taW4gKyBuLCB0aGlzLm1heCArIG4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgYXR0cmlidXRlcyBvZiB0aGlzIHJhbmdlIHRvIGEgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFtSYW5nZSAobWluOiR7dGhpcy5fbWlufSBtYXg6JHt0aGlzLl9tYXh9KV1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cmFpbnMgYSB2YWx1ZSB0byB0aGUgcmFuZ2UuXG4gICAqL1xuICBwdWJsaWMgY29uc3RyYWluVmFsdWUoIHZhbHVlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5taW4oIE1hdGgubWF4KCB2YWx1ZSwgdGhpcy5fbWluICksIHRoaXMuX21heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoZSBtaW4gYW5kIG1heCBieSB0aGUgcHJvdmlkZWQgdmFsdWUsIGltbXV0YWJsZVxuICAgKi9cbiAgcHVibGljIHRpbWVzKCB2YWx1ZTogbnVtYmVyICk6IFJhbmdlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKCB0aGlzLl9taW4gKiB2YWx1ZSwgdGhpcy5fbWF4ICogdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBseSB0aGUgbWluIGFuZCBtYXggYnkgdGhlIHByb3ZpZGVkIHZhbHVlLCBtdXRhYmxlXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHkoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5zZXRNaW5NYXgoIHRoaXMuX21pbiAqIHZhbHVlLCB0aGlzLl9tYXggKiB2YWx1ZSApO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyBSYW5nZSBpcyBlcXVhbCB0byBzb21lIG9iamVjdC5cbiAgICovXG4gIHB1YmxpYyBlcXVhbHMoIG9iamVjdDogSW50ZW50aW9uYWxBbnkgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICggdGhpcy5jb25zdHJ1Y3RvciA9PT0gb2JqZWN0LmNvbnN0cnVjdG9yICkgJiZcbiAgICAgICAgICAgKCB0aGlzLl9taW4gPT09IG9iamVjdC5taW4gKSAmJlxuICAgICAgICAgICAoIHRoaXMuX21heCA9PT0gb2JqZWN0Lm1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyBSYW5nZSBpcyBhcHByb3hpbWF0ZWx5IGVxdWFsIHRvIHNvbWUgb2JqZWN0LlxuICAgKi9cbiAgcHVibGljIGVxdWFsc0Vwc2lsb24oIG9iamVjdDogSW50ZW50aW9uYWxBbnksIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gKCB0aGlzLmNvbnN0cnVjdG9yID09PSBvYmplY3QuY29uc3RydWN0b3IgKSAmJlxuICAgICAgICAgICAoIE1hdGguYWJzKCB0aGlzLl9taW4gLSBvYmplY3QubWluICkgPD0gZXBzaWxvbiApICYmXG4gICAgICAgICAgICggTWF0aC5hYnMoIHRoaXMuX21heCAtIG9iamVjdC5tYXggKSA8PSBlcHNpbG9uICk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSB2YWx1ZSwgbm9ybWFsaXplIGl0IHRvIHRoaXMgUmFuZ2UncyBsZW5ndGgsIHJldHVybmluZyBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMSBmb3IgdmFsdWVzIGNvbnRhaW5lZCBpblxuICAgKiB0aGUgUmFuZ2UuIElmIHRoZSB2YWx1ZSBpcyBub3QgY29udGFpbmVkIGluIFJhbmdlLCB0aGVuIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBub3QgYmUgYmV0d2VlbiAwIGFuZCAxLlxuICAgKi9cbiAgcHVibGljIGdldE5vcm1hbGl6ZWRWYWx1ZSggdmFsdWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ2V0TGVuZ3RoKCkgIT09IDAsICdjYW5ub3QgZ2V0IG5vcm1hbGl6ZWQgdmFsdWUgd2l0aG91dCBhIHJhbmdlIGxlbmd0aCcgKTtcbiAgICByZXR1cm4gKCB2YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLmdldExlbmd0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgdGhlIG9wcG9zaXRlIG9mIGEgbm9ybWFsaXplZCB2YWx1ZS4gR2l2ZW4gYSBub3JtYWxpemVkIHZhbHVlIChiZXR3ZWVuIDAgYW5kIDEpLiBXb3JrZWQgd2l0aCBhbnkgbnVtYmVyXG4gICAqIHRob3VnaCwgKGV2ZW4gb3V0c2lkZSBvZiB0aGUgcmFuZ2UpLiBJdCBpcyB0aGUgY2xpZW50J3MgcmVzcG9uc2liaWxpdHkgdG8gY2xhbXAgaWYgdGhhdCBpcyBpbXBvcnRhbnQgdG8gdGhlXG4gICAqIHVzYWdlLlxuICAgKi9cbiAgcHVibGljIGV4cGFuZE5vcm1hbGl6ZWRWYWx1ZSggbm9ybWFsaXplZFZhbHVlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdldExlbmd0aCgpICE9PSAwLCAnY2Fubm90IGdldCBleHBhbmQgbm9ybWFsaXplZCB2YWx1ZSB3aXRob3V0IGEgcmFuZ2UgbGVuZ3RoJyApO1xuICAgIHJldHVybiBub3JtYWxpemVkVmFsdWUgKiB0aGlzLmdldExlbmd0aCgpICsgdGhpcy5taW47XG4gIH1cblxuICAvKipcbiAgICogSW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvNTcsIGRlZmF1bHRWYWx1ZSB3YXMgbW92ZWQgdG8gUmFuZ2VXaXRoVmFsdWUuXG4gICAqIFRoaXMgRVM1IGdldHRlciBjYXRjaGVzIHByb2dyYW1taW5nIGVycm9ycyB3aGVyZSBkZWZhdWx0VmFsdWUgaXMgc3RpbGwgdXNlZCB3aXRoIFJhbmdlLlxuICAgKi9cbiAgcHVibGljIGdldCBkZWZhdWx0VmFsdWUoKTogbnVtYmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdkZWZhdWx0VmFsdWUgaXMgdW5kZWZpbmVkLCBkaWQgeW91IG1lYW4gdG8gdXNlIFJhbmdlV2l0aFZhbHVlPycgKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0YXRlT2JqZWN0KCk6IFJhbmdlU3RhdGVPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBtaW46IEluZmluaXRlTnVtYmVySU8udG9TdGF0ZU9iamVjdCggdGhpcy5taW4gKSxcbiAgICAgIG1heDogSW5maW5pdGVOdW1iZXJJTy50b1N0YXRlT2JqZWN0KCB0aGlzLm1heCApXG4gICAgfTtcbiAgfVxuXG4gIC8vIEdpdmVuIGEgdmFsdWUgYW5kIGEgZGVsdGEgdG8gY2hhbmdlIHRoYXQgdmFsdWUsIGNsYW1wIHRoZSBkZWx0YSB0byBtYWtlIHN1cmUgdGhlIHZhbHVlIHN0YXlzIHdpdGhpbiByYW5nZS5cbiAgcHVibGljIGNsYW1wRGVsdGEoIHZhbHVlOiBudW1iZXIsIGRlbHRhOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnRhaW5zKCB2YWx1ZSApICk7XG4gICAgcmV0dXJuIHZhbHVlICsgZGVsdGEgPCB0aGlzLm1pbiA/IHRoaXMubWluIC0gdmFsdWUgOlxuICAgICAgICAgICB2YWx1ZSArIGRlbHRhID4gdGhpcy5tYXggPyB0aGlzLm1heCAtIHZhbHVlIDpcbiAgICAgICAgICAgZGVsdGE7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Q6IFJhbmdlU3RhdGVPYmplY3QgKTogUmFuZ2Uge1xuICAgIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWluICksXG4gICAgICBJbmZpbml0ZU51bWJlcklPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QubWF4IClcbiAgICApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBSYW5nZUlPID0gbmV3IElPVHlwZTxSYW5nZSwgUmFuZ2VTdGF0ZU9iamVjdD4oICdSYW5nZUlPJywge1xuICAgIHZhbHVlVHlwZTogUmFuZ2UsXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgcmFuZ2Ugd2l0aCBcIm1pblwiIGFuZCBcIm1heFwiIG1lbWJlcnMuJyxcbiAgICBzdGF0ZVNjaGVtYTogU1RBVEVfU0NIRU1BLFxuICAgIHRvU3RhdGVPYmplY3Q6ICggcmFuZ2U6IFJhbmdlICkgPT4gcmFuZ2UudG9TdGF0ZU9iamVjdCgpLFxuICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogUmFuZ2VTdGF0ZU9iamVjdCApID0+IFJhbmdlLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKVxuICB9ICk7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBFVkVSWVRISU5HID0gbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE5PVEhJTkcgPSBuZXcgUmFuZ2UoIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZICk7XG59XG5cbmRvdC5yZWdpc3RlciggJ1JhbmdlJywgUmFuZ2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgUmFuZ2U7Il0sIm5hbWVzIjpbIkluZmluaXRlTnVtYmVySU8iLCJJT1R5cGUiLCJkb3QiLCJTVEFURV9TQ0hFTUEiLCJtaW4iLCJtYXgiLCJSYW5nZSIsImdldE1pbiIsIl9taW4iLCJzZXRNaW4iLCJhc3NlcnQiLCJfbWF4IiwiZ2V0TWF4Iiwic2V0TWF4Iiwic2V0TWluTWF4Iiwic2V0IiwicmFuZ2UiLCJhZGRWYWx1ZSIsIm4iLCJNYXRoIiwid2l0aFZhbHVlIiwiY29weSIsImdldExlbmd0aCIsImdldENlbnRlciIsImNvbnRhaW5zIiwidmFsdWUiLCJjb250YWluc1JhbmdlIiwiaW50ZXJzZWN0cyIsImludGVyc2VjdHNFeGNsdXNpdmUiLCJ1bmlvbiIsImludGVyc2VjdGlvbiIsImluY2x1ZGVSYW5nZSIsImNvbnN0cmFpblJhbmdlIiwic2hpZnRlZCIsInRvU3RyaW5nIiwiY29uc3RyYWluVmFsdWUiLCJ0aW1lcyIsIm11bHRpcGx5IiwiZXF1YWxzIiwib2JqZWN0IiwiY29uc3RydWN0b3IiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsImFicyIsImdldE5vcm1hbGl6ZWRWYWx1ZSIsImV4cGFuZE5vcm1hbGl6ZWRWYWx1ZSIsIm5vcm1hbGl6ZWRWYWx1ZSIsImRlZmF1bHRWYWx1ZSIsIkVycm9yIiwidG9TdGF0ZU9iamVjdCIsImNsYW1wRGVsdGEiLCJkZWx0YSIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiUmFuZ2VJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsIkVWRVJZVEhJTkciLCJOdW1iZXIiLCJORUdBVElWRV9JTkZJTklUWSIsIlBPU0lUSVZFX0lORklOSVRZIiwiTk9USElORyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBR0QsT0FBT0Esc0JBQXNCLDRDQUE0QztBQUN6RSxPQUFPQyxZQUFZLGtDQUFrQztBQUVyRCxPQUFPQyxTQUFTLFdBQVc7QUFPM0IsTUFBTUMsZUFBZTtJQUNuQkMsS0FBS0o7SUFDTEssS0FBS0w7QUFDUDtBQUdBLElBQUEsQUFBTU0sUUFBTixNQUFNQTtJQWlCSjs7R0FFQyxHQUNELEFBQU9DLFNBQWlCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDQyxJQUFJO0lBQ2xCO0lBRUEsSUFBV0osTUFBYztRQUN2QixPQUFPLElBQUksQ0FBQ0csTUFBTTtJQUNwQjtJQUVBLElBQVdILElBQUtBLEdBQVcsRUFBRztRQUM1QixJQUFJLENBQUNLLE1BQU0sQ0FBRUw7SUFDZjtJQUVBOzs7R0FH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