// Copyright 2017-2023, University of Colorado Boulder
/**
 * A face is usually contained by an ("inner") boundary of edges, and zero or more ("outer") boundary holes on the inside.
 * The naming is somewhat counterintuitive here, because the "inner" boundaries are on the inside of the edges
 * (towards our face), and the "outer" hole boundaries are on the outer half-edges of the holes.
 *
 * There is normally one "unbounded" face without a normal boundary, whose "area" expands to infinity, and contains the
 * everything on the exterior of all of the edges.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globaId = 0;
let Face = class Face {
    /**
   * Similar to a usual constructor, but is set up so it can be called multiple times (with dispose() in-between) to
   * support pooling.
   * @private
   *
   * @param {Boundary} boundary
   * @returns {Face} - This reference for chaining
   */ initialize(boundary) {
        assert && assert(boundary === null || boundary.isInner());
        // @public {Boundary|null} - "inner" types, null when disposed (in pool)
        this.boundary = boundary;
        // @public {Array.<Boundary>} - "outer" types
        this.holes = cleanArray(this.holes);
        // @public {Object|null} - If non-null, it's a map from shapeId {number} => winding {number}
        this.windingMap = null;
        // @public {boolean|null} - Filled in later
        this.filled = null;
        if (boundary) {
            this.addBoundaryFaceReferences(boundary);
        }
        return this;
    }
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'Face',
            id: this.id,
            boundary: this.boundary === null ? null : this.boundary.id,
            holes: this.holes.map((boundary)=>boundary.id),
            windingMap: this.windingMap,
            filled: this.filled
        };
    }
    /**
   * Removes references (so it can allow other objects to be GC'ed or pooled), and frees itself to the pool so it
   * can be reused.
   * @public
   */ dispose() {
        this.boundary = null;
        cleanArray(this.holes);
        this.windingMap = null;
        this.filled = null;
        this.freeToPool();
    }
    /**
   * Marks all half-edges on the boundary as belonging to this face.
   * @public
   *
   * @param {Boundary} boundary
   */ addBoundaryFaceReferences(boundary) {
        for(let i = 0; i < boundary.halfEdges.length; i++){
            assert && assert(boundary.halfEdges[i].face === null);
            boundary.halfEdges[i].face = this;
        }
    }
    /**
   * Processes the boundary-graph for a given outer boundary, and turns it into holes for this face.
   * @public
   *
   * In the graph, every outer boundary in each connected component will be holes for the single inner boundary
   * (which will be, in this case, our face's boundary). Since it's a tree, we can walk the tree recursively to add
   * all necessary holes.
   *
   * @param {Boundary} outerBoundary
   */ recursivelyAddHoles(outerBoundary) {
        assert && assert(!outerBoundary.isInner());
        this.holes.push(outerBoundary);
        this.addBoundaryFaceReferences(outerBoundary);
        for(let i = 0; i < outerBoundary.childBoundaries.length; i++){
            this.recursivelyAddHoles(outerBoundary.childBoundaries[i]);
        }
    }
    // @public
    freeToPool() {
        Face.pool.freeToPool(this);
    }
    /**
   * @public (kite-internal)
   *
   * NOTE: Use Face.pool.create for most usage instead of using the constructor directly.
   *
   * @param {Boundary|null} boundary - Null if it's the unbounded face
   */ constructor(boundary){
        // @public {number}
        this.id = ++globaId;
        // NOTE: most object properties are declared/documented in the initialize method. Please look there for most
        // definitions.
        this.initialize(boundary);
    }
};
// @public
Face.pool = new Pool(Face);
kite.register('Face', Face);
export default Face;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0ZhY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBmYWNlIGlzIHVzdWFsbHkgY29udGFpbmVkIGJ5IGFuIChcImlubmVyXCIpIGJvdW5kYXJ5IG9mIGVkZ2VzLCBhbmQgemVybyBvciBtb3JlIChcIm91dGVyXCIpIGJvdW5kYXJ5IGhvbGVzIG9uIHRoZSBpbnNpZGUuXG4gKiBUaGUgbmFtaW5nIGlzIHNvbWV3aGF0IGNvdW50ZXJpbnR1aXRpdmUgaGVyZSwgYmVjYXVzZSB0aGUgXCJpbm5lclwiIGJvdW5kYXJpZXMgYXJlIG9uIHRoZSBpbnNpZGUgb2YgdGhlIGVkZ2VzXG4gKiAodG93YXJkcyBvdXIgZmFjZSksIGFuZCB0aGUgXCJvdXRlclwiIGhvbGUgYm91bmRhcmllcyBhcmUgb24gdGhlIG91dGVyIGhhbGYtZWRnZXMgb2YgdGhlIGhvbGVzLlxuICpcbiAqIFRoZXJlIGlzIG5vcm1hbGx5IG9uZSBcInVuYm91bmRlZFwiIGZhY2Ugd2l0aG91dCBhIG5vcm1hbCBib3VuZGFyeSwgd2hvc2UgXCJhcmVhXCIgZXhwYW5kcyB0byBpbmZpbml0eSwgYW5kIGNvbnRhaW5zIHRoZVxuICogZXZlcnl0aGluZyBvbiB0aGUgZXh0ZXJpb3Igb2YgYWxsIG9mIHRoZSBlZGdlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IFBvb2wgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IHsga2l0ZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFJZCA9IDA7XG5cbmNsYXNzIEZhY2Uge1xuICAvKipcbiAgICogQHB1YmxpYyAoa2l0ZS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogVXNlIEZhY2UucG9vbC5jcmVhdGUgZm9yIG1vc3QgdXNhZ2UgaW5zdGVhZCBvZiB1c2luZyB0aGUgY29uc3RydWN0b3IgZGlyZWN0bHkuXG4gICAqXG4gICAqIEBwYXJhbSB7Qm91bmRhcnl8bnVsbH0gYm91bmRhcnkgLSBOdWxsIGlmIGl0J3MgdGhlIHVuYm91bmRlZCBmYWNlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggYm91bmRhcnkgKSB7XG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxuICAgIHRoaXMuaWQgPSArK2dsb2JhSWQ7XG5cbiAgICAvLyBOT1RFOiBtb3N0IG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBkZWNsYXJlZC9kb2N1bWVudGVkIGluIHRoZSBpbml0aWFsaXplIG1ldGhvZC4gUGxlYXNlIGxvb2sgdGhlcmUgZm9yIG1vc3RcbiAgICAvLyBkZWZpbml0aW9ucy5cbiAgICB0aGlzLmluaXRpYWxpemUoIGJvdW5kYXJ5ICk7XG4gIH1cblxuICAvKipcbiAgICogU2ltaWxhciB0byBhIHVzdWFsIGNvbnN0cnVjdG9yLCBidXQgaXMgc2V0IHVwIHNvIGl0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgKHdpdGggZGlzcG9zZSgpIGluLWJldHdlZW4pIHRvXG4gICAqIHN1cHBvcnQgcG9vbGluZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCb3VuZGFyeX0gYm91bmRhcnlcbiAgICogQHJldHVybnMge0ZhY2V9IC0gVGhpcyByZWZlcmVuY2UgZm9yIGNoYWluaW5nXG4gICAqL1xuICBpbml0aWFsaXplKCBib3VuZGFyeSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib3VuZGFyeSA9PT0gbnVsbCB8fCBib3VuZGFyeS5pc0lubmVyKCkgKTtcblxuICAgIC8vIEBwdWJsaWMge0JvdW5kYXJ5fG51bGx9IC0gXCJpbm5lclwiIHR5cGVzLCBudWxsIHdoZW4gZGlzcG9zZWQgKGluIHBvb2wpXG4gICAgdGhpcy5ib3VuZGFyeSA9IGJvdW5kYXJ5O1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEJvdW5kYXJ5Pn0gLSBcIm91dGVyXCIgdHlwZXNcbiAgICB0aGlzLmhvbGVzID0gY2xlYW5BcnJheSggdGhpcy5ob2xlcyApO1xuXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0fG51bGx9IC0gSWYgbm9uLW51bGwsIGl0J3MgYSBtYXAgZnJvbSBzaGFwZUlkIHtudW1iZXJ9ID0+IHdpbmRpbmcge251bWJlcn1cbiAgICB0aGlzLndpbmRpbmdNYXAgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbnxudWxsfSAtIEZpbGxlZCBpbiBsYXRlclxuICAgIHRoaXMuZmlsbGVkID0gbnVsbDtcblxuICAgIGlmICggYm91bmRhcnkgKSB7XG4gICAgICB0aGlzLmFkZEJvdW5kYXJ5RmFjZVJlZmVyZW5jZXMoIGJvdW5kYXJ5ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZm9ybSB0aGF0IGNhbiBiZSB0dXJuZWQgYmFjayBpbnRvIGEgc2VnbWVudCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRlc2VyaWFsaXplIG1ldGhvZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnRmFjZScsXG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGJvdW5kYXJ5OiB0aGlzLmJvdW5kYXJ5ID09PSBudWxsID8gbnVsbCA6IHRoaXMuYm91bmRhcnkuaWQsXG4gICAgICBob2xlczogdGhpcy5ob2xlcy5tYXAoIGJvdW5kYXJ5ID0+IGJvdW5kYXJ5LmlkICksXG4gICAgICB3aW5kaW5nTWFwOiB0aGlzLndpbmRpbmdNYXAsXG4gICAgICBmaWxsZWQ6IHRoaXMuZmlsbGVkXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHJlZmVyZW5jZXMgKHNvIGl0IGNhbiBhbGxvdyBvdGhlciBvYmplY3RzIHRvIGJlIEdDJ2VkIG9yIHBvb2xlZCksIGFuZCBmcmVlcyBpdHNlbGYgdG8gdGhlIHBvb2wgc28gaXRcbiAgICogY2FuIGJlIHJldXNlZC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmJvdW5kYXJ5ID0gbnVsbDtcbiAgICBjbGVhbkFycmF5KCB0aGlzLmhvbGVzICk7XG4gICAgdGhpcy53aW5kaW5nTWFwID0gbnVsbDtcbiAgICB0aGlzLmZpbGxlZCA9IG51bGw7XG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgYWxsIGhhbGYtZWRnZXMgb24gdGhlIGJvdW5kYXJ5IGFzIGJlbG9uZ2luZyB0byB0aGlzIGZhY2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtCb3VuZGFyeX0gYm91bmRhcnlcbiAgICovXG4gIGFkZEJvdW5kYXJ5RmFjZVJlZmVyZW5jZXMoIGJvdW5kYXJ5ICkge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJvdW5kYXJ5LmhhbGZFZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJvdW5kYXJ5LmhhbGZFZGdlc1sgaSBdLmZhY2UgPT09IG51bGwgKTtcblxuICAgICAgYm91bmRhcnkuaGFsZkVkZ2VzWyBpIF0uZmFjZSA9IHRoaXM7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyB0aGUgYm91bmRhcnktZ3JhcGggZm9yIGEgZ2l2ZW4gb3V0ZXIgYm91bmRhcnksIGFuZCB0dXJucyBpdCBpbnRvIGhvbGVzIGZvciB0aGlzIGZhY2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogSW4gdGhlIGdyYXBoLCBldmVyeSBvdXRlciBib3VuZGFyeSBpbiBlYWNoIGNvbm5lY3RlZCBjb21wb25lbnQgd2lsbCBiZSBob2xlcyBmb3IgdGhlIHNpbmdsZSBpbm5lciBib3VuZGFyeVxuICAgKiAod2hpY2ggd2lsbCBiZSwgaW4gdGhpcyBjYXNlLCBvdXIgZmFjZSdzIGJvdW5kYXJ5KS4gU2luY2UgaXQncyBhIHRyZWUsIHdlIGNhbiB3YWxrIHRoZSB0cmVlIHJlY3Vyc2l2ZWx5IHRvIGFkZFxuICAgKiBhbGwgbmVjZXNzYXJ5IGhvbGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0JvdW5kYXJ5fSBvdXRlckJvdW5kYXJ5XG4gICAqL1xuICByZWN1cnNpdmVseUFkZEhvbGVzKCBvdXRlckJvdW5kYXJ5ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvdXRlckJvdW5kYXJ5LmlzSW5uZXIoKSApO1xuXG4gICAgdGhpcy5ob2xlcy5wdXNoKCBvdXRlckJvdW5kYXJ5ICk7XG4gICAgdGhpcy5hZGRCb3VuZGFyeUZhY2VSZWZlcmVuY2VzKCBvdXRlckJvdW5kYXJ5ICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgb3V0ZXJCb3VuZGFyeS5jaGlsZEJvdW5kYXJpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnJlY3Vyc2l2ZWx5QWRkSG9sZXMoIG91dGVyQm91bmRhcnkuY2hpbGRCb3VuZGFyaWVzWyBpIF0gKTtcbiAgICB9XG4gIH1cblxuICAvLyBAcHVibGljXG4gIGZyZWVUb1Bvb2woKSB7XG4gICAgRmFjZS5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIC8vIEBwdWJsaWNcbiAgc3RhdGljIHBvb2wgPSBuZXcgUG9vbCggRmFjZSApO1xufVxuXG5raXRlLnJlZ2lzdGVyKCAnRmFjZScsIEZhY2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgRmFjZTsiXSwibmFtZXMiOlsiY2xlYW5BcnJheSIsIlBvb2wiLCJraXRlIiwiZ2xvYmFJZCIsIkZhY2UiLCJpbml0aWFsaXplIiwiYm91bmRhcnkiLCJhc3NlcnQiLCJpc0lubmVyIiwiaG9sZXMiLCJ3aW5kaW5nTWFwIiwiZmlsbGVkIiwiYWRkQm91bmRhcnlGYWNlUmVmZXJlbmNlcyIsInNlcmlhbGl6ZSIsInR5cGUiLCJpZCIsIm1hcCIsImRpc3Bvc2UiLCJmcmVlVG9Qb29sIiwiaSIsImhhbGZFZGdlcyIsImxlbmd0aCIsImZhY2UiLCJyZWN1cnNpdmVseUFkZEhvbGVzIiwib3V0ZXJCb3VuZGFyeSIsInB1c2giLCJjaGlsZEJvdW5kYXJpZXMiLCJwb29sIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsVUFBVSxnQ0FBZ0M7QUFDakQsU0FBU0MsSUFBSSxRQUFRLGdCQUFnQjtBQUVyQyxJQUFJQyxVQUFVO0FBRWQsSUFBQSxBQUFNQyxPQUFOLE1BQU1BO0lBaUJKOzs7Ozs7O0dBT0MsR0FDREMsV0FBWUMsUUFBUSxFQUFHO1FBQ3JCQyxVQUFVQSxPQUFRRCxhQUFhLFFBQVFBLFNBQVNFLE9BQU87UUFFdkQsd0VBQXdFO1FBQ3hFLElBQUksQ0FBQ0YsUUFBUSxHQUFHQTtRQUVoQiw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDRyxLQUFLLEdBQUdULFdBQVksSUFBSSxDQUFDUyxLQUFLO1FBRW5DLDRGQUE0RjtRQUM1RixJQUFJLENBQUNDLFVBQVUsR0FBRztRQUVsQiwyQ0FBMkM7UUFDM0MsSUFBSSxDQUFDQyxNQUFNLEdBQUc7UUFFZCxJQUFLTCxVQUFXO1lBQ2QsSUFBSSxDQUFDTSx5QkFBeUIsQ0FBRU47UUFDbEM7UUFFQSxPQUFPLElBQUk7SUFDYjtJQUVBOzs7OztHQUtDLEdBQ0RPLFlBQVk7UUFDVixPQUFPO1lBQ0xDLE1BQU07WUFDTkMsSUFBSSxJQUFJLENBQUNBLEVBQUU7WUFDWFQsVUFBVSxJQUFJLENBQUNBLFFBQVEsS0FBSyxPQUFPLE9BQU8sSUFBSSxDQUFDQSxRQUFRLENBQUNTLEVBQUU7WUFDMUROLE9BQU8sSUFBSSxDQUFDQSxLQUFLLENBQUNPLEdBQUcsQ0FBRVYsQ0FBQUEsV0FBWUEsU0FBU1MsRUFBRTtZQUM5Q0wsWUFBWSxJQUFJLENBQUNBLFVBQVU7WUFDM0JDLFFBQVEsSUFBSSxDQUFDQSxNQUFNO1FBQ3JCO0lBQ0Y7SUFFQTs7OztHQUlDLEdBQ0RNLFVBQVU7UUFDUixJQUFJLENBQUNYLFFBQVEsR0FBRztRQUNoQk4sV0FBWSxJQUFJLENBQUNTLEtBQUs7UUFDdEIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7UUFDbEIsSUFBSSxDQUFDQyxNQUFNLEdBQUc7UUFDZCxJQUFJLENBQUNPLFVBQVU7SUFDakI7SUFFQTs7Ozs7R0FLQyxHQUNETiwwQkFBMkJOLFFBQVEsRUFBRztRQUNwQyxJQUFNLElBQUlhLElBQUksR0FBR0EsSUFBSWIsU0FBU2MsU0FBUyxDQUFDQyxNQUFNLEVBQUVGLElBQU07WUFDcERaLFVBQVVBLE9BQVFELFNBQVNjLFNBQVMsQ0FBRUQsRUFBRyxDQUFDRyxJQUFJLEtBQUs7WUFFbkRoQixTQUFTYyxTQUFTLENBQUVELEVBQUcsQ0FBQ0csSUFBSSxHQUFHLElBQUk7UUFDckM7SUFDRjtJQUVBOzs7Ozs7Ozs7R0FTQyxHQUNEQyxvQkFBcUJDLGFBQWEsRUFBRztRQUNuQ2pCLFVBQVVBLE9BQVEsQ0FBQ2lCLGNBQWNoQixPQUFPO1FBRXhDLElBQUksQ0FBQ0MsS0FBSyxDQUFDZ0IsSUFBSSxDQUFFRDtRQUNqQixJQUFJLENBQUNaLHlCQUF5QixDQUFFWTtRQUNoQyxJQUFNLElBQUlMLElBQUksR0FBR0EsSUFBSUssY0FBY0UsZUFBZSxDQUFDTCxNQUFNLEVBQUVGLElBQU07WUFDL0QsSUFBSSxDQUFDSSxtQkFBbUIsQ0FBRUMsY0FBY0UsZUFBZSxDQUFFUCxFQUFHO1FBQzlEO0lBQ0Y7SUFFQSxVQUFVO0lBQ1ZELGFBQWE7UUFDWGQsS0FBS3VCLElBQUksQ0FBQ1QsVUFBVSxDQUFFLElBQUk7SUFDNUI7SUFqSEE7Ozs7OztHQU1DLEdBQ0RVLFlBQWF0QixRQUFRLENBQUc7UUFDdEIsbUJBQW1CO1FBQ25CLElBQUksQ0FBQ1MsRUFBRSxHQUFHLEVBQUVaO1FBRVosNEdBQTRHO1FBQzVHLGVBQWU7UUFDZixJQUFJLENBQUNFLFVBQVUsQ0FBRUM7SUFDbkI7QUF1R0Y7QUFGRSxVQUFVO0FBcEhORixLQXFIR3VCLE9BQU8sSUFBSTFCLEtBQU1HO0FBRzFCRixLQUFLMkIsUUFBUSxDQUFFLFFBQVF6QjtBQUV2QixlQUFlQSxLQUFLIn0=