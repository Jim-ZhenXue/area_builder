// Copyright 2013-2022, University of Colorado Boulder
/**
 * Eigensystem decomposition, based on Jama (http://math.nist.gov/javanumerics/jama/)
 *
 * Eigenvalues and eigenvectors of a real matrix.
 * <P>
 * If A is symmetric, then A = V*D*V' where the eigenvalue matrix D is
 * diagonal and the eigenvector matrix V is orthogonal.
 * I.e. A = V.times(D.times(V.transpose())) and
 * V.times(V.transpose()) equals the identity matrix.
 * <P>
 * If A is not symmetric, then the eigenvalue matrix D is block diagonal
 * with the real eigenvalues in 1-by-1 blocks and any complex eigenvalues,
 * lambda + i*mu, in 2-by-2 blocks, [lambda, mu; -mu, lambda].  The
 * columns of V represent the eigenvectors in the sense that A*V = V*D,
 * i.e. A.times(V) equals V.times(D).  The matrix V may be badly
 * conditioned, or even singular, so the validity of the equation
 * A = V*D*inverse(V) depends upon V.cond().
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Matrix from './Matrix.js';
const ArrayType = window.Float64Array || Array;
let EigenvalueDecomposition = class EigenvalueDecomposition {
    /**
   * Returns a square array of all eigenvectors arranged in a columnar format
   * @public
   * @returns {ArrayType.<number>} - a n*n matrix
   */ getV() {
        return this.V.copy();
    }
    /**
   * Returns an array that contains the real part of the eigenvalues
   * @public
   * @returns {ArrayType.<number>} - a one dimensional array
   */ getRealEigenvalues() {
        return this.d;
    }
    /**
   * Returns an array that contains the imaginary parts of the eigenvalues
   * @public
   * @returns {ArrayType.<number>} - a one dimensional array
   */ getImagEigenvalues() {
        return this.e;
    }
    /**
   * Return the block diagonal eigenvalue matrix
   * @public
   * @returns {Matrix} - a n * n matrix
   */ getD() {
        const n = this.n;
        const d = this.d;
        const e = this.e;
        const X = new Matrix(n, n);
        const D = X.entries;
        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                D[i * this.n + j] = 0.0;
            }
            D[i * this.n + i] = d[i];
            if (e[i] > 0) {
                D[i * this.n + i + 1] = e[i];
            } else if (e[i] < 0) {
                D[i * this.n + i - 1] = e[i];
            }
        }
        return X;
    }
    /**
   * Symmetric Householder reduction to tridiagonal form.
   * @private
   */ tred2() {
        const n = this.n;
        const V = this.V;
        const d = this.d;
        const e = this.e;
        let i;
        let j;
        let k;
        let f;
        let g;
        let h;
        //  This is derived from the Algol procedures tred2 by
        //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
        //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.
        for(j = 0; j < n; j++){
            d[j] = V[(n - 1) * n + j];
        }
        // Householder reduction to tridiagonal form.
        for(i = n - 1; i > 0; i--){
            // Scale to avoid under/overflow.
            let scale = 0.0;
            h = 0.0;
            for(k = 0; k < i; k++){
                scale = scale + Math.abs(d[k]);
            }
            if (scale === 0.0) {
                e[i] = d[i - 1];
                for(j = 0; j < i; j++){
                    d[j] = V[(i - 1) * n + j];
                    V[i * this.n + j] = 0.0;
                    V[j * this.n + i] = 0.0;
                }
            } else {
                // Generate Householder vector.
                for(k = 0; k < i; k++){
                    d[k] /= scale;
                    h += d[k] * d[k];
                }
                f = d[i - 1];
                g = Math.sqrt(h);
                if (f > 0) {
                    g = -g;
                }
                e[i] = scale * g;
                h = h - f * g;
                d[i - 1] = f - g;
                for(j = 0; j < i; j++){
                    e[j] = 0.0;
                }
                // Apply similarity transformation to remaining columns.
                for(j = 0; j < i; j++){
                    f = d[j];
                    V[j * this.n + i] = f;
                    g = e[j] + V[j * n + j] * f;
                    for(k = j + 1; k <= i - 1; k++){
                        g += V[k * n + j] * d[k];
                        e[k] += V[k * n + j] * f;
                    }
                    e[j] = g;
                }
                f = 0.0;
                for(j = 0; j < i; j++){
                    e[j] /= h;
                    f += e[j] * d[j];
                }
                const hh = f / (h + h);
                for(j = 0; j < i; j++){
                    e[j] -= hh * d[j];
                }
                for(j = 0; j < i; j++){
                    f = d[j];
                    g = e[j];
                    for(k = j; k <= i - 1; k++){
                        V[k * n + j] -= f * e[k] + g * d[k];
                    }
                    d[j] = V[(i - 1) * n + j];
                    V[i * this.n + j] = 0.0;
                }
            }
            d[i] = h;
        }
        // Accumulate transformations.
        for(i = 0; i < n - 1; i++){
            V[(n - 1) * n + i] = V[i * n + i];
            V[i * n + i] = 1.0;
            h = d[i + 1];
            if (h !== 0.0) {
                for(k = 0; k <= i; k++){
                    d[k] = V[k * n + (i + 1)] / h;
                }
                for(j = 0; j <= i; j++){
                    g = 0.0;
                    for(k = 0; k <= i; k++){
                        g += V[k * n + (i + 1)] * V[k * n + j];
                    }
                    for(k = 0; k <= i; k++){
                        V[k * n + j] -= g * d[k];
                    }
                }
            }
            for(k = 0; k <= i; k++){
                V[k * n + (i + 1)] = 0.0;
            }
        }
        for(j = 0; j < n; j++){
            d[j] = V[(n - 1) * n + j];
            V[(n - 1) * n + j] = 0.0;
        }
        V[(n - 1) * n + (n - 1)] = 1.0;
        e[0] = 0.0;
    }
    /**
   * Symmetric tridiagonal QL algorithm.
   * @private
   */ tql2() {
        const n = this.n;
        const V = this.V;
        const d = this.d;
        const e = this.e;
        let i;
        let j;
        let k;
        let l;
        let g;
        let p;
        let iter;
        //  This is derived from the Algol procedures tql2, by
        //  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
        //  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.
        for(i = 1; i < n; i++){
            e[i - 1] = e[i];
        }
        e[n - 1] = 0.0;
        let f = 0.0;
        let tst1 = 0.0;
        const eps = Math.pow(2.0, -52.0);
        for(l = 0; l < n; l++){
            // Find small subdiagonal element
            tst1 = Math.max(tst1, Math.abs(d[l]) + Math.abs(e[l]));
            let m = l;
            while(m < n){
                if (Math.abs(e[m]) <= eps * tst1) {
                    break;
                }
                m++;
            }
            // If m === l, d[l] is an eigenvalue,
            // otherwise, iterate.
            if (m > l) {
                iter = 0;
                do {
                    iter = iter + 1; // (Could check iteration count here.)
                    // Compute implicit shift
                    g = d[l];
                    p = (d[l + 1] - g) / (2.0 * e[l]);
                    let r = Matrix.hypot(p, 1.0);
                    if (p < 0) {
                        r = -r;
                    }
                    d[l] = e[l] / (p + r);
                    d[l + 1] = e[l] * (p + r);
                    const dl1 = d[l + 1];
                    let h = g - d[l];
                    for(i = l + 2; i < n; i++){
                        d[i] -= h;
                    }
                    f = f + h;
                    // Implicit QL transformation.
                    p = d[m];
                    let c = 1.0;
                    let c2 = c;
                    let c3 = c;
                    const el1 = e[l + 1];
                    let s = 0.0;
                    let s2 = 0.0;
                    for(i = m - 1; i >= l; i--){
                        c3 = c2;
                        c2 = c;
                        s2 = s;
                        g = c * e[i];
                        h = c * p;
                        r = Matrix.hypot(p, e[i]);
                        e[i + 1] = s * r;
                        s = e[i] / r;
                        c = p / r;
                        p = c * d[i] - s * g;
                        d[i + 1] = h + s * (c * g + s * d[i]);
                        // Accumulate transformation.
                        for(k = 0; k < n; k++){
                            h = V[k * n + (i + 1)];
                            V[k * n + (i + 1)] = s * V[k * n + i] + c * h;
                            V[k * n + i] = c * V[k * n + i] - s * h;
                        }
                    }
                    p = -s * s2 * c3 * el1 * e[l] / dl1;
                    e[l] = s * p;
                    d[l] = c * p;
                // Check for convergence.
                }while (Math.abs(e[l]) > eps * tst1)
            }
            d[l] = d[l] + f;
            e[l] = 0.0;
        }
        // Sort eigenvalues and corresponding vectors.
        for(i = 0; i < n - 1; i++){
            k = i;
            p = d[i];
            for(j = i + 1; j < n; j++){
                if (d[j] < p) {
                    k = j;
                    p = d[j];
                }
            }
            if (k !== i) {
                d[k] = d[i];
                d[i] = p;
                for(j = 0; j < n; j++){
                    p = V[j * this.n + i];
                    V[j * this.n + i] = V[j * n + k];
                    V[j * n + k] = p;
                }
            }
        }
    }
    /**
   *  Nonsymmetric reduction to Hessenberg form.
   *  @private
   */ orthes() {
        const n = this.n;
        const V = this.V;
        const H = this.H;
        const ort = this.ort;
        let i;
        let j;
        let m;
        let f;
        let g;
        //  This is derived from the Algol procedures orthes and ortran,
        //  by Martin and Wilkinson, Handbook for Auto. Comp.,
        //  Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutines in EISPACK.
        const low = 0;
        const high = n - 1;
        for(m = low + 1; m <= high - 1; m++){
            // Scale column.
            let scale = 0.0;
            for(i = m; i <= high; i++){
                scale = scale + Math.abs(H[i * n + (m - 1)]);
            }
            if (scale !== 0.0) {
                // Compute Householder transformation.
                let h = 0.0;
                for(i = high; i >= m; i--){
                    ort[i] = H[i * n + (m - 1)] / scale;
                    h += ort[i] * ort[i];
                }
                g = Math.sqrt(h);
                if (ort[m] > 0) {
                    g = -g;
                }
                h = h - ort[m] * g;
                ort[m] = ort[m] - g;
                // Apply Householder similarity transformation
                // H = (I-u*u'/h)*H*(I-u*u')/h)
                for(j = m; j < n; j++){
                    f = 0.0;
                    for(i = high; i >= m; i--){
                        f += ort[i] * H[i * this.n + j];
                    }
                    f = f / h;
                    for(i = m; i <= high; i++){
                        H[i * this.n + j] -= f * ort[i];
                    }
                }
                for(i = 0; i <= high; i++){
                    f = 0.0;
                    for(j = high; j >= m; j--){
                        f += ort[j] * H[i * this.n + j];
                    }
                    f = f / h;
                    for(j = m; j <= high; j++){
                        H[i * this.n + j] -= f * ort[j];
                    }
                }
                ort[m] = scale * ort[m];
                H[m * n + (m - 1)] = scale * g;
            }
        }
        // Accumulate transformations (Algol's ortran).
        for(i = 0; i < n; i++){
            for(j = 0; j < n; j++){
                V[i * this.n + j] = i === j ? 1.0 : 0.0;
            }
        }
        for(m = high - 1; m >= low + 1; m--){
            if (H[m * n + (m - 1)] !== 0.0) {
                for(i = m + 1; i <= high; i++){
                    ort[i] = H[i * n + (m - 1)];
                }
                for(j = m; j <= high; j++){
                    g = 0.0;
                    for(i = m; i <= high; i++){
                        g += ort[i] * V[i * this.n + j];
                    }
                    // Double division avoids possible underflow
                    g = g / ort[m] / H[m * n + (m - 1)];
                    for(i = m; i <= high; i++){
                        V[i * this.n + j] += g * ort[i];
                    }
                }
            }
        }
    }
    /**
   * Complex scalar division.
   * @private
   *
   * @param {*} xr
   * @param {*} xi
   * @param {*} yr
   * @param {*} yi
   */ cdiv(xr, xi, yr, yi) {
        let r;
        let d;
        if (Math.abs(yr) > Math.abs(yi)) {
            r = yi / yr;
            d = yr + r * yi;
            this.cdivr = (xr + r * xi) / d;
            this.cdivi = (xi - r * xr) / d;
        } else {
            r = yr / yi;
            d = yi + r * yr;
            this.cdivr = (r * xr + xi) / d;
            this.cdivi = (r * xi - xr) / d;
        }
    }
    /**
   * This methods finds the eigenvalues and eigenvectors
   * of a real upper hessenberg matrix by the QR algorithm
   *
   * Nonsymmetric reduction from Hessenberg to real Schur form.
   * https://en.wikipedia.org/wiki/QR_algorithm
   *
   * @private
   */ hqr2() {
        let n;
        const V = this.V;
        const d = this.d;
        const e = this.e;
        const H = this.H;
        let i;
        let j;
        let k;
        let l;
        let m;
        let iter;
        //  This is derived from the Algol procedure hqr2,
        //  by Martin and Wilkinson, Handbook for Auto. Comp.,
        //  Vol.ii-Linear Algebra, and the corresponding
        //  Fortran subroutine in EISPACK.
        // Initialize
        const nn = this.n;
        n = nn - 1;
        const low = 0;
        const high = nn - 1;
        const eps = Math.pow(2.0, -52.0);
        let exshift = 0.0;
        let p = 0;
        let q = 0;
        let r = 0;
        let s = 0;
        let z = 0;
        let t;
        let w;
        let x;
        let y;
        // Store roots isolated by balanc and compute matrix norm
        let norm = 0.0;
        for(i = 0; i < nn; i++){
            if (i < low || i > high) {
                d[i] = H[i * n + i];
                e[i] = 0.0;
            }
            for(j = Math.max(i - 1, 0); j < nn; j++){
                norm = norm + Math.abs(H[i * this.n + j]);
            }
        }
        // Outer loop over eigenvalue index
        iter = 0;
        while(n >= low){
            // Look for single small sub-diagonal element
            l = n;
            while(l > low){
                s = Math.abs(H[(l - 1) * n + (l - 1)]) + Math.abs(H[l * n + l]);
                if (s === 0.0) {
                    s = norm;
                }
                if (Math.abs(H[l * n + (l - 1)]) < eps * s) {
                    break;
                }
                l--;
            }
            // Check for convergence
            // One root found
            if (l === n) {
                H[n * n + n] = H[n * n + n] + exshift;
                d[n] = H[n * n + n];
                e[n] = 0.0;
                n--;
                iter = 0;
            // Two roots found
            } else if (l === n - 1) {
                w = H[n * n + n - 1] * H[(n - 1) * n + n];
                p = (H[(n - 1) * n + (n - 1)] - H[n * n + n]) / 2.0;
                q = p * p + w;
                z = Math.sqrt(Math.abs(q));
                H[n * n + n] = H[n * n + n] + exshift;
                H[(n - 1) * n + (n - 1)] = H[(n - 1) * n + (n - 1)] + exshift;
                x = H[n * n + n];
                // Real pair
                if (q >= 0) {
                    if (p >= 0) {
                        z = p + z;
                    } else {
                        z = p - z;
                    }
                    d[n - 1] = x + z;
                    d[n] = d[n - 1];
                    if (z !== 0.0) {
                        d[n] = x - w / z;
                    }
                    e[n - 1] = 0.0;
                    e[n] = 0.0;
                    x = H[n * n + n - 1];
                    s = Math.abs(x) + Math.abs(z);
                    p = x / s;
                    q = z / s;
                    r = Math.sqrt(p * p + q * q);
                    p = p / r;
                    q = q / r;
                    // Row modification
                    for(j = n - 1; j < nn; j++){
                        z = H[(n - 1) * n + j];
                        H[(n - 1) * n + j] = q * z + p * H[n * n + j];
                        H[n * n + j] = q * H[n * n + j] - p * z;
                    }
                    // Column modification
                    for(i = 0; i <= n; i++){
                        z = H[i * n + n - 1];
                        H[i * n + n - 1] = q * z + p * H[i * n + n];
                        H[i * n + n] = q * H[i * n + n] - p * z;
                    }
                    // Accumulate transformations
                    for(i = low; i <= high; i++){
                        z = V[i * n + n - 1];
                        V[i * n + n - 1] = q * z + p * V[i * n + n];
                        V[i * n + n] = q * V[i * n + n] - p * z;
                    }
                // Complex pair
                } else {
                    d[n - 1] = x + p;
                    d[n] = x + p;
                    e[n - 1] = z;
                    e[n] = -z;
                }
                n = n - 2;
                iter = 0;
            // No convergence yet
            } else {
                // Form shift
                x = H[n * n + n];
                y = 0.0;
                w = 0.0;
                if (l < n) {
                    y = H[(n - 1) * n + (n - 1)];
                    w = H[n * n + n - 1] * H[(n - 1) * n + n];
                }
                // Wilkinson's original ad hoc shift
                if (iter === 10) {
                    exshift += x;
                    for(i = low; i <= n; i++){
                        H[i * n + i] -= x;
                    }
                    s = Math.abs(H[n * n + n - 1]) + Math.abs(H[(n - 1) * n + n - 2]);
                    x = y = 0.75 * s;
                    w = -0.4375 * s * s;
                }
                // MATLAB's new ad hoc shift
                if (iter === 30) {
                    s = (y - x) / 2.0;
                    s = s * s + w;
                    if (s > 0) {
                        s = Math.sqrt(s);
                        if (y < x) {
                            s = -s;
                        }
                        s = x - w / ((y - x) / 2.0 + s);
                        for(i = low; i <= n; i++){
                            H[i * n + i] -= s;
                        }
                        exshift += s;
                        x = y = w = 0.964;
                    }
                }
                iter = iter + 1; // (Could check iteration count here.)
                // Look for two consecutive small sub-diagonal elements
                m = n - 2;
                while(m >= l){
                    z = H[m * n + m];
                    r = x - z;
                    s = y - z;
                    p = (r * s - w) / H[(m + 1) * n + m] + H[m * n + m + 1];
                    q = H[(m + 1) * n + m + 1] - z - r - s;
                    r = H[(m + 2) * n + m + 1];
                    s = Math.abs(p) + Math.abs(q) + Math.abs(r);
                    p = p / s;
                    q = q / s;
                    r = r / s;
                    if (m === l) {
                        break;
                    }
                    if (Math.abs(H[m * n + (m - 1)]) * (Math.abs(q) + Math.abs(r)) < eps * (Math.abs(p) * (Math.abs(H[(m - 1) * n + m - 1]) + Math.abs(z) + Math.abs(H[(m + 1) * n + m + 1])))) {
                        break;
                    }
                    m--;
                }
                for(i = m + 2; i <= n; i++){
                    H[i * n + i - 2] = 0.0;
                    if (i > m + 2) {
                        H[i * n + i - 3] = 0.0;
                    }
                }
                // Double QR step involving rows l:n and columns m:n
                for(k = m; k <= n - 1; k++){
                    const notlast = k !== n - 1;
                    if (k !== m) {
                        p = H[k * n + k - 1];
                        q = H[(k + 1) * n + k - 1];
                        r = notlast ? H[(k + 2) * n + k - 1] : 0.0;
                        x = Math.abs(p) + Math.abs(q) + Math.abs(r);
                        if (x !== 0.0) {
                            p = p / x;
                            q = q / x;
                            r = r / x;
                        }
                    }
                    if (x === 0.0) {
                        break;
                    }
                    s = Math.sqrt(p * p + q * q + r * r);
                    if (p < 0) {
                        s = -s;
                    }
                    if (s !== 0) {
                        if (k !== m) {
                            H[k * n + k - 1] = -s * x;
                        } else if (l !== m) {
                            H[k * n + k - 1] = -H[k * n + k - 1];
                        }
                        p = p + s;
                        x = p / s;
                        y = q / s;
                        z = r / s;
                        q = q / p;
                        r = r / p;
                        // Row modification
                        for(j = k; j < nn; j++){
                            p = H[k * n + j] + q * H[(k + 1) * n + j];
                            if (notlast) {
                                p = p + r * H[(k + 2) * n + j];
                                H[(k + 2) * n + j] = H[(k + 2) * n + j] - p * z;
                            }
                            H[k * n + j] = H[k * n + j] - p * x;
                            H[(k + 1) * n + j] = H[(k + 1) * n + j] - p * y;
                        }
                        // Column modification
                        for(i = 0; i <= Math.min(n, k + 3); i++){
                            p = x * H[i * n + k] + y * H[i * n + k + 1];
                            if (notlast) {
                                p = p + z * H[i * n + k + 2];
                                H[i * n + k + 2] = H[i * n + k + 2] - p * r;
                            }
                            H[i * n + k] = H[i * n + k] - p;
                            H[i * n + k + 1] = H[i * n + k + 1] - p * q;
                        }
                        // Accumulate transformations
                        for(i = low; i <= high; i++){
                            p = x * V[i * n + k] + y * V[i * n + k + 1];
                            if (notlast) {
                                p = p + z * V[i * n + k + 2];
                                V[i * n + k + 2] = V[i * n + k + 2] - p * r;
                            }
                            V[i * n + k] = V[i * n + k] - p;
                            V[i * n + k + 1] = V[i * n + k + 1] - p * q;
                        }
                    } // (s !== 0)
                } // k loop
            } // check convergence
        } // while (n >= low)
        // Backsubstitute to find vectors of upper triangular form
        if (norm === 0.0) {
            return;
        }
        for(n = nn - 1; n >= 0; n--){
            p = d[n];
            q = e[n];
            // Real vector
            if (q === 0) {
                l = n;
                H[n * n + n] = 1.0;
                for(i = n - 1; i >= 0; i--){
                    w = H[i * n + i] - p;
                    r = 0.0;
                    for(j = l; j <= n; j++){
                        r = r + H[i * this.n + j] * H[j * n + n];
                    }
                    if (e[i] < 0.0) {
                        z = w;
                        s = r;
                    } else {
                        l = i;
                        if (e[i] === 0.0) {
                            if (w !== 0.0) {
                                H[i * n + n] = -r / w;
                            } else {
                                H[i * n + n] = -r / (eps * norm);
                            }
                        // Solve real equations
                        } else {
                            x = H[i * n + i + 1];
                            y = H[(i + 1) * n + i];
                            q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
                            t = (x * s - z * r) / q;
                            H[i * n + n] = t;
                            if (Math.abs(x) > Math.abs(z)) {
                                H[(i + 1) * n + n] = (-r - w * t) / x;
                            } else {
                                H[(i + 1) * n + n] = (-s - y * t) / z;
                            }
                        }
                        // Overflow control
                        t = Math.abs(H[i * n + n]);
                        if (eps * t * t > 1) {
                            for(j = i; j <= n; j++){
                                H[j * n + n] = H[j * n + n] / t;
                            }
                        }
                    }
                }
            // Complex vector
            } else if (q < 0) {
                l = n - 1;
                // Last vector component imaginary so matrix is triangular
                if (Math.abs(H[n * n + n - 1]) > Math.abs(H[(n - 1) * n + n])) {
                    H[(n - 1) * n + (n - 1)] = q / H[n * n + n - 1];
                    H[(n - 1) * n + n] = -(H[n * n + n] - p) / H[n * n + n - 1];
                } else {
                    this.cdiv(0.0, -H[(n - 1) * n + n], H[(n - 1) * n + (n - 1)] - p, q);
                    H[(n - 1) * n + (n - 1)] = this.cdivr;
                    H[(n - 1) * n + n] = this.cdivi;
                }
                H[n * n + n - 1] = 0.0;
                H[n * n + n] = 1.0;
                for(i = n - 2; i >= 0; i--){
                    let ra;
                    let sa;
                    let vr;
                    let vi;
                    ra = 0.0;
                    sa = 0.0;
                    for(j = l; j <= n; j++){
                        ra = ra + H[i * this.n + j] * H[j * n + n - 1];
                        sa = sa + H[i * this.n + j] * H[j * n + n];
                    }
                    w = H[i * n + i] - p;
                    if (e[i] < 0.0) {
                        z = w;
                        r = ra;
                        s = sa;
                    } else {
                        l = i;
                        if (e[i] === 0) {
                            this.cdiv(-ra, -sa, w, q);
                            H[i * n + n - 1] = this.cdivr;
                            H[i * n + n] = this.cdivi;
                        } else {
                            // Solve complex equations
                            x = H[i * n + i + 1];
                            y = H[(i + 1) * n + i];
                            vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
                            vi = (d[i] - p) * 2.0 * q;
                            if (vr === 0.0 && vi === 0.0) {
                                vr = eps * norm * (Math.abs(w) + Math.abs(q) + Math.abs(x) + Math.abs(y) + Math.abs(z));
                            }
                            this.cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
                            H[i * n + n - 1] = this.cdivr;
                            H[i * n + n] = this.cdivi;
                            if (Math.abs(x) > Math.abs(z) + Math.abs(q)) {
                                H[(i + 1) * n + n - 1] = (-ra - w * H[i * n + n - 1] + q * H[i * n + n]) / x;
                                H[(i + 1) * n + n] = (-sa - w * H[i * n + n] - q * H[i * n + n - 1]) / x;
                            } else {
                                this.cdiv(-r - y * H[i * n + n - 1], -s - y * H[i * n + n], z, q);
                                H[(i + 1) * n + n - 1] = this.cdivr;
                                H[(i + 1) * n + n] = this.cdivi;
                            }
                        }
                        // Overflow control
                        t = Math.max(Math.abs(H[i * n + n - 1]), Math.abs(H[i * n + n]));
                        if (eps * t * t > 1) {
                            for(j = i; j <= n; j++){
                                H[j * n + n - 1] = H[j * n + n - 1] / t;
                                H[j * n + n] = H[j * n + n] / t;
                            }
                        }
                    }
                }
            }
        }
        // Vectors of isolated roots
        for(i = 0; i < nn; i++){
            if (i < low || i > high) {
                for(j = i; j < nn; j++){
                    V[i * this.n + j] = H[i * this.n + j];
                }
            }
        }
        // Back transformation to get eigenvectors of original matrix
        for(j = nn - 1; j >= low; j--){
            for(i = low; i <= high; i++){
                z = 0.0;
                for(k = low; k <= Math.min(j, high); k++){
                    z = z + V[i * n + k] * H[k * n + j];
                }
                V[i * this.n + j] = z;
            }
        }
    }
    /**
   * @param {Matrix} matrix - must be a square matrix
   */ constructor(matrix){
        let i;
        let j;
        const A = matrix.entries;
        this.n = matrix.getColumnDimension(); // @private  Row and column dimension (square matrix).
        const n = this.n;
        this.V = new ArrayType(n * n); // @private Array for internal storage of eigenvectors.
        // Arrays for internal storage of eigenvalues.
        this.d = new ArrayType(n); // @private
        this.e = new ArrayType(n); // @private
        this.issymmetric = true;
        for(j = 0; j < n && this.issymmetric; j++){
            for(i = 0; i < n && this.issymmetric; i++){
                this.issymmetric = A[i * this.n + j] === A[j * this.n + i];
            }
        }
        if (this.issymmetric) {
            for(i = 0; i < n; i++){
                for(j = 0; j < n; j++){
                    this.V[i * this.n + j] = A[i * this.n + j];
                }
            }
            // Tridiagonalize.
            this.tred2();
            // Diagonalize.
            this.tql2();
        } else {
            this.H = new ArrayType(n * n); // Array for internal storage of nonsymmetric Hessenberg form.
            this.ort = new ArrayType(n); // // Working storage for nonsymmetric algorithm.
            for(j = 0; j < n; j++){
                for(i = 0; i < n; i++){
                    this.H[i * this.n + j] = A[i * this.n + j];
                }
            }
            // Reduce to Hessenberg form.
            this.orthes();
            // Reduce Hessenberg to real Schur form.
            this.hqr2();
        }
    }
};
dot.register('EigenvalueDecomposition', EigenvalueDecomposition);
export default EigenvalueDecomposition;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9FaWdlbnZhbHVlRGVjb21wb3NpdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBFaWdlbnN5c3RlbSBkZWNvbXBvc2l0aW9uLCBiYXNlZCBvbiBKYW1hIChodHRwOi8vbWF0aC5uaXN0Lmdvdi9qYXZhbnVtZXJpY3MvamFtYS8pXG4gKlxuICogRWlnZW52YWx1ZXMgYW5kIGVpZ2VudmVjdG9ycyBvZiBhIHJlYWwgbWF0cml4LlxuICogPFA+XG4gKiBJZiBBIGlzIHN5bW1ldHJpYywgdGhlbiBBID0gVipEKlYnIHdoZXJlIHRoZSBlaWdlbnZhbHVlIG1hdHJpeCBEIGlzXG4gKiBkaWFnb25hbCBhbmQgdGhlIGVpZ2VudmVjdG9yIG1hdHJpeCBWIGlzIG9ydGhvZ29uYWwuXG4gKiBJLmUuIEEgPSBWLnRpbWVzKEQudGltZXMoVi50cmFuc3Bvc2UoKSkpIGFuZFxuICogVi50aW1lcyhWLnRyYW5zcG9zZSgpKSBlcXVhbHMgdGhlIGlkZW50aXR5IG1hdHJpeC5cbiAqIDxQPlxuICogSWYgQSBpcyBub3Qgc3ltbWV0cmljLCB0aGVuIHRoZSBlaWdlbnZhbHVlIG1hdHJpeCBEIGlzIGJsb2NrIGRpYWdvbmFsXG4gKiB3aXRoIHRoZSByZWFsIGVpZ2VudmFsdWVzIGluIDEtYnktMSBibG9ja3MgYW5kIGFueSBjb21wbGV4IGVpZ2VudmFsdWVzLFxuICogbGFtYmRhICsgaSptdSwgaW4gMi1ieS0yIGJsb2NrcywgW2xhbWJkYSwgbXU7IC1tdSwgbGFtYmRhXS4gIFRoZVxuICogY29sdW1ucyBvZiBWIHJlcHJlc2VudCB0aGUgZWlnZW52ZWN0b3JzIGluIHRoZSBzZW5zZSB0aGF0IEEqViA9IFYqRCxcbiAqIGkuZS4gQS50aW1lcyhWKSBlcXVhbHMgVi50aW1lcyhEKS4gIFRoZSBtYXRyaXggViBtYXkgYmUgYmFkbHlcbiAqIGNvbmRpdGlvbmVkLCBvciBldmVuIHNpbmd1bGFyLCBzbyB0aGUgdmFsaWRpdHkgb2YgdGhlIGVxdWF0aW9uXG4gKiBBID0gVipEKmludmVyc2UoVikgZGVwZW5kcyB1cG9uIFYuY29uZCgpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnO1xuXG5jb25zdCBBcnJheVR5cGUgPSB3aW5kb3cuRmxvYXQ2NEFycmF5IHx8IEFycmF5O1xuXG5jbGFzcyBFaWdlbnZhbHVlRGVjb21wb3NpdGlvbiB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4IC0gbXVzdCBiZSBhIHNxdWFyZSBtYXRyaXhcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBtYXRyaXggKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG5cbiAgICBjb25zdCBBID0gbWF0cml4LmVudHJpZXM7XG4gICAgdGhpcy5uID0gbWF0cml4LmdldENvbHVtbkRpbWVuc2lvbigpOyAvLyBAcHJpdmF0ZSAgUm93IGFuZCBjb2x1bW4gZGltZW5zaW9uIChzcXVhcmUgbWF0cml4KS5cbiAgICBjb25zdCBuID0gdGhpcy5uO1xuICAgIHRoaXMuViA9IG5ldyBBcnJheVR5cGUoIG4gKiBuICk7IC8vIEBwcml2YXRlIEFycmF5IGZvciBpbnRlcm5hbCBzdG9yYWdlIG9mIGVpZ2VudmVjdG9ycy5cblxuICAgIC8vIEFycmF5cyBmb3IgaW50ZXJuYWwgc3RvcmFnZSBvZiBlaWdlbnZhbHVlcy5cbiAgICB0aGlzLmQgPSBuZXcgQXJyYXlUeXBlKCBuICk7IC8vIEBwcml2YXRlXG4gICAgdGhpcy5lID0gbmV3IEFycmF5VHlwZSggbiApOyAvLyBAcHJpdmF0ZVxuXG4gICAgdGhpcy5pc3N5bW1ldHJpYyA9IHRydWU7XG4gICAgZm9yICggaiA9IDA7ICggaiA8IG4gKSAmJiB0aGlzLmlzc3ltbWV0cmljOyBqKysgKSB7XG4gICAgICBmb3IgKCBpID0gMDsgKCBpIDwgbiApICYmIHRoaXMuaXNzeW1tZXRyaWM7IGkrKyApIHtcbiAgICAgICAgdGhpcy5pc3N5bW1ldHJpYyA9ICggQVsgaSAqIHRoaXMubiArIGogXSA9PT0gQVsgaiAqIHRoaXMubiArIGkgXSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy5pc3N5bW1ldHJpYyApIHtcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IG47IGorKyApIHtcbiAgICAgICAgICB0aGlzLlZbIGkgKiB0aGlzLm4gKyBqIF0gPSBBWyBpICogdGhpcy5uICsgaiBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWRpYWdvbmFsaXplLlxuICAgICAgdGhpcy50cmVkMigpO1xuXG4gICAgICAvLyBEaWFnb25hbGl6ZS5cbiAgICAgIHRoaXMudHFsMigpO1xuXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5IID0gbmV3IEFycmF5VHlwZSggbiAqIG4gKTsgLy8gQXJyYXkgZm9yIGludGVybmFsIHN0b3JhZ2Ugb2Ygbm9uc3ltbWV0cmljIEhlc3NlbmJlcmcgZm9ybS5cbiAgICAgIHRoaXMub3J0ID0gbmV3IEFycmF5VHlwZSggbiApOyAvLyAvLyBXb3JraW5nIHN0b3JhZ2UgZm9yIG5vbnN5bW1ldHJpYyBhbGdvcml0aG0uXG5cbiAgICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG47IGkrKyApIHtcbiAgICAgICAgICB0aGlzLkhbIGkgKiB0aGlzLm4gKyBqIF0gPSBBWyBpICogdGhpcy5uICsgaiBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlZHVjZSB0byBIZXNzZW5iZXJnIGZvcm0uXG4gICAgICB0aGlzLm9ydGhlcygpO1xuXG4gICAgICAvLyBSZWR1Y2UgSGVzc2VuYmVyZyB0byByZWFsIFNjaHVyIGZvcm0uXG4gICAgICB0aGlzLmhxcjIoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3F1YXJlIGFycmF5IG9mIGFsbCBlaWdlbnZlY3RvcnMgYXJyYW5nZWQgaW4gYSBjb2x1bW5hciBmb3JtYXRcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7QXJyYXlUeXBlLjxudW1iZXI+fSAtIGEgbipuIG1hdHJpeFxuICAgKi9cbiAgZ2V0VigpIHtcbiAgICByZXR1cm4gdGhpcy5WLmNvcHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHJlYWwgcGFydCBvZiB0aGUgZWlnZW52YWx1ZXNcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7QXJyYXlUeXBlLjxudW1iZXI+fSAtIGEgb25lIGRpbWVuc2lvbmFsIGFycmF5XG4gICAqL1xuICBnZXRSZWFsRWlnZW52YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIGltYWdpbmFyeSBwYXJ0cyBvZiB0aGUgZWlnZW52YWx1ZXNcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7QXJyYXlUeXBlLjxudW1iZXI+fSAtIGEgb25lIGRpbWVuc2lvbmFsIGFycmF5XG4gICAqL1xuICBnZXRJbWFnRWlnZW52YWx1ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGJsb2NrIGRpYWdvbmFsIGVpZ2VudmFsdWUgbWF0cml4XG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge01hdHJpeH0gLSBhIG4gKiBuIG1hdHJpeFxuICAgKi9cbiAgZ2V0RCgpIHtcbiAgICBjb25zdCBuID0gdGhpcy5uO1xuICAgIGNvbnN0IGQgPSB0aGlzLmQ7XG4gICAgY29uc3QgZSA9IHRoaXMuZTtcblxuICAgIGNvbnN0IFggPSBuZXcgTWF0cml4KCBuLCBuICk7XG4gICAgY29uc3QgRCA9IFguZW50cmllcztcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBuOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBuOyBqKysgKSB7XG4gICAgICAgIERbIGkgKiB0aGlzLm4gKyBqIF0gPSAwLjA7XG4gICAgICB9XG4gICAgICBEWyBpICogdGhpcy5uICsgaSBdID0gZFsgaSBdO1xuICAgICAgaWYgKCBlWyBpIF0gPiAwICkge1xuICAgICAgICBEWyBpICogdGhpcy5uICsgaSArIDEgXSA9IGVbIGkgXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBlWyBpIF0gPCAwICkge1xuICAgICAgICBEWyBpICogdGhpcy5uICsgaSAtIDEgXSA9IGVbIGkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFg7XG4gIH1cblxuICAvKipcbiAgICogU3ltbWV0cmljIEhvdXNlaG9sZGVyIHJlZHVjdGlvbiB0byB0cmlkaWFnb25hbCBmb3JtLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdHJlZDIoKSB7XG4gICAgY29uc3QgbiA9IHRoaXMubjtcbiAgICBjb25zdCBWID0gdGhpcy5WO1xuICAgIGNvbnN0IGQgPSB0aGlzLmQ7XG4gICAgY29uc3QgZSA9IHRoaXMuZTtcbiAgICBsZXQgaTtcbiAgICBsZXQgajtcbiAgICBsZXQgaztcbiAgICBsZXQgZjtcbiAgICBsZXQgZztcbiAgICBsZXQgaDtcblxuICAgIC8vICBUaGlzIGlzIGRlcml2ZWQgZnJvbSB0aGUgQWxnb2wgcHJvY2VkdXJlcyB0cmVkMiBieVxuICAgIC8vICBCb3dkbGVyLCBNYXJ0aW4sIFJlaW5zY2gsIGFuZCBXaWxraW5zb24sIEhhbmRib29rIGZvclxuICAgIC8vICBBdXRvLiBDb21wLiwgVm9sLmlpLUxpbmVhciBBbGdlYnJhLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAvLyAgRm9ydHJhbiBzdWJyb3V0aW5lIGluIEVJU1BBQ0suXG5cbiAgICBmb3IgKCBqID0gMDsgaiA8IG47IGorKyApIHtcbiAgICAgIGRbIGogXSA9IFZbICggbiAtIDEgKSAqIG4gKyBqIF07XG4gICAgfVxuXG4gICAgLy8gSG91c2Vob2xkZXIgcmVkdWN0aW9uIHRvIHRyaWRpYWdvbmFsIGZvcm0uXG5cbiAgICBmb3IgKCBpID0gbiAtIDE7IGkgPiAwOyBpLS0gKSB7XG5cbiAgICAgIC8vIFNjYWxlIHRvIGF2b2lkIHVuZGVyL292ZXJmbG93LlxuXG4gICAgICBsZXQgc2NhbGUgPSAwLjA7XG4gICAgICBoID0gMC4wO1xuICAgICAgZm9yICggayA9IDA7IGsgPCBpOyBrKysgKSB7XG4gICAgICAgIHNjYWxlID0gc2NhbGUgKyBNYXRoLmFicyggZFsgayBdICk7XG4gICAgICB9XG4gICAgICBpZiAoIHNjYWxlID09PSAwLjAgKSB7XG4gICAgICAgIGVbIGkgXSA9IGRbIGkgLSAxIF07XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xuICAgICAgICAgIGRbIGogXSA9IFZbICggaSAtIDEgKSAqIG4gKyBqIF07XG4gICAgICAgICAgVlsgaSAqIHRoaXMubiArIGogXSA9IDAuMDtcbiAgICAgICAgICBWWyBqICogdGhpcy5uICsgaSBdID0gMC4wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBHZW5lcmF0ZSBIb3VzZWhvbGRlciB2ZWN0b3IuXG5cbiAgICAgICAgZm9yICggayA9IDA7IGsgPCBpOyBrKysgKSB7XG4gICAgICAgICAgZFsgayBdIC89IHNjYWxlO1xuICAgICAgICAgIGggKz0gZFsgayBdICogZFsgayBdO1xuICAgICAgICB9XG4gICAgICAgIGYgPSBkWyBpIC0gMSBdO1xuICAgICAgICBnID0gTWF0aC5zcXJ0KCBoICk7XG4gICAgICAgIGlmICggZiA+IDAgKSB7XG4gICAgICAgICAgZyA9IC1nO1xuICAgICAgICB9XG4gICAgICAgIGVbIGkgXSA9IHNjYWxlICogZztcbiAgICAgICAgaCA9IGggLSBmICogZztcbiAgICAgICAgZFsgaSAtIDEgXSA9IGYgLSBnO1xuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGk7IGorKyApIHtcbiAgICAgICAgICBlWyBqIF0gPSAwLjA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcHBseSBzaW1pbGFyaXR5IHRyYW5zZm9ybWF0aW9uIHRvIHJlbWFpbmluZyBjb2x1bW5zLlxuXG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xuICAgICAgICAgIGYgPSBkWyBqIF07XG4gICAgICAgICAgVlsgaiAqIHRoaXMubiArIGkgXSA9IGY7XG4gICAgICAgICAgZyA9IGVbIGogXSArIFZbIGogKiBuICsgaiBdICogZjtcbiAgICAgICAgICBmb3IgKCBrID0gaiArIDE7IGsgPD0gaSAtIDE7IGsrKyApIHtcbiAgICAgICAgICAgIGcgKz0gVlsgayAqIG4gKyBqIF0gKiBkWyBrIF07XG4gICAgICAgICAgICBlWyBrIF0gKz0gVlsgayAqIG4gKyBqIF0gKiBmO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlWyBqIF0gPSBnO1xuICAgICAgICB9XG4gICAgICAgIGYgPSAwLjA7XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xuICAgICAgICAgIGVbIGogXSAvPSBoO1xuICAgICAgICAgIGYgKz0gZVsgaiBdICogZFsgaiBdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhoID0gZiAvICggaCArIGggKTtcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBpOyBqKysgKSB7XG4gICAgICAgICAgZVsgaiBdIC09IGhoICogZFsgaiBdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgaTsgaisrICkge1xuICAgICAgICAgIGYgPSBkWyBqIF07XG4gICAgICAgICAgZyA9IGVbIGogXTtcbiAgICAgICAgICBmb3IgKCBrID0gajsgayA8PSBpIC0gMTsgaysrICkge1xuICAgICAgICAgICAgVlsgayAqIG4gKyBqIF0gLT0gKCBmICogZVsgayBdICsgZyAqIGRbIGsgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkWyBqIF0gPSBWWyAoIGkgLSAxICkgKiBuICsgaiBdO1xuICAgICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gPSAwLjA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRbIGkgXSA9IGg7XG4gICAgfVxuXG4gICAgLy8gQWNjdW11bGF0ZSB0cmFuc2Zvcm1hdGlvbnMuXG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IG4gLSAxOyBpKysgKSB7XG4gICAgICBWWyAoIG4gLSAxICkgKiBuICsgaSBdID0gVlsgaSAqIG4gKyBpIF07XG4gICAgICBWWyBpICogbiArIGkgXSA9IDEuMDtcbiAgICAgIGggPSBkWyBpICsgMSBdO1xuICAgICAgaWYgKCBoICE9PSAwLjAgKSB7XG4gICAgICAgIGZvciAoIGsgPSAwOyBrIDw9IGk7IGsrKyApIHtcbiAgICAgICAgICBkWyBrIF0gPSBWWyBrICogbiArICggaSArIDEgKSBdIC8gaDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKCBqID0gMDsgaiA8PSBpOyBqKysgKSB7XG4gICAgICAgICAgZyA9IDAuMDtcbiAgICAgICAgICBmb3IgKCBrID0gMDsgayA8PSBpOyBrKysgKSB7XG4gICAgICAgICAgICBnICs9IFZbIGsgKiBuICsgKCBpICsgMSApIF0gKiBWWyBrICogbiArIGogXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICggayA9IDA7IGsgPD0gaTsgaysrICkge1xuICAgICAgICAgICAgVlsgayAqIG4gKyBqIF0gLT0gZyAqIGRbIGsgXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoIGsgPSAwOyBrIDw9IGk7IGsrKyApIHtcbiAgICAgICAgVlsgayAqIG4gKyAoIGkgKyAxICkgXSA9IDAuMDtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICggaiA9IDA7IGogPCBuOyBqKysgKSB7XG4gICAgICBkWyBqIF0gPSBWWyAoIG4gLSAxICkgKiBuICsgaiBdO1xuICAgICAgVlsgKCBuIC0gMSApICogbiArIGogXSA9IDAuMDtcbiAgICB9XG4gICAgVlsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdID0gMS4wO1xuICAgIGVbIDAgXSA9IDAuMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW1tZXRyaWMgdHJpZGlhZ29uYWwgUUwgYWxnb3JpdGhtLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdHFsMigpIHtcbiAgICBjb25zdCBuID0gdGhpcy5uO1xuICAgIGNvbnN0IFYgPSB0aGlzLlY7XG4gICAgY29uc3QgZCA9IHRoaXMuZDtcbiAgICBjb25zdCBlID0gdGhpcy5lO1xuICAgIGxldCBpO1xuICAgIGxldCBqO1xuICAgIGxldCBrO1xuICAgIGxldCBsO1xuICAgIGxldCBnO1xuICAgIGxldCBwO1xuICAgIGxldCBpdGVyO1xuXG4gICAgLy8gIFRoaXMgaXMgZGVyaXZlZCBmcm9tIHRoZSBBbGdvbCBwcm9jZWR1cmVzIHRxbDIsIGJ5XG4gICAgLy8gIEJvd2RsZXIsIE1hcnRpbiwgUmVpbnNjaCwgYW5kIFdpbGtpbnNvbiwgSGFuZGJvb2sgZm9yXG4gICAgLy8gIEF1dG8uIENvbXAuLCBWb2wuaWktTGluZWFyIEFsZ2VicmEsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xuICAgIC8vICBGb3J0cmFuIHN1YnJvdXRpbmUgaW4gRUlTUEFDSy5cblxuICAgIGZvciAoIGkgPSAxOyBpIDwgbjsgaSsrICkge1xuICAgICAgZVsgaSAtIDEgXSA9IGVbIGkgXTtcbiAgICB9XG4gICAgZVsgbiAtIDEgXSA9IDAuMDtcblxuICAgIGxldCBmID0gMC4wO1xuICAgIGxldCB0c3QxID0gMC4wO1xuICAgIGNvbnN0IGVwcyA9IE1hdGgucG93KCAyLjAsIC01Mi4wICk7XG4gICAgZm9yICggbCA9IDA7IGwgPCBuOyBsKysgKSB7XG5cbiAgICAgIC8vIEZpbmQgc21hbGwgc3ViZGlhZ29uYWwgZWxlbWVudFxuXG4gICAgICB0c3QxID0gTWF0aC5tYXgoIHRzdDEsIE1hdGguYWJzKCBkWyBsIF0gKSArIE1hdGguYWJzKCBlWyBsIF0gKSApO1xuICAgICAgbGV0IG0gPSBsO1xuICAgICAgd2hpbGUgKCBtIDwgbiApIHtcbiAgICAgICAgaWYgKCBNYXRoLmFicyggZVsgbSBdICkgPD0gZXBzICogdHN0MSApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtKys7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG0gPT09IGwsIGRbbF0gaXMgYW4gZWlnZW52YWx1ZSxcbiAgICAgIC8vIG90aGVyd2lzZSwgaXRlcmF0ZS5cblxuICAgICAgaWYgKCBtID4gbCApIHtcbiAgICAgICAgaXRlciA9IDA7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBpdGVyID0gaXRlciArIDE7ICAvLyAoQ291bGQgY2hlY2sgaXRlcmF0aW9uIGNvdW50IGhlcmUuKVxuXG4gICAgICAgICAgLy8gQ29tcHV0ZSBpbXBsaWNpdCBzaGlmdFxuXG4gICAgICAgICAgZyA9IGRbIGwgXTtcbiAgICAgICAgICBwID0gKCBkWyBsICsgMSBdIC0gZyApIC8gKCAyLjAgKiBlWyBsIF0gKTtcbiAgICAgICAgICBsZXQgciA9IE1hdHJpeC5oeXBvdCggcCwgMS4wICk7XG4gICAgICAgICAgaWYgKCBwIDwgMCApIHtcbiAgICAgICAgICAgIHIgPSAtcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZFsgbCBdID0gZVsgbCBdIC8gKCBwICsgciApO1xuICAgICAgICAgIGRbIGwgKyAxIF0gPSBlWyBsIF0gKiAoIHAgKyByICk7XG4gICAgICAgICAgY29uc3QgZGwxID0gZFsgbCArIDEgXTtcbiAgICAgICAgICBsZXQgaCA9IGcgLSBkWyBsIF07XG4gICAgICAgICAgZm9yICggaSA9IGwgKyAyOyBpIDwgbjsgaSsrICkge1xuICAgICAgICAgICAgZFsgaSBdIC09IGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGYgPSBmICsgaDtcblxuICAgICAgICAgIC8vIEltcGxpY2l0IFFMIHRyYW5zZm9ybWF0aW9uLlxuXG4gICAgICAgICAgcCA9IGRbIG0gXTtcbiAgICAgICAgICBsZXQgYyA9IDEuMDtcbiAgICAgICAgICBsZXQgYzIgPSBjO1xuICAgICAgICAgIGxldCBjMyA9IGM7XG4gICAgICAgICAgY29uc3QgZWwxID0gZVsgbCArIDEgXTtcbiAgICAgICAgICBsZXQgcyA9IDAuMDtcbiAgICAgICAgICBsZXQgczIgPSAwLjA7XG4gICAgICAgICAgZm9yICggaSA9IG0gLSAxOyBpID49IGw7IGktLSApIHtcbiAgICAgICAgICAgIGMzID0gYzI7XG4gICAgICAgICAgICBjMiA9IGM7XG4gICAgICAgICAgICBzMiA9IHM7XG4gICAgICAgICAgICBnID0gYyAqIGVbIGkgXTtcbiAgICAgICAgICAgIGggPSBjICogcDtcbiAgICAgICAgICAgIHIgPSBNYXRyaXguaHlwb3QoIHAsIGVbIGkgXSApO1xuICAgICAgICAgICAgZVsgaSArIDEgXSA9IHMgKiByO1xuICAgICAgICAgICAgcyA9IGVbIGkgXSAvIHI7XG4gICAgICAgICAgICBjID0gcCAvIHI7XG4gICAgICAgICAgICBwID0gYyAqIGRbIGkgXSAtIHMgKiBnO1xuICAgICAgICAgICAgZFsgaSArIDEgXSA9IGggKyBzICogKCBjICogZyArIHMgKiBkWyBpIF0gKTtcblxuICAgICAgICAgICAgLy8gQWNjdW11bGF0ZSB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICAgICAgZm9yICggayA9IDA7IGsgPCBuOyBrKysgKSB7XG4gICAgICAgICAgICAgIGggPSBWWyBrICogbiArICggaSArIDEgKSBdO1xuICAgICAgICAgICAgICBWWyBrICogbiArICggaSArIDEgKSBdID0gcyAqIFZbIGsgKiBuICsgaSBdICsgYyAqIGg7XG4gICAgICAgICAgICAgIFZbIGsgKiBuICsgaSBdID0gYyAqIFZbIGsgKiBuICsgaSBdIC0gcyAqIGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHAgPSAtcyAqIHMyICogYzMgKiBlbDEgKiBlWyBsIF0gLyBkbDE7XG4gICAgICAgICAgZVsgbCBdID0gcyAqIHA7XG4gICAgICAgICAgZFsgbCBdID0gYyAqIHA7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgY29udmVyZ2VuY2UuXG5cbiAgICAgICAgfSB3aGlsZSAoIE1hdGguYWJzKCBlWyBsIF0gKSA+IGVwcyAqIHRzdDEgKTtcbiAgICAgIH1cbiAgICAgIGRbIGwgXSA9IGRbIGwgXSArIGY7XG4gICAgICBlWyBsIF0gPSAwLjA7XG4gICAgfVxuXG4gICAgLy8gU29ydCBlaWdlbnZhbHVlcyBhbmQgY29ycmVzcG9uZGluZyB2ZWN0b3JzLlxuXG4gICAgZm9yICggaSA9IDA7IGkgPCBuIC0gMTsgaSsrICkge1xuICAgICAgayA9IGk7XG4gICAgICBwID0gZFsgaSBdO1xuICAgICAgZm9yICggaiA9IGkgKyAxOyBqIDwgbjsgaisrICkge1xuICAgICAgICBpZiAoIGRbIGogXSA8IHAgKSB7XG4gICAgICAgICAgayA9IGo7XG4gICAgICAgICAgcCA9IGRbIGogXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCBrICE9PSBpICkge1xuICAgICAgICBkWyBrIF0gPSBkWyBpIF07XG4gICAgICAgIGRbIGkgXSA9IHA7XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xuICAgICAgICAgIHAgPSBWWyBqICogdGhpcy5uICsgaSBdO1xuICAgICAgICAgIFZbIGogKiB0aGlzLm4gKyBpIF0gPSBWWyBqICogbiArIGsgXTtcbiAgICAgICAgICBWWyBqICogbiArIGsgXSA9IHA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogIE5vbnN5bW1ldHJpYyByZWR1Y3Rpb24gdG8gSGVzc2VuYmVyZyBmb3JtLlxuICAgKiAgQHByaXZhdGVcbiAgICovXG4gIG9ydGhlcygpIHtcbiAgICBjb25zdCBuID0gdGhpcy5uO1xuICAgIGNvbnN0IFYgPSB0aGlzLlY7XG4gICAgY29uc3QgSCA9IHRoaXMuSDtcbiAgICBjb25zdCBvcnQgPSB0aGlzLm9ydDtcbiAgICBsZXQgaTtcbiAgICBsZXQgajtcbiAgICBsZXQgbTtcbiAgICBsZXQgZjtcbiAgICBsZXQgZztcblxuICAgIC8vICBUaGlzIGlzIGRlcml2ZWQgZnJvbSB0aGUgQWxnb2wgcHJvY2VkdXJlcyBvcnRoZXMgYW5kIG9ydHJhbixcbiAgICAvLyAgYnkgTWFydGluIGFuZCBXaWxraW5zb24sIEhhbmRib29rIGZvciBBdXRvLiBDb21wLixcbiAgICAvLyAgVm9sLmlpLUxpbmVhciBBbGdlYnJhLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAvLyAgRm9ydHJhbiBzdWJyb3V0aW5lcyBpbiBFSVNQQUNLLlxuXG4gICAgY29uc3QgbG93ID0gMDtcbiAgICBjb25zdCBoaWdoID0gbiAtIDE7XG5cbiAgICBmb3IgKCBtID0gbG93ICsgMTsgbSA8PSBoaWdoIC0gMTsgbSsrICkge1xuXG4gICAgICAvLyBTY2FsZSBjb2x1bW4uXG5cbiAgICAgIGxldCBzY2FsZSA9IDAuMDtcbiAgICAgIGZvciAoIGkgPSBtOyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgc2NhbGUgPSBzY2FsZSArIE1hdGguYWJzKCBIWyBpICogbiArICggbSAtIDEgKSBdICk7XG4gICAgICB9XG4gICAgICBpZiAoIHNjYWxlICE9PSAwLjAgKSB7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSBIb3VzZWhvbGRlciB0cmFuc2Zvcm1hdGlvbi5cblxuICAgICAgICBsZXQgaCA9IDAuMDtcbiAgICAgICAgZm9yICggaSA9IGhpZ2g7IGkgPj0gbTsgaS0tICkge1xuICAgICAgICAgIG9ydFsgaSBdID0gSFsgaSAqIG4gKyAoIG0gLSAxICkgXSAvIHNjYWxlO1xuICAgICAgICAgIGggKz0gb3J0WyBpIF0gKiBvcnRbIGkgXTtcbiAgICAgICAgfVxuICAgICAgICBnID0gTWF0aC5zcXJ0KCBoICk7XG4gICAgICAgIGlmICggb3J0WyBtIF0gPiAwICkge1xuICAgICAgICAgIGcgPSAtZztcbiAgICAgICAgfVxuICAgICAgICBoID0gaCAtIG9ydFsgbSBdICogZztcbiAgICAgICAgb3J0WyBtIF0gPSBvcnRbIG0gXSAtIGc7XG5cbiAgICAgICAgLy8gQXBwbHkgSG91c2Vob2xkZXIgc2ltaWxhcml0eSB0cmFuc2Zvcm1hdGlvblxuICAgICAgICAvLyBIID0gKEktdSp1Jy9oKSpIKihJLXUqdScpL2gpXG5cbiAgICAgICAgZm9yICggaiA9IG07IGogPCBuOyBqKysgKSB7XG4gICAgICAgICAgZiA9IDAuMDtcbiAgICAgICAgICBmb3IgKCBpID0gaGlnaDsgaSA+PSBtOyBpLS0gKSB7XG4gICAgICAgICAgICBmICs9IG9ydFsgaSBdICogSFsgaSAqIHRoaXMubiArIGogXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZiA9IGYgLyBoO1xuICAgICAgICAgIGZvciAoIGkgPSBtOyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgICAgIEhbIGkgKiB0aGlzLm4gKyBqIF0gLT0gZiAqIG9ydFsgaSBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgICBmID0gMC4wO1xuICAgICAgICAgIGZvciAoIGogPSBoaWdoOyBqID49IG07IGotLSApIHtcbiAgICAgICAgICAgIGYgKz0gb3J0WyBqIF0gKiBIWyBpICogdGhpcy5uICsgaiBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmID0gZiAvIGg7XG4gICAgICAgICAgZm9yICggaiA9IG07IGogPD0gaGlnaDsgaisrICkge1xuICAgICAgICAgICAgSFsgaSAqIHRoaXMubiArIGogXSAtPSBmICogb3J0WyBqIF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9ydFsgbSBdID0gc2NhbGUgKiBvcnRbIG0gXTtcbiAgICAgICAgSFsgbSAqIG4gKyAoIG0gLSAxICkgXSA9IHNjYWxlICogZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBY2N1bXVsYXRlIHRyYW5zZm9ybWF0aW9ucyAoQWxnb2wncyBvcnRyYW4pLlxuXG4gICAgZm9yICggaSA9IDA7IGkgPCBuOyBpKysgKSB7XG4gICAgICBmb3IgKCBqID0gMDsgaiA8IG47IGorKyApIHtcbiAgICAgICAgVlsgaSAqIHRoaXMubiArIGogXSA9ICggaSA9PT0gaiA/IDEuMCA6IDAuMCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoIG0gPSBoaWdoIC0gMTsgbSA+PSBsb3cgKyAxOyBtLS0gKSB7XG4gICAgICBpZiAoIEhbIG0gKiBuICsgKCBtIC0gMSApIF0gIT09IDAuMCApIHtcbiAgICAgICAgZm9yICggaSA9IG0gKyAxOyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgICBvcnRbIGkgXSA9IEhbIGkgKiBuICsgKCBtIC0gMSApIF07XG4gICAgICAgIH1cbiAgICAgICAgZm9yICggaiA9IG07IGogPD0gaGlnaDsgaisrICkge1xuICAgICAgICAgIGcgPSAwLjA7XG4gICAgICAgICAgZm9yICggaSA9IG07IGkgPD0gaGlnaDsgaSsrICkge1xuICAgICAgICAgICAgZyArPSBvcnRbIGkgXSAqIFZbIGkgKiB0aGlzLm4gKyBqIF07XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIERvdWJsZSBkaXZpc2lvbiBhdm9pZHMgcG9zc2libGUgdW5kZXJmbG93XG4gICAgICAgICAgZyA9ICggZyAvIG9ydFsgbSBdICkgLyBIWyBtICogbiArICggbSAtIDEgKSBdO1xuICAgICAgICAgIGZvciAoIGkgPSBtOyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgICAgIFZbIGkgKiB0aGlzLm4gKyBqIF0gKz0gZyAqIG9ydFsgaSBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wbGV4IHNjYWxhciBkaXZpc2lvbi5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHsqfSB4clxuICAgKiBAcGFyYW0geyp9IHhpXG4gICAqIEBwYXJhbSB7Kn0geXJcbiAgICogQHBhcmFtIHsqfSB5aVxuICAgKi9cbiAgY2RpdiggeHIsIHhpLCB5ciwgeWkgKSB7XG4gICAgbGV0IHI7XG4gICAgbGV0IGQ7XG4gICAgaWYgKCBNYXRoLmFicyggeXIgKSA+IE1hdGguYWJzKCB5aSApICkge1xuICAgICAgciA9IHlpIC8geXI7XG4gICAgICBkID0geXIgKyByICogeWk7XG4gICAgICB0aGlzLmNkaXZyID0gKCB4ciArIHIgKiB4aSApIC8gZDtcbiAgICAgIHRoaXMuY2RpdmkgPSAoIHhpIC0gciAqIHhyICkgLyBkO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHIgPSB5ciAvIHlpO1xuICAgICAgZCA9IHlpICsgciAqIHlyO1xuICAgICAgdGhpcy5jZGl2ciA9ICggciAqIHhyICsgeGkgKSAvIGQ7XG4gICAgICB0aGlzLmNkaXZpID0gKCByICogeGkgLSB4ciApIC8gZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2RzIGZpbmRzIHRoZSBlaWdlbnZhbHVlcyBhbmQgZWlnZW52ZWN0b3JzXG4gICAqIG9mIGEgcmVhbCB1cHBlciBoZXNzZW5iZXJnIG1hdHJpeCBieSB0aGUgUVIgYWxnb3JpdGhtXG4gICAqXG4gICAqIE5vbnN5bW1ldHJpYyByZWR1Y3Rpb24gZnJvbSBIZXNzZW5iZXJnIHRvIHJlYWwgU2NodXIgZm9ybS5cbiAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUVJfYWxnb3JpdGhtXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBocXIyKCkge1xuICAgIGxldCBuO1xuICAgIGNvbnN0IFYgPSB0aGlzLlY7XG4gICAgY29uc3QgZCA9IHRoaXMuZDtcbiAgICBjb25zdCBlID0gdGhpcy5lO1xuICAgIGNvbnN0IEggPSB0aGlzLkg7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG4gICAgbGV0IGs7XG4gICAgbGV0IGw7XG4gICAgbGV0IG07XG4gICAgbGV0IGl0ZXI7XG5cbiAgICAvLyAgVGhpcyBpcyBkZXJpdmVkIGZyb20gdGhlIEFsZ29sIHByb2NlZHVyZSBocXIyLFxuICAgIC8vICBieSBNYXJ0aW4gYW5kIFdpbGtpbnNvbiwgSGFuZGJvb2sgZm9yIEF1dG8uIENvbXAuLFxuICAgIC8vICBWb2wuaWktTGluZWFyIEFsZ2VicmEsIGFuZCB0aGUgY29ycmVzcG9uZGluZ1xuICAgIC8vICBGb3J0cmFuIHN1YnJvdXRpbmUgaW4gRUlTUEFDSy5cblxuICAgIC8vIEluaXRpYWxpemVcblxuICAgIGNvbnN0IG5uID0gdGhpcy5uO1xuICAgIG4gPSBubiAtIDE7XG4gICAgY29uc3QgbG93ID0gMDtcbiAgICBjb25zdCBoaWdoID0gbm4gLSAxO1xuICAgIGNvbnN0IGVwcyA9IE1hdGgucG93KCAyLjAsIC01Mi4wICk7XG4gICAgbGV0IGV4c2hpZnQgPSAwLjA7XG4gICAgbGV0IHAgPSAwO1xuICAgIGxldCBxID0gMDtcbiAgICBsZXQgciA9IDA7XG4gICAgbGV0IHMgPSAwO1xuICAgIGxldCB6ID0gMDtcbiAgICBsZXQgdDtcbiAgICBsZXQgdztcbiAgICBsZXQgeDtcbiAgICBsZXQgeTtcblxuICAgIC8vIFN0b3JlIHJvb3RzIGlzb2xhdGVkIGJ5IGJhbGFuYyBhbmQgY29tcHV0ZSBtYXRyaXggbm9ybVxuXG4gICAgbGV0IG5vcm0gPSAwLjA7XG4gICAgZm9yICggaSA9IDA7IGkgPCBubjsgaSsrICkge1xuICAgICAgaWYgKCBpIDwgbG93IHx8IGkgPiBoaWdoICkge1xuICAgICAgICBkWyBpIF0gPSBIWyBpICogbiArIGkgXTtcbiAgICAgICAgZVsgaSBdID0gMC4wO1xuICAgICAgfVxuICAgICAgZm9yICggaiA9IE1hdGgubWF4KCBpIC0gMSwgMCApOyBqIDwgbm47IGorKyApIHtcbiAgICAgICAgbm9ybSA9IG5vcm0gKyBNYXRoLmFicyggSFsgaSAqIHRoaXMubiArIGogXSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE91dGVyIGxvb3Agb3ZlciBlaWdlbnZhbHVlIGluZGV4XG5cbiAgICBpdGVyID0gMDtcbiAgICB3aGlsZSAoIG4gPj0gbG93ICkge1xuXG4gICAgICAvLyBMb29rIGZvciBzaW5nbGUgc21hbGwgc3ViLWRpYWdvbmFsIGVsZW1lbnRcblxuICAgICAgbCA9IG47XG4gICAgICB3aGlsZSAoIGwgPiBsb3cgKSB7XG4gICAgICAgIHMgPSBNYXRoLmFicyggSFsgKCBsIC0gMSApICogbiArICggbCAtIDEgKSBdICkgKyBNYXRoLmFicyggSFsgbCAqIG4gKyBsIF0gKTtcbiAgICAgICAgaWYgKCBzID09PSAwLjAgKSB7XG4gICAgICAgICAgcyA9IG5vcm07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBNYXRoLmFicyggSFsgbCAqIG4gKyAoIGwgLSAxICkgXSApIDwgZXBzICogcyApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBsLS07XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGZvciBjb252ZXJnZW5jZVxuICAgICAgLy8gT25lIHJvb3QgZm91bmRcblxuICAgICAgaWYgKCBsID09PSBuICkge1xuICAgICAgICBIWyBuICogbiArIG4gXSA9IEhbIG4gKiBuICsgbiBdICsgZXhzaGlmdDtcbiAgICAgICAgZFsgbiBdID0gSFsgbiAqIG4gKyBuIF07XG4gICAgICAgIGVbIG4gXSA9IDAuMDtcbiAgICAgICAgbi0tO1xuICAgICAgICBpdGVyID0gMDtcblxuICAgICAgICAvLyBUd28gcm9vdHMgZm91bmRcblxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGwgPT09IG4gLSAxICkge1xuICAgICAgICB3ID0gSFsgbiAqIG4gKyBuIC0gMSBdICogSFsgKCBuIC0gMSApICogbiArIG4gXTtcbiAgICAgICAgcCA9ICggSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdIC0gSFsgbiAqIG4gKyBuIF0gKSAvIDIuMDtcbiAgICAgICAgcSA9IHAgKiBwICsgdztcbiAgICAgICAgeiA9IE1hdGguc3FydCggTWF0aC5hYnMoIHEgKSApO1xuICAgICAgICBIWyBuICogbiArIG4gXSA9IEhbIG4gKiBuICsgbiBdICsgZXhzaGlmdDtcbiAgICAgICAgSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdID0gSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdICsgZXhzaGlmdDtcbiAgICAgICAgeCA9IEhbIG4gKiBuICsgbiBdO1xuXG4gICAgICAgIC8vIFJlYWwgcGFpclxuXG4gICAgICAgIGlmICggcSA+PSAwICkge1xuICAgICAgICAgIGlmICggcCA+PSAwICkge1xuICAgICAgICAgICAgeiA9IHAgKyB6O1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHogPSBwIC0gejtcbiAgICAgICAgICB9XG4gICAgICAgICAgZFsgbiAtIDEgXSA9IHggKyB6O1xuICAgICAgICAgIGRbIG4gXSA9IGRbIG4gLSAxIF07XG4gICAgICAgICAgaWYgKCB6ICE9PSAwLjAgKSB7XG4gICAgICAgICAgICBkWyBuIF0gPSB4IC0gdyAvIHo7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVbIG4gLSAxIF0gPSAwLjA7XG4gICAgICAgICAgZVsgbiBdID0gMC4wO1xuICAgICAgICAgIHggPSBIWyBuICogbiArIG4gLSAxIF07XG4gICAgICAgICAgcyA9IE1hdGguYWJzKCB4ICkgKyBNYXRoLmFicyggeiApO1xuICAgICAgICAgIHAgPSB4IC8gcztcbiAgICAgICAgICBxID0geiAvIHM7XG4gICAgICAgICAgciA9IE1hdGguc3FydCggcCAqIHAgKyBxICogcSApO1xuICAgICAgICAgIHAgPSBwIC8gcjtcbiAgICAgICAgICBxID0gcSAvIHI7XG5cbiAgICAgICAgICAvLyBSb3cgbW9kaWZpY2F0aW9uXG5cbiAgICAgICAgICBmb3IgKCBqID0gbiAtIDE7IGogPCBubjsgaisrICkge1xuICAgICAgICAgICAgeiA9IEhbICggbiAtIDEgKSAqIG4gKyBqIF07XG4gICAgICAgICAgICBIWyAoIG4gLSAxICkgKiBuICsgaiBdID0gcSAqIHogKyBwICogSFsgbiAqIG4gKyBqIF07XG4gICAgICAgICAgICBIWyBuICogbiArIGogXSA9IHEgKiBIWyBuICogbiArIGogXSAtIHAgKiB6O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvbHVtbiBtb2RpZmljYXRpb25cblxuICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDw9IG47IGkrKyApIHtcbiAgICAgICAgICAgIHogPSBIWyBpICogbiArIG4gLSAxIF07XG4gICAgICAgICAgICBIWyBpICogbiArIG4gLSAxIF0gPSBxICogeiArIHAgKiBIWyBpICogbiArIG4gXTtcbiAgICAgICAgICAgIEhbIGkgKiBuICsgbiBdID0gcSAqIEhbIGkgKiBuICsgbiBdIC0gcCAqIHo7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWNjdW11bGF0ZSB0cmFuc2Zvcm1hdGlvbnNcblxuICAgICAgICAgIGZvciAoIGkgPSBsb3c7IGkgPD0gaGlnaDsgaSsrICkge1xuICAgICAgICAgICAgeiA9IFZbIGkgKiBuICsgbiAtIDEgXTtcbiAgICAgICAgICAgIFZbIGkgKiBuICsgbiAtIDEgXSA9IHEgKiB6ICsgcCAqIFZbIGkgKiBuICsgbiBdO1xuICAgICAgICAgICAgVlsgaSAqIG4gKyBuIF0gPSBxICogVlsgaSAqIG4gKyBuIF0gLSBwICogejtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDb21wbGV4IHBhaXJcblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRbIG4gLSAxIF0gPSB4ICsgcDtcbiAgICAgICAgICBkWyBuIF0gPSB4ICsgcDtcbiAgICAgICAgICBlWyBuIC0gMSBdID0gejtcbiAgICAgICAgICBlWyBuIF0gPSAtejtcbiAgICAgICAgfVxuICAgICAgICBuID0gbiAtIDI7XG4gICAgICAgIGl0ZXIgPSAwO1xuXG4gICAgICAgIC8vIE5vIGNvbnZlcmdlbmNlIHlldFxuXG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBGb3JtIHNoaWZ0XG5cbiAgICAgICAgeCA9IEhbIG4gKiBuICsgbiBdO1xuICAgICAgICB5ID0gMC4wO1xuICAgICAgICB3ID0gMC4wO1xuICAgICAgICBpZiAoIGwgPCBuICkge1xuICAgICAgICAgIHkgPSBIWyAoIG4gLSAxICkgKiBuICsgKCBuIC0gMSApIF07XG4gICAgICAgICAgdyA9IEhbIG4gKiBuICsgbiAtIDEgXSAqIEhbICggbiAtIDEgKSAqIG4gKyBuIF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXaWxraW5zb24ncyBvcmlnaW5hbCBhZCBob2Mgc2hpZnRcblxuICAgICAgICBpZiAoIGl0ZXIgPT09IDEwICkge1xuICAgICAgICAgIGV4c2hpZnQgKz0geDtcbiAgICAgICAgICBmb3IgKCBpID0gbG93OyBpIDw9IG47IGkrKyApIHtcbiAgICAgICAgICAgIEhbIGkgKiBuICsgaSBdIC09IHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHMgPSBNYXRoLmFicyggSFsgbiAqIG4gKyBuIC0gMSBdICkgKyBNYXRoLmFicyggSFsgKCBuIC0gMSApICogbiArIG4gLSAyIF0gKTtcbiAgICAgICAgICB4ID0geSA9IDAuNzUgKiBzO1xuICAgICAgICAgIHcgPSAtMC40Mzc1ICogcyAqIHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNQVRMQUIncyBuZXcgYWQgaG9jIHNoaWZ0XG5cbiAgICAgICAgaWYgKCBpdGVyID09PSAzMCApIHtcbiAgICAgICAgICBzID0gKCB5IC0geCApIC8gMi4wO1xuICAgICAgICAgIHMgPSBzICogcyArIHc7XG4gICAgICAgICAgaWYgKCBzID4gMCApIHtcbiAgICAgICAgICAgIHMgPSBNYXRoLnNxcnQoIHMgKTtcbiAgICAgICAgICAgIGlmICggeSA8IHggKSB7XG4gICAgICAgICAgICAgIHMgPSAtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMgPSB4IC0gdyAvICggKCB5IC0geCApIC8gMi4wICsgcyApO1xuICAgICAgICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBuOyBpKysgKSB7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgaSBdIC09IHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHNoaWZ0ICs9IHM7XG4gICAgICAgICAgICB4ID0geSA9IHcgPSAwLjk2NDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpdGVyID0gaXRlciArIDE7ICAgLy8gKENvdWxkIGNoZWNrIGl0ZXJhdGlvbiBjb3VudCBoZXJlLilcblxuICAgICAgICAvLyBMb29rIGZvciB0d28gY29uc2VjdXRpdmUgc21hbGwgc3ViLWRpYWdvbmFsIGVsZW1lbnRzXG5cbiAgICAgICAgbSA9IG4gLSAyO1xuICAgICAgICB3aGlsZSAoIG0gPj0gbCApIHtcbiAgICAgICAgICB6ID0gSFsgbSAqIG4gKyBtIF07XG4gICAgICAgICAgciA9IHggLSB6O1xuICAgICAgICAgIHMgPSB5IC0gejtcbiAgICAgICAgICBwID0gKCByICogcyAtIHcgKSAvIEhbICggbSArIDEgKSAqIG4gKyBtIF0gKyBIWyBtICogbiArIG0gKyAxIF07XG4gICAgICAgICAgcSA9IEhbICggbSArIDEgKSAqIG4gKyBtICsgMSBdIC0geiAtIHIgLSBzO1xuICAgICAgICAgIHIgPSBIWyAoIG0gKyAyICkgKiBuICsgbSArIDEgXTtcbiAgICAgICAgICBzID0gTWF0aC5hYnMoIHAgKSArIE1hdGguYWJzKCBxICkgKyBNYXRoLmFicyggciApO1xuICAgICAgICAgIHAgPSBwIC8gcztcbiAgICAgICAgICBxID0gcSAvIHM7XG4gICAgICAgICAgciA9IHIgLyBzO1xuICAgICAgICAgIGlmICggbSA9PT0gbCApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIE1hdGguYWJzKCBIWyBtICogbiArICggbSAtIDEgKSBdICkgKiAoIE1hdGguYWJzKCBxICkgKyBNYXRoLmFicyggciApICkgPFxuICAgICAgICAgICAgICAgZXBzICogKCBNYXRoLmFicyggcCApICogKCBNYXRoLmFicyggSFsgKCBtIC0gMSApICogbiArIG0gLSAxIF0gKSArIE1hdGguYWJzKCB6ICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFicyggSFsgKCBtICsgMSApICogbiArIG0gKyAxIF0gKSApICkgKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgbS0tO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICggaSA9IG0gKyAyOyBpIDw9IG47IGkrKyApIHtcbiAgICAgICAgICBIWyBpICogbiArIGkgLSAyIF0gPSAwLjA7XG4gICAgICAgICAgaWYgKCBpID4gbSArIDIgKSB7XG4gICAgICAgICAgICBIWyBpICogbiArIGkgLSAzIF0gPSAwLjA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG91YmxlIFFSIHN0ZXAgaW52b2x2aW5nIHJvd3MgbDpuIGFuZCBjb2x1bW5zIG06blxuXG4gICAgICAgIGZvciAoIGsgPSBtOyBrIDw9IG4gLSAxOyBrKysgKSB7XG4gICAgICAgICAgY29uc3Qgbm90bGFzdCA9ICggayAhPT0gbiAtIDEgKTtcbiAgICAgICAgICBpZiAoIGsgIT09IG0gKSB7XG4gICAgICAgICAgICBwID0gSFsgayAqIG4gKyBrIC0gMSBdO1xuICAgICAgICAgICAgcSA9IEhbICggayArIDEgKSAqIG4gKyBrIC0gMSBdO1xuICAgICAgICAgICAgciA9ICggbm90bGFzdCA/IEhbICggayArIDIgKSAqIG4gKyBrIC0gMSBdIDogMC4wICk7XG4gICAgICAgICAgICB4ID0gTWF0aC5hYnMoIHAgKSArIE1hdGguYWJzKCBxICkgKyBNYXRoLmFicyggciApO1xuICAgICAgICAgICAgaWYgKCB4ICE9PSAwLjAgKSB7XG4gICAgICAgICAgICAgIHAgPSBwIC8geDtcbiAgICAgICAgICAgICAgcSA9IHEgLyB4O1xuICAgICAgICAgICAgICByID0gciAvIHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggeCA9PT0gMC4wICkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHMgPSBNYXRoLnNxcnQoIHAgKiBwICsgcSAqIHEgKyByICogciApO1xuICAgICAgICAgIGlmICggcCA8IDAgKSB7XG4gICAgICAgICAgICBzID0gLXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggcyAhPT0gMCApIHtcbiAgICAgICAgICAgIGlmICggayAhPT0gbSApIHtcbiAgICAgICAgICAgICAgSFsgayAqIG4gKyBrIC0gMSBdID0gLXMgKiB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIGwgIT09IG0gKSB7XG4gICAgICAgICAgICAgIEhbIGsgKiBuICsgayAtIDEgXSA9IC1IWyBrICogbiArIGsgLSAxIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwID0gcCArIHM7XG4gICAgICAgICAgICB4ID0gcCAvIHM7XG4gICAgICAgICAgICB5ID0gcSAvIHM7XG4gICAgICAgICAgICB6ID0gciAvIHM7XG4gICAgICAgICAgICBxID0gcSAvIHA7XG4gICAgICAgICAgICByID0gciAvIHA7XG5cbiAgICAgICAgICAgIC8vIFJvdyBtb2RpZmljYXRpb25cblxuICAgICAgICAgICAgZm9yICggaiA9IGs7IGogPCBubjsgaisrICkge1xuICAgICAgICAgICAgICBwID0gSFsgayAqIG4gKyBqIF0gKyBxICogSFsgKCBrICsgMSApICogbiArIGogXTtcbiAgICAgICAgICAgICAgaWYgKCBub3RsYXN0ICkge1xuICAgICAgICAgICAgICAgIHAgPSBwICsgciAqIEhbICggayArIDIgKSAqIG4gKyBqIF07XG4gICAgICAgICAgICAgICAgSFsgKCBrICsgMiApICogbiArIGogXSA9IEhbICggayArIDIgKSAqIG4gKyBqIF0gLSBwICogejtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBIWyBrICogbiArIGogXSA9IEhbIGsgKiBuICsgaiBdIC0gcCAqIHg7XG4gICAgICAgICAgICAgIEhbICggayArIDEgKSAqIG4gKyBqIF0gPSBIWyAoIGsgKyAxICkgKiBuICsgaiBdIC0gcCAqIHk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbHVtbiBtb2RpZmljYXRpb25cblxuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gTWF0aC5taW4oIG4sIGsgKyAzICk7IGkrKyApIHtcbiAgICAgICAgICAgICAgcCA9IHggKiBIWyBpICogbiArIGsgXSArIHkgKiBIWyBpICogbiArIGsgKyAxIF07XG4gICAgICAgICAgICAgIGlmICggbm90bGFzdCApIHtcbiAgICAgICAgICAgICAgICBwID0gcCArIHogKiBIWyBpICogbiArIGsgKyAyIF07XG4gICAgICAgICAgICAgICAgSFsgaSAqIG4gKyBrICsgMiBdID0gSFsgaSAqIG4gKyBrICsgMiBdIC0gcCAqIHI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgSFsgaSAqIG4gKyBrIF0gPSBIWyBpICogbiArIGsgXSAtIHA7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgayArIDEgXSA9IEhbIGkgKiBuICsgayArIDEgXSAtIHAgKiBxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBY2N1bXVsYXRlIHRyYW5zZm9ybWF0aW9uc1xuXG4gICAgICAgICAgICBmb3IgKCBpID0gbG93OyBpIDw9IGhpZ2g7IGkrKyApIHtcbiAgICAgICAgICAgICAgcCA9IHggKiBWWyBpICogbiArIGsgXSArIHkgKiBWWyBpICogbiArIGsgKyAxIF07XG4gICAgICAgICAgICAgIGlmICggbm90bGFzdCApIHtcbiAgICAgICAgICAgICAgICBwID0gcCArIHogKiBWWyBpICogbiArIGsgKyAyIF07XG4gICAgICAgICAgICAgICAgVlsgaSAqIG4gKyBrICsgMiBdID0gVlsgaSAqIG4gKyBrICsgMiBdIC0gcCAqIHI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgVlsgaSAqIG4gKyBrIF0gPSBWWyBpICogbiArIGsgXSAtIHA7XG4gICAgICAgICAgICAgIFZbIGkgKiBuICsgayArIDEgXSA9IFZbIGkgKiBuICsgayArIDEgXSAtIHAgKiBxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gIC8vIChzICE9PSAwKVxuICAgICAgICB9ICAvLyBrIGxvb3BcbiAgICAgIH0gIC8vIGNoZWNrIGNvbnZlcmdlbmNlXG4gICAgfSAgLy8gd2hpbGUgKG4gPj0gbG93KVxuXG4gICAgLy8gQmFja3N1YnN0aXR1dGUgdG8gZmluZCB2ZWN0b3JzIG9mIHVwcGVyIHRyaWFuZ3VsYXIgZm9ybVxuXG4gICAgaWYgKCBub3JtID09PSAwLjAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICggbiA9IG5uIC0gMTsgbiA+PSAwOyBuLS0gKSB7XG4gICAgICBwID0gZFsgbiBdO1xuICAgICAgcSA9IGVbIG4gXTtcblxuICAgICAgLy8gUmVhbCB2ZWN0b3JcblxuICAgICAgaWYgKCBxID09PSAwICkge1xuICAgICAgICBsID0gbjtcbiAgICAgICAgSFsgbiAqIG4gKyBuIF0gPSAxLjA7XG4gICAgICAgIGZvciAoIGkgPSBuIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgICAgdyA9IEhbIGkgKiBuICsgaSBdIC0gcDtcbiAgICAgICAgICByID0gMC4wO1xuICAgICAgICAgIGZvciAoIGogPSBsOyBqIDw9IG47IGorKyApIHtcbiAgICAgICAgICAgIHIgPSByICsgSFsgaSAqIHRoaXMubiArIGogXSAqIEhbIGogKiBuICsgbiBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIGVbIGkgXSA8IDAuMCApIHtcbiAgICAgICAgICAgIHogPSB3O1xuICAgICAgICAgICAgcyA9IHI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbCA9IGk7XG4gICAgICAgICAgICBpZiAoIGVbIGkgXSA9PT0gMC4wICkge1xuICAgICAgICAgICAgICBpZiAoIHcgIT09IDAuMCApIHtcbiAgICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IC1yIC8gdztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IC1yIC8gKCBlcHMgKiBub3JtICk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBTb2x2ZSByZWFsIGVxdWF0aW9uc1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgeCA9IEhbIGkgKiBuICsgaSArIDEgXTtcbiAgICAgICAgICAgICAgeSA9IEhbICggaSArIDEgKSAqIG4gKyBpIF07XG4gICAgICAgICAgICAgIHEgPSAoIGRbIGkgXSAtIHAgKSAqICggZFsgaSBdIC0gcCApICsgZVsgaSBdICogZVsgaSBdO1xuICAgICAgICAgICAgICB0ID0gKCB4ICogcyAtIHogKiByICkgLyBxO1xuICAgICAgICAgICAgICBIWyBpICogbiArIG4gXSA9IHQ7XG4gICAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIHggKSA+IE1hdGguYWJzKCB6ICkgKSB7XG4gICAgICAgICAgICAgICAgSFsgKCBpICsgMSApICogbiArIG4gXSA9ICggLXIgLSB3ICogdCApIC8geDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBIWyAoIGkgKyAxICkgKiBuICsgbiBdID0gKCAtcyAtIHkgKiB0ICkgLyB6O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE92ZXJmbG93IGNvbnRyb2xcblxuICAgICAgICAgICAgdCA9IE1hdGguYWJzKCBIWyBpICogbiArIG4gXSApO1xuICAgICAgICAgICAgaWYgKCAoIGVwcyAqIHQgKSAqIHQgPiAxICkge1xuICAgICAgICAgICAgICBmb3IgKCBqID0gaTsgaiA8PSBuOyBqKysgKSB7XG4gICAgICAgICAgICAgICAgSFsgaiAqIG4gKyBuIF0gPSBIWyBqICogbiArIG4gXSAvIHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb21wbGV4IHZlY3RvclxuXG4gICAgICB9XG4gICAgICBlbHNlIGlmICggcSA8IDAgKSB7XG4gICAgICAgIGwgPSBuIC0gMTtcblxuICAgICAgICAvLyBMYXN0IHZlY3RvciBjb21wb25lbnQgaW1hZ2luYXJ5IHNvIG1hdHJpeCBpcyB0cmlhbmd1bGFyXG5cbiAgICAgICAgaWYgKCBNYXRoLmFicyggSFsgbiAqIG4gKyBuIC0gMSBdICkgPiBNYXRoLmFicyggSFsgKCBuIC0gMSApICogbiArIG4gXSApICkge1xuICAgICAgICAgIEhbICggbiAtIDEgKSAqIG4gKyAoIG4gLSAxICkgXSA9IHEgLyBIWyBuICogbiArIG4gLSAxIF07XG4gICAgICAgICAgSFsgKCBuIC0gMSApICogbiArIG4gXSA9IC0oIEhbIG4gKiBuICsgbiBdIC0gcCApIC8gSFsgbiAqIG4gKyBuIC0gMSBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuY2RpdiggMC4wLCAtSFsgKCBuIC0gMSApICogbiArIG4gXSwgSFsgKCBuIC0gMSApICogbiArICggbiAtIDEgKSBdIC0gcCwgcSApO1xuICAgICAgICAgIEhbICggbiAtIDEgKSAqIG4gKyAoIG4gLSAxICkgXSA9IHRoaXMuY2RpdnI7XG4gICAgICAgICAgSFsgKCBuIC0gMSApICogbiArIG4gXSA9IHRoaXMuY2Rpdmk7XG4gICAgICAgIH1cbiAgICAgICAgSFsgbiAqIG4gKyBuIC0gMSBdID0gMC4wO1xuICAgICAgICBIWyBuICogbiArIG4gXSA9IDEuMDtcbiAgICAgICAgZm9yICggaSA9IG4gLSAyOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICBsZXQgcmE7XG4gICAgICAgICAgbGV0IHNhO1xuICAgICAgICAgIGxldCB2cjtcbiAgICAgICAgICBsZXQgdmk7XG4gICAgICAgICAgcmEgPSAwLjA7XG4gICAgICAgICAgc2EgPSAwLjA7XG4gICAgICAgICAgZm9yICggaiA9IGw7IGogPD0gbjsgaisrICkge1xuICAgICAgICAgICAgcmEgPSByYSArIEhbIGkgKiB0aGlzLm4gKyBqIF0gKiBIWyBqICogbiArIG4gLSAxIF07XG4gICAgICAgICAgICBzYSA9IHNhICsgSFsgaSAqIHRoaXMubiArIGogXSAqIEhbIGogKiBuICsgbiBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB3ID0gSFsgaSAqIG4gKyBpIF0gLSBwO1xuXG4gICAgICAgICAgaWYgKCBlWyBpIF0gPCAwLjAgKSB7XG4gICAgICAgICAgICB6ID0gdztcbiAgICAgICAgICAgIHIgPSByYTtcbiAgICAgICAgICAgIHMgPSBzYTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsID0gaTtcbiAgICAgICAgICAgIGlmICggZVsgaSBdID09PSAwICkge1xuICAgICAgICAgICAgICB0aGlzLmNkaXYoIC1yYSwgLXNhLCB3LCBxICk7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgbiAtIDEgXSA9IHRoaXMuY2RpdnI7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgbiBdID0gdGhpcy5jZGl2aTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgIC8vIFNvbHZlIGNvbXBsZXggZXF1YXRpb25zXG5cbiAgICAgICAgICAgICAgeCA9IEhbIGkgKiBuICsgaSArIDEgXTtcbiAgICAgICAgICAgICAgeSA9IEhbICggaSArIDEgKSAqIG4gKyBpIF07XG4gICAgICAgICAgICAgIHZyID0gKCBkWyBpIF0gLSBwICkgKiAoIGRbIGkgXSAtIHAgKSArIGVbIGkgXSAqIGVbIGkgXSAtIHEgKiBxO1xuICAgICAgICAgICAgICB2aSA9ICggZFsgaSBdIC0gcCApICogMi4wICogcTtcbiAgICAgICAgICAgICAgaWYgKCB2ciA9PT0gMC4wICYmIHZpID09PSAwLjAgKSB7XG4gICAgICAgICAgICAgICAgdnIgPSBlcHMgKiBub3JtICogKCBNYXRoLmFicyggdyApICsgTWF0aC5hYnMoIHEgKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmFicyggeCApICsgTWF0aC5hYnMoIHkgKSArIE1hdGguYWJzKCB6ICkgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLmNkaXYoIHggKiByIC0geiAqIHJhICsgcSAqIHNhLCB4ICogcyAtIHogKiBzYSAtIHEgKiByYSwgdnIsIHZpICk7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgbiAtIDEgXSA9IHRoaXMuY2RpdnI7XG4gICAgICAgICAgICAgIEhbIGkgKiBuICsgbiBdID0gdGhpcy5jZGl2aTtcbiAgICAgICAgICAgICAgaWYgKCBNYXRoLmFicyggeCApID4gKCBNYXRoLmFicyggeiApICsgTWF0aC5hYnMoIHEgKSApICkge1xuICAgICAgICAgICAgICAgIEhbICggaSArIDEgKSAqIG4gKyBuIC0gMSBdID0gKCAtcmEgLSB3ICogSFsgaSAqIG4gKyBuIC0gMSBdICsgcSAqIEhbIGkgKiBuICsgbiBdICkgLyB4O1xuICAgICAgICAgICAgICAgIEhbICggaSArIDEgKSAqIG4gKyBuIF0gPSAoIC1zYSAtIHcgKiBIWyBpICogbiArIG4gXSAtIHEgKiBIWyBpICogbiArIG4gLSAxIF0gKSAvIHg7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jZGl2KCAtciAtIHkgKiBIWyBpICogbiArIG4gLSAxIF0sIC1zIC0geSAqIEhbIGkgKiBuICsgbiBdLCB6LCBxICk7XG4gICAgICAgICAgICAgICAgSFsgKCBpICsgMSApICogbiArIG4gLSAxIF0gPSB0aGlzLmNkaXZyO1xuICAgICAgICAgICAgICAgIEhbICggaSArIDEgKSAqIG4gKyBuIF0gPSB0aGlzLmNkaXZpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE92ZXJmbG93IGNvbnRyb2xcbiAgICAgICAgICAgIHQgPSBNYXRoLm1heCggTWF0aC5hYnMoIEhbIGkgKiBuICsgbiAtIDEgXSApLCBNYXRoLmFicyggSFsgaSAqIG4gKyBuIF0gKSApO1xuICAgICAgICAgICAgaWYgKCAoIGVwcyAqIHQgKSAqIHQgPiAxICkge1xuICAgICAgICAgICAgICBmb3IgKCBqID0gaTsgaiA8PSBuOyBqKysgKSB7XG4gICAgICAgICAgICAgICAgSFsgaiAqIG4gKyBuIC0gMSBdID0gSFsgaiAqIG4gKyBuIC0gMSBdIC8gdDtcbiAgICAgICAgICAgICAgICBIWyBqICogbiArIG4gXSA9IEhbIGogKiBuICsgbiBdIC8gdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlY3RvcnMgb2YgaXNvbGF0ZWQgcm9vdHNcbiAgICBmb3IgKCBpID0gMDsgaSA8IG5uOyBpKysgKSB7XG4gICAgICBpZiAoIGkgPCBsb3cgfHwgaSA+IGhpZ2ggKSB7XG4gICAgICAgIGZvciAoIGogPSBpOyBqIDwgbm47IGorKyApIHtcbiAgICAgICAgICBWWyBpICogdGhpcy5uICsgaiBdID0gSFsgaSAqIHRoaXMubiArIGogXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJhY2sgdHJhbnNmb3JtYXRpb24gdG8gZ2V0IGVpZ2VudmVjdG9ycyBvZiBvcmlnaW5hbCBtYXRyaXhcbiAgICBmb3IgKCBqID0gbm4gLSAxOyBqID49IGxvdzsgai0tICkge1xuICAgICAgZm9yICggaSA9IGxvdzsgaSA8PSBoaWdoOyBpKysgKSB7XG4gICAgICAgIHogPSAwLjA7XG4gICAgICAgIGZvciAoIGsgPSBsb3c7IGsgPD0gTWF0aC5taW4oIGosIGhpZ2ggKTsgaysrICkge1xuICAgICAgICAgIHogPSB6ICsgVlsgaSAqIG4gKyBrIF0gKiBIWyBrICogbiArIGogXTtcbiAgICAgICAgfVxuICAgICAgICBWWyBpICogdGhpcy5uICsgaiBdID0gejtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZG90LnJlZ2lzdGVyKCAnRWlnZW52YWx1ZURlY29tcG9zaXRpb24nLCBFaWdlbnZhbHVlRGVjb21wb3NpdGlvbiApO1xuXG5leHBvcnQgZGVmYXVsdCBFaWdlbnZhbHVlRGVjb21wb3NpdGlvbjsiXSwibmFtZXMiOlsiZG90IiwiTWF0cml4IiwiQXJyYXlUeXBlIiwid2luZG93IiwiRmxvYXQ2NEFycmF5IiwiQXJyYXkiLCJFaWdlbnZhbHVlRGVjb21wb3NpdGlvbiIsImdldFYiLCJWIiwiY29weSIsImdldFJlYWxFaWdlbnZhbHVlcyIsImQiLCJnZXRJbWFnRWlnZW52YWx1ZXMiLCJlIiwiZ2V0RCIsIm4iLCJYIiwiRCIsImVudHJpZXMiLCJpIiwiaiIsInRyZWQyIiwiayIsImYiLCJnIiwiaCIsInNjYWxlIiwiTWF0aCIsImFicyIsInNxcnQiLCJoaCIsInRxbDIiLCJsIiwicCIsIml0ZXIiLCJ0c3QxIiwiZXBzIiwicG93IiwibWF4IiwibSIsInIiLCJoeXBvdCIsImRsMSIsImMiLCJjMiIsImMzIiwiZWwxIiwicyIsInMyIiwib3J0aGVzIiwiSCIsIm9ydCIsImxvdyIsImhpZ2giLCJjZGl2IiwieHIiLCJ4aSIsInlyIiwieWkiLCJjZGl2ciIsImNkaXZpIiwiaHFyMiIsIm5uIiwiZXhzaGlmdCIsInEiLCJ6IiwidCIsInciLCJ4IiwieSIsIm5vcm0iLCJub3RsYXN0IiwibWluIiwicmEiLCJzYSIsInZyIiwidmkiLCJjb25zdHJ1Y3RvciIsIm1hdHJpeCIsIkEiLCJnZXRDb2x1bW5EaW1lbnNpb24iLCJpc3N5bW1ldHJpYyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7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