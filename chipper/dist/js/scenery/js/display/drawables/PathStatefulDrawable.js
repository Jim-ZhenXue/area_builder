// Copyright 2016-2022, University of Colorado Boulder
/**
 * A trait for drawables for Path that need to store state about what the current display is currently showing,
 * so that updates to the Path will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const PathStatefulDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends PaintableStatefulDrawable(type) {
        /**
     * @public
     * @override
     *
     * @param {number} renderer
     * @param {Instance} instance
     */ initialize(renderer, instance, ...args) {
            super.initialize(renderer, instance, ...args);
            // @protected {boolean} - Flag marked as true if ANY of the drawable dirty flags are set (basically everything except for transforms, as we
            //                        need to accelerate the transform case.
            this.paintDirty = true;
            this.dirtyShape = true;
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
     */ markDirtyShape() {
            this.dirtyShape = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyShape = false;
        }
    };
});
scenery.register('PathStatefulDrawable', PathStatefulDrawable);
export default PathStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUGF0aFN0YXRlZnVsRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBQYXRoIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXG4gKiBzbyB0aGF0IHVwZGF0ZXMgdG8gdGhlIFBhdGggd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogVGhpcyB3aWxsIG1peCBpbiBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IFBhdGhTdGF0ZWZ1bERyYXdhYmxlID0gbWVtb2l6ZSggdHlwZSA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XG5cbiAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSggdHlwZSApIHtcbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICogQG92ZXJyaWRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eVNoYXBlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcbiAgICAgKiBpbmZvcm1hdGlvbi4gVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBtYXJrKiBtZXRob2RzLCBvciBkaXJlY3RseSBpdHNlbGYgaWYgdGhlIHBhaW50RGlydHkgZmxhZyBpcyBjaGVja2VkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEl0IHNob3VsZCBiZSBmaXJlZCAoaW5kaXJlY3RseSBvciBkaXJlY3RseSkgZm9yIGFueXRoaW5nIGJlc2lkZXMgdHJhbnNmb3JtcyB0aGF0IG5lZWRzIHRvIG1ha2UgYSBkcmF3YWJsZVxuICAgICAqIGRpcnR5LlxuICAgICAqL1xuICAgIG1hcmtQYWludERpcnR5KCkge1xuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVNoYXBlKCkge1xuICAgICAgdGhpcy5kaXJ0eVNoYXBlID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYWxsIG9mIHRoZSBkaXJ0eSBmbGFncyAoYWZ0ZXIgdGhleSBoYXZlIGJlZW4gY2hlY2tlZCksIHNvIHRoYXQgZnV0dXJlIG1hcmsqIG1ldGhvZHMgd2lsbCBiZSBhYmxlIHRvIGZsYWcgdGhlbSBhZ2Fpbi5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgc2V0VG9DbGVhblN0YXRlKCkge1xuICAgICAgdGhpcy5wYWludERpcnR5ID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5U2hhcGUgPSBmYWxzZTtcbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoU3RhdGVmdWxEcmF3YWJsZScsIFBhdGhTdGF0ZWZ1bERyYXdhYmxlICk7XG5leHBvcnQgZGVmYXVsdCBQYXRoU3RhdGVmdWxEcmF3YWJsZTsiXSwibmFtZXMiOlsiaW5oZXJpdGFuY2UiLCJtZW1vaXplIiwiUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSIsInNjZW5lcnkiLCJTZWxmRHJhd2FibGUiLCJQYXRoU3RhdGVmdWxEcmF3YWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImFyZ3MiLCJwYWludERpcnR5IiwiZGlydHlTaGFwZSIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5IiwibWFya0RpcnR5U2hhcGUiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUVwRixNQUFNQyx1QkFBdUJKLFFBQVNLLENBQUFBO0lBQ3BDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVULFlBQWFNLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0YsMEJBQTJCSTtRQUM5Qzs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsMklBQTJJO1lBQzNJLGdFQUFnRTtZQUNoRSxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFVBQVUsR0FBRztRQUNwQjtRQUVBOzs7Ozs7O0tBT0MsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDRixVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDRyxTQUFTO1FBQ2hCO1FBRUE7O0tBRUMsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDSCxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDQyxjQUFjO1FBQ3JCO1FBRUE7OztLQUdDLEdBQ0RHLGtCQUFrQjtZQUNoQixJQUFJLENBQUNMLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLFVBQVUsR0FBRztRQUNwQjtJQUNGO0FBQ0Y7QUFFQVosUUFBUWlCLFFBQVEsQ0FBRSx3QkFBd0JmO0FBQzFDLGVBQWVBLHFCQUFxQiJ9