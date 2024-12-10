// Copyright 2013-2024, University of Colorado Boulder
/**
 * Basic 4-dimensional vector, represented as (x,y).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../phet-core/js/Pool.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector3 from './Vector3.js';
let Vector4 = class Vector4 {
    /**
   * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2+z^2+w^2}$.
   */ getMagnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    get magnitude() {
        return this.getMagnitude();
    }
    /**
   * The squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2+z^2+w^2$.
   */ getMagnitudeSquared() {
        return this.dot(this);
    }
    get magnitudeSquared() {
        return this.getMagnitudeSquared();
    }
    /**
   * The Euclidean distance between this vector (treated as a point) and another point.
   */ distance(point) {
        return this.minus(point).magnitude;
    }
    /**
   * The Euclidean distance between this vector (treated as a point) and another point (x,y,z,w).
   */ distanceXYZW(x, y, z, w) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dz = this.z - z;
        const dw = this.w - w;
        return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point.
   */ distanceSquared(point) {
        return this.minus(point).magnitudeSquared;
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point (x,y,z,w).
   */ distanceSquaredXYZW(x, y, z, w) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dz = this.z - z;
        const dw = this.w - w;
        return dx * dx + dy * dy + dz * dz + dw * dw;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector v.
   */ dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector (x,y,z,w).
   */ dotXYZW(x, y, z, w) {
        return this.x * x + this.y * y + this.z * z + this.w * w;
    }
    /**
   * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
   *
   * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
   * is the input vector (normalized).
   */ angleBetween(v) {
        // @ts-expect-error TODO: import with circular protection https://github.com/phetsims/dot/issues/96
        return Math.acos(dot.clamp(this.normalized().dot(v.normalized()), -1, 1));
    }
    /**
   * Exact equality comparison between this vector and another vector.
   *
   * @param other
   * @returns - Whether the two vectors have equal components
   */ equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
    }
    /**
   * Approximate equality comparison between this vector and another vector.
   *
   * @returns - Whether difference between the two vectors has no component with an absolute value greater
   *                      than epsilon.
   */ equalsEpsilon(other, epsilon) {
        if (!epsilon) {
            epsilon = 0;
        }
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) + Math.abs(this.w - other.w) <= epsilon;
    }
    /**
   * Returns false if any component is NaN, infinity, or -infinity. Otherwise returns true.
   */ isFinite() {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.z) && isFinite(this.w);
    }
    /*---------------------------------------------------------------------------*
   * Immutables
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this vector, or if a vector is passed in, set that vector's values to ours.
   *
   * This is the immutable form of the function set(), if a vector is provided. This will return a new vector, and
   * will not modify this vector.
   *
   * @param  [vector] - If not provided, creates a v4 with filled in values. Otherwise, fills in the
   *                    values of the provided vector so that it equals this vector.
   */ copy(vector) {
        if (vector) {
            return vector.set(this);
        } else {
            return v4(this.x, this.y, this.z, this.w);
        }
    }
    /**
   * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
   * error is thrown.
   *
   * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
   * vector.
   */ normalized() {
        const magnitude = this.magnitude;
        assert && assert(magnitude !== 0, 'Cannot normalize a zero-magnitude vector');
        return this.dividedScalar(magnitude);
    }
    /**
   * Returns a copy of this vector with each component rounded by Utils.roundSymmetric.
   *
   * This is the immutable form of the function roundSymmetric(). This will return a new vector, and will not modify
   * this vector.
   */ roundedSymmetric() {
        return this.copy().roundSymmetric();
    }
    /**
   * Re-scaled copy of this vector such that it has the desired magnitude. If its initial magnitude is zero, an error
   * is thrown. If the passed-in magnitude is negative, the direction of the resulting vector will be reversed.
   *
   * This is the immutable form of the function setMagnitude(). This will return a new vector, and will not modify
   * this vector.
   *
   */ withMagnitude(magnitude) {
        return this.copy().setMagnitude(magnitude);
    }
    /**
   * Copy of this vector, scaled by the desired scalar value.
   *
   * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
   * this vector.
   */ timesScalar(scalar) {
        return v4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }
    /**
   * Same as timesScalar.
   *
   * This is the immutable form of the function multiply(). This will return a new vector, and will not modify
   * this vector.
   */ times(scalar) {
        return this.timesScalar(scalar);
    }
    /**
   * Copy of this vector, multiplied component-wise by the passed-in vector v.
   *
   * This is the immutable form of the function componentMultiply(). This will return a new vector, and will not modify
   * this vector.
   */ componentTimes(v) {
        return v4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    }
    /**
   * Addition of this vector and another vector, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new vector, and will not modify
   * this vector.
   */ plus(v) {
        return v4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }
    /**
   * Addition of this vector and another vector (x,y,z,w), returning a copy.
   *
   * This is the immutable form of the function addXYZW(). This will return a new vector, and will not modify
   * this vector.
   */ plusXYZW(x, y, z, w) {
        return v4(this.x + x, this.y + y, this.z + z, this.w + w);
    }
    /**
   * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
   *
   * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
   * this vector.
   */ plusScalar(scalar) {
        return v4(this.x + scalar, this.y + scalar, this.z + scalar, this.w + scalar);
    }
    /**
   * Subtraction of this vector by another vector v, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
   * this vector.
   */ minus(v) {
        return v4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }
    /**
   * Subtraction of this vector by another vector (x,y,z,w), returning a copy.
   *
   * This is the immutable form of the function subtractXYZW(). This will return a new vector, and will not modify
   * this vector.
   */ minusXYZW(x, y, z, w) {
        return v4(this.x - x, this.y - y, this.z - z, this.w - w);
    }
    /**
   * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
   *
   * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
   * this vector.
   */ minusScalar(scalar) {
        return v4(this.x - scalar, this.y - scalar, this.z - scalar, this.w - scalar);
    }
    /**
   * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
   *
   * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
   * this vector.
   */ dividedScalar(scalar) {
        return v4(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    }
    /**
   * Negated copy of this vector (multiplies every component by -1).
   *
   * This is the immutable form of the function negate(). This will return a new vector, and will not modify
   * this vector.
   *
   */ negated() {
        return v4(-this.x, -this.y, -this.z, -this.w);
    }
    /**
   * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
   *
   * @param vector
   * @param ratio - Not necessarily constrained in [0, 1]
   */ blend(vector, ratio) {
        return this.plus(vector.minus(this).times(ratio));
    }
    /**
   * The average (midpoint) between this vector and another vector.
   */ average(vector) {
        return this.blend(vector, 0.5);
    }
    /**
   * Debugging string for the vector.
   */ toString() {
        return `Vector4(${this.x}, ${this.y}, ${this.z}, ${this.w})`;
    }
    /**
   * Converts this to a 3-dimensional vector, discarding the w-component.
   */ toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
    /*---------------------------------------------------------------------------*
   * Mutables
   * - all mutation should go through setXYZW / setX / setY / setZ / setW
   *---------------------------------------------------------------------------*/ /**
   * Sets all of the components of this vector, returning this.
   */ setXYZW(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    /**
   * Sets the x-component of this vector, returning this.
   */ setX(x) {
        this.x = x;
        return this;
    }
    /**
   * Sets the y-component of this vector, returning this.
   */ setY(y) {
        this.y = y;
        return this;
    }
    /**
   * Sets the z-component of this vector, returning this.
   */ setZ(z) {
        this.z = z;
        return this;
    }
    /**
   * Sets the w-component of this vector, returning this.
   */ setW(w) {
        this.w = w;
        return this;
    }
    /**
   * Sets this vector to be a copy of another vector.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
   * this vector itself.
   */ set(v) {
        return this.setXYZW(v.x, v.y, v.z, v.w);
    }
    /**
   * Sets the magnitude of this vector. If the passed-in magnitude is negative, this flips the vector and sets its
   * magnitude to abs( magnitude ).
   *
   * This is the mutable form of the function withMagnitude(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ setMagnitude(magnitude) {
        const scale = magnitude / this.magnitude;
        return this.multiplyScalar(scale);
    }
    /**
   * Adds another vector to this vector, changing this vector.
   *
   * This is the mutable form of the function plus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ add(v) {
        return this.setXYZW(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }
    /**
   * Adds another vector (x,y,z,w) to this vector, changing this vector.
   *
   * This is the mutable form of the function plusXYZW(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addXYZW(x, y, z, w) {
        return this.setXYZW(this.x + x, this.y + y, this.z + z, this.w + w);
    }
    /**
   * Adds a scalar to this vector (added to every component), changing this vector.
   *
   * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addScalar(scalar) {
        return this.setXYZW(this.x + scalar, this.y + scalar, this.z + scalar, this.w + scalar);
    }
    /**
   * Subtracts this vector by another vector, changing this vector.
   *
   * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtract(v) {
        return this.setXYZW(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }
    /**
   * Subtracts this vector by another vector (x,y,z,w), changing this vector.
   *
   * This is the mutable form of the function minusXYZW(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractXYZW(x, y, z, w) {
        return this.setXYZW(this.x - x, this.y - y, this.z - z, this.w - w);
    }
    /**
   * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractScalar(scalar) {
        return this.setXYZW(this.x - scalar, this.y - scalar, this.z - scalar, this.w - scalar);
    }
    /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ multiplyScalar(scalar) {
        return this.setXYZW(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }
    /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   * Same as multiplyScalar.
   *
   * This is the mutable form of the function times(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ multiply(scalar) {
        return this.multiplyScalar(scalar);
    }
    /**
   * Multiplies this vector by another vector component-wise, changing this vector.
   *
   * This is the mutable form of the function componentTimes(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ componentMultiply(v) {
        return this.setXYZW(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    }
    /**
   * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ divideScalar(scalar) {
        return this.setXYZW(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    }
    /**
   * Negates this vector (multiplies each component by -1), changing this vector.
   *
   * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ negate() {
        return this.setXYZW(-this.x, -this.y, -this.z, -this.w);
    }
    /**
   * Normalizes this vector (rescales to where the magnitude is 1), changing this vector.
   *
   * This is the mutable form of the function normalized(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ normalize() {
        const mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        }
        return this.divideScalar(mag);
    }
    /**
   * Rounds each component of this vector with Utils.roundSymmetric.
   *
   * This is the mutable form of the function roundedSymmetric(). This will mutate (change) this vector, in addition
   * to returning the vector itself.
   */ roundSymmetric() {
        return this.setXYZW(Utils.roundSymmetric(this.x), Utils.roundSymmetric(this.y), Utils.roundSymmetric(this.z), Utils.roundSymmetric(this.w));
    }
    freeToPool() {
        Vector4.pool.freeToPool(this);
    }
    /**
   * Creates a 4-dimensional vector with the specified X, Y, Z and W values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param w - W coordinate
   */ constructor(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
};
Vector4.pool = new Pool(Vector4, {
    maxSize: 1000,
    initialize: Vector4.prototype.setXYZW,
    defaultArguments: [
        0,
        0,
        0,
        0
    ]
});
export { Vector4 as default };
// (read-only) - Helps to identify the dimension of the vector
Vector4.prototype.isVector4 = true;
Vector4.prototype.dimension = 4;
dot.register('Vector4', Vector4);
const v4 = Vector4.pool.create.bind(Vector4.pool);
dot.register('v4', v4);
let ImmutableVector4 = class ImmutableVector4 extends Vector4 {
    /**
   * Throw errors whenever a mutable method is called on our immutable vector
   */ static mutableOverrideHelper(mutableFunctionName) {
        ImmutableVector4.prototype[mutableFunctionName] = ()=>{
            throw new Error(`Cannot call mutable method '${mutableFunctionName}' on immutable Vector3`);
        };
    }
};
ImmutableVector4.mutableOverrideHelper('setXYZW');
ImmutableVector4.mutableOverrideHelper('setX');
ImmutableVector4.mutableOverrideHelper('setY');
ImmutableVector4.mutableOverrideHelper('setZ');
ImmutableVector4.mutableOverrideHelper('setW');
Vector4.ZERO = assert ? new ImmutableVector4(0, 0, 0, 0) : new Vector4(0, 0, 0, 0);
Vector4.X_UNIT = assert ? new ImmutableVector4(1, 0, 0, 0) : new Vector4(1, 0, 0, 0);
Vector4.Y_UNIT = assert ? new ImmutableVector4(0, 1, 0, 0) : new Vector4(0, 1, 0, 0);
Vector4.Z_UNIT = assert ? new ImmutableVector4(0, 0, 1, 0) : new Vector4(0, 0, 1, 0);
Vector4.W_UNIT = assert ? new ImmutableVector4(0, 0, 0, 1) : new Vector4(0, 0, 0, 1);
export { v4 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3I0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhc2ljIDQtZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5KS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL1ZlY3RvcjMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3I0IGltcGxlbWVudHMgVFBvb2xhYmxlIHtcblxuICAvLyBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSB2ZWN0b3IuXG4gIHB1YmxpYyB4OiBudW1iZXI7XG5cbiAgLy8gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgdmVjdG9yLlxuICBwdWJsaWMgeTogbnVtYmVyO1xuXG4gIC8vIFRoZSBaIGNvb3JkaW5hdGUgb2YgdGhlIHZlY3Rvci5cbiAgcHVibGljIHo6IG51bWJlcjtcblxuICAvLyBUaGUgVyBjb29yZGluYXRlIG9mIHRoZSB2ZWN0b3IuXG4gIHB1YmxpYyB3OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWRpbWVuc2lvbmFsIHZlY3RvciB3aXRoIHRoZSBzcGVjaWZpZWQgWCwgWSwgWiBhbmQgVyB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gWCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB5IC0gWSBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB6IC0gWiBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB3IC0gVyBjb29yZGluYXRlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlciApIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgICB0aGlzLncgPSB3O1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIG1hZ25pdHVkZSAoRXVjbGlkZWFuL0wyIE5vcm0pIG9mIHRoaXMgdmVjdG9yLCBpLmUuICRcXHNxcnR7eF4yK3leMit6XjIrd14yfSQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWFnbml0dWRlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5tYWduaXR1ZGVTcXVhcmVkICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1hZ25pdHVkZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIG1hZ25pdHVkZSAoc3F1YXJlIG9mIHRoZSBFdWNsaWRlYW4vTDIgTm9ybSkgb2YgdGhpcyB2ZWN0b3IsIGkuZS4gJHheMit5XjIrel4yK3deMiQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWFnbml0dWRlU3F1YXJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjQgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlU3F1YXJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2UoIHBvaW50OiBWZWN0b3I0ICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWludXMoIHBvaW50ICkubWFnbml0dWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBFdWNsaWRlYW4gZGlzdGFuY2UgYmV0d2VlbiB0aGlzIHZlY3RvciAodHJlYXRlZCBhcyBhIHBvaW50KSBhbmQgYW5vdGhlciBwb2ludCAoeCx5LHosdykuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VYWVpXKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSB5O1xuICAgIGNvbnN0IGR6ID0gdGhpcy56IC0gejtcbiAgICBjb25zdCBkdyA9IHRoaXMudyAtIHc7XG4gICAgcmV0dXJuIE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6ICsgZHcgKiBkdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50LlxuICAgKi9cbiAgcHVibGljIGRpc3RhbmNlU3F1YXJlZCggcG9pbnQ6IFZlY3RvcjQgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5taW51cyggcG9pbnQgKS5tYWduaXR1ZGVTcXVhcmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50ICh4LHkseix3KS5cbiAgICovXG4gIHB1YmxpYyBkaXN0YW5jZVNxdWFyZWRYWVpXKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSB5O1xuICAgIGNvbnN0IGR6ID0gdGhpcy56IC0gejtcbiAgICBjb25zdCBkdyA9IHRoaXMudyAtIHc7XG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeiArIGR3ICogZHc7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRvdC1wcm9kdWN0IChFdWNsaWRlYW4gaW5uZXIgcHJvZHVjdCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3Igdi5cbiAgICovXG4gIHB1YmxpYyBkb3QoIHY6IFZlY3RvcjQgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56ICsgdGhpcy53ICogdi53O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBkb3QtcHJvZHVjdCAoRXVjbGlkZWFuIGlubmVyIHByb2R1Y3QpIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yICh4LHkseix3KS5cbiAgICovXG4gIHB1YmxpYyBkb3RYWVpXKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogeCArIHRoaXMueSAqIHkgKyB0aGlzLnogKiB6ICsgdGhpcy53ICogdztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYW5nbGUgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IsIGluIHRoZSByYW5nZSAkXFx0aGV0YVxcaW5bMCwgXFxwaV0kLlxuICAgKlxuICAgKiBFcXVhbCB0byAkXFx0aGV0YSA9IFxcY29zXnstMX0oIFxcaGF0e3V9IFxcY2RvdCBcXGhhdHt2fSApJCB3aGVyZSAkXFxoYXR7dX0kIGlzIHRoaXMgdmVjdG9yIChub3JtYWxpemVkKSBhbmQgJFxcaGF0e3Z9JFxuICAgKiBpcyB0aGUgaW5wdXQgdmVjdG9yIChub3JtYWxpemVkKS5cbiAgICovXG4gIHB1YmxpYyBhbmdsZUJldHdlZW4oIHY6IFZlY3RvcjQgKTogbnVtYmVyIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IGltcG9ydCB3aXRoIGNpcmN1bGFyIHByb3RlY3Rpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICByZXR1cm4gTWF0aC5hY29zKCBkb3QuY2xhbXAoIHRoaXMubm9ybWFsaXplZCgpLmRvdCggdi5ub3JtYWxpemVkKCkgKSwgLTEsIDEgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YWN0IGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBvdGhlclxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHR3byB2ZWN0b3JzIGhhdmUgZXF1YWwgY29tcG9uZW50c1xuICAgKi9cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFZlY3RvcjQgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gb3RoZXIueCAmJiB0aGlzLnkgPT09IG90aGVyLnkgJiYgdGhpcy56ID09PSBvdGhlci56ICYmIHRoaXMudyA9PT0gb3RoZXIudztcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHByb3hpbWF0ZSBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSB0d28gdmVjdG9ycyBoYXMgbm8gY29tcG9uZW50IHdpdGggYW4gYWJzb2x1dGUgdmFsdWUgZ3JlYXRlclxuICAgKiAgICAgICAgICAgICAgICAgICAgICB0aGFuIGVwc2lsb24uXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggb3RoZXI6IFZlY3RvcjQsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcbiAgICBpZiAoICFlcHNpbG9uICkge1xuICAgICAgZXBzaWxvbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLmFicyggdGhpcy54IC0gb3RoZXIueCApICsgTWF0aC5hYnMoIHRoaXMueSAtIG90aGVyLnkgKSArIE1hdGguYWJzKCB0aGlzLnogLSBvdGhlci56ICkgKyBNYXRoLmFicyggdGhpcy53IC0gb3RoZXIudyApIDw9IGVwc2lsb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBmYWxzZSBpZiBhbnkgY29tcG9uZW50IGlzIE5hTiwgaW5maW5pdHksIG9yIC1pbmZpbml0eS4gT3RoZXJ3aXNlIHJldHVybnMgdHJ1ZS5cbiAgICovXG4gIHB1YmxpYyBpc0Zpbml0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNGaW5pdGUoIHRoaXMueCApICYmIGlzRmluaXRlKCB0aGlzLnkgKSAmJiBpc0Zpbml0ZSggdGhpcy56ICkgJiYgaXNGaW5pdGUoIHRoaXMudyApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIEltbXV0YWJsZXNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHZlY3Rvciwgb3IgaWYgYSB2ZWN0b3IgaXMgcGFzc2VkIGluLCBzZXQgdGhhdCB2ZWN0b3IncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIHZlY3RvciBpcyBwcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZFxuICAgKiB3aWxsIG5vdCBtb2RpZnkgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSAgW3ZlY3Rvcl0gLSBJZiBub3QgcHJvdmlkZWQsIGNyZWF0ZXMgYSB2NCB3aXRoIGZpbGxlZCBpbiB2YWx1ZXMuIE90aGVyd2lzZSwgZmlsbHMgaW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgb2YgdGhlIHByb3ZpZGVkIHZlY3RvciBzbyB0aGF0IGl0IGVxdWFscyB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBjb3B5KCB2ZWN0b3I/OiBWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIGlmICggdmVjdG9yICkge1xuICAgICAgcmV0dXJuIHZlY3Rvci5zZXQoIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3I0ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHY0KCB0aGlzLngsIHRoaXMueSwgdGhpcy56LCB0aGlzLncgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplZCAocmUtc2NhbGVkKSBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdHMgbWFnbml0dWRlIGlzIDEuIElmIGl0cyBpbml0aWFsIG1hZ25pdHVkZSBpcyB6ZXJvLCBhblxuICAgKiBlcnJvciBpcyB0aHJvd24uXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpc1xuICAgKiB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgbm9ybWFsaXplZCgpOiBWZWN0b3I0IHtcbiAgICBjb25zdCBtYWduaXR1ZGUgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYWduaXR1ZGUgIT09IDAsICdDYW5ub3Qgbm9ybWFsaXplIGEgemVyby1tYWduaXR1ZGUgdmVjdG9yJyApO1xuICAgIHJldHVybiB0aGlzLmRpdmlkZWRTY2FsYXIoIG1hZ25pdHVkZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgdmVjdG9yIHdpdGggZWFjaCBjb21wb25lbnQgcm91bmRlZCBieSBVdGlscy5yb3VuZFN5bW1ldHJpYy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdW5kU3ltbWV0cmljKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHJvdW5kZWRTeW1tZXRyaWMoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuY29weSgpLnJvdW5kU3ltbWV0cmljKCk7XG4gIH1cblxuICAvKipcbiAgICogUmUtc2NhbGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3Igc3VjaCB0aGF0IGl0IGhhcyB0aGUgZGVzaXJlZCBtYWduaXR1ZGUuIElmIGl0cyBpbml0aWFsIG1hZ25pdHVkZSBpcyB6ZXJvLCBhbiBlcnJvclxuICAgKiBpcyB0aHJvd24uIElmIHRoZSBwYXNzZWQtaW4gbWFnbml0dWRlIGlzIG5lZ2F0aXZlLCB0aGUgZGlyZWN0aW9uIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yIHdpbGwgYmUgcmV2ZXJzZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXRNYWduaXR1ZGUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqL1xuICBwdWJsaWMgd2l0aE1hZ25pdHVkZSggbWFnbml0dWRlOiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuY29weSgpLnNldE1hZ25pdHVkZSggbWFnbml0dWRlICk7XG4gIH1cblxuICAvKipcbiAgICogQ29weSBvZiB0aGlzIHZlY3Rvciwgc2NhbGVkIGJ5IHRoZSBkZXNpcmVkIHNjYWxhciB2YWx1ZS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHRpbWVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdjQoIHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyLCB0aGlzLnogKiBzY2FsYXIsIHRoaXMudyAqIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgdGltZXNTY2FsYXIuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtdWx0aXBseSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyB0aW1lcyggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMudGltZXNTY2FsYXIoIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgb2YgdGhpcyB2ZWN0b3IsIG11bHRpcGxpZWQgY29tcG9uZW50LXdpc2UgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3Igdi5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudE11bHRpcGx5KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGNvbXBvbmVudFRpbWVzKCB2OiBWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueiwgdGhpcy53ICogdi53ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkaXRpb24gb2YgdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHBsdXMoIHY6IFZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHY0KCB0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56LCB0aGlzLncgKyB2LncgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IgKHgseSx6LHcpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkWFlaVygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBwbHVzWFlaVyggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54ICsgeCwgdGhpcy55ICsgeSwgdGhpcy56ICsgeiwgdGhpcy53ICsgdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgdmVjdG9yIHdpdGggYSBzY2FsYXIgKGFkZHMgdGhlIHNjYWxhciB0byBldmVyeSBjb21wb25lbnQpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkU2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHBsdXNTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54ICsgc2NhbGFyLCB0aGlzLnkgKyBzY2FsYXIsIHRoaXMueiArIHNjYWxhciwgdGhpcy53ICsgc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgdiwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG1pbnVzKCB2OiBWZWN0b3I0ICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueiwgdGhpcy53IC0gdi53ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgKHgseSx6LHcpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3RYWVpXKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG1pbnVzWFlaVyggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54IC0geCwgdGhpcy55IC0geSwgdGhpcy56IC0geiwgdGhpcy53IC0gdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChzdWJ0cmFjdHMgdGhlIHNjYWxhciBmcm9tIGV2ZXJ5IGNvbXBvbmVudCksIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzdWJ0cmFjdFNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBtaW51c1NjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHY0KCB0aGlzLnggLSBzY2FsYXIsIHRoaXMueSAtIHNjYWxhciwgdGhpcy56IC0gc2NhbGFyLCB0aGlzLncgLSBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpc2lvbiBvZiB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoZGl2aWRlcyBldmVyeSBjb21wb25lbnQgYnkgdGhlIHNjYWxhciksIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaXZpZGVTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlZFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHY0KCB0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOZWdhdGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZXZlcnkgY29tcG9uZW50IGJ5IC0xKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICovXG4gIHB1YmxpYyBuZWdhdGVkKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiwgLXRoaXMudyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0aGlzIHZlY3RvciAocmF0aW89MCkgYW5kIGFub3RoZXIgdmVjdG9yIChyYXRpbz0xKS5cbiAgICpcbiAgICogQHBhcmFtIHZlY3RvclxuICAgKiBAcGFyYW0gcmF0aW8gLSBOb3QgbmVjZXNzYXJpbHkgY29uc3RyYWluZWQgaW4gWzAsIDFdXG4gICAqL1xuICBwdWJsaWMgYmxlbmQoIHZlY3RvcjogVmVjdG9yNCwgcmF0aW86IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5wbHVzKCB2ZWN0b3IubWludXMoIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3I0ICkudGltZXMoIHJhdGlvICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXZlcmFnZSAobWlkcG9pbnQpIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGF2ZXJhZ2UoIHZlY3RvcjogVmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5ibGVuZCggdmVjdG9yLCAwLjUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1Z2dpbmcgc3RyaW5nIGZvciB0aGUgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBWZWN0b3I0KCR7dGhpcy54fSwgJHt0aGlzLnl9LCAke3RoaXMuen0sICR7dGhpcy53fSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgdG8gYSAzLWRpbWVuc2lvbmFsIHZlY3RvciwgZGlzY2FyZGluZyB0aGUgdy1jb21wb25lbnQuXG4gICAqL1xuICBwdWJsaWMgdG9WZWN0b3IzKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdGhpcy54LCB0aGlzLnksIHRoaXMueiApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIE11dGFibGVzXG4gICAqIC0gYWxsIG11dGF0aW9uIHNob3VsZCBnbyB0aHJvdWdoIHNldFhZWlcgLyBzZXRYIC8gc2V0WSAvIHNldFogLyBzZXRXXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogU2V0cyBhbGwgb2YgdGhlIGNvbXBvbmVudHMgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFhZWlcoIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgICB0aGlzLncgPSB3O1xuICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yNDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB4LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgc2V0WCggeDogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHRoaXMueCA9IHg7XG4gICAgcmV0dXJuIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3I0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHktY29tcG9uZW50IG9mIHRoaXMgdmVjdG9yLCByZXR1cm5pbmcgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBzZXRZKCB5OiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgdGhpcy55ID0geTtcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgei1jb21wb25lbnQgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFooIHo6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICB0aGlzLnogPSB6O1xuICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yNDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB3LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgc2V0VyggdzogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHRoaXMudyA9IHc7XG4gICAgcmV0dXJuIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3I0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyB2ZWN0b3IgdG8gYmUgYSBjb3B5IG9mIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXQoIHY6IFZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaVyggdi54LCB2LnksIHYueiwgdi53ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWFnbml0dWRlIG9mIHRoaXMgdmVjdG9yLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhpcyBmbGlwcyB0aGUgdmVjdG9yIGFuZCBzZXRzIGl0c1xuICAgKiBtYWduaXR1ZGUgdG8gYWJzKCBtYWduaXR1ZGUgKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWFnbml0dWRlKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICBjb25zdCBzY2FsZSA9IG1hZ25pdHVkZSAvIHRoaXMubWFnbml0dWRlO1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCBzY2FsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW5vdGhlciB2ZWN0b3IgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHBsdXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBhZGQoIHY6IFZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaVyggdGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueiwgdGhpcy53ICsgdi53ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbm90aGVyIHZlY3RvciAoeCx5LHosdykgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHBsdXNYWVpXKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkWFlaVyggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyICk6IFZlY3RvcjQge1xuICAgIHJldHVybiB0aGlzLnNldFhZWlcoIHRoaXMueCArIHgsIHRoaXMueSArIHksIHRoaXMueiArIHosIHRoaXMudyArIHcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc2NhbGFyIHRvIHRoaXMgdmVjdG9yIChhZGRlZCB0byBldmVyeSBjb21wb25lbnQpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzU2NhbGFyKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCB0aGlzLnggKyBzY2FsYXIsIHRoaXMueSArIHNjYWxhciwgdGhpcy56ICsgc2NhbGFyLCB0aGlzLncgKyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG1pbnVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc3VidHJhY3QoIHY6IFZlY3RvcjQgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaVyggdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueiwgdGhpcy53IC0gdi53ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3RzIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yICh4LHkseix3KSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNYWVpXKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc3VidHJhY3RYWVpXKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIgKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaVyggdGhpcy54IC0geCwgdGhpcy55IC0geSwgdGhpcy56IC0geiwgdGhpcy53IC0gdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0cyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoc3VidHJhY3RzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtaW51c1NjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIHN1YnRyYWN0U2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCB0aGlzLnggLSBzY2FsYXIsIHRoaXMueSAtIHNjYWxhciwgdGhpcy56IC0gc2NhbGFyLCB0aGlzLncgLSBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChtdWx0aXBsaWVzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0aW1lc1NjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5U2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCB0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyLCB0aGlzLncgKiBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChtdWx0aXBsaWVzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICogU2FtZSBhcyBtdWx0aXBseVNjYWxhci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB0aW1lcygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5KCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciBjb21wb25lbnQtd2lzZSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gY29tcG9uZW50VGltZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBjb21wb25lbnRNdWx0aXBseSggdjogVmVjdG9yNCApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56LCB0aGlzLncgKiB2LncgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGVzIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChkaXZpZGVzIGVhY2ggY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBkaXZpZGVkU2NhbGFyKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgZGl2aWRlU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCB0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyLCB0aGlzLncgLyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgdmVjdG9yIChtdWx0aXBsaWVzIGVhY2ggY29tcG9uZW50IGJ5IC0xKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbmVnYXRlZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIG5lZ2F0ZSgpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVpXKCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56LCAtdGhpcy53ICk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGlzIHZlY3RvciAocmVzY2FsZXMgdG8gd2hlcmUgdGhlIG1hZ25pdHVkZSBpcyAxKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbm9ybWFsaXplZCgpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIG5vcm1hbGl6ZSgpOiBWZWN0b3I0IHtcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICBpZiAoIG1hZyA9PT0gMCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBub3JtYWxpemUgYSB6ZXJvLW1hZ25pdHVkZSB2ZWN0b3InICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRpdmlkZVNjYWxhciggbWFnICk7XG4gIH1cblxuICAvKipcbiAgICogUm91bmRzIGVhY2ggY29tcG9uZW50IG9mIHRoaXMgdmVjdG9yIHdpdGggVXRpbHMucm91bmRTeW1tZXRyaWMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRlZFN5bW1ldHJpYygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvblxuICAgKiB0byByZXR1cm5pbmcgdGhlIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgcm91bmRTeW1tZXRyaWMoKTogVmVjdG9yNCB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaVyggVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMueCApLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy55ICksIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLnogKSwgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMudyApICk7XG4gIH1cblxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBWZWN0b3I0LnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIFZlY3RvcjQsIHtcbiAgICBtYXhTaXplOiAxMDAwLFxuICAgIGluaXRpYWxpemU6IFZlY3RvcjQucHJvdG90eXBlLnNldFhZWlcsXG4gICAgZGVmYXVsdEFyZ3VtZW50czogWyAwLCAwLCAwLCAwIF1cbiAgfSApO1xuXG4gIHB1YmxpYyBpc1ZlY3RvcjQhOiBib29sZWFuO1xuICBwdWJsaWMgZGltZW5zaW9uITogbnVtYmVyO1xuICBwdWJsaWMgc3RhdGljIFpFUk86IFZlY3RvcjQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBYX1VOSVQ6IFZlY3RvcjQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBZX1VOSVQ6IFZlY3RvcjQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBaX1VOSVQ6IFZlY3RvcjQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbiAgcHVibGljIHN0YXRpYyBXX1VOSVQ6IFZlY3RvcjQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcbn1cblxuLy8gKHJlYWQtb25seSkgLSBIZWxwcyB0byBpZGVudGlmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB2ZWN0b3JcblZlY3RvcjQucHJvdG90eXBlLmlzVmVjdG9yNCA9IHRydWU7XG5WZWN0b3I0LnByb3RvdHlwZS5kaW1lbnNpb24gPSA0O1xuXG5kb3QucmVnaXN0ZXIoICdWZWN0b3I0JywgVmVjdG9yNCApO1xuXG5jb25zdCB2NCA9IFZlY3RvcjQucG9vbC5jcmVhdGUuYmluZCggVmVjdG9yNC5wb29sICk7XG5kb3QucmVnaXN0ZXIoICd2NCcsIHY0ICk7XG5cbmNsYXNzIEltbXV0YWJsZVZlY3RvcjQgZXh0ZW5kcyBWZWN0b3I0IHtcbiAgLyoqXG4gICAqIFRocm93IGVycm9ycyB3aGVuZXZlciBhIG11dGFibGUgbWV0aG9kIGlzIGNhbGxlZCBvbiBvdXIgaW1tdXRhYmxlIHZlY3RvclxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBtdXRhYmxlT3ZlcnJpZGVIZWxwZXIoIG11dGFibGVGdW5jdGlvbk5hbWU6ICdzZXRYJyB8ICdzZXRZJyB8ICdzZXRaJyB8ICdzZXRXJyB8ICdzZXRYWVpXJyApOiB2b2lkIHtcbiAgICBJbW11dGFibGVWZWN0b3I0LnByb3RvdHlwZVsgbXV0YWJsZUZ1bmN0aW9uTmFtZSBdID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IGNhbGwgbXV0YWJsZSBtZXRob2QgJyR7bXV0YWJsZUZ1bmN0aW9uTmFtZX0nIG9uIGltbXV0YWJsZSBWZWN0b3IzYCApO1xuICAgIH07XG4gIH1cbn1cblxuSW1tdXRhYmxlVmVjdG9yNC5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRYWVpXJyApO1xuSW1tdXRhYmxlVmVjdG9yNC5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRYJyApO1xuSW1tdXRhYmxlVmVjdG9yNC5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRZJyApO1xuSW1tdXRhYmxlVmVjdG9yNC5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRaJyApO1xuSW1tdXRhYmxlVmVjdG9yNC5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRXJyApO1xuXG5WZWN0b3I0LlpFUk8gPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yNCggMCwgMCwgMCwgMCApIDogbmV3IFZlY3RvcjQoIDAsIDAsIDAsIDAgKTtcblZlY3RvcjQuWF9VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjQoIDEsIDAsIDAsIDAgKSA6IG5ldyBWZWN0b3I0KCAxLCAwLCAwLCAwICk7XG5WZWN0b3I0LllfVU5JVCA9IGFzc2VydCA/IG5ldyBJbW11dGFibGVWZWN0b3I0KCAwLCAxLCAwLCAwICkgOiBuZXcgVmVjdG9yNCggMCwgMSwgMCwgMCApO1xuVmVjdG9yNC5aX1VOSVQgPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yNCggMCwgMCwgMSwgMCApIDogbmV3IFZlY3RvcjQoIDAsIDAsIDEsIDAgKTtcblZlY3RvcjQuV19VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjQoIDAsIDAsIDAsIDEgKSA6IG5ldyBWZWN0b3I0KCAwLCAwLCAwLCAxICk7XG5cbmV4cG9ydCB7IHY0IH07Il0sIm5hbWVzIjpbIlBvb2wiLCJkb3QiLCJVdGlscyIsIlZlY3RvcjMiLCJWZWN0b3I0IiwiZ2V0TWFnbml0dWRlIiwiTWF0aCIsInNxcnQiLCJtYWduaXR1ZGVTcXVhcmVkIiwibWFnbml0dWRlIiwiZ2V0TWFnbml0dWRlU3F1YXJlZCIsImRpc3RhbmNlIiwicG9pbnQiLCJtaW51cyIsImRpc3RhbmNlWFlaVyIsIngiLCJ5IiwieiIsInciLCJkeCIsImR5IiwiZHoiLCJkdyIsImRpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlU3F1YXJlZFhZWlciLCJ2IiwiZG90WFlaVyIsImFuZ2xlQmV0d2VlbiIsImFjb3MiLCJjbGFtcCIsIm5vcm1hbGl6ZWQiLCJlcXVhbHMiLCJvdGhlciIsImVxdWFsc0Vwc2lsb24iLCJlcHNpbG9uIiwiYWJzIiwiaXNGaW5pdGUiLCJjb3B5IiwidmVjdG9yIiwic2V0IiwidjQiLCJhc3NlcnQiLCJkaXZpZGVkU2NhbGFyIiwicm91bmRlZFN5bW1ldHJpYyIsInJvdW5kU3ltbWV0cmljIiwid2l0aE1hZ25pdHVkZSIsInNldE1hZ25pdHVkZSIsInRpbWVzU2NhbGFyIiwic2NhbGFyIiwidGltZXMiLCJjb21wb25lbnRUaW1lcyIsInBsdXMiLCJwbHVzWFlaVyIsInBsdXNTY2FsYXIiLCJtaW51c1hZWlciLCJtaW51c1NjYWxhciIsIm5lZ2F0ZWQiLCJibGVuZCIsInJhdGlvIiwiYXZlcmFnZSIsInRvU3RyaW5nIiwidG9WZWN0b3IzIiwic2V0WFlaVyIsInNldFgiLCJzZXRZIiwic2V0WiIsInNldFciLCJzY2FsZSIsIm11bHRpcGx5U2NhbGFyIiwiYWRkIiwiYWRkWFlaVyIsImFkZFNjYWxhciIsInN1YnRyYWN0Iiwic3VidHJhY3RYWVpXIiwic3VidHJhY3RTY2FsYXIiLCJtdWx0aXBseSIsImNvbXBvbmVudE11bHRpcGx5IiwiZGl2aWRlU2NhbGFyIiwibmVnYXRlIiwibm9ybWFsaXplIiwibWFnIiwiRXJyb3IiLCJmcmVlVG9Qb29sIiwicG9vbCIsIm1heFNpemUiLCJpbml0aWFsaXplIiwicHJvdG90eXBlIiwiZGVmYXVsdEFyZ3VtZW50cyIsImlzVmVjdG9yNCIsImRpbWVuc2lvbiIsInJlZ2lzdGVyIiwiY3JlYXRlIiwiYmluZCIsIkltbXV0YWJsZVZlY3RvcjQiLCJtdXRhYmxlT3ZlcnJpZGVIZWxwZXIiLCJtdXRhYmxlRnVuY3Rpb25OYW1lIiwiWkVSTyIsIlhfVU5JVCIsIllfVU5JVCIsIlpfVU5JVCIsIldfVU5JVCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxVQUF5Qiw2QkFBNkI7QUFDN0QsT0FBT0MsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLFdBQVcsYUFBYTtBQUMvQixPQUFPQyxhQUFhLGVBQWU7QUFFcEIsSUFBQSxBQUFNQyxVQUFOLE1BQU1BO0lBOEJuQjs7R0FFQyxHQUNELEFBQU9DLGVBQXVCO1FBQzVCLE9BQU9DLEtBQUtDLElBQUksQ0FBRSxJQUFJLENBQUNDLGdCQUFnQjtJQUN6QztJQUVBLElBQVdDLFlBQW9CO1FBQzdCLE9BQU8sSUFBSSxDQUFDSixZQUFZO0lBQzFCO0lBRUE7O0dBRUMsR0FDRCxBQUFPSyxzQkFBOEI7UUFDbkMsT0FBTyxJQUFJLENBQUNULEdBQUcsQ0FBRSxJQUFJO0lBQ3ZCO0lBRUEsSUFBV08sbUJBQTJCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDRSxtQkFBbUI7SUFDakM7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFNBQVVDLEtBQWMsRUFBVztRQUN4QyxPQUFPLElBQUksQ0FBQ0MsS0FBSyxDQUFFRCxPQUFRSCxTQUFTO0lBQ3RDO0lBRUE7O0dBRUMsR0FDRCxBQUFPSyxhQUFjQyxDQUFTLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVc7UUFDeEUsTUFBTUMsS0FBSyxJQUFJLENBQUNKLENBQUMsR0FBR0E7UUFDcEIsTUFBTUssS0FBSyxJQUFJLENBQUNKLENBQUMsR0FBR0E7UUFDcEIsTUFBTUssS0FBSyxJQUFJLENBQUNKLENBQUMsR0FBR0E7UUFDcEIsTUFBTUssS0FBSyxJQUFJLENBQUNKLENBQUMsR0FBR0E7UUFDcEIsT0FBT1osS0FBS0MsSUFBSSxDQUFFWSxLQUFLQSxLQUFLQyxL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