// Copyright 2013-2024, University of Colorado Boulder
/**
 * A complex number with mutable and immutable methods.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import dot from './dot.js';
import Utils from './Utils.js';
let Complex = class Complex {
    /**
   * Creates a copy of this complex, or if a complex is passed in, set that complex's values to ours.
   *
   * This is the immutable form of the function set(), if a complex is provided. This will return a new complex, and
   * will not modify this complex.
   *
   * @param [complex] - If not provided, creates a new Complex with filled in values. Otherwise, fills
   *                              in the values of the provided complex so that it equals this complex.
   */ copy(complex) {
        if (complex) {
            return complex.set(this);
        } else {
            return new Complex(this.real, this.imaginary);
        }
    }
    /**
   * The phase / argument of the complex number.
   */ phase() {
        return Math.atan2(this.imaginary, this.real);
    }
    /**
   * The magnitude (Euclidean/L2 Norm) of this complex number, i.e. $\sqrt{a^2+b^2}$.
   */ getMagnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    get magnitude() {
        return this.getMagnitude();
    }
    /**
   * The squared magnitude (square of the Euclidean/L2 Norm) of this complex, i.e. $a^2+b^2$.
   */ getMagnitudeSquared() {
        return this.real * this.real + this.imaginary * this.imaginary;
    }
    get magnitudeSquared() {
        return this.getMagnitudeSquared();
    }
    /**
   * Returns the argument of this complex number (immutable)
   */ getArgument() {
        return Math.atan2(this.imaginary, this.real);
    }
    get argument() {
        return this.getArgument();
    }
    /**
   * Exact equality comparison between this Complex and another Complex.
   *
   * @returns Whether the two complex numbers have equal components
   */ equals(other) {
        return this.real === other.real && this.imaginary === other.imaginary;
    }
    /**
   * Approximate equality comparison between this Complex and another Complex.
   *
   * @returns - Whether difference between the two complex numbers has no component with an absolute value
   *            greater than epsilon.
   */ equalsEpsilon(other, epsilon = 0) {
        return Math.max(Math.abs(this.real - other.real), Math.abs(this.imaginary - other.imaginary)) <= epsilon;
    }
    /**
   * Addition of this Complex and another Complex, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new Complex, and will not modify
   * this Complex.
   */ plus(c) {
        return new Complex(this.real + c.real, this.imaginary + c.imaginary);
    }
    /**
   * Subtraction of this Complex by another Complex c, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new Complex, and will not modify
   * this Complex.
   */ minus(c) {
        return new Complex(this.real - c.real, this.imaginary - c.imaginary);
    }
    /**
   * Complex multiplication.
   * Immutable version of multiply
   */ times(c) {
        return new Complex(this.real * c.real - this.imaginary * c.imaginary, this.real * c.imaginary + this.imaginary * c.real);
    }
    /**
   * Complex division.
   * Immutable version of divide
   */ dividedBy(c) {
        const cMag = c.magnitudeSquared;
        return new Complex((this.real * c.real + this.imaginary * c.imaginary) / cMag, (this.imaginary * c.real - this.real * c.imaginary) / cMag);
    }
    /**
   * Complex negation
   * Immutable version of negate
   */ negated() {
        return new Complex(-this.real, -this.imaginary);
    }
    /**
   * Square root.
   * Immutable form of sqrt.
   *
   */ sqrtOf() {
        const mag = this.magnitude;
        return new Complex(Math.sqrt((mag + this.real) / 2), (this.imaginary >= 0 ? 1 : -1) * Math.sqrt((mag - this.real) / 2));
    }
    /**
   * Returns the power of this complex number by a real number.
   */ powerByReal(realPower) {
        const magTimes = Math.pow(this.magnitude, realPower);
        const angle = realPower * this.phase();
        return new Complex(magTimes * Math.cos(angle), magTimes * Math.sin(angle));
    }
    /**
   * Sine.
   * Immutable form of sin.
   *
   */ sinOf() {
        return new Complex(Math.sin(this.real) * Utils.cosh(this.imaginary), Math.cos(this.real) * Utils.sinh(this.imaginary));
    }
    /**
   * Cosine.
   * Immutable form of cos.
   *
   */ cosOf() {
        return new Complex(Math.cos(this.real) * Utils.cosh(this.imaginary), -Math.sin(this.real) * Utils.sinh(this.imaginary));
    }
    /**
   * Returns the square of this complex number and does not modify it.
   * This is the immutable version of square.
   *
   */ squared() {
        return this.times(this);
    }
    /**
   * Complex conjugate.
   * Immutable form of conjugate
   *
   */ conjugated() {
        return new Complex(this.real, -this.imaginary);
    }
    /**
   * Takes e to the power of this complex number. $e^{a+bi}=e^a\cos b + i\sin b$.
   * This is the immutable form of exponentiate.
   *
   */ exponentiated() {
        return Complex.createPolar(Math.exp(this.real), this.imaginary);
    }
    /*** Mutable functions ***/ /**
   * Sets all components of this complex, returning this
   *
   */ setRealImaginary(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
        return this;
    }
    /**
   * Sets the real component of this complex, returning this
   */ setReal(real) {
        this.real = real;
        return this;
    }
    /**
   * Sets the imaginary component of this complex, returning this
   */ setImaginary(imaginary) {
        this.imaginary = imaginary;
        return this;
    }
    /**
   * Sets the components of this complex to be a copy of the parameter
   *
   * This is the mutable form of the function copy(). This will mutate (change) this complex, in addition to returning
   * this complex itself.
   */ set(c) {
        return this.setRealImaginary(c.real, c.imaginary);
    }
    /**
   * Sets this Complex's value to be the a,b values matching the given magnitude and phase (in radians), changing
   * this Complex, and returning itself.
   *
   * @param magnitude
   * @param phase - In radians
   */ setPolar(magnitude, phase) {
        return this.setRealImaginary(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
    }
    /**
   * Addition of this Complex and another Complex, returning a copy.
   *
   * This is the mutable form of the function plus(). This will modify and return this.
   */ add(c) {
        return this.setRealImaginary(this.real + c.real, this.imaginary + c.imaginary);
    }
    /**
   * Subtraction of another Complex from this Complex, returning a copy.
   *
   * This is the mutable form of the function minus(). This will modify and return this.
   */ subtract(c) {
        return this.setRealImaginary(this.real - c.real, this.imaginary - c.imaginary);
    }
    /**
   * Mutable Complex multiplication.
   */ multiply(c) {
        return this.setRealImaginary(this.real * c.real - this.imaginary * c.imaginary, this.real * c.imaginary + this.imaginary * c.real);
    }
    /**
   * Mutable Complex division. The immutable form is dividedBy.
   */ divide(c) {
        const cMag = c.magnitudeSquared;
        return this.setRealImaginary((this.real * c.real + this.imaginary * c.imaginary) / cMag, (this.imaginary * c.real - this.real * c.imaginary) / cMag);
    }
    /**
   * Mutable Complex negation
   *
   */ negate() {
        return this.setRealImaginary(-this.real, -this.imaginary);
    }
    /**
   * Sets this Complex to e to the power of this complex number. $e^{a+bi}=e^a\cos b + i\sin b$.
   * This is the mutable version of exponentiated
   *
   */ exponentiate() {
        return this.setPolar(Math.exp(this.real), this.imaginary);
    }
    /**
   * Squares this complex number.
   * This is the mutable version of squared.
   *
   */ square() {
        return this.multiply(this);
    }
    /**
   * Square root.
   * Mutable form of sqrtOf.
   *
   */ sqrt() {
        const mag = this.magnitude;
        return this.setRealImaginary(Math.sqrt((mag + this.real) / 2), (this.imaginary >= 0 ? 1 : -1) * Math.sqrt((mag - this.real) / 2));
    }
    /**
   * Sine.
   * Mutable form of sinOf.
   *
   */ sin() {
        return this.setRealImaginary(Math.sin(this.real) * Utils.cosh(this.imaginary), Math.cos(this.real) * Utils.sinh(this.imaginary));
    }
    /**
   * Cosine.
   * Mutable form of cosOf.
   *
   */ cos() {
        return this.setRealImaginary(Math.cos(this.real) * Utils.cosh(this.imaginary), -Math.sin(this.real) * Utils.sinh(this.imaginary));
    }
    /**
   * Complex conjugate.
   * Mutable form of conjugated
   *
   */ conjugate() {
        return this.setRealImaginary(this.real, -this.imaginary);
    }
    /**
   * Returns the cube roots of this complex number.
   */ getCubeRoots() {
        const arg3 = this.argument / 3;
        const abs = this.magnitude;
        const really = Complex.real(Math.cbrt(abs));
        const principal = really.times(Complex.imaginary(arg3).exponentiate());
        return [
            principal,
            really.times(Complex.imaginary(arg3 + Math.PI * 2 / 3).exponentiate()),
            really.times(Complex.imaginary(arg3 - Math.PI * 2 / 3).exponentiate())
        ];
    }
    /**
   * Debugging string for the complex number (provides real and imaginary parts).
   */ toString() {
        return `Complex(${this.real}, ${this.imaginary})`;
    }
    /**
   * Constructs a complex number from just the real part (assuming the imaginary part is 0).
   */ static real(real) {
        return new Complex(real, 0);
    }
    /**
   * Constructs a complex number from just the imaginary part (assuming the real part is 0).
   */ static imaginary(imaginary) {
        return new Complex(0, imaginary);
    }
    /**
   * Constructs a complex number from the polar form. For a magnitude $r$ and phase $\varphi$, this will be
   * $\cos\varphi+i r\sin\varphi$.
   */ static createPolar(magnitude, phase) {
        return new Complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
    }
    /**
   * Returns an array of the roots of the quadratic equation $ax + b=0$, or null if every value is a solution.
   *
   * @returns The roots of the equation, or null if all values are roots.
   */ static solveLinearRoots(a, b) {
        if (a.equals(Complex.ZERO)) {
            return b.equals(Complex.ZERO) ? null : [];
        }
        return [
            b.dividedBy(a).negate()
        ];
    }
    /**
   * Returns an array of the roots of the quadratic equation $ax^2 + bx + c=0$, or null if every value is a
   * solution.
   *
   * @returns The roots of the equation, or null if all values are roots (if multiplicity>1, returns multiple copies)
   */ static solveQuadraticRoots(a, b, c) {
        if (a.equals(Complex.ZERO)) {
            return Complex.solveLinearRoots(b, c);
        }
        const denom = Complex.real(2).multiply(a);
        const d1 = b.times(b);
        const d2 = Complex.real(4).multiply(a).multiply(c);
        const discriminant = d1.subtract(d2).sqrt();
        return [
            discriminant.minus(b).divide(denom),
            discriminant.negated().subtract(b).divide(denom)
        ];
    }
    /**
   * Returns an array of the roots of the cubic equation $ax^3 + bx^2 + cx + d=0$, or null if every value is a
   * solution.
   *
   * @returns The roots of the equation, or null if all values are roots (if multiplicity>1, returns multiple copies)
   */ static solveCubicRoots(a, b, c, d) {
        if (a.equals(Complex.ZERO)) {
            return Complex.solveQuadraticRoots(b, c, d);
        }
        const denom = a.times(Complex.real(3)).negate();
        const a2 = a.times(a);
        const b2 = b.times(b);
        const b3 = b2.times(b);
        const c2 = c.times(c);
        const c3 = c2.times(c);
        const abc = a.times(b).times(c);
        // TODO: factor out constant numeric values https://github.com/phetsims/dot/issues/96
        const D0_1 = b2;
        const D0_2 = a.times(c).times(Complex.real(3));
        const D1_1 = b3.times(Complex.real(2)).add(a2.times(d).multiply(Complex.real(27)));
        const D1_2 = abc.times(Complex.real(9));
        if (D0_1.equals(D0_2) && D1_1.equals(D1_2)) {
            const tripleRoot = b.divide(denom);
            return [
                tripleRoot,
                tripleRoot,
                tripleRoot
            ];
        }
        const Delta0 = D0_1.minus(D0_2);
        const Delta1 = D1_1.minus(D1_2);
        const discriminant1 = abc.times(d).multiply(Complex.real(18)).add(b2.times(c2));
        const discriminant2 = b3.times(d).multiply(Complex.real(4)).add(c3.times(a).multiply(Complex.real(4))).add(a2.times(d).multiply(d).multiply(Complex.real(27)));
        if (discriminant1.equals(discriminant2)) {
            const simpleRoot = abc.times(Complex.real(4)).subtract(b3.plus(a2.times(d).multiply(Complex.real(9)))).divide(a.times(Delta0));
            const doubleRoot = a.times(d).multiply(Complex.real(9)).subtract(b.times(c)).divide(Delta0.times(Complex.real(2)));
            return [
                simpleRoot,
                doubleRoot,
                doubleRoot
            ];
        }
        let Ccubed;
        if (D0_1.equals(D0_2)) {
            Ccubed = Delta1;
        } else {
            Ccubed = Delta1.plus(Delta1.times(Delta1).subtract(Delta0.times(Delta0).multiply(Delta0).multiply(Complex.real(4))).sqrt()).divide(Complex.real(2));
        }
        return Ccubed.getCubeRoots().map((root)=>{
            return b.plus(root).add(Delta0.dividedBy(root)).divide(denom);
        });
    }
    /**
   * Creates a complex number, that has both a real and imaginary part.
   *
   * @param real - The real part. For a complex number $a+bi$, this should be $a$.
   * @param imaginary - The imaginary part. For a complex number $a+bi$, this should be $b$.
   */ constructor(real, imaginary){
        this.real = real;
        this.imaginary = imaginary;
    }
};
/**
   * Immutable constant $0$.
   * @constant
   */ Complex.ZERO = new Complex(0, 0);
/**
   * Immutable constant $1$.
   * @constant
   */ Complex.ONE = new Complex(1, 0);
/**
   * Immutable constant $i$, the imaginary unit.
   * @constant
   */ Complex.I = new Complex(0, 1);
export { Complex as default };
dot.register('Complex', Complex);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Db21wbGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgY29tcGxleCBudW1iZXIgd2l0aCBtdXRhYmxlIGFuZCBpbW11dGFibGUgbWV0aG9kcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wbGV4IHtcblxuICAvLyBUaGUgcmVhbCBwYXJ0LiBGb3IgYSBjb21wbGV4IG51bWJlciAkYStiaSQsIHRoaXMgaXMgJGEkLlxuICBwdWJsaWMgcmVhbDogbnVtYmVyO1xuXG4gIC8vIFRoZSBpbWFnaW5hcnkgcGFydC4gRm9yIGEgY29tcGxleCBudW1iZXIgJGErYmkkLCB0aGlzIGlzICRiJC5cbiAgcHVibGljIGltYWdpbmFyeTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29tcGxleCBudW1iZXIsIHRoYXQgaGFzIGJvdGggYSByZWFsIGFuZCBpbWFnaW5hcnkgcGFydC5cbiAgICpcbiAgICogQHBhcmFtIHJlYWwgLSBUaGUgcmVhbCBwYXJ0LiBGb3IgYSBjb21wbGV4IG51bWJlciAkYStiaSQsIHRoaXMgc2hvdWxkIGJlICRhJC5cbiAgICogQHBhcmFtIGltYWdpbmFyeSAtIFRoZSBpbWFnaW5hcnkgcGFydC4gRm9yIGEgY29tcGxleCBudW1iZXIgJGErYmkkLCB0aGlzIHNob3VsZCBiZSAkYiQuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHJlYWw6IG51bWJlciwgaW1hZ2luYXJ5OiBudW1iZXIgKSB7XG4gICAgdGhpcy5yZWFsID0gcmVhbDtcbiAgICB0aGlzLmltYWdpbmFyeSA9IGltYWdpbmFyeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIGNvbXBsZXgsIG9yIGlmIGEgY29tcGxleCBpcyBwYXNzZWQgaW4sIHNldCB0aGF0IGNvbXBsZXgncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIGNvbXBsZXggaXMgcHJvdmlkZWQuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgY29tcGxleCwgYW5kXG4gICAqIHdpbGwgbm90IG1vZGlmeSB0aGlzIGNvbXBsZXguXG4gICAqXG4gICAqIEBwYXJhbSBbY29tcGxleF0gLSBJZiBub3QgcHJvdmlkZWQsIGNyZWF0ZXMgYSBuZXcgQ29tcGxleCB3aXRoIGZpbGxlZCBpbiB2YWx1ZXMuIE90aGVyd2lzZSwgZmlsbHNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCBjb21wbGV4IHNvIHRoYXQgaXQgZXF1YWxzIHRoaXMgY29tcGxleC5cbiAgICovXG4gIHB1YmxpYyBjb3B5KCBjb21wbGV4PzogQ29tcGxleCApOiBDb21wbGV4IHtcbiAgICBpZiAoIGNvbXBsZXggKSB7XG4gICAgICByZXR1cm4gY29tcGxleC5zZXQoIHRoaXMgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IENvbXBsZXgoIHRoaXMucmVhbCwgdGhpcy5pbWFnaW5hcnkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHBoYXNlIC8gYXJndW1lbnQgb2YgdGhlIGNvbXBsZXggbnVtYmVyLlxuICAgKi9cbiAgcHVibGljIHBoYXNlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguYXRhbjIoIHRoaXMuaW1hZ2luYXJ5LCB0aGlzLnJlYWwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWFnbml0dWRlIChFdWNsaWRlYW4vTDIgTm9ybSkgb2YgdGhpcyBjb21wbGV4IG51bWJlciwgaS5lLiAkXFxzcXJ0e2FeMitiXjJ9JC5cbiAgICovXG4gIHB1YmxpYyBnZXRNYWduaXR1ZGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLm1hZ25pdHVkZVNxdWFyZWQgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWFnbml0dWRlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNxdWFyZWQgbWFnbml0dWRlIChzcXVhcmUgb2YgdGhlIEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIGNvbXBsZXgsIGkuZS4gJGFeMitiXjIkLlxuICAgKi9cbiAgcHVibGljIGdldE1hZ25pdHVkZVNxdWFyZWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWFsICogdGhpcy5yZWFsICsgdGhpcy5pbWFnaW5hcnkgKiB0aGlzLmltYWdpbmFyeTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlU3F1YXJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcmd1bWVudCBvZiB0aGlzIGNvbXBsZXggbnVtYmVyIChpbW11dGFibGUpXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJndW1lbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggdGhpcy5pbWFnaW5hcnksIHRoaXMucmVhbCApO1xuICB9XG5cbiAgcHVibGljIGdldCBhcmd1bWVudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEFyZ3VtZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogRXhhY3QgZXF1YWxpdHkgY29tcGFyaXNvbiBiZXR3ZWVuIHRoaXMgQ29tcGxleCBhbmQgYW5vdGhlciBDb21wbGV4LlxuICAgKlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSB0d28gY29tcGxleCBudW1iZXJzIGhhdmUgZXF1YWwgY29tcG9uZW50c1xuICAgKi9cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IENvbXBsZXggKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVhbCA9PT0gb3RoZXIucmVhbCAmJiB0aGlzLmltYWdpbmFyeSA9PT0gb3RoZXIuaW1hZ2luYXJ5O1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcHJveGltYXRlIGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIENvbXBsZXggYW5kIGFub3RoZXIgQ29tcGxleC5cbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGNvbXBsZXggbnVtYmVycyBoYXMgbm8gY29tcG9uZW50IHdpdGggYW4gYWJzb2x1dGUgdmFsdWVcbiAgICogICAgICAgICAgICBncmVhdGVyIHRoYW4gZXBzaWxvbi5cbiAgICovXG4gIHB1YmxpYyBlcXVhbHNFcHNpbG9uKCBvdGhlcjogQ29tcGxleCwgZXBzaWxvbiA9IDAgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE1hdGgubWF4KCBNYXRoLmFicyggdGhpcy5yZWFsIC0gb3RoZXIucmVhbCApLCBNYXRoLmFicyggdGhpcy5pbWFnaW5hcnkgLSBvdGhlci5pbWFnaW5hcnkgKSApIDw9IGVwc2lsb247XG4gIH1cblxuICAvKipcbiAgICogQWRkaXRpb24gb2YgdGhpcyBDb21wbGV4IGFuZCBhbm90aGVyIENvbXBsZXgsIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBDb21wbGV4LCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgQ29tcGxleC5cbiAgICovXG4gIHB1YmxpYyBwbHVzKCBjOiBDb21wbGV4ICk6IENvbXBsZXgge1xuICAgIHJldHVybiBuZXcgQ29tcGxleCggdGhpcy5yZWFsICsgYy5yZWFsLCB0aGlzLmltYWdpbmFyeSArIGMuaW1hZ2luYXJ5ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyBDb21wbGV4IGJ5IGFub3RoZXIgQ29tcGxleCBjLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3QoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyBDb21wbGV4LCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgQ29tcGxleC5cbiAgICovXG4gIHB1YmxpYyBtaW51cyggYzogQ29tcGxleCApOiBDb21wbGV4IHtcbiAgICByZXR1cm4gbmV3IENvbXBsZXgoIHRoaXMucmVhbCAtIGMucmVhbCwgdGhpcy5pbWFnaW5hcnkgLSBjLmltYWdpbmFyeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBsZXggbXVsdGlwbGljYXRpb24uXG4gICAqIEltbXV0YWJsZSB2ZXJzaW9uIG9mIG11bHRpcGx5XG4gICAqL1xuICBwdWJsaWMgdGltZXMoIGM6IENvbXBsZXggKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCB0aGlzLnJlYWwgKiBjLnJlYWwgLSB0aGlzLmltYWdpbmFyeSAqIGMuaW1hZ2luYXJ5LCB0aGlzLnJlYWwgKiBjLmltYWdpbmFyeSArIHRoaXMuaW1hZ2luYXJ5ICogYy5yZWFsICk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcGxleCBkaXZpc2lvbi5cbiAgICogSW1tdXRhYmxlIHZlcnNpb24gb2YgZGl2aWRlXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlZEJ5KCBjOiBDb21wbGV4ICk6IENvbXBsZXgge1xuICAgIGNvbnN0IGNNYWcgPSBjLm1hZ25pdHVkZVNxdWFyZWQ7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KFxuICAgICAgKCB0aGlzLnJlYWwgKiBjLnJlYWwgKyB0aGlzLmltYWdpbmFyeSAqIGMuaW1hZ2luYXJ5ICkgLyBjTWFnLFxuICAgICAgKCB0aGlzLmltYWdpbmFyeSAqIGMucmVhbCAtIHRoaXMucmVhbCAqIGMuaW1hZ2luYXJ5ICkgLyBjTWFnXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV4IG5lZ2F0aW9uXG4gICAqIEltbXV0YWJsZSB2ZXJzaW9uIG9mIG5lZ2F0ZVxuICAgKi9cbiAgcHVibGljIG5lZ2F0ZWQoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCAtdGhpcy5yZWFsLCAtdGhpcy5pbWFnaW5hcnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcXVhcmUgcm9vdC5cbiAgICogSW1tdXRhYmxlIGZvcm0gb2Ygc3FydC5cbiAgICpcbiAgICovXG4gIHB1YmxpYyBzcXJ0T2YoKTogQ29tcGxleCB7XG4gICAgY29uc3QgbWFnID0gdGhpcy5tYWduaXR1ZGU7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCBNYXRoLnNxcnQoICggbWFnICsgdGhpcy5yZWFsICkgLyAyICksXG4gICAgICAoIHRoaXMuaW1hZ2luYXJ5ID49IDAgPyAxIDogLTEgKSAqIE1hdGguc3FydCggKCBtYWcgLSB0aGlzLnJlYWwgKSAvIDIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvd2VyIG9mIHRoaXMgY29tcGxleCBudW1iZXIgYnkgYSByZWFsIG51bWJlci5cbiAgICovXG4gIHB1YmxpYyBwb3dlckJ5UmVhbCggcmVhbFBvd2VyOiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgY29uc3QgbWFnVGltZXMgPSBNYXRoLnBvdyggdGhpcy5tYWduaXR1ZGUsIHJlYWxQb3dlciApO1xuICAgIGNvbnN0IGFuZ2xlID0gcmVhbFBvd2VyICogdGhpcy5waGFzZSgpO1xuICAgIHJldHVybiBuZXcgQ29tcGxleChcbiAgICAgIG1hZ1RpbWVzICogTWF0aC5jb3MoIGFuZ2xlICksXG4gICAgICBtYWdUaW1lcyAqIE1hdGguc2luKCBhbmdsZSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaW5lLlxuICAgKiBJbW11dGFibGUgZm9ybSBvZiBzaW4uXG4gICAqXG4gICAqL1xuICBwdWJsaWMgc2luT2YoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KFxuICAgICAgTWF0aC5zaW4oIHRoaXMucmVhbCApICogVXRpbHMuY29zaCggdGhpcy5pbWFnaW5hcnkgKSxcbiAgICAgIE1hdGguY29zKCB0aGlzLnJlYWwgKSAqIFV0aWxzLnNpbmgoIHRoaXMuaW1hZ2luYXJ5IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvc2luZS5cbiAgICogSW1tdXRhYmxlIGZvcm0gb2YgY29zLlxuICAgKlxuICAgKi9cbiAgcHVibGljIGNvc09mKCk6IENvbXBsZXgge1xuICAgIHJldHVybiBuZXcgQ29tcGxleChcbiAgICAgIE1hdGguY29zKCB0aGlzLnJlYWwgKSAqIFV0aWxzLmNvc2goIHRoaXMuaW1hZ2luYXJ5ICksXG4gICAgICAtTWF0aC5zaW4oIHRoaXMucmVhbCApICogVXRpbHMuc2luaCggdGhpcy5pbWFnaW5hcnkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3F1YXJlIG9mIHRoaXMgY29tcGxleCBudW1iZXIgYW5kIGRvZXMgbm90IG1vZGlmeSBpdC5cbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIHZlcnNpb24gb2Ygc3F1YXJlLlxuICAgKlxuICAgKi9cbiAgcHVibGljIHNxdWFyZWQoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMudGltZXMoIHRoaXMgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbXBsZXggY29uanVnYXRlLlxuICAgKiBJbW11dGFibGUgZm9ybSBvZiBjb25qdWdhdGVcbiAgICpcbiAgICovXG4gIHB1YmxpYyBjb25qdWdhdGVkKCk6IENvbXBsZXgge1xuICAgIHJldHVybiBuZXcgQ29tcGxleCggdGhpcy5yZWFsLCAtdGhpcy5pbWFnaW5hcnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBlIHRvIHRoZSBwb3dlciBvZiB0aGlzIGNvbXBsZXggbnVtYmVyLiAkZV57YStiaX09ZV5hXFxjb3MgYiArIGlcXHNpbiBiJC5cbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgZXhwb25lbnRpYXRlLlxuICAgKlxuICAgKi9cbiAgcHVibGljIGV4cG9uZW50aWF0ZWQoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIENvbXBsZXguY3JlYXRlUG9sYXIoIE1hdGguZXhwKCB0aGlzLnJlYWwgKSwgdGhpcy5pbWFnaW5hcnkgKTtcbiAgfVxuXG4gIC8qKiogTXV0YWJsZSBmdW5jdGlvbnMgKioqL1xuXG4gIC8qKlxuICAgKiBTZXRzIGFsbCBjb21wb25lbnRzIG9mIHRoaXMgY29tcGxleCwgcmV0dXJuaW5nIHRoaXNcbiAgICpcbiAgICovXG4gIHB1YmxpYyBzZXRSZWFsSW1hZ2luYXJ5KCByZWFsOiBudW1iZXIsIGltYWdpbmFyeTogbnVtYmVyICk6IENvbXBsZXgge1xuICAgIHRoaXMucmVhbCA9IHJlYWw7XG4gICAgdGhpcy5pbWFnaW5hcnkgPSBpbWFnaW5hcnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcmVhbCBjb21wb25lbnQgb2YgdGhpcyBjb21wbGV4LCByZXR1cm5pbmcgdGhpc1xuICAgKi9cbiAgcHVibGljIHNldFJlYWwoIHJlYWw6IG51bWJlciApOiBDb21wbGV4IHtcbiAgICB0aGlzLnJlYWwgPSByZWFsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdpbmFyeSBjb21wb25lbnQgb2YgdGhpcyBjb21wbGV4LCByZXR1cm5pbmcgdGhpc1xuICAgKi9cbiAgcHVibGljIHNldEltYWdpbmFyeSggaW1hZ2luYXJ5OiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgdGhpcy5pbWFnaW5hcnkgPSBpbWFnaW5hcnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29tcG9uZW50cyBvZiB0aGlzIGNvbXBsZXggdG8gYmUgYSBjb3B5IG9mIHRoZSBwYXJhbWV0ZXJcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBjb3B5KCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyBjb21wbGV4LCBpbiBhZGRpdGlvbiB0byByZXR1cm5pbmdcbiAgICogdGhpcyBjb21wbGV4IGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXQoIGM6IENvbXBsZXggKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeSggYy5yZWFsLCBjLmltYWdpbmFyeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBDb21wbGV4J3MgdmFsdWUgdG8gYmUgdGhlIGEsYiB2YWx1ZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIG1hZ25pdHVkZSBhbmQgcGhhc2UgKGluIHJhZGlhbnMpLCBjaGFuZ2luZ1xuICAgKiB0aGlzIENvbXBsZXgsIGFuZCByZXR1cm5pbmcgaXRzZWxmLlxuICAgKlxuICAgKiBAcGFyYW0gbWFnbml0dWRlXG4gICAqIEBwYXJhbSBwaGFzZSAtIEluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRQb2xhciggbWFnbml0dWRlOiBudW1iZXIsIHBoYXNlOiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeSggbWFnbml0dWRlICogTWF0aC5jb3MoIHBoYXNlICksIG1hZ25pdHVkZSAqIE1hdGguc2luKCBwaGFzZSApICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkaXRpb24gb2YgdGhpcyBDb21wbGV4IGFuZCBhbm90aGVyIENvbXBsZXgsIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcGx1cygpLiBUaGlzIHdpbGwgbW9kaWZ5IGFuZCByZXR1cm4gdGhpcy5cbiAgICovXG4gIHB1YmxpYyBhZGQoIGM6IENvbXBsZXggKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeSggdGhpcy5yZWFsICsgYy5yZWFsLCB0aGlzLmltYWdpbmFyeSArIGMuaW1hZ2luYXJ5ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgYW5vdGhlciBDb21wbGV4IGZyb20gdGhpcyBDb21wbGV4LCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG1pbnVzKCkuIFRoaXMgd2lsbCBtb2RpZnkgYW5kIHJldHVybiB0aGlzLlxuICAgKi9cbiAgcHVibGljIHN1YnRyYWN0KCBjOiBDb21wbGV4ICk6IENvbXBsZXgge1xuICAgIHJldHVybiB0aGlzLnNldFJlYWxJbWFnaW5hcnkoIHRoaXMucmVhbCAtIGMucmVhbCwgdGhpcy5pbWFnaW5hcnkgLSBjLmltYWdpbmFyeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11dGFibGUgQ29tcGxleCBtdWx0aXBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggYzogQ29tcGxleCApOiBDb21wbGV4IHtcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KFxuICAgICAgdGhpcy5yZWFsICogYy5yZWFsIC0gdGhpcy5pbWFnaW5hcnkgKiBjLmltYWdpbmFyeSxcbiAgICAgIHRoaXMucmVhbCAqIGMuaW1hZ2luYXJ5ICsgdGhpcy5pbWFnaW5hcnkgKiBjLnJlYWwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdXRhYmxlIENvbXBsZXggZGl2aXNpb24uIFRoZSBpbW11dGFibGUgZm9ybSBpcyBkaXZpZGVkQnkuXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlKCBjOiBDb21wbGV4ICk6IENvbXBsZXgge1xuICAgIGNvbnN0IGNNYWcgPSBjLm1hZ25pdHVkZVNxdWFyZWQ7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeShcbiAgICAgICggdGhpcy5yZWFsICogYy5yZWFsICsgdGhpcy5pbWFnaW5hcnkgKiBjLmltYWdpbmFyeSApIC8gY01hZyxcbiAgICAgICggdGhpcy5pbWFnaW5hcnkgKiBjLnJlYWwgLSB0aGlzLnJlYWwgKiBjLmltYWdpbmFyeSApIC8gY01hZ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogTXV0YWJsZSBDb21wbGV4IG5lZ2F0aW9uXG4gICAqXG4gICAqL1xuICBwdWJsaWMgbmVnYXRlKCk6IENvbXBsZXgge1xuICAgIHJldHVybiB0aGlzLnNldFJlYWxJbWFnaW5hcnkoIC10aGlzLnJlYWwsIC10aGlzLmltYWdpbmFyeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBDb21wbGV4IHRvIGUgdG8gdGhlIHBvd2VyIG9mIHRoaXMgY29tcGxleCBudW1iZXIuICRlXnthK2JpfT1lXmFcXGNvcyBiICsgaVxcc2luIGIkLlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIHZlcnNpb24gb2YgZXhwb25lbnRpYXRlZFxuICAgKlxuICAgKi9cbiAgcHVibGljIGV4cG9uZW50aWF0ZSgpOiBDb21wbGV4IHtcbiAgICByZXR1cm4gdGhpcy5zZXRQb2xhciggTWF0aC5leHAoIHRoaXMucmVhbCApLCB0aGlzLmltYWdpbmFyeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNxdWFyZXMgdGhpcyBjb21wbGV4IG51bWJlci5cbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSB2ZXJzaW9uIG9mIHNxdWFyZWQuXG4gICAqXG4gICAqL1xuICBwdWJsaWMgc3F1YXJlKCk6IENvbXBsZXgge1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5KCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogU3F1YXJlIHJvb3QuXG4gICAqIE11dGFibGUgZm9ybSBvZiBzcXJ0T2YuXG4gICAqXG4gICAqL1xuICBwdWJsaWMgc3FydCgpOiBDb21wbGV4IHtcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICByZXR1cm4gdGhpcy5zZXRSZWFsSW1hZ2luYXJ5KCBNYXRoLnNxcnQoICggbWFnICsgdGhpcy5yZWFsICkgLyAyICksXG4gICAgICAoIHRoaXMuaW1hZ2luYXJ5ID49IDAgPyAxIDogLTEgKSAqIE1hdGguc3FydCggKCBtYWcgLSB0aGlzLnJlYWwgKSAvIDIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbmUuXG4gICAqIE11dGFibGUgZm9ybSBvZiBzaW5PZi5cbiAgICpcbiAgICovXG4gIHB1YmxpYyBzaW4oKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeShcbiAgICAgIE1hdGguc2luKCB0aGlzLnJlYWwgKSAqIFV0aWxzLmNvc2goIHRoaXMuaW1hZ2luYXJ5ICksXG4gICAgICBNYXRoLmNvcyggdGhpcy5yZWFsICkgKiBVdGlscy5zaW5oKCB0aGlzLmltYWdpbmFyeSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3NpbmUuXG4gICAqIE11dGFibGUgZm9ybSBvZiBjb3NPZi5cbiAgICpcbiAgICovXG4gIHB1YmxpYyBjb3MoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeShcbiAgICAgIE1hdGguY29zKCB0aGlzLnJlYWwgKSAqIFV0aWxzLmNvc2goIHRoaXMuaW1hZ2luYXJ5ICksXG4gICAgICAtTWF0aC5zaW4oIHRoaXMucmVhbCApICogVXRpbHMuc2luaCggdGhpcy5pbWFnaW5hcnkgKVxuICAgICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb21wbGV4IGNvbmp1Z2F0ZS5cbiAgICogTXV0YWJsZSBmb3JtIG9mIGNvbmp1Z2F0ZWRcbiAgICpcbiAgICovXG4gIHB1YmxpYyBjb25qdWdhdGUoKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0UmVhbEltYWdpbmFyeSggdGhpcy5yZWFsLCAtdGhpcy5pbWFnaW5hcnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdWJlIHJvb3RzIG9mIHRoaXMgY29tcGxleCBudW1iZXIuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q3ViZVJvb3RzKCk6IENvbXBsZXhbXSB7XG4gICAgY29uc3QgYXJnMyA9IHRoaXMuYXJndW1lbnQgLyAzO1xuICAgIGNvbnN0IGFicyA9IHRoaXMubWFnbml0dWRlO1xuXG4gICAgY29uc3QgcmVhbGx5ID0gQ29tcGxleC5yZWFsKCBNYXRoLmNicnQoIGFicyApICk7XG5cbiAgICBjb25zdCBwcmluY2lwYWwgPSByZWFsbHkudGltZXMoIENvbXBsZXguaW1hZ2luYXJ5KCBhcmczICkuZXhwb25lbnRpYXRlKCkgKTtcblxuICAgIHJldHVybiBbXG4gICAgICBwcmluY2lwYWwsXG4gICAgICByZWFsbHkudGltZXMoIENvbXBsZXguaW1hZ2luYXJ5KCBhcmczICsgTWF0aC5QSSAqIDIgLyAzICkuZXhwb25lbnRpYXRlKCkgKSxcbiAgICAgIHJlYWxseS50aW1lcyggQ29tcGxleC5pbWFnaW5hcnkoIGFyZzMgLSBNYXRoLlBJICogMiAvIDMgKS5leHBvbmVudGlhdGUoKSApXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1Z2dpbmcgc3RyaW5nIGZvciB0aGUgY29tcGxleCBudW1iZXIgKHByb3ZpZGVzIHJlYWwgYW5kIGltYWdpbmFyeSBwYXJ0cykuXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYENvbXBsZXgoJHt0aGlzLnJlYWx9LCAke3RoaXMuaW1hZ2luYXJ5fSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjb21wbGV4IG51bWJlciBmcm9tIGp1c3QgdGhlIHJlYWwgcGFydCAoYXNzdW1pbmcgdGhlIGltYWdpbmFyeSBwYXJ0IGlzIDApLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFsKCByZWFsOiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCByZWFsLCAwICk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIGNvbXBsZXggbnVtYmVyIGZyb20ganVzdCB0aGUgaW1hZ2luYXJ5IHBhcnQgKGFzc3VtaW5nIHRoZSByZWFsIHBhcnQgaXMgMCkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGltYWdpbmFyeSggaW1hZ2luYXJ5OiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCAwLCBpbWFnaW5hcnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY29tcGxleCBudW1iZXIgZnJvbSB0aGUgcG9sYXIgZm9ybS4gRm9yIGEgbWFnbml0dWRlICRyJCBhbmQgcGhhc2UgJFxcdmFycGhpJCwgdGhpcyB3aWxsIGJlXG4gICAqICRcXGNvc1xcdmFycGhpK2kgclxcc2luXFx2YXJwaGkkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVQb2xhciggbWFnbml0dWRlOiBudW1iZXIsIHBoYXNlOiBudW1iZXIgKTogQ29tcGxleCB7XG4gICAgcmV0dXJuIG5ldyBDb21wbGV4KCBtYWduaXR1ZGUgKiBNYXRoLmNvcyggcGhhc2UgKSwgbWFnbml0dWRlICogTWF0aC5zaW4oIHBoYXNlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSByb290cyBvZiB0aGUgcXVhZHJhdGljIGVxdWF0aW9uICRheCArIGI9MCQsIG9yIG51bGwgaWYgZXZlcnkgdmFsdWUgaXMgYSBzb2x1dGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc29sdmVMaW5lYXJSb290cyggYTogQ29tcGxleCwgYjogQ29tcGxleCApOiBDb21wbGV4W10gfCBudWxsIHtcbiAgICBpZiAoIGEuZXF1YWxzKCBDb21wbGV4LlpFUk8gKSApIHtcbiAgICAgIHJldHVybiBiLmVxdWFscyggQ29tcGxleC5aRVJPICkgPyBudWxsIDogW107XG4gICAgfVxuXG4gICAgcmV0dXJuIFsgYi5kaXZpZGVkQnkoIGEgKS5uZWdhdGUoKSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIHJvb3RzIG9mIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gJGF4XjIgKyBieCArIGM9MCQsIG9yIG51bGwgaWYgZXZlcnkgdmFsdWUgaXMgYVxuICAgKiBzb2x1dGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cyAoaWYgbXVsdGlwbGljaXR5PjEsIHJldHVybnMgbXVsdGlwbGUgY29waWVzKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzb2x2ZVF1YWRyYXRpY1Jvb3RzKCBhOiBDb21wbGV4LCBiOiBDb21wbGV4LCBjOiBDb21wbGV4ICk6IENvbXBsZXhbXSB8IG51bGwge1xuICAgIGlmICggYS5lcXVhbHMoIENvbXBsZXguWkVSTyApICkge1xuICAgICAgcmV0dXJuIENvbXBsZXguc29sdmVMaW5lYXJSb290cyggYiwgYyApO1xuICAgIH1cblxuICAgIGNvbnN0IGRlbm9tID0gQ29tcGxleC5yZWFsKCAyICkubXVsdGlwbHkoIGEgKTtcbiAgICBjb25zdCBkMSA9IGIudGltZXMoIGIgKTtcbiAgICBjb25zdCBkMiA9IENvbXBsZXgucmVhbCggNCApLm11bHRpcGx5KCBhICkubXVsdGlwbHkoIGMgKTtcbiAgICBjb25zdCBkaXNjcmltaW5hbnQgPSBkMS5zdWJ0cmFjdCggZDIgKS5zcXJ0KCk7XG4gICAgcmV0dXJuIFtcbiAgICAgIGRpc2NyaW1pbmFudC5taW51cyggYiApLmRpdmlkZSggZGVub20gKSxcbiAgICAgIGRpc2NyaW1pbmFudC5uZWdhdGVkKCkuc3VidHJhY3QoIGIgKS5kaXZpZGUoIGRlbm9tIClcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIHJvb3RzIG9mIHRoZSBjdWJpYyBlcXVhdGlvbiAkYXheMyArIGJ4XjIgKyBjeCArIGQ9MCQsIG9yIG51bGwgaWYgZXZlcnkgdmFsdWUgaXMgYVxuICAgKiBzb2x1dGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cyAoaWYgbXVsdGlwbGljaXR5PjEsIHJldHVybnMgbXVsdGlwbGUgY29waWVzKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzb2x2ZUN1YmljUm9vdHMoIGE6IENvbXBsZXgsIGI6IENvbXBsZXgsIGM6IENvbXBsZXgsIGQ6IENvbXBsZXggKTogQ29tcGxleFtdIHwgbnVsbCB7XG4gICAgaWYgKCBhLmVxdWFscyggQ29tcGxleC5aRVJPICkgKSB7XG4gICAgICByZXR1cm4gQ29tcGxleC5zb2x2ZVF1YWRyYXRpY1Jvb3RzKCBiLCBjLCBkICk7XG4gICAgfVxuXG4gICAgY29uc3QgZGVub20gPSBhLnRpbWVzKCBDb21wbGV4LnJlYWwoIDMgKSApLm5lZ2F0ZSgpO1xuICAgIGNvbnN0IGEyID0gYS50aW1lcyggYSApO1xuICAgIGNvbnN0IGIyID0gYi50aW1lcyggYiApO1xuICAgIGNvbnN0IGIzID0gYjIudGltZXMoIGIgKTtcbiAgICBjb25zdCBjMiA9IGMudGltZXMoIGMgKTtcbiAgICBjb25zdCBjMyA9IGMyLnRpbWVzKCBjICk7XG4gICAgY29uc3QgYWJjID0gYS50aW1lcyggYiApLnRpbWVzKCBjICk7XG5cbiAgICAvLyBUT0RPOiBmYWN0b3Igb3V0IGNvbnN0YW50IG51bWVyaWMgdmFsdWVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG5cbiAgICBjb25zdCBEMF8xID0gYjI7XG4gICAgY29uc3QgRDBfMiA9IGEudGltZXMoIGMgKS50aW1lcyggQ29tcGxleC5yZWFsKCAzICkgKTtcbiAgICBjb25zdCBEMV8xID0gYjMudGltZXMoIENvbXBsZXgucmVhbCggMiApICkuYWRkKCBhMi50aW1lcyggZCApLm11bHRpcGx5KCBDb21wbGV4LnJlYWwoIDI3ICkgKSApO1xuICAgIGNvbnN0IEQxXzIgPSBhYmMudGltZXMoIENvbXBsZXgucmVhbCggOSApICk7XG5cbiAgICBpZiAoIEQwXzEuZXF1YWxzKCBEMF8yICkgJiYgRDFfMS5lcXVhbHMoIEQxXzIgKSApIHtcbiAgICAgIGNvbnN0IHRyaXBsZVJvb3QgPSBiLmRpdmlkZSggZGVub20gKTtcbiAgICAgIHJldHVybiBbIHRyaXBsZVJvb3QsIHRyaXBsZVJvb3QsIHRyaXBsZVJvb3QgXTtcbiAgICB9XG5cbiAgICBjb25zdCBEZWx0YTAgPSBEMF8xLm1pbnVzKCBEMF8yICk7XG4gICAgY29uc3QgRGVsdGExID0gRDFfMS5taW51cyggRDFfMiApO1xuXG4gICAgY29uc3QgZGlzY3JpbWluYW50MSA9IGFiYy50aW1lcyggZCApLm11bHRpcGx5KCBDb21wbGV4LnJlYWwoIDE4ICkgKS5hZGQoIGIyLnRpbWVzKCBjMiApICk7XG4gICAgY29uc3QgZGlzY3JpbWluYW50MiA9IGIzLnRpbWVzKCBkICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggNCApIClcbiAgICAgIC5hZGQoIGMzLnRpbWVzKCBhICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggNCApICkgKVxuICAgICAgLmFkZCggYTIudGltZXMoIGQgKS5tdWx0aXBseSggZCApLm11bHRpcGx5KCBDb21wbGV4LnJlYWwoIDI3ICkgKSApO1xuXG4gICAgaWYgKCBkaXNjcmltaW5hbnQxLmVxdWFscyggZGlzY3JpbWluYW50MiApICkge1xuICAgICAgY29uc3Qgc2ltcGxlUm9vdCA9IChcbiAgICAgICAgYWJjLnRpbWVzKCBDb21wbGV4LnJlYWwoIDQgKSApLnN1YnRyYWN0KCBiMy5wbHVzKCBhMi50aW1lcyggZCApLm11bHRpcGx5KCBDb21wbGV4LnJlYWwoIDkgKSApICkgKVxuICAgICAgKS5kaXZpZGUoIGEudGltZXMoIERlbHRhMCApICk7XG4gICAgICBjb25zdCBkb3VibGVSb290ID0gKCBhLnRpbWVzKCBkICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggOSApICkuc3VidHJhY3QoIGIudGltZXMoIGMgKSApICkuZGl2aWRlKCBEZWx0YTAudGltZXMoIENvbXBsZXgucmVhbCggMiApICkgKTtcbiAgICAgIHJldHVybiBbIHNpbXBsZVJvb3QsIGRvdWJsZVJvb3QsIGRvdWJsZVJvb3QgXTtcbiAgICB9XG4gICAgbGV0IENjdWJlZDtcbiAgICBpZiAoIEQwXzEuZXF1YWxzKCBEMF8yICkgKSB7XG4gICAgICBDY3ViZWQgPSBEZWx0YTE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgQ2N1YmVkID0gRGVsdGExLnBsdXMoICggRGVsdGExLnRpbWVzKCBEZWx0YTEgKS5zdWJ0cmFjdCggRGVsdGEwLnRpbWVzKCBEZWx0YTAgKS5tdWx0aXBseSggRGVsdGEwICkubXVsdGlwbHkoIENvbXBsZXgucmVhbCggNCApICkgKSApLnNxcnQoKSApLmRpdmlkZSggQ29tcGxleC5yZWFsKCAyICkgKTtcbiAgICB9XG4gICAgcmV0dXJuIENjdWJlZC5nZXRDdWJlUm9vdHMoKS5tYXAoIHJvb3QgPT4ge1xuICAgICAgcmV0dXJuIGIucGx1cyggcm9vdCApLmFkZCggRGVsdGEwLmRpdmlkZWRCeSggcm9vdCApICkuZGl2aWRlKCBkZW5vbSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbW11dGFibGUgY29uc3RhbnQgJDAkLlxuICAgKiBAY29uc3RhbnRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgWkVSTyA9IG5ldyBDb21wbGV4KCAwLCAwICk7XG5cbiAgLyoqXG4gICAqIEltbXV0YWJsZSBjb25zdGFudCAkMSQuXG4gICAqIEBjb25zdGFudFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPTkUgPSBuZXcgQ29tcGxleCggMSwgMCApO1xuXG4gIC8qKlxuICAgKiBJbW11dGFibGUgY29uc3RhbnQgJGkkLCB0aGUgaW1hZ2luYXJ5IHVuaXQuXG4gICAqIEBjb25zdGFudFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJID0gbmV3IENvbXBsZXgoIDAsIDEgKTtcbn1cblxuZG90LnJlZ2lzdGVyKCAnQ29tcGxleCcsIENvbXBsZXggKTsiXSwibmFtZXMiOlsiZG90IiwiVXRpbHMiLCJDb21wbGV4IiwiY29weSIsImNvbXBsZXgiLCJzZXQiLCJyZWFsIiwiaW1hZ2luYXJ5IiwicGhhc2UiLCJNYXRoIiwiYXRhbjIiLCJnZXRNYWduaXR1ZGUiLCJzcXJ0IiwibWFnbml0dWRlU3F1YXJlZCIsIm1hZ25pdHVkZSIsImdldE1hZ25pdHVkZVNxdWFyZWQiLCJnZXRBcmd1bWVudCIsImFyZ3VtZW50IiwiZXF1YWxzIiwib3RoZXIiLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsIm1heCIsImFicyIsInBsdXMiLCJjIiwibWludXMiLCJ0aW1lcyIsImRpdmlkZWRCeSIsImNNYWciLCJuZWdhdGVkIiwic3FydE9mIiwibWFnIiwicG93ZXJCeVJlYWwiLCJyZWFsUG93ZXIiLCJtYWdUaW1lcyIsInBvdyIsImFuZ2xlIiwiY29zIiwic2luIiwic2luT2YiLCJjb3NoIiwic2luaCIsImNvc09mIiwic3F1YXJlZCIsImNvbmp1Z2F0ZWQiLCJleHBvbmVudGlhdGVkIiwiY3JlYXRlUG9sYXIiLCJleHAiLCJzZXRSZWFsSW1hZ2luYXJ5Iiwic2V0UmVhbCIsInNldEltYWdpbmFyeSIsInNldFBvbGFyIiwiYWRkIiwic3VidHJhY3QiLCJtdWx0aXBseSIsImRpdmlkZSIsIm5lZ2F0ZSIsImV4cG9uZW50aWF0ZSIsInNxdWFyZSIsImNvbmp1Z2F0ZSIsImdldEN1YmVSb290cyIsImFyZzMiLCJyZWFsbHkiLCJjYnJ0IiwicHJpbmNpcGFsIiwiUEkiLCJ0b1N0cmluZyIsInNvbHZlTGluZWFyUm9vdHMiLCJhIiwiYiIsIlpFUk8iLCJzb2x2ZVF1YWRyYXRpY1Jvb3RzIiwiZGVub20iLCJkMSIsImQyIiwiZGlzY3JpbWluYW50Iiwic29sdmVDdWJpY1Jvb3RzIiwiZCIsImEyIiwiYjIiLCJiMyIsImMyIiwiYzMiLCJhYmMiLCJEMF8xIiwiRDBfMiIsIkQxXzEiLCJEMV8yIiwidHJpcGxlUm9vdCIsIkRlbHRhMCIsIkRlbHRhMSIsImRpc2NyaW1pbmFudDEiLCJkaXNjcmltaW5hbnQyIiwic2ltcGxlUm9vdCIsImRvdWJsZVJvb3QiLCJDY3ViZWQiLCJtYXAiLCJyb290IiwiT05FIiwiSSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFFaEIsSUFBQSxBQUFNQyxVQUFOLE1BQU1BO0lBbUJuQjs7Ozs7Ozs7R0FRQyxHQUNELEFBQU9DLEtBQU1DLE9BQWlCLEVBQVk7UUFDeEMsSUFBS0EsU0FBVTtZQUNiLE9BQU9BLFFBQVFDLEdBQUcsQ0FBRSxJQUFJO1FBQzFCLE9BQ0s7WUFDSCxPQUFPLElBQUlILFFBQVMsSUFBSSxDQUFDSSxJQUFJLEVBQUUsSUFBSSxDQUFDQyxTQUFTO1FBQy9DO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFFBQWdCO1FBQ3JCLE9BQU9DLEtBQUtDLEtBQUssQ0FBRSxJQUFJLENBQUNILFNBQVMsRUFBRSxJQUFJLENBQUNELElBQUk7SUFDOUM7SUFFQTs7R0FFQyxHQUNELEFBQU9LLGVBQXVCO1FBQzVCLE9BQU9GLEtBQUtHLElBQUksQ0FBRSxJQUFJLENBQUNDLGdCQUFnQjtJQUN6QztJQUVBLElBQVdDLFlBQW9CO1FBQzdCLE9BQU8sSUFBSSxD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