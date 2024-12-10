// Copyright 2017-2023, University of Colorado Boulder
/**
 * Represents a segment in the graph (connects to vertices on both ends)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../phet-core/js/Pool.js';
import { HalfEdge, kite, Line, Segment, Vertex } from '../imports.js';
let globaId = 0;
let Edge = class Edge {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Segment} segment
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @returns {Edge} - This reference for chaining
   */ initialize(segment, startVertex, endVertex) {
        assert && assert(segment instanceof Segment);
        assert && assert(startVertex instanceof Vertex);
        assert && assert(endVertex instanceof Vertex);
        assert && assert(segment.start.distance(startVertex.point) < 1e-3);
        assert && assert(segment.end.distance(endVertex.point) < 1e-3);
        // @public {Segment|null} - Null when disposed (in pool)
        this.segment = segment;
        // @public {Vertex|null} - Null when disposed (in pool)
        this.startVertex = startVertex;
        this.endVertex = endVertex;
        // @public {number}
        this.signedAreaFragment = segment.getSignedAreaFragment();
        // @public {HalfEdge|null} - Null when disposed (in pool)
        this.forwardHalf = HalfEdge.pool.create(this, false);
        this.reversedHalf = HalfEdge.pool.create(this, true);
        // @public {boolean} - Used for depth-first search
        this.visited = false;
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
            type: 'Edge',
            id: this.id,
            segment: this.segment.serialize(),
            startVertex: this.startVertex === null ? null : this.startVertex.id,
            endVertex: this.endVertex === null ? null : this.endVertex.id,
            signedAreaFragment: this.signedAreaFragment,
            forwardHalf: this.forwardHalf.serialize(),
            reversedHalf: this.reversedHalf.serialize(),
            visited: this.visited,
            data: this.data
        };
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        this.segment = null;
        this.startVertex = null;
        this.endVertex = null;
        this.forwardHalf.dispose();
        this.reversedHalf.dispose();
        this.forwardHalf = null;
        this.reversedHalf = null;
        this.data = null;
        this.freeToPool();
    }
    /**
   * Returns the other vertex associated with an edge.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */ getOtherVertex(vertex) {
        assert && assert(vertex === this.startVertex || vertex === this.endVertex);
        return this.startVertex === vertex ? this.endVertex : this.startVertex;
    }
    /**
   * Update possibly reversed vertex references (since they may be updated)
   * @public
   */ updateReferences() {
        this.forwardHalf.updateReferences();
        this.reversedHalf.updateReferences();
        assert && assert(!(this.segment instanceof Line) || this.startVertex !== this.endVertex, 'No line segments for same vertices');
    }
    // @public
    freeToPool() {
        Edge.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use Edge.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Segment} segment
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   */ constructor(segment, startVertex, endVertex){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(segment, startVertex, endVertex);
    }
};
// @public
Edge.pool = new Pool(Edge);
kite.register('Edge', Edge);
export default Edge;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0VkZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNlZ21lbnQgaW4gdGhlIGdyYXBoIChjb25uZWN0cyB0byB2ZXJ0aWNlcyBvbiBib3RoIGVuZHMpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IEhhbGZFZGdlLCBraXRlLCBMaW5lLCBTZWdtZW50LCBWZXJ0ZXggfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxubGV0IGdsb2JhSWQgPSAwO1xuXG5jbGFzcyBFZGdlIHtcbiAgLyoqXG4gICAqIEBwdWJsaWMgKGtpdGUtaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFVzZSBFZGdlLnBvb2wuY3JlYXRlIGZvciBtb3N0IHVzYWdlIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0ge1NlZ21lbnR9IHNlZ21lbnRcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHN0YXJ0VmVydGV4XG4gICAqIEBwYXJhbSB7VmVydGV4fSBlbmRWZXJ0ZXhcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBzZWdtZW50LCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICkge1xuICAgIC8vIEBwdWJsaWMge251bWJlcn1cbiAgICB0aGlzLmlkID0gKytnbG9iYUlkO1xuXG4gICAgLy8gTk9URTogbW9zdCBvYmplY3QgcHJvcGVydGllcyBhcmUgZGVjbGFyZWQvZG9jdW1lbnRlZCBpbiB0aGUgaW5pdGlhbGl6ZSBtZXRob2QuIFBsZWFzZSBsb29rIHRoZXJlIGZvciBtb3N0XG4gICAgLy8gZGVmaW5pdGlvbnMuXG4gICAgdGhpcy5pbml0aWFsaXplKCBzZWdtZW50LCBzdGFydFZlcnRleCwgZW5kVmVydGV4ICk7XG4gIH1cblxuICAvKipcbiAgICogU2ltaWxhciB0byBhIHVzdWFsIGNvbnN0cnVjdG9yLCBidXQgaXMgc2V0IHVwIHNvIGl0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgKHdpdGggZGlzcG9zZSgpIGluLWJldHdlZW4pIHRvXG4gICAqIHN1cHBvcnQgcG9vbGluZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTZWdtZW50fSBzZWdtZW50XG4gICAqIEBwYXJhbSB7VmVydGV4fSBzdGFydFZlcnRleFxuICAgKiBAcGFyYW0ge1ZlcnRleH0gZW5kVmVydGV4XG4gICAqIEByZXR1cm5zIHtFZGdlfSAtIFRoaXMgcmVmZXJlbmNlIGZvciBjaGFpbmluZ1xuICAgKi9cbiAgaW5pdGlhbGl6ZSggc2VnbWVudCwgc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50IGluc3RhbmNlb2YgU2VnbWVudCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0VmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZW5kVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2VnbWVudC5zdGFydC5kaXN0YW5jZSggc3RhcnRWZXJ0ZXgucG9pbnQgKSA8IDFlLTMgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50LmVuZC5kaXN0YW5jZSggZW5kVmVydGV4LnBvaW50ICkgPCAxZS0zICk7XG5cbiAgICAvLyBAcHVibGljIHtTZWdtZW50fG51bGx9IC0gTnVsbCB3aGVuIGRpc3Bvc2VkIChpbiBwb29sKVxuICAgIHRoaXMuc2VnbWVudCA9IHNlZ21lbnQ7XG5cbiAgICAvLyBAcHVibGljIHtWZXJ0ZXh8bnVsbH0gLSBOdWxsIHdoZW4gZGlzcG9zZWQgKGluIHBvb2wpXG4gICAgdGhpcy5zdGFydFZlcnRleCA9IHN0YXJ0VmVydGV4O1xuICAgIHRoaXMuZW5kVmVydGV4ID0gZW5kVmVydGV4O1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuc2lnbmVkQXJlYUZyYWdtZW50ID0gc2VnbWVudC5nZXRTaWduZWRBcmVhRnJhZ21lbnQoKTtcblxuICAgIC8vIEBwdWJsaWMge0hhbGZFZGdlfG51bGx9IC0gTnVsbCB3aGVuIGRpc3Bvc2VkIChpbiBwb29sKVxuICAgIHRoaXMuZm9yd2FyZEhhbGYgPSBIYWxmRWRnZS5wb29sLmNyZWF0ZSggdGhpcywgZmFsc2UgKTtcbiAgICB0aGlzLnJldmVyc2VkSGFsZiA9IEhhbGZFZGdlLnBvb2wuY3JlYXRlKCB0aGlzLCB0cnVlICk7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFVzZWQgZm9yIGRlcHRoLWZpcnN0IHNlYXJjaFxuICAgIHRoaXMudmlzaXRlZCA9IGZhbHNlO1xuXG4gICAgLy8gQHB1YmxpYyB7Kn0gLSBBdmFpbGFibGUgZm9yIGFyYml0cmFyeSBjbGllbnQgdXNhZ2UuIC0tIEtlZXAgSlNPTmFibGVcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7Kn0gLSBraXRlLWludGVybmFsXG4gICAgdGhpcy5pbnRlcm5hbERhdGEgPSB7XG5cbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnRWRnZScsXG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIHNlZ21lbnQ6IHRoaXMuc2VnbWVudC5zZXJpYWxpemUoKSxcbiAgICAgIHN0YXJ0VmVydGV4OiB0aGlzLnN0YXJ0VmVydGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuc3RhcnRWZXJ0ZXguaWQsXG4gICAgICBlbmRWZXJ0ZXg6IHRoaXMuZW5kVmVydGV4ID09PSBudWxsID8gbnVsbCA6IHRoaXMuZW5kVmVydGV4LmlkLFxuICAgICAgc2lnbmVkQXJlYUZyYWdtZW50OiB0aGlzLnNpZ25lZEFyZWFGcmFnbWVudCxcbiAgICAgIGZvcndhcmRIYWxmOiB0aGlzLmZvcndhcmRIYWxmLnNlcmlhbGl6ZSgpLFxuICAgICAgcmV2ZXJzZWRIYWxmOiB0aGlzLnJldmVyc2VkSGFsZi5zZXJpYWxpemUoKSxcbiAgICAgIHZpc2l0ZWQ6IHRoaXMudmlzaXRlZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyByZWZlcmVuY2VzIChzbyBpdCBjYW4gYWxsb3cgb3RoZXIgb2JqZWN0cyB0byBiZSBHQydlZCBvciBwb29sZWQpLCBhbmQgZnJlZXMgaXRzZWxmIHRvIHRoZSBwb29sIHNvIGl0XG4gICAqIGNhbiBiZSByZXVzZWQuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zZWdtZW50ID0gbnVsbDtcbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gbnVsbDtcbiAgICB0aGlzLmVuZFZlcnRleCA9IG51bGw7XG5cbiAgICB0aGlzLmZvcndhcmRIYWxmLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnJldmVyc2VkSGFsZi5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLmZvcndhcmRIYWxmID0gbnVsbDtcbiAgICB0aGlzLnJldmVyc2VkSGFsZiA9IG51bGw7XG5cbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3RoZXIgdmVydGV4IGFzc29jaWF0ZWQgd2l0aCBhbiBlZGdlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVydGV4fSB2ZXJ0ZXhcbiAgICogQHJldHVybnMge1ZlcnRleH1cbiAgICovXG4gIGdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4ID09PSB0aGlzLnN0YXJ0VmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5lbmRWZXJ0ZXggKTtcblxuICAgIHJldHVybiB0aGlzLnN0YXJ0VmVydGV4ID09PSB2ZXJ0ZXggPyB0aGlzLmVuZFZlcnRleCA6IHRoaXMuc3RhcnRWZXJ0ZXg7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHBvc3NpYmx5IHJldmVyc2VkIHZlcnRleCByZWZlcmVuY2VzIChzaW5jZSB0aGV5IG1heSBiZSB1cGRhdGVkKVxuICAgKiBAcHVibGljXG4gICAqL1xuICB1cGRhdGVSZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuZm9yd2FyZEhhbGYudXBkYXRlUmVmZXJlbmNlcygpO1xuICAgIHRoaXMucmV2ZXJzZWRIYWxmLnVwZGF0ZVJlZmVyZW5jZXMoKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIHRoaXMuc2VnbWVudCBpbnN0YW5jZW9mIExpbmUgKSB8fCB0aGlzLnN0YXJ0VmVydGV4ICE9PSB0aGlzLmVuZFZlcnRleCxcbiAgICAgICdObyBsaW5lIHNlZ21lbnRzIGZvciBzYW1lIHZlcnRpY2VzJyApO1xuICB9XG5cbiAgLy8gQHB1YmxpY1xuICBmcmVlVG9Qb29sKCkge1xuICAgIEVkZ2UucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICAvLyBAcHVibGljXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIEVkZ2UgKTtcbn1cblxua2l0ZS5yZWdpc3RlciggJ0VkZ2UnLCBFZGdlICk7XG5cbmV4cG9ydCBkZWZhdWx0IEVkZ2U7Il0sIm5hbWVzIjpbIlBvb2wiLCJIYWxmRWRnZSIsImtpdGUiLCJMaW5lIiwiU2VnbWVudCIsIlZlcnRleCIsImdsb2JhSWQiLCJFZGdlIiwiaW5pdGlhbGl6ZSIsInNlZ21lbnQiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsImFzc2VydCIsInN0YXJ0IiwiZGlzdGFuY2UiLCJwb2ludCIsImVuZCIsInNpZ25lZEFyZWFGcmFnbWVudCIsImdldFNpZ25lZEFyZWFGcmFnbWVudCIsImZvcndhcmRIYWxmIiwicG9vbCIsImNyZWF0ZSIsInJldmVyc2VkSGFsZiIsInZpc2l0ZWQiLCJkYXRhIiwiaW50ZXJuYWxEYXRhIiwic2VyaWFsaXplIiwidHlwZSIsImlkIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJnZXRPdGhlclZlcnRleCIsInZlcnRleCIsInVwZGF0ZVJlZmVyZW5jZXMiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFVBQVUsZ0NBQWdDO0FBQ2pELFNBQVNDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsTUFBTSxRQUFRLGdCQUFnQjtBQUV0RSxJQUFJQyxVQUFVO0FBRWQsSUFBQSxBQUFNQyxPQUFOLE1BQU1BO0lBbUJKOzs7Ozs7Ozs7R0FTQyxHQUNEQyxXQUFZQyxPQUFPLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFHO1FBQzVDQyxVQUFVQSxPQUFRSCxtQkFBbUJMO1FBQ3JDUSxVQUFVQSxPQUFRRix1QkFBdUJMO1FBQ3pDTyxVQUFVQSxPQUFRRCxxQkFBcUJOO1FBQ3ZDTyxVQUFVQSxPQUFRSCxRQUFRSSxLQUFLLENBQUNDLFFBQVEsQ0FBRUosWUFBWUssS0FBSyxJQUFLO1FBQ2hFSCxVQUFVQSxPQUFRSCxRQUFRTyxHQUFHLENBQUNGLFFBQVEsQ0FBRUgsVUFBVUksS0FBSyxJQUFLO1FBRTVELHdEQUF3RDtRQUN4RCxJQUFJLENBQUNOLE9BQU8sR0FBR0E7UUFFZix1REFBdUQ7UUFDdkQsSUFBSSxDQUFD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