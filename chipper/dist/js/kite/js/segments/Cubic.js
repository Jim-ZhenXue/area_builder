// Copyright 2013-2024, University of Colorado Boulder
/**
 * Cubic Bezier segment.
 *
 * See http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf for info
 *
 * Good reference: http://cagd.cs.byu.edu/~557/text/ch2.pdf
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { BoundsIntersection, kite, Line, Overlap, Quadratic, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';
const solveQuadraticRootsReal = Utils.solveQuadraticRootsReal; // function that returns an array of number
const solveCubicRootsReal = Utils.solveCubicRootsReal; // function that returns an array of number
const arePointsCollinear = Utils.arePointsCollinear; // function that returns a boolean
// convenience variables use to reduce the number of vector allocations
const scratchVector1 = new Vector2(0, 0);
const scratchVector2 = new Vector2(0, 0);
const scratchVector3 = new Vector2(0, 0);
// Used in multiple filters
function isBetween0And1(t) {
    return t >= 0 && t <= 1;
}
let Cubic = class Cubic extends Segment {
    /**
   * Sets the start point of the Cubic.
   */ setStart(start) {
        assert && assert(start.isFinite(), `Cubic start should be finite: ${start.toString()}`);
        if (!this._start.equals(start)) {
            this._start = start;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set start(value) {
        this.setStart(value);
    }
    get start() {
        return this.getStart();
    }
    /**
   * Returns the start of this Cubic.
   */ getStart() {
        return this._start;
    }
    /**
   * Sets the first control point of the Cubic.
   */ setControl1(control1) {
        assert && assert(control1.isFinite(), `Cubic control1 should be finite: ${control1.toString()}`);
        if (!this._control1.equals(control1)) {
            this._control1 = control1;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set control1(value) {
        this.setControl1(value);
    }
    get control1() {
        return this.getControl1();
    }
    /**
   * Returns the first control point of this Cubic.
   */ getControl1() {
        return this._control1;
    }
    /**
   * Sets the second control point of the Cubic.
   */ setControl2(control2) {
        assert && assert(control2.isFinite(), `Cubic control2 should be finite: ${control2.toString()}`);
        if (!this._control2.equals(control2)) {
            this._control2 = control2;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set control2(value) {
        this.setControl2(value);
    }
    get control2() {
        return this.getControl2();
    }
    /**
   * Returns the second control point of this Cubic.
   */ getControl2() {
        return this._control2;
    }
    /**
   * Sets the end point of the Cubic.
   */ setEnd(end) {
        assert && assert(end.isFinite(), `Cubic end should be finite: ${end.toString()}`);
        if (!this._end.equals(end)) {
            this._end = end;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set end(value) {
        this.setEnd(value);
    }
    get end() {
        return this.getEnd();
    }
    /**
   * Returns the end of this Cubic.
   */ getEnd() {
        return this._end;
    }
    /**
   * Returns the position parametrically, with 0 <= t <= 1.
   *
   * NOTE: positionAt( 0 ) will return the start of the segment, and positionAt( 1 ) will return the end of the
   * segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */ positionAt(t) {
        assert && assert(t >= 0, 'positionAt t should be non-negative');
        assert && assert(t <= 1, 'positionAt t should be no greater than 1');
        // Equivalent position: (1 - t)^3*start + 3*(1 - t)^2*t*control1 + 3*(1 - t) t^2*control2 + t^3*end
        const mt = 1 - t;
        const mmm = mt * mt * mt;
        const mmt = 3 * mt * mt * t;
        const mtt = 3 * mt * t * t;
        const ttt = t * t * t;
        return new Vector2(this._start.x * mmm + this._control1.x * mmt + this._control2.x * mtt + this._end.x * ttt, this._start.y * mmm + this._control1.y * mmt + this._control2.y * mtt + this._end.y * ttt);
    }
    /**
   * Returns the non-normalized tangent (dx/dt, dy/dt) of this segment at the parametric value of t, with 0 <= t <= 1.
   *
   * NOTE: tangentAt( 0 ) will return the tangent at the start of the segment, and tangentAt( 1 ) will return the
   * tangent at the end of the segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */ tangentAt(t) {
        assert && assert(t >= 0, 'tangentAt t should be non-negative');
        assert && assert(t <= 1, 'tangentAt t should be no greater than 1');
        // derivative: -3 p0 (1 - t)^2 + 3 p1 (1 - t)^2 - 6 p1 (1 - t) t + 6 p2 (1 - t) t - 3 p2 t^2 + 3 p3 t^2
        const mt = 1 - t;
        const result = new Vector2(0, 0);
        return result.set(this._start).multiplyScalar(-3 * mt * mt).add(scratchVector1.set(this._control1).multiplyScalar(3 * mt * mt - 6 * mt * t)).add(scratchVector1.set(this._control2).multiplyScalar(6 * mt * t - 3 * t * t)).add(scratchVector1.set(this._end).multiplyScalar(3 * t * t));
    }
    /**
   * Returns the signed curvature of the segment at the parametric value t, where 0 <= t <= 1.
   *
   * The curvature will be positive for visual clockwise / mathematical counterclockwise curves, negative for opposite
   * curvature, and 0 for no curvature.
   *
   * NOTE: curvatureAt( 0 ) will return the curvature at the start of the segment, and curvatureAt( 1 ) will return
   * the curvature at the end of the segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */ curvatureAt(t) {
        assert && assert(t >= 0, 'curvatureAt t should be non-negative');
        assert && assert(t <= 1, 'curvatureAt t should be no greater than 1');
        // see http://cagd.cs.byu.edu/~557/text/ch2.pdf p31
        // TODO: remove code duplication with Quadratic https://github.com/phetsims/kite/issues/76
        const epsilon = 0.0000001;
        if (Math.abs(t - 0.5) > 0.5 - epsilon) {
            const isZero = t < 0.5;
            const p0 = isZero ? this._start : this._end;
            const p1 = isZero ? this._control1 : this._control2;
            const p2 = isZero ? this._control2 : this._control1;
            const d10 = p1.minus(p0);
            const a = d10.magnitude;
            const h = (isZero ? -1 : 1) * d10.perpendicular.normalized().dot(p2.minus(p1));
            return h * (this.degree - 1) / (this.degree * a * a);
        } else {
            return this.subdivided(t)[0].curvatureAt(1);
        }
    }
    /**
   * Returns an array with up to 2 sub-segments, split at the parametric t value. Together (in order) they should make
   * up the same shape as the current segment.
   *
   * This method is part of the Segment API. See Segment.js's constructor for more API documentation.
   */ subdivided(t) {
        assert && assert(t >= 0, 'subdivided t should be non-negative');
        assert && assert(t <= 1, 'subdivided t should be no greater than 1');
        // If t is 0 or 1, we only need to return 1 segment
        if (t === 0 || t === 1) {
            return [
                this
            ];
        }
        // de Casteljau method
        // TODO: add a 'bisect' or 'between' method for vectors? https://github.com/phetsims/kite/issues/76
        const left = this._start.blend(this._control1, t);
        const right = this._control2.blend(this._end, t);
        const middle = this._control1.blend(this._control2, t);
        const leftMid = left.blend(middle, t);
        const rightMid = middle.blend(right, t);
        const mid = leftMid.blend(rightMid, t);
        return [
            new Cubic(this._start, left, leftMid, mid),
            new Cubic(mid, rightMid, right, this._end)
        ];
    }
    /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */ invalidate() {
        assert && assert(this._start instanceof Vector2, `Cubic start should be a Vector2: ${this._start}`);
        assert && assert(this._start.isFinite(), `Cubic start should be finite: ${this._start.toString()}`);
        assert && assert(this._control1 instanceof Vector2, `Cubic control1 should be a Vector2: ${this._control1}`);
        assert && assert(this._control1.isFinite(), `Cubic control1 should be finite: ${this._control1.toString()}`);
        assert && assert(this._control2 instanceof Vector2, `Cubic control2 should be a Vector2: ${this._control2}`);
        assert && assert(this._control2.isFinite(), `Cubic control2 should be finite: ${this._control2.toString()}`);
        assert && assert(this._end instanceof Vector2, `Cubic end should be a Vector2: ${this._end}`);
        assert && assert(this._end.isFinite(), `Cubic end should be finite: ${this._end.toString()}`);
        // Lazily-computed derived information
        this._startTangent = null;
        this._endTangent = null;
        this._r = null;
        this._s = null;
        // Cusp-specific information
        this._tCusp = null;
        this._tDeterminant = null;
        this._tInflection1 = null;
        this._tInflection2 = null;
        this._quadratics = null;
        // T-values where X and Y (respectively) reach an extrema (not necessarily including 0 and 1)
        this._xExtremaT = null;
        this._yExtremaT = null;
        this._bounds = null;
        this._svgPathFragment = null;
        this.invalidationEmitter.emit();
    }
    /**
   * Gets the start position of this cubic polynomial.
   */ getStartTangent() {
        if (this._startTangent === null) {
            this._startTangent = this.tangentAt(0).normalized();
        }
        return this._startTangent;
    }
    get startTangent() {
        return this.getStartTangent();
    }
    /**
   * Gets the end position of this cubic polynomial.
   */ getEndTangent() {
        if (this._endTangent === null) {
            this._endTangent = this.tangentAt(1).normalized();
        }
        return this._endTangent;
    }
    get endTangent() {
        return this.getEndTangent();
    }
    /**
   * TODO: documentation https://github.com/phetsims/kite/issues/76
   */ getR() {
        // from http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf
        if (this._r === null) {
            this._r = this._control1.minus(this._start).normalized();
        }
        return this._r;
    }
    get r() {
        return this.getR();
    }
    /**
   * TODO: documentation https://github.com/phetsims/kite/issues/76
   */ getS() {
        // from http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf
        if (this._s === null) {
            this._s = this.getR().perpendicular;
        }
        return this._s;
    }
    get s() {
        return this.getS();
    }
    /**
   * Returns the parametric t value for the possible cusp location. A cusp may or may not exist at that point.
   */ getTCusp() {
        if (this._tCusp === null) {
            this.computeCuspInfo();
        }
        assert && assert(this._tCusp !== null);
        return this._tCusp;
    }
    get tCusp() {
        return this.getTCusp();
    }
    /**
   * Returns the determinant value for the cusp, which indicates the presence (or lack of presence) of a cusp.
   */ getTDeterminant() {
        if (this._tDeterminant === null) {
            this.computeCuspInfo();
        }
        assert && assert(this._tDeterminant !== null);
        return this._tDeterminant;
    }
    get tDeterminant() {
        return this.getTDeterminant();
    }
    /**
   * Returns the parametric t value for the potential location of the first possible inflection point.
   */ getTInflection1() {
        if (this._tInflection1 === null) {
            this.computeCuspInfo();
        }
        assert && assert(this._tInflection1 !== null);
        return this._tInflection1;
    }
    get tInflection1() {
        return this.getTInflection1();
    }
    /**
   * Returns the parametric t value for the potential location of the second possible inflection point.
   */ getTInflection2() {
        if (this._tInflection2 === null) {
            this.computeCuspInfo();
        }
        assert && assert(this._tInflection2 !== null);
        return this._tInflection2;
    }
    get tInflection2() {
        return this.getTInflection2();
    }
    /**
   * If there is a cusp, this cubic will consist of one or two quadratic segments, typically "start => cusp" and
   * "cusp => end".
   */ getQuadratics() {
        if (this._quadratics === null) {
            this.computeCuspSegments();
        }
        assert && assert(this._quadratics !== null);
        return this._quadratics;
    }
    /**
   * Returns a list of parametric t values where x-extrema exist, i.e. where dx/dt==0. These are candidate locations
   * on the cubic for "maximum X" and "minimum X", and are needed for bounds computations.
   */ getXExtremaT() {
        if (this._xExtremaT === null) {
            this._xExtremaT = Cubic.extremaT(this._start.x, this._control1.x, this._control2.x, this._end.x);
        }
        return this._xExtremaT;
    }
    get xExtremaT() {
        return this.getXExtremaT();
    }
    /**
   * Returns a list of parametric t values where y-extrema exist, i.e. where dy/dt==0. These are candidate locations
   * on the cubic for "maximum Y" and "minimum Y", and are needed for bounds computations.
   */ getYExtremaT() {
        if (this._yExtremaT === null) {
            this._yExtremaT = Cubic.extremaT(this._start.y, this._control1.y, this._control2.y, this._end.y);
        }
        return this._yExtremaT;
    }
    get yExtremaT() {
        return this.getYExtremaT();
    }
    /**
   * Returns the bounds of this segment.
   */ getBounds() {
        if (this._bounds === null) {
            this._bounds = Bounds2.NOTHING;
            this._bounds = this._bounds.withPoint(this._start);
            this._bounds = this._bounds.withPoint(this._end);
            _.each(this.getXExtremaT(), (t)=>{
                if (t >= 0 && t <= 1) {
                    this._bounds = this._bounds.withPoint(this.positionAt(t));
                }
            });
            _.each(this.getYExtremaT(), (t)=>{
                if (t >= 0 && t <= 1) {
                    this._bounds = this._bounds.withPoint(this.positionAt(t));
                }
            });
            if (this.hasCusp()) {
                this._bounds = this._bounds.withPoint(this.positionAt(this.getTCusp()));
            }
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Computes all cusp-related information, including whether there is a cusp, any inflection points, etc.
   */ computeCuspInfo() {
        // from http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        const a = this._start.times(-1).plus(this._control1.times(3)).plus(this._control2.times(-3)).plus(this._end);
        const b = this._start.times(3).plus(this._control1.times(-6)).plus(this._control2.times(3));
        const c = this._start.times(-3).plus(this._control1.times(3));
        const aPerp = a.perpendicular; // {Vector2}
        const bPerp = b.perpendicular; // {Vector2}
        const aPerpDotB = aPerp.dot(b); // {number}
        this._tCusp = -0.5 * (aPerp.dot(c) / aPerpDotB); // {number}
        this._tDeterminant = this._tCusp * this._tCusp - 1 / 3 * (bPerp.dot(c) / aPerpDotB); // {number}
        if (this._tDeterminant >= 0) {
            const sqrtDet = Math.sqrt(this._tDeterminant);
            this._tInflection1 = this._tCusp - sqrtDet;
            this._tInflection2 = this._tCusp + sqrtDet;
        } else {
            // there are no real roots to the quadratic polynomial.
            this._tInflection1 = NaN;
            this._tInflection2 = NaN;
        }
    }
    /**
   * If there is a cusp, this computes the 2 quadratic Bezier curves that this Cubic can be converted into.
   */ computeCuspSegments() {
        if (this.hasCusp()) {
            // if there is a cusp, we'll split at the cusp into two quadratic bezier curves.
            // see http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.94.8088&rep=rep1&type=pdf (Singularities of rational Bezier curves - J Monterde, 2001)
            this._quadratics = [];
            const tCusp = this.getTCusp();
            if (tCusp === 0) {
                this._quadratics.push(new Quadratic(this.start, this.control2, this.end));
            } else if (tCusp === 1) {
                this._quadratics.push(new Quadratic(this.start, this.control1, this.end));
            } else {
                const subdividedAtCusp = this.subdivided(tCusp);
                this._quadratics.push(new Quadratic(subdividedAtCusp[0].start, subdividedAtCusp[0].control1, subdividedAtCusp[0].end));
                this._quadratics.push(new Quadratic(subdividedAtCusp[1].start, subdividedAtCusp[1].control2, subdividedAtCusp[1].end));
            }
        } else {
            this._quadratics = null;
        }
    }
    /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */ getNondegenerateSegments() {
        const start = this._start;
        const control1 = this._control1;
        const control2 = this._control2;
        const end = this._end;
        const reduced = this.degreeReduced(1e-9);
        if (start.equals(end) && start.equals(control1) && start.equals(control2)) {
            // degenerate point
            return [];
        } else if (this.hasCusp()) {
            return _.flatten(this.getQuadratics().map((quadratic)=>quadratic.getNondegenerateSegments()));
        } else if (reduced) {
            // if we can reduce to a quadratic Bezier, always do this (and make sure it is non-degenerate)
            return reduced.getNondegenerateSegments();
        } else if (arePointsCollinear(start, control1, end) && arePointsCollinear(start, control2, end) && !start.equalsEpsilon(end, 1e-7)) {
            const extremaPoints = this.getXExtremaT().concat(this.getYExtremaT()).sort().map((t)=>this.positionAt(t));
            const segments = [];
            let lastPoint = start;
            if (extremaPoints.length) {
                segments.push(new Line(start, extremaPoints[0]));
                lastPoint = extremaPoints[0];
            }
            for(let i = 1; i < extremaPoints.length; i++){
                segments.push(new Line(extremaPoints[i - 1], extremaPoints[i]));
                lastPoint = extremaPoints[i];
            }
            segments.push(new Line(lastPoint, end));
            return _.flatten(segments.map((segment)=>segment.getNondegenerateSegments()));
        } else {
            return [
                this
            ];
        }
    }
    /**
   * Returns whether this cubic has a cusp.
   */ hasCusp() {
        const tCusp = this.getTCusp();
        const epsilon = 1e-7; // TODO: make this available to change? https://github.com/phetsims/kite/issues/76
        return tCusp >= 0 && tCusp <= 1 && this.tangentAt(tCusp).magnitude < epsilon;
    }
    toRS(point) {
        const firstVector = point.minus(this._start);
        return new Vector2(firstVector.dot(this.getR()), firstVector.dot(this.getS()));
    }
    offsetTo(r, reverse) {
        // TODO: implement more accurate method at http://www.antigrain.com/research/adaptive_bezier/index.html https://github.com/phetsims/kite/issues/76
        // TODO: or more recently (and relevantly): http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf https://github.com/phetsims/kite/issues/76
        // how many segments to create (possibly make this more adaptive?)
        const quantity = 32;
        const points = [];
        const result = [];
        for(let i = 0; i < quantity; i++){
            let t = i / (quantity - 1);
            if (reverse) {
                t = 1 - t;
            }
            points.push(this.positionAt(t).plus(this.tangentAt(t).perpendicular.normalized().times(r)));
            if (i > 0) {
                result.push(new Line(points[i - 1], points[i]));
            }
        }
        return result;
    }
    /**
   * Returns a string containing the SVG path. assumes that the start point is already provided, so anything that calls this needs to put
   * the M calls first
   */ getSVGPathFragment() {
        let oldPathFragment;
        if (assert) {
            oldPathFragment = this._svgPathFragment;
            this._svgPathFragment = null;
        }
        if (!this._svgPathFragment) {
            this._svgPathFragment = `C ${svgNumber(this._control1.x)} ${svgNumber(this._control1.y)} ${svgNumber(this._control2.x)} ${svgNumber(this._control2.y)} ${svgNumber(this._end.x)} ${svgNumber(this._end.y)}`;
        }
        if (assert) {
            if (oldPathFragment) {
                assert(oldPathFragment === this._svgPathFragment, 'Quadratic line segment changed without invalidate()');
            }
        }
        return this._svgPathFragment;
    }
    /**
   * Returns an array of lines that will draw an offset curve on the logical left side
   */ strokeLeft(lineWidth) {
        return this.offsetTo(-lineWidth / 2, false);
    }
    /**
   * Returns an array of lines that will draw an offset curve on the logical right side
   */ strokeRight(lineWidth) {
        return this.offsetTo(lineWidth / 2, true);
    }
    /**
   * Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * The list does not include t=0 and t=1
   */ getInteriorExtremaTs() {
        const ts = this.getXExtremaT().concat(this.getYExtremaT());
        const result = [];
        _.each(ts, (t)=>{
            const epsilon = 0.0000000001; // TODO: general kite epsilon? https://github.com/phetsims/kite/issues/76
            if (t > epsilon && t < 1 - epsilon) {
                // don't add duplicate t values
                if (_.every(result, (otherT)=>Math.abs(t - otherT) > epsilon)) {
                    result.push(t);
                }
            }
        });
        return result.sort();
    }
    /**
   * Hit-tests this segment with the ray. An array of all intersections of the ray with this segment will be returned.
   * For details, see the documentation in Segment.js
   */ intersection(ray) {
        const result = [];
        // find the rotation that will put our ray in the direction of the x-axis so we can only solve for y=0 for intersections
        const inverseMatrix = Matrix3.rotation2(-ray.direction.angle).timesMatrix(Matrix3.translation(-ray.position.x, -ray.position.y));
        const p0 = inverseMatrix.timesVector2(this._start);
        const p1 = inverseMatrix.timesVector2(this._control1);
        const p2 = inverseMatrix.timesVector2(this._control2);
        const p3 = inverseMatrix.timesVector2(this._end);
        // polynomial form of cubic: start + (3 control1 - 3 start) t + (-6 control1 + 3 control2 + 3 start) t^2 + (3 control1 - 3 control2 + end - start) t^3
        const a = -p0.y + 3 * p1.y - 3 * p2.y + p3.y;
        const b = 3 * p0.y - 6 * p1.y + 3 * p2.y;
        const c = -3 * p0.y + 3 * p1.y;
        const d = p0.y;
        const ts = solveCubicRootsReal(a, b, c, d);
        _.each(ts, (t)=>{
            if (t >= 0 && t <= 1) {
                const hitPoint = this.positionAt(t);
                const unitTangent = this.tangentAt(t).normalized();
                const perp = unitTangent.perpendicular;
                const toHit = hitPoint.minus(ray.position);
                // make sure it's not behind the ray
                if (toHit.dot(ray.direction) > 0) {
                    const normal = perp.dot(ray.direction) > 0 ? perp.negated() : perp;
                    const wind = ray.direction.perpendicular.dot(unitTangent) < 0 ? 1 : -1;
                    result.push(new RayIntersection(toHit.magnitude, hitPoint, normal, wind, t));
                }
            }
        });
        return result;
    }
    /**
   * Returns the winding number for intersection with a ray
   */ windingIntersection(ray) {
        let wind = 0;
        const hits = this.intersection(ray);
        _.each(hits, (hit)=>{
            wind += hit.wind;
        });
        return wind;
    }
    /**
   * Draws the segment to the 2D Canvas context, assuming the context's current location is already at the start point
   */ writeToContext(context) {
        context.bezierCurveTo(this._control1.x, this._control1.y, this._control2.x, this._control2.y, this._end.x, this._end.y);
    }
    /**
   * Returns a new cubic that represents this cubic after transformation by the matrix
   */ transformed(matrix) {
        return new Cubic(matrix.timesVector2(this._start), matrix.timesVector2(this._control1), matrix.timesVector2(this._control2), matrix.timesVector2(this._end));
    }
    /**
   * Returns a degree-reduced quadratic Bezier if possible, otherwise it returns null
   */ degreeReduced(epsilon) {
        epsilon = epsilon || 0; // if not provided, use an exact version
        const controlA = scratchVector1.set(this._control1).multiplyScalar(3).subtract(this._start).divideScalar(2);
        const controlB = scratchVector2.set(this._control2).multiplyScalar(3).subtract(this._end).divideScalar(2);
        const difference = scratchVector3.set(controlA).subtract(controlB);
        if (difference.magnitude <= epsilon) {
            return new Quadratic(this._start, controlA.average(controlB), this._end);
        } else {
            // the two options for control points are too far away, this curve isn't easily reducible.
            return null;
        }
    }
    /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */ getSignedAreaFragment() {
        return 1 / 20 * (this._start.x * (6 * this._control1.y + 3 * this._control2.y + this._end.y) + this._control1.x * (-6 * this._start.y + 3 * this._control2.y + 3 * this._end.y) + this._control2.x * (-3 * this._start.y - 3 * this._control1.y + 6 * this._end.y) + this._end.x * (-this._start.y - 3 * this._control1.y - 6 * this._control2.y));
    }
    /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */ reversed() {
        return new Cubic(this._end, this._control2, this._control1, this._start);
    }
    /**
   * If it exists, returns the point where the cubic curve self-intersects.
   *
   * @returns - Null if there is no intersection
   */ getSelfIntersection() {
        // We split the cubic into monotone sections (which can't self-intersect), then check these for intersections
        const tExtremes = this.getInteriorExtremaTs();
        const fullExtremes = [
            0
        ].concat(tExtremes).concat([
            1
        ]);
        const segments = this.subdivisions(tExtremes);
        if (segments.length < 3) {
            return null;
        }
        for(let i = 0; i < segments.length; i++){
            const aSegment = segments[i];
            for(let j = i + 1; j < segments.length; j++){
                const bSegment = segments[j];
                const intersections = BoundsIntersection.intersect(aSegment, bSegment);
                assert && assert(intersections.length < 2);
                if (intersections.length) {
                    const intersection = intersections[0];
                    // Exclude endpoints overlapping
                    if (intersection.aT > 1e-7 && intersection.aT < 1 - 1e-7 && intersection.bT > 1e-7 && intersection.bT < 1 - 1e-7) {
                        // Remap parametric values from the subdivided segments to the main segment
                        const aT = fullExtremes[i] + intersection.aT * (fullExtremes[i + 1] - fullExtremes[i]);
                        const bT = fullExtremes[j] + intersection.bT * (fullExtremes[j + 1] - fullExtremes[j]);
                        return new SegmentIntersection(intersection.point, aT, bT);
                    }
                }
            }
        }
        return null;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'Cubic',
            startX: this._start.x,
            startY: this._start.y,
            control1X: this._control1.x,
            control1Y: this._control1.y,
            control2X: this._control2.x,
            control2Y: this._control2.y,
            endX: this._end.x,
            endY: this._end.y
        };
    }
    /**
   * Determine whether two lines overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * @param segment
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                             in one component.
   * @returns - The solution, if there is one (and only one)
   */ getOverlaps(segment, epsilon = 1e-6) {
        if (segment instanceof Cubic) {
            return Cubic.getOverlaps(this, segment);
        }
        return null;
    }
    /**
   * Returns a Cubic from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Cubic');
        return new Cubic(new Vector2(obj.startX, obj.startY), new Vector2(obj.control1X, obj.control1Y), new Vector2(obj.control2X, obj.control2Y), new Vector2(obj.endX, obj.endY));
    }
    /**
   * Finds what t values the cubic extrema are at (if any). This is just the 1-dimensional case, used for multiple purposes
   */ static extremaT(v0, v1, v2, v3) {
        if (v0 === v1 && v0 === v2 && v0 === v3) {
            return [];
        }
        // coefficients of derivative
        const a = -3 * v0 + 9 * v1 - 9 * v2 + 3 * v3;
        const b = 6 * v0 - 12 * v1 + 6 * v2;
        const c = -3 * v0 + 3 * v1;
        return _.filter(solveQuadraticRootsReal(a, b, c), isBetween0And1);
    }
    /**
   * Determine whether two Cubics overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * NOTE: for this particular function, we assume we're not degenerate. Things may work if we can be degree-reduced
   * to a quadratic, but generally that shouldn't be done.
   *
   * @param cubic1
   * @param cubic2
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                    in one component.
   * @returns - The solution, if there is one (and only one)
   */ static getOverlaps(cubic1, cubic2, epsilon = 1e-6) {
        /*
     * For a 1-dimensional cubic bezier, we have the formula:
     *
     *                            [  0  0  0  0 ]   [ p0 ]
     * p( t ) = [ 1 t t^2 t^3 ] * [ -3  3  0  0 ] * [ p1 ]
     *                            [  3 -6  3  0 ]   [ p2 ]
     *                            [ -1  3 -3  1 ]   [ p3 ]
     *
     * where p0,p1,p2,p3 are the control values (start,control1,control2,end). We want to see if a linear-mapped cubic:
     *
     *                                              [ 1 b b^2  b^3  ]   [  0  0  0  0 ]   [ q0 ]
     * p( t ) =? q( a * t + b ) = [ 1 t t^2 t^3 ] * [ 0 a 2ab 3ab^2 ] * [ -3  3  0  0 ] * [ q1 ]
     *                                              [ 0 0 a^2 3a^2b ]   [  3 -6  3  0 ]   [ q2 ]
     *                                              [ 0 0  0   a^3  ]   [ -1  3 -3  1 ]   [ q3 ]
     *
     * (is it equal to the second cubic if we can find a linear way to map its input t-value?)
     *
     * For simplicity and efficiency, we'll precompute the multiplication of the bezier matrix:
     * [ p0s ]    [  1   0   0   0 ]   [ p0 ]
     * [ p1s ] == [ -3   3   0   0 ] * [ p1 ]
     * [ p2s ]    [  3  -6   3   0 ]   [ p2 ]
     * [ p3s ]    [ -1   3  -3   1 ]   [ p3 ]
     *
     * Leaving our computation to solve for a,b such that:
     *
     * [ p0s ]    [ 1 b b^2  b^3  ]   [ q0s ]
     * [ p1s ] == [ 0 a 2ab 3ab^2 ] * [ q1s ]
     * [ p2s ]    [ 0 0 a^2 3a^2b ]   [ q2s ]
     * [ p3s ]    [ 0 0  0   a^3  ]   [ q3s ]
     *
     * The subproblem of computing possible a,b pairs will be left to Segment.polynomialGetOverlapCubic and its
     * reductions (if p3s/q3s are zero, they aren't fully cubic beziers and can be degree reduced, which is handled).
     *
     * Then, given an a,b pair, we need to ensure the above formula is satisfied (approximately, due to floating-point
     * arithmetic).
     */ const noOverlap = [];
        // Efficiently compute the multiplication of the bezier matrix:
        const p0x = cubic1._start.x;
        const p1x = -3 * cubic1._start.x + 3 * cubic1._control1.x;
        const p2x = 3 * cubic1._start.x - 6 * cubic1._control1.x + 3 * cubic1._control2.x;
        const p3x = -1 * cubic1._start.x + 3 * cubic1._control1.x - 3 * cubic1._control2.x + cubic1._end.x;
        const p0y = cubic1._start.y;
        const p1y = -3 * cubic1._start.y + 3 * cubic1._control1.y;
        const p2y = 3 * cubic1._start.y - 6 * cubic1._control1.y + 3 * cubic1._control2.y;
        const p3y = -1 * cubic1._start.y + 3 * cubic1._control1.y - 3 * cubic1._control2.y + cubic1._end.y;
        const q0x = cubic2._start.x;
        const q1x = -3 * cubic2._start.x + 3 * cubic2._control1.x;
        const q2x = 3 * cubic2._start.x - 6 * cubic2._control1.x + 3 * cubic2._control2.x;
        const q3x = -1 * cubic2._start.x + 3 * cubic2._control1.x - 3 * cubic2._control2.x + cubic2._end.x;
        const q0y = cubic2._start.y;
        const q1y = -3 * cubic2._start.y + 3 * cubic2._control1.y;
        const q2y = 3 * cubic2._start.y - 6 * cubic2._control1.y + 3 * cubic2._control2.y;
        const q3y = -1 * cubic2._start.y + 3 * cubic2._control1.y - 3 * cubic2._control2.y + cubic2._end.y;
        // Determine the candidate overlap (preferring the dimension with the largest variation)
        const xSpread = Math.abs(Math.max(cubic1._start.x, cubic1._control1.x, cubic1._control2.x, cubic1._end.x, cubic1._start.x, cubic1._control1.x, cubic1._control2.x, cubic1._end.x) - Math.min(cubic1._start.x, cubic1._control1.x, cubic1._control2.x, cubic1._end.x, cubic1._start.x, cubic1._control1.x, cubic1._control2.x, cubic1._end.x));
        const ySpread = Math.abs(Math.max(cubic1._start.y, cubic1._control1.y, cubic1._control2.y, cubic1._end.y, cubic1._start.y, cubic1._control1.y, cubic1._control2.y, cubic1._end.y) - Math.min(cubic1._start.y, cubic1._control1.y, cubic1._control2.y, cubic1._end.y, cubic1._start.y, cubic1._control1.y, cubic1._control2.y, cubic1._end.y));
        const xOverlap = Segment.polynomialGetOverlapCubic(p0x, p1x, p2x, p3x, q0x, q1x, q2x, q3x);
        const yOverlap = Segment.polynomialGetOverlapCubic(p0y, p1y, p2y, p3y, q0y, q1y, q2y, q3y);
        let overlap;
        if (xSpread > ySpread) {
            overlap = xOverlap === null || xOverlap === true ? yOverlap : xOverlap;
        } else {
            overlap = yOverlap === null || yOverlap === true ? xOverlap : yOverlap;
        }
        if (overlap === null || overlap === true) {
            return noOverlap; // No way to pin down an overlap
        }
        const a = overlap.a;
        const b = overlap.b;
        // Premultiply a few values
        const aa = a * a;
        const aaa = a * a * a;
        const bb = b * b;
        const bbb = b * b * b;
        const ab2 = 2 * a * b;
        const abb3 = 3 * a * bb;
        const aab3 = 3 * aa * b;
        // Compute cubic coefficients for the difference between p(t) and q(a*t+b)
        const d0x = q0x + b * q1x + bb * q2x + bbb * q3x - p0x;
        const d1x = a * q1x + ab2 * q2x + abb3 * q3x - p1x;
        const d2x = aa * q2x + aab3 * q3x - p2x;
        const d3x = aaa * q3x - p3x;
        const d0y = q0y + b * q1y + bb * q2y + bbb * q3y - p0y;
        const d1y = a * q1y + ab2 * q2y + abb3 * q3y - p1y;
        const d2y = aa * q2y + aab3 * q3y - p2y;
        const d3y = aaa * q3y - p3y;
        // Find the t values where extremes lie in the [0,1] range for each 1-dimensional cubic. We do this by
        // differentiating the cubic and finding the roots of the resulting quadratic.
        const xRoots = Utils.solveQuadraticRootsReal(3 * d3x, 2 * d2x, d1x);
        const yRoots = Utils.solveQuadraticRootsReal(3 * d3y, 2 * d2y, d1y);
        const xExtremeTs = _.uniq([
            0,
            1
        ].concat(xRoots !== null ? xRoots.filter(isBetween0And1) : []));
        const yExtremeTs = _.uniq([
            0,
            1
        ].concat(yRoots !== null ? yRoots.filter(isBetween0And1) : []));
        // Examine the single-coordinate distances between the "overlaps" at each extreme T value. If the distance is larger
        // than our epsilon, then the "overlap" would not be valid.
        for(let i = 0; i < xExtremeTs.length; i++){
            const t = xExtremeTs[i];
            if (Math.abs(((d3x * t + d2x) * t + d1x) * t + d0x) > epsilon) {
                return noOverlap;
            }
        }
        for(let i = 0; i < yExtremeTs.length; i++){
            const t = yExtremeTs[i];
            if (Math.abs(((d3y * t + d2y) * t + d1y) * t + d0y) > epsilon) {
                return noOverlap;
            }
        }
        const qt0 = b;
        const qt1 = a + b;
        // TODO: do we want an epsilon in here to be permissive? https://github.com/phetsims/kite/issues/76
        if (qt0 > 1 && qt1 > 1 || qt0 < 0 && qt1 < 0) {
            return noOverlap;
        }
        return [
            new Overlap(a, b)
        ];
    }
    /**
   * @param start - Start point of the cubic bezier
   * @param control1 - First control point (curve usually doesn't go through here)
   * @param control2 - Second control point (curve usually doesn't go through here)
   * @param end - End point of the cubic bezier
   */ constructor(start, control1, control2, end){
        super();
        this._start = start;
        this._control1 = control1;
        this._control2 = control2;
        this._end = end;
        this.invalidate();
    }
};
export { Cubic as default };
Cubic.prototype.degree = 3;
kite.register('Cubic', Cubic);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvQ3ViaWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ3ViaWMgQmV6aWVyIHNlZ21lbnQuXG4gKlxuICogU2VlIGh0dHA6Ly93d3cuY2lzLnVzb3V0aGFsLmVkdS9+aGFpbi9nZW5lcmFsL1B1YmxpY2F0aW9ucy9CZXppZXIvQmV6aWVyRmxhdHRlbmluZy5wZGYgZm9yIGluZm9cbiAqXG4gKiBHb29kIHJlZmVyZW5jZTogaHR0cDovL2NhZ2QuY3MuYnl1LmVkdS9+NTU3L3RleHQvY2gyLnBkZlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgUmF5MiBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmF5Mi5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IEJvdW5kc0ludGVyc2VjdGlvbiwga2l0ZSwgTGluZSwgT3ZlcmxhcCwgUXVhZHJhdGljLCBSYXlJbnRlcnNlY3Rpb24sIFNlZ21lbnQsIFNlZ21lbnRJbnRlcnNlY3Rpb24sIHN2Z051bWJlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBzb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCA9IFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsOyAvLyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gYXJyYXkgb2YgbnVtYmVyXG5jb25zdCBzb2x2ZUN1YmljUm9vdHNSZWFsID0gVXRpbHMuc29sdmVDdWJpY1Jvb3RzUmVhbDsgLy8gZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIG51bWJlclxuY29uc3QgYXJlUG9pbnRzQ29sbGluZWFyID0gVXRpbHMuYXJlUG9pbnRzQ29sbGluZWFyOyAvLyBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBib29sZWFuXG5cbi8vIGNvbnZlbmllbmNlIHZhcmlhYmxlcyB1c2UgdG8gcmVkdWNlIHRoZSBudW1iZXIgb2YgdmVjdG9yIGFsbG9jYXRpb25zXG5jb25zdCBzY3JhdGNoVmVjdG9yMSA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5jb25zdCBzY3JhdGNoVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5jb25zdCBzY3JhdGNoVmVjdG9yMyA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbi8vIFVzZWQgaW4gbXVsdGlwbGUgZmlsdGVyc1xuZnVuY3Rpb24gaXNCZXR3ZWVuMEFuZDEoIHQ6IG51bWJlciApOiBib29sZWFuIHtcbiAgcmV0dXJuIHQgPj0gMCAmJiB0IDw9IDE7XG59XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRDdWJpYyA9IHtcbiAgdHlwZTogJ0N1YmljJztcbiAgc3RhcnRYOiBudW1iZXI7XG4gIHN0YXJ0WTogbnVtYmVyO1xuICBjb250cm9sMVg6IG51bWJlcjtcbiAgY29udHJvbDFZOiBudW1iZXI7XG4gIGNvbnRyb2wyWDogbnVtYmVyO1xuICBjb250cm9sMlk6IG51bWJlcjtcbiAgZW5kWDogbnVtYmVyO1xuICBlbmRZOiBudW1iZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdWJpYyBleHRlbmRzIFNlZ21lbnQge1xuXG4gIHByaXZhdGUgX3N0YXJ0OiBWZWN0b3IyO1xuICBwcml2YXRlIF9jb250cm9sMTogVmVjdG9yMjtcbiAgcHJpdmF0ZSBfY29udHJvbDI6IFZlY3RvcjI7XG4gIHByaXZhdGUgX2VuZDogVmVjdG9yMjtcblxuICAvLyBMYXppbHktY29tcHV0ZWQgZGVyaXZlZCBpbmZvcm1hdGlvblxuICBwcml2YXRlIF9zdGFydFRhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfZW5kVGFuZ2VudCE6IFZlY3RvcjIgfCBudWxsO1xuICBwcml2YXRlIF9yITogVmVjdG9yMiB8IG51bGw7XG4gIHByaXZhdGUgX3MhOiBWZWN0b3IyIHwgbnVsbDtcblxuICAvLyBDdXNwLXNwZWNpZmljIGluZm9ybWF0aW9uXG4gIHByaXZhdGUgX3RDdXNwITogbnVtYmVyIHwgbnVsbDsgLy8gVCB2YWx1ZSBmb3IgYSBwb3RlbnRpYWwgY3VzcFxuICBwcml2YXRlIF90RGV0ZXJtaW5hbnQhOiBudW1iZXIgfCBudWxsO1xuICBwcml2YXRlIF90SW5mbGVjdGlvbjEhOiBudW1iZXIgfCBudWxsOyAvLyBOYU4gaWYgbm90IGFwcGxpY2FibGVcbiAgcHJpdmF0ZSBfdEluZmxlY3Rpb24yITogbnVtYmVyIHwgbnVsbDsgLy8gTmFOIGlmIG5vdCBhcHBsaWNhYmxlXG4gIHByaXZhdGUgX3F1YWRyYXRpY3MhOiBRdWFkcmF0aWNbXSB8IG51bGw7XG5cbiAgLy8gVC12YWx1ZXMgd2hlcmUgWCBhbmQgWSAocmVzcGVjdGl2ZWx5KSByZWFjaCBhbiBleHRyZW1hIChub3QgbmVjZXNzYXJpbHkgaW5jbHVkaW5nIDAgYW5kIDEpXG4gIHByaXZhdGUgX3hFeHRyZW1hVCE6IG51bWJlcltdIHwgbnVsbDtcbiAgcHJpdmF0ZSBfeUV4dHJlbWFUITogbnVtYmVyW10gfCBudWxsO1xuXG4gIHByaXZhdGUgX2JvdW5kcyE6IEJvdW5kczIgfCBudWxsO1xuICBwcml2YXRlIF9zdmdQYXRoRnJhZ21lbnQhOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gc3RhcnQgLSBTdGFydCBwb2ludCBvZiB0aGUgY3ViaWMgYmV6aWVyXG4gICAqIEBwYXJhbSBjb250cm9sMSAtIEZpcnN0IGNvbnRyb2wgcG9pbnQgKGN1cnZlIHVzdWFsbHkgZG9lc24ndCBnbyB0aHJvdWdoIGhlcmUpXG4gICAqIEBwYXJhbSBjb250cm9sMiAtIFNlY29uZCBjb250cm9sIHBvaW50IChjdXJ2ZSB1c3VhbGx5IGRvZXNuJ3QgZ28gdGhyb3VnaCBoZXJlKVxuICAgKiBAcGFyYW0gZW5kIC0gRW5kIHBvaW50IG9mIHRoZSBjdWJpYyBiZXppZXJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnQ6IFZlY3RvcjIsIGNvbnRyb2wxOiBWZWN0b3IyLCBjb250cm9sMjogVmVjdG9yMiwgZW5kOiBWZWN0b3IyICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9zdGFydCA9IHN0YXJ0O1xuICAgIHRoaXMuX2NvbnRyb2wxID0gY29udHJvbDE7XG4gICAgdGhpcy5fY29udHJvbDIgPSBjb250cm9sMjtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG5cbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFydCBwb2ludCBvZiB0aGUgQ3ViaWMuXG4gICAqL1xuICBwdWJsaWMgc2V0U3RhcnQoIHN0YXJ0OiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0LmlzRmluaXRlKCksIGBDdWJpYyBzdGFydCBzaG91bGQgYmUgZmluaXRlOiAke3N0YXJ0LnRvU3RyaW5nKCl9YCApO1xuXG4gICAgaWYgKCAhdGhpcy5fc3RhcnQuZXF1YWxzKCBzdGFydCApICkge1xuICAgICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3RhcnQoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldFN0YXJ0KCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzdGFydCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnQoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0YXJ0IG9mIHRoaXMgQ3ViaWMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RhcnQoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0O1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgZmlyc3QgY29udHJvbCBwb2ludCBvZiB0aGUgQ3ViaWMuXG4gICAqL1xuICBwdWJsaWMgc2V0Q29udHJvbDEoIGNvbnRyb2wxOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRyb2wxLmlzRmluaXRlKCksIGBDdWJpYyBjb250cm9sMSBzaG91bGQgYmUgZmluaXRlOiAke2NvbnRyb2wxLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgaWYgKCAhdGhpcy5fY29udHJvbDEuZXF1YWxzKCBjb250cm9sMSApICkge1xuICAgICAgdGhpcy5fY29udHJvbDEgPSBjb250cm9sMTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udHJvbDEoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldENvbnRyb2wxKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBjb250cm9sMSgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q29udHJvbDEoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IGNvbnRyb2wgcG9pbnQgb2YgdGhpcyBDdWJpYy5cbiAgICovXG4gIHB1YmxpYyBnZXRDb250cm9sMSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fY29udHJvbDE7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzZWNvbmQgY29udHJvbCBwb2ludCBvZiB0aGUgQ3ViaWMuXG4gICAqL1xuICBwdWJsaWMgc2V0Q29udHJvbDIoIGNvbnRyb2wyOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRyb2wyLmlzRmluaXRlKCksIGBDdWJpYyBjb250cm9sMiBzaG91bGQgYmUgZmluaXRlOiAke2NvbnRyb2wyLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgaWYgKCAhdGhpcy5fY29udHJvbDIuZXF1YWxzKCBjb250cm9sMiApICkge1xuICAgICAgdGhpcy5fY29udHJvbDIgPSBjb250cm9sMjtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udHJvbDIoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldENvbnRyb2wyKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBjb250cm9sMigpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q29udHJvbDIoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNlY29uZCBjb250cm9sIHBvaW50IG9mIHRoaXMgQ3ViaWMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29udHJvbDIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRyb2wyO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgZW5kIHBvaW50IG9mIHRoZSBDdWJpYy5cbiAgICovXG4gIHB1YmxpYyBzZXRFbmQoIGVuZDogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmQuaXNGaW5pdGUoKSwgYEN1YmljIGVuZCBzaG91bGQgYmUgZmluaXRlOiAke2VuZC50b1N0cmluZygpfWAgKTtcblxuICAgIGlmICggIXRoaXMuX2VuZC5lcXVhbHMoIGVuZCApICkge1xuICAgICAgdGhpcy5fZW5kID0gZW5kO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCBlbmQoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldEVuZCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmQoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVuZCBvZiB0aGlzIEN1YmljLlxuICAgKi9cbiAgcHVibGljIGdldEVuZCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gcGFyYW1ldHJpY2FsbHksIHdpdGggMCA8PSB0IDw9IDEuXG4gICAqXG4gICAqIE5PVEU6IHBvc2l0aW9uQXQoIDAgKSB3aWxsIHJldHVybiB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCBwb3NpdGlvbkF0KCAxICkgd2lsbCByZXR1cm4gdGhlIGVuZCBvZiB0aGVcbiAgICogc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgcG9zaXRpb25BdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ3Bvc2l0aW9uQXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3Bvc2l0aW9uQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XG5cbiAgICAvLyBFcXVpdmFsZW50IHBvc2l0aW9uOiAoMSAtIHQpXjMqc3RhcnQgKyAzKigxIC0gdCleMip0KmNvbnRyb2wxICsgMyooMSAtIHQpIHReMipjb250cm9sMiArIHReMyplbmRcbiAgICBjb25zdCBtdCA9IDEgLSB0O1xuICAgIGNvbnN0IG1tbSA9IG10ICogbXQgKiBtdDtcbiAgICBjb25zdCBtbXQgPSAzICogbXQgKiBtdCAqIHQ7XG4gICAgY29uc3QgbXR0ID0gMyAqIG10ICogdCAqIHQ7XG4gICAgY29uc3QgdHR0ID0gdCAqIHQgKiB0O1xuXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKFxuICAgICAgdGhpcy5fc3RhcnQueCAqIG1tbSArIHRoaXMuX2NvbnRyb2wxLnggKiBtbXQgKyB0aGlzLl9jb250cm9sMi54ICogbXR0ICsgdGhpcy5fZW5kLnggKiB0dHQsXG4gICAgICB0aGlzLl9zdGFydC55ICogbW1tICsgdGhpcy5fY29udHJvbDEueSAqIG1tdCArIHRoaXMuX2NvbnRyb2wyLnkgKiBtdHQgKyB0aGlzLl9lbmQueSAqIHR0dFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9uLW5vcm1hbGl6ZWQgdGFuZ2VudCAoZHgvZHQsIGR5L2R0KSBvZiB0aGlzIHNlZ21lbnQgYXQgdGhlIHBhcmFtZXRyaWMgdmFsdWUgb2YgdCwgd2l0aCAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogTk9URTogdGFuZ2VudEF0KCAwICkgd2lsbCByZXR1cm4gdGhlIHRhbmdlbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgdGFuZ2VudEF0KCAxICkgd2lsbCByZXR1cm4gdGhlXG4gICAqIHRhbmdlbnQgYXQgdGhlIGVuZCBvZiB0aGUgc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgdGFuZ2VudEF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICd0YW5nZW50QXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XG5cbiAgICAvLyBkZXJpdmF0aXZlOiAtMyBwMCAoMSAtIHQpXjIgKyAzIHAxICgxIC0gdCleMiAtIDYgcDEgKDEgLSB0KSB0ICsgNiBwMiAoMSAtIHQpIHQgLSAzIHAyIHReMiArIDMgcDMgdF4yXG4gICAgY29uc3QgbXQgPSAxIC0gdDtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuICAgIHJldHVybiByZXN1bHQuc2V0KCB0aGlzLl9zdGFydCApLm11bHRpcGx5U2NhbGFyKCAtMyAqIG10ICogbXQgKVxuICAgICAgLmFkZCggc2NyYXRjaFZlY3RvcjEuc2V0KCB0aGlzLl9jb250cm9sMSApLm11bHRpcGx5U2NhbGFyKCAzICogbXQgKiBtdCAtIDYgKiBtdCAqIHQgKSApXG4gICAgICAuYWRkKCBzY3JhdGNoVmVjdG9yMS5zZXQoIHRoaXMuX2NvbnRyb2wyICkubXVsdGlwbHlTY2FsYXIoIDYgKiBtdCAqIHQgLSAzICogdCAqIHQgKSApXG4gICAgICAuYWRkKCBzY3JhdGNoVmVjdG9yMS5zZXQoIHRoaXMuX2VuZCApLm11bHRpcGx5U2NhbGFyKCAzICogdCAqIHQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNpZ25lZCBjdXJ2YXR1cmUgb2YgdGhlIHNlZ21lbnQgYXQgdGhlIHBhcmFtZXRyaWMgdmFsdWUgdCwgd2hlcmUgMCA8PSB0IDw9IDEuXG4gICAqXG4gICAqIFRoZSBjdXJ2YXR1cmUgd2lsbCBiZSBwb3NpdGl2ZSBmb3IgdmlzdWFsIGNsb2Nrd2lzZSAvIG1hdGhlbWF0aWNhbCBjb3VudGVyY2xvY2t3aXNlIGN1cnZlcywgbmVnYXRpdmUgZm9yIG9wcG9zaXRlXG4gICAqIGN1cnZhdHVyZSwgYW5kIDAgZm9yIG5vIGN1cnZhdHVyZS5cbiAgICpcbiAgICogTk9URTogY3VydmF0dXJlQXQoIDAgKSB3aWxsIHJldHVybiB0aGUgY3VydmF0dXJlIGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIGN1cnZhdHVyZUF0KCAxICkgd2lsbCByZXR1cm5cbiAgICogdGhlIGN1cnZhdHVyZSBhdCB0aGUgZW5kIG9mIHRoZSBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBjdXJ2YXR1cmVBdCggdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ2N1cnZhdHVyZUF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgLy8gc2VlIGh0dHA6Ly9jYWdkLmNzLmJ5dS5lZHUvfjU1Ny90ZXh0L2NoMi5wZGYgcDMxXG4gICAgLy8gVE9ETzogcmVtb3ZlIGNvZGUgZHVwbGljYXRpb24gd2l0aCBRdWFkcmF0aWMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMTtcbiAgICBpZiAoIE1hdGguYWJzKCB0IC0gMC41ICkgPiAwLjUgLSBlcHNpbG9uICkge1xuICAgICAgY29uc3QgaXNaZXJvID0gdCA8IDAuNTtcbiAgICAgIGNvbnN0IHAwID0gaXNaZXJvID8gdGhpcy5fc3RhcnQgOiB0aGlzLl9lbmQ7XG4gICAgICBjb25zdCBwMSA9IGlzWmVybyA/IHRoaXMuX2NvbnRyb2wxIDogdGhpcy5fY29udHJvbDI7XG4gICAgICBjb25zdCBwMiA9IGlzWmVybyA/IHRoaXMuX2NvbnRyb2wyIDogdGhpcy5fY29udHJvbDE7XG4gICAgICBjb25zdCBkMTAgPSBwMS5taW51cyggcDAgKTtcbiAgICAgIGNvbnN0IGEgPSBkMTAubWFnbml0dWRlO1xuICAgICAgY29uc3QgaCA9ICggaXNaZXJvID8gLTEgOiAxICkgKiBkMTAucGVycGVuZGljdWxhci5ub3JtYWxpemVkKCkuZG90KCBwMi5taW51cyggcDEgKSApO1xuICAgICAgcmV0dXJuICggaCAqICggdGhpcy5kZWdyZWUgLSAxICkgKSAvICggdGhpcy5kZWdyZWUgKiBhICogYSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YmRpdmlkZWQoIHQgKVsgMCBdLmN1cnZhdHVyZUF0KCAxICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgd2l0aCB1cCB0byAyIHN1Yi1zZWdtZW50cywgc3BsaXQgYXQgdGhlIHBhcmFtZXRyaWMgdCB2YWx1ZS4gVG9nZXRoZXIgKGluIG9yZGVyKSB0aGV5IHNob3VsZCBtYWtlXG4gICAqIHVwIHRoZSBzYW1lIHNoYXBlIGFzIHRoZSBjdXJyZW50IHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN1YmRpdmlkZWQoIHQ6IG51bWJlciApOiBDdWJpY1tdIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgLy8gSWYgdCBpcyAwIG9yIDEsIHdlIG9ubHkgbmVlZCB0byByZXR1cm4gMSBzZWdtZW50XG4gICAgaWYgKCB0ID09PSAwIHx8IHQgPT09IDEgKSB7XG4gICAgICByZXR1cm4gWyB0aGlzIF07XG4gICAgfVxuXG4gICAgLy8gZGUgQ2FzdGVsamF1IG1ldGhvZFxuICAgIC8vIFRPRE86IGFkZCBhICdiaXNlY3QnIG9yICdiZXR3ZWVuJyBtZXRob2QgZm9yIHZlY3RvcnM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IGxlZnQgPSB0aGlzLl9zdGFydC5ibGVuZCggdGhpcy5fY29udHJvbDEsIHQgKTtcbiAgICBjb25zdCByaWdodCA9IHRoaXMuX2NvbnRyb2wyLmJsZW5kKCB0aGlzLl9lbmQsIHQgKTtcbiAgICBjb25zdCBtaWRkbGUgPSB0aGlzLl9jb250cm9sMS5ibGVuZCggdGhpcy5fY29udHJvbDIsIHQgKTtcbiAgICBjb25zdCBsZWZ0TWlkID0gbGVmdC5ibGVuZCggbWlkZGxlLCB0ICk7XG4gICAgY29uc3QgcmlnaHRNaWQgPSBtaWRkbGUuYmxlbmQoIHJpZ2h0LCB0ICk7XG4gICAgY29uc3QgbWlkID0gbGVmdE1pZC5ibGVuZCggcmlnaHRNaWQsIHQgKTtcbiAgICByZXR1cm4gW1xuICAgICAgbmV3IEN1YmljKCB0aGlzLl9zdGFydCwgbGVmdCwgbGVmdE1pZCwgbWlkICksXG4gICAgICBuZXcgQ3ViaWMoIG1pZCwgcmlnaHRNaWQsIHJpZ2h0LCB0aGlzLl9lbmQgKVxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGNhY2hlZCBpbmZvcm1hdGlvbiwgc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGFueSBvZiB0aGUgJ2NvbnN0cnVjdG9yIGFyZ3VtZW50cycgYXJlIG11dGF0ZWQuXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9zdGFydCBpbnN0YW5jZW9mIFZlY3RvcjIsIGBDdWJpYyBzdGFydCBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX3N0YXJ0fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9zdGFydC5pc0Zpbml0ZSgpLCBgQ3ViaWMgc3RhcnQgc2hvdWxkIGJlIGZpbml0ZTogJHt0aGlzLl9zdGFydC50b1N0cmluZygpfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb250cm9sMSBpbnN0YW5jZW9mIFZlY3RvcjIsIGBDdWJpYyBjb250cm9sMSBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX2NvbnRyb2wxfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb250cm9sMS5pc0Zpbml0ZSgpLCBgQ3ViaWMgY29udHJvbDEgc2hvdWxkIGJlIGZpbml0ZTogJHt0aGlzLl9jb250cm9sMS50b1N0cmluZygpfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb250cm9sMiBpbnN0YW5jZW9mIFZlY3RvcjIsIGBDdWJpYyBjb250cm9sMiBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX2NvbnRyb2wyfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb250cm9sMi5pc0Zpbml0ZSgpLCBgQ3ViaWMgY29udHJvbDIgc2hvdWxkIGJlIGZpbml0ZTogJHt0aGlzLl9jb250cm9sMi50b1N0cmluZygpfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9lbmQgaW5zdGFuY2VvZiBWZWN0b3IyLCBgQ3ViaWMgZW5kIHNob3VsZCBiZSBhIFZlY3RvcjI6ICR7dGhpcy5fZW5kfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9lbmQuaXNGaW5pdGUoKSwgYEN1YmljIGVuZCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX2VuZC50b1N0cmluZygpfWAgKTtcblxuICAgIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXG4gICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl9lbmRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl9yID0gbnVsbDtcbiAgICB0aGlzLl9zID0gbnVsbDtcblxuICAgIC8vIEN1c3Atc3BlY2lmaWMgaW5mb3JtYXRpb25cbiAgICB0aGlzLl90Q3VzcCA9IG51bGw7XG4gICAgdGhpcy5fdERldGVybWluYW50ID0gbnVsbDtcbiAgICB0aGlzLl90SW5mbGVjdGlvbjEgPSBudWxsO1xuICAgIHRoaXMuX3RJbmZsZWN0aW9uMiA9IG51bGw7XG4gICAgdGhpcy5fcXVhZHJhdGljcyA9IG51bGw7XG5cbiAgICAvLyBULXZhbHVlcyB3aGVyZSBYIGFuZCBZIChyZXNwZWN0aXZlbHkpIHJlYWNoIGFuIGV4dHJlbWEgKG5vdCBuZWNlc3NhcmlseSBpbmNsdWRpbmcgMCBhbmQgMSlcbiAgICB0aGlzLl94RXh0cmVtYVQgPSBudWxsO1xuICAgIHRoaXMuX3lFeHRyZW1hVCA9IG51bGw7XG5cbiAgICB0aGlzLl9ib3VuZHMgPSBudWxsO1xuICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XG5cbiAgICB0aGlzLmludmFsaWRhdGlvbkVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHN0YXJ0IHBvc2l0aW9uIG9mIHRoaXMgY3ViaWMgcG9seW5vbWlhbC5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl9zdGFydFRhbmdlbnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9zdGFydFRhbmdlbnQgPSB0aGlzLnRhbmdlbnRBdCggMCApLm5vcm1hbGl6ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0VGFuZ2VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3RhcnRUYW5nZW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydFRhbmdlbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBlbmQgcG9zaXRpb24gb2YgdGhpcyBjdWJpYyBwb2x5bm9taWFsLlxuICAgKi9cbiAgcHVibGljIGdldEVuZFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl9lbmRUYW5nZW50ID09PSBudWxsICkge1xuICAgICAgdGhpcy5fZW5kVGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0KCAxICkubm9ybWFsaXplZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW5kVGFuZ2VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kVGFuZ2VudCgpOyB9XG5cbiAgLyoqXG4gICAqIFRPRE86IGRvY3VtZW50YXRpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAqL1xuICBwdWJsaWMgZ2V0UigpOiBWZWN0b3IyIHtcbiAgICAvLyBmcm9tIGh0dHA6Ly93d3cuY2lzLnVzb3V0aGFsLmVkdS9+aGFpbi9nZW5lcmFsL1B1YmxpY2F0aW9ucy9CZXppZXIvQmV6aWVyRmxhdHRlbmluZy5wZGZcbiAgICBpZiAoIHRoaXMuX3IgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9yID0gdGhpcy5fY29udHJvbDEubWludXMoIHRoaXMuX3N0YXJ0ICkubm9ybWFsaXplZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcigpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0UigpOyB9XG5cbiAgLyoqXG4gICAqIFRPRE86IGRvY3VtZW50YXRpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAqL1xuICBwdWJsaWMgZ2V0UygpOiBWZWN0b3IyIHtcbiAgICAvLyBmcm9tIGh0dHA6Ly93d3cuY2lzLnVzb3V0aGFsLmVkdS9+aGFpbi9nZW5lcmFsL1B1YmxpY2F0aW9ucy9CZXppZXIvQmV6aWVyRmxhdHRlbmluZy5wZGZcbiAgICBpZiAoIHRoaXMuX3MgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9zID0gdGhpcy5nZXRSKCkucGVycGVuZGljdWxhcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3M7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHMoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFMoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwYXJhbWV0cmljIHQgdmFsdWUgZm9yIHRoZSBwb3NzaWJsZSBjdXNwIGxvY2F0aW9uLiBBIGN1c3AgbWF5IG9yIG1heSBub3QgZXhpc3QgYXQgdGhhdCBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBnZXRUQ3VzcCgpOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5fdEN1c3AgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLmNvbXB1dGVDdXNwSW5mbygpO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl90Q3VzcCAhPT0gbnVsbCApO1xuICAgIHJldHVybiB0aGlzLl90Q3VzcCE7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRDdXNwKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFRDdXNwKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGV0ZXJtaW5hbnQgdmFsdWUgZm9yIHRoZSBjdXNwLCB3aGljaCBpbmRpY2F0ZXMgdGhlIHByZXNlbmNlIChvciBsYWNrIG9mIHByZXNlbmNlKSBvZiBhIGN1c3AuXG4gICAqL1xuICBwdWJsaWMgZ2V0VERldGVybWluYW50KCk6IG51bWJlciB7XG4gICAgaWYgKCB0aGlzLl90RGV0ZXJtaW5hbnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLmNvbXB1dGVDdXNwSW5mbygpO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl90RGV0ZXJtaW5hbnQgIT09IG51bGwgKTtcbiAgICByZXR1cm4gdGhpcy5fdERldGVybWluYW50ITtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdERldGVybWluYW50KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFREZXRlcm1pbmFudCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBhcmFtZXRyaWMgdCB2YWx1ZSBmb3IgdGhlIHBvdGVudGlhbCBsb2NhdGlvbiBvZiB0aGUgZmlyc3QgcG9zc2libGUgaW5mbGVjdGlvbiBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBnZXRUSW5mbGVjdGlvbjEoKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMuX3RJbmZsZWN0aW9uMSA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY29tcHV0ZUN1c3BJbmZvKCk7XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RJbmZsZWN0aW9uMSAhPT0gbnVsbCApO1xuICAgIHJldHVybiB0aGlzLl90SW5mbGVjdGlvbjEhO1xuICB9XG5cbiAgcHVibGljIGdldCB0SW5mbGVjdGlvbjEoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0VEluZmxlY3Rpb24xKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGFyYW1ldHJpYyB0IHZhbHVlIGZvciB0aGUgcG90ZW50aWFsIGxvY2F0aW9uIG9mIHRoZSBzZWNvbmQgcG9zc2libGUgaW5mbGVjdGlvbiBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBnZXRUSW5mbGVjdGlvbjIoKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMuX3RJbmZsZWN0aW9uMiA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY29tcHV0ZUN1c3BJbmZvKCk7XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3RJbmZsZWN0aW9uMiAhPT0gbnVsbCApO1xuICAgIHJldHVybiB0aGlzLl90SW5mbGVjdGlvbjIhO1xuICB9XG5cbiAgcHVibGljIGdldCB0SW5mbGVjdGlvbjIoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0VEluZmxlY3Rpb24yKCk7IH1cblxuICAvKipcbiAgICogSWYgdGhlcmUgaXMgYSBjdXNwLCB0aGlzIGN1YmljIHdpbGwgY29uc2lzdCBvZiBvbmUgb3IgdHdvIHF1YWRyYXRpYyBzZWdtZW50cywgdHlwaWNhbGx5IFwic3RhcnQgPT4gY3VzcFwiIGFuZFxuICAgKiBcImN1c3AgPT4gZW5kXCIuXG4gICAqL1xuICBwdWJsaWMgZ2V0UXVhZHJhdGljcygpOiBRdWFkcmF0aWNbXSB8IG51bGwge1xuICAgIGlmICggdGhpcy5fcXVhZHJhdGljcyA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY29tcHV0ZUN1c3BTZWdtZW50cygpO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9xdWFkcmF0aWNzICE9PSBudWxsICk7XG4gICAgcmV0dXJuIHRoaXMuX3F1YWRyYXRpY3M7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgcGFyYW1ldHJpYyB0IHZhbHVlcyB3aGVyZSB4LWV4dHJlbWEgZXhpc3QsIGkuZS4gd2hlcmUgZHgvZHQ9PTAuIFRoZXNlIGFyZSBjYW5kaWRhdGUgbG9jYXRpb25zXG4gICAqIG9uIHRoZSBjdWJpYyBmb3IgXCJtYXhpbXVtIFhcIiBhbmQgXCJtaW5pbXVtIFhcIiwgYW5kIGFyZSBuZWVkZWQgZm9yIGJvdW5kcyBjb21wdXRhdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0WEV4dHJlbWFUKCk6IG51bWJlcltdIHtcbiAgICBpZiAoIHRoaXMuX3hFeHRyZW1hVCA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuX3hFeHRyZW1hVCA9IEN1YmljLmV4dHJlbWFUKCB0aGlzLl9zdGFydC54LCB0aGlzLl9jb250cm9sMS54LCB0aGlzLl9jb250cm9sMi54LCB0aGlzLl9lbmQueCApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5feEV4dHJlbWFUO1xuICB9XG5cbiAgcHVibGljIGdldCB4RXh0cmVtYVQoKTogbnVtYmVyW10geyByZXR1cm4gdGhpcy5nZXRYRXh0cmVtYVQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBwYXJhbWV0cmljIHQgdmFsdWVzIHdoZXJlIHktZXh0cmVtYSBleGlzdCwgaS5lLiB3aGVyZSBkeS9kdD09MC4gVGhlc2UgYXJlIGNhbmRpZGF0ZSBsb2NhdGlvbnNcbiAgICogb24gdGhlIGN1YmljIGZvciBcIm1heGltdW0gWVwiIGFuZCBcIm1pbmltdW0gWVwiLCBhbmQgYXJlIG5lZWRlZCBmb3IgYm91bmRzIGNvbXB1dGF0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBnZXRZRXh0cmVtYVQoKTogbnVtYmVyW10ge1xuICAgIGlmICggdGhpcy5feUV4dHJlbWFUID09PSBudWxsICkge1xuICAgICAgdGhpcy5feUV4dHJlbWFUID0gQ3ViaWMuZXh0cmVtYVQoIHRoaXMuX3N0YXJ0LnksIHRoaXMuX2NvbnRyb2wxLnksIHRoaXMuX2NvbnRyb2wyLnksIHRoaXMuX2VuZC55ICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl95RXh0cmVtYVQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHlFeHRyZW1hVCgpOiBudW1iZXJbXSB7IHJldHVybiB0aGlzLmdldFlFeHRyZW1hVCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIHNlZ21lbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xuICAgIGlmICggdGhpcy5fYm91bmRzID09PSBudWxsICkge1xuICAgICAgdGhpcy5fYm91bmRzID0gQm91bmRzMi5OT1RISU5HO1xuICAgICAgdGhpcy5fYm91bmRzID0gdGhpcy5fYm91bmRzLndpdGhQb2ludCggdGhpcy5fc3RhcnQgKTtcbiAgICAgIHRoaXMuX2JvdW5kcyA9IHRoaXMuX2JvdW5kcy53aXRoUG9pbnQoIHRoaXMuX2VuZCApO1xuXG4gICAgICBfLmVhY2goIHRoaXMuZ2V0WEV4dHJlbWFUKCksIHQgPT4ge1xuICAgICAgICBpZiAoIHQgPj0gMCAmJiB0IDw9IDEgKSB7XG4gICAgICAgICAgdGhpcy5fYm91bmRzID0gdGhpcy5fYm91bmRzIS53aXRoUG9pbnQoIHRoaXMucG9zaXRpb25BdCggdCApICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIF8uZWFjaCggdGhpcy5nZXRZRXh0cmVtYVQoKSwgdCA9PiB7XG4gICAgICAgIGlmICggdCA+PSAwICYmIHQgPD0gMSApIHtcbiAgICAgICAgICB0aGlzLl9ib3VuZHMgPSB0aGlzLl9ib3VuZHMhLndpdGhQb2ludCggdGhpcy5wb3NpdGlvbkF0KCB0ICkgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBpZiAoIHRoaXMuaGFzQ3VzcCgpICkge1xuICAgICAgICB0aGlzLl9ib3VuZHMgPSB0aGlzLl9ib3VuZHMud2l0aFBvaW50KCB0aGlzLnBvc2l0aW9uQXQoIHRoaXMuZ2V0VEN1c3AoKSApICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ib3VuZHM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgYWxsIGN1c3AtcmVsYXRlZCBpbmZvcm1hdGlvbiwgaW5jbHVkaW5nIHdoZXRoZXIgdGhlcmUgaXMgYSBjdXNwLCBhbnkgaW5mbGVjdGlvbiBwb2ludHMsIGV0Yy5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZUN1c3BJbmZvKCk6IHZvaWQge1xuICAgIC8vIGZyb20gaHR0cDovL3d3dy5jaXMudXNvdXRoYWwuZWR1L35oYWluL2dlbmVyYWwvUHVibGljYXRpb25zL0Jlemllci9CZXppZXJGbGF0dGVuaW5nLnBkZlxuICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IGEgPSB0aGlzLl9zdGFydC50aW1lcyggLTEgKS5wbHVzKCB0aGlzLl9jb250cm9sMS50aW1lcyggMyApICkucGx1cyggdGhpcy5fY29udHJvbDIudGltZXMoIC0zICkgKS5wbHVzKCB0aGlzLl9lbmQgKTtcbiAgICBjb25zdCBiID0gdGhpcy5fc3RhcnQudGltZXMoIDMgKS5wbHVzKCB0aGlzLl9jb250cm9sMS50aW1lcyggLTYgKSApLnBsdXMoIHRoaXMuX2NvbnRyb2wyLnRpbWVzKCAzICkgKTtcbiAgICBjb25zdCBjID0gdGhpcy5fc3RhcnQudGltZXMoIC0zICkucGx1cyggdGhpcy5fY29udHJvbDEudGltZXMoIDMgKSApO1xuXG4gICAgY29uc3QgYVBlcnAgPSBhLnBlcnBlbmRpY3VsYXI7IC8vIHtWZWN0b3IyfVxuICAgIGNvbnN0IGJQZXJwID0gYi5wZXJwZW5kaWN1bGFyOyAvLyB7VmVjdG9yMn1cbiAgICBjb25zdCBhUGVycERvdEIgPSBhUGVycC5kb3QoIGIgKTsgLy8ge251bWJlcn1cblxuICAgIHRoaXMuX3RDdXNwID0gLTAuNSAqICggYVBlcnAuZG90KCBjICkgLyBhUGVycERvdEIgKTsgLy8ge251bWJlcn1cbiAgICB0aGlzLl90RGV0ZXJtaW5hbnQgPSB0aGlzLl90Q3VzcCAqIHRoaXMuX3RDdXNwIC0gKCAxIC8gMyApICogKCBiUGVycC5kb3QoIGMgKSAvIGFQZXJwRG90QiApOyAvLyB7bnVtYmVyfVxuICAgIGlmICggdGhpcy5fdERldGVybWluYW50ID49IDAgKSB7XG4gICAgICBjb25zdCBzcXJ0RGV0ID0gTWF0aC5zcXJ0KCB0aGlzLl90RGV0ZXJtaW5hbnQgKTtcbiAgICAgIHRoaXMuX3RJbmZsZWN0aW9uMSA9IHRoaXMuX3RDdXNwIC0gc3FydERldDtcbiAgICAgIHRoaXMuX3RJbmZsZWN0aW9uMiA9IHRoaXMuX3RDdXNwICsgc3FydERldDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0aGVyZSBhcmUgbm8gcmVhbCByb290cyB0byB0aGUgcXVhZHJhdGljIHBvbHlub21pYWwuXG4gICAgICB0aGlzLl90SW5mbGVjdGlvbjEgPSBOYU47XG4gICAgICB0aGlzLl90SW5mbGVjdGlvbjIgPSBOYU47XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZXJlIGlzIGEgY3VzcCwgdGhpcyBjb21wdXRlcyB0aGUgMiBxdWFkcmF0aWMgQmV6aWVyIGN1cnZlcyB0aGF0IHRoaXMgQ3ViaWMgY2FuIGJlIGNvbnZlcnRlZCBpbnRvLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlQ3VzcFNlZ21lbnRzKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5oYXNDdXNwKCkgKSB7XG4gICAgICAvLyBpZiB0aGVyZSBpcyBhIGN1c3AsIHdlJ2xsIHNwbGl0IGF0IHRoZSBjdXNwIGludG8gdHdvIHF1YWRyYXRpYyBiZXppZXIgY3VydmVzLlxuICAgICAgLy8gc2VlIGh0dHA6Ly9jaXRlc2VlcnguaXN0LnBzdS5lZHUvdmlld2RvYy9kb3dubG9hZD9kb2k9MTAuMS4xLjk0LjgwODgmcmVwPXJlcDEmdHlwZT1wZGYgKFNpbmd1bGFyaXRpZXMgb2YgcmF0aW9uYWwgQmV6aWVyIGN1cnZlcyAtIEogTW9udGVyZGUsIDIwMDEpXG4gICAgICB0aGlzLl9xdWFkcmF0aWNzID0gW107XG4gICAgICBjb25zdCB0Q3VzcCA9IHRoaXMuZ2V0VEN1c3AoKTtcbiAgICAgIGlmICggdEN1c3AgPT09IDAgKSB7XG4gICAgICAgIHRoaXMuX3F1YWRyYXRpY3MucHVzaCggbmV3IFF1YWRyYXRpYyggdGhpcy5zdGFydCwgdGhpcy5jb250cm9sMiwgdGhpcy5lbmQgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRDdXNwID09PSAxICkge1xuICAgICAgICB0aGlzLl9xdWFkcmF0aWNzLnB1c2goIG5ldyBRdWFkcmF0aWMoIHRoaXMuc3RhcnQsIHRoaXMuY29udHJvbDEsIHRoaXMuZW5kICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBzdWJkaXZpZGVkQXRDdXNwID0gdGhpcy5zdWJkaXZpZGVkKCB0Q3VzcCApO1xuICAgICAgICB0aGlzLl9xdWFkcmF0aWNzLnB1c2goIG5ldyBRdWFkcmF0aWMoIHN1YmRpdmlkZWRBdEN1c3BbIDAgXS5zdGFydCwgc3ViZGl2aWRlZEF0Q3VzcFsgMCBdLmNvbnRyb2wxLCBzdWJkaXZpZGVkQXRDdXNwWyAwIF0uZW5kICkgKTtcbiAgICAgICAgdGhpcy5fcXVhZHJhdGljcy5wdXNoKCBuZXcgUXVhZHJhdGljKCBzdWJkaXZpZGVkQXRDdXNwWyAxIF0uc3RhcnQsIHN1YmRpdmlkZWRBdEN1c3BbIDEgXS5jb250cm9sMiwgc3ViZGl2aWRlZEF0Q3VzcFsgMSBdLmVuZCApICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fcXVhZHJhdGljcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIG5vbi1kZWdlbmVyYXRlIHNlZ21lbnRzIHRoYXQgYXJlIGVxdWl2YWxlbnQgdG8gdGhpcyBzZWdtZW50LiBHZW5lcmFsbHkgZ2V0cyByaWQgKG9yIHNpbXBsaWZpZXMpXG4gICAqIGludmFsaWQgb3IgcmVwZWF0ZWQgc2VnbWVudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk6IFNlZ21lbnRbXSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLl9zdGFydDtcbiAgICBjb25zdCBjb250cm9sMSA9IHRoaXMuX2NvbnRyb2wxO1xuICAgIGNvbnN0IGNvbnRyb2wyID0gdGhpcy5fY29udHJvbDI7XG4gICAgY29uc3QgZW5kID0gdGhpcy5fZW5kO1xuXG4gICAgY29uc3QgcmVkdWNlZCA9IHRoaXMuZGVncmVlUmVkdWNlZCggMWUtOSApO1xuXG4gICAgaWYgKCBzdGFydC5lcXVhbHMoIGVuZCApICYmIHN0YXJ0LmVxdWFscyggY29udHJvbDEgKSAmJiBzdGFydC5lcXVhbHMoIGNvbnRyb2wyICkgKSB7XG4gICAgICAvLyBkZWdlbmVyYXRlIHBvaW50XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmhhc0N1c3AoKSApIHtcbiAgICAgIHJldHVybiBfLmZsYXR0ZW4oIHRoaXMuZ2V0UXVhZHJhdGljcygpIS5tYXAoIHF1YWRyYXRpYyA9PiBxdWFkcmF0aWMuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCkgKSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggcmVkdWNlZCApIHtcbiAgICAgIC8vIGlmIHdlIGNhbiByZWR1Y2UgdG8gYSBxdWFkcmF0aWMgQmV6aWVyLCBhbHdheXMgZG8gdGhpcyAoYW5kIG1ha2Ugc3VyZSBpdCBpcyBub24tZGVnZW5lcmF0ZSlcbiAgICAgIHJldHVybiByZWR1Y2VkLmdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpO1xuICAgIH1cbiAgICBlbHNlIGlmICggYXJlUG9pbnRzQ29sbGluZWFyKCBzdGFydCwgY29udHJvbDEsIGVuZCApICYmIGFyZVBvaW50c0NvbGxpbmVhciggc3RhcnQsIGNvbnRyb2wyLCBlbmQgKSAmJiAhc3RhcnQuZXF1YWxzRXBzaWxvbiggZW5kLCAxZS03ICkgKSB7XG4gICAgICBjb25zdCBleHRyZW1hUG9pbnRzID0gdGhpcy5nZXRYRXh0cmVtYVQoKS5jb25jYXQoIHRoaXMuZ2V0WUV4dHJlbWFUKCkgKS5zb3J0KCkubWFwKCB0ID0+IHRoaXMucG9zaXRpb25BdCggdCApICk7XG5cbiAgICAgIGNvbnN0IHNlZ21lbnRzID0gW107XG4gICAgICBsZXQgbGFzdFBvaW50ID0gc3RhcnQ7XG4gICAgICBpZiAoIGV4dHJlbWFQb2ludHMubGVuZ3RoICkge1xuICAgICAgICBzZWdtZW50cy5wdXNoKCBuZXcgTGluZSggc3RhcnQsIGV4dHJlbWFQb2ludHNbIDAgXSApICk7XG4gICAgICAgIGxhc3RQb2ludCA9IGV4dHJlbWFQb2ludHNbIDAgXTtcbiAgICAgIH1cbiAgICAgIGZvciAoIGxldCBpID0gMTsgaSA8IGV4dHJlbWFQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goIG5ldyBMaW5lKCBleHRyZW1hUG9pbnRzWyBpIC0gMSBdLCBleHRyZW1hUG9pbnRzWyBpIF0gKSApO1xuICAgICAgICBsYXN0UG9pbnQgPSBleHRyZW1hUG9pbnRzWyBpIF07XG4gICAgICB9XG4gICAgICBzZWdtZW50cy5wdXNoKCBuZXcgTGluZSggbGFzdFBvaW50LCBlbmQgKSApO1xuXG4gICAgICByZXR1cm4gXy5mbGF0dGVuKCBzZWdtZW50cy5tYXAoIHNlZ21lbnQgPT4gc2VnbWVudC5nZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBjdWJpYyBoYXMgYSBjdXNwLlxuICAgKi9cbiAgcHVibGljIGhhc0N1c3AoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdEN1c3AgPSB0aGlzLmdldFRDdXNwKCk7XG5cbiAgICBjb25zdCBlcHNpbG9uID0gMWUtNzsgLy8gVE9ETzogbWFrZSB0aGlzIGF2YWlsYWJsZSB0byBjaGFuZ2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIHJldHVybiB0Q3VzcCA+PSAwICYmIHRDdXNwIDw9IDEgJiYgdGhpcy50YW5nZW50QXQoIHRDdXNwICkubWFnbml0dWRlIDwgZXBzaWxvbjtcbiAgfVxuXG4gIHB1YmxpYyB0b1JTKCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICBjb25zdCBmaXJzdFZlY3RvciA9IHBvaW50Lm1pbnVzKCB0aGlzLl9zdGFydCApO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggZmlyc3RWZWN0b3IuZG90KCB0aGlzLmdldFIoKSApLCBmaXJzdFZlY3Rvci5kb3QoIHRoaXMuZ2V0UygpICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBvZmZzZXRUbyggcjogbnVtYmVyLCByZXZlcnNlOiBib29sZWFuICk6IExpbmVbXSB7XG4gICAgLy8gVE9ETzogaW1wbGVtZW50IG1vcmUgYWNjdXJhdGUgbWV0aG9kIGF0IGh0dHA6Ly93d3cuYW50aWdyYWluLmNvbS9yZXNlYXJjaC9hZGFwdGl2ZV9iZXppZXIvaW5kZXguaHRtbCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAvLyBUT0RPOiBvciBtb3JlIHJlY2VudGx5IChhbmQgcmVsZXZhbnRseSk6IGh0dHA6Ly93d3cuY2lzLnVzb3V0aGFsLmVkdS9+aGFpbi9nZW5lcmFsL1B1YmxpY2F0aW9ucy9CZXppZXIvQmV6aWVyRmxhdHRlbmluZy5wZGYgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG5cbiAgICAvLyBob3cgbWFueSBzZWdtZW50cyB0byBjcmVhdGUgKHBvc3NpYmx5IG1ha2UgdGhpcyBtb3JlIGFkYXB0aXZlPylcbiAgICBjb25zdCBxdWFudGl0eSA9IDMyO1xuXG4gICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVhbnRpdHk7IGkrKyApIHtcbiAgICAgIGxldCB0ID0gaSAvICggcXVhbnRpdHkgLSAxICk7XG4gICAgICBpZiAoIHJldmVyc2UgKSB7XG4gICAgICAgIHQgPSAxIC0gdDtcbiAgICAgIH1cblxuICAgICAgcG9pbnRzLnB1c2goIHRoaXMucG9zaXRpb25BdCggdCApLnBsdXMoIHRoaXMudGFuZ2VudEF0KCB0ICkucGVycGVuZGljdWxhci5ub3JtYWxpemVkKCkudGltZXMoIHIgKSApICk7XG4gICAgICBpZiAoIGkgPiAwICkge1xuICAgICAgICByZXN1bHQucHVzaCggbmV3IExpbmUoIHBvaW50c1sgaSAtIDEgXSwgcG9pbnRzWyBpIF0gKSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBTVkcgcGF0aC4gYXNzdW1lcyB0aGF0IHRoZSBzdGFydCBwb2ludCBpcyBhbHJlYWR5IHByb3ZpZGVkLCBzbyBhbnl0aGluZyB0aGF0IGNhbGxzIHRoaXMgbmVlZHMgdG8gcHV0XG4gICAqIHRoZSBNIGNhbGxzIGZpcnN0XG4gICAqL1xuICBwdWJsaWMgZ2V0U1ZHUGF0aEZyYWdtZW50KCk6IHN0cmluZyB7XG4gICAgbGV0IG9sZFBhdGhGcmFnbWVudDtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIG9sZFBhdGhGcmFnbWVudCA9IHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICggIXRoaXMuX3N2Z1BhdGhGcmFnbWVudCApIHtcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IGBDICR7c3ZnTnVtYmVyKCB0aGlzLl9jb250cm9sMS54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9jb250cm9sMS55ICl9ICR7XG4gICAgICAgIHN2Z051bWJlciggdGhpcy5fY29udHJvbDIueCApfSAke3N2Z051bWJlciggdGhpcy5fY29udHJvbDIueSApfSAke1xuICAgICAgICBzdmdOdW1iZXIoIHRoaXMuX2VuZC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9lbmQueSApfWA7XG4gICAgfVxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgaWYgKCBvbGRQYXRoRnJhZ21lbnQgKSB7XG4gICAgICAgIGFzc2VydCggb2xkUGF0aEZyYWdtZW50ID09PSB0aGlzLl9zdmdQYXRoRnJhZ21lbnQsICdRdWFkcmF0aWMgbGluZSBzZWdtZW50IGNoYW5nZWQgd2l0aG91dCBpbnZhbGlkYXRlKCknICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdmdQYXRoRnJhZ21lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBsaW5lcyB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgY3VydmUgb24gdGhlIGxvZ2ljYWwgbGVmdCBzaWRlXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogTGluZVtdIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXRUbyggLWxpbmVXaWR0aCAvIDIsIGZhbHNlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBsaW5lcyB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgY3VydmUgb24gdGhlIGxvZ2ljYWwgcmlnaHQgc2lkZVxuICAgKi9cbiAgcHVibGljIHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBMaW5lW10ge1xuICAgIHJldHVybiB0aGlzLm9mZnNldFRvKCBsaW5lV2lkdGggLyAyLCB0cnVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgdCB2YWx1ZXMgd2hlcmUgZHgvZHQgb3IgZHkvZHQgaXMgMCB3aGVyZSAwIDwgdCA8IDEuIHN1YmRpdmlkaW5nIG9uIHRoZXNlIHdpbGwgcmVzdWx0IGluIG1vbm90b25pYyBzZWdtZW50c1xuICAgKiBUaGUgbGlzdCBkb2VzIG5vdCBpbmNsdWRlIHQ9MCBhbmQgdD0xXG4gICAqL1xuICBwdWJsaWMgZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKTogbnVtYmVyW10ge1xuICAgIGNvbnN0IHRzID0gdGhpcy5nZXRYRXh0cmVtYVQoKS5jb25jYXQoIHRoaXMuZ2V0WUV4dHJlbWFUKCkgKTtcbiAgICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gW107XG4gICAgXy5lYWNoKCB0cywgdCA9PiB7XG4gICAgICBjb25zdCBlcHNpbG9uID0gMC4wMDAwMDAwMDAxOyAvLyBUT0RPOiBnZW5lcmFsIGtpdGUgZXBzaWxvbj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICBpZiAoIHQgPiBlcHNpbG9uICYmIHQgPCAxIC0gZXBzaWxvbiApIHtcbiAgICAgICAgLy8gZG9uJ3QgYWRkIGR1cGxpY2F0ZSB0IHZhbHVlc1xuICAgICAgICBpZiAoIF8uZXZlcnkoIHJlc3VsdCwgb3RoZXJUID0+IE1hdGguYWJzKCB0IC0gb3RoZXJUICkgPiBlcHNpbG9uICkgKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goIHQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICByZXR1cm4gcmVzdWx0LnNvcnQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhpdC10ZXN0cyB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzZWdtZW50IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEZvciBkZXRhaWxzLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gaW4gU2VnbWVudC5qc1xuICAgKi9cbiAgcHVibGljIGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdIHtcbiAgICBjb25zdCByZXN1bHQ6IFJheUludGVyc2VjdGlvbltdID0gW107XG5cbiAgICAvLyBmaW5kIHRoZSByb3RhdGlvbiB0aGF0IHdpbGwgcHV0IG91ciByYXkgaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgeC1heGlzIHNvIHdlIGNhbiBvbmx5IHNvbHZlIGZvciB5PTAgZm9yIGludGVyc2VjdGlvbnNcbiAgICBjb25zdCBpbnZlcnNlTWF0cml4ID0gTWF0cml4My5yb3RhdGlvbjIoIC1yYXkuZGlyZWN0aW9uLmFuZ2xlICkudGltZXNNYXRyaXgoIE1hdHJpeDMudHJhbnNsYXRpb24oIC1yYXkucG9zaXRpb24ueCwgLXJheS5wb3NpdGlvbi55ICkgKTtcblxuICAgIGNvbnN0IHAwID0gaW52ZXJzZU1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX3N0YXJ0ICk7XG4gICAgY29uc3QgcDEgPSBpbnZlcnNlTWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fY29udHJvbDEgKTtcbiAgICBjb25zdCBwMiA9IGludmVyc2VNYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLl9jb250cm9sMiApO1xuICAgIGNvbnN0IHAzID0gaW52ZXJzZU1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2VuZCApO1xuXG4gICAgLy8gcG9seW5vbWlhbCBmb3JtIG9mIGN1YmljOiBzdGFydCArICgzIGNvbnRyb2wxIC0gMyBzdGFydCkgdCArICgtNiBjb250cm9sMSArIDMgY29udHJvbDIgKyAzIHN0YXJ0KSB0XjIgKyAoMyBjb250cm9sMSAtIDMgY29udHJvbDIgKyBlbmQgLSBzdGFydCkgdF4zXG4gICAgY29uc3QgYSA9IC1wMC55ICsgMyAqIHAxLnkgLSAzICogcDIueSArIHAzLnk7XG4gICAgY29uc3QgYiA9IDMgKiBwMC55IC0gNiAqIHAxLnkgKyAzICogcDIueTtcbiAgICBjb25zdCBjID0gLTMgKiBwMC55ICsgMyAqIHAxLnk7XG4gICAgY29uc3QgZCA9IHAwLnk7XG5cbiAgICBjb25zdCB0cyA9IHNvbHZlQ3ViaWNSb290c1JlYWwoIGEsIGIsIGMsIGQgKTtcblxuICAgIF8uZWFjaCggdHMsICggdDogbnVtYmVyICkgPT4ge1xuICAgICAgaWYgKCB0ID49IDAgJiYgdCA8PSAxICkge1xuICAgICAgICBjb25zdCBoaXRQb2ludCA9IHRoaXMucG9zaXRpb25BdCggdCApO1xuICAgICAgICBjb25zdCB1bml0VGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0KCB0ICkubm9ybWFsaXplZCgpO1xuICAgICAgICBjb25zdCBwZXJwID0gdW5pdFRhbmdlbnQucGVycGVuZGljdWxhcjtcbiAgICAgICAgY29uc3QgdG9IaXQgPSBoaXRQb2ludC5taW51cyggcmF5LnBvc2l0aW9uICk7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIGl0J3Mgbm90IGJlaGluZCB0aGUgcmF5XG4gICAgICAgIGlmICggdG9IaXQuZG90KCByYXkuZGlyZWN0aW9uICkgPiAwICkge1xuICAgICAgICAgIGNvbnN0IG5vcm1hbCA9IHBlcnAuZG90KCByYXkuZGlyZWN0aW9uICkgPiAwID8gcGVycC5uZWdhdGVkKCkgOiBwZXJwO1xuICAgICAgICAgIGNvbnN0IHdpbmQgPSByYXkuZGlyZWN0aW9uLnBlcnBlbmRpY3VsYXIuZG90KCB1bml0VGFuZ2VudCApIDwgMCA/IDEgOiAtMTtcbiAgICAgICAgICByZXN1bHQucHVzaCggbmV3IFJheUludGVyc2VjdGlvbiggdG9IaXQubWFnbml0dWRlLCBoaXRQb2ludCwgbm9ybWFsLCB3aW5kLCB0ICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdpbmRpbmcgbnVtYmVyIGZvciBpbnRlcnNlY3Rpb24gd2l0aCBhIHJheVxuICAgKi9cbiAgcHVibGljIHdpbmRpbmdJbnRlcnNlY3Rpb24oIHJheTogUmF5MiApOiBudW1iZXIge1xuICAgIGxldCB3aW5kID0gMDtcbiAgICBjb25zdCBoaXRzID0gdGhpcy5pbnRlcnNlY3Rpb24oIHJheSApO1xuICAgIF8uZWFjaCggaGl0cywgKCBoaXQ6IFJheUludGVyc2VjdGlvbiApID0+IHtcbiAgICAgIHdpbmQgKz0gaGl0LndpbmQ7XG4gICAgfSApO1xuICAgIHJldHVybiB3aW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIHRoZSBzZWdtZW50IHRvIHRoZSAyRCBDYW52YXMgY29udGV4dCwgYXNzdW1pbmcgdGhlIGNvbnRleHQncyBjdXJyZW50IGxvY2F0aW9uIGlzIGFscmVhZHkgYXQgdGhlIHN0YXJ0IHBvaW50XG4gICAqL1xuICBwdWJsaWMgd3JpdGVUb0NvbnRleHQoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcbiAgICBjb250ZXh0LmJlemllckN1cnZlVG8oIHRoaXMuX2NvbnRyb2wxLngsIHRoaXMuX2NvbnRyb2wxLnksIHRoaXMuX2NvbnRyb2wyLngsIHRoaXMuX2NvbnRyb2wyLnksIHRoaXMuX2VuZC54LCB0aGlzLl9lbmQueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgY3ViaWMgdGhhdCByZXByZXNlbnRzIHRoaXMgY3ViaWMgYWZ0ZXIgdHJhbnNmb3JtYXRpb24gYnkgdGhlIG1hdHJpeFxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDMgKTogQ3ViaWMge1xuICAgIHJldHVybiBuZXcgQ3ViaWMoIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX3N0YXJ0ICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wxICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wyICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2VuZCApICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZGVncmVlLXJlZHVjZWQgcXVhZHJhdGljIEJlemllciBpZiBwb3NzaWJsZSwgb3RoZXJ3aXNlIGl0IHJldHVybnMgbnVsbFxuICAgKi9cbiAgcHVibGljIGRlZ3JlZVJlZHVjZWQoIGVwc2lsb246IG51bWJlciApOiBRdWFkcmF0aWMgfCBudWxsIHtcbiAgICBlcHNpbG9uID0gZXBzaWxvbiB8fCAwOyAvLyBpZiBub3QgcHJvdmlkZWQsIHVzZSBhbiBleGFjdCB2ZXJzaW9uXG4gICAgY29uc3QgY29udHJvbEEgPSBzY3JhdGNoVmVjdG9yMS5zZXQoIHRoaXMuX2NvbnRyb2wxICkubXVsdGlwbHlTY2FsYXIoIDMgKS5zdWJ0cmFjdCggdGhpcy5fc3RhcnQgKS5kaXZpZGVTY2FsYXIoIDIgKTtcbiAgICBjb25zdCBjb250cm9sQiA9IHNjcmF0Y2hWZWN0b3IyLnNldCggdGhpcy5fY29udHJvbDIgKS5tdWx0aXBseVNjYWxhciggMyApLnN1YnRyYWN0KCB0aGlzLl9lbmQgKS5kaXZpZGVTY2FsYXIoIDIgKTtcbiAgICBjb25zdCBkaWZmZXJlbmNlID0gc2NyYXRjaFZlY3RvcjMuc2V0KCBjb250cm9sQSApLnN1YnRyYWN0KCBjb250cm9sQiApO1xuICAgIGlmICggZGlmZmVyZW5jZS5tYWduaXR1ZGUgPD0gZXBzaWxvbiApIHtcbiAgICAgIHJldHVybiBuZXcgUXVhZHJhdGljKFxuICAgICAgICB0aGlzLl9zdGFydCxcbiAgICAgICAgY29udHJvbEEuYXZlcmFnZSggY29udHJvbEIgKSwgLy8gYXZlcmFnZSB0aGUgY29udHJvbCBwb2ludHMgZm9yIHN0YWJpbGl0eS4gdGhleSBzaG91bGQgYmUgYWxtb3N0IGlkZW50aWNhbFxuICAgICAgICB0aGlzLl9lbmRcbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdGhlIHR3byBvcHRpb25zIGZvciBjb250cm9sIHBvaW50cyBhcmUgdG9vIGZhciBhd2F5LCB0aGlzIGN1cnZlIGlzbid0IGVhc2lseSByZWR1Y2libGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29udHJpYnV0aW9uIHRvIHRoZSBzaWduZWQgYXJlYSBjb21wdXRlZCB1c2luZyBHcmVlbidzIFRoZW9yZW0sIHdpdGggUD0teS8yIGFuZCBRPXgvMi5cbiAgICpcbiAgICogTk9URTogVGhpcyBpcyB0aGlzIHNlZ21lbnQncyBjb250cmlidXRpb24gdG8gdGhlIGxpbmUgaW50ZWdyYWwgKC15LzIgZHggKyB4LzIgZHkpLlxuICAgKi9cbiAgcHVibGljIGdldFNpZ25lZEFyZWFGcmFnbWVudCgpOiBudW1iZXIge1xuICAgIHJldHVybiAxIC8gMjAgKiAoXG4gICAgICB0aGlzLl9zdGFydC54ICogKCA2ICogdGhpcy5fY29udHJvbDEueSArIDMgKiB0aGlzLl9jb250cm9sMi55ICsgdGhpcy5fZW5kLnkgKSArXG4gICAgICB0aGlzLl9jb250cm9sMS54ICogKCAtNiAqIHRoaXMuX3N0YXJ0LnkgKyAzICogdGhpcy5fY29udHJvbDIueSArIDMgKiB0aGlzLl9lbmQueSApICtcbiAgICAgIHRoaXMuX2NvbnRyb2wyLnggKiAoIC0zICogdGhpcy5fc3RhcnQueSAtIDMgKiB0aGlzLl9jb250cm9sMS55ICsgNiAqIHRoaXMuX2VuZC55ICkgK1xuICAgICAgdGhpcy5fZW5kLnggKiAoIC10aGlzLl9zdGFydC55IC0gMyAqIHRoaXMuX2NvbnRyb2wxLnkgLSA2ICogdGhpcy5fY29udHJvbDIueSApXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZWQgY29weSBvZiB0aGlzIHNlZ21lbnQgKG1hcHBpbmcgdGhlIHBhcmFtZXRyaXphdGlvbiBmcm9tIFswLDFdID0+IFsxLDBdKS5cbiAgICovXG4gIHB1YmxpYyByZXZlcnNlZCgpOiBDdWJpYyB7XG4gICAgcmV0dXJuIG5ldyBDdWJpYyggdGhpcy5fZW5kLCB0aGlzLl9jb250cm9sMiwgdGhpcy5fY29udHJvbDEsIHRoaXMuX3N0YXJ0ICk7XG4gIH1cblxuICAvKipcbiAgICogSWYgaXQgZXhpc3RzLCByZXR1cm5zIHRoZSBwb2ludCB3aGVyZSB0aGUgY3ViaWMgY3VydmUgc2VsZi1pbnRlcnNlY3RzLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIE51bGwgaWYgdGhlcmUgaXMgbm8gaW50ZXJzZWN0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0U2VsZkludGVyc2VjdGlvbigpOiBTZWdtZW50SW50ZXJzZWN0aW9uIHwgbnVsbCB7XG4gICAgLy8gV2Ugc3BsaXQgdGhlIGN1YmljIGludG8gbW9ub3RvbmUgc2VjdGlvbnMgKHdoaWNoIGNhbid0IHNlbGYtaW50ZXJzZWN0KSwgdGhlbiBjaGVjayB0aGVzZSBmb3IgaW50ZXJzZWN0aW9uc1xuICAgIGNvbnN0IHRFeHRyZW1lcyA9IHRoaXMuZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKTtcbiAgICBjb25zdCBmdWxsRXh0cmVtZXMgPSBbIDAgXS5jb25jYXQoIHRFeHRyZW1lcyApLmNvbmNhdCggWyAxIF0gKTtcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc3ViZGl2aXNpb25zKCB0RXh0cmVtZXMgKTtcbiAgICBpZiAoIHNlZ21lbnRzLmxlbmd0aCA8IDMgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGFTZWdtZW50ID0gc2VnbWVudHNbIGkgXTtcbiAgICAgIGZvciAoIGxldCBqID0gaSArIDE7IGogPCBzZWdtZW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY29uc3QgYlNlZ21lbnQgPSBzZWdtZW50c1sgaiBdO1xuXG4gICAgICAgIGNvbnN0IGludGVyc2VjdGlvbnMgPSBCb3VuZHNJbnRlcnNlY3Rpb24uaW50ZXJzZWN0KCBhU2VnbWVudCwgYlNlZ21lbnQgKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW50ZXJzZWN0aW9ucy5sZW5ndGggPCAyICk7XG5cbiAgICAgICAgaWYgKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCApIHtcbiAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyAwIF07XG4gICAgICAgICAgLy8gRXhjbHVkZSBlbmRwb2ludHMgb3ZlcmxhcHBpbmdcbiAgICAgICAgICBpZiAoIGludGVyc2VjdGlvbi5hVCA+IDFlLTcgJiYgaW50ZXJzZWN0aW9uLmFUIDwgKCAxIC0gMWUtNyApICYmXG4gICAgICAgICAgICAgICBpbnRlcnNlY3Rpb24uYlQgPiAxZS03ICYmIGludGVyc2VjdGlvbi5iVCA8ICggMSAtIDFlLTcgKSApIHtcbiAgICAgICAgICAgIC8vIFJlbWFwIHBhcmFtZXRyaWMgdmFsdWVzIGZyb20gdGhlIHN1YmRpdmlkZWQgc2VnbWVudHMgdG8gdGhlIG1haW4gc2VnbWVudFxuICAgICAgICAgICAgY29uc3QgYVQgPSBmdWxsRXh0cmVtZXNbIGkgXSArIGludGVyc2VjdGlvbi5hVCAqICggZnVsbEV4dHJlbWVzWyBpICsgMSBdIC0gZnVsbEV4dHJlbWVzWyBpIF0gKTtcbiAgICAgICAgICAgIGNvbnN0IGJUID0gZnVsbEV4dHJlbWVzWyBqIF0gKyBpbnRlcnNlY3Rpb24uYlQgKiAoIGZ1bGxFeHRyZW1lc1sgaiArIDEgXSAtIGZ1bGxFeHRyZW1lc1sgaiBdICk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGludGVyc2VjdGlvbi5wb2ludCwgYVQsIGJUICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBmb3JtIHRoYXQgY2FuIGJlIHR1cm5lZCBiYWNrIGludG8gYSBzZWdtZW50IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgZGVzZXJpYWxpemUgbWV0aG9kLlxuICAgKi9cbiAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemVkQ3ViaWMge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQ3ViaWMnLFxuICAgICAgc3RhcnRYOiB0aGlzLl9zdGFydC54LFxuICAgICAgc3RhcnRZOiB0aGlzLl9zdGFydC55LFxuICAgICAgY29udHJvbDFYOiB0aGlzLl9jb250cm9sMS54LFxuICAgICAgY29udHJvbDFZOiB0aGlzLl9jb250cm9sMS55LFxuICAgICAgY29udHJvbDJYOiB0aGlzLl9jb250cm9sMi54LFxuICAgICAgY29udHJvbDJZOiB0aGlzLl9jb250cm9sMi55LFxuICAgICAgZW5kWDogdGhpcy5fZW5kLngsXG4gICAgICBlbmRZOiB0aGlzLl9lbmQueVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGxpbmVzIG92ZXJsYXAgb3ZlciBhIGNvbnRpbnVvdXMgc2VjdGlvbiwgYW5kIGlmIHNvIGZpbmRzIHRoZSBhLGIgcGFpciBzdWNoIHRoYXRcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cbiAgICpcbiAgICogQHBhcmFtIHNlZ21lbnRcbiAgICogQHBhcmFtIFtlcHNpbG9uXSAtIFdpbGwgcmV0dXJuIG92ZXJsYXBzIG9ubHkgaWYgbm8gdHdvIGNvcnJlc3BvbmRpbmcgcG9pbnRzIGRpZmZlciBieSB0aGlzIGFtb3VudCBvciBtb3JlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgY29tcG9uZW50LlxuICAgKiBAcmV0dXJucyAtIFRoZSBzb2x1dGlvbiwgaWYgdGhlcmUgaXMgb25lIChhbmQgb25seSBvbmUpXG4gICAqL1xuICBwdWJsaWMgZ2V0T3ZlcmxhcHMoIHNlZ21lbnQ6IFNlZ21lbnQsIGVwc2lsb24gPSAxZS02ICk6IE92ZXJsYXBbXSB8IG51bGwge1xuICAgIGlmICggc2VnbWVudCBpbnN0YW5jZW9mIEN1YmljICkge1xuICAgICAgcmV0dXJuIEN1YmljLmdldE92ZXJsYXBzKCB0aGlzLCBzZWdtZW50ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIEN1YmljIGZyb20gdGhlIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG92ZXJyaWRlIGRlc2VyaWFsaXplKCBvYmo6IFNlcmlhbGl6ZWRDdWJpYyApOiBDdWJpYyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdDdWJpYycgKTtcblxuICAgIHJldHVybiBuZXcgQ3ViaWMoIG5ldyBWZWN0b3IyKCBvYmouc3RhcnRYLCBvYmouc3RhcnRZICksIG5ldyBWZWN0b3IyKCBvYmouY29udHJvbDFYLCBvYmouY29udHJvbDFZICksIG5ldyBWZWN0b3IyKCBvYmouY29udHJvbDJYLCBvYmouY29udHJvbDJZICksIG5ldyBWZWN0b3IyKCBvYmouZW5kWCwgb2JqLmVuZFkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHdoYXQgdCB2YWx1ZXMgdGhlIGN1YmljIGV4dHJlbWEgYXJlIGF0IChpZiBhbnkpLiBUaGlzIGlzIGp1c3QgdGhlIDEtZGltZW5zaW9uYWwgY2FzZSwgdXNlZCBmb3IgbXVsdGlwbGUgcHVycG9zZXNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZXh0cmVtYVQoIHYwOiBudW1iZXIsIHYxOiBudW1iZXIsIHYyOiBudW1iZXIsIHYzOiBudW1iZXIgKTogbnVtYmVyW10ge1xuICAgIGlmICggdjAgPT09IHYxICYmIHYwID09PSB2MiAmJiB2MCA9PT0gdjMgKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgLy8gY29lZmZpY2llbnRzIG9mIGRlcml2YXRpdmVcbiAgICBjb25zdCBhID0gLTMgKiB2MCArIDkgKiB2MSAtIDkgKiB2MiArIDMgKiB2MztcbiAgICBjb25zdCBiID0gNiAqIHYwIC0gMTIgKiB2MSArIDYgKiB2MjtcbiAgICBjb25zdCBjID0gLTMgKiB2MCArIDMgKiB2MTtcblxuICAgIHJldHVybiBfLmZpbHRlciggc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIGEsIGIsIGMgKSwgaXNCZXR3ZWVuMEFuZDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gQ3ViaWNzIG92ZXJsYXAgb3ZlciBhIGNvbnRpbnVvdXMgc2VjdGlvbiwgYW5kIGlmIHNvIGZpbmRzIHRoZSBhLGIgcGFpciBzdWNoIHRoYXRcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cbiAgICpcbiAgICogTk9URTogZm9yIHRoaXMgcGFydGljdWxhciBmdW5jdGlvbiwgd2UgYXNzdW1lIHdlJ3JlIG5vdCBkZWdlbmVyYXRlLiBUaGluZ3MgbWF5IHdvcmsgaWYgd2UgY2FuIGJlIGRlZ3JlZS1yZWR1Y2VkXG4gICAqIHRvIGEgcXVhZHJhdGljLCBidXQgZ2VuZXJhbGx5IHRoYXQgc2hvdWxkbid0IGJlIGRvbmUuXG4gICAqXG4gICAqIEBwYXJhbSBjdWJpYzFcbiAgICogQHBhcmFtIGN1YmljMlxuICAgKiBAcGFyYW0gW2Vwc2lsb25dIC0gV2lsbCByZXR1cm4gb3ZlcmxhcHMgb25seSBpZiBubyB0d28gY29ycmVzcG9uZGluZyBwb2ludHMgZGlmZmVyIGJ5IHRoaXMgYW1vdW50IG9yIG1vcmVcbiAgICogICAgICAgICAgICAgICAgICAgIGluIG9uZSBjb21wb25lbnQuXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3ZlcmxhcHMoIGN1YmljMTogQ3ViaWMsIGN1YmljMjogQ3ViaWMsIGVwc2lsb24gPSAxZS02ICk6IE92ZXJsYXBbXSB7XG5cbiAgICAvKlxuICAgICAqIEZvciBhIDEtZGltZW5zaW9uYWwgY3ViaWMgYmV6aWVyLCB3ZSBoYXZlIHRoZSBmb3JtdWxhOlxuICAgICAqXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgWyAgMCAgMCAgMCAgMCBdICAgWyBwMCBdXG4gICAgICogcCggdCApID0gWyAxIHQgdF4yIHReMyBdICogWyAtMyAgMyAgMCAgMCBdICogWyBwMSBdXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgWyAgMyAtNiAgMyAgMCBdICAgWyBwMiBdXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgWyAtMSAgMyAtMyAgMSBdICAgWyBwMyBdXG4gICAgICpcbiAgICAgKiB3aGVyZSBwMCxwMSxwMixwMyBhcmUgdGhlIGNvbnRyb2wgdmFsdWVzIChzdGFydCxjb250cm9sMSxjb250cm9sMixlbmQpLiBXZSB3YW50IHRvIHNlZSBpZiBhIGxpbmVhci1tYXBwZWQgY3ViaWM6XG4gICAgICpcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbIDEgYiBiXjIgIGJeMyAgXSAgIFsgIDAgIDAgIDAgIDAgXSAgIFsgcTAgXVxuICAgICAqIHAoIHQgKSA9PyBxKCBhICogdCArIGIgKSA9IFsgMSB0IHReMiB0XjMgXSAqIFsgMCBhIDJhYiAzYWJeMiBdICogWyAtMyAgMyAgMCAgMCBdICogWyBxMSBdXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWyAwIDAgYV4yIDNhXjJiIF0gICBbICAzIC02ICAzICAwIF0gICBbIHEyIF1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbIDAgMCAgMCAgIGFeMyAgXSAgIFsgLTEgIDMgLTMgIDEgXSAgIFsgcTMgXVxuICAgICAqXG4gICAgICogKGlzIGl0IGVxdWFsIHRvIHRoZSBzZWNvbmQgY3ViaWMgaWYgd2UgY2FuIGZpbmQgYSBsaW5lYXIgd2F5IHRvIG1hcCBpdHMgaW5wdXQgdC12YWx1ZT8pXG4gICAgICpcbiAgICAgKiBGb3Igc2ltcGxpY2l0eSBhbmQgZWZmaWNpZW5jeSwgd2UnbGwgcHJlY29tcHV0ZSB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhlIGJlemllciBtYXRyaXg6XG4gICAgICogWyBwMHMgXSAgICBbICAxICAgMCAgIDAgICAwIF0gICBbIHAwIF1cbiAgICAgKiBbIHAxcyBdID09IFsgLTMgICAzICAgMCAgIDAgXSAqIFsgcDEgXVxuICAgICAqIFsgcDJzIF0gICAgWyAgMyAgLTYgICAzICAgMCBdICAgWyBwMiBdXG4gICAgICogWyBwM3MgXSAgICBbIC0xICAgMyAgLTMgICAxIF0gICBbIHAzIF1cbiAgICAgKlxuICAgICAqIExlYXZpbmcgb3VyIGNvbXB1dGF0aW9uIHRvIHNvbHZlIGZvciBhLGIgc3VjaCB0aGF0OlxuICAgICAqXG4gICAgICogWyBwMHMgXSAgICBbIDEgYiBiXjIgIGJeMyAgXSAgIFsgcTBzIF1cbiAgICAgKiBbIHAxcyBdID09IFsgMCBhIDJhYiAzYWJeMiBdICogWyBxMXMgXVxuICAgICAqIFsgcDJzIF0gICAgWyAwIDAgYV4yIDNhXjJiIF0gICBbIHEycyBdXG4gICAgICogWyBwM3MgXSAgICBbIDAgMCAgMCAgIGFeMyAgXSAgIFsgcTNzIF1cbiAgICAgKlxuICAgICAqIFRoZSBzdWJwcm9ibGVtIG9mIGNvbXB1dGluZyBwb3NzaWJsZSBhLGIgcGFpcnMgd2lsbCBiZSBsZWZ0IHRvIFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBDdWJpYyBhbmQgaXRzXG4gICAgICogcmVkdWN0aW9ucyAoaWYgcDNzL3EzcyBhcmUgemVybywgdGhleSBhcmVuJ3QgZnVsbHkgY3ViaWMgYmV6aWVycyBhbmQgY2FuIGJlIGRlZ3JlZSByZWR1Y2VkLCB3aGljaCBpcyBoYW5kbGVkKS5cbiAgICAgKlxuICAgICAqIFRoZW4sIGdpdmVuIGFuIGEsYiBwYWlyLCB3ZSBuZWVkIHRvIGVuc3VyZSB0aGUgYWJvdmUgZm9ybXVsYSBpcyBzYXRpc2ZpZWQgKGFwcHJveGltYXRlbHksIGR1ZSB0byBmbG9hdGluZy1wb2ludFxuICAgICAqIGFyaXRobWV0aWMpLlxuICAgICAqL1xuXG4gICAgY29uc3Qgbm9PdmVybGFwOiBPdmVybGFwW10gPSBbXTtcblxuICAgIC8vIEVmZmljaWVudGx5IGNvbXB1dGUgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoZSBiZXppZXIgbWF0cml4OlxuICAgIGNvbnN0IHAweCA9IGN1YmljMS5fc3RhcnQueDtcbiAgICBjb25zdCBwMXggPSAtMyAqIGN1YmljMS5fc3RhcnQueCArIDMgKiBjdWJpYzEuX2NvbnRyb2wxLng7XG4gICAgY29uc3QgcDJ4ID0gMyAqIGN1YmljMS5fc3RhcnQueCAtIDYgKiBjdWJpYzEuX2NvbnRyb2wxLnggKyAzICogY3ViaWMxLl9jb250cm9sMi54O1xuICAgIGNvbnN0IHAzeCA9IC0xICogY3ViaWMxLl9zdGFydC54ICsgMyAqIGN1YmljMS5fY29udHJvbDEueCAtIDMgKiBjdWJpYzEuX2NvbnRyb2wyLnggKyBjdWJpYzEuX2VuZC54O1xuICAgIGNvbnN0IHAweSA9IGN1YmljMS5fc3RhcnQueTtcbiAgICBjb25zdCBwMXkgPSAtMyAqIGN1YmljMS5fc3RhcnQueSArIDMgKiBjdWJpYzEuX2NvbnRyb2wxLnk7XG4gICAgY29uc3QgcDJ5ID0gMyAqIGN1YmljMS5fc3RhcnQueSAtIDYgKiBjdWJpYzEuX2NvbnRyb2wxLnkgKyAzICogY3ViaWMxLl9jb250cm9sMi55O1xuICAgIGNvbnN0IHAzeSA9IC0xICogY3ViaWMxLl9zdGFydC55ICsgMyAqIGN1YmljMS5fY29udHJvbDEueSAtIDMgKiBjdWJpYzEuX2NvbnRyb2wyLnkgKyBjdWJpYzEuX2VuZC55O1xuICAgIGNvbnN0IHEweCA9IGN1YmljMi5fc3RhcnQueDtcbiAgICBjb25zdCBxMXggPSAtMyAqIGN1YmljMi5fc3RhcnQueCArIDMgKiBjdWJpYzIuX2NvbnRyb2wxLng7XG4gICAgY29uc3QgcTJ4ID0gMyAqIGN1YmljMi5fc3RhcnQueCAtIDYgKiBjdWJpYzIuX2NvbnRyb2wxLnggKyAzICogY3ViaWMyLl9jb250cm9sMi54O1xuICAgIGNvbnN0IHEzeCA9IC0xICogY3ViaWMyLl9zdGFydC54ICsgMyAqIGN1YmljMi5fY29udHJvbDEueCAtIDMgKiBjdWJpYzIuX2NvbnRyb2wyLnggKyBjdWJpYzIuX2VuZC54O1xuICAgIGNvbnN0IHEweSA9IGN1YmljMi5fc3RhcnQueTtcbiAgICBjb25zdCBxMXkgPSAtMyAqIGN1YmljMi5fc3RhcnQueSArIDMgKiBjdWJpYzIuX2NvbnRyb2wxLnk7XG4gICAgY29uc3QgcTJ5ID0gMyAqIGN1YmljMi5fc3RhcnQueSAtIDYgKiBjdWJpYzIuX2NvbnRyb2wxLnkgKyAzICogY3ViaWMyLl9jb250cm9sMi55O1xuICAgIGNvbnN0IHEzeSA9IC0xICogY3ViaWMyLl9zdGFydC55ICsgMyAqIGN1YmljMi5fY29udHJvbDEueSAtIDMgKiBjdWJpYzIuX2NvbnRyb2wyLnkgKyBjdWJpYzIuX2VuZC55O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBjYW5kaWRhdGUgb3ZlcmxhcCAocHJlZmVycmluZyB0aGUgZGltZW5zaW9uIHdpdGggdGhlIGxhcmdlc3QgdmFyaWF0aW9uKVxuICAgIGNvbnN0IHhTcHJlYWQgPSBNYXRoLmFicyggTWF0aC5tYXgoIGN1YmljMS5fc3RhcnQueCwgY3ViaWMxLl9jb250cm9sMS54LCBjdWJpYzEuX2NvbnRyb2wyLngsIGN1YmljMS5fZW5kLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1YmljMS5fc3RhcnQueCwgY3ViaWMxLl9jb250cm9sMS54LCBjdWJpYzEuX2NvbnRyb2wyLngsIGN1YmljMS5fZW5kLnggKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbiggY3ViaWMxLl9zdGFydC54LCBjdWJpYzEuX2NvbnRyb2wxLngsIGN1YmljMS5fY29udHJvbDIueCwgY3ViaWMxLl9lbmQueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ViaWMxLl9zdGFydC54LCBjdWJpYzEuX2NvbnRyb2wxLngsIGN1YmljMS5fY29udHJvbDIueCwgY3ViaWMxLl9lbmQueCApICk7XG4gICAgY29uc3QgeVNwcmVhZCA9IE1hdGguYWJzKCBNYXRoLm1heCggY3ViaWMxLl9zdGFydC55LCBjdWJpYzEuX2NvbnRyb2wxLnksIGN1YmljMS5fY29udHJvbDIueSwgY3ViaWMxLl9lbmQueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3ViaWMxLl9zdGFydC55LCBjdWJpYzEuX2NvbnRyb2wxLnksIGN1YmljMS5fY29udHJvbDIueSwgY3ViaWMxLl9lbmQueSApIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKCBjdWJpYzEuX3N0YXJ0LnksIGN1YmljMS5fY29udHJvbDEueSwgY3ViaWMxLl9jb250cm9sMi55LCBjdWJpYzEuX2VuZC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdWJpYzEuX3N0YXJ0LnksIGN1YmljMS5fY29udHJvbDEueSwgY3ViaWMxLl9jb250cm9sMi55LCBjdWJpYzEuX2VuZC55ICkgKTtcbiAgICBjb25zdCB4T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBDdWJpYyggcDB4LCBwMXgsIHAyeCwgcDN4LCBxMHgsIHExeCwgcTJ4LCBxM3ggKTtcbiAgICBjb25zdCB5T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBDdWJpYyggcDB5LCBwMXksIHAyeSwgcDN5LCBxMHksIHExeSwgcTJ5LCBxM3kgKTtcbiAgICBsZXQgb3ZlcmxhcDtcbiAgICBpZiAoIHhTcHJlYWQgPiB5U3ByZWFkICkge1xuICAgICAgb3ZlcmxhcCA9ICggeE92ZXJsYXAgPT09IG51bGwgfHwgeE92ZXJsYXAgPT09IHRydWUgKSA/IHlPdmVybGFwIDogeE92ZXJsYXA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgb3ZlcmxhcCA9ICggeU92ZXJsYXAgPT09IG51bGwgfHwgeU92ZXJsYXAgPT09IHRydWUgKSA/IHhPdmVybGFwIDogeU92ZXJsYXA7XG4gICAgfVxuICAgIGlmICggb3ZlcmxhcCA9PT0gbnVsbCB8fCBvdmVybGFwID09PSB0cnVlICkge1xuICAgICAgcmV0dXJuIG5vT3ZlcmxhcDsgLy8gTm8gd2F5IHRvIHBpbiBkb3duIGFuIG92ZXJsYXBcbiAgICB9XG5cbiAgICBjb25zdCBhID0gb3ZlcmxhcC5hO1xuICAgIGNvbnN0IGIgPSBvdmVybGFwLmI7XG5cbiAgICAvLyBQcmVtdWx0aXBseSBhIGZldyB2YWx1ZXNcbiAgICBjb25zdCBhYSA9IGEgKiBhO1xuICAgIGNvbnN0IGFhYSA9IGEgKiBhICogYTtcbiAgICBjb25zdCBiYiA9IGIgKiBiO1xuICAgIGNvbnN0IGJiYiA9IGIgKiBiICogYjtcbiAgICBjb25zdCBhYjIgPSAyICogYSAqIGI7XG4gICAgY29uc3QgYWJiMyA9IDMgKiBhICogYmI7XG4gICAgY29uc3QgYWFiMyA9IDMgKiBhYSAqIGI7XG5cbiAgICAvLyBDb21wdXRlIGN1YmljIGNvZWZmaWNpZW50cyBmb3IgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBwKHQpIGFuZCBxKGEqdCtiKVxuICAgIGNvbnN0IGQweCA9IHEweCArIGIgKiBxMXggKyBiYiAqIHEyeCArIGJiYiAqIHEzeCAtIHAweDtcbiAgICBjb25zdCBkMXggPSBhICogcTF4ICsgYWIyICogcTJ4ICsgYWJiMyAqIHEzeCAtIHAxeDtcbiAgICBjb25zdCBkMnggPSBhYSAqIHEyeCArIGFhYjMgKiBxM3ggLSBwMng7XG4gICAgY29uc3QgZDN4ID0gYWFhICogcTN4IC0gcDN4O1xuICAgIGNvbnN0IGQweSA9IHEweSArIGIgKiBxMXkgKyBiYiAqIHEyeSArIGJiYiAqIHEzeSAtIHAweTtcbiAgICBjb25zdCBkMXkgPSBhICogcTF5ICsgYWIyICogcTJ5ICsgYWJiMyAqIHEzeSAtIHAxeTtcbiAgICBjb25zdCBkMnkgPSBhYSAqIHEyeSArIGFhYjMgKiBxM3kgLSBwMnk7XG4gICAgY29uc3QgZDN5ID0gYWFhICogcTN5IC0gcDN5O1xuXG4gICAgLy8gRmluZCB0aGUgdCB2YWx1ZXMgd2hlcmUgZXh0cmVtZXMgbGllIGluIHRoZSBbMCwxXSByYW5nZSBmb3IgZWFjaCAxLWRpbWVuc2lvbmFsIGN1YmljLiBXZSBkbyB0aGlzIGJ5XG4gICAgLy8gZGlmZmVyZW50aWF0aW5nIHRoZSBjdWJpYyBhbmQgZmluZGluZyB0aGUgcm9vdHMgb2YgdGhlIHJlc3VsdGluZyBxdWFkcmF0aWMuXG4gICAgY29uc3QgeFJvb3RzID0gVXRpbHMuc29sdmVRdWFkcmF0aWNSb290c1JlYWwoIDMgKiBkM3gsIDIgKiBkMngsIGQxeCApO1xuICAgIGNvbnN0IHlSb290cyA9IFV0aWxzLnNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCAzICogZDN5LCAyICogZDJ5LCBkMXkgKTtcbiAgICBjb25zdCB4RXh0cmVtZVRzID0gXy51bmlxKCBbIDAsIDEgXS5jb25jYXQoIHhSb290cyAhPT0gbnVsbCA/IHhSb290cy5maWx0ZXIoIGlzQmV0d2VlbjBBbmQxICkgOiBbXSApICk7XG4gICAgY29uc3QgeUV4dHJlbWVUcyA9IF8udW5pcSggWyAwLCAxIF0uY29uY2F0KCB5Um9vdHMgIT09IG51bGwgPyB5Um9vdHMuZmlsdGVyKCBpc0JldHdlZW4wQW5kMSApIDogW10gKSApO1xuXG4gICAgLy8gRXhhbWluZSB0aGUgc2luZ2xlLWNvb3JkaW5hdGUgZGlzdGFuY2VzIGJldHdlZW4gdGhlIFwib3ZlcmxhcHNcIiBhdCBlYWNoIGV4dHJlbWUgVCB2YWx1ZS4gSWYgdGhlIGRpc3RhbmNlIGlzIGxhcmdlclxuICAgIC8vIHRoYW4gb3VyIGVwc2lsb24sIHRoZW4gdGhlIFwib3ZlcmxhcFwiIHdvdWxkIG5vdCBiZSB2YWxpZC5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB4RXh0cmVtZVRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdCA9IHhFeHRyZW1lVHNbIGkgXTtcbiAgICAgIGlmICggTWF0aC5hYnMoICggKCBkM3ggKiB0ICsgZDJ4ICkgKiB0ICsgZDF4ICkgKiB0ICsgZDB4ICkgPiBlcHNpbG9uICkge1xuICAgICAgICByZXR1cm4gbm9PdmVybGFwO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB5RXh0cmVtZVRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdCA9IHlFeHRyZW1lVHNbIGkgXTtcbiAgICAgIGlmICggTWF0aC5hYnMoICggKCBkM3kgKiB0ICsgZDJ5ICkgKiB0ICsgZDF5ICkgKiB0ICsgZDB5ICkgPiBlcHNpbG9uICkge1xuICAgICAgICByZXR1cm4gbm9PdmVybGFwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHF0MCA9IGI7XG4gICAgY29uc3QgcXQxID0gYSArIGI7XG5cbiAgICAvLyBUT0RPOiBkbyB3ZSB3YW50IGFuIGVwc2lsb24gaW4gaGVyZSB0byBiZSBwZXJtaXNzaXZlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBpZiAoICggcXQwID4gMSAmJiBxdDEgPiAxICkgfHwgKCBxdDAgPCAwICYmIHF0MSA8IDAgKSApIHtcbiAgICAgIHJldHVybiBub092ZXJsYXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIFsgbmV3IE92ZXJsYXAoIGEsIGIgKSBdO1xuICB9XG5cbiAgLy8gRGVncmVlIG9mIHRoaXMgcG9seW5vbWlhbCAoY3ViaWMpXG4gIHB1YmxpYyBkZWdyZWUhOiBudW1iZXI7XG59XG5cbkN1YmljLnByb3RvdHlwZS5kZWdyZWUgPSAzO1xuXG5raXRlLnJlZ2lzdGVyKCAnQ3ViaWMnLCBDdWJpYyApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIkJvdW5kc0ludGVyc2VjdGlvbiIsImtpdGUiLCJMaW5lIiwiT3ZlcmxhcCIsIlF1YWRyYXRpYyIsIlJheUludGVyc2VjdGlvbiIsIlNlZ21lbnQiLCJTZWdtZW50SW50ZXJzZWN0aW9uIiwic3ZnTnVtYmVyIiwic29sdmVRdWFkcmF0aWNSb290c1JlYWwiLCJzb2x2ZUN1YmljUm9vdHNSZWFsIiwiYXJlUG9pbnRzQ29sbGluZWFyIiwic2NyYXRjaFZlY3RvcjEiLCJzY3JhdGNoVmVjdG9yMiIsInNjcmF0Y2hWZWN0b3IzIiwiaXNCZXR3ZWVuMEFuZDEiLCJ0IiwiQ3ViaWMiLCJzZXRTdGFydCIsInN0YXJ0IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJ0b1N0cmluZyIsIl9zdGFydCIsImVxdWFscyIsImludmFsaWRhdGUiLCJ2YWx1ZSIsImdldFN0YXJ0Iiwic2V0Q29udHJvbDEiLCJjb250cm9sMSIsIl9jb250cm9sMSIsImdldENvbnRyb2wxIiwic2V0Q29udHJvbDIiLCJjb250cm9sMiIsIl9jb250cm9sMiIsImdldENvbnRyb2wyIiwic2V0RW5kIiwiZW5kIiwiX2VuZCIsImdldEVuZCIsInBvc2l0aW9uQXQiLCJtdCIsIm1tbSIsIm1tdCIsIm10dCIsInR0dCIsIngiLCJ5IiwidGFuZ2VudEF0IiwicmVzdWx0Iiwic2V0IiwibXVsdGlwbHlTY2FsYXIiLCJhZGQiLCJjdXJ2YXR1cmVBdCIsImVwc2lsb24iLCJNYXRoIiwiYWJzIiwiaXNaZXJvIiwicDAiLCJwMSIsInAyIiwiZDEwIiwibWludXMiLCJhIiwibWFnbml0dWRlIiwiaCIsInBlcnBlbmRpY3VsYXIiLCJub3JtYWxpemVkIiwiZG90IiwiZGVncmVlIiwic3ViZGl2aWRlZCIsImxlZnQiLCJibGVuZCIsInJpZ2h0IiwibWlkZGxlIiwibGVmdE1pZCIsInJpZ2h0TWlkIiwibWlkIiwiX3N0YXJ0VGFuZ2VudCIsIl9lbmRUYW5nZW50IiwiX3IiLCJfcyIsIl90Q3VzcCIsIl90RGV0ZXJtaW5hbnQiLCJfdEluZmxlY3Rpb24xIiwiX3RJbmZsZWN0aW9uMiIsIl9xdWFkcmF0aWNzIiwiX3hFeHRyZW1hVCIsIl95RXh0cmVtYVQiLCJfYm91bmRzIiwiX3N2Z1BhdGhGcmFnbWVudCIsImludmFsaWRhdGlvbkVtaXR0ZXIiLCJlbWl0IiwiZ2V0U3RhcnRUYW5nZW50Iiwic3RhcnRUYW5nZW50IiwiZ2V0RW5kVGFuZ2VudCIsImVuZFRhbmdlbnQiLCJnZXRSIiwiciIsImdldFMiLCJzIiwiZ2V0VEN1c3AiLCJjb21wdXRlQ3VzcEluZm8iLCJ0Q3VzcCIsImdldFREZXRlcm1pbmFudCIsInREZXRlcm1pbmFudCIsImdldFRJbmZsZWN0aW9uMSIsInRJbmZsZWN0aW9uMSIsImdldFRJbmZsZWN0aW9uMiIsInRJbmZsZWN0aW9uMiIsImdldFF1YWRyYXRpY3MiLCJjb21wdXRlQ3VzcFNlZ21lbnRzIiwiZ2V0WEV4dHJlbWFUIiwiZXh0cmVtYVQiLCJ4RXh0cmVtYVQiLCJnZXRZRXh0cmVtYVQiLCJ5RXh0cmVtYVQiLCJnZXRCb3VuZHMiLCJOT1RISU5HIiwid2l0aFBvaW50IiwiXyIsImVhY2giLCJoYXNDdXNwIiwiYm91bmRzIiwidGltZXMiLCJwbHVzIiwiYiIsImMiLCJhUGVycCIsImJQZXJwIiwiYVBlcnBEb3RCIiwic3FydERldCIsInNxcnQiLCJOYU4iLCJwdXNoIiwic3ViZGl2aWRlZEF0Q3VzcCIsImdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cyIsInJlZHVjZWQiLCJkZWdyZWVSZWR1Y2VkIiwiZmxhdHRlbiIsIm1hcCIsInF1YWRyYXRpYyIsImVxdWFsc0Vwc2lsb24iLCJleHRyZW1hUG9pbnRzIiwiY29uY2F0Iiwic29ydCIsInNlZ21lbnRzIiwibGFzdFBvaW50IiwibGVuZ3RoIiwiaSIsInNlZ21lbnQiLCJ0b1JTIiwicG9pbnQiLCJmaXJzdFZlY3RvciIsIm9mZnNldFRvIiwicmV2ZXJzZSIsInF1YW50aXR5IiwicG9pbnRzIiwiZ2V0U1ZHUGF0aEZyYWdtZW50Iiwib2xkUGF0aEZyYWdtZW50Iiwic3Ryb2tlTGVmdCIsImxpbmVXaWR0aCIsInN0cm9rZVJpZ2h0IiwiZ2V0SW50ZXJpb3JFeHRyZW1hVHMiLCJ0cyIsImV2ZXJ5Iiwib3RoZXJUIiwiaW50ZXJzZWN0aW9uIiwicmF5IiwiaW52ZXJzZU1hdHJpeCIsInJvdGF0aW9uMiIsImRpcmVjdGlvbiIsImFuZ2xlIiwidGltZXNNYXRyaXgiLCJ0cmFuc2xhdGlvbiIsInBvc2l0aW9uIiwidGltZXNWZWN0b3IyIiwicDMiLCJkIiwiaGl0UG9pbnQiLCJ1bml0VGFuZ2VudCIsInBlcnAiLCJ0b0hpdCIsIm5vcm1hbCIsIm5lZ2F0ZWQiLCJ3aW5kIiwid2luZGluZ0ludGVyc2VjdGlvbiIsImhpdHMiLCJoaXQiLCJ3cml0ZVRvQ29udGV4dCIsImNvbnRleHQiLCJiZXppZXJDdXJ2ZVRvIiwidHJhbnNmb3JtZWQiLCJtYXRyaXgiLCJjb250cm9sQSIsInN1YnRyYWN0IiwiZGl2aWRlU2NhbGFyIiwiY29udHJvbEIiLCJkaWZmZXJlbmNlIiwiYXZlcmFnZSIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsInJldmVyc2VkIiwiZ2V0U2VsZkludGVyc2VjdGlvbiIsInRFeHRyZW1lcyIsImZ1bGxFeHRyZW1lcyIsInN1YmRpdmlzaW9ucyIsImFTZWdtZW50IiwiaiIsImJTZWdtZW50IiwiaW50ZXJzZWN0aW9ucyIsImludGVyc2VjdCIsImFUIiwiYlQiLCJzZXJpYWxpemUiLCJ0eXBlIiwic3RhcnRYIiwic3RhcnRZIiwiY29udHJvbDFYIiwiY29udHJvbDFZIiwiY29udHJvbDJYIiwiY29udHJvbDJZIiwiZW5kWCIsImVuZFkiLCJnZXRPdmVybGFwcyIsImRlc2VyaWFsaXplIiwib2JqIiwidjAiLCJ2MSIsInYyIiwidjMiLCJmaWx0ZXIiLCJjdWJpYzEiLCJjdWJpYzIiLCJub092ZXJsYXAiLCJwMHgiLCJwMXgiLCJwMngiLCJwM3giLCJwMHkiLCJwMXkiLCJwMnkiLCJwM3kiLCJxMHgiLCJxMXgiLCJxMngiLCJxM3giLCJxMHkiLCJxMXkiLCJxMnkiLCJxM3kiLCJ4U3ByZWFkIiwibWF4IiwibWluIiwieVNwcmVhZCIsInhPdmVybGFwIiwicG9seW5vbWlhbEdldE92ZXJsYXBDdWJpYyIsInlPdmVybGFwIiwib3ZlcmxhcCIsImFhIiwiYWFhIiwiYmIiLCJiYmIiLCJhYjIiLCJhYmIzIiwiYWFiMyIsImQweCIsImQxeCIsImQyeCIsImQzeCIsImQweSIsImQxeSIsImQyeSIsImQzeSIsInhSb290cyIsInlSb290cyIsInhFeHRyZW1lVHMiLCJ1bmlxIiwieUV4dHJlbWVUcyIsInF0MCIsInF0MSIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUVqRCxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsU0FBUyxFQUFFQyxlQUFlLEVBQUVDLE9BQU8sRUFBRUMsbUJBQW1CLEVBQUVDLFNBQVMsUUFBUSxnQkFBZ0I7QUFFN0ksTUFBTUMsMEJBQTBCWCxNQUFNVyx1QkFBdUIsRUFBRSwyQ0FBMkM7QUFDMUcsTUFBTUMsc0JBQXNCWixNQUFNWSxtQkFBbUIsRUFBRSwyQ0FBMkM7QUFDbEcsTUFBTUMscUJBQXFCYixNQUFNYSxrQkFBa0IsRUFBRSxrQ0FBa0M7QUFFdkYsdUVBQXVFO0FBQ3ZFLE1BQU1DLGlCQUFpQixJQUFJYixRQUFTLEdBQUc7QUFDdkMsTUFBTWMsaUJBQWlCLElBQUlkLFFBQVMsR0FBRztBQUN2QyxNQUFNZSxpQkFBaUIsSUFBSWYsUUFBUyxHQUFHO0FBRXZDLDJCQUEyQjtBQUMzQixTQUFTZ0IsZUFBZ0JDLENBQVM7SUFDaEMsT0FBT0EsS0FBSyxLQUFLQSxLQUFLO0FBQ3hCO0FBY2UsSUFBQSxBQUFNQyxRQUFOLE1BQU1BLGNBQWNYO0lBNENqQzs7R0FFQyxHQUNELEFBQU9ZLFNBQVVDLEtBQWMsRUFBUztRQUN0Q0MsVUFBVUEsT0FBUUQsTUFBTUUsUUFBUSxJQUFJLENBQUMsOEJBQThCLEVBQUVGLE1BQU1HLFFBQVEsSUFBSTtRQUV2RixJQUFLLENBQUMsSUFBSSxDQUFDQyxNQUFNLENBQUNDLE1BQU0sQ0FBRUwsUUFBVTtZQUNs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