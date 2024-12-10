// Copyright 2013-2024, University of Colorado Boulder
/**
 * 4-dimensional Matrix
 *
 * TODO: consider adding affine flag if it will help performance (a la Matrix3) https://github.com/phetsims/dot/issues/96
 * TODO: get rotation angles
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /* eslint-disable phet/bad-sim-text */ import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import dot from './dot.js';
import Vector3 from './Vector3.js';
import Vector4 from './Vector4.js';
const Float32Array = window.Float32Array || Array;
let Matrix4 = class Matrix4 {
    /**
   * Sets all entries of the matrix in row-major order.
   * @public
   *
   * @param {number} v00
   * @param {number} v01
   * @param {number} v02
   * @param {number} v03
   * @param {number} v10
   * @param {number} v11
   * @param {number} v12
   * @param {number} v13
   * @param {number} v20
   * @param {number} v21
   * @param {number} v22
   * @param {number} v23
   * @param {number} v30
   * @param {number} v31
   * @param {number} v32
   * @param {number} v33
   * @param {Matrix4.Types|undefined} [type]
   * @returns {Matrix4} - Self reference
   */ rowMajor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type) {
        this.entries[0] = v00;
        this.entries[1] = v10;
        this.entries[2] = v20;
        this.entries[3] = v30;
        this.entries[4] = v01;
        this.entries[5] = v11;
        this.entries[6] = v21;
        this.entries[7] = v31;
        this.entries[8] = v02;
        this.entries[9] = v12;
        this.entries[10] = v22;
        this.entries[11] = v32;
        this.entries[12] = v03;
        this.entries[13] = v13;
        this.entries[14] = v23;
        this.entries[15] = v33;
        // TODO: consider performance of the affine check here https://github.com/phetsims/dot/issues/96
        this.type = type === undefined ? v30 === 0 && v31 === 0 && v32 === 0 && v33 === 1 ? Types.AFFINE : Types.OTHER : type;
        return this;
    }
    /**
   * Sets all entries of the matrix in column-major order.
   * @public
   *
   * @param {*} v00
   * @param {*} v10
   * @param {*} v20
   * @param {*} v30
   * @param {*} v01
   * @param {*} v11
   * @param {*} v21
   * @param {*} v31
   * @param {*} v02
   * @param {*} v12
   * @param {*} v22
   * @param {*} v32
   * @param {*} v03
   * @param {*} v13
   * @param {*} v23
   * @param {*} v33
   * @param {Matrix4.Types|undefined} [type]
   * @returns {Matrix4} - Self reference
   */ columnMajor(v00, v10, v20, v30, v01, v11, v21, v31, v02, v12, v22, v32, v03, v13, v23, v33, type) {
        return this.rowMajor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type);
    }
    /**
   * Sets this matrix to the value of the passed-in matrix.
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4} - Self reference
   */ set(matrix) {
        return this.rowMajor(matrix.m00(), matrix.m01(), matrix.m02(), matrix.m03(), matrix.m10(), matrix.m11(), matrix.m12(), matrix.m13(), matrix.m20(), matrix.m21(), matrix.m22(), matrix.m23(), matrix.m30(), matrix.m31(), matrix.m32(), matrix.m33(), matrix.type);
    }
    /**
   * Returns the 0,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m00() {
        return this.entries[0];
    }
    /**
   * Returns the 0,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m01() {
        return this.entries[4];
    }
    /**
   * Returns the 0,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m02() {
        return this.entries[8];
    }
    /**
   * Returns the 0,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m03() {
        return this.entries[12];
    }
    /**
   * Returns the 1,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m10() {
        return this.entries[1];
    }
    /**
   * Returns the 1,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m11() {
        return this.entries[5];
    }
    /**
   * Returns the 1,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m12() {
        return this.entries[9];
    }
    /**
   * Returns the 1,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m13() {
        return this.entries[13];
    }
    /**
   * Returns the 2,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m20() {
        return this.entries[2];
    }
    /**
   * Returns the 2,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m21() {
        return this.entries[6];
    }
    /**
   * Returns the 2,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m22() {
        return this.entries[10];
    }
    /**
   * Returns the 2,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m23() {
        return this.entries[14];
    }
    /**
   * Returns the 3,0 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m30() {
        return this.entries[3];
    }
    /**
   * Returns the 3,1 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m31() {
        return this.entries[7];
    }
    /**
   * Returns the 3,2 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m32() {
        return this.entries[11];
    }
    /**
   * Returns the 3,3 entry of this matrix.
   * @public
   *
   * @returns {number}
   */ m33() {
        return this.entries[15];
    }
    /**
   * Returns whether this matrix is an identity matrix.
   * @public
   *
   * @returns {boolean}
   */ isIdentity() {
        return this.type === Types.IDENTITY || this.equals(Matrix4.IDENTITY);
    }
    /**
   * Returns whether all of this matrix's entries are finite (non-infinite and non-NaN).
   * @public
   *
   * @returns {boolean}
   */ isFinite() {
        return isFinite(this.m00()) && isFinite(this.m01()) && isFinite(this.m02()) && isFinite(this.m03()) && isFinite(this.m10()) && isFinite(this.m11()) && isFinite(this.m12()) && isFinite(this.m13()) && isFinite(this.m20()) && isFinite(this.m21()) && isFinite(this.m22()) && isFinite(this.m23()) && isFinite(this.m30()) && isFinite(this.m31()) && isFinite(this.m32()) && isFinite(this.m33());
    }
    /**
   * Returns the 3D translation, assuming multiplication with a homogeneous vector.
   * @public
   *
   * @returns {Vector3}
   */ getTranslation() {
        return new Vector3(this.m03(), this.m13(), this.m23());
    }
    get translation() {
        return this.getTranslation();
    }
    /**
   * Returns a vector that is equivalent to ( T(1,0,0).magnitude, T(0,1,0).magnitude, T(0,0,1).magnitude )
   * where T is a relative transform.
   * @public
   *
   * @returns {Vector3}
   */ getScaleVector() {
        const m0003 = this.m00() + this.m03();
        const m1013 = this.m10() + this.m13();
        const m2023 = this.m20() + this.m23();
        const m3033 = this.m30() + this.m33();
        const m0103 = this.m01() + this.m03();
        const m1113 = this.m11() + this.m13();
        const m2123 = this.m21() + this.m23();
        const m3133 = this.m31() + this.m33();
        const m0203 = this.m02() + this.m03();
        const m1213 = this.m12() + this.m13();
        const m2223 = this.m22() + this.m23();
        const m3233 = this.m32() + this.m33();
        return new Vector3(Math.sqrt(m0003 * m0003 + m1013 * m1013 + m2023 * m2023 + m3033 * m3033), Math.sqrt(m0103 * m0103 + m1113 * m1113 + m2123 * m2123 + m3133 * m3133), Math.sqrt(m0203 * m0203 + m1213 * m1213 + m2223 * m2223 + m3233 * m3233));
    }
    get scaleVector() {
        return this.getScaleVector();
    }
    /**
   * Returns the CSS transform string for the associated homogeneous 3d transformation.
   * @public
   *
   * @returns {string}
   */ getCSSTransform() {
        // See http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility
        // the inner part of a CSS3 transform, but remember to add the browser-specific parts!
        // NOTE: the toFixed calls are inlined for performance reasons
        return `matrix3d(${this.entries[0].toFixed(20)},${this.entries[1].toFixed(20)},${this.entries[2].toFixed(20)},${this.entries[3].toFixed(20)},${this.entries[4].toFixed(20)},${this.entries[5].toFixed(20)},${this.entries[6].toFixed(20)},${this.entries[7].toFixed(20)},${this.entries[8].toFixed(20)},${this.entries[9].toFixed(20)},${this.entries[10].toFixed(20)},${this.entries[11].toFixed(20)},${this.entries[12].toFixed(20)},${this.entries[13].toFixed(20)},${this.entries[14].toFixed(20)},${this.entries[15].toFixed(20)})`;
    }
    get cssTransform() {
        return this.getCSSTransform();
    }
    /**
   * Returns exact equality with another matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {boolean}
   */ equals(matrix) {
        return this.m00() === matrix.m00() && this.m01() === matrix.m01() && this.m02() === matrix.m02() && this.m03() === matrix.m03() && this.m10() === matrix.m10() && this.m11() === matrix.m11() && this.m12() === matrix.m12() && this.m13() === matrix.m13() && this.m20() === matrix.m20() && this.m21() === matrix.m21() && this.m22() === matrix.m22() && this.m23() === matrix.m23() && this.m30() === matrix.m30() && this.m31() === matrix.m31() && this.m32() === matrix.m32() && this.m33() === matrix.m33();
    }
    /**
   * Returns equality within a margin of error with another matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @param {number} epsilon
   * @returns {boolean}
   */ equalsEpsilon(matrix, epsilon) {
        return Math.abs(this.m00() - matrix.m00()) < epsilon && Math.abs(this.m01() - matrix.m01()) < epsilon && Math.abs(this.m02() - matrix.m02()) < epsilon && Math.abs(this.m03() - matrix.m03()) < epsilon && Math.abs(this.m10() - matrix.m10()) < epsilon && Math.abs(this.m11() - matrix.m11()) < epsilon && Math.abs(this.m12() - matrix.m12()) < epsilon && Math.abs(this.m13() - matrix.m13()) < epsilon && Math.abs(this.m20() - matrix.m20()) < epsilon && Math.abs(this.m21() - matrix.m21()) < epsilon && Math.abs(this.m22() - matrix.m22()) < epsilon && Math.abs(this.m23() - matrix.m23()) < epsilon && Math.abs(this.m30() - matrix.m30()) < epsilon && Math.abs(this.m31() - matrix.m31()) < epsilon && Math.abs(this.m32() - matrix.m32()) < epsilon && Math.abs(this.m33() - matrix.m33()) < epsilon;
    }
    /*---------------------------------------------------------------------------*
   * Immutable operations (returning a new matrix)
   *----------------------------------------------------------------------------*/ /**
   * Returns a copy of this matrix
   * @public
   *
   * @returns {Matrix4}
   */ copy() {
        return new Matrix4(this.m00(), this.m01(), this.m02(), this.m03(), this.m10(), this.m11(), this.m12(), this.m13(), this.m20(), this.m21(), this.m22(), this.m23(), this.m30(), this.m31(), this.m32(), this.m33(), this.type);
    }
    /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4}
   */ plus(matrix) {
        return new Matrix4(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m03() + matrix.m03(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m13() + matrix.m13(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22(), this.m23() + matrix.m23(), this.m30() + matrix.m30(), this.m31() + matrix.m31(), this.m32() + matrix.m32(), this.m33() + matrix.m33());
    }
    /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4}
   */ minus(matrix) {
        return new Matrix4(this.m00() - matrix.m00(), this.m01() - matrix.m01(), this.m02() - matrix.m02(), this.m03() - matrix.m03(), this.m10() - matrix.m10(), this.m11() - matrix.m11(), this.m12() - matrix.m12(), this.m13() - matrix.m13(), this.m20() - matrix.m20(), this.m21() - matrix.m21(), this.m22() - matrix.m22(), this.m23() - matrix.m23(), this.m30() - matrix.m30(), this.m31() - matrix.m31(), this.m32() - matrix.m32(), this.m33() - matrix.m33());
    }
    /**
   * Returns a transposed copy of this matrix
   * @public
   *
   * @returns {Matrix4}
   */ transposed() {
        return new Matrix4(this.m00(), this.m10(), this.m20(), this.m30(), this.m01(), this.m11(), this.m21(), this.m31(), this.m02(), this.m12(), this.m22(), this.m32(), this.m03(), this.m13(), this.m23(), this.m33());
    }
    /**
   * Returns a negated copy of this matrix
   * @public
   *
   * @returns {Matrix3}
   */ negated() {
        return new Matrix4(-this.m00(), -this.m01(), -this.m02(), -this.m03(), -this.m10(), -this.m11(), -this.m12(), -this.m13(), -this.m20(), -this.m21(), -this.m22(), -this.m23(), -this.m30(), -this.m31(), -this.m32(), -this.m33());
    }
    /**
   * Returns an inverted copy of this matrix
   * @public
   *
   * @returns {Matrix3}
   */ inverted() {
        let det;
        switch(this.type){
            case Types.IDENTITY:
                return this;
            case Types.TRANSLATION_3D:
                return new Matrix4(1, 0, 0, -this.m03(), 0, 1, 0, -this.m13(), 0, 0, 1, -this.m23(), 0, 0, 0, 1, Types.TRANSLATION_3D);
            case Types.SCALING:
                return new Matrix4(1 / this.m00(), 0, 0, 0, 0, 1 / this.m11(), 0, 0, 0, 0, 1 / this.m22(), 0, 0, 0, 0, 1 / this.m33(), Types.SCALING);
            case Types.AFFINE:
            case Types.OTHER:
                det = this.getDeterminant();
                if (det !== 0) {
                    return new Matrix4((-this.m31() * this.m22() * this.m13() + this.m21() * this.m32() * this.m13() + this.m31() * this.m12() * this.m23() - this.m11() * this.m32() * this.m23() - this.m21() * this.m12() * this.m33() + this.m11() * this.m22() * this.m33()) / det, (this.m31() * this.m22() * this.m03() - this.m21() * this.m32() * this.m03() - this.m31() * this.m02() * this.m23() + this.m01() * this.m32() * this.m23() + this.m21() * this.m02() * this.m33() - this.m01() * this.m22() * this.m33()) / det, (-this.m31() * this.m12() * this.m03() + this.m11() * this.m32() * this.m03() + this.m31() * this.m02() * this.m13() - this.m01() * this.m32() * this.m13() - this.m11() * this.m02() * this.m33() + this.m01() * this.m12() * this.m33()) / det, (this.m21() * this.m12() * this.m03() - this.m11() * this.m22() * this.m03() - this.m21() * this.m02() * this.m13() + this.m01() * this.m22() * this.m13() + this.m11() * this.m02() * this.m23() - this.m01() * this.m12() * this.m23()) / det, (this.m30() * this.m22() * this.m13() - this.m20() * this.m32() * this.m13() - this.m30() * this.m12() * this.m23() + this.m10() * this.m32() * this.m23() + this.m20() * this.m12() * this.m33() - this.m10() * this.m22() * this.m33()) / det, (-this.m30() * this.m22() * this.m03() + this.m20() * this.m32() * this.m03() + this.m30() * this.m02() * this.m23() - this.m00() * this.m32() * this.m23() - this.m20() * this.m02() * this.m33() + this.m00() * this.m22() * this.m33()) / det, (this.m30() * this.m12() * this.m03() - this.m10() * this.m32() * this.m03() - this.m30() * this.m02() * this.m13() + this.m00() * this.m32() * this.m13() + this.m10() * this.m02() * this.m33() - this.m00() * this.m12() * this.m33()) / det, (-this.m20() * this.m12() * this.m03() + this.m10() * this.m22() * this.m03() + this.m20() * this.m02() * this.m13() - this.m00() * this.m22() * this.m13() - this.m10() * this.m02() * this.m23() + this.m00() * this.m12() * this.m23()) / det, (-this.m30() * this.m21() * this.m13() + this.m20() * this.m31() * this.m13() + this.m30() * this.m11() * this.m23() - this.m10() * this.m31() * this.m23() - this.m20() * this.m11() * this.m33() + this.m10() * this.m21() * this.m33()) / det, (this.m30() * this.m21() * this.m03() - this.m20() * this.m31() * this.m03() - this.m30() * this.m01() * this.m23() + this.m00() * this.m31() * this.m23() + this.m20() * this.m01() * this.m33() - this.m00() * this.m21() * this.m33()) / det, (-this.m30() * this.m11() * this.m03() + this.m10() * this.m31() * this.m03() + this.m30() * this.m01() * this.m13() - this.m00() * this.m31() * this.m13() - this.m10() * this.m01() * this.m33() + this.m00() * this.m11() * this.m33()) / det, (this.m20() * this.m11() * this.m03() - this.m10() * this.m21() * this.m03() - this.m20() * this.m01() * this.m13() + this.m00() * this.m21() * this.m13() + this.m10() * this.m01() * this.m23() - this.m00() * this.m11() * this.m23()) / det, (this.m30() * this.m21() * this.m12() - this.m20() * this.m31() * this.m12() - this.m30() * this.m11() * this.m22() + this.m10() * this.m31() * this.m22() + this.m20() * this.m11() * this.m32() - this.m10() * this.m21() * this.m32()) / det, (-this.m30() * this.m21() * this.m02() + this.m20() * this.m31() * this.m02() + this.m30() * this.m01() * this.m22() - this.m00() * this.m31() * this.m22() - this.m20() * this.m01() * this.m32() + this.m00() * this.m21() * this.m32()) / det, (this.m30() * this.m11() * this.m02() - this.m10() * this.m31() * this.m02() - this.m30() * this.m01() * this.m12() + this.m00() * this.m31() * this.m12() + this.m10() * this.m01() * this.m32() - this.m00() * this.m11() * this.m32()) / det, (-this.m20() * this.m11() * this.m02() + this.m10() * this.m21() * this.m02() + this.m20() * this.m01() * this.m12() - this.m00() * this.m21() * this.m12() - this.m10() * this.m01() * this.m22() + this.m00() * this.m11() * this.m22()) / det);
                } else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            default:
                throw new Error(`Matrix4.inverted with unknown type: ${this.type}`);
        }
    }
    /**
   * Returns a matrix, defined by the multiplication of this * matrix.
   * @public
   *
   * @param {Matrix4} matrix
   * @returns {Matrix4} - NOTE: this may be the same matrix!
   */ timesMatrix(matrix) {
        // I * M === M * I === I (the identity)
        if (this.type === Types.IDENTITY || matrix.type === Types.IDENTITY) {
            return this.type === Types.IDENTITY ? matrix : this;
        }
        if (this.type === matrix.type) {
            // currently two matrices of the same type will result in the same result type
            if (this.type === Types.TRANSLATION_3D) {
                // faster combination of translations
                return new Matrix4(1, 0, 0, this.m03() + matrix.m02(), 0, 1, 0, this.m13() + matrix.m12(), 0, 0, 1, this.m23() + matrix.m23(), 0, 0, 0, 1, Types.TRANSLATION_3D);
            } else if (this.type === Types.SCALING) {
                // faster combination of scaling
                return new Matrix4(this.m00() * matrix.m00(), 0, 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 0, this.m22() * matrix.m22(), 0, 0, 0, 0, 1, Types.SCALING);
            }
        }
        if (this.type !== Types.OTHER && matrix.type !== Types.OTHER) {
            // currently two matrices that are anything but "other" are technically affine, and the result will be affine
            // affine case
            return new Matrix4(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m00() * matrix.m03() + this.m01() * matrix.m13() + this.m02() * matrix.m23() + this.m03(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m10() * matrix.m03() + this.m11() * matrix.m13() + this.m12() * matrix.m23() + this.m13(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22(), this.m20() * matrix.m03() + this.m21() * matrix.m13() + this.m22() * matrix.m23() + this.m23(), 0, 0, 0, 1, Types.AFFINE);
        }
        // general case
        return new Matrix4(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20() + this.m03() * matrix.m30(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21() + this.m03() * matrix.m31(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22() + this.m03() * matrix.m32(), this.m00() * matrix.m03() + this.m01() * matrix.m13() + this.m02() * matrix.m23() + this.m03() * matrix.m33(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20() + this.m13() * matrix.m30(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21() + this.m13() * matrix.m31(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22() + this.m13() * matrix.m32(), this.m10() * matrix.m03() + this.m11() * matrix.m13() + this.m12() * matrix.m23() + this.m13() * matrix.m33(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20() + this.m23() * matrix.m30(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21() + this.m23() * matrix.m31(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22() + this.m23() * matrix.m32(), this.m20() * matrix.m03() + this.m21() * matrix.m13() + this.m22() * matrix.m23() + this.m23() * matrix.m33(), this.m30() * matrix.m00() + this.m31() * matrix.m10() + this.m32() * matrix.m20() + this.m33() * matrix.m30(), this.m30() * matrix.m01() + this.m31() * matrix.m11() + this.m32() * matrix.m21() + this.m33() * matrix.m31(), this.m30() * matrix.m02() + this.m31() * matrix.m12() + this.m32() * matrix.m22() + this.m33() * matrix.m32(), this.m30() * matrix.m03() + this.m31() * matrix.m13() + this.m32() * matrix.m23() + this.m33() * matrix.m33());
    }
    /**
   * Returns the multiplication of this matrix times the provided vector
   * @public
   *
   * @param {Vector4} vector4
   * @returns {Vector4}
   */ timesVector4(vector4) {
        const x = this.m00() * vector4.x + this.m01() * vector4.y + this.m02() * vector4.z + this.m03() * vector4.w;
        const y = this.m10() * vector4.x + this.m11() * vector4.y + this.m12() * vector4.z + this.m13() * vector4.w;
        const z = this.m20() * vector4.x + this.m21() * vector4.y + this.m22() * vector4.z + this.m23() * vector4.w;
        const w = this.m30() * vector4.x + this.m31() * vector4.y + this.m32() * vector4.z + this.m33() * vector4.w;
        return new Vector4(x, y, z, w);
    }
    /**
   * Returns the multiplication of this matrix times the provided vector (treating this matrix as homogeneous, so that
   * it is the technical multiplication of (x,y,z,1)).
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */ timesVector3(vector3) {
        return this.timesVector4(vector3.toVector4()).toVector3();
    }
    /**
   * Returns the multiplication of this matrix's transpose times the provided vector
   * @public
   *
   * @param {Vector4} vector4
   * @returns {Vector4}
   */ timesTransposeVector4(vector4) {
        const x = this.m00() * vector4.x + this.m10() * vector4.y + this.m20() * vector4.z + this.m30() * vector4.w;
        const y = this.m01() * vector4.x + this.m11() * vector4.y + this.m21() * vector4.z + this.m31() * vector4.w;
        const z = this.m02() * vector4.x + this.m12() * vector4.y + this.m22() * vector4.z + this.m32() * vector4.w;
        const w = this.m03() * vector4.x + this.m13() * vector4.y + this.m23() * vector4.z + this.m33() * vector4.w;
        return new Vector4(x, y, z, w);
    }
    /**
   * Returns the multiplication of this matrix's transpose times the provided vector (homogeneous).
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */ timesTransposeVector3(vector3) {
        return this.timesTransposeVector4(vector3.toVector4()).toVector3();
    }
    /**
   * Equivalent to the multiplication of (x,y,z,0), ignoring the homogeneous part.
   * @public
   *
   * @param {Vector3} vector3
   * @returns {Vector3}
   */ timesRelativeVector3(vector3) {
        const x = this.m00() * vector3.x + this.m10() * vector3.y + this.m20() * vector3.z;
        const y = this.m01() * vector3.y + this.m11() * vector3.y + this.m21() * vector3.z;
        const z = this.m02() * vector3.z + this.m12() * vector3.y + this.m22() * vector3.z;
        return new Vector3(x, y, z);
    }
    /**
   * Returns the determinant of this matrix.
   * @public
   *
   * @returns {number}
   */ getDeterminant() {
        return this.m03() * this.m12() * this.m21() * this.m30() - this.m02() * this.m13() * this.m21() * this.m30() - this.m03() * this.m11() * this.m22() * this.m30() + this.m01() * this.m13() * this.m22() * this.m30() + this.m02() * this.m11() * this.m23() * this.m30() - this.m01() * this.m12() * this.m23() * this.m30() - this.m03() * this.m12() * this.m20() * this.m31() + this.m02() * this.m13() * this.m20() * this.m31() + this.m03() * this.m10() * this.m22() * this.m31() - this.m00() * this.m13() * this.m22() * this.m31() - this.m02() * this.m10() * this.m23() * this.m31() + this.m00() * this.m12() * this.m23() * this.m31() + this.m03() * this.m11() * this.m20() * this.m32() - this.m01() * this.m13() * this.m20() * this.m32() - this.m03() * this.m10() * this.m21() * this.m32() + this.m00() * this.m13() * this.m21() * this.m32() + this.m01() * this.m10() * this.m23() * this.m32() - this.m00() * this.m11() * this.m23() * this.m32() - this.m02() * this.m11() * this.m20() * this.m33() + this.m01() * this.m12() * this.m20() * this.m33() + this.m02() * this.m10() * this.m21() * this.m33() - this.m00() * this.m12() * this.m21() * this.m33() - this.m01() * this.m10() * this.m22() * this.m33() + this.m00() * this.m11() * this.m22() * this.m33();
    }
    get determinant() {
        return this.getDeterminant();
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `${this.m00()} ${this.m01()} ${this.m02()} ${this.m03()}\n${this.m10()} ${this.m11()} ${this.m12()} ${this.m13()}\n${this.m20()} ${this.m21()} ${this.m22()} ${this.m23()}\n${this.m30()} ${this.m31()} ${this.m32()} ${this.m33()}`;
    }
    /**
   * Makes this matrix effectively immutable to the normal methods (except direct setters?)
   * @public
   *
   * @returns {Matrix3} - Self reference
   */ makeImmutable() {
        if (assert) {
            this.rowMajor = ()=>{
                throw new Error('Cannot modify immutable matrix');
            };
        }
        return this;
    }
    /**
   * Copies the entries of this matrix over to an arbitrary array (typed or normal).
   * @public
   *
   * @param {Array|Float32Array|Float64Array} array
   * @returns {Array|Float32Array|Float64Array} - Returned for chaining
   */ copyToArray(array) {
        array[0] = this.m00();
        array[1] = this.m10();
        array[2] = this.m20();
        array[3] = this.m30();
        array[4] = this.m01();
        array[5] = this.m11();
        array[6] = this.m21();
        array[7] = this.m31();
        array[8] = this.m02();
        array[9] = this.m12();
        array[10] = this.m22();
        array[11] = this.m32();
        array[12] = this.m03();
        array[13] = this.m13();
        array[14] = this.m23();
        array[15] = this.m33();
        return array;
    }
    /**
   * Returns an identity matrix.
   * @public
   *
   * @returns {Matrix4}
   */ static identity() {
        return new Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, Types.IDENTITY);
    }
    /**
   * Returns a translation matrix.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Matrix4}
   */ static translation(x, y, z) {
        return new Matrix4(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1, Types.TRANSLATION_3D);
    }
    /**
   * Returns a translation matrix computed from a vector.
   * @public
   *
   * @param {Vector3|Vector4} vector
   * @returns {Matrix4}
   */ static translationFromVector(vector) {
        return Matrix4.translation(vector.x, vector.y, vector.z);
    }
    /**
   * Returns a matrix that scales things in each dimension.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Matrix4}
   */ static scaling(x, y, z) {
        // allow using one parameter to scale everything
        y = y === undefined ? x : y;
        z = z === undefined ? x : z;
        return new Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1, Types.SCALING);
    }
    /**
   * Returns a homogeneous matrix rotation defined by a rotation of the specified angle around the given unit axis.
   * @public
   *
   * @param {Vector3} axis - normalized
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */ static rotationAxisAngle(axis, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const C = 1 - c;
        return new Matrix4(axis.x * axis.x * C + c, axis.x * axis.y * C - axis.z * s, axis.x * axis.z * C + axis.y * s, 0, axis.y * axis.x * C + axis.z * s, axis.y * axis.y * C + c, axis.y * axis.z * C - axis.x * s, 0, axis.z * axis.x * C - axis.y * s, axis.z * axis.y * C + axis.x * s, axis.z * axis.z * C + c, 0, 0, 0, 0, 1, Types.AFFINE);
    }
    // TODO: add in rotation from quaternion, and from quat + translation https://github.com/phetsims/dot/issues/96
    /**
   * Returns a rotation matrix in the yz plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */ static rotationX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, Types.AFFINE);
    }
    /**
   * Returns a rotation matrix in the xz plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */ static rotationY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1, Types.AFFINE);
    }
    /**
   * Returns a rotation matrix in the xy plane.
   * @public
   *
   * @param {number} angle - in radians
   * @returns {Matrix4}
   */ static rotationZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix4(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, Types.AFFINE);
    }
    /**
   * Returns the specific perspective matrix needed for certain WebGL contexts.
   * @public
   *
   * @param {number} fovYRadians
   * @param {number} aspect - aspect === width / height
   * @param {number} zNear
   * @param {number} zFar
   * @returns {Matrix4}
   */ static gluPerspective(fovYRadians, aspect, zNear, zFar) {
        const cotangent = Math.cos(fovYRadians) / Math.sin(fovYRadians);
        return new Matrix4(cotangent / aspect, 0, 0, 0, 0, cotangent, 0, 0, 0, 0, (zFar + zNear) / (zNear - zFar), 2 * zFar * zNear / (zNear - zFar), 0, 0, -1, 0);
    }
    /**
   * @param {number} [v00]
   * @param {number} [v01]
   * @param {number} [v02]
   * @param {number} [v03]
   * @param {number} [v10]
   * @param {number} [v11]
   * @param {number} [v12]
   * @param {number} [v13]
   * @param {number} [v20]
   * @param {number} [v21]
   * @param {number} [v22]
   * @param {number} [v23]
   * @param {number} [v30]
   * @param {number} [v31]
   * @param {number} [v32]
   * @param {number} [v33]
   * @param {Matrix4.Types|undefined} [type]
   */ constructor(v00, v01, v02, v03, v10, v11, v12, v13, v20, v21, v22, v23, v30, v31, v32, v33, type){
        // @public {Float32Array} - entries stored in column-major format
        this.entries = new Float32Array(16);
        // @public {Matrix4.Types}
        this.type = Types.OTHER; // will be set by rowMajor
        this.rowMajor(v00 !== undefined ? v00 : 1, v01 !== undefined ? v01 : 0, v02 !== undefined ? v02 : 0, v03 !== undefined ? v03 : 0, v10 !== undefined ? v10 : 0, v11 !== undefined ? v11 : 1, v12 !== undefined ? v12 : 0, v13 !== undefined ? v13 : 0, v20 !== undefined ? v20 : 0, v21 !== undefined ? v21 : 0, v22 !== undefined ? v22 : 1, v23 !== undefined ? v23 : 0, v30 !== undefined ? v30 : 0, v31 !== undefined ? v31 : 0, v32 !== undefined ? v32 : 0, v33 !== undefined ? v33 : 1, type);
    }
};
dot.register('Matrix4', Matrix4);
let Types = class Types extends EnumerationValue {
};
Types.OTHER = new Types();
Types.IDENTITY = new Types();
Types.TRANSLATION_3D = new Types();
Types.SCALING = new Types();
Types.AFFINE = new Types();
Types.enumeration = new Enumeration(Types);
// @public {Enumeration}
Matrix4.Types = Types;
// @public {Matrix4}
Matrix4.IDENTITY = new Matrix4().makeImmutable();
export default Matrix4;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXg0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIDQtZGltZW5zaW9uYWwgTWF0cml4XG4gKlxuICogVE9ETzogY29uc2lkZXIgYWRkaW5nIGFmZmluZSBmbGFnIGlmIGl0IHdpbGwgaGVscCBwZXJmb3JtYW5jZSAoYSBsYSBNYXRyaXgzKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICogVE9ETzogZ2V0IHJvdGF0aW9uIGFuZ2xlc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBwaGV0L2JhZC1zaW0tdGV4dCAqL1xuXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi9WZWN0b3IzLmpzJztcbmltcG9ydCBWZWN0b3I0IGZyb20gJy4vVmVjdG9yNC5qcyc7XG5cbmNvbnN0IEZsb2F0MzJBcnJheSA9IHdpbmRvdy5GbG9hdDMyQXJyYXkgfHwgQXJyYXk7XG5cbmNsYXNzIE1hdHJpeDQge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDBdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdjAxXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3YwMl1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MDNdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdjEwXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3YxMV1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MTJdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdjEzXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3YyMF1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MjFdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdjIyXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3YyM11cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzBdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbdjMxXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3YzMl1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt2MzNdXG4gICAqIEBwYXJhbSB7TWF0cml4NC5UeXBlc3x1bmRlZmluZWR9IFt0eXBlXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHYwMCwgdjAxLCB2MDIsIHYwMywgdjEwLCB2MTEsIHYxMiwgdjEzLCB2MjAsIHYyMSwgdjIyLCB2MjMsIHYzMCwgdjMxLCB2MzIsIHYzMywgdHlwZSApIHtcblxuICAgIC8vIEBwdWJsaWMge0Zsb2F0MzJBcnJheX0gLSBlbnRyaWVzIHN0b3JlZCBpbiBjb2x1bW4tbWFqb3IgZm9ybWF0XG4gICAgdGhpcy5lbnRyaWVzID0gbmV3IEZsb2F0MzJBcnJheSggMTYgKTtcblxuICAgIC8vIEBwdWJsaWMge01hdHJpeDQuVHlwZXN9XG4gICAgdGhpcy50eXBlID0gVHlwZXMuT1RIRVI7IC8vIHdpbGwgYmUgc2V0IGJ5IHJvd01ham9yXG5cbiAgICB0aGlzLnJvd01ham9yKFxuICAgICAgdjAwICE9PSB1bmRlZmluZWQgPyB2MDAgOiAxLCB2MDEgIT09IHVuZGVmaW5lZCA/IHYwMSA6IDAsIHYwMiAhPT0gdW5kZWZpbmVkID8gdjAyIDogMCwgdjAzICE9PSB1bmRlZmluZWQgPyB2MDMgOiAwLFxuICAgICAgdjEwICE9PSB1bmRlZmluZWQgPyB2MTAgOiAwLCB2MTEgIT09IHVuZGVmaW5lZCA/IHYxMSA6IDEsIHYxMiAhPT0gdW5kZWZpbmVkID8gdjEyIDogMCwgdjEzICE9PSB1bmRlZmluZWQgPyB2MTMgOiAwLFxuICAgICAgdjIwICE9PSB1bmRlZmluZWQgPyB2MjAgOiAwLCB2MjEgIT09IHVuZGVmaW5lZCA/IHYyMSA6IDAsIHYyMiAhPT0gdW5kZWZpbmVkID8gdjIyIDogMSwgdjIzICE9PSB1bmRlZmluZWQgPyB2MjMgOiAwLFxuICAgICAgdjMwICE9PSB1bmRlZmluZWQgPyB2MzAgOiAwLCB2MzEgIT09IHVuZGVmaW5lZCA/IHYzMSA6IDAsIHYzMiAhPT0gdW5kZWZpbmVkID8gdjMyIDogMCwgdjMzICE9PSB1bmRlZmluZWQgPyB2MzMgOiAxLFxuICAgICAgdHlwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYWxsIGVudHJpZXMgb2YgdGhlIG1hdHJpeCBpbiByb3ctbWFqb3Igb3JkZXIuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYwMFxuICAgKiBAcGFyYW0ge251bWJlcn0gdjAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MDJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYwM1xuICAgKiBAcGFyYW0ge251bWJlcn0gdjEwXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MTFcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYxMlxuICAgKiBAcGFyYW0ge251bWJlcn0gdjEzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MjBcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYyMVxuICAgKiBAcGFyYW0ge251bWJlcn0gdjIyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MjNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYzMFxuICAgKiBAcGFyYW0ge251bWJlcn0gdjMxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2MzJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHYzM1xuICAgKiBAcGFyYW0ge01hdHJpeDQuVHlwZXN8dW5kZWZpbmVkfSBbdHlwZV1cbiAgICogQHJldHVybnMge01hdHJpeDR9IC0gU2VsZiByZWZlcmVuY2VcbiAgICovXG4gIHJvd01ham9yKCB2MDAsIHYwMSwgdjAyLCB2MDMsIHYxMCwgdjExLCB2MTIsIHYxMywgdjIwLCB2MjEsIHYyMiwgdjIzLCB2MzAsIHYzMSwgdjMyLCB2MzMsIHR5cGUgKSB7XG4gICAgdGhpcy5lbnRyaWVzWyAwIF0gPSB2MDA7XG4gICAgdGhpcy5lbnRyaWVzWyAxIF0gPSB2MTA7XG4gICAgdGhpcy5lbnRyaWVzWyAyIF0gPSB2MjA7XG4gICAgdGhpcy5lbnRyaWVzWyAzIF0gPSB2MzA7XG4gICAgdGhpcy5lbnRyaWVzWyA0IF0gPSB2MDE7XG4gICAgdGhpcy5lbnRyaWVzWyA1IF0gPSB2MTE7XG4gICAgdGhpcy5lbnRyaWVzWyA2IF0gPSB2MjE7XG4gICAgdGhpcy5lbnRyaWVzWyA3IF0gPSB2MzE7XG4gICAgdGhpcy5lbnRyaWVzWyA4IF0gPSB2MDI7XG4gICAgdGhpcy5lbnRyaWVzWyA5IF0gPSB2MTI7XG4gICAgdGhpcy5lbnRyaWVzWyAxMCBdID0gdjIyO1xuICAgIHRoaXMuZW50cmllc1sgMTEgXSA9IHYzMjtcbiAgICB0aGlzLmVudHJpZXNbIDEyIF0gPSB2MDM7XG4gICAgdGhpcy5lbnRyaWVzWyAxMyBdID0gdjEzO1xuICAgIHRoaXMuZW50cmllc1sgMTQgXSA9IHYyMztcbiAgICB0aGlzLmVudHJpZXNbIDE1IF0gPSB2MzM7XG5cbiAgICAvLyBUT0RPOiBjb25zaWRlciBwZXJmb3JtYW5jZSBvZiB0aGUgYWZmaW5lIGNoZWNrIGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICB0aGlzLnR5cGUgPSB0eXBlID09PSB1bmRlZmluZWQgPyAoICggdjMwID09PSAwICYmIHYzMSA9PT0gMCAmJiB2MzIgPT09IDAgJiYgdjMzID09PSAxICkgPyBUeXBlcy5BRkZJTkUgOiBUeXBlcy5PVEhFUiApIDogdHlwZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFsbCBlbnRyaWVzIG9mIHRoZSBtYXRyaXggaW4gY29sdW1uLW1ham9yIG9yZGVyLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gdjAwXG4gICAqIEBwYXJhbSB7Kn0gdjEwXG4gICAqIEBwYXJhbSB7Kn0gdjIwXG4gICAqIEBwYXJhbSB7Kn0gdjMwXG4gICAqIEBwYXJhbSB7Kn0gdjAxXG4gICAqIEBwYXJhbSB7Kn0gdjExXG4gICAqIEBwYXJhbSB7Kn0gdjIxXG4gICAqIEBwYXJhbSB7Kn0gdjMxXG4gICAqIEBwYXJhbSB7Kn0gdjAyXG4gICAqIEBwYXJhbSB7Kn0gdjEyXG4gICAqIEBwYXJhbSB7Kn0gdjIyXG4gICAqIEBwYXJhbSB7Kn0gdjMyXG4gICAqIEBwYXJhbSB7Kn0gdjAzXG4gICAqIEBwYXJhbSB7Kn0gdjEzXG4gICAqIEBwYXJhbSB7Kn0gdjIzXG4gICAqIEBwYXJhbSB7Kn0gdjMzXG4gICAqIEBwYXJhbSB7TWF0cml4NC5UeXBlc3x1bmRlZmluZWR9IFt0eXBlXVxuICAgKiBAcmV0dXJucyB7TWF0cml4NH0gLSBTZWxmIHJlZmVyZW5jZVxuICAgKi9cbiAgY29sdW1uTWFqb3IoIHYwMCwgdjEwLCB2MjAsIHYzMCwgdjAxLCB2MTEsIHYyMSwgdjMxLCB2MDIsIHYxMiwgdjIyLCB2MzIsIHYwMywgdjEzLCB2MjMsIHYzMywgdHlwZSApIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvciggdjAwLCB2MDEsIHYwMiwgdjAzLCB2MTAsIHYxMSwgdjEyLCB2MTMsIHYyMCwgdjIxLCB2MjIsIHYyMywgdjMwLCB2MzEsIHYzMiwgdjMzLCB0eXBlICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgdmFsdWUgb2YgdGhlIHBhc3NlZC1pbiBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeDR9IC0gU2VsZiByZWZlcmVuY2VcbiAgICovXG4gIHNldCggbWF0cml4ICkge1xuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgbWF0cml4Lm0wMCgpLCBtYXRyaXgubTAxKCksIG1hdHJpeC5tMDIoKSwgbWF0cml4Lm0wMygpLFxuICAgICAgbWF0cml4Lm0xMCgpLCBtYXRyaXgubTExKCksIG1hdHJpeC5tMTIoKSwgbWF0cml4Lm0xMygpLFxuICAgICAgbWF0cml4Lm0yMCgpLCBtYXRyaXgubTIxKCksIG1hdHJpeC5tMjIoKSwgbWF0cml4Lm0yMygpLFxuICAgICAgbWF0cml4Lm0zMCgpLCBtYXRyaXgubTMxKCksIG1hdHJpeC5tMzIoKSwgbWF0cml4Lm0zMygpLFxuICAgICAgbWF0cml4LnR5cGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAwLDAgZW50cnkgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG0wMCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgMCwxIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtMDEoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgNCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDAsMiBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTAyKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDggXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAwLDMgZW50cnkgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG0wMygpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxMiBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDEsMCBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTEwKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDEgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAxLDEgZW50cnkgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG0xMSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA1IF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgMSwyIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtMTIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgOSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDEsMyBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTEzKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDEzIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgMiwwIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtMjAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMiBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDIsMSBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTIxKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDYgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAyLDIgZW50cnkgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG0yMigpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxMCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDIsMyBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTIzKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDE0IF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgMywwIGVudHJ5IG9mIHRoaXMgbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtMzAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllc1sgMyBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDMsMSBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTMxKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDcgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAzLDIgZW50cnkgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG0zMigpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxMSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIDMsMyBlbnRyeSBvZiB0aGlzIG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbTMzKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXNbIDE1IF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGFuIGlkZW50aXR5IG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gVHlwZXMuSURFTlRJVFkgfHwgdGhpcy5lcXVhbHMoIE1hdHJpeDQuSURFTlRJVFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYWxsIG9mIHRoaXMgbWF0cml4J3MgZW50cmllcyBhcmUgZmluaXRlIChub24taW5maW5pdGUgYW5kIG5vbi1OYU4pLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNGaW5pdGUoKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKCB0aGlzLm0wMCgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTAxKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMDIoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0wMygpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTEwKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMTEoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0xMigpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTEzKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjAoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0yMSgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTIyKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjMoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0zMCgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTMxKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMzIoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0zMygpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgM0QgdHJhbnNsYXRpb24sIGFzc3VtaW5nIG11bHRpcGxpY2F0aW9uIHdpdGggYSBob21vZ2VuZW91cyB2ZWN0b3IuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XG4gICAqL1xuICBnZXRUcmFuc2xhdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHRoaXMubTAzKCksIHRoaXMubTEzKCksIHRoaXMubTIzKCkgKTtcbiAgfVxuXG4gIGdldCB0cmFuc2xhdGlvbigpIHsgcmV0dXJuIHRoaXMuZ2V0VHJhbnNsYXRpb24oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmVjdG9yIHRoYXQgaXMgZXF1aXZhbGVudCB0byAoIFQoMSwwLDApLm1hZ25pdHVkZSwgVCgwLDEsMCkubWFnbml0dWRlLCBUKDAsMCwxKS5tYWduaXR1ZGUgKVxuICAgKiB3aGVyZSBUIGlzIGEgcmVsYXRpdmUgdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgZ2V0U2NhbGVWZWN0b3IoKSB7XG4gICAgY29uc3QgbTAwMDMgPSB0aGlzLm0wMCgpICsgdGhpcy5tMDMoKTtcbiAgICBjb25zdCBtMTAxMyA9IHRoaXMubTEwKCkgKyB0aGlzLm0xMygpO1xuICAgIGNvbnN0IG0yMDIzID0gdGhpcy5tMjAoKSArIHRoaXMubTIzKCk7XG4gICAgY29uc3QgbTMwMzMgPSB0aGlzLm0zMCgpICsgdGhpcy5tMzMoKTtcbiAgICBjb25zdCBtMDEwMyA9IHRoaXMubTAxKCkgKyB0aGlzLm0wMygpO1xuICAgIGNvbnN0IG0xMTEzID0gdGhpcy5tMTEoKSArIHRoaXMubTEzKCk7XG4gICAgY29uc3QgbTIxMjMgPSB0aGlzLm0yMSgpICsgdGhpcy5tMjMoKTtcbiAgICBjb25zdCBtMzEzMyA9IHRoaXMubTMxKCkgKyB0aGlzLm0zMygpO1xuICAgIGNvbnN0IG0wMjAzID0gdGhpcy5tMDIoKSArIHRoaXMubTAzKCk7XG4gICAgY29uc3QgbTEyMTMgPSB0aGlzLm0xMigpICsgdGhpcy5tMTMoKTtcbiAgICBjb25zdCBtMjIyMyA9IHRoaXMubTIyKCkgKyB0aGlzLm0yMygpO1xuICAgIGNvbnN0IG0zMjMzID0gdGhpcy5tMzIoKSArIHRoaXMubTMzKCk7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKFxuICAgICAgTWF0aC5zcXJ0KCBtMDAwMyAqIG0wMDAzICsgbTEwMTMgKiBtMTAxMyArIG0yMDIzICogbTIwMjMgKyBtMzAzMyAqIG0zMDMzICksXG4gICAgICBNYXRoLnNxcnQoIG0wMTAzICogbTAxMDMgKyBtMTExMyAqIG0xMTEzICsgbTIxMjMgKiBtMjEyMyArIG0zMTMzICogbTMxMzMgKSxcbiAgICAgIE1hdGguc3FydCggbTAyMDMgKiBtMDIwMyArIG0xMjEzICogbTEyMTMgKyBtMjIyMyAqIG0yMjIzICsgbTMyMzMgKiBtMzIzMyApICk7XG4gIH1cblxuICBnZXQgc2NhbGVWZWN0b3IoKSB7IHJldHVybiB0aGlzLmdldFNjYWxlVmVjdG9yKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTIHRyYW5zZm9ybSBzdHJpbmcgZm9yIHRoZSBhc3NvY2lhdGVkIGhvbW9nZW5lb3VzIDNkIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICBnZXRDU1NUcmFuc2Zvcm0oKSB7XG4gICAgLy8gU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtdHJhbnNmb3Jtcy8sIHBhcnRpY3VsYXJseSBTZWN0aW9uIDEzIHRoYXQgZGlzY3Vzc2VzIHRoZSBTVkcgY29tcGF0aWJpbGl0eVxuXG4gICAgLy8gdGhlIGlubmVyIHBhcnQgb2YgYSBDU1MzIHRyYW5zZm9ybSwgYnV0IHJlbWVtYmVyIHRvIGFkZCB0aGUgYnJvd3Nlci1zcGVjaWZpYyBwYXJ0cyFcbiAgICAvLyBOT1RFOiB0aGUgdG9GaXhlZCBjYWxscyBhcmUgaW5saW5lZCBmb3IgcGVyZm9ybWFuY2UgcmVhc29uc1xuICAgIHJldHVybiBgbWF0cml4M2QoJHtcbiAgICAgIHRoaXMuZW50cmllc1sgMCBdLnRvRml4ZWQoIDIwICl9LCR7XG4gICAgICB0aGlzLmVudHJpZXNbIDEgXS50b0ZpeGVkKCAyMCApfSwke1xuICAgICAgdGhpcy5lbnRyaWVzWyAyIF0udG9GaXhlZCggMjAgKX0sJHtcbiAgICAgIHRoaXMuZW50cmllc1sgMyBdLnRvRml4ZWQoIDIwICl9LCR7XG4gICAgICB0aGlzLmVudHJpZXNbIDQgXS50b0ZpeGVkKCAyMCApfSwke1xuICAgICAgdGhpcy5lbnRyaWVzWyA1IF0udG9GaXhlZCggMjAgKX0sJHtcbiAgICAgIHRoaXMuZW50cmllc1sgNiBdLnRvRml4ZWQoIDIwICl9LCR7XG4gICAgICB0aGlzLmVudHJpZXNbIDcgXS50b0ZpeGVkKCAyMCApfSwke1xuICAgICAgdGhpcy5lbnRyaWVzWyA4IF0udG9GaXhlZCggMjAgKX0sJHtcbiAgICAgIHRoaXMuZW50cmllc1sgOSBdLnRvRml4ZWQoIDIwICl9LCR7XG4gICAgICB0aGlzLmVudHJpZXNbIDEwIF0udG9GaXhlZCggMjAgKX0sJHtcbiAgICAgIHRoaXMuZW50cmllc1sgMTEgXS50b0ZpeGVkKCAyMCApfSwke1xuICAgICAgdGhpcy5lbnRyaWVzWyAxMiBdLnRvRml4ZWQoIDIwICl9LCR7XG4gICAgICB0aGlzLmVudHJpZXNbIDEzIF0udG9GaXhlZCggMjAgKX0sJHtcbiAgICAgIHRoaXMuZW50cmllc1sgMTQgXS50b0ZpeGVkKCAyMCApfSwke1xuICAgICAgdGhpcy5lbnRyaWVzWyAxNSBdLnRvRml4ZWQoIDIwICl9KWA7XG4gIH1cblxuICBnZXQgY3NzVHJhbnNmb3JtKCkgeyByZXR1cm4gdGhpcy5nZXRDU1NUcmFuc2Zvcm0oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGV4YWN0IGVxdWFsaXR5IHdpdGggYW5vdGhlciBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeDR9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGVxdWFscyggbWF0cml4ICkge1xuICAgIHJldHVybiB0aGlzLm0wMCgpID09PSBtYXRyaXgubTAwKCkgJiYgdGhpcy5tMDEoKSA9PT0gbWF0cml4Lm0wMSgpICYmIHRoaXMubTAyKCkgPT09IG1hdHJpeC5tMDIoKSAmJiB0aGlzLm0wMygpID09PSBtYXRyaXgubTAzKCkgJiZcbiAgICAgICAgICAgdGhpcy5tMTAoKSA9PT0gbWF0cml4Lm0xMCgpICYmIHRoaXMubTExKCkgPT09IG1hdHJpeC5tMTEoKSAmJiB0aGlzLm0xMigpID09PSBtYXRyaXgubTEyKCkgJiYgdGhpcy5tMTMoKSA9PT0gbWF0cml4Lm0xMygpICYmXG4gICAgICAgICAgIHRoaXMubTIwKCkgPT09IG1hdHJpeC5tMjAoKSAmJiB0aGlzLm0yMSgpID09PSBtYXRyaXgubTIxKCkgJiYgdGhpcy5tMjIoKSA9PT0gbWF0cml4Lm0yMigpICYmIHRoaXMubTIzKCkgPT09IG1hdHJpeC5tMjMoKSAmJlxuICAgICAgICAgICB0aGlzLm0zMCgpID09PSBtYXRyaXgubTMwKCkgJiYgdGhpcy5tMzEoKSA9PT0gbWF0cml4Lm0zMSgpICYmIHRoaXMubTMyKCkgPT09IG1hdHJpeC5tMzIoKSAmJiB0aGlzLm0zMygpID09PSBtYXRyaXgubTMzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBlcXVhbGl0eSB3aXRoaW4gYSBtYXJnaW4gb2YgZXJyb3Igd2l0aCBhbm90aGVyIG1hdHJpeFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZXF1YWxzRXBzaWxvbiggbWF0cml4LCBlcHNpbG9uICkge1xuICAgIHJldHVybiBNYXRoLmFicyggdGhpcy5tMDAoKSAtIG1hdHJpeC5tMDAoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMDEoKSAtIG1hdHJpeC5tMDEoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMDIoKSAtIG1hdHJpeC5tMDIoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMDMoKSAtIG1hdHJpeC5tMDMoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTAoKSAtIG1hdHJpeC5tMTAoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTEoKSAtIG1hdHJpeC5tMTEoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTIoKSAtIG1hdHJpeC5tMTIoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMTMoKSAtIG1hdHJpeC5tMTMoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjAoKSAtIG1hdHJpeC5tMjAoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjIoKSAtIG1hdHJpeC5tMjIoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMjMoKSAtIG1hdHJpeC5tMjMoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzAoKSAtIG1hdHJpeC5tMzAoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzEoKSAtIG1hdHJpeC5tMzEoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzIoKSAtIG1hdHJpeC5tMzIoKSApIDwgZXBzaWxvbiAmJlxuICAgICAgICAgICBNYXRoLmFicyggdGhpcy5tMzMoKSAtIG1hdHJpeC5tMzMoKSApIDwgZXBzaWxvbjtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBJbW11dGFibGUgb3BlcmF0aW9ucyAocmV0dXJuaW5nIGEgbmV3IG1hdHJpeClcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIGNvcHkoKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMDEoKSwgdGhpcy5tMDIoKSwgdGhpcy5tMDMoKSxcbiAgICAgIHRoaXMubTEwKCksIHRoaXMubTExKCksIHRoaXMubTEyKCksIHRoaXMubTEzKCksXG4gICAgICB0aGlzLm0yMCgpLCB0aGlzLm0yMSgpLCB0aGlzLm0yMigpLCB0aGlzLm0yMygpLFxuICAgICAgdGhpcy5tMzAoKSwgdGhpcy5tMzEoKSwgdGhpcy5tMzIoKSwgdGhpcy5tMzMoKSxcbiAgICAgIHRoaXMudHlwZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBtYXRyaXgsIGRlZmluZWQgYnkgdGhpcyBtYXRyaXggcGx1cyB0aGUgcHJvdmlkZWQgbWF0cml4XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBwbHVzKCBtYXRyaXggKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgdGhpcy5tMDAoKSArIG1hdHJpeC5tMDAoKSwgdGhpcy5tMDEoKSArIG1hdHJpeC5tMDEoKSwgdGhpcy5tMDIoKSArIG1hdHJpeC5tMDIoKSwgdGhpcy5tMDMoKSArIG1hdHJpeC5tMDMoKSxcbiAgICAgIHRoaXMubTEwKCkgKyBtYXRyaXgubTEwKCksIHRoaXMubTExKCkgKyBtYXRyaXgubTExKCksIHRoaXMubTEyKCkgKyBtYXRyaXgubTEyKCksIHRoaXMubTEzKCkgKyBtYXRyaXgubTEzKCksXG4gICAgICB0aGlzLm0yMCgpICsgbWF0cml4Lm0yMCgpLCB0aGlzLm0yMSgpICsgbWF0cml4Lm0yMSgpLCB0aGlzLm0yMigpICsgbWF0cml4Lm0yMigpLCB0aGlzLm0yMygpICsgbWF0cml4Lm0yMygpLFxuICAgICAgdGhpcy5tMzAoKSArIG1hdHJpeC5tMzAoKSwgdGhpcy5tMzEoKSArIG1hdHJpeC5tMzEoKSwgdGhpcy5tMzIoKSArIG1hdHJpeC5tMzIoKSwgdGhpcy5tMzMoKSArIG1hdHJpeC5tMzMoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBtYXRyaXgsIGRlZmluZWQgYnkgdGhpcyBtYXRyaXggcGx1cyB0aGUgcHJvdmlkZWQgbWF0cml4XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBtaW51cyggbWF0cml4ICkge1xuICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgIHRoaXMubTAwKCkgLSBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgLSBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgLSBtYXRyaXgubTAyKCksIHRoaXMubTAzKCkgLSBtYXRyaXgubTAzKCksXG4gICAgICB0aGlzLm0xMCgpIC0gbWF0cml4Lm0xMCgpLCB0aGlzLm0xMSgpIC0gbWF0cml4Lm0xMSgpLCB0aGlzLm0xMigpIC0gbWF0cml4Lm0xMigpLCB0aGlzLm0xMygpIC0gbWF0cml4Lm0xMygpLFxuICAgICAgdGhpcy5tMjAoKSAtIG1hdHJpeC5tMjAoKSwgdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSwgdGhpcy5tMjIoKSAtIG1hdHJpeC5tMjIoKSwgdGhpcy5tMjMoKSAtIG1hdHJpeC5tMjMoKSxcbiAgICAgIHRoaXMubTMwKCkgLSBtYXRyaXgubTMwKCksIHRoaXMubTMxKCkgLSBtYXRyaXgubTMxKCksIHRoaXMubTMyKCkgLSBtYXRyaXgubTMyKCksIHRoaXMubTMzKCkgLSBtYXRyaXgubTMzKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB0cmFuc3Bvc2VkIGNvcHkgb2YgdGhpcyBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIHRyYW5zcG9zZWQoKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMTAoKSwgdGhpcy5tMjAoKSwgdGhpcy5tMzAoKSxcbiAgICAgIHRoaXMubTAxKCksIHRoaXMubTExKCksIHRoaXMubTIxKCksIHRoaXMubTMxKCksXG4gICAgICB0aGlzLm0wMigpLCB0aGlzLm0xMigpLCB0aGlzLm0yMigpLCB0aGlzLm0zMigpLFxuICAgICAgdGhpcy5tMDMoKSwgdGhpcy5tMTMoKSwgdGhpcy5tMjMoKSwgdGhpcy5tMzMoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZWdhdGVkIGNvcHkgb2YgdGhpcyBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cbiAgICovXG4gIG5lZ2F0ZWQoKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgLXRoaXMubTAwKCksIC10aGlzLm0wMSgpLCAtdGhpcy5tMDIoKSwgLXRoaXMubTAzKCksXG4gICAgICAtdGhpcy5tMTAoKSwgLXRoaXMubTExKCksIC10aGlzLm0xMigpLCAtdGhpcy5tMTMoKSxcbiAgICAgIC10aGlzLm0yMCgpLCAtdGhpcy5tMjEoKSwgLXRoaXMubTIyKCksIC10aGlzLm0yMygpLFxuICAgICAgLXRoaXMubTMwKCksIC10aGlzLm0zMSgpLCAtdGhpcy5tMzIoKSwgLXRoaXMubTMzKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGludmVydGVkIGNvcHkgb2YgdGhpcyBtYXRyaXhcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cbiAgICovXG4gIGludmVydGVkKCkge1xuICAgIGxldCBkZXQ7XG4gICAgc3dpdGNoKCB0aGlzLnR5cGUgKSB7XG4gICAgICBjYXNlIFR5cGVzLklERU5USVRZOlxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIGNhc2UgVHlwZXMuVFJBTlNMQVRJT05fM0Q6XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAxLCAwLCAwLCAtdGhpcy5tMDMoKSxcbiAgICAgICAgICAwLCAxLCAwLCAtdGhpcy5tMTMoKSxcbiAgICAgICAgICAwLCAwLCAxLCAtdGhpcy5tMjMoKSxcbiAgICAgICAgICAwLCAwLCAwLCAxLCBUeXBlcy5UUkFOU0xBVElPTl8zRCApO1xuICAgICAgY2FzZSBUeXBlcy5TQ0FMSU5HOlxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgMSAvIHRoaXMubTAwKCksIDAsIDAsIDAsXG4gICAgICAgICAgMCwgMSAvIHRoaXMubTExKCksIDAsIDAsXG4gICAgICAgICAgMCwgMCwgMSAvIHRoaXMubTIyKCksIDAsXG4gICAgICAgICAgMCwgMCwgMCwgMSAvIHRoaXMubTMzKCksIFR5cGVzLlNDQUxJTkcgKTtcbiAgICAgIGNhc2UgVHlwZXMuQUZGSU5FOlxuICAgICAgY2FzZSBUeXBlcy5PVEhFUjpcbiAgICAgICAgZGV0ID0gdGhpcy5nZXREZXRlcm1pbmFudCgpO1xuICAgICAgICBpZiAoIGRldCAhPT0gMCApIHtcbiAgICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgICAgICAoIC10aGlzLm0zMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0zMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0yMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTMzKCkgKyB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMzEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjEoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMzEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMDEoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMjEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0zMygpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0zMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0zMSgpICogdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMzIoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0xMSgpICogdGhpcy5tMDIoKSAqIHRoaXMubTMzKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMjEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMTEoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMTMoKSAtIHRoaXMubTIwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMTMoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMjMoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMjMoKSArIHRoaXMubTIwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMzMoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzMoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMzAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMzAoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTMyKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0zMygpICsgdGhpcy5tMDAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMDMoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMDMoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMTMoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0zMigpICogdGhpcy5tMTMoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0wMigpICogdGhpcy5tMzMoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMzMoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMjAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMTAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0wMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0xMygpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTAyKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMDAoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0zMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0yMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTEzKCkgKyB0aGlzLm0zMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTIzKCkgLSB0aGlzLm0yMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTMzKCkgKyB0aGlzLm0xMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMzAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMzAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMDAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0yMygpICsgdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0zMygpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0zMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0xMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTAzKCkgKyB0aGlzLm0zMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMzEoKSAqIHRoaXMubTEzKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMDEoKSAqIHRoaXMubTMzKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTMzKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMjAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMygpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0xMygpICsgdGhpcy5tMTAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMygpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMygpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMTIoKSAtIHRoaXMubTIwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMTIoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMjIoKSArIHRoaXMubTIwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMzAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMjAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMzAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMigpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTMxKCkgKiB0aGlzLm0yMigpIC0gdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0zMigpICsgdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTMwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMDIoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMDIoKSAtIHRoaXMubTMwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0zMSgpICogdGhpcy5tMTIoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0wMSgpICogdGhpcy5tMzIoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMzIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMjAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0wMigpICsgdGhpcy5tMjAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0xMigpIC0gdGhpcy5tMTAoKSAqIHRoaXMubTAxKCkgKiB0aGlzLm0yMigpICsgdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXRcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBjb3VsZCBub3QgYmUgaW52ZXJ0ZWQsIGRldGVybWluYW50ID09PSAwJyApO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBNYXRyaXg0LmludmVydGVkIHdpdGggdW5rbm93biB0eXBlOiAke3RoaXMudHlwZX1gICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXgsIGRlZmluZWQgYnkgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgKiBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeDR9IC0gTk9URTogdGhpcyBtYXkgYmUgdGhlIHNhbWUgbWF0cml4IVxuICAgKi9cbiAgdGltZXNNYXRyaXgoIG1hdHJpeCApIHtcbiAgICAvLyBJICogTSA9PT0gTSAqIEkgPT09IEkgKHRoZSBpZGVudGl0eSlcbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gVHlwZXMuSURFTlRJVFkgfHwgbWF0cml4LnR5cGUgPT09IFR5cGVzLklERU5USVRZICkge1xuICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gVHlwZXMuSURFTlRJVFkgPyBtYXRyaXggOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICggdGhpcy50eXBlID09PSBtYXRyaXgudHlwZSApIHtcbiAgICAgIC8vIGN1cnJlbnRseSB0d28gbWF0cmljZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIHJlc3VsdCBpbiB0aGUgc2FtZSByZXN1bHQgdHlwZVxuICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IFR5cGVzLlRSQU5TTEFUSU9OXzNEICkge1xuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2YgdHJhbnNsYXRpb25zXG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgICAgICAxLCAwLCAwLCB0aGlzLm0wMygpICsgbWF0cml4Lm0wMigpLFxuICAgICAgICAgIDAsIDEsIDAsIHRoaXMubTEzKCkgKyBtYXRyaXgubTEyKCksXG4gICAgICAgICAgMCwgMCwgMSwgdGhpcy5tMjMoKSArIG1hdHJpeC5tMjMoKSxcbiAgICAgICAgICAwLCAwLCAwLCAxLCBUeXBlcy5UUkFOU0xBVElPTl8zRCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gVHlwZXMuU0NBTElORyApIHtcbiAgICAgICAgLy8gZmFzdGVyIGNvbWJpbmF0aW9uIG9mIHNjYWxpbmdcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCksIDAsIDAsIDAsXG4gICAgICAgICAgMCwgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSwgMCwgMCxcbiAgICAgICAgICAwLCAwLCB0aGlzLm0yMigpICogbWF0cml4Lm0yMigpLCAwLFxuICAgICAgICAgIDAsIDAsIDAsIDEsIFR5cGVzLlNDQUxJTkcgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHRoaXMudHlwZSAhPT0gVHlwZXMuT1RIRVIgJiYgbWF0cml4LnR5cGUgIT09IFR5cGVzLk9USEVSICkge1xuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyB0aGF0IGFyZSBhbnl0aGluZyBidXQgXCJvdGhlclwiIGFyZSB0ZWNobmljYWxseSBhZmZpbmUsIGFuZCB0aGUgcmVzdWx0IHdpbGwgYmUgYWZmaW5lXG5cbiAgICAgIC8vIGFmZmluZSBjYXNlXG4gICAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTExKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMSgpLFxuICAgICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIyKCksXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTAzKCksXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCkgKyB0aGlzLm0xMigpICogbWF0cml4Lm0yMSgpLFxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIyKCksXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTEzKCksXG4gICAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTExKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMSgpLFxuICAgICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIyKCksXG4gICAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTIzKCksXG4gICAgICAgIDAsIDAsIDAsIDEsIFR5cGVzLkFGRklORSApO1xuICAgIH1cblxuICAgIC8vIGdlbmVyYWwgY2FzZVxuICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMwKCksXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIxKCkgKyB0aGlzLm0wMygpICogbWF0cml4Lm0zMSgpLFxuICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0wMigpICogbWF0cml4Lm0yMigpICsgdGhpcy5tMDMoKSAqIG1hdHJpeC5tMzIoKSxcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTAzKCkgKiBtYXRyaXgubTMzKCksXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTAoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIwKCkgKyB0aGlzLm0xMygpICogbWF0cml4Lm0zMCgpLFxuICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDEoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCkgKyB0aGlzLm0xMigpICogbWF0cml4Lm0yMSgpICsgdGhpcy5tMTMoKSAqIG1hdHJpeC5tMzEoKSxcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSArIHRoaXMubTEzKCkgKiBtYXRyaXgubTMyKCksXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMygpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTMoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIzKCkgKyB0aGlzLm0xMygpICogbWF0cml4Lm0zMygpLFxuICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTEwKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMCgpICsgdGhpcy5tMjMoKSAqIG1hdHJpeC5tMzAoKSxcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjEoKSArIHRoaXMubTIzKCkgKiBtYXRyaXgubTMxKCksXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIyKCkgKyB0aGlzLm0yMygpICogbWF0cml4Lm0zMigpLFxuICAgICAgdGhpcy5tMjAoKSAqIG1hdHJpeC5tMDMoKSArIHRoaXMubTIxKCkgKiBtYXRyaXgubTEzKCkgKyB0aGlzLm0yMigpICogbWF0cml4Lm0yMygpICsgdGhpcy5tMjMoKSAqIG1hdHJpeC5tMzMoKSxcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjAoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMwKCksXG4gICAgICB0aGlzLm0zMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMzEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTMyKCkgKiBtYXRyaXgubTIxKCkgKyB0aGlzLm0zMygpICogbWF0cml4Lm0zMSgpLFxuICAgICAgdGhpcy5tMzAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTMxKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0zMigpICogbWF0cml4Lm0yMigpICsgdGhpcy5tMzMoKSAqIG1hdHJpeC5tMzIoKSxcbiAgICAgIHRoaXMubTMwKCkgKiBtYXRyaXgubTAzKCkgKyB0aGlzLm0zMSgpICogbWF0cml4Lm0xMygpICsgdGhpcy5tMzIoKSAqIG1hdHJpeC5tMjMoKSArIHRoaXMubTMzKCkgKiBtYXRyaXgubTMzKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBtdWx0aXBsaWNhdGlvbiBvZiB0aGlzIG1hdHJpeCB0aW1lcyB0aGUgcHJvdmlkZWQgdmVjdG9yXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3I0fSB2ZWN0b3I0XG4gICAqIEByZXR1cm5zIHtWZWN0b3I0fVxuICAgKi9cbiAgdGltZXNWZWN0b3I0KCB2ZWN0b3I0ICkge1xuICAgIGNvbnN0IHggPSB0aGlzLm0wMCgpICogdmVjdG9yNC54ICsgdGhpcy5tMDEoKSAqIHZlY3RvcjQueSArIHRoaXMubTAyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0wMygpICogdmVjdG9yNC53O1xuICAgIGNvbnN0IHkgPSB0aGlzLm0xMCgpICogdmVjdG9yNC54ICsgdGhpcy5tMTEoKSAqIHZlY3RvcjQueSArIHRoaXMubTEyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0xMygpICogdmVjdG9yNC53O1xuICAgIGNvbnN0IHogPSB0aGlzLm0yMCgpICogdmVjdG9yNC54ICsgdGhpcy5tMjEoKSAqIHZlY3RvcjQueSArIHRoaXMubTIyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0yMygpICogdmVjdG9yNC53O1xuICAgIGNvbnN0IHcgPSB0aGlzLm0zMCgpICogdmVjdG9yNC54ICsgdGhpcy5tMzEoKSAqIHZlY3RvcjQueSArIHRoaXMubTMyKCkgKiB2ZWN0b3I0LnogKyB0aGlzLm0zMygpICogdmVjdG9yNC53O1xuICAgIHJldHVybiBuZXcgVmVjdG9yNCggeCwgeSwgeiwgdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgbWF0cml4IHRpbWVzIHRoZSBwcm92aWRlZCB2ZWN0b3IgKHRyZWF0aW5nIHRoaXMgbWF0cml4IGFzIGhvbW9nZW5lb3VzLCBzbyB0aGF0XG4gICAqIGl0IGlzIHRoZSB0ZWNobmljYWwgbXVsdGlwbGljYXRpb24gb2YgKHgseSx6LDEpKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IHZlY3RvcjNcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XG4gICAqL1xuICB0aW1lc1ZlY3RvcjMoIHZlY3RvcjMgKSB7XG4gICAgcmV0dXJuIHRoaXMudGltZXNWZWN0b3I0KCB2ZWN0b3IzLnRvVmVjdG9yNCgpICkudG9WZWN0b3IzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhpcyBtYXRyaXgncyB0cmFuc3Bvc2UgdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvclxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yNH0gdmVjdG9yNFxuICAgKiBAcmV0dXJucyB7VmVjdG9yNH1cbiAgICovXG4gIHRpbWVzVHJhbnNwb3NlVmVjdG9yNCggdmVjdG9yNCApIHtcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjQueCArIHRoaXMubTEwKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0yMCgpICogdmVjdG9yNC56ICsgdGhpcy5tMzAoKSAqIHZlY3RvcjQudztcbiAgICBjb25zdCB5ID0gdGhpcy5tMDEoKSAqIHZlY3RvcjQueCArIHRoaXMubTExKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0yMSgpICogdmVjdG9yNC56ICsgdGhpcy5tMzEoKSAqIHZlY3RvcjQudztcbiAgICBjb25zdCB6ID0gdGhpcy5tMDIoKSAqIHZlY3RvcjQueCArIHRoaXMubTEyKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0yMigpICogdmVjdG9yNC56ICsgdGhpcy5tMzIoKSAqIHZlY3RvcjQudztcbiAgICBjb25zdCB3ID0gdGhpcy5tMDMoKSAqIHZlY3RvcjQueCArIHRoaXMubTEzKCkgKiB2ZWN0b3I0LnkgKyB0aGlzLm0yMygpICogdmVjdG9yNC56ICsgdGhpcy5tMzMoKSAqIHZlY3RvcjQudztcbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHgsIHksIHosIHcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBtdWx0aXBsaWNhdGlvbiBvZiB0aGlzIG1hdHJpeCdzIHRyYW5zcG9zZSB0aW1lcyB0aGUgcHJvdmlkZWQgdmVjdG9yIChob21vZ2VuZW91cykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3IzXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgdGltZXNUcmFuc3Bvc2VWZWN0b3IzKCB2ZWN0b3IzICkge1xuICAgIHJldHVybiB0aGlzLnRpbWVzVHJhbnNwb3NlVmVjdG9yNCggdmVjdG9yMy50b1ZlY3RvcjQoKSApLnRvVmVjdG9yMygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVxdWl2YWxlbnQgdG8gdGhlIG11bHRpcGxpY2F0aW9uIG9mICh4LHkseiwwKSwgaWdub3JpbmcgdGhlIGhvbW9nZW5lb3VzIHBhcnQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3IzXG4gICAqIEByZXR1cm5zIHtWZWN0b3IzfVxuICAgKi9cbiAgdGltZXNSZWxhdGl2ZVZlY3RvcjMoIHZlY3RvcjMgKSB7XG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3IzLnggKyB0aGlzLm0xMCgpICogdmVjdG9yMy55ICsgdGhpcy5tMjAoKSAqIHZlY3RvcjMuejtcbiAgICBjb25zdCB5ID0gdGhpcy5tMDEoKSAqIHZlY3RvcjMueSArIHRoaXMubTExKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0yMSgpICogdmVjdG9yMy56O1xuICAgIGNvbnN0IHogPSB0aGlzLm0wMigpICogdmVjdG9yMy56ICsgdGhpcy5tMTIoKSAqIHZlY3RvcjMueSArIHRoaXMubTIyKCkgKiB2ZWN0b3IzLno7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB4LCB5LCB6ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGV0ZXJtaW5hbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldERldGVybWluYW50KCkge1xuICAgIHJldHVybiB0aGlzLm0wMygpICogdGhpcy5tMTIoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMCgpIC1cbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMSgpICogdGhpcy5tMzAoKSAtXG4gICAgICAgICAgIHRoaXMubTAzKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMwKCkgK1xuICAgICAgICAgICB0aGlzLm0wMSgpICogdGhpcy5tMTMoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0zMCgpICtcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTExKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzAoKSAtXG4gICAgICAgICAgIHRoaXMubTAxKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMjMoKSAqIHRoaXMubTMwKCkgLVxuICAgICAgICAgICB0aGlzLm0wMygpICogdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgKiB0aGlzLm0zMSgpICtcbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzEoKSArXG4gICAgICAgICAgIHRoaXMubTAzKCkgKiB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMxKCkgLVxuICAgICAgICAgICB0aGlzLm0wMCgpICogdGhpcy5tMTMoKSAqIHRoaXMubTIyKCkgKiB0aGlzLm0zMSgpIC1cbiAgICAgICAgICAgdGhpcy5tMDIoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzEoKSArXG4gICAgICAgICAgIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICogdGhpcy5tMjMoKSAqIHRoaXMubTMxKCkgK1xuICAgICAgICAgICB0aGlzLm0wMygpICogdGhpcy5tMTEoKSAqIHRoaXMubTIwKCkgKiB0aGlzLm0zMigpIC1cbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEzKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzIoKSAtXG4gICAgICAgICAgIHRoaXMubTAzKCkgKiB0aGlzLm0xMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTMyKCkgK1xuICAgICAgICAgICB0aGlzLm0wMCgpICogdGhpcy5tMTMoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMigpICtcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMygpICogdGhpcy5tMzIoKSAtXG4gICAgICAgICAgIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjMoKSAqIHRoaXMubTMyKCkgLVxuICAgICAgICAgICB0aGlzLm0wMigpICogdGhpcy5tMTEoKSAqIHRoaXMubTIwKCkgKiB0aGlzLm0zMygpICtcbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKiB0aGlzLm0yMCgpICogdGhpcy5tMzMoKSArXG4gICAgICAgICAgIHRoaXMubTAyKCkgKiB0aGlzLm0xMCgpICogdGhpcy5tMjEoKSAqIHRoaXMubTMzKCkgLVxuICAgICAgICAgICB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIxKCkgKiB0aGlzLm0zMygpIC1cbiAgICAgICAgICAgdGhpcy5tMDEoKSAqIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICogdGhpcy5tMzMoKSArXG4gICAgICAgICAgIHRoaXMubTAwKCkgKiB0aGlzLm0xMSgpICogdGhpcy5tMjIoKSAqIHRoaXMubTMzKCk7XG4gIH1cblxuICBnZXQgZGV0ZXJtaW5hbnQoKSB7IHJldHVybiB0aGlzLmdldERldGVybWluYW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHt0aGlzLm0wMCgpfSAke3RoaXMubTAxKCl9ICR7dGhpcy5tMDIoKX0gJHt0aGlzLm0wMygpfVxcbiR7XG4gICAgICB0aGlzLm0xMCgpfSAke3RoaXMubTExKCl9ICR7dGhpcy5tMTIoKX0gJHt0aGlzLm0xMygpfVxcbiR7XG4gICAgICB0aGlzLm0yMCgpfSAke3RoaXMubTIxKCl9ICR7dGhpcy5tMjIoKX0gJHt0aGlzLm0yMygpfVxcbiR7XG4gICAgICB0aGlzLm0zMCgpfSAke3RoaXMubTMxKCl9ICR7dGhpcy5tMzIoKX0gJHt0aGlzLm0zMygpfWA7XG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgdGhpcyBtYXRyaXggZWZmZWN0aXZlbHkgaW1tdXRhYmxlIHRvIHRoZSBub3JtYWwgbWV0aG9kcyAoZXhjZXB0IGRpcmVjdCBzZXR0ZXJzPylcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4M30gLSBTZWxmIHJlZmVyZW5jZVxuICAgKi9cbiAgbWFrZUltbXV0YWJsZSgpIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIHRoaXMucm93TWFqb3IgPSAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ0Nhbm5vdCBtb2RpZnkgaW1tdXRhYmxlIG1hdHJpeCcgKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyB0aGUgZW50cmllcyBvZiB0aGlzIG1hdHJpeCBvdmVyIHRvIGFuIGFyYml0cmFyeSBhcnJheSAodHlwZWQgb3Igbm9ybWFsKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fEZsb2F0MzJBcnJheXxGbG9hdDY0QXJyYXl9IGFycmF5XG4gICAqIEByZXR1cm5zIHtBcnJheXxGbG9hdDMyQXJyYXl8RmxvYXQ2NEFycmF5fSAtIFJldHVybmVkIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgY29weVRvQXJyYXkoIGFycmF5ICkge1xuICAgIGFycmF5WyAwIF0gPSB0aGlzLm0wMCgpO1xuICAgIGFycmF5WyAxIF0gPSB0aGlzLm0xMCgpO1xuICAgIGFycmF5WyAyIF0gPSB0aGlzLm0yMCgpO1xuICAgIGFycmF5WyAzIF0gPSB0aGlzLm0zMCgpO1xuICAgIGFycmF5WyA0IF0gPSB0aGlzLm0wMSgpO1xuICAgIGFycmF5WyA1IF0gPSB0aGlzLm0xMSgpO1xuICAgIGFycmF5WyA2IF0gPSB0aGlzLm0yMSgpO1xuICAgIGFycmF5WyA3IF0gPSB0aGlzLm0zMSgpO1xuICAgIGFycmF5WyA4IF0gPSB0aGlzLm0wMigpO1xuICAgIGFycmF5WyA5IF0gPSB0aGlzLm0xMigpO1xuICAgIGFycmF5WyAxMCBdID0gdGhpcy5tMjIoKTtcbiAgICBhcnJheVsgMTEgXSA9IHRoaXMubTMyKCk7XG4gICAgYXJyYXlbIDEyIF0gPSB0aGlzLm0wMygpO1xuICAgIGFycmF5WyAxMyBdID0gdGhpcy5tMTMoKTtcbiAgICBhcnJheVsgMTQgXSA9IHRoaXMubTIzKCk7XG4gICAgYXJyYXlbIDE1IF0gPSB0aGlzLm0zMygpO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGlkZW50aXR5IG1hdHJpeC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIHN0YXRpYyBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICAxLCAwLCAwLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAwLCAwLCAwLCAxLFxuICAgICAgVHlwZXMuSURFTlRJVFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxuICAgKi9cbiAgc3RhdGljIHRyYW5zbGF0aW9uKCB4LCB5LCB6ICkge1xuICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgIDEsIDAsIDAsIHgsXG4gICAgICAwLCAxLCAwLCB5LFxuICAgICAgMCwgMCwgMSwgeixcbiAgICAgIDAsIDAsIDAsIDEsXG4gICAgICBUeXBlcy5UUkFOU0xBVElPTl8zRCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB0cmFuc2xhdGlvbiBtYXRyaXggY29tcHV0ZWQgZnJvbSBhIHZlY3Rvci5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN8VmVjdG9yNH0gdmVjdG9yXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxuICAgKi9cbiAgc3RhdGljIHRyYW5zbGF0aW9uRnJvbVZlY3RvciggdmVjdG9yICkge1xuICAgIHJldHVybiBNYXRyaXg0LnRyYW5zbGF0aW9uKCB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHNjYWxlcyB0aGluZ3MgaW4gZWFjaCBkaW1lbnNpb24uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBzdGF0aWMgc2NhbGluZyggeCwgeSwgeiApIHtcbiAgICAvLyBhbGxvdyB1c2luZyBvbmUgcGFyYW1ldGVyIHRvIHNjYWxlIGV2ZXJ5dGhpbmdcbiAgICB5ID0geSA9PT0gdW5kZWZpbmVkID8geCA6IHk7XG4gICAgeiA9IHogPT09IHVuZGVmaW5lZCA/IHggOiB6O1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgeCwgMCwgMCwgMCxcbiAgICAgIDAsIHksIDAsIDAsXG4gICAgICAwLCAwLCB6LCAwLFxuICAgICAgMCwgMCwgMCwgMSxcbiAgICAgIFR5cGVzLlNDQUxJTkcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgaG9tb2dlbmVvdXMgbWF0cml4IHJvdGF0aW9uIGRlZmluZWQgYnkgYSByb3RhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gdW5pdCBheGlzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gYXhpcyAtIG5vcm1hbGl6ZWRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIHN0YXRpYyByb3RhdGlvbkF4aXNBbmdsZSggYXhpcywgYW5nbGUgKSB7XG4gICAgY29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApO1xuICAgIGNvbnN0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcbiAgICBjb25zdCBDID0gMSAtIGM7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICBheGlzLnggKiBheGlzLnggKiBDICsgYywgYXhpcy54ICogYXhpcy55ICogQyAtIGF4aXMueiAqIHMsIGF4aXMueCAqIGF4aXMueiAqIEMgKyBheGlzLnkgKiBzLCAwLFxuICAgICAgYXhpcy55ICogYXhpcy54ICogQyArIGF4aXMueiAqIHMsIGF4aXMueSAqIGF4aXMueSAqIEMgKyBjLCBheGlzLnkgKiBheGlzLnogKiBDIC0gYXhpcy54ICogcywgMCxcbiAgICAgIGF4aXMueiAqIGF4aXMueCAqIEMgLSBheGlzLnkgKiBzLCBheGlzLnogKiBheGlzLnkgKiBDICsgYXhpcy54ICogcywgYXhpcy56ICogYXhpcy56ICogQyArIGMsIDAsXG4gICAgICAwLCAwLCAwLCAxLFxuICAgICAgVHlwZXMuQUZGSU5FICk7XG4gIH1cblxuICAvLyBUT0RPOiBhZGQgaW4gcm90YXRpb24gZnJvbSBxdWF0ZXJuaW9uLCBhbmQgZnJvbSBxdWF0ICsgdHJhbnNsYXRpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcm90YXRpb24gbWF0cml4IGluIHRoZSB5eiBwbGFuZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqIEByZXR1cm5zIHtNYXRyaXg0fVxuICAgKi9cbiAgc3RhdGljIHJvdGF0aW9uWCggYW5nbGUgKSB7XG4gICAgY29uc3QgYyA9IE1hdGguY29zKCBhbmdsZSApO1xuICAgIGNvbnN0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuICAgIHJldHVybiBuZXcgTWF0cml4NChcbiAgICAgIDEsIDAsIDAsIDAsXG4gICAgICAwLCBjLCAtcywgMCxcbiAgICAgIDAsIHMsIGMsIDAsXG4gICAgICAwLCAwLCAwLCAxLFxuICAgICAgVHlwZXMuQUZGSU5FICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCBpbiB0aGUgeHogcGxhbmUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKiBAcmV0dXJucyB7TWF0cml4NH1cbiAgICovXG4gIHN0YXRpYyByb3RhdGlvblkoIGFuZ2xlICkge1xuICAgIGNvbnN0IGMgPSBNYXRoLmNvcyggYW5nbGUgKTtcbiAgICBjb25zdCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICBjLCAwLCBzLCAwLFxuICAgICAgMCwgMSwgMCwgMCxcbiAgICAgIC1zLCAwLCBjLCAwLFxuICAgICAgMCwgMCwgMCwgMSxcbiAgICAgIFR5cGVzLkFGRklORSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByb3RhdGlvbiBtYXRyaXggaW4gdGhlIHh5IHBsYW5lLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBzdGF0aWMgcm90YXRpb25aKCBhbmdsZSApIHtcbiAgICBjb25zdCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XG4gICAgY29uc3QgcyA9IE1hdGguc2luKCBhbmdsZSApO1xuXG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgYywgLXMsIDAsIDAsXG4gICAgICBzLCBjLCAwLCAwLFxuICAgICAgMCwgMCwgMSwgMCxcbiAgICAgIDAsIDAsIDAsIDEsXG4gICAgICBUeXBlcy5BRkZJTkUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzcGVjaWZpYyBwZXJzcGVjdGl2ZSBtYXRyaXggbmVlZGVkIGZvciBjZXJ0YWluIFdlYkdMIGNvbnRleHRzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmb3ZZUmFkaWFuc1xuICAgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IC0gYXNwZWN0ID09PSB3aWR0aCAvIGhlaWdodFxuICAgKiBAcGFyYW0ge251bWJlcn0gek5lYXJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpGYXJcbiAgICogQHJldHVybnMge01hdHJpeDR9XG4gICAqL1xuICBzdGF0aWMgZ2x1UGVyc3BlY3RpdmUoIGZvdllSYWRpYW5zLCBhc3BlY3QsIHpOZWFyLCB6RmFyICkge1xuICAgIGNvbnN0IGNvdGFuZ2VudCA9IE1hdGguY29zKCBmb3ZZUmFkaWFucyApIC8gTWF0aC5zaW4oIGZvdllSYWRpYW5zICk7XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICBjb3RhbmdlbnQgLyBhc3BlY3QsIDAsIDAsIDAsXG4gICAgICAwLCBjb3RhbmdlbnQsIDAsIDAsXG4gICAgICAwLCAwLCAoIHpGYXIgKyB6TmVhciApIC8gKCB6TmVhciAtIHpGYXIgKSwgKCAyICogekZhciAqIHpOZWFyICkgLyAoIHpOZWFyIC0gekZhciApLFxuICAgICAgMCwgMCwgLTEsIDAgKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdNYXRyaXg0JywgTWF0cml4NCApO1xuXG5jbGFzcyBUeXBlcyBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xuICAgIHN0YXRpYyBPVEhFUiA9IG5ldyBUeXBlcygpO1xuICAgIHN0YXRpYyBJREVOVElUWSA9IG5ldyBUeXBlcygpO1xuICAgIHN0YXRpYyBUUkFOU0xBVElPTl8zRCA9IG5ldyBUeXBlcygpO1xuICAgIHN0YXRpYyBTQ0FMSU5HID0gbmV3IFR5cGVzKCk7XG4gICAgc3RhdGljIEFGRklORSA9IG5ldyBUeXBlcygpO1xuICAgIHN0YXRpYyBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggVHlwZXMgKTtcbn1cblxuLy8gQHB1YmxpYyB7RW51bWVyYXRpb259XG5NYXRyaXg0LlR5cGVzID0gVHlwZXM7XG5cbi8vIEBwdWJsaWMge01hdHJpeDR9XG5NYXRyaXg0LklERU5USVRZID0gbmV3IE1hdHJpeDQoKS5tYWtlSW1tdXRhYmxlKCk7XG5cbmV4cG9ydCBkZWZhdWx0IE1hdHJpeDQ7Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsImRvdCIsIlZlY3RvcjMiLCJWZWN0b3I0IiwiRmxvYXQzMkFycmF5Iiwid2luZG93IiwiQXJyYXkiLCJNYXRyaXg0Iiwicm93TWFqb3IiLCJ2MDAiLCJ2MDEiLCJ2MDIiLCJ2MDMiLCJ2MTAiLCJ2MTEiLCJ2MTIiLCJ2MTMiLCJ2MjAiLCJ2MjEiLCJ2MjIiLCJ2MjMiLCJ2MzAiLCJ2MzEiLCJ2MzIiLCJ2MzMiLCJ0eXBlIiwiZW50cmllcyIsInVuZGVmaW5lZCIsIlR5cGVzIiwiQUZGSU5FIiwiT1RIRVIiLCJjb2x1bW5NYWpvciIsInNldCIsIm1hdHJpeCIsIm0wMCIsIm0wMSIsIm0wMiIsIm0wMyIsIm0xMCIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMCIsIm0yMSIsIm0yMiIsIm0yMyIsIm0zMCIsIm0zMSIsIm0zMiIsIm0zMyIsImlzSWRlbnRpdHkiLCJJREVOVElUWSIsImVxdWFscyIsImlzRmluaXRlIiwiZ2V0VHJhbnNsYXRpb24iLCJ0cmFuc2xhdGlvbiIsImdldFNjYWxlVmVjdG9yIiwibTAwMDMiLCJtMTAxMyIsIm0yMDIzIiwibTMwMzMiLCJtMDEwMyIsIm0xMTEzIiwibTIxMjMiLCJtMzEzMyIsIm0wMjAzIiwibTEyMTMiLCJtMjIyMyIsIm0zMjMzIiwiTWF0aCIsInNxcnQiLCJzY2FsZVZlY3RvciIsImdldENTU1RyYW5zZm9ybSIsInRvRml4ZWQiLCJjc3NUcmFuc2Zvcm0iLCJlcXVhbHNFcHNpbG9uIiwiZXBzaWxvbiIsImFicyIsImNvcHkiLCJwbHVzIiwibWludXMiLCJ0cmFuc3Bvc2VkIiwibmVnYXRlZCIsImludmVydGVkIiwiZGV0IiwiVFJBTlNMQVRJT05fM0QiLCJTQ0FMSU5HIiwiZ2V0RGV0ZXJtaW5hbnQiLCJFcnJvciIsInRpbWVzTWF0cml4IiwidGltZXNWZWN0b3I0IiwidmVjdG9yNCIsIngiLCJ5IiwieiIsInciLCJ0aW1lc1ZlY3RvcjMiLCJ2ZWN0b3IzIiwidG9WZWN0b3I0IiwidG9WZWN0b3IzIiwidGltZXNUcmFuc3Bvc2VWZWN0b3I0IiwidGltZXNUcmFuc3Bvc2VWZWN0b3IzIiwidGltZXNSZWxhdGl2ZVZlY3RvcjMiLCJkZXRlcm1pbmFudCIsInRvU3RyaW5nIiwibWFrZUltbXV0YWJsZSIsImFzc2VydCIsImNvcHlUb0FycmF5IiwiYXJyYXkiLCJpZGVudGl0eSIsInRyYW5zbGF0aW9uRnJvbVZlY3RvciIsInZlY3RvciIsInNjYWxpbmciLCJyb3RhdGlvbkF4aXNBbmdsZSIsImF4aXMiLCJhbmdsZSIsImMiLCJjb3MiLCJzIiwic2luIiwiQyIsInJvdGF0aW9uWCIsInJvdGF0aW9uWSIsInJvdGF0aW9uWiIsImdsdVBlcnNwZWN0aXZlIiwiZm92WVJhZGlhbnMiLCJhc3BlY3QiLCJ6TmVhciIsInpGYXIiLCJjb3RhbmdlbnQiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIiwiZW51bWVyYXRpb24iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsb0NBQW9D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QUM5TyxBQUFFLENBQUEsQ0FBQyxJQUFJLENBQUNyQyxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRSxHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDVSxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDTixHQUFHLEtBQUssSUFBSSxDQUFDYSxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDYSxHQUFHLEtBQUssSUFBSSxDQUFDZCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEVBQUMsSUFBTW1DLEtBQy9PLEFBQUUsQ0FBQSxJQUFJLENBQUN6QyxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRSxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDTixHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDVixHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEVBQUMsSUFBTXVDLEtBQzlPLEFBQUUsQ0FBQSxJQUFJLENBQUN0QyxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDQyxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDTixHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDVSxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEVBQUMsSUFBTW1DLEtBQzlPLEFBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQ3RDLEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FBSyxJQUFJLENBQUNYLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNWLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNYLEdBQUcsS0FBSyxJQUFJLENBQUNjLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNOLEdBQUcsS0FBSyxJQUFJLENBQUNhLEdBQUcsS0FBSyxJQUFJLENBQUNmLEdBQUcsS0FBSyxJQUFJLENBQUNVLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsRUFBQyxJQUFNbUMsS0FDL08sQUFBRSxDQUFBLElBQUksQ0FBQ3RDLEdBQUcsS0FBSyxJQUFJLENBQUNOLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNDLEdBQUcsS0FBSyxJQUFJLENBQUNVLEdBQUcsS0FBSyxJQUFJLENBQUNYLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNWLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNjLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNhLEdBQUcsS0FBSyxJQUFJLENBQUNmLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsRUFBQyxJQUFNbUMsS0FDOU8sQUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDMUMsR0FBRyxLQUFLLElBQUksQ0FBQ0YsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ0MsR0FBRyxLQUFLLElBQUksQ0FBQ00sR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ04sR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ1UsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ0YsR0FBRyxLQUFLLElBQUksQ0FBQ1MsR0FBRyxLQUFLLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ00sR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxFQUFDLElBQU11QyxLQUMvTyxBQUFFLENBQUEsQ0FBQyxJQUFJLENBQUN0QyxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDQyxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDTixHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDVSxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEVBQUMsSUFBTW1DLEtBQy9PLEFBQUUsQ0FBQSxJQUFJLENBQUN0QyxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDTixHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDVixHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDVSxHQUFHLEtBQUssSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDYSxHQUFHLEtBQUssSUFBSSxDQUFDRixHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtBQUssSUFBSSxDQUFDYyxHQUFHLEtBQUssSUFBSSxDQUFDZixHQUFHLEtBQUssSUFBSSxDQUFDUyxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEVBQUMsSUFBTW1DLEtBQzlPLEFBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQ3RDLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNDLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNWLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNYLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNhLEdBQUcsS0FBSyxJQUFJLENBQUNOLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNjLEdBQUcsS0FBSyxJQUFJLENBQUNmLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNVLEdBQUcsRUFBQyxJQUFNbUMsS0FDL08sQUFBRSxDQUFBLElBQUksQ0FBQzFDLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNDLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNOLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNVLEdBQUcsS0FBSyxJQUFJLENBQUNYLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsRUFBQyxJQUFNdUMsS0FDOU8sQUFBRSxDQUFBLElBQUksQ0FBQ3RDLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNFLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FBSyxJQUFJLENBQUNQLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNOLEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNGLEdBQUcsS0FBSyxJQUFJLENBQUNILEdBQUcsS0FBSyxJQUFJLENBQUNTLEdBQUcsS0FBSyxJQUFJLENBQUNWLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsRUFBQyxJQUFNb0MsS0FDOU8sQUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDdEMsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ00sR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ1UsR0FBRyxLQUFLLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ1MsR0FBRyxLQUFLLElBQUksQ0FBQ1YsR0FBRyxLQUFLLElBQUksQ0FBQ2EsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ0YsR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ2EsR0FBRyxLQUFLLElBQUksQ0FBQ2QsR0FBRyxLQUFLLElBQUksQ0FBQ1MsR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxFQUFDLElBQU1vQyxLQUMvTyxBQUFFLENBQUEsSUFBSSxDQUFDdEMsR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ0UsR0FBRyxLQUFLLElBQUksQ0FBQ1MsR0FBRyxLQUFLLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ1UsR0FBRyxLQUFLLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ04sR0FBRyxLQUFLLElBQUksQ0FBQ2EsR0FBRyxLQUFLLElBQUksQ0FBQ1AsR0FBRyxLQUFLLElBQUksQ0FBQ0YsR0FBRyxLQUFLLElBQUksQ0FBQ0gsR0FBRyxLQUFLLElBQUksQ0FBQ2EsR0FBRyxLQUFLLElBQUksQ0FBQ2QsR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ1MsR0FBRyxFQUFDLElBQU1vQyxLQUM5TyxBQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMxQyxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDSCxHQUFHLEtBQUssSUFBSSxDQUFDRSxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDUCxHQUFHLEtB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Q0MsR0FBRyxLQUMvQyxJQUFJLENBQUNULEdBQUcsS0FBSyxJQUFJLENBQUNHLEdBQUcsS0FBSyxJQUFJLENBQUNFLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FDL0MsSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQUssSUFBSSxDQUFDQyxHQUFHLEtBQUssSUFBSSxDQUFDSyxHQUFHLEtBQy9DLElBQUksQ0FBQ1YsR0FBRyxLQUFLLElBQUksQ0FBQ0MsR0FBRyxLQUFLLElBQUksQ0FBQ00sR0FBRyxLQUFLLElBQUksQ0FBQ0csR0FBRyxLQUMvQyxJQUFJLENBQUNiLEdBQUcsS0FBSyxJQUFJLENBQUNPLEdBQUcsS0FBSyxJQUFJLENBQUNHLEdBQUcsS0FBSyxJQUFJLENBQUNHLEdBQUcsS0FDL0MsSUFBSSxDQUFDWCxHQUFHLEtBQUssSUFBSSxDQUFDRSxHQUFHLEtBQUssSUFBSSxDQUFDTyxHQUFHLEtBQUssSUFBSSxDQUFDRSxHQUFHLEtBQy9DLElBQUksQ0FBQ2IsR0FBRyxLQUFLLElBQUksQ0FBQ00sR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ0UsR0FBRyxLQUMvQyxJQUFJLENBQUNWLEdBQUcsS0FBSyxJQUFJLENBQUNFLEdBQUcsS0FBSyxJQUFJLENBQUNHLEdBQUcsS0FBSyxJQUFJLENBQUNNLEdBQUcsS0FDL0MsSUFBSSxDQUFDYixHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQUssSUFBSSxDQUFDQyxHQUFHLEtBQUssSUFBSSxDQUFDTSxHQUFHLEtBQy9DLElBQUksQ0FBQ1gsR0FBRyxLQUFLLElBQUksQ0FBQ0MsR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUFLLElBQUksQ0FBQ0ssR0FBRyxLQUMvQyxJQUFJLENBQUNkLEdBQUcsS0FBSyxJQUFJLENBQUNPLEdBQUcsS0FBSyxJQUFJLENBQUNFLEdBQUcsS0FBSyxJQUFJLENBQUNLLEdBQUcsS0FDL0MsSUFBSSxDQUFDYixHQUFHLEtBQUssSUFBSSxDQUFDRyxHQUFH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