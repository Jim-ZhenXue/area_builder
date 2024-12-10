// Copyright 2016-2022, University of Colorado Boulder
/**
 * A trait for drawables for Text that need to store state about what the current display is currently showing,
 * so that updates to the Text will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will also mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const TextStatefulDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends PaintableStatefulDrawable(type) {
        /**
     * @public
     * @override
     *
     * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
     * @param {Instance} instance
     */ initialize(renderer, instance, ...args) {
            super.initialize(renderer, instance, ...args);
            // @protected {boolean} - Flag marked as true if ANY of the drawable dirty flags are set (basically everything except for transforms, as we
            //                        need to accelerate the transform case.
            this.paintDirty = true;
            this.dirtyText = true;
            this.dirtyFont = true;
            this.dirtyBounds = true;
        }
        /**
     * A "catch-all" dirty method that directly marks the paintDirty flag and triggers propagation of dirty
     * information. This can be used by other mark* methods, or directly itself if the paintDirty flag is checked.
     * @public
     *
     * It should be fired (indirectly or directly) for anything besides transforms that needs to make a drawable
     * dirty.
     */ markPaintDirty() {
            this.paintDirty = true;
            this.markDirty();
        }
        /**
     * @public
     */ markDirtyText() {
            this.dirtyText = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyFont() {
            this.dirtyFont = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyBounds() {
            this.dirtyBounds = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag
     * them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyText = false;
            this.dirtyFont = false;
            this.dirtyBounds = false;
        }
    };
});
scenery.register('TextStatefulDrawable', TextStatefulDrawable);
export default TextStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvVGV4dFN0YXRlZnVsRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBUZXh0IHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXG4gKiBzbyB0aGF0IHVwZGF0ZXMgdG8gdGhlIFRleHQgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogVGhpcyB3aWxsIGFsc28gbWl4IGluIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGVcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XG5pbXBvcnQgeyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3QgVGV4dFN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggaW5oZXJpdGFuY2UoIHR5cGUgKSwgU2VsZkRyYXdhYmxlICkgKTtcblxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlKCB0eXBlICkge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eVRleHQgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eUZvbnQgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eUJvdW5kcyA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XG4gICAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcbiAgICAgKiBkaXJ0eS5cbiAgICAgKi9cbiAgICBtYXJrUGFpbnREaXJ0eSgpIHtcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlUZXh0KCkge1xuICAgICAgdGhpcy5kaXJ0eVRleHQgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlGb250KCkge1xuICAgICAgdGhpcy5kaXJ0eUZvbnQgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlCb3VuZHMoKSB7XG4gICAgICB0aGlzLmRpcnR5Qm91bmRzID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIG9mIHRoZSBkaXJ0eSBmbGFncyAoYWZ0ZXIgdGhleSBoYXZlIGJlZW4gY2hlY2tlZCksIHNvIHRoYXQgZnV0dXJlIG1hcmsqIG1ldGhvZHMgd2lsbCBiZSBhYmxlIHRvIGZsYWdcbiAgICAgKiB0aGVtIGFnYWluLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzZXRUb0NsZWFuU3RhdGUoKSB7XG4gICAgICB0aGlzLnBhaW50RGlydHkgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlUZXh0ID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5Rm9udCA9IGZhbHNlO1xuICAgICAgdGhpcy5kaXJ0eUJvdW5kcyA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1RleHRTdGF0ZWZ1bERyYXdhYmxlJywgVGV4dFN0YXRlZnVsRHJhd2FibGUgKTtcbmV4cG9ydCBkZWZhdWx0IFRleHRTdGF0ZWZ1bERyYXdhYmxlOyJdLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIlRleHRTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eVRleHQiLCJkaXJ0eUZvbnQiLCJkaXJ0eUJvdW5kcyIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5VGV4dCIsIm1hcmtEaXJ0eUZvbnQiLCJtYXJrRGlydHlCb3VuZHMiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUVwRixNQUFNQyx1QkFBdUJKLFFBQVNLLENBQUFBO0lBQ3BDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVULFlBQWFNLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0YsMEJBQTJCSTtRQUM5Qzs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsMklBQTJJO1lBQzNJLGdFQUFnRTtZQUNoRSxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFNBQVMsR0FBRztZQUNqQixJQUFJLENBQUNDLFNBQVMsR0FBRztZQUNqQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNyQjtRQUVBOzs7Ozs7O0tBT0MsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDSixVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDSyxTQUFTO1FBQ2hCO1FBRUE7O0tBRUMsR0FDREMsZ0JBQWdCO1lBQ2QsSUFBSSxDQUFDTCxTQUFTLEdBQUc7WUFDakIsSUFBSSxDQUFDRyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREcsZ0JBQWdCO1lBQ2QsSUFBSSxDQUFDTCxTQUFTLEdBQUc7WUFDakIsSUFBSSxDQUFDRSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREksa0JBQWtCO1lBQ2hCLElBQUksQ0FBQ0wsV0FBVyxHQUFHO1lBQ25CLElBQUksQ0FBQ0MsY0FBYztRQUNyQjtRQUVBOzs7O0tBSUMsR0FDREssa0JBQWtCO1lBQ2hCLElBQUksQ0FBQ1QsVUFBVSxHQUFHO1lBQ2xCLElBQUksQ0FBQ0MsU0FBUyxHQUFHO1lBQ2pCLElBQUksQ0FBQ0MsU0FBUyxHQUFHO1lBQ2pCLElBQUksQ0FBQ0MsV0FBVyxHQUFHO1FBQ3JCO0lBQ0Y7QUFDRjtBQUVBZCxRQUFRcUIsUUFBUSxDQUFFLHdCQUF3Qm5CO0FBQzFDLGVBQWVBLHFCQUFxQiJ9