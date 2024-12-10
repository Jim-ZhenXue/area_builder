// Copyright 2017-2023, University of Colorado Boulder
/**
 * Represents a point in space that connects to edges. It stores the edges that are connected (directionally as
 * half-edges since Cubic segments can start and end at the same point/vertex), and can handle sorting edges so that
 * a half-edge's "next" half-edge (following counter-clockwise) can be determined.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite, Line } from '../imports.js';
let globaId = 0;
let Vertex = class Vertex {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Vector2} point
   * @returns {Vertex} - This reference for chaining
   */ initialize(point) {
        assert && assert(point instanceof Vector2);
        // @public {Vector2}
        this.point = point;
        // @public {Array.<HalfEdge>} - Records the half-edge that points to (ends at) this vertex.
        this.incidentHalfEdges = cleanArray(this.incidentHalfEdges);
        // @public {boolean} - Used for depth-first search
        this.visited = false;
        // @public {number} - Visit index for bridge detection (more efficient to have inline here)
        this.visitIndex = 0;
        // @public {number} - Low index for bridge detection (more efficient to have inline here)
        this.lowIndex = 0;
        // @public {*} - Available for arbitrary client usage. -- Keep JSONable
        this.data = null;
        // @public {*} - kite-internal
        this.internalData = {};
        return this;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'Vertex',
            id: this.id,
            point: Vector2.Vector2IO.toStateObject(this.point),
            incidentHalfEdges: this.incidentHalfEdges.map((halfEdge)=>halfEdge.id),
            visited: this.visited,
            visitIndex: this.visitIndex,
            lowIndex: this.lowIndex
        };
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        this.point = Vector2.ZERO;
        cleanArray(this.incidentHalfEdges);
        this.freeToPool();
    }
    /**
   * Sorts the edges in increasing angle order.
   * @public
   */ sortEdges() {
        const vectors = []; // x coordinate will be "angle", y coordinate will be curvature
        for(let i = 0; i < this.incidentHalfEdges.length; i++){
            const halfEdge = this.incidentHalfEdges[i];
            // NOTE: If it is expensive to precompute curvature, we could save it until edgeComparison needs it.
            vectors.push(halfEdge.sortVector.setXY(halfEdge.getEndTangent().angle, halfEdge.getEndCurvature()));
        }
        // "Rotate" the angles until we are sure that our "cut" (where -pi goes to pi around the circle) is at a place
        // not near any angle. This should prevent ambiguity in sorting (which can lead to bugs in the order)
        const cutoff = -Math.PI + 1e-4;
        let atCutAngle = false;
        while(!atCutAngle){
            atCutAngle = true;
            for(let i = 0; i < vectors.length; i++){
                if (vectors[i].x < cutoff) {
                    atCutAngle = false;
                }
            }
            if (!atCutAngle) {
                for(let i = 0; i < vectors.length; i++){
                    const vector = vectors[i];
                    vector.x -= 1.62594024516; // Definitely not choosing random digits by typing! (shouldn't matter)
                    if (vector.x < -Math.PI - 1e-4) {
                        vector.x += Math.PI * 2;
                    }
                }
            }
        }
        this.incidentHalfEdges.sort(Vertex.edgeComparison);
    }
    /**
   * Compare two edges for sortEdges. Should have executed that first, as it relies on information looked up in that
   * process.
   * @public
   *
   * @param {Edge} halfEdgeA
   * @param {Edge} halfEdgeB
   * @returns {number}
   */ static edgeComparison(halfEdgeA, halfEdgeB) {
        const angleA = halfEdgeA.sortVector.x;
        const angleB = halfEdgeB.sortVector.x;
        // Don't allow angleA=-pi, angleB=pi (they are equivalent)
        // If our angle is very small, we need to accept it still if we have two lines (since they will have the same
        // curvature).
        if (Math.abs(angleA - angleB) > 1e-5 || angleA !== angleB && halfEdgeA.edge.segment instanceof Line && halfEdgeB.edge.segment instanceof Line) {
            return angleA < angleB ? -1 : 1;
        } else {
            const curvatureA = halfEdgeA.sortVector.y;
            const curvatureB = halfEdgeB.sortVector.y;
            if (Math.abs(curvatureA - curvatureB) > 1e-5) {
                return curvatureA < curvatureB ? 1 : -1;
            } else {
                const t = 1 - 1e-3;
                const curvatureAX = halfEdgeA.getDirectionalSegment().subdivided(t)[1].curvatureAt(0);
                const curvatureBX = halfEdgeB.getDirectionalSegment().subdivided(t)[1].curvatureAt(0);
                return curvatureAX < curvatureBX ? 1 : -1;
            }
        }
    }
    // @public
    freeToPool() {
        Vertex.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use Vertex.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Vector2} point - The point where the vertex should be located.
   */ constructor(point){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(point);
    }
};
// @public
Vertex.pool = new Pool(Vertex);
kite.register('Vertex', Vertex);
export default Vertex;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL1ZlcnRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcG9pbnQgaW4gc3BhY2UgdGhhdCBjb25uZWN0cyB0byBlZGdlcy4gSXQgc3RvcmVzIHRoZSBlZGdlcyB0aGF0IGFyZSBjb25uZWN0ZWQgKGRpcmVjdGlvbmFsbHkgYXNcbiAqIGhhbGYtZWRnZXMgc2luY2UgQ3ViaWMgc2VnbWVudHMgY2FuIHN0YXJ0IGFuZCBlbmQgYXQgdGhlIHNhbWUgcG9pbnQvdmVydGV4KSwgYW5kIGNhbiBoYW5kbGUgc29ydGluZyBlZGdlcyBzbyB0aGF0XG4gKiBhIGhhbGYtZWRnZSdzIFwibmV4dFwiIGhhbGYtZWRnZSAoZm9sbG93aW5nIGNvdW50ZXItY2xvY2t3aXNlKSBjYW4gYmUgZGV0ZXJtaW5lZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsga2l0ZSwgTGluZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFJZCA9IDA7XG5cbmNsYXNzIFZlcnRleCB7XG4gIC8qKlxuICAgKiBAcHVibGljIChraXRlLWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBVc2UgVmVydGV4LnBvb2wuY3JlYXRlIGZvciBtb3N0IHVzYWdlIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gVGhlIHBvaW50IHdoZXJlIHRoZSB2ZXJ0ZXggc2hvdWxkIGJlIGxvY2F0ZWQuXG4gICAqL1xuICBjb25zdHJ1Y3RvciggcG9pbnQgKSB7XG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XG5cbiAgICAvLyBOT1RFOiBtb3N0IG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZC9kb2N1bWVudGVkIGluIHRoZSBpbml0aWFsaXplIG1ldGhvZC4gUGxlYXNlIGxvb2sgdGhlcmUgZm9yIG1vc3RcbiAgICAvLyBkZWZpbml0aW9ucy5cbiAgICB0aGlzLmluaXRpYWxpemUoIHBvaW50ICk7XG4gIH1cblxuICAvKipcbiAgICogU2ltaWxhciB0byBhIHVzdWFsIGNvbnN0cnVjdG9yLCBidXQgaXMgc2V0IHVwIHNvIGl0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgKHdpdGggZGlzcG9zZSgpIGluLWJldHdlZW4pIHRvXG4gICAqIHN1cHBvcnQgcG9vbGluZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxuICAgKiBAcmV0dXJucyB7VmVydGV4fSAtIFRoaXMgcmVmZXJlbmNlIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgaW5pdGlhbGl6ZSggcG9pbnQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IyICk7XG5cbiAgICAvLyBAcHVibGljIHtWZWN0b3IyfVxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxIYWxmRWRnZT59IC0gUmVjb3JkcyB0aGUgaGFsZi1lZGdlIHRoYXQgcG9pbnRzIHRvIChlbmRzIGF0KSB0aGlzIHZlcnRleC5cbiAgICB0aGlzLmluY2lkZW50SGFsZkVkZ2VzID0gY2xlYW5BcnJheSggdGhpcy5pbmNpZGVudEhhbGZFZGdlcyApO1xuXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBVc2VkIGZvciBkZXB0aC1maXJzdCBzZWFyY2hcbiAgICB0aGlzLnZpc2l0ZWQgPSBmYWxzZTtcblxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBWaXNpdCBpbmRleCBmb3IgYnJpZGdlIGRldGVjdGlvbiAobW9yZSBlZmZpY2llbnQgdG8gaGF2ZSBpbmxpbmUgaGVyZSlcbiAgICB0aGlzLnZpc2l0SW5kZXggPSAwO1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIExvdyBpbmRleCBmb3IgYnJpZGdlIGRldGVjdGlvbiAobW9yZSBlZmZpY2llbnQgdG8gaGF2ZSBpbmxpbmUgaGVyZSlcbiAgICB0aGlzLmxvd0luZGV4ID0gMDtcblxuICAgIC8vIEBwdWJsaWMgeyp9IC0gQXZhaWxhYmxlIGZvciBhcmJpdHJhcnkgY2xpZW50IHVzYWdlLiAtLSBLZWVwIEpTT05hYmxlXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMgeyp9IC0ga2l0ZS1pbnRlcm5hbFxuICAgIHRoaXMuaW50ZXJuYWxEYXRhID0ge307XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBmb3JtIHRoYXQgY2FuIGJlIHR1cm5lZCBiYWNrIGludG8gYSBzZWdtZW50IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgZGVzZXJpYWxpemUgbWV0aG9kLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdWZXJ0ZXgnLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBwb2ludDogVmVjdG9yMi5WZWN0b3IySU8udG9TdGF0ZU9iamVjdCggdGhpcy5wb2ludCApLFxuICAgICAgaW5jaWRlbnRIYWxmRWRnZXM6IHRoaXMuaW5jaWRlbnRIYWxmRWRnZXMubWFwKCBoYWxmRWRnZSA9PiBoYWxmRWRnZS5pZCApLFxuICAgICAgdmlzaXRlZDogdGhpcy52aXNpdGVkLFxuICAgICAgdmlzaXRJbmRleDogdGhpcy52aXNpdEluZGV4LFxuICAgICAgbG93SW5kZXg6IHRoaXMubG93SW5kZXhcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgcmVmZXJlbmNlcyAoc28gaXQgY2FuIGFsbG93IG90aGVyIG9iamVjdHMgdG8gYmUgR0MnZWQgb3IgcG9vbGVkKSwgYW5kIGZyZWVzIGl0c2VsZiB0byB0aGUgcG9vbCBzbyBpdFxuICAgKiBjYW4gYmUgcmV1c2VkLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMucG9pbnQgPSBWZWN0b3IyLlpFUk87XG4gICAgY2xlYW5BcnJheSggdGhpcy5pbmNpZGVudEhhbGZFZGdlcyApO1xuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNvcnRzIHRoZSBlZGdlcyBpbiBpbmNyZWFzaW5nIGFuZ2xlIG9yZGVyLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBzb3J0RWRnZXMoKSB7XG4gICAgY29uc3QgdmVjdG9ycyA9IFtdOyAvLyB4IGNvb3JkaW5hdGUgd2lsbCBiZSBcImFuZ2xlXCIsIHkgY29vcmRpbmF0ZSB3aWxsIGJlIGN1cnZhdHVyZVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaW5jaWRlbnRIYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBoYWxmRWRnZSA9IHRoaXMuaW5jaWRlbnRIYWxmRWRnZXNbIGkgXTtcbiAgICAgIC8vIE5PVEU6IElmIGl0IGlzIGV4cGVuc2l2ZSB0byBwcmVjb21wdXRlIGN1cnZhdHVyZSwgd2UgY291bGQgc2F2ZSBpdCB1bnRpbCBlZGdlQ29tcGFyaXNvbiBuZWVkcyBpdC5cbiAgICAgIHZlY3RvcnMucHVzaCggaGFsZkVkZ2Uuc29ydFZlY3Rvci5zZXRYWSggaGFsZkVkZ2UuZ2V0RW5kVGFuZ2VudCgpLmFuZ2xlLCBoYWxmRWRnZS5nZXRFbmRDdXJ2YXR1cmUoKSApICk7XG4gICAgfVxuXG4gICAgLy8gXCJSb3RhdGVcIiB0aGUgYW5nbGVzIHVudGlsIHdlIGFyZSBzdXJlIHRoYXQgb3VyIFwiY3V0XCIgKHdoZXJlIC1waSBnb2VzIHRvIHBpIGFyb3VuZCB0aGUgY2lyY2xlKSBpcyBhdCBhIHBsYWNlXG4gICAgLy8gbm90IG5lYXIgYW55IGFuZ2xlLiBUaGlzIHNob3VsZCBwcmV2ZW50IGFtYmlndWl0eSBpbiBzb3J0aW5nICh3aGljaCBjYW4gbGVhZCB0byBidWdzIGluIHRoZSBvcmRlcilcbiAgICBjb25zdCBjdXRvZmYgPSAtTWF0aC5QSSArIDFlLTQ7XG4gICAgbGV0IGF0Q3V0QW5nbGUgPSBmYWxzZTtcbiAgICB3aGlsZSAoICFhdEN1dEFuZ2xlICkge1xuICAgICAgYXRDdXRBbmdsZSA9IHRydWU7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZWN0b3JzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiAoIHZlY3RvcnNbIGkgXS54IDwgY3V0b2ZmICkge1xuICAgICAgICAgIGF0Q3V0QW5nbGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCAhYXRDdXRBbmdsZSApIHtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVjdG9ycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCB2ZWN0b3IgPSB2ZWN0b3JzWyBpIF07XG4gICAgICAgICAgdmVjdG9yLnggLT0gMS42MjU5NDAyNDUxNjsgLy8gRGVmaW5pdGVseSBub3QgY2hvb3NpbmcgcmFuZG9tIGRpZ2l0cyBieSB0eXBpbmchIChzaG91bGRuJ3QgbWF0dGVyKVxuICAgICAgICAgIGlmICggdmVjdG9yLnggPCAtTWF0aC5QSSAtIDFlLTQgKSB7XG4gICAgICAgICAgICB2ZWN0b3IueCArPSBNYXRoLlBJICogMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmluY2lkZW50SGFsZkVkZ2VzLnNvcnQoIFZlcnRleC5lZGdlQ29tcGFyaXNvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXBhcmUgdHdvIGVkZ2VzIGZvciBzb3J0RWRnZXMuIFNob3VsZCBoYXZlIGV4ZWN1dGVkIHRoYXQgZmlyc3QsIGFzIGl0IHJlbGllcyBvbiBpbmZvcm1hdGlvbiBsb29rZWQgdXAgaW4gdGhhdFxuICAgKiBwcm9jZXNzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gaGFsZkVkZ2VBXG4gICAqIEBwYXJhbSB7RWRnZX0gaGFsZkVkZ2VCXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBzdGF0aWMgZWRnZUNvbXBhcmlzb24oIGhhbGZFZGdlQSwgaGFsZkVkZ2VCICkge1xuICAgIGNvbnN0IGFuZ2xlQSA9IGhhbGZFZGdlQS5zb3J0VmVjdG9yLng7XG4gICAgY29uc3QgYW5nbGVCID0gaGFsZkVkZ2VCLnNvcnRWZWN0b3IueDtcblxuICAgIC8vIERvbid0IGFsbG93IGFuZ2xlQT0tcGksIGFuZ2xlQj1waSAodGhleSBhcmUgZXF1aXZhbGVudClcbiAgICAvLyBJZiBvdXIgYW5nbGUgaXMgdmVyeSBzbWFsbCwgd2UgbmVlZCB0byBhY2NlcHQgaXQgc3RpbGwgaWYgd2UgaGF2ZSB0d28gbGluZXMgKHNpbmNlIHRoZXkgd2lsbCBoYXZlIHRoZSBzYW1lXG4gICAgLy8gY3VydmF0dXJlKS5cbiAgICBpZiAoIE1hdGguYWJzKCBhbmdsZUEgLSBhbmdsZUIgKSA+IDFlLTUgfHxcbiAgICAgICAgICggYW5nbGVBICE9PSBhbmdsZUIgJiYgKCBoYWxmRWRnZUEuZWRnZS5zZWdtZW50IGluc3RhbmNlb2YgTGluZSApICYmICggaGFsZkVkZ2VCLmVkZ2Uuc2VnbWVudCBpbnN0YW5jZW9mIExpbmUgKSApICkge1xuICAgICAgcmV0dXJuIGFuZ2xlQSA8IGFuZ2xlQiA/IC0xIDogMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjdXJ2YXR1cmVBID0gaGFsZkVkZ2VBLnNvcnRWZWN0b3IueTtcbiAgICAgIGNvbnN0IGN1cnZhdHVyZUIgPSBoYWxmRWRnZUIuc29ydFZlY3Rvci55O1xuICAgICAgaWYgKCBNYXRoLmFicyggY3VydmF0dXJlQSAtIGN1cnZhdHVyZUIgKSA+IDFlLTUgKSB7XG4gICAgICAgIHJldHVybiBjdXJ2YXR1cmVBIDwgY3VydmF0dXJlQiA/IDEgOiAtMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCB0ID0gMSAtIDFlLTM7XG4gICAgICAgIGNvbnN0IGN1cnZhdHVyZUFYID0gaGFsZkVkZ2VBLmdldERpcmVjdGlvbmFsU2VnbWVudCgpLnN1YmRpdmlkZWQoIHQgKVsgMSBdLmN1cnZhdHVyZUF0KCAwICk7XG4gICAgICAgIGNvbnN0IGN1cnZhdHVyZUJYID0gaGFsZkVkZ2VCLmdldERpcmVjdGlvbmFsU2VnbWVudCgpLnN1YmRpdmlkZWQoIHQgKVsgMSBdLmN1cnZhdHVyZUF0KCAwICk7XG4gICAgICAgIHJldHVybiBjdXJ2YXR1cmVBWCA8IGN1cnZhdHVyZUJYID8gMSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEBwdWJsaWNcbiAgZnJlZVRvUG9vbCgpIHtcbiAgICBWZXJ0ZXgucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICAvLyBAcHVibGljXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIFZlcnRleCApO1xufVxuXG5raXRlLnJlZ2lzdGVyKCAnVmVydGV4JywgVmVydGV4ICk7XG5cbmV4cG9ydCBkZWZhdWx0IFZlcnRleDsiXSwibmFtZXMiOlsiVmVjdG9yMiIsImNsZWFuQXJyYXkiLCJQb29sIiwia2l0ZSIsIkxpbmUiLCJnbG9iYUlkIiwiVmVydGV4IiwiaW5pdGlhbGl6ZSIsInBvaW50IiwiYXNzZXJ0IiwiaW5jaWRlbnRIYWxmRWRnZXMiLCJ2aXNpdGVkIiwidmlzaXRJbmRleCIsImxvd0luZGV4IiwiZGF0YSIsImludGVybmFsRGF0YSIsInNlcmlhbGl6ZSIsInR5cGUiLCJpZCIsIlZlY3RvcjJJTyIsInRvU3RhdGVPYmplY3QiLCJtYXAiLCJoYWxmRWRnZSIsImRpc3Bvc2UiLCJaRVJPIiwiZnJlZVRvUG9vbCIsInNvcnRFZGdlcyIsInZlY3RvcnMiLCJpIiwibGVuZ3RoIiwicHVzaCIsInNvcnRWZWN0b3IiLCJzZXRYWSIsImdldEVuZFRhbmdlbnQiLCJhbmdsZSIsImdldEVuZEN1cnZhdHVyZSIsImN1dG9mZiIsIk1hdGgiLCJQSSIsImF0Q3V0QW5nbGUiLCJ4IiwidmVjdG9yIiwic29ydCIsImVkZ2VDb21wYXJpc29uIiwiaGFsZkVkZ2VBIiwiaGFsZkVkZ2VCIiwiYW5nbGVBIiwiYW5nbGVCIiwiYWJzIiwiZWRnZSIsInNlZ21lbnQiLCJjdXJ2YXR1cmVBIiwieSIsImN1cnZhdHVyZUIiLCJ0IiwiY3VydmF0dXJlQVgiLCJnZXREaXJlY3Rpb25hbFNlZ21lbnQiLCJzdWJkaXZpZGVkIiwiY3VydmF0dXJlQXQiLCJjdXJ2YXR1cmVCWCIsInBvb2wiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxVQUFVLGdDQUFnQztBQUNqRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxnQkFBZ0I7QUFFM0MsSUFBSUMsVUFBVTtBQUVkLElBQUEsQUFBTUMsU0FBTixNQUFNQTtJQWlCSjs7Ozs7OztHQU9DLEdBQ0RDLFdBQVlDLEtBQUssRUFBRztRQUNsQkMsVUFBVUEsT0FBUUQsaUJBQWlCUjtRQUVuQyxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDUSxLQUFLLEdBQUdBO1FBRWIsMkZBQTJGO1FBQzNGLElBQUksQ0FBQ0UsaUJBQWlCLEdBQUdULFdBQVksSUFBSSxDQUFDUyxpQkFBaUI7UUFFM0Qsa0RBQWtEO1FBQ2xELElBQUksQ0FBQ0MsT0FB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