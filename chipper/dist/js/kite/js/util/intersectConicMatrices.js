// Copyright 2023-2024, University of Colorado Boulder
/**
 * Handles intersections of conic sections (based on their matrix representations).
 *
 * Modelled off of https://math.stackexchange.com/questions/425366/finding-intersection-of-an-ellipse-with-another-ellipse-when-both-are-rotated/425412#425412
 *
 * Should be in the form specified by https://en.wikipedia.org/wiki/Matrix_representation_of_conic_sections, i.e. given
 *
 * Q(x,y) = Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
 *
 * The matrix should be in the form:
 *
 * [ A, B/2, D/2 ]
 * [ B/2, C, E/2 ]
 * [ D/2, E/2, F ]
 *
 * In this file, we often handle matrices of complex values. They are typically 3x3 and stored in row-major order, thus:
 *
 * [ A, B, C ]
 * [ D, E, F ]
 * [ G, H, I ]
 *
 * will be stored as [ A, B, C, D, E, F, G, H, I ].
 *
 * If something is noted as a "line", it is a homogeneous-coordinate form in complex numbers, e.g. an array
 * [ a, b, c ] represents the line ax + by + c = 0.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Complex from '../../../dot/js/Complex.js';
import Matrix from '../../../dot/js/Matrix.js';
import Ray2 from '../../../dot/js/Ray2.js';
import SingularValueDecomposition from '../../../dot/js/SingularValueDecomposition.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector4 from '../../../dot/js/Vector4.js';
import { kite } from '../imports.js';
// Determinant of a 2x2 matrix
const getDet2 = (a, b, c, d)=>{
    return a.times(d).minus(b.times(c));
};
const getDeterminant = (matrix)=>{
    const m00 = matrix[0];
    const m01 = matrix[1];
    const m02 = matrix[2];
    const m10 = matrix[3];
    const m11 = matrix[4];
    const m12 = matrix[5];
    const m20 = matrix[6];
    const m21 = matrix[7];
    const m22 = matrix[8];
    return m00.times(m11).times(m22).plus(m01.times(m12).times(m20)).plus(m02.times(m10).times(m21)).minus(m02.times(m11).times(m20)).minus(m01.times(m10).times(m22)).minus(m00.times(m12).times(m21));
};
// Adjugate of a 3x3 matrix in row-major order
const getAdjugateMatrix = (matrix)=>{
    const m11 = matrix[0];
    const m12 = matrix[1];
    const m13 = matrix[2];
    const m21 = matrix[3];
    const m22 = matrix[4];
    const m23 = matrix[5];
    const m31 = matrix[6];
    const m32 = matrix[7];
    const m33 = matrix[8];
    return [
        getDet2(m22, m23, m32, m33),
        getDet2(m12, m13, m32, m33).negate(),
        getDet2(m12, m13, m22, m23),
        getDet2(m21, m23, m31, m33).negate(),
        getDet2(m11, m13, m31, m33),
        getDet2(m11, m13, m21, m23).negate(),
        getDet2(m21, m22, m31, m32),
        getDet2(m11, m12, m31, m32).negate(),
        getDet2(m11, m12, m21, m22)
    ];
};
// NOTE: Do we need to invert the imaginary parts here? Complex transpose...?
const getTranspose = (matrix)=>{
    return [
        matrix[0],
        matrix[3],
        matrix[6],
        matrix[1],
        matrix[4],
        matrix[7],
        matrix[2],
        matrix[5],
        matrix[8]
    ];
};
// If checkLast=false, we won't provide rows that have a zero in the first two entries
const getNonzeroRow = (matrix, checkLast = false)=>{
    return _.sortBy([
        matrix.slice(0, 3),
        matrix.slice(3, 6),
        matrix.slice(6, 9)
    ], (row)=>{
        return -(row[0].magnitude + row[1].magnitude + (checkLast ? row[2].magnitude : 0));
    })[0];
};
// If checkLast=false, we won't provide columns that have a zero in the first two entries
const getNonzeroColumn = (matrix, checkLast = false)=>{
    return getNonzeroRow(getTranspose(matrix), checkLast);
};
const getAntiSymmetricMatrix = (matrix)=>{
    const adjugate = getAdjugateMatrix(matrix);
    const nonzeroRow = getNonzeroRow(adjugate);
    return [
        Complex.ZERO,
        nonzeroRow[2],
        nonzeroRow[1].negated(),
        nonzeroRow[2].negated(),
        Complex.ZERO,
        nonzeroRow[0],
        nonzeroRow[1],
        nonzeroRow[0].negated(),
        Complex.ZERO
    ];
};
const computeAlpha = (degenerateConicMatrix, antiSymmetricMatrix)=>{
    // Can use an arbitrary 2x2 minor to compute, since we want:
    // rank( degenerateConicMatrix + alpha * antiSymmetricMatrix ) = 1
    // ( d00 + alpha * a00 ) * q = ( d01 + alpha * a01 )
    // ( d10 + alpha * a10 ) * q = ( d11 + alpha * a11 )
    // ( d01 + alpha * a01 ) / ( d00 + alpha * a00 ) = ( d11 + alpha * a11 ) / ( d10 + alpha * a10 )
    // ( d01 + alpha * a01 ) * ( d10 + alpha * a10 ) - ( d00 + alpha * a00 ) * ( d11 + alpha * a11 ) = 0
    // ( a01 * a10 - a00 * a11 ) alpha^2 + d01 * d10 - d00 * d11 + alpha (-a11 * d00 + a10 * d01 + a01 * d10 - a00 * d11 )
    // ( a01 * a10 - a00 * a11 ) alpha^2 + (-a11 * d00 + a10 * d01 + a01 * d10 - a00 * d11 ) alpha + (d01 * d10 - d00 * d11)
    const d00 = degenerateConicMatrix[0];
    const d01 = degenerateConicMatrix[1];
    const d10 = degenerateConicMatrix[3];
    const d11 = degenerateConicMatrix[4];
    const a00 = antiSymmetricMatrix[0];
    const a01 = antiSymmetricMatrix[1];
    const a10 = antiSymmetricMatrix[3];
    const a11 = antiSymmetricMatrix[4];
    // TODO: less garbage creation https://github.com/phetsims/kite/issues/97
    const A = a01.times(a10).minus(a00.times(a11));
    const B = a11.negated().times(d00).plus(a10.times(d01)).plus(a01.times(d10)).minus(a00.times(d11));
    const C = d01.times(d10).minus(d00.times(d11));
    const roots = Complex.solveQuadraticRoots(A, B, C);
    // If there are roots, pick the first one
    return roots === null ? null : roots[0];
};
const getRank1DegenerateConicMatrix = (matrix)=>{
    const antiSymmetricMatrix = getAntiSymmetricMatrix(matrix);
    const alpha = computeAlpha(matrix, antiSymmetricMatrix);
    if (alpha === null) {
        // already in proper form, adding the antiSymmetricMatrix in any linear combination will still be rank 1
        return matrix;
    } else {
        return [
            matrix[0].plus(alpha.times(antiSymmetricMatrix[0])),
            matrix[1].plus(alpha.times(antiSymmetricMatrix[1])),
            matrix[2].plus(alpha.times(antiSymmetricMatrix[2])),
            matrix[3].plus(alpha.times(antiSymmetricMatrix[3])),
            matrix[4].plus(alpha.times(antiSymmetricMatrix[4])),
            matrix[5].plus(alpha.times(antiSymmetricMatrix[5])),
            matrix[6].plus(alpha.times(antiSymmetricMatrix[6])),
            matrix[7].plus(alpha.times(antiSymmetricMatrix[7])),
            matrix[8].plus(alpha.times(antiSymmetricMatrix[8]))
        ];
    }
};
/**
 * A degenerate conic is essentially a product of two lines, e.g. (Px + Qy + C)(Sx + Ty + U) = 0 (where everything is
 * complex valued in this case). Each line is topologically equivalent to a plane.
 */ const getRealIntersectionsForDegenerateConic = (matrix)=>{
    // TODO: check whether we are symmetric. https://github.com/phetsims/kite/issues/97
    const result = [];
    // Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0 (complex valued)
    const A = matrix[0];
    const B = matrix[1].times(Complex.real(2));
    const C = matrix[4];
    const D = matrix[2].times(Complex.real(2));
    const E = matrix[5].times(Complex.real(2));
    const F = matrix[8];
    // const ev = ( x: Complex, y: Complex ) => {
    //   return A.times( x ).times( x )
    //     .plus( B.times( x ).times( y ) )
    //     .plus( C.times( y ).times( y ) )
    //     .plus( D.times( x ) )
    //     .plus( E.times( y ) )
    //     .plus( F );
    // };
    // We'll now find (ideally) two solutions for the conic, such that they are each on one of the lines
    let solutions = [];
    const alpha = new Complex(-2.51653525696959, 1.52928502844020); // randomly chosen
    // first try picking an x and solve for multiple y (x=alpha)
    // (C)y^2 + (B*alpha + E)y + (A*alpha^2 + D*alpha + F) = 0
    const xAlphaA = C;
    const xAlphaB = B.times(alpha).plus(E);
    const xAlphaC = A.times(alpha).times(alpha).plus(D.times(alpha)).plus(F);
    const xAlphaRoots = Complex.solveQuadraticRoots(xAlphaA, xAlphaB, xAlphaC);
    if (xAlphaRoots && xAlphaRoots.length >= 2) {
        solutions = [
            [
                alpha,
                xAlphaRoots[0]
            ],
            [
                alpha,
                xAlphaRoots[1]
            ]
        ];
    } else {
        // Now try y=alpha
        // (A)x^2 + (B*alpha + D)x + (C*alpha^2 + E*alpha + F) = 0
        const yAlphaA = A;
        const yAlphaB = B.times(alpha).plus(D);
        const yAlphaC = C.times(alpha).times(alpha).plus(E.times(alpha)).plus(F);
        const yAlphaRoots = Complex.solveQuadraticRoots(yAlphaA, yAlphaB, yAlphaC);
        if (yAlphaRoots && yAlphaRoots.length >= 2) {
            solutions = [
                [
                    yAlphaRoots[0],
                    alpha
                ],
                [
                    yAlphaRoots[1],
                    alpha
                ]
            ];
        } else {
            // Select only one root if we have it, we might have a double line
            if (xAlphaRoots && xAlphaRoots.length === 1) {
                solutions = [
                    [
                        alpha,
                        xAlphaRoots[0]
                    ]
                ];
            } else if (yAlphaRoots && yAlphaRoots.length === 1) {
                solutions = [
                    [
                        yAlphaRoots[0],
                        alpha
                    ]
                ];
            } else {
                throw new Error('Implement more advanced initialization to find two solutions');
            }
        }
    }
    solutions.forEach((solution)=>{
        // Here, we'll be breaking out the complex x,y into quads of: [ realX, realY, imaginaryX, imaginaryY ] denoted as
        // [ rx, ry, ix, iy ].
        /**
     * Broken case:
      A
      Complex {real: -2.3062816034702394e-7, imaginary: -0.000050001623100918746}
      B
      Complex {real: 0, imaginary: 0}
      C
      Complex {real: -2.3062816034702394e-7, imaginary: -0.000050001623100918746}
      D
      Complex {real: -0.009907748735827226, imaginary: 0.0200006492403675}
      E
      Complex {real: 0.00009225126416367857, imaginary: 0.0200006492403675}
      F
      Complex {real: 1.9838810287765227, imaginary: -3.5001136170643123}


     real: 200.0025, 100   and 200.0025, 300    are better solutions, but obviously could be refined
     */ const rx = solution[0].real;
        const ry = solution[1].real;
        const ix = solution[0].imaginary;
        const iy = solution[1].imaginary;
        const rA = A.real;
        const rB = B.real;
        const rC = C.real;
        const rD = D.real;
        const rE = E.real;
        const iA = A.imaginary;
        const iB = B.imaginary;
        const iC = C.imaginary;
        const iD = D.imaginary;
        const iE = E.imaginary;
        const realGradient = new Vector4(-2 * iA * ix - iB * iy + rD + 2 * rA * rx + rB * ry, -iB * ix - 2 * iC * iy + rE + rB * rx + 2 * rC * ry, -iD - 2 * ix * rA - iy * rB - 2 * iA * rx - iB * ry, -iE - ix * rB - 2 * iy * rC - iB * rx - 2 * iC * ry);
        // [ number, number, number, number ]
        const imaginaryGradient = new Vector4(iD + 2 * ix * rA + iy * rB + 2 * iA * rx + iB * ry, iE + ix * rB + 2 * iy * rC + iB * rx + 2 * iC * ry, -2 * iA * ix - iB * iy + rD + 2 * rA * rx + rB * ry, -iB * ix - 2 * iC * iy + rE + rB * rx + 2 * rC * ry);
        const randomPointA = new Vector4(6.1951068548253, -1.1592689503860, 0.1602918829294, 3.205818692048202);
        const randomPointB = new Vector4(-5.420628549296924, -15.2069583028685, 0.1595906020488680, 5.10688288040682);
        const proj = (v, u)=>{
            return u.timesScalar(v.dot(u) / u.dot(u));
        };
        // Gram-Schmidt orthogonalization to get a nice basis
        const basisRealGradient = realGradient;
        const basisImaginaryGradient = imaginaryGradient.minus(proj(imaginaryGradient, basisRealGradient));
        const basisPlane0 = randomPointA.minus(proj(randomPointA, basisRealGradient)).minus(proj(randomPointA, basisImaginaryGradient));
        const basisPlane1 = randomPointB.minus(proj(randomPointB, basisRealGradient)).minus(proj(randomPointB, basisImaginaryGradient)).minus(proj(randomPointB, basisPlane0));
        // Our basis in the exclusively-imaginary plane
        const basisMatrix = new Matrix(2, 2, [
            basisPlane0.z,
            basisPlane1.z,
            basisPlane0.w,
            basisPlane1.w
        ]);
        const singularValues = new SingularValueDecomposition(basisMatrix).getSingularValues();
        let realSolution = null;
        if (Math.abs(ix) < 1e-10 && Math.abs(iy) < 1e-10) {
            realSolution = new Vector2(rx, ry);
        } else {
            // iP + t * iB0 + u * iB1 = 0, if we can find t,u where (P + t * B0 + u * B1) is real
            //
            // [ iB0x IB1x ] [ t ] = [ -iPx ]
            // [ iB0y IB1y ] [ u ]   [ -iPy ]
            if (Math.abs(singularValues[1]) > 1e-10) {
                // rank 2
                const tu = basisMatrix.solve(new Matrix(2, 1, [
                    -ix,
                    -iy
                ])).extractVector2(0);
                realSolution = new Vector2(rx + tu.x * basisPlane0.z + tu.y * basisPlane1.z, ry + tu.x * basisPlane0.w + tu.y * basisPlane1.w);
            } else if (Math.abs(singularValues[0]) > 1e-10) {
                // rank 1 - columns are multiples of each other, one possibly (0,0)
                // For imaginary bases (we'll use them potentially multiple times if we have a rank 1 matrix
                const largestBasis = Math.abs(basisPlane0.z) + Math.abs(basisPlane0.w) > Math.abs(basisPlane1.z) + Math.abs(basisPlane1.w) ? basisPlane0 : basisPlane1;
                const largestBasisImaginaryVector = new Vector2(largestBasis.z, largestBasis.w);
                const t = new Vector2(ix, iy).dot(largestBasisImaginaryVector) / largestBasisImaginaryVector.dot(largestBasisImaginaryVector);
                const potentialSolution = new Vector4(rx, ry, ix, iy).minus(largestBasis.timesScalar(t));
                if (Math.abs(potentialSolution.z) < 1e-8 && Math.abs(potentialSolution.w) < 1e-8) {
                    realSolution = new Vector2(potentialSolution.x, potentialSolution.y);
                }
            } else {
                // rank 0 AND our solution is NOT real, then there is no solution
                realSolution = null;
            }
            if (realSolution) {
                // We need to check if we have a line of solutions now!
                if (Math.abs(singularValues[1]) > 1e-10) {
                    // rank 2
                    // Our solution is the only solution (no linear combination of basis vectors besides our current solution
                    // that would be real)
                    result.push(realSolution);
                } else if (Math.abs(singularValues[0]) > 1e-10) {
                    // rank 1
                    // Our bases are a multiple of each other. We need to find a linear combination of them that is real, then
                    // every multiple of that will be a solution (line). If either is (0,0), we will use that one, so check that
                    // first
                    // TODO: can we deduplicate this with code above? https://github.com/phetsims/kite/issues/97
                    const zeroLarger = Math.abs(basisPlane0.z) + Math.abs(basisPlane0.w) > Math.abs(basisPlane1.z) + Math.abs(basisPlane1.w);
                    const smallestBasis = zeroLarger ? basisPlane1 : basisPlane0;
                    const largestBasis = zeroLarger ? basisPlane0 : basisPlane1;
                    // Find the largest component, so if we have a zero x or y in both our bases, it will work out fine
                    const xLarger = Math.abs(largestBasis.z) > Math.abs(largestBasis.w);
                    // largestBasis * t = smallestBasis, supports smallestBasis=(0,0)
                    const t = xLarger ? smallestBasis.z / largestBasis.z : smallestBasis.w / largestBasis.w;
                    const direction4 = largestBasis.timesScalar(t).minus(smallestBasis);
                    // Should be unconditionally a non-zero direction, otherwise they wouldn't be basis vectors
                    result.push(new Ray2(realSolution, new Vector2(direction4.x, direction4.y).normalized()));
                } else {
                // rank 0
                // THEY ARE ALL SOLUTIONS, we're on the real plane. That isn't useful to us, so we don't add any results
                }
            }
        }
    });
    return result;
};
const getLinesForDegenerateConic = (matrix)=>{
    const rank1DegenerateConicMatrix = getRank1DegenerateConicMatrix(matrix);
    return [
        getNonzeroRow(rank1DegenerateConicMatrix),
        getNonzeroColumn(rank1DegenerateConicMatrix)
    ];
};
const lineIntersect = (line1, line2)=>{
    // line1: a1 * x + b1 * y + c1 = 0
    // line2: a2 * x + b2 * y + c2 = 0
    // y = ( -a1 * x - c1 ) / b1
    // y = ( -a2 * x - c2 ) / b2
    // ( -a1 * x - c1 ) / b1 = ( -a2 * x - c2 ) / b2
    // ( -a1 * x - c1 ) * b2 = ( -a2 * x - c2 ) * b1
    // x = ( b2 * c1 - b1 * c2 ) / ( a2 * b1 - a1 * b2 );
    const a1 = line1[0];
    const b1 = line1[1];
    const c1 = line1[2];
    const a2 = line2[0];
    const b2 = line2[1];
    const c2 = line2[2];
    const determinant = a2.times(b1).minus(a1.times(b2));
    if (determinant.equalsEpsilon(Complex.ZERO, 1e-8)) {
        return null;
    } else {
        const x = b2.times(c1).minus(b1.times(c2)).dividedBy(determinant);
        let y;
        if (!b1.equalsEpsilon(Complex.ZERO, 1e-8)) {
            y = a1.negated().times(x).minus(c1).dividedBy(b1); // Use our first line
        } else if (!b2.equalsEpsilon(Complex.ZERO, 1e-8)) {
            y = a2.negated().times(x).minus(c2).dividedBy(b2); // Use our second line
        } else {
            return null;
        }
        // TODO: epsilon evaluation? https://github.com/phetsims/kite/issues/97
        if (Math.abs(x.imaginary) < 1e-8 && Math.abs(y.imaginary) < 1e-8) {
            return new Vector2(x.real, y.real);
        } else {
            return null;
        }
    }
};
// NOTE: Assumes these matrices are NOT degenerate (will only be tested for circles/ellipses)
const intersectConicMatrices = (a, b)=>{
    // Modeled off of
    // compute C = lambda * A + B, where lambda is chosen so that det(C) = 0
    // NOTE: This assumes we don't have degenerate conic matrices
    // det(C) = c00 * c11 * c22 + c01 * c12 * c20 + c02 * c10 * c21 - c02 * c11 * c20 - c01 * c10 * c22 - c00 * c12 * c21
    // c00 = a00 * lambda + b00
    // c01 = a01 * lambda + b01
    // c02 = a02 * lambda + b02
    // c10 = a10 * lambda + b10
    // c11 = a11 * lambda + b11
    // c12 = a12 * lambda + b12
    // c20 = a20 * lambda + b20
    // c21 = a21 * lambda + b21
    // c22 = a22 * lambda + b22
    // A lambda^3 + B lambda^2 + C lambda + D = 0
    const a00 = a.m00();
    const a01 = a.m01();
    const a02 = a.m02();
    const a10 = a.m10();
    const a11 = a.m11();
    const a12 = a.m12();
    const a20 = a.m20();
    const a21 = a.m21();
    const a22 = a.m22();
    const b00 = b.m00();
    const b01 = b.m01();
    const b02 = b.m02();
    const b10 = b.m10();
    const b11 = b.m11();
    const b12 = b.m12();
    const b20 = b.m20();
    const b21 = b.m21();
    const b22 = b.m22();
    const A = -a02 * a11 * a20 + a01 * a12 * a20 + a02 * a10 * a21 - a00 * a12 * a21 - a01 * a10 * a22 + a00 * a11 * a22;
    const B = -a10 * a22 * b01 + a10 * a21 * b02 + a02 * a21 * b10 - a01 * a22 * b10 - a02 * a20 * b11 + a00 * a22 * b11 + a01 * a20 * b12 - a00 * a21 * b12 + a02 * a10 * b21 + a12 * (-a21 * b00 + a20 * b01 + a01 * b20 - a00 * b21) - a01 * a10 * b22 + a11 * (a22 * b00 - a20 * b02 - a02 * b20 + a00 * b22);
    const C = -a22 * b01 * b10 + a21 * b02 * b10 + a22 * b00 * b11 - a20 * b02 * b11 - a21 * b00 * b12 + a20 * b01 * b12 + a12 * b01 * b20 - a11 * b02 * b20 - a02 * b11 * b20 + a01 * b12 * b20 - a12 * b00 * b21 + a10 * b02 * b21 + a02 * b10 * b21 - a00 * b12 * b21 + a11 * b00 * b22 - a10 * b01 * b22 - a01 * b10 * b22 + a00 * b11 * b22;
    const D = -b02 * b11 * b20 + b01 * b12 * b20 + b02 * b10 * b21 - b00 * b12 * b21 - b01 * b10 * b22 + b00 * b11 * b22;
    // NOTE: we don't have a discriminant threshold right now
    const potentialLambdas = Complex.solveCubicRoots(Complex.real(A), Complex.real(B), Complex.real(C), Complex.real(D));
    if (!potentialLambdas || potentialLambdas.length === 0) {
        // Probably overlapping, infinite intersections
        return {
            degenerateConicMatrices: [],
            intersectionCollections: [],
            points: [],
            lines: []
        };
    }
    const uniqueLambdas = _.uniqWith(potentialLambdas, (a, b)=>a.equals(b));
    const degenerateConicMatrices = uniqueLambdas.map((lambda)=>{
        return [
            Complex.real(a00).multiply(lambda).add(Complex.real(b00)),
            Complex.real(a01).multiply(lambda).add(Complex.real(b01)),
            Complex.real(a02).multiply(lambda).add(Complex.real(b02)),
            Complex.real(a10).multiply(lambda).add(Complex.real(b10)),
            Complex.real(a11).multiply(lambda).add(Complex.real(b11)),
            Complex.real(a12).multiply(lambda).add(Complex.real(b12)),
            Complex.real(a20).multiply(lambda).add(Complex.real(b20)),
            Complex.real(a21).multiply(lambda).add(Complex.real(b21)),
            Complex.real(a22).multiply(lambda).add(Complex.real(b22))
        ];
    });
    console.log('determinant magnitudes', degenerateConicMatrices.map((m)=>getDeterminant(m).magnitude));
    const result = [];
    const lineCollections = degenerateConicMatrices.map(getLinesForDegenerateConic);
    console.log(lineCollections);
    const intersectionCollections = degenerateConicMatrices.map(getRealIntersectionsForDegenerateConic);
    console.log(intersectionCollections);
    for(let i = 0; i < lineCollections.length; i++){
        const lines0 = lineCollections[i];
        // We need to handle a case where two conics are touching at a tangent point
        const selfIntersection = lineIntersect(lines0[0], lines0[1]);
        if (selfIntersection) {
            result.push(selfIntersection);
        }
        for(let j = i + 1; j < lineCollections.length; j++){
            const lines1 = lineCollections[j];
            const candidates = [
                lineIntersect(lines0[0], lines1[0]),
                lineIntersect(lines0[0], lines1[1]),
                lineIntersect(lines0[1], lines1[0]),
                lineIntersect(lines0[1], lines1[1])
            ];
            for(let k = 0; k < 4; k++){
                const candidate = candidates[k];
                if (candidate) {
                    result.push(candidate);
                }
            }
        }
    }
    return {
        points: result,
        degenerateConicMatrices: degenerateConicMatrices,
        lines: _.flatten(lineCollections),
        intersectionCollections: intersectionCollections
    };
};
export default intersectConicMatrices;
kite.register('intersectConicMatrices', intersectConicMatrices);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9pbnRlcnNlY3RDb25pY01hdHJpY2VzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEhhbmRsZXMgaW50ZXJzZWN0aW9ucyBvZiBjb25pYyBzZWN0aW9ucyAoYmFzZWQgb24gdGhlaXIgbWF0cml4IHJlcHJlc2VudGF0aW9ucykuXG4gKlxuICogTW9kZWxsZWQgb2ZmIG9mIGh0dHBzOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvNDI1MzY2L2ZpbmRpbmctaW50ZXJzZWN0aW9uLW9mLWFuLWVsbGlwc2Utd2l0aC1hbm90aGVyLWVsbGlwc2Utd2hlbi1ib3RoLWFyZS1yb3RhdGVkLzQyNTQxMiM0MjU0MTJcbiAqXG4gKiBTaG91bGQgYmUgaW4gdGhlIGZvcm0gc3BlY2lmaWVkIGJ5IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01hdHJpeF9yZXByZXNlbnRhdGlvbl9vZl9jb25pY19zZWN0aW9ucywgaS5lLiBnaXZlblxuICpcbiAqIFEoeCx5KSA9IEF4XjIgKyBCeHkgKyBDeV4yICsgRHggKyBFeSArIEYgPSAwXG4gKlxuICogVGhlIG1hdHJpeCBzaG91bGQgYmUgaW4gdGhlIGZvcm06XG4gKlxuICogWyBBLCBCLzIsIEQvMiBdXG4gKiBbIEIvMiwgQywgRS8yIF1cbiAqIFsgRC8yLCBFLzIsIEYgXVxuICpcbiAqIEluIHRoaXMgZmlsZSwgd2Ugb2Z0ZW4gaGFuZGxlIG1hdHJpY2VzIG9mIGNvbXBsZXggdmFsdWVzLiBUaGV5IGFyZSB0eXBpY2FsbHkgM3gzIGFuZCBzdG9yZWQgaW4gcm93LW1ham9yIG9yZGVyLCB0aHVzOlxuICpcbiAqIFsgQSwgQiwgQyBdXG4gKiBbIEQsIEUsIEYgXVxuICogWyBHLCBILCBJIF1cbiAqXG4gKiB3aWxsIGJlIHN0b3JlZCBhcyBbIEEsIEIsIEMsIEQsIEUsIEYsIEcsIEgsIEkgXS5cbiAqXG4gKiBJZiBzb21ldGhpbmcgaXMgbm90ZWQgYXMgYSBcImxpbmVcIiwgaXQgaXMgYSBob21vZ2VuZW91cy1jb29yZGluYXRlIGZvcm0gaW4gY29tcGxleCBudW1iZXJzLCBlLmcuIGFuIGFycmF5XG4gKiBbIGEsIGIsIGMgXSByZXByZXNlbnRzIHRoZSBsaW5lIGF4ICsgYnkgKyBjID0gMC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IENvbXBsZXggZnJvbSAnLi4vLi4vLi4vZG90L2pzL0NvbXBsZXguanMnO1xuaW1wb3J0IE1hdHJpeCBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4LmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcbmltcG9ydCBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiBmcm9tICcuLi8uLi8uLi9kb3QvanMvU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24uanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IFZlY3RvcjQgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjQuanMnO1xuaW1wb3J0IHsga2l0ZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBEZXRlcm1pbmFudCBvZiBhIDJ4MiBtYXRyaXhcbmNvbnN0IGdldERldDIgPSAoIGE6IENvbXBsZXgsIGI6IENvbXBsZXgsIGM6IENvbXBsZXgsIGQ6IENvbXBsZXggKSA9PiB7XG4gIHJldHVybiBhLnRpbWVzKCBkICkubWludXMoIGIudGltZXMoIGMgKSApO1xufTtcblxuY29uc3QgZ2V0RGV0ZXJtaW5hbnQgPSAoIG1hdHJpeDogQ29tcGxleFtdICk6IENvbXBsZXggPT4ge1xuICBjb25zdCBtMDAgPSBtYXRyaXhbIDAgXTtcbiAgY29uc3QgbTAxID0gbWF0cml4WyAxIF07XG4gIGNvbnN0IG0wMiA9IG1hdHJpeFsgMiBdO1xuICBjb25zdCBtMTAgPSBtYXRyaXhbIDMgXTtcbiAgY29uc3QgbTExID0gbWF0cml4WyA0IF07XG4gIGNvbnN0IG0xMiA9IG1hdHJpeFsgNSBdO1xuICBjb25zdCBtMjAgPSBtYXRyaXhbIDYgXTtcbiAgY29uc3QgbTIxID0gbWF0cml4WyA3IF07XG4gIGNvbnN0IG0yMiA9IG1hdHJpeFsgOCBdO1xuXG4gIHJldHVybiAoIG0wMC50aW1lcyggbTExICkudGltZXMoIG0yMiApICkucGx1cyggbTAxLnRpbWVzKCBtMTIgKS50aW1lcyggbTIwICkgKS5wbHVzKCBtMDIudGltZXMoIG0xMCApLnRpbWVzKCBtMjEgKSApLm1pbnVzKCBtMDIudGltZXMoIG0xMSApLnRpbWVzKCBtMjAgKSApLm1pbnVzKCBtMDEudGltZXMoIG0xMCApLnRpbWVzKCBtMjIgKSApLm1pbnVzKCBtMDAudGltZXMoIG0xMiApLnRpbWVzKCBtMjEgKSApO1xufTtcblxuLy8gQWRqdWdhdGUgb2YgYSAzeDMgbWF0cml4IGluIHJvdy1tYWpvciBvcmRlclxuY29uc3QgZ2V0QWRqdWdhdGVNYXRyaXggPSAoIG1hdHJpeDogQ29tcGxleFtdICk6IENvbXBsZXhbXSA9PiB7XG4gIGNvbnN0IG0xMSA9IG1hdHJpeFsgMCBdO1xuICBjb25zdCBtMTIgPSBtYXRyaXhbIDEgXTtcbiAgY29uc3QgbTEzID0gbWF0cml4WyAyIF07XG4gIGNvbnN0IG0yMSA9IG1hdHJpeFsgMyBdO1xuICBjb25zdCBtMjIgPSBtYXRyaXhbIDQgXTtcbiAgY29uc3QgbTIzID0gbWF0cml4WyA1IF07XG4gIGNvbnN0IG0zMSA9IG1hdHJpeFsgNiBdO1xuICBjb25zdCBtMzIgPSBtYXRyaXhbIDcgXTtcbiAgY29uc3QgbTMzID0gbWF0cml4WyA4IF07XG5cbiAgcmV0dXJuIFtcbiAgICBnZXREZXQyKCBtMjIsIG0yMywgbTMyLCBtMzMgKSxcbiAgICBnZXREZXQyKCBtMTIsIG0xMywgbTMyLCBtMzMgKS5uZWdhdGUoKSxcbiAgICBnZXREZXQyKCBtMTIsIG0xMywgbTIyLCBtMjMgKSxcbiAgICBnZXREZXQyKCBtMjEsIG0yMywgbTMxLCBtMzMgKS5uZWdhdGUoKSxcbiAgICBnZXREZXQyKCBtMTEsIG0xMywgbTMxLCBtMzMgKSxcbiAgICBnZXREZXQyKCBtMTEsIG0xMywgbTIxLCBtMjMgKS5uZWdhdGUoKSxcbiAgICBnZXREZXQyKCBtMjEsIG0yMiwgbTMxLCBtMzIgKSxcbiAgICBnZXREZXQyKCBtMTEsIG0xMiwgbTMxLCBtMzIgKS5uZWdhdGUoKSxcbiAgICBnZXREZXQyKCBtMTEsIG0xMiwgbTIxLCBtMjIgKVxuICBdO1xufTtcblxuLy8gTk9URTogRG8gd2UgbmVlZCB0byBpbnZlcnQgdGhlIGltYWdpbmFyeSBwYXJ0cyBoZXJlPyBDb21wbGV4IHRyYW5zcG9zZS4uLj9cbmNvbnN0IGdldFRyYW5zcG9zZSA9ICggbWF0cml4OiBDb21wbGV4W10gKTogQ29tcGxleFtdID0+IHtcbiAgcmV0dXJuIFtcbiAgICBtYXRyaXhbIDAgXSwgbWF0cml4WyAzIF0sIG1hdHJpeFsgNiBdLFxuICAgIG1hdHJpeFsgMSBdLCBtYXRyaXhbIDQgXSwgbWF0cml4WyA3IF0sXG4gICAgbWF0cml4WyAyIF0sIG1hdHJpeFsgNSBdLCBtYXRyaXhbIDggXVxuICBdO1xufTtcblxuLy8gSWYgY2hlY2tMYXN0PWZhbHNlLCB3ZSB3b24ndCBwcm92aWRlIHJvd3MgdGhhdCBoYXZlIGEgemVybyBpbiB0aGUgZmlyc3QgdHdvIGVudHJpZXNcbmNvbnN0IGdldE5vbnplcm9Sb3cgPSAoIG1hdHJpeDogQ29tcGxleFtdLCBjaGVja0xhc3QgPSBmYWxzZSApOiBDb21wbGV4W10gPT4ge1xuICByZXR1cm4gXy5zb3J0QnkoIFsgbWF0cml4LnNsaWNlKCAwLCAzICksIG1hdHJpeC5zbGljZSggMywgNiApLCBtYXRyaXguc2xpY2UoIDYsIDkgKSBdLCByb3cgPT4ge1xuICAgIHJldHVybiAtKCByb3dbIDAgXS5tYWduaXR1ZGUgKyByb3dbIDEgXS5tYWduaXR1ZGUgKyAoIGNoZWNrTGFzdCA/IHJvd1sgMiBdLm1hZ25pdHVkZSA6IDAgKSApO1xuICB9IClbIDAgXTtcbn07XG5cbi8vIElmIGNoZWNrTGFzdD1mYWxzZSwgd2Ugd29uJ3QgcHJvdmlkZSBjb2x1bW5zIHRoYXQgaGF2ZSBhIHplcm8gaW4gdGhlIGZpcnN0IHR3byBlbnRyaWVzXG5jb25zdCBnZXROb256ZXJvQ29sdW1uID0gKCBtYXRyaXg6IENvbXBsZXhbXSwgY2hlY2tMYXN0ID0gZmFsc2UgKTogQ29tcGxleFtdID0+IHtcbiAgcmV0dXJuIGdldE5vbnplcm9Sb3coIGdldFRyYW5zcG9zZSggbWF0cml4ICksIGNoZWNrTGFzdCApO1xufTtcblxuY29uc3QgZ2V0QW50aVN5bW1ldHJpY01hdHJpeCA9ICggbWF0cml4OiBDb21wbGV4W10gKSA9PiB7XG4gIGNvbnN0IGFkanVnYXRlID0gZ2V0QWRqdWdhdGVNYXRyaXgoIG1hdHJpeCApO1xuICBjb25zdCBub256ZXJvUm93ID0gZ2V0Tm9uemVyb1JvdyggYWRqdWdhdGUgKTtcbiAgcmV0dXJuIFtcbiAgICBDb21wbGV4LlpFUk8sIG5vbnplcm9Sb3dbIDIgXSwgbm9uemVyb1Jvd1sgMSBdLm5lZ2F0ZWQoKSxcbiAgICBub256ZXJvUm93WyAyIF0ubmVnYXRlZCgpLCBDb21wbGV4LlpFUk8sIG5vbnplcm9Sb3dbIDAgXSxcbiAgICBub256ZXJvUm93WyAxIF0sIG5vbnplcm9Sb3dbIDAgXS5uZWdhdGVkKCksIENvbXBsZXguWkVST1xuICBdO1xufTtcblxuY29uc3QgY29tcHV0ZUFscGhhID0gKCBkZWdlbmVyYXRlQ29uaWNNYXRyaXg6IENvbXBsZXhbXSwgYW50aVN5bW1ldHJpY01hdHJpeDogQ29tcGxleFtdICk6IENvbXBsZXggfCBudWxsID0+IHtcbiAgLy8gQ2FuIHVzZSBhbiBhcmJpdHJhcnkgMngyIG1pbm9yIHRvIGNvbXB1dGUsIHNpbmNlIHdlIHdhbnQ6XG4gIC8vIHJhbmsoIGRlZ2VuZXJhdGVDb25pY01hdHJpeCArIGFscGhhICogYW50aVN5bW1ldHJpY01hdHJpeCApID0gMVxuXG4gIC8vICggZDAwICsgYWxwaGEgKiBhMDAgKSAqIHEgPSAoIGQwMSArIGFscGhhICogYTAxIClcbiAgLy8gKCBkMTAgKyBhbHBoYSAqIGExMCApICogcSA9ICggZDExICsgYWxwaGEgKiBhMTEgKVxuICAvLyAoIGQwMSArIGFscGhhICogYTAxICkgLyAoIGQwMCArIGFscGhhICogYTAwICkgPSAoIGQxMSArIGFscGhhICogYTExICkgLyAoIGQxMCArIGFscGhhICogYTEwIClcbiAgLy8gKCBkMDEgKyBhbHBoYSAqIGEwMSApICogKCBkMTAgKyBhbHBoYSAqIGExMCApIC0gKCBkMDAgKyBhbHBoYSAqIGEwMCApICogKCBkMTEgKyBhbHBoYSAqIGExMSApID0gMFxuICAvLyAoIGEwMSAqIGExMCAtIGEwMCAqIGExMSApIGFscGhhXjIgKyBkMDEgKiBkMTAgLSBkMDAgKiBkMTEgKyBhbHBoYSAoLWExMSAqIGQwMCArIGExMCAqIGQwMSArIGEwMSAqIGQxMCAtIGEwMCAqIGQxMSApXG4gIC8vICggYTAxICogYTEwIC0gYTAwICogYTExICkgYWxwaGFeMiArICgtYTExICogZDAwICsgYTEwICogZDAxICsgYTAxICogZDEwIC0gYTAwICogZDExICkgYWxwaGEgKyAoZDAxICogZDEwIC0gZDAwICogZDExKVxuICBjb25zdCBkMDAgPSBkZWdlbmVyYXRlQ29uaWNNYXRyaXhbIDAgXTtcbiAgY29uc3QgZDAxID0gZGVnZW5lcmF0ZUNvbmljTWF0cml4WyAxIF07XG4gIGNvbnN0IGQxMCA9IGRlZ2VuZXJhdGVDb25pY01hdHJpeFsgMyBdO1xuICBjb25zdCBkMTEgPSBkZWdlbmVyYXRlQ29uaWNNYXRyaXhbIDQgXTtcbiAgY29uc3QgYTAwID0gYW50aVN5bW1ldHJpY01hdHJpeFsgMCBdO1xuICBjb25zdCBhMDEgPSBhbnRpU3ltbWV0cmljTWF0cml4WyAxIF07XG4gIGNvbnN0IGExMCA9IGFudGlTeW1tZXRyaWNNYXRyaXhbIDMgXTtcbiAgY29uc3QgYTExID0gYW50aVN5bW1ldHJpY01hdHJpeFsgNCBdO1xuXG4gIC8vIFRPRE86IGxlc3MgZ2FyYmFnZSBjcmVhdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOTdcbiAgY29uc3QgQSA9IGEwMS50aW1lcyggYTEwICkubWludXMoIGEwMC50aW1lcyggYTExICkgKTtcbiAgY29uc3QgQiA9IGExMS5uZWdhdGVkKCkudGltZXMoIGQwMCApLnBsdXMoIGExMC50aW1lcyggZDAxICkgKS5wbHVzKCBhMDEudGltZXMoIGQxMCApICkubWludXMoIGEwMC50aW1lcyggZDExICkgKTtcbiAgY29uc3QgQyA9IGQwMS50aW1lcyggZDEwICkubWludXMoIGQwMC50aW1lcyggZDExICkgKTtcblxuICBjb25zdCByb290cyA9IENvbXBsZXguc29sdmVRdWFkcmF0aWNSb290cyggQSwgQiwgQyApO1xuXG4gIC8vIElmIHRoZXJlIGFyZSByb290cywgcGljayB0aGUgZmlyc3Qgb25lXG4gIHJldHVybiByb290cyA9PT0gbnVsbCA/IG51bGwgOiByb290c1sgMCBdO1xufTtcblxuY29uc3QgZ2V0UmFuazFEZWdlbmVyYXRlQ29uaWNNYXRyaXggPSAoIG1hdHJpeDogQ29tcGxleFtdICkgPT4ge1xuICBjb25zdCBhbnRpU3ltbWV0cmljTWF0cml4ID0gZ2V0QW50aVN5bW1ldHJpY01hdHJpeCggbWF0cml4ICk7XG4gIGNvbnN0IGFscGhhID0gY29tcHV0ZUFscGhhKCBtYXRyaXgsIGFudGlTeW1tZXRyaWNNYXRyaXggKTtcbiAgaWYgKCBhbHBoYSA9PT0gbnVsbCApIHtcbiAgICAvLyBhbHJlYWR5IGluIHByb3BlciBmb3JtLCBhZGRpbmcgdGhlIGFudGlTeW1tZXRyaWNNYXRyaXggaW4gYW55IGxpbmVhciBjb21iaW5hdGlvbiB3aWxsIHN0aWxsIGJlIHJhbmsgMVxuICAgIHJldHVybiBtYXRyaXg7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG1hdHJpeFsgMCBdLnBsdXMoIGFscGhhLnRpbWVzKCBhbnRpU3ltbWV0cmljTWF0cml4WyAwIF0gKSApLFxuICAgICAgbWF0cml4WyAxIF0ucGx1cyggYWxwaGEudGltZXMoIGFudGlTeW1tZXRyaWNNYXRyaXhbIDEgXSApICksXG4gICAgICBtYXRyaXhbIDIgXS5wbHVzKCBhbHBoYS50aW1lcyggYW50aVN5bW1ldHJpY01hdHJpeFsgMiBdICkgKSxcbiAgICAgIG1hdHJpeFsgMyBdLnBsdXMoIGFscGhhLnRpbWVzKCBhbnRpU3ltbWV0cmljTWF0cml4WyAzIF0gKSApLFxuICAgICAgbWF0cml4WyA0IF0ucGx1cyggYWxwaGEudGltZXMoIGFudGlTeW1tZXRyaWNNYXRyaXhbIDQgXSApICksXG4gICAgICBtYXRyaXhbIDUgXS5wbHVzKCBhbHBoYS50aW1lcyggYW50aVN5bW1ldHJpY01hdHJpeFsgNSBdICkgKSxcbiAgICAgIG1hdHJpeFsgNiBdLnBsdXMoIGFscGhhLnRpbWVzKCBhbnRpU3ltbWV0cmljTWF0cml4WyA2IF0gKSApLFxuICAgICAgbWF0cml4WyA3IF0ucGx1cyggYWxwaGEudGltZXMoIGFudGlTeW1tZXRyaWNNYXRyaXhbIDcgXSApICksXG4gICAgICBtYXRyaXhbIDggXS5wbHVzKCBhbHBoYS50aW1lcyggYW50aVN5bW1ldHJpY01hdHJpeFsgOCBdICkgKVxuICAgIF07XG4gIH1cbn07XG5cbi8qKlxuICogQSBkZWdlbmVyYXRlIGNvbmljIGlzIGVzc2VudGlhbGx5IGEgcHJvZHVjdCBvZiB0d28gbGluZXMsIGUuZy4gKFB4ICsgUXkgKyBDKShTeCArIFR5ICsgVSkgPSAwICh3aGVyZSBldmVyeXRoaW5nIGlzXG4gKiBjb21wbGV4IHZhbHVlZCBpbiB0aGlzIGNhc2UpLiBFYWNoIGxpbmUgaXMgdG9wb2xvZ2ljYWxseSBlcXVpdmFsZW50IHRvIGEgcGxhbmUuXG4gKi9cbmNvbnN0IGdldFJlYWxJbnRlcnNlY3Rpb25zRm9yRGVnZW5lcmF0ZUNvbmljID0gKCBtYXRyaXg6IENvbXBsZXhbXSApOiAoIFZlY3RvcjIgfCBSYXkyIClbXSA9PiB7XG4gIC8vIFRPRE86IGNoZWNrIHdoZXRoZXIgd2UgYXJlIHN5bW1ldHJpYy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzk3XG4gIGNvbnN0IHJlc3VsdDogKCBWZWN0b3IyIHwgUmF5MiApW10gPSBbXTtcblxuICB0eXBlIENvbXBsZXhYWSA9IFsgQ29tcGxleCwgQ29tcGxleCBdO1xuXG4gIC8vIEF4XjIgKyBCeHkgKyBDeV4yICsgRHggKyBFeSArIEYgPSAwIChjb21wbGV4IHZhbHVlZClcbiAgY29uc3QgQSA9IG1hdHJpeFsgMCBdO1xuICBjb25zdCBCID0gbWF0cml4WyAxIF0udGltZXMoIENvbXBsZXgucmVhbCggMiApICk7XG4gIGNvbnN0IEMgPSBtYXRyaXhbIDQgXTtcbiAgY29uc3QgRCA9IG1hdHJpeFsgMiBdLnRpbWVzKCBDb21wbGV4LnJlYWwoIDIgKSApO1xuICBjb25zdCBFID0gbWF0cml4WyA1IF0udGltZXMoIENvbXBsZXgucmVhbCggMiApICk7XG4gIGNvbnN0IEYgPSBtYXRyaXhbIDggXTtcblxuICAvLyBjb25zdCBldiA9ICggeDogQ29tcGxleCwgeTogQ29tcGxleCApID0+IHtcbiAgLy8gICByZXR1cm4gQS50aW1lcyggeCApLnRpbWVzKCB4IClcbiAgLy8gICAgIC5wbHVzKCBCLnRpbWVzKCB4ICkudGltZXMoIHkgKSApXG4gIC8vICAgICAucGx1cyggQy50aW1lcyggeSApLnRpbWVzKCB5ICkgKVxuICAvLyAgICAgLnBsdXMoIEQudGltZXMoIHggKSApXG4gIC8vICAgICAucGx1cyggRS50aW1lcyggeSApIClcbiAgLy8gICAgIC5wbHVzKCBGICk7XG4gIC8vIH07XG5cbiAgLy8gV2UnbGwgbm93IGZpbmQgKGlkZWFsbHkpIHR3byBzb2x1dGlvbnMgZm9yIHRoZSBjb25pYywgc3VjaCB0aGF0IHRoZXkgYXJlIGVhY2ggb24gb25lIG9mIHRoZSBsaW5lc1xuICBsZXQgc29sdXRpb25zOiBDb21wbGV4WFlbXSA9IFtdO1xuICBjb25zdCBhbHBoYSA9IG5ldyBDb21wbGV4KCAtMi41MTY1MzUyNTY5Njk1OSwgMS41MjkyODUwMjg0NDAyMCApOyAvLyByYW5kb21seSBjaG9zZW5cbiAgLy8gZmlyc3QgdHJ5IHBpY2tpbmcgYW4geCBhbmQgc29sdmUgZm9yIG11bHRpcGxlIHkgKHg9YWxwaGEpXG4gIC8vIChDKXleMiArIChCKmFscGhhICsgRSl5ICsgKEEqYWxwaGFeMiArIEQqYWxwaGEgKyBGKSA9IDBcbiAgY29uc3QgeEFscGhhQSA9IEM7XG4gIGNvbnN0IHhBbHBoYUIgPSBCLnRpbWVzKCBhbHBoYSApLnBsdXMoIEUgKTtcbiAgY29uc3QgeEFscGhhQyA9IEEudGltZXMoIGFscGhhICkudGltZXMoIGFscGhhICkucGx1cyggRC50aW1lcyggYWxwaGEgKSApLnBsdXMoIEYgKTtcbiAgY29uc3QgeEFscGhhUm9vdHMgPSBDb21wbGV4LnNvbHZlUXVhZHJhdGljUm9vdHMoIHhBbHBoYUEsIHhBbHBoYUIsIHhBbHBoYUMgKTtcbiAgaWYgKCB4QWxwaGFSb290cyAmJiB4QWxwaGFSb290cy5sZW5ndGggPj0gMiApIHtcbiAgICBzb2x1dGlvbnMgPSBbXG4gICAgICBbIGFscGhhLCB4QWxwaGFSb290c1sgMCBdIF0sXG4gICAgICBbIGFscGhhLCB4QWxwaGFSb290c1sgMSBdIF1cbiAgICBdO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIE5vdyB0cnkgeT1hbHBoYVxuICAgIC8vIChBKXheMiArIChCKmFscGhhICsgRCl4ICsgKEMqYWxwaGFeMiArIEUqYWxwaGEgKyBGKSA9IDBcbiAgICBjb25zdCB5QWxwaGFBID0gQTtcbiAgICBjb25zdCB5QWxwaGFCID0gQi50aW1lcyggYWxwaGEgKS5wbHVzKCBEICk7XG4gICAgY29uc3QgeUFscGhhQyA9IEMudGltZXMoIGFscGhhICkudGltZXMoIGFscGhhICkucGx1cyggRS50aW1lcyggYWxwaGEgKSApLnBsdXMoIEYgKTtcbiAgICBjb25zdCB5QWxwaGFSb290cyA9IENvbXBsZXguc29sdmVRdWFkcmF0aWNSb290cyggeUFscGhhQSwgeUFscGhhQiwgeUFscGhhQyApO1xuICAgIGlmICggeUFscGhhUm9vdHMgJiYgeUFscGhhUm9vdHMubGVuZ3RoID49IDIgKSB7XG4gICAgICBzb2x1dGlvbnMgPSBbXG4gICAgICAgIFsgeUFscGhhUm9vdHNbIDAgXSwgYWxwaGEgXSxcbiAgICAgICAgWyB5QWxwaGFSb290c1sgMSBdLCBhbHBoYSBdXG4gICAgICBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFNlbGVjdCBvbmx5IG9uZSByb290IGlmIHdlIGhhdmUgaXQsIHdlIG1pZ2h0IGhhdmUgYSBkb3VibGUgbGluZVxuICAgICAgaWYgKCB4QWxwaGFSb290cyAmJiB4QWxwaGFSb290cy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgIHNvbHV0aW9ucyA9IFtcbiAgICAgICAgICBbIGFscGhhLCB4QWxwaGFSb290c1sgMCBdIF1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB5QWxwaGFSb290cyAmJiB5QWxwaGFSb290cy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgIHNvbHV0aW9ucyA9IFtcbiAgICAgICAgICBbIHlBbHBoYVJvb3RzWyAwIF0sIGFscGhhIF1cbiAgICAgICAgXTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdJbXBsZW1lbnQgbW9yZSBhZHZhbmNlZCBpbml0aWFsaXphdGlvbiB0byBmaW5kIHR3byBzb2x1dGlvbnMnICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc29sdXRpb25zLmZvckVhY2goICggc29sdXRpb246IENvbXBsZXhYWSApID0+IHtcbiAgICAvLyBIZXJlLCB3ZSdsbCBiZSBicmVha2luZyBvdXQgdGhlIGNvbXBsZXggeCx5IGludG8gcXVhZHMgb2Y6IFsgcmVhbFgsIHJlYWxZLCBpbWFnaW5hcnlYLCBpbWFnaW5hcnlZIF0gZGVub3RlZCBhc1xuICAgIC8vIFsgcngsIHJ5LCBpeCwgaXkgXS5cblxuICAgIC8qKlxuICAgICAqIEJyb2tlbiBjYXNlOlxuICAgICAgQVxuICAgICAgQ29tcGxleCB7cmVhbDogLTIuMzA2MjgxNjAzNDcwMjM5NGUtNywgaW1hZ2luYXJ5OiAtMC4wMDAwNTAwMDE2MjMxMDA5MTg3NDZ9XG4gICAgICBCXG4gICAgICBDb21wbGV4IHtyZWFsOiAwLCBpbWFnaW5hcnk6IDB9XG4gICAgICBDXG4gICAgICBDb21wbGV4IHtyZWFsOiAtMi4zMDYyODE2MDM0NzAyMzk0ZS03LCBpbWFnaW5hcnk6IC0wLjAwMDA1MDAwMTYyMzEwMDkxODc0Nn1cbiAgICAgIERcbiAgICAgIENvbXBsZXgge3JlYWw6IC0wLjAwOTkwNzc0ODczNTgyNzIyNiwgaW1hZ2luYXJ5OiAwLjAyMDAwMDY0OTI0MDM2NzV9XG4gICAgICBFXG4gICAgICBDb21wbGV4IHtyZWFsOiAwLjAwMDA5MjI1MTI2NDE2MzY3ODU3LCBpbWFnaW5hcnk6IDAuMDIwMDAwNjQ5MjQwMzY3NX1cbiAgICAgIEZcbiAgICAgIENvbXBsZXgge3JlYWw6IDEuOTgzODgxMDI4Nzc2NTIyNywgaW1hZ2luYXJ5OiAtMy41MDAxMTM2MTcwNjQzMTIzfVxuXG5cbiAgICAgcmVhbDogMjAwLjAwMjUsIDEwMCAgIGFuZCAyMDAuMDAyNSwgMzAwICAgIGFyZSBiZXR0ZXIgc29sdXRpb25zLCBidXQgb2J2aW91c2x5IGNvdWxkIGJlIHJlZmluZWRcbiAgICAgKi9cblxuICAgIGNvbnN0IHJ4ID0gc29sdXRpb25bIDAgXS5yZWFsO1xuICAgIGNvbnN0IHJ5ID0gc29sdXRpb25bIDEgXS5yZWFsO1xuICAgIGNvbnN0IGl4ID0gc29sdXRpb25bIDAgXS5pbWFnaW5hcnk7XG4gICAgY29uc3QgaXkgPSBzb2x1dGlvblsgMSBdLmltYWdpbmFyeTtcbiAgICBjb25zdCByQSA9IEEucmVhbDtcbiAgICBjb25zdCByQiA9IEIucmVhbDtcbiAgICBjb25zdCByQyA9IEMucmVhbDtcbiAgICBjb25zdCByRCA9IEQucmVhbDtcbiAgICBjb25zdCByRSA9IEUucmVhbDtcbiAgICBjb25zdCBpQSA9IEEuaW1hZ2luYXJ5O1xuICAgIGNvbnN0IGlCID0gQi5pbWFnaW5hcnk7XG4gICAgY29uc3QgaUMgPSBDLmltYWdpbmFyeTtcbiAgICBjb25zdCBpRCA9IEQuaW1hZ2luYXJ5O1xuICAgIGNvbnN0IGlFID0gRS5pbWFnaW5hcnk7XG5cbiAgICB0eXBlIEV4cGFuZGVkUmVhbFhZID0gVmVjdG9yNDsgLy8gcngsIHJ5LCBpeCwgaXlcblxuICAgIGNvbnN0IHJlYWxHcmFkaWVudDogRXhwYW5kZWRSZWFsWFkgPSBuZXcgVmVjdG9yNChcbiAgICAgIC0yICogaUEgKiBpeCAtIGlCICogaXkgKyByRCArIDIgKiByQSAqIHJ4ICsgckIgKiByeSxcbiAgICAgIC1pQiAqIGl4IC0gMiAqIGlDICogaXkgKyByRSArIHJCICogcnggKyAyICogckMgKiByeSxcbiAgICAgIC1pRCAtIDIgKiBpeCAqIHJBIC0gaXkgKiByQiAtIDIgKiBpQSAqIHJ4IC0gaUIgKiByeSxcbiAgICAgIC1pRSAtIGl4ICogckIgLSAyICogaXkgKiByQyAtIGlCICogcnggLSAyICogaUMgKiByeVxuICAgICk7XG5cbiAgICAvLyBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdXG4gICAgY29uc3QgaW1hZ2luYXJ5R3JhZGllbnQ6IEV4cGFuZGVkUmVhbFhZID0gbmV3IFZlY3RvcjQoXG4gICAgICBpRCArIDIgKiBpeCAqIHJBICsgaXkgKiByQiArIDIgKiBpQSAqIHJ4ICsgaUIgKiByeSxcbiAgICAgIGlFICsgaXggKiByQiArIDIgKiBpeSAqIHJDICsgaUIgKiByeCArIDIgKiBpQyAqIHJ5LFxuICAgICAgLTIgKiBpQSAqIGl4IC0gaUIgKiBpeSArIHJEICsgMiAqIHJBICogcnggKyByQiAqIHJ5LFxuICAgICAgLWlCICogaXggLSAyICogaUMgKiBpeSArIHJFICsgckIgKiByeCArIDIgKiByQyAqIHJ5XG4gICAgKTtcblxuICAgIGNvbnN0IHJhbmRvbVBvaW50QTogRXhwYW5kZWRSZWFsWFkgPSBuZXcgVmVjdG9yNChcbiAgICAgIDYuMTk1MTA2ODU0ODI1MyxcbiAgICAgIC0xLjE1OTI2ODk1MDM4NjAsXG4gICAgICAwLjE2MDI5MTg4MjkyOTQsXG4gICAgICAzLjIwNTgxODY5MjA0ODIwMlxuICAgICk7XG5cbiAgICBjb25zdCByYW5kb21Qb2ludEI6IEV4cGFuZGVkUmVhbFhZID0gbmV3IFZlY3RvcjQoXG4gICAgICAtNS40MjA2Mjg1NDkyOTY5MjQsXG4gICAgICAtMTUuMjA2OTU4MzAyODY4NSxcbiAgICAgIDAuMTU5NTkwNjAyMDQ4ODY4MCxcbiAgICAgIDUuMTA2ODgyODgwNDA2ODJcbiAgICApO1xuXG4gICAgY29uc3QgcHJvaiA9ICggdjogRXhwYW5kZWRSZWFsWFksIHU6IEV4cGFuZGVkUmVhbFhZICkgPT4ge1xuICAgICAgcmV0dXJuIHUudGltZXNTY2FsYXIoIHYuZG90KCB1ICkgLyB1LmRvdCggdSApICk7XG4gICAgfTtcblxuICAgIC8vIEdyYW0tU2NobWlkdCBvcnRob2dvbmFsaXphdGlvbiB0byBnZXQgYSBuaWNlIGJhc2lzXG4gICAgY29uc3QgYmFzaXNSZWFsR3JhZGllbnQgPSByZWFsR3JhZGllbnQ7XG4gICAgY29uc3QgYmFzaXNJbWFnaW5hcnlHcmFkaWVudCA9IGltYWdpbmFyeUdyYWRpZW50XG4gICAgICAubWludXMoIHByb2ooIGltYWdpbmFyeUdyYWRpZW50LCBiYXNpc1JlYWxHcmFkaWVudCApICk7XG4gICAgY29uc3QgYmFzaXNQbGFuZTAgPSByYW5kb21Qb2ludEFcbiAgICAgIC5taW51cyggcHJvaiggcmFuZG9tUG9pbnRBLCBiYXNpc1JlYWxHcmFkaWVudCApIClcbiAgICAgIC5taW51cyggcHJvaiggcmFuZG9tUG9pbnRBLCBiYXNpc0ltYWdpbmFyeUdyYWRpZW50ICkgKTtcbiAgICBjb25zdCBiYXNpc1BsYW5lMSA9IHJhbmRvbVBvaW50QlxuICAgICAgLm1pbnVzKCBwcm9qKCByYW5kb21Qb2ludEIsIGJhc2lzUmVhbEdyYWRpZW50ICkgKVxuICAgICAgLm1pbnVzKCBwcm9qKCByYW5kb21Qb2ludEIsIGJhc2lzSW1hZ2luYXJ5R3JhZGllbnQgKSApXG4gICAgICAubWludXMoIHByb2ooIHJhbmRvbVBvaW50QiwgYmFzaXNQbGFuZTAgKSApO1xuXG4gICAgLy8gT3VyIGJhc2lzIGluIHRoZSBleGNsdXNpdmVseS1pbWFnaW5hcnkgcGxhbmVcbiAgICBjb25zdCBiYXNpc01hdHJpeCA9IG5ldyBNYXRyaXgoIDIsIDIsIFtcbiAgICAgIGJhc2lzUGxhbmUwLnosIGJhc2lzUGxhbmUxLnosXG4gICAgICBiYXNpc1BsYW5lMC53LCBiYXNpc1BsYW5lMS53XG4gICAgXSApO1xuICAgIGNvbnN0IHNpbmd1bGFyVmFsdWVzID0gbmV3IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uKCBiYXNpc01hdHJpeCApLmdldFNpbmd1bGFyVmFsdWVzKCk7XG5cbiAgICBsZXQgcmVhbFNvbHV0aW9uOiBWZWN0b3IyIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKCBNYXRoLmFicyggaXggKSA8IDFlLTEwICYmIE1hdGguYWJzKCBpeSApIDwgMWUtMTAgKSB7XG5cbiAgICAgIHJlYWxTb2x1dGlvbiA9IG5ldyBWZWN0b3IyKCByeCwgcnkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBpUCArIHQgKiBpQjAgKyB1ICogaUIxID0gMCwgaWYgd2UgY2FuIGZpbmQgdCx1IHdoZXJlIChQICsgdCAqIEIwICsgdSAqIEIxKSBpcyByZWFsXG4gICAgICAvL1xuICAgICAgLy8gWyBpQjB4IElCMXggXSBbIHQgXSA9IFsgLWlQeCBdXG4gICAgICAvLyBbIGlCMHkgSUIxeSBdIFsgdSBdICAgWyAtaVB5IF1cblxuICAgICAgaWYgKCBNYXRoLmFicyggc2luZ3VsYXJWYWx1ZXNbIDEgXSApID4gMWUtMTAgKSB7XG4gICAgICAgIC8vIHJhbmsgMlxuICAgICAgICBjb25zdCB0dSA9IGJhc2lzTWF0cml4LnNvbHZlKCBuZXcgTWF0cml4KCAyLCAxLCBbIC1peCwgLWl5IF0gKSApLmV4dHJhY3RWZWN0b3IyKCAwICk7XG4gICAgICAgIHJlYWxTb2x1dGlvbiA9IG5ldyBWZWN0b3IyKFxuICAgICAgICAgIHJ4ICsgdHUueCAqIGJhc2lzUGxhbmUwLnogKyB0dS55ICogYmFzaXNQbGFuZTEueixcbiAgICAgICAgICByeSArIHR1LnggKiBiYXNpc1BsYW5lMC53ICsgdHUueSAqIGJhc2lzUGxhbmUxLndcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBNYXRoLmFicyggc2luZ3VsYXJWYWx1ZXNbIDAgXSApID4gMWUtMTAgKSB7XG4gICAgICAgIC8vIHJhbmsgMSAtIGNvbHVtbnMgYXJlIG11bHRpcGxlcyBvZiBlYWNoIG90aGVyLCBvbmUgcG9zc2libHkgKDAsMClcblxuICAgICAgICAvLyBGb3IgaW1hZ2luYXJ5IGJhc2VzICh3ZSdsbCB1c2UgdGhlbSBwb3RlbnRpYWxseSBtdWx0aXBsZSB0aW1lcyBpZiB3ZSBoYXZlIGEgcmFuayAxIG1hdHJpeFxuICAgICAgICBjb25zdCBsYXJnZXN0QmFzaXMgPSBNYXRoLmFicyggYmFzaXNQbGFuZTAueiApICsgTWF0aC5hYnMoIGJhc2lzUGxhbmUwLncgKSA+IE1hdGguYWJzKCBiYXNpc1BsYW5lMS56ICkgKyBNYXRoLmFicyggYmFzaXNQbGFuZTEudyApID8gYmFzaXNQbGFuZTAgOiBiYXNpc1BsYW5lMTtcbiAgICAgICAgY29uc3QgbGFyZ2VzdEJhc2lzSW1hZ2luYXJ5VmVjdG9yID0gbmV3IFZlY3RvcjIoIGxhcmdlc3RCYXNpcy56LCBsYXJnZXN0QmFzaXMudyApO1xuXG4gICAgICAgIGNvbnN0IHQgPSBuZXcgVmVjdG9yMiggaXgsIGl5ICkuZG90KCBsYXJnZXN0QmFzaXNJbWFnaW5hcnlWZWN0b3IgKSAvIGxhcmdlc3RCYXNpc0ltYWdpbmFyeVZlY3Rvci5kb3QoIGxhcmdlc3RCYXNpc0ltYWdpbmFyeVZlY3RvciApO1xuICAgICAgICBjb25zdCBwb3RlbnRpYWxTb2x1dGlvbiA9IG5ldyBWZWN0b3I0KCByeCwgcnksIGl4LCBpeSApLm1pbnVzKCBsYXJnZXN0QmFzaXMudGltZXNTY2FsYXIoIHQgKSApO1xuICAgICAgICBpZiAoIE1hdGguYWJzKCBwb3RlbnRpYWxTb2x1dGlvbi56ICkgPCAxZS04ICYmIE1hdGguYWJzKCBwb3RlbnRpYWxTb2x1dGlvbi53ICkgPCAxZS04ICkge1xuICAgICAgICAgIHJlYWxTb2x1dGlvbiA9IG5ldyBWZWN0b3IyKCBwb3RlbnRpYWxTb2x1dGlvbi54LCBwb3RlbnRpYWxTb2x1dGlvbi55ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyByYW5rIDAgQU5EIG91ciBzb2x1dGlvbiBpcyBOT1QgcmVhbCwgdGhlbiB0aGVyZSBpcyBubyBzb2x1dGlvblxuICAgICAgICByZWFsU29sdXRpb24gPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHJlYWxTb2x1dGlvbiApIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBjaGVjayBpZiB3ZSBoYXZlIGEgbGluZSBvZiBzb2x1dGlvbnMgbm93IVxuICAgICAgICBpZiAoIE1hdGguYWJzKCBzaW5ndWxhclZhbHVlc1sgMSBdICkgPiAxZS0xMCApIHtcbiAgICAgICAgICAvLyByYW5rIDJcbiAgICAgICAgICAvLyBPdXIgc29sdXRpb24gaXMgdGhlIG9ubHkgc29sdXRpb24gKG5vIGxpbmVhciBjb21iaW5hdGlvbiBvZiBiYXNpcyB2ZWN0b3JzIGJlc2lkZXMgb3VyIGN1cnJlbnQgc29sdXRpb25cbiAgICAgICAgICAvLyB0aGF0IHdvdWxkIGJlIHJlYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2goIHJlYWxTb2x1dGlvbiApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCBNYXRoLmFicyggc2luZ3VsYXJWYWx1ZXNbIDAgXSApID4gMWUtMTAgKSB7XG4gICAgICAgICAgLy8gcmFuayAxXG4gICAgICAgICAgLy8gT3VyIGJhc2VzIGFyZSBhIG11bHRpcGxlIG9mIGVhY2ggb3RoZXIuIFdlIG5lZWQgdG8gZmluZCBhIGxpbmVhciBjb21iaW5hdGlvbiBvZiB0aGVtIHRoYXQgaXMgcmVhbCwgdGhlblxuICAgICAgICAgIC8vIGV2ZXJ5IG11bHRpcGxlIG9mIHRoYXQgd2lsbCBiZSBhIHNvbHV0aW9uIChsaW5lKS4gSWYgZWl0aGVyIGlzICgwLDApLCB3ZSB3aWxsIHVzZSB0aGF0IG9uZSwgc28gY2hlY2sgdGhhdFxuICAgICAgICAgIC8vIGZpcnN0XG4gICAgICAgICAgLy8gVE9ETzogY2FuIHdlIGRlZHVwbGljYXRlIHRoaXMgd2l0aCBjb2RlIGFib3ZlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOTdcbiAgICAgICAgICBjb25zdCB6ZXJvTGFyZ2VyID0gTWF0aC5hYnMoIGJhc2lzUGxhbmUwLnogKSArIE1hdGguYWJzKCBiYXNpc1BsYW5lMC53ICkgPiBNYXRoLmFicyggYmFzaXNQbGFuZTEueiApICsgTWF0aC5hYnMoIGJhc2lzUGxhbmUxLncgKTtcbiAgICAgICAgICBjb25zdCBzbWFsbGVzdEJhc2lzID0gemVyb0xhcmdlciA/IGJhc2lzUGxhbmUxIDogYmFzaXNQbGFuZTA7XG4gICAgICAgICAgY29uc3QgbGFyZ2VzdEJhc2lzID0gemVyb0xhcmdlciA/IGJhc2lzUGxhbmUwIDogYmFzaXNQbGFuZTE7XG5cbiAgICAgICAgICAvLyBGaW5kIHRoZSBsYXJnZXN0IGNvbXBvbmVudCwgc28gaWYgd2UgaGF2ZSBhIHplcm8geCBvciB5IGluIGJvdGggb3VyIGJhc2VzLCBpdCB3aWxsIHdvcmsgb3V0IGZpbmVcbiAgICAgICAgICBjb25zdCB4TGFyZ2VyID0gTWF0aC5hYnMoIGxhcmdlc3RCYXNpcy56ICkgPiBNYXRoLmFicyggbGFyZ2VzdEJhc2lzLncgKTtcblxuICAgICAgICAgIC8vIGxhcmdlc3RCYXNpcyAqIHQgPSBzbWFsbGVzdEJhc2lzLCBzdXBwb3J0cyBzbWFsbGVzdEJhc2lzPSgwLDApXG4gICAgICAgICAgY29uc3QgdCA9IHhMYXJnZXIgPyAoIHNtYWxsZXN0QmFzaXMueiAvIGxhcmdlc3RCYXNpcy56ICkgOiAoIHNtYWxsZXN0QmFzaXMudyAvIGxhcmdlc3RCYXNpcy53ICk7XG5cbiAgICAgICAgICBjb25zdCBkaXJlY3Rpb240ID0gbGFyZ2VzdEJhc2lzLnRpbWVzU2NhbGFyKCB0ICkubWludXMoIHNtYWxsZXN0QmFzaXMgKTtcblxuICAgICAgICAgIC8vIFNob3VsZCBiZSB1bmNvbmRpdGlvbmFsbHkgYSBub24temVybyBkaXJlY3Rpb24sIG90aGVyd2lzZSB0aGV5IHdvdWxkbid0IGJlIGJhc2lzIHZlY3RvcnNcbiAgICAgICAgICByZXN1bHQucHVzaCggbmV3IFJheTIoIHJlYWxTb2x1dGlvbiwgbmV3IFZlY3RvcjIoIGRpcmVjdGlvbjQueCwgZGlyZWN0aW9uNC55ICkubm9ybWFsaXplZCgpICkgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyByYW5rIDBcbiAgICAgICAgICAvLyBUSEVZIEFSRSBBTEwgU09MVVRJT05TLCB3ZSdyZSBvbiB0aGUgcmVhbCBwbGFuZS4gVGhhdCBpc24ndCB1c2VmdWwgdG8gdXMsIHNvIHdlIGRvbid0IGFkZCBhbnkgcmVzdWx0c1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ICk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IGdldExpbmVzRm9yRGVnZW5lcmF0ZUNvbmljID0gKCBtYXRyaXg6IENvbXBsZXhbXSApOiBDb21wbGV4W11bXSA9PiB7XG4gIGNvbnN0IHJhbmsxRGVnZW5lcmF0ZUNvbmljTWF0cml4ID0gZ2V0UmFuazFEZWdlbmVyYXRlQ29uaWNNYXRyaXgoIG1hdHJpeCApO1xuICByZXR1cm4gW1xuICAgIGdldE5vbnplcm9Sb3coIHJhbmsxRGVnZW5lcmF0ZUNvbmljTWF0cml4ICksXG4gICAgZ2V0Tm9uemVyb0NvbHVtbiggcmFuazFEZWdlbmVyYXRlQ29uaWNNYXRyaXggKVxuICBdO1xufTtcblxuY29uc3QgbGluZUludGVyc2VjdCA9ICggbGluZTE6IENvbXBsZXhbXSwgbGluZTI6IENvbXBsZXhbXSApOiBWZWN0b3IyIHwgbnVsbCA9PiB7XG4gIC8vIGxpbmUxOiBhMSAqIHggKyBiMSAqIHkgKyBjMSA9IDBcbiAgLy8gbGluZTI6IGEyICogeCArIGIyICogeSArIGMyID0gMFxuICAvLyB5ID0gKCAtYTEgKiB4IC0gYzEgKSAvIGIxXG4gIC8vIHkgPSAoIC1hMiAqIHggLSBjMiApIC8gYjJcbiAgLy8gKCAtYTEgKiB4IC0gYzEgKSAvIGIxID0gKCAtYTIgKiB4IC0gYzIgKSAvIGIyXG4gIC8vICggLWExICogeCAtIGMxICkgKiBiMiA9ICggLWEyICogeCAtIGMyICkgKiBiMVxuXG4gIC8vIHggPSAoIGIyICogYzEgLSBiMSAqIGMyICkgLyAoIGEyICogYjEgLSBhMSAqIGIyICk7XG5cbiAgY29uc3QgYTEgPSBsaW5lMVsgMCBdO1xuICBjb25zdCBiMSA9IGxpbmUxWyAxIF07XG4gIGNvbnN0IGMxID0gbGluZTFbIDIgXTtcbiAgY29uc3QgYTIgPSBsaW5lMlsgMCBdO1xuICBjb25zdCBiMiA9IGxpbmUyWyAxIF07XG4gIGNvbnN0IGMyID0gbGluZTJbIDIgXTtcblxuICBjb25zdCBkZXRlcm1pbmFudCA9IGEyLnRpbWVzKCBiMSApLm1pbnVzKCBhMS50aW1lcyggYjIgKSApO1xuICBpZiAoIGRldGVybWluYW50LmVxdWFsc0Vwc2lsb24oIENvbXBsZXguWkVSTywgMWUtOCApICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGVsc2Uge1xuICAgIGNvbnN0IHggPSBiMi50aW1lcyggYzEgKS5taW51cyggYjEudGltZXMoIGMyICkgKS5kaXZpZGVkQnkoIGRldGVybWluYW50ICk7XG5cbiAgICBsZXQgeTtcbiAgICBpZiAoICFiMS5lcXVhbHNFcHNpbG9uKCBDb21wbGV4LlpFUk8sIDFlLTggKSApIHtcbiAgICAgIHkgPSBhMS5uZWdhdGVkKCkudGltZXMoIHggKS5taW51cyggYzEgKS5kaXZpZGVkQnkoIGIxICk7IC8vIFVzZSBvdXIgZmlyc3QgbGluZVxuICAgIH1cbiAgICBlbHNlIGlmICggIWIyLmVxdWFsc0Vwc2lsb24oIENvbXBsZXguWkVSTywgMWUtOCApICkge1xuICAgICAgeSA9IGEyLm5lZ2F0ZWQoKS50aW1lcyggeCApLm1pbnVzKCBjMiApLmRpdmlkZWRCeSggYjIgKTsgLy8gVXNlIG91ciBzZWNvbmQgbGluZVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGVwc2lsb24gZXZhbHVhdGlvbj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzk3XG4gICAgaWYgKCBNYXRoLmFicyggeC5pbWFnaW5hcnkgKSA8IDFlLTggJiYgTWF0aC5hYnMoIHkuaW1hZ2luYXJ5ICkgPCAxZS04ICkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LnJlYWwsIHkucmVhbCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufTtcblxudHlwZSBDb25pY01hdHJpeEludGVyc2VjdGlvbnMgPSB7XG4gIHBvaW50czogVmVjdG9yMltdO1xuICBkZWdlbmVyYXRlQ29uaWNNYXRyaWNlczogQ29tcGxleFtdW107XG4gIGxpbmVzOiBDb21wbGV4W11bXTtcbiAgaW50ZXJzZWN0aW9uQ29sbGVjdGlvbnM6ICggVmVjdG9yMiB8IFJheTIgKVtdW107XG59O1xuXG4vLyBOT1RFOiBBc3N1bWVzIHRoZXNlIG1hdHJpY2VzIGFyZSBOT1QgZGVnZW5lcmF0ZSAod2lsbCBvbmx5IGJlIHRlc3RlZCBmb3IgY2lyY2xlcy9lbGxpcHNlcylcbmNvbnN0IGludGVyc2VjdENvbmljTWF0cmljZXMgPSAoIGE6IE1hdHJpeDMsIGI6IE1hdHJpeDMgKTogQ29uaWNNYXRyaXhJbnRlcnNlY3Rpb25zID0+IHtcbiAgLy8gTW9kZWxlZCBvZmYgb2ZcblxuICAvLyBjb21wdXRlIEMgPSBsYW1iZGEgKiBBICsgQiwgd2hlcmUgbGFtYmRhIGlzIGNob3NlbiBzbyB0aGF0IGRldChDKSA9IDBcbiAgLy8gTk9URTogVGhpcyBhc3N1bWVzIHdlIGRvbid0IGhhdmUgZGVnZW5lcmF0ZSBjb25pYyBtYXRyaWNlc1xuXG4gIC8vIGRldChDKSA9IGMwMCAqIGMxMSAqIGMyMiArIGMwMSAqIGMxMiAqIGMyMCArIGMwMiAqIGMxMCAqIGMyMSAtIGMwMiAqIGMxMSAqIGMyMCAtIGMwMSAqIGMxMCAqIGMyMiAtIGMwMCAqIGMxMiAqIGMyMVxuICAvLyBjMDAgPSBhMDAgKiBsYW1iZGEgKyBiMDBcbiAgLy8gYzAxID0gYTAxICogbGFtYmRhICsgYjAxXG4gIC8vIGMwMiA9IGEwMiAqIGxhbWJkYSArIGIwMlxuICAvLyBjMTAgPSBhMTAgKiBsYW1iZGEgKyBiMTBcbiAgLy8gYzExID0gYTExICogbGFtYmRhICsgYjExXG4gIC8vIGMxMiA9IGExMiAqIGxhbWJkYSArIGIxMlxuICAvLyBjMjAgPSBhMjAgKiBsYW1iZGEgKyBiMjBcbiAgLy8gYzIxID0gYTIxICogbGFtYmRhICsgYjIxXG4gIC8vIGMyMiA9IGEyMiAqIGxhbWJkYSArIGIyMlxuXG4gIC8vIEEgbGFtYmRhXjMgKyBCIGxhbWJkYV4yICsgQyBsYW1iZGEgKyBEID0gMFxuXG4gIGNvbnN0IGEwMCA9IGEubTAwKCk7XG4gIGNvbnN0IGEwMSA9IGEubTAxKCk7XG4gIGNvbnN0IGEwMiA9IGEubTAyKCk7XG4gIGNvbnN0IGExMCA9IGEubTEwKCk7XG4gIGNvbnN0IGExMSA9IGEubTExKCk7XG4gIGNvbnN0IGExMiA9IGEubTEyKCk7XG4gIGNvbnN0IGEyMCA9IGEubTIwKCk7XG4gIGNvbnN0IGEyMSA9IGEubTIxKCk7XG4gIGNvbnN0IGEyMiA9IGEubTIyKCk7XG4gIGNvbnN0IGIwMCA9IGIubTAwKCk7XG4gIGNvbnN0IGIwMSA9IGIubTAxKCk7XG4gIGNvbnN0IGIwMiA9IGIubTAyKCk7XG4gIGNvbnN0IGIxMCA9IGIubTEwKCk7XG4gIGNvbnN0IGIxMSA9IGIubTExKCk7XG4gIGNvbnN0IGIxMiA9IGIubTEyKCk7XG4gIGNvbnN0IGIyMCA9IGIubTIwKCk7XG4gIGNvbnN0IGIyMSA9IGIubTIxKCk7XG4gIGNvbnN0IGIyMiA9IGIubTIyKCk7XG5cbiAgY29uc3QgQSA9IC1hMDIgKiBhMTEgKiBhMjAgKyBhMDEgKiBhMTIgKiBhMjAgKyBhMDIgKiBhMTAgKiBhMjEgLSBhMDAgKiBhMTIgKiBhMjEgLSBhMDEgKiBhMTAgKiBhMjIgKyBhMDAgKiBhMTEgKiBhMjI7XG4gIGNvbnN0IEIgPSAtYTEwICogYTIyICogYjAxICsgYTEwICogYTIxICogYjAyICsgYTAyICogYTIxICogYjEwIC0gYTAxICogYTIyICogYjEwIC0gYTAyICogYTIwICogYjExICsgYTAwICogYTIyICogYjExICsgYTAxICogYTIwICogYjEyIC0gYTAwICogYTIxICogYjEyICsgYTAyICogYTEwICogYjIxICsgYTEyICogKCAtYTIxICogYjAwICsgYTIwICogYjAxICsgYTAxICogYjIwIC0gYTAwICogYjIxICkgLSBhMDEgKiBhMTAgKiBiMjIgKyBhMTEgKiAoIGEyMiAqIGIwMCAtIGEyMCAqIGIwMiAtIGEwMiAqIGIyMCArIGEwMCAqIGIyMiApO1xuICBjb25zdCBDID0gLWEyMiAqIGIwMSAqIGIxMCArIGEyMSAqIGIwMiAqIGIxMCArIGEyMiAqIGIwMCAqIGIxMSAtIGEyMCAqIGIwMiAqIGIxMSAtIGEyMSAqIGIwMCAqIGIxMiArIGEyMCAqIGIwMSAqIGIxMiArIGExMiAqIGIwMSAqIGIyMCAtIGExMSAqIGIwMiAqIGIyMCAtIGEwMiAqIGIxMSAqIGIyMCArIGEwMSAqIGIxMiAqIGIyMCAtIGExMiAqIGIwMCAqIGIyMSArIGExMCAqIGIwMiAqIGIyMSArIGEwMiAqIGIxMCAqIGIyMSAtIGEwMCAqIGIxMiAqIGIyMSArIGExMSAqIGIwMCAqIGIyMiAtIGExMCAqIGIwMSAqIGIyMiAtIGEwMSAqIGIxMCAqIGIyMiArIGEwMCAqIGIxMSAqIGIyMjtcbiAgY29uc3QgRCA9IC1iMDIgKiBiMTEgKiBiMjAgKyBiMDEgKiBiMTIgKiBiMjAgKyBiMDIgKiBiMTAgKiBiMjEgLSBiMDAgKiBiMTIgKiBiMjEgLSBiMDEgKiBiMTAgKiBiMjIgKyBiMDAgKiBiMTEgKiBiMjI7XG5cbiAgLy8gTk9URTogd2UgZG9uJ3QgaGF2ZSBhIGRpc2NyaW1pbmFudCB0aHJlc2hvbGQgcmlnaHQgbm93XG4gIGNvbnN0IHBvdGVudGlhbExhbWJkYXMgPSBDb21wbGV4LnNvbHZlQ3ViaWNSb290cyggQ29tcGxleC5yZWFsKCBBICksIENvbXBsZXgucmVhbCggQiApLCBDb21wbGV4LnJlYWwoIEMgKSwgQ29tcGxleC5yZWFsKCBEICkgKTtcblxuICBpZiAoICFwb3RlbnRpYWxMYW1iZGFzIHx8IHBvdGVudGlhbExhbWJkYXMubGVuZ3RoID09PSAwICkge1xuICAgIC8vIFByb2JhYmx5IG92ZXJsYXBwaW5nLCBpbmZpbml0ZSBpbnRlcnNlY3Rpb25zXG4gICAgcmV0dXJuIHsgZGVnZW5lcmF0ZUNvbmljTWF0cmljZXM6IFtdLCBpbnRlcnNlY3Rpb25Db2xsZWN0aW9uczogW10sIHBvaW50czogW10sIGxpbmVzOiBbXSB9O1xuICB9XG5cbiAgY29uc3QgdW5pcXVlTGFtYmRhcyA9IF8udW5pcVdpdGgoIHBvdGVudGlhbExhbWJkYXMsICggYSwgYiApID0+IGEuZXF1YWxzKCBiICkgKTtcblxuICBjb25zdCBkZWdlbmVyYXRlQ29uaWNNYXRyaWNlcyA9IHVuaXF1ZUxhbWJkYXMubWFwKCBsYW1iZGEgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICBDb21wbGV4LnJlYWwoIGEwMCApLm11bHRpcGx5KCBsYW1iZGEgKS5hZGQoIENvbXBsZXgucmVhbCggYjAwICkgKSxcbiAgICAgIENvbXBsZXgucmVhbCggYTAxICkubXVsdGlwbHkoIGxhbWJkYSApLmFkZCggQ29tcGxleC5yZWFsKCBiMDEgKSApLFxuICAgICAgQ29tcGxleC5yZWFsKCBhMDIgKS5tdWx0aXBseSggbGFtYmRhICkuYWRkKCBDb21wbGV4LnJlYWwoIGIwMiApICksXG4gICAgICBDb21wbGV4LnJlYWwoIGExMCApLm11bHRpcGx5KCBsYW1iZGEgKS5hZGQoIENvbXBsZXgucmVhbCggYjEwICkgKSxcbiAgICAgIENvbXBsZXgucmVhbCggYTExICkubXVsdGlwbHkoIGxhbWJkYSApLmFkZCggQ29tcGxleC5yZWFsKCBiMTEgKSApLFxuICAgICAgQ29tcGxleC5yZWFsKCBhMTIgKS5tdWx0aXBseSggbGFtYmRhICkuYWRkKCBDb21wbGV4LnJlYWwoIGIxMiApICksXG4gICAgICBDb21wbGV4LnJlYWwoIGEyMCApLm11bHRpcGx5KCBsYW1iZGEgKS5hZGQoIENvbXBsZXgucmVhbCggYjIwICkgKSxcbiAgICAgIENvbXBsZXgucmVhbCggYTIxICkubXVsdGlwbHkoIGxhbWJkYSApLmFkZCggQ29tcGxleC5yZWFsKCBiMjEgKSApLFxuICAgICAgQ29tcGxleC5yZWFsKCBhMjIgKS5tdWx0aXBseSggbGFtYmRhICkuYWRkKCBDb21wbGV4LnJlYWwoIGIyMiApIClcbiAgICBdO1xuICB9ICk7XG5cbiAgY29uc29sZS5sb2coICdkZXRlcm1pbmFudCBtYWduaXR1ZGVzJywgZGVnZW5lcmF0ZUNvbmljTWF0cmljZXMubWFwKCBtID0+IGdldERldGVybWluYW50KCBtICkubWFnbml0dWRlICkgKTtcblxuICBjb25zdCByZXN1bHQ6IFZlY3RvcjJbXSA9IFtdO1xuICBjb25zdCBsaW5lQ29sbGVjdGlvbnMgPSBkZWdlbmVyYXRlQ29uaWNNYXRyaWNlcy5tYXAoIGdldExpbmVzRm9yRGVnZW5lcmF0ZUNvbmljICk7XG4gIGNvbnNvbGUubG9nKCBsaW5lQ29sbGVjdGlvbnMgKTtcblxuICBjb25zdCBpbnRlcnNlY3Rpb25Db2xsZWN0aW9ucyA9IGRlZ2VuZXJhdGVDb25pY01hdHJpY2VzLm1hcCggZ2V0UmVhbEludGVyc2VjdGlvbnNGb3JEZWdlbmVyYXRlQ29uaWMgKTtcbiAgY29uc29sZS5sb2coIGludGVyc2VjdGlvbkNvbGxlY3Rpb25zICk7XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZUNvbGxlY3Rpb25zLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IGxpbmVzMCA9IGxpbmVDb2xsZWN0aW9uc1sgaSBdO1xuXG4gICAgLy8gV2UgbmVlZCB0byBoYW5kbGUgYSBjYXNlIHdoZXJlIHR3byBjb25pY3MgYXJlIHRvdWNoaW5nIGF0IGEgdGFuZ2VudCBwb2ludFxuICAgIGNvbnN0IHNlbGZJbnRlcnNlY3Rpb24gPSBsaW5lSW50ZXJzZWN0KCBsaW5lczBbIDAgXSwgbGluZXMwWyAxIF0gKTtcbiAgICBpZiAoIHNlbGZJbnRlcnNlY3Rpb24gKSB7XG4gICAgICByZXN1bHQucHVzaCggc2VsZkludGVyc2VjdGlvbiApO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBqID0gaSArIDE7IGogPCBsaW5lQ29sbGVjdGlvbnMubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjb25zdCBsaW5lczEgPSBsaW5lQ29sbGVjdGlvbnNbIGogXTtcblxuICAgICAgY29uc3QgY2FuZGlkYXRlcyA9IFtcbiAgICAgICAgbGluZUludGVyc2VjdCggbGluZXMwWyAwIF0sIGxpbmVzMVsgMCBdICksXG4gICAgICAgIGxpbmVJbnRlcnNlY3QoIGxpbmVzMFsgMCBdLCBsaW5lczFbIDEgXSApLFxuICAgICAgICBsaW5lSW50ZXJzZWN0KCBsaW5lczBbIDEgXSwgbGluZXMxWyAwIF0gKSxcbiAgICAgICAgbGluZUludGVyc2VjdCggbGluZXMwWyAxIF0sIGxpbmVzMVsgMSBdIClcbiAgICAgIF07XG5cbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IDQ7IGsrKyApIHtcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlID0gY2FuZGlkYXRlc1sgayBdO1xuICAgICAgICBpZiAoIGNhbmRpZGF0ZSApIHtcbiAgICAgICAgICByZXN1bHQucHVzaCggY2FuZGlkYXRlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBvaW50czogcmVzdWx0LFxuICAgIGRlZ2VuZXJhdGVDb25pY01hdHJpY2VzOiBkZWdlbmVyYXRlQ29uaWNNYXRyaWNlcyxcbiAgICBsaW5lczogXy5mbGF0dGVuKCBsaW5lQ29sbGVjdGlvbnMgKSxcbiAgICBpbnRlcnNlY3Rpb25Db2xsZWN0aW9uczogaW50ZXJzZWN0aW9uQ29sbGVjdGlvbnNcbiAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCBpbnRlcnNlY3RDb25pY01hdHJpY2VzO1xuXG5raXRlLnJlZ2lzdGVyKCAnaW50ZXJzZWN0Q29uaWNNYXRyaWNlcycsIGludGVyc2VjdENvbmljTWF0cmljZXMgKTsiXSwibmFtZXMiOlsiQ29tcGxleCIsIk1hdHJpeCIsIlJheTIiLCJTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiIsIlZlY3RvcjIiLCJWZWN0b3I0Iiwia2l0ZSIsImdldERldDIiLCJhIiwiYiIsImMiLCJkIiwidGltZXMiLCJtaW51cyIsImdldERldGVybWluYW50IiwibWF0cml4IiwibTAwIiwibTAxIiwibTAyIiwibTEwIiwibTExIiwibTEyIiwibTIwIiwibTIxIiwibTIyIiwicGx1cyIsImdldEFkanVnYXRlTWF0cml4IiwibTEzIiwibTIzIiwibTMxIiwibTMyIiwibTMzIiwibmVnYXRlIiwiZ2V0VHJhbnNwb3NlIiwiZ2V0Tm9uemVyb1JvdyIsImNoZWNrTGFzdCIsIl8iLCJzb3J0QnkiLCJzbGljZSIsInJvdyIsIm1hZ25pdHVkZSIsImdldE5vbnplcm9Db2x1bW4iLCJnZXRBbnRpU3ltbWV0cmljTWF0cml4IiwiYWRqdWdhdGUiLCJub256ZXJvUm93IiwiWkVSTyIsIm5lZ2F0ZWQiLCJjb21wdXRlQWxwaGEiLCJkZWdlbmVyYXRlQ29uaWNNYXRyaXgiLCJhbnRpU3ltbWV0cmljTWF0cml4IiwiZDAwIiwiZDAxIiwiZDEwIiwiZDExIiwiYTAwIiwiYTAxIiwiYTEwIiwiYTExIiwiQSIsIkIiLCJDIiwicm9vdHMiLCJzb2x2ZVF1YWRyYXRpY1Jvb3RzIiwiZ2V0UmFuazFEZWdlbmVyYXRlQ29uaWNNYXRyaXgiLCJhbHBoYSIsImdldFJlYWxJbnRlcnNlY3Rpb25zRm9yRGVnZW5lcmF0ZUNvbmljIiwicmVzdWx0IiwicmVhbCIsIkQiLCJFIiwiRiIsInNvbHV0aW9ucyIsInhBbHBoYUEiLCJ4QWxwaGFCIiwieEFscGhhQyIsInhBbHBoYVJvb3RzIiwibGVuZ3RoIiwieUFscGhhQSIsInlBbHBoYUIiLCJ5QWxwaGFDIiwieUFscGhhUm9vdHMiLCJFcnJvciIsImZvckVhY2giLCJzb2x1dGlvbiIsInJ4IiwicnkiLCJpeCIsImltYWdpbmFyeSIsIml5IiwickEiLCJyQiIsInJDIiwickQiLCJyRSIsImlBIiwiaUIiLCJpQyIsImlEIiwiaUUiLCJyZWFsR3JhZGllbnQiLCJpbWFnaW5hcnlHcmFkaWVudCIsInJhbmRvbVBvaW50QSIsInJhbmRvbVBvaW50QiIsInByb2oiLCJ2IiwidSIsInRpbWVzU2NhbGFyIiwiZG90IiwiYmFzaXNSZWFsR3JhZGllbnQiLCJiYXNpc0ltYWdpbmFyeUdyYWRpZW50IiwiYmFzaXNQbGFuZTAiLCJiYXNpc1BsYW5lMSIsImJhc2lzTWF0cml4IiwieiIsInciLCJzaW5ndWxhclZhbHVlcyIsImdldFNpbmd1bGFyVmFsdWVzIiwicmVhbFNvbHV0aW9uIiwiTWF0aCIsImFicyIsInR1Iiwic29sdmUiLCJleHRyYWN0VmVjdG9yMiIsIngiLCJ5IiwibGFyZ2VzdEJhc2lzIiwibGFyZ2VzdEJhc2lzSW1hZ2luYXJ5VmVjdG9yIiwidCIsInBvdGVudGlhbFNvbHV0aW9uIiwicHVzaCIsInplcm9MYXJnZXIiLCJzbWFsbGVzdEJhc2lzIiwieExhcmdlciIsImRpcmVjdGlvbjQiLCJub3JtYWxpemVkIiwiZ2V0TGluZXNGb3JEZWdlbmVyYXRlQ29uaWMiLCJyYW5rMURlZ2VuZXJhdGVDb25pY01hdHJpeCIsImxpbmVJbnRlcnNlY3QiLCJsaW5lMSIsImxpbmUyIiwiYTEiLCJiMSIsImMxIiwiYTIiLCJiMiIsImMyIiwiZGV0ZXJtaW5hbnQiLCJlcXVhbHNFcHNpbG9uIiwiZGl2aWRlZEJ5IiwiaW50ZXJzZWN0Q29uaWNNYXRyaWNlcyIsImEwMiIsImExMiIsImEyMCIsImEyMSIsImEyMiIsImIwMCIsImIwMSIsImIwMiIsImIxMCIsImIxMSIsImIxMiIsImIyMCIsImIyMSIsImIyMiIsInBvdGVudGlhbExhbWJkYXMiLCJzb2x2ZUN1YmljUm9vdHMiLCJkZWdlbmVyYXRlQ29uaWNNYXRyaWNlcyIsImludGVyc2VjdGlvbkNvbGxlY3Rpb25zIiwicG9pbnRzIiwibGluZXMiLCJ1bmlxdWVMYW1iZGFzIiwidW5pcVdpdGgiLCJlcXVhbHMiLCJtYXAiLCJsYW1iZGEiLCJtdWx0aXBseSIsImFkZCIsImNvbnNvbGUiLCJsb2ciLCJtIiwibGluZUNvbGxlY3Rpb25zIiwiaSIsImxpbmVzMCIsInNlbGZJbnRlcnNlY3Rpb24iLCJqIiwibGluZXMxIiwiY2FuZGlkYXRlcyIsImsiLCJjYW5kaWRhdGUiLCJmbGF0dGVuIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBMkJDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsWUFBWSw0QkFBNEI7QUFFL0MsT0FBT0MsVUFBVSwwQkFBMEI7QUFDM0MsT0FBT0MsZ0NBQWdDLGdEQUFnRDtBQUN2RixPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxJQUFJLFFBQVEsZ0JBQWdCO0FBRXJDLDhCQUE4QjtBQUM5QixNQUFNQyxVQUFVLENBQUVDLEdBQVlDLEdBQVlDLEdBQVlDO0lBQ3BELE9BQU9ILEVBQUVJLEtBQUssQ0FBRUQsR0FBSUUsS0FBSyxDQUFFSixFQUFFRyxLQUFLLENBQUVGO0FBQ3RDO0FBRUEsTUFBTUksaUJBQWlCLENBQUVDO0lBQ3ZCLE1BQU1DLE1BQU1ELE1BQU0sQ0FBRSxFQUFHO0lBQ3ZCLE1B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