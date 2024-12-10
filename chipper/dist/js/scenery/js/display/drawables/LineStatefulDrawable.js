// Copyright 2016-2022, University of Colorado Boulder
/**
 * A trait for drawables for Line that need to store state about what the current display is currently showing,
 * so that updates to the Line will only be made on attributes that specifically changed (and no change will be
 * necessary for an attribute that changed back to its original/currently-displayed value). Generally, this is used
 * for DOM and SVG drawables.
 *
 * This will also mix in PaintableStatefulDrawable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatefulDrawable, scenery, SelfDrawable } from '../../imports.js';
const LineStatefulDrawable = memoize((type)=>{
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
            this.dirtyX1 = true;
            this.dirtyY1 = true;
            this.dirtyX2 = true;
            this.dirtyY2 = true;
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
     */ markDirtyLine() {
            this.dirtyX1 = true;
            this.dirtyY1 = true;
            this.dirtyX2 = true;
            this.dirtyY2 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyP1() {
            this.dirtyX1 = true;
            this.dirtyY1 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyP2() {
            this.dirtyX2 = true;
            this.dirtyY2 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyX1() {
            this.dirtyX1 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyY1() {
            this.dirtyY1 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyX2() {
            this.dirtyX2 = true;
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyY2() {
            this.dirtyY2 = true;
            this.markPaintDirty();
        }
        /**
     * Clears all of the dirty flags (after they have been checked), so that future mark* methods will be able to flag them again.
     * @public
     */ setToCleanState() {
            this.paintDirty = false;
            this.dirtyX1 = false;
            this.dirtyY1 = false;
            this.dirtyX2 = false;
            this.dirtyY2 = false;
        }
    };
});
scenery.register('LineStatefulDrawable', LineStatefulDrawable);
export default LineStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvTGluZVN0YXRlZnVsRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBMaW5lIHRoYXQgbmVlZCB0byBzdG9yZSBzdGF0ZSBhYm91dCB3aGF0IHRoZSBjdXJyZW50IGRpc3BsYXkgaXMgY3VycmVudGx5IHNob3dpbmcsXG4gKiBzbyB0aGF0IHVwZGF0ZXMgdG8gdGhlIExpbmUgd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseSBjaGFuZ2VkIChhbmQgbm8gY2hhbmdlIHdpbGwgYmVcbiAqIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkIHZhbHVlKS4gR2VuZXJhbGx5LCB0aGlzIGlzIHVzZWRcbiAqIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogVGhpcyB3aWxsIGFsc28gbWl4IGluIFBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGVcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGluaGVyaXRhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9pbmhlcml0YW5jZS5qcyc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XG5pbXBvcnQgeyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBTZWxmRHJhd2FibGUgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3QgTGluZVN0YXRlZnVsRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggaW5oZXJpdGFuY2UoIHR5cGUgKSwgU2VsZkRyYXdhYmxlICkgKTtcblxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlKCB0eXBlICkge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eVgxID0gdHJ1ZTtcbiAgICAgIHRoaXMuZGlydHlZMSA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WDIgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eVkyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcbiAgICAgKiBpbmZvcm1hdGlvbi4gVGhpcyBjYW4gYmUgdXNlZCBieSBvdGhlciBtYXJrKiBtZXRob2RzLCBvciBkaXJlY3RseSBpdHNlbGYgaWYgdGhlIHBhaW50RGlydHkgZmxhZyBpcyBjaGVja2VkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEl0IHNob3VsZCBiZSBmaXJlZCAoaW5kaXJlY3RseSBvciBkaXJlY3RseSkgZm9yIGFueXRoaW5nIGJlc2lkZXMgdHJhbnNmb3JtcyB0aGF0IG5lZWRzIHRvIG1ha2UgYSBkcmF3YWJsZVxuICAgICAqIGRpcnR5LlxuICAgICAqL1xuICAgIG1hcmtQYWludERpcnR5KCkge1xuICAgICAgdGhpcy5wYWludERpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUxpbmUoKSB7XG4gICAgICB0aGlzLmRpcnR5WDEgPSB0cnVlO1xuICAgICAgdGhpcy5kaXJ0eVkxID0gdHJ1ZTtcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WTIgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlQMSgpIHtcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WTEgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlQMigpIHtcbiAgICAgIHRoaXMuZGlydHlYMiA9IHRydWU7XG4gICAgICB0aGlzLmRpcnR5WTIgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlYMSgpIHtcbiAgICAgIHRoaXMuZGlydHlYMSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVkxKCkge1xuICAgICAgdGhpcy5kaXJ0eVkxID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5WDIoKSB7XG4gICAgICB0aGlzLmRpcnR5WDIgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlZMigpIHtcbiAgICAgIHRoaXMuZGlydHlZMiA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3MgKGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGNoZWNrZWQpLCBzbyB0aGF0IGZ1dHVyZSBtYXJrKiBtZXRob2RzIHdpbGwgYmUgYWJsZSB0byBmbGFnIHRoZW0gYWdhaW4uXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHNldFRvQ2xlYW5TdGF0ZSgpIHtcbiAgICAgIHRoaXMucGFpbnREaXJ0eSA9IGZhbHNlO1xuICAgICAgdGhpcy5kaXJ0eVgxID0gZmFsc2U7XG4gICAgICB0aGlzLmRpcnR5WTEgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlYMiA9IGZhbHNlO1xuICAgICAgdGhpcy5kaXJ0eVkyID0gZmFsc2U7XG4gICAgfVxuICB9O1xufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGluZVN0YXRlZnVsRHJhd2FibGUnLCBMaW5lU3RhdGVmdWxEcmF3YWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgTGluZVN0YXRlZnVsRHJhd2FibGU7Il0sIm5hbWVzIjpbImluaGVyaXRhbmNlIiwibWVtb2l6ZSIsIlBhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiTGluZVN0YXRlZnVsRHJhd2FibGUiLCJ0eXBlIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJhcmdzIiwicGFpbnREaXJ0eSIsImRpcnR5WDEiLCJkaXJ0eVkxIiwiZGlydHlYMiIsImRpcnR5WTIiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eSIsIm1hcmtEaXJ0eUxpbmUiLCJtYXJrRGlydHlQMSIsIm1hcmtEaXJ0eVAyIiwibWFya0RpcnR5WDEiLCJtYXJrRGlydHlZMSIsIm1hcmtEaXJ0eVgyIiwibWFya0RpcnR5WTIiLCJzZXRUb0NsZWFuU3RhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUVwRixNQUFNQyx1QkFBdUJKLFFBQVNLLENBQUFBO0lBQ3BDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVULFlBQWFNLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0YsMEJBQTJCSTtRQUM5Qzs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsMklBQTJJO1lBQzNJLGdFQUFnRTtZQUNoRSxJQUFJLENBQUNDLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLE9BQU8sR0FBRztZQUNmLElBQUksQ0FBQ0MsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDQyxPQUFPLEdBQUc7WUFDZixJQUFJLENBQUNDLE9BQU8sR0FBRztRQUNqQjtRQUVBOzs7Ozs7O0tBT0MsR0FDREMsaUJBQWlCO1lBQ2YsSUFBSSxDQUFDTCxVQUFVLEdBQUc7WUFDbEIsSUFBSSxDQUFDTSxTQUFTO1FBQ2hCO1FBRUE7O0tBRUMsR0FDREMsZ0JBQWdCO1lBQ2QsSUFBSSxDQUFDTixPQUFPLEdBQUc7WUFDZixJQUFJLENBQUNDLE9BQU8sR0FBRztZQUNmLElBQUksQ0FBQ0MsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDQyxPQUFPLEdBQUc7WUFDZixJQUFJLENBQUNDLGNBQWM7UUFDckI7UUFFQTs7S0FFQyxHQUNERyxjQUFjO1lBQ1osSUFBSSxDQUFDUCxPQUFPLEdBQUc7WUFDZixJQUFJLENBQUNDLE9BQU8sR0FBRztZQUNmLElBQUksQ0FBQ0csY0FBYztRQUNyQjtRQUVBOztLQUVDLEdBQ0RJLGNBQWM7WUFDWixJQUFJLENBQUNOLE9BQU8sR0FBRztZQUNmLElBQUksQ0FBQ0MsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDQyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREssY0FBYztZQUNaLElBQUksQ0FBQ1QsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDSSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDRE0sY0FBYztZQUNaLElBQUksQ0FBQ1QsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDRyxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDRE8sY0FBYztZQUNaLElBQUksQ0FBQ1QsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDRSxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDRFEsY0FBYztZQUNaLElBQUksQ0FBQ1QsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDQyxjQUFjO1FBQ3JCO1FBRUE7OztLQUdDLEdBQ0RTLGtCQUFrQjtZQUNoQixJQUFJLENBQUNkLFVBQVUsR0FBRztZQUNsQixJQUFJLENBQUNDLE9BQU8sR0FBRztZQUNmLElBQUksQ0FBQ0MsT0FBTyxHQUFHO1lBQ2YsSUFBSSxDQUFDQyxPQUFPLEdBQUc7WUFDZixJQUFJLENBQUNDLE9BQU8sR0FBRztRQUNqQjtJQUNGO0FBQ0Y7QUFFQWYsUUFBUTBCLFFBQVEsQ0FBRSx3QkFBd0J4QjtBQUMxQyxlQUFlQSxxQkFBcUIifQ==