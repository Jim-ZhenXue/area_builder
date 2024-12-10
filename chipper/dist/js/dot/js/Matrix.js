// Copyright 2013-2023, University of Colorado Boulder
/**
 * Arbitrary-dimensional matrix, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import isArray from '../../phet-core/js/isArray.js';
import dot from './dot.js';
import './EigenvalueDecomposition.js';
import LUDecomposition from './LUDecomposition.js';
import QRDecomposition from './QRDecomposition.js';
import SingularValueDecomposition from './SingularValueDecomposition.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';
import Vector4 from './Vector4.js';
const ArrayType = window.Float64Array || Array;
let Matrix = class Matrix {
    /**
   * @public
   *
   * @returns {Matrix}
   */ copy() {
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.size; i++){
            result.entries[i] = this.entries[i];
        }
        return result;
    }
    /**
   * @public
   *
   * @returns {Array.<number>}
   */ getArray() {
        return this.entries;
    }
    /**
   * @public
   *
   * @returns {Array.<number>}
   */ getArrayCopy() {
        return new ArrayType(this.entries);
    }
    /**
   * @public
   *
   * @returns {number}
   */ getRowDimension() {
        return this.m;
    }
    /**
   * @public
   *
   * @returns {number}
   */ getColumnDimension() {
        return this.n;
    }
    /**
   * TODO: inline this places if we aren't using an inlining compiler! (check performance) https://github.com/phetsims/dot/issues/96
   * @public
   *
   * @param {number} i
   * @param {number} j
   * @returns {number}
   */ index(i, j) {
        return i * this.n + j;
    }
    /**
   * Get the matrix element (i,j) with the convention that row and column indices start at zero
   * @public
   *
   * @param {number} i - row index
   * @param {number} j - column index
   * @returns {number}
   */ get(i, j) {
        return this.entries[this.index(i, j)];
    }
    /**
   * Set the matrix element (i,j) to a value s with the convention that row and column indices start at zero
   * @public
   *
   * @param {number} i - row index
   * @param {number} j - column index
   * @param {number} s - value of the matrix element
   */ set(i, j, s) {
        this.entries[this.index(i, j)] = s;
    }
    /**
   * @public
   *
   * @param {number} i0
   * @param {number} i1
   * @param {number} j0
   * @param {number} j1
   * @returns {Matrix}
   */ getMatrix(i0, i1, j0, j1) {
        const result = new Matrix(i1 - i0 + 1, j1 - j0 + 1);
        for(let i = i0; i <= i1; i++){
            for(let j = j0; j <= j1; j++){
                result.entries[result.index(i - i0, j - j0)] = this.entries[this.index(i, j)];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Array.<number>} r
   * @param {number} j0
   * @param {number} j1
   * @returns {Matrix}
   */ getArrayRowMatrix(r, j0, j1) {
        const result = new Matrix(r.length, j1 - j0 + 1);
        for(let i = 0; i < r.length; i++){
            for(let j = j0; j <= j1; j++){
                result.entries[result.index(i, j - j0)] = this.entries[this.index(r[i], j)];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} [result] - allow passing in a pre-constructed matrix
   * @returns {Matrix}
   */ transpose(result) {
        result = result || new Matrix(this.n, this.m);
        assert && assert(result.m === this.n);
        assert && assert(result.n === this.m);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                result.entries[result.index(j, i)] = this.entries[this.index(i, j)];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @returns {number}
   */ norm1() {
        let f = 0;
        for(let j = 0; j < this.n; j++){
            let s = 0;
            for(let i = 0; i < this.m; i++){
                s += Math.abs(this.entries[this.index(i, j)]);
            }
            f = Math.max(f, s);
        }
        return f;
    }
    /**
   * @public
   *
   * @returns {number}
   */ norm2() {
        return new SingularValueDecomposition(this).norm2();
    }
    /**
   * @public
   *
   * @returns {number}
   */ normInf() {
        let f = 0;
        for(let i = 0; i < this.m; i++){
            let s = 0;
            for(let j = 0; j < this.n; j++){
                s += Math.abs(this.entries[this.index(i, j)]);
            }
            f = Math.max(f, s);
        }
        return f;
    }
    /**
   * @public
   *
   * @returns {number}
   */ normF() {
        let f = 0;
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                f = Matrix.hypot(f, this.entries[this.index(i, j)]);
            }
        }
        return f;
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ uminus() {
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                result.entries[result.index(i, j)] = -this.entries[this.index(i, j)];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ plus(matrix) {
        this.checkMatrixDimensions(matrix);
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = result.index(i, j);
                result.entries[index] = this.entries[index] + matrix.entries[index];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ plusEquals(matrix) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = this.entries[index] + matrix.entries[index];
            }
        }
        return this;
    }
    /**
   * A linear interpolation between this Matrix (ratio=0) and another Matrix (ratio=1).
   * @public
   *
   * @param {Matrix} matrix
   * @param {number} ratio - Not necessarily constrained in [0, 1]
   * @returns {Matrix}
   */ blendEquals(matrix, ratio) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                const a = this.entries[index];
                const b = matrix.entries[index];
                this.entries[index] = a + (b - a) * ratio;
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ minus(matrix) {
        this.checkMatrixDimensions(matrix);
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                result.entries[index] = this.entries[index] - matrix.entries[index];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ minusEquals(matrix) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = this.entries[index] - matrix.entries[index];
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayTimes(matrix) {
        this.checkMatrixDimensions(matrix);
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = result.index(i, j);
                result.entries[index] = this.entries[index] * matrix.entries[index];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayTimesEquals(matrix) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = this.entries[index] * matrix.entries[index];
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayRightDivide(matrix) {
        this.checkMatrixDimensions(matrix);
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                result.entries[index] = this.entries[index] / matrix.entries[index];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayRightDivideEquals(matrix) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = this.entries[index] / matrix.entries[index];
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayLeftDivide(matrix) {
        this.checkMatrixDimensions(matrix);
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                result.entries[index] = matrix.entries[index] / this.entries[index];
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ arrayLeftDivideEquals(matrix) {
        this.checkMatrixDimensions(matrix);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = matrix.entries[index] / this.entries[index];
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix|number} matrixOrScalar
   * @returns {Matrix}
   */ times(matrixOrScalar) {
        let result;
        let i;
        let j;
        let k;
        let s;
        let matrix;
        if (matrixOrScalar.isMatrix) {
            matrix = matrixOrScalar;
            if (matrix.m !== this.n) {
                throw new Error('Matrix inner dimensions must agree.');
            }
            result = new Matrix(this.m, matrix.n);
            const matrixcolj = new ArrayType(this.n);
            for(j = 0; j < matrix.n; j++){
                for(k = 0; k < this.n; k++){
                    matrixcolj[k] = matrix.entries[matrix.index(k, j)];
                }
                for(i = 0; i < this.m; i++){
                    s = 0;
                    for(k = 0; k < this.n; k++){
                        s += this.entries[this.index(i, k)] * matrixcolj[k];
                    }
                    result.entries[result.index(i, j)] = s;
                }
            }
            return result;
        } else {
            s = matrixOrScalar;
            result = new Matrix(this.m, this.n);
            for(i = 0; i < this.m; i++){
                for(j = 0; j < this.n; j++){
                    result.entries[result.index(i, j)] = s * this.entries[this.index(i, j)];
                }
            }
            return result;
        }
    }
    /**
   * @public
   *
   * @param {number} s
   * @returns {Matrix}
   */ timesEquals(s) {
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                const index = this.index(i, j);
                this.entries[index] = s * this.entries[index];
            }
        }
        return this;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ solve(matrix) {
        return this.m === this.n ? new LUDecomposition(this).solve(matrix) : new QRDecomposition(this).solve(matrix);
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ solveTranspose(matrix) {
        return this.transpose().solve(matrix.transpose());
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ inverse() {
        return this.solve(Matrix.identity(this.m, this.m));
    }
    /**
   * @public
   *
   * @returns {number}
   */ det() {
        return new LUDecomposition(this).det();
    }
    /**
   * @public
   *
   * @returns {number}
   */ rank() {
        return new SingularValueDecomposition(this).rank();
    }
    /**
   * @public
   *
   * @returns {number}
   */ cond() {
        return new SingularValueDecomposition(this).cond();
    }
    /**
   * @public
   *
   * @returns {number}
   */ trace() {
        let t = 0;
        for(let i = 0; i < Math.min(this.m, this.n); i++){
            t += this.entries[this.index(i, i)];
        }
        return t;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   */ checkMatrixDimensions(matrix) {
        if (matrix.m !== this.m || matrix.n !== this.n) {
            throw new Error('Matrix dimensions must agree.');
        }
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        let result = '';
        result += `dim: ${this.getRowDimension()}x${this.getColumnDimension()}\n`;
        for(let row = 0; row < this.getRowDimension(); row++){
            for(let col = 0; col < this.getColumnDimension(); col++){
                result += `${this.get(row, col)} `;
            }
            result += '\n';
        }
        return result;
    }
    /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector2}
   */ extractVector2(column) {
        assert && assert(this.m === 2); // rows should match vector dimension
        return new Vector2(this.get(0, column), this.get(1, column));
    }
    /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector3}
   */ extractVector3(column) {
        assert && assert(this.m === 3); // rows should match vector dimension
        return new Vector3(this.get(0, column), this.get(1, column), this.get(2, column));
    }
    /**
   * Returns a vector that is contained in the specified column
   * @public
   *
   * @param {number} column
   * @returns {Vector4}
   */ extractVector4(column) {
        assert && assert(this.m === 4); // rows should match vector dimension
        return new Vector4(this.get(0, column), this.get(1, column), this.get(2, column), this.get(3, column));
    }
    /**
   * Sets the current matrix to the values of the listed column vectors (Vector3).
   * @public
   *
   * @param {Array.<Vector3>} vectors
   * @returns {Matrix}
   */ setVectors3(vectors) {
        const m = 3;
        const n = vectors.length;
        assert && assert(this.m === m);
        assert && assert(this.n === n);
        for(let i = 0; i < n; i++){
            const vector = vectors[i];
            this.entries[i] = vector.x;
            this.entries[i + n] = vector.y;
            this.entries[i + 2 * n] = vector.z;
        }
        return this;
    }
    /**
   * sqrt(a^2 + b^2) without under/overflow.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */ static hypot(a, b) {
        let r;
        if (Math.abs(a) > Math.abs(b)) {
            r = b / a;
            r = Math.abs(a) * Math.sqrt(1 + r * r);
        } else if (b !== 0) {
            r = a / b;
            r = Math.abs(b) * Math.sqrt(1 + r * r);
        } else {
            r = 0.0;
        }
        return r;
    }
    /**
   * Sets this matrix to the identity.
   * @public
   *
   * @param {number} m
   * @param {number} n
   * @returns {Matrix}
   */ static identity(m, n) {
        const result = new Matrix(m, n);
        for(let i = 0; i < m; i++){
            for(let j = 0; j < n; j++){
                result.entries[result.index(i, j)] = i === j ? 1.0 : 0.0;
            }
        }
        return result;
    }
    /**
   * Returns a square diagonal matrix, whose entries along the diagonal are specified by the passed-in array, and the
   * other entries are 0.
   * @public
   *
   * @param {Array.<number>} diagonalValues
   * @returns {Matrix}
   */ static diagonalMatrix(diagonalValues) {
        const n = diagonalValues.length;
        const result = new Matrix(n, n); // Should fill in zeros
        for(let i = 0; i < n; i++){
            result.entries[result.index(i, i)] = diagonalValues[i];
        }
        return result;
    }
    /**
   * @public
   *
   * @param {Vector2} vector
   * @returns {Matrix}
   */ static rowVector2(vector) {
        return new Matrix(1, 2, [
            vector.x,
            vector.y
        ]);
    }
    /**
   * @public
   *
   * @param {Vector3} vector
   * @returns {Matrix}
   */ static rowVector3(vector) {
        return new Matrix(1, 3, [
            vector.x,
            vector.y,
            vector.z
        ]);
    }
    /**
   * @public
   *
   * @param {Vector4} vector
   * @returns {Matrix}
   */ static rowVector4(vector) {
        return new Matrix(1, 4, [
            vector.x,
            vector.y,
            vector.z,
            vector.w
        ]);
    }
    /**
   * @public
   *
   * @param {Vector2|Vector3|Vector4} vector
   * @returns {Matrix}
   */ static rowVector(vector) {
        if (vector.isVector2) {
            return Matrix.rowVector2(vector);
        } else if (vector.isVector3) {
            return Matrix.rowVector3(vector);
        } else if (vector.isVector4) {
            return Matrix.rowVector4(vector);
        } else {
            throw new Error(`undetected type of vector: ${vector.toString()}`);
        }
    }
    /**
   * @public
   *
   * @param {Vector2} vector
   * @returns {Matrix}
   */ static columnVector2(vector) {
        return new Matrix(2, 1, [
            vector.x,
            vector.y
        ]);
    }
    /**
   * @public
   *
   * @param {Vector3} vector
   * @returns {Matrix}
   */ static columnVector3(vector) {
        return new Matrix(3, 1, [
            vector.x,
            vector.y,
            vector.z
        ]);
    }
    /**
   * @public
   *
   * @param {Vector4} vector
   * @returns {Matrix}
   */ static columnVector4(vector) {
        return new Matrix(4, 1, [
            vector.x,
            vector.y,
            vector.z,
            vector.w
        ]);
    }
    /**
   * @public
   *
   * @param {Vector2|Vector3|Vector4} vector
   * @returns {Matrix}
   */ static columnVector(vector) {
        if (vector.isVector2) {
            return Matrix.columnVector2(vector);
        } else if (vector.isVector3) {
            return Matrix.columnVector3(vector);
        } else if (vector.isVector4) {
            return Matrix.columnVector4(vector);
        } else {
            throw new Error(`undetected type of vector: ${vector.toString()}`);
        }
    }
    /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector2>} vectors
   */ static fromVectors2(vectors) {
        const dimension = 2;
        const n = vectors.length;
        const data = new ArrayType(dimension * n);
        for(let i = 0; i < n; i++){
            const vector = vectors[i];
            data[i] = vector.x;
            data[i + n] = vector.y;
        }
        return new Matrix(dimension, n, data, true);
    }
    /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector3>} vectors
   */ static fromVectors3(vectors) {
        const dimension = 3;
        const n = vectors.length;
        const data = new ArrayType(dimension * n);
        for(let i = 0; i < n; i++){
            const vector = vectors[i];
            data[i] = vector.x;
            data[i + n] = vector.y;
            data[i + 2 * n] = vector.z;
        }
        return new Matrix(dimension, n, data, true);
    }
    /**
   * Create a Matrix where each column is a vector
   * @public
   *
   * @param {Array.<Vector4>} vectors
   */ static fromVectors4(vectors) {
        const dimension = 4;
        const n = vectors.length;
        const data = new ArrayType(dimension * n);
        for(let i = 0; i < n; i++){
            const vector = vectors[i];
            data[i] = vector.x;
            data[i + n] = vector.y;
            data[i + 2 * n] = vector.z;
            data[i + 3 * n] = vector.w;
        }
        return new Matrix(dimension, n, data, true);
    }
    /**
   * @param {number} m - number of rows
   * @param {number} n - number of columns
   * @param {number[] | number} [filler]
   * @param {boolean} [fast]
   */ constructor(m, n, filler, fast){
        // @public {number}
        this.m = m;
        this.n = n;
        const size = m * n;
        // @public {number}
        this.size = size;
        let i;
        if (fast) {
            // @public {Array.<number>|Float64Array}
            this.entries = filler;
        } else {
            if (!filler) {
                filler = 0;
            }
            // entries stored in row-major format
            this.entries = new ArrayType(size);
            if (isArray(filler)) {
                assert && assert(filler.length === size);
                for(i = 0; i < size; i++){
                    this.entries[i] = filler[i];
                }
            } else {
                for(i = 0; i < size; i++){
                    this.entries[i] = filler;
                }
            }
        }
    }
};
// @public {boolean}
Matrix.prototype.isMatrix = true;
dot.register('Matrix', Matrix);
export default Matrix;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXJiaXRyYXJ5LWRpbWVuc2lvbmFsIG1hdHJpeCwgYmFzZWQgb24gSmFtYSAoaHR0cDovL21hdGgubmlzdC5nb3YvamF2YW51bWVyaWNzL2phbWEvKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgaXNBcnJheSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvaXNBcnJheS5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCAnLi9FaWdlbnZhbHVlRGVjb21wb3NpdGlvbi5qcyc7XG5pbXBvcnQgTFVEZWNvbXBvc2l0aW9uIGZyb20gJy4vTFVEZWNvbXBvc2l0aW9uLmpzJztcbmltcG9ydCBRUkRlY29tcG9zaXRpb24gZnJvbSAnLi9RUkRlY29tcG9zaXRpb24uanMnO1xuaW1wb3J0IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIGZyb20gJy4vU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24uanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5pbXBvcnQgVmVjdG9yNCBmcm9tICcuL1ZlY3RvcjQuanMnO1xuXG5jb25zdCBBcnJheVR5cGUgPSB3aW5kb3cuRmxvYXQ2NEFycmF5IHx8IEFycmF5O1xuXG5jbGFzcyBNYXRyaXgge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBudW1iZXIgb2Ygcm93c1xuICAgKiBAcGFyYW0ge251bWJlcn0gbiAtIG51bWJlciBvZiBjb2x1bW5zXG4gICAqIEBwYXJhbSB7bnVtYmVyW10gfCBudW1iZXJ9IFtmaWxsZXJdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zhc3RdXG4gICAqL1xuICBjb25zdHJ1Y3RvciggbSwgbiwgZmlsbGVyLCBmYXN0ICkge1xuICAgIC8vIEBwdWJsaWMge251bWJlcn1cbiAgICB0aGlzLm0gPSBtO1xuICAgIHRoaXMubiA9IG47XG5cbiAgICBjb25zdCBzaXplID0gbSAqIG47XG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgbGV0IGk7XG5cbiAgICBpZiAoIGZhc3QgKSB7XG4gICAgICAvLyBAcHVibGljIHtBcnJheS48bnVtYmVyPnxGbG9hdDY0QXJyYXl9XG4gICAgICB0aGlzLmVudHJpZXMgPSBmaWxsZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKCAhZmlsbGVyICkge1xuICAgICAgICBmaWxsZXIgPSAwO1xuICAgICAgfVxuXG4gICAgICAvLyBlbnRyaWVzIHN0b3JlZCBpbiByb3ctbWFqb3IgZm9ybWF0XG4gICAgICB0aGlzLmVudHJpZXMgPSBuZXcgQXJyYXlUeXBlKCBzaXplICk7XG5cbiAgICAgIGlmICggaXNBcnJheSggZmlsbGVyICkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZpbGxlci5sZW5ndGggPT09IHNpemUgKTtcblxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IHNpemU7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLmVudHJpZXNbIGkgXSA9IGZpbGxlclsgaSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBzaXplOyBpKysgKSB7XG4gICAgICAgICAgdGhpcy5lbnRyaWVzWyBpIF0gPSBmaWxsZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgY29weSgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCB0aGlzLm0sIHRoaXMubiApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrICkge1xuICAgICAgcmVzdWx0LmVudHJpZXNbIGkgXSA9IHRoaXMuZW50cmllc1sgaSBdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge0FycmF5LjxudW1iZXI+fVxuICAgKi9cbiAgZ2V0QXJyYXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50cmllcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cbiAgICovXG4gIGdldEFycmF5Q29weSgpIHtcbiAgICByZXR1cm4gbmV3IEFycmF5VHlwZSggdGhpcy5lbnRyaWVzICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0Um93RGltZW5zaW9uKCkge1xuICAgIHJldHVybiB0aGlzLm07XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0Q29sdW1uRGltZW5zaW9uKCkge1xuICAgIHJldHVybiB0aGlzLm47XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogaW5saW5lIHRoaXMgcGxhY2VzIGlmIHdlIGFyZW4ndCB1c2luZyBhbiBpbmxpbmluZyBjb21waWxlciEgKGNoZWNrIHBlcmZvcm1hbmNlKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBpbmRleCggaSwgaiApIHtcbiAgICByZXR1cm4gaSAqIHRoaXMubiArIGo7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBtYXRyaXggZWxlbWVudCAoaSxqKSB3aXRoIHRoZSBjb252ZW50aW9uIHRoYXQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcyBzdGFydCBhdCB6ZXJvXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSByb3cgaW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGogLSBjb2x1bW4gaW5kZXhcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldCggaSwgaiApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG1hdHJpeCBlbGVtZW50IChpLGopIHRvIGEgdmFsdWUgcyB3aXRoIHRoZSBjb252ZW50aW9uIHRoYXQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcyBzdGFydCBhdCB6ZXJvXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGkgLSByb3cgaW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGogLSBjb2x1bW4gaW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHMgLSB2YWx1ZSBvZiB0aGUgbWF0cml4IGVsZW1lbnRcbiAgICovXG4gIHNldCggaSwgaiwgcyApIHtcbiAgICB0aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGogKSBdID0gcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpMFxuICAgKiBAcGFyYW0ge251bWJlcn0gaTFcbiAgICogQHBhcmFtIHtudW1iZXJ9IGowXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqMVxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgZ2V0TWF0cml4KCBpMCwgaTEsIGowLCBqMSApIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCBpMSAtIGkwICsgMSwgajEgLSBqMCArIDEgKTtcbiAgICBmb3IgKCBsZXQgaSA9IGkwOyBpIDw9IGkxOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IGowOyBqIDw9IGoxOyBqKysgKSB7XG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGkgLSBpMCwgaiAtIGowICkgXSA9IHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggaSwgaiApIF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSByXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBqMFxuICAgKiBAcGFyYW0ge251bWJlcn0gajFcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGdldEFycmF5Um93TWF0cml4KCByLCBqMCwgajEgKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggci5sZW5ndGgsIGoxIC0gajAgKyAxICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgci5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gajA7IGogPD0gajE7IGorKyApIHtcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiAtIGowICkgXSA9IHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggclsgaSBdLCBqICkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBbcmVzdWx0XSAtIGFsbG93IHBhc3NpbmcgaW4gYSBwcmUtY29uc3RydWN0ZWQgbWF0cml4XG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICB0cmFuc3Bvc2UoIHJlc3VsdCApIHtcbiAgICByZXN1bHQgPSByZXN1bHQgfHwgbmV3IE1hdHJpeCggdGhpcy5uLCB0aGlzLm0gKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubSA9PT0gdGhpcy5uICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lm4gPT09IHRoaXMubSApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGosIGkgKSBdID0gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBub3JtMSgpIHtcbiAgICBsZXQgZiA9IDA7XG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICBsZXQgcyA9IDA7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgICAgcyArPSBNYXRoLmFicyggdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXSApO1xuICAgICAgfVxuICAgICAgZiA9IE1hdGgubWF4KCBmLCBzICk7XG4gICAgfVxuICAgIHJldHVybiBmO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG5vcm0yKCkge1xuICAgIHJldHVybiAoIG5ldyBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiggdGhpcyApLm5vcm0yKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBub3JtSW5mKCkge1xuICAgIGxldCBmID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGxldCBzID0gMDtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBzICs9IE1hdGguYWJzKCB0aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGogKSBdICk7XG4gICAgICB9XG4gICAgICBmID0gTWF0aC5tYXgoIGYsIHMgKTtcbiAgICB9XG4gICAgcmV0dXJuIGY7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbm9ybUYoKSB7XG4gICAgbGV0IGYgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIGYgPSBNYXRyaXguaHlwb3QoIGYsIHRoaXMuZW50cmllc1sgdGhpcy5pbmRleCggaSwgaiApIF0gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGY7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgdW1pbnVzKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubSwgdGhpcy5uICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSAtdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHBsdXMoIG1hdHJpeCApIHtcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHJlc3VsdC5pbmRleCggaSwgaiApO1xuICAgICAgICByZXN1bHQuZW50cmllc1sgaW5kZXggXSA9IHRoaXMuZW50cmllc1sgaW5kZXggXSArIG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgcGx1c0VxdWFscyggbWF0cml4ICkge1xuICAgIHRoaXMuY2hlY2tNYXRyaXhEaW1lbnNpb25zKCBtYXRyaXggKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcbiAgICAgICAgdGhpcy5lbnRyaWVzWyBpbmRleCBdID0gdGhpcy5lbnRyaWVzWyBpbmRleCBdICsgbWF0cml4LmVudHJpZXNbIGluZGV4IF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0aGlzIE1hdHJpeCAocmF0aW89MCkgYW5kIGFub3RoZXIgTWF0cml4IChyYXRpbz0xKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYXRpbyAtIE5vdCBuZWNlc3NhcmlseSBjb25zdHJhaW5lZCBpbiBbMCwgMV1cbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGJsZW5kRXF1YWxzKCBtYXRyaXgsIHJhdGlvICkge1xuICAgIHRoaXMuY2hlY2tNYXRyaXhEaW1lbnNpb25zKCBtYXRyaXggKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcbiAgICAgICAgY29uc3QgYSA9IHRoaXMuZW50cmllc1sgaW5kZXggXTtcbiAgICAgICAgY29uc3QgYiA9IG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgICB0aGlzLmVudHJpZXNbIGluZGV4IF0gPSBhICsgKCBiIC0gYSApICogcmF0aW87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgbWludXMoIG1hdHJpeCApIHtcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIGluZGV4IF0gPSB0aGlzLmVudHJpZXNbIGluZGV4IF0gLSBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIG1pbnVzRXF1YWxzKCBtYXRyaXggKSB7XG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleCggaSwgaiApO1xuICAgICAgICB0aGlzLmVudHJpZXNbIGluZGV4IF0gPSB0aGlzLmVudHJpZXNbIGluZGV4IF0gLSBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICBhcnJheVRpbWVzKCBtYXRyaXggKSB7XG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubSwgdGhpcy5uICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSByZXN1bHQuaW5kZXgoIGksIGogKTtcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIGluZGV4IF0gPSB0aGlzLmVudHJpZXNbIGluZGV4IF0gKiBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGFycmF5VGltZXNFcXVhbHMoIG1hdHJpeCApIHtcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XG4gICAgICAgIHRoaXMuZW50cmllc1sgaW5kZXggXSA9IHRoaXMuZW50cmllc1sgaW5kZXggXSAqIG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGFycmF5UmlnaHREaXZpZGUoIG1hdHJpeCApIHtcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubjsgaisrICkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5kZXgoIGksIGogKTtcbiAgICAgICAgcmVzdWx0LmVudHJpZXNbIGluZGV4IF0gPSB0aGlzLmVudHJpZXNbIGluZGV4IF0gLyBtYXRyaXguZW50cmllc1sgaW5kZXggXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGFycmF5UmlnaHREaXZpZGVFcXVhbHMoIG1hdHJpeCApIHtcbiAgICB0aGlzLmNoZWNrTWF0cml4RGltZW5zaW9ucyggbWF0cml4ICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XG4gICAgICAgIHRoaXMuZW50cmllc1sgaW5kZXggXSA9IHRoaXMuZW50cmllc1sgaW5kZXggXSAvIG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGFycmF5TGVmdERpdmlkZSggbWF0cml4ICkge1xuICAgIHRoaXMuY2hlY2tNYXRyaXhEaW1lbnNpb25zKCBtYXRyaXggKTtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCB0aGlzLm0sIHRoaXMubiApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleCggaSwgaiApO1xuICAgICAgICByZXN1bHQuZW50cmllc1sgaW5kZXggXSA9IG1hdHJpeC5lbnRyaWVzWyBpbmRleCBdIC8gdGhpcy5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgYXJyYXlMZWZ0RGl2aWRlRXF1YWxzKCBtYXRyaXggKSB7XG4gICAgdGhpcy5jaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleCggaSwgaiApO1xuICAgICAgICB0aGlzLmVudHJpZXNbIGluZGV4IF0gPSBtYXRyaXguZW50cmllc1sgaW5kZXggXSAvIHRoaXMuZW50cmllc1sgaW5kZXggXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeHxudW1iZXJ9IG1hdHJpeE9yU2NhbGFyXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICB0aW1lcyggbWF0cml4T3JTY2FsYXIgKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBsZXQgaTtcbiAgICBsZXQgajtcbiAgICBsZXQgaztcbiAgICBsZXQgcztcbiAgICBsZXQgbWF0cml4O1xuICAgIGlmICggbWF0cml4T3JTY2FsYXIuaXNNYXRyaXggKSB7XG4gICAgICBtYXRyaXggPSBtYXRyaXhPclNjYWxhcjtcbiAgICAgIGlmICggbWF0cml4Lm0gIT09IHRoaXMubiApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGlubmVyIGRpbWVuc2lvbnMgbXVzdCBhZ3JlZS4nICk7XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBuZXcgTWF0cml4KCB0aGlzLm0sIG1hdHJpeC5uICk7XG4gICAgICBjb25zdCBtYXRyaXhjb2xqID0gbmV3IEFycmF5VHlwZSggdGhpcy5uICk7XG4gICAgICBmb3IgKCBqID0gMDsgaiA8IG1hdHJpeC5uOyBqKysgKSB7XG4gICAgICAgIGZvciAoIGsgPSAwOyBrIDwgdGhpcy5uOyBrKysgKSB7XG4gICAgICAgICAgbWF0cml4Y29salsgayBdID0gbWF0cml4LmVudHJpZXNbIG1hdHJpeC5pbmRleCggaywgaiApIF07XG4gICAgICAgIH1cbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLm07IGkrKyApIHtcbiAgICAgICAgICBzID0gMDtcbiAgICAgICAgICBmb3IgKCBrID0gMDsgayA8IHRoaXMubjsgaysrICkge1xuICAgICAgICAgICAgcyArPSB0aGlzLmVudHJpZXNbIHRoaXMuaW5kZXgoIGksIGsgKSBdICogbWF0cml4Y29salsgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBqICkgXSA9IHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcyA9IG1hdHJpeE9yU2NhbGFyO1xuICAgICAgcmVzdWx0ID0gbmV3IE1hdHJpeCggdGhpcy5tLCB0aGlzLm4gKTtcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSBzICogdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBqICkgXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc1xuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgdGltZXNFcXVhbHMoIHMgKSB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4KCBpLCBqICk7XG4gICAgICAgIHRoaXMuZW50cmllc1sgaW5kZXggXSA9IHMgKiB0aGlzLmVudHJpZXNbIGluZGV4IF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc29sdmUoIG1hdHJpeCApIHtcbiAgICByZXR1cm4gKCB0aGlzLm0gPT09IHRoaXMubiA/ICggbmV3IExVRGVjb21wb3NpdGlvbiggdGhpcyApICkuc29sdmUoIG1hdHJpeCApIDpcbiAgICAgICAgICAgICAoIG5ldyBRUkRlY29tcG9zaXRpb24oIHRoaXMgKSApLnNvbHZlKCBtYXRyaXggKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeFxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc29sdmVUcmFuc3Bvc2UoIG1hdHJpeCApIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc3Bvc2UoKS5zb2x2ZSggbWF0cml4LnRyYW5zcG9zZSgpICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgaW52ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zb2x2ZSggTWF0cml4LmlkZW50aXR5KCB0aGlzLm0sIHRoaXMubSApICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZGV0KCkge1xuICAgIHJldHVybiBuZXcgTFVEZWNvbXBvc2l0aW9uKCB0aGlzICkuZGV0KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgcmFuaygpIHtcbiAgICByZXR1cm4gbmV3IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uKCB0aGlzICkucmFuaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGNvbmQoKSB7XG4gICAgcmV0dXJuIG5ldyBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiggdGhpcyApLmNvbmQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICB0cmFjZSgpIHtcbiAgICBsZXQgdCA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oIHRoaXMubSwgdGhpcy5uICk7IGkrKyApIHtcbiAgICAgIHQgKz0gdGhpcy5lbnRyaWVzWyB0aGlzLmluZGV4KCBpLCBpICkgXTtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gICAqL1xuICBjaGVja01hdHJpeERpbWVuc2lvbnMoIG1hdHJpeCApIHtcbiAgICBpZiAoIG1hdHJpeC5tICE9PSB0aGlzLm0gfHwgbWF0cml4Lm4gIT09IHRoaXMubiApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCBkaW1lbnNpb25zIG11c3QgYWdyZWUuJyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIHJlc3VsdCArPSBgZGltOiAke3RoaXMuZ2V0Um93RGltZW5zaW9uKCl9eCR7dGhpcy5nZXRDb2x1bW5EaW1lbnNpb24oKX1cXG5gO1xuICAgIGZvciAoIGxldCByb3cgPSAwOyByb3cgPCB0aGlzLmdldFJvd0RpbWVuc2lvbigpOyByb3crKyApIHtcbiAgICAgIGZvciAoIGxldCBjb2wgPSAwOyBjb2wgPCB0aGlzLmdldENvbHVtbkRpbWVuc2lvbigpOyBjb2wrKyApIHtcbiAgICAgICAgcmVzdWx0ICs9IGAke3RoaXMuZ2V0KCByb3csIGNvbCApfSBgO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9ICdcXG4nO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2ZWN0b3IgdGhhdCBpcyBjb250YWluZWQgaW4gdGhlIHNwZWNpZmllZCBjb2x1bW5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1uXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxuICAgKi9cbiAgZXh0cmFjdFZlY3RvcjIoIGNvbHVtbiApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm0gPT09IDIgKTsgLy8gcm93cyBzaG91bGQgbWF0Y2ggdmVjdG9yIGRpbWVuc2lvblxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5nZXQoIDAsIGNvbHVtbiApLCB0aGlzLmdldCggMSwgY29sdW1uICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmVjdG9yIHRoYXQgaXMgY29udGFpbmVkIGluIHRoZSBzcGVjaWZpZWQgY29sdW1uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtblxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cbiAgICovXG4gIGV4dHJhY3RWZWN0b3IzKCBjb2x1bW4gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tID09PSAzICk7IC8vIHJvd3Mgc2hvdWxkIG1hdGNoIHZlY3RvciBkaW1lbnNpb25cbiAgICByZXR1cm4gbmV3IFZlY3RvcjMoIHRoaXMuZ2V0KCAwLCBjb2x1bW4gKSwgdGhpcy5nZXQoIDEsIGNvbHVtbiApLCB0aGlzLmdldCggMiwgY29sdW1uICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmVjdG9yIHRoYXQgaXMgY29udGFpbmVkIGluIHRoZSBzcGVjaWZpZWQgY29sdW1uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtblxuICAgKiBAcmV0dXJucyB7VmVjdG9yNH1cbiAgICovXG4gIGV4dHJhY3RWZWN0b3I0KCBjb2x1bW4gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tID09PSA0ICk7IC8vIHJvd3Mgc2hvdWxkIG1hdGNoIHZlY3RvciBkaW1lbnNpb25cbiAgICByZXR1cm4gbmV3IFZlY3RvcjQoIHRoaXMuZ2V0KCAwLCBjb2x1bW4gKSwgdGhpcy5nZXQoIDEsIGNvbHVtbiApLCB0aGlzLmdldCggMiwgY29sdW1uICksIHRoaXMuZ2V0KCAzLCBjb2x1bW4gKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1cnJlbnQgbWF0cml4IHRvIHRoZSB2YWx1ZXMgb2YgdGhlIGxpc3RlZCBjb2x1bW4gdmVjdG9ycyAoVmVjdG9yMykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMz59IHZlY3RvcnNcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHNldFZlY3RvcnMzKCB2ZWN0b3JzICkge1xuICAgIGNvbnN0IG0gPSAzO1xuICAgIGNvbnN0IG4gPSB2ZWN0b3JzLmxlbmd0aDtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubSA9PT0gbSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubiA9PT0gbiApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgY29uc3QgdmVjdG9yID0gdmVjdG9yc1sgaSBdO1xuICAgICAgdGhpcy5lbnRyaWVzWyBpIF0gPSB2ZWN0b3IueDtcbiAgICAgIHRoaXMuZW50cmllc1sgaSArIG4gXSA9IHZlY3Rvci55O1xuICAgICAgdGhpcy5lbnRyaWVzWyBpICsgMiAqIG4gXSA9IHZlY3Rvci56O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIHNxcnQoYV4yICsgYl4yKSB3aXRob3V0IHVuZGVyL292ZXJmbG93LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBzdGF0aWMgaHlwb3QoIGEsIGIgKSB7XG4gICAgbGV0IHI7XG4gICAgaWYgKCBNYXRoLmFicyggYSApID4gTWF0aC5hYnMoIGIgKSApIHtcbiAgICAgIHIgPSBiIC8gYTtcbiAgICAgIHIgPSBNYXRoLmFicyggYSApICogTWF0aC5zcXJ0KCAxICsgciAqIHIgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGIgIT09IDAgKSB7XG4gICAgICByID0gYSAvIGI7XG4gICAgICByID0gTWF0aC5hYnMoIGIgKSAqIE1hdGguc3FydCggMSArIHIgKiByICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgciA9IDAuMDtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGlzIG1hdHJpeCB0byB0aGUgaWRlbnRpdHkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1cbiAgICogQHBhcmFtIHtudW1iZXJ9IG5cbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHN0YXRpYyBpZGVudGl0eSggbSwgbiApIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCBtLCBuICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbjsgaisrICkge1xuICAgICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBqICkgXSA9ICggaSA9PT0gaiA/IDEuMCA6IDAuMCApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzcXVhcmUgZGlhZ29uYWwgbWF0cml4LCB3aG9zZSBlbnRyaWVzIGFsb25nIHRoZSBkaWFnb25hbCBhcmUgc3BlY2lmaWVkIGJ5IHRoZSBwYXNzZWQtaW4gYXJyYXksIGFuZCB0aGVcbiAgICogb3RoZXIgZW50cmllcyBhcmUgMC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBkaWFnb25hbFZhbHVlc1xuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc3RhdGljIGRpYWdvbmFsTWF0cml4KCBkaWFnb25hbFZhbHVlcyApIHtcbiAgICBjb25zdCBuID0gZGlhZ29uYWxWYWx1ZXMubGVuZ3RoO1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIG4sIG4gKTsgLy8gU2hvdWxkIGZpbGwgaW4gemVyb3NcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XG4gICAgICByZXN1bHQuZW50cmllc1sgcmVzdWx0LmluZGV4KCBpLCBpICkgXSA9IGRpYWdvbmFsVmFsdWVzWyBpIF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc3RhdGljIHJvd1ZlY3RvcjIoIHZlY3RvciApIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggMSwgMiwgWyB2ZWN0b3IueCwgdmVjdG9yLnkgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3JcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHN0YXRpYyByb3dWZWN0b3IzKCB2ZWN0b3IgKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgoIDEsIDMsIFsgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiBdICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjR9IHZlY3RvclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc3RhdGljIHJvd1ZlY3RvcjQoIHZlY3RvciApIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggMSwgNCwgWyB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCB2ZWN0b3IudyBdICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ8VmVjdG9yM3xWZWN0b3I0fSB2ZWN0b3JcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHN0YXRpYyByb3dWZWN0b3IoIHZlY3RvciApIHtcbiAgICBpZiAoIHZlY3Rvci5pc1ZlY3RvcjIgKSB7XG4gICAgICByZXR1cm4gTWF0cml4LnJvd1ZlY3RvcjIoIHZlY3RvciApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdmVjdG9yLmlzVmVjdG9yMyApIHtcbiAgICAgIHJldHVybiBNYXRyaXgucm93VmVjdG9yMyggdmVjdG9yICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2ZWN0b3IuaXNWZWN0b3I0ICkge1xuICAgICAgcmV0dXJuIE1hdHJpeC5yb3dWZWN0b3I0KCB2ZWN0b3IgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bmRldGVjdGVkIHR5cGUgb2YgdmVjdG9yOiAke3ZlY3Rvci50b1N0cmluZygpfWAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc3RhdGljIGNvbHVtblZlY3RvcjIoIHZlY3RvciApIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggMiwgMSwgWyB2ZWN0b3IueCwgdmVjdG9yLnkgXSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3JcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHN0YXRpYyBjb2x1bW5WZWN0b3IzKCB2ZWN0b3IgKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgoIDMsIDEsIFsgdmVjdG9yLngsIHZlY3Rvci55LCB2ZWN0b3IueiBdICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjR9IHZlY3RvclxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgc3RhdGljIGNvbHVtblZlY3RvcjQoIHZlY3RvciApIHtcbiAgICByZXR1cm4gbmV3IE1hdHJpeCggNCwgMSwgWyB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56LCB2ZWN0b3IudyBdICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ8VmVjdG9yM3xWZWN0b3I0fSB2ZWN0b3JcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHN0YXRpYyBjb2x1bW5WZWN0b3IoIHZlY3RvciApIHtcbiAgICBpZiAoIHZlY3Rvci5pc1ZlY3RvcjIgKSB7XG4gICAgICByZXR1cm4gTWF0cml4LmNvbHVtblZlY3RvcjIoIHZlY3RvciApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdmVjdG9yLmlzVmVjdG9yMyApIHtcbiAgICAgIHJldHVybiBNYXRyaXguY29sdW1uVmVjdG9yMyggdmVjdG9yICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2ZWN0b3IuaXNWZWN0b3I0ICkge1xuICAgICAgcmV0dXJuIE1hdHJpeC5jb2x1bW5WZWN0b3I0KCB2ZWN0b3IgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bmRldGVjdGVkIHR5cGUgb2YgdmVjdG9yOiAke3ZlY3Rvci50b1N0cmluZygpfWAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgTWF0cml4IHdoZXJlIGVhY2ggY29sdW1uIGlzIGEgdmVjdG9yXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHZlY3RvcnNcbiAgICovXG4gIHN0YXRpYyBmcm9tVmVjdG9yczIoIHZlY3RvcnMgKSB7XG4gICAgY29uc3QgZGltZW5zaW9uID0gMjtcbiAgICBjb25zdCBuID0gdmVjdG9ycy5sZW5ndGg7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheVR5cGUoIGRpbWVuc2lvbiAqIG4gKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG47IGkrKyApIHtcbiAgICAgIGNvbnN0IHZlY3RvciA9IHZlY3RvcnNbIGkgXTtcbiAgICAgIGRhdGFbIGkgXSA9IHZlY3Rvci54O1xuICAgICAgZGF0YVsgaSArIG4gXSA9IHZlY3Rvci55O1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWF0cml4KCBkaW1lbnNpb24sIG4sIGRhdGEsIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBNYXRyaXggd2hlcmUgZWFjaCBjb2x1bW4gaXMgYSB2ZWN0b3JcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IzPn0gdmVjdG9yc1xuICAgKi9cbiAgc3RhdGljIGZyb21WZWN0b3JzMyggdmVjdG9ycyApIHtcbiAgICBjb25zdCBkaW1lbnNpb24gPSAzO1xuICAgIGNvbnN0IG4gPSB2ZWN0b3JzLmxlbmd0aDtcbiAgICBjb25zdCBkYXRhID0gbmV3IEFycmF5VHlwZSggZGltZW5zaW9uICogbiApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgY29uc3QgdmVjdG9yID0gdmVjdG9yc1sgaSBdO1xuICAgICAgZGF0YVsgaSBdID0gdmVjdG9yLng7XG4gICAgICBkYXRhWyBpICsgbiBdID0gdmVjdG9yLnk7XG4gICAgICBkYXRhWyBpICsgMiAqIG4gXSA9IHZlY3Rvci56O1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWF0cml4KCBkaW1lbnNpb24sIG4sIGRhdGEsIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBNYXRyaXggd2hlcmUgZWFjaCBjb2x1bW4gaXMgYSB2ZWN0b3JcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3I0Pn0gdmVjdG9yc1xuICAgKi9cbiAgc3RhdGljIGZyb21WZWN0b3JzNCggdmVjdG9ycyApIHtcbiAgICBjb25zdCBkaW1lbnNpb24gPSA0O1xuICAgIGNvbnN0IG4gPSB2ZWN0b3JzLmxlbmd0aDtcbiAgICBjb25zdCBkYXRhID0gbmV3IEFycmF5VHlwZSggZGltZW5zaW9uICogbiApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgY29uc3QgdmVjdG9yID0gdmVjdG9yc1sgaSBdO1xuICAgICAgZGF0YVsgaSBdID0gdmVjdG9yLng7XG4gICAgICBkYXRhWyBpICsgbiBdID0gdmVjdG9yLnk7XG4gICAgICBkYXRhWyBpICsgMiAqIG4gXSA9IHZlY3Rvci56O1xuICAgICAgZGF0YVsgaSArIDMgKiBuIF0gPSB2ZWN0b3IudztcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1hdHJpeCggZGltZW5zaW9uLCBuLCBkYXRhLCB0cnVlICk7XG4gIH1cbn1cblxuLy8gQHB1YmxpYyB7Ym9vbGVhbn1cbk1hdHJpeC5wcm90b3R5cGUuaXNNYXRyaXggPSB0cnVlO1xuXG5kb3QucmVnaXN0ZXIoICdNYXRyaXgnLCBNYXRyaXggKTtcbmV4cG9ydCBkZWZhdWx0IE1hdHJpeDsiXSwibmFtZXMiOlsiaXNBcnJheSIsImRvdCIsIkxVRGVjb21wb3NpdGlvbiIsIlFSRGVjb21wb3NpdGlvbiIsIlNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJWZWN0b3I0IiwiQXJyYXlUeXBlIiwid2luZG93IiwiRmxvYXQ2NEFycmF5IiwiQXJyYXkiLCJNYXRyaXgiLCJjb3B5IiwicmVzdWx0IiwibSIsIm4iLCJpIiwic2l6ZSIsImVudHJpZXMiLCJnZXRBcnJheSIsImdldEFycmF5Q29weSIsImdldFJvd0RpbWVuc2lvbiIsImdldENvbHVtbkRpbWVuc2lvbiIsImluZGV4IiwiaiIsImdldCIsInNldCIsInMiLCJnZXRNYXRyaXgiLCJpMCIsImkxIiwiajAiLCJqMSIsImdldEFycmF5Um93TWF0cml4IiwiciIsImxlbmd0aCIsInRyYW5zcG9zZSIsImFzc2VydCIsIm5vcm0xIiwiZiIsIk1hdGgiLCJhYnMiLCJtYXgiLCJub3JtMiIsIm5vcm1JbmYiLCJub3JtRiIsImh5cG90IiwidW1pbnVzIiwicGx1cyIsIm1hdHJpeCIsImNoZWNrTWF0cml4RGltZW5zaW9ucyIsInBsdXNFcXVhbHMiLCJibGVuZEVxdWFscyIsInJhdGlvIiwiYSIsImIiLCJtaW51cyIsIm1pbnVzRXF1YWxzIiwiYXJyYXlUaW1lcyIsImFycmF5VGltZXNFcXVhbHMiLCJhcnJheVJpZ2h0RGl2aWRlIiwiYXJyYXlSaWdodERpdmlkZUVxdWFscyIsImFycmF5TGVmdERpdmlkZSIsImFycmF5TGVmdERpdmlkZUVxdWFscyIsInRpbWVzIiwibWF0cml4T3JTY2FsYXIiLCJrIiwiaXNNYXRyaXgiLCJFcnJvciIsIm1hdHJpeGNvbGoiLCJ0aW1lc0VxdWFscyIsInNvbHZlIiwic29sdmVUcmFuc3Bvc2UiLCJpbnZlcnNlIiwiaWRlbnRpdHkiLCJkZXQiLCJyYW5rIiwiY29uZCIsInRyYWNlIiwidCIsIm1pbiIsInRvU3RyaW5nIiwicm93IiwiY29sIiwiZXh0cmFjdFZlY3RvcjIiLCJjb2x1bW4iLCJleHRyYWN0VmVjdG9yMyIsImV4dHJhY3RWZWN0b3I0Iiwic2V0VmVjdG9yczMiLCJ2ZWN0b3JzIiwidmVjdG9yIiwieCIsInkiLCJ6Iiwic3FydCIsImRpYWdvbmFsTWF0cml4IiwiZGlhZ29uYWxWYWx1ZXMiLCJyb3dWZWN0b3IyIiwicm93VmVjdG9yMyIsInJvd1ZlY3RvcjQiLCJ3Iiwicm93VmVjdG9yIiwiaXNWZWN0b3IyIiwiaXNWZWN0b3IzIiwiaXNWZWN0b3I0IiwiY29sdW1uVmVjdG9yMiIsImNvbHVtblZlY3RvcjMiLCJjb2x1bW5WZWN0b3I0IiwiY29sdW1uVmVjdG9yIiwiZnJvbVZlY3RvcnMyIiwiZGltZW5zaW9uIiwiZGF0YSIsImZyb21WZWN0b3JzMyIsImZyb21WZWN0b3JzNCIsImNvbnN0cnVjdG9yIiwiZmlsbGVyIiwiZmFzdCIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPLCtCQUErQjtBQUN0QyxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBQ25ELE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MsZ0NBQWdDLGtDQUFrQztBQUN6RSxPQUFPQyxhQUFhLGVBQWU7QUFDbkMsT0FBT0MsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLGFBQWEsZUFBZTtBQUVuQyxNQUFNQyxZQUFZQyxPQUFPQyxZQUFZLElBQUlDO0FBRXpDLElBQUEsQUFBTUMsU0FBTixNQUFNQTtJQTRDSjs7OztHQUlDLEdBQ0RDLE9BQU87UUFDTCxNQUFNQyxTQUFTLElBQUlGLE9BQVEsSUFBSSxDQUFDRyxDQUFDLEVBQUUsSUFBSSxDQUFDQyxDQUFDO1FBQ3pDLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQ0MsSUFBSSxFQUFFRCxJQUFN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