// Copyright 2013-2024, University of Colorado Boulder
/**
 * Quadratic Bezier segment
 *
 * Good reference: http://cagd.cs.byu.edu/~557/text/ch2.pdf
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Cubic, kite, Line, Overlap, RayIntersection, Segment, svgNumber } from '../imports.js';
// constants
const solveQuadraticRootsReal = Utils.solveQuadraticRootsReal;
const arePointsCollinear = Utils.arePointsCollinear;
// Used in multiple filters
function isBetween0And1(t) {
    return t >= 0 && t <= 1;
}
let Quadratic = class Quadratic extends Segment {
    /**
   * Sets the start point of the Quadratic.
   */ setStart(start) {
        assert && assert(start.isFinite(), `Quadratic start should be finite: ${start.toString()}`);
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
   * Returns the start of this Quadratic.
   */ getStart() {
        return this._start;
    }
    /**
   * Sets the control point of the Quadratic.
   */ setControl(control) {
        assert && assert(control.isFinite(), `Quadratic control should be finite: ${control.toString()}`);
        if (!this._control.equals(control)) {
            this._control = control;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set control(value) {
        this.setControl(value);
    }
    get control() {
        return this.getControl();
    }
    /**
   * Returns the control point of this Quadratic.
   */ getControl() {
        return this._control;
    }
    /**
   * Sets the end point of the Quadratic.
   */ setEnd(end) {
        assert && assert(end.isFinite(), `Quadratic end should be finite: ${end.toString()}`);
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
   * Returns the end of this Quadratic.
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
        const mt = 1 - t;
        // described from t=[0,1] as: (1-t)^2 start + 2(1-t)t control + t^2 end
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        return this._start.times(mt * mt).plus(this._control.times(2 * mt * t)).plus(this._end.times(t * t));
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
        // For a quadratic curve, the derivative is given by : 2(1-t)( control - start ) + 2t( end - control )
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        return this._control.minus(this._start).times(2 * (1 - t)).plus(this._end.minus(this._control).times(2 * t));
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
        // TODO: remove code duplication with Cubic https://github.com/phetsims/kite/issues/76
        const epsilon = 0.0000001;
        if (Math.abs(t - 0.5) > 0.5 - epsilon) {
            const isZero = t < 0.5;
            const p0 = isZero ? this._start : this._end;
            const p1 = this._control;
            const p2 = isZero ? this._end : this._start;
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
        const leftMid = this._start.blend(this._control, t);
        const rightMid = this._control.blend(this._end, t);
        const mid = leftMid.blend(rightMid, t);
        return [
            new Quadratic(this._start, leftMid, mid),
            new Quadratic(mid, rightMid, this._end)
        ];
    }
    /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */ invalidate() {
        assert && assert(this._start instanceof Vector2, `Quadratic start should be a Vector2: ${this._start}`);
        assert && assert(this._start.isFinite(), `Quadratic start should be finite: ${this._start.toString()}`);
        assert && assert(this._control instanceof Vector2, `Quadratic control should be a Vector2: ${this._control}`);
        assert && assert(this._control.isFinite(), `Quadratic control should be finite: ${this._control.toString()}`);
        assert && assert(this._end instanceof Vector2, `Quadratic end should be a Vector2: ${this._end}`);
        assert && assert(this._end.isFinite(), `Quadratic end should be finite: ${this._end.toString()}`);
        // Lazily-computed derived information
        this._startTangent = null;
        this._endTangent = null;
        this._tCriticalX = null;
        this._tCriticalY = null;
        this._bounds = null;
        this._svgPathFragment = null;
        this.invalidationEmitter.emit();
    }
    /**
   * Returns the tangent vector (normalized) to the segment at the start, pointing in the direction of motion (from start to end)
   */ getStartTangent() {
        if (this._startTangent === null) {
            const controlIsStart = this._start.equals(this._control);
            // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
            this._startTangent = controlIsStart ? this._end.minus(this._start).normalized() : this._control.minus(this._start).normalized();
        }
        return this._startTangent;
    }
    get startTangent() {
        return this.getStartTangent();
    }
    /**
   * Returns the tangent vector (normalized) to the segment at the end, pointing in the direction of motion (from start to end)
   */ getEndTangent() {
        if (this._endTangent === null) {
            const controlIsEnd = this._end.equals(this._control);
            // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
            this._endTangent = controlIsEnd ? this._end.minus(this._start).normalized() : this._end.minus(this._control).normalized();
        }
        return this._endTangent;
    }
    get endTangent() {
        return this.getEndTangent();
    }
    getTCriticalX() {
        // compute x where the derivative is 0 (used for bounds and other things)
        if (this._tCriticalX === null) {
            this._tCriticalX = Quadratic.extremaT(this._start.x, this._control.x, this._end.x);
        }
        return this._tCriticalX;
    }
    get tCriticalX() {
        return this.getTCriticalX();
    }
    getTCriticalY() {
        // compute y where the derivative is 0 (used for bounds and other things)
        if (this._tCriticalY === null) {
            this._tCriticalY = Quadratic.extremaT(this._start.y, this._control.y, this._end.y);
        }
        return this._tCriticalY;
    }
    get tCriticalY() {
        return this.getTCriticalY();
    }
    /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */ getNondegenerateSegments() {
        const start = this._start;
        const control = this._control;
        const end = this._end;
        const startIsEnd = start.equals(end);
        const startIsControl = start.equals(control);
        const endIsControl = start.equals(control);
        if (startIsEnd && startIsControl) {
            // all same points
            return [];
        } else if (startIsEnd) {
            // this is a special collinear case, we basically line out to the farthest point and back
            const halfPoint = this.positionAt(0.5);
            return [
                new Line(start, halfPoint),
                new Line(halfPoint, end)
            ];
        } else if (arePointsCollinear(start, control, end)) {
            // if they are collinear, we can reduce to start->control and control->end, or if control is between, just one line segment
            // also, start !== end (handled earlier)
            if (startIsControl || endIsControl) {
                // just a line segment!
                return [
                    new Line(start, end)
                ]; // no extra nondegenerate check since start !== end
            }
            // now control point must be unique. we check to see if our rendered path will be outside of the start->end line segment
            const delta = end.minus(start);
            const p1d = control.minus(start).dot(delta.normalized()) / delta.magnitude;
            const t = Quadratic.extremaT(0, p1d, 1);
            if (!isNaN(t) && t > 0 && t < 1) {
                // we have a local max inside the range, indicating that our extrema point is outside of start->end
                // we'll line to and from it
                const pt = this.positionAt(t);
                return _.flatten([
                    new Line(start, pt).getNondegenerateSegments(),
                    new Line(pt, end).getNondegenerateSegments()
                ]);
            } else {
                // just provide a line segment, our rendered path doesn't go outside of this
                return [
                    new Line(start, end)
                ]; // no extra nondegenerate check since start !== end
            }
        } else {
            return [
                this
            ];
        }
    }
    /**
   * Returns the bounds of this segment.
   */ getBounds() {
        // calculate our temporary guaranteed lower bounds based on the end points
        if (this._bounds === null) {
            this._bounds = new Bounds2(Math.min(this._start.x, this._end.x), Math.min(this._start.y, this._end.y), Math.max(this._start.x, this._end.x), Math.max(this._start.y, this._end.y));
            // compute x and y where the derivative is 0, so we can include this in the bounds
            const tCriticalX = this.getTCriticalX();
            const tCriticalY = this.getTCriticalY();
            if (!isNaN(tCriticalX) && tCriticalX > 0 && tCriticalX < 1) {
                this._bounds = this._bounds.withPoint(this.positionAt(tCriticalX));
            }
            if (!isNaN(tCriticalY) && tCriticalY > 0 && tCriticalY < 1) {
                this._bounds = this._bounds.withPoint(this.positionAt(tCriticalY));
            }
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    // see http://www.visgraf.impa.br/sibgrapi96/trabs/pdf/a14.pdf
    // and http://math.stackexchange.com/questions/12186/arc-length-of-bezier-curves for curvature / arc length
    /**
   * Returns an array of quadratic that are offset to this quadratic by a distance r
   *
   * @param r - distance
   * @param reverse
   */ offsetTo(r, reverse) {
        // TODO: implement more accurate method at http://www.antigrain.com/research/adaptive_bezier/index.html https://github.com/phetsims/kite/issues/76
        // TODO: or more recently (and relevantly): http://www.cis.usouthal.edu/~hain/general/Publications/Bezier/BezierFlattening.pdf https://github.com/phetsims/kite/issues/76
        let curves = [
            this
        ];
        // subdivide this curve
        const depth = 5; // generates 2^depth curves
        for(let i = 0; i < depth; i++){
            curves = _.flatten(_.map(curves, (curve)=>curve.subdivided(0.5)));
        }
        let offsetCurves = _.map(curves, (curve)=>curve.approximateOffset(r));
        if (reverse) {
            offsetCurves.reverse();
            offsetCurves = _.map(offsetCurves, (curve)=>curve.reversed());
        }
        return offsetCurves;
    }
    /**
   * Elevation of this quadratic Bezier curve to a cubic Bezier curve
   */ degreeElevated() {
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        return new Cubic(this._start, this._start.plus(this._control.timesScalar(2)).dividedScalar(3), this._end.plus(this._control.timesScalar(2)).dividedScalar(3), this._end);
    }
    /**
   * @param r - distance
   */ approximateOffset(r) {
        return new Quadratic(this._start.plus((this._start.equals(this._control) ? this._end.minus(this._start) : this._control.minus(this._start)).perpendicular.normalized().times(r)), this._control.plus(this._end.minus(this._start).perpendicular.normalized().times(r)), this._end.plus((this._end.equals(this._control) ? this._end.minus(this._start) : this._end.minus(this._control)).perpendicular.normalized().times(r)));
    }
    /**
   * Returns a string containing the SVG path. assumes that the start point is already provided, so anything that calls this needs to put the M calls first
   */ getSVGPathFragment() {
        let oldPathFragment;
        if (assert) {
            oldPathFragment = this._svgPathFragment;
            this._svgPathFragment = null;
        }
        if (!this._svgPathFragment) {
            this._svgPathFragment = `Q ${svgNumber(this._control.x)} ${svgNumber(this._control.y)} ${svgNumber(this._end.x)} ${svgNumber(this._end.y)}`;
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
    getInteriorExtremaTs() {
        // TODO: we assume here we are reduce, so that a criticalX doesn't equal a criticalY? https://github.com/phetsims/kite/issues/76
        const result = [];
        const epsilon = 0.0000000001; // TODO: general kite epsilon? https://github.com/phetsims/kite/issues/76
        const criticalX = this.getTCriticalX();
        const criticalY = this.getTCriticalY();
        if (!isNaN(criticalX) && criticalX > epsilon && criticalX < 1 - epsilon) {
            result.push(this.tCriticalX);
        }
        if (!isNaN(criticalY) && criticalY > epsilon && criticalY < 1 - epsilon) {
            result.push(this.tCriticalY);
        }
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
        const p1 = inverseMatrix.timesVector2(this._control);
        const p2 = inverseMatrix.timesVector2(this._end);
        //(1-t)^2 start + 2(1-t)t control + t^2 end
        const a = p0.y - 2 * p1.y + p2.y;
        const b = -2 * p0.y + 2 * p1.y;
        const c = p0.y;
        const ts = solveQuadraticRootsReal(a, b, c);
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
        context.quadraticCurveTo(this._control.x, this._control.y, this._end.x, this._end.y);
    }
    /**
   * Returns a new quadratic that represents this quadratic after transformation by the matrix
   */ transformed(matrix) {
        return new Quadratic(matrix.timesVector2(this._start), matrix.timesVector2(this._control), matrix.timesVector2(this._end));
    }
    /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */ getSignedAreaFragment() {
        return 1 / 6 * (this._start.x * (2 * this._control.y + this._end.y) + this._control.x * (-2 * this._start.y + 2 * this._end.y) + this._end.x * (-this._start.y - 2 * this._control.y));
    }
    /**
   * Given the current curve parameterized by t, will return a curve parameterized by x where t = a * x + b
   */ reparameterized(a, b) {
        // to the polynomial pt^2 + qt + r:
        const p = this._start.plus(this._end.plus(this._control.timesScalar(-2)));
        const q = this._control.minus(this._start).timesScalar(2);
        const r = this._start;
        // to the polynomial alpha*x^2 + beta*x + gamma:
        const alpha = p.timesScalar(a * a);
        const beta = p.timesScalar(a * b).timesScalar(2).plus(q.timesScalar(a));
        const gamma = p.timesScalar(b * b).plus(q.timesScalar(b)).plus(r);
        // back to the form start,control,end
        return new Quadratic(gamma, beta.timesScalar(0.5).plus(gamma), alpha.plus(beta).plus(gamma));
    }
    /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */ reversed() {
        return new Quadratic(this._end, this._control, this._start);
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'Quadratic',
            startX: this._start.x,
            startY: this._start.y,
            controlX: this._control.x,
            controlY: this._control.y,
            endX: this._end.x,
            endY: this._end.y
        };
    }
    /**
   * Determine whether two lines overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * @param segment
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more in one component.
   * @returns - The solution, if there is one (and only one)
   */ getOverlaps(segment, epsilon = 1e-6) {
        if (segment instanceof Quadratic) {
            return Quadratic.getOverlaps(this, segment);
        }
        return null;
    }
    /**
   * Returns a Quadratic from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Quadratic');
        return new Quadratic(new Vector2(obj.startX, obj.startY), new Vector2(obj.controlX, obj.controlY), new Vector2(obj.endX, obj.endY));
    }
    /**
   * One-dimensional solution to extrema
   */ static extremaT(start, control, end) {
        // compute t where the derivative is 0 (used for bounds and other things)
        const divisorX = 2 * (end - 2 * control + start);
        if (divisorX !== 0) {
            return -2 * (control - start) / divisorX;
        } else {
            return NaN;
        }
    }
    /**
   * Determine whether two Quadratics overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * NOTE: for this particular function, we assume we're not degenerate. Things may work if we can be degree-reduced
   * to a quadratic, but generally that shouldn't be done.
   *
   * @param quadratic1
   * @param quadratic2
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                             in one component.
   * @returns - The solution, if there is one (and only one)
   */ static getOverlaps(quadratic1, quadratic2, epsilon = 1e-6) {
        /*
     * NOTE: For implementation details in this function, please see Cubic.getOverlaps. It goes over all of the
     * same implementation details, but instead our bezier matrix is a 3x3:
     *
     * [  1  0  0 ]
     * [ -2  2  0 ]
     * [  1 -2  1 ]
     *
     * And we use the upper-left section of (at+b) adjustment matrix relevant for the quadratic.
     */ const noOverlap = [];
        // Efficiently compute the multiplication of the bezier matrix:
        const p0x = quadratic1._start.x;
        const p1x = -2 * quadratic1._start.x + 2 * quadratic1._control.x;
        const p2x = quadratic1._start.x - 2 * quadratic1._control.x + quadratic1._end.x;
        const p0y = quadratic1._start.y;
        const p1y = -2 * quadratic1._start.y + 2 * quadratic1._control.y;
        const p2y = quadratic1._start.y - 2 * quadratic1._control.y + quadratic1._end.y;
        const q0x = quadratic2._start.x;
        const q1x = -2 * quadratic2._start.x + 2 * quadratic2._control.x;
        const q2x = quadratic2._start.x - 2 * quadratic2._control.x + quadratic2._end.x;
        const q0y = quadratic2._start.y;
        const q1y = -2 * quadratic2._start.y + 2 * quadratic2._control.y;
        const q2y = quadratic2._start.y - 2 * quadratic2._control.y + quadratic2._end.y;
        // Determine the candidate overlap (preferring the dimension with the largest variation)
        const xSpread = Math.abs(Math.max(quadratic1._start.x, quadratic1._control.x, quadratic1._end.x, quadratic2._start.x, quadratic2._control.x, quadratic2._end.x) - Math.min(quadratic1._start.x, quadratic1._control.x, quadratic1._end.x, quadratic2._start.x, quadratic2._control.x, quadratic2._end.x));
        const ySpread = Math.abs(Math.max(quadratic1._start.y, quadratic1._control.y, quadratic1._end.y, quadratic2._start.y, quadratic2._control.y, quadratic2._end.y) - Math.min(quadratic1._start.y, quadratic1._control.y, quadratic1._end.y, quadratic2._start.y, quadratic2._control.y, quadratic2._end.y));
        const xOverlap = Segment.polynomialGetOverlapQuadratic(p0x, p1x, p2x, q0x, q1x, q2x);
        const yOverlap = Segment.polynomialGetOverlapQuadratic(p0y, p1y, p2y, q0y, q1y, q2y);
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
        const aa = a * a;
        const bb = b * b;
        const ab2 = 2 * a * b;
        // Compute quadratic coefficients for the difference between p(t) and q(a*t+b)
        const d0x = q0x + b * q1x + bb * q2x - p0x;
        const d1x = a * q1x + ab2 * q2x - p1x;
        const d2x = aa * q2x - p2x;
        const d0y = q0y + b * q1y + bb * q2y - p0y;
        const d1y = a * q1y + ab2 * q2y - p1y;
        const d2y = aa * q2y - p2y;
        // Find the t values where extremes lie in the [0,1] range for each 1-dimensional quadratic. We do this by
        // differentiating the quadratic and finding the roots of the resulting line.
        const xRoots = Utils.solveLinearRootsReal(2 * d2x, d1x);
        const yRoots = Utils.solveLinearRootsReal(2 * d2y, d1y);
        const xExtremeTs = _.uniq([
            0,
            1
        ].concat(xRoots ? xRoots.filter(isBetween0And1) : []));
        const yExtremeTs = _.uniq([
            0,
            1
        ].concat(yRoots ? yRoots.filter(isBetween0And1) : []));
        // Examine the single-coordinate distances between the "overlaps" at each extreme T value. If the distance is larger
        // than our epsilon, then the "overlap" would not be valid.
        for(let i = 0; i < xExtremeTs.length; i++){
            const t = xExtremeTs[i];
            if (Math.abs((d2x * t + d1x) * t + d0x) > epsilon) {
                return noOverlap;
            }
        }
        for(let i = 0; i < yExtremeTs.length; i++){
            const t = yExtremeTs[i];
            if (Math.abs((d2y * t + d1y) * t + d0y) > epsilon) {
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
   * @param start - Start point of the quadratic bezier
   * @param control - Control point (curve usually doesn't go through here)
   * @param end - End point of the quadratic bezier
   */ constructor(start, control, end){
        super();
        this._start = start;
        this._control = control;
        this._end = end;
        this.invalidate();
    }
};
export { Quadratic as default };
Quadratic.prototype.degree = 2;
kite.register('Quadratic', Quadratic);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvUXVhZHJhdGljLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFF1YWRyYXRpYyBCZXppZXIgc2VnbWVudFxuICpcbiAqIEdvb2QgcmVmZXJlbmNlOiBodHRwOi8vY2FnZC5jcy5ieXUuZWR1L341NTcvdGV4dC9jaDIucGRmXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgQ3ViaWMsIGtpdGUsIExpbmUsIE92ZXJsYXAsIFJheUludGVyc2VjdGlvbiwgU2VnbWVudCwgc3ZnTnVtYmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3Qgc29sdmVRdWFkcmF0aWNSb290c1JlYWwgPSBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbDtcbmNvbnN0IGFyZVBvaW50c0NvbGxpbmVhciA9IFV0aWxzLmFyZVBvaW50c0NvbGxpbmVhcjtcblxuLy8gVXNlZCBpbiBtdWx0aXBsZSBmaWx0ZXJzXG5mdW5jdGlvbiBpc0JldHdlZW4wQW5kMSggdDogbnVtYmVyICk6IGJvb2xlYW4ge1xuICByZXR1cm4gdCA+PSAwICYmIHQgPD0gMTtcbn1cblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFF1YWRyYXRpYyA9IHtcbiAgdHlwZTogJ1F1YWRyYXRpYyc7XG4gIHN0YXJ0WDogbnVtYmVyO1xuICBzdGFydFk6IG51bWJlcjtcbiAgY29udHJvbFg6IG51bWJlcjtcbiAgY29udHJvbFk6IG51bWJlcjtcbiAgZW5kWDogbnVtYmVyO1xuICBlbmRZOiBudW1iZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBRdWFkcmF0aWMgZXh0ZW5kcyBTZWdtZW50IHtcblxuICBwcml2YXRlIF9zdGFydDogVmVjdG9yMjtcbiAgcHJpdmF0ZSBfY29udHJvbDogVmVjdG9yMjtcbiAgcHJpdmF0ZSBfZW5kOiBWZWN0b3IyO1xuXG4gIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXG4gIHByaXZhdGUgX3N0YXJ0VGFuZ2VudCE6IFZlY3RvcjIgfCBudWxsO1xuICBwcml2YXRlIF9lbmRUYW5nZW50ITogVmVjdG9yMiB8IG51bGw7XG4gIHByaXZhdGUgX3RDcml0aWNhbFghOiBudW1iZXIgfCBudWxsOyAvLyBUIHdoZXJlIHgtZGVyaXZhdGl2ZSBpcyAwIChyZXBsYWNlZCB3aXRoIE5hTiBpZiBub3QgaW4gcmFuZ2UpXG4gIHByaXZhdGUgX3RDcml0aWNhbFkhOiBudW1iZXIgfCBudWxsOyAvLyBUIHdoZXJlIHktZGVyaXZhdGl2ZSBpcyAwIChyZXBsYWNlZCB3aXRoIE5hTiBpZiBub3QgaW4gcmFuZ2UpXG4gIHByaXZhdGUgX2JvdW5kcyE6IEJvdW5kczIgfCBudWxsO1xuICBwcml2YXRlIF9zdmdQYXRoRnJhZ21lbnQhOiBzdHJpbmcgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gc3RhcnQgLSBTdGFydCBwb2ludCBvZiB0aGUgcXVhZHJhdGljIGJlemllclxuICAgKiBAcGFyYW0gY29udHJvbCAtIENvbnRyb2wgcG9pbnQgKGN1cnZlIHVzdWFsbHkgZG9lc24ndCBnbyB0aHJvdWdoIGhlcmUpXG4gICAqIEBwYXJhbSBlbmQgLSBFbmQgcG9pbnQgb2YgdGhlIHF1YWRyYXRpYyBiZXppZXJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnQ6IFZlY3RvcjIsIGNvbnRyb2w6IFZlY3RvcjIsIGVuZDogVmVjdG9yMiApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLl9jb250cm9sID0gY29udHJvbDtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG5cbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFydCBwb2ludCBvZiB0aGUgUXVhZHJhdGljLlxuICAgKi9cbiAgcHVibGljIHNldFN0YXJ0KCBzdGFydDogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydC5pc0Zpbml0ZSgpLCBgUXVhZHJhdGljIHN0YXJ0IHNob3VsZCBiZSBmaW5pdGU6ICR7c3RhcnQudG9TdHJpbmcoKX1gICk7XG5cbiAgICBpZiAoICF0aGlzLl9zdGFydC5lcXVhbHMoIHN0YXJ0ICkgKSB7XG4gICAgICB0aGlzLl9zdGFydCA9IHN0YXJ0O1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCBzdGFydCggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0U3RhcnQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0YXJ0IG9mIHRoaXMgUXVhZHJhdGljLlxuICAgKi9cbiAgcHVibGljIGdldFN0YXJ0KCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9zdGFydDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNvbnRyb2wgcG9pbnQgb2YgdGhlIFF1YWRyYXRpYy5cbiAgICovXG4gIHB1YmxpYyBzZXRDb250cm9sKCBjb250cm9sOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRyb2wuaXNGaW5pdGUoKSwgYFF1YWRyYXRpYyBjb250cm9sIHNob3VsZCBiZSBmaW5pdGU6ICR7Y29udHJvbC50b1N0cmluZygpfWAgKTtcblxuICAgIGlmICggIXRoaXMuX2NvbnRyb2wuZXF1YWxzKCBjb250cm9sICkgKSB7XG4gICAgICB0aGlzLl9jb250cm9sID0gY29udHJvbDtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udHJvbCggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0Q29udHJvbCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgY29udHJvbCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q29udHJvbCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnRyb2wgcG9pbnQgb2YgdGhpcyBRdWFkcmF0aWMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29udHJvbCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fY29udHJvbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGVuZCBwb2ludCBvZiB0aGUgUXVhZHJhdGljLlxuICAgKi9cbiAgcHVibGljIHNldEVuZCggZW5kOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZC5pc0Zpbml0ZSgpLCBgUXVhZHJhdGljIGVuZCBzaG91bGQgYmUgZmluaXRlOiAke2VuZC50b1N0cmluZygpfWAgKTtcblxuICAgIGlmICggIXRoaXMuX2VuZC5lcXVhbHMoIGVuZCApICkge1xuICAgICAgdGhpcy5fZW5kID0gZW5kO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCBlbmQoIHZhbHVlOiBWZWN0b3IyICkgeyB0aGlzLnNldEVuZCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbmQgb2YgdGhpcyBRdWFkcmF0aWMuXG4gICAqL1xuICBwdWJsaWMgZ2V0RW5kKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9lbmQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBwYXJhbWV0cmljYWxseSwgd2l0aCAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogTk9URTogcG9zaXRpb25BdCggMCApIHdpbGwgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHBvc2l0aW9uQXQoIDEgKSB3aWxsIHJldHVybiB0aGUgZW5kIG9mIHRoZVxuICAgKiBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBwb3NpdGlvbkF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIGNvbnN0IG10ID0gMSAtIHQ7XG4gICAgLy8gZGVzY3JpYmVkIGZyb20gdD1bMCwxXSBhczogKDEtdCleMiBzdGFydCArIDIoMS10KXQgY29udHJvbCArIHReMiBlbmRcbiAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICByZXR1cm4gdGhpcy5fc3RhcnQudGltZXMoIG10ICogbXQgKS5wbHVzKCB0aGlzLl9jb250cm9sLnRpbWVzKCAyICogbXQgKiB0ICkgKS5wbHVzKCB0aGlzLl9lbmQudGltZXMoIHQgKiB0ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBub24tbm9ybWFsaXplZCB0YW5nZW50IChkeC9kdCwgZHkvZHQpIG9mIHRoaXMgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSBvZiB0LCB3aXRoIDAgPD0gdCA8PSAxLlxuICAgKlxuICAgKiBOT1RFOiB0YW5nZW50QXQoIDAgKSB3aWxsIHJldHVybiB0aGUgdGFuZ2VudCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCB0YW5nZW50QXQoIDEgKSB3aWxsIHJldHVybiB0aGVcbiAgICogdGFuZ2VudCBhdCB0aGUgZW5kIG9mIHRoZSBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyB0YW5nZW50QXQoIHQ6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICd0YW5nZW50QXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3RhbmdlbnRBdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIC8vIEZvciBhIHF1YWRyYXRpYyBjdXJ2ZSwgdGhlIGRlcml2YXRpdmUgaXMgZ2l2ZW4gYnkgOiAyKDEtdCkoIGNvbnRyb2wgLSBzdGFydCApICsgMnQoIGVuZCAtIGNvbnRyb2wgKVxuICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIHJldHVybiB0aGlzLl9jb250cm9sLm1pbnVzKCB0aGlzLl9zdGFydCApLnRpbWVzKCAyICogKCAxIC0gdCApICkucGx1cyggdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9jb250cm9sICkudGltZXMoIDIgKiB0ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzaWduZWQgY3VydmF0dXJlIG9mIHRoZSBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIHQsIHdoZXJlIDAgPD0gdCA8PSAxLlxuICAgKlxuICAgKiBUaGUgY3VydmF0dXJlIHdpbGwgYmUgcG9zaXRpdmUgZm9yIHZpc3VhbCBjbG9ja3dpc2UgLyBtYXRoZW1hdGljYWwgY291bnRlcmNsb2Nrd2lzZSBjdXJ2ZXMsIG5lZ2F0aXZlIGZvciBvcHBvc2l0ZVxuICAgKiBjdXJ2YXR1cmUsIGFuZCAwIGZvciBubyBjdXJ2YXR1cmUuXG4gICAqXG4gICAqIE5PVEU6IGN1cnZhdHVyZUF0KCAwICkgd2lsbCByZXR1cm4gdGhlIGN1cnZhdHVyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCBjdXJ2YXR1cmVBdCggMSApIHdpbGwgcmV0dXJuXG4gICAqIHRoZSBjdXJ2YXR1cmUgYXQgdGhlIGVuZCBvZiB0aGUgc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgY3VydmF0dXJlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ2N1cnZhdHVyZUF0IHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdjdXJ2YXR1cmVBdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIC8vIHNlZSBodHRwOi8vY2FnZC5jcy5ieXUuZWR1L341NTcvdGV4dC9jaDIucGRmIHAzMVxuICAgIC8vIFRPRE86IHJlbW92ZSBjb2RlIGR1cGxpY2F0aW9uIHdpdGggQ3ViaWMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMTtcbiAgICBpZiAoIE1hdGguYWJzKCB0IC0gMC41ICkgPiAwLjUgLSBlcHNpbG9uICkge1xuICAgICAgY29uc3QgaXNaZXJvID0gdCA8IDAuNTtcbiAgICAgIGNvbnN0IHAwID0gaXNaZXJvID8gdGhpcy5fc3RhcnQgOiB0aGlzLl9lbmQ7XG4gICAgICBjb25zdCBwMSA9IHRoaXMuX2NvbnRyb2w7XG4gICAgICBjb25zdCBwMiA9IGlzWmVybyA/IHRoaXMuX2VuZCA6IHRoaXMuX3N0YXJ0O1xuICAgICAgY29uc3QgZDEwID0gcDEubWludXMoIHAwICk7XG4gICAgICBjb25zdCBhID0gZDEwLm1hZ25pdHVkZTtcbiAgICAgIGNvbnN0IGggPSAoIGlzWmVybyA/IC0xIDogMSApICogZDEwLnBlcnBlbmRpY3VsYXIubm9ybWFsaXplZCgpLmRvdCggcDIubWludXMoIHAxICkgKTtcbiAgICAgIHJldHVybiAoIGggKiAoIHRoaXMuZGVncmVlIC0gMSApICkgLyAoIHRoaXMuZGVncmVlICogYSAqIGEgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJkaXZpZGVkKCB0IClbIDAgXS5jdXJ2YXR1cmVBdCggMSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHdpdGggdXAgdG8gMiBzdWItc2VnbWVudHMsIHNwbGl0IGF0IHRoZSBwYXJhbWV0cmljIHQgdmFsdWUuIFRvZ2V0aGVyIChpbiBvcmRlcikgdGhleSBzaG91bGQgbWFrZVxuICAgKiB1cCB0aGUgc2FtZSBzaGFwZSBhcyB0aGUgY3VycmVudCBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdWJkaXZpZGVkKCB0OiBudW1iZXIgKTogUXVhZHJhdGljW10ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ3N1YmRpdmlkZWQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3N1YmRpdmlkZWQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XG5cbiAgICAvLyBJZiB0IGlzIDAgb3IgMSwgd2Ugb25seSBuZWVkIHRvIHJldHVybiAxIHNlZ21lbnRcbiAgICBpZiAoIHQgPT09IDAgfHwgdCA9PT0gMSApIHtcbiAgICAgIHJldHVybiBbIHRoaXMgXTtcbiAgICB9XG5cbiAgICAvLyBkZSBDYXN0ZWxqYXUgbWV0aG9kXG4gICAgY29uc3QgbGVmdE1pZCA9IHRoaXMuX3N0YXJ0LmJsZW5kKCB0aGlzLl9jb250cm9sLCB0ICk7XG4gICAgY29uc3QgcmlnaHRNaWQgPSB0aGlzLl9jb250cm9sLmJsZW5kKCB0aGlzLl9lbmQsIHQgKTtcbiAgICBjb25zdCBtaWQgPSBsZWZ0TWlkLmJsZW5kKCByaWdodE1pZCwgdCApO1xuICAgIHJldHVybiBbXG4gICAgICBuZXcgUXVhZHJhdGljKCB0aGlzLl9zdGFydCwgbGVmdE1pZCwgbWlkICksXG4gICAgICBuZXcgUXVhZHJhdGljKCBtaWQsIHJpZ2h0TWlkLCB0aGlzLl9lbmQgKVxuICAgIF07XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGNhY2hlZCBpbmZvcm1hdGlvbiwgc2hvdWxkIGJlIGNhbGxlZCB3aGVuIGFueSBvZiB0aGUgJ2NvbnN0cnVjdG9yIGFyZ3VtZW50cycgYXJlIG11dGF0ZWQuXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9zdGFydCBpbnN0YW5jZW9mIFZlY3RvcjIsIGBRdWFkcmF0aWMgc3RhcnQgc2hvdWxkIGJlIGEgVmVjdG9yMjogJHt0aGlzLl9zdGFydH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fc3RhcnQuaXNGaW5pdGUoKSwgYFF1YWRyYXRpYyBzdGFydCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX3N0YXJ0LnRvU3RyaW5nKCl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2NvbnRyb2wgaW5zdGFuY2VvZiBWZWN0b3IyLCBgUXVhZHJhdGljIGNvbnRyb2wgc2hvdWxkIGJlIGEgVmVjdG9yMjogJHt0aGlzLl9jb250cm9sfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jb250cm9sLmlzRmluaXRlKCksIGBRdWFkcmF0aWMgY29udHJvbCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX2NvbnRyb2wudG9TdHJpbmcoKX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fZW5kIGluc3RhbmNlb2YgVmVjdG9yMiwgYFF1YWRyYXRpYyBlbmQgc2hvdWxkIGJlIGEgVmVjdG9yMjogJHt0aGlzLl9lbmR9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2VuZC5pc0Zpbml0ZSgpLCBgUXVhZHJhdGljIGVuZCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX2VuZC50b1N0cmluZygpfWAgKTtcblxuICAgIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXG4gICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl9lbmRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl90Q3JpdGljYWxYID0gbnVsbDtcbiAgICB0aGlzLl90Q3JpdGljYWxZID0gbnVsbDtcblxuICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XG4gICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gbnVsbDtcblxuICAgIHRoaXMuaW52YWxpZGF0aW9uRW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGFuZ2VudCB2ZWN0b3IgKG5vcm1hbGl6ZWQpIHRvIHRoZSBzZWdtZW50IGF0IHRoZSBzdGFydCwgcG9pbnRpbmcgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24gKGZyb20gc3RhcnQgdG8gZW5kKVxuICAgKi9cbiAgcHVibGljIGdldFN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX3N0YXJ0VGFuZ2VudCA9PT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IGNvbnRyb2xJc1N0YXJ0ID0gdGhpcy5fc3RhcnQuZXF1YWxzKCB0aGlzLl9jb250cm9sICk7XG4gICAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAgIHRoaXMuX3N0YXJ0VGFuZ2VudCA9IGNvbnRyb2xJc1N0YXJ0ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuZC5taW51cyggdGhpcy5fc3RhcnQgKS5ub3JtYWxpemVkKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29udHJvbC5taW51cyggdGhpcy5fc3RhcnQgKS5ub3JtYWxpemVkKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGFydFRhbmdlbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGFuZ2VudCB2ZWN0b3IgKG5vcm1hbGl6ZWQpIHRvIHRoZSBzZWdtZW50IGF0IHRoZSBlbmQsIHBvaW50aW5nIGluIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIChmcm9tIHN0YXJ0IHRvIGVuZClcbiAgICovXG4gIHB1YmxpYyBnZXRFbmRUYW5nZW50KCk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5fZW5kVGFuZ2VudCA9PT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IGNvbnRyb2xJc0VuZCA9IHRoaXMuX2VuZC5lcXVhbHMoIHRoaXMuX2NvbnRyb2wgKTtcbiAgICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgdGhpcy5fZW5kVGFuZ2VudCA9IGNvbnRyb2xJc0VuZCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9zdGFydCApLm5vcm1hbGl6ZWQoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9jb250cm9sICkubm9ybWFsaXplZCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW5kVGFuZ2VudDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kVGFuZ2VudCgpOyB9XG5cbiAgcHVibGljIGdldFRDcml0aWNhbFgoKTogbnVtYmVyIHtcbiAgICAvLyBjb21wdXRlIHggd2hlcmUgdGhlIGRlcml2YXRpdmUgaXMgMCAodXNlZCBmb3IgYm91bmRzIGFuZCBvdGhlciB0aGluZ3MpXG4gICAgaWYgKCB0aGlzLl90Q3JpdGljYWxYID09PSBudWxsICkge1xuICAgICAgdGhpcy5fdENyaXRpY2FsWCA9IFF1YWRyYXRpYy5leHRyZW1hVCggdGhpcy5fc3RhcnQueCwgdGhpcy5fY29udHJvbC54LCB0aGlzLl9lbmQueCApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdENyaXRpY2FsWDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdENyaXRpY2FsWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRUQ3JpdGljYWxYKCk7IH1cblxuICBwdWJsaWMgZ2V0VENyaXRpY2FsWSgpOiBudW1iZXIge1xuICAgIC8vIGNvbXB1dGUgeSB3aGVyZSB0aGUgZGVyaXZhdGl2ZSBpcyAwICh1c2VkIGZvciBib3VuZHMgYW5kIG90aGVyIHRoaW5ncylcbiAgICBpZiAoIHRoaXMuX3RDcml0aWNhbFkgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl90Q3JpdGljYWxZID0gUXVhZHJhdGljLmV4dHJlbWFUKCB0aGlzLl9zdGFydC55LCB0aGlzLl9jb250cm9sLnksIHRoaXMuX2VuZC55ICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl90Q3JpdGljYWxZO1xuICB9XG5cbiAgcHVibGljIGdldCB0Q3JpdGljYWxZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFRDcml0aWNhbFkoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBub24tZGVnZW5lcmF0ZSBzZWdtZW50cyB0aGF0IGFyZSBlcXVpdmFsZW50IHRvIHRoaXMgc2VnbWVudC4gR2VuZXJhbGx5IGdldHMgcmlkIChvciBzaW1wbGlmaWVzKVxuICAgKiBpbnZhbGlkIG9yIHJlcGVhdGVkIHNlZ21lbnRzLlxuICAgKi9cbiAgcHVibGljIGdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpOiBTZWdtZW50W10ge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fc3RhcnQ7XG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuX2NvbnRyb2w7XG4gICAgY29uc3QgZW5kID0gdGhpcy5fZW5kO1xuXG4gICAgY29uc3Qgc3RhcnRJc0VuZCA9IHN0YXJ0LmVxdWFscyggZW5kICk7XG4gICAgY29uc3Qgc3RhcnRJc0NvbnRyb2wgPSBzdGFydC5lcXVhbHMoIGNvbnRyb2wgKTtcbiAgICBjb25zdCBlbmRJc0NvbnRyb2wgPSBzdGFydC5lcXVhbHMoIGNvbnRyb2wgKTtcblxuICAgIGlmICggc3RhcnRJc0VuZCAmJiBzdGFydElzQ29udHJvbCApIHtcbiAgICAgIC8vIGFsbCBzYW1lIHBvaW50c1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICggc3RhcnRJc0VuZCApIHtcbiAgICAgIC8vIHRoaXMgaXMgYSBzcGVjaWFsIGNvbGxpbmVhciBjYXNlLCB3ZSBiYXNpY2FsbHkgbGluZSBvdXQgdG8gdGhlIGZhcnRoZXN0IHBvaW50IGFuZCBiYWNrXG4gICAgICBjb25zdCBoYWxmUG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIDAuNSApO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IExpbmUoIHN0YXJ0LCBoYWxmUG9pbnQgKSxcbiAgICAgICAgbmV3IExpbmUoIGhhbGZQb2ludCwgZW5kIClcbiAgICAgIF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCBhcmVQb2ludHNDb2xsaW5lYXIoIHN0YXJ0LCBjb250cm9sLCBlbmQgKSApIHtcbiAgICAgIC8vIGlmIHRoZXkgYXJlIGNvbGxpbmVhciwgd2UgY2FuIHJlZHVjZSB0byBzdGFydC0+Y29udHJvbCBhbmQgY29udHJvbC0+ZW5kLCBvciBpZiBjb250cm9sIGlzIGJldHdlZW4sIGp1c3Qgb25lIGxpbmUgc2VnbWVudFxuICAgICAgLy8gYWxzbywgc3RhcnQgIT09IGVuZCAoaGFuZGxlZCBlYXJsaWVyKVxuICAgICAgaWYgKCBzdGFydElzQ29udHJvbCB8fCBlbmRJc0NvbnRyb2wgKSB7XG4gICAgICAgIC8vIGp1c3QgYSBsaW5lIHNlZ21lbnQhXG4gICAgICAgIHJldHVybiBbIG5ldyBMaW5lKCBzdGFydCwgZW5kICkgXTsgLy8gbm8gZXh0cmEgbm9uZGVnZW5lcmF0ZSBjaGVjayBzaW5jZSBzdGFydCAhPT0gZW5kXG4gICAgICB9XG4gICAgICAvLyBub3cgY29udHJvbCBwb2ludCBtdXN0IGJlIHVuaXF1ZS4gd2UgY2hlY2sgdG8gc2VlIGlmIG91ciByZW5kZXJlZCBwYXRoIHdpbGwgYmUgb3V0c2lkZSBvZiB0aGUgc3RhcnQtPmVuZCBsaW5lIHNlZ21lbnRcbiAgICAgIGNvbnN0IGRlbHRhID0gZW5kLm1pbnVzKCBzdGFydCApO1xuICAgICAgY29uc3QgcDFkID0gY29udHJvbC5taW51cyggc3RhcnQgKS5kb3QoIGRlbHRhLm5vcm1hbGl6ZWQoKSApIC8gZGVsdGEubWFnbml0dWRlO1xuICAgICAgY29uc3QgdCA9IFF1YWRyYXRpYy5leHRyZW1hVCggMCwgcDFkLCAxICk7XG4gICAgICBpZiAoICFpc05hTiggdCApICYmIHQgPiAwICYmIHQgPCAxICkge1xuICAgICAgICAvLyB3ZSBoYXZlIGEgbG9jYWwgbWF4IGluc2lkZSB0aGUgcmFuZ2UsIGluZGljYXRpbmcgdGhhdCBvdXIgZXh0cmVtYSBwb2ludCBpcyBvdXRzaWRlIG9mIHN0YXJ0LT5lbmRcbiAgICAgICAgLy8gd2UnbGwgbGluZSB0byBhbmQgZnJvbSBpdFxuICAgICAgICBjb25zdCBwdCA9IHRoaXMucG9zaXRpb25BdCggdCApO1xuICAgICAgICByZXR1cm4gXy5mbGF0dGVuKCBbXG4gICAgICAgICAgbmV3IExpbmUoIHN0YXJ0LCBwdCApLmdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpLFxuICAgICAgICAgIG5ldyBMaW5lKCBwdCwgZW5kICkuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKClcbiAgICAgICAgXSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGp1c3QgcHJvdmlkZSBhIGxpbmUgc2VnbWVudCwgb3VyIHJlbmRlcmVkIHBhdGggZG9lc24ndCBnbyBvdXRzaWRlIG9mIHRoaXNcbiAgICAgICAgcmV0dXJuIFsgbmV3IExpbmUoIHN0YXJ0LCBlbmQgKSBdOyAvLyBubyBleHRyYSBub25kZWdlbmVyYXRlIGNoZWNrIHNpbmNlIHN0YXJ0ICE9PSBlbmRcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gWyB0aGlzIF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIHNlZ21lbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xuICAgIC8vIGNhbGN1bGF0ZSBvdXIgdGVtcG9yYXJ5IGd1YXJhbnRlZWQgbG93ZXIgYm91bmRzIGJhc2VkIG9uIHRoZSBlbmQgcG9pbnRzXG4gICAgaWYgKCB0aGlzLl9ib3VuZHMgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9ib3VuZHMgPSBuZXcgQm91bmRzMiggTWF0aC5taW4oIHRoaXMuX3N0YXJ0LngsIHRoaXMuX2VuZC54ICksIE1hdGgubWluKCB0aGlzLl9zdGFydC55LCB0aGlzLl9lbmQueSApLCBNYXRoLm1heCggdGhpcy5fc3RhcnQueCwgdGhpcy5fZW5kLnggKSwgTWF0aC5tYXgoIHRoaXMuX3N0YXJ0LnksIHRoaXMuX2VuZC55ICkgKTtcblxuICAgICAgLy8gY29tcHV0ZSB4IGFuZCB5IHdoZXJlIHRoZSBkZXJpdmF0aXZlIGlzIDAsIHNvIHdlIGNhbiBpbmNsdWRlIHRoaXMgaW4gdGhlIGJvdW5kc1xuICAgICAgY29uc3QgdENyaXRpY2FsWCA9IHRoaXMuZ2V0VENyaXRpY2FsWCgpO1xuICAgICAgY29uc3QgdENyaXRpY2FsWSA9IHRoaXMuZ2V0VENyaXRpY2FsWSgpO1xuXG4gICAgICBpZiAoICFpc05hTiggdENyaXRpY2FsWCApICYmIHRDcml0aWNhbFggPiAwICYmIHRDcml0aWNhbFggPCAxICkge1xuICAgICAgICB0aGlzLl9ib3VuZHMgPSB0aGlzLl9ib3VuZHMud2l0aFBvaW50KCB0aGlzLnBvc2l0aW9uQXQoIHRDcml0aWNhbFggKSApO1xuICAgICAgfVxuICAgICAgaWYgKCAhaXNOYU4oIHRDcml0aWNhbFkgKSAmJiB0Q3JpdGljYWxZID4gMCAmJiB0Q3JpdGljYWxZIDwgMSApIHtcbiAgICAgICAgdGhpcy5fYm91bmRzID0gdGhpcy5fYm91bmRzLndpdGhQb2ludCggdGhpcy5wb3NpdGlvbkF0KCB0Q3JpdGljYWxZICkgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kcztcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYm91bmRzKCk6IEJvdW5kczIgeyByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKTsgfVxuXG4gIC8vIHNlZSBodHRwOi8vd3d3LnZpc2dyYWYuaW1wYS5ici9zaWJncmFwaTk2L3RyYWJzL3BkZi9hMTQucGRmXG4gIC8vIGFuZCBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMTIxODYvYXJjLWxlbmd0aC1vZi1iZXppZXItY3VydmVzIGZvciBjdXJ2YXR1cmUgLyBhcmMgbGVuZ3RoXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgcXVhZHJhdGljIHRoYXQgYXJlIG9mZnNldCB0byB0aGlzIHF1YWRyYXRpYyBieSBhIGRpc3RhbmNlIHJcbiAgICpcbiAgICogQHBhcmFtIHIgLSBkaXN0YW5jZVxuICAgKiBAcGFyYW0gcmV2ZXJzZVxuICAgKi9cbiAgcHVibGljIG9mZnNldFRvKCByOiBudW1iZXIsIHJldmVyc2U6IGJvb2xlYW4gKTogUXVhZHJhdGljW10ge1xuICAgIC8vIFRPRE86IGltcGxlbWVudCBtb3JlIGFjY3VyYXRlIG1ldGhvZCBhdCBodHRwOi8vd3d3LmFudGlncmFpbi5jb20vcmVzZWFyY2gvYWRhcHRpdmVfYmV6aWVyL2luZGV4Lmh0bWwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgLy8gVE9ETzogb3IgbW9yZSByZWNlbnRseSAoYW5kIHJlbGV2YW50bHkpOiBodHRwOi8vd3d3LmNpcy51c291dGhhbC5lZHUvfmhhaW4vZ2VuZXJhbC9QdWJsaWNhdGlvbnMvQmV6aWVyL0JlemllckZsYXR0ZW5pbmcucGRmIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGxldCBjdXJ2ZXM6IFF1YWRyYXRpY1tdID0gWyB0aGlzIF07XG5cbiAgICAvLyBzdWJkaXZpZGUgdGhpcyBjdXJ2ZVxuICAgIGNvbnN0IGRlcHRoID0gNTsgLy8gZ2VuZXJhdGVzIDJeZGVwdGggY3VydmVzXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGVwdGg7IGkrKyApIHtcbiAgICAgIGN1cnZlcyA9IF8uZmxhdHRlbiggXy5tYXAoIGN1cnZlcywgKCBjdXJ2ZTogUXVhZHJhdGljICkgPT4gY3VydmUuc3ViZGl2aWRlZCggMC41ICkgKSApO1xuICAgIH1cblxuICAgIGxldCBvZmZzZXRDdXJ2ZXMgPSBfLm1hcCggY3VydmVzLCAoIGN1cnZlOiBRdWFkcmF0aWMgKSA9PiBjdXJ2ZS5hcHByb3hpbWF0ZU9mZnNldCggciApICk7XG5cbiAgICBpZiAoIHJldmVyc2UgKSB7XG4gICAgICBvZmZzZXRDdXJ2ZXMucmV2ZXJzZSgpO1xuICAgICAgb2Zmc2V0Q3VydmVzID0gXy5tYXAoIG9mZnNldEN1cnZlcywgKCBjdXJ2ZTogUXVhZHJhdGljICkgPT4gY3VydmUucmV2ZXJzZWQoKSApO1xuICAgIH1cblxuICAgIHJldHVybiBvZmZzZXRDdXJ2ZXM7XG4gIH1cblxuICAvKipcbiAgICogRWxldmF0aW9uIG9mIHRoaXMgcXVhZHJhdGljIEJlemllciBjdXJ2ZSB0byBhIGN1YmljIEJlemllciBjdXJ2ZVxuICAgKi9cbiAgcHVibGljIGRlZ3JlZUVsZXZhdGVkKCk6IEN1YmljIHtcbiAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICByZXR1cm4gbmV3IEN1YmljKFxuICAgICAgdGhpcy5fc3RhcnQsXG4gICAgICB0aGlzLl9zdGFydC5wbHVzKCB0aGlzLl9jb250cm9sLnRpbWVzU2NhbGFyKCAyICkgKS5kaXZpZGVkU2NhbGFyKCAzICksXG4gICAgICB0aGlzLl9lbmQucGx1cyggdGhpcy5fY29udHJvbC50aW1lc1NjYWxhciggMiApICkuZGl2aWRlZFNjYWxhciggMyApLFxuICAgICAgdGhpcy5fZW5kXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gciAtIGRpc3RhbmNlXG4gICAqL1xuICBwdWJsaWMgYXBwcm94aW1hdGVPZmZzZXQoIHI6IG51bWJlciApOiBRdWFkcmF0aWMge1xuICAgIHJldHVybiBuZXcgUXVhZHJhdGljKFxuICAgICAgdGhpcy5fc3RhcnQucGx1cyggKCB0aGlzLl9zdGFydC5lcXVhbHMoIHRoaXMuX2NvbnRyb2wgKSA/IHRoaXMuX2VuZC5taW51cyggdGhpcy5fc3RhcnQgKSA6IHRoaXMuX2NvbnRyb2wubWludXMoIHRoaXMuX3N0YXJ0ICkgKS5wZXJwZW5kaWN1bGFyLm5vcm1hbGl6ZWQoKS50aW1lcyggciApICksXG4gICAgICB0aGlzLl9jb250cm9sLnBsdXMoIHRoaXMuX2VuZC5taW51cyggdGhpcy5fc3RhcnQgKS5wZXJwZW5kaWN1bGFyLm5vcm1hbGl6ZWQoKS50aW1lcyggciApICksXG4gICAgICB0aGlzLl9lbmQucGx1cyggKCB0aGlzLl9lbmQuZXF1YWxzKCB0aGlzLl9jb250cm9sICkgPyB0aGlzLl9lbmQubWludXMoIHRoaXMuX3N0YXJ0ICkgOiB0aGlzLl9lbmQubWludXMoIHRoaXMuX2NvbnRyb2wgKSApLnBlcnBlbmRpY3VsYXIubm9ybWFsaXplZCgpLnRpbWVzKCByICkgKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBTVkcgcGF0aC4gYXNzdW1lcyB0aGF0IHRoZSBzdGFydCBwb2ludCBpcyBhbHJlYWR5IHByb3ZpZGVkLCBzbyBhbnl0aGluZyB0aGF0IGNhbGxzIHRoaXMgbmVlZHMgdG8gcHV0IHRoZSBNIGNhbGxzIGZpcnN0XG4gICAqL1xuICBwdWJsaWMgZ2V0U1ZHUGF0aEZyYWdtZW50KCk6IHN0cmluZyB7XG4gICAgbGV0IG9sZFBhdGhGcmFnbWVudDtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIG9sZFBhdGhGcmFnbWVudCA9IHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICggIXRoaXMuX3N2Z1BhdGhGcmFnbWVudCApIHtcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IGBRICR7c3ZnTnVtYmVyKCB0aGlzLl9jb250cm9sLnggKX0gJHtzdmdOdW1iZXIoIHRoaXMuX2NvbnRyb2wueSApfSAke1xuICAgICAgICBzdmdOdW1iZXIoIHRoaXMuX2VuZC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9lbmQueSApfWA7XG4gICAgfVxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgaWYgKCBvbGRQYXRoRnJhZ21lbnQgKSB7XG4gICAgICAgIGFzc2VydCggb2xkUGF0aEZyYWdtZW50ID09PSB0aGlzLl9zdmdQYXRoRnJhZ21lbnQsICdRdWFkcmF0aWMgbGluZSBzZWdtZW50IGNoYW5nZWQgd2l0aG91dCBpbnZhbGlkYXRlKCknICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdmdQYXRoRnJhZ21lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBsaW5lcyB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgY3VydmUgb24gdGhlIGxvZ2ljYWwgbGVmdCBzaWRlXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogUXVhZHJhdGljW10ge1xuICAgIHJldHVybiB0aGlzLm9mZnNldFRvKCAtbGluZVdpZHRoIC8gMiwgZmFsc2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGxpbmVzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCByaWdodCBzaWRlXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlUmlnaHQoIGxpbmVXaWR0aDogbnVtYmVyICk6IFF1YWRyYXRpY1tdIHtcbiAgICByZXR1cm4gdGhpcy5vZmZzZXRUbyggbGluZVdpZHRoIC8gMiwgdHJ1ZSApO1xuICB9XG5cbiAgcHVibGljIGdldEludGVyaW9yRXh0cmVtYVRzKCk6IG51bWJlcltdIHtcbiAgICAvLyBUT0RPOiB3ZSBhc3N1bWUgaGVyZSB3ZSBhcmUgcmVkdWNlLCBzbyB0aGF0IGEgY3JpdGljYWxYIGRvZXNuJ3QgZXF1YWwgYSBjcml0aWNhbFk/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDAwMDE7IC8vIFRPRE86IGdlbmVyYWwga2l0ZSBlcHNpbG9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcblxuICAgIGNvbnN0IGNyaXRpY2FsWCA9IHRoaXMuZ2V0VENyaXRpY2FsWCgpO1xuICAgIGNvbnN0IGNyaXRpY2FsWSA9IHRoaXMuZ2V0VENyaXRpY2FsWSgpO1xuXG4gICAgaWYgKCAhaXNOYU4oIGNyaXRpY2FsWCApICYmIGNyaXRpY2FsWCA+IGVwc2lsb24gJiYgY3JpdGljYWxYIDwgMSAtIGVwc2lsb24gKSB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy50Q3JpdGljYWxYICk7XG4gICAgfVxuICAgIGlmICggIWlzTmFOKCBjcml0aWNhbFkgKSAmJiBjcml0aWNhbFkgPiBlcHNpbG9uICYmIGNyaXRpY2FsWSA8IDEgLSBlcHNpbG9uICkge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMudENyaXRpY2FsWSApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LnNvcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaXQtdGVzdHMgdGhpcyBzZWdtZW50IHdpdGggdGhlIHJheS4gQW4gYXJyYXkgb2YgYWxsIGludGVyc2VjdGlvbnMgb2YgdGhlIHJheSB3aXRoIHRoaXMgc2VnbWVudCB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBGb3IgZGV0YWlscywgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGluIFNlZ21lbnQuanNcbiAgICovXG4gIHB1YmxpYyBpbnRlcnNlY3Rpb24oIHJheTogUmF5MiApOiBSYXlJbnRlcnNlY3Rpb25bXSB7XG4gICAgY29uc3QgcmVzdWx0OiBSYXlJbnRlcnNlY3Rpb25bXSA9IFtdO1xuXG4gICAgLy8gZmluZCB0aGUgcm90YXRpb24gdGhhdCB3aWxsIHB1dCBvdXIgcmF5IGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHgtYXhpcyBzbyB3ZSBjYW4gb25seSBzb2x2ZSBmb3IgeT0wIGZvciBpbnRlcnNlY3Rpb25zXG4gICAgY29uc3QgaW52ZXJzZU1hdHJpeCA9IE1hdHJpeDMucm90YXRpb24yKCAtcmF5LmRpcmVjdGlvbi5hbmdsZSApLnRpbWVzTWF0cml4KCBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtcmF5LnBvc2l0aW9uLngsIC1yYXkucG9zaXRpb24ueSApICk7XG5cbiAgICBjb25zdCBwMCA9IGludmVyc2VNYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLl9zdGFydCApO1xuICAgIGNvbnN0IHAxID0gaW52ZXJzZU1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wgKTtcbiAgICBjb25zdCBwMiA9IGludmVyc2VNYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLl9lbmQgKTtcblxuICAgIC8vKDEtdCleMiBzdGFydCArIDIoMS10KXQgY29udHJvbCArIHReMiBlbmRcbiAgICBjb25zdCBhID0gcDAueSAtIDIgKiBwMS55ICsgcDIueTtcbiAgICBjb25zdCBiID0gLTIgKiBwMC55ICsgMiAqIHAxLnk7XG4gICAgY29uc3QgYyA9IHAwLnk7XG5cbiAgICBjb25zdCB0cyA9IHNvbHZlUXVhZHJhdGljUm9vdHNSZWFsKCBhLCBiLCBjICk7XG5cbiAgICBfLmVhY2goIHRzLCB0ID0+IHtcbiAgICAgIGlmICggdCA+PSAwICYmIHQgPD0gMSApIHtcbiAgICAgICAgY29uc3QgaGl0UG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIHQgKTtcbiAgICAgICAgY29uc3QgdW5pdFRhbmdlbnQgPSB0aGlzLnRhbmdlbnRBdCggdCApLm5vcm1hbGl6ZWQoKTtcbiAgICAgICAgY29uc3QgcGVycCA9IHVuaXRUYW5nZW50LnBlcnBlbmRpY3VsYXI7XG4gICAgICAgIGNvbnN0IHRvSGl0ID0gaGl0UG9pbnQubWludXMoIHJheS5wb3NpdGlvbiApO1xuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSBpdCdzIG5vdCBiZWhpbmQgdGhlIHJheVxuICAgICAgICBpZiAoIHRvSGl0LmRvdCggcmF5LmRpcmVjdGlvbiApID4gMCApIHtcbiAgICAgICAgICBjb25zdCBub3JtYWwgPSBwZXJwLmRvdCggcmF5LmRpcmVjdGlvbiApID4gMCA/IHBlcnAubmVnYXRlZCgpIDogcGVycDtcbiAgICAgICAgICBjb25zdCB3aW5kID0gcmF5LmRpcmVjdGlvbi5wZXJwZW5kaWN1bGFyLmRvdCggdW5pdFRhbmdlbnQgKSA8IDAgPyAxIDogLTE7XG4gICAgICAgICAgcmVzdWx0LnB1c2goIG5ldyBSYXlJbnRlcnNlY3Rpb24oIHRvSGl0Lm1hZ25pdHVkZSwgaGl0UG9pbnQsIG5vcm1hbCwgd2luZCwgdCApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3aW5kaW5nIG51bWJlciBmb3IgaW50ZXJzZWN0aW9uIHdpdGggYSByYXlcbiAgICovXG4gIHB1YmxpYyB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogbnVtYmVyIHtcbiAgICBsZXQgd2luZCA9IDA7XG4gICAgY29uc3QgaGl0cyA9IHRoaXMuaW50ZXJzZWN0aW9uKCByYXkgKTtcbiAgICBfLmVhY2goIGhpdHMsIGhpdCA9PiB7XG4gICAgICB3aW5kICs9IGhpdC53aW5kO1xuICAgIH0gKTtcbiAgICByZXR1cm4gd2luZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgc2VnbWVudCB0byB0aGUgMkQgQ2FudmFzIGNvbnRleHQsIGFzc3VtaW5nIHRoZSBjb250ZXh0J3MgY3VycmVudCBsb2NhdGlvbiBpcyBhbHJlYWR5IGF0IHRoZSBzdGFydCBwb2ludFxuICAgKi9cbiAgcHVibGljIHdyaXRlVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XG4gICAgY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKCB0aGlzLl9jb250cm9sLngsIHRoaXMuX2NvbnRyb2wueSwgdGhpcy5fZW5kLngsIHRoaXMuX2VuZC55ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBxdWFkcmF0aWMgdGhhdCByZXByZXNlbnRzIHRoaXMgcXVhZHJhdGljIGFmdGVyIHRyYW5zZm9ybWF0aW9uIGJ5IHRoZSBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyB0cmFuc2Zvcm1lZCggbWF0cml4OiBNYXRyaXgzICk6IFF1YWRyYXRpYyB7XG4gICAgcmV0dXJuIG5ldyBRdWFkcmF0aWMoIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX3N0YXJ0ICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2NvbnRyb2wgKSwgbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fZW5kICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb250cmlidXRpb24gdG8gdGhlIHNpZ25lZCBhcmVhIGNvbXB1dGVkIHVzaW5nIEdyZWVuJ3MgVGhlb3JlbSwgd2l0aCBQPS15LzIgYW5kIFE9eC8yLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIHRoaXMgc2VnbWVudCdzIGNvbnRyaWJ1dGlvbiB0byB0aGUgbGluZSBpbnRlZ3JhbCAoLXkvMiBkeCArIHgvMiBkeSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2lnbmVkQXJlYUZyYWdtZW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDEgLyA2ICogKFxuICAgICAgdGhpcy5fc3RhcnQueCAqICggMiAqIHRoaXMuX2NvbnRyb2wueSArIHRoaXMuX2VuZC55ICkgK1xuICAgICAgdGhpcy5fY29udHJvbC54ICogKCAtMiAqIHRoaXMuX3N0YXJ0LnkgKyAyICogdGhpcy5fZW5kLnkgKSArXG4gICAgICB0aGlzLl9lbmQueCAqICggLXRoaXMuX3N0YXJ0LnkgLSAyICogdGhpcy5fY29udHJvbC55IClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHRoZSBjdXJyZW50IGN1cnZlIHBhcmFtZXRlcml6ZWQgYnkgdCwgd2lsbCByZXR1cm4gYSBjdXJ2ZSBwYXJhbWV0ZXJpemVkIGJ5IHggd2hlcmUgdCA9IGEgKiB4ICsgYlxuICAgKi9cbiAgcHVibGljIHJlcGFyYW1ldGVyaXplZCggYTogbnVtYmVyLCBiOiBudW1iZXIgKTogUXVhZHJhdGljIHtcbiAgICAvLyB0byB0aGUgcG9seW5vbWlhbCBwdF4yICsgcXQgKyByOlxuICAgIGNvbnN0IHAgPSB0aGlzLl9zdGFydC5wbHVzKCB0aGlzLl9lbmQucGx1cyggdGhpcy5fY29udHJvbC50aW1lc1NjYWxhciggLTIgKSApICk7XG4gICAgY29uc3QgcSA9IHRoaXMuX2NvbnRyb2wubWludXMoIHRoaXMuX3N0YXJ0ICkudGltZXNTY2FsYXIoIDIgKTtcbiAgICBjb25zdCByID0gdGhpcy5fc3RhcnQ7XG5cbiAgICAvLyB0byB0aGUgcG9seW5vbWlhbCBhbHBoYSp4XjIgKyBiZXRhKnggKyBnYW1tYTpcbiAgICBjb25zdCBhbHBoYSA9IHAudGltZXNTY2FsYXIoIGEgKiBhICk7XG4gICAgY29uc3QgYmV0YSA9IHAudGltZXNTY2FsYXIoIGEgKiBiICkudGltZXNTY2FsYXIoIDIgKS5wbHVzKCBxLnRpbWVzU2NhbGFyKCBhICkgKTtcbiAgICBjb25zdCBnYW1tYSA9IHAudGltZXNTY2FsYXIoIGIgKiBiICkucGx1cyggcS50aW1lc1NjYWxhciggYiApICkucGx1cyggciApO1xuXG4gICAgLy8gYmFjayB0byB0aGUgZm9ybSBzdGFydCxjb250cm9sLGVuZFxuICAgIHJldHVybiBuZXcgUXVhZHJhdGljKCBnYW1tYSwgYmV0YS50aW1lc1NjYWxhciggMC41ICkucGx1cyggZ2FtbWEgKSwgYWxwaGEucGx1cyggYmV0YSApLnBsdXMoIGdhbW1hICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZWQgY29weSBvZiB0aGlzIHNlZ21lbnQgKG1hcHBpbmcgdGhlIHBhcmFtZXRyaXphdGlvbiBmcm9tIFswLDFdID0+IFsxLDBdKS5cbiAgICovXG4gIHB1YmxpYyByZXZlcnNlZCgpOiBRdWFkcmF0aWMge1xuICAgIHJldHVybiBuZXcgUXVhZHJhdGljKCB0aGlzLl9lbmQsIHRoaXMuX2NvbnRyb2wsIHRoaXMuX3N0YXJ0ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICovXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZFF1YWRyYXRpYyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdRdWFkcmF0aWMnLFxuICAgICAgc3RhcnRYOiB0aGlzLl9zdGFydC54LFxuICAgICAgc3RhcnRZOiB0aGlzLl9zdGFydC55LFxuICAgICAgY29udHJvbFg6IHRoaXMuX2NvbnRyb2wueCxcbiAgICAgIGNvbnRyb2xZOiB0aGlzLl9jb250cm9sLnksXG4gICAgICBlbmRYOiB0aGlzLl9lbmQueCxcbiAgICAgIGVuZFk6IHRoaXMuX2VuZC55XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gbGluZXMgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxuICAgKlxuICAgKiBAcGFyYW0gc2VnbWVudFxuICAgKiBAcGFyYW0gW2Vwc2lsb25dIC0gV2lsbCByZXR1cm4gb3ZlcmxhcHMgb25seSBpZiBubyB0d28gY29ycmVzcG9uZGluZyBwb2ludHMgZGlmZmVyIGJ5IHRoaXMgYW1vdW50IG9yIG1vcmUgaW4gb25lIGNvbXBvbmVudC5cbiAgICogQHJldHVybnMgLSBUaGUgc29sdXRpb24sIGlmIHRoZXJlIGlzIG9uZSAoYW5kIG9ubHkgb25lKVxuICAgKi9cbiAgcHVibGljIGdldE92ZXJsYXBzKCBzZWdtZW50OiBTZWdtZW50LCBlcHNpbG9uID0gMWUtNiApOiBPdmVybGFwW10gfCBudWxsIHtcbiAgICBpZiAoIHNlZ21lbnQgaW5zdGFuY2VvZiBRdWFkcmF0aWMgKSB7XG4gICAgICByZXR1cm4gUXVhZHJhdGljLmdldE92ZXJsYXBzKCB0aGlzLCBzZWdtZW50ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFF1YWRyYXRpYyBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkUXVhZHJhdGljICk6IFF1YWRyYXRpYyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdRdWFkcmF0aWMnICk7XG5cbiAgICByZXR1cm4gbmV3IFF1YWRyYXRpYyggbmV3IFZlY3RvcjIoIG9iai5zdGFydFgsIG9iai5zdGFydFkgKSwgbmV3IFZlY3RvcjIoIG9iai5jb250cm9sWCwgb2JqLmNvbnRyb2xZICksIG5ldyBWZWN0b3IyKCBvYmouZW5kWCwgb2JqLmVuZFkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uZS1kaW1lbnNpb25hbCBzb2x1dGlvbiB0byBleHRyZW1hXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGV4dHJlbWFUKCBzdGFydDogbnVtYmVyLCBjb250cm9sOiBudW1iZXIsIGVuZDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgLy8gY29tcHV0ZSB0IHdoZXJlIHRoZSBkZXJpdmF0aXZlIGlzIDAgKHVzZWQgZm9yIGJvdW5kcyBhbmQgb3RoZXIgdGhpbmdzKVxuICAgIGNvbnN0IGRpdmlzb3JYID0gMiAqICggZW5kIC0gMiAqIGNvbnRyb2wgKyBzdGFydCApO1xuICAgIGlmICggZGl2aXNvclggIT09IDAgKSB7XG4gICAgICByZXR1cm4gLTIgKiAoIGNvbnRyb2wgLSBzdGFydCApIC8gZGl2aXNvclg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIFF1YWRyYXRpY3Mgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxuICAgKlxuICAgKiBOT1RFOiBmb3IgdGhpcyBwYXJ0aWN1bGFyIGZ1bmN0aW9uLCB3ZSBhc3N1bWUgd2UncmUgbm90IGRlZ2VuZXJhdGUuIFRoaW5ncyBtYXkgd29yayBpZiB3ZSBjYW4gYmUgZGVncmVlLXJlZHVjZWRcbiAgICogdG8gYSBxdWFkcmF0aWMsIGJ1dCBnZW5lcmFsbHkgdGhhdCBzaG91bGRuJ3QgYmUgZG9uZS5cbiAgICpcbiAgICogQHBhcmFtIHF1YWRyYXRpYzFcbiAgICogQHBhcmFtIHF1YWRyYXRpYzJcbiAgICogQHBhcmFtIFtlcHNpbG9uXSAtIFdpbGwgcmV0dXJuIG92ZXJsYXBzIG9ubHkgaWYgbm8gdHdvIGNvcnJlc3BvbmRpbmcgcG9pbnRzIGRpZmZlciBieSB0aGlzIGFtb3VudCBvciBtb3JlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgY29tcG9uZW50LlxuICAgKiBAcmV0dXJucyAtIFRoZSBzb2x1dGlvbiwgaWYgdGhlcmUgaXMgb25lIChhbmQgb25seSBvbmUpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBzKCBxdWFkcmF0aWMxOiBRdWFkcmF0aWMsIHF1YWRyYXRpYzI6IFF1YWRyYXRpYywgZXBzaWxvbiA9IDFlLTYgKTogT3ZlcmxhcFtdIHtcblxuICAgIC8qXG4gICAgICogTk9URTogRm9yIGltcGxlbWVudGF0aW9uIGRldGFpbHMgaW4gdGhpcyBmdW5jdGlvbiwgcGxlYXNlIHNlZSBDdWJpYy5nZXRPdmVybGFwcy4gSXQgZ29lcyBvdmVyIGFsbCBvZiB0aGVcbiAgICAgKiBzYW1lIGltcGxlbWVudGF0aW9uIGRldGFpbHMsIGJ1dCBpbnN0ZWFkIG91ciBiZXppZXIgbWF0cml4IGlzIGEgM3gzOlxuICAgICAqXG4gICAgICogWyAgMSAgMCAgMCBdXG4gICAgICogWyAtMiAgMiAgMCBdXG4gICAgICogWyAgMSAtMiAgMSBdXG4gICAgICpcbiAgICAgKiBBbmQgd2UgdXNlIHRoZSB1cHBlci1sZWZ0IHNlY3Rpb24gb2YgKGF0K2IpIGFkanVzdG1lbnQgbWF0cml4IHJlbGV2YW50IGZvciB0aGUgcXVhZHJhdGljLlxuICAgICAqL1xuXG4gICAgY29uc3Qgbm9PdmVybGFwOiBPdmVybGFwW10gPSBbXTtcblxuICAgIC8vIEVmZmljaWVudGx5IGNvbXB1dGUgdGhlIG11bHRpcGxpY2F0aW9uIG9mIHRoZSBiZXppZXIgbWF0cml4OlxuICAgIGNvbnN0IHAweCA9IHF1YWRyYXRpYzEuX3N0YXJ0Lng7XG4gICAgY29uc3QgcDF4ID0gLTIgKiBxdWFkcmF0aWMxLl9zdGFydC54ICsgMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueDtcbiAgICBjb25zdCBwMnggPSBxdWFkcmF0aWMxLl9zdGFydC54IC0gMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueCArIHF1YWRyYXRpYzEuX2VuZC54O1xuICAgIGNvbnN0IHAweSA9IHF1YWRyYXRpYzEuX3N0YXJ0Lnk7XG4gICAgY29uc3QgcDF5ID0gLTIgKiBxdWFkcmF0aWMxLl9zdGFydC55ICsgMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueTtcbiAgICBjb25zdCBwMnkgPSBxdWFkcmF0aWMxLl9zdGFydC55IC0gMiAqIHF1YWRyYXRpYzEuX2NvbnRyb2wueSArIHF1YWRyYXRpYzEuX2VuZC55O1xuICAgIGNvbnN0IHEweCA9IHF1YWRyYXRpYzIuX3N0YXJ0Lng7XG4gICAgY29uc3QgcTF4ID0gLTIgKiBxdWFkcmF0aWMyLl9zdGFydC54ICsgMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueDtcbiAgICBjb25zdCBxMnggPSBxdWFkcmF0aWMyLl9zdGFydC54IC0gMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueCArIHF1YWRyYXRpYzIuX2VuZC54O1xuICAgIGNvbnN0IHEweSA9IHF1YWRyYXRpYzIuX3N0YXJ0Lnk7XG4gICAgY29uc3QgcTF5ID0gLTIgKiBxdWFkcmF0aWMyLl9zdGFydC55ICsgMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueTtcbiAgICBjb25zdCBxMnkgPSBxdWFkcmF0aWMyLl9zdGFydC55IC0gMiAqIHF1YWRyYXRpYzIuX2NvbnRyb2wueSArIHF1YWRyYXRpYzIuX2VuZC55O1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBjYW5kaWRhdGUgb3ZlcmxhcCAocHJlZmVycmluZyB0aGUgZGltZW5zaW9uIHdpdGggdGhlIGxhcmdlc3QgdmFyaWF0aW9uKVxuICAgIGNvbnN0IHhTcHJlYWQgPSBNYXRoLmFicyggTWF0aC5tYXgoIHF1YWRyYXRpYzEuX3N0YXJ0LngsIHF1YWRyYXRpYzEuX2NvbnRyb2wueCwgcXVhZHJhdGljMS5fZW5kLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWRyYXRpYzIuX3N0YXJ0LngsIHF1YWRyYXRpYzIuX2NvbnRyb2wueCwgcXVhZHJhdGljMi5fZW5kLnggKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbiggcXVhZHJhdGljMS5fc3RhcnQueCwgcXVhZHJhdGljMS5fY29udHJvbC54LCBxdWFkcmF0aWMxLl9lbmQueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhZHJhdGljMi5fc3RhcnQueCwgcXVhZHJhdGljMi5fY29udHJvbC54LCBxdWFkcmF0aWMyLl9lbmQueCApICk7XG4gICAgY29uc3QgeVNwcmVhZCA9IE1hdGguYWJzKCBNYXRoLm1heCggcXVhZHJhdGljMS5fc3RhcnQueSwgcXVhZHJhdGljMS5fY29udHJvbC55LCBxdWFkcmF0aWMxLl9lbmQueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhZHJhdGljMi5fc3RhcnQueSwgcXVhZHJhdGljMi5fY29udHJvbC55LCBxdWFkcmF0aWMyLl9lbmQueSApIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgubWluKCBxdWFkcmF0aWMxLl9zdGFydC55LCBxdWFkcmF0aWMxLl9jb250cm9sLnksIHF1YWRyYXRpYzEuX2VuZC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFkcmF0aWMyLl9zdGFydC55LCBxdWFkcmF0aWMyLl9jb250cm9sLnksIHF1YWRyYXRpYzIuX2VuZC55ICkgKTtcbiAgICBjb25zdCB4T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMoIHAweCwgcDF4LCBwMngsIHEweCwgcTF4LCBxMnggKTtcbiAgICBjb25zdCB5T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMoIHAweSwgcDF5LCBwMnksIHEweSwgcTF5LCBxMnkgKTtcbiAgICBsZXQgb3ZlcmxhcDtcbiAgICBpZiAoIHhTcHJlYWQgPiB5U3ByZWFkICkge1xuICAgICAgb3ZlcmxhcCA9ICggeE92ZXJsYXAgPT09IG51bGwgfHwgeE92ZXJsYXAgPT09IHRydWUgKSA/IHlPdmVybGFwIDogeE92ZXJsYXA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgb3ZlcmxhcCA9ICggeU92ZXJsYXAgPT09IG51bGwgfHwgeU92ZXJsYXAgPT09IHRydWUgKSA/IHhPdmVybGFwIDogeU92ZXJsYXA7XG4gICAgfVxuICAgIGlmICggb3ZlcmxhcCA9PT0gbnVsbCB8fCBvdmVybGFwID09PSB0cnVlICkge1xuICAgICAgcmV0dXJuIG5vT3ZlcmxhcDsgLy8gTm8gd2F5IHRvIHBpbiBkb3duIGFuIG92ZXJsYXBcbiAgICB9XG5cbiAgICBjb25zdCBhID0gb3ZlcmxhcC5hO1xuICAgIGNvbnN0IGIgPSBvdmVybGFwLmI7XG5cbiAgICBjb25zdCBhYSA9IGEgKiBhO1xuICAgIGNvbnN0IGJiID0gYiAqIGI7XG4gICAgY29uc3QgYWIyID0gMiAqIGEgKiBiO1xuXG4gICAgLy8gQ29tcHV0ZSBxdWFkcmF0aWMgY29lZmZpY2llbnRzIGZvciB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHAodCkgYW5kIHEoYSp0K2IpXG4gICAgY29uc3QgZDB4ID0gcTB4ICsgYiAqIHExeCArIGJiICogcTJ4IC0gcDB4O1xuICAgIGNvbnN0IGQxeCA9IGEgKiBxMXggKyBhYjIgKiBxMnggLSBwMXg7XG4gICAgY29uc3QgZDJ4ID0gYWEgKiBxMnggLSBwMng7XG4gICAgY29uc3QgZDB5ID0gcTB5ICsgYiAqIHExeSArIGJiICogcTJ5IC0gcDB5O1xuICAgIGNvbnN0IGQxeSA9IGEgKiBxMXkgKyBhYjIgKiBxMnkgLSBwMXk7XG4gICAgY29uc3QgZDJ5ID0gYWEgKiBxMnkgLSBwMnk7XG5cbiAgICAvLyBGaW5kIHRoZSB0IHZhbHVlcyB3aGVyZSBleHRyZW1lcyBsaWUgaW4gdGhlIFswLDFdIHJhbmdlIGZvciBlYWNoIDEtZGltZW5zaW9uYWwgcXVhZHJhdGljLiBXZSBkbyB0aGlzIGJ5XG4gICAgLy8gZGlmZmVyZW50aWF0aW5nIHRoZSBxdWFkcmF0aWMgYW5kIGZpbmRpbmcgdGhlIHJvb3RzIG9mIHRoZSByZXN1bHRpbmcgbGluZS5cbiAgICBjb25zdCB4Um9vdHMgPSBVdGlscy5zb2x2ZUxpbmVhclJvb3RzUmVhbCggMiAqIGQyeCwgZDF4ICk7XG4gICAgY29uc3QgeVJvb3RzID0gVXRpbHMuc29sdmVMaW5lYXJSb290c1JlYWwoIDIgKiBkMnksIGQxeSApO1xuICAgIGNvbnN0IHhFeHRyZW1lVHMgPSBfLnVuaXEoIFsgMCwgMSBdLmNvbmNhdCggeFJvb3RzID8geFJvb3RzLmZpbHRlciggaXNCZXR3ZWVuMEFuZDEgKSA6IFtdICkgKTtcbiAgICBjb25zdCB5RXh0cmVtZVRzID0gXy51bmlxKCBbIDAsIDEgXS5jb25jYXQoIHlSb290cyA/IHlSb290cy5maWx0ZXIoIGlzQmV0d2VlbjBBbmQxICkgOiBbXSApICk7XG5cbiAgICAvLyBFeGFtaW5lIHRoZSBzaW5nbGUtY29vcmRpbmF0ZSBkaXN0YW5jZXMgYmV0d2VlbiB0aGUgXCJvdmVybGFwc1wiIGF0IGVhY2ggZXh0cmVtZSBUIHZhbHVlLiBJZiB0aGUgZGlzdGFuY2UgaXMgbGFyZ2VyXG4gICAgLy8gdGhhbiBvdXIgZXBzaWxvbiwgdGhlbiB0aGUgXCJvdmVybGFwXCIgd291bGQgbm90IGJlIHZhbGlkLlxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHhFeHRyZW1lVHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB0ID0geEV4dHJlbWVUc1sgaSBdO1xuICAgICAgaWYgKCBNYXRoLmFicyggKCBkMnggKiB0ICsgZDF4ICkgKiB0ICsgZDB4ICkgPiBlcHNpbG9uICkge1xuICAgICAgICByZXR1cm4gbm9PdmVybGFwO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB5RXh0cmVtZVRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdCA9IHlFeHRyZW1lVHNbIGkgXTtcbiAgICAgIGlmICggTWF0aC5hYnMoICggZDJ5ICogdCArIGQxeSApICogdCArIGQweSApID4gZXBzaWxvbiApIHtcbiAgICAgICAgcmV0dXJuIG5vT3ZlcmxhcDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBxdDAgPSBiO1xuICAgIGNvbnN0IHF0MSA9IGEgKyBiO1xuXG4gICAgLy8gVE9ETzogZG8gd2Ugd2FudCBhbiBlcHNpbG9uIGluIGhlcmUgdG8gYmUgcGVybWlzc2l2ZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgaWYgKCAoIHF0MCA+IDEgJiYgcXQxID4gMSApIHx8ICggcXQwIDwgMCAmJiBxdDEgPCAwICkgKSB7XG4gICAgICByZXR1cm4gbm9PdmVybGFwO1xuICAgIH1cblxuICAgIHJldHVybiBbIG5ldyBPdmVybGFwKCBhLCBiICkgXTtcbiAgfVxuXG4gIC8vIERlZ3JlZSBvZiB0aGUgcG9seW5vbWlhbCAocXVhZHJhdGljKVxuICBwdWJsaWMgZGVncmVlITogbnVtYmVyO1xufVxuXG5RdWFkcmF0aWMucHJvdG90eXBlLmRlZ3JlZSA9IDI7XG5cbmtpdGUucmVnaXN0ZXIoICdRdWFkcmF0aWMnLCBRdWFkcmF0aWMgKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIk1hdHJpeDMiLCJVdGlscyIsIlZlY3RvcjIiLCJDdWJpYyIsImtpdGUiLCJMaW5lIiwiT3ZlcmxhcCIsIlJheUludGVyc2VjdGlvbiIsIlNlZ21lbnQiLCJzdmdOdW1iZXIiLCJzb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCIsImFyZVBvaW50c0NvbGxpbmVhciIsImlzQmV0d2VlbjBBbmQxIiwidCIsIlF1YWRyYXRpYyIsInNldFN0YXJ0Iiwic3RhcnQiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsInRvU3RyaW5nIiwiX3N0YXJ0IiwiZXF1YWxzIiwiaW52YWxpZGF0ZSIsInZhbHVlIiwiZ2V0U3RhcnQiLCJzZXRDb250cm9sIiwiY29udHJvbCIsIl9jb250cm9sIiwiZ2V0Q29udHJvbCIsInNldEVuZCIsImVuZCIsIl9lbmQiLCJnZXRFbmQiLCJwb3NpdGlvbkF0IiwibXQiLCJ0aW1lcyIsInBsdXMiLCJ0YW5nZW50QXQiLCJtaW51cyIsImN1cnZhdHVyZUF0IiwiZXBzaWxvbiIsIk1hdGgiLCJhYnMiLCJpc1plcm8iLCJwMCIsInAxIiwicDIiLCJkMTAiLCJhIiwibWFnbml0dWRlIiwiaCIsInBlcnBlbmRpY3VsYXIiLCJub3JtYWxpemVkIiwiZG90IiwiZGVncmVlIiwic3ViZGl2aWRlZCIsImxlZnRNaWQiLCJibGVuZCIsInJpZ2h0TWlkIiwibWlkIiwiX3N0YXJ0VGFuZ2VudCIsIl9lbmRUYW5nZW50IiwiX3RDcml0aWNhbFgiLCJfdENyaXRpY2FsWSIsIl9ib3VuZHMiLCJfc3ZnUGF0aEZyYWdtZW50IiwiaW52YWxpZGF0aW9uRW1pdHRlciIsImVtaXQiLCJnZXRTdGFydFRhbmdlbnQiLCJjb250cm9sSXNTdGFydCIsInN0YXJ0VGFuZ2VudCIsImdldEVuZFRhbmdlbnQiLCJjb250cm9sSXNFbmQiLCJlbmRUYW5nZW50IiwiZ2V0VENyaXRpY2FsWCIsImV4dHJlbWFUIiwieCIsInRDcml0aWNhbFgiLCJnZXRUQ3JpdGljYWxZIiwieSIsInRDcml0aWNhbFkiLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJzdGFydElzRW5kIiwic3RhcnRJc0NvbnRyb2wiLCJlbmRJc0NvbnRyb2wiLCJoYWxmUG9pbnQiLCJkZWx0YSIsInAxZCIsImlzTmFOIiwicHQiLCJfIiwiZmxhdHRlbiIsImdldEJvdW5kcyIsIm1pbiIsIm1heCIsIndpdGhQb2ludCIsImJvdW5kcyIsIm9mZnNldFRvIiwiciIsInJldmVyc2UiLCJjdXJ2ZXMiLCJkZXB0aCIsImkiLCJtYXAiLCJjdXJ2ZSIsIm9mZnNldEN1cnZlcyIsImFwcHJveGltYXRlT2Zmc2V0IiwicmV2ZXJzZWQiLCJkZWdyZWVFbGV2YXRlZCIsInRpbWVzU2NhbGFyIiwiZGl2aWRlZFNjYWxhciIsImdldFNWR1BhdGhGcmFnbWVudCIsIm9sZFBhdGhGcmFnbWVudCIsInN0cm9rZUxlZnQiLCJsaW5lV2lkdGgiLCJzdHJva2VSaWdodCIsImdldEludGVyaW9yRXh0cmVtYVRzIiwicmVzdWx0IiwiY3JpdGljYWxYIiwiY3JpdGljYWxZIiwicHVzaCIsInNvcnQiLCJpbnRlcnNlY3Rpb24iLCJyYXkiLCJpbnZlcnNlTWF0cml4Iiwicm90YXRpb24yIiwiZGlyZWN0aW9uIiwiYW5nbGUiLCJ0aW1lc01hdHJpeCIsInRyYW5zbGF0aW9uIiwicG9zaXRpb24iLCJ0aW1lc1ZlY3RvcjIiLCJiIiwiYyIsInRzIiwiZWFjaCIsImhpdFBvaW50IiwidW5pdFRhbmdlbnQiLCJwZXJwIiwidG9IaXQiLCJub3JtYWwiLCJuZWdhdGVkIiwid2luZCIsIndpbmRpbmdJbnRlcnNlY3Rpb24iLCJoaXRzIiwiaGl0Iiwid3JpdGVUb0NvbnRleHQiLCJjb250ZXh0IiwicXVhZHJhdGljQ3VydmVUbyIsInRyYW5zZm9ybWVkIiwibWF0cml4IiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwicmVwYXJhbWV0ZXJpemVkIiwicCIsInEiLCJhbHBoYSIsImJldGEiLCJnYW1tYSIsInNlcmlhbGl6ZSIsInR5cGUiLCJzdGFydFgiLCJzdGFydFkiLCJjb250cm9sWCIsImNvbnRyb2xZIiwiZW5kWCIsImVuZFkiLCJnZXRPdmVybGFwcyIsInNlZ21lbnQiLCJkZXNlcmlhbGl6ZSIsIm9iaiIsImRpdmlzb3JYIiwiTmFOIiwicXVhZHJhdGljMSIsInF1YWRyYXRpYzIiLCJub092ZXJsYXAiLCJwMHgiLCJwMXgiLCJwMngiLCJwMHkiLCJwMXkiLCJwMnkiLCJxMHgiLCJxMXgiLCJxMngiLCJxMHkiLCJxMXkiLCJxMnkiLCJ4U3ByZWFkIiwieVNwcmVhZCIsInhPdmVybGFwIiwicG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMiLCJ5T3ZlcmxhcCIsIm92ZXJsYXAiLCJhYSIsImJiIiwiYWIyIiwiZDB4IiwiZDF4IiwiZDJ4IiwiZDB5IiwiZDF5IiwiZDJ5IiwieFJvb3RzIiwic29sdmVMaW5lYXJSb290c1JlYWwiLCJ5Um9vdHMiLCJ4RXh0cmVtZVRzIiwidW5pcSIsImNvbmNhdCIsImZpbHRlciIsInlFeHRyZW1lVHMiLCJsZW5ndGgiLCJxdDAiLCJxdDEiLCJwcm90b3R5cGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGFBQWEsNkJBQTZCO0FBRWpELE9BQU9DLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLFNBQVMsUUFBUSxnQkFBZ0I7QUFFaEcsWUFBWTtBQUNaLE1BQU1DLDBCQUEwQlQsTUFBTVMsdUJBQXVCO0FBQzdELE1BQU1DLHFCQUFxQlYsTUFBTVUsa0JBQWtCO0FBRW5ELDJCQUEyQjtBQUMzQixTQUFTQyxlQUFnQkMsQ0FBUztJQUNoQyxPQUFPQSxLQUFLLEtBQUtBLEtBQUs7QUFDeEI7QUFZZSxJQUFBLEFBQU1DLFlBQU4sTUFBTUEsa0JBQWtCTjtJQTZCckM7O0dBRUMsR0FDRCxBQUFPTyxTQUFVQyxLQUFjLEVBQVM7UUFDdENDLFVBQVVBLE9BQVFELE1BQU1FLFFBQVEsSUFBSSxDQUFDLGtDQUFrQyxFQUFFRixNQUFNRyxRQUFRLElBQUk7UUFFM0YsSUFBSyxDQUFDLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxNQUFNLENBQUVMLFFBQVU7WUFDbEMsSUFBSSxDQUFDSSxNQUFNLEdBQUdKO1lBQ2QsSUFBSSxDQUFDTSxVQUFVO1FBQ2pCO1FBQ0EsT0FBTyxJQUFJLEVBQUUsaUJBQWlCO0lBQ2hDO0lBRUEsSUFBV04sTUFBT08sS0FBYyxFQUFHO1FBQUUsSUFBSSxDQUFDUixRQUFRLENBQUVRO0lBQVM7SUFFN0QsSUFBV1AsUUFBaUI7UUFBRSxPQUFPLElBQUksQ0FBQ1EsUUFBUTtJQUFJO0lBRXREOztHQUVDLEdBQ0QsQUFBT0EsV0FBb0I7UUFDekIsT0FBTyxJQUFJLENBQUNKLE1BQU07SUFDcEI7SUFHQTs7R0FFQyxHQUNELEFBQU9LLFdBQVlDLE9BQWdCLEVBQVM7UUFDMUNULFVBQVVBLE9BQVFTLFFBQVFSLFFBQVEsSUFBSSxDQUFDLG9DQUFvQyxFQUFFUSxRQUFRUCxRQUFRLElBQUk7UUFFakcsSUFBSyxDQUFDLElBQUksQ0FBQ1EsUUFBUSxDQUFDTixNQUFNLENBQUVLLFVBQVk7WUFDdEMsSUFBSSxDQUFDQyxRQUFRLEdBQUdEO1lBQ2hCLElBQUksQ0FBQ0osVUFBVTtRQUNqQjtRQUNBLE9BQU8sSUFBSSxFQUFFLGlCQUFpQjtJQUNoQztJQUVBLElBQVdJLFFBQVNILEtBQWMsRUFBRztRQUFFLElBQUksQ0FBQ0UsVUFBVSxDQUFFRjtJQUFTO0lBRWpFLElBQVdHLFVBQW1CO1FBQUUsT0FBTyxJQUFJLENBQUNFLFVBQVU7SUFBSTtJQUUxRDs7R0FFQyxHQUNELEFBQU9BLGFBQXNCO1FBQzNCLE9BQU8sSUFBSSxDQUFDRCxRQUFRO0lBQ3RCO0lBR0E7O0dBRUMsR0FDRCxBQUFPRSxPQUFRQyxHQUFZLEVBQVM7UUFDbENiLFVBQVVBLE9BQVFhLElBQUlaLFFBQVEsSUFBSSxDQUFDLGdDQUFnQyxFQUFFWSxJQUFJWCxRQUFRLElBQUk7UUFFckYsSUFBSyxDQUFDLElBQUksQ0FBQ1ksSUFBSSxDQUFDVixNQUFNLENBQUVTLE1BQVE7WUFDOUIsSUFBSSxDQUFDQyxJQUFJLEdBQUdEO1lBQ1osSUFBSSxDQUFDUixVQUFVO1FBQ2pCO1FBQ0EsT0FBTyxJQUFJLEVBQUUsaUJBQWlCO0lBQ2hDO0lBRUEsSUFBV1EsSUFBS1AsS0FBYyxFQUFHO1FBQUUsSUFBSSxDQUFDTSxNQUFNLENBQUVOO0lBQVM7SUFFekQsSUFBV08sTUFBZTtRQUFFLE9BQU8sSUFBSSxDQUFDRSxNQUFNO0lBQUk7SUFFbEQ7O0dBRUMsR0FDRCxBQUFPQSxTQUFrQjtRQUN2QixPQUFPLElBQUksQ0FBQ0QsSUFBSTtJQUNsQjtJQUdBOzs7Ozs7O0dBT0MsR0FDRCxBQUFPRSxXQUFZcEIsQ0FBUyxFQUFZO1FBQ3RDSSxVQUFVQSxPQUFRSixLQUFLLEdBQUc7UUFDMUJJLFVBQVVBLE9BQVFKLEtBQUssR0FBRztRQUUxQixNQUFNcUIsS0FBSyxJQUFJckI7UUFDZix1RUFBdUU7UUFDdkUsd0VBQXdFO1FBQ3hFLE9BQU8sSUFBSSxDQUFDTyxNQUFNLENBQUNlLEtBQUssQ0FBRUQsS0FBS0EsSUFBS0UsSUFBSSxDQUFFLElBQUksQ0FBQ1QsUUFBUSxDQUFDUSxLQUFLLENBQUUsSUFBSUQsS0FBS3JCLElBQU11QixJQUFJLENBQUUsSUFBSSxDQUFDTCxJQUFJLENBQUNJLEtBQUssQ0FBRXRCLElBQUlBO0lBQzNHO0lBRUE7Ozs7Ozs7R0FPQyxHQUNELEFBQU93QixVQUFXeEIsQ0FBUyxFQUFZO1FBQ3JDSSxVQUFVQSxPQUFRSixLQUFLLEdBQUc7UUFDMUJJLFVBQVVBLE9BQVFKLEtBQUssR0FBRztRQUUxQixzR0FBc0c7UUFDdEcsd0VBQXdFO1FBQ3hFLE9BQU8sSUFBSSxDQUFDYyxRQUFRLENBQUNXLEtBQUssQ0FBRSxJQUFJLENBQUNsQixNQUFNLEVBQUdlLEtBQUssQ0FBRSxJQUFNLENBQUEsSUFBSXRCLENBQUFBLEdBQU11QixJQUFJLENBQUUsSUFBSSxDQUFDTCxJQUFJLENBQUNPLEtBQUssQ0FBRSxJQUFJLENBQUNYLFFBQVEsRUFBR1EsS0FBSyxDQUFFLElBQUl0QjtJQUNySDtJQUVBOzs7Ozs7Ozs7O0dBVUMsR0FDRCxBQUFPMEIsWUFBYTFCLENBQVMsRUFBVztRQUN0Q0ksVUFBVUEsT0FBUUosS0FBSyxHQUFHO1FBQzFCSSxVQUFVQSxPQUFRSixLQUFLLEdBQUc7UUFFMUIsbURBQW1EO1FBQ25ELHNGQUFzRjtRQUN0RixNQUFNMkIsVUFBVTtRQUNoQixJQUFLQyxLQUFLQyxHQUFHLENBQUU3QixJQUFJLE9BQVEsTUFBTTJCLFNBQVU7WUFDekMsTUFBTUcsU0FBUzlCLElBQUk7WUFDbkIsTUFBTStCLEtBQUtELFNBQVMsSUFBSSxDQUFDdkIsTUFBTSxHQUFHLElBQUksQ0FBQ1csSUFBSTtZQUMzQyxNQUFNYyxLQUFLLElBQUksQ0FBQ2xCLFFBQVE7WUFDeEIsTUFBTW1CLEtBQUtILFNBQVMsSUFBSSxDQUFDWixJQUFJLEdBQUcsSUFBSSxDQUFDWCxNQUFNO1lBQzNDLE1BQU0yQixNQUFNRixHQUFHUCxLQUFLLENBQUVNO1lBQ3RCLE1BQU1JLElBQUlELElBQUlFLFNBQVM7WUFDdkIsTUFBTUMsSUFBSSxBQUFFUCxDQUFBQSxTQUFTLENBQUMsSUFBSSxDQUFBLElBQU1JLElBQUlJLGFBQWEsQ0FBQ0MsVUFBVSxHQUFHQyxHQUFHLENBQUVQLEdBQUdSLEtBQUssQ0FBRU87WUFDOUUsT0FBTyxBQUFFSyxJQUFNLENBQUEsSUFBSSxDQUFDSSxNQUFNLEdBQUcsQ0FBQSxJQUFVLENBQUEsSUFBSSxDQUFDQSxNQUFNLEdBQUdOLElBQUlBLENBQUFBO1FBQzNELE9BQ0s7WUFDSCxPQUFPLElBQUksQ0FBQ08sVUFBVSxDQUFFMUMsRUFBRyxDQUFFLEVBQUcsQ0FBQzBCLFdBQVcsQ0FBRTtRQUNoRDtJQUNGO0lBRUE7Ozs7O0dBS0MsR0FDRCxBQUFPZ0IsV0FBWTFDLENBQVMsRUFBZ0I7UUFDMUNJLFVBQVVBLE9BQVFKLEtBQUssR0FBRztRQUMxQkksVUFBVUEsT0FBUUosS0FBSyxHQUFHO1FBRTFCLG1EQUFtRDtRQUNuRCxJQUFLQSxNQUFNLEtBQUtBLE1BQU0sR0FBSTtZQUN4QixPQUFPO2dCQUFFLElBQUk7YUFBRTtRQUNqQjtRQUVBLHNCQUFzQjtRQUN0QixNQUFNMkMsVUFBVSxJQUFJLENBQUNwQyxNQUFNLENBQUNxQyxLQUFLLENBQUUsSUFBSSxDQUFDOUIsUUFBUSxFQUFFZDtRQUNsRCxNQUFNNkMsV0FBVyxJQUFJLENBQUMvQixRQUFRLENBQUM4QixLQUFLLENBQUUsSUFBSSxDQUFDMUIsSUFBSSxFQUFFbEI7UUFDakQsTUFBTThDLE1BQU1ILFFBQVFDLEtBQUssQ0FBRUMsVUFBVTdDO1FBQ3JDLE9BQU87WUFDTCxJQUFJQyxVQUFXLElBQUksQ0FBQ00sTUFBTSxFQUFFb0MsU0FBU0c7WUFDckMsSUFBSTdDLFVBQVc2QyxLQUFLRCxVQUFVLElBQUksQ0FBQzNCLElBQUk7U0FDeEM7SUFDSDtJQUVBOztHQUVDLEdBQ0QsQUFBT1QsYUFBbUI7UUFDeEJMLFVBQVVBLE9BQVEsSUFBSSxDQUFDRyxNQUFNLFlBQVlsQixTQUFTLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDa0IsTUFBTSxFQUFFO1FBQ3ZHSCxVQUFVQSxPQUFRLElBQUksQ0FBQ0csTUFBTSxDQUFDRixRQUFRLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUNFLE1BQU0sQ0FBQ0QsUUFBUSxJQUFJO1FBQ3ZHRixVQUFVQSxPQUFRLElBQUksQ0FBQ1UsUUFBUSxZQUFZekIsU0FBUyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQ3lCLFFBQVEsRUFBRTtRQUM3R1YsVUFBVUEsT0FBUSxJQUFJLENBQUNVLFFBQVEsQ0FBQ1QsUUFBUSxJQUFJLENBQUMsb0NBQW9DLEVBQUUsSUFBSSxDQUFDUyxRQUFRLENBQUNSLFFBQVEsSUFBSTtRQUM3R0YsVUFBVUEsT0FBUSxJQUFJLENBQUNjLElBQUksWUFBWTdCLFNBQVMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUM2QixJQUFJLEVBQUU7UUFDakdkLFVBQVVBLE9BQVEsSUFBSSxDQUFDYyxJQUFJLENBQUNiLFFBQVEsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLElBQUksQ0FBQ2EsSUFBSSxDQUFDWixRQUFRLElBQUk7UUFFakcsc0NBQXNDO1FBQ3RDLElBQUksQ0FBQ3lDLGFBQWEsR0FBRztRQUNyQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNuQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNuQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUVuQixJQUFJLENBQUNDLE9BQU8sR0FBRztRQUNmLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUc7UUFFeEIsSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ0MsSUFBSTtJQUMvQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0Msa0JBQTJCO1FBQ2hDLElBQUssSUFBSSxDQUFDUixhQUFhLEtBQUssTUFBTztZQUNqQyxNQUFNUyxpQkFBaUIsSUFBSSxDQUFDakQsTUFBTSxDQUFDQyxNQUFNLENBQUUsSUFBSSxDQUFDTSxRQUFRO1lBQ3hELHdFQUF3RTtZQUN4RSxJQUFJLENBQUNpQyxhQUFhLEdBQUdTLGlCQUNBLElBQUksQ0FBQ3RDLElBQUksQ0FBQ08sS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sRUFBR2dDLFVBQVUsS0FDekMsSUFBSSxDQUFDekIsUUFBUSxDQUFDVyxLQUFLLENBQUUsSUFBSSxDQUFDbEIsTUFBTSxFQUFHZ0MsVUFBVTtRQUNwRTtRQUNBLE9BQU8sSUFBSSxDQUFDUSxhQUFhO0lBQzNCO0lBRUEsSUFBV1UsZUFBd0I7UUFBRSxPQUFPLElBQUksQ0FBQ0YsZUFBZTtJQUFJO0lBRXBFOztHQUVDLEdBQ0QsQUFBT0csZ0JBQXlCO1FBQzlCLElBQUssSUFBSSxDQUFDVixXQUFXLEtBQUssTUFBTztZQUMvQixNQUFNVyxlQUFlLElBQUksQ0FBQ3pDLElBQUksQ0FBQ1YsTUFBTSxDQUFFLElBQUksQ0FBQ00sUUFBUTtZQUNwRCx3RUFBd0U7WUFDeEUsSUFBSSxDQUFDa0MsV0FBVyxHQUFHVyxlQUNBLElBQUksQ0FBQ3pDLElBQUksQ0FBQ08sS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sRUFBR2dDLFVBQVUsS0FDekMsSUFBSSxDQUFDckIsSUFBSSxDQUFDTyxLQUFLLENBQUUsSUFBSSxDQUFDWCxRQUFRLEVBQUd5QixVQUFVO1FBQ2hFO1FBQ0EsT0FBTyxJQUFJLENBQUNTLFdBQVc7SUFDekI7SUFFQSxJQUFXWSxhQUFzQjtRQUFFLE9BQU8sSUFBSSxDQUFDRixhQUFhO0lBQUk7SUFFekRHLGdCQUF3QjtRQUM3Qix5RUFBeUU7UUFDekUsSUFBSyxJQUFJLENBQUNaLFdBQVcsS0FBSyxNQUFPO1lBQy9CLElBQUksQ0FBQ0EsV0FBVyxHQUFHaEQsVUFBVTZELFFBQVEsQ0FBRSxJQUFJLENBQUN2RCxNQUFNLENBQUN3RCxDQUFDLEVBQUUsSUFBSSxDQUFDakQsUUFBUSxDQUFDaUQsQ0FBQyxFQUFFLElBQUksQ0FBQzdDLElBQUksQ0FBQzZDLENBQUM7UUFDcEY7UUFDQSxPQUFPLElBQUksQ0FBQ2QsV0FBVztJQUN6QjtJQUVBLElBQVdlLGFBQXFCO1FBQUUsT0FBTyxJQUFJLENBQUNILGFBQWE7SUFBSTtJQUV4REksZ0JBQXdCO1FBQzdCLHlFQUF5RTtRQUN6RSxJQUFLLElBQUksQ0FBQ2YsV0FBVyxLQUFLLE1BQU87WUFDL0IsSUFBSSxDQUFDQSxXQUFXLEdBQUdqRCxVQUFVNkQsUUFBUSxDQUFFLElBQUksQ0FBQ3ZELE1BQU0sQ0FBQzJELENBQUMsRUFBRSxJQUFJLENBQUNwRCxRQUFRLENBQUNvRCxDQUFDLEVBQUUsSUFBSSxDQUFDaEQsSUFBSSxDQUFDZ0QsQ0FBQztRQUNwRjtRQUNBLE9BQU8sSUFBSSxDQUFDaEIsV0FBVztJQUN6QjtJQUVBLElBQVdpQixhQUFxQjtRQUFFLE9BQU8sSUFBSSxDQUFDRixhQUFhO0lBQUk7SUFFL0Q7OztHQUdDLEdBQ0QsQUFBT0csMkJBQXNDO1FBQzNDLE1BQU1qRSxRQUFRLElBQUksQ0FBQ0ksTUFBTTtRQUN6QixNQUFNTSxVQUFVLElBQUksQ0FBQ0MsUUFBUTtRQUM3QixNQUFNRyxNQUFNLElBQUksQ0FBQ0MsSUFBSTtRQUVyQixNQUFNbUQsYUFBYWxFLE1BQU1LLE1BQU0sQ0FBRVM7UUFDakMsTUFBTXFELGlCQUFpQm5FLE1BQU1LLE1BQU0sQ0FBRUs7UUFDckMsTUFBTTBELGVBQWVwRSxNQUFNSyxNQUFNLENBQUVLO1FBRW5DLElBQUt3RCxjQUFjQyxnQkFBaUI7WUFDbEMsa0JBQWtCO1lBQ2xCLE9BQU8sRUFBRTtRQUNYLE9BQ0ssSUFBS0QsWUFBYTtZQUNyQix5RkFBeUY7WUFDekYsTUFBTUcsWUFBWSxJQUFJLENBQUNwRCxVQUFVLENBQUU7WUFDbkMsT0FBTztnQkFDTCxJQUFJNUIsS0FBTVcsT0FBT3FFO2dCQUNqQixJQUFJaEYsS0FBTWdGLFdBQVd2RDthQUN0QjtRQUNILE9BQ0ssSUFBS25CLG1CQUFvQkssT0FBT1UsU0FBU0ksTUFBUTtZQUNwRCwySEFBMkg7WUFDM0gsd0NBQXdDO1lBQ3hDLElBQUtxRCxrQkFBa0JDLGNBQWU7Z0JBQ3BDLHVCQUF1QjtnQkFDdkIsT0FBTztvQkFBRSxJQUFJL0UsS0FBTVcsT0FBT2M7aUJBQU8sRUFBRSxtREFBbUQ7WUFDeEY7WUFDQSx3SEFBd0g7WUFDeEgsTUFBTXdELFFBQVF4RCxJQUFJUSxLQUFLLENBQUV0QjtZQUN6QixNQUFNdUUsTUFBTTdELFFBQVFZLEtBQUssQ0FBRXRCLE9BQVFxQyxHQUFHLENBQUVpQyxNQUFNbEMsVUFBVSxNQUFPa0MsTUFBTXJDLFNBQVM7WUFDOUUsTUFBTXBDLElBQUlDLFVBQVU2RCxRQUFRLENBQUUsR0FBR1ksS0FBSztZQUN0QyxJQUFLLENBQUNDLE1BQU8zRSxNQUFPQSxJQUFJLEtBQUtBLElBQUksR0FBSTtnQkFDbkMsbUdBQW1HO2dCQUNuRyw0QkFBNEI7Z0JBQzVCLE1BQU00RSxLQUFLLElBQUksQ0FBQ3hELFVBQVUsQ0FBRXBCO2dCQUM1QixPQUFPNkUsRUFBRUMsT0FBTyxDQUFFO29CQUNoQixJQUFJdEYsS0FBTVcsT0FBT3lFLElBQUtSLHdCQUF3QjtvQkFDOUMsSUFBSTVFLEtBQU1vRixJQUFJM0QsS0FBTW1ELHdCQUF3QjtpQkFDN0M7WUFDSCxPQUNLO2dCQUNILDRFQUE0RTtnQkFDNUUsT0FBTztvQkFBRSxJQUFJNUUsS0FBTVcsT0FBT2M7aUJBQU8sRUFBRSxtREFBbUQ7WUFDeEY7UUFDRixPQUNLO1lBQ0gsT0FBTztnQkFBRSxJQUFJO2FBQUU7UUFDakI7SUFDRjtJQUVBOztHQUVDLEdBQ0QsQUFBTzhELFlBQXFCO1FBQzFCLDBFQUEwRTtRQUMxRSxJQUFLLElBQUksQ0FBQzVCLE9BQU8sS0FBSyxNQUFPO1lBQzNCLElBQUksQ0FBQ0EsT0FBTyxHQUFHLElBQUlqRSxRQUFTMEMsS0FBS29ELEdBQUcsQ0FBRSxJQUFJLENBQUN6RSxNQUFNLENBQUN3RCxDQUFDLEVBQUUsSUFBSSxDQUFDN0MsSUFBSSxDQUFDNkMsQ0FBQyxHQUFJbkMsS0FBS29ELEdBQUcsQ0FBRSxJQUFJLENBQUN6RSxNQUFNLENBQUMyRCxDQUFDLEVBQUUsSUFBSSxDQUFDaEQsSUFBSSxDQUFDZ0QsQ0FBQyxHQUFJdEMsS0FBS3FELEdBQUcsQ0FBRSxJQUFJLENBQUMxRSxNQUFNLENBQUN3RCxDQUFDLEVBQUUsSUFBSSxDQUFDN0MsSUFBSSxDQUFDNkMsQ0FBQyxHQUFJbkMsS0FBS3FELEdBQUcsQ0FBRSxJQUFJLENBQUMxRSxNQUFNLENBQUMyRCxDQUFDLEVBQUUsSUFBSSxDQUFDaEQsSUFBSSxDQUFDZ0QsQ0FBQztZQUV4TCxrRkFBa0Y7WUFDbEYsTUFBTUYsYUFBYSxJQUFJLENBQUNILGFBQWE7WUFDckMsTUFBTU0sYUFBYSxJQUFJLENBQUNGLGFBQWE7WUFFckMsSUFBSyxDQUFDVSxNQUFPWCxlQUFnQkEsYUFBYSxLQUFLQSxhQUFhLEdBQUk7Z0JBQzlELElBQUksQ0FBQ2IsT0FBTyxHQUFHLElBQUksQ0FBQ0EsT0FBTyxDQUFDK0IsU0FBUyxDQUFFLElBQUksQ0FBQzlELFVBQVUsQ0FBRTRDO1lBQzFEO1lBQ0EsSUFBSyxDQUFDVyxNQUFPUixlQUFnQkEsYUFBYSxLQUFLQSxhQUFhLEdBQUk7Z0JBQzlELElBQUksQ0FBQ2hCLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU8sQ0FBQytCLFNBQVMsQ0FBRSxJQUFJLENBQUM5RCxVQUFVLENBQUUrQztZQUMxRDtRQUNGO1FBQ0EsT0FBTyxJQUFJLENBQUNoQixPQUFPO0lBQ3JCO0lBRUEsSUFBV2dDLFNBQWtCO1FBQUUsT0FBTyxJQUFJLENBQUNKLFNBQVM7SUFBSTtJQUV4RCw4REFBOEQ7SUFDOUQsMkdBQTJHO0lBRTNHOzs7OztHQUtDLEdBQ0QsQUFBT0ssU0FBVUMsQ0FBUyxFQUFFQyxPQUFnQixFQUFnQjtRQUMxRCxrSkFBa0o7UUFDbEoseUtBQXlLO1FBQ3pLLElBQUlDLFNBQXNCO1lBQUUsSUFBSTtTQUFFO1FBRWxDLHVCQUF1QjtRQUN2QixNQUFNQyxRQUFRLEdBQUcsMkJBQTJCO1FBQzVDLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxPQUFPQyxJQUFNO1lBQ2hDRixTQUFTVixFQUFFQyxPQUFPLENBQUVELEVBQUVhLEdBQUcsQ0FBRUgsUUFBUSxDQUFFSSxRQUFzQkEsTUFBTWpELFVBQVUsQ0FBRTtRQUMvRTtRQUVBLElBQUlrRCxlQUFlZixFQUFFYSxHQUFHLENBQUVILFFBQVEsQ0FBRUksUUFBc0JBLE1BQU1FLGlCQUFpQixDQUFFUjtRQUVuRixJQUFLQyxTQUFVO1lBQ2JNLGFBQWFOLE9BQU87WUFDcEJNLGVBQWVmLEVBQUVhLEdBQUcsQ0FBRUUsY0FBYyxDQUFFRCxRQUFzQkEsTUFBTUcsUUFBUTtRQUM1RTtRQUVBLE9BQU9GO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU9HLGlCQUF3QjtRQUM3Qix3RUFBd0U7UUFDeEUsT0FBTyxJQUFJekcsTUFDVCxJQUFJLENBQUNpQixNQUFNLEVBQ1gsSUFBSSxDQUFDQSxNQUFNLENBQUNnQixJQUFJLENBQUUsSUFBSSxDQUFDVCxRQUFRLENBQUNrRixXQUFXLENBQUUsSUFBTUMsYUFBYSxDQUFFLElBQ2xFLElBQUksQ0FBQy9FLElBQUksQ0FBQ0ssSUFBSSxDQUFFLElBQUksQ0FBQ1QsUUFBUSxDQUFDa0YsV0FBVyxDQUFFLElBQU1DLGFBQWEsQ0FBRSxJQUNoRSxJQUFJLENBQUMvRSxJQUFJO0lBRWI7SUFFQTs7R0FFQyxHQUNELEFBQU8yRSxrQkFBbUJSLENBQVMsRUFBYztRQUMvQyxPQUFPLElBQUlwRixVQUNULElBQUksQ0FBQ00sTUFBTSxDQUFDZ0IsSUFBSSxDQUFFLEFBQUUsQ0FBQSxJQUFJLENBQUNoQixNQUFNLENBQUNDLE1BQU0sQ0FBRSxJQUFJLENBQUNNLFFBQVEsSUFBSyxJQUFJLENBQUNJLElBQUksQ0FBQ08sS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sSUFBSyxJQUFJLENBQUNPLFFBQVEsQ0FBQ1csS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sQ0FBQyxFQUFJK0IsYUFBYSxDQUFDQyxVQUFVLEdBQUdqQixLQUFLLENBQUUrRCxLQUNsSyxJQUFJLENBQUN2RSxRQUFRLENBQUNTLElBQUksQ0FBRSxJQUFJLENBQUNMLElBQUksQ0FBQ08sS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sRUFBRytCLGFBQWEsQ0FBQ0MsVUFBVSxHQUFHakIsS0FBSyxDQUFFK0QsS0FDckYsSUFBSSxDQUFDbkUsSUFBSSxDQUFDSyxJQUFJLENBQUUsQUFBRSxDQUFBLElBQUksQ0FBQ0wsSUFBSSxDQUFDVixNQUFNLENBQUUsSUFBSSxDQUFDTSxRQUFRLElBQUssSUFBSSxDQUFDSSxJQUFJLENBQUNPLEtBQUssQ0FBRSxJQUFJLENBQUNsQixNQUFNLElBQUssSUFBSSxDQUFDVyxJQUFJLENBQUNPLEtBQUssQ0FBRSxJQUFJLENBQUNYLFFBQVEsQ0FBQyxFQUFJd0IsYUFBYSxDQUFDQyxVQUFVLEdBQUdqQixLQUFLLENBQUUrRDtJQUVoSztJQUVBOztHQUVDLEdBQ0QsQUFBT2EscUJBQTZCO1FBQ2xDLElBQUlDO1FBQ0osSUFBSy9GLFFBQVM7WUFDWitGLGtCQUFrQixJQUFJLENBQUMvQyxnQkFBZ0I7WUFDdkMsSUFBSSxDQUFDQSxnQkFBZ0IsR0FBRztRQUMxQjtRQUNBLElBQUssQ0FBQyxJQUFJLENBQUNBLGdCQUFnQixFQUFHO1lBQzVCLElBQUksQ0FBQ0EsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLEVBQUV4RCxVQUFXLElBQUksQ0FBQ2tCLFFBQVEsQ0FBQ2lELENBQUMsRUFBRyxDQUFDLEVBQUVuRSxVQUFXLElBQUksQ0FBQ2tCLFFBQVEsQ0FBQ29ELENBQUMsRUFBRyxDQUFDLEVBQ3pGdEUsVUFBVyxJQUFJLENBQUNzQixJQUFJLENBQUM2QyxDQUFDLEVBQUcsQ0FBQyxFQUFFbkUsVUFBVyxJQUFJLENBQUNzQixJQUFJLENBQUNnRCxDQUFDLEdBQUk7UUFDMUQ7UUFDQSxJQUFLOUQsUUFBUztZQUNaLElBQUsrRixpQkFBa0I7Z0JBQ3JCL0YsT0FBUStGLG9CQUFvQixJQUFJLENBQUMvQyxnQkFBZ0IsRUFBRTtZQUNyRDtRQUNGO1FBQ0EsT0FBTyxJQUFJLENBQUNBLGdCQUFnQjtJQUM5QjtJQUVBOztHQUVDLEdBQ0QsQUFBT2dELFdBQVlDLFNBQWlCLEVBQWdCO1FBQ2xELE9BQU8sSUFBSSxDQUFDakIsUUFBUSxDQUFFLENBQUNpQixZQUFZLEdBQUc7SUFDeEM7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFlBQWFELFNBQWlCLEVBQWdCO1FBQ25ELE9BQU8sSUFBSSxDQUFDakIsUUFBUSxDQUFFaUIsWUFBWSxHQUFHO0lBQ3ZDO0lBRU9FLHVCQUFpQztRQUN0QyxnSUFBZ0k7UUFDaEksTUFBTUMsU0FBUyxFQUFFO1FBQ2pCLE1BQU03RSxVQUFVLGNBQWMseUVBQXlFO1FBRXZHLE1BQU04RSxZQUFZLElBQUksQ0FBQzVDLGFBQWE7UUFDcEMsTUFBTTZDLFlBQVksSUFBSSxDQUFDekMsYUFBYTtRQUVwQyxJQUFLLENBQUNVLE1BQU84QixjQUFlQSxZQUFZOUUsV0FBVzhFLFlBQVksSUFBSTlFLFNBQVU7WUFDM0U2RSxPQUFPRyxJQUFJLENBQUUsSUFBSSxDQUFDM0MsVUFBVTtRQUM5QjtRQUNBLElBQUssQ0FBQ1csTUFBTytCLGNBQWVBLFlBQVkvRSxXQUFXK0UsWUFBWSxJQUFJL0UsU0FBVTtZQUMzRTZFLE9BQU9HLElBQUksQ0FBRSxJQUFJLENBQUN4QyxVQUFVO1FBQzlCO1FBQ0EsT0FBT3FDLE9BQU9JLElBQUk7SUFDcEI7SUFFQTs7O0dBR0MsR0FDRCxBQUFPQyxhQUFjQyxHQUFTLEVBQXNCO1FBQ2xELE1BQU1OLFNBQTRCLEVBQUU7UUFFcEMsd0hBQXdIO1FBQ3hILE1BQU1PLGdCQUFnQjVILFFBQVE2SCxTQUFTLENBQUUsQ0FBQ0YsSUFBSUcsU0FBUyxDQUFDQyxLQUFLLEVBQUdDLFdBQVcsQ0FBRWhJLFFBQVFpSSxXQUFXLENBQUUsQ0FBQ04sSUFBSU8sUUFBUSxDQUFDdEQsQ0FBQyxFQUFFLENBQUMrQyxJQUFJTyxRQUFRLENBQUNuRCxDQUFDO1FBRWxJLE1BQU1uQyxLQUFLZ0YsY0FBY08sWUFBWSxDQUFFLElBQUksQ0FBQy9HLE1BQU07UUFDbEQsTUFBTXlCLEtBQUsrRSxjQUFjTyxZQUFZLENBQUUsSUFBSSxDQUFDeEcsUUFBUTtRQUNwRCxNQUFNbUIsS0FBSzhFLGNBQWNPLFlBQVksQ0FBRSxJQUFJLENBQUNwRyxJQUFJO1FBRWhELDJDQUEyQztRQUMzQyxNQUFNaUIsSUFBSUosR0FBR21DLENBQUMsR0FBRyxJQUFJbEMsR0FBR2tDLENBQUMsR0FBR2pDLEdBQUdpQyxDQUFDO1FBQ2hDLE1BQU1xRCxJQUFJLENBQUMsSUFBSXhGLEdBQUdtQyxDQUFDLEdBQUcsSUFBSWxDLEdBQUdrQyxDQUFDO1FBQzlCLE1BQU1zRCxJQUFJekYsR0FBR21DLENBQUM7UUFFZCxNQUFNdUQsS0FBSzVILHdCQUF5QnNDLEdBQUdvRixHQUFHQztRQUUxQzNDLEVBQUU2QyxJQUFJLENBQUVELElBQUl6SCxDQUFBQTtZQUNWLElBQUtBLEtBQUssS0FBS0EsS0FBSyxHQUFJO2dCQUN0QixNQUFNMkgsV0FBVyxJQUFJLENBQUN2RyxVQUFVLENBQUVwQjtnQkFDbEMsTUFBTTRILGNBQWMsSUFBSSxDQUFDcEcsU0FBUyxDQUFFeEIsR0FBSXVDLFVBQVU7Z0JBQ2xELE1BQU1zRixPQUFPRCxZQUFZdEYsYUFBYTtnQkFDdEMsTUFBTXdGLFFBQVFILFNBQVNsRyxLQUFLLENBQUVxRixJQUFJTyxRQUFRO2dCQUUxQyxvQ0FBb0M7Z0JBQ3BDLElBQUtTLE1BQU10RixHQUFHLENBQUVzRSxJQUFJRyxTQUFTLElBQUssR0FBSTtvQkFDcEMsTUFBTWMsU0FBU0YsS0FBS3JGLEdBQUcsQ0FBRXNFLElBQUlHLFNBQVMsSUFBSyxJQUFJWSxLQUFLRyxPQUFPLEtBQUtIO29CQUNoRSxNQUFNSSxPQUFPbkIsSUFBSUcsU0FBUyxDQUFDM0UsYUFBYSxDQUFDRSxHQUFHLENBQUVvRixlQUFnQixJQUFJLElBQUksQ0FBQztvQkFDdkVwQixPQUFPRyxJQUFJLENBQUUsSUFBSWpILGdCQUFpQm9JLE1BQU0xRixTQUFTLEVBQUV1RixVQUFVSSxRQUFRRSxNQUFNakk7Z0JBQzdFO1lBQ0Y7UUFDRjtRQUNBLE9BQU93RztJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFPMEIsb0JBQXFCcEIsR0FBUyxFQUFXO1FBQzlDLElBQUltQixPQUFPO1FBQ1gsTUFBTUUsT0FBTyxJQUFJLENBQUN0QixZQUFZLENBQUVDO1FBQ2hDakMsRUFBRTZDLElBQUksQ0FBRVMsTUFBTUMsQ0FBQUE7WUFDWkgsUUFBUUcsSUFBSUgsSUFBSTtRQUNsQjtRQUNBLE9BQU9BO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU9JLGVBQWdCQyxPQUFpQyxFQUFTO1FBQy9EQSxRQUFRQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUN6SCxRQUFRLENBQUNpRCxDQUFDLEVBQUUsSUFBSSxDQUFDakQsUUFBUSxDQUFDb0QsQ0FBQyxFQUFFLElBQUksQ0FBQ2hELElBQUksQ0FBQzZDLENBQUMsRUFBRSxJQUFJLENBQUM3QyxJQUFJLENBQUNnRCxDQUFDO0lBQ3RGO0lBRUE7O0dBRUMsR0FDRCxBQUFPc0UsWUFBYUMsTUFBZSxFQUFjO1FBQy9DLE9BQU8sSUFBSXhJLFVBQVd3SSxPQUFPbkIsWUFBWSxDQUFFLElBQUksQ0FBQy9HLE1BQU0sR0FBSWtJLE9BQU9uQixZQUFZLENBQUUsSUFBSSxDQUFDeEcsUUFBUSxHQUFJMkgsT0FBT25CLFlBQVksQ0FBRSxJQUFJLENBQUNwRyxJQUFJO0lBQ2hJO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU93SCx3QkFBZ0M7UUFDckMsT0FBTyxJQUFJLElBQ1QsQ0FBQSxJQUFJLENBQUNuSSxNQUFNLENBQUN3RCxDQUFDLEdBQUssQ0FBQSxJQUFJLElBQUksQ0FBQ2pELFFBQVEsQ0FBQ29ELENBQUMsR0FBRyxJQUFJLENBQUNoRCxJQUFJLENBQUNnRCxDQUFDLEFBQURBLElBQ2xELElBQUksQ0FBQ3BELFFBQVEsQ0FBQ2lELENBQUMsR0FBSyxDQUFBLENBQUMsSUFBSSxJQUFJLENBQUN4RCxNQUFNLENBQUMyRCxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUNoRCxJQUFJLENBQUNnRCxDQUFDLEFBQURBLElBQ3ZELElBQUksQ0FBQ2hELElBQUksQ0FBQzZDLENBQUMsR0FBSyxDQUFBLENBQUMsSUFBSSxDQUFDeEQsTUFBTSxDQUFDMkQsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDcEQsUUFBUSxDQUFDb0QsQ0FBQyxBQUFEQSxDQUFFO0lBRXpEO0lBRUE7O0dBRUMsR0FDRCxBQUFPeUUsZ0JBQWlCeEcsQ0FBUyxFQUFFb0YsQ0FBUyxFQUFjO1FBQ3hELG1DQUFtQztRQUNuQyxNQUFNcUIsSUFBSSxJQUFJLENBQUNySSxNQUFNLENBQUNnQixJQUFJLENBQUUsSUFBSSxDQUFDTCxJQUFJLENBQUNLLElBQUksQ0FBRSxJQUFJLENBQUNULFFBQVEsQ0FBQ2tGLFdBQVcsQ0FBRSxDQUFDO1FBQ3hFLE1BQU02QyxJQUFJLElBQUksQ0FBQy9ILFFBQVEsQ0FBQ1csS0FBSyxDQUFFLElBQUksQ0FBQ2xCLE1BQU0sRUFBR3lGLFdBQVcsQ0FBRTtRQUMxRCxNQUFNWCxJQUFJLElBQUksQ0FBQzlFLE1BQU07UUFFckIsZ0RBQWdEO1FBQ2hELE1BQU11SSxRQUFRRixFQUFFNUMsV0FBVyxDQUFFN0QsSUFBSUE7UUFDakMsTUFBTTRHLE9BQU9ILEVBQUU1QyxXQUFXLENBQUU3RCxJQUFJb0YsR0FBSXZCLFdBQVcsQ0FBRSxHQUFJekUsSUFBSSxDQUFFc0gsRUFBRTdDLFdBQVcsQ0FBRTdEO1FBQzFFLE1BQU02RyxRQUFRSixFQUFFNUMsV0FBVyxDQUFFdUIsSUFBSUEsR0FBSWhHLElBQUksQ0FBRXNILEVBQUU3QyxXQUFXLENBQUV1QixJQUFNaEcsSUFBSSxDQUFFOEQ7UUFFdEUscUNBQXFDO1FBQ3JDLE9BQU8sSUFBSXBGLFVBQVcrSSxPQUFPRCxLQUFLL0MsV0FBVyxDQUFFLEtBQU16RSxJQUFJLENBQUV5SCxRQUFTRixNQUFNdkgsSUFBSSxDQUFFd0gsTUFBT3hILElBQUksQ0FBRXlIO0lBQy9GO0lBRUE7O0dBRUMsR0FDRCxBQUFPbEQsV0FBc0I7UUFDM0IsT0FBTyxJQUFJN0YsVUFBVyxJQUFJLENBQUNpQixJQUFJLEVBQUUsSUFBSSxDQUFDSixRQUFRLEVBQUUsSUFBSSxDQUFDUCxNQUFNO0lBQzdEO0lBRUE7O0dBRUMsR0FDRCxBQUFPMEksWUFBaUM7UUFDdEMsT0FBTztZQUNMQyxNQUFNO1lBQ05DLFFBQVEsSUFBSSxDQUFDNUksTUFBTSxDQUFDd0QsQ0FBQztZQUNyQnFGLFFBQVEsSUFBSSxDQUFDN0ksTUFBTSxDQUFDMkQsQ0FBQztZQUNyQm1GLFVBQVUsSUFBSSxDQUFDdkksUUFBUSxDQUFDaUQsQ0FBQztZQUN6QnVGLFVBQVUsSUFBSSxDQUFDeEksUUFBUSxDQUFDb0QsQ0FBQztZQUN6QnFGLE1BQU0sSUFBSSxDQUFDckksSUFBSSxDQUFDNkMsQ0FBQztZQUNqQnlGLE1BQU0sSUFBSSxDQUFDdEksSUFBSSxDQUFDZ0QsQ0FBQztRQUNuQjtJQUNGO0lBRUE7Ozs7Ozs7R0FPQyxHQUNELEFBQU91RixZQUFhQyxPQUFnQixFQUFFL0gsVUFBVSxJQUFJLEVBQXFCO1FBQ3ZFLElBQUsrSCxtQkFBbUJ6SixXQUFZO1lBQ2xDLE9BQU9BLFVBQVV3SixXQUFXLENBQUUsSUFBSSxFQUFFQztRQUN0QztRQUVBLE9BQU87SUFDVDtJQUVBOztHQUVDLEdBQ0QsT0FBdUJDLFlBQWFDLEdBQXdCLEVBQWM7UUFDeEV4SixVQUFVQSxPQUFRd0osSUFBSVYsSUFBSSxLQUFLO1FBRS9CLE9BQU8sSUFBSWpKLFVBQVcsSUFBSVosUUFBU3VLLElBQUlULE1BQU0sRUFBRVMsSUFBSVIsTUFBTSxHQUFJLElBQUkvSixRQUFTdUssSUFBSVAsUUFBUSxFQUFFTyxJQUFJTixRQUFRLEdBQUksSUFBSWpLLFFBQVN1SyxJQUFJTCxJQUFJLEVBQUVLLElBQUlKLElBQUk7SUFDekk7SUFFQTs7R0FFQyxHQUNELE9BQWMxRixTQUFVM0QsS0FBYSxFQUFFVSxPQUFlLEVBQUVJLEdBQVcsRUFBVztRQUM1RSx5RUFBeUU7UUFDekUsTUFBTTRJLFdBQVcsSUFBTTVJLENBQUFBLE1BQU0sSUFBSUosVUFBVVYsS0FBSTtRQUMvQyxJQUFLMEosYUFBYSxHQUFJO1lBQ3BCLE9BQU8sQ0FBQyxJQUFNaEosQ0FBQUEsVUFBVVYsS0FBSSxJQUFNMEo7UUFDcEMsT0FDSztZQUNILE9BQU9DO1FBQ1Q7SUFDRjtJQUVBOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNELE9BQWNMLFlBQWFNLFVBQXFCLEVBQUVDLFVBQXFCLEVBQUVySSxVQUFVLElBQUksRUFBYztRQUVuRzs7Ozs7Ozs7O0tBU0MsR0FFRCxNQUFNc0ksWUFBdUIsRUFBRTtRQUUvQiwrREFBK0Q7UUFDL0QsTUFBTUMsTUFBTUgsV0FBV3hKLE1BQU0sQ0FBQ3dELENBQUM7UUFDL0IsTUFBTW9HLE1BQU0sQ0FBQyxJQUFJSixXQUFXeEosTUFBTSxDQUFDd0QsQ0FBQyxHQUFHLElBQUlnRyxXQUFXakosUUFBUSxDQUFDaUQsQ0FBQztRQUNoRSxNQUFNcUcsTUFBTUwsV0FBV3hKLE1BQU0sQ0FBQ3dELENBQUMsR0FBRyxJQUFJZ0csV0FBV2pKLFFBQVEsQ0FBQ2lELENBQUMsR0FBR2dHLFdBQVc3SSxJQUFJLENBQUM2QyxDQUFDO1FBQy9FLE1BQU1zRyxNQUFNTixXQUFXeEosTUFBTSxDQUFDMkQsQ0FBQztRQUMvQixNQUFNb0csTUFBTSxDQUFDLElBQUlQLFdBQVd4SixNQUFNLENBQUMyRCxDQUFDLEdBQUcsSUFBSTZGLFdBQVdqSixRQUFRLENBQUNvRCxDQUFDO1FBQ2hFLE1BQU1xRyxNQUFNUixXQUFXeEosTUFBTSxDQUFDMkQsQ0FBQyxHQUFHLElBQUk2RixXQUFXakosUUFBUSxDQUFDb0QsQ0FBQyxHQUFHNkYsV0FBVzdJLElBQUksQ0FBQ2dELENBQUM7UUFDL0UsTUFBTXNHLE1BQU1SLFdBQVd6SixNQUFNLENBQUN3RCxDQUFDO1FBQy9CLE1BQU0wRyxNQUFNLENBQUMsSUFBSVQsV0FBV3pKLE1BQU0sQ0FBQ3dELENBQUMsR0FBRyxJQUFJaUcsV0FBV2xKLFFBQVEsQ0FBQ2lELENBQUM7UUFDaEUsTUFBTTJHLE1BQU1WLFdBQVd6SixNQUFNLENBQUN3RCxDQUFDLEdBQUcsSUFBSWlHLFdBQVdsSixRQUFRLENBQUNpRCxDQUFDLEdBQUdpRyxXQUFXOUksSUFBSSxDQUFDNkMsQ0FBQztRQUMvRSxNQUFNNEcsTUFBTVgsV0FBV3pKLE1BQU0sQ0FBQzJELENBQUM7UUFDL0IsTUFBTTBHLE1BQU0sQ0FBQyxJQUFJWixXQUFXekosTUFBTSxDQUFDMkQsQ0FBQyxHQUFHLElBQUk4RixXQUFXbEosUUFBUSxDQUFDb0QsQ0FBQztRQUNoRSxNQUFNMkcsTUFBTWIsV0FBV3pKLE1BQU0sQ0FBQzJELENBQUMsR0FBRyxJQUFJOEYsV0FBV2xKLFFBQVEsQ0FBQ29ELENBQUMsR0FBRzhGLFdBQVc5SSxJQUFJLENBQUNnRCxDQUFDO1FBRS9FLHdGQUF3RjtRQUN4RixNQUFNNEcsVUFBVWxKLEtBQUtDLEdBQUcsQ0FBRUQsS0FBS3FELEdBQUcsQ0FBRThFLFdBQVd4SixNQUFNLENBQUN3RCxDQUFDLEVBQUVnRyxXQUFXakosUUFBUSxDQUFDaUQsQ0FBQyxFQUFFZ0csV0FBVzdJLElBQUksQ0FBQzZDLENBQUMsRUFDckVpRyxXQUFXekosTUFBTSxDQUFDd0QsQ0FBQyxFQUFFaUcsV0FBV2xKLFFBQVEsQ0FBQ2lELENBQUMsRUFBRWlHLFdBQVc5SSxJQUFJLENBQUM2QyxDQUFDLElBQy9EbkMsS0FBS29ELEdBQUcsQ0FBRStFLFdBQVd4SixNQUFNLENBQUN3RCxDQUFDLEVBQUVnRyxXQUFXakosUUFBUSxDQUFDaUQsQ0FBQyxFQUFFZ0csV0FBVzdJLElBQUksQ0FBQzZDLENBQUMsRUFDckVpRyxXQUFXekosTUFBTSxDQUFDd0QsQ0FBQyxFQUFFaUcsV0FBV2xKLFFBQVEsQ0FBQ2lELENBQUMsRUFBRWlHLFdBQVc5SSxJQUFJLENBQUM2QyxDQUFDO1FBQ3pGLE1BQU1nSCxVQUFVbkosS0FBS0MsR0FBRyxDQUFFRCxLQUFLcUQsR0FBRyxDQUFFOEUsV0FBV3hKLE1BQU0sQ0FBQzJELENBQUMsRUFBRTZGLFdBQVdqSixRQUFRLENBQUNvRCxDQUFDLEVBQUU2RixXQUFXN0ksSUFBSSxDQUFDZ0QsQ0FBQyxFQUNyRThGLFdBQVd6SixNQUFNLENBQUMyRCxDQUFDLEVBQUU4RixXQUFXbEosUUFBUSxDQUFDb0QsQ0FBQyxFQUFFOEYsV0FBVzlJLElBQUksQ0FBQ2dELENBQUMsSUFDL0R0QyxLQUFLb0QsR0FBRyxDQUFFK0UsV0FBV3hKLE1BQU0sQ0FBQzJELENBQUMsRUFBRTZGLFdBQVdqSixRQUFRLENBQUNvRCxDQUFDLEVBQUU2RixXQUFXN0ksSUFBSSxDQUFDZ0QsQ0FBQyxFQUNyRThGLFdBQVd6SixNQUFNLENBQUMyRCxDQUFDLEVBQUU4RixXQUFXbEosUUFBUSxDQUFDb0QsQ0FBQyxFQUFFOEYsV0FBVzlJLElBQUksQ0FBQ2dELENBQUM7UUFDekYsTUFBTThHLFdBQVdyTCxRQUFRc0wsNkJBQTZCLENBQUVmLEtBQUtDLEtBQUtDLEtBQUtJLEtBQUtDLEtBQUtDO1FBQ2pGLE1BQU1RLFdBQVd2TCxRQUFRc0wsNkJBQTZCLENBQUVaLEtBQUtDLEtBQUtDLEtBQUtJLEtBQUtDLEtBQUtDO1FBQ2pGLElBQUlNO1FBQ0osSUFBS0wsVUFBVUMsU0FBVTtZQUN2QkksVUFBVSxBQUFFSCxhQUFhLFFBQVFBLGFBQWEsT0FBU0UsV0FBV0Y7UUFDcEUsT0FDSztZQUNIRyxVQUFVLEFBQUVELGFBQWEsUUFBUUEsYUFBYSxPQUFTRixXQUFXRTtRQUNwRTtRQUNBLElBQUtDLFlBQVksUUFBUUEsWUFBWSxNQUFPO1lBQzFDLE9BQU9sQixXQUFXLGdDQUFnQztRQUNwRDtRQUVBLE1BQU05SCxJQUFJZ0osUUFBUWhKLENBQUM7UUFDbkIsTUFBTW9GLElBQUk0RCxRQUFRNUQsQ0FBQztRQUVuQixNQUFNNkQsS0FBS2pKLElBQUlBO1FBQ2YsTUFBTWtKLEtBQUs5RCxJQUFJQTtRQUNmLE1BQU0rRCxNQUFNLElBQUluSixJQUFJb0Y7UUFFcEIsOEVBQThFO1FBQzlFLE1BQU1nRSxNQUFNZixNQUFNakQsSUFBSWtELE1BQU1ZLEtBQUtYLE1BQU1SO1FBQ3ZDLE1BQU1zQixNQUFNckosSUFBSXNJLE1BQU1hLE1BQU1aLE1BQU1QO1FBQ2xDLE1BQU1zQixNQUFNTCxLQUFLVixNQUFNTjtRQUN2QixNQUFNc0IsTUFBTWYsTUFBTXBELElBQUlxRCxNQUFNUyxLQUFLUixNQUFNUjtRQUN2QyxNQUFNc0IsTUFBTXhKLElBQUl5SSxNQUFNVSxNQUFNVCxNQUFNUDtRQUNsQyxNQUFNc0IsTUFBTVIsS0FBS1AsTUFBTU47UUFFdkIsMEdBQTBHO1FBQzFHLDZFQUE2RTtRQUM3RSxNQUFNc0IsU0FBU3pNLE1BQU0wTSxvQkFBb0IsQ0FBRSxJQUFJTCxLQUFLRDtRQUNwRCxNQUFNTyxTQUFTM00sTUFBTTBNLG9CQUFvQixDQUFFLElBQUlGLEtBQUtEO1FBQ3BELE1BQU1LLGFBQWFuSCxFQUFFb0gsSUFBSSxDQUFFO1lBQUU7WUFBRztTQUFHLENBQUNDLE1BQU0sQ0FBRUwsU0FBU0EsT0FBT00sTUFBTSxDQUFFcE0sa0JBQW1CLEVBQUU7UUFDekYsTUFBTXFNLGFBQWF2SCxFQUFFb0gsSUFBSSxDQUFFO1lBQUU7WUFBRztTQUFHLENBQUNDLE1BQU0sQ0FBRUgsU0FBU0EsT0FBT0ksTUFBTSxDQUFFcE0sa0JBQW1CLEVBQUU7UUFFekYsb0hBQW9IO1FBQ3BILDJEQUEyRDtRQUMzRCxJQUFNLElBQUkwRixJQUFJLEdBQUdBLElBQUl1RyxXQUFXSyxNQUFNLEVBQUU1RyxJQUFNO1lBQzVDLE1BQU16RixJQUFJZ00sVUFBVSxDQUFFdkcsRUFBRztZQUN6QixJQUFLN0QsS0FBS0MsR0FBRyxDQUFFLEFBQUU0SixDQUFBQSxNQUFNekwsSUFBSXdMLEdBQUUsSUFBTXhMLElBQUl1TCxPQUFRNUosU0FBVTtnQkFDdkQsT0FBT3NJO1lBQ1Q7UUFDRjtRQUNBLElBQU0sSUFBSXhFLElBQUksR0FBR0EsSUFBSTJHLFdBQVdDLE1BQU0sRUFBRTVHLElBQU07WUFDNUMsTUFBTXpGLElBQUlvTSxVQUFVLENBQUUzRyxFQUFHO1lBQ3pCLElBQUs3RCxLQUFLQyxHQUFHLENBQUUsQUFBRStKLENBQUFBLE1BQU01TCxJQUFJMkwsR0FBRSxJQUFNM0wsSUFBSTBMLE9BQVEvSixTQUFVO2dCQUN2RCxPQUFPc0k7WUFDVDtRQUNGO1FBRUEsTUFBTXFDLE1BQU0vRTtRQUNaLE1BQU1nRixNQUFNcEssSUFBSW9GO1FBRWhCLG1HQUFtRztRQUNuRyxJQUFLLEFBQUUrRSxNQUFNLEtBQUtDLE1BQU0sS0FBU0QsTUFBTSxLQUFLQyxNQUFNLEdBQU07WUFDdEQsT0FBT3RDO1FBQ1Q7UUFFQSxPQUFPO1lBQUUsSUFBSXhLLFFBQVMwQyxHQUFHb0Y7U0FBSztJQUNoQztJQXRzQkE7Ozs7R0FJQyxHQUNELFlBQW9CcEgsS0FBYyxFQUFFVSxPQUFnQixFQUFFSSxHQUFZLENBQUc7UUFDbkUsS0FBSztRQUVMLElBQUksQ0FBQ1YsTUFBTSxHQUFHSjtRQUNkLElBQUksQ0FBQ1csUUFBUSxHQUFHRDtRQUNoQixJQUFJLENBQUNLLElBQUksR0FBR0Q7UUFFWixJQUFJLENBQUNSLFVBQVU7SUFDakI7QUE2ckJGO0FBeHRCQSxTQUFxQlIsdUJBd3RCcEI7QUFFREEsVUFBVXVNLFNBQVMsQ0FBQy9KLE1BQU0sR0FBRztBQUU3QmxELEtBQUtrTixRQUFRLENBQUUsYUFBYXhNIn0=