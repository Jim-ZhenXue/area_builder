// Copyright 2013-2023, University of Colorado Boulder
/**
 * LU decomposition, based on Jama (http://math.nist.gov/javanumerics/jama/).  Please note the arbitrary-precision
 * copy LUDecompositionDecimal which should be maintained with this file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Matrix from './Matrix.js';
const ArrayType = window.Float64Array || Array;
let LUDecomposition = class LUDecomposition {
    /**
   * @public
   *
   * @returns {boolean}
   */ isNonsingular() {
        for(let j = 0; j < this.n; j++){
            const index = this.matrix.index(j, j);
            if (this.LU[index] === 0) {
                return false;
            }
        }
        return true;
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ getL() {
        const result = new Matrix(this.m, this.n);
        for(let i = 0; i < this.m; i++){
            for(let j = 0; j < this.n; j++){
                if (i > j) {
                    result.entries[result.index(i, j)] = this.LU[this.matrix.index(i, j)];
                } else if (i === j) {
                    result.entries[result.index(i, j)] = 1.0;
                } else {
                    result.entries[result.index(i, j)] = 0.0;
                }
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @returns {Matrix}
   */ getU() {
        const result = new Matrix(this.n, this.n);
        for(let i = 0; i < this.n; i++){
            for(let j = 0; j < this.n; j++){
                if (i <= j) {
                    result.entries[result.index(i, j)] = this.LU[this.matrix.index(i, j)];
                } else {
                    result.entries[result.index(i, j)] = 0.0;
                }
            }
        }
        return result;
    }
    /**
   * @public
   *
   * @returns {Uint32Array}
   */ getPivot() {
        const p = new Uint32Array(this.m);
        for(let i = 0; i < this.m; i++){
            p[i] = this.piv[i];
        }
        return p;
    }
    /**
   * @public
   *
   * @returns {Float64Array}
   */ getDoublePivot() {
        const vals = new ArrayType(this.m);
        for(let i = 0; i < this.m; i++){
            vals[i] = this.piv[i];
        }
        return vals;
    }
    /**
   * @public
   *
   * @returns {number}
   */ det() {
        if (this.m !== this.n) {
            throw new Error('Matrix must be square.');
        }
        let d = this.pivsign;
        for(let j = 0; j < this.n; j++){
            d *= this.LU[this.matrix.index(j, j)];
        }
        return d;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @returns {Matrix}
   */ solve(matrix) {
        let i;
        let j;
        let k;
        if (matrix.getRowDimension() !== this.m) {
            throw new Error('Matrix row dimensions must agree.');
        }
        if (!this.isNonsingular()) {
            throw new Error('Matrix is singular.');
        }
        // Copy right hand side with pivoting
        const nx = matrix.getColumnDimension();
        const Xmat = matrix.getArrayRowMatrix(this.piv, 0, nx - 1);
        // Solve L*Y = B(piv,:)
        for(k = 0; k < this.n; k++){
            for(i = k + 1; i < this.n; i++){
                for(j = 0; j < nx; j++){
                    Xmat.entries[Xmat.index(i, j)] -= Xmat.entries[Xmat.index(k, j)] * this.LU[this.matrix.index(i, k)];
                }
            }
        }
        // Solve U*X = Y;
        for(k = this.n - 1; k >= 0; k--){
            for(j = 0; j < nx; j++){
                Xmat.entries[Xmat.index(k, j)] /= this.LU[this.matrix.index(k, k)];
            }
            for(i = 0; i < k; i++){
                for(j = 0; j < nx; j++){
                    Xmat.entries[Xmat.index(i, j)] -= Xmat.entries[Xmat.index(k, j)] * this.LU[this.matrix.index(i, k)];
                }
            }
        }
        return Xmat;
    }
    constructor(matrix){
        let i;
        let j;
        let k;
        this.matrix = matrix;
        // TODO: size! https://github.com/phetsims/dot/issues/96
        this.LU = matrix.getArrayCopy();
        const LU = this.LU;
        this.m = matrix.getRowDimension();
        const m = this.m;
        this.n = matrix.getColumnDimension();
        const n = this.n;
        this.piv = new Uint32Array(m);
        for(i = 0; i < m; i++){
            this.piv[i] = i;
        }
        this.pivsign = 1;
        const LUcolj = new ArrayType(m);
        // Outer loop.
        for(j = 0; j < n; j++){
            // Make a copy of the j-th column to localize references.
            for(i = 0; i < m; i++){
                LUcolj[i] = LU[matrix.index(i, j)];
            }
            // Apply previous transformations.
            for(i = 0; i < m; i++){
                // Most of the time is spent in the following dot product.
                const kmax = Math.min(i, j);
                let s = 0.0;
                for(k = 0; k < kmax; k++){
                    const ik = matrix.index(i, k);
                    s += LU[ik] * LUcolj[k];
                }
                LUcolj[i] -= s;
                LU[matrix.index(i, j)] = LUcolj[i];
            }
            // Find pivot and exchange if necessary.
            let p = j;
            for(i = j + 1; i < m; i++){
                if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
                    p = i;
                }
            }
            if (p !== j) {
                for(k = 0; k < n; k++){
                    const pk = matrix.index(p, k);
                    const jk = matrix.index(j, k);
                    const t = LU[pk];
                    LU[pk] = LU[jk];
                    LU[jk] = t;
                }
                k = this.piv[p];
                this.piv[p] = this.piv[j];
                this.piv[j] = k;
                this.pivsign = -this.pivsign;
            }
            // Compute multipliers.
            if (j < m && LU[this.matrix.index(j, j)] !== 0.0) {
                for(i = j + 1; i < m; i++){
                    LU[matrix.index(i, j)] /= LU[matrix.index(j, j)];
                }
            }
        }
    }
};
dot.register('LUDecomposition', LUDecomposition);
export default LUDecomposition;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9MVURlY29tcG9zaXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTFUgZGVjb21wb3NpdGlvbiwgYmFzZWQgb24gSmFtYSAoaHR0cDovL21hdGgubmlzdC5nb3YvamF2YW51bWVyaWNzL2phbWEvKS4gIFBsZWFzZSBub3RlIHRoZSBhcmJpdHJhcnktcHJlY2lzaW9uXG4gKiBjb3B5IExVRGVjb21wb3NpdGlvbkRlY2ltYWwgd2hpY2ggc2hvdWxkIGJlIG1haW50YWluZWQgd2l0aCB0aGlzIGZpbGUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IE1hdHJpeCBmcm9tICcuL01hdHJpeC5qcyc7XG5cbmNvbnN0IEFycmF5VHlwZSA9IHdpbmRvdy5GbG9hdDY0QXJyYXkgfHwgQXJyYXk7XG5cbmNsYXNzIExVRGVjb21wb3NpdGlvbiB7XG4gIGNvbnN0cnVjdG9yKCBtYXRyaXggKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG4gICAgbGV0IGs7XG5cbiAgICB0aGlzLm1hdHJpeCA9IG1hdHJpeDtcblxuICAgIC8vIFRPRE86IHNpemUhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgdGhpcy5MVSA9IG1hdHJpeC5nZXRBcnJheUNvcHkoKTtcbiAgICBjb25zdCBMVSA9IHRoaXMuTFU7XG4gICAgdGhpcy5tID0gbWF0cml4LmdldFJvd0RpbWVuc2lvbigpO1xuICAgIGNvbnN0IG0gPSB0aGlzLm07XG4gICAgdGhpcy5uID0gbWF0cml4LmdldENvbHVtbkRpbWVuc2lvbigpO1xuICAgIGNvbnN0IG4gPSB0aGlzLm47XG4gICAgdGhpcy5waXYgPSBuZXcgVWludDMyQXJyYXkoIG0gKTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgIHRoaXMucGl2WyBpIF0gPSBpO1xuICAgIH1cbiAgICB0aGlzLnBpdnNpZ24gPSAxO1xuICAgIGNvbnN0IExVY29saiA9IG5ldyBBcnJheVR5cGUoIG0gKTtcblxuICAgIC8vIE91dGVyIGxvb3AuXG5cbiAgICBmb3IgKCBqID0gMDsgaiA8IG47IGorKyApIHtcblxuICAgICAgLy8gTWFrZSBhIGNvcHkgb2YgdGhlIGotdGggY29sdW1uIHRvIGxvY2FsaXplIHJlZmVyZW5jZXMuXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgTFVjb2xqWyBpIF0gPSBMVVsgbWF0cml4LmluZGV4KCBpLCBqICkgXTtcbiAgICAgIH1cblxuICAgICAgLy8gQXBwbHkgcHJldmlvdXMgdHJhbnNmb3JtYXRpb25zLlxuXG4gICAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgLy8gTW9zdCBvZiB0aGUgdGltZSBpcyBzcGVudCBpbiB0aGUgZm9sbG93aW5nIGRvdCBwcm9kdWN0LlxuICAgICAgICBjb25zdCBrbWF4ID0gTWF0aC5taW4oIGksIGogKTtcbiAgICAgICAgbGV0IHMgPSAwLjA7XG4gICAgICAgIGZvciAoIGsgPSAwOyBrIDwga21heDsgaysrICkge1xuICAgICAgICAgIGNvbnN0IGlrID0gbWF0cml4LmluZGV4KCBpLCBrICk7XG4gICAgICAgICAgcyArPSBMVVsgaWsgXSAqIExVY29salsgayBdO1xuICAgICAgICB9XG5cbiAgICAgICAgTFVjb2xqWyBpIF0gLT0gcztcbiAgICAgICAgTFVbIG1hdHJpeC5pbmRleCggaSwgaiApIF0gPSBMVWNvbGpbIGkgXTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBwaXZvdCBhbmQgZXhjaGFuZ2UgaWYgbmVjZXNzYXJ5LlxuXG4gICAgICBsZXQgcCA9IGo7XG4gICAgICBmb3IgKCBpID0gaiArIDE7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgIGlmICggTWF0aC5hYnMoIExVY29salsgaSBdICkgPiBNYXRoLmFicyggTFVjb2xqWyBwIF0gKSApIHtcbiAgICAgICAgICBwID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCBwICE9PSBqICkge1xuICAgICAgICBmb3IgKCBrID0gMDsgayA8IG47IGsrKyApIHtcbiAgICAgICAgICBjb25zdCBwayA9IG1hdHJpeC5pbmRleCggcCwgayApO1xuICAgICAgICAgIGNvbnN0IGprID0gbWF0cml4LmluZGV4KCBqLCBrICk7XG4gICAgICAgICAgY29uc3QgdCA9IExVWyBwayBdO1xuICAgICAgICAgIExVWyBwayBdID0gTFVbIGprIF07XG4gICAgICAgICAgTFVbIGprIF0gPSB0O1xuICAgICAgICB9XG4gICAgICAgIGsgPSB0aGlzLnBpdlsgcCBdO1xuICAgICAgICB0aGlzLnBpdlsgcCBdID0gdGhpcy5waXZbIGogXTtcbiAgICAgICAgdGhpcy5waXZbIGogXSA9IGs7XG4gICAgICAgIHRoaXMucGl2c2lnbiA9IC10aGlzLnBpdnNpZ247XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXB1dGUgbXVsdGlwbGllcnMuXG5cbiAgICAgIGlmICggaiA8IG0gJiYgTFVbIHRoaXMubWF0cml4LmluZGV4KCBqLCBqICkgXSAhPT0gMC4wICkge1xuICAgICAgICBmb3IgKCBpID0gaiArIDE7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgICAgTFVbIG1hdHJpeC5pbmRleCggaSwgaiApIF0gLz0gTFVbIG1hdHJpeC5pbmRleCggaiwgaiApIF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTm9uc2luZ3VsYXIoKSB7XG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMubWF0cml4LmluZGV4KCBqLCBqICk7XG4gICAgICBpZiAoIHRoaXMuTFVbIGluZGV4IF0gPT09IDAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4fVxuICAgKi9cbiAgZ2V0TCgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWF0cml4KCB0aGlzLm0sIHRoaXMubiApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5uOyBqKysgKSB7XG4gICAgICAgIGlmICggaSA+IGogKSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSB0aGlzLkxVWyB0aGlzLm1hdHJpeC5pbmRleCggaSwgaiApIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGkgPT09IGogKSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSAxLjA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSAwLjA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICBnZXRVKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBNYXRyaXgoIHRoaXMubiwgdGhpcy5uICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5uOyBpKysgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgICAgaWYgKCBpIDw9IGogKSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSB0aGlzLkxVWyB0aGlzLm1hdHJpeC5pbmRleCggaSwgaiApIF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVzdWx0LmVudHJpZXNbIHJlc3VsdC5pbmRleCggaSwgaiApIF0gPSAwLjA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtVaW50MzJBcnJheX1cbiAgICovXG4gIGdldFBpdm90KCkge1xuICAgIGNvbnN0IHAgPSBuZXcgVWludDMyQXJyYXkoIHRoaXMubSApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgcFsgaSBdID0gdGhpcy5waXZbIGkgXTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7RmxvYXQ2NEFycmF5fVxuICAgKi9cbiAgZ2V0RG91YmxlUGl2b3QoKSB7XG4gICAgY29uc3QgdmFscyA9IG5ldyBBcnJheVR5cGUoIHRoaXMubSApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubTsgaSsrICkge1xuICAgICAgdmFsc1sgaSBdID0gdGhpcy5waXZbIGkgXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHM7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZGV0KCkge1xuICAgIGlmICggdGhpcy5tICE9PSB0aGlzLm4gKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdNYXRyaXggbXVzdCBiZSBzcXVhcmUuJyApO1xuICAgIH1cbiAgICBsZXQgZCA9IHRoaXMucGl2c2lnbjtcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgIGQgKj0gdGhpcy5MVVsgdGhpcy5tYXRyaXguaW5kZXgoIGosIGogKSBdO1xuICAgIH1cbiAgICByZXR1cm4gZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHJldHVybnMge01hdHJpeH1cbiAgICovXG4gIHNvbHZlKCBtYXRyaXggKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG4gICAgbGV0IGs7XG4gICAgaWYgKCBtYXRyaXguZ2V0Um93RGltZW5zaW9uKCkgIT09IHRoaXMubSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ01hdHJpeCByb3cgZGltZW5zaW9ucyBtdXN0IGFncmVlLicgKTtcbiAgICB9XG4gICAgaWYgKCAhdGhpcy5pc05vbnNpbmd1bGFyKCkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdNYXRyaXggaXMgc2luZ3VsYXIuJyApO1xuICAgIH1cblxuICAgIC8vIENvcHkgcmlnaHQgaGFuZCBzaWRlIHdpdGggcGl2b3RpbmdcbiAgICBjb25zdCBueCA9IG1hdHJpeC5nZXRDb2x1bW5EaW1lbnNpb24oKTtcbiAgICBjb25zdCBYbWF0ID0gbWF0cml4LmdldEFycmF5Um93TWF0cml4KCB0aGlzLnBpdiwgMCwgbnggLSAxICk7XG5cbiAgICAvLyBTb2x2ZSBMKlkgPSBCKHBpdiw6KVxuICAgIGZvciAoIGsgPSAwOyBrIDwgdGhpcy5uOyBrKysgKSB7XG4gICAgICBmb3IgKCBpID0gayArIDE7IGkgPCB0aGlzLm47IGkrKyApIHtcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBueDsgaisrICkge1xuICAgICAgICAgIFhtYXQuZW50cmllc1sgWG1hdC5pbmRleCggaSwgaiApIF0gLT0gWG1hdC5lbnRyaWVzWyBYbWF0LmluZGV4KCBrLCBqICkgXSAqIHRoaXMuTFVbIHRoaXMubWF0cml4LmluZGV4KCBpLCBrICkgXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNvbHZlIFUqWCA9IFk7XG4gICAgZm9yICggayA9IHRoaXMubiAtIDE7IGsgPj0gMDsgay0tICkge1xuICAgICAgZm9yICggaiA9IDA7IGogPCBueDsgaisrICkge1xuICAgICAgICBYbWF0LmVudHJpZXNbIFhtYXQuaW5kZXgoIGssIGogKSBdIC89IHRoaXMuTFVbIHRoaXMubWF0cml4LmluZGV4KCBrLCBrICkgXTtcbiAgICAgIH1cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgazsgaSsrICkge1xuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IG54OyBqKysgKSB7XG4gICAgICAgICAgWG1hdC5lbnRyaWVzWyBYbWF0LmluZGV4KCBpLCBqICkgXSAtPSBYbWF0LmVudHJpZXNbIFhtYXQuaW5kZXgoIGssIGogKSBdICogdGhpcy5MVVsgdGhpcy5tYXRyaXguaW5kZXgoIGksIGsgKSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBYbWF0O1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ0xVRGVjb21wb3NpdGlvbicsIExVRGVjb21wb3NpdGlvbiApO1xuXG5leHBvcnQgZGVmYXVsdCBMVURlY29tcG9zaXRpb247Il0sIm5hbWVzIjpbImRvdCIsIk1hdHJpeCIsIkFycmF5VHlwZSIsIndpbmRvdyIsIkZsb2F0NjRBcnJheSIsIkFycmF5IiwiTFVEZWNvbXBvc2l0aW9uIiwiaXNOb25zaW5ndWxhciIsImoiLCJuIiwiaW5kZXgiLCJtYXRyaXgiLCJMVSIsImdldEwiLCJyZXN1bHQiLCJtIiwiaSIsImVudHJpZXMiLCJnZXRVIiwiZ2V0UGl2b3QiLCJwIiwiVWludDMyQXJyYXkiLCJwaXYiLCJnZXREb3VibGVQaXZvdCIsInZhbHMiLCJkZXQiLCJFcnJvciIsImQiLCJwaXZzaWduIiwic29sdmUiLCJrIiwiZ2V0Um93RGltZW5zaW9uIiwibngiLCJnZXRDb2x1bW5EaW1lbnNpb24iLCJYbWF0IiwiZ2V0QXJyYXlSb3dNYXRyaXgiLCJjb25zdHJ1Y3RvciIsImdldEFycmF5Q29weSIsIkxVY29saiIsImttYXgiLCJNYXRoIiwibWluIiwicyIsImlrIiwiYWJzIiwicGsiLCJqayIsInQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLFlBQVksY0FBYztBQUVqQyxNQUFNQyxZQUFZQyxPQUFPQyxZQUFZLElBQUlDO0FBRXpDLElBQUEsQUFBTUMsa0JBQU4sTUFBTUE7SUE4RUo7Ozs7R0FJQyxHQUNEQyxnQkFBZ0I7UUFDZCxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNDLENBQUMsRUFBRUQsSUFBTTtZQUNqQyxNQUFNRSxRQUFRLElBQUksQ0FBQ0MsTUFBTSxDQUFDRCxLQUFLLENBQUVGLEdBQUdBO1lBQ3BDLElBQUssSUFBSSxDQUFDSSxFQUFFLENBQUVGLE1BQU8sS0FBSyxHQUFJO2dCQUM1QixPQUFPO1lBQ1Q7UUFDRjtRQUNBLE9BQU87SUFDVDtJQUVBOzs7O0dBSUMsR0FDREcsT0FBTztRQUNMLE1BQU1DLFNBQVMsSUFBSWIsT0FBUSxJQUFJLENBQUNjLENBQUMsRUFBRSxJQUFJLENBQUNOLENBQUM7UUFDekMsSUFBTSxJQUFJTyxJQUFJLEdBQUdBLElBQUksSUFBSSxDQUFDRCxDQUFDLEVBQUVDLElBQU07WUFDakMsSUFBTSxJQUFJUixJQUFJLEdBQUdBLElBQUksSUFBSSxDQUFDQyxDQUFDLEVBQUVELElBQU07Z0JBQ2pDLElBQUtRLElBQUlSLEdBQUk7b0JBQ1hNLE9BQU9HLE9BQU8sQ0FBRUgsT0FBT0osS0FBSyxDQUFFTSxHQUFHUixHQUFLLEdBQUcsSUFBSSxDQUFDSSxFQUFFLENBQUUsSUFBSSxDQUFDRCxNQUFNLENBQUNELEtBQUssQ0FBRU0sR0FBR1IsR0FBSztnQkFDL0UsT0FDSyxJQUFLUSxNQUFNUixHQUFJO29CQUNsQk0sT0FBT0csT0FBTyxD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