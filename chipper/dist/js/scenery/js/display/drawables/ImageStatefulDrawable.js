// Copyright 2016-2021, University of Colorado Boulder
/**
 * A trait for drawables for Image that need to store state about what the current display is currently showing,
 * so that updates to the Image will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { scenery, SelfDrawable } from '../../imports.js';
const ImageStatefulDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends type {
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
            this.dirtyImage = true;
            this.dirtyImageOpacity = true;
            this.dirtyMipmap = true;
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
     */ markDirtyImage() {
            this.dirtyImage = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyImageOpacity() {
            this.dirtyImageOpacity = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyMipmap() {
            this.dirtyMipmap = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyImage = false;
            this.dirtyImageOpacity = false;
            this.dirtyMipmap = false;
        }
    };
});
scenery.register('ImageStatefulDrawable', ImageStatefulDrawable);
export default ImageStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3IgSW1hZ2UgdGhhdCBuZWVkIHRvIHN0b3JlIHN0YXRlIGFib3V0IHdoYXQgdGhlIGN1cnJlbnQgZGlzcGxheSBpcyBjdXJyZW50bHkgc2hvd2luZyxcbiAqIHNvIHRoYXQgdXBkYXRlcyB0byB0aGUgSW1hZ2Ugd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IEltYWdlU3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xuXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIHR5cGUge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eUltYWdlID0gdHJ1ZTtcbiAgICAgIHRoaXMuZGlydHlJbWFnZU9wYWNpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eU1pcG1hcCA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XG4gICAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcbiAgICAgKiBkaXJ0eS5cbiAgICAgKi9cbiAgICBtYXJrUGFpbnREaXJ0eSgpIHtcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlJbWFnZSgpIHtcbiAgICAgIHRoaXMuZGlydHlJbWFnZSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUltYWdlT3BhY2l0eSgpIHtcbiAgICAgIHRoaXMuZGlydHlJbWFnZU9wYWNpdHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlNaXBtYXAoKSB7XG4gICAgICB0aGlzLmRpcnR5TWlwbWFwID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIG9mIHRoZSBkaXJ0eSBmbGFncyAoYWZ0ZXIgdGhleSBoYXZlIGJlZW4gY2hlY2tlZCksIHNvIHRoYXQgZnV0dXJlIG1hcmsqIG1ldGhvZHMgd2lsbCBiZSBhYmxlIHRvIGZsYWcgdGhlbSBhZ2Fpbi5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgc2V0VG9DbGVhblN0YXRlKCkge1xuICAgICAgdGhpcy5wYWludERpcnR5ID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5SW1hZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlJbWFnZU9wYWNpdHkgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlNaXBtYXAgPSBmYWxzZTtcbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbWFnZVN0YXRlZnVsRHJhd2FibGUnLCBJbWFnZVN0YXRlZnVsRHJhd2FibGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlOyJdLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJkaXJ0eUltYWdlIiwiZGlydHlJbWFnZU9wYWNpdHkiLCJkaXJ0eU1pcG1hcCIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5SW1hZ2UiLCJtYXJrRGlydHlJbWFnZU9wYWNpdHkiLCJtYXJrRGlydHlNaXBtYXAiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGFBQWEsc0NBQXNDO0FBQzFELFNBQVNDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUV6RCxNQUFNQyx3QkFBd0JILFFBQVNJLENBQUFBO0lBQ3JDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVSLFlBQWFLLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0U7UUFDbkI7Ozs7OztLQU1DLEdBQ0RJLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztZQUN4QyxLQUFLLENBQUNILFdBQVlDLFVBQVVDLGFBQWFDO1lBRXpDLDJJQUEySTtZQUMzSSxnRUFBZ0U7WUFDaEUsSUFBSSxDQUFDQyxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRztZQUN6QixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNyQjtRQUVBOzs7Ozs7O0tBT0MsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDSixVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDSyxTQUFTO1FBQ2hCO1FBRUE7O0tBRUMsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDTCxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDRyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREcsd0JBQXdCO1lBQ3RCLElBQUksQ0FBQ0wsaUJBQWlCLEdBQUc7WUFDekIsSUFBSSxDQUFDRSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREksa0JBQWtCO1lBQ2hCLElBQUksQ0FBQ0wsV0FBVyxHQUFHO1lBQ25CLElBQUksQ0FBQ0MsY0FBYztRQUNyQjtRQUVBOzs7S0FHQyxHQUNESyxrQkFBa0I7WUFDaEIsSUFBSSxDQUFDVCxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRztZQUN6QixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNyQjtJQUNGO0FBQ0Y7QUFFQWQsUUFBUXFCLFFBQVEsQ0FBRSx5QkFBeUJuQjtBQUUzQyxlQUFlQSxzQkFBc0IifQ==