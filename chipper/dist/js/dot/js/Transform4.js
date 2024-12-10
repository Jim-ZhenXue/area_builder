// Copyright 2013-2023, University of Colorado Boulder
/**
 * Forward and inverse transforms with 4x4 matrices, allowing flexibility including affine and perspective transformations.
 *
 * Methods starting with 'transform' will apply the transform from our
 * primary matrix, while methods starting with 'inverse' will apply the transform from the inverse of our matrix.
 *
 * Generally, this means transform.inverseThing( transform.transformThing( thing ) ).equals( thing ).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../axon/js/TinyEmitter.js';
import dot from './dot.js';
import Matrix4 from './Matrix4.js';
import Ray3 from './Ray3.js';
import Vector3 from './Vector3.js';
const scratchMatrix = new Matrix4();
/**
 * check if the matrix is Finite and is of type Matrix4
 * @private
 * @param matrix
 * @returns {boolean}
 */ function checkMatrix(matrix) {
    return matrix instanceof Matrix4 && matrix.isFinite();
}
let Transform4 = class Transform4 {
    /*---------------------------------------------------------------------------*
   * mutators
   *---------------------------------------------------------------------------*/ /**
   * Sets the value of the primary matrix directly from a Matrix4. Does not change the Matrix4 instance of this
   * Transform4.
   * @public
   *
   * @param {Matrix4} matrix
   */ setMatrix(matrix) {
        assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');
        // copy the matrix over to our matrix
        this.matrix.set(matrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * This should be called after our internal matrix is changed. It marks the other dependent matrices as invalid,
   * and sends out notifications of the change.
   * @private
   */ invalidate() {
        // sanity check
        assert && assert(this.matrix.isFinite());
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
   * @param {Matrix4} matrix
   */ prepend(matrix) {
        assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');
        // In the absence of a prepend-multiply function in Matrix4, copy over to a scratch matrix instead
        // TODO: implement a prepend-multiply directly in Matrix4 for a performance increase https://github.com/phetsims/dot/issues/96
        scratchMatrix.set(this.matrix);
        this.matrix.set(matrix);
        this.matrix.multiplyMatrix(scratchMatrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Modifies the primary matrix such that: this.matrix = this.matrix * matrix
   * @public
   *
   * @param {Matrix4} matrix
   */ append(matrix) {
        assert && assert(checkMatrix(matrix), 'Matrix has NaNs, non-finite values, or isn\'t a matrix!');
        this.matrix.multiplyMatrix(matrix);
        // set flags and notify
        this.invalidate();
    }
    /**
   * Like prepend(), but prepends the other transform's matrix.
   * @public
   *
   * @param {Transform4} transform
   */ prependTransform(transform) {
        this.prepend(transform.matrix);
    }
    /**
   * Like append(), but appends the other transform's matrix.
   * @public
   *
   * @param {Transform4} transform
   */ appendTransform(transform) {
        this.append(transform.matrix);
    }
    /**
   * Sets the transform of a Canvas context to be equivalent to the 2D affine part of this transform.
   * @public
   *
   * @param {CanvasRenderingContext2D} context
   */ applyToCanvasContext(context) {
        context.setTransform(this.matrix.m00(), this.matrix.m10(), this.matrix.m01(), this.matrix.m11(), this.matrix.m03(), this.matrix.m13());
    }
    /*---------------------------------------------------------------------------*
   * getters
   *---------------------------------------------------------------------------*/ /**
   * Creates a copy of this transform.
   * @public
   *
   * @returns {Transform4}
   */ copy() {
        const transform = new Transform4(this.matrix);
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
   * @returns {Matrix4}
   */ getMatrix() {
        return this.matrix;
    }
    /**
   * Returns the inverse of the primary matrix of this transform.
   * @public
   *
   * @returns {Matrix4}
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
   * @returns {Matrix4}
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
   * @returns {Matrix4}
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
        return this.matrix.type === Matrix4.Types.IDENTITY;
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
   * forward transforms (for Vector3 or scalar)
   *---------------------------------------------------------------------------*/ /**
   * Transforms a 3-dimensional vector like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$.
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ transformPosition3(v) {
        return this.matrix.timesVector3(v);
    }
    /**
   * Transforms a 3-dimensional vector like position is irrelevant (translation is not applied).
   * @public
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ transformDelta3(v) {
        return this.matrix.timesRelativeVector3(v);
    }
    /**
   * Transforms a 3-dimensional vector like it is a normal to a surface (so that the surface is transformed, and the new
   * normal to the surface at the transformed point is returned).
   * @public
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ transformNormal3(v) {
        return this.getInverse().timesTransposeVector3(v);
    }
    /**
   * Returns the x-coordinate difference for two transformed vectors, which add the x-coordinate difference of the input
   * x (and same y,z values) beforehand.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */ transformDeltaX(x) {
        return this.transformDelta3(new Vector3(x, 0, 0)).x;
    }
    /**
   * Returns the y-coordinate difference for two transformed vectors, which add the y-coordinate difference of the input
   * y (and same x,z values) beforehand.
   * @public
   *
   * @param {number} y
   * @returns {number}
   */ transformDeltaY(y) {
        return this.transformDelta3(new Vector3(0, y, 0)).y;
    }
    /**
   * Returns the z-coordinate difference for two transformed vectors, which add the z-coordinate difference of the input
   * z (and same x,y values) beforehand.
   * @public
   *
   * @param {number} z
   * @returns {number}
   */ transformDeltaZ(z) {
        return this.transformDelta3(new Vector3(0, 0, z)).z;
    }
    /**
   * Returns a transformed ray.
   * @public
   *
   * @param {Ray3} ray
   * @returns {Ray3}
   */ transformRay(ray) {
        return new Ray3(this.transformPosition3(ray.position), this.transformPosition3(ray.position.plus(ray.direction)).minus(this.transformPosition3(ray.position)));
    }
    /*---------------------------------------------------------------------------*
   * inverse transforms (for Vector3 or scalar)
   *---------------------------------------------------------------------------*/ /**
   * Transforms a 3-dimensional vector by the inverse of our transform like it is a point with a position (translation is applied).
   * @public
   *
   * For an affine matrix $M$, the result is the homogeneous multiplication $M^{-1}\begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$.
   *
   * This is the inverse of transformPosition3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ inversePosition3(v) {
        return this.getInverse().timesVector3(v);
    }
    /**
   * Transforms a 3-dimensional vector by the inverse of our transform like position is irrelevant (translation is not applied).
   * @public
   *
   * This is the inverse of transformDelta3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ inverseDelta3(v) {
        // inverse actually has the translation rolled into the other coefficients, so we have to make this longer
        return this.inversePosition3(v).minus(this.inversePosition3(Vector3.ZERO));
    }
    /**
   * Transforms a 3-dimensional vector by the inverse of our transform like it is a normal to a curve (so that the
   * curve is transformed, and the new normal to the curve at the transformed point is returned).
   * @public
   *
   * This is the inverse of transformNormal3().
   *
   * @param {Vector3} v
   * @returns {Vector3}
   */ inverseNormal3(v) {
        return this.matrix.timesTransposeVector3(v);
    }
    /**
   * Returns the x-coordinate difference for two inverse-transformed vectors, which add the x-coordinate difference of the input
   * x (and same y,z values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaX().
   *
   * @param {number} x
   * @returns {number}
   */ inverseDeltaX(x) {
        return this.inverseDelta3(new Vector3(x, 0, 0)).x;
    }
    /**
   * Returns the y-coordinate difference for two inverse-transformed vectors, which add the y-coordinate difference of the input
   * y (and same x,z values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaY().
   *
   * @param {number} y
   * @returns {number}
   */ inverseDeltaY(y) {
        return this.inverseDelta3(new Vector3(0, y, 0)).y;
    }
    /**
   * Returns the z-coordinate difference for two inverse-transformed vectors, which add the z-coordinate difference of the input
   * z (and same x,y values) beforehand.
   * @public
   *
   * This is the inverse of transformDeltaZ().
   *
   * @param {number} z
   * @returns {number}
   */ inverseDeltaZ(z) {
        return this.inverseDelta3(new Vector3(0, 0, z)).z;
    }
    /**
   * Returns an inverse-transformed ray.
   * @public
   *
   * This is the inverse of transformRay()
   *
   * @param {Ray3} ray
   * @returns {Ray3}
   */ inverseRay(ray) {
        return new Ray3(this.inversePosition3(ray.position), this.inversePosition3(ray.position.plus(ray.direction)).minus(this.inversePosition3(ray.position)));
    }
    /**
   * Creates a transform based around an initial matrix.
   * @public
   *
   * @param {Matrix4} matrix
   */ constructor(matrix){
        // @private {Matrix4} - The primary matrix used for the transform
        this.matrix = Matrix4.IDENTITY.copy();
        // @private {Matrix4} - The inverse of the primary matrix, computed lazily
        this.inverse = Matrix4.IDENTITY.copy();
        // @private {Matrix4} - The transpose of the primary matrix, computed lazily
        this.matrixTransposed = Matrix4.IDENTITY.copy();
        // @private {Matrix4} - The inverse of the transposed primary matrix, computed lazily
        this.inverseTransposed = Matrix4.IDENTITY.copy();
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
dot.register('Transform4', Transform4);
export default Transform4;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm00LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvcndhcmQgYW5kIGludmVyc2UgdHJhbnNmb3JtcyB3aXRoIDR4NCBtYXRyaWNlcywgYWxsb3dpbmcgZmxleGliaWxpdHkgaW5jbHVkaW5nIGFmZmluZSBhbmQgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb25zLlxuICpcbiAqIE1ldGhvZHMgc3RhcnRpbmcgd2l0aCAndHJhbnNmb3JtJyB3aWxsIGFwcGx5IHRoZSB0cmFuc2Zvcm0gZnJvbSBvdXJcbiAqIHByaW1hcnkgbWF0cml4LCB3aGlsZSBtZXRob2RzIHN0YXJ0aW5nIHdpdGggJ2ludmVyc2UnIHdpbGwgYXBwbHkgdGhlIHRyYW5zZm9ybSBmcm9tIHRoZSBpbnZlcnNlIG9mIG91ciBtYXRyaXguXG4gKlxuICogR2VuZXJhbGx5LCB0aGlzIG1lYW5zIHRyYW5zZm9ybS5pbnZlcnNlVGhpbmcoIHRyYW5zZm9ybS50cmFuc2Zvcm1UaGluZyggdGhpbmcgKSApLmVxdWFscyggdGhpbmcgKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgTWF0cml4NCBmcm9tICcuL01hdHJpeDQuanMnO1xuaW1wb3J0IFJheTMgZnJvbSAnLi9SYXkzLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmNvbnN0IHNjcmF0Y2hNYXRyaXggPSBuZXcgTWF0cml4NCgpO1xuXG4vKipcbiAqIGNoZWNrIGlmIHRoZSBtYXRyaXggaXMgRmluaXRlIGFuZCBpcyBvZiB0eXBlIE1hdHJpeDRcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWF0cml4XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gY2hlY2tNYXRyaXgoIG1hdHJpeCApIHtcbiAgcmV0dXJuICggbWF0cml4IGluc3RhbmNlb2YgTWF0cml4NCApICYmIG1hdHJpeC5pc0Zpbml0ZSgpO1xufVxuXG5jbGFzcyBUcmFuc2Zvcm00IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0cmFuc2Zvcm0gYmFzZWQgYXJvdW5kIGFuIGluaXRpYWwgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XG4gICAqL1xuICBjb25zdHJ1Y3RvciggbWF0cml4ICkge1xuXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDR9IC0gVGhlIHByaW1hcnkgbWF0cml4IHVzZWQgZm9yIHRoZSB0cmFuc2Zvcm1cbiAgICB0aGlzLm1hdHJpeCA9IE1hdHJpeDQuSURFTlRJVFkuY29weSgpO1xuXG4gICAgLy8gQHByaXZhdGUge01hdHJpeDR9IC0gVGhlIGludmVyc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcbiAgICB0aGlzLmludmVyc2UgPSBNYXRyaXg0LklERU5USVRZLmNvcHkoKTtcblxuICAgIC8vIEBwcml2YXRlIHtNYXRyaXg0fSAtIFRoZSB0cmFuc3Bvc2Ugb2YgdGhlIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcbiAgICB0aGlzLm1hdHJpeFRyYW5zcG9zZWQgPSBNYXRyaXg0LklERU5USVRZLmNvcHkoKTtcblxuICAgIC8vIEBwcml2YXRlIHtNYXRyaXg0fSAtIFRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc3Bvc2VkIHByaW1hcnkgbWF0cml4LCBjb21wdXRlZCBsYXppbHlcbiAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VkID0gTWF0cml4NC5JREVOVElUWS5jb3B5KCk7XG5cblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZXRoZXIgdGhpcy5pbnZlcnNlIGhhcyBiZWVuIGNvbXB1dGVkIGJhc2VkIG9uIHRoZSBsYXRlc3QgcHJpbWFyeSBtYXRyaXhcbiAgICB0aGlzLmludmVyc2VWYWxpZCA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMubWF0cml4VHJhbnNwb3NlZCBoYXMgYmVlbiBjb21wdXRlZCBiYXNlZCBvbiB0aGUgbGF0ZXN0IHByaW1hcnkgbWF0cml4XG4gICAgdGhpcy50cmFuc3Bvc2VWYWxpZCA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQgaGFzIGJlZW4gY29tcHV0ZWQgYmFzZWQgb24gdGhlIGxhdGVzdCBwcmltYXJ5IG1hdHJpeFxuICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcblxuICAgIC8vIEBwdWJsaWMge1RpbnlFbWl0dGVyfVxuICAgIHRoaXMuY2hhbmdlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gICAgaWYgKCBtYXRyaXggKSB7XG4gICAgICB0aGlzLnNldE1hdHJpeCggbWF0cml4ICk7XG4gICAgfVxuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIG11dGF0b3JzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmFsdWUgb2YgdGhlIHByaW1hcnkgbWF0cml4IGRpcmVjdGx5IGZyb20gYSBNYXRyaXg0LiBEb2VzIG5vdCBjaGFuZ2UgdGhlIE1hdHJpeDQgaW5zdGFuY2Ugb2YgdGhpc1xuICAgKiBUcmFuc2Zvcm00LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XG4gICAqL1xuICBzZXRNYXRyaXgoIG1hdHJpeCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGVja01hdHJpeCggbWF0cml4ICksICdNYXRyaXggaGFzIE5hTnMsIG5vbi1maW5pdGUgdmFsdWVzLCBvciBpc25cXCd0IGEgbWF0cml4IScgKTtcblxuICAgIC8vIGNvcHkgdGhlIG1hdHJpeCBvdmVyIHRvIG91ciBtYXRyaXhcbiAgICB0aGlzLm1hdHJpeC5zZXQoIG1hdHJpeCApO1xuXG4gICAgLy8gc2V0IGZsYWdzIGFuZCBub3RpZnlcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgb3VyIGludGVybmFsIG1hdHJpeCBpcyBjaGFuZ2VkLiBJdCBtYXJrcyB0aGUgb3RoZXIgZGVwZW5kZW50IG1hdHJpY2VzIGFzIGludmFsaWQsXG4gICAqIGFuZCBzZW5kcyBvdXQgbm90aWZpY2F0aW9ucyBvZiB0aGUgY2hhbmdlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW52YWxpZGF0ZSgpIHtcbiAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1hdHJpeC5pc0Zpbml0ZSgpICk7XG5cbiAgICAvLyBkZXBlbmRlbnQgbWF0cmljZXMgbm93IGludmFsaWRcbiAgICB0aGlzLmludmVyc2VWYWxpZCA9IGZhbHNlO1xuICAgIHRoaXMudHJhbnNwb3NlVmFsaWQgPSBmYWxzZTtcbiAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5jaGFuZ2VFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGUgcHJpbWFyeSBtYXRyaXggc3VjaCB0aGF0OiB0aGlzLm1hdHJpeCA9IG1hdHJpeCAqIHRoaXMubWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XG4gICAqL1xuICBwcmVwZW5kKCBtYXRyaXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hlY2tNYXRyaXgoIG1hdHJpeCApLCAnTWF0cml4IGhhcyBOYU5zLCBub24tZmluaXRlIHZhbHVlcywgb3IgaXNuXFwndCBhIG1hdHJpeCEnICk7XG5cbiAgICAvLyBJbiB0aGUgYWJzZW5jZSBvZiBhIHByZXBlbmQtbXVsdGlwbHkgZnVuY3Rpb24gaW4gTWF0cml4NCwgY29weSBvdmVyIHRvIGEgc2NyYXRjaCBtYXRyaXggaW5zdGVhZFxuICAgIC8vIFRPRE86IGltcGxlbWVudCBhIHByZXBlbmQtbXVsdGlwbHkgZGlyZWN0bHkgaW4gTWF0cml4NCBmb3IgYSBwZXJmb3JtYW5jZSBpbmNyZWFzZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHNjcmF0Y2hNYXRyaXguc2V0KCB0aGlzLm1hdHJpeCApO1xuICAgIHRoaXMubWF0cml4LnNldCggbWF0cml4ICk7XG4gICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIHNjcmF0Y2hNYXRyaXggKTtcblxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIHByaW1hcnkgbWF0cml4IHN1Y2ggdGhhdDogdGhpcy5tYXRyaXggPSB0aGlzLm1hdHJpeCAqIG1hdHJpeFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XG4gICAqL1xuICBhcHBlbmQoIG1hdHJpeCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGVja01hdHJpeCggbWF0cml4ICksICdNYXRyaXggaGFzIE5hTnMsIG5vbi1maW5pdGUgdmFsdWVzLCBvciBpc25cXCd0IGEgbWF0cml4IScgKTtcblxuICAgIHRoaXMubWF0cml4Lm11bHRpcGx5TWF0cml4KCBtYXRyaXggKTtcblxuICAgIC8vIHNldCBmbGFncyBhbmQgbm90aWZ5XG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBwcmVwZW5kKCksIGJ1dCBwcmVwZW5kcyB0aGUgb3RoZXIgdHJhbnNmb3JtJ3MgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhbnNmb3JtNH0gdHJhbnNmb3JtXG4gICAqL1xuICBwcmVwZW5kVHJhbnNmb3JtKCB0cmFuc2Zvcm0gKSB7XG4gICAgdGhpcy5wcmVwZW5kKCB0cmFuc2Zvcm0ubWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBhcHBlbmQoKSwgYnV0IGFwcGVuZHMgdGhlIG90aGVyIHRyYW5zZm9ybSdzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTR9IHRyYW5zZm9ybVxuICAgKi9cbiAgYXBwZW5kVHJhbnNmb3JtKCB0cmFuc2Zvcm0gKSB7XG4gICAgdGhpcy5hcHBlbmQoIHRyYW5zZm9ybS5tYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0cmFuc2Zvcm0gb2YgYSBDYW52YXMgY29udGV4dCB0byBiZSBlcXVpdmFsZW50IHRvIHRoZSAyRCBhZmZpbmUgcGFydCBvZiB0aGlzIHRyYW5zZm9ybS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dFxuICAgKi9cbiAgYXBwbHlUb0NhbnZhc0NvbnRleHQoIGNvbnRleHQgKSB7XG4gICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oIHRoaXMubWF0cml4Lm0wMCgpLCB0aGlzLm1hdHJpeC5tMTAoKSwgdGhpcy5tYXRyaXgubTAxKCksIHRoaXMubWF0cml4Lm0xMSgpLCB0aGlzLm1hdHJpeC5tMDMoKSwgdGhpcy5tYXRyaXgubTEzKCkgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBnZXR0ZXJzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvcHkgb2YgdGhpcyB0cmFuc2Zvcm0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge1RyYW5zZm9ybTR9XG4gICAqL1xuICBjb3B5KCkge1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm00KCB0aGlzLm1hdHJpeCApO1xuXG4gICAgdHJhbnNmb3JtLmludmVyc2UgPSB0aGlzLmludmVyc2U7XG4gICAgdHJhbnNmb3JtLm1hdHJpeFRyYW5zcG9zZWQgPSB0aGlzLm1hdHJpeFRyYW5zcG9zZWQ7XG4gICAgdHJhbnNmb3JtLmludmVyc2VUcmFuc3Bvc2VkID0gdGhpcy5pbnZlcnNlVHJhbnNwb3NlZDtcblxuICAgIHRyYW5zZm9ybS5pbnZlcnNlVmFsaWQgPSB0aGlzLmludmVyc2VWYWxpZDtcbiAgICB0cmFuc2Zvcm0udHJhbnNwb3NlVmFsaWQgPSB0aGlzLnRyYW5zcG9zZVZhbGlkO1xuICAgIHRyYW5zZm9ybS5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgPSB0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcmltYXJ5IG1hdHJpeCBvZiB0aGlzIHRyYW5zZm9ybS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIGdldE1hdHJpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRyaXg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXggb2YgdGhpcyB0cmFuc2Zvcm0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBnZXRJbnZlcnNlKCkge1xuICAgIGlmICggIXRoaXMuaW52ZXJzZVZhbGlkICkge1xuICAgICAgdGhpcy5pbnZlcnNlVmFsaWQgPSB0cnVlO1xuXG4gICAgICB0aGlzLmludmVyc2Uuc2V0KCB0aGlzLm1hdHJpeCApO1xuICAgICAgdGhpcy5pbnZlcnNlLmludmVydCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnZlcnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgcHJpbWFyeSBtYXRyaXggb2YgdGhpcyB0cmFuc2Zvcm0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBnZXRNYXRyaXhUcmFuc3Bvc2VkKCkge1xuICAgIGlmICggIXRoaXMudHJhbnNwb3NlVmFsaWQgKSB7XG4gICAgICB0aGlzLnRyYW5zcG9zZVZhbGlkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5tYXRyaXhUcmFuc3Bvc2VkLnNldCggdGhpcy5tYXRyaXggKTtcbiAgICAgIHRoaXMubWF0cml4VHJhbnNwb3NlZC50cmFuc3Bvc2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWF0cml4VHJhbnNwb3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSB0cmFuc3Bvc2Ugb2YgbWF0cml4IG9mIHRoaXMgdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxuICAgKi9cbiAgZ2V0SW52ZXJzZVRyYW5zcG9zZWQoKSB7XG4gICAgaWYgKCAhdGhpcy5pbnZlcnNlVHJhbnNwb3NlVmFsaWQgKSB7XG4gICAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VWYWxpZCA9IHRydWU7XG5cbiAgICAgIHRoaXMuaW52ZXJzZVRyYW5zcG9zZWQuc2V0KCB0aGlzLmdldEludmVyc2UoKSApOyAvLyB0cmlnZ2VycyBpbnZlcnNlIHRvIGJlIHZhbGlkXG4gICAgICB0aGlzLmludmVyc2VUcmFuc3Bvc2VkLnRyYW5zcG9zZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnZlcnNlVHJhbnNwb3NlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgb3VyIHByaW1hcnkgbWF0cml4IGlzIGtub3duIHRvIGJlIGFuIGlkZW50aXR5IG1hdHJpeC4gSWYgZmFsc2UgaXMgcmV0dXJuZWQsIGl0IGRvZXNuJ3QgbmVjZXNzYXJpbHlcbiAgICogbWVhbiBvdXIgbWF0cml4IGlzbid0IGFuIGlkZW50aXR5IG1hdHJpeCwganVzdCB0aGF0IGl0IGlzIHVubGlrZWx5IGluIG5vcm1hbCB1c2FnZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0cml4LnR5cGUgPT09IE1hdHJpeDQuVHlwZXMuSURFTlRJVFk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGFueSBjb21wb25lbnRzIG9mIG91ciBwcmltYXJ5IG1hdHJpeCBhcmUgZWl0aGVyIGluZmluaXRlIG9yIE5hTi5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRmluaXRlKCkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC5pc0Zpbml0ZSgpO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIGZvcndhcmQgdHJhbnNmb3JtcyAoZm9yIFZlY3RvcjMgb3Igc2NhbGFyKVxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSAzLWRpbWVuc2lvbmFsIHZlY3RvciBsaWtlIGl0IGlzIGEgcG9pbnQgd2l0aCBhIHBvc2l0aW9uICh0cmFuc2xhdGlvbiBpcyBhcHBsaWVkKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBGb3IgYW4gYWZmaW5lIG1hdHJpeCAkTSQsIHRoZSByZXN1bHQgaXMgdGhlIGhvbW9nZW5lb3VzIG11bHRpcGxpY2F0aW9uICRNXFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIHogXFxcXCAxIFxcZW5ke2JtYXRyaXh9JC5cbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgdHJhbnNmb3JtUG9zaXRpb24zKCB2ICkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC50aW1lc1ZlY3RvcjMoIHYgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgMy1kaW1lbnNpb25hbCB2ZWN0b3IgbGlrZSBwb3NpdGlvbiBpcyBpcnJlbGV2YW50ICh0cmFuc2xhdGlvbiBpcyBub3QgYXBwbGllZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgdHJhbnNmb3JtRGVsdGEzKCB2ICkge1xuICAgIHJldHVybiB0aGlzLm1hdHJpeC50aW1lc1JlbGF0aXZlVmVjdG9yMyggdiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgYSAzLWRpbWVuc2lvbmFsIHZlY3RvciBsaWtlIGl0IGlzIGEgbm9ybWFsIHRvIGEgc3VyZmFjZSAoc28gdGhhdCB0aGUgc3VyZmFjZSBpcyB0cmFuc2Zvcm1lZCwgYW5kIHRoZSBuZXdcbiAgICogbm9ybWFsIHRvIHRoZSBzdXJmYWNlIGF0IHRoZSB0cmFuc2Zvcm1lZCBwb2ludCBpcyByZXR1cm5lZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgdHJhbnNmb3JtTm9ybWFsMyggdiApIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZlcnNlKCkudGltZXNUcmFuc3Bvc2VWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byB0cmFuc2Zvcm1lZCB2ZWN0b3JzLCB3aGljaCBhZGQgdGhlIHgtY29vcmRpbmF0ZSBkaWZmZXJlbmNlIG9mIHRoZSBpbnB1dFxuICAgKiB4IChhbmQgc2FtZSB5LHogdmFsdWVzKSBiZWZvcmVoYW5kLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0cmFuc2Zvcm1EZWx0YVgoIHggKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRGVsdGEzKCBuZXcgVmVjdG9yMyggeCwgMCwgMCApICkueDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBmb3IgdHdvIHRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgeS1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XG4gICAqIHkgKGFuZCBzYW1lIHgseiB2YWx1ZXMpIGJlZm9yZWhhbmQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHRyYW5zZm9ybURlbHRhWSggeSApIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZWx0YTMoIG5ldyBWZWN0b3IzKCAwLCB5LCAwICkgKS55O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHotY29vcmRpbmF0ZSBkaWZmZXJlbmNlIGZvciB0d28gdHJhbnNmb3JtZWQgdmVjdG9ycywgd2hpY2ggYWRkIHRoZSB6LWNvb3JkaW5hdGUgZGlmZmVyZW5jZSBvZiB0aGUgaW5wdXRcbiAgICogeiAoYW5kIHNhbWUgeCx5IHZhbHVlcykgYmVmb3JlaGFuZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gelxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdHJhbnNmb3JtRGVsdGFaKCB6ICkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlbHRhMyggbmV3IFZlY3RvcjMoIDAsIDAsIHogKSApLno7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRyYW5zZm9ybWVkIHJheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1JheTN9IHJheVxuICAgKiBAcmV0dXJucyB7UmF5M31cbiAgICovXG4gIHRyYW5zZm9ybVJheSggcmF5ICkge1xuICAgIHJldHVybiBuZXcgUmF5MyhcbiAgICAgIHRoaXMudHJhbnNmb3JtUG9zaXRpb24zKCByYXkucG9zaXRpb24gKSxcbiAgICAgIHRoaXMudHJhbnNmb3JtUG9zaXRpb24zKCByYXkucG9zaXRpb24ucGx1cyggcmF5LmRpcmVjdGlvbiApICkubWludXMoIHRoaXMudHJhbnNmb3JtUG9zaXRpb24zKCByYXkucG9zaXRpb24gKSApICk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogaW52ZXJzZSB0cmFuc2Zvcm1zIChmb3IgVmVjdG9yMyBvciBzY2FsYXIpXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIGJ5IHRoZSBpbnZlcnNlIG9mIG91ciB0cmFuc2Zvcm0gbGlrZSBpdCBpcyBhIHBvaW50IHdpdGggYSBwb3NpdGlvbiAodHJhbnNsYXRpb24gaXMgYXBwbGllZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogRm9yIGFuIGFmZmluZSBtYXRyaXggJE0kLCB0aGUgcmVzdWx0IGlzIHRoZSBob21vZ2VuZW91cyBtdWx0aXBsaWNhdGlvbiAkTV57LTF9XFxiZWdpbntibWF0cml4fSB4IFxcXFwgeSBcXFxcIHogXFxcXCAxIFxcZW5ke2JtYXRyaXh9JC5cbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1Qb3NpdGlvbjMoKS5cbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgaW52ZXJzZVBvc2l0aW9uMyggdiApIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnZlcnNlKCkudGltZXNWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIGJ5IHRoZSBpbnZlcnNlIG9mIG91ciB0cmFuc2Zvcm0gbGlrZSBwb3NpdGlvbiBpcyBpcnJlbGV2YW50ICh0cmFuc2xhdGlvbiBpcyBub3QgYXBwbGllZCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YTMoKS5cbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2XG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgaW52ZXJzZURlbHRhMyggdiApIHtcbiAgICAvLyBpbnZlcnNlIGFjdHVhbGx5IGhhcyB0aGUgdHJhbnNsYXRpb24gcm9sbGVkIGludG8gdGhlIG90aGVyIGNvZWZmaWNpZW50cywgc28gd2UgaGF2ZSB0byBtYWtlIHRoaXMgbG9uZ2VyXG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZVBvc2l0aW9uMyggdiApLm1pbnVzKCB0aGlzLmludmVyc2VQb3NpdGlvbjMoIFZlY3RvcjMuWkVSTyApICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBhIDMtZGltZW5zaW9uYWwgdmVjdG9yIGJ5IHRoZSBpbnZlcnNlIG9mIG91ciB0cmFuc2Zvcm0gbGlrZSBpdCBpcyBhIG5vcm1hbCB0byBhIGN1cnZlIChzbyB0aGF0IHRoZVxuICAgKiBjdXJ2ZSBpcyB0cmFuc2Zvcm1lZCwgYW5kIHRoZSBuZXcgbm9ybWFsIHRvIHRoZSBjdXJ2ZSBhdCB0aGUgdHJhbnNmb3JtZWQgcG9pbnQgaXMgcmV0dXJuZWQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgaXMgdGhlIGludmVyc2Ugb2YgdHJhbnNmb3JtTm9ybWFsMygpLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XG4gICAqL1xuICBpbnZlcnNlTm9ybWFsMyggdiApIHtcbiAgICByZXR1cm4gdGhpcy5tYXRyaXgudGltZXNUcmFuc3Bvc2VWZWN0b3IzKCB2ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byBpbnZlcnNlLXRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgeC1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XG4gICAqIHggKGFuZCBzYW1lIHkseiB2YWx1ZXMpIGJlZm9yZWhhbmQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVgoKS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGludmVyc2VEZWx0YVgoIHggKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZURlbHRhMyggbmV3IFZlY3RvcjMoIHgsIDAsIDAgKSApLng7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeS1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byBpbnZlcnNlLXRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgeS1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XG4gICAqIHkgKGFuZCBzYW1lIHgseiB2YWx1ZXMpIGJlZm9yZWhhbmQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVkoKS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGludmVyc2VEZWx0YVkoIHkgKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZURlbHRhMyggbmV3IFZlY3RvcjMoIDAsIHksIDAgKSApLnk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgei1jb29yZGluYXRlIGRpZmZlcmVuY2UgZm9yIHR3byBpbnZlcnNlLXRyYW5zZm9ybWVkIHZlY3RvcnMsIHdoaWNoIGFkZCB0aGUgei1jb29yZGluYXRlIGRpZmZlcmVuY2Ugb2YgdGhlIGlucHV0XG4gICAqIHogKGFuZCBzYW1lIHgseSB2YWx1ZXMpIGJlZm9yZWhhbmQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBpcyB0aGUgaW52ZXJzZSBvZiB0cmFuc2Zvcm1EZWx0YVooKS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGludmVyc2VEZWx0YVooIHogKSB7XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZURlbHRhMyggbmV3IFZlY3RvcjMoIDAsIDAsIHogKSApLno7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbnZlcnNlLXRyYW5zZm9ybWVkIHJheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBpbnZlcnNlIG9mIHRyYW5zZm9ybVJheSgpXG4gICAqXG4gICAqIEBwYXJhbSB7UmF5M30gcmF5XG4gICAqIEByZXR1cm5zIHtSYXkzfVxuICAgKi9cbiAgaW52ZXJzZVJheSggcmF5ICkge1xuICAgIHJldHVybiBuZXcgUmF5MyhcbiAgICAgIHRoaXMuaW52ZXJzZVBvc2l0aW9uMyggcmF5LnBvc2l0aW9uICksXG4gICAgICB0aGlzLmludmVyc2VQb3NpdGlvbjMoIHJheS5wb3NpdGlvbi5wbHVzKCByYXkuZGlyZWN0aW9uICkgKS5taW51cyggdGhpcy5pbnZlcnNlUG9zaXRpb24zKCByYXkucG9zaXRpb24gKSApXG4gICAgKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdUcmFuc2Zvcm00JywgVHJhbnNmb3JtNCApO1xuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2Zvcm00OyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImRvdCIsIk1hdHJpeDQiLCJSYXkzIiwiVmVjdG9yMyIsInNjcmF0Y2hNYXRyaXgiLCJjaGVja01hdHJpeCIsIm1hdHJpeCIsImlzRmluaXRlIiwiVHJhbnNmb3JtNCIsInNldE1hdHJpeCIsImFzc2VydCIsInNldCIsImludmFsaWRhdGUiLCJpbnZlcnNlVmFsaWQiLCJ0cmFuc3Bvc2VWYWxpZCIsImludmVyc2VUcmFuc3Bvc2VWYWxpZCIsImNoYW5nZUVtaXR0ZXIiLCJlbWl0IiwicHJlcGVuZCIsIm11bHRpcGx5TWF0cml4IiwiYXBwZW5kIiwicHJlcGVuZFRyYW5zZm9ybSIsInRyYW5zZm9ybSIsImFwcGVuZFRyYW5zZm9ybSIsImFwcGx5VG9DYW52YXNDb250ZXh0IiwiY29udGV4dCIsInNldFRyYW5zZm9ybSIsIm0wMCIsIm0xMCIsIm0wMSIsIm0xMSIsIm0wMyIsIm0xMyIsImNvcHkiLCJpbnZlcnNlIiwibWF0cml4VHJhbnNwb3NlZCIsImludmVyc2VUcmFuc3Bvc2VkIiwiZ2V0TWF0cml4IiwiZ2V0SW52ZXJzZSIsImludmVydCIsImdldE1hdHJpeFRyYW5zcG9zZWQiLCJ0cmFuc3Bvc2UiLCJnZXRJbnZlcnNlVHJhbnNwb3NlZCIsImlzSWRlbnRpdHkiLCJ0eXBlIiwiVHlwZXMiLCJJREVOVElUWSIsInRyYW5zZm9ybVBvc2l0aW9uMyIsInYiLCJ0aW1lc1ZlY3RvcjMiLCJ0cmFuc2Zvcm1EZWx0YTMiLCJ0aW1lc1JlbGF0aXZlVmVjdG9yMyIsInRyYW5zZm9ybU5vcm1hbDMiLCJ0aW1lc1RyYW5zcG9zZVZlY3RvcjMiLCJ0cmFuc2Zvcm1EZWx0YVgiLCJ4IiwidHJhbnNmb3JtRGVsdGFZIiwieSIsInRyYW5zZm9ybURlbHRhWiIsInoiLCJ0cmFuc2Zvcm1SYXkiLCJyYXkiLCJwb3NpdGlvbiIsInBsdXMiLCJkaXJlY3Rpb24iLCJtaW51cyIsImludmVyc2VQb3NpdGlvbjMiLCJpbnZlcnNlRGVsdGEzIiwiWkVSTyIsImludmVyc2VOb3JtYWwzIiwiaW52ZXJzZURlbHRhWCIsImludmVyc2VEZWx0YVkiLCJpbnZlcnNlRGVsdGFaIiwiaW52ZXJzZVJheSIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7O0NBU0MsR0FFRCxPQUFPQSxpQkFBaUIsK0JBQStCO0FBQ3ZELE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxhQUFhLGVBQWU7QUFDbkMsT0FBT0MsVUFBVSxZQUFZO0FBQzdCLE9BQU9DLGFBQWEsZUFBZTtBQUVuQyxNQUFNQyxnQkFBZ0IsSUFBSUg7QUFFMUI7Ozs7O0NBS0MsR0FDRCxTQUFTSSxZQUFhQyxNQUFNO0lBQzFCLE9BQU8sQUFBRUEsa0JBQWtCTCxXQUFhSyxPQUFPQyxRQUFRO0FBQ3pEO0FBRUEsSUFBQSxBQUFNQyxhQUFOLE1BQU1BO0lBdUNKOzsrRUFFNkUsR0FFN0U7Ozs7OztHQU1DLEdBQ0RDLFVBQVdILE1BQU0sRUFBRztRQUNsQkksVUFBVUEsT0FBUUwsWUFBYUMsU0FBVTtRQUV6QyxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDQSxNQUFNLENBQUNLLEdBQUcsQ0FBRUw7UUFFakIsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQ00sVUFBVTtJQUNqQjtJQUVBOzs7O0dBSUMsR0FDREEs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