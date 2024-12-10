// Copyright 2023-2024, University of Colorado Boulder
/**
 * Handles a univariate polynomial (a polynomial with one variable), like 2x^2 + 6x + 4.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Complex from './Complex.js';
import dot from './dot.js';
import EigenvalueDecomposition from './EigenvalueDecomposition.js';
import Matrix from './Matrix.js';
import QRDecomposition from './QRDecomposition.js';
let UnivariatePolynomial = class UnivariatePolynomial {
    plus(polynomial) {
        const coefficients = [];
        for(let i = 0; i < Math.max(this.coefficients.length, polynomial.coefficients.length); i++){
            coefficients.push(this.getCoefficient(i) + polynomial.getCoefficient(i));
        }
        return new UnivariatePolynomial(coefficients);
    }
    minus(polynomial) {
        const coefficients = [];
        for(let i = 0; i < Math.max(this.coefficients.length, polynomial.coefficients.length); i++){
            coefficients.push(this.getCoefficient(i) - polynomial.getCoefficient(i));
        }
        return new UnivariatePolynomial(coefficients);
    }
    times(polynomial) {
        const coefficients = [];
        while(coefficients.length < this.coefficients.length + polynomial.coefficients.length - 1){
            coefficients.push(0);
        }
        for(let i = 0; i < this.coefficients.length; i++){
            for(let j = 0; j < polynomial.coefficients.length; j++){
                coefficients[i + j] += this.getCoefficient(i) * polynomial.getCoefficient(j);
            }
        }
        return new UnivariatePolynomial(coefficients);
    }
    dividedBy(polynomial) {
        let q = new UnivariatePolynomial([]);
        let r = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
        const d = polynomial.degree;
        const c = polynomial.coefficients[polynomial.coefficients.length - 1];
        while(r.degree >= d){
            const s = UnivariatePolynomial.singleCoefficient(r.getCoefficient(r.degree) / c, r.degree - d);
            q = q.plus(s);
            r = r.minus(s.times(polynomial));
        }
        return {
            quotient: q,
            remainder: r
        };
    }
    gcd(polynomial) {
        let a = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
        let b = polynomial;
        while(!b.isZero()){
            const t = b;
            b = a.dividedBy(b).remainder;
            a = t;
        }
        return a;
    }
    equals(polynomial) {
        return this.coefficients.length === polynomial.coefficients.length && this.coefficients.every((coefficient, i)=>coefficient === polynomial.coefficients[i]);
    }
    getCoefficient(degree) {
        return degree < this.coefficients.length ? this.coefficients[degree] : 0;
    }
    get degree() {
        return this.coefficients.length - 1;
    }
    isZero() {
        return this.coefficients.length === 0;
    }
    getMonicPolynomial() {
        if (this.isZero()) {
            return this;
        } else {
            const leadingCoefficient = this.coefficients[this.coefficients.length - 1];
            return new UnivariatePolynomial(this.coefficients.map((coefficient)=>coefficient / leadingCoefficient));
        }
    }
    evaluate(x) {
        // https://en.wikipedia.org/wiki/Horner%27s_method
        let result = this.coefficients[this.coefficients.length - 1];
        for(let i = this.coefficients.length - 2; i >= 0; i--){
            result = result * x + this.coefficients[i];
        }
        return result;
    }
    evaluateComplex(x) {
        // https://en.wikipedia.org/wiki/Horner%27s_method
        let result = Complex.real(this.coefficients[this.coefficients.length - 1]);
        for(let i = this.coefficients.length - 2; i >= 0; i--){
            result = result.times(x).plus(Complex.real(this.coefficients[i]));
        }
        return result;
    }
    getRoots() {
        if (this.isZero() || this.degree === 0) {
            // TODO: how to handle? https://github.com/phetsims/kite/issues/97
            return [];
        } else if (this.degree === 1) {
            return [
                Complex.real(-this.coefficients[0] / this.coefficients[1])
            ];
        } else if (this.coefficients[0] === 0) {
            // x=0 is a root!
            const roots = new UnivariatePolynomial(this.coefficients.slice(1)).getRoots();
            if (!roots.some((root)=>root.equalsEpsilon(Complex.real(0), 1e-10))) {
                roots.push(Complex.real(0));
            }
            return roots;
        } else if (this.degree === 2) {
            return Complex.solveQuadraticRoots(Complex.real(this.coefficients[2]), Complex.real(this.coefficients[1]), Complex.real(this.coefficients[0]));
        } else if (this.degree === 3) {
            return Complex.solveCubicRoots(Complex.real(this.coefficients[3]), Complex.real(this.coefficients[2]), Complex.real(this.coefficients[1]), Complex.real(this.coefficients[0]));
        } else {
            // Use the eigenvalues of the companion matrix, since it is the zeros of the characteristic polynomial
            // https://en.wikipedia.org/wiki/Companion_matrix
            const companionMatrix = new Matrix(this.degree, this.degree);
            for(let i = 0; i < this.degree; i++){
                if (i < this.degree - 1) {
                    companionMatrix.set(i + 1, i, 1);
                }
                companionMatrix.set(i, this.degree - 1, -this.coefficients[i] / this.coefficients[this.degree]);
            }
            console.log(companionMatrix.toString());
            let matrix = companionMatrix;
            const epsilon = 1e-13;
            // TODO: custom number of steps? https://github.com/phetsims/kite/issues/97
            for(let i = 0; i < 500; i++){
                const qr = new QRDecomposition(matrix);
                matrix = qr.getR().times(qr.getQ());
                if (i % 10 === 0) {
                    let maxLowerTriangular = 0;
                    for(let i = 0; i < this.degree; i++){
                        for(let j = 0; j < i; j++){
                            maxLowerTriangular = Math.max(maxLowerTriangular, Math.abs(matrix.get(i, j)));
                        }
                    }
                    // TODO: 1000 seems excessive OR not enough, depending on the polynomial? https://github.com/phetsims/kite/issues/97
                    if (maxLowerTriangular < epsilon || i > 1000) {
                        break;
                    }
                }
            }
            const qrValues = _.range(0, this.degree).map((i)=>Complex.real(matrix.get(i, i)));
            const decomp = new EigenvalueDecomposition(companionMatrix);
            // @ts-expect-error
            const realValues = decomp.getRealEigenvalues();
            // @ts-expect-error
            const imaginaryValues = decomp.getImagEigenvalues();
            const decompValues = _.range(0, this.degree).map((i)=>new Complex(realValues[i], imaginaryValues[i]));
            // TODO: complex values! We seem to be failing here https://github.com/phetsims/kite/issues/97
            return qrValues ? qrValues : decompValues;
        }
    }
    static singleCoefficient(coefficient, degree) {
        const coefficients = [];
        while(coefficients.length < degree){
            coefficients.push(0);
        }
        coefficients.push(coefficient);
        return new UnivariatePolynomial(coefficients);
    }
    // coefficients indexed by degree, so e.g. 2x^2 + 6x + 4 would be input as [ 4, 6, 2 ], because
    // coefficients[ 2 ] would be the coefficient of x^2, etc.
    constructor(coefficients){
        // Get rid of "leading" zero coefficients
        const nontrivialCoefficients = coefficients.slice();
        while(nontrivialCoefficients.length && nontrivialCoefficients[nontrivialCoefficients.length - 1] === 0){
            nontrivialCoefficients.pop();
        }
        this.coefficients = nontrivialCoefficients;
    }
};
UnivariatePolynomial.ZERO = new UnivariatePolynomial([]);
dot.register('UnivariatePolynomial', UnivariatePolynomial);
export default UnivariatePolynomial;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Vbml2YXJpYXRlUG9seW5vbWlhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIYW5kbGVzIGEgdW5pdmFyaWF0ZSBwb2x5bm9taWFsIChhIHBvbHlub21pYWwgd2l0aCBvbmUgdmFyaWFibGUpLCBsaWtlIDJ4XjIgKyA2eCArIDQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBDb21wbGV4IGZyb20gJy4vQ29tcGxleC5qcyc7XG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBFaWdlbnZhbHVlRGVjb21wb3NpdGlvbiBmcm9tICcuL0VpZ2VudmFsdWVEZWNvbXBvc2l0aW9uLmpzJztcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnO1xuaW1wb3J0IFFSRGVjb21wb3NpdGlvbiBmcm9tICcuL1FSRGVjb21wb3NpdGlvbi5qcyc7XG5cbmNsYXNzIFVuaXZhcmlhdGVQb2x5bm9taWFsIHtcblxuICBwdWJsaWMgcmVhZG9ubHkgY29lZmZpY2llbnRzOiBudW1iZXJbXTtcblxuICAvLyBjb2VmZmljaWVudHMgaW5kZXhlZCBieSBkZWdyZWUsIHNvIGUuZy4gMnheMiArIDZ4ICsgNCB3b3VsZCBiZSBpbnB1dCBhcyBbIDQsIDYsIDIgXSwgYmVjYXVzZVxuICAvLyBjb2VmZmljaWVudHNbIDIgXSB3b3VsZCBiZSB0aGUgY29lZmZpY2llbnQgb2YgeF4yLCBldGMuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29lZmZpY2llbnRzOiBudW1iZXJbXSApIHtcblxuICAgIC8vIEdldCByaWQgb2YgXCJsZWFkaW5nXCIgemVybyBjb2VmZmljaWVudHNcbiAgICBjb25zdCBub250cml2aWFsQ29lZmZpY2llbnRzID0gY29lZmZpY2llbnRzLnNsaWNlKCk7XG4gICAgd2hpbGUgKCBub250cml2aWFsQ29lZmZpY2llbnRzLmxlbmd0aCAmJiBub250cml2aWFsQ29lZmZpY2llbnRzWyBub250cml2aWFsQ29lZmZpY2llbnRzLmxlbmd0aCAtIDEgXSA9PT0gMCApIHtcbiAgICAgIG5vbnRyaXZpYWxDb2VmZmljaWVudHMucG9wKCk7XG4gICAgfVxuXG4gICAgdGhpcy5jb2VmZmljaWVudHMgPSBub250cml2aWFsQ29lZmZpY2llbnRzO1xuICB9XG5cbiAgcHVibGljIHBsdXMoIHBvbHlub21pYWw6IFVuaXZhcmlhdGVQb2x5bm9taWFsICk6IFVuaXZhcmlhdGVQb2x5bm9taWFsIHtcbiAgICBjb25zdCBjb2VmZmljaWVudHMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNYXRoLm1heCggdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoLCBwb2x5bm9taWFsLmNvZWZmaWNpZW50cy5sZW5ndGggKTsgaSsrICkge1xuICAgICAgY29lZmZpY2llbnRzLnB1c2goIHRoaXMuZ2V0Q29lZmZpY2llbnQoIGkgKSArIHBvbHlub21pYWwuZ2V0Q29lZmZpY2llbnQoIGkgKSApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFVuaXZhcmlhdGVQb2x5bm9taWFsKCBjb2VmZmljaWVudHMgKTtcbiAgfVxuXG4gIHB1YmxpYyBtaW51cyggcG9seW5vbWlhbDogVW5pdmFyaWF0ZVBvbHlub21pYWwgKTogVW5pdmFyaWF0ZVBvbHlub21pYWwge1xuICAgIGNvbnN0IGNvZWZmaWNpZW50cyA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE1hdGgubWF4KCB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGgsIHBvbHlub21pYWwuY29lZmZpY2llbnRzLmxlbmd0aCApOyBpKysgKSB7XG4gICAgICBjb2VmZmljaWVudHMucHVzaCggdGhpcy5nZXRDb2VmZmljaWVudCggaSApIC0gcG9seW5vbWlhbC5nZXRDb2VmZmljaWVudCggaSApICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVW5pdmFyaWF0ZVBvbHlub21pYWwoIGNvZWZmaWNpZW50cyApO1xuICB9XG5cbiAgcHVibGljIHRpbWVzKCBwb2x5bm9taWFsOiBVbml2YXJpYXRlUG9seW5vbWlhbCApOiBVbml2YXJpYXRlUG9seW5vbWlhbCB7XG4gICAgY29uc3QgY29lZmZpY2llbnRzID0gW107XG4gICAgd2hpbGUgKCBjb2VmZmljaWVudHMubGVuZ3RoIDwgdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoICsgcG9seW5vbWlhbC5jb2VmZmljaWVudHMubGVuZ3RoIC0gMSApIHtcbiAgICAgIGNvZWZmaWNpZW50cy5wdXNoKCAwICk7XG4gICAgfVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgcG9seW5vbWlhbC5jb2VmZmljaWVudHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvZWZmaWNpZW50c1sgaSArIGogXSArPSB0aGlzLmdldENvZWZmaWNpZW50KCBpICkgKiBwb2x5bm9taWFsLmdldENvZWZmaWNpZW50KCBqICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVW5pdmFyaWF0ZVBvbHlub21pYWwoIGNvZWZmaWNpZW50cyApO1xuICB9XG5cbiAgcHVibGljIGRpdmlkZWRCeSggcG9seW5vbWlhbDogVW5pdmFyaWF0ZVBvbHlub21pYWwgKTogeyBxdW90aWVudDogVW5pdmFyaWF0ZVBvbHlub21pYWw7IHJlbWFpbmRlcjogVW5pdmFyaWF0ZVBvbHlub21pYWwgfSB7XG4gICAgbGV0IHEgPSBuZXcgVW5pdmFyaWF0ZVBvbHlub21pYWwoIFtdICk7XG4gICAgbGV0IHI6IFVuaXZhcmlhdGVQb2x5bm9taWFsID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgY29uc3QgZCA9IHBvbHlub21pYWwuZGVncmVlO1xuICAgIGNvbnN0IGMgPSBwb2x5bm9taWFsLmNvZWZmaWNpZW50c1sgcG9seW5vbWlhbC5jb2VmZmljaWVudHMubGVuZ3RoIC0gMSBdO1xuICAgIHdoaWxlICggci5kZWdyZWUgPj0gZCApIHtcbiAgICAgIGNvbnN0IHMgPSBVbml2YXJpYXRlUG9seW5vbWlhbC5zaW5nbGVDb2VmZmljaWVudCggci5nZXRDb2VmZmljaWVudCggci5kZWdyZWUgKSAvIGMsIHIuZGVncmVlIC0gZCApO1xuICAgICAgcSA9IHEucGx1cyggcyApO1xuICAgICAgciA9IHIubWludXMoIHMudGltZXMoIHBvbHlub21pYWwgKSApO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcXVvdGllbnQ6IHEsXG4gICAgICByZW1haW5kZXI6IHJcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGdjZCggcG9seW5vbWlhbDogVW5pdmFyaWF0ZVBvbHlub21pYWwgKTogVW5pdmFyaWF0ZVBvbHlub21pYWwge1xuICAgIGxldCBhOiBVbml2YXJpYXRlUG9seW5vbWlhbCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC10aGlzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgIGxldCBiID0gcG9seW5vbWlhbDtcbiAgICB3aGlsZSAoICFiLmlzWmVybygpICkge1xuICAgICAgY29uc3QgdCA9IGI7XG4gICAgICBiID0gYS5kaXZpZGVkQnkoIGIgKS5yZW1haW5kZXI7XG4gICAgICBhID0gdDtcbiAgICB9XG4gICAgcmV0dXJuIGE7XG4gIH1cblxuICBwdWJsaWMgZXF1YWxzKCBwb2x5bm9taWFsOiBVbml2YXJpYXRlUG9seW5vbWlhbCApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoID09PSBwb2x5bm9taWFsLmNvZWZmaWNpZW50cy5sZW5ndGggJiYgdGhpcy5jb2VmZmljaWVudHMuZXZlcnkoICggY29lZmZpY2llbnQsIGkgKSA9PiBjb2VmZmljaWVudCA9PT0gcG9seW5vbWlhbC5jb2VmZmljaWVudHNbIGkgXSApO1xuICB9XG5cbiAgcHVibGljIGdldENvZWZmaWNpZW50KCBkZWdyZWU6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiBkZWdyZWUgPCB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggPyB0aGlzLmNvZWZmaWNpZW50c1sgZGVncmVlIF0gOiAwO1xuICB9XG5cbiAgcHVibGljIGdldCBkZWdyZWUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb2VmZmljaWVudHMubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIHB1YmxpYyBpc1plcm8oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRNb25pY1BvbHlub21pYWwoKTogVW5pdmFyaWF0ZVBvbHlub21pYWwge1xuICAgIGlmICggdGhpcy5pc1plcm8oKSApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGxlYWRpbmdDb2VmZmljaWVudCA9IHRoaXMuY29lZmZpY2llbnRzWyB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAxIF07XG4gICAgICByZXR1cm4gbmV3IFVuaXZhcmlhdGVQb2x5bm9taWFsKCB0aGlzLmNvZWZmaWNpZW50cy5tYXAoIGNvZWZmaWNpZW50ID0+IGNvZWZmaWNpZW50IC8gbGVhZGluZ0NvZWZmaWNpZW50ICkgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZXZhbHVhdGUoIHg6IG51bWJlciApOiBudW1iZXIge1xuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hvcm5lciUyN3NfbWV0aG9kXG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuY29lZmZpY2llbnRzWyB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAxIF07XG4gICAgZm9yICggbGV0IGkgPSB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAyOyBpID49IDA7IGktLSApIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdCAqIHggKyB0aGlzLmNvZWZmaWNpZW50c1sgaSBdO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHVibGljIGV2YWx1YXRlQ29tcGxleCggeDogQ29tcGxleCApOiBDb21wbGV4IHtcbiAgICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ib3JuZXIlMjdzX21ldGhvZFxuICAgIGxldCByZXN1bHQgPSBDb21wbGV4LnJlYWwoIHRoaXMuY29lZmZpY2llbnRzWyB0aGlzLmNvZWZmaWNpZW50cy5sZW5ndGggLSAxIF0gKTtcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuY29lZmZpY2llbnRzLmxlbmd0aCAtIDI7IGkgPj0gMDsgaS0tICkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnRpbWVzKCB4ICkucGx1cyggQ29tcGxleC5yZWFsKCB0aGlzLmNvZWZmaWNpZW50c1sgaSBdICkgKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRSb290cygpOiBDb21wbGV4W10ge1xuICAgIGlmICggdGhpcy5pc1plcm8oKSB8fCB0aGlzLmRlZ3JlZSA9PT0gMCApIHtcbiAgICAgIC8vIFRPRE86IGhvdyB0byBoYW5kbGU/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy85N1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5kZWdyZWUgPT09IDEgKSB7XG4gICAgICByZXR1cm4gWyBDb21wbGV4LnJlYWwoIC10aGlzLmNvZWZmaWNpZW50c1sgMCBdIC8gdGhpcy5jb2VmZmljaWVudHNbIDEgXSApIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmNvZWZmaWNpZW50c1sgMCBdID09PSAwICkge1xuICAgICAgLy8geD0wIGlzIGEgcm9vdCFcbiAgICAgIGNvbnN0IHJvb3RzID0gbmV3IFVuaXZhcmlhdGVQb2x5bm9taWFsKCB0aGlzLmNvZWZmaWNpZW50cy5zbGljZSggMSApICkuZ2V0Um9vdHMoKTtcbiAgICAgIGlmICggIXJvb3RzLnNvbWUoIHJvb3QgPT4gcm9vdC5lcXVhbHNFcHNpbG9uKCBDb21wbGV4LnJlYWwoIDAgKSwgMWUtMTAgKSApICkge1xuICAgICAgICByb290cy5wdXNoKCBDb21wbGV4LnJlYWwoIDAgKSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJvb3RzO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5kZWdyZWUgPT09IDIgKSB7XG4gICAgICByZXR1cm4gQ29tcGxleC5zb2x2ZVF1YWRyYXRpY1Jvb3RzKFxuICAgICAgICBDb21wbGV4LnJlYWwoIHRoaXMuY29lZmZpY2llbnRzWyAyIF0gKSxcbiAgICAgICAgQ29tcGxleC5yZWFsKCB0aGlzLmNvZWZmaWNpZW50c1sgMSBdICksXG4gICAgICAgIENvbXBsZXgucmVhbCggdGhpcy5jb2VmZmljaWVudHNbIDAgXSApXG4gICAgICApITtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuZGVncmVlID09PSAzICkge1xuICAgICAgcmV0dXJuIENvbXBsZXguc29sdmVDdWJpY1Jvb3RzKFxuICAgICAgICBDb21wbGV4LnJlYWwoIHRoaXMuY29lZmZpY2llbnRzWyAzIF0gKSxcbiAgICAgICAgQ29tcGxleC5yZWFsKCB0aGlzLmNvZWZmaWNpZW50c1sgMiBdICksXG4gICAgICAgIENvbXBsZXgucmVhbCggdGhpcy5jb2VmZmljaWVudHNbIDEgXSApLFxuICAgICAgICBDb21wbGV4LnJlYWwoIHRoaXMuY29lZmZpY2llbnRzWyAwIF0gKVxuICAgICAgKSE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlaWdlbnZhbHVlcyBvZiB0aGUgY29tcGFuaW9uIG1hdHJpeCwgc2luY2UgaXQgaXMgdGhlIHplcm9zIG9mIHRoZSBjaGFyYWN0ZXJpc3RpYyBwb2x5bm9taWFsXG5cbiAgICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbXBhbmlvbl9tYXRyaXhcbiAgICAgIGNvbnN0IGNvbXBhbmlvbk1hdHJpeCA9IG5ldyBNYXRyaXgoIHRoaXMuZGVncmVlLCB0aGlzLmRlZ3JlZSApO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5kZWdyZWU7IGkrKyApIHtcbiAgICAgICAgaWYgKCBpIDwgdGhpcy5kZWdyZWUgLSAxICkge1xuICAgICAgICAgIGNvbXBhbmlvbk1hdHJpeC5zZXQoIGkgKyAxLCBpLCAxICk7XG4gICAgICAgIH1cbiAgICAgICAgY29tcGFuaW9uTWF0cml4LnNldCggaSwgdGhpcy5kZWdyZWUgLSAxLCAtdGhpcy5jb2VmZmljaWVudHNbIGkgXSAvIHRoaXMuY29lZmZpY2llbnRzWyB0aGlzLmRlZ3JlZSBdICk7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyggY29tcGFuaW9uTWF0cml4LnRvU3RyaW5nKCkgKTtcblxuICAgICAgbGV0IG1hdHJpeCA9IGNvbXBhbmlvbk1hdHJpeDtcbiAgICAgIGNvbnN0IGVwc2lsb24gPSAxZS0xMztcblxuICAgICAgLy8gVE9ETzogY3VzdG9tIG51bWJlciBvZiBzdGVwcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzk3XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCA1MDA7IGkrKyApIHtcbiAgICAgICAgY29uc3QgcXIgPSBuZXcgUVJEZWNvbXBvc2l0aW9uKCBtYXRyaXggKTtcbiAgICAgICAgbWF0cml4ID0gcXIuZ2V0UigpLnRpbWVzKCBxci5nZXRRKCkgKTtcblxuICAgICAgICBpZiAoIGkgJSAxMCA9PT0gMCApIHtcbiAgICAgICAgICBsZXQgbWF4TG93ZXJUcmlhbmd1bGFyID0gMDtcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmRlZ3JlZTsgaSsrICkge1xuICAgICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgaTsgaisrICkge1xuICAgICAgICAgICAgICBtYXhMb3dlclRyaWFuZ3VsYXIgPSBNYXRoLm1heCggbWF4TG93ZXJUcmlhbmd1bGFyLCBNYXRoLmFicyggbWF0cml4LmdldCggaSwgaiApICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gVE9ETzogMTAwMCBzZWVtcyBleGNlc3NpdmUgT1Igbm90IGVub3VnaCwgZGVwZW5kaW5nIG9uIHRoZSBwb2x5bm9taWFsPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOTdcbiAgICAgICAgICBpZiAoIG1heExvd2VyVHJpYW5ndWxhciA8IGVwc2lsb24gfHwgaSA+IDEwMDAgKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHFyVmFsdWVzID0gXy5yYW5nZSggMCwgdGhpcy5kZWdyZWUgKS5tYXAoIGkgPT4gQ29tcGxleC5yZWFsKCBtYXRyaXguZ2V0KCBpLCBpICkgKSApO1xuXG4gICAgICBjb25zdCBkZWNvbXAgPSBuZXcgRWlnZW52YWx1ZURlY29tcG9zaXRpb24oIGNvbXBhbmlvbk1hdHJpeCApO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBjb25zdCByZWFsVmFsdWVzOiBGbG9hdDY0QXJyYXkgPSBkZWNvbXAuZ2V0UmVhbEVpZ2VudmFsdWVzKCk7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBjb25zdCBpbWFnaW5hcnlWYWx1ZXM6IEZsb2F0NjRBcnJheSA9IGRlY29tcC5nZXRJbWFnRWlnZW52YWx1ZXMoKTtcbiAgICAgIGNvbnN0IGRlY29tcFZhbHVlcyA9IF8ucmFuZ2UoIDAsIHRoaXMuZGVncmVlICkubWFwKCBpID0+IG5ldyBDb21wbGV4KCByZWFsVmFsdWVzWyBpIF0sIGltYWdpbmFyeVZhbHVlc1sgaSBdICkgKTtcblxuICAgICAgLy8gVE9ETzogY29tcGxleCB2YWx1ZXMhIFdlIHNlZW0gdG8gYmUgZmFpbGluZyBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy85N1xuICAgICAgcmV0dXJuIHFyVmFsdWVzID8gcXJWYWx1ZXMgOiBkZWNvbXBWYWx1ZXM7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBzaW5nbGVDb2VmZmljaWVudCggY29lZmZpY2llbnQ6IG51bWJlciwgZGVncmVlOiBudW1iZXIgKTogVW5pdmFyaWF0ZVBvbHlub21pYWwge1xuICAgIGNvbnN0IGNvZWZmaWNpZW50cyA9IFtdO1xuICAgIHdoaWxlICggY29lZmZpY2llbnRzLmxlbmd0aCA8IGRlZ3JlZSApIHtcbiAgICAgIGNvZWZmaWNpZW50cy5wdXNoKCAwICk7XG4gICAgfVxuICAgIGNvZWZmaWNpZW50cy5wdXNoKCBjb2VmZmljaWVudCApO1xuICAgIHJldHVybiBuZXcgVW5pdmFyaWF0ZVBvbHlub21pYWwoIGNvZWZmaWNpZW50cyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBaRVJPID0gbmV3IFVuaXZhcmlhdGVQb2x5bm9taWFsKCBbXSApO1xufVxuXG5kb3QucmVnaXN0ZXIoICdVbml2YXJpYXRlUG9seW5vbWlhbCcsIFVuaXZhcmlhdGVQb2x5bm9taWFsICk7XG5leHBvcnQgZGVmYXVsdCBVbml2YXJpYXRlUG9seW5vbWlhbDsiXSwibmFtZXMiOlsiQ29tcGxleCIsImRvdCIsIkVpZ2VudmFsdWVEZWNvbXBvc2l0aW9uIiwiTWF0cml4IiwiUVJEZWNvbXBvc2l0aW9uIiwiVW5pdmFyaWF0ZVBvbHlub21pYWwiLCJwbHVzIiwicG9seW5vbWlhbCIsImNvZWZmaWNpZW50cyIsImkiLCJNYXRoIiwibWF4IiwibGVuZ3RoIiwicHVzaCIsImdldENvZWZmaWNpZW50IiwibWludXMiLCJ0aW1lcyIsImoiLCJkaXZpZGVkQnkiLCJxIiwiciIsImQiLCJkZWdyZWUiLCJjIiwicyIsInNpbmdsZUNvZWZmaWNpZW50IiwicXVvdGllbnQiLCJyZW1haW5kZXIiLCJnY2QiLCJhIiwiYiIsImlzWmVybyIsInQiLCJlcXVhbHMiLCJldmVyeSIsImNvZWZmaWNpZW50IiwiZ2V0TW9uaWNQb2x5bm9taWFsIiwibGVhZGluZ0NvZWZmaWNpZW50IiwibWFwIiwiZXZhbHVhdGUiLCJ4IiwicmVzdWx0IiwiZXZhbHVhdGVDb21wbGV4IiwicmVhbCIsImdldFJvb3RzIiwicm9vdHMiLCJzbGljZSIsInNvbWUiLCJyb290IiwiZXF1YWxzRXBzaWxvbiIsInNvbHZlUXVhZHJhdGljUm9vdHMiLCJzb2x2ZUN1YmljUm9vdHMiLCJjb21wYW5pb25NYXRyaXgiLCJzZXQiLCJjb25zb2xlIiwibG9nIiwidG9TdHJpbmciLCJtYXRyaXgiLCJlcHNpbG9uIiwicXIiLCJnZXRSIiwiZ2V0USIsIm1heExvd2VyVHJpYW5ndWxhciIsImFicyIsImdldCIsInFyVmFsdWVzIiwiXyIsInJhbmdlIiwiZGVjb21wIiwicmVhbFZhbHVlcyIsImdldFJlYWxFaWdlbnZhbHVlcyIsImltYWdpbmFyeVZhbHVlcyIsImdldEltYWdFaWdlbnZhbHVlcyIsImRlY29tcFZhbHVlcyIsIm5vbnRyaXZpYWxDb2VmZmljaWVudHMiLCJwb3AiLCJaRVJPIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyw2QkFBNkIsK0JBQStCO0FBQ25FLE9BQU9DLFlBQVksY0FBYztBQUNqQyxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBRW5ELElBQUEsQUFBTUMsdUJBQU4sTUFBTUE7SUFpQkdDLEtBQU1DLFVBQWdDLEVBQXlCO1FBQ3BFLE1BQU1DLGVBQWUsRUFBRTtRQUN2QixJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUMsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0gsWUFBWSxDQUFDSSxNQUFNLEVBQUVMLFdBQVdDLFlBQVksQ0FB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