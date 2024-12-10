// Copyright 2014-2022, University of Colorado Boulder
/**
 * A fraction and associated operations.
 *
 * NOTE: The common version of this class in the PhET Java code base has a number of additional methods.  These methods
 * should be ported into this file as needed.  Please see edu.colorado.phet.fractions.common.math.Fraction.java in the
 * PhET Java code base.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Utils from '../../../dot/js/Utils.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import phetcommon from '../phetcommon.js';
let Fraction = class Fraction {
    /**
   * Sets the numerator, which must be an integer.
   */ set numerator(value) {
        assert && assert(Number.isInteger(value), `numerator must be an integer: ${value}`);
        this._numerator = value;
    }
    /**
   * Gets the numerator.
   */ get numerator() {
        return this._numerator;
    }
    /**
   * Sets the denominator, which must be an integer.
   */ set denominator(value) {
        assert && assert(Number.isInteger(value), `denominator must be an integer: ${value}`);
        this._denominator = value;
    }
    /**
   * Gets the denominator.
   */ get denominator() {
        return this._denominator;
    }
    /**
   * Computes the numeric value of the fraction.
   * Floating-point error is not an issue as long as numerator and denominator are integers < 2^53.
   */ getValue() {
        return this.numerator / this.denominator;
    }
    get value() {
        return this.getValue();
    }
    /**
   * Does this fraction reduce to an integer value?
   */ isInteger() {
        return this.numerator % this.denominator === 0;
    }
    toString() {
        return `${this.numerator}/${this.denominator}`;
    }
    copy() {
        return new Fraction(this.numerator, this.denominator);
    }
    /**
   * Reduces this fraction, modifies the numerator and denominator.
   */ reduce() {
        const gcd = Utils.gcd(this.numerator, this.denominator);
        this.numerator = gcd === 0 ? 0 : Utils.roundSymmetric(this.numerator / gcd);
        this.denominator = gcd === 0 ? 0 : Utils.roundSymmetric(this.denominator / gcd);
        return this;
    }
    /**
   * Creates a reduced instance of this fraction.
   */ reduced() {
        return this.copy().reduce();
    }
    /**
   * Is this fraction reduced?
   */ isReduced() {
        return Utils.gcd(this.numerator, this.denominator) === 1;
    }
    /**
   * Returns whether the two fractions are equal (not whether their reduced values are equal).
   */ equals(fraction) {
        return this.numerator === fraction.numerator && this.denominator === fraction.denominator;
    }
    /**
   * Returns whether this fraction has a value that is less than the provided fraction.
   */ isLessThan(fraction) {
        // The more straightforward approach would be: this.getValue() < fraction.getValue().
        // But that uses floating-point operations and comparisons, which could result in a loss of precision.
        // https://github.com/phetsims/phetcommon/issues/43
        return SCRATCH_FRACTION.set(this).subtract(fraction).sign === -1;
    }
    /**
   * Gets the sign of the value, as defined by Math.sign
   */ get sign() {
        return Math.sign(this.getValue());
    }
    /**
   * Returns the absolute value of this fraction.
   */ abs() {
        return new Fraction(Math.abs(this.numerator), Math.abs(this.denominator));
    }
    /**
   * Sets the value of this fraction to the provided fraction.
   */ set(value) {
        this.numerator = value.numerator;
        this.denominator = value.denominator;
        return this;
    }
    /**
   * Sets the value of this fraction to the sum of the two fractions:
   * numerator1 / denominator1 + numerator2 / denominator2
   */ setToSum(numerator1, denominator1, numerator2, denominator2) {
        assert && assert(Number.isInteger(numerator1), 'numerator1 must be an integer');
        assert && assert(Number.isInteger(denominator1), 'denominator1 must be an integer');
        assert && assert(Number.isInteger(numerator2), 'numerator2 must be an integer');
        assert && assert(Number.isInteger(denominator2), 'denominator2 must be an integer');
        const lcm = Utils.lcm(denominator1, denominator2);
        this.numerator = Utils.roundSymmetric(numerator1 * lcm / denominator1) + Utils.roundSymmetric(numerator2 * lcm / denominator2);
        this.denominator = lcm;
        return this;
    }
    /**
   * Adds the provided fraction into this fraction (mutates this fraction). The result is NOT reduced,
   * and has a denominator that is the least-common multiple of the 2 denominators.
   */ add(value) {
        return this.setToSum(this.numerator, this.denominator, value.numerator, value.denominator);
    }
    /**
   * Adds a fraction to this fraction to create a new fraction.
   * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
   */ plus(value) {
        return this.copy().add(value);
    }
    /**
   * Subtracts the provided fraction from this fraction (mutates this fraction). The result is NOT reduced,
   * and has a denominator that is the least-common multiple of the 2 denominators.
   */ subtract(value) {
        return this.setToSum(this.numerator, this.denominator, -value.numerator, value.denominator);
    }
    /**
   * Subtracts a fraction from this fraction to create a new fraction.
   * The result is not reduced, and has a denominator that is the least-common multiple of the 2 denominators.
   */ minus(value) {
        return this.copy().subtract(value);
    }
    /**
   * Multiplies the provided fraction and this fraction, setting the result into this fraction (mutates).
   * The value is not reduced.
   */ multiply(value) {
        this.numerator *= value.numerator;
        this.denominator *= value.denominator;
        return this;
    }
    /**
   * Multiplies this fraction by another fraction to create a new fraction.
   * The result is not reduced.
   */ times(value) {
        return this.copy().multiply(value);
    }
    /**
   * Divides this fraction by the provided fraction, setting the result into this fraction (mutates).
   * The value is not reduced.
   */ divide(value) {
        this.numerator *= value.denominator;
        this.denominator *= value.numerator;
        return this;
    }
    /**
   * Divides this fraction by another fraction to create a new fraction.
   * The result is not reduced.
   */ divided(value) {
        return this.copy().divide(value);
    }
    /**
   * Convenience method.
   * Adds an integer value to this fraction to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */ plusInteger(value) {
        assert && assert(Number.isInteger(value), `value is not an integer: ${value}`);
        return new Fraction(this.numerator + value * this.denominator, this.denominator);
    }
    /**
   * Convenience method.
   * Subtracts an integer value from this fraction to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */ minusInteger(value) {
        assert && assert(Number.isInteger(value), `value is not an integer: ${value}`);
        return new Fraction(this.numerator - value * this.denominator, this.denominator);
    }
    /**
   * Convenience method.
   * Multiplies this fraction by an integer to create a new fraction.
   * The result is not reduced, and the denominator is the same as the denominator of this fraction.
   */ timesInteger(value) {
        assert && assert(Number.isInteger(value), `value is not an integer: ${value}`);
        return new Fraction(this.numerator * value, this.denominator);
    }
    /**
   * Convenience method.
   * Divides this fraction by an integer to create a new fraction.
   * This operation affects the value and sign of the denominator only, and the result is not reduced.
   * Careful! Division by zero is allowed here.
   */ dividedInteger(value) {
        assert && assert(Number.isInteger(value), `value is not an integer: ${value}`);
        return new Fraction(this.numerator, this.denominator * value);
    }
    /**
   * Convenience method for constructing a fraction from an integer.
   */ static fromInteger(value) {
        assert && assert(Number.isInteger(value), `value is not an integer: ${value}`);
        return new Fraction(value, 1);
    }
    /**
   * Convert a number into a Fraction
   */ static fromDecimal(value) {
        if (Number.isInteger(value)) {
            return Fraction.fromInteger(value);
        } else {
            // Get the decimal part of the number.
            const decimal = value - Utils.toFixedNumber(value, 0);
            assert && assert(decimal !== 0, 'expected decimal to be non-zero');
            // Convert the decimal part into an integer. This becomes the denominator.
            const denominator = Math.pow(10, Utils.numberOfDecimalPlaces(decimal));
            // Compute numerator
            const numerator = Utils.toFixedNumber(value * denominator, 0);
            return new Fraction(numerator, denominator).reduce();
        }
    }
    /**
   * Serializes this Fraction instance.
   */ toStateObject() {
        return {
            numerator: this._numerator,
            denominator: this._denominator
        };
    }
    /**
   * Deserializes a Fraction from PhET-iO state.
   */ static fromStateObject(stateObject) {
        return new Fraction(stateObject.numerator, stateObject.denominator);
    }
    constructor(numerator, denominator){
        assert && assert(Number.isInteger(numerator), `numerator must be an integer: ${numerator}`);
        assert && assert(Number.isInteger(denominator), `denominator must be an integer: ${denominator}`);
        this._numerator = numerator;
        this._denominator = denominator;
    }
};
Fraction.ZERO = new Fraction(0, 1);
Fraction.ONE = new Fraction(1, 1);
/**
   * IOType for Fraction.
   */ Fraction.FractionIO = new IOType('FractionIO', {
    valueType: Fraction,
    stateSchema: {
        numerator: NumberIO,
        denominator: NumberIO
    },
    toStateObject: (fraction)=>fraction.toStateObject(),
    fromStateObject: (stateObject)=>Fraction.fromStateObject(stateObject)
});
export { Fraction as default };
// Used to avoid GC. NOTE: Do NOT move in front of the constructor, as it is creating a copy of the type defined.
const SCRATCH_FRACTION = new Fraction(1, 1);
phetcommon.register('Fraction', Fraction);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvRnJhY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBmcmFjdGlvbiBhbmQgYXNzb2NpYXRlZCBvcGVyYXRpb25zLlxuICpcbiAqIE5PVEU6IFRoZSBjb21tb24gdmVyc2lvbiBvZiB0aGlzIGNsYXNzIGluIHRoZSBQaEVUIEphdmEgY29kZSBiYXNlIGhhcyBhIG51bWJlciBvZiBhZGRpdGlvbmFsIG1ldGhvZHMuICBUaGVzZSBtZXRob2RzXG4gKiBzaG91bGQgYmUgcG9ydGVkIGludG8gdGhpcyBmaWxlIGFzIG5lZWRlZC4gIFBsZWFzZSBzZWUgZWR1LmNvbG9yYWRvLnBoZXQuZnJhY3Rpb25zLmNvbW1vbi5tYXRoLkZyYWN0aW9uLmphdmEgaW4gdGhlXG4gKiBQaEVUIEphdmEgY29kZSBiYXNlLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xuaW1wb3J0IHBoZXRjb21tb24gZnJvbSAnLi4vcGhldGNvbW1vbi5qcyc7XG5cbmV4cG9ydCB0eXBlIEZyYWN0aW9uU3RhdGVPYmplY3QgPSB7XG4gIG51bWVyYXRvcjogbnVtYmVyO1xuICBkZW5vbWluYXRvcjogbnVtYmVyO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhY3Rpb24ge1xuXG4gIHByaXZhdGUgX251bWVyYXRvcjogbnVtYmVyO1xuICBwcml2YXRlIF9kZW5vbWluYXRvcjogbnVtYmVyO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgWkVSTyA9IG5ldyBGcmFjdGlvbiggMCwgMSApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9ORSA9IG5ldyBGcmFjdGlvbiggMSwgMSApO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbnVtZXJhdG9yOiBudW1iZXIsIGRlbm9taW5hdG9yOiBudW1iZXIgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBudW1lcmF0b3IgKSwgYG51bWVyYXRvciBtdXN0IGJlIGFuIGludGVnZXI6ICR7bnVtZXJhdG9yfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBkZW5vbWluYXRvciApLCBgZGVub21pbmF0b3IgbXVzdCBiZSBhbiBpbnRlZ2VyOiAke2Rlbm9taW5hdG9yfWAgKTtcblxuICAgIHRoaXMuX251bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICB0aGlzLl9kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG51bWVyYXRvciwgd2hpY2ggbXVzdCBiZSBhbiBpbnRlZ2VyLlxuICAgKi9cbiAgcHVibGljIHNldCBudW1lcmF0b3IoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSwgYG51bWVyYXRvciBtdXN0IGJlIGFuIGludGVnZXI6ICR7dmFsdWV9YCApO1xuICAgIHRoaXMuX251bWVyYXRvciA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWVyYXRvci5cbiAgICovXG4gIHB1YmxpYyBnZXQgbnVtZXJhdG9yKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9udW1lcmF0b3I7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVub21pbmF0b3IsIHdoaWNoIG11c3QgYmUgYW4gaW50ZWdlci5cbiAgICovXG4gIHB1YmxpYyBzZXQgZGVub21pbmF0b3IoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSwgYGRlbm9taW5hdG9yIG11c3QgYmUgYW4gaW50ZWdlcjogJHt2YWx1ZX1gICk7XG4gICAgdGhpcy5fZGVub21pbmF0b3IgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZW5vbWluYXRvci5cbiAgICovXG4gIHB1YmxpYyBnZXQgZGVub21pbmF0b3IoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2Rlbm9taW5hdG9yOyB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBudW1lcmljIHZhbHVlIG9mIHRoZSBmcmFjdGlvbi5cbiAgICogRmxvYXRpbmctcG9pbnQgZXJyb3IgaXMgbm90IGFuIGlzc3VlIGFzIGxvbmcgYXMgbnVtZXJhdG9yIGFuZCBkZW5vbWluYXRvciBhcmUgaW50ZWdlcnMgPCAyXjUzLlxuICAgKi9cbiAgcHVibGljIGdldFZhbHVlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubnVtZXJhdG9yIC8gdGhpcy5kZW5vbWluYXRvcjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdmFsdWUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0VmFsdWUoKTsgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHRoaXMgZnJhY3Rpb24gcmVkdWNlIHRvIGFuIGludGVnZXIgdmFsdWU/XG4gICAqL1xuICBwdWJsaWMgaXNJbnRlZ2VyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoIHRoaXMubnVtZXJhdG9yICUgdGhpcy5kZW5vbWluYXRvciA9PT0gMCApO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMubnVtZXJhdG9yfS8ke3RoaXMuZGVub21pbmF0b3J9YDtcbiAgfVxuXG4gIHB1YmxpYyBjb3B5KCk6IEZyYWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IEZyYWN0aW9uKCB0aGlzLm51bWVyYXRvciwgdGhpcy5kZW5vbWluYXRvciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZHVjZXMgdGhpcyBmcmFjdGlvbiwgbW9kaWZpZXMgdGhlIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IuXG4gICAqL1xuICBwdWJsaWMgcmVkdWNlKCk6IEZyYWN0aW9uIHtcbiAgICBjb25zdCBnY2QgPSBVdGlscy5nY2QoIHRoaXMubnVtZXJhdG9yLCB0aGlzLmRlbm9taW5hdG9yICk7XG4gICAgdGhpcy5udW1lcmF0b3IgPSAoIGdjZCA9PT0gMCApID8gMCA6IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLm51bWVyYXRvciAvIGdjZCApO1xuICAgIHRoaXMuZGVub21pbmF0b3IgPSAoIGdjZCA9PT0gMCApID8gMCA6IFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLmRlbm9taW5hdG9yIC8gZ2NkICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJlZHVjZWQgaW5zdGFuY2Ugb2YgdGhpcyBmcmFjdGlvbi5cbiAgICovXG4gIHB1YmxpYyByZWR1Y2VkKCk6IEZyYWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkucmVkdWNlKCk7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhpcyBmcmFjdGlvbiByZWR1Y2VkP1xuICAgKi9cbiAgcHVibGljIGlzUmVkdWNlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gVXRpbHMuZ2NkKCB0aGlzLm51bWVyYXRvciwgdGhpcy5kZW5vbWluYXRvciApID09PSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgdHdvIGZyYWN0aW9ucyBhcmUgZXF1YWwgKG5vdCB3aGV0aGVyIHRoZWlyIHJlZHVjZWQgdmFsdWVzIGFyZSBlcXVhbCkuXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzKCBmcmFjdGlvbjogRnJhY3Rpb24gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICggdGhpcy5udW1lcmF0b3IgPT09IGZyYWN0aW9uLm51bWVyYXRvciApICYmICggdGhpcy5kZW5vbWluYXRvciA9PT0gZnJhY3Rpb24uZGVub21pbmF0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBmcmFjdGlvbiBoYXMgYSB2YWx1ZSB0aGF0IGlzIGxlc3MgdGhhbiB0aGUgcHJvdmlkZWQgZnJhY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgaXNMZXNzVGhhbiggZnJhY3Rpb246IEZyYWN0aW9uICk6IGJvb2xlYW4ge1xuXG4gICAgLy8gVGhlIG1vcmUgc3RyYWlnaHRmb3J3YXJkIGFwcHJvYWNoIHdvdWxkIGJlOiB0aGlzLmdldFZhbHVlKCkgPCBmcmFjdGlvbi5nZXRWYWx1ZSgpLlxuICAgIC8vIEJ1dCB0aGF0IHVzZXMgZmxvYXRpbmctcG9pbnQgb3BlcmF0aW9ucyBhbmQgY29tcGFyaXNvbnMsIHdoaWNoIGNvdWxkIHJlc3VsdCBpbiBhIGxvc3Mgb2YgcHJlY2lzaW9uLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0Y29tbW9uL2lzc3Vlcy80M1xuICAgIHJldHVybiBTQ1JBVENIX0ZSQUNUSU9OLnNldCggdGhpcyApLnN1YnRyYWN0KCBmcmFjdGlvbiApLnNpZ24gPT09IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHNpZ24gb2YgdGhlIHZhbHVlLCBhcyBkZWZpbmVkIGJ5IE1hdGguc2lnblxuICAgKi9cbiAgcHVibGljIGdldCBzaWduKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc2lnbiggdGhpcy5nZXRWYWx1ZSgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBmcmFjdGlvbi5cbiAgICovXG4gIHB1YmxpYyBhYnMoKTogRnJhY3Rpb24ge1xuICAgIHJldHVybiBuZXcgRnJhY3Rpb24oIE1hdGguYWJzKCB0aGlzLm51bWVyYXRvciApLCBNYXRoLmFicyggdGhpcy5kZW5vbWluYXRvciApICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhpcyBmcmFjdGlvbiB0byB0aGUgcHJvdmlkZWQgZnJhY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgc2V0KCB2YWx1ZTogRnJhY3Rpb24gKTogRnJhY3Rpb24ge1xuICAgIHRoaXMubnVtZXJhdG9yID0gdmFsdWUubnVtZXJhdG9yO1xuICAgIHRoaXMuZGVub21pbmF0b3IgPSB2YWx1ZS5kZW5vbWluYXRvcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGlzIGZyYWN0aW9uIHRvIHRoZSBzdW0gb2YgdGhlIHR3byBmcmFjdGlvbnM6XG4gICAqIG51bWVyYXRvcjEgLyBkZW5vbWluYXRvcjEgKyBudW1lcmF0b3IyIC8gZGVub21pbmF0b3IyXG4gICAqL1xuICBwdWJsaWMgc2V0VG9TdW0oIG51bWVyYXRvcjE6IG51bWJlciwgZGVub21pbmF0b3IxOiBudW1iZXIsIG51bWVyYXRvcjI6IG51bWJlciwgZGVub21pbmF0b3IyOiBudW1iZXIgKTogRnJhY3Rpb24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWVyYXRvcjEgKSwgJ251bWVyYXRvcjEgbXVzdCBiZSBhbiBpbnRlZ2VyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGRlbm9taW5hdG9yMSApLCAnZGVub21pbmF0b3IxIG11c3QgYmUgYW4gaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBudW1lcmF0b3IyICksICdudW1lcmF0b3IyIG11c3QgYmUgYW4gaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBkZW5vbWluYXRvcjIgKSwgJ2Rlbm9taW5hdG9yMiBtdXN0IGJlIGFuIGludGVnZXInICk7XG5cbiAgICBjb25zdCBsY20gPSBVdGlscy5sY20oIGRlbm9taW5hdG9yMSwgZGVub21pbmF0b3IyICk7XG4gICAgdGhpcy5udW1lcmF0b3IgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggbnVtZXJhdG9yMSAqIGxjbSAvIGRlbm9taW5hdG9yMSApICtcbiAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBudW1lcmF0b3IyICogbGNtIC8gZGVub21pbmF0b3IyICk7XG4gICAgdGhpcy5kZW5vbWluYXRvciA9IGxjbTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBwcm92aWRlZCBmcmFjdGlvbiBpbnRvIHRoaXMgZnJhY3Rpb24gKG11dGF0ZXMgdGhpcyBmcmFjdGlvbikuIFRoZSByZXN1bHQgaXMgTk9UIHJlZHVjZWQsXG4gICAqIGFuZCBoYXMgYSBkZW5vbWluYXRvciB0aGF0IGlzIHRoZSBsZWFzdC1jb21tb24gbXVsdGlwbGUgb2YgdGhlIDIgZGVub21pbmF0b3JzLlxuICAgKi9cbiAgcHVibGljIGFkZCggdmFsdWU6IEZyYWN0aW9uICk6IEZyYWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5zZXRUb1N1bSggdGhpcy5udW1lcmF0b3IsIHRoaXMuZGVub21pbmF0b3IsIHZhbHVlLm51bWVyYXRvciwgdmFsdWUuZGVub21pbmF0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZnJhY3Rpb24gdG8gdGhpcyBmcmFjdGlvbiB0byBjcmVhdGUgYSBuZXcgZnJhY3Rpb24uXG4gICAqIFRoZSByZXN1bHQgaXMgbm90IHJlZHVjZWQsIGFuZCBoYXMgYSBkZW5vbWluYXRvciB0aGF0IGlzIHRoZSBsZWFzdC1jb21tb24gbXVsdGlwbGUgb2YgdGhlIDIgZGVub21pbmF0b3JzLlxuICAgKi9cbiAgcHVibGljIHBsdXMoIHZhbHVlOiBGcmFjdGlvbiApOiBGcmFjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuY29weSgpLmFkZCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhlIHByb3ZpZGVkIGZyYWN0aW9uIGZyb20gdGhpcyBmcmFjdGlvbiAobXV0YXRlcyB0aGlzIGZyYWN0aW9uKS4gVGhlIHJlc3VsdCBpcyBOT1QgcmVkdWNlZCxcbiAgICogYW5kIGhhcyBhIGRlbm9taW5hdG9yIHRoYXQgaXMgdGhlIGxlYXN0LWNvbW1vbiBtdWx0aXBsZSBvZiB0aGUgMiBkZW5vbWluYXRvcnMuXG4gICAqL1xuICBwdWJsaWMgc3VidHJhY3QoIHZhbHVlOiBGcmFjdGlvbiApOiBGcmFjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VG9TdW0oIHRoaXMubnVtZXJhdG9yLCB0aGlzLmRlbm9taW5hdG9yLCAtdmFsdWUubnVtZXJhdG9yLCB2YWx1ZS5kZW5vbWluYXRvciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0cyBhIGZyYWN0aW9uIGZyb20gdGhpcyBmcmFjdGlvbiB0byBjcmVhdGUgYSBuZXcgZnJhY3Rpb24uXG4gICAqIFRoZSByZXN1bHQgaXMgbm90IHJlZHVjZWQsIGFuZCBoYXMgYSBkZW5vbWluYXRvciB0aGF0IGlzIHRoZSBsZWFzdC1jb21tb24gbXVsdGlwbGUgb2YgdGhlIDIgZGVub21pbmF0b3JzLlxuICAgKi9cbiAgcHVibGljIG1pbnVzKCB2YWx1ZTogRnJhY3Rpb24gKTogRnJhY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmNvcHkoKS5zdWJ0cmFjdCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHRoZSBwcm92aWRlZCBmcmFjdGlvbiBhbmQgdGhpcyBmcmFjdGlvbiwgc2V0dGluZyB0aGUgcmVzdWx0IGludG8gdGhpcyBmcmFjdGlvbiAobXV0YXRlcykuXG4gICAqIFRoZSB2YWx1ZSBpcyBub3QgcmVkdWNlZC5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggdmFsdWU6IEZyYWN0aW9uICk6IEZyYWN0aW9uIHtcbiAgICB0aGlzLm51bWVyYXRvciAqPSB2YWx1ZS5udW1lcmF0b3I7XG4gICAgdGhpcy5kZW5vbWluYXRvciAqPSB2YWx1ZS5kZW5vbWluYXRvcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHRoaXMgZnJhY3Rpb24gYnkgYW5vdGhlciBmcmFjdGlvbiB0byBjcmVhdGUgYSBuZXcgZnJhY3Rpb24uXG4gICAqIFRoZSByZXN1bHQgaXMgbm90IHJlZHVjZWQuXG4gICAqL1xuICBwdWJsaWMgdGltZXMoIHZhbHVlOiBGcmFjdGlvbiApOiBGcmFjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuY29weSgpLm11bHRpcGx5KCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZXMgdGhpcyBmcmFjdGlvbiBieSB0aGUgcHJvdmlkZWQgZnJhY3Rpb24sIHNldHRpbmcgdGhlIHJlc3VsdCBpbnRvIHRoaXMgZnJhY3Rpb24gKG11dGF0ZXMpLlxuICAgKiBUaGUgdmFsdWUgaXMgbm90IHJlZHVjZWQuXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlKCB2YWx1ZTogRnJhY3Rpb24gKTogRnJhY3Rpb24ge1xuICAgIHRoaXMubnVtZXJhdG9yICo9IHZhbHVlLmRlbm9taW5hdG9yO1xuICAgIHRoaXMuZGVub21pbmF0b3IgKj0gdmFsdWUubnVtZXJhdG9yO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZXMgdGhpcyBmcmFjdGlvbiBieSBhbm90aGVyIGZyYWN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBmcmFjdGlvbi5cbiAgICogVGhlIHJlc3VsdCBpcyBub3QgcmVkdWNlZC5cbiAgICovXG4gIHB1YmxpYyBkaXZpZGVkKCB2YWx1ZTogRnJhY3Rpb24gKTogRnJhY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLmNvcHkoKS5kaXZpZGUoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgbWV0aG9kLlxuICAgKiBBZGRzIGFuIGludGVnZXIgdmFsdWUgdG8gdGhpcyBmcmFjdGlvbiB0byBjcmVhdGUgYSBuZXcgZnJhY3Rpb24uXG4gICAqIFRoZSByZXN1bHQgaXMgbm90IHJlZHVjZWQsIGFuZCB0aGUgZGVub21pbmF0b3IgaXMgdGhlIHNhbWUgYXMgdGhlIGRlbm9taW5hdG9yIG9mIHRoaXMgZnJhY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgcGx1c0ludGVnZXIoIHZhbHVlOiBudW1iZXIgKTogRnJhY3Rpb24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIHZhbHVlICksIGB2YWx1ZSBpcyBub3QgYW4gaW50ZWdlcjogJHt2YWx1ZX1gICk7XG4gICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggdGhpcy5udW1lcmF0b3IgKyAoIHZhbHVlICogdGhpcy5kZW5vbWluYXRvciApLCB0aGlzLmRlbm9taW5hdG9yICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgbWV0aG9kLlxuICAgKiBTdWJ0cmFjdHMgYW4gaW50ZWdlciB2YWx1ZSBmcm9tIHRoaXMgZnJhY3Rpb24gdG8gY3JlYXRlIGEgbmV3IGZyYWN0aW9uLlxuICAgKiBUaGUgcmVzdWx0IGlzIG5vdCByZWR1Y2VkLCBhbmQgdGhlIGRlbm9taW5hdG9yIGlzIHRoZSBzYW1lIGFzIHRoZSBkZW5vbWluYXRvciBvZiB0aGlzIGZyYWN0aW9uLlxuICAgKi9cbiAgcHVibGljIG1pbnVzSW50ZWdlciggdmFsdWU6IG51bWJlciApOiBGcmFjdGlvbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSwgYHZhbHVlIGlzIG5vdCBhbiBpbnRlZ2VyOiAke3ZhbHVlfWAgKTtcbiAgICByZXR1cm4gbmV3IEZyYWN0aW9uKCB0aGlzLm51bWVyYXRvciAtICggdmFsdWUgKiB0aGlzLmRlbm9taW5hdG9yICksIHRoaXMuZGVub21pbmF0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QuXG4gICAqIE11bHRpcGxpZXMgdGhpcyBmcmFjdGlvbiBieSBhbiBpbnRlZ2VyIHRvIGNyZWF0ZSBhIG5ldyBmcmFjdGlvbi5cbiAgICogVGhlIHJlc3VsdCBpcyBub3QgcmVkdWNlZCwgYW5kIHRoZSBkZW5vbWluYXRvciBpcyB0aGUgc2FtZSBhcyB0aGUgZGVub21pbmF0b3Igb2YgdGhpcyBmcmFjdGlvbi5cbiAgICovXG4gIHB1YmxpYyB0aW1lc0ludGVnZXIoIHZhbHVlOiBudW1iZXIgKTogRnJhY3Rpb24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIHZhbHVlICksIGB2YWx1ZSBpcyBub3QgYW4gaW50ZWdlcjogJHt2YWx1ZX1gICk7XG4gICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggdGhpcy5udW1lcmF0b3IgKiB2YWx1ZSwgdGhpcy5kZW5vbWluYXRvciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIG1ldGhvZC5cbiAgICogRGl2aWRlcyB0aGlzIGZyYWN0aW9uIGJ5IGFuIGludGVnZXIgdG8gY3JlYXRlIGEgbmV3IGZyYWN0aW9uLlxuICAgKiBUaGlzIG9wZXJhdGlvbiBhZmZlY3RzIHRoZSB2YWx1ZSBhbmQgc2lnbiBvZiB0aGUgZGVub21pbmF0b3Igb25seSwgYW5kIHRoZSByZXN1bHQgaXMgbm90IHJlZHVjZWQuXG4gICAqIENhcmVmdWwhIERpdmlzaW9uIGJ5IHplcm8gaXMgYWxsb3dlZCBoZXJlLlxuICAgKi9cbiAgcHVibGljIGRpdmlkZWRJbnRlZ2VyKCB2YWx1ZTogbnVtYmVyICk6IEZyYWN0aW9uIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApLCBgdmFsdWUgaXMgbm90IGFuIGludGVnZXI6ICR7dmFsdWV9YCApO1xuICAgIHJldHVybiBuZXcgRnJhY3Rpb24oIHRoaXMubnVtZXJhdG9yLCB0aGlzLmRlbm9taW5hdG9yICogdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIGNvbnN0cnVjdGluZyBhIGZyYWN0aW9uIGZyb20gYW4gaW50ZWdlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUludGVnZXIoIHZhbHVlOiBudW1iZXIgKTogRnJhY3Rpb24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIHZhbHVlICksIGB2YWx1ZSBpcyBub3QgYW4gaW50ZWdlcjogJHt2YWx1ZX1gICk7XG4gICAgcmV0dXJuIG5ldyBGcmFjdGlvbiggdmFsdWUsIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgbnVtYmVyIGludG8gYSBGcmFjdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tRGVjaW1hbCggdmFsdWU6IG51bWJlciApOiBGcmFjdGlvbiB7XG5cbiAgICBpZiAoIE51bWJlci5pc0ludGVnZXIoIHZhbHVlICkgKSB7XG4gICAgICByZXR1cm4gRnJhY3Rpb24uZnJvbUludGVnZXIoIHZhbHVlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBHZXQgdGhlIGRlY2ltYWwgcGFydCBvZiB0aGUgbnVtYmVyLlxuICAgICAgY29uc3QgZGVjaW1hbCA9IHZhbHVlIC0gVXRpbHMudG9GaXhlZE51bWJlciggdmFsdWUsIDAgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlY2ltYWwgIT09IDAsICdleHBlY3RlZCBkZWNpbWFsIHRvIGJlIG5vbi16ZXJvJyApO1xuXG4gICAgICAvLyBDb252ZXJ0IHRoZSBkZWNpbWFsIHBhcnQgaW50byBhbiBpbnRlZ2VyLiBUaGlzIGJlY29tZXMgdGhlIGRlbm9taW5hdG9yLlxuICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBNYXRoLnBvdyggMTAsIFV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggZGVjaW1hbCApICk7XG5cbiAgICAgIC8vIENvbXB1dGUgbnVtZXJhdG9yXG4gICAgICBjb25zdCBudW1lcmF0b3IgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSAqIGRlbm9taW5hdG9yLCAwICk7XG5cbiAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24oIG51bWVyYXRvciwgZGVub21pbmF0b3IgKS5yZWR1Y2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplcyB0aGlzIEZyYWN0aW9uIGluc3RhbmNlLlxuICAgKi9cbiAgcHVibGljIHRvU3RhdGVPYmplY3QoKTogRnJhY3Rpb25TdGF0ZU9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG51bWVyYXRvcjogdGhpcy5fbnVtZXJhdG9yLFxuICAgICAgZGVub21pbmF0b3I6IHRoaXMuX2Rlbm9taW5hdG9yXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXNlcmlhbGl6ZXMgYSBGcmFjdGlvbiBmcm9tIFBoRVQtaU8gc3RhdGUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Q6IEZyYWN0aW9uU3RhdGVPYmplY3QgKTogRnJhY3Rpb24ge1xuICAgIHJldHVybiBuZXcgRnJhY3Rpb24oIHN0YXRlT2JqZWN0Lm51bWVyYXRvciwgc3RhdGVPYmplY3QuZGVub21pbmF0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJT1R5cGUgZm9yIEZyYWN0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBGcmFjdGlvbklPID0gbmV3IElPVHlwZTxGcmFjdGlvbiwgRnJhY3Rpb25TdGF0ZU9iamVjdD4oICdGcmFjdGlvbklPJywge1xuICAgIHZhbHVlVHlwZTogRnJhY3Rpb24sXG4gICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgIG51bWVyYXRvcjogTnVtYmVySU8sXG4gICAgICBkZW5vbWluYXRvcjogTnVtYmVySU9cbiAgICB9LFxuICAgIHRvU3RhdGVPYmplY3Q6ICggZnJhY3Rpb246IEZyYWN0aW9uICkgPT4gZnJhY3Rpb24udG9TdGF0ZU9iamVjdCgpLFxuICAgIGZyb21TdGF0ZU9iamVjdDogKCBzdGF0ZU9iamVjdDogRnJhY3Rpb25TdGF0ZU9iamVjdCApID0+IEZyYWN0aW9uLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKVxuICB9ICk7XG59XG5cbi8vIFVzZWQgdG8gYXZvaWQgR0MuIE5PVEU6IERvIE5PVCBtb3ZlIGluIGZyb250IG9mIHRoZSBjb25zdHJ1Y3RvciwgYXMgaXQgaXMgY3JlYXRpbmcgYSBjb3B5IG9mIHRoZSB0eXBlIGRlZmluZWQuXG5jb25zdCBTQ1JBVENIX0ZSQUNUSU9OID0gbmV3IEZyYWN0aW9uKCAxLCAxICk7XG5cbnBoZXRjb21tb24ucmVnaXN0ZXIoICdGcmFjdGlvbicsIEZyYWN0aW9uICk7Il0sIm5hbWVzIjpbIlV0aWxzIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJwaGV0Y29tbW9uIiwiRnJhY3Rpb24iLCJudW1lcmF0b3IiLCJ2YWx1ZSIsImFzc2VydCIsIk51bWJlciIsImlzSW50ZWdlciIsIl9udW1lcmF0b3IiLCJkZW5vbWluYXRvciIsIl9kZW5vbWluYXRvciIsImdldFZhbHVlIiwidG9TdHJpbmciLCJjb3B5IiwicmVkdWNlIiwiZ2NkIiwicm91bmRTeW1tZXRyaWMiLCJyZWR1Y2VkIiwiaXNSZWR1Y2VkIiwiZXF1YWxzIiwiZnJhY3Rpb24iLCJpc0xlc3NUaGFuIiwiU0NSQVRDSF9GUkFDVElPTiIsInNldCIsInN1YnRyYWN0Iiwic2lnbiIsIk1hdGgiLCJhYnMiLCJzZXRUb1N1bSIsIm51bWVyYXRvcjEiLCJkZW5vbWluYXRvcjEiLCJudW1lcmF0b3IyIiwiZGVub21pbmF0b3IyIiwibGNtIiwiYWRkIiwicGx1cyIsIm1pbnVzIiwibXVsdGlwbHkiLCJ0aW1lcyIsImRpdmlkZSIsImRpdmlkZWQiLCJwbHVzSW50ZWdlciIsIm1pbnVzSW50ZWdlciIsInRpbWVzSW50ZWdlciIsImRpdmlkZWRJbnRlZ2VyIiwiZnJvbUludGVnZXIiLCJmcm9tRGVjaW1hbCIsImRlY2ltYWwiLCJ0b0ZpeGVkTnVtYmVyIiwicG93IiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwidG9TdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiWkVSTyIsIk9ORSIsIkZyYWN0aW9uSU8iLCJ2YWx1ZVR5cGUiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELE9BQU9DLGdCQUFnQixtQkFBbUI7QUFPM0IsSUFBQSxBQUFNQyxXQUFOLE1BQU1BO0lBaUJuQjs7R0FFQyxHQUNELElBQVdDLFVBQVdDLEtBQWEsRUFBRztRQUNwQ0MsVUFBVUEsT0FBUUMsT0FBT0MsU0FBUyxDQUFFSCxRQUFTLENBQUMsOEJBQThCLEVBQUVBLE9BQU87UUFDckYsSUFBSSxDQUFDSSxVQUFVLEdBQUdKO0lBQ3BCO0lBRUE7O0dBRUMsR0FDRCxJQUFXRCxZQUFvQjtRQUFFLE9BQU8sSUFBSSxDQUFDSyxVQUFVO0lBQUU7SUFFekQ7O0dBRUMsR0FDRCxJQUFXQyxZQUFhTCxLQUFhLEVBQUc7UUFDdENDLFVBQVVBLE9BQVFDLE9BQU9DLFNBQVMsQ0FBRUgsUUFBUyxDQUFDLGdDQUFnQyxFQUFFQSxPQUFPO1FBQ3ZGLElBQUksQ0FBQ00sWUFBWSxHQUFHTjtJQUN0QjtJQUVBOztHQUVDLEdBQ0QsSUFBV0ssY0FBc0I7UUFBRSxPQUFPLElBQUksQ0FBQ0MsWUFBWTtJQUFFO0lBRTdEOzs7R0FHQyxHQUNELEFBQU9DLFdBQW1CO1FBQ3hCLE9BQU8sSUFBSSxDQUFDUixTQUFTLEdBQUcsSUFBSSxDQUFDTSxXQUFXO0lBQzFDO0lBRUEsSUFBV0wsUUFBZ0I7UUFBRSxPQUFPLElBQUksQ0FBQ08sUUFBUTtJQUFJO0lBRXJEOztHQUVDLEdBQ0QsQUFBT0osWUFBcUI7UUFDMUIsT0FBUyxJQUFJLENBQUNK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