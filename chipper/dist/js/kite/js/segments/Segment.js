// Copyright 2013-2024, University of Colorado Boulder
/**
 * A segment represents a specific curve with a start and end.
 *
 * Each segment is treated parametrically, where t=0 is the start of the segment, and t=1 is the end. Values of t
 * between those represent points along the segment.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /* global paper */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Arc, BoundsIntersection, Cubic, EllipticalArc, kite, Line, Quadratic, SegmentIntersection, Shape, Subpath } from '../imports.js';
let Segment = class Segment {
    /**
   * Will return true if the start/end tangents are purely vertical or horizontal. If all of the segments of a shape
   * have this property, then the only line joins will be a multiple of pi/2 (90 degrees), and so all of the types of
   * line joins will have the same bounds. This means that the stroked bounds will just be a pure dilation of the
   * regular bounds, by lineWidth / 2.
   */ areStrokedBoundsDilated() {
        const epsilon = 0.0000001;
        // If the derivative at the start/end are pointing in a cardinal direction (north/south/east/west), then the
        // endpoints won't trigger non-dilated bounds, and the interior of the curve will not contribute.
        return Math.abs(this.startTangent.x * this.startTangent.y) < epsilon && Math.abs(this.endTangent.x * this.endTangent.y) < epsilon;
    }
    /**
   * TODO: override everywhere so this isn't necessary (it's not particularly efficient!) https://github.com/phetsims/kite/issues/76
   */ getBoundsWithTransform(matrix) {
        const transformedSegment = this.transformed(matrix);
        return transformedSegment.getBounds();
    }
    /**
   * Extracts a slice of a segment, based on the parametric value.
   *
   * Given that this segment is represented by the interval [0,1]
   */ slice(t0, t1) {
        assert && assert(t0 >= 0 && t0 <= 1 && t1 >= 0 && t1 <= 1, 'Parametric value out of range');
        assert && assert(t0 < t1);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let segment = this; // eslint-disable-line consistent-this
        if (t1 < 1) {
            segment = segment.subdivided(t1)[0];
        }
        if (t0 > 0) {
            segment = segment.subdivided(Utils.linear(0, t1, 0, 1, t0))[1];
        }
        return segment;
    }
    /**
   * @param tList - list of sorted t values from 0 <= t <= 1
   */ subdivisions(tList) {
        // this could be solved by recursion, but we don't plan on the JS engine doing tail-call optimization
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let right = this; // eslint-disable-line consistent-this
        const result = [];
        for(let i = 0; i < tList.length; i++){
            // assume binary subdivision
            const t = tList[i];
            const arr = right.subdivided(t);
            assert && assert(arr.length === 2);
            result.push(arr[0]);
            right = arr[1];
            // scale up the remaining t values
            for(let j = i + 1; j < tList.length; j++){
                tList[j] = Utils.linear(t, 1, 0, 1, tList[j]);
            }
        }
        result.push(right);
        return result;
    }
    /**
   * Return an array of segments from breaking this segment into monotone pieces
   */ subdividedIntoMonotone() {
        return this.subdivisions(this.getInteriorExtremaTs());
    }
    /**
   * Determines if the segment is sufficiently flat (given certain epsilon values)
   *
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */ isSufficientlyFlat(distanceEpsilon, curveEpsilon) {
        const start = this.start;
        const middle = this.positionAt(0.5);
        const end = this.end;
        return Segment.isSufficientlyFlat(distanceEpsilon, curveEpsilon, start, middle, end);
    }
    /**
   * Returns the (sometimes approximate) arc length of the segment.
   */ getArcLength(distanceEpsilon, curveEpsilon, maxLevels) {
        distanceEpsilon = distanceEpsilon === undefined ? 1e-10 : distanceEpsilon;
        curveEpsilon = curveEpsilon === undefined ? 1e-8 : curveEpsilon;
        maxLevels = maxLevels === undefined ? 15 : maxLevels;
        if (maxLevels <= 0 || this.isSufficientlyFlat(distanceEpsilon, curveEpsilon)) {
            return this.start.distance(this.end);
        } else {
            const subdivided = this.subdivided(0.5);
            return subdivided[0].getArcLength(distanceEpsilon, curveEpsilon, maxLevels - 1) + subdivided[1].getArcLength(distanceEpsilon, curveEpsilon, maxLevels - 1);
        }
    }
    /**
   * Returns information about the line dash parametric offsets for a given segment.
   *
   * As always, this is fairly approximate depending on the type of segment.
   *
   * @param lineDash
   * @param lineDashOffset
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */ getDashValues(lineDash, lineDashOffset, distanceEpsilon, curveEpsilon) {
        assert && assert(lineDash.length > 0, 'Do not call with an empty dash array');
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const values = [];
        let arcLength = 0;
        // Do the offset modulo the sum, so that we don't have to cycle for a long time
        const lineDashSum = _.sum(lineDash);
        lineDashOffset = lineDashOffset % lineDashSum;
        // Ensure the lineDashOffset is positive
        if (lineDashOffset < 0) {
            lineDashOffset += lineDashSum;
        }
        // The current section of lineDash that we are in
        let dashIndex = 0;
        let dashOffset = 0;
        let isInside = true;
        function nextDashIndex() {
            dashIndex = (dashIndex + 1) % lineDash.length;
            isInside = !isInside;
        }
        // Burn off initial lineDashOffset
        while(lineDashOffset > 0){
            if (lineDashOffset >= lineDash[dashIndex]) {
                lineDashOffset -= lineDash[dashIndex];
                nextDashIndex();
            } else {
                dashOffset = lineDashOffset;
                lineDashOffset = 0;
            }
        }
        const initiallyInside = isInside;
        // Recursively progress through until we have mostly-linear segments.
        (function recur(t0, t1, p0, p1, depth) {
            // Compute the t/position at the midpoint t value
            const tMid = (t0 + t1) / 2;
            const pMid = self.positionAt(tMid);
            // If it's flat enough (or we hit our recursion limit), process it
            if (depth > 14 || Segment.isSufficientlyFlat(distanceEpsilon, curveEpsilon, p0, pMid, p1)) {
                // Estimate length
                const totalLength = p0.distance(pMid) + pMid.distance(p1);
                arcLength += totalLength;
                // While we are longer than the remaining amount for the next dash change.
                let lengthLeft = totalLength;
                while(dashOffset + lengthLeft >= lineDash[dashIndex]){
                    // Compute the t (for now, based on the total length for ease)
                    const t = Utils.linear(0, totalLength, t0, t1, totalLength - lengthLeft + lineDash[dashIndex] - dashOffset);
                    // Record the dash change
                    values.push(t);
                    // Remove amount added from our lengthLeft (move to the dash)
                    lengthLeft -= lineDash[dashIndex] - dashOffset;
                    dashOffset = 0; // at the dash, we'll have 0 offset
                    nextDashIndex();
                }
                // Spill-over, just add it
                dashOffset = dashOffset + lengthLeft;
            } else {
                recur(t0, tMid, p0, pMid, depth + 1);
                recur(tMid, t1, pMid, p1, depth + 1);
            }
        })(0, 1, this.start, this.end, 0);
        return {
            values: values,
            arcLength: arcLength,
            initiallyInside: initiallyInside
        };
    }
    /**
   *
   * @param [options]
   * @param [minLevels] -   how many levels to force subdivisions
   * @param [maxLevels] -   prevent subdivision past this level
   * @param [segments]
   * @param [start]
   * @param [end]
   */ toPiecewiseLinearSegments(options, minLevels, maxLevels, segments, start, end) {
        // for the first call, initialize min/max levels from our options
        minLevels = minLevels === undefined ? options.minLevels : minLevels;
        maxLevels = maxLevels === undefined ? options.maxLevels : maxLevels;
        segments = segments || [];
        const pointMap = options.pointMap || _.identity;
        // points mapped by the (possibly-nonlinear) pointMap.
        start = start || pointMap(this.start);
        end = end || pointMap(this.end);
        const middle = pointMap(this.positionAt(0.5));
        assert && assert(minLevels <= maxLevels);
        assert && assert(options.distanceEpsilon === null || typeof options.distanceEpsilon === 'number');
        assert && assert(options.curveEpsilon === null || typeof options.curveEpsilon === 'number');
        assert && assert(!pointMap || typeof pointMap === 'function');
        // i.e. we will have finished = maxLevels === 0 || ( minLevels <= 0 && epsilonConstraints ), just didn't want to one-line it
        let finished = maxLevels === 0; // bail out once we reach our maximum number of subdivision levels
        if (!finished && minLevels <= 0) {
            finished = this.isSufficientlyFlat(options.distanceEpsilon === null || options.distanceEpsilon === undefined ? Number.POSITIVE_INFINITY : options.distanceEpsilon, options.curveEpsilon === null || options.curveEpsilon === undefined ? Number.POSITIVE_INFINITY : options.curveEpsilon);
        }
        if (finished) {
            segments.push(new Line(start, end));
        } else {
            const subdividedSegments = this.subdivided(0.5);
            subdividedSegments[0].toPiecewiseLinearSegments(options, minLevels - 1, maxLevels - 1, segments, start, middle);
            subdividedSegments[1].toPiecewiseLinearSegments(options, minLevels - 1, maxLevels - 1, segments, middle, end);
        }
        return segments;
    }
    /**
   * Returns a list of Line and/or Arc segments that approximates this segment.
   */ toPiecewiseLinearOrArcSegments(providedOptions) {
        const options = optionize()({
            minLevels: 2,
            maxLevels: 7,
            curvatureThreshold: 0.02,
            errorThreshold: 10,
            errorPoints: [
                0.25,
                0.75
            ]
        }, providedOptions);
        const segments = [];
        this.toPiecewiseLinearOrArcRecursion(options, options.minLevels, options.maxLevels, segments, 0, 1, this.positionAt(0), this.positionAt(1), this.curvatureAt(0), this.curvatureAt(1));
        return segments;
    }
    /**
   * Helper function for toPiecewiseLinearOrArcSegments. - will push into segments
   */ toPiecewiseLinearOrArcRecursion(options, minLevels, maxLevels, segments, startT, endT, startPoint, endPoint, startCurvature, endCurvature) {
        const middleT = (startT + endT) / 2;
        const middlePoint = this.positionAt(middleT);
        const middleCurvature = this.curvatureAt(middleT);
        if (maxLevels <= 0 || minLevels <= 0 && Math.abs(startCurvature - middleCurvature) + Math.abs(middleCurvature - endCurvature) < options.curvatureThreshold * 2) {
            const segment = Arc.createFromPoints(startPoint, middlePoint, endPoint);
            let needsSplit = false;
            if (segment instanceof Arc) {
                const radiusSquared = segment.radius * segment.radius;
                for(let i = 0; i < options.errorPoints.length; i++){
                    const t = options.errorPoints[i];
                    const point = this.positionAt(startT * (1 - t) + endT * t);
                    if (Math.abs(point.distanceSquared(segment.center) - radiusSquared) > options.errorThreshold) {
                        needsSplit = true;
                        break;
                    }
                }
            }
            if (!needsSplit) {
                segments.push(segment);
                return;
            }
        }
        this.toPiecewiseLinearOrArcRecursion(options, minLevels - 1, maxLevels - 1, segments, startT, middleT, startPoint, middlePoint, startCurvature, middleCurvature);
        this.toPiecewiseLinearOrArcRecursion(options, minLevels - 1, maxLevels - 1, segments, middleT, endT, middlePoint, endPoint, middleCurvature, endCurvature);
    }
    /**
   * Returns a Shape containing just this one segment.
   */ toShape() {
        return new Shape([
            new Subpath([
                this
            ])
        ]);
    }
    getClosestPoints(point) {
        // TODO: solve segments to determine this analytically! (only implemented for Line right now, should be easy to do with some things) https://github.com/phetsims/kite/issues/76
        return Segment.closestToPoint([
            this
        ], point, 1e-7);
    }
    /**
   * List of results (since there can be duplicates), threshold is used for subdivision,
   * where it will exit if all of the segments are shorter than the threshold
   *
   * TODO: solve segments to determine this analytically! https://github.com/phetsims/kite/issues/76
   */ static closestToPoint(segments, point, threshold) {
        const thresholdSquared = threshold * threshold;
        let items = [];
        let bestList = [];
        let bestDistanceSquared = Number.POSITIVE_INFINITY;
        let thresholdOk = false;
        _.each(segments, (segment)=>{
            // if we have an explicit computation for this segment, use it
            if (segment instanceof Line) {
                const infos = segment.explicitClosestToPoint(point);
                _.each(infos, (info)=>{
                    if (info.distanceSquared < bestDistanceSquared) {
                        bestList = [
                            info
                        ];
                        bestDistanceSquared = info.distanceSquared;
                    } else if (info.distanceSquared === bestDistanceSquared) {
                        bestList.push(info);
                    }
                });
            } else {
                // otherwise, we will split based on monotonicity, so we can subdivide
                // separate, so we can map the subdivided segments
                const ts = [
                    0
                ].concat(segment.getInteriorExtremaTs()).concat([
                    1
                ]);
                for(let i = 0; i < ts.length - 1; i++){
                    const ta = ts[i];
                    const tb = ts[i + 1];
                    const pa = segment.positionAt(ta);
                    const pb = segment.positionAt(tb);
                    const bounds = Bounds2.point(pa).addPoint(pb);
                    const minDistanceSquared = bounds.minimumDistanceToPointSquared(point);
                    if (minDistanceSquared <= bestDistanceSquared) {
                        const maxDistanceSquared = bounds.maximumDistanceToPointSquared(point);
                        if (maxDistanceSquared < bestDistanceSquared) {
                            bestDistanceSquared = maxDistanceSquared;
                            bestList = []; // clear it
                        }
                        items.push({
                            ta: ta,
                            tb: tb,
                            pa: pa,
                            pb: pb,
                            segment: segment,
                            bounds: bounds,
                            min: minDistanceSquared,
                            max: maxDistanceSquared
                        });
                    }
                }
            }
        });
        while(items.length && !thresholdOk){
            const curItems = items;
            items = [];
            // whether all of the segments processed are shorter than the threshold
            thresholdOk = true;
            for (const item of curItems){
                if (item.min > bestDistanceSquared) {
                    continue; // drop this item
                }
                if (thresholdOk && item.pa.distanceSquared(item.pb) > thresholdSquared) {
                    thresholdOk = false;
                }
                const tmid = (item.ta + item.tb) / 2;
                const pmid = item.segment.positionAt(tmid);
                const boundsA = Bounds2.point(item.pa).addPoint(pmid);
                const boundsB = Bounds2.point(item.pb).addPoint(pmid);
                const minA = boundsA.minimumDistanceToPointSquared(point);
                const minB = boundsB.minimumDistanceToPointSquared(point);
                if (minA <= bestDistanceSquared) {
                    const maxA = boundsA.maximumDistanceToPointSquared(point);
                    if (maxA < bestDistanceSquared) {
                        bestDistanceSquared = maxA;
                        bestList = []; // clear it
                    }
                    items.push({
                        ta: item.ta,
                        tb: tmid,
                        pa: item.pa,
                        pb: pmid,
                        segment: item.segment,
                        bounds: boundsA,
                        min: minA,
                        max: maxA
                    });
                }
                if (minB <= bestDistanceSquared) {
                    const maxB = boundsB.maximumDistanceToPointSquared(point);
                    if (maxB < bestDistanceSquared) {
                        bestDistanceSquared = maxB;
                        bestList = []; // clear it
                    }
                    items.push({
                        ta: tmid,
                        tb: item.tb,
                        pa: pmid,
                        pb: item.pb,
                        segment: item.segment,
                        bounds: boundsB,
                        min: minB,
                        max: maxB
                    });
                }
            }
        }
        // if there are any closest regions, they are within the threshold, so we will add them all
        _.each(items, (item)=>{
            const t = (item.ta + item.tb) / 2;
            const closestPoint = item.segment.positionAt(t);
            bestList.push({
                segment: item.segment,
                t: t,
                closestPoint: closestPoint,
                distanceSquared: point.distanceSquared(closestPoint)
            });
        });
        return bestList;
    }
    /**
   * Given the cubic-premultiplied values for two cubic bezier curves, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a 1-dimensional cubic bezier determined by the control points p0, p1, p2 and p3, compute:
   *
   * [ p0s ]    [  1   0   0   0 ]   [ p0 ]
   * [ p1s ] == [ -3   3   0   0 ] * [ p1 ]
   * [ p2s ] == [  3  -6   3   0 ] * [ p2 ]
   * [ p3s ]    [ -1   3  -3   1 ]   [ p3 ]
   *
   * see Cubic.getOverlaps for more information.
   */ static polynomialGetOverlapCubic(p0s, p1s, p2s, p3s, q0s, q1s, q2s, q3s) {
        if (q3s === 0) {
            return Segment.polynomialGetOverlapQuadratic(p0s, p1s, p2s, q0s, q1s, q2s);
        }
        const a = Math.sign(p3s / q3s) * Math.pow(Math.abs(p3s / q3s), 1 / 3);
        if (a === 0) {
            return null; // If there would be solutions, then q3s would have been non-zero
        }
        const b = (p2s - a * a * q2s) / (3 * a * a * q3s);
        return {
            a: a,
            b: b
        };
    }
    /**
   * Given the quadratic-premultiplied values for two quadratic bezier curves, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a 1-dimensional quadratic bezier determined by the control points p0, p1, p2, compute:
   *
   * [ p0s ]    [  1   0   0 ]   [ p0 ]
   * [ p1s ] == [ -2   2   0 ] * [ p1 ]
   * [ p2s ]    [  2  -2   3 ] * [ p2 ]
   *
   * see Quadratic.getOverlaps for more information.
   */ static polynomialGetOverlapQuadratic(p0s, p1s, p2s, q0s, q1s, q2s) {
        if (q2s === 0) {
            return Segment.polynomialGetOverlapLinear(p0s, p1s, q0s, q1s);
        }
        const discr = p2s / q2s;
        if (discr < 0) {
            return null; // not possible to have a solution with an imaginary a
        }
        const a = Math.sqrt(p2s / q2s);
        if (a === 0) {
            return null; // If there would be solutions, then q2s would have been non-zero
        }
        const b = (p1s - a * q1s) / (2 * a * q2s);
        return {
            a: a,
            b: b
        };
    }
    /**
   * Given the linear-premultiplied values for two lines, determines (if available) a specified (a,b) pair
   * such that p( t ) === q( a * t + b ).
   *
   * Given a line determined by the control points p0, p1, compute:
   *
   * [ p0s ] == [  1   0 ] * [ p0 ]
   * [ p1s ] == [ -1   1 ] * [ p1 ]
   *
   * see Quadratic/Cubic.getOverlaps for more information.
   */ static polynomialGetOverlapLinear(p0s, p1s, q0s, q1s) {
        if (q1s === 0) {
            if (p0s === q0s) {
                return true;
            } else {
                return null;
            }
        }
        const a = p1s / q1s;
        if (a === 0) {
            return null;
        }
        const b = (p0s - q0s) / q1s;
        return {
            a: a,
            b: b
        };
    }
    /**
   * Returns all the distinct (non-endpoint, non-finite) intersections between the two segments.
   */ static intersect(a, b) {
        if (Line && a instanceof Line && b instanceof Line) {
            return Line.intersect(a, b);
        } else if (Line && a instanceof Line) {
            return Line.intersectOther(a, b);
        } else if (Line && b instanceof Line) {
            // need to swap our intersections, since 'b' is the line
            return Line.intersectOther(b, a).map(swapSegmentIntersection);
        } else if (Arc && a instanceof Arc && b instanceof Arc) {
            return Arc.intersect(a, b);
        } else if (EllipticalArc && a instanceof EllipticalArc && b instanceof EllipticalArc) {
            return EllipticalArc.intersect(a, b);
        } else if (Quadratic && Cubic && (a instanceof Quadratic || a instanceof Cubic) && (b instanceof Quadratic || b instanceof Cubic)) {
            const cubicA = a instanceof Cubic ? a : a.degreeElevated();
            const cubicB = b instanceof Cubic ? b : b.degreeElevated();
            // @ts-expect-error (no type definitions yet, perhaps useful if we use it more)
            const paperCurveA = new paper.Curve(cubicA.start.x, cubicA.start.y, cubicA.control1.x, cubicA.control1.y, cubicA.control2.x, cubicA.control2.y, cubicA.end.x, cubicA.end.y);
            // @ts-expect-error (no type definitions yet, perhaps useful if we use it more)
            const paperCurveB = new paper.Curve(cubicB.start.x, cubicB.start.y, cubicB.control1.x, cubicB.control1.y, cubicB.control2.x, cubicB.control2.y, cubicB.end.x, cubicB.end.y);
            const paperIntersections = paperCurveA.getIntersections(paperCurveB);
            return paperIntersections.map((paperIntersection)=>{
                const point = new Vector2(paperIntersection.point.x, paperIntersection.point.y);
                return new SegmentIntersection(point, paperIntersection.time, paperIntersection.intersection.time);
            });
        } else {
            return BoundsIntersection.intersect(a, b);
        }
    }
    /**
   * Returns a Segment from the serialized representation.
   */ static deserialize(obj) {
        // TODO: just import them now that we have circular reference protection, and switch between https://github.com/phetsims/kite/issues/76
        // @ts-expect-error TODO: namespacing https://github.com/phetsims/kite/issues/76
        assert && assert(obj.type && kite[obj.type] && kite[obj.type].deserialize);
        // @ts-expect-error TODO: namespacing https://github.com/phetsims/kite/issues/76
        return kite[obj.type].deserialize(obj);
    }
    /**
   * Determines if the start/middle/end points are representative of a sufficiently flat segment
   * (given certain epsilon values)
   *
   * @param start
   * @param middle
   * @param end
   * @param distanceEpsilon - controls level of subdivision by attempting to ensure a maximum (squared)
   *                          deviation from the curve
   * @param curveEpsilon - controls level of subdivision by attempting to ensure a maximum curvature change
   *                       between segments
   */ static isSufficientlyFlat(distanceEpsilon, curveEpsilon, start, middle, end) {
        // flatness criterion: A=start, B=end, C=midpoint, d0=distance from AB, d1=||B-A||, subdivide if d0/d1 > sqrt(epsilon)
        if (Utils.distToSegmentSquared(middle, start, end) / start.distanceSquared(end) > curveEpsilon) {
            return false;
        }
        // deviation criterion
        if (Utils.distToSegmentSquared(middle, start, end) > distanceEpsilon) {
            return false;
        }
        return true;
    }
    static filterClosestToPointResult(results) {
        if (results.length === 0) {
            return [];
        }
        const closestDistanceSquared = _.minBy(results, (result)=>result.distanceSquared).distanceSquared;
        // Return all results that are within 1e-11 of the closest distance (to account for floating point error), but unique
        // based on the location.
        return _.uniqWith(results.filter((result)=>Math.abs(result.distanceSquared - closestDistanceSquared) < 1e-11), (a, b)=>a.closestPoint.distanceSquared(b.closestPoint) < 1e-11);
    }
    constructor(){
        this.invalidationEmitter = new TinyEmitter();
    }
};
export { Segment as default };
kite.register('Segment', Segment);
function swapSegmentIntersection(segmentIntersection) {
    return segmentIntersection.getSwapped();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvc2VnbWVudHMvU2VnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNlZ21lbnQgcmVwcmVzZW50cyBhIHNwZWNpZmljIGN1cnZlIHdpdGggYSBzdGFydCBhbmQgZW5kLlxuICpcbiAqIEVhY2ggc2VnbWVudCBpcyB0cmVhdGVkIHBhcmFtZXRyaWNhbGx5LCB3aGVyZSB0PTAgaXMgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50LCBhbmQgdD0xIGlzIHRoZSBlbmQuIFZhbHVlcyBvZiB0XG4gKiBiZXR3ZWVuIHRob3NlIHJlcHJlc2VudCBwb2ludHMgYWxvbmcgdGhlIHNlZ21lbnQuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8qIGdsb2JhbCBwYXBlciAqL1xuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JheTIuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgS2V5c01hdGNoaW5nIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9LZXlzTWF0Y2hpbmcuanMnO1xuaW1wb3J0IHsgQXJjLCBCb3VuZHNJbnRlcnNlY3Rpb24sIEN1YmljLCBFbGxpcHRpY2FsQXJjLCBraXRlLCBMaW5lLCBRdWFkcmF0aWMsIFJheUludGVyc2VjdGlvbiwgU2VnbWVudEludGVyc2VjdGlvbiwgU2VyaWFsaXplZEFyYywgU2VyaWFsaXplZEN1YmljLCBTZXJpYWxpemVkRWxsaXB0aWNhbEFyYywgU2VyaWFsaXplZExpbmUsIFNlcmlhbGl6ZWRRdWFkcmF0aWMsIFNoYXBlLCBTdWJwYXRoIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCB0eXBlIERhc2hWYWx1ZXMgPSB7XG5cbiAgLy8gUGFyYW1ldHJpYyAodCkgdmFsdWVzIGZvciB3aGVyZSBkYXNoIGJvdW5kYXJpZXMgZXhpc3RcbiAgdmFsdWVzOiBudW1iZXJbXTtcblxuICAvLyBUb3RhbCBhcmMgbGVuZ3RoIGZvciB0aGlzIHNlZ21lbnRcbiAgYXJjTGVuZ3RoOiBudW1iZXI7XG5cbiAgLy8gV2hldGhlciB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnQgaXMgaW5zaWRlIGEgZGFzaCAoaW5zdGVhZCBvZiBhIGdhcClcbiAgaW5pdGlhbGx5SW5zaWRlOiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgU2VyaWFsaXplZFNlZ21lbnQgPSBTZXJpYWxpemVkQXJjIHwgU2VyaWFsaXplZEN1YmljIHwgU2VyaWFsaXplZEVsbGlwdGljYWxBcmMgfCBTZXJpYWxpemVkTGluZSB8IFNlcmlhbGl6ZWRRdWFkcmF0aWM7XG5cbnR5cGUgU2ltcGxlT3ZlcmxhcCA9IHtcbiAgYTogbnVtYmVyO1xuICBiOiBudW1iZXI7XG59O1xuXG4vLyBudWxsIGlmIG5vIHNvbHV0aW9uLCB0cnVlIGlmIGV2ZXJ5IGEsYiBwYWlyIGlzIGEgc29sdXRpb24sIG90aGVyd2lzZSB0aGUgc2luZ2xlIHNvbHV0aW9uXG50eXBlIFBvc3NpYmxlU2ltcGxlT3ZlcmxhcCA9IFNpbXBsZU92ZXJsYXAgfCBudWxsIHwgdHJ1ZTtcblxuZXhwb3J0IHR5cGUgQ2xvc2VzdFRvUG9pbnRSZXN1bHQgPSB7XG4gIHNlZ21lbnQ6IFNlZ21lbnQ7XG4gIHQ6IG51bWJlcjtcbiAgY2xvc2VzdFBvaW50OiBWZWN0b3IyO1xuICBkaXN0YW5jZVNxdWFyZWQ6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFBpZWNld2lzZUxpbmVhck9wdGlvbnMgPSB7XG4gIC8vIGhvdyBtYW55IGxldmVscyB0byBmb3JjZSBzdWJkaXZpc2lvbnNcbiAgbWluTGV2ZWxzPzogbnVtYmVyO1xuXG4gIC8vIHByZXZlbnQgc3ViZGl2aXNpb24gcGFzdCB0aGlzIGxldmVsXG4gIG1heExldmVscz86IG51bWJlcjtcblxuICAvLyBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpIGRldmlhdGlvbiBmcm9tIHRoZSBjdXJ2ZVxuICBkaXN0YW5jZUVwc2lsb24/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIGNvbnRyb2xzIGxldmVsIG9mIHN1YmRpdmlzaW9uIGJ5IGF0dGVtcHRpbmcgdG8gZW5zdXJlIGEgbWF4aW11bSBjdXJ2YXR1cmUgY2hhbmdlIGJldHdlZW4gc2VnbWVudHNcbiAgY3VydmVFcHNpbG9uPzogbnVtYmVyIHwgbnVsbDtcblxuICAvLyByZXByZXNlbnRzIGEgKHVzdWFsbHkgbm9uLWxpbmVhcikgdHJhbnNmb3JtYXRpb24gYXBwbGllZFxuICBwb2ludE1hcD86ICggdjogVmVjdG9yMiApID0+IFZlY3RvcjI7XG5cbiAgLy8gaWYgdGhlIG1ldGhvZCBuYW1lIGlzIGZvdW5kIG9uIHRoZSBzZWdtZW50LCBpdCBpcyBjYWxsZWQgd2l0aCB0aGUgZXhwZWN0ZWQgc2lnbmF0dXJlXG4gIC8vIGZ1bmN0aW9uKCBvcHRpb25zICkgOiBBcnJheVtTZWdtZW50XSBpbnN0ZWFkIG9mIHVzaW5nIG91ciBicnV0ZS1mb3JjZSBsb2dpY1xuICBtZXRob2ROYW1lPzogS2V5c01hdGNoaW5nPFNlZ21lbnQsICggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucyApID0+IFNlZ21lbnRbXT4gfFxuICAgICAgICAgICAgICAgS2V5c01hdGNoaW5nPEFyYywgKCBvcHRpb25zOiBQaWVjZXdpc2VMaW5lYXJPcHRpb25zICkgPT4gU2VnbWVudFtdPiB8XG4gICAgICAgICAgICAgICBLZXlzTWF0Y2hpbmc8Q3ViaWMsICggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucyApID0+IFNlZ21lbnRbXT4gfFxuICAgICAgICAgICAgICAgS2V5c01hdGNoaW5nPEVsbGlwdGljYWxBcmMsICggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucyApID0+IFNlZ21lbnRbXT4gfFxuICAgICAgICAgICAgICAgS2V5c01hdGNoaW5nPExpbmUsICggb3B0aW9uczogUGllY2V3aXNlTGluZWFyT3B0aW9ucyApID0+IFNlZ21lbnRbXT4gfFxuICAgICAgICAgICAgICAgS2V5c01hdGNoaW5nPFF1YWRyYXRpYywgKCBvcHRpb25zOiBQaWVjZXdpc2VMaW5lYXJPcHRpb25zICkgPT4gU2VnbWVudFtdPjtcbn07XG5cbnR5cGUgUGllY2V3aXNlTGluZWFyT3JBcmNSZWN1cnNpb25PcHRpb25zID0ge1xuICBjdXJ2YXR1cmVUaHJlc2hvbGQ6IG51bWJlcjtcbiAgZXJyb3JUaHJlc2hvbGQ6IG51bWJlcjtcbiAgZXJyb3JQb2ludHM6IFtudW1iZXIsIG51bWJlcl07XG59O1xuXG50eXBlIFBpZWNld2lzZUxpbmVhck9yQXJjT3B0aW9ucyA9IHtcbiAgbWluTGV2ZWxzPzogbnVtYmVyO1xuICBtYXhMZXZlbHM/OiBudW1iZXI7XG59ICYgUGFydGlhbDxQaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbk9wdGlvbnM+O1xuXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBTZWdtZW50IHtcblxuICBwdWJsaWMgaW52YWxpZGF0aW9uRW1pdHRlcjogVEVtaXR0ZXI7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW52YWxpZGF0aW9uRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuICB9XG5cbiAgLy8gVGhlIHN0YXJ0IHBvaW50IG9mIHRoZSBzZWdtZW50LCBwYXJhbWV0cmljYWxseSBhdCB0PTAuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXQgc3RhcnQoKTogVmVjdG9yMjtcblxuICAvLyBUaGUgZW5kIHBvaW50IG9mIHRoZSBzZWdtZW50LCBwYXJhbWV0cmljYWxseSBhdCB0PTEuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXQgZW5kKCk6IFZlY3RvcjI7XG5cbiAgLy8gVGhlIG5vcm1hbGl6ZWQgdGFuZ2VudCB2ZWN0b3IgdG8gdGhlIHNlZ21lbnQgYXQgaXRzIHN0YXJ0IHBvaW50LCBwb2ludGluZyBpbiB0aGUgZGlyZWN0aW9uIG9mIG1vdGlvbiAoZnJvbSBzdGFydCB0b1xuICAvLyBlbmQpLlxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0IHN0YXJ0VGFuZ2VudCgpOiBWZWN0b3IyO1xuXG4gIC8vIFRoZSBub3JtYWxpemVkIHRhbmdlbnQgdmVjdG9yIHRvIHRoZSBzZWdtZW50IGF0IGl0cyBlbmQgcG9pbnQsIHBvaW50aW5nIGluIHRoZSBkaXJlY3Rpb24gb2YgbW90aW9uIChmcm9tIHN0YXJ0IHRvXG4gIC8vIGVuZCkuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXQgZW5kVGFuZ2VudCgpOiBWZWN0b3IyO1xuXG4gIC8vIFRoZSBib3VuZGluZyBib3ggZm9yIHRoZSBzZWdtZW50LlxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0IGJvdW5kcygpOiBCb3VuZHMyO1xuXG4gIC8vIFJldHVybnMgdGhlIHBvc2l0aW9uIHBhcmFtZXRyaWNhbGx5LCB3aXRoIDAgPD0gdCA8PSAxLiBOT1RFIHRoYXQgdGhpcyBmdW5jdGlvbiBkb2Vzbid0IGtlZXAgYSBjb25zdGFudCBtYWduaXR1ZGVcbiAgLy8gdGFuZ2VudC5cbiAgcHVibGljIGFic3RyYWN0IHBvc2l0aW9uQXQoIHQ6IG51bWJlciApOiBWZWN0b3IyO1xuXG4gIC8vIFJldHVybnMgdGhlIG5vbi1ub3JtYWxpemVkIHRhbmdlbnQgKGR4L2R0LCBkeS9kdCkgb2YgdGhpcyBzZWdtZW50IGF0IHRoZSBwYXJhbWV0cmljIHZhbHVlIG9mIHQsIHdpdGggMCA8PSB0IDw9IDEuXG4gIHB1YmxpYyBhYnN0cmFjdCB0YW5nZW50QXQoIHQ6IG51bWJlciApOiBWZWN0b3IyO1xuXG4gIC8vIFJldHVybnMgdGhlIHNpZ25lZCBjdXJ2YXR1cmUgKHBvc2l0aXZlIGZvciB2aXN1YWwgY2xvY2t3aXNlIC0gbWF0aGVtYXRpY2FsIGNvdW50ZXJjbG9ja3dpc2UpXG4gIHB1YmxpYyBhYnN0cmFjdCBjdXJ2YXR1cmVBdCggdDogbnVtYmVyICk6IG51bWJlcjtcblxuICAvLyBSZXR1cm5zIGFuIGFycmF5IHdpdGggdXAgdG8gMiBzdWItc2VnbWVudHMsIHNwbGl0IGF0IHRoZSBwYXJhbWV0cmljIHQgdmFsdWUuIFRoZSBzZWdtZW50cyB0b2dldGhlciBzaG91bGQgbWFrZSB0aGVcbiAgLy8gc2FtZSBzaGFwZSBhcyB0aGUgb3JpZ2luYWwgc2VnbWVudC5cbiAgcHVibGljIGFic3RyYWN0IHN1YmRpdmlkZWQoIHQ6IG51bWJlciApOiBTZWdtZW50W107XG5cbiAgLy8gUmV0dXJucyBhIHN0cmluZyBjb250YWluaW5nIHRoZSBTVkcgcGF0aC4gYXNzdW1lcyB0aGF0IHRoZSBzdGFydCBwb2ludCBpcyBhbHJlYWR5IHByb3ZpZGVkLCBzbyBhbnl0aGluZyB0aGF0IGNhbGxzXG4gIC8vIHRoaXMgbmVlZHMgdG8gcHV0IHRoZSBNIGNhbGxzIGZpcnN0XG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRTVkdQYXRoRnJhZ21lbnQoKTogc3RyaW5nO1xuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2Ygc2VnbWVudHMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIGxlZnQgc2lkZVxuICBwdWJsaWMgYWJzdHJhY3Qgc3Ryb2tlTGVmdCggbGluZVdpZHRoOiBudW1iZXIgKTogU2VnbWVudFtdO1xuXG4gIC8vIFJldHVybnMgYW4gYXJyYXkgb2Ygc2VnbWVudHMgdGhhdCB3aWxsIGRyYXcgYW4gb2Zmc2V0IGN1cnZlIG9uIHRoZSBsb2dpY2FsIHJpZ2h0IHNpZGVcbiAgcHVibGljIGFic3RyYWN0IHN0cm9rZVJpZ2h0KCBsaW5lV2lkdGg6IG51bWJlciApOiBTZWdtZW50W107XG5cbiAgLy8gUmV0dXJucyB0aGUgd2luZGluZyBudW1iZXIgZm9yIGludGVyc2VjdGlvbiB3aXRoIGEgcmF5XG4gIHB1YmxpYyBhYnN0cmFjdCB3aW5kaW5nSW50ZXJzZWN0aW9uKCByYXk6IFJheTIgKTogbnVtYmVyO1xuXG4gIC8vIFJldHVybnMgYSBsaXN0IG9mIHQgdmFsdWVzIHdoZXJlIGR4L2R0IG9yIGR5L2R0IGlzIDAgd2hlcmUgMCA8IHQgPCAxLiBzdWJkaXZpZGluZyBvbiB0aGVzZSB3aWxsIHJlc3VsdCBpbiBtb25vdG9uaWNcbiAgLy8gc2VnbWVudHNcbiAgcHVibGljIGFic3RyYWN0IGdldEludGVyaW9yRXh0cmVtYVRzKCk6IG51bWJlcltdO1xuXG4gIC8vIFJldHVybnMgYSBsaXN0IG9mIGludGVyc2VjdGlvbnMgYmV0d2VlbiB0aGUgc2VnbWVudCBhbmQgdGhlIHJheS5cbiAgcHVibGljIGFic3RyYWN0IGludGVyc2VjdGlvbiggcmF5OiBSYXkyICk6IFJheUludGVyc2VjdGlvbltdO1xuXG4gIC8vIFJldHVybnMgYSB7Qm91bmRzMn0gcmVwcmVzZW50aW5nIHRoZSBib3VuZGluZyBib3ggZm9yIHRoZSBzZWdtZW50LlxuICBwdWJsaWMgYWJzdHJhY3QgZ2V0Qm91bmRzKCk6IEJvdW5kczI7XG5cbiAgLy8gUmV0dXJucyBzaWduZWQgYXJlYSBjb250cmlidXRpb24gZm9yIHRoaXMgc2VnbWVudCB1c2luZyBHcmVlbidzIFRoZW9yZW1cbiAgcHVibGljIGFic3RyYWN0IGdldFNpZ25lZEFyZWFGcmFnbWVudCgpOiBudW1iZXI7XG5cbiAgLy8gUmV0dXJucyBhIGxpc3Qgb2Ygbm9uLWRlZ2VuZXJhdGUgc2VnbWVudHMgdGhhdCBhcmUgZXF1aXZhbGVudCB0byB0aGlzIHNlZ21lbnQuIEdlbmVyYWxseSBnZXRzIHJpZCAob3Igc2ltcGxpZmllcylcbiAgLy8gaW52YWxpZCBvciByZXBlYXRlZCBzZWdtZW50cy5cbiAgcHVibGljIGFic3RyYWN0IGdldE5vbmRlZ2VuZXJhdGVTZWdtZW50cygpOiBTZWdtZW50W107XG5cbiAgLy8gRHJhd3MgdGhlIHNlZ21lbnQgdG8gdGhlIDJEIENhbnZhcyBjb250ZXh0LCBhc3N1bWluZyB0aGUgY29udGV4dCdzIGN1cnJlbnQgbG9jYXRpb24gaXMgYWxyZWFkeSBhdCB0aGUgc3RhcnQgcG9pbnRcbiAgcHVibGljIGFic3RyYWN0IHdyaXRlVG9Db250ZXh0KCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZDtcblxuICAvLyBSZXR1cm5zIGEgbmV3IHNlZ21lbnQgdGhhdCByZXByZXNlbnRzIHRoaXMgc2VnbWVudCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBieSB0aGUgbWF0cml4XG4gIHB1YmxpYyBhYnN0cmFjdCB0cmFuc2Zvcm1lZCggbWF0cml4OiBNYXRyaXgzICk6IFNlZ21lbnQ7XG5cbiAgcHVibGljIGFic3RyYWN0IGludmFsaWRhdGUoKTogdm9pZDtcblxuICBwdWJsaWMgYWJzdHJhY3Qgc2VyaWFsaXplKCk6IFNlcmlhbGl6ZWRTZWdtZW50O1xuXG4gIC8qKlxuICAgKiBXaWxsIHJldHVybiB0cnVlIGlmIHRoZSBzdGFydC9lbmQgdGFuZ2VudHMgYXJlIHB1cmVseSB2ZXJ0aWNhbCBvciBob3Jpem9udGFsLiBJZiBhbGwgb2YgdGhlIHNlZ21lbnRzIG9mIGEgc2hhcGVcbiAgICogaGF2ZSB0aGlzIHByb3BlcnR5LCB0aGVuIHRoZSBvbmx5IGxpbmUgam9pbnMgd2lsbCBiZSBhIG11bHRpcGxlIG9mIHBpLzIgKDkwIGRlZ3JlZXMpLCBhbmQgc28gYWxsIG9mIHRoZSB0eXBlcyBvZlxuICAgKiBsaW5lIGpvaW5zIHdpbGwgaGF2ZSB0aGUgc2FtZSBib3VuZHMuIFRoaXMgbWVhbnMgdGhhdCB0aGUgc3Ryb2tlZCBib3VuZHMgd2lsbCBqdXN0IGJlIGEgcHVyZSBkaWxhdGlvbiBvZiB0aGVcbiAgICogcmVndWxhciBib3VuZHMsIGJ5IGxpbmVXaWR0aCAvIDIuXG4gICAqL1xuICBwdWJsaWMgYXJlU3Ryb2tlZEJvdW5kc0RpbGF0ZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMTtcblxuICAgIC8vIElmIHRoZSBkZXJpdmF0aXZlIGF0IHRoZSBzdGFydC9lbmQgYXJlIHBvaW50aW5nIGluIGEgY2FyZGluYWwgZGlyZWN0aW9uIChub3J0aC9zb3V0aC9lYXN0L3dlc3QpLCB0aGVuIHRoZVxuICAgIC8vIGVuZHBvaW50cyB3b24ndCB0cmlnZ2VyIG5vbi1kaWxhdGVkIGJvdW5kcywgYW5kIHRoZSBpbnRlcmlvciBvZiB0aGUgY3VydmUgd2lsbCBub3QgY29udHJpYnV0ZS5cbiAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMuc3RhcnRUYW5nZW50LnggKiB0aGlzLnN0YXJ0VGFuZ2VudC55ICkgPCBlcHNpbG9uICYmIE1hdGguYWJzKCB0aGlzLmVuZFRhbmdlbnQueCAqIHRoaXMuZW5kVGFuZ2VudC55ICkgPCBlcHNpbG9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IG92ZXJyaWRlIGV2ZXJ5d2hlcmUgc28gdGhpcyBpc24ndCBuZWNlc3NhcnkgKGl0J3Mgbm90IHBhcnRpY3VsYXJseSBlZmZpY2llbnQhKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICovXG4gIHB1YmxpYyBnZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XG4gICAgY29uc3QgdHJhbnNmb3JtZWRTZWdtZW50ID0gdGhpcy50cmFuc2Zvcm1lZCggbWF0cml4ICk7XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVkU2VnbWVudC5nZXRCb3VuZHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0cyBhIHNsaWNlIG9mIGEgc2VnbWVudCwgYmFzZWQgb24gdGhlIHBhcmFtZXRyaWMgdmFsdWUuXG4gICAqXG4gICAqIEdpdmVuIHRoYXQgdGhpcyBzZWdtZW50IGlzIHJlcHJlc2VudGVkIGJ5IHRoZSBpbnRlcnZhbCBbMCwxXVxuICAgKi9cbiAgcHVibGljIHNsaWNlKCB0MDogbnVtYmVyLCB0MTogbnVtYmVyICk6IFNlZ21lbnQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQwID49IDAgJiYgdDAgPD0gMSAmJiB0MSA+PSAwICYmIHQxIDw9IDEsICdQYXJhbWV0cmljIHZhbHVlIG91dCBvZiByYW5nZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0MCA8IHQxICk7XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBsZXQgc2VnbWVudDogU2VnbWVudCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC10aGlzXG4gICAgaWYgKCB0MSA8IDEgKSB7XG4gICAgICBzZWdtZW50ID0gc2VnbWVudC5zdWJkaXZpZGVkKCB0MSApWyAwIF07XG4gICAgfVxuICAgIGlmICggdDAgPiAwICkge1xuICAgICAgc2VnbWVudCA9IHNlZ21lbnQuc3ViZGl2aWRlZCggVXRpbHMubGluZWFyKCAwLCB0MSwgMCwgMSwgdDAgKSApWyAxIF07XG4gICAgfVxuICAgIHJldHVybiBzZWdtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0TGlzdCAtIGxpc3Qgb2Ygc29ydGVkIHQgdmFsdWVzIGZyb20gMCA8PSB0IDw9IDFcbiAgICovXG4gIHB1YmxpYyBzdWJkaXZpc2lvbnMoIHRMaXN0OiBudW1iZXJbXSApOiBTZWdtZW50W10ge1xuICAgIC8vIHRoaXMgY291bGQgYmUgc29sdmVkIGJ5IHJlY3Vyc2lvbiwgYnV0IHdlIGRvbid0IHBsYW4gb24gdGhlIEpTIGVuZ2luZSBkb2luZyB0YWlsLWNhbGwgb3B0aW1pemF0aW9uXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBsZXQgcmlnaHQ6IFNlZ21lbnQgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgLy8gYXNzdW1lIGJpbmFyeSBzdWJkaXZpc2lvblxuICAgICAgY29uc3QgdCA9IHRMaXN0WyBpIF07XG4gICAgICBjb25zdCBhcnIgPSByaWdodC5zdWJkaXZpZGVkKCB0ICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnIubGVuZ3RoID09PSAyICk7XG4gICAgICByZXN1bHQucHVzaCggYXJyWyAwIF0gKTtcbiAgICAgIHJpZ2h0ID0gYXJyWyAxIF07XG5cbiAgICAgIC8vIHNjYWxlIHVwIHRoZSByZW1haW5pbmcgdCB2YWx1ZXNcbiAgICAgIGZvciAoIGxldCBqID0gaSArIDE7IGogPCB0TGlzdC5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgdExpc3RbIGogXSA9IFV0aWxzLmxpbmVhciggdCwgMSwgMCwgMSwgdExpc3RbIGogXSApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQucHVzaCggcmlnaHQgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiBzZWdtZW50cyBmcm9tIGJyZWFraW5nIHRoaXMgc2VnbWVudCBpbnRvIG1vbm90b25lIHBpZWNlc1xuICAgKi9cbiAgcHVibGljIHN1YmRpdmlkZWRJbnRvTW9ub3RvbmUoKTogU2VnbWVudFtdIHtcbiAgICByZXR1cm4gdGhpcy5zdWJkaXZpc2lvbnMoIHRoaXMuZ2V0SW50ZXJpb3JFeHRyZW1hVHMoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhlIHNlZ21lbnQgaXMgc3VmZmljaWVudGx5IGZsYXQgKGdpdmVuIGNlcnRhaW4gZXBzaWxvbiB2YWx1ZXMpXG4gICAqXG4gICAqIEBwYXJhbSBkaXN0YW5jZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcbiAgICogQHBhcmFtIGN1cnZlRXBzaWxvbiAtIGNvbnRyb2xzIGxldmVsIG9mIHN1YmRpdmlzaW9uIGJ5IGF0dGVtcHRpbmcgdG8gZW5zdXJlIGEgbWF4aW11bSBjdXJ2YXR1cmUgY2hhbmdlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBiZXR3ZWVuIHNlZ21lbnRzXG4gICAqL1xuICBwdWJsaWMgaXNTdWZmaWNpZW50bHlGbGF0KCBkaXN0YW5jZUVwc2lsb246IG51bWJlciwgY3VydmVFcHNpbG9uOiBudW1iZXIgKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnN0YXJ0O1xuICAgIGNvbnN0IG1pZGRsZSA9IHRoaXMucG9zaXRpb25BdCggMC41ICk7XG4gICAgY29uc3QgZW5kID0gdGhpcy5lbmQ7XG5cbiAgICByZXR1cm4gU2VnbWVudC5pc1N1ZmZpY2llbnRseUZsYXQoIGRpc3RhbmNlRXBzaWxvbiwgY3VydmVFcHNpbG9uLCBzdGFydCwgbWlkZGxlLCBlbmQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSAoc29tZXRpbWVzIGFwcHJveGltYXRlKSBhcmMgbGVuZ3RoIG9mIHRoZSBzZWdtZW50LlxuICAgKi9cbiAgcHVibGljIGdldEFyY0xlbmd0aCggZGlzdGFuY2VFcHNpbG9uPzogbnVtYmVyLCBjdXJ2ZUVwc2lsb24/OiBudW1iZXIsIG1heExldmVscz86IG51bWJlciApOiBudW1iZXIge1xuICAgIGRpc3RhbmNlRXBzaWxvbiA9IGRpc3RhbmNlRXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gMWUtMTAgOiBkaXN0YW5jZUVwc2lsb247XG4gICAgY3VydmVFcHNpbG9uID0gY3VydmVFcHNpbG9uID09PSB1bmRlZmluZWQgPyAxZS04IDogY3VydmVFcHNpbG9uO1xuICAgIG1heExldmVscyA9IG1heExldmVscyA9PT0gdW5kZWZpbmVkID8gMTUgOiBtYXhMZXZlbHM7XG5cbiAgICBpZiAoIG1heExldmVscyA8PSAwIHx8IHRoaXMuaXNTdWZmaWNpZW50bHlGbGF0KCBkaXN0YW5jZUVwc2lsb24sIGN1cnZlRXBzaWxvbiApICkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhcnQuZGlzdGFuY2UoIHRoaXMuZW5kICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3Qgc3ViZGl2aWRlZCA9IHRoaXMuc3ViZGl2aWRlZCggMC41ICk7XG4gICAgICByZXR1cm4gc3ViZGl2aWRlZFsgMCBdLmdldEFyY0xlbmd0aCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIG1heExldmVscyAtIDEgKSArXG4gICAgICAgICAgICAgc3ViZGl2aWRlZFsgMSBdLmdldEFyY0xlbmd0aCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIG1heExldmVscyAtIDEgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbGluZSBkYXNoIHBhcmFtZXRyaWMgb2Zmc2V0cyBmb3IgYSBnaXZlbiBzZWdtZW50LlxuICAgKlxuICAgKiBBcyBhbHdheXMsIHRoaXMgaXMgZmFpcmx5IGFwcHJveGltYXRlIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiBzZWdtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gbGluZURhc2hcbiAgICogQHBhcmFtIGxpbmVEYXNoT2Zmc2V0XG4gICAqIEBwYXJhbSBkaXN0YW5jZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gKHNxdWFyZWQpXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZpYXRpb24gZnJvbSB0aGUgY3VydmVcbiAgICogQHBhcmFtIGN1cnZlRXBzaWxvbiAtIGNvbnRyb2xzIGxldmVsIG9mIHN1YmRpdmlzaW9uIGJ5IGF0dGVtcHRpbmcgdG8gZW5zdXJlIGEgbWF4aW11bSBjdXJ2YXR1cmUgY2hhbmdlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBiZXR3ZWVuIHNlZ21lbnRzXG4gICAqL1xuICBwdWJsaWMgZ2V0RGFzaFZhbHVlcyggbGluZURhc2g6IG51bWJlcltdLCBsaW5lRGFzaE9mZnNldDogbnVtYmVyLCBkaXN0YW5jZUVwc2lsb246IG51bWJlciwgY3VydmVFcHNpbG9uOiBudW1iZXIgKTogRGFzaFZhbHVlcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGluZURhc2gubGVuZ3RoID4gMCwgJ0RvIG5vdCBjYWxsIHdpdGggYW4gZW1wdHkgZGFzaCBhcnJheScgKTtcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgbGV0IGFyY0xlbmd0aCA9IDA7XG5cbiAgICAvLyBEbyB0aGUgb2Zmc2V0IG1vZHVsbyB0aGUgc3VtLCBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gY3ljbGUgZm9yIGEgbG9uZyB0aW1lXG4gICAgY29uc3QgbGluZURhc2hTdW0gPSBfLnN1bSggbGluZURhc2ggKTtcbiAgICBsaW5lRGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0ICUgbGluZURhc2hTdW07XG5cbiAgICAvLyBFbnN1cmUgdGhlIGxpbmVEYXNoT2Zmc2V0IGlzIHBvc2l0aXZlXG4gICAgaWYgKCBsaW5lRGFzaE9mZnNldCA8IDAgKSB7XG4gICAgICBsaW5lRGFzaE9mZnNldCArPSBsaW5lRGFzaFN1bTtcbiAgICB9XG5cbiAgICAvLyBUaGUgY3VycmVudCBzZWN0aW9uIG9mIGxpbmVEYXNoIHRoYXQgd2UgYXJlIGluXG4gICAgbGV0IGRhc2hJbmRleCA9IDA7XG4gICAgbGV0IGRhc2hPZmZzZXQgPSAwO1xuICAgIGxldCBpc0luc2lkZSA9IHRydWU7XG5cbiAgICBmdW5jdGlvbiBuZXh0RGFzaEluZGV4KCk6IHZvaWQge1xuICAgICAgZGFzaEluZGV4ID0gKCBkYXNoSW5kZXggKyAxICkgJSBsaW5lRGFzaC5sZW5ndGg7XG4gICAgICBpc0luc2lkZSA9ICFpc0luc2lkZTtcbiAgICB9XG5cbiAgICAvLyBCdXJuIG9mZiBpbml0aWFsIGxpbmVEYXNoT2Zmc2V0XG4gICAgd2hpbGUgKCBsaW5lRGFzaE9mZnNldCA+IDAgKSB7XG4gICAgICBpZiAoIGxpbmVEYXNoT2Zmc2V0ID49IGxpbmVEYXNoWyBkYXNoSW5kZXggXSApIHtcbiAgICAgICAgbGluZURhc2hPZmZzZXQgLT0gbGluZURhc2hbIGRhc2hJbmRleCBdO1xuICAgICAgICBuZXh0RGFzaEluZGV4KCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGFzaE9mZnNldCA9IGxpbmVEYXNoT2Zmc2V0O1xuICAgICAgICBsaW5lRGFzaE9mZnNldCA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW5pdGlhbGx5SW5zaWRlID0gaXNJbnNpZGU7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBwcm9ncmVzcyB0aHJvdWdoIHVudGlsIHdlIGhhdmUgbW9zdGx5LWxpbmVhciBzZWdtZW50cy5cbiAgICAoIGZ1bmN0aW9uIHJlY3VyKCB0MDogbnVtYmVyLCB0MTogbnVtYmVyLCBwMDogVmVjdG9yMiwgcDE6IFZlY3RvcjIsIGRlcHRoOiBudW1iZXIgKSB7XG4gICAgICAvLyBDb21wdXRlIHRoZSB0L3Bvc2l0aW9uIGF0IHRoZSBtaWRwb2ludCB0IHZhbHVlXG4gICAgICBjb25zdCB0TWlkID0gKCB0MCArIHQxICkgLyAyO1xuICAgICAgY29uc3QgcE1pZCA9IHNlbGYucG9zaXRpb25BdCggdE1pZCApO1xuXG4gICAgICAvLyBJZiBpdCdzIGZsYXQgZW5vdWdoIChvciB3ZSBoaXQgb3VyIHJlY3Vyc2lvbiBsaW1pdCksIHByb2Nlc3MgaXRcbiAgICAgIGlmICggZGVwdGggPiAxNCB8fCBTZWdtZW50LmlzU3VmZmljaWVudGx5RmxhdCggZGlzdGFuY2VFcHNpbG9uLCBjdXJ2ZUVwc2lsb24sIHAwLCBwTWlkLCBwMSApICkge1xuICAgICAgICAvLyBFc3RpbWF0ZSBsZW5ndGhcbiAgICAgICAgY29uc3QgdG90YWxMZW5ndGggPSBwMC5kaXN0YW5jZSggcE1pZCApICsgcE1pZC5kaXN0YW5jZSggcDEgKTtcbiAgICAgICAgYXJjTGVuZ3RoICs9IHRvdGFsTGVuZ3RoO1xuXG4gICAgICAgIC8vIFdoaWxlIHdlIGFyZSBsb25nZXIgdGhhbiB0aGUgcmVtYWluaW5nIGFtb3VudCBmb3IgdGhlIG5leHQgZGFzaCBjaGFuZ2UuXG4gICAgICAgIGxldCBsZW5ndGhMZWZ0ID0gdG90YWxMZW5ndGg7XG4gICAgICAgIHdoaWxlICggZGFzaE9mZnNldCArIGxlbmd0aExlZnQgPj0gbGluZURhc2hbIGRhc2hJbmRleCBdICkge1xuICAgICAgICAgIC8vIENvbXB1dGUgdGhlIHQgKGZvciBub3csIGJhc2VkIG9uIHRoZSB0b3RhbCBsZW5ndGggZm9yIGVhc2UpXG4gICAgICAgICAgY29uc3QgdCA9IFV0aWxzLmxpbmVhciggMCwgdG90YWxMZW5ndGgsIHQwLCB0MSwgdG90YWxMZW5ndGggLSBsZW5ndGhMZWZ0ICsgbGluZURhc2hbIGRhc2hJbmRleCBdIC0gZGFzaE9mZnNldCApO1xuXG4gICAgICAgICAgLy8gUmVjb3JkIHRoZSBkYXNoIGNoYW5nZVxuICAgICAgICAgIHZhbHVlcy5wdXNoKCB0ICk7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgYW1vdW50IGFkZGVkIGZyb20gb3VyIGxlbmd0aExlZnQgKG1vdmUgdG8gdGhlIGRhc2gpXG4gICAgICAgICAgbGVuZ3RoTGVmdCAtPSBsaW5lRGFzaFsgZGFzaEluZGV4IF0gLSBkYXNoT2Zmc2V0O1xuICAgICAgICAgIGRhc2hPZmZzZXQgPSAwOyAvLyBhdCB0aGUgZGFzaCwgd2UnbGwgaGF2ZSAwIG9mZnNldFxuICAgICAgICAgIG5leHREYXNoSW5kZXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwaWxsLW92ZXIsIGp1c3QgYWRkIGl0XG4gICAgICAgIGRhc2hPZmZzZXQgPSBkYXNoT2Zmc2V0ICsgbGVuZ3RoTGVmdDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZWN1ciggdDAsIHRNaWQsIHAwLCBwTWlkLCBkZXB0aCArIDEgKTtcbiAgICAgICAgcmVjdXIoIHRNaWQsIHQxLCBwTWlkLCBwMSwgZGVwdGggKyAxICk7XG4gICAgICB9XG4gICAgfSApKCAwLCAxLCB0aGlzLnN0YXJ0LCB0aGlzLmVuZCwgMCApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlczogdmFsdWVzLFxuICAgICAgYXJjTGVuZ3RoOiBhcmNMZW5ndGgsXG4gICAgICBpbml0aWFsbHlJbnNpZGU6IGluaXRpYWxseUluc2lkZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIFtvcHRpb25zXVxuICAgKiBAcGFyYW0gW21pbkxldmVsc10gLSAgIGhvdyBtYW55IGxldmVscyB0byBmb3JjZSBzdWJkaXZpc2lvbnNcbiAgICogQHBhcmFtIFttYXhMZXZlbHNdIC0gICBwcmV2ZW50IHN1YmRpdmlzaW9uIHBhc3QgdGhpcyBsZXZlbFxuICAgKiBAcGFyYW0gW3NlZ21lbnRzXVxuICAgKiBAcGFyYW0gW3N0YXJ0XVxuICAgKiBAcGFyYW0gW2VuZF1cbiAgICovXG4gIHB1YmxpYyB0b1BpZWNld2lzZUxpbmVhclNlZ21lbnRzKCBvcHRpb25zOiBQaWVjZXdpc2VMaW5lYXJPcHRpb25zLCBtaW5MZXZlbHM/OiBudW1iZXIsIG1heExldmVscz86IG51bWJlciwgc2VnbWVudHM/OiBMaW5lW10sIHN0YXJ0PzogVmVjdG9yMiwgZW5kPzogVmVjdG9yMiApOiBMaW5lW10ge1xuICAgIC8vIGZvciB0aGUgZmlyc3QgY2FsbCwgaW5pdGlhbGl6ZSBtaW4vbWF4IGxldmVscyBmcm9tIG91ciBvcHRpb25zXG4gICAgbWluTGV2ZWxzID0gbWluTGV2ZWxzID09PSB1bmRlZmluZWQgPyBvcHRpb25zLm1pbkxldmVscyEgOiBtaW5MZXZlbHM7XG4gICAgbWF4TGV2ZWxzID0gbWF4TGV2ZWxzID09PSB1bmRlZmluZWQgPyBvcHRpb25zLm1heExldmVscyEgOiBtYXhMZXZlbHM7XG5cbiAgICBzZWdtZW50cyA9IHNlZ21lbnRzIHx8IFtdO1xuICAgIGNvbnN0IHBvaW50TWFwID0gb3B0aW9ucy5wb2ludE1hcCB8fCBfLmlkZW50aXR5O1xuXG4gICAgLy8gcG9pbnRzIG1hcHBlZCBieSB0aGUgKHBvc3NpYmx5LW5vbmxpbmVhcikgcG9pbnRNYXAuXG4gICAgc3RhcnQgPSBzdGFydCB8fCBwb2ludE1hcCggdGhpcy5zdGFydCApO1xuICAgIGVuZCA9IGVuZCB8fCBwb2ludE1hcCggdGhpcy5lbmQgKTtcbiAgICBjb25zdCBtaWRkbGUgPSBwb2ludE1hcCggdGhpcy5wb3NpdGlvbkF0KCAwLjUgKSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluTGV2ZWxzIDw9IG1heExldmVscyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGlzdGFuY2VFcHNpbG9uID09PSBudWxsIHx8IHR5cGVvZiBvcHRpb25zLmRpc3RhbmNlRXBzaWxvbiA9PT0gJ251bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmN1cnZlRXBzaWxvbiA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5jdXJ2ZUVwc2lsb24gPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXBvaW50TWFwIHx8IHR5cGVvZiBwb2ludE1hcCA9PT0gJ2Z1bmN0aW9uJyApO1xuXG4gICAgLy8gaS5lLiB3ZSB3aWxsIGhhdmUgZmluaXNoZWQgPSBtYXhMZXZlbHMgPT09IDAgfHwgKCBtaW5MZXZlbHMgPD0gMCAmJiBlcHNpbG9uQ29uc3RyYWludHMgKSwganVzdCBkaWRuJ3Qgd2FudCB0byBvbmUtbGluZSBpdFxuICAgIGxldCBmaW5pc2hlZCA9IG1heExldmVscyA9PT0gMDsgLy8gYmFpbCBvdXQgb25jZSB3ZSByZWFjaCBvdXIgbWF4aW11bSBudW1iZXIgb2Ygc3ViZGl2aXNpb24gbGV2ZWxzXG4gICAgaWYgKCAhZmluaXNoZWQgJiYgbWluTGV2ZWxzIDw9IDAgKSB7IC8vIGZvcmNlIHN1YmRpdmlzaW9uIGlmIG1pbkxldmVscyBoYXNuJ3QgYmVlbiByZWFjaGVkXG4gICAgICBmaW5pc2hlZCA9IHRoaXMuaXNTdWZmaWNpZW50bHlGbGF0KFxuICAgICAgICBvcHRpb25zLmRpc3RhbmNlRXBzaWxvbiA9PT0gbnVsbCB8fCBvcHRpb25zLmRpc3RhbmNlRXBzaWxvbiA9PT0gdW5kZWZpbmVkID8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIDogb3B0aW9ucy5kaXN0YW5jZUVwc2lsb24sXG4gICAgICAgIG9wdGlvbnMuY3VydmVFcHNpbG9uID09PSBudWxsIHx8IG9wdGlvbnMuY3VydmVFcHNpbG9uID09PSB1bmRlZmluZWQgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBvcHRpb25zLmN1cnZlRXBzaWxvblxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIGZpbmlzaGVkICkge1xuICAgICAgc2VnbWVudHMucHVzaCggbmV3IExpbmUoIHN0YXJ0ISwgZW5kISApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3Qgc3ViZGl2aWRlZFNlZ21lbnRzID0gdGhpcy5zdWJkaXZpZGVkKCAwLjUgKTtcbiAgICAgIHN1YmRpdmlkZWRTZWdtZW50c1sgMCBdLnRvUGllY2V3aXNlTGluZWFyU2VnbWVudHMoIG9wdGlvbnMsIG1pbkxldmVscyAtIDEsIG1heExldmVscyAtIDEsIHNlZ21lbnRzLCBzdGFydCwgbWlkZGxlICk7XG4gICAgICBzdWJkaXZpZGVkU2VnbWVudHNbIDEgXS50b1BpZWNld2lzZUxpbmVhclNlZ21lbnRzKCBvcHRpb25zLCBtaW5MZXZlbHMgLSAxLCBtYXhMZXZlbHMgLSAxLCBzZWdtZW50cywgbWlkZGxlLCBlbmQgKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlZ21lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIExpbmUgYW5kL29yIEFyYyBzZWdtZW50cyB0aGF0IGFwcHJveGltYXRlcyB0aGlzIHNlZ21lbnQuXG4gICAqL1xuICBwdWJsaWMgdG9QaWVjZXdpc2VMaW5lYXJPckFyY1NlZ21lbnRzKCBwcm92aWRlZE9wdGlvbnM6IFBpZWNld2lzZUxpbmVhck9yQXJjT3B0aW9ucyApOiBTZWdtZW50W10ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGllY2V3aXNlTGluZWFyT3JBcmNPcHRpb25zLCBQaWVjZXdpc2VMaW5lYXJPckFyY09wdGlvbnMsIFBpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uT3B0aW9ucz4oKSgge1xuICAgICAgbWluTGV2ZWxzOiAyLFxuICAgICAgbWF4TGV2ZWxzOiA3LFxuICAgICAgY3VydmF0dXJlVGhyZXNob2xkOiAwLjAyLFxuICAgICAgZXJyb3JUaHJlc2hvbGQ6IDEwLFxuICAgICAgZXJyb3JQb2ludHM6IFsgMC4yNSwgMC43NSBdXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBzZWdtZW50czogU2VnbWVudFtdID0gW107XG4gICAgdGhpcy50b1BpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uKCBvcHRpb25zLCBvcHRpb25zLm1pbkxldmVscywgb3B0aW9ucy5tYXhMZXZlbHMsIHNlZ21lbnRzLFxuICAgICAgMCwgMSxcbiAgICAgIHRoaXMucG9zaXRpb25BdCggMCApLCB0aGlzLnBvc2l0aW9uQXQoIDEgKSxcbiAgICAgIHRoaXMuY3VydmF0dXJlQXQoIDAgKSwgdGhpcy5jdXJ2YXR1cmVBdCggMSApICk7XG4gICAgcmV0dXJuIHNlZ21lbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgdG9QaWVjZXdpc2VMaW5lYXJPckFyY1NlZ21lbnRzLiAtIHdpbGwgcHVzaCBpbnRvIHNlZ21lbnRzXG4gICAqL1xuICBwcml2YXRlIHRvUGllY2V3aXNlTGluZWFyT3JBcmNSZWN1cnNpb24oIG9wdGlvbnM6IFBpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uT3B0aW9ucywgbWluTGV2ZWxzOiBudW1iZXIsIG1heExldmVsczogbnVtYmVyLCBzZWdtZW50czogU2VnbWVudFtdLCBzdGFydFQ6IG51bWJlciwgZW5kVDogbnVtYmVyLCBzdGFydFBvaW50OiBWZWN0b3IyLCBlbmRQb2ludDogVmVjdG9yMiwgc3RhcnRDdXJ2YXR1cmU6IG51bWJlciwgZW5kQ3VydmF0dXJlOiBudW1iZXIgKTogdm9pZCB7XG4gICAgY29uc3QgbWlkZGxlVCA9ICggc3RhcnRUICsgZW5kVCApIC8gMjtcbiAgICBjb25zdCBtaWRkbGVQb2ludCA9IHRoaXMucG9zaXRpb25BdCggbWlkZGxlVCApO1xuICAgIGNvbnN0IG1pZGRsZUN1cnZhdHVyZSA9IHRoaXMuY3VydmF0dXJlQXQoIG1pZGRsZVQgKTtcblxuICAgIGlmICggbWF4TGV2ZWxzIDw9IDAgfHwgKCBtaW5MZXZlbHMgPD0gMCAmJiBNYXRoLmFicyggc3RhcnRDdXJ2YXR1cmUgLSBtaWRkbGVDdXJ2YXR1cmUgKSArIE1hdGguYWJzKCBtaWRkbGVDdXJ2YXR1cmUgLSBlbmRDdXJ2YXR1cmUgKSA8IG9wdGlvbnMuY3VydmF0dXJlVGhyZXNob2xkICogMiApICkge1xuICAgICAgY29uc3Qgc2VnbWVudCA9IEFyYy5jcmVhdGVGcm9tUG9pbnRzKCBzdGFydFBvaW50LCBtaWRkbGVQb2ludCwgZW5kUG9pbnQgKTtcbiAgICAgIGxldCBuZWVkc1NwbGl0ID0gZmFsc2U7XG4gICAgICBpZiAoIHNlZ21lbnQgaW5zdGFuY2VvZiBBcmMgKSB7XG4gICAgICAgIGNvbnN0IHJhZGl1c1NxdWFyZWQgPSBzZWdtZW50LnJhZGl1cyAqIHNlZ21lbnQucmFkaXVzO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmVycm9yUG9pbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IHQgPSBvcHRpb25zLmVycm9yUG9pbnRzWyBpIF07XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLnBvc2l0aW9uQXQoIHN0YXJ0VCAqICggMSAtIHQgKSArIGVuZFQgKiB0ICk7XG4gICAgICAgICAgaWYgKCBNYXRoLmFicyggcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBzZWdtZW50LmNlbnRlciApIC0gcmFkaXVzU3F1YXJlZCApID4gb3B0aW9ucy5lcnJvclRocmVzaG9sZCApIHtcbiAgICAgICAgICAgIG5lZWRzU3BsaXQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoICFuZWVkc1NwbGl0ICkge1xuICAgICAgICBzZWdtZW50cy5wdXNoKCBzZWdtZW50ICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b1BpZWNld2lzZUxpbmVhck9yQXJjUmVjdXJzaW9uKCBvcHRpb25zLCBtaW5MZXZlbHMgLSAxLCBtYXhMZXZlbHMgLSAxLCBzZWdtZW50cyxcbiAgICAgIHN0YXJ0VCwgbWlkZGxlVCxcbiAgICAgIHN0YXJ0UG9pbnQsIG1pZGRsZVBvaW50LFxuICAgICAgc3RhcnRDdXJ2YXR1cmUsIG1pZGRsZUN1cnZhdHVyZSApO1xuICAgIHRoaXMudG9QaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbiggb3B0aW9ucywgbWluTGV2ZWxzIC0gMSwgbWF4TGV2ZWxzIC0gMSwgc2VnbWVudHMsXG4gICAgICBtaWRkbGVULCBlbmRULFxuICAgICAgbWlkZGxlUG9pbnQsIGVuZFBvaW50LFxuICAgICAgbWlkZGxlQ3VydmF0dXJlLCBlbmRDdXJ2YXR1cmUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgU2hhcGUgY29udGFpbmluZyBqdXN0IHRoaXMgb25lIHNlZ21lbnQuXG4gICAqL1xuICBwdWJsaWMgdG9TaGFwZSgpOiBTaGFwZSB7XG4gICAgcmV0dXJuIG5ldyBTaGFwZSggWyBuZXcgU3VicGF0aCggWyB0aGlzIF0gKSBdICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2xvc2VzdFBvaW50cyggcG9pbnQ6IFZlY3RvcjIgKTogQ2xvc2VzdFRvUG9pbnRSZXN1bHRbXSB7XG4gICAgLy8gVE9ETzogc29sdmUgc2VnbWVudHMgdG8gZGV0ZXJtaW5lIHRoaXMgYW5hbHl0aWNhbGx5ISAob25seSBpbXBsZW1lbnRlZCBmb3IgTGluZSByaWdodCBub3csIHNob3VsZCBiZSBlYXN5IHRvIGRvIHdpdGggc29tZSB0aGluZ3MpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIHJldHVybiBTZWdtZW50LmNsb3Nlc3RUb1BvaW50KCBbIHRoaXMgXSwgcG9pbnQsIDFlLTcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IG9mIHJlc3VsdHMgKHNpbmNlIHRoZXJlIGNhbiBiZSBkdXBsaWNhdGVzKSwgdGhyZXNob2xkIGlzIHVzZWQgZm9yIHN1YmRpdmlzaW9uLFxuICAgKiB3aGVyZSBpdCB3aWxsIGV4aXQgaWYgYWxsIG9mIHRoZSBzZWdtZW50cyBhcmUgc2hvcnRlciB0aGFuIHRoZSB0aHJlc2hvbGRcbiAgICpcbiAgICogVE9ETzogc29sdmUgc2VnbWVudHMgdG8gZGV0ZXJtaW5lIHRoaXMgYW5hbHl0aWNhbGx5ISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY2xvc2VzdFRvUG9pbnQoIHNlZ21lbnRzOiBTZWdtZW50W10sIHBvaW50OiBWZWN0b3IyLCB0aHJlc2hvbGQ6IG51bWJlciApOiBDbG9zZXN0VG9Qb2ludFJlc3VsdFtdIHtcbiAgICB0eXBlIEl0ZW0gPSB7XG4gICAgICB0YTogbnVtYmVyO1xuICAgICAgdGI6IG51bWJlcjtcbiAgICAgIHBhOiBWZWN0b3IyO1xuICAgICAgcGI6IFZlY3RvcjI7XG4gICAgICBzZWdtZW50OiBTZWdtZW50O1xuICAgICAgYm91bmRzOiBCb3VuZHMyO1xuICAgICAgbWluOiBudW1iZXI7XG4gICAgICBtYXg6IG51bWJlcjtcbiAgICB9O1xuXG4gICAgY29uc3QgdGhyZXNob2xkU3F1YXJlZCA9IHRocmVzaG9sZCAqIHRocmVzaG9sZDtcbiAgICBsZXQgaXRlbXM6IEl0ZW1bXSA9IFtdO1xuICAgIGxldCBiZXN0TGlzdDogQ2xvc2VzdFRvUG9pbnRSZXN1bHRbXSA9IFtdO1xuICAgIGxldCBiZXN0RGlzdGFuY2VTcXVhcmVkID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIGxldCB0aHJlc2hvbGRPayA9IGZhbHNlO1xuXG4gICAgXy5lYWNoKCBzZWdtZW50cywgKCBzZWdtZW50OiBTZWdtZW50ICkgPT4ge1xuICAgICAgLy8gaWYgd2UgaGF2ZSBhbiBleHBsaWNpdCBjb21wdXRhdGlvbiBmb3IgdGhpcyBzZWdtZW50LCB1c2UgaXRcbiAgICAgIGlmICggc2VnbWVudCBpbnN0YW5jZW9mIExpbmUgKSB7XG4gICAgICAgIGNvbnN0IGluZm9zID0gc2VnbWVudC5leHBsaWNpdENsb3Nlc3RUb1BvaW50KCBwb2ludCApO1xuICAgICAgICBfLmVhY2goIGluZm9zLCBpbmZvID0+IHtcbiAgICAgICAgICBpZiAoIGluZm8uZGlzdGFuY2VTcXVhcmVkIDwgYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcbiAgICAgICAgICAgIGJlc3RMaXN0ID0gWyBpbmZvIF07XG4gICAgICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gaW5mby5kaXN0YW5jZVNxdWFyZWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBpbmZvLmRpc3RhbmNlU3F1YXJlZCA9PT0gYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcbiAgICAgICAgICAgIGJlc3RMaXN0LnB1c2goIGluZm8gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBvdGhlcndpc2UsIHdlIHdpbGwgc3BsaXQgYmFzZWQgb24gbW9ub3RvbmljaXR5LCBzbyB3ZSBjYW4gc3ViZGl2aWRlXG4gICAgICAgIC8vIHNlcGFyYXRlLCBzbyB3ZSBjYW4gbWFwIHRoZSBzdWJkaXZpZGVkIHNlZ21lbnRzXG4gICAgICAgIGNvbnN0IHRzID0gWyAwIF0uY29uY2F0KCBzZWdtZW50LmdldEludGVyaW9yRXh0cmVtYVRzKCkgKS5jb25jYXQoIFsgMSBdICk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRzLmxlbmd0aCAtIDE7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCB0YSA9IHRzWyBpIF07XG4gICAgICAgICAgY29uc3QgdGIgPSB0c1sgaSArIDEgXTtcbiAgICAgICAgICBjb25zdCBwYSA9IHNlZ21lbnQucG9zaXRpb25BdCggdGEgKTtcbiAgICAgICAgICBjb25zdCBwYiA9IHNlZ21lbnQucG9zaXRpb25BdCggdGIgKTtcbiAgICAgICAgICBjb25zdCBib3VuZHMgPSBCb3VuZHMyLnBvaW50KCBwYSApLmFkZFBvaW50KCBwYiApO1xuICAgICAgICAgIGNvbnN0IG1pbkRpc3RhbmNlU3F1YXJlZCA9IGJvdW5kcy5taW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQgKTtcbiAgICAgICAgICBpZiAoIG1pbkRpc3RhbmNlU3F1YXJlZCA8PSBiZXN0RGlzdGFuY2VTcXVhcmVkICkge1xuICAgICAgICAgICAgY29uc3QgbWF4RGlzdGFuY2VTcXVhcmVkID0gYm91bmRzLm1heGltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkKCBwb2ludCApO1xuICAgICAgICAgICAgaWYgKCBtYXhEaXN0YW5jZVNxdWFyZWQgPCBiZXN0RGlzdGFuY2VTcXVhcmVkICkge1xuICAgICAgICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gbWF4RGlzdGFuY2VTcXVhcmVkO1xuICAgICAgICAgICAgICBiZXN0TGlzdCA9IFtdOyAvLyBjbGVhciBpdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbXMucHVzaCgge1xuICAgICAgICAgICAgICB0YTogdGEsXG4gICAgICAgICAgICAgIHRiOiB0YixcbiAgICAgICAgICAgICAgcGE6IHBhLFxuICAgICAgICAgICAgICBwYjogcGIsXG4gICAgICAgICAgICAgIHNlZ21lbnQ6IHNlZ21lbnQsXG4gICAgICAgICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICAgICAgICBtaW46IG1pbkRpc3RhbmNlU3F1YXJlZCxcbiAgICAgICAgICAgICAgbWF4OiBtYXhEaXN0YW5jZVNxdWFyZWRcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB3aGlsZSAoIGl0ZW1zLmxlbmd0aCAmJiAhdGhyZXNob2xkT2sgKSB7XG4gICAgICBjb25zdCBjdXJJdGVtcyA9IGl0ZW1zO1xuICAgICAgaXRlbXMgPSBbXTtcblxuICAgICAgLy8gd2hldGhlciBhbGwgb2YgdGhlIHNlZ21lbnRzIHByb2Nlc3NlZCBhcmUgc2hvcnRlciB0aGFuIHRoZSB0aHJlc2hvbGRcbiAgICAgIHRocmVzaG9sZE9rID0gdHJ1ZTtcblxuICAgICAgZm9yICggY29uc3QgaXRlbSBvZiBjdXJJdGVtcyApIHtcbiAgICAgICAgaWYgKCBpdGVtLm1pbiA+IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XG4gICAgICAgICAgY29udGludWU7IC8vIGRyb3AgdGhpcyBpdGVtXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0aHJlc2hvbGRPayAmJiBpdGVtLnBhLmRpc3RhbmNlU3F1YXJlZCggaXRlbS5wYiApID4gdGhyZXNob2xkU3F1YXJlZCApIHtcbiAgICAgICAgICB0aHJlc2hvbGRPayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRtaWQgPSAoIGl0ZW0udGEgKyBpdGVtLnRiICkgLyAyO1xuICAgICAgICBjb25zdCBwbWlkID0gaXRlbS5zZWdtZW50LnBvc2l0aW9uQXQoIHRtaWQgKTtcbiAgICAgICAgY29uc3QgYm91bmRzQSA9IEJvdW5kczIucG9pbnQoIGl0ZW0ucGEgKS5hZGRQb2ludCggcG1pZCApO1xuICAgICAgICBjb25zdCBib3VuZHNCID0gQm91bmRzMi5wb2ludCggaXRlbS5wYiApLmFkZFBvaW50KCBwbWlkICk7XG4gICAgICAgIGNvbnN0IG1pbkEgPSBib3VuZHNBLm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkKCBwb2ludCApO1xuICAgICAgICBjb25zdCBtaW5CID0gYm91bmRzQi5taW5pbXVtRGlzdGFuY2VUb1BvaW50U3F1YXJlZCggcG9pbnQgKTtcbiAgICAgICAgaWYgKCBtaW5BIDw9IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XG4gICAgICAgICAgY29uc3QgbWF4QSA9IGJvdW5kc0EubWF4aW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIHBvaW50ICk7XG4gICAgICAgICAgaWYgKCBtYXhBIDwgYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcbiAgICAgICAgICAgIGJlc3REaXN0YW5jZVNxdWFyZWQgPSBtYXhBO1xuICAgICAgICAgICAgYmVzdExpc3QgPSBbXTsgLy8gY2xlYXIgaXRcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaCgge1xuICAgICAgICAgICAgdGE6IGl0ZW0udGEsXG4gICAgICAgICAgICB0YjogdG1pZCxcbiAgICAgICAgICAgIHBhOiBpdGVtLnBhLFxuICAgICAgICAgICAgcGI6IHBtaWQsXG4gICAgICAgICAgICBzZWdtZW50OiBpdGVtLnNlZ21lbnQsXG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kc0EsXG4gICAgICAgICAgICBtaW46IG1pbkEsXG4gICAgICAgICAgICBtYXg6IG1heEFcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBtaW5CIDw9IGJlc3REaXN0YW5jZVNxdWFyZWQgKSB7XG4gICAgICAgICAgY29uc3QgbWF4QiA9IGJvdW5kc0IubWF4aW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQoIHBvaW50ICk7XG4gICAgICAgICAgaWYgKCBtYXhCIDwgYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcbiAgICAgICAgICAgIGJlc3REaXN0YW5jZVNxdWFyZWQgPSBtYXhCO1xuICAgICAgICAgICAgYmVzdExpc3QgPSBbXTsgLy8gY2xlYXIgaXRcbiAgICAgICAgICB9XG4gICAgICAgICAgaXRlbXMucHVzaCgge1xuICAgICAgICAgICAgdGE6IHRtaWQsXG4gICAgICAgICAgICB0YjogaXRlbS50YixcbiAgICAgICAgICAgIHBhOiBwbWlkLFxuICAgICAgICAgICAgcGI6IGl0ZW0ucGIsXG4gICAgICAgICAgICBzZWdtZW50OiBpdGVtLnNlZ21lbnQsXG4gICAgICAgICAgICBib3VuZHM6IGJvdW5kc0IsXG4gICAgICAgICAgICBtaW46IG1pbkIsXG4gICAgICAgICAgICBtYXg6IG1heEJcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgYW55IGNsb3Nlc3QgcmVnaW9ucywgdGhleSBhcmUgd2l0aGluIHRoZSB0aHJlc2hvbGQsIHNvIHdlIHdpbGwgYWRkIHRoZW0gYWxsXG4gICAgXy5lYWNoKCBpdGVtcywgaXRlbSA9PiB7XG4gICAgICBjb25zdCB0ID0gKCBpdGVtLnRhICsgaXRlbS50YiApIC8gMjtcbiAgICAgIGNvbnN0IGNsb3Nlc3RQb2ludCA9IGl0ZW0uc2VnbWVudC5wb3NpdGlvbkF0KCB0ICk7XG4gICAgICBiZXN0TGlzdC5wdXNoKCB7XG4gICAgICAgIHNlZ21lbnQ6IGl0ZW0uc2VnbWVudCxcbiAgICAgICAgdDogdCxcbiAgICAgICAgY2xvc2VzdFBvaW50OiBjbG9zZXN0UG9pbnQsXG4gICAgICAgIGRpc3RhbmNlU3F1YXJlZDogcG9pbnQuZGlzdGFuY2VTcXVhcmVkKCBjbG9zZXN0UG9pbnQgKVxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIHJldHVybiBiZXN0TGlzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0aGUgY3ViaWMtcHJlbXVsdGlwbGllZCB2YWx1ZXMgZm9yIHR3byBjdWJpYyBiZXppZXIgY3VydmVzLCBkZXRlcm1pbmVzIChpZiBhdmFpbGFibGUpIGEgc3BlY2lmaWVkIChhLGIpIHBhaXJcbiAgICogc3VjaCB0aGF0IHAoIHQgKSA9PT0gcSggYSAqIHQgKyBiICkuXG4gICAqXG4gICAqIEdpdmVuIGEgMS1kaW1lbnNpb25hbCBjdWJpYyBiZXppZXIgZGV0ZXJtaW5lZCBieSB0aGUgY29udHJvbCBwb2ludHMgcDAsIHAxLCBwMiBhbmQgcDMsIGNvbXB1dGU6XG4gICAqXG4gICAqIFsgcDBzIF0gICAgWyAgMSAgIDAgICAwICAgMCBdICAgWyBwMCBdXG4gICAqIFsgcDFzIF0gPT0gWyAtMyAgIDMgICAwICAgMCBdICogWyBwMSBdXG4gICAqIFsgcDJzIF0gPT0gWyAgMyAgLTYgICAzICAgMCBdICogWyBwMiBdXG4gICAqIFsgcDNzIF0gICAgWyAtMSAgIDMgIC0zICAgMSBdICAgWyBwMyBdXG4gICAqXG4gICAqIHNlZSBDdWJpYy5nZXRPdmVybGFwcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEdldE92ZXJsYXBDdWJpYyggcDBzOiBudW1iZXIsIHAxczogbnVtYmVyLCBwMnM6IG51bWJlciwgcDNzOiBudW1iZXIsIHEwczogbnVtYmVyLCBxMXM6IG51bWJlciwgcTJzOiBudW1iZXIsIHEzczogbnVtYmVyICk6IFBvc3NpYmxlU2ltcGxlT3ZlcmxhcCB7XG4gICAgaWYgKCBxM3MgPT09IDAgKSB7XG4gICAgICByZXR1cm4gU2VnbWVudC5wb2x5bm9taWFsR2V0T3ZlcmxhcFF1YWRyYXRpYyggcDBzLCBwMXMsIHAycywgcTBzLCBxMXMsIHEycyApO1xuICAgIH1cblxuICAgIGNvbnN0IGEgPSBNYXRoLnNpZ24oIHAzcyAvIHEzcyApICogTWF0aC5wb3coIE1hdGguYWJzKCBwM3MgLyBxM3MgKSwgMSAvIDMgKTtcbiAgICBpZiAoIGEgPT09IDAgKSB7XG4gICAgICByZXR1cm4gbnVsbDsgLy8gSWYgdGhlcmUgd291bGQgYmUgc29sdXRpb25zLCB0aGVuIHEzcyB3b3VsZCBoYXZlIGJlZW4gbm9uLXplcm9cbiAgICB9XG4gICAgY29uc3QgYiA9ICggcDJzIC0gYSAqIGEgKiBxMnMgKSAvICggMyAqIGEgKiBhICogcTNzICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGE6IGEsXG4gICAgICBiOiBiXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0aGUgcXVhZHJhdGljLXByZW11bHRpcGxpZWQgdmFsdWVzIGZvciB0d28gcXVhZHJhdGljIGJlemllciBjdXJ2ZXMsIGRldGVybWluZXMgKGlmIGF2YWlsYWJsZSkgYSBzcGVjaWZpZWQgKGEsYikgcGFpclxuICAgKiBzdWNoIHRoYXQgcCggdCApID09PSBxKCBhICogdCArIGIgKS5cbiAgICpcbiAgICogR2l2ZW4gYSAxLWRpbWVuc2lvbmFsIHF1YWRyYXRpYyBiZXppZXIgZGV0ZXJtaW5lZCBieSB0aGUgY29udHJvbCBwb2ludHMgcDAsIHAxLCBwMiwgY29tcHV0ZTpcbiAgICpcbiAgICogWyBwMHMgXSAgICBbICAxICAgMCAgIDAgXSAgIFsgcDAgXVxuICAgKiBbIHAxcyBdID09IFsgLTIgICAyICAgMCBdICogWyBwMSBdXG4gICAqIFsgcDJzIF0gICAgWyAgMiAgLTIgICAzIF0gKiBbIHAyIF1cbiAgICpcbiAgICogc2VlIFF1YWRyYXRpYy5nZXRPdmVybGFwcyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcG9seW5vbWlhbEdldE92ZXJsYXBRdWFkcmF0aWMoIHAwczogbnVtYmVyLCBwMXM6IG51bWJlciwgcDJzOiBudW1iZXIsIHEwczogbnVtYmVyLCBxMXM6IG51bWJlciwgcTJzOiBudW1iZXIgKTogUG9zc2libGVTaW1wbGVPdmVybGFwIHtcbiAgICBpZiAoIHEycyA9PT0gMCApIHtcbiAgICAgIHJldHVybiBTZWdtZW50LnBvbHlub21pYWxHZXRPdmVybGFwTGluZWFyKCBwMHMsIHAxcywgcTBzLCBxMXMgKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXNjciA9IHAycyAvIHEycztcbiAgICBpZiAoIGRpc2NyIDwgMCApIHtcbiAgICAgIHJldHVybiBudWxsOyAvLyBub3QgcG9zc2libGUgdG8gaGF2ZSBhIHNvbHV0aW9uIHdpdGggYW4gaW1hZ2luYXJ5IGFcbiAgICB9XG5cbiAgICBjb25zdCBhID0gTWF0aC5zcXJ0KCBwMnMgLyBxMnMgKTtcbiAgICBpZiAoIGEgPT09IDAgKSB7XG4gICAgICByZXR1cm4gbnVsbDsgLy8gSWYgdGhlcmUgd291bGQgYmUgc29sdXRpb25zLCB0aGVuIHEycyB3b3VsZCBoYXZlIGJlZW4gbm9uLXplcm9cbiAgICB9XG5cbiAgICBjb25zdCBiID0gKCBwMXMgLSBhICogcTFzICkgLyAoIDIgKiBhICogcTJzICk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGE6IGEsXG4gICAgICBiOiBiXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0aGUgbGluZWFyLXByZW11bHRpcGxpZWQgdmFsdWVzIGZvciB0d28gbGluZXMsIGRldGVybWluZXMgKGlmIGF2YWlsYWJsZSkgYSBzcGVjaWZpZWQgKGEsYikgcGFpclxuICAgKiBzdWNoIHRoYXQgcCggdCApID09PSBxKCBhICogdCArIGIgKS5cbiAgICpcbiAgICogR2l2ZW4gYSBsaW5lIGRldGVybWluZWQgYnkgdGhlIGNvbnRyb2wgcG9pbnRzIHAwLCBwMSwgY29tcHV0ZTpcbiAgICpcbiAgICogWyBwMHMgXSA9PSBbICAxICAgMCBdICogWyBwMCBdXG4gICAqIFsgcDFzIF0gPT0gWyAtMSAgIDEgXSAqIFsgcDEgXVxuICAgKlxuICAgKiBzZWUgUXVhZHJhdGljL0N1YmljLmdldE92ZXJsYXBzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwb2x5bm9taWFsR2V0T3ZlcmxhcExpbmVhciggcDBzOiBudW1iZXIsIHAxczogbnVtYmVyLCBxMHM6IG51bWJlciwgcTFzOiBudW1iZXIgKTogUG9zc2libGVTaW1wbGVPdmVybGFwIHtcbiAgICBpZiAoIHExcyA9PT0gMCApIHtcbiAgICAgIGlmICggcDBzID09PSBxMHMgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGEgPSBwMXMgLyBxMXM7XG4gICAgaWYgKCBhID09PSAwICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYiA9ICggcDBzIC0gcTBzICkgLyBxMXM7XG4gICAgcmV0dXJuIHtcbiAgICAgIGE6IGEsXG4gICAgICBiOiBiXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgZGlzdGluY3QgKG5vbi1lbmRwb2ludCwgbm9uLWZpbml0ZSkgaW50ZXJzZWN0aW9ucyBiZXR3ZWVuIHRoZSB0d28gc2VnbWVudHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGludGVyc2VjdCggYTogU2VnbWVudCwgYjogU2VnbWVudCApOiBTZWdtZW50SW50ZXJzZWN0aW9uW10ge1xuICAgIGlmICggTGluZSAmJiBhIGluc3RhbmNlb2YgTGluZSAmJiBiIGluc3RhbmNlb2YgTGluZSApIHtcbiAgICAgIHJldHVybiBMaW5lLmludGVyc2VjdCggYSwgYiApO1xuICAgIH1cbiAgICBlbHNlIGlmICggTGluZSAmJiBhIGluc3RhbmNlb2YgTGluZSApIHtcbiAgICAgIHJldHVybiBMaW5lLmludGVyc2VjdE90aGVyKCBhLCBiICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBMaW5lICYmIGIgaW5zdGFuY2VvZiBMaW5lICkge1xuICAgICAgLy8gbmVlZCB0byBzd2FwIG91ciBpbnRlcnNlY3Rpb25zLCBzaW5jZSAnYicgaXMgdGhlIGxpbmVcbiAgICAgIHJldHVybiBMaW5lLmludGVyc2VjdE90aGVyKCBiLCBhICkubWFwKCBzd2FwU2VnbWVudEludGVyc2VjdGlvbiApO1xuICAgIH1cbiAgICBlbHNlIGlmICggQXJjICYmIGEgaW5zdGFuY2VvZiBBcmMgJiYgYiBpbnN0YW5jZW9mIEFyYyApIHtcbiAgICAgIHJldHVybiBBcmMuaW50ZXJzZWN0KCBhLCBiICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBFbGxpcHRpY2FsQXJjICYmIGEgaW5zdGFuY2VvZiBFbGxpcHRpY2FsQXJjICYmIGIgaW5zdGFuY2VvZiBFbGxpcHRpY2FsQXJjICkge1xuICAgICAgcmV0dXJuIEVsbGlwdGljYWxBcmMuaW50ZXJzZWN0KCBhLCBiICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBRdWFkcmF0aWMgJiYgQ3ViaWMgJiYgKCBhIGluc3RhbmNlb2YgUXVhZHJhdGljIHx8IGEgaW5zdGFuY2VvZiBDdWJpYyApICYmICggYiBpbnN0YW5jZW9mIFF1YWRyYXRpYyB8fCBiIGluc3RhbmNlb2YgQ3ViaWMgKSApIHtcbiAgICAgIGNvbnN0IGN1YmljQSA9IGEgaW5zdGFuY2VvZiBDdWJpYyA/IGEgOiBhLmRlZ3JlZUVsZXZhdGVkKCk7XG4gICAgICBjb25zdCBjdWJpY0IgPSBiIGluc3RhbmNlb2YgQ3ViaWMgPyBiIDogYi5kZWdyZWVFbGV2YXRlZCgpO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIChubyB0eXBlIGRlZmluaXRpb25zIHlldCwgcGVyaGFwcyB1c2VmdWwgaWYgd2UgdXNlIGl0IG1vcmUpXG4gICAgICBjb25zdCBwYXBlckN1cnZlQSA9IG5ldyBwYXBlci5DdXJ2ZSggY3ViaWNBLnN0YXJ0LngsIGN1YmljQS5zdGFydC55LCBjdWJpY0EuY29udHJvbDEueCwgY3ViaWNBLmNvbnRyb2wxLnksIGN1YmljQS5jb250cm9sMi54LCBjdWJpY0EuY29udHJvbDIueSwgY3ViaWNBLmVuZC54LCBjdWJpY0EuZW5kLnkgKTtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAobm8gdHlwZSBkZWZpbml0aW9ucyB5ZXQsIHBlcmhhcHMgdXNlZnVsIGlmIHdlIHVzZSBpdCBtb3JlKVxuICAgICAgY29uc3QgcGFwZXJDdXJ2ZUIgPSBuZXcgcGFwZXIuQ3VydmUoIGN1YmljQi5zdGFydC54LCBjdWJpY0Iuc3RhcnQueSwgY3ViaWNCLmNvbnRyb2wxLngsIGN1YmljQi5jb250cm9sMS55LCBjdWJpY0IuY29udHJvbDIueCwgY3ViaWNCLmNvbnRyb2wyLnksIGN1YmljQi5lbmQueCwgY3ViaWNCLmVuZC55ICk7XG5cbiAgICAgIGNvbnN0IHBhcGVySW50ZXJzZWN0aW9ucyA9IHBhcGVyQ3VydmVBLmdldEludGVyc2VjdGlvbnMoIHBhcGVyQ3VydmVCICk7XG4gICAgICByZXR1cm4gcGFwZXJJbnRlcnNlY3Rpb25zLm1hcCggKCBwYXBlckludGVyc2VjdGlvbjogSW50ZW50aW9uYWxBbnkgKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFZlY3RvcjIoIHBhcGVySW50ZXJzZWN0aW9uLnBvaW50LngsIHBhcGVySW50ZXJzZWN0aW9uLnBvaW50LnkgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBTZWdtZW50SW50ZXJzZWN0aW9uKCBwb2ludCwgcGFwZXJJbnRlcnNlY3Rpb24udGltZSwgcGFwZXJJbnRlcnNlY3Rpb24uaW50ZXJzZWN0aW9uLnRpbWUgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gQm91bmRzSW50ZXJzZWN0aW9uLmludGVyc2VjdCggYSwgYiApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgU2VnbWVudCBmcm9tIHRoZSBzZXJpYWxpemVkIHJlcHJlc2VudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZSggb2JqOiBTZXJpYWxpemVkU2VnbWVudCApOiBTZWdtZW50IHtcbiAgICAvLyBUT0RPOiBqdXN0IGltcG9ydCB0aGVtIG5vdyB0aGF0IHdlIGhhdmUgY2lyY3VsYXIgcmVmZXJlbmNlIHByb3RlY3Rpb24sIGFuZCBzd2l0Y2ggYmV0d2VlbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IG5hbWVzcGFjaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9iai50eXBlICYmIGtpdGVbIG9iai50eXBlIF0gJiYga2l0ZVsgb2JqLnR5cGUgXS5kZXNlcmlhbGl6ZSApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBuYW1lc3BhY2luZyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICByZXR1cm4ga2l0ZVsgb2JqLnR5cGUgXS5kZXNlcmlhbGl6ZSggb2JqICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGUgc3RhcnQvbWlkZGxlL2VuZCBwb2ludHMgYXJlIHJlcHJlc2VudGF0aXZlIG9mIGEgc3VmZmljaWVudGx5IGZsYXQgc2VnbWVudFxuICAgKiAoZ2l2ZW4gY2VydGFpbiBlcHNpbG9uIHZhbHVlcylcbiAgICpcbiAgICogQHBhcmFtIHN0YXJ0XG4gICAqIEBwYXJhbSBtaWRkbGVcbiAgICogQHBhcmFtIGVuZFxuICAgKiBAcGFyYW0gZGlzdGFuY2VFcHNpbG9uIC0gY29udHJvbHMgbGV2ZWwgb2Ygc3ViZGl2aXNpb24gYnkgYXR0ZW1wdGluZyB0byBlbnN1cmUgYSBtYXhpbXVtIChzcXVhcmVkKVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWF0aW9uIGZyb20gdGhlIGN1cnZlXG4gICAqIEBwYXJhbSBjdXJ2ZUVwc2lsb24gLSBjb250cm9scyBsZXZlbCBvZiBzdWJkaXZpc2lvbiBieSBhdHRlbXB0aW5nIHRvIGVuc3VyZSBhIG1heGltdW0gY3VydmF0dXJlIGNoYW5nZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgYmV0d2VlbiBzZWdtZW50c1xuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpc1N1ZmZpY2llbnRseUZsYXQoIGRpc3RhbmNlRXBzaWxvbjogbnVtYmVyLCBjdXJ2ZUVwc2lsb246IG51bWJlciwgc3RhcnQ6IFZlY3RvcjIsIG1pZGRsZTogVmVjdG9yMiwgZW5kOiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuICAgIC8vIGZsYXRuZXNzIGNyaXRlcmlvbjogQT1zdGFydCwgQj1lbmQsIEM9bWlkcG9pbnQsIGQwPWRpc3RhbmNlIGZyb20gQUIsIGQxPXx8Qi1BfHwsIHN1YmRpdmlkZSBpZiBkMC9kMSA+IHNxcnQoZXBzaWxvbilcbiAgICBpZiAoIFV0aWxzLmRpc3RUb1NlZ21lbnRTcXVhcmVkKCBtaWRkbGUsIHN0YXJ0LCBlbmQgKSAvIHN0YXJ0LmRpc3RhbmNlU3F1YXJlZCggZW5kICkgPiBjdXJ2ZUVwc2lsb24gKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIGRldmlhdGlvbiBjcml0ZXJpb25cbiAgICBpZiAoIFV0aWxzLmRpc3RUb1NlZ21lbnRTcXVhcmVkKCBtaWRkbGUsIHN0YXJ0LCBlbmQgKSA+IGRpc3RhbmNlRXBzaWxvbiApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZpbHRlckNsb3Nlc3RUb1BvaW50UmVzdWx0KCByZXN1bHRzOiBDbG9zZXN0VG9Qb2ludFJlc3VsdFtdICk6IENsb3Nlc3RUb1BvaW50UmVzdWx0W10ge1xuICAgIGlmICggcmVzdWx0cy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgY2xvc2VzdERpc3RhbmNlU3F1YXJlZCA9IF8ubWluQnkoIHJlc3VsdHMsIHJlc3VsdCA9PiByZXN1bHQuZGlzdGFuY2VTcXVhcmVkICkhLmRpc3RhbmNlU3F1YXJlZDtcblxuICAgIC8vIFJldHVybiBhbGwgcmVzdWx0cyB0aGF0IGFyZSB3aXRoaW4gMWUtMTEgb2YgdGhlIGNsb3Nlc3QgZGlzdGFuY2UgKHRvIGFjY291bnQgZm9yIGZsb2F0aW5nIHBvaW50IGVycm9yKSwgYnV0IHVuaXF1ZVxuICAgIC8vIGJhc2VkIG9uIHRoZSBsb2NhdGlvbi5cbiAgICByZXR1cm4gXy51bmlxV2l0aCggcmVzdWx0cy5maWx0ZXIoIHJlc3VsdCA9PiBNYXRoLmFicyggcmVzdWx0LmRpc3RhbmNlU3F1YXJlZCAtIGNsb3Nlc3REaXN0YW5jZVNxdWFyZWQgKSA8IDFlLTExICksICggYSwgYiApID0+IGEuY2xvc2VzdFBvaW50LmRpc3RhbmNlU3F1YXJlZCggYi5jbG9zZXN0UG9pbnQgKSA8IDFlLTExICk7XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ1NlZ21lbnQnLCBTZWdtZW50ICk7XG5cbmZ1bmN0aW9uIHN3YXBTZWdtZW50SW50ZXJzZWN0aW9uKCBzZWdtZW50SW50ZXJzZWN0aW9uOiBTZWdtZW50SW50ZXJzZWN0aW9uICk6IFNlZ21lbnRJbnRlcnNlY3Rpb24ge1xuICByZXR1cm4gc2VnbWVudEludGVyc2VjdGlvbi5nZXRTd2FwcGVkKCk7XG59Il0sIm5hbWVzIjpbIlRpbnlFbWl0dGVyIiwiQm91bmRzMiIsIlV0aWxzIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIkFyYyIsIkJvdW5kc0ludGVyc2VjdGlvbiIsIkN1YmljIiwiRWxsaXB0aWNhbEFyYyIsImtpdGUiLCJMaW5lIiwiUXVhZHJhdGljIiwiU2VnbWVudEludGVyc2VjdGlvbiIsIlNoYXBlIiwiU3VicGF0aCIsIlNlZ21lbnQiLCJhcmVTdHJva2VkQm91bmRzRGlsYXRlZCIsImVwc2lsb24iLCJNYXRoIiwiYWJzIiwic3RhcnRUYW5nZW50IiwieCIsInkiLCJlbmRUYW5nZW50IiwiZ2V0Qm91bmRzV2l0aFRyYW5zZm9ybSIsIm1hdHJpeCIsInRyYW5zZm9ybWVkU2VnbWVudCIsInRyYW5zZm9ybWVkIiwiZ2V0Qm91bmRzIiwic2xpY2UiLCJ0MCIsInQxIiwiYXNzZXJ0Iiwic2VnbWVudCIsInN1YmRpdmlkZWQiLCJsaW5lYXIiLCJzdWJkaXZpc2lvbnMiLCJ0TGlzdCIsInJpZ2h0IiwicmVzdWx0IiwiaSIsImxlbmd0aCIsInQiLCJhcnIiLCJwdXNoIiwiaiIsInN1YmRpdmlkZWRJbnRvTW9ub3RvbmUiLCJnZXRJbnRlcmlvckV4dHJlbWFUcyIsImlzU3VmZmljaWVudGx5RmxhdCIsImRpc3RhbmNlRXBzaWxvbiIsImN1cnZlRXBzaWxvbiIsInN0YXJ0IiwibWlkZGxlIiwicG9zaXRpb25BdCIsImVuZCIsImdldEFyY0xlbmd0aCIsIm1heExldmVscyIsInVuZGVmaW5lZCIsImRpc3RhbmNlIiwiZ2V0RGFzaFZhbHVlcyIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJzZWxmIiwidmFsdWVzIiwiYXJjTGVuZ3RoIiwibGluZURhc2hTdW0iLCJfIiwic3VtIiwiZGFzaEluZGV4IiwiZGFzaE9mZnNldCIsImlzSW5zaWRlIiwibmV4dERhc2hJbmRleCIsImluaXRpYWxseUluc2lkZSIsInJlY3VyIiwicDAiLCJwMSIsImRlcHRoIiwidE1pZCIsInBNaWQiLCJ0b3RhbExlbmd0aCIsImxlbmd0aExlZnQiLCJ0b1BpZWNld2lzZUxpbmVhclNlZ21lbnRzIiwib3B0aW9ucyIsIm1pbkxldmVscyIsInNlZ21lbnRzIiwicG9pbnRNYXAiLCJpZGVudGl0eSIsImZpbmlzaGVkIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzdWJkaXZpZGVkU2VnbWVudHMiLCJ0b1BpZWNld2lzZUxpbmVhck9yQXJjU2VnbWVudHMiLCJwcm92aWRlZE9wdGlvbnMiLCJjdXJ2YXR1cmVUaHJlc2hvbGQiLCJlcnJvclRocmVzaG9sZCIsImVycm9yUG9pbnRzIiwidG9QaWVjZXdpc2VMaW5lYXJPckFyY1JlY3Vyc2lvbiIsImN1cnZhdHVyZUF0Iiwic3RhcnRUIiwiZW5kVCIsInN0YXJ0UG9pbnQiLCJlbmRQb2ludCIsInN0YXJ0Q3VydmF0dXJlIiwiZW5kQ3VydmF0dXJlIiwibWlkZGxlVCIsIm1pZGRsZVBvaW50IiwibWlkZGxlQ3VydmF0dXJlIiwiY3JlYXRlRnJvbVBvaW50cyIsIm5lZWRzU3BsaXQiLCJyYWRpdXNTcXVhcmVkIiwicmFkaXVzIiwicG9pbnQiLCJkaXN0YW5jZVNxdWFyZWQiLCJjZW50ZXIiLCJ0b1NoYXBlIiwiZ2V0Q2xvc2VzdFBvaW50cyIsImNsb3Nlc3RUb1BvaW50IiwidGhyZXNob2xkIiwidGhyZXNob2xkU3F1YXJlZCIsIml0ZW1zIiwiYmVzdExpc3QiLCJiZXN0RGlzdGFuY2VTcXVhcmVkIiwidGhyZXNob2xkT2siLCJlYWNoIiwiaW5mb3MiLCJleHBsaWNpdENsb3Nlc3RUb1BvaW50IiwiaW5mbyIsInRzIiwiY29uY2F0IiwidGEiLCJ0YiIsInBhIiwicGIiLCJib3VuZHMiLCJhZGRQb2ludCIsIm1pbkRpc3RhbmNlU3F1YXJlZCIsIm1pbmltdW1EaXN0YW5jZVRvUG9pbnRTcXVhcmVkIiwibWF4RGlzdGFuY2VTcXVhcmVkIiwibWF4aW11bURpc3RhbmNlVG9Qb2ludFNxdWFyZWQiLCJtaW4iLCJtYXgiLCJjdXJJdGVtcyIsIml0ZW0iLCJ0bWlkIiwicG1pZCIsImJvdW5kc0EiLCJib3VuZHNCIiwibWluQSIsIm1pbkIiLCJtYXhBIiwibWF4QiIsImNsb3Nlc3RQb2ludCIsInBvbHlub21pYWxHZXRPdmVybGFwQ3ViaWMiLCJwMHMiLCJwMXMiLCJwMnMiLCJwM3MiLCJxMHMiLCJxMXMiLCJxMnMiLCJxM3MiLCJwb2x5bm9taWFsR2V0T3ZlcmxhcFF1YWRyYXRpYyIsImEiLCJzaWduIiwicG93IiwiYiIsInBvbHlub21pYWxHZXRPdmVybGFwTGluZWFyIiwiZGlzY3IiLCJzcXJ0IiwiaW50ZXJzZWN0IiwiaW50ZXJzZWN0T3RoZXIiLCJtYXAiLCJzd2FwU2VnbWVudEludGVyc2VjdGlvbiIsImN1YmljQSIsImRlZ3JlZUVsZXZhdGVkIiwiY3ViaWNCIiwicGFwZXJDdXJ2ZUEiLCJwYXBlciIsIkN1cnZlIiwiY29udHJvbDEiLCJjb250cm9sMiIsInBhcGVyQ3VydmVCIiwicGFwZXJJbnRlcnNlY3Rpb25zIiwiZ2V0SW50ZXJzZWN0aW9ucyIsInBhcGVySW50ZXJzZWN0aW9uIiwidGltZSIsImludGVyc2VjdGlvbiIsImRlc2VyaWFsaXplIiwib2JqIiwidHlwZSIsImRpc3RUb1NlZ21lbnRTcXVhcmVkIiwiZmlsdGVyQ2xvc2VzdFRvUG9pbnRSZXN1bHQiLCJyZXN1bHRzIiwiY2xvc2VzdERpc3RhbmNlU3F1YXJlZCIsIm1pbkJ5IiwidW5pcVdpdGgiLCJmaWx0ZXIiLCJpbnZhbGlkYXRpb25FbWl0dGVyIiwicmVnaXN0ZXIiLCJzZWdtZW50SW50ZXJzZWN0aW9uIiwiZ2V0U3dhcHBlZCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxnQkFBZ0IsR0FFaEIsT0FBT0EsaUJBQWlCLGtDQUFrQztBQUMxRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUdqRCxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxlQUFlLHFDQUFxQztBQUczRCxTQUFTQyxHQUFHLEVBQUVDLGtCQUFrQixFQUFFQyxLQUFLLEVBQUVDLGFBQWEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBbUJDLG1CQUFtQixFQUFnR0MsS0FBSyxFQUFFQyxPQUFP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