// Copyright 2018-2023, University of Colorado Boulder
/**
 * A numeric range that handles open and half open intervals. Defaults to an open interval.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */ import merge from '../../phet-core/js/merge.js';
import dot from './dot.js';
import Range from './Range.js';
let OpenRange = class OpenRange extends Range {
    /**
   * OpenRange override for setMin.
   * @public
   * @override
   * @param  {number} min
   */ setMin(min) {
        assert && assert(min < this._max, 'min must be strictly less than max for OpenRange');
        super.setMin(min);
    }
    /**
   * OpenRange override for setMax.
   * @public
   * @override
   * @param  {number} max
   */ setMax(max) {
        assert && assert(max > this._min, 'max must be strictly greater than min for OpenRange');
        super.setMax(max);
    }
    /**
   * OpenRange override for setMinMax. Ensures that min is strictly less than max.
   * @override
   * @public
   * @param  {number} min
   * @param  {number} max
   */ setMinMax(min, max) {
        assert && assert(min < max, 'min must be strictly less than max in OpenRange');
        super.setMinMax(min, max);
    }
    /**
   * Determines if this range contains the value
   * @public
   * @param {number} value
   * @returns {boolean}
   */ contains(value) {
        return (this.openMin ? value > this.min : value >= this.min) && (this.openMax ? value < this.max : value <= this.max);
    }
    /**
   * Does this range contain the specified range?
   * @public
   * @param {Range} range
   * @returns {boolean}
   */ containsRange(range) {
        return (this.openMin ? this.min < range.min : this.min <= range.min) && (this.openMax ? this.max > range.max : this.max >= range.max);
    }
    /**
   * Determine if this range overlaps (intersects) with another range
   * @public
   * @param {Range} range
   * @returns {boolean}
   */ intersects(range) {
        return (this.openMax ? this.max > range.min : this.max >= range.min) && (this.openMin ? range.max > this.min : range.max >= this.min);
    }
    /**
   * Converts the attributes of this range to a string
   * @public
   * @returns {string}
   */ toString() {
        const leftBracket = this.openMin ? '(' : '[';
        const rightBracket = this.openMax ? ')' : ']';
        return `[Range ${leftBracket}min:${this.min} max:${this.max}${rightBracket}]`;
    }
    /**
   * TODO: how will this function in an open range scenario? https://github.com/phetsims/dot/issues/96
   * Constrains a value to the range.
   * @public
   * @param {number} value
   * @returns {number}
   */ constrainValue(value) {
        return Math.min(Math.max(value, this.min), this.max);
    }
    /**
   * Determines if this range is equal to other range.
   * @public
   * @param {Range} other
   * @returns {boolean}
   */ equals(other) {
        return other instanceof Range && this.min === other.min && this.max === other.max && this.openMin === other.openMin && this.openMax === other.openMax;
    }
    /**
   * @param {number} min - the minimum value of the range
   * @param {number} max - the maximum value of the range
   * @param {Object} [options]
   */ constructor(min, max, options){
        options = merge({
            openMin: true,
            openMax: true
        }, options);
        super(min, max);
        // @public (read-only) - interval open at minimum value (excludes the min in comparisons)
        this.openMin = options.openMin;
        // @public (read-only) - interval open at maximum value (excludes the max in comparisons)
        this.openMax = options.openMax;
        // if the interval is open, ensure that the min is strictly less than the max
        assert && assert(this.openMin || this.openMax, 'use Range type if min and max are inclusive');
        assert && assert(min < max, 'must instantiate OpenRange with min strictly less than max');
    }
};
dot.register('OpenRange', OpenRange);
export default OpenRange;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9PcGVuUmFuZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBudW1lcmljIHJhbmdlIHRoYXQgaGFuZGxlcyBvcGVuIGFuZCBoYWxmIG9wZW4gaW50ZXJ2YWxzLiBEZWZhdWx0cyB0byBhbiBvcGVuIGludGVydmFsLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBCYXJsb3cgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuL1JhbmdlLmpzJztcblxuY2xhc3MgT3BlblJhbmdlIGV4dGVuZHMgUmFuZ2Uge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiAtIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSByYW5nZVxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4IC0gdGhlIG1heGltdW0gdmFsdWUgb2YgdGhlIHJhbmdlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBtaW4sIG1heCwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgb3Blbk1pbjogdHJ1ZSxcbiAgICAgIG9wZW5NYXg6IHRydWVcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICBzdXBlciggbWluLCBtYXggKTtcblxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBpbnRlcnZhbCBvcGVuIGF0IG1pbmltdW0gdmFsdWUgKGV4Y2x1ZGVzIHRoZSBtaW4gaW4gY29tcGFyaXNvbnMpXG4gICAgdGhpcy5vcGVuTWluID0gb3B0aW9ucy5vcGVuTWluO1xuXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGludGVydmFsIG9wZW4gYXQgbWF4aW11bSB2YWx1ZSAoZXhjbHVkZXMgdGhlIG1heCBpbiBjb21wYXJpc29ucylcbiAgICB0aGlzLm9wZW5NYXggPSBvcHRpb25zLm9wZW5NYXg7XG5cbiAgICAvLyBpZiB0aGUgaW50ZXJ2YWwgaXMgb3BlbiwgZW5zdXJlIHRoYXQgdGhlIG1pbiBpcyBzdHJpY3RseSBsZXNzIHRoYW4gdGhlIG1heFxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMub3Blbk1pbiB8fCB0aGlzLm9wZW5NYXgsICd1c2UgUmFuZ2UgdHlwZSBpZiBtaW4gYW5kIG1heCBhcmUgaW5jbHVzaXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pbiA8IG1heCwgJ211c3QgaW5zdGFudGlhdGUgT3BlblJhbmdlIHdpdGggbWluIHN0cmljdGx5IGxlc3MgdGhhbiBtYXgnICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBPcGVuUmFuZ2Ugb3ZlcnJpZGUgZm9yIHNldE1pbi5cbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICogQHBhcmFtICB7bnVtYmVyfSBtaW5cbiAgICovXG4gIHNldE1pbiggbWluICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pbiA8IHRoaXMuX21heCwgJ21pbiBtdXN0IGJlIHN0cmljdGx5IGxlc3MgdGhhbiBtYXggZm9yIE9wZW5SYW5nZScgKTtcbiAgICBzdXBlci5zZXRNaW4oIG1pbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5SYW5nZSBvdmVycmlkZSBmb3Igc2V0TWF4LlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG1heFxuICAgKi9cbiAgc2V0TWF4KCBtYXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF4ID4gdGhpcy5fbWluLCAnbWF4IG11c3QgYmUgc3RyaWN0bHkgZ3JlYXRlciB0aGFuIG1pbiBmb3IgT3BlblJhbmdlJyApO1xuICAgIHN1cGVyLnNldE1heCggbWF4ICk7XG4gIH1cblxuICAvKipcbiAgICogT3BlblJhbmdlIG92ZXJyaWRlIGZvciBzZXRNaW5NYXguIEVuc3VyZXMgdGhhdCBtaW4gaXMgc3RyaWN0bHkgbGVzcyB0aGFuIG1heC5cbiAgICogQG92ZXJyaWRlXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtICB7bnVtYmVyfSBtaW5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBtYXhcbiAgICovXG4gIHNldE1pbk1heCggbWluLCBtYXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluIDwgbWF4LCAnbWluIG11c3QgYmUgc3RyaWN0bHkgbGVzcyB0aGFuIG1heCBpbiBPcGVuUmFuZ2UnICk7XG4gICAgc3VwZXIuc2V0TWluTWF4KCBtaW4sIG1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyByYW5nZSBjb250YWlucyB0aGUgdmFsdWVcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBjb250YWlucyggdmFsdWUgKSB7XG4gICAgcmV0dXJuICggdGhpcy5vcGVuTWluID8gdmFsdWUgPiB0aGlzLm1pbiA6IHZhbHVlID49IHRoaXMubWluICkgJiZcbiAgICAgICAgICAgKCB0aGlzLm9wZW5NYXggPyB2YWx1ZSA8IHRoaXMubWF4IDogdmFsdWUgPD0gdGhpcy5tYXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHRoaXMgcmFuZ2UgY29udGFpbiB0aGUgc3BlY2lmaWVkIHJhbmdlP1xuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgY29udGFpbnNSYW5nZSggcmFuZ2UgKSB7XG4gICAgcmV0dXJuICggdGhpcy5vcGVuTWluID8gdGhpcy5taW4gPCByYW5nZS5taW4gOiB0aGlzLm1pbiA8PSByYW5nZS5taW4gKSAmJlxuICAgICAgICAgICAoIHRoaXMub3Blbk1heCA/IHRoaXMubWF4ID4gcmFuZ2UubWF4IDogdGhpcy5tYXggPj0gcmFuZ2UubWF4ICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIHRoaXMgcmFuZ2Ugb3ZlcmxhcHMgKGludGVyc2VjdHMpIHdpdGggYW5vdGhlciByYW5nZVxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaW50ZXJzZWN0cyggcmFuZ2UgKSB7XG4gICAgcmV0dXJuICggdGhpcy5vcGVuTWF4ID8gdGhpcy5tYXggPiByYW5nZS5taW4gOiB0aGlzLm1heCA+PSByYW5nZS5taW4gKSAmJlxuICAgICAgICAgICAoIHRoaXMub3Blbk1pbiA/IHJhbmdlLm1heCA+IHRoaXMubWluIDogcmFuZ2UubWF4ID49IHRoaXMubWluICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhpcyByYW5nZSB0byBhIHN0cmluZ1xuICAgKiBAcHVibGljXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBsZWZ0QnJhY2tldCA9IHRoaXMub3Blbk1pbiA/ICcoJyA6ICdbJztcbiAgICBjb25zdCByaWdodEJyYWNrZXQgPSB0aGlzLm9wZW5NYXggPyAnKScgOiAnXSc7XG4gICAgcmV0dXJuIGBbUmFuZ2UgJHtsZWZ0QnJhY2tldH1taW46JHt0aGlzLm1pbn0gbWF4OiR7dGhpcy5tYXh9JHtyaWdodEJyYWNrZXR9XWA7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogaG93IHdpbGwgdGhpcyBmdW5jdGlvbiBpbiBhbiBvcGVuIHJhbmdlIHNjZW5hcmlvPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgKiBDb25zdHJhaW5zIGEgdmFsdWUgdG8gdGhlIHJhbmdlLlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgY29uc3RyYWluVmFsdWUoIHZhbHVlICkge1xuICAgIHJldHVybiBNYXRoLm1pbiggTWF0aC5tYXgoIHZhbHVlLCB0aGlzLm1pbiApLCB0aGlzLm1heCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyByYW5nZSBpcyBlcXVhbCB0byBvdGhlciByYW5nZS5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge1JhbmdlfSBvdGhlclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGVxdWFscyggb3RoZXIgKSB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmFuZ2UgJiZcbiAgICAgICAgICAgdGhpcy5taW4gPT09IG90aGVyLm1pbiAmJlxuICAgICAgICAgICB0aGlzLm1heCA9PT0gb3RoZXIubWF4ICYmXG4gICAgICAgICAgIHRoaXMub3Blbk1pbiA9PT0gb3RoZXIub3Blbk1pbiAmJlxuICAgICAgICAgICB0aGlzLm9wZW5NYXggPT09IG90aGVyLm9wZW5NYXg7XG4gIH1cbn1cblxuZG90LnJlZ2lzdGVyKCAnT3BlblJhbmdlJywgT3BlblJhbmdlICk7XG5cbmV4cG9ydCBkZWZhdWx0IE9wZW5SYW5nZTsiXSwibmFtZXMiOlsibWVyZ2UiLCJkb3QiLCJSYW5nZSIsIk9wZW5SYW5nZSIsInNldE1pbiIsIm1pbiIsImFzc2VydCIsIl9tYXgiLCJzZXRNYXgiLCJtYXgiLCJfbWluIiwic2V0TWluTWF4IiwiY29udGFpbnMiLCJ2YWx1ZSIsIm9wZW5NaW4iLCJvcGVuTWF4IiwiY29udGFpbnNSYW5nZSIsInJhbmdlIiwiaW50ZXJzZWN0cyIsInRvU3RyaW5nIiwibGVmdEJyYWNrZXQiLCJyaWdodEJyYWNrZXQiLCJjb25zdHJhaW5WYWx1ZSIsIk1hdGgiLCJlcXVhbHMiLCJvdGhlciIsImNvbnN0cnVjdG9y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