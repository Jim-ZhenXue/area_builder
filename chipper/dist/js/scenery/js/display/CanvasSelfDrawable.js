// Copyright 2013-2023, University of Colorado Boulder
/**
 * TODO docs https://github.com/phetsims/scenery/issues/1581
 *   note paintCanvas() required, and other implementation-specific details
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, SelfDrawable } from '../imports.js';
let CanvasSelfDrawable = class CanvasSelfDrawable extends SelfDrawable {
    /**
   * @public
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @private {function} - this is the same across lifecycles
        this.transformListener = this.transformListener || this.markTransformDirty.bind(this);
        instance.relativeTransform.addListener(this.transformListener); // when our relative tranform changes, notify us in the pre-repaint phase
        instance.relativeTransform.addPrecompute(); // trigger precomputation of the relative transform, since we will always need it when it is updated
    }
    /**
   * @public
   */ markTransformDirty() {
        this.markDirty();
    }
    /**
   * General flag set on the state, which we forward directly to the drawable's paint flag
   * @public
   */ markPaintDirty() {
        this.markDirty();
    }
    /**
   * @public
   * @override
   */ updateSelfVisibility() {
        super.updateSelfVisibility();
        // mark us as dirty when our self visibility changes
        this.markDirty();
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        this.instance.relativeTransform.removeListener(this.transformListener);
        this.instance.relativeTransform.removePrecompute();
        super.dispose();
    }
};
scenery.register('CanvasSelfDrawable', CanvasSelfDrawable);
export default CanvasSelfDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9DYW52YXNTZWxmRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVE9ETyBkb2NzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKiAgIG5vdGUgcGFpbnRDYW52YXMoKSByZXF1aXJlZCwgYW5kIG90aGVyIGltcGxlbWVudGF0aW9uLXNwZWNpZmljIGRldGFpbHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIENhbnZhc1NlbGZEcmF3YWJsZSBleHRlbmRzIFNlbGZEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIHRoaXMgaXMgdGhlIHNhbWUgYWNyb3NzIGxpZmVjeWNsZXNcbiAgICB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciB8fCB0aGlzLm1hcmtUcmFuc2Zvcm1EaXJ0eS5iaW5kKCB0aGlzICk7XG5cbiAgICBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5hZGRMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApOyAvLyB3aGVuIG91ciByZWxhdGl2ZSB0cmFuZm9ybSBjaGFuZ2VzLCBub3RpZnkgdXMgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlXG4gICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uYWRkUHJlY29tcHV0ZSgpOyAvLyB0cmlnZ2VyIHByZWNvbXB1dGF0aW9uIG9mIHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0sIHNpbmNlIHdlIHdpbGwgYWx3YXlzIG5lZWQgaXQgd2hlbiBpdCBpcyB1cGRhdGVkXG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya1RyYW5zZm9ybURpcnR5KCkge1xuICAgIHRoaXMubWFya0RpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhbCBmbGFnIHNldCBvbiB0aGUgc3RhdGUsIHdoaWNoIHdlIGZvcndhcmQgZGlyZWN0bHkgdG8gdGhlIGRyYXdhYmxlJ3MgcGFpbnQgZmxhZ1xuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrUGFpbnREaXJ0eSgpIHtcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICB1cGRhdGVTZWxmVmlzaWJpbGl0eSgpIHtcbiAgICBzdXBlci51cGRhdGVTZWxmVmlzaWJpbGl0eSgpO1xuXG4gICAgLy8gbWFyayB1cyBhcyBkaXJ0eSB3aGVuIG91ciBzZWxmIHZpc2liaWxpdHkgY2hhbmdlc1xuICAgIHRoaXMubWFya0RpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgdGhpcy5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5yZW1vdmVQcmVjb21wdXRlKCk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0NhbnZhc1NlbGZEcmF3YWJsZScsIENhbnZhc1NlbGZEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBDYW52YXNTZWxmRHJhd2FibGU7Il0sIm5hbWVzIjpbInNjZW5lcnkiLCJTZWxmRHJhd2FibGUiLCJDYW52YXNTZWxmRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInRyYW5zZm9ybUxpc3RlbmVyIiwibWFya1RyYW5zZm9ybURpcnR5IiwiYmluZCIsInJlbGF0aXZlVHJhbnNmb3JtIiwiYWRkTGlzdGVuZXIiLCJhZGRQcmVjb21wdXRlIiwibWFya0RpcnR5IiwibWFya1BhaW50RGlydHkiLCJ1cGRhdGVTZWxmVmlzaWJpbGl0eSIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsInJlbW92ZVByZWNvbXB1dGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsU0FBU0EsT0FBTyxFQUFFQyxZQUFZLFFBQVEsZ0JBQWdCO0FBRXRELElBQUEsQUFBTUMscUJBQU4sTUFBTUEsMkJBQTJCRDtJQUMvQjs7Ozs7R0FLQyxHQUNERSxXQUFZQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztRQUMvQixLQUFLLENBQUNGLFdBQVlDLFVBQVVDO1FBRTVCLDJEQUEyRDtRQUMzRCxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUksQ0FBQ0EsaUJBQWlCLElBQUksSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsSUFBSSxDQUFFLElBQUk7UUFFckZILFNBQVNJLGlCQUFpQixDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDSixpQkFBaUIsR0FBSSx5RUFBeUU7UUFDM0lELFNBQVNJLGlCQUFpQixDQUFDRSxhQUFhLElBQUksb0dBQW9HO0lBQ2xKO0lBRUE7O0dBRUMsR0FDREoscUJBQXFCO1FBQ25CLElBQUksQ0FBQ0ssU0FBUztJQUNoQjtJQUVBOzs7R0FHQyxHQUNEQyxpQkFBaUI7UUFDZixJQUFJLENBQUNELFNBQVM7SUFDaEI7SUFFQTs7O0dBR0MsR0FDREUsdUJBQXVCO1FBQ3JCLEtBQUssQ0FBQ0E7UUFFTixvREFBb0Q7UUFDcEQsSUFBSSxDQUFDRixTQUFTO0lBQ2hCO0lBRUE7Ozs7R0FJQyxHQUNERyxVQUFVO1FBQ1IsSUFBSSxDQUFDVixRQUFRLENBQUNJLGlCQUFpQixDQUFDTyxjQUFjLENBQUUsSUFBSSxDQUFDVixpQkFBaUI7UUFDdEUsSUFBSSxDQUFDRCxRQUFRLENBQUNJLGlCQUFpQixDQUFDUSxnQkFBZ0I7UUFFaEQsS0FBSyxDQUFDRjtJQUNSO0FBQ0Y7QUFFQWYsUUFBUWtCLFFBQVEsQ0FBRSxzQkFBc0JoQjtBQUV4QyxlQUFlQSxtQkFBbUIifQ==