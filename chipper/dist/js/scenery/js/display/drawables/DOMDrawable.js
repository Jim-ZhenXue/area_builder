// Copyright 2016-2022, University of Colorado Boulder
/**
 * DOM renderer for DOM nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { DOMSelfDrawable, scenery, Utils } from '../../imports.js';
let DOMDrawable = class DOMDrawable extends DOMSelfDrawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @public {HTMLElement} - Our primary DOM element. This is exposed as part of the DOMSelfDrawable API.
        this.domElement = this.node._container;
    }
    /**
   * Updates our DOM element so that its appearance matches our node's representation.
   * @protected
   *
   * This implements part of the DOMSelfDrawable required API for subtypes.
   */ updateDOM() {
        if (this.transformDirty && !this.node._preventTransform) {
            Utils.applyPreparedTransform(this.getTransformMatrix(), this.domElement);
        }
        // clear all of the dirty flags
        this.transformDirty = false;
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        super.dispose();
        this.domElement = null;
    }
    /**
   * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
   * @param {Instance} instance
   */ constructor(renderer, instance){
        super(renderer, instance);
        // Apply CSS needed for future CSS transforms to work properly.
        Utils.prepareForTransform(this.domElement);
    }
};
scenery.register('DOMDrawable', DOMDrawable);
Poolable.mixInto(DOMDrawable);
export default DOMDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvRE9NRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRE9NIHJlbmRlcmVyIGZvciBET00gbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgRE9NU2VsZkRyYXdhYmxlLCBzY2VuZXJ5LCBVdGlscyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBET01EcmF3YWJsZSBleHRlbmRzIERPTVNlbGZEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXIgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIncyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcblxuICAgIC8vIEFwcGx5IENTUyBuZWVkZWQgZm9yIGZ1dHVyZSBDU1MgdHJhbnNmb3JtcyB0byB3b3JrIHByb3Blcmx5LlxuICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHRoaXMuZG9tRWxlbWVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuXG4gICAgLy8gQHB1YmxpYyB7SFRNTEVsZW1lbnR9IC0gT3VyIHByaW1hcnkgRE9NIGVsZW1lbnQuIFRoaXMgaXMgZXhwb3NlZCBhcyBwYXJ0IG9mIHRoZSBET01TZWxmRHJhd2FibGUgQVBJLlxuICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMubm9kZS5fY29udGFpbmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgb3VyIERPTSBlbGVtZW50IHNvIHRoYXQgaXRzIGFwcGVhcmFuY2UgbWF0Y2hlcyBvdXIgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIFRoaXMgaW1wbGVtZW50cyBwYXJ0IG9mIHRoZSBET01TZWxmRHJhd2FibGUgcmVxdWlyZWQgQVBJIGZvciBzdWJ0eXBlcy5cbiAgICovXG4gIHVwZGF0ZURPTSgpIHtcbiAgICBpZiAoIHRoaXMudHJhbnNmb3JtRGlydHkgJiYgIXRoaXMubm9kZS5fcHJldmVudFRyYW5zZm9ybSApIHtcbiAgICAgIFV0aWxzLmFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oIHRoaXMuZ2V0VHJhbnNmb3JtTWF0cml4KCksIHRoaXMuZG9tRWxlbWVudCApO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3NcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLmRvbUVsZW1lbnQgPSBudWxsO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdET01EcmF3YWJsZScsIERPTURyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIERPTURyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IERPTURyYXdhYmxlOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIkRPTVNlbGZEcmF3YWJsZSIsInNjZW5lcnkiLCJVdGlscyIsIkRPTURyYXdhYmxlIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJkb21FbGVtZW50Iiwibm9kZSIsIl9jb250YWluZXIiLCJ1cGRhdGVET00iLCJ0cmFuc2Zvcm1EaXJ0eSIsIl9wcmV2ZW50VHJhbnNmb3JtIiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsImdldFRyYW5zZm9ybU1hdHJpeCIsImRpc3Bvc2UiLCJjb25zdHJ1Y3RvciIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLEtBQUssUUFBUSxtQkFBbUI7QUFFbkUsSUFBQSxBQUFNQyxjQUFOLE1BQU1BLG9CQUFvQkg7SUFZeEI7Ozs7OztHQU1DLEdBQ0RJLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO1FBQy9CLEtBQUssQ0FBQ0YsV0FBWUMsVUFBVUM7UUFFNUIsdUdBQXVHO1FBQ3ZHLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxVQUFVO0lBQ3hDO0lBRUE7Ozs7O0dBS0MsR0FDREMsWUFBWTtRQUNWLElBQUssSUFBSSxDQUFDQyxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUNILElBQUksQ0FBQ0ksaUJBQWlCLEVBQUc7WUFDekRWLE1BQU1XLHNCQUFzQixDQUFFLElBQUksQ0FBQ0Msa0JBQWtCLElBQUksSUFBSSxDQUFDUCxVQUFVO1FBQzFFO1FBRUEsK0JBQStCO1FBQy9CLElBQUksQ0FBQ0ksY0FBYyxHQUFHO0lBQ3hCO0lBRUE7Ozs7R0FJQyxHQUNESSxVQUFVO1FBQ1IsS0FBSyxDQUFDQTtRQUVOLElBQUksQ0FBQ1IsVUFBVSxHQUFHO0lBQ3BCO0lBakRBOzs7R0FHQyxHQUNEUyxZQUFhWCxRQUFRLEVBQUVDLFFBQVEsQ0FBRztRQUNoQyxLQUFLLENBQUVELFVBQVVDO1FBRWpCLCtEQUErRDtRQUMvREosTUFBTWUsbUJBQW1CLENBQUUsSUFBSSxDQUFDVixVQUFVO0lBQzVDO0FBeUNGO0FBRUFOLFFBQVFpQixRQUFRLENBQUUsZUFBZWY7QUFFakNKLFNBQVNvQixPQUFPLENBQUVoQjtBQUVsQixlQUFlQSxZQUFZIn0=