// Copyright 2013-2022, University of Colorado Boulder
/**
 * SVD decomposition, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Matrix from './Matrix.js';
const ArrayType = window.Float64Array || Array;
let SingularValueDecomposition = class SingularValueDecomposition {
    /**
   * @public
   *
   * @returns {Matrix}
   */ getU() {
        return new Matrix(this.m, Math.min(this.m + 1, this.n), this.U, true); // the "fast" flag added, since U is ArrayType
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ getV() {
        return new Matrix(this.n, this.n, this.V, true);
    }
    /**
   * @public
   *
   * @returns {Array.<number>}
   */ getSingularValues() {
        return this.s;
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ getS() {
        const result = new Matrix(this.n, this.n);
        for(let i = 0; i < this.n; i++){
            for(let j = 0; j < this.n; j++){
                result.entries[result.index(i, j)] = 0.0;
            }
            result.entries[result.index(i, i)] = this.s[i];
        }
        return result;
    }
    /**
   * @public
   *
   * @returns {number}
   */ norm2() {
        return this.s[0];
    }
    /**
   * @public
   *
   * @returns {number}
   */ cond() {
        return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }
    /**
   * @public
   *
   * @returns {number}
   */ rank() {
        // changed to 23 from 52 (bits of mantissa), since we are using floats here!
        const eps = Math.pow(2.0, -23.0);
        const tol = Math.max(this.m, this.n) * this.s[0] * eps;
        let r = 0;
        for(let i = 0; i < this.s.length; i++){
            if (this.s[i] > tol) {
                r++;
            }
        }
        return r;
    }
    /**
   * Constructs the Moore-Penrose pseudoinverse of the specified matrix, using the SVD construction.
   * @public
   *
   * See https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_pseudoinverse for details. Helpful for
   * linear least-squares regression.
   *
   * @param {Matrix} matrix, m x n
   * @returns {Matrix} - n x m
   */ static pseudoinverse(matrix) {
        const svd = new SingularValueDecomposition(matrix);
        const sigmaPseudoinverse = Matrix.diagonalMatrix(svd.getSingularValues().map((value)=>{
            if (Math.abs(value) < 1e-300) {
                return 0;
            } else {
                return 1 / value;
            }
        }));
        return svd.getV().times(sigmaPseudoinverse).times(svd.getU().transpose());
    }
    /**
   * @param {Matrix} matrix
   */ constructor(matrix){
        this.matrix = matrix;
        const Arg = matrix;
        // Derived from LINPACK code.
        // Initialize.
        const A = Arg.getArrayCopy();
        this.m = Arg.getRowDimension();
        this.n = Arg.getColumnDimension();
        const m = this.m;
        const n = this.n;
        const min = Math.min;
        const max = Math.max;
        const pow = Math.pow;
        const abs = Math.abs;
        /* Apparently the failing cases are only a proper subset of (m<n),
     so let's not throw error.  Correct fix to come later?
     if (m<n) {
     throw new IllegalArgumentException("Jama SVD only works for m >= n"); }
     */ const nu = min(m, n);
        this.s = new ArrayType(min(m + 1, n));
        const s = this.s;
        this.U = new ArrayType(m * nu);
        const U = this.U;
        this.V = new ArrayType(n * n);
        const V = this.V;
        const e = new ArrayType(n);
        const work = new ArrayType(m);
        const wantu = true;
        const wantv = true;
        let i;
        let j;
        let k;
        let t;
        let f;
        let cs;
        let sn;
        const hypot = Matrix.hypot;
        // Reduce A to bidiagonal form, storing the diagonal elements
        // in s and the super-diagonal elements in e.
        const nct = min(m - 1, n);
        const nrt = max(0, min(n - 2, m));
        for(k = 0; k < max(nct, nrt); k++){
            if (k < nct) {
                // Compute the transformation for the k-th column and
                // place the k-th diagonal in s[k].
                // Compute 2-norm of k-th column without under/overflow.
                s[k] = 0;
                for(i = k; i < m; i++){
                    s[k] = hypot(s[k], A[i * n + k]);
                }
                if (s[k] !== 0.0) {
                    if (A[k * n + k] < 0.0) {
                        s[k] = -s[k];
                    }
                    for(i = k; i < m; i++){
                        A[i * n + k] /= s[k];
                    }
                    A[k * n + k] += 1.0;
                }
                s[k] = -s[k];
            }
            for(j = k + 1; j < n; j++){
                if (k < nct && s[k] !== 0.0) {
                    // Apply the transformation.
                    t = 0;
                    for(i = k; i < m; i++){
                        t += A[i * n + k] * A[i * n + j];
                    }
                    t = -t / A[k * n + k];
                    for(i = k; i < m; i++){
                        A[i * n + j] += t * A[i * n + k];
                    }
                }
                // Place the k-th row of A into e for the
                // subsequent calculation of the row transformation.
                e[j] = A[k * n + j];
            }
            if (wantu && k < nct) {
                // Place the transformation in U for subsequent back
                // multiplication.
                for(i = k; i < m; i++){
                    U[i * nu + k] = A[i * n + k];
                }
            }
            if (k < nrt) {
                // Compute the k-th row transformation and place the
                // k-th super-diagonal in e[k].
                // Compute 2-norm without under/overflow.
                e[k] = 0;
                for(i = k + 1; i < n; i++){
                    e[k] = hypot(e[k], e[i]);
                }
                if (e[k] !== 0.0) {
                    if (e[k + 1] < 0.0) {
                        e[k] = -e[k];
                    }
                    for(i = k + 1; i < n; i++){
                        e[i] /= e[k];
                    }
                    e[k + 1] += 1.0;
                }
                e[k] = -e[k];
                if (k + 1 < m && e[k] !== 0.0) {
                    // Apply the transformation.
                    for(i = k + 1; i < m; i++){
                        work[i] = 0.0;
                    }
                    for(j = k + 1; j < n; j++){
                        for(i = k + 1; i < m; i++){
                            work[i] += e[j] * A[i * n + j];
                        }
                    }
                    for(j = k + 1; j < n; j++){
                        t = -e[j] / e[k + 1];
                        for(i = k + 1; i < m; i++){
                            A[i * n + j] += t * work[i];
                        }
                    }
                }
                if (wantv) {
                    // Place the transformation in V for subsequent
                    // back multiplication.
                    for(i = k + 1; i < n; i++){
                        V[i * n + k] = e[i];
                    }
                }
            }
        }
        // Set up the final bidiagonal matrix or order p.
        let p = min(n, m + 1);
        if (nct < n) {
            s[nct] = A[nct * n + nct];
        }
        if (m < p) {
            s[p - 1] = 0.0;
        }
        if (nrt + 1 < p) {
            e[nrt] = A[nrt * n + p - 1];
        }
        e[p - 1] = 0.0;
        // If required, generate U.
        if (wantu) {
            for(j = nct; j < nu; j++){
                for(i = 0; i < m; i++){
                    U[i * nu + j] = 0.0;
                }
                U[j * nu + j] = 1.0;
            }
            for(k = nct - 1; k >= 0; k--){
                if (s[k] !== 0.0) {
                    for(j = k + 1; j < nu; j++){
                        t = 0;
                        for(i = k; i < m; i++){
                            t += U[i * nu + k] * U[i * nu + j];
                        }
                        t = -t / U[k * nu + k];
                        for(i = k; i < m; i++){
                            U[i * nu + j] += t * U[i * nu + k];
                        }
                    }
                    for(i = k; i < m; i++){
                        U[i * nu + k] = -U[i * nu + k];
                    }
                    U[k * nu + k] = 1.0 + U[k * nu + k];
                    for(i = 0; i < k - 1; i++){
                        U[i * nu + k] = 0.0;
                    }
                } else {
                    for(i = 0; i < m; i++){
                        U[i * nu + k] = 0.0;
                    }
                    U[k * nu + k] = 1.0;
                }
            }
        }
        // If required, generate V.
        if (wantv) {
            for(k = n - 1; k >= 0; k--){
                if (k < nrt && e[k] !== 0.0) {
                    for(j = k + 1; j < nu; j++){
                        t = 0;
                        for(i = k + 1; i < n; i++){
                            t += V[i * n + k] * V[i * n + j];
                        }
                        t = -t / V[(k + 1) * n + k];
                        for(i = k + 1; i < n; i++){
                            V[i * n + j] += t * V[i * n + k];
                        }
                    }
                }
                for(i = 0; i < n; i++){
                    V[i * n + k] = 0.0;
                }
                V[k * n + k] = 1.0;
            }
        }
        // Main iteration loop for the singular values.
        const pp = p - 1;
        let iter = 0;
        const eps = pow(2.0, -52.0);
        const tiny = pow(2.0, -966.0);
        while(p > 0){
            let kase;
            // Here is where a test for too many iterations would go.
            if (iter > 500) {
                break;
            }
            // This section of the program inspects for
            // negligible elements in the s and e arrays.  On
            // completion the variables kase and k are set as follows.
            // kase = 1   if s(p) and e[k-1] are negligible and k<p
            // kase = 2   if s(k) is negligible and k<p
            // kase = 3   if e[k-1] is negligible, k<p, and
            //        s(k), ..., s(p) are not negligible (qr step).
            // kase = 4   if e(p-1) is negligible (convergence).
            for(k = p - 2; k >= -1; k--){
                if (k === -1) {
                    break;
                }
                if (abs(e[k]) <= tiny + eps * (abs(s[k]) + abs(s[k + 1]))) {
                    e[k] = 0.0;
                    break;
                }
            }
            if (k === p - 2) {
                kase = 4;
            } else {
                let ks;
                for(ks = p - 1; ks >= k; ks--){
                    if (ks === k) {
                        break;
                    }
                    t = (ks !== p ? abs(e[ks]) : 0) + (ks !== k + 1 ? abs(e[ks - 1]) : 0);
                    if (abs(s[ks]) <= tiny + eps * t) {
                        s[ks] = 0.0;
                        break;
                    }
                }
                if (ks === k) {
                    kase = 3;
                } else if (ks === p - 1) {
                    kase = 1;
                } else {
                    kase = 2;
                    k = ks;
                }
            }
            k++;
            // Perform the task indicated by kase.
            switch(kase){
                // Deflate negligible s(p).
                case 1:
                    {
                        f = e[p - 2];
                        e[p - 2] = 0.0;
                        for(j = p - 2; j >= k; j--){
                            t = hypot(s[j], f);
                            cs = s[j] / t;
                            sn = f / t;
                            s[j] = t;
                            if (j !== k) {
                                f = -sn * e[j - 1];
                                e[j - 1] = cs * e[j - 1];
                            }
                            if (wantv) {
                                for(i = 0; i < n; i++){
                                    t = cs * V[i * n + j] + sn * V[i * n + p - 1];
                                    V[i * n + p - 1] = -sn * V[i * n + j] + cs * V[i * n + p - 1];
                                    V[i * n + j] = t;
                                }
                            }
                        }
                    }
                    break;
                // Split at negligible s(k).
                case 2:
                    {
                        f = e[k - 1];
                        e[k - 1] = 0.0;
                        for(j = k; j < p; j++){
                            t = hypot(s[j], f);
                            cs = s[j] / t;
                            sn = f / t;
                            s[j] = t;
                            f = -sn * e[j];
                            e[j] = cs * e[j];
                            if (wantu) {
                                for(i = 0; i < m; i++){
                                    t = cs * U[i * nu + j] + sn * U[i * nu + k - 1];
                                    U[i * nu + k - 1] = -sn * U[i * nu + j] + cs * U[i * nu + k - 1];
                                    U[i * nu + j] = t;
                                }
                            }
                        }
                    }
                    break;
                // Perform one qr step.
                case 3:
                    {
                        // Calculate the shift.
                        const scale = max(max(max(max(abs(s[p - 1]), abs(s[p - 2])), abs(e[p - 2])), abs(s[k])), abs(e[k]));
                        const sp = s[p - 1] / scale;
                        const spm1 = s[p - 2] / scale;
                        const epm1 = e[p - 2] / scale;
                        const sk = s[k] / scale;
                        const ek = e[k] / scale;
                        const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2.0;
                        const c = sp * epm1 * (sp * epm1);
                        let shift = 0.0;
                        if (b !== 0.0 || c !== 0.0) {
                            shift = Math.sqrt(b * b + c);
                            if (b < 0.0) {
                                shift = -shift;
                            }
                            shift = c / (b + shift);
                        }
                        f = (sk + sp) * (sk - sp) + shift;
                        let g = sk * ek;
                        // Chase zeros.
                        for(j = k; j < p - 1; j++){
                            t = hypot(f, g);
                            cs = f / t;
                            sn = g / t;
                            if (j !== k) {
                                e[j - 1] = t;
                            }
                            f = cs * s[j] + sn * e[j];
                            e[j] = cs * e[j] - sn * s[j];
                            g = sn * s[j + 1];
                            s[j + 1] = cs * s[j + 1];
                            if (wantv) {
                                for(i = 0; i < n; i++){
                                    t = cs * V[i * n + j] + sn * V[i * n + j + 1];
                                    V[i * n + j + 1] = -sn * V[i * n + j] + cs * V[i * n + j + 1];
                                    V[i * n + j] = t;
                                }
                            }
                            t = hypot(f, g);
                            cs = f / t;
                            sn = g / t;
                            s[j] = t;
                            f = cs * e[j] + sn * s[j + 1];
                            s[j + 1] = -sn * e[j] + cs * s[j + 1];
                            g = sn * e[j + 1];
                            e[j + 1] = cs * e[j + 1];
                            if (wantu && j < m - 1) {
                                for(i = 0; i < m; i++){
                                    t = cs * U[i * nu + j] + sn * U[i * nu + j + 1];
                                    U[i * nu + j + 1] = -sn * U[i * nu + j] + cs * U[i * nu + j + 1];
                                    U[i * nu + j] = t;
                                }
                            }
                        }
                        e[p - 2] = f;
                        iter = iter + 1;
                    }
                    break;
                // Convergence.
                case 4:
                    {
                        // Make the singular values positive.
                        if (s[k] <= 0.0) {
                            s[k] = s[k] < 0.0 ? -s[k] : 0.0;
                            if (wantv) {
                                for(i = 0; i <= pp; i++){
                                    V[i * n + k] = -V[i * n + k];
                                }
                            }
                        }
                        // Order the singular values.
                        while(k < pp){
                            if (s[k] >= s[k + 1]) {
                                break;
                            }
                            t = s[k];
                            s[k] = s[k + 1];
                            s[k + 1] = t;
                            if (wantv && k < n - 1) {
                                for(i = 0; i < n; i++){
                                    t = V[i * n + k + 1];
                                    V[i * n + k + 1] = V[i * n + k];
                                    V[i * n + k] = t;
                                }
                            }
                            if (wantu && k < m - 1) {
                                for(i = 0; i < m; i++){
                                    t = U[i * nu + k + 1];
                                    U[i * nu + k + 1] = U[i * nu + k];
                                    U[i * nu + k] = t;
                                }
                            }
                            k++;
                        }
                        iter = 0;
                        p--;
                    }
                    break;
                default:
                    throw new Error(`invalid kase: ${kase}`);
            }
        }
    }
};
dot.register('SingularValueDecomposition', SingularValueDecomposition);
export default SingularValueDecomposition;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9TaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTVkQgZGVjb21wb3NpdGlvbiwgYmFzZWQgb24gSmFtYSAoaHR0cDovL21hdGgubmlzdC5nb3YvamF2YW51bWVyaWNzL2phbWEvKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnO1xuXG5jb25zdCBBcnJheVR5cGUgPSB3aW5kb3cuRmxvYXQ2NEFycmF5IHx8IEFycmF5O1xuXG5jbGFzcyBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4XG4gICAqL1xuICBjb25zdHJ1Y3RvciggbWF0cml4ICkge1xuICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xuXG4gICAgY29uc3QgQXJnID0gbWF0cml4O1xuXG4gICAgLy8gRGVyaXZlZCBmcm9tIExJTlBBQ0sgY29kZS5cbiAgICAvLyBJbml0aWFsaXplLlxuICAgIGNvbnN0IEEgPSBBcmcuZ2V0QXJyYXlDb3B5KCk7XG4gICAgdGhpcy5tID0gQXJnLmdldFJvd0RpbWVuc2lvbigpO1xuICAgIHRoaXMubiA9IEFyZy5nZXRDb2x1bW5EaW1lbnNpb24oKTtcbiAgICBjb25zdCBtID0gdGhpcy5tO1xuICAgIGNvbnN0IG4gPSB0aGlzLm47XG5cbiAgICBjb25zdCBtaW4gPSBNYXRoLm1pbjtcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heDtcbiAgICBjb25zdCBwb3cgPSBNYXRoLnBvdztcbiAgICBjb25zdCBhYnMgPSBNYXRoLmFicztcblxuICAgIC8qIEFwcGFyZW50bHkgdGhlIGZhaWxpbmcgY2FzZXMgYXJlIG9ubHkgYSBwcm9wZXIgc3Vic2V0IG9mIChtPG4pLFxuICAgICBzbyBsZXQncyBub3QgdGhyb3cgZXJyb3IuICBDb3JyZWN0IGZpeCB0byBjb21lIGxhdGVyP1xuICAgICBpZiAobTxuKSB7XG4gICAgIHRocm93IG5ldyBJbGxlZ2FsQXJndW1lbnRFeGNlcHRpb24oXCJKYW1hIFNWRCBvbmx5IHdvcmtzIGZvciBtID49IG5cIik7IH1cbiAgICAgKi9cbiAgICBjb25zdCBudSA9IG1pbiggbSwgbiApO1xuICAgIHRoaXMucyA9IG5ldyBBcnJheVR5cGUoIG1pbiggbSArIDEsIG4gKSApO1xuICAgIGNvbnN0IHMgPSB0aGlzLnM7XG4gICAgdGhpcy5VID0gbmV3IEFycmF5VHlwZSggbSAqIG51ICk7XG4gICAgY29uc3QgVSA9IHRoaXMuVTtcbiAgICB0aGlzLlYgPSBuZXcgQXJyYXlUeXBlKCBuICogbiApO1xuICAgIGNvbnN0IFYgPSB0aGlzLlY7XG4gICAgY29uc3QgZSA9IG5ldyBBcnJheVR5cGUoIG4gKTtcbiAgICBjb25zdCB3b3JrID0gbmV3IEFycmF5VHlwZSggbSApO1xuICAgIGNvbnN0IHdhbnR1ID0gdHJ1ZTtcbiAgICBjb25zdCB3YW50diA9IHRydWU7XG5cbiAgICBsZXQgaTtcbiAgICBsZXQgajtcbiAgICBsZXQgaztcbiAgICBsZXQgdDtcbiAgICBsZXQgZjtcblxuICAgIGxldCBjcztcbiAgICBsZXQgc247XG5cbiAgICBjb25zdCBoeXBvdCA9IE1hdHJpeC5oeXBvdDtcblxuICAgIC8vIFJlZHVjZSBBIHRvIGJpZGlhZ29uYWwgZm9ybSwgc3RvcmluZyB0aGUgZGlhZ29uYWwgZWxlbWVudHNcbiAgICAvLyBpbiBzIGFuZCB0aGUgc3VwZXItZGlhZ29uYWwgZWxlbWVudHMgaW4gZS5cblxuICAgIGNvbnN0IG5jdCA9IG1pbiggbSAtIDEsIG4gKTtcbiAgICBjb25zdCBucnQgPSBtYXgoIDAsIG1pbiggbiAtIDIsIG0gKSApO1xuICAgIGZvciAoIGsgPSAwOyBrIDwgbWF4KCBuY3QsIG5ydCApOyBrKysgKSB7XG4gICAgICBpZiAoIGsgPCBuY3QgKSB7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBrLXRoIGNvbHVtbiBhbmRcbiAgICAgICAgLy8gcGxhY2UgdGhlIGstdGggZGlhZ29uYWwgaW4gc1trXS5cbiAgICAgICAgLy8gQ29tcHV0ZSAyLW5vcm0gb2Ygay10aCBjb2x1bW4gd2l0aG91dCB1bmRlci9vdmVyZmxvdy5cbiAgICAgICAgc1sgayBdID0gMDtcbiAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgc1sgayBdID0gaHlwb3QoIHNbIGsgXSwgQVsgaSAqIG4gKyBrIF0gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHNbIGsgXSAhPT0gMC4wICkge1xuICAgICAgICAgIGlmICggQVsgayAqIG4gKyBrIF0gPCAwLjAgKSB7XG4gICAgICAgICAgICBzWyBrIF0gPSAtc1sgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKCBpID0gazsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICAgIEFbIGkgKiBuICsgayBdIC89IHNbIGsgXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgQVsgayAqIG4gKyBrIF0gKz0gMS4wO1xuICAgICAgICB9XG4gICAgICAgIHNbIGsgXSA9IC1zWyBrIF07XG4gICAgICB9XG4gICAgICBmb3IgKCBqID0gayArIDE7IGogPCBuOyBqKysgKSB7XG4gICAgICAgIGlmICggKCBrIDwgbmN0ICkgJiYgKCBzWyBrIF0gIT09IDAuMCApICkge1xuXG4gICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgdCA9IDA7XG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgICB0ICs9IEFbIGkgKiBuICsgayBdICogQVsgaSAqIG4gKyBqIF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHQgPSAtdCAvIEFbIGsgKiBuICsgayBdO1xuICAgICAgICAgIGZvciAoIGkgPSBrOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAgICAgQVsgaSAqIG4gKyBqIF0gKz0gdCAqIEFbIGkgKiBuICsgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBsYWNlIHRoZSBrLXRoIHJvdyBvZiBBIGludG8gZSBmb3IgdGhlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgY2FsY3VsYXRpb24gb2YgdGhlIHJvdyB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICBlWyBqIF0gPSBBWyBrICogbiArIGogXTtcbiAgICAgIH1cbiAgICAgIGlmICggd2FudHUgJiYgKCBrIDwgbmN0ICkgKSB7XG5cbiAgICAgICAgLy8gUGxhY2UgdGhlIHRyYW5zZm9ybWF0aW9uIGluIFUgZm9yIHN1YnNlcXVlbnQgYmFja1xuICAgICAgICAvLyBtdWx0aXBsaWNhdGlvbi5cblxuICAgICAgICBmb3IgKCBpID0gazsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICBVWyBpICogbnUgKyBrIF0gPSBBWyBpICogbiArIGsgXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCBrIDwgbnJ0ICkge1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGstdGggcm93IHRyYW5zZm9ybWF0aW9uIGFuZCBwbGFjZSB0aGVcbiAgICAgICAgLy8gay10aCBzdXBlci1kaWFnb25hbCBpbiBlW2tdLlxuICAgICAgICAvLyBDb21wdXRlIDItbm9ybSB3aXRob3V0IHVuZGVyL292ZXJmbG93LlxuICAgICAgICBlWyBrIF0gPSAwO1xuICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBuOyBpKysgKSB7XG4gICAgICAgICAgZVsgayBdID0gaHlwb3QoIGVbIGsgXSwgZVsgaSBdICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBlWyBrIF0gIT09IDAuMCApIHtcbiAgICAgICAgICBpZiAoIGVbIGsgKyAxIF0gPCAwLjAgKSB7XG4gICAgICAgICAgICBlWyBrIF0gPSAtZVsgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBuOyBpKysgKSB7XG4gICAgICAgICAgICBlWyBpIF0gLz0gZVsgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlWyBrICsgMSBdICs9IDEuMDtcbiAgICAgICAgfVxuICAgICAgICBlWyBrIF0gPSAtZVsgayBdO1xuICAgICAgICBpZiAoICggayArIDEgPCBtICkgJiYgKCBlWyBrIF0gIT09IDAuMCApICkge1xuXG4gICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAgICAgd29ya1sgaSBdID0gMC4wO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKCBqID0gayArIDE7IGogPCBuOyBqKysgKSB7XG4gICAgICAgICAgICBmb3IgKCBpID0gayArIDE7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgICAgIHdvcmtbIGkgXSArPSBlWyBqIF0gKiBBWyBpICogbiArIGogXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICggaiA9IGsgKyAxOyBqIDwgbjsgaisrICkge1xuICAgICAgICAgICAgdCA9IC1lWyBqIF0gLyBlWyBrICsgMSBdO1xuICAgICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAgICAgICBBWyBpICogbiArIGogXSArPSB0ICogd29ya1sgaSBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIHdhbnR2ICkge1xuXG4gICAgICAgICAgLy8gUGxhY2UgdGhlIHRyYW5zZm9ybWF0aW9uIGluIFYgZm9yIHN1YnNlcXVlbnRcbiAgICAgICAgICAvLyBiYWNrIG11bHRpcGxpY2F0aW9uLlxuXG4gICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xuICAgICAgICAgICAgVlsgaSAqIG4gKyBrIF0gPSBlWyBpIF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIHRoZSBmaW5hbCBiaWRpYWdvbmFsIG1hdHJpeCBvciBvcmRlciBwLlxuXG4gICAgbGV0IHAgPSBtaW4oIG4sIG0gKyAxICk7XG4gICAgaWYgKCBuY3QgPCBuICkge1xuICAgICAgc1sgbmN0IF0gPSBBWyBuY3QgKiBuICsgbmN0IF07XG4gICAgfVxuICAgIGlmICggbSA8IHAgKSB7XG4gICAgICBzWyBwIC0gMSBdID0gMC4wO1xuICAgIH1cbiAgICBpZiAoIG5ydCArIDEgPCBwICkge1xuICAgICAgZVsgbnJ0IF0gPSBBWyBucnQgKiBuICsgcCAtIDEgXTtcbiAgICB9XG4gICAgZVsgcCAtIDEgXSA9IDAuMDtcblxuICAgIC8vIElmIHJlcXVpcmVkLCBnZW5lcmF0ZSBVLlxuXG4gICAgaWYgKCB3YW50dSApIHtcbiAgICAgIGZvciAoIGogPSBuY3Q7IGogPCBudTsgaisrICkge1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICBVWyBpICogbnUgKyBqIF0gPSAwLjA7XG4gICAgICAgIH1cbiAgICAgICAgVVsgaiAqIG51ICsgaiBdID0gMS4wO1xuICAgICAgfVxuICAgICAgZm9yICggayA9IG5jdCAtIDE7IGsgPj0gMDsgay0tICkge1xuICAgICAgICBpZiAoIHNbIGsgXSAhPT0gMC4wICkge1xuICAgICAgICAgIGZvciAoIGogPSBrICsgMTsgaiA8IG51OyBqKysgKSB7XG4gICAgICAgICAgICB0ID0gMDtcbiAgICAgICAgICAgIGZvciAoIGkgPSBrOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAgICAgICB0ICs9IFVbIGkgKiBudSArIGsgXSAqIFVbIGkgKiBudSArIGogXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHQgPSAtdCAvIFVbIGsgKiBudSArIGsgXTtcbiAgICAgICAgICAgIGZvciAoIGkgPSBrOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAgICAgICBVWyBpICogbnUgKyBqIF0gKz0gdCAqIFVbIGkgKiBudSArIGsgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICggaSA9IGs7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgICBVWyBpICogbnUgKyBrIF0gPSAtVVsgaSAqIG51ICsgayBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBVWyBrICogbnUgKyBrIF0gPSAxLjAgKyBVWyBrICogbnUgKyBrIF07XG4gICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBrIC0gMTsgaSsrICkge1xuICAgICAgICAgICAgVVsgaSAqIG51ICsgayBdID0gMC4wO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICAgIFVbIGkgKiBudSArIGsgXSA9IDAuMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgVVsgayAqIG51ICsgayBdID0gMS4wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgcmVxdWlyZWQsIGdlbmVyYXRlIFYuXG5cbiAgICBpZiAoIHdhbnR2ICkge1xuICAgICAgZm9yICggayA9IG4gLSAxOyBrID49IDA7IGstLSApIHtcbiAgICAgICAgaWYgKCAoIGsgPCBucnQgKSAmJiAoIGVbIGsgXSAhPT0gMC4wICkgKSB7XG4gICAgICAgICAgZm9yICggaiA9IGsgKyAxOyBqIDwgbnU7IGorKyApIHtcbiAgICAgICAgICAgIHQgPSAwO1xuICAgICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xuICAgICAgICAgICAgICB0ICs9IFZbIGkgKiBuICsgayBdICogVlsgaSAqIG4gKyBqIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ID0gLXQgLyBWWyAoIGsgKyAxICkgKiBuICsgayBdO1xuICAgICAgICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgbjsgaSsrICkge1xuICAgICAgICAgICAgICBWWyBpICogbiArIGogXSArPSB0ICogVlsgaSAqIG4gKyBrIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgICAgIFZbIGkgKiBuICsgayBdID0gMC4wO1xuICAgICAgICB9XG4gICAgICAgIFZbIGsgKiBuICsgayBdID0gMS4wO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1haW4gaXRlcmF0aW9uIGxvb3AgZm9yIHRoZSBzaW5ndWxhciB2YWx1ZXMuXG5cbiAgICBjb25zdCBwcCA9IHAgLSAxO1xuICAgIGxldCBpdGVyID0gMDtcbiAgICBjb25zdCBlcHMgPSBwb3coIDIuMCwgLTUyLjAgKTtcbiAgICBjb25zdCB0aW55ID0gcG93KCAyLjAsIC05NjYuMCApO1xuICAgIHdoaWxlICggcCA+IDAgKSB7XG4gICAgICBsZXQga2FzZTtcblxuICAgICAgLy8gSGVyZSBpcyB3aGVyZSBhIHRlc3QgZm9yIHRvbyBtYW55IGl0ZXJhdGlvbnMgd291bGQgZ28uXG4gICAgICBpZiAoIGl0ZXIgPiA1MDAgKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIHNlY3Rpb24gb2YgdGhlIHByb2dyYW0gaW5zcGVjdHMgZm9yXG4gICAgICAvLyBuZWdsaWdpYmxlIGVsZW1lbnRzIGluIHRoZSBzIGFuZCBlIGFycmF5cy4gIE9uXG4gICAgICAvLyBjb21wbGV0aW9uIHRoZSB2YXJpYWJsZXMga2FzZSBhbmQgayBhcmUgc2V0IGFzIGZvbGxvd3MuXG5cbiAgICAgIC8vIGthc2UgPSAxICAgaWYgcyhwKSBhbmQgZVtrLTFdIGFyZSBuZWdsaWdpYmxlIGFuZCBrPHBcbiAgICAgIC8vIGthc2UgPSAyICAgaWYgcyhrKSBpcyBuZWdsaWdpYmxlIGFuZCBrPHBcbiAgICAgIC8vIGthc2UgPSAzICAgaWYgZVtrLTFdIGlzIG5lZ2xpZ2libGUsIGs8cCwgYW5kXG4gICAgICAvLyAgICAgICAgcyhrKSwgLi4uLCBzKHApIGFyZSBub3QgbmVnbGlnaWJsZSAocXIgc3RlcCkuXG4gICAgICAvLyBrYXNlID0gNCAgIGlmIGUocC0xKSBpcyBuZWdsaWdpYmxlIChjb252ZXJnZW5jZSkuXG5cbiAgICAgIGZvciAoIGsgPSBwIC0gMjsgayA+PSAtMTsgay0tICkge1xuICAgICAgICBpZiAoIGsgPT09IC0xICkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYWJzKCBlWyBrIF0gKSA8PVxuICAgICAgICAgICAgIHRpbnkgKyBlcHMgKiAoIGFicyggc1sgayBdICkgKyBhYnMoIHNbIGsgKyAxIF0gKSApICkge1xuICAgICAgICAgIGVbIGsgXSA9IDAuMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCBrID09PSBwIC0gMiApIHtcbiAgICAgICAga2FzZSA9IDQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGtzO1xuICAgICAgICBmb3IgKCBrcyA9IHAgLSAxOyBrcyA+PSBrOyBrcy0tICkge1xuICAgICAgICAgIGlmICgga3MgPT09IGsgKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgdCA9ICgga3MgIT09IHAgPyBhYnMoIGVbIGtzIF0gKSA6IDAgKSArXG4gICAgICAgICAgICAgICgga3MgIT09IGsgKyAxID8gYWJzKCBlWyBrcyAtIDEgXSApIDogMCApO1xuICAgICAgICAgIGlmICggYWJzKCBzWyBrcyBdICkgPD0gdGlueSArIGVwcyAqIHQgKSB7XG4gICAgICAgICAgICBzWyBrcyBdID0gMC4wO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgga3MgPT09IGsgKSB7XG4gICAgICAgICAga2FzZSA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGtzID09PSBwIC0gMSApIHtcbiAgICAgICAgICBrYXNlID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBrYXNlID0gMjtcbiAgICAgICAgICBrID0ga3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGsrKztcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgdGFzayBpbmRpY2F0ZWQgYnkga2FzZS5cblxuICAgICAgc3dpdGNoKCBrYXNlICkge1xuXG4gICAgICAgIC8vIERlZmxhdGUgbmVnbGlnaWJsZSBzKHApLlxuXG4gICAgICAgIGNhc2UgMToge1xuICAgICAgICAgIGYgPSBlWyBwIC0gMiBdO1xuICAgICAgICAgIGVbIHAgLSAyIF0gPSAwLjA7XG4gICAgICAgICAgZm9yICggaiA9IHAgLSAyOyBqID49IGs7IGotLSApIHtcbiAgICAgICAgICAgIHQgPSBoeXBvdCggc1sgaiBdLCBmICk7XG4gICAgICAgICAgICBjcyA9IHNbIGogXSAvIHQ7XG4gICAgICAgICAgICBzbiA9IGYgLyB0O1xuICAgICAgICAgICAgc1sgaiBdID0gdDtcbiAgICAgICAgICAgIGlmICggaiAhPT0gayApIHtcbiAgICAgICAgICAgICAgZiA9IC1zbiAqIGVbIGogLSAxIF07XG4gICAgICAgICAgICAgIGVbIGogLSAxIF0gPSBjcyAqIGVbIGogLSAxIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHdhbnR2ICkge1xuICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG47IGkrKyApIHtcbiAgICAgICAgICAgICAgICB0ID0gY3MgKiBWWyBpICogbiArIGogXSArIHNuICogVlsgaSAqIG4gKyBwIC0gMSBdO1xuICAgICAgICAgICAgICAgIFZbIGkgKiBuICsgcCAtIDEgXSA9IC1zbiAqIFZbIGkgKiBuICsgaiBdICsgY3MgKiBWWyBpICogbiArIHAgLSAxIF07XG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBqIF0gPSB0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gU3BsaXQgYXQgbmVnbGlnaWJsZSBzKGspLlxuXG4gICAgICAgIGNhc2UgMjoge1xuICAgICAgICAgIGYgPSBlWyBrIC0gMSBdO1xuICAgICAgICAgIGVbIGsgLSAxIF0gPSAwLjA7XG4gICAgICAgICAgZm9yICggaiA9IGs7IGogPCBwOyBqKysgKSB7XG4gICAgICAgICAgICB0ID0gaHlwb3QoIHNbIGogXSwgZiApO1xuICAgICAgICAgICAgY3MgPSBzWyBqIF0gLyB0O1xuICAgICAgICAgICAgc24gPSBmIC8gdDtcbiAgICAgICAgICAgIHNbIGogXSA9IHQ7XG4gICAgICAgICAgICBmID0gLXNuICogZVsgaiBdO1xuICAgICAgICAgICAgZVsgaiBdID0gY3MgKiBlWyBqIF07XG4gICAgICAgICAgICBpZiAoIHdhbnR1ICkge1xuICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICAgICAgICB0ID0gY3MgKiBVWyBpICogbnUgKyBqIF0gKyBzbiAqIFVbIGkgKiBudSArIGsgLSAxIF07XG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgayAtIDEgXSA9IC1zbiAqIFVbIGkgKiBudSArIGogXSArIGNzICogVVsgaSAqIG51ICsgayAtIDEgXTtcbiAgICAgICAgICAgICAgICBVWyBpICogbnUgKyBqIF0gPSB0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gUGVyZm9ybSBvbmUgcXIgc3RlcC5cblxuICAgICAgICBjYXNlIDM6IHtcblxuICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgc2hpZnQuXG5cbiAgICAgICAgICBjb25zdCBzY2FsZSA9IG1heCggbWF4KCBtYXgoIG1heCggYWJzKCBzWyBwIC0gMSBdICksIGFicyggc1sgcCAtIDIgXSApICksIGFicyggZVsgcCAtIDIgXSApICksIGFicyggc1sgayBdICkgKSwgYWJzKCBlWyBrIF0gKSApO1xuICAgICAgICAgIGNvbnN0IHNwID0gc1sgcCAtIDEgXSAvIHNjYWxlO1xuICAgICAgICAgIGNvbnN0IHNwbTEgPSBzWyBwIC0gMiBdIC8gc2NhbGU7XG4gICAgICAgICAgY29uc3QgZXBtMSA9IGVbIHAgLSAyIF0gLyBzY2FsZTtcbiAgICAgICAgICBjb25zdCBzayA9IHNbIGsgXSAvIHNjYWxlO1xuICAgICAgICAgIGNvbnN0IGVrID0gZVsgayBdIC8gc2NhbGU7XG4gICAgICAgICAgY29uc3QgYiA9ICggKCBzcG0xICsgc3AgKSAqICggc3BtMSAtIHNwICkgKyBlcG0xICogZXBtMSApIC8gMi4wO1xuICAgICAgICAgIGNvbnN0IGMgPSAoIHNwICogZXBtMSApICogKCBzcCAqIGVwbTEgKTtcbiAgICAgICAgICBsZXQgc2hpZnQgPSAwLjA7XG4gICAgICAgICAgaWYgKCAoIGIgIT09IDAuMCApIHx8ICggYyAhPT0gMC4wICkgKSB7XG4gICAgICAgICAgICBzaGlmdCA9IE1hdGguc3FydCggYiAqIGIgKyBjICk7XG4gICAgICAgICAgICBpZiAoIGIgPCAwLjAgKSB7XG4gICAgICAgICAgICAgIHNoaWZ0ID0gLXNoaWZ0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2hpZnQgPSBjIC8gKCBiICsgc2hpZnQgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZiA9ICggc2sgKyBzcCApICogKCBzayAtIHNwICkgKyBzaGlmdDtcbiAgICAgICAgICBsZXQgZyA9IHNrICogZWs7XG5cbiAgICAgICAgICAvLyBDaGFzZSB6ZXJvcy5cblxuICAgICAgICAgIGZvciAoIGogPSBrOyBqIDwgcCAtIDE7IGorKyApIHtcbiAgICAgICAgICAgIHQgPSBoeXBvdCggZiwgZyApO1xuICAgICAgICAgICAgY3MgPSBmIC8gdDtcbiAgICAgICAgICAgIHNuID0gZyAvIHQ7XG4gICAgICAgICAgICBpZiAoIGogIT09IGsgKSB7XG4gICAgICAgICAgICAgIGVbIGogLSAxIF0gPSB0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZiA9IGNzICogc1sgaiBdICsgc24gKiBlWyBqIF07XG4gICAgICAgICAgICBlWyBqIF0gPSBjcyAqIGVbIGogXSAtIHNuICogc1sgaiBdO1xuICAgICAgICAgICAgZyA9IHNuICogc1sgaiArIDEgXTtcbiAgICAgICAgICAgIHNbIGogKyAxIF0gPSBjcyAqIHNbIGogKyAxIF07XG4gICAgICAgICAgICBpZiAoIHdhbnR2ICkge1xuICAgICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG47IGkrKyApIHtcbiAgICAgICAgICAgICAgICB0ID0gY3MgKiBWWyBpICogbiArIGogXSArIHNuICogVlsgaSAqIG4gKyBqICsgMSBdO1xuICAgICAgICAgICAgICAgIFZbIGkgKiBuICsgaiArIDEgXSA9IC1zbiAqIFZbIGkgKiBuICsgaiBdICsgY3MgKiBWWyBpICogbiArIGogKyAxIF07XG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBqIF0gPSB0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ID0gaHlwb3QoIGYsIGcgKTtcbiAgICAgICAgICAgIGNzID0gZiAvIHQ7XG4gICAgICAgICAgICBzbiA9IGcgLyB0O1xuICAgICAgICAgICAgc1sgaiBdID0gdDtcbiAgICAgICAgICAgIGYgPSBjcyAqIGVbIGogXSArIHNuICogc1sgaiArIDEgXTtcbiAgICAgICAgICAgIHNbIGogKyAxIF0gPSAtc24gKiBlWyBqIF0gKyBjcyAqIHNbIGogKyAxIF07XG4gICAgICAgICAgICBnID0gc24gKiBlWyBqICsgMSBdO1xuICAgICAgICAgICAgZVsgaiArIDEgXSA9IGNzICogZVsgaiArIDEgXTtcbiAgICAgICAgICAgIGlmICggd2FudHUgJiYgKCBqIDwgbSAtIDEgKSApIHtcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdCA9IGNzICogVVsgaSAqIG51ICsgaiBdICsgc24gKiBVWyBpICogbnUgKyBqICsgMSBdO1xuICAgICAgICAgICAgICAgIFVbIGkgKiBudSArIGogKyAxIF0gPSAtc24gKiBVWyBpICogbnUgKyBqIF0gKyBjcyAqIFVbIGkgKiBudSArIGogKyAxIF07XG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgaiBdID0gdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlWyBwIC0gMiBdID0gZjtcbiAgICAgICAgICBpdGVyID0gaXRlciArIDE7XG4gICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBDb252ZXJnZW5jZS5cblxuICAgICAgICBjYXNlIDQ6IHtcblxuICAgICAgICAgIC8vIE1ha2UgdGhlIHNpbmd1bGFyIHZhbHVlcyBwb3NpdGl2ZS5cblxuICAgICAgICAgIGlmICggc1sgayBdIDw9IDAuMCApIHtcbiAgICAgICAgICAgIHNbIGsgXSA9ICggc1sgayBdIDwgMC4wID8gLXNbIGsgXSA6IDAuMCApO1xuICAgICAgICAgICAgaWYgKCB3YW50diApIHtcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gcHA7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBWWyBpICogbiArIGsgXSA9IC1WWyBpICogbiArIGsgXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE9yZGVyIHRoZSBzaW5ndWxhciB2YWx1ZXMuXG5cbiAgICAgICAgICB3aGlsZSAoIGsgPCBwcCApIHtcbiAgICAgICAgICAgIGlmICggc1sgayBdID49IHNbIGsgKyAxIF0gKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdCA9IHNbIGsgXTtcbiAgICAgICAgICAgIHNbIGsgXSA9IHNbIGsgKyAxIF07XG4gICAgICAgICAgICBzWyBrICsgMSBdID0gdDtcbiAgICAgICAgICAgIGlmICggd2FudHYgJiYgKCBrIDwgbiAtIDEgKSApIHtcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdCA9IFZbIGkgKiBuICsgayArIDEgXTtcbiAgICAgICAgICAgICAgICBWWyBpICogbiArIGsgKyAxIF0gPSBWWyBpICogbiArIGsgXTtcbiAgICAgICAgICAgICAgICBWWyBpICogbiArIGsgXSA9IHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggd2FudHUgJiYgKCBrIDwgbSAtIDEgKSApIHtcbiAgICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdCA9IFVbIGkgKiBudSArIGsgKyAxIF07XG4gICAgICAgICAgICAgICAgVVsgaSAqIG51ICsgayArIDEgXSA9IFVbIGkgKiBudSArIGsgXTtcbiAgICAgICAgICAgICAgICBVWyBpICogbnUgKyBrIF0gPSB0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIGl0ZXIgPSAwO1xuICAgICAgICAgIHAtLTtcbiAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBrYXNlOiAke2thc2V9YCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICBnZXRVKCkge1xuICAgIHJldHVybiBuZXcgTWF0cml4KCB0aGlzLm0sIE1hdGgubWluKCB0aGlzLm0gKyAxLCB0aGlzLm4gKSwgdGhpcy5VLCB0cnVlICk7IC8vIHRoZSBcImZhc3RcIiBmbGFnIGFkZGVkLCBzaW5jZSBVIGlzIEFycmF5VHlwZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIGdldFYoKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRyaXgoIHRoaXMubiwgdGhpcy5uLCB0aGlzLlYsIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPn1cbiAgICovXG4gIGdldFNpbmd1bGFyVmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLnM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgZ2V0UygpIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCB0aGlzLm4sIHRoaXMubiApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubjsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIHJlc3VsdC5lbnRyaWVzWyByZXN1bHQuaW5kZXgoIGksIGogKSBdID0gMC4wO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaSApIF0gPSB0aGlzLnNbIGkgXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBub3JtMigpIHtcbiAgICByZXR1cm4gdGhpcy5zWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgY29uZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zWyAwIF0gLyB0aGlzLnNbIE1hdGgubWluKCB0aGlzLm0sIHRoaXMubiApIC0gMSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHJhbmsoKSB7XG4gICAgLy8gY2hhbmdlZCB0byAyMyBmcm9tIDUyIChiaXRzIG9mIG1hbnRpc3NhKSwgc2luY2Ugd2UgYXJlIHVzaW5nIGZsb2F0cyBoZXJlIVxuICAgIGNvbnN0IGVwcyA9IE1hdGgucG93KCAyLjAsIC0yMy4wICk7XG4gICAgY29uc3QgdG9sID0gTWF0aC5tYXgoIHRoaXMubSwgdGhpcy5uICkgKiB0aGlzLnNbIDAgXSAqIGVwcztcbiAgICBsZXQgciA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLnNbIGkgXSA+IHRvbCApIHtcbiAgICAgICAgcisrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIHRoZSBNb29yZS1QZW5yb3NlIHBzZXVkb2ludmVyc2Ugb2YgdGhlIHNwZWNpZmllZCBtYXRyaXgsIHVzaW5nIHRoZSBTVkQgY29uc3RydWN0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Nb29yZSVFMiU4MCU5M1BlbnJvc2VfcHNldWRvaW52ZXJzZSBmb3IgZGV0YWlscy4gSGVscGZ1bCBmb3JcbiAgICogbGluZWFyIGxlYXN0LXNxdWFyZXMgcmVncmVzc2lvbi5cbiAgICpcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeCwgbSB4IG5cbiAgICogQHJldHVybnMge01hdHJpeH0gLSBuIHggbVxuICAgKi9cbiAgc3RhdGljIHBzZXVkb2ludmVyc2UoIG1hdHJpeCApIHtcbiAgICBjb25zdCBzdmQgPSBuZXcgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24oIG1hdHJpeCApO1xuICAgIGNvbnN0IHNpZ21hUHNldWRvaW52ZXJzZSA9IE1hdHJpeC5kaWFnb25hbE1hdHJpeCggc3ZkLmdldFNpbmd1bGFyVmFsdWVzKCkubWFwKCB2YWx1ZSA9PiB7XG4gICAgICBpZiAoIE1hdGguYWJzKCB2YWx1ZSApIDwgMWUtMzAwICkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gMSAvIHZhbHVlO1xuICAgICAgfVxuICAgIH0gKSApO1xuICAgIHJldHVybiBzdmQuZ2V0VigpLnRpbWVzKCBzaWdtYVBzZXVkb2ludmVyc2UgKS50aW1lcyggc3ZkLmdldFUoKS50cmFuc3Bvc2UoKSApO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1Npbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uJywgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24gKTtcblxuZXhwb3J0IGRlZmF1bHQgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb247Il0sIm5hbWVzIjpbImRvdCIsIk1hdHJpeCIsIkFycmF5VHlwZSIsIndpbmRvdyIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24iLCJnZXRVIiwibSIsIk1hdGgiLCJtaW4iLCJuIiwiVSIsImdldFYiLCJWIiwiZ2V0U2luZ3VsYXJWYWx1ZXMiLCJzIiwiZ2V0UyIsInJlc3VsdCIsImkiLCJqIiwiZW50cmllcyIsImluZGV4Iiwibm9ybTIiLCJjb25kIiwicmFuayIsImVwcyIsInBvdyIsInRvbCIsIm1heCIsInIiLCJsZW5ndGgiLCJwc2V1ZG9pbnZlcnNlIiwibWF0cml4Iiwic3ZkIiwic2lnbWFQc2V1ZG9pbnZlcnNlIiwiZGlhZ29uYWxNYXRyaXgiLCJtYXAiLCJ2YWx1ZSIsImFicyIsInRpbWVzIiwidHJhbnNwb3NlIiwiY29uc3RydWN0b3IiLCJBcmciLCJBIiwiZ2V0QXJyYXlDb3B5IiwiZ2V0Um93RGltZW5zaW9uIiwiZ2V0Q29sdW1uRGltZW5zaW9uIiwibnUiLCJlIiwid29yayIsIndhbnR1Iiwid2FudHYiLCJrIiwidCIsImYiLCJjcyIsInNuIiwiaHlwb3QiLCJuY3QiLCJucnQiLCJwIiwicHAiLCJpdGVyIiwidGlueSIsImthc2UiLCJrcyIsInNjYWxlIiwic3AiLCJzcG0xIiwiZXBtMSIsInNrIiwiZWsiLCJiIiwiYyIsInNoaWZ0Iiwic3FydCIsImciLCJFcnJvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUMzQixPQUFPQyxZQUFZLGNBQWM7QUFFakMsTUFBTUMsWUFBWUMsT0FBT0MsWUFBWSxJQUFJQztBQUV6QyxJQUFBLEFBQU1DLDZCQUFOLE1BQU1BO0lBOGNKOzs7O0dBSUMsR0FDREMsT0FBTztRQUNMLE9BQU8sSUFBSU4sT0FBUSxJQUFJLENBQUNPLENBQUMsRUFBRUMsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0YsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDRyxDQUFDLEdBQUksSUFBSSxDQUFDQyxDQUFDLEVBQUUsT0FBUSw4Q0FBOEM7SUFDM0g7SUFFQTs7OztHQUlDLEdBQ0RDLE9BQU87UUFDTCxPQUFPLElBQUlaLE9BQVEsSUFBSSxDQUFDVSxDQUFDLEVBQUUsSUFBSSxDQUFDQSxDQUFDLEVBQUUsSUFBSSxDQUFDRyxDQUFDLEVBQUU7SUFDN0M7SUFFQTs7OztHQUlDLEdBQ0RDLG9CQUFvQjtRQUNsQixPQUFPLElBQUksQ0FBQ0MsQ0FBQztJQUNmO0lBRUE7Ozs7R0FJQyxHQUNEQyxPQUFPO1FBQ0wsTUFBTUMsU0FBUyxJQUFJakIsT0FBUSxJQUFJLENBQUNVLENBQUMsRUFBRSxJQUFJLENBQUNBLENBQUM7UUFDekMsSUFBTSxJQUFJUSxJQUFJLEdBQUdBLElBQUksSUFBSSxDQUFDUixDQUFDLEVBQUVR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