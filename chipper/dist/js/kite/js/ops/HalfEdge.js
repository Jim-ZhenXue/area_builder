// Copyright 2017-2023, University of Colorado Boulder
/**
 * Represents a single direction/side of an Edge. There are two half-edges for each edge, representing each direction.
 * The half-edge also stores face information for the face that would be to the left of the direction of travel.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector2 from '../../../dot/js/Vector2.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globaId = 0;
let HalfEdge = class HalfEdge {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Edge} edge
   * @param {boolean} isReversed
   * @returns {HalfEdge} - This reference for chaining
   */ initialize(edge, isReversed) {
        assert && assert(edge instanceof kite.Edge);
        assert && assert(typeof isReversed === 'boolean');
        // @public {Edge|null} - Null if disposed (in pool)
        this.edge = edge;
        // @public {Face|null} - Filled in later, contains a face reference
        this.face = null;
        // @public {boolean}
        this.isReversed = isReversed;
        // @public {number}
        this.signedAreaFragment = edge.signedAreaFragment * (isReversed ? -1 : 1);
        // @public {Vertex|null}
        this.startVertex = null;
        this.endVertex = null;
        // @public {Vector2} - Used for vertex sorting in Vertex.js. X is angle of end tangent (shifted),
        // Y is curvature at end. See Vertex edge sort for more information.
        this.sortVector = this.sortVector || new Vector2(0, 0);
        // @public {*} - Available for arbitrary client usage. --- KEEP JSON
        this.data = null;
        this.updateReferences(); // Initializes vertex references
        return this;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'HalfEdge',
            id: this.id,
            edge: this.edge.id,
            face: this.face === null ? null : this.face.id,
            isReversed: this.isReversed,
            signedAreaFragment: this.signedAreaFragment,
            startVertex: this.startVertex === null ? null : this.startVertex.id,
            endVertex: this.endVertex === null ? null : this.endVertex.id,
            sortVector: Vector2.Vector2IO.toStateObject(this.sortVector),
            data: this.data
        };
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        this.edge = null;
        this.face = null;
        this.startVertex = null;
        this.endVertex = null;
        this.data = null;
        this.freeToPool();
    }
    /**
   * Returns the next half-edge, walking around counter-clockwise as possible. Assumes edges have been sorted.
   * @public
   *
   * @param {function} [filter] - function( {Edge} ) => {boolean}. If it returns false, the edge will be skipped, and
   *                              not returned by getNext
   */ getNext(filter) {
        // Starting at 1, forever incrementing (we will bail out with normal conditions)
        for(let i = 1;; i++){
            let index = this.endVertex.incidentHalfEdges.indexOf(this) - i;
            if (index < 0) {
                index += this.endVertex.incidentHalfEdges.length;
            }
            const halfEdge = this.endVertex.incidentHalfEdges[index].getReversed();
            if (filter && !filter(halfEdge.edge)) {
                continue;
            }
            assert && assert(this.endVertex === halfEdge.startVertex);
            return halfEdge;
        }
    }
    /**
   * Update possibly reversed vertex references.
   * @private
   */ updateReferences() {
        this.startVertex = this.isReversed ? this.edge.endVertex : this.edge.startVertex;
        this.endVertex = this.isReversed ? this.edge.startVertex : this.edge.endVertex;
        assert && assert(this.startVertex);
        assert && assert(this.endVertex);
    }
    /**
   * Returns the tangent of the edge at the end vertex (in the direction away from the vertex).
   * @public
   *
   * @returns {Vector2}
   */ getEndTangent() {
        if (this.isReversed) {
            return this.edge.segment.startTangent;
        } else {
            return this.edge.segment.endTangent.negated();
        }
    }
    /**
   * Returns the curvature of the edge at the end vertex.
   * @public
   *
   * @returns {number}
   */ getEndCurvature() {
        if (this.isReversed) {
            return -this.edge.segment.curvatureAt(0);
        } else {
            return this.edge.segment.curvatureAt(1);
        }
    }
    /**
   * Returns the opposite half-edge for the same edge.
   * @public
   *
   * @returns {HalfEdge}
   */ getReversed() {
        return this.isReversed ? this.edge.forwardHalf : this.edge.reversedHalf;
    }
    /**
   * Returns a segment that starts at our startVertex and ends at our endVertex (may be reversed to accomplish that).
   * @public
   *
   * @returns {Segment}
   */ getDirectionalSegment() {
        if (this.isReversed) {
            return this.edge.segment.reversed();
        } else {
            return this.edge.segment;
        }
    }
    // @public
    freeToPool() {
        HalfEdge.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use HalfEdge.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Edge} edge
   * @param {boolean} isReversed
   */ constructor(edge, isReversed){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(edge, isReversed);
    }
};
// @public
HalfEdge.pool = new Pool(HalfEdge);
kite.register('HalfEdge', HalfEdge);
export default HalfEdge;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0hhbGZFZGdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzaW5nbGUgZGlyZWN0aW9uL3NpZGUgb2YgYW4gRWRnZS4gVGhlcmUgYXJlIHR3byBoYWxmLWVkZ2VzIGZvciBlYWNoIGVkZ2UsIHJlcHJlc2VudGluZyBlYWNoIGRpcmVjdGlvbi5cbiAqIFRoZSBoYWxmLWVkZ2UgYWxzbyBzdG9yZXMgZmFjZSBpbmZvcm1hdGlvbiBmb3IgdGhlIGZhY2UgdGhhdCB3b3VsZCBiZSB0byB0aGUgbGVmdCBvZiB0aGUgZGlyZWN0aW9uIG9mIHRyYXZlbC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsga2l0ZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFJZCA9IDA7XG5cbmNsYXNzIEhhbGZFZGdlIHtcbiAgLyoqXG4gICAqIEBwdWJsaWMgKGtpdGUtaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFVzZSBIYWxmRWRnZS5wb29sLmNyZWF0ZSBmb3IgbW9zdCB1c2FnZSBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBjb25zdHJ1Y3RvciBkaXJlY3RseS5cbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZXZlcnNlZFxuICAgKi9cbiAgY29uc3RydWN0b3IoIGVkZ2UsIGlzUmV2ZXJzZWQgKSB7XG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XG5cbiAgICAvLyBOT1RFOiBtb3N0IG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZC9kb2N1bWVudGVkIGluIHRoZSBpbml0aWFsaXplIG1ldGhvZC4gUGxlYXNlIGxvb2sgdGhlcmUgZm9yIG1vc3RcbiAgICAvLyBkZWZpbml0aW9ucy5cbiAgICB0aGlzLmluaXRpYWxpemUoIGVkZ2UsIGlzUmV2ZXJzZWQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaW1pbGFyIHRvIGEgdXN1YWwgY29uc3RydWN0b3IsIGJ1dCBpcyBzZXQgdXAgc28gaXQgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyAod2l0aCBkaXNwb3NlKCkgaW4tYmV0d2VlbikgdG9cbiAgICogc3VwcG9ydCBwb29saW5nLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IGVkZ2VcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1JldmVyc2VkXG4gICAqIEByZXR1cm5zIHtIYWxmRWRnZX0gLSBUaGlzIHJlZmVyZW5jZSBmb3IgY2hhaW5pbmdcbiAgICovXG4gIGluaXRpYWxpemUoIGVkZ2UsIGlzUmV2ZXJzZWQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSBpbnN0YW5jZW9mIGtpdGUuRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBpc1JldmVyc2VkID09PSAnYm9vbGVhbicgKTtcblxuICAgIC8vIEBwdWJsaWMge0VkZ2V8bnVsbH0gLSBOdWxsIGlmIGRpc3Bvc2VkIChpbiBwb29sKVxuICAgIHRoaXMuZWRnZSA9IGVkZ2U7XG5cbiAgICAvLyBAcHVibGljIHtGYWNlfG51bGx9IC0gRmlsbGVkIGluIGxhdGVyLCBjb250YWlucyBhIGZhY2UgcmVmZXJlbmNlXG4gICAgdGhpcy5mYWNlID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XG4gICAgdGhpcy5pc1JldmVyc2VkID0gaXNSZXZlcnNlZDtcblxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cbiAgICB0aGlzLnNpZ25lZEFyZWFGcmFnbWVudCA9IGVkZ2Uuc2lnbmVkQXJlYUZyYWdtZW50ICogKCBpc1JldmVyc2VkID8gLTEgOiAxICk7XG5cbiAgICAvLyBAcHVibGljIHtWZXJ0ZXh8bnVsbH1cbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gbnVsbDtcbiAgICB0aGlzLmVuZFZlcnRleCA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtWZWN0b3IyfSAtIFVzZWQgZm9yIHZlcnRleCBzb3J0aW5nIGluIFZlcnRleC5qcy4gWCBpcyBhbmdsZSBvZiBlbmQgdGFuZ2VudCAoc2hpZnRlZCksXG4gICAgLy8gWSBpcyBjdXJ2YXR1cmUgYXQgZW5kLiBTZWUgVmVydGV4IGVkZ2Ugc29ydCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICB0aGlzLnNvcnRWZWN0b3IgPSB0aGlzLnNvcnRWZWN0b3IgfHwgbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxuICAgIC8vIEBwdWJsaWMgeyp9IC0gQXZhaWxhYmxlIGZvciBhcmJpdHJhcnkgY2xpZW50IHVzYWdlLiAtLS0gS0VFUCBKU09OXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgIHRoaXMudXBkYXRlUmVmZXJlbmNlcygpOyAvLyBJbml0aWFsaXplcyB2ZXJ0ZXggcmVmZXJlbmNlc1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnSGFsZkVkZ2UnLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBlZGdlOiB0aGlzLmVkZ2UuaWQsXG4gICAgICBmYWNlOiB0aGlzLmZhY2UgPT09IG51bGwgPyBudWxsIDogdGhpcy5mYWNlLmlkLFxuICAgICAgaXNSZXZlcnNlZDogdGhpcy5pc1JldmVyc2VkLFxuICAgICAgc2lnbmVkQXJlYUZyYWdtZW50OiB0aGlzLnNpZ25lZEFyZWFGcmFnbWVudCxcbiAgICAgIHN0YXJ0VmVydGV4OiB0aGlzLnN0YXJ0VmVydGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuc3RhcnRWZXJ0ZXguaWQsXG4gICAgICBlbmRWZXJ0ZXg6IHRoaXMuZW5kVmVydGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuZW5kVmVydGV4LmlkLFxuICAgICAgc29ydFZlY3RvcjogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5zb3J0VmVjdG9yICksXG4gICAgICBkYXRhOiB0aGlzLmRhdGFcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgcmVmZXJlbmNlcyAoc28gaXQgY2FuIGFsbG93IG90aGVyIG9iamVjdHMgdG8gYmUgR0MnZWQgb3IgcG9vbGVkKSwgYW5kIGZyZWVzIGl0c2VsZiB0byB0aGUgcG9vbCBzbyBpdFxuICAgKiBjYW4gYmUgcmV1c2VkLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZWRnZSA9IG51bGw7XG4gICAgdGhpcy5mYWNlID0gbnVsbDtcbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gbnVsbDtcbiAgICB0aGlzLmVuZFZlcnRleCA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGhhbGYtZWRnZSwgd2Fsa2luZyBhcm91bmQgY291bnRlci1jbG9ja3dpc2UgYXMgcG9zc2libGUuIEFzc3VtZXMgZWRnZXMgaGF2ZSBiZWVuIHNvcnRlZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbZmlsdGVyXSAtIGZ1bmN0aW9uKCB7RWRnZX0gKSA9PiB7Ym9vbGVhbn0uIElmIGl0IHJldHVybnMgZmFsc2UsIHRoZSBlZGdlIHdpbGwgYmUgc2tpcHBlZCwgYW5kXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90IHJldHVybmVkIGJ5IGdldE5leHRcbiAgICovXG4gIGdldE5leHQoIGZpbHRlciApIHtcbiAgICAvLyBTdGFydGluZyBhdCAxLCBmb3JldmVyIGluY3JlbWVudGluZyAod2Ugd2lsbCBiYWlsIG91dCB3aXRoIG5vcm1hbCBjb25kaXRpb25zKVxuICAgIGZvciAoIGxldCBpID0gMTsgOyBpKysgKSB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLmVuZFZlcnRleC5pbmNpZGVudEhhbGZFZGdlcy5pbmRleE9mKCB0aGlzICkgLSBpO1xuICAgICAgaWYgKCBpbmRleCA8IDAgKSB7XG4gICAgICAgIGluZGV4ICs9IHRoaXMuZW5kVmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhhbGZFZGdlID0gdGhpcy5lbmRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIGluZGV4IF0uZ2V0UmV2ZXJzZWQoKTtcbiAgICAgIGlmICggZmlsdGVyICYmICFmaWx0ZXIoIGhhbGZFZGdlLmVkZ2UgKSApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZFZlcnRleCA9PT0gaGFsZkVkZ2Uuc3RhcnRWZXJ0ZXggKTtcbiAgICAgIHJldHVybiBoYWxmRWRnZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHBvc3NpYmx5IHJldmVyc2VkIHZlcnRleCByZWZlcmVuY2VzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlUmVmZXJlbmNlcygpIHtcbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gdGhpcy5pc1JldmVyc2VkID8gdGhpcy5lZGdlLmVuZFZlcnRleCA6IHRoaXMuZWRnZS5zdGFydFZlcnRleDtcbiAgICB0aGlzLmVuZFZlcnRleCA9IHRoaXMuaXNSZXZlcnNlZCA/IHRoaXMuZWRnZS5zdGFydFZlcnRleCA6IHRoaXMuZWRnZS5lbmRWZXJ0ZXg7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zdGFydFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZW5kVmVydGV4ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGFuZ2VudCBvZiB0aGUgZWRnZSBhdCB0aGUgZW5kIHZlcnRleCAoaW4gdGhlIGRpcmVjdGlvbiBhd2F5IGZyb20gdGhlIHZlcnRleCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICBnZXRFbmRUYW5nZW50KCkge1xuICAgIGlmICggdGhpcy5pc1JldmVyc2VkICkge1xuICAgICAgcmV0dXJuIHRoaXMuZWRnZS5zZWdtZW50LnN0YXJ0VGFuZ2VudDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5lZGdlLnNlZ21lbnQuZW5kVGFuZ2VudC5uZWdhdGVkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnZhdHVyZSBvZiB0aGUgZWRnZSBhdCB0aGUgZW5kIHZlcnRleC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0RW5kQ3VydmF0dXJlKCkge1xuICAgIGlmICggdGhpcy5pc1JldmVyc2VkICkge1xuICAgICAgcmV0dXJuIC10aGlzLmVkZ2Uuc2VnbWVudC5jdXJ2YXR1cmVBdCggMCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVkZ2Uuc2VnbWVudC5jdXJ2YXR1cmVBdCggMSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvcHBvc2l0ZSBoYWxmLWVkZ2UgZm9yIHRoZSBzYW1lIGVkZ2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge0hhbGZFZGdlfVxuICAgKi9cbiAgZ2V0UmV2ZXJzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNSZXZlcnNlZCA/IHRoaXMuZWRnZS5mb3J3YXJkSGFsZiA6IHRoaXMuZWRnZS5yZXZlcnNlZEhhbGY7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNlZ21lbnQgdGhhdCBzdGFydHMgYXQgb3VyIHN0YXJ0VmVydGV4IGFuZCBlbmRzIGF0IG91ciBlbmRWZXJ0ZXggKG1heSBiZSByZXZlcnNlZCB0byBhY2NvbXBsaXNoIHRoYXQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtTZWdtZW50fVxuICAgKi9cbiAgZ2V0RGlyZWN0aW9uYWxTZWdtZW50KCkge1xuICAgIGlmICggdGhpcy5pc1JldmVyc2VkICkge1xuICAgICAgcmV0dXJuIHRoaXMuZWRnZS5zZWdtZW50LnJldmVyc2VkKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZWRnZS5zZWdtZW50O1xuICAgIH1cbiAgfVxuXG4gIC8vIEBwdWJsaWNcbiAgZnJlZVRvUG9vbCgpIHtcbiAgICBIYWxmRWRnZS5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIC8vIEBwdWJsaWNcbiAgc3RhdGljIHBvb2wgPSBuZXcgUG9vbCggSGFsZkVkZ2UgKTtcbn1cblxua2l0ZS5yZWdpc3RlciggJ0hhbGZFZGdlJywgSGFsZkVkZ2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgSGFsZkVkZ2U7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJQb29sIiwia2l0ZSIsImdsb2JhSWQiLCJIYWxmRWRnZSIsImluaXRpYWxpemUiLCJlZGdlIiwiaXNSZXZlcnNlZCIsImFzc2VydCIsIkVkZ2UiLCJmYWNlIiwic2lnbmVkQXJlYUZyYWdtZW50Iiwic3RhcnRWZXJ0ZXgiLCJlbmRWZXJ0ZXgiLCJzb3J0VmVjdG9yIiwiZGF0YSIsInVwZGF0ZVJlZmVyZW5jZXMiLCJzZXJpYWxpemUiLCJ0eXBlIiwiaWQiLCJWZWN0b3IySU8iLCJ0b1N0YXRlT2JqZWN0IiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJnZXROZXh0IiwiZmlsdGVyIiwiaSIsImluZGV4IiwiaW5jaWRlbnRIYWxmRWRnZXMiLCJpbmRleE9mIiwibGVuZ3RoIiwiaGFsZkVkZ2UiLCJnZXRSZXZlcnNlZCIsImdldEVuZFRhbmdlbnQiLCJzZWdtZW50Iiwic3RhcnRUYW5nZW50IiwiZW5kVGFuZ2VudCIsIm5lZ2F0ZWQiLCJnZXRFbmRDdXJ2YXR1cmUiLCJjdXJ2YXR1cmVBdCIsImZvcndhcmRIYWxmIiwicmV2ZXJzZWRIYWxmIiwiZ2V0RGlyZWN0aW9uYWxTZWdtZW50IiwicmV2ZXJzZWQiLCJwb29sIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsVUFBVSxnQ0FBZ0M7QUFDakQsU0FBU0MsSUFBSSxRQUFRLGdCQUFnQjtBQUVyQyxJQUFJQyxVQUFVO0FBRWQsSUFBQSxBQUFNQyxXQUFOLE1BQU1BO0lBa0JKOzs7Ozs7OztHQVFDLEdBQ0RDLFdBQVlDLElBQUksRUFBRUMsVUFBVSxFQUFHO1FBQzdCQyxVQUFVQSxPQUFRRixnQkFBZ0JKLEtBQUtPLElBQUk7UUFDM0NELFVBQVVBLE9BQVEsT0FBT0QsZUFBZTtRQUV4QyxtREFBbUQ7UUFDbkQsSUFBSSxDQUFDRCxJQUFJLEdBQUdBO1FBRVosbUVBQW1FO1FBQ25FLElBQUksQ0FBQ0ksSUFBSSxHQUFHO1FBRVosb0JBQW9CO1FBQ3BCLElBQUksQ0FBQ0gsVUFBVSxHQUFHQTtRQUVsQixtQkFBbUI7UUFDbkIsSUFBSSxDQUFDSSxrQkFBa0IsR0FBR0wsS0FBS0ssa0JBQWtCLEdBQUtKLENBQUFBLGFBQWEsQ0FBQyxJQUFJLENBQUE7UUFFeEUsd0JBQXdCO1FBQ3hCLElBQUksQ0FBQ0ssV0FBVyxHQUFH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