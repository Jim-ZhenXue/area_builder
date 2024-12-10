// Copyright 2013-2023, University of Colorado Boulder
/**
 * Forward and inverse transforms with 3x3 matrices. Methods starting with 'transform' will apply the transform from our
 * primary matrix, while methods starting with 'inverse' will apply the transform from the inverse of our matrix.
 *
 * Generally, this means transform.inverseThing( transform.transformThing( thing ) ).equals( thing ).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../axon/js/TinyEmitter.js';
import dot from './dot.js';
import Matrix3 from './Matrix3.js';
import Ray2 from './Ray2.js';
import Vector2 from './Vector2.js';
const scratchMatrix = new Matrix3();
let Transform3 = class Transform3 {
    /*---------------------------------------------------------------------------*
   * mutators
   *---------------------------------------------------------------------------*/ /**
   * Sets the value of the primary matrix directly from a Matrix3. Does not change the Matrix3 instance.
   * @public
   *
   * @param {Matrix3} matrix
   */ setMatrix(matrix) {
        // copy the matrix over to our matrix
        this.matrix.set(matrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Validates the matrix or matrix arguments, overrideable by subclasses to refine the validation.
   * @param {Matrix} matrix
   * @protected
   */ validateMatrix(matrix) {
        assert && assert(matrix instanceof Matrix3, 'matrix was incorrect type');
        assert && assert(matrix.isFinite(), 'matrix must be finite');
    }
    /**
   * This should be called after our internal matrix is changed. It marks the other dependent matrices as invalid,
   * and sends out notifications of the change.
   * @private
   */ invalidate() {
        // sanity check
        assert && this.validateMatrix(this.matrix);
        // dependent matrices now invalid
        this.inverseValid = false;
        this.transposeValid = false;
        this.inverseTransposeValid = false;
        this.changeEmitter.emit();
    }
    /**
   * Modifies the primary matrix such that: this.matrix = matrix * this.matrix.
   * @public
   *
   * @param {Matrix3} matrix
   */ prepend(matrix) {
        assert && this.validateMatrix(matrix);
        // In the absence of a prepend-multiply function in Matrix3, copy over to a scratch matrix instead
        // TODO: implement a prepend-multiply directly in Matrix3 for a performance increase https://github.com/phetsims/dot/issues/96
        scratchMatrix.set(this.matrix);
        this.matrix.set(matrix);
        this.matrix.multiplyMatrix(scratchMatrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Optimized prepended translation such that: this.matrix = translation( x, y ) * this.matrix.
   * @public
   *
   * @param {number} x -  x-coordinate
   * @param {number} y -  y-coordinate
   */ prependTranslation(x, y) {
        // See scenery#119 for more details on the need.
        assert && assert(typeof x === 'number' && typeof y === 'number' && isFinite(x) && isFinite(y), 'Attempted to prepend non-finite or non-number (x,y) to the transform');
        this.matrix.prependTranslation(x, y);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Modifies the primary matrix such that: this.matrix = this.matrix * matrix
   * @public
   *
   * @param {Matrix3} matrix
   */ append(matrix) {
        assert && this.validateMatrix(matrix);
        this.matrix.multiplyMatrix(matrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Like prepend(), but prepends the other transform's matrix.
   * @public
   *
   * @param {Transform3} transform
   */ prependTransform(transform) {
        this.prepend(transform.matrix);
    }
    /**
   * Like append(), but appends the other transform's matrix.
   * @public
   *
   * @param {Transform3} transform
   */ appendTransform(transform) {
        this.append(transform.matrix);
    }
    /**
   * Sets the transform of a Canvas context to be equivalent to this transform.
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */ applyToCanvasContext(context) {
        context.setTransform(this.matrix.m00(), this.matrix.m10(), this.matrix.m01(), this.matrix.m11(), this.matrix.m02(), this.matrix.m12());
    }
    /*---------------------------------------------------------------------------*
   * getters
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this transform.
   * @public
   *
   * @returns {Transform3}
   */ copy() {
        const transform = new Transform3(this.matrix);
        transform.inverse = this.inverse;
        transform.matrixTransposed = this.matrixTransposed;
        transform.inverseTransposed = this.inverseTransposed;
        transform.inverseValid = this.inverseValid;
        transform.transposeValid = this.transposeValid;
        transform.inverseTransposeValid = this.inverseTransposeValid;
    }
    /**
   * Returns the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */ getMatrix() {
        return this.matrix;
    }
    /**
   * Returns the inverse of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */ getInverse() {
        if (!this.inverseValid) {
            this.inverseValid = true;
            this.inverse.set(this.matrix);
            this.inverse.invert();
        }
        return this.inverse;
    }
    /**
   * Returns the transpose of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */ getMatrixTransposed() {
        if (!this.transposeValid) {
            this.transposeValid = true;
            this.matrixTransposed.set(this.matrix);
            this.matrixTransposed.transpose();
        }
        return this.matrixTransposed;
    }
    /**
   * Returns the inverse of the transpose of matrix of this transform.
   * @public
   *
   * @returns {Matrix3}
   */ getInverseTransposed() {
        if (!this.inverseTransposeValid) {
            this.inverseTransposeValid = true;
            this.inverseTransposed.set(this.getInverse()); // triggers inverse to be valid
            this.inverseTransposed.transpose();
        }
        return this.inverseTransposed;
    }
    /**
   * Returns whether our primary matrix is known to be an identity matrix. If false is returned, it doesn't necessarily
   * mean our matrix isn't an identity matrix, just that it is unlikely in normal usage.
   * @public
   *
   * @returns {boolean}
   */ isIdentity() {
        return this.matrix.isFastIdentity();
    }
    /**
   * Returns whether any components of our primary matrix are either infinite or NaN.
   * @public
   *
   * @returns {boolean}
   */ isFinite() {
        return this.matrix.isFinite();
    }
    /*---------------------------------------------------------------------------*
   * forward transforms (for Vector2 or scalar)
   *---------------------------------------------------------------------------*/ /**
   * Transforms a 2-dimensional vector like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ transformPosition2(v) {
        return this.matrix.timesVector2(v);
    }
    /**
   * Transforms a 2-dimensional vector like position is irrelevant (translation is not applied).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & b & 0 \\ d & e & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ transformDelta2(v) {
        const m = this.getMatrix();
        // m . v - m . Vector2.ZERO
        return new Vector2(m.m00() * v.x + m.m01() * v.y, m.m10() * v.x + m.m11() * v.y);
    }
    /**
   * Transforms a 2-dimensional vector like it is a normal to a curve (so that the curve is transformed, and the new
   * normal to the curve at the transformed point is returned).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & e & 0 \\ d & b & 0 \\ 0 & 0 & 1 \end{bmatrix}^{-1} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   * This is essentially the transposed inverse with translation removed.
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ transformNormal2(v) {
        return this.getInverse().timesTransposeVector2(v).normalize();
    }
    /**
   * Returns the resulting x-coordinate of the transformation of all vectors with the initial input x-coordinate. If
   * this is not well-defined (the x value depends on y), an assertion is thrown (and y is assumed to be 0).
   * @public
   *
   * @param {number} x
   * @returns {number}
   */ transformX(x) {
        const m = this.getMatrix();
        assert && assert(!m.m01(), 'Transforming an X value with a rotation/shear is ill-defined');
        return m.m00() * x + m.m02();
    }
    /**
   * Returns the resulting y-coordinate of the transformation of all vectors with the initial input y-coordinate. If
   * this is not well-defined (the y value depends on x), an assertion is thrown (and x is assumed to be 0).
   * @public
   *
   * @param {number} y
   * @returns {number}
   */ transformY(y) {
        const m = this.getMatrix();
        assert && assert(!m.m10(), 'Transforming a Y value with a rotation/shear is ill-defined');
        return m.m11() * y + m.m12();
    }
    /**
   * Returns the x-coordinate difference for two transformed vectors, which add the x-coordinate difference of the input
   * x (and same y values) beforehand.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */ transformDeltaX(x) {
        const m = this.getMatrix();
        // same as this.transformDelta2( new Vector2( x, 0 ) ).x;
        return m.m00() * x;
    }
    /**
   * Returns the y-coordinate difference for two transformed vectors, which add the y-coordinate difference of the input
   * y (and same x values) beforehand.
   * @public
   *
   * @param {number} y
   * @returns {number}
   */ transformDeltaY(y) {
        const m = this.getMatrix();
        // same as this.transformDelta2( new Vector2( 0, y ) ).y;
        return m.m11() * y;
    }
    /**
   * Returns bounds (axis-aligned) that contains the transformed bounds rectangle.
   * @public
   *
   * NOTE: transform.inverseBounds2( transform.transformBounds2( bounds ) ) may be larger than the original box,
   * if it includes a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in
   * area to cover ALL of the corners of the transformed bounding box.
   *
   * @param {Bounds2} bounds
   * @returns {Bounds2}
   */ transformBounds2(bounds) {
        return bounds.transformed(this.matrix);
    }
    /**
   * Returns a transformed phet.kite.Shape.
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */ transformShape(shape) {
        return shape.transformed(this.matrix);
    }
    /**
   * Returns a transformed ray.
   * @public
   *
   * @param {Ray2} ray
   * @returns {Ray2}
   */ transformRay2(ray) {
        return new Ray2(this.transformPosition2(ray.position), this.transformDelta2(ray.direction).normalized());
    }
    /*---------------------------------------------------------------------------*
   * inverse transforms (for Vector2 or scalar)
   *---------------------------------------------------------------------------*/ /**
   * Transforms a 2-dimensional vector by the inverse of our transform like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M^{-1}\begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformPosition2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ inversePosition2(v) {
        return this.getInverse().timesVector2(v);
    }
    /**
   * Transforms a 2-dimensional vector by the inverse of our transform like position is irrelevant (translation is not applied).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & b & 0 \\ d & e & 0 \\ 0 & 0 & 1 \end{bmatrix}^{-1} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformDelta2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ inverseDelta2(v) {
        const m = this.getInverse();
        // m . v - m . Vector2.ZERO
        return new Vector2(m.m00() * v.x + m.m01() * v.y, m.m10() * v.x + m.m11() * v.y);
    }
    /**
   * Transforms a 2-dimensional vector by the inverse of our transform like it is a normal to a curve (so that the
   * curve is transformed, and the new normal to the curve at the transformed point is returned).
   * @public
   *
   * For an affine matrix $\begin{bmatrix} a & b & c \\ d & e & f \\ 0 & 0 & 1 \end{bmatrix}$,
   * the result is $\begin{bmatrix} a & e & 0 \\ d & b & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$.
   * This is essentially the transposed transform with translation removed.
   *
   * This is the inverse of transformNormal2().
   *
   * @param {Vector2} v
   * @returns {Vector2}
   */ inverseNormal2(v) {
        return this.matrix.timesTransposeVector2(v).normalize();
    }
    /**
   * Returns the resulting x-coordinate of the inverse transformation of all vectors with the initial input x-coordinate. If
   * this is not well-defined (the x value depends on y), an assertion is thrown (and y is assumed to be 0).
   * @public
   *
   * This is the inverse of transformX().
   *
   * @param {number} x
   * @returns {number}
   */ inverseX(x) {
        const m = this.getInverse();
        assert && assert(!m.m01(), 'Inverting an X value with a rotation/shear is ill-defined');
        return m.m00() * x + m.m02();
    }
    /**
   * Returns the resulting y-coordinate of the inverse transformation of all vectors with the initial input y-coordinate. If
   * this is not well-defined (the y value depends on x), an assertion is thrown (and x is assumed to be 0).
   * @public
   *
   * This is the inverse of transformY().
   *
   * @param {number} y
   * @returns {number}
   */ inverseY(y) {
        const m = this.getInverse();
        assert && assert(!m.m10(), 'Inverting a Y value with a rotation/shear is ill-defined');
        return m.m11() * y + m.m12();
    }
    /**
   * Returns the x-coordinate difference for two inverse-transformed vectors, which add the x-coordinate difference of the input
   * x (and same y values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaX().
   *
   * @param {number} x
   * @returns {number}
   */ inverseDeltaX(x) {
        const m = this.getInverse();
        assert && assert(!m.m01(), 'Inverting an X value with a rotation/shear is ill-defined');
        // same as this.inverseDelta2( new Vector2( x, 0 ) ).x;
        return m.m00() * x;
    }
    /**
   * Returns the y-coordinate difference for two inverse-transformed vectors, which add the y-coordinate difference of the input
   * y (and same x values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaY().
   *
   * @param {number} y
   * @returns {number}
   */ inverseDeltaY(y) {
        const m = this.getInverse();
        assert && assert(!m.m10(), 'Inverting a Y value with a rotation/shear is ill-defined');
        // same as this.inverseDelta2( new Vector2( 0, y ) ).y;
        return m.m11() * y;
    }
    /**
   * Returns bounds (axis-aligned) that contains the inverse-transformed bounds rectangle.
   * @public
   *
   * NOTE: transform.inverseBounds2( transform.transformBounds2( bounds ) ) may be larger than the original box,
   * if it includes a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in
   * area to cover ALL of the corners of the transformed bounding box.
   *
   * @param {Bounds2} bounds
   * @returns {Bounds2}
   */ inverseBounds2(bounds) {
        return bounds.transformed(this.getInverse());
    }
    /**
   * Returns an inverse-transformed phet.kite.Shape.
   * @public
   *
   * This is the inverse of transformShape()
   *
   * @param {Shape} shape
   * @returns {Shape}
   */ inverseShape(shape) {
        return shape.transformed(this.getInverse());
    }
    /**
   * Returns an inverse-transformed ray.
   * @public
   *
   * This is the inverse of transformRay2()
   *
   * @param {Ray2} ray
   * @returns {Ray2}
   */ inverseRay2(ray) {
        return new Ray2(this.inversePosition2(ray.position), this.inverseDelta2(ray.direction).normalized());
    }
    /**
   * Creates a transform based around an initial matrix.
   * @public
   *
   * @param {Matrix3} [matrix]
   */ constructor(matrix){
        // @private {Matrix3} - The primary matrix used for the transform
        this.matrix = Matrix3.IDENTITY.copy();
        // @private {Matrix3} - The inverse of the primary matrix, computed lazily
        this.inverse = Matrix3.IDENTITY.copy();
        // @private {Matrix3} - The transpose of the primary matrix, computed lazily
        this.matrixTransposed = Matrix3.IDENTITY.copy();
        // @private {Matrix3} - The inverse of the transposed primary matrix, computed lazily
        this.inverseTransposed = Matrix3.IDENTITY.copy();
        // @private {boolean} - Whether this.inverse has been computed based on the latest primary matrix
        this.inverseValid = true;
        // @private {boolean} - Whether this.matrixTransposed has been computed based on the latest primary matrix
        this.transposeValid = true;
        // @private {boolean} - Whether this.inverseTransposed has been computed based on the latest primary matrix
        this.inverseTransposeValid = true;
        // @public {TinyEmitter}
        this.changeEmitter = new TinyEmitter();
        if (matrix) {
            this.setMatrix(matrix);
        }
    }
};
dot.register('Transform3', Transform3);
export default Transform3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm0zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvcndhcmQgYW5kIGludmVyc2UgdHJhbnNmb3JtcyB3aXRoIDN4MyBtYXRyaWNlcy4gTWV0aG9kcyBzdGFydGluZyB3aXRoICd0cmFuc2Zvcm0nIHdpbGwgYXBwbHkgdGhlIHRyYW5zZm9ybSBmcm9tIG91clxuICogcHJpbWFyeSBtYXRyaXgsIHdoaWxlIG1ldGhvZHMgc3RhcnRpbmcgd2l0aCAnaW52ZXJzZScgd2lsbCBhcHBseSB0aGUgdHJhbnNmb3JtIGZyb20gdGhlIGludmVyc2Ugb2Ygb3VyIG1hdHJpeC5cbiAqXG4gKiBHZW5lcmFsbHksIHRoaXMgbWVhbnMgdHJhbnNmb3JtLmludmVyc2VUaGluZyggdHJhbnNmb3JtLnRyYW5zZm9ybVRoaW5nKCB0aGluZyApICkuZXF1YWxzKCB0aGluZyApLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4vTWF0cml4My5qcyc7XG5pbXBvcnQgUmF5MiBmcm9tICcuL1JheTIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcblxuY29uc3Qgc2NyYXRjaE1hdHJpeCA9IG5ldyBNYXRyaXgzKCk7XG5cbmNsYXNzIFRyYW5zZm9ybTMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIHRyYW5zZm9ybSBiYXNlZCBhcm91bmQgYW4gaW5pdGlhbCBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXgzfSBbbWF0cml4XVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG1hdHJpeCApIHtcbiAgICAvLyBAcHJpdmF0ZSB7TWF0cml4M30gLSBUaGUgcHJpbWFyeSBtYXRyaXggdXNlZCBmb3IgdGhlIHRyYW5zZm9ybVxuICAgIHRoaXMubWF0cml4ID0gTWF0cml4My5JREVOVElUWS5jb3B5KCk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7TWF0cml4M30gLSBUaGUgaW52ZXJzZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxuICAgIHRoaXMuaW52ZXJzZSA9IE1hdHJpeDMuSURFTlRJVFkuY29weSgpO1xuXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDN9IC0gVGhlIHRyYW5zcG9zZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxuICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZCA9IE1hdHJpeDMuSURFTlRJVFkuY29weSgpO1xuXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDN9IC0gVGhlIGludmVyc2Ugb2YgdGhlIHRyYW5zcG9zZWQgcHJpbWFyeSBtYXRyaXgsIGNvbXB1dGVkIGxhemlseVxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQgPSBNYXRyaXgzLklERU5USVRZLmNvcHkoKTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZXRoZXIgdGhpcy5pbnZlcnNlIGhhcyBiZWVuIGNvbXB1dGVkIGJhc2VkIG9uIHRoZSBsYXRlc3QgcHJpbWFyeSBtYXRyaXhcbiAgICB0aGlzLmludmVyc2VWYWxpZCA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMubWF0cml4VHJhbnNwb3NlZCBoYXMgYmVlbiBjb21wdXRlZCBiYXNlZCBvbiB0aGUgbGF0ZXN0IHByaW1hcnkgbWF0cml4XG4gICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQgaGFzIGJlZW4gY29tcHV0ZWQgYmFzZWQgb24gdGhlIGxhdGVzdCBwcmltYXJ5IG1hdHJpeFxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcblxuICAgIC8vIEBwdWJsaWMge1RpbnlFbWl0dGVyfVxuICAgIHRoaXMuY2hhbmdlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gICAgaWYgKCBtYXRyaXggKSB7XG4gICAgICB0aGlzLnNldE1hdHJpeCggbWF0cml4ICk7XG4gICAgfVxuICB9XG5cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogbXV0YXRvcnNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXggZGlyZWN0bHkgZnJvbSBhIE1hdHJpeDMuIERvZXMgbm90IGNoYW5nZSB0aGUgTWF0cml4MyBpbnN0YW5jZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeFxuICAgKi9cbiAgc2V0TWF0cml4KCBtYXRyaXggKSB7XG5cbiAgICAvLyBjb3B5IHRoZSBtYXRyaXggb3ZlciB0byBvdXIgbWF0cml4XG4gICAgdGhpcy5tYXRyaXguc2V0KCBtYXRyaXggKTtcblxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGVzIHRoZSBtYXRyaXggb3IgbWF0cml4IGFyZ3VtZW50cywgb3ZlcnJpZGVhYmxlIGJ5IHN1YmNsYXNzZXMgdG8gcmVmaW5lIHRoZSB2YWxpZGF0aW9uLlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIHZhbGlkYXRlTWF0cml4KCBtYXRyaXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4IGluc3RhbmNlb2YgTWF0cml4MywgJ21hdHJpeCB3YXMgaW5jb3JyZWN0IHR5cGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4LmlzRmluaXRlKCksICdtYXRyaXggbXVzdCBiZSBmaW5pdGUnICk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIG91ciBpbnRlcm5hbCBtYXRyaXggaXMgY2hhbmdlZC4gSXQgbWFya3MgdGhlIG90aGVyIGRlcGVuZGVudCBtYXRyaWNlcyBhcyBpbnZhbGlkLFxuICAgKiBhbmQgc2VuZHMgb3V0IG5vdGlmaWNhdGlvbnMgb2YgdGhlIGNoYW5nZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGludmFsaWRhdGUoKSB7XG5cbiAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICBhc3NlcnQgJiYgdGhpcy52YWxpZGF0ZU1hdHJpeCggdGhpcy5tYXRyaXggKTtcblxuICAgIC8vIGRlcGVuZGVudCBtYXRyaWNlcyBub3cgaW52YWxpZFxuICAgIHRoaXMuaW52ZXJzZVZhbGlkID0gZmFsc2U7XG4gICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IGZhbHNlO1xuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gZmFsc2U7XG5cbiAgICB0aGlzLmNoYW5nZUVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBwcmltYXJ5IG1hdHJpeCBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gbWF0cml4ICogdGhpcy5tYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXgzfSBtYXRyaXhcbiAgICovXG4gIHByZXBlbmQoIG1hdHJpeCApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy52YWxpZGF0ZU1hdHJpeCggbWF0cml4ICk7XG5cbiAgICAvLyBJbiB0aGUgYWJzZW5jZSBvZiBhIHByZXBlbmQtbXVsdGlwbHkgZnVuY3Rpb24gaW4gTWF0cml4MywgY29weSBvdmVyIHRvIGEgc2NyYXRjaCBtYXRyaXggaW5zdGVhZFxuICAgIC8vIFRPRE86IGltcGxlbWVudCBhIHByZXBlbmQtbXVsdGlwbHkgZGlyZWN0bHkgaW4gTWF0cml4MyBmb3IgYSBwZXJmb3JtYW5jZSBpbmNyZWFzZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHNjcmF0Y2hNYXRyaXguc2V0KCB0aGlzLm1hdHJpeCApO1xuICAgIHRoaXMubWF0cml4LnNldCggbWF0cml4ICk7XG4gICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIHNjcmF0Y2hNYXRyaXggKTtcblxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogT3B0aW1pemVkIHByZXBlbmRlZCB0cmFuc2xhdGlvbiBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gdHJhbnNsYXRpb24oIHgsIHkgKSAqIHRoaXMubWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gIHgtY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtICB5LWNvb3JkaW5hdGVcbiAgICovXG4gIHByZXBlbmRUcmFuc2xhdGlvbiggeCwgeSApIHtcbiAgICAvLyBTZWUgc2NlbmVyeSMxMTkgZm9yIG1vcmUgZGV0YWlscyBvbiB0aGUgbmVlZC5cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgeSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHggKSAmJiBpc0Zpbml0ZSggeSApLFxuICAgICAgJ0F0dGVtcHRlZCB0byBwcmVwZW5kIG5vbi1maW5pdGUgb3Igbm9uLW51bWJlciAoeCx5KSB0byB0aGUgdHJhbnNmb3JtJyApO1xuXG4gICAgdGhpcy5tYXRyaXgucHJlcGVuZFRyYW5zbGF0aW9uKCB4LCB5ICk7XG5cbiAgICAvLyBzZXQgZmxhZ3MgYW5kIG5vdGlmeVxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBwcmltYXJ5IG1hdHJpeCBzdWNoIHRoYXQ6IHRoaXMubWF0cml4ID0gdGhpcy5tYXRyaXggKiBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeFxuICAgKi9cbiAgYXBwZW5kKCBtYXRyaXggKSB7XG4gICAgYXNzZXJ0ICYmIHRoaXMudmFsaWRhdGVNYXRyaXgoIG1hdHJpeCApO1xuXG4gICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIG1hdHJpeCApO1xuXG4gICAgLy8gc2V0IGZsYWdzIGFuZCBub3RpZnlcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIHByZXBlbmQoKSwgYnV0IHByZXBlbmRzIHRoZSBvdGhlciB0cmFuc2Zvcm0ncyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtUcmFuc2Zvcm0zfSB0cmFuc2Zvcm1cbiAgICovXG4gIHByZXBlbmRUcmFuc2Zvcm0oIHRyYW5zZm9ybSApIHtcbiAgICB0aGlzLnByZXBlbmQoIHRyYW5zZm9ybS5tYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIGFwcGVuZCgpLCBidXQgYXBwZW5kcyB0aGUgb3RoZXIgdHJhbnNmb3JtJ3MgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhbnNmb3JtM30gdHJhbnNmb3JtXG4gICAqL1xuICBhcHBlbmRUcmFuc2Zvcm0oIHRyYW5zZm9ybSApIHtcbiAgICB0aGlzLmFwcGVuZCggdHJhbnNmb3JtLm1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRyYW5zZm9ybSBvZiBhIENhbnZhcyBjb250ZXh0IHRvIGJlIGVxdWl2YWxlbnQgdG8gdGhpcyB0cmFuc2Zvcm0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcbiAgICovXG4gIGFwcGx5VG9DYW52YXNDb250ZXh0KCBjb250ZXh0ICkge1xuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCB0aGlzLm1hdHJpeC5tMDAoKSwgdGhpcy5tYXRyaXgubTEwKCksIHRoaXMubWF0cml4Lm0wMSgpLCB0aGlzLm1hdHJpeC5tMTEoKSwgdGhpcy5tYXRyaXgubTAyKCksIHRoaXMubWF0cml4Lm0xMigpICk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogZ2V0dGVyc1xuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIHRoaXMgdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtUcmFuc2Zvcm0zfVxuICAgKi9cbiAgY29weSgpIHtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtMyggdGhpcy5tYXRyaXggKTtcblxuICAgIHRyYW5zZm9ybS5pbnZlcnNlID0gdGhpcy5pbnZlcnNlO1xuICAgIHRyYW5zZm9ybS5tYXRyaXhUcmFuc3Bvc2VkID0gdGhpcy5tYXRyaXhUcmFuc3Bvc2VkO1xuICAgIHRyYW5zZm9ybS5pbnZlcnNlVHJhbnNwb3NlZCA9IHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQ7XG5cbiAgICB0cmFuc2Zvcm0uaW52ZXJzZVZhbGlkID0gdGhpcy5pbnZlcnNlVmFsaWQ7XG4gICAgdHJhbnNmb3JtLnRyYW5zcG9zZVZhbGlkID0gdGhpcy50cmFuc3Bvc2VWYWxpZDtcbiAgICB0cmFuc2Zvcm0uaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJpbWFyeSBtYXRyaXggb2YgdGhpcyB0cmFuc2Zvcm0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge01hdHJpeDN9XG4gICAqL1xuICBnZXRNYXRyaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0cml4O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxuICAgKi9cbiAgZ2V0SW52ZXJzZSgpIHtcbiAgICBpZiAoICF0aGlzLmludmVyc2VWYWxpZCApIHtcbiAgICAgIHRoaXMuaW52ZXJzZVZhbGlkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5pbnZlcnNlLnNldCggdGhpcy5tYXRyaXggKTtcbiAgICAgIHRoaXMuaW52ZXJzZS5pbnZlcnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxuICAgKi9cbiAgZ2V0TWF0cml4VHJhbnNwb3NlZCgpIHtcbiAgICBpZiAoICF0aGlzLnRyYW5zcG9zZVZhbGlkICkge1xuICAgICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IHRydWU7XG5cbiAgICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZC5zZXQoIHRoaXMubWF0cml4ICk7XG4gICAgICB0aGlzLm1hdHJpeFRyYW5zcG9zZWQudHJhbnNwb3NlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1hdHJpeFRyYW5zcG9zZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgdHJhbnNwb3NlIG9mIG1hdHJpeCBvZiB0aGlzIHRyYW5zZm9ybS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cbiAgICovXG4gIGdldEludmVyc2VUcmFuc3Bvc2VkKCkge1xuICAgIGlmICggIXRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkICkge1xuICAgICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgPSB0cnVlO1xuXG4gICAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VkLnNldCggdGhpcy5nZXRJbnZlcnNlKCkgKTsgLy8gdHJpZ2dlcnMgaW52ZXJzZSB0byBiZSB2YWxpZFxuICAgICAgdGhpcy5pbnZlcnNlVHJhbnNwb3NlZC50cmFuc3Bvc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIG91ciBwcmltYXJ5IG1hdHJpeCBpcyBrbm93biB0byBiZSBhbiBpZGVudGl0eSBtYXRyaXguIElmIGZhbHNlIGlzIHJldHVybmVkLCBpdCBkb2Vzbid0IG5lY2Vzc2FyaWx5XG4gICAqIG1lYW4gb3VyIG1hdHJpeCBpc24ndCBhbiBpZGVudGl0eSBtYXRyaXgsIGp1c3QgdGhhdCBpdCBpcyB1bmxpa2VseSBpbiBub3JtYWwgdXNhZ2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0lkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC5pc0Zhc3RJZGVudGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhbnkgY29tcG9uZW50cyBvZiBvdXIgcHJpbWFyeSBtYXRyaXggYXJlIGVpdGhlciBpbmZpbml0ZSBvciBOYU4uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0Zpbml0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRyaXguaXNGaW5pdGUoKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBmb3J3YXJkIHRyYW5zZm9ybXMgKGZvciBWZWN0b3IyIG9yIHNjYWxhcilcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBpdCBpcyBhIHBvaW50IHdpdGggYSBwb3NpdGlvbiAodHJhbnNsYXRpb24gaXMgYXBwbGllZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJE0kLCB0aGUgcmVzdWx0IGlzIHRoZSBob21vZ2VuZW91cyBtdWx0aXBsaWNhdGlvbiAkTVxcYmVnaW57Ym1hdHJpeH0geCBcXFxcIHkgXFxcXCAxIFxcZW5ke2JtYXRyaXh9JC5cbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxuICAgKi9cbiAgdHJhbnNmb3JtUG9zaXRpb24yKCB2ICkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC50aW1lc1ZlY3RvcjIoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBwb3NpdGlvbiBpcyBpcnJlbGV2YW50ICh0cmFuc2xhdGlvbiBpcyBub3QgYXBwbGllZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGIgJiBjIFxcXFwgZCAmIGUgJiBmIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9JCxcbiAgICogdGhlIHJlc3VsdCBpcyAkXFxiZWdpbntibWF0cml4fSBhICYgYiAmIDAgXFxcXCBkICYgZSAmIDAgXFxcXCAwICYgMCAmIDEgXFxlbmR7Ym1hdHJpeH0gXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICB0cmFuc2Zvcm1EZWx0YTIoIHYgKSB7XG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XG4gICAgLy8gbSAuIHYgLSBtIC4gVmVjdG9yMi5aRVJPXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBtLm0wMCgpICogdi54ICsgbS5tMDEoKSAqIHYueSwgbS5tMTAoKSAqIHYueCArIG0ubTExKCkgKiB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBpdCBpcyBhIG5vcm1hbCB0byBhIGN1cnZlIChzbyB0aGF0IHRoZSBjdXJ2ZSBpcyB0cmFuc2Zvcm1lZCwgYW5kIHRoZSBuZXdcbiAgICogbm9ybWFsIHRvIHRoZSBjdXJ2ZSBhdCB0aGUgdHJhbnNmb3JtZWQgcG9pbnQgaXMgcmV0dXJuZWQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEZvciBhbiBhZmZpbmUgbWF0cml4ICRcXGJlZ2lue2JtYXRyaXh9IGEgJiBiICYgYyBcXFxcIGQgJiBlICYgZiBcXFxcIDAgJiAwICYgMSBcXGVuZHtibWF0cml4fSQsXG4gICAqIHRoZSByZXN1bHQgaXMgJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGUgJiAwIFxcXFwgZCAmIGIgJiAwIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9XnstMX0gXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxuICAgKiBUaGlzIGlzIGVzc2VudGlhbGx5IHRoZSB0cmFuc3Bvc2VkIGludmVyc2Ugd2l0aCB0cmFuc2xhdGlvbiByZW1vdmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICB0cmFuc2Zvcm1Ob3JtYWwyKCB2ICkge1xuICAgIHJldHVybiB0aGlzLmdldEludmVyc2UoKS50aW1lc1RyYW5zcG9zZVZlY3RvcjIoIHYgKS5ub3JtYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgeC1jb29yZGluYXRlIG9mIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiBhbGwgdmVjdG9ycyB3aXRoIHRoZSBpbml0aWFsIGlucHV0IHgtY29vcmRpbmF0ZS4gSWZcbiAgICogdGhpcyBpcyBub3Qgd2VsbC1kZWZpbmVkICh0aGUgeCB2YWx1ZSBkZXBlbmRzIG9uIHkpLCBhbiBhc3NlcnRpb24gaXMgdGhyb3duIChhbmQgeSBpcyBhc3N1bWVkIHRvIGJlIDApLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0cmFuc2Zvcm1YKCB4ICkge1xuICAgIGNvbnN0IG0gPSB0aGlzLmdldE1hdHJpeCgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFtLm0wMSgpLCAnVHJhbnNmb3JtaW5nIGFuIFggdmFsdWUgd2l0aCBhIHJvdGF0aW9uL3NoZWFyIGlzIGlsbC1kZWZpbmVkJyApO1xuICAgIHJldHVybiBtLm0wMCgpICogeCArIG0ubTAyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0aW5nIHktY29vcmRpbmF0ZSBvZiB0aGUgdHJhbnNmb3JtYXRpb24gb2YgYWxsIHZlY3RvcnMgd2l0aCB0aGUgaW5pdGlhbCBpbnB1dCB5LWNvb3JkaW5hdGUuIElmXG4gICAqIHRoaXMgaXMgbm90IHdlbGwtZGVmaW5lZCAodGhlIHkgdmFsdWUgZGVwZW5kcyBvbiB4KSwgYW4gYXNzZXJ0aW9uIGlzIHRocm93biAoYW5kIHggaXMgYXNzdW1lZCB0byBiZSAwKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdHJhbnNmb3JtWSggeSApIHtcbiAgICBjb25zdCBtID0gdGhpcy5nZXRNYXRyaXgoKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbS5tMTAoKSwgJ1RyYW5zZm9ybWluZyBhIFkgdmFsdWUgd2l0aCBhIHJvdGF0aW9uL3NoZWFyIGlzIGlsbC1kZWZpbmVkJyApO1xuICAgIHJldHVybiBtLm0xMSgpICogeSArIG0ubTEyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byB0cmFuc2Zvcm1lZCB2ZWN0b3JzLCB3aGljaCBhZGQgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIG9mIHRoZSBpbnB1dFxuICAgKiB4IChhbmQgc2FtZSB5IHZhbHVlcykgYmVmb3JlaGFuZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdHJhbnNmb3JtRGVsdGFYKCB4ICkge1xuICAgIGNvbnN0IG0gPSB0aGlzLmdldE1hdHJpeCgpO1xuICAgIC8vIHNhbWUgYXMgdGhpcy50cmFuc2Zvcm1EZWx0YTIoIG5ldyBWZWN0b3IyKCB4LCAwICkgKS54O1xuICAgIHJldHVybiBtLm0wMCgpICogeDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIHRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgeS1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XG4gICAqIHkgKGFuZCBzYW1lIHggdmFsdWVzKSBiZWZvcmVoYW5kLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0cmFuc2Zvcm1EZWx0YVkoIHkgKSB7XG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0TWF0cml4KCk7XG4gICAgLy8gc2FtZSBhcyB0aGlzLnRyYW5zZm9ybURlbHRhMiggbmV3IFZlY3RvcjIoIDAsIHkgKSApLnk7XG4gICAgcmV0dXJuIG0ubTExKCkgKiB5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYm91bmRzIChheGlzLWFsaWduZWQpIHRoYXQgY29udGFpbnMgdGhlIHRyYW5zZm9ybWVkIGJvdW5kcyByZWN0YW5nbGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogTk9URTogdHJhbnNmb3JtLmludmVyc2VCb3VuZHMyKCB0cmFuc2Zvcm0udHJhbnNmb3JtQm91bmRzMiggYm91bmRzICkgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCxcbiAgICogaWYgaXQgaW5jbHVkZXMgYSByb3RhdGlvbiB0aGF0IGlzbid0IGEgbXVsdGlwbGUgb2YgJFxccGkvMiQuIFRoaXMgaXMgYmVjYXVzZSB0aGUgcmV0dXJuZWQgYm91bmRzIG1heSBleHBhbmQgaW5cbiAgICogYXJlYSB0byBjb3ZlciBBTEwgb2YgdGhlIGNvcm5lcnMgb2YgdGhlIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveC5cbiAgICpcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcbiAgICogQHJldHVybnMge0JvdW5kczJ9XG4gICAqL1xuICB0cmFuc2Zvcm1Cb3VuZHMyKCBib3VuZHMgKSB7XG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm1lZCggdGhpcy5tYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdHJhbnNmb3JtZWQgcGhldC5raXRlLlNoYXBlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIHRyYW5zZm9ybVNoYXBlKCBzaGFwZSApIHtcbiAgICByZXR1cm4gc2hhcGUudHJhbnNmb3JtZWQoIHRoaXMubWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRyYW5zZm9ybWVkIHJheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1JheTJ9IHJheVxuICAgKiBAcmV0dXJucyB7UmF5Mn1cbiAgICovXG4gIHRyYW5zZm9ybVJheTIoIHJheSApIHtcbiAgICByZXR1cm4gbmV3IFJheTIoIHRoaXMudHJhbnNmb3JtUG9zaXRpb24yKCByYXkucG9zaXRpb24gKSwgdGhpcy50cmFuc2Zvcm1EZWx0YTIoIHJheS5kaXJlY3Rpb24gKS5ub3JtYWxpemVkKCkgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBpbnZlcnNlIHRyYW5zZm9ybXMgKGZvciBWZWN0b3IyIG9yIHNjYWxhcilcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgMi1kaW1lbnNpb25hbCB2ZWN0b3IgYnkgdGhlIGludmVyc2Ugb2Ygb3VyIHRyYW5zZm9ybSBsaWtlIGl0IGlzIGEgcG9pbnQgd2l0aCBhIHBvc2l0aW9uICh0cmFuc2xhdGlvbiBpcyBhcHBsaWVkKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkTSQsIHRoZSByZXN1bHQgaXMgdGhlIGhvbW9nZW5lb3VzIG11bHRpcGxpY2F0aW9uICRNXnstMX1cXGJlZ2lue2JtYXRyaXh9IHggXFxcXCB5IFxcXFwgMSBcXGVuZHtibWF0cml4fSQuXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGludmVyc2Ugb2YgdHJhbnNmb3JtUG9zaXRpb24yKCkuXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdlxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cbiAgICovXG4gIGludmVyc2VQb3NpdGlvbjIoIHYgKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW52ZXJzZSgpLnRpbWVzVmVjdG9yMiggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSAyLWRpbWVuc2lvbmFsIHZlY3RvciBieSB0aGUgaW52ZXJzZSBvZiBvdXIgdHJhbnNmb3JtIGxpa2UgcG9zaXRpb24gaXMgaXJyZWxldmFudCAodHJhbnNsYXRpb24gaXMgbm90IGFwcGxpZWQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEZvciBhbiBhZmZpbmUgbWF0cml4ICRcXGJlZ2lue2JtYXRyaXh9IGEgJiBiICYgYyBcXFxcIGQgJiBlICYgZiBcXFxcIDAgJiAwICYgMSBcXGVuZHtibWF0cml4fSQsXG4gICAqIHRoZSByZXN1bHQgaXMgJFxcYmVnaW57Ym1hdHJpeH0gYSAmIGIgJiAwIFxcXFwgZCAmIGUgJiAwIFxcXFwgMCAmIDAgJiAxIFxcZW5ke2JtYXRyaXh9XnstMX0gXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIDEgXFxlbmR7Ym1hdHJpeH0kLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybURlbHRhMigpLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICBpbnZlcnNlRGVsdGEyKCB2ICkge1xuICAgIGNvbnN0IG0gPSB0aGlzLmdldEludmVyc2UoKTtcbiAgICAvLyBtIC4gdiAtIG0gLiBWZWN0b3IyLlpFUk9cbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIG0ubTAwKCkgKiB2LnggKyBtLm0wMSgpICogdi55LCBtLm0xMCgpICogdi54ICsgbS5tMTEoKSAqIHYueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSAyLWRpbWVuc2lvbmFsIHZlY3RvciBieSB0aGUgaW52ZXJzZSBvZiBvdXIgdHJhbnNmb3JtIGxpa2UgaXQgaXMgYSBub3JtYWwgdG8gYSBjdXJ2ZSAoc28gdGhhdCB0aGVcbiAgICogY3VydmUgaXMgdHJhbnNmb3JtZWQsIGFuZCB0aGUgbmV3IG5vcm1hbCB0byB0aGUgY3VydmUgYXQgdGhlIHRyYW5zZm9ybWVkIHBvaW50IGlzIHJldHVybmVkKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkXFxiZWdpbntibWF0cml4fSBhICYgYiAmIGMgXFxcXCBkICYgZSAmIGYgXFxcXCAwICYgMCAmIDEgXFxlbmR7Ym1hdHJpeH0kLFxuICAgKiB0aGUgcmVzdWx0IGlzICRcXGJlZ2lue2JtYXRyaXh9IGEgJiBlICYgMCBcXFxcIGQgJiBiICYgMCBcXFxcIDAgJiAwICYgMSBcXGVuZHtibWF0cml4fSBcXGJlZ2lue2JtYXRyaXh9IHggXFxcXCB5IFxcXFwgMSBcXGVuZHtibWF0cml4fSQuXG4gICAqIFRoaXMgaXMgZXNzZW50aWFsbHkgdGhlIHRyYW5zcG9zZWQgdHJhbnNmb3JtIHdpdGggdHJhbnNsYXRpb24gcmVtb3ZlZC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1Ob3JtYWwyKCkuXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdlxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cbiAgICovXG4gIGludmVyc2VOb3JtYWwyKCB2ICkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC50aW1lc1RyYW5zcG9zZVZlY3RvcjIoIHYgKS5ub3JtYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgeC1jb29yZGluYXRlIG9mIHRoZSBpbnZlcnNlIHRyYW5zZm9ybWF0aW9uIG9mIGFsbCB2ZWN0b3JzIHdpdGggdGhlIGluaXRpYWwgaW5wdXQgeC1jb29yZGluYXRlLiBJZlxuICAgKiB0aGlzIGlzIG5vdCB3ZWxsLWRlZmluZWQgKHRoZSB4IHZhbHVlIGRlcGVuZHMgb24geSksIGFuIGFzc2VydGlvbiBpcyB0aHJvd24gKGFuZCB5IGlzIGFzc3VtZWQgdG8gYmUgMCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1YKCkuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBpbnZlcnNlWCggeCApIHtcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW0ubTAxKCksICdJbnZlcnRpbmcgYW4gWCB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XG4gICAgcmV0dXJuIG0ubTAwKCkgKiB4ICsgbS5tMDIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRpbmcgeS1jb29yZGluYXRlIG9mIHRoZSBpbnZlcnNlIHRyYW5zZm9ybWF0aW9uIG9mIGFsbCB2ZWN0b3JzIHdpdGggdGhlIGluaXRpYWwgaW5wdXQgeS1jb29yZGluYXRlLiBJZlxuICAgKiB0aGlzIGlzIG5vdCB3ZWxsLWRlZmluZWQgKHRoZSB5IHZhbHVlIGRlcGVuZHMgb24geCksIGFuIGFzc2VydGlvbiBpcyB0aHJvd24gKGFuZCB4IGlzIGFzc3VtZWQgdG8gYmUgMCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1ZKCkuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBpbnZlcnNlWSggeSApIHtcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW0ubTEwKCksICdJbnZlcnRpbmcgYSBZIHZhbHVlIHdpdGggYSByb3RhdGlvbi9zaGVhciBpcyBpbGwtZGVmaW5lZCcgKTtcbiAgICByZXR1cm4gbS5tMTEoKSAqIHkgKyBtLm0xMigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gaW52ZXJzZS10cmFuc2Zvcm1lZCB2ZWN0b3JzLCB3aGljaCBhZGQgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIG9mIHRoZSBpbnB1dFxuICAgKiB4IChhbmQgc2FtZSB5IHZhbHVlcykgYmVmb3JlaGFuZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybURlbHRhWCgpLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgaW52ZXJzZURlbHRhWCggeCApIHtcbiAgICBjb25zdCBtID0gdGhpcy5nZXRJbnZlcnNlKCk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW0ubTAxKCksICdJbnZlcnRpbmcgYW4gWCB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XG4gICAgLy8gc2FtZSBhcyB0aGlzLmludmVyc2VEZWx0YTIoIG5ldyBWZWN0b3IyKCB4LCAwICkgKS54O1xuICAgIHJldHVybiBtLm0wMCgpICogeDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIGludmVyc2UtdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcbiAgICogeSAoYW5kIHNhbWUgeCB2YWx1ZXMpIGJlZm9yZWhhbmQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVkoKS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGludmVyc2VEZWx0YVkoIHkgKSB7XG4gICAgY29uc3QgbSA9IHRoaXMuZ2V0SW52ZXJzZSgpO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFtLm0xMCgpLCAnSW52ZXJ0aW5nIGEgWSB2YWx1ZSB3aXRoIGEgcm90YXRpb24vc2hlYXIgaXMgaWxsLWRlZmluZWQnICk7XG4gICAgLy8gc2FtZSBhcyB0aGlzLmludmVyc2VEZWx0YTIoIG5ldyBWZWN0b3IyKCAwLCB5ICkgKS55O1xuICAgIHJldHVybiBtLm0xMSgpICogeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGJvdW5kcyAoYXhpcy1hbGlnbmVkKSB0aGF0IGNvbnRhaW5zIHRoZSBpbnZlcnNlLXRyYW5zZm9ybWVkIGJvdW5kcyByZWN0YW5nbGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogTk9URTogdHJhbnNmb3JtLmludmVyc2VCb3VuZHMyKCB0cmFuc2Zvcm0udHJhbnNmb3JtQm91bmRzMiggYm91bmRzICkgKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIG9yaWdpbmFsIGJveCxcbiAgICogaWYgaXQgaW5jbHVkZXMgYSByb3RhdGlvbiB0aGF0IGlzbid0IGEgbXVsdGlwbGUgb2YgJFxccGkvMiQuIFRoaXMgaXMgYmVjYXVzZSB0aGUgcmV0dXJuZWQgYm91bmRzIG1heSBleHBhbmQgaW5cbiAgICogYXJlYSB0byBjb3ZlciBBTEwgb2YgdGhlIGNvcm5lcnMgb2YgdGhlIHRyYW5zZm9ybWVkIGJvdW5kaW5nIGJveC5cbiAgICpcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcbiAgICogQHJldHVybnMge0JvdW5kczJ9XG4gICAqL1xuICBpbnZlcnNlQm91bmRzMiggYm91bmRzICkge1xuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuZ2V0SW52ZXJzZSgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbnZlcnNlLXRyYW5zZm9ybWVkIHBoZXQua2l0ZS5TaGFwZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybVNoYXBlKClcbiAgICpcbiAgICogQHBhcmFtIHtTaGFwZX0gc2hhcGVcbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgaW52ZXJzZVNoYXBlKCBzaGFwZSApIHtcbiAgICByZXR1cm4gc2hhcGUudHJhbnNmb3JtZWQoIHRoaXMuZ2V0SW52ZXJzZSgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbnZlcnNlLXRyYW5zZm9ybWVkIHJheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybVJheTIoKVxuICAgKlxuICAgKiBAcGFyYW0ge1JheTJ9IHJheVxuICAgKiBAcmV0dXJucyB7UmF5Mn1cbiAgICovXG4gIGludmVyc2VSYXkyKCByYXkgKSB7XG4gICAgcmV0dXJuIG5ldyBSYXkyKCB0aGlzLmludmVyc2VQb3NpdGlvbjIoIHJheS5wb3NpdGlvbiApLCB0aGlzLmludmVyc2VEZWx0YTIoIHJheS5kaXJlY3Rpb24gKS5ub3JtYWxpemVkKCkgKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdUcmFuc2Zvcm0zJywgVHJhbnNmb3JtMyApO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2Zvcm0zOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImRvdCIsIk1hdHJpeDMiLCJSYXkyIiwiVmVjdG9yMiIsInNjcmF0Y2hNYXRyaXgiLCJUcmFuc2Zvcm0zIiwic2V0TWF0cml4IiwibWF0cml4Iiwic2V0IiwiaW52YWxpZGF0ZSIsInZhbGlkYXRlTWF0cml4IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJpbnZlcnNlVmFsaWQiLCJ0cmFuc3Bvc2VWYWxpZCIsImludmVyc2VUcmFuc3Bvc2VWYWxpZCIsImNoYW5nZUVtaXR0ZXIiLCJlbWl0IiwicHJlcGVuZCIsIm11bHRpcGx5TWF0cml4IiwicHJlcGVuZFRyYW5zbGF0aW9uIiwieCIsInkiLCJhcHBlbmQiLCJwcmVwZW5kVHJhbnNmb3JtIiwidHJhbnNmb3JtIiwiYXBwZW5kVHJhbnNmb3JtIiwiYXBwbHlUb0NhbnZhc0NvbnRleHQiLCJjb250ZXh0Iiwic2V0VHJhbnNmb3JtIiwibTAwIiwibTEwIiwibTAxIiwibTExIiwibTAyIiwibTEyIiwiY29weSIsImludmVyc2UiLCJtYXRyaXhUcmFuc3Bvc2VkIiwiaW52ZXJzZVRyYW5zcG9zZWQiLCJnZXRNYXRyaXgiLCJnZXRJbnZlcnNlIiwiaW52ZXJ0IiwiZ2V0TWF0cml4VHJhbnNwb3NlZCIsInRyYW5zcG9zZSIsImdldEludmVyc2VUcmFuc3Bvc2VkIiwiaXNJZGVudGl0eSIsImlzRmFzdElkZW50aXR5IiwidHJhbnNmb3JtUG9zaXRpb24yIiwidiIsInRpbWVzVmVjdG9yMiIsInRyYW5zZm9ybURlbHRhMiIsIm0iLCJ0cmFuc2Zvcm1Ob3JtYWwyIiwidGltZXNUcmFuc3Bvc2VWZWN0b3IyIiwibm9ybWFsaXplIiwidHJhbnNmb3JtWCIsInRyYW5zZm9ybVkiLCJ0cmFuc2Zvcm1EZWx0YVgiLCJ0cmFuc2Zvcm1EZWx0YVkiLCJ0cmFuc2Zvcm1Cb3VuZHMyIiwiYm91bmRzIiwidHJhbnNmb3JtZWQiLCJ0cmFuc2Zvcm1TaGFwZSIsInNoYXBlIiwidHJhbnNmb3JtUmF5MiIsInJheSIsInBvc2l0aW9uIiwiZGlyZWN0aW9uIiwibm9ybWFsaXplZCIsImludmVyc2VQb3NpdGlvbjIiLCJpbnZlcnNlRGVsdGEyIiwiaW52ZXJzZU5vcm1hbDIiLCJpbnZlcnNlWCIsImludmVyc2VZIiwiaW52ZXJzZURlbHRhWCIsImludmVyc2VEZWx0YVkiLCJpbnZlcnNlQm91bmRzMiIsImludmVyc2VTaGFwZSIsImludmVyc2VSYXkyIiwiY29uc3RydWN0b3IiLCJJREVOVElUWSIsInJl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