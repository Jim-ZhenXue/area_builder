// Copyright 2013-2024, University of Colorado Boulder
/**
 * A line segment (all points directly between the start and end point)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Ray2 from '../../../dot/js/Ray2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Arc, kite, Overlap, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';
const scratchVector2 = new Vector2(0, 0);
let Line = class Line extends Segment {
    /**
   * Sets the start point of the Line.
   */ setStart(start) {
        assert && assert(start.isFinite(), `Line start should be finite: ${start.toString()}`);
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
   * Returns the start of this Line.
   */ getStart() {
        return this._start;
    }
    /**
   * Sets the end point of the Line.
   */ setEnd(end) {
        assert && assert(end.isFinite(), `Line end should be finite: ${end.toString()}`);
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
   * Returns the end of this Line.
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
        return this._start.plus(this._end.minus(this._start).times(t));
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
        // tangent always the same, just use the start tangent
        return this.getStartTangent();
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
        return 0; // no curvature on a straight line segment
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
        const pt = this.positionAt(t);
        return [
            new Line(this._start, pt),
            new Line(pt, this._end)
        ];
    }
    /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */ invalidate() {
        assert && assert(this._start instanceof Vector2, `Line start should be a Vector2: ${this._start}`);
        assert && assert(this._start.isFinite(), `Line start should be finite: ${this._start.toString()}`);
        assert && assert(this._end instanceof Vector2, `Line end should be a Vector2: ${this._end}`);
        assert && assert(this._end.isFinite(), `Line end should be finite: ${this._end.toString()}`);
        // Lazily-computed derived information
        this._tangent = null;
        this._bounds = null;
        this._svgPathFragment = null;
        this.invalidationEmitter.emit();
    }
    /**
   * Returns a normalized unit vector that is tangent to this line (at the starting point)
   * the unit vectors points toward the end points.
   */ getStartTangent() {
        if (this._tangent === null) {
            // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
            this._tangent = this._end.minus(this._start).normalized();
        }
        return this._tangent;
    }
    get startTangent() {
        return this.getStartTangent();
    }
    /**
   * Returns the normalized unit vector that is tangent to this line
   * same as getStartTangent, since this is a straight line
   */ getEndTangent() {
        return this.getStartTangent();
    }
    get endTangent() {
        return this.getEndTangent();
    }
    /**
   * Returns the bounds of this segment.
   */ getBounds() {
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        if (this._bounds === null) {
            this._bounds = Bounds2.NOTHING.copy().addPoint(this._start).addPoint(this._end);
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Returns the bounding box for this transformed Line
   */ getBoundsWithTransform(matrix) {
        // uses mutable calls
        const bounds = Bounds2.NOTHING.copy();
        bounds.addPoint(matrix.multiplyVector2(scratchVector2.set(this._start)));
        bounds.addPoint(matrix.multiplyVector2(scratchVector2.set(this._end)));
        return bounds;
    }
    /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */ getNondegenerateSegments() {
        // if it is degenerate (0-length), just ignore it
        if (this._start.equals(this._end)) {
            return [];
        } else {
            return [
                this
            ];
        }
    }
    /**
   * Returns a string containing the SVG path. assumes that the start point is already provided,
   * so anything that calls this needs to put the M calls first
   */ getSVGPathFragment() {
        let oldPathFragment;
        if (assert) {
            oldPathFragment = this._svgPathFragment;
            this._svgPathFragment = null;
        }
        if (!this._svgPathFragment) {
            this._svgPathFragment = `L ${svgNumber(this._end.x)} ${svgNumber(this._end.y)}`;
        }
        if (assert) {
            if (oldPathFragment) {
                assert(oldPathFragment === this._svgPathFragment, 'Quadratic line segment changed without invalidate()');
            }
        }
        return this._svgPathFragment;
    }
    /**
   * Returns an array of Line that will draw an offset curve on the logical left side
   */ strokeLeft(lineWidth) {
        const offset = this.getEndTangent().perpendicular.negated().times(lineWidth / 2);
        return [
            new Line(this._start.plus(offset), this._end.plus(offset))
        ];
    }
    /**
   * Returns an array of Line that will draw an offset curve on the logical right side
   */ strokeRight(lineWidth) {
        const offset = this.getStartTangent().perpendicular.times(lineWidth / 2);
        return [
            new Line(this._end.plus(offset), this._start.plus(offset))
        ];
    }
    /**
   * In general, this method returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * Since lines are already monotone, it returns an empty array.
   */ getInteriorExtremaTs() {
        return [];
    }
    /**
   * Hit-tests this segment with the ray. An array of all intersections of the ray with this segment will be returned.
   * For details, see the documentation in Segment.js
   */ intersection(ray) {
        // We solve for the parametric line-line intersection, and then ensure the parameters are within both
        // the line segment and forwards from the ray.
        const result = [];
        const start = this._start;
        const end = this._end;
        const diff = end.minus(start);
        if (diff.magnitudeSquared === 0) {
            return result;
        }
        const denom = ray.direction.y * diff.x - ray.direction.x * diff.y;
        // If denominator is 0, the lines are parallel or coincident
        if (denom === 0) {
            return result;
        }
        // linear parameter where start (0) to end (1)
        const t = (ray.direction.x * (start.y - ray.position.y) - ray.direction.y * (start.x - ray.position.x)) / denom;
        // check that the intersection point is between the line segment's endpoints
        if (t < 0 || t >= 1) {
            return result;
        }
        // linear parameter where ray.position (0) to ray.position+ray.direction (1)
        const s = (diff.x * (start.y - ray.position.y) - diff.y * (start.x - ray.position.x)) / denom;
        // bail if it is behind our ray
        if (s < 0.00000001) {
            return result;
        }
        // return the proper winding direction depending on what way our line intersection is "pointed"
        const perp = diff.perpendicular;
        const intersectionPoint = start.plus(diff.times(t));
        const normal = (perp.dot(ray.direction) > 0 ? perp.negated() : perp).normalized();
        const wind = ray.direction.perpendicular.dot(diff) < 0 ? 1 : -1;
        result.push(new RayIntersection(s, intersectionPoint, normal, wind, t));
        return result;
    }
    /**
   * Returns the resultant winding number of a ray intersecting this line.
   */ windingIntersection(ray) {
        const hits = this.intersection(ray);
        if (hits.length) {
            return hits[0].wind;
        } else {
            return 0;
        }
    }
    /**
   * Draws this line to the 2D Canvas context, assuming the context's current location is already at the start point
   */ writeToContext(context) {
        context.lineTo(this._end.x, this._end.y);
    }
    /**
   * Returns a new Line that represents this line after transformation by the matrix
   */ transformed(matrix) {
        return new Line(matrix.timesVector2(this._start), matrix.timesVector2(this._end));
    }
    /**
   * Returns an object that gives information about the closest point (on a line segment) to the point argument
   */ explicitClosestToPoint(point) {
        const diff = this._end.minus(this._start);
        let t = point.minus(this._start).dot(diff) / diff.magnitudeSquared;
        t = Utils.clamp(t, 0, 1);
        const closestPoint = this.positionAt(t);
        return [
            {
                segment: this,
                t: t,
                closestPoint: closestPoint,
                distanceSquared: point.distanceSquared(closestPoint)
            }
        ];
    }
    /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */ getSignedAreaFragment() {
        return 1 / 2 * (this._start.x * this._end.y - this._start.y * this._end.x);
    }
    /**
   * Given the current curve parameterized by t, will return a curve parameterized by x where t = a * x + b
   */ reparameterized(a, b) {
        return new Line(this.positionAt(b), this.positionAt(a + b));
    }
    /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */ reversed() {
        return new Line(this._end, this._start);
    }
    /**
   * Convert a line in the $(theta,r)$ plane of the form $(\theta_1,r_1)$ to $(\theta_2,r_2)$ and
   * converts to the cartesian coordinate system
   *
   * E.g. a polar line (0,1) to (2 Pi,1) would be mapped to a circle of radius 1
   */ polarToCartesian(options) {
        // x represent an angle whereas y represent a radius
        if (this._start.x === this._end.x) {
            // angle is the same, we are still a line segment!
            return [
                new Line(Vector2.createPolar(this._start.y, this._start.x), Vector2.createPolar(this._end.y, this._end.x))
            ];
        } else if (this._start.y === this._end.y) {
            // we have a constant radius, so we are a circular arc
            return [
                new Arc(Vector2.ZERO, this._start.y, this._start.x, this._end.x, this._start.x > this._end.x)
            ];
        } else {
            return this.toPiecewiseLinearSegments(options);
        }
    }
    /**
   * Returns the arc length of the segment.
   */ getArcLength() {
        return this.start.distance(this.end);
    }
    /**
   * We can handle this simply by returning ourselves.
   */ toPiecewiseLinearOrArcSegments() {
        return [
            this
        ];
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'Line',
            startX: this._start.x,
            startY: this._start.y,
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
        if (segment instanceof Line) {
            return Line.getOverlaps(this, segment);
        }
        return null;
    }
    getClosestPoints(point) {
        // TODO: Can be simplified by getting the normalized direction vector, getting its perpendicular, and dotting with https://github.com/phetsims/kite/issues/98
        // TODO: the start or end point (should be the same result). https://github.com/phetsims/kite/issues/98
        // TODO: See LinearEdge.evaluateClosestDistanceToOrigin for details. https://github.com/phetsims/kite/issues/98
        const delta = this._end.minus(this._start);
        // Normalized start => end
        const normalizedDirection = delta.normalized();
        // Normalized distance along the line from the start to the point
        const intersectionNormalized = point.minus(this._start).dot(normalizedDirection);
        const intersectionT = Utils.clamp(intersectionNormalized / delta.magnitude, 0, 1);
        const intersectionPoint = this.positionAt(intersectionT);
        return [
            {
                segment: this,
                t: intersectionT,
                closestPoint: intersectionPoint,
                distanceSquared: intersectionPoint.distanceSquared(point)
            }
        ];
    }
    /**
   * Returns a Line from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Line');
        return new Line(new Vector2(obj.startX, obj.startY), new Vector2(obj.endX, obj.endY));
    }
    /**
   * Determine whether two lines overlap over a continuous section, and if so finds the a,b pair such that
   * p( t ) === q( a * t + b ).
   *
   * @param line1
   * @param line2
   * @param [epsilon] - Will return overlaps only if no two corresponding points differ by this amount or more
   *                             in one component.
   * @returns - The solution, if there is one (and only one)
   */ static getOverlaps(line1, line2, epsilon = 1e-6) {
        /*
     * NOTE: For implementation details in this function, please see Cubic.getOverlaps. It goes over all of the
     * same implementation details, but instead our bezier matrix is a 2x2:
     *
     * [  1  0 ]
     * [ -1  1 ]
     *
     * And we use the upper-left section of (at+b) adjustment matrix relevant for the line.
     */ const noOverlap = [];
        // Efficiently compute the multiplication of the bezier matrix:
        const p0x = line1._start.x;
        const p1x = -1 * line1._start.x + line1._end.x;
        const p0y = line1._start.y;
        const p1y = -1 * line1._start.y + line1._end.y;
        const q0x = line2._start.x;
        const q1x = -1 * line2._start.x + line2._end.x;
        const q0y = line2._start.y;
        const q1y = -1 * line2._start.y + line2._end.y;
        // Determine the candidate overlap (preferring the dimension with the largest variation)
        const xSpread = Math.abs(Math.max(line1._start.x, line1._end.x, line2._start.x, line2._end.x) - Math.min(line1._start.x, line1._end.x, line2._start.x, line2._end.x));
        const ySpread = Math.abs(Math.max(line1._start.y, line1._end.y, line2._start.y, line2._end.y) - Math.min(line1._start.y, line1._end.y, line2._start.y, line2._end.y));
        const xOverlap = Segment.polynomialGetOverlapLinear(p0x, p1x, q0x, q1x);
        const yOverlap = Segment.polynomialGetOverlapLinear(p0y, p1y, q0y, q1y);
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
        // Compute linear coefficients for the difference between p(t) and q(a*t+b)
        const d0x = q0x + b * q1x - p0x;
        const d1x = a * q1x - p1x;
        const d0y = q0y + b * q1y - p0y;
        const d1y = a * q1y - p1y;
        // Examine the single-coordinate distances between the "overlaps" at each extreme T value. If the distance is larger
        // than our epsilon, then the "overlap" would not be valid.
        if (Math.abs(d0x) > epsilon || Math.abs(d1x + d0x) > epsilon || Math.abs(d0y) > epsilon || Math.abs(d1y + d0y) > epsilon) {
            // We're able to efficiently hardcode these for the line-line case, since there are no extreme t values that are
            // not t=0 or t=1.
            return noOverlap;
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
   * Returns any (finite) intersection between the two line segments.
   */ static intersect(a, b) {
        // TODO: look into numerically more accurate solutions? https://github.com/phetsims/kite/issues/98
        const lineSegmentIntersection = Utils.lineSegmentIntersection(a.start.x, a.start.y, a.end.x, a.end.y, b.start.x, b.start.y, b.end.x, b.end.y);
        if (lineSegmentIntersection !== null) {
            const aT = a.explicitClosestToPoint(lineSegmentIntersection)[0].t;
            const bT = b.explicitClosestToPoint(lineSegmentIntersection)[0].t;
            return [
                new SegmentIntersection(lineSegmentIntersection, aT, bT)
            ];
        } else {
            return [];
        }
    }
    /**
   * Returns any intersections between a line segment and another type of segment.
   *
   * This should be more optimized than the general intersection routine of arbitrary segments.
   */ static intersectOther(line, other) {
        // Set up a ray
        const delta = line.end.minus(line.start);
        const length = delta.magnitude;
        const ray = new Ray2(line.start, delta.normalize());
        // Find the other segment's intersections with the ray
        const rayIntersections = other.intersection(ray);
        const results = [];
        for(let i = 0; i < rayIntersections.length; i++){
            const rayIntersection = rayIntersections[i];
            const lineT = rayIntersection.distance / length;
            // Exclude intersections that are outside our line segment (or right on the boundary)
            if (lineT > 1e-8 && lineT < 1 - 1e-8) {
                results.push(new SegmentIntersection(rayIntersection.point, lineT, rayIntersection.t));
            }
        }
        return results;
    }
    /**
   * @param start - Start point
   * @param end - End point
   */ constructor(start, end){
        super();
        this._start = start;
        this._end = end;
        this.invalidate();
    }
};
export { Line as default };
kite.register('Line', Line);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvTGluZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGxpbmUgc2VnbWVudCAoYWxsIHBvaW50cyBkaXJlY3RseSBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50KVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgUmF5MiBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmF5Mi5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IEFyYywgQ2xvc2VzdFRvUG9pbnRSZXN1bHQsIGtpdGUsIE92ZXJsYXAsIFBpZWNld2lzZUxpbmVhck9wdGlvbnMsIFJheUludGVyc2VjdGlvbiwgU2VnbWVudCwgU2VnbWVudEludGVyc2VjdGlvbiwgc3ZnTnVtYmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IHNjcmF0Y2hWZWN0b3IyID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZExpbmUgPSB7XG4gIHR5cGU6ICdMaW5lJztcbiAgc3RhcnRYOiBudW1iZXI7XG4gIHN0YXJ0WTogbnVtYmVyO1xuICBlbmRYOiBudW1iZXI7XG4gIGVuZFk6IG51bWJlcjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbmUgZXh0ZW5kcyBTZWdtZW50IHtcblxuICBwcml2YXRlIF9zdGFydDogVmVjdG9yMjtcbiAgcHJpdmF0ZSBfZW5kOiBWZWN0b3IyO1xuXG4gIHByaXZhdGUgX3RhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfYm91bmRzITogQm91bmRzMiB8IG51bGw7XG4gIHByaXZhdGUgX3N2Z1BhdGhGcmFnbWVudCE6IHN0cmluZyB8IG51bGw7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBzdGFydCAtIFN0YXJ0IHBvaW50XG4gICAqIEBwYXJhbSBlbmQgLSBFbmQgcG9pbnRcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RhcnQ6IFZlY3RvcjIsIGVuZDogVmVjdG9yMiApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG5cbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFydCBwb2ludCBvZiB0aGUgTGluZS5cbiAgICovXG4gIHB1YmxpYyBzZXRTdGFydCggc3RhcnQ6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnQuaXNGaW5pdGUoKSwgYExpbmUgc3RhcnQgc2hvdWxkIGJlIGZpbml0ZTogJHtzdGFydC50b1N0cmluZygpfWAgKTtcblxuICAgIGlmICggIXRoaXMuX3N0YXJ0LmVxdWFscyggc3RhcnQgKSApIHtcbiAgICAgIHRoaXMuX3N0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IHN0YXJ0KCB2YWx1ZTogVmVjdG9yMiApIHsgdGhpcy5zZXRTdGFydCggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgc3RhcnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFN0YXJ0KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RhcnQgb2YgdGhpcyBMaW5lLlxuICAgKi9cbiAgcHVibGljIGdldFN0YXJ0KCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9zdGFydDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGVuZCBwb2ludCBvZiB0aGUgTGluZS5cbiAgICovXG4gIHB1YmxpYyBzZXRFbmQoIGVuZDogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmQuaXNGaW5pdGUoKSwgYExpbmUgZW5kIHNob3VsZCBiZSBmaW5pdGU6ICR7ZW5kLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgaWYgKCAhdGhpcy5fZW5kLmVxdWFscyggZW5kICkgKSB7XG4gICAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IGVuZCggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0RW5kKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZCgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVuZCBvZiB0aGlzIExpbmUuXG4gICAqL1xuICBwdWJsaWMgZ2V0RW5kKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9lbmQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBwYXJhbWV0cmljYWxseSwgd2l0aCAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogTk9URTogcG9zaXRpb25BdCggMCApIHdpbGwgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHBvc2l0aW9uQXQoIDEgKSB3aWxsIHJldHVybiB0aGUgZW5kIG9mIHRoZVxuICAgKiBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBwb3NpdGlvbkF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIHJldHVybiB0aGlzLl9zdGFydC5wbHVzKCB0aGlzLl9lbmQubWludXMoIHRoaXMuX3N0YXJ0ICkudGltZXMoIHQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXG4gICAqXG4gICAqIE5PVEU6IHRhbmdlbnRBdCggMCApIHdpbGwgcmV0dXJuIHRoZSB0YW5nZW50IGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHRhbmdlbnRBdCggMSApIHdpbGwgcmV0dXJuIHRoZVxuICAgKiB0YW5nZW50IGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHRhbmdlbnRBdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ3RhbmdlbnRBdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgLy8gdGFuZ2VudCBhbHdheXMgdGhlIHNhbWUsIGp1c3QgdXNlIHRoZSBzdGFydCB0YW5nZW50XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2lnbmVkIGN1cnZhdHVyZSBvZiB0aGUgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSB0LCB3aGVyZSAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogVGhlIGN1cnZhdHVyZSB3aWxsIGJlIHBvc2l0aXZlIGZvciB2aXN1YWwgY2xvY2t3aXNlIC8gbWF0aGVtYXRpY2FsIGNvdW50ZXJjbG9ja3dpc2UgY3VydmVzLCBuZWdhdGl2ZSBmb3Igb3Bwb3NpdGVcbiAgICogY3VydmF0dXJlLCBhbmQgMCBmb3Igbm8gY3VydmF0dXJlLlxuICAgKlxuICAgKiBOT1RFOiBjdXJ2YXR1cmVBdCggMCApIHdpbGwgcmV0dXJuIHRoZSBjdXJ2YXR1cmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgY3VydmF0dXJlQXQoIDEgKSB3aWxsIHJldHVyblxuICAgKiB0aGUgY3VydmF0dXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIGN1cnZhdHVyZUF0KCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdjdXJ2YXR1cmVBdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XG5cbiAgICByZXR1cm4gMDsgLy8gbm8gY3VydmF0dXJlIG9uIGEgc3RyYWlnaHQgbGluZSBzZWdtZW50XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSB3aXRoIHVwIHRvIDIgc3ViLXNlZ21lbnRzLCBzcGxpdCBhdCB0aGUgcGFyYW1ldHJpYyB0IHZhbHVlLiBUb2dldGhlciAoaW4gb3JkZXIpIHRoZXkgc2hvdWxkIG1ha2VcbiAgICogdXAgdGhlIHNhbWUgc2hhcGUgYXMgdGhlIGN1cnJlbnQgc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3ViZGl2aWRlZCggdDogbnVtYmVyICk6IFNlZ21lbnRbXSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIC8vIElmIHQgaXMgMCBvciAxLCB3ZSBvbmx5IG5lZWQgdG8gcmV0dXJuIDEgc2VnbWVudFxuICAgIGlmICggdCA9PT0gMCB8fCB0ID09PSAxICkge1xuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xuICAgIH1cblxuICAgIGNvbnN0IHB0ID0gdGhpcy5wb3NpdGlvbkF0KCB0ICk7XG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBMaW5lKCB0aGlzLl9zdGFydCwgcHQgKSxcbiAgICAgIG5ldyBMaW5lKCBwdCwgdGhpcy5fZW5kIClcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBjYWNoZWQgaW5mb3JtYXRpb24sIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhbnkgb2YgdGhlICdjb25zdHJ1Y3RvciBhcmd1bWVudHMnIGFyZSBtdXRhdGVkLlxuICAgKi9cbiAgcHVibGljIGludmFsaWRhdGUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fc3RhcnQgaW5zdGFuY2VvZiBWZWN0b3IyLCBgTGluZSBzdGFydCBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX3N0YXJ0fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9zdGFydC5pc0Zpbml0ZSgpLCBgTGluZSBzdGFydCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX3N0YXJ0LnRvU3RyaW5nKCl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2VuZCBpbnN0YW5jZW9mIFZlY3RvcjIsIGBMaW5lIGVuZCBzaG91bGQgYmUgYSBWZWN0b3IyOiAke3RoaXMuX2VuZH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fZW5kLmlzRmluaXRlKCksIGBMaW5lIGVuZCBzaG91bGQgYmUgZmluaXRlOiAke3RoaXMuX2VuZC50b1N0cmluZygpfWAgKTtcblxuICAgIC8vIExhemlseS1jb21wdXRlZCBkZXJpdmVkIGluZm9ybWF0aW9uXG4gICAgdGhpcy5fdGFuZ2VudCA9IG51bGw7XG4gICAgdGhpcy5fYm91bmRzID0gbnVsbDtcbiAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbm9ybWFsaXplZCB1bml0IHZlY3RvciB0aGF0IGlzIHRhbmdlbnQgdG8gdGhpcyBsaW5lIChhdCB0aGUgc3RhcnRpbmcgcG9pbnQpXG4gICAqIHRoZSB1bml0IHZlY3RvcnMgcG9pbnRzIHRvd2FyZCB0aGUgZW5kIHBvaW50cy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl90YW5nZW50ID09PSBudWxsICkge1xuICAgICAgLy8gVE9ETzogYWxsb2NhdGlvbiByZWR1Y3Rpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICB0aGlzLl90YW5nZW50ID0gdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9zdGFydCApLm5vcm1hbGl6ZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3RhbmdlbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCB1bml0IHZlY3RvciB0aGF0IGlzIHRhbmdlbnQgdG8gdGhpcyBsaW5lXG4gICAqIHNhbWUgYXMgZ2V0U3RhcnRUYW5nZW50LCBzaW5jZSB0aGlzIGlzIGEgc3RyYWlnaHQgbGluZVxuICAgKi9cbiAgcHVibGljIGdldEVuZFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGVuZFRhbmdlbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZFRhbmdlbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBzZWdtZW50LlxuICAgKi9cbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICAvLyBUT0RPOiBhbGxvY2F0aW9uIHJlZHVjdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBpZiAoIHRoaXMuX2JvdW5kcyA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuX2JvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCkuYWRkUG9pbnQoIHRoaXMuX3N0YXJ0ICkuYWRkUG9pbnQoIHRoaXMuX2VuZCApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmdldEJvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBmb3IgdGhpcyB0cmFuc2Zvcm1lZCBMaW5lXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4OiBNYXRyaXgzICk6IEJvdW5kczIge1xuICAgIC8vIHVzZXMgbXV0YWJsZSBjYWxsc1xuICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgYm91bmRzLmFkZFBvaW50KCBtYXRyaXgubXVsdGlwbHlWZWN0b3IyKCBzY3JhdGNoVmVjdG9yMi5zZXQoIHRoaXMuX3N0YXJ0ICkgKSApO1xuICAgIGJvdW5kcy5hZGRQb2ludCggbWF0cml4Lm11bHRpcGx5VmVjdG9yMiggc2NyYXRjaFZlY3RvcjIuc2V0KCB0aGlzLl9lbmQgKSApICk7XG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBub24tZGVnZW5lcmF0ZSBzZWdtZW50cyB0aGF0IGFyZSBlcXVpdmFsZW50IHRvIHRoaXMgc2VnbWVudC4gR2VuZXJhbGx5IGdldHMgcmlkIChvciBzaW1wbGlmaWVzKVxuICAgKiBpbnZhbGlkIG9yIHJlcGVhdGVkIHNlZ21lbnRzLlxuICAgKi9cbiAgcHVibGljIGdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpOiBTZWdtZW50W10ge1xuICAgIC8vIGlmIGl0IGlzIGRlZ2VuZXJhdGUgKDAtbGVuZ3RoKSwganVzdCBpZ25vcmUgaXRcbiAgICBpZiAoIHRoaXMuX3N0YXJ0LmVxdWFscyggdGhpcy5fZW5kICkgKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFNWRyBwYXRoLiBhc3N1bWVzIHRoYXQgdGhlIHN0YXJ0IHBvaW50IGlzIGFscmVhZHkgcHJvdmlkZWQsXG4gICAqIHNvIGFueXRoaW5nIHRoYXQgY2FsbHMgdGhpcyBuZWVkcyB0byBwdXQgdGhlIE0gY2FsbHMgZmlyc3RcbiAgICovXG4gIHB1YmxpYyBnZXRTVkdQYXRoRnJhZ21lbnQoKTogc3RyaW5nIHtcbiAgICBsZXQgb2xkUGF0aEZyYWdtZW50O1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgb2xkUGF0aEZyYWdtZW50ID0gdGhpcy5fc3ZnUGF0aEZyYWdtZW50O1xuICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKCAhdGhpcy5fc3ZnUGF0aEZyYWdtZW50ICkge1xuICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gYEwgJHtzdmdOdW1iZXIoIHRoaXMuX2VuZC54ICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9lbmQueSApfWA7XG4gICAgfVxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgaWYgKCBvbGRQYXRoRnJhZ21lbnQgKSB7XG4gICAgICAgIGFzc2VydCggb2xkUGF0aEZyYWdtZW50ID09PSB0aGlzLl9zdmdQYXRoRnJhZ21lbnQsICdRdWFkcmF0aWMgbGluZSBzZWdtZW50IGNoYW5nZWQgd2l0aG91dCBpbnZhbGlkYXRlKCknICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdmdQYXRoRnJhZ21lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBMaW5lIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCBsZWZ0IHNpZGVcbiAgICovXG4gIHB1YmxpYyBzdHJva2VMZWZ0KCBsaW5lV2lkdGg6IG51bWJlciApOiBMaW5lW10ge1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuZ2V0RW5kVGFuZ2VudCgpLnBlcnBlbmRpY3VsYXIubmVnYXRlZCgpLnRpbWVzKCBsaW5lV2lkdGggLyAyICk7XG4gICAgcmV0dXJuIFsgbmV3IExpbmUoIHRoaXMuX3N0YXJ0LnBsdXMoIG9mZnNldCApLCB0aGlzLl9lbmQucGx1cyggb2Zmc2V0ICkgKSBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgTGluZSB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgY3VydmUgb24gdGhlIGxvZ2ljYWwgcmlnaHQgc2lkZVxuICAgKi9cbiAgcHVibGljIHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBMaW5lW10ge1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMuZ2V0U3RhcnRUYW5nZW50KCkucGVycGVuZGljdWxhci50aW1lcyggbGluZVdpZHRoIC8gMiApO1xuICAgIHJldHVybiBbIG5ldyBMaW5lKCB0aGlzLl9lbmQucGx1cyggb2Zmc2V0ICksIHRoaXMuX3N0YXJ0LnBsdXMoIG9mZnNldCApICkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbiBnZW5lcmFsLCB0aGlzIG1ldGhvZCByZXR1cm5zIGEgbGlzdCBvZiB0IHZhbHVlcyB3aGVyZSBkeC9kdCBvciBkeS9kdCBpcyAwIHdoZXJlIDAgPCB0IDwgMS4gc3ViZGl2aWRpbmcgb24gdGhlc2Ugd2lsbCByZXN1bHQgaW4gbW9ub3RvbmljIHNlZ21lbnRzXG4gICAqIFNpbmNlIGxpbmVzIGFyZSBhbHJlYWR5IG1vbm90b25lLCBpdCByZXR1cm5zIGFuIGVtcHR5IGFycmF5LlxuICAgKi9cbiAgcHVibGljIGdldEludGVyaW9yRXh0cmVtYVRzKCk6IG51bWJlcltdIHsgcmV0dXJuIFtdOyB9XG5cbiAgLyoqXG4gICAqIEhpdC10ZXN0cyB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzZWdtZW50IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEZvciBkZXRhaWxzLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gaW4gU2VnbWVudC5qc1xuICAgKi9cbiAgcHVibGljIGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdIHtcbiAgICAvLyBXZSBzb2x2ZSBmb3IgdGhlIHBhcmFtZXRyaWMgbGluZS1saW5lIGludGVyc2VjdGlvbiwgYW5kIHRoZW4gZW5zdXJlIHRoZSBwYXJhbWV0ZXJzIGFyZSB3aXRoaW4gYm90aFxuICAgIC8vIHRoZSBsaW5lIHNlZ21lbnQgYW5kIGZvcndhcmRzIGZyb20gdGhlIHJheS5cblxuICAgIGNvbnN0IHJlc3VsdDogUmF5SW50ZXJzZWN0aW9uW10gPSBbXTtcblxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fc3RhcnQ7XG4gICAgY29uc3QgZW5kID0gdGhpcy5fZW5kO1xuXG4gICAgY29uc3QgZGlmZiA9IGVuZC5taW51cyggc3RhcnQgKTtcblxuICAgIGlmICggZGlmZi5tYWduaXR1ZGVTcXVhcmVkID09PSAwICkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCBkZW5vbSA9IHJheS5kaXJlY3Rpb24ueSAqIGRpZmYueCAtIHJheS5kaXJlY3Rpb24ueCAqIGRpZmYueTtcblxuICAgIC8vIElmIGRlbm9taW5hdG9yIGlzIDAsIHRoZSBsaW5lcyBhcmUgcGFyYWxsZWwgb3IgY29pbmNpZGVudFxuICAgIGlmICggZGVub20gPT09IDAgKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIGxpbmVhciBwYXJhbWV0ZXIgd2hlcmUgc3RhcnQgKDApIHRvIGVuZCAoMSlcbiAgICBjb25zdCB0ID0gKCByYXkuZGlyZWN0aW9uLnggKiAoIHN0YXJ0LnkgLSByYXkucG9zaXRpb24ueSApIC0gcmF5LmRpcmVjdGlvbi55ICogKCBzdGFydC54IC0gcmF5LnBvc2l0aW9uLnggKSApIC8gZGVub207XG5cbiAgICAvLyBjaGVjayB0aGF0IHRoZSBpbnRlcnNlY3Rpb24gcG9pbnQgaXMgYmV0d2VlbiB0aGUgbGluZSBzZWdtZW50J3MgZW5kcG9pbnRzXG4gICAgaWYgKCB0IDwgMCB8fCB0ID49IDEgKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIGxpbmVhciBwYXJhbWV0ZXIgd2hlcmUgcmF5LnBvc2l0aW9uICgwKSB0byByYXkucG9zaXRpb24rcmF5LmRpcmVjdGlvbiAoMSlcbiAgICBjb25zdCBzID0gKCBkaWZmLnggKiAoIHN0YXJ0LnkgLSByYXkucG9zaXRpb24ueSApIC0gZGlmZi55ICogKCBzdGFydC54IC0gcmF5LnBvc2l0aW9uLnggKSApIC8gZGVub207XG5cbiAgICAvLyBiYWlsIGlmIGl0IGlzIGJlaGluZCBvdXIgcmF5XG4gICAgaWYgKCBzIDwgMC4wMDAwMDAwMSApIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHRoZSBwcm9wZXIgd2luZGluZyBkaXJlY3Rpb24gZGVwZW5kaW5nIG9uIHdoYXQgd2F5IG91ciBsaW5lIGludGVyc2VjdGlvbiBpcyBcInBvaW50ZWRcIlxuICAgIGNvbnN0IHBlcnAgPSBkaWZmLnBlcnBlbmRpY3VsYXI7XG5cbiAgICBjb25zdCBpbnRlcnNlY3Rpb25Qb2ludCA9IHN0YXJ0LnBsdXMoIGRpZmYudGltZXMoIHQgKSApO1xuICAgIGNvbnN0IG5vcm1hbCA9ICggcGVycC5kb3QoIHJheS5kaXJlY3Rpb24gKSA+IDAgPyBwZXJwLm5lZ2F0ZWQoKSA6IHBlcnAgKS5ub3JtYWxpemVkKCk7XG4gICAgY29uc3Qgd2luZCA9IHJheS5kaXJlY3Rpb24ucGVycGVuZGljdWxhci5kb3QoIGRpZmYgKSA8IDAgPyAxIDogLTE7XG4gICAgcmVzdWx0LnB1c2goIG5ldyBSYXlJbnRlcnNlY3Rpb24oIHMsIGludGVyc2VjdGlvblBvaW50LCBub3JtYWwsIHdpbmQsIHQgKSApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVzdWx0YW50IHdpbmRpbmcgbnVtYmVyIG9mIGEgcmF5IGludGVyc2VjdGluZyB0aGlzIGxpbmUuXG4gICAqL1xuICBwdWJsaWMgd2luZGluZ0ludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IG51bWJlciB7XG4gICAgY29uc3QgaGl0cyA9IHRoaXMuaW50ZXJzZWN0aW9uKCByYXkgKTtcbiAgICBpZiAoIGhpdHMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuIGhpdHNbIDAgXS53aW5kO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGlzIGxpbmUgdG8gdGhlIDJEIENhbnZhcyBjb250ZXh0LCBhc3N1bWluZyB0aGUgY29udGV4dCdzIGN1cnJlbnQgbG9jYXRpb24gaXMgYWxyZWFkeSBhdCB0aGUgc3RhcnQgcG9pbnRcbiAgICovXG4gIHB1YmxpYyB3cml0ZVRvQ29udGV4dCggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xuICAgIGNvbnRleHQubGluZVRvKCB0aGlzLl9lbmQueCwgdGhpcy5fZW5kLnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IExpbmUgdGhhdCByZXByZXNlbnRzIHRoaXMgbGluZSBhZnRlciB0cmFuc2Zvcm1hdGlvbiBieSB0aGUgbWF0cml4XG4gICAqL1xuICBwdWJsaWMgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBMaW5lIHtcbiAgICByZXR1cm4gbmV3IExpbmUoIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX3N0YXJ0ICksIG1hdHJpeC50aW1lc1ZlY3RvcjIoIHRoaXMuX2VuZCApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBnaXZlcyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY2xvc2VzdCBwb2ludCAob24gYSBsaW5lIHNlZ21lbnQpIHRvIHRoZSBwb2ludCBhcmd1bWVudFxuICAgKi9cbiAgcHVibGljIGV4cGxpY2l0Q2xvc2VzdFRvUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IENsb3Nlc3RUb1BvaW50UmVzdWx0W10ge1xuICAgIGNvbnN0IGRpZmYgPSB0aGlzLl9lbmQubWludXMoIHRoaXMuX3N0YXJ0ICk7XG4gICAgbGV0IHQgPSBwb2ludC5taW51cyggdGhpcy5fc3RhcnQgKS5kb3QoIGRpZmYgKSAvIGRpZmYubWFnbml0dWRlU3F1YXJlZDtcbiAgICB0ID0gVXRpbHMuY2xhbXAoIHQsIDAsIDEgKTtcbiAgICBjb25zdCBjbG9zZXN0UG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIHQgKTtcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBzZWdtZW50OiB0aGlzLFxuICAgICAgICB0OiB0LFxuICAgICAgICBjbG9zZXN0UG9pbnQ6IGNsb3Nlc3RQb2ludCxcbiAgICAgICAgZGlzdGFuY2VTcXVhcmVkOiBwb2ludC5kaXN0YW5jZVNxdWFyZWQoIGNsb3Nlc3RQb2ludCApXG4gICAgICB9XG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb250cmlidXRpb24gdG8gdGhlIHNpZ25lZCBhcmVhIGNvbXB1dGVkIHVzaW5nIEdyZWVuJ3MgVGhlb3JlbSwgd2l0aCBQPS15LzIgYW5kIFE9eC8yLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIHRoaXMgc2VnbWVudCdzIGNvbnRyaWJ1dGlvbiB0byB0aGUgbGluZSBpbnRlZ3JhbCAoLXkvMiBkeCArIHgvMiBkeSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2lnbmVkQXJlYUZyYWdtZW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDEgLyAyICogKCB0aGlzLl9zdGFydC54ICogdGhpcy5fZW5kLnkgLSB0aGlzLl9zdGFydC55ICogdGhpcy5fZW5kLnggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0aGUgY3VycmVudCBjdXJ2ZSBwYXJhbWV0ZXJpemVkIGJ5IHQsIHdpbGwgcmV0dXJuIGEgY3VydmUgcGFyYW1ldGVyaXplZCBieSB4IHdoZXJlIHQgPSBhICogeCArIGJcbiAgICovXG4gIHB1YmxpYyByZXBhcmFtZXRlcml6ZWQoIGE6IG51bWJlciwgYjogbnVtYmVyICk6IExpbmUge1xuICAgIHJldHVybiBuZXcgTGluZSggdGhpcy5wb3NpdGlvbkF0KCBiICksIHRoaXMucG9zaXRpb25BdCggYSArIGIgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZXZlcnNlZCBjb3B5IG9mIHRoaXMgc2VnbWVudCAobWFwcGluZyB0aGUgcGFyYW1ldHJpemF0aW9uIGZyb20gWzAsMV0gPT4gWzEsMF0pLlxuICAgKi9cbiAgcHVibGljIHJldmVyc2VkKCk6IExpbmUge1xuICAgIHJldHVybiBuZXcgTGluZSggdGhpcy5fZW5kLCB0aGlzLl9zdGFydCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYSBsaW5lIGluIHRoZSAkKHRoZXRhLHIpJCBwbGFuZSBvZiB0aGUgZm9ybSAkKFxcdGhldGFfMSxyXzEpJCB0byAkKFxcdGhldGFfMixyXzIpJCBhbmRcbiAgICogY29udmVydHMgdG8gdGhlIGNhcnRlc2lhbiBjb29yZGluYXRlIHN5c3RlbVxuICAgKlxuICAgKiBFLmcuIGEgcG9sYXIgbGluZSAoMCwxKSB0byAoMiBQaSwxKSB3b3VsZCBiZSBtYXBwZWQgdG8gYSBjaXJjbGUgb2YgcmFkaXVzIDFcbiAgICovXG4gIHB1YmxpYyBwb2xhclRvQ2FydGVzaWFuKCBvcHRpb25zOiBQaWVjZXdpc2VMaW5lYXJPcHRpb25zICk6IFNlZ21lbnRbXSB7XG4gICAgLy8geCByZXByZXNlbnQgYW4gYW5nbGUgd2hlcmVhcyB5IHJlcHJlc2VudCBhIHJhZGl1c1xuICAgIGlmICggdGhpcy5fc3RhcnQueCA9PT0gdGhpcy5fZW5kLnggKSB7XG4gICAgICAvLyBhbmdsZSBpcyB0aGUgc2FtZSwgd2UgYXJlIHN0aWxsIGEgbGluZSBzZWdtZW50IVxuICAgICAgcmV0dXJuIFsgbmV3IExpbmUoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIHRoaXMuX3N0YXJ0LnksIHRoaXMuX3N0YXJ0LnggKSwgVmVjdG9yMi5jcmVhdGVQb2xhciggdGhpcy5fZW5kLnksIHRoaXMuX2VuZC54ICkgKSBdO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fc3RhcnQueSA9PT0gdGhpcy5fZW5kLnkgKSB7XG4gICAgICAvLyB3ZSBoYXZlIGEgY29uc3RhbnQgcmFkaXVzLCBzbyB3ZSBhcmUgYSBjaXJjdWxhciBhcmNcbiAgICAgIHJldHVybiBbIG5ldyBBcmMoIFZlY3RvcjIuWkVSTywgdGhpcy5fc3RhcnQueSwgdGhpcy5fc3RhcnQueCwgdGhpcy5fZW5kLngsIHRoaXMuX3N0YXJ0LnggPiB0aGlzLl9lbmQueCApIF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudG9QaWVjZXdpc2VMaW5lYXJTZWdtZW50cyggb3B0aW9ucyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcmMgbGVuZ3RoIG9mIHRoZSBzZWdtZW50LlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldEFyY0xlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0LmRpc3RhbmNlKCB0aGlzLmVuZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIGNhbiBoYW5kbGUgdGhpcyBzaW1wbHkgYnkgcmV0dXJuaW5nIG91cnNlbHZlcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSB0b1BpZWNld2lzZUxpbmVhck9yQXJjU2VnbWVudHMoKTogU2VnbWVudFtdIHtcbiAgICByZXR1cm4gWyB0aGlzIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICovXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZExpbmUge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnTGluZScsXG4gICAgICBzdGFydFg6IHRoaXMuX3N0YXJ0LngsXG4gICAgICBzdGFydFk6IHRoaXMuX3N0YXJ0LnksXG4gICAgICBlbmRYOiB0aGlzLl9lbmQueCxcbiAgICAgIGVuZFk6IHRoaXMuX2VuZC55XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gbGluZXMgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxuICAgKlxuICAgKiBAcGFyYW0gc2VnbWVudFxuICAgKiBAcGFyYW0gW2Vwc2lsb25dIC0gV2lsbCByZXR1cm4gb3ZlcmxhcHMgb25seSBpZiBubyB0d28gY29ycmVzcG9uZGluZyBwb2ludHMgZGlmZmVyIGJ5IHRoaXMgYW1vdW50IG9yIG1vcmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIG9uZSBjb21wb25lbnQuXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcbiAgICovXG4gIHB1YmxpYyBnZXRPdmVybGFwcyggc2VnbWVudDogU2VnbWVudCwgZXBzaWxvbiA9IDFlLTYgKTogT3ZlcmxhcFtdIHwgbnVsbCB7XG4gICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgTGluZSApIHtcbiAgICAgIHJldHVybiBMaW5lLmdldE92ZXJsYXBzKCB0aGlzLCBzZWdtZW50ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q2xvc2VzdFBvaW50cyggcG9pbnQ6IFZlY3RvcjIgKTogQ2xvc2VzdFRvUG9pbnRSZXN1bHRbXSB7XG4gICAgLy8gVE9ETzogQ2FuIGJlIHNpbXBsaWZpZWQgYnkgZ2V0dGluZyB0aGUgbm9ybWFsaXplZCBkaXJlY3Rpb24gdmVjdG9yLCBnZXR0aW5nIGl0cyBwZXJwZW5kaWN1bGFyLCBhbmQgZG90dGluZyB3aXRoIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy85OFxuICAgIC8vIFRPRE86IHRoZSBzdGFydCBvciBlbmQgcG9pbnQgKHNob3VsZCBiZSB0aGUgc2FtZSByZXN1bHQpLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOThcbiAgICAvLyBUT0RPOiBTZWUgTGluZWFyRWRnZS5ldmFsdWF0ZUNsb3Nlc3REaXN0YW5jZVRvT3JpZ2luIGZvciBkZXRhaWxzLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOThcblxuICAgIGNvbnN0IGRlbHRhID0gdGhpcy5fZW5kLm1pbnVzKCB0aGlzLl9zdGFydCApO1xuXG4gICAgLy8gTm9ybWFsaXplZCBzdGFydCA9PiBlbmRcbiAgICBjb25zdCBub3JtYWxpemVkRGlyZWN0aW9uID0gZGVsdGEubm9ybWFsaXplZCgpO1xuXG4gICAgLy8gTm9ybWFsaXplZCBkaXN0YW5jZSBhbG9uZyB0aGUgbGluZSBmcm9tIHRoZSBzdGFydCB0byB0aGUgcG9pbnRcbiAgICBjb25zdCBpbnRlcnNlY3Rpb25Ob3JtYWxpemVkID0gcG9pbnQubWludXMoIHRoaXMuX3N0YXJ0ICkuZG90KCBub3JtYWxpemVkRGlyZWN0aW9uICk7XG5cbiAgICBjb25zdCBpbnRlcnNlY3Rpb25UID0gVXRpbHMuY2xhbXAoIGludGVyc2VjdGlvbk5vcm1hbGl6ZWQgLyBkZWx0YS5tYWduaXR1ZGUsIDAsIDEgKTtcblxuICAgIGNvbnN0IGludGVyc2VjdGlvblBvaW50ID0gdGhpcy5wb3NpdGlvbkF0KCBpbnRlcnNlY3Rpb25UICk7XG5cbiAgICByZXR1cm4gWyB7XG4gICAgICBzZWdtZW50OiB0aGlzLFxuICAgICAgdDogaW50ZXJzZWN0aW9uVCxcbiAgICAgIGNsb3Nlc3RQb2ludDogaW50ZXJzZWN0aW9uUG9pbnQsXG4gICAgICBkaXN0YW5jZVNxdWFyZWQ6IGludGVyc2VjdGlvblBvaW50LmRpc3RhbmNlU3F1YXJlZCggcG9pbnQgKVxuICAgIH0gXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTGluZSBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkTGluZSApOiBMaW5lIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvYmoudHlwZSA9PT0gJ0xpbmUnICk7XG5cbiAgICByZXR1cm4gbmV3IExpbmUoIG5ldyBWZWN0b3IyKCBvYmouc3RhcnRYLCBvYmouc3RhcnRZICksIG5ldyBWZWN0b3IyKCBvYmouZW5kWCwgb2JqLmVuZFkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIHR3byBsaW5lcyBvdmVybGFwIG92ZXIgYSBjb250aW51b3VzIHNlY3Rpb24sIGFuZCBpZiBzbyBmaW5kcyB0aGUgYSxiIHBhaXIgc3VjaCB0aGF0XG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lMVxuICAgKiBAcGFyYW0gbGluZTJcbiAgICogQHBhcmFtIFtlcHNpbG9uXSAtIFdpbGwgcmV0dXJuIG92ZXJsYXBzIG9ubHkgaWYgbm8gdHdvIGNvcnJlc3BvbmRpbmcgcG9pbnRzIGRpZmZlciBieSB0aGlzIGFtb3VudCBvciBtb3JlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbiBvbmUgY29tcG9uZW50LlxuICAgKiBAcmV0dXJucyAtIFRoZSBzb2x1dGlvbiwgaWYgdGhlcmUgaXMgb25lIChhbmQgb25seSBvbmUpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBzKCBsaW5lMTogTGluZSwgbGluZTI6IExpbmUsIGVwc2lsb24gPSAxZS02ICk6IE92ZXJsYXBbXSB7XG5cbiAgICAvKlxuICAgICAqIE5PVEU6IEZvciBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzIGluIHRoaXMgZnVuY3Rpb24sIHBsZWFzZSBzZWUgQ3ViaWMuZ2V0T3ZlcmxhcHMuIEl0IGdvZXMgb3ZlciBhbGwgb2YgdGhlXG4gICAgICogc2FtZSBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLCBidXQgaW5zdGVhZCBvdXIgYmV6aWVyIG1hdHJpeCBpcyBhIDJ4MjpcbiAgICAgKlxuICAgICAqIFsgIDEgIDAgXVxuICAgICAqIFsgLTEgIDEgXVxuICAgICAqXG4gICAgICogQW5kIHdlIHVzZSB0aGUgdXBwZXItbGVmdCBzZWN0aW9uIG9mIChhdCtiKSBhZGp1c3RtZW50IG1hdHJpeCByZWxldmFudCBmb3IgdGhlIGxpbmUuXG4gICAgICovXG5cbiAgICBjb25zdCBub092ZXJsYXA6IE92ZXJsYXBbXSA9IFtdO1xuXG4gICAgLy8gRWZmaWNpZW50bHkgY29tcHV0ZSB0aGUgbXVsdGlwbGljYXRpb24gb2YgdGhlIGJlemllciBtYXRyaXg6XG4gICAgY29uc3QgcDB4ID0gbGluZTEuX3N0YXJ0Lng7XG4gICAgY29uc3QgcDF4ID0gLTEgKiBsaW5lMS5fc3RhcnQueCArIGxpbmUxLl9lbmQueDtcbiAgICBjb25zdCBwMHkgPSBsaW5lMS5fc3RhcnQueTtcbiAgICBjb25zdCBwMXkgPSAtMSAqIGxpbmUxLl9zdGFydC55ICsgbGluZTEuX2VuZC55O1xuICAgIGNvbnN0IHEweCA9IGxpbmUyLl9zdGFydC54O1xuICAgIGNvbnN0IHExeCA9IC0xICogbGluZTIuX3N0YXJ0LnggKyBsaW5lMi5fZW5kLng7XG4gICAgY29uc3QgcTB5ID0gbGluZTIuX3N0YXJ0Lnk7XG4gICAgY29uc3QgcTF5ID0gLTEgKiBsaW5lMi5fc3RhcnQueSArIGxpbmUyLl9lbmQueTtcblxuICAgIC8vIERldGVybWluZSB0aGUgY2FuZGlkYXRlIG92ZXJsYXAgKHByZWZlcnJpbmcgdGhlIGRpbWVuc2lvbiB3aXRoIHRoZSBsYXJnZXN0IHZhcmlhdGlvbilcbiAgICBjb25zdCB4U3ByZWFkID0gTWF0aC5hYnMoIE1hdGgubWF4KCBsaW5lMS5fc3RhcnQueCwgbGluZTEuX2VuZC54LCBsaW5lMi5fc3RhcnQueCwgbGluZTIuX2VuZC54ICkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5taW4oIGxpbmUxLl9zdGFydC54LCBsaW5lMS5fZW5kLngsIGxpbmUyLl9zdGFydC54LCBsaW5lMi5fZW5kLnggKSApO1xuICAgIGNvbnN0IHlTcHJlYWQgPSBNYXRoLmFicyggTWF0aC5tYXgoIGxpbmUxLl9zdGFydC55LCBsaW5lMS5fZW5kLnksIGxpbmUyLl9zdGFydC55LCBsaW5lMi5fZW5kLnkgKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbiggbGluZTEuX3N0YXJ0LnksIGxpbmUxLl9lbmQueSwgbGluZTIuX3N0YXJ0LnksIGxpbmUyLl9lbmQueSApICk7XG4gICAgY29uc3QgeE92ZXJsYXAgPSBTZWdtZW50LnBvbHlub21pYWxHZXRPdmVybGFwTGluZWFyKCBwMHgsIHAxeCwgcTB4LCBxMXggKTtcbiAgICBjb25zdCB5T3ZlcmxhcCA9IFNlZ21lbnQucG9seW5vbWlhbEdldE92ZXJsYXBMaW5lYXIoIHAweSwgcDF5LCBxMHksIHExeSApO1xuICAgIGxldCBvdmVybGFwO1xuICAgIGlmICggeFNwcmVhZCA+IHlTcHJlYWQgKSB7XG4gICAgICBvdmVybGFwID0gKCB4T3ZlcmxhcCA9PT0gbnVsbCB8fCB4T3ZlcmxhcCA9PT0gdHJ1ZSApID8geU92ZXJsYXAgOiB4T3ZlcmxhcDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvdmVybGFwID0gKCB5T3ZlcmxhcCA9PT0gbnVsbCB8fCB5T3ZlcmxhcCA9PT0gdHJ1ZSApID8geE92ZXJsYXAgOiB5T3ZlcmxhcDtcbiAgICB9XG4gICAgaWYgKCBvdmVybGFwID09PSBudWxsIHx8IG92ZXJsYXAgPT09IHRydWUgKSB7XG4gICAgICByZXR1cm4gbm9PdmVybGFwOyAvLyBObyB3YXkgdG8gcGluIGRvd24gYW4gb3ZlcmxhcFxuICAgIH1cblxuICAgIGNvbnN0IGEgPSBvdmVybGFwLmE7XG4gICAgY29uc3QgYiA9IG92ZXJsYXAuYjtcblxuICAgIC8vIENvbXB1dGUgbGluZWFyIGNvZWZmaWNpZW50cyBmb3IgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBwKHQpIGFuZCBxKGEqdCtiKVxuICAgIGNvbnN0IGQweCA9IHEweCArIGIgKiBxMXggLSBwMHg7XG4gICAgY29uc3QgZDF4ID0gYSAqIHExeCAtIHAxeDtcbiAgICBjb25zdCBkMHkgPSBxMHkgKyBiICogcTF5IC0gcDB5O1xuICAgIGNvbnN0IGQxeSA9IGEgKiBxMXkgLSBwMXk7XG5cbiAgICAvLyBFeGFtaW5lIHRoZSBzaW5nbGUtY29vcmRpbmF0ZSBkaXN0YW5jZXMgYmV0d2VlbiB0aGUgXCJvdmVybGFwc1wiIGF0IGVhY2ggZXh0cmVtZSBUIHZhbHVlLiBJZiB0aGUgZGlzdGFuY2UgaXMgbGFyZ2VyXG4gICAgLy8gdGhhbiBvdXIgZXBzaWxvbiwgdGhlbiB0aGUgXCJvdmVybGFwXCIgd291bGQgbm90IGJlIHZhbGlkLlxuICAgIGlmICggTWF0aC5hYnMoIGQweCApID4gZXBzaWxvbiB8fFxuICAgICAgICAgTWF0aC5hYnMoIGQxeCArIGQweCApID4gZXBzaWxvbiB8fFxuICAgICAgICAgTWF0aC5hYnMoIGQweSApID4gZXBzaWxvbiB8fFxuICAgICAgICAgTWF0aC5hYnMoIGQxeSArIGQweSApID4gZXBzaWxvbiApIHtcbiAgICAgIC8vIFdlJ3JlIGFibGUgdG8gZWZmaWNpZW50bHkgaGFyZGNvZGUgdGhlc2UgZm9yIHRoZSBsaW5lLWxpbmUgY2FzZSwgc2luY2UgdGhlcmUgYXJlIG5vIGV4dHJlbWUgdCB2YWx1ZXMgdGhhdCBhcmVcbiAgICAgIC8vIG5vdCB0PTAgb3IgdD0xLlxuICAgICAgcmV0dXJuIG5vT3ZlcmxhcDtcbiAgICB9XG5cbiAgICBjb25zdCBxdDAgPSBiO1xuICAgIGNvbnN0IHF0MSA9IGEgKyBiO1xuXG4gICAgLy8gVE9ETzogZG8gd2Ugd2FudCBhbiBlcHNpbG9uIGluIGhlcmUgdG8gYmUgcGVybWlzc2l2ZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgaWYgKCAoIHF0MCA+IDEgJiYgcXQxID4gMSApIHx8ICggcXQwIDwgMCAmJiBxdDEgPCAwICkgKSB7XG4gICAgICByZXR1cm4gbm9PdmVybGFwO1xuICAgIH1cblxuICAgIHJldHVybiBbIG5ldyBPdmVybGFwKCBhLCBiICkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFueSAoZmluaXRlKSBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGUgdHdvIGxpbmUgc2VnbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG92ZXJyaWRlIGludGVyc2VjdCggYTogTGluZSwgYjogTGluZSApOiBTZWdtZW50SW50ZXJzZWN0aW9uW10ge1xuXG4gICAgLy8gVE9ETzogbG9vayBpbnRvIG51bWVyaWNhbGx5IG1vcmUgYWNjdXJhdGUgc29sdXRpb25zPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOThcblxuICAgIGNvbnN0IGxpbmVTZWdtZW50SW50ZXJzZWN0aW9uID0gVXRpbHMubGluZVNlZ21lbnRJbnRlcnNlY3Rpb24oXG4gICAgICBhLnN0YXJ0LngsIGEuc3RhcnQueSwgYS5lbmQueCwgYS5lbmQueSxcbiAgICAgIGIuc3RhcnQueCwgYi5zdGFydC55LCBiLmVuZC54LCBiLmVuZC55XG4gICAgKTtcblxuICAgIGlmICggbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBhVCA9IGEuZXhwbGljaXRDbG9zZXN0VG9Qb2ludCggbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gKVsgMCBdLnQ7XG4gICAgICBjb25zdCBiVCA9IGIuZXhwbGljaXRDbG9zZXN0VG9Qb2ludCggbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24gKVsgMCBdLnQ7XG4gICAgICByZXR1cm4gWyBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggbGluZVNlZ21lbnRJbnRlcnNlY3Rpb24sIGFULCBiVCApIF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFueSBpbnRlcnNlY3Rpb25zIGJldHdlZW4gYSBsaW5lIHNlZ21lbnQgYW5kIGFub3RoZXIgdHlwZSBvZiBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBiZSBtb3JlIG9wdGltaXplZCB0aGFuIHRoZSBnZW5lcmFsIGludGVyc2VjdGlvbiByb3V0aW5lIG9mIGFyYml0cmFyeSBzZWdtZW50cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaW50ZXJzZWN0T3RoZXIoIGxpbmU6IExpbmUsIG90aGVyOiBTZWdtZW50ICk6IFNlZ21lbnRJbnRlcnNlY3Rpb25bXSB7XG5cbiAgICAvLyBTZXQgdXAgYSByYXlcbiAgICBjb25zdCBkZWx0YSA9IGxpbmUuZW5kLm1pbnVzKCBsaW5lLnN0YXJ0ICk7XG4gICAgY29uc3QgbGVuZ3RoID0gZGVsdGEubWFnbml0dWRlO1xuICAgIGNvbnN0IHJheSA9IG5ldyBSYXkyKCBsaW5lLnN0YXJ0LCBkZWx0YS5ub3JtYWxpemUoKSApO1xuXG4gICAgLy8gRmluZCB0aGUgb3RoZXIgc2VnbWVudCdzIGludGVyc2VjdGlvbnMgd2l0aCB0aGUgcmF5XG4gICAgY29uc3QgcmF5SW50ZXJzZWN0aW9ucyA9IG90aGVyLmludGVyc2VjdGlvbiggcmF5ICk7XG5cbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcmF5SW50ZXJzZWN0aW9ucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHJheUludGVyc2VjdGlvbiA9IHJheUludGVyc2VjdGlvbnNbIGkgXTtcbiAgICAgIGNvbnN0IGxpbmVUID0gcmF5SW50ZXJzZWN0aW9uLmRpc3RhbmNlIC8gbGVuZ3RoO1xuXG4gICAgICAvLyBFeGNsdWRlIGludGVyc2VjdGlvbnMgdGhhdCBhcmUgb3V0c2lkZSBvdXIgbGluZSBzZWdtZW50IChvciByaWdodCBvbiB0aGUgYm91bmRhcnkpXG4gICAgICBpZiAoIGxpbmVUID4gMWUtOCAmJiBsaW5lVCA8IDEgLSAxZS04ICkge1xuICAgICAgICByZXN1bHRzLnB1c2goIG5ldyBTZWdtZW50SW50ZXJzZWN0aW9uKCByYXlJbnRlcnNlY3Rpb24ucG9pbnQsIGxpbmVULCByYXlJbnRlcnNlY3Rpb24udCApICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmtpdGUucmVnaXN0ZXIoICdMaW5lJywgTGluZSApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiUmF5MiIsIlV0aWxzIiwiVmVjdG9yMiIsIkFyYyIsImtpdGUiLCJPdmVybGFwIiwiUmF5SW50ZXJzZWN0aW9uIiwiU2VnbWVudCIsIlNlZ21lbnRJbnRlcnNlY3Rpb24iLCJzdmdOdW1iZXIiLCJzY3JhdGNoVmVjdG9yMiIsIkxpbmUiLCJzZXRTdGFydCIsInN0YXJ0IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJ0b1N0cmluZyIsIl9zdGFydCIsImVxdWFscyIsImludmFsaWRhdGUiLCJ2YWx1ZSIsImdldFN0YXJ0Iiwic2V0RW5kIiwiZW5kIiwiX2VuZCIsImdldEVuZCIsInBvc2l0aW9uQXQiLCJ0IiwicGx1cyIsIm1pbnVzIiwidGltZXMiLCJ0YW5nZW50QXQiLCJnZXRTdGFydFRhbmdlbnQiLCJjdXJ2YXR1cmVBdCIsInN1YmRpdmlkZWQiLCJwdCIsIl90YW5nZW50IiwiX2JvdW5kcyIsIl9zdmdQYXRoRnJhZ21lbnQiLCJpbnZhbGlkYXRpb25FbWl0dGVyIiwiZW1pdCIsIm5vcm1hbGl6ZWQiLCJzdGFydFRhbmdlbnQiLCJnZXRFbmRUYW5nZW50IiwiZW5kVGFuZ2VudCIsImdldEJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwiYWRkUG9pbnQiLCJib3VuZHMiLCJnZXRCb3VuZHNXaXRoVHJhbnNmb3JtIiwibWF0cml4IiwibXVsdGlwbHlWZWN0b3IyIiwic2V0IiwiZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzIiwiZ2V0U1ZHUGF0aEZyYWdtZW50Iiwib2xkUGF0aEZyYWdtZW50IiwieCIsInkiLCJzdHJva2VMZWZ0IiwibGluZVdpZHRoIiwib2Zmc2V0IiwicGVycGVuZGljdWxhciIsIm5lZ2F0ZWQiLCJzdHJva2VSaWdodCIsImdldEludGVyaW9yRXh0cmVtYVRzIiwiaW50ZXJzZWN0aW9uIiwicmF5IiwicmVzdWx0IiwiZGlmZiIsIm1hZ25pdHVkZVNxdWFyZWQiLCJkZW5vbSIsImRpcmVjdGlvbiIsInBvc2l0aW9uIiwicyIsInBlcnAiLCJpbnRlcnNlY3Rpb25Qb2ludCIsIm5vcm1hbCIsImRvdCIsIndpbmQiLCJwdXNoIiwid2luZGluZ0ludGVyc2VjdGlvbiIsImhpdHMiLCJsZW5ndGgiLCJ3cml0ZVRvQ29udGV4dCIsImNvbnRleHQiLCJsaW5lVG8iLCJ0cmFuc2Zvcm1lZCIsInRpbWVzVmVjdG9yMiIsImV4cGxpY2l0Q2xvc2VzdFRvUG9pbnQiLCJwb2ludCIsImNsYW1wIiwiY2xvc2VzdFBvaW50Iiwic2VnbWVudCIsImRpc3RhbmNlU3F1YXJlZCIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsInJlcGFyYW1ldGVyaXplZCIsImEiLCJiIiwicmV2ZXJzZWQiLCJwb2xhclRvQ2FydGVzaWFuIiwib3B0aW9ucyIsImNyZWF0ZVBvbGFyIiwiWkVSTyIsInRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMiLCJnZXRBcmNMZW5ndGgiLCJkaXN0YW5jZSIsInRvUGllY2V3aXNlTGluZWFyT3JBcmNTZWdtZW50cyIsInNlcmlhbGl6ZSIsInR5cGUiLCJzdGFydFgiLCJzdGFydFkiLCJlbmRYIiwiZW5kWSIsImdldE92ZXJsYXBzIiwiZXBzaWxvbiIsImdldENsb3Nlc3RQb2ludHMiLCJkZWx0YSIsIm5vcm1hbGl6ZWREaXJlY3Rpb24iLCJpbnRlcnNlY3Rpb25Ob3JtYWxpemVkIiwiaW50ZXJzZWN0aW9uVCIsIm1hZ25pdHVkZSIsImRlc2VyaWFsaXplIiwib2JqIiwibGluZTEiLCJsaW5lMiIsIm5vT3ZlcmxhcCIsInAweCIsInAxeCIsInAweSIsInAxeSIsInEweCIsInExeCIsInEweSIsInExeSIsInhTcHJlYWQiLCJNYXRoIiwiYWJzIiwibWF4IiwibWluIiwieVNwcmVhZCIsInhPdmVybGFwIiwicG9seW5vbWlhbEdldE92ZXJsYXBMaW5lYXIiLCJ5T3ZlcmxhcCIsIm92ZXJsYXAiLCJkMHgiLCJkMXgiLCJkMHkiLCJkMXkiLCJxdDAiLCJxdDEiLCJpbnRlcnNlY3QiLCJsaW5lU2VnbWVudEludGVyc2VjdGlvbiIsImFUIiwiYlQiLCJpbnRlcnNlY3RPdGhlciIsImxpbmUiLCJvdGhlciIsIm5vcm1hbGl6ZSIsInJheUludGVyc2VjdGlvbnMiLCJyZXN1bHRzIiwiaSIsInJheUludGVyc2VjdGlvbiIsImxpbmVUIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFFakQsT0FBT0MsVUFBVSwwQkFBMEI7QUFDM0MsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsR0FBRyxFQUF3QkMsSUFBSSxFQUFFQyxPQUFPLEVBQTBCQyxlQUFlLEVBQUVDLE9BQU8sRUFBRUMsbUJBQW1CLEVBQUVDLFNBQVMsUUFBUSxnQkFBZ0I7QUFFM0osTUFBTUMsaUJBQWlCLElBQUlSLFFBQVMsR0FBRztBQVV4QixJQUFBLEFBQU1TLE9BQU4sTUFBTUEsYUFBYUo7SUFzQmhDOztHQUVDLEdBQ0QsQUFBT0ssU0FBVUMsS0FBYyxFQUFTO1FBQ3RDQyxVQUFVQSxPQUFRRCxNQUFNRSxRQUFRLElBQUksQ0FBQyw2QkFBNkIsRUFBRUYsTUFBTUcsUUFBUSxJQUFJO1FBRXRGLElBQUssQ0FBQyxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFFTCxRQUFVO1lBQ2xDLElBQUksQ0FBQ0ksTUFBTSxHQUFH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