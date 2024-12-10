// Copyright 2017-2023, University of Colorado Boulder
/**
 * A directed set of half-edges determined by how the original shapes/subpaths were directionally. This is distinct from
 * boundaries, as:
 * 1. Input shapes/subpaths can self-intersect, ignore clockwise restrictions, and avoid boundary restrictions.
 * 2. Input shapes/subpaths can repeat over the same edges multiple times (affecting winding order), and can even
 *    double-back or do other operations.
 * 3. We need to record separate shape IDs for the different loops, so we can perform CAG operations on separate ones.
 *    This means we need to track winding order separately for each ID.
 *
 * As operations simplify/remove/replace edges, it will handle replacement of the edges in the loops.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite, Subpath } from '../imports.js';
let globaId = 0;
let Loop = class Loop {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {number} shapeId
   * @param {boolean} closed
   * @returns {Loop} - This reference for chaining
   */ initialize(shapeId, closed) {
        assert && assert(typeof shapeId === 'number');
        assert && assert(typeof closed === 'boolean');
        // @public {number}
        this.shapeId = shapeId;
        // @public {boolean}
        this.closed = closed;
        // @public {Array.<HalfEdge>}
        this.halfEdges = cleanArray(this.halfEdges);
        return this;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'Loop',
            id: this.id,
            shapeId: this.shapeId,
            closed: this.closed,
            halfEdges: this.halfEdges.map((halfEdge)=>halfEdge.id)
        };
    }
    /**
   * Returns a Subpath equivalent to this loop.
   * @public
   *
   * @returns {Subpath}
   */ toSubpath() {
        const segments = [];
        for(let i = 0; i < this.halfEdges.length; i++){
            segments.push(this.halfEdges[i].getDirectionalSegment());
        }
        return new Subpath(segments, undefined, this.closed);
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        cleanArray(this.halfEdges);
        this.freeToPool();
    }
    // @public
    freeToPool() {
        Loop.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use Loop.pool.create for most usage instead of using the constructor directly.
   *
   * @param {number} shapeId
   * @param {boolean} closed
   */ constructor(shapeId, closed){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(shapeId, closed);
    }
};
// @public
Loop.pool = new Pool(Loop);
kite.register('Loop', Loop);
export default Loop;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0xvb3AuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBkaXJlY3RlZCBzZXQgb2YgaGFsZi1lZGdlcyBkZXRlcm1pbmVkIGJ5IGhvdyB0aGUgb3JpZ2luYWwgc2hhcGVzL3N1YnBhdGhzIHdlcmUgZGlyZWN0aW9uYWxseS4gVGhpcyBpcyBkaXN0aW5jdCBmcm9tXG4gKiBib3VuZGFyaWVzLCBhczpcbiAqIDEuIElucHV0IHNoYXBlcy9zdWJwYXRocyBjYW4gc2VsZi1pbnRlcnNlY3QsIGlnbm9yZSBjbG9ja3dpc2UgcmVzdHJpY3Rpb25zLCBhbmQgYXZvaWQgYm91bmRhcnkgcmVzdHJpY3Rpb25zLlxuICogMi4gSW5wdXQgc2hhcGVzL3N1YnBhdGhzIGNhbiByZXBlYXQgb3ZlciB0aGUgc2FtZSBlZGdlcyBtdWx0aXBsZSB0aW1lcyAoYWZmZWN0aW5nIHdpbmRpbmcgb3JkZXIpLCBhbmQgY2FuIGV2ZW5cbiAqICAgIGRvdWJsZS1iYWNrIG9yIGRvIG90aGVyIG9wZXJhdGlvbnMuXG4gKiAzLiBXZSBuZWVkIHRvIHJlY29yZCBzZXBhcmF0ZSBzaGFwZSBJRHMgZm9yIHRoZSBkaWZmZXJlbnQgbG9vcHMsIHNvIHdlIGNhbiBwZXJmb3JtIENBRyBvcGVyYXRpb25zIG9uIHNlcGFyYXRlIG9uZXMuXG4gKiAgICBUaGlzIG1lYW5zIHdlIG5lZWQgdG8gdHJhY2sgd2luZGluZyBvcmRlciBzZXBhcmF0ZWx5IGZvciBlYWNoIElELlxuICpcbiAqIEFzIG9wZXJhdGlvbnMgc2ltcGxpZnkvcmVtb3ZlL3JlcGxhY2UgZWRnZXMsIGl0IHdpbGwgaGFuZGxlIHJlcGxhY2VtZW50IG9mIHRoZSBlZGdlcyBpbiB0aGUgbG9vcHMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IGtpdGUsIFN1YnBhdGggfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxubGV0IGdsb2JhSWQgPSAwO1xuXG5jbGFzcyBMb29wIHtcbiAgLyoqXG4gICAqIEBwdWJsaWMgKGtpdGUtaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFVzZSBMb29wLnBvb2wuY3JlYXRlIGZvciBtb3N0IHVzYWdlIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNvbnN0cnVjdG9yIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2hhcGVJZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNsb3NlZFxuICAgKi9cbiAgY29uc3RydWN0b3IoIHNoYXBlSWQsIGNsb3NlZCApIHtcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XG4gICAgdGhpcy5pZCA9ICsrZ2xvYmFJZDtcblxuICAgIC8vIE5PVEU6IG1vc3Qgb2JqZWN0IHByb3BlcnRpZXMgYXJlIGRlY2xhcmVkL2RvY3VtZW50ZWQgaW4gdGhlIGluaXRpYWxpemUgbWV0aG9kLiBQbGVhc2UgbG9vayB0aGVyZSBmb3IgbW9zdFxuICAgIC8vIGRlZmluaXRpb25zLlxuICAgIHRoaXMuaW5pdGlhbGl6ZSggc2hhcGVJZCwgY2xvc2VkICk7XG4gIH1cblxuICAvKipcbiAgICogU2ltaWxhciB0byBhIHVzdWFsIGNvbnN0cnVjdG9yLCBidXQgaXMgc2V0IHVwIHNvIGl0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgKHdpdGggZGlzcG9zZSgpIGluLWJldHdlZW4pIHRvXG4gICAqIHN1cHBvcnQgcG9vbGluZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNoYXBlSWRcbiAgICogQHBhcmFtIHtib29sZWFufSBjbG9zZWRcbiAgICogQHJldHVybnMge0xvb3B9IC0gVGhpcyByZWZlcmVuY2UgZm9yIGNoYWluaW5nXG4gICAqL1xuICBpbml0aWFsaXplKCBzaGFwZUlkLCBjbG9zZWQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHNoYXBlSWQgPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGNsb3NlZCA9PT0gJ2Jvb2xlYW4nICk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XG4gICAgdGhpcy5zaGFwZUlkID0gc2hhcGVJZDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XG4gICAgdGhpcy5jbG9zZWQgPSBjbG9zZWQ7XG5cbiAgICAvLyBAcHVibGljIHtBcnJheS48SGFsZkVkZ2U+fVxuICAgIHRoaXMuaGFsZkVkZ2VzID0gY2xlYW5BcnJheSggdGhpcy5oYWxmRWRnZXMgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGZvcm0gdGhhdCBjYW4gYmUgdHVybmVkIGJhY2sgaW50byBhIHNlZ21lbnQgd2l0aCB0aGUgY29ycmVzcG9uZGluZyBkZXNlcmlhbGl6ZSBtZXRob2QuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0xvb3AnLFxuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBzaGFwZUlkOiB0aGlzLnNoYXBlSWQsXG4gICAgICBjbG9zZWQ6IHRoaXMuY2xvc2VkLFxuICAgICAgaGFsZkVkZ2VzOiB0aGlzLmhhbGZFZGdlcy5tYXAoIGhhbGZFZGdlID0+IGhhbGZFZGdlLmlkIClcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTdWJwYXRoIGVxdWl2YWxlbnQgdG8gdGhpcyBsb29wLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtTdWJwYXRofVxuICAgKi9cbiAgdG9TdWJwYXRoKCkge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5oYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBzZWdtZW50cy5wdXNoKCB0aGlzLmhhbGZFZGdlc1sgaSBdLmdldERpcmVjdGlvbmFsU2VnbWVudCgpICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3VicGF0aCggc2VnbWVudHMsIHVuZGVmaW5lZCwgdGhpcy5jbG9zZWQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHJlZmVyZW5jZXMgKHNvIGl0IGNhbiBhbGxvdyBvdGhlciBvYmplY3RzIHRvIGJlIEdDJ2VkIG9yIHBvb2xlZCksIGFuZCBmcmVlcyBpdHNlbGYgdG8gdGhlIHBvb2wgc28gaXRcbiAgICogY2FuIGJlIHJldXNlZC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBjbGVhbkFycmF5KCB0aGlzLmhhbGZFZGdlcyApO1xuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuICB9XG5cbiAgLy8gQHB1YmxpY1xuICBmcmVlVG9Qb29sKCkge1xuICAgIExvb3AucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICAvLyBAcHVibGljXG4gIHN0YXRpYyBwb29sID0gbmV3IFBvb2woIExvb3AgKTtcbn1cblxua2l0ZS5yZWdpc3RlciggJ0xvb3AnLCBMb29wICk7XG5cbmV4cG9ydCBkZWZhdWx0IExvb3A7Il0sIm5hbWVzIjpbImNsZWFuQXJyYXkiLCJQb29sIiwia2l0ZSIsIlN1YnBhdGgiLCJnbG9iYUlkIiwiTG9vcCIsImluaXRpYWxpemUiLCJzaGFwZUlkIiwiY2xvc2VkIiwiYXNzZXJ0IiwiaGFsZkVkZ2VzIiwic2VyaWFsaXplIiwidHlwZSIsImlkIiwibWFwIiwiaGFsZkVkZ2UiLCJ0b1N1YnBhdGgiLCJzZWdtZW50cyIsImkiLCJsZW5ndGgiLCJwdXNoIiwiZ2V0RGlyZWN0aW9uYWxTZWdtZW50IiwidW5kZWZpbmVkIiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJwb29sIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUVELE9BQU9BLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsVUFBVSxnQ0FBZ0M7QUFDakQsU0FBU0MsSUFBSSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRTlDLElBQUlDLFVBQVU7QUFFZCxJQUFBLEFBQU1DLE9BQU4sTUFBTUE7SUFrQko7Ozs7Ozs7O0dBUUMsR0FDREMsV0FBWUMsT0FBTyxFQUFFQyxNQUFNLEVBQUc7UUFDNUJDLFVBQVVBLE9BQVEsT0FBT0YsWUFBWTtRQUNyQ0UsVUFBVUEsT0FBUSxPQUFPRCxXQUFXO1FBRXBDLG1CQUFtQjtRQUNuQixJQUFJLENBQUNELE9BQU8sR0FBR0E7UUFFZixvQkFBb0I7UUFDcEIsSUFBSSxDQUFDQyxNQUFNLEdBQUdBO1FBRWQsNkJBQTZCO1FBQzdCLElBQUksQ0FBQ0UsU0FBUyxHQUFHVixXQUFZLElBQUksQ0FBQ1UsU0FBUztRQUUzQyxPQUFPLElBQUk7SUFDYjtJQUVBOzs7OztHQUtDLEdBQ0RDLFlBQVk7UUFDVixPQUFPO1lBQ0xDLE1BQU07WUFDTkMsSUFBSSxJQUFJLENBQUNBLEVBQUU7WUFDWE4sU0FBUyxJQUFJLENBQUNBLE9BQU87WUFDckJDLFFBQVEsSUFBSSxDQUFDQSxNQUFNO1lBQ25CRSxXQUFXLElBQUksQ0FBQ0EsU0FBUyxDQUFDSSxHQUFHLENBQUVDLENBQUFBLFdBQVlBLFNBQVNGLEVBQUU7UUFDeEQ7SUFDRjtJQUVBOzs7OztHQUtDLEdBQ0RHLFlBQVk7UUFDVixNQUFNQyxXQUFXLEVBQUU7UUFDbkIsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUksSUFBSSxDQUFDUixTQUFTLENBQUNTLE1BQU0sRUFBRUQsSUFBTTtZQUNoREQsU0FBU0csSUFBSSxDQUFFLElBQUksQ0FBQ1YsU0FBUyxDQUFFUSxFQUFHLENBQUNHLHFCQUFxQjtRQUMxRDtRQUNBLE9BQU8sSUFBSWxCLFFBQVNjLFVBQVVLLFdBQVcsSUFBSSxDQUFDZCxNQUFNO0lBQ3REO0lBRUE7Ozs7R0FJQyxHQUNEZSxVQUFVO1FBQ1J2QixXQUFZLElBQUksQ0FBQ1UsU0FBUztRQUMxQixJQUFJLENBQUNjLFVBQVU7SUFDakI7SUFFQSxVQUFVO0lBQ1ZBLGFBQWE7UUFDWG5CLEtBQUtvQixJQUFJLENBQUNELFVBQVUsQ0FBRSxJQUFJO0lBQzVCO0lBckZBOzs7Ozs7O0dBT0MsR0FDREUsWUFBYW5CLE9BQU8sRUFBRUMsTUFBTSxDQUFHO1FBQzdCLG1CQUFtQjtRQUNuQixJQUFJLENBQUNLLEVBQUUsR0FBRyxFQUFFVDtRQUVaLDRHQUE0RztRQUM1RyxlQUFlO1FBQ2YsSUFBSSxDQUFDRSxVQUFVLENBQUVDLFNBQVNDO0lBQzVCO0FBMEVGO0FBRkUsVUFBVTtBQXhGTkgsS0F5RkdvQixPQUFPLElBQUl4QixLQUFNSTtBQUcxQkgsS0FBS3lCLFFBQVEsQ0FBRSxRQUFRdEI7QUFFdkIsZUFBZUEsS0FBSyJ9