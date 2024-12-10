// Copyright 2013-2023, University of Colorado Boulder
/**
 * DOM drawable for a single painted node.
 *
 * Subtypes should expose the following API that is used by DOMSelfDrawable:
 * - drawable.domElement {HTMLElement} - The primary DOM element that will get transformed and added.
 * - drawable.updateDOM() {function} - Called with no arguments in order to update the domElement's view.
 *
 * TODO: make abstract subtype methods for improved documentation https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, SelfDrawable } from '../imports.js';
let DOMSelfDrawable = class DOMSelfDrawable extends SelfDrawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   * @returns {DOMSelfDrawable}
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @private {function} - this is the same across lifecycles
        this.transformListener = this.transformListener || this.markTransformDirty.bind(this);
        this.markTransformDirty();
        // @private {boolean}
        this.visibilityDirty = true;
        // handle transform changes
        instance.relativeTransform.addListener(this.transformListener); // when our relative tranform changes, notify us in the pre-repaint phase
        instance.relativeTransform.addPrecompute(); // trigger precomputation of the relative transform, since we will always need it when it is updated
        return this;
    }
    /**
   * @public
   */ markTransformDirty() {
        // update the visual state available to updateDOM, so that it will update the transform (Text needs to change the transform, so it is included)
        this.transformDirty = true;
        this.markDirty();
    }
    /**
   * @public
   *
   * Called from the Node, probably during updateDOM
   *
   * @returns {Matrix3}
   */ getTransformMatrix() {
        this.instance.relativeTransform.validate();
        return this.instance.relativeTransform.matrix;
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
        this.updateDOM();
        if (this.visibilityDirty) {
            this.visibilityDirty = false;
            this.domElement.style.visibility = this.visible ? '' : 'hidden';
        }
        this.cleanPaintableState && this.cleanPaintableState();
        return true;
    }
    /**
   * Called to update the visual appearance of our domElement
   * @protected
   * @abstract
   */ updateDOM() {
    // should generally be overridden by drawable subtypes to implement the update
    }
    /**
   * @public
   * @override
   */ updateSelfVisibility() {
        super.updateSelfVisibility();
        if (!this.visibilityDirty) {
            this.visibilityDirty = true;
            this.markDirty();
        }
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        this.instance.relativeTransform.removeListener(this.transformListener);
        this.instance.relativeTransform.removePrecompute();
        // super call
        super.dispose();
    }
};
scenery.register('DOMSelfDrawable', DOMSelfDrawable);
export default DOMSelfDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9ET01TZWxmRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRE9NIGRyYXdhYmxlIGZvciBhIHNpbmdsZSBwYWludGVkIG5vZGUuXG4gKlxuICogU3VidHlwZXMgc2hvdWxkIGV4cG9zZSB0aGUgZm9sbG93aW5nIEFQSSB0aGF0IGlzIHVzZWQgYnkgRE9NU2VsZkRyYXdhYmxlOlxuICogLSBkcmF3YWJsZS5kb21FbGVtZW50IHtIVE1MRWxlbWVudH0gLSBUaGUgcHJpbWFyeSBET00gZWxlbWVudCB0aGF0IHdpbGwgZ2V0IHRyYW5zZm9ybWVkIGFuZCBhZGRlZC5cbiAqIC0gZHJhd2FibGUudXBkYXRlRE9NKCkge2Z1bmN0aW9ufSAtIENhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cyBpbiBvcmRlciB0byB1cGRhdGUgdGhlIGRvbUVsZW1lbnQncyB2aWV3LlxuICpcbiAqIFRPRE86IG1ha2UgYWJzdHJhY3Qgc3VidHlwZSBtZXRob2RzIGZvciBpbXByb3ZlZCBkb2N1bWVudGF0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBET01TZWxmRHJhd2FibGUgZXh0ZW5kcyBTZWxmRHJhd2FibGUge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtET01TZWxmRHJhd2FibGV9XG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gdGhpcyBpcyB0aGUgc2FtZSBhY3Jvc3MgbGlmZWN5Y2xlc1xuICAgIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyIHx8IHRoaXMubWFya1RyYW5zZm9ybURpcnR5LmJpbmQoIHRoaXMgKTtcblxuICAgIHRoaXMubWFya1RyYW5zZm9ybURpcnR5KCk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7XG5cbiAgICAvLyBoYW5kbGUgdHJhbnNmb3JtIGNoYW5nZXNcbiAgICBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5hZGRMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApOyAvLyB3aGVuIG91ciByZWxhdGl2ZSB0cmFuZm9ybSBjaGFuZ2VzLCBub3RpZnkgdXMgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlXG4gICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uYWRkUHJlY29tcHV0ZSgpOyAvLyB0cmlnZ2VyIHByZWNvbXB1dGF0aW9uIG9mIHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0sIHNpbmNlIHdlIHdpbGwgYWx3YXlzIG5lZWQgaXQgd2hlbiBpdCBpcyB1cGRhdGVkXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrVHJhbnNmb3JtRGlydHkoKSB7XG4gICAgLy8gdXBkYXRlIHRoZSB2aXN1YWwgc3RhdGUgYXZhaWxhYmxlIHRvIHVwZGF0ZURPTSwgc28gdGhhdCBpdCB3aWxsIHVwZGF0ZSB0aGUgdHJhbnNmb3JtIChUZXh0IG5lZWRzIHRvIGNoYW5nZSB0aGUgdHJhbnNmb3JtLCBzbyBpdCBpcyBpbmNsdWRlZClcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcblxuICAgIHRoaXMubWFya0RpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBDYWxsZWQgZnJvbSB0aGUgTm9kZSwgcHJvYmFibHkgZHVyaW5nIHVwZGF0ZURPTVxuICAgKlxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cbiAgICovXG4gIGdldFRyYW5zZm9ybU1hdHJpeCgpIHtcbiAgICB0aGlzLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLnZhbGlkYXRlKCk7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgdXBkYXRlIHNob3VsZCBjb250aW51ZSAoaWYgZmFsc2UsIGZ1cnRoZXIgdXBkYXRlcyBpbiBzdXBlcnR5cGUgc3RlcHMgc2hvdWxkIG5vdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICAvLyBTZWUgaWYgd2UgbmVlZCB0byBhY3R1YWxseSB1cGRhdGUgdGhpbmdzICh3aWxsIGJhaWwgb3V0IGlmIHdlIGFyZSBub3QgZGlydHksIG9yIGlmIHdlJ3ZlIGJlZW4gZGlzcG9zZWQpXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVET00oKTtcblxuICAgIGlmICggdGhpcy52aXNpYmlsaXR5RGlydHkgKSB7XG4gICAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IGZhbHNlO1xuXG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9IHRoaXMudmlzaWJsZSA/ICcnIDogJ2hpZGRlbic7XG4gICAgfVxuXG4gICAgdGhpcy5jbGVhblBhaW50YWJsZVN0YXRlICYmIHRoaXMuY2xlYW5QYWludGFibGVTdGF0ZSgpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHRvIHVwZGF0ZSB0aGUgdmlzdWFsIGFwcGVhcmFuY2Ugb2Ygb3VyIGRvbUVsZW1lbnRcbiAgICogQHByb3RlY3RlZFxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIHVwZGF0ZURPTSgpIHtcbiAgICAvLyBzaG91bGQgZ2VuZXJhbGx5IGJlIG92ZXJyaWRkZW4gYnkgZHJhd2FibGUgc3VidHlwZXMgdG8gaW1wbGVtZW50IHRoZSB1cGRhdGVcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgdXBkYXRlU2VsZlZpc2liaWxpdHkoKSB7XG4gICAgc3VwZXIudXBkYXRlU2VsZlZpc2liaWxpdHkoKTtcblxuICAgIGlmICggIXRoaXMudmlzaWJpbGl0eURpcnR5ICkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgdGhpcy5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5yZW1vdmVQcmVjb21wdXRlKCk7XG5cbiAgICAvLyBzdXBlciBjYWxsXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdET01TZWxmRHJhd2FibGUnLCBET01TZWxmRHJhd2FibGUgKTtcbmV4cG9ydCBkZWZhdWx0IERPTVNlbGZEcmF3YWJsZTsiXSwibmFtZXMiOlsic2NlbmVyeSIsIlNlbGZEcmF3YWJsZSIsIkRPTVNlbGZEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwidHJhbnNmb3JtTGlzdGVuZXIiLCJtYXJrVHJhbnNmb3JtRGlydHkiLCJiaW5kIiwidmlzaWJpbGl0eURpcnR5IiwicmVsYXRpdmVUcmFuc2Zvcm0iLCJhZGRMaXN0ZW5lciIsImFkZFByZWNvbXB1dGUiLCJ0cmFuc2Zvcm1EaXJ0eSIsIm1hcmtEaXJ0eSIsImdldFRyYW5zZm9ybU1hdHJpeCIsInZhbGlkYXRlIiwibWF0cml4IiwidXBkYXRlIiwidXBkYXRlRE9NIiwiZG9tRWxlbWVudCIsInN0eWxlIiwidmlzaWJpbGl0eSIsInZpc2libGUiLCJjbGVhblBhaW50YWJsZVN0YXRlIiwidXBkYXRlU2VsZlZpc2liaWxpdHkiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVQcmVjb21wdXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7OztDQVVDLEdBRUQsU0FBU0EsT0FBTyxFQUFFQyxZQUFZLFFBQVEsZ0JBQWdCO0FBRXRELElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCRDtJQUM1Qjs7Ozs7OztHQU9DLEdBQ0RFLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO1FBQy9CLEtBQUssQ0FBQ0YsV0FBWUMsVUFBVUM7UUFFNUIsMkRBQTJEO1FBQzNELElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsSUFBSSxDQUFDQSxpQkFBaUIsSUFBSSxJQUFJLENBQUNDLGtCQUFrQixDQUFDQyxJQUFJLENBQUUsSUFBSTtRQUVyRixJQUFJLENBQUNELGtCQUFrQjtRQUV2QixxQkFBcUI7UUFDckIsSUFBSSxDQUFDRSxlQUFlLEdBQUc7UUFFdkIsMkJBQTJCO1FBQzNCSixTQUFTSyxpQkFBaUIsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0wsaUJBQWlCLEdBQUkseUVBQXlFO1FBQzNJRCxTQUFTSyxpQkFBaUIsQ0FBQ0UsYUFBYSxJQUFJLG9HQUFvRztRQUVoSixPQUFPLElBQUk7SUFDYjtJQUVBOztHQUVDLEdBQ0RMLHFCQUFxQjtRQUNuQiwrSUFBK0k7UUFDL0ksSUFBSSxDQUFDTSxjQUFjLEdBQUc7UUFFdEIsSUFBSSxDQUFDQyxTQUFTO0lBQ2hCO0lBRUE7Ozs7OztHQU1DLEdBQ0RDLHFCQUFxQjtRQUNuQixJQUFJLENBQUNWLFFBQVEsQ0FBQ0ssaUJBQWlCLENBQUNNLFFBQVE7UUFDeEMsT0FBTyxJQUFJLENBQUNYLFFBQVEsQ0FBQ0ssaUJBQWlCLENBQUNPLE1BQU07SUFDL0M7SUFFQTs7Ozs7OztHQU9DLEdBQ0RDLFNBQVM7UUFDUCwwR0FBMEc7UUFDMUcsSUFBSyxDQUFDLEtBQUssQ0FBQ0EsVUFBVztZQUNyQixPQUFPO1FBQ1Q7UUFFQSxJQUFJLENBQUNDLFNBQVM7UUFFZCxJQUFLLElBQUksQ0FBQ1YsZUFBZSxFQUFHO1lBQzFCLElBQUksQ0FBQ0EsZUFBZSxHQUFHO1lBRXZCLElBQUksQ0FBQ1csVUFBVSxDQUFDQyxLQUFLLENBQUNDLFVBQVUsR0FBRyxJQUFJLENBQUNDLE9BQU8sR0FBRyxLQUFLO1FBQ3pEO1FBRUEsSUFBSSxDQUFDQyxtQkFBbUIsSUFBSSxJQUFJLENBQUNBLG1CQUFtQjtRQUVwRCxPQUFPO0lBQ1Q7SUFFQTs7OztHQUlDLEdBQ0RMLFlBQVk7SUFDViw4RUFBOEU7SUFDaEY7SUFFQTs7O0dBR0MsR0FDRE0sdUJBQXVCO1FBQ3JCLEtBQUssQ0FBQ0E7UUFFTixJQUFLLENBQUMsSUFBSSxDQUFDaEIsZUFBZSxFQUFHO1lBQzNCLElBQUksQ0FBQ0EsZUFBZSxHQUFHO1lBQ3ZCLElBQUksQ0FBQ0ssU0FBUztRQUNoQjtJQUNGO0lBRUE7Ozs7R0FJQyxHQUNEWSxVQUFVO1FBQ1IsSUFBSSxDQUFDckIsUUFBUSxDQUFDSyxpQkFBaUIsQ0FBQ2lCLGNBQWMsQ0FBRSxJQUFJLENBQUNyQixpQkFBaUI7UUFDdEUsSUFBSSxDQUFDRCxRQUFRLENBQUNLLGlCQUFpQixDQUFDa0IsZ0JBQWdCO1FBRWhELGFBQWE7UUFDYixLQUFLLENBQUNGO0lBQ1I7QUFDRjtBQUVBMUIsUUFBUTZCLFFBQVEsQ0FBRSxtQkFBbUIzQjtBQUNyQyxlQUFlQSxnQkFBZ0IifQ==