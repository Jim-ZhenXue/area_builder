// Copyright 2013-2021, University of Colorado Boulder
/**
 * Supertype for WebGL drawables that display a specific Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { scenery, SelfDrawable } from '../imports.js';
let WebGLSelfDrawable = class WebGLSelfDrawable extends SelfDrawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   * @returns {WebGLSelfDrawable}
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @private {function} - this is the same across lifecycles
        this.transformListener = this.transformListener || this.markTransformDirty.bind(this);
        // when our relative transform changes, notify us in the pre-repaint phase
        instance.relativeTransform.addListener(this.transformListener);
        // trigger precomputation of the relative transform, since we will always need it when it is updated
        instance.relativeTransform.addPrecompute();
        return this;
    }
    /**
   * @public
   */ markTransformDirty() {
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
scenery.register('WebGLSelfDrawable', WebGLSelfDrawable);
export default WebGLSelfDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9XZWJHTFNlbGZEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdXBlcnR5cGUgZm9yIFdlYkdMIGRyYXdhYmxlcyB0aGF0IGRpc3BsYXkgYSBzcGVjaWZpYyBOb2RlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgc2NlbmVyeSwgU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFdlYkdMU2VsZkRyYXdhYmxlIGV4dGVuZHMgU2VsZkRyYXdhYmxlIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7V2ViR0xTZWxmRHJhd2FibGV9XG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gdGhpcyBpcyB0aGUgc2FtZSBhY3Jvc3MgbGlmZWN5Y2xlc1xuICAgIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyIHx8IHRoaXMubWFya1RyYW5zZm9ybURpcnR5LmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIHdoZW4gb3VyIHJlbGF0aXZlIHRyYW5zZm9ybSBjaGFuZ2VzLCBub3RpZnkgdXMgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlXG4gICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uYWRkTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcblxuICAgIC8vIHRyaWdnZXIgcHJlY29tcHV0YXRpb24gb2YgdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSwgc2luY2Ugd2Ugd2lsbCBhbHdheXMgbmVlZCBpdCB3aGVuIGl0IGlzIHVwZGF0ZWRcbiAgICBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5hZGRQcmVjb21wdXRlKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrVHJhbnNmb3JtRGlydHkoKSB7XG4gICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgdXBkYXRlU2VsZlZpc2liaWxpdHkoKSB7XG4gICAgc3VwZXIudXBkYXRlU2VsZlZpc2liaWxpdHkoKTtcblxuICAgIC8vIG1hcmsgdXMgYXMgZGlydHkgd2hlbiBvdXIgc2VsZiB2aXNpYmlsaXR5IGNoYW5nZXNcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5yZW1vdmVMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xuICAgIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlUHJlY29tcHV0ZSgpO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdXZWJHTFNlbGZEcmF3YWJsZScsIFdlYkdMU2VsZkRyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU2VsZkRyYXdhYmxlOyJdLCJuYW1lcyI6WyJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiV2ViR0xTZWxmRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInRyYW5zZm9ybUxpc3RlbmVyIiwibWFya1RyYW5zZm9ybURpcnR5IiwiYmluZCIsInJlbGF0aXZlVHJhbnNmb3JtIiwiYWRkTGlzdGVuZXIiLCJhZGRQcmVjb21wdXRlIiwibWFya0RpcnR5IiwidXBkYXRlU2VsZlZpc2liaWxpdHkiLCJkaXNwb3NlIiwicmVtb3ZlTGlzdGVuZXIiLCJyZW1vdmVQcmVjb21wdXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELFNBQVNBLE9BQU8sRUFBRUMsWUFBWSxRQUFRLGdCQUFnQjtBQUV0RCxJQUFBLEFBQU1DLG9CQUFOLE1BQU1BLDBCQUEwQkQ7SUFDOUI7Ozs7Ozs7R0FPQyxHQUNERSxXQUFZQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztRQUMvQixLQUFLLENBQUNGLFdBQVlDLFVBQVVDO1FBRTVCLDJEQUEyRDtRQUMzRCxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUksQ0FBQ0EsaUJBQWlCLElBQUksSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsSUFBSSxDQUFFLElBQUk7UUFFckYsMEVBQTBFO1FBQzFFSCxTQUFTSSxpQkFBaUIsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0osaUJBQWlCO1FBRTlELG9HQUFvRztRQUNwR0QsU0FBU0ksaUJBQWlCLENBQUNFLGFBQWE7UUFFeEMsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNESixxQkFBcUI7UUFDbkIsSUFBSSxDQUFDSyxTQUFTO0lBQ2hCO0lBRUE7OztHQUdDLEdBQ0RDLHVCQUF1QjtRQUNyQixLQUFLLENBQUNBO1FBRU4sb0RBQW9EO1FBQ3BELElBQUksQ0FBQ0QsU0FBUztJQUNoQjtJQUVBOzs7O0dBSUMsR0FDREUsVUFBVTtRQUNSLElBQUksQ0FBQ1QsUUFBUSxDQUFDSSxpQkFBaUIsQ0FBQ00sY0FBYyxDQUFFLElBQUksQ0FBQ1QsaUJBQWlCO1FBQ3RFLElBQUksQ0FBQ0QsUUFBUSxDQUFDSSxpQkFBaUIsQ0FBQ08sZ0JBQWdCO1FBRWhELEtBQUssQ0FBQ0Y7SUFDUjtBQUNGO0FBRUFkLFFBQVFpQixRQUFRLENBQUUscUJBQXFCZjtBQUV2QyxlQUFlQSxrQkFBa0IifQ==