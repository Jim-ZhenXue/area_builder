// Copyright 2013-2024, University of Colorado Boulder
/**
 * Shape handling
 *
 * Shapes are internally made up of Subpaths, which contain a series of segments, and are optionally closed.
 * Familiarity with how Canvas handles subpaths is helpful for understanding this code.
 *
 * Canvas spec: http://www.w3.org/TR/2dcontext/
 * SVG spec: http://www.w3.org/TR/SVG/expanded-toc.html
 *           http://www.w3.org/TR/SVG/paths.html#PathData (for paths)
 * Notes for elliptical arcs: http://www.w3.org/TR/SVG/implnote.html#PathElementImplementationNotes
 * Notes for painting strokes: https://svgwg.org/svg2-draft/painting.html
 *
 * TODO: add nonzero / evenodd support when browsers support it https://github.com/phetsims/kite/issues/76
 * TODO: docs
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../axon/js/TinyEmitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import Ray2 from '../../dot/js/Ray2.js';
import Vector2 from '../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Arc, Cubic, EllipticalArc, Graph, kite, Line, Quadratic, Segment, Subpath, svgNumber, svgPath } from './imports.js';
// (We can't get joist's random reference here)
const randomSource = Math.random;
// Convenience function that returns a Vector2, used throughout this file as an abbreviation for a displacement, a
// position or a point.
const v = (x, y)=>new Vector2(x, y);
/**
 * The tension parameter controls how smoothly the curve turns through its control points. For a Catmull-Rom curve,
 * the tension is zero. The tension should range from -1 to 1.
 * @param beforeVector
 * @param currentVector
 * @param afterVector
 * @param tension - the tension should range from -1 to 1.
 */ const weightedSplineVector = (beforeVector, currentVector, afterVector, tension)=>{
    return afterVector.copy().subtract(beforeVector).multiplyScalar((1 - tension) / 6).add(currentVector);
};
let Shape = class Shape {
    /**
   * Resets the control points
   *
   * for tracking the last quadratic/cubic control point for smooth* functions
   * see https://github.com/phetsims/kite/issues/38
   */ resetControlPoints() {
        this.lastQuadraticControlPoint = null;
        this.lastCubicControlPoint = null;
    }
    /**
   * Sets the quadratic control point
   */ setQuadraticControlPoint(point) {
        this.lastQuadraticControlPoint = point;
        this.lastCubicControlPoint = null;
    }
    /**
   * Sets the cubic control point
   */ setCubicControlPoint(point) {
        this.lastQuadraticControlPoint = null;
        this.lastCubicControlPoint = point;
    }
    /**
   * Moves to a point given by the coordinates x and y
   */ moveTo(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.moveToPoint(v(x, y));
    }
    /**
   * Moves a relative displacement (x,y) from last point
   */ moveToRelative(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.moveToPointRelative(v(x, y));
    }
    /**
   * Moves a relative displacement (point) from last point
   */ moveToPointRelative(displacement) {
        return this.moveToPoint(this.getRelativePoint().plus(displacement));
    }
    /**
   * Adds to this shape a subpath that moves (no joint) it to a point
   */ moveToPoint(point) {
        this.addSubpath(new Subpath().addPoint(point));
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Adds to this shape a straight line from last point to the coordinate (x,y)
   */ lineTo(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.lineToPoint(v(x, y));
    }
    /**
   * Adds to this shape a straight line displaced by a relative amount x, and y from last point
   *
   * @param x - horizontal displacement
   * @param y - vertical displacement
   */ lineToRelative(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.lineToPointRelative(v(x, y));
    }
    /**
   * Adds to this shape a straight line displaced by a relative displacement (point)
   */ lineToPointRelative(displacement) {
        return this.lineToPoint(this.getRelativePoint().plus(displacement));
    }
    /**
   * Adds to this shape a straight line from this lastPoint to point
   */ lineToPoint(point) {
        // see http://www.w3.org/TR/2dcontext/#dom-context-2d-lineto
        if (this.hasSubpaths()) {
            const start = this.getLastSubpath().getLastPoint();
            const end = point;
            const line = new Line(start, end);
            this.getLastSubpath().addPoint(end);
            this.addSegmentAndBounds(line);
        } else {
            this.ensure(point);
        }
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Adds a horizontal line (x represents the x-coordinate of the end point)
   */ horizontalLineTo(x) {
        return this.lineTo(x, this.getRelativePoint().y);
    }
    /**
   * Adds a horizontal line (x represent a horizontal displacement)
   */ horizontalLineToRelative(x) {
        return this.lineToRelative(x, 0);
    }
    /**
   * Adds a vertical line (y represents the y-coordinate of the end point)
   */ verticalLineTo(y) {
        return this.lineTo(this.getRelativePoint().x, y);
    }
    /**
   * Adds a vertical line (y represents a vertical displacement)
   */ verticalLineToRelative(y) {
        return this.lineToRelative(0, y);
    }
    /**
   * Zig-zags between the current point and the specified point
   *
   * @param endX - the end of the shape
   * @param endY - the end of the shape
   * @param amplitude - the vertical amplitude of the zig zag wave
   * @param numberZigZags - the number of oscillations
   * @param symmetrical - flag for drawing a symmetrical zig zag
   */ zigZagTo(endX, endY, amplitude, numberZigZags, symmetrical) {
        return this.zigZagToPoint(new Vector2(endX, endY), amplitude, numberZigZags, symmetrical);
    }
    /**
   * Zig-zags between the current point and the specified point.
   * Implementation moved from circuit-construction-kit-common on April 22, 2019.
   *
   * @param endPoint - the end of the shape
   * @param amplitude - the vertical amplitude of the zig zag wave, signed to choose initial direction
   * @param numberZigZags - the number of complete oscillations
   * @param symmetrical - flag for drawing a symmetrical zig zag
   */ zigZagToPoint(endPoint, amplitude, numberZigZags, symmetrical) {
        assert && assert(Number.isInteger(numberZigZags), `numberZigZags must be an integer: ${numberZigZags}`);
        this.ensure(endPoint);
        const startPoint = this.getLastPoint();
        const delta = endPoint.minus(startPoint);
        const directionUnitVector = delta.normalized();
        const amplitudeNormalVector = directionUnitVector.perpendicular.times(amplitude);
        let wavelength;
        if (symmetrical) {
            // the wavelength is shorter to add half a wave.
            wavelength = delta.magnitude / (numberZigZags + 0.5);
        } else {
            wavelength = delta.magnitude / numberZigZags;
        }
        for(let i = 0; i < numberZigZags; i++){
            const waveOrigin = directionUnitVector.times(i * wavelength).plus(startPoint);
            const topPoint = waveOrigin.plus(directionUnitVector.times(wavelength / 4)).plus(amplitudeNormalVector);
            const bottomPoint = waveOrigin.plus(directionUnitVector.times(3 * wavelength / 4)).minus(amplitudeNormalVector);
            this.lineToPoint(topPoint);
            this.lineToPoint(bottomPoint);
        }
        // add last half of the wavelength
        if (symmetrical) {
            const waveOrigin = directionUnitVector.times(numberZigZags * wavelength).plus(startPoint);
            const topPoint = waveOrigin.plus(directionUnitVector.times(wavelength / 4)).plus(amplitudeNormalVector);
            this.lineToPoint(topPoint);
        }
        return this.lineToPoint(endPoint);
    }
    /**
   * Adds a quadratic curve to this shape
   *
   * The curve is guaranteed to pass through the coordinate (x,y) but does not pass through the control point
   *
   * @param cpx - control point horizontal coordinate
   * @param cpy - control point vertical coordinate
   * @param x
   * @param y
   */ quadraticCurveTo(cpx, cpy, x, y) {
        assert && assert(isFinite(cpx), `cpx must be a finite number: ${cpx}`);
        assert && assert(isFinite(cpy), `cpy must be a finite number: ${cpy}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.quadraticCurveToPoint(v(cpx, cpy), v(x, y));
    }
    /**
   * Adds a quadratic curve to this shape. The control and final points are specified as displacment from the last
   * point in this shape
   *
   * @param cpx - control point horizontal coordinate
   * @param cpy - control point vertical coordinate
   * @param x - final x position of the quadratic curve
   * @param y - final y position of the quadratic curve
   */ quadraticCurveToRelative(cpx, cpy, x, y) {
        assert && assert(isFinite(cpx), `cpx must be a finite number: ${cpx}`);
        assert && assert(isFinite(cpy), `cpy must be a finite number: ${cpy}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.quadraticCurveToPointRelative(v(cpx, cpy), v(x, y));
    }
    /**
   * Adds a quadratic curve to this shape. The control and final points are specified as displacement from the
   * last point in this shape
   *
   * @param controlPoint
   * @param point - the quadratic curve passes through this point
   */ quadraticCurveToPointRelative(controlPoint, point) {
        const relativePoint = this.getRelativePoint();
        return this.quadraticCurveToPoint(relativePoint.plus(controlPoint), relativePoint.plus(point));
    }
    /**
   * Adds a quadratic curve to this shape. The quadratic curves passes through the x and y coordinate.
   * The shape should join smoothly with the previous subpaths
   *
   * TODO: consider a rename to put 'smooth' farther back? https://github.com/phetsims/kite/issues/76
   *
   * @param x - final x position of the quadratic curve
   * @param y - final y position of the quadratic curve
   */ smoothQuadraticCurveTo(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.quadraticCurveToPoint(this.getSmoothQuadraticControlPoint(), v(x, y));
    }
    /**
   * Adds a quadratic curve to this shape. The quadratic curves passes through the x and y coordinate.
   * The shape should join smoothly with the previous subpaths
   *
   * @param x - final x position of the quadratic curve
   * @param y - final y position of the quadratic curve
   */ smoothQuadraticCurveToRelative(x, y) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.quadraticCurveToPoint(this.getSmoothQuadraticControlPoint(), v(x, y).plus(this.getRelativePoint()));
    }
    /**
   * Adds a quadratic bezier curve to this shape.
   *
   * @param controlPoint
   * @param point - the quadratic curve passes through this point
   */ quadraticCurveToPoint(controlPoint, point) {
        // see http://www.w3.org/TR/2dcontext/#dom-context-2d-quadraticcurveto
        this.ensure(controlPoint);
        const start = this.getLastSubpath().getLastPoint();
        const quadratic = new Quadratic(start, controlPoint, point);
        this.getLastSubpath().addPoint(point);
        const nondegenerateSegments = quadratic.getNondegenerateSegments();
        _.each(nondegenerateSegments, (segment)=>{
            // TODO: optimization https://github.com/phetsims/kite/issues/76
            this.addSegmentAndBounds(segment);
        });
        this.setQuadraticControlPoint(controlPoint);
        return this; // for chaining
    }
    /**
   * Adds a cubic bezier curve to this shape.
   *
   * @param cp1x - control point 1,  horizontal coordinate
   * @param cp1y - control point 1,  vertical coordinate
   * @param cp2x - control point 2,  horizontal coordinate
   * @param cp2y - control point 2,  vertical coordinate
   * @param x - final x position of the cubic curve
   * @param y - final y position of the cubic curve
   */ cubicCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        assert && assert(isFinite(cp1x), `cp1x must be a finite number: ${cp1x}`);
        assert && assert(isFinite(cp1y), `cp1y must be a finite number: ${cp1y}`);
        assert && assert(isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
        assert && assert(isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.cubicCurveToPoint(v(cp1x, cp1y), v(cp2x, cp2y), v(x, y));
    }
    /**
   * @param cp1x - control point 1,  horizontal displacement
   * @param cp1y - control point 1,  vertical displacement
   * @param cp2x - control point 2,  horizontal displacement
   * @param cp2y - control point 2,  vertical displacement
   * @param x - final horizontal displacement
   * @param y - final vertical displacment
   */ cubicCurveToRelative(cp1x, cp1y, cp2x, cp2y, x, y) {
        assert && assert(isFinite(cp1x), `cp1x must be a finite number: ${cp1x}`);
        assert && assert(isFinite(cp1y), `cp1y must be a finite number: ${cp1y}`);
        assert && assert(isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
        assert && assert(isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.cubicCurveToPointRelative(v(cp1x, cp1y), v(cp2x, cp2y), v(x, y));
    }
    /**
   * @param control1 - control displacement  1
   * @param control2 - control displacement 2
   * @param point - final displacement
   */ cubicCurveToPointRelative(control1, control2, point) {
        const relativePoint = this.getRelativePoint();
        return this.cubicCurveToPoint(relativePoint.plus(control1), relativePoint.plus(control2), relativePoint.plus(point));
    }
    /**
   * @param cp2x - control point 2,  horizontal coordinate
   * @param cp2y - control point 2,  vertical coordinate
   * @param x
   * @param y
   */ smoothCubicCurveTo(cp2x, cp2y, x, y) {
        assert && assert(isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
        assert && assert(isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.cubicCurveToPoint(this.getSmoothCubicControlPoint(), v(cp2x, cp2y), v(x, y));
    }
    /**
   * @param cp2x - control point 2,  horizontal coordinate
   * @param cp2y - control point 2,  vertical coordinate
   * @param x
   * @param y
   */ smoothCubicCurveToRelative(cp2x, cp2y, x, y) {
        assert && assert(isFinite(cp2x), `cp2x must be a finite number: ${cp2x}`);
        assert && assert(isFinite(cp2y), `cp2y must be a finite number: ${cp2y}`);
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        return this.cubicCurveToPoint(this.getSmoothCubicControlPoint(), v(cp2x, cp2y).plus(this.getRelativePoint()), v(x, y).plus(this.getRelativePoint()));
    }
    cubicCurveToPoint(control1, control2, point) {
        // see http://www.w3.org/TR/2dcontext/#dom-context-2d-quadraticcurveto
        this.ensure(control1);
        const start = this.getLastSubpath().getLastPoint();
        const cubic = new Cubic(start, control1, control2, point);
        const nondegenerateSegments = cubic.getNondegenerateSegments();
        _.each(nondegenerateSegments, (segment)=>{
            this.addSegmentAndBounds(segment);
        });
        this.getLastSubpath().addPoint(point);
        this.setCubicControlPoint(control2);
        return this; // for chaining
    }
    /**
   * @param centerX - horizontal coordinate of the center of the arc
   * @param centerY - Center of the arc
   * @param radius - How far from the center the arc will be
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param [anticlockwise] - Decides which direction the arc takes around the center
   */ arc(centerX, centerY, radius, startAngle, endAngle, anticlockwise) {
        assert && assert(isFinite(centerX), `centerX must be a finite number: ${centerX}`);
        assert && assert(isFinite(centerY), `centerY must be a finite number: ${centerY}`);
        return this.arcPoint(v(centerX, centerY), radius, startAngle, endAngle, anticlockwise);
    }
    /**
   * @param center - Center of the arc (every point on the arc is equally far from the center)
   * @param radius - How far from the center the arc will be
   * @param startAngle - Angle (radians) of the start of the arc
   * @param endAngle - Angle (radians) of the end of the arc
   * @param [anticlockwise] - Decides which direction the arc takes around the center
   */ arcPoint(center, radius, startAngle, endAngle, anticlockwise) {
        // see http://www.w3.org/TR/2dcontext/#dom-context-2d-arc
        if (anticlockwise === undefined) {
            anticlockwise = false;
        }
        const arc = new Arc(center, radius, startAngle, endAngle, anticlockwise);
        // we are assuming that the normal conditions were already met (or exceptioned out) so that these actually work with canvas
        const startPoint = arc.getStart();
        const endPoint = arc.getEnd();
        // if there is already a point on the subpath, and it is different than our starting point, draw a line between them
        if (this.hasSubpaths() && this.getLastSubpath().getLength() > 0 && !startPoint.equals(this.getLastSubpath().getLastPoint())) {
            this.addSegmentAndBounds(new Line(this.getLastSubpath().getLastPoint(), startPoint));
        }
        if (!this.hasSubpaths()) {
            this.addSubpath(new Subpath());
        }
        // technically the Canvas spec says to add the start point, so we do this even though it is probably completely unnecessary (there is no conditional)
        this.getLastSubpath().addPoint(startPoint);
        this.getLastSubpath().addPoint(endPoint);
        this.addSegmentAndBounds(arc);
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Creates an elliptical arc
   *
   * @param centerX - horizontal coordinate of the center of the arc
   * @param centerY -  vertical coordinate of the center of the arc
   * @param radiusX - semi axis
   * @param radiusY - semi axis
   * @param rotation - rotation of the elliptical arc with respect to the positive x axis.
   * @param startAngle
   * @param endAngle
   * @param [anticlockwise]
   */ ellipticalArc(centerX, centerY, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        assert && assert(isFinite(centerX), `centerX must be a finite number: ${centerX}`);
        assert && assert(isFinite(centerY), `centerY must be a finite number: ${centerY}`);
        return this.ellipticalArcPoint(v(centerX, centerY), radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }
    /**
   * Creates an elliptic arc
   *
   * @param center
   * @param radiusX
   * @param radiusY
   * @param rotation - rotation of the arc with respect to the positive x axis.
   * @param startAngle -
   * @param endAngle
   * @param [anticlockwise]
   */ ellipticalArcPoint(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
        // see http://www.w3.org/TR/2dcontext/#dom-context-2d-arc
        if (anticlockwise === undefined) {
            anticlockwise = false;
        }
        const ellipticalArc = new EllipticalArc(center, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        // we are assuming that the normal conditions were already met (or exceptioned out) so that these actually work with canvas
        const startPoint = ellipticalArc.start;
        const endPoint = ellipticalArc.end;
        // if there is already a point on the subpath, and it is different than our starting point, draw a line between them
        if (this.hasSubpaths() && this.getLastSubpath().getLength() > 0 && !startPoint.equals(this.getLastSubpath().getLastPoint())) {
            this.addSegmentAndBounds(new Line(this.getLastSubpath().getLastPoint(), startPoint));
        }
        if (!this.hasSubpaths()) {
            this.addSubpath(new Subpath());
        }
        // technically the Canvas spec says to add the start point, so we do this even though it is probably completely unnecessary (there is no conditional)
        this.getLastSubpath().addPoint(startPoint);
        this.getLastSubpath().addPoint(endPoint);
        this.addSegmentAndBounds(ellipticalArc);
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Adds a subpath that joins the last point of this shape to the first point to form a closed shape
   *
   */ close() {
        if (this.hasSubpaths()) {
            const previousPath = this.getLastSubpath();
            const nextPath = new Subpath();
            previousPath.close();
            this.addSubpath(nextPath);
            nextPath.addPoint(previousPath.getFirstPoint());
        }
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Moves to the next subpath, but without adding any points to it (like a moveTo would do).
   *
   * This is particularly helpful for cases where you don't want to have to compute the explicit starting point of
   * the next subpath. For instance, if you want three disconnected circles:
   * - shape.circle( 50, 50, 20 ).newSubpath().circle( 100, 100, 20 ).newSubpath().circle( 150, 50, 20 )
   *
   * See https://github.com/phetsims/kite/issues/72 for more info.
   */ newSubpath() {
        this.addSubpath(new Subpath());
        this.resetControlPoints();
        return this; // for chaining
    }
    /**
   * Makes this Shape immutable, so that attempts to further change the Shape will fail. This allows clients to avoid
   * adding change listeners to this Shape.
   */ makeImmutable() {
        this._immutable = true;
        this.notifyInvalidationListeners();
        return this; // for chaining
    }
    /**
   * Returns whether this Shape is immutable (see makeImmutable for details).
   */ isImmutable() {
        return this._immutable;
    }
    /**
   * Matches SVG's elliptical arc from http://www.w3.org/TR/SVG/paths.html
   *
   * WARNING: rotation (for now) is in DEGREES. This will probably change in the future.
   *
   * @param radiusX - Semi-major axis size
   * @param radiusY - Semi-minor axis size
   * @param rotation - Rotation of the ellipse (its semi-major axis)
   * @param largeArc - Whether the arc will go the longest route around the ellipse.
   * @param sweep - Whether the arc made goes from start to end "clockwise" (opposite of anticlockwise flag)
   * @param x - End point X position
   * @param y - End point Y position
   */ ellipticalArcToRelative(radiusX, radiusY, rotation, largeArc, sweep, x, y) {
        const relativePoint = this.getRelativePoint();
        return this.ellipticalArcTo(radiusX, radiusY, rotation, largeArc, sweep, x + relativePoint.x, y + relativePoint.y);
    }
    /**
   * Matches SVG's elliptical arc from http://www.w3.org/TR/SVG/paths.html
   *
   * WARNING: rotation (for now) is in DEGREES. This will probably change in the future.
   *
   * @param radiusX - Semi-major axis size
   * @param radiusY - Semi-minor axis size
   * @param rotation - Rotation of the ellipse (its semi-major axis)
   * @param largeArc - Whether the arc will go the longest route around the ellipse.
   * @param sweep - Whether the arc made goes from start to end "clockwise" (opposite of anticlockwise flag)
   * @param x - End point X position
   * @param y - End point Y position
   */ ellipticalArcTo(radiusX, radiusY, rotation, largeArc, sweep, x, y) {
        // See "F.6.5 Conversion from endpoint to center parameterization"
        // in https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        const endPoint = new Vector2(x, y);
        this.ensure(endPoint);
        const startPoint = this.getLastSubpath().getLastPoint();
        this.getLastSubpath().addPoint(endPoint);
        // Absolute value applied to radii (per SVG spec)
        if (radiusX < 0) {
            radiusX *= -1.0;
        }
        if (radiusY < 0) {
            radiusY *= -1.0;
        }
        let rxs = radiusX * radiusX;
        let rys = radiusY * radiusY;
        const prime = startPoint.minus(endPoint).dividedScalar(2).rotated(-rotation);
        const pxs = prime.x * prime.x;
        const pys = prime.y * prime.y;
        let centerPrime = new Vector2(radiusX * prime.y / radiusY, -radiusY * prime.x / radiusX);
        // If the radii are not large enough to accomodate the start/end point, apply F.6.6 correction
        const size = pxs / rxs + pys / rys;
        if (size > 1) {
            radiusX *= Math.sqrt(size);
            radiusY *= Math.sqrt(size);
            // redo some computations from above
            rxs = radiusX * radiusX;
            rys = radiusY * radiusY;
            centerPrime = new Vector2(radiusX * prime.y / radiusY, -radiusY * prime.x / radiusX);
        }
        // Naming matches https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes for
        // F.6.5 Conversion from endpoint to center parameterization
        centerPrime.multiplyScalar(Math.sqrt(Math.max(0, (rxs * rys - rxs * pys - rys * pxs) / (rxs * pys + rys * pxs))));
        if (largeArc === sweep) {
            // From spec: where the + sign is chosen if fA ≠ fS, and the − sign is chosen if fA = fS.
            centerPrime.multiplyScalar(-1);
        }
        const center = startPoint.blend(endPoint, 0.5).plus(centerPrime.rotated(rotation));
        const signedAngle = (u, v)=>{
            // From spec: where the ± sign appearing here is the sign of ux vy − uy vx.
            return (u.x * v.y - u.y * v.x > 0 ? 1 : -1) * u.angleBetween(v);
        };
        const victor = new Vector2((prime.x - centerPrime.x) / radiusX, (prime.y - centerPrime.y) / radiusY);
        const ross = new Vector2((-prime.x - centerPrime.x) / radiusX, (-prime.y - centerPrime.y) / radiusY);
        const startAngle = signedAngle(Vector2.X_UNIT, victor);
        let deltaAngle = signedAngle(victor, ross) % (Math.PI * 2);
        // From spec:
        // > In other words, if fS = 0 and the right side of (F.6.5.6) is greater than 0, then subtract 360°, whereas if
        // > fS = 1 and the right side of (F.6.5.6) is less than 0, then add 360°. In all other cases leave it as is.
        if (!sweep && deltaAngle > 0) {
            deltaAngle -= Math.PI * 2;
        }
        if (sweep && deltaAngle < 0) {
            deltaAngle += Math.PI * 2;
        }
        // Standard handling of degenerate segments (particularly, converting elliptical arcs to circular arcs)
        const ellipticalArc = new EllipticalArc(center, radiusX, radiusY, rotation, startAngle, startAngle + deltaAngle, !sweep);
        const nondegenerateSegments = ellipticalArc.getNondegenerateSegments();
        _.each(nondegenerateSegments, (segment)=>{
            this.addSegmentAndBounds(segment);
        });
        return this;
    }
    circle(centerX, centerY, radius) {
        if (typeof centerX === 'object') {
            // circle( center, radius )
            const center = centerX;
            radius = centerY;
            return this.arcPoint(center, radius, 0, Math.PI * 2, false).close();
        } else {
            assert && assert(isFinite(centerX), `centerX must be a finite number: ${centerX}`);
            assert && assert(isFinite(centerY), `centerY must be a finite number: ${centerY}`);
            // circle( centerX, centerY, radius )
            return this.arcPoint(v(centerX, centerY), radius, 0, Math.PI * 2, false).close();
        }
    }
    ellipse(centerX, centerY, radiusX, radiusY, rotation) {
        // TODO: separate into ellipse() and ellipsePoint()? https://github.com/phetsims/kite/issues/76
        // TODO: Ellipse/EllipticalArc has a mess of parameters. Consider parameter object, or double-check parameter handling https://github.com/phetsims/kite/issues/76
        if (typeof centerX === 'object') {
            // ellipse( center, radiusX, radiusY, rotation )
            const center = centerX;
            rotation = radiusY;
            radiusY = radiusX;
            radiusX = centerY;
            return this.ellipticalArcPoint(center, radiusX, radiusY, rotation || 0, 0, Math.PI * 2, false).close();
        } else {
            assert && assert(isFinite(centerX), `centerX must be a finite number: ${centerX}`);
            assert && assert(isFinite(centerY), `centerY must be a finite number: ${centerY}`);
            // ellipse( centerX, centerY, radiusX, radiusY, rotation )
            return this.ellipticalArcPoint(v(centerX, centerY), radiusX, radiusY, rotation || 0, 0, Math.PI * 2, false).close();
        }
    }
    /**
   * Creates a rectangle shape
   *
   * @param x - left position
   * @param y - bottom position (in non inverted cartesian system)
   * @param width
   * @param height
   */ rect(x, y, width, height) {
        assert && assert(isFinite(x), `x must be a finite number: ${x}`);
        assert && assert(isFinite(y), `y must be a finite number: ${y}`);
        assert && assert(isFinite(width), `width must be a finite number: ${width}`);
        assert && assert(isFinite(height), `height must be a finite number: ${height}`);
        const subpath = new Subpath();
        this.addSubpath(subpath);
        subpath.addPoint(v(x, y));
        subpath.addPoint(v(x + width, y));
        subpath.addPoint(v(x + width, y + height));
        subpath.addPoint(v(x, y + height));
        this.addSegmentAndBounds(new Line(subpath.points[0], subpath.points[1]));
        this.addSegmentAndBounds(new Line(subpath.points[1], subpath.points[2]));
        this.addSegmentAndBounds(new Line(subpath.points[2], subpath.points[3]));
        subpath.close();
        this.addSubpath(new Subpath());
        this.getLastSubpath().addPoint(v(x, y));
        assert && assert(!isNaN(this.bounds.getX()));
        this.resetControlPoints();
        return this;
    }
    /**
   * Creates a round rectangle. All arguments are number.
   *
   * @param x
   * @param y
   * @param width - width of the rectangle
   * @param height - height of the rectangle
   * @param arcw - arc width
   * @param arch - arc height
   */ roundRect(x, y, width, height, arcw, arch) {
        const lowX = x + arcw;
        const highX = x + width - arcw;
        const lowY = y + arch;
        const highY = y + height - arch;
        // if ( true ) {
        if (arcw === arch) {
            // we can use circular arcs, which have well defined stroked offsets
            this.arc(highX, lowY, arcw, -Math.PI / 2, 0, false).arc(highX, highY, arcw, 0, Math.PI / 2, false).arc(lowX, highY, arcw, Math.PI / 2, Math.PI, false).arc(lowX, lowY, arcw, Math.PI, Math.PI * 3 / 2, false).close();
        } else {
            // we have to resort to elliptical arcs
            this.ellipticalArc(highX, lowY, arcw, arch, 0, -Math.PI / 2, 0, false).ellipticalArc(highX, highY, arcw, arch, 0, 0, Math.PI / 2, false).ellipticalArc(lowX, highY, arcw, arch, 0, Math.PI / 2, Math.PI, false).ellipticalArc(lowX, lowY, arcw, arch, 0, Math.PI, Math.PI * 3 / 2, false).close();
        }
        return this;
    }
    /**
   * Creates a polygon from an array of vertices.
   */ polygon(vertices) {
        const length = vertices.length;
        if (length > 0) {
            this.moveToPoint(vertices[0]);
            for(let i = 1; i < length; i++){
                this.lineToPoint(vertices[i]);
            }
        }
        return this.close();
    }
    /**
   * This is a convenience function that allows to generate Cardinal splines
   * from a position array. Cardinal spline differs from Bezier curves in that all
   * defined points on a Cardinal spline are on the path itself.
   *
   * It includes a tension parameter to allow the client to specify how tightly
   * the path interpolates between points. One can think of the tension as the tension in
   * a rubber band around pegs. however unlike a rubber band the tension can be negative.
   * the tension ranges from -1 to 1
   */ cardinalSpline(positions, providedOptions) {
        const options = optionize()({
            tension: 0,
            isClosedLineSegments: false
        }, providedOptions);
        assert && assert(options.tension < 1 && options.tension > -1, ' the tension goes from -1 to 1 ');
        const pointNumber = positions.length; // number of points in the array
        // if the line is open, there is one less segments than point vectors
        const segmentNumber = options.isClosedLineSegments ? pointNumber : pointNumber - 1;
        for(let i = 0; i < segmentNumber; i++){
            let cardinalPoints; // {Array.<Vector2>} cardinal points Array
            if (i === 0 && !options.isClosedLineSegments) {
                cardinalPoints = [
                    positions[0],
                    positions[0],
                    positions[1],
                    positions[2]
                ];
            } else if (i === segmentNumber - 1 && !options.isClosedLineSegments) {
                cardinalPoints = [
                    positions[i - 1],
                    positions[i],
                    positions[i + 1],
                    positions[i + 1]
                ];
            } else {
                cardinalPoints = [
                    positions[(i - 1 + pointNumber) % pointNumber],
                    positions[i % pointNumber],
                    positions[(i + 1) % pointNumber],
                    positions[(i + 2) % pointNumber]
                ];
            }
            // Cardinal Spline to Cubic Bezier conversion matrix
            //    0                 1             0            0
            //  (-1+tension)/6      1      (1-tension)/6       0
            //    0            (1-tension)/6      1       (-1+tension)/6
            //    0                 0             1           0
            // {Array.<Vector2>} bezier points Array
            const bezierPoints = [
                cardinalPoints[1],
                weightedSplineVector(cardinalPoints[0], cardinalPoints[1], cardinalPoints[2], options.tension),
                weightedSplineVector(cardinalPoints[3], cardinalPoints[2], cardinalPoints[1], options.tension),
                cardinalPoints[2]
            ];
            // special operations on the first point
            if (i === 0) {
                this.ensure(bezierPoints[0]);
                this.getLastSubpath().addPoint(bezierPoints[0]);
            }
            this.cubicCurveToPoint(bezierPoints[1], bezierPoints[2], bezierPoints[3]);
        }
        return this;
    }
    /**
   * Returns a copy of this shape
   */ copy() {
        // copy each individual subpath, so future modifications to either Shape doesn't affect the other one
        return new Shape(_.map(this.subpaths, (subpath)=>subpath.copy()), this.bounds);
    }
    /**
   * Writes out this shape's path to a canvas 2d context. does NOT include the beginPath()!
   */ writeToContext(context) {
        const len = this.subpaths.length;
        for(let i = 0; i < len; i++){
            this.subpaths[i].writeToContext(context);
        }
    }
    /**
   * Returns something like "M150 0 L75 200 L225 200 Z" for a triangle (to be used with a SVG path element's 'd'
   * attribute)
   */ getSVGPath() {
        let string = '';
        const len = this.subpaths.length;
        for(let i = 0; i < len; i++){
            const subpath = this.subpaths[i];
            if (subpath.isDrawable()) {
                // since the commands after this are relative to the previous 'point', we need to specify a move to the initial point
                const startPoint = subpath.segments[0].start;
                string += `M ${svgNumber(startPoint.x)} ${svgNumber(startPoint.y)} `;
                for(let k = 0; k < subpath.segments.length; k++){
                    string += `${subpath.segments[k].getSVGPathFragment()} `;
                }
                if (subpath.isClosed()) {
                    string += 'Z ';
                }
            }
        }
        return string;
    }
    /**
   * Returns a new Shape that is transformed by the associated matrix
   */ transformed(matrix) {
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        const subpaths = _.map(this.subpaths, (subpath)=>subpath.transformed(matrix));
        const bounds = _.reduce(subpaths, (bounds, subpath)=>bounds.union(subpath.bounds), Bounds2.NOTHING);
        return new Shape(subpaths, bounds);
    }
    /**
   * Converts this subpath to a new shape made of many line segments (approximating the current shape) with the
   * transformation applied.
   */ nonlinearTransformed(providedOptions) {
        const options = combineOptions({
            minLevels: 0,
            maxLevels: 7,
            distanceEpsilon: 0.16,
            curveEpsilon: providedOptions && providedOptions.includeCurvature ? 0.002 : null
        }, providedOptions);
        // TODO: allocation reduction https://github.com/phetsims/kite/issues/76
        const subpaths = _.map(this.subpaths, (subpath)=>subpath.nonlinearTransformed(options));
        const bounds = _.reduce(subpaths, (bounds, subpath)=>bounds.union(subpath.bounds), Bounds2.NOTHING);
        return new Shape(subpaths, bounds);
    }
    /**
   * Maps points by treating their x coordinate as polar angle, and y coordinate as polar magnitude.
   * See http://en.wikipedia.org/wiki/Polar_coordinate_system
   *
   * Please see Shape.nonlinearTransformed for more documentation on adaptive discretization options (minLevels, maxLevels, distanceEpsilon, curveEpsilon)
   *
   * Example: A line from (0,10) to (pi,10) will be transformed to a circular arc from (10,0) to (-10,0) passing through (0,10).
   */ polarToCartesian(options) {
        return this.nonlinearTransformed(combineOptions({
            pointMap: (p)=>Vector2.createPolar(p.y, p.x),
            methodName: 'polarToCartesian' // this will be called on Segments if it exists to do more optimized conversion (see Line)
        }, options));
    }
    /**
   * Converts each segment into lines, using an adaptive (midpoint distance subdivision) method.
   *
   * NOTE: uses nonlinearTransformed method internally, but since we don't provide a pointMap or methodName, it won't create anything but line segments.
   * See nonlinearTransformed for documentation of options
   */ toPiecewiseLinear(options) {
        assert && assert(!options || !options.pointMap, 'No pointMap for toPiecewiseLinear allowed, since it could create non-linear segments');
        assert && assert(!options || !options.methodName, 'No methodName for toPiecewiseLinear allowed, since it could create non-linear segments');
        return this.nonlinearTransformed(options);
    }
    /**
   * Is this point contained in this shape
   */ containsPoint(point) {
        // We pick a ray, and determine the winding number over that ray. if the number of segments crossing it
        // CCW == number of segments crossing it CW, then the point is contained in the shape
        const rayDirection = Vector2.X_UNIT.copy(); // we may mutate it
        // Try to find a ray that doesn't intersect with any of the vertices of the shape segments,
        // see https://github.com/phetsims/kite/issues/94.
        // Put a limit on attempts, so we don't try forever
        let count = 0;
        while(count < 5){
            count++;
            // Look for cases where the proposed ray will intersect with one of the vertices of a shape segment - in this case
            // the intersection in windingIntersection may not be well-defined and won't be counted, so we need to use a ray
            // with a different direction
            const rayIntersectsSegmentVertex = _.some(this.subpaths, (subpath)=>{
                return _.some(subpath.segments, (segment)=>{
                    const delta = segment.start.minus(point);
                    const magnitude = delta.magnitude;
                    if (magnitude !== 0) {
                        delta.divideScalar(magnitude); // normalize it
                        delta.subtract(rayDirection); // check against the proposed ray direction
                        return delta.magnitudeSquared < 1e-9;
                    } else {
                        // If our point is on a segment start, there probably won't be a great ray to use
                        return false;
                    }
                });
            });
            if (rayIntersectsSegmentVertex) {
                // the proposed ray may not work because it intersects with a segment vertex - try another one
                rayDirection.rotate(dotRandom.nextDouble());
            } else {
                break;
            }
        }
        return this.windingIntersection(new Ray2(point, rayDirection)) !== 0;
    }
    /**
   * Hit-tests this shape with the ray. An array of all intersections of the ray with this shape will be returned.
   * For this function, intersections will be returned sorted by the distance from the ray's position.
   */ intersection(ray) {
        let hits = [];
        const numSubpaths = this.subpaths.length;
        for(let i = 0; i < numSubpaths; i++){
            const subpath = this.subpaths[i];
            if (subpath.isDrawable()) {
                const numSegments = subpath.segments.length;
                for(let k = 0; k < numSegments; k++){
                    const segment = subpath.segments[k];
                    hits = hits.concat(segment.intersection(ray));
                }
                if (subpath.hasClosingSegment()) {
                    hits = hits.concat(subpath.getClosingSegment().intersection(ray));
                }
            }
        }
        return _.sortBy(hits, (hit)=>hit.distance);
    }
    /**
   * Returns whether the provided line segment would have some part on top or touching the interior (filled area) of
   * this shape.
   *
   * This differs somewhat from an intersection of the line segment with the Shape's path, as we will return true
   * ("intersection") if the line segment is entirely contained in the interior of the Shape's path.
   *
   * @param startPoint - One end of the line segment
   * @param endPoint - The other end of the line segment
   */ interiorIntersectsLineSegment(startPoint, endPoint) {
        // First check if our midpoint is in the Shape (as either our midpoint is in the Shape, OR the line segment will
        // intersect the Shape's boundary path).
        const midpoint = startPoint.blend(endPoint, 0.5);
        if (this.containsPoint(midpoint)) {
            return true;
        }
        // TODO: if an issue, we can reduce this allocation to a scratch variable local in the Shape.js scope. https://github.com/phetsims/kite/issues/76
        const delta = endPoint.minus(startPoint);
        const length = delta.magnitude;
        if (length === 0) {
            return false;
        }
        delta.normalize(); // so we can use it as a unit vector, expected by the Ray
        // Grab all intersections (that are from startPoint towards the direction of endPoint)
        const hits = this.intersection(new Ray2(startPoint, delta));
        // See if we have any intersections along our infinite ray whose distance from the startPoint is less than or
        // equal to our line segment's length.
        for(let i = 0; i < hits.length; i++){
            if (hits[i].distance <= length) {
                return true;
            }
        }
        // Did not hit the boundary, and wasn't fully contained.
        return false;
    }
    /**
   * Returns the winding number for intersection with a ray
   */ windingIntersection(ray) {
        let wind = 0;
        const numSubpaths = this.subpaths.length;
        for(let i = 0; i < numSubpaths; i++){
            const subpath = this.subpaths[i];
            if (subpath.isDrawable()) {
                const numSegments = subpath.segments.length;
                for(let k = 0; k < numSegments; k++){
                    wind += subpath.segments[k].windingIntersection(ray);
                }
                // handle the implicit closing line segment
                if (subpath.hasClosingSegment()) {
                    wind += subpath.getClosingSegment().windingIntersection(ray);
                }
            }
        }
        return wind;
    }
    /**
   * Whether the path of the Shape intersects (or is contained in) the provided bounding box.
   * Computed by checking intersections with all four edges of the bounding box, or whether the Shape is totally
   * contained within the bounding box.
   */ intersectsBounds(bounds) {
        // If the bounding box completely surrounds our shape, it intersects the bounds
        if (this.bounds.intersection(bounds).equals(this.bounds)) {
            return true;
        }
        // rays for hit testing along the bounding box edges
        const minHorizontalRay = new Ray2(new Vector2(bounds.minX, bounds.minY), new Vector2(1, 0));
        const minVerticalRay = new Ray2(new Vector2(bounds.minX, bounds.minY), new Vector2(0, 1));
        const maxHorizontalRay = new Ray2(new Vector2(bounds.maxX, bounds.maxY), new Vector2(-1, 0));
        const maxVerticalRay = new Ray2(new Vector2(bounds.maxX, bounds.maxY), new Vector2(0, -1));
        let hitPoint;
        let i;
        // TODO: could optimize to intersect differently so we bail sooner https://github.com/phetsims/kite/issues/76
        const horizontalRayIntersections = this.intersection(minHorizontalRay).concat(this.intersection(maxHorizontalRay));
        for(i = 0; i < horizontalRayIntersections.length; i++){
            hitPoint = horizontalRayIntersections[i].point;
            if (hitPoint.x >= bounds.minX && hitPoint.x <= bounds.maxX) {
                return true;
            }
        }
        const verticalRayIntersections = this.intersection(minVerticalRay).concat(this.intersection(maxVerticalRay));
        for(i = 0; i < verticalRayIntersections.length; i++){
            hitPoint = verticalRayIntersections[i].point;
            if (hitPoint.y >= bounds.minY && hitPoint.y <= bounds.maxY) {
                return true;
            }
        }
        // not contained, and no intersections with the sides of the bounding box
        return false;
    }
    /**
   * Returns a new Shape that is an outline of the stroked path of this current Shape. currently not intended to be
   * nested (doesn't do intersection computations yet)
   *
   * TODO: rename stroked( lineStyles )? https://github.com/phetsims/kite/issues/76
   */ getStrokedShape(lineStyles) {
        let subpaths = [];
        const bounds = Bounds2.NOTHING.copy();
        let subLen = this.subpaths.length;
        for(let i = 0; i < subLen; i++){
            const subpath = this.subpaths[i];
            const strokedSubpath = subpath.stroked(lineStyles);
            subpaths = subpaths.concat(strokedSubpath);
        }
        subLen = subpaths.length;
        for(let i = 0; i < subLen; i++){
            bounds.includeBounds(subpaths[i].bounds);
        }
        return new Shape(subpaths, bounds);
    }
    /**
   * Gets a shape offset by a certain amount.
   */ getOffsetShape(distance) {
        // TODO: abstract away this type of behavior https://github.com/phetsims/kite/issues/76
        const subpaths = [];
        const bounds = Bounds2.NOTHING.copy();
        let subLen = this.subpaths.length;
        for(let i = 0; i < subLen; i++){
            subpaths.push(this.subpaths[i].offset(distance));
        }
        subLen = subpaths.length;
        for(let i = 0; i < subLen; i++){
            bounds.includeBounds(subpaths[i].bounds);
        }
        return new Shape(subpaths, bounds);
    }
    /**
   * Returns a copy of this subpath with the dash "holes" removed (has many subpaths usually).
   */ getDashedShape(lineDash, lineDashOffset, providedOptions) {
        const options = optionize()({
            distanceEpsilon: 1e-10,
            curveEpsilon: 1e-8
        }, providedOptions);
        return new Shape(_.flatten(this.subpaths.map((subpath)=>subpath.dashed(lineDash, lineDashOffset, options.distanceEpsilon, options.curveEpsilon))));
    }
    /**
   * Returns the bounds of this shape. It is the bounding-box union of the bounds of each subpath contained.
   */ getBounds() {
        if (this._bounds === null) {
            const bounds = Bounds2.NOTHING.copy();
            _.each(this.subpaths, (subpath)=>{
                bounds.includeBounds(subpath.getBounds());
            });
            this._bounds = bounds;
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Returns the bounds for a stroked version of this shape. The input lineStyles are used to determine the size and
   * style of the stroke, and then the bounds of the stroked shape are returned.
   */ getStrokedBounds(lineStyles) {
        // Check if all of our segments end vertically or horizontally AND our drawable subpaths are all closed. If so,
        // we can apply a bounds dilation.
        let areStrokedBoundsDilated = true;
        for(let i = 0; i < this.subpaths.length; i++){
            const subpath = this.subpaths[i];
            // If a subpath with any segments is NOT closed, line-caps will apply. We can't make the simplification in this
            // case.
            if (subpath.isDrawable() && !subpath.isClosed()) {
                areStrokedBoundsDilated = false;
                break;
            }
            for(let j = 0; j < subpath.segments.length; j++){
                const segment = subpath.segments[j];
                if (!segment.areStrokedBoundsDilated()) {
                    areStrokedBoundsDilated = false;
                    break;
                }
            }
        }
        if (areStrokedBoundsDilated) {
            return this.bounds.dilated(lineStyles.lineWidth / 2);
        } else {
            const bounds = this.bounds.copy();
            for(let i = 0; i < this.subpaths.length; i++){
                const subpaths = this.subpaths[i].stroked(lineStyles);
                for(let j = 0; j < subpaths.length; j++){
                    bounds.includeBounds(subpaths[j].bounds);
                }
            }
            return bounds;
        }
    }
    /**
   * Returns a simplified form of this shape.
   *
   * Runs it through the normal CAG process, which should combine areas where possible, handles self-intersection,
   * etc.
   *
   * NOTE: Currently (2017-10-04) adjacent segments may get simplified only if they are lines. Not yet complete.
   */ getSimplifiedAreaShape() {
        return Graph.simplifyNonZero(this);
    }
    getBoundsWithTransform(matrix, lineStyles) {
        const bounds = Bounds2.NOTHING.copy();
        const numSubpaths = this.subpaths.length;
        for(let i = 0; i < numSubpaths; i++){
            const subpath = this.subpaths[i];
            bounds.includeBounds(subpath.getBoundsWithTransform(matrix));
        }
        if (lineStyles) {
            bounds.includeBounds(this.getStrokedShape(lineStyles).getBoundsWithTransform(matrix));
        }
        return bounds;
    }
    /**
   * Return an approximate value of the area inside of this Shape (where containsPoint is true) using Monte-Carlo.
   *
   * NOTE: Generally, use getArea(). This can be used for verification, but takes a large number of samples.
   *
   * @param numSamples - How many times to randomly check for inclusion of points.
   */ getApproximateArea(numSamples) {
        const x = this.bounds.minX;
        const y = this.bounds.minY;
        const width = this.bounds.width;
        const height = this.bounds.height;
        const rectangleArea = width * height;
        let count = 0;
        const point = new Vector2(0, 0);
        for(let i = 0; i < numSamples; i++){
            point.x = x + randomSource() * width;
            point.y = y + randomSource() * height;
            if (this.containsPoint(point)) {
                count++;
            }
        }
        return rectangleArea * count / numSamples;
    }
    /**
   * Return the area inside the Shape (where containsPoint is true), assuming there is no self-intersection or
   * overlap, and the same orientation (winding order) is used. Should also support holes (with opposite orientation),
   * assuming they don't intersect the containing subpath.
   */ getNonoverlappingArea() {
        // Only absolute-value the final value.
        return Math.abs(_.sum(this.subpaths.map((subpath)=>_.sum(subpath.getFillSegments().map((segment)=>segment.getSignedAreaFragment())))));
    }
    /**
   * Returns the area inside the shape.
   *
   * NOTE: This requires running it through a lot of computation to determine a non-overlapping non-self-intersecting
   *       form first. If the Shape is "simple" enough, getNonoverlappingArea would be preferred.
   */ getArea() {
        return this.getSimplifiedAreaShape().getNonoverlappingArea();
    }
    /**
   * Return the approximate location of the centroid of the Shape (the average of all points where containsPoint is true)
   * using Monte-Carlo methods.
   *
   * @param numSamples - How many times to randomly check for inclusion of points.
   */ getApproximateCentroid(numSamples) {
        const x = this.bounds.minX;
        const y = this.bounds.minY;
        const width = this.bounds.width;
        const height = this.bounds.height;
        let count = 0;
        const sum = new Vector2(0, 0);
        const point = new Vector2(0, 0);
        for(let i = 0; i < numSamples; i++){
            point.x = x + randomSource() * width;
            point.y = y + randomSource() * height;
            if (this.containsPoint(point)) {
                sum.add(point);
                count++;
            }
        }
        return sum.dividedScalar(count);
    }
    /**
   * Returns an array of potential closest point results on the Shape to the given point.
   */ getClosestPoints(point) {
        return Segment.filterClosestToPointResult(_.flatten(this.subpaths.map((subpath)=>subpath.getClosestPoints(point))));
    }
    /**
   * Returns a single point ON the Shape boundary that is closest to the given point (picks an arbitrary one if there
   * are multiple).
   */ getClosestPoint(point) {
        return this.getClosestPoints(point)[0].closestPoint;
    }
    /**
   * Should be called after mutating the x/y of Vector2 points that were passed in to various Shape calls, so that
   * derived information computed (bounds, etc.) will be correct, and any clients (e.g. Scenery Paths) will be
   * notified of the updates.
   */ invalidatePoints() {
        this._invalidatingPoints = true;
        const numSubpaths = this.subpaths.length;
        for(let i = 0; i < numSubpaths; i++){
            this.subpaths[i].invalidatePoints();
        }
        this._invalidatingPoints = false;
        this.invalidate();
    }
    toString() {
        // TODO: consider a more verbose but safer way? https://github.com/phetsims/kite/issues/76
        return `new phet.kite.Shape( '${this.getSVGPath().trim()}' )`;
    }
    /*---------------------------------------------------------------------------*
   * Internal subpath computations
   *----------------------------------------------------------------------------*/ invalidate() {
        assert && assert(!this._immutable, 'Attempt to modify an immutable Shape');
        if (!this._invalidatingPoints) {
            this._bounds = null;
            this.notifyInvalidationListeners();
        }
    }
    /**
   * Called when a part of the Shape has changed, or if metadata on the Shape has changed (e.g. it became immutable).
   */ notifyInvalidationListeners() {
        this.invalidatedEmitter.emit();
    }
    addSegmentAndBounds(segment) {
        this.getLastSubpath().addSegment(segment);
        this.invalidate();
    }
    /**
   * Makes sure that we have a subpath (and if there is no subpath, start it at this point)
   */ ensure(point) {
        if (!this.hasSubpaths()) {
            this.addSubpath(new Subpath());
            this.getLastSubpath().addPoint(point);
        }
    }
    /**
   * Adds a subpath
   */ addSubpath(subpath) {
        this.subpaths.push(subpath);
        // listen to when the subpath is invalidated (will cause bounds recomputation here)
        subpath.invalidatedEmitter.addListener(this._invalidateListener);
        this.invalidate();
        return this; // allow chaining
    }
    /**
   * Determines if there are any subpaths
   */ hasSubpaths() {
        return this.subpaths.length > 0;
    }
    /**
   * Gets the last subpath
   */ getLastSubpath() {
        assert && assert(this.hasSubpaths(), 'We should have a subpath if this is called');
        return _.last(this.subpaths);
    }
    /**
   * Gets the last point in the last subpath, or null if it doesn't exist
   */ getLastPoint() {
        assert && assert(this.hasSubpaths(), 'We should have a subpath if this is called');
        assert && assert(this.getLastSubpath().getLastPoint(), 'We should have a last point');
        return this.getLastSubpath().getLastPoint();
    }
    /**
   * Gets the last drawable segment in the last subpath, or null if it doesn't exist
   */ getLastSegment() {
        if (!this.hasSubpaths()) {
            return null;
        }
        const subpath = this.getLastSubpath();
        if (!subpath.isDrawable()) {
            return null;
        }
        return subpath.getLastSegment();
    }
    /**
   * Returns the control point to be used to create a smooth quadratic segments
   */ getSmoothQuadraticControlPoint() {
        const lastPoint = this.getLastPoint();
        if (this.lastQuadraticControlPoint) {
            return lastPoint.plus(lastPoint.minus(this.lastQuadraticControlPoint));
        } else {
            return lastPoint;
        }
    }
    /**
   * Returns the control point to be used to create a smooth cubic segment
   */ getSmoothCubicControlPoint() {
        const lastPoint = this.getLastPoint();
        if (this.lastCubicControlPoint) {
            return lastPoint.plus(lastPoint.minus(this.lastCubicControlPoint));
        } else {
            return lastPoint;
        }
    }
    /**
   * Returns the last point in the last subpath, or the Vector ZERO if it doesn't exist
   */ getRelativePoint() {
        let result = Vector2.ZERO;
        if (this.hasSubpaths()) {
            const subpath = this.getLastSubpath();
            if (subpath.points.length) {
                result = subpath.getLastPoint();
            }
        }
        return result;
    }
    /**
   * Returns a new shape that contains a union of the two shapes (a point in either shape is in the resulting shape).
   */ shapeUnion(shape) {
        return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_UNION);
    }
    /**
   * Returns a new shape that contains the intersection of the two shapes (a point in both shapes is in the
   * resulting shape).
   */ shapeIntersection(shape) {
        return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_INTERSECTION);
    }
    /**
   * Returns a new shape that contains the difference of the two shapes (a point in the first shape and NOT in the
   * second shape is in the resulting shape).
   */ shapeDifference(shape) {
        return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_DIFFERENCE);
    }
    /**
   * Returns a new shape that contains the xor of the two shapes (a point in only one shape is in the resulting
   * shape).
   */ shapeXor(shape) {
        return Graph.binaryResult(this, shape, Graph.BINARY_NONZERO_XOR);
    }
    /**
   * Returns a new shape that only contains portions of segments that are within the passed-in shape's area.
   *
   * // TODO: convert Graph to TS and get the types from there https://github.com/phetsims/kite/issues/76
   */ shapeClip(shape, options) {
        return Graph.clipShape(shape, this, options);
    }
    /**
   * Returns the (sometimes approximate) arc length of all the shape's subpaths combined.
   */ getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
        let length = 0;
        for(let i = 0; i < this.subpaths.length; i++){
            length += this.subpaths[i].getArcLength(distanceEpsilon, curveEpsilon, maxLevels);
        }
        return length;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'Shape',
            subpaths: this.subpaths.map((subpath)=>subpath.serialize())
        };
    }
    /**
   * Returns a Shape from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Shape');
        return new Shape(obj.subpaths.map(Subpath.deserialize));
    }
    /**
   * Creates a rectangle
   */ static rectangle(x, y, width, height) {
        return new Shape().rect(x, y, width, height);
    }
    /**
   * Creates a round rectangle {Shape}, with {number} arguments. Uses circular or elliptical arcs if given.
   */ static roundRect(x, y, width, height, arcw, arch) {
        return new Shape().roundRect(x, y, width, height, arcw, arch);
    }
    /**
   * Creates a rounded rectangle, where each corner can have a different radius. The radii default to 0, and may be set
   * using topLeft, topRight, bottomLeft and bottomRight in the options. If the specified radii are larger than the dimension
   * on that side, they radii are reduced proportionally, see https://github.com/phetsims/under-pressure/issues/151
   *
   * E.g.:
   *
   * var cornerRadius = 20;
   * var rect = Shape.roundedRectangleWithRadii( 0, 0, 200, 100, {
   *   topLeft: cornerRadius,
   *   topRight: cornerRadius
   * } );
   *
   * @param x - Left edge position
   * @param y - Top edge position
   * @param width - Width of rectangle
   * @param height - Height of rectangle
   * @param [cornerRadii] - Optional object with potential radii for each corner.
   */ static roundedRectangleWithRadii(x, y, width, height, cornerRadii) {
        // defaults to 0 (not using merge, since we reference each multiple times)
        let topLeftRadius = cornerRadii && cornerRadii.topLeft || 0;
        let topRightRadius = cornerRadii && cornerRadii.topRight || 0;
        let bottomLeftRadius = cornerRadii && cornerRadii.bottomLeft || 0;
        let bottomRightRadius = cornerRadii && cornerRadii.bottomRight || 0;
        // type and constraint assertions
        assert && assert(isFinite(x), 'Non-finite x');
        assert && assert(isFinite(y), 'Non-finite y');
        assert && assert(width >= 0 && isFinite(width), 'Negative or non-finite width');
        assert && assert(height >= 0 && isFinite(height), 'Negative or non-finite height');
        assert && assert(topLeftRadius >= 0 && isFinite(topLeftRadius), 'Invalid topLeft');
        assert && assert(topRightRadius >= 0 && isFinite(topRightRadius), 'Invalid topRight');
        assert && assert(bottomLeftRadius >= 0 && isFinite(bottomLeftRadius), 'Invalid bottomLeft');
        assert && assert(bottomRightRadius >= 0 && isFinite(bottomRightRadius), 'Invalid bottomRight');
        // The width and height take precedence over the corner radii. If the sum of the corner radii exceed
        // that dimension, then the corner radii are reduced proportionately
        const topSum = topLeftRadius + topRightRadius;
        if (topSum > width && topSum > 0) {
            topLeftRadius = topLeftRadius / topSum * width;
            topRightRadius = topRightRadius / topSum * width;
        }
        const bottomSum = bottomLeftRadius + bottomRightRadius;
        if (bottomSum > width && bottomSum > 0) {
            bottomLeftRadius = bottomLeftRadius / bottomSum * width;
            bottomRightRadius = bottomRightRadius / bottomSum * width;
        }
        const leftSum = topLeftRadius + bottomLeftRadius;
        if (leftSum > height && leftSum > 0) {
            topLeftRadius = topLeftRadius / leftSum * height;
            bottomLeftRadius = bottomLeftRadius / leftSum * height;
        }
        const rightSum = topRightRadius + bottomRightRadius;
        if (rightSum > height && rightSum > 0) {
            topRightRadius = topRightRadius / rightSum * height;
            bottomRightRadius = bottomRightRadius / rightSum * height;
        }
        // verify there is no overlap between corners
        assert && assert(topLeftRadius + topRightRadius <= width, 'Corner overlap on top edge');
        assert && assert(bottomLeftRadius + bottomRightRadius <= width, 'Corner overlap on bottom edge');
        assert && assert(topLeftRadius + bottomLeftRadius <= height, 'Corner overlap on left edge');
        assert && assert(topRightRadius + bottomRightRadius <= height, 'Corner overlap on right edge');
        const shape = new Shape();
        const right = x + width;
        const bottom = y + height;
        // To draw the rounded rectangle, we use the implicit "line from last segment to next segment" and the close() for
        // all the straight line edges between arcs, or lineTo the corner.
        if (bottomRightRadius > 0) {
            shape.arc(right - bottomRightRadius, bottom - bottomRightRadius, bottomRightRadius, 0, Math.PI / 2, false);
        } else {
            shape.moveTo(right, bottom);
        }
        if (bottomLeftRadius > 0) {
            shape.arc(x + bottomLeftRadius, bottom - bottomLeftRadius, bottomLeftRadius, Math.PI / 2, Math.PI, false);
        } else {
            shape.lineTo(x, bottom);
        }
        if (topLeftRadius > 0) {
            shape.arc(x + topLeftRadius, y + topLeftRadius, topLeftRadius, Math.PI, 3 * Math.PI / 2, false);
        } else {
            shape.lineTo(x, y);
        }
        if (topRightRadius > 0) {
            shape.arc(right - topRightRadius, y + topRightRadius, topRightRadius, 3 * Math.PI / 2, 2 * Math.PI, false);
        } else {
            shape.lineTo(right, y);
        }
        shape.close();
        return shape;
    }
    /**
   * Returns a Shape from a bounds, offset (expanded) by certain amounts, and with certain corner radii.
   */ static boundsOffsetWithRadii(bounds, offsets, radii) {
        const offsetBounds = bounds.withOffsets(offsets.left, offsets.top, offsets.right, offsets.bottom);
        return Shape.roundedRectangleWithRadii(offsetBounds.minX, offsetBounds.minY, offsetBounds.width, offsetBounds.height, radii);
    }
    /**
   * Creates a closed polygon from an array of vertices by connecting them by a series of lines.
   * The lines are joining the adjacent vertices in the array.
   */ static polygon(vertices) {
        return new Shape().polygon(vertices);
    }
    /**
   * Creates a rectangular shape from bounds
   */ static bounds(bounds) {
        return new Shape().rect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    }
    static lineSegment(a, b, c, d) {
        if (typeof a === 'number') {
            return new Shape().moveTo(a, b).lineTo(c, d);
        } else {
            // then a and b must be {Vector2}
            return new Shape().moveToPoint(a).lineToPoint(b);
        }
    }
    /**
   * Returns a regular polygon of radius and number of sides
   * The regular polygon is oriented such that the first vertex lies on the positive x-axis.
   *
   * @param sides - an integer
   * @param radius
   */ static regularPolygon(sides, radius) {
        const shape = new Shape();
        _.each(_.range(sides), (k)=>{
            const point = Vector2.createPolar(radius, 2 * Math.PI * k / sides);
            k === 0 ? shape.moveToPoint(point) : shape.lineToPoint(point);
        });
        return shape.close();
    }
    static circle(a, b, c) {
        if (b === undefined) {
            // circle( radius ), center = 0,0
            return new Shape().circle(0, 0, a);
        }
        // @ts-expect-error - The signatures are compatible, it's just multiple different types at the same time
        return new Shape().circle(a, b, c);
    }
    static ellipse(a, b, c, d, e) {
        // TODO: Ellipse/EllipticalArc has a mess of parameters. Consider parameter object, or double-check parameter handling https://github.com/phetsims/kite/issues/76
        if (d === undefined) {
            // ellipse( radiusX, radiusY ), center = 0,0
            return new Shape().ellipse(0, 0, a, b, c);
        }
        // @ts-expect-error - The signatures are compatible, it's just multiple different types at the same time
        return new Shape().ellipse(a, b, c, d, e);
    }
    static arc(a, b, c, d, e, f) {
        // @ts-expect-error - The signatures are compatible, it's just multiple different types at the same time
        return new Shape().arc(a, b, c, d, e, f);
    }
    /**
   * Returns the union of an array of shapes.
   */ static union(shapes) {
        return Graph.unionNonZero(shapes);
    }
    /**
   * Returns the intersection of an array of shapes.
   */ static intersection(shapes) {
        return Graph.intersectionNonZero(shapes);
    }
    /**
   * Returns the xor of an array of shapes.
   */ static xor(shapes) {
        return Graph.xorNonZero(shapes);
    }
    /**
   * Returns a new Shape constructed by appending a list of segments together.
   */ static segments(segments, closed) {
        if (assert) {
            for(let i = 1; i < segments.length; i++){
                assert(segments[i - 1].end.equalsEpsilon(segments[i].start, 1e-6), 'Mismatched start/end');
            }
        }
        return new Shape([
            new Subpath(segments, undefined, !!closed)
        ]);
    }
    /**
   * All arguments optional, they are for the copy() method. if used, ensure that 'bounds' is consistent with 'subpaths'
   */ constructor(subpaths, bounds){
        // Lower-level piecewise mathematical description using segments, also individually immutable
        this.subpaths = [];
        // So we can invalidate all of the points without firing invalidation tons of times
        this._invalidatingPoints = false;
        // When set by makeImmutable(), it indicates this Shape won't be changed from now on, and attempts to change it may
        // result in errors.
        this._immutable = false;
        this.invalidatedEmitter = new TinyEmitter();
        // For tracking the last quadratic/cubic control point for smooth* functions,
        // see https://github.com/phetsims/kite/issues/38
        this.lastQuadraticControlPoint = null;
        this.lastCubicControlPoint = null;
        this._bounds = bounds ? bounds.copy() : null;
        this.resetControlPoints();
        this._invalidateListener = this.invalidate.bind(this);
        // Add in subpaths from the constructor (if applicable)
        if (typeof subpaths === 'object') {
            // assume it's an array
            for(let i = 0; i < subpaths.length; i++){
                this.addSubpath(subpaths[i]);
            }
        }
        if (subpaths && typeof subpaths !== 'object') {
            // parse the SVG path
            _.each(svgPath.parse(subpaths), (item)=>{
                assert && assert(Shape.prototype[item.cmd] !== undefined, `method ${item.cmd} from parsed SVG does not exist`);
                // @ts-expect-error - This is a valid call, but TypeScript isn't figuring it out based on the union type right now
                this[item.cmd].apply(this, item.args); // eslint-disable-line prefer-spread
            });
        }
        // defines _bounds if not already defined (among other things)
        this.invalidate();
    }
};
Shape.rect = Shape.rectangle;
Shape.roundRectangle = Shape.roundRect;
kite.register('Shape', Shape);
export default Shape;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2tpdGUvanMvU2hhcGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2hhcGUgaGFuZGxpbmdcbiAqXG4gKiBTaGFwZXMgYXJlIGludGVybmFsbHkgbWFkZSB1cCBvZiBTdWJwYXRocywgd2hpY2ggY29udGFpbiBhIHNlcmllcyBvZiBzZWdtZW50cywgYW5kIGFyZSBvcHRpb25hbGx5IGNsb3NlZC5cbiAqIEZhbWlsaWFyaXR5IHdpdGggaG93IENhbnZhcyBoYW5kbGVzIHN1YnBhdGhzIGlzIGhlbHBmdWwgZm9yIHVuZGVyc3RhbmRpbmcgdGhpcyBjb2RlLlxuICpcbiAqIENhbnZhcyBzcGVjOiBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvXG4gKiBTVkcgc3BlYzogaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL2V4cGFuZGVkLXRvYy5odG1sXG4gKiAgICAgICAgICAgaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3BhdGhzLmh0bWwjUGF0aERhdGEgKGZvciBwYXRocylcbiAqIE5vdGVzIGZvciBlbGxpcHRpY2FsIGFyY3M6IGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9pbXBsbm90ZS5odG1sI1BhdGhFbGVtZW50SW1wbGVtZW50YXRpb25Ob3Rlc1xuICogTm90ZXMgZm9yIHBhaW50aW5nIHN0cm9rZXM6IGh0dHBzOi8vc3Znd2cub3JnL3N2ZzItZHJhZnQvcGFpbnRpbmcuaHRtbFxuICpcbiAqIFRPRE86IGFkZCBub256ZXJvIC8gZXZlbm9kZCBzdXBwb3J0IHdoZW4gYnJvd3NlcnMgc3VwcG9ydCBpdCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAqIFRPRE86IGRvY3NcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBSYXkyIGZyb20gJy4uLy4uL2RvdC9qcy9SYXkyLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEFyYywgQ2xvc2VzdFRvUG9pbnRSZXN1bHQsIEN1YmljLCBFbGxpcHRpY2FsQXJjLCBHcmFwaCwga2l0ZSwgTGluZSwgTGluZVN0eWxlcywgUGllY2V3aXNlTGluZWFyT3B0aW9ucywgUXVhZHJhdGljLCBSYXlJbnRlcnNlY3Rpb24sIFNlZ21lbnQsIFN1YnBhdGgsIHN2Z051bWJlciwgc3ZnUGF0aCB9IGZyb20gJy4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBTZXJpYWxpemVkU3VicGF0aCB9IGZyb20gJy4vdXRpbC9TdWJwYXRoLmpzJztcblxuLy8gKFdlIGNhbid0IGdldCBqb2lzdCdzIHJhbmRvbSByZWZlcmVuY2UgaGVyZSlcbmNvbnN0IHJhbmRvbVNvdXJjZSA9IE1hdGgucmFuZG9tO1xuXG4vLyBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBWZWN0b3IyLCB1c2VkIHRocm91Z2hvdXQgdGhpcyBmaWxlIGFzIGFuIGFiYnJldmlhdGlvbiBmb3IgYSBkaXNwbGFjZW1lbnQsIGFcbi8vIHBvc2l0aW9uIG9yIGEgcG9pbnQuXG5jb25zdCB2ID0gKCB4OiBudW1iZXIsIHk6IG51bWJlciApID0+IG5ldyBWZWN0b3IyKCB4LCB5ICk7XG5cbi8qKlxuICogVGhlIHRlbnNpb24gcGFyYW1ldGVyIGNvbnRyb2xzIGhvdyBzbW9vdGhseSB0aGUgY3VydmUgdHVybnMgdGhyb3VnaCBpdHMgY29udHJvbCBwb2ludHMuIEZvciBhIENhdG11bGwtUm9tIGN1cnZlLFxuICogdGhlIHRlbnNpb24gaXMgemVyby4gVGhlIHRlbnNpb24gc2hvdWxkIHJhbmdlIGZyb20gLTEgdG8gMS5cbiAqIEBwYXJhbSBiZWZvcmVWZWN0b3JcbiAqIEBwYXJhbSBjdXJyZW50VmVjdG9yXG4gKiBAcGFyYW0gYWZ0ZXJWZWN0b3JcbiAqIEBwYXJhbSB0ZW5zaW9uIC0gdGhlIHRlbnNpb24gc2hvdWxkIHJhbmdlIGZyb20gLTEgdG8gMS5cbiAqL1xuY29uc3Qgd2VpZ2h0ZWRTcGxpbmVWZWN0b3IgPSAoIGJlZm9yZVZlY3RvcjogVmVjdG9yMiwgY3VycmVudFZlY3RvcjogVmVjdG9yMiwgYWZ0ZXJWZWN0b3I6IFZlY3RvcjIsIHRlbnNpb246IG51bWJlciApID0+IHtcbiAgcmV0dXJuIGFmdGVyVmVjdG9yLmNvcHkoKVxuICAgIC5zdWJ0cmFjdCggYmVmb3JlVmVjdG9yIClcbiAgICAubXVsdGlwbHlTY2FsYXIoICggMSAtIHRlbnNpb24gKSAvIDYgKVxuICAgIC5hZGQoIGN1cnJlbnRWZWN0b3IgKTtcbn07XG5cbi8vIGEgbm9ybWFsaXplZCB2ZWN0b3IgZm9yIG5vbi16ZXJvIHdpbmRpbmcgY2hlY2tzXG4vLyB2YXIgd2VpcmREaXIgPSB2KCBNYXRoLlBJLCAyMiAvIDcgKTtcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFNoYXBlID0ge1xuICB0eXBlOiAnU2hhcGUnO1xuICBzdWJwYXRoczogU2VyaWFsaXplZFN1YnBhdGhbXTtcbn07XG5cbnR5cGUgQ2FyZGluYWxTcGxpbmVPcHRpb25zID0ge1xuICAvLyB0aGUgdGVuc2lvbiBwYXJhbWV0ZXIgY29udHJvbHMgaG93IHNtb290aGx5IHRoZSBjdXJ2ZSB0dXJucyB0aHJvdWdoIGl0c1xuICAvLyBjb250cm9sIHBvaW50cy4gRm9yIGEgQ2F0bXVsbC1Sb20gY3VydmUgdGhlIHRlbnNpb24gaXMgemVyby5cbiAgLy8gdGhlIHRlbnNpb24gc2hvdWxkIHJhbmdlIGZyb20gIC0xIHRvIDFcbiAgdGVuc2lvbj86IG51bWJlcjtcblxuICAvLyBpcyB0aGUgcmVzdWx0aW5nIHNoYXBlIGZvcm1pbmcgYSBjbG9zZWQgbGluZT9cbiAgaXNDbG9zZWRMaW5lU2VnbWVudHM/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgTm9ubGluZWFyVHJhbnNmb3JtZWRPcHRpb25zID0ge1xuICAvLyB3aGV0aGVyIHRvIGluY2x1ZGUgYSBkZWZhdWx0IGN1cnZlRXBzaWxvbiAodXN1YWxseSBvZmYgYnkgZGVmYXVsdClcbiAgaW5jbHVkZUN1cnZhdHVyZT86IGJvb2xlYW47XG59ICYgUGllY2V3aXNlTGluZWFyT3B0aW9ucztcblxudHlwZSBHZXREYXNoZWRTaGFwZU9wdGlvbnMgPSB7XG4gIC8vIGNvbnRyb2xzIGxldmVsIG9mIHN1YmRpdmlzaW9uIGJ5IGF0dGVtcHRpbmcgdG8gZW5zdXJlIGEgbWF4aW11bSAoc3F1YXJlZCkgZGV2aWF0aW9uIGZyb20gdGhlIGN1cnZlXG4gIGRpc3RhbmNlRXBzaWxvbj86IG51bWJlcjtcblxuICAvLyBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZSBiZXR3ZWVuIHNlZ21lbnRzXG4gIGN1cnZlRXBzaWxvbj86IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIENvcm5lclJhZGlpT3B0aW9ucyA9IHtcbiAgdG9wTGVmdDogbnVtYmVyO1xuICB0b3BSaWdodDogbnVtYmVyO1xuICBib3R0b21SaWdodDogbnVtYmVyO1xuICBib3R0b21MZWZ0OiBudW1iZXI7XG59O1xuXG50eXBlIE9mZnNldHNPcHRpb25zID0ge1xuICBsZWZ0OiBudW1iZXI7XG4gIHRvcDogbnVtYmVyO1xuICByaWdodDogbnVtYmVyO1xuICBib3R0b206IG51bWJlcjtcbn07XG5cbi8vIFNUQVRJQyBBUEkgdGhhdCBpcyB1c2VkIHdoZW4gdHVybmluZyBwYXJzZWQgU1ZHIGludG8gYSBTaGFwZS4gTWV0aG9kcyB3aXRoIHRoZXNlIHR5cGVzIHdpbGwgYmUgY2FsbGVkIGR1cmluZyB0aGVcbi8vIFwiYXBwbHkgcGFyc2VkIFNWR1wiIHN0ZXAuIElGIHRoZXNlIG5lZWQgdG8gYmUgY2hhbmdlZCwgaXQgd2lsbCBuZWVkIHRvIGJlIGFjY29tcGFuaWVkIGJ5IGNoYW5nZXMgdG8gc3ZnUGF0aC5wZWdqc1xuLy8gYW5kIHRoZSBTVkcgcGFyc2VyLiBJZiB3ZSBjaGFuZ2UgdGhpcyBXSVRIT1VUIGRvaW5nIHRoYXQsIHRoaW5ncyB3aWxsIGJyZWFrIChzbyBiYXNpY2FsbHksIGRvbid0IGNoYW5nZSB0aGlzKS5cbnR5cGUgQ2FuQXBwbHlQYXJzZWRTVkcgPSB7XG4gIG1vdmVUbyggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIG1vdmVUb1JlbGF0aXZlKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBTaGFwZTtcbiAgbGluZVRvKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBTaGFwZTtcbiAgbGluZVRvUmVsYXRpdmUoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFNoYXBlO1xuICBjbG9zZSgpOiBTaGFwZTtcbiAgaG9yaXpvbnRhbExpbmVUbyggeDogbnVtYmVyICk6IFNoYXBlO1xuICBob3Jpem9udGFsTGluZVRvUmVsYXRpdmUoIHg6IG51bWJlciApOiBTaGFwZTtcbiAgdmVydGljYWxMaW5lVG8oIHk6IG51bWJlciApOiBTaGFwZTtcbiAgdmVydGljYWxMaW5lVG9SZWxhdGl2ZSggeTogbnVtYmVyICk6IFNoYXBlO1xuICBjdWJpY0N1cnZlVG8oIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFNoYXBlO1xuICBjdWJpY0N1cnZlVG9SZWxhdGl2ZSggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIHNtb290aEN1YmljQ3VydmVUbyggeDI6IG51bWJlciwgeTI6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIHNtb290aEN1YmljQ3VydmVUb1JlbGF0aXZlKCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBTaGFwZTtcbiAgcXVhZHJhdGljQ3VydmVUbyggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIHF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZSggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIHNtb290aFF1YWRyYXRpY0N1cnZlVG8oIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFNoYXBlO1xuICBzbW9vdGhRdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFNoYXBlO1xuICBlbGxpcHRpY2FsQXJjVG8oIHJ4OiBudW1iZXIsIHJ5OiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIsIGxhcmdlQXJjOiBib29sZWFuLCBzd2VlcDogYm9vbGVhbiwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogU2hhcGU7XG4gIGVsbGlwdGljYWxBcmNUb1JlbGF0aXZlKCByeDogbnVtYmVyLCByeTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyLCBsYXJnZUFyYzogYm9vbGVhbiwgc3dlZXA6IGJvb2xlYW4sIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFNoYXBlO1xufTtcblxuLy8gVHlwZSBvZiB0aGUgcGFyc2VkIFNWRyBpdGVtIHRoYXQgaXMgcmV0dXJuZWQgYnkgdGhlIHBhcnNlciAoZnJvbSBzdmdQYXRoLmpzKVxudHlwZSBQYXJzZWRTVkdJdGVtID0ge1xuICAvLyBUdXJuIGVhY2ggbWV0aG9kIGludG8geyBjbWQ6ICdtZXRob2ROYW1lJywgYXJnczogWyAuLi4gXSB9XG4gIFtLIGluIGtleW9mIENhbkFwcGx5UGFyc2VkU1ZHXTogQ2FuQXBwbHlQYXJzZWRTVkdbIEsgXSBleHRlbmRzICggLi4uYXJnczogaW5mZXIgQXJncyApID0+IFNoYXBlID8geyBjbWQ6IEs7IGFyZ3M6IEFyZ3MgfSA6IG5ldmVyO1xufVsga2V5b2YgQ2FuQXBwbHlQYXJzZWRTVkcgXTtcblxuY2xhc3MgU2hhcGUgaW1wbGVtZW50cyBDYW5BcHBseVBhcnNlZFNWRyB7XG5cbiAgLy8gTG93ZXItbGV2ZWwgcGllY2V3aXNlIG1hdGhlbWF0aWNhbCBkZXNjcmlwdGlvbiB1c2luZyBzZWdtZW50cywgYWxzbyBpbmRpdmlkdWFsbHkgaW1tdXRhYmxlXG4gIHB1YmxpYyByZWFkb25seSBzdWJwYXRoczogU3VicGF0aFtdID0gW107XG5cbiAgLy8gSWYgbm9uLW51bGwsIGNvbXB1dGVkIGJvdW5kcyBmb3IgYWxsIHBpZWNlcyBhZGRlZCBzbyBmYXIuIExhemlseSBjb21wdXRlZCB3aXRoIGdldEJvdW5kcy9ib3VuZHMgRVM1IGdldHRlclxuICBwcml2YXRlIF9ib3VuZHM6IEJvdW5kczIgfCBudWxsO1xuXG4gIC8vIFNvIHdlIGNhbiBpbnZhbGlkYXRlIGFsbCBvZiB0aGUgcG9pbnRzIHdpdGhvdXQgZmlyaW5nIGludmFsaWRhdGlvbiB0b25zIG9mIHRpbWVzXG4gIHByaXZhdGUgX2ludmFsaWRhdGluZ1BvaW50cyA9IGZhbHNlO1xuXG4gIC8vIFdoZW4gc2V0IGJ5IG1ha2VJbW11dGFibGUoKSwgaXQgaW5kaWNhdGVzIHRoaXMgU2hhcGUgd29uJ3QgYmUgY2hhbmdlZCBmcm9tIG5vdyBvbiwgYW5kIGF0dGVtcHRzIHRvIGNoYW5nZSBpdCBtYXlcbiAgLy8gcmVzdWx0IGluIGVycm9ycy5cbiAgcHJpdmF0ZSBfaW1tdXRhYmxlID0gZmFsc2U7XG5cbiAgcHVibGljIHJlYWRvbmx5IGludmFsaWRhdGVkRW1pdHRlcjogVGlueUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9pbnZhbGlkYXRlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gRm9yIHRyYWNraW5nIHRoZSBsYXN0IHF1YWRyYXRpYy9jdWJpYyBjb250cm9sIHBvaW50IGZvciBzbW9vdGgqIGZ1bmN0aW9ucyxcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy8zOFxuICBwcml2YXRlIGxhc3RRdWFkcmF0aWNDb250cm9sUG9pbnQ6IFZlY3RvcjIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0Q3ViaWNDb250cm9sUG9pbnQ6IFZlY3RvcjIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQWxsIGFyZ3VtZW50cyBvcHRpb25hbCwgdGhleSBhcmUgZm9yIHRoZSBjb3B5KCkgbWV0aG9kLiBpZiB1c2VkLCBlbnN1cmUgdGhhdCAnYm91bmRzJyBpcyBjb25zaXN0ZW50IHdpdGggJ3N1YnBhdGhzJ1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJwYXRocz86IFN1YnBhdGhbXSB8IHN0cmluZywgYm91bmRzPzogQm91bmRzMiApIHtcblxuICAgIHRoaXMuX2JvdW5kcyA9IGJvdW5kcyA/IGJvdW5kcy5jb3B5KCkgOiBudWxsO1xuXG4gICAgdGhpcy5yZXNldENvbnRyb2xQb2ludHMoKTtcblxuICAgIHRoaXMuX2ludmFsaWRhdGVMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZS5iaW5kKCB0aGlzICk7XG5cbiAgICAvLyBBZGQgaW4gc3VicGF0aHMgZnJvbSB0aGUgY29uc3RydWN0b3IgKGlmIGFwcGxpY2FibGUpXG4gICAgaWYgKCB0eXBlb2Ygc3VicGF0aHMgPT09ICdvYmplY3QnICkge1xuICAgICAgLy8gYXNzdW1lIGl0J3MgYW4gYXJyYXlcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN1YnBhdGhzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0aGlzLmFkZFN1YnBhdGgoIHN1YnBhdGhzWyBpIF0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHN1YnBhdGhzICYmIHR5cGVvZiBzdWJwYXRocyAhPT0gJ29iamVjdCcgKSB7XG4gICAgICAvLyBwYXJzZSB0aGUgU1ZHIHBhdGhcbiAgICAgIF8uZWFjaCggc3ZnUGF0aC5wYXJzZSggc3VicGF0aHMgKSwgKCBpdGVtOiBQYXJzZWRTVkdJdGVtICkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBTaGFwZS5wcm90b3R5cGVbIGl0ZW0uY21kIF0gIT09IHVuZGVmaW5lZCwgYG1ldGhvZCAke2l0ZW0uY21kfSBmcm9tIHBhcnNlZCBTVkcgZG9lcyBub3QgZXhpc3RgICk7XG5cbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRoaXMgaXMgYSB2YWxpZCBjYWxsLCBidXQgVHlwZVNjcmlwdCBpc24ndCBmaWd1cmluZyBpdCBvdXQgYmFzZWQgb24gdGhlIHVuaW9uIHR5cGUgcmlnaHQgbm93XG4gICAgICAgIHRoaXNbIGl0ZW0uY21kIF0uYXBwbHkoIHRoaXMsIGl0ZW0uYXJncyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHByZWZlci1zcHJlYWRcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBkZWZpbmVzIF9ib3VuZHMgaWYgbm90IGFscmVhZHkgZGVmaW5lZCAoYW1vbmcgb3RoZXIgdGhpbmdzKVxuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICB9XG5cblxuICAvKipcbiAgICogUmVzZXRzIHRoZSBjb250cm9sIHBvaW50c1xuICAgKlxuICAgKiBmb3IgdHJhY2tpbmcgdGhlIGxhc3QgcXVhZHJhdGljL2N1YmljIGNvbnRyb2wgcG9pbnQgZm9yIHNtb290aCogZnVuY3Rpb25zXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvMzhcbiAgICovXG4gIHByaXZhdGUgcmVzZXRDb250cm9sUG9pbnRzKCk6IHZvaWQge1xuICAgIHRoaXMubGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCA9IG51bGw7XG4gICAgdGhpcy5sYXN0Q3ViaWNDb250cm9sUG9pbnQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHF1YWRyYXRpYyBjb250cm9sIHBvaW50XG4gICAqL1xuICBwcml2YXRlIHNldFF1YWRyYXRpY0NvbnRyb2xQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogdm9pZCB7XG4gICAgdGhpcy5sYXN0UXVhZHJhdGljQ29udHJvbFBvaW50ID0gcG9pbnQ7XG4gICAgdGhpcy5sYXN0Q3ViaWNDb250cm9sUG9pbnQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1YmljIGNvbnRyb2wgcG9pbnRcbiAgICovXG4gIHByaXZhdGUgc2V0Q3ViaWNDb250cm9sUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xuICAgIHRoaXMubGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCA9IG51bGw7XG4gICAgdGhpcy5sYXN0Q3ViaWNDb250cm9sUG9pbnQgPSBwb2ludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0byBhIHBvaW50IGdpdmVuIGJ5IHRoZSBjb29yZGluYXRlcyB4IGFuZCB5XG4gICAqL1xuICBwdWJsaWMgbW92ZVRvKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5tb3ZlVG9Qb2ludCggdiggeCwgeSApICk7XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgYSByZWxhdGl2ZSBkaXNwbGFjZW1lbnQgKHgseSkgZnJvbSBsYXN0IHBvaW50XG4gICAqL1xuICBwdWJsaWMgbW92ZVRvUmVsYXRpdmUoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xuICAgIHJldHVybiB0aGlzLm1vdmVUb1BvaW50UmVsYXRpdmUoIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIGEgcmVsYXRpdmUgZGlzcGxhY2VtZW50IChwb2ludCkgZnJvbSBsYXN0IHBvaW50XG4gICAqL1xuICBwdWJsaWMgbW92ZVRvUG9pbnRSZWxhdGl2ZSggZGlzcGxhY2VtZW50OiBWZWN0b3IyICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLm1vdmVUb1BvaW50KCB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKS5wbHVzKCBkaXNwbGFjZW1lbnQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhpcyBzaGFwZSBhIHN1YnBhdGggdGhhdCBtb3ZlcyAobm8gam9pbnQpIGl0IHRvIGEgcG9pbnRcbiAgICovXG4gIHB1YmxpYyBtb3ZlVG9Qb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgdGhpcy5hZGRTdWJwYXRoKCBuZXcgU3VicGF0aCgpLmFkZFBvaW50KCBwb2ludCApICk7XG4gICAgdGhpcy5yZXNldENvbnRyb2xQb2ludHMoKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRvIHRoaXMgc2hhcGUgYSBzdHJhaWdodCBsaW5lIGZyb20gbGFzdCBwb2ludCB0byB0aGUgY29vcmRpbmF0ZSAoeCx5KVxuICAgKi9cbiAgcHVibGljIGxpbmVUbyggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XG4gICAgcmV0dXJuIHRoaXMubGluZVRvUG9pbnQoIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhpcyBzaGFwZSBhIHN0cmFpZ2h0IGxpbmUgZGlzcGxhY2VkIGJ5IGEgcmVsYXRpdmUgYW1vdW50IHgsIGFuZCB5IGZyb20gbGFzdCBwb2ludFxuICAgKlxuICAgKiBAcGFyYW0geCAtIGhvcml6b250YWwgZGlzcGxhY2VtZW50XG4gICAqIEBwYXJhbSB5IC0gdmVydGljYWwgZGlzcGxhY2VtZW50XG4gICAqL1xuICBwdWJsaWMgbGluZVRvUmVsYXRpdmUoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xuICAgIHJldHVybiB0aGlzLmxpbmVUb1BvaW50UmVsYXRpdmUoIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdG8gdGhpcyBzaGFwZSBhIHN0cmFpZ2h0IGxpbmUgZGlzcGxhY2VkIGJ5IGEgcmVsYXRpdmUgZGlzcGxhY2VtZW50IChwb2ludClcbiAgICovXG4gIHB1YmxpYyBsaW5lVG9Qb2ludFJlbGF0aXZlKCBkaXNwbGFjZW1lbnQ6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMubGluZVRvUG9pbnQoIHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpLnBsdXMoIGRpc3BsYWNlbWVudCApICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0byB0aGlzIHNoYXBlIGEgc3RyYWlnaHQgbGluZSBmcm9tIHRoaXMgbGFzdFBvaW50IHRvIHBvaW50XG4gICAqL1xuICBwdWJsaWMgbGluZVRvUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IHRoaXMge1xuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLWxpbmV0b1xuICAgIGlmICggdGhpcy5oYXNTdWJwYXRocygpICkge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCk7XG4gICAgICBjb25zdCBlbmQgPSBwb2ludDtcbiAgICAgIGNvbnN0IGxpbmUgPSBuZXcgTGluZSggc3RhcnQsIGVuZCApO1xuICAgICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCBlbmQgKTtcbiAgICAgIHRoaXMuYWRkU2VnbWVudEFuZEJvdW5kcyggbGluZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZW5zdXJlKCBwb2ludCApO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0Q29udHJvbFBvaW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgaG9yaXpvbnRhbCBsaW5lICh4IHJlcHJlc2VudHMgdGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgZW5kIHBvaW50KVxuICAgKi9cbiAgcHVibGljIGhvcml6b250YWxMaW5lVG8oIHg6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5saW5lVG8oIHgsIHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpLnkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgaG9yaXpvbnRhbCBsaW5lICh4IHJlcHJlc2VudCBhIGhvcml6b250YWwgZGlzcGxhY2VtZW50KVxuICAgKi9cbiAgcHVibGljIGhvcml6b250YWxMaW5lVG9SZWxhdGl2ZSggeDogbnVtYmVyICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmxpbmVUb1JlbGF0aXZlKCB4LCAwICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHZlcnRpY2FsIGxpbmUgKHkgcmVwcmVzZW50cyB0aGUgeS1jb29yZGluYXRlIG9mIHRoZSBlbmQgcG9pbnQpXG4gICAqL1xuICBwdWJsaWMgdmVydGljYWxMaW5lVG8oIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5saW5lVG8oIHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpLngsIHkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdmVydGljYWwgbGluZSAoeSByZXByZXNlbnRzIGEgdmVydGljYWwgZGlzcGxhY2VtZW50KVxuICAgKi9cbiAgcHVibGljIHZlcnRpY2FsTGluZVRvUmVsYXRpdmUoIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5saW5lVG9SZWxhdGl2ZSggMCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFppZy16YWdzIGJldHdlZW4gdGhlIGN1cnJlbnQgcG9pbnQgYW5kIHRoZSBzcGVjaWZpZWQgcG9pbnRcbiAgICpcbiAgICogQHBhcmFtIGVuZFggLSB0aGUgZW5kIG9mIHRoZSBzaGFwZVxuICAgKiBAcGFyYW0gZW5kWSAtIHRoZSBlbmQgb2YgdGhlIHNoYXBlXG4gICAqIEBwYXJhbSBhbXBsaXR1ZGUgLSB0aGUgdmVydGljYWwgYW1wbGl0dWRlIG9mIHRoZSB6aWcgemFnIHdhdmVcbiAgICogQHBhcmFtIG51bWJlclppZ1phZ3MgLSB0aGUgbnVtYmVyIG9mIG9zY2lsbGF0aW9uc1xuICAgKiBAcGFyYW0gc3ltbWV0cmljYWwgLSBmbGFnIGZvciBkcmF3aW5nIGEgc3ltbWV0cmljYWwgemlnIHphZ1xuICAgKi9cbiAgcHVibGljIHppZ1phZ1RvKCBlbmRYOiBudW1iZXIsIGVuZFk6IG51bWJlciwgYW1wbGl0dWRlOiBudW1iZXIsIG51bWJlclppZ1phZ3M6IG51bWJlciwgc3ltbWV0cmljYWw6IGJvb2xlYW4gKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuemlnWmFnVG9Qb2ludCggbmV3IFZlY3RvcjIoIGVuZFgsIGVuZFkgKSwgYW1wbGl0dWRlLCBudW1iZXJaaWdaYWdzLCBzeW1tZXRyaWNhbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFppZy16YWdzIGJldHdlZW4gdGhlIGN1cnJlbnQgcG9pbnQgYW5kIHRoZSBzcGVjaWZpZWQgcG9pbnQuXG4gICAqIEltcGxlbWVudGF0aW9uIG1vdmVkIGZyb20gY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbiBvbiBBcHJpbCAyMiwgMjAxOS5cbiAgICpcbiAgICogQHBhcmFtIGVuZFBvaW50IC0gdGhlIGVuZCBvZiB0aGUgc2hhcGVcbiAgICogQHBhcmFtIGFtcGxpdHVkZSAtIHRoZSB2ZXJ0aWNhbCBhbXBsaXR1ZGUgb2YgdGhlIHppZyB6YWcgd2F2ZSwgc2lnbmVkIHRvIGNob29zZSBpbml0aWFsIGRpcmVjdGlvblxuICAgKiBAcGFyYW0gbnVtYmVyWmlnWmFncyAtIHRoZSBudW1iZXIgb2YgY29tcGxldGUgb3NjaWxsYXRpb25zXG4gICAqIEBwYXJhbSBzeW1tZXRyaWNhbCAtIGZsYWcgZm9yIGRyYXdpbmcgYSBzeW1tZXRyaWNhbCB6aWcgemFnXG4gICAqL1xuICBwdWJsaWMgemlnWmFnVG9Qb2ludCggZW5kUG9pbnQ6IFZlY3RvcjIsIGFtcGxpdHVkZTogbnVtYmVyLCBudW1iZXJaaWdaYWdzOiBudW1iZXIsIHN5bW1ldHJpY2FsOiBib29sZWFuICk6IHRoaXMge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyWmlnWmFncyApLCBgbnVtYmVyWmlnWmFncyBtdXN0IGJlIGFuIGludGVnZXI6ICR7bnVtYmVyWmlnWmFnc31gICk7XG5cbiAgICB0aGlzLmVuc3VyZSggZW5kUG9pbnQgKTtcbiAgICBjb25zdCBzdGFydFBvaW50ID0gdGhpcy5nZXRMYXN0UG9pbnQoKTtcbiAgICBjb25zdCBkZWx0YSA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICk7XG4gICAgY29uc3QgZGlyZWN0aW9uVW5pdFZlY3RvciA9IGRlbHRhLm5vcm1hbGl6ZWQoKTtcbiAgICBjb25zdCBhbXBsaXR1ZGVOb3JtYWxWZWN0b3IgPSBkaXJlY3Rpb25Vbml0VmVjdG9yLnBlcnBlbmRpY3VsYXIudGltZXMoIGFtcGxpdHVkZSApO1xuXG4gICAgbGV0IHdhdmVsZW5ndGg7XG4gICAgaWYgKCBzeW1tZXRyaWNhbCApIHtcbiAgICAgIC8vIHRoZSB3YXZlbGVuZ3RoIGlzIHNob3J0ZXIgdG8gYWRkIGhhbGYgYSB3YXZlLlxuICAgICAgd2F2ZWxlbmd0aCA9IGRlbHRhLm1hZ25pdHVkZSAvICggbnVtYmVyWmlnWmFncyArIDAuNSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHdhdmVsZW5ndGggPSBkZWx0YS5tYWduaXR1ZGUgLyBudW1iZXJaaWdaYWdzO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlclppZ1phZ3M7IGkrKyApIHtcbiAgICAgIGNvbnN0IHdhdmVPcmlnaW4gPSBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCBpICogd2F2ZWxlbmd0aCApLnBsdXMoIHN0YXJ0UG9pbnQgKTtcbiAgICAgIGNvbnN0IHRvcFBvaW50ID0gd2F2ZU9yaWdpbi5wbHVzKCBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCB3YXZlbGVuZ3RoIC8gNCApICkucGx1cyggYW1wbGl0dWRlTm9ybWFsVmVjdG9yICk7XG4gICAgICBjb25zdCBib3R0b21Qb2ludCA9IHdhdmVPcmlnaW4ucGx1cyggZGlyZWN0aW9uVW5pdFZlY3Rvci50aW1lcyggMyAqIHdhdmVsZW5ndGggLyA0ICkgKS5taW51cyggYW1wbGl0dWRlTm9ybWFsVmVjdG9yICk7XG4gICAgICB0aGlzLmxpbmVUb1BvaW50KCB0b3BQb2ludCApO1xuICAgICAgdGhpcy5saW5lVG9Qb2ludCggYm90dG9tUG9pbnQgKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgbGFzdCBoYWxmIG9mIHRoZSB3YXZlbGVuZ3RoXG4gICAgaWYgKCBzeW1tZXRyaWNhbCApIHtcbiAgICAgIGNvbnN0IHdhdmVPcmlnaW4gPSBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCBudW1iZXJaaWdaYWdzICogd2F2ZWxlbmd0aCApLnBsdXMoIHN0YXJ0UG9pbnQgKTtcbiAgICAgIGNvbnN0IHRvcFBvaW50ID0gd2F2ZU9yaWdpbi5wbHVzKCBkaXJlY3Rpb25Vbml0VmVjdG9yLnRpbWVzKCB3YXZlbGVuZ3RoIC8gNCApICkucGx1cyggYW1wbGl0dWRlTm9ybWFsVmVjdG9yICk7XG4gICAgICB0aGlzLmxpbmVUb1BvaW50KCB0b3BQb2ludCApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmxpbmVUb1BvaW50KCBlbmRQb2ludCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBxdWFkcmF0aWMgY3VydmUgdG8gdGhpcyBzaGFwZVxuICAgKlxuICAgKiBUaGUgY3VydmUgaXMgZ3VhcmFudGVlZCB0byBwYXNzIHRocm91Z2ggdGhlIGNvb3JkaW5hdGUgKHgseSkgYnV0IGRvZXMgbm90IHBhc3MgdGhyb3VnaCB0aGUgY29udHJvbCBwb2ludFxuICAgKlxuICAgKiBAcGFyYW0gY3B4IC0gY29udHJvbCBwb2ludCBob3Jpem9udGFsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGNweSAtIGNvbnRyb2wgcG9pbnQgdmVydGljYWwgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcHVibGljIHF1YWRyYXRpY0N1cnZlVG8oIGNweDogbnVtYmVyLCBjcHk6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNweCApLCBgY3B4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NweH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNweSApLCBgY3B5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NweX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XG4gICAgcmV0dXJuIHRoaXMucXVhZHJhdGljQ3VydmVUb1BvaW50KCB2KCBjcHgsIGNweSApLCB2KCB4LCB5ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcXVhZHJhdGljIGN1cnZlIHRvIHRoaXMgc2hhcGUuIFRoZSBjb250cm9sIGFuZCBmaW5hbCBwb2ludHMgYXJlIHNwZWNpZmllZCBhcyBkaXNwbGFjbWVudCBmcm9tIHRoZSBsYXN0XG4gICAqIHBvaW50IGluIHRoaXMgc2hhcGVcbiAgICpcbiAgICogQHBhcmFtIGNweCAtIGNvbnRyb2wgcG9pbnQgaG9yaXpvbnRhbCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSBjcHkgLSBjb250cm9sIHBvaW50IHZlcnRpY2FsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIHggLSBmaW5hbCB4IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcbiAgICogQHBhcmFtIHkgLSBmaW5hbCB5IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcbiAgICovXG4gIHB1YmxpYyBxdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUoIGNweDogbnVtYmVyLCBjcHk6IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNweCApLCBgY3B4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NweH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNweSApLCBgY3B5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NweX1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgYHggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHkgKSwgYHkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7eX1gICk7XG4gICAgcmV0dXJuIHRoaXMucXVhZHJhdGljQ3VydmVUb1BvaW50UmVsYXRpdmUoIHYoIGNweCwgY3B5ICksIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBxdWFkcmF0aWMgY3VydmUgdG8gdGhpcyBzaGFwZS4gVGhlIGNvbnRyb2wgYW5kIGZpbmFsIHBvaW50cyBhcmUgc3BlY2lmaWVkIGFzIGRpc3BsYWNlbWVudCBmcm9tIHRoZVxuICAgKiBsYXN0IHBvaW50IGluIHRoaXMgc2hhcGVcbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xQb2ludFxuICAgKiBAcGFyYW0gcG9pbnQgLSB0aGUgcXVhZHJhdGljIGN1cnZlIHBhc3NlcyB0aHJvdWdoIHRoaXMgcG9pbnRcbiAgICovXG4gIHB1YmxpYyBxdWFkcmF0aWNDdXJ2ZVRvUG9pbnRSZWxhdGl2ZSggY29udHJvbFBvaW50OiBWZWN0b3IyLCBwb2ludDogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBjb25zdCByZWxhdGl2ZVBvaW50ID0gdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCk7XG4gICAgcmV0dXJuIHRoaXMucXVhZHJhdGljQ3VydmVUb1BvaW50KCByZWxhdGl2ZVBvaW50LnBsdXMoIGNvbnRyb2xQb2ludCApLCByZWxhdGl2ZVBvaW50LnBsdXMoIHBvaW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcXVhZHJhdGljIGN1cnZlIHRvIHRoaXMgc2hhcGUuIFRoZSBxdWFkcmF0aWMgY3VydmVzIHBhc3NlcyB0aHJvdWdoIHRoZSB4IGFuZCB5IGNvb3JkaW5hdGUuXG4gICAqIFRoZSBzaGFwZSBzaG91bGQgam9pbiBzbW9vdGhseSB3aXRoIHRoZSBwcmV2aW91cyBzdWJwYXRoc1xuICAgKlxuICAgKiBUT0RPOiBjb25zaWRlciBhIHJlbmFtZSB0byBwdXQgJ3Ntb290aCcgZmFydGhlciBiYWNrPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICpcbiAgICogQHBhcmFtIHggLSBmaW5hbCB4IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcbiAgICogQHBhcmFtIHkgLSBmaW5hbCB5IHBvc2l0aW9uIG9mIHRoZSBxdWFkcmF0aWMgY3VydmVcbiAgICovXG4gIHB1YmxpYyBzbW9vdGhRdWFkcmF0aWNDdXJ2ZVRvKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5xdWFkcmF0aWNDdXJ2ZVRvUG9pbnQoIHRoaXMuZ2V0U21vb3RoUXVhZHJhdGljQ29udHJvbFBvaW50KCksIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBxdWFkcmF0aWMgY3VydmUgdG8gdGhpcyBzaGFwZS4gVGhlIHF1YWRyYXRpYyBjdXJ2ZXMgcGFzc2VzIHRocm91Z2ggdGhlIHggYW5kIHkgY29vcmRpbmF0ZS5cbiAgICogVGhlIHNoYXBlIHNob3VsZCBqb2luIHNtb290aGx5IHdpdGggdGhlIHByZXZpb3VzIHN1YnBhdGhzXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gZmluYWwgeCBwb3NpdGlvbiBvZiB0aGUgcXVhZHJhdGljIGN1cnZlXG4gICAqIEBwYXJhbSB5IC0gZmluYWwgeSBwb3NpdGlvbiBvZiB0aGUgcXVhZHJhdGljIGN1cnZlXG4gICAqL1xuICBwdWJsaWMgc21vb3RoUXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5xdWFkcmF0aWNDdXJ2ZVRvUG9pbnQoIHRoaXMuZ2V0U21vb3RoUXVhZHJhdGljQ29udHJvbFBvaW50KCksIHYoIHgsIHkgKS5wbHVzKCB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKSApICk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHF1YWRyYXRpYyBiZXppZXIgY3VydmUgdG8gdGhpcyBzaGFwZS5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRyb2xQb2ludFxuICAgKiBAcGFyYW0gcG9pbnQgLSB0aGUgcXVhZHJhdGljIGN1cnZlIHBhc3NlcyB0aHJvdWdoIHRoaXMgcG9pbnRcbiAgICovXG4gIHB1YmxpYyBxdWFkcmF0aWNDdXJ2ZVRvUG9pbnQoIGNvbnRyb2xQb2ludDogVmVjdG9yMiwgcG9pbnQ6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSLzJkY29udGV4dC8jZG9tLWNvbnRleHQtMmQtcXVhZHJhdGljY3VydmV0b1xuICAgIHRoaXMuZW5zdXJlKCBjb250cm9sUG9pbnQgKTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMYXN0UG9pbnQoKTtcbiAgICBjb25zdCBxdWFkcmF0aWMgPSBuZXcgUXVhZHJhdGljKCBzdGFydCwgY29udHJvbFBvaW50LCBwb2ludCApO1xuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggcG9pbnQgKTtcbiAgICBjb25zdCBub25kZWdlbmVyYXRlU2VnbWVudHMgPSBxdWFkcmF0aWMuZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCk7XG4gICAgXy5lYWNoKCBub25kZWdlbmVyYXRlU2VnbWVudHMsIHNlZ21lbnQgPT4ge1xuICAgICAgLy8gVE9ETzogb3B0aW1pemF0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBzZWdtZW50ICk7XG4gICAgfSApO1xuICAgIHRoaXMuc2V0UXVhZHJhdGljQ29udHJvbFBvaW50KCBjb250cm9sUG9pbnQgKTtcblxuICAgIHJldHVybiB0aGlzOyAgLy8gZm9yIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGN1YmljIGJlemllciBjdXJ2ZSB0byB0aGlzIHNoYXBlLlxuICAgKlxuICAgKiBAcGFyYW0gY3AxeCAtIGNvbnRyb2wgcG9pbnQgMSwgIGhvcml6b250YWwgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0gY3AxeSAtIGNvbnRyb2wgcG9pbnQgMSwgIHZlcnRpY2FsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGNwMnggLSBjb250cm9sIHBvaW50IDIsICBob3Jpem9udGFsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGNwMnkgLSBjb250cm9sIHBvaW50IDIsICB2ZXJ0aWNhbCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB4IC0gZmluYWwgeCBwb3NpdGlvbiBvZiB0aGUgY3ViaWMgY3VydmVcbiAgICogQHBhcmFtIHkgLSBmaW5hbCB5IHBvc2l0aW9uIG9mIHRoZSBjdWJpYyBjdXJ2ZVxuICAgKi9cbiAgcHVibGljIGN1YmljQ3VydmVUbyggY3AxeDogbnVtYmVyLCBjcDF5OiBudW1iZXIsIGNwMng6IG51bWJlciwgY3AyeTogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AxeCApLCBgY3AxeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDF4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AxeSApLCBgY3AxeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDF5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeCApLCBgY3AyeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeSApLCBgY3AyeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggdiggY3AxeCwgY3AxeSApLCB2KCBjcDJ4LCBjcDJ5ICksIHYoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjcDF4IC0gY29udHJvbCBwb2ludCAxLCAgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnRcbiAgICogQHBhcmFtIGNwMXkgLSBjb250cm9sIHBvaW50IDEsICB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnRcbiAgICogQHBhcmFtIGNwMnggLSBjb250cm9sIHBvaW50IDIsICBob3Jpem9udGFsIGRpc3BsYWNlbWVudFxuICAgKiBAcGFyYW0gY3AyeSAtIGNvbnRyb2wgcG9pbnQgMiwgIHZlcnRpY2FsIGRpc3BsYWNlbWVudFxuICAgKiBAcGFyYW0geCAtIGZpbmFsIGhvcml6b250YWwgZGlzcGxhY2VtZW50XG4gICAqIEBwYXJhbSB5IC0gZmluYWwgdmVydGljYWwgZGlzcGxhY21lbnRcbiAgICovXG4gIHB1YmxpYyBjdWJpY0N1cnZlVG9SZWxhdGl2ZSggY3AxeDogbnVtYmVyLCBjcDF5OiBudW1iZXIsIGNwMng6IG51bWJlciwgY3AyeTogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AxeCApLCBgY3AxeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDF4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AxeSApLCBgY3AxeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDF5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeCApLCBgY3AyeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeSApLCBgY3AyeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludFJlbGF0aXZlKCB2KCBjcDF4LCBjcDF5ICksIHYoIGNwMngsIGNwMnkgKSwgdiggeCwgeSApICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGNvbnRyb2wxIC0gY29udHJvbCBkaXNwbGFjZW1lbnQgIDFcbiAgICogQHBhcmFtIGNvbnRyb2wyIC0gY29udHJvbCBkaXNwbGFjZW1lbnQgMlxuICAgKiBAcGFyYW0gcG9pbnQgLSBmaW5hbCBkaXNwbGFjZW1lbnRcbiAgICovXG4gIHB1YmxpYyBjdWJpY0N1cnZlVG9Qb2ludFJlbGF0aXZlKCBjb250cm9sMTogVmVjdG9yMiwgY29udHJvbDI6IFZlY3RvcjIsIHBvaW50OiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGNvbnN0IHJlbGF0aXZlUG9pbnQgPSB0aGlzLmdldFJlbGF0aXZlUG9pbnQoKTtcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggcmVsYXRpdmVQb2ludC5wbHVzKCBjb250cm9sMSApLCByZWxhdGl2ZVBvaW50LnBsdXMoIGNvbnRyb2wyICksIHJlbGF0aXZlUG9pbnQucGx1cyggcG9pbnQgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjcDJ4IC0gY29udHJvbCBwb2ludCAyLCAgaG9yaXpvbnRhbCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSBjcDJ5IC0gY29udHJvbCBwb2ludCAyLCAgdmVydGljYWwgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcHVibGljIHNtb290aEN1YmljQ3VydmVUbyggY3AyeDogbnVtYmVyLCBjcDJ5OiBudW1iZXIsIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjcDJ4ICksIGBjcDJ4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnh9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjcDJ5ICksIGBjcDJ5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NwMnl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB4ICksIGB4IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3h9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksIGB5IG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3l9YCApO1xuICAgIHJldHVybiB0aGlzLmN1YmljQ3VydmVUb1BvaW50KCB0aGlzLmdldFNtb290aEN1YmljQ29udHJvbFBvaW50KCksIHYoIGNwMngsIGNwMnkgKSwgdiggeCwgeSApICk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGNwMnggLSBjb250cm9sIHBvaW50IDIsICBob3Jpem9udGFsIGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIGNwMnkgLSBjb250cm9sIHBvaW50IDIsICB2ZXJ0aWNhbCBjb29yZGluYXRlXG4gICAqIEBwYXJhbSB4XG4gICAqIEBwYXJhbSB5XG4gICAqL1xuICBwdWJsaWMgc21vb3RoQ3ViaWNDdXJ2ZVRvUmVsYXRpdmUoIGNwMng6IG51bWJlciwgY3AyeTogbnVtYmVyLCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeCApLCBgY3AyeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY3AyeSApLCBgY3AyeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjcDJ5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICByZXR1cm4gdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggdGhpcy5nZXRTbW9vdGhDdWJpY0NvbnRyb2xQb2ludCgpLCB2KCBjcDJ4LCBjcDJ5ICkucGx1cyggdGhpcy5nZXRSZWxhdGl2ZVBvaW50KCkgKSwgdiggeCwgeSApLnBsdXMoIHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBjdWJpY0N1cnZlVG9Qb2ludCggY29udHJvbDE6IFZlY3RvcjIsIGNvbnRyb2wyOiBWZWN0b3IyLCBwb2ludDogVmVjdG9yMiApOiB0aGlzIHtcbiAgICAvLyBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvMmRjb250ZXh0LyNkb20tY29udGV4dC0yZC1xdWFkcmF0aWNjdXJ2ZXRvXG4gICAgdGhpcy5lbnN1cmUoIGNvbnRyb2wxICk7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCk7XG4gICAgY29uc3QgY3ViaWMgPSBuZXcgQ3ViaWMoIHN0YXJ0LCBjb250cm9sMSwgY29udHJvbDIsIHBvaW50ICk7XG5cbiAgICBjb25zdCBub25kZWdlbmVyYXRlU2VnbWVudHMgPSBjdWJpYy5nZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKTtcbiAgICBfLmVhY2goIG5vbmRlZ2VuZXJhdGVTZWdtZW50cywgc2VnbWVudCA9PiB7XG4gICAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIHNlZ21lbnQgKTtcbiAgICB9ICk7XG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCBwb2ludCApO1xuXG4gICAgdGhpcy5zZXRDdWJpY0NvbnRyb2xQb2ludCggY29udHJvbDIgKTtcblxuICAgIHJldHVybiB0aGlzOyAgLy8gZm9yIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGNlbnRlclggLSBob3Jpem9udGFsIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgYXJjXG4gICAqIEBwYXJhbSBjZW50ZXJZIC0gQ2VudGVyIG9mIHRoZSBhcmNcbiAgICogQHBhcmFtIHJhZGl1cyAtIEhvdyBmYXIgZnJvbSB0aGUgY2VudGVyIHRoZSBhcmMgd2lsbCBiZVxuICAgKiBAcGFyYW0gc3RhcnRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgc3RhcnQgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gZW5kQW5nbGUgLSBBbmdsZSAocmFkaWFucykgb2YgdGhlIGVuZCBvZiB0aGUgYXJjXG4gICAqIEBwYXJhbSBbYW50aWNsb2Nrd2lzZV0gLSBEZWNpZGVzIHdoaWNoIGRpcmVjdGlvbiB0aGUgYXJjIHRha2VzIGFyb3VuZCB0aGUgY2VudGVyXG4gICAqL1xuICBwdWJsaWMgYXJjKCBjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZT86IGJvb2xlYW4gKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNlbnRlclggKSwgYGNlbnRlclggbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y2VudGVyWH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNlbnRlclkgKSwgYGNlbnRlclkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y2VudGVyWX1gICk7XG4gICAgcmV0dXJuIHRoaXMuYXJjUG9pbnQoIHYoIGNlbnRlclgsIGNlbnRlclkgKSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjZW50ZXIgLSBDZW50ZXIgb2YgdGhlIGFyYyAoZXZlcnkgcG9pbnQgb24gdGhlIGFyYyBpcyBlcXVhbGx5IGZhciBmcm9tIHRoZSBjZW50ZXIpXG4gICAqIEBwYXJhbSByYWRpdXMgLSBIb3cgZmFyIGZyb20gdGhlIGNlbnRlciB0aGUgYXJjIHdpbGwgYmVcbiAgICogQHBhcmFtIHN0YXJ0QW5nbGUgLSBBbmdsZSAocmFkaWFucykgb2YgdGhlIHN0YXJ0IG9mIHRoZSBhcmNcbiAgICogQHBhcmFtIGVuZEFuZ2xlIC0gQW5nbGUgKHJhZGlhbnMpIG9mIHRoZSBlbmQgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gW2FudGljbG9ja3dpc2VdIC0gRGVjaWRlcyB3aGljaCBkaXJlY3Rpb24gdGhlIGFyYyB0YWtlcyBhcm91bmQgdGhlIGNlbnRlclxuICAgKi9cbiAgcHVibGljIGFyY1BvaW50KCBjZW50ZXI6IFZlY3RvcjIsIHJhZGl1czogbnVtYmVyLCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIsIGFudGljbG9ja3dpc2U/OiBib29sZWFuICk6IHRoaXMge1xuICAgIC8vIHNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi8yZGNvbnRleHQvI2RvbS1jb250ZXh0LTJkLWFyY1xuICAgIGlmICggYW50aWNsb2Nrd2lzZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYW50aWNsb2Nrd2lzZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGFyYyA9IG5ldyBBcmMoIGNlbnRlciwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuXG4gICAgLy8gd2UgYXJlIGFzc3VtaW5nIHRoYXQgdGhlIG5vcm1hbCBjb25kaXRpb25zIHdlcmUgYWxyZWFkeSBtZXQgKG9yIGV4Y2VwdGlvbmVkIG91dCkgc28gdGhhdCB0aGVzZSBhY3R1YWxseSB3b3JrIHdpdGggY2FudmFzXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IGFyYy5nZXRTdGFydCgpO1xuICAgIGNvbnN0IGVuZFBvaW50ID0gYXJjLmdldEVuZCgpO1xuXG4gICAgLy8gaWYgdGhlcmUgaXMgYWxyZWFkeSBhIHBvaW50IG9uIHRoZSBzdWJwYXRoLCBhbmQgaXQgaXMgZGlmZmVyZW50IHRoYW4gb3VyIHN0YXJ0aW5nIHBvaW50LCBkcmF3IGEgbGluZSBiZXR3ZWVuIHRoZW1cbiAgICBpZiAoIHRoaXMuaGFzU3VicGF0aHMoKSAmJiB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGVuZ3RoKCkgPiAwICYmICFzdGFydFBvaW50LmVxdWFscyggdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpICkgKSB7XG4gICAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIG5ldyBMaW5lKCB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCksIHN0YXJ0UG9pbnQgKSApO1xuICAgIH1cblxuICAgIGlmICggIXRoaXMuaGFzU3VicGF0aHMoKSApIHtcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xuICAgIH1cblxuICAgIC8vIHRlY2huaWNhbGx5IHRoZSBDYW52YXMgc3BlYyBzYXlzIHRvIGFkZCB0aGUgc3RhcnQgcG9pbnQsIHNvIHdlIGRvIHRoaXMgZXZlbiB0aG91Z2ggaXQgaXMgcHJvYmFibHkgY29tcGxldGVseSB1bm5lY2Vzc2FyeSAodGhlcmUgaXMgbm8gY29uZGl0aW9uYWwpXG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCBzdGFydFBvaW50ICk7XG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCBlbmRQb2ludCApO1xuXG4gICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBhcmMgKTtcbiAgICB0aGlzLnJlc2V0Q29udHJvbFBvaW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGVsbGlwdGljYWwgYXJjXG4gICAqXG4gICAqIEBwYXJhbSBjZW50ZXJYIC0gaG9yaXpvbnRhbCBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gY2VudGVyWSAtICB2ZXJ0aWNhbCBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gcmFkaXVzWCAtIHNlbWkgYXhpc1xuICAgKiBAcGFyYW0gcmFkaXVzWSAtIHNlbWkgYXhpc1xuICAgKiBAcGFyYW0gcm90YXRpb24gLSByb3RhdGlvbiBvZiB0aGUgZWxsaXB0aWNhbCBhcmMgd2l0aCByZXNwZWN0IHRvIHRoZSBwb3NpdGl2ZSB4IGF4aXMuXG4gICAqIEBwYXJhbSBzdGFydEFuZ2xlXG4gICAqIEBwYXJhbSBlbmRBbmdsZVxuICAgKiBAcGFyYW0gW2FudGljbG9ja3dpc2VdXG4gICAqL1xuICBwdWJsaWMgZWxsaXB0aWNhbEFyYyggY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1c1g6IG51bWJlciwgcmFkaXVzWTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyLCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIsIGFudGljbG9ja3dpc2U/OiBib29sZWFuICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjZW50ZXJYICksIGBjZW50ZXJYIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlclh9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjZW50ZXJZICksIGBjZW50ZXJZIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlcll9YCApO1xuICAgIHJldHVybiB0aGlzLmVsbGlwdGljYWxBcmNQb2ludCggdiggY2VudGVyWCwgY2VudGVyWSApLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiwgc3RhcnRBbmdsZSwgZW5kQW5nbGUsIGFudGljbG9ja3dpc2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGVsbGlwdGljIGFyY1xuICAgKlxuICAgKiBAcGFyYW0gY2VudGVyXG4gICAqIEBwYXJhbSByYWRpdXNYXG4gICAqIEBwYXJhbSByYWRpdXNZXG4gICAqIEBwYXJhbSByb3RhdGlvbiAtIHJvdGF0aW9uIG9mIHRoZSBhcmMgd2l0aCByZXNwZWN0IHRvIHRoZSBwb3NpdGl2ZSB4IGF4aXMuXG4gICAqIEBwYXJhbSBzdGFydEFuZ2xlIC1cbiAgICogQHBhcmFtIGVuZEFuZ2xlXG4gICAqIEBwYXJhbSBbYW50aWNsb2Nrd2lzZV1cbiAgICovXG4gIHB1YmxpYyBlbGxpcHRpY2FsQXJjUG9pbnQoIGNlbnRlcjogVmVjdG9yMiwgcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIsIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgYW50aWNsb2Nrd2lzZT86IGJvb2xlYW4gKTogdGhpcyB7XG4gICAgLy8gc2VlIGh0dHA6Ly93d3cudzMub3JnL1RSLzJkY29udGV4dC8jZG9tLWNvbnRleHQtMmQtYXJjXG4gICAgaWYgKCBhbnRpY2xvY2t3aXNlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBhbnRpY2xvY2t3aXNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZWxsaXB0aWNhbEFyYyA9IG5ldyBFbGxpcHRpY2FsQXJjKCBjZW50ZXIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSwgYW50aWNsb2Nrd2lzZSApO1xuXG4gICAgLy8gd2UgYXJlIGFzc3VtaW5nIHRoYXQgdGhlIG5vcm1hbCBjb25kaXRpb25zIHdlcmUgYWxyZWFkeSBtZXQgKG9yIGV4Y2VwdGlvbmVkIG91dCkgc28gdGhhdCB0aGVzZSBhY3R1YWxseSB3b3JrIHdpdGggY2FudmFzXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IGVsbGlwdGljYWxBcmMuc3RhcnQ7XG4gICAgY29uc3QgZW5kUG9pbnQgPSBlbGxpcHRpY2FsQXJjLmVuZDtcblxuICAgIC8vIGlmIHRoZXJlIGlzIGFscmVhZHkgYSBwb2ludCBvbiB0aGUgc3VicGF0aCwgYW5kIGl0IGlzIGRpZmZlcmVudCB0aGFuIG91ciBzdGFydGluZyBwb2ludCwgZHJhdyBhIGxpbmUgYmV0d2VlbiB0aGVtXG4gICAgaWYgKCB0aGlzLmhhc1N1YnBhdGhzKCkgJiYgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExlbmd0aCgpID4gMCAmJiAhc3RhcnRQb2ludC5lcXVhbHMoIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMYXN0UG9pbnQoKSApICkge1xuICAgICAgdGhpcy5hZGRTZWdtZW50QW5kQm91bmRzKCBuZXcgTGluZSggdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpLCBzdGFydFBvaW50ICkgKTtcbiAgICB9XG5cbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XG4gICAgICB0aGlzLmFkZFN1YnBhdGgoIG5ldyBTdWJwYXRoKCkgKTtcbiAgICB9XG5cbiAgICAvLyB0ZWNobmljYWxseSB0aGUgQ2FudmFzIHNwZWMgc2F5cyB0byBhZGQgdGhlIHN0YXJ0IHBvaW50LCBzbyB3ZSBkbyB0aGlzIGV2ZW4gdGhvdWdoIGl0IGlzIHByb2JhYmx5IGNvbXBsZXRlbHkgdW5uZWNlc3NhcnkgKHRoZXJlIGlzIG5vIGNvbmRpdGlvbmFsKVxuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggc3RhcnRQb2ludCApO1xuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggZW5kUG9pbnQgKTtcblxuICAgIHRoaXMuYWRkU2VnbWVudEFuZEJvdW5kcyggZWxsaXB0aWNhbEFyYyApO1xuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpczsgIC8vIGZvciBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzdWJwYXRoIHRoYXQgam9pbnMgdGhlIGxhc3QgcG9pbnQgb2YgdGhpcyBzaGFwZSB0byB0aGUgZmlyc3QgcG9pbnQgdG8gZm9ybSBhIGNsb3NlZCBzaGFwZVxuICAgKlxuICAgKi9cbiAgcHVibGljIGNsb3NlKCk6IHRoaXMge1xuICAgIGlmICggdGhpcy5oYXNTdWJwYXRocygpICkge1xuICAgICAgY29uc3QgcHJldmlvdXNQYXRoID0gdGhpcy5nZXRMYXN0U3VicGF0aCgpO1xuICAgICAgY29uc3QgbmV4dFBhdGggPSBuZXcgU3VicGF0aCgpO1xuXG4gICAgICBwcmV2aW91c1BhdGguY2xvc2UoKTtcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggbmV4dFBhdGggKTtcbiAgICAgIG5leHRQYXRoLmFkZFBvaW50KCBwcmV2aW91c1BhdGguZ2V0Rmlyc3RQb2ludCgpICk7XG4gICAgfVxuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XG4gICAgcmV0dXJuIHRoaXM7ICAvLyBmb3IgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0byB0aGUgbmV4dCBzdWJwYXRoLCBidXQgd2l0aG91dCBhZGRpbmcgYW55IHBvaW50cyB0byBpdCAobGlrZSBhIG1vdmVUbyB3b3VsZCBkbykuXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydGljdWxhcmx5IGhlbHBmdWwgZm9yIGNhc2VzIHdoZXJlIHlvdSBkb24ndCB3YW50IHRvIGhhdmUgdG8gY29tcHV0ZSB0aGUgZXhwbGljaXQgc3RhcnRpbmcgcG9pbnQgb2ZcbiAgICogdGhlIG5leHQgc3VicGF0aC4gRm9yIGluc3RhbmNlLCBpZiB5b3Ugd2FudCB0aHJlZSBkaXNjb25uZWN0ZWQgY2lyY2xlczpcbiAgICogLSBzaGFwZS5jaXJjbGUoIDUwLCA1MCwgMjAgKS5uZXdTdWJwYXRoKCkuY2lyY2xlKCAxMDAsIDEwMCwgMjAgKS5uZXdTdWJwYXRoKCkuY2lyY2xlKCAxNTAsIDUwLCAyMCApXG4gICAqXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzIgZm9yIG1vcmUgaW5mby5cbiAgICovXG4gIHB1YmxpYyBuZXdTdWJwYXRoKCk6IHRoaXMge1xuICAgIHRoaXMuYWRkU3VicGF0aCggbmV3IFN1YnBhdGgoKSApO1xuICAgIHRoaXMucmVzZXRDb250cm9sUG9pbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgdGhpcyBTaGFwZSBpbW11dGFibGUsIHNvIHRoYXQgYXR0ZW1wdHMgdG8gZnVydGhlciBjaGFuZ2UgdGhlIFNoYXBlIHdpbGwgZmFpbC4gVGhpcyBhbGxvd3MgY2xpZW50cyB0byBhdm9pZFxuICAgKiBhZGRpbmcgY2hhbmdlIGxpc3RlbmVycyB0byB0aGlzIFNoYXBlLlxuICAgKi9cbiAgcHVibGljIG1ha2VJbW11dGFibGUoKTogdGhpcyB7XG4gICAgdGhpcy5faW1tdXRhYmxlID0gdHJ1ZTtcblxuICAgIHRoaXMubm90aWZ5SW52YWxpZGF0aW9uTGlzdGVuZXJzKCk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgU2hhcGUgaXMgaW1tdXRhYmxlIChzZWUgbWFrZUltbXV0YWJsZSBmb3IgZGV0YWlscykuXG4gICAqL1xuICBwdWJsaWMgaXNJbW11dGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2ltbXV0YWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXRjaGVzIFNWRydzIGVsbGlwdGljYWwgYXJjIGZyb20gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3BhdGhzLmh0bWxcbiAgICpcbiAgICogV0FSTklORzogcm90YXRpb24gKGZvciBub3cpIGlzIGluIERFR1JFRVMuIFRoaXMgd2lsbCBwcm9iYWJseSBjaGFuZ2UgaW4gdGhlIGZ1dHVyZS5cbiAgICpcbiAgICogQHBhcmFtIHJhZGl1c1ggLSBTZW1pLW1ham9yIGF4aXMgc2l6ZVxuICAgKiBAcGFyYW0gcmFkaXVzWSAtIFNlbWktbWlub3IgYXhpcyBzaXplXG4gICAqIEBwYXJhbSByb3RhdGlvbiAtIFJvdGF0aW9uIG9mIHRoZSBlbGxpcHNlIChpdHMgc2VtaS1tYWpvciBheGlzKVxuICAgKiBAcGFyYW0gbGFyZ2VBcmMgLSBXaGV0aGVyIHRoZSBhcmMgd2lsbCBnbyB0aGUgbG9uZ2VzdCByb3V0ZSBhcm91bmQgdGhlIGVsbGlwc2UuXG4gICAqIEBwYXJhbSBzd2VlcCAtIFdoZXRoZXIgdGhlIGFyYyBtYWRlIGdvZXMgZnJvbSBzdGFydCB0byBlbmQgXCJjbG9ja3dpc2VcIiAob3Bwb3NpdGUgb2YgYW50aWNsb2Nrd2lzZSBmbGFnKVxuICAgKiBAcGFyYW0geCAtIEVuZCBwb2ludCBYIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB5IC0gRW5kIHBvaW50IFkgcG9zaXRpb25cbiAgICovXG4gIHB1YmxpYyBlbGxpcHRpY2FsQXJjVG9SZWxhdGl2ZSggcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIsIGxhcmdlQXJjOiBib29sZWFuLCBzd2VlcDogYm9vbGVhbiwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcyB7XG4gICAgY29uc3QgcmVsYXRpdmVQb2ludCA9IHRoaXMuZ2V0UmVsYXRpdmVQb2ludCgpO1xuICAgIHJldHVybiB0aGlzLmVsbGlwdGljYWxBcmNUbyggcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24sIGxhcmdlQXJjLCBzd2VlcCwgeCArIHJlbGF0aXZlUG9pbnQueCwgeSArIHJlbGF0aXZlUG9pbnQueSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoZXMgU1ZHJ3MgZWxsaXB0aWNhbCBhcmMgZnJvbSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbFxuICAgKlxuICAgKiBXQVJOSU5HOiByb3RhdGlvbiAoZm9yIG5vdykgaXMgaW4gREVHUkVFUy4gVGhpcyB3aWxsIHByb2JhYmx5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICAgKlxuICAgKiBAcGFyYW0gcmFkaXVzWCAtIFNlbWktbWFqb3IgYXhpcyBzaXplXG4gICAqIEBwYXJhbSByYWRpdXNZIC0gU2VtaS1taW5vciBheGlzIHNpemVcbiAgICogQHBhcmFtIHJvdGF0aW9uIC0gUm90YXRpb24gb2YgdGhlIGVsbGlwc2UgKGl0cyBzZW1pLW1ham9yIGF4aXMpXG4gICAqIEBwYXJhbSBsYXJnZUFyYyAtIFdoZXRoZXIgdGhlIGFyYyB3aWxsIGdvIHRoZSBsb25nZXN0IHJvdXRlIGFyb3VuZCB0aGUgZWxsaXBzZS5cbiAgICogQHBhcmFtIHN3ZWVwIC0gV2hldGhlciB0aGUgYXJjIG1hZGUgZ29lcyBmcm9tIHN0YXJ0IHRvIGVuZCBcImNsb2Nrd2lzZVwiIChvcHBvc2l0ZSBvZiBhbnRpY2xvY2t3aXNlIGZsYWcpXG4gICAqIEBwYXJhbSB4IC0gRW5kIHBvaW50IFggcG9zaXRpb25cbiAgICogQHBhcmFtIHkgLSBFbmQgcG9pbnQgWSBwb3NpdGlvblxuICAgKi9cbiAgcHVibGljIGVsbGlwdGljYWxBcmNUbyggcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIsIGxhcmdlQXJjOiBib29sZWFuLCBzd2VlcDogYm9vbGVhbiwgeDogbnVtYmVyLCB5OiBudW1iZXIgKTogdGhpcyB7XG4gICAgLy8gU2VlIFwiRi42LjUgQ29udmVyc2lvbiBmcm9tIGVuZHBvaW50IHRvIGNlbnRlciBwYXJhbWV0ZXJpemF0aW9uXCJcbiAgICAvLyBpbiBodHRwczovL3d3dy53My5vcmcvVFIvU1ZHL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3Rlc1xuXG4gICAgY29uc3QgZW5kUG9pbnQgPSBuZXcgVmVjdG9yMiggeCwgeSApO1xuICAgIHRoaXMuZW5zdXJlKCBlbmRQb2ludCApO1xuXG4gICAgY29uc3Qgc3RhcnRQb2ludCA9IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5nZXRMYXN0UG9pbnQoKTtcbiAgICB0aGlzLmdldExhc3RTdWJwYXRoKCkuYWRkUG9pbnQoIGVuZFBvaW50ICk7XG5cbiAgICAvLyBBYnNvbHV0ZSB2YWx1ZSBhcHBsaWVkIHRvIHJhZGlpIChwZXIgU1ZHIHNwZWMpXG4gICAgaWYgKCByYWRpdXNYIDwgMCApIHsgcmFkaXVzWCAqPSAtMS4wOyB9XG4gICAgaWYgKCByYWRpdXNZIDwgMCApIHsgcmFkaXVzWSAqPSAtMS4wOyB9XG5cbiAgICBsZXQgcnhzID0gcmFkaXVzWCAqIHJhZGl1c1g7XG4gICAgbGV0IHJ5cyA9IHJhZGl1c1kgKiByYWRpdXNZO1xuICAgIGNvbnN0IHByaW1lID0gc3RhcnRQb2ludC5taW51cyggZW5kUG9pbnQgKS5kaXZpZGVkU2NhbGFyKCAyICkucm90YXRlZCggLXJvdGF0aW9uICk7XG4gICAgY29uc3QgcHhzID0gcHJpbWUueCAqIHByaW1lLng7XG4gICAgY29uc3QgcHlzID0gcHJpbWUueSAqIHByaW1lLnk7XG4gICAgbGV0IGNlbnRlclByaW1lID0gbmV3IFZlY3RvcjIoIHJhZGl1c1ggKiBwcmltZS55IC8gcmFkaXVzWSwgLXJhZGl1c1kgKiBwcmltZS54IC8gcmFkaXVzWCApO1xuXG4gICAgLy8gSWYgdGhlIHJhZGlpIGFyZSBub3QgbGFyZ2UgZW5vdWdoIHRvIGFjY29tb2RhdGUgdGhlIHN0YXJ0L2VuZCBwb2ludCwgYXBwbHkgRi42LjYgY29ycmVjdGlvblxuICAgIGNvbnN0IHNpemUgPSBweHMgLyByeHMgKyBweXMgLyByeXM7XG4gICAgaWYgKCBzaXplID4gMSApIHtcbiAgICAgIHJhZGl1c1ggKj0gTWF0aC5zcXJ0KCBzaXplICk7XG4gICAgICByYWRpdXNZICo9IE1hdGguc3FydCggc2l6ZSApO1xuXG4gICAgICAvLyByZWRvIHNvbWUgY29tcHV0YXRpb25zIGZyb20gYWJvdmVcbiAgICAgIHJ4cyA9IHJhZGl1c1ggKiByYWRpdXNYO1xuICAgICAgcnlzID0gcmFkaXVzWSAqIHJhZGl1c1k7XG4gICAgICBjZW50ZXJQcmltZSA9IG5ldyBWZWN0b3IyKCByYWRpdXNYICogcHJpbWUueSAvIHJhZGl1c1ksIC1yYWRpdXNZICogcHJpbWUueCAvIHJhZGl1c1ggKTtcbiAgICB9XG5cbiAgICAvLyBOYW1pbmcgbWF0Y2hlcyBodHRwczovL3d3dy53My5vcmcvVFIvU1ZHL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3RlcyBmb3JcbiAgICAvLyBGLjYuNSBDb252ZXJzaW9uIGZyb20gZW5kcG9pbnQgdG8gY2VudGVyIHBhcmFtZXRlcml6YXRpb25cblxuICAgIGNlbnRlclByaW1lLm11bHRpcGx5U2NhbGFyKCBNYXRoLnNxcnQoIE1hdGgubWF4KCAwLCAoIHJ4cyAqIHJ5cyAtIHJ4cyAqIHB5cyAtIHJ5cyAqIHB4cyApIC8gKCByeHMgKiBweXMgKyByeXMgKiBweHMgKSApICkgKTtcbiAgICBpZiAoIGxhcmdlQXJjID09PSBzd2VlcCApIHtcbiAgICAgIC8vIEZyb20gc3BlYzogd2hlcmUgdGhlICsgc2lnbiBpcyBjaG9zZW4gaWYgZkEg4omgIGZTLCBhbmQgdGhlIOKIkiBzaWduIGlzIGNob3NlbiBpZiBmQSA9IGZTLlxuICAgICAgY2VudGVyUHJpbWUubXVsdGlwbHlTY2FsYXIoIC0xICk7XG4gICAgfVxuICAgIGNvbnN0IGNlbnRlciA9IHN0YXJ0UG9pbnQuYmxlbmQoIGVuZFBvaW50LCAwLjUgKS5wbHVzKCBjZW50ZXJQcmltZS5yb3RhdGVkKCByb3RhdGlvbiApICk7XG5cbiAgICBjb25zdCBzaWduZWRBbmdsZSA9ICggdTogVmVjdG9yMiwgdjogVmVjdG9yMiApID0+IHtcbiAgICAgIC8vIEZyb20gc3BlYzogd2hlcmUgdGhlIMKxIHNpZ24gYXBwZWFyaW5nIGhlcmUgaXMgdGhlIHNpZ24gb2YgdXggdnkg4oiSIHV5IHZ4LlxuICAgICAgcmV0dXJuICggKCB1LnggKiB2LnkgLSB1LnkgKiB2LnggKSA+IDAgPyAxIDogLTEgKSAqIHUuYW5nbGVCZXR3ZWVuKCB2ICk7XG4gICAgfTtcblxuICAgIGNvbnN0IHZpY3RvciA9IG5ldyBWZWN0b3IyKCAoIHByaW1lLnggLSBjZW50ZXJQcmltZS54ICkgLyByYWRpdXNYLCAoIHByaW1lLnkgLSBjZW50ZXJQcmltZS55ICkgLyByYWRpdXNZICk7XG4gICAgY29uc3Qgcm9zcyA9IG5ldyBWZWN0b3IyKCAoIC1wcmltZS54IC0gY2VudGVyUHJpbWUueCApIC8gcmFkaXVzWCwgKCAtcHJpbWUueSAtIGNlbnRlclByaW1lLnkgKSAvIHJhZGl1c1kgKTtcbiAgICBjb25zdCBzdGFydEFuZ2xlID0gc2lnbmVkQW5nbGUoIFZlY3RvcjIuWF9VTklULCB2aWN0b3IgKTtcbiAgICBsZXQgZGVsdGFBbmdsZSA9IHNpZ25lZEFuZ2xlKCB2aWN0b3IsIHJvc3MgKSAlICggTWF0aC5QSSAqIDIgKTtcblxuICAgIC8vIEZyb20gc3BlYzpcbiAgICAvLyA+IEluIG90aGVyIHdvcmRzLCBpZiBmUyA9IDAgYW5kIHRoZSByaWdodCBzaWRlIG9mIChGLjYuNS42KSBpcyBncmVhdGVyIHRoYW4gMCwgdGhlbiBzdWJ0cmFjdCAzNjDCsCwgd2hlcmVhcyBpZlxuICAgIC8vID4gZlMgPSAxIGFuZCB0aGUgcmlnaHQgc2lkZSBvZiAoRi42LjUuNikgaXMgbGVzcyB0aGFuIDAsIHRoZW4gYWRkIDM2MMKwLiBJbiBhbGwgb3RoZXIgY2FzZXMgbGVhdmUgaXQgYXMgaXMuXG4gICAgaWYgKCAhc3dlZXAgJiYgZGVsdGFBbmdsZSA+IDAgKSB7XG4gICAgICBkZWx0YUFuZ2xlIC09IE1hdGguUEkgKiAyO1xuICAgIH1cbiAgICBpZiAoIHN3ZWVwICYmIGRlbHRhQW5nbGUgPCAwICkge1xuICAgICAgZGVsdGFBbmdsZSArPSBNYXRoLlBJICogMjtcbiAgICB9XG5cbiAgICAvLyBTdGFuZGFyZCBoYW5kbGluZyBvZiBkZWdlbmVyYXRlIHNlZ21lbnRzIChwYXJ0aWN1bGFybHksIGNvbnZlcnRpbmcgZWxsaXB0aWNhbCBhcmNzIHRvIGNpcmN1bGFyIGFyY3MpXG4gICAgY29uc3QgZWxsaXB0aWNhbEFyYyA9IG5ldyBFbGxpcHRpY2FsQXJjKCBjZW50ZXIsIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uLCBzdGFydEFuZ2xlLCBzdGFydEFuZ2xlICsgZGVsdGFBbmdsZSwgIXN3ZWVwICk7XG4gICAgY29uc3Qgbm9uZGVnZW5lcmF0ZVNlZ21lbnRzID0gZWxsaXB0aWNhbEFyYy5nZXROb25kZWdlbmVyYXRlU2VnbWVudHMoKTtcbiAgICBfLmVhY2goIG5vbmRlZ2VuZXJhdGVTZWdtZW50cywgc2VnbWVudCA9PiB7XG4gICAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIHNlZ21lbnQgKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGNpcmNsZSB1c2luZyB0aGUgYXJjKCkgY2FsbFxuICAgKi9cbiAgcHVibGljIGNpcmNsZSggY2VudGVyOiBWZWN0b3IyLCByYWRpdXM6IG51bWJlciApOiB0aGlzO1xuICBwdWJsaWMgY2lyY2xlKCBjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIgKTogdGhpcztcbiAgcHVibGljIGNpcmNsZSggY2VudGVyWDogVmVjdG9yMiB8IG51bWJlciwgY2VudGVyWTogbnVtYmVyLCByYWRpdXM/OiBudW1iZXIgKTogdGhpcyB7XG4gICAgaWYgKCB0eXBlb2YgY2VudGVyWCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAvLyBjaXJjbGUoIGNlbnRlciwgcmFkaXVzIClcbiAgICAgIGNvbnN0IGNlbnRlciA9IGNlbnRlclg7XG4gICAgICByYWRpdXMgPSBjZW50ZXJZO1xuICAgICAgcmV0dXJuIHRoaXMuYXJjUG9pbnQoIGNlbnRlciwgcmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UgKS5jbG9zZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjZW50ZXJYICksIGBjZW50ZXJYIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlclh9YCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGNlbnRlclkgKSwgYGNlbnRlclkgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7Y2VudGVyWX1gICk7XG5cbiAgICAgIC8vIGNpcmNsZSggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzIClcbiAgICAgIHJldHVybiB0aGlzLmFyY1BvaW50KCB2KCBjZW50ZXJYLCBjZW50ZXJZICksIHJhZGl1cyEsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSApLmNsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGFuIGVsbGlwc2UgdXNpbmcgdGhlIGVsbGlwdGljYWxBcmMoKSBjYWxsXG4gICAqXG4gICAqIFRoZSByb3RhdGlvbiBpcyBhYm91dCB0aGUgY2VudGVyWCwgY2VudGVyWS5cbiAgICovXG4gIHB1YmxpYyBlbGxpcHNlKCBjZW50ZXI6IFZlY3RvcjIsIHJhZGl1c1g6IG51bWJlciwgcmFkaXVzWTogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyICk6IHRoaXM7XG4gIHB1YmxpYyBlbGxpcHNlKCBjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIgKTogdGhpcztcbiAgcHVibGljIGVsbGlwc2UoIGNlbnRlclg6IFZlY3RvcjIgfCBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uPzogbnVtYmVyICk6IHRoaXMge1xuICAgIC8vIFRPRE86IHNlcGFyYXRlIGludG8gZWxsaXBzZSgpIGFuZCBlbGxpcHNlUG9pbnQoKT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgLy8gVE9ETzogRWxsaXBzZS9FbGxpcHRpY2FsQXJjIGhhcyBhIG1lc3Mgb2YgcGFyYW1ldGVycy4gQ29uc2lkZXIgcGFyYW1ldGVyIG9iamVjdCwgb3IgZG91YmxlLWNoZWNrIHBhcmFtZXRlciBoYW5kbGluZyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBpZiAoIHR5cGVvZiBjZW50ZXJYID09PSAnb2JqZWN0JyApIHtcbiAgICAgIC8vIGVsbGlwc2UoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gKVxuICAgICAgY29uc3QgY2VudGVyID0gY2VudGVyWDtcbiAgICAgIHJvdGF0aW9uID0gcmFkaXVzWTtcbiAgICAgIHJhZGl1c1kgPSByYWRpdXNYO1xuICAgICAgcmFkaXVzWCA9IGNlbnRlclk7XG4gICAgICByZXR1cm4gdGhpcy5lbGxpcHRpY2FsQXJjUG9pbnQoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gfHwgMCwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICkuY2xvc2UoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY2VudGVyWCApLCBgY2VudGVyWCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHtjZW50ZXJYfWAgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBjZW50ZXJZICksIGBjZW50ZXJZIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke2NlbnRlcll9YCApO1xuXG4gICAgICAvLyBlbGxpcHNlKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXNYLCByYWRpdXNZLCByb3RhdGlvbiApXG4gICAgICByZXR1cm4gdGhpcy5lbGxpcHRpY2FsQXJjUG9pbnQoIHYoIGNlbnRlclgsIGNlbnRlclkgKSwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gfHwgMCwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICkuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJlY3RhbmdsZSBzaGFwZVxuICAgKlxuICAgKiBAcGFyYW0geCAtIGxlZnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHkgLSBib3R0b20gcG9zaXRpb24gKGluIG5vbiBpbnZlcnRlZCBjYXJ0ZXNpYW4gc3lzdGVtKVxuICAgKiBAcGFyYW0gd2lkdGhcbiAgICogQHBhcmFtIGhlaWdodFxuICAgKi9cbiAgcHVibGljIHJlY3QoIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCBgeCBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt4fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCBgeSBtdXN0IGJlIGEgZmluaXRlIG51bWJlcjogJHt5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggd2lkdGggKSwgYHdpZHRoIG11c3QgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3dpZHRofWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaGVpZ2h0ICksIGBoZWlnaHQgbXVzdCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7aGVpZ2h0fWAgKTtcblxuICAgIGNvbnN0IHN1YnBhdGggPSBuZXcgU3VicGF0aCgpO1xuICAgIHRoaXMuYWRkU3VicGF0aCggc3VicGF0aCApO1xuICAgIHN1YnBhdGguYWRkUG9pbnQoIHYoIHgsIHkgKSApO1xuICAgIHN1YnBhdGguYWRkUG9pbnQoIHYoIHggKyB3aWR0aCwgeSApICk7XG4gICAgc3VicGF0aC5hZGRQb2ludCggdiggeCArIHdpZHRoLCB5ICsgaGVpZ2h0ICkgKTtcbiAgICBzdWJwYXRoLmFkZFBvaW50KCB2KCB4LCB5ICsgaGVpZ2h0ICkgKTtcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIG5ldyBMaW5lKCBzdWJwYXRoLnBvaW50c1sgMCBdLCBzdWJwYXRoLnBvaW50c1sgMSBdICkgKTtcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIG5ldyBMaW5lKCBzdWJwYXRoLnBvaW50c1sgMSBdLCBzdWJwYXRoLnBvaW50c1sgMiBdICkgKTtcbiAgICB0aGlzLmFkZFNlZ21lbnRBbmRCb3VuZHMoIG5ldyBMaW5lKCBzdWJwYXRoLnBvaW50c1sgMiBdLCBzdWJwYXRoLnBvaW50c1sgMyBdICkgKTtcbiAgICBzdWJwYXRoLmNsb3NlKCk7XG4gICAgdGhpcy5hZGRTdWJwYXRoKCBuZXcgU3VicGF0aCgpICk7XG4gICAgdGhpcy5nZXRMYXN0U3VicGF0aCgpLmFkZFBvaW50KCB2KCB4LCB5ICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXNOYU4oIHRoaXMuYm91bmRzLmdldFgoKSApICk7XG4gICAgdGhpcy5yZXNldENvbnRyb2xQb2ludHMoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSByb3VuZCByZWN0YW5nbGUuIEFsbCBhcmd1bWVudHMgYXJlIG51bWJlci5cbiAgICpcbiAgICogQHBhcmFtIHhcbiAgICogQHBhcmFtIHlcbiAgICogQHBhcmFtIHdpZHRoIC0gd2lkdGggb2YgdGhlIHJlY3RhbmdsZVxuICAgKiBAcGFyYW0gaGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVcbiAgICogQHBhcmFtIGFyY3cgLSBhcmMgd2lkdGhcbiAgICogQHBhcmFtIGFyY2ggLSBhcmMgaGVpZ2h0XG4gICAqL1xuICBwdWJsaWMgcm91bmRSZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFyY3c6IG51bWJlciwgYXJjaDogbnVtYmVyICk6IHRoaXMge1xuICAgIGNvbnN0IGxvd1ggPSB4ICsgYXJjdztcbiAgICBjb25zdCBoaWdoWCA9IHggKyB3aWR0aCAtIGFyY3c7XG4gICAgY29uc3QgbG93WSA9IHkgKyBhcmNoO1xuICAgIGNvbnN0IGhpZ2hZID0geSArIGhlaWdodCAtIGFyY2g7XG4gICAgLy8gaWYgKCB0cnVlICkge1xuICAgIGlmICggYXJjdyA9PT0gYXJjaCApIHtcbiAgICAgIC8vIHdlIGNhbiB1c2UgY2lyY3VsYXIgYXJjcywgd2hpY2ggaGF2ZSB3ZWxsIGRlZmluZWQgc3Ryb2tlZCBvZmZzZXRzXG4gICAgICB0aGlzXG4gICAgICAgIC5hcmMoIGhpZ2hYLCBsb3dZLCBhcmN3LCAtTWF0aC5QSSAvIDIsIDAsIGZhbHNlIClcbiAgICAgICAgLmFyYyggaGlnaFgsIGhpZ2hZLCBhcmN3LCAwLCBNYXRoLlBJIC8gMiwgZmFsc2UgKVxuICAgICAgICAuYXJjKCBsb3dYLCBoaWdoWSwgYXJjdywgTWF0aC5QSSAvIDIsIE1hdGguUEksIGZhbHNlIClcbiAgICAgICAgLmFyYyggbG93WCwgbG93WSwgYXJjdywgTWF0aC5QSSwgTWF0aC5QSSAqIDMgLyAyLCBmYWxzZSApXG4gICAgICAgIC5jbG9zZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHdlIGhhdmUgdG8gcmVzb3J0IHRvIGVsbGlwdGljYWwgYXJjc1xuICAgICAgdGhpc1xuICAgICAgICAuZWxsaXB0aWNhbEFyYyggaGlnaFgsIGxvd1ksIGFyY3csIGFyY2gsIDAsIC1NYXRoLlBJIC8gMiwgMCwgZmFsc2UgKVxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggaGlnaFgsIGhpZ2hZLCBhcmN3LCBhcmNoLCAwLCAwLCBNYXRoLlBJIC8gMiwgZmFsc2UgKVxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggbG93WCwgaGlnaFksIGFyY3csIGFyY2gsIDAsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCBsb3dYLCBsb3dZLCBhcmN3LCBhcmNoLCAwLCBNYXRoLlBJLCBNYXRoLlBJICogMyAvIDIsIGZhbHNlIClcbiAgICAgICAgLmNsb3NlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwb2x5Z29uIGZyb20gYW4gYXJyYXkgb2YgdmVydGljZXMuXG4gICAqL1xuICBwdWJsaWMgcG9seWdvbiggdmVydGljZXM6IFZlY3RvcjJbXSApOiB0aGlzIHtcbiAgICBjb25zdCBsZW5ndGggPSB2ZXJ0aWNlcy5sZW5ndGg7XG4gICAgaWYgKCBsZW5ndGggPiAwICkge1xuICAgICAgdGhpcy5tb3ZlVG9Qb2ludCggdmVydGljZXNbIDAgXSApO1xuICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHRoaXMubGluZVRvUG9pbnQoIHZlcnRpY2VzWyBpIF0gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gZ2VuZXJhdGUgQ2FyZGluYWwgc3BsaW5lc1xuICAgKiBmcm9tIGEgcG9zaXRpb24gYXJyYXkuIENhcmRpbmFsIHNwbGluZSBkaWZmZXJzIGZyb20gQmV6aWVyIGN1cnZlcyBpbiB0aGF0IGFsbFxuICAgKiBkZWZpbmVkIHBvaW50cyBvbiBhIENhcmRpbmFsIHNwbGluZSBhcmUgb24gdGhlIHBhdGggaXRzZWxmLlxuICAgKlxuICAgKiBJdCBpbmNsdWRlcyBhIHRlbnNpb24gcGFyYW1ldGVyIHRvIGFsbG93IHRoZSBjbGllbnQgdG8gc3BlY2lmeSBob3cgdGlnaHRseVxuICAgKiB0aGUgcGF0aCBpbnRlcnBvbGF0ZXMgYmV0d2VlbiBwb2ludHMuIE9uZSBjYW4gdGhpbmsgb2YgdGhlIHRlbnNpb24gYXMgdGhlIHRlbnNpb24gaW5cbiAgICogYSBydWJiZXIgYmFuZCBhcm91bmQgcGVncy4gaG93ZXZlciB1bmxpa2UgYSBydWJiZXIgYmFuZCB0aGUgdGVuc2lvbiBjYW4gYmUgbmVnYXRpdmUuXG4gICAqIHRoZSB0ZW5zaW9uIHJhbmdlcyBmcm9tIC0xIHRvIDFcbiAgICovXG4gIHB1YmxpYyBjYXJkaW5hbFNwbGluZSggcG9zaXRpb25zOiBWZWN0b3IyW10sIHByb3ZpZGVkT3B0aW9ucz86IENhcmRpbmFsU3BsaW5lT3B0aW9ucyApOiB0aGlzIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2FyZGluYWxTcGxpbmVPcHRpb25zPigpKCB7XG4gICAgICB0ZW5zaW9uOiAwLFxuICAgICAgaXNDbG9zZWRMaW5lU2VnbWVudHM6IGZhbHNlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRlbnNpb24gPCAxICYmIG9wdGlvbnMudGVuc2lvbiA+IC0xLCAnIHRoZSB0ZW5zaW9uIGdvZXMgZnJvbSAtMSB0byAxICcgKTtcblxuICAgIGNvbnN0IHBvaW50TnVtYmVyID0gcG9zaXRpb25zLmxlbmd0aDsgLy8gbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgYXJyYXlcblxuICAgIC8vIGlmIHRoZSBsaW5lIGlzIG9wZW4sIHRoZXJlIGlzIG9uZSBsZXNzIHNlZ21lbnRzIHRoYW4gcG9pbnQgdmVjdG9yc1xuICAgIGNvbnN0IHNlZ21lbnROdW1iZXIgPSAoIG9wdGlvbnMuaXNDbG9zZWRMaW5lU2VnbWVudHMgKSA/IHBvaW50TnVtYmVyIDogcG9pbnROdW1iZXIgLSAxO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2VnbWVudE51bWJlcjsgaSsrICkge1xuICAgICAgbGV0IGNhcmRpbmFsUG9pbnRzOyAvLyB7QXJyYXkuPFZlY3RvcjI+fSBjYXJkaW5hbCBwb2ludHMgQXJyYXlcbiAgICAgIGlmICggaSA9PT0gMCAmJiAhb3B0aW9ucy5pc0Nsb3NlZExpbmVTZWdtZW50cyApIHtcbiAgICAgICAgY2FyZGluYWxQb2ludHMgPSBbXG4gICAgICAgICAgcG9zaXRpb25zWyAwIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyAwIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyAxIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyAyIF0gXTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAoIGkgPT09IHNlZ21lbnROdW1iZXIgLSAxICkgJiYgIW9wdGlvbnMuaXNDbG9zZWRMaW5lU2VnbWVudHMgKSB7XG4gICAgICAgIGNhcmRpbmFsUG9pbnRzID0gW1xuICAgICAgICAgIHBvc2l0aW9uc1sgaSAtIDEgXSxcbiAgICAgICAgICBwb3NpdGlvbnNbIGkgXSxcbiAgICAgICAgICBwb3NpdGlvbnNbIGkgKyAxIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyBpICsgMSBdIF07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY2FyZGluYWxQb2ludHMgPSBbXG4gICAgICAgICAgcG9zaXRpb25zWyAoIGkgLSAxICsgcG9pbnROdW1iZXIgKSAlIHBvaW50TnVtYmVyIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyBpICUgcG9pbnROdW1iZXIgXSxcbiAgICAgICAgICBwb3NpdGlvbnNbICggaSArIDEgKSAlIHBvaW50TnVtYmVyIF0sXG4gICAgICAgICAgcG9zaXRpb25zWyAoIGkgKyAyICkgJSBwb2ludE51bWJlciBdIF07XG4gICAgICB9XG5cbiAgICAgIC8vIENhcmRpbmFsIFNwbGluZSB0byBDdWJpYyBCZXppZXIgY29udmVyc2lvbiBtYXRyaXhcbiAgICAgIC8vICAgIDAgICAgICAgICAgICAgICAgIDEgICAgICAgICAgICAgMCAgICAgICAgICAgIDBcbiAgICAgIC8vICAoLTErdGVuc2lvbikvNiAgICAgIDEgICAgICAoMS10ZW5zaW9uKS82ICAgICAgIDBcbiAgICAgIC8vICAgIDAgICAgICAgICAgICAoMS10ZW5zaW9uKS82ICAgICAgMSAgICAgICAoLTErdGVuc2lvbikvNlxuICAgICAgLy8gICAgMCAgICAgICAgICAgICAgICAgMCAgICAgICAgICAgICAxICAgICAgICAgICAwXG5cbiAgICAgIC8vIHtBcnJheS48VmVjdG9yMj59IGJlemllciBwb2ludHMgQXJyYXlcbiAgICAgIGNvbnN0IGJlemllclBvaW50cyA9IFtcbiAgICAgICAgY2FyZGluYWxQb2ludHNbIDEgXSxcbiAgICAgICAgd2VpZ2h0ZWRTcGxpbmVWZWN0b3IoIGNhcmRpbmFsUG9pbnRzWyAwIF0sIGNhcmRpbmFsUG9pbnRzWyAxIF0sIGNhcmRpbmFsUG9pbnRzWyAyIF0sIG9wdGlvbnMudGVuc2lvbiApLFxuICAgICAgICB3ZWlnaHRlZFNwbGluZVZlY3RvciggY2FyZGluYWxQb2ludHNbIDMgXSwgY2FyZGluYWxQb2ludHNbIDIgXSwgY2FyZGluYWxQb2ludHNbIDEgXSwgb3B0aW9ucy50ZW5zaW9uICksXG4gICAgICAgIGNhcmRpbmFsUG9pbnRzWyAyIF1cbiAgICAgIF07XG5cbiAgICAgIC8vIHNwZWNpYWwgb3BlcmF0aW9ucyBvbiB0aGUgZmlyc3QgcG9pbnRcbiAgICAgIGlmICggaSA9PT0gMCApIHtcbiAgICAgICAgdGhpcy5lbnN1cmUoIGJlemllclBvaW50c1sgMCBdICk7XG4gICAgICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggYmV6aWVyUG9pbnRzWyAwIF0gKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jdWJpY0N1cnZlVG9Qb2ludCggYmV6aWVyUG9pbnRzWyAxIF0sIGJlemllclBvaW50c1sgMiBdLCBiZXppZXJQb2ludHNbIDMgXSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgc2hhcGVcbiAgICovXG4gIHB1YmxpYyBjb3B5KCk6IFNoYXBlIHtcbiAgICAvLyBjb3B5IGVhY2ggaW5kaXZpZHVhbCBzdWJwYXRoLCBzbyBmdXR1cmUgbW9kaWZpY2F0aW9ucyB0byBlaXRoZXIgU2hhcGUgZG9lc24ndCBhZmZlY3QgdGhlIG90aGVyIG9uZVxuICAgIHJldHVybiBuZXcgU2hhcGUoIF8ubWFwKCB0aGlzLnN1YnBhdGhzLCBzdWJwYXRoID0+IHN1YnBhdGguY29weSgpICksIHRoaXMuYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogV3JpdGVzIG91dCB0aGlzIHNoYXBlJ3MgcGF0aCB0byBhIGNhbnZhcyAyZCBjb250ZXh0LiBkb2VzIE5PVCBpbmNsdWRlIHRoZSBiZWdpblBhdGgoKSFcbiAgICovXG4gIHB1YmxpYyB3cml0ZVRvQ29udGV4dCggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEICk6IHZvaWQge1xuICAgIGNvbnN0IGxlbiA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgdGhpcy5zdWJwYXRoc1sgaSBdLndyaXRlVG9Db250ZXh0KCBjb250ZXh0ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc29tZXRoaW5nIGxpa2UgXCJNMTUwIDAgTDc1IDIwMCBMMjI1IDIwMCBaXCIgZm9yIGEgdHJpYW5nbGUgKHRvIGJlIHVzZWQgd2l0aCBhIFNWRyBwYXRoIGVsZW1lbnQncyAnZCdcbiAgICogYXR0cmlidXRlKVxuICAgKi9cbiAgcHVibGljIGdldFNWR1BhdGgoKTogc3RyaW5nIHtcbiAgICBsZXQgc3RyaW5nID0gJyc7XG4gICAgY29uc3QgbGVuID0gdGhpcy5zdWJwYXRocy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb25zdCBzdWJwYXRoID0gdGhpcy5zdWJwYXRoc1sgaSBdO1xuICAgICAgaWYgKCBzdWJwYXRoLmlzRHJhd2FibGUoKSApIHtcbiAgICAgICAgLy8gc2luY2UgdGhlIGNvbW1hbmRzIGFmdGVyIHRoaXMgYXJlIHJlbGF0aXZlIHRvIHRoZSBwcmV2aW91cyAncG9pbnQnLCB3ZSBuZWVkIHRvIHNwZWNpZnkgYSBtb3ZlIHRvIHRoZSBpbml0aWFsIHBvaW50XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSBzdWJwYXRoLnNlZ21lbnRzWyAwIF0uc3RhcnQ7XG5cbiAgICAgICAgc3RyaW5nICs9IGBNICR7c3ZnTnVtYmVyKCBzdGFydFBvaW50LnggKX0gJHtzdmdOdW1iZXIoIHN0YXJ0UG9pbnQueSApfSBgO1xuXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHN1YnBhdGguc2VnbWVudHMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgICAgc3RyaW5nICs9IGAke3N1YnBhdGguc2VnbWVudHNbIGsgXS5nZXRTVkdQYXRoRnJhZ21lbnQoKX0gYDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggc3VicGF0aC5pc0Nsb3NlZCgpICkge1xuICAgICAgICAgIHN0cmluZyArPSAnWiAnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBTaGFwZSB0aGF0IGlzIHRyYW5zZm9ybWVkIGJ5IHRoZSBhc3NvY2lhdGVkIG1hdHJpeFxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybWVkKCBtYXRyaXg6IE1hdHJpeDMgKTogU2hhcGUge1xuICAgIC8vIFRPRE86IGFsbG9jYXRpb24gcmVkdWN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IHN1YnBhdGhzID0gXy5tYXAoIHRoaXMuc3VicGF0aHMsIHN1YnBhdGggPT4gc3VicGF0aC50cmFuc2Zvcm1lZCggbWF0cml4ICkgKTtcbiAgICBjb25zdCBib3VuZHMgPSBfLnJlZHVjZSggc3VicGF0aHMsICggYm91bmRzLCBzdWJwYXRoICkgPT4gYm91bmRzLnVuaW9uKCBzdWJwYXRoLmJvdW5kcyApLCBCb3VuZHMyLk5PVEhJTkcgKTtcbiAgICByZXR1cm4gbmV3IFNoYXBlKCBzdWJwYXRocywgYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBzdWJwYXRoIHRvIGEgbmV3IHNoYXBlIG1hZGUgb2YgbWFueSBsaW5lIHNlZ21lbnRzIChhcHByb3hpbWF0aW5nIHRoZSBjdXJyZW50IHNoYXBlKSB3aXRoIHRoZVxuICAgKiB0cmFuc2Zvcm1hdGlvbiBhcHBsaWVkLlxuICAgKi9cbiAgcHVibGljIG5vbmxpbmVhclRyYW5zZm9ybWVkKCBwcm92aWRlZE9wdGlvbnM/OiBOb25saW5lYXJUcmFuc2Zvcm1lZE9wdGlvbnMgKTogU2hhcGUge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxOb25saW5lYXJUcmFuc2Zvcm1lZE9wdGlvbnM+KCB7XG4gICAgICBtaW5MZXZlbHM6IDAsXG4gICAgICBtYXhMZXZlbHM6IDcsXG4gICAgICBkaXN0YW5jZUVwc2lsb246IDAuMTYsIC8vIE5PVEU6IHRoaXMgd2lsbCBjaGFuZ2Ugd2hlbiB0aGUgU2hhcGUgaXMgc2NhbGVkLCBzaW5jZSB0aGlzIGlzIGEgdGhyZXNob2xkIGZvciB0aGUgc3F1YXJlIG9mIGEgZGlzdGFuY2UgdmFsdWVcbiAgICAgIGN1cnZlRXBzaWxvbjogKCBwcm92aWRlZE9wdGlvbnMgJiYgcHJvdmlkZWRPcHRpb25zLmluY2x1ZGVDdXJ2YXR1cmUgKSA/IDAuMDAyIDogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gVE9ETzogYWxsb2NhdGlvbiByZWR1Y3Rpb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3Qgc3VicGF0aHMgPSBfLm1hcCggdGhpcy5zdWJwYXRocywgc3VicGF0aCA9PiBzdWJwYXRoLm5vbmxpbmVhclRyYW5zZm9ybWVkKCBvcHRpb25zICkgKTtcbiAgICBjb25zdCBib3VuZHMgPSBfLnJlZHVjZSggc3VicGF0aHMsICggYm91bmRzLCBzdWJwYXRoICkgPT4gYm91bmRzLnVuaW9uKCBzdWJwYXRoLmJvdW5kcyApLCBCb3VuZHMyLk5PVEhJTkcgKTtcbiAgICByZXR1cm4gbmV3IFNoYXBlKCBzdWJwYXRocywgYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBwb2ludHMgYnkgdHJlYXRpbmcgdGhlaXIgeCBjb29yZGluYXRlIGFzIHBvbGFyIGFuZ2xlLCBhbmQgeSBjb29yZGluYXRlIGFzIHBvbGFyIG1hZ25pdHVkZS5cbiAgICogU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUG9sYXJfY29vcmRpbmF0ZV9zeXN0ZW1cbiAgICpcbiAgICogUGxlYXNlIHNlZSBTaGFwZS5ub25saW5lYXJUcmFuc2Zvcm1lZCBmb3IgbW9yZSBkb2N1bWVudGF0aW9uIG9uIGFkYXB0aXZlIGRpc2NyZXRpemF0aW9uIG9wdGlvbnMgKG1pbkxldmVscywgbWF4TGV2ZWxzLCBkaXN0YW5jZUVwc2lsb24sIGN1cnZlRXBzaWxvbilcbiAgICpcbiAgICogRXhhbXBsZTogQSBsaW5lIGZyb20gKDAsMTApIHRvIChwaSwxMCkgd2lsbCBiZSB0cmFuc2Zvcm1lZCB0byBhIGNpcmN1bGFyIGFyYyBmcm9tICgxMCwwKSB0byAoLTEwLDApIHBhc3NpbmcgdGhyb3VnaCAoMCwxMCkuXG4gICAqL1xuICBwdWJsaWMgcG9sYXJUb0NhcnRlc2lhbiggb3B0aW9ucz86IE5vbmxpbmVhclRyYW5zZm9ybWVkT3B0aW9ucyApOiBTaGFwZSB7XG4gICAgcmV0dXJuIHRoaXMubm9ubGluZWFyVHJhbnNmb3JtZWQoIGNvbWJpbmVPcHRpb25zPE5vbmxpbmVhclRyYW5zZm9ybWVkT3B0aW9ucz4oIHtcbiAgICAgIHBvaW50TWFwOiBwID0+IFZlY3RvcjIuY3JlYXRlUG9sYXIoIHAueSwgcC54ICksXG4gICAgICBtZXRob2ROYW1lOiAncG9sYXJUb0NhcnRlc2lhbicgLy8gdGhpcyB3aWxsIGJlIGNhbGxlZCBvbiBTZWdtZW50cyBpZiBpdCBleGlzdHMgdG8gZG8gbW9yZSBvcHRpbWl6ZWQgY29udmVyc2lvbiAoc2VlIExpbmUpXG4gICAgfSwgb3B0aW9ucyApICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgZWFjaCBzZWdtZW50IGludG8gbGluZXMsIHVzaW5nIGFuIGFkYXB0aXZlIChtaWRwb2ludCBkaXN0YW5jZSBzdWJkaXZpc2lvbikgbWV0aG9kLlxuICAgKlxuICAgKiBOT1RFOiB1c2VzIG5vbmxpbmVhclRyYW5zZm9ybWVkIG1ldGhvZCBpbnRlcm5hbGx5LCBidXQgc2luY2Ugd2UgZG9uJ3QgcHJvdmlkZSBhIHBvaW50TWFwIG9yIG1ldGhvZE5hbWUsIGl0IHdvbid0IGNyZWF0ZSBhbnl0aGluZyBidXQgbGluZSBzZWdtZW50cy5cbiAgICogU2VlIG5vbmxpbmVhclRyYW5zZm9ybWVkIGZvciBkb2N1bWVudGF0aW9uIG9mIG9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyB0b1BpZWNld2lzZUxpbmVhciggb3B0aW9ucz86IE5vbmxpbmVhclRyYW5zZm9ybWVkT3B0aW9ucyApOiBTaGFwZSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMgfHwgIW9wdGlvbnMucG9pbnRNYXAsICdObyBwb2ludE1hcCBmb3IgdG9QaWVjZXdpc2VMaW5lYXIgYWxsb3dlZCwgc2luY2UgaXQgY291bGQgY3JlYXRlIG5vbi1saW5lYXIgc2VnbWVudHMnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMgfHwgIW9wdGlvbnMubWV0aG9kTmFtZSwgJ05vIG1ldGhvZE5hbWUgZm9yIHRvUGllY2V3aXNlTGluZWFyIGFsbG93ZWQsIHNpbmNlIGl0IGNvdWxkIGNyZWF0ZSBub24tbGluZWFyIHNlZ21lbnRzJyApO1xuICAgIHJldHVybiB0aGlzLm5vbmxpbmVhclRyYW5zZm9ybWVkKCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhpcyBwb2ludCBjb250YWluZWQgaW4gdGhpcyBzaGFwZVxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuXG4gICAgLy8gV2UgcGljayBhIHJheSwgYW5kIGRldGVybWluZSB0aGUgd2luZGluZyBudW1iZXIgb3ZlciB0aGF0IHJheS4gaWYgdGhlIG51bWJlciBvZiBzZWdtZW50cyBjcm9zc2luZyBpdFxuICAgIC8vIENDVyA9PSBudW1iZXIgb2Ygc2VnbWVudHMgY3Jvc3NpbmcgaXQgQ1csIHRoZW4gdGhlIHBvaW50IGlzIGNvbnRhaW5lZCBpbiB0aGUgc2hhcGVcblxuICAgIGNvbnN0IHJheURpcmVjdGlvbiA9IFZlY3RvcjIuWF9VTklULmNvcHkoKTsgLy8gd2UgbWF5IG11dGF0ZSBpdFxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgYSByYXkgdGhhdCBkb2Vzbid0IGludGVyc2VjdCB3aXRoIGFueSBvZiB0aGUgdmVydGljZXMgb2YgdGhlIHNoYXBlIHNlZ21lbnRzLFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOTQuXG4gICAgLy8gUHV0IGEgbGltaXQgb24gYXR0ZW1wdHMsIHNvIHdlIGRvbid0IHRyeSBmb3JldmVyXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICB3aGlsZSAoIGNvdW50IDwgNSApIHtcbiAgICAgIGNvdW50Kys7XG5cbiAgICAgIC8vIExvb2sgZm9yIGNhc2VzIHdoZXJlIHRoZSBwcm9wb3NlZCByYXkgd2lsbCBpbnRlcnNlY3Qgd2l0aCBvbmUgb2YgdGhlIHZlcnRpY2VzIG9mIGEgc2hhcGUgc2VnbWVudCAtIGluIHRoaXMgY2FzZVxuICAgICAgLy8gdGhlIGludGVyc2VjdGlvbiBpbiB3aW5kaW5nSW50ZXJzZWN0aW9uIG1heSBub3QgYmUgd2VsbC1kZWZpbmVkIGFuZCB3b24ndCBiZSBjb3VudGVkLCBzbyB3ZSBuZWVkIHRvIHVzZSBhIHJheVxuICAgICAgLy8gd2l0aCBhIGRpZmZlcmVudCBkaXJlY3Rpb25cbiAgICAgIGNvbnN0IHJheUludGVyc2VjdHNTZWdtZW50VmVydGV4ID0gXy5zb21lKCB0aGlzLnN1YnBhdGhzLCBzdWJwYXRoID0+IHtcbiAgICAgICAgcmV0dXJuIF8uc29tZSggc3VicGF0aC5zZWdtZW50cywgc2VnbWVudCA9PiB7XG4gICAgICAgICAgY29uc3QgZGVsdGEgPSBzZWdtZW50LnN0YXJ0Lm1pbnVzKCBwb2ludCApO1xuICAgICAgICAgIGNvbnN0IG1hZ25pdHVkZSA9IGRlbHRhLm1hZ25pdHVkZTtcbiAgICAgICAgICBpZiAoIG1hZ25pdHVkZSAhPT0gMCApIHtcbiAgICAgICAgICAgIGRlbHRhLmRpdmlkZVNjYWxhciggbWFnbml0dWRlICk7IC8vIG5vcm1hbGl6ZSBpdFxuICAgICAgICAgICAgZGVsdGEuc3VidHJhY3QoIHJheURpcmVjdGlvbiApOyAvLyBjaGVjayBhZ2FpbnN0IHRoZSBwcm9wb3NlZCByYXkgZGlyZWN0aW9uXG4gICAgICAgICAgICByZXR1cm4gZGVsdGEubWFnbml0dWRlU3F1YXJlZCA8IDFlLTk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgb3VyIHBvaW50IGlzIG9uIGEgc2VnbWVudCBzdGFydCwgdGhlcmUgcHJvYmFibHkgd29uJ3QgYmUgYSBncmVhdCByYXkgdG8gdXNlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGlmICggcmF5SW50ZXJzZWN0c1NlZ21lbnRWZXJ0ZXggKSB7XG4gICAgICAgIC8vIHRoZSBwcm9wb3NlZCByYXkgbWF5IG5vdCB3b3JrIGJlY2F1c2UgaXQgaW50ZXJzZWN0cyB3aXRoIGEgc2VnbWVudCB2ZXJ0ZXggLSB0cnkgYW5vdGhlciBvbmVcbiAgICAgICAgcmF5RGlyZWN0aW9uLnJvdGF0ZSggZG90UmFuZG9tLm5leHREb3VibGUoKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIFNob3VsZCBiZSBzYWZlIHRvIHVzZSB0aGlzIHJheURpcmVjdGlvbiBmb3Igd2luZGluZ0ludGVyc2VjdGlvblxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy53aW5kaW5nSW50ZXJzZWN0aW9uKCBuZXcgUmF5MiggcG9pbnQsIHJheURpcmVjdGlvbiApICkgIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogSGl0LXRlc3RzIHRoaXMgc2hhcGUgd2l0aCB0aGUgcmF5LiBBbiBhcnJheSBvZiBhbGwgaW50ZXJzZWN0aW9ucyBvZiB0aGUgcmF5IHdpdGggdGhpcyBzaGFwZSB3aWxsIGJlIHJldHVybmVkLlxuICAgKiBGb3IgdGhpcyBmdW5jdGlvbiwgaW50ZXJzZWN0aW9ucyB3aWxsIGJlIHJldHVybmVkIHNvcnRlZCBieSB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcmF5J3MgcG9zaXRpb24uXG4gICAqL1xuICBwdWJsaWMgaW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogUmF5SW50ZXJzZWN0aW9uW10ge1xuICAgIGxldCBoaXRzOiBSYXlJbnRlcnNlY3Rpb25bXSA9IFtdO1xuICAgIGNvbnN0IG51bVN1YnBhdGhzID0gdGhpcy5zdWJwYXRocy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VicGF0aHM7IGkrKyApIHtcbiAgICAgIGNvbnN0IHN1YnBhdGggPSB0aGlzLnN1YnBhdGhzWyBpIF07XG5cbiAgICAgIGlmICggc3VicGF0aC5pc0RyYXdhYmxlKCkgKSB7XG4gICAgICAgIGNvbnN0IG51bVNlZ21lbnRzID0gc3VicGF0aC5zZWdtZW50cy5sZW5ndGg7XG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IG51bVNlZ21lbnRzOyBrKysgKSB7XG4gICAgICAgICAgY29uc3Qgc2VnbWVudCA9IHN1YnBhdGguc2VnbWVudHNbIGsgXTtcbiAgICAgICAgICBoaXRzID0gaGl0cy5jb25jYXQoIHNlZ21lbnQuaW50ZXJzZWN0aW9uKCByYXkgKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBzdWJwYXRoLmhhc0Nsb3NpbmdTZWdtZW50KCkgKSB7XG4gICAgICAgICAgaGl0cyA9IGhpdHMuY29uY2F0KCBzdWJwYXRoLmdldENsb3NpbmdTZWdtZW50KCkuaW50ZXJzZWN0aW9uKCByYXkgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfLnNvcnRCeSggaGl0cywgaGl0ID0+IGhpdC5kaXN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgcHJvdmlkZWQgbGluZSBzZWdtZW50IHdvdWxkIGhhdmUgc29tZSBwYXJ0IG9uIHRvcCBvciB0b3VjaGluZyB0aGUgaW50ZXJpb3IgKGZpbGxlZCBhcmVhKSBvZlxuICAgKiB0aGlzIHNoYXBlLlxuICAgKlxuICAgKiBUaGlzIGRpZmZlcnMgc29tZXdoYXQgZnJvbSBhbiBpbnRlcnNlY3Rpb24gb2YgdGhlIGxpbmUgc2VnbWVudCB3aXRoIHRoZSBTaGFwZSdzIHBhdGgsIGFzIHdlIHdpbGwgcmV0dXJuIHRydWVcbiAgICogKFwiaW50ZXJzZWN0aW9uXCIpIGlmIHRoZSBsaW5lIHNlZ21lbnQgaXMgZW50aXJlbHkgY29udGFpbmVkIGluIHRoZSBpbnRlcmlvciBvZiB0aGUgU2hhcGUncyBwYXRoLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRQb2ludCAtIE9uZSBlbmQgb2YgdGhlIGxpbmUgc2VnbWVudFxuICAgKiBAcGFyYW0gZW5kUG9pbnQgLSBUaGUgb3RoZXIgZW5kIG9mIHRoZSBsaW5lIHNlZ21lbnRcbiAgICovXG4gIHB1YmxpYyBpbnRlcmlvckludGVyc2VjdHNMaW5lU2VnbWVudCggc3RhcnRQb2ludDogVmVjdG9yMiwgZW5kUG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgb3VyIG1pZHBvaW50IGlzIGluIHRoZSBTaGFwZSAoYXMgZWl0aGVyIG91ciBtaWRwb2ludCBpcyBpbiB0aGUgU2hhcGUsIE9SIHRoZSBsaW5lIHNlZ21lbnQgd2lsbFxuICAgIC8vIGludGVyc2VjdCB0aGUgU2hhcGUncyBib3VuZGFyeSBwYXRoKS5cbiAgICBjb25zdCBtaWRwb2ludCA9IHN0YXJ0UG9pbnQuYmxlbmQoIGVuZFBvaW50LCAwLjUgKTtcbiAgICBpZiAoIHRoaXMuY29udGFpbnNQb2ludCggbWlkcG9pbnQgKSApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGlmIGFuIGlzc3VlLCB3ZSBjYW4gcmVkdWNlIHRoaXMgYWxsb2NhdGlvbiB0byBhIHNjcmF0Y2ggdmFyaWFibGUgbG9jYWwgaW4gdGhlIFNoYXBlLmpzIHNjb3BlLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBjb25zdCBkZWx0YSA9IGVuZFBvaW50Lm1pbnVzKCBzdGFydFBvaW50ICk7XG4gICAgY29uc3QgbGVuZ3RoID0gZGVsdGEubWFnbml0dWRlO1xuXG4gICAgaWYgKCBsZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZGVsdGEubm9ybWFsaXplKCk7IC8vIHNvIHdlIGNhbiB1c2UgaXQgYXMgYSB1bml0IHZlY3RvciwgZXhwZWN0ZWQgYnkgdGhlIFJheVxuXG4gICAgLy8gR3JhYiBhbGwgaW50ZXJzZWN0aW9ucyAodGhhdCBhcmUgZnJvbSBzdGFydFBvaW50IHRvd2FyZHMgdGhlIGRpcmVjdGlvbiBvZiBlbmRQb2ludClcbiAgICBjb25zdCBoaXRzID0gdGhpcy5pbnRlcnNlY3Rpb24oIG5ldyBSYXkyKCBzdGFydFBvaW50LCBkZWx0YSApICk7XG5cbiAgICAvLyBTZWUgaWYgd2UgaGF2ZSBhbnkgaW50ZXJzZWN0aW9ucyBhbG9uZyBvdXIgaW5maW5pdGUgcmF5IHdob3NlIGRpc3RhbmNlIGZyb20gdGhlIHN0YXJ0UG9pbnQgaXMgbGVzcyB0aGFuIG9yXG4gICAgLy8gZXF1YWwgdG8gb3VyIGxpbmUgc2VnbWVudCdzIGxlbmd0aC5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBoaXRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBoaXRzWyBpIF0uZGlzdGFuY2UgPD0gbGVuZ3RoICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEaWQgbm90IGhpdCB0aGUgYm91bmRhcnksIGFuZCB3YXNuJ3QgZnVsbHkgY29udGFpbmVkLlxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3aW5kaW5nIG51bWJlciBmb3IgaW50ZXJzZWN0aW9uIHdpdGggYSByYXlcbiAgICovXG4gIHB1YmxpYyB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogbnVtYmVyIHtcbiAgICBsZXQgd2luZCA9IDA7XG5cbiAgICBjb25zdCBudW1TdWJwYXRocyA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN1YnBhdGhzOyBpKysgKSB7XG4gICAgICBjb25zdCBzdWJwYXRoID0gdGhpcy5zdWJwYXRoc1sgaSBdO1xuXG4gICAgICBpZiAoIHN1YnBhdGguaXNEcmF3YWJsZSgpICkge1xuICAgICAgICBjb25zdCBudW1TZWdtZW50cyA9IHN1YnBhdGguc2VnbWVudHMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCBudW1TZWdtZW50czsgaysrICkge1xuICAgICAgICAgIHdpbmQgKz0gc3VicGF0aC5zZWdtZW50c1sgayBdLndpbmRpbmdJbnRlcnNlY3Rpb24oIHJheSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIHRoZSBpbXBsaWNpdCBjbG9zaW5nIGxpbmUgc2VnbWVudFxuICAgICAgICBpZiAoIHN1YnBhdGguaGFzQ2xvc2luZ1NlZ21lbnQoKSApIHtcbiAgICAgICAgICB3aW5kICs9IHN1YnBhdGguZ2V0Q2xvc2luZ1NlZ21lbnQoKS53aW5kaW5nSW50ZXJzZWN0aW9uKCByYXkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB3aW5kO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHBhdGggb2YgdGhlIFNoYXBlIGludGVyc2VjdHMgKG9yIGlzIGNvbnRhaW5lZCBpbikgdGhlIHByb3ZpZGVkIGJvdW5kaW5nIGJveC5cbiAgICogQ29tcHV0ZWQgYnkgY2hlY2tpbmcgaW50ZXJzZWN0aW9ucyB3aXRoIGFsbCBmb3VyIGVkZ2VzIG9mIHRoZSBib3VuZGluZyBib3gsIG9yIHdoZXRoZXIgdGhlIFNoYXBlIGlzIHRvdGFsbHlcbiAgICogY29udGFpbmVkIHdpdGhpbiB0aGUgYm91bmRpbmcgYm94LlxuICAgKi9cbiAgcHVibGljIGludGVyc2VjdHNCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBib29sZWFuIHtcbiAgICAvLyBJZiB0aGUgYm91bmRpbmcgYm94IGNvbXBsZXRlbHkgc3Vycm91bmRzIG91ciBzaGFwZSwgaXQgaW50ZXJzZWN0cyB0aGUgYm91bmRzXG4gICAgaWYgKCB0aGlzLmJvdW5kcy5pbnRlcnNlY3Rpb24oIGJvdW5kcyApLmVxdWFscyggdGhpcy5ib3VuZHMgKSApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIHJheXMgZm9yIGhpdCB0ZXN0aW5nIGFsb25nIHRoZSBib3VuZGluZyBib3ggZWRnZXNcbiAgICBjb25zdCBtaW5Ib3Jpem9udGFsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWluWCwgYm91bmRzLm1pblkgKSwgbmV3IFZlY3RvcjIoIDEsIDAgKSApO1xuICAgIGNvbnN0IG1pblZlcnRpY2FsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWluWCwgYm91bmRzLm1pblkgKSwgbmV3IFZlY3RvcjIoIDAsIDEgKSApO1xuICAgIGNvbnN0IG1heEhvcml6b250YWxSYXkgPSBuZXcgUmF5MiggbmV3IFZlY3RvcjIoIGJvdW5kcy5tYXhYLCBib3VuZHMubWF4WSApLCBuZXcgVmVjdG9yMiggLTEsIDAgKSApO1xuICAgIGNvbnN0IG1heFZlcnRpY2FsUmF5ID0gbmV3IFJheTIoIG5ldyBWZWN0b3IyKCBib3VuZHMubWF4WCwgYm91bmRzLm1heFkgKSwgbmV3IFZlY3RvcjIoIDAsIC0xICkgKTtcblxuICAgIGxldCBoaXRQb2ludDtcbiAgICBsZXQgaTtcbiAgICAvLyBUT0RPOiBjb3VsZCBvcHRpbWl6ZSB0byBpbnRlcnNlY3QgZGlmZmVyZW50bHkgc28gd2UgYmFpbCBzb29uZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgY29uc3QgaG9yaXpvbnRhbFJheUludGVyc2VjdGlvbnMgPSB0aGlzLmludGVyc2VjdGlvbiggbWluSG9yaXpvbnRhbFJheSApLmNvbmNhdCggdGhpcy5pbnRlcnNlY3Rpb24oIG1heEhvcml6b250YWxSYXkgKSApO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgaG9yaXpvbnRhbFJheUludGVyc2VjdGlvbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBoaXRQb2ludCA9IGhvcml6b250YWxSYXlJbnRlcnNlY3Rpb25zWyBpIF0ucG9pbnQ7XG4gICAgICBpZiAoIGhpdFBvaW50LnggPj0gYm91bmRzLm1pblggJiYgaGl0UG9pbnQueCA8PSBib3VuZHMubWF4WCApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmVydGljYWxSYXlJbnRlcnNlY3Rpb25zID0gdGhpcy5pbnRlcnNlY3Rpb24oIG1pblZlcnRpY2FsUmF5ICkuY29uY2F0KCB0aGlzLmludGVyc2VjdGlvbiggbWF4VmVydGljYWxSYXkgKSApO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgdmVydGljYWxSYXlJbnRlcnNlY3Rpb25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgaGl0UG9pbnQgPSB2ZXJ0aWNhbFJheUludGVyc2VjdGlvbnNbIGkgXS5wb2ludDtcbiAgICAgIGlmICggaGl0UG9pbnQueSA+PSBib3VuZHMubWluWSAmJiBoaXRQb2ludC55IDw9IGJvdW5kcy5tYXhZICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBub3QgY29udGFpbmVkLCBhbmQgbm8gaW50ZXJzZWN0aW9ucyB3aXRoIHRoZSBzaWRlcyBvZiB0aGUgYm91bmRpbmcgYm94XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgU2hhcGUgdGhhdCBpcyBhbiBvdXRsaW5lIG9mIHRoZSBzdHJva2VkIHBhdGggb2YgdGhpcyBjdXJyZW50IFNoYXBlLiBjdXJyZW50bHkgbm90IGludGVuZGVkIHRvIGJlXG4gICAqIG5lc3RlZCAoZG9lc24ndCBkbyBpbnRlcnNlY3Rpb24gY29tcHV0YXRpb25zIHlldClcbiAgICpcbiAgICogVE9ETzogcmVuYW1lIHN0cm9rZWQoIGxpbmVTdHlsZXMgKT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAqL1xuICBwdWJsaWMgZ2V0U3Ryb2tlZFNoYXBlKCBsaW5lU3R5bGVzOiBMaW5lU3R5bGVzICk6IFNoYXBlIHtcbiAgICBsZXQgc3VicGF0aHM6IFN1YnBhdGhbXSA9IFtdO1xuICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgbGV0IHN1YkxlbiA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN1YkxlbjsgaSsrICkge1xuICAgICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuc3VicGF0aHNbIGkgXTtcbiAgICAgIGNvbnN0IHN0cm9rZWRTdWJwYXRoID0gc3VicGF0aC5zdHJva2VkKCBsaW5lU3R5bGVzICk7XG4gICAgICBzdWJwYXRocyA9IHN1YnBhdGhzLmNvbmNhdCggc3Ryb2tlZFN1YnBhdGggKTtcbiAgICB9XG4gICAgc3ViTGVuID0gc3VicGF0aHMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHN1YkxlbjsgaSsrICkge1xuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHN1YnBhdGhzWyBpIF0uYm91bmRzICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2hhcGUoIHN1YnBhdGhzLCBib3VuZHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc2hhcGUgb2Zmc2V0IGJ5IGEgY2VydGFpbiBhbW91bnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0T2Zmc2V0U2hhcGUoIGRpc3RhbmNlOiBudW1iZXIgKTogU2hhcGUge1xuICAgIC8vIFRPRE86IGFic3RyYWN0IGF3YXkgdGhpcyB0eXBlIG9mIGJlaGF2aW9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGNvbnN0IHN1YnBhdGhzID0gW107XG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICBsZXQgc3ViTGVuID0gdGhpcy5zdWJwYXRocy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3ViTGVuOyBpKysgKSB7XG4gICAgICBzdWJwYXRocy5wdXNoKCB0aGlzLnN1YnBhdGhzWyBpIF0ub2Zmc2V0KCBkaXN0YW5jZSApICk7XG4gICAgfVxuICAgIHN1YkxlbiA9IHN1YnBhdGhzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdWJMZW47IGkrKyApIHtcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBzdWJwYXRoc1sgaSBdLmJvdW5kcyApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNoYXBlKCBzdWJwYXRocywgYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBzdWJwYXRoIHdpdGggdGhlIGRhc2ggXCJob2xlc1wiIHJlbW92ZWQgKGhhcyBtYW55IHN1YnBhdGhzIHVzdWFsbHkpLlxuICAgKi9cbiAgcHVibGljIGdldERhc2hlZFNoYXBlKCBsaW5lRGFzaDogbnVtYmVyW10sIGxpbmVEYXNoT2Zmc2V0OiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IEdldERhc2hlZFNoYXBlT3B0aW9ucyApOiBTaGFwZSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHZXREYXNoZWRTaGFwZU9wdGlvbnM+KCkoIHtcbiAgICAgIGRpc3RhbmNlRXBzaWxvbjogMWUtMTAsXG4gICAgICBjdXJ2ZUVwc2lsb246IDFlLThcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHJldHVybiBuZXcgU2hhcGUoIF8uZmxhdHRlbiggdGhpcy5zdWJwYXRocy5tYXAoIHN1YnBhdGggPT4gc3VicGF0aC5kYXNoZWQoIGxpbmVEYXNoLCBsaW5lRGFzaE9mZnNldCwgb3B0aW9ucy5kaXN0YW5jZUVwc2lsb24sIG9wdGlvbnMuY3VydmVFcHNpbG9uICkgKSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIG9mIHRoaXMgc2hhcGUuIEl0IGlzIHRoZSBib3VuZGluZy1ib3ggdW5pb24gb2YgdGhlIGJvdW5kcyBvZiBlYWNoIHN1YnBhdGggY29udGFpbmVkLlxuICAgKi9cbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBpZiAoIHRoaXMuX2JvdW5kcyA9PT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgICBfLmVhY2goIHRoaXMuc3VicGF0aHMsIHN1YnBhdGggPT4ge1xuICAgICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggc3VicGF0aC5nZXRCb3VuZHMoKSApO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5fYm91bmRzID0gYm91bmRzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7IHJldHVybiB0aGlzLmdldEJvdW5kcygpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBmb3IgYSBzdHJva2VkIHZlcnNpb24gb2YgdGhpcyBzaGFwZS4gVGhlIGlucHV0IGxpbmVTdHlsZXMgYXJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBzaXplIGFuZFxuICAgKiBzdHlsZSBvZiB0aGUgc3Ryb2tlLCBhbmQgdGhlbiB0aGUgYm91bmRzIG9mIHRoZSBzdHJva2VkIHNoYXBlIGFyZSByZXR1cm5lZC5cbiAgICovXG4gIHB1YmxpYyBnZXRTdHJva2VkQm91bmRzKCBsaW5lU3R5bGVzOiBMaW5lU3R5bGVzICk6IEJvdW5kczIge1xuXG4gICAgLy8gQ2hlY2sgaWYgYWxsIG9mIG91ciBzZWdtZW50cyBlbmQgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgQU5EIG91ciBkcmF3YWJsZSBzdWJwYXRocyBhcmUgYWxsIGNsb3NlZC4gSWYgc28sXG4gICAgLy8gd2UgY2FuIGFwcGx5IGEgYm91bmRzIGRpbGF0aW9uLlxuICAgIGxldCBhcmVTdHJva2VkQm91bmRzRGlsYXRlZCA9IHRydWU7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJwYXRocy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHN1YnBhdGggPSB0aGlzLnN1YnBhdGhzWyBpIF07XG5cbiAgICAgIC8vIElmIGEgc3VicGF0aCB3aXRoIGFueSBzZWdtZW50cyBpcyBOT1QgY2xvc2VkLCBsaW5lLWNhcHMgd2lsbCBhcHBseS4gV2UgY2FuJ3QgbWFrZSB0aGUgc2ltcGxpZmljYXRpb24gaW4gdGhpc1xuICAgICAgLy8gY2FzZS5cbiAgICAgIGlmICggc3VicGF0aC5pc0RyYXdhYmxlKCkgJiYgIXN1YnBhdGguaXNDbG9zZWQoKSApIHtcbiAgICAgICAgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzdWJwYXRoLnNlZ21lbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjb25zdCBzZWdtZW50ID0gc3VicGF0aC5zZWdtZW50c1sgaiBdO1xuICAgICAgICBpZiAoICFzZWdtZW50LmFyZVN0cm9rZWRCb3VuZHNEaWxhdGVkKCkgKSB7XG4gICAgICAgICAgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQgKSB7XG4gICAgICByZXR1cm4gdGhpcy5ib3VuZHMuZGlsYXRlZCggbGluZVN0eWxlcy5saW5lV2lkdGggLyAyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5ib3VuZHMuY29weSgpO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJwYXRocy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3Qgc3VicGF0aHMgPSB0aGlzLnN1YnBhdGhzWyBpIF0uc3Ryb2tlZCggbGluZVN0eWxlcyApO1xuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzdWJwYXRocy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggc3VicGF0aHNbIGogXS5ib3VuZHMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNpbXBsaWZpZWQgZm9ybSBvZiB0aGlzIHNoYXBlLlxuICAgKlxuICAgKiBSdW5zIGl0IHRocm91Z2ggdGhlIG5vcm1hbCBDQUcgcHJvY2Vzcywgd2hpY2ggc2hvdWxkIGNvbWJpbmUgYXJlYXMgd2hlcmUgcG9zc2libGUsIGhhbmRsZXMgc2VsZi1pbnRlcnNlY3Rpb24sXG4gICAqIGV0Yy5cbiAgICpcbiAgICogTk9URTogQ3VycmVudGx5ICgyMDE3LTEwLTA0KSBhZGphY2VudCBzZWdtZW50cyBtYXkgZ2V0IHNpbXBsaWZpZWQgb25seSBpZiB0aGV5IGFyZSBsaW5lcy4gTm90IHlldCBjb21wbGV0ZS5cbiAgICovXG4gIHB1YmxpYyBnZXRTaW1wbGlmaWVkQXJlYVNoYXBlKCk6IFNoYXBlIHtcbiAgICByZXR1cm4gR3JhcGguc2ltcGxpZnlOb25aZXJvKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4OiBNYXRyaXgzLCBsaW5lU3R5bGVzPzogTGluZVN0eWxlcyApOiBCb3VuZHMyIHtcbiAgICBjb25zdCBib3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xuXG4gICAgY29uc3QgbnVtU3VicGF0aHMgPSB0aGlzLnN1YnBhdGhzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdWJwYXRoczsgaSsrICkge1xuICAgICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuc3VicGF0aHNbIGkgXTtcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBzdWJwYXRoLmdldEJvdW5kc1dpdGhUcmFuc2Zvcm0oIG1hdHJpeCApICk7XG4gICAgfVxuXG4gICAgaWYgKCBsaW5lU3R5bGVzICkge1xuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuZ2V0U3Ryb2tlZFNoYXBlKCBsaW5lU3R5bGVzICkuZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4ICkgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcHByb3hpbWF0ZSB2YWx1ZSBvZiB0aGUgYXJlYSBpbnNpZGUgb2YgdGhpcyBTaGFwZSAod2hlcmUgY29udGFpbnNQb2ludCBpcyB0cnVlKSB1c2luZyBNb250ZS1DYXJsby5cbiAgICpcbiAgICogTk9URTogR2VuZXJhbGx5LCB1c2UgZ2V0QXJlYSgpLiBUaGlzIGNhbiBiZSB1c2VkIGZvciB2ZXJpZmljYXRpb24sIGJ1dCB0YWtlcyBhIGxhcmdlIG51bWJlciBvZiBzYW1wbGVzLlxuICAgKlxuICAgKiBAcGFyYW0gbnVtU2FtcGxlcyAtIEhvdyBtYW55IHRpbWVzIHRvIHJhbmRvbWx5IGNoZWNrIGZvciBpbmNsdXNpb24gb2YgcG9pbnRzLlxuICAgKi9cbiAgcHVibGljIGdldEFwcHJveGltYXRlQXJlYSggbnVtU2FtcGxlczogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgeCA9IHRoaXMuYm91bmRzLm1pblg7XG4gICAgY29uc3QgeSA9IHRoaXMuYm91bmRzLm1pblk7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmJvdW5kcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmJvdW5kcy5oZWlnaHQ7XG5cbiAgICBjb25zdCByZWN0YW5nbGVBcmVhID0gd2lkdGggKiBoZWlnaHQ7XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBjb25zdCBwb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU2FtcGxlczsgaSsrICkge1xuICAgICAgcG9pbnQueCA9IHggKyByYW5kb21Tb3VyY2UoKSAqIHdpZHRoO1xuICAgICAgcG9pbnQueSA9IHkgKyByYW5kb21Tb3VyY2UoKSAqIGhlaWdodDtcbiAgICAgIGlmICggdGhpcy5jb250YWluc1BvaW50KCBwb2ludCApICkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjdGFuZ2xlQXJlYSAqIGNvdW50IC8gbnVtU2FtcGxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGFyZWEgaW5zaWRlIHRoZSBTaGFwZSAod2hlcmUgY29udGFpbnNQb2ludCBpcyB0cnVlKSwgYXNzdW1pbmcgdGhlcmUgaXMgbm8gc2VsZi1pbnRlcnNlY3Rpb24gb3JcbiAgICogb3ZlcmxhcCwgYW5kIHRoZSBzYW1lIG9yaWVudGF0aW9uICh3aW5kaW5nIG9yZGVyKSBpcyB1c2VkLiBTaG91bGQgYWxzbyBzdXBwb3J0IGhvbGVzICh3aXRoIG9wcG9zaXRlIG9yaWVudGF0aW9uKSxcbiAgICogYXNzdW1pbmcgdGhleSBkb24ndCBpbnRlcnNlY3QgdGhlIGNvbnRhaW5pbmcgc3VicGF0aC5cbiAgICovXG4gIHB1YmxpYyBnZXROb25vdmVybGFwcGluZ0FyZWEoKTogbnVtYmVyIHtcbiAgICAvLyBPbmx5IGFic29sdXRlLXZhbHVlIHRoZSBmaW5hbCB2YWx1ZS5cbiAgICByZXR1cm4gTWF0aC5hYnMoIF8uc3VtKCB0aGlzLnN1YnBhdGhzLm1hcCggc3VicGF0aCA9PiBfLnN1bSggc3VicGF0aC5nZXRGaWxsU2VnbWVudHMoKS5tYXAoIHNlZ21lbnQgPT4gc2VnbWVudC5nZXRTaWduZWRBcmVhRnJhZ21lbnQoKSApICkgKSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJlYSBpbnNpZGUgdGhlIHNoYXBlLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIHJlcXVpcmVzIHJ1bm5pbmcgaXQgdGhyb3VnaCBhIGxvdCBvZiBjb21wdXRhdGlvbiB0byBkZXRlcm1pbmUgYSBub24tb3ZlcmxhcHBpbmcgbm9uLXNlbGYtaW50ZXJzZWN0aW5nXG4gICAqICAgICAgIGZvcm0gZmlyc3QuIElmIHRoZSBTaGFwZSBpcyBcInNpbXBsZVwiIGVub3VnaCwgZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhIHdvdWxkIGJlIHByZWZlcnJlZC5cbiAgICovXG4gIHB1YmxpYyBnZXRBcmVhKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2ltcGxpZmllZEFyZWFTaGFwZSgpLmdldE5vbm92ZXJsYXBwaW5nQXJlYSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgYXBwcm94aW1hdGUgbG9jYXRpb24gb2YgdGhlIGNlbnRyb2lkIG9mIHRoZSBTaGFwZSAodGhlIGF2ZXJhZ2Ugb2YgYWxsIHBvaW50cyB3aGVyZSBjb250YWluc1BvaW50IGlzIHRydWUpXG4gICAqIHVzaW5nIE1vbnRlLUNhcmxvIG1ldGhvZHMuXG4gICAqXG4gICAqIEBwYXJhbSBudW1TYW1wbGVzIC0gSG93IG1hbnkgdGltZXMgdG8gcmFuZG9tbHkgY2hlY2sgZm9yIGluY2x1c2lvbiBvZiBwb2ludHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXBwcm94aW1hdGVDZW50cm9pZCggbnVtU2FtcGxlczogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIGNvbnN0IHggPSB0aGlzLmJvdW5kcy5taW5YO1xuICAgIGNvbnN0IHkgPSB0aGlzLmJvdW5kcy5taW5ZO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5ib3VuZHMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ib3VuZHMuaGVpZ2h0O1xuXG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBjb25zdCBzdW0gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuICAgIGNvbnN0IHBvaW50ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TYW1wbGVzOyBpKysgKSB7XG4gICAgICBwb2ludC54ID0geCArIHJhbmRvbVNvdXJjZSgpICogd2lkdGg7XG4gICAgICBwb2ludC55ID0geSArIHJhbmRvbVNvdXJjZSgpICogaGVpZ2h0O1xuICAgICAgaWYgKCB0aGlzLmNvbnRhaW5zUG9pbnQoIHBvaW50ICkgKSB7XG4gICAgICAgIHN1bS5hZGQoIHBvaW50ICk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdW0uZGl2aWRlZFNjYWxhciggY291bnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHBvdGVudGlhbCBjbG9zZXN0IHBvaW50IHJlc3VsdHMgb24gdGhlIFNoYXBlIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBnZXRDbG9zZXN0UG9pbnRzKCBwb2ludDogVmVjdG9yMiApOiBDbG9zZXN0VG9Qb2ludFJlc3VsdFtdIHtcbiAgICByZXR1cm4gU2VnbWVudC5maWx0ZXJDbG9zZXN0VG9Qb2ludFJlc3VsdCggXy5mbGF0dGVuKCB0aGlzLnN1YnBhdGhzLm1hcCggc3VicGF0aCA9PiBzdWJwYXRoLmdldENsb3Nlc3RQb2ludHMoIHBvaW50ICkgKSApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNpbmdsZSBwb2ludCBPTiB0aGUgU2hhcGUgYm91bmRhcnkgdGhhdCBpcyBjbG9zZXN0IHRvIHRoZSBnaXZlbiBwb2ludCAocGlja3MgYW4gYXJiaXRyYXJ5IG9uZSBpZiB0aGVyZVxuICAgKiBhcmUgbXVsdGlwbGUpLlxuICAgKi9cbiAgcHVibGljIGdldENsb3Nlc3RQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xvc2VzdFBvaW50cyggcG9pbnQgKVsgMCBdLmNsb3Nlc3RQb2ludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG91bGQgYmUgY2FsbGVkIGFmdGVyIG11dGF0aW5nIHRoZSB4L3kgb2YgVmVjdG9yMiBwb2ludHMgdGhhdCB3ZXJlIHBhc3NlZCBpbiB0byB2YXJpb3VzIFNoYXBlIGNhbGxzLCBzbyB0aGF0XG4gICAqIGRlcml2ZWQgaW5mb3JtYXRpb24gY29tcHV0ZWQgKGJvdW5kcywgZXRjLikgd2lsbCBiZSBjb3JyZWN0LCBhbmQgYW55IGNsaWVudHMgKGUuZy4gU2NlbmVyeSBQYXRocykgd2lsbCBiZVxuICAgKiBub3RpZmllZCBvZiB0aGUgdXBkYXRlcy5cbiAgICovXG4gIHB1YmxpYyBpbnZhbGlkYXRlUG9pbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuX2ludmFsaWRhdGluZ1BvaW50cyA9IHRydWU7XG5cbiAgICBjb25zdCBudW1TdWJwYXRocyA9IHRoaXMuc3VicGF0aHMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN1YnBhdGhzOyBpKysgKSB7XG4gICAgICB0aGlzLnN1YnBhdGhzWyBpIF0uaW52YWxpZGF0ZVBvaW50cygpO1xuICAgIH1cblxuICAgIHRoaXMuX2ludmFsaWRhdGluZ1BvaW50cyA9IGZhbHNlO1xuICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgLy8gVE9ETzogY29uc2lkZXIgYSBtb3JlIHZlcmJvc2UgYnV0IHNhZmVyIHdheT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgcmV0dXJuIGBuZXcgcGhldC5raXRlLlNoYXBlKCAnJHt0aGlzLmdldFNWR1BhdGgoKS50cmltKCl9JyApYDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBJbnRlcm5hbCBzdWJwYXRoIGNvbXB1dGF0aW9uc1xuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIHByaXZhdGUgaW52YWxpZGF0ZSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5faW1tdXRhYmxlLCAnQXR0ZW1wdCB0byBtb2RpZnkgYW4gaW1tdXRhYmxlIFNoYXBlJyApO1xuXG4gICAgaWYgKCAhdGhpcy5faW52YWxpZGF0aW5nUG9pbnRzICkge1xuICAgICAgdGhpcy5fYm91bmRzID0gbnVsbDtcblxuICAgICAgdGhpcy5ub3RpZnlJbnZhbGlkYXRpb25MaXN0ZW5lcnMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBwYXJ0IG9mIHRoZSBTaGFwZSBoYXMgY2hhbmdlZCwgb3IgaWYgbWV0YWRhdGEgb24gdGhlIFNoYXBlIGhhcyBjaGFuZ2VkIChlLmcuIGl0IGJlY2FtZSBpbW11dGFibGUpLlxuICAgKi9cbiAgcHJpdmF0ZSBub3RpZnlJbnZhbGlkYXRpb25MaXN0ZW5lcnMoKTogdm9pZCB7XG4gICAgdGhpcy5pbnZhbGlkYXRlZEVtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRTZWdtZW50QW5kQm91bmRzKCBzZWdtZW50OiBTZWdtZW50ICk6IHZvaWQge1xuICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRTZWdtZW50KCBzZWdtZW50ICk7XG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgc3VyZSB0aGF0IHdlIGhhdmUgYSBzdWJwYXRoIChhbmQgaWYgdGhlcmUgaXMgbm8gc3VicGF0aCwgc3RhcnQgaXQgYXQgdGhpcyBwb2ludClcbiAgICovXG4gIHByaXZhdGUgZW5zdXJlKCBwb2ludDogVmVjdG9yMiApOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLmhhc1N1YnBhdGhzKCkgKSB7XG4gICAgICB0aGlzLmFkZFN1YnBhdGgoIG5ldyBTdWJwYXRoKCkgKTtcbiAgICAgIHRoaXMuZ2V0TGFzdFN1YnBhdGgoKS5hZGRQb2ludCggcG9pbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHN1YnBhdGhcbiAgICovXG4gIHByaXZhdGUgYWRkU3VicGF0aCggc3VicGF0aDogU3VicGF0aCApOiB0aGlzIHtcbiAgICB0aGlzLnN1YnBhdGhzLnB1c2goIHN1YnBhdGggKTtcblxuICAgIC8vIGxpc3RlbiB0byB3aGVuIHRoZSBzdWJwYXRoIGlzIGludmFsaWRhdGVkICh3aWxsIGNhdXNlIGJvdW5kcyByZWNvbXB1dGF0aW9uIGhlcmUpXG4gICAgc3VicGF0aC5pbnZhbGlkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2ludmFsaWRhdGVMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlKCk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlIGFyZSBhbnkgc3VicGF0aHNcbiAgICovXG4gIHByaXZhdGUgaGFzU3VicGF0aHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3VicGF0aHMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYXN0IHN1YnBhdGhcbiAgICovXG4gIHByaXZhdGUgZ2V0TGFzdFN1YnBhdGgoKTogU3VicGF0aCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNTdWJwYXRocygpLCAnV2Ugc2hvdWxkIGhhdmUgYSBzdWJwYXRoIGlmIHRoaXMgaXMgY2FsbGVkJyApO1xuXG4gICAgcmV0dXJuIF8ubGFzdCggdGhpcy5zdWJwYXRocyApITtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYXN0IHBvaW50IGluIHRoZSBsYXN0IHN1YnBhdGgsIG9yIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgKi9cbiAgcHVibGljIGdldExhc3RQb2ludCgpOiBWZWN0b3IyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc1N1YnBhdGhzKCksICdXZSBzaG91bGQgaGF2ZSBhIHN1YnBhdGggaWYgdGhpcyBpcyBjYWxsZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5nZXRMYXN0U3VicGF0aCgpLmdldExhc3RQb2ludCgpLCAnV2Ugc2hvdWxkIGhhdmUgYSBsYXN0IHBvaW50JyApO1xuICAgIHJldHVybiB0aGlzLmdldExhc3RTdWJwYXRoKCkuZ2V0TGFzdFBvaW50KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbGFzdCBkcmF3YWJsZSBzZWdtZW50IGluIHRoZSBsYXN0IHN1YnBhdGgsIG9yIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRMYXN0U2VnbWVudCgpOiBTZWdtZW50IHwgbnVsbCB7XG4gICAgaWYgKCAhdGhpcy5oYXNTdWJwYXRocygpICkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgY29uc3Qgc3VicGF0aCA9IHRoaXMuZ2V0TGFzdFN1YnBhdGgoKTtcbiAgICBpZiAoICFzdWJwYXRoLmlzRHJhd2FibGUoKSApIHsgcmV0dXJuIG51bGw7IH1cblxuICAgIHJldHVybiBzdWJwYXRoLmdldExhc3RTZWdtZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29udHJvbCBwb2ludCB0byBiZSB1c2VkIHRvIGNyZWF0ZSBhIHNtb290aCBxdWFkcmF0aWMgc2VnbWVudHNcbiAgICovXG4gIHByaXZhdGUgZ2V0U21vb3RoUXVhZHJhdGljQ29udHJvbFBvaW50KCk6IFZlY3RvcjIge1xuICAgIGNvbnN0IGxhc3RQb2ludCA9IHRoaXMuZ2V0TGFzdFBvaW50KCk7XG5cbiAgICBpZiAoIHRoaXMubGFzdFF1YWRyYXRpY0NvbnRyb2xQb2ludCApIHtcbiAgICAgIHJldHVybiBsYXN0UG9pbnQucGx1cyggbGFzdFBvaW50Lm1pbnVzKCB0aGlzLmxhc3RRdWFkcmF0aWNDb250cm9sUG9pbnQgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBsYXN0UG9pbnQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbnRyb2wgcG9pbnQgdG8gYmUgdXNlZCB0byBjcmVhdGUgYSBzbW9vdGggY3ViaWMgc2VnbWVudFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRTbW9vdGhDdWJpY0NvbnRyb2xQb2ludCgpOiBWZWN0b3IyIHtcbiAgICBjb25zdCBsYXN0UG9pbnQgPSB0aGlzLmdldExhc3RQb2ludCgpO1xuXG4gICAgaWYgKCB0aGlzLmxhc3RDdWJpY0NvbnRyb2xQb2ludCApIHtcbiAgICAgIHJldHVybiBsYXN0UG9pbnQucGx1cyggbGFzdFBvaW50Lm1pbnVzKCB0aGlzLmxhc3RDdWJpY0NvbnRyb2xQb2ludCApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGxhc3RQb2ludDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGFzdCBwb2ludCBpbiB0aGUgbGFzdCBzdWJwYXRoLCBvciB0aGUgVmVjdG9yIFpFUk8gaWYgaXQgZG9lc24ndCBleGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBnZXRSZWxhdGl2ZVBvaW50KCk6IFZlY3RvcjIge1xuICAgIGxldCByZXN1bHQgPSBWZWN0b3IyLlpFUk87XG5cbiAgICBpZiAoIHRoaXMuaGFzU3VicGF0aHMoKSApIHtcbiAgICAgIGNvbnN0IHN1YnBhdGggPSB0aGlzLmdldExhc3RTdWJwYXRoKCk7XG4gICAgICBpZiAoIHN1YnBhdGgucG9pbnRzLmxlbmd0aCApIHtcbiAgICAgICAgcmVzdWx0ID0gc3VicGF0aC5nZXRMYXN0UG9pbnQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgc2hhcGUgdGhhdCBjb250YWlucyBhIHVuaW9uIG9mIHRoZSB0d28gc2hhcGVzIChhIHBvaW50IGluIGVpdGhlciBzaGFwZSBpcyBpbiB0aGUgcmVzdWx0aW5nIHNoYXBlKS5cbiAgICovXG4gIHB1YmxpYyBzaGFwZVVuaW9uKCBzaGFwZTogU2hhcGUgKTogU2hhcGUge1xuICAgIHJldHVybiBHcmFwaC5iaW5hcnlSZXN1bHQoIHRoaXMsIHNoYXBlLCBHcmFwaC5CSU5BUllfTk9OWkVST19VTklPTiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgc2hhcGUgdGhhdCBjb250YWlucyB0aGUgaW50ZXJzZWN0aW9uIG9mIHRoZSB0d28gc2hhcGVzIChhIHBvaW50IGluIGJvdGggc2hhcGVzIGlzIGluIHRoZVxuICAgKiByZXN1bHRpbmcgc2hhcGUpLlxuICAgKi9cbiAgcHVibGljIHNoYXBlSW50ZXJzZWN0aW9uKCBzaGFwZTogU2hhcGUgKTogU2hhcGUge1xuICAgIHJldHVybiBHcmFwaC5iaW5hcnlSZXN1bHQoIHRoaXMsIHNoYXBlLCBHcmFwaC5CSU5BUllfTk9OWkVST19JTlRFUlNFQ1RJT04gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHNoYXBlIHRoYXQgY29udGFpbnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIHR3byBzaGFwZXMgKGEgcG9pbnQgaW4gdGhlIGZpcnN0IHNoYXBlIGFuZCBOT1QgaW4gdGhlXG4gICAqIHNlY29uZCBzaGFwZSBpcyBpbiB0aGUgcmVzdWx0aW5nIHNoYXBlKS5cbiAgICovXG4gIHB1YmxpYyBzaGFwZURpZmZlcmVuY2UoIHNoYXBlOiBTaGFwZSApOiBTaGFwZSB7XG4gICAgcmV0dXJuIEdyYXBoLmJpbmFyeVJlc3VsdCggdGhpcywgc2hhcGUsIEdyYXBoLkJJTkFSWV9OT05aRVJPX0RJRkZFUkVOQ0UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHNoYXBlIHRoYXQgY29udGFpbnMgdGhlIHhvciBvZiB0aGUgdHdvIHNoYXBlcyAoYSBwb2ludCBpbiBvbmx5IG9uZSBzaGFwZSBpcyBpbiB0aGUgcmVzdWx0aW5nXG4gICAqIHNoYXBlKS5cbiAgICovXG4gIHB1YmxpYyBzaGFwZVhvciggc2hhcGU6IFNoYXBlICk6IFNoYXBlIHtcbiAgICByZXR1cm4gR3JhcGguYmluYXJ5UmVzdWx0KCB0aGlzLCBzaGFwZSwgR3JhcGguQklOQVJZX05PTlpFUk9fWE9SICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBzaGFwZSB0aGF0IG9ubHkgY29udGFpbnMgcG9ydGlvbnMgb2Ygc2VnbWVudHMgdGhhdCBhcmUgd2l0aGluIHRoZSBwYXNzZWQtaW4gc2hhcGUncyBhcmVhLlxuICAgKlxuICAgKiAvLyBUT0RPOiBjb252ZXJ0IEdyYXBoIHRvIFRTIGFuZCBnZXQgdGhlIHR5cGVzIGZyb20gdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAqL1xuICBwdWJsaWMgc2hhcGVDbGlwKCBzaGFwZTogU2hhcGUsIG9wdGlvbnM/OiB7IGluY2x1ZGVFeHRlcmlvcj86IGJvb2xlYW47IGluY2x1ZGVCb3VuZGFyeTogYm9vbGVhbjsgaW5jbHVkZUludGVyaW9yOiBib29sZWFuIH0gKTogU2hhcGUge1xuICAgIHJldHVybiBHcmFwaC5jbGlwU2hhcGUoIHNoYXBlLCB0aGlzLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgKHNvbWV0aW1lcyBhcHByb3hpbWF0ZSkgYXJjIGxlbmd0aCBvZiBhbGwgdGhlIHNoYXBlJ3Mgc3VicGF0aHMgY29tYmluZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXJjTGVuZ3RoKCBkaXN0YW5jZUVwc2lsb24/OiBudW1iZXIsIGN1cnZlRXBzaWxvbj86IG51bWJlciwgbWF4TGV2ZWxzPzogbnVtYmVyICk6IG51bWJlciB7XG4gICAgbGV0IGxlbmd0aCA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdWJwYXRocy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxlbmd0aCArPSB0aGlzLnN1YnBhdGhzWyBpIF0uZ2V0QXJjTGVuZ3RoKCBkaXN0YW5jZUVwc2lsb24sIGN1cnZlRXBzaWxvbiwgbWF4TGV2ZWxzICk7XG4gICAgfVxuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICovXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZFNoYXBlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ1NoYXBlJyxcbiAgICAgIHN1YnBhdGhzOiB0aGlzLnN1YnBhdGhzLm1hcCggc3VicGF0aCA9PiBzdWJwYXRoLnNlcmlhbGl6ZSgpIClcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkU2hhcGUgKTogU2hhcGUge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9iai50eXBlID09PSAnU2hhcGUnICk7XG5cbiAgICByZXR1cm4gbmV3IFNoYXBlKCBvYmouc3VicGF0aHMubWFwKCBTdWJwYXRoLmRlc2VyaWFsaXplICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcmVjdGFuZ2xlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlY3RhbmdsZSggeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IFNoYXBlIHtcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkucmVjdCggeCwgeSwgd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWN0ID0gU2hhcGUucmVjdGFuZ2xlO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcm91bmQgcmVjdGFuZ2xlIHtTaGFwZX0sIHdpdGgge251bWJlcn0gYXJndW1lbnRzLiBVc2VzIGNpcmN1bGFyIG9yIGVsbGlwdGljYWwgYXJjcyBpZiBnaXZlbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcm91bmRSZWN0KCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFyY3c6IG51bWJlciwgYXJjaDogbnVtYmVyICk6IFNoYXBlIHtcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkucm91bmRSZWN0KCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBhcmN3LCBhcmNoICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJvdW5kUmVjdGFuZ2xlID0gU2hhcGUucm91bmRSZWN0O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcm91bmRlZCByZWN0YW5nbGUsIHdoZXJlIGVhY2ggY29ybmVyIGNhbiBoYXZlIGEgZGlmZmVyZW50IHJhZGl1cy4gVGhlIHJhZGlpIGRlZmF1bHQgdG8gMCwgYW5kIG1heSBiZSBzZXRcbiAgICogdXNpbmcgdG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQgYW5kIGJvdHRvbVJpZ2h0IGluIHRoZSBvcHRpb25zLiBJZiB0aGUgc3BlY2lmaWVkIHJhZGlpIGFyZSBsYXJnZXIgdGhhbiB0aGUgZGltZW5zaW9uXG4gICAqIG9uIHRoYXQgc2lkZSwgdGhleSByYWRpaSBhcmUgcmVkdWNlZCBwcm9wb3J0aW9uYWxseSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91bmRlci1wcmVzc3VyZS9pc3N1ZXMvMTUxXG4gICAqXG4gICAqIEUuZy46XG4gICAqXG4gICAqIHZhciBjb3JuZXJSYWRpdXMgPSAyMDtcbiAgICogdmFyIHJlY3QgPSBTaGFwZS5yb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpKCAwLCAwLCAyMDAsIDEwMCwge1xuICAgKiAgIHRvcExlZnQ6IGNvcm5lclJhZGl1cyxcbiAgICogICB0b3BSaWdodDogY29ybmVyUmFkaXVzXG4gICAqIH0gKTtcbiAgICpcbiAgICogQHBhcmFtIHggLSBMZWZ0IGVkZ2UgcG9zaXRpb25cbiAgICogQHBhcmFtIHkgLSBUb3AgZWRnZSBwb3NpdGlvblxuICAgKiBAcGFyYW0gd2lkdGggLSBXaWR0aCBvZiByZWN0YW5nbGVcbiAgICogQHBhcmFtIGhlaWdodCAtIEhlaWdodCBvZiByZWN0YW5nbGVcbiAgICogQHBhcmFtIFtjb3JuZXJSYWRpaV0gLSBPcHRpb25hbCBvYmplY3Qgd2l0aCBwb3RlbnRpYWwgcmFkaWkgZm9yIGVhY2ggY29ybmVyLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByb3VuZGVkUmVjdGFuZ2xlV2l0aFJhZGlpKCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNvcm5lclJhZGlpPzogUGFydGlhbDxDb3JuZXJSYWRpaU9wdGlvbnM+ICk6IFNoYXBlIHtcblxuICAgIC8vIGRlZmF1bHRzIHRvIDAgKG5vdCB1c2luZyBtZXJnZSwgc2luY2Ugd2UgcmVmZXJlbmNlIGVhY2ggbXVsdGlwbGUgdGltZXMpXG4gICAgbGV0IHRvcExlZnRSYWRpdXMgPSBjb3JuZXJSYWRpaSAmJiBjb3JuZXJSYWRpaS50b3BMZWZ0IHx8IDA7XG4gICAgbGV0IHRvcFJpZ2h0UmFkaXVzID0gY29ybmVyUmFkaWkgJiYgY29ybmVyUmFkaWkudG9wUmlnaHQgfHwgMDtcbiAgICBsZXQgYm90dG9tTGVmdFJhZGl1cyA9IGNvcm5lclJhZGlpICYmIGNvcm5lclJhZGlpLmJvdHRvbUxlZnQgfHwgMDtcbiAgICBsZXQgYm90dG9tUmlnaHRSYWRpdXMgPSBjb3JuZXJSYWRpaSAmJiBjb3JuZXJSYWRpaS5ib3R0b21SaWdodCB8fCAwO1xuXG4gICAgLy8gdHlwZSBhbmQgY29uc3RyYWludCBhc3NlcnRpb25zXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgJ05vbi1maW5pdGUgeCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCAnTm9uLWZpbml0ZSB5JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID49IDAgJiYgaXNGaW5pdGUoIHdpZHRoICksICdOZWdhdGl2ZSBvciBub24tZmluaXRlIHdpZHRoJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGhlaWdodCA+PSAwICYmIGlzRmluaXRlKCBoZWlnaHQgKSwgJ05lZ2F0aXZlIG9yIG5vbi1maW5pdGUgaGVpZ2h0JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvcExlZnRSYWRpdXMgPj0gMCAmJiBpc0Zpbml0ZSggdG9wTGVmdFJhZGl1cyApLFxuICAgICAgJ0ludmFsaWQgdG9wTGVmdCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b3BSaWdodFJhZGl1cyA+PSAwICYmIGlzRmluaXRlKCB0b3BSaWdodFJhZGl1cyApLFxuICAgICAgJ0ludmFsaWQgdG9wUmlnaHQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm90dG9tTGVmdFJhZGl1cyA+PSAwICYmIGlzRmluaXRlKCBib3R0b21MZWZ0UmFkaXVzICksXG4gICAgICAnSW52YWxpZCBib3R0b21MZWZ0JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdHRvbVJpZ2h0UmFkaXVzID49IDAgJiYgaXNGaW5pdGUoIGJvdHRvbVJpZ2h0UmFkaXVzICksXG4gICAgICAnSW52YWxpZCBib3R0b21SaWdodCcgKTtcblxuICAgIC8vIFRoZSB3aWR0aCBhbmQgaGVpZ2h0IHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoZSBjb3JuZXIgcmFkaWkuIElmIHRoZSBzdW0gb2YgdGhlIGNvcm5lciByYWRpaSBleGNlZWRcbiAgICAvLyB0aGF0IGRpbWVuc2lvbiwgdGhlbiB0aGUgY29ybmVyIHJhZGlpIGFyZSByZWR1Y2VkIHByb3BvcnRpb25hdGVseVxuICAgIGNvbnN0IHRvcFN1bSA9IHRvcExlZnRSYWRpdXMgKyB0b3BSaWdodFJhZGl1cztcbiAgICBpZiAoIHRvcFN1bSA+IHdpZHRoICYmIHRvcFN1bSA+IDAgKSB7XG5cbiAgICAgIHRvcExlZnRSYWRpdXMgPSB0b3BMZWZ0UmFkaXVzIC8gdG9wU3VtICogd2lkdGg7XG4gICAgICB0b3BSaWdodFJhZGl1cyA9IHRvcFJpZ2h0UmFkaXVzIC8gdG9wU3VtICogd2lkdGg7XG4gICAgfVxuICAgIGNvbnN0IGJvdHRvbVN1bSA9IGJvdHRvbUxlZnRSYWRpdXMgKyBib3R0b21SaWdodFJhZGl1cztcbiAgICBpZiAoIGJvdHRvbVN1bSA+IHdpZHRoICYmIGJvdHRvbVN1bSA+IDAgKSB7XG5cbiAgICAgIGJvdHRvbUxlZnRSYWRpdXMgPSBib3R0b21MZWZ0UmFkaXVzIC8gYm90dG9tU3VtICogd2lkdGg7XG4gICAgICBib3R0b21SaWdodFJhZGl1cyA9IGJvdHRvbVJpZ2h0UmFkaXVzIC8gYm90dG9tU3VtICogd2lkdGg7XG4gICAgfVxuICAgIGNvbnN0IGxlZnRTdW0gPSB0b3BMZWZ0UmFkaXVzICsgYm90dG9tTGVmdFJhZGl1cztcbiAgICBpZiAoIGxlZnRTdW0gPiBoZWlnaHQgJiYgbGVmdFN1bSA+IDAgKSB7XG5cbiAgICAgIHRvcExlZnRSYWRpdXMgPSB0b3BMZWZ0UmFkaXVzIC8gbGVmdFN1bSAqIGhlaWdodDtcbiAgICAgIGJvdHRvbUxlZnRSYWRpdXMgPSBib3R0b21MZWZ0UmFkaXVzIC8gbGVmdFN1bSAqIGhlaWdodDtcbiAgICB9XG4gICAgY29uc3QgcmlnaHRTdW0gPSB0b3BSaWdodFJhZGl1cyArIGJvdHRvbVJpZ2h0UmFkaXVzO1xuICAgIGlmICggcmlnaHRTdW0gPiBoZWlnaHQgJiYgcmlnaHRTdW0gPiAwICkge1xuICAgICAgdG9wUmlnaHRSYWRpdXMgPSB0b3BSaWdodFJhZGl1cyAvIHJpZ2h0U3VtICogaGVpZ2h0O1xuICAgICAgYm90dG9tUmlnaHRSYWRpdXMgPSBib3R0b21SaWdodFJhZGl1cyAvIHJpZ2h0U3VtICogaGVpZ2h0O1xuICAgIH1cblxuICAgIC8vIHZlcmlmeSB0aGVyZSBpcyBubyBvdmVybGFwIGJldHdlZW4gY29ybmVyc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvcExlZnRSYWRpdXMgKyB0b3BSaWdodFJhZGl1cyA8PSB3aWR0aCwgJ0Nvcm5lciBvdmVybGFwIG9uIHRvcCBlZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdHRvbUxlZnRSYWRpdXMgKyBib3R0b21SaWdodFJhZGl1cyA8PSB3aWR0aCwgJ0Nvcm5lciBvdmVybGFwIG9uIGJvdHRvbSBlZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvcExlZnRSYWRpdXMgKyBib3R0b21MZWZ0UmFkaXVzIDw9IGhlaWdodCwgJ0Nvcm5lciBvdmVybGFwIG9uIGxlZnQgZWRnZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b3BSaWdodFJhZGl1cyArIGJvdHRvbVJpZ2h0UmFkaXVzIDw9IGhlaWdodCwgJ0Nvcm5lciBvdmVybGFwIG9uIHJpZ2h0IGVkZ2UnICk7XG5cbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgIGNvbnN0IHJpZ2h0ID0geCArIHdpZHRoO1xuICAgIGNvbnN0IGJvdHRvbSA9IHkgKyBoZWlnaHQ7XG5cbiAgICAvLyBUbyBkcmF3IHRoZSByb3VuZGVkIHJlY3RhbmdsZSwgd2UgdXNlIHRoZSBpbXBsaWNpdCBcImxpbmUgZnJvbSBsYXN0IHNlZ21lbnQgdG8gbmV4dCBzZWdtZW50XCIgYW5kIHRoZSBjbG9zZSgpIGZvclxuICAgIC8vIGFsbCB0aGUgc3RyYWlnaHQgbGluZSBlZGdlcyBiZXR3ZWVuIGFyY3MsIG9yIGxpbmVUbyB0aGUgY29ybmVyLlxuXG4gICAgaWYgKCBib3R0b21SaWdodFJhZGl1cyA+IDAgKSB7XG4gICAgICBzaGFwZS5hcmMoIHJpZ2h0IC0gYm90dG9tUmlnaHRSYWRpdXMsIGJvdHRvbSAtIGJvdHRvbVJpZ2h0UmFkaXVzLCBib3R0b21SaWdodFJhZGl1cywgMCwgTWF0aC5QSSAvIDIsIGZhbHNlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2hhcGUubW92ZVRvKCByaWdodCwgYm90dG9tICk7XG4gICAgfVxuXG4gICAgaWYgKCBib3R0b21MZWZ0UmFkaXVzID4gMCApIHtcbiAgICAgIHNoYXBlLmFyYyggeCArIGJvdHRvbUxlZnRSYWRpdXMsIGJvdHRvbSAtIGJvdHRvbUxlZnRSYWRpdXMsIGJvdHRvbUxlZnRSYWRpdXMsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNoYXBlLmxpbmVUbyggeCwgYm90dG9tICk7XG4gICAgfVxuXG4gICAgaWYgKCB0b3BMZWZ0UmFkaXVzID4gMCApIHtcbiAgICAgIHNoYXBlLmFyYyggeCArIHRvcExlZnRSYWRpdXMsIHkgKyB0b3BMZWZ0UmFkaXVzLCB0b3BMZWZ0UmFkaXVzLCBNYXRoLlBJLCAzICogTWF0aC5QSSAvIDIsIGZhbHNlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2hhcGUubGluZVRvKCB4LCB5ICk7XG4gICAgfVxuXG4gICAgaWYgKCB0b3BSaWdodFJhZGl1cyA+IDAgKSB7XG4gICAgICBzaGFwZS5hcmMoIHJpZ2h0IC0gdG9wUmlnaHRSYWRpdXMsIHkgKyB0b3BSaWdodFJhZGl1cywgdG9wUmlnaHRSYWRpdXMsIDMgKiBNYXRoLlBJIC8gMiwgMiAqIE1hdGguUEksIGZhbHNlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2hhcGUubGluZVRvKCByaWdodCwgeSApO1xuICAgIH1cblxuICAgIHNoYXBlLmNsb3NlKCk7XG5cbiAgICByZXR1cm4gc2hhcGU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFNoYXBlIGZyb20gYSBib3VuZHMsIG9mZnNldCAoZXhwYW5kZWQpIGJ5IGNlcnRhaW4gYW1vdW50cywgYW5kIHdpdGggY2VydGFpbiBjb3JuZXIgcmFkaWkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGJvdW5kc09mZnNldFdpdGhSYWRpaSggYm91bmRzOiBCb3VuZHMyLCBvZmZzZXRzOiBPZmZzZXRzT3B0aW9ucywgcmFkaWk/OiBDb3JuZXJSYWRpaU9wdGlvbnMgKTogU2hhcGUge1xuICAgIGNvbnN0IG9mZnNldEJvdW5kcyA9IGJvdW5kcy53aXRoT2Zmc2V0cyggb2Zmc2V0cy5sZWZ0LCBvZmZzZXRzLnRvcCwgb2Zmc2V0cy5yaWdodCwgb2Zmc2V0cy5ib3R0b20gKTtcbiAgICByZXR1cm4gU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSggb2Zmc2V0Qm91bmRzLm1pblgsIG9mZnNldEJvdW5kcy5taW5ZLCBvZmZzZXRCb3VuZHMud2lkdGgsIG9mZnNldEJvdW5kcy5oZWlnaHQsIHJhZGlpICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNsb3NlZCBwb2x5Z29uIGZyb20gYW4gYXJyYXkgb2YgdmVydGljZXMgYnkgY29ubmVjdGluZyB0aGVtIGJ5IGEgc2VyaWVzIG9mIGxpbmVzLlxuICAgKiBUaGUgbGluZXMgYXJlIGpvaW5pbmcgdGhlIGFkamFjZW50IHZlcnRpY2VzIGluIHRoZSBhcnJheS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seWdvbiggdmVydGljZXM6IFZlY3RvcjJbXSApOiBTaGFwZSB7XG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLnBvbHlnb24oIHZlcnRpY2VzICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHJlY3Rhbmd1bGFyIHNoYXBlIGZyb20gYm91bmRzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IFNoYXBlIHtcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkucmVjdCggYm91bmRzLm1pblgsIGJvdW5kcy5taW5ZLCBib3VuZHMubWF4WCAtIGJvdW5kcy5taW5YLCBib3VuZHMubWF4WSAtIGJvdW5kcy5taW5ZICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxpbmUgc2VnbWVudCwgdXNpbmcgZWl0aGVyICh4MSx5MSx4Mix5Mikgb3IgKHt4MSx5MX0se3gyLHkyfSkgYXJndW1lbnRzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxpbmVTZWdtZW50KCB4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyICk6IFNoYXBlO1xuICBwdWJsaWMgc3RhdGljIGxpbmVTZWdtZW50KCBwMTogVmVjdG9yMiwgcDI6IFZlY3RvcjIgKTogU2hhcGU7XG4gIHB1YmxpYyBzdGF0aWMgbGluZVNlZ21lbnQoIGE6IFZlY3RvcjIgfCBudW1iZXIsIGI6IFZlY3RvcjIgfCBudW1iZXIsIGM/OiBudW1iZXIsIGQ/OiBudW1iZXIgKTogU2hhcGUge1xuICAgIGlmICggdHlwZW9mIGEgPT09ICdudW1iZXInICkge1xuICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpLm1vdmVUbyggYSwgYiBhcyBudW1iZXIgKS5saW5lVG8oIGMhLCBkISApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRoZW4gYSBhbmQgYiBtdXN0IGJlIHtWZWN0b3IyfVxuICAgICAgcmV0dXJuIG5ldyBTaGFwZSgpLm1vdmVUb1BvaW50KCBhICkubGluZVRvUG9pbnQoIGIgYXMgVmVjdG9yMiApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVndWxhciBwb2x5Z29uIG9mIHJhZGl1cyBhbmQgbnVtYmVyIG9mIHNpZGVzXG4gICAqIFRoZSByZWd1bGFyIHBvbHlnb24gaXMgb3JpZW50ZWQgc3VjaCB0aGF0IHRoZSBmaXJzdCB2ZXJ0ZXggbGllcyBvbiB0aGUgcG9zaXRpdmUgeC1heGlzLlxuICAgKlxuICAgKiBAcGFyYW0gc2lkZXMgLSBhbiBpbnRlZ2VyXG4gICAqIEBwYXJhbSByYWRpdXNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVndWxhclBvbHlnb24oIHNpZGVzOiBudW1iZXIsIHJhZGl1czogbnVtYmVyICk6IFNoYXBlIHtcbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgIF8uZWFjaCggXy5yYW5nZSggc2lkZXMgKSwgayA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IFZlY3RvcjIuY3JlYXRlUG9sYXIoIHJhZGl1cywgMiAqIE1hdGguUEkgKiBrIC8gc2lkZXMgKTtcbiAgICAgICggayA9PT0gMCApID8gc2hhcGUubW92ZVRvUG9pbnQoIHBvaW50ICkgOiBzaGFwZS5saW5lVG9Qb2ludCggcG9pbnQgKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIHNoYXBlLmNsb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNpcmNsZVxuICAgKiBzdXBwb3J0cyBib3RoIGNpcmNsZSggY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzICksIGNpcmNsZSggY2VudGVyLCByYWRpdXMgKSwgYW5kIGNpcmNsZSggcmFkaXVzICkgd2l0aCB0aGUgY2VudGVyIGRlZmF1bHQgdG8gMCwwXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNpcmNsZSggY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1czogbnVtYmVyICk6IFNoYXBlO1xuICBwdWJsaWMgc3RhdGljIGNpcmNsZSggY2VudGVyOiBWZWN0b3IyLCByYWRpdXM6IG51bWJlciApOiBTaGFwZTtcbiAgcHVibGljIHN0YXRpYyBjaXJjbGUoIHJhZGl1czogbnVtYmVyICk6IFNoYXBlO1xuICBwdWJsaWMgc3RhdGljIGNpcmNsZSggYTogVmVjdG9yMiB8IG51bWJlciwgYj86IG51bWJlciwgYz86IG51bWJlciApOiBTaGFwZSB7XG4gICAgaWYgKCBiID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAvLyBjaXJjbGUoIHJhZGl1cyApLCBjZW50ZXIgPSAwLDBcbiAgICAgIHJldHVybiBuZXcgU2hhcGUoKS5jaXJjbGUoIDAsIDAsIGEgYXMgbnVtYmVyICk7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUaGUgc2lnbmF0dXJlcyBhcmUgY29tcGF0aWJsZSwgaXQncyBqdXN0IG11bHRpcGxlIGRpZmZlcmVudCB0eXBlcyBhdCB0aGUgc2FtZSB0aW1lXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLmNpcmNsZSggYSwgYiwgYyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1cHBvcnRzIGVsbGlwc2UoIGNlbnRlclgsIGNlbnRlclksIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uICksIGVsbGlwc2UoIGNlbnRlciwgcmFkaXVzWCwgcmFkaXVzWSwgcm90YXRpb24gKSwgYW5kIGVsbGlwc2UoIHJhZGl1c1gsIHJhZGl1c1ksIHJvdGF0aW9uIClcbiAgICogd2l0aCB0aGUgY2VudGVyIGRlZmF1bHQgdG8gMCwwIGFuZCByb3RhdGlvbiBvZiAwLiAgVGhlIHJvdGF0aW9uIGlzIGFib3V0IHRoZSBjZW50ZXJYLCBjZW50ZXJZLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBlbGxpcHNlKCBjZW50ZXJYOiBudW1iZXIsIGNlbnRlclk6IG51bWJlciwgcmFkaXVzWDogbnVtYmVyLCByYWRpdXNZOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIgKTogU2hhcGU7XG4gIHB1YmxpYyBzdGF0aWMgZWxsaXBzZSggY2VudGVyOiBWZWN0b3IyLCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciApOiBTaGFwZTtcbiAgcHVibGljIHN0YXRpYyBlbGxpcHNlKCByYWRpdXNYOiBudW1iZXIsIHJhZGl1c1k6IG51bWJlciwgcm90YXRpb246IG51bWJlciApOiBTaGFwZTtcbiAgcHVibGljIHN0YXRpYyBlbGxpcHNlKCBhOiBWZWN0b3IyIHwgbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlciwgZD86IG51bWJlciwgZT86IG51bWJlciApOiBTaGFwZSB7XG4gICAgLy8gVE9ETzogRWxsaXBzZS9FbGxpcHRpY2FsQXJjIGhhcyBhIG1lc3Mgb2YgcGFyYW1ldGVycy4gQ29uc2lkZXIgcGFyYW1ldGVyIG9iamVjdCwgb3IgZG91YmxlLWNoZWNrIHBhcmFtZXRlciBoYW5kbGluZyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBpZiAoIGQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vIGVsbGlwc2UoIHJhZGl1c1gsIHJhZGl1c1kgKSwgY2VudGVyID0gMCwwXG4gICAgICByZXR1cm4gbmV3IFNoYXBlKCkuZWxsaXBzZSggMCwgMCwgYSBhcyBudW1iZXIsIGIsIGMgKTtcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRoZSBzaWduYXR1cmVzIGFyZSBjb21wYXRpYmxlLCBpdCdzIGp1c3QgbXVsdGlwbGUgZGlmZmVyZW50IHR5cGVzIGF0IHRoZSBzYW1lIHRpbWVcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkuZWxsaXBzZSggYSwgYiwgYywgZCwgZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1cHBvcnRzIGJvdGggYXJjKCBjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkgYW5kIGFyYyggY2VudGVyLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlIClcbiAgICpcbiAgICogQHBhcmFtIHJhZGl1cyAtIEhvdyBmYXIgZnJvbSB0aGUgY2VudGVyIHRoZSBhcmMgd2lsbCBiZVxuICAgKiBAcGFyYW0gc3RhcnRBbmdsZSAtIEFuZ2xlIChyYWRpYW5zKSBvZiB0aGUgc3RhcnQgb2YgdGhlIGFyY1xuICAgKiBAcGFyYW0gZW5kQW5nbGUgLSBBbmdsZSAocmFkaWFucykgb2YgdGhlIGVuZCBvZiB0aGUgYXJjXG4gICAqIEBwYXJhbSBbYW50aWNsb2Nrd2lzZV0gLSBEZWNpZGVzIHdoaWNoIGRpcmVjdGlvbiB0aGUgYXJjIHRha2VzIGFyb3VuZCB0aGUgY2VudGVyXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFyYyggY2VudGVyWDogbnVtYmVyLCBjZW50ZXJZOiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBzdGFydEFuZ2xlOiBudW1iZXIsIGVuZEFuZ2xlOiBudW1iZXIsIGFudGljbG9ja3dpc2U/OiBib29sZWFuICk6IFNoYXBlO1xuICBwdWJsaWMgc3RhdGljIGFyYyggY2VudGVyOiBWZWN0b3IyLCByYWRpdXM6IG51bWJlciwgc3RhcnRBbmdsZTogbnVtYmVyLCBlbmRBbmdsZTogbnVtYmVyLCBhbnRpY2xvY2t3aXNlPzogYm9vbGVhbiApOiBTaGFwZTtcbiAgcHVibGljIHN0YXRpYyBhcmMoIGE6IFZlY3RvcjIgfCBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIsIGU/OiBudW1iZXIgfCBib29sZWFuLCBmPzogYm9vbGVhbiApOiBTaGFwZSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFRoZSBzaWduYXR1cmVzIGFyZSBjb21wYXRpYmxlLCBpdCdzIGp1c3QgbXVsdGlwbGUgZGlmZmVyZW50IHR5cGVzIGF0IHRoZSBzYW1lIHRpbWVcbiAgICByZXR1cm4gbmV3IFNoYXBlKCkuYXJjKCBhLCBiLCBjLCBkLCBlLCBmICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdW5pb24gb2YgYW4gYXJyYXkgb2Ygc2hhcGVzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB1bmlvbiggc2hhcGVzOiBTaGFwZVtdICk6IFNoYXBlIHtcbiAgICByZXR1cm4gR3JhcGgudW5pb25Ob25aZXJvKCBzaGFwZXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb24gb2YgYW4gYXJyYXkgb2Ygc2hhcGVzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpbnRlcnNlY3Rpb24oIHNoYXBlczogU2hhcGVbXSApOiBTaGFwZSB7XG4gICAgcmV0dXJuIEdyYXBoLmludGVyc2VjdGlvbk5vblplcm8oIHNoYXBlcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHhvciBvZiBhbiBhcnJheSBvZiBzaGFwZXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHhvciggc2hhcGVzOiBTaGFwZVtdICk6IFNoYXBlIHtcbiAgICByZXR1cm4gR3JhcGgueG9yTm9uWmVybyggc2hhcGVzICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBTaGFwZSBjb25zdHJ1Y3RlZCBieSBhcHBlbmRpbmcgYSBsaXN0IG9mIHNlZ21lbnRzIHRvZ2V0aGVyLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzZWdtZW50cyggc2VnbWVudHM6IFNlZ21lbnRbXSwgY2xvc2VkPzogYm9vbGVhbiApOiBTaGFwZSB7XG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgYXNzZXJ0KCBzZWdtZW50c1sgaSAtIDEgXS5lbmQuZXF1YWxzRXBzaWxvbiggc2VnbWVudHNbIGkgXS5zdGFydCwgMWUtNiApLCAnTWlzbWF0Y2hlZCBzdGFydC9lbmQnICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTaGFwZSggWyBuZXcgU3VicGF0aCggc2VnbWVudHMsIHVuZGVmaW5lZCwgISFjbG9zZWQgKSBdICk7XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ1NoYXBlJywgU2hhcGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcGU7Il0sIm5hbWVzIjpbIlRpbnlFbWl0dGVyIiwiQm91bmRzMiIsImRvdFJhbmRvbSIsIlJheTIiLCJWZWN0b3IyIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJBcmMiLCJDdWJpYyIsIkVsbGlwdGljYWxBcmMiLCJHcmFwaCIsImtpdGUiLCJMaW5lIiwiUXVhZHJhdGljIiwiU2VnbWVudCIsIlN1YnBhdGgiLCJzdmdOdW1iZXIiLCJzdmdQYXRoIiwicmFuZG9tU291cmNlIiwiTWF0aCIsInJhbmRvbSIsInYiLCJ4IiwieSIsIndlaWdodGVkU3BsaW5lVmVjdG9yIiwiYmVmb3JlVmVjdG9yIiwiY3VycmVudFZlY3RvciIsImFmdGVyVmVjdG9yIiwidGVuc2lvbiIsImNvcHkiLCJzdWJ0cmFjdCIsIm11bHRpcGx5U2NhbGFyIiwiYWRkIiwiU2hhcGUiLCJyZXNldENvbnRyb2xQb2ludHMiLCJsYXN0UXVhZHJhdGljQ29udHJvbFBvaW50IiwibGFzdEN1YmljQ29udHJvbFBvaW50Iiwic2V0UXVhZHJhdGljQ29udHJvbFBvaW50IiwicG9pbnQiLCJzZXRDdWJpY0NvbnRyb2xQb2ludCIsIm1vdmVUbyIsImFzc2VydCIsImlzRmluaXRlIiwibW92ZVRvUG9pbnQiLCJtb3ZlVG9SZWxhdGl2ZSIsIm1vdmVUb1BvaW50UmVsYXRpdmUiLCJkaXNwbGFjZW1lbnQiLCJnZXRSZWxhdGl2ZVBvaW50IiwicGx1cyIsImFkZFN1YnBhdGgiLCJhZGRQb2ludCIsImxpbmVUbyIsImxpbmVUb1BvaW50IiwibGluZVRvUmVsYXRpdmUiLCJsaW5lVG9Qb2ludFJlbGF0aXZlIiwiaGFzU3VicGF0aHMiLCJzdGFydCIsImdldExhc3RTdWJwYXRoIiwiZ2V0TGFzdFBvaW50IiwiZW5kIiwibGluZSIsImFkZFNlZ21lbnRBbmRCb3VuZHMiLCJlbnN1cmUiLCJob3Jpem9udGFsTGluZVRvIiwiaG9yaXpvbnRhbExpbmVUb1JlbGF0aXZlIiwidmVydGljYWxMaW5lVG8iLCJ2ZXJ0aWNhbExpbmVUb1JlbGF0aXZlIiwiemlnWmFnVG8iLCJlbmRYIiwiZW5kWSIsImFtcGxpdHVkZSIsIm51bWJlclppZ1phZ3MiLCJzeW1tZXRyaWNhbCIsInppZ1phZ1RvUG9pbnQiLCJlbmRQb2ludCIsIk51bWJlciIsImlzSW50ZWdlciIsInN0YXJ0UG9pbnQiLCJkZWx0YSIsIm1pbnVzIiwiZGlyZWN0aW9uVW5pdFZlY3RvciIsIm5vcm1hbGl6ZWQiLCJhbXBsaXR1ZGVOb3JtYWxWZWN0b3IiLCJwZXJwZW5kaWN1bGFyIiwidGltZXMiLCJ3YXZlbGVuZ3RoIiwibWFnbml0dWRlIiwiaSIsIndhdmVPcmlnaW4iLCJ0b3BQb2ludCIsImJvdHRvbVBvaW50IiwicXVhZHJhdGljQ3VydmVUbyIsImNweCIsImNweSIsInF1YWRyYXRpY0N1cnZlVG9Qb2ludCIsInF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZSIsInF1YWRyYXRpY0N1cnZlVG9Qb2ludFJlbGF0aXZlIiwiY29udHJvbFBvaW50IiwicmVsYXRpdmVQb2ludCIsInNtb290aFF1YWRyYXRpY0N1cnZlVG8iLCJnZXRTbW9vdGhRdWFkcmF0aWNDb250cm9sUG9pbnQiLCJzbW9vdGhRdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUiLCJxdWFkcmF0aWMiLCJub25kZWdlbmVyYXRlU2VnbWVudHMiLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJfIiwiZWFjaCIsInNlZ21lbnQiLCJjdWJpY0N1cnZlVG8iLCJjcDF4IiwiY3AxeSIsImNwMngiLCJjcDJ5IiwiY3ViaWNDdXJ2ZVRvUG9pbnQiLCJjdWJpY0N1cnZlVG9SZWxhdGl2ZSIsImN1YmljQ3VydmVUb1BvaW50UmVsYXRpdmUiLCJjb250cm9sMSIsImNvbnRyb2wyIiwic21vb3RoQ3ViaWNDdXJ2ZVRvIiwiZ2V0U21vb3RoQ3ViaWNDb250cm9sUG9pbnQiLCJzbW9vdGhDdWJpY0N1cnZlVG9SZWxhdGl2ZSIsImN1YmljIiwiYXJjIiwiY2VudGVyWCIsImNlbnRlclkiLCJyYWRpdXMiLCJzdGFydEFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwiYXJjUG9pbnQiLCJjZW50ZXIiLCJ1bmRlZmluZWQiLCJnZXRTdGFydCIsImdldEVuZCIsImdldExlbmd0aCIsImVxdWFscyIsImVsbGlwdGljYWxBcmMiLCJyYWRpdXNYIiwicmFkaXVzWSIsInJvdGF0aW9uIiwiZWxsaXB0aWNhbEFyY1BvaW50IiwiY2xvc2UiLCJwcmV2aW91c1BhdGgiLCJuZXh0UGF0aCIsImdldEZpcnN0UG9pbnQiLCJuZXdTdWJwYXRoIiwibWFrZUltbXV0YWJsZSIsIl9pbW11dGFibGUiLCJub3RpZnlJbnZhbGlkYXRpb25MaXN0ZW5lcnMiLCJpc0ltbXV0YWJsZSIsImVsbGlwdGljYWxBcmNUb1JlbGF0aXZlIiwibGFyZ2VBcmMiLCJzd2VlcCIsImVsbGlwdGljYWxBcmNUbyIsInJ4cyIsInJ5cyIsInByaW1lIiwiZGl2aWRlZFNjYWxhciIsInJvdGF0ZWQiLCJweHMiLCJweXMiLCJjZW50ZXJQcmltZSIsInNpemUiLCJzcXJ0IiwibWF4IiwiYmxlbmQiLCJzaWduZWRBbmdsZSIsInUiLCJhbmdsZUJldHdlZW4iLCJ2aWN0b3IiLCJyb3NzIiwiWF9VTklUIiwiZGVsdGFBbmdsZSIsIlBJIiwiY2lyY2xlIiwiZWxsaXBzZSIsInJlY3QiLCJ3aWR0aCIsImhlaWdodCIsInN1YnBhdGgiLCJwb2ludHMiLCJpc05hTiIsImJvdW5kcyIsImdldFgiLCJyb3VuZFJlY3QiLCJhcmN3IiwiYXJjaCIsImxvd1giLCJoaWdoWCIsImxvd1kiLCJoaWdoWSIsInBvbHlnb24iLCJ2ZXJ0aWNlcyIsImxlbmd0aCIsImNhcmRpbmFsU3BsaW5lIiwicG9zaXRpb25zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImlzQ2xvc2VkTGluZVNlZ21lbnRzIiwicG9pbnROdW1iZXIiLCJzZWdtZW50TnVtYmVyIiwiY2FyZGluYWxQb2ludHMiLCJiZXppZXJQb2ludHMiLCJtYXAiLCJzdWJwYXRocyIsIndyaXRlVG9Db250ZXh0IiwiY29udGV4dCIsImxlbiIsImdldFNWR1BhdGgiLCJzdHJpbmciLCJpc0RyYXdhYmxlIiwic2VnbWVudHMiLCJrIiwiZ2V0U1ZHUGF0aEZyYWdtZW50IiwiaXNDbG9zZWQiLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsInJlZHVjZSIsInVuaW9uIiwiTk9USElORyIsIm5vbmxpbmVhclRyYW5zZm9ybWVkIiwibWluTGV2ZWxzIiwibWF4TGV2ZWxzIiwiZGlzdGFuY2VFcHNpbG9uIiwiY3VydmVFcHNpbG9uIiwiaW5jbHVkZUN1cnZhdHVyZSIsInBvbGFyVG9DYXJ0ZXNpYW4iLCJwb2ludE1hcCIsInAiLCJjcmVhdGVQb2xhciIsIm1ldGhvZE5hbWUiLCJ0b1BpZWNld2lzZUxpbmVhciIsImNvbnRhaW5zUG9pbnQiLCJyYXlEaXJlY3Rpb24iLCJjb3VudCIsInJheUludGVyc2VjdHNTZWdtZW50VmVydGV4Iiwic29tZSIsImRpdmlkZVNjYWxhciIsIm1hZ25pdHVkZVNxdWFyZWQiLCJyb3RhdGUiLCJuZXh0RG91YmxlIiwid2luZGluZ0ludGVyc2VjdGlvbiIsImludGVyc2VjdGlvbiIsInJheSIsImhpdHMiLCJudW1TdWJwYXRocyIsIm51bVNlZ21lbnRzIiwiY29uY2F0IiwiaGFzQ2xvc2luZ1NlZ21lbnQiLCJnZXRDbG9zaW5nU2VnbWVudCIsInNvcnRCeSIsImhpdCIsImRpc3RhbmNlIiwiaW50ZXJpb3JJbnRlcnNlY3RzTGluZVNlZ21lbnQiLCJtaWRwb2ludCIsIm5vcm1hbGl6ZSIsIndpbmQiLCJpbnRlcnNlY3RzQm91bmRzIiwibWluSG9yaXpvbnRhbFJheSIsIm1pblgiLCJtaW5ZIiwibWluVmVydGljYWxSYXkiLCJtYXhIb3Jpem9udGFsUmF5IiwibWF4WCIsIm1heFkiLCJtYXhWZXJ0aWNhbFJheSIsImhpdFBvaW50IiwiaG9yaXpvbnRhbFJheUludGVyc2VjdGlvbnMiLCJ2ZXJ0aWNhbFJheUludGVyc2VjdGlvbnMiLCJnZXRTdHJva2VkU2hhcGUiLCJsaW5lU3R5bGVzIiwic3ViTGVuIiwic3Ryb2tlZFN1YnBhdGgiLCJzdHJva2VkIiwiaW5jbHVkZUJvdW5kcyIsImdldE9mZnNldFNoYXBlIiwicHVzaCIsIm9mZnNldCIsImdldERhc2hlZFNoYXBlIiwibGluZURhc2giLCJsaW5lRGFzaE9mZnNldCIsImZsYXR0ZW4iLCJkYXNoZWQiLCJnZXRCb3VuZHMiLCJfYm91bmRzIiwiZ2V0U3Ryb2tlZEJvdW5kcyIsImFyZVN0cm9rZWRCb3VuZHNEaWxhdGVkIiwiaiIsImRpbGF0ZWQiLCJsaW5lV2lkdGgiLCJnZXRTaW1wbGlmaWVkQXJlYVNoYXBlIiwic2ltcGxpZnlOb25aZXJvIiwiZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSIsImdldEFwcHJveGltYXRlQXJlYSIsIm51bVNhbXBsZXMiLCJyZWN0YW5nbGVBcmVhIiwiZ2V0Tm9ub3ZlcmxhcHBpbmdBcmVhIiwiYWJzIiwic3VtIiwiZ2V0RmlsbFNlZ21lbnRzIiwiZ2V0U2lnbmVkQXJlYUZyYWdtZW50IiwiZ2V0QXJlYSIsImdldEFwcHJveGltYXRlQ2VudHJvaWQiLCJnZXRDbG9zZXN0UG9pbnRzIiwiZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQiLCJnZXRDbG9zZXN0UG9pbnQiLCJjbG9zZXN0UG9pbnQiLCJpbnZhbGlkYXRlUG9pbnRzIiwiX2ludmFsaWRhdGluZ1BvaW50cyIsImludmFsaWRhdGUiLCJ0b1N0cmluZyIsInRyaW0iLCJpbnZhbGlkYXRlZEVtaXR0ZXIiLCJlbWl0IiwiYWRkU2VnbWVudCIsImFkZExpc3RlbmVyIiwiX2ludmFsaWRhdGVMaXN0ZW5lciIsImxhc3QiLCJnZXRMYXN0U2VnbWVudCIsImxhc3RQb2ludCIsInJlc3VsdCIsIlpFUk8iLCJzaGFwZVVuaW9uIiwic2hhcGUiLCJiaW5hcnlSZXN1bHQiLCJCSU5BUllfTk9OWkVST19VTklPTiIsInNoYXBlSW50ZXJzZWN0aW9uIiwiQklOQVJZX05PTlpFUk9fSU5URVJTRUNUSU9OIiwic2hhcGVEaWZmZXJlbmNlIiwiQklOQVJZX05PTlpFUk9fRElGRkVSRU5DRSIsInNoYXBlWG9yIiwiQklOQVJZX05PTlpFUk9fWE9SIiwic2hhcGVDbGlwIiwiY2xpcFNoYXBlIiwiZ2V0QXJjTGVuZ3RoIiwic2VyaWFsaXplIiwidHlwZSIsImRlc2VyaWFsaXplIiwib2JqIiwicmVjdGFuZ2xlIiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsImNvcm5lclJhZGlpIiwidG9wTGVmdFJhZGl1cyIsInRvcExlZnQiLCJ0b3BSaWdodFJhZGl1cyIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdFJhZGl1cyIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodFJhZGl1cyIsImJvdHRvbVJpZ2h0IiwidG9wU3VtIiwiYm90dG9tU3VtIiwibGVmdFN1bSIsInJpZ2h0U3VtIiwicmlnaHQiLCJib3R0b20iLCJib3VuZHNPZmZzZXRXaXRoUmFkaWkiLCJvZmZzZXRzIiwicmFkaWkiLCJvZmZzZXRCb3VuZHMiLCJ3aXRoT2Zmc2V0cyIsImxlZnQiLCJ0b3AiLCJsaW5lU2VnbWVudCIsImEiLCJiIiwiYyIsImQiLCJyZWd1bGFyUG9seWdvbiIsInNpZGVzIiwicmFuZ2UiLCJlIiwiZiIsInNoYXBlcyIsInVuaW9uTm9uWmVybyIsImludGVyc2VjdGlvbk5vblplcm8iLCJ4b3IiLCJ4b3JOb25aZXJvIiwiY2xvc2VkIiwiZXF1YWxzRXBzaWxvbiIsImJpbmQiLCJwYXJzZSIsIml0ZW0iLCJwcm90b3R5cGUiLCJjbWQiLCJhcHBseSIsImFyZ3MiLCJyb3VuZFJlY3RhbmdsZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQkMsR0FFRCxPQUFPQSxpQkFBaUIsK0JBQStCO0FBQ3ZELE9BQU9DLGFBQWEsMEJBQTBCO0FBQzlDLE9BQU9DLGVBQWUsNEJBQTRCO0FBRWxELE9BQU9DLFVBQVUsdUJBQXVCO0FBQ3hDLE9BQU9DLGFBQWEsMEJBQTBCO0FBQzlDLE9BQU9DLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFDNUUsU0FBU0MsR0FBRyxFQUF3QkMsS0FBSyxFQUFFQyxhQUFhLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQXNDQyxTQUFTLEVBQW1CQyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsU0FBUyxFQUFFQyxPQUFPLFFBQVEsZUFBZTtBQUd4TSwrQ0FBK0M7QUFDL0MsTUFBTUMsZUFBZUMsS0FBS0MsTUFBTTtBQUVoQyxrSEFBa0g7QUFDbEgsdUJBQXVCO0FBQ3ZCLE1BQU1DLElBQUksQ0FBRUMsR0FBV0MsSUFBZSxJQUFJbkIsUUFBU2tCLEdBQUdDO0FBRXREOzs7Ozs7O0NBT0MsR0FDRCxNQUFNQyx1QkFBdUIsQ0FBRUMsY0FBdUJDLGVBQXdCQyxhQUFzQkM7SUFDbEcsT0FBT0QsWUFBWUUsSUFBSSxHQUNwQkMsUUFBUSxDQUFFTCxjQUNWTSxjQUFjLENBQUUsQUFBRSxDQUFBLElBQUlILE9BQU0sSUFBTSxHQUNsQ0ksR0FBRyxDQUFFTjtBQUNWO0FBOEVBLElBQUEsQUFBTU8sUUFBTixNQUFNQTtJQTBESjs7Ozs7R0FLQyxHQUNELEFBQVFDLHFCQUEyQjtRQUNqQyxJQUFJLENBQUNDLHlCQUF5QixHQUFHO1FBQ2pDLElBQUksQ0FBQ0MscUJBQXFCLEdBQUc7SUFDL0I7SUFFQTs7R0FFQyxHQUNELEFBQVFDLHlCQUEwQkMsS0FBYyxFQUFTO1FBQ3ZELElBQUksQ0FBQ0gseUJBQXlCLEdBQUdHO1FBQ2pDLElBQUksQ0FBQ0YscUJBQXFCLEdBQUc7SUFDL0I7SUFFQTs7R0FFQyxHQUNELEFBQVFHLHFCQUFzQkQsS0FBYyxFQUFTO1FBQ25ELElBQUksQ0FBQ0gseUJBQXlCLEdBQUc7UUFDakMsSUFBSSxDQUFDQyxxQkFBcUIsR0FBR0U7SUFDL0I7SUFFQTs7R0FFQyxHQUNELEFBQU9FLE9BQVFsQixDQUFTLEVBQUVDLENBQVMsRUFBUztRQUMxQ2tCLFVBQVVBLE9BQVFDLFNBQVVwQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEVtQixVQUFVQSxPQUFRQyxTQUFVbkIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFLE9BQU8sSUFBSSxDQUFDb0IsV0FBVyxDQUFFdEIsRUFBR0MsR0FBR0M7SUFDakM7SUFFQTs7R0FFQyxHQUNELEFBQU9xQixlQUFnQnRCLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQ2xEa0IsVUFBVUEsT0FBUUMsU0FBVXBCLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRW1CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEUsT0FBTyxJQUFJLENBQUNzQixtQkFBbUIsQ0FBRXhCLEVBQUdDLEdBQUdDO0lBQ3pDO0lBRUE7O0dBRUMsR0FDRCxBQUFPc0Isb0JBQXFCQyxZQUFxQixFQUFTO1FBQ3hELE9BQU8sSUFBSSxDQUFDSCxXQUFXLENBQUUsSUFBSSxDQUFDSSxnQkFBZ0IsR0FBR0MsSUFBSSxDQUFFRjtJQUN6RDtJQUVBOztHQUVDLEdBQ0QsQUFBT0gsWUFBYUwsS0FBYyxFQUFTO1FBQ3pDLElBQUksQ0FBQ1csVUFBVSxDQUFFLElBQUlsQyxVQUFVbUMsUUFBUSxDQUFFWjtRQUN6QyxJQUFJLENBQUNKLGtCQUFrQjtRQUV2QixPQUFPLElBQUksRUFBRSxlQUFlO0lBQzlCO0lBRUE7O0dBRUMsR0FDRCxBQUFPaUIsT0FBUTdCLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQzFDa0IsVUFBVUEsT0FBUUMsU0FBVXBCLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRW1CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEUsT0FBTyxJQUFJLENBQUM2QixXQUFXLENBQUUvQixFQUFHQyxHQUFHQztJQUNqQztJQUVBOzs7OztHQUtDLEdBQ0QsQUFBTzhCLGVBQWdCL0IsQ0FBUyxFQUFFQyxDQUFTLEVBQVM7UUFDbERrQixVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFbUIsVUFBVUEsT0FBUUMsU0FBVW5CLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRSxPQUFPLElBQUksQ0FBQytCLG1CQUFtQixDQUFFakMsRUFBR0MsR0FBR0M7SUFDekM7SUFFQTs7R0FFQyxHQUNELEFBQU8rQixvQkFBcUJSLFlBQXFCLEVBQVM7UUFDeEQsT0FBTyxJQUFJLENBQUNNLFdBQVcsQ0FBRSxJQUFJLENBQUNMLGdCQUFnQixHQUFHQyxJQUFJLENBQUVGO0lBQ3pEO0lBRUE7O0dBRUMsR0FDRCxBQUFPTSxZQUFhZCxLQUFjLEVBQVM7UUFDekMsNERBQTREO1FBQzVELElBQUssSUFBSSxDQUFDaUIsV0FBVyxJQUFLO1lBQ3hCLE1BQU1DLFFBQVEsSUFBSSxDQUFDQyxjQUFjLEdBQUdDLFlBQVk7WUFDaEQsTUFBTUMsTUFBTXJCO1lBQ1osTUFBTXNCLE9BQU8sSUFBSWhELEtBQU00QyxPQUFPRztZQUM5QixJQUFJLENBQUNGLGNBQWMsR0FBR1AsUUFBUSxDQUFFUztZQUNoQyxJQUFJLENBQUNFLG1CQUFtQixDQUFFRDtRQUM1QixPQUNLO1lBQ0gsSUFBSSxDQUFDRSxNQUFNLENBQUV4QjtRQUNmO1FBQ0EsSUFBSSxDQUFDSixrQkFBa0I7UUFFdkIsT0FBTyxJQUFJLEVBQUcsZUFBZTtJQUMvQjtJQUVBOztHQUVDLEdBQ0QsQUFBTzZCLGlCQUFrQnpDLENBQVMsRUFBUztRQUN6QyxPQUFPLElBQUksQ0FBQzZCLE1BQU0sQ0FBRTdCLEdBQUcsSUFBSSxDQUFDeUIsZ0JBQWdCLEdBQUd4QixDQUFDO0lBQ2xEO0lBRUE7O0dBRUMsR0FDRCxBQUFPeUMseUJBQTBCMUMsQ0FBUyxFQUFTO1FBQ2pELE9BQU8sSUFBSSxDQUFDK0IsY0FBYyxDQUFFL0IsR0FBRztJQUNqQztJQUVBOztHQUVDLEdBQ0QsQUFBTzJDLGVBQWdCMUMsQ0FBUyxFQUFTO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDNEIsTUFBTSxDQUFFLElBQUksQ0FBQ0osZ0JBQWdCLEdBQUd6QixDQUFDLEVBQUVDO0lBQ2pEO0lBRUE7O0dBRUMsR0FDRCxBQUFPMkMsdUJBQXdCM0MsQ0FBUyxFQUFTO1FBQy9DLE9BQU8sSUFBSSxDQUFDOEIsY0FBYyxDQUFFLEdBQUc5QjtJQUNqQztJQUVBOzs7Ozs7OztHQVFDLEdBQ0QsQUFBTzRDLFNBQVVDLElBQVksRUFBRUMsSUFBWSxFQUFFQyxTQUFpQixFQUFFQyxhQUFxQixFQUFFQyxXQUFvQixFQUFTO1FBQ2xILE9BQU8sSUFBSSxDQUFDQyxhQUFhLENBQUUsSUFBSXJFLFFBQVNnRSxNQUFNQyxPQUFRQyxXQUFXQyxlQUFlQztJQUNsRjtJQUVBOzs7Ozs7OztHQVFDLEdBQ0QsQUFBT0MsY0FBZUMsUUFBaUIsRUFBRUosU0FBaUIsRUFBRUMsYUFBcUIsRUFBRUMsV0FBb0IsRUFBUztRQUU5Ry9CLFVBQVVBLE9BQVFrQyxPQUFPQyxTQUFTLENBQUVMLGdCQUFpQixDQUFDLGtDQUFrQyxFQUFFQSxlQUFlO1FBRXpHLElBQUksQ0FBQ1QsTUFBTSxDQUFFWTtRQUNiLE1BQU1HLGFBQWEsSUFBSSxDQUFDbkIsWUFBWTtRQUNwQyxNQUFNb0IsUUFBUUosU0FBU0ssS0FBSyxDQUFFRjtRQUM5QixNQUFNRyxzQkFBc0JGLE1BQU1HLFVBQVU7UUFDNUMsTUFBTUMsd0JBQXdCRixvQkFBb0JHLGFBQWEsQ0FBQ0MsS0FBSyxDQUFFZDtRQUV2RSxJQUFJZTtRQUNKLElBQUtiLGFBQWM7WUFDakIsZ0RBQWdEO1lBQ2hEYSxhQUFhUCxNQUFNUSxTQUFTLEdBQUtmLENBQUFBLGdCQUFnQixHQUFFO1FBQ3JELE9BQ0s7WUFDSGMsYUFBYVAsTUFBTVEsU0FBUyxHQUFHZjtRQUNqQztRQUVBLElBQU0sSUFBSWdCLElBQUksR0FBR0EsSUFBSWhCLGVBQWVnQixJQUFNO1lBQ3hDLE1BQU1DLGFBQWFSLG9CQUFvQkksS0FBSyxDQUFFRyxJQUFJRixZQUFhckMsSUFBSSxDQUFFNkI7WUFDckUsTUFBTVksV0FBV0QsV0FBV3hDLElBQUksQ0FBRWdDLG9CQUFvQkksS0FBSyxDQUFFQyxhQUFhLElBQU1yQyxJQUFJLENBQUVrQztZQUN0RixNQUFNUSxjQUFjRixXQUFXeEMsSUFBSSxDQUFFZ0Msb0JBQW9CSSxLQUFLLENBQUUsSUFBSUMsYUFBYSxJQUFNTixLQUFLLENBQUVHO1lBQzlGLElBQUksQ0FBQzlCLFdBQVcsQ0FBRXFDO1lBQ2xCLElBQUksQ0FBQ3JDLFdBQVcsQ0FBRXNDO1FBQ3BCO1FBRUEsa0NBQWtDO1FBQ2xDLElBQUtsQixhQUFjO1lBQ2pCLE1BQU1nQixhQUFhUixvQkFBb0JJLEtBQUssQ0FBRWIsZ0JBQWdCYyxZQUFhckMsSUFBSSxDQUFFNkI7WUFDakYsTUFBTVksV0FBV0QsV0FBV3hDLElBQUksQ0FBRWdDLG9CQUFvQkksS0FBSyxDQUFFQyxhQUFhLElBQU1yQyxJQUFJLENBQUVrQztZQUN0RixJQUFJLENBQUM5QixXQUFXLENBQUVxQztRQUNwQjtRQUVBLE9BQU8sSUFBSSxDQUFDckMsV0FBVyxDQUFFc0I7SUFDM0I7SUFFQTs7Ozs7Ozs7O0dBU0MsR0FDRCxBQUFPaUIsaUJBQWtCQyxHQUFXLEVBQUVDLEdBQVcsRUFBRXZFLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQzlFa0IsVUFBVUEsT0FBUUMsU0FBVWtELE1BQU8sQ0FBQyw2QkFBNkIsRUFBRUEsS0FBSztRQUN4RW5ELFVBQVVBLE9BQVFDLFNBQVVtRCxNQUFPLENBQUMsNkJBQTZCLEVBQUVBLEtBQUs7UUFDeEVwRCxVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFbUIsVUFBVUEsT0FBUUMsU0FBVW5CLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRSxPQUFPLElBQUksQ0FBQ3VFLHFCQUFxQixDQUFFekUsRUFBR3VFLEtBQUtDLE1BQU94RSxFQUFHQyxHQUFHQztJQUMxRDtJQUVBOzs7Ozs7OztHQVFDLEdBQ0QsQUFBT3dFLHlCQUEwQkgsR0FBVyxFQUFFQyxHQUFXLEVBQUV2RSxDQUFTLEVBQUVDLENBQVMsRUFBUztRQUN0RmtCLFVBQVVBLE9BQVFDLFNBQVVrRCxNQUFPLENBQUMsNkJBQTZCLEVBQUVBLEtBQUs7UUFDeEVuRCxVQUFVQSxPQUFRQyxTQUFVbUQsTUFBTyxDQUFDLDZCQUE2QixFQUFFQSxLQUFLO1FBQ3hFcEQsVUFBVUEsT0FBUUMsU0FBVXBCLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRW1CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEUsT0FBTyxJQUFJLENBQUN5RSw2QkFBNkIsQ0FBRTNFLEVBQUd1RSxLQUFLQyxNQUFPeEUsRUFBR0MsR0FBR0M7SUFDbEU7SUFFQTs7Ozs7O0dBTUMsR0FDRCxBQUFPeUUsOEJBQStCQyxZQUFxQixFQUFFM0QsS0FBYyxFQUFTO1FBQ2xGLE1BQU00RCxnQkFBZ0IsSUFBSSxDQUFDbkQsZ0JBQWdCO1FBQzNDLE9BQU8sSUFBSSxDQUFDK0MscUJBQXFCLENBQUVJLGNBQWNsRCxJQUFJLENBQUVpRCxlQUFnQkMsY0FBY2xELElBQUksQ0FBRVY7SUFDN0Y7SUFFQTs7Ozs7Ozs7R0FRQyxHQUNELEFBQU82RCx1QkFBd0I3RSxDQUFTLEVBQUVDLENBQVMsRUFBUztRQUMxRGtCLFVBQVVBLE9BQVFDLFNBQVVwQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEVtQixVQUFVQSxPQUFRQyxTQUFVbkIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFLE9BQU8sSUFBSSxDQUFDdUUscUJBQXFCLENBQUUsSUFBSSxDQUFDTSw4QkFBOEIsSUFBSS9FLEVBQUdDLEdBQUdDO0lBQ2xGO0lBRUE7Ozs7OztHQU1DLEdBQ0QsQUFBTzhFLCtCQUFnQy9FLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQ2xFa0IsVUFBVUEsT0FBUUMsU0FBVXBCLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRW1CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEUsT0FBTyxJQUFJLENBQUN1RSxxQkFBcUIsQ0FBRSxJQUFJLENBQUNNLDhCQUE4QixJQUFJL0UsRUFBR0MsR0FBR0MsR0FBSXlCLElBQUksQ0FBRSxJQUFJLENBQUNELGdCQUFnQjtJQUNqSDtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBTytDLHNCQUF1QkcsWUFBcUIsRUFBRTNELEtBQWMsRUFBUztRQUMxRSxzRUFBc0U7UUFDdEUsSUFBSSxDQUFDd0IsTUFBTSxDQUFFbUM7UUFDYixNQUFNekMsUUFBUSxJQUFJLENBQUNDLGNBQWMsR0FBR0MsWUFBWTtRQUNoRCxNQUFNNEMsWUFBWSxJQUFJekYsVUFBVzJDLE9BQU95QyxjQUFjM0Q7UUFDdEQsSUFBSSxDQUFDbUIsY0FBYyxHQUFHUCxRQUFRLENBQUVaO1FBQ2hDLE1BQU1pRSx3QkFBd0JELFVBQVVFLHdCQUF3QjtRQUNoRUMsRUFBRUMsSUFBSSxDQUFFSCx1QkFBdUJJLENBQUFBO1lBQzdCLGdFQUFnRTtZQUNoRSxJQUFJLENBQUM5QyxtQkFBbUIsQ0FBRThDO1FBQzVCO1FBQ0EsSUFBSSxDQUFDdEUsd0JBQXdCLENBQUU0RDtRQUUvQixPQUFPLElBQUksRUFBRyxlQUFlO0lBQy9CO0lBRUE7Ozs7Ozs7OztHQVNDLEdBQ0QsQUFBT1csYUFBY0MsSUFBWSxFQUFFQyxJQUFZLEVBQUVDLElBQVksRUFBRUMsSUFBWSxFQUFFMUYsQ0FBUyxFQUFFQyxDQUFTLEVBQVM7UUFDeEdrQixVQUFVQSxPQUFRQyxTQUFVbUUsT0FBUSxDQUFDLDhCQUE4QixFQUFFQSxNQUFNO1FBQzNFcEUsVUFBVUEsT0FBUUMsU0FBVW9FLE9BQVEsQ0FBQyw4QkFBOEIsRUFBRUEsTUFBTTtRQUMzRXJFLFVBQVVBLE9BQVFDLFNBQVVxRSxPQUFRLENBQUMsOEJBQThCLEVBQUVBLE1BQU07UUFDM0V0RSxVQUFVQSxPQUFRQyxTQUFVc0UsT0FBUSxDQUFDLDhCQUE4QixFQUFFQSxNQUFNO1FBQzNFdkUsVUFBVUEsT0FBUUMsU0FBVXBCLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRW1CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEUsT0FBTyxJQUFJLENBQUMwRixpQkFBaUIsQ0FBRTVGLEVBQUd3RixNQUFNQyxPQUFRekYsRUFBRzBGLE1BQU1DLE9BQVEzRixFQUFHQyxHQUFHQztJQUN6RTtJQUVBOzs7Ozs7O0dBT0MsR0FDRCxBQUFPMkYscUJBQXNCTCxJQUFZLEVBQUVDLElBQVksRUFBRUMsSUFBWSxFQUFFQyxJQUFZLEVBQUUxRixDQUFTLEVBQUVDLENBQVMsRUFBUztRQUNoSGtCLFVBQVVBLE9BQVFDLFNBQVVtRSxPQUFRLENBQUMsOEJBQThCLEVBQUVBLE1BQU07UUFDM0VwRSxVQUFVQSxPQUFRQyxTQUFVb0UsT0FBUSxDQUFDLDhCQUE4QixFQUFFQSxNQUFNO1FBQzNFckUsVUFBVUEsT0FBUUMsU0FBVXFFLE9BQVEsQ0FBQyw4QkFBOEIsRUFBRUEsTUFBTTtRQUMzRXRFLFVBQVVBLE9BQVFDLFNBQVVzRSxPQUFRLENBQUMsOEJBQThCLEVBQUVBLE1BQU07UUFDM0V2RSxVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFbUIsVUFBVUEsT0FBUUMsU0FBVW5CLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRSxPQUFPLElBQUksQ0FBQzRGLHlCQUF5QixDQUFFOUYsRUFBR3dGLE1BQU1DLE9BQVF6RixFQUFHMEYsTUFBTUMsT0FBUTNGLEVBQUdDLEdBQUdDO0lBQ2pGO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU80RiwwQkFBMkJDLFFBQWlCLEVBQUVDLFFBQWlCLEVBQUUvRSxLQUFjLEVBQVM7UUFDN0YsTUFBTTRELGdCQUFnQixJQUFJLENBQUNuRCxnQkFBZ0I7UUFDM0MsT0FBTyxJQUFJLENBQUNrRSxpQkFBaUIsQ0FBRWYsY0FBY2xELElBQUksQ0FBRW9FLFdBQVlsQixjQUFjbEQsSUFBSSxDQUFFcUUsV0FBWW5CLGNBQWNsRCxJQUFJLENBQUVWO0lBQ3JIO0lBRUE7Ozs7O0dBS0MsR0FDRCxBQUFPZ0YsbUJBQW9CUCxJQUFZLEVBQUVDLElBQVksRUFBRTFGLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQ2xGa0IsVUFBVUEsT0FBUUMsU0FBVXFFLE9BQVEsQ0FBQyw4QkFBOEIsRUFBRUEsTUFBTTtRQUMzRXRFLFVBQVVBLE9BQVFDLFNBQVVzRSxPQUFRLENBQUMsOEJBQThCLEVBQUVBLE1BQU07UUFDM0V2RSxVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFbUIsVUFBVUEsT0FBUUMsU0FBVW5CLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRSxPQUFPLElBQUksQ0FBQzBGLGlCQUFpQixDQUFFLElBQUksQ0FBQ00sMEJBQTBCLElBQUlsRyxFQUFHMEYsTUFBTUMsT0FBUTNGLEVBQUdDLEdBQUdDO0lBQzNGO0lBRUE7Ozs7O0dBS0MsR0FDRCxBQUFPaUcsMkJBQTRCVCxJQUFZLEVBQUVDLElBQVksRUFBRTFGLENBQVMsRUFBRUMsQ0FBUyxFQUFTO1FBQzFGa0IsVUFBVUEsT0FBUUMsU0FBVXFFLE9BQVEsQ0FBQyw4QkFBOEIsRUFBRUEsTUFBTTtRQUMzRXRFLFVBQVVBLE9BQVFDLFNBQVVzRSxPQUFRLENBQUMsOEJBQThCLEVBQUVBLE1BQU07UUFDM0V2RSxVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFbUIsVUFBVUEsT0FBUUMsU0FBVW5CLElBQUssQ0FBQywyQkFBMkIsRUFBRUEsR0FBRztRQUNsRSxPQUFPLElBQUksQ0FBQzBGLGlCQUFpQixDQUFFLElBQUksQ0FBQ00sMEJBQTBCLElBQUlsRyxFQUFHMEYsTUFBTUMsTUFBT2hFLElBQUksQ0FBRSxJQUFJLENBQUNELGdCQUFnQixLQUFNMUIsRUFBR0MsR0FBR0MsR0FBSXlCLElBQUksQ0FBRSxJQUFJLENBQUNELGdCQUFnQjtJQUMxSjtJQUVPa0Usa0JBQW1CRyxRQUFpQixFQUFFQyxRQUFpQixFQUFFL0UsS0FBYyxFQUFTO1FBQ3JGLHNFQUFzRTtRQUN0RSxJQUFJLENBQUN3QixNQUFNLENBQUVzRDtRQUNiLE1BQU01RCxRQUFRLElBQUksQ0FBQ0MsY0FBYyxHQUFHQyxZQUFZO1FBQ2hELE1BQU0rRCxRQUFRLElBQUlqSCxNQUFPZ0QsT0FBTzRELFVBQVVDLFVBQVUvRTtRQUVwRCxNQUFNaUUsd0JBQXdCa0IsTUFBTWpCLHdCQUF3QjtRQUM1REMsRUFBRUMsSUFBSSxDQUFFSCx1QkFBdUJJLENBQUFBO1lBQzdCLElBQUksQ0FBQzlDLG1CQUFtQixDQUFFOEM7UUFDNUI7UUFDQSxJQUFJLENBQUNsRCxjQUFjLEdBQUdQLFFBQVEsQ0FBRVo7UUFFaEMsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBRThFO1FBRTNCLE9BQU8sSUFBSSxFQUFHLGVBQWU7SUFDL0I7SUFFQTs7Ozs7OztHQU9DLEdBQ0QsQUFBT0ssSUFBS0MsT0FBZSxFQUFFQyxPQUFlLEVBQUVDLE1BQWMsRUFBRUMsVUFBa0IsRUFBRUMsUUFBZ0IsRUFBRUMsYUFBdUIsRUFBUztRQUNsSXZGLFVBQVVBLE9BQVFDLFNBQVVpRixVQUFXLENBQUMsaUNBQWlDLEVBQUVBLFNBQVM7UUFDcEZsRixVQUFVQSxPQUFRQyxTQUFVa0YsVUFBVyxDQUFDLGlDQUFpQyxFQUFFQSxTQUFTO1FBQ3BGLE9BQU8sSUFBSSxDQUFDSyxRQUFRLENBQUU1RyxFQUFHc0csU0FBU0MsVUFBV0MsUUFBUUMsWUFBWUMsVUFBVUM7SUFDN0U7SUFFQTs7Ozs7O0dBTUMsR0FDRCxBQUFPQyxTQUFVQyxNQUFlLEVBQUVMLE1BQWMsRUFBRUMsVUFBa0IsRUFBRUMsUUFBZ0IsRUFBRUMsYUFBdUIsRUFBUztRQUN0SCx5REFBeUQ7UUFDekQsSUFBS0Esa0JBQWtCRyxXQUFZO1lBQ2pDSCxnQkFBZ0I7UUFDbEI7UUFFQSxNQUFNTixNQUFNLElBQUluSCxJQUFLMkgsUUFBUUwsUUFBUUMsWUFBWUMsVUFBVUM7UUFFM0QsMkhBQTJIO1FBQzNILE1BQU1uRCxhQUFhNkMsSUFBSVUsUUFBUTtRQUMvQixNQUFNMUQsV0FBV2dELElBQUlXLE1BQU07UUFFM0Isb0hBQW9IO1FBQ3BILElBQUssSUFBSSxDQUFDOUUsV0FBVyxNQUFNLElBQUksQ0FBQ0UsY0FBYyxHQUFHNkUsU0FBUyxLQUFLLEtBQUssQ0FBQ3pELFdBQVcwRCxNQUFNLENBQUUsSUFBSSxDQUFDOUUsY0FBYyxHQUFHQyxZQUFZLEtBQU87WUFDL0gsSUFBSSxDQUFDRyxtQkFBbUIsQ0FBRSxJQUFJakQsS0FBTSxJQUFJLENBQUM2QyxjQUFjLEdBQUdDLFlBQVksSUFBSW1CO1FBQzVFO1FBRUEsSUFBSyxDQUFDLElBQUksQ0FBQ3RCLFdBQVcsSUFBSztZQUN6QixJQUFJLENBQUNOLFVBQVUsQ0FBRSxJQUFJbEM7UUFDdkI7UUFFQSxxSkFBcUo7UUFDckosSUFBSSxDQUFDMEMsY0FBYyxHQUFHUCxRQUFRLENBQUUyQjtRQUNoQyxJQUFJLENBQUNwQixjQUFjLEdBQUdQLFFBQVEsQ0FBRXdCO1FBRWhDLElBQUksQ0FBQ2IsbUJBQW1CLENBQUU2RDtRQUMxQixJQUFJLENBQUN4RixrQkFBa0I7UUFFdkIsT0FBTyxJQUFJLEVBQUcsZUFBZTtJQUMvQjtJQUVBOzs7Ozs7Ozs7OztHQVdDLEdBQ0QsQUFBT3NHLGNBQWViLE9BQWUsRUFBRUMsT0FBZSxFQUFFYSxPQUFlLEVBQUVDLE9BQWUsRUFBRUMsUUFBZ0IsRUFBRWIsVUFBa0IsRUFBRUMsUUFBZ0IsRUFBRUMsYUFBdUIsRUFBUztRQUNoTHZGLFVBQVVBLE9BQVFDLFNBQVVpRixVQUFXLENBQUMsaUNBQWlDLEVBQUVBLFNBQVM7UUFDcEZsRixVQUFVQSxPQUFRQyxTQUFVa0YsVUFBVyxDQUFDLGlDQUFpQyxFQUFFQSxTQUFTO1FBQ3BGLE9BQU8sSUFBSSxDQUFDZ0Isa0JBQWtCLENBQUV2SCxFQUFHc0csU0FBU0MsVUFBV2EsU0FBU0MsU0FBU0MsVUFBVWIsWUFBWUMsVUFBVUM7SUFDM0c7SUFFQTs7Ozs7Ozs7OztHQVVDLEdBQ0QsQUFBT1ksbUJBQW9CVixNQUFlLEVBQUVPLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxRQUFnQixFQUFFYixVQUFrQixFQUFFQyxRQUFnQixFQUFFQyxhQUF1QixFQUFTO1FBQ3BLLHlEQUF5RDtRQUN6RCxJQUFLQSxrQkFBa0JHLFdBQVk7WUFDakNILGdCQUFnQjtRQUNsQjtRQUVBLE1BQU1RLGdCQUFnQixJQUFJL0gsY0FBZXlILFFBQVFPLFNBQVNDLFNBQVNDLFVBQVViLFlBQVlDLFVBQVVDO1FBRW5HLDJIQUEySDtRQUMzSCxNQUFNbkQsYUFBYTJELGNBQWNoRixLQUFLO1FBQ3RDLE1BQU1rQixXQUFXOEQsY0FBYzdFLEdBQUc7UUFFbEMsb0hBQW9IO1FBQ3BILElBQUssSUFBSSxDQUFDSixXQUFXLE1BQU0sSUFBSSxDQUFDRSxjQUFjLEdBQUc2RSxTQUFTLEtBQUssS0FBSyxDQUFDekQsV0FBVzBELE1BQU0sQ0FBRSxJQUFJLENBQUM5RSxjQUFjLEdBQUdDLFlBQVksS0FBTztZQUMvSCxJQUFJLENBQUNHLG1CQUFtQixDQUFFLElBQUlqRCxLQUFNLElBQUksQ0FBQzZDLGNBQWMsR0FBR0MsWUFBWSxJQUFJbUI7UUFDNUU7UUFFQSxJQUFLLENBQUMsSUFBSSxDQUFDdEIsV0FBVyxJQUFLO1lBQ3pCLElBQUksQ0FBQ04sVUFBVSxDQUFFLElBQUlsQztRQUN2QjtRQUVBLHFKQUFxSjtRQUNySixJQUFJLENBQUMwQyxjQUFjLEdBQUdQLFFBQVEsQ0FBRTJCO1FBQ2hDLElBQUksQ0FBQ3BCLGNBQWMsR0FBR1AsUUFBUSxDQUFFd0I7UUFFaEMsSUFBSSxDQUFDYixtQkFBbUIsQ0FBRTJFO1FBQzFCLElBQUksQ0FBQ3RHLGtCQUFrQjtRQUV2QixPQUFPLElBQUksRUFBRyxlQUFlO0lBQy9CO0lBRUE7OztHQUdDLEdBQ0QsQUFBTzJHLFFBQWM7UUFDbkIsSUFBSyxJQUFJLENBQUN0RixXQUFXLElBQUs7WUFDeEIsTUFBTXVGLGVBQWUsSUFBSSxDQUFDckYsY0FBYztZQUN4QyxNQUFNc0YsV0FBVyxJQUFJaEk7WUFFckIrSCxhQUFhRCxLQUFLO1lBQ2xCLElBQUksQ0FBQzVGLFVBQVUsQ0FBRThGO1lBQ2pCQSxTQUFTN0YsUUFBUSxDQUFFNEYsYUFBYUUsYUFBYTtRQUMvQztRQUNBLElBQUksQ0FBQzlHLGtCQUFrQjtRQUN2QixPQUFPLElBQUksRUFBRyxlQUFlO0lBQy9CO0lBRUE7Ozs7Ozs7O0dBUUMsR0FDRCxBQUFPK0csYUFBbUI7UUFDeEIsSUFBSSxDQUFDaEcsVUFBVSxDQUFFLElBQUlsQztRQUNyQixJQUFJLENBQUNtQixrQkFBa0I7UUFFdkIsT0FBTyxJQUFJLEVBQUUsZUFBZTtJQUM5QjtJQUVBOzs7R0FHQyxHQUNELEFBQU9nSCxnQkFBc0I7UUFDM0IsSUFBSSxDQUFDQyxVQUFVLEdBQUc7UUFFbEIsSUFBSSxDQUFDQywyQkFBMkI7UUFFaEMsT0FBTyxJQUFJLEVBQUUsZUFBZTtJQUM5QjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsY0FBdUI7UUFDNUIsT0FBTyxJQUFJLENBQUNGLFVBQVU7SUFDeEI7SUFFQTs7Ozs7Ozs7Ozs7O0dBWUMsR0FDRCxBQUFPRyx3QkFBeUJiLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxRQUFnQixFQUFFWSxRQUFpQixFQUFFQyxLQUFjLEVBQUVsSSxDQUFTLEVBQUVDLENBQVMsRUFBUztRQUNsSixNQUFNMkUsZ0JBQWdCLElBQUksQ0FBQ25ELGdCQUFnQjtRQUMzQyxPQUFPLElBQUksQ0FBQzBHLGVBQWUsQ0FBRWhCLFNBQVNDLFNBQVNDLFVBQVVZLFVBQVVDLE9BQU9sSSxJQUFJNEUsY0FBYzVFLENBQUMsRUFBRUMsSUFBSTJFLGNBQWMzRSxDQUFDO0lBQ3BIO0lBRUE7Ozs7Ozs7Ozs7OztHQVlDLEdBQ0QsQUFBT2tJLGdCQUFpQmhCLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxRQUFnQixFQUFFWSxRQUFpQixFQUFFQyxLQUFjLEVBQUVsSSxDQUFTLEVBQUVDLENBQVMsRUFBUztRQUMxSSxrRUFBa0U7UUFDbEUsb0VBQW9FO1FBRXBFLE1BQU1tRCxXQUFXLElBQUl0RSxRQUFTa0IsR0FBR0M7UUFDakMsSUFBSSxDQUFDdUMsTUFBTSxDQUFFWTtRQUViLE1BQU1HLGFBQWEsSUFBSSxDQUFDcEIsY0FBYyxHQUFHQyxZQUFZO1FBQ3JELElBQUksQ0FBQ0QsY0FBYyxHQUFHUCxRQUFRLENBQUV3QjtRQUVoQyxpREFBaUQ7UUFDakQsSUFBSytELFVBQVUsR0FBSTtZQUFFQSxXQUFXLENBQUM7UUFBSztRQUN0QyxJQUFLQyxVQUFVLEdBQUk7WUFBRUEsV0FBVyxDQUFDO1FBQUs7UUFFdEMsSUFBSWdCLE1BQU1qQixVQUFVQTtRQUNwQixJQUFJa0IsTUFBTWpCLFVBQVVBO1FBQ3BCLE1BQU1rQixRQUFRL0UsV0FBV0UsS0FBSyxDQUFFTCxVQUFXbUYsYUFBYSxDQUFFLEdBQUlDLE9BQU8sQ0FBRSxDQUFDbkI7UUFDeEUsTUFBTW9CLE1BQU1ILE1BQU10SSxDQUFDLEdBQUdzSSxNQUFNdEksQ0FBQztRQUM3QixNQUFNMEksTUFBTUosTUFBTXJJLENBQUMsR0FBR3FJLE1BQU1ySSxDQUFDO1FBQzdCLElBQUkwSSxjQUFjLElBQUk3SixRQUFTcUksVUFBVW1CLE1BQU1ySSxDQUFDLEdBQUdtSCxTQUFTLENBQUNBLFVBQVVrQixNQUFNdEksQ0FBQyxHQUFHbUg7UUFFakYsOEZBQThGO1FBQzlGLE1BQU15QixPQUFPSCxNQUFNTCxNQUFNTSxNQUFNTDtRQUMvQixJQUFLTyxPQUFPLEdBQUk7WUFDZHpCLFdBQVd0SCxLQUFLZ0osSUFBSSxDQUFFRDtZQUN0QnhCLFdBQVd2SCxLQUFLZ0osSUFBSSxDQUFFRDtZQUV0QixvQ0FBb0M7WUFDcENSLE1BQU1qQixVQUFVQTtZQUNoQmtCLE1BQU1qQixVQUFVQTtZQUNoQnVCLGNBQWMsSUFBSTdKLFFBQVNxSSxVQUFVbUIsTUFBTXJJLENBQUMsR0FBR21ILFNBQVMsQ0FBQ0EsVUFBVWtCLE1BQU10SSxDQUFDLEdBQUdtSDtRQUMvRTtRQUVBLG9GQUFvRjtRQUNwRiw0REFBNEQ7UUFFNUR3QixZQUFZbEksY0FBYyxDQUFFWixLQUFLZ0osSUFBSSxDQUFFaEosS0FBS2lKLEdBQUcsQ0FBRSxHQUFHLEFBQUVWLENBQUFBLE1BQU1DLE1BQU1ELE1BQU1NLE1BQU1MLE1BQU1JLEdBQUUsSUFBUUwsQ0FBQUEsTUFBTU0sTUFBTUwsTUFBTUksR0FBRTtRQUNsSCxJQUFLUixhQUFhQyxPQUFRO1lBQ3hCLHlGQUF5RjtZQUN6RlMsWUFBWWxJLGNBQWMsQ0FBRSxDQUFDO1FBQy9CO1FBQ0EsTUFBTW1HLFNBQVNyRCxXQUFXd0YsS0FBSyxDQUFFM0YsVUFBVSxLQUFNMUIsSUFBSSxDQUFFaUgsWUFBWUgsT0FBTyxDQUFFbkI7UUFFNUUsTUFBTTJCLGNBQWMsQ0FBRUMsR0FBWWxKO1lBQ2hDLDJFQUEyRTtZQUMzRSxPQUFPLEFBQUUsQ0FBQSxBQUFFa0osRUFBRWpKLENBQUMsR0FBR0QsRUFBRUUsQ0FBQyxHQUFHZ0osRUFBRWhKLENBQUMsR0FBR0YsRUFBRUMsQ0FBQyxHQUFLLElBQUksSUFBSSxDQUFDLENBQUEsSUFBTWlKLEVBQUVDLFlBQVksQ0FBRW5KO1FBQ3RFO1FBRUEsTUFBTW9KLFNBQVMsSUFBSXJLLFFBQVMsQUFBRXdKLENBQUFBLE1BQU10SSxDQUFDLEdBQUcySSxZQUFZM0ksQ0FBQyxBQUFEQSxJQUFNbUgsU0FBUyxBQUFFbUIsQ0FBQUEsTUFBTXJJLENBQUMsR0FBRzBJLFlBQVkxSSxDQUFDLEFBQURBLElBQU1tSDtRQUNqRyxNQUFNZ0MsT0FBTyxJQUFJdEssUUFBUyxBQUFFLENBQUEsQ0FBQ3dKLE1BQU10SSxDQUFDLEdBQUcySSxZQUFZM0ksQ0FBQyxBQUFEQSxJQUFNbUgsU0FBUyxBQUFFLENBQUEsQ0FBQ21CLE1BQU1ySSxDQUFDLEdBQUcwSSxZQUFZMUksQ0FBQyxBQUFEQSxJQUFNbUg7UUFDakcsTUFBTVosYUFBYXdDLFlBQWFsSyxRQUFRdUssTUFBTSxFQUFFRjtRQUNoRCxJQUFJRyxhQUFhTixZQUFhRyxRQUFRQyxRQUFXdkosQ0FBQUEsS0FBSzBKLEVBQUUsR0FBRyxDQUFBO1FBRTNELGFBQWE7UUFDYixnSEFBZ0g7UUFDaEgsNkdBQTZHO1FBQzdHLElBQUssQ0FBQ3JCLFNBQVNvQixhQUFhLEdBQUk7WUFDOUJBLGNBQWN6SixLQUFLMEosRUFBRSxHQUFHO1FBQzFCO1FBQ0EsSUFBS3JCLFNBQVNvQixhQUFhLEdBQUk7WUFDN0JBLGNBQWN6SixLQUFLMEosRUFBRSxHQUFHO1FBQzFCO1FBRUEsdUdBQXVHO1FBQ3ZHLE1BQU1yQyxnQkFBZ0IsSUFBSS9ILGNBQWV5SCxRQUFRTyxTQUFTQyxTQUFTQyxVQUFVYixZQUFZQSxhQUFhOEMsWUFBWSxDQUFDcEI7UUFDbkgsTUFBTWpELHdCQUF3QmlDLGNBQWNoQyx3QkFBd0I7UUFDcEVDLEVBQUVDLElBQUksQ0FBRUgsdUJBQXVCSSxDQUFBQTtZQUM3QixJQUFJLENBQUM5QyxtQkFBbUIsQ0FBRThDO1FBQzVCO1FBRUEsT0FBTyxJQUFJO0lBQ2I7SUFPT21FLE9BQVFuRCxPQUF5QixFQUFFQyxPQUFlLEVBQUVDLE1BQWUsRUFBUztRQUNqRixJQUFLLE9BQU9GLFlBQVksVUFBVztZQUNqQywyQkFBMkI7WUFDM0IsTUFBTU8sU0FBU1A7WUFDZkUsU0FBU0Q7WUFDVCxPQUFPLElBQUksQ0FBQ0ssUUFBUSxDQUFFQyxRQUFRTCxRQUFRLEdBQUcxRyxLQUFLMEosRUFBRSxHQUFHLEdBQUcsT0FBUWhDLEtBQUs7UUFDckUsT0FDSztZQUNIcEcsVUFBVUEsT0FBUUMsU0FBVWlGLFVBQVcsQ0FBQyxpQ0FBaUMsRUFBRUEsU0FBUztZQUNwRmxGLFVBQVVBLE9BQVFDLFNBQVVrRixVQUFXLENBQUMsaUNBQWlDLEVBQUVBLFNBQVM7WUFFcEYscUNBQXFDO1lBQ3JDLE9BQU8sSUFBSSxDQUFDSyxRQUFRLENBQUU1RyxFQUFHc0csU0FBU0MsVUFBV0MsUUFBUyxHQUFHMUcsS0FBSzBKLEVBQUUsR0FBRyxHQUFHLE9BQVFoQyxLQUFLO1FBQ3JGO0lBQ0Y7SUFTT2tDLFFBQVNwRCxPQUF5QixFQUFFQyxPQUFlLEVBQUVhLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxRQUFpQixFQUFTO1FBQ3RILCtGQUErRjtRQUMvRixpS0FBaUs7UUFDakssSUFBSyxPQUFPaEIsWUFBWSxVQUFXO1lBQ2pDLGdEQUFnRDtZQUNoRCxNQUFNTyxTQUFTUDtZQUNmZ0IsV0FBV0Q7WUFDWEEsVUFBVUQ7WUFDVkEsVUFBVWI7WUFDVixPQUFPLElBQUksQ0FBQ2dCLGtCQUFrQixDQUFFVixRQUFRTyxTQUFTQyxTQUFTQyxZQUFZLEdBQUcsR0FBR3hILEtBQUswSixFQUFFLEdBQUcsR0FBRyxPQUFRaEMsS0FBSztRQUN4RyxPQUNLO1lBQ0hwRyxVQUFVQSxPQUFRQyxTQUFVaUYsVUFBVyxDQUFDLGlDQUFpQyxFQUFFQSxTQUFTO1lBQ3BGbEYsVUFBVUEsT0FBUUMsU0FBVWtGLFVBQVcsQ0FBQyxpQ0FBaUMsRUFBRUEsU0FBUztZQUVwRiwwREFBMEQ7WUFDMUQsT0FBTyxJQUFJLENBQUNnQixrQkFBa0IsQ0FBRXZILEVBQUdzRyxTQUFTQyxVQUFXYSxTQUFTQyxTQUFTQyxZQUFZLEdBQUcsR0FBR3hILEtBQUswSixFQUFFLEdBQUcsR0FBRyxPQUFRaEMsS0FBSztRQUN2SDtJQUNGO0lBRUE7Ozs7Ozs7R0FPQyxHQUNELEFBQU9tQyxLQUFNMUosQ0FBUyxFQUFFQyxDQUFTLEVBQUUwSixLQUFhLEVBQUVDLE1BQWMsRUFBUztRQUN2RXpJLFVBQVVBLE9BQVFDLFNBQVVwQixJQUFLLENBQUMsMkJBQTJCLEVBQUVBLEdBQUc7UUFDbEVtQixVQUFVQSxPQUFRQyxTQUFVbkIsSUFBSyxDQUFDLDJCQUEyQixFQUFFQSxHQUFHO1FBQ2xFa0IsVUFBVUEsT0FBUUMsU0FBVXVJLFFBQVMsQ0FBQywrQkFBK0IsRUFBRUEsT0FBTztRQUM5RXhJLFVBQVVBLE9BQVFDLFNBQVV3SSxTQUFVLENBQUMsZ0NBQWdDLEVBQUVBLFFBQVE7UUFFakYsTUFBTUMsVUFBVSxJQUFJcEs7UUFDcEIsSUFBSSxDQUFDa0MsVUFBVSxDQUFFa0k7UUFDakJBLFFBQVFqSSxRQUFRLENBQUU3QixFQUFHQyxHQUFHQztRQUN4QjRKLFFBQVFqSSxRQUFRLENBQUU3QixFQUFHQyxJQUFJMkosT0FBTzFKO1FBQ2hDNEosUUFBUWpJLFFBQVEsQ0FBRTdCLEVBQUdDLElBQUkySixPQUFPMUosSUFBSTJKO1FBQ3BDQyxRQUFRakksUUFBUSxDQUFFN0IsRUFBR0MsR0FBR0MsSUFBSTJKO1FBQzVCLElBQUksQ0FBQ3JILG1CQUFtQixDQUFFLElBQUlqRCxLQUFNdUssUUFBUUMsTUFBTSxDQUFFLEVBQUcsRUFBRUQsUUFBUUMsTUFBTSxDQUFFLEVBQUc7UUFDNUUsSUFBSSxDQUFDdkgsbUJBQW1CLENBQUUsSUFBSWpELEtBQU11SyxRQUFRQyxNQUFNLENBQUUsRUFBRyxFQUFFRCxRQUFRQyxNQUFNLENBQUUsRUFBRztRQUM1RSxJQUFJLENBQUN2SCxtQkFBbUIsQ0FBRSxJQUFJakQsS0FBTXVLLFFBQVFDLE1BQU0sQ0FBRSxFQUFHLEVBQUVELFFBQVFDLE1BQU0sQ0FBRSxFQUFHO1FBQzVFRCxRQUFRdEMsS0FBSztRQUNiLElBQUksQ0FBQzVGLFVBQVUsQ0FBRSxJQUFJbEM7UUFDckIsSUFBSSxDQUFDMEMsY0FBYyxHQUFHUCxRQUFRLENBQUU3QixFQUFHQyxHQUFHQztRQUN0Q2tCLFVBQVVBLE9BQVEsQ0FBQzRJLE1BQU8sSUFBSSxDQUFDQyxNQUFNLENBQUNDLElBQUk7UUFDMUMsSUFBSSxDQUFDckosa0JBQWtCO1FBRXZCLE9BQU8sSUFBSTtJQUNiO0lBRUE7Ozs7Ozs7OztHQVNDLEdBQ0QsQUFBT3NKLFVBQVdsSyxDQUFTLEVBQUVDLENBQVMsRUFBRTBKLEtBQWEsRUFBRUMsTUFBYyxFQUFFTyxJQUFZLEVBQUVDLElBQVksRUFBUztRQUN4RyxNQUFNQyxPQUFPckssSUFBSW1LO1FBQ2pCLE1BQU1HLFFBQVF0SyxJQUFJMkosUUFBUVE7UUFDMUIsTUFBTUksT0FBT3RLLElBQUltSztRQUNqQixNQUFNSSxRQUFRdkssSUFBSTJKLFNBQVNRO1FBQzNCLGdCQUFnQjtRQUNoQixJQUFLRCxTQUFTQyxNQUFPO1lBQ25CLG9FQUFvRTtZQUNwRSxJQUFJLENBQ0RoRSxHQUFHLENBQUVrRSxPQUFPQyxNQUFNSixNQUFNLENBQUN0SyxLQUFLMEosRUFBRSxHQUFHLEdBQUcsR0FBRyxPQUN6Q25ELEdBQUcsQ0FBRWtFLE9BQU9FLE9BQU9MLE1BQU0sR0FBR3RLLEtBQUswSixFQUFFLEdBQUcsR0FBRyxPQUN6Q25ELEdBQUcsQ0FBRWlFLE1BQU1HLE9BQU9MLE1BQU10SyxLQUFLMEosRUFBRSxHQUFHLEdBQUcxSixLQUFLMEosRUFBRSxFQUFFLE9BQzlDbkQsR0FBRyxDQUFFaUUsTUFBTUUsTUFBTUosTUFBTXRLLEtBQUswSixFQUFFLEVBQUUxSixLQUFLMEosRUFBRSxHQUFHLElBQUksR0FBRyxPQUNqRGhDLEtBQUs7UUFDVixPQUNLO1lBQ0gsdUNBQXVDO1lBQ3ZDLElBQUksQ0FDREwsYUFBYSxDQUFFb0QsT0FBT0MsTUFBTUosTUFBTUMsTUFBTSxHQUFHLENBQUN2SyxLQUFLMEosRUFBRSxHQUFHLEdBQUcsR0FBRyxPQUM1RHJDLGFBQWEsQ0FBRW9ELE9BQU9FLE9BQU9MLE1BQU1DLE1BQU0sR0FBRyxHQUFHdkssS0FBSzBKLEVBQUUsR0FBRyxHQUFHLE9BQzVEckMsYUFBYSxDQUFFbUQsTUFBTUcsT0FBT0wsTUFBTUMsTUFBTSxHQUFHdkssS0FBSzBKLEVBQUUsR0FBRyxHQUFHMUosS0FBSzBKLEVBQUUsRUFBRSxPQUNqRXJDLGFBQWEsQ0FBRW1ELE1BQU1FLE1BQU1KLE1BQU1DLE1BQU0sR0FBR3ZLLEtBQUswSixFQUFFLEVBQUUxSixLQUFLMEosRUFBRSxHQUFHLElBQUksR0FBRyxPQUNwRWhDLEtBQUs7UUFDVjtRQUNBLE9BQU8sSUFBSTtJQUNiO0lBRUE7O0dBRUMsR0FDRCxBQUFPa0QsUUFBU0MsUUFBbUIsRUFBUztRQUMxQyxNQUFNQyxTQUFTRCxTQUFTQyxNQUFNO1FBQzlCLElBQUtBLFNBQVMsR0FBSTtZQUNoQixJQUFJLENBQUN0SixXQUFXLENBQUVxSixRQUFRLENBQUUsRUFBRztZQUMvQixJQUFNLElBQUl6RyxJQUFJLEdBQUdBLElBQUkwRyxRQUFRMUcsSUFBTTtnQkFDakMsSUFBSSxDQUFDbkMsV0FBVyxDQUFFNEksUUFBUSxDQUFFekcsRUFBRztZQUNqQztRQUNGO1FBQ0EsT0FBTyxJQUFJLENBQUNzRCxLQUFLO0lBQ25CO0lBRUE7Ozs7Ozs7OztHQVNDLEdBQ0QsQUFBT3FELGVBQWdCQyxTQUFvQixFQUFFQyxlQUF1QyxFQUFTO1FBRTNGLE1BQU1DLFVBQVVoTSxZQUFvQztZQUNsRHVCLFNBQVM7WUFDVDBLLHNCQUFzQjtRQUN4QixHQUFHRjtRQUVIM0osVUFBVUEsT0FBUTRKLFFBQVF6SyxPQUFPLEdBQUcsS0FBS3lLLFFBQVF6SyxPQUFPLEdBQUcsQ0FBQyxHQUFHO1FBRS9ELE1BQU0ySyxjQUFjSixVQUFVRixNQUFNLEVBQUUsZ0NBQWdDO1FBRXRFLHFFQUFxRTtRQUNyRSxNQUFNTyxnQkFBZ0IsQUFBRUgsUUFBUUMsb0JBQW9CLEdBQUtDLGNBQWNBLGNBQWM7UUFFckYsSUFBTSxJQUFJaEgsSUFBSSxHQUFHQSxJQUFJaUgsZUFBZWpILElBQU07WUFDeEMsSUFBSWtILGdCQUFnQiwwQ0FBMEM7WUFDOUQsSUFBS2xILE1BQU0sS0FBSyxDQUFDOEcsUUFBUUMsb0JBQW9CLEVBQUc7Z0JBQzlDRyxpQkFBaUI7b0JBQ2ZOLFNBQVMsQ0FBRSxFQUFHO29CQUNkQSxTQUFTLENBQUUsRUFBRztvQkFDZEEsU0FBUyxDQUFFLEVBQUc7b0JBQ2RBLFNBQVMsQ0FBRSxFQUFHO2lCQUFFO1lBQ3BCLE9BQ0ssSUFBSyxBQUFFNUcsTUFBTWlILGdCQUFnQixLQUFPLENBQUNILFFBQVFDLG9CQUFvQixFQUFHO2dCQUN2RUcsaUJBQWlCO29CQUNmTixTQUFTLENBQUU1RyxJQUFJLEVBQUc7b0JBQ2xCNEcsU0FBUyxDQUFFNUcsRUFBRztvQkFDZDRHLFNBQVMsQ0FBRTVHLElBQUksRUFBRztvQkFDbEI0RyxTQUFTLENBQUU1RyxJQUFJLEVBQUc7aUJBQUU7WUFDeEIsT0FDSztnQkFDSGtILGlCQUFpQjtvQkFDZk4sU0FBUyxDQUFFLEFBQUU1RyxDQUFBQSxJQUFJLElBQUlnSCxXQUFVLElBQU1BLFlBQWE7b0JBQ2xESixTQUFTLENBQUU1RyxJQUFJZ0gsWUFBYTtvQkFDNUJKLFNBQVMsQ0FBRSxBQUFFNUcsQ0FBQUEsSUFBSSxDQUFBLElBQU1nSCxZQUFhO29CQUNwQ0osU0FBUyxDQUFFLEFBQUU1RyxDQUFBQSxJQUFJLENBQUEsSUFBTWdILFlBQWE7aUJBQUU7WUFDMUM7WUFFQSxvREFBb0Q7WUFDcEQsb0RBQW9EO1lBQ3BELG9EQUFvRDtZQUNwRCw0REFBNEQ7WUFDNUQsbURBQW1EO1lBRW5ELHdDQUF3QztZQUN4QyxNQUFNRyxlQUFlO2dCQUNuQkQsY0FBYyxDQUFFLEVBQUc7Z0JBQ25CakwscUJBQXNCaUwsY0FBYyxDQUFFLEVBQUcsRUFBRUEsY0FBYyxDQUFFLEVBQUcsRUFBRUEsY0FBYyxDQUFFLEVBQUcsRUFBRUosUUFBUXpLLE9BQU87Z0JBQ3BHSixxQkFBc0JpTCxjQUFjLENBQUUsRUFBRyxFQUFFQSxjQUFjLENBQUUsRUFBRyxFQUFFQSxjQUFjLENBQUUsRUFBRyxFQUFFSixRQUFRekssT0FBTztnQkFDcEc2SyxjQUFjLENBQUUsRUFBRzthQUNwQjtZQUVELHdDQUF3QztZQUN4QyxJQUFLbEgsTUFBTSxHQUFJO2dCQUNiLElBQUksQ0FBQ3pCLE1BQU0sQ0FBRTRJLFlBQVksQ0FBRSxFQUFHO2dCQUM5QixJQUFJLENBQUNqSixjQUFjLEdBQUdQLFFBQVEsQ0FBRXdKLFlBQVksQ0FBRSxFQUFHO1lBQ25EO1lBRUEsSUFBSSxDQUFDekYsaUJBQWlCLENBQUV5RixZQUFZLENBQUUsRUFBRyxFQUFFQSxZQUFZLENBQUUsRUFBRyxFQUFFQSxZQUFZLENBQUUsRUFBRztRQUNqRjtRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUE7O0dBRUMsR0FDRCxBQUFPN0ssT0FBYztRQUNuQixxR0FBcUc7UUFDckcsT0FBTyxJQUFJSSxNQUFPd0UsRUFBRWtHLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFFBQVEsRUFBRXpCLENBQUFBLFVBQVdBLFFBQVF0SixJQUFJLEtBQU0sSUFBSSxDQUFDeUosTUFBTTtJQUNsRjtJQUVBOztHQUVDLEdBQ0QsQUFBT3VCLGVBQWdCQyxPQUFpQyxFQUFTO1FBQy9ELE1BQU1DLE1BQU0sSUFBSSxDQUFDSCxRQUFRLENBQUNYLE1BQU07UUFDaEMsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJd0gsS0FBS3hILElBQU07WUFDOUIsSUFBSSxDQUFDcUgsUUFBUSxDQUFFckgsRUFBRyxDQUFDc0gsY0FBYyxDQUFFQztRQUNyQztJQUNGO0lBRUE7OztHQUdDLEdBQ0QsQUFBT0UsYUFBcUI7UUFDMUIsSUFBSUMsU0FBUztRQUNiLE1BQU1GLE1BQU0sSUFBSSxDQUFDSCxRQUFRLENBQUNYLE1BQU07UUFDaEMsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJd0gsS0FBS3hILElBQU07WUFDOUIsTUFBTTRGLFVBQVUsSUFBSSxDQUFDeUIsUUFBUSxDQUFFckgsRUFBRztZQUNsQyxJQUFLNEYsUUFBUStCLFVBQVUsSUFBSztnQkFDMUIscUhBQXFIO2dCQUNySCxNQUFNckksYUFBYXNHLFFBQVFnQyxRQUFRLENBQUUsRUFBRyxDQUFDM0osS0FBSztnQkFFOUN5SixVQUFVLENBQUMsRUFBRSxFQUFFak0sVUFBVzZELFdBQVd2RCxDQUFDLEVBQUcsQ0FBQyxFQUFFTixVQUFXNkQsV0FBV3RELENBQUMsRUFBRyxDQUFDLENBQUM7Z0JBRXhFLElBQU0sSUFBSTZMLElBQUksR0FBR0EsSUFBSWpDLFFBQVFnQyxRQUFRLENBQUNsQixNQUFNLEVBQUVtQixJQUFNO29CQUNsREgsVUFBVSxHQUFHOUIsUUFBUWdDLFFBQVEsQ0FBRUMsRUFBRyxDQUFDQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Z0JBQzVEO2dCQUVBLElBQUtsQyxRQUFRbUMsUUFBUSxJQUFLO29CQUN4QkwsVUFBVTtnQkFDWjtZQUNGO1FBQ0Y7UUFDQSxPQUFPQTtJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFPTSxZQUFhQyxNQUFlLEVBQVU7UUFDM0Msd0VBQXdFO1FBQ3hFLE1BQU1aLFdBQVduRyxFQUFFa0csR0FBRyxDQUFFLElBQUksQ0FBQ0MsUUFBUSxFQUFFekIsQ0FBQUEsVUFBV0EsUUFBUW9DLFdBQVcsQ0FBRUM7UUFDdkUsTUFBTWxDLFNBQVM3RSxFQUFFZ0gsTUFBTSxDQUFFYixVQUFVLENBQUV0QixRQUFRSCxVQUFhRyxPQUFPb0MsS0FBSyxDQUFFdkMsUUFBUUcsTUFBTSxHQUFJckwsUUFBUTBOLE9BQU87UUFDekcsT0FBTyxJQUFJMUwsTUFBTzJLLFVBQVV0QjtJQUM5QjtJQUVBOzs7R0FHQyxHQUNELEFBQU9zQyxxQkFBc0J4QixlQUE2QyxFQUFVO1FBQ2xGLE1BQU1DLFVBQVUvTCxlQUE2QztZQUMzRHVOLFdBQVc7WUFDWEMsV0FBVztZQUNYQyxpQkFBaUI7WUFDakJDLGNBQWMsQUFBRTVCLG1CQUFtQkEsZ0JBQWdCNkIsZ0JBQWdCLEdBQUssUUFBUTtRQUNsRixHQUFHN0I7UUFFSCx3RUFBd0U7UUFDeEUsTUFBTVEsV0FBV25HLEVBQUVrRyxHQUFHLENBQUUsSUFBSSxDQUFDQyxRQUFRLEVBQUV6QixDQUFBQSxVQUFXQSxRQUFReUMsb0JBQW9CLENBQUV2QjtRQUNoRixNQUFNZixTQUFTN0UsRUFBRWdILE1BQU0sQ0FBRWIsVUFBVSxDQUFFdEIsUUFBUUgsVUFBYUcsT0FBT29DLEtBQUssQ0FBRXZDLFFBQVFHLE1BQU0sR0FBSXJMLFFBQVEwTixPQUFPO1FBQ3pHLE9BQU8sSUFBSTFMLE1BQU8ySyxVQUFVdEI7SUFDOUI7SUFFQTs7Ozs7OztHQU9DLEdBQ0QsQUFBTzRDLGlCQUFrQjdCLE9BQXFDLEVBQVU7UUFDdEUsT0FBTyxJQUFJLENBQUN1QixvQkFBb0IsQ0FBRXROLGVBQTZDO1lBQzdFNk4sVUFBVUMsQ0FBQUEsSUFBS2hPLFFBQVFpTyxXQUFXLENBQUVELEVBQUU3TSxDQUFDLEVBQUU2TSxFQUFFOU0sQ0FBQztZQUM1Q2dOLFlBQVksbUJBQW1CLDBGQUEwRjtRQUMzSCxHQUFHakM7SUFDTDtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBT2tDLGtCQUFtQmxDLE9BQXFDLEVBQVU7UUFDdkU1SixVQUFVQSxPQUFRLENBQUM0SixXQUFXLENBQUNBLFFBQVE4QixRQUFRLEVBQUU7UUFDakQxTCxVQUFVQSxPQUFRLENBQUM0SixXQUFXLENBQUNBLFFBQVFpQyxVQUFVLEVBQUU7UUFDbkQsT0FBTyxJQUFJLENBQUNWLG9CQUFvQixDQUFFdkI7SUFDcEM7SUFFQTs7R0FFQyxHQUNELEFBQU9tQyxjQUFlbE0sS0FBYyxFQUFZO1FBRTlDLHVHQUF1RztRQUN2RyxxRkFBcUY7UUFFckYsTUFBTW1NLGVBQWVyTyxRQUFRdUssTUFBTSxDQUFDOUksSUFBSSxJQUFJLG1CQUFtQjtRQUUvRCwyRkFBMkY7UUFDM0Ysa0RBQWtEO1FBQ2xELG1EQUFtRDtRQUNuRCxJQUFJNk0sUUFBUTtRQUNaLE1BQVFBLFFBQVEsRUFBSTtZQUNsQkE7WUFFQSxrSEFBa0g7WUFDbEgsZ0hBQWdIO1lBQ2hILDZCQUE2QjtZQUM3QixNQUFNQyw2QkFBNkJsSSxFQUFFbUksSUFBSSxDQUFFLElBQUksQ0FBQ2hDLFFBQVEsRUFBRXpCLENBQUFBO2dCQUN4RCxPQUFPMUUsRUFBRW1JLElBQUksQ0FBRXpELFFBQVFnQyxRQUFRLEVBQUV4RyxDQUFBQTtvQkFDL0IsTUFBTTdCLFFBQVE2QixRQUFRbkQsS0FBSyxDQUFDdUIsS0FBSyxDQUFFekM7b0JBQ25DLE1BQU1nRCxZQUFZUixNQUFNUSxTQUFTO29CQUNqQyxJQUFLQSxjQUFjLEdBQUk7d0JBQ3JCUixNQUFNK0osWUFBWSxDQUFFdkosWUFBYSxlQUFlO3dCQUNoRFIsTUFBTWhELFFBQVEsQ0FBRTJNLGVBQWdCLDJDQUEyQzt3QkFDM0UsT0FBTzNKLE1BQU1nSyxnQkFBZ0IsR0FBRztvQkFDbEMsT0FDSzt3QkFDSCxpRkFBaUY7d0JBQ2pGLE9BQU87b0JBQ1Q7Z0JBQ0Y7WUFDRjtZQUVBLElBQUtILDRCQUE2QjtnQkFDaEMsOEZBQThGO2dCQUM5RkYsYUFBYU0sTUFBTSxDQUFFN08sVUFBVThPLFVBQVU7WUFDM0MsT0FDSztnQkFFSDtZQUNGO1FBQ0Y7UUFFQSxPQUFPLElBQUksQ0FBQ0MsbUJBQW1CLENBQUUsSUFBSTlPLEtBQU1tQyxPQUFPbU0sbUJBQXFCO0lBQ3pFO0lBRUE7OztHQUdDLEdBQ0QsQUFBT1MsYUFBY0MsR0FBUyxFQUFzQjtRQUNsRCxJQUFJQyxPQUEwQixFQUFFO1FBQ2hDLE1BQU1DLGNBQWMsSUFBSSxDQUFDekMsUUFBUSxDQUFDWCxNQUFNO1FBQ3hDLElBQU0sSUFBSTFHLElBQUksR0FBR0EsSUFBSThKLGFBQWE5SixJQUFNO1lBQ3RDLE1BQU00RixVQUFVLElBQUksQ0FBQ3lCLFFBQVEsQ0FBRXJILEVBQUc7WUFFbEMsSUFBSzRGLFFBQVErQixVQUFVLElBQUs7Z0JBQzFCLE1BQU1vQyxjQUFjbkUsUUFBUWdDLFFBQVEsQ0FBQ2xCLE1BQU07Z0JBQzNDLElBQU0sSUFBSW1CLElBQUksR0FBR0EsSUFBSWtDLGFBQWFsQyxJQUFNO29CQUN0QyxNQUFNekcsVUFBVXdFLFFBQVFnQyxRQUFRLENBQUVDLEVBQUc7b0JBQ3JDZ0MsT0FBT0EsS0FBS0csTUFBTSxDQUFFNUksUUFBUXVJLFlBQVksQ0FBRUM7Z0JBQzVDO2dCQUVBLElBQUtoRSxRQUFRcUUsaUJBQWlCLElBQUs7b0JBQ2pDSixPQUFPQSxLQUFLRyxNQUFNLENBQUVwRSxRQUFRc0UsaUJBQWlCLEdBQUdQLFlBQVksQ0FBRUM7Z0JBQ2hFO1lBQ0Y7UUFDRjtRQUNBLE9BQU8xSSxFQUFFaUosTUFBTSxDQUFFTixNQUFNTyxDQUFBQSxNQUFPQSxJQUFJQyxRQUFRO0lBQzVDO0lBRUE7Ozs7Ozs7OztHQVNDLEdBQ0QsQUFBT0MsOEJBQStCaEwsVUFBbUIsRUFBRUgsUUFBaUIsRUFBWTtRQUN0RixnSEFBZ0g7UUFDaEgsd0NBQXdDO1FBQ3hDLE1BQU1vTCxXQUFXakwsV0FBV3dGLEtBQUssQ0FBRTNGLFVBQVU7UUFDN0MsSUFBSyxJQUFJLENBQUM4SixhQUFhLENBQUVzQixXQUFhO1lBQ3BDLE9BQU87UUFDVDtRQUVBLGlKQUFpSjtRQUNqSixNQUFNaEwsUUFBUUosU0FBU0ssS0FBSyxDQUFFRjtRQUM5QixNQUFNb0gsU0FBU25ILE1BQU1RLFNBQVM7UUFFOUIsSUFBSzJHLFdBQVcsR0FBSTtZQUNsQixPQUFPO1FBQ1Q7UUFFQW5ILE1BQU1pTCxTQUFTLElBQUkseURBQXlEO1FBRTVFLHNGQUFzRjtRQUN0RixNQUFNWCxPQUFPLElBQUksQ0FBQ0YsWUFBWSxDQUFFLElBQUkvTyxLQUFNMEUsWUFBWUM7UUFFdEQsNkdBQTZHO1FBQzdHLHNDQUFzQztRQUN0QyxJQUFNLElBQUlTLElBQUksR0FBR0EsSUFBSTZKLEtBQUtuRCxNQUFNLEVBQUUxRyxJQUFNO1lBQ3RDLElBQUs2SixJQUFJLENBQUU3SixFQUFHLENBQUNxSyxRQUFRLElBQUkzRCxRQUFTO2dCQUNsQyxPQUFPO1lBQ1Q7UUFDRjtRQUVBLHdEQUF3RDtRQUN4RCxPQUFPO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU9nRCxvQkFBcUJFLEdBQVMsRUFBVztRQUM5QyxJQUFJYSxPQUFPO1FBRVgsTUFBTVgsY0FBYyxJQUFJLENBQUN6QyxRQUFRLENBQUNYLE1BQU07UUFDeEMsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJOEosYUFBYTlKLElBQU07WUFDdEMsTUFBTTRGLFVBQVUsSUFBSSxDQUFDeUIsUUFBUSxDQUFFckgsRUFBRztZQUVsQyxJQUFLNEYsUUFBUStCLFVBQVUsSUFBSztnQkFDMUIsTUFBTW9DLGNBQWNuRSxRQUFRZ0MsUUFBUSxDQUFDbEIsTUFBTTtnQkFDM0MsSUFBTSxJQUFJbUIsSUFBSSxHQUFHQSxJQUFJa0MsYUFBYWxDLElBQU07b0JBQ3RDNEMsUUFBUTdFLFFBQVFnQyxRQUFRLENBQUVDLEVBQUcsQ0FBQzZCLG1CQUFtQixDQUFFRTtnQkFDckQ7Z0JBRUEsMkNBQTJDO2dCQUMzQyxJQUFLaEUsUUFBUXFFLGlCQUFpQixJQUFLO29CQUNqQ1EsUUFBUTdFLFFBQVFzRSxpQkFBaUIsR0FBR1IsbUJBQW1CLENBQUVFO2dCQUMzRDtZQUNGO1FBQ0Y7UUFFQSxPQUFPYTtJQUNUO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU9DLGlCQUFrQjNFLE1BQWUsRUFBWTtRQUNsRCwrRUFBK0U7UUFDL0UsSUFBSyxJQUFJLENBQUNBLE1BQU0sQ0FBQzRELFlBQVksQ0FBRTVELFFBQVMvQyxNQUFNLENBQUUsSUFBSSxDQUFDK0MsTUFBTSxHQUFLO1lBQzlELE9BQU87UUFDVDtRQUVBLG9EQUFvRDtRQUNwRCxNQUFNNEUsbUJBQW1CLElBQUkvUCxLQUFNLElBQUlDLFFBQVNrTCxPQUFPNkUsSUFBSSxFQUFFN0UsT0FBTzhFLElBQUksR0FBSSxJQUFJaFEsUUFBUyxHQUFHO1FBQzVGLE1BQU1pUSxpQkFBaUIsSUFBSWxRLEtBQU0sSUFBSUMsUUFBU2tMLE9BQU82RSxJQUFJLEVBQUU3RSxPQUFPOEUsSUFBSSxHQUFJLElBQUloUSxRQUFTLEdBQUc7UUFDMUYsTUFBTWtRLG1CQUFtQixJQUFJblEsS0FBTSxJQUFJQyxRQUFTa0wsT0FBT2lGLElBQUksRUFBRWpGLE9BQU9rRixJQUFJLEdBQUksSUFBSXBRLFFBQVMsQ0FBQyxHQUFHO1FBQzdGLE1BQU1xUSxpQkFBaUIsSUFBSXRRLEtBQU0sSUFBSUMsUUFBU2tMLE9BQU9pRixJQUFJLEVBQUVqRixPQUFPa0YsSUFBSSxHQUFJLElBQUlwUSxRQUFTLEdBQUcsQ0FBQztRQUUzRixJQUFJc1E7UUFDSixJQUFJbkw7UUFDSiw2R0FBNkc7UUFDN0csTUFBTW9MLDZCQUE2QixJQUFJLENBQUN6QixZQUFZLENBQUVnQixrQkFBbUJYLE1BQU0sQ0FBRSxJQUFJLENBQUNMLFlBQVksQ0FBRW9CO1FBQ3BHLElBQU0vSyxJQUFJLEdBQUdBLElBQUlvTCwyQkFBMkIxRSxNQUFNLEVBQUUxRyxJQUFNO1lBQ3hEbUwsV0FBV0MsMEJBQTBCLENBQUVwTCxFQUFHLENBQUNqRCxLQUFLO1lBQ2hELElBQUtvTyxTQUFTcFAsQ0FBQyxJQUFJZ0ssT0FBTzZFLElBQUksSUFBSU8sU0FBU3BQLENBQUMsSUFBSWdLLE9BQU9pRixJQUFJLEVBQUc7Z0JBQzVELE9BQU87WUFDVDtRQUNGO1FBRUEsTUFBTUssMkJBQTJCLElBQUksQ0FBQzFCLFlBQVksQ0FBRW1CLGdCQUFpQmQsTUFBTSxDQUFFLElBQUksQ0FBQ0wsWUFBWSxDQUFFdUI7UUFDaEcsSUFBTWxMLElBQUksR0FBR0EsSUFBSXFMLHlCQUF5QjNFLE1BQU0sRUFBRTFHLElBQU07WUFDdERtTCxXQUFXRSx3QkFBd0IsQ0FBRXJMLEVBQUcsQ0FBQ2pELEtBQUs7WUFDOUMsSUFBS29PLFNBQVNuUCxDQUFDLElBQUkrSixPQUFPOEUsSUFBSSxJQUFJTSxTQUFTblAsQ0FBQyxJQUFJK0osT0FBT2tGLElBQUksRUFBRztnQkFDNUQsT0FBTztZQUNUO1FBQ0Y7UUFFQSx5RUFBeUU7UUFDekUsT0FBTztJQUNUO0lBRUE7Ozs7O0dBS0MsR0FDRCxBQUFPSyxnQkFBaUJDLFVBQXNCLEVBQVU7UUFDdEQsSUFBSWxFLFdBQXNCLEVBQUU7UUFDNUIsTUFBTXRCLFNBQVNyTCxRQUFRME4sT0FBTyxDQUFDOUwsSUFBSTtRQUNuQyxJQUFJa1AsU0FBUyxJQUFJLENBQUNuRSxRQUFRLENBQUNYLE1BQU07UUFDakMsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJd0wsUUFBUXhMLElBQU07WUFDakMsTUFBTTRGLFVBQVUsSUFBSSxDQUFDeUIsUUFBUSxDQUFFckgsRUFBRztZQUNsQyxNQUFNeUwsaUJBQWlCN0YsUUFBUThGLE9BQU8sQ0FBRUg7WUFDeENsRSxXQUFXQSxTQUFTMkMsTUFBTSxDQUFFeUI7UUFDOUI7UUFDQUQsU0FBU25FLFNBQVNYLE1BQU07UUFDeEIsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJd0wsUUFBUXhMLElBQU07WUFDakMrRixPQUFPNEYsYUFBYSxDQUFFdEUsUUFBUSxDQUFFckgsRUFBRyxDQUFDK0YsTUFBTTtRQUM1QztRQUNBLE9BQU8sSUFBSXJKLE1BQU8ySyxVQUFVdEI7SUFDOUI7SUFFQTs7R0FFQyxHQUNELEFBQU82RixlQUFnQnZCLFFBQWdCLEVBQVU7UUFDL0MsdUZBQXVGO1FBQ3ZGLE1BQU1oRCxXQUFXLEVBQUU7UUFDbkIsTUFBTXRCLFNBQVNyTCxRQUFRME4sT0FBTyxDQUFDOUwsSUFBSTtRQUNuQyxJQUFJa1AsU0FBUyxJQUFJLENBQUNuRSxRQUFRLENBQUNYLE1BQU07UUFDakMsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJd0wsUUFBUXhMLElBQU07WUFDakNxSCxTQUFTd0UsSUFBSSxDQUFFLElBQUksQ0FBQ3hFLFFBQVEsQ0FBRXJILEVBQUcsQ0FBQzhMLE1BQU0sQ0FBRXpCO1FBQzVDO1FBQ0FtQixTQUFTbkUsU0FBU1gsTUFBTTtRQUN4QixJQUFNLElBQUkxRyxJQUFJLEdBQUdBLElBQUl3TCxRQUFReEwsSUFBTTtZQUNqQytGLE9BQU80RixhQUFhLENBQUV0RSxRQUFRLENBQUVySCxFQUFHLENBQUMrRixNQUFNO1FBQzVDO1FBQ0EsT0FBTyxJQUFJckosTUFBTzJLLFVBQVV0QjtJQUM5QjtJQUVBOztHQUVDLEdBQ0QsQUFBT2dHLGVBQWdCQyxRQUFrQixFQUFFQyxjQUFzQixFQUFFcEYsZUFBdUMsRUFBVTtRQUNsSCxNQUFNQyxVQUFVaE0sWUFBb0M7WUFDbEQwTixpQkFBaUI7WUFDakJDLGNBQWM7UUFDaEIsR0FBRzVCO1FBRUgsT0FBTyxJQUFJbkssTUFBT3dFLEVBQUVnTCxPQUFPLENBQUUsSUFBSSxDQUFDN0UsUUFBUSxDQUFDRCxHQUFHLENBQUV4QixDQUFBQSxVQUFXQSxRQUFRdUcsTUFBTSxDQUFFSCxVQUFVQyxnQkFBZ0JuRixRQUFRMEIsZUFBZSxFQUFFMUIsUUFBUTJCLFlBQVk7SUFDcEo7SUFFQTs7R0FFQyxHQUNELEFBQU8yRCxZQUFxQjtRQUMxQixJQUFLLElBQUksQ0FBQ0MsT0FBTyxLQUFLLE1BQU87WUFDM0IsTUFBTXRHLFNBQVNyTCxRQUFRME4sT0FBTyxDQUFDOUwsSUFBSTtZQUNuQzRFLEVBQUVDLElBQUksQ0FBRSxJQUFJLENBQUNrRyxRQUFRLEVBQUV6QixDQUFBQTtnQkFDckJHLE9BQU80RixhQUFhLENBQUUvRixRQUFRd0csU0FBUztZQUN6QztZQUNBLElBQUksQ0FBQ0MsT0FBTyxHQUFHdEc7UUFDakI7UUFDQSxPQUFPLElBQUksQ0FBQ3NHLE9BQU87SUFDckI7SUFFQSxJQUFXdEcsU0FBa0I7UUFBRSxPQUFPLElBQUksQ0FBQ3FHLFNBQVM7SUFBSTtJQUV4RDs7O0dBR0MsR0FDRCxBQUFPRSxpQkFBa0JmLFVBQXNCLEVBQVk7UUFFekQsK0dBQStHO1FBQy9HLGtDQUFrQztRQUNsQyxJQUFJZ0IsMEJBQTBCO1FBQzlCLElBQU0sSUFBSXZNLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNxSCxRQUFRLENBQUNYLE1BQU0sRUFBRTFHLElBQU07WUFDL0MsTUFBTTRGLFVBQVUsSUFBSSxDQUFDeUIsUUFBUSxDQUFFckgsRUFBRztZQUVsQywrR0FBK0c7WUFDL0csUUFBUTtZQUNSLElBQUs0RixRQUFRK0IsVUFBVSxNQUFNLENBQUMvQixRQUFRbUMsUUFBUSxJQUFLO2dCQUNqRHdFLDBCQUEwQjtnQkFDMUI7WUFDRjtZQUNBLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJNUcsUUFBUWdDLFFBQVEsQ0FBQ2xCLE1BQU0sRUFBRThGLElBQU07Z0JBQ2xELE1BQU1wTCxVQUFVd0UsUUFBUWdDLFFBQVEsQ0FBRTRFLEVBQUc7Z0JBQ3JDLElBQUssQ0FBQ3BMLFFBQVFtTCx1QkFBdUIsSUFBSztvQkFDeENBLDBCQUEwQjtvQkFDMUI7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsSUFBS0EseUJBQTBCO1lBQzdCLE9BQU8sSUFBSSxDQUFDeEcsTUFBTSxDQUFDMEcsT0FBTyxDQUFFbEIsV0FBV21CLFNBQVMsR0FBRztRQUNyRCxPQUNLO1lBQ0gsTUFBTTNHLFNBQVMsSUFBSSxDQUFDQSxNQUFNLENBQUN6SixJQUFJO1lBQy9CLElBQU0sSUFBSTBELElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNxSCxRQUFRLENBQUNYLE1BQU0sRUFBRTFHLElBQU07Z0JBQy9DLE1BQU1xSCxXQUFXLElBQUksQ0FBQ0EsUUFBUSxDQUFFckgsRUFBRyxDQUFDMEwsT0FBTyxDQUFFSDtnQkFDN0MsSUFBTSxJQUFJaUIsSUFBSSxHQUFHQSxJQUFJbkYsU0FBU1gsTUFBTSxFQUFFOEYsSUFBTTtvQkFDMUN6RyxPQUFPNEYsYUFBYSxDQUFFdEUsUUFBUSxDQUFFbUYsRUFBRyxDQUFDekcsTUFBTTtnQkFDNUM7WUFDRjtZQUNBLE9BQU9BO1FBQ1Q7SUFDRjtJQUVBOzs7Ozs7O0dBT0MsR0FDRCxBQUFPNEcseUJBQWdDO1FBQ3JDLE9BQU94UixNQUFNeVIsZUFBZSxDQUFFLElBQUk7SUFDcEM7SUFFT0MsdUJBQXdCNUUsTUFBZSxFQUFFc0QsVUFBdUIsRUFBWTtRQUNqRixNQUFNeEYsU0FBU3JMLFFBQVEwTixPQUFPLENBQUM5TCxJQUFJO1FBRW5DLE1BQU13TixjQUFjLElBQUksQ0FBQ3pDLFFBQVEsQ0FBQ1gsTUFBTTtRQUN4QyxJQUFNLElBQUkxRyxJQUFJLEdBQUdBLElBQUk4SixhQUFhOUosSUFBTTtZQUN0QyxNQUFNNEYsVUFBVSxJQUFJLENBQUN5QixRQUFRLENBQUVySCxFQUFHO1lBQ2xDK0YsT0FBTzRGLGFBQWEsQ0FBRS9GLFFBQVFpSCxzQkFBc0IsQ0FBRTVFO1FBQ3hEO1FBRUEsSUFBS3NELFlBQWE7WUFDaEJ4RixPQUFPNEYsYUFBYSxDQUFFLElBQUksQ0FBQ0wsZUFBZSxDQUFFQyxZQUFhc0Isc0JBQXNCLENBQUU1RTtRQUNuRjtRQUVBLE9BQU9sQztJQUNUO0lBRUE7Ozs7OztHQU1DLEdBQ0QsQUFBTytHLG1CQUFvQkMsVUFBa0IsRUFBVztRQUN0RCxNQUFNaFIsSUFBSSxJQUFJLENBQUNnSyxNQUFNLENBQUM2RSxJQUFJO1FBQzFCLE1BQU01TyxJQUFJLElBQUksQ0FBQytKLE1BQU0sQ0FBQzhFLElBQUk7UUFDMUIsTUFBTW5GLFFBQVEsSUFBSSxDQUFDSyxNQUFNLENBQUNMLEtBQUs7UUFDL0IsTUFBTUMsU0FBUyxJQUFJLENBQUNJLE1BQU0sQ0FBQ0osTUFBTTtRQUVqQyxNQUFNcUgsZ0JBQWdCdEgsUUFBUUM7UUFDOUIsSUFBSXdELFFBQVE7UUFDWixNQUFNcE0sUUFBUSxJQUFJbEMsUUFBUyxHQUFHO1FBQzlCLElBQU0sSUFBSW1GLElBQUksR0FBR0EsSUFBSStNLFlBQVkvTSxJQUFNO1lBQ3JDakQsTUFBTWhCLENBQUMsR0FBR0EsSUFBSUosaUJBQWlCK0o7WUFDL0IzSSxNQUFNZixDQUFDLEdBQUdBLElBQUlMLGlCQUFpQmdLO1lBQy9CLElBQUssSUFBSSxDQUFDc0QsYUFBYSxDQUFFbE0sUUFBVTtnQkFDakNvTTtZQUNGO1FBQ0Y7UUFDQSxPQUFPNkQsZ0JBQWdCN0QsUUFBUTREO0lBQ2pDO0lBRUE7Ozs7R0FJQyxHQUNELEFBQU9FLHdCQUFnQztRQUNyQyx1Q0FBdUM7UUFDdkMsT0FBT3JSLEtBQUtzUixHQUFHLENBQUVoTSxFQUFFaU0sR0FBRyxDQUFFLElBQUksQ0FBQzlGLFFBQVEsQ0FBQ0QsR0FBRyxDQUFFeEIsQ0FBQUEsVUFBVzFFLEVBQUVpTSxHQUFHLENBQUV2SCxRQUFRd0gsZUFBZSxHQUFHaEcsR0FBRyxDQUFFaEcsQ0FBQUEsVUFBV0EsUUFBUWlNLHFCQUFxQjtJQUN0STtJQUVBOzs7OztHQUtDLEdBQ0QsQUFBT0MsVUFBa0I7UUFDdkIsT0FBTyxJQUFJLENBQUNYLHNCQUFzQixHQUFHTSxxQkFBcUI7SUFDNUQ7SUFFQTs7Ozs7R0FLQyxHQUNELEFBQU9NLHVCQUF3QlIsVUFBa0IsRUFBWTtRQUMzRCxNQUFNaFIsSUFBSSxJQUFJLENBQUNnSyxNQUFNLENBQUM2RSxJQUFJO1FBQzFCLE1BQU01TyxJQUFJLElBQUksQ0FBQytKLE1BQU0sQ0FBQzhFLElBQUk7UUFDMUIsTUFBTW5GLFFBQVEsSUFBSSxDQUFDSyxNQUFNLENBQUNMLEtBQUs7UUFDL0IsTUFBTUMsU0FBUyxJQUFJLENBQUNJLE1BQU0sQ0FBQ0osTUFBTTtRQUVqQyxJQUFJd0QsUUFBUTtRQUNaLE1BQU1nRSxNQUFNLElBQUl0UyxRQUFTLEdBQUc7UUFDNUIsTUFBTWtDLFFBQVEsSUFBSWxDLFFBQVMsR0FBRztRQUM5QixJQUFNLElBQUltRixJQUFJLEdBQUdBLElBQUkrTSxZQUFZL00sSUFBTTtZQUNyQ2pELE1BQU1oQixDQUFDLEdBQUdBLElBQUlKLGlCQUFpQitKO1lBQy9CM0ksTUFBTWYsQ0FBQyxHQUFHQSxJQUFJTCxpQkFBaUJnSztZQUMvQixJQUFLLElBQUksQ0FBQ3NELGFBQWEsQ0FBRWxNLFFBQVU7Z0JBQ2pDb1EsSUFBSTFRLEdBQUcsQ0FBRU07Z0JBQ1RvTTtZQUNGO1FBQ0Y7UUFDQSxPQUFPZ0UsSUFBSTdJLGFBQWEsQ0FBRTZFO0lBQzVCO0lBRUE7O0dBRUMsR0FDRCxBQUFPcUUsaUJBQWtCelEsS0FBYyxFQUEyQjtRQUNoRSxPQUFPeEIsUUFBUWtTLDBCQUEwQixDQUFFdk0sRUFBRWdMLE9BQU8sQ0FBRSxJQUFJLENBQUM3RSxRQUFRLENBQUNELEdBQUcsQ0FBRXhCLENBQUFBLFVBQVdBLFFBQVE0SCxnQkFBZ0IsQ0FBRXpRO0lBQ2hIO0lBRUE7OztHQUdDLEdBQ0QsQUFBTzJRLGdCQUFpQjNRLEtBQWMsRUFBWTtRQUNoRCxPQUFPLElBQUksQ0FBQ3lRLGdCQUFnQixDQUFFelEsTUFBTyxDQUFFLEVBQUcsQ0FBQzRRLFlBQVk7SUFDekQ7SUFFQTs7OztHQUlDLEdBQ0QsQUFBT0MsbUJBQXlCO1FBQzlCLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUc7UUFFM0IsTUFBTS9ELGNBQWMsSUFBSSxDQUFDekMsUUFBUSxDQUFDWCxNQUFNO1FBQ3hDLElBQU0sSUFBSTFHLElBQUksR0FBR0EsSUFBSThKLGFBQWE5SixJQUFNO1lBQ3RDLElBQUksQ0FBQ3FILFFBQVEsQ0FBRXJILEVBQUcsQ0FBQzROLGdCQUFnQjtRQUNyQztRQUVBLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUc7UUFDM0IsSUFBSSxDQUFDQyxVQUFVO0lBQ2pCO0lBRU9DLFdBQW1CO1FBQ3hCLDBGQUEwRjtRQUMxRixPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDdEcsVUFBVSxHQUFHdUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztJQUMvRDtJQUVBOztnRkFFOEUsR0FFOUUsQUFBUUYsYUFBbUI7UUFDekI1USxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDMEcsVUFBVSxFQUFFO1FBRXBDLElBQUssQ0FBQyxJQUFJLENBQUNpSyxtQkFBbUIsRUFBRztZQUMvQixJQUFJLENBQUN4QixPQUFPLEdBQUc7WUFFZixJQUFJLENBQUN4SSwyQkFBMkI7UUFDbEM7SUFDRjtJQUVBOztHQUVDLEdBQ0QsQUFBUUEsOEJBQW9DO1FBQzFDLElBQUksQ0FBQ29LLGtCQUFrQixDQUFDQyxJQUFJO0lBQzlCO0lBRVE1UCxvQkFBcUI4QyxPQUFnQixFQUFTO1FBQ3BELElBQUksQ0FBQ2xELGNBQWMsR0FBR2lRLFVBQVUsQ0FBRS9NO1FBQ2xDLElBQUksQ0FBQzBNLFVBQVU7SUFDakI7SUFFQTs7R0FFQyxHQUNELEFBQVF2UCxPQUFReEIsS0FBYyxFQUFTO1FBQ3JDLElBQUssQ0FBQyxJQUFJLENBQUNpQixXQUFXLElBQUs7WUFDekIsSUFBSSxDQUFDTixVQUFVLENBQUUsSUFBSWxDO1lBQ3JCLElBQUksQ0FBQzBDLGNBQWMsR0FBR1AsUUFBUSxDQUFFWjtRQUNsQztJQUNGO0lBRUE7O0dBRUMsR0FDRCxBQUFRVyxXQUFZa0ksT0FBZ0IsRUFBUztRQUMzQyxJQUFJLENBQUN5QixRQUFRLENBQUN3RSxJQUFJLENBQUVqRztRQUVwQixtRkFBbUY7UUFDbkZBLFFBQVFxSSxrQkFBa0IsQ0FBQ0csV0FBVyxDQUFFLElBQUksQ0FBQ0MsbUJBQW1CO1FBRWhFLElBQUksQ0FBQ1AsVUFBVTtRQUVmLE9BQU8sSUFBSSxFQUFFLGlCQUFpQjtJQUNoQztJQUVBOztHQUVDLEdBQ0QsQUFBUTlQLGNBQXVCO1FBQzdCLE9BQU8sSUFBSSxDQUFDcUosUUFBUSxDQUFDWCxNQUFNLEdBQUc7SUFDaEM7SUFFQTs7R0FFQyxHQUNELEFBQVF4SSxpQkFBMEI7UUFDaENoQixVQUFVQSxPQUFRLElBQUksQ0FBQ2MsV0FBVyxJQUFJO1FBRXRDLE9BQU9rRCxFQUFFb04sSUFBSSxDQUFFLElBQUksQ0FBQ2pILFFBQVE7SUFDOUI7SUFFQTs7R0FFQyxHQUNELEFBQU9sSixlQUF3QjtRQUM3QmpCLFVBQVVBLE9BQVEsSUFBSSxDQUFDYyxXQUFXLElBQUk7UUFDdENkLFVBQVVBLE9BQVEsSUFBSSxDQUFDZ0IsY0FBYyxHQUFHQyxZQUFZLElBQUk7UUFDeEQsT0FBTyxJQUFJLENBQUNELGNBQWMsR0FBR0MsWUFBWTtJQUMzQztJQUVBOztHQUVDLEdBQ0QsQUFBUW9RLGlCQUFpQztRQUN2QyxJQUFLLENBQUMsSUFBSSxDQUFDdlEsV0FBVyxJQUFLO1lBQUUsT0FBTztRQUFNO1FBRTFDLE1BQU00SCxVQUFVLElBQUksQ0FBQzFILGNBQWM7UUFDbkMsSUFBSyxDQUFDMEgsUUFBUStCLFVBQVUsSUFBSztZQUFFLE9BQU87UUFBTTtRQUU1QyxPQUFPL0IsUUFBUTJJLGNBQWM7SUFDL0I7SUFFQTs7R0FFQyxHQUNELEFBQVExTixpQ0FBMEM7UUFDaEQsTUFBTTJOLFlBQVksSUFBSSxDQUFDclEsWUFBWTtRQUVuQyxJQUFLLElBQUksQ0FBQ3ZCLHlCQUF5QixFQUFHO1lBQ3BDLE9BQU80UixVQUFVL1EsSUFBSSxDQUFFK1EsVUFBVWhQLEtBQUssQ0FBRSxJQUFJLENBQUM1Qyx5QkFBeUI7UUFDeEUsT0FDSztZQUNILE9BQU80UjtRQUNUO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQVF4TSw2QkFBc0M7UUFDNUMsTUFBTXdNLFlBQVksSUFBSSxDQUFDclEsWUFBWTtRQUVuQyxJQUFLLElBQUksQ0FBQ3RCLHFCQUFxQixFQUFHO1lBQ2hDLE9BQU8yUixVQUFVL1EsSUFBSSxDQUFFK1EsVUFBVWhQLEtBQUssQ0FBRSxJQUFJLENBQUMzQyxxQkFBcUI7UUFDcEUsT0FDSztZQUNILE9BQU8yUjtRQUNUO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELEFBQVFoUixtQkFBNEI7UUFDbEMsSUFBSWlSLFNBQVM1VCxRQUFRNlQsSUFBSTtRQUV6QixJQUFLLElBQUksQ0FBQzFRLFdBQVcsSUFBSztZQUN4QixNQUFNNEgsVUFBVSxJQUFJLENBQUMxSCxjQUFjO1lBQ25DLElBQUswSCxRQUFRQyxNQUFNLENBQUNhLE1BQU0sRUFBRztnQkFDM0IrSCxTQUFTN0ksUUFBUXpILFlBQVk7WUFDL0I7UUFDRjtRQUVBLE9BQU9zUTtJQUNUO0lBRUE7O0dBRUMsR0FDRCxBQUFPRSxXQUFZQyxLQUFZLEVBQVU7UUFDdkMsT0FBT3pULE1BQU0wVCxZQUFZLENBQUUsSUFBSSxFQUFFRCxPQUFPelQsTUFBTTJULG9CQUFvQjtJQUNwRTtJQUVBOzs7R0FHQyxHQUNELEFBQU9DLGtCQUFtQkgsS0FBWSxFQUFVO1FBQzlDLE9BQU96VCxNQUFNMFQsWUFBWSxDQUFFLElBQUksRUFBRUQsT0FBT3pULE1BQU02VCwyQkFBMkI7SUFDM0U7SUFFQTs7O0dBR0MsR0FDRCxBQUFPQyxnQkFBaUJMLEtBQVksRUFBVTtRQUM1QyxPQUFPelQsTUFBTTBULFlBQVksQ0FBRSxJQUFJLEVBQUVELE9BQU96VCxNQUFNK1QseUJBQXlCO0lBQ3pFO0lBRUE7OztHQUdDLEdBQ0QsQUFBT0MsU0FBVVAsS0FBWSxFQUFVO1FBQ3JDLE9BQU96VCxNQUFNMFQsWUFBWSxDQUFFLElBQUksRUFBRUQsT0FBT3pULE1BQU1pVSxrQkFBa0I7SUFDbEU7SUFFQTs7OztHQUlDLEdBQ0QsQUFBT0MsVUFBV1QsS0FBWSxFQUFFOUgsT0FBMkYsRUFBVTtRQUNuSSxPQUFPM0wsTUFBTW1VLFNBQVMsQ0FBRVYsT0FBTyxJQUFJLEVBQUU5SDtJQUN2QztJQUVBOztHQUVDLEdBQ0QsQUFBT3lJLGFBQWMvRyxlQUF3QixFQUFFQyxZQUFxQixFQUFFRixTQUFrQixFQUFXO1FBQ2pHLElBQUk3QixTQUFTO1FBQ2IsSUFBTSxJQUFJMUcsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQ3FILFFBQVEsQ0FBQ1gsTUFBTSxFQUFFMUcsSUFBTTtZQUMvQzBHLFVBQVUsSUFBSSxDQUFDVyxRQUFRLENBQUVySCxFQUFHLENBQUN1UCxZQUFZLENBQUUvRyxpQkFBaUJDLGNBQWNGO1FBQzVFO1FBQ0EsT0FBTzdCO0lBQ1Q7SUFFQTs7R0FFQyxHQUNELEFBQU84SSxZQUE2QjtRQUNsQyxPQUFPO1lBQ0xDLE1BQU07WUFDTnBJLFVBQVUsSUFBSSxDQUFDQSxRQUFRLENBQUNELEdBQUcsQ0FBRXhCLENBQUFBLFVBQVdBLFFBQVE0SixTQUFTO1FBQzNEO0lBQ0Y7SUFFQTs7R0FFQyxHQUNELE9BQWNFLFlBQWFDLEdBQW9CLEVBQVU7UUFDdkR6UyxVQUFVQSxPQUFReVMsSUFBSUYsSUFBSSxLQUFLO1FBRS9CLE9BQU8sSUFBSS9TLE1BQU9pVCxJQUFJdEksUUFBUSxDQUFDRCxHQUFHLENBQUU1TCxRQUFRa1UsV0FBVztJQUN6RDtJQUVBOztHQUVDLEdBQ0QsT0FBY0UsVUFBVzdULENBQVMsRUFBRUMsQ0FBUyxFQUFFMEosS0FBYSxFQUFFQyxNQUFjLEVBQVU7UUFDcEYsT0FBTyxJQUFJakosUUFBUStJLElBQUksQ0FBRTFKLEdBQUdDLEdBQUcwSixPQUFPQztJQUN4QztJQUlBOztHQUVDLEdBQ0QsT0FBY00sVUFBV2xLLENBQVMsRUFBRUMsQ0FBUyxFQUFFMEosS0FBYSxFQUFFQyxNQUFjLEVBQUVPLElBQVksRUFBRUMsSUFBWSxFQUFVO1FBQ2hILE9BQU8sSUFBSXpKLFFBQVF1SixTQUFTLENBQUVsSyxHQUFHQyxHQUFHMEosT0FBT0MsUUFBUU8sTUFBTUM7SUFDM0Q7SUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JDLEdBQ0QsT0FBYzBKLDBCQUEyQjlULENBQVMsRUFBRUMsQ0FBUyxFQUFFMEosS0FBYSxFQUFFQyxNQUFjLEVBQUVtSyxXQUF5QyxFQUFVO1FBRS9JLDBFQUEwRTtRQUMxRSxJQUFJQyxnQkFBZ0JELGVBQWVBLFlBQVlFLE9BQU8sSUFBSTtRQUMxRCxJQUFJQyxpQkFBaUJILGVBQWVBLFlBQVlJLFFBQVEsSUFBSTtRQUM1RCxJQUFJQyxtQkFBbUJMLGVBQWVBLFlBQVlNLFVBQVUsSUFBSTtRQUNoRSxJQUFJQyxvQkFBb0JQLGVBQWVBLFlBQVlRLFdBQVcsSUFBSTtRQUVsRSxpQ0FBaUM7UUFDakNwVCxVQUFVQSxPQUFRQyxTQUFVcEIsSUFBSztRQUNqQ21CLFVBQVVBLE9BQVFDLFNBQVVuQixJQUFLO1FBQ2pDa0IsVUFBVUEsT0FBUXdJLFNBQVMsS0FBS3ZJLFNBQVV1SSxRQUFTO1FBQ25EeEksVUFBVUEsT0FBUXlJLFVBQVUsS0FBS3hJLFNBQVV3SSxTQUFVO1FBQ3JEekksVUFBVUEsT0FBUTZTLGlCQUFpQixLQUFLNVMsU0FBVTRTLGdCQUNoRDtRQUNGN1MsVUFBVUEsT0FBUStTLGtCQUFrQixLQUFLOVMsU0FBVThTLGlCQUNqRDtRQUNGL1MsVUFBVUEsT0FBUWlULG9CQUFvQixLQUFLaFQsU0FBVWdULG1CQUNuRDtRQUNGalQsVUFBVUEsT0FBUW1ULHFCQUFxQixLQUFLbFQsU0FBVWtULG9CQUNwRDtRQUVGLG9HQUFvRztRQUNwRyxvRUFBb0U7UUFDcEUsTUFBTUUsU0FBU1IsZ0JBQWdCRTtRQUMvQixJQUFLTSxTQUFTN0ssU0FBUzZLLFNBQVMsR0FBSTtZQUVsQ1IsZ0JBQWdCQSxnQkFBZ0JRLFNBQVM3SztZQUN6Q3VLLGlCQUFpQkEsaUJBQWlCTSxTQUFTN0s7UUFDN0M7UUFDQSxNQUFNOEssWUFBWUwsbUJBQW1CRTtRQUNyQyxJQUFLRyxZQUFZOUssU0FBUzhLLFlBQVksR0FBSTtZQUV4Q0wsbUJBQW1CQSxtQkFBbUJLLFlBQVk5SztZQUNsRDJLLG9CQUFvQkEsb0JBQW9CRyxZQUFZOUs7UUFDdEQ7UUFDQSxNQUFNK0ssVUFBVVYsZ0JBQWdCSTtRQUNoQyxJQUFLTSxVQUFVOUssVUFBVThLLFVBQVUsR0FBSTtZQUVyQ1YsZ0JBQWdCQSxnQkFBZ0JVLFVBQVU5SztZQUMxQ3dLLG1CQUFtQkEsbUJBQW1CTSxVQUFVOUs7UUFDbEQ7UUFDQSxNQUFNK0ssV0FBV1QsaUJBQWlCSTtRQUNsQyxJQUFLSyxXQUFXL0ssVUFBVStLLFdBQVcsR0FBSTtZQUN2Q1QsaUJBQWlCQSxpQkFBaUJTLFdBQVcvSztZQUM3QzBLLG9CQUFvQkEsb0JBQW9CSyxXQUFXL0s7UUFDckQ7UUFFQSw2Q0FBNkM7UUFDN0N6SSxVQUFVQSxPQUFRNlMsZ0JBQWdCRSxrQkFBa0J2SyxPQUFPO1FBQzNEeEksVUFBVUEsT0FBUWlULG1CQUFtQkUscUJBQXFCM0ssT0FBTztRQUNqRXhJLFVBQVVBLE9BQVE2UyxnQkFBZ0JJLG9CQUFvQnhLLFFBQVE7UUFDOUR6SSxVQUFVQSxPQUFRK1MsaUJBQWlCSSxxQkFBcUIxSyxRQUFRO1FBRWhFLE1BQU1pSixRQUFRLElBQUlsUztRQUNsQixNQUFNaVUsUUFBUTVVLElBQUkySjtRQUNsQixNQUFNa0wsU0FBUzVVLElBQUkySjtRQUVuQixrSEFBa0g7UUFDbEgsa0VBQWtFO1FBRWxFLElBQUswSyxvQkFBb0IsR0FBSTtZQUMzQnpCLE1BQU16TSxHQUFHLENBQUV3TyxRQUFRTixtQkFBbUJPLFNBQVNQLG1CQUFtQkEsbUJBQW1CLEdBQUd6VSxLQUFLMEosRUFBRSxHQUFHLEdBQUc7UUFDdkcsT0FDSztZQUNIc0osTUFBTTNSLE1BQU0sQ0FBRTBULE9BQU9DO1FBQ3ZCO1FBRUEsSUFBS1QsbUJBQW1CLEdBQUk7WUFDMUJ2QixNQUFNek0sR0FBRyxDQUFFcEcsSUFBSW9VLGtCQUFrQlMsU0FBU1Qsa0JBQWtCQSxrQkFBa0J2VSxLQUFLMEosRUFBRSxHQUFHLEdBQUcxSixLQUFLMEosRUFBRSxFQUFFO1FBQ3RHLE9BQ0s7WUFDSHNKLE1BQU1oUixNQUFNLENBQUU3QixHQUFHNlU7UUFDbkI7UUFFQSxJQUFLYixnQkFBZ0IsR0FBSTtZQUN2Qm5CLE1BQU16TSxHQUFHLENBQUVwRyxJQUFJZ1UsZUFBZS9ULElBQUkrVCxlQUFlQSxlQUFlblUsS0FBSzBKLEVBQUUsRUFBRSxJQUFJMUosS0FBSzBKLEVBQUUsR0FBRyxHQUFHO1FBQzVGLE9BQ0s7WUFDSHNKLE1BQU1oUixNQUFNLENBQUU3QixHQUFHQztRQUNuQjtRQUVBLElBQUtpVSxpQkFBaUIsR0FBSTtZQUN4QnJCLE1BQU16TSxHQUFHLENBQUV3TyxRQUFRVixnQkFBZ0JqVSxJQUFJaVUsZ0JBQWdCQSxnQkFBZ0IsSUFBSXJVLEtBQUswSixFQUFFLEdBQUcsR0FBRyxJQUFJMUosS0FBSzBKLEVBQUUsRUFBRTtRQUN2RyxPQUNLO1lBQ0hzSixNQUFNaFIsTUFBTSxDQUFFK1MsT0FBTzNVO1FBQ3ZCO1FBRUE0UyxNQUFNdEwsS0FBSztRQUVYLE9BQU9zTDtJQUNUO0lBRUE7O0dBRUMsR0FDRCxPQUFjaUMsc0JBQXVCOUssTUFBZSxFQUFFK0ssT0FBdUIsRUFBRUMsS0FBMEIsRUFBVTtRQUNqSCxNQUFNQyxlQUFlakwsT0FBT2tMLFdBQVcsQ0FBRUgsUUFBUUksSUFBSSxFQUFFSixRQUFRSyxHQUFHLEVBQUVMLFFBQVFILEtBQUssRUFBRUcsUUFBUUYsTUFBTTtRQUNqRyxPQUFPbFUsTUFBTW1ULHlCQUF5QixDQUFFbUIsYUFBYXBHLElBQUksRUFBRW9HLGFBQWFuRyxJQUFJLEVBQUVtRyxhQUFhdEwsS0FBSyxFQUFFc0wsYUFBYXJMLE1BQU0sRUFBRW9MO0lBQ3pIO0lBRUE7OztHQUdDLEdBQ0QsT0FBY3ZLLFFBQVNDLFFBQW1CLEVBQVU7UUFDbEQsT0FBTyxJQUFJL0osUUFBUThKLE9BQU8sQ0FBRUM7SUFDOUI7SUFFQTs7R0FFQyxHQUNELE9BQWNWLE9BQVFBLE1BQWUsRUFBVTtRQUM3QyxPQUFPLElBQUlySixRQUFRK0ksSUFBSSxDQUFFTSxPQUFPNkUsSUFBSSxFQUFFN0UsT0FBTzhFLElBQUksRUFBRTlFLE9BQU9pRixJQUFJLEdBQUdqRixPQUFPNkUsSUFBSSxFQUFFN0UsT0FBT2tGLElBQUksR0FBR2xGLE9BQU84RSxJQUFJO0lBQ3pHO0lBT0EsT0FBY3VHLFlBQWFDLENBQW1CLEVBQUVDLENBQW1CLEVBQUVDLENBQVUsRUFBRUMsQ0FBVSxFQUFVO1FBQ25HLElBQUssT0FBT0gsTUFBTSxVQUFXO1lBQzNCLE9BQU8sSUFBSTNVLFFBQVFPLE1BQU0sQ0FBRW9VLEdBQUdDLEdBQWMxVCxNQUFNLENBQUUyVCxHQUFJQztRQUMxRCxPQUNLO1lBQ0gsaUNBQWlDO1lBQ2pDLE9BQU8sSUFBSTlVLFFBQVFVLFdBQVcsQ0FBRWlVLEdBQUl4VCxXQUFXLENBQUV5VDtRQUNuRDtJQUNGO0lBRUE7Ozs7OztHQU1DLEdBQ0QsT0FBY0csZUFBZ0JDLEtBQWEsRUFBRXBQLE1BQWMsRUFBVTtRQUNuRSxNQUFNc00sUUFBUSxJQUFJbFM7UUFDbEJ3RSxFQUFFQyxJQUFJLENBQUVELEVBQUV5USxLQUFLLENBQUVELFFBQVM3SixDQUFBQTtZQUN4QixNQUFNOUssUUFBUWxDLFFBQVFpTyxXQUFXLENBQUV4RyxRQUFRLElBQUkxRyxLQUFLMEosRUFBRSxHQUFHdUMsSUFBSTZKO1lBQzNEN0osTUFBTSxJQUFNK0csTUFBTXhSLFdBQVcsQ0FBRUwsU0FBVTZSLE1BQU0vUSxXQUFXLENBQUVkO1FBQ2hFO1FBQ0EsT0FBTzZSLE1BQU10TCxLQUFLO0lBQ3BCO0lBU0EsT0FBY2lDLE9BQVE4TCxDQUFtQixFQUFFQyxDQUFVLEVBQUVDLENBQVUsRUFBVTtRQUN6RSxJQUFLRCxNQUFNMU8sV0FBWTtZQUNyQixpQ0FBaUM7WUFDakMsT0FBTyxJQUFJbEcsUUFBUTZJLE1BQU0sQ0FBRSxHQUFHLEdBQUc4TDtRQUNuQztRQUNBLHdHQUF3RztRQUN4RyxPQUFPLElBQUkzVSxRQUFRNkksTUFBTSxDQUFFOEwsR0FBR0MsR0FBR0M7SUFDbkM7SUFTQSxPQUFjL0wsUUFBUzZMLENBQW1CLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFQyxDQUFVLEVBQUVJLENBQVUsRUFBVTtRQUNoRyxpS0FBaUs7UUFDakssSUFBS0osTUFBTTVPLFdBQVk7WUFDckIsNENBQTRDO1lBQzVDLE9BQU8sSUFBSWxHLFFBQVE4SSxPQUFPLENBQUUsR0FBRyxHQUFHNkwsR0FBYUMsR0FBR0M7UUFDcEQ7UUFDQSx3R0FBd0c7UUFDeEcsT0FBTyxJQUFJN1UsUUFBUThJLE9BQU8sQ0FBRTZMLEdBQUdDLEdBQUdDLEdBQUdDLEdBQUdJO0lBQzFDO0lBWUEsT0FBY3pQLElBQUtrUCxDQUFtQixFQUFFQyxDQUFTLEVBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFFSSxDQUFvQixFQUFFQyxDQUFXLEVBQVU7UUFDbEgsd0dBQXdHO1FBQ3hHLE9BQU8sSUFBSW5WLFFBQVF5RixHQUFHLENBQUVrUCxHQUFHQyxHQUFHQyxHQUFHQyxHQUFHSSxHQUFHQztJQUN6QztJQUVBOztHQUVDLEdBQ0QsT0FBYzFKLE1BQU8ySixNQUFlLEVBQVU7UUFDNUMsT0FBTzNXLE1BQU00VyxZQUFZLENBQUVEO0lBQzdCO0lBRUE7O0dBRUMsR0FDRCxPQUFjbkksYUFBY21JLE1BQWUsRUFBVTtRQUNuRCxPQUFPM1csTUFBTTZXLG1CQUFtQixDQUFFRjtJQUNwQztJQUVBOztHQUVDLEdBQ0QsT0FBY0csSUFBS0gsTUFBZSxFQUFVO1FBQzFDLE9BQU8zVyxNQUFNK1csVUFBVSxDQUFFSjtJQUMzQjtJQUVBOztHQUVDLEdBQ0QsT0FBY2xLLFNBQVVBLFFBQW1CLEVBQUV1SyxNQUFnQixFQUFVO1FBQ3JFLElBQUtqVixRQUFTO1lBQ1osSUFBTSxJQUFJOEMsSUFBSSxHQUFHQSxJQUFJNEgsU0FBU2xCLE1BQU0sRUFBRTFHLElBQU07Z0JBQzFDOUMsT0FBUTBLLFFBQVEsQ0FBRTVILElBQUksRUFBRyxDQUFDNUIsR0FBRyxDQUFDZ1UsYUFBYSxDQUFFeEssUUFBUSxDQUFFNUgsRUFBRyxDQUFDL0IsS0FBSyxFQUFFLE9BQVE7WUFDNUU7UUFDRjtRQUVBLE9BQU8sSUFBSXZCLE1BQU87WUFBRSxJQUFJbEIsUUFBU29NLFVBQVVoRixXQUFXLENBQUMsQ0FBQ3VQO1NBQVU7SUFDcEU7SUFsMkRBOztHQUVDLEdBQ0QsWUFBb0I5SyxRQUE2QixFQUFFdEIsTUFBZ0IsQ0FBRztRQXpCdEUsNkZBQTZGO2FBQzdFc0IsV0FBc0IsRUFBRTtRQUt4QyxtRkFBbUY7YUFDM0V3RyxzQkFBc0I7UUFFOUIsbUhBQW1IO1FBQ25ILG9CQUFvQjthQUNaakssYUFBYTthQUVMcUsscUJBQWtDLElBQUl4VDtRQUl0RCw2RUFBNkU7UUFDN0UsaURBQWlEO2FBQ3pDbUMsNEJBQTRDO2FBQzVDQyx3QkFBd0M7UUFPOUMsSUFBSSxDQUFDd1AsT0FBTyxHQUFHdEcsU0FBU0EsT0FBT3pKLElBQUksS0FBSztRQUV4QyxJQUFJLENBQUNLLGtCQUFrQjtRQUV2QixJQUFJLENBQUMwUixtQkFBbUIsR0FBRyxJQUFJLENBQUNQLFVBQVUsQ0FBQ3VFLElBQUksQ0FBRSxJQUFJO1FBRXJELHVEQUF1RDtRQUN2RCxJQUFLLE9BQU9oTCxhQUFhLFVBQVc7WUFDbEMsdUJBQXVCO1lBQ3ZCLElBQU0sSUFBSXJILElBQUksR0FBR0EsSUFBSXFILFNBQVNYLE1BQU0sRUFBRTFHLElBQU07Z0JBQzFDLElBQUksQ0FBQ3RDLFVBQVUsQ0FBRTJKLFFBQVEsQ0FBRXJILEVBQUc7WUFDaEM7UUFDRjtRQUVBLElBQUtxSCxZQUFZLE9BQU9BLGFBQWEsVUFBVztZQUM5QyxxQkFBcUI7WUFDckJuRyxFQUFFQyxJQUFJLENBQUV6RixRQUFRNFcsS0FBSyxDQUFFakwsV0FBWSxDQUFFa0w7Z0JBQ25DclYsVUFBVUEsT0FBUVIsTUFBTThWLFNBQVMsQ0FBRUQsS0FBS0UsR0FBRyxDQUFFLEtBQUs3UCxXQUFXLENBQUMsT0FBTyxFQUFFMlAsS0FBS0UsR0FBRyxDQUFDLCtCQUErQixDQUFDO2dCQUVoSCxrSEFBa0g7Z0JBQ2xILElBQUksQ0FBRUYsS0FBS0UsR0FBRyxDQUFFLENBQUNDLEtBQUssQ0FBRSxJQUFJLEVBQUVILEtBQUtJLElBQUksR0FBSSxvQ0FBb0M7WUFDakY7UUFDRjtRQUVBLDhEQUE4RDtRQUM5RCxJQUFJLENBQUM3RSxVQUFVO0lBQ2pCO0FBbzBERjtBQTMzRE1wUixNQXduRFUrSSxPQUFPL0ksTUFBTWtULFNBQVM7QUF4bkRoQ2xULE1BaW9EVWtXLGlCQUFpQmxXLE1BQU11SixTQUFTO0FBNFBoRDdLLEtBQUt5WCxRQUFRLENBQUUsU0FBU25XO0FBRXhCLGVBQWVBLE1BQU0ifQ==