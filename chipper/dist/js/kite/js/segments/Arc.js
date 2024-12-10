// Copyright 2013-2024, University of Colorado Boulder
/**
 * A circular arc (a continuous sub-part of a circle).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { EllipticalArc, kite, Line, Overlap, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';
// TODO: See if we should use this more https://github.com/phetsims/kite/issues/76
const TWO_PI = Math.PI * 2;
let Arc = class Arc extends Segment {
    /**
   * Sets the center of the Arc.
   */ setCenter(center) {
        assert && assert(center.isFinite(), `Arc center should be finite: ${center.toString()}`);
        if (!this._center.equals(center)) {
            this._center = center;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set center(value) {
        this.setCenter(value);
    }
    get center() {
        return this.getCenter();
    }
    /**
   * Returns the center of this Arc.
   */ getCenter() {
        return this._center;
    }
    /**
   * Sets the radius of the Arc.
   */ setRadius(radius) {
        assert && assert(isFinite(radius), `Arc radius should be a finite number: ${radius}`);
        if (this._radius !== radius) {
            this._radius = radius;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set radius(value) {
        this.setRadius(value);
    }
    get radius() {
        return this.getRadius();
    }
    /**
   * Returns the radius of this Arc.
   */ getRadius() {
        return this._radius;
    }
    /**
   * Sets the startAngle of the Arc.
   */ setStartAngle(startAngle) {
        assert && assert(isFinite(startAngle), `Arc startAngle should be a finite number: ${startAngle}`);
        if (this._startAngle !== startAngle) {
            this._startAngle = startAngle;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set startAngle(value) {
        this.setStartAngle(value);
    }
    get startAngle() {
        return this.getStartAngle();
    }
    /**
   * Returns the startAngle of this Arc.
   */ getStartAngle() {
        return this._startAngle;
    }
    /**
   * Sets the endAngle of the Arc.
   */ setEndAngle(endAngle) {
        assert && assert(isFinite(endAngle), `Arc endAngle should be a finite number: ${endAngle}`);
        if (this._endAngle !== endAngle) {
            this._endAngle = endAngle;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set endAngle(value) {
        this.setEndAngle(value);
    }
    get endAngle() {
        return this.getEndAngle();
    }
    /**
   * Returns the endAngle of this Arc.
   */ getEndAngle() {
        return this._endAngle;
    }
    /**
   * Sets the anticlockwise of the Arc.
   */ setAnticlockwise(anticlockwise) {
        if (this._anticlockwise !== anticlockwise) {
            this._anticlockwise = anticlockwise;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set anticlockwise(value) {
        this.setAnticlockwise(value);
    }
    get anticlockwise() {
        return this.getAnticlockwise();
    }
    /**
   * Returns the anticlockwise of this Arc.
   */ getAnticlockwise() {
        return this._anticlockwise;
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
        return this.positionAtAngle(this.angleAt(t));
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
        return this.tangentAtAngle(this.angleAt(t));
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
        // Since it is an arc of as circle, the curvature is independent of t
        return (this._anticlockwise ? -1 : 1) / this._radius;
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
        // TODO: verify that we don't need to switch anticlockwise here, or subtract 2pi off any angles https://github.com/phetsims/kite/issues/76
        const angle0 = this.angleAt(0);
        const angleT = this.angleAt(t);
        const angle1 = this.angleAt(1);
        return [
            new Arc(this._center, this._radius, angle0, angleT, this._anticlockwise),
            new Arc(this._center, this._radius, angleT, angle1, this._anticlockwise)
        ];
    }
    /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */ invalidate() {
        this._start = null;
        this._end = null;
        this._startTangent = null;
        this._endTangent = null;
        this._actualEndAngle = null;
        this._isFullPerimeter = null;
        this._angleDifference = null;
        this._bounds = null;
        this._svgPathFragment = null;
        assert && assert(this._center instanceof Vector2, 'Arc center should be a Vector2');
        assert && assert(this._center.isFinite(), 'Arc center should be finite (not NaN or infinite)');
        assert && assert(typeof this._radius === 'number', `Arc radius should be a number: ${this._radius}`);
        assert && assert(isFinite(this._radius), `Arc radius should be a finite number: ${this._radius}`);
        assert && assert(typeof this._startAngle === 'number', `Arc startAngle should be a number: ${this._startAngle}`);
        assert && assert(isFinite(this._startAngle), `Arc startAngle should be a finite number: ${this._startAngle}`);
        assert && assert(typeof this._endAngle === 'number', `Arc endAngle should be a number: ${this._endAngle}`);
        assert && assert(isFinite(this._endAngle), `Arc endAngle should be a finite number: ${this._endAngle}`);
        assert && assert(typeof this._anticlockwise === 'boolean', `Arc anticlockwise should be a boolean: ${this._anticlockwise}`);
        // Remap negative radius to a positive radius
        if (this._radius < 0) {
            // support this case since we might actually need to handle it inside of strokes?
            this._radius = -this._radius;
            this._startAngle += Math.PI;
            this._endAngle += Math.PI;
        }
        // Constraints that should always be satisfied
        assert && assert(!(!this.anticlockwise && this._endAngle - this._startAngle <= -Math.PI * 2 || this.anticlockwise && this._startAngle - this._endAngle <= -Math.PI * 2), 'Not handling arcs with start/end angles that show differences in-between browser handling');
        assert && assert(!(!this.anticlockwise && this._endAngle - this._startAngle > Math.PI * 2 || this.anticlockwise && this._startAngle - this._endAngle > Math.PI * 2), 'Not handling arcs with start/end angles that show differences in-between browser handling');
        this.invalidationEmitter.emit();
    }
    /**
   * Gets the start position of this arc.
   */ getStart() {
        if (this._start === null) {
            this._start = this.positionAtAngle(this._startAngle);
        }
        return this._start;
    }
    get start() {
        return this.getStart();
    }
    /**
   * Gets the end position of this arc.
   */ getEnd() {
        if (this._end === null) {
            this._end = this.positionAtAngle(this._endAngle);
        }
        return this._end;
    }
    get end() {
        return this.getEnd();
    }
    /**
   * Gets the unit vector tangent to this arc at the start point.
   */ getStartTangent() {
        if (this._startTangent === null) {
            this._startTangent = this.tangentAtAngle(this._startAngle);
        }
        return this._startTangent;
    }
    get startTangent() {
        return this.getStartTangent();
    }
    /**
   * Gets the unit vector tangent to the arc at the end point.
   */ getEndTangent() {
        if (this._endTangent === null) {
            this._endTangent = this.tangentAtAngle(this._endAngle);
        }
        return this._endTangent;
    }
    get endTangent() {
        return this.getEndTangent();
    }
    /**
   * Gets the end angle in radians.
   */ getActualEndAngle() {
        if (this._actualEndAngle === null) {
            this._actualEndAngle = Arc.computeActualEndAngle(this._startAngle, this._endAngle, this._anticlockwise);
        }
        return this._actualEndAngle;
    }
    get actualEndAngle() {
        return this.getActualEndAngle();
    }
    /**
   * Returns a boolean value that indicates if the arc wraps up by more than two Pi.
   */ getIsFullPerimeter() {
        if (this._isFullPerimeter === null) {
            this._isFullPerimeter = !this._anticlockwise && this._endAngle - this._startAngle >= Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle >= Math.PI * 2;
        }
        return this._isFullPerimeter;
    }
    get isFullPerimeter() {
        return this.getIsFullPerimeter();
    }
    /**
   * Returns an angle difference that represents how "much" of the circle our arc covers.
   *
   * The answer is always greater or equal to zero
   * The answer can exceed two Pi
   */ getAngleDifference() {
        if (this._angleDifference === null) {
            // compute an angle difference that represents how "much" of the circle our arc covers
            this._angleDifference = this._anticlockwise ? this._startAngle - this._endAngle : this._endAngle - this._startAngle;
            if (this._angleDifference < 0) {
                this._angleDifference += Math.PI * 2;
            }
            assert && assert(this._angleDifference >= 0); // now it should always be zero or positive
        }
        return this._angleDifference;
    }
    get angleDifference() {
        return this.getAngleDifference();
    }
    /**
   * Returns the bounds of this segment.
   */ getBounds() {
        if (this._bounds === null) {
            // acceleration for intersection
            this._bounds = Bounds2.NOTHING.copy().withPoint(this.getStart()).withPoint(this.getEnd());
            // if the angles are different, check extrema points
            if (this._startAngle !== this._endAngle) {
                // check all of the extrema points
                this.includeBoundsAtAngle(0);
                this.includeBoundsAtAngle(Math.PI / 2);
                this.includeBoundsAtAngle(Math.PI);
                this.includeBoundsAtAngle(3 * Math.PI / 2);
            }
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Returns a list of non-degenerate segments that are equivalent to this segment. Generally gets rid (or simplifies)
   * invalid or repeated segments.
   */ getNondegenerateSegments() {
        if (this._radius <= 0 || this._startAngle === this._endAngle) {
            return [];
        } else {
            return [
                this
            ]; // basically, Arcs aren't really degenerate that easily
        }
    }
    /**
   * Attempts to expand the private _bounds bounding box to include a point at a specific angle, making sure that
   * angle is actually included in the arc. This will presumably be called at angles that are at critical points,
   * where the arc should have maximum/minimum x/y values.
   */ includeBoundsAtAngle(angle) {
        if (this.containsAngle(angle)) {
            // the boundary point is in the arc
            this._bounds = this._bounds.withPoint(this._center.plus(Vector2.createPolar(this._radius, angle)));
        }
    }
    /**
   * Maps a contained angle to between [startAngle,actualEndAngle), even if the end angle is lower.
   */ mapAngle(angle) {
        if (Math.abs(Utils.moduloBetweenDown(angle - this._startAngle, -Math.PI, Math.PI)) < 1e-8) {
            return this._startAngle;
        }
        if (Math.abs(Utils.moduloBetweenDown(angle - this.getActualEndAngle(), -Math.PI, Math.PI)) < 1e-8) {
            return this.getActualEndAngle();
        }
        // consider an assert that we contain that angle?
        return this._startAngle > this.getActualEndAngle() ? Utils.moduloBetweenUp(angle, this._startAngle - 2 * Math.PI, this._startAngle) : Utils.moduloBetweenDown(angle, this._startAngle, this._startAngle + 2 * Math.PI);
    }
    /**
   * Returns the parametrized value t for a given angle. The value t should range from 0 to 1 (inclusive).
   */ tAtAngle(angle) {
        const t = (this.mapAngle(angle) - this._startAngle) / (this.getActualEndAngle() - this._startAngle);
        assert && assert(t >= 0 && t <= 1, `tAtAngle out of range: ${t}`);
        return t;
    }
    /**
   * Returns the angle for the parametrized t value. The t value should range from 0 to 1 (inclusive).
   */ angleAt(t) {
        //TODO: add asserts https://github.com/phetsims/kite/issues/76
        return this._startAngle + (this.getActualEndAngle() - this._startAngle) * t;
    }
    /**
   * Returns the position of this arc at angle.
   */ positionAtAngle(angle) {
        return this._center.plus(Vector2.createPolar(this._radius, angle));
    }
    /**
   * Returns the normalized tangent of this arc.
   * The tangent points outward (inward) of this arc for clockwise (anticlockwise) direction.
   */ tangentAtAngle(angle) {
        const normal = Vector2.createPolar(1, angle);
        return this._anticlockwise ? normal.perpendicular : normal.perpendicular.negated();
    }
    /**
   * Returns whether the given angle is contained by the arc (whether a ray from the arc's origin going in that angle
   * will intersect the arc).
   */ containsAngle(angle) {
        // transform the angle into the appropriate coordinate form
        // TODO: check anticlockwise version! https://github.com/phetsims/kite/issues/76
        const normalizedAngle = this._anticlockwise ? angle - this._endAngle : angle - this._startAngle;
        // get the angle between 0 and 2pi
        const positiveMinAngle = Utils.moduloBetweenDown(normalizedAngle, 0, Math.PI * 2);
        return positiveMinAngle <= this.angleDifference;
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
            // see http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for more info
            // rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const epsilon = 0.01; // allow some leeway to render things as 'almost circles'
            const sweepFlag = this._anticlockwise ? '0' : '1';
            let largeArcFlag;
            if (this.angleDifference < Math.PI * 2 - epsilon) {
                largeArcFlag = this.angleDifference < Math.PI ? '0' : '1';
                this._svgPathFragment = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(this.end.x)} ${svgNumber(this.end.y)}`;
            } else {
                // circle (or almost-circle) case needs to be handled differently
                // since SVG will not be able to draw (or know how to draw) the correct circle if we just have a start and end, we need to split it into two circular arcs
                // get the angle that is between and opposite of both of the points
                const splitOppositeAngle = (this._startAngle + this._endAngle) / 2; // this _should_ work for the modular case?
                const splitPoint = this._center.plus(Vector2.createPolar(this._radius, splitOppositeAngle));
                largeArcFlag = '0'; // since we split it in 2, it's always the small arc
                const firstArc = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(splitPoint.x)} ${svgNumber(splitPoint.y)}`;
                const secondArc = `A ${svgNumber(this._radius)} ${svgNumber(this._radius)} 0 ${largeArcFlag} ${sweepFlag} ${svgNumber(this.end.x)} ${svgNumber(this.end.y)}`;
                this._svgPathFragment = `${firstArc} ${secondArc}`;
            }
        }
        if (assert) {
            if (oldPathFragment) {
                assert(oldPathFragment === this._svgPathFragment, 'Quadratic line segment changed without invalidate()');
            }
        }
        return this._svgPathFragment;
    }
    /**
   * Returns an array of arcs that will draw an offset on the logical left side
   */ strokeLeft(lineWidth) {
        return [
            new Arc(this._center, this._radius + (this._anticlockwise ? 1 : -1) * lineWidth / 2, this._startAngle, this._endAngle, this._anticlockwise)
        ];
    }
    /**
   * Returns an array of arcs that will draw an offset curve on the logical right side
   */ strokeRight(lineWidth) {
        return [
            new Arc(this._center, this._radius + (this._anticlockwise ? -1 : 1) * lineWidth / 2, this._endAngle, this._startAngle, !this._anticlockwise)
        ];
    }
    /**
   * Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * Does not include t=0 and t=1
   */ getInteriorExtremaTs() {
        const result = [];
        _.each([
            0,
            Math.PI / 2,
            Math.PI,
            3 * Math.PI / 2
        ], (angle)=>{
            if (this.containsAngle(angle)) {
                const t = this.tAtAngle(angle);
                const epsilon = 0.0000000001; // TODO: general kite epsilon?, also do 1e-Number format https://github.com/phetsims/kite/issues/76
                if (t > epsilon && t < 1 - epsilon) {
                    result.push(t);
                }
            }
        });
        return result.sort(); // modifies original, which is OK
    }
    /**
   * Hit-tests this segment with the ray. An array of all intersections of the ray with this segment will be returned.
   * For details, see the documentation in Segment.js
   */ intersection(ray) {
        const result = []; // hits in order
        // left here, if in the future we want to better-handle boundary points
        const epsilon = 0;
        // Run a general circle-intersection routine, then we can test the angles later.
        // Solves for the two solutions t such that ray.position + ray.direction * t is on the circle.
        // Then we check whether the angle at each possible hit point is in our arc.
        const centerToRay = ray.position.minus(this._center);
        const tmp = ray.direction.dot(centerToRay);
        const centerToRayDistSq = centerToRay.magnitudeSquared;
        const discriminant = 4 * tmp * tmp - 4 * (centerToRayDistSq - this._radius * this._radius);
        if (discriminant < epsilon) {
            // ray misses circle entirely
            return result;
        }
        const base = ray.direction.dot(this._center) - ray.direction.dot(ray.position);
        const sqt = Math.sqrt(discriminant) / 2;
        const ta = base - sqt;
        const tb = base + sqt;
        if (tb < epsilon) {
            // circle is behind ray
            return result;
        }
        const pointB = ray.pointAtDistance(tb);
        const normalB = pointB.minus(this._center).normalized();
        const normalBAngle = normalB.angle;
        if (ta < epsilon) {
            // we are inside the circle, so only one intersection is possible
            if (this.containsAngle(normalBAngle)) {
                // normal is towards the ray, so we negate it. also winds opposite way
                result.push(new RayIntersection(tb, pointB, normalB.negated(), this._anticlockwise ? -1 : 1, this.tAtAngle(normalBAngle)));
            }
        } else {
            // two possible hits (outside circle)
            const pointA = ray.pointAtDistance(ta);
            const normalA = pointA.minus(this._center).normalized();
            const normalAAngle = normalA.angle;
            if (this.containsAngle(normalAAngle)) {
                // hit from outside
                result.push(new RayIntersection(ta, pointA, normalA, this._anticlockwise ? 1 : -1, this.tAtAngle(normalAAngle)));
            }
            if (this.containsAngle(normalBAngle)) {
                result.push(new RayIntersection(tb, pointB, normalB.negated(), this._anticlockwise ? -1 : 1, this.tAtAngle(normalBAngle)));
            }
        }
        return result;
    }
    /**
   * Returns the resultant winding number of this ray intersecting this arc.
   */ windingIntersection(ray) {
        let wind = 0;
        const hits = this.intersection(ray);
        _.each(hits, (hit)=>{
            wind += hit.wind;
        });
        return wind;
    }
    /**
   * Draws this arc to the 2D Canvas context, assuming the context's current location is already at the start point
   */ writeToContext(context) {
        context.arc(this._center.x, this._center.y, this._radius, this._startAngle, this._endAngle, this._anticlockwise);
    }
    /**
   * Returns a new copy of this arc, transformed by the given matrix.
   *
   * TODO: test various transform types, especially rotations, scaling, shears, etc. https://github.com/phetsims/kite/issues/76
   */ transformed(matrix) {
        // so we can handle reflections in the transform, we do the general case handling for start/end angles
        const startAngle = matrix.timesVector2(Vector2.createPolar(1, this._startAngle)).minus(matrix.timesVector2(Vector2.ZERO)).angle;
        let endAngle = matrix.timesVector2(Vector2.createPolar(1, this._endAngle)).minus(matrix.timesVector2(Vector2.ZERO)).angle;
        // reverse the 'clockwiseness' if our transform includes a reflection
        const anticlockwise = matrix.getDeterminant() >= 0 ? this._anticlockwise : !this._anticlockwise;
        if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
            endAngle = anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
        }
        const scaleVector = matrix.getScaleVector();
        if (scaleVector.x !== scaleVector.y) {
            const radiusX = scaleVector.x * this._radius;
            const radiusY = scaleVector.y * this._radius;
            return new EllipticalArc(matrix.timesVector2(this._center), radiusX, radiusY, 0, startAngle, endAngle, anticlockwise);
        } else {
            const radius = scaleVector.x * this._radius;
            return new Arc(matrix.timesVector2(this._center), radius, startAngle, endAngle, anticlockwise);
        }
    }
    /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */ getSignedAreaFragment() {
        const t0 = this._startAngle;
        const t1 = this.getActualEndAngle();
        // Derived via Mathematica (curve-area.nb)
        return 0.5 * this._radius * (this._radius * (t1 - t0) + this._center.x * (Math.sin(t1) - Math.sin(t0)) - this._center.y * (Math.cos(t1) - Math.cos(t0)));
    }
    /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */ reversed() {
        return new Arc(this._center, this._radius, this._endAngle, this._startAngle, !this._anticlockwise);
    }
    /**
   * Returns the arc length of the segment.
   */ getArcLength() {
        return this.getAngleDifference() * this._radius;
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
            type: 'Arc',
            centerX: this._center.x,
            centerY: this._center.y,
            radius: this._radius,
            startAngle: this._startAngle,
            endAngle: this._endAngle,
            anticlockwise: this._anticlockwise
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
        if (segment instanceof Arc) {
            return Arc.getOverlaps(this, segment);
        }
        return null;
    }
    /**
   * Returns the matrix representation of the conic section of the circle.
   * See https://en.wikipedia.org/wiki/Matrix_representation_of_conic_sections
   */ getConicMatrix() {
        // ( x - a )^2 + ( y - b )^2 = r^2
        // x^2 - 2ax + a^2 + y^2 - 2by + b^2 = r^2
        // x^2 + y^2 - 2ax - 2by + ( a^2 + b^2 - r^2 ) = 0
        const a = this.center.x;
        const b = this.center.y;
        // Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
        const A = 1;
        const B = 0;
        const C = 1;
        const D = -2 * a;
        const E = -2 * b;
        const F = a * a + b * b - this.radius * this.radius;
        return Matrix3.rowMajor(A, B / 2, D / 2, B / 2, C, E / 2, D / 2, E / 2, F);
    }
    /**
   * Returns an Arc from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Arc');
        return new Arc(new Vector2(obj.centerX, obj.centerY), obj.radius, obj.startAngle, obj.endAngle, obj.anticlockwise);
    }
    /**
   * Determines the actual end angle (compared to the start angle).
   *
   * Normalizes the sign of the angles, so that the sign of ( endAngle - startAngle ) matches whether it is
   * anticlockwise.
   */ static computeActualEndAngle(startAngle, endAngle, anticlockwise) {
        if (anticlockwise) {
            // angle is 'decreasing'
            // -2pi <= end - start < 2pi
            if (startAngle > endAngle) {
                return endAngle;
            } else if (startAngle < endAngle) {
                return endAngle - 2 * Math.PI;
            } else {
                // equal
                return startAngle;
            }
        } else {
            // angle is 'increasing'
            // -2pi < end - start <= 2pi
            if (startAngle < endAngle) {
                return endAngle;
            } else if (startAngle > endAngle) {
                return endAngle + Math.PI * 2;
            } else {
                // equal
                return startAngle;
            }
        }
    }
    /**
   * Computes the potential overlap between [0,end1] and [start2,end2] (with t-values [0,1] and [tStart2,tEnd2]).
   *
   * @param end1 - Relative end angle of the first segment
   * @param start2 - Relative start angle of the second segment
   * @param end2 - Relative end angle of the second segment
   * @param tStart2 - The parametric value of the second segment's start
   * @param tEnd2 - The parametric value of the second segment's end
   */ static getPartialOverlap(end1, start2, end2, tStart2, tEnd2) {
        assert && assert(end1 > 0 && end1 <= TWO_PI + 1e-10);
        assert && assert(start2 >= 0 && start2 < TWO_PI + 1e-10);
        assert && assert(end2 >= 0 && end2 <= TWO_PI + 1e-10);
        assert && assert(tStart2 >= 0 && tStart2 <= 1);
        assert && assert(tEnd2 >= 0 && tEnd2 <= 1);
        const reversed2 = end2 < start2;
        const min2 = reversed2 ? end2 : start2;
        const max2 = reversed2 ? start2 : end2;
        const overlapMin = min2;
        const overlapMax = Math.min(end1, max2);
        // If there's not a small amount of overlap
        if (overlapMax < overlapMin + 1e-8) {
            return [];
        } else {
            return [
                Overlap.createLinear(// minimum
                Utils.clamp(Utils.linear(0, end1, 0, 1, overlapMin), 0, 1), Utils.clamp(Utils.linear(start2, end2, tStart2, tEnd2, overlapMin), 0, 1), // maximum
                Utils.clamp(Utils.linear(0, end1, 0, 1, overlapMax), 0, 1), Utils.clamp(Utils.linear(start2, end2, tStart2, tEnd2, overlapMax), 0, 1) // arc2 max
                )
            ];
        }
    }
    /**
   * Determine whether two Arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @param startAngle1 - Start angle of arc 1
   * @param endAngle1 - "Actual" end angle of arc 1
   * @param startAngle2 - Start angle of arc 2
   * @param endAngle2 - "Actual" end angle of arc 2
   * @returns - Any overlaps (from 0 to 2)
   */ static getAngularOverlaps(startAngle1, endAngle1, startAngle2, endAngle2) {
        assert && assert(isFinite(startAngle1));
        assert && assert(isFinite(endAngle1));
        assert && assert(isFinite(startAngle2));
        assert && assert(isFinite(endAngle2));
        // Remap start of arc 1 to 0, and the end to be positive (sign1 )
        let end1 = endAngle1 - startAngle1;
        const sign1 = end1 < 0 ? -1 : 1;
        end1 *= sign1;
        // Remap arc 2 so the start point maps to the [0,2pi) range (and end-point may lie outside that)
        const start2 = Utils.moduloBetweenDown(sign1 * (startAngle2 - startAngle1), 0, TWO_PI);
        const end2 = sign1 * (endAngle2 - startAngle2) + start2;
        let wrapT;
        if (end2 < -1e-10) {
            wrapT = -start2 / (end2 - start2);
            return Arc.getPartialOverlap(end1, start2, 0, 0, wrapT).concat(Arc.getPartialOverlap(end1, TWO_PI, end2 + TWO_PI, wrapT, 1));
        } else if (end2 > TWO_PI + 1e-10) {
            wrapT = (TWO_PI - start2) / (end2 - start2);
            return Arc.getPartialOverlap(end1, start2, TWO_PI, 0, wrapT).concat(Arc.getPartialOverlap(end1, 0, end2 - TWO_PI, wrapT, 1));
        } else {
            return Arc.getPartialOverlap(end1, start2, end2, 0, 1);
        }
    }
    /**
   * Determine whether two Arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @returns - Any overlaps (from 0 to 2)
   */ static getOverlaps(arc1, arc2) {
        if (arc1._center.distance(arc2._center) > 1e-4 || Math.abs(arc1._radius - arc2._radius) > 1e-4) {
            return [];
        }
        return Arc.getAngularOverlaps(arc1._startAngle, arc1.getActualEndAngle(), arc2._startAngle, arc2.getActualEndAngle());
    }
    /**
   * Returns the points of intersections between two circles.
   *
   * @param center1 - Center of the first circle
   * @param radius1 - Radius of the first circle
   * @param center2 - Center of the second circle
   * @param radius2 - Radius of the second circle
   */ static getCircleIntersectionPoint(center1, radius1, center2, radius2) {
        assert && assert(isFinite(radius1) && radius1 >= 0);
        assert && assert(isFinite(radius2) && radius2 >= 0);
        const delta = center2.minus(center1);
        const d = delta.magnitude;
        let results = [];
        if (d < 1e-10 || d > radius1 + radius2 + 1e-10) {
        // No intersections
        } else if (d > radius1 + radius2 - 1e-10) {
            results = [
                center1.blend(center2, radius1 / d)
            ];
        } else {
            const xPrime = 0.5 * (d * d - radius2 * radius2 + radius1 * radius1) / d;
            const bit = d * d - radius2 * radius2 + radius1 * radius1;
            const discriminant = 4 * d * d * radius1 * radius1 - bit * bit;
            const base = center1.blend(center2, xPrime / d);
            if (discriminant >= 1e-10) {
                const yPrime = Math.sqrt(discriminant) / d / 2;
                const perpendicular = delta.perpendicular.setMagnitude(yPrime);
                results = [
                    base.plus(perpendicular),
                    base.minus(perpendicular)
                ];
            } else if (discriminant > -1e-10) {
                results = [
                    base
                ];
            }
        }
        if (assert) {
            results.forEach((result)=>{
                assert(Math.abs(result.distance(center1) - radius1) < 1e-8);
                assert(Math.abs(result.distance(center2) - radius2) < 1e-8);
            });
        }
        return results;
    }
    /**
   * Returns any (finite) intersection between the two arc segments.
   */ static intersect(a, b) {
        const epsilon = 1e-7;
        const results = [];
        // If we effectively have the same circle, just different sections of it. The only finite intersections could be
        // at the endpoints, so we'll inspect those.
        if (a._center.equalsEpsilon(b._center, epsilon) && Math.abs(a._radius - b._radius) < epsilon) {
            const aStart = a.positionAt(0);
            const aEnd = a.positionAt(1);
            const bStart = b.positionAt(0);
            const bEnd = b.positionAt(1);
            if (aStart.equalsEpsilon(bStart, epsilon)) {
                results.push(new SegmentIntersection(aStart.average(bStart), 0, 0));
            }
            if (aStart.equalsEpsilon(bEnd, epsilon)) {
                results.push(new SegmentIntersection(aStart.average(bEnd), 0, 1));
            }
            if (aEnd.equalsEpsilon(bStart, epsilon)) {
                results.push(new SegmentIntersection(aEnd.average(bStart), 1, 0));
            }
            if (aEnd.equalsEpsilon(bEnd, epsilon)) {
                results.push(new SegmentIntersection(aEnd.average(bEnd), 1, 1));
            }
        } else {
            const points = Arc.getCircleIntersectionPoint(a._center, a._radius, b._center, b._radius);
            for(let i = 0; i < points.length; i++){
                const point = points[i];
                const angleA = point.minus(a._center).angle;
                const angleB = point.minus(b._center).angle;
                if (a.containsAngle(angleA) && b.containsAngle(angleB)) {
                    results.push(new SegmentIntersection(point, a.tAtAngle(angleA), b.tAtAngle(angleB)));
                }
            }
        }
        return results;
    }
    /**
   * Creates an Arc (or if straight enough a Line) segment that goes from the startPoint to the endPoint, touching
   * the middlePoint somewhere between the two.
   */ static createFromPoints(startPoint, middlePoint, endPoint) {
        const center = Utils.circleCenterFromPoints(startPoint, middlePoint, endPoint);
        // Close enough
        if (center === null) {
            return new Line(startPoint, endPoint);
        } else {
            const startDiff = startPoint.minus(center);
            const middleDiff = middlePoint.minus(center);
            const endDiff = endPoint.minus(center);
            const startAngle = startDiff.angle;
            const middleAngle = middleDiff.angle;
            const endAngle = endDiff.angle;
            const radius = (startDiff.magnitude + middleDiff.magnitude + endDiff.magnitude) / 3;
            // Try anticlockwise first. TODO: Don't require creation of extra Arcs https://github.com/phetsims/kite/issues/76
            const arc = new Arc(center, radius, startAngle, endAngle, false);
            if (arc.containsAngle(middleAngle)) {
                return arc;
            } else {
                return new Arc(center, radius, startAngle, endAngle, true);
            }
        }
    }
    /**
   * If the startAngle/endAngle difference is ~2pi, this will be a full circle
   *
   * See http://www.w3.org/TR/2dcontext/#dom-context-2d-arc for detailed information on the parameters.
   *
   * @param center - Center of the arc (every point on the arc is equally far from the center)
   * @param radius - How far from the center the arc will be
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param anticlockwise - Decides which direction the arc takes around the center
   */ constructor(center, radius, startAngle, endAngle, anticlockwise){
        super();
        this._center = center;
        this._radius = radius;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;
        this.invalidate();
    }
};
export { Arc as default };
kite.register('Arc', Arc);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvQXJjLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgY2lyY3VsYXIgYXJjIChhIGNvbnRpbnVvdXMgc3ViLXBhcnQgb2YgYSBjaXJjbGUpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgUmF5MiBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmF5Mi5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IEVsbGlwdGljYWxBcmMsIGtpdGUsIExpbmUsIE92ZXJsYXAsIFJheUludGVyc2VjdGlvbiwgU2VnbWVudCwgU2VnbWVudEludGVyc2VjdGlvbiwgc3ZnTnVtYmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFRPRE86IFNlZSBpZiB3ZSBzaG91bGQgdXNlIHRoaXMgbW9yZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbmNvbnN0IFRXT19QSSA9IE1hdGguUEkgKiAyO1xuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkQXJjID0ge1xuICB0eXBlOiAnQXJjJztcbiAgY2VudGVyWDogbnVtYmVyO1xuICBjZW50ZXJZOiBudW1iZXI7XG4gIHJhZGl1czogbnVtYmVyO1xuICBzdGFydEFuZ2xlOiBudW1iZXI7XG4gIGVuZEFuZ2xlOiBudW1iZXI7XG4gIGFudGljbG9ja3dpc2U6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmMgZXh0ZW5kcyBTZWdtZW50IHtcblxuICBwcml2YXRlIF9jZW50ZXI6IFZlY3RvcjI7XG4gIHByaXZhdGUgX3JhZGl1czogbnVtYmVyO1xuICBwcml2YXRlIF9zdGFydEFuZ2xlOiBudW1iZXI7XG4gIHByaXZhdGUgX2VuZEFuZ2xlOiBudW1iZXI7XG4gIHByaXZhdGUgX2FudGljbG9ja3dpc2U6IGJvb2xlYW47XG5cbiAgLy8gTGF6aWx5LWNvbXB1dGVkIGRlcml2ZWQgaW5mb3JtYXRpb25cbiAgcHJpdmF0ZSBfc3RhcnQhOiBWZWN0b3IyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfZW5kITogVmVjdG9yMiB8IG51bGw7XG4gIHByaXZhdGUgX3N0YXJ0VGFuZ2VudCE6IFZlY3RvcjIgfCBudWxsO1xuICBwcml2YXRlIF9lbmRUYW5nZW50ITogVmVjdG9yMiB8IG51bGw7XG4gIHByaXZhdGUgX2FjdHVhbEVuZEFuZ2xlITogbnVtYmVyIHwgbnVsbDsgLy8gRW5kIGFuZ2xlIGluIHJlbGF0aW9uIHRvIG91ciBzdGFydCBhbmdsZSAoY2FuIGdldCByZW1hcHBlZClcbiAgcHJpdmF0ZSBfaXNGdWxsUGVyaW1ldGVyITogYm9vbGVhbiB8IG51bGw7IC8vIFdoZXRoZXIgaXQncyBhIGZ1bGwgY2lyY2xlIChhbmQgbm90IGp1c3QgYW4gYXJjKVxuICBwcml2YXRlIF9hbmdsZURpZmZlcmVuY2UhOiBudW1iZXIgfCBudWxsO1xuICBwcml2YXRlIF9ib3VuZHMhOiBCb3VuZHMyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfc3ZnUGF0aEZyYWdtZW50ITogc3RyaW5nIHwgbnVsbDtcblxuICAvKipcbiAgICogSWYgdGhlIHN0YXJ0QW5nbGUvZW5kQW5nbGUgZGlmZmVyZW5jZSBpcyB+MnBpLCB0aGlzIHdpbGwgYmUgYSBmdWxsIGNpcmNsZVxuICAgKlxuICAgKiBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvMmRjb250ZXh0LyNkb20tY29udGV4dC0yZC1hcmMgZm9yIGRldGFpbGVkIGluZm9ybWF0aW9uIG9uIHRoZSBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gY2VudGVyIC0gQ2VudGVyIG9mIHRoZSBhcmMgKGV2ZXJ5IHBvaW50IG9uIHRoZSBhcmMgaXMgZXF1YWxseSBmYXIgZnJvbSB0aGUgY2VudGVyKVxuICAgKiBAcGFyYW0gcmFkaXVzIC0gSG93IGZhciBmcm9tIHRoZSBjZW50ZXIgdGhlIGFyYyB3aWxsIGJlXG4gICAqIEBwYXJhbSBzdGFydEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBzdGFydCBvZiB0aGUgYXJjXG4gICAqIEBwYXJhbSBlbmRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgZW5kIG9mIHRoZSBhcmNcbiAgICogQHBhcmFtIGFudGljbG9ja3dpc2UgLSBEZWNpZGVzIHdoaWNoIGRpcmVjdGlvbiB0aGUgYXJjIHRha2VzIGFyb3VuZCB0aGUgY2VudGVyXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGNlbnRlcjogVmVjdG9yMiwgcmFkaXVzOiBudW1iZXIsIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZTogYm9vbGVhbiApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fY2VudGVyID0gY2VudGVyO1xuICAgIHRoaXMuX3JhZGl1cyA9IHJhZGl1cztcbiAgICB0aGlzLl9zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICB0aGlzLl9lbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgIHRoaXMuX2FudGljbG9ja3dpc2UgPSBhbnRpY2xvY2t3aXNlO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBBcmMuXG4gICAqL1xuICBwdWJsaWMgc2V0Q2VudGVyKCBjZW50ZXI6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VudGVyLmlzRmluaXRlKCksIGBBcmMgY2VudGVyIHNob3VsZCBiZSBmaW5pdGU6ICR7Y2VudGVyLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgaWYgKCAhdGhpcy5fY2VudGVyLmVxdWFscyggY2VudGVyICkgKSB7XG4gICAgICB0aGlzLl9jZW50ZXIgPSBjZW50ZXI7XG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IGNlbnRlciggdmFsdWU6IFZlY3RvcjIgKSB7IHRoaXMuc2V0Q2VudGVyKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBjZW50ZXIoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldENlbnRlcigpOyB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2VudGVyIG9mIHRoaXMgQXJjLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fY2VudGVyO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgcmFkaXVzIG9mIHRoZSBBcmMuXG4gICAqL1xuICBwdWJsaWMgc2V0UmFkaXVzKCByYWRpdXM6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzICksIGBBcmMgcmFkaXVzIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7cmFkaXVzfWAgKTtcblxuICAgIGlmICggdGhpcy5fcmFkaXVzICE9PSByYWRpdXMgKSB7XG4gICAgICB0aGlzLl9yYWRpdXMgPSByYWRpdXM7XG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IHJhZGl1cyggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSYWRpdXMoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJhZGl1cygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRSYWRpdXMoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJhZGl1cyBvZiB0aGlzIEFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRSYWRpdXMoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcmFkaXVzO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgc3RhcnRBbmdsZSBvZiB0aGUgQXJjLlxuICAgKi9cbiAgcHVibGljIHNldFN0YXJ0QW5nbGUoIHN0YXJ0QW5nbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZSApLCBgQXJjIHN0YXJ0QW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHtzdGFydEFuZ2xlfWAgKTtcblxuICAgIGlmICggdGhpcy5fc3RhcnRBbmdsZSAhPT0gc3RhcnRBbmdsZSApIHtcbiAgICAgIHRoaXMuX3N0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCBzdGFydEFuZ2xlKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFN0YXJ0QW5nbGUoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0QW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnRBbmdsZSgpOyB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RhcnRBbmdsZSBvZiB0aGlzIEFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydEFuZ2xlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0QW5nbGU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBlbmRBbmdsZSBvZiB0aGUgQXJjLlxuICAgKi9cbiAgcHVibGljIHNldEVuZEFuZ2xlKCBlbmRBbmdsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBlbmRBbmdsZSApLCBgQXJjIGVuZEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7ZW5kQW5nbGV9YCApO1xuXG4gICAgaWYgKCB0aGlzLl9lbmRBbmdsZSAhPT0gZW5kQW5nbGUgKSB7XG4gICAgICB0aGlzLl9lbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCBlbmRBbmdsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRFbmRBbmdsZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgZW5kQW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0RW5kQW5nbGUoKTsgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVuZEFuZ2xlIG9mIHRoaXMgQXJjLlxuICAgKi9cbiAgcHVibGljIGdldEVuZEFuZ2xlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZEFuZ2xlO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgYW50aWNsb2Nrd2lzZSBvZiB0aGUgQXJjLlxuICAgKi9cbiAgcHVibGljIHNldEFudGljbG9ja3dpc2UoIGFudGljbG9ja3dpc2U6IGJvb2xlYW4gKTogdGhpcyB7XG5cbiAgICBpZiAoIHRoaXMuX2FudGljbG9ja3dpc2UgIT09IGFudGljbG9ja3dpc2UgKSB7XG4gICAgICB0aGlzLl9hbnRpY2xvY2t3aXNlID0gYW50aWNsb2Nrd2lzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYW50aWNsb2Nrd2lzZSggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0QW50aWNsb2Nrd2lzZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgYW50aWNsb2Nrd2lzZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0QW50aWNsb2Nrd2lzZSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFudGljbG9ja3dpc2Ugb2YgdGhpcyBBcmMuXG4gICAqL1xuICBwdWJsaWMgZ2V0QW50aWNsb2Nrd2lzZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYW50aWNsb2Nrd2lzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIHBhcmFtZXRyaWNhbGx5LCB3aXRoIDAgPD0gdCA8PSAxLlxuICAgKlxuICAgKiBOT1RFOiBwb3NpdGlvbkF0KCAwICkgd2lsbCByZXR1cm4gdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgcG9zaXRpb25BdCggMSApIHdpbGwgcmV0dXJuIHRoZSBlbmQgb2YgdGhlXG4gICAqIHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHBvc2l0aW9uQXQoIHQ6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdwb3NpdGlvbkF0IHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdwb3NpdGlvbkF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25BdEFuZ2xlKCB0aGlzLmFuZ2xlQXQoIHQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXG4gICAqXG4gICAqIE5PVEU6IHRhbmdlbnRBdCggMCApIHdpbGwgcmV0dXJuIHRoZSB0YW5nZW50IGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHRhbmdlbnRBdCggMSApIHdpbGwgcmV0dXJuIHRoZVxuICAgKiB0YW5nZW50IGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHRhbmdlbnRBdCggdDogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgJ3RhbmdlbnRBdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAndGFuZ2VudEF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgcmV0dXJuIHRoaXMudGFuZ2VudEF0QW5nbGUoIHRoaXMuYW5nbGVBdCggdCApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2lnbmVkIGN1cnZhdHVyZSBvZiB0aGUgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSB0LCB3aGVyZSAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogVGhlIGN1cnZhdHVyZSB3aWxsIGJlIHBvc2l0aXZlIGZvciB2aXN1YWwgY2xvY2t3aXNlIC8gbWF0aGVtYXRpY2FsIGNvdW50ZXJjbG9ja3dpc2UgY3VydmVzLCBuZWdhdGl2ZSBmb3Igb3Bwb3NpdGVcbiAgICogY3VydmF0dXJlLCBhbmQgMCBmb3Igbm8gY3VydmF0dXJlLlxuICAgKlxuICAgKiBOT1RFOiBjdXJ2YXR1cmVBdCggMCApIHdpbGwgcmV0dXJuIHRoZSBjdXJ2YXR1cmUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgY3VydmF0dXJlQXQoIDEgKSB3aWxsIHJldHVyblxuICAgKiB0aGUgY3VydmF0dXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNlZ21lbnQuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHBhcnQgb2YgdGhlIFNlZ21lbnQgQVBJLiBTZWUgU2VnbWVudC5qcydzIGNvbnN0cnVjdG9yIGZvciBtb3JlIEFQSSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIGN1cnZhdHVyZUF0KCB0OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdjdXJ2YXR1cmVBdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm8gZ3JlYXRlciB0aGFuIDEnICk7XG5cbiAgICAvLyBTaW5jZSBpdCBpcyBhbiBhcmMgb2YgYXMgY2lyY2xlLCB0aGUgY3VydmF0dXJlIGlzIGluZGVwZW5kZW50IG9mIHRcbiAgICByZXR1cm4gKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gLTEgOiAxICkgLyB0aGlzLl9yYWRpdXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSB3aXRoIHVwIHRvIDIgc3ViLXNlZ21lbnRzLCBzcGxpdCBhdCB0aGUgcGFyYW1ldHJpYyB0IHZhbHVlLiBUb2dldGhlciAoaW4gb3JkZXIpIHRoZXkgc2hvdWxkIG1ha2VcbiAgICogdXAgdGhlIHNhbWUgc2hhcGUgYXMgdGhlIGN1cnJlbnQgc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3ViZGl2aWRlZCggdDogbnVtYmVyICk6IEFyY1tdIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0IDw9IDEsICdzdWJkaXZpZGVkIHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgLy8gSWYgdCBpcyAwIG9yIDEsIHdlIG9ubHkgbmVlZCB0byByZXR1cm4gMSBzZWdtZW50XG4gICAgaWYgKCB0ID09PSAwIHx8IHQgPT09IDEgKSB7XG4gICAgICByZXR1cm4gWyB0aGlzIF07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogdmVyaWZ5IHRoYXQgd2UgZG9uJ3QgbmVlZCB0byBzd2l0Y2ggYW50aWNsb2Nrd2lzZSBoZXJlLCBvciBzdWJ0cmFjdCAycGkgb2ZmIGFueSBhbmdsZXMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3QgYW5nbGUwID0gdGhpcy5hbmdsZUF0KCAwICk7XG4gICAgY29uc3QgYW5nbGVUID0gdGhpcy5hbmdsZUF0KCB0ICk7XG4gICAgY29uc3QgYW5nbGUxID0gdGhpcy5hbmdsZUF0KCAxICk7XG4gICAgcmV0dXJuIFtcbiAgICAgIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzLCBhbmdsZTAsIGFuZ2xlVCwgdGhpcy5fYW50aWNsb2Nrd2lzZSApLFxuICAgICAgbmV3IEFyYyggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXMsIGFuZ2xlVCwgYW5nbGUxLCB0aGlzLl9hbnRpY2xvY2t3aXNlIClcbiAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBjYWNoZWQgaW5mb3JtYXRpb24sIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhbnkgb2YgdGhlICdjb25zdHJ1Y3RvciBhcmd1bWVudHMnIGFyZSBtdXRhdGVkLlxuICAgKi9cbiAgcHVibGljIGludmFsaWRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fc3RhcnQgPSBudWxsO1xuICAgIHRoaXMuX2VuZCA9IG51bGw7XG4gICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl9lbmRUYW5nZW50ID0gbnVsbDtcbiAgICB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9IG51bGw7XG4gICAgdGhpcy5faXNGdWxsUGVyaW1ldGVyID0gbnVsbDtcbiAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPSBudWxsO1xuICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XG4gICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gbnVsbDtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2NlbnRlciBpbnN0YW5jZW9mIFZlY3RvcjIsICdBcmMgY2VudGVyIHNob3VsZCBiZSBhIFZlY3RvcjInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2VudGVyLmlzRmluaXRlKCksICdBcmMgY2VudGVyIHNob3VsZCBiZSBmaW5pdGUgKG5vdCBOYU4gb3IgaW5maW5pdGUpJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9yYWRpdXMgPT09ICdudW1iZXInLCBgQXJjIHJhZGl1cyBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5fcmFkaXVzfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fcmFkaXVzICksIGBBcmMgcmFkaXVzIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5fcmFkaXVzfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fc3RhcnRBbmdsZSA9PT0gJ251bWJlcicsIGBBcmMgc3RhcnRBbmdsZSBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5fc3RhcnRBbmdsZX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3N0YXJ0QW5nbGUgKSwgYEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5fc3RhcnRBbmdsZX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX2VuZEFuZ2xlID09PSAnbnVtYmVyJywgYEFyYyBlbmRBbmdsZSBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5fZW5kQW5nbGV9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9lbmRBbmdsZSApLCBgQXJjIGVuZEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5fZW5kQW5nbGV9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9hbnRpY2xvY2t3aXNlID09PSAnYm9vbGVhbicsIGBBcmMgYW50aWNsb2Nrd2lzZSBzaG91bGQgYmUgYSBib29sZWFuOiAke3RoaXMuX2FudGljbG9ja3dpc2V9YCApO1xuXG4gICAgLy8gUmVtYXAgbmVnYXRpdmUgcmFkaXVzIHRvIGEgcG9zaXRpdmUgcmFkaXVzXG4gICAgaWYgKCB0aGlzLl9yYWRpdXMgPCAwICkge1xuICAgICAgLy8gc3VwcG9ydCB0aGlzIGNhc2Ugc2luY2Ugd2UgbWlnaHQgYWN0dWFsbHkgbmVlZCB0byBoYW5kbGUgaXQgaW5zaWRlIG9mIHN0cm9rZXM/XG4gICAgICB0aGlzLl9yYWRpdXMgPSAtdGhpcy5fcmFkaXVzO1xuICAgICAgdGhpcy5fc3RhcnRBbmdsZSArPSBNYXRoLlBJO1xuICAgICAgdGhpcy5fZW5kQW5nbGUgKz0gTWF0aC5QSTtcbiAgICB9XG5cbiAgICAvLyBDb25zdHJhaW50cyB0aGF0IHNob3VsZCBhbHdheXMgYmUgc2F0aXNmaWVkXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggKCAhdGhpcy5hbnRpY2xvY2t3aXNlICYmIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSA8PSAtTWF0aC5QSSAqIDIgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5hbnRpY2xvY2t3aXNlICYmIHRoaXMuX3N0YXJ0QW5nbGUgLSB0aGlzLl9lbmRBbmdsZSA8PSAtTWF0aC5QSSAqIDIgKSApLFxuICAgICAgJ05vdCBoYW5kbGluZyBhcmNzIHdpdGggc3RhcnQvZW5kIGFuZ2xlcyB0aGF0IHNob3cgZGlmZmVyZW5jZXMgaW4tYmV0d2VlbiBicm93c2VyIGhhbmRsaW5nJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICEoICggIXRoaXMuYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUgPiBNYXRoLlBJICogMiApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmFudGljbG9ja3dpc2UgJiYgdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlID4gTWF0aC5QSSAqIDIgKSApLFxuICAgICAgJ05vdCBoYW5kbGluZyBhcmNzIHdpdGggc3RhcnQvZW5kIGFuZ2xlcyB0aGF0IHNob3cgZGlmZmVyZW5jZXMgaW4tYmV0d2VlbiBicm93c2VyIGhhbmRsaW5nJyApO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRpb25FbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGlzIGFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydCgpOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX3N0YXJ0ID09PSBudWxsICkge1xuICAgICAgdGhpcy5fc3RhcnQgPSB0aGlzLnBvc2l0aW9uQXRBbmdsZSggdGhpcy5fc3RhcnRBbmdsZSApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3RhcnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRTdGFydCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGVuZCBwb3NpdGlvbiBvZiB0aGlzIGFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRFbmQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl9lbmQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9lbmQgPSB0aGlzLnBvc2l0aW9uQXRBbmdsZSggdGhpcy5fZW5kQW5nbGUgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VuZDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW5kKCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmQoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB1bml0IHZlY3RvciB0YW5nZW50IHRvIHRoaXMgYXJjIGF0IHRoZSBzdGFydCBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl9zdGFydFRhbmdlbnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9zdGFydFRhbmdlbnQgPSB0aGlzLnRhbmdlbnRBdEFuZ2xlKCB0aGlzLl9zdGFydEFuZ2xlICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGFydFRhbmdlbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUYW5nZW50KCk7IH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdW5pdCB2ZWN0b3IgdGFuZ2VudCB0byB0aGUgYXJjIGF0IHRoZSBlbmQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0RW5kVGFuZ2VudCgpOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX2VuZFRhbmdlbnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9lbmRUYW5nZW50ID0gdGhpcy50YW5nZW50QXRBbmdsZSggdGhpcy5fZW5kQW5nbGUgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VuZFRhbmdlbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGVuZFRhbmdlbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZFRhbmdlbnQoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBlbmQgYW5nbGUgaW4gcmFkaWFucy5cbiAgICovXG4gIHB1YmxpYyBnZXRBY3R1YWxFbmRBbmdsZSgpOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5fYWN0dWFsRW5kQW5nbGUgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9IEFyYy5jb21wdXRlQWN0dWFsRW5kQW5nbGUoIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9hbnRpY2xvY2t3aXNlICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hY3R1YWxFbmRBbmdsZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYWN0dWFsRW5kQW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiB2YWx1ZSB0aGF0IGluZGljYXRlcyBpZiB0aGUgYXJjIHdyYXBzIHVwIGJ5IG1vcmUgdGhhbiB0d28gUGkuXG4gICAqL1xuICBwdWJsaWMgZ2V0SXNGdWxsUGVyaW1ldGVyKCk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5faXNGdWxsUGVyaW1ldGVyID09PSBudWxsICkge1xuICAgICAgdGhpcy5faXNGdWxsUGVyaW1ldGVyID0gKCAhdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUgPj0gTWF0aC5QSSAqIDIgKSB8fCAoIHRoaXMuX2FudGljbG9ja3dpc2UgJiYgdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlID49IE1hdGguUEkgKiAyICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXI7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzRnVsbFBlcmltZXRlcigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0SXNGdWxsUGVyaW1ldGVyKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhbmdsZSBkaWZmZXJlbmNlIHRoYXQgcmVwcmVzZW50cyBob3cgXCJtdWNoXCIgb2YgdGhlIGNpcmNsZSBvdXIgYXJjIGNvdmVycy5cbiAgICpcbiAgICogVGhlIGFuc3dlciBpcyBhbHdheXMgZ3JlYXRlciBvciBlcXVhbCB0byB6ZXJvXG4gICAqIFRoZSBhbnN3ZXIgY2FuIGV4Y2VlZCB0d28gUGlcbiAgICovXG4gIHB1YmxpYyBnZXRBbmdsZURpZmZlcmVuY2UoKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA9PT0gbnVsbCApIHtcbiAgICAgIC8vIGNvbXB1dGUgYW4gYW5nbGUgZGlmZmVyZW5jZSB0aGF0IHJlcHJlc2VudHMgaG93IFwibXVjaFwiIG9mIHRoZSBjaXJjbGUgb3VyIGFyYyBjb3ZlcnNcbiAgICAgIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgOiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGU7XG4gICAgICBpZiAoIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA8IDAgKSB7XG4gICAgICAgIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSArPSBNYXRoLlBJICogMjtcbiAgICAgIH1cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZSA+PSAwICk7IC8vIG5vdyBpdCBzaG91bGQgYWx3YXlzIGJlIHplcm8gb3IgcG9zaXRpdmVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FuZ2xlRGlmZmVyZW5jZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYW5nbGVEaWZmZXJlbmNlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEFuZ2xlRGlmZmVyZW5jZSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIHNlZ21lbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xuICAgIGlmICggdGhpcy5fYm91bmRzID09PSBudWxsICkge1xuICAgICAgLy8gYWNjZWxlcmF0aW9uIGZvciBpbnRlcnNlY3Rpb25cbiAgICAgIHRoaXMuX2JvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCkud2l0aFBvaW50KCB0aGlzLmdldFN0YXJ0KCkgKVxuICAgICAgICAud2l0aFBvaW50KCB0aGlzLmdldEVuZCgpICk7XG5cbiAgICAgIC8vIGlmIHRoZSBhbmdsZXMgYXJlIGRpZmZlcmVudCwgY2hlY2sgZXh0cmVtYSBwb2ludHNcbiAgICAgIGlmICggdGhpcy5fc3RhcnRBbmdsZSAhPT0gdGhpcy5fZW5kQW5nbGUgKSB7XG4gICAgICAgIC8vIGNoZWNrIGFsbCBvZiB0aGUgZXh0cmVtYSBwb2ludHNcbiAgICAgICAgdGhpcy5pbmNsdWRlQm91bmRzQXRBbmdsZSggMCApO1xuICAgICAgICB0aGlzLmluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBNYXRoLlBJIC8gMiApO1xuICAgICAgICB0aGlzLmluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBNYXRoLlBJICk7XG4gICAgICAgIHRoaXMuaW5jbHVkZUJvdW5kc0F0QW5nbGUoIDMgKiBNYXRoLlBJIC8gMiApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmdldEJvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIG5vbi1kZWdlbmVyYXRlIHNlZ21lbnRzIHRoYXQgYXJlIGVxdWl2YWxlbnQgdG8gdGhpcyBzZWdtZW50LiBHZW5lcmFsbHkgZ2V0cyByaWQgKG9yIHNpbXBsaWZpZXMpXG4gICAqIGludmFsaWQgb3IgcmVwZWF0ZWQgc2VnbWVudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk6IEFyY1tdIHtcbiAgICBpZiAoIHRoaXMuX3JhZGl1cyA8PSAwIHx8IHRoaXMuX3N0YXJ0QW5nbGUgPT09IHRoaXMuX2VuZEFuZ2xlICkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbIHRoaXMgXTsgLy8gYmFzaWNhbGx5LCBBcmNzIGFyZW4ndCByZWFsbHkgZGVnZW5lcmF0ZSB0aGF0IGVhc2lseVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBleHBhbmQgdGhlIHByaXZhdGUgX2JvdW5kcyBib3VuZGluZyBib3ggdG8gaW5jbHVkZSBhIHBvaW50IGF0IGEgc3BlY2lmaWMgYW5nbGUsIG1ha2luZyBzdXJlIHRoYXRcbiAgICogYW5nbGUgaXMgYWN0dWFsbHkgaW5jbHVkZWQgaW4gdGhlIGFyYy4gVGhpcyB3aWxsIHByZXN1bWFibHkgYmUgY2FsbGVkIGF0IGFuZ2xlcyB0aGF0IGFyZSBhdCBjcml0aWNhbCBwb2ludHMsXG4gICAqIHdoZXJlIHRoZSBhcmMgc2hvdWxkIGhhdmUgbWF4aW11bS9taW5pbXVtIHgveSB2YWx1ZXMuXG4gICAqL1xuICBwcml2YXRlIGluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5jb250YWluc0FuZ2xlKCBhbmdsZSApICkge1xuICAgICAgLy8gdGhlIGJvdW5kYXJ5IHBvaW50IGlzIGluIHRoZSBhcmNcbiAgICAgIHRoaXMuX2JvdW5kcyA9IHRoaXMuX2JvdW5kcyEud2l0aFBvaW50KCB0aGlzLl9jZW50ZXIucGx1cyggVmVjdG9yMi5jcmVhdGVQb2xhciggdGhpcy5fcmFkaXVzLCBhbmdsZSApICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIGNvbnRhaW5lZCBhbmdsZSB0byBiZXR3ZWVuIFtzdGFydEFuZ2xlLGFjdHVhbEVuZEFuZ2xlKSwgZXZlbiBpZiB0aGUgZW5kIGFuZ2xlIGlzIGxvd2VyLlxuICAgKi9cbiAgcHVibGljIG1hcEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgaWYgKCBNYXRoLmFicyggVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSwgLU1hdGguUEksIE1hdGguUEkgKSApIDwgMWUtOCApIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGFydEFuZ2xlO1xuICAgIH1cbiAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYW5nbGUgLSB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCksIC1NYXRoLlBJLCBNYXRoLlBJICkgKSA8IDFlLTggKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBY3R1YWxFbmRBbmdsZSgpO1xuICAgIH1cbiAgICAvLyBjb25zaWRlciBhbiBhc3NlcnQgdGhhdCB3ZSBjb250YWluIHRoYXQgYW5nbGU/XG4gICAgcmV0dXJuICggdGhpcy5fc3RhcnRBbmdsZSA+IHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKSApID9cbiAgICAgICAgICAgVXRpbHMubW9kdWxvQmV0d2VlblVwKCBhbmdsZSwgdGhpcy5fc3RhcnRBbmdsZSAtIDIgKiBNYXRoLlBJLCB0aGlzLl9zdGFydEFuZ2xlICkgOlxuICAgICAgICAgICBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUgKyAyICogTWF0aC5QSSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBhcmFtZXRyaXplZCB2YWx1ZSB0IGZvciBhIGdpdmVuIGFuZ2xlLiBUaGUgdmFsdWUgdCBzaG91bGQgcmFuZ2UgZnJvbSAwIHRvIDEgKGluY2x1c2l2ZSkuXG4gICAqL1xuICBwdWJsaWMgdEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBjb25zdCB0ID0gKCB0aGlzLm1hcEFuZ2xlKCBhbmdsZSApIC0gdGhpcy5fc3RhcnRBbmdsZSApIC8gKCB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgLSB0aGlzLl9zdGFydEFuZ2xlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAgJiYgdCA8PSAxLCBgdEF0QW5nbGUgb3V0IG9mIHJhbmdlOiAke3R9YCApO1xuXG4gICAgcmV0dXJuIHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW5nbGUgZm9yIHRoZSBwYXJhbWV0cml6ZWQgdCB2YWx1ZS4gVGhlIHQgdmFsdWUgc2hvdWxkIHJhbmdlIGZyb20gMCB0byAxIChpbmNsdXNpdmUpLlxuICAgKi9cbiAgcHVibGljIGFuZ2xlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIC8vVE9ETzogYWRkIGFzc2VydHMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0QW5nbGUgKyAoIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKSAtIHRoaXMuX3N0YXJ0QW5nbGUgKSAqIHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhpcyBhcmMgYXQgYW5nbGUuXG4gICAqL1xuICBwdWJsaWMgcG9zaXRpb25BdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl9jZW50ZXIucGx1cyggVmVjdG9yMi5jcmVhdGVQb2xhciggdGhpcy5fcmFkaXVzLCBhbmdsZSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCB0YW5nZW50IG9mIHRoaXMgYXJjLlxuICAgKiBUaGUgdGFuZ2VudCBwb2ludHMgb3V0d2FyZCAoaW53YXJkKSBvZiB0aGlzIGFyYyBmb3IgY2xvY2t3aXNlIChhbnRpY2xvY2t3aXNlKSBkaXJlY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgdGFuZ2VudEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgY29uc3Qgbm9ybWFsID0gVmVjdG9yMi5jcmVhdGVQb2xhciggMSwgYW5nbGUgKTtcblxuICAgIHJldHVybiB0aGlzLl9hbnRpY2xvY2t3aXNlID8gbm9ybWFsLnBlcnBlbmRpY3VsYXIgOiBub3JtYWwucGVycGVuZGljdWxhci5uZWdhdGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBhbmdsZSBpcyBjb250YWluZWQgYnkgdGhlIGFyYyAod2hldGhlciBhIHJheSBmcm9tIHRoZSBhcmMncyBvcmlnaW4gZ29pbmcgaW4gdGhhdCBhbmdsZVxuICAgKiB3aWxsIGludGVyc2VjdCB0aGUgYXJjKS5cbiAgICovXG4gIHB1YmxpYyBjb250YWluc0FuZ2xlKCBhbmdsZTogbnVtYmVyICk6IGJvb2xlYW4ge1xuICAgIC8vIHRyYW5zZm9ybSB0aGUgYW5nbGUgaW50byB0aGUgYXBwcm9wcmlhdGUgY29vcmRpbmF0ZSBmb3JtXG4gICAgLy8gVE9ETzogY2hlY2sgYW50aWNsb2Nrd2lzZSB2ZXJzaW9uISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBjb25zdCBub3JtYWxpemVkQW5nbGUgPSB0aGlzLl9hbnRpY2xvY2t3aXNlID8gYW5nbGUgLSB0aGlzLl9lbmRBbmdsZSA6IGFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZTtcblxuICAgIC8vIGdldCB0aGUgYW5nbGUgYmV0d2VlbiAwIGFuZCAycGlcbiAgICBjb25zdCBwb3NpdGl2ZU1pbkFuZ2xlID0gVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIG5vcm1hbGl6ZWRBbmdsZSwgMCwgTWF0aC5QSSAqIDIgKTtcblxuICAgIHJldHVybiBwb3NpdGl2ZU1pbkFuZ2xlIDw9IHRoaXMuYW5nbGVEaWZmZXJlbmNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgY29udGFpbmluZyB0aGUgU1ZHIHBhdGguIGFzc3VtZXMgdGhhdCB0aGUgc3RhcnQgcG9pbnQgaXMgYWxyZWFkeSBwcm92aWRlZCxcbiAgICogc28gYW55dGhpbmcgdGhhdCBjYWxscyB0aGlzIG5lZWRzIHRvIHB1dCB0aGUgTSBjYWxscyBmaXJzdFxuICAgKi9cbiAgcHVibGljIGdldFNWR1BhdGhGcmFnbWVudCgpOiBzdHJpbmcge1xuICAgIGxldCBvbGRQYXRoRnJhZ21lbnQ7XG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBvbGRQYXRoRnJhZ21lbnQgPSB0aGlzLl9zdmdQYXRoRnJhZ21lbnQ7XG4gICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoICF0aGlzLl9zdmdQYXRoRnJhZ21lbnQgKSB7XG4gICAgICAvLyBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3BhdGhzLmh0bWwjUGF0aERhdGFFbGxpcHRpY2FsQXJjQ29tbWFuZHMgZm9yIG1vcmUgaW5mb1xuICAgICAgLy8gcnggcnkgeC1heGlzLXJvdGF0aW9uIGxhcmdlLWFyYy1mbGFnIHN3ZWVwLWZsYWcgeCB5XG5cbiAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAxOyAvLyBhbGxvdyBzb21lIGxlZXdheSB0byByZW5kZXIgdGhpbmdzIGFzICdhbG1vc3QgY2lyY2xlcydcbiAgICAgIGNvbnN0IHN3ZWVwRmxhZyA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyAnMCcgOiAnMSc7XG4gICAgICBsZXQgbGFyZ2VBcmNGbGFnO1xuICAgICAgaWYgKCB0aGlzLmFuZ2xlRGlmZmVyZW5jZSA8IE1hdGguUEkgKiAyIC0gZXBzaWxvbiApIHtcbiAgICAgICAgbGFyZ2VBcmNGbGFnID0gdGhpcy5hbmdsZURpZmZlcmVuY2UgPCBNYXRoLlBJID8gJzAnIDogJzEnO1xuICAgICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBgQSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gMCAke2xhcmdlQXJjRmxhZ1xuICAgICAgICB9ICR7c3dlZXBGbGFnfSAke3N2Z051bWJlciggdGhpcy5lbmQueCApfSAke3N2Z051bWJlciggdGhpcy5lbmQueSApfWA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gY2lyY2xlIChvciBhbG1vc3QtY2lyY2xlKSBjYXNlIG5lZWRzIHRvIGJlIGhhbmRsZWQgZGlmZmVyZW50bHlcbiAgICAgICAgLy8gc2luY2UgU1ZHIHdpbGwgbm90IGJlIGFibGUgdG8gZHJhdyAob3Iga25vdyBob3cgdG8gZHJhdykgdGhlIGNvcnJlY3QgY2lyY2xlIGlmIHdlIGp1c3QgaGF2ZSBhIHN0YXJ0IGFuZCBlbmQsIHdlIG5lZWQgdG8gc3BsaXQgaXQgaW50byB0d28gY2lyY3VsYXIgYXJjc1xuXG4gICAgICAgIC8vIGdldCB0aGUgYW5nbGUgdGhhdCBpcyBiZXR3ZWVuIGFuZCBvcHBvc2l0ZSBvZiBib3RoIG9mIHRoZSBwb2ludHNcbiAgICAgICAgY29uc3Qgc3BsaXRPcHBvc2l0ZUFuZ2xlID0gKCB0aGlzLl9zdGFydEFuZ2xlICsgdGhpcy5fZW5kQW5nbGUgKSAvIDI7IC8vIHRoaXMgX3Nob3VsZF8gd29yayBmb3IgdGhlIG1vZHVsYXIgY2FzZT9cbiAgICAgICAgY29uc3Qgc3BsaXRQb2ludCA9IHRoaXMuX2NlbnRlci5wbHVzKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXMsIHNwbGl0T3Bwb3NpdGVBbmdsZSApICk7XG5cbiAgICAgICAgbGFyZ2VBcmNGbGFnID0gJzAnOyAvLyBzaW5jZSB3ZSBzcGxpdCBpdCBpbiAyLCBpdCdzIGFsd2F5cyB0aGUgc21hbGwgYXJjXG5cbiAgICAgICAgY29uc3QgZmlyc3RBcmMgPSBgQSAke3N2Z051bWJlciggdGhpcy5fcmFkaXVzICl9ICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gMCAke1xuICAgICAgICAgIGxhcmdlQXJjRmxhZ30gJHtzd2VlcEZsYWd9ICR7c3ZnTnVtYmVyKCBzcGxpdFBvaW50LnggKX0gJHtzdmdOdW1iZXIoIHNwbGl0UG9pbnQueSApfWA7XG4gICAgICAgIGNvbnN0IHNlY29uZEFyYyA9IGBBICR7c3ZnTnVtYmVyKCB0aGlzLl9yYWRpdXMgKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1cyApfSAwICR7XG4gICAgICAgICAgbGFyZ2VBcmNGbGFnfSAke3N3ZWVwRmxhZ30gJHtzdmdOdW1iZXIoIHRoaXMuZW5kLnggKX0gJHtzdmdOdW1iZXIoIHRoaXMuZW5kLnkgKX1gO1xuXG4gICAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IGAke2ZpcnN0QXJjfSAke3NlY29uZEFyY31gO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGlmICggb2xkUGF0aEZyYWdtZW50ICkge1xuICAgICAgICBhc3NlcnQoIG9sZFBhdGhGcmFnbWVudCA9PT0gdGhpcy5fc3ZnUGF0aEZyYWdtZW50LCAnUXVhZHJhdGljIGxpbmUgc2VnbWVudCBjaGFuZ2VkIHdpdGhvdXQgaW52YWxpZGF0ZSgpJyApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3ZnUGF0aEZyYWdtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgYXJjcyB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgb24gdGhlIGxvZ2ljYWwgbGVmdCBzaWRlXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogQXJjW10ge1xuICAgIHJldHVybiBbIG5ldyBBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzICsgKCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gMSA6IC0xICkgKiBsaW5lV2lkdGggLyAyLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhcmNzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBjdXJ2ZSBvbiB0aGUgbG9naWNhbCByaWdodCBzaWRlXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlUmlnaHQoIGxpbmVXaWR0aDogbnVtYmVyICk6IEFyY1tdIHtcbiAgICByZXR1cm4gWyBuZXcgQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1cyArICggdGhpcy5fYW50aWNsb2Nrd2lzZSA/IC0xIDogMSApICogbGluZVdpZHRoIC8gMiwgdGhpcy5fZW5kQW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUsICF0aGlzLl9hbnRpY2xvY2t3aXNlICkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiB0IHZhbHVlcyB3aGVyZSBkeC9kdCBvciBkeS9kdCBpcyAwIHdoZXJlIDAgPCB0IDwgMS4gc3ViZGl2aWRpbmcgb24gdGhlc2Ugd2lsbCByZXN1bHQgaW4gbW9ub3RvbmljIHNlZ21lbnRzXG4gICAqIERvZXMgbm90IGluY2x1ZGUgdD0wIGFuZCB0PTFcbiAgICovXG4gIHB1YmxpYyBnZXRJbnRlcmlvckV4dHJlbWFUcygpOiBudW1iZXJbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xuICAgIF8uZWFjaCggWyAwLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSwgMyAqIE1hdGguUEkgLyAyIF0sIGFuZ2xlID0+IHtcbiAgICAgIGlmICggdGhpcy5jb250YWluc0FuZ2xlKCBhbmdsZSApICkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy50QXRBbmdsZSggYW5nbGUgKTtcbiAgICAgICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMDAwMTsgLy8gVE9ETzogZ2VuZXJhbCBraXRlIGVwc2lsb24/LCBhbHNvIGRvIDFlLU51bWJlciBmb3JtYXQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICAgIGlmICggdCA+IGVwc2lsb24gJiYgdCA8IDEgLSBlcHNpbG9uICkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKCB0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmV0dXJuIHJlc3VsdC5zb3J0KCk7IC8vIG1vZGlmaWVzIG9yaWdpbmFsLCB3aGljaCBpcyBPS1xuICB9XG5cbiAgLyoqXG4gICAqIEhpdC10ZXN0cyB0aGlzIHNlZ21lbnQgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzZWdtZW50IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEZvciBkZXRhaWxzLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gaW4gU2VnbWVudC5qc1xuICAgKi9cbiAgcHVibGljIGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdIHtcbiAgICBjb25zdCByZXN1bHQ6IFJheUludGVyc2VjdGlvbltdID0gW107IC8vIGhpdHMgaW4gb3JkZXJcblxuICAgIC8vIGxlZnQgaGVyZSwgaWYgaW4gdGhlIGZ1dHVyZSB3ZSB3YW50IHRvIGJldHRlci1oYW5kbGUgYm91bmRhcnkgcG9pbnRzXG4gICAgY29uc3QgZXBzaWxvbiA9IDA7XG5cbiAgICAvLyBSdW4gYSBnZW5lcmFsIGNpcmNsZS1pbnRlcnNlY3Rpb24gcm91dGluZSwgdGhlbiB3ZSBjYW4gdGVzdCB0aGUgYW5nbGVzIGxhdGVyLlxuICAgIC8vIFNvbHZlcyBmb3IgdGhlIHR3byBzb2x1dGlvbnMgdCBzdWNoIHRoYXQgcmF5LnBvc2l0aW9uICsgcmF5LmRpcmVjdGlvbiAqIHQgaXMgb24gdGhlIGNpcmNsZS5cbiAgICAvLyBUaGVuIHdlIGNoZWNrIHdoZXRoZXIgdGhlIGFuZ2xlIGF0IGVhY2ggcG9zc2libGUgaGl0IHBvaW50IGlzIGluIG91ciBhcmMuXG4gICAgY29uc3QgY2VudGVyVG9SYXkgPSByYXkucG9zaXRpb24ubWludXMoIHRoaXMuX2NlbnRlciApO1xuICAgIGNvbnN0IHRtcCA9IHJheS5kaXJlY3Rpb24uZG90KCBjZW50ZXJUb1JheSApO1xuICAgIGNvbnN0IGNlbnRlclRvUmF5RGlzdFNxID0gY2VudGVyVG9SYXkubWFnbml0dWRlU3F1YXJlZDtcbiAgICBjb25zdCBkaXNjcmltaW5hbnQgPSA0ICogdG1wICogdG1wIC0gNCAqICggY2VudGVyVG9SYXlEaXN0U3EgLSB0aGlzLl9yYWRpdXMgKiB0aGlzLl9yYWRpdXMgKTtcbiAgICBpZiAoIGRpc2NyaW1pbmFudCA8IGVwc2lsb24gKSB7XG4gICAgICAvLyByYXkgbWlzc2VzIGNpcmNsZSBlbnRpcmVseVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgYmFzZSA9IHJheS5kaXJlY3Rpb24uZG90KCB0aGlzLl9jZW50ZXIgKSAtIHJheS5kaXJlY3Rpb24uZG90KCByYXkucG9zaXRpb24gKTtcbiAgICBjb25zdCBzcXQgPSBNYXRoLnNxcnQoIGRpc2NyaW1pbmFudCApIC8gMjtcbiAgICBjb25zdCB0YSA9IGJhc2UgLSBzcXQ7XG4gICAgY29uc3QgdGIgPSBiYXNlICsgc3F0O1xuXG4gICAgaWYgKCB0YiA8IGVwc2lsb24gKSB7XG4gICAgICAvLyBjaXJjbGUgaXMgYmVoaW5kIHJheVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBjb25zdCBwb2ludEIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xuICAgIGNvbnN0IG5vcm1hbEIgPSBwb2ludEIubWludXMoIHRoaXMuX2NlbnRlciApLm5vcm1hbGl6ZWQoKTtcbiAgICBjb25zdCBub3JtYWxCQW5nbGUgPSBub3JtYWxCLmFuZ2xlO1xuXG4gICAgaWYgKCB0YSA8IGVwc2lsb24gKSB7XG4gICAgICAvLyB3ZSBhcmUgaW5zaWRlIHRoZSBjaXJjbGUsIHNvIG9ubHkgb25lIGludGVyc2VjdGlvbiBpcyBwb3NzaWJsZVxuICAgICAgaWYgKCB0aGlzLmNvbnRhaW5zQW5nbGUoIG5vcm1hbEJBbmdsZSApICkge1xuICAgICAgICAvLyBub3JtYWwgaXMgdG93YXJkcyB0aGUgcmF5LCBzbyB3ZSBuZWdhdGUgaXQuIGFsc28gd2luZHMgb3Bwb3NpdGUgd2F5XG4gICAgICAgIHJlc3VsdC5wdXNoKCBuZXcgUmF5SW50ZXJzZWN0aW9uKCB0YiwgcG9pbnRCLCBub3JtYWxCLm5lZ2F0ZWQoKSwgdGhpcy5fYW50aWNsb2Nrd2lzZSA/IC0xIDogMSwgdGhpcy50QXRBbmdsZSggbm9ybWFsQkFuZ2xlICkgKSApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHR3byBwb3NzaWJsZSBoaXRzIChvdXRzaWRlIGNpcmNsZSlcbiAgICAgIGNvbnN0IHBvaW50QSA9IHJheS5wb2ludEF0RGlzdGFuY2UoIHRhICk7XG4gICAgICBjb25zdCBub3JtYWxBID0gcG9pbnRBLm1pbnVzKCB0aGlzLl9jZW50ZXIgKS5ub3JtYWxpemVkKCk7XG4gICAgICBjb25zdCBub3JtYWxBQW5nbGUgPSBub3JtYWxBLmFuZ2xlO1xuXG4gICAgICBpZiAoIHRoaXMuY29udGFpbnNBbmdsZSggbm9ybWFsQUFuZ2xlICkgKSB7XG4gICAgICAgIC8vIGhpdCBmcm9tIG91dHNpZGVcbiAgICAgICAgcmVzdWx0LnB1c2goIG5ldyBSYXlJbnRlcnNlY3Rpb24oIHRhLCBwb2ludEEsIG5vcm1hbEEsIHRoaXMuX2FudGljbG9ja3dpc2UgPyAxIDogLTEsIHRoaXMudEF0QW5nbGUoIG5vcm1hbEFBbmdsZSApICkgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5jb250YWluc0FuZ2xlKCBub3JtYWxCQW5nbGUgKSApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goIG5ldyBSYXlJbnRlcnNlY3Rpb24oIHRiLCBwb2ludEIsIG5vcm1hbEIubmVnYXRlZCgpLCB0aGlzLl9hbnRpY2xvY2t3aXNlID8gLTEgOiAxLCB0aGlzLnRBdEFuZ2xlKCBub3JtYWxCQW5nbGUgKSApICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRhbnQgd2luZGluZyBudW1iZXIgb2YgdGhpcyByYXkgaW50ZXJzZWN0aW5nIHRoaXMgYXJjLlxuICAgKi9cbiAgcHVibGljIHdpbmRpbmdJbnRlcnNlY3Rpb24oIHJheTogUmF5MiApOiBudW1iZXIge1xuICAgIGxldCB3aW5kID0gMDtcbiAgICBjb25zdCBoaXRzID0gdGhpcy5pbnRlcnNlY3Rpb24oIHJheSApO1xuICAgIF8uZWFjaCggaGl0cywgaGl0ID0+IHtcbiAgICAgIHdpbmQgKz0gaGl0LndpbmQ7XG4gICAgfSApO1xuICAgIHJldHVybiB3aW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIHRoaXMgYXJjIHRvIHRoZSAyRCBDYW52YXMgY29udGV4dCwgYXNzdW1pbmcgdGhlIGNvbnRleHQncyBjdXJyZW50IGxvY2F0aW9uIGlzIGFscmVhZHkgYXQgdGhlIHN0YXJ0IHBvaW50XG4gICAqL1xuICBwdWJsaWMgd3JpdGVUb0NvbnRleHQoIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCApOiB2b2lkIHtcbiAgICBjb250ZXh0LmFyYyggdGhpcy5fY2VudGVyLngsIHRoaXMuX2NlbnRlci55LCB0aGlzLl9yYWRpdXMsIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9hbnRpY2xvY2t3aXNlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBjb3B5IG9mIHRoaXMgYXJjLCB0cmFuc2Zvcm1lZCBieSB0aGUgZ2l2ZW4gbWF0cml4LlxuICAgKlxuICAgKiBUT0RPOiB0ZXN0IHZhcmlvdXMgdHJhbnNmb3JtIHR5cGVzLCBlc3BlY2lhbGx5IHJvdGF0aW9ucywgc2NhbGluZywgc2hlYXJzLCBldGMuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDMgKTogQXJjIHwgRWxsaXB0aWNhbEFyYyB7XG4gICAgLy8gc28gd2UgY2FuIGhhbmRsZSByZWZsZWN0aW9ucyBpbiB0aGUgdHJhbnNmb3JtLCB3ZSBkbyB0aGUgZ2VuZXJhbCBjYXNlIGhhbmRsaW5nIGZvciBzdGFydC9lbmQgYW5nbGVzXG4gICAgY29uc3Qgc3RhcnRBbmdsZSA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIDEsIHRoaXMuX3N0YXJ0QW5nbGUgKSApLm1pbnVzKCBtYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLlpFUk8gKSApLmFuZ2xlO1xuICAgIGxldCBlbmRBbmdsZSA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIDEsIHRoaXMuX2VuZEFuZ2xlICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKS5hbmdsZTtcblxuICAgIC8vIHJldmVyc2UgdGhlICdjbG9ja3dpc2VuZXNzJyBpZiBvdXIgdHJhbnNmb3JtIGluY2x1ZGVzIGEgcmVmbGVjdGlvblxuICAgIGNvbnN0IGFudGljbG9ja3dpc2UgPSBtYXRyaXguZ2V0RGV0ZXJtaW5hbnQoKSA+PSAwID8gdGhpcy5fYW50aWNsb2Nrd2lzZSA6ICF0aGlzLl9hbnRpY2xvY2t3aXNlO1xuXG4gICAgaWYgKCBNYXRoLmFicyggdGhpcy5fZW5kQW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlICkgPT09IE1hdGguUEkgKiAyICkge1xuICAgICAgZW5kQW5nbGUgPSBhbnRpY2xvY2t3aXNlID8gc3RhcnRBbmdsZSAtIE1hdGguUEkgKiAyIDogc3RhcnRBbmdsZSArIE1hdGguUEkgKiAyO1xuICAgIH1cblxuICAgIGNvbnN0IHNjYWxlVmVjdG9yID0gbWF0cml4LmdldFNjYWxlVmVjdG9yKCk7XG4gICAgaWYgKCBzY2FsZVZlY3Rvci54ICE9PSBzY2FsZVZlY3Rvci55ICkge1xuICAgICAgY29uc3QgcmFkaXVzWCA9IHNjYWxlVmVjdG9yLnggKiB0aGlzLl9yYWRpdXM7XG4gICAgICBjb25zdCByYWRpdXNZID0gc2NhbGVWZWN0b3IueSAqIHRoaXMuX3JhZGl1cztcbiAgICAgIHJldHVybiBuZXcgRWxsaXB0aWNhbEFyYyggbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fY2VudGVyICksIHJhZGl1c1gsIHJhZGl1c1ksIDAsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgcmFkaXVzID0gc2NhbGVWZWN0b3IueCAqIHRoaXMuX3JhZGl1cztcbiAgICAgIHJldHVybiBuZXcgQXJjKCBtYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLl9jZW50ZXIgKSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb250cmlidXRpb24gdG8gdGhlIHNpZ25lZCBhcmVhIGNvbXB1dGVkIHVzaW5nIEdyZWVuJ3MgVGhlb3JlbSwgd2l0aCBQPS15LzIgYW5kIFE9eC8yLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIHRoaXMgc2VnbWVudCdzIGNvbnRyaWJ1dGlvbiB0byB0aGUgbGluZSBpbnRlZ3JhbCAoLXkvMiBkeCArIHgvMiBkeSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2lnbmVkQXJlYUZyYWdtZW50KCk6IG51bWJlciB7XG4gICAgY29uc3QgdDAgPSB0aGlzLl9zdGFydEFuZ2xlO1xuICAgIGNvbnN0IHQxID0gdGhpcy5nZXRBY3R1YWxFbmRBbmdsZSgpO1xuXG4gICAgLy8gRGVyaXZlZCB2aWEgTWF0aGVtYXRpY2EgKGN1cnZlLWFyZWEubmIpXG4gICAgcmV0dXJuIDAuNSAqIHRoaXMuX3JhZGl1cyAqICggdGhpcy5fcmFkaXVzICogKCB0MSAtIHQwICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NlbnRlci54ICogKCBNYXRoLnNpbiggdDEgKSAtIE1hdGguc2luKCB0MCApICkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NlbnRlci55ICogKCBNYXRoLmNvcyggdDEgKSAtIE1hdGguY29zKCB0MCApICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZWQgY29weSBvZiB0aGlzIHNlZ21lbnQgKG1hcHBpbmcgdGhlIHBhcmFtZXRyaXphdGlvbiBmcm9tIFswLDFdID0+IFsxLDBdKS5cbiAgICovXG4gIHB1YmxpYyByZXZlcnNlZCgpOiBBcmMge1xuICAgIHJldHVybiBuZXcgQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1cywgdGhpcy5fZW5kQW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUsICF0aGlzLl9hbnRpY2xvY2t3aXNlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJjIGxlbmd0aCBvZiB0aGUgc2VnbWVudC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRBcmNMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbmdsZURpZmZlcmVuY2UoKSAqIHRoaXMuX3JhZGl1cztcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBjYW4gaGFuZGxlIHRoaXMgc2ltcGx5IGJ5IHJldHVybmluZyBvdXJzZWx2ZXMuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgdG9QaWVjZXdpc2VMaW5lYXJPckFyY1NlZ21lbnRzKCk6IFNlZ21lbnRbXSB7XG4gICAgcmV0dXJuIFsgdGhpcyBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXG4gICAqL1xuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRBcmMge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQXJjJyxcbiAgICAgIGNlbnRlclg6IHRoaXMuX2NlbnRlci54LFxuICAgICAgY2VudGVyWTogdGhpcy5fY2VudGVyLnksXG4gICAgICByYWRpdXM6IHRoaXMuX3JhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGU6IHRoaXMuX3N0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZTogdGhpcy5fZW5kQW5nbGUsXG4gICAgICBhbnRpY2xvY2t3aXNlOiB0aGlzLl9hbnRpY2xvY2t3aXNlXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hldGhlciB0d28gbGluZXMgb3ZlcmxhcCBvdmVyIGEgY29udGludW91cyBzZWN0aW9uLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlyIHN1Y2ggdGhhdFxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxuICAgKlxuICAgKiBAcGFyYW0gc2VnbWVudFxuICAgKiBAcGFyYW0gW2Vwc2lsb25dIC0gV2lsbCByZXR1cm4gb3ZlcmxhcHMgb25seSBpZiBubyB0d28gY29ycmVzcG9uZGluZyBwb2ludHMgZGlmZmVyIGJ5IHRoaXMgYW1vdW50IG9yIG1vcmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIG9uZSBjb21wb25lbnQuXG4gICAqIEByZXR1cm5zIC0gVGhlIHNvbHV0aW9uLCBpZiB0aGVyZSBpcyBvbmUgKGFuZCBvbmx5IG9uZSlcbiAgICovXG4gIHB1YmxpYyBnZXRPdmVybGFwcyggc2VnbWVudDogU2VnbWVudCwgZXBzaWxvbiA9IDFlLTYgKTogT3ZlcmxhcFtdIHwgbnVsbCB7XG4gICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgQXJjICkge1xuICAgICAgcmV0dXJuIEFyYy5nZXRPdmVybGFwcyggdGhpcywgc2VnbWVudCApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG1hdHJpeCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29uaWMgc2VjdGlvbiBvZiB0aGUgY2lyY2xlLlxuICAgKiBTZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTWF0cml4X3JlcHJlc2VudGF0aW9uX29mX2NvbmljX3NlY3Rpb25zXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29uaWNNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgLy8gKCB4IC0gYSApXjIgKyAoIHkgLSBiICleMiA9IHJeMlxuICAgIC8vIHheMiAtIDJheCArIGFeMiArIHleMiAtIDJieSArIGJeMiA9IHJeMlxuICAgIC8vIHheMiArIHleMiAtIDJheCAtIDJieSArICggYV4yICsgYl4yIC0gcl4yICkgPSAwXG5cbiAgICBjb25zdCBhID0gdGhpcy5jZW50ZXIueDtcbiAgICBjb25zdCBiID0gdGhpcy5jZW50ZXIueTtcblxuICAgIC8vIEF4XjIgKyBCeHkgKyBDeV4yICsgRHggKyBFeSArIEYgPSAwXG4gICAgY29uc3QgQSA9IDE7XG4gICAgY29uc3QgQiA9IDA7XG4gICAgY29uc3QgQyA9IDE7XG4gICAgY29uc3QgRCA9IC0yICogYTtcbiAgICBjb25zdCBFID0gLTIgKiBiO1xuICAgIGNvbnN0IEYgPSBhICogYSArIGIgKiBiIC0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cztcblxuICAgIHJldHVybiBNYXRyaXgzLnJvd01ham9yKFxuICAgICAgQSwgQiAvIDIsIEQgLyAyLFxuICAgICAgQiAvIDIsIEMsIEUgLyAyLFxuICAgICAgRCAvIDIsIEUgLyAyLCBGXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFyYyBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkQXJjICk6IEFyYyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdBcmMnICk7XG5cbiAgICByZXR1cm4gbmV3IEFyYyggbmV3IFZlY3RvcjIoIG9iai5jZW50ZXJYLCBvYmouY2VudGVyWSApLCBvYmoucmFkaXVzLCBvYmouc3RhcnRBbmdsZSwgb2JqLmVuZEFuZ2xlLCBvYmouYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgdGhlIGFjdHVhbCBlbmQgYW5nbGUgKGNvbXBhcmVkIHRvIHRoZSBzdGFydCBhbmdsZSkuXG4gICAqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIHNpZ24gb2YgdGhlIGFuZ2xlcywgc28gdGhhdCB0aGUgc2lnbiBvZiAoIGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSApIG1hdGNoZXMgd2hldGhlciBpdCBpc1xuICAgKiBhbnRpY2xvY2t3aXNlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wdXRlQWN0dWFsRW5kQW5nbGUoIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZTogYm9vbGVhbiApOiBudW1iZXIge1xuICAgIGlmICggYW50aWNsb2Nrd2lzZSApIHtcbiAgICAgIC8vIGFuZ2xlIGlzICdkZWNyZWFzaW5nJ1xuICAgICAgLy8gLTJwaSA8PSBlbmQgLSBzdGFydCA8IDJwaVxuICAgICAgaWYgKCBzdGFydEFuZ2xlID4gZW5kQW5nbGUgKSB7XG4gICAgICAgIHJldHVybiBlbmRBbmdsZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBzdGFydEFuZ2xlIDwgZW5kQW5nbGUgKSB7XG4gICAgICAgIHJldHVybiBlbmRBbmdsZSAtIDIgKiBNYXRoLlBJO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGVxdWFsXG4gICAgICAgIHJldHVybiBzdGFydEFuZ2xlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGFuZ2xlIGlzICdpbmNyZWFzaW5nJ1xuICAgICAgLy8gLTJwaSA8IGVuZCAtIHN0YXJ0IDw9IDJwaVxuICAgICAgaWYgKCBzdGFydEFuZ2xlIDwgZW5kQW5nbGUgKSB7XG4gICAgICAgIHJldHVybiBlbmRBbmdsZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBzdGFydEFuZ2xlID4gZW5kQW5nbGUgKSB7XG4gICAgICAgIHJldHVybiBlbmRBbmdsZSArIE1hdGguUEkgKiAyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGVxdWFsXG4gICAgICAgIHJldHVybiBzdGFydEFuZ2xlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgcG90ZW50aWFsIG92ZXJsYXAgYmV0d2VlbiBbMCxlbmQxXSBhbmQgW3N0YXJ0MixlbmQyXSAod2l0aCB0LXZhbHVlcyBbMCwxXSBhbmQgW3RTdGFydDIsdEVuZDJdKS5cbiAgICpcbiAgICogQHBhcmFtIGVuZDEgLSBSZWxhdGl2ZSBlbmQgYW5nbGUgb2YgdGhlIGZpcnN0IHNlZ21lbnRcbiAgICogQHBhcmFtIHN0YXJ0MiAtIFJlbGF0aXZlIHN0YXJ0IGFuZ2xlIG9mIHRoZSBzZWNvbmQgc2VnbWVudFxuICAgKiBAcGFyYW0gZW5kMiAtIFJlbGF0aXZlIGVuZCBhbmdsZSBvZiB0aGUgc2Vjb25kIHNlZ21lbnRcbiAgICogQHBhcmFtIHRTdGFydDIgLSBUaGUgcGFyYW1ldHJpYyB2YWx1ZSBvZiB0aGUgc2Vjb25kIHNlZ21lbnQncyBzdGFydFxuICAgKiBAcGFyYW0gdEVuZDIgLSBUaGUgcGFyYW1ldHJpYyB2YWx1ZSBvZiB0aGUgc2Vjb25kIHNlZ21lbnQncyBlbmRcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIGdldFBhcnRpYWxPdmVybGFwKCBlbmQxOiBudW1iZXIsIHN0YXJ0MjogbnVtYmVyLCBlbmQyOiBudW1iZXIsIHRTdGFydDI6IG51bWJlciwgdEVuZDI6IG51bWJlciApOiBPdmVybGFwW10ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZDEgPiAwICYmIGVuZDEgPD0gVFdPX1BJICsgMWUtMTAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydDIgPj0gMCAmJiBzdGFydDIgPCBUV09fUEkgKyAxZS0xMCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVuZDIgPj0gMCAmJiBlbmQyIDw9IFRXT19QSSArIDFlLTEwICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdFN0YXJ0MiA+PSAwICYmIHRTdGFydDIgPD0gMSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRFbmQyID49IDAgJiYgdEVuZDIgPD0gMSApO1xuXG4gICAgY29uc3QgcmV2ZXJzZWQyID0gZW5kMiA8IHN0YXJ0MjtcbiAgICBjb25zdCBtaW4yID0gcmV2ZXJzZWQyID8gZW5kMiA6IHN0YXJ0MjtcbiAgICBjb25zdCBtYXgyID0gcmV2ZXJzZWQyID8gc3RhcnQyIDogZW5kMjtcblxuICAgIGNvbnN0IG92ZXJsYXBNaW4gPSBtaW4yO1xuICAgIGNvbnN0IG92ZXJsYXBNYXggPSBNYXRoLm1pbiggZW5kMSwgbWF4MiApO1xuXG4gICAgLy8gSWYgdGhlcmUncyBub3QgYSBzbWFsbCBhbW91bnQgb2Ygb3ZlcmxhcFxuICAgIGlmICggb3ZlcmxhcE1heCA8IG92ZXJsYXBNaW4gKyAxZS04ICkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbIE92ZXJsYXAuY3JlYXRlTGluZWFyKFxuICAgICAgICAvLyBtaW5pbXVtXG4gICAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIDAsIGVuZDEsIDAsIDEsIG92ZXJsYXBNaW4gKSwgMCwgMSApLCAvLyBhcmMxIG1pblxuICAgICAgICBVdGlscy5jbGFtcCggVXRpbHMubGluZWFyKCBzdGFydDIsIGVuZDIsIHRTdGFydDIsIHRFbmQyLCBvdmVybGFwTWluICksIDAsIDEgKSwgLy8gYXJjMiBtaW5cbiAgICAgICAgLy8gbWF4aW11bVxuICAgICAgICBVdGlscy5jbGFtcCggVXRpbHMubGluZWFyKCAwLCBlbmQxLCAwLCAxLCBvdmVybGFwTWF4ICksIDAsIDEgKSwgLy8gYXJjMSBtYXhcbiAgICAgICAgVXRpbHMuY2xhbXAoIFV0aWxzLmxpbmVhciggc3RhcnQyLCBlbmQyLCB0U3RhcnQyLCB0RW5kMiwgb3ZlcmxhcE1heCApLCAwLCAxICkgLy8gYXJjMiBtYXhcbiAgICAgICkgXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIEFyY3Mgb3ZlcmxhcCBvdmVyIGNvbnRpbnVvdXMgc2VjdGlvbnMsIGFuZCBpZiBzbyBmaW5kcyB0aGUgYSxiIHBhaXJzIHN1Y2ggdGhhdFxuICAgKiBwKCB0ICkgPT09IHEoIGEgKiB0ICsgYiApLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRBbmdsZTEgLSBTdGFydCBhbmdsZSBvZiBhcmMgMVxuICAgKiBAcGFyYW0gZW5kQW5nbGUxIC0gXCJBY3R1YWxcIiBlbmQgYW5nbGUgb2YgYXJjIDFcbiAgICogQHBhcmFtIHN0YXJ0QW5nbGUyIC0gU3RhcnQgYW5nbGUgb2YgYXJjIDJcbiAgICogQHBhcmFtIGVuZEFuZ2xlMiAtIFwiQWN0dWFsXCIgZW5kIGFuZ2xlIG9mIGFyYyAyXG4gICAqIEByZXR1cm5zIC0gQW55IG92ZXJsYXBzIChmcm9tIDAgdG8gMilcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0QW5ndWxhck92ZXJsYXBzKCBzdGFydEFuZ2xlMTogbnVtYmVyLCBlbmRBbmdsZTE6IG51bWJlciwgc3RhcnRBbmdsZTI6IG51bWJlciwgZW5kQW5nbGUyOiBudW1iZXIgKTogT3ZlcmxhcFtdIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZTEgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBlbmRBbmdsZTEgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBzdGFydEFuZ2xlMiApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGVuZEFuZ2xlMiApICk7XG5cbiAgICAvLyBSZW1hcCBzdGFydCBvZiBhcmMgMSB0byAwLCBhbmQgdGhlIGVuZCB0byBiZSBwb3NpdGl2ZSAoc2lnbjEgKVxuICAgIGxldCBlbmQxID0gZW5kQW5nbGUxIC0gc3RhcnRBbmdsZTE7XG4gICAgY29uc3Qgc2lnbjEgPSBlbmQxIDwgMCA/IC0xIDogMTtcbiAgICBlbmQxICo9IHNpZ24xO1xuXG4gICAgLy8gUmVtYXAgYXJjIDIgc28gdGhlIHN0YXJ0IHBvaW50IG1hcHMgdG8gdGhlIFswLDJwaSkgcmFuZ2UgKGFuZCBlbmQtcG9pbnQgbWF5IGxpZSBvdXRzaWRlIHRoYXQpXG4gICAgY29uc3Qgc3RhcnQyID0gVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIHNpZ24xICogKCBzdGFydEFuZ2xlMiAtIHN0YXJ0QW5nbGUxICksIDAsIFRXT19QSSApO1xuICAgIGNvbnN0IGVuZDIgPSBzaWduMSAqICggZW5kQW5nbGUyIC0gc3RhcnRBbmdsZTIgKSArIHN0YXJ0MjtcblxuICAgIGxldCB3cmFwVDtcbiAgICBpZiAoIGVuZDIgPCAtMWUtMTAgKSB7XG4gICAgICB3cmFwVCA9IC1zdGFydDIgLyAoIGVuZDIgLSBzdGFydDIgKTtcbiAgICAgIHJldHVybiBBcmMuZ2V0UGFydGlhbE92ZXJsYXAoIGVuZDEsIHN0YXJ0MiwgMCwgMCwgd3JhcFQgKS5jb25jYXQoIEFyYy5nZXRQYXJ0aWFsT3ZlcmxhcCggZW5kMSwgVFdPX1BJLCBlbmQyICsgVFdPX1BJLCB3cmFwVCwgMSApICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBlbmQyID4gVFdPX1BJICsgMWUtMTAgKSB7XG4gICAgICB3cmFwVCA9ICggVFdPX1BJIC0gc3RhcnQyICkgLyAoIGVuZDIgLSBzdGFydDIgKTtcbiAgICAgIHJldHVybiBBcmMuZ2V0UGFydGlhbE92ZXJsYXAoIGVuZDEsIHN0YXJ0MiwgVFdPX1BJLCAwLCB3cmFwVCApLmNvbmNhdCggQXJjLmdldFBhcnRpYWxPdmVybGFwKCBlbmQxLCAwLCBlbmQyIC0gVFdPX1BJLCB3cmFwVCwgMSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIEFyYy5nZXRQYXJ0aWFsT3ZlcmxhcCggZW5kMSwgc3RhcnQyLCBlbmQyLCAwLCAxICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIHR3byBBcmNzIG92ZXJsYXAgb3ZlciBjb250aW51b3VzIHNlY3Rpb25zLCBhbmQgaWYgc28gZmluZHMgdGhlIGEsYiBwYWlycyBzdWNoIHRoYXRcbiAgICogcCggdCApID09PSBxKCBhICogdCArIGIgKS5cbiAgICpcbiAgICogQHJldHVybnMgLSBBbnkgb3ZlcmxhcHMgKGZyb20gMCB0byAyKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXRPdmVybGFwcyggYXJjMTogQXJjLCBhcmMyOiBBcmMgKTogT3ZlcmxhcFtdIHtcblxuICAgIGlmICggYXJjMS5fY2VudGVyLmRpc3RhbmNlKCBhcmMyLl9jZW50ZXIgKSA+IDFlLTQgfHwgTWF0aC5hYnMoIGFyYzEuX3JhZGl1cyAtIGFyYzIuX3JhZGl1cyApID4gMWUtNCApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gQXJjLmdldEFuZ3VsYXJPdmVybGFwcyggYXJjMS5fc3RhcnRBbmdsZSwgYXJjMS5nZXRBY3R1YWxFbmRBbmdsZSgpLCBhcmMyLl9zdGFydEFuZ2xlLCBhcmMyLmdldEFjdHVhbEVuZEFuZ2xlKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwb2ludHMgb2YgaW50ZXJzZWN0aW9ucyBiZXR3ZWVuIHR3byBjaXJjbGVzLlxuICAgKlxuICAgKiBAcGFyYW0gY2VudGVyMSAtIENlbnRlciBvZiB0aGUgZmlyc3QgY2lyY2xlXG4gICAqIEBwYXJhbSByYWRpdXMxIC0gUmFkaXVzIG9mIHRoZSBmaXJzdCBjaXJjbGVcbiAgICogQHBhcmFtIGNlbnRlcjIgLSBDZW50ZXIgb2YgdGhlIHNlY29uZCBjaXJjbGVcbiAgICogQHBhcmFtIHJhZGl1czIgLSBSYWRpdXMgb2YgdGhlIHNlY29uZCBjaXJjbGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIGNlbnRlcjE6IFZlY3RvcjIsIHJhZGl1czE6IG51bWJlciwgY2VudGVyMjogVmVjdG9yMiwgcmFkaXVzMjogbnVtYmVyICk6IFZlY3RvcjJbXSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJhZGl1czEgKSAmJiByYWRpdXMxID49IDAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzMiApICYmIHJhZGl1czIgPj0gMCApO1xuXG4gICAgY29uc3QgZGVsdGEgPSBjZW50ZXIyLm1pbnVzKCBjZW50ZXIxICk7XG4gICAgY29uc3QgZCA9IGRlbHRhLm1hZ25pdHVkZTtcbiAgICBsZXQgcmVzdWx0czogVmVjdG9yMltdID0gW107XG4gICAgaWYgKCBkIDwgMWUtMTAgfHwgZCA+IHJhZGl1czEgKyByYWRpdXMyICsgMWUtMTAgKSB7XG4gICAgICAvLyBObyBpbnRlcnNlY3Rpb25zXG4gICAgfVxuICAgIGVsc2UgaWYgKCBkID4gcmFkaXVzMSArIHJhZGl1czIgLSAxZS0xMCApIHtcbiAgICAgIHJlc3VsdHMgPSBbXG4gICAgICAgIGNlbnRlcjEuYmxlbmQoIGNlbnRlcjIsIHJhZGl1czEgLyBkIClcbiAgICAgIF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgeFByaW1lID0gMC41ICogKCBkICogZCAtIHJhZGl1czIgKiByYWRpdXMyICsgcmFkaXVzMSAqIHJhZGl1czEgKSAvIGQ7XG4gICAgICBjb25zdCBiaXQgPSBkICogZCAtIHJhZGl1czIgKiByYWRpdXMyICsgcmFkaXVzMSAqIHJhZGl1czE7XG4gICAgICBjb25zdCBkaXNjcmltaW5hbnQgPSA0ICogZCAqIGQgKiByYWRpdXMxICogcmFkaXVzMSAtIGJpdCAqIGJpdDtcbiAgICAgIGNvbnN0IGJhc2UgPSBjZW50ZXIxLmJsZW5kKCBjZW50ZXIyLCB4UHJpbWUgLyBkICk7XG4gICAgICBpZiAoIGRpc2NyaW1pbmFudCA+PSAxZS0xMCApIHtcbiAgICAgICAgY29uc3QgeVByaW1lID0gTWF0aC5zcXJ0KCBkaXNjcmltaW5hbnQgKSAvIGQgLyAyO1xuICAgICAgICBjb25zdCBwZXJwZW5kaWN1bGFyID0gZGVsdGEucGVycGVuZGljdWxhci5zZXRNYWduaXR1ZGUoIHlQcmltZSApO1xuICAgICAgICByZXN1bHRzID0gW1xuICAgICAgICAgIGJhc2UucGx1cyggcGVycGVuZGljdWxhciApLFxuICAgICAgICAgIGJhc2UubWludXMoIHBlcnBlbmRpY3VsYXIgKVxuICAgICAgICBdO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGRpc2NyaW1pbmFudCA+IC0xZS0xMCApIHtcbiAgICAgICAgcmVzdWx0cyA9IFsgYmFzZSBdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIHJlc3VsdHMuZm9yRWFjaCggcmVzdWx0ID0+IHtcbiAgICAgICAgYXNzZXJ0ISggTWF0aC5hYnMoIHJlc3VsdC5kaXN0YW5jZSggY2VudGVyMSApIC0gcmFkaXVzMSApIDwgMWUtOCApO1xuICAgICAgICBhc3NlcnQhKCBNYXRoLmFicyggcmVzdWx0LmRpc3RhbmNlKCBjZW50ZXIyICkgLSByYWRpdXMyICkgPCAxZS04ICk7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW55IChmaW5pdGUpIGludGVyc2VjdGlvbiBiZXR3ZWVuIHRoZSB0d28gYXJjIHNlZ21lbnRzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBpbnRlcnNlY3QoIGE6IEFyYywgYjogQXJjICk6IFNlZ21lbnRJbnRlcnNlY3Rpb25bXSB7XG4gICAgY29uc3QgZXBzaWxvbiA9IDFlLTc7XG5cbiAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAvLyBJZiB3ZSBlZmZlY3RpdmVseSBoYXZlIHRoZSBzYW1lIGNpcmNsZSwganVzdCBkaWZmZXJlbnQgc2VjdGlvbnMgb2YgaXQuIFRoZSBvbmx5IGZpbml0ZSBpbnRlcnNlY3Rpb25zIGNvdWxkIGJlXG4gICAgLy8gYXQgdGhlIGVuZHBvaW50cywgc28gd2UnbGwgaW5zcGVjdCB0aG9zZS5cbiAgICBpZiAoIGEuX2NlbnRlci5lcXVhbHNFcHNpbG9uKCBiLl9jZW50ZXIsIGVwc2lsb24gKSAmJiBNYXRoLmFicyggYS5fcmFkaXVzIC0gYi5fcmFkaXVzICkgPCBlcHNpbG9uICkge1xuICAgICAgY29uc3QgYVN0YXJ0ID0gYS5wb3NpdGlvbkF0KCAwICk7XG4gICAgICBjb25zdCBhRW5kID0gYS5wb3NpdGlvbkF0KCAxICk7XG4gICAgICBjb25zdCBiU3RhcnQgPSBiLnBvc2l0aW9uQXQoIDAgKTtcbiAgICAgIGNvbnN0IGJFbmQgPSBiLnBvc2l0aW9uQXQoIDEgKTtcblxuICAgICAgaWYgKCBhU3RhcnQuZXF1YWxzRXBzaWxvbiggYlN0YXJ0LCBlcHNpbG9uICkgKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFTdGFydC5hdmVyYWdlKCBiU3RhcnQgKSwgMCwgMCApICk7XG4gICAgICB9XG4gICAgICBpZiAoIGFTdGFydC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFTdGFydC5hdmVyYWdlKCBiRW5kICksIDAsIDEgKSApO1xuICAgICAgfVxuICAgICAgaWYgKCBhRW5kLmVxdWFsc0Vwc2lsb24oIGJTdGFydCwgZXBzaWxvbiApICkge1xuICAgICAgICByZXN1bHRzLnB1c2goIG5ldyBTZWdtZW50SW50ZXJzZWN0aW9uKCBhRW5kLmF2ZXJhZ2UoIGJTdGFydCApLCAxLCAwICkgKTtcbiAgICAgIH1cbiAgICAgIGlmICggYUVuZC5lcXVhbHNFcHNpbG9uKCBiRW5kLCBlcHNpbG9uICkgKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFFbmQuYXZlcmFnZSggYkVuZCApLCAxLCAxICkgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBwb2ludHMgPSBBcmMuZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQoIGEuX2NlbnRlciwgYS5fcmFkaXVzLCBiLl9jZW50ZXIsIGIuX3JhZGl1cyApO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzWyBpIF07XG4gICAgICAgIGNvbnN0IGFuZ2xlQSA9IHBvaW50Lm1pbnVzKCBhLl9jZW50ZXIgKS5hbmdsZTtcbiAgICAgICAgY29uc3QgYW5nbGVCID0gcG9pbnQubWludXMoIGIuX2NlbnRlciApLmFuZ2xlO1xuXG4gICAgICAgIGlmICggYS5jb250YWluc0FuZ2xlKCBhbmdsZUEgKSAmJiBiLmNvbnRhaW5zQW5nbGUoIGFuZ2xlQiApICkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIHBvaW50LCBhLnRBdEFuZ2xlKCBhbmdsZUEgKSwgYi50QXRBbmdsZSggYW5nbGVCICkgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBBcmMgKG9yIGlmIHN0cmFpZ2h0IGVub3VnaCBhIExpbmUpIHNlZ21lbnQgdGhhdCBnb2VzIGZyb20gdGhlIHN0YXJ0UG9pbnQgdG8gdGhlIGVuZFBvaW50LCB0b3VjaGluZ1xuICAgKiB0aGUgbWlkZGxlUG9pbnQgc29tZXdoZXJlIGJldHdlZW4gdGhlIHR3by5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlRnJvbVBvaW50cyggc3RhcnRQb2ludDogVmVjdG9yMiwgbWlkZGxlUG9pbnQ6IFZlY3RvcjIsIGVuZFBvaW50OiBWZWN0b3IyICk6IFNlZ21lbnQge1xuICAgIGNvbnN0IGNlbnRlciA9IFV0aWxzLmNpcmNsZUNlbnRlckZyb21Qb2ludHMoIHN0YXJ0UG9pbnQsIG1pZGRsZVBvaW50LCBlbmRQb2ludCApO1xuXG4gICAgLy8gQ2xvc2UgZW5vdWdoXG4gICAgaWYgKCBjZW50ZXIgPT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gbmV3IExpbmUoIHN0YXJ0UG9pbnQsIGVuZFBvaW50ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3Qgc3RhcnREaWZmID0gc3RhcnRQb2ludC5taW51cyggY2VudGVyICk7XG4gICAgICBjb25zdCBtaWRkbGVEaWZmID0gbWlkZGxlUG9pbnQubWludXMoIGNlbnRlciApO1xuICAgICAgY29uc3QgZW5kRGlmZiA9IGVuZFBvaW50Lm1pbnVzKCBjZW50ZXIgKTtcbiAgICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSBzdGFydERpZmYuYW5nbGU7XG4gICAgICBjb25zdCBtaWRkbGVBbmdsZSA9IG1pZGRsZURpZmYuYW5nbGU7XG4gICAgICBjb25zdCBlbmRBbmdsZSA9IGVuZERpZmYuYW5nbGU7XG5cbiAgICAgIGNvbnN0IHJhZGl1cyA9ICggc3RhcnREaWZmLm1hZ25pdHVkZSArIG1pZGRsZURpZmYubWFnbml0dWRlICsgZW5kRGlmZi5tYWduaXR1ZGUgKSAvIDM7XG5cbiAgICAgIC8vIFRyeSBhbnRpY2xvY2t3aXNlIGZpcnN0LiBUT0RPOiBEb24ndCByZXF1aXJlIGNyZWF0aW9uIG9mIGV4dHJhIEFyY3MgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICBjb25zdCBhcmMgPSBuZXcgQXJjKCBjZW50ZXIsIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGZhbHNlICk7XG4gICAgICBpZiAoIGFyYy5jb250YWluc0FuZ2xlKCBtaWRkbGVBbmdsZSApICkge1xuICAgICAgICByZXR1cm4gYXJjO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgQXJjKCBjZW50ZXIsIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ0FyYycsIEFyYyApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIkVsbGlwdGljYWxBcmMiLCJraXRlIiwiTGluZSIsIk92ZXJsYXAiLCJSYXlJbnRlcnNlY3Rpb24iLCJTZWdtZW50IiwiU2VnbWVudEludGVyc2VjdGlvbiIsInN2Z051bWJlciIsIlRXT19QSSIsIk1hdGgiLCJQSSIsIkFyYyIsInNldENlbnRlciIsImNlbnRlciIsImFzc2VydCIsImlzRmluaXRlIiwidG9TdHJpbmciLCJfY2VudGVyIiwiZXF1YWxzIiwiaW52YWxpZGF0ZSIsInZhbHVlIiwiZ2V0Q2VudGVyIiwic2V0UmFkaXVzIiwicmFkaXVzIiwiX3JhZGl1cyIsImdldFJhZGl1cyIsInNldFN0YXJ0QW5nbGUiLCJzdGFydEFuZ2xlIiwiX3N0YXJ0QW5nbGUiLCJnZXRTdGFydEFuZ2xlIiwic2V0RW5kQW5nbGUiLCJlbmRBbmdsZSIsIl9lbmRBbmdsZSIsImdldEVuZEFuZ2xlIiwic2V0QW50aWNsb2Nrd2lzZSIsImFudGljbG9ja3dpc2UiLCJfYW50aWNsb2Nrd2lzZSIsImdldEFudGljbG9ja3dpc2UiLCJwb3NpdGlvbkF0IiwidCIsInBvc2l0aW9uQXRBbmdsZSIsImFuZ2xlQXQiLCJ0YW5nZW50QXQiLCJ0YW5nZW50QXRBbmdsZSIsImN1cnZhdHVyZUF0Iiwic3ViZGl2aWRlZCIsImFuZ2xlMCIsImFuZ2xlVCIsImFuZ2xlMSIsIl9zdGFydCIsIl9lbmQiLCJfc3RhcnRUYW5nZW50IiwiX2VuZFRhbmdlbnQiLCJfYWN0dWFsRW5kQW5nbGUiLCJfaXNGdWxsUGVyaW1ldGVyIiwiX2FuZ2xlRGlmZmVyZW5jZSIsIl9ib3VuZHMiLCJfc3ZnUGF0aEZyYWdtZW50IiwiaW52YWxpZGF0aW9uRW1pdHRlciIsImVtaXQiLCJnZXRTdGFydCIsInN0YXJ0IiwiZ2V0RW5kIiwiZW5kIiwiZ2V0U3RhcnRUYW5nZW50Iiwic3RhcnRUYW5nZW50IiwiZ2V0RW5kVGFuZ2VudCIsImVuZFRhbmdlbnQiLCJnZXRBY3R1YWxFbmRBbmdsZSIsImNvbXB1dGVBY3R1YWxFbmRBbmdsZSIsImFjdHVhbEVuZEFuZ2xlIiwiZ2V0SXNGdWxsUGVyaW1ldGVyIiwiaXNGdWxsUGVyaW1ldGVyIiwiZ2V0QW5nbGVEaWZmZXJlbmNlIiwiYW5nbGVEaWZmZXJlbmNlIiwiZ2V0Qm91bmRzIiwiTk9USElORyIsImNvcHkiLCJ3aXRoUG9pbnQiLCJpbmNsdWRlQm91bmRzQXRBbmdsZSIsImJvdW5kcyIsImdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cyIsImFuZ2xlIiwiY29udGFpbnNBbmdsZSIsInBsdXMiLCJjcmVhdGVQb2xhciIsIm1hcEFuZ2xlIiwiYWJzIiwibW9kdWxvQmV0d2VlbkRvd24iLCJtb2R1bG9CZXR3ZWVuVXAiLCJ0QXRBbmdsZSIsIm5vcm1hbCIsInBlcnBlbmRpY3VsYXIiLCJuZWdhdGVkIiwibm9ybWFsaXplZEFuZ2xlIiwicG9zaXRpdmVNaW5BbmdsZSIsImdldFNWR1BhdGhGcmFnbWVudCIsIm9sZFBhdGhGcmFnbWVudCIsImVwc2lsb24iLCJzd2VlcEZsYWciLCJsYXJnZUFyY0ZsYWciLCJ4IiwieSIsInNwbGl0T3Bwb3NpdGVBbmdsZSIsInNwbGl0UG9pbnQiLCJmaXJzdEFyYyIsInNlY29uZEFyYyIsInN0cm9rZUxlZnQiLCJsaW5lV2lkdGgiLCJzdHJva2VSaWdodCIsImdldEludGVyaW9yRXh0cmVtYVRzIiwicmVzdWx0IiwiXyIsImVhY2giLCJwdXNoIiwic29ydCIsImludGVyc2VjdGlvbiIsInJheSIsImNlbnRlclRvUmF5IiwicG9zaXRpb24iLCJtaW51cyIsInRtcCIsImRpcmVjdGlvbiIsImRvdCIsImNlbnRlclRvUmF5RGlzdFNxIiwibWFnbml0dWRlU3F1YXJlZCIsImRpc2NyaW1pbmFudCIsImJhc2UiLCJzcXQiLCJzcXJ0IiwidGEiLCJ0YiIsInBvaW50QiIsInBvaW50QXREaXN0YW5jZSIsIm5vcm1hbEIiLCJub3JtYWxpemVkIiwibm9ybWFsQkFuZ2xlIiwicG9pbnRBIiwibm9ybWFsQSIsIm5vcm1hbEFBbmdsZSIsIndpbmRpbmdJbnRlcnNlY3Rpb24iLCJ3aW5kIiwiaGl0cyIsImhpdCIsIndyaXRlVG9Db250ZXh0IiwiY29udGV4dCIsImFyYyIsInRyYW5zZm9ybWVkIiwibWF0cml4IiwidGltZXNWZWN0b3IyIiwiWkVSTyIsImdldERldGVybWluYW50Iiwic2NhbGVWZWN0b3IiLCJnZXRTY2FsZVZlY3RvciIsInJhZGl1c1giLCJyYWRpdXNZIiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwidDAiLCJ0MSIsInNpbiIsImNvcyIsInJldmVyc2VkIiwiZ2V0QXJjTGVuZ3RoIiwidG9QaWVjZXdpc2VMaW5lYXJPckFyY1NlZ21lbnRzIiwic2VyaWFsaXplIiwidHlwZSIsImNlbnRlclgiLCJjZW50ZXJZIiwiZ2V0T3ZlcmxhcHMiLCJzZWdtZW50IiwiZ2V0Q29uaWNNYXRyaXgiLCJhIiwiYiIsIkEiLCJCIiwiQyIsIkQiLCJFIiwiRiIsInJvd01ham9yIiwiZGVzZXJpYWxpemUiLCJvYmoiLCJnZXRQYXJ0aWFsT3ZlcmxhcCIsImVuZDEiLCJzdGFydDIiLCJlbmQyIiwidFN0YXJ0MiIsInRFbmQyIiwicmV2ZXJzZWQyIiwibWluMiIsIm1heDIiLCJvdmVybGFwTWluIiwib3ZlcmxhcE1heCIsIm1pbiIsImNyZWF0ZUxpbmVhciIsImNsYW1wIiwibGluZWFyIiwiZ2V0QW5ndWxhck92ZXJsYXBzIiwic3RhcnRBbmdsZTEiLCJlbmRBbmdsZTEiLCJzdGFydEFuZ2xlMiIsImVuZEFuZ2xlMiIsInNpZ24xIiwid3JhcFQiLCJjb25jYXQiLCJhcmMxIiwiYXJjMiIsImRpc3RhbmNlIiwiZ2V0Q2lyY2xlSW50ZXJzZWN0aW9uUG9pbnQiLCJjZW50ZXIxIiwicmFkaXVzMSIsImNlbnRlcjIiLCJyYWRpdXMyIiwiZGVsdGEiLCJkIiwibWFnbml0dWRlIiwicmVzdWx0cyIsImJsZW5kIiwieFByaW1lIiwiYml0IiwieVByaW1lIiwic2V0TWFnbml0dWRlIiwiZm9yRWFjaCIsImludGVyc2VjdCIsImVxdWFsc0Vwc2lsb24iLCJhU3RhcnQiLCJhRW5kIiwiYlN0YXJ0IiwiYkVuZCIsImF2ZXJhZ2UiLCJwb2ludHMiLCJpIiwibGVuZ3RoIiwicG9pbnQiLCJhbmdsZUEiLCJhbmdsZUIiLCJjcmVhdGVGcm9tUG9pbnRzIiwic3RhcnRQb2ludCIsIm1pZGRsZVBvaW50IiwiZW5kUG9pbnQiLCJjaXJjbGVDZW50ZXJGcm9tUG9pbnRzIiwic3RhcnREaWZmIiwibWlkZGxlRGlmZiIsImVuZERpZmYiLCJtaWRkbGVBbmdsZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGFBQWEsNkJBQTZCO0FBRWpELE9BQU9DLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELFNBQVNDLGFBQWEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLG1CQUFtQixFQUFFQyxTQUFTLFFBQVEsZ0JBQWdCO0FBRTdILGtGQUFrRjtBQUNsRixNQUFNQyxTQUFTQyxLQUFLQyxFQUFFLEdBQUc7QUFZVixJQUFBLEFBQU1DLE1BQU4sTUFBTUEsWUFBWU47SUEwQy9COztHQUVDLEdBQ0QsQUFBT08sVUFBV0MsTUFBZSxFQUFTO1FBQ3hDQyxVQUFVQSxPQUFRRCxPQUFPRSxRQUFRLElBQUksQ0FBQyw2QkFBNkIsRUFBRUYsT0FBT0csUUFBUSxJQUFJO1FBRXhGLElBQUssQ0FBQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsTUFBTSxDQUFFTCxTQUFXO1lBQ3BDLElBQUksQ0FBQ0ksT0FBTyxHQUFHSjtZQUNmLElBQUksQ0FBQ00sVUFBVTtRQUNqQjtRQUNBLE9BQU8sSUFBSSxFQUFFLGlCQUFpQjtJQUNoQztJQUVBLElBQVdOLE9BQVFPLEtBQWMsRUFBRztRQUFFLElBQUksQ0FBQ1IsU0FBUyxDQUFFUTtJQUFTO0lBRS9ELElBQVdQLFNBQWtCO1FBQUUsT0FBTyxJQUFJLENBQUNRLFNBQVM7SUFBSTtJQUd4RDs7R0FFQyxHQUNELEFBQU9BLFlBQXFCO1FBQzFCLE9BQU8sSUFBSSxDQUFDSixPQUFPO0lBQ3JCO0lBR0E7O0dBRUMsR0FDRCxBQUFPSyxVQUFXQyxNQUFjLEVBQVM7UUFDdkNULFVBQVVBLE9BQVFDLFNBQVVRLFNBQVUsQ0FBQyxzQ0FBc0MsRUFBRUEsUUFB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