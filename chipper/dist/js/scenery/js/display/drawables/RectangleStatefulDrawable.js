// Copyright 2016-2023, University of Colorado Boulder
/**
 * A trait for drawables for Rectangle that need to store state about what the current display is currently showing,
 * so that updates to the Rectangle will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will also mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const RectangleStatefulDrawable = memoize((type)=>{
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
            this.dirtyX = true;
            this.dirtyY = true;
            this.dirtyWidth = true;
            this.dirtyHeight = true;
            this.dirtyCornerXRadius = true;
            this.dirtyCornerYRadius = true;
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
     */ markDirtyRectangle() {
            // TODO: consider bitmask instead? https://github.com/phetsims/scenery/issues/1581
            this.dirtyX = true;
            this.dirtyY = true;
            this.dirtyWidth = true;
            this.dirtyHeight = true;
            this.dirtyCornerXRadius = true;
            this.dirtyCornerYRadius = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyX() {
            this.dirtyX = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyY() {
            this.dirtyY = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyWidth() {
            this.dirtyWidth = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyHeight() {
            this.dirtyHeight = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyCornerXRadius() {
            this.dirtyCornerXRadius = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyCornerYRadius() {
            this.dirtyCornerYRadius = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyX = false;
            this.dirtyY = false;
            this.dirtyWidth = false;
            this.dirtyHeight = false;
            this.dirtyCornerXRadius = false;
            this.dirtyCornerYRadius = false;
        }
    };
});
scenery.register('RectangleStatefulDrawable', RectangleStatefulDrawable);
export default RectangleStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHRyYWl0IGZvciBkcmF3YWJsZXMgZm9yIFJlY3RhbmdsZSB0aGF0IG5lZWQgdG8gc3RvcmUgc3RhdGUgYWJvdXQgd2hhdCB0aGUgY3VycmVudCBkaXNwbGF5IGlzIGN1cnJlbnRseSBzaG93aW5nLFxuICogc28gdGhhdCB1cGRhdGVzIHRvIHRoZSBSZWN0YW5nbGUgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogVGhpcyB3aWxsIGFsc28gbWl4IGluIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGVcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XG5pbXBvcnQgeyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3QgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xuXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUoIHR5cGUgKSB7XG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gUmVuZGVyZXIgYml0bWFzaywgc2VlIFJlbmRlcmVyJ3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICkge1xuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XG5cbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gRmxhZyBtYXJrZWQgYXMgdHJ1ZSBpZiBBTlkgb2YgdGhlIGRyYXdhYmxlIGRpcnR5IGZsYWdzIGFyZSBzZXQgKGJhc2ljYWxseSBldmVyeXRoaW5nIGV4Y2VwdCBmb3IgdHJhbnNmb3JtcywgYXMgd2VcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgbmVlZCB0byBhY2NlbGVyYXRlIHRoZSB0cmFuc2Zvcm0gY2FzZS5cbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WCA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WSA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5V2lkdGggPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eUhlaWdodCA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XG4gICAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcbiAgICAgKiBkaXJ0eS5cbiAgICAgKi9cbiAgICBtYXJrUGFpbnREaXJ0eSgpIHtcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlSZWN0YW5nbGUoKSB7XG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBiaXRtYXNrIGluc3RlYWQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLmRpcnR5WCA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WSA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5V2lkdGggPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eUhlaWdodCA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVgoKSB7XG4gICAgICB0aGlzLmRpcnR5WCA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVkoKSB7XG4gICAgICB0aGlzLmRpcnR5WSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVdpZHRoKCkge1xuICAgICAgdGhpcy5kaXJ0eVdpZHRoID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5SGVpZ2h0KCkge1xuICAgICAgdGhpcy5kaXJ0eUhlaWdodCA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUNvcm5lclhSYWRpdXMoKSB7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWFJhZGl1cyA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUNvcm5lcllSYWRpdXMoKSB7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3MgKGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGNoZWNrZWQpLCBzbyB0aGF0IGZ1dHVyZSBtYXJrKiBtZXRob2RzIHdpbGwgYmUgYWJsZSB0byBmbGFnIHRoZW0gYWdhaW4uXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHNldFRvQ2xlYW5TdGF0ZSgpIHtcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IGZhbHNlO1xuICAgICAgdGhpcy5kaXJ0eVggPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlZID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5V2lkdGggPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlIZWlnaHQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlDb3JuZXJYUmFkaXVzID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5Q29ybmVyWVJhZGl1cyA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUnLCBSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGU7Il0sIm5hbWVzIjpbImluaGVyaXRhbmNlIiwibWVtb2l6ZSIsIlBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImFyZ3MiLCJwYWludERpcnR5IiwiZGlydHlYIiwiZGlydHlZIiwiZGlydHlXaWR0aCIsImRpcnR5SGVpZ2h0IiwiZGlydHlDb3JuZXJYUmFkaXVzIiwiZGlydHlDb3JuZXJZUmFkaXVzIiwibWFya1BhaW50RGlydHkiLCJtYXJrRGlydHkiLCJtYXJrRGlydHlSZWN0YW5nbGUiLCJtYXJrRGlydHlYIiwibWFya0RpcnR5WSIsIm1hcmtEaXJ0eVdpZHRoIiwibWFya0RpcnR5SGVpZ2h0IiwibWFya0RpcnR5Q29ybmVyWFJhZGl1cyIsIm1hcmtEaXJ0eUNvcm5lcllSYWRpdXMiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUVwRixNQUFNQyw0QkFBNEJKLFFBQVNLLENBQUFBO0lBQ3pDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVULFlBQWFNLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0YsMEJBQTJCSTtRQUM5Qzs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsMklBQTJJO1lBQzNJLGdFQUFnRTtZQUNoRSxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLE1BQU0sR0FBRztZQUNkLElBQUksQ0FBQ0MsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDQyxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxXQUFXLEdBQUc7WUFDbkIsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRztZQUMxQixJQUFJLENBQUNDLGtCQUFrQixHQUFHO1FBQzVCO1FBRUE7Ozs7Ozs7S0FPQyxHQUNEQyxpQkFBaUI7WUFDZixJQUFJLENBQUNQLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNRLFNBQVM7UUFDaEI7UUFFQTs7S0FFQyxHQUNEQyxxQkFBcUI7WUFDbkIsa0ZBQWtGO1lBQ2xGLElBQUksQ0FBQ1IsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDQyxNQUFNLEdBQUc7WUFDZCxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFdBQVcsR0FBRztZQUNuQixJQUFJLENBQUNDLGtCQUFrQixHQUFHO1lBQzFCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUc7WUFDMUIsSUFBSSxDQUFDQyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREcsYUFBYTtZQUNYLElBQUksQ0FBQ1QsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDTSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREksYUFBYTtZQUNYLElBQUksQ0FBQ1QsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDSyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREssaUJBQWlCO1lBQ2YsSUFBSSxDQUFDVCxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDSSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDRE0sa0JBQWtCO1lBQ2hCLElBQUksQ0FBQ1QsV0FBVyxHQUFHO1lBQ25CLElBQUksQ0FBQ0csY0FBYztRQUNyQjtRQUVBOztLQUVDLEdBQ0RPLHlCQUF5QjtZQUN2QixJQUFJLENBQUNULGtCQUFrQixHQUFHO1lBQzFCLElBQUksQ0FBQ0UsY0FBYztRQUNyQjtRQUVBOztLQUVDLEdBQ0RRLHlCQUF5QjtZQUN2QixJQUFJLENBQUNULGtCQUFrQixHQUFHO1lBQzFCLElBQUksQ0FBQ0MsY0FBYztRQUNyQjtRQUVBOzs7S0FHQyxHQUNEUyxrQkFBa0I7WUFDaEIsSUFBSSxDQUFDaEIsVUFBVSxHQUFHO1lBQ2xCLElBQUksQ0FBQ0MsTUFBTSxHQUFHO1lBQ2QsSUFBSSxDQUFDQyxNQUFNLEdBQUc7WUFDZCxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFdBQVcsR0FBRztZQUNuQixJQUFJLENBQUNDLGtCQUFrQixHQUFHO1lBQzFCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUc7UUFDNUI7SUFDRjtBQUNGO0FBRUFqQixRQUFRNEIsUUFBUSxDQUFFLDZCQUE2QjFCO0FBRS9DLGVBQWVBLDBCQUEwQiJ9