// Copyright 2013-2024, University of Colorado Boulder
/**
 * Basic 2-dimensional vector, represented as (x,y).  Values can be numeric, or NaN or infinite.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../phet-core/js/Pool.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector3 from './Vector3.js';
const ADDING_ACCUMULATOR = (vector, nextVector)=>{
    return vector.add(nextVector);
};
let Vector2 = class Vector2 {
    /**
   * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2}$.
   */ getMagnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    get magnitude() {
        return this.getMagnitude();
    }
    /**
   * The squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2$.
   */ getMagnitudeSquared() {
        return this.x * this.x + this.y * this.y;
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
   * The Euclidean distance between this vector (treated as a point) and another point (x,y).
   */ distanceXY(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point.
   */ distanceSquared(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;
        return dx * dx + dy * dy;
    }
    /**
   * The squared Euclidean distance between this vector (treated as a point) and another point with coordinates (x,y).
   */ distanceSquaredXY(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector v.
   */ dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    /**
   * The dot-product (Euclidean inner product) between this vector and another vector (x,y).
   */ dotXY(x, y) {
        return this.x * x + this.y * y;
    }
    /**
   * The angle $\theta$ of this vector, such that this vector is equal to
   * $$ u = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix} $$
   * for the magnitude $r \ge 0$ of the vector, with $\theta\in(-\pi,\pi]$
   */ getAngle() {
        return Math.atan2(this.y, this.x);
    }
    get angle() {
        return this.getAngle();
    }
    /**
   * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
   *
   * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
   * is the input vector (normalized).
   */ angleBetween(v) {
        const thisMagnitude = this.magnitude;
        const vMagnitude = v.magnitude;
        // @ts-expect-error TODO: import with circular protection https://github.com/phetsims/dot/issues/96
        return Math.acos(dot.clamp((this.x * v.x + this.y * v.y) / (thisMagnitude * vMagnitude), -1, 1));
    }
    /**
   * Exact equality comparison between this vector and another vector.

   * @returns - Whether the two vectors have equal components
   */ equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    /**
   * Approximate equality comparison between this vector and another vector.
   *
   * @returns - Whether difference between the two vectors has no component with an absolute value greater than epsilon.
   */ equalsEpsilon(other, epsilon) {
        if (!epsilon) {
            epsilon = 0;
        }
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y)) <= epsilon;
    }
    /**
   * Returns false if either component is NaN, infinity, or -infinity. Otherwise returns true.
   */ isFinite() {
        return isFinite(this.x) && isFinite(this.y);
    }
    /*---------------------------------------------------------------------------*
   * Immutables
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this vector, or if a vector is passed in, set that vector's values to ours.
   *
   * This is the immutable form of the function set(), if a vector is provided. This will return a new vector, and
   * will not modify this vector.
   *
   * @param [vector] - If not provided, creates a new Vector2 with filled in values. Otherwise, fills in the
   *                   values of the provided vector so that it equals this vector.
   */ copy(vector) {
        if (vector) {
            return vector.set(this);
        } else {
            return v2(this.x, this.y);
        }
    }
    /**
   * The scalar value of the z-component of the equivalent 3-dimensional cross product:
   * $$ f( u, v ) = \left( \begin{bmatrix} u_x \\ u_y \\ 0 \end{bmatrix} \times \begin{bmatrix} v_x \\ v_y \\ 0 \end{bmatrix} \right)_z = u_x v_y - u_y v_x $$
   */ crossScalar(v) {
        return this.x * v.y - this.y * v.x;
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
            return v2(this.x / mag, this.y / mag);
        }
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
   */ withMagnitude(magnitude) {
        return this.copy().setMagnitude(magnitude);
    }
    /**
   * Copy of this vector, scaled by the desired scalar value.
   *
   * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
   * this vector.
   */ timesScalar(scalar) {
        return v2(this.x * scalar, this.y * scalar);
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
        return v2(this.x * v.x, this.y * v.y);
    }
    /**
   * Addition of this vector and another vector, returning a copy.
   *
   * This is the immutable form of the function add(). This will return a new vector, and will not modify
   * this vector.
   */ plus(v) {
        return v2(this.x + v.x, this.y + v.y);
    }
    /**
   * Addition of this vector and another vector (x,y), returning a copy.
   *
   * This is the immutable form of the function addXY(). This will return a new vector, and will not modify
   * this vector.
   */ plusXY(x, y) {
        return v2(this.x + x, this.y + y);
    }
    /**
   * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
   *
   * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
   * this vector.
   */ plusScalar(scalar) {
        return v2(this.x + scalar, this.y + scalar);
    }
    /**
   * Subtraction of this vector by another vector v, returning a copy.
   *
   * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
   * this vector.
   */ minus(v) {
        return v2(this.x - v.x, this.y - v.y);
    }
    /**
   * Subtraction of this vector by another vector (x,y), returning a copy.
   *
   * This is the immutable form of the function subtractXY(). This will return a new vector, and will not modify
   * this vector.
   */ minusXY(x, y) {
        return v2(this.x - x, this.y - y);
    }
    /**
   * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
   *
   * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
   * this vector.
   */ minusScalar(scalar) {
        return v2(this.x - scalar, this.y - scalar);
    }
    /**
   * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
   *
   * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
   * this vector.
   */ dividedScalar(scalar) {
        return v2(this.x / scalar, this.y / scalar);
    }
    /**
   * Negated copy of this vector (multiplies every component by -1).
   *
   * This is the immutable form of the function negate(). This will return a new vector, and will not modify
   * this vector.
   */ negated() {
        return v2(-this.x, -this.y);
    }
    /**
   * Rotated by -pi/2 (perpendicular to this vector), returned as a copy.
   */ getPerpendicular() {
        return v2(this.y, -this.x);
    }
    get perpendicular() {
        return this.getPerpendicular();
    }
    /**
   * Rotated by an arbitrary angle, in radians. Returned as a copy.
   *
   * This is the immutable form of the function rotate(). This will return a new vector, and will not modify
   * this vector.
   *
   * @param angle - In radians
   */ rotated(angle) {
        const newAngle = this.angle + angle;
        const mag = this.magnitude;
        return v2(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
    }
    /**
   * Mutable method that rotates this vector about an x,y point.
   *
   * @param x - origin of rotation in x
   * @param y - origin of rotation in y
   * @param angle - radians to rotate
   * @returns this for chaining
   */ rotateAboutXY(x, y, angle) {
        const dx = this.x - x;
        const dy = this.y - y;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        this.x = x + dx * cos - dy * sin;
        this.y = y + dx * sin + dy * cos;
        return this;
    }
    /**
   * Same as rotateAboutXY but with a point argument.
   */ rotateAboutPoint(point, angle) {
        return this.rotateAboutXY(point.x, point.y, angle);
    }
    /**
   * Immutable method that returns a new Vector2 that is rotated about the given point.
   *
   * @param x - origin for rotation in x
   * @param y - origin for rotation in y
   * @param angle - radians to rotate
   */ rotatedAboutXY(x, y, angle) {
        return v2(this.x, this.y).rotateAboutXY(x, y, angle);
    }
    /**
   * Immutable method that returns a new Vector2 rotated about the given point.
   */ rotatedAboutPoint(point, angle) {
        return this.rotatedAboutXY(point.x, point.y, angle);
    }
    /**
   * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
   *
   * @param vector
   * @param ratio - Not necessarily constrained in [0, 1]
   */ blend(vector, ratio) {
        return v2(this.x + (vector.x - this.x) * ratio, this.y + (vector.y - this.y) * ratio);
    }
    /**
   * The average (midpoint) between this vector and another vector.
   */ average(vector) {
        return this.blend(vector, 0.5);
    }
    /**
   * Take a component-based mean of all vectors provided.
   */ static average(vectors) {
        const added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector2(0, 0));
        return added.divideScalar(vectors.length);
    }
    /**
   * Debugging string for the vector.
   */ toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
    /**
   * Converts this to a 3-dimensional vector, with the z-component equal to 0.
   */ toVector3() {
        return new Vector3(this.x, this.y, 0);
    }
    /*---------------------------------------------------------------------------*
   * Mutables
   * - all mutation should go through setXY / setX / setY
   *---------------------------------------------------------------------------*/ /**
   * Sets all of the components of this vector, returning this.
   */ setXY(x, y) {
        this.x = x;
        this.y = y;
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
   * Sets this vector to be a copy of another vector.
   *
   * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
   * this vector itself.
   */ set(v) {
        return this.setXY(v.x, v.y);
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
        return this.setXY(this.x + v.x, this.y + v.y);
    }
    /**
   * Adds another vector (x,y) to this vector, changing this vector.
   *
   * This is the mutable form of the function plusXY(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addXY(x, y) {
        return this.setXY(this.x + x, this.y + y);
    }
    /**
   * Adds a scalar to this vector (added to every component), changing this vector.
   *
   * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ addScalar(scalar) {
        return this.setXY(this.x + scalar, this.y + scalar);
    }
    /**
   * Subtracts this vector by another vector, changing this vector.
   *
   * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtract(v) {
        return this.setXY(this.x - v.x, this.y - v.y);
    }
    /**
   * Subtracts this vector by another vector (x,y), changing this vector.
   *
   * This is the mutable form of the function minusXY(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractXY(x, y) {
        return this.setXY(this.x - x, this.y - y);
    }
    /**
   * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ subtractScalar(scalar) {
        return this.setXY(this.x - scalar, this.y - scalar);
    }
    /**
   * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ multiplyScalar(scalar) {
        return this.setXY(this.x * scalar, this.y * scalar);
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
        return this.setXY(this.x * v.x, this.y * v.y);
    }
    /**
   * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
   *
   * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ divideScalar(scalar) {
        return this.setXY(this.x / scalar, this.y / scalar);
    }
    /**
   * Negates this vector (multiplies each component by -1), changing this vector.
   *
   * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   */ negate() {
        return this.setXY(-this.x, -this.y);
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
        return this.setXY(Utils.roundSymmetric(this.x), Utils.roundSymmetric(this.y));
    }
    /**
   * Rotates this vector by the angle (in radians), changing this vector.
   *
   * This is the mutable form of the function rotated(). This will mutate (change) this vector, in addition to
   * returning this vector itself.
   *
   * @param angle - In radians
   */ rotate(angle) {
        const newAngle = this.angle + angle;
        const mag = this.magnitude;
        return this.setXY(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
    }
    /**
   * Sets this vector's value to be the x,y values matching the given magnitude and angle (in radians), changing
   * this vector, and returning itself.
   *
   * @param magnitude
   * @param angle - In radians
   */ setPolar(magnitude, angle) {
        return this.setXY(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }
    /**
   * Returns a duck-typed object meant for use with tandem/phet-io serialization. Although this is redundant with
   * stateSchema, it is a nice feature of such a heavily-used type to be able to call toStateObject directly on the type.
   *
   * @returns - see stateSchema for schema
   */ toStateObject() {
        return {
            x: this.x,
            y: this.y
        };
    }
    freeToPool() {
        Vector2.pool.freeToPool(this);
    }
    // static methods
    /**
   * Returns a Vector2 with the specified magnitude $r$ and angle $\theta$ (in radians), with the formula:
   * $$ f( r, \theta ) = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix} $$
   */ static createPolar(magnitude, angle) {
        return new Vector2(0, 0).setPolar(magnitude, angle);
    }
    /**
   * Constructs a Vector2 from a duck-typed object, for use with tandem/phet-io deserialization.
   *
   * @param stateObject - see stateSchema for schema
   */ static fromStateObject(stateObject) {
        return v2(stateObject.x, stateObject.y);
    }
    /**
   * Allocation-free implementation that gets the angle between two vectors
   *
   * @returns the angle between the vectors
   */ static getAngleBetweenVectors(startVector, endVector) {
        const dx = endVector.x - startVector.x;
        const dy = endVector.y - startVector.y;
        return Math.atan2(dy, dx);
    }
    /**
   * Allocation-free way to get the distance between vectors.
   *
   * @returns the angle between the vectors
   */ static getDistanceBetweenVectors(startVector, endVector) {
        const dx = endVector.x - startVector.x;
        const dy = endVector.y - startVector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
   * Creates a 2-dimensional vector with the specified X and Y values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   */ constructor(x, y){
        this.x = x;
        this.y = y;
    }
};
Vector2.pool = new Pool(Vector2, {
    maxSize: 1000,
    initialize: Vector2.prototype.setXY,
    defaultArguments: [
        0,
        0
    ]
});
export { Vector2 as default };
// (read-only) - Helps to identify the dimension of the vector
Vector2.prototype.isVector2 = true;
Vector2.prototype.dimension = 2;
dot.register('Vector2', Vector2);
const v2 = Vector2.pool.create.bind(Vector2.pool);
dot.register('v2', v2);
let ImmutableVector2 = class ImmutableVector2 extends Vector2 {
    /**
   * Throw errors whenever a mutable method is called on our immutable vector
   */ static mutableOverrideHelper(mutableFunctionName) {
        ImmutableVector2.prototype[mutableFunctionName] = ()=>{
            throw new Error(`Cannot call mutable method '${mutableFunctionName}' on immutable Vector2`);
        };
    }
};
ImmutableVector2.mutableOverrideHelper('setXY');
ImmutableVector2.mutableOverrideHelper('setX');
ImmutableVector2.mutableOverrideHelper('setY');
Vector2.ZERO = assert ? new ImmutableVector2(0, 0) : new Vector2(0, 0);
Vector2.X_UNIT = assert ? new ImmutableVector2(1, 0) : new Vector2(1, 0);
Vector2.Y_UNIT = assert ? new ImmutableVector2(0, 1) : new Vector2(0, 1);
const STATE_SCHEMA = {
    x: NumberIO,
    y: NumberIO
};
Vector2.Vector2IO = new IOType('Vector2IO', {
    valueType: Vector2,
    stateSchema: STATE_SCHEMA,
    toStateObject: (vector2)=>vector2.toStateObject(),
    fromStateObject: (stateObject)=>Vector2.fromStateObject(stateObject),
    documentation: 'A numerical object with x and y properties, like {x:3,y:4}'
});
export { v2 };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhc2ljIDItZGltZW5zaW9uYWwgdmVjdG9yLCByZXByZXNlbnRlZCBhcyAoeCx5KS4gIFZhbHVlcyBjYW4gYmUgbnVtZXJpYywgb3IgTmFOIG9yIGluZmluaXRlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgeyBTdGF0ZU9iamVjdCB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdGF0ZVNjaGVtYS5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmNvbnN0IEFERElOR19BQ0NVTVVMQVRPUiA9ICggdmVjdG9yOiBWZWN0b3IyLCBuZXh0VmVjdG9yOiBWZWN0b3IyICkgPT4ge1xuICByZXR1cm4gdmVjdG9yLmFkZCggbmV4dFZlY3RvciApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yMiBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XG5cbiAgLy8gVGhlIFggY29vcmRpbmF0ZSBvZiB0aGUgdmVjdG9yLlxuICBwdWJsaWMgeDogbnVtYmVyO1xuXG4gIC8vIFRoZSBZIGNvb3JkaW5hdGUgb2YgdGhlIHZlY3Rvci5cbiAgcHVibGljIHk6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIDItZGltZW5zaW9uYWwgdmVjdG9yIHdpdGggdGhlIHNwZWNpZmllZCBYIGFuZCBZIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHggLSBYIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHkgLSBZIGNvb3JkaW5hdGVcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeDogbnVtYmVyLCB5OiBudW1iZXIgKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWduaXR1ZGUgKEV1Y2xpZGVhbi9MMiBOb3JtKSBvZiB0aGlzIHZlY3RvciwgaS5lLiAkXFxzcXJ0e3heMit5XjJ9JC5cbiAgICovXG4gIHB1YmxpYyBnZXRNYWduaXR1ZGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLm1hZ25pdHVkZVNxdWFyZWQgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFnbml0dWRlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1hZ25pdHVkZSgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIG1hZ25pdHVkZSAoc3F1YXJlIG9mIHRoZSBFdWNsaWRlYW4vTDIgTm9ybSkgb2YgdGhpcyB2ZWN0b3IsIGkuZS4gJHheMit5XjIkLlxuICAgKi9cbiAgcHVibGljIGdldE1hZ25pdHVkZVNxdWFyZWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogdGhpcy54ICsgdGhpcy55ICogdGhpcy55O1xuICB9XG5cbiAgcHVibGljIGdldCBtYWduaXR1ZGVTcXVhcmVkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1hZ25pdHVkZVNxdWFyZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2UoIHBvaW50OiBWZWN0b3IyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVNxdWFyZWQoIHBvaW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQgKHgseSkuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBjb25zdCBkeCA9IHRoaXMueCAtIHg7XG4gICAgY29uc3QgZHkgPSB0aGlzLnkgLSB5O1xuICAgIHJldHVybiBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNxdWFyZWQgRXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgKHRyZWF0ZWQgYXMgYSBwb2ludCkgYW5kIGFub3RoZXIgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkKCBwb2ludDogVmVjdG9yMiApOiBudW1iZXIge1xuICAgIGNvbnN0IGR4ID0gdGhpcy54IC0gcG9pbnQueDtcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHBvaW50Lnk7XG4gICAgcmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzcXVhcmVkIEV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yICh0cmVhdGVkIGFzIGEgcG9pbnQpIGFuZCBhbm90aGVyIHBvaW50IHdpdGggY29vcmRpbmF0ZXMgKHgseSkuXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VTcXVhcmVkWFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgZHggPSB0aGlzLnggLSB4O1xuICAgIGNvbnN0IGR5ID0gdGhpcy55IC0geTtcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGRvdC1wcm9kdWN0IChFdWNsaWRlYW4gaW5uZXIgcHJvZHVjdCkgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3Igdi5cbiAgICovXG4gIHB1YmxpYyBkb3QoIHY6IFZlY3RvcjIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBkb3QtcHJvZHVjdCAoRXVjbGlkZWFuIGlubmVyIHByb2R1Y3QpIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yICh4LHkpLlxuICAgKi9cbiAgcHVibGljIGRvdFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnggKiB4ICsgdGhpcy55ICogeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYW5nbGUgJFxcdGhldGEkIG9mIHRoaXMgdmVjdG9yLCBzdWNoIHRoYXQgdGhpcyB2ZWN0b3IgaXMgZXF1YWwgdG9cbiAgICogJCQgdSA9IFxcYmVnaW57Ym1hdHJpeH0gclxcY29zXFx0aGV0YSBcXFxcIHJcXHNpblxcdGhldGEgXFxlbmR7Ym1hdHJpeH0gJCRcbiAgICogZm9yIHRoZSBtYWduaXR1ZGUgJHIgXFxnZSAwJCBvZiB0aGUgdmVjdG9yLCB3aXRoICRcXHRoZXRhXFxpbigtXFxwaSxcXHBpXSRcbiAgICovXG4gIHB1YmxpYyBnZXRBbmdsZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKCB0aGlzLnksIHRoaXMueCApO1xuICB9XG5cbiAgcHVibGljIGdldCBhbmdsZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEFuZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGFuZ2xlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLCBpbiB0aGUgcmFuZ2UgJFxcdGhldGFcXGluWzAsIFxccGldJC5cbiAgICpcbiAgICogRXF1YWwgdG8gJFxcdGhldGEgPSBcXGNvc157LTF9KCBcXGhhdHt1fSBcXGNkb3QgXFxoYXR7dn0gKSQgd2hlcmUgJFxcaGF0e3V9JCBpcyB0aGlzIHZlY3RvciAobm9ybWFsaXplZCkgYW5kICRcXGhhdHt2fSRcbiAgICogaXMgdGhlIGlucHV0IHZlY3RvciAobm9ybWFsaXplZCkuXG4gICAqL1xuICBwdWJsaWMgYW5nbGVCZXR3ZWVuKCB2OiBWZWN0b3IyICk6IG51bWJlciB7XG4gICAgY29uc3QgdGhpc01hZ25pdHVkZSA9IHRoaXMubWFnbml0dWRlO1xuICAgIGNvbnN0IHZNYWduaXR1ZGUgPSB2Lm1hZ25pdHVkZTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IGltcG9ydCB3aXRoIGNpcmN1bGFyIHByb3RlY3Rpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICByZXR1cm4gTWF0aC5hY29zKCBkb3QuY2xhbXAoICggdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICkgLyAoIHRoaXNNYWduaXR1ZGUgKiB2TWFnbml0dWRlICksIC0xLCAxICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGFjdCBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgdHdvIHZlY3RvcnMgaGF2ZSBlcXVhbCBjb21wb25lbnRzXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzKCBvdGhlcjogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSBvdGhlci54ICYmIHRoaXMueSA9PT0gb3RoZXIueTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHByb3hpbWF0ZSBlcXVhbGl0eSBjb21wYXJpc29uIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdoZXRoZXIgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSB0d28gdmVjdG9ycyBoYXMgbm8gY29tcG9uZW50IHdpdGggYW4gYWJzb2x1dGUgdmFsdWUgZ3JlYXRlciB0aGFuIGVwc2lsb24uXG4gICAqL1xuICBwdWJsaWMgZXF1YWxzRXBzaWxvbiggb3RoZXI6IFZlY3RvcjIsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcbiAgICBpZiAoICFlcHNpbG9uICkge1xuICAgICAgZXBzaWxvbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLm1heCggTWF0aC5hYnMoIHRoaXMueCAtIG90aGVyLnggKSwgTWF0aC5hYnMoIHRoaXMueSAtIG90aGVyLnkgKSApIDw9IGVwc2lsb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBmYWxzZSBpZiBlaXRoZXIgY29tcG9uZW50IGlzIE5hTiwgaW5maW5pdHksIG9yIC1pbmZpbml0eS4gT3RoZXJ3aXNlIHJldHVybnMgdHJ1ZS5cbiAgICovXG4gIHB1YmxpYyBpc0Zpbml0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNGaW5pdGUoIHRoaXMueCApICYmIGlzRmluaXRlKCB0aGlzLnkgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBJbW11dGFibGVzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB2ZWN0b3IsIG9yIGlmIGEgdmVjdG9yIGlzIHBhc3NlZCBpbiwgc2V0IHRoYXQgdmVjdG9yJ3MgdmFsdWVzIHRvIG91cnMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBzZXQoKSwgaWYgYSB2ZWN0b3IgaXMgcHJvdmlkZWQuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmRcbiAgICogd2lsbCBub3QgbW9kaWZ5IHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gW3ZlY3Rvcl0gLSBJZiBub3QgcHJvdmlkZWQsIGNyZWF0ZXMgYSBuZXcgVmVjdG9yMiB3aXRoIGZpbGxlZCBpbiB2YWx1ZXMuIE90aGVyd2lzZSwgZmlsbHMgaW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgIHZhbHVlcyBvZiB0aGUgcHJvdmlkZWQgdmVjdG9yIHNvIHRoYXQgaXQgZXF1YWxzIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGNvcHkoIHZlY3Rvcj86IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgaWYgKCB2ZWN0b3IgKSB7XG4gICAgICByZXR1cm4gdmVjdG9yLnNldCggdGhpcyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB2MiggdGhpcy54LCB0aGlzLnkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNjYWxhciB2YWx1ZSBvZiB0aGUgei1jb21wb25lbnQgb2YgdGhlIGVxdWl2YWxlbnQgMy1kaW1lbnNpb25hbCBjcm9zcyBwcm9kdWN0OlxuICAgKiAkJCBmKCB1LCB2ICkgPSBcXGxlZnQoIFxcYmVnaW57Ym1hdHJpeH0gdV94IFxcXFwgdV95IFxcXFwgMCBcXGVuZHtibWF0cml4fSBcXHRpbWVzIFxcYmVnaW57Ym1hdHJpeH0gdl94IFxcXFwgdl95IFxcXFwgMCBcXGVuZHtibWF0cml4fSBcXHJpZ2h0KV96ID0gdV94IHZfeSAtIHVfeSB2X3ggJCRcbiAgICovXG4gIHB1YmxpYyBjcm9zc1NjYWxhciggdjogVmVjdG9yMiApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2Lng7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplZCAocmUtc2NhbGVkKSBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdHMgbWFnbml0dWRlIGlzIDEuIElmIGl0cyBpbml0aWFsIG1hZ25pdHVkZSBpcyB6ZXJvLCBhblxuICAgKiBlcnJvciBpcyB0aHJvd24uXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemUoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnkgdGhpc1xuICAgKiB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgbm9ybWFsaXplZCgpOiBWZWN0b3IyIHtcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICBpZiAoIG1hZyA9PT0gMCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBub3JtYWxpemUgYSB6ZXJvLW1hZ25pdHVkZSB2ZWN0b3InICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHYyKCB0aGlzLnggLyBtYWcsIHRoaXMueSAvIG1hZyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGlzIHZlY3RvciB3aXRoIGVhY2ggY29tcG9uZW50IHJvdW5kZWQgYnkgVXRpbHMucm91bmRTeW1tZXRyaWMuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZFN5bW1ldHJpYygpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyByb3VuZGVkU3ltbWV0cmljKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmNvcHkoKS5yb3VuZFN5bW1ldHJpYygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlLXNjYWxlZCBjb3B5IG9mIHRoaXMgdmVjdG9yIHN1Y2ggdGhhdCBpdCBoYXMgdGhlIGRlc2lyZWQgbWFnbml0dWRlLiBJZiBpdHMgaW5pdGlhbCBtYWduaXR1ZGUgaXMgemVybywgYW4gZXJyb3JcbiAgICogaXMgdGhyb3duLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhlIGRpcmVjdGlvbiBvZiB0aGUgcmVzdWx0aW5nIHZlY3RvciB3aWxsIGJlIHJldmVyc2VkLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gc2V0TWFnbml0dWRlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHdpdGhNYWduaXR1ZGUoIG1hZ25pdHVkZTogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmNvcHkoKS5zZXRNYWduaXR1ZGUoIG1hZ25pdHVkZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgb2YgdGhpcyB2ZWN0b3IsIHNjYWxlZCBieSB0aGUgZGVzaXJlZCBzY2FsYXIgdmFsdWUuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyB0aW1lc1NjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHYyKCB0aGlzLnggKiBzY2FsYXIsIHRoaXMueSAqIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgdGltZXNTY2FsYXIuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtdWx0aXBseSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyB0aW1lcyggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMudGltZXNTY2FsYXIoIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcHkgb2YgdGhpcyB2ZWN0b3IsIG11bHRpcGxpZWQgY29tcG9uZW50LXdpc2UgYnkgdGhlIHBhc3NlZC1pbiB2ZWN0b3Igdi5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudE11bHRpcGx5KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGNvbXBvbmVudFRpbWVzKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggdGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlciB2ZWN0b3IsIHJldHVybmluZyBhIGNvcHkuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGltbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBhZGQoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgcGx1cyggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdjIoIHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55ICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkaXRpb24gb2YgdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXIgdmVjdG9yICh4LHkpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYWRkWFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgcGx1c1hZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdjIoIHRoaXMueCArIHgsIHRoaXMueSArIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRpdGlvbiBvZiB0aGlzIHZlY3RvciB3aXRoIGEgc2NhbGFyIChhZGRzIHRoZSBzY2FsYXIgdG8gZXZlcnkgY29tcG9uZW50KSwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGFkZFNjYWxhcigpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBwbHVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdjIoIHRoaXMueCArIHNjYWxhciwgdGhpcy55ICsgc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgdiwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0KCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG1pbnVzKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggdGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdGlvbiBvZiB0aGlzIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciAoeCx5KSwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0WFkoKS4gVGhpcyB3aWxsIHJldHVybiBhIG5ldyB2ZWN0b3IsIGFuZCB3aWxsIG5vdCBtb2RpZnlcbiAgICogdGhpcyB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgbWludXNYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHYyKCB0aGlzLnggLSB4LCB0aGlzLnkgLSB5ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3Rpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYSBzY2FsYXIgKHN1YnRyYWN0cyB0aGUgc2NhbGFyIGZyb20gZXZlcnkgY29tcG9uZW50KSwgcmV0dXJuaW5nIGEgY29weS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHN1YnRyYWN0U2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIG1pbnVzU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdjIoIHRoaXMueCAtIHNjYWxhciwgdGhpcy55IC0gc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aXNpb24gb2YgdGhpcyB2ZWN0b3IgYnkgYSBzY2FsYXIgKGRpdmlkZXMgZXZlcnkgY29tcG9uZW50IGJ5IHRoZSBzY2FsYXIpLCByZXR1cm5pbmcgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGl2aWRlU2NhbGFyKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIGRpdmlkZWRTY2FsYXIoIHNjYWxhcjogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggdGhpcy54IC8gc2NhbGFyLCB0aGlzLnkgLyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOZWdhdGVkIGNvcHkgb2YgdGhpcyB2ZWN0b3IgKG11bHRpcGxpZXMgZXZlcnkgY29tcG9uZW50IGJ5IC0xKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW1tdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZSgpLiBUaGlzIHdpbGwgcmV0dXJuIGEgbmV3IHZlY3RvciwgYW5kIHdpbGwgbm90IG1vZGlmeVxuICAgKiB0aGlzIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBuZWdhdGVkKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggLXRoaXMueCwgLXRoaXMueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZWQgYnkgLXBpLzIgKHBlcnBlbmRpY3VsYXIgdG8gdGhpcyB2ZWN0b3IpLCByZXR1cm5lZCBhcyBhIGNvcHkuXG4gICAqL1xuICBwdWJsaWMgZ2V0UGVycGVuZGljdWxhcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdjIoIHRoaXMueSwgLXRoaXMueCApO1xuICB9XG5cbiAgcHVibGljIGdldCBwZXJwZW5kaWN1bGFyKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldFBlcnBlbmRpY3VsYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVkIGJ5IGFuIGFyYml0cmFyeSBhbmdsZSwgaW4gcmFkaWFucy4gUmV0dXJuZWQgYXMgYSBjb3B5LlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbW11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcm90YXRlKCkuIFRoaXMgd2lsbCByZXR1cm4gYSBuZXcgdmVjdG9yLCBhbmQgd2lsbCBub3QgbW9kaWZ5XG4gICAqIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gYW5nbGUgLSBJbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgcm90YXRlZCggYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBjb25zdCBuZXdBbmdsZSA9IHRoaXMuYW5nbGUgKyBhbmdsZTtcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICByZXR1cm4gdjIoIG1hZyAqIE1hdGguY29zKCBuZXdBbmdsZSApLCBtYWcgKiBNYXRoLnNpbiggbmV3QW5nbGUgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11dGFibGUgbWV0aG9kIHRoYXQgcm90YXRlcyB0aGlzIHZlY3RvciBhYm91dCBhbiB4LHkgcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gb3JpZ2luIG9mIHJvdGF0aW9uIGluIHhcbiAgICogQHBhcmFtIHkgLSBvcmlnaW4gb2Ygcm90YXRpb24gaW4geVxuICAgKiBAcGFyYW0gYW5nbGUgLSByYWRpYW5zIHRvIHJvdGF0ZVxuICAgKiBAcmV0dXJucyB0aGlzIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgcHVibGljIHJvdGF0ZUFib3V0WFkoIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIGNvbnN0IGR4ID0gdGhpcy54IC0geDtcbiAgICBjb25zdCBkeSA9IHRoaXMueSAtIHk7XG4gICAgY29uc3QgY29zID0gTWF0aC5jb3MoIGFuZ2xlICk7XG4gICAgY29uc3Qgc2luID0gTWF0aC5zaW4oIGFuZ2xlICk7XG4gICAgdGhpcy54ID0geCArIGR4ICogY29zIC0gZHkgKiBzaW47XG4gICAgdGhpcy55ID0geSArIGR4ICogc2luICsgZHkgKiBjb3M7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTYW1lIGFzIHJvdGF0ZUFib3V0WFkgYnV0IHdpdGggYSBwb2ludCBhcmd1bWVudC5cbiAgICovXG4gIHB1YmxpYyByb3RhdGVBYm91dFBvaW50KCBwb2ludDogVmVjdG9yMiwgYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5yb3RhdGVBYm91dFhZKCBwb2ludC54LCBwb2ludC55LCBhbmdsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEltbXV0YWJsZSBtZXRob2QgdGhhdCByZXR1cm5zIGEgbmV3IFZlY3RvcjIgdGhhdCBpcyByb3RhdGVkIGFib3V0IHRoZSBnaXZlbiBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHggLSBvcmlnaW4gZm9yIHJvdGF0aW9uIGluIHhcbiAgICogQHBhcmFtIHkgLSBvcmlnaW4gZm9yIHJvdGF0aW9uIGluIHlcbiAgICogQHBhcmFtIGFuZ2xlIC0gcmFkaWFucyB0byByb3RhdGVcbiAgICovXG4gIHB1YmxpYyByb3RhdGVkQWJvdXRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIsIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHYyKCB0aGlzLngsIHRoaXMueSApLnJvdGF0ZUFib3V0WFkoIHgsIHksIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogSW1tdXRhYmxlIG1ldGhvZCB0aGF0IHJldHVybnMgYSBuZXcgVmVjdG9yMiByb3RhdGVkIGFib3V0IHRoZSBnaXZlbiBwb2ludC5cbiAgICovXG4gIHB1YmxpYyByb3RhdGVkQWJvdXRQb2ludCggcG9pbnQ6IFZlY3RvcjIsIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMucm90YXRlZEFib3V0WFkoIHBvaW50LngsIHBvaW50LnksIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogQSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHRoaXMgdmVjdG9yIChyYXRpbz0wKSBhbmQgYW5vdGhlciB2ZWN0b3IgKHJhdGlvPTEpLlxuICAgKlxuICAgKiBAcGFyYW0gdmVjdG9yXG4gICAqIEBwYXJhbSByYXRpbyAtIE5vdCBuZWNlc3NhcmlseSBjb25zdHJhaW5lZCBpbiBbMCwgMV1cbiAgICovXG4gIHB1YmxpYyBibGVuZCggdmVjdG9yOiBWZWN0b3IyLCByYXRpbzogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2MiggdGhpcy54ICsgKCB2ZWN0b3IueCAtIHRoaXMueCApICogcmF0aW8sIHRoaXMueSArICggdmVjdG9yLnkgLSB0aGlzLnkgKSAqIHJhdGlvICk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGF2ZXJhZ2UgKG1pZHBvaW50KSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyIHZlY3Rvci5cbiAgICovXG4gIHB1YmxpYyBhdmVyYWdlKCB2ZWN0b3I6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuYmxlbmQoIHZlY3RvciwgMC41ICk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBhIGNvbXBvbmVudC1iYXNlZCBtZWFuIG9mIGFsbCB2ZWN0b3JzIHByb3ZpZGVkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhdmVyYWdlKCB2ZWN0b3JzOiBWZWN0b3IyW10gKTogVmVjdG9yMiB7XG4gICAgY29uc3QgYWRkZWQgPSBfLnJlZHVjZSggdmVjdG9ycywgQURESU5HX0FDQ1VNVUxBVE9SLCBuZXcgVmVjdG9yMiggMCwgMCApICk7XG4gICAgcmV0dXJuIGFkZGVkLmRpdmlkZVNjYWxhciggdmVjdG9ycy5sZW5ndGggKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERlYnVnZ2luZyBzdHJpbmcgZm9yIHRoZSB2ZWN0b3IuXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFZlY3RvcjIoJHt0aGlzLnh9LCAke3RoaXMueX0pYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIHRvIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IsIHdpdGggdGhlIHotY29tcG9uZW50IGVxdWFsIHRvIDAuXG4gICAqL1xuICBwdWJsaWMgdG9WZWN0b3IzKCk6IFZlY3RvcjMge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMyggdGhpcy54LCB0aGlzLnksIDAgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBNdXRhYmxlc1xuICAgKiAtIGFsbCBtdXRhdGlvbiBzaG91bGQgZ28gdGhyb3VnaCBzZXRYWSAvIHNldFggLyBzZXRZXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogU2V0cyBhbGwgb2YgdGhlIGNvbXBvbmVudHMgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgeC1jb21wb25lbnQgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFgoIHg6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICB0aGlzLnggPSB4O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgeS1jb21wb25lbnQgb2YgdGhpcyB2ZWN0b3IsIHJldHVybmluZyB0aGlzLlxuICAgKi9cbiAgcHVibGljIHNldFkoIHk6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyB2ZWN0b3IgdG8gYmUgYSBjb3B5IG9mIGFub3RoZXIgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvcHkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG8gcmV0dXJuaW5nXG4gICAqIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzZXQoIHY6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHYueCwgdi55ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWFnbml0dWRlIG9mIHRoaXMgdmVjdG9yLiBJZiB0aGUgcGFzc2VkLWluIG1hZ25pdHVkZSBpcyBuZWdhdGl2ZSwgdGhpcyBmbGlwcyB0aGUgdmVjdG9yIGFuZCBzZXRzIGl0c1xuICAgKiBtYWduaXR1ZGUgdG8gYWJzKCBtYWduaXR1ZGUgKS5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiB3aXRoTWFnbml0dWRlKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc2V0TWFnbml0dWRlKCBtYWduaXR1ZGU6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBjb25zdCBzY2FsZSA9IG1hZ25pdHVkZSAvIHRoaXMubWFnbml0dWRlO1xuXG4gICAgcmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIHNjYWxlICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbm90aGVyIHZlY3RvciB0byB0aGlzIHZlY3RvciwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gcGx1cygpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGFkZCggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggdGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFub3RoZXIgdmVjdG9yICh4LHkpIHRvIHRoaXMgdmVjdG9yLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzWFkoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBhZGRYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCArIHgsIHRoaXMueSArIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc2NhbGFyIHRvIHRoaXMgdmVjdG9yIChhZGRlZCB0byBldmVyeSBjb21wb25lbnQpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBwbHVzU2NhbGFyKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgYWRkU2NhbGFyKCBzY2FsYXI6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggdGhpcy54ICsgc2NhbGFyLCB0aGlzLnkgKyBzY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG1pbnVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc3VidHJhY3QoIHY6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55ICk7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3RzIHRoaXMgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yICh4LHkpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBtaW51c1hZKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgc3VidHJhY3RYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAtIHgsIHRoaXMueSAtIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0cmFjdHMgdGhpcyB2ZWN0b3IgYnkgYSBzY2FsYXIgKHN1YnRyYWN0cyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gbWludXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBzdWJ0cmFjdFNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAtIHNjYWxhciwgdGhpcy55IC0gc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdGltZXNTY2FsYXIoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAqIHNjYWxhciwgdGhpcy55ICogc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqIFNhbWUgYXMgbXVsdGlwbHlTY2FsYXIuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gdGltZXMoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseSggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIHNjYWxhciApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11bHRpcGxpZXMgdGhpcyB2ZWN0b3IgYnkgYW5vdGhlciB2ZWN0b3IgY29tcG9uZW50LXdpc2UsIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGNvbXBvbmVudFRpbWVzKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgY29tcG9uZW50TXVsdGlwbHkoIHY6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAqIHYueCwgdGhpcy55ICogdi55ICk7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlcyB0aGlzIHZlY3RvciBieSBhIHNjYWxhciAoZGl2aWRlcyBlYWNoIGNvbXBvbmVudCBieSB0aGUgc2NhbGFyKSwgY2hhbmdpbmcgdGhpcyB2ZWN0b3IuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIG11dGFibGUgZm9ybSBvZiB0aGUgZnVuY3Rpb24gZGl2aWRlZFNjYWxhcigpLiBUaGlzIHdpbGwgbXV0YXRlIChjaGFuZ2UpIHRoaXMgdmVjdG9yLCBpbiBhZGRpdGlvbiB0b1xuICAgKiByZXR1cm5pbmcgdGhpcyB2ZWN0b3IgaXRzZWxmLlxuICAgKi9cbiAgcHVibGljIGRpdmlkZVNjYWxhciggc2NhbGFyOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIHRoaXMueCAvIHNjYWxhciwgdGhpcy55IC8gc2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIHZlY3RvciAobXVsdGlwbGllcyBlYWNoIGNvbXBvbmVudCBieSAtMSksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIG5lZ2F0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyBuZWdhdGUoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIC10aGlzLngsIC10aGlzLnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoaXMgdmVjdG9yIChyZXNjYWxlcyB0byB3aGVyZSB0aGUgbWFnbml0dWRlIGlzIDEpLCBjaGFuZ2luZyB0aGlzIHZlY3Rvci5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiBub3JtYWxpemVkKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uIHRvXG4gICAqIHJldHVybmluZyB0aGlzIHZlY3RvciBpdHNlbGYuXG4gICAqL1xuICBwdWJsaWMgbm9ybWFsaXplKCk6IFZlY3RvcjIge1xuICAgIGNvbnN0IG1hZyA9IHRoaXMubWFnbml0dWRlO1xuICAgIGlmICggbWFnID09PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ2Fubm90IG5vcm1hbGl6ZSBhIHplcm8tbWFnbml0dWRlIHZlY3RvcicgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIG1hZyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb3VuZHMgZWFjaCBjb21wb25lbnQgb2YgdGhpcyB2ZWN0b3Igd2l0aCBVdGlscy5yb3VuZFN5bW1ldHJpYy5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgbXV0YWJsZSBmb3JtIG9mIHRoZSBmdW5jdGlvbiByb3VuZGVkU3ltbWV0cmljKCkuIFRoaXMgd2lsbCBtdXRhdGUgKGNoYW5nZSkgdGhpcyB2ZWN0b3IsIGluIGFkZGl0aW9uXG4gICAqIHRvIHJldHVybmluZyB0aGUgdmVjdG9yIGl0c2VsZi5cbiAgICovXG4gIHB1YmxpYyByb3VuZFN5bW1ldHJpYygpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMueCApLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGhpcy55ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVzIHRoaXMgdmVjdG9yIGJ5IHRoZSBhbmdsZSAoaW4gcmFkaWFucyksIGNoYW5naW5nIHRoaXMgdmVjdG9yLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBtdXRhYmxlIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIHJvdGF0ZWQoKS4gVGhpcyB3aWxsIG11dGF0ZSAoY2hhbmdlKSB0aGlzIHZlY3RvciwgaW4gYWRkaXRpb24gdG9cbiAgICogcmV0dXJuaW5nIHRoaXMgdmVjdG9yIGl0c2VsZi5cbiAgICpcbiAgICogQHBhcmFtIGFuZ2xlIC0gSW4gcmFkaWFuc1xuICAgKi9cbiAgcHVibGljIHJvdGF0ZSggYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBjb25zdCBuZXdBbmdsZSA9IHRoaXMuYW5nbGUgKyBhbmdsZTtcbiAgICBjb25zdCBtYWcgPSB0aGlzLm1hZ25pdHVkZTtcbiAgICByZXR1cm4gdGhpcy5zZXRYWSggbWFnICogTWF0aC5jb3MoIG5ld0FuZ2xlICksIG1hZyAqIE1hdGguc2luKCBuZXdBbmdsZSApICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIHZlY3RvcidzIHZhbHVlIHRvIGJlIHRoZSB4LHkgdmFsdWVzIG1hdGNoaW5nIHRoZSBnaXZlbiBtYWduaXR1ZGUgYW5kIGFuZ2xlIChpbiByYWRpYW5zKSwgY2hhbmdpbmdcbiAgICogdGhpcyB2ZWN0b3IsIGFuZCByZXR1cm5pbmcgaXRzZWxmLlxuICAgKlxuICAgKiBAcGFyYW0gbWFnbml0dWRlXG4gICAqIEBwYXJhbSBhbmdsZSAtIEluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRQb2xhciggbWFnbml0dWRlOiBudW1iZXIsIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0WFkoIG1hZ25pdHVkZSAqIE1hdGguY29zKCBhbmdsZSApLCBtYWduaXR1ZGUgKiBNYXRoLnNpbiggYW5nbGUgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkdWNrLXR5cGVkIG9iamVjdCBtZWFudCBmb3IgdXNlIHdpdGggdGFuZGVtL3BoZXQtaW8gc2VyaWFsaXphdGlvbi4gQWx0aG91Z2ggdGhpcyBpcyByZWR1bmRhbnQgd2l0aFxuICAgKiBzdGF0ZVNjaGVtYSwgaXQgaXMgYSBuaWNlIGZlYXR1cmUgb2Ygc3VjaCBhIGhlYXZpbHktdXNlZCB0eXBlIHRvIGJlIGFibGUgdG8gY2FsbCB0b1N0YXRlT2JqZWN0IGRpcmVjdGx5IG9uIHRoZSB0eXBlLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIHNlZSBzdGF0ZVNjaGVtYSBmb3Igc2NoZW1hXG4gICAqL1xuICBwdWJsaWMgdG9TdGF0ZU9iamVjdCgpOiBWZWN0b3IyU3RhdGVPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0aGlzLngsXG4gICAgICB5OiB0aGlzLnlcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgVmVjdG9yMi5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBWZWN0b3IyLCB7XG4gICAgbWF4U2l6ZTogMTAwMCxcbiAgICBpbml0aWFsaXplOiBWZWN0b3IyLnByb3RvdHlwZS5zZXRYWSxcbiAgICBkZWZhdWx0QXJndW1lbnRzOiBbIDAsIDAgXVxuICB9ICk7XG5cbiAgLy8gc3RhdGljIG1ldGhvZHNcblxuICAvKipcbiAgICogUmV0dXJucyBhIFZlY3RvcjIgd2l0aCB0aGUgc3BlY2lmaWVkIG1hZ25pdHVkZSAkciQgYW5kIGFuZ2xlICRcXHRoZXRhJCAoaW4gcmFkaWFucyksIHdpdGggdGhlIGZvcm11bGE6XG4gICAqICQkIGYoIHIsIFxcdGhldGEgKSA9IFxcYmVnaW57Ym1hdHJpeH0gclxcY29zXFx0aGV0YSBcXFxcIHJcXHNpblxcdGhldGEgXFxlbmR7Ym1hdHJpeH0gJCRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUG9sYXIoIG1hZ25pdHVkZTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggMCwgMCApLnNldFBvbGFyKCBtYWduaXR1ZGUsIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIFZlY3RvcjIgZnJvbSBhIGR1Y2stdHlwZWQgb2JqZWN0LCBmb3IgdXNlIHdpdGggdGFuZGVtL3BoZXQtaW8gZGVzZXJpYWxpemF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhdGVPYmplY3QgLSBzZWUgc3RhdGVTY2hlbWEgZm9yIHNjaGVtYVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0OiBWZWN0b3IyU3RhdGVPYmplY3QgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHYyKFxuICAgICAgc3RhdGVPYmplY3QueCxcbiAgICAgIHN0YXRlT2JqZWN0LnlcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG9jYXRpb24tZnJlZSBpbXBsZW1lbnRhdGlvbiB0aGF0IGdldHMgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIHZlY3RvcnNcbiAgICpcbiAgICogQHJldHVybnMgdGhlIGFuZ2xlIGJldHdlZW4gdGhlIHZlY3RvcnNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyggc3RhcnRWZWN0b3I6IFZlY3RvcjIsIGVuZFZlY3RvcjogVmVjdG9yMiApOiBudW1iZXIge1xuICAgIGNvbnN0IGR4ID0gZW5kVmVjdG9yLnggLSBzdGFydFZlY3Rvci54O1xuICAgIGNvbnN0IGR5ID0gZW5kVmVjdG9yLnkgLSBzdGFydFZlY3Rvci55O1xuICAgIHJldHVybiBNYXRoLmF0YW4yKCBkeSwgZHggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvY2F0aW9uLWZyZWUgd2F5IHRvIGdldCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB2ZWN0b3JzLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgYW5nbGUgYmV0d2VlbiB0aGUgdmVjdG9yc1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXREaXN0YW5jZUJldHdlZW5WZWN0b3JzKCBzdGFydFZlY3RvcjogVmVjdG9yMiwgZW5kVmVjdG9yOiBWZWN0b3IyICk6IG51bWJlciB7XG4gICAgY29uc3QgZHggPSBlbmRWZWN0b3IueCAtIHN0YXJ0VmVjdG9yLng7XG4gICAgY29uc3QgZHkgPSBlbmRWZWN0b3IueSAtIHN0YXJ0VmVjdG9yLnk7XG4gICAgcmV0dXJuIE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcbiAgfVxuXG4gIHB1YmxpYyBpc1ZlY3RvcjIhOiBib29sZWFuO1xuICBwdWJsaWMgZGltZW5zaW9uITogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJbW11dGFibGVWZWN0b3IyIHplcm8gdmVjdG9yOiAkXFxiZWdpbntibWF0cml4fSAwXFxcXDAgXFxlbmR7Ym1hdHJpeH0kXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIFpFUk86IFZlY3RvcjI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC91cHBlcmNhc2Utc3RhdGljcy1zaG91bGQtYmUtcmVhZG9ubHlcblxuICAvKipcbiAgICogSW1tdXRhYmxlVmVjdG9yMiB2ZWN0b3I6ICRcXGJlZ2lue2JtYXRyaXh9IDFcXFxcMCBcXGVuZHtibWF0cml4fSRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgWF9VTklUOiBWZWN0b3IyOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvdXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5XG5cbiAgLyoqXG4gICAqIEltbXV0YWJsZVZlY3RvcjIgdmVjdG9yOiAkXFxiZWdpbntibWF0cml4fSAwXFxcXDEgXFxlbmR7Ym1hdHJpeH0kXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIFlfVU5JVDogVmVjdG9yMjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuXG4gIHB1YmxpYyBzdGF0aWMgVmVjdG9yMklPOiBJT1R5cGU7XG59XG5cbi8vIChyZWFkLW9ubHkpIC0gSGVscHMgdG8gaWRlbnRpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdmVjdG9yXG5WZWN0b3IyLnByb3RvdHlwZS5pc1ZlY3RvcjIgPSB0cnVlO1xuVmVjdG9yMi5wcm90b3R5cGUuZGltZW5zaW9uID0gMjtcblxuZG90LnJlZ2lzdGVyKCAnVmVjdG9yMicsIFZlY3RvcjIgKTtcblxuY29uc3QgdjIgPSBWZWN0b3IyLnBvb2wuY3JlYXRlLmJpbmQoIFZlY3RvcjIucG9vbCApO1xuZG90LnJlZ2lzdGVyKCAndjInLCB2MiApO1xuXG5jbGFzcyBJbW11dGFibGVWZWN0b3IyIGV4dGVuZHMgVmVjdG9yMiB7XG4gIC8qKlxuICAgKiBUaHJvdyBlcnJvcnMgd2hlbmV2ZXIgYSBtdXRhYmxlIG1ldGhvZCBpcyBjYWxsZWQgb24gb3VyIGltbXV0YWJsZSB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbXV0YWJsZU92ZXJyaWRlSGVscGVyKCBtdXRhYmxlRnVuY3Rpb25OYW1lOiAnc2V0WCcgfCAnc2V0WScgfCAnc2V0WFknICk6IHZvaWQge1xuICAgIEltbXV0YWJsZVZlY3RvcjIucHJvdG90eXBlWyBtdXRhYmxlRnVuY3Rpb25OYW1lIF0gPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBDYW5ub3QgY2FsbCBtdXRhYmxlIG1ldGhvZCAnJHttdXRhYmxlRnVuY3Rpb25OYW1lfScgb24gaW1tdXRhYmxlIFZlY3RvcjJgICk7XG4gICAgfTtcbiAgfVxufVxuXG5JbW11dGFibGVWZWN0b3IyLm11dGFibGVPdmVycmlkZUhlbHBlciggJ3NldFhZJyApO1xuSW1tdXRhYmxlVmVjdG9yMi5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRYJyApO1xuSW1tdXRhYmxlVmVjdG9yMi5tdXRhYmxlT3ZlcnJpZGVIZWxwZXIoICdzZXRZJyApO1xuXG5WZWN0b3IyLlpFUk8gPSBhc3NlcnQgPyBuZXcgSW1tdXRhYmxlVmVjdG9yMiggMCwgMCApIDogbmV3IFZlY3RvcjIoIDAsIDAgKTtcblZlY3RvcjIuWF9VTklUID0gYXNzZXJ0ID8gbmV3IEltbXV0YWJsZVZlY3RvcjIoIDEsIDAgKSA6IG5ldyBWZWN0b3IyKCAxLCAwICk7XG5WZWN0b3IyLllfVU5JVCA9IGFzc2VydCA/IG5ldyBJbW11dGFibGVWZWN0b3IyKCAwLCAxICkgOiBuZXcgVmVjdG9yMiggMCwgMSApO1xuXG5jb25zdCBTVEFURV9TQ0hFTUEgPSB7XG4gIHg6IE51bWJlcklPLFxuICB5OiBOdW1iZXJJT1xufTtcbmV4cG9ydCB0eXBlIFZlY3RvcjJTdGF0ZU9iamVjdCA9IFN0YXRlT2JqZWN0PHR5cGVvZiBTVEFURV9TQ0hFTUE+O1xuXG5WZWN0b3IyLlZlY3RvcjJJTyA9IG5ldyBJT1R5cGU8VmVjdG9yMiwgVmVjdG9yMlN0YXRlT2JqZWN0PiggJ1ZlY3RvcjJJTycsIHtcbiAgdmFsdWVUeXBlOiBWZWN0b3IyLFxuICBzdGF0ZVNjaGVtYTogU1RBVEVfU0NIRU1BLFxuICB0b1N0YXRlT2JqZWN0OiAoIHZlY3RvcjI6IFZlY3RvcjIgKSA9PiB2ZWN0b3IyLnRvU3RhdGVPYmplY3QoKSxcbiAgZnJvbVN0YXRlT2JqZWN0OiAoIHN0YXRlT2JqZWN0OiBWZWN0b3IyU3RhdGVPYmplY3QgKSA9PiBWZWN0b3IyLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QgKSxcbiAgZG9jdW1lbnRhdGlvbjogJ0EgbnVtZXJpY2FsIG9iamVjdCB3aXRoIHggYW5kIHkgcHJvcGVydGllcywgbGlrZSB7eDozLHk6NH0nXG59ICk7XG5cbmV4cG9ydCB7IHYyIH07Il0sIm5hbWVzIjpbIlBvb2wiLCJJT1R5cGUiLCJOdW1iZXJJTyIsImRvdCIsIlV0aWxzIiwiVmVjdG9yMyIsIkFERElOR19BQ0NVTVVMQVRPUiIsInZlY3RvciIsIm5leHRWZWN0b3IiLCJhZGQiLCJWZWN0b3IyIiwiZ2V0TWFnbml0dWRlIiwiTWF0aCIsInNxcnQiLCJtYWduaXR1ZGVTcXVhcmVkIiwibWFnbml0dWRlIiwiZ2V0TWFnbml0dWRlU3F1YXJlZCIsIngiLCJ5IiwiZGlzdGFuY2UiLCJwb2ludCIsImRpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlWFkiLCJkeCIsImR5IiwiZGlzdGFuY2VTcXVhcmVkWFkiLCJ2IiwiZG90WFkiLCJnZXRBbmdsZSIsImF0YW4yIiwiYW5nbGUiLCJhbmdsZUJldHdlZW4iLCJ0aGlzTWFnbml0dWRlIiwidk1hZ25pdHVkZSIsImFjb3MiLCJjbGFtcCIsImVxdWFscyIsIm90aGVyIiwiZXF1YWxzRXBzaWxvbiIsImVwc2lsb24iLCJtYXgiLCJhYnMiLCJpc0Zpbml0ZSIsImNvcHkiLCJzZXQiLCJ2MiIsImNyb3NzU2NhbGFyIiwibm9ybWFsaXplZCIsIm1hZyIsIkVycm9yIiwicm91bmRlZFN5bW1ldHJpYyIsInJvdW5kU3ltbWV0cmljIiwid2l0aE1hZ25pdHVkZSIsInNldE1hZ25pdHVkZSIsInRpbWVzU2NhbGFyIiwic2NhbGFyIiwidGltZXMiLCJjb21wb25lbnRUaW1lcyIsInBsdXMiLCJwbHVzWFkiLCJwbHVzU2NhbGFyIiwibWludXMiLCJtaW51c1hZIiwibWludXNTY2FsYXIiLCJkaXZpZGVkU2NhbGFyIiwibmVnYXRlZCIsImdldFBlcnBlbmRpY3VsYXIiLCJwZXJwZW5kaWN1bGFyIiwicm90YXRlZCIsIm5ld0FuZ2xlIiwiY29zIiwic2luIiwicm90YXRlQWJvdXRYWSIsInJvdGF0ZUFib3V0UG9pbnQiLCJyb3RhdGVkQWJvdXRYWSIsInJvdGF0ZWRBYm91dFBvaW50IiwiYmxlbmQiLCJyYXRpbyIsImF2ZXJhZ2UiLCJ2ZWN0b3JzIiwiYWRkZWQiLCJfIiwicmVkdWNlIiwiZGl2aWRlU2NhbGFyIiwibGVuZ3RoIiwidG9TdHJpbmciLCJ0b1ZlY3RvcjMiLCJzZXRYWSIsInNldFgiLCJzZXRZIiwic2NhbGUiLCJtdWx0aXBseVNjYWxhciIsImFkZFhZIiwiYWRkU2NhbGFyIiwic3VidHJhY3QiLCJzdWJ0cmFjdFhZIiwic3VidHJhY3RTY2FsYXIiLCJtdWx0aXBseSIsImNvbXBvbmVudE11bHRpcGx5IiwibmVnYXRlIiwibm9ybWFsaXplIiwicm90YXRlIiwic2V0UG9sYXIiLCJ0b1N0YXRlT2JqZWN0IiwiZnJlZVRvUG9vbCIsInBvb2wiLCJjcmVhdGVQb2xhciIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlT2JqZWN0IiwiZ2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyIsInN0YXJ0VmVjdG9yIiwiZW5kVmVjdG9yIiwiZ2V0RGlzdGFuY2VCZXR3ZWVuVmVjdG9ycyIsIm1heFNpemUiLCJpbml0aWFsaXplIiwicHJvdG90eXBlIiwiZGVmYXVsdEFyZ3VtZW50cyIsImlzVmVjdG9yMiIsImRpbWVuc2lvbiIsInJlZ2lzdGVyIiwiY3JlYXRlIiwiYmluZCIsIkltbXV0YWJsZVZlY3RvcjIiLCJtdXRhYmxlT3ZlcnJpZGVIZWxwZXIiLCJtdXRhYmxlRnVuY3Rpb25OYW1lIiwiWkVSTyIsImFzc2VydCIsIlhfVU5JVCIsIllfVU5JVCIsIlNUQVRFX1NDSEVNQSIsIlZlY3RvcjJJTyIsInZhbHVlVHlwZSIsInN0YXRlU2NoZW1hIiwidmVjdG9yMiIsImRvY3VtZW50YXRpb24iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsVUFBeUIsNkJBQTZCO0FBQzdELE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGNBQWMsb0NBQW9DO0FBRXpELE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Ms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