// Copyright 2013-2024, University of Colorado Boulder
/**
 * An elliptical arc (a continuous sub-part of an ellipse).
 *
 * Additional helpful notes:
 * - http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
 * - http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-ellipse
 *   (note: context.ellipse was removed from the Canvas spec)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import { Arc, BoundsIntersection, kite, Line, RayIntersection, Segment, SegmentIntersection, svgNumber } from '../imports.js';
// constants
const toDegrees = Utils.toDegrees;
const unitCircleConicMatrix = Matrix3.rowMajor(1, 0, 0, 0, 1, 0, 0, 0, -1);
let EllipticalArc = class EllipticalArc extends Segment {
    /**
   * Sets the center of the EllipticalArc.
   */ setCenter(center) {
        assert && assert(center.isFinite(), `EllipticalArc center should be finite: ${center.toString()}`);
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
   * Returns the center of this EllipticalArc.
   */ getCenter() {
        return this._center;
    }
    /**
   * Sets the semi-major radius of the EllipticalArc.
   */ setRadiusX(radiusX) {
        assert && assert(isFinite(radiusX), `EllipticalArc radiusX should be a finite number: ${radiusX}`);
        if (this._radiusX !== radiusX) {
            this._radiusX = radiusX;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set radiusX(value) {
        this.setRadiusX(value);
    }
    get radiusX() {
        return this.getRadiusX();
    }
    /**
   * Returns the semi-major radius of this EllipticalArc.
   */ getRadiusX() {
        return this._radiusX;
    }
    /**
   * Sets the semi-minor radius of the EllipticalArc.
   */ setRadiusY(radiusY) {
        assert && assert(isFinite(radiusY), `EllipticalArc radiusY should be a finite number: ${radiusY}`);
        if (this._radiusY !== radiusY) {
            this._radiusY = radiusY;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set radiusY(value) {
        this.setRadiusY(value);
    }
    get radiusY() {
        return this.getRadiusY();
    }
    /**
   * Returns the semi-minor radius of this EllipticalArc.
   */ getRadiusY() {
        return this._radiusY;
    }
    /**
   * Sets the rotation of the EllipticalArc.
   */ setRotation(rotation) {
        assert && assert(isFinite(rotation), `EllipticalArc rotation should be a finite number: ${rotation}`);
        if (this._rotation !== rotation) {
            this._rotation = rotation;
            this.invalidate();
        }
        return this; // allow chaining
    }
    set rotation(value) {
        this.setRotation(value);
    }
    get rotation() {
        return this.getRotation();
    }
    /**
   * Returns the rotation of this EllipticalArc.
   */ getRotation() {
        return this._rotation;
    }
    /**
   * Sets the startAngle of the EllipticalArc.
   */ setStartAngle(startAngle) {
        assert && assert(isFinite(startAngle), `EllipticalArc startAngle should be a finite number: ${startAngle}`);
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
   * Returns the startAngle of this EllipticalArc.
   */ getStartAngle() {
        return this._startAngle;
    }
    /**
   * Sets the endAngle of the EllipticalArc.
   */ setEndAngle(endAngle) {
        assert && assert(isFinite(endAngle), `EllipticalArc endAngle should be a finite number: ${endAngle}`);
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
   * Returns the endAngle of this EllipticalArc.
   */ getEndAngle() {
        return this._endAngle;
    }
    /**
   * Sets the anticlockwise of the EllipticalArc.
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
   * Returns the anticlockwise of this EllipticalArc.
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
        // see http://mathworld.wolfram.com/Ellipse.html (59)
        const angle = this.angleAt(t);
        const aq = this._radiusX * Math.sin(angle);
        const bq = this._radiusY * Math.cos(angle);
        const denominator = Math.pow(bq * bq + aq * aq, 3 / 2);
        return (this._anticlockwise ? -1 : 1) * this._radiusX * this._radiusY / denominator;
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
            new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, angle0, angleT, this._anticlockwise),
            new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, angleT, angle1, this._anticlockwise)
        ];
    }
    /**
   * Clears cached information, should be called when any of the 'constructor arguments' are mutated.
   */ invalidate() {
        assert && assert(this._center instanceof Vector2, 'Arc center should be a Vector2');
        assert && assert(this._center.isFinite(), 'Arc center should be finite (not NaN or infinite)');
        assert && assert(typeof this._radiusX === 'number', `Arc radiusX should be a number: ${this._radiusX}`);
        assert && assert(isFinite(this._radiusX), `Arc radiusX should be a finite number: ${this._radiusX}`);
        assert && assert(typeof this._radiusY === 'number', `Arc radiusY should be a number: ${this._radiusY}`);
        assert && assert(isFinite(this._radiusY), `Arc radiusY should be a finite number: ${this._radiusY}`);
        assert && assert(typeof this._rotation === 'number', `Arc rotation should be a number: ${this._rotation}`);
        assert && assert(isFinite(this._rotation), `Arc rotation should be a finite number: ${this._rotation}`);
        assert && assert(typeof this._startAngle === 'number', `Arc startAngle should be a number: ${this._startAngle}`);
        assert && assert(isFinite(this._startAngle), `Arc startAngle should be a finite number: ${this._startAngle}`);
        assert && assert(typeof this._endAngle === 'number', `Arc endAngle should be a number: ${this._endAngle}`);
        assert && assert(isFinite(this._endAngle), `Arc endAngle should be a finite number: ${this._endAngle}`);
        assert && assert(typeof this._anticlockwise === 'boolean', `Arc anticlockwise should be a boolean: ${this._anticlockwise}`);
        this._unitTransform = null;
        this._start = null;
        this._end = null;
        this._startTangent = null;
        this._endTangent = null;
        this._actualEndAngle = null;
        this._isFullPerimeter = null;
        this._angleDifference = null;
        this._unitArcSegment = null;
        this._bounds = null;
        this._svgPathFragment = null;
        // remapping of negative radii
        if (this._radiusX < 0) {
            // support this case since we might actually need to handle it inside of strokes?
            this._radiusX = -this._radiusX;
            this._startAngle = Math.PI - this._startAngle;
            this._endAngle = Math.PI - this._endAngle;
            this._anticlockwise = !this._anticlockwise;
        }
        if (this._radiusY < 0) {
            // support this case since we might actually need to handle it inside of strokes?
            this._radiusY = -this._radiusY;
            this._startAngle = -this._startAngle;
            this._endAngle = -this._endAngle;
            this._anticlockwise = !this._anticlockwise;
        }
        if (this._radiusX < this._radiusY) {
            // swap radiusX and radiusY internally for consistent Canvas / SVG output
            this._rotation += Math.PI / 2;
            this._startAngle -= Math.PI / 2;
            this._endAngle -= Math.PI / 2;
            // swap radiusX and radiusY
            const tmpR = this._radiusX;
            this._radiusX = this._radiusY;
            this._radiusY = tmpR;
        }
        if (this._radiusX < this._radiusY) {
            // TODO: check this https://github.com/phetsims/kite/issues/76
            throw new Error('Not verified to work if radiusX < radiusY');
        }
        // constraints shared with Arc
        assert && assert(!(!this._anticlockwise && this._endAngle - this._startAngle <= -Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle <= -Math.PI * 2), 'Not handling elliptical arcs with start/end angles that show differences in-between browser handling');
        assert && assert(!(!this._anticlockwise && this._endAngle - this._startAngle > Math.PI * 2 || this._anticlockwise && this._startAngle - this._endAngle > Math.PI * 2), 'Not handling elliptical arcs with start/end angles that show differences in-between browser handling');
        this.invalidationEmitter.emit();
    }
    /**
   * Computes a transform that maps a unit circle into this ellipse's location.
   *
   * Helpful, since we can get the parametric position of our unit circle (at t), and then transform it with this
   * transform to get the ellipse's parametric position (at t).
   */ getUnitTransform() {
        if (this._unitTransform === null) {
            this._unitTransform = EllipticalArc.computeUnitTransform(this._center, this._radiusX, this._radiusY, this._rotation);
        }
        return this._unitTransform;
    }
    get unitTransform() {
        return this.getUnitTransform();
    }
    /**
   * Gets the start point of this ellipticalArc
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
   * Gets the end point of this ellipticalArc
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
   * Gets the tangent vector (normalized) to this ellipticalArc at the start, pointing in the direction of motion (from start to end)
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
   * Gets the tangent vector (normalized) to this ellipticalArc at the end point, pointing in the direction of motion (from start to end)
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
   * Gets the end angle in radians
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
   * Returns a boolean value that indicates if the arc wraps up by more than two Pi
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
   * Returns an angle difference that represents how "much" of the circle our arc covers
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
   * A unit arg segment that we can map to our ellipse. useful for hit testing and such.
   */ getUnitArcSegment() {
        if (this._unitArcSegment === null) {
            this._unitArcSegment = new Arc(Vector2.ZERO, 1, this._startAngle, this._endAngle, this._anticlockwise);
        }
        return this._unitArcSegment;
    }
    get unitArcSegment() {
        return this.getUnitArcSegment();
    }
    /**
   * Returns the bounds of this segment.
   */ getBounds() {
        if (this._bounds === null) {
            this._bounds = Bounds2.NOTHING.withPoint(this.getStart()).withPoint(this.getEnd());
            // if the angles are different, check extrema points
            if (this._startAngle !== this._endAngle) {
                // solve the mapping from the unit circle, find locations where a coordinate of the gradient is zero.
                // we find one extrema point for both x and y, since the other two are just rotated by pi from them.
                const xAngle = Math.atan(-(this._radiusY / this._radiusX) * Math.tan(this._rotation));
                const yAngle = Math.atan(this._radiusY / this._radiusX / Math.tan(this._rotation));
                // check all of the extrema points
                this.possibleExtremaAngles = [
                    xAngle,
                    xAngle + Math.PI,
                    yAngle,
                    yAngle + Math.PI
                ];
                _.each(this.possibleExtremaAngles, this.includeBoundsAtAngle.bind(this));
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
        if (this._radiusX <= 0 || this._radiusY <= 0 || this._startAngle === this._endAngle) {
            return [];
        } else if (this._radiusX === this._radiusY) {
            // reduce to an Arc
            const startAngle = this._startAngle + this._rotation;
            let endAngle = this._endAngle + this._rotation;
            // preserve full circles
            if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
                endAngle = this._anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
            }
            return [
                new Arc(this._center, this._radiusX, startAngle, endAngle, this._anticlockwise)
            ];
        } else {
            return [
                this
            ];
        }
    }
    /**
   * Attempts to expand the private _bounds bounding box to include a point at a specific angle, making sure that
   * angle is actually included in the arc. This will presumably be called at angles that are at critical points,
   * where the arc should have maximum/minimum x/y values.
   */ includeBoundsAtAngle(angle) {
        if (this.unitArcSegment.containsAngle(angle)) {
            // the boundary point is in the arc
            this._bounds = this._bounds.withPoint(this.positionAtAngle(angle));
        }
    }
    /**
   * Maps a contained angle to between [startAngle,actualEndAngle), even if the end angle is lower.
   *
   * TODO: remove duplication with Arc https://github.com/phetsims/kite/issues/76
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
   *
   * TODO: remove duplication with Arc https://github.com/phetsims/kite/issues/76
   */ tAtAngle(angle) {
        return (this.mapAngle(angle) - this._startAngle) / (this.getActualEndAngle() - this._startAngle);
    }
    /**
   * Returns the angle for the parametrized t value. The t value should range from 0 to 1 (inclusive).
   */ angleAt(t) {
        return this._startAngle + (this.getActualEndAngle() - this._startAngle) * t;
    }
    /**
   * Returns the position of this arc at angle.
   */ positionAtAngle(angle) {
        return this.getUnitTransform().transformPosition2(Vector2.createPolar(1, angle));
    }
    /**
   * Returns the normalized tangent of this arc.
   * The tangent points outward (inward) of this arc for clockwise (anticlockwise) direction.
   */ tangentAtAngle(angle) {
        const normal = this.getUnitTransform().transformNormal2(Vector2.createPolar(1, angle));
        return this._anticlockwise ? normal.perpendicular : normal.perpendicular.negated();
    }
    /**
   * Returns an array of straight lines that will draw an offset on the logical left (right) side for reverse false (true)
   * It discretizes the elliptical arc in 32 segments and returns an offset curve as a list of lineTos/
   *
   * @param r - distance
   * @param reverse
   */ offsetTo(r, reverse) {
        // how many segments to create (possibly make this more adaptive?)
        const quantity = 32;
        const points = [];
        const result = [];
        for(let i = 0; i < quantity; i++){
            let ratio = i / (quantity - 1);
            if (reverse) {
                ratio = 1 - ratio;
            }
            const angle = this.angleAt(ratio);
            points.push(this.positionAtAngle(angle).plus(this.tangentAtAngle(angle).perpendicular.normalized().times(r)));
            if (i > 0) {
                result.push(new Line(points[i - 1], points[i]));
            }
        }
        return result;
    }
    /**
   * Returns a string containing the SVG path. assumes that the start point is already provided,
   * so anything that calls this needs to put the M calls first.
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
            const degreesRotation = toDegrees(this._rotation); // bleh, degrees?
            if (this.getAngleDifference() < Math.PI * 2 - epsilon) {
                largeArcFlag = this.getAngleDifference() < Math.PI ? '0' : '1';
                this._svgPathFragment = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(this.getEnd().x)} ${svgNumber(this.getEnd().y)}`;
            } else {
                // ellipse (or almost-ellipse) case needs to be handled differently
                // since SVG will not be able to draw (or know how to draw) the correct circle if we just have a start and end, we need to split it into two circular arcs
                // get the angle that is between and opposite of both of the points
                const splitOppositeAngle = (this._startAngle + this._endAngle) / 2; // this _should_ work for the modular case?
                const splitPoint = this.positionAtAngle(splitOppositeAngle);
                largeArcFlag = '0'; // since we split it in 2, it's always the small arc
                const firstArc = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(splitPoint.x)} ${svgNumber(splitPoint.y)}`;
                const secondArc = `A ${svgNumber(this._radiusX)} ${svgNumber(this._radiusY)} ${degreesRotation} ${largeArcFlag} ${sweepFlag} ${svgNumber(this.getEnd().x)} ${svgNumber(this.getEnd().y)}`;
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
   * Returns an array of straight lines  that will draw an offset on the logical left side.
   */ strokeLeft(lineWidth) {
        return this.offsetTo(-lineWidth / 2, false);
    }
    /**
   * Returns an array of straight lines that will draw an offset curve on the logical right side.
   */ strokeRight(lineWidth) {
        return this.offsetTo(lineWidth / 2, true);
    }
    /**
   * Returns a list of t values where dx/dt or dy/dt is 0 where 0 < t < 1. subdividing on these will result in monotonic segments
   * Does not include t=0 and t=1.
   */ getInteriorExtremaTs() {
        const result = [];
        _.each(this.possibleExtremaAngles, (angle)=>{
            if (this.unitArcSegment.containsAngle(angle)) {
                const t = this.tAtAngle(angle);
                const epsilon = 0.0000000001; // TODO: general kite epsilon? https://github.com/phetsims/kite/issues/76
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
        // be lazy. transform it into the space of a non-elliptical arc.
        const unitTransform = this.getUnitTransform();
        const rayInUnitCircleSpace = unitTransform.inverseRay2(ray);
        const hits = this.getUnitArcSegment().intersection(rayInUnitCircleSpace);
        return _.map(hits, (hit)=>{
            const transformedPoint = unitTransform.transformPosition2(hit.point);
            const distance = ray.position.distance(transformedPoint);
            const normal = unitTransform.inverseNormal2(hit.normal);
            return new RayIntersection(distance, transformedPoint, normal, hit.wind, hit.t);
        });
    }
    /**
   * Returns the resultant winding number of this ray intersecting this arc.
   */ windingIntersection(ray) {
        // be lazy. transform it into the space of a non-elliptical arc.
        const rayInUnitCircleSpace = this.getUnitTransform().inverseRay2(ray);
        return this.getUnitArcSegment().windingIntersection(rayInUnitCircleSpace);
    }
    /**
   * Draws this arc to the 2D Canvas context, assuming the context's current location is already at the start point
   */ writeToContext(context) {
        if (context.ellipse) {
            context.ellipse(this._center.x, this._center.y, this._radiusX, this._radiusY, this._rotation, this._startAngle, this._endAngle, this._anticlockwise);
        } else {
            // fake the ellipse call by using transforms
            this.getUnitTransform().getMatrix().canvasAppendTransform(context);
            context.arc(0, 0, 1, this._startAngle, this._endAngle, this._anticlockwise);
            this.getUnitTransform().getInverse().canvasAppendTransform(context);
        }
    }
    /**
   * Returns this elliptical arc transformed by a matrix
   */ transformed(matrix) {
        const transformedSemiMajorAxis = matrix.timesVector2(Vector2.createPolar(this._radiusX, this._rotation)).minus(matrix.timesVector2(Vector2.ZERO));
        const transformedSemiMinorAxis = matrix.timesVector2(Vector2.createPolar(this._radiusY, this._rotation + Math.PI / 2)).minus(matrix.timesVector2(Vector2.ZERO));
        const rotation = transformedSemiMajorAxis.angle;
        const radiusX = transformedSemiMajorAxis.magnitude;
        const radiusY = transformedSemiMinorAxis.magnitude;
        const reflected = matrix.getDeterminant() < 0;
        // reverse the 'clockwiseness' if our transform includes a reflection
        // TODO: check reflections. swapping angle signs should fix clockwiseness https://github.com/phetsims/kite/issues/76
        const anticlockwise = reflected ? !this._anticlockwise : this._anticlockwise;
        const startAngle = reflected ? -this._startAngle : this._startAngle;
        let endAngle = reflected ? -this._endAngle : this._endAngle;
        if (Math.abs(this._endAngle - this._startAngle) === Math.PI * 2) {
            endAngle = anticlockwise ? startAngle - Math.PI * 2 : startAngle + Math.PI * 2;
        }
        return new EllipticalArc(matrix.timesVector2(this._center), radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }
    /**
   * Returns the contribution to the signed area computed using Green's Theorem, with P=-y/2 and Q=x/2.
   *
   * NOTE: This is this segment's contribution to the line integral (-y/2 dx + x/2 dy).
   */ getSignedAreaFragment() {
        const t0 = this._startAngle;
        const t1 = this.getActualEndAngle();
        const sin0 = Math.sin(t0);
        const sin1 = Math.sin(t1);
        const cos0 = Math.cos(t0);
        const cos1 = Math.cos(t1);
        // Derived via Mathematica (curve-area.nb)
        return 0.5 * (this._radiusX * this._radiusY * (t1 - t0) + Math.cos(this._rotation) * (this._radiusX * this._center.y * (cos0 - cos1) + this._radiusY * this._center.x * (sin1 - sin0)) + Math.sin(this._rotation) * (this._radiusX * this._center.x * (cos1 - cos0) + this._radiusY * this._center.y * (sin1 - sin0)));
    }
    /**
   * Returns a reversed copy of this segment (mapping the parametrization from [0,1] => [1,0]).
   */ reversed() {
        return new EllipticalArc(this._center, this._radiusX, this._radiusY, this._rotation, this._endAngle, this._startAngle, !this._anticlockwise);
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'EllipticalArc',
            centerX: this._center.x,
            centerY: this._center.y,
            radiusX: this._radiusX,
            radiusY: this._radiusY,
            rotation: this._rotation,
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
        if (segment instanceof EllipticalArc) {
            return EllipticalArc.getOverlaps(this, segment);
        }
        return null;
    }
    /**
   * Returns the matrix representation of the conic section of the ellipse.
   * See https://en.wikipedia.org/wiki/Matrix_representation_of_conic_sections
   */ getConicMatrix() {
        // Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
        // x'^2 + y'^2 = 1      ---- our unit circle
        // (x,y,1) = M * (x',y',1)   ---- our transform matrix
        // C = [ 1, 0, 0, 0, 1, 0, 0, 0, -1 ] --- conic matrix for the unit circle
        // (x',y',1)^T * C * (x',y',1) = 0  --- conic matrix equation for our unit circle
        // ( M^-1 * (x,y,1) )^T * C * M^-1 * (x,y,1) = 0 --- substitute in our transform matrix
        // (x,y,1)^T * ( M^-1^T * C * M^-1 ) * (x,y,1) = 0 --- isolate conic matrix for our ellipse
        // ( M^-1^T * C * M^-1 ) is the conic matrix for our ellipse
        const unitMatrix = EllipticalArc.computeUnitMatrix(this._center, this._radiusX, this._radiusY, this._rotation);
        const invertedUnitMatrix = unitMatrix.inverted();
        return invertedUnitMatrix.transposed().multiplyMatrix(unitCircleConicMatrix).multiplyMatrix(invertedUnitMatrix);
    }
    /**
   * Returns an EllipticalArc from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'EllipticalArc');
        return new EllipticalArc(new Vector2(obj.centerX, obj.centerY), obj.radiusX, obj.radiusY, obj.rotation, obj.startAngle, obj.endAngle, obj.anticlockwise);
    }
    /**
   * Returns what type of overlap is possible based on the center/radii/rotation. We ignore the start/end angles and
   * anticlockwise information, and determine if the FULL ellipses overlap.
   */ static getOverlapType(a, b, epsilon = 1e-4) {
        // Different centers can't overlap continuously
        if (a._center.distance(b._center) < epsilon) {
            const matchingRadii = Math.abs(a._radiusX - b._radiusX) < epsilon && Math.abs(a._radiusY - b._radiusY) < epsilon;
            const oppositeRadii = Math.abs(a._radiusX - b._radiusY) < epsilon && Math.abs(a._radiusY - b._radiusX) < epsilon;
            if (matchingRadii) {
                // Difference between rotations should be an approximate multiple of pi. We add pi/2 before modulo, so the
                // result of that should be ~pi/2 (don't need to check both endpoints)
                if (Math.abs(Utils.moduloBetweenDown(a._rotation - b._rotation + Math.PI / 2, 0, Math.PI) - Math.PI / 2) < epsilon) {
                    return EllipticalArcOverlapType.MATCHING_OVERLAP;
                }
            }
            if (oppositeRadii) {
                // Difference between rotations should be an approximate multiple of pi (with pi/2 added).
                if (Math.abs(Utils.moduloBetweenDown(a._rotation - b._rotation, 0, Math.PI) - Math.PI / 2) < epsilon) {
                    return EllipticalArcOverlapType.OPPOSITE_OVERLAP;
                }
            }
        }
        return EllipticalArcOverlapType.NONE;
    }
    /**
   * Determine whether two elliptical arcs overlap over continuous sections, and if so finds the a,b pairs such that
   * p( t ) === q( a * t + b ).
   *
   * @returns - Any overlaps (from 0 to 2)
   */ static getOverlaps(a, b) {
        const overlapType = EllipticalArc.getOverlapType(a, b);
        if (overlapType === EllipticalArcOverlapType.NONE) {
            return [];
        } else {
            return Arc.getAngularOverlaps(a._startAngle + a._rotation, a.getActualEndAngle() + a._rotation, b._startAngle + b._rotation, b.getActualEndAngle() + b._rotation);
        }
    }
    /**
   * Returns any (finite) intersection between the two elliptical arc segments.
   */ static intersect(a, b, epsilon = 1e-10) {
        const overlapType = EllipticalArc.getOverlapType(a, b, epsilon);
        if (overlapType === EllipticalArcOverlapType.NONE) {
            return BoundsIntersection.intersect(a, b);
        } else {
            // If we effectively have the same ellipse, just different sections of it. The only finite intersections could be
            // at the endpoints, so we'll inspect those.
            const results = [];
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
            return results;
        }
    }
    /**
   * Matrix that transforms the unit circle into our ellipse
   */ static computeUnitMatrix(center, radiusX, radiusY, rotation) {
        return Matrix3.translationFromVector(center).timesMatrix(Matrix3.rotation2(rotation)).timesMatrix(Matrix3.scaling(radiusX, radiusY));
    }
    /**
   * Transforms the unit circle into our ellipse.
   *
   * adapted from http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
   */ static computeUnitTransform(center, radiusX, radiusY, rotation) {
        return new Transform3(EllipticalArc.computeUnitMatrix(center, radiusX, radiusY, rotation));
    }
    /**
   * If the startAngle/endAngle difference is ~2pi, this will be a full ellipse
   *
   * @param center - Center of the ellipse
   * @param radiusX - Semi-major radius
   * @param radiusY - Semi-minor radius
   * @param rotation - Rotation of the semi-major axis
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param anticlockwise - Decides which direction the arc takes around the center
   */ constructor(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise){
        super();
        this._center = center;
        this._radiusX = radiusX;
        this._radiusY = radiusY;
        this._rotation = rotation;
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._anticlockwise = anticlockwise;
        this.invalidate();
    }
};
export { EllipticalArc as default };
export class EllipticalArcOverlapType extends EnumerationValue {
}
// radiusX of one equals radiusX of the other, with equivalent centers and rotations to work
EllipticalArcOverlapType.MATCHING_OVERLAP = new EllipticalArcOverlapType();
// radiusX of one equals radiusY of the other, with equivalent centers and rotations to work
EllipticalArcOverlapType.OPPOSITE_OVERLAP = new EllipticalArcOverlapType();
// no overlap
EllipticalArcOverlapType.NONE = new EllipticalArcOverlapType();
EllipticalArcOverlapType.enumeration = new Enumeration(EllipticalArcOverlapType);
kite.register('EllipticalArc', EllipticalArc);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvRWxsaXB0aWNhbEFyYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBlbGxpcHRpY2FsIGFyYyAoYSBjb250aW51b3VzIHN1Yi1wYXJ0IG9mIGFuIGVsbGlwc2UpLlxuICpcbiAqIEFkZGl0aW9uYWwgaGVscGZ1bCBub3RlczpcbiAqIC0gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2ltcGxub3RlLmh0bWwjUGF0aEVsZW1lbnRJbXBsZW1lbnRhdGlvbk5vdGVzXG4gKiAtIGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS1jYW52YXMtZWxlbWVudC5odG1sI2RvbS1jb250ZXh0LTJkLWVsbGlwc2VcbiAqICAgKG5vdGU6IGNvbnRleHQuZWxsaXBzZSB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBDYW52YXMgc3BlYylcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JheTIuanMnO1xuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCB7IEFyYywgQm91bmRzSW50ZXJzZWN0aW9uLCBraXRlLCBMaW5lLCBPdmVybGFwLCBSYXlJbnRlcnNlY3Rpb24sIFNlZ21lbnQsIFNlZ21lbnRJbnRlcnNlY3Rpb24sIHN2Z051bWJlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IHRvRGVncmVlcyA9IFV0aWxzLnRvRGVncmVlcztcblxuY29uc3QgdW5pdENpcmNsZUNvbmljTWF0cml4ID0gTWF0cml4My5yb3dNYWpvcihcbiAgMSwgMCwgMCxcbiAgMCwgMSwgMCxcbiAgMCwgMCwgLTFcbik7XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRFbGxpcHRpY2FsQXJjID0ge1xuICB0eXBlOiAnRWxsaXB0aWNhbEFyYyc7XG4gIGNlbnRlclg6IG51bWJlcjtcbiAgY2VudGVyWTogbnVtYmVyO1xuICByYWRpdXNYOiBudW1iZXI7XG4gIHJhZGl1c1k6IG51bWJlcjtcbiAgcm90YXRpb246IG51bWJlcjtcbiAgc3RhcnRBbmdsZTogbnVtYmVyO1xuICBlbmRBbmdsZTogbnVtYmVyO1xuICBhbnRpY2xvY2t3aXNlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxsaXB0aWNhbEFyYyBleHRlbmRzIFNlZ21lbnQge1xuXG4gIHByaXZhdGUgX2NlbnRlcjogVmVjdG9yMjtcbiAgcHJpdmF0ZSBfcmFkaXVzWDogbnVtYmVyO1xuICBwcml2YXRlIF9yYWRpdXNZOiBudW1iZXI7XG4gIHByaXZhdGUgX3JvdGF0aW9uOiBudW1iZXI7XG4gIHByaXZhdGUgX3N0YXJ0QW5nbGU6IG51bWJlcjtcbiAgcHJpdmF0ZSBfZW5kQW5nbGU6IG51bWJlcjtcbiAgcHJpdmF0ZSBfYW50aWNsb2Nrd2lzZTogYm9vbGVhbjtcblxuICAvLyBMYXppbHktY29tcHV0ZWQgZGVyaXZlZCBpbmZvcm1hdGlvblxuICBwcml2YXRlIF91bml0VHJhbnNmb3JtITogVHJhbnNmb3JtMyB8IG51bGw7IC8vIE1hcHBpbmcgYmV0d2VlbiBvdXIgZWxsaXBzZSBhbmQgYSB1bml0IGNpcmNsZVxuICBwcml2YXRlIF9zdGFydCE6IFZlY3RvcjIgfCBudWxsO1xuICBwcml2YXRlIF9lbmQhOiBWZWN0b3IyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfc3RhcnRUYW5nZW50ITogVmVjdG9yMiB8IG51bGw7XG4gIHByaXZhdGUgX2VuZFRhbmdlbnQhOiBWZWN0b3IyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfYWN0dWFsRW5kQW5nbGUhOiBudW1iZXIgfCBudWxsOyAvLyBFbmQgYW5nbGUgaW4gcmVsYXRpb24gdG8gb3VyIHN0YXJ0IGFuZ2xlIChjYW4gZ2V0IHJlbWFwcGVkKVxuICBwcml2YXRlIF9pc0Z1bGxQZXJpbWV0ZXIhOiBib29sZWFuIHwgbnVsbDsgLy8gV2hldGhlciBpdCdzIGEgZnVsbCBlbGxpcHNlIChhbmQgbm90IGp1c3QgYW4gYXJjKVxuICBwcml2YXRlIF9hbmdsZURpZmZlcmVuY2UhOiBudW1iZXIgfCBudWxsO1xuICBwcml2YXRlIF91bml0QXJjU2VnbWVudCE6IEFyYyB8IG51bGw7IC8vIENvcnJlc3BvbmRpbmcgY2lyY3VsYXIgYXJjIGZvciBvdXIgdW5pdCB0cmFuc2Zvcm0uXG4gIHByaXZhdGUgX2JvdW5kcyE6IEJvdW5kczIgfCBudWxsO1xuICBwcml2YXRlIF9zdmdQYXRoRnJhZ21lbnQhOiBzdHJpbmcgfCBudWxsO1xuXG4gIHByaXZhdGUgcG9zc2libGVFeHRyZW1hQW5nbGVzPzogbnVtYmVyW107XG5cbiAgLyoqXG4gICAqIElmIHRoZSBzdGFydEFuZ2xlL2VuZEFuZ2xlIGRpZmZlcmVuY2UgaXMgfjJwaSwgdGhpcyB3aWxsIGJlIGEgZnVsbCBlbGxpcHNlXG4gICAqXG4gICAqIEBwYXJhbSBjZW50ZXIgLSBDZW50ZXIgb2YgdGhlIGVsbGlwc2VcbiAgICogQHBhcmFtIHJhZGl1c1ggLSBTZW1pLW1ham9yIHJhZGl1c1xuICAgKiBAcGFyYW0gcmFkaXVzWSAtIFNlbWktbWlub3IgcmFkaXVzXG4gICAqIEBwYXJhbSByb3RhdGlvbiAtIFJvdGF0aW9uIG9mIHRoZSBzZW1pLW1ham9yIGF4aXNcbiAgICogQHBhcmFtIHN0YXJ0QW5nbGUgLSBBbmdsZSAocmFkaWFucykgb2YgdGhlIHN0YXJ0IG9mIHRoZSBhcmNcbiAgICogQHBhcmFtIGVuZEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBlbmQgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gYW50aWNsb2Nrd2lzZSAtIERlY2lkZXMgd2hpY2ggZGlyZWN0aW9uIHRoZSBhcmMgdGFrZXMgYXJvdW5kIHRoZSBjZW50ZXJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY2VudGVyOiBWZWN0b3IyLCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciwgc3RhcnRBbmdsZTogbnVtYmVyLCBlbmRBbmdsZTogbnVtYmVyLCBhbnRpY2xvY2t3aXNlOiBib29sZWFuICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9jZW50ZXIgPSBjZW50ZXI7XG4gICAgdGhpcy5fcmFkaXVzWCA9IHJhZGl1c1g7XG4gICAgdGhpcy5fcmFkaXVzWSA9IHJhZGl1c1k7XG4gICAgdGhpcy5fcm90YXRpb24gPSByb3RhdGlvbjtcbiAgICB0aGlzLl9zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICB0aGlzLl9lbmRBbmdsZSA9IGVuZEFuZ2xlO1xuICAgIHRoaXMuX2FudGljbG9ja3dpc2UgPSBhbnRpY2xvY2t3aXNlO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2VudGVyIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIHNldENlbnRlciggY2VudGVyOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbnRlci5pc0Zpbml0ZSgpLCBgRWxsaXB0aWNhbEFyYyBjZW50ZXIgc2hvdWxkIGJlIGZpbml0ZTogJHtjZW50ZXIudG9TdHJpbmcoKX1gICk7XG5cbiAgICBpZiAoICF0aGlzLl9jZW50ZXIuZXF1YWxzKCBjZW50ZXIgKSApIHtcbiAgICAgIHRoaXMuX2NlbnRlciA9IGNlbnRlcjtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHsgdGhpcy5zZXRDZW50ZXIoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGNlbnRlcigpOiBWZWN0b3IyIHsgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyKCk7IH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhpcyBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5fY2VudGVyO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgc2VtaS1tYWpvciByYWRpdXMgb2YgdGhlIEVsbGlwdGljYWxBcmMuXG4gICAqL1xuICBwdWJsaWMgc2V0UmFkaXVzWCggcmFkaXVzWDogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCByYWRpdXNYICksIGBFbGxpcHRpY2FsQXJjIHJhZGl1c1ggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHtyYWRpdXNYfWAgKTtcblxuICAgIGlmICggdGhpcy5fcmFkaXVzWCAhPT0gcmFkaXVzWCApIHtcbiAgICAgIHRoaXMuX3JhZGl1c1ggPSByYWRpdXNYO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCByYWRpdXNYKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldFJhZGl1c1goIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHJhZGl1c1goKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0UmFkaXVzWCgpOyB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2VtaS1tYWpvciByYWRpdXMgb2YgdGhpcyBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIGdldFJhZGl1c1goKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcmFkaXVzWDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNlbWktbWlub3IgcmFkaXVzIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIHNldFJhZGl1c1koIHJhZGl1c1k6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcmFkaXVzWSApLCBgRWxsaXB0aWNhbEFyYyByYWRpdXNZIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7cmFkaXVzWX1gICk7XG5cbiAgICBpZiAoIHRoaXMuX3JhZGl1c1kgIT09IHJhZGl1c1kgKSB7XG4gICAgICB0aGlzLl9yYWRpdXNZID0gcmFkaXVzWTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmFkaXVzWSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSYWRpdXNZKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCByYWRpdXNZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFJhZGl1c1koKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzZW1pLW1pbm9yIHJhZGl1cyBvZiB0aGlzIEVsbGlwdGljYWxBcmMuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmFkaXVzWSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9yYWRpdXNZO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0cyB0aGUgcm90YXRpb24gb2YgdGhlIEVsbGlwdGljYWxBcmMuXG4gICAqL1xuICBwdWJsaWMgc2V0Um90YXRpb24oIHJvdGF0aW9uOiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHJvdGF0aW9uICksIGBFbGxpcHRpY2FsQXJjIHJvdGF0aW9uIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7cm90YXRpb259YCApO1xuXG4gICAgaWYgKCB0aGlzLl9yb3RhdGlvbiAhPT0gcm90YXRpb24gKSB7XG4gICAgICB0aGlzLl9yb3RhdGlvbiA9IHJvdGF0aW9uO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgcHVibGljIHNldCByb3RhdGlvbiggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRSb3RhdGlvbiggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgcm90YXRpb24oKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0Um90YXRpb24oKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByb3RhdGlvbiBvZiB0aGlzIEVsbGlwdGljYWxBcmMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Um90YXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcm90YXRpb247XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBzdGFydEFuZ2xlIG9mIHRoZSBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIHNldFN0YXJ0QW5nbGUoIHN0YXJ0QW5nbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggc3RhcnRBbmdsZSApLCBgRWxsaXB0aWNhbEFyYyBzdGFydEFuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7c3RhcnRBbmdsZX1gICk7XG5cbiAgICBpZiAoIHRoaXMuX3N0YXJ0QW5nbGUgIT09IHN0YXJ0QW5nbGUgKSB7XG4gICAgICB0aGlzLl9zdGFydEFuZ2xlID0gc3RhcnRBbmdsZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3RhcnRBbmdsZSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRTdGFydEFuZ2xlKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBzdGFydEFuZ2xlKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldFN0YXJ0QW5nbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdGFydEFuZ2xlIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRTdGFydEFuZ2xlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0QW5nbGU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBlbmRBbmdsZSBvZiB0aGUgRWxsaXB0aWNhbEFyYy5cbiAgICovXG4gIHB1YmxpYyBzZXRFbmRBbmdsZSggZW5kQW5nbGU6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggZW5kQW5nbGUgKSwgYEVsbGlwdGljYWxBcmMgZW5kQW5nbGUgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHtlbmRBbmdsZX1gICk7XG5cbiAgICBpZiAoIHRoaXMuX2VuZEFuZ2xlICE9PSBlbmRBbmdsZSApIHtcbiAgICAgIHRoaXMuX2VuZEFuZ2xlID0gZW5kQW5nbGU7XG4gICAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0IGVuZEFuZ2xlKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEVuZEFuZ2xlKCB2YWx1ZSApOyB9XG5cbiAgcHVibGljIGdldCBlbmRBbmdsZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRFbmRBbmdsZSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVuZEFuZ2xlIG9mIHRoaXMgRWxsaXB0aWNhbEFyYy5cbiAgICovXG4gIHB1YmxpYyBnZXRFbmRBbmdsZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9lbmRBbmdsZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFudGljbG9ja3dpc2Ugb2YgdGhlIEVsbGlwdGljYWxBcmMuXG4gICAqL1xuICBwdWJsaWMgc2V0QW50aWNsb2Nrd2lzZSggYW50aWNsb2Nrd2lzZTogYm9vbGVhbiApOiB0aGlzIHtcbiAgICBpZiAoIHRoaXMuX2FudGljbG9ja3dpc2UgIT09IGFudGljbG9ja3dpc2UgKSB7XG4gICAgICB0aGlzLl9hbnRpY2xvY2t3aXNlID0gYW50aWNsb2Nrd2lzZTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYW50aWNsb2Nrd2lzZSggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0QW50aWNsb2Nrd2lzZSggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgYW50aWNsb2Nrd2lzZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0QW50aWNsb2Nrd2lzZSgpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFudGljbG9ja3dpc2Ugb2YgdGhpcyBFbGxpcHRpY2FsQXJjLlxuICAgKi9cbiAgcHVibGljIGdldEFudGljbG9ja3dpc2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FudGljbG9ja3dpc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBwYXJhbWV0cmljYWxseSwgd2l0aCAwIDw9IHQgPD0gMS5cbiAgICpcbiAgICogTk9URTogcG9zaXRpb25BdCggMCApIHdpbGwgcmV0dXJuIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIHBvc2l0aW9uQXQoIDEgKSB3aWxsIHJldHVybiB0aGUgZW5kIG9mIHRoZVxuICAgKiBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBwb3NpdGlvbkF0KCB0OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAncG9zaXRpb25BdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uQXRBbmdsZSggdGhpcy5hbmdsZUF0KCB0ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBub24tbm9ybWFsaXplZCB0YW5nZW50IChkeC9kdCwgZHkvZHQpIG9mIHRoaXMgc2VnbWVudCBhdCB0aGUgcGFyYW1ldHJpYyB2YWx1ZSBvZiB0LCB3aXRoIDAgPD0gdCA8PSAxLlxuICAgKlxuICAgKiBOT1RFOiB0YW5nZW50QXQoIDAgKSB3aWxsIHJldHVybiB0aGUgdGFuZ2VudCBhdCB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQsIGFuZCB0YW5nZW50QXQoIDEgKSB3aWxsIHJldHVybiB0aGVcbiAgICogdGFuZ2VudCBhdCB0aGUgZW5kIG9mIHRoZSBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyB0YW5nZW50QXQoIHQ6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0ID49IDAsICd0YW5nZW50QXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ3RhbmdlbnRBdCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIHJldHVybiB0aGlzLnRhbmdlbnRBdEFuZ2xlKCB0aGlzLmFuZ2xlQXQoIHQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNpZ25lZCBjdXJ2YXR1cmUgb2YgdGhlIHNlZ21lbnQgYXQgdGhlIHBhcmFtZXRyaWMgdmFsdWUgdCwgd2hlcmUgMCA8PSB0IDw9IDEuXG4gICAqXG4gICAqIFRoZSBjdXJ2YXR1cmUgd2lsbCBiZSBwb3NpdGl2ZSBmb3IgdmlzdWFsIGNsb2Nrd2lzZSAvIG1hdGhlbWF0aWNhbCBjb3VudGVyY2xvY2t3aXNlIGN1cnZlcywgbmVnYXRpdmUgZm9yIG9wcG9zaXRlXG4gICAqIGN1cnZhdHVyZSwgYW5kIDAgZm9yIG5vIGN1cnZhdHVyZS5cbiAgICpcbiAgICogTk9URTogY3VydmF0dXJlQXQoIDAgKSB3aWxsIHJldHVybiB0aGUgY3VydmF0dXJlIGF0IHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudCwgYW5kIGN1cnZhdHVyZUF0KCAxICkgd2lsbCByZXR1cm5cbiAgICogdGhlIGN1cnZhdHVyZSBhdCB0aGUgZW5kIG9mIHRoZSBzZWdtZW50LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBwYXJ0IG9mIHRoZSBTZWdtZW50IEFQSS4gU2VlIFNlZ21lbnQuanMncyBjb25zdHJ1Y3RvciBmb3IgbW9yZSBBUEkgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBjdXJ2YXR1cmVBdCggdDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnY3VydmF0dXJlQXQgdCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPD0gMSwgJ2N1cnZhdHVyZUF0IHQgc2hvdWxkIGJlIG5vIGdyZWF0ZXIgdGhhbiAxJyApO1xuXG4gICAgLy8gc2VlIGh0dHA6Ly9tYXRod29ybGQud29sZnJhbS5jb20vRWxsaXBzZS5odG1sICg1OSlcbiAgICBjb25zdCBhbmdsZSA9IHRoaXMuYW5nbGVBdCggdCApO1xuICAgIGNvbnN0IGFxID0gdGhpcy5fcmFkaXVzWCAqIE1hdGguc2luKCBhbmdsZSApO1xuICAgIGNvbnN0IGJxID0gdGhpcy5fcmFkaXVzWSAqIE1hdGguY29zKCBhbmdsZSApO1xuICAgIGNvbnN0IGRlbm9taW5hdG9yID0gTWF0aC5wb3coIGJxICogYnEgKyBhcSAqIGFxLCAzIC8gMiApO1xuICAgIHJldHVybiAoIHRoaXMuX2FudGljbG9ja3dpc2UgPyAtMSA6IDEgKSAqIHRoaXMuX3JhZGl1c1ggKiB0aGlzLl9yYWRpdXNZIC8gZGVub21pbmF0b3I7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSB3aXRoIHVwIHRvIDIgc3ViLXNlZ21lbnRzLCBzcGxpdCBhdCB0aGUgcGFyYW1ldHJpYyB0IHZhbHVlLiBUb2dldGhlciAoaW4gb3JkZXIpIHRoZXkgc2hvdWxkIG1ha2VcbiAgICogdXAgdGhlIHNhbWUgc2hhcGUgYXMgdGhlIGN1cnJlbnQgc2VnbWVudC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgcGFydCBvZiB0aGUgU2VnbWVudCBBUEkuIFNlZSBTZWdtZW50LmpzJ3MgY29uc3RydWN0b3IgZm9yIG1vcmUgQVBJIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3ViZGl2aWRlZCggdDogbnVtYmVyICk6IEVsbGlwdGljYWxBcmNbXSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAwLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA8PSAxLCAnc3ViZGl2aWRlZCB0IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIC8vIElmIHQgaXMgMCBvciAxLCB3ZSBvbmx5IG5lZWQgdG8gcmV0dXJuIDEgc2VnbWVudFxuICAgIGlmICggdCA9PT0gMCB8fCB0ID09PSAxICkge1xuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHZlcmlmeSB0aGF0IHdlIGRvbid0IG5lZWQgdG8gc3dpdGNoIGFudGljbG9ja3dpc2UgaGVyZSwgb3Igc3VidHJhY3QgMnBpIG9mZiBhbnkgYW5nbGVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IGFuZ2xlMCA9IHRoaXMuYW5nbGVBdCggMCApO1xuICAgIGNvbnN0IGFuZ2xlVCA9IHRoaXMuYW5nbGVBdCggdCApO1xuICAgIGNvbnN0IGFuZ2xlMSA9IHRoaXMuYW5nbGVBdCggMSApO1xuICAgIHJldHVybiBbXG4gICAgICBuZXcgRWxsaXB0aWNhbEFyYyggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXNYLCB0aGlzLl9yYWRpdXNZLCB0aGlzLl9yb3RhdGlvbiwgYW5nbGUwLCBhbmdsZVQsIHRoaXMuX2FudGljbG9ja3dpc2UgKSxcbiAgICAgIG5ldyBFbGxpcHRpY2FsQXJjKCB0aGlzLl9jZW50ZXIsIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JhZGl1c1ksIHRoaXMuX3JvdGF0aW9uLCBhbmdsZVQsIGFuZ2xlMSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApXG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgY2FjaGVkIGluZm9ybWF0aW9uLCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gYW55IG9mIHRoZSAnY29uc3RydWN0b3IgYXJndW1lbnRzJyBhcmUgbXV0YXRlZC5cbiAgICovXG4gIHB1YmxpYyBpbnZhbGlkYXRlKCk6IHZvaWQge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fY2VudGVyIGluc3RhbmNlb2YgVmVjdG9yMiwgJ0FyYyBjZW50ZXIgc2hvdWxkIGJlIGEgVmVjdG9yMicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jZW50ZXIuaXNGaW5pdGUoKSwgJ0FyYyBjZW50ZXIgc2hvdWxkIGJlIGZpbml0ZSAobm90IE5hTiBvciBpbmZpbml0ZSknICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3JhZGl1c1ggPT09ICdudW1iZXInLCBgQXJjIHJhZGl1c1ggc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMuX3JhZGl1c1h9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9yYWRpdXNYICksIGBBcmMgcmFkaXVzWCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX3JhZGl1c1h9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9yYWRpdXNZID09PSAnbnVtYmVyJywgYEFyYyByYWRpdXNZIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9yYWRpdXNZfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fcmFkaXVzWSApLCBgQXJjIHJhZGl1c1kgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHt0aGlzLl9yYWRpdXNZfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fcm90YXRpb24gPT09ICdudW1iZXInLCBgQXJjIHJvdGF0aW9uIHNob3VsZCBiZSBhIG51bWJlcjogJHt0aGlzLl9yb3RhdGlvbn1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHRoaXMuX3JvdGF0aW9uICksIGBBcmMgcm90YXRpb24gc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcjogJHt0aGlzLl9yb3RhdGlvbn1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMuX3N0YXJ0QW5nbGUgPT09ICdudW1iZXInLCBgQXJjIHN0YXJ0QW5nbGUgc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMuX3N0YXJ0QW5nbGV9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLl9zdGFydEFuZ2xlICksIGBBcmMgc3RhcnRBbmdsZSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX3N0YXJ0QW5nbGV9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9lbmRBbmdsZSA9PT0gJ251bWJlcicsIGBBcmMgZW5kQW5nbGUgc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMuX2VuZEFuZ2xlfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5fZW5kQW5nbGUgKSwgYEFyYyBlbmRBbmdsZSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMuX2VuZEFuZ2xlfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgdGhpcy5fYW50aWNsb2Nrd2lzZSA9PT0gJ2Jvb2xlYW4nLCBgQXJjIGFudGljbG9ja3dpc2Ugc2hvdWxkIGJlIGEgYm9vbGVhbjogJHt0aGlzLl9hbnRpY2xvY2t3aXNlfWAgKTtcblxuICAgIHRoaXMuX3VuaXRUcmFuc2Zvcm0gPSBudWxsO1xuICAgIHRoaXMuX3N0YXJ0ID0gbnVsbDtcbiAgICB0aGlzLl9lbmQgPSBudWxsO1xuICAgIHRoaXMuX3N0YXJ0VGFuZ2VudCA9IG51bGw7XG4gICAgdGhpcy5fZW5kVGFuZ2VudCA9IG51bGw7XG4gICAgdGhpcy5fYWN0dWFsRW5kQW5nbGUgPSBudWxsO1xuICAgIHRoaXMuX2lzRnVsbFBlcmltZXRlciA9IG51bGw7XG4gICAgdGhpcy5fYW5nbGVEaWZmZXJlbmNlID0gbnVsbDtcbiAgICB0aGlzLl91bml0QXJjU2VnbWVudCA9IG51bGw7XG4gICAgdGhpcy5fYm91bmRzID0gbnVsbDtcbiAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBudWxsO1xuXG4gICAgLy8gcmVtYXBwaW5nIG9mIG5lZ2F0aXZlIHJhZGlpXG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYIDwgMCApIHtcbiAgICAgIC8vIHN1cHBvcnQgdGhpcyBjYXNlIHNpbmNlIHdlIG1pZ2h0IGFjdHVhbGx5IG5lZWQgdG8gaGFuZGxlIGl0IGluc2lkZSBvZiBzdHJva2VzP1xuICAgICAgdGhpcy5fcmFkaXVzWCA9IC10aGlzLl9yYWRpdXNYO1xuICAgICAgdGhpcy5fc3RhcnRBbmdsZSA9IE1hdGguUEkgLSB0aGlzLl9zdGFydEFuZ2xlO1xuICAgICAgdGhpcy5fZW5kQW5nbGUgPSBNYXRoLlBJIC0gdGhpcy5fZW5kQW5nbGU7XG4gICAgICB0aGlzLl9hbnRpY2xvY2t3aXNlID0gIXRoaXMuX2FudGljbG9ja3dpc2U7XG4gICAgfVxuICAgIGlmICggdGhpcy5fcmFkaXVzWSA8IDAgKSB7XG4gICAgICAvLyBzdXBwb3J0IHRoaXMgY2FzZSBzaW5jZSB3ZSBtaWdodCBhY3R1YWxseSBuZWVkIHRvIGhhbmRsZSBpdCBpbnNpZGUgb2Ygc3Ryb2tlcz9cbiAgICAgIHRoaXMuX3JhZGl1c1kgPSAtdGhpcy5fcmFkaXVzWTtcbiAgICAgIHRoaXMuX3N0YXJ0QW5nbGUgPSAtdGhpcy5fc3RhcnRBbmdsZTtcbiAgICAgIHRoaXMuX2VuZEFuZ2xlID0gLXRoaXMuX2VuZEFuZ2xlO1xuICAgICAgdGhpcy5fYW50aWNsb2Nrd2lzZSA9ICF0aGlzLl9hbnRpY2xvY2t3aXNlO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuX3JhZGl1c1ggPCB0aGlzLl9yYWRpdXNZICkge1xuICAgICAgLy8gc3dhcCByYWRpdXNYIGFuZCByYWRpdXNZIGludGVybmFsbHkgZm9yIGNvbnNpc3RlbnQgQ2FudmFzIC8gU1ZHIG91dHB1dFxuICAgICAgdGhpcy5fcm90YXRpb24gKz0gTWF0aC5QSSAvIDI7XG4gICAgICB0aGlzLl9zdGFydEFuZ2xlIC09IE1hdGguUEkgLyAyO1xuICAgICAgdGhpcy5fZW5kQW5nbGUgLT0gTWF0aC5QSSAvIDI7XG5cbiAgICAgIC8vIHN3YXAgcmFkaXVzWCBhbmQgcmFkaXVzWVxuICAgICAgY29uc3QgdG1wUiA9IHRoaXMuX3JhZGl1c1g7XG4gICAgICB0aGlzLl9yYWRpdXNYID0gdGhpcy5fcmFkaXVzWTtcbiAgICAgIHRoaXMuX3JhZGl1c1kgPSB0bXBSO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5fcmFkaXVzWCA8IHRoaXMuX3JhZGl1c1kgKSB7XG4gICAgICAvLyBUT0RPOiBjaGVjayB0aGlzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnTm90IHZlcmlmaWVkIHRvIHdvcmsgaWYgcmFkaXVzWCA8IHJhZGl1c1knICk7XG4gICAgfVxuXG4gICAgLy8gY29uc3RyYWludHMgc2hhcmVkIHdpdGggQXJjXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggKCAhdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9lbmRBbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUgPD0gLU1hdGguUEkgKiAyICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuX2FudGljbG9ja3dpc2UgJiYgdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlIDw9IC1NYXRoLlBJICogMiApICksXG4gICAgICAnTm90IGhhbmRsaW5nIGVsbGlwdGljYWwgYXJjcyB3aXRoIHN0YXJ0L2VuZCBhbmdsZXMgdGhhdCBzaG93IGRpZmZlcmVuY2VzIGluLWJldHdlZW4gYnJvd3NlciBoYW5kbGluZycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCAoICF0aGlzLl9hbnRpY2xvY2t3aXNlICYmIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSA+IE1hdGguUEkgKiAyICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuX2FudGljbG9ja3dpc2UgJiYgdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlID4gTWF0aC5QSSAqIDIgKSApLFxuICAgICAgJ05vdCBoYW5kbGluZyBlbGxpcHRpY2FsIGFyY3Mgd2l0aCBzdGFydC9lbmQgYW5nbGVzIHRoYXQgc2hvdyBkaWZmZXJlbmNlcyBpbi1iZXR3ZWVuIGJyb3dzZXIgaGFuZGxpbmcnICk7XG5cbiAgICB0aGlzLmludmFsaWRhdGlvbkVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgdHJhbnNmb3JtIHRoYXQgbWFwcyBhIHVuaXQgY2lyY2xlIGludG8gdGhpcyBlbGxpcHNlJ3MgbG9jYXRpb24uXG4gICAqXG4gICAqIEhlbHBmdWwsIHNpbmNlIHdlIGNhbiBnZXQgdGhlIHBhcmFtZXRyaWMgcG9zaXRpb24gb2Ygb3VyIHVuaXQgY2lyY2xlIChhdCB0KSwgYW5kIHRoZW4gdHJhbnNmb3JtIGl0IHdpdGggdGhpc1xuICAgKiB0cmFuc2Zvcm0gdG8gZ2V0IHRoZSBlbGxpcHNlJ3MgcGFyYW1ldHJpYyBwb3NpdGlvbiAoYXQgdCkuXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5pdFRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHtcbiAgICBpZiAoIHRoaXMuX3VuaXRUcmFuc2Zvcm0gPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl91bml0VHJhbnNmb3JtID0gRWxsaXB0aWNhbEFyYy5jb21wdXRlVW5pdFRyYW5zZm9ybSggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXNYLCB0aGlzLl9yYWRpdXNZLCB0aGlzLl9yb3RhdGlvbiApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdW5pdFRyYW5zZm9ybTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdW5pdFRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHsgcmV0dXJuIHRoaXMuZ2V0VW5pdFRyYW5zZm9ybSgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHN0YXJ0IHBvaW50IG9mIHRoaXMgZWxsaXB0aWNhbEFyY1xuICAgKi9cbiAgcHVibGljIGdldFN0YXJ0KCk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5fc3RhcnQgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9zdGFydCA9IHRoaXMucG9zaXRpb25BdEFuZ2xlKCB0aGlzLl9zdGFydEFuZ2xlICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGFydDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3RhcnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFN0YXJ0KCk7IH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZW5kIHBvaW50IG9mIHRoaXMgZWxsaXB0aWNhbEFyY1xuICAgKi9cbiAgcHVibGljIGdldEVuZCgpOiBWZWN0b3IyIHtcbiAgICBpZiAoIHRoaXMuX2VuZCA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuX2VuZCA9IHRoaXMucG9zaXRpb25BdEFuZ2xlKCB0aGlzLl9lbmRBbmdsZSApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW5kO1xuICB9XG5cbiAgcHVibGljIGdldCBlbmQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldEVuZCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRhbmdlbnQgdmVjdG9yIChub3JtYWxpemVkKSB0byB0aGlzIGVsbGlwdGljYWxBcmMgYXQgdGhlIHN0YXJ0LCBwb2ludGluZyBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiAoZnJvbSBzdGFydCB0byBlbmQpXG4gICAqL1xuICBwdWJsaWMgZ2V0U3RhcnRUYW5nZW50KCk6IFZlY3RvcjIge1xuICAgIGlmICggdGhpcy5fc3RhcnRUYW5nZW50ID09PSBudWxsICkge1xuICAgICAgdGhpcy5fc3RhcnRUYW5nZW50ID0gdGhpcy50YW5nZW50QXRBbmdsZSggdGhpcy5fc3RhcnRBbmdsZSApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3RhcnRUYW5nZW50O1xuICB9XG5cbiAgcHVibGljIGdldCBzdGFydFRhbmdlbnQoKTogVmVjdG9yMiB7IHJldHVybiB0aGlzLmdldFN0YXJ0VGFuZ2VudCgpOyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRhbmdlbnQgdmVjdG9yIChub3JtYWxpemVkKSB0byB0aGlzIGVsbGlwdGljYWxBcmMgYXQgdGhlIGVuZCBwb2ludCwgcG9pbnRpbmcgaW4gdGhlIGRpcmVjdGlvbiBvZiBtb3Rpb24gKGZyb20gc3RhcnQgdG8gZW5kKVxuICAgKi9cbiAgcHVibGljIGdldEVuZFRhbmdlbnQoKTogVmVjdG9yMiB7XG4gICAgaWYgKCB0aGlzLl9lbmRUYW5nZW50ID09PSBudWxsICkge1xuICAgICAgdGhpcy5fZW5kVGFuZ2VudCA9IHRoaXMudGFuZ2VudEF0QW5nbGUoIHRoaXMuX2VuZEFuZ2xlICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbmRUYW5nZW50O1xuICB9XG5cbiAgcHVibGljIGdldCBlbmRUYW5nZW50KCk6IFZlY3RvcjIgeyByZXR1cm4gdGhpcy5nZXRFbmRUYW5nZW50KCk7IH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZW5kIGFuZ2xlIGluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBnZXRBY3R1YWxFbmRBbmdsZSgpOiBudW1iZXIge1xuICAgIGlmICggdGhpcy5fYWN0dWFsRW5kQW5nbGUgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9hY3R1YWxFbmRBbmdsZSA9IEFyYy5jb21wdXRlQWN0dWFsRW5kQW5nbGUoIHRoaXMuX3N0YXJ0QW5nbGUsIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9hbnRpY2xvY2t3aXNlICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hY3R1YWxFbmRBbmdsZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYWN0dWFsRW5kQW5nbGUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiB2YWx1ZSB0aGF0IGluZGljYXRlcyBpZiB0aGUgYXJjIHdyYXBzIHVwIGJ5IG1vcmUgdGhhbiB0d28gUGlcbiAgICovXG4gIHB1YmxpYyBnZXRJc0Z1bGxQZXJpbWV0ZXIoKTogYm9vbGVhbiB7XG4gICAgaWYgKCB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXIgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9pc0Z1bGxQZXJpbWV0ZXIgPSAoICF0aGlzLl9hbnRpY2xvY2t3aXNlICYmIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSA+PSBNYXRoLlBJICogMiApIHx8ICggdGhpcy5fYW50aWNsb2Nrd2lzZSAmJiB0aGlzLl9zdGFydEFuZ2xlIC0gdGhpcy5fZW5kQW5nbGUgPj0gTWF0aC5QSSAqIDIgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2lzRnVsbFBlcmltZXRlcjtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNGdWxsUGVyaW1ldGVyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRJc0Z1bGxQZXJpbWV0ZXIoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFuZ2xlIGRpZmZlcmVuY2UgdGhhdCByZXByZXNlbnRzIGhvdyBcIm11Y2hcIiBvZiB0aGUgY2lyY2xlIG91ciBhcmMgY292ZXJzXG4gICAqXG4gICAqIFRoZSBhbnN3ZXIgaXMgYWx3YXlzIGdyZWF0ZXIgb3IgZXF1YWwgdG8gemVyb1xuICAgKiBUaGUgYW5zd2VyIGNhbiBleGNlZWQgdHdvIFBpXG4gICAqL1xuICBwdWJsaWMgZ2V0QW5nbGVEaWZmZXJlbmNlKCk6IG51bWJlciB7XG4gICAgaWYgKCB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPT09IG51bGwgKSB7XG4gICAgICAvLyBjb21wdXRlIGFuIGFuZ2xlIGRpZmZlcmVuY2UgdGhhdCByZXByZXNlbnRzIGhvdyBcIm11Y2hcIiBvZiB0aGUgY2lyY2xlIG91ciBhcmMgY292ZXJzXG4gICAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPSB0aGlzLl9hbnRpY2xvY2t3aXNlID8gdGhpcy5fc3RhcnRBbmdsZSAtIHRoaXMuX2VuZEFuZ2xlIDogdGhpcy5fZW5kQW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlO1xuICAgICAgaWYgKCB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPCAwICkge1xuICAgICAgICB0aGlzLl9hbmdsZURpZmZlcmVuY2UgKz0gTWF0aC5QSSAqIDI7XG4gICAgICB9XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9hbmdsZURpZmZlcmVuY2UgPj0gMCApOyAvLyBub3cgaXQgc2hvdWxkIGFsd2F5cyBiZSB6ZXJvIG9yIHBvc2l0aXZlXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hbmdsZURpZmZlcmVuY2U7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGFuZ2xlRGlmZmVyZW5jZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRBbmdsZURpZmZlcmVuY2UoKTsgfVxuXG4gIC8qKlxuICAgKiBBIHVuaXQgYXJnIHNlZ21lbnQgdGhhdCB3ZSBjYW4gbWFwIHRvIG91ciBlbGxpcHNlLiB1c2VmdWwgZm9yIGhpdCB0ZXN0aW5nIGFuZCBzdWNoLlxuICAgKi9cbiAgcHVibGljIGdldFVuaXRBcmNTZWdtZW50KCk6IEFyYyB7XG4gICAgaWYgKCB0aGlzLl91bml0QXJjU2VnbWVudCA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuX3VuaXRBcmNTZWdtZW50ID0gbmV3IEFyYyggVmVjdG9yMi5aRVJPLCAxLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdW5pdEFyY1NlZ21lbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHVuaXRBcmNTZWdtZW50KCk6IEFyYyB7IHJldHVybiB0aGlzLmdldFVuaXRBcmNTZWdtZW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIG9mIHRoaXMgc2VnbWVudC5cbiAgICovXG4gIHB1YmxpYyBnZXRCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgaWYgKCB0aGlzLl9ib3VuZHMgPT09IG51bGwgKSB7XG4gICAgICB0aGlzLl9ib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcud2l0aFBvaW50KCB0aGlzLmdldFN0YXJ0KCkgKVxuICAgICAgICAud2l0aFBvaW50KCB0aGlzLmdldEVuZCgpICk7XG5cbiAgICAgIC8vIGlmIHRoZSBhbmdsZXMgYXJlIGRpZmZlcmVudCwgY2hlY2sgZXh0cmVtYSBwb2ludHNcbiAgICAgIGlmICggdGhpcy5fc3RhcnRBbmdsZSAhPT0gdGhpcy5fZW5kQW5nbGUgKSB7XG4gICAgICAgIC8vIHNvbHZlIHRoZSBtYXBwaW5nIGZyb20gdGhlIHVuaXQgY2lyY2xlLCBmaW5kIGxvY2F0aW9ucyB3aGVyZSBhIGNvb3JkaW5hdGUgb2YgdGhlIGdyYWRpZW50IGlzIHplcm8uXG4gICAgICAgIC8vIHdlIGZpbmQgb25lIGV4dHJlbWEgcG9pbnQgZm9yIGJvdGggeCBhbmQgeSwgc2luY2UgdGhlIG90aGVyIHR3byBhcmUganVzdCByb3RhdGVkIGJ5IHBpIGZyb20gdGhlbS5cbiAgICAgICAgY29uc3QgeEFuZ2xlID0gTWF0aC5hdGFuKCAtKCB0aGlzLl9yYWRpdXNZIC8gdGhpcy5fcmFkaXVzWCApICogTWF0aC50YW4oIHRoaXMuX3JvdGF0aW9uICkgKTtcbiAgICAgICAgY29uc3QgeUFuZ2xlID0gTWF0aC5hdGFuKCAoIHRoaXMuX3JhZGl1c1kgLyB0aGlzLl9yYWRpdXNYICkgLyBNYXRoLnRhbiggdGhpcy5fcm90YXRpb24gKSApO1xuXG4gICAgICAgIC8vIGNoZWNrIGFsbCBvZiB0aGUgZXh0cmVtYSBwb2ludHNcbiAgICAgICAgdGhpcy5wb3NzaWJsZUV4dHJlbWFBbmdsZXMgPSBbXG4gICAgICAgICAgeEFuZ2xlLFxuICAgICAgICAgIHhBbmdsZSArIE1hdGguUEksXG4gICAgICAgICAgeUFuZ2xlLFxuICAgICAgICAgIHlBbmdsZSArIE1hdGguUElcbiAgICAgICAgXTtcblxuICAgICAgICBfLmVhY2goIHRoaXMucG9zc2libGVFeHRyZW1hQW5nbGVzLCB0aGlzLmluY2x1ZGVCb3VuZHNBdEFuZ2xlLmJpbmQoIHRoaXMgKSApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmdldEJvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIG5vbi1kZWdlbmVyYXRlIHNlZ21lbnRzIHRoYXQgYXJlIGVxdWl2YWxlbnQgdG8gdGhpcyBzZWdtZW50LiBHZW5lcmFsbHkgZ2V0cyByaWQgKG9yIHNpbXBsaWZpZXMpXG4gICAqIGludmFsaWQgb3IgcmVwZWF0ZWQgc2VnbWVudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk6IFNlZ21lbnRbXSB7XG4gICAgaWYgKCB0aGlzLl9yYWRpdXNYIDw9IDAgfHwgdGhpcy5fcmFkaXVzWSA8PSAwIHx8IHRoaXMuX3N0YXJ0QW5nbGUgPT09IHRoaXMuX2VuZEFuZ2xlICkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fcmFkaXVzWCA9PT0gdGhpcy5fcmFkaXVzWSApIHtcbiAgICAgIC8vIHJlZHVjZSB0byBhbiBBcmNcbiAgICAgIGNvbnN0IHN0YXJ0QW5nbGUgPSB0aGlzLl9zdGFydEFuZ2xlICsgdGhpcy5fcm90YXRpb247XG4gICAgICBsZXQgZW5kQW5nbGUgPSB0aGlzLl9lbmRBbmdsZSArIHRoaXMuX3JvdGF0aW9uO1xuXG4gICAgICAvLyBwcmVzZXJ2ZSBmdWxsIGNpcmNsZXNcbiAgICAgIGlmICggTWF0aC5hYnMoIHRoaXMuX2VuZEFuZ2xlIC0gdGhpcy5fc3RhcnRBbmdsZSApID09PSBNYXRoLlBJICogMiApIHtcbiAgICAgICAgZW5kQW5nbGUgPSB0aGlzLl9hbnRpY2xvY2t3aXNlID8gc3RhcnRBbmdsZSAtIE1hdGguUEkgKiAyIDogc3RhcnRBbmdsZSArIE1hdGguUEkgKiAyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFsgbmV3IEFyYyggdGhpcy5fY2VudGVyLCB0aGlzLl9yYWRpdXNYLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApIF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIFsgdGhpcyBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBleHBhbmQgdGhlIHByaXZhdGUgX2JvdW5kcyBib3VuZGluZyBib3ggdG8gaW5jbHVkZSBhIHBvaW50IGF0IGEgc3BlY2lmaWMgYW5nbGUsIG1ha2luZyBzdXJlIHRoYXRcbiAgICogYW5nbGUgaXMgYWN0dWFsbHkgaW5jbHVkZWQgaW4gdGhlIGFyYy4gVGhpcyB3aWxsIHByZXN1bWFibHkgYmUgY2FsbGVkIGF0IGFuZ2xlcyB0aGF0IGFyZSBhdCBjcml0aWNhbCBwb2ludHMsXG4gICAqIHdoZXJlIHRoZSBhcmMgc2hvdWxkIGhhdmUgbWF4aW11bS9taW5pbXVtIHgveSB2YWx1ZXMuXG4gICAqL1xuICBwcml2YXRlIGluY2x1ZGVCb3VuZHNBdEFuZ2xlKCBhbmdsZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggdGhpcy51bml0QXJjU2VnbWVudC5jb250YWluc0FuZ2xlKCBhbmdsZSApICkge1xuICAgICAgLy8gdGhlIGJvdW5kYXJ5IHBvaW50IGlzIGluIHRoZSBhcmNcbiAgICAgIHRoaXMuX2JvdW5kcyA9IHRoaXMuX2JvdW5kcyEud2l0aFBvaW50KCB0aGlzLnBvc2l0aW9uQXRBbmdsZSggYW5nbGUgKSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgY29udGFpbmVkIGFuZ2xlIHRvIGJldHdlZW4gW3N0YXJ0QW5nbGUsYWN0dWFsRW5kQW5nbGUpLCBldmVuIGlmIHRoZSBlbmQgYW5nbGUgaXMgbG93ZXIuXG4gICAqXG4gICAqIFRPRE86IHJlbW92ZSBkdXBsaWNhdGlvbiB3aXRoIEFyYyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICovXG4gIHB1YmxpYyBtYXBBbmdsZSggYW5nbGU6IG51bWJlciApOiBudW1iZXIge1xuICAgIGlmICggTWF0aC5hYnMoIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBhbmdsZSAtIHRoaXMuX3N0YXJ0QW5nbGUsIC1NYXRoLlBJLCBNYXRoLlBJICkgKSA8IDFlLTggKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhcnRBbmdsZTtcbiAgICB9XG4gICAgaWYgKCBNYXRoLmFicyggVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGFuZ2xlIC0gdGhpcy5nZXRBY3R1YWxFbmRBbmdsZSgpLCAtTWF0aC5QSSwgTWF0aC5QSSApICkgPCAxZS04ICkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QWN0dWFsRW5kQW5nbGUoKTtcbiAgICB9XG4gICAgLy8gY29uc2lkZXIgYW4gYXNzZXJ0IHRoYXQgd2UgY29udGFpbiB0aGF0IGFuZ2xlP1xuICAgIHJldHVybiAoIHRoaXMuX3N0YXJ0QW5nbGUgPiB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgKSA/XG4gICAgICAgICAgIFV0aWxzLm1vZHVsb0JldHdlZW5VcCggYW5nbGUsIHRoaXMuX3N0YXJ0QW5nbGUgLSAyICogTWF0aC5QSSwgdGhpcy5fc3RhcnRBbmdsZSApIDpcbiAgICAgICAgICAgVXRpbHMubW9kdWxvQmV0d2VlbkRvd24oIGFuZ2xlLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9zdGFydEFuZ2xlICsgMiAqIE1hdGguUEkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwYXJhbWV0cml6ZWQgdmFsdWUgdCBmb3IgYSBnaXZlbiBhbmdsZS4gVGhlIHZhbHVlIHQgc2hvdWxkIHJhbmdlIGZyb20gMCB0byAxIChpbmNsdXNpdmUpLlxuICAgKlxuICAgKiBUT0RPOiByZW1vdmUgZHVwbGljYXRpb24gd2l0aCBBcmMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAqL1xuICBwdWJsaWMgdEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKCB0aGlzLm1hcEFuZ2xlKCBhbmdsZSApIC0gdGhpcy5fc3RhcnRBbmdsZSApIC8gKCB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgLSB0aGlzLl9zdGFydEFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW5nbGUgZm9yIHRoZSBwYXJhbWV0cml6ZWQgdCB2YWx1ZS4gVGhlIHQgdmFsdWUgc2hvdWxkIHJhbmdlIGZyb20gMCB0byAxIChpbmNsdXNpdmUpLlxuICAgKi9cbiAgcHVibGljIGFuZ2xlQXQoIHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zdGFydEFuZ2xlICsgKCB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCkgLSB0aGlzLl9zdGFydEFuZ2xlICkgKiB0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvc2l0aW9uIG9mIHRoaXMgYXJjIGF0IGFuZ2xlLlxuICAgKi9cbiAgcHVibGljIHBvc2l0aW9uQXRBbmdsZSggYW5nbGU6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVbml0VHJhbnNmb3JtKCkudHJhbnNmb3JtUG9zaXRpb24yKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAxLCBhbmdsZSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9ybWFsaXplZCB0YW5nZW50IG9mIHRoaXMgYXJjLlxuICAgKiBUaGUgdGFuZ2VudCBwb2ludHMgb3V0d2FyZCAoaW53YXJkKSBvZiB0aGlzIGFyYyBmb3IgY2xvY2t3aXNlIChhbnRpY2xvY2t3aXNlKSBkaXJlY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgdGFuZ2VudEF0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgY29uc3Qgbm9ybWFsID0gdGhpcy5nZXRVbml0VHJhbnNmb3JtKCkudHJhbnNmb3JtTm9ybWFsMiggVmVjdG9yMi5jcmVhdGVQb2xhciggMSwgYW5nbGUgKSApO1xuXG4gICAgcmV0dXJuIHRoaXMuX2FudGljbG9ja3dpc2UgPyBub3JtYWwucGVycGVuZGljdWxhciA6IG5vcm1hbC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHN0cmFpZ2h0IGxpbmVzIHRoYXQgd2lsbCBkcmF3IGFuIG9mZnNldCBvbiB0aGUgbG9naWNhbCBsZWZ0IChyaWdodCkgc2lkZSBmb3IgcmV2ZXJzZSBmYWxzZSAodHJ1ZSlcbiAgICogSXQgZGlzY3JldGl6ZXMgdGhlIGVsbGlwdGljYWwgYXJjIGluIDMyIHNlZ21lbnRzIGFuZCByZXR1cm5zIGFuIG9mZnNldCBjdXJ2ZSBhcyBhIGxpc3Qgb2YgbGluZVRvcy9cbiAgICpcbiAgICogQHBhcmFtIHIgLSBkaXN0YW5jZVxuICAgKiBAcGFyYW0gcmV2ZXJzZVxuICAgKi9cbiAgcHVibGljIG9mZnNldFRvKCByOiBudW1iZXIsIHJldmVyc2U6IGJvb2xlYW4gKTogTGluZVtdIHtcbiAgICAvLyBob3cgbWFueSBzZWdtZW50cyB0byBjcmVhdGUgKHBvc3NpYmx5IG1ha2UgdGhpcyBtb3JlIGFkYXB0aXZlPylcbiAgICBjb25zdCBxdWFudGl0eSA9IDMyO1xuXG4gICAgY29uc3QgcG9pbnRzID0gW107XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVhbnRpdHk7IGkrKyApIHtcbiAgICAgIGxldCByYXRpbyA9IGkgLyAoIHF1YW50aXR5IC0gMSApO1xuICAgICAgaWYgKCByZXZlcnNlICkge1xuICAgICAgICByYXRpbyA9IDEgLSByYXRpbztcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFuZ2xlID0gdGhpcy5hbmdsZUF0KCByYXRpbyApO1xuXG4gICAgICBwb2ludHMucHVzaCggdGhpcy5wb3NpdGlvbkF0QW5nbGUoIGFuZ2xlICkucGx1cyggdGhpcy50YW5nZW50QXRBbmdsZSggYW5nbGUgKS5wZXJwZW5kaWN1bGFyLm5vcm1hbGl6ZWQoKS50aW1lcyggciApICkgKTtcbiAgICAgIGlmICggaSA+IDAgKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKCBuZXcgTGluZSggcG9pbnRzWyBpIC0gMSBdLCBwb2ludHNbIGkgXSApICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFNWRyBwYXRoLiBhc3N1bWVzIHRoYXQgdGhlIHN0YXJ0IHBvaW50IGlzIGFscmVhZHkgcHJvdmlkZWQsXG4gICAqIHNvIGFueXRoaW5nIHRoYXQgY2FsbHMgdGhpcyBuZWVkcyB0byBwdXQgdGhlIE0gY2FsbHMgZmlyc3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0U1ZHUGF0aEZyYWdtZW50KCk6IHN0cmluZyB7XG4gICAgbGV0IG9sZFBhdGhGcmFnbWVudDtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIG9sZFBhdGhGcmFnbWVudCA9IHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcbiAgICAgIHRoaXMuX3N2Z1BhdGhGcmFnbWVudCA9IG51bGw7XG4gICAgfVxuICAgIGlmICggIXRoaXMuX3N2Z1BhdGhGcmFnbWVudCApIHtcbiAgICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCNQYXRoRGF0YUVsbGlwdGljYWxBcmNDb21tYW5kcyBmb3IgbW9yZSBpbmZvXG4gICAgICAvLyByeCByeSB4LWF4aXMtcm90YXRpb24gbGFyZ2UtYXJjLWZsYWcgc3dlZXAtZmxhZyB4IHlcbiAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAxOyAvLyBhbGxvdyBzb21lIGxlZXdheSB0byByZW5kZXIgdGhpbmdzIGFzICdhbG1vc3QgY2lyY2xlcydcbiAgICAgIGNvbnN0IHN3ZWVwRmxhZyA9IHRoaXMuX2FudGljbG9ja3dpc2UgPyAnMCcgOiAnMSc7XG4gICAgICBsZXQgbGFyZ2VBcmNGbGFnO1xuICAgICAgY29uc3QgZGVncmVlc1JvdGF0aW9uID0gdG9EZWdyZWVzKCB0aGlzLl9yb3RhdGlvbiApOyAvLyBibGVoLCBkZWdyZWVzP1xuICAgICAgaWYgKCB0aGlzLmdldEFuZ2xlRGlmZmVyZW5jZSgpIDwgTWF0aC5QSSAqIDIgLSBlcHNpbG9uICkge1xuICAgICAgICBsYXJnZUFyY0ZsYWcgPSB0aGlzLmdldEFuZ2xlRGlmZmVyZW5jZSgpIDwgTWF0aC5QSSA/ICcwJyA6ICcxJztcbiAgICAgICAgdGhpcy5fc3ZnUGF0aEZyYWdtZW50ID0gYEEgJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1ggKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1kgKX0gJHtkZWdyZWVzUm90YXRpb25cbiAgICAgICAgfSAke2xhcmdlQXJjRmxhZ30gJHtzd2VlcEZsYWd9ICR7c3ZnTnVtYmVyKCB0aGlzLmdldEVuZCgpLnggKX0gJHtzdmdOdW1iZXIoIHRoaXMuZ2V0RW5kKCkueSApfWA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gZWxsaXBzZSAob3IgYWxtb3N0LWVsbGlwc2UpIGNhc2UgbmVlZHMgdG8gYmUgaGFuZGxlZCBkaWZmZXJlbnRseVxuICAgICAgICAvLyBzaW5jZSBTVkcgd2lsbCBub3QgYmUgYWJsZSB0byBkcmF3IChvciBrbm93IGhvdyB0byBkcmF3KSB0aGUgY29ycmVjdCBjaXJjbGUgaWYgd2UganVzdCBoYXZlIGEgc3RhcnQgYW5kIGVuZCwgd2UgbmVlZCB0byBzcGxpdCBpdCBpbnRvIHR3byBjaXJjdWxhciBhcmNzXG5cbiAgICAgICAgLy8gZ2V0IHRoZSBhbmdsZSB0aGF0IGlzIGJldHdlZW4gYW5kIG9wcG9zaXRlIG9mIGJvdGggb2YgdGhlIHBvaW50c1xuICAgICAgICBjb25zdCBzcGxpdE9wcG9zaXRlQW5nbGUgPSAoIHRoaXMuX3N0YXJ0QW5nbGUgKyB0aGlzLl9lbmRBbmdsZSApIC8gMjsgLy8gdGhpcyBfc2hvdWxkXyB3b3JrIGZvciB0aGUgbW9kdWxhciBjYXNlP1xuICAgICAgICBjb25zdCBzcGxpdFBvaW50ID0gdGhpcy5wb3NpdGlvbkF0QW5nbGUoIHNwbGl0T3Bwb3NpdGVBbmdsZSApO1xuXG4gICAgICAgIGxhcmdlQXJjRmxhZyA9ICcwJzsgLy8gc2luY2Ugd2Ugc3BsaXQgaXQgaW4gMiwgaXQncyBhbHdheXMgdGhlIHNtYWxsIGFyY1xuXG4gICAgICAgIGNvbnN0IGZpcnN0QXJjID0gYEEgJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1ggKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1kgKX0gJHtcbiAgICAgICAgICBkZWdyZWVzUm90YXRpb259ICR7bGFyZ2VBcmNGbGFnfSAke3N3ZWVwRmxhZ30gJHtcbiAgICAgICAgICBzdmdOdW1iZXIoIHNwbGl0UG9pbnQueCApfSAke3N2Z051bWJlciggc3BsaXRQb2ludC55ICl9YDtcbiAgICAgICAgY29uc3Qgc2Vjb25kQXJjID0gYEEgJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1ggKX0gJHtzdmdOdW1iZXIoIHRoaXMuX3JhZGl1c1kgKX0gJHtcbiAgICAgICAgICBkZWdyZWVzUm90YXRpb259ICR7bGFyZ2VBcmNGbGFnfSAke3N3ZWVwRmxhZ30gJHtcbiAgICAgICAgICBzdmdOdW1iZXIoIHRoaXMuZ2V0RW5kKCkueCApfSAke3N2Z051bWJlciggdGhpcy5nZXRFbmQoKS55ICl9YDtcblxuICAgICAgICB0aGlzLl9zdmdQYXRoRnJhZ21lbnQgPSBgJHtmaXJzdEFyY30gJHtzZWNvbmRBcmN9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBpZiAoIG9sZFBhdGhGcmFnbWVudCApIHtcbiAgICAgICAgYXNzZXJ0KCBvbGRQYXRoRnJhZ21lbnQgPT09IHRoaXMuX3N2Z1BhdGhGcmFnbWVudCwgJ1F1YWRyYXRpYyBsaW5lIHNlZ21lbnQgY2hhbmdlZCB3aXRob3V0IGludmFsaWRhdGUoKScgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N2Z1BhdGhGcmFnbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHN0cmFpZ2h0IGxpbmVzICB0aGF0IHdpbGwgZHJhdyBhbiBvZmZzZXQgb24gdGhlIGxvZ2ljYWwgbGVmdCBzaWRlLlxuICAgKi9cbiAgcHVibGljIHN0cm9rZUxlZnQoIGxpbmVXaWR0aDogbnVtYmVyICk6IExpbmVbXSB7XG4gICAgcmV0dXJuIHRoaXMub2Zmc2V0VG8oIC1saW5lV2lkdGggLyAyLCBmYWxzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Ygc3RyYWlnaHQgbGluZXMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIHJpZ2h0IHNpZGUuXG4gICAqL1xuICBwdWJsaWMgc3Ryb2tlUmlnaHQoIGxpbmVXaWR0aDogbnVtYmVyICk6IExpbmVbXSB7XG4gICAgcmV0dXJuIHRoaXMub2Zmc2V0VG8oIGxpbmVXaWR0aCAvIDIsIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiB0IHZhbHVlcyB3aGVyZSBkeC9kdCBvciBkeS9kdCBpcyAwIHdoZXJlIDAgPCB0IDwgMS4gc3ViZGl2aWRpbmcgb24gdGhlc2Ugd2lsbCByZXN1bHQgaW4gbW9ub3RvbmljIHNlZ21lbnRzXG4gICAqIERvZXMgbm90IGluY2x1ZGUgdD0wIGFuZCB0PTEuXG4gICAqL1xuICBwdWJsaWMgZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKTogbnVtYmVyW10ge1xuICAgIGNvbnN0IHJlc3VsdDogbnVtYmVyW10gPSBbXTtcbiAgICBfLmVhY2goIHRoaXMucG9zc2libGVFeHRyZW1hQW5nbGVzLCAoIGFuZ2xlOiBudW1iZXIgKSA9PiB7XG4gICAgICBpZiAoIHRoaXMudW5pdEFyY1NlZ21lbnQuY29udGFpbnNBbmdsZSggYW5nbGUgKSApIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMudEF0QW5nbGUoIGFuZ2xlICk7XG4gICAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDAwMDE7IC8vIFRPRE86IGdlbmVyYWwga2l0ZSBlcHNpbG9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAgICAgaWYgKCB0ID4gZXBzaWxvbiAmJiB0IDwgMSAtIGVwc2lsb24gKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goIHQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICByZXR1cm4gcmVzdWx0LnNvcnQoKTsgLy8gbW9kaWZpZXMgb3JpZ2luYWwsIHdoaWNoIGlzIE9LXG4gIH1cblxuICAvKipcbiAgICogSGl0LXRlc3RzIHRoaXMgc2VnbWVudCB3aXRoIHRoZSByYXkuIEFuIGFycmF5IG9mIGFsbCBpbnRlcnNlY3Rpb25zIG9mIHRoZSByYXkgd2l0aCB0aGlzIHNlZ21lbnQgd2lsbCBiZSByZXR1cm5lZC5cbiAgICogRm9yIGRldGFpbHMsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBpbiBTZWdtZW50LmpzXG4gICAqL1xuICBwdWJsaWMgaW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogUmF5SW50ZXJzZWN0aW9uW10ge1xuICAgIC8vIGJlIGxhenkuIHRyYW5zZm9ybSBpdCBpbnRvIHRoZSBzcGFjZSBvZiBhIG5vbi1lbGxpcHRpY2FsIGFyYy5cbiAgICBjb25zdCB1bml0VHJhbnNmb3JtID0gdGhpcy5nZXRVbml0VHJhbnNmb3JtKCk7XG4gICAgY29uc3QgcmF5SW5Vbml0Q2lyY2xlU3BhY2UgPSB1bml0VHJhbnNmb3JtLmludmVyc2VSYXkyKCByYXkgKTtcbiAgICBjb25zdCBoaXRzID0gdGhpcy5nZXRVbml0QXJjU2VnbWVudCgpLmludGVyc2VjdGlvbiggcmF5SW5Vbml0Q2lyY2xlU3BhY2UgKTtcblxuICAgIHJldHVybiBfLm1hcCggaGl0cywgaGl0ID0+IHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUG9pbnQgPSB1bml0VHJhbnNmb3JtLnRyYW5zZm9ybVBvc2l0aW9uMiggaGl0LnBvaW50ICk7XG4gICAgICBjb25zdCBkaXN0YW5jZSA9IHJheS5wb3NpdGlvbi5kaXN0YW5jZSggdHJhbnNmb3JtZWRQb2ludCApO1xuICAgICAgY29uc3Qgbm9ybWFsID0gdW5pdFRyYW5zZm9ybS5pbnZlcnNlTm9ybWFsMiggaGl0Lm5vcm1hbCApO1xuICAgICAgcmV0dXJuIG5ldyBSYXlJbnRlcnNlY3Rpb24oIGRpc3RhbmNlLCB0cmFuc2Zvcm1lZFBvaW50LCBub3JtYWwsIGhpdC53aW5kLCBoaXQudCApO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSByZXN1bHRhbnQgd2luZGluZyBudW1iZXIgb2YgdGhpcyByYXkgaW50ZXJzZWN0aW5nIHRoaXMgYXJjLlxuICAgKi9cbiAgcHVibGljIHdpbmRpbmdJbnRlcnNlY3Rpb24oIHJheTogUmF5MiApOiBudW1iZXIge1xuICAgIC8vIGJlIGxhenkuIHRyYW5zZm9ybSBpdCBpbnRvIHRoZSBzcGFjZSBvZiBhIG5vbi1lbGxpcHRpY2FsIGFyYy5cbiAgICBjb25zdCByYXlJblVuaXRDaXJjbGVTcGFjZSA9IHRoaXMuZ2V0VW5pdFRyYW5zZm9ybSgpLmludmVyc2VSYXkyKCByYXkgKTtcbiAgICByZXR1cm4gdGhpcy5nZXRVbml0QXJjU2VnbWVudCgpLndpbmRpbmdJbnRlcnNlY3Rpb24oIHJheUluVW5pdENpcmNsZVNwYWNlICk7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhpcyBhcmMgdG8gdGhlIDJEIENhbnZhcyBjb250ZXh0LCBhc3N1bWluZyB0aGUgY29udGV4dCdzIGN1cnJlbnQgbG9jYXRpb24gaXMgYWxyZWFkeSBhdCB0aGUgc3RhcnQgcG9pbnRcbiAgICovXG4gIHB1YmxpYyB3cml0ZVRvQ29udGV4dCggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xuICAgIGlmICggY29udGV4dC5lbGxpcHNlICkge1xuICAgICAgY29udGV4dC5lbGxpcHNlKCB0aGlzLl9jZW50ZXIueCwgdGhpcy5fY2VudGVyLnksIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JhZGl1c1ksIHRoaXMuX3JvdGF0aW9uLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGZha2UgdGhlIGVsbGlwc2UgY2FsbCBieSB1c2luZyB0cmFuc2Zvcm1zXG4gICAgICB0aGlzLmdldFVuaXRUcmFuc2Zvcm0oKS5nZXRNYXRyaXgoKS5jYW52YXNBcHBlbmRUcmFuc2Zvcm0oIGNvbnRleHQgKTtcbiAgICAgIGNvbnRleHQuYXJjKCAwLCAwLCAxLCB0aGlzLl9zdGFydEFuZ2xlLCB0aGlzLl9lbmRBbmdsZSwgdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xuICAgICAgdGhpcy5nZXRVbml0VHJhbnNmb3JtKCkuZ2V0SW52ZXJzZSgpLmNhbnZhc0FwcGVuZFRyYW5zZm9ybSggY29udGV4dCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgZWxsaXB0aWNhbCBhcmMgdHJhbnNmb3JtZWQgYnkgYSBtYXRyaXhcbiAgICovXG4gIHB1YmxpYyB0cmFuc2Zvcm1lZCggbWF0cml4OiBNYXRyaXgzICk6IEVsbGlwdGljYWxBcmMge1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkU2VtaU1ham9yQXhpcyA9IG1hdHJpeC50aW1lc1ZlY3RvcjIoIFZlY3RvcjIuY3JlYXRlUG9sYXIoIHRoaXMuX3JhZGl1c1gsIHRoaXMuX3JvdGF0aW9uICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKTtcbiAgICBjb25zdCB0cmFuc2Zvcm1lZFNlbWlNaW5vckF4aXMgPSBtYXRyaXgudGltZXNWZWN0b3IyKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCB0aGlzLl9yYWRpdXNZLCB0aGlzLl9yb3RhdGlvbiArIE1hdGguUEkgLyAyICkgKS5taW51cyggbWF0cml4LnRpbWVzVmVjdG9yMiggVmVjdG9yMi5aRVJPICkgKTtcbiAgICBjb25zdCByb3RhdGlvbiA9IHRyYW5zZm9ybWVkU2VtaU1ham9yQXhpcy5hbmdsZTtcbiAgICBjb25zdCByYWRpdXNYID0gdHJhbnNmb3JtZWRTZW1pTWFqb3JBeGlzLm1hZ25pdHVkZTtcbiAgICBjb25zdCByYWRpdXNZID0gdHJhbnNmb3JtZWRTZW1pTWlub3JBeGlzLm1hZ25pdHVkZTtcblxuICAgIGNvbnN0IHJlZmxlY3RlZCA9IG1hdHJpeC5nZXREZXRlcm1pbmFudCgpIDwgMDtcblxuICAgIC8vIHJldmVyc2UgdGhlICdjbG9ja3dpc2VuZXNzJyBpZiBvdXIgdHJhbnNmb3JtIGluY2x1ZGVzIGEgcmVmbGVjdGlvblxuICAgIC8vIFRPRE86IGNoZWNrIHJlZmxlY3Rpb25zLiBzd2FwcGluZyBhbmdsZSBzaWducyBzaG91bGQgZml4IGNsb2Nrd2lzZW5lc3MgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3QgYW50aWNsb2Nrd2lzZSA9IHJlZmxlY3RlZCA/ICF0aGlzLl9hbnRpY2xvY2t3aXNlIDogdGhpcy5fYW50aWNsb2Nrd2lzZTtcbiAgICBjb25zdCBzdGFydEFuZ2xlID0gcmVmbGVjdGVkID8gLXRoaXMuX3N0YXJ0QW5nbGUgOiB0aGlzLl9zdGFydEFuZ2xlO1xuICAgIGxldCBlbmRBbmdsZSA9IHJlZmxlY3RlZCA/IC10aGlzLl9lbmRBbmdsZSA6IHRoaXMuX2VuZEFuZ2xlO1xuXG4gICAgaWYgKCBNYXRoLmFicyggdGhpcy5fZW5kQW5nbGUgLSB0aGlzLl9zdGFydEFuZ2xlICkgPT09IE1hdGguUEkgKiAyICkge1xuICAgICAgZW5kQW5nbGUgPSBhbnRpY2xvY2t3aXNlID8gc3RhcnRBbmdsZSAtIE1hdGguUEkgKiAyIDogc3RhcnRBbmdsZSArIE1hdGguUEkgKiAyO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRWxsaXB0aWNhbEFyYyggbWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5fY2VudGVyICksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnRyaWJ1dGlvbiB0byB0aGUgc2lnbmVkIGFyZWEgY29tcHV0ZWQgdXNpbmcgR3JlZW4ncyBUaGVvcmVtLCB3aXRoIFA9LXkvMiBhbmQgUT14LzIuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgaXMgdGhpcyBzZWdtZW50J3MgY29udHJpYnV0aW9uIHRvIHRoZSBsaW5lIGludGVncmFsICgteS8yIGR4ICsgeC8yIGR5KS5cbiAgICovXG4gIHB1YmxpYyBnZXRTaWduZWRBcmVhRnJhZ21lbnQoKTogbnVtYmVyIHtcbiAgICBjb25zdCB0MCA9IHRoaXMuX3N0YXJ0QW5nbGU7XG4gICAgY29uc3QgdDEgPSB0aGlzLmdldEFjdHVhbEVuZEFuZ2xlKCk7XG5cbiAgICBjb25zdCBzaW4wID0gTWF0aC5zaW4oIHQwICk7XG4gICAgY29uc3Qgc2luMSA9IE1hdGguc2luKCB0MSApO1xuICAgIGNvbnN0IGNvczAgPSBNYXRoLmNvcyggdDAgKTtcbiAgICBjb25zdCBjb3MxID0gTWF0aC5jb3MoIHQxICk7XG5cbiAgICAvLyBEZXJpdmVkIHZpYSBNYXRoZW1hdGljYSAoY3VydmUtYXJlYS5uYilcbiAgICByZXR1cm4gMC41ICogKCB0aGlzLl9yYWRpdXNYICogdGhpcy5fcmFkaXVzWSAqICggdDEgLSB0MCApICtcbiAgICAgICAgICAgICAgICAgICBNYXRoLmNvcyggdGhpcy5fcm90YXRpb24gKSAqICggdGhpcy5fcmFkaXVzWCAqIHRoaXMuX2NlbnRlci55ICogKCBjb3MwIC0gY29zMSApICtcbiAgICAgICAgICAgICAgICAgICB0aGlzLl9yYWRpdXNZICogdGhpcy5fY2VudGVyLnggKiAoIHNpbjEgLSBzaW4wICkgKSArXG4gICAgICAgICAgICAgICAgICAgTWF0aC5zaW4oIHRoaXMuX3JvdGF0aW9uICkgKiAoIHRoaXMuX3JhZGl1c1ggKiB0aGlzLl9jZW50ZXIueCAqICggY29zMSAtIGNvczAgKSArXG4gICAgICAgICAgICAgICAgICAgdGhpcy5fcmFkaXVzWSAqIHRoaXMuX2NlbnRlci55ICogKCBzaW4xIC0gc2luMCApICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmV2ZXJzZWQgY29weSBvZiB0aGlzIHNlZ21lbnQgKG1hcHBpbmcgdGhlIHBhcmFtZXRyaXphdGlvbiBmcm9tIFswLDFdID0+IFsxLDBdKS5cbiAgICovXG4gIHB1YmxpYyByZXZlcnNlZCgpOiBFbGxpcHRpY2FsQXJjIHtcbiAgICByZXR1cm4gbmV3IEVsbGlwdGljYWxBcmMoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzWCwgdGhpcy5fcmFkaXVzWSwgdGhpcy5fcm90YXRpb24sIHRoaXMuX2VuZEFuZ2xlLCB0aGlzLl9zdGFydEFuZ2xlLCAhdGhpcy5fYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXG4gICAqL1xuICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRFbGxpcHRpY2FsQXJjIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0VsbGlwdGljYWxBcmMnLFxuICAgICAgY2VudGVyWDogdGhpcy5fY2VudGVyLngsXG4gICAgICBjZW50ZXJZOiB0aGlzLl9jZW50ZXIueSxcbiAgICAgIHJhZGl1c1g6IHRoaXMuX3JhZGl1c1gsXG4gICAgICByYWRpdXNZOiB0aGlzLl9yYWRpdXNZLFxuICAgICAgcm90YXRpb246IHRoaXMuX3JvdGF0aW9uLFxuICAgICAgc3RhcnRBbmdsZTogdGhpcy5fc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlOiB0aGlzLl9lbmRBbmdsZSxcbiAgICAgIGFudGljbG9ja3dpc2U6IHRoaXMuX2FudGljbG9ja3dpc2VcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIHR3byBsaW5lcyBvdmVybGFwIG92ZXIgYSBjb250aW51b3VzIHNlY3Rpb24sIGFuZCBpZiBzbyBmaW5kcyB0aGUgYSxiIHBhaXIgc3VjaCB0aGF0XG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXG4gICAqXG4gICAqIEBwYXJhbSBzZWdtZW50XG4gICAqIEBwYXJhbSBbZXBzaWxvbl0gLSBXaWxsIHJldHVybiBvdmVybGFwcyBvbmx5IGlmIG5vIHR3byBjb3JyZXNwb25kaW5nIHBvaW50cyBkaWZmZXIgYnkgdGhpcyBhbW91bnQgb3IgbW9yZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gb25lIGNvbXBvbmVudC5cbiAgICogQHJldHVybnMgLSBUaGUgc29sdXRpb24sIGlmIHRoZXJlIGlzIG9uZSAoYW5kIG9ubHkgb25lKVxuICAgKi9cbiAgcHVibGljIGdldE92ZXJsYXBzKCBzZWdtZW50OiBTZWdtZW50LCBlcHNpbG9uID0gMWUtNiApOiBPdmVybGFwW10gfCBudWxsIHtcbiAgICBpZiAoIHNlZ21lbnQgaW5zdGFuY2VvZiBFbGxpcHRpY2FsQXJjICkge1xuICAgICAgcmV0dXJuIEVsbGlwdGljYWxBcmMuZ2V0T3ZlcmxhcHMoIHRoaXMsIHNlZ21lbnQgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBtYXRyaXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbmljIHNlY3Rpb24gb2YgdGhlIGVsbGlwc2UuXG4gICAqIFNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NYXRyaXhfcmVwcmVzZW50YXRpb25fb2ZfY29uaWNfc2VjdGlvbnNcbiAgICovXG4gIHB1YmxpYyBnZXRDb25pY01hdHJpeCgpOiBNYXRyaXgzIHtcbiAgICAvLyBBeF4yICsgQnh5ICsgQ3leMiArIER4ICsgRXkgKyBGID0gMFxuXG4gICAgLy8geCdeMiArIHknXjIgPSAxICAgICAgLS0tLSBvdXIgdW5pdCBjaXJjbGVcbiAgICAvLyAoeCx5LDEpID0gTSAqICh4Jyx5JywxKSAgIC0tLS0gb3VyIHRyYW5zZm9ybSBtYXRyaXhcbiAgICAvLyBDID0gWyAxLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAtMSBdIC0tLSBjb25pYyBtYXRyaXggZm9yIHRoZSB1bml0IGNpcmNsZVxuXG4gICAgLy8gKHgnLHknLDEpXlQgKiBDICogKHgnLHknLDEpID0gMCAgLS0tIGNvbmljIG1hdHJpeCBlcXVhdGlvbiBmb3Igb3VyIHVuaXQgY2lyY2xlXG4gICAgLy8gKCBNXi0xICogKHgseSwxKSApXlQgKiBDICogTV4tMSAqICh4LHksMSkgPSAwIC0tLSBzdWJzdGl0dXRlIGluIG91ciB0cmFuc2Zvcm0gbWF0cml4XG4gICAgLy8gKHgseSwxKV5UICogKCBNXi0xXlQgKiBDICogTV4tMSApICogKHgseSwxKSA9IDAgLS0tIGlzb2xhdGUgY29uaWMgbWF0cml4IGZvciBvdXIgZWxsaXBzZVxuXG4gICAgLy8gKCBNXi0xXlQgKiBDICogTV4tMSApIGlzIHRoZSBjb25pYyBtYXRyaXggZm9yIG91ciBlbGxpcHNlXG4gICAgY29uc3QgdW5pdE1hdHJpeCA9IEVsbGlwdGljYWxBcmMuY29tcHV0ZVVuaXRNYXRyaXgoIHRoaXMuX2NlbnRlciwgdGhpcy5fcmFkaXVzWCwgdGhpcy5fcmFkaXVzWSwgdGhpcy5fcm90YXRpb24gKTtcbiAgICBjb25zdCBpbnZlcnRlZFVuaXRNYXRyaXggPSB1bml0TWF0cml4LmludmVydGVkKCk7XG4gICAgcmV0dXJuIGludmVydGVkVW5pdE1hdHJpeC50cmFuc3Bvc2VkKCkubXVsdGlwbHlNYXRyaXgoIHVuaXRDaXJjbGVDb25pY01hdHJpeCApLm11bHRpcGx5TWF0cml4KCBpbnZlcnRlZFVuaXRNYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEVsbGlwdGljYWxBcmMgZnJvbSB0aGUgc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgZGVzZXJpYWxpemUoIG9iajogU2VyaWFsaXplZEVsbGlwdGljYWxBcmMgKTogRWxsaXB0aWNhbEFyYyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb2JqLnR5cGUgPT09ICdFbGxpcHRpY2FsQXJjJyApO1xuXG4gICAgcmV0dXJuIG5ldyBFbGxpcHRpY2FsQXJjKCBuZXcgVmVjdG9yMiggb2JqLmNlbnRlclgsIG9iai5jZW50ZXJZICksIG9iai5yYWRpdXNYLCBvYmoucmFkaXVzWSwgb2JqLnJvdGF0aW9uLCBvYmouc3RhcnRBbmdsZSwgb2JqLmVuZEFuZ2xlLCBvYmouYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hhdCB0eXBlIG9mIG92ZXJsYXAgaXMgcG9zc2libGUgYmFzZWQgb24gdGhlIGNlbnRlci9yYWRpaS9yb3RhdGlvbi4gV2UgaWdub3JlIHRoZSBzdGFydC9lbmQgYW5nbGVzIGFuZFxuICAgKiBhbnRpY2xvY2t3aXNlIGluZm9ybWF0aW9uLCBhbmQgZGV0ZXJtaW5lIGlmIHRoZSBGVUxMIGVsbGlwc2VzIG92ZXJsYXAuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldE92ZXJsYXBUeXBlKCBhOiBFbGxpcHRpY2FsQXJjLCBiOiBFbGxpcHRpY2FsQXJjLCBlcHNpbG9uID0gMWUtNCApOiBFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUge1xuXG4gICAgLy8gRGlmZmVyZW50IGNlbnRlcnMgY2FuJ3Qgb3ZlcmxhcCBjb250aW51b3VzbHlcbiAgICBpZiAoIGEuX2NlbnRlci5kaXN0YW5jZSggYi5fY2VudGVyICkgPCBlcHNpbG9uICkge1xuXG4gICAgICBjb25zdCBtYXRjaGluZ1JhZGlpID0gTWF0aC5hYnMoIGEuX3JhZGl1c1ggLSBiLl9yYWRpdXNYICkgPCBlcHNpbG9uICYmIE1hdGguYWJzKCBhLl9yYWRpdXNZIC0gYi5fcmFkaXVzWSApIDwgZXBzaWxvbjtcbiAgICAgIGNvbnN0IG9wcG9zaXRlUmFkaWkgPSBNYXRoLmFicyggYS5fcmFkaXVzWCAtIGIuX3JhZGl1c1kgKSA8IGVwc2lsb24gJiYgTWF0aC5hYnMoIGEuX3JhZGl1c1kgLSBiLl9yYWRpdXNYICkgPCBlcHNpbG9uO1xuXG4gICAgICBpZiAoIG1hdGNoaW5nUmFkaWkgKSB7XG4gICAgICAgIC8vIERpZmZlcmVuY2UgYmV0d2VlbiByb3RhdGlvbnMgc2hvdWxkIGJlIGFuIGFwcHJveGltYXRlIG11bHRpcGxlIG9mIHBpLiBXZSBhZGQgcGkvMiBiZWZvcmUgbW9kdWxvLCBzbyB0aGVcbiAgICAgICAgLy8gcmVzdWx0IG9mIHRoYXQgc2hvdWxkIGJlIH5waS8yIChkb24ndCBuZWVkIHRvIGNoZWNrIGJvdGggZW5kcG9pbnRzKVxuICAgICAgICBpZiAoIE1hdGguYWJzKCBVdGlscy5tb2R1bG9CZXR3ZWVuRG93biggYS5fcm90YXRpb24gLSBiLl9yb3RhdGlvbiArIE1hdGguUEkgLyAyLCAwLCBNYXRoLlBJICkgLSBNYXRoLlBJIC8gMiApIDwgZXBzaWxvbiApIHtcbiAgICAgICAgICByZXR1cm4gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk1BVENISU5HX09WRVJMQVA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICggb3Bwb3NpdGVSYWRpaSApIHtcbiAgICAgICAgLy8gRGlmZmVyZW5jZSBiZXR3ZWVuIHJvdGF0aW9ucyBzaG91bGQgYmUgYW4gYXBwcm94aW1hdGUgbXVsdGlwbGUgb2YgcGkgKHdpdGggcGkvMiBhZGRlZCkuXG4gICAgICAgIGlmICggTWF0aC5hYnMoIFV0aWxzLm1vZHVsb0JldHdlZW5Eb3duKCBhLl9yb3RhdGlvbiAtIGIuX3JvdGF0aW9uLCAwLCBNYXRoLlBJICkgLSBNYXRoLlBJIC8gMiApIDwgZXBzaWxvbiApIHtcbiAgICAgICAgICByZXR1cm4gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk9QUE9TSVRFX09WRVJMQVA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk5PTkU7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGVsbGlwdGljYWwgYXJjcyBvdmVybGFwIG92ZXIgY29udGludW91cyBzZWN0aW9ucywgYW5kIGlmIHNvIGZpbmRzIHRoZSBhLGIgcGFpcnMgc3VjaCB0aGF0XG4gICAqIHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gQW55IG92ZXJsYXBzIChmcm9tIDAgdG8gMilcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3ZlcmxhcHMoIGE6IEVsbGlwdGljYWxBcmMsIGI6IEVsbGlwdGljYWxBcmMgKTogT3ZlcmxhcFtdIHtcblxuICAgIGNvbnN0IG92ZXJsYXBUeXBlID0gRWxsaXB0aWNhbEFyYy5nZXRPdmVybGFwVHlwZSggYSwgYiApO1xuXG4gICAgaWYgKCBvdmVybGFwVHlwZSA9PT0gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk5PTkUgKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIEFyYy5nZXRBbmd1bGFyT3ZlcmxhcHMoIGEuX3N0YXJ0QW5nbGUgKyBhLl9yb3RhdGlvbiwgYS5nZXRBY3R1YWxFbmRBbmdsZSgpICsgYS5fcm90YXRpb24sXG4gICAgICAgIGIuX3N0YXJ0QW5nbGUgKyBiLl9yb3RhdGlvbiwgYi5nZXRBY3R1YWxFbmRBbmdsZSgpICsgYi5fcm90YXRpb24gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbnkgKGZpbml0ZSkgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBlbGxpcHRpY2FsIGFyYyBzZWdtZW50cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgaW50ZXJzZWN0KCBhOiBFbGxpcHRpY2FsQXJjLCBiOiBFbGxpcHRpY2FsQXJjLCBlcHNpbG9uID0gMWUtMTAgKTogU2VnbWVudEludGVyc2VjdGlvbltdIHtcblxuICAgIGNvbnN0IG92ZXJsYXBUeXBlID0gRWxsaXB0aWNhbEFyYy5nZXRPdmVybGFwVHlwZSggYSwgYiwgZXBzaWxvbiApO1xuXG4gICAgaWYgKCBvdmVybGFwVHlwZSA9PT0gRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlLk5PTkUgKSB7XG4gICAgICByZXR1cm4gQm91bmRzSW50ZXJzZWN0aW9uLmludGVyc2VjdCggYSwgYiApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIElmIHdlIGVmZmVjdGl2ZWx5IGhhdmUgdGhlIHNhbWUgZWxsaXBzZSwganVzdCBkaWZmZXJlbnQgc2VjdGlvbnMgb2YgaXQuIFRoZSBvbmx5IGZpbml0ZSBpbnRlcnNlY3Rpb25zIGNvdWxkIGJlXG4gICAgICAvLyBhdCB0aGUgZW5kcG9pbnRzLCBzbyB3ZSdsbCBpbnNwZWN0IHRob3NlLlxuXG4gICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICBjb25zdCBhU3RhcnQgPSBhLnBvc2l0aW9uQXQoIDAgKTtcbiAgICAgIGNvbnN0IGFFbmQgPSBhLnBvc2l0aW9uQXQoIDEgKTtcbiAgICAgIGNvbnN0IGJTdGFydCA9IGIucG9zaXRpb25BdCggMCApO1xuICAgICAgY29uc3QgYkVuZCA9IGIucG9zaXRpb25BdCggMSApO1xuXG4gICAgICBpZiAoIGFTdGFydC5lcXVhbHNFcHNpbG9uKCBiU3RhcnQsIGVwc2lsb24gKSApIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJTdGFydCApLCAwLCAwICkgKTtcbiAgICAgIH1cbiAgICAgIGlmICggYVN0YXJ0LmVxdWFsc0Vwc2lsb24oIGJFbmQsIGVwc2lsb24gKSApIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYVN0YXJ0LmF2ZXJhZ2UoIGJFbmQgKSwgMCwgMSApICk7XG4gICAgICB9XG4gICAgICBpZiAoIGFFbmQuZXF1YWxzRXBzaWxvbiggYlN0YXJ0LCBlcHNpbG9uICkgKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCggbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIGFFbmQuYXZlcmFnZSggYlN0YXJ0ICksIDEsIDAgKSApO1xuICAgICAgfVxuICAgICAgaWYgKCBhRW5kLmVxdWFsc0Vwc2lsb24oIGJFbmQsIGVwc2lsb24gKSApIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCBuZXcgU2VnbWVudEludGVyc2VjdGlvbiggYUVuZC5hdmVyYWdlKCBiRW5kICksIDEsIDEgKSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWF0cml4IHRoYXQgdHJhbnNmb3JtcyB0aGUgdW5pdCBjaXJjbGUgaW50byBvdXIgZWxsaXBzZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21wdXRlVW5pdE1hdHJpeCggY2VudGVyOiBWZWN0b3IyLCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciApOiBNYXRyaXgzIHtcbiAgICByZXR1cm4gTWF0cml4My50cmFuc2xhdGlvbkZyb21WZWN0b3IoIGNlbnRlciApXG4gICAgICAudGltZXNNYXRyaXgoIE1hdHJpeDMucm90YXRpb24yKCByb3RhdGlvbiApIClcbiAgICAgIC50aW1lc01hdHJpeCggTWF0cml4My5zY2FsaW5nKCByYWRpdXNYLCByYWRpdXNZICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIHRoZSB1bml0IGNpcmNsZSBpbnRvIG91ciBlbGxpcHNlLlxuICAgKlxuICAgKiBhZGFwdGVkIGZyb20gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2ltcGxub3RlLmh0bWwjUGF0aEVsZW1lbnRJbXBsZW1lbnRhdGlvbk5vdGVzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNvbXB1dGVVbml0VHJhbnNmb3JtKCBjZW50ZXI6IFZlY3RvcjIsIHJhZGl1c1g6IG51bWJlciwgcmFkaXVzWTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyICk6IFRyYW5zZm9ybTMge1xuICAgIHJldHVybiBuZXcgVHJhbnNmb3JtMyggRWxsaXB0aWNhbEFyYy5jb21wdXRlVW5pdE1hdHJpeCggY2VudGVyLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApICk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xuICAvLyByYWRpdXNYIG9mIG9uZSBlcXVhbHMgcmFkaXVzWCBvZiB0aGUgb3RoZXIsIHdpdGggZXF1aXZhbGVudCBjZW50ZXJzIGFuZCByb3RhdGlvbnMgdG8gd29ya1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1BVENISU5HX09WRVJMQVAgPSBuZXcgRWxsaXB0aWNhbEFyY092ZXJsYXBUeXBlKCk7XG5cbiAgLy8gcmFkaXVzWCBvZiBvbmUgZXF1YWxzIHJhZGl1c1kgb2YgdGhlIG90aGVyLCB3aXRoIGVxdWl2YWxlbnQgY2VudGVycyBhbmQgcm90YXRpb25zIHRvIHdvcmtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPUFBPU0lURV9PVkVSTEFQID0gbmV3IEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZSgpO1xuXG4gIC8vIG5vIG92ZXJsYXBcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOT05FID0gbmV3IEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZSgpO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEVsbGlwdGljYWxBcmNPdmVybGFwVHlwZSApO1xufVxuXG5raXRlLnJlZ2lzdGVyKCAnRWxsaXB0aWNhbEFyYycsIEVsbGlwdGljYWxBcmMgKTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIk1hdHJpeDMiLCJUcmFuc2Zvcm0zIiwiVXRpbHMiLCJWZWN0b3IyIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiQXJjIiwiQm91bmRzSW50ZXJzZWN0aW9uIiwia2l0ZSIsIkxpbmUiLCJSYXlJbnRlcnNlY3Rpb24iLCJTZWdtZW50IiwiU2VnbWVudEludGVyc2VjdGlvbiIsInN2Z051bWJlciIsInRvRGVncmVlcyIsInVuaXRDaXJjbGVDb25pY01hdHJpeCIsInJvd01ham9yIiwiRWxsaXB0aWNhbEFyYyIsInNldENlbnRlciIsImNlbnRlciIsImFzc2VydCIsImlzRmluaXRlIiwidG9TdHJpbmciLCJfY2VudGVyIiwiZXF1YWxzIiwiaW52YWxpZGF0ZSIsInZhbHVlIiwiZ2V0Q2VudGVyIiwic2V0UmFkaXVzWCIsInJhZGl1c1giLCJfcmFkaXVzWCIsImdldFJhZGl1c1giLCJzZXRSYWRpdXNZIiwicmFkaXVzWSIsIl9yYWRpdXNZIiwiZ2V0UmFkaXVzWSIsInNldFJvdGF0aW9uIiwicm90YXRpb24iLCJfcm90YXRpb24iLCJnZXRSb3RhdGlvbiIsInNldFN0YXJ0QW5nbGUiLCJzdGFydEFuZ2xlIiwiX3N0YXJ0QW5nbGUiLCJnZXRTdGFydEFuZ2xlIiwic2V0RW5kQW5nbGUiLCJlbmRBbmdsZSIsIl9lbmRBbmdsZSIsImdldEVuZEFuZ2xlIiwic2V0QW50aWNsb2Nrd2lzZSIsImFudGljbG9ja3dpc2UiLCJfYW50aWNsb2Nrd2lzZSIsImdldEFudGljbG9ja3dpc2UiLCJwb3NpdGlvbkF0IiwidCIsInBvc2l0aW9uQXRBbmdsZSIsImFuZ2xlQXQiLCJ0YW5nZW50QXQiLCJ0YW5nZW50QXRBbmdsZSIsImN1cnZhdHVyZUF0IiwiYW5nbGUiLCJhcSIsIk1hdGgiLCJzaW4iLCJicSIsImNvcyIsImRlbm9taW5hdG9yIiwicG93Iiwic3ViZGl2aWRlZCIsImFuZ2xlMCIsImFuZ2xlVCIsImFuZ2xlMSIsIl91bml0VHJhbnNmb3JtIiwiX3N0YXJ0IiwiX2VuZCIsIl9zdGFydFRhbmdlbnQiLCJfZW5kVGFuZ2VudCIsIl9hY3R1YWxFbmRBbmdsZSIsIl9pc0Z1bGxQZXJpbWV0ZXIiLCJfYW5nbGVEaWZmZXJlbmNlIiwiX3VuaXRBcmNTZWdtZW50IiwiX2JvdW5kcyIsIl9zdmdQYXRoRnJhZ21lbnQiLCJQSSIsInRtcFIiLCJFcnJvciIsImludmFsaWRhdGlvbkVtaXR0ZXIiLCJlbWl0IiwiZ2V0VW5pdFRyYW5zZm9ybSIsImNvbXB1dGVVbml0VHJhbnNmb3JtIiwidW5pdFRyYW5zZm9ybSIsImdldFN0YXJ0Iiwic3RhcnQiLCJnZXRFbmQiLCJlbmQiLCJnZXRTdGFydFRhbmdlbnQiLCJzdGFydFRhbmdlbnQiLCJnZXRFbmRUYW5nZW50IiwiZW5kVGFuZ2VudCIsImdldEFjdHVhbEVuZEFuZ2xlIiwiY29tcHV0ZUFjdHVhbEVuZEFuZ2xlIiwiYWN0dWFsRW5kQW5nbGUiLCJnZXRJc0Z1bGxQZXJpbWV0ZXIiLCJpc0Z1bGxQZXJpbWV0ZXIiLCJnZXRBbmdsZURpZmZlcmVuY2UiLCJhbmdsZURpZmZlcmVuY2UiLCJnZXRVbml0QXJjU2VnbWVudCIsIlpFUk8iLCJ1bml0QXJjU2VnbWVudCIsImdldEJvdW5kcyIsIk5PVEhJTkciLCJ3aXRoUG9pbnQiLCJ4QW5nbGUiLCJhdGFuIiwidGFuIiwieUFuZ2xlIiwicG9zc2libGVFeHRyZW1hQW5nbGVzIiwiXyIsImVhY2giLCJpbmNsdWRlQm91bmRzQXRBbmdsZSIsImJpbmQiLCJib3VuZHMiLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJhYnMiLCJjb250YWluc0FuZ2xlIiwibWFwQW5nbGUiLCJtb2R1bG9CZXR3ZWVuRG93biIsIm1vZHVsb0JldHdlZW5VcCIsInRBdEFuZ2xlIiwidHJhbnNmb3JtUG9zaXRpb24yIiwiY3JlYXRlUG9sYXIiLCJub3JtYWwiLCJ0cmFuc2Zvcm1Ob3JtYWwyIiwicGVycGVuZGljdWxhciIsIm5lZ2F0ZWQiLCJvZmZzZXRUbyIsInIiLCJyZXZlcnNlIiwicXVhbnRpdHkiLCJwb2ludHMiLCJyZXN1bHQiLCJpIiwicmF0aW8iLCJwdXNoIiwicGx1cyIsIm5vcm1hbGl6ZWQiLCJ0aW1lcyIsImdldFNWR1BhdGhGcmFnbWVudCIsIm9sZFBhdGhGcmFnbWVudCIsImVwc2lsb24iLCJzd2VlcEZsYWciLCJsYXJnZUFyY0ZsYWciLCJkZWdyZWVzUm90YXRpb24iLCJ4IiwieSIsInNwbGl0T3Bwb3NpdGVBbmdsZSIsInNwbGl0UG9pbnQiLCJmaXJzdEFyYyIsInNlY29uZEFyYyIsInN0cm9rZUxlZnQiLCJsaW5lV2lkdGgiLCJzdHJva2VSaWdodCIsImdldEludGVyaW9yRXh0cmVtYVRzIiwic29ydCIsImludGVyc2VjdGlvbiIsInJheSIsInJheUluVW5pdENpcmNsZVNwYWNlIiwiaW52ZXJzZVJheTIiLCJoaXRzIiwibWFwIiwiaGl0IiwidHJhbnNmb3JtZWRQb2ludCIsInBvaW50IiwiZGlzdGFuY2UiLCJwb3NpdGlvbiIsImludmVyc2VOb3JtYWwyIiwid2luZCIsIndpbmRpbmdJbnRlcnNlY3Rpb24iLCJ3cml0ZVRvQ29udGV4dCIsImNvbnRleHQiLCJlbGxpcHNlIiwiZ2V0TWF0cml4IiwiY2FudmFzQXBwZW5kVHJhbnNmb3JtIiwiYXJjIiwiZ2V0SW52ZXJzZSIsInRyYW5zZm9ybWVkIiwibWF0cml4IiwidHJhbnNmb3JtZWRTZW1pTWFqb3JBeGlzIiwidGltZXNWZWN0b3IyIiwibWludXMiLCJ0cmFuc2Zvcm1lZFNlbWlNaW5vckF4aXMiLCJtYWduaXR1ZGUiLCJyZWZsZWN0ZWQiLCJnZXREZXRlcm1pbmFudCIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsInQwIiwidDEiLCJzaW4wIiwic2luMSIsImNvczAiLCJjb3MxIiwicmV2ZXJzZWQiLCJzZXJpYWxpemUiLCJ0eXBlIiwiY2VudGVyWCIsImNlbnRlclkiLCJnZXRPdmVybGFwcyIsInNlZ21lbnQiLCJnZXRDb25pY01hdHJpeCIsInVuaXRNYXRyaXgiLCJjb21wdXRlVW5pdE1hdHJpeCIsImludmVydGVkVW5pdE1hdHJpeCIsImludmVydGVkIiwidHJhbnNwb3NlZCIsIm11bHRpcGx5TWF0cml4IiwiZGVzZXJpYWxpemUiLCJvYmoiLCJnZXRPdmVybGFwVHlwZSIsImEiLCJiIiwibWF0Y2hpbmdSYWRpaSIsIm9wcG9zaXRlUmFkaWkiLCJFbGxpcHRpY2FsQXJjT3ZlcmxhcFR5cGUiLCJNQVRDSElOR19PVkVSTEFQIiwiT1BQT1NJVEVfT1ZFUkxBUCIsIk5PTkUiLCJvdmVybGFwVHlwZSIsImdldEFuZ3VsYXJPdmVybGFwcyIsImludGVyc2VjdCIsInJlc3VsdHMiLCJhU3RhcnQiLCJhRW5kIiwiYlN0YXJ0IiwiYkVuZCIsImVxdWFsc0Vwc2lsb24iLCJhdmVyYWdlIiwidHJhbnNsYXRpb25Gcm9tVmVjdG9yIiwidGltZXNNYXRyaXgiLCJyb3RhdGlvbjIiLCJzY2FsaW5nIiwiZW51bWVyYXRpb24iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGFBQWEsNkJBQTZCO0FBRWpELE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsaUJBQWlCLHVDQUF1QztBQUMvRCxPQUFPQyxzQkFBc0IsNENBQTRDO0FBQ3pFLFNBQVNDLEdBQUcsRUFBRUMsa0JBQWtCLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFXQyxlQUFlLEVBQUVDLE9BQU8sRUFBRUMsbUJBQW1CLEVBQUVDLFNBQVMsUUFBUSxnQkFBZ0I7QUFFdkksWUFBWTtBQUNaLE1BQU1DLFlBQVlaLE1BQU1ZLFNBQVM7QUFFakMsTUFBTUMsd0JBQXdCZixRQUFRZ0IsUUFBUSxDQUM1QyxHQUFHLEdBQUcsR0FDTixHQUFHLEdBQUcsR0FDTixHQUFHLEdBQUcsQ0FBQztBQWVNLElBQUEsQUFBTUMsZ0JBQU4sTUFBTUEsc0JBQXNCTjtJQWtEekM7O0dBRUMsR0FDRCxBQUFPTyxVQUFXQyxNQUFlLEVBQVM7UUFDeENDLFVBQVVBLE9BQVFELE9BQU9FLFFBQVEsSUFBSSxDQUFDLHVDQUF1QyxFQUFFRixPQUFPRyxRQUFRLElBQUk7UUFFbEcsSUFBSyxDQUFDLElBQUksQ0FBQ0MsT0FBTyxDQUFD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