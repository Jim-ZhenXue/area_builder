// Copyright 2014-2023, University of Colorado Boulder
/**
 * DOM Drawable wrapper for another DOM Drawable. Used so that we can have our own independent siblings, generally as part
 * of a Backbone's layers/blocks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../phet-core/js/Poolable.js';
import { Block, scenery } from '../imports.js';
let DOMBlock = class DOMBlock extends Block {
    /**
   * @public
   *
   * @param {Display} display
   * @param {Drawable} domDrawable
   * @returns {DOMBlock} - For chaining
   */ initialize(display, domDrawable) {
        // TODO: is it bad to pass the acceleration flags along? https://github.com/phetsims/scenery/issues/1581
        super.initialize(display, domDrawable.renderer);
        this.domDrawable = domDrawable;
        this.domElement = domDrawable.domElement;
        return this;
    }
    /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */ update() {
        // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
        if (!super.update()) {
            return false;
        }
        this.domDrawable.update();
        return true;
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        this.domDrawable = null;
        this.domElement = null;
        // super call
        super.dispose();
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ markDirtyDrawable(drawable) {
        this.markDirty();
    }
    /**
   * Adds a drawable to this block.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ addDrawable(drawable) {
        sceneryLog && sceneryLog.DOMBlock && sceneryLog.DOMBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
        assert && assert(this.domDrawable === drawable, 'DOMBlock should only be used with one drawable for now (the one it was initialized with)');
        super.addDrawable(drawable);
    }
    /**
   * Removes a drawable from this block.
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        sceneryLog && sceneryLog.DOMBlock && sceneryLog.DOMBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
        assert && assert(this.domDrawable === drawable, 'DOMBlock should only be used with one drawable for now (the one it was initialized with)');
        super.removeDrawable(drawable);
    }
    /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {Drawable} domDrawable
   */ constructor(display, domDrawable){
        super();
        this.initialize(display, domDrawable);
    }
};
scenery.register('DOMBlock', DOMBlock);
Poolable.mixInto(DOMBlock);
export default DOMBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9ET01CbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBET00gRHJhd2FibGUgd3JhcHBlciBmb3IgYW5vdGhlciBET00gRHJhd2FibGUuIFVzZWQgc28gdGhhdCB3ZSBjYW4gaGF2ZSBvdXIgb3duIGluZGVwZW5kZW50IHNpYmxpbmdzLCBnZW5lcmFsbHkgYXMgcGFydFxuICogb2YgYSBCYWNrYm9uZSdzIGxheWVycy9ibG9ja3MuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgQmxvY2ssIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgRE9NQmxvY2sgZXh0ZW5kcyBCbG9jayB7XG4gIC8qKlxuICAgKiBAbWl4ZXMgUG9vbGFibGVcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRvbURyYXdhYmxlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZGlzcGxheSwgZG9tRHJhd2FibGUgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZGlzcGxheSwgZG9tRHJhd2FibGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkb21EcmF3YWJsZVxuICAgKiBAcmV0dXJucyB7RE9NQmxvY2t9IC0gRm9yIGNoYWluaW5nXG4gICAqL1xuICBpbml0aWFsaXplKCBkaXNwbGF5LCBkb21EcmF3YWJsZSApIHtcbiAgICAvLyBUT0RPOiBpcyBpdCBiYWQgdG8gcGFzcyB0aGUgYWNjZWxlcmF0aW9uIGZsYWdzIGFsb25nPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHN1cGVyLmluaXRpYWxpemUoIGRpc3BsYXksIGRvbURyYXdhYmxlLnJlbmRlcmVyICk7XG5cbiAgICB0aGlzLmRvbURyYXdhYmxlID0gZG9tRHJhd2FibGU7XG4gICAgdGhpcy5kb21FbGVtZW50ID0gZG9tRHJhd2FibGUuZG9tRWxlbWVudDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgdXBkYXRlIHNob3VsZCBjb250aW51ZSAoaWYgZmFsc2UsIGZ1cnRoZXIgdXBkYXRlcyBpbiBzdXBlcnR5cGUgc3RlcHMgc2hvdWxkIG5vdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICAvLyBTZWUgaWYgd2UgbmVlZCB0byBhY3R1YWxseSB1cGRhdGUgdGhpbmdzICh3aWxsIGJhaWwgb3V0IGlmIHdlIGFyZSBub3QgZGlydHksIG9yIGlmIHdlJ3ZlIGJlZW4gZGlzcG9zZWQpXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5kb21EcmF3YWJsZS51cGRhdGUoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5kb21EcmF3YWJsZSA9IG51bGw7XG4gICAgdGhpcy5kb21FbGVtZW50ID0gbnVsbDtcblxuICAgIC8vIHN1cGVyIGNhbGxcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgbWFya0RpcnR5RHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIHRoaXMubWFya0RpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGRyYXdhYmxlIHRvIHRoaXMgYmxvY2suXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICBhZGREcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRPTUJsb2NrICYmIHNjZW5lcnlMb2cuRE9NQmxvY2soIGAjJHt0aGlzLmlkfS5hZGREcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZG9tRHJhd2FibGUgPT09IGRyYXdhYmxlLCAnRE9NQmxvY2sgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIG9uZSBkcmF3YWJsZSBmb3Igbm93ICh0aGUgb25lIGl0IHdhcyBpbml0aWFsaXplZCB3aXRoKScgKTtcblxuICAgIHN1cGVyLmFkZERyYXdhYmxlKCBkcmF3YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBkcmF3YWJsZSBmcm9tIHRoaXMgYmxvY2suXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICByZW1vdmVEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRPTUJsb2NrICYmIHNjZW5lcnlMb2cuRE9NQmxvY2soIGAjJHt0aGlzLmlkfS5yZW1vdmVEcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZG9tRHJhd2FibGUgPT09IGRyYXdhYmxlLCAnRE9NQmxvY2sgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aXRoIG9uZSBkcmF3YWJsZSBmb3Igbm93ICh0aGUgb25lIGl0IHdhcyBpbml0aWFsaXplZCB3aXRoKScgKTtcblxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdET01CbG9jaycsIERPTUJsb2NrICk7XG5cblBvb2xhYmxlLm1peEludG8oIERPTUJsb2NrICk7XG5cbmV4cG9ydCBkZWZhdWx0IERPTUJsb2NrOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIkJsb2NrIiwic2NlbmVyeSIsIkRPTUJsb2NrIiwiaW5pdGlhbGl6ZSIsImRpc3BsYXkiLCJkb21EcmF3YWJsZSIsInJlbmRlcmVyIiwiZG9tRWxlbWVudCIsInVwZGF0ZSIsImRpc3Bvc2UiLCJtYXJrRGlydHlEcmF3YWJsZSIsImRyYXdhYmxlIiwibWFya0RpcnR5IiwiYWRkRHJhd2FibGUiLCJzY2VuZXJ5TG9nIiwiaWQiLCJ0b1N0cmluZyIsImFzc2VydCIsInJlbW92ZURyYXdhYmxlIiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLEtBQUssRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUUvQyxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCRjtJQWFyQjs7Ozs7O0dBTUMsR0FDREcsV0FBWUMsT0FBTyxFQUFFQyxXQUFXLEVBQUc7UUFDakMsd0dBQXdHO1FBQ3hHLEtBQUssQ0FBQ0YsV0FBWUMsU0FBU0MsWUFBWUMsUUFBUTtRQUUvQyxJQUFJLENBQUNELFdBQVcsR0FBR0E7UUFDbkIsSUFBSSxDQUFDRSxVQUFVLEdBQUdGLFlBQVlFLFVBQVU7UUFFeEMsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7Ozs7OztHQU9DLEdBQ0RDLFNBQVM7UUFDUCwwR0FBMEc7UUFDMUcsSUFBSyxDQUFDLEtBQUssQ0FBQ0EsVUFBVztZQUNyQixPQUFPO1FBQ1Q7UUFFQSxJQUFJLENBQUNILFdBQVcsQ0FBQ0csTUFBTTtRQUV2QixPQUFPO0lBQ1Q7SUFFQTs7OztHQUlDLEdBQ0RDLFVBQVU7UUFDUixJQUFJLENBQUNKLFdBQVcsR0FBRztRQUNuQixJQUFJLENBQUNFLFVBQVUsR0FBRztRQUVsQixhQUFhO1FBQ2IsS0FBSyxDQUFDRTtJQUNSO0lBRUE7Ozs7R0FJQyxHQUNEQyxrQkFBbUJDLFFBQVEsRUFBRztRQUM1QixJQUFJLENBQUNDLFNBQVM7SUFDaEI7SUFFQTs7Ozs7O0dBTUMsR0FDREMsWUFBYUYsUUFBUSxFQUFHO1FBQ3RCRyxjQUFjQSxXQUFXWixRQUFRLElBQUlZLFdBQVdaLFFBQVEsQ0FBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNhLEVBQUUsQ0FBQyxhQUFhLEVBQUVKLFNBQVNLLFFBQVEsSUFBSTtRQUMxR0MsVUFBVUEsT0FBUSxJQUFJLENBQUNaLFdBQVcsS0FBS00sVUFBVTtRQUVqRCxLQUFLLENBQUNFLFlBQWFGO0lBQ3JCO0lBRUE7Ozs7OztHQU1DLEdBQ0RPLGVBQWdCUCxRQUFRLEVBQUc7UUFDekJHLGNBQWNBLFdBQVdaLFFBQVEsSUFBSVksV0FBV1osUUFBUSxDQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ2EsRUFBRSxDQUFDLGdCQUFnQixFQUFFSixTQUFTSyxRQUFRLElBQUk7UUFDN0dDLFVBQVVBLE9BQVEsSUFBSSxDQUFDWixXQUFXLEtBQUtNLFVBQVU7UUFFakQsS0FBSyxDQUFDTyxlQUFnQlA7SUFDeEI7SUFoR0E7Ozs7O0dBS0MsR0FDRFEsWUFBYWYsT0FBTyxFQUFFQyxXQUFXLENBQUc7UUFDbEMsS0FBSztRQUVMLElBQUksQ0FBQ0YsVUFBVSxDQUFFQyxTQUFTQztJQUM1QjtBQXVGRjtBQUVBSixRQUFRbUIsUUFBUSxDQUFFLFlBQVlsQjtBQUU5QkgsU0FBU3NCLE9BQU8sQ0FBRW5CO0FBRWxCLGVBQWVBLFNBQVMifQ==