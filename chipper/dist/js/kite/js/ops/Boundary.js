// Copyright 2017-2023, University of Colorado Boulder
/**
 * A boundary is a loop of directed half-edges that always follow in the tightest counter-clockwise direction around
 * vertices.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Ray2 from '../../../dot/js/Ray2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite, Subpath } from '../imports.js';
let globaId = 0;
let Boundary = class Boundary {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Array.<HalfEdge>} halfEdges
   * @returns {Boundary} - This reference for chaining
   */ initialize(halfEdges) {
        // @public {Array.<HalfEdge>}
        this.halfEdges = halfEdges;
        // @public {number}
        this.signedArea = this.computeSignedArea();
        // @public {Bounds2}
        this.bounds = this.computeBounds();
        // @public {Array.<Boundary>}
        this.childBoundaries = cleanArray(this.childBoundaries);
        return this;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'Boundary',
            id: this.id,
            halfEdges: this.halfEdges.map((halfEdge)=>halfEdge.id),
            signedArea: this.signedArea,
            bounds: Bounds2.Bounds2IO.toStateObject(this.bounds),
            childBoundaries: this.childBoundaries.map((boundary)=>boundary.id)
        };
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        this.halfEdges = [];
        cleanArray(this.childBoundaries);
        this.freeToPool();
    }
    /**
   * Returns whether this boundary is essentially "counter-clockwise" (in the non-reversed coordinate system) with
   * positive signed area, or "clockwise" with negative signed area.
   * @public
   *
   * Boundaries are treated as "inner" boundaries when they are counter-clockwise, as the path followed will generally
   * follow the inside of a face (given how the "next" edge of a vertex is computed).
   *
   * @returns {number}
   */ isInner() {
        return this.signedArea > 0;
    }
    /**
   * Returns the signed area of this boundary, given its half edges.
   * @public
   *
   * Each half-edge has its own contribution to the signed area, which are summed together.
   *
   * @returns {number}
   */ computeSignedArea() {
        let signedArea = 0;
        for(let i = 0; i < this.halfEdges.length; i++){
            signedArea += this.halfEdges[i].signedAreaFragment;
        }
        return signedArea;
    }
    /**
   * Returns the bounds of the boundary (the union of each of the boundary's segments' bounds).
   * @public
   *
   * @returns {Bounds2}
   */ computeBounds() {
        const bounds = Bounds2.NOTHING.copy();
        for(let i = 0; i < this.halfEdges.length; i++){
            bounds.includeBounds(this.halfEdges[i].edge.segment.getBounds());
        }
        return bounds;
    }
    /**
   * Returns a point on the boundary which, when the shape (and point) are transformed with the given transform, would
   * be a point with the minimal y value.
   * @public
   *
   * Will only return one point, even if there are multiple points that have the same minimal y values for the
   * boundary. The point may be at the end of one of the edges/segments (at a vertex), but also may somewhere in the
   * middle of an edge/segment.
   *
   * @param {Transform3} transform - Transform used because we want the inverse also.
   * @returns {Vector2}
   */ computeExtremePoint(transform) {
        assert && assert(this.halfEdges.length > 0, 'There is no extreme point if we have no edges');
        // Transform all of the segments into the new transformed coordinate space.
        const transformedSegments = [];
        for(let i = 0; i < this.halfEdges.length; i++){
            transformedSegments.push(this.halfEdges[i].edge.segment.transformed(transform.getMatrix()));
        }
        // Find the bounds of the entire transformed boundary
        const transformedBounds = Bounds2.NOTHING.copy();
        for(let i = 0; i < transformedSegments.length; i++){
            transformedBounds.includeBounds(transformedSegments[i].getBounds());
        }
        for(let i = 0; i < transformedSegments.length; i++){
            const segment = transformedSegments[i];
            // See if this is one of our potential segments whose bounds have the minimal y value. This indicates at least
            // one point on this segment will be a minimal-y point.
            if (segment.getBounds().top === transformedBounds.top) {
                // Pick a point with values that guarantees any point will have a smaller y value.
                let minimalPoint = new Vector2(0, Number.POSITIVE_INFINITY);
                // Grab parametric t-values for where our segment has extreme points, and adds the end points (which are
                // candidates). One of the points at these values should be our minimal point.
                const tValues = [
                    0,
                    1
                ].concat(segment.getInteriorExtremaTs());
                for(let j = 0; j < tValues.length; j++){
                    const point = segment.positionAt(tValues[j]);
                    if (point.y < minimalPoint.y) {
                        minimalPoint = point;
                    }
                }
                // Transform this minimal point back into our (non-transformed) boundary's coordinate space.
                return transform.inversePosition2(minimalPoint);
            }
        }
        throw new Error('Should not reach here if we have segments');
    }
    /**
   * Returns a ray (position and direction) pointing away from our boundary at an "extreme" point, so that the ray
   * will be guaranteed not to intersect this boundary.
   * @public
   *
   * The ray's position will be slightly offset from the boundary, so that it will not technically intersect the
   * boundary where the extreme point lies. The extreme point will be chosen such that it would have the smallest
   * y value when the boundary is transformed by the given transformation.
   *
   * The ray's direction will be such that if the ray is transformed by the given transform, it will be pointing
   * in the negative-y direction (e.g. a vector of (0,-1)). This should guarantee it is facing away from the
   * boundary, and will be consistent in direction with other extreme rays (needed for its use case with the
   * boundary graph).
   *
   * @param {Transform3} transform
   * @returns {Ray2}
   */ computeExtremeRay(transform) {
        const extremePoint = this.computeExtremePoint(transform);
        const orientation = transform.inverseDelta2(new Vector2(0, -1)).normalized();
        return new Ray2(extremePoint.plus(orientation.timesScalar(1e-4)), orientation);
    }
    /**
   * Returns whether this boundary includes the specified half-edge.
   * @public
   *
   * @param {HalfEdge} halfEdge
   * @returns {boolean}
   */ hasHalfEdge(halfEdge) {
        for(let i = 0; i < this.halfEdges.length; i++){
            if (this.halfEdges[i] === halfEdge) {
                return true;
            }
        }
        return false;
    }
    /**
   * Converts this boundary to a Subpath, so that we can construct things like Shape objects from it.
   * @public
   *
   * @returns {Subpath}
   */ toSubpath() {
        const segments = [];
        for(let i = 0; i < this.halfEdges.length; i++){
            segments.push(this.halfEdges[i].getDirectionalSegment());
        }
        return new Subpath(segments, null, true);
    }
    // @public
    freeToPool() {
        Boundary.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use Boundary.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Array.<HalfEdge>} halfEdges
   */ constructor(halfEdges){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(halfEdges);
    }
};
// @public
Boundary.pool = new Pool(Boundary);
kite.register('Boundary', Boundary);
export default Boundary;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0JvdW5kYXJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgYm91bmRhcnkgaXMgYSBsb29wIG9mIGRpcmVjdGVkIGhhbGYtZWRnZXMgdGhhdCBhbHdheXMgZm9sbG93IGluIHRoZSB0aWdodGVzdCBjb3VudGVyLWNsb2Nrd2lzZSBkaXJlY3Rpb24gYXJvdW5kXG4gKiB2ZXJ0aWNlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJheTIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JheTIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsga2l0ZSwgU3VicGF0aCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFJZCA9IDA7XG5cbmNsYXNzIEJvdW5kYXJ5IHtcbiAgLyoqXG4gICAqIEBwdWJsaWMgKGtpdGUtaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFVzZSBCb3VuZGFyeS5wb29sLmNyZWF0ZSBmb3IgbW9zdCB1c2FnZSBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48SGFsZkVkZ2U+fSBoYWxmRWRnZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBoYWxmRWRnZXMgKSB7XG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XG5cbiAgICAvLyBOT1RFOiBtb3N0IG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZC9kb2N1bWVudGVkIGluIHRoZSBpbml0aWFsaXplIG1ldGhvZC4gUGxlYXNlIGxvb2sgdGhlcmUgZm9yIG1vc3RcbiAgICAvLyBkZWZpbml0aW9ucy5cbiAgICB0aGlzLmluaXRpYWxpemUoIGhhbGZFZGdlcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gYSB1c3VhbCBjb25zdHJ1Y3RvciwgYnV0IGlzIHNldCB1cCBzbyBpdCBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzICh3aXRoIGRpc3Bvc2UoKSBpbi1iZXR3ZWVuKSB0b1xuICAgKiBzdXBwb3J0IHBvb2xpbmcuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPEhhbGZFZGdlPn0gaGFsZkVkZ2VzXG4gICAqIEByZXR1cm5zIHtCb3VuZGFyeX0gLSBUaGlzIHJlZmVyZW5jZSBmb3IgY2hhaW5pbmdcbiAgICovXG4gIGluaXRpYWxpemUoIGhhbGZFZGdlcyApIHtcbiAgICAvLyBAcHVibGljIHtBcnJheS48SGFsZkVkZ2U+fVxuICAgIHRoaXMuaGFsZkVkZ2VzID0gaGFsZkVkZ2VzO1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuc2lnbmVkQXJlYSA9IHRoaXMuY29tcHV0ZVNpZ25lZEFyZWEoKTtcblxuICAgIC8vIEBwdWJsaWMge0JvdW5kczJ9XG4gICAgdGhpcy5ib3VuZHMgPSB0aGlzLmNvbXB1dGVCb3VuZHMoKTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxCb3VuZGFyeT59XG4gICAgdGhpcy5jaGlsZEJvdW5kYXJpZXMgPSBjbGVhbkFycmF5KCB0aGlzLmNoaWxkQm91bmRhcmllcyApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnQm91bmRhcnknLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBoYWxmRWRnZXM6IHRoaXMuaGFsZkVkZ2VzLm1hcCggaGFsZkVkZ2UgPT4gaGFsZkVkZ2UuaWQgKSxcbiAgICAgIHNpZ25lZEFyZWE6IHRoaXMuc2lnbmVkQXJlYSxcbiAgICAgIGJvdW5kczogQm91bmRzMi5Cb3VuZHMySU8udG9TdGF0ZU9iamVjdCggdGhpcy5ib3VuZHMgKSxcbiAgICAgIGNoaWxkQm91bmRhcmllczogdGhpcy5jaGlsZEJvdW5kYXJpZXMubWFwKCBib3VuZGFyeSA9PiBib3VuZGFyeS5pZCApXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHJlZmVyZW5jZXMgKHNvIGl0IGNhbiBhbGxvdyBvdGhlciBvYmplY3RzIHRvIGJlIEdDJ2VkIG9yIHBvb2xlZCksIGFuZCBmcmVlcyBpdHNlbGYgdG8gdGhlIHBvb2wgc28gaXRcbiAgICogY2FuIGJlIHJldXNlZC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmhhbGZFZGdlcyA9IFtdO1xuICAgIGNsZWFuQXJyYXkoIHRoaXMuY2hpbGRCb3VuZGFyaWVzICk7XG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgYm91bmRhcnkgaXMgZXNzZW50aWFsbHkgXCJjb3VudGVyLWNsb2Nrd2lzZVwiIChpbiB0aGUgbm9uLXJldmVyc2VkIGNvb3JkaW5hdGUgc3lzdGVtKSB3aXRoXG4gICAqIHBvc2l0aXZlIHNpZ25lZCBhcmVhLCBvciBcImNsb2Nrd2lzZVwiIHdpdGggbmVnYXRpdmUgc2lnbmVkIGFyZWEuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQm91bmRhcmllcyBhcmUgdHJlYXRlZCBhcyBcImlubmVyXCIgYm91bmRhcmllcyB3aGVuIHRoZXkgYXJlIGNvdW50ZXItY2xvY2t3aXNlLCBhcyB0aGUgcGF0aCBmb2xsb3dlZCB3aWxsIGdlbmVyYWxseVxuICAgKiBmb2xsb3cgdGhlIGluc2lkZSBvZiBhIGZhY2UgKGdpdmVuIGhvdyB0aGUgXCJuZXh0XCIgZWRnZSBvZiBhIHZlcnRleCBpcyBjb21wdXRlZCkuXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBpc0lubmVyKCkge1xuICAgIHJldHVybiB0aGlzLnNpZ25lZEFyZWEgPiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHNpZ25lZCBhcmVhIG9mIHRoaXMgYm91bmRhcnksIGdpdmVuIGl0cyBoYWxmIGVkZ2VzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEVhY2ggaGFsZi1lZGdlIGhhcyBpdHMgb3duIGNvbnRyaWJ1dGlvbiB0byB0aGUgc2lnbmVkIGFyZWEsIHdoaWNoIGFyZSBzdW1tZWQgdG9nZXRoZXIuXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBjb21wdXRlU2lnbmVkQXJlYSgpIHtcbiAgICBsZXQgc2lnbmVkQXJlYSA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5oYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBzaWduZWRBcmVhICs9IHRoaXMuaGFsZkVkZ2VzWyBpIF0uc2lnbmVkQXJlYUZyYWdtZW50O1xuICAgIH1cbiAgICByZXR1cm4gc2lnbmVkQXJlYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhlIGJvdW5kYXJ5ICh0aGUgdW5pb24gb2YgZWFjaCBvZiB0aGUgYm91bmRhcnkncyBzZWdtZW50cycgYm91bmRzKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIGNvbXB1dGVCb3VuZHMoKSB7XG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaGFsZkVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuaGFsZkVkZ2VzWyBpIF0uZWRnZS5zZWdtZW50LmdldEJvdW5kcygpICk7XG4gICAgfVxuICAgIHJldHVybiBib3VuZHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHBvaW50IG9uIHRoZSBib3VuZGFyeSB3aGljaCwgd2hlbiB0aGUgc2hhcGUgKGFuZCBwb2ludCkgYXJlIHRyYW5zZm9ybWVkIHdpdGggdGhlIGdpdmVuIHRyYW5zZm9ybSwgd291bGRcbiAgICogYmUgYSBwb2ludCB3aXRoIHRoZSBtaW5pbWFsIHkgdmFsdWUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogV2lsbCBvbmx5IHJldHVybiBvbmUgcG9pbnQsIGV2ZW4gaWYgdGhlcmUgYXJlIG11bHRpcGxlIHBvaW50cyB0aGF0IGhhdmUgdGhlIHNhbWUgbWluaW1hbCB5IHZhbHVlcyBmb3IgdGhlXG4gICAqIGJvdW5kYXJ5LiBUaGUgcG9pbnQgbWF5IGJlIGF0IHRoZSBlbmQgb2Ygb25lIG9mIHRoZSBlZGdlcy9zZWdtZW50cyAoYXQgYSB2ZXJ0ZXgpLCBidXQgYWxzbyBtYXkgc29tZXdoZXJlIGluIHRoZVxuICAgKiBtaWRkbGUgb2YgYW4gZWRnZS9zZWdtZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1RyYW5zZm9ybTN9IHRyYW5zZm9ybSAtIFRyYW5zZm9ybSB1c2VkIGJlY2F1c2Ugd2Ugd2FudCB0aGUgaW52ZXJzZSBhbHNvLlxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cbiAgICovXG4gIGNvbXB1dGVFeHRyZW1lUG9pbnQoIHRyYW5zZm9ybSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhbGZFZGdlcy5sZW5ndGggPiAwLCAnVGhlcmUgaXMgbm8gZXh0cmVtZSBwb2ludCBpZiB3ZSBoYXZlIG5vIGVkZ2VzJyApO1xuXG4gICAgLy8gVHJhbnNmb3JtIGFsbCBvZiB0aGUgc2VnbWVudHMgaW50byB0aGUgbmV3IHRyYW5zZm9ybWVkIGNvb3JkaW5hdGUgc3BhY2UuXG4gICAgY29uc3QgdHJhbnNmb3JtZWRTZWdtZW50cyA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaGFsZkVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdHJhbnNmb3JtZWRTZWdtZW50cy5wdXNoKCB0aGlzLmhhbGZFZGdlc1sgaSBdLmVkZ2Uuc2VnbWVudC50cmFuc2Zvcm1lZCggdHJhbnNmb3JtLmdldE1hdHJpeCgpICkgKTtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBib3VuZHMgb2YgdGhlIGVudGlyZSB0cmFuc2Zvcm1lZCBib3VuZGFyeVxuICAgIGNvbnN0IHRyYW5zZm9ybWVkQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFuc2Zvcm1lZFNlZ21lbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdHJhbnNmb3JtZWRCb3VuZHMuaW5jbHVkZUJvdW5kcyggdHJhbnNmb3JtZWRTZWdtZW50c1sgaSBdLmdldEJvdW5kcygpICk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhbnNmb3JtZWRTZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSB0cmFuc2Zvcm1lZFNlZ21lbnRzWyBpIF07XG5cbiAgICAgIC8vIFNlZSBpZiB0aGlzIGlzIG9uZSBvZiBvdXIgcG90ZW50aWFsIHNlZ21lbnRzIHdob3NlIGJvdW5kcyBoYXZlIHRoZSBtaW5pbWFsIHkgdmFsdWUuIFRoaXMgaW5kaWNhdGVzIGF0IGxlYXN0XG4gICAgICAvLyBvbmUgcG9pbnQgb24gdGhpcyBzZWdtZW50IHdpbGwgYmUgYSBtaW5pbWFsLXkgcG9pbnQuXG4gICAgICBpZiAoIHNlZ21lbnQuZ2V0Qm91bmRzKCkudG9wID09PSB0cmFuc2Zvcm1lZEJvdW5kcy50b3AgKSB7XG4gICAgICAgIC8vIFBpY2sgYSBwb2ludCB3aXRoIHZhbHVlcyB0aGF0IGd1YXJhbnRlZXMgYW55IHBvaW50IHdpbGwgaGF2ZSBhIHNtYWxsZXIgeSB2YWx1ZS5cbiAgICAgICAgbGV0IG1pbmltYWxQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKTtcblxuICAgICAgICAvLyBHcmFiIHBhcmFtZXRyaWMgdC12YWx1ZXMgZm9yIHdoZXJlIG91ciBzZWdtZW50IGhhcyBleHRyZW1lIHBvaW50cywgYW5kIGFkZHMgdGhlIGVuZCBwb2ludHMgKHdoaWNoIGFyZVxuICAgICAgICAvLyBjYW5kaWRhdGVzKS4gT25lIG9mIHRoZSBwb2ludHMgYXQgdGhlc2UgdmFsdWVzIHNob3VsZCBiZSBvdXIgbWluaW1hbCBwb2ludC5cbiAgICAgICAgY29uc3QgdFZhbHVlcyA9IFsgMCwgMSBdLmNvbmNhdCggc2VnbWVudC5nZXRJbnRlcmlvckV4dHJlbWFUcygpICk7XG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRWYWx1ZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSBzZWdtZW50LnBvc2l0aW9uQXQoIHRWYWx1ZXNbIGogXSApO1xuICAgICAgICAgIGlmICggcG9pbnQueSA8IG1pbmltYWxQb2ludC55ICkge1xuICAgICAgICAgICAgbWluaW1hbFBvaW50ID0gcG9pbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoaXMgbWluaW1hbCBwb2ludCBiYWNrIGludG8gb3VyIChub24tdHJhbnNmb3JtZWQpIGJvdW5kYXJ5J3MgY29vcmRpbmF0ZSBzcGFjZS5cbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBtaW5pbWFsUG9pbnQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoICdTaG91bGQgbm90IHJlYWNoIGhlcmUgaWYgd2UgaGF2ZSBzZWdtZW50cycgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmF5IChwb3NpdGlvbiBhbmQgZGlyZWN0aW9uKSBwb2ludGluZyBhd2F5IGZyb20gb3VyIGJvdW5kYXJ5IGF0IGFuIFwiZXh0cmVtZVwiIHBvaW50LCBzbyB0aGF0IHRoZSByYXlcbiAgICogd2lsbCBiZSBndWFyYW50ZWVkIG5vdCB0byBpbnRlcnNlY3QgdGhpcyBib3VuZGFyeS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGUgcmF5J3MgcG9zaXRpb24gd2lsbCBiZSBzbGlnaHRseSBvZmZzZXQgZnJvbSB0aGUgYm91bmRhcnksIHNvIHRoYXQgaXQgd2lsbCBub3QgdGVjaG5pY2FsbHkgaW50ZXJzZWN0IHRoZVxuICAgKiBib3VuZGFyeSB3aGVyZSB0aGUgZXh0cmVtZSBwb2ludCBsaWVzLiBUaGUgZXh0cmVtZSBwb2ludCB3aWxsIGJlIGNob3NlbiBzdWNoIHRoYXQgaXQgd291bGQgaGF2ZSB0aGUgc21hbGxlc3RcbiAgICogeSB2YWx1ZSB3aGVuIHRoZSBib3VuZGFyeSBpcyB0cmFuc2Zvcm1lZCBieSB0aGUgZ2l2ZW4gdHJhbnNmb3JtYXRpb24uXG4gICAqXG4gICAqIFRoZSByYXkncyBkaXJlY3Rpb24gd2lsbCBiZSBzdWNoIHRoYXQgaWYgdGhlIHJheSBpcyB0cmFuc2Zvcm1lZCBieSB0aGUgZ2l2ZW4gdHJhbnNmb3JtLCBpdCB3aWxsIGJlIHBvaW50aW5nXG4gICAqIGluIHRoZSBuZWdhdGl2ZS15IGRpcmVjdGlvbiAoZS5nLiBhIHZlY3RvciBvZiAoMCwtMSkpLiBUaGlzIHNob3VsZCBndWFyYW50ZWUgaXQgaXMgZmFjaW5nIGF3YXkgZnJvbSB0aGVcbiAgICogYm91bmRhcnksIGFuZCB3aWxsIGJlIGNvbnNpc3RlbnQgaW4gZGlyZWN0aW9uIHdpdGggb3RoZXIgZXh0cmVtZSByYXlzIChuZWVkZWQgZm9yIGl0cyB1c2UgY2FzZSB3aXRoIHRoZVxuICAgKiBib3VuZGFyeSBncmFwaCkuXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhbnNmb3JtM30gdHJhbnNmb3JtXG4gICAqIEByZXR1cm5zIHtSYXkyfVxuICAgKi9cbiAgY29tcHV0ZUV4dHJlbWVSYXkoIHRyYW5zZm9ybSApIHtcbiAgICBjb25zdCBleHRyZW1lUG9pbnQgPSB0aGlzLmNvbXB1dGVFeHRyZW1lUG9pbnQoIHRyYW5zZm9ybSApO1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdHJhbnNmb3JtLmludmVyc2VEZWx0YTIoIG5ldyBWZWN0b3IyKCAwLCAtMSApICkubm9ybWFsaXplZCgpO1xuICAgIHJldHVybiBuZXcgUmF5MiggZXh0cmVtZVBvaW50LnBsdXMoIG9yaWVudGF0aW9uLnRpbWVzU2NhbGFyKCAxZS00ICkgKSwgb3JpZW50YXRpb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBib3VuZGFyeSBpbmNsdWRlcyB0aGUgc3BlY2lmaWVkIGhhbGYtZWRnZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0hhbGZFZGdlfSBoYWxmRWRnZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0hhbGZFZGdlKCBoYWxmRWRnZSApIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5oYWxmRWRnZXNbIGkgXSA9PT0gaGFsZkVkZ2UgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBib3VuZGFyeSB0byBhIFN1YnBhdGgsIHNvIHRoYXQgd2UgY2FuIGNvbnN0cnVjdCB0aGluZ3MgbGlrZSBTaGFwZSBvYmplY3RzIGZyb20gaXQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge1N1YnBhdGh9XG4gICAqL1xuICB0b1N1YnBhdGgoKSB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHNlZ21lbnRzLnB1c2goIHRoaXMuaGFsZkVkZ2VzWyBpIF0uZ2V0RGlyZWN0aW9uYWxTZWdtZW50KCkgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTdWJwYXRoKCBzZWdtZW50cywgbnVsbCwgdHJ1ZSApO1xuICB9XG5cbiAgLy8gQHB1YmxpY1xuICBmcmVlVG9Qb29sKCkge1xuICAgIEJvdW5kYXJ5LnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgLy8gQHB1YmxpY1xuICBzdGF0aWMgcG9vbCA9IG5ldyBQb29sKCBCb3VuZGFyeSApO1xufVxuXG5raXRlLnJlZ2lzdGVyKCAnQm91bmRhcnknLCBCb3VuZGFyeSApO1xuXG5leHBvcnQgZGVmYXVsdCBCb3VuZGFyeTsiXSwibmFtZXMiOlsiQm91bmRzMiIsIlJheTIiLCJWZWN0b3IyIiwiY2xlYW5BcnJheSIsIlBvb2wiLCJraXRlIiwiU3VicGF0aCIsImdsb2JhSWQiLCJCb3VuZGFyeSIsImluaXRpYWxpemUiLCJoYWxmRWRnZXMiLCJzaWduZWRBcmVhIiwiY29tcHV0ZVNpZ25lZEFyZWEiLCJib3VuZHMiLCJjb21wdXRlQm91bmRzIiwiY2hpbGRCb3VuZGFyaWVzIiwic2VyaWFsaXplIiwidHlwZSIsImlkIiwibWFwIiwiaGFsZkVkZ2UiLCJCb3VuZHMySU8iLCJ0b1N0YXRlT2JqZWN0IiwiYm91bmRhcnkiLCJkaXNwb3NlIiwiZnJlZVRvUG9vbCIsImlzSW5uZXIiLCJpIiwibGVuZ3RoIiwic2lnbmVkQXJlYUZyYWdtZW50IiwiTk9USElORyIsImNvcHkiLCJpbmNsdWRlQm91bmRzIiwiZWRnZSIsInNlZ21lbnQiLCJnZXRCb3VuZHMiLCJjb21wdXRlRXh0cmVtZVBvaW50IiwidHJhbnNmb3JtIiwiYXNzZXJ0IiwidHJhbnNmb3JtZWRTZWdtZW50cyIsInB1c2giLCJ0cmFuc2Zvcm1lZCIsImdldE1hdHJpeCIsInRyYW5zZm9ybWVkQm91bmRzIiwidG9wIiwibWluaW1hbFBvaW50IiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJ0VmFsdWVzIiwiY29uY2F0IiwiZ2V0SW50ZXJpb3JFeHRyZW1hVHMiLCJqIiwicG9pbnQiLCJwb3NpdGlvbkF0IiwieSIsImludmVyc2VQb3NpdGlvbjIiLCJFcnJvciIsImNvbXB1dGVFeHRyZW1lUmF5IiwiZXh0cmVtZVBvaW50Iiwib3JpZW50YXRpb24iLCJpbnZlcnNlRGVsdGEyIiwibm9ybWFsaXplZCIsInBsdXMiLCJ0aW1lc1NjYWxhciIsImhhc0hhbGZFZGdlIiwidG9TdWJwYXRoIiwic2VnbWVudHMiLCJnZXREaXJlY3Rpb25hbFNlZ21lbnQiLCJwb29sIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsVUFBVSwwQkFBMEI7QUFDM0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxVQUFVLGdDQUFnQztBQUNqRCxTQUFTQyxJQUFJLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFOUMsSUFBSUMsVUFBVTtBQUVkLElBQUEsQUFBTUMsV0FBTixNQUFNQTtJQWlCSjs7Ozs7OztHQU9DLEdBQ0RDLFdBQVlDLFNBQVMsRUFBRztRQUN0Qiw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDQSxTQUFTLEdBQUdBO1FBRWpCLG1CQUFtQjtRQUNuQixJQUFJLENBQUNDLFVBQVUsR0FBRyxJQUFJLENBQUNDLGlC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