// Copyright 2013-2024, University of Colorado Boulder
/**
 * 3-dimensional Matrix
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import Pool from '../../phet-core/js/Pool.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import EnumerationIO from '../../tandem/js/types/EnumerationIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import dot from './dot.js';
import Matrix4 from './Matrix4.js';
import toSVGNumber from './toSVGNumber.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';
export class Matrix3Type extends EnumerationValue {
}
Matrix3Type.OTHER = new Matrix3Type();
Matrix3Type.IDENTITY = new Matrix3Type();
Matrix3Type.TRANSLATION_2D = new Matrix3Type();
Matrix3Type.SCALING = new Matrix3Type();
Matrix3Type.AFFINE = new Matrix3Type();
Matrix3Type.enumeration = new Enumeration(Matrix3Type);
let Matrix3 = class Matrix3 {
    initialize() {
        return this;
    }
    /**
   * Convenience getter for the individual 0,0 entry of the matrix.
   */ m00() {
        return this.entries[0];
    }
    /**
   * Convenience getter for the individual 0,1 entry of the matrix.
   */ m01() {
        return this.entries[3];
    }
    /**
   * Convenience getter for the individual 0,2 entry of the matrix.
   */ m02() {
        return this.entries[6];
    }
    /**
   * Convenience getter for the individual 1,0 entry of the matrix.
   */ m10() {
        return this.entries[1];
    }
    /**
   * Convenience getter for the individual 1,1 entry of the matrix.
   */ m11() {
        return this.entries[4];
    }
    /**
   * Convenience getter for the individual 1,2 entry of the matrix.
   */ m12() {
        return this.entries[7];
    }
    /**
   * Convenience getter for the individual 2,0 entry of the matrix.
   */ m20() {
        return this.entries[2];
    }
    /**
   * Convenience getter for the individual 2,1 entry of the matrix.
   */ m21() {
        return this.entries[5];
    }
    /**
   * Convenience getter for the individual 2,2 entry of the matrix.
   */ m22() {
        return this.entries[8];
    }
    /**
   * Returns whether this matrix is an identity matrix.
   */ isIdentity() {
        return this.type === Matrix3Type.IDENTITY || this.equals(Matrix3.IDENTITY);
    }
    /**
   * Returns whether this matrix is likely to be an identity matrix (returning false means "inconclusive, may be
   * identity or not"), but true is guaranteed to be an identity matrix.
   */ isFastIdentity() {
        return this.type === Matrix3Type.IDENTITY;
    }
    /**
   * Returns whether this matrix is a translation matrix.
   * By this we mean it has no shear, rotation, or scaling
   * It may be a translation of zero.
   */ isTranslation() {
        return this.type === Matrix3Type.TRANSLATION_2D || this.m00() === 1 && this.m11() === 1 && this.m22() === 1 && this.m01() === 0 && this.m10() === 0 && this.m20() === 0 && this.m21() === 0;
    }
    /**
   * Returns whether this matrix is an affine matrix (e.g. no shear).
   */ isAffine() {
        return this.type === Matrix3Type.AFFINE || this.m20() === 0 && this.m21() === 0 && this.m22() === 1;
    }
    /**
   * Returns whether it's an affine matrix where the components of transforms are independent, i.e. constructed from
   * arbitrary component scaling and translation.
   */ isAligned() {
        // non-diagonal non-translation entries should all be zero.
        return this.isAffine() && this.m01() === 0 && this.m10() === 0;
    }
    /**
   * Returns if it's an affine matrix where the components of transforms are independent, but may be switched (unlike isAligned)
   *
   * i.e. the 2x2 rotational sub-matrix is of one of the two forms:
   * A 0  or  0  A
   * 0 B      B  0
   * This means that moving a transformed point by (x,0) or (0,y) will result in a motion along one of the axes.
   */ isAxisAligned() {
        return this.isAffine() && (this.m01() === 0 && this.m10() === 0 || this.m00() === 0 && this.m11() === 0);
    }
    /**
   * Returns whether every single entry in this matrix is a finite number (non-NaN, non-infinite).
   */ isFinite() {
        return isFinite(this.m00()) && isFinite(this.m01()) && isFinite(this.m02()) && isFinite(this.m10()) && isFinite(this.m11()) && isFinite(this.m12()) && isFinite(this.m20()) && isFinite(this.m21()) && isFinite(this.m22());
    }
    /**
   * Returns the determinant of this matrix.
   */ getDeterminant() {
        return this.m00() * this.m11() * this.m22() + this.m01() * this.m12() * this.m20() + this.m02() * this.m10() * this.m21() - this.m02() * this.m11() * this.m20() - this.m01() * this.m10() * this.m22() - this.m00() * this.m12() * this.m21();
    }
    get determinant() {
        return this.getDeterminant();
    }
    /**
   * Returns the 2D translation, assuming multiplication with a homogeneous vector
   */ getTranslation() {
        return new Vector2(this.m02(), this.m12());
    }
    get translation() {
        return this.getTranslation();
    }
    /**
   * Returns a vector that is equivalent to ( T(1,0).magnitude(), T(0,1).magnitude() ) where T is a relative transform
   */ getScaleVector() {
        return new Vector2(Math.sqrt(this.m00() * this.m00() + this.m10() * this.m10()), Math.sqrt(this.m01() * this.m01() + this.m11() * this.m11()));
    }
    get scaleVector() {
        return this.getScaleVector();
    }
    /**
   * Returns the total "amount" of scaled area in this matrix (which will be negative if it flips the coordinate system).
   * For instance, Matrix3.scaling( 2 ) will return 4, since it scales the area by 4.
   */ getSignedScale() {
        // It's the cross product of untranslated-transformed-(1,0) and untranslated-transformed-(0,1)
        return this.m00() * this.m11() - this.m10() * this.m01();
    }
    /**
   * Returns the angle in radians for the 2d rotation from this matrix, between pi, -pi
   */ getRotation() {
        return Math.atan2(this.m10(), this.m00());
    }
    get rotation() {
        return this.getRotation();
    }
    /**
   * Returns an identity-padded copy of this matrix with an increased dimension.
   */ toMatrix4() {
        return new Matrix4(this.m00(), this.m01(), this.m02(), 0, this.m10(), this.m11(), this.m12(), 0, this.m20(), this.m21(), this.m22(), 0, 0, 0, 0, 1);
    }
    /**
   * Returns an identity-padded copy of this matrix with an increased dimension, treating this matrix's affine
   * components only.
   */ toAffineMatrix4() {
        return new Matrix4(this.m00(), this.m01(), 0, this.m02(), this.m10(), this.m11(), 0, this.m12(), 0, 0, 1, 0, 0, 0, 0, 1);
    }
    /**
   * Returns a string form of this object
   */ toString() {
        return `${this.m00()} ${this.m01()} ${this.m02()}\n${this.m10()} ${this.m11()} ${this.m12()}\n${this.m20()} ${this.m21()} ${this.m22()}`;
    }
    /**
   * Creates an SVG form of this matrix, for high-performance processing in SVG output.
   */ toSVGMatrix() {
        const result = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
        // top two rows
        result.a = this.m00();
        result.b = this.m10();
        result.c = this.m01();
        result.d = this.m11();
        result.e = this.m02();
        result.f = this.m12();
        return result;
    }
    /**
   * Returns the CSS form (simplified if possible) for this transformation matrix.
   */ getCSSTransform() {
        // See http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility
        // We need to prevent the numbers from being in an exponential toString form, since the CSS transform does not support that
        // 20 is the largest guaranteed number of digits according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
        // See https://github.com/phetsims/dot/issues/36
        // the inner part of a CSS3 transform, but remember to add the browser-specific parts!
        // NOTE: the toFixed calls are inlined for performance reasons
        return `matrix(${this.entries[0].toFixed(20)},${this.entries[1].toFixed(20)},${this.entries[3].toFixed(20)},${this.entries[4].toFixed(20)},${this.entries[6].toFixed(20)},${this.entries[7].toFixed(20)})`; // eslint-disable-line phet/bad-sim-text
    }
    get cssTransform() {
        return this.getCSSTransform();
    }
    /**
   * Returns the CSS-like SVG matrix form for this transformation matrix.
   */ getSVGTransform() {
        // SVG transform presentation attribute. See http://www.w3.org/TR/SVG/coords.html#TransformAttribute
        switch(this.type){
            case Matrix3Type.IDENTITY:
                return '';
            case Matrix3Type.TRANSLATION_2D:
                return `translate(${toSVGNumber(this.entries[6])},${toSVGNumber(this.entries[7])})`;
            case Matrix3Type.SCALING:
                return `scale(${toSVGNumber(this.entries[0])}${this.entries[0] === this.entries[4] ? '' : `,${toSVGNumber(this.entries[4])}`})`;
            default:
                return `matrix(${toSVGNumber(this.entries[0])},${toSVGNumber(this.entries[1])},${toSVGNumber(this.entries[3])},${toSVGNumber(this.entries[4])},${toSVGNumber(this.entries[6])},${toSVGNumber(this.entries[7])})`;
        }
    }
    get svgTransform() {
        return this.getSVGTransform();
    }
    /**
   * Returns a parameter object suitable for use with jQuery's .css()
   */ getCSSTransformStyles() {
        const transformCSS = this.getCSSTransform();
        // notes on triggering hardware acceleration: http://creativejs.com/2011/12/day-2-gpu-accelerate-your-dom-elements/
        return {
            // force iOS hardware acceleration
            '-webkit-perspective': '1000',
            '-webkit-backface-visibility': 'hidden',
            '-webkit-transform': `${transformCSS} translateZ(0)`,
            '-moz-transform': `${transformCSS} translateZ(0)`,
            '-ms-transform': transformCSS,
            '-o-transform': transformCSS,
            transform: transformCSS,
            'transform-origin': 'top left',
            '-ms-transform-origin': 'top left' // TODO: do we need other platform-specific transform-origin styles? https://github.com/phetsims/dot/issues/96
        };
    }
    get cssTransformStyles() {
        return this.getCSSTransformStyles();
    }
    /**
   * Returns exact equality with another matrix
   */ equals(matrix) {
        return this.m00() === matrix.m00() && this.m01() === matrix.m01() && this.m02() === matrix.m02() && this.m10() === matrix.m10() && this.m11() === matrix.m11() && this.m12() === matrix.m12() && this.m20() === matrix.m20() && this.m21() === matrix.m21() && this.m22() === matrix.m22();
    }
    /**
   * Returns equality within a margin of error with another matrix
   */ equalsEpsilon(matrix, epsilon) {
        return Math.abs(this.m00() - matrix.m00()) < epsilon && Math.abs(this.m01() - matrix.m01()) < epsilon && Math.abs(this.m02() - matrix.m02()) < epsilon && Math.abs(this.m10() - matrix.m10()) < epsilon && Math.abs(this.m11() - matrix.m11()) < epsilon && Math.abs(this.m12() - matrix.m12()) < epsilon && Math.abs(this.m20() - matrix.m20()) < epsilon && Math.abs(this.m21() - matrix.m21()) < epsilon && Math.abs(this.m22() - matrix.m22()) < epsilon;
    }
    /*---------------------------------------------------------------------------*
   * Immutable operations (returns a new matrix)
   *----------------------------------------------------------------------------*/ /**
   * Returns a copy of this matrix
   */ copy() {
        return m3(this.m00(), this.m01(), this.m02(), this.m10(), this.m11(), this.m12(), this.m20(), this.m21(), this.m22(), this.type);
    }
    /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   */ plus(matrix) {
        return m3(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
    }
    /**
   * Returns a new matrix, defined by this matrix plus the provided matrix
   */ minus(matrix) {
        return m3(this.m00() - matrix.m00(), this.m01() - matrix.m01(), this.m02() - matrix.m02(), this.m10() - matrix.m10(), this.m11() - matrix.m11(), this.m12() - matrix.m12(), this.m20() - matrix.m20(), this.m21() - matrix.m21(), this.m22() - matrix.m22());
    }
    /**
   * Returns a transposed copy of this matrix
   */ transposed() {
        return m3(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING ? this.type : undefined);
    }
    /**
   * Returns a negated copy of this matrix
   */ negated() {
        return m3(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
    }
    /**
   * Returns an inverted copy of this matrix
   */ inverted() {
        let det;
        switch(this.type){
            case Matrix3Type.IDENTITY:
                return this;
            case Matrix3Type.TRANSLATION_2D:
                return m3(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            case Matrix3Type.SCALING:
                return m3(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
            case Matrix3Type.AFFINE:
                det = this.getDeterminant();
                if (det !== 0) {
                    return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
                } else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            case Matrix3Type.OTHER:
                det = this.getDeterminant();
                if (det !== 0) {
                    return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
                } else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            default:
                throw new Error(`Matrix3.inverted with unknown type: ${this.type}`);
        }
    }
    /**
   * Returns a matrix, defined by the multiplication of this * matrix.
   *
   * @param matrix
   * @returns - NOTE: this may be the same matrix!
   */ timesMatrix(matrix) {
        // I * M === M * I === M (the identity)
        if (this.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.IDENTITY) {
            return this.type === Matrix3Type.IDENTITY ? matrix : this;
        }
        if (this.type === matrix.type) {
            // currently two matrices of the same type will result in the same result type
            if (this.type === Matrix3Type.TRANSLATION_2D) {
                // faster combination of translations
                return m3(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            } else if (this.type === Matrix3Type.SCALING) {
                // faster combination of scaling
                return m3(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
            }
        }
        if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
            // currently two matrices that are anything but "other" are technically affine, and the result will be affine
            // affine case
            return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
        }
        // general case
        return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
    }
    /*---------------------------------------------------------------------------*
   * Immutable operations (returns new form of a parameter)
   *----------------------------------------------------------------------------*/ /**
   * Returns the multiplication of this matrix times the provided vector (treating this matrix as homogeneous, so that
   * it is the technical multiplication of (x,y,1)).
   */ timesVector2(vector2) {
        const x = this.m00() * vector2.x + this.m01() * vector2.y + this.m02();
        const y = this.m10() * vector2.x + this.m11() * vector2.y + this.m12();
        return new Vector2(x, y);
    }
    /**
   * Returns the multiplication of this matrix times the provided vector
   */ timesVector3(vector3) {
        const x = this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z;
        const y = this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z;
        const z = this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z;
        return new Vector3(x, y, z);
    }
    /**
   * Returns the multiplication of the transpose of this matrix times the provided vector (assuming the 2x2 quadrant)
   */ timesTransposeVector2(vector2) {
        const x = this.m00() * vector2.x + this.m10() * vector2.y;
        const y = this.m01() * vector2.x + this.m11() * vector2.y;
        return new Vector2(x, y);
    }
    /**
   * TODO: this operation seems to not work for transformDelta2, should be vetted https://github.com/phetsims/dot/issues/96
   */ timesRelativeVector2(vector2) {
        const x = this.m00() * vector2.x + this.m01() * vector2.y;
        const y = this.m10() * vector2.y + this.m11() * vector2.y;
        return new Vector2(x, y);
    }
    /*---------------------------------------------------------------------------*
   * Mutable operations (changes this matrix)
   *----------------------------------------------------------------------------*/ /**
   * Sets the entire state of the matrix, in row-major order.
   *
   * NOTE: Every mutable method goes through rowMajor
   */ rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
        this.entries[0] = v00;
        this.entries[1] = v10;
        this.entries[2] = v20;
        this.entries[3] = v01;
        this.entries[4] = v11;
        this.entries[5] = v21;
        this.entries[6] = v02;
        this.entries[7] = v12;
        this.entries[8] = v22;
        // TODO: consider performance of the affine check here https://github.com/phetsims/dot/issues/96
        this.type = type === undefined ? v20 === 0 && v21 === 0 && v22 === 1 ? Matrix3Type.AFFINE : Matrix3Type.OTHER : type;
        return this;
    }
    /**
   * Sets this matrix to be a copy of another matrix.
   */ set(matrix) {
        return this.rowMajor(matrix.m00(), matrix.m01(), matrix.m02(), matrix.m10(), matrix.m11(), matrix.m12(), matrix.m20(), matrix.m21(), matrix.m22(), matrix.type);
    }
    /**
   * Sets this matrix to be a copy of the column-major data stored in an array (e.g. WebGL).
   */ setArray(array) {
        return this.rowMajor(array[0], array[3], array[6], array[1], array[4], array[7], array[2], array[5], array[8]);
    }
    /**
   * Sets the individual 0,0 component of this matrix.
   */ set00(value) {
        this.entries[0] = value;
        return this;
    }
    /**
   * Sets the individual 0,1 component of this matrix.
   */ set01(value) {
        this.entries[3] = value;
        return this;
    }
    /**
   * Sets the individual 0,2 component of this matrix.
   */ set02(value) {
        this.entries[6] = value;
        return this;
    }
    /**
   * Sets the individual 1,0 component of this matrix.
   */ set10(value) {
        this.entries[1] = value;
        return this;
    }
    /**
   * Sets the individual 1,1 component of this matrix.
   */ set11(value) {
        this.entries[4] = value;
        return this;
    }
    /**
   * Sets the individual 1,2 component of this matrix.
   */ set12(value) {
        this.entries[7] = value;
        return this;
    }
    /**
   * Sets the individual 2,0 component of this matrix.
   */ set20(value) {
        this.entries[2] = value;
        return this;
    }
    /**
   * Sets the individual 2,1 component of this matrix.
   */ set21(value) {
        this.entries[5] = value;
        return this;
    }
    /**
   * Sets the individual 2,2 component of this matrix.
   */ set22(value) {
        this.entries[8] = value;
        return this;
    }
    /**
   * Makes this matrix effectively immutable to the normal methods (except direct setters?)
   */ makeImmutable() {
        if (assert) {
            this.rowMajor = ()=>{
                throw new Error('Cannot modify immutable matrix');
            };
        }
        return this;
    }
    /**
   * Sets the entire state of the matrix, in column-major order.
   */ columnMajor(v00, v10, v20, v01, v11, v21, v02, v12, v22, type) {
        return this.rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
    }
    /**
   * Sets this matrix to itself plus the given matrix.
   */ add(matrix) {
        return this.rowMajor(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
    }
    /**
   * Sets this matrix to itself minus the given matrix.
   */ subtract(m) {
        return this.rowMajor(this.m00() - m.m00(), this.m01() - m.m01(), this.m02() - m.m02(), this.m10() - m.m10(), this.m11() - m.m11(), this.m12() - m.m12(), this.m20() - m.m20(), this.m21() - m.m21(), this.m22() - m.m22());
    }
    /**
   * Sets this matrix to its own transpose.
   */ transpose() {
        return this.rowMajor(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING ? this.type : undefined);
    }
    /**
   * Sets this matrix to its own negation.
   */ negate() {
        return this.rowMajor(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
    }
    /**
   * Sets this matrix to its own inverse.
   */ invert() {
        let det;
        switch(this.type){
            case Matrix3Type.IDENTITY:
                return this;
            case Matrix3Type.TRANSLATION_2D:
                return this.rowMajor(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            case Matrix3Type.SCALING:
                return this.rowMajor(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
            case Matrix3Type.AFFINE:
                det = this.getDeterminant();
                if (det !== 0) {
                    return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
                } else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            case Matrix3Type.OTHER:
                det = this.getDeterminant();
                if (det !== 0) {
                    return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
                } else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            default:
                throw new Error(`Matrix3.inverted with unknown type: ${this.type}`);
        }
    }
    /**
   * Sets this matrix to the value of itself times the provided matrix
   */ multiplyMatrix(matrix) {
        // M * I === M (the identity)
        if (matrix.type === Matrix3Type.IDENTITY) {
            // no change needed
            return this;
        }
        // I * M === M (the identity)
        if (this.type === Matrix3Type.IDENTITY) {
            // copy the other matrix to us
            return this.set(matrix);
        }
        if (this.type === matrix.type) {
            // currently two matrices of the same type will result in the same result type
            if (this.type === Matrix3Type.TRANSLATION_2D) {
                // faster combination of translations
                return this.rowMajor(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            } else if (this.type === Matrix3Type.SCALING) {
                // faster combination of scaling
                return this.rowMajor(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
            }
        }
        if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
            // currently two matrices that are anything but "other" are technically affine, and the result will be affine
            // affine case
            return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
        }
        // general case
        return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
    }
    /**
   * Mutates this matrix, equivalent to (translation * this).
   */ prependTranslation(x, y) {
        this.set02(this.m02() + x);
        this.set12(this.m12() + y);
        if (this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.TRANSLATION_2D) {
            this.type = Matrix3Type.TRANSLATION_2D;
        } else if (this.type === Matrix3Type.OTHER) {
            this.type = Matrix3Type.OTHER;
        } else {
            this.type = Matrix3Type.AFFINE;
        }
        return this; // for chaining
    }
    /**
   * Sets this matrix to the 3x3 identity matrix.
   */ setToIdentity() {
        return this.rowMajor(1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.IDENTITY);
    }
    /**
   * Sets this matrix to the affine translation matrix.
   */ setToTranslation(x, y) {
        return this.rowMajor(1, 0, x, 0, 1, y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
    }
    /**
   * Sets this matrix to the affine scaling matrix.
   */ setToScale(x, y) {
        // allow using one parameter to scale everything
        y = y === undefined ? x : y;
        return this.rowMajor(x, 0, 0, 0, y, 0, 0, 0, 1, Matrix3Type.SCALING);
    }
    /**
   * Sets this matrix to an affine matrix with the specified row-major values.
   */ setToAffine(m00, m01, m02, m10, m11, m12) {
        return this.rowMajor(m00, m01, m02, m10, m11, m12, 0, 0, 1, Matrix3Type.AFFINE);
    }
    /**
   * Sets the matrix to a rotation defined by a rotation of the specified angle around the given unit axis.
   *
   * @param axis - normalized
   * @param angle - in radians
   */ setToRotationAxisAngle(axis, angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        const C = 1 - c;
        return this.rowMajor(axis.x * axis.x * C + c, axis.x * axis.y * C - axis.z * s, axis.x * axis.z * C + axis.y * s, axis.y * axis.x * C + axis.z * s, axis.y * axis.y * C + c, axis.y * axis.z * C - axis.x * s, axis.z * axis.x * C - axis.y * s, axis.z * axis.y * C + axis.x * s, axis.z * axis.z * C + c, Matrix3Type.OTHER);
    }
    /**
   * Sets this matrix to a rotation around the x axis (in the yz plane).
   *
   * @param angle - in radians
   */ setToRotationX(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(1, 0, 0, 0, c, -s, 0, s, c, Matrix3Type.OTHER);
    }
    /**
   * Sets this matrix to a rotation around the y axis (in the xz plane).
   *
   * @param angle - in radians
   */ setToRotationY(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, 0, s, 0, 1, 0, -s, 0, c, Matrix3Type.OTHER);
    }
    /**
   * Sets this matrix to a rotation around the z axis (in the xy plane).
   *
   * @param angle - in radians
   */ setToRotationZ(angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, -s, 0, s, c, 0, 0, 0, 1, Matrix3Type.AFFINE);
    }
    /**
   * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
   * would be translated).
   *
   * @param x
   * @param y
   * @param angle - in radians
   */ setToTranslationRotation(x, y, angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, -s, x, s, c, y, 0, 0, 1, Matrix3Type.AFFINE);
    }
    /**
   * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
   * would be translated).
   *
   * @param translation
   * @param angle - in radians
   */ setToTranslationRotationPoint(translation, angle) {
        return this.setToTranslationRotation(translation.x, translation.y, angle);
    }
    /**
   * Sets this matrix to the combined scale+translation+rotation.
   *
   * The order of operations is scale, then rotate, then translate.
   *
   * @param x
   * @param y
   * @param angle - in radians
   */ setToScaleTranslationRotation(scale, x, y, angle) {
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        c *= scale;
        s *= scale;
        return this.rowMajor(c, -s, x, s, c, y, 0, 0, 1, Matrix3Type.AFFINE);
    }
    /**
   * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
   * would be translated).
   *
   * @param translation
   * @param angle - in radians
   */ setToScaleTranslationRotationPoint(scale, translation, angle) {
        return this.setToScaleTranslationRotation(scale, translation.x, translation.y, angle);
    }
    /**
   * Sets this matrix to the values contained in an SVGMatrix.
   */ setToSVGMatrix(svgMatrix) {
        return this.rowMajor(svgMatrix.a, svgMatrix.c, svgMatrix.e, svgMatrix.b, svgMatrix.d, svgMatrix.f, 0, 0, 1, Matrix3Type.AFFINE);
    }
    /**
   * Sets this matrix to a rotation matrix that rotates A to B (Vector3 instances), by rotating about the axis
   * A.cross( B ) -- Shortest path. ideally should be unit vectors.
   */ setRotationAToB(a, b) {
        // see http://graphics.cs.brown.edu/~jfh/papers/Moller-EBA-1999/paper.pdf for information on this implementation
        const start = a;
        const end = b;
        const epsilon = 0.0001;
        let v = start.cross(end);
        const e = start.dot(end);
        const f = e < 0 ? -e : e;
        // if "from" and "to" vectors are nearly parallel
        if (f > 1.0 - epsilon) {
            let x = new Vector3(start.x > 0.0 ? start.x : -start.x, start.y > 0.0 ? start.y : -start.y, start.z > 0.0 ? start.z : -start.z);
            if (x.x < x.y) {
                if (x.x < x.z) {
                    x = Vector3.X_UNIT;
                } else {
                    x = Vector3.Z_UNIT;
                }
            } else {
                if (x.y < x.z) {
                    x = Vector3.Y_UNIT;
                } else {
                    x = Vector3.Z_UNIT;
                }
            }
            const u = x.minus(start);
            v = x.minus(end);
            const c1 = 2.0 / u.dot(u);
            const c2 = 2.0 / v.dot(v);
            const c3 = c1 * c2 * u.dot(v);
            return this.rowMajor(-c1 * u.x * u.x - c2 * v.x * v.x + c3 * v.x * u.x + 1, -c1 * u.x * u.y - c2 * v.x * v.y + c3 * v.x * u.y, -c1 * u.x * u.z - c2 * v.x * v.z + c3 * v.x * u.z, -c1 * u.y * u.x - c2 * v.y * v.x + c3 * v.y * u.x, -c1 * u.y * u.y - c2 * v.y * v.y + c3 * v.y * u.y + 1, -c1 * u.y * u.z - c2 * v.y * v.z + c3 * v.y * u.z, -c1 * u.z * u.x - c2 * v.z * v.x + c3 * v.z * u.x, -c1 * u.z * u.y - c2 * v.z * v.y + c3 * v.z * u.y, -c1 * u.z * u.z - c2 * v.z * v.z + c3 * v.z * u.z + 1);
        } else {
            // the most common case, unless "start"="end", or "start"=-"end"
            const h = 1.0 / (1.0 + e);
            const hvx = h * v.x;
            const hvz = h * v.z;
            const hvxy = hvx * v.y;
            const hvxz = hvx * v.z;
            const hvyz = hvz * v.y;
            return this.rowMajor(e + hvx * v.x, hvxy - v.z, hvxz + v.y, hvxy + v.z, e + h * v.y * v.y, hvyz - v.x, hvxz - v.y, hvyz + v.x, e + hvz * v.z);
        }
    }
    /*---------------------------------------------------------------------------*
   * Mutable operations (changes the parameter)
   *----------------------------------------------------------------------------*/ /**
   * Sets the vector to the result of (matrix * vector), as a homogeneous multiplication.
   *
   * @returns - The vector that was mutated
   */ multiplyVector2(vector2) {
        return vector2.setXY(this.m00() * vector2.x + this.m01() * vector2.y + this.m02(), this.m10() * vector2.x + this.m11() * vector2.y + this.m12());
    }
    /**
   * Sets the vector to the result of (matrix * vector).
   *
   * @returns - The vector that was mutated
   */ multiplyVector3(vector3) {
        return vector3.setXYZ(this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z, this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z, this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z);
    }
    /**
   * Sets the vector to the result of (transpose(matrix) * vector), ignoring the translation parameters.
   *
   * @returns - The vector that was mutated
   */ multiplyTransposeVector2(v) {
        return v.setXY(this.m00() * v.x + this.m10() * v.y, this.m01() * v.x + this.m11() * v.y);
    }
    /**
   * Sets the vector to the result of (matrix * vector - matrix * zero). Since this is a homogeneous operation, it is
   * equivalent to the multiplication of (x,y,0).
   *
   * @returns - The vector that was mutated
   */ multiplyRelativeVector2(v) {
        return v.setXY(this.m00() * v.x + this.m01() * v.y, this.m10() * v.y + this.m11() * v.y);
    }
    /**
   * Sets the transform of a Canvas 2D rendering context to the affine part of this matrix
   */ canvasSetTransform(context) {
        context.setTransform(// inlined array entries
        this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
    }
    /**
   * Appends to the affine part of this matrix to the Canvas 2D rendering context
   */ canvasAppendTransform(context) {
        if (this.type !== Matrix3Type.IDENTITY) {
            context.transform(// inlined array entries
            this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
        }
    }
    /**
   * Copies the entries of this matrix over to an arbitrary array (typed or normal).
   */ copyToArray(array) {
        array[0] = this.m00();
        array[1] = this.m10();
        array[2] = this.m20();
        array[3] = this.m01();
        array[4] = this.m11();
        array[5] = this.m21();
        array[6] = this.m02();
        array[7] = this.m12();
        array[8] = this.m22();
        return array;
    }
    freeToPool() {
        Matrix3.pool.freeToPool(this);
    }
    /**
   * Returns an identity matrix.
   */ static identity() {
        return fromPool().setToIdentity();
    }
    /**
   * Returns a translation matrix.
   */ static translation(x, y) {
        return fromPool().setToTranslation(x, y);
    }
    /**
   * Returns a translation matrix computed from a vector.
   */ static translationFromVector(vector) {
        return Matrix3.translation(vector.x, vector.y);
    }
    /**
   * Returns a matrix that scales things in each dimension.
   */ static scaling(x, y) {
        return fromPool().setToScale(x, y);
    }
    /**
   * Returns a matrix that scales things in each dimension.
   */ static scale(x, y) {
        return Matrix3.scaling(x, y);
    }
    /**
   * Returns an affine matrix with the given parameters.
   */ static affine(m00, m01, m02, m10, m11, m12) {
        return fromPool().setToAffine(m00, m01, m02, m10, m11, m12);
    }
    /**
   * Creates a new matrix with all entries determined in row-major order.
   */ static rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
        return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
    }
    /**
   * Returns a matrix rotation defined by a rotation of the specified angle around the given unit axis.
   *
   * @param axis - normalized
   * @param angle - in radians
   */ static rotationAxisAngle(axis, angle) {
        return fromPool().setToRotationAxisAngle(axis, angle);
    }
    /**
   * Returns a matrix that rotates around the x axis (in the yz plane).
   *
   * @param angle - in radians
   */ static rotationX(angle) {
        return fromPool().setToRotationX(angle);
    }
    /**
   * Returns a matrix that rotates around the y axis (in the xz plane).
   *
   * @param angle - in radians
   */ static rotationY(angle) {
        return fromPool().setToRotationY(angle);
    }
    /**
   * Returns a matrix that rotates around the z axis (in the xy plane).
   *
   * @param angle - in radians
   */ static rotationZ(angle) {
        return fromPool().setToRotationZ(angle);
    }
    /**
   * Returns a combined 2d translation + rotation (with the rotation effectively applied first).
   *
   * @param angle - in radians
   */ static translationRotation(x, y, angle) {
        return fromPool().setToTranslationRotation(x, y, angle);
    }
    /**
   * Standard 2d rotation matrix for a given angle.
   *
   * @param angle - in radians
   */ static rotation2(angle) {
        return fromPool().setToRotationZ(angle);
    }
    /**
   * Returns a matrix which will be a 2d rotation around a given x,y point.
   *
   * @param angle - in radians
   * @param x
   * @param y
   */ static rotationAround(angle, x, y) {
        return Matrix3.translation(x, y).timesMatrix(Matrix3.rotation2(angle)).timesMatrix(Matrix3.translation(-x, -y));
    }
    /**
   * Returns a matrix which will be a 2d rotation around a given 2d point.
   *
   * @param angle - in radians
   * @param point
   */ static rotationAroundPoint(angle, point) {
        return Matrix3.rotationAround(angle, point.x, point.y);
    }
    /**
   * Returns a matrix equivalent to a given SVGMatrix.
   */ static fromSVGMatrix(svgMatrix) {
        return fromPool().setToSVGMatrix(svgMatrix);
    }
    /**
   * Returns a rotation matrix that rotates A to B, by rotating about the axis A.cross( B ) -- Shortest path. ideally
   * should be unit vectors.
   */ static rotateAToB(a, b) {
        return fromPool().setRotationAToB(a, b);
    }
    /**
   * Shortcut for translation times a matrix (without allocating a translation matrix), see scenery#119
   */ static translationTimesMatrix(x, y, matrix) {
        let type;
        if (matrix.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.TRANSLATION_2D) {
            return m3(1, 0, matrix.m02() + x, 0, 1, matrix.m12() + y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
        } else if (matrix.type === Matrix3Type.OTHER) {
            type = Matrix3Type.OTHER;
        } else {
            type = Matrix3Type.AFFINE;
        }
        return m3(matrix.m00(), matrix.m01(), matrix.m02() + x, matrix.m10(), matrix.m11(), matrix.m12() + y, matrix.m20(), matrix.m21(), matrix.m22(), type);
    }
    /**
   * Serialize to an Object that can be handled by PhET-iO
   */ static toStateObject(matrix3) {
        return {
            entries: matrix3.entries,
            type: matrix3.type.name
        };
    }
    /**
   * Convert back from a serialized Object to a Matrix3
   */ static fromStateObject(stateObject) {
        const matrix = Matrix3.identity();
        matrix.entries = stateObject.entries;
        matrix.type = Matrix3Type.enumeration.getValue(stateObject.type);
        return matrix;
    }
    /**
   * Creates an identity matrix, that can then be mutated into the proper form.
   */ constructor(){
        //Make sure no clients are expecting to create a matrix with non-identity values
        assert && assert(arguments.length === 0, 'Matrix3 constructor should not be called with any arguments.  Use m3()/Matrix3.identity()/etc.');
        this.entries = [
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1
        ];
        this.type = Matrix3Type.IDENTITY;
    }
};
Matrix3.pool = new Pool(Matrix3, {
    initialize: Matrix3.prototype.initialize,
    useDefaultConstruction: true,
    maxSize: 300
});
export { Matrix3 as default };
dot.register('Matrix3', Matrix3);
const fromPool = Matrix3.pool.fetch.bind(Matrix3.pool);
const m3 = (v00, v01, v02, v10, v11, v12, v20, v21, v22, type)=>{
    return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
};
export { m3 };
dot.register('m3', m3);
Matrix3.IDENTITY = Matrix3.identity().makeImmutable();
Matrix3.X_REFLECTION = m3(-1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Y_REFLECTION = m3(1, 0, 0, 0, -1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Matrix3IO = new IOType('Matrix3IO', {
    valueType: Matrix3,
    documentation: 'A 3x3 matrix often used for holding transform data.',
    toStateObject: (matrix3)=>Matrix3.toStateObject(matrix3),
    fromStateObject: (x)=>Matrix3.fromStateObject(x),
    stateSchema: {
        entries: ArrayIO(NumberIO),
        type: EnumerationIO(Matrix3Type)
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIDMtZGltZW5zaW9uYWwgTWF0cml4XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0VudW1lcmF0aW9uSU8uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgTWF0cml4NCBmcm9tICcuL01hdHJpeDQuanMnO1xuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4vdG9TVkdOdW1iZXIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmV4cG9ydCBjbGFzcyBNYXRyaXgzVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9USEVSID0gbmV3IE1hdHJpeDNUeXBlKCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSURFTlRJVFkgPSBuZXcgTWF0cml4M1R5cGUoKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUUkFOU0xBVElPTl8yRCA9IG5ldyBNYXRyaXgzVHlwZSgpO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNDQUxJTkcgPSBuZXcgTWF0cml4M1R5cGUoKTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBRkZJTkUgPSBuZXcgTWF0cml4M1R5cGUoKTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBNYXRyaXgzVHlwZSApO1xufVxuXG50eXBlIE5pbmVOdW1iZXJzID0gW1xuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyLFxuICBudW1iZXIsIG51bWJlciwgbnVtYmVyXG5dO1xuXG5leHBvcnQgdHlwZSBNYXRyaXgzU3RhdGVPYmplY3QgPSB7XG4gIGVudHJpZXM6IE5pbmVOdW1iZXJzO1xuICB0eXBlOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXgzIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcblxuICAvLyBFbnRyaWVzIHN0b3JlZCBpbiBjb2x1bW4tbWFqb3IgZm9ybWF0XG4gIHB1YmxpYyBlbnRyaWVzOiBOaW5lTnVtYmVycztcblxuICBwdWJsaWMgdHlwZTogTWF0cml4M1R5cGU7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaWRlbnRpdHkgbWF0cml4LCB0aGF0IGNhbiB0aGVuIGJlIG11dGF0ZWQgaW50byB0aGUgcHJvcGVyIGZvcm0uXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgLy9NYWtlIHN1cmUgbm8gY2xpZW50cyBhcmUgZXhwZWN0aW5nIHRvIGNyZWF0ZSBhIG1hdHJpeCB3aXRoIG5vbi1pZGVudGl0eSB2YWx1ZXNcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAwLCAnTWF0cml4MyBjb25zdHJ1Y3RvciBzaG91bGQgbm90IGJlIGNhbGxlZCB3aXRoIGFueSBhcmd1bWVudHMuICBVc2UgbTMoKS9NYXRyaXgzLmlkZW50aXR5KCkvZXRjLicgKTtcblxuICAgIHRoaXMuZW50cmllcyA9IFsgMSwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMSBdO1xuICAgIHRoaXMudHlwZSA9IE1hdHJpeDNUeXBlLklERU5USVRZO1xuICB9XG5cbiAgcHVibGljIGluaXRpYWxpemUoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAwLDAgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMDAoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAwLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMDEoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAzIF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAwLDIgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMDIoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA2IF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAxLDAgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMTAoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAxIF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAxLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMTEoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA0IF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAxLDIgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMTIoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA3IF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAyLDAgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMjAoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyAyIF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAyLDEgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMjEoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA1IF07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVuaWVuY2UgZ2V0dGVyIGZvciB0aGUgaW5kaXZpZHVhbCAyLDIgZW50cnkgb2YgdGhlIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBtMjIoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyA4IF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGFuIGlkZW50aXR5IG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBpc0lkZW50aXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZIHx8IHRoaXMuZXF1YWxzKCBNYXRyaXgzLklERU5USVRZICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGxpa2VseSB0byBiZSBhbiBpZGVudGl0eSBtYXRyaXggKHJldHVybmluZyBmYWxzZSBtZWFucyBcImluY29uY2x1c2l2ZSwgbWF5IGJlXG4gICAqIGlkZW50aXR5IG9yIG5vdFwiKSwgYnV0IHRydWUgaXMgZ3VhcmFudGVlZCB0byBiZSBhbiBpZGVudGl0eSBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgaXNGYXN0SWRlbnRpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGEgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBCeSB0aGlzIHdlIG1lYW4gaXQgaGFzIG5vIHNoZWFyLCByb3RhdGlvbiwgb3Igc2NhbGluZ1xuICAgKiBJdCBtYXkgYmUgYSB0cmFuc2xhdGlvbiBvZiB6ZXJvLlxuICAgKi9cbiAgcHVibGljIGlzVHJhbnNsYXRpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgfHwgKCB0aGlzLm0wMCgpID09PSAxICYmIHRoaXMubTExKCkgPT09IDEgJiYgdGhpcy5tMjIoKSA9PT0gMSAmJiB0aGlzLm0wMSgpID09PSAwICYmIHRoaXMubTEwKCkgPT09IDAgJiYgdGhpcy5tMjAoKSA9PT0gMCAmJiB0aGlzLm0yMSgpID09PSAwICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgbWF0cml4IGlzIGFuIGFmZmluZSBtYXRyaXggKGUuZy4gbm8gc2hlYXIpLlxuICAgKi9cbiAgcHVibGljIGlzQWZmaW5lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLkFGRklORSB8fCAoIHRoaXMubTIwKCkgPT09IDAgJiYgdGhpcy5tMjEoKSA9PT0gMCAmJiB0aGlzLm0yMigpID09PSAxICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGl0J3MgYW4gYWZmaW5lIG1hdHJpeCB3aGVyZSB0aGUgY29tcG9uZW50cyBvZiB0cmFuc2Zvcm1zIGFyZSBpbmRlcGVuZGVudCwgaS5lLiBjb25zdHJ1Y3RlZCBmcm9tXG4gICAqIGFyYml0cmFyeSBjb21wb25lbnQgc2NhbGluZyBhbmQgdHJhbnNsYXRpb24uXG4gICAqL1xuICBwdWJsaWMgaXNBbGlnbmVkKCk6IGJvb2xlYW4ge1xuICAgIC8vIG5vbi1kaWFnb25hbCBub24tdHJhbnNsYXRpb24gZW50cmllcyBzaG91bGQgYWxsIGJlIHplcm8uXG4gICAgcmV0dXJuIHRoaXMuaXNBZmZpbmUoKSAmJiB0aGlzLm0wMSgpID09PSAwICYmIHRoaXMubTEwKCkgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiBpdCdzIGFuIGFmZmluZSBtYXRyaXggd2hlcmUgdGhlIGNvbXBvbmVudHMgb2YgdHJhbnNmb3JtcyBhcmUgaW5kZXBlbmRlbnQsIGJ1dCBtYXkgYmUgc3dpdGNoZWQgKHVubGlrZSBpc0FsaWduZWQpXG4gICAqXG4gICAqIGkuZS4gdGhlIDJ4MiByb3RhdGlvbmFsIHN1Yi1tYXRyaXggaXMgb2Ygb25lIG9mIHRoZSB0d28gZm9ybXM6XG4gICAqIEEgMCAgb3IgIDAgIEFcbiAgICogMCBCICAgICAgQiAgMFxuICAgKiBUaGlzIG1lYW5zIHRoYXQgbW92aW5nIGEgdHJhbnNmb3JtZWQgcG9pbnQgYnkgKHgsMCkgb3IgKDAseSkgd2lsbCByZXN1bHQgaW4gYSBtb3Rpb24gYWxvbmcgb25lIG9mIHRoZSBheGVzLlxuICAgKi9cbiAgcHVibGljIGlzQXhpc0FsaWduZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNBZmZpbmUoKSAmJiAoICggdGhpcy5tMDEoKSA9PT0gMCAmJiB0aGlzLm0xMCgpID09PSAwICkgfHwgKCB0aGlzLm0wMCgpID09PSAwICYmIHRoaXMubTExKCkgPT09IDAgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBldmVyeSBzaW5nbGUgZW50cnkgaW4gdGhpcyBtYXRyaXggaXMgYSBmaW5pdGUgbnVtYmVyIChub24tTmFOLCBub24taW5maW5pdGUpLlxuICAgKi9cbiAgcHVibGljIGlzRmluaXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBpc0Zpbml0ZSggdGhpcy5tMDAoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0wMSgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTAyKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMTAoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0xMSgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTEyKCkgKSAmJlxuICAgICAgICAgICBpc0Zpbml0ZSggdGhpcy5tMjAoKSApICYmXG4gICAgICAgICAgIGlzRmluaXRlKCB0aGlzLm0yMSgpICkgJiZcbiAgICAgICAgICAgaXNGaW5pdGUoIHRoaXMubTIyKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZXRlcm1pbmFudCBvZiB0aGlzIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBnZXREZXRlcm1pbmFudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm0wMCgpICogdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgKyB0aGlzLm0wMigpICogdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMigpICogdGhpcy5tMTEoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMTAoKSAqIHRoaXMubTIyKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMTIoKSAqIHRoaXMubTIxKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldERldGVybWluYW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgMkQgdHJhbnNsYXRpb24sIGFzc3VtaW5nIG11bHRpcGxpY2F0aW9uIHdpdGggYSBob21vZ2VuZW91cyB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBnZXRUcmFuc2xhdGlvbigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMubTAyKCksIHRoaXMubTEyKCkgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhbnNsYXRpb24oKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFRyYW5zbGF0aW9uKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHZlY3RvciB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gKCBUKDEsMCkubWFnbml0dWRlKCksIFQoMCwxKS5tYWduaXR1ZGUoKSApIHdoZXJlIFQgaXMgYSByZWxhdGl2ZSB0cmFuc2Zvcm1cbiAgICovXG4gIHB1YmxpYyBnZXRTY2FsZVZlY3RvcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoXG4gICAgICBNYXRoLnNxcnQoIHRoaXMubTAwKCkgKiB0aGlzLm0wMCgpICsgdGhpcy5tMTAoKSAqIHRoaXMubTEwKCkgKSxcbiAgICAgIE1hdGguc3FydCggdGhpcy5tMDEoKSAqIHRoaXMubTAxKCkgKyB0aGlzLm0xMSgpICogdGhpcy5tMTEoKSApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjYWxlVmVjdG9yKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTY2FsZVZlY3RvcigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRvdGFsIFwiYW1vdW50XCIgb2Ygc2NhbGVkIGFyZWEgaW4gdGhpcyBtYXRyaXggKHdoaWNoIHdpbGwgYmUgbmVnYXRpdmUgaWYgaXQgZmxpcHMgdGhlIGNvb3JkaW5hdGUgc3lzdGVtKS5cbiAgICogRm9yIGluc3RhbmNlLCBNYXRyaXgzLnNjYWxpbmcoIDIgKSB3aWxsIHJldHVybiA0LCBzaW5jZSBpdCBzY2FsZXMgdGhlIGFyZWEgYnkgNC5cbiAgICovXG4gIHB1YmxpYyBnZXRTaWduZWRTY2FsZSgpOiBudW1iZXIge1xuICAgIC8vIEl0J3MgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdW50cmFuc2xhdGVkLXRyYW5zZm9ybWVkLSgxLDApIGFuZCB1bnRyYW5zbGF0ZWQtdHJhbnNmb3JtZWQtKDAsMSlcbiAgICByZXR1cm4gdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMDEoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhbmdsZSBpbiByYWRpYW5zIGZvciB0aGUgMmQgcm90YXRpb24gZnJvbSB0aGlzIG1hdHJpeCwgYmV0d2VlbiBwaSwgLXBpXG4gICAqL1xuICBwdWJsaWMgZ2V0Um90YXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggdGhpcy5tMTAoKSwgdGhpcy5tMDAoKSApO1xuICB9XG5cbiAgcHVibGljIGdldCByb3RhdGlvbigpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSb3RhdGlvbigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaWRlbnRpdHktcGFkZGVkIGNvcHkgb2YgdGhpcyBtYXRyaXggd2l0aCBhbiBpbmNyZWFzZWQgZGltZW5zaW9uLlxuICAgKi9cbiAgcHVibGljIHRvTWF0cml4NCgpOiBNYXRyaXg0IHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeDQoXG4gICAgICB0aGlzLm0wMCgpLCB0aGlzLm0wMSgpLCB0aGlzLm0wMigpLCAwLFxuICAgICAgdGhpcy5tMTAoKSwgdGhpcy5tMTEoKSwgdGhpcy5tMTIoKSwgMCxcbiAgICAgIHRoaXMubTIwKCksIHRoaXMubTIxKCksIHRoaXMubTIyKCksIDAsXG4gICAgICAwLCAwLCAwLCAxICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpZGVudGl0eS1wYWRkZWQgY29weSBvZiB0aGlzIG1hdHJpeCB3aXRoIGFuIGluY3JlYXNlZCBkaW1lbnNpb24sIHRyZWF0aW5nIHRoaXMgbWF0cml4J3MgYWZmaW5lXG4gICAqIGNvbXBvbmVudHMgb25seS5cbiAgICovXG4gIHB1YmxpYyB0b0FmZmluZU1hdHJpeDQoKTogTWF0cml4NCB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXg0KFxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMDEoKSwgMCwgdGhpcy5tMDIoKSxcbiAgICAgIHRoaXMubTEwKCksIHRoaXMubTExKCksIDAsIHRoaXMubTEyKCksXG4gICAgICAwLCAwLCAxLCAwLFxuICAgICAgMCwgMCwgMCwgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMubTAwKCl9ICR7dGhpcy5tMDEoKX0gJHt0aGlzLm0wMigpfVxcbiR7XG4gICAgICB0aGlzLm0xMCgpfSAke3RoaXMubTExKCl9ICR7dGhpcy5tMTIoKX1cXG4ke1xuICAgICAgdGhpcy5tMjAoKX0gJHt0aGlzLm0yMSgpfSAke3RoaXMubTIyKCl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIFNWRyBmb3JtIG9mIHRoaXMgbWF0cml4LCBmb3IgaGlnaC1wZXJmb3JtYW5jZSBwcm9jZXNzaW5nIGluIFNWRyBvdXRwdXQuXG4gICAqL1xuICBwdWJsaWMgdG9TVkdNYXRyaXgoKTogU1ZHTWF0cml4IHtcbiAgICBjb25zdCByZXN1bHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnICkuY3JlYXRlU1ZHTWF0cml4KCk7XG5cbiAgICAvLyB0b3AgdHdvIHJvd3NcbiAgICByZXN1bHQuYSA9IHRoaXMubTAwKCk7XG4gICAgcmVzdWx0LmIgPSB0aGlzLm0xMCgpO1xuICAgIHJlc3VsdC5jID0gdGhpcy5tMDEoKTtcbiAgICByZXN1bHQuZCA9IHRoaXMubTExKCk7XG4gICAgcmVzdWx0LmUgPSB0aGlzLm0wMigpO1xuICAgIHJlc3VsdC5mID0gdGhpcy5tMTIoKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTIGZvcm0gKHNpbXBsaWZpZWQgaWYgcG9zc2libGUpIGZvciB0aGlzIHRyYW5zZm9ybWF0aW9uIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBnZXRDU1NUcmFuc2Zvcm0oKTogc3RyaW5nIHtcbiAgICAvLyBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy10cmFuc2Zvcm1zLywgcGFydGljdWxhcmx5IFNlY3Rpb24gMTMgdGhhdCBkaXNjdXNzZXMgdGhlIFNWRyBjb21wYXRpYmlsaXR5XG5cbiAgICAvLyBXZSBuZWVkIHRvIHByZXZlbnQgdGhlIG51bWJlcnMgZnJvbSBiZWluZyBpbiBhbiBleHBvbmVudGlhbCB0b1N0cmluZyBmb3JtLCBzaW5jZSB0aGUgQ1NTIHRyYW5zZm9ybSBkb2VzIG5vdCBzdXBwb3J0IHRoYXRcbiAgICAvLyAyMCBpcyB0aGUgbGFyZ2VzdCBndWFyYW50ZWVkIG51bWJlciBvZiBkaWdpdHMgYWNjb3JkaW5nIHRvIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyL3RvRml4ZWRcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvMzZcblxuICAgIC8vIHRoZSBpbm5lciBwYXJ0IG9mIGEgQ1NTMyB0cmFuc2Zvcm0sIGJ1dCByZW1lbWJlciB0byBhZGQgdGhlIGJyb3dzZXItc3BlY2lmaWMgcGFydHMhXG4gICAgLy8gTk9URTogdGhlIHRvRml4ZWQgY2FsbHMgYXJlIGlubGluZWQgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnNcbiAgICByZXR1cm4gYG1hdHJpeCgke3RoaXMuZW50cmllc1sgMCBdLnRvRml4ZWQoIDIwICl9LCR7dGhpcy5lbnRyaWVzWyAxIF0udG9GaXhlZCggMjAgKX0sJHt0aGlzLmVudHJpZXNbIDMgXS50b0ZpeGVkKCAyMCApfSwke3RoaXMuZW50cmllc1sgNCBdLnRvRml4ZWQoIDIwICl9LCR7dGhpcy5lbnRyaWVzWyA2IF0udG9GaXhlZCggMjAgKX0sJHt0aGlzLmVudHJpZXNbIDcgXS50b0ZpeGVkKCAyMCApfSlgOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNzc1RyYW5zZm9ybSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5nZXRDU1NUcmFuc2Zvcm0oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1MtbGlrZSBTVkcgbWF0cml4IGZvcm0gZm9yIHRoaXMgdHJhbnNmb3JtYXRpb24gbWF0cml4LlxuICAgKi9cbiAgcHVibGljIGdldFNWR1RyYW5zZm9ybSgpOiBzdHJpbmcge1xuICAgIC8vIFNWRyB0cmFuc2Zvcm0gcHJlc2VudGF0aW9uIGF0dHJpYnV0ZS4gU2VlIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9jb29yZHMuaHRtbCNUcmFuc2Zvcm1BdHRyaWJ1dGVcbiAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuSURFTlRJVFk6XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQ6XG4gICAgICAgIHJldHVybiBgdHJhbnNsYXRlKCR7dG9TVkdOdW1iZXIoIHRoaXMuZW50cmllc1sgNiBdICl9LCR7dG9TVkdOdW1iZXIoIHRoaXMuZW50cmllc1sgNyBdICl9KWA7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLlNDQUxJTkc6XG4gICAgICAgIHJldHVybiBgc2NhbGUoJHt0b1NWR051bWJlciggdGhpcy5lbnRyaWVzWyAwIF0gKX0ke3RoaXMuZW50cmllc1sgMCBdID09PSB0aGlzLmVudHJpZXNbIDQgXSA/ICcnIDogYCwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDQgXSApfWB9KWA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYG1hdHJpeCgke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDAgXSApfSwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDEgXSApfSwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDMgXSApfSwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDQgXSApfSwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDYgXSApfSwke3RvU1ZHTnVtYmVyKCB0aGlzLmVudHJpZXNbIDcgXSApfSlgO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3ZnVHJhbnNmb3JtKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmdldFNWR1RyYW5zZm9ybSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwYXJhbWV0ZXIgb2JqZWN0IHN1aXRhYmxlIGZvciB1c2Ugd2l0aCBqUXVlcnkncyAuY3NzKClcbiAgICovXG4gIHB1YmxpYyBnZXRDU1NUcmFuc2Zvcm1TdHlsZXMoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgdHJhbnNmb3JtQ1NTID0gdGhpcy5nZXRDU1NUcmFuc2Zvcm0oKTtcblxuICAgIC8vIG5vdGVzIG9uIHRyaWdnZXJpbmcgaGFyZHdhcmUgYWNjZWxlcmF0aW9uOiBodHRwOi8vY3JlYXRpdmVqcy5jb20vMjAxMS8xMi9kYXktMi1ncHUtYWNjZWxlcmF0ZS15b3VyLWRvbS1lbGVtZW50cy9cbiAgICByZXR1cm4ge1xuICAgICAgLy8gZm9yY2UgaU9TIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxuICAgICAgJy13ZWJraXQtcGVyc3BlY3RpdmUnOiAnMTAwMCcsXG4gICAgICAnLXdlYmtpdC1iYWNrZmFjZS12aXNpYmlsaXR5JzogJ2hpZGRlbicsXG5cbiAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6IGAke3RyYW5zZm9ybUNTU30gdHJhbnNsYXRlWigwKWAsIC8vIHRyaWdnZXIgaGFyZHdhcmUgYWNjZWxlcmF0aW9uIGlmIHBvc3NpYmxlXG4gICAgICAnLW1vei10cmFuc2Zvcm0nOiBgJHt0cmFuc2Zvcm1DU1N9IHRyYW5zbGF0ZVooMClgLCAvLyB0cmlnZ2VyIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBpZiBwb3NzaWJsZVxuICAgICAgJy1tcy10cmFuc2Zvcm0nOiB0cmFuc2Zvcm1DU1MsXG4gICAgICAnLW8tdHJhbnNmb3JtJzogdHJhbnNmb3JtQ1NTLFxuICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1DU1MsXG4gICAgICAndHJhbnNmb3JtLW9yaWdpbic6ICd0b3AgbGVmdCcsIC8vIGF0IHRoZSBvcmlnaW4gb2YgdGhlIGNvbXBvbmVudC4gY29uc2lkZXIgMHB4IDBweCBpbnN0ZWFkLiBDcml0aWNhbCwgc2luY2Ugb3RoZXJ3aXNlIHRoaXMgZGVmYXVsdHMgdG8gNTAlIDUwJSEhISBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9DU1MvdHJhbnNmb3JtLW9yaWdpblxuICAgICAgJy1tcy10cmFuc2Zvcm0tb3JpZ2luJzogJ3RvcCBsZWZ0JyAvLyBUT0RPOiBkbyB3ZSBuZWVkIG90aGVyIHBsYXRmb3JtLXNwZWNpZmljIHRyYW5zZm9ybS1vcmlnaW4gc3R5bGVzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNzc1RyYW5zZm9ybVN0eWxlcygpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHsgcmV0dXJuIHRoaXMuZ2V0Q1NTVHJhbnNmb3JtU3R5bGVzKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBleGFjdCBlcXVhbGl0eSB3aXRoIGFub3RoZXIgbWF0cml4XG4gICAqL1xuICBwdWJsaWMgZXF1YWxzKCBtYXRyaXg6IE1hdHJpeDMgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubTAwKCkgPT09IG1hdHJpeC5tMDAoKSAmJiB0aGlzLm0wMSgpID09PSBtYXRyaXgubTAxKCkgJiYgdGhpcy5tMDIoKSA9PT0gbWF0cml4Lm0wMigpICYmXG4gICAgICAgICAgIHRoaXMubTEwKCkgPT09IG1hdHJpeC5tMTAoKSAmJiB0aGlzLm0xMSgpID09PSBtYXRyaXgubTExKCkgJiYgdGhpcy5tMTIoKSA9PT0gbWF0cml4Lm0xMigpICYmXG4gICAgICAgICAgIHRoaXMubTIwKCkgPT09IG1hdHJpeC5tMjAoKSAmJiB0aGlzLm0yMSgpID09PSBtYXRyaXgubTIxKCkgJiYgdGhpcy5tMjIoKSA9PT0gbWF0cml4Lm0yMigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZXF1YWxpdHkgd2l0aGluIGEgbWFyZ2luIG9mIGVycm9yIHdpdGggYW5vdGhlciBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyBlcXVhbHNFcHNpbG9uKCBtYXRyaXg6IE1hdHJpeDMsIGVwc2lsb246IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMubTAwKCkgLSBtYXRyaXgubTAwKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTAxKCkgLSBtYXRyaXgubTAxKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTAyKCkgLSBtYXRyaXgubTAyKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTEwKCkgLSBtYXRyaXgubTEwKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTExKCkgLSBtYXRyaXgubTExKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTEyKCkgLSBtYXRyaXgubTEyKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIwKCkgLSBtYXRyaXgubTIwKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIxKCkgLSBtYXRyaXgubTIxKCkgKSA8IGVwc2lsb24gJiZcbiAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMubTIyKCkgLSBtYXRyaXgubTIyKCkgKSA8IGVwc2lsb247XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogSW1tdXRhYmxlIG9wZXJhdGlvbnMgKHJldHVybnMgYSBuZXcgbWF0cml4KVxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGlzIG1hdHJpeFxuICAgKi9cbiAgcHVibGljIGNvcHkoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIG0zKFxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMDEoKSwgdGhpcy5tMDIoKSxcbiAgICAgIHRoaXMubTEwKCksIHRoaXMubTExKCksIHRoaXMubTEyKCksXG4gICAgICB0aGlzLm0yMCgpLCB0aGlzLm0yMSgpLCB0aGlzLm0yMigpLFxuICAgICAgdGhpcy50eXBlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCwgZGVmaW5lZCBieSB0aGlzIG1hdHJpeCBwbHVzIHRoZSBwcm92aWRlZCBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyBwbHVzKCBtYXRyaXg6IE1hdHJpeDMgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIG0zKFxuICAgICAgdGhpcy5tMDAoKSArIG1hdHJpeC5tMDAoKSwgdGhpcy5tMDEoKSArIG1hdHJpeC5tMDEoKSwgdGhpcy5tMDIoKSArIG1hdHJpeC5tMDIoKSxcbiAgICAgIHRoaXMubTEwKCkgKyBtYXRyaXgubTEwKCksIHRoaXMubTExKCkgKyBtYXRyaXgubTExKCksIHRoaXMubTEyKCkgKyBtYXRyaXgubTEyKCksXG4gICAgICB0aGlzLm0yMCgpICsgbWF0cml4Lm0yMCgpLCB0aGlzLm0yMSgpICsgbWF0cml4Lm0yMSgpLCB0aGlzLm0yMigpICsgbWF0cml4Lm0yMigpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IG1hdHJpeCwgZGVmaW5lZCBieSB0aGlzIG1hdHJpeCBwbHVzIHRoZSBwcm92aWRlZCBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyBtaW51cyggbWF0cml4OiBNYXRyaXgzICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBtMyhcbiAgICAgIHRoaXMubTAwKCkgLSBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgLSBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgLSBtYXRyaXgubTAyKCksXG4gICAgICB0aGlzLm0xMCgpIC0gbWF0cml4Lm0xMCgpLCB0aGlzLm0xMSgpIC0gbWF0cml4Lm0xMSgpLCB0aGlzLm0xMigpIC0gbWF0cml4Lm0xMigpLFxuICAgICAgdGhpcy5tMjAoKSAtIG1hdHJpeC5tMjAoKSwgdGhpcy5tMjEoKSAtIG1hdHJpeC5tMjEoKSwgdGhpcy5tMjIoKSAtIG1hdHJpeC5tMjIoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRyYW5zcG9zZWQgY29weSBvZiB0aGlzIG1hdHJpeFxuICAgKi9cbiAgcHVibGljIHRyYW5zcG9zZWQoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIG0zKFxuICAgICAgdGhpcy5tMDAoKSwgdGhpcy5tMTAoKSwgdGhpcy5tMjAoKSxcbiAgICAgIHRoaXMubTAxKCksIHRoaXMubTExKCksIHRoaXMubTIxKCksXG4gICAgICB0aGlzLm0wMigpLCB0aGlzLm0xMigpLCB0aGlzLm0yMigpLCAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5TQ0FMSU5HICkgPyB0aGlzLnR5cGUgOiB1bmRlZmluZWRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZWdhdGVkIGNvcHkgb2YgdGhpcyBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyBuZWdhdGVkKCk6IE1hdHJpeDMge1xuICAgIHJldHVybiBtMyhcbiAgICAgIC10aGlzLm0wMCgpLCAtdGhpcy5tMDEoKSwgLXRoaXMubTAyKCksXG4gICAgICAtdGhpcy5tMTAoKSwgLXRoaXMubTExKCksIC10aGlzLm0xMigpLFxuICAgICAgLXRoaXMubTIwKCksIC10aGlzLm0yMSgpLCAtdGhpcy5tMjIoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbnZlcnRlZCBjb3B5IG9mIHRoaXMgbWF0cml4XG4gICAqL1xuICBwdWJsaWMgaW52ZXJ0ZWQoKTogTWF0cml4MyB7XG4gICAgbGV0IGRldDtcblxuICAgIHN3aXRjaCggdGhpcy50eXBlICkge1xuICAgICAgY2FzZSBNYXRyaXgzVHlwZS5JREVOVElUWTpcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEOlxuICAgICAgICByZXR1cm4gbTMoXG4gICAgICAgICAgMSwgMCwgLXRoaXMubTAyKCksXG4gICAgICAgICAgMCwgMSwgLXRoaXMubTEyKCksXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgKTtcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuU0NBTElORzpcbiAgICAgICAgcmV0dXJuIG0zKFxuICAgICAgICAgIDEgLyB0aGlzLm0wMCgpLCAwLCAwLFxuICAgICAgICAgIDAsIDEgLyB0aGlzLm0xMSgpLCAwLFxuICAgICAgICAgIDAsIDAsIDEgLyB0aGlzLm0yMigpLCBNYXRyaXgzVHlwZS5TQ0FMSU5HICk7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLkFGRklORTpcbiAgICAgICAgZGV0ID0gdGhpcy5nZXREZXRlcm1pbmFudCgpO1xuICAgICAgICBpZiAoIGRldCAhPT0gMCApIHtcbiAgICAgICAgICByZXR1cm4gbTMoXG4gICAgICAgICAgICAoIC10aGlzLm0xMigpICogdGhpcy5tMjEoKSArIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTAyKCkgKiB0aGlzLm0yMSgpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggLXRoaXMubTAyKCkgKiB0aGlzLm0xMSgpICsgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMDIoKSAqIHRoaXMubTIwKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCB0aGlzLm0wMigpICogdGhpcy5tMTAoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXG4gICAgICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkVcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBjb3VsZCBub3QgYmUgaW52ZXJ0ZWQsIGRldGVybWluYW50ID09PSAwJyApO1xuICAgICAgICB9XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLk9USEVSOlxuICAgICAgICBkZXQgPSB0aGlzLmdldERldGVybWluYW50KCk7XG4gICAgICAgIGlmICggZGV0ICE9PSAwICkge1xuICAgICAgICAgIHJldHVybiBtMyhcbiAgICAgICAgICAgICggLXRoaXMubTEyKCkgKiB0aGlzLm0yMSgpICsgdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMDIoKSAqIHRoaXMubTExKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCB0aGlzLm0xMigpICogdGhpcy5tMjAoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMjAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTAyKCkgKiB0aGlzLm0xMCgpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTEyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggLXRoaXMubTExKCkgKiB0aGlzLm0yMCgpICsgdGhpcy5tMTAoKSAqIHRoaXMubTIxKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMDEoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0wMCgpICogdGhpcy5tMjEoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMDEoKSAqIHRoaXMubTEwKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMTEoKSApIC8gZGV0LFxuICAgICAgICAgICAgTWF0cml4M1R5cGUuT1RIRVJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBjb3VsZCBub3QgYmUgaW52ZXJ0ZWQsIGRldGVybWluYW50ID09PSAwJyApO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBNYXRyaXgzLmludmVydGVkIHdpdGggdW5rbm93biB0eXBlOiAke3RoaXMudHlwZX1gICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXgsIGRlZmluZWQgYnkgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgKiBtYXRyaXguXG4gICAqXG4gICAqIEBwYXJhbSBtYXRyaXhcbiAgICogQHJldHVybnMgLSBOT1RFOiB0aGlzIG1heSBiZSB0aGUgc2FtZSBtYXRyaXghXG4gICAqL1xuICBwdWJsaWMgdGltZXNNYXRyaXgoIG1hdHJpeDogTWF0cml4MyApOiBNYXRyaXgzIHtcbiAgICAvLyBJICogTSA9PT0gTSAqIEkgPT09IE0gKHRoZSBpZGVudGl0eSlcbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZICkge1xuICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgPyBtYXRyaXggOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICggdGhpcy50eXBlID09PSBtYXRyaXgudHlwZSApIHtcbiAgICAgIC8vIGN1cnJlbnRseSB0d28gbWF0cmljZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIHJlc3VsdCBpbiB0aGUgc2FtZSByZXN1bHQgdHlwZVxuICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2YgdHJhbnNsYXRpb25zXG4gICAgICAgIHJldHVybiBtMyhcbiAgICAgICAgICAxLCAwLCB0aGlzLm0wMigpICsgbWF0cml4Lm0wMigpLFxuICAgICAgICAgIDAsIDEsIHRoaXMubTEyKCkgKyBtYXRyaXgubTEyKCksXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLlNDQUxJTkcgKSB7XG4gICAgICAgIC8vIGZhc3RlciBjb21iaW5hdGlvbiBvZiBzY2FsaW5nXG4gICAgICAgIHJldHVybiBtMyhcbiAgICAgICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMCgpLCAwLCAwLFxuICAgICAgICAgIDAsIHRoaXMubTExKCkgKiBtYXRyaXgubTExKCksIDAsXG4gICAgICAgICAgMCwgMCwgMSwgTWF0cml4M1R5cGUuU0NBTElORyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy50eXBlICE9PSBNYXRyaXgzVHlwZS5PVEhFUiAmJiBtYXRyaXgudHlwZSAhPT0gTWF0cml4M1R5cGUuT1RIRVIgKSB7XG4gICAgICAvLyBjdXJyZW50bHkgdHdvIG1hdHJpY2VzIHRoYXQgYXJlIGFueXRoaW5nIGJ1dCBcIm90aGVyXCIgYXJlIHRlY2huaWNhbGx5IGFmZmluZSwgYW5kIHRoZSByZXN1bHQgd2lsbCBiZSBhZmZpbmVcblxuICAgICAgLy8gYWZmaW5lIGNhc2VcbiAgICAgIHJldHVybiBtMyhcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCksXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpLFxuICAgICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTAyKCksXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpLFxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSxcbiAgICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0xMigpLFxuICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcbiAgICB9XG5cbiAgICAvLyBnZW5lcmFsIGNhc2VcbiAgICByZXR1cm4gbTMoXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTAoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIwKCksXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIxKCksXG4gICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTAyKCkgKiBtYXRyaXgubTIyKCksXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTAoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIwKCksXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIxKCksXG4gICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTEyKCkgKiBtYXRyaXgubTIyKCksXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMCgpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTAoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIwKCksXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTEoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIxKCksXG4gICAgICB0aGlzLm0yMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMjEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTIyKCkgKiBtYXRyaXgubTIyKCkgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBJbW11dGFibGUgb3BlcmF0aW9ucyAocmV0dXJucyBuZXcgZm9ybSBvZiBhIHBhcmFtZXRlcilcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhpcyBtYXRyaXggdGltZXMgdGhlIHByb3ZpZGVkIHZlY3RvciAodHJlYXRpbmcgdGhpcyBtYXRyaXggYXMgaG9tb2dlbmVvdXMsIHNvIHRoYXRcbiAgICogaXQgaXMgdGhlIHRlY2huaWNhbCBtdWx0aXBsaWNhdGlvbiBvZiAoeCx5LDEpKS5cbiAgICovXG4gIHB1YmxpYyB0aW1lc1ZlY3RvcjIoIHZlY3RvcjI6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0wMSgpICogdmVjdG9yMi55ICsgdGhpcy5tMDIoKTtcbiAgICBjb25zdCB5ID0gdGhpcy5tMTAoKSAqIHZlY3RvcjIueCArIHRoaXMubTExKCkgKiB2ZWN0b3IyLnkgKyB0aGlzLm0xMigpO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoaXMgbWF0cml4IHRpbWVzIHRoZSBwcm92aWRlZCB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyB0aW1lc1ZlY3RvcjMoIHZlY3RvcjM6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgY29uc3QgeCA9IHRoaXMubTAwKCkgKiB2ZWN0b3IzLnggKyB0aGlzLm0wMSgpICogdmVjdG9yMy55ICsgdGhpcy5tMDIoKSAqIHZlY3RvcjMuejtcbiAgICBjb25zdCB5ID0gdGhpcy5tMTAoKSAqIHZlY3RvcjMueCArIHRoaXMubTExKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0xMigpICogdmVjdG9yMy56O1xuICAgIGNvbnN0IHogPSB0aGlzLm0yMCgpICogdmVjdG9yMy54ICsgdGhpcy5tMjEoKSAqIHZlY3RvcjMueSArIHRoaXMubTIyKCkgKiB2ZWN0b3IzLno7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB4LCB5LCB6ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhlIHRyYW5zcG9zZSBvZiB0aGlzIG1hdHJpeCB0aW1lcyB0aGUgcHJvdmlkZWQgdmVjdG9yIChhc3N1bWluZyB0aGUgMngyIHF1YWRyYW50KVxuICAgKi9cbiAgcHVibGljIHRpbWVzVHJhbnNwb3NlVmVjdG9yMiggdmVjdG9yMjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjIueCArIHRoaXMubTEwKCkgKiB2ZWN0b3IyLnk7XG4gICAgY29uc3QgeSA9IHRoaXMubTAxKCkgKiB2ZWN0b3IyLnggKyB0aGlzLm0xMSgpICogdmVjdG9yMi55O1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IHRoaXMgb3BlcmF0aW9uIHNlZW1zIHRvIG5vdCB3b3JrIGZvciB0cmFuc2Zvcm1EZWx0YTIsIHNob3VsZCBiZSB2ZXR0ZWQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICovXG4gIHB1YmxpYyB0aW1lc1JlbGF0aXZlVmVjdG9yMiggdmVjdG9yMjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBjb25zdCB4ID0gdGhpcy5tMDAoKSAqIHZlY3RvcjIueCArIHRoaXMubTAxKCkgKiB2ZWN0b3IyLnk7XG4gICAgY29uc3QgeSA9IHRoaXMubTEwKCkgKiB2ZWN0b3IyLnkgKyB0aGlzLm0xMSgpICogdmVjdG9yMi55O1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIE11dGFibGUgb3BlcmF0aW9ucyAoY2hhbmdlcyB0aGlzIG1hdHJpeClcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogU2V0cyB0aGUgZW50aXJlIHN0YXRlIG9mIHRoZSBtYXRyaXgsIGluIHJvdy1tYWpvciBvcmRlci5cbiAgICpcbiAgICogTk9URTogRXZlcnkgbXV0YWJsZSBtZXRob2QgZ29lcyB0aHJvdWdoIHJvd01ham9yXG4gICAqL1xuICBwdWJsaWMgcm93TWFqb3IoIHYwMDogbnVtYmVyLCB2MDE6IG51bWJlciwgdjAyOiBudW1iZXIsIHYxMDogbnVtYmVyLCB2MTE6IG51bWJlciwgdjEyOiBudW1iZXIsIHYyMDogbnVtYmVyLCB2MjE6IG51bWJlciwgdjIyOiBudW1iZXIsIHR5cGU/OiBNYXRyaXgzVHlwZSApOiB0aGlzIHtcbiAgICB0aGlzLmVudHJpZXNbIDAgXSA9IHYwMDtcbiAgICB0aGlzLmVudHJpZXNbIDEgXSA9IHYxMDtcbiAgICB0aGlzLmVudHJpZXNbIDIgXSA9IHYyMDtcbiAgICB0aGlzLmVudHJpZXNbIDMgXSA9IHYwMTtcbiAgICB0aGlzLmVudHJpZXNbIDQgXSA9IHYxMTtcbiAgICB0aGlzLmVudHJpZXNbIDUgXSA9IHYyMTtcbiAgICB0aGlzLmVudHJpZXNbIDYgXSA9IHYwMjtcbiAgICB0aGlzLmVudHJpZXNbIDcgXSA9IHYxMjtcbiAgICB0aGlzLmVudHJpZXNbIDggXSA9IHYyMjtcblxuICAgIC8vIFRPRE86IGNvbnNpZGVyIHBlcmZvcm1hbmNlIG9mIHRoZSBhZmZpbmUgY2hlY2sgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHRoaXMudHlwZSA9IHR5cGUgPT09IHVuZGVmaW5lZCA/ICggKCB2MjAgPT09IDAgJiYgdjIxID09PSAwICYmIHYyMiA9PT0gMSApID8gTWF0cml4M1R5cGUuQUZGSU5FIDogTWF0cml4M1R5cGUuT1RIRVIgKSA6IHR5cGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBiZSBhIGNvcHkgb2YgYW5vdGhlciBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0KCBtYXRyaXg6IE1hdHJpeDMgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICBtYXRyaXgubTAwKCksIG1hdHJpeC5tMDEoKSwgbWF0cml4Lm0wMigpLFxuICAgICAgbWF0cml4Lm0xMCgpLCBtYXRyaXgubTExKCksIG1hdHJpeC5tMTIoKSxcbiAgICAgIG1hdHJpeC5tMjAoKSwgbWF0cml4Lm0yMSgpLCBtYXRyaXgubTIyKCksXG4gICAgICBtYXRyaXgudHlwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gYmUgYSBjb3B5IG9mIHRoZSBjb2x1bW4tbWFqb3IgZGF0YSBzdG9yZWQgaW4gYW4gYXJyYXkgKGUuZy4gV2ViR0wpLlxuICAgKi9cbiAgcHVibGljIHNldEFycmF5KCBhcnJheTogbnVtYmVyW10gfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXkgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICBhcnJheVsgMCBdLCBhcnJheVsgMyBdLCBhcnJheVsgNiBdLFxuICAgICAgYXJyYXlbIDEgXSwgYXJyYXlbIDQgXSwgYXJyYXlbIDcgXSxcbiAgICAgIGFycmF5WyAyIF0sIGFycmF5WyA1IF0sIGFycmF5WyA4IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDAsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MDAoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyAwIF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDAsMSBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MDEoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyAzIF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDAsMiBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MDIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyA2IF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDEsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MTAoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyAxIF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDEsMSBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MTEoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyA0IF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDEsMiBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MTIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyA3IF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDIsMCBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MjAoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyAyIF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDIsMSBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MjEoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyA1IF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbmRpdmlkdWFsIDIsMiBjb21wb25lbnQgb2YgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0MjIoIHZhbHVlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5lbnRyaWVzWyA4IF0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlcyB0aGlzIG1hdHJpeCBlZmZlY3RpdmVseSBpbW11dGFibGUgdG8gdGhlIG5vcm1hbCBtZXRob2RzIChleGNlcHQgZGlyZWN0IHNldHRlcnM/KVxuICAgKi9cbiAgcHVibGljIG1ha2VJbW11dGFibGUoKTogdGhpcyB7XG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICB0aGlzLnJvd01ham9yID0gKCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdDYW5ub3QgbW9kaWZ5IGltbXV0YWJsZSBtYXRyaXgnICk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBlbnRpcmUgc3RhdGUgb2YgdGhlIG1hdHJpeCwgaW4gY29sdW1uLW1ham9yIG9yZGVyLlxuICAgKi9cbiAgcHVibGljIGNvbHVtbk1ham9yKCB2MDA6IG51bWJlciwgdjEwOiBudW1iZXIsIHYyMDogbnVtYmVyLCB2MDE6IG51bWJlciwgdjExOiBudW1iZXIsIHYyMTogbnVtYmVyLCB2MDI6IG51bWJlciwgdjEyOiBudW1iZXIsIHYyMjogbnVtYmVyLCB0eXBlOiBNYXRyaXgzVHlwZSApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvciggdjAwLCB2MDEsIHYwMiwgdjEwLCB2MTEsIHYxMiwgdjIwLCB2MjEsIHYyMiwgdHlwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gaXRzZWxmIHBsdXMgdGhlIGdpdmVuIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBhZGQoIG1hdHJpeDogTWF0cml4MyApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIHRoaXMubTAwKCkgKyBtYXRyaXgubTAwKCksIHRoaXMubTAxKCkgKyBtYXRyaXgubTAxKCksIHRoaXMubTAyKCkgKyBtYXRyaXgubTAyKCksXG4gICAgICB0aGlzLm0xMCgpICsgbWF0cml4Lm0xMCgpLCB0aGlzLm0xMSgpICsgbWF0cml4Lm0xMSgpLCB0aGlzLm0xMigpICsgbWF0cml4Lm0xMigpLFxuICAgICAgdGhpcy5tMjAoKSArIG1hdHJpeC5tMjAoKSwgdGhpcy5tMjEoKSArIG1hdHJpeC5tMjEoKSwgdGhpcy5tMjIoKSArIG1hdHJpeC5tMjIoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBpdHNlbGYgbWludXMgdGhlIGdpdmVuIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBzdWJ0cmFjdCggbTogTWF0cml4MyApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIHRoaXMubTAwKCkgLSBtLm0wMCgpLCB0aGlzLm0wMSgpIC0gbS5tMDEoKSwgdGhpcy5tMDIoKSAtIG0ubTAyKCksXG4gICAgICB0aGlzLm0xMCgpIC0gbS5tMTAoKSwgdGhpcy5tMTEoKSAtIG0ubTExKCksIHRoaXMubTEyKCkgLSBtLm0xMigpLFxuICAgICAgdGhpcy5tMjAoKSAtIG0ubTIwKCksIHRoaXMubTIxKCkgLSBtLm0yMSgpLCB0aGlzLm0yMigpIC0gbS5tMjIoKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBpdHMgb3duIHRyYW5zcG9zZS5cbiAgICovXG4gIHB1YmxpYyB0cmFuc3Bvc2UoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICB0aGlzLm0wMCgpLCB0aGlzLm0xMCgpLCB0aGlzLm0yMCgpLFxuICAgICAgdGhpcy5tMDEoKSwgdGhpcy5tMTEoKSwgdGhpcy5tMjEoKSxcbiAgICAgIHRoaXMubTAyKCksIHRoaXMubTEyKCksIHRoaXMubTIyKCksXG4gICAgICAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5TQ0FMSU5HICkgPyB0aGlzLnR5cGUgOiB1bmRlZmluZWRcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gaXRzIG93biBuZWdhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBuZWdhdGUoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICAtdGhpcy5tMDAoKSwgLXRoaXMubTAxKCksIC10aGlzLm0wMigpLFxuICAgICAgLXRoaXMubTEwKCksIC10aGlzLm0xMSgpLCAtdGhpcy5tMTIoKSxcbiAgICAgIC10aGlzLm0yMCgpLCAtdGhpcy5tMjEoKSwgLXRoaXMubTIyKClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gaXRzIG93biBpbnZlcnNlLlxuICAgKi9cbiAgcHVibGljIGludmVydCgpOiB0aGlzIHtcbiAgICBsZXQgZGV0O1xuXG4gICAgc3dpdGNoKCB0aGlzLnR5cGUgKSB7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLklERU5USVRZOlxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQ6XG4gICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgICAgIDEsIDAsIC10aGlzLm0wMigpLFxuICAgICAgICAgIDAsIDEsIC10aGlzLm0xMigpLFxuICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICk7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLlNDQUxJTkc6XG4gICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgICAgIDEgLyB0aGlzLm0wMCgpLCAwLCAwLFxuICAgICAgICAgIDAsIDEgLyB0aGlzLm0xMSgpLCAwLFxuICAgICAgICAgIDAsIDAsIDEgLyB0aGlzLm0yMigpLCBNYXRyaXgzVHlwZS5TQ0FMSU5HICk7XG4gICAgICBjYXNlIE1hdHJpeDNUeXBlLkFGRklORTpcbiAgICAgICAgZGV0ID0gdGhpcy5nZXREZXRlcm1pbmFudCgpO1xuICAgICAgICBpZiAoIGRldCAhPT0gMCApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgICAgICAgICggLXRoaXMubTEyKCkgKiB0aGlzLm0yMSgpICsgdGhpcy5tMTEoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMDIoKSAqIHRoaXMubTIxKCkgLSB0aGlzLm0wMSgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMDIoKSAqIHRoaXMubTExKCkgKyB0aGlzLm0wMSgpICogdGhpcy5tMTIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCB0aGlzLm0xMigpICogdGhpcy5tMjAoKSAtIHRoaXMubTEwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0wMigpICogdGhpcy5tMjAoKSArIHRoaXMubTAwKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTAyKCkgKiB0aGlzLm0xMCgpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTEyKCkgKSAvIGRldCxcbiAgICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLkFGRklORVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGNvdWxkIG5vdCBiZSBpbnZlcnRlZCwgZGV0ZXJtaW5hbnQgPT09IDAnICk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgTWF0cml4M1R5cGUuT1RIRVI6XG4gICAgICAgIGRldCA9IHRoaXMuZ2V0RGV0ZXJtaW5hbnQoKTtcbiAgICAgICAgaWYgKCBkZXQgIT09IDAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICAgICAgICAoIC10aGlzLm0xMigpICogdGhpcy5tMjEoKSArIHRoaXMubTExKCkgKiB0aGlzLm0yMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTAyKCkgKiB0aGlzLm0yMSgpIC0gdGhpcy5tMDEoKSAqIHRoaXMubTIyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggLXRoaXMubTAyKCkgKiB0aGlzLm0xMSgpICsgdGhpcy5tMDEoKSAqIHRoaXMubTEyKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggdGhpcy5tMTIoKSAqIHRoaXMubTIwKCkgLSB0aGlzLm0xMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCAtdGhpcy5tMDIoKSAqIHRoaXMubTIwKCkgKyB0aGlzLm0wMCgpICogdGhpcy5tMjIoKSApIC8gZGV0LFxuICAgICAgICAgICAgKCB0aGlzLm0wMigpICogdGhpcy5tMTAoKSAtIHRoaXMubTAwKCkgKiB0aGlzLm0xMigpICkgLyBkZXQsXG4gICAgICAgICAgICAoIC10aGlzLm0xMSgpICogdGhpcy5tMjAoKSArIHRoaXMubTEwKCkgKiB0aGlzLm0yMSgpICkgLyBkZXQsXG4gICAgICAgICAgICAoIHRoaXMubTAxKCkgKiB0aGlzLm0yMCgpIC0gdGhpcy5tMDAoKSAqIHRoaXMubTIxKCkgKSAvIGRldCxcbiAgICAgICAgICAgICggLXRoaXMubTAxKCkgKiB0aGlzLm0xMCgpICsgdGhpcy5tMDAoKSAqIHRoaXMubTExKCkgKSAvIGRldCxcbiAgICAgICAgICAgIE1hdHJpeDNUeXBlLk9USEVSXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdNYXRyaXggY291bGQgbm90IGJlIGludmVydGVkLCBkZXRlcm1pbmFudCA9PT0gMCcgKTtcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgTWF0cml4My5pbnZlcnRlZCB3aXRoIHVua25vd24gdHlwZTogJHt0aGlzLnR5cGV9YCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSB2YWx1ZSBvZiBpdHNlbGYgdGltZXMgdGhlIHByb3ZpZGVkIG1hdHJpeFxuICAgKi9cbiAgcHVibGljIG11bHRpcGx5TWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogdGhpcyB7XG4gICAgLy8gTSAqIEkgPT09IE0gKHRoZSBpZGVudGl0eSlcbiAgICBpZiAoIG1hdHJpeC50eXBlID09PSBNYXRyaXgzVHlwZS5JREVOVElUWSApIHtcbiAgICAgIC8vIG5vIGNoYW5nZSBuZWVkZWRcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIEkgKiBNID09PSBNICh0aGUgaWRlbnRpdHkpXG4gICAgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLklERU5USVRZICkge1xuICAgICAgLy8gY29weSB0aGUgb3RoZXIgbWF0cml4IHRvIHVzXG4gICAgICByZXR1cm4gdGhpcy5zZXQoIG1hdHJpeCApO1xuICAgIH1cblxuICAgIGlmICggdGhpcy50eXBlID09PSBtYXRyaXgudHlwZSApIHtcbiAgICAgIC8vIGN1cnJlbnRseSB0d28gbWF0cmljZXMgb2YgdGhlIHNhbWUgdHlwZSB3aWxsIHJlc3VsdCBpbiB0aGUgc2FtZSByZXN1bHQgdHlwZVxuICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xuICAgICAgICAvLyBmYXN0ZXIgY29tYmluYXRpb24gb2YgdHJhbnNsYXRpb25zXG4gICAgICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgICAgIDEsIDAsIHRoaXMubTAyKCkgKyBtYXRyaXgubTAyKCksXG4gICAgICAgICAgMCwgMSwgdGhpcy5tMTIoKSArIG1hdHJpeC5tMTIoKSxcbiAgICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuU0NBTElORyApIHtcbiAgICAgICAgLy8gZmFzdGVyIGNvbWJpbmF0aW9uIG9mIHNjYWxpbmdcbiAgICAgICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSwgMCwgMCxcbiAgICAgICAgICAwLCB0aGlzLm0xMSgpICogbWF0cml4Lm0xMSgpLCAwLFxuICAgICAgICAgIDAsIDAsIDEsIE1hdHJpeDNUeXBlLlNDQUxJTkcgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHRoaXMudHlwZSAhPT0gTWF0cml4M1R5cGUuT1RIRVIgJiYgbWF0cml4LnR5cGUgIT09IE1hdHJpeDNUeXBlLk9USEVSICkge1xuICAgICAgLy8gY3VycmVudGx5IHR3byBtYXRyaWNlcyB0aGF0IGFyZSBhbnl0aGluZyBidXQgXCJvdGhlclwiIGFyZSB0ZWNobmljYWxseSBhZmZpbmUsIGFuZCB0aGUgcmVzdWx0IHdpbGwgYmUgYWZmaW5lXG5cbiAgICAgIC8vIGFmZmluZSBjYXNlXG4gICAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgICAgdGhpcy5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIHRoaXMubTAxKCkgKiBtYXRyaXgubTEwKCksXG4gICAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpLFxuICAgICAgICB0aGlzLm0wMCgpICogbWF0cml4Lm0wMigpICsgdGhpcy5tMDEoKSAqIG1hdHJpeC5tMTIoKSArIHRoaXMubTAyKCksXG4gICAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpLFxuICAgICAgICB0aGlzLm0xMCgpICogbWF0cml4Lm0wMSgpICsgdGhpcy5tMTEoKSAqIG1hdHJpeC5tMTEoKSxcbiAgICAgICAgdGhpcy5tMTAoKSAqIG1hdHJpeC5tMDIoKSArIHRoaXMubTExKCkgKiBtYXRyaXgubTEyKCkgKyB0aGlzLm0xMigpLFxuICAgICAgICAwLCAwLCAxLCBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcbiAgICB9XG5cbiAgICAvLyBnZW5lcmFsIGNhc2VcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjEoKSxcbiAgICAgIHRoaXMubTAwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0wMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMDIoKSAqIG1hdHJpeC5tMjIoKSxcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjEoKSxcbiAgICAgIHRoaXMubTEwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0xMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMTIoKSAqIG1hdHJpeC5tMjIoKSxcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAwKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMCgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjAoKSxcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAxKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMSgpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjEoKSxcbiAgICAgIHRoaXMubTIwKCkgKiBtYXRyaXgubTAyKCkgKyB0aGlzLm0yMSgpICogbWF0cml4Lm0xMigpICsgdGhpcy5tMjIoKSAqIG1hdHJpeC5tMjIoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE11dGF0ZXMgdGhpcyBtYXRyaXgsIGVxdWl2YWxlbnQgdG8gKHRyYW5zbGF0aW9uICogdGhpcykuXG4gICAqL1xuICBwdWJsaWMgcHJlcGVuZFRyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICB0aGlzLnNldDAyKCB0aGlzLm0wMigpICsgeCApO1xuICAgIHRoaXMuc2V0MTIoIHRoaXMubTEyKCkgKyB5ICk7XG5cbiAgICBpZiAoIHRoaXMudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCApIHtcbiAgICAgIHRoaXMudHlwZSA9IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy50eXBlID09PSBNYXRyaXgzVHlwZS5PVEhFUiApIHtcbiAgICAgIHRoaXMudHlwZSA9IE1hdHJpeDNUeXBlLk9USEVSO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudHlwZSA9IE1hdHJpeDNUeXBlLkFGRklORTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGZvciBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIDN4MyBpZGVudGl0eSBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0VG9JZGVudGl0eSgpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIDEsIDAsIDAsXG4gICAgICAwLCAxLCAwLFxuICAgICAgMCwgMCwgMSxcbiAgICAgIE1hdHJpeDNUeXBlLklERU5USVRZICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgYWZmaW5lIHRyYW5zbGF0aW9uIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBzZXRUb1RyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIDEsIDAsIHgsXG4gICAgICAwLCAxLCB5LFxuICAgICAgMCwgMCwgMSxcbiAgICAgIE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgYWZmaW5lIHNjYWxpbmcgbWF0cml4LlxuICAgKi9cbiAgcHVibGljIHNldFRvU2NhbGUoIHg6IG51bWJlciwgeT86IG51bWJlciApOiB0aGlzIHtcbiAgICAvLyBhbGxvdyB1c2luZyBvbmUgcGFyYW1ldGVyIHRvIHNjYWxlIGV2ZXJ5dGhpbmdcbiAgICB5ID0geSA9PT0gdW5kZWZpbmVkID8geCA6IHk7XG5cbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIHgsIDAsIDAsXG4gICAgICAwLCB5LCAwLFxuICAgICAgMCwgMCwgMSxcbiAgICAgIE1hdHJpeDNUeXBlLlNDQUxJTkcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIGFuIGFmZmluZSBtYXRyaXggd2l0aCB0aGUgc3BlY2lmaWVkIHJvdy1tYWpvciB2YWx1ZXMuXG4gICAqL1xuICBwdWJsaWMgc2V0VG9BZmZpbmUoIG0wMDogbnVtYmVyLCBtMDE6IG51bWJlciwgbTAyOiBudW1iZXIsIG0xMDogbnVtYmVyLCBtMTE6IG51bWJlciwgbTEyOiBudW1iZXIgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoIG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIDAsIDAsIDEsIE1hdHJpeDNUeXBlLkFGRklORSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG1hdHJpeCB0byBhIHJvdGF0aW9uIGRlZmluZWQgYnkgYSByb3RhdGlvbiBvZiB0aGUgc3BlY2lmaWVkIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gdW5pdCBheGlzLlxuICAgKlxuICAgKiBAcGFyYW0gYXhpcyAtIG5vcm1hbGl6ZWRcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKi9cbiAgcHVibGljIHNldFRvUm90YXRpb25BeGlzQW5nbGUoIGF4aXM6IFZlY3RvcjMsIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyggYW5nbGUgKTtcbiAgICBsZXQgcyA9IE1hdGguc2luKCBhbmdsZSApO1xuXG4gICAgLy8gSGFuZGxlIGNhc2VzIGNsb3NlIHRvIDAsIHNpbmNlIHdlIHdhbnQgTWF0aC5QSS8yIHJvdGF0aW9ucyAoYW5kIHRoZSBsaWtlKSB0byBiZSBleGFjdFxuICAgIGlmICggTWF0aC5hYnMoIGMgKSA8IDFlLTE1ICkge1xuICAgICAgYyA9IDA7XG4gICAgfVxuICAgIGlmICggTWF0aC5hYnMoIHMgKSA8IDFlLTE1ICkge1xuICAgICAgcyA9IDA7XG4gICAgfVxuXG4gICAgY29uc3QgQyA9IDEgLSBjO1xuXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICBheGlzLnggKiBheGlzLnggKiBDICsgYywgYXhpcy54ICogYXhpcy55ICogQyAtIGF4aXMueiAqIHMsIGF4aXMueCAqIGF4aXMueiAqIEMgKyBheGlzLnkgKiBzLFxuICAgICAgYXhpcy55ICogYXhpcy54ICogQyArIGF4aXMueiAqIHMsIGF4aXMueSAqIGF4aXMueSAqIEMgKyBjLCBheGlzLnkgKiBheGlzLnogKiBDIC0gYXhpcy54ICogcyxcbiAgICAgIGF4aXMueiAqIGF4aXMueCAqIEMgLSBheGlzLnkgKiBzLCBheGlzLnogKiBheGlzLnkgKiBDICsgYXhpcy54ICogcywgYXhpcy56ICogYXhpcy56ICogQyArIGMsXG4gICAgICBNYXRyaXgzVHlwZS5PVEhFUiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gYSByb3RhdGlvbiBhcm91bmQgdGhlIHggYXhpcyAoaW4gdGhlIHl6IHBsYW5lKS5cbiAgICpcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKi9cbiAgcHVibGljIHNldFRvUm90YXRpb25YKCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGxldCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XG4gICAgbGV0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuICAgIC8vIEhhbmRsZSBjYXNlcyBjbG9zZSB0byAwLCBzaW5jZSB3ZSB3YW50IE1hdGguUEkvMiByb3RhdGlvbnMgKGFuZCB0aGUgbGlrZSkgdG8gYmUgZXhhY3RcbiAgICBpZiAoIE1hdGguYWJzKCBjICkgPCAxZS0xNSApIHtcbiAgICAgIGMgPSAwO1xuICAgIH1cbiAgICBpZiAoIE1hdGguYWJzKCBzICkgPCAxZS0xNSApIHtcbiAgICAgIHMgPSAwO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgMSwgMCwgMCxcbiAgICAgIDAsIGMsIC1zLFxuICAgICAgMCwgcywgYyxcbiAgICAgIE1hdHJpeDNUeXBlLk9USEVSICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgeSBheGlzIChpbiB0aGUgeHogcGxhbmUpLlxuICAgKlxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgc2V0VG9Sb3RhdGlvblkoIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgbGV0IGMgPSBNYXRoLmNvcyggYW5nbGUgKTtcbiAgICBsZXQgcyA9IE1hdGguc2luKCBhbmdsZSApO1xuXG4gICAgLy8gSGFuZGxlIGNhc2VzIGNsb3NlIHRvIDAsIHNpbmNlIHdlIHdhbnQgTWF0aC5QSS8yIHJvdGF0aW9ucyAoYW5kIHRoZSBsaWtlKSB0byBiZSBleGFjdFxuICAgIGlmICggTWF0aC5hYnMoIGMgKSA8IDFlLTE1ICkge1xuICAgICAgYyA9IDA7XG4gICAgfVxuICAgIGlmICggTWF0aC5hYnMoIHMgKSA8IDFlLTE1ICkge1xuICAgICAgcyA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucm93TWFqb3IoXG4gICAgICBjLCAwLCBzLFxuICAgICAgMCwgMSwgMCxcbiAgICAgIC1zLCAwLCBjLFxuICAgICAgTWF0cml4M1R5cGUuT1RIRVIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIGEgcm90YXRpb24gYXJvdW5kIHRoZSB6IGF4aXMgKGluIHRoZSB4eSBwbGFuZSkuXG4gICAqXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRUb1JvdGF0aW9uWiggYW5nbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICBsZXQgYyA9IE1hdGguY29zKCBhbmdsZSApO1xuICAgIGxldCBzID0gTWF0aC5zaW4oIGFuZ2xlICk7XG5cbiAgICAvLyBIYW5kbGUgY2FzZXMgY2xvc2UgdG8gMCwgc2luY2Ugd2Ugd2FudCBNYXRoLlBJLzIgcm90YXRpb25zIChhbmQgdGhlIGxpa2UpIHRvIGJlIGV4YWN0XG4gICAgaWYgKCBNYXRoLmFicyggYyApIDwgMWUtMTUgKSB7XG4gICAgICBjID0gMDtcbiAgICB9XG4gICAgaWYgKCBNYXRoLmFicyggcyApIDwgMWUtMTUgKSB7XG4gICAgICBzID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgIGMsIC1zLCAwLFxuICAgICAgcywgYywgMCxcbiAgICAgIDAsIDAsIDEsXG4gICAgICBNYXRyaXgzVHlwZS5BRkZJTkUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoaXMgbWF0cml4IHRvIHRoZSBjb21iaW5lZCB0cmFuc2xhdGlvbityb3RhdGlvbiAod2hlcmUgdGhlIHJvdGF0aW9uIGxvZ2ljYWxseSB3b3VsZCBoYXBwZW4gZmlyc3QsIFRIRU4gaXRcbiAgICogd291bGQgYmUgdHJhbnNsYXRlZCkuXG4gICAqXG4gICAqIEBwYXJhbSB4XG4gICAqIEBwYXJhbSB5XG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRUb1RyYW5zbGF0aW9uUm90YXRpb24oIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGxldCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XG4gICAgbGV0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuICAgIC8vIEhhbmRsZSBjYXNlcyBjbG9zZSB0byAwLCBzaW5jZSB3ZSB3YW50IE1hdGguUEkvMiByb3RhdGlvbnMgKGFuZCB0aGUgbGlrZSkgdG8gYmUgZXhhY3RcbiAgICBpZiAoIE1hdGguYWJzKCBjICkgPCAxZS0xNSApIHtcbiAgICAgIGMgPSAwO1xuICAgIH1cbiAgICBpZiAoIE1hdGguYWJzKCBzICkgPCAxZS0xNSApIHtcbiAgICAgIHMgPSAwO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgYywgLXMsIHgsXG4gICAgICBzLCBjLCB5LFxuICAgICAgMCwgMCwgMSxcbiAgICAgIE1hdHJpeDNUeXBlLkFGRklORSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIGNvbWJpbmVkIHRyYW5zbGF0aW9uK3JvdGF0aW9uICh3aGVyZSB0aGUgcm90YXRpb24gbG9naWNhbGx5IHdvdWxkIGhhcHBlbiBmaXJzdCwgVEhFTiBpdFxuICAgKiB3b3VsZCBiZSB0cmFuc2xhdGVkKS5cbiAgICpcbiAgICogQHBhcmFtIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRUb1RyYW5zbGF0aW9uUm90YXRpb25Qb2ludCggdHJhbnNsYXRpb246IFZlY3RvcjIsIGFuZ2xlOiBudW1iZXIgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuc2V0VG9UcmFuc2xhdGlvblJvdGF0aW9uKCB0cmFuc2xhdGlvbi54LCB0cmFuc2xhdGlvbi55LCBhbmdsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIGNvbWJpbmVkIHNjYWxlK3RyYW5zbGF0aW9uK3JvdGF0aW9uLlxuICAgKlxuICAgKiBUaGUgb3JkZXIgb2Ygb3BlcmF0aW9ucyBpcyBzY2FsZSwgdGhlbiByb3RhdGUsIHRoZW4gdHJhbnNsYXRlLlxuICAgKlxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgc2V0VG9TY2FsZVRyYW5zbGF0aW9uUm90YXRpb24oIHNjYWxlOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGxldCBjID0gTWF0aC5jb3MoIGFuZ2xlICk7XG4gICAgbGV0IHMgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuICAgIC8vIEhhbmRsZSBjYXNlcyBjbG9zZSB0byAwLCBzaW5jZSB3ZSB3YW50IE1hdGguUEkvMiByb3RhdGlvbnMgKGFuZCB0aGUgbGlrZSkgdG8gYmUgZXhhY3RcbiAgICBpZiAoIE1hdGguYWJzKCBjICkgPCAxZS0xNSApIHtcbiAgICAgIGMgPSAwO1xuICAgIH1cbiAgICBpZiAoIE1hdGguYWJzKCBzICkgPCAxZS0xNSApIHtcbiAgICAgIHMgPSAwO1xuICAgIH1cblxuICAgIGMgKj0gc2NhbGU7XG4gICAgcyAqPSBzY2FsZTtcblxuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgYywgLXMsIHgsXG4gICAgICBzLCBjLCB5LFxuICAgICAgMCwgMCwgMSxcbiAgICAgIE1hdHJpeDNUeXBlLkFGRklORSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhpcyBtYXRyaXggdG8gdGhlIGNvbWJpbmVkIHRyYW5zbGF0aW9uK3JvdGF0aW9uICh3aGVyZSB0aGUgcm90YXRpb24gbG9naWNhbGx5IHdvdWxkIGhhcHBlbiBmaXJzdCwgVEhFTiBpdFxuICAgKiB3b3VsZCBiZSB0cmFuc2xhdGVkKS5cbiAgICpcbiAgICogQHBhcmFtIHRyYW5zbGF0aW9uXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRUb1NjYWxlVHJhbnNsYXRpb25Sb3RhdGlvblBvaW50KCBzY2FsZTogbnVtYmVyLCB0cmFuc2xhdGlvbjogVmVjdG9yMiwgYW5nbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5zZXRUb1NjYWxlVHJhbnNsYXRpb25Sb3RhdGlvbiggc2NhbGUsIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnksIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgdmFsdWVzIGNvbnRhaW5lZCBpbiBhbiBTVkdNYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc2V0VG9TVkdNYXRyaXgoIHN2Z01hdHJpeDogU1ZHTWF0cml4ICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLnJvd01ham9yKFxuICAgICAgc3ZnTWF0cml4LmEsIHN2Z01hdHJpeC5jLCBzdmdNYXRyaXguZSxcbiAgICAgIHN2Z01hdHJpeC5iLCBzdmdNYXRyaXguZCwgc3ZnTWF0cml4LmYsXG4gICAgICAwLCAwLCAxLFxuICAgICAgTWF0cml4M1R5cGUuQUZGSU5FICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byBhIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHJvdGF0ZXMgQSB0byBCIChWZWN0b3IzIGluc3RhbmNlcyksIGJ5IHJvdGF0aW5nIGFib3V0IHRoZSBheGlzXG4gICAqIEEuY3Jvc3MoIEIgKSAtLSBTaG9ydGVzdCBwYXRoLiBpZGVhbGx5IHNob3VsZCBiZSB1bml0IHZlY3RvcnMuXG4gICAqL1xuICBwdWJsaWMgc2V0Um90YXRpb25BVG9CKCBhOiBWZWN0b3IzLCBiOiBWZWN0b3IzICk6IHRoaXMge1xuICAgIC8vIHNlZSBodHRwOi8vZ3JhcGhpY3MuY3MuYnJvd24uZWR1L35qZmgvcGFwZXJzL01vbGxlci1FQkEtMTk5OS9wYXBlci5wZGYgZm9yIGluZm9ybWF0aW9uIG9uIHRoaXMgaW1wbGVtZW50YXRpb25cbiAgICBjb25zdCBzdGFydCA9IGE7XG4gICAgY29uc3QgZW5kID0gYjtcblxuICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDE7XG5cbiAgICBsZXQgdiA9IHN0YXJ0LmNyb3NzKCBlbmQgKTtcbiAgICBjb25zdCBlID0gc3RhcnQuZG90KCBlbmQgKTtcbiAgICBjb25zdCBmID0gKCBlIDwgMCApID8gLWUgOiBlO1xuXG4gICAgLy8gaWYgXCJmcm9tXCIgYW5kIFwidG9cIiB2ZWN0b3JzIGFyZSBuZWFybHkgcGFyYWxsZWxcbiAgICBpZiAoIGYgPiAxLjAgLSBlcHNpbG9uICkge1xuICAgICAgbGV0IHggPSBuZXcgVmVjdG9yMyhcbiAgICAgICAgKCBzdGFydC54ID4gMC4wICkgPyBzdGFydC54IDogLXN0YXJ0LngsXG4gICAgICAgICggc3RhcnQueSA+IDAuMCApID8gc3RhcnQueSA6IC1zdGFydC55LFxuICAgICAgICAoIHN0YXJ0LnogPiAwLjAgKSA/IHN0YXJ0LnogOiAtc3RhcnQuelxuICAgICAgKTtcblxuICAgICAgaWYgKCB4LnggPCB4LnkgKSB7XG4gICAgICAgIGlmICggeC54IDwgeC56ICkge1xuICAgICAgICAgIHggPSBWZWN0b3IzLlhfVU5JVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB4ID0gVmVjdG9yMy5aX1VOSVQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIHgueSA8IHgueiApIHtcbiAgICAgICAgICB4ID0gVmVjdG9yMy5ZX1VOSVQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgeCA9IFZlY3RvcjMuWl9VTklUO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHUgPSB4Lm1pbnVzKCBzdGFydCApO1xuICAgICAgdiA9IHgubWludXMoIGVuZCApO1xuXG4gICAgICBjb25zdCBjMSA9IDIuMCAvIHUuZG90KCB1ICk7XG4gICAgICBjb25zdCBjMiA9IDIuMCAvIHYuZG90KCB2ICk7XG4gICAgICBjb25zdCBjMyA9IGMxICogYzIgKiB1LmRvdCggdiApO1xuXG4gICAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgICAgLWMxICogdS54ICogdS54IC0gYzIgKiB2LnggKiB2LnggKyBjMyAqIHYueCAqIHUueCArIDEsXG4gICAgICAgIC1jMSAqIHUueCAqIHUueSAtIGMyICogdi54ICogdi55ICsgYzMgKiB2LnggKiB1LnksXG4gICAgICAgIC1jMSAqIHUueCAqIHUueiAtIGMyICogdi54ICogdi56ICsgYzMgKiB2LnggKiB1LnosXG4gICAgICAgIC1jMSAqIHUueSAqIHUueCAtIGMyICogdi55ICogdi54ICsgYzMgKiB2LnkgKiB1LngsXG4gICAgICAgIC1jMSAqIHUueSAqIHUueSAtIGMyICogdi55ICogdi55ICsgYzMgKiB2LnkgKiB1LnkgKyAxLFxuICAgICAgICAtYzEgKiB1LnkgKiB1LnogLSBjMiAqIHYueSAqIHYueiArIGMzICogdi55ICogdS56LFxuICAgICAgICAtYzEgKiB1LnogKiB1LnggLSBjMiAqIHYueiAqIHYueCArIGMzICogdi56ICogdS54LFxuICAgICAgICAtYzEgKiB1LnogKiB1LnkgLSBjMiAqIHYueiAqIHYueSArIGMzICogdi56ICogdS55LFxuICAgICAgICAtYzEgKiB1LnogKiB1LnogLSBjMiAqIHYueiAqIHYueiArIGMzICogdi56ICogdS56ICsgMVxuICAgICAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGUgbW9zdCBjb21tb24gY2FzZSwgdW5sZXNzIFwic3RhcnRcIj1cImVuZFwiLCBvciBcInN0YXJ0XCI9LVwiZW5kXCJcbiAgICAgIGNvbnN0IGggPSAxLjAgLyAoIDEuMCArIGUgKTtcbiAgICAgIGNvbnN0IGh2eCA9IGggKiB2Lng7XG4gICAgICBjb25zdCBodnogPSBoICogdi56O1xuICAgICAgY29uc3QgaHZ4eSA9IGh2eCAqIHYueTtcbiAgICAgIGNvbnN0IGh2eHogPSBodnggKiB2Lno7XG4gICAgICBjb25zdCBodnl6ID0gaHZ6ICogdi55O1xuXG4gICAgICByZXR1cm4gdGhpcy5yb3dNYWpvcihcbiAgICAgICAgZSArIGh2eCAqIHYueCwgaHZ4eSAtIHYueiwgaHZ4eiArIHYueSxcbiAgICAgICAgaHZ4eSArIHYueiwgZSArIGggKiB2LnkgKiB2LnksIGh2eXogLSB2LngsXG4gICAgICAgIGh2eHogLSB2LnksIGh2eXogKyB2LngsIGUgKyBodnogKiB2LnpcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIE11dGFibGUgb3BlcmF0aW9ucyAoY2hhbmdlcyB0aGUgcGFyYW1ldGVyKVxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2ZWN0b3IgdG8gdGhlIHJlc3VsdCBvZiAobWF0cml4ICogdmVjdG9yKSwgYXMgYSBob21vZ2VuZW91cyBtdWx0aXBsaWNhdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgLSBUaGUgdmVjdG9yIHRoYXQgd2FzIG11dGF0ZWRcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseVZlY3RvcjIoIHZlY3RvcjI6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHZlY3RvcjIuc2V0WFkoXG4gICAgICB0aGlzLm0wMCgpICogdmVjdG9yMi54ICsgdGhpcy5tMDEoKSAqIHZlY3RvcjIueSArIHRoaXMubTAyKCksXG4gICAgICB0aGlzLm0xMCgpICogdmVjdG9yMi54ICsgdGhpcy5tMTEoKSAqIHZlY3RvcjIueSArIHRoaXMubTEyKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2ZWN0b3IgdG8gdGhlIHJlc3VsdCBvZiAobWF0cml4ICogdmVjdG9yKS5cbiAgICpcbiAgICogQHJldHVybnMgLSBUaGUgdmVjdG9yIHRoYXQgd2FzIG11dGF0ZWRcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseVZlY3RvcjMoIHZlY3RvcjM6IFZlY3RvcjMgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHZlY3RvcjMuc2V0WFlaKFxuICAgICAgdGhpcy5tMDAoKSAqIHZlY3RvcjMueCArIHRoaXMubTAxKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0wMigpICogdmVjdG9yMy56LFxuICAgICAgdGhpcy5tMTAoKSAqIHZlY3RvcjMueCArIHRoaXMubTExKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0xMigpICogdmVjdG9yMy56LFxuICAgICAgdGhpcy5tMjAoKSAqIHZlY3RvcjMueCArIHRoaXMubTIxKCkgKiB2ZWN0b3IzLnkgKyB0aGlzLm0yMigpICogdmVjdG9yMy56ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdmVjdG9yIHRvIHRoZSByZXN1bHQgb2YgKHRyYW5zcG9zZShtYXRyaXgpICogdmVjdG9yKSwgaWdub3JpbmcgdGhlIHRyYW5zbGF0aW9uIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gVGhlIHZlY3RvciB0aGF0IHdhcyBtdXRhdGVkXG4gICAqL1xuICBwdWJsaWMgbXVsdGlwbHlUcmFuc3Bvc2VWZWN0b3IyKCB2OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB2LnNldFhZKFxuICAgICAgdGhpcy5tMDAoKSAqIHYueCArIHRoaXMubTEwKCkgKiB2LnksXG4gICAgICB0aGlzLm0wMSgpICogdi54ICsgdGhpcy5tMTEoKSAqIHYueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZlY3RvciB0byB0aGUgcmVzdWx0IG9mIChtYXRyaXggKiB2ZWN0b3IgLSBtYXRyaXggKiB6ZXJvKS4gU2luY2UgdGhpcyBpcyBhIGhvbW9nZW5lb3VzIG9wZXJhdGlvbiwgaXQgaXNcbiAgICogZXF1aXZhbGVudCB0byB0aGUgbXVsdGlwbGljYXRpb24gb2YgKHgseSwwKS5cbiAgICpcbiAgICogQHJldHVybnMgLSBUaGUgdmVjdG9yIHRoYXQgd2FzIG11dGF0ZWRcbiAgICovXG4gIHB1YmxpYyBtdWx0aXBseVJlbGF0aXZlVmVjdG9yMiggdjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdi5zZXRYWShcbiAgICAgIHRoaXMubTAwKCkgKiB2LnggKyB0aGlzLm0wMSgpICogdi55LFxuICAgICAgdGhpcy5tMTAoKSAqIHYueSArIHRoaXMubTExKCkgKiB2LnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0cmFuc2Zvcm0gb2YgYSBDYW52YXMgMkQgcmVuZGVyaW5nIGNvbnRleHQgdG8gdGhlIGFmZmluZSBwYXJ0IG9mIHRoaXMgbWF0cml4XG4gICAqL1xuICBwdWJsaWMgY2FudmFzU2V0VHJhbnNmb3JtKCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XG4gICAgY29udGV4dC5zZXRUcmFuc2Zvcm0oXG4gICAgICAvLyBpbmxpbmVkIGFycmF5IGVudHJpZXNcbiAgICAgIHRoaXMuZW50cmllc1sgMCBdLFxuICAgICAgdGhpcy5lbnRyaWVzWyAxIF0sXG4gICAgICB0aGlzLmVudHJpZXNbIDMgXSxcbiAgICAgIHRoaXMuZW50cmllc1sgNCBdLFxuICAgICAgdGhpcy5lbnRyaWVzWyA2IF0sXG4gICAgICB0aGlzLmVudHJpZXNbIDcgXVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyB0byB0aGUgYWZmaW5lIHBhcnQgb2YgdGhpcyBtYXRyaXggdG8gdGhlIENhbnZhcyAyRCByZW5kZXJpbmcgY29udGV4dFxuICAgKi9cbiAgcHVibGljIGNhbnZhc0FwcGVuZFRyYW5zZm9ybSggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xuICAgIGlmICggdGhpcy50eXBlICE9PSBNYXRyaXgzVHlwZS5JREVOVElUWSApIHtcbiAgICAgIGNvbnRleHQudHJhbnNmb3JtKFxuICAgICAgICAvLyBpbmxpbmVkIGFycmF5IGVudHJpZXNcbiAgICAgICAgdGhpcy5lbnRyaWVzWyAwIF0sXG4gICAgICAgIHRoaXMuZW50cmllc1sgMSBdLFxuICAgICAgICB0aGlzLmVudHJpZXNbIDMgXSxcbiAgICAgICAgdGhpcy5lbnRyaWVzWyA0IF0sXG4gICAgICAgIHRoaXMuZW50cmllc1sgNiBdLFxuICAgICAgICB0aGlzLmVudHJpZXNbIDcgXVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoZSBlbnRyaWVzIG9mIHRoaXMgbWF0cml4IG92ZXIgdG8gYW4gYXJiaXRyYXJ5IGFycmF5ICh0eXBlZCBvciBub3JtYWwpLlxuICAgKi9cbiAgcHVibGljIGNvcHlUb0FycmF5KCBhcnJheTogbnVtYmVyW10gfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXkgKTogbnVtYmVyW10gfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXkge1xuICAgIGFycmF5WyAwIF0gPSB0aGlzLm0wMCgpO1xuICAgIGFycmF5WyAxIF0gPSB0aGlzLm0xMCgpO1xuICAgIGFycmF5WyAyIF0gPSB0aGlzLm0yMCgpO1xuICAgIGFycmF5WyAzIF0gPSB0aGlzLm0wMSgpO1xuICAgIGFycmF5WyA0IF0gPSB0aGlzLm0xMSgpO1xuICAgIGFycmF5WyA1IF0gPSB0aGlzLm0yMSgpO1xuICAgIGFycmF5WyA2IF0gPSB0aGlzLm0wMigpO1xuICAgIGFycmF5WyA3IF0gPSB0aGlzLm0xMigpO1xuICAgIGFycmF5WyA4IF0gPSB0aGlzLm0yMigpO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xuICAgIE1hdHJpeDMucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggTWF0cml4Mywge1xuICAgIGluaXRpYWxpemU6IE1hdHJpeDMucHJvdG90eXBlLmluaXRpYWxpemUsXG4gICAgdXNlRGVmYXVsdENvbnN0cnVjdGlvbjogdHJ1ZSxcbiAgICBtYXhTaXplOiAzMDBcbiAgfSApO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGlkZW50aXR5IG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaWRlbnRpdHkoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9JZGVudGl0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB0cmFuc2xhdGlvbiBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBNYXRyaXgzIHtcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb1RyYW5zbGF0aW9uKCB4LCB5ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRyYW5zbGF0aW9uIG1hdHJpeCBjb21wdXRlZCBmcm9tIGEgdmVjdG9yLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB0cmFuc2xhdGlvbkZyb21WZWN0b3IoIHZlY3RvcjogVmVjdG9yMiB8IFZlY3RvcjMgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIE1hdHJpeDMudHJhbnNsYXRpb24oIHZlY3Rvci54LCB2ZWN0b3IueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCBzY2FsZXMgdGhpbmdzIGluIGVhY2ggZGltZW5zaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsaW5nKCB4OiBudW1iZXIsIHk/OiBudW1iZXIgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9TY2FsZSggeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCBzY2FsZXMgdGhpbmdzIGluIGVhY2ggZGltZW5zaW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzY2FsZSggeDogbnVtYmVyLCB5PzogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBNYXRyaXgzLnNjYWxpbmcoIHgsIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFmZmluZSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYWZmaW5lKCBtMDA6IG51bWJlciwgbTAxOiBudW1iZXIsIG0wMjogbnVtYmVyLCBtMTA6IG51bWJlciwgbTExOiBudW1iZXIsIG0xMjogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvQWZmaW5lKCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBtYXRyaXggd2l0aCBhbGwgZW50cmllcyBkZXRlcm1pbmVkIGluIHJvdy1tYWpvciBvcmRlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm93TWFqb3IoIHYwMDogbnVtYmVyLCB2MDE6IG51bWJlciwgdjAyOiBudW1iZXIsIHYxMDogbnVtYmVyLCB2MTE6IG51bWJlciwgdjEyOiBudW1iZXIsIHYyMDogbnVtYmVyLCB2MjE6IG51bWJlciwgdjIyOiBudW1iZXIsIHR5cGU/OiBNYXRyaXgzVHlwZSApOiBNYXRyaXgzIHtcbiAgICByZXR1cm4gZnJvbVBvb2woKS5yb3dNYWpvcihcbiAgICAgIHYwMCwgdjAxLCB2MDIsXG4gICAgICB2MTAsIHYxMSwgdjEyLFxuICAgICAgdjIwLCB2MjEsIHYyMixcbiAgICAgIHR5cGVcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggcm90YXRpb24gZGVmaW5lZCBieSBhIHJvdGF0aW9uIG9mIHRoZSBzcGVjaWZpZWQgYW5nbGUgYXJvdW5kIHRoZSBnaXZlbiB1bml0IGF4aXMuXG4gICAqXG4gICAqIEBwYXJhbSBheGlzIC0gbm9ybWFsaXplZFxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uQXhpc0FuZ2xlKCBheGlzOiBWZWN0b3IzLCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvUm90YXRpb25BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgYXJvdW5kIHRoZSB4IGF4aXMgKGluIHRoZSB5eiBwbGFuZSkuXG4gICAqXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb25YKCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvUm90YXRpb25YKCBhbmdsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCByb3RhdGVzIGFyb3VuZCB0aGUgeSBheGlzIChpbiB0aGUgeHogcGxhbmUpLlxuICAgKlxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJvdGF0aW9uWSggYW5nbGU6IG51bWJlciApOiBNYXRyaXgzIHtcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb1JvdGF0aW9uWSggYW5nbGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBhcm91bmQgdGhlIHogYXhpcyAoaW4gdGhlIHh5IHBsYW5lKS5cbiAgICpcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGlvblooIGFuZ2xlOiBudW1iZXIgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIGZyb21Qb29sKCkuc2V0VG9Sb3RhdGlvblooIGFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvbWJpbmVkIDJkIHRyYW5zbGF0aW9uICsgcm90YXRpb24gKHdpdGggdGhlIHJvdGF0aW9uIGVmZmVjdGl2ZWx5IGFwcGxpZWQgZmlyc3QpLlxuICAgKlxuICAgKiBAcGFyYW0gYW5nbGUgLSBpbiByYWRpYW5zXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0aW9uUm90YXRpb24oIHg6IG51bWJlciwgeTogbnVtYmVyLCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvVHJhbnNsYXRpb25Sb3RhdGlvbiggeCwgeSwgYW5nbGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFuZGFyZCAyZCByb3RhdGlvbiBtYXRyaXggZm9yIGEgZ2l2ZW4gYW5nbGUuXG4gICAqXG4gICAqIEBwYXJhbSBhbmdsZSAtIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb24yKCBhbmdsZTogbnVtYmVyICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFRvUm90YXRpb25aKCBhbmdsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggd2hpY2ggd2lsbCBiZSBhIDJkIHJvdGF0aW9uIGFyb3VuZCBhIGdpdmVuIHgseSBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGlvbkFyb3VuZCggYW5nbGU6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIE1hdHJpeDMudHJhbnNsYXRpb24oIHgsIHkgKS50aW1lc01hdHJpeCggTWF0cml4My5yb3RhdGlvbjIoIGFuZ2xlICkgKS50aW1lc01hdHJpeCggTWF0cml4My50cmFuc2xhdGlvbiggLXgsIC15ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbWF0cml4IHdoaWNoIHdpbGwgYmUgYSAyZCByb3RhdGlvbiBhcm91bmQgYSBnaXZlbiAyZCBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIGFuZ2xlIC0gaW4gcmFkaWFuc1xuICAgKiBAcGFyYW0gcG9pbnRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm90YXRpb25Bcm91bmRQb2ludCggYW5nbGU6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIgKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIE1hdHJpeDMucm90YXRpb25Bcm91bmQoIGFuZ2xlLCBwb2ludC54LCBwb2ludC55ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1hdHJpeCBlcXVpdmFsZW50IHRvIGEgZ2l2ZW4gU1ZHTWF0cml4LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tU1ZHTWF0cml4KCBzdmdNYXRyaXg6IFNWR01hdHJpeCApOiBNYXRyaXgzIHtcbiAgICByZXR1cm4gZnJvbVBvb2woKS5zZXRUb1NWR01hdHJpeCggc3ZnTWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJvdGF0aW9uIG1hdHJpeCB0aGF0IHJvdGF0ZXMgQSB0byBCLCBieSByb3RhdGluZyBhYm91dCB0aGUgYXhpcyBBLmNyb3NzKCBCICkgLS0gU2hvcnRlc3QgcGF0aC4gaWRlYWxseVxuICAgKiBzaG91bGQgYmUgdW5pdCB2ZWN0b3JzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3RhdGVBVG9CKCBhOiBWZWN0b3IzLCBiOiBWZWN0b3IzICk6IE1hdHJpeDMge1xuICAgIHJldHVybiBmcm9tUG9vbCgpLnNldFJvdGF0aW9uQVRvQiggYSwgYiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3J0Y3V0IGZvciB0cmFuc2xhdGlvbiB0aW1lcyBhIG1hdHJpeCAod2l0aG91dCBhbGxvY2F0aW5nIGEgdHJhbnNsYXRpb24gbWF0cml4KSwgc2VlIHNjZW5lcnkjMTE5XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRyYW5zbGF0aW9uVGltZXNNYXRyaXgoIHg6IG51bWJlciwgeTogbnVtYmVyLCBtYXRyaXg6IE1hdHJpeDMgKTogTWF0cml4MyB7XG4gICAgbGV0IHR5cGU7XG4gICAgaWYgKCBtYXRyaXgudHlwZSA9PT0gTWF0cml4M1R5cGUuSURFTlRJVFkgfHwgbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLlRSQU5TTEFUSU9OXzJEICkge1xuICAgICAgcmV0dXJuIG0zKFxuICAgICAgICAxLCAwLCBtYXRyaXgubTAyKCkgKyB4LFxuICAgICAgICAwLCAxLCBtYXRyaXgubTEyKCkgKyB5LFxuICAgICAgICAwLCAwLCAxLFxuICAgICAgICBNYXRyaXgzVHlwZS5UUkFOU0xBVElPTl8yRCApO1xuICAgIH1cbiAgICBlbHNlIGlmICggbWF0cml4LnR5cGUgPT09IE1hdHJpeDNUeXBlLk9USEVSICkge1xuICAgICAgdHlwZSA9IE1hdHJpeDNUeXBlLk9USEVSO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHR5cGUgPSBNYXRyaXgzVHlwZS5BRkZJTkU7XG4gICAgfVxuICAgIHJldHVybiBtMyhcbiAgICAgIG1hdHJpeC5tMDAoKSwgbWF0cml4Lm0wMSgpLCBtYXRyaXgubTAyKCkgKyB4LFxuICAgICAgbWF0cml4Lm0xMCgpLCBtYXRyaXgubTExKCksIG1hdHJpeC5tMTIoKSArIHksXG4gICAgICBtYXRyaXgubTIwKCksIG1hdHJpeC5tMjEoKSwgbWF0cml4Lm0yMigpLFxuICAgICAgdHlwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZSB0byBhbiBPYmplY3QgdGhhdCBjYW4gYmUgaGFuZGxlZCBieSBQaEVULWlPXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHRvU3RhdGVPYmplY3QoIG1hdHJpeDM6IE1hdHJpeDMgKTogTWF0cml4M1N0YXRlT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgZW50cmllczogbWF0cml4My5lbnRyaWVzLFxuICAgICAgdHlwZTogbWF0cml4My50eXBlLm5hbWVcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYmFjayBmcm9tIGEgc2VyaWFsaXplZCBPYmplY3QgdG8gYSBNYXRyaXgzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3Q6IE1hdHJpeDNTdGF0ZU9iamVjdCApOiBNYXRyaXgzIHtcbiAgICBjb25zdCBtYXRyaXggPSBNYXRyaXgzLmlkZW50aXR5KCk7XG4gICAgbWF0cml4LmVudHJpZXMgPSBzdGF0ZU9iamVjdC5lbnRyaWVzO1xuICAgIG1hdHJpeC50eXBlID0gTWF0cml4M1R5cGUuZW51bWVyYXRpb24uZ2V0VmFsdWUoIHN0YXRlT2JqZWN0LnR5cGUgKTtcbiAgICByZXR1cm4gbWF0cml4O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBJREVOVElUWTogTWF0cml4MzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIFhfUkVGTEVDVElPTjogTWF0cml4MzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIFlfUkVGTEVDVElPTjogTWF0cml4MzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seVxuICBwdWJsaWMgc3RhdGljIE1hdHJpeDNJTzogSU9UeXBlO1xufVxuXG5kb3QucmVnaXN0ZXIoICdNYXRyaXgzJywgTWF0cml4MyApO1xuXG5jb25zdCBmcm9tUG9vbCA9IE1hdHJpeDMucG9vbC5mZXRjaC5iaW5kKCBNYXRyaXgzLnBvb2wgKTtcblxuY29uc3QgbTMgPSAoIHYwMDogbnVtYmVyLCB2MDE6IG51bWJlciwgdjAyOiBudW1iZXIsIHYxMDogbnVtYmVyLCB2MTE6IG51bWJlciwgdjEyOiBudW1iZXIsIHYyMDogbnVtYmVyLCB2MjE6IG51bWJlciwgdjIyOiBudW1iZXIsIHR5cGU/OiBNYXRyaXgzVHlwZSApOiBNYXRyaXgzID0+IHtcbiAgcmV0dXJuIGZyb21Qb29sKCkucm93TWFqb3IoIHYwMCwgdjAxLCB2MDIsIHYxMCwgdjExLCB2MTIsIHYyMCwgdjIxLCB2MjIsIHR5cGUgKTtcbn07XG5leHBvcnQgeyBtMyB9O1xuZG90LnJlZ2lzdGVyKCAnbTMnLCBtMyApO1xuXG5NYXRyaXgzLklERU5USVRZID0gTWF0cml4My5pZGVudGl0eSgpLm1ha2VJbW11dGFibGUoKTtcbk1hdHJpeDMuWF9SRUZMRUNUSU9OID0gbTMoXG4gIC0xLCAwLCAwLFxuICAwLCAxLCAwLFxuICAwLCAwLCAxLFxuICBNYXRyaXgzVHlwZS5BRkZJTkVcbikubWFrZUltbXV0YWJsZSgpO1xuTWF0cml4My5ZX1JFRkxFQ1RJT04gPSBtMyhcbiAgMSwgMCwgMCxcbiAgMCwgLTEsIDAsXG4gIDAsIDAsIDEsXG4gIE1hdHJpeDNUeXBlLkFGRklORVxuKS5tYWtlSW1tdXRhYmxlKCk7XG5cbk1hdHJpeDMuTWF0cml4M0lPID0gbmV3IElPVHlwZSggJ01hdHJpeDNJTycsIHtcbiAgdmFsdWVUeXBlOiBNYXRyaXgzLFxuICBkb2N1bWVudGF0aW9uOiAnQSAzeDMgbWF0cml4IG9mdGVuIHVzZWQgZm9yIGhvbGRpbmcgdHJhbnNmb3JtIGRhdGEuJyxcbiAgdG9TdGF0ZU9iamVjdDogKCBtYXRyaXgzOiBNYXRyaXgzICkgPT4gTWF0cml4My50b1N0YXRlT2JqZWN0KCBtYXRyaXgzICksXG4gIGZyb21TdGF0ZU9iamVjdDogeCA9PiBNYXRyaXgzLmZyb21TdGF0ZU9iamVjdCggeCApLFxuICBzdGF0ZVNjaGVtYToge1xuICAgIGVudHJpZXM6IEFycmF5SU8oIE51bWJlcklPICksXG4gICAgdHlwZTogRW51bWVyYXRpb25JTyggTWF0cml4M1R5cGUgKVxuICB9XG59ICk7Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsIlBvb2wiLCJBcnJheUlPIiwiRW51bWVyYXRpb25JTyIsIklPVHlwZSIsIk51bWJlcklPIiwiZG90IiwiTWF0cml4NCIsInRvU1ZHTnVtYmVyIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJNYXRyaXgzVHlwZSIsIk9USEVSIiwiSURFTlRJVFkiLCJUUkFOU0xBVElPTl8yRCIsIlNDQUxJTkciLCJBRkZJTkUiLCJlbnVtZXJhdGlvbiIsIk1hdHJpeDMiLCJpbml0aWFsaXplIiwibTAwIiwiZW50cmllcyIsIm0wMSIsIm0wMiIsIm0xMCIsIm0xMSIsIm0xMiIsIm0yMCIsIm0yMSIsIm0yMiIsImlzSWRlbnRpdHkiLCJ0eXBlIiwiZXF1YWxzIiwiaXNGYXN0SWRlbnRpdHkiLCJpc1RyYW5zbGF0aW9uIiwiaXNBZmZpbmUiLCJpc0FsaWduZWQiLCJpc0F4aXNBbGlnbmVkIiwiaXNGaW5pdGUiLCJnZXREZXRlcm1pbmFudCIsImRldGVybWluYW50IiwiZ2V0VHJhbnNsYXRpb24iLCJ0cmFuc2xhdGlvbiIsImdldFNjYWxlVmVjdG9yIiwiTWF0aCIsInNxcnQiLCJzY2FsZVZlY3RvciIsImdldFNpZ25lZFNjYWxlIiwiZ2V0Um90YXRpb24iLCJhdGFuMiIsInJvdGF0aW9uIiwidG9NYXRyaXg0IiwidG9BZmZpbmVNYXRyaXg0IiwidG9TdHJpbmciLCJ0b1NWR01hdHJpeCIsInJlc3VsdCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwiY3JlYXRlU1ZHTWF0cml4IiwiYSIsImIiLCJjIiwiZCIsImUiLCJmIiwiZ2V0Q1NTVHJhbnNmb3JtIiwidG9GaXhlZCIsImNzc1RyYW5zZm9ybSIsImdldFNWR1RyYW5zZm9ybSIsInN2Z1RyYW5zZm9ybSIsImdldENTU1RyYW5zZm9ybVN0eWxlcyIsInRyYW5zZm9ybUNTUyIsInRyYW5zZm9ybSIsImNzc1RyYW5zZm9ybVN0eWxlcyIsIm1hdHJpeCIsImVxdWFsc0Vwc2lsb24iLCJlcHNpbG9uIiwiYWJzIiwiY29weSIsIm0zIiwicGx1cyIsIm1pbnVzIiwidHJhbnNwb3NlZCIsInVuZGVmaW5lZCIsIm5lZ2F0ZWQiLCJpbnZlcnRlZCIsImRldCIsIkVycm9yIiwidGltZXNNYXRyaXgiLCJ0aW1lc1ZlY3RvcjIiLCJ2ZWN0b3IyIiwieCIsInkiLCJ0aW1lc1ZlY3RvcjMiLCJ2ZWN0b3IzIiwieiIsInRpbWVzVHJhbnNwb3NlVmVjdG9yMiIsInRpbWVzUmVsYXRpdmVWZWN0b3IyIiwicm93TWFqb3IiLCJ2MDAiLCJ2MDEiLCJ2MDIiLCJ2MTAiLCJ2MTEiLCJ2MTIiLCJ2MjAiLCJ2MjEiLCJ2MjIiLCJzZXQiLCJzZXRBcnJheSIsImFycmF5Iiwic2V0MDAiLCJ2YWx1ZSIsInNldDAxIiwic2V0MDIiLCJzZXQxMCIsInNldDExIiwic2V0MTIiLCJzZXQyMCIsInNldDIxIiwic2V0MjIiLCJtYWtlSW1tdXRhYmxlIiwiYXNzZXJ0IiwiY29sdW1uTWFqb3IiLCJhZGQiLCJzdWJ0cmFjdCIsIm0iLCJ0cmFuc3Bvc2UiLCJuZWdhdGUiLCJpbnZlcnQiLCJtdWx0aXBseU1hdHJpeCIsInByZXBlbmRUcmFuc2xhdGlvbiIsInNldFRvSWRlbnRpdHkiLCJzZXRUb1RyYW5zbGF0aW9uIiwic2V0VG9TY2FsZSIsInNldFRvQWZmaW5lIiwic2V0VG9Sb3RhdGlvbkF4aXNBbmdsZSIsImF4aXMiLCJhbmdsZSIsImNvcyIsInMiLCJzaW4iLCJDIiwic2V0VG9Sb3RhdGlvblgiLCJzZXRUb1JvdGF0aW9uWSIsInNldFRvUm90YXRpb25aIiwic2V0VG9UcmFuc2xhdGlvblJvdGF0aW9uIiwic2V0VG9UcmFuc2xhdGlvblJvdGF0aW9uUG9pbnQiLCJzZXRUb1NjYWxlVHJhbnNsYXRpb25Sb3RhdGlvbiIsInNjYWxlIiwic2V0VG9TY2FsZVRyYW5zbGF0aW9uUm90YXRpb25Qb2ludCIsInNldFRvU1ZHTWF0cml4Iiwic3ZnTWF0cml4Iiwic2V0Um90YXRpb25BVG9CIiwic3RhcnQiLCJlbmQiLCJ2IiwiY3Jvc3MiLCJYX1VOSVQiLCJaX1VOSVQiLCJZX1VOSVQiLCJ1IiwiYzEiLCJjMiIsImMzIiwiaCIsImh2eCIsImh2eiIsImh2eHkiLCJodnh6IiwiaHZ5eiIsIm11bHRpcGx5VmVjdG9yMiIsInNldFhZIiwibXVsdGlwbHlWZWN0b3IzIiwic2V0WFlaIiwibXVsdGlwbHlUcmFuc3Bvc2VWZWN0b3IyIiwibXVsdGlwbHlSZWxhdGl2ZVZlY3RvcjIiLCJjYW52YXNTZXRUcmFuc2Zvcm0iLCJjb250ZXh0Iiwic2V0VHJhbnNmb3JtIiwiY2FudmFzQXBwZW5kVHJhbnNmb3JtIiwiY29weVRvQXJyYXkiLCJmcmVlVG9Qb29sIiwicG9vbCIsImlkZW50aXR5IiwiZnJvbVBvb2wiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJ2ZWN0b3IiLCJzY2FsaW5nIiwiYWZmaW5lIiwicm90YXRpb25BeGlzQW5nbGUiLCJyb3RhdGlvblgiLCJyb3RhdGlvblkiLCJyb3RhdGlvbloiLCJ0cmFuc2xhdGlvblJvdGF0aW9uIiwicm90YXRpb24yIiwicm90YXRpb25Bcm91bmQiLCJyb3RhdGlvbkFyb3VuZFBvaW50IiwicG9pbnQiLCJmcm9tU1ZHTWF0cml4Iiwicm90YXRlQVRvQiIsInRyYW5zbGF0aW9uVGltZXNNYXRyaXgiLCJ0b1N0YXRlT2JqZWN0IiwibWF0cml4MyIsIm5hbWUiLCJmcm9tU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImdldFZhbHVlIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidXNlRGVmYXVsdENvbnN0cnVjdGlvbiIsIm1heFNpemUiLCJyZWdpc3RlciIsImZldGNoIiwiYmluZCIsIlhfUkVGTEVDVElPTiIsIllfUkVGTEVDVElPTiIsIk1hdHJpeDNJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsb0NBQW9DO0FBQzVELE9BQU9DLHNCQUFzQix5Q0FBeUM7QUFDdEUsT0FBT0MsVUFBeUIsNkJBQTZCO0FBQzdELE9BQU9DLGFBQWEsbUNBQW1DO0FBQ3ZELE9BQU9DLG1CQUFtQix5Q0FBeUM7QUFDbkUsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0MsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLGFBQWEsZUFBZTtBQUNuQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGFBQWEsZUFBZTtBQUNuQyxPQUFPQyxhQUFhLGVBQWU7QUFFbkMsT0FBTyxNQUFNQyxvQkFBb0JYO0FBUWpDO0FBUmFXLFlBQ1lDLFFBQVEsSUFBSUQ7QUFEeEJBLFlBRVlFLFdBQVcsSUFBSUY7QUFGM0JBLFlBR1lHLGlCQUFpQixJQUFJSDtBQUhqQ0EsWUFJWUksVUFBVSxJQUFJSjtBQUoxQkEsWUFLWUssU0FBUyxJQUFJTDtBQUx6QkEsWUFPWU0sY0FBYyxJQUFJbEIsWUFBYVk7QUFjekMsSUFBQSxBQUFNTyxVQUFOLE1BQU1BO0lBa0JaQyxhQUFtQjtRQUN4QixPQUFPLElBQUk7SUFDYjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsTUFBYztRQUNuQixPQUFPLElBQUksQ0FBQ0Ms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RyxFQUFFQSxLQUFLLENBQUUsRUFBRyxFQUNsQ0EsS0FBSyxDQUFFLEVBQUcsRUFBRUEsS0FBSyxDQUFFLEVBQUcsRUFBRUEsS0FBSyxDQUFFLEVBQUc7SUFDdEM7SUFFQTs7R0FFQyxHQUNELEFBQU9DLE1BQU9DLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9DLE1BQU9ELEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9FLE1BQU9GLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9HLE1BQU9ILEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9JLE1BQU9KLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9LLE1BQU9MLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9NLE1BQU9OLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9PLE1BQU9QLEtBQWEsRUFBUztRQUNsQyxJQUFJLENBQUMzRixPQUFPLENBQUUsRUFBRyxHQUFHMkY7UUFDcEIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNE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