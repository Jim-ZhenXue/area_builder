// Copyright 2015-2020, University of Colorado Boulder
/**
 * Fast 3x3 matrix computations at the lower level, including an SVD implementation that is fully stable.
 * Overall, it uses a heavily mutable style, passing in the object where the result(s) will be stored.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
/*
 * Matrices are stored as flat typed arrays with row-major indices. For example, for a 3x3:
 * [0] [1] [2]
 * [3] [4] [5]
 * [6] [7] [8]
 *
 * NOTE: We assume the typed arrays are AT LEAST as long as necessary (but could be longer). This allows us to use
 * an array as big as the largest one we'll need.
 */ // constants
const SQRT_HALF = Math.sqrt(0.5);
const MatrixOps3 = {
    // use typed arrays if possible
    Array: dot.FastArray,
    /*---------------------------------------------------------------------------*
   * 3x3 matrix math
   *----------------------------------------------------------------------------*/ /*
   * From 0-indexed row and column indices, returns the index into the flat array
   *
   * @param {number} row
   * @param {number} col
   */ index3 (row, col) {
        assert && assert(row >= 0 && row < 3);
        assert && assert(col >= 0 && col < 3);
        return 3 * row + col;
    },
    /*
   * Copies one matrix into another
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ set3 (matrix, result) {
        assert && assert(matrix.length >= 9);
        assert && assert(result.length >= 9);
        result[0] = matrix[0];
        result[1] = matrix[1];
        result[2] = matrix[2];
        result[3] = matrix[3];
        result[4] = matrix[4];
        result[5] = matrix[5];
        result[6] = matrix[6];
        result[7] = matrix[7];
        result[8] = matrix[8];
    },
    /*
   * Writes the transpose of the input matrix into the result matrix (in-place modification is OK)
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ transpose3 (matrix, result) {
        assert && assert(matrix.length >= 9);
        assert && assert(result.length >= 9);
        const m1 = matrix[3];
        const m2 = matrix[6];
        const m3 = matrix[1];
        const m5 = matrix[7];
        const m6 = matrix[2];
        const m7 = matrix[5];
        result[0] = matrix[0];
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = matrix[4];
        result[5] = m5;
        result[6] = m6;
        result[7] = m7;
        result[8] = matrix[8];
    },
    /*
   * The determinant of a 3x3 matrix
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @returns {number} - The determinant. 0 indicates a singular (non-invertible) matrix.
   */ det3 (matrix) {
        assert && assert(matrix.length >= 9);
        return matrix[0] * matrix[4] * matrix[8] + matrix[1] * matrix[5] * matrix[6] + matrix[2] * matrix[3] * matrix[7] - matrix[2] * matrix[4] * matrix[6] - matrix[1] * matrix[3] * matrix[8] - matrix[0] * matrix[5] * matrix[7];
    },
    /*
   * Writes the matrix multiplication ( left * right ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ mult3 (left, right, result) {
        assert && assert(left.length >= 9);
        assert && assert(right.length >= 9);
        assert && assert(result.length >= 9);
        const m0 = left[0] * right[0] + left[1] * right[3] + left[2] * right[6];
        const m1 = left[0] * right[1] + left[1] * right[4] + left[2] * right[7];
        const m2 = left[0] * right[2] + left[1] * right[5] + left[2] * right[8];
        const m3 = left[3] * right[0] + left[4] * right[3] + left[5] * right[6];
        const m4 = left[3] * right[1] + left[4] * right[4] + left[5] * right[7];
        const m5 = left[3] * right[2] + left[4] * right[5] + left[5] * right[8];
        const m6 = left[6] * right[0] + left[7] * right[3] + left[8] * right[6];
        const m7 = left[6] * right[1] + left[7] * right[4] + left[8] * right[7];
        const m8 = left[6] * right[2] + left[7] * right[5] + left[8] * right[8];
        result[0] = m0;
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = m4;
        result[5] = m5;
        result[6] = m6;
        result[7] = m7;
        result[8] = m8;
    },
    /*
   * Writes the matrix multiplication ( transpose( left ) * right ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ mult3LeftTranspose (left, right, result) {
        assert && assert(left.length >= 9);
        assert && assert(right.length >= 9);
        assert && assert(result.length >= 9);
        const m0 = left[0] * right[0] + left[3] * right[3] + left[6] * right[6];
        const m1 = left[0] * right[1] + left[3] * right[4] + left[6] * right[7];
        const m2 = left[0] * right[2] + left[3] * right[5] + left[6] * right[8];
        const m3 = left[1] * right[0] + left[4] * right[3] + left[7] * right[6];
        const m4 = left[1] * right[1] + left[4] * right[4] + left[7] * right[7];
        const m5 = left[1] * right[2] + left[4] * right[5] + left[7] * right[8];
        const m6 = left[2] * right[0] + left[5] * right[3] + left[8] * right[6];
        const m7 = left[2] * right[1] + left[5] * right[4] + left[8] * right[7];
        const m8 = left[2] * right[2] + left[5] * right[5] + left[8] * right[8];
        result[0] = m0;
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = m4;
        result[5] = m5;
        result[6] = m6;
        result[7] = m7;
        result[8] = m8;
    },
    /*
   * Writes the matrix multiplication ( left * transpose( right ) ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ mult3RightTranspose (left, right, result) {
        assert && assert(left.length >= 9);
        assert && assert(right.length >= 9);
        assert && assert(result.length >= 9);
        const m0 = left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
        const m1 = left[0] * right[3] + left[1] * right[4] + left[2] * right[5];
        const m2 = left[0] * right[6] + left[1] * right[7] + left[2] * right[8];
        const m3 = left[3] * right[0] + left[4] * right[1] + left[5] * right[2];
        const m4 = left[3] * right[3] + left[4] * right[4] + left[5] * right[5];
        const m5 = left[3] * right[6] + left[4] * right[7] + left[5] * right[8];
        const m6 = left[6] * right[0] + left[7] * right[1] + left[8] * right[2];
        const m7 = left[6] * right[3] + left[7] * right[4] + left[8] * right[5];
        const m8 = left[6] * right[6] + left[7] * right[7] + left[8] * right[8];
        result[0] = m0;
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = m4;
        result[5] = m5;
        result[6] = m6;
        result[7] = m7;
        result[8] = m8;
    },
    /*
   * Writes the matrix multiplication ( transpose( left ) * transpose( right ) ) into result.
   * (in-place modification is OK)
   * NOTE: This is equivalent to transpose( right * left ).
   *
   * @param {FastMath.Array} left - [input] 3x3 Matrix
   * @param {FastMath.Array} right - [input] 3x3 Matrix
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ mult3BothTranspose (left, right, result) {
        assert && assert(left.length >= 9);
        assert && assert(right.length >= 9);
        assert && assert(result.length >= 9);
        const m0 = left[0] * right[0] + left[3] * right[1] + left[6] * right[2];
        const m1 = left[0] * right[3] + left[3] * right[4] + left[6] * right[5];
        const m2 = left[0] * right[6] + left[3] * right[7] + left[6] * right[8];
        const m3 = left[1] * right[0] + left[4] * right[1] + left[7] * right[2];
        const m4 = left[1] * right[3] + left[4] * right[4] + left[7] * right[5];
        const m5 = left[1] * right[6] + left[4] * right[7] + left[7] * right[8];
        const m6 = left[2] * right[0] + left[5] * right[1] + left[8] * right[2];
        const m7 = left[2] * right[3] + left[5] * right[4] + left[8] * right[5];
        const m8 = left[2] * right[6] + left[5] * right[7] + left[8] * right[8];
        result[0] = m0;
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = m4;
        result[5] = m5;
        result[6] = m6;
        result[7] = m7;
        result[8] = m8;
    },
    /*
   * Writes the product ( matrix * vector ) into result. (in-place modification is OK)
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {Vector3} vector - [input]
   * @param {Vector3} result - [output]
   */ mult3Vector3 (matrix, vector, result) {
        assert && assert(matrix.length >= 9);
        const x = matrix[0] * vector.x + matrix[1] * vector.y + matrix[2] * vector.z;
        const y = matrix[3] * vector.x + matrix[4] * vector.y + matrix[5] * vector.z;
        const z = matrix[6] * vector.x + matrix[7] * vector.y + matrix[8] * vector.z;
        result.x = x;
        result.y = y;
        result.z = z;
    },
    /*
   * Swaps two columns in a matrix, negating one of them to maintain the sign of the determinant.
   *
   * @param {FastMath.Array} matrix - [input] 3x3 Matrix
   * @param {number} idx0 - In the range [0,2]
   * @param {number} idx1 - In the range [0,2]
   */ swapNegateColumn (matrix, idx0, idx1) {
        assert && assert(matrix.length >= 9);
        const tmp0 = matrix[idx0];
        const tmp1 = matrix[idx0 + 3];
        const tmp2 = matrix[idx0 + 6];
        matrix[idx0] = matrix[idx1];
        matrix[idx0 + 3] = matrix[idx1 + 3];
        matrix[idx0 + 6] = matrix[idx1 + 6];
        matrix[idx1] = -tmp0;
        matrix[idx1 + 3] = -tmp1;
        matrix[idx1 + 6] = -tmp2;
    },
    /*
   * Sets the result matrix to the identity.
   *
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   */ setIdentity3 (result) {
        result[0] = result[4] = result[8] = 1; // diagonal
        result[1] = result[2] = result[3] = result[5] = result[6] = result[7] = 0; // non-diagonal
    },
    /*
   * Sets the result matrix to the Givens rotation (performs a rotation between two components). Instead of an angle,
   * the 'cos' and 'sin' values are passed in directly since we skip the trigonometry almost everywhere we can.
   *
   * See http://en.wikipedia.org/wiki/Givens_rotation (note that we use the other sign convention for the sin)
   *
   * @param {FastMath.Array} result - [output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */ setGivens3 (result, cos, sin, idx0, idx1) {
        assert && assert(idx0 < idx1);
        this.setIdentity3(result);
        result[this.index3(idx0, idx0)] = cos;
        result[this.index3(idx1, idx1)] = cos;
        result[this.index3(idx0, idx1)] = sin;
        result[this.index3(idx1, idx0)] = -sin;
    },
    /*
   * Efficiently pre-multiples the matrix in-place by the specified Givens rotation (matrix <= rotation * matrix).
   * Equivalent to using setGivens3 and mult3.
   *
   * @param {FastMath.Array} result - [input AND output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */ preMult3Givens (matrix, cos, sin, idx0, idx1) {
        const baseA = idx0 * 3;
        const baseB = idx1 * 3;
        // lexicographically in column-major order for "affine" section
        const a = cos * matrix[baseA + 0] + sin * matrix[baseB + 0];
        const b = cos * matrix[baseB + 0] - sin * matrix[baseA + 0];
        const c = cos * matrix[baseA + 1] + sin * matrix[baseB + 1];
        const d = cos * matrix[baseB + 1] - sin * matrix[baseA + 1];
        const e = cos * matrix[baseA + 2] + sin * matrix[baseB + 2];
        const f = cos * matrix[baseB + 2] - sin * matrix[baseA + 2];
        matrix[baseA + 0] = a;
        matrix[baseB + 0] = b;
        matrix[baseA + 1] = c;
        matrix[baseB + 1] = d;
        matrix[baseA + 2] = e;
        matrix[baseB + 2] = f;
    },
    /*
   * Efficiently post-multiples the matrix in-place by the transpose of the specified Givens rotation
   * (matrix <= matrix * rotation^T).
   * Equivalent to using setGivens3 and mult3RightTranspose.
   *
   * @param {FastMath.Array} result - [input AND output] 3x3 Matrix
   * @param {number} cos - [input] The cosine of the Givens rotation angle
   * @param {number} sin - [input] The sine of the Givens rotation angle
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */ postMult3Givens (matrix, cos, sin, idx0, idx1) {
        // lexicographically in row-major order for the "transposed affine" section
        const a = cos * matrix[idx0 + 0] + sin * matrix[idx1 + 0];
        const b = cos * matrix[idx1 + 0] - sin * matrix[idx0 + 0];
        const c = cos * matrix[idx0 + 3] + sin * matrix[idx1 + 3];
        const d = cos * matrix[idx1 + 3] - sin * matrix[idx0 + 3];
        const e = cos * matrix[idx0 + 6] + sin * matrix[idx1 + 6];
        const f = cos * matrix[idx1 + 6] - sin * matrix[idx0 + 6];
        matrix[idx0 + 0] = a;
        matrix[idx1 + 0] = b;
        matrix[idx0 + 3] = c;
        matrix[idx1 + 3] = d;
        matrix[idx0 + 6] = e;
        matrix[idx1 + 6] = f;
    },
    /*
   * Zeros out the [idx0,idx1] and [idx1,idx0] entries of the matrix mS by applying a Givens rotation as part of the
   * Jacobi iteration. In addition, the Givens rotation is prepended to mQ so we can track the accumulated rotations
   * applied (this is how we get V in the SVD).
   *
   * @param {FastMath.Array} mS - [input AND output] Symmetric 3x3 Matrix
   * @param {FastMath.Array} mQ - [input AND output] Unitary 3x3 Matrix
   * @param {number} idx0 - [input] The smaller row/column index
   * @param {number} idx1 - [input] The larger row/column index
   */ applyJacobi3 (mS, mQ, idx0, idx1) {
        // submatrix entries for idx0,idx1
        const a11 = mS[3 * idx0 + idx0];
        const a12 = mS[3 * idx0 + idx1]; // we assume mS is symmetric, so we don't need a21
        const a22 = mS[3 * idx1 + idx1];
        // Approximate givens angle, see https://graphics.cs.wisc.edu/Papers/2011/MSTTS11/SVD_TR1690.pdf (section 2.3)
        // "Computing the Singular Value Decomposition of 3x3 matrices with minimal branching and elementary floating point operations"
        // Aleka McAdams, Andrew Selle, Rasmus Tamstorf, Joseph Teran, Eftychios Sifakis
        const lhs = a12 * a12;
        let rhs = a11 - a22;
        rhs = rhs * rhs;
        const useAngle = lhs < rhs;
        const w = 1 / Math.sqrt(lhs + rhs);
        // NOTE: exact Givens angle is 0.5 * Math.atan( 2 * a12 / ( a11 - a22 ) ), but clamped to withing +-Math.PI / 4
        const cos = useAngle ? w * (a11 - a22) : SQRT_HALF;
        const sin = useAngle ? w * a12 : SQRT_HALF;
        // S' = Q * S * transpose( Q )
        this.preMult3Givens(mS, cos, sin, idx0, idx1);
        this.postMult3Givens(mS, cos, sin, idx0, idx1);
        // Q' = Q * mQ
        this.preMult3Givens(mQ, cos, sin, idx0, idx1);
    },
    /*
   * The Jacobi method, which in turn zeros out all the non-diagonal entries repeatedly until mS converges into
   * a diagonal matrix. We track the applied Givens rotations in mQ, so that when given mS and mQ=identity, we will
   * maintain the value mQ * mS * mQ^T
   *
   * @param {FastMath.Array} mS - [input AND output] Symmetric 3x3 Matrix
   * @param {FastMath.Array} mQ - [input AND output] Unitary 3x3 Matrix
   * @param {number} n - [input] The number of iterations to run
   */ jacobiIteration3 (mS, mQ, n) {
        // for 3x3, we eliminate non-diagonal entries iteratively
        for(let i = 0; i < n; i++){
            this.applyJacobi3(mS, mQ, 0, 1);
            this.applyJacobi3(mS, mQ, 0, 2);
            this.applyJacobi3(mS, mQ, 1, 2);
        }
    },
    /*
   * One step in computing the QR decomposition. Zeros out the (row,col) entry in 'r', while maintaining the
   * value of (q * r). We will end up with an orthogonal Q and upper-triangular R (or in the SVD case,
   * R will be diagonal)
   *
   * @param {FastMath.Array} q - [input AND ouput] 3x3 Matrix
   * @param {FastMath.Array} r - [input AND ouput] 3x3 Matrix
   * @param {number} row - [input] The row of the entry to zero out
   * @param {number} col - [input] The column of the entry to zero out
   */ qrAnnihilate3 (q, r, row, col) {
        assert && assert(row > col); // only in the lower-triangular area
        const epsilon = 0.0000000001;
        let cos;
        let sin;
        const diagonalValue = r[this.index3(col, col)];
        const targetValue = r[this.index3(row, col)];
        const diagonalSquared = diagonalValue * diagonalValue;
        const targetSquared = targetValue * targetValue;
        // handle the case where both (row,col) and (col,col) are very small (would cause instabilities)
        if (diagonalSquared + targetSquared < epsilon) {
            cos = diagonalValue > 0 ? 1 : 0;
            sin = 0;
        } else {
            const rsqr = 1 / Math.sqrt(diagonalSquared + targetSquared);
            cos = rsqr * diagonalValue;
            sin = rsqr * targetValue;
        }
        this.preMult3Givens(r, cos, sin, col, row);
        this.postMult3Givens(q, cos, sin, col, row);
    },
    /*
   * 3x3 Singular Value Decomposition, handling singular cases.
   * Based on https://graphics.cs.wisc.edu/Papers/2011/MSTTS11/SVD_TR1690.pdf
   * "Computing the Singular Value Decomposition of 3x3 matrices with minimal branching and elementary floating point operations"
   * Aleka McAdams, Andrew Selle, Rasmus Tamstorf, Joseph Teran, Eftychios Sifakis
   *
   * @param {FastMath.Array} a - [input] 3x3 Matrix that we want the SVD of.
   * @param {number} jacobiIterationCount - [input] How many Jacobi iterations to run (larger is more accurate to a point)
   * @param {FastMath.Array} resultU - [output] 3x3 U matrix (unitary)
   * @param {FastMath.Array} resultSigma - [output] 3x3 diagonal matrix of singular values
   * @param {FastMath.Array} resultV - [output] 3x3 V matrix (unitary)
   */ svd3 (a, jacobiIterationCount, resultU, resultSigma, resultV) {
        // shorthands
        const q = resultU;
        const v = resultV;
        const r = resultSigma;
        // for now, use 'r' as our S == transpose( A ) * A, so we don't have to use scratch matrices
        this.mult3LeftTranspose(a, a, r);
        // we'll accumulate into 'q' == transpose( V ) during the Jacobi iteration
        this.setIdentity3(q);
        // Jacobi iteration turns Q into V^T and R into Sigma^2 (we'll ditch R since the QR decomposition will be beter)
        this.jacobiIteration3(r, q, jacobiIterationCount);
        // final determination of V
        this.transpose3(q, v); // done with this 'q' until we reuse the scratch matrix later below for the QR decomposition
        this.mult3(a, v, r); // R = AV
        // Sort columns of R and V based on singular values (needed for the QR step, and useful anyways).
        // Their product will remain unchanged.
        let mag0 = r[0] * r[0] + r[3] * r[3] + r[6] * r[6]; // column vector magnitudes
        let mag1 = r[1] * r[1] + r[4] * r[4] + r[7] * r[7];
        let mag2 = r[2] * r[2] + r[5] * r[5] + r[8] * r[8];
        let tmpMag;
        if (mag0 < mag1) {
            // swap magnitudes
            tmpMag = mag0;
            mag0 = mag1;
            mag1 = tmpMag;
            this.swapNegateColumn(r, 0, 1);
            this.swapNegateColumn(v, 0, 1);
        }
        if (mag0 < mag2) {
            // swap magnitudes
            tmpMag = mag0;
            mag0 = mag2;
            mag2 = tmpMag;
            this.swapNegateColumn(r, 0, 2);
            this.swapNegateColumn(v, 0, 2);
        }
        if (mag1 < mag2) {
            this.swapNegateColumn(r, 1, 2);
            this.swapNegateColumn(v, 1, 2);
        }
        // QR decomposition
        this.setIdentity3(q); // reusing Q now for the QR
        // Zero out all three strictly lower-triangular values. Should turn the matrix diagonal
        this.qrAnnihilate3(q, r, 1, 0);
        this.qrAnnihilate3(q, r, 2, 0);
        this.qrAnnihilate3(q, r, 2, 1);
        // checks for a singular U value, we'll add in the needed 1 entries to make sure our U is orthogonal
        const bigEpsilon = 0.001; // they really should be around 1
        if (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] < bigEpsilon) {
            q[0] = 1;
        }
        if (q[3] * q[3] + q[4] * q[4] + q[5] * q[5] < bigEpsilon) {
            q[4] = 1;
        }
        if (q[6] * q[6] + q[7] * q[7] + q[8] * q[8] < bigEpsilon) {
            q[8] = 1;
        }
    },
    /*---------------------------------------------------------------------------*
   * 3xN matrix math
   *----------------------------------------------------------------------------*/ /*
   * Sets the 3xN result matrix to be made out of column vectors
   *
   * @param {Array.<Vector3>} columnVectors - [input] List of 3D column vectors
   * @param {FastMath.Array} result - [output] 3xN Matrix, where N is the number of column vectors
   */ setVectors3 (columnVectors, result) {
        const m = 3;
        const n = columnVectors.length;
        assert && assert(result.length >= m * n, 'Array length check');
        for(let i = 0; i < n; i++){
            const vector = columnVectors[i];
            result[i] = vector.x;
            result[i + n] = vector.y;
            result[i + 2 * n] = vector.z;
        }
    },
    /*
   * Retrieves column vector values from a 3xN matrix.
   *
   * @param {number} m - [input] The number of rows in the matrix (sanity check, should always be 3)
   * @param {number} n - [input] The number of columns in the matrix
   * @param {FastMath.Array} matrix - [input] 3xN Matrix
   * @param {number} columnIndex - [input] 3xN Matrix
   * @param {Vector3} result - [output] Vector to store the x,y,z
   */ getColumnVector3 (m, n, matrix, columnIndex, result) {
        assert && assert(m === 3 && columnIndex < n);
        result.x = matrix[columnIndex];
        result.y = matrix[columnIndex + n];
        result.z = matrix[columnIndex + 2 * n];
    },
    /*---------------------------------------------------------------------------*
   * Arbitrary dimension matrix math
   *----------------------------------------------------------------------------*/ /*
   * From 0-indexed row and column indices, returns the index into the flat array
   *
   * @param {number} m - Number of rows in the matrix
   * @param {number} n - Number of columns in the matrix
   * @param {number} row
   * @param {number} col
   */ index (m, n, row, col) {
        return n * row + col;
    },
    /*
   * Writes the transpose of the matrix into the result.
   *
   * @param {number} m - Number of rows in the original matrix
   * @param {number} n - Number of columns in the original matrix
   * @param {FastMath.Array} matrix - [input] MxN Matrix
   * @param {FastMath.Array} result - [output] NxM Matrix
   */ transpose (m, n, matrix, result) {
        assert && assert(matrix.length >= m * n);
        assert && assert(result.length >= n * m);
        assert && assert(matrix !== result, 'In-place modification not implemented yet');
        for(let row = 0; row < m; row++){
            for(let col = 0; col < n; col++){
                result[m * col + row] = matrix[n * row + col];
            }
        }
    },
    /*
   * Writes the matrix multiplication of ( left * right ) into result
   *
   * @param {number} m - Number of rows in the left matrix
   * @param {number} n - Number of columns in the left matrix, number of rows in the right matrix
   * @param {number} p - Number of columns in the right matrix
   * @param {FastMath.Array} left - [input] MxN Matrix
   * @param {FastMath.Array} right - [input] NxP Matrix
   * @param {FastMath.Array} result - [output] MxP Matrix
   */ mult (m, n, p, left, right, result) {
        assert && assert(left.length >= m * n);
        assert && assert(right.length >= n * p);
        assert && assert(result.length >= m * p);
        assert && assert(left !== result && right !== result, 'In-place modification not implemented yet');
        for(let row = 0; row < m; row++){
            for(let col = 0; col < p; col++){
                let x = 0;
                for(let k = 0; k < n; k++){
                    x += left[this.index(m, n, row, k)] * right[this.index(n, p, k, col)];
                }
                result[this.index(m, p, row, col)] = x;
            }
        }
    },
    /*
   * Writes the matrix multiplication of ( left * transpose( right ) ) into result
   *
   * @param {number} m - Number of rows in the left matrix
   * @param {number} n - Number of columns in the left matrix, number of columns in the right matrix
   * @param {number} p - Number of rows in the right matrix
   * @param {FastMath.Array} left - [input] MxN Matrix
   * @param {FastMath.Array} right - [input] PxN Matrix
   * @param {FastMath.Array} result - [output] MxP Matrix
   */ multRightTranspose (m, n, p, left, right, result) {
        assert && assert(left.length >= m * n);
        assert && assert(right.length >= n * p);
        assert && assert(result.length >= m * p);
        assert && assert(left !== result && right !== result, 'In-place modification not implemented yet');
        for(let row = 0; row < m; row++){
            for(let col = 0; col < p; col++){
                let x = 0;
                for(let k = 0; k < n; k++){
                    x += left[this.index(m, n, row, k)] * right[this.index(p, n, col, k)];
                }
                result[this.index(m, p, row, col)] = x;
            }
        }
    },
    /*
   * Writes the matrix into the result, permuting the columns.
   *
   * @param {number} m - Number of rows in the original matrix
   * @param {number} n - Number of columns in the original matrix
   * @param {FastMath.Array} matrix - [input] MxN Matrix
   * @param {Permutation} permutation - [input] Permutation
   * @param {FastMath.Array} result - [output] MxN Matrix
   */ permuteColumns (m, n, matrix, permutation, result) {
        assert && assert(matrix !== result, 'In-place modification not implemented yet');
        assert && assert(matrix.length >= m * n);
        assert && assert(result.length >= m * n);
        for(let col = 0; col < n; col++){
            const permutedColumnIndex = permutation.indices[col];
            for(let row = 0; row < m; row++){
                result[this.index(m, n, row, col)] = matrix[this.index(m, n, row, permutedColumnIndex)];
            }
        }
    }
};
dot.register('MatrixOps3', MatrixOps3);
export default MatrixOps3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXhPcHMzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZhc3QgM3gzIG1hdHJpeCBjb21wdXRhdGlvbnMgYXQgdGhlIGxvd2VyIGxldmVsLCBpbmNsdWRpbmcgYW4gU1ZEIGltcGxlbWVudGF0aW9uIHRoYXQgaXMgZnVsbHkgc3RhYmxlLlxuICogT3ZlcmFsbCwgaXQgdXNlcyBhIGhlYXZpbHkgbXV0YWJsZSBzdHlsZSwgcGFzc2luZyBpbiB0aGUgb2JqZWN0IHdoZXJlIHRoZSByZXN1bHQocykgd2lsbCBiZSBzdG9yZWQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG4vKlxuICogTWF0cmljZXMgYXJlIHN0b3JlZCBhcyBmbGF0IHR5cGVkIGFycmF5cyB3aXRoIHJvdy1tYWpvciBpbmRpY2VzLiBGb3IgZXhhbXBsZSwgZm9yIGEgM3gzOlxuICogWzBdIFsxXSBbMl1cbiAqIFszXSBbNF0gWzVdXG4gKiBbNl0gWzddIFs4XVxuICpcbiAqIE5PVEU6IFdlIGFzc3VtZSB0aGUgdHlwZWQgYXJyYXlzIGFyZSBBVCBMRUFTVCBhcyBsb25nIGFzIG5lY2Vzc2FyeSAoYnV0IGNvdWxkIGJlIGxvbmdlcikuIFRoaXMgYWxsb3dzIHVzIHRvIHVzZVxuICogYW4gYXJyYXkgYXMgYmlnIGFzIHRoZSBsYXJnZXN0IG9uZSB3ZSdsbCBuZWVkLlxuICovXG5cbi8vIGNvbnN0YW50c1xuY29uc3QgU1FSVF9IQUxGID0gTWF0aC5zcXJ0KCAwLjUgKTtcblxuY29uc3QgTWF0cml4T3BzMyA9IHtcbiAgLy8gdXNlIHR5cGVkIGFycmF5cyBpZiBwb3NzaWJsZVxuICBBcnJheTogZG90LkZhc3RBcnJheSxcblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogM3gzIG1hdHJpeCBtYXRoXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLypcbiAgICogRnJvbSAwLWluZGV4ZWQgcm93IGFuZCBjb2x1bW4gaW5kaWNlcywgcmV0dXJucyB0aGUgaW5kZXggaW50byB0aGUgZmxhdCBhcnJheVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcm93XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcbiAgICovXG4gIGluZGV4Myggcm93LCBjb2wgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm93ID49IDAgJiYgcm93IDwgMyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbCA+PSAwICYmIGNvbCA8IDMgKTtcbiAgICByZXR1cm4gMyAqIHJvdyArIGNvbDtcbiAgfSxcblxuICAvKlxuICAgKiBDb3BpZXMgb25lIG1hdHJpeCBpbnRvIGFub3RoZXJcbiAgICpcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbWF0cml4IC0gW2lucHV0XSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcbiAgICovXG4gIHNldDMoIG1hdHJpeCwgcmVzdWx0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5sZW5ndGggPj0gOSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gOSApO1xuICAgIHJlc3VsdFsgMCBdID0gbWF0cml4WyAwIF07XG4gICAgcmVzdWx0WyAxIF0gPSBtYXRyaXhbIDEgXTtcbiAgICByZXN1bHRbIDIgXSA9IG1hdHJpeFsgMiBdO1xuICAgIHJlc3VsdFsgMyBdID0gbWF0cml4WyAzIF07XG4gICAgcmVzdWx0WyA0IF0gPSBtYXRyaXhbIDQgXTtcbiAgICByZXN1bHRbIDUgXSA9IG1hdHJpeFsgNSBdO1xuICAgIHJlc3VsdFsgNiBdID0gbWF0cml4WyA2IF07XG4gICAgcmVzdWx0WyA3IF0gPSBtYXRyaXhbIDcgXTtcbiAgICByZXN1bHRbIDggXSA9IG1hdHJpeFsgOCBdO1xuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgdHJhbnNwb3NlIG9mIHRoZSBpbnB1dCBtYXRyaXggaW50byB0aGUgcmVzdWx0IG1hdHJpeCAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gM3gzIE1hdHJpeFxuICAgKi9cbiAgdHJhbnNwb3NlMyggbWF0cml4LCByZXN1bHQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4Lmxlbmd0aCA+PSA5ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSA5ICk7XG4gICAgY29uc3QgbTEgPSBtYXRyaXhbIDMgXTtcbiAgICBjb25zdCBtMiA9IG1hdHJpeFsgNiBdO1xuICAgIGNvbnN0IG0zID0gbWF0cml4WyAxIF07XG4gICAgY29uc3QgbTUgPSBtYXRyaXhbIDcgXTtcbiAgICBjb25zdCBtNiA9IG1hdHJpeFsgMiBdO1xuICAgIGNvbnN0IG03ID0gbWF0cml4WyA1IF07XG4gICAgcmVzdWx0WyAwIF0gPSBtYXRyaXhbIDAgXTtcbiAgICByZXN1bHRbIDEgXSA9IG0xO1xuICAgIHJlc3VsdFsgMiBdID0gbTI7XG4gICAgcmVzdWx0WyAzIF0gPSBtMztcbiAgICByZXN1bHRbIDQgXSA9IG1hdHJpeFsgNCBdO1xuICAgIHJlc3VsdFsgNSBdID0gbTU7XG4gICAgcmVzdWx0WyA2IF0gPSBtNjtcbiAgICByZXN1bHRbIDcgXSA9IG03O1xuICAgIHJlc3VsdFsgOCBdID0gbWF0cml4WyA4IF07XG4gIH0sXG5cbiAgLypcbiAgICogVGhlIGRldGVybWluYW50IG9mIGEgM3gzIG1hdHJpeFxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHJldHVybnMge251bWJlcn0gLSBUaGUgZGV0ZXJtaW5hbnQuIDAgaW5kaWNhdGVzIGEgc2luZ3VsYXIgKG5vbi1pbnZlcnRpYmxlKSBtYXRyaXguXG4gICAqL1xuICBkZXQzKCBtYXRyaXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0cml4Lmxlbmd0aCA+PSA5ICk7XG4gICAgcmV0dXJuIG1hdHJpeFsgMCBdICogbWF0cml4WyA0IF0gKiBtYXRyaXhbIDggXSArIG1hdHJpeFsgMSBdICogbWF0cml4WyA1IF0gKiBtYXRyaXhbIDYgXSArXG4gICAgICAgICAgIG1hdHJpeFsgMiBdICogbWF0cml4WyAzIF0gKiBtYXRyaXhbIDcgXSAtIG1hdHJpeFsgMiBdICogbWF0cml4WyA0IF0gKiBtYXRyaXhbIDYgXSAtXG4gICAgICAgICAgIG1hdHJpeFsgMSBdICogbWF0cml4WyAzIF0gKiBtYXRyaXhbIDggXSAtIG1hdHJpeFsgMCBdICogbWF0cml4WyA1IF0gKiBtYXRyaXhbIDcgXTtcbiAgfSxcblxuICAvKlxuICAgKiBXcml0ZXMgdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvbiAoIGxlZnQgKiByaWdodCApIGludG8gcmVzdWx0LiAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBsZWZ0IC0gW2lucHV0XSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcbiAgICovXG4gIG11bHQzKCBsZWZ0LCByaWdodCwgcmVzdWx0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IDkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gOSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gOSApO1xuICAgIGNvbnN0IG0wID0gbGVmdFsgMCBdICogcmlnaHRbIDAgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgNiBdO1xuICAgIGNvbnN0IG0xID0gbGVmdFsgMCBdICogcmlnaHRbIDEgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgNyBdO1xuICAgIGNvbnN0IG0yID0gbGVmdFsgMCBdICogcmlnaHRbIDIgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyA1IF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG0zID0gbGVmdFsgMyBdICogcmlnaHRbIDAgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNiBdO1xuICAgIGNvbnN0IG00ID0gbGVmdFsgMyBdICogcmlnaHRbIDEgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNyBdO1xuICAgIGNvbnN0IG01ID0gbGVmdFsgMyBdICogcmlnaHRbIDIgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA1IF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG02ID0gbGVmdFsgNiBdICogcmlnaHRbIDAgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyAzIF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNiBdO1xuICAgIGNvbnN0IG03ID0gbGVmdFsgNiBdICogcmlnaHRbIDEgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNyBdO1xuICAgIGNvbnN0IG04ID0gbGVmdFsgNiBdICogcmlnaHRbIDIgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA1IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgOCBdO1xuICAgIHJlc3VsdFsgMCBdID0gbTA7XG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcbiAgICByZXN1bHRbIDIgXSA9IG0yO1xuICAgIHJlc3VsdFsgMyBdID0gbTM7XG4gICAgcmVzdWx0WyA0IF0gPSBtNDtcbiAgICByZXN1bHRbIDUgXSA9IG01O1xuICAgIHJlc3VsdFsgNiBdID0gbTY7XG4gICAgcmVzdWx0WyA3IF0gPSBtNztcbiAgICByZXN1bHRbIDggXSA9IG04O1xuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uICggdHJhbnNwb3NlKCBsZWZ0ICkgKiByaWdodCApIGludG8gcmVzdWx0LiAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBsZWZ0IC0gW2lucHV0XSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcbiAgICovXG4gIG11bHQzTGVmdFRyYW5zcG9zZSggbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Lmxlbmd0aCA+PSA5ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmlnaHQubGVuZ3RoID49IDkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IDkgKTtcbiAgICBjb25zdCBtMCA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyAzIF0gKiByaWdodFsgMyBdICsgbGVmdFsgNiBdICogcmlnaHRbIDYgXTtcbiAgICBjb25zdCBtMSA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyAzIF0gKiByaWdodFsgNCBdICsgbGVmdFsgNiBdICogcmlnaHRbIDcgXTtcbiAgICBjb25zdCBtMiA9IGxlZnRbIDAgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyAzIF0gKiByaWdodFsgNSBdICsgbGVmdFsgNiBdICogcmlnaHRbIDggXTtcbiAgICBjb25zdCBtMyA9IGxlZnRbIDEgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgMyBdICsgbGVmdFsgNyBdICogcmlnaHRbIDYgXTtcbiAgICBjb25zdCBtNCA9IGxlZnRbIDEgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgNCBdICsgbGVmdFsgNyBdICogcmlnaHRbIDcgXTtcbiAgICBjb25zdCBtNSA9IGxlZnRbIDEgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA0IF0gKiByaWdodFsgNSBdICsgbGVmdFsgNyBdICogcmlnaHRbIDggXTtcbiAgICBjb25zdCBtNiA9IGxlZnRbIDIgXSAqIHJpZ2h0WyAwIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgMyBdICsgbGVmdFsgOCBdICogcmlnaHRbIDYgXTtcbiAgICBjb25zdCBtNyA9IGxlZnRbIDIgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNCBdICsgbGVmdFsgOCBdICogcmlnaHRbIDcgXTtcbiAgICBjb25zdCBtOCA9IGxlZnRbIDIgXSAqIHJpZ2h0WyAyIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNSBdICsgbGVmdFsgOCBdICogcmlnaHRbIDggXTtcbiAgICByZXN1bHRbIDAgXSA9IG0wO1xuICAgIHJlc3VsdFsgMSBdID0gbTE7XG4gICAgcmVzdWx0WyAyIF0gPSBtMjtcbiAgICByZXN1bHRbIDMgXSA9IG0zO1xuICAgIHJlc3VsdFsgNCBdID0gbTQ7XG4gICAgcmVzdWx0WyA1IF0gPSBtNTtcbiAgICByZXN1bHRbIDYgXSA9IG02O1xuICAgIHJlc3VsdFsgNyBdID0gbTc7XG4gICAgcmVzdWx0WyA4IF0gPSBtODtcbiAgfSxcblxuICAvKlxuICAgKiBXcml0ZXMgdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvbiAoIGxlZnQgKiB0cmFuc3Bvc2UoIHJpZ2h0ICkgKSBpbnRvIHJlc3VsdC4gKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcbiAgICpcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbGVmdCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByaWdodCAtIFtpbnB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbb3V0cHV0XSAzeDMgTWF0cml4XG4gICAqL1xuICBtdWx0M1JpZ2h0VHJhbnNwb3NlKCBsZWZ0LCByaWdodCwgcmVzdWx0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IDkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gOSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gOSApO1xuICAgIGNvbnN0IG0wID0gbGVmdFsgMCBdICogcmlnaHRbIDAgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG0xID0gbGVmdFsgMCBdICogcmlnaHRbIDMgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG0yID0gbGVmdFsgMCBdICogcmlnaHRbIDYgXSArIGxlZnRbIDEgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyAyIF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG0zID0gbGVmdFsgMyBdICogcmlnaHRbIDAgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG00ID0gbGVmdFsgMyBdICogcmlnaHRbIDMgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG01ID0gbGVmdFsgMyBdICogcmlnaHRbIDYgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyA1IF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG02ID0gbGVmdFsgNiBdICogcmlnaHRbIDAgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG03ID0gbGVmdFsgNiBdICogcmlnaHRbIDMgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG04ID0gbGVmdFsgNiBdICogcmlnaHRbIDYgXSArIGxlZnRbIDcgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgOCBdO1xuICAgIHJlc3VsdFsgMCBdID0gbTA7XG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcbiAgICByZXN1bHRbIDIgXSA9IG0yO1xuICAgIHJlc3VsdFsgMyBdID0gbTM7XG4gICAgcmVzdWx0WyA0IF0gPSBtNDtcbiAgICByZXN1bHRbIDUgXSA9IG01O1xuICAgIHJlc3VsdFsgNiBdID0gbTY7XG4gICAgcmVzdWx0WyA3IF0gPSBtNztcbiAgICByZXN1bHRbIDggXSA9IG04O1xuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uICggdHJhbnNwb3NlKCBsZWZ0ICkgKiB0cmFuc3Bvc2UoIHJpZ2h0ICkgKSBpbnRvIHJlc3VsdC5cbiAgICogKGluLXBsYWNlIG1vZGlmaWNhdGlvbiBpcyBPSylcbiAgICogTk9URTogVGhpcyBpcyBlcXVpdmFsZW50IHRvIHRyYW5zcG9zZSggcmlnaHQgKiBsZWZ0ICkuXG4gICAqXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IGxlZnQgLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmlnaHQgLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gM3gzIE1hdHJpeFxuICAgKi9cbiAgbXVsdDNCb3RoVHJhbnNwb3NlKCBsZWZ0LCByaWdodCwgcmVzdWx0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnQubGVuZ3RoID49IDkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodC5sZW5ndGggPj0gOSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gOSApO1xuICAgIGNvbnN0IG0wID0gbGVmdFsgMCBdICogcmlnaHRbIDAgXSArIGxlZnRbIDMgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA2IF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG0xID0gbGVmdFsgMCBdICogcmlnaHRbIDMgXSArIGxlZnRbIDMgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA2IF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG0yID0gbGVmdFsgMCBdICogcmlnaHRbIDYgXSArIGxlZnRbIDMgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyA2IF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG0zID0gbGVmdFsgMSBdICogcmlnaHRbIDAgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG00ID0gbGVmdFsgMSBdICogcmlnaHRbIDMgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG01ID0gbGVmdFsgMSBdICogcmlnaHRbIDYgXSArIGxlZnRbIDQgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyA3IF0gKiByaWdodFsgOCBdO1xuICAgIGNvbnN0IG02ID0gbGVmdFsgMiBdICogcmlnaHRbIDAgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyAxIF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgMiBdO1xuICAgIGNvbnN0IG03ID0gbGVmdFsgMiBdICogcmlnaHRbIDMgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyA0IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgNSBdO1xuICAgIGNvbnN0IG04ID0gbGVmdFsgMiBdICogcmlnaHRbIDYgXSArIGxlZnRbIDUgXSAqIHJpZ2h0WyA3IF0gKyBsZWZ0WyA4IF0gKiByaWdodFsgOCBdO1xuICAgIHJlc3VsdFsgMCBdID0gbTA7XG4gICAgcmVzdWx0WyAxIF0gPSBtMTtcbiAgICByZXN1bHRbIDIgXSA9IG0yO1xuICAgIHJlc3VsdFsgMyBdID0gbTM7XG4gICAgcmVzdWx0WyA0IF0gPSBtNDtcbiAgICByZXN1bHRbIDUgXSA9IG01O1xuICAgIHJlc3VsdFsgNiBdID0gbTY7XG4gICAgcmVzdWx0WyA3IF0gPSBtNztcbiAgICByZXN1bHRbIDggXSA9IG04O1xuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgcHJvZHVjdCAoIG1hdHJpeCAqIHZlY3RvciApIGludG8gcmVzdWx0LiAoaW4tcGxhY2UgbW9kaWZpY2F0aW9uIGlzIE9LKVxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtWZWN0b3IzfSB2ZWN0b3IgLSBbaW5wdXRdXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gcmVzdWx0IC0gW291dHB1dF1cbiAgICovXG4gIG11bHQzVmVjdG9yMyggbWF0cml4LCB2ZWN0b3IsIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IDkgKTtcbiAgICBjb25zdCB4ID0gbWF0cml4WyAwIF0gKiB2ZWN0b3IueCArIG1hdHJpeFsgMSBdICogdmVjdG9yLnkgKyBtYXRyaXhbIDIgXSAqIHZlY3Rvci56O1xuICAgIGNvbnN0IHkgPSBtYXRyaXhbIDMgXSAqIHZlY3Rvci54ICsgbWF0cml4WyA0IF0gKiB2ZWN0b3IueSArIG1hdHJpeFsgNSBdICogdmVjdG9yLno7XG4gICAgY29uc3QgeiA9IG1hdHJpeFsgNiBdICogdmVjdG9yLnggKyBtYXRyaXhbIDcgXSAqIHZlY3Rvci55ICsgbWF0cml4WyA4IF0gKiB2ZWN0b3IuejtcbiAgICByZXN1bHQueCA9IHg7XG4gICAgcmVzdWx0LnkgPSB5O1xuICAgIHJlc3VsdC56ID0gejtcbiAgfSxcblxuICAvKlxuICAgKiBTd2FwcyB0d28gY29sdW1ucyBpbiBhIG1hdHJpeCwgbmVnYXRpbmcgb25lIG9mIHRoZW0gdG8gbWFpbnRhaW4gdGhlIHNpZ24gb2YgdGhlIGRldGVybWluYW50LlxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDAgLSBJbiB0aGUgcmFuZ2UgWzAsMl1cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDEgLSBJbiB0aGUgcmFuZ2UgWzAsMl1cbiAgICovXG4gIHN3YXBOZWdhdGVDb2x1bW4oIG1hdHJpeCwgaWR4MCwgaWR4MSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IDkgKTtcbiAgICBjb25zdCB0bXAwID0gbWF0cml4WyBpZHgwIF07XG4gICAgY29uc3QgdG1wMSA9IG1hdHJpeFsgaWR4MCArIDMgXTtcbiAgICBjb25zdCB0bXAyID0gbWF0cml4WyBpZHgwICsgNiBdO1xuXG4gICAgbWF0cml4WyBpZHgwIF0gPSBtYXRyaXhbIGlkeDEgXTtcbiAgICBtYXRyaXhbIGlkeDAgKyAzIF0gPSBtYXRyaXhbIGlkeDEgKyAzIF07XG4gICAgbWF0cml4WyBpZHgwICsgNiBdID0gbWF0cml4WyBpZHgxICsgNiBdO1xuXG4gICAgbWF0cml4WyBpZHgxIF0gPSAtdG1wMDtcbiAgICBtYXRyaXhbIGlkeDEgKyAzIF0gPSAtdG1wMTtcbiAgICBtYXRyaXhbIGlkeDEgKyA2IF0gPSAtdG1wMjtcbiAgfSxcblxuICAvKlxuICAgKiBTZXRzIHRoZSByZXN1bHQgbWF0cml4IHRvIHRoZSBpZGVudGl0eS5cbiAgICpcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gM3gzIE1hdHJpeFxuICAgKi9cbiAgc2V0SWRlbnRpdHkzKCByZXN1bHQgKSB7XG4gICAgcmVzdWx0WyAwIF0gPSByZXN1bHRbIDQgXSA9IHJlc3VsdFsgOCBdID0gMTsgLy8gZGlhZ29uYWxcbiAgICByZXN1bHRbIDEgXSA9IHJlc3VsdFsgMiBdID0gcmVzdWx0WyAzIF0gPSByZXN1bHRbIDUgXSA9IHJlc3VsdFsgNiBdID0gcmVzdWx0WyA3IF0gPSAwOyAvLyBub24tZGlhZ29uYWxcbiAgfSxcblxuICAvKlxuICAgKiBTZXRzIHRoZSByZXN1bHQgbWF0cml4IHRvIHRoZSBHaXZlbnMgcm90YXRpb24gKHBlcmZvcm1zIGEgcm90YXRpb24gYmV0d2VlbiB0d28gY29tcG9uZW50cykuIEluc3RlYWQgb2YgYW4gYW5nbGUsXG4gICAqIHRoZSAnY29zJyBhbmQgJ3NpbicgdmFsdWVzIGFyZSBwYXNzZWQgaW4gZGlyZWN0bHkgc2luY2Ugd2Ugc2tpcCB0aGUgdHJpZ29ub21ldHJ5IGFsbW9zdCBldmVyeXdoZXJlIHdlIGNhbi5cbiAgICpcbiAgICogU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR2l2ZW5zX3JvdGF0aW9uIChub3RlIHRoYXQgd2UgdXNlIHRoZSBvdGhlciBzaWduIGNvbnZlbnRpb24gZm9yIHRoZSBzaW4pXG4gICAqXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvcyAtIFtpbnB1dF0gVGhlIGNvc2luZSBvZiB0aGUgR2l2ZW5zIHJvdGF0aW9uIGFuZ2xlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaW4gLSBbaW5wdXRdIFRoZSBzaW5lIG9mIHRoZSBHaXZlbnMgcm90YXRpb24gYW5nbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDAgLSBbaW5wdXRdIFRoZSBzbWFsbGVyIHJvdy9jb2x1bW4gaW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDEgLSBbaW5wdXRdIFRoZSBsYXJnZXIgcm93L2NvbHVtbiBpbmRleFxuICAgKi9cbiAgc2V0R2l2ZW5zMyggcmVzdWx0LCBjb3MsIHNpbiwgaWR4MCwgaWR4MSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpZHgwIDwgaWR4MSApO1xuICAgIHRoaXMuc2V0SWRlbnRpdHkzKCByZXN1bHQgKTtcbiAgICByZXN1bHRbIHRoaXMuaW5kZXgzKCBpZHgwLCBpZHgwICkgXSA9IGNvcztcbiAgICByZXN1bHRbIHRoaXMuaW5kZXgzKCBpZHgxLCBpZHgxICkgXSA9IGNvcztcbiAgICByZXN1bHRbIHRoaXMuaW5kZXgzKCBpZHgwLCBpZHgxICkgXSA9IHNpbjtcbiAgICByZXN1bHRbIHRoaXMuaW5kZXgzKCBpZHgxLCBpZHgwICkgXSA9IC1zaW47XG4gIH0sXG5cbiAgLypcbiAgICogRWZmaWNpZW50bHkgcHJlLW11bHRpcGxlcyB0aGUgbWF0cml4IGluLXBsYWNlIGJ5IHRoZSBzcGVjaWZpZWQgR2l2ZW5zIHJvdGF0aW9uIChtYXRyaXggPD0gcm90YXRpb24gKiBtYXRyaXgpLlxuICAgKiBFcXVpdmFsZW50IHRvIHVzaW5nIHNldEdpdmVuczMgYW5kIG11bHQzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbaW5wdXQgQU5EIG91dHB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge251bWJlcn0gY29zIC0gW2lucHV0XSBUaGUgY29zaW5lIG9mIHRoZSBHaXZlbnMgcm90YXRpb24gYW5nbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpbiAtIFtpbnB1dF0gVGhlIHNpbmUgb2YgdGhlIEdpdmVucyByb3RhdGlvbiBhbmdsZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MCAtIFtpbnB1dF0gVGhlIHNtYWxsZXIgcm93L2NvbHVtbiBpbmRleFxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MSAtIFtpbnB1dF0gVGhlIGxhcmdlciByb3cvY29sdW1uIGluZGV4XG4gICAqL1xuICBwcmVNdWx0M0dpdmVucyggbWF0cml4LCBjb3MsIHNpbiwgaWR4MCwgaWR4MSApIHtcbiAgICBjb25zdCBiYXNlQSA9IGlkeDAgKiAzO1xuICAgIGNvbnN0IGJhc2VCID0gaWR4MSAqIDM7XG4gICAgLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gY29sdW1uLW1ham9yIG9yZGVyIGZvciBcImFmZmluZVwiIHNlY3Rpb25cbiAgICBjb25zdCBhID0gY29zICogbWF0cml4WyBiYXNlQSArIDAgXSArIHNpbiAqIG1hdHJpeFsgYmFzZUIgKyAwIF07XG4gICAgY29uc3QgYiA9IGNvcyAqIG1hdHJpeFsgYmFzZUIgKyAwIF0gLSBzaW4gKiBtYXRyaXhbIGJhc2VBICsgMCBdO1xuICAgIGNvbnN0IGMgPSBjb3MgKiBtYXRyaXhbIGJhc2VBICsgMSBdICsgc2luICogbWF0cml4WyBiYXNlQiArIDEgXTtcbiAgICBjb25zdCBkID0gY29zICogbWF0cml4WyBiYXNlQiArIDEgXSAtIHNpbiAqIG1hdHJpeFsgYmFzZUEgKyAxIF07XG4gICAgY29uc3QgZSA9IGNvcyAqIG1hdHJpeFsgYmFzZUEgKyAyIF0gKyBzaW4gKiBtYXRyaXhbIGJhc2VCICsgMiBdO1xuICAgIGNvbnN0IGYgPSBjb3MgKiBtYXRyaXhbIGJhc2VCICsgMiBdIC0gc2luICogbWF0cml4WyBiYXNlQSArIDIgXTtcbiAgICBtYXRyaXhbIGJhc2VBICsgMCBdID0gYTtcbiAgICBtYXRyaXhbIGJhc2VCICsgMCBdID0gYjtcbiAgICBtYXRyaXhbIGJhc2VBICsgMSBdID0gYztcbiAgICBtYXRyaXhbIGJhc2VCICsgMSBdID0gZDtcbiAgICBtYXRyaXhbIGJhc2VBICsgMiBdID0gZTtcbiAgICBtYXRyaXhbIGJhc2VCICsgMiBdID0gZjtcbiAgfSxcblxuICAvKlxuICAgKiBFZmZpY2llbnRseSBwb3N0LW11bHRpcGxlcyB0aGUgbWF0cml4IGluLXBsYWNlIGJ5IHRoZSB0cmFuc3Bvc2Ugb2YgdGhlIHNwZWNpZmllZCBHaXZlbnMgcm90YXRpb25cbiAgICogKG1hdHJpeCA8PSBtYXRyaXggKiByb3RhdGlvbl5UKS5cbiAgICogRXF1aXZhbGVudCB0byB1c2luZyBzZXRHaXZlbnMzIGFuZCBtdWx0M1JpZ2h0VHJhbnNwb3NlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByZXN1bHQgLSBbaW5wdXQgQU5EIG91dHB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge251bWJlcn0gY29zIC0gW2lucHV0XSBUaGUgY29zaW5lIG9mIHRoZSBHaXZlbnMgcm90YXRpb24gYW5nbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNpbiAtIFtpbnB1dF0gVGhlIHNpbmUgb2YgdGhlIEdpdmVucyByb3RhdGlvbiBhbmdsZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MCAtIFtpbnB1dF0gVGhlIHNtYWxsZXIgcm93L2NvbHVtbiBpbmRleFxuICAgKiBAcGFyYW0ge251bWJlcn0gaWR4MSAtIFtpbnB1dF0gVGhlIGxhcmdlciByb3cvY29sdW1uIGluZGV4XG4gICAqL1xuICBwb3N0TXVsdDNHaXZlbnMoIG1hdHJpeCwgY29zLCBzaW4sIGlkeDAsIGlkeDEgKSB7XG4gICAgLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gcm93LW1ham9yIG9yZGVyIGZvciB0aGUgXCJ0cmFuc3Bvc2VkIGFmZmluZVwiIHNlY3Rpb25cbiAgICBjb25zdCBhID0gY29zICogbWF0cml4WyBpZHgwICsgMCBdICsgc2luICogbWF0cml4WyBpZHgxICsgMCBdO1xuICAgIGNvbnN0IGIgPSBjb3MgKiBtYXRyaXhbIGlkeDEgKyAwIF0gLSBzaW4gKiBtYXRyaXhbIGlkeDAgKyAwIF07XG4gICAgY29uc3QgYyA9IGNvcyAqIG1hdHJpeFsgaWR4MCArIDMgXSArIHNpbiAqIG1hdHJpeFsgaWR4MSArIDMgXTtcbiAgICBjb25zdCBkID0gY29zICogbWF0cml4WyBpZHgxICsgMyBdIC0gc2luICogbWF0cml4WyBpZHgwICsgMyBdO1xuICAgIGNvbnN0IGUgPSBjb3MgKiBtYXRyaXhbIGlkeDAgKyA2IF0gKyBzaW4gKiBtYXRyaXhbIGlkeDEgKyA2IF07XG4gICAgY29uc3QgZiA9IGNvcyAqIG1hdHJpeFsgaWR4MSArIDYgXSAtIHNpbiAqIG1hdHJpeFsgaWR4MCArIDYgXTtcbiAgICBtYXRyaXhbIGlkeDAgKyAwIF0gPSBhO1xuICAgIG1hdHJpeFsgaWR4MSArIDAgXSA9IGI7XG4gICAgbWF0cml4WyBpZHgwICsgMyBdID0gYztcbiAgICBtYXRyaXhbIGlkeDEgKyAzIF0gPSBkO1xuICAgIG1hdHJpeFsgaWR4MCArIDYgXSA9IGU7XG4gICAgbWF0cml4WyBpZHgxICsgNiBdID0gZjtcbiAgfSxcblxuICAvKlxuICAgKiBaZXJvcyBvdXQgdGhlIFtpZHgwLGlkeDFdIGFuZCBbaWR4MSxpZHgwXSBlbnRyaWVzIG9mIHRoZSBtYXRyaXggbVMgYnkgYXBwbHlpbmcgYSBHaXZlbnMgcm90YXRpb24gYXMgcGFydCBvZiB0aGVcbiAgICogSmFjb2JpIGl0ZXJhdGlvbi4gSW4gYWRkaXRpb24sIHRoZSBHaXZlbnMgcm90YXRpb24gaXMgcHJlcGVuZGVkIHRvIG1RIHNvIHdlIGNhbiB0cmFjayB0aGUgYWNjdW11bGF0ZWQgcm90YXRpb25zXG4gICAqIGFwcGxpZWQgKHRoaXMgaXMgaG93IHdlIGdldCBWIGluIHRoZSBTVkQpLlxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtUyAtIFtpbnB1dCBBTkQgb3V0cHV0XSBTeW1tZXRyaWMgM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtUSAtIFtpbnB1dCBBTkQgb3V0cHV0XSBVbml0YXJ5IDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDAgLSBbaW5wdXRdIFRoZSBzbWFsbGVyIHJvdy9jb2x1bW4gaW5kZXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGlkeDEgLSBbaW5wdXRdIFRoZSBsYXJnZXIgcm93L2NvbHVtbiBpbmRleFxuICAgKi9cbiAgYXBwbHlKYWNvYmkzKCBtUywgbVEsIGlkeDAsIGlkeDEgKSB7XG4gICAgLy8gc3VibWF0cml4IGVudHJpZXMgZm9yIGlkeDAsaWR4MVxuICAgIGNvbnN0IGExMSA9IG1TWyAzICogaWR4MCArIGlkeDAgXTtcbiAgICBjb25zdCBhMTIgPSBtU1sgMyAqIGlkeDAgKyBpZHgxIF07IC8vIHdlIGFzc3VtZSBtUyBpcyBzeW1tZXRyaWMsIHNvIHdlIGRvbid0IG5lZWQgYTIxXG4gICAgY29uc3QgYTIyID0gbVNbIDMgKiBpZHgxICsgaWR4MSBdO1xuXG4gICAgLy8gQXBwcm94aW1hdGUgZ2l2ZW5zIGFuZ2xlLCBzZWUgaHR0cHM6Ly9ncmFwaGljcy5jcy53aXNjLmVkdS9QYXBlcnMvMjAxMS9NU1RUUzExL1NWRF9UUjE2OTAucGRmIChzZWN0aW9uIDIuMylcbiAgICAvLyBcIkNvbXB1dGluZyB0aGUgU2luZ3VsYXIgVmFsdWUgRGVjb21wb3NpdGlvbiBvZiAzeDMgbWF0cmljZXMgd2l0aCBtaW5pbWFsIGJyYW5jaGluZyBhbmQgZWxlbWVudGFyeSBmbG9hdGluZyBwb2ludCBvcGVyYXRpb25zXCJcbiAgICAvLyBBbGVrYSBNY0FkYW1zLCBBbmRyZXcgU2VsbGUsIFJhc211cyBUYW1zdG9yZiwgSm9zZXBoIFRlcmFuLCBFZnR5Y2hpb3MgU2lmYWtpc1xuICAgIGNvbnN0IGxocyA9IGExMiAqIGExMjtcbiAgICBsZXQgcmhzID0gYTExIC0gYTIyO1xuICAgIHJocyA9IHJocyAqIHJocztcbiAgICBjb25zdCB1c2VBbmdsZSA9IGxocyA8IHJocztcbiAgICBjb25zdCB3ID0gMSAvIE1hdGguc3FydCggbGhzICsgcmhzICk7XG4gICAgLy8gTk9URTogZXhhY3QgR2l2ZW5zIGFuZ2xlIGlzIDAuNSAqIE1hdGguYXRhbiggMiAqIGExMiAvICggYTExIC0gYTIyICkgKSwgYnV0IGNsYW1wZWQgdG8gd2l0aGluZyArLU1hdGguUEkgLyA0XG4gICAgY29uc3QgY29zID0gdXNlQW5nbGUgPyAoIHcgKiAoIGExMSAtIGEyMiApICkgOiBTUVJUX0hBTEY7XG4gICAgY29uc3Qgc2luID0gdXNlQW5nbGUgPyAoIHcgKiBhMTIgKSA6IFNRUlRfSEFMRjtcblxuICAgIC8vIFMnID0gUSAqIFMgKiB0cmFuc3Bvc2UoIFEgKVxuICAgIHRoaXMucHJlTXVsdDNHaXZlbnMoIG1TLCBjb3MsIHNpbiwgaWR4MCwgaWR4MSApO1xuICAgIHRoaXMucG9zdE11bHQzR2l2ZW5zKCBtUywgY29zLCBzaW4sIGlkeDAsIGlkeDEgKTtcblxuICAgIC8vIFEnID0gUSAqIG1RXG4gICAgdGhpcy5wcmVNdWx0M0dpdmVucyggbVEsIGNvcywgc2luLCBpZHgwLCBpZHgxICk7XG4gIH0sXG5cbiAgLypcbiAgICogVGhlIEphY29iaSBtZXRob2QsIHdoaWNoIGluIHR1cm4gemVyb3Mgb3V0IGFsbCB0aGUgbm9uLWRpYWdvbmFsIGVudHJpZXMgcmVwZWF0ZWRseSB1bnRpbCBtUyBjb252ZXJnZXMgaW50b1xuICAgKiBhIGRpYWdvbmFsIG1hdHJpeC4gV2UgdHJhY2sgdGhlIGFwcGxpZWQgR2l2ZW5zIHJvdGF0aW9ucyBpbiBtUSwgc28gdGhhdCB3aGVuIGdpdmVuIG1TIGFuZCBtUT1pZGVudGl0eSwgd2Ugd2lsbFxuICAgKiBtYWludGFpbiB0aGUgdmFsdWUgbVEgKiBtUyAqIG1RXlRcbiAgICpcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbVMgLSBbaW5wdXQgQU5EIG91dHB1dF0gU3ltbWV0cmljIDN4MyBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gbVEgLSBbaW5wdXQgQU5EIG91dHB1dF0gVW5pdGFyeSAzeDMgTWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gW2lucHV0XSBUaGUgbnVtYmVyIG9mIGl0ZXJhdGlvbnMgdG8gcnVuXG4gICAqL1xuICBqYWNvYmlJdGVyYXRpb24zKCBtUywgbVEsIG4gKSB7XG4gICAgLy8gZm9yIDN4Mywgd2UgZWxpbWluYXRlIG5vbi1kaWFnb25hbCBlbnRyaWVzIGl0ZXJhdGl2ZWx5XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgdGhpcy5hcHBseUphY29iaTMoIG1TLCBtUSwgMCwgMSApO1xuICAgICAgdGhpcy5hcHBseUphY29iaTMoIG1TLCBtUSwgMCwgMiApO1xuICAgICAgdGhpcy5hcHBseUphY29iaTMoIG1TLCBtUSwgMSwgMiApO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAgKiBPbmUgc3RlcCBpbiBjb21wdXRpbmcgdGhlIFFSIGRlY29tcG9zaXRpb24uIFplcm9zIG91dCB0aGUgKHJvdyxjb2wpIGVudHJ5IGluICdyJywgd2hpbGUgbWFpbnRhaW5pbmcgdGhlXG4gICAqIHZhbHVlIG9mIChxICogcikuIFdlIHdpbGwgZW5kIHVwIHdpdGggYW4gb3J0aG9nb25hbCBRIGFuZCB1cHBlci10cmlhbmd1bGFyIFIgKG9yIGluIHRoZSBTVkQgY2FzZSxcbiAgICogUiB3aWxsIGJlIGRpYWdvbmFsKVxuICAgKlxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBxIC0gW2lucHV0IEFORCBvdXB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSByIC0gW2lucHV0IEFORCBvdXB1dF0gM3gzIE1hdHJpeFxuICAgKiBAcGFyYW0ge251bWJlcn0gcm93IC0gW2lucHV0XSBUaGUgcm93IG9mIHRoZSBlbnRyeSB0byB6ZXJvIG91dFxuICAgKiBAcGFyYW0ge251bWJlcn0gY29sIC0gW2lucHV0XSBUaGUgY29sdW1uIG9mIHRoZSBlbnRyeSB0byB6ZXJvIG91dFxuICAgKi9cbiAgcXJBbm5paGlsYXRlMyggcSwgciwgcm93LCBjb2wgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm93ID4gY29sICk7IC8vIG9ubHkgaW4gdGhlIGxvd2VyLXRyaWFuZ3VsYXIgYXJlYVxuXG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMDAwMTtcbiAgICBsZXQgY29zO1xuICAgIGxldCBzaW47XG5cbiAgICBjb25zdCBkaWFnb25hbFZhbHVlID0gclsgdGhpcy5pbmRleDMoIGNvbCwgY29sICkgXTtcbiAgICBjb25zdCB0YXJnZXRWYWx1ZSA9IHJbIHRoaXMuaW5kZXgzKCByb3csIGNvbCApIF07XG4gICAgY29uc3QgZGlhZ29uYWxTcXVhcmVkID0gZGlhZ29uYWxWYWx1ZSAqIGRpYWdvbmFsVmFsdWU7XG4gICAgY29uc3QgdGFyZ2V0U3F1YXJlZCA9IHRhcmdldFZhbHVlICogdGFyZ2V0VmFsdWU7XG5cbiAgICAvLyBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgYm90aCAocm93LGNvbCkgYW5kIChjb2wsY29sKSBhcmUgdmVyeSBzbWFsbCAod291bGQgY2F1c2UgaW5zdGFiaWxpdGllcylcbiAgICBpZiAoIGRpYWdvbmFsU3F1YXJlZCArIHRhcmdldFNxdWFyZWQgPCBlcHNpbG9uICkge1xuICAgICAgY29zID0gZGlhZ29uYWxWYWx1ZSA+IDAgPyAxIDogMDtcbiAgICAgIHNpbiA9IDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgcnNxciA9IDEgLyBNYXRoLnNxcnQoIGRpYWdvbmFsU3F1YXJlZCArIHRhcmdldFNxdWFyZWQgKTtcbiAgICAgIGNvcyA9IHJzcXIgKiBkaWFnb25hbFZhbHVlO1xuICAgICAgc2luID0gcnNxciAqIHRhcmdldFZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMucHJlTXVsdDNHaXZlbnMoIHIsIGNvcywgc2luLCBjb2wsIHJvdyApO1xuICAgIHRoaXMucG9zdE11bHQzR2l2ZW5zKCBxLCBjb3MsIHNpbiwgY29sLCByb3cgKTtcbiAgfSxcblxuICAvKlxuICAgKiAzeDMgU2luZ3VsYXIgVmFsdWUgRGVjb21wb3NpdGlvbiwgaGFuZGxpbmcgc2luZ3VsYXIgY2FzZXMuXG4gICAqIEJhc2VkIG9uIGh0dHBzOi8vZ3JhcGhpY3MuY3Mud2lzYy5lZHUvUGFwZXJzLzIwMTEvTVNUVFMxMS9TVkRfVFIxNjkwLnBkZlxuICAgKiBcIkNvbXB1dGluZyB0aGUgU2luZ3VsYXIgVmFsdWUgRGVjb21wb3NpdGlvbiBvZiAzeDMgbWF0cmljZXMgd2l0aCBtaW5pbWFsIGJyYW5jaGluZyBhbmQgZWxlbWVudGFyeSBmbG9hdGluZyBwb2ludCBvcGVyYXRpb25zXCJcbiAgICogQWxla2EgTWNBZGFtcywgQW5kcmV3IFNlbGxlLCBSYXNtdXMgVGFtc3RvcmYsIEpvc2VwaCBUZXJhbiwgRWZ0eWNoaW9zIFNpZmFraXNcbiAgICpcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gYSAtIFtpbnB1dF0gM3gzIE1hdHJpeCB0aGF0IHdlIHdhbnQgdGhlIFNWRCBvZi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGphY29iaUl0ZXJhdGlvbkNvdW50IC0gW2lucHV0XSBIb3cgbWFueSBKYWNvYmkgaXRlcmF0aW9ucyB0byBydW4gKGxhcmdlciBpcyBtb3JlIGFjY3VyYXRlIHRvIGEgcG9pbnQpXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdFUgLSBbb3V0cHV0XSAzeDMgVSBtYXRyaXggKHVuaXRhcnkpXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdFNpZ21hIC0gW291dHB1dF0gM3gzIGRpYWdvbmFsIG1hdHJpeCBvZiBzaW5ndWxhciB2YWx1ZXNcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0ViAtIFtvdXRwdXRdIDN4MyBWIG1hdHJpeCAodW5pdGFyeSlcbiAgICovXG4gIHN2ZDMoIGEsIGphY29iaUl0ZXJhdGlvbkNvdW50LCByZXN1bHRVLCByZXN1bHRTaWdtYSwgcmVzdWx0ViApIHtcbiAgICAvLyBzaG9ydGhhbmRzXG4gICAgY29uc3QgcSA9IHJlc3VsdFU7XG4gICAgY29uc3QgdiA9IHJlc3VsdFY7XG4gICAgY29uc3QgciA9IHJlc3VsdFNpZ21hO1xuXG4gICAgLy8gZm9yIG5vdywgdXNlICdyJyBhcyBvdXIgUyA9PSB0cmFuc3Bvc2UoIEEgKSAqIEEsIHNvIHdlIGRvbid0IGhhdmUgdG8gdXNlIHNjcmF0Y2ggbWF0cmljZXNcbiAgICB0aGlzLm11bHQzTGVmdFRyYW5zcG9zZSggYSwgYSwgciApO1xuICAgIC8vIHdlJ2xsIGFjY3VtdWxhdGUgaW50byAncScgPT0gdHJhbnNwb3NlKCBWICkgZHVyaW5nIHRoZSBKYWNvYmkgaXRlcmF0aW9uXG4gICAgdGhpcy5zZXRJZGVudGl0eTMoIHEgKTtcblxuICAgIC8vIEphY29iaSBpdGVyYXRpb24gdHVybnMgUSBpbnRvIFZeVCBhbmQgUiBpbnRvIFNpZ21hXjIgKHdlJ2xsIGRpdGNoIFIgc2luY2UgdGhlIFFSIGRlY29tcG9zaXRpb24gd2lsbCBiZSBiZXRlcilcbiAgICB0aGlzLmphY29iaUl0ZXJhdGlvbjMoIHIsIHEsIGphY29iaUl0ZXJhdGlvbkNvdW50ICk7XG4gICAgLy8gZmluYWwgZGV0ZXJtaW5hdGlvbiBvZiBWXG4gICAgdGhpcy50cmFuc3Bvc2UzKCBxLCB2ICk7IC8vIGRvbmUgd2l0aCB0aGlzICdxJyB1bnRpbCB3ZSByZXVzZSB0aGUgc2NyYXRjaCBtYXRyaXggbGF0ZXIgYmVsb3cgZm9yIHRoZSBRUiBkZWNvbXBvc2l0aW9uXG5cbiAgICB0aGlzLm11bHQzKCBhLCB2LCByICk7IC8vIFIgPSBBVlxuXG4gICAgLy8gU29ydCBjb2x1bW5zIG9mIFIgYW5kIFYgYmFzZWQgb24gc2luZ3VsYXIgdmFsdWVzIChuZWVkZWQgZm9yIHRoZSBRUiBzdGVwLCBhbmQgdXNlZnVsIGFueXdheXMpLlxuICAgIC8vIFRoZWlyIHByb2R1Y3Qgd2lsbCByZW1haW4gdW5jaGFuZ2VkLlxuICAgIGxldCBtYWcwID0gclsgMCBdICogclsgMCBdICsgclsgMyBdICogclsgMyBdICsgclsgNiBdICogclsgNiBdOyAvLyBjb2x1bW4gdmVjdG9yIG1hZ25pdHVkZXNcbiAgICBsZXQgbWFnMSA9IHJbIDEgXSAqIHJbIDEgXSArIHJbIDQgXSAqIHJbIDQgXSArIHJbIDcgXSAqIHJbIDcgXTtcbiAgICBsZXQgbWFnMiA9IHJbIDIgXSAqIHJbIDIgXSArIHJbIDUgXSAqIHJbIDUgXSArIHJbIDggXSAqIHJbIDggXTtcbiAgICBsZXQgdG1wTWFnO1xuICAgIGlmICggbWFnMCA8IG1hZzEgKSB7XG4gICAgICAvLyBzd2FwIG1hZ25pdHVkZXNcbiAgICAgIHRtcE1hZyA9IG1hZzA7XG4gICAgICBtYWcwID0gbWFnMTtcbiAgICAgIG1hZzEgPSB0bXBNYWc7XG4gICAgICB0aGlzLnN3YXBOZWdhdGVDb2x1bW4oIHIsIDAsIDEgKTtcbiAgICAgIHRoaXMuc3dhcE5lZ2F0ZUNvbHVtbiggdiwgMCwgMSApO1xuICAgIH1cbiAgICBpZiAoIG1hZzAgPCBtYWcyICkge1xuICAgICAgLy8gc3dhcCBtYWduaXR1ZGVzXG4gICAgICB0bXBNYWcgPSBtYWcwO1xuICAgICAgbWFnMCA9IG1hZzI7XG4gICAgICBtYWcyID0gdG1wTWFnO1xuICAgICAgdGhpcy5zd2FwTmVnYXRlQ29sdW1uKCByLCAwLCAyICk7XG4gICAgICB0aGlzLnN3YXBOZWdhdGVDb2x1bW4oIHYsIDAsIDIgKTtcbiAgICB9XG4gICAgaWYgKCBtYWcxIDwgbWFnMiApIHtcbiAgICAgIHRoaXMuc3dhcE5lZ2F0ZUNvbHVtbiggciwgMSwgMiApO1xuICAgICAgdGhpcy5zd2FwTmVnYXRlQ29sdW1uKCB2LCAxLCAyICk7XG4gICAgfVxuXG4gICAgLy8gUVIgZGVjb21wb3NpdGlvblxuICAgIHRoaXMuc2V0SWRlbnRpdHkzKCBxICk7IC8vIHJldXNpbmcgUSBub3cgZm9yIHRoZSBRUlxuICAgIC8vIFplcm8gb3V0IGFsbCB0aHJlZSBzdHJpY3RseSBsb3dlci10cmlhbmd1bGFyIHZhbHVlcy4gU2hvdWxkIHR1cm4gdGhlIG1hdHJpeCBkaWFnb25hbFxuICAgIHRoaXMucXJBbm5paGlsYXRlMyggcSwgciwgMSwgMCApO1xuICAgIHRoaXMucXJBbm5paGlsYXRlMyggcSwgciwgMiwgMCApO1xuICAgIHRoaXMucXJBbm5paGlsYXRlMyggcSwgciwgMiwgMSApO1xuXG4gICAgLy8gY2hlY2tzIGZvciBhIHNpbmd1bGFyIFUgdmFsdWUsIHdlJ2xsIGFkZCBpbiB0aGUgbmVlZGVkIDEgZW50cmllcyB0byBtYWtlIHN1cmUgb3VyIFUgaXMgb3J0aG9nb25hbFxuICAgIGNvbnN0IGJpZ0Vwc2lsb24gPSAwLjAwMTsgLy8gdGhleSByZWFsbHkgc2hvdWxkIGJlIGFyb3VuZCAxXG4gICAgaWYgKCBxWyAwIF0gKiBxWyAwIF0gKyBxWyAxIF0gKiBxWyAxIF0gKyBxWyAyIF0gKiBxWyAyIF0gPCBiaWdFcHNpbG9uICkge1xuICAgICAgcVsgMCBdID0gMTtcbiAgICB9XG4gICAgaWYgKCBxWyAzIF0gKiBxWyAzIF0gKyBxWyA0IF0gKiBxWyA0IF0gKyBxWyA1IF0gKiBxWyA1IF0gPCBiaWdFcHNpbG9uICkge1xuICAgICAgcVsgNCBdID0gMTtcbiAgICB9XG4gICAgaWYgKCBxWyA2IF0gKiBxWyA2IF0gKyBxWyA3IF0gKiBxWyA3IF0gKyBxWyA4IF0gKiBxWyA4IF0gPCBiaWdFcHNpbG9uICkge1xuICAgICAgcVsgOCBdID0gMTtcbiAgICB9XG4gIH0sXG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIDN4TiBtYXRyaXggbWF0aFxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qXG4gICAqIFNldHMgdGhlIDN4TiByZXN1bHQgbWF0cml4IHRvIGJlIG1hZGUgb3V0IG9mIGNvbHVtbiB2ZWN0b3JzXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjM+fSBjb2x1bW5WZWN0b3JzIC0gW2lucHV0XSBMaXN0IG9mIDNEIGNvbHVtbiB2ZWN0b3JzXG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIDN4TiBNYXRyaXgsIHdoZXJlIE4gaXMgdGhlIG51bWJlciBvZiBjb2x1bW4gdmVjdG9yc1xuICAgKi9cbiAgc2V0VmVjdG9yczMoIGNvbHVtblZlY3RvcnMsIHJlc3VsdCApIHtcbiAgICBjb25zdCBtID0gMztcbiAgICBjb25zdCBuID0gY29sdW1uVmVjdG9ycy5sZW5ndGg7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IG0gKiBuLCAnQXJyYXkgbGVuZ3RoIGNoZWNrJyApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgY29uc3QgdmVjdG9yID0gY29sdW1uVmVjdG9yc1sgaSBdO1xuICAgICAgcmVzdWx0WyBpIF0gPSB2ZWN0b3IueDtcbiAgICAgIHJlc3VsdFsgaSArIG4gXSA9IHZlY3Rvci55O1xuICAgICAgcmVzdWx0WyBpICsgMiAqIG4gXSA9IHZlY3Rvci56O1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAgKiBSZXRyaWV2ZXMgY29sdW1uIHZlY3RvciB2YWx1ZXMgZnJvbSBhIDN4TiBtYXRyaXguXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtIC0gW2lucHV0XSBUaGUgbnVtYmVyIG9mIHJvd3MgaW4gdGhlIG1hdHJpeCAoc2FuaXR5IGNoZWNrLCBzaG91bGQgYWx3YXlzIGJlIDMpXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gW2lucHV0XSBUaGUgbnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIG1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIDN4TiBNYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbkluZGV4IC0gW2lucHV0XSAzeE4gTWF0cml4XG4gICAqIEBwYXJhbSB7VmVjdG9yM30gcmVzdWx0IC0gW291dHB1dF0gVmVjdG9yIHRvIHN0b3JlIHRoZSB4LHkselxuICAgKi9cbiAgZ2V0Q29sdW1uVmVjdG9yMyggbSwgbiwgbWF0cml4LCBjb2x1bW5JbmRleCwgcmVzdWx0ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG0gPT09IDMgJiYgY29sdW1uSW5kZXggPCBuICk7XG5cbiAgICByZXN1bHQueCA9IG1hdHJpeFsgY29sdW1uSW5kZXggXTtcbiAgICByZXN1bHQueSA9IG1hdHJpeFsgY29sdW1uSW5kZXggKyBuIF07XG4gICAgcmVzdWx0LnogPSBtYXRyaXhbIGNvbHVtbkluZGV4ICsgMiAqIG4gXTtcbiAgfSxcblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogQXJiaXRyYXJ5IGRpbWVuc2lvbiBtYXRyaXggbWF0aFxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qXG4gICAqIEZyb20gMC1pbmRleGVkIHJvdyBhbmQgY29sdW1uIGluZGljZXMsIHJldHVybnMgdGhlIGluZGV4IGludG8gdGhlIGZsYXQgYXJyYXlcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gTnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIG1hdHJpeFxuICAgKiBAcGFyYW0ge251bWJlcn0gcm93XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjb2xcbiAgICovXG4gIGluZGV4KCBtLCBuLCByb3csIGNvbCApIHtcbiAgICByZXR1cm4gbiAqIHJvdyArIGNvbDtcbiAgfSxcblxuICAvKlxuICAgKiBXcml0ZXMgdGhlIHRyYW5zcG9zZSBvZiB0aGUgbWF0cml4IGludG8gdGhlIHJlc3VsdC5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gTnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIG9yaWdpbmFsIG1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBtYXRyaXggLSBbaW5wdXRdIE14TiBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTnhNIE1hdHJpeFxuICAgKi9cbiAgdHJhbnNwb3NlKCBtLCBuLCBtYXRyaXgsIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXgubGVuZ3RoID49IG0gKiBuICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA+PSBuICogbSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeCAhPT0gcmVzdWx0LCAnSW4tcGxhY2UgbW9kaWZpY2F0aW9uIG5vdCBpbXBsZW1lbnRlZCB5ZXQnICk7XG5cbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbTsgcm93KysgKSB7XG4gICAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgbjsgY29sKysgKSB7XG4gICAgICAgIHJlc3VsdFsgbSAqIGNvbCArIHJvdyBdID0gbWF0cml4WyBuICogcm93ICsgY29sIF07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uIG9mICggbGVmdCAqIHJpZ2h0ICkgaW50byByZXN1bHRcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG0gLSBOdW1iZXIgb2Ygcm93cyBpbiB0aGUgbGVmdCBtYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgbGVmdCBtYXRyaXgsIG51bWJlciBvZiByb3dzIGluIHRoZSByaWdodCBtYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHAgLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgcmlnaHQgbWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IGxlZnQgLSBbaW5wdXRdIE14TiBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmlnaHQgLSBbaW5wdXRdIE54UCBNYXRyaXhcbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTXhQIE1hdHJpeFxuICAgKi9cbiAgbXVsdCggbSwgbiwgcCwgbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Lmxlbmd0aCA+PSBtICogbiApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0Lmxlbmd0aCA+PSBuICogcCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gbSAqIHAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0ICE9PSByZXN1bHQgJiYgcmlnaHQgIT09IHJlc3VsdCwgJ0luLXBsYWNlIG1vZGlmaWNhdGlvbiBub3QgaW1wbGVtZW50ZWQgeWV0JyApO1xuXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG07IHJvdysrICkge1xuICAgICAgZm9yICggbGV0IGNvbCA9IDA7IGNvbCA8IHA7IGNvbCsrICkge1xuICAgICAgICBsZXQgeCA9IDA7XG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG47IGsrKyApIHtcbiAgICAgICAgICB4ICs9IGxlZnRbIHRoaXMuaW5kZXgoIG0sIG4sIHJvdywgayApIF0gKiByaWdodFsgdGhpcy5pbmRleCggbiwgcCwgaywgY29sICkgXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHRoaXMuaW5kZXgoIG0sIHAsIHJvdywgY29sICkgXSA9IHg7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IG11bHRpcGxpY2F0aW9uIG9mICggbGVmdCAqIHRyYW5zcG9zZSggcmlnaHQgKSApIGludG8gcmVzdWx0XG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtIC0gTnVtYmVyIG9mIHJvd3MgaW4gdGhlIGxlZnQgbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIC0gTnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIGxlZnQgbWF0cml4LCBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgcmlnaHQgbWF0cml4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwIC0gTnVtYmVyIG9mIHJvd3MgaW4gdGhlIHJpZ2h0IG1hdHJpeFxuICAgKiBAcGFyYW0ge0Zhc3RNYXRoLkFycmF5fSBsZWZ0IC0gW2lucHV0XSBNeE4gTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJpZ2h0IC0gW2lucHV0XSBQeE4gTWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IHJlc3VsdCAtIFtvdXRwdXRdIE14UCBNYXRyaXhcbiAgICovXG4gIG11bHRSaWdodFRyYW5zcG9zZSggbSwgbiwgcCwgbGVmdCwgcmlnaHQsIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Lmxlbmd0aCA+PSBtICogbiApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0Lmxlbmd0aCA+PSBuICogcCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdC5sZW5ndGggPj0gbSAqIHAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0ICE9PSByZXN1bHQgJiYgcmlnaHQgIT09IHJlc3VsdCwgJ0luLXBsYWNlIG1vZGlmaWNhdGlvbiBub3QgaW1wbGVtZW50ZWQgeWV0JyApO1xuXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG07IHJvdysrICkge1xuICAgICAgZm9yICggbGV0IGNvbCA9IDA7IGNvbCA8IHA7IGNvbCsrICkge1xuICAgICAgICBsZXQgeCA9IDA7XG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG47IGsrKyApIHtcbiAgICAgICAgICB4ICs9IGxlZnRbIHRoaXMuaW5kZXgoIG0sIG4sIHJvdywgayApIF0gKiByaWdodFsgdGhpcy5pbmRleCggcCwgbiwgY29sLCBrICkgXTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbIHRoaXMuaW5kZXgoIG0sIHAsIHJvdywgY29sICkgXSA9IHg7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICAqIFdyaXRlcyB0aGUgbWF0cml4IGludG8gdGhlIHJlc3VsdCwgcGVybXV0aW5nIHRoZSBjb2x1bW5zLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbSAtIE51bWJlciBvZiByb3dzIGluIHRoZSBvcmlnaW5hbCBtYXRyaXhcbiAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBOdW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgb3JpZ2luYWwgbWF0cml4XG4gICAqIEBwYXJhbSB7RmFzdE1hdGguQXJyYXl9IG1hdHJpeCAtIFtpbnB1dF0gTXhOIE1hdHJpeFxuICAgKiBAcGFyYW0ge1Blcm11dGF0aW9ufSBwZXJtdXRhdGlvbiAtIFtpbnB1dF0gUGVybXV0YXRpb25cbiAgICogQHBhcmFtIHtGYXN0TWF0aC5BcnJheX0gcmVzdWx0IC0gW291dHB1dF0gTXhOIE1hdHJpeFxuICAgKi9cbiAgcGVybXV0ZUNvbHVtbnMoIG0sIG4sIG1hdHJpeCwgcGVybXV0YXRpb24sIHJlc3VsdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXRyaXggIT09IHJlc3VsdCwgJ0luLXBsYWNlIG1vZGlmaWNhdGlvbiBub3QgaW1wbGVtZW50ZWQgeWV0JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5sZW5ndGggPj0gbSAqIG4gKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXN1bHQubGVuZ3RoID49IG0gKiBuICk7XG5cbiAgICBmb3IgKCBsZXQgY29sID0gMDsgY29sIDwgbjsgY29sKysgKSB7XG4gICAgICBjb25zdCBwZXJtdXRlZENvbHVtbkluZGV4ID0gcGVybXV0YXRpb24uaW5kaWNlc1sgY29sIF07XG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbTsgcm93KysgKSB7XG4gICAgICAgIHJlc3VsdFsgdGhpcy5pbmRleCggbSwgbiwgcm93LCBjb2wgKSBdID0gbWF0cml4WyB0aGlzLmluZGV4KCBtLCBuLCByb3csIHBlcm11dGVkQ29sdW1uSW5kZXggKSBdO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbmRvdC5yZWdpc3RlciggJ01hdHJpeE9wczMnLCBNYXRyaXhPcHMzICk7XG5cbmV4cG9ydCBkZWZhdWx0IE1hdHJpeE9wczM7Il0sIm5hbWVzIjpbImRvdCIsIlNRUlRfSEFMRiIsIk1hdGgiLCJzcXJ0IiwiTWF0cml4T3BzMyIsIkFycmF5IiwiRmFzdEFycmF5IiwiaW5kZXgzIiwicm93IiwiY29sIiwiYXNzZXJ0Iiwic2V0MyIsIm1hdHJpeCIsInJlc3VsdCIsImxlbmd0aCIsInRyYW5zcG9zZTMiLCJtMSIsIm0yIiwibTMiLCJtNSIsIm02IiwibTciLCJkZXQzIiwibXVsdDMiLCJsZWZ0IiwicmlnaHQiLCJtMCIsIm00IiwibTgiLCJtdWx0M0xlZnRUcmFuc3Bvc2UiLCJtdWx0M1JpZ2h0VHJhbnNwb3NlIiwibXVsdDNCb3RoVHJhbnNwb3NlIiwibXVsdDNWZWN0b3IzIiwidmVjdG9yIiwieCIsInkiLCJ6Iiwic3dhcE5lZ2F0ZUNvbHVtbiIsImlkeDAiLCJpZHgxIiwidG1wMCIsInRtcDEiLCJ0bXAyIiwic2V0SWRlbnRpdHkzIiwic2V0R2l2ZW5zMyIsImNvcyIsInNpbiIsInByZU11bHQzR2l2ZW5zIiwiYmFzZUEiLCJiYXNlQiIsImEiLCJiIiwiYyIsImQiLCJlIiwiZiIsInBvc3RNdWx0M0dpdmVucyIsImFwcGx5SmFjb2JpMyIsIm1TIiwibVEiLCJhMTEiLCJhMTIiLCJhMjIiLCJsaHMiLCJyaHMiLCJ1c2VBbmdsZSIsInciLCJqYWNvYmlJdGVyYXRpb24zIiwibiIsImkiLCJxckFubmloaWxhdGUzIiwicSIsInIiLCJlcHNpbG9uIiwiZGlhZ29uYWxWYWx1ZSIsInRhcmdldFZhbHVlIiwiZGlhZ29uYWxTcXVhcmVkIiwidGFyZ2V0U3F1YXJlZCIsInJzcXIiLCJzdmQzIiwiamFjb2JpSXRlcmF0aW9uQ291bnQiLCJyZXN1bHRVIiwicmVzdWx0U2lnbWEiLCJyZXN1bHRWIiwidiIsIm1hZzAiLCJtYWcxIiwibWFnMiIsInRtcE1hZyIsImJpZ0Vwc2lsb24iLCJzZXRWZWN0b3JzMyIsImNvbHVtblZlY3RvcnMiLCJtIiwiZ2V0Q29sdW1uVmVjdG9yMyIsImNvbHVtbkluZGV4IiwiaW5kZXgiLCJ0cmFuc3Bvc2UiLCJtdWx0IiwicCIsImsiLCJtdWx0UmlnaHRUcmFuc3Bvc2UiLCJwZXJtdXRlQ29sdW1ucyIsInBlcm11dGF0aW9uIiwicGVybXV0ZWRDb2x1bW5JbmRleCIsImluZGljZXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBRTNCOzs7Ozs7OztDQVFDLEdBRUQsWUFBWTtBQUNaLE1BQU1DLFlBQVlDLEtBQUtDLElBQUksQ0FBRTtBQUU3QixNQUFNQyxhQUFhO0lBQ2pCLCtCQUErQjtJQUMvQkMsT0FBT0wsSUFBSU0sU0FBUztJQUVwQjs7Z0ZBRThFLEdBRTlFOzs7OztHQUtDLEdBQ0RDLFFBQVFDLEdBQUcsRUFBRUMsR0FBRztRQUNkQyxVQUFVQSxPQUFRRixPQUFPLEtBQUtBLE1BQU07UUFDcENFLFVBQVVBLE9BQVFELE9BQU8sS0FBS0EsTUFBTTtRQUNwQyxPQUFPLElBQUlELE1BQU1DO0lBQ25CO0lBRUE7Ozs7O0dBS0MsR0FDREUsTUFBTUMsTUFBTSxFQUFFQyxNQUFNO1FBQ2xCSCxVQUFVQSxPQUFRRSxPQUFPRSxNQUFNLElBQUk7UUFDbkNKLFVBQVVBLE9BQVFHLE9BQU9DLE1BQU0sSUFBSTtRQUNuQ0QsTUFBTSxDQUFFLEVBQUcsR0FBR0QsTUFBTSxDQUFFLEVBQUc7UUFDekJDLE1BQU0sQ0FBRSxFQUFHLEdBQUdELE1BQU0sQ0FBRSxFQUFHO1FBQ3pCQyxNQUFNLENBQUUsRUFBRyxHQUFHRCxNQUFNLENBQUUsRUFBRztRQUN6QkMsTUFBTSxDQUFFLEVBQUcsR0FBR0QsTUFB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RSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1QLEtBQUtNLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1FLEtBQUtILElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1OLEtBQUtLLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1MLEtBQUtJLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1KLEtBQUtHLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1HLEtBQUtKLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GWixNQUFNLENBQUUsRUFBRyxHQUFHYTtRQUNkYixNQUFNLENBQUUsRUFBRyxHQUFHRztRQUNkSCxNQUFNLENBQUUsRUFBRyxHQUFHSTtRQUNkSixNQUFNLENBQUUsRUFBRyxHQUFHSztRQUNkTCxNQUFNLENBQUUsRUFBRyxHQUFHYztRQUNkZCxNQUFNLENBQUUsRUFBRyxHQUFHTTtRQUNkTixNQUFNLENBQUUsRUFBRyxHQUFHTztRQUNkUCxNQUFNLENBQUUsRUFBRyxHQUFHUTtRQUNkUixNQUFNLENBQUUsRUFBRyxHQUFHZTtJQUNoQjtJQUVBOzs7Ozs7R0FNQyxHQUNEQyxvQkFBb0JMLElBQUksRUFBRUMsS0FBSyxFQUFFWixNQUFNO1FBQ3JDSCxVQUFVQSxPQUFRYyxLQUFLVixNQUFNLElBQUk7UUFDakNKLFVBQVVBLE9BQVFlLE1BQU1YLE1BQU0sSUFBSTtRQUNsQ0osVUFBVUEsT0FBUUcsT0FBT0MsTUFBTSxJQUFJO1FBQ25DLE1BQU1ZLEtBQUtGLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1ULEtBQUtRLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1SLEtBQUtPLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1QLEtBQUtNLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1FLEtBQUtILElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1OLEtBQUtLLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1MLEtBQUtJLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1KLEtBQUtHLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GLE1BQU1HLEtBQUtKLElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHLEdBQUdELElBQUksQ0FBRSxFQUFHLEdBQUdDLEtBQUssQ0FBRSxFQUFHO1FBQ25GWixNQUFNLENBQUUsRUFBRyxHQUFHYTtRQUNkYixNQUFNLENBQUUsRUFBRyxHQUFHRztRQUNkSCxNQUFNLENBQUUsRUFBRyxHQUFHSTtRQUNkSixNQUFNLENBQUUsRUFBRyxHQUFHSztRQUNkTCxNQUFNLENBQUUsRUFBRyxHQUFHYztRQUNkZCxNQUFNLENB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