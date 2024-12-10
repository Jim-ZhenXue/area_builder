// Copyright 2021-2023, University of Colorado Boulder
/**
 * Arbitrary-precision LU Decomposition using decimal.js and copy-pasted from LUDecomposition.
 * This is a copy-paste implementation so that the performance characteristics of LUDecomposition are not disturbed.
 * This file should be maintained with LUDecomposition.js
 *
 * This module requires the presence of the preload Decimal.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import dot from './dot.js';
let LUDecompositionDecimal = class LUDecompositionDecimal {
    /**
   * @public
   *
   * @returns {boolean}
   */ isNonsingular() {
        for(let j = 0; j < this.n; j++){
            const index = this.matrix.index(j, j);
            if (this.LU[index].isZero()) {
                return false;
            }
        }
        return true;
    }
    /**
   * @public
   *
   * @param {Matrix} matrix
   * @param {constructor} Decimal - from decimal library
   * @returns {Matrix}
   */ solve(matrix, Decimal) {
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
        const entries = [];
        Xmat.entries.forEach((e)=>entries.push(new Decimal(e)));
        // Solve L*Y = B(piv,:)
        for(k = 0; k < this.n; k++){
            for(i = k + 1; i < this.n; i++){
                for(j = 0; j < nx; j++){
                    entries[Xmat.index(i, j)] = entries[Xmat.index(i, j)].minus(entries[Xmat.index(k, j)].times(this.LU[this.matrix.index(i, k)]));
                }
            }
        }
        // Solve U*X = Y;
        for(k = this.n - 1; k >= 0; k--){
            for(j = 0; j < nx; j++){
                entries[Xmat.index(k, j)] = entries[Xmat.index(k, j)].dividedBy(this.LU[this.matrix.index(k, k)]);
            }
            for(i = 0; i < k; i++){
                for(j = 0; j < nx; j++){
                    entries[Xmat.index(i, j)] = entries[Xmat.index(i, j)].minus(entries[Xmat.index(k, j)].times(this.LU[this.matrix.index(i, k)]));
                }
            }
        }
        Xmat.entries = entries.map((e)=>e.toNumber());
        return Xmat;
    }
    /**
   * @param matrix
   * @param {constructor} Decimal - from decimal library
   */ constructor(matrix, Decimal){
        let i;
        let j;
        let k;
        this.matrix = matrix;
        // TODO: size! https://github.com/phetsims/dot/issues/96
        this.LU = [];
        matrix.entries.forEach((entry)=>{
            this.LU.push(new Decimal(entry));
        });
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
        const LUcolj = new Array(m);
        // Outer loop.
        for(j = 0; j < n; j++){
            // Make a copy of the j-th column to localize references.
            for(i = 0; i < m; i++){
                LUcolj[i] = new Decimal(LU[matrix.index(i, j)]);
            }
            // Apply previous transformations.
            for(i = 0; i < m; i++){
                // Most of the time is spent in the following dot product.
                const kmax = Math.min(i, j);
                let s = new Decimal(0);
                for(k = 0; k < kmax; k++){
                    const ik = matrix.index(i, k);
                    const a = new Decimal(LU[ik]);
                    const b = LUcolj[k];
                    s = s.plus(a.times(b));
                }
                LUcolj[i] = LUcolj[i].minus(s);
                LU[matrix.index(i, j)] = LUcolj[i];
            }
            // Find pivot and exchange if necessary.
            let p = j;
            for(i = j + 1; i < m; i++){
                if (LUcolj[i].abs() > LUcolj[p].abs()) {
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
            if (j < m && !LU[this.matrix.index(j, j)].isZero()) {
                for(i = j + 1; i < m; i++){
                    LU[matrix.index(i, j)] = LU[matrix.index(i, j)].dividedBy(LU[matrix.index(j, j)]);
                }
            }
        }
    }
};
dot.register('LUDecompositionDecimal', LUDecompositionDecimal);
export default LUDecompositionDecimal;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9MVURlY29tcG9zaXRpb25EZWNpbWFsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFyYml0cmFyeS1wcmVjaXNpb24gTFUgRGVjb21wb3NpdGlvbiB1c2luZyBkZWNpbWFsLmpzIGFuZCBjb3B5LXBhc3RlZCBmcm9tIExVRGVjb21wb3NpdGlvbi5cbiAqIFRoaXMgaXMgYSBjb3B5LXBhc3RlIGltcGxlbWVudGF0aW9uIHNvIHRoYXQgdGhlIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiBMVURlY29tcG9zaXRpb24gYXJlIG5vdCBkaXN0dXJiZWQuXG4gKiBUaGlzIGZpbGUgc2hvdWxkIGJlIG1haW50YWluZWQgd2l0aCBMVURlY29tcG9zaXRpb24uanNcbiAqXG4gKiBUaGlzIG1vZHVsZSByZXF1aXJlcyB0aGUgcHJlc2VuY2Ugb2YgdGhlIHByZWxvYWQgRGVjaW1hbC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuXG5jbGFzcyBMVURlY29tcG9zaXRpb25EZWNpbWFsIHtcblxuICAvKipcbiAgICogQHBhcmFtIG1hdHJpeFxuICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBEZWNpbWFsIC0gZnJvbSBkZWNpbWFsIGxpYnJhcnlcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBtYXRyaXgsIERlY2ltYWwgKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG4gICAgbGV0IGs7XG5cbiAgICB0aGlzLm1hdHJpeCA9IG1hdHJpeDtcblxuICAgIC8vIFRPRE86IHNpemUhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgdGhpcy5MVSA9IFtdO1xuICAgIG1hdHJpeC5lbnRyaWVzLmZvckVhY2goIGVudHJ5ID0+IHtcbiAgICAgIHRoaXMuTFUucHVzaCggbmV3IERlY2ltYWwoIGVudHJ5ICkgKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBMVSA9IHRoaXMuTFU7XG4gICAgdGhpcy5tID0gbWF0cml4LmdldFJvd0RpbWVuc2lvbigpO1xuICAgIGNvbnN0IG0gPSB0aGlzLm07XG4gICAgdGhpcy5uID0gbWF0cml4LmdldENvbHVtbkRpbWVuc2lvbigpO1xuICAgIGNvbnN0IG4gPSB0aGlzLm47XG4gICAgdGhpcy5waXYgPSBuZXcgVWludDMyQXJyYXkoIG0gKTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IG07IGkrKyApIHtcbiAgICAgIHRoaXMucGl2WyBpIF0gPSBpO1xuICAgIH1cbiAgICB0aGlzLnBpdnNpZ24gPSAxO1xuICAgIGNvbnN0IExVY29saiA9IG5ldyBBcnJheSggbSApO1xuXG4gICAgLy8gT3V0ZXIgbG9vcC5cblxuICAgIGZvciAoIGogPSAwOyBqIDwgbjsgaisrICkge1xuXG4gICAgICAvLyBNYWtlIGEgY29weSBvZiB0aGUgai10aCBjb2x1bW4gdG8gbG9jYWxpemUgcmVmZXJlbmNlcy5cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbTsgaSsrICkge1xuICAgICAgICBMVWNvbGpbIGkgXSA9IG5ldyBEZWNpbWFsKCBMVVsgbWF0cml4LmluZGV4KCBpLCBqICkgXSApO1xuICAgICAgfVxuXG4gICAgICAvLyBBcHBseSBwcmV2aW91cyB0cmFuc2Zvcm1hdGlvbnMuXG5cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgbTsgaSsrICkge1xuICAgICAgICAvLyBNb3N0IG9mIHRoZSB0aW1lIGlzIHNwZW50IGluIHRoZSBmb2xsb3dpbmcgZG90IHByb2R1Y3QuXG4gICAgICAgIGNvbnN0IGttYXggPSBNYXRoLm1pbiggaSwgaiApO1xuICAgICAgICBsZXQgcyA9IG5ldyBEZWNpbWFsKCAwICk7XG4gICAgICAgIGZvciAoIGsgPSAwOyBrIDwga21heDsgaysrICkge1xuICAgICAgICAgIGNvbnN0IGlrID0gbWF0cml4LmluZGV4KCBpLCBrICk7XG4gICAgICAgICAgY29uc3QgYSA9IG5ldyBEZWNpbWFsKCBMVVsgaWsgXSApO1xuICAgICAgICAgIGNvbnN0IGIgPSBMVWNvbGpbIGsgXTtcbiAgICAgICAgICBzID0gcy5wbHVzKCBhLnRpbWVzKCBiICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIExVY29salsgaSBdID0gTFVjb2xqWyBpIF0ubWludXMoIHMgKTtcbiAgICAgICAgTFVbIG1hdHJpeC5pbmRleCggaSwgaiApIF0gPSBMVWNvbGpbIGkgXTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluZCBwaXZvdCBhbmQgZXhjaGFuZ2UgaWYgbmVjZXNzYXJ5LlxuXG4gICAgICBsZXQgcCA9IGo7XG4gICAgICBmb3IgKCBpID0gaiArIDE7IGkgPCBtOyBpKysgKSB7XG4gICAgICAgIGlmICggTFVjb2xqWyBpIF0uYWJzKCkgPiBMVWNvbGpbIHAgXS5hYnMoKSApIHtcbiAgICAgICAgICBwID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCBwICE9PSBqICkge1xuICAgICAgICBmb3IgKCBrID0gMDsgayA8IG47IGsrKyApIHtcbiAgICAgICAgICBjb25zdCBwayA9IG1hdHJpeC5pbmRleCggcCwgayApO1xuICAgICAgICAgIGNvbnN0IGprID0gbWF0cml4LmluZGV4KCBqLCBrICk7XG4gICAgICAgICAgY29uc3QgdCA9IExVWyBwayBdO1xuICAgICAgICAgIExVWyBwayBdID0gTFVbIGprIF07XG4gICAgICAgICAgTFVbIGprIF0gPSB0O1xuICAgICAgICB9XG4gICAgICAgIGsgPSB0aGlzLnBpdlsgcCBdO1xuICAgICAgICB0aGlzLnBpdlsgcCBdID0gdGhpcy5waXZbIGogXTtcbiAgICAgICAgdGhpcy5waXZbIGogXSA9IGs7XG4gICAgICAgIHRoaXMucGl2c2lnbiA9IC10aGlzLnBpdnNpZ247XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXB1dGUgbXVsdGlwbGllcnMuXG5cbiAgICAgIGlmICggaiA8IG0gJiYgIUxVWyB0aGlzLm1hdHJpeC5pbmRleCggaiwgaiApIF0uaXNaZXJvKCkgKSB7XG4gICAgICAgIGZvciAoIGkgPSBqICsgMTsgaSA8IG07IGkrKyApIHtcbiAgICAgICAgICBMVVsgbWF0cml4LmluZGV4KCBpLCBqICkgXSA9IExVWyBtYXRyaXguaW5kZXgoIGksIGogKSBdLmRpdmlkZWRCeSggTFVbIG1hdHJpeC5pbmRleCggaiwgaiApIF0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNOb25zaW5ndWxhcigpIHtcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLm47IGorKyApIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tYXRyaXguaW5kZXgoIGosIGogKTtcbiAgICAgIGlmICggdGhpcy5MVVsgaW5kZXggXS5pc1plcm8oKSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXhcbiAgICogQHBhcmFtIHtjb25zdHJ1Y3Rvcn0gRGVjaW1hbCAtIGZyb20gZGVjaW1hbCBsaWJyYXJ5XG4gICAqIEByZXR1cm5zIHtNYXRyaXh9XG4gICAqL1xuICBzb2x2ZSggbWF0cml4LCBEZWNpbWFsICkge1xuICAgIGxldCBpO1xuICAgIGxldCBqO1xuICAgIGxldCBrO1xuICAgIGlmICggbWF0cml4LmdldFJvd0RpbWVuc2lvbigpICE9PSB0aGlzLm0gKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdNYXRyaXggcm93IGRpbWVuc2lvbnMgbXVzdCBhZ3JlZS4nICk7XG4gICAgfVxuICAgIGlmICggIXRoaXMuaXNOb25zaW5ndWxhcigpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTWF0cml4IGlzIHNpbmd1bGFyLicgKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHJpZ2h0IGhhbmQgc2lkZSB3aXRoIHBpdm90aW5nXG4gICAgY29uc3QgbnggPSBtYXRyaXguZ2V0Q29sdW1uRGltZW5zaW9uKCk7XG4gICAgY29uc3QgWG1hdCA9IG1hdHJpeC5nZXRBcnJheVJvd01hdHJpeCggdGhpcy5waXYsIDAsIG54IC0gMSApO1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBYbWF0LmVudHJpZXMuZm9yRWFjaCggZSA9PiBlbnRyaWVzLnB1c2goIG5ldyBEZWNpbWFsKCBlICkgKSApO1xuXG4gICAgLy8gU29sdmUgTCpZID0gQihwaXYsOilcbiAgICBmb3IgKCBrID0gMDsgayA8IHRoaXMubjsgaysrICkge1xuICAgICAgZm9yICggaSA9IGsgKyAxOyBpIDwgdGhpcy5uOyBpKysgKSB7XG4gICAgICAgIGZvciAoIGogPSAwOyBqIDwgbng7IGorKyApIHtcbiAgICAgICAgICBlbnRyaWVzWyBYbWF0LmluZGV4KCBpLCBqICkgXSA9IGVudHJpZXNbIFhtYXQuaW5kZXgoIGksIGogKSBdLm1pbnVzKCBlbnRyaWVzWyBYbWF0LmluZGV4KCBrLCBqICkgXS50aW1lcyggdGhpcy5MVVsgdGhpcy5tYXRyaXguaW5kZXgoIGksIGsgKSBdICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNvbHZlIFUqWCA9IFk7XG4gICAgZm9yICggayA9IHRoaXMubiAtIDE7IGsgPj0gMDsgay0tICkge1xuICAgICAgZm9yICggaiA9IDA7IGogPCBueDsgaisrICkge1xuICAgICAgICBlbnRyaWVzWyBYbWF0LmluZGV4KCBrLCBqICkgXSA9IGVudHJpZXNbIFhtYXQuaW5kZXgoIGssIGogKSBdLmRpdmlkZWRCeSggdGhpcy5MVVsgdGhpcy5tYXRyaXguaW5kZXgoIGssIGsgKSBdICk7XG4gICAgICB9XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGs7IGkrKyApIHtcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBueDsgaisrICkge1xuICAgICAgICAgIGVudHJpZXNbIFhtYXQuaW5kZXgoIGksIGogKSBdID0gZW50cmllc1sgWG1hdC5pbmRleCggaSwgaiApIF0ubWludXMoIGVudHJpZXNbIFhtYXQuaW5kZXgoIGssIGogKSBdLnRpbWVzKCB0aGlzLkxVWyB0aGlzLm1hdHJpeC5pbmRleCggaSwgayApIF0gKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgWG1hdC5lbnRyaWVzID0gZW50cmllcy5tYXAoIGUgPT4gZS50b051bWJlcigpICk7XG4gICAgcmV0dXJuIFhtYXQ7XG4gIH1cbn1cblxuZG90LnJlZ2lzdGVyKCAnTFVEZWNvbXBvc2l0aW9uRGVjaW1hbCcsIExVRGVjb21wb3NpdGlvbkRlY2ltYWwgKTtcblxuZXhwb3J0IGRlZmF1bHQgTFVEZWNvbXBvc2l0aW9uRGVjaW1hbDsiXSwibmFtZXMiOlsiZG90IiwiTFVEZWNvbXBvc2l0aW9uRGVjaW1hbCIsImlzTm9uc2luZ3VsYXIiLCJqIiwibiIsImluZGV4IiwibWF0cml4IiwiTFUiLCJpc1plcm8iLCJzb2x2ZSIsIkRlY2ltYWwiLCJpIiwiayIsImdldFJvd0RpbWVuc2lvbiIsIm0iLCJFcnJvciIsIm54IiwiZ2V0Q29sdW1uRGltZW5zaW9uIiwiWG1hdCIsImdldEFycmF5Um93TWF0cml4IiwicGl2IiwiZW50cmllcyIsImZvckVhY2giLCJlIiwicHVzaCIsIm1pbnVzIiwidGltZXMiLCJkaXZpZGVkQnkiLCJtYXAiLCJ0b051bWJlciIsImNvbnN0cnVjdG9yIiwiZW50cnkiLCJVaW50MzJBcnJheSIsInBpdnNpZ24iLCJMVWNvbGoiLCJBcnJheSIsImttYXgiLCJNYXRoIiwibWluIiwicyIsImlrIiwiYSIsImIiLCJwbHVzIiwi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