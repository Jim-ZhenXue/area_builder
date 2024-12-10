// Copyright 2013-2024, University of Colorado Boulder
/**
 * A Canvas-style stateful (mutable) subpath, which tracks segments in addition to the points.
 *
 * See http://www.w3.org/TR/2dcontext/#concept-path
 * for the path / subpath Canvas concept.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Arc, kite, Line, LineStyles, Segment } from '../imports.js';
let Subpath = class Subpath {
    /**
   * Returns the bounds of this subpath. It is the bounding-box union of the bounds of each segment contained.
   */ getBounds() {
        if (this._bounds === null) {
            const bounds = Bounds2.NOTHING.copy();
            _.each(this.segments, (segment)=>{
                bounds.includeBounds(segment.getBounds());
            });
            this._bounds = bounds;
        }
        return this._bounds;
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Returns the (sometimes approximate) arc length of the subpath.
   */ getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
        let length = 0;
        for(let i = 0; i < this.segments.length; i++){
            length += this.segments[i].getArcLength(distanceEpsilon, curveEpsilon, maxLevels);
        }
        return length;
    }
    /**
   * Returns an immutable copy of this subpath
   */ copy() {
        return new Subpath(this.segments.slice(0), this.points.slice(0), this.closed);
    }
    /**
   * Invalidates all segments (then ourself), since some points in segments may have been changed.
   */ invalidatePoints() {
        this._invalidatingPoints = true;
        const numSegments = this.segments.length;
        for(let i = 0; i < numSegments; i++){
            this.segments[i].invalidate();
        }
        this._invalidatingPoints = false;
        this.invalidate();
    }
    /**
   * Trigger invalidation (usually for our Shape)
   * (kite-internal)
   */ invalidate() {
        if (!this._invalidatingPoints) {
            this._bounds = null;
            this._strokedSubpathsComputed = false;
            this.invalidatedEmitter.emit();
        }
    }
    /**
   * Adds a point to this subpath
   */ addPoint(point) {
        this.points.push(point);
        return this; // allow chaining
    }
    /**
   * Adds a segment directly
   *
   * CAUTION: REALLY! Make sure we invalidate() after this is called
   */ addSegmentDirectly(segment) {
        assert && assert(segment.start.isFinite(), 'Segment start is infinite');
        assert && assert(segment.end.isFinite(), 'Segment end is infinite');
        assert && assert(segment.startTangent.isFinite(), 'Segment startTangent is infinite');
        assert && assert(segment.endTangent.isFinite(), 'Segment endTangent is infinite');
        assert && assert(segment.bounds.isEmpty() || segment.bounds.isFinite(), 'Segment bounds is infinite and non-empty');
        this.segments.push(segment);
        // Hook up an invalidation listener, so if this segment is invalidated, it will invalidate our subpath!
        // NOTE: if we add removal of segments, we'll need to remove these listeners, or we'll leak!
        segment.invalidationEmitter.addListener(this._invalidateListener);
        return this; // allow chaining
    }
    /**
   * Adds a segment to this subpath
   */ addSegment(segment) {
        const nondegenerateSegments = segment.getNondegenerateSegments();
        const numNondegenerateSegments = nondegenerateSegments.length;
        for(let i = 0; i < numNondegenerateSegments; i++){
            this.addSegmentDirectly(segment);
        }
        this.invalidate(); // need to invalidate after addSegmentDirectly
        return this; // allow chaining
    }
    /**
   * Adds a line segment from the start to end (if non-zero length) and marks the subpath as closed.
   * NOTE: normally you just want to mark the subpath as closed, and not generate the closing segment this way?
   */ addClosingSegment() {
        if (this.hasClosingSegment()) {
            const closingSegment = this.getClosingSegment();
            this.addSegmentDirectly(closingSegment);
            this.invalidate(); // need to invalidate after addSegmentDirectly
            this.addPoint(this.getFirstPoint());
            this.closed = true;
        }
    }
    /**
   * Sets this subpath to be a closed path
   */ close() {
        this.closed = true;
        // If needed, add a connecting "closing" segment
        this.addClosingSegment();
    }
    /**
   * Returns the numbers of points in this subpath
   *
   * TODO: This is a confusing name! It should be getNumPoints() or something https://github.com/phetsims/kite/issues/76
   */ getLength() {
        return this.points.length;
    }
    /**
   * Returns the first point of this subpath
   */ getFirstPoint() {
        assert && assert(this.points.length);
        return _.first(this.points);
    }
    /**
   * Returns the last point of this subpath
   */ getLastPoint() {
        assert && assert(this.points.length);
        return _.last(this.points);
    }
    /**
   * Returns the first segment of this subpath
   */ getFirstSegment() {
        assert && assert(this.segments.length);
        return _.first(this.segments);
    }
    /**
   * Returns the last segment of this subpath
   */ getLastSegment() {
        assert && assert(this.segments.length);
        return _.last(this.segments);
    }
    /**
   * Returns segments that include the "filled" area, which may include an extra closing segment if necessary.
   */ getFillSegments() {
        const segments = this.segments.slice();
        if (this.hasClosingSegment()) {
            segments.push(this.getClosingSegment());
        }
        return segments;
    }
    /**
   * Determines if this subpath is drawable, i.e. if it contains asny segments
   */ isDrawable() {
        return this.segments.length > 0;
    }
    /**
   * Determines if this subpath is a closed path, i.e. if the flag is set to closed
   */ isClosed() {
        return this.closed;
    }
    /**
   * Determines if this subpath is a closed path, i.e. if it has a closed segment
   */ hasClosingSegment() {
        return !this.getFirstPoint().equalsEpsilon(this.getLastPoint(), 0.000000001);
    }
    /**
   * Returns a line that would close this subpath
   */ getClosingSegment() {
        assert && assert(this.hasClosingSegment(), 'Implicit closing segment unnecessary on a fully closed path');
        return new Line(this.getLastPoint(), this.getFirstPoint());
    }
    /**
   * Returns an array of potential closest points on the subpath to the given point.
   */ getClosestPoints(point) {
        return Segment.filterClosestToPointResult(_.flatten(this.segments.map((segment)=>segment.getClosestPoints(point))));
    }
    /**
   * Draws the segment to the 2D Canvas context, assuming the context's current location is already at the start point
   */ writeToContext(context) {
        if (this.isDrawable()) {
            const startPoint = this.getFirstSegment().start;
            context.moveTo(startPoint.x, startPoint.y); // the segments assume the current context position is at their start
            let len = this.segments.length;
            // Omit an ending line segment if our path is closed.
            // see https://github.com/phetsims/ph-scale/issues/83#issuecomment-512663949
            if (this.closed && len >= 2 && this.segments[len - 1] instanceof Line) {
                len--;
            }
            for(let i = 0; i < len; i++){
                this.segments[i].writeToContext(context);
            }
            if (this.closed) {
                context.closePath();
            }
        }
    }
    /**
   * Converts this subpath to a new subpath made of many line segments (approximating the current subpath)
   */ toPiecewiseLinear(options) {
        assert && assert(!options.pointMap, 'For use with pointMap, please use nonlinearTransformed');
        return new Subpath(_.flatten(_.map(this.segments, (segment)=>segment.toPiecewiseLinearSegments(options))), undefined, this.closed);
    }
    /**
   * Returns a copy of this Subpath transformed with the given matrix.
   */ transformed(matrix) {
        return new Subpath(_.map(this.segments, (segment)=>segment.transformed(matrix)), _.map(this.points, (point)=>matrix.timesVector2(point)), this.closed);
    }
    /**
   * Converts this subpath to a new subpath made of many line segments (approximating the current subpath) with the
   * transformation applied.
   */ nonlinearTransformed(options) {
        return new Subpath(_.flatten(_.map(this.segments, (segment)=>{
            // check for this segment's support for the specific transform or discretization being applied
            // @ts-expect-error We don't need it to exist on segments, but we do want it to exist on some segments
            if (options.methodName && segment[options.methodName]) {
                // @ts-expect-error We don't need it to exist on segments, but we do want it to exist on some segments
                return segment[options.methodName](options);
            } else {
                return segment.toPiecewiseLinearSegments(options);
            }
        })), undefined, this.closed);
    }
    /**
   * Returns the bounds of this subpath when transform by a matrix.
   */ getBoundsWithTransform(matrix) {
        const bounds = Bounds2.NOTHING.copy();
        const numSegments = this.segments.length;
        for(let i = 0; i < numSegments; i++){
            bounds.includeBounds(this.segments[i].getBoundsWithTransform(matrix));
        }
        return bounds;
    }
    /**
   * Returns a subpath that is offset from this subpath by a distance
   *
   * TODO: Resolve the bug with the inside-line-join overlap. We have the intersection handling now (potentially) https://github.com/phetsims/kite/issues/76
   */ offset(distance) {
        if (!this.isDrawable()) {
            return new Subpath([], undefined, this.closed);
        }
        if (distance === 0) {
            return new Subpath(this.segments.slice(), undefined, this.closed);
        }
        let i;
        const regularSegments = this.segments.slice();
        const offsets = [];
        for(i = 0; i < regularSegments.length; i++){
            offsets.push(regularSegments[i].strokeLeft(2 * distance));
        }
        let segments = [];
        for(i = 0; i < regularSegments.length; i++){
            if (this.closed || i > 0) {
                const previousI = (i > 0 ? i : regularSegments.length) - 1;
                const center = regularSegments[i].start;
                const fromTangent = regularSegments[previousI].endTangent;
                const toTangent = regularSegments[i].startTangent;
                const startAngle = fromTangent.perpendicular.negated().times(distance).angle;
                const endAngle = toTangent.perpendicular.negated().times(distance).angle;
                const anticlockwise = fromTangent.perpendicular.dot(toTangent) > 0;
                segments.push(new Arc(center, Math.abs(distance), startAngle, endAngle, anticlockwise));
            }
            segments = segments.concat(offsets[i]);
        }
        return new Subpath(segments, undefined, this.closed);
    }
    /**
   * Returns an array of subpaths (one if open, two if closed) that represent a stroked copy of this subpath.
   */ stroked(lineStyles) {
        // non-drawable subpaths convert to empty subpaths
        if (!this.isDrawable()) {
            return [];
        }
        if (lineStyles === undefined) {
            lineStyles = new LineStyles();
        }
        // return a cached version if possible
        assert && assert(!this._strokedSubpathsComputed || this._strokedStyles && this._strokedSubpaths);
        if (this._strokedSubpathsComputed && this._strokedStyles.equals(lineStyles)) {
            return this._strokedSubpaths;
        }
        const lineWidth = lineStyles.lineWidth;
        let i;
        let leftSegments = [];
        let rightSegments = [];
        const firstSegment = this.getFirstSegment();
        const lastSegment = this.getLastSegment();
        const appendLeftSegments = (segments)=>{
            leftSegments = leftSegments.concat(segments);
        };
        const appendRightSegments = (segments)=>{
            rightSegments = rightSegments.concat(segments);
        };
        // we don't need to insert an implicit closing segment if the start and end points are the same
        const alreadyClosed = lastSegment.end.equals(firstSegment.start);
        // if there is an implicit closing segment
        const closingSegment = alreadyClosed ? null : new Line(this.segments[this.segments.length - 1].end, this.segments[0].start);
        // stroke the logical "left" side of our path
        for(i = 0; i < this.segments.length; i++){
            if (i > 0) {
                appendLeftSegments(lineStyles.leftJoin(this.segments[i].start, this.segments[i - 1].endTangent, this.segments[i].startTangent));
            }
            appendLeftSegments(this.segments[i].strokeLeft(lineWidth));
        }
        // stroke the logical "right" side of our path
        for(i = this.segments.length - 1; i >= 0; i--){
            if (i < this.segments.length - 1) {
                appendRightSegments(lineStyles.rightJoin(this.segments[i].end, this.segments[i].endTangent, this.segments[i + 1].startTangent));
            }
            appendRightSegments(this.segments[i].strokeRight(lineWidth));
        }
        let subpaths;
        if (this.closed) {
            if (alreadyClosed) {
                // add the joins between the start and end
                appendLeftSegments(lineStyles.leftJoin(lastSegment.end, lastSegment.endTangent, firstSegment.startTangent));
                appendRightSegments(lineStyles.rightJoin(lastSegment.end, lastSegment.endTangent, firstSegment.startTangent));
            } else {
                // logical "left" stroke on the implicit closing segment
                appendLeftSegments(lineStyles.leftJoin(closingSegment.start, lastSegment.endTangent, closingSegment.startTangent));
                appendLeftSegments(closingSegment.strokeLeft(lineWidth));
                appendLeftSegments(lineStyles.leftJoin(closingSegment.end, closingSegment.endTangent, firstSegment.startTangent));
                // logical "right" stroke on the implicit closing segment
                appendRightSegments(lineStyles.rightJoin(closingSegment.end, closingSegment.endTangent, firstSegment.startTangent));
                appendRightSegments(closingSegment.strokeRight(lineWidth));
                appendRightSegments(lineStyles.rightJoin(closingSegment.start, lastSegment.endTangent, closingSegment.startTangent));
            }
            subpaths = [
                new Subpath(leftSegments, undefined, true),
                new Subpath(rightSegments, undefined, true)
            ];
        } else {
            subpaths = [
                new Subpath(leftSegments.concat(lineStyles.cap(lastSegment.end, lastSegment.endTangent)).concat(rightSegments).concat(lineStyles.cap(firstSegment.start, firstSegment.startTangent.negated())), undefined, true)
            ];
        }
        this._strokedSubpaths = subpaths;
        this._strokedSubpathsComputed = true;
        this._strokedStyles = lineStyles.copy(); // shallow copy, since we consider linestyles to be mutable
        return subpaths;
    }
    /**
   * Returns a copy of this subpath with the dash "holes" removed (has many subpaths usually).
   *
   * @param lineDash
   * @param lineDashOffset
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared) deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change between segments
   */ dashed(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon) {
        // Combine segment arrays (collapsing the two-most-adjacent arrays into one, with concatenation)
        const combineSegmentArrays = (left, right)=>{
            const combined = left[left.length - 1].concat(right[0]);
            const result = left.slice(0, left.length - 1).concat([
                combined
            ]).concat(right.slice(1));
            assert && assert(result.length === left.length + right.length - 1);
            return result;
        };
        // Whether two dash items (return type from getDashValues()) can be combined together to have their end segments
        // combined with combineSegmentArrays.
        const canBeCombined = (leftItem, rightItem)=>{
            if (!leftItem.hasRightFilled || !rightItem.hasLeftFilled) {
                return false;
            }
            const leftSegment = _.last(_.last(leftItem.segmentArrays));
            const rightSegment = rightItem.segmentArrays[0][0];
            return leftSegment.end.distance(rightSegment.start) < 1e-5;
        };
        // Compute all the dashes
        const dashItems = [];
        for(let i = 0; i < this.segments.length; i++){
            const segment = this.segments[i];
            const dashItem = segment.getDashValues(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon);
            dashItems.push(dashItem);
            // We moved forward in the offset by this much
            lineDashOffset += dashItem.arcLength;
            const values = [
                0
            ].concat(dashItem.values).concat([
                1
            ]);
            const initiallyInside = dashItem.initiallyInside;
            // Mark whether the ends are filled, so adjacent filled ends can be combined
            dashItem.hasLeftFilled = initiallyInside;
            dashItem.hasRightFilled = values.length % 2 === 0 ? initiallyInside : !initiallyInside;
            // {Array.<Array.<Segment>>}, where each contained array will be turned into a subpath at the end.
            dashItem.segmentArrays = [];
            for(let j = initiallyInside ? 0 : 1; j < values.length - 1; j += 2){
                if (values[j] !== values[j + 1]) {
                    dashItem.segmentArrays.push([
                        segment.slice(values[j], values[j + 1])
                    ]);
                }
            }
        }
        // Combine adjacent which both are filled on the middle
        for(let i = dashItems.length - 1; i >= 1; i--){
            const leftItem = dashItems[i - 1];
            const rightItem = dashItems[i];
            if (canBeCombined(leftItem, rightItem)) {
                dashItems.splice(i - 1, 2, {
                    segmentArrays: combineSegmentArrays(leftItem.segmentArrays, rightItem.segmentArrays),
                    hasLeftFilled: leftItem.hasLeftFilled,
                    hasRightFilled: rightItem.hasRightFilled
                });
            }
        }
        // Combine adjacent start/end if applicable
        if (dashItems.length > 1 && canBeCombined(dashItems[dashItems.length - 1], dashItems[0])) {
            const leftItem = dashItems.pop();
            const rightItem = dashItems.shift();
            dashItems.push({
                segmentArrays: combineSegmentArrays(leftItem.segmentArrays, rightItem.segmentArrays),
                hasLeftFilled: leftItem.hasLeftFilled,
                hasRightFilled: rightItem.hasRightFilled
            });
        }
        // Determine if we are closed (have only one subpath)
        if (this.closed && dashItems.length === 1 && dashItems[0].segmentArrays.length === 1 && dashItems[0].hasLeftFilled && dashItems[0].hasRightFilled) {
            return [
                new Subpath(dashItems[0].segmentArrays[0], undefined, true)
            ];
        }
        // Convert to subpaths
        return _.flatten(dashItems.map((dashItem)=>dashItem.segmentArrays)).map((segments)=>new Subpath(segments));
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   */ serialize() {
        return {
            type: 'Subpath',
            segments: this.segments.map((segment)=>segment.serialize()),
            points: this.points.map((point)=>({
                    x: point.x,
                    y: point.y
                })),
            closed: this.closed
        };
    }
    /**
   * Returns a Subpath from the serialized representation.
   */ static deserialize(obj) {
        assert && assert(obj.type === 'Subpath');
        return new Subpath(obj.segments.map(Segment.deserialize), obj.points.map((pt)=>new Vector2(pt.x, pt.y)), obj.closed);
    }
    /**
   * NOTE: No arguments required (they are usually used for copy() usage or creation with new segments)
   */ constructor(segments, points, closed){
        this.segments = [];
        this.invalidatedEmitter = new TinyEmitter();
        // If non-null, the bounds of the subpath
        this._bounds = null;
        // cached stroked shape (so hit testing can be done quickly on stroked shapes)
        this._strokedSubpaths = null;
        this._strokedSubpathsComputed = false;
        this._strokedStyles = null;
        // So we can invalidate all of the points without firing invalidation tons of times
        this._invalidatingPoints = false;
        // recombine points if necessary, based off of start points of segments + the end point of the last segment
        this.points = points || (segments && segments.length ? _.map(segments, (segment)=>segment.start).concat(segments[segments.length - 1].end) : []);
        this.closed = !!closed;
        this._invalidateListener = this.invalidate.bind(this);
        // Add all segments directly (hooks up invalidation listeners properly)
        if (segments) {
            for(let i = 0; i < segments.length; i++){
                _.each(segments[i].getNondegenerateSegments(), (segment)=>{
                    this.addSegmentDirectly(segment);
                });
            }
        }
    }
};
kite.register('Subpath', Subpath);
export default Subpath;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9TdWJwYXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgQ2FudmFzLXN0eWxlIHN0YXRlZnVsIChtdXRhYmxlKSBzdWJwYXRoLCB3aGljaCB0cmFja3Mgc2VnbWVudHMgaW4gYWRkaXRpb24gdG8gdGhlIHBvaW50cy5cbiAqXG4gKiBTZWUgaHR0cDovL3d3dy53My5vcmcvVFIvMmRjb250ZXh0LyNjb25jZXB0LXBhdGhcbiAqIGZvciB0aGUgcGF0aCAvIHN1YnBhdGggQ2FudmFzIGNvbmNlcHQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IEFyYywgQ2xvc2VzdFRvUG9pbnRSZXN1bHQsIERhc2hWYWx1ZXMsIGtpdGUsIExpbmUsIExpbmVTdHlsZXMsIFBpZWNld2lzZUxpbmVhck9wdGlvbnMsIFNlZ21lbnQsIFNlcmlhbGl6ZWRTZWdtZW50IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgRGFzaEl0ZW0gPSBEYXNoVmFsdWVzICYge1xuICBoYXNMZWZ0RmlsbGVkOiBib29sZWFuO1xuICBoYXNSaWdodEZpbGxlZDogYm9vbGVhbjtcblxuICAvLyB3aGVyZSBlYWNoIGNvbnRhaW5lZCBhcnJheSB3aWxsIGJlIHR1cm5lZCBpbnRvIGEgc3VicGF0aCBhdCB0aGUgZW5kLlxuICBzZWdtZW50QXJyYXlzOiBTZWdtZW50W11bXTtcbn07XG5cbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRTdWJwYXRoID0ge1xuICB0eXBlOiAnU3VicGF0aCc7XG4gIHNlZ21lbnRzOiBTZXJpYWxpemVkU2VnbWVudFtdO1xuICBwb2ludHM6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfVtdO1xuICBjbG9zZWQ6IGJvb2xlYW47XG59O1xuXG5jbGFzcyBTdWJwYXRoIHtcblxuICBwdWJsaWMgc2VnbWVudHM6IFNlZ21lbnRbXSA9IFtdO1xuICBwdWJsaWMgcG9pbnRzOiBWZWN0b3IyW107XG4gIHB1YmxpYyBjbG9zZWQ6IGJvb2xlYW47XG5cbiAgcHVibGljIHJlYWRvbmx5IGludmFsaWRhdGVkRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIElmIG5vbi1udWxsLCB0aGUgYm91bmRzIG9mIHRoZSBzdWJwYXRoXG4gIHB1YmxpYyBfYm91bmRzOiBCb3VuZHMyIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gY2FjaGVkIHN0cm9rZWQgc2hhcGUgKHNvIGhpdCB0ZXN0aW5nIGNhbiBiZSBkb25lIHF1aWNrbHkgb24gc3Ryb2tlZCBzaGFwZXMpXG4gIHByaXZhdGUgX3N0cm9rZWRTdWJwYXRoczogU3VicGF0aFtdIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkID0gZmFsc2U7XG4gIHByaXZhdGUgX3N0cm9rZWRTdHlsZXM6IExpbmVTdHlsZXMgfCBudWxsID0gbnVsbDtcblxuICAvLyBTbyB3ZSBjYW4gaW52YWxpZGF0ZSBhbGwgb2YgdGhlIHBvaW50cyB3aXRob3V0IGZpcmluZyBpbnZhbGlkYXRpb24gdG9ucyBvZiB0aW1lc1xuICBwcml2YXRlIF9pbnZhbGlkYXRpbmdQb2ludHMgPSBmYWxzZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9pbnZhbGlkYXRlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIE5PVEU6IE5vIGFyZ3VtZW50cyByZXF1aXJlZCAodGhleSBhcmUgdXN1YWxseSB1c2VkIGZvciBjb3B5KCkgdXNhZ2Ugb3IgY3JlYXRpb24gd2l0aCBuZXcgc2VnbWVudHMpXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHNlZ21lbnRzPzogU2VnbWVudFtdLCBwb2ludHM/OiBWZWN0b3IyW10sIGNsb3NlZD86IGJvb2xlYW4gKSB7XG4gICAgLy8gcmVjb21iaW5lIHBvaW50cyBpZiBuZWNlc3NhcnksIGJhc2VkIG9mZiBvZiBzdGFydCBwb2ludHMgb2Ygc2VnbWVudHMgKyB0aGUgZW5kIHBvaW50IG9mIHRoZSBsYXN0IHNlZ21lbnRcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cyB8fCAoICggc2VnbWVudHMgJiYgc2VnbWVudHMubGVuZ3RoICkgPyBfLm1hcCggc2VnbWVudHMsIHNlZ21lbnQgPT4gc2VnbWVudC5zdGFydCApLmNvbmNhdCggc2VnbWVudHNbIHNlZ21lbnRzLmxlbmd0aCAtIDEgXS5lbmQgKSA6IFtdICk7XG5cbiAgICB0aGlzLmNsb3NlZCA9ICEhY2xvc2VkO1xuXG4gICAgdGhpcy5faW52YWxpZGF0ZUxpc3RlbmVyID0gdGhpcy5pbnZhbGlkYXRlLmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIEFkZCBhbGwgc2VnbWVudHMgZGlyZWN0bHkgKGhvb2tzIHVwIGludmFsaWRhdGlvbiBsaXN0ZW5lcnMgcHJvcGVybHkpXG4gICAgaWYgKCBzZWdtZW50cyApIHtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBfLmVhY2goIHNlZ21lbnRzWyBpIF0uZ2V0Tm9uZGVnZW5lcmF0ZVNlZ21lbnRzKCksIHNlZ21lbnQgPT4ge1xuICAgICAgICAgIHRoaXMuYWRkU2VnbWVudERpcmVjdGx5KCBzZWdtZW50ICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIG9mIHRoaXMgc3VicGF0aC4gSXQgaXMgdGhlIGJvdW5kaW5nLWJveCB1bmlvbiBvZiB0aGUgYm91bmRzIG9mIGVhY2ggc2VnbWVudCBjb250YWluZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xuICAgIGlmICggdGhpcy5fYm91bmRzID09PSBudWxsICkge1xuICAgICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICAgIF8uZWFjaCggdGhpcy5zZWdtZW50cywgc2VnbWVudCA9PiB7XG4gICAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBzZWdtZW50LmdldEJvdW5kcygpICk7XG4gICAgICB9ICk7XG4gICAgICB0aGlzLl9ib3VuZHMgPSBib3VuZHM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ib3VuZHM7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgKHNvbWV0aW1lcyBhcHByb3hpbWF0ZSkgYXJjIGxlbmd0aCBvZiB0aGUgc3VicGF0aC5cbiAgICovXG4gIHB1YmxpYyBnZXRBcmNMZW5ndGgoIGRpc3RhbmNlRXBzaWxvbj86IG51bWJlciwgY3VydmVFcHNpbG9uPzogbnVtYmVyLCBtYXhMZXZlbHM/OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBsZXQgbGVuZ3RoID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNlZ21lbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGVuZ3RoICs9IHRoaXMuc2VnbWVudHNbIGkgXS5nZXRBcmNMZW5ndGgoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBtYXhMZXZlbHMgKTtcbiAgICB9XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGltbXV0YWJsZSBjb3B5IG9mIHRoaXMgc3VicGF0aFxuICAgKi9cbiAgcHVibGljIGNvcHkoKTogU3VicGF0aCB7XG4gICAgcmV0dXJuIG5ldyBTdWJwYXRoKCB0aGlzLnNlZ21lbnRzLnNsaWNlKCAwICksIHRoaXMucG9pbnRzLnNsaWNlKCAwICksIHRoaXMuY2xvc2VkICk7XG4gIH1cblxuICAvKipcbiAgICogSW52YWxpZGF0ZXMgYWxsIHNlZ21lbnRzICh0aGVuIG91cnNlbGYpLCBzaW5jZSBzb21lIHBvaW50cyBpbiBzZWdtZW50cyBtYXkgaGF2ZSBiZWVuIGNoYW5nZWQuXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZVBvaW50cygpOiB2b2lkIHtcbiAgICB0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgPSB0cnVlO1xuXG4gICAgY29uc3QgbnVtU2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TZWdtZW50czsgaSsrICkge1xuICAgICAgdGhpcy5zZWdtZW50c1sgaSBdLmludmFsaWRhdGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pbnZhbGlkYXRpbmdQb2ludHMgPSBmYWxzZTtcbiAgICB0aGlzLmludmFsaWRhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGludmFsaWRhdGlvbiAodXN1YWxseSBmb3Igb3VyIFNoYXBlKVxuICAgKiAoa2l0ZS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBpbnZhbGlkYXRlKCk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuX2ludmFsaWRhdGluZ1BvaW50cyApIHtcbiAgICAgIHRoaXMuX2JvdW5kcyA9IG51bGw7XG4gICAgICB0aGlzLl9zdHJva2VkU3VicGF0aHNDb21wdXRlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlZEVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcG9pbnQgdG8gdGhpcyBzdWJwYXRoXG4gICAqL1xuICBwdWJsaWMgYWRkUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IHRoaXMge1xuICAgIHRoaXMucG9pbnRzLnB1c2goIHBvaW50ICk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc2VnbWVudCBkaXJlY3RseVxuICAgKlxuICAgKiBDQVVUSU9OOiBSRUFMTFkhIE1ha2Ugc3VyZSB3ZSBpbnZhbGlkYXRlKCkgYWZ0ZXIgdGhpcyBpcyBjYWxsZWRcbiAgICovXG4gIHByaXZhdGUgYWRkU2VnbWVudERpcmVjdGx5KCBzZWdtZW50OiBTZWdtZW50ICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnQuc3RhcnQuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgc3RhcnQgaXMgaW5maW5pdGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2VnbWVudC5lbmQuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgZW5kIGlzIGluZmluaXRlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnQuc3RhcnRUYW5nZW50LmlzRmluaXRlKCksICdTZWdtZW50IHN0YXJ0VGFuZ2VudCBpcyBpbmZpbml0ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LmVuZFRhbmdlbnQuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgZW5kVGFuZ2VudCBpcyBpbmZpbml0ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LmJvdW5kcy5pc0VtcHR5KCkgfHwgc2VnbWVudC5ib3VuZHMuaXNGaW5pdGUoKSwgJ1NlZ21lbnQgYm91bmRzIGlzIGluZmluaXRlIGFuZCBub24tZW1wdHknICk7XG4gICAgdGhpcy5zZWdtZW50cy5wdXNoKCBzZWdtZW50ICk7XG5cbiAgICAvLyBIb29rIHVwIGFuIGludmFsaWRhdGlvbiBsaXN0ZW5lciwgc28gaWYgdGhpcyBzZWdtZW50IGlzIGludmFsaWRhdGVkLCBpdCB3aWxsIGludmFsaWRhdGUgb3VyIHN1YnBhdGghXG4gICAgLy8gTk9URTogaWYgd2UgYWRkIHJlbW92YWwgb2Ygc2VnbWVudHMsIHdlJ2xsIG5lZWQgdG8gcmVtb3ZlIHRoZXNlIGxpc3RlbmVycywgb3Igd2UnbGwgbGVhayFcbiAgICBzZWdtZW50LmludmFsaWRhdGlvbkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2ludmFsaWRhdGVMaXN0ZW5lciApO1xuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHNlZ21lbnQgdG8gdGhpcyBzdWJwYXRoXG4gICAqL1xuICBwdWJsaWMgYWRkU2VnbWVudCggc2VnbWVudDogU2VnbWVudCApOiB0aGlzIHtcbiAgICBjb25zdCBub25kZWdlbmVyYXRlU2VnbWVudHMgPSBzZWdtZW50LmdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpO1xuICAgIGNvbnN0IG51bU5vbmRlZ2VuZXJhdGVTZWdtZW50cyA9IG5vbmRlZ2VuZXJhdGVTZWdtZW50cy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtTm9uZGVnZW5lcmF0ZVNlZ21lbnRzOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZFNlZ21lbnREaXJlY3RseSggc2VnbWVudCApO1xuICAgIH1cbiAgICB0aGlzLmludmFsaWRhdGUoKTsgLy8gbmVlZCB0byBpbnZhbGlkYXRlIGFmdGVyIGFkZFNlZ21lbnREaXJlY3RseVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGxpbmUgc2VnbWVudCBmcm9tIHRoZSBzdGFydCB0byBlbmQgKGlmIG5vbi16ZXJvIGxlbmd0aCkgYW5kIG1hcmtzIHRoZSBzdWJwYXRoIGFzIGNsb3NlZC5cbiAgICogTk9URTogbm9ybWFsbHkgeW91IGp1c3Qgd2FudCB0byBtYXJrIHRoZSBzdWJwYXRoIGFzIGNsb3NlZCwgYW5kIG5vdCBnZW5lcmF0ZSB0aGUgY2xvc2luZyBzZWdtZW50IHRoaXMgd2F5P1xuICAgKi9cbiAgcHVibGljIGFkZENsb3NpbmdTZWdtZW50KCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5oYXNDbG9zaW5nU2VnbWVudCgpICkge1xuICAgICAgY29uc3QgY2xvc2luZ1NlZ21lbnQgPSB0aGlzLmdldENsb3NpbmdTZWdtZW50KCk7XG4gICAgICB0aGlzLmFkZFNlZ21lbnREaXJlY3RseSggY2xvc2luZ1NlZ21lbnQgKTtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZSgpOyAvLyBuZWVkIHRvIGludmFsaWRhdGUgYWZ0ZXIgYWRkU2VnbWVudERpcmVjdGx5XG4gICAgICB0aGlzLmFkZFBvaW50KCB0aGlzLmdldEZpcnN0UG9pbnQoKSApO1xuICAgICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoaXMgc3VicGF0aCB0byBiZSBhIGNsb3NlZCBwYXRoXG4gICAqL1xuICBwdWJsaWMgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgLy8gSWYgbmVlZGVkLCBhZGQgYSBjb25uZWN0aW5nIFwiY2xvc2luZ1wiIHNlZ21lbnRcbiAgICB0aGlzLmFkZENsb3NpbmdTZWdtZW50KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVycyBvZiBwb2ludHMgaW4gdGhpcyBzdWJwYXRoXG4gICAqXG4gICAqIFRPRE86IFRoaXMgaXMgYSBjb25mdXNpbmcgbmFtZSEgSXQgc2hvdWxkIGJlIGdldE51bVBvaW50cygpIG9yIHNvbWV0aGluZyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICovXG4gIHB1YmxpYyBnZXRMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wb2ludHMubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IHBvaW50IG9mIHRoaXMgc3VicGF0aFxuICAgKi9cbiAgcHVibGljIGdldEZpcnN0UG9pbnQoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb2ludHMubGVuZ3RoICk7XG5cbiAgICByZXR1cm4gXy5maXJzdCggdGhpcy5wb2ludHMgKSE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGFzdCBwb2ludCBvZiB0aGlzIHN1YnBhdGhcbiAgICovXG4gIHB1YmxpYyBnZXRMYXN0UG9pbnQoKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wb2ludHMubGVuZ3RoICk7XG5cbiAgICByZXR1cm4gXy5sYXN0KCB0aGlzLnBvaW50cyApITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzZWdtZW50IG9mIHRoaXMgc3VicGF0aFxuICAgKi9cbiAgcHVibGljIGdldEZpcnN0U2VnbWVudCgpOiBTZWdtZW50IHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlZ21lbnRzLmxlbmd0aCApO1xuXG4gICAgcmV0dXJuIF8uZmlyc3QoIHRoaXMuc2VnbWVudHMgKSE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGFzdCBzZWdtZW50IG9mIHRoaXMgc3VicGF0aFxuICAgKi9cbiAgcHVibGljIGdldExhc3RTZWdtZW50KCk6IFNlZ21lbnQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2VnbWVudHMubGVuZ3RoICk7XG5cbiAgICByZXR1cm4gXy5sYXN0KCB0aGlzLnNlZ21lbnRzICkhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgc2VnbWVudHMgdGhhdCBpbmNsdWRlIHRoZSBcImZpbGxlZFwiIGFyZWEsIHdoaWNoIG1heSBpbmNsdWRlIGFuIGV4dHJhIGNsb3Npbmcgc2VnbWVudCBpZiBuZWNlc3NhcnkuXG4gICAqL1xuICBwdWJsaWMgZ2V0RmlsbFNlZ21lbnRzKCk6IFNlZ21lbnRbXSB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLnNsaWNlKCk7XG4gICAgaWYgKCB0aGlzLmhhc0Nsb3NpbmdTZWdtZW50KCkgKSB7XG4gICAgICBzZWdtZW50cy5wdXNoKCB0aGlzLmdldENsb3NpbmdTZWdtZW50KCkgKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlZ21lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyBzdWJwYXRoIGlzIGRyYXdhYmxlLCBpLmUuIGlmIGl0IGNvbnRhaW5zIGFzbnkgc2VnbWVudHNcbiAgICovXG4gIHB1YmxpYyBpc0RyYXdhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlZ21lbnRzLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGlzIHN1YnBhdGggaXMgYSBjbG9zZWQgcGF0aCwgaS5lLiBpZiB0aGUgZmxhZyBpcyBzZXQgdG8gY2xvc2VkXG4gICAqL1xuICBwdWJsaWMgaXNDbG9zZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhpcyBzdWJwYXRoIGlzIGEgY2xvc2VkIHBhdGgsIGkuZS4gaWYgaXQgaGFzIGEgY2xvc2VkIHNlZ21lbnRcbiAgICovXG4gIHB1YmxpYyBoYXNDbG9zaW5nU2VnbWVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuZ2V0Rmlyc3RQb2ludCgpLmVxdWFsc0Vwc2lsb24oIHRoaXMuZ2V0TGFzdFBvaW50KCksIDAuMDAwMDAwMDAxICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGxpbmUgdGhhdCB3b3VsZCBjbG9zZSB0aGlzIHN1YnBhdGhcbiAgICovXG4gIHB1YmxpYyBnZXRDbG9zaW5nU2VnbWVudCgpOiBMaW5lIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc0Nsb3NpbmdTZWdtZW50KCksICdJbXBsaWNpdCBjbG9zaW5nIHNlZ21lbnQgdW5uZWNlc3Nhcnkgb24gYSBmdWxseSBjbG9zZWQgcGF0aCcgKTtcbiAgICByZXR1cm4gbmV3IExpbmUoIHRoaXMuZ2V0TGFzdFBvaW50KCksIHRoaXMuZ2V0Rmlyc3RQb2ludCgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBwb3RlbnRpYWwgY2xvc2VzdCBwb2ludHMgb24gdGhlIHN1YnBhdGggdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgKi9cbiAgcHVibGljIGdldENsb3Nlc3RQb2ludHMoIHBvaW50OiBWZWN0b3IyICk6IENsb3Nlc3RUb1BvaW50UmVzdWx0W10ge1xuICAgIHJldHVybiBTZWdtZW50LmZpbHRlckNsb3Nlc3RUb1BvaW50UmVzdWx0KCBfLmZsYXR0ZW4oIHRoaXMuc2VnbWVudHMubWFwKCBzZWdtZW50ID0+IHNlZ21lbnQuZ2V0Q2xvc2VzdFBvaW50cyggcG9pbnQgKSApICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgc2VnbWVudCB0byB0aGUgMkQgQ2FudmFzIGNvbnRleHQsIGFzc3VtaW5nIHRoZSBjb250ZXh0J3MgY3VycmVudCBsb2NhdGlvbiBpcyBhbHJlYWR5IGF0IHRoZSBzdGFydCBwb2ludFxuICAgKi9cbiAgcHVibGljIHdyaXRlVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmlzRHJhd2FibGUoKSApIHtcbiAgICAgIGNvbnN0IHN0YXJ0UG9pbnQgPSB0aGlzLmdldEZpcnN0U2VnbWVudCgpLnN0YXJ0O1xuICAgICAgY29udGV4dC5tb3ZlVG8oIHN0YXJ0UG9pbnQueCwgc3RhcnRQb2ludC55ICk7IC8vIHRoZSBzZWdtZW50cyBhc3N1bWUgdGhlIGN1cnJlbnQgY29udGV4dCBwb3NpdGlvbiBpcyBhdCB0aGVpciBzdGFydFxuXG4gICAgICBsZXQgbGVuID0gdGhpcy5zZWdtZW50cy5sZW5ndGg7XG5cbiAgICAgIC8vIE9taXQgYW4gZW5kaW5nIGxpbmUgc2VnbWVudCBpZiBvdXIgcGF0aCBpcyBjbG9zZWQuXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlL2lzc3Vlcy84MyNpc3N1ZWNvbW1lbnQtNTEyNjYzOTQ5XG4gICAgICBpZiAoIHRoaXMuY2xvc2VkICYmIGxlbiA+PSAyICYmIHRoaXMuc2VnbWVudHNbIGxlbiAtIDEgXSBpbnN0YW5jZW9mIExpbmUgKSB7XG4gICAgICAgIGxlbi0tO1xuICAgICAgfVxuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgdGhpcy5zZWdtZW50c1sgaSBdLndyaXRlVG9Db250ZXh0KCBjb250ZXh0ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5jbG9zZWQgKSB7XG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgc3VicGF0aCB0byBhIG5ldyBzdWJwYXRoIG1hZGUgb2YgbWFueSBsaW5lIHNlZ21lbnRzIChhcHByb3hpbWF0aW5nIHRoZSBjdXJyZW50IHN1YnBhdGgpXG4gICAqL1xuICBwdWJsaWMgdG9QaWVjZXdpc2VMaW5lYXIoIG9wdGlvbnM6IFBpZWNld2lzZUxpbmVhck9wdGlvbnMgKTogU3VicGF0aCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMucG9pbnRNYXAsICdGb3IgdXNlIHdpdGggcG9pbnRNYXAsIHBsZWFzZSB1c2Ugbm9ubGluZWFyVHJhbnNmb3JtZWQnICk7XG4gICAgcmV0dXJuIG5ldyBTdWJwYXRoKCBfLmZsYXR0ZW4oIF8ubWFwKCB0aGlzLnNlZ21lbnRzLCBzZWdtZW50ID0+IHNlZ21lbnQudG9QaWVjZXdpc2VMaW5lYXJTZWdtZW50cyggb3B0aW9ucyApICkgKSwgdW5kZWZpbmVkLCB0aGlzLmNsb3NlZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgU3VicGF0aCB0cmFuc2Zvcm1lZCB3aXRoIHRoZSBnaXZlbiBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgdHJhbnNmb3JtZWQoIG1hdHJpeDogTWF0cml4MyApOiBTdWJwYXRoIHtcbiAgICByZXR1cm4gbmV3IFN1YnBhdGgoXG4gICAgICBfLm1hcCggdGhpcy5zZWdtZW50cywgc2VnbWVudCA9PiBzZWdtZW50LnRyYW5zZm9ybWVkKCBtYXRyaXggKSApLFxuICAgICAgXy5tYXAoIHRoaXMucG9pbnRzLCBwb2ludCA9PiBtYXRyaXgudGltZXNWZWN0b3IyKCBwb2ludCApICksXG4gICAgICB0aGlzLmNsb3NlZFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBzdWJwYXRoIHRvIGEgbmV3IHN1YnBhdGggbWFkZSBvZiBtYW55IGxpbmUgc2VnbWVudHMgKGFwcHJveGltYXRpbmcgdGhlIGN1cnJlbnQgc3VicGF0aCkgd2l0aCB0aGVcbiAgICogdHJhbnNmb3JtYXRpb24gYXBwbGllZC5cbiAgICovXG4gIHB1YmxpYyBub25saW5lYXJUcmFuc2Zvcm1lZCggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucyApOiBTdWJwYXRoIHtcbiAgICByZXR1cm4gbmV3IFN1YnBhdGgoIF8uZmxhdHRlbiggXy5tYXAoIHRoaXMuc2VnbWVudHMsIHNlZ21lbnQgPT4ge1xuICAgICAgLy8gY2hlY2sgZm9yIHRoaXMgc2VnbWVudCdzIHN1cHBvcnQgZm9yIHRoZSBzcGVjaWZpYyB0cmFuc2Zvcm0gb3IgZGlzY3JldGl6YXRpb24gYmVpbmcgYXBwbGllZFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBkb24ndCBuZWVkIGl0IHRvIGV4aXN0IG9uIHNlZ21lbnRzLCBidXQgd2UgZG8gd2FudCBpdCB0byBleGlzdCBvbiBzb21lIHNlZ21lbnRzXG4gICAgICBpZiAoIG9wdGlvbnMubWV0aG9kTmFtZSAmJiBzZWdtZW50WyBvcHRpb25zLm1ldGhvZE5hbWUgXSApIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXZSBkb24ndCBuZWVkIGl0IHRvIGV4aXN0IG9uIHNlZ21lbnRzLCBidXQgd2UgZG8gd2FudCBpdCB0byBleGlzdCBvbiBzb21lIHNlZ21lbnRzXG4gICAgICAgIHJldHVybiBzZWdtZW50WyBvcHRpb25zLm1ldGhvZE5hbWUgXSggb3B0aW9ucyApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWdtZW50LnRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMoIG9wdGlvbnMgKTtcbiAgICAgIH1cbiAgICB9ICkgKSwgdW5kZWZpbmVkLCB0aGlzLmNsb3NlZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kcyBvZiB0aGlzIHN1YnBhdGggd2hlbiB0cmFuc2Zvcm0gYnkgYSBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSggbWF0cml4OiBNYXRyaXgzICk6IEJvdW5kczIge1xuICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgY29uc3QgbnVtU2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TZWdtZW50czsgaSsrICkge1xuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuc2VnbWVudHNbIGkgXS5nZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXggKSApO1xuICAgIH1cbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdWJwYXRoIHRoYXQgaXMgb2Zmc2V0IGZyb20gdGhpcyBzdWJwYXRoIGJ5IGEgZGlzdGFuY2VcbiAgICpcbiAgICogVE9ETzogUmVzb2x2ZSB0aGUgYnVnIHdpdGggdGhlIGluc2lkZS1saW5lLWpvaW4gb3ZlcmxhcC4gV2UgaGF2ZSB0aGUgaW50ZXJzZWN0aW9uIGhhbmRsaW5nIG5vdyAocG90ZW50aWFsbHkpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgKi9cbiAgcHVibGljIG9mZnNldCggZGlzdGFuY2U6IG51bWJlciApOiBTdWJwYXRoIHtcbiAgICBpZiAoICF0aGlzLmlzRHJhd2FibGUoKSApIHtcbiAgICAgIHJldHVybiBuZXcgU3VicGF0aCggW10sIHVuZGVmaW5lZCwgdGhpcy5jbG9zZWQgKTtcbiAgICB9XG4gICAgaWYgKCBkaXN0YW5jZSA9PT0gMCApIHtcbiAgICAgIHJldHVybiBuZXcgU3VicGF0aCggdGhpcy5zZWdtZW50cy5zbGljZSgpLCB1bmRlZmluZWQsIHRoaXMuY2xvc2VkICk7XG4gICAgfVxuXG4gICAgbGV0IGk7XG5cbiAgICBjb25zdCByZWd1bGFyU2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLnNsaWNlKCk7XG4gICAgY29uc3Qgb2Zmc2V0cyA9IFtdO1xuXG4gICAgZm9yICggaSA9IDA7IGkgPCByZWd1bGFyU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBvZmZzZXRzLnB1c2goIHJlZ3VsYXJTZWdtZW50c1sgaSBdLnN0cm9rZUxlZnQoIDIgKiBkaXN0YW5jZSApICk7XG4gICAgfVxuXG4gICAgbGV0IHNlZ21lbnRzOiBTZWdtZW50W10gPSBbXTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IHJlZ3VsYXJTZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5jbG9zZWQgfHwgaSA+IDAgKSB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzSSA9ICggaSA+IDAgPyBpIDogcmVndWxhclNlZ21lbnRzLmxlbmd0aCApIC0gMTtcbiAgICAgICAgY29uc3QgY2VudGVyID0gcmVndWxhclNlZ21lbnRzWyBpIF0uc3RhcnQ7XG4gICAgICAgIGNvbnN0IGZyb21UYW5nZW50ID0gcmVndWxhclNlZ21lbnRzWyBwcmV2aW91c0kgXS5lbmRUYW5nZW50O1xuICAgICAgICBjb25zdCB0b1RhbmdlbnQgPSByZWd1bGFyU2VnbWVudHNbIGkgXS5zdGFydFRhbmdlbnQ7XG5cbiAgICAgICAgY29uc3Qgc3RhcnRBbmdsZSA9IGZyb21UYW5nZW50LnBlcnBlbmRpY3VsYXIubmVnYXRlZCgpLnRpbWVzKCBkaXN0YW5jZSApLmFuZ2xlO1xuICAgICAgICBjb25zdCBlbmRBbmdsZSA9IHRvVGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggZGlzdGFuY2UgKS5hbmdsZTtcbiAgICAgICAgY29uc3QgYW50aWNsb2Nrd2lzZSA9IGZyb21UYW5nZW50LnBlcnBlbmRpY3VsYXIuZG90KCB0b1RhbmdlbnQgKSA+IDA7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goIG5ldyBBcmMoIGNlbnRlciwgTWF0aC5hYnMoIGRpc3RhbmNlICksIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlICkgKTtcbiAgICAgIH1cbiAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuY29uY2F0KCBvZmZzZXRzWyBpIF0gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFN1YnBhdGgoIHNlZ21lbnRzLCB1bmRlZmluZWQsIHRoaXMuY2xvc2VkICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBzdWJwYXRocyAob25lIGlmIG9wZW4sIHR3byBpZiBjbG9zZWQpIHRoYXQgcmVwcmVzZW50IGEgc3Ryb2tlZCBjb3B5IG9mIHRoaXMgc3VicGF0aC5cbiAgICovXG4gIHB1YmxpYyBzdHJva2VkKCBsaW5lU3R5bGVzOiBMaW5lU3R5bGVzICk6IFN1YnBhdGhbXSB7XG4gICAgLy8gbm9uLWRyYXdhYmxlIHN1YnBhdGhzIGNvbnZlcnQgdG8gZW1wdHkgc3VicGF0aHNcbiAgICBpZiAoICF0aGlzLmlzRHJhd2FibGUoKSApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBpZiAoIGxpbmVTdHlsZXMgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxpbmVTdHlsZXMgPSBuZXcgTGluZVN0eWxlcygpO1xuICAgIH1cblxuICAgIC8vIHJldHVybiBhIGNhY2hlZCB2ZXJzaW9uIGlmIHBvc3NpYmxlXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkIHx8ICggdGhpcy5fc3Ryb2tlZFN0eWxlcyAmJiB0aGlzLl9zdHJva2VkU3VicGF0aHMgKSApO1xuICAgIGlmICggdGhpcy5fc3Ryb2tlZFN1YnBhdGhzQ29tcHV0ZWQgJiYgdGhpcy5fc3Ryb2tlZFN0eWxlcyEuZXF1YWxzKCBsaW5lU3R5bGVzICkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3Ryb2tlZFN1YnBhdGhzITtcbiAgICB9XG5cbiAgICBjb25zdCBsaW5lV2lkdGggPSBsaW5lU3R5bGVzLmxpbmVXaWR0aDtcblxuICAgIGxldCBpO1xuICAgIGxldCBsZWZ0U2VnbWVudHM6IFNlZ21lbnRbXSA9IFtdO1xuICAgIGxldCByaWdodFNlZ21lbnRzOiBTZWdtZW50W10gPSBbXTtcbiAgICBjb25zdCBmaXJzdFNlZ21lbnQgPSB0aGlzLmdldEZpcnN0U2VnbWVudCgpO1xuICAgIGNvbnN0IGxhc3RTZWdtZW50ID0gdGhpcy5nZXRMYXN0U2VnbWVudCgpO1xuXG4gICAgY29uc3QgYXBwZW5kTGVmdFNlZ21lbnRzID0gKCBzZWdtZW50czogU2VnbWVudFtdICkgPT4ge1xuICAgICAgbGVmdFNlZ21lbnRzID0gbGVmdFNlZ21lbnRzLmNvbmNhdCggc2VnbWVudHMgKTtcbiAgICB9O1xuXG4gICAgY29uc3QgYXBwZW5kUmlnaHRTZWdtZW50cyA9ICggc2VnbWVudHM6IFNlZ21lbnRbXSApID0+IHtcbiAgICAgIHJpZ2h0U2VnbWVudHMgPSByaWdodFNlZ21lbnRzLmNvbmNhdCggc2VnbWVudHMgKTtcbiAgICB9O1xuXG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBpbnNlcnQgYW4gaW1wbGljaXQgY2xvc2luZyBzZWdtZW50IGlmIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cyBhcmUgdGhlIHNhbWVcbiAgICBjb25zdCBhbHJlYWR5Q2xvc2VkID0gbGFzdFNlZ21lbnQuZW5kLmVxdWFscyggZmlyc3RTZWdtZW50LnN0YXJ0ICk7XG4gICAgLy8gaWYgdGhlcmUgaXMgYW4gaW1wbGljaXQgY2xvc2luZyBzZWdtZW50XG4gICAgY29uc3QgY2xvc2luZ1NlZ21lbnQgPSBhbHJlYWR5Q2xvc2VkID8gbnVsbCA6IG5ldyBMaW5lKCB0aGlzLnNlZ21lbnRzWyB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEgXS5lbmQsIHRoaXMuc2VnbWVudHNbIDAgXS5zdGFydCApO1xuXG4gICAgLy8gc3Ryb2tlIHRoZSBsb2dpY2FsIFwibGVmdFwiIHNpZGUgb2Ygb3VyIHBhdGhcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuc2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIGkgPiAwICkge1xuICAgICAgICBhcHBlbmRMZWZ0U2VnbWVudHMoIGxpbmVTdHlsZXMubGVmdEpvaW4oIHRoaXMuc2VnbWVudHNbIGkgXS5zdGFydCwgdGhpcy5zZWdtZW50c1sgaSAtIDEgXS5lbmRUYW5nZW50LCB0aGlzLnNlZ21lbnRzWyBpIF0uc3RhcnRUYW5nZW50ICkgKTtcbiAgICAgIH1cbiAgICAgIGFwcGVuZExlZnRTZWdtZW50cyggdGhpcy5zZWdtZW50c1sgaSBdLnN0cm9rZUxlZnQoIGxpbmVXaWR0aCApICk7XG4gICAgfVxuXG4gICAgLy8gc3Ryb2tlIHRoZSBsb2dpY2FsIFwicmlnaHRcIiBzaWRlIG9mIG91ciBwYXRoXG4gICAgZm9yICggaSA9IHRoaXMuc2VnbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBpZiAoIGkgPCB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgIGFwcGVuZFJpZ2h0U2VnbWVudHMoIGxpbmVTdHlsZXMucmlnaHRKb2luKCB0aGlzLnNlZ21lbnRzWyBpIF0uZW5kLCB0aGlzLnNlZ21lbnRzWyBpIF0uZW5kVGFuZ2VudCwgdGhpcy5zZWdtZW50c1sgaSArIDEgXS5zdGFydFRhbmdlbnQgKSApO1xuICAgICAgfVxuICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggdGhpcy5zZWdtZW50c1sgaSBdLnN0cm9rZVJpZ2h0KCBsaW5lV2lkdGggKSApO1xuICAgIH1cblxuICAgIGxldCBzdWJwYXRocztcbiAgICBpZiAoIHRoaXMuY2xvc2VkICkge1xuICAgICAgaWYgKCBhbHJlYWR5Q2xvc2VkICkge1xuICAgICAgICAvLyBhZGQgdGhlIGpvaW5zIGJldHdlZW4gdGhlIHN0YXJ0IGFuZCBlbmRcbiAgICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCBsaW5lU3R5bGVzLmxlZnRKb2luKCBsYXN0U2VnbWVudC5lbmQsIGxhc3RTZWdtZW50LmVuZFRhbmdlbnQsIGZpcnN0U2VnbWVudC5zdGFydFRhbmdlbnQgKSApO1xuICAgICAgICBhcHBlbmRSaWdodFNlZ21lbnRzKCBsaW5lU3R5bGVzLnJpZ2h0Sm9pbiggbGFzdFNlZ21lbnQuZW5kLCBsYXN0U2VnbWVudC5lbmRUYW5nZW50LCBmaXJzdFNlZ21lbnQuc3RhcnRUYW5nZW50ICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBsb2dpY2FsIFwibGVmdFwiIHN0cm9rZSBvbiB0aGUgaW1wbGljaXQgY2xvc2luZyBzZWdtZW50XG4gICAgICAgIGFwcGVuZExlZnRTZWdtZW50cyggbGluZVN0eWxlcy5sZWZ0Sm9pbiggY2xvc2luZ1NlZ21lbnQhLnN0YXJ0LCBsYXN0U2VnbWVudC5lbmRUYW5nZW50LCBjbG9zaW5nU2VnbWVudCEuc3RhcnRUYW5nZW50ICkgKTtcbiAgICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCBjbG9zaW5nU2VnbWVudCEuc3Ryb2tlTGVmdCggbGluZVdpZHRoICkgKTtcbiAgICAgICAgYXBwZW5kTGVmdFNlZ21lbnRzKCBsaW5lU3R5bGVzLmxlZnRKb2luKCBjbG9zaW5nU2VnbWVudCEuZW5kLCBjbG9zaW5nU2VnbWVudCEuZW5kVGFuZ2VudCwgZmlyc3RTZWdtZW50LnN0YXJ0VGFuZ2VudCApICk7XG5cbiAgICAgICAgLy8gbG9naWNhbCBcInJpZ2h0XCIgc3Ryb2tlIG9uIHRoZSBpbXBsaWNpdCBjbG9zaW5nIHNlZ21lbnRcbiAgICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggbGluZVN0eWxlcy5yaWdodEpvaW4oIGNsb3NpbmdTZWdtZW50IS5lbmQsIGNsb3NpbmdTZWdtZW50IS5lbmRUYW5nZW50LCBmaXJzdFNlZ21lbnQuc3RhcnRUYW5nZW50ICkgKTtcbiAgICAgICAgYXBwZW5kUmlnaHRTZWdtZW50cyggY2xvc2luZ1NlZ21lbnQhLnN0cm9rZVJpZ2h0KCBsaW5lV2lkdGggKSApO1xuICAgICAgICBhcHBlbmRSaWdodFNlZ21lbnRzKCBsaW5lU3R5bGVzLnJpZ2h0Sm9pbiggY2xvc2luZ1NlZ21lbnQhLnN0YXJ0LCBsYXN0U2VnbWVudC5lbmRUYW5nZW50LCBjbG9zaW5nU2VnbWVudCEuc3RhcnRUYW5nZW50ICkgKTtcbiAgICAgIH1cbiAgICAgIHN1YnBhdGhzID0gW1xuICAgICAgICBuZXcgU3VicGF0aCggbGVmdFNlZ21lbnRzLCB1bmRlZmluZWQsIHRydWUgKSxcbiAgICAgICAgbmV3IFN1YnBhdGgoIHJpZ2h0U2VnbWVudHMsIHVuZGVmaW5lZCwgdHJ1ZSApXG4gICAgICBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHN1YnBhdGhzID0gW1xuICAgICAgICBuZXcgU3VicGF0aCggbGVmdFNlZ21lbnRzLmNvbmNhdCggbGluZVN0eWxlcy5jYXAoIGxhc3RTZWdtZW50LmVuZCwgbGFzdFNlZ21lbnQuZW5kVGFuZ2VudCApIClcbiAgICAgICAgICAgIC5jb25jYXQoIHJpZ2h0U2VnbWVudHMgKVxuICAgICAgICAgICAgLmNvbmNhdCggbGluZVN0eWxlcy5jYXAoIGZpcnN0U2VnbWVudC5zdGFydCwgZmlyc3RTZWdtZW50LnN0YXJ0VGFuZ2VudC5uZWdhdGVkKCkgKSApLFxuICAgICAgICAgIHVuZGVmaW5lZCwgdHJ1ZSApXG4gICAgICBdO1xuICAgIH1cblxuICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRocyA9IHN1YnBhdGhzO1xuICAgIHRoaXMuX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zdHJva2VkU3R5bGVzID0gbGluZVN0eWxlcy5jb3B5KCk7IC8vIHNoYWxsb3cgY29weSwgc2luY2Ugd2UgY29uc2lkZXIgbGluZXN0eWxlcyB0byBiZSBtdXRhYmxlXG5cbiAgICByZXR1cm4gc3VicGF0aHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBzdWJwYXRoIHdpdGggdGhlIGRhc2ggXCJob2xlc1wiIHJlbW92ZWQgKGhhcyBtYW55IHN1YnBhdGhzIHVzdWFsbHkpLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZURhc2hcbiAgICogQHBhcmFtIGxpbmVEYXNoT2Zmc2V0XG4gICAqIEBwYXJhbSBkaXN0YW5jZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpIGRldmlhdGlvbiBmcm9tIHRoZSBjdXJ2ZVxuICAgKiBAcGFyYW0gY3VydmVFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIGN1cnZhdHVyZSBjaGFuZ2UgYmV0d2VlbiBzZWdtZW50c1xuICAgKi9cbiAgcHVibGljIGRhc2hlZCggbGluZURhc2g6IG51bWJlcltdLCBsaW5lRGFzaE9mZnNldDogbnVtYmVyLCBkaXN0YW5jZUVwc2lsb246IG51bWJlciwgY3VydmVFcHNpbG9uOiBudW1iZXIgKTogU3VicGF0aFtdIHtcbiAgICAvLyBDb21iaW5lIHNlZ21lbnQgYXJyYXlzIChjb2xsYXBzaW5nIHRoZSB0d28tbW9zdC1hZGphY2VudCBhcnJheXMgaW50byBvbmUsIHdpdGggY29uY2F0ZW5hdGlvbilcbiAgICBjb25zdCBjb21iaW5lU2VnbWVudEFycmF5cyA9ICggbGVmdDogU2VnbWVudFtdW10sIHJpZ2h0OiBTZWdtZW50W11bXSApID0+IHtcbiAgICAgIGNvbnN0IGNvbWJpbmVkID0gbGVmdFsgbGVmdC5sZW5ndGggLSAxIF0uY29uY2F0KCByaWdodFsgMCBdICk7XG4gICAgICBjb25zdCByZXN1bHQgPSBsZWZ0LnNsaWNlKCAwLCBsZWZ0Lmxlbmd0aCAtIDEgKS5jb25jYXQoIFsgY29tYmluZWQgXSApLmNvbmNhdCggcmlnaHQuc2xpY2UoIDEgKSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0Lmxlbmd0aCA9PT0gbGVmdC5sZW5ndGggKyByaWdodC5sZW5ndGggLSAxICk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvLyBXaGV0aGVyIHR3byBkYXNoIGl0ZW1zIChyZXR1cm4gdHlwZSBmcm9tIGdldERhc2hWYWx1ZXMoKSkgY2FuIGJlIGNvbWJpbmVkIHRvZ2V0aGVyIHRvIGhhdmUgdGhlaXIgZW5kIHNlZ21lbnRzXG4gICAgLy8gY29tYmluZWQgd2l0aCBjb21iaW5lU2VnbWVudEFycmF5cy5cbiAgICBjb25zdCBjYW5CZUNvbWJpbmVkID0gKCBsZWZ0SXRlbTogRGFzaEl0ZW0sIHJpZ2h0SXRlbTogRGFzaEl0ZW0gKSA9PiB7XG4gICAgICBpZiAoICFsZWZ0SXRlbS5oYXNSaWdodEZpbGxlZCB8fCAhcmlnaHRJdGVtLmhhc0xlZnRGaWxsZWQgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxlZnRTZWdtZW50ID0gXy5sYXN0KCBfLmxhc3QoIGxlZnRJdGVtLnNlZ21lbnRBcnJheXMgKSApITtcbiAgICAgIGNvbnN0IHJpZ2h0U2VnbWVudCA9IHJpZ2h0SXRlbS5zZWdtZW50QXJyYXlzWyAwIF1bIDAgXTtcbiAgICAgIHJldHVybiBsZWZ0U2VnbWVudC5lbmQuZGlzdGFuY2UoIHJpZ2h0U2VnbWVudC5zdGFydCApIDwgMWUtNTtcbiAgICB9O1xuXG4gICAgLy8gQ29tcHV0ZSBhbGwgdGhlIGRhc2hlc1xuICAgIGNvbnN0IGRhc2hJdGVtczogRGFzaEl0ZW1bXSA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBzZWdtZW50ID0gdGhpcy5zZWdtZW50c1sgaSBdO1xuICAgICAgY29uc3QgZGFzaEl0ZW0gPSBzZWdtZW50LmdldERhc2hWYWx1ZXMoIGxpbmVEYXNoLCBsaW5lRGFzaE9mZnNldCwgZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24gKSBhcyBEYXNoSXRlbTtcbiAgICAgIGRhc2hJdGVtcy5wdXNoKCBkYXNoSXRlbSApO1xuXG4gICAgICAvLyBXZSBtb3ZlZCBmb3J3YXJkIGluIHRoZSBvZmZzZXQgYnkgdGhpcyBtdWNoXG4gICAgICBsaW5lRGFzaE9mZnNldCArPSBkYXNoSXRlbS5hcmNMZW5ndGg7XG5cbiAgICAgIGNvbnN0IHZhbHVlcyA9IFsgMCBdLmNvbmNhdCggZGFzaEl0ZW0udmFsdWVzICkuY29uY2F0KCBbIDEgXSApO1xuICAgICAgY29uc3QgaW5pdGlhbGx5SW5zaWRlID0gZGFzaEl0ZW0uaW5pdGlhbGx5SW5zaWRlO1xuXG4gICAgICAvLyBNYXJrIHdoZXRoZXIgdGhlIGVuZHMgYXJlIGZpbGxlZCwgc28gYWRqYWNlbnQgZmlsbGVkIGVuZHMgY2FuIGJlIGNvbWJpbmVkXG4gICAgICBkYXNoSXRlbS5oYXNMZWZ0RmlsbGVkID0gaW5pdGlhbGx5SW5zaWRlO1xuICAgICAgZGFzaEl0ZW0uaGFzUmlnaHRGaWxsZWQgPSAoIHZhbHVlcy5sZW5ndGggJSAyID09PSAwICkgPyBpbml0aWFsbHlJbnNpZGUgOiAhaW5pdGlhbGx5SW5zaWRlO1xuXG4gICAgICAvLyB7QXJyYXkuPEFycmF5LjxTZWdtZW50Pj59LCB3aGVyZSBlYWNoIGNvbnRhaW5lZCBhcnJheSB3aWxsIGJlIHR1cm5lZCBpbnRvIGEgc3VicGF0aCBhdCB0aGUgZW5kLlxuICAgICAgZGFzaEl0ZW0uc2VnbWVudEFycmF5cyA9IFtdO1xuICAgICAgZm9yICggbGV0IGogPSAoIGluaXRpYWxseUluc2lkZSA/IDAgOiAxICk7IGogPCB2YWx1ZXMubGVuZ3RoIC0gMTsgaiArPSAyICkge1xuICAgICAgICBpZiAoIHZhbHVlc1sgaiBdICE9PSB2YWx1ZXNbIGogKyAxIF0gKSB7XG4gICAgICAgICAgZGFzaEl0ZW0uc2VnbWVudEFycmF5cy5wdXNoKCBbIHNlZ21lbnQuc2xpY2UoIHZhbHVlc1sgaiBdLCB2YWx1ZXNbIGogKyAxIF0gKSBdICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb21iaW5lIGFkamFjZW50IHdoaWNoIGJvdGggYXJlIGZpbGxlZCBvbiB0aGUgbWlkZGxlXG4gICAgZm9yICggbGV0IGkgPSBkYXNoSXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAxOyBpLS0gKSB7XG4gICAgICBjb25zdCBsZWZ0SXRlbSA9IGRhc2hJdGVtc1sgaSAtIDEgXTtcbiAgICAgIGNvbnN0IHJpZ2h0SXRlbSA9IGRhc2hJdGVtc1sgaSBdO1xuICAgICAgaWYgKCBjYW5CZUNvbWJpbmVkKCBsZWZ0SXRlbSwgcmlnaHRJdGVtICkgKSB7XG4gICAgICAgIGRhc2hJdGVtcy5zcGxpY2UoIGkgLSAxLCAyLCB7XG4gICAgICAgICAgc2VnbWVudEFycmF5czogY29tYmluZVNlZ21lbnRBcnJheXMoIGxlZnRJdGVtLnNlZ21lbnRBcnJheXMsIHJpZ2h0SXRlbS5zZWdtZW50QXJyYXlzICksXG4gICAgICAgICAgaGFzTGVmdEZpbGxlZDogbGVmdEl0ZW0uaGFzTGVmdEZpbGxlZCxcbiAgICAgICAgICBoYXNSaWdodEZpbGxlZDogcmlnaHRJdGVtLmhhc1JpZ2h0RmlsbGVkXG4gICAgICAgIH0gYXMgRGFzaEl0ZW0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb21iaW5lIGFkamFjZW50IHN0YXJ0L2VuZCBpZiBhcHBsaWNhYmxlXG4gICAgaWYgKCBkYXNoSXRlbXMubGVuZ3RoID4gMSAmJiBjYW5CZUNvbWJpbmVkKCBkYXNoSXRlbXNbIGRhc2hJdGVtcy5sZW5ndGggLSAxIF0sIGRhc2hJdGVtc1sgMCBdICkgKSB7XG4gICAgICBjb25zdCBsZWZ0SXRlbSA9IGRhc2hJdGVtcy5wb3AoKSE7XG4gICAgICBjb25zdCByaWdodEl0ZW0gPSBkYXNoSXRlbXMuc2hpZnQoKSE7XG4gICAgICBkYXNoSXRlbXMucHVzaCgge1xuICAgICAgICBzZWdtZW50QXJyYXlzOiBjb21iaW5lU2VnbWVudEFycmF5cyggbGVmdEl0ZW0uc2VnbWVudEFycmF5cywgcmlnaHRJdGVtLnNlZ21lbnRBcnJheXMgKSxcbiAgICAgICAgaGFzTGVmdEZpbGxlZDogbGVmdEl0ZW0uaGFzTGVmdEZpbGxlZCxcbiAgICAgICAgaGFzUmlnaHRGaWxsZWQ6IHJpZ2h0SXRlbS5oYXNSaWdodEZpbGxlZFxuICAgICAgfSBhcyBEYXNoSXRlbSApO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBpZiB3ZSBhcmUgY2xvc2VkIChoYXZlIG9ubHkgb25lIHN1YnBhdGgpXG4gICAgaWYgKCB0aGlzLmNsb3NlZCAmJiBkYXNoSXRlbXMubGVuZ3RoID09PSAxICYmIGRhc2hJdGVtc1sgMCBdLnNlZ21lbnRBcnJheXMubGVuZ3RoID09PSAxICYmIGRhc2hJdGVtc1sgMCBdLmhhc0xlZnRGaWxsZWQgJiYgZGFzaEl0ZW1zWyAwIF0uaGFzUmlnaHRGaWxsZWQgKSB7XG4gICAgICByZXR1cm4gWyBuZXcgU3VicGF0aCggZGFzaEl0ZW1zWyAwIF0uc2VnbWVudEFycmF5c1sgMCBdLCB1bmRlZmluZWQsIHRydWUgKSBdO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgdG8gc3VicGF0aHNcbiAgICByZXR1cm4gXy5mbGF0dGVuKCBkYXNoSXRlbXMubWFwKCBkYXNoSXRlbSA9PiBkYXNoSXRlbS5zZWdtZW50QXJyYXlzICkgKS5tYXAoIHNlZ21lbnRzID0+IG5ldyBTdWJwYXRoKCBzZWdtZW50cyApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICovXG4gIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXplZFN1YnBhdGgge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnU3VicGF0aCcsXG4gICAgICBzZWdtZW50czogdGhpcy5zZWdtZW50cy5tYXAoIHNlZ21lbnQgPT4gc2VnbWVudC5zZXJpYWxpemUoKSApLFxuICAgICAgcG9pbnRzOiB0aGlzLnBvaW50cy5tYXAoIHBvaW50ID0+ICgge1xuICAgICAgICB4OiBwb2ludC54LFxuICAgICAgICB5OiBwb2ludC55XG4gICAgICB9ICkgKSxcbiAgICAgIGNsb3NlZDogdGhpcy5jbG9zZWRcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTdWJwYXRoIGZyb20gdGhlIHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKCBvYmo6IFNlcmlhbGl6ZWRTdWJwYXRoICk6IFN1YnBhdGgge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9iai50eXBlID09PSAnU3VicGF0aCcgKTtcblxuICAgIHJldHVybiBuZXcgU3VicGF0aCggb2JqLnNlZ21lbnRzLm1hcCggU2VnbWVudC5kZXNlcmlhbGl6ZSApLCBvYmoucG9pbnRzLm1hcCggcHQgPT4gbmV3IFZlY3RvcjIoIHB0LngsIHB0LnkgKSApLCBvYmouY2xvc2VkICk7XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ1N1YnBhdGgnLCBTdWJwYXRoICk7XG5cbmV4cG9ydCBkZWZhdWx0IFN1YnBhdGg7Il0sIm5hbWVzIjpbIlRpbnlFbWl0dGVyIiwiQm91bmRzMiIsIlZlY3RvcjIiLCJBcmMiLCJraXRlIiwiTGluZSIsIkxpbmVTdHlsZXMiLCJTZWdtZW50IiwiU3VicGF0aCIsImdldEJvdW5kcyIsIl9ib3VuZHMiLCJib3VuZHMiLCJOT1RISU5HIiwiY29weSIsIl8iLCJlYWNoIiwic2VnbWVudHMiLCJzZWdtZW50IiwiaW5jbHVkZUJvdW5kcyIsImdldEFyY0xlbmd0aCIsImRpc3RhbmNlRXBzaWxvbiIsImN1cnZlRXBzaWxvbiIsIm1heExldmVscyIsImxlbmd0aCIsImkiLCJzbGljZSIsInBvaW50cyIsImNsb3NlZCIsImludmFsaWRhdGVQb2ludHMiLCJfaW52YWxpZGF0aW5nUG9pbnRzIiwibnVtU2VnbWVudHMiLCJpbnZhbGlkYXRlIiwiX3N0cm9rZWRTdWJwYXRoc0NvbXB1dGVkIiwiaW52YWxpZGF0ZWRFbWl0dGVyIiwiZW1pdCIsImFkZFBvaW50IiwicG9pbnQiLCJwdXNoIiwiYWRkU2VnbWVudERpcmVjdGx5IiwiYXNzZXJ0Iiwic3RhcnQiLCJpc0Zpbml0ZSIsImVuZCIsInN0YXJ0VGFuZ2VudCIsImVuZFRhbmdlbnQiLCJpc0VtcHR5IiwiaW52YWxpZGF0aW9uRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX2ludmFsaWRhdGVMaXN0ZW5lciIsImFkZFNlZ21lbnQiLCJub25kZWdlbmVyYXRlU2VnbWVudHMiLCJnZXROb25kZWdlbmVyYXRlU2VnbWVudHMiLCJudW1Ob25kZWdlbmVyYXRlU2VnbWVudHMiLCJhZGRDbG9zaW5nU2VnbWVudCIsImhhc0Nsb3NpbmdTZWdtZW50IiwiY2xvc2luZ1NlZ21lbnQiLCJnZXRDbG9zaW5nU2VnbWVudCIsImdldEZpcnN0UG9pbnQiLCJjbG9zZSIsImdldExlbmd0aCIsImZpcnN0IiwiZ2V0TGFzdFBvaW50IiwibGFzdCIsImdldEZpcnN0U2VnbWVudCIsImdldExhc3RTZWdtZW50IiwiZ2V0RmlsbFNlZ21lbnRzIiwiaXNEcmF3YWJsZSIsImlzQ2xvc2VkIiwiZXF1YWxzRXBzaWxvbiIsImdldENsb3Nlc3RQb2ludHMiLCJmaWx0ZXJDbG9zZXN0VG9Qb2ludFJlc3VsdCIsImZsYXR0ZW4iLCJtYXAiLCJ3cml0ZVRvQ29udGV4dCIsImNvbnRleHQiLCJzdGFydFBvaW50IiwibW92ZVRvIiwieCIsInkiLCJsZW4iLCJjbG9zZVBhdGgiLCJ0b1BpZWNld2lzZUxpbmVhciIsIm9wdGlvbnMiLCJwb2ludE1hcCIsInRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMiLCJ1bmRlZmluZWQiLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsInRpbWVzVmVjdG9yMiIsIm5vbmxpbmVhclRyYW5zZm9ybWVkIiwibWV0aG9kTmFtZSIsImdldEJvdW5kc1dpdGhUcmFuc2Zvcm0iLCJvZmZzZXQiLCJkaXN0YW5jZSIsInJlZ3VsYXJTZWdtZW50cyIsIm9mZnNldHMiLCJzdHJva2VMZWZ0IiwicHJldmlvdXNJIiwiY2VudGVyIiwiZnJvbVRhbmdlbnQiLCJ0b1RhbmdlbnQiLCJzdGFydEFuZ2xlIiwicGVycGVuZGljdWxhciIsIm5lZ2F0ZWQiLCJ0aW1lcyIsImFuZ2xlIiwiZW5kQW5nbGUiLCJhbnRpY2xvY2t3aXNlIiwiZG90IiwiTWF0aCIsImFicyIsImNvbmNhdCIsInN0cm9rZWQiLCJsaW5lU3R5bGVzIiwiX3N0cm9rZWRTdHlsZXMiLCJfc3Ryb2tlZFN1YnBhdGhzIiwiZXF1YWxzIiwibGluZVdpZHRoIiwibGVmdFNlZ21lbnRzIiwicmlnaHRTZWdtZW50cyIsImZpcnN0U2VnbWVudCIsImxhc3RTZWdtZW50IiwiYXBwZW5kTGVmdFNlZ21lbnRzIiwiYXBwZW5kUmlnaHRTZWdtZW50cyIsImFscmVhZHlDbG9zZWQiLCJsZWZ0Sm9pbiIsInJpZ2h0Sm9pbiIsInN0cm9rZVJpZ2h0Iiwic3VicGF0aHMiLCJjYXAiLCJkYXNoZWQiLCJsaW5lRGFzaCIsImxpbmVEYXNoT2Zmc2V0IiwiY29tYmluZVNlZ21lbnRBcnJheXMiLCJsZWZ0IiwicmlnaHQiLCJjb21iaW5lZCIsInJlc3VsdCIsImNhbkJlQ29tYmluZWQiLCJsZWZ0SXRlbSIsInJpZ2h0SXRlbSIsImhhc1JpZ2h0RmlsbGVkIiwiaGFzTGVmdEZpbGxlZCIsImxlZnRTZWdtZW50Iiwic2VnbWVudEFycmF5cyIsInJpZ2h0U2VnbWVudCIsImRhc2hJdGVtcyIsImRhc2hJdGVtIiwiZ2V0RGFzaFZhbHVlcyIsImFyY0xlbmd0aCIsInZhbHVlcyIsImluaXRpYWxseUluc2lkZSIsImoiLCJzcGxpY2UiLCJwb3AiLCJzaGlmdCIsInNlcmlhbGl6ZSIsInR5cGUiLCJkZXNlcmlhbGl6ZSIsIm9iaiIsInB0IiwiYmluZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLGlCQUFpQixrQ0FBa0M7QUFDMUQsT0FBT0MsYUFBYSw2QkFBNkI7QUFFakQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsR0FBRyxFQUFvQ0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFVBQVUsRUFBMEJDLE9BQU8sUUFBMkIsZ0JBQWdCO0FBaUJsSixJQUFBLEFBQU1DLFVBQU4sTUFBTUE7SUEwQ0o7O0dBRUMsR0FDRCxBQUFPQyxZQUFxQjtRQUMxQixJQUFLLElBQUksQ0FBQ0MsT0FBTyxLQUFLLE1BQU87WUFDM0IsTUFBTUMsU0FBU1YsUUFBUVcsT0FBTyxDQUFDQyxJQUFJO1lBQ25DQyxFQUFFQyxJQUFJLENBQUUsSUFBSSxDQUFDQyxRQUFRLEVBQUVDLENBQUFBO2dCQUNyQk4sT0FBT08sYUFBYSxDQUFFRCxRQUFRUixTQUFTO1lBQ3pDO1lBQ0EsSUFBSSxDQUFDQyxPQUFPLEdBQUdDO1FBQ2pCO1FBQ0EsT0FBTyxJQUFJLENBQUNELE9BQU87SUFDckI7SUFFQSxJQUFXQyxTQUFrQjtRQUFFLE9BQU8sSUFBSSxDQUFDRixTQUFTO0lBQUk7SUFFeEQ7O0dBRUMsR0FDRCxBQUFPVSxhQUFjQyxlQUF3QixFQUFFQyxZQUFxQixFQUFFQyxTQUFrQixFQUFXO1FBQ2pHLElBQUlDLFNBQVM7UUFDYixJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNSLFFBQVEsQ0FBQ08sTUFBTSxFQUFFQyxJQUFNO1lBQy9DRCxVQUFVLElBQUksQ0FBQ1AsUUFBUSxDQUFFUSxFQUFHLENBQUNMLFlBQVksQ0FBRUMs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