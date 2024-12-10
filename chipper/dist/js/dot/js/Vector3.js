// Copyright 2013-2024, University of Colorado Boulder
/**
 * Basic 3-dimensional vector, represented as (x,y,z).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../phet-core/js/Pool.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Utils from './Utils.js';
import { v2 } from './Vector2.js';
import { v4 } from './Vector4.js';
const ADDING_ACCUMULATOR = (vector, nextVector)=>{
    return vector.add(nextVector);
};
let Vector3 = class Vector3 {
    /**
   * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2+z^2}$.
   */ getMagnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    get magnitude() {
        return this.getMagnitude();
    }
    /**
   * T squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2+z^2$.
   */ getMagnitudeSquared() {
        return this.dot(this);
    }
    get magnitudeSquared() {
        return this.getMagnitudeSquared();
    }
    /**
   * The Euclidean distance between this vector (treated as a point) and another point.
   */ distance(point) {
        return Math.sqrt(this.distanceSquared(point));
    }
    /**
   * The Euclidean distance between this vector (treated as a point) and another point (x,y,z).
   */ distanceXYZ(x, y, z) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dz = this.z - z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point.
   */ distanceSquared(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        const dz = this.z - point.z;
        return dx * dx + dy * dy + dz * dz;
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point (x,y,z).
   */ distanceSquaredXYZ(x, y, z) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dz = this.z - z;
        return dx * dx + dy * dy + dz * dz;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector v.
   */ dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector (x,y,z).
   */ dotXYZ(x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    }
    /**
   * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
   *
   * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
   * is the input vector (normalized).
   */ angleBetween(v) {
        return Math.acos(Utils.clamp(this.normalized().dot(v.normalized()), -1, 1));
    }
    /**
   * Exact equality comparison between this vector and another vector.
   *
   * @returns - Whether the two vectors have equal components
   */ equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
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
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) <= epsilon;
    }
    /**
   * Returns false if any component is NaN, infinity, or -infinity. Otherwise returns true.
   */ isFinite() {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.z);
    }
    /*---------------------------------------------------------------------------*
   * Immutables
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this vector, or if a vector is passed in, set that vector's values to ours.
   *
   * This is the immutable form of the function set(), if a vector is provided. This will return a new vector, and
   * will not modify this vector.
   *
   * @param [vector] - If not provided, creates a new Vector3 with filled in values. Otherwise, fills in the
   *                   values of the provided vector so that it equals this vector.
   */ copy(vector) {
        if (vector) {
            return vector.set(this);
        } else {
            return v3(this.x, this.y, this.z);
        }
    }
    /**
   * The Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
   */ cross(v) {
        return v3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    /**
   * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
   * error is thrown.
   *
   * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
   * vector.
   */ normalized() {
        const mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        } else {
            return v3(this.x / mag, this.y / mag, this.z / mag);
        }
    }
    /**
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
   */ withMagnitude(magnitude) {
        return this.copy().setMagnitude(magnitude);
    }
    /**
   * Copy of this vector, scaled by the desired scalar value.
   *
   * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
   * this vector.
   */ timesScalar(scalar) {
        return v3(this.x * scalar, this.y * scalar, this.z * scalar);
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
        return v3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    /**
   * Addition of this vector and another vector, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new vector, and will not modify
   * this vector.
   */ plus(v) {
        return v3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    /**
   * Addition of this vector and another vector (x,y,z), returning a copy.
   *
   * This is the immutable form of the function addXYZ(). This will return a new vector, and will not modify
   * this vector.
   */ plusXYZ(x, y, z) {
        return v3(this.x + x, this.y + y, this.z + z);
    }
    /**
   * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
   *
   * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
   * this vector.
   */ plusScalar(scalar) {
        return v3(this.x + scalar, this.y + scalar, this.z + scalar);
    }
    /**
   * Subtraction of this vector by another vector v, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
   * this vector.
   */ minus(v) {
        return v3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    /**
   * Subtraction of this vector by another vector (x,y,z), returning a copy.
   *
   * This is the immutable form of the function subtractXYZ(). This will return a new vector, and will not modify
   * this vector.
   */ minusXYZ(x, y, z) {
        return v3(this.x - x, this.y - y, this.z - z);
    }
    /**
   * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
   *
   * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
   * this vector.
   */ minusScalar(scalar) {
        return v3(this.x - scalar, this.y - scalar, this.z - scalar);
    }
    /**
   * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
   *
   * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
   * this vector.
   */ dividedScalar(scalar) {
        return v3(this.x / scalar, this.y / scalar, this.z / scalar);
    }
    /**
   * Negated copy of this vector (multiplies every component by -1).
   *
   * This is the immutable form of the function negate(). This will return a new vector, and will not modify
   * this vector.
   *
   */ negated() {
        return v3(-this.x, -this.y, -this.z);
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
   * Take a component-based mean of all vectors provided.
   */ static average(vectors) {
        const added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector3(0, 0, 0));
        return added.divideScalar(vectors.length);
    }
    /**
   * Debugging string for the vector.
   */ toString() {
        return `Vector3(${this.x}, ${this.y}, ${this.z})`;
    }
    /**
   * Converts this to a 2-dimensional vector, discarding the z-component.
   */ toVector2() {
        return v2(this.x, this.y);
    }
    /**
   * Converts this to a 4-dimensional vector, with the w-component equal to 1 (useful for homogeneous coordinates).
   */ toVector4() {
        return v4(this.x, this.y, this.z, 1);
    }
    /**
   * Converts this to a 4-dimensional vector, with the w-component equal to 0
   */ toVector4Zero() {
        return v4(this.x, this.y, this.z, 0);
    }
    /*---------------------------------------------------------------------------*
   * Mutables
   * - all mutation should go through setXYZ / setX / setY / setZ
   *---------------------------------------------------------------------------*/ /**
   * Sets all of the components of this vector, returning this.
   */ setXYZ(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
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
   * Sets this vector to be a copy of another vector.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
   * this vector itself.
   */ set(v) {
        return this.setXYZ(v.x, v.y, v.z);
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
        return this.setXYZ(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    /**
   * Adds another vector (x,y,z) to this vector, changing this vector.
   *
   * This is the mutable form of the function plusXYZ(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addXYZ(x, y, z) {
        return this.setXYZ(this.x + x, this.y + y, this.z + z);
    }
    /**
   * Adds a scalar to this vector (added to every component), changing this vector.
   *
   * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addScalar(scalar) {
        return this.setXYZ(this.x + scalar, this.y + scalar, this.z + scalar);
    }
    /**
   * Subtracts this vector by another vector, changing this vector.
   *
   * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtract(v) {
        return this.setXYZ(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    /**
   * Subtracts this vector by another vector (x,y,z), changing this vector.
   *
   * This is the mutable form of the function minusXYZ(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractXYZ(x, y, z) {
        return this.setXYZ(this.x - x, this.y - y, this.z - z);
    }
    /**
   * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractScalar(scalar) {
        return this.setXYZ(this.x - scalar, this.y - scalar, this.z - scalar);
    }
    /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ multiplyScalar(scalar) {
        return this.setXYZ(this.x * scalar, this.y * scalar, this.z * scalar);
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
        return this.setXYZ(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    /**
   * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ divideScalar(scalar) {
        return this.setXYZ(this.x / scalar, this.y / scalar, this.z / scalar);
    }
    /**
   * Negates this vector (multiplies each component by -1), changing this vector.
   *
   * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ negate() {
        return this.setXYZ(-this.x, -this.y, -this.z);
    }
    /**
   * Sets our value to the Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
   */ setCross(v) {
        return this.setXYZ(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
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
        } else {
            return this.divideScalar(mag);
        }
    }
    /**
   * Rounds each component of this vector with Utils.roundSymmetric.
   *
   * This is the mutable form of the function roundedSymmetric(). This will mutate (change) this vector, in addition
   * to returning the vector itself.
   */ roundSymmetric() {
        return this.setXYZ(Utils.roundSymmetric(this.x), Utils.roundSymmetric(this.y), Utils.roundSymmetric(this.z));
    }
    /**
   * Returns a duck-typed object meant for use with tandem/phet-io serialization.
   */ toStateObject() {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    }
    freeToPool() {
        Vector3.pool.freeToPool(this);
    }
    // static methods
    /**
   * Spherical linear interpolation between two unit vectors.
   *
   * @param start - Start unit vector
   * @param end - End unit vector
   * @param ratio  - Between 0 (at start vector) and 1 (at end vector)
   * @returns Spherical linear interpolation between the start and end
   */ static slerp(start, end, ratio) {
        // @ts-expect-error TODO: import with circular protection https://github.com/phetsims/dot/issues/96
        return dot.Quaternion.slerp(new dot.Quaternion(), dot.Quaternion.getRotationQuaternion(start, end), ratio).timesVector3(start);
    }
    /**
   * Constructs a Vector3 from a duck-typed object, for use with tandem/phet-io deserialization.
   */ static fromStateObject(stateObject) {
        return v3(stateObject.x, stateObject.y, stateObject.z);
    }
    /**
   * Creates a 3-dimensional vector with the specified X, Y and Z values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   */ constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
};
Vector3.pool = new Pool(Vector3, {
    maxSize: 1000,
    initialize: Vector3.prototype.setXYZ,
    defaultArguments: [
        0,
        0,
        0
    ]
});
export { Vector3 as default };
// (read-only) - Helps to identify the dimension of the vector
Vector3.prototype.isVector3 = true;
Vector3.prototype.dimension = 3;
dot.register('Vector3', Vector3);
const v3 = Vector3.pool.create.bind(Vector3.pool);
dot.register('v3', v3);
let ImmutableVector3 = class ImmutableVector3 extends Vector3 {
    /**
   * Throw errors whenever a mutable method is called on our immutable vector
   */ static mutableOverrideHelper(mutableFunctionName) {
        ImmutableVector3.prototype[mutableFunctionName] = ()=>{
            throw new Error(`Cannot call mutable method '${mutableFunctionName}' on immutable Vector3`);
        };
    }
};
ImmutableVector3.mutableOverrideHelper('setXYZ');
ImmutableVector3.mutableOverrideHelper('setX');
ImmutableVector3.mutableOverrideHelper('setY');
ImmutableVector3.mutableOverrideHelper('setZ');
Vector3.ZERO = assert ? new ImmutableVector3(0, 0, 0) : new Vector3(0, 0, 0);
Vector3.X_UNIT = assert ? new ImmutableVector3(1, 0, 0) : new Vector3(1, 0, 0);
Vector3.Y_UNIT = assert ? new ImmutableVector3(0, 1, 0) : new Vector3(0, 1, 0);
Vector3.Z_UNIT = assert ? new ImmutableVector3(0, 0, 1) : new Vector3(0, 0, 1);
Vector3.Vector3IO = new IOType('Vector3IO', {
    valueType: Vector3,
    documentation: 'Basic 3-dimensional vector, represented as (x,y,z)',
    toStateObject: (vector3)=>vector3.toStateObject(),
    fromStateObject: (x)=>Vector3.fromStateObject(x),
    stateSchema: {
        x: NumberIO,
        y: NumberIO,
        z: NumberIO
    }
});
export { v3 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhc2ljIDMtZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5LHopLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyLCB7IHYyIH0gZnJvbSAnLi9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3I0LCB7IHY0IH0gZnJvbSAnLi9WZWN0b3I0LmpzJztcblxuY29uc3QgQURESU5HX0FDQ1VNVUxBVE9SID0gKCB2ZWN0b3I6IFZlY3RvcjMsIG5leHRWZWN0b3I6IFZlY3RvcjMgKSA9PiB7XG4gIHJldHVybiB2ZWN0b3IuYWRkKCBuZXh0VmVjdG9yICk7XG59O1xuXG5leHBvcnQgdHlwZSBWZWN0b3IzU3RhdGVPYmplY3QgPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICB6OiBudW1iZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3IzIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcblxuICAvLyBUaGUgWCBjb29yZGluYXRlIG9mIHRoZSB2ZWN0b3IuXG4gIHB1YmxpYyB4OiBudW1iZXI7XG5cbiAgLy8gVGhlIFkgY29vcmRpbmF0ZSBvZiB0aGUgdmVjdG9yLlxuICBwdWJsaWMgeTogbnVtYmVyO1xuXG4gIC8vIFRoZSBaIGNvb3JkaW5hdGUgb2YgdGhlIHZlY3Rvci5cbiAgcHVibGljIHo6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIHdpdGggdGhlIHNwZWNpZmllZCBYLCBZIGFuZCBaIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHogLSBaIGNvb3JkaW5hdGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy56ID0gejtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBtYWduaXR1ZGUgKEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIHZlY3RvciwgaS5lLiAkXFxzcXJ0e3heMit5XjIrel4yfSQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWFnbml0dWRlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5tYWduaXR1ZGVTcXVhcmVkICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1hZ25pdHVkZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFQgc3F1YXJlZCBtYWduaXR1ZGUgKHNxdWFyZSBvZiB0aGUgRXVjbGlkZWFuL0wyIE5vcm0pIG9mIHRoaXMgdmVjdG9yLCBpLmUuICR4XjIreV4yK3peMiQuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWFnbml0dWRlU3F1YXJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmRvdCggdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjMgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlU3F1YXJlZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2UoIHBvaW50OiBWZWN0b3IzICk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVNxdWFyZWQoIHBvaW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQgKHgseSx6KS5cbiAgICovXG4gIHB1YmxpYyBkaXN0YW5jZVhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBudW1iZXIge1xuICAgIGNvbnN0IGR4ID0gdGhpcy54IC0geDtcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHk7XG4gICAgY29uc3QgZHogPSB0aGlzLnogLSB6O1xuICAgIHJldHVybiBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50LlxuICAgKi9cbiAgcHVibGljIGRpc3RhbmNlU3F1YXJlZCggcG9pbnQ6IFZlY3RvcjMgKTogbnVtYmVyIHtcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHBvaW50Lng7XG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSBwb2ludC55O1xuICAgIGNvbnN0IGR6ID0gdGhpcy56IC0gcG9pbnQuejtcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50ICh4LHkseikuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgZHggPSB0aGlzLnggLSB4O1xuICAgIGNvbnN0IGR5ID0gdGhpcy55IC0geTtcbiAgICBjb25zdCBkeiA9IHRoaXMueiAtIHo7XG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5ICsgZHogKiBkejtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZG90LXByb2R1Y3QgKEV1Y2xpZGVhbiBpbm5lciBwcm9kdWN0KSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciB2LlxuICAgKi9cbiAgcHVibGljIGRvdCggdjogVmVjdG9yMyApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2Lno7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRvdC1wcm9kdWN0IChFdWNsaWRlYW4gaW5uZXIgcHJvZHVjdCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IgKHgseSx6KS5cbiAgICovXG4gIHB1YmxpYyBkb3RYWVooIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogeCArIHRoaXMueSAqIHkgKyB0aGlzLnogKiB6O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBhbmdsZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciwgaW4gdGhlIHJhbmdlICRcXHRoZXRhXFxpblswLCBcXHBpXSQuXG4gICAqXG4gICAqIEVxdWFsIHRvICRcXHRoZXRhID0gXFxjb3Neey0xfSggXFxoYXR7dX0gXFxjZG90IFxcaGF0e3Z9ICkkIHdoZXJlICRcXGhhdHt1fSQgaXMgdGhpcyB2ZWN0b3IgKG5vcm1hbGl6ZWQpIGFuZCAkXFxoYXR7dn0kXG4gICAqIGlzIHRoZSBpbnB1dCB2ZWN0b3IgKG5vcm1hbGl6ZWQpLlxuICAgKi9cbiAgcHVibGljIGFuZ2xlQmV0d2VlbiggdjogVmVjdG9yMyApOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLmFjb3MoIFV0aWxzLmNsYW1wKCB0aGlzLm5vcm1hbGl6ZWQoKS5kb3QoIHYubm9ybWFsaXplZCgpICksIC0xLCAxICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgdGhlIHR3byB2ZWN0b3JzIGhhdmUgZXF1YWwgY29tcG9uZW50c1xuICAgKi9cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFZlY3RvcjMgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gb3RoZXIueCAmJiB0aGlzLnkgPT09IG90aGVyLnkgJiYgdGhpcy56ID09PSBvdGhlci56O1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcHJveGltYXRlIGVxdWFsaXR5IGNvbXBhcmlzb24gYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHR3byB2ZWN0b3JzIGhhcyBubyBjb21wb25lbnQgd2l0aCBhbiBhYnNvbHV0ZSB2YWx1ZSBncmVhdGVyXG4gICAqICAgICAgICAgICAgICAgICAgICAgIHRoYW4gZXBzaWxvbi5cbiAgICovXG4gIHB1YmxpYyBlcXVhbHNFcHNpbG9uKCBvdGhlcjogVmVjdG9yMywgZXBzaWxvbjogbnVtYmVyICk6IGJvb2xlYW4ge1xuICAgIGlmICggIWVwc2lsb24gKSB7XG4gICAgICBlcHNpbG9uID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnggLSBvdGhlci54ICkgKyBNYXRoLmFicyggdGhpcy55IC0gb3RoZXIueSApICsgTWF0aC5hYnMoIHRoaXMueiAtIG90aGVyLnogKSA8PSBlcHNpbG9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZmFsc2UgaWYgYW55IGNvbXBvbmVudCBpcyBOYU4sIGluZmluaXR5LCBvciAtaW5maW5pdHkuIE90aGVyd2lzZSByZXR1cm5zIHRydWUuXG4gICAqL1xuICBwdWJsaWMgaXNGaW5pdGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLnggKSAmJiBpc0Zpbml0ZSggdGhpcy55ICkgJiYgaXNGaW5pdGUoIHRoaXMueiApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIEltbXV0YWJsZXNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHZlY3Rvciwgb3IgaWYgYSB2ZWN0b3IgaXMgcGFzc2VkIGluLCBzZXQgdGhhdCB2ZWN0b3IncyB2YWx1ZXMgdG8gb3Vycy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldCgpLCBpZiBhIHZlY3RvciBpcyBwcm92aWRlZC4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZFxuICAgKiB3aWxsIG5vdCBtb2RpZnkgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIEBwYXJhbSBbdmVjdG9yXSAtIElmIG5vdCBwcm92aWRlZCwgY3JlYXRlcyBhIG5ldyBWZWN0b3IzIHdpdGggZmlsbGVkIGluIHZhbHVlcy4gT3RoZXJ3aXNlLCBmaWxscyBpbiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgdmFsdWVzIG9mIHRoZSBwcm92aWRlZCB2ZWN0b3Igc28gdGhhdCBpdCBlcXVhbHMgdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgY29weSggdmVjdG9yPzogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICBpZiAoIHZlY3RvciApIHtcbiAgICAgIHJldHVybiB2ZWN0b3Iuc2V0KCB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yMyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB2MyggdGhpcy54LCB0aGlzLnksIHRoaXMueiApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIDMtZGltZW5zaW9uYWwgY3Jvc3MtcHJvZHVjdCBvZiB0aGlzIHZlY3RvciBieSB0aGUgcGFzc2VkLWluIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBjcm9zcyggdjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdjMoXG4gICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXG4gICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXG4gICAgICB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2LnhcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZWQgKHJlLXNjYWxlZCkgY29weSBvZiB0aGlzIHZlY3RvciBzdWNoIHRoYXQgaXRzIG1hZ25pdHVkZSBpcyAxLiBJZiBpdHMgaW5pdGlhbCBtYWduaXR1ZGUgaXMgemVybywgYW5cbiAgICogZXJyb3IgaXMgdGhyb3duLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbm9ybWFsaXplKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5IHRoaXNcbiAgICogdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG5vcm1hbGl6ZWQoKTogVmVjdG9yMyB7XG4gICAgY29uc3QgbWFnID0gdGhpcy5tYWduaXR1ZGU7XG4gICAgaWYgKCBtYWcgPT09IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3Qgbm9ybWFsaXplIGEgemVyby1tYWduaXR1ZGUgdmVjdG9yJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB2MyggdGhpcy54IC8gbWFnLCB0aGlzLnkgLyBtYWcsIHRoaXMueiAvIG1hZyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm91bmRTeW1tZXRyaWMoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgcm91bmRlZFN5bW1ldHJpYygpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkucm91bmRTeW1tZXRyaWMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZS1zY2FsZWQgY29weSBvZiB0aGlzIHZlY3RvciBzdWNoIHRoYXQgaXQgaGFzIHRoZSBkZXNpcmVkIG1hZ25pdHVkZS4gSWYgaXRzIGluaXRpYWwgbWFnbml0dWRlIGlzIHplcm8sIGFuIGVycm9yXG4gICAqIGlzIHRocm93bi4gSWYgdGhlIHBhc3NlZC1pbiBtYWduaXR1ZGUgaXMgbmVnYXRpdmUsIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3Igd2lsbCBiZSByZXZlcnNlZC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHNldE1hZ25pdHVkZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyB3aXRoTWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5jb3B5KCkuc2V0TWFnbml0dWRlKCBtYWduaXR1ZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3B5IG9mIHRoaXMgdmVjdG9yLCBzY2FsZWQgYnkgdGhlIGRlc2lyZWQgc2NhbGFyIHZhbHVlLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgdGltZXNTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggdGhpcy54ICogc2NhbGFyLCB0aGlzLnkgKiBzY2FsYXIsIHRoaXMueiAqIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgdGltZXNTY2FsYXIuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtdWx0aXBseSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyB0aW1lcyggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMudGltZXNTY2FsYXIoIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgb2YgdGhpcyB2ZWN0b3IsIG11bHRpcGxpZWQgY29tcG9uZW50LXdpc2UgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3Igdi5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudE11bHRpcGx5KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGNvbXBvbmVudFRpbWVzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggdGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZCgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBwbHVzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggdGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZGl0aW9uIG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3RvciAoeCx5LHopLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkWFlaKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHBsdXNYWVooIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHYzKCB0aGlzLnggKyB4LCB0aGlzLnkgKyB5LCB0aGlzLnogKyB6ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkaXRpb24gb2YgdGhpcyB2ZWN0b3Igd2l0aCBhIHNjYWxhciAoYWRkcyB0aGUgc2NhbGFyIHRvIGV2ZXJ5IGNvbXBvbmVudCksIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGRTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgcGx1c1NjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHYzKCB0aGlzLnggKyBzY2FsYXIsIHRoaXMueSArIHNjYWxhciwgdGhpcy56ICsgc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgdiwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG1pbnVzKCB2OiBWZWN0b3IzICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0aW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yICh4LHkseiksIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzdWJ0cmFjdFhZWigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBtaW51c1hZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdjMoIHRoaXMueCAtIHgsIHRoaXMueSAtIHksIHRoaXMueiAtIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdGlvbiBvZiB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoc3VidHJhY3RzIHRoZSBzY2FsYXIgZnJvbSBldmVyeSBjb21wb25lbnQpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc3VidHJhY3RTY2FsYXIoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgbWludXNTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggdGhpcy54IC0gc2NhbGFyLCB0aGlzLnkgLSBzY2FsYXIsIHRoaXMueiAtIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlzaW9uIG9mIHRoaXMgdmVjdG9yIGJ5IGEgc2NhbGFyIChkaXZpZGVzIGV2ZXJ5IGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGRpdmlkZVNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBkaXZpZGVkU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdjMoIHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyLCB0aGlzLnogLyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOZWdhdGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZXZlcnkgY29tcG9uZW50IGJ5IC0xKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICovXG4gIHB1YmxpYyBuZWdhdGVkKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyggLXRoaXMueCwgLXRoaXMueSwgLXRoaXMueiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0aGlzIHZlY3RvciAocmF0aW89MCkgYW5kIGFub3RoZXIgdmVjdG9yIChyYXRpbz0xKS5cbiAgICpcbiAgICogQHBhcmFtIHZlY3RvclxuICAgKiBAcGFyYW0gcmF0aW8gLSBOb3QgbmVjZXNzYXJpbHkgY29uc3RyYWluZWQgaW4gWzAsIDFdXG4gICAqL1xuICBwdWJsaWMgYmxlbmQoIHZlY3RvcjogVmVjdG9yMywgcmF0aW86IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5wbHVzKCB2ZWN0b3IubWludXMoIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3IzICkudGltZXMoIHJhdGlvICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXZlcmFnZSAobWlkcG9pbnQpIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGF2ZXJhZ2UoIHZlY3RvcjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5ibGVuZCggdmVjdG9yLCAwLjUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGEgY29tcG9uZW50LWJhc2VkIG1lYW4gb2YgYWxsIHZlY3RvcnMgcHJvdmlkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGF2ZXJhZ2UoIHZlY3RvcnM6IFZlY3RvcjNbXSApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBhZGRlZCA9IF8ucmVkdWNlKCB2ZWN0b3JzLCBBRERJTkdfQUNDVU1VTEFUT1IsIG5ldyBWZWN0b3IzKCAwLCAwLCAwICkgKTtcbiAgICByZXR1cm4gYWRkZWQuZGl2aWRlU2NhbGFyKCB2ZWN0b3JzLmxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjMoJHt0aGlzLnh9LCAke3RoaXMueX0sICR7dGhpcy56fSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgdG8gYSAyLWRpbWVuc2lvbmFsIHZlY3RvciwgZGlzY2FyZGluZyB0aGUgei1jb21wb25lbnQuXG4gICAqL1xuICBwdWJsaWMgdG9WZWN0b3IyKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggdGhpcy54LCB0aGlzLnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIHRvIGEgNC1kaW1lbnNpb25hbCB2ZWN0b3IsIHdpdGggdGhlIHctY29tcG9uZW50IGVxdWFsIHRvIDEgKHVzZWZ1bCBmb3IgaG9tb2dlbmVvdXMgY29vcmRpbmF0ZXMpLlxuICAgKi9cbiAgcHVibGljIHRvVmVjdG9yNCgpOiBWZWN0b3I0IHtcbiAgICByZXR1cm4gdjQoIHRoaXMueCwgdGhpcy55LCB0aGlzLnosIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIHRvIGEgNC1kaW1lbnNpb25hbCB2ZWN0b3IsIHdpdGggdGhlIHctY29tcG9uZW50IGVxdWFsIHRvIDBcbiAgICovXG4gIHB1YmxpYyB0b1ZlY3RvcjRaZXJvKCk6IFZlY3RvcjQge1xuICAgIHJldHVybiB2NCggdGhpcy54LCB0aGlzLnksIHRoaXMueiwgMCApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIE11dGFibGVzXG4gICAqIC0gYWxsIG11dGF0aW9uIHNob3VsZCBnbyB0aHJvdWdoIHNldFhZWiAvIHNldFggLyBzZXRZIC8gc2V0WlxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFNldHMgYWxsIG9mIHRoZSBjb21wb25lbnRzIG9mIHRoaXMgdmVjdG9yLCByZXR1cm5pbmcgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBzZXRYWVooIHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3IzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHgtY29tcG9uZW50IG9mIHRoaXMgdmVjdG9yLCByZXR1cm5pbmcgdGhpcy5cbiAgICovXG4gIHB1YmxpYyBzZXRYKCB4OiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgdGhpcy54ID0geDtcbiAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZlY3RvcjM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgeS1jb21wb25lbnQgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFkoIHk6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmVjdG9yMztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB6LWNvbXBvbmVudCBvZiB0aGlzIHZlY3RvciwgcmV0dXJuaW5nIHRoaXMuXG4gICAqL1xuICBwdWJsaWMgc2V0WiggejogbnVtYmVyICk6IFZlY3RvcjMge1xuICAgIHRoaXMueiA9IHo7XG4gICAgcmV0dXJuIHRoaXMgYXMgdW5rbm93biBhcyBWZWN0b3IzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyB2ZWN0b3IgdG8gYmUgYSBjb3B5IG9mIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXQoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB2LngsIHYueSwgdi56ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWFnbml0dWRlIG9mIHRoaXMgdmVjdG9yLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhpcyBmbGlwcyB0aGUgdmVjdG9yIGFuZCBzZXRzIGl0c1xuICAgKiBtYWduaXR1ZGUgdG8gYWJzKCBtYWduaXR1ZGUgKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWFnbml0dWRlKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICBjb25zdCBzY2FsZSA9IG1hZ25pdHVkZSAvIHRoaXMubWFnbml0dWRlO1xuICAgIHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCBzY2FsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW5vdGhlciB2ZWN0b3IgdG8gdGhpcyB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHBsdXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBhZGQoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbm90aGVyIHZlY3RvciAoeCx5LHopIHRvIHRoaXMgdmVjdG9yLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzWFlaKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkWFlaKCB4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB0aGlzLnNldFhZWiggdGhpcy54ICsgeCwgdGhpcy55ICsgeSwgdGhpcy56ICsgeiApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzY2FsYXIgdG8gdGhpcyB2ZWN0b3IgKGFkZGVkIHRvIGV2ZXJ5IGNvbXBvbmVudCksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHBsdXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBhZGRTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB0aGlzLnNldFhZWiggdGhpcy54ICsgc2NhbGFyLCB0aGlzLnkgKyBzY2FsYXIsIHRoaXMueiArIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0cyB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzdWJ0cmFjdCggdjogVmVjdG9yMyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgKHgseSx6KSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNYWVooKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzdWJ0cmFjdFhZWiggeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIHRoaXMueCAtIHgsIHRoaXMueSAtIHksIHRoaXMueiAtIHogKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhpcyB2ZWN0b3IgYnkgYSBzY2FsYXIgKHN1YnRyYWN0cyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzdWJ0cmFjdFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggLSBzY2FsYXIsIHRoaXMueSAtIHNjYWxhciwgdGhpcy56IC0gc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdGltZXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciwgdGhpcy56ICogc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqIFNhbWUgYXMgbXVsdGlwbHlTY2FsYXIuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdGltZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGxpZXMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgY29tcG9uZW50LXdpc2UsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudFRpbWVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgY29tcG9uZW50TXVsdGlwbHkoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56ICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoZGl2aWRlcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGl2aWRlZFNjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpdmlkZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCB0aGlzLnggLyBzY2FsYXIsIHRoaXMueSAvIHNjYWxhciwgdGhpcy56IC8gc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIHZlY3RvciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSAtMSksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBuZWdhdGUoKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKCAtdGhpcy54LCAtdGhpcy55LCAtdGhpcy56ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBvdXIgdmFsdWUgdG8gdGhlIEV1Y2xpZGVhbiAzLWRpbWVuc2lvbmFsIGNyb3NzLXByb2R1Y3Qgb2YgdGhpcyB2ZWN0b3IgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgc2V0Q3Jvc3MoIHY6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFlaKFxuICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxuICAgICAgdGhpcy56ICogdi54IC0gdGhpcy54ICogdi56LFxuICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoaXMgdmVjdG9yIChyZXNjYWxlcyB0byB3aGVyZSB0aGUgbWFnbml0dWRlIGlzIDEpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgbm9ybWFsaXplKCk6IFZlY3RvcjMge1xuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xuICAgIGlmICggbWFnID09PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IG5vcm1hbGl6ZSBhIHplcm8tbWFnbml0dWRlIHZlY3RvcicgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIG1hZyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3VuZHMgZWFjaCBjb21wb25lbnQgb2YgdGhpcyB2ZWN0b3Igd2l0aCBVdGlscy5yb3VuZFN5bW1ldHJpYy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZGVkU3ltbWV0cmljKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uXG4gICAqIHRvIHJldHVybmluZyB0aGUgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyByb3VuZFN5bW1ldHJpYygpOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWVooIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB0aGlzLnggKSwgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMueSApLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy56ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZHVjay10eXBlZCBvYmplY3QgbWVhbnQgZm9yIHVzZSB3aXRoIHRhbmRlbS9waGV0LWlvIHNlcmlhbGl6YXRpb24uXG4gICAqL1xuICBwdWJsaWMgdG9TdGF0ZU9iamVjdCgpOiBWZWN0b3IzU3RhdGVPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0aGlzLngsXG4gICAgICB5OiB0aGlzLnksXG4gICAgICB6OiB0aGlzLnpcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgVmVjdG9yMy5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBWZWN0b3IzLCB7XG4gICAgbWF4U2l6ZTogMTAwMCxcbiAgICBpbml0aWFsaXplOiBWZWN0b3IzLnByb3RvdHlwZS5zZXRYWVosXG4gICAgZGVmYXVsdEFyZ3VtZW50czogWyAwLCAwLCAwIF1cbiAgfSApO1xuXG4gIC8vIHN0YXRpYyBtZXRob2RzXG5cbiAgLyoqXG4gICAqIFNwaGVyaWNhbCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB1bml0IHZlY3RvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCAtIFN0YXJ0IHVuaXQgdmVjdG9yXG4gICAqIEBwYXJhbSBlbmQgLSBFbmQgdW5pdCB2ZWN0b3JcbiAgICogQHBhcmFtIHJhdGlvICAtIEJldHdlZW4gMCAoYXQgc3RhcnQgdmVjdG9yKSBhbmQgMSAoYXQgZW5kIHZlY3RvcilcbiAgICogQHJldHVybnMgU3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2xlcnAoIHN0YXJ0OiBWZWN0b3IzLCBlbmQ6IFZlY3RvcjMsIHJhdGlvOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBpbXBvcnQgd2l0aCBjaXJjdWxhciBwcm90ZWN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgcmV0dXJuIGRvdC5RdWF0ZXJuaW9uLnNsZXJwKCBuZXcgZG90LlF1YXRlcm5pb24oKSwgZG90LlF1YXRlcm5pb24uZ2V0Um90YXRpb25RdWF0ZXJuaW9uKCBzdGFydCwgZW5kICksIHJhdGlvICkudGltZXNWZWN0b3IzKCBzdGFydCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBWZWN0b3IzIGZyb20gYSBkdWNrLXR5cGVkIG9iamVjdCwgZm9yIHVzZSB3aXRoIHRhbmRlbS9waGV0LWlvIGRlc2VyaWFsaXphdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdDogVmVjdG9yM1N0YXRlT2JqZWN0ICk6IFZlY3RvcjMge1xuICAgIHJldHVybiB2MyhcbiAgICAgIHN0YXRlT2JqZWN0LngsXG4gICAgICBzdGF0ZU9iamVjdC55LFxuICAgICAgc3RhdGVPYmplY3QuelxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgaXNWZWN0b3IzITogYm9vbGVhbjtcbiAgcHVibGljIGRpbWVuc2lvbiE6IG51bWJlcjtcbiAgcHVibGljIHN0YXRpYyBaRVJPOiBWZWN0b3IzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgWF9VTklUOiBWZWN0b3IzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgWV9VTklUOiBWZWN0b3IzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgWl9VTklUOiBWZWN0b3IzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG4gIHB1YmxpYyBzdGF0aWMgVmVjdG9yM0lPOiBJT1R5cGU7XG59XG5cbi8vIChyZWFkLW9ubHkpIC0gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdmVjdG9yXG5WZWN0b3IzLnByb3RvdHlwZS5pc1ZlY3RvcjMgPSB0cnVlO1xuVmVjdG9yMy5wcm90b3R5cGUuZGltZW5zaW9uID0gMztcblxuZG90LnJlZ2lzdGVyKCAnVmVjdG9yMycsIFZlY3RvcjMgKTtcblxuY29uc3QgdjMgPSBWZWN0b3IzLnBvb2wuY3JlYXRlLmJpbmQoIFZlY3RvcjMucG9vbCApO1xuZG90LnJlZ2lzdGVyKCAndjMnLCB2MyApO1xuXG5jbGFzcyBJbW11dGFibGVWZWN0b3IzIGV4dGVuZHMgVmVjdG9yMyB7XG4gIC8qKlxuICAgKiBUaHJvdyBlcnJvcnMgd2hlbmV2ZXIgYSBtdXRhYmxlIG1ldGhvZCBpcyBjYWxsZWQgb24gb3VyIGltbXV0YWJsZSB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbXV0YWJsZU92ZXJyaWRlSGVscGVyKCBtdXRhYmxlRnVuY3Rpb25OYW1lOiAnc2V0WCcgfCAnc2V0WScgfCAnc2V0WicgfCAnc2V0WFlaJyApOiB2b2lkIHtcbiAgICBJbW11dGFibGVWZWN0b3IzLnByb3RvdHlwZVsgbXV0YWJsZUZ1bmN0aW9uTmFtZSBdID0gKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IGNhbGwgbXV0YWJsZSBtZXRob2QgJyR7bXV0YWJsZUZ1bmN0aW9uTmFtZX0nIG9uIGltbXV0YWJsZSBWZWN0b3IzYCApO1xuICAgIH07XG4gIH1cbn1cblxuSW1tdXRhYmxlVmVjdG9yMy5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRYWVonICk7XG5JbW11dGFibGVWZWN0b3IzLm11dGFibGVPdmVycmlkZUhlbHBlciggJ3NldFgnICk7XG5JbW11dGFibGVWZWN0b3IzLm11dGFibGVPdmVycmlkZUhlbHBlciggJ3NldFknICk7XG5JbW11dGFibGVWZWN0b3IzLm11dGFibGVPdmVycmlkZUhlbHBlciggJ3NldFonICk7XG5cblZlY3RvcjMuWkVSTyA9IGFzc2VydCA/IG5ldyBJbW11dGFibGVWZWN0b3IzKCAwLCAwLCAwICkgOiBuZXcgVmVjdG9yMyggMCwgMCwgMCApO1xuVmVjdG9yMy5YX1VOSVQgPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMyggMSwgMCwgMCApIDogbmV3IFZlY3RvcjMoIDEsIDAsIDAgKTtcblZlY3RvcjMuWV9VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjMoIDAsIDEsIDAgKSA6IG5ldyBWZWN0b3IzKCAwLCAxLCAwICk7XG5WZWN0b3IzLlpfVU5JVCA9IGFzc2VydCA/IG5ldyBJbW11dGFibGVWZWN0b3IzKCAwLCAwLCAxICkgOiBuZXcgVmVjdG9yMyggMCwgMCwgMSApO1xuXG5WZWN0b3IzLlZlY3RvcjNJTyA9IG5ldyBJT1R5cGUoICdWZWN0b3IzSU8nLCB7XG4gIHZhbHVlVHlwZTogVmVjdG9yMyxcbiAgZG9jdW1lbnRhdGlvbjogJ0Jhc2ljIDMtZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5LHopJyxcbiAgdG9TdGF0ZU9iamVjdDogKCB2ZWN0b3IzOiBWZWN0b3IzICkgPT4gdmVjdG9yMy50b1N0YXRlT2JqZWN0KCksXG4gIGZyb21TdGF0ZU9iamVjdDogeCA9PiBWZWN0b3IzLmZyb21TdGF0ZU9iamVjdCggeCApLFxuICBzdGF0ZVNjaGVtYToge1xuICAgIHg6IE51bWJlcklPLFxuICAgIHk6IE51bWJlcklPLFxuICAgIHo6IE51bWJlcklPXG4gIH1cbn0gKTtcblxuZXhwb3J0IHsgdjMgfTsiXSwibmFtZXMiOlsiUG9vbCIsIklPVHlwZSIsIk51bWJlcklPIiwiZG90IiwiVXRpbHMiLCJ2MiIsInY0IiwiQURESU5HX0FDQ1VNVUxBVE9SIiwidmVjdG9yIiwibmV4dFZlY3RvciIsImFkZCIsIlZlY3RvcjMiLCJnZXRNYWduaXR1ZGUiLCJNYXRoIiwic3FydCIsIm1hZ25pdHVkZVNxdWFyZWQiLCJtYWduaXR1ZGUiLCJnZXRNYWduaXR1ZGVTcXVhcmVkIiwiZGlzdGFuY2UiLCJwb2ludCIsImRpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlWFlaIiwieCIsInkiLCJ6IiwiZHgiLCJkeSIsImR6IiwiZGlzdGFuY2VTcXVhcmVkWFlaIiwidiIsImRvdFhZWiIsImFuZ2xlQmV0d2VlbiIsImFjb3MiLCJjbGFtcCIsIm5vcm1hbGl6ZWQiLCJlcXVhbHMiLCJvdGhlciIsImVxdWFsc0Vwc2lsb24iLCJlcHNpbG9uIiwiYWJzIiwiaXNGaW5pdGUiLCJjb3B5Iiwic2V0IiwidjMiLCJjcm9zcyIsIm1hZyIsIkVycm9yIiwicm91bmRlZFN5bW1ldHJpYyIsInJvdW5kU3ltbWV0cmljIiwid2l0aE1hZ25pdHVkZSIsInNldE1hZ25pdHVkZSIsInRpbWVzU2NhbGFyIiwic2NhbGFyIiwidGltZXMiLCJjb21wb25lbnRUaW1lcyIsInBsdXMiLCJwbHVzWFlaIiwicGx1c1NjYWxhciIsIm1pbnVzIiwibWludXNYWVoiLCJtaW51c1NjYWxhciIsImRpdmlkZWRTY2FsYXIiLCJuZWdhdGVkIiwiYmxlbmQiLCJyYXRpbyIsImF2ZXJhZ2UiLCJ2ZWN0b3JzIiwiYWRkZWQiLCJfIiwicmVkdWNlIiwiZGl2aWRlU2NhbGFyIiwibGVuZ3RoIiwidG9TdHJpbmciLCJ0b1ZlY3RvcjIiLCJ0b1ZlY3RvcjQiLCJ0b1ZlY3RvcjRaZXJvIiwic2V0WFlaIiwic2V0WCIsInNldFkiLCJzZXRaIiwic2NhbGUiLCJtdWx0aXBseVNjYWxhciIsImFkZFhZWiIsImFkZFNjYWxhciIsInN1YnRyYWN0Iiwic3VidHJhY3RYWVoiLCJzdWJ0cmFjdFNjYWxhciIsIm11bHRpcGx5IiwiY29tcG9uZW50TXVsdGlwbHkiLCJuZWdhdGUiLCJzZXRDcm9zcyIsIm5vcm1hbGl6ZSIsInRvU3RhdGVPYmplY3QiLCJmcmVlVG9Qb29sIiwicG9vbCIsInNsZXJwIiwic3RhcnQiLCJlbmQiLCJRdWF0ZXJuaW9uIiwiZ2V0Um90YXRpb25RdWF0ZXJuaW9uIiwidGltZXNWZWN0b3IzIiwiZnJvbVN0YXRlT2JqZWN0Iiwic3RhdGVPYmplY3QiLCJtYXhTaXplIiwiaW5pdGlhbGl6ZSIsInByb3RvdHlwZSIsImRlZmF1bHRBcmd1bWVudHMiLCJpc1ZlY3RvcjMiLCJkaW1lbnNpb24iLCJyZWdpc3RlciIsImNyZWF0ZSIsImJpbmQiLCJJbW11dGFibGVWZWN0b3IzIiwibXV0YWJsZU92ZXJyaWRlSGVscGVyIiwibXV0YWJsZUZ1bmN0aW9uTmFtZSIsIlpFUk8iLCJhc3NlcnQiLCJYX1VOSVQiLCJZX1VOSVQiLCJaX1VOSVQiLCJWZWN0b3IzSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwidmVjdG9yMyIsInN0YXRlU2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFVBQXlCLDZCQUE2QjtBQUM3RCxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxPQUFPQyxTQUFTLFdBQVc7QUFDM0IsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLFNBQWtCQyxFQUFFLFFBQVEsZUFBZTtBQUMzQyxTQUFrQkMsRUFBRSxRQUFRLGVBQWU7QUFFM0MsTUFBTUMscUJBQXFCLENBQUVDLFFBQWlCQztJQUM1QyxPQUFPRCxPQUFPRSxHQUFHLENBQUVEO0FBQ3JCO0FBUWUsSUFBQSxBQUFNRSxVQUFOLE1BQU1BO0lBeUJuQjs7R0FFQyxHQUNELEFBQU9DLGVBQXVCO1FBQzVCLE9BQU9DLEtBQUtDLElBQUksQ0FBRSxJQUFJLENBQUNDLGdCQUFnQjtJQUN6QztJQUVBLElBQVdDLFlBQW9CO1FB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