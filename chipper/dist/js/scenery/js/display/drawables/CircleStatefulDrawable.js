// Copyright 2016-2022, University of Colorado Boulder
/**
 * A trait for drawables for Circle that need to store state about what the current display is currently showing,
 * so that updates to the Circle will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This trait also mixes PaintableStatefulDrawable.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const CircleStatefulDrawable = memoize((type)=>{
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
            // @protected {boolean} - Whether the radius has changed since our last update.
            this.dirtyRadius = true;
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
     * Called when the radius of the circle changes.
     * @public
     */ markDirtyRadius() {
            this.dirtyRadius = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyRadius = false;
        }
    };
});
scenery.register('CircleStatefulDrawable', CircleStatefulDrawable);
export default CircleStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHRyYWl0IGZvciBkcmF3YWJsZXMgZm9yIENpcmNsZSB0aGF0IG5lZWQgdG8gc3RvcmUgc3RhdGUgYWJvdXQgd2hhdCB0aGUgY3VycmVudCBkaXNwbGF5IGlzIGN1cnJlbnRseSBzaG93aW5nLFxuICogc28gdGhhdCB1cGRhdGVzIHRvIHRoZSBDaXJjbGUgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogVGhpcyB0cmFpdCBhbHNvIG1peGVzIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IENpcmNsZVN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggaW5oZXJpdGFuY2UoIHR5cGUgKSwgU2VsZkRyYXdhYmxlICkgKTtcblxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlKCB0eXBlICkge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHJhZGl1cyBoYXMgY2hhbmdlZCBzaW5jZSBvdXIgbGFzdCB1cGRhdGUuXG4gICAgICB0aGlzLmRpcnR5UmFkaXVzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcbiAgICAgKiBpbmZvcm1hdGlvbi4gVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBtYXJrKiBtZXRob2RzLCBvciBkaXJlY3RseSBpdHNlbGYgaWYgdGhlIHBhaW50RGlydHkgZmxhZyBpcyBjaGVja2VkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEl0IHNob3VsZCBiZSBmaXJlZCAoaW5kaXJlY3RseSBvciBkaXJlY3RseSkgZm9yIGFueXRoaW5nIGJlc2lkZXMgdHJhbnNmb3JtcyB0aGF0IG5lZWRzIHRvIG1ha2UgYSBkcmF3YWJsZVxuICAgICAqIGRpcnR5LlxuICAgICAqL1xuICAgIG1hcmtQYWludERpcnR5KCkge1xuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIHJhZGl1cyBvZiB0aGUgY2lyY2xlIGNoYW5nZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVJhZGl1cygpIHtcbiAgICAgIHRoaXMuZGlydHlSYWRpdXMgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFycyBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzIChhZnRlciB0aGV5IGhhdmUgYmVlbiBjaGVja2VkKSwgc28gdGhhdCBmdXR1cmUgbWFyayogbWV0aG9kcyB3aWxsIGJlIGFibGUgdG8gZmxhZyB0aGVtIGFnYWluLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzZXRUb0NsZWFuU3RhdGUoKSB7XG4gICAgICB0aGlzLnBhaW50RGlydHkgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlSYWRpdXMgPSBmYWxzZTtcbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDaXJjbGVTdGF0ZWZ1bERyYXdhYmxlJywgQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBDaXJjbGVTdGF0ZWZ1bERyYXdhYmxlOyJdLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIkNpcmNsZVN0YXRlZnVsRHJhd2FibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJhcmdzIiwicGFpbnREaXJ0eSIsImRpcnR5UmFkaXVzIiwibWFya1BhaW50RGlydHkiLCJtYXJrRGlydHkiLCJtYXJrRGlydHlSYWRpdXMiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUVwRixNQUFNQyx5QkFBeUJKLFFBQVNLLENBQUFBO0lBQ3RDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVULFlBQWFNLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0YsMEJBQTJCSTtRQUM5Qzs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsMklBQTJJO1lBQzNJLGdFQUFnRTtZQUNoRSxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUVsQiwrRUFBK0U7WUFDL0UsSUFBSSxDQUFDQyxXQUFXLEdBQUc7UUFDckI7UUFFQTs7Ozs7OztLQU9DLEdBQ0RDLGlCQUFpQjtZQUNmLElBQUksQ0FBQ0YsVUFBVSxHQUFHO1lBQ2xCLElBQUksQ0FBQ0csU0FBUztRQUNoQjtRQUVBOzs7S0FHQyxHQUNEQyxrQkFBa0I7WUFDaEIsSUFBSSxDQUFDSCxXQUFXLEdBQUc7WUFDbkIsSUFBSSxDQUFDQyxjQUFjO1FBQ3JCO1FBRUE7OztLQUdDLEdBQ0RHLGtCQUFrQjtZQUNoQixJQUFJLENBQUNMLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFdBQVcsR0FBRztRQUNyQjtJQUNGO0FBQ0Y7QUFFQVosUUFBUWlCLFFBQVEsQ0FBRSwwQkFBMEJmO0FBRTVDLGVBQWVBLHVCQUF1QiJ9