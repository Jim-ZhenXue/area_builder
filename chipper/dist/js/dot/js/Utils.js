// Copyright 2013-2024, University of Colorado Boulder
/**
 * Utility functions for Dot, placed into the phet.dot.X namespace.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Big from '../../sherpa/lib/big-6.2.1.js'; // eslint-disable-line phet/default-import-match-filename
import dot from './dot.js';
import Vector2 from './Vector2.js';
import Vector3 from './Vector3.js';
// constants
const EPSILON = Number.MIN_VALUE;
const TWO_PI = 2 * Math.PI;
// "static" variables used in boxMullerTransform
let generate;
let z0;
let z1;
const Utils = {
    /**
   * Returns the original value if it is inclusively within the [max,min] range. If it's below the range, min is
   * returned, and if it's above the range, max is returned.
   * @public
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */ clamp (value, min, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    },
    /**
   * Returns a number in the range $n\in[\mathrm{min},\mathrm{max})$ with the same equivalence class as the input
   * value mod (max-min), i.e. for a value $m$, $m\equiv n\ (\mathrm{mod}\ \mathrm{max}-\mathrm{min})$.
   * @public
   *
   * The 'down' indicates that if the value is equal to min or max, the max is returned.
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */ moduloBetweenDown (value, min, max) {
        assert && assert(max > min, 'max > min required for moduloBetween');
        const divisor = max - min;
        // get a partial result of value-min between [0,divisor)
        let partial = (value - min) % divisor;
        if (partial < 0) {
            // since if value-min < 0, the remainder will give us a negative number
            partial += divisor;
        }
        return partial + min; // add back in the minimum value
    },
    /**
   * Returns a number in the range $n\in(\mathrm{min},\mathrm{max}]$ with the same equivalence class as the input
   * value mod (max-min), i.e. for a value $m$, $m\equiv n\ (\mathrm{mod}\ \mathrm{max}-\mathrm{min})$.
   * @public
   *
   * The 'up' indicates that if the value is equal to min or max, the min is returned.
   *
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */ moduloBetweenUp (value, min, max) {
        return -Utils.moduloBetweenDown(-value, -max, -min);
    },
    /**
   * Returns an array of integers from A to B (inclusive), e.g. rangeInclusive( 4, 7 ) maps to [ 4, 5, 6, 7 ].
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>}
   */ rangeInclusive (a, b) {
        if (b < a) {
            return [];
        }
        const result = new Array(b - a + 1);
        for(let i = a; i <= b; i++){
            result[i - a] = i;
        }
        return result;
    },
    /**
   * Returns an array of integers from A to B (exclusive), e.g. rangeExclusive( 4, 7 ) maps to [ 5, 6 ].
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>}
   */ rangeExclusive (a, b) {
        return Utils.rangeInclusive(a + 1, b - 1);
    },
    /**
   * Converts degrees to radians.
   * @public
   *
   * @param {number} degrees
   * @returns {number}
   */ toRadians (degrees) {
        return Math.PI * degrees / 180;
    },
    /**
   * Converts radians to degrees.
   * @public
   *
   * @param {number} radians
   * @returns {number}
   */ toDegrees (radians) {
        return 180 * radians / Math.PI;
    },
    /**
   * Workaround for broken modulo operator.
   * E.g. on iOS9, 1e10 % 1e10 -> 2.65249474e-315
   * See https://github.com/phetsims/dot/issues/75
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */ mod (a, b) {
        if (a / b % 1 === 0) {
            return 0; // a is a multiple of b
        } else {
            return a % b;
        }
    },
    /**
   * Greatest Common Divisor, using https://en.wikipedia.org/wiki/Euclidean_algorithm. See
   * https://en.wikipedia.org/wiki/Greatest_common_divisor
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */ gcd (a, b) {
        return Math.abs(b === 0 ? a : this.gcd(b, Utils.mod(a, b)));
    },
    /**
   * Least Common Multiple, https://en.wikipedia.org/wiki/Least_common_multiple
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {number} lcm, an integer
   */ lcm (a, b) {
        return Utils.roundSymmetric(Math.abs(a * b) / Utils.gcd(a, b));
    },
    /**
   * Intersection point between the lines defined by the line segments p1-p2 and p3-p4. If the
   * lines are not properly defined, null is returned. If there are no intersections or infinitely many,
   * e.g. parallel lines, null is returned.
   * @public
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @param {Vector2} p4
   * @returns {Vector2|null}
   */ lineLineIntersection (p1, p2, p3, p4) {
        const epsilon = 1e-10;
        // If the endpoints are the same, they don't properly define a line
        if (p1.equalsEpsilon(p2, epsilon) || p3.equalsEpsilon(p4, epsilon)) {
            return null;
        }
        // Taken from an answer in
        // http://stackoverflow.com/questions/385305/efficient-maths-algorithm-to-calculate-intersections
        const x12 = p1.x - p2.x;
        const x34 = p3.x - p4.x;
        const y12 = p1.y - p2.y;
        const y34 = p3.y - p4.y;
        const denom = x12 * y34 - y12 * x34;
        // If the denominator is 0, lines are parallel or coincident
        if (Math.abs(denom) < epsilon) {
            return null;
        }
        // define intersection using determinants, see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        const a = p1.x * p2.y - p1.y * p2.x;
        const b = p3.x * p4.y - p3.y * p4.x;
        return new Vector2((a * x34 - x12 * b) / denom, (a * y34 - y12 * b) / denom);
    },
    /**
   * Returns the center of a circle that will lie on 3 points (if it exists), otherwise null (if collinear).
   * @public
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @returns {Vector2|null}
   */ circleCenterFromPoints (p1, p2, p3) {
        // TODO: Can we make scratch vectors here, avoiding the circular reference? https://github.com/phetsims/dot/issues/96
        // midpoints between p1-p2 and p2-p3
        const p12 = new Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        const p23 = new Vector2((p2.x + p3.x) / 2, (p2.y + p3.y) / 2);
        // perpendicular points from the minpoints
        const p12x = new Vector2(p12.x + (p2.y - p1.y), p12.y - (p2.x - p1.x));
        const p23x = new Vector2(p23.x + (p3.y - p2.y), p23.y - (p3.x - p2.x));
        return Utils.lineLineIntersection(p12, p12x, p23, p23x);
    },
    /**
   * Returns whether the point p is inside the circle defined by the other three points (p1, p2, p3).
   * @public
   *
   * NOTE: p1,p2,p3 should be specified in a counterclockwise (mathematically) order, and thus should have a positive
   * signed area.
   *
   * See notes in https://en.wikipedia.org/wiki/Delaunay_triangulation.
   *
   * @param {Vector2} p1
   * @param {Vector2} p2
   * @param {Vector2} p3
   * @param {Vector2} p
   * @returns {boolean}
   */ pointInCircleFromPoints (p1, p2, p3, p) {
        assert && assert(Utils.triangleAreaSigned(p1, p2, p3) > 0, 'Defined points should be in a counterclockwise order');
        const m00 = p1.x - p.x;
        const m01 = p1.y - p.y;
        const m02 = (p1.x - p.x) * (p1.x - p.x) + (p1.y - p.y) * (p1.y - p.y);
        const m10 = p2.x - p.x;
        const m11 = p2.y - p.y;
        const m12 = (p2.x - p.x) * (p2.x - p.x) + (p2.y - p.y) * (p2.y - p.y);
        const m20 = p3.x - p.x;
        const m21 = p3.y - p.y;
        const m22 = (p3.x - p.x) * (p3.x - p.x) + (p3.y - p.y) * (p3.y - p.y);
        const determinant = m00 * m11 * m22 + m01 * m12 * m20 + m02 * m10 * m21 - m02 * m11 * m20 - m01 * m10 * m22 - m00 * m12 * m21;
        return determinant > 0;
    },
    /**
   * Ray-sphere intersection, returning information about the closest intersection. Assumes the sphere is centered
   * at the origin (for ease of computation), transform the ray to compensate if needed.
   * @public
   *
   * If there is no intersection, null is returned. Otherwise an object will be returned like:
   * <pre class="brush: js">
   * {
   *   distance: {number}, // distance from the ray position to the intersection
   *   hitPoint: {Vector3}, // location of the intersection
   *   normal: {Vector3}, // the normal of the sphere's surface at the intersection
   *   fromOutside: {boolean}, // whether the ray intersected the sphere from outside the sphere first
   * }
   * </pre>
   *
   * @param {number} radius
   * @param {Ray3} ray
   * @param {number} epsilon
   * @returns {Object}
   */ // assumes a sphere with the specified radius, centered at the origin
    sphereRayIntersection (radius, ray, epsilon) {
        epsilon = epsilon === undefined ? 1e-5 : epsilon;
        // center is the origin for now, but leaving in computations so that we can change that in the future. optimize away if needed
        const center = new Vector3(0, 0, 0);
        const rayDir = ray.direction;
        const pos = ray.position;
        const centerToRay = pos.minus(center);
        // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
        const tmp = rayDir.dot(centerToRay);
        const centerToRayDistSq = centerToRay.magnitudeSquared;
        const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - radius * radius);
        if (det < epsilon) {
            // ray misses sphere entirely
            return null;
        }
        const base = rayDir.dot(center) - rayDir.dot(pos);
        const sqt = Math.sqrt(det) / 2;
        // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
        const ta = base - sqt;
        // the "second" entry point distance
        const tb = base + sqt;
        if (tb < epsilon) {
            // sphere is behind ray, so don't return an intersection
            return null;
        }
        const hitPositionB = ray.pointAtDistance(tb);
        const normalB = hitPositionB.minus(center).normalized();
        if (ta < epsilon) {
            // we are inside the sphere
            // in => out
            return {
                distance: tb,
                hitPoint: hitPositionB,
                normal: normalB.negated(),
                fromOutside: false
            };
        } else {
            // two possible hits
            const hitPositionA = ray.pointAtDistance(ta);
            const normalA = hitPositionA.minus(center).normalized();
            // close hit, we have out => in
            return {
                distance: ta,
                hitPoint: hitPositionA,
                normal: normalA,
                fromOutside: true
            };
        }
    },
    /**
   * Returns an array of the real roots of the quadratic equation $ax + b=0$, or null if every value is a solution.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */ solveLinearRootsReal (a, b) {
        if (a === 0) {
            if (b === 0) {
                return null;
            } else {
                return [];
            }
        } else {
            return [
                -b / a
            ];
        }
    },
    /**
   * Returns an array of the real roots of the quadratic equation $ax^2 + bx + c=0$, or null if every value is a
   * solution. If a is nonzero, there should be between 0 and 2 (inclusive) values returned.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */ solveQuadraticRootsReal (a, b, c) {
        // Check for a degenerate case where we don't have a quadratic, or if the order of magnitude is such where the
        // linear solution would be expected
        const epsilon = 1E7;
        if (a === 0 || Math.abs(b / a) > epsilon || Math.abs(c / a) > epsilon) {
            return Utils.solveLinearRootsReal(b, c);
        }
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
            return [];
        }
        const sqrt = Math.sqrt(discriminant);
        // TODO: how to handle if discriminant is 0? give unique root or double it? https://github.com/phetsims/dot/issues/96
        // TODO: probably just use Complex for the future https://github.com/phetsims/dot/issues/96
        return [
            (-b - sqrt) / (2 * a),
            (-b + sqrt) / (2 * a)
        ];
    },
    /**
   * Returns an array of the real roots of the cubic equation $ax^3 + bx^2 + cx + d=0$, or null if every value is a
   * solution. If a is nonzero, there should be between 0 and 3 (inclusive) values returned.
   * @public
   *
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {number} d
   * @param {number} [discriminantThreshold] - for determining whether we have a single real root
   * @returns {Array.<number>|null} - The real roots of the equation, or null if all values are roots. If the root has
   *                                  a multiplicity larger than 1, it will be repeated that many times.
   */ solveCubicRootsReal (a, b, c, d, discriminantThreshold = 1e-7) {
        let roots;
        // TODO: a Complex type! https://github.com/phetsims/dot/issues/96
        // Check for a degenerate case where we don't have a cubic
        if (a === 0) {
            roots = Utils.solveQuadraticRootsReal(b, c, d);
        } else {
            //We need to test whether a is several orders of magnitude less than b, c, d
            const epsilon = 1E7;
            if (a === 0 || Math.abs(b / a) > epsilon || Math.abs(c / a) > epsilon || Math.abs(d / a) > epsilon) {
                roots = Utils.solveQuadraticRootsReal(b, c, d);
            } else {
                if (d === 0 || Math.abs(a / d) > epsilon || Math.abs(b / d) > epsilon || Math.abs(c / d) > epsilon) {
                    roots = [
                        0
                    ].concat(Utils.solveQuadraticRootsReal(a, b, c));
                } else {
                    b /= a;
                    c /= a;
                    d /= a;
                    const q = (3.0 * c - b * b) / 9;
                    const r = (-(27 * d) + b * (9 * c - 2 * (b * b))) / 54;
                    const discriminant = q * q * q + r * r;
                    const b3 = b / 3;
                    if (discriminant > discriminantThreshold) {
                        // a single real root
                        const dsqrt = Math.sqrt(discriminant);
                        roots = [
                            Utils.cubeRoot(r + dsqrt) + Utils.cubeRoot(r - dsqrt) - b3
                        ];
                    } else if (discriminant > -discriminantThreshold) {
                        // contains a double root (but with three roots)
                        const rsqrt = Utils.cubeRoot(r);
                        const doubleRoot = -b3 - rsqrt;
                        roots = [
                            -b3 + 2 * rsqrt,
                            doubleRoot,
                            doubleRoot
                        ];
                    } else {
                        // all unique (three roots)
                        let qX = -q * q * q;
                        qX = Math.acos(r / Math.sqrt(qX));
                        const rr = 2 * Math.sqrt(-q);
                        roots = [
                            -b3 + rr * Math.cos(qX / 3),
                            -b3 + rr * Math.cos((qX + 2 * Math.PI) / 3),
                            -b3 + rr * Math.cos((qX + 4 * Math.PI) / 3)
                        ];
                    }
                }
            }
        }
        assert && roots && roots.forEach((root)=>assert(isFinite(root), 'All returned solveCubicRootsReal roots should be finite'));
        return roots;
    },
    /**
   * Returns the unique real cube root of x, such that $y^3=x$.
   * @public
   *
   * @param {number} x
   * @returns {number}
   */ cubeRoot (x) {
        return x >= 0 ? Math.pow(x, 1 / 3) : -Math.pow(-x, 1 / 3);
    },
    /**
   * Defines and evaluates a linear mapping. The mapping is defined so that $f(a_1)=b_1$ and $f(a_2)=b_2$, and other
   * values are interpolated along the linear equation. The returned value is $f(a_3)$.
   * @public
   *
   * @param {number} a1
   * @param {number} a2
   * @param {number} b1
   * @param {number} b2
   * @param {number} a3
   * @returns {number}
   */ linear (a1, a2, b1, b2, a3) {
        assert && assert(typeof a3 === 'number', 'linear requires a number to evaluate');
        return (b2 - b1) / (a2 - a1) * (a3 - a1) + b1;
    },
    /**
   * Rounds using "Round half away from zero" algorithm. See dot#35.
   * @public
   *
   * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
   * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754 "Round half away from zero",
   * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
   *
   * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
   *
   * @param {number} value                               `
   * @returns {number}
   */ roundSymmetric (value) {
        return (value < 0 ? -1 : 1) * Math.round(Math.abs(value)); // eslint-disable-line phet/bad-sim-text
    },
    /**
   * A predictable implementation of toFixed.
   * @public
   *
   * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
   * because the spec doesn't specify whether to round or floor.
   * Rounding is symmetric for positive and negative values, see Utils.roundSymmetric.
   *
   * @param {number} value
   * @param {number} decimalPlaces
   * @returns {string}
   */ toFixed (value, decimalPlaces) {
        assert && assert(typeof value === 'number');
        assert && assert(Number.isInteger(decimalPlaces), `decimal places must be an integer: ${decimalPlaces}`);
        if (isNaN(value)) {
            return 'NaN';
        } else if (value === Number.POSITIVE_INFINITY) {
            return 'Infinity';
        } else if (value === Number.NEGATIVE_INFINITY) {
            return '-Infinity';
        }
        // eslint-disable-next-line phet/bad-sim-text
        const result = new Big(value).toFixed(decimalPlaces);
        // Avoid reporting -0.000
        if (result.startsWith('-0.') && Number.parseFloat(result) === 0) {
            return '0' + result.slice(2);
        } else {
            return result;
        }
    },
    /**
   * A predictable implementation of toFixed, where the result is returned as a number instead of a string.
   * @public
   *
   * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
   * because the spec doesn't specify whether to round or floor.
   * Rounding is symmetric for positive and negative values, see Utils.roundSymmetric.
   *
   * @param {number} value
   * @param {number} decimalPlaces
   * @returns {number}
   */ toFixedNumber (value, decimalPlaces) {
        return parseFloat(Utils.toFixed(value, decimalPlaces));
    },
    /**
   * Returns true if two numbers are within epsilon of each other.
   *
   * @param {number} a
   * @param {number} b
   * @param {number} epsilon
   * @returns {boolean}
   */ equalsEpsilon (a, b, epsilon) {
        return Math.abs(a - b) <= epsilon;
    },
    /**
   * Computes the intersection of the two line segments $(x_1,y_1)(x_2,y_2)$ and $(x_3,y_3)(x_4,y_4)$. If there is no
   * intersection, null is returned.
   * @public
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number} x4
   * @param {number} y4
   * @returns {Vector2|null}
   */ lineSegmentIntersection (x1, y1, x2, y2, x3, y3, x4, y4) {
        // @private
        // Determines counterclockwiseness. Positive if counterclockwise, negative if clockwise, zero if straight line
        // Point1(a,b), Point2(c,d), Point3(e,f)
        // See http://jeffe.cs.illinois.edu/teaching/373/notes/x05-convexhull.pdf
        // @returns {number}
        const ccw = (a, b, c, d, e, f)=>(f - b) * (c - a) - (d - b) * (e - a);
        // Check if intersection doesn't exist. See http://jeffe.cs.illinois.edu/teaching/373/notes/x06-sweepline.pdf
        // If point1 and point2 are on opposite sides of line 3 4, exactly one of the two triples 1, 3, 4 and 2, 3, 4
        // is in counterclockwise order.
        if (ccw(x1, y1, x3, y3, x4, y4) * ccw(x2, y2, x3, y3, x4, y4) > 0 || ccw(x3, y3, x1, y1, x2, y2) * ccw(x4, y4, x1, y1, x2, y2) > 0) {
            return null;
        }
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        // If denominator is 0, the lines are parallel or coincident
        if (Math.abs(denom) < 1e-10) {
            return null;
        }
        // Check if there is an exact endpoint overlap (and then return an exact answer).
        if (x1 === x3 && y1 === y3 || x1 === x4 && y1 === y4) {
            return new Vector2(x1, y1);
        } else if (x2 === x3 && y2 === y3 || x2 === x4 && y2 === y4) {
            return new Vector2(x2, y2);
        }
        // Use determinants to calculate intersection, see https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
        const intersectionX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const intersectionY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
        return new Vector2(intersectionX, intersectionY);
    },
    /**
   * Squared distance from a point to a line segment squared.
   * See http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
   * @public
   *
   * @param {Vector2} point - The point
   * @param {Vector2} a - Starting point of the line segment
   * @param {Vector2} b - Ending point of the line segment
   * @returns {number}
   */ distToSegmentSquared (point, a, b) {
        // the square of the distance between a and b,
        const segmentSquaredLength = a.distanceSquared(b);
        // if the segment length is zero, the a and b point are coincident. return the squared distance between a and point
        if (segmentSquaredLength === 0) {
            return point.distanceSquared(a);
        }
        // the t value parametrize the projection of the point onto the a b line
        const t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / segmentSquaredLength;
        let distanceSquared;
        if (t < 0) {
            // if t<0, the projection point is outside the ab line, beyond a
            distanceSquared = point.distanceSquared(a);
        } else if (t > 1) {
            // if t>1, the projection past is outside the ab segment, beyond b,
            distanceSquared = point.distanceSquared(b);
        } else {
            // if 0<t<1, the projection point lies along the line joining a and b.
            distanceSquared = point.distanceSquared(new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)));
        }
        return distanceSquared;
    },
    /**
   * distance from a point to a line segment squared.
   * @public
   *
   * @param {Vector2} point - The point
   * @param {Vector2} a - Starting point of the line segment
   * @param {Vector2} b - Ending point of the line segment
   * @returns {number}
   */ distToSegment (point, a, b) {
        return Math.sqrt(this.distToSegmentSquared(point, a, b));
    },
    /**
   * Determines whether the three points are approximately collinear.
   * @public
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @param {number} [epsilon]
   * @returns {boolean}
   */ arePointsCollinear (a, b, c, epsilon) {
        if (epsilon === undefined) {
            epsilon = 0;
        }
        return Utils.triangleArea(a, b, c) <= epsilon;
    },
    /**
   * The area inside the triangle defined by the three vertices.
   * @public
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @returns {number}
   */ triangleArea (a, b, c) {
        return Math.abs(Utils.triangleAreaSigned(a, b, c));
    },
    /**
   * The area inside the triangle defined by the three vertices, but with the sign determined by whether the vertices
   * provided are clockwise or counter-clockwise.
   * @public
   *
   * If the vertices are counterclockwise (in a right-handed coordinate system), then the signed area will be
   * positive.
   *
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {Vector2} c
   * @returns {number}
   */ triangleAreaSigned (a, b, c) {
        return a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
    },
    /**
   * Returns the centroid of the simple planar polygon using Green's Theorem P=-y/2, Q=x/2 (similar to how kite
   * computes areas). See also https://en.wikipedia.org/wiki/Shoelace_formula.
   * @public
   *
   * @param {Array.<Vector2>} vertices
   * @returns {Vector2}
   */ centroidOfPolygon (vertices) {
        const centroid = new Vector2(0, 0);
        let area = 0;
        vertices.forEach((v0, i)=>{
            const v1 = vertices[(i + 1) % vertices.length];
            const doubleShoelace = v0.x * v1.y - v1.x * v0.y;
            area += doubleShoelace / 2;
            // Compute the centroid of the flat intersection with https://en.wikipedia.org/wiki/Centroid#Of_a_polygon
            centroid.addXY((v0.x + v1.x) * doubleShoelace, (v0.y + v1.y) * doubleShoelace);
        });
        centroid.divideScalar(6 * area);
        return centroid;
    },
    /**
   * Function that returns the hyperbolic cosine of a number
   * @public
   *
   * @param {number} value
   * @returns {number}
   */ cosh (value) {
        return (Math.exp(value) + Math.exp(-value)) / 2;
    },
    /**
   * Function that returns the hyperbolic sine of a number
   * @public
   *
   * @param {number} value
   * @returns {number}
   */ sinh (value) {
        return (Math.exp(value) - Math.exp(-value)) / 2;
    },
    /**
   * Log base-10, since it wasn't included in every supported browser.
   * @public
   *
   * @param {number} val
   * @returns {number}
   */ log10 (val) {
        return Math.log(val) / Math.LN10;
    },
    /**
   * Generates a random Gaussian sample with the given mean and standard deviation.
   * This method relies on the "static" variables generate, z0, and z1 defined above.
   * Random.js is the primary client of this function, but it is defined here so it can be
   * used other places more easily if need be.
   * Code inspired by example here: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform.
   * @public
   *
   * @param {number} mu - The mean of the Gaussian
   * @param {number} sigma - The standard deviation of the Gaussian
   * @param {Random} random - the source of randomness
   * @returns {number}
   */ boxMullerTransform (mu, sigma, random) {
        generate = !generate;
        if (!generate) {
            return z1 * sigma + mu;
        }
        let u1;
        let u2;
        do {
            u1 = random.nextDouble();
            u2 = random.nextDouble();
        }while (u1 <= EPSILON)
        z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(TWO_PI * u2);
        z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(TWO_PI * u2);
        return z0 * sigma + mu;
    },
    /**
   * Determines the number of decimal places in a value.
   * @public
   *
   * @param {number} value - a finite number, scientific notation is not supported for decimal numbers
   * @returns {number}
   */ numberOfDecimalPlaces (value) {
        assert && assert(typeof value === 'number' && isFinite(value), `value must be a finite number ${value}`);
        if (Math.floor(value) === value) {
            return 0;
        } else {
            const string = value.toString();
            // Handle scientific notation
            if (string.includes('e')) {
                // e.g. '1e-21', '5.6e+34', etc.
                const split = string.split('e');
                const mantissa = split[0]; // The left part, e.g. '1' or '5.6'
                const exponent = Number(split[1]); // The right part, e.g. '-21' or '+34'
                // How many decimal places are there in the left part
                const mantissaDecimalPlaces = mantissa.includes('.') ? mantissa.split('.')[1].length : 0;
                // We adjust the number of decimal places by the exponent, e.g. '1.5e1' has zero decimal places, and
                // '1.5e-2' has three.
                return Math.max(mantissaDecimalPlaces - exponent, 0);
            } else {
                return string.split('.')[1].length;
            }
        }
    },
    /**
   * Rounds a value to a multiple of a specified interval.
   * Examples:
   * roundToInterval( 0.567, 0.01 ) -> 0.57
   * roundToInterval( 0.567, 0.02 ) -> 0.56
   * roundToInterval( 5.67, 0.5 ) -> 5.5
   *
   * @param {number} value
   * @param {number} interval
   * @returns {number}
   */ roundToInterval (value, interval) {
        return Utils.toFixedNumber(Utils.roundSymmetric(value / interval) * interval, Utils.numberOfDecimalPlaces(interval));
    }
};
dot.register('Utils', Utils);
// make these available in the main namespace directly (for now)
dot.clamp = Utils.clamp;
dot.moduloBetweenDown = Utils.moduloBetweenDown;
dot.moduloBetweenUp = Utils.moduloBetweenUp;
dot.rangeInclusive = Utils.rangeInclusive;
dot.rangeExclusive = Utils.rangeExclusive;
dot.toRadians = Utils.toRadians;
dot.toDegrees = Utils.toDegrees;
dot.lineLineIntersection = Utils.lineLineIntersection;
dot.lineSegmentIntersection = Utils.lineSegmentIntersection;
dot.sphereRayIntersection = Utils.sphereRayIntersection;
dot.solveQuadraticRootsReal = Utils.solveQuadraticRootsReal;
dot.solveCubicRootsReal = Utils.solveCubicRootsReal;
dot.cubeRoot = Utils.cubeRoot;
dot.linear = Utils.linear;
dot.boxMullerTransform = Utils.boxMullerTransform;
export default Utils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgRG90LCBwbGFjZWQgaW50byB0aGUgcGhldC5kb3QuWCBuYW1lc3BhY2UuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCaWcgZnJvbSAnLi4vLi4vc2hlcnBhL2xpYi9iaWctNi4yLjEuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvZGVmYXVsdC1pbXBvcnQtbWF0Y2gtZmlsZW5hbWVcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgRVBTSUxPTiA9IE51bWJlci5NSU5fVkFMVUU7XG5jb25zdCBUV09fUEkgPSAyICogTWF0aC5QSTtcblxuLy8gXCJzdGF0aWNcIiB2YXJpYWJsZXMgdXNlZCBpbiBib3hNdWxsZXJUcmFuc2Zvcm1cbmxldCBnZW5lcmF0ZTtcbmxldCB6MDtcbmxldCB6MTtcblxuY29uc3QgVXRpbHMgPSB7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCB2YWx1ZSBpZiBpdCBpcyBpbmNsdXNpdmVseSB3aXRoaW4gdGhlIFttYXgsbWluXSByYW5nZS4gSWYgaXQncyBiZWxvdyB0aGUgcmFuZ2UsIG1pbiBpc1xuICAgKiByZXR1cm5lZCwgYW5kIGlmIGl0J3MgYWJvdmUgdGhlIHJhbmdlLCBtYXggaXMgcmV0dXJuZWQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgY2xhbXAoIHZhbHVlLCBtaW4sIG1heCApIHtcbiAgICBpZiAoIHZhbHVlIDwgbWluICkge1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHZhbHVlID4gbWF4ICkge1xuICAgICAgcmV0dXJuIG1heDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbnVtYmVyIGluIHRoZSByYW5nZSAkblxcaW5bXFxtYXRocm17bWlufSxcXG1hdGhybXttYXh9KSQgd2l0aCB0aGUgc2FtZSBlcXVpdmFsZW5jZSBjbGFzcyBhcyB0aGUgaW5wdXRcbiAgICogdmFsdWUgbW9kIChtYXgtbWluKSwgaS5lLiBmb3IgYSB2YWx1ZSAkbSQsICRtXFxlcXVpdiBuXFwgKFxcbWF0aHJte21vZH1cXCBcXG1hdGhybXttYXh9LVxcbWF0aHJte21pbn0pJC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGUgJ2Rvd24nIGluZGljYXRlcyB0aGF0IGlmIHRoZSB2YWx1ZSBpcyBlcXVhbCB0byBtaW4gb3IgbWF4LCB0aGUgbWF4IGlzIHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pblxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtb2R1bG9CZXR3ZWVuRG93biggdmFsdWUsIG1pbiwgbWF4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heCA+IG1pbiwgJ21heCA+IG1pbiByZXF1aXJlZCBmb3IgbW9kdWxvQmV0d2VlbicgKTtcblxuICAgIGNvbnN0IGRpdmlzb3IgPSBtYXggLSBtaW47XG5cbiAgICAvLyBnZXQgYSBwYXJ0aWFsIHJlc3VsdCBvZiB2YWx1ZS1taW4gYmV0d2VlbiBbMCxkaXZpc29yKVxuICAgIGxldCBwYXJ0aWFsID0gKCB2YWx1ZSAtIG1pbiApICUgZGl2aXNvcjtcbiAgICBpZiAoIHBhcnRpYWwgPCAwICkge1xuICAgICAgLy8gc2luY2UgaWYgdmFsdWUtbWluIDwgMCwgdGhlIHJlbWFpbmRlciB3aWxsIGdpdmUgdXMgYSBuZWdhdGl2ZSBudW1iZXJcbiAgICAgIHBhcnRpYWwgKz0gZGl2aXNvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFydGlhbCArIG1pbjsgLy8gYWRkIGJhY2sgaW4gdGhlIG1pbmltdW0gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIG51bWJlciBpbiB0aGUgcmFuZ2UgJG5cXGluKFxcbWF0aHJte21pbn0sXFxtYXRocm17bWF4fV0kIHdpdGggdGhlIHNhbWUgZXF1aXZhbGVuY2UgY2xhc3MgYXMgdGhlIGlucHV0XG4gICAqIHZhbHVlIG1vZCAobWF4LW1pbiksIGkuZS4gZm9yIGEgdmFsdWUgJG0kLCAkbVxcZXF1aXYgblxcIChcXG1hdGhybXttb2R9XFwgXFxtYXRocm17bWF4fS1cXG1hdGhybXttaW59KSQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhlICd1cCcgaW5kaWNhdGVzIHRoYXQgaWYgdGhlIHZhbHVlIGlzIGVxdWFsIHRvIG1pbiBvciBtYXgsIHRoZSBtaW4gaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gbWluXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG1vZHVsb0JldHdlZW5VcCggdmFsdWUsIG1pbiwgbWF4ICkge1xuICAgIHJldHVybiAtVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIC12YWx1ZSwgLW1heCwgLW1pbiApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGludGVnZXJzIGZyb20gQSB0byBCIChpbmNsdXNpdmUpLCBlLmcuIHJhbmdlSW5jbHVzaXZlKCA0LCA3ICkgbWFwcyB0byBbIDQsIDUsIDYsIDcgXS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XG4gICAqL1xuICByYW5nZUluY2x1c2l2ZSggYSwgYiApIHtcbiAgICBpZiAoIGIgPCBhICkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoIGIgLSBhICsgMSApO1xuICAgIGZvciAoIGxldCBpID0gYTsgaSA8PSBiOyBpKysgKSB7XG4gICAgICByZXN1bHRbIGkgLSBhIF0gPSBpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGludGVnZXJzIGZyb20gQSB0byBCIChleGNsdXNpdmUpLCBlLmcuIHJhbmdlRXhjbHVzaXZlKCA0LCA3ICkgbWFwcyB0byBbIDUsIDYgXS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj59XG4gICAqL1xuICByYW5nZUV4Y2x1c2l2ZSggYSwgYiApIHtcbiAgICByZXR1cm4gVXRpbHMucmFuZ2VJbmNsdXNpdmUoIGEgKyAxLCBiIC0gMSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBkZWdyZWVzIHRvIHJhZGlhbnMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlZ3JlZXNcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHRvUmFkaWFucyggZGVncmVlcyApIHtcbiAgICByZXR1cm4gTWF0aC5QSSAqIGRlZ3JlZXMgLyAxODA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHJhZGlhbnMgdG8gZGVncmVlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaWFuc1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdG9EZWdyZWVzKCByYWRpYW5zICkge1xuICAgIHJldHVybiAxODAgKiByYWRpYW5zIC8gTWF0aC5QSTtcbiAgfSxcblxuICAvKipcbiAgICogV29ya2Fyb3VuZCBmb3IgYnJva2VuIG1vZHVsbyBvcGVyYXRvci5cbiAgICogRS5nLiBvbiBpT1M5LCAxZTEwICUgMWUxMCAtPiAyLjY1MjQ5NDc0ZS0zMTVcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzc1XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBtb2QoIGEsIGIgKSB7XG4gICAgaWYgKCBhIC8gYiAlIDEgPT09IDAgKSB7XG4gICAgICByZXR1cm4gMDsgLy8gYSBpcyBhIG11bHRpcGxlIG9mIGJcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gYSAlIGI7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBHcmVhdGVzdCBDb21tb24gRGl2aXNvciwgdXNpbmcgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRXVjbGlkZWFuX2FsZ29yaXRobS4gU2VlXG4gICAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyZWF0ZXN0X2NvbW1vbl9kaXZpc29yXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdjZCggYSwgYiApIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoIGIgPT09IDAgPyBhIDogdGhpcy5nY2QoIGIsIFV0aWxzLm1vZCggYSwgYiApICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogTGVhc3QgQ29tbW9uIE11bHRpcGxlLCBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MZWFzdF9jb21tb25fbXVsdGlwbGVcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBsY20sIGFuIGludGVnZXJcbiAgICovXG4gIGxjbSggYSwgYiApIHtcbiAgICByZXR1cm4gVXRpbHMucm91bmRTeW1tZXRyaWMoIE1hdGguYWJzKCBhICogYiApIC8gVXRpbHMuZ2NkKCBhLCBiICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogSW50ZXJzZWN0aW9uIHBvaW50IGJldHdlZW4gdGhlIGxpbmVzIGRlZmluZWQgYnkgdGhlIGxpbmUgc2VnbWVudHMgcDEtcDIgYW5kIHAzLXA0LiBJZiB0aGVcbiAgICogbGluZXMgYXJlIG5vdCBwcm9wZXJseSBkZWZpbmVkLCBudWxsIGlzIHJldHVybmVkLiBJZiB0aGVyZSBhcmUgbm8gaW50ZXJzZWN0aW9ucyBvciBpbmZpbml0ZWx5IG1hbnksXG4gICAqIGUuZy4gcGFyYWxsZWwgbGluZXMsIG51bGwgaXMgcmV0dXJuZWQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMVxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDNcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwNFxuICAgKiBAcmV0dXJucyB7VmVjdG9yMnxudWxsfVxuICAgKi9cbiAgbGluZUxpbmVJbnRlcnNlY3Rpb24oIHAxLCBwMiwgcDMsIHA0ICkge1xuICAgIGNvbnN0IGVwc2lsb24gPSAxZS0xMDtcblxuICAgIC8vIElmIHRoZSBlbmRwb2ludHMgYXJlIHRoZSBzYW1lLCB0aGV5IGRvbid0IHByb3Blcmx5IGRlZmluZSBhIGxpbmVcbiAgICBpZiAoIHAxLmVxdWFsc0Vwc2lsb24oIHAyLCBlcHNpbG9uICkgfHwgcDMuZXF1YWxzRXBzaWxvbiggcDQsIGVwc2lsb24gKSApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFRha2VuIGZyb20gYW4gYW5zd2VyIGluXG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zODUzMDUvZWZmaWNpZW50LW1hdGhzLWFsZ29yaXRobS10by1jYWxjdWxhdGUtaW50ZXJzZWN0aW9uc1xuICAgIGNvbnN0IHgxMiA9IHAxLnggLSBwMi54O1xuICAgIGNvbnN0IHgzNCA9IHAzLnggLSBwNC54O1xuICAgIGNvbnN0IHkxMiA9IHAxLnkgLSBwMi55O1xuICAgIGNvbnN0IHkzNCA9IHAzLnkgLSBwNC55O1xuXG4gICAgY29uc3QgZGVub20gPSB4MTIgKiB5MzQgLSB5MTIgKiB4MzQ7XG5cbiAgICAvLyBJZiB0aGUgZGVub21pbmF0b3IgaXMgMCwgbGluZXMgYXJlIHBhcmFsbGVsIG9yIGNvaW5jaWRlbnRcbiAgICBpZiAoIE1hdGguYWJzKCBkZW5vbSApIDwgZXBzaWxvbiApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIGRlZmluZSBpbnRlcnNlY3Rpb24gdXNpbmcgZGV0ZXJtaW5hbnRzLCBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZSVFMiU4MCU5M2xpbmVfaW50ZXJzZWN0aW9uXG4gICAgY29uc3QgYSA9IHAxLnggKiBwMi55IC0gcDEueSAqIHAyLng7XG4gICAgY29uc3QgYiA9IHAzLnggKiBwNC55IC0gcDMueSAqIHA0Lng7XG5cbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoXG4gICAgICAoIGEgKiB4MzQgLSB4MTIgKiBiICkgLyBkZW5vbSxcbiAgICAgICggYSAqIHkzNCAtIHkxMiAqIGIgKSAvIGRlbm9tXG4gICAgKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2VudGVyIG9mIGEgY2lyY2xlIHRoYXQgd2lsbCBsaWUgb24gMyBwb2ludHMgKGlmIGl0IGV4aXN0cyksIG90aGVyd2lzZSBudWxsIChpZiBjb2xsaW5lYXIpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDFcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAzXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfG51bGx9XG4gICAqL1xuICBjaXJjbGVDZW50ZXJGcm9tUG9pbnRzKCBwMSwgcDIsIHAzICkge1xuICAgIC8vIFRPRE86IENhbiB3ZSBtYWtlIHNjcmF0Y2ggdmVjdG9ycyBoZXJlLCBhdm9pZGluZyB0aGUgY2lyY3VsYXIgcmVmZXJlbmNlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuXG4gICAgLy8gbWlkcG9pbnRzIGJldHdlZW4gcDEtcDIgYW5kIHAyLXAzXG4gICAgY29uc3QgcDEyID0gbmV3IFZlY3RvcjIoICggcDEueCArIHAyLnggKSAvIDIsICggcDEueSArIHAyLnkgKSAvIDIgKTtcbiAgICBjb25zdCBwMjMgPSBuZXcgVmVjdG9yMiggKCBwMi54ICsgcDMueCApIC8gMiwgKCBwMi55ICsgcDMueSApIC8gMiApO1xuXG4gICAgLy8gcGVycGVuZGljdWxhciBwb2ludHMgZnJvbSB0aGUgbWlucG9pbnRzXG4gICAgY29uc3QgcDEyeCA9IG5ldyBWZWN0b3IyKCBwMTIueCArICggcDIueSAtIHAxLnkgKSwgcDEyLnkgLSAoIHAyLnggLSBwMS54ICkgKTtcbiAgICBjb25zdCBwMjN4ID0gbmV3IFZlY3RvcjIoIHAyMy54ICsgKCBwMy55IC0gcDIueSApLCBwMjMueSAtICggcDMueCAtIHAyLnggKSApO1xuXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVMaW5lSW50ZXJzZWN0aW9uKCBwMTIsIHAxMngsIHAyMywgcDIzeCApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHBvaW50IHAgaXMgaW5zaWRlIHRoZSBjaXJjbGUgZGVmaW5lZCBieSB0aGUgb3RoZXIgdGhyZWUgcG9pbnRzIChwMSwgcDIsIHAzKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBOT1RFOiBwMSxwMixwMyBzaG91bGQgYmUgc3BlY2lmaWVkIGluIGEgY291bnRlcmNsb2Nrd2lzZSAobWF0aGVtYXRpY2FsbHkpIG9yZGVyLCBhbmQgdGh1cyBzaG91bGQgaGF2ZSBhIHBvc2l0aXZlXG4gICAqIHNpZ25lZCBhcmVhLlxuICAgKlxuICAgKiBTZWUgbm90ZXMgaW4gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGVsYXVuYXlfdHJpYW5ndWxhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwMVxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHAyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcDNcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgcG9pbnRJbkNpcmNsZUZyb21Qb2ludHMoIHAxLCBwMiwgcDMsIHAgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBwMSwgcDIsIHAzICkgPiAwLFxuICAgICAgJ0RlZmluZWQgcG9pbnRzIHNob3VsZCBiZSBpbiBhIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXInICk7XG5cbiAgICBjb25zdCBtMDAgPSBwMS54IC0gcC54O1xuICAgIGNvbnN0IG0wMSA9IHAxLnkgLSBwLnk7XG4gICAgY29uc3QgbTAyID0gKCBwMS54IC0gcC54ICkgKiAoIHAxLnggLSBwLnggKSArICggcDEueSAtIHAueSApICogKCBwMS55IC0gcC55ICk7XG4gICAgY29uc3QgbTEwID0gcDIueCAtIHAueDtcbiAgICBjb25zdCBtMTEgPSBwMi55IC0gcC55O1xuICAgIGNvbnN0IG0xMiA9ICggcDIueCAtIHAueCApICogKCBwMi54IC0gcC54ICkgKyAoIHAyLnkgLSBwLnkgKSAqICggcDIueSAtIHAueSApO1xuICAgIGNvbnN0IG0yMCA9IHAzLnggLSBwLng7XG4gICAgY29uc3QgbTIxID0gcDMueSAtIHAueTtcbiAgICBjb25zdCBtMjIgPSAoIHAzLnggLSBwLnggKSAqICggcDMueCAtIHAueCApICsgKCBwMy55IC0gcC55ICkgKiAoIHAzLnkgLSBwLnkgKTtcblxuICAgIGNvbnN0IGRldGVybWluYW50ID0gbTAwICogbTExICogbTIyICsgbTAxICogbTEyICogbTIwICsgbTAyICogbTEwICogbTIxIC0gbTAyICogbTExICogbTIwIC0gbTAxICogbTEwICogbTIyIC0gbTAwICogbTEyICogbTIxO1xuICAgIHJldHVybiBkZXRlcm1pbmFudCA+IDA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJheS1zcGhlcmUgaW50ZXJzZWN0aW9uLCByZXR1cm5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNsb3Nlc3QgaW50ZXJzZWN0aW9uLiBBc3N1bWVzIHRoZSBzcGhlcmUgaXMgY2VudGVyZWRcbiAgICogYXQgdGhlIG9yaWdpbiAoZm9yIGVhc2Ugb2YgY29tcHV0YXRpb24pLCB0cmFuc2Zvcm0gdGhlIHJheSB0byBjb21wZW5zYXRlIGlmIG5lZWRlZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBJZiB0aGVyZSBpcyBubyBpbnRlcnNlY3Rpb24sIG51bGwgaXMgcmV0dXJuZWQuIE90aGVyd2lzZSBhbiBvYmplY3Qgd2lsbCBiZSByZXR1cm5lZCBsaWtlOlxuICAgKiA8cHJlIGNsYXNzPVwiYnJ1c2g6IGpzXCI+XG4gICAqIHtcbiAgICogICBkaXN0YW5jZToge251bWJlcn0sIC8vIGRpc3RhbmNlIGZyb20gdGhlIHJheSBwb3NpdGlvbiB0byB0aGUgaW50ZXJzZWN0aW9uXG4gICAqICAgaGl0UG9pbnQ6IHtWZWN0b3IzfSwgLy8gbG9jYXRpb24gb2YgdGhlIGludGVyc2VjdGlvblxuICAgKiAgIG5vcm1hbDoge1ZlY3RvcjN9LCAvLyB0aGUgbm9ybWFsIG9mIHRoZSBzcGhlcmUncyBzdXJmYWNlIGF0IHRoZSBpbnRlcnNlY3Rpb25cbiAgICogICBmcm9tT3V0c2lkZToge2Jvb2xlYW59LCAvLyB3aGV0aGVyIHRoZSByYXkgaW50ZXJzZWN0ZWQgdGhlIHNwaGVyZSBmcm9tIG91dHNpZGUgdGhlIHNwaGVyZSBmaXJzdFxuICAgKiB9XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzXG4gICAqIEBwYXJhbSB7UmF5M30gcmF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBlcHNpbG9uXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICAvLyBhc3N1bWVzIGEgc3BoZXJlIHdpdGggdGhlIHNwZWNpZmllZCByYWRpdXMsIGNlbnRlcmVkIGF0IHRoZSBvcmlnaW5cbiAgc3BoZXJlUmF5SW50ZXJzZWN0aW9uKCByYWRpdXMsIHJheSwgZXBzaWxvbiApIHtcbiAgICBlcHNpbG9uID0gZXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMWUtNSA6IGVwc2lsb247XG5cbiAgICAvLyBjZW50ZXIgaXMgdGhlIG9yaWdpbiBmb3Igbm93LCBidXQgbGVhdmluZyBpbiBjb21wdXRhdGlvbnMgc28gdGhhdCB3ZSBjYW4gY2hhbmdlIHRoYXQgaW4gdGhlIGZ1dHVyZS4gb3B0aW1pemUgYXdheSBpZiBuZWVkZWRcbiAgICBjb25zdCBjZW50ZXIgPSBuZXcgVmVjdG9yMyggMCwgMCwgMCApO1xuXG4gICAgY29uc3QgcmF5RGlyID0gcmF5LmRpcmVjdGlvbjtcbiAgICBjb25zdCBwb3MgPSByYXkucG9zaXRpb247XG4gICAgY29uc3QgY2VudGVyVG9SYXkgPSBwb3MubWludXMoIGNlbnRlciApO1xuXG4gICAgLy8gYmFzaWNhbGx5LCB3ZSBjYW4gdXNlIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gdG8gc29sdmUgZm9yIGJvdGggcG9zc2libGUgaGl0IHBvaW50cyAoYm90aCArLSByb290cyBhcmUgdGhlIGhpdCBwb2ludHMpXG4gICAgY29uc3QgdG1wID0gcmF5RGlyLmRvdCggY2VudGVyVG9SYXkgKTtcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XG4gICAgY29uc3QgZGV0ID0gNCAqIHRtcCAqIHRtcCAtIDQgKiAoIGNlbnRlclRvUmF5RGlzdFNxIC0gcmFkaXVzICogcmFkaXVzICk7XG4gICAgaWYgKCBkZXQgPCBlcHNpbG9uICkge1xuICAgICAgLy8gcmF5IG1pc3NlcyBzcGhlcmUgZW50aXJlbHlcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2UgPSByYXlEaXIuZG90KCBjZW50ZXIgKSAtIHJheURpci5kb3QoIHBvcyApO1xuICAgIGNvbnN0IHNxdCA9IE1hdGguc3FydCggZGV0ICkgLyAyO1xuXG4gICAgLy8gdGhlIFwiZmlyc3RcIiBlbnRyeSBwb2ludCBkaXN0YW5jZSBpbnRvIHRoZSBzcGhlcmUuIGlmIHdlIGFyZSBpbnNpZGUgdGhlIHNwaGVyZSwgaXQgaXMgYmVoaW5kIHVzXG4gICAgY29uc3QgdGEgPSBiYXNlIC0gc3F0O1xuXG4gICAgLy8gdGhlIFwic2Vjb25kXCIgZW50cnkgcG9pbnQgZGlzdGFuY2VcbiAgICBjb25zdCB0YiA9IGJhc2UgKyBzcXQ7XG5cbiAgICBpZiAoIHRiIDwgZXBzaWxvbiApIHtcbiAgICAgIC8vIHNwaGVyZSBpcyBiZWhpbmQgcmF5LCBzbyBkb24ndCByZXR1cm4gYW4gaW50ZXJzZWN0aW9uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRQb3NpdGlvbkIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xuICAgIGNvbnN0IG5vcm1hbEIgPSBoaXRQb3NpdGlvbkIubWludXMoIGNlbnRlciApLm5vcm1hbGl6ZWQoKTtcblxuICAgIGlmICggdGEgPCBlcHNpbG9uICkge1xuICAgICAgLy8gd2UgYXJlIGluc2lkZSB0aGUgc3BoZXJlXG4gICAgICAvLyBpbiA9PiBvdXRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3RhbmNlOiB0YixcbiAgICAgICAgaGl0UG9pbnQ6IGhpdFBvc2l0aW9uQixcbiAgICAgICAgbm9ybWFsOiBub3JtYWxCLm5lZ2F0ZWQoKSxcbiAgICAgICAgZnJvbU91dHNpZGU6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHR3byBwb3NzaWJsZSBoaXRzXG4gICAgICBjb25zdCBoaXRQb3NpdGlvbkEgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YSApO1xuICAgICAgY29uc3Qgbm9ybWFsQSA9IGhpdFBvc2l0aW9uQS5taW51cyggY2VudGVyICkubm9ybWFsaXplZCgpO1xuXG4gICAgICAvLyBjbG9zZSBoaXQsIHdlIGhhdmUgb3V0ID0+IGluXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkaXN0YW5jZTogdGEsXG4gICAgICAgIGhpdFBvaW50OiBoaXRQb3NpdGlvbkEsXG4gICAgICAgIG5vcm1hbDogbm9ybWFsQSxcbiAgICAgICAgZnJvbU91dHNpZGU6IHRydWVcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSByZWFsIHJvb3RzIG9mIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gJGF4ICsgYj0wJCwgb3IgbnVsbCBpZiBldmVyeSB2YWx1ZSBpcyBhIHNvbHV0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPnxudWxsfSAtIFRoZSByZWFsIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cy4gSWYgdGhlIHJvb3QgaGFzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbXVsdGlwbGljaXR5IGxhcmdlciB0aGFuIDEsIGl0IHdpbGwgYmUgcmVwZWF0ZWQgdGhhdCBtYW55IHRpbWVzLlxuICAgKi9cbiAgc29sdmVMaW5lYXJSb290c1JlYWwoIGEsIGIgKSB7XG4gICAgaWYgKCBhID09PSAwICkge1xuICAgICAgaWYgKCBiID09PSAwICkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFsgLWIgLyBhIF07XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSByZWFsIHJvb3RzIG9mIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gJGF4XjIgKyBieCArIGM9MCQsIG9yIG51bGwgaWYgZXZlcnkgdmFsdWUgaXMgYVxuICAgKiBzb2x1dGlvbi4gSWYgYSBpcyBub256ZXJvLCB0aGVyZSBzaG91bGQgYmUgYmV0d2VlbiAwIGFuZCAyIChpbmNsdXNpdmUpIHZhbHVlcyByZXR1cm5lZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxuICAgKiBAcGFyYW0ge251bWJlcn0gY1xuICAgKiBAcmV0dXJucyB7QXJyYXkuPG51bWJlcj58bnVsbH0gLSBUaGUgcmVhbCByb290cyBvZiB0aGUgZXF1YXRpb24sIG9yIG51bGwgaWYgYWxsIHZhbHVlcyBhcmUgcm9vdHMuIElmIHRoZSByb290IGhhc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIG11bHRpcGxpY2l0eSBsYXJnZXIgdGhhbiAxLCBpdCB3aWxsIGJlIHJlcGVhdGVkIHRoYXQgbWFueSB0aW1lcy5cbiAgICovXG4gIHNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCBhLCBiLCBjICkge1xuICAgIC8vIENoZWNrIGZvciBhIGRlZ2VuZXJhdGUgY2FzZSB3aGVyZSB3ZSBkb24ndCBoYXZlIGEgcXVhZHJhdGljLCBvciBpZiB0aGUgb3JkZXIgb2YgbWFnbml0dWRlIGlzIHN1Y2ggd2hlcmUgdGhlXG4gICAgLy8gbGluZWFyIHNvbHV0aW9uIHdvdWxkIGJlIGV4cGVjdGVkXG4gICAgY29uc3QgZXBzaWxvbiA9IDFFNztcbiAgICBpZiAoIGEgPT09IDAgfHwgTWF0aC5hYnMoIGIgLyBhICkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKCBjIC8gYSApID4gZXBzaWxvbiApIHtcbiAgICAgIHJldHVybiBVdGlscy5zb2x2ZUxpbmVhclJvb3RzUmVhbCggYiwgYyApO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc2NyaW1pbmFudCA9IGIgKiBiIC0gNCAqIGEgKiBjO1xuICAgIGlmICggZGlzY3JpbWluYW50IDwgMCApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qgc3FydCA9IE1hdGguc3FydCggZGlzY3JpbWluYW50ICk7XG4gICAgLy8gVE9ETzogaG93IHRvIGhhbmRsZSBpZiBkaXNjcmltaW5hbnQgaXMgMD8gZ2l2ZSB1bmlxdWUgcm9vdCBvciBkb3VibGUgaXQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgLy8gVE9ETzogcHJvYmFibHkganVzdCB1c2UgQ29tcGxleCBmb3IgdGhlIGZ1dHVyZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHJldHVybiBbXG4gICAgICAoIC1iIC0gc3FydCApIC8gKCAyICogYSApLFxuICAgICAgKCAtYiArIHNxcnQgKSAvICggMiAqIGEgKVxuICAgIF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIHJlYWwgcm9vdHMgb2YgdGhlIGN1YmljIGVxdWF0aW9uICRheF4zICsgYnheMiArIGN4ICsgZD0wJCwgb3IgbnVsbCBpZiBldmVyeSB2YWx1ZSBpcyBhXG4gICAqIHNvbHV0aW9uLiBJZiBhIGlzIG5vbnplcm8sIHRoZXJlIHNob3VsZCBiZSBiZXR3ZWVuIDAgYW5kIDMgKGluY2x1c2l2ZSkgdmFsdWVzIHJldHVybmVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZGlzY3JpbWluYW50VGhyZXNob2xkXSAtIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIHdlIGhhdmUgYSBzaW5nbGUgcmVhbCByb290XG4gICAqIEByZXR1cm5zIHtBcnJheS48bnVtYmVyPnxudWxsfSAtIFRoZSByZWFsIHJvb3RzIG9mIHRoZSBlcXVhdGlvbiwgb3IgbnVsbCBpZiBhbGwgdmFsdWVzIGFyZSByb290cy4gSWYgdGhlIHJvb3QgaGFzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbXVsdGlwbGljaXR5IGxhcmdlciB0aGFuIDEsIGl0IHdpbGwgYmUgcmVwZWF0ZWQgdGhhdCBtYW55IHRpbWVzLlxuICAgKi9cbiAgc29sdmVDdWJpY1Jvb3RzUmVhbCggYSwgYiwgYywgZCwgZGlzY3JpbWluYW50VGhyZXNob2xkID0gMWUtNyApIHtcblxuICAgIGxldCByb290cztcblxuICAgIC8vIFRPRE86IGEgQ29tcGxleCB0eXBlISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuXG4gICAgLy8gQ2hlY2sgZm9yIGEgZGVnZW5lcmF0ZSBjYXNlIHdoZXJlIHdlIGRvbid0IGhhdmUgYSBjdWJpY1xuICAgIGlmICggYSA9PT0gMCApIHtcbiAgICAgIHJvb3RzID0gVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGIsIGMsIGQgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvL1dlIG5lZWQgdG8gdGVzdCB3aGV0aGVyIGEgaXMgc2V2ZXJhbCBvcmRlcnMgb2YgbWFnbml0dWRlIGxlc3MgdGhhbiBiLCBjLCBkXG4gICAgICBjb25zdCBlcHNpbG9uID0gMUU3O1xuXG4gICAgICBpZiAoIGEgPT09IDAgfHwgTWF0aC5hYnMoIGIgLyBhICkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKCBjIC8gYSApID4gZXBzaWxvbiB8fCBNYXRoLmFicyggZCAvIGEgKSA+IGVwc2lsb24gKSB7XG4gICAgICAgIHJvb3RzID0gVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGIsIGMsIGQgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIGQgPT09IDAgfHwgTWF0aC5hYnMoIGEgLyBkICkgPiBlcHNpbG9uIHx8IE1hdGguYWJzKCBiIC8gZCApID4gZXBzaWxvbiB8fCBNYXRoLmFicyggYyAvIGQgKSA+IGVwc2lsb24gKSB7XG4gICAgICAgICAgcm9vdHMgPSBbIDAgXS5jb25jYXQoIFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCBhLCBiLCBjICkgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBiIC89IGE7XG4gICAgICAgICAgYyAvPSBhO1xuICAgICAgICAgIGQgLz0gYTtcblxuICAgICAgICAgIGNvbnN0IHEgPSAoIDMuMCAqIGMgLSAoIGIgKiBiICkgKSAvIDk7XG4gICAgICAgICAgY29uc3QgciA9ICggLSggMjcgKiBkICkgKyBiICogKCA5ICogYyAtIDIgKiAoIGIgKiBiICkgKSApIC8gNTQ7XG4gICAgICAgICAgY29uc3QgZGlzY3JpbWluYW50ID0gcSAqIHEgKiBxICsgciAqIHI7XG4gICAgICAgICAgY29uc3QgYjMgPSBiIC8gMztcblxuICAgICAgICAgIGlmICggZGlzY3JpbWluYW50ID4gZGlzY3JpbWluYW50VGhyZXNob2xkICkge1xuICAgICAgICAgICAgLy8gYSBzaW5nbGUgcmVhbCByb290XG4gICAgICAgICAgICBjb25zdCBkc3FydCA9IE1hdGguc3FydCggZGlzY3JpbWluYW50ICk7XG4gICAgICAgICAgICByb290cyA9IFsgVXRpbHMuY3ViZVJvb3QoIHIgKyBkc3FydCApICsgVXRpbHMuY3ViZVJvb3QoIHIgLSBkc3FydCApIC0gYjMgXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIGRpc2NyaW1pbmFudCA+IC1kaXNjcmltaW5hbnRUaHJlc2hvbGQgKSB7IC8vIHdvdWxkIHRydWx5IGJlIGRpc2NyaW1pbmFudD09MCwgYnV0IGZsb2F0aW5nLXBvaW50IGVycm9yXG4gICAgICAgICAgICAvLyBjb250YWlucyBhIGRvdWJsZSByb290IChidXQgd2l0aCB0aHJlZSByb290cylcbiAgICAgICAgICAgIGNvbnN0IHJzcXJ0ID0gVXRpbHMuY3ViZVJvb3QoIHIgKTtcbiAgICAgICAgICAgIGNvbnN0IGRvdWJsZVJvb3QgPSAtYjMgLSByc3FydDtcbiAgICAgICAgICAgIHJvb3RzID0gWyAtYjMgKyAyICogcnNxcnQsIGRvdWJsZVJvb3QsIGRvdWJsZVJvb3QgXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhbGwgdW5pcXVlICh0aHJlZSByb290cylcbiAgICAgICAgICAgIGxldCBxWCA9IC1xICogcSAqIHE7XG4gICAgICAgICAgICBxWCA9IE1hdGguYWNvcyggciAvIE1hdGguc3FydCggcVggKSApO1xuICAgICAgICAgICAgY29uc3QgcnIgPSAyICogTWF0aC5zcXJ0KCAtcSApO1xuICAgICAgICAgICAgcm9vdHMgPSBbXG4gICAgICAgICAgICAgIC1iMyArIHJyICogTWF0aC5jb3MoIHFYIC8gMyApLFxuICAgICAgICAgICAgICAtYjMgKyByciAqIE1hdGguY29zKCAoIHFYICsgMiAqIE1hdGguUEkgKSAvIDMgKSxcbiAgICAgICAgICAgICAgLWIzICsgcnIgKiBNYXRoLmNvcyggKCBxWCArIDQgKiBNYXRoLlBJICkgLyAzIClcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIHJvb3RzICYmIHJvb3RzLmZvckVhY2goIHJvb3QgPT4gYXNzZXJ0KCBpc0Zpbml0ZSggcm9vdCApLCAnQWxsIHJldHVybmVkIHNvbHZlQ3ViaWNSb290c1JlYWwgcm9vdHMgc2hvdWxkIGJlIGZpbml0ZScgKSApO1xuXG4gICAgcmV0dXJuIHJvb3RzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1bmlxdWUgcmVhbCBjdWJlIHJvb3Qgb2YgeCwgc3VjaCB0aGF0ICR5XjM9eCQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGN1YmVSb290KCB4ICkge1xuICAgIHJldHVybiB4ID49IDAgPyBNYXRoLnBvdyggeCwgMSAvIDMgKSA6IC1NYXRoLnBvdyggLXgsIDEgLyAzICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlZmluZXMgYW5kIGV2YWx1YXRlcyBhIGxpbmVhciBtYXBwaW5nLiBUaGUgbWFwcGluZyBpcyBkZWZpbmVkIHNvIHRoYXQgJGYoYV8xKT1iXzEkIGFuZCAkZihhXzIpPWJfMiQsIGFuZCBvdGhlclxuICAgKiB2YWx1ZXMgYXJlIGludGVycG9sYXRlZCBhbG9uZyB0aGUgbGluZWFyIGVxdWF0aW9uLiBUaGUgcmV0dXJuZWQgdmFsdWUgaXMgJGYoYV8zKSQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGExXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhMlxuICAgKiBAcGFyYW0ge251bWJlcn0gYjFcbiAgICogQHBhcmFtIHtudW1iZXJ9IGIyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhM1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbGluZWFyKCBhMSwgYTIsIGIxLCBiMiwgYTMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGEzID09PSAnbnVtYmVyJywgJ2xpbmVhciByZXF1aXJlcyBhIG51bWJlciB0byBldmFsdWF0ZScgKTtcbiAgICByZXR1cm4gKCBiMiAtIGIxICkgLyAoIGEyIC0gYTEgKSAqICggYTMgLSBhMSApICsgYjE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJvdW5kcyB1c2luZyBcIlJvdW5kIGhhbGYgYXdheSBmcm9tIHplcm9cIiBhbGdvcml0aG0uIFNlZSBkb3QjMzUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogSmF2YVNjcmlwdCdzIE1hdGgucm91bmQgaXMgbm90IHN5bW1ldHJpYyBmb3IgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIG51bWJlcnMsIGl0IHVzZXMgSUVFRSA3NTQgXCJSb3VuZCBoYWxmIHVwXCIuXG4gICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Sb3VuZGluZyNSb3VuZF9oYWxmX3VwLlxuICAgKiBGb3Igc2ltcywgd2Ugd2FudCB0byB0cmVhdCBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzIHN5bW1ldHJpY2FsbHksIHdoaWNoIGlzIElFRUUgNzU0IFwiUm91bmQgaGFsZiBhd2F5IGZyb20gemVyb1wiLFxuICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUm91bmRpbmcjUm91bmRfaGFsZl9hd2F5X2Zyb21femVyb1xuICAgKlxuICAgKiBOb3RlIHRoYXQgLTAgaXMgcm91bmRlZCB0byAwLCBzaW5jZSB3ZSB0eXBpY2FsbHkgZG8gbm90IHdhbnQgdG8gZGlzcGxheSAtMCBpbiBzaW1zLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgcm91bmRTeW1tZXRyaWMoIHZhbHVlICkge1xuICAgIHJldHVybiAoICggdmFsdWUgPCAwICkgPyAtMSA6IDEgKSAqIE1hdGgucm91bmQoIE1hdGguYWJzKCB2YWx1ZSApICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgfSxcblxuICAvKipcbiAgICogQSBwcmVkaWN0YWJsZSBpbXBsZW1lbnRhdGlvbiBvZiB0b0ZpeGVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEphdmFTY3JpcHQncyB0b0ZpeGVkIGlzIG5vdG9yaW91c2x5IGJ1Z2d5LCBiZWhhdmlvciBkaWZmZXJzIGRlcGVuZGluZyBvbiBicm93c2VyLFxuICAgKiBiZWNhdXNlIHRoZSBzcGVjIGRvZXNuJ3Qgc3BlY2lmeSB3aGV0aGVyIHRvIHJvdW5kIG9yIGZsb29yLlxuICAgKiBSb3VuZGluZyBpcyBzeW1tZXRyaWMgZm9yIHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSB2YWx1ZXMsIHNlZSBVdGlscy5yb3VuZFN5bW1ldHJpYy5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFsUGxhY2VzXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b0ZpeGVkKCB2YWx1ZSwgZGVjaW1hbFBsYWNlcyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggZGVjaW1hbFBsYWNlcyApLCBgZGVjaW1hbCBwbGFjZXMgbXVzdCBiZSBhbiBpbnRlZ2VyOiAke2RlY2ltYWxQbGFjZXN9YCApO1xuICAgIGlmICggaXNOYU4oIHZhbHVlICkgKSB7XG4gICAgICByZXR1cm4gJ05hTic7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZSA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZICkge1xuICAgICAgcmV0dXJuICdJbmZpbml0eSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZSA9PT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZICkge1xuICAgICAgcmV0dXJuICctSW5maW5pdHknO1xuICAgIH1cblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBCaWcoIHZhbHVlICkudG9GaXhlZCggZGVjaW1hbFBsYWNlcyApO1xuXG4gICAgLy8gQXZvaWQgcmVwb3J0aW5nIC0wLjAwMFxuICAgIGlmICggcmVzdWx0LnN0YXJ0c1dpdGgoICctMC4nICkgJiYgTnVtYmVyLnBhcnNlRmxvYXQoIHJlc3VsdCApID09PSAwICkge1xuICAgICAgcmV0dXJuICcwJyArIHJlc3VsdC5zbGljZSggMiApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBIHByZWRpY3RhYmxlIGltcGxlbWVudGF0aW9uIG9mIHRvRml4ZWQsIHdoZXJlIHRoZSByZXN1bHQgaXMgcmV0dXJuZWQgYXMgYSBudW1iZXIgaW5zdGVhZCBvZiBhIHN0cmluZy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBKYXZhU2NyaXB0J3MgdG9GaXhlZCBpcyBub3RvcmlvdXNseSBidWdneSwgYmVoYXZpb3IgZGlmZmVycyBkZXBlbmRpbmcgb24gYnJvd3NlcixcbiAgICogYmVjYXVzZSB0aGUgc3BlYyBkb2Vzbid0IHNwZWNpZnkgd2hldGhlciB0byByb3VuZCBvciBmbG9vci5cbiAgICogUm91bmRpbmcgaXMgc3ltbWV0cmljIGZvciBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBzZWUgVXRpbHMucm91bmRTeW1tZXRyaWMuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbFBsYWNlc1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdG9GaXhlZE51bWJlciggdmFsdWUsIGRlY2ltYWxQbGFjZXMgKSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoIFV0aWxzLnRvRml4ZWQoIHZhbHVlLCBkZWNpbWFsUGxhY2VzICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHR3byBudW1iZXJzIGFyZSB3aXRoaW4gZXBzaWxvbiBvZiBlYWNoIG90aGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYVxuICAgKiBAcGFyYW0ge251bWJlcn0gYlxuICAgKiBAcGFyYW0ge251bWJlcn0gZXBzaWxvblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGVxdWFsc0Vwc2lsb24oIGEsIGIsIGVwc2lsb24gKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKCBhIC0gYiApIDw9IGVwc2lsb247XG4gIH0sXG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBpbnRlcnNlY3Rpb24gb2YgdGhlIHR3byBsaW5lIHNlZ21lbnRzICQoeF8xLHlfMSkoeF8yLHlfMikkIGFuZCAkKHhfMyx5XzMpKHhfNCx5XzQpJC4gSWYgdGhlcmUgaXMgbm9cbiAgICogaW50ZXJzZWN0aW9uLCBudWxsIGlzIHJldHVybmVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxuICAgKiBAcGFyYW0ge251bWJlcn0geTFcbiAgICogQHBhcmFtIHtudW1iZXJ9IHgyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxuICAgKiBAcGFyYW0ge251bWJlcn0geDNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4NFxuICAgKiBAcGFyYW0ge251bWJlcn0geTRcbiAgICogQHJldHVybnMge1ZlY3RvcjJ8bnVsbH1cbiAgICovXG4gIGxpbmVTZWdtZW50SW50ZXJzZWN0aW9uKCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQgKSB7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIC8vIERldGVybWluZXMgY291bnRlcmNsb2Nrd2lzZW5lc3MuIFBvc2l0aXZlIGlmIGNvdW50ZXJjbG9ja3dpc2UsIG5lZ2F0aXZlIGlmIGNsb2Nrd2lzZSwgemVybyBpZiBzdHJhaWdodCBsaW5lXG4gICAgLy8gUG9pbnQxKGEsYiksIFBvaW50MihjLGQpLCBQb2ludDMoZSxmKVxuICAgIC8vIFNlZSBodHRwOi8vamVmZmUuY3MuaWxsaW5vaXMuZWR1L3RlYWNoaW5nLzM3My9ub3Rlcy94MDUtY29udmV4aHVsbC5wZGZcbiAgICAvLyBAcmV0dXJucyB7bnVtYmVyfVxuICAgIGNvbnN0IGNjdyA9ICggYSwgYiwgYywgZCwgZSwgZiApID0+ICggZiAtIGIgKSAqICggYyAtIGEgKSAtICggZCAtIGIgKSAqICggZSAtIGEgKTtcblxuICAgIC8vIENoZWNrIGlmIGludGVyc2VjdGlvbiBkb2Vzbid0IGV4aXN0LiBTZWUgaHR0cDovL2plZmZlLmNzLmlsbGlub2lzLmVkdS90ZWFjaGluZy8zNzMvbm90ZXMveDA2LXN3ZWVwbGluZS5wZGZcbiAgICAvLyBJZiBwb2ludDEgYW5kIHBvaW50MiBhcmUgb24gb3Bwb3NpdGUgc2lkZXMgb2YgbGluZSAzIDQsIGV4YWN0bHkgb25lIG9mIHRoZSB0d28gdHJpcGxlcyAxLCAzLCA0IGFuZCAyLCAzLCA0XG4gICAgLy8gaXMgaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlci5cbiAgICBpZiAoIGNjdyggeDEsIHkxLCB4MywgeTMsIHg0LCB5NCApICogY2N3KCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0ICkgPiAwIHx8XG4gICAgICAgICBjY3coIHgzLCB5MywgeDEsIHkxLCB4MiwgeTIgKSAqIGNjdyggeDQsIHk0LCB4MSwgeTEsIHgyLCB5MiApID4gMFxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVub20gPSAoIHgxIC0geDIgKSAqICggeTMgLSB5NCApIC0gKCB5MSAtIHkyICkgKiAoIHgzIC0geDQgKTtcbiAgICAvLyBJZiBkZW5vbWluYXRvciBpcyAwLCB0aGUgbGluZXMgYXJlIHBhcmFsbGVsIG9yIGNvaW5jaWRlbnRcbiAgICBpZiAoIE1hdGguYWJzKCBkZW5vbSApIDwgMWUtMTAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhbiBleGFjdCBlbmRwb2ludCBvdmVybGFwIChhbmQgdGhlbiByZXR1cm4gYW4gZXhhY3QgYW5zd2VyKS5cbiAgICBpZiAoICggeDEgPT09IHgzICYmIHkxID09PSB5MyApIHx8ICggeDEgPT09IHg0ICYmIHkxID09PSB5NCApICkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4MSwgeTEgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoICggeDIgPT09IHgzICYmIHkyID09PSB5MyApIHx8ICggeDIgPT09IHg0ICYmIHkyID09PSB5NCApICkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4MiwgeTIgKTtcbiAgICB9XG5cbiAgICAvLyBVc2UgZGV0ZXJtaW5hbnRzIHRvIGNhbGN1bGF0ZSBpbnRlcnNlY3Rpb24sIHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaW5lJUUyJTgwJTkzbGluZV9pbnRlcnNlY3Rpb25cbiAgICBjb25zdCBpbnRlcnNlY3Rpb25YID0gKCAoIHgxICogeTIgLSB5MSAqIHgyICkgKiAoIHgzIC0geDQgKSAtICggeDEgLSB4MiApICogKCB4MyAqIHk0IC0geTMgKiB4NCApICkgLyBkZW5vbTtcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25ZID0gKCAoIHgxICogeTIgLSB5MSAqIHgyICkgKiAoIHkzIC0geTQgKSAtICggeTEgLSB5MiApICogKCB4MyAqIHk0IC0geTMgKiB4NCApICkgLyBkZW5vbTtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGludGVyc2VjdGlvblgsIGludGVyc2VjdGlvblkgKTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBTcXVhcmVkIGRpc3RhbmNlIGZyb20gYSBwb2ludCB0byBhIGxpbmUgc2VnbWVudCBzcXVhcmVkLlxuICAgKiBTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NDkyMTEvc2hvcnRlc3QtZGlzdGFuY2UtYmV0d2Vlbi1hLXBvaW50LWFuZC1hLWxpbmUtc2VnbWVudFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBUaGUgcG9pbnRcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhIC0gU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGxpbmUgc2VnbWVudFxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGIgLSBFbmRpbmcgcG9pbnQgb2YgdGhlIGxpbmUgc2VnbWVudFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZGlzdFRvU2VnbWVudFNxdWFyZWQoIHBvaW50LCBhLCBiICkge1xuICAgIC8vIHRoZSBzcXVhcmUgb2YgdGhlIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYixcbiAgICBjb25zdCBzZWdtZW50U3F1YXJlZExlbmd0aCA9IGEuZGlzdGFuY2VTcXVhcmVkKCBiICk7XG5cbiAgICAvLyBpZiB0aGUgc2VnbWVudCBsZW5ndGggaXMgemVybywgdGhlIGEgYW5kIGIgcG9pbnQgYXJlIGNvaW5jaWRlbnQuIHJldHVybiB0aGUgc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIHBvaW50XG4gICAgaWYgKCBzZWdtZW50U3F1YXJlZExlbmd0aCA9PT0gMCApIHsgcmV0dXJuIHBvaW50LmRpc3RhbmNlU3F1YXJlZCggYSApOyB9XG5cbiAgICAvLyB0aGUgdCB2YWx1ZSBwYXJhbWV0cml6ZSB0aGUgcHJvamVjdGlvbiBvZiB0aGUgcG9pbnQgb250byB0aGUgYSBiIGxpbmVcbiAgICBjb25zdCB0ID0gKCAoIHBvaW50LnggLSBhLnggKSAqICggYi54IC0gYS54ICkgKyAoIHBvaW50LnkgLSBhLnkgKSAqICggYi55IC0gYS55ICkgKSAvIHNlZ21lbnRTcXVhcmVkTGVuZ3RoO1xuXG4gICAgbGV0IGRpc3RhbmNlU3F1YXJlZDtcblxuICAgIGlmICggdCA8IDAgKSB7XG4gICAgICAvLyBpZiB0PDAsIHRoZSBwcm9qZWN0aW9uIHBvaW50IGlzIG91dHNpZGUgdGhlIGFiIGxpbmUsIGJleW9uZCBhXG4gICAgICBkaXN0YW5jZVNxdWFyZWQgPSBwb2ludC5kaXN0YW5jZVNxdWFyZWQoIGEgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHQgPiAxICkge1xuICAgICAgLy8gaWYgdD4xLCB0aGUgcHJvamVjdGlvbiBwYXN0IGlzIG91dHNpZGUgdGhlIGFiIHNlZ21lbnQsIGJleW9uZCBiLFxuICAgICAgZGlzdGFuY2VTcXVhcmVkID0gcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBiICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gaWYgMDx0PDEsIHRoZSBwcm9qZWN0aW9uIHBvaW50IGxpZXMgYWxvbmcgdGhlIGxpbmUgam9pbmluZyBhIGFuZCBiLlxuICAgICAgZGlzdGFuY2VTcXVhcmVkID0gcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBuZXcgVmVjdG9yMiggYS54ICsgdCAqICggYi54IC0gYS54ICksIGEueSArIHQgKiAoIGIueSAtIGEueSApICkgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlzdGFuY2VTcXVhcmVkO1xuXG4gIH0sXG5cbiAgLyoqXG4gICAqIGRpc3RhbmNlIGZyb20gYSBwb2ludCB0byBhIGxpbmUgc2VnbWVudCBzcXVhcmVkLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnQgLSBUaGUgcG9pbnRcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhIC0gU3RhcnRpbmcgcG9pbnQgb2YgdGhlIGxpbmUgc2VnbWVudFxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGIgLSBFbmRpbmcgcG9pbnQgb2YgdGhlIGxpbmUgc2VnbWVudFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZGlzdFRvU2VnbWVudCggcG9pbnQsIGEsIGIgKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0VG9TZWdtZW50U3F1YXJlZCggcG9pbnQsIGEsIGIgKSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHRocmVlIHBvaW50cyBhcmUgYXBwcm94aW1hdGVseSBjb2xsaW5lYXIuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBhXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gYlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGNcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtlcHNpbG9uXVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGFyZVBvaW50c0NvbGxpbmVhciggYSwgYiwgYywgZXBzaWxvbiApIHtcbiAgICBpZiAoIGVwc2lsb24gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGVwc2lsb24gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gVXRpbHMudHJpYW5nbGVBcmVhKCBhLCBiLCBjICkgPD0gZXBzaWxvbjtcbiAgfSxcblxuICAvKipcbiAgICogVGhlIGFyZWEgaW5zaWRlIHRoZSB0cmlhbmdsZSBkZWZpbmVkIGJ5IHRoZSB0aHJlZSB2ZXJ0aWNlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGFcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBiXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gY1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdHJpYW5nbGVBcmVhKCBhLCBiLCBjICkge1xuICAgIHJldHVybiBNYXRoLmFicyggVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBhLCBiLCBjICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogVGhlIGFyZWEgaW5zaWRlIHRoZSB0cmlhbmdsZSBkZWZpbmVkIGJ5IHRoZSB0aHJlZSB2ZXJ0aWNlcywgYnV0IHdpdGggdGhlIHNpZ24gZGV0ZXJtaW5lZCBieSB3aGV0aGVyIHRoZSB2ZXJ0aWNlc1xuICAgKiBwcm92aWRlZCBhcmUgY2xvY2t3aXNlIG9yIGNvdW50ZXItY2xvY2t3aXNlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIElmIHRoZSB2ZXJ0aWNlcyBhcmUgY291bnRlcmNsb2Nrd2lzZSAoaW4gYSByaWdodC1oYW5kZWQgY29vcmRpbmF0ZSBzeXN0ZW0pLCB0aGVuIHRoZSBzaWduZWQgYXJlYSB3aWxsIGJlXG4gICAqIHBvc2l0aXZlLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGFcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBiXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gY1xuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgdHJpYW5nbGVBcmVhU2lnbmVkKCBhLCBiLCBjICkge1xuICAgIHJldHVybiBhLnggKiAoIGIueSAtIGMueSApICsgYi54ICogKCBjLnkgLSBhLnkgKSArIGMueCAqICggYS55IC0gYi55ICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRyb2lkIG9mIHRoZSBzaW1wbGUgcGxhbmFyIHBvbHlnb24gdXNpbmcgR3JlZW4ncyBUaGVvcmVtIFA9LXkvMiwgUT14LzIgKHNpbWlsYXIgdG8gaG93IGtpdGVcbiAgICogY29tcHV0ZXMgYXJlYXMpLiBTZWUgYWxzbyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TaG9lbGFjZV9mb3JtdWxhLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSB2ZXJ0aWNlc1xuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cbiAgICovXG4gIGNlbnRyb2lkT2ZQb2x5Z29uKCB2ZXJ0aWNlcyApIHtcbiAgICBjb25zdCBjZW50cm9pZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgICBsZXQgYXJlYSA9IDA7XG4gICAgdmVydGljZXMuZm9yRWFjaCggKCB2MCwgaSApID0+IHtcbiAgICAgIGNvbnN0IHYxID0gdmVydGljZXNbICggaSArIDEgKSAlIHZlcnRpY2VzLmxlbmd0aCBdO1xuICAgICAgY29uc3QgZG91YmxlU2hvZWxhY2UgPSB2MC54ICogdjEueSAtIHYxLnggKiB2MC55O1xuXG4gICAgICBhcmVhICs9IGRvdWJsZVNob2VsYWNlIC8gMjtcblxuICAgICAgLy8gQ29tcHV0ZSB0aGUgY2VudHJvaWQgb2YgdGhlIGZsYXQgaW50ZXJzZWN0aW9uIHdpdGggaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ2VudHJvaWQjT2ZfYV9wb2x5Z29uXG4gICAgICBjZW50cm9pZC5hZGRYWShcbiAgICAgICAgKCB2MC54ICsgdjEueCApICogZG91YmxlU2hvZWxhY2UsXG4gICAgICAgICggdjAueSArIHYxLnkgKSAqIGRvdWJsZVNob2VsYWNlXG4gICAgICApO1xuICAgIH0gKTtcbiAgICBjZW50cm9pZC5kaXZpZGVTY2FsYXIoIDYgKiBhcmVhICk7XG5cbiAgICByZXR1cm4gY2VudHJvaWQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgaHlwZXJib2xpYyBjb3NpbmUgb2YgYSBudW1iZXJcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGNvc2goIHZhbHVlICkge1xuICAgIHJldHVybiAoIE1hdGguZXhwKCB2YWx1ZSApICsgTWF0aC5leHAoIC12YWx1ZSApICkgLyAyO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGh5cGVyYm9saWMgc2luZSBvZiBhIG51bWJlclxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgc2luaCggdmFsdWUgKSB7XG4gICAgcmV0dXJuICggTWF0aC5leHAoIHZhbHVlICkgLSBNYXRoLmV4cCggLXZhbHVlICkgKSAvIDI7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExvZyBiYXNlLTEwLCBzaW5jZSBpdCB3YXNuJ3QgaW5jbHVkZWQgaW4gZXZlcnkgc3VwcG9ydGVkIGJyb3dzZXIuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgbG9nMTAoIHZhbCApIHtcbiAgICByZXR1cm4gTWF0aC5sb2coIHZhbCApIC8gTWF0aC5MTjEwO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZXMgYSByYW5kb20gR2F1c3NpYW4gc2FtcGxlIHdpdGggdGhlIGdpdmVuIG1lYW4gYW5kIHN0YW5kYXJkIGRldmlhdGlvbi5cbiAgICogVGhpcyBtZXRob2QgcmVsaWVzIG9uIHRoZSBcInN0YXRpY1wiIHZhcmlhYmxlcyBnZW5lcmF0ZSwgejAsIGFuZCB6MSBkZWZpbmVkIGFib3ZlLlxuICAgKiBSYW5kb20uanMgaXMgdGhlIHByaW1hcnkgY2xpZW50IG9mIHRoaXMgZnVuY3Rpb24sIGJ1dCBpdCBpcyBkZWZpbmVkIGhlcmUgc28gaXQgY2FuIGJlXG4gICAqIHVzZWQgb3RoZXIgcGxhY2VzIG1vcmUgZWFzaWx5IGlmIG5lZWQgYmUuXG4gICAqIENvZGUgaW5zcGlyZWQgYnkgZXhhbXBsZSBoZXJlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Cb3glRTIlODAlOTNNdWxsZXJfdHJhbnNmb3JtLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtdSAtIFRoZSBtZWFuIG9mIHRoZSBHYXVzc2lhblxuICAgKiBAcGFyYW0ge251bWJlcn0gc2lnbWEgLSBUaGUgc3RhbmRhcmQgZGV2aWF0aW9uIG9mIHRoZSBHYXVzc2lhblxuICAgKiBAcGFyYW0ge1JhbmRvbX0gcmFuZG9tIC0gdGhlIHNvdXJjZSBvZiByYW5kb21uZXNzXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBib3hNdWxsZXJUcmFuc2Zvcm0oIG11LCBzaWdtYSwgcmFuZG9tICkge1xuICAgIGdlbmVyYXRlID0gIWdlbmVyYXRlO1xuXG4gICAgaWYgKCAhZ2VuZXJhdGUgKSB7XG4gICAgICByZXR1cm4gejEgKiBzaWdtYSArIG11O1xuICAgIH1cblxuICAgIGxldCB1MTtcbiAgICBsZXQgdTI7XG4gICAgZG8ge1xuICAgICAgdTEgPSByYW5kb20ubmV4dERvdWJsZSgpO1xuICAgICAgdTIgPSByYW5kb20ubmV4dERvdWJsZSgpO1xuICAgIH1cbiAgICB3aGlsZSAoIHUxIDw9IEVQU0lMT04gKTtcblxuICAgIHowID0gTWF0aC5zcXJ0KCAtMi4wICogTWF0aC5sb2coIHUxICkgKSAqIE1hdGguY29zKCBUV09fUEkgKiB1MiApO1xuICAgIHoxID0gTWF0aC5zcXJ0KCAtMi4wICogTWF0aC5sb2coIHUxICkgKSAqIE1hdGguc2luKCBUV09fUEkgKiB1MiApO1xuICAgIHJldHVybiB6MCAqIHNpZ21hICsgbXU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBpbiBhIHZhbHVlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIGEgZmluaXRlIG51bWJlciwgc2NpZW50aWZpYyBub3RhdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGZvciBkZWNpbWFsIG51bWJlcnNcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIG51bWJlck9mRGVjaW1hbFBsYWNlcyggdmFsdWUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggdmFsdWUgKSwgYHZhbHVlIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyICR7dmFsdWV9YCApO1xuICAgIGlmICggTWF0aC5mbG9vciggdmFsdWUgKSA9PT0gdmFsdWUgKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBzdHJpbmcgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAvLyBIYW5kbGUgc2NpZW50aWZpYyBub3RhdGlvblxuICAgICAgaWYgKCBzdHJpbmcuaW5jbHVkZXMoICdlJyApICkge1xuICAgICAgICAvLyBlLmcuICcxZS0yMScsICc1LjZlKzM0JywgZXRjLlxuICAgICAgICBjb25zdCBzcGxpdCA9IHN0cmluZy5zcGxpdCggJ2UnICk7XG4gICAgICAgIGNvbnN0IG1hbnRpc3NhID0gc3BsaXRbIDAgXTsgLy8gVGhlIGxlZnQgcGFydCwgZS5nLiAnMScgb3IgJzUuNidcbiAgICAgICAgY29uc3QgZXhwb25lbnQgPSBOdW1iZXIoIHNwbGl0WyAxIF0gKTsgLy8gVGhlIHJpZ2h0IHBhcnQsIGUuZy4gJy0yMScgb3IgJyszNCdcblxuICAgICAgICAvLyBIb3cgbWFueSBkZWNpbWFsIHBsYWNlcyBhcmUgdGhlcmUgaW4gdGhlIGxlZnQgcGFydFxuICAgICAgICBjb25zdCBtYW50aXNzYURlY2ltYWxQbGFjZXMgPSBtYW50aXNzYS5pbmNsdWRlcyggJy4nICkgPyBtYW50aXNzYS5zcGxpdCggJy4nIClbIDEgXS5sZW5ndGggOiAwO1xuXG4gICAgICAgIC8vIFdlIGFkanVzdCB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGJ5IHRoZSBleHBvbmVudCwgZS5nLiAnMS41ZTEnIGhhcyB6ZXJvIGRlY2ltYWwgcGxhY2VzLCBhbmRcbiAgICAgICAgLy8gJzEuNWUtMicgaGFzIHRocmVlLlxuICAgICAgICByZXR1cm4gTWF0aC5tYXgoIG1hbnRpc3NhRGVjaW1hbFBsYWNlcyAtIGV4cG9uZW50LCAwICk7XG4gICAgICB9XG4gICAgICBlbHNlIHsgLy8gSGFuZGxlIGRlY2ltYWwgbm90YXRpb24uIFNpbmNlIHdlJ3JlIG5vdCBhbiBpbnRlZ2VyLCB3ZSBzaG91bGQgYmUgZ3VhcmFudGVlZCB0byBoYXZlIGEgZGVjaW1hbFxuICAgICAgICByZXR1cm4gc3RyaW5nLnNwbGl0KCAnLicgKVsgMSBdLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJvdW5kcyBhIHZhbHVlIHRvIGEgbXVsdGlwbGUgb2YgYSBzcGVjaWZpZWQgaW50ZXJ2YWwuXG4gICAqIEV4YW1wbGVzOlxuICAgKiByb3VuZFRvSW50ZXJ2YWwoIDAuNTY3LCAwLjAxICkgLT4gMC41N1xuICAgKiByb3VuZFRvSW50ZXJ2YWwoIDAuNTY3LCAwLjAyICkgLT4gMC41NlxuICAgKiByb3VuZFRvSW50ZXJ2YWwoIDUuNjcsIDAuNSApIC0+IDUuNVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGludGVydmFsXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICByb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBpbnRlcnZhbCApIHtcbiAgICByZXR1cm4gVXRpbHMudG9GaXhlZE51bWJlciggVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlIC8gaW50ZXJ2YWwgKSAqIGludGVydmFsLFxuICAgICAgVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCBpbnRlcnZhbCApICk7XG4gIH1cbn07XG5kb3QucmVnaXN0ZXIoICdVdGlscycsIFV0aWxzICk7XG5cbi8vIG1ha2UgdGhlc2UgYXZhaWxhYmxlIGluIHRoZSBtYWluIG5hbWVzcGFjZSBkaXJlY3RseSAoZm9yIG5vdylcbmRvdC5jbGFtcCA9IFV0aWxzLmNsYW1wO1xuZG90Lm1vZHVsb0JldHdlZW5Eb3duID0gVXRpbHMubW9kdWxvQmV0d2VlbkRvd247XG5kb3QubW9kdWxvQmV0d2VlblVwID0gVXRpbHMubW9kdWxvQmV0d2VlblVwO1xuZG90LnJhbmdlSW5jbHVzaXZlID0gVXRpbHMucmFuZ2VJbmNsdXNpdmU7XG5kb3QucmFuZ2VFeGNsdXNpdmUgPSBVdGlscy5yYW5nZUV4Y2x1c2l2ZTtcbmRvdC50b1JhZGlhbnMgPSBVdGlscy50b1JhZGlhbnM7XG5kb3QudG9EZWdyZWVzID0gVXRpbHMudG9EZWdyZWVzO1xuZG90LmxpbmVMaW5lSW50ZXJzZWN0aW9uID0gVXRpbHMubGluZUxpbmVJbnRlcnNlY3Rpb247XG5kb3QubGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gPSBVdGlscy5saW5lU2VnbWVudEludGVyc2VjdGlvbjtcbmRvdC5zcGhlcmVSYXlJbnRlcnNlY3Rpb24gPSBVdGlscy5zcGhlcmVSYXlJbnRlcnNlY3Rpb247XG5kb3Quc29sdmVRdWFkcmF0aWNSb290c1JlYWwgPSBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbDtcbmRvdC5zb2x2ZUN1YmljUm9vdHNSZWFsID0gVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbDtcbmRvdC5jdWJlUm9vdCA9IFV0aWxzLmN1YmVSb290O1xuZG90LmxpbmVhciA9IFV0aWxzLmxpbmVhcjtcbmRvdC5ib3hNdWxsZXJUcmFuc2Zvcm0gPSBVdGlscy5ib3hNdWxsZXJUcmFuc2Zvcm07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzOyJdLCJuYW1lcyI6WyJCaWciLCJkb3QiLCJWZWN0b3IyIiwiVmVjdG9yMyIsIkVQU0lMT04iLCJOdW1iZXIiLCJNSU5fVkFMVUUiLCJUV09fUEkiLCJNYXRoIiwiUEkiLCJnZW5lcmF0ZSIsInowIiwiejEiLCJVdGlscyIsImNsYW1wIiwidmFsdWUiLCJtaW4iLCJtYXgiLCJtb2R1bG9CZXR3ZWVuRG93biIsImFzc2VydCIsImRpdmlzb3IiLCJwYXJ0aWFsIiwibW9kdWxvQmV0d2VlblVwIiwicmFuZ2VJbmNsdXNpdmUiLCJhIiwiYiIsInJlc3VsdCIsIkFycmF5IiwiaSIsInJhbmdlRXhjbHVzaXZlIiwidG9SYWRpYW5zIiwiZGVncmVlcyIsInRvRGVncmVlcyIsInJhZGlhbnMiLCJtb2QiLCJnY2QiLCJhYnMiLCJsY20iLCJyb3VuZFN5bW1ldHJpYyIsImxpbmVMaW5lSW50ZXJzZWN0aW9uIiwicDEiLCJwMiIsInAzIiwicDQiLCJlcHNpbG9uIiwiZXF1YWxzRXBzaWxvbiIsIngxMiIsIngiLCJ4MzQiLCJ5MTIiLCJ5IiwieTM0IiwiZGVub20iLCJjaXJjbGVDZW50ZXJGcm9tUG9pbnRzIiwicDEyIiwicDIzIiwicDEyeCIsInAyM3giLCJwb2ludEluQ2lyY2xlRnJvbVBvaW50cyIsInAiLCJ0cmlhbmdsZUFyZWFTaWduZWQiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJtMjAiLCJtMjEiLCJtMjIiLCJkZXRlcm1pbmFudCIsInNwaGVyZVJheUludGVyc2VjdGlvbiIsInJhZGl1cyIsInJheSIsInVuZGVmaW5lZCIsImNlbnRlciIsInJheURpciIsImRpcmVjdGlvbiIsInBvcyIsInBvc2l0aW9uIiwiY2VudGVyVG9SYXkiLCJtaW51cyIsInRtcCIsImNlbnRlclRvUmF5RGlzdFNxIiwibWFnbml0dWRlU3F1YXJlZCIsImRldCIsImJhc2UiLCJzcXQiLCJzcXJ0IiwidGEiLCJ0YiIsImhpdFBvc2l0aW9uQiIsInBvaW50QXREaXN0YW5jZSIsIm5vcm1hbEIiLCJub3JtYWxpemVkIiwiZGlzdGFuY2UiLCJoaXRQb2ludCIsIm5vcm1hbCIsIm5lZ2F0ZWQiLCJmcm9tT3V0c2lkZSIsImhpdFBvc2l0aW9uQSIsIm5vcm1hbEEiLCJzb2x2ZUxpbmVhclJvb3RzUmVhbCIsInNvbHZlUXVhZHJhdGljUm9vdHNSZWFsIiwiYyIsImRpc2NyaW1pbmFudCIsInNvbHZlQ3ViaWNSb290c1JlYWwiLCJkIiwiZGlzY3JpbWluYW50VGhyZXNob2xkIiwicm9vdHMiLCJjb25jYXQiLCJxIiwiciIsImIzIiwiZHNxcnQiLCJjdWJlUm9vdCIsInJzcXJ0IiwiZG91YmxlUm9vdCIsInFYIiwiYWNvcyIsInJyIiwiY29zIiwiZm9yRWFjaCIsInJvb3QiLCJpc0Zpbml0ZSIsInBvdyIsImxpbmVhciIsImExIiwiYTIiLCJiMSIsImIyIiwiYTMiLCJyb3VuZCIsInRvRml4ZWQiLCJkZWNpbWFsUGxhY2VzIiwiaXNJbnRlZ2VyIiwiaXNOYU4iLCJQT1NJVElWRV9JTkZJTklUWSIsIk5FR0FUSVZFX0lORklOSVRZIiwic3RhcnRzV2l0aCIsInBhcnNlRmxvYXQiLCJzbGljZSIsInRvRml4ZWROdW1iZXIiLCJsaW5lU2VnbWVudEludGVyc2VjdGlvbiIsIngxIiwieTEiLCJ4MiIsInkyIiwieDMiLCJ5MyIsIng0IiwieTQiLCJjY3ciLCJlIiwiZiIsImludGVyc2VjdGlvblgiLCJpbnRlcnNlY3Rpb25ZIiwiZGlzdFRvU2VnbWVudFNxdWFyZWQiLCJwb2ludCIsInNlZ21lbnRTcXVhcmVkTGVuZ3RoIiwiZGlzdGFuY2VTcXVhcmVkIiwidCIsImRpc3RUb1NlZ21lbnQiLCJhcmVQb2ludHNDb2xsaW5lYXIiLCJ0cmlhbmdsZUFyZWEiLCJjZW50cm9pZE9mUG9seWdvbiIsInZlcnRpY2VzIiwiY2VudHJvaWQiLCJhcmVhIiwidjAiLCJ2MSIsImxlbmd0aCIsImRvdWJsZVNob2VsYWNlIiwiYWRkWFkiLCJkaXZpZGVTY2FsYXIiLCJjb3NoIiwiZXhwIiwic2luaCIsImxvZzEwIiwidmFsIiwibG9nIiwiTE4xMCIsImJveE11bGxlclRyYW5zZm9ybSIsIm11Iiwic2lnbWEiLCJyYW5kb20iLCJ1MSIsInUyIiwibmV4dERvdWJsZSIsInNpbiIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsImZsb29yIiwic3RyaW5nIiwidG9TdHJpbmciLCJpbmNsdWRlcyIsInNwbGl0IiwibWFudGlzc2EiLCJleHBvbmVudCIsIm1hbnRpc3NhRGVjaW1hbFBsYWNlcyIsInJvdW5kVG9JbnRlcnZhbCIsImludGVydmFsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsU0FBUyxnQ0FBZ0MsQ0FBQyx5REFBeUQ7QUFDMUcsT0FBT0MsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLGFBQWEsZUFBZTtBQUNuQyxPQUFPQyxhQUFhLGVBQWU7QUFFbkMsWUFBWTtBQUNaLE1BQU1DLFVBQVVDLE9BQU9DLFNBQVM7QUFDaEMsTUFBTUMsU0FBUyxJQUFJQyxLQUFLQyxFQUFFO0FBRTFCLGdEQUFnRDtBQUNoRCxJQUFJQztBQUNKLElBQUlDO0FBQ0osSUFBSUM7QUFFSixNQUFNQyxRQUFRO0lBQ1o7Ozs7Ozs7OztHQVNDLEdBQ0RDLE9BQU9DLEtBQUssRUFBRUMsR0FBRyxFQUFFQyxHQUFHO1FBQ3BCLElBQUtGLFFBQVFDLEtBQU07WUFDakIsT0FBT0E7UUFDVCxPQUNLLElBQUtELFFBQVFFLEtBQU07WUFDdEIsT0FBT0E7UUFDVCxPQUNLO1lBQ0gsT0FBT0Y7UUFDVDtJQUNGO0lB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