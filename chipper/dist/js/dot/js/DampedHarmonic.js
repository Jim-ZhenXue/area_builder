// Copyright 2023, University of Colorado Boulder
/**
 * Solves for a specific solution of a damped harmonic oscillator
 * (https://en.wikipedia.org/wiki/Harmonic_oscillator#Damped_harmonic_oscillator), given the initial value and
 * derivative.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import dot from './dot.js';
let SolutionType = class SolutionType extends EnumerationValue {
};
SolutionType.OVER_DAMPED = new SolutionType();
SolutionType.UNDER_DAMPED = new SolutionType();
SolutionType.CRITICALLY_DAMPED = new SolutionType();
SolutionType.UNKNOWN = new SolutionType();
SolutionType.enumeration = new Enumeration(SolutionType);
let DampedHarmonic = class DampedHarmonic {
    /**
   * Returns the value of x(t) determined by the differential equation and initial conditions.
   */ getValue(t) {
        if (this.solutionType === SolutionType.CRITICALLY_DAMPED) {
            assert && assert(this.angularFrequency !== undefined);
            return (this.c1 + this.c2 * t) * Math.exp(-this.angularFrequency * t);
        } else if (this.solutionType === SolutionType.UNDER_DAMPED) {
            assert && assert(this.frequency !== undefined);
            const theta = this.frequency * t;
            return Math.exp(-(this.dampingConstant / 2) * t) * (this.c1 * Math.cos(theta) + this.c2 * Math.sin(theta));
        } else if (this.solutionType === SolutionType.OVER_DAMPED) {
            assert && assert(this.positiveRoot !== undefined);
            assert && assert(this.negativeRoot !== undefined);
            return this.c1 * Math.exp(this.negativeRoot * t) + this.c2 * Math.exp(this.positiveRoot * t);
        } else {
            throw new Error('Unknown solution type?');
        }
    }
    /**
   * Returns the value of x'(t) determined by the differential equation and initial conditions.
   */ getDerivative(t) {
        if (this.solutionType === SolutionType.CRITICALLY_DAMPED) {
            assert && assert(this.angularFrequency !== undefined);
            return Math.exp(-this.angularFrequency * t) * (this.c2 - this.angularFrequency * (this.c1 + this.c2 * t));
        } else if (this.solutionType === SolutionType.UNDER_DAMPED) {
            assert && assert(this.frequency !== undefined);
            const theta = this.frequency * t;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);
            const term1 = this.frequency * (this.c2 * cos - this.c1 * sin);
            const term2 = 0.5 * this.dampingConstant * (this.c1 * cos + this.c2 * sin);
            return Math.exp(-0.5 * this.dampingConstant * t) * (term1 - term2);
        } else if (this.solutionType === SolutionType.OVER_DAMPED) {
            assert && assert(this.positiveRoot !== undefined);
            assert && assert(this.negativeRoot !== undefined);
            return this.c1 * this.negativeRoot * Math.exp(this.negativeRoot * t) + this.c2 * this.positiveRoot * Math.exp(this.positiveRoot * t);
        } else {
            throw new Error('Unknown solution type?');
        }
    }
    /**
   * For solving ax'' + bx' + cx = 0 with initial conditions x(0) and x'(0).
   *
   * @param a - Coefficient in front of the second derivative.
   * @param b - Coefficient in front of the first derivative, responsible for the amount of damping applied.
   * @param c - Coefficient in front of the current value, responsible for the amount of force towards equilibrium.
   * @param initialValue - The value of x(0), i.e. the initial position at t=0.
   * @param initialDerivative - The value of x'(0), i.e. the initial velocity at t=0;
   */ constructor(a, b, c, initialValue, initialDerivative){
        assert && assert(isFinite(a) && a !== 0);
        assert && assert(isFinite(b));
        assert && assert(isFinite(c) && c !== 0);
        assert && assert(isFinite(initialValue));
        assert && assert(isFinite(initialDerivative));
        // We'll transform into the simpler: x'' + dampingConstant x' + angularFrequencySquared x = 0
        this.dampingConstant = b / a;
        this.angularFrequencySquared = c / a;
        assert && assert(this.dampingConstant >= 0, 'a and b should share the same sign');
        assert && assert(this.angularFrequencySquared > 0, 'a and c should share the same sign');
        // Determines what type of solution is required.
        this.discriminant = this.dampingConstant * this.dampingConstant - 4 * this.angularFrequencySquared;
        this.solutionType = SolutionType.UNKNOWN; // will be filled in below
        // Constants that determine what linear combination of solutions satisfies the initial conditions
        this.c1 = 0;
        this.c2 = 0;
        if (Math.abs(this.discriminant) < 1e-5) {
            this.solutionType = SolutionType.CRITICALLY_DAMPED;
            this.angularFrequency = Math.sqrt(this.angularFrequencySquared);
            this.c1 = initialValue;
            this.c2 = initialDerivative + this.angularFrequency * initialValue;
        } else if (this.discriminant < 0) {
            this.solutionType = SolutionType.UNDER_DAMPED;
            this.frequency = 0.5 * Math.sqrt(-this.discriminant);
            this.c1 = initialValue;
            this.c2 = this.dampingConstant * initialValue / (2 * this.frequency) + initialDerivative / this.frequency;
        } else {
            this.solutionType = SolutionType.OVER_DAMPED;
            this.positiveRoot = 0.5 * (-this.dampingConstant + Math.sqrt(this.discriminant));
            this.negativeRoot = 0.5 * (-this.dampingConstant - Math.sqrt(this.discriminant));
            this.c2 = (this.negativeRoot * initialValue - initialDerivative) / (this.negativeRoot - this.positiveRoot);
            this.c1 = initialValue - this.c2;
        }
    }
};
dot.register('DampedHarmonic', DampedHarmonic);
export default DampedHarmonic;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EYW1wZWRIYXJtb25pYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU29sdmVzIGZvciBhIHNwZWNpZmljIHNvbHV0aW9uIG9mIGEgZGFtcGVkIGhhcm1vbmljIG9zY2lsbGF0b3JcbiAqIChodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXJtb25pY19vc2NpbGxhdG9yI0RhbXBlZF9oYXJtb25pY19vc2NpbGxhdG9yKSwgZ2l2ZW4gdGhlIGluaXRpYWwgdmFsdWUgYW5kXG4gKiBkZXJpdmF0aXZlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG5jbGFzcyBTb2x1dGlvblR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPVkVSX0RBTVBFRCA9IG5ldyBTb2x1dGlvblR5cGUoKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBVTkRFUl9EQU1QRUQgPSBuZXcgU29sdXRpb25UeXBlKCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ1JJVElDQUxMWV9EQU1QRUQgPSBuZXcgU29sdXRpb25UeXBlKCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVU5LTk9XTiA9IG5ldyBTb2x1dGlvblR5cGUoKTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBTb2x1dGlvblR5cGUgKTtcbn1cblxuY2xhc3MgRGFtcGVkSGFybW9uaWMge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGFtcGluZ0NvbnN0YW50OiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQ6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNjcmltaW5hbnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBzb2x1dGlvblR5cGU6IFNvbHV0aW9uVHlwZTtcbiAgcHJpdmF0ZSByZWFkb25seSBjMTogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGMyOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgYW5ndWxhckZyZXF1ZW5jeT86IG51bWJlcjsgLy8gaWYgY3JpdGljYWxseSBkYW1wZWRcbiAgcHJpdmF0ZSByZWFkb25seSBmcmVxdWVuY3k/OiBudW1iZXI7IC8vIGlmIHVuZGVyLWRhbXBlZFxuICBwcml2YXRlIHJlYWRvbmx5IHBvc2l0aXZlUm9vdD86IG51bWJlcjsgLy8gaWYgb3Zlci1kYW1wZWRcbiAgcHJpdmF0ZSByZWFkb25seSBuZWdhdGl2ZVJvb3Q/OiBudW1iZXI7IC8vIGlmIG92ZXItZGFtcGVkXG5cbiAgLyoqXG4gICAqIEZvciBzb2x2aW5nIGF4JycgKyBieCcgKyBjeCA9IDAgd2l0aCBpbml0aWFsIGNvbmRpdGlvbnMgeCgwKSBhbmQgeCcoMCkuXG4gICAqXG4gICAqIEBwYXJhbSBhIC0gQ29lZmZpY2llbnQgaW4gZnJvbnQgb2YgdGhlIHNlY29uZCBkZXJpdmF0aXZlLlxuICAgKiBAcGFyYW0gYiAtIENvZWZmaWNpZW50IGluIGZyb250IG9mIHRoZSBmaXJzdCBkZXJpdmF0aXZlLCByZXNwb25zaWJsZSBmb3IgdGhlIGFtb3VudCBvZiBkYW1waW5nIGFwcGxpZWQuXG4gICAqIEBwYXJhbSBjIC0gQ29lZmZpY2llbnQgaW4gZnJvbnQgb2YgdGhlIGN1cnJlbnQgdmFsdWUsIHJlc3BvbnNpYmxlIGZvciB0aGUgYW1vdW50IG9mIGZvcmNlIHRvd2FyZHMgZXF1aWxpYnJpdW0uXG4gICAqIEBwYXJhbSBpbml0aWFsVmFsdWUgLSBUaGUgdmFsdWUgb2YgeCgwKSwgaS5lLiB0aGUgaW5pdGlhbCBwb3NpdGlvbiBhdCB0PTAuXG4gICAqIEBwYXJhbSBpbml0aWFsRGVyaXZhdGl2ZSAtIFRoZSB2YWx1ZSBvZiB4JygwKSwgaS5lLiB0aGUgaW5pdGlhbCB2ZWxvY2l0eSBhdCB0PTA7XG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIsIGluaXRpYWxWYWx1ZTogbnVtYmVyLCBpbml0aWFsRGVyaXZhdGl2ZTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBhICkgJiYgYSAhPT0gMCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBiICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYyApICYmIGMgIT09IDAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaW5pdGlhbFZhbHVlICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaW5pdGlhbERlcml2YXRpdmUgKSApO1xuXG4gICAgLy8gV2UnbGwgdHJhbnNmb3JtIGludG8gdGhlIHNpbXBsZXI6IHgnJyArIGRhbXBpbmdDb25zdGFudCB4JyArIGFuZ3VsYXJGcmVxdWVuY3lTcXVhcmVkIHggPSAwXG4gICAgdGhpcy5kYW1waW5nQ29uc3RhbnQgPSBiIC8gYTtcbiAgICB0aGlzLmFuZ3VsYXJGcmVxdWVuY3lTcXVhcmVkID0gYyAvIGE7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRhbXBpbmdDb25zdGFudCA+PSAwLCAnYSBhbmQgYiBzaG91bGQgc2hhcmUgdGhlIHNhbWUgc2lnbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFuZ3VsYXJGcmVxdWVuY3lTcXVhcmVkID4gMCwgJ2EgYW5kIGMgc2hvdWxkIHNoYXJlIHRoZSBzYW1lIHNpZ24nICk7XG5cbiAgICAvLyBEZXRlcm1pbmVzIHdoYXQgdHlwZSBvZiBzb2x1dGlvbiBpcyByZXF1aXJlZC5cbiAgICB0aGlzLmRpc2NyaW1pbmFudCA9IHRoaXMuZGFtcGluZ0NvbnN0YW50ICogdGhpcy5kYW1waW5nQ29uc3RhbnQgLSA0ICogdGhpcy5hbmd1bGFyRnJlcXVlbmN5U3F1YXJlZDtcblxuICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLlVOS05PV047IC8vIHdpbGwgYmUgZmlsbGVkIGluIGJlbG93XG5cbiAgICAvLyBDb25zdGFudHMgdGhhdCBkZXRlcm1pbmUgd2hhdCBsaW5lYXIgY29tYmluYXRpb24gb2Ygc29sdXRpb25zIHNhdGlzZmllcyB0aGUgaW5pdGlhbCBjb25kaXRpb25zXG4gICAgdGhpcy5jMSA9IDA7XG4gICAgdGhpcy5jMiA9IDA7XG5cbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmRpc2NyaW1pbmFudCApIDwgMWUtNSApIHtcbiAgICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLkNSSVRJQ0FMTFlfREFNUEVEO1xuXG4gICAgICB0aGlzLmFuZ3VsYXJGcmVxdWVuY3kgPSBNYXRoLnNxcnQoIHRoaXMuYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQgKTtcblxuICAgICAgdGhpcy5jMSA9IGluaXRpYWxWYWx1ZTtcbiAgICAgIHRoaXMuYzIgPSBpbml0aWFsRGVyaXZhdGl2ZSArIHRoaXMuYW5ndWxhckZyZXF1ZW5jeSAqIGluaXRpYWxWYWx1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuZGlzY3JpbWluYW50IDwgMCApIHtcbiAgICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLlVOREVSX0RBTVBFRDtcblxuICAgICAgdGhpcy5mcmVxdWVuY3kgPSAwLjUgKiBNYXRoLnNxcnQoIC10aGlzLmRpc2NyaW1pbmFudCApO1xuXG4gICAgICB0aGlzLmMxID0gaW5pdGlhbFZhbHVlO1xuICAgICAgdGhpcy5jMiA9ICggdGhpcy5kYW1waW5nQ29uc3RhbnQgKiBpbml0aWFsVmFsdWUgKSAvICggMiAqIHRoaXMuZnJlcXVlbmN5ICkgKyBpbml0aWFsRGVyaXZhdGl2ZSAvIHRoaXMuZnJlcXVlbmN5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc29sdXRpb25UeXBlID0gU29sdXRpb25UeXBlLk9WRVJfREFNUEVEO1xuXG4gICAgICB0aGlzLnBvc2l0aXZlUm9vdCA9IDAuNSAqICggLXRoaXMuZGFtcGluZ0NvbnN0YW50ICsgTWF0aC5zcXJ0KCB0aGlzLmRpc2NyaW1pbmFudCApICk7XG4gICAgICB0aGlzLm5lZ2F0aXZlUm9vdCA9IDAuNSAqICggLXRoaXMuZGFtcGluZ0NvbnN0YW50IC0gTWF0aC5zcXJ0KCB0aGlzLmRpc2NyaW1pbmFudCApICk7XG5cbiAgICAgIHRoaXMuYzIgPSAoIHRoaXMubmVnYXRpdmVSb290ICogaW5pdGlhbFZhbHVlIC0gaW5pdGlhbERlcml2YXRpdmUgKSAvICggdGhpcy5uZWdhdGl2ZVJvb3QgLSB0aGlzLnBvc2l0aXZlUm9vdCApO1xuICAgICAgdGhpcy5jMSA9IGluaXRpYWxWYWx1ZSAtIHRoaXMuYzI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHgodCkgZGV0ZXJtaW5lZCBieSB0aGUgZGlmZmVyZW50aWFsIGVxdWF0aW9uIGFuZCBpbml0aWFsIGNvbmRpdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0VmFsdWUoIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5DUklUSUNBTExZX0RBTVBFRCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYW5ndWxhckZyZXF1ZW5jeSAhPT0gdW5kZWZpbmVkICk7XG5cbiAgICAgIHJldHVybiAoIHRoaXMuYzEgKyB0aGlzLmMyICogdCApICogTWF0aC5leHAoIC10aGlzLmFuZ3VsYXJGcmVxdWVuY3khICogdCApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5VTkRFUl9EQU1QRUQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZyZXF1ZW5jeSAhPT0gdW5kZWZpbmVkICk7XG5cbiAgICAgIGNvbnN0IHRoZXRhID0gdGhpcy5mcmVxdWVuY3khICogdDtcbiAgICAgIHJldHVybiBNYXRoLmV4cCggLSggdGhpcy5kYW1waW5nQ29uc3RhbnQgLyAyICkgKiB0ICkgKiAoIHRoaXMuYzEgKiBNYXRoLmNvcyggdGhldGEgKSArIHRoaXMuYzIgKiBNYXRoLnNpbiggdGhldGEgKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5zb2x1dGlvblR5cGUgPT09IFNvbHV0aW9uVHlwZS5PVkVSX0RBTVBFRCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucG9zaXRpdmVSb290ICE9PSB1bmRlZmluZWQgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubmVnYXRpdmVSb290ICE9PSB1bmRlZmluZWQgKTtcblxuICAgICAgcmV0dXJuIHRoaXMuYzEgKiBNYXRoLmV4cCggdGhpcy5uZWdhdGl2ZVJvb3QhICogdCApICsgdGhpcy5jMiAqIE1hdGguZXhwKCB0aGlzLnBvc2l0aXZlUm9vdCEgKiB0ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVW5rbm93biBzb2x1dGlvbiB0eXBlPycgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgeCcodCkgZGV0ZXJtaW5lZCBieSB0aGUgZGlmZmVyZW50aWFsIGVxdWF0aW9uIGFuZCBpbml0aWFsIGNvbmRpdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0RGVyaXZhdGl2ZSggdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLkNSSVRJQ0FMTFlfREFNUEVEICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hbmd1bGFyRnJlcXVlbmN5ICE9PSB1bmRlZmluZWQgKTtcblxuICAgICAgcmV0dXJuIE1hdGguZXhwKCAtdGhpcy5hbmd1bGFyRnJlcXVlbmN5ISAqIHQgKSAqICggdGhpcy5jMiAtIHRoaXMuYW5ndWxhckZyZXF1ZW5jeSEgKiAoIHRoaXMuYzEgKyB0aGlzLmMyICogdCApICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLlVOREVSX0RBTVBFRCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZnJlcXVlbmN5ICE9PSB1bmRlZmluZWQgKTtcblxuICAgICAgY29uc3QgdGhldGEgPSB0aGlzLmZyZXF1ZW5jeSEgKiB0O1xuICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoIHRoZXRhICk7XG4gICAgICBjb25zdCBzaW4gPSBNYXRoLnNpbiggdGhldGEgKTtcbiAgICAgIGNvbnN0IHRlcm0xID0gdGhpcy5mcmVxdWVuY3khICogKCB0aGlzLmMyICogY29zIC0gdGhpcy5jMSAqIHNpbiApO1xuICAgICAgY29uc3QgdGVybTIgPSAwLjUgKiB0aGlzLmRhbXBpbmdDb25zdGFudCAqICggdGhpcy5jMSAqIGNvcyArIHRoaXMuYzIgKiBzaW4gKTtcbiAgICAgIHJldHVybiBNYXRoLmV4cCggLTAuNSAqIHRoaXMuZGFtcGluZ0NvbnN0YW50ICogdCApICogKCB0ZXJtMSAtIHRlcm0yICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLnNvbHV0aW9uVHlwZSA9PT0gU29sdXRpb25UeXBlLk9WRVJfREFNUEVEICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb3NpdGl2ZVJvb3QgIT09IHVuZGVmaW5lZCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5uZWdhdGl2ZVJvb3QgIT09IHVuZGVmaW5lZCApO1xuXG4gICAgICByZXR1cm4gdGhpcy5jMSAqIHRoaXMubmVnYXRpdmVSb290ISAqIE1hdGguZXhwKCB0aGlzLm5lZ2F0aXZlUm9vdCEgKiB0ICkgKyB0aGlzLmMyICogdGhpcy5wb3NpdGl2ZVJvb3QhICogTWF0aC5leHAoIHRoaXMucG9zaXRpdmVSb290ISAqIHQgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdVbmtub3duIHNvbHV0aW9uIHR5cGU/JyApO1xuICAgIH1cbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdEYW1wZWRIYXJtb25pYycsIERhbXBlZEhhcm1vbmljICk7XG5cbmV4cG9ydCBkZWZhdWx0IERhbXBlZEhhcm1vbmljOyJdLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJkb3QiLCJTb2x1dGlvblR5cGUiLCJPVkVSX0RBTVBFRCIsIlVOREVSX0RBTVBFRCIsIkNSSVRJQ0FMTFlfREFNUEVEIiwiVU5LTk9XTiIsImVudW1lcmF0aW9uIiwiRGFtcGVkSGFybW9uaWMiLCJnZXRWYWx1ZSIsInQiLCJzb2x1dGlvblR5cGUiLCJhc3NlcnQiLCJhbmd1bGFyRnJlcXVlbmN5IiwidW5kZWZpbmVkIiwiYzEiLCJjMiIsIk1hdGgiLCJleHAiLCJmcmVxdWVuY3kiLCJ0aGV0YSIsImRhbXBpbmdDb25zdGFudCIsImNvcyIsInNpbiIsInBvc2l0aXZlUm9vdCIsIm5lZ2F0aXZlUm9vdCIsIkVycm9yIiwiZ2V0RGVyaXZhdGl2ZSIsInRlcm0xIiwidGVybTIiLCJhIiwiYiIsImMiLCJpbml0aWFsVmFsdWUiLCJpbml0aWFsRGVyaXZhdGl2ZSIsImlzRmluaXRlIiwiYW5ndWxhckZyZXF1ZW5jeVNxdWFyZWQiLCJkaXNjcmltaW5hbnQiLCJhYnMiLCJzcXJ0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7O0NBTUMsR0FFRCxPQUFP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