// Copyright 2023, University of Colorado Boulder
/**
 * An Easing represents a function from the range [0,1] => [0,1] where f(0)=0 and f(1)=1. It is helpful for animation,
 * to give a more 'natural' feeling.
 *
 * Contains an implementation of generalized polynomial easing functions (where the 'in' version simply takes the input
 * to a specific power, and other functions are generalized). These should be equivalent to the polynomial tweens that
 * TWEEN.js uses, where t is The linear ratio [0,1] of the animation.
 *
 * TODO #23 create unit tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import twixt from './twixt.js';
let Easing = class Easing {
    /**
   * The "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInValue(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return Math.pow(t, n);
    }
    /**
   * The "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseOutValue(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return 1 - Math.pow(1 - t, n);
    }
    /**
   * The "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInOutValue(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        if (t <= 0.5) {
            return 0.5 * Math.pow(2 * t, n);
        } else {
            return 1 - Easing.polynomialEaseInOutValue(n, 1 - t);
        }
    }
    /**
   * The derivative of the "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return n * Math.pow(t, n - 1);
    }
    /**
   * The derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseOutDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return n * Math.pow(1 - t, n - 1);
    }
    /**
   * The derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInOutDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        if (t <= 0.5) {
            return Math.pow(2, n - 1) * n * Math.pow(t, n - 1);
        } else {
            return Easing.polynomialEaseInOutDerivative(n, 1 - t);
        }
    }
    /**
   * The second derivative of the "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInSecondDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return (n - 1) * n * Math.pow(t, n - 2);
    }
    /**
   * The second derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseOutSecondDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        return -(n - 1) * n * Math.pow(1 - t, n - 2);
    }
    /**
   * The second derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */ static polynomialEaseInOutSecondDerivative(n, t) {
        assert && assert(tIsValid(t), `invalid t: ${t}`);
        if (t <= 0.5) {
            return Math.pow(2, n - 1) * (n - 1) * n * Math.pow(t, n - 2);
        } else {
            return -Easing.polynomialEaseInOutSecondDerivative(n, 1 - t);
        }
    }
    /**
   * Creates a polynomial "in" easing (smooth start)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */ static polynomialEaseIn(n) {
        return new Easing(Easing.polynomialEaseInValue.bind(null, n), Easing.polynomialEaseInDerivative.bind(null, n), Easing.polynomialEaseInSecondDerivative.bind(null, n));
    }
    /**
   * Creates a polynomial "out" easing (smooth end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */ static polynomialEaseOut(n) {
        return new Easing(Easing.polynomialEaseOutValue.bind(null, n), Easing.polynomialEaseOutDerivative.bind(null, n), Easing.polynomialEaseOutSecondDerivative.bind(null, n));
    }
    /**
   * Creates a polynomial "in-out" easing (smooth start and end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */ static polynomialEaseInOut(n) {
        return new Easing(Easing.polynomialEaseInOutValue.bind(null, n), Easing.polynomialEaseInOutDerivative.bind(null, n), Easing.polynomialEaseInOutSecondDerivative.bind(null, n));
    }
    /**
   * Input to the functions should be in the range [0,1], where 0 is the start of an animation, and 1 is the end.
   *
   * @param value - Our easing function (from [0,1] => [0,1])
   * @param derivative - Our easing function's derivative (from [0,1] => *)
   * @param secondDerivative - Our easing function's second derivative (from [0,1] => *)
   */ constructor(value, derivative, secondDerivative){
        this.value = value;
        this.derivative = derivative;
        this.secondDerivative = secondDerivative;
    }
};
// The identity easing
Easing.LINEAR = Easing.polynomialEaseIn(1);
// Quadratic-derived easings (t^2)
Easing.QUADRATIC_IN = Easing.polynomialEaseIn(2);
Easing.QUADRATIC_OUT = Easing.polynomialEaseOut(2);
Easing.QUADRATIC_IN_OUT = Easing.polynomialEaseInOut(2);
// Cubic-derived easings (t^3)
Easing.CUBIC_IN = Easing.polynomialEaseIn(3);
Easing.CUBIC_OUT = Easing.polynomialEaseOut(3);
Easing.CUBIC_IN_OUT = Easing.polynomialEaseInOut(3);
// Quartic-derived easings (t^4)
Easing.QUARTIC_IN = Easing.polynomialEaseIn(4);
Easing.QUARTIC_OUT = Easing.polynomialEaseOut(4);
Easing.QUARTIC_IN_OUT = Easing.polynomialEaseInOut(4);
// Quintic-derived easings (t^5)
Easing.QUINTIC_IN = Easing.polynomialEaseIn(5);
Easing.QUINTIC_OUT = Easing.polynomialEaseOut(5);
Easing.QUINTIC_IN_OUT = Easing.polynomialEaseInOut(5);
/**
 * Verifies that t is valid.
 * @param t - The linear ratio [0,1] of the animation
 */ function tIsValid(t) {
    return typeof t === 'number' && isFinite(t) && t >= 0 && t <= 1;
}
twixt.register('Easing', Easing);
export default Easing;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gRWFzaW5nIHJlcHJlc2VudHMgYSBmdW5jdGlvbiBmcm9tIHRoZSByYW5nZSBbMCwxXSA9PiBbMCwxXSB3aGVyZSBmKDApPTAgYW5kIGYoMSk9MS4gSXQgaXMgaGVscGZ1bCBmb3IgYW5pbWF0aW9uLFxuICogdG8gZ2l2ZSBhIG1vcmUgJ25hdHVyYWwnIGZlZWxpbmcuXG4gKlxuICogQ29udGFpbnMgYW4gaW1wbGVtZW50YXRpb24gb2YgZ2VuZXJhbGl6ZWQgcG9seW5vbWlhbCBlYXNpbmcgZnVuY3Rpb25zICh3aGVyZSB0aGUgJ2luJyB2ZXJzaW9uIHNpbXBseSB0YWtlcyB0aGUgaW5wdXRcbiAqIHRvIGEgc3BlY2lmaWMgcG93ZXIsIGFuZCBvdGhlciBmdW5jdGlvbnMgYXJlIGdlbmVyYWxpemVkKS4gVGhlc2Ugc2hvdWxkIGJlIGVxdWl2YWxlbnQgdG8gdGhlIHBvbHlub21pYWwgdHdlZW5zIHRoYXRcbiAqIFRXRUVOLmpzIHVzZXMsIHdoZXJlIHQgaXMgVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uLlxuICpcbiAqIFRPRE8gIzIzIGNyZWF0ZSB1bml0IHRlc3RzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB0d2l4dCBmcm9tICcuL3R3aXh0LmpzJztcblxudHlwZSBOdW1iZXJGdW5jdGlvbiA9ICggdDogbnVtYmVyICkgPT4gbnVtYmVyO1xuXG5jbGFzcyBFYXNpbmcge1xuXG4gIC8qKlxuICAgKiBJbnB1dCB0byB0aGUgZnVuY3Rpb25zIHNob3VsZCBiZSBpbiB0aGUgcmFuZ2UgWzAsMV0sIHdoZXJlIDAgaXMgdGhlIHN0YXJ0IG9mIGFuIGFuaW1hdGlvbiwgYW5kIDEgaXMgdGhlIGVuZC5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIC0gT3VyIGVhc2luZyBmdW5jdGlvbiAoZnJvbSBbMCwxXSA9PiBbMCwxXSlcbiAgICogQHBhcmFtIGRlcml2YXRpdmUgLSBPdXIgZWFzaW5nIGZ1bmN0aW9uJ3MgZGVyaXZhdGl2ZSAoZnJvbSBbMCwxXSA9PiAqKVxuICAgKiBAcGFyYW0gc2Vjb25kRGVyaXZhdGl2ZSAtIE91ciBlYXNpbmcgZnVuY3Rpb24ncyBzZWNvbmQgZGVyaXZhdGl2ZSAoZnJvbSBbMCwxXSA9PiAqKVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgdmFsdWU6IE51bWJlckZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBkZXJpdmF0aXZlOiBOdW1iZXJGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgc2Vjb25kRGVyaXZhdGl2ZTogTnVtYmVyRnVuY3Rpb24gKSB7XG4gIH1cblxuICAvKipcbiAgICogVGhlIFwicG9seW5vbWlhbCBlYXNlIGluXCIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJblZhbHVlKCBuOiBudW1iZXIsIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XG5cbiAgICByZXR1cm4gTWF0aC5wb3coIHQsIG4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgXCJwb2x5bm9taWFsIGVhc2Ugb3V0XCIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VPdXRWYWx1ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggMSAtIHQsIG4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgXCJwb2x5bm9taWFsIGVhc2UgaW4tb3V0XCIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJbk91dFZhbHVlKCBuOiBudW1iZXIsIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XG5cbiAgICBpZiAoIHQgPD0gMC41ICkge1xuICAgICAgcmV0dXJuIDAuNSAqIE1hdGgucG93KCAyICogdCwgbiApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAxIC0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXRWYWx1ZSggbiwgMSAtIHQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRlcml2YXRpdmUgb2YgdGhlIFwicG9seW5vbWlhbCBlYXNlIGluXCIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJbkRlcml2YXRpdmUoIG46IG51bWJlciwgdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdElzVmFsaWQoIHQgKSwgYGludmFsaWQgdDogJHt0fWAgKTtcblxuICAgIHJldHVybiBuICogTWF0aC5wb3coIHQsIG4gLSAxICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRlcml2YXRpdmUgb2YgdGhlIFwicG9seW5vbWlhbCBlYXNlIG91dFwiIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXG4gICAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlT3V0RGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xuXG4gICAgcmV0dXJuIG4gKiBNYXRoLnBvdyggMSAtIHQsIG4gLSAxICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRlcml2YXRpdmUgb2YgdGhlIFwicG9seW5vbWlhbCBlYXNlIGluLW91dFwiIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXG4gICAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlSW5PdXREZXJpdmF0aXZlKCBuOiBudW1iZXIsIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRJc1ZhbGlkKCB0ICksIGBpbnZhbGlkIHQ6ICR7dH1gICk7XG5cbiAgICBpZiAoIHQgPD0gMC41ICkge1xuICAgICAgcmV0dXJuIE1hdGgucG93KCAyLCBuIC0gMSApICogbiAqIE1hdGgucG93KCB0LCBuIC0gMSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBFYXNpbmcucG9seW5vbWlhbEVhc2VJbk91dERlcml2YXRpdmUoIG4sIDEgLSB0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZWNvbmQgZGVyaXZhdGl2ZSBvZiB0aGUgXCJwb2x5bm9taWFsIGVhc2UgaW5cIiBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG4gLSBUaGUgZGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChkb2VzIG5vdCBoYXZlIHRvIGJlIGFuIGludGVnZXIhKVxuICAgKiBAcGFyYW0gdCAtIFRoZSBsaW5lYXIgcmF0aW8gWzAsMV0gb2YgdGhlIGFuaW1hdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluU2Vjb25kRGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xuXG4gICAgcmV0dXJuICggbiAtIDEgKSAqIG4gKiBNYXRoLnBvdyggdCwgbiAtIDIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc2Vjb25kIGRlcml2YXRpdmUgb2YgdGhlIFwicG9seW5vbWlhbCBlYXNlIG91dFwiIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXG4gICAqIEBwYXJhbSB0IC0gVGhlIGxpbmVhciByYXRpbyBbMCwxXSBvZiB0aGUgYW5pbWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlT3V0U2Vjb25kRGVyaXZhdGl2ZSggbjogbnVtYmVyLCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0SXNWYWxpZCggdCApLCBgaW52YWxpZCB0OiAke3R9YCApO1xuXG4gICAgcmV0dXJuIC0oIG4gLSAxICkgKiBuICogTWF0aC5wb3coIDEgLSB0LCBuIC0gMiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzZWNvbmQgZGVyaXZhdGl2ZSBvZiB0aGUgXCJwb2x5bm9taWFsIGVhc2UgaW4tb3V0XCIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuIC0gVGhlIGRlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAoZG9lcyBub3QgaGF2ZSB0byBiZSBhbiBpbnRlZ2VyISlcbiAgICogQHBhcmFtIHQgLSBUaGUgbGluZWFyIHJhdGlvIFswLDFdIG9mIHRoZSBhbmltYXRpb25cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEVhc2VJbk91dFNlY29uZERlcml2YXRpdmUoIG46IG51bWJlciwgdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdElzVmFsaWQoIHQgKSwgYGludmFsaWQgdDogJHt0fWAgKTtcblxuICAgIGlmICggdCA8PSAwLjUgKSB7XG4gICAgICByZXR1cm4gTWF0aC5wb3coIDIsIG4gLSAxICkgKiAoIG4gLSAxICkgKiBuICogTWF0aC5wb3coIHQsIG4gLSAyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIC1FYXNpbmcucG9seW5vbWlhbEVhc2VJbk91dFNlY29uZERlcml2YXRpdmUoIG4sIDEgLSB0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwb2x5bm9taWFsIFwiaW5cIiBlYXNpbmcgKHNtb290aCBzdGFydClcbiAgICpcbiAgICogQHBhcmFtIG4gLSBUaGUgZGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChkb2VzIG5vdCBoYXZlIHRvIGJlIGFuIGludGVnZXIhKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluKCBuOiBudW1iZXIgKTogRWFzaW5nIHtcbiAgICByZXR1cm4gbmV3IEVhc2luZyhcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZUluVmFsdWUuYmluZCggbnVsbCwgbiApLFxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlSW5EZXJpdmF0aXZlLmJpbmQoIG51bGwsIG4gKSxcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZUluU2Vjb25kRGVyaXZhdGl2ZS5iaW5kKCBudWxsLCBuIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwb2x5bm9taWFsIFwib3V0XCIgZWFzaW5nIChzbW9vdGggZW5kKVxuICAgKlxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWdyZWUgb2YgdGhlIHBvbHlub21pYWwgKGRvZXMgbm90IGhhdmUgdG8gYmUgYW4gaW50ZWdlciEpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHBvbHlub21pYWxFYXNlT3V0KCBuOiBudW1iZXIgKTogRWFzaW5nIHtcbiAgICByZXR1cm4gbmV3IEVhc2luZyhcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZU91dFZhbHVlLmJpbmQoIG51bGwsIG4gKSxcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZU91dERlcml2YXRpdmUuYmluZCggbnVsbCwgbiApLFxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlT3V0U2Vjb25kRGVyaXZhdGl2ZS5iaW5kKCBudWxsLCBuIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwb2x5bm9taWFsIFwiaW4tb3V0XCIgZWFzaW5nIChzbW9vdGggc3RhcnQgYW5kIGVuZClcbiAgICpcbiAgICogQHBhcmFtIG4gLSBUaGUgZGVncmVlIG9mIHRoZSBwb2x5bm9taWFsIChkb2VzIG5vdCBoYXZlIHRvIGJlIGFuIGludGVnZXIhKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsRWFzZUluT3V0KCBuOiBudW1iZXIgKTogRWFzaW5nIHtcbiAgICByZXR1cm4gbmV3IEVhc2luZyhcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0VmFsdWUuYmluZCggbnVsbCwgbiApLFxuICAgICAgRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXREZXJpdmF0aXZlLmJpbmQoIG51bGwsIG4gKSxcbiAgICAgIEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0U2Vjb25kRGVyaXZhdGl2ZS5iaW5kKCBudWxsLCBuIClcbiAgICApO1xuICB9XG5cbiAgLy8gVGhlIGlkZW50aXR5IGVhc2luZ1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IExJTkVBUiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCAxICk7XG5cbiAgLy8gUXVhZHJhdGljLWRlcml2ZWQgZWFzaW5ncyAodF4yKVxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVQURSQVRJQ19JTiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCAyICk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUVVBRFJBVElDX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZU91dCggMiApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVQURSQVRJQ19JTl9PVVQgPSBFYXNpbmcucG9seW5vbWlhbEVhc2VJbk91dCggMiApO1xuXG4gIC8vIEN1YmljLWRlcml2ZWQgZWFzaW5ncyAodF4zKVxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENVQklDX0lOID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW4oIDMgKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDVUJJQ19PVVQgPSBFYXNpbmcucG9seW5vbWlhbEVhc2VPdXQoIDMgKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDVUJJQ19JTl9PVVQgPSBFYXNpbmcucG9seW5vbWlhbEVhc2VJbk91dCggMyApO1xuXG4gIC8vIFF1YXJ0aWMtZGVyaXZlZCBlYXNpbmdzICh0XjQpXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUVVBUlRJQ19JTiA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluKCA0ICk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUVVBUlRJQ19PVVQgPSBFYXNpbmcucG9seW5vbWlhbEVhc2VPdXQoIDQgKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUFSVElDX0lOX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZUluT3V0KCA0ICk7XG5cbiAgLy8gUXVpbnRpYy1kZXJpdmVkIGVhc2luZ3MgKHReNSlcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUlOVElDX0lOID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW4oIDUgKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBRVUlOVElDX09VVCA9IEVhc2luZy5wb2x5bm9taWFsRWFzZU91dCggNSApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFFVSU5USUNfSU5fT1VUID0gRWFzaW5nLnBvbHlub21pYWxFYXNlSW5PdXQoIDUgKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHQgaXMgdmFsaWQuXG4gKiBAcGFyYW0gdCAtIFRoZSBsaW5lYXIgcmF0aW8gWzAsMV0gb2YgdGhlIGFuaW1hdGlvblxuICovXG5mdW5jdGlvbiB0SXNWYWxpZCggdDogbnVtYmVyICk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHQgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB0ICkgJiYgdCA+PSAwICYmIHQgPD0gMTtcbn1cblxudHdpeHQucmVnaXN0ZXIoICdFYXNpbmcnLCBFYXNpbmcgKTtcbmV4cG9ydCBkZWZhdWx0IEVhc2luZzsiXSwibmFtZXMiOlsidHdpeHQiLCJFYXNpbmciLCJwb2x5bm9taWFsRWFzZUluVmFsdWUiLCJuIiwidCIsImFzc2VydCIsInRJc1ZhbGlkIiwiTWF0aCIsInBvdyIsInBvbHlub21pYWxFYXNlT3V0VmFsdWUiLCJwb2x5bm9taWFsRWFzZUluT3V0VmFsdWUiLCJwb2x5bm9taWFsRWFzZUluRGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlT3V0RGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlSW5PdXREZXJpdmF0aXZlIiwicG9seW5vbWlhbEVhc2VJblNlY29uZERlcml2YXRpdmUiLCJwb2x5bm9taWFsRWFzZU91dFNlY29uZERlcml2YXRpdmUiLCJwb2x5bm9taWFsRWFzZUluT3V0U2Vjb25kRGVyaXZhdGl2ZSIsInBvbHlub21pYWxFYXNlSW4iLCJiaW5kIiwicG9seW5vbWlhbEVhc2VPdXQiLCJwb2x5bm9taWFsRWFzZUluT3V0IiwidmFsdWUiLCJkZXJpdmF0aXZlIiwic2Vjb25kRGVyaXZhdGl2ZSIsIkxJTkVBUiIsIlFVQURSQVRJQ19JTiIsIlFVQURSQVRJQ19PVVQiLCJRVUFEUkFUSUNfSU5fT1VUIiwiQ1VCSUNfSU4iLCJDVUJJQ19PVVQiLCJDVUJJQ19JTl9PVVQiLCJRVUFSVElDX0lOIiwiUVVBUlRJQ19PVVQiLCJRVUFSVElDX0lOX09VVCIsIlFVSU5USUNfSU4iLCJRVUlOVElDX09VVCIsIlFVSU5USUNfSU5fT1VUIiwiaXNGaW5pdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7OztDQVdDLEdBRUQsT0FBT0EsV0FBVyxhQUFhO0FBSS9CLElBQUEsQUFBTUMsU0FBTixNQUFNQTtJQWNKOzs7OztHQUtDLEdBQ0QsT0FBY0Msc0JBQXVCQyxDQUFTLEVBQUVDLENBQVMsRUFBVztRQUNsRUMsVUFBVUEsT0FBUUMsU0FBVUYsSUFBSyxDQUFDLFdBQVcsRUFBRUEsR0FBRztRQUVs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