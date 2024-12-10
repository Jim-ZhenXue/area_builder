// Copyright 2016-2022, University of Colorado Boulder
/**
 * A trait for drawables for Line that does not store the line's state, as it just needs to track dirtyness overall.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { PaintableStatelessDrawable, scenery, SelfDrawable } from '../../imports.js';
const LineStatelessDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends PaintableStatelessDrawable(type) {
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
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyP1() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyP2() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyX1() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyY1() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyX2() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyY2() {
            this.markPaintDirty();
        }
    };
});
scenery.register('LineStatelessDrawable', LineStatelessDrawable);
export default LineStatelessDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvTGluZVN0YXRlbGVzc0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgdHJhaXQgZm9yIGRyYXdhYmxlcyBmb3IgTGluZSB0aGF0IGRvZXMgbm90IHN0b3JlIHRoZSBsaW5lJ3Mgc3RhdGUsIGFzIGl0IGp1c3QgbmVlZHMgdG8gdHJhY2sgZGlydHluZXNzIG92ZXJhbGwuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBMaW5lU3RhdGVsZXNzRHJhd2FibGUgPSBtZW1vaXplKCB0eXBlID0+IHtcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggaW5oZXJpdGFuY2UoIHR5cGUgKSwgU2VsZkRyYXdhYmxlICkgKTtcblxuICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSggdHlwZSApIHtcbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICogQG92ZXJyaWRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIEZsYWcgbWFya2VkIGFzIHRydWUgaWYgQU5ZIG9mIHRoZSBkcmF3YWJsZSBkaXJ0eSBmbGFncyBhcmUgc2V0IChiYXNpY2FsbHkgZXZlcnl0aGluZyBleGNlcHQgZm9yIHRyYW5zZm9ybXMsIGFzIHdlXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgIG5lZWQgdG8gYWNjZWxlcmF0ZSB0aGUgdHJhbnNmb3JtIGNhc2UuXG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgXCJjYXRjaC1hbGxcIiBkaXJ0eSBtZXRob2QgdGhhdCBkaXJlY3RseSBtYXJrcyB0aGUgcGFpbnREaXJ0eSBmbGFnIGFuZCB0cmlnZ2VycyBwcm9wYWdhdGlvbiBvZiBkaXJ0eVxuICAgICAqIGluZm9ybWF0aW9uLiBUaGlzIGNhbiBiZSB1c2VkIGJ5IG90aGVyIG1hcmsqIG1ldGhvZHMsIG9yIGRpcmVjdGx5IGl0c2VsZiBpZiB0aGUgcGFpbnREaXJ0eSBmbGFnIGlzIGNoZWNrZWQuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogSXQgc2hvdWxkIGJlIGZpcmVkIChpbmRpcmVjdGx5IG9yIGRpcmVjdGx5KSBmb3IgYW55dGhpbmcgYmVzaWRlcyB0cmFuc2Zvcm1zIHRoYXQgbmVlZHMgdG8gbWFrZSBhIGRyYXdhYmxlXG4gICAgICogZGlydHkuXG4gICAgICovXG4gICAgbWFya1BhaW50RGlydHkoKSB7XG4gICAgICB0aGlzLnBhaW50RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5TGluZSgpIHtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5UDEoKSB7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVAyKCkge1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlYMSgpIHtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5WTEoKSB7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVgyKCkge1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlZMigpIHtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICB9XG4gIH07XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdMaW5lU3RhdGVsZXNzRHJhd2FibGUnLCBMaW5lU3RhdGVsZXNzRHJhd2FibGUgKTtcbmV4cG9ydCBkZWZhdWx0IExpbmVTdGF0ZWxlc3NEcmF3YWJsZTsiXSwibmFtZXMiOlsiaW5oZXJpdGFuY2UiLCJtZW1vaXplIiwiUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiTGluZVN0YXRlbGVzc0RyYXdhYmxlIiwidHlwZSIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiYXJncyIsInBhaW50RGlydHkiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eSIsIm1hcmtEaXJ0eUxpbmUiLCJtYXJrRGlydHlQMSIsIm1hcmtEaXJ0eVAyIiwibWFya0RpcnR5WDEiLCJtYXJrRGlydHlZMSIsIm1hcmtEaXJ0eVgyIiwibWFya0RpcnR5WTIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGFBQWEsc0NBQXNDO0FBQzFELFNBQVNDLDBCQUEwQixFQUFFQyxPQUFPLEVBQUVDLFlBQVksUUFBUSxtQkFBbUI7QUFFckYsTUFBTUMsd0JBQXdCSixRQUFTSyxDQUFBQTtJQUNyQ0MsVUFBVUEsT0FBUUMsRUFBRUMsUUFBUSxDQUFFVCxZQUFhTSxPQUFRRjtJQUVuRCxPQUFPLGNBQWNGLDJCQUE0Qkk7UUFDL0M7Ozs7OztLQU1DLEdBQ0RJLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdBQUdDLElBQUksRUFBRztZQUN4QyxLQUFLLENBQUNILFdBQVlDLFVBQVVDLGFBQWFDO1lBRXpDLDJJQUEySTtZQUMzSSxnRUFBZ0U7WUFDaEUsSUFBSSxDQUFDQyxVQUFVLEdBQUc7UUFDcEI7UUFFQTs7Ozs7OztLQU9DLEdBQ0RDLGlCQUFpQjtZQUNmLElBQUksQ0FBQ0QsVUFBVSxHQUFHO1lBQ2xCLElBQUksQ0FBQ0UsU0FBUztRQUNoQjtRQUVBOztLQUVDLEdBQ0RDLGdCQUFnQjtZQUNkLElBQUksQ0FBQ0YsY0FBYztRQUNyQjtRQUVBOztLQUVDLEdBQ0RHLGNBQWM7WUFDWixJQUFJLENBQUNILGNBQWM7UUFDckI7UUFFQTs7S0FFQyxHQUNESSxjQUFjO1lBQ1osSUFBSSxDQUFDSixjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREssY0FBYztZQUNaLElBQUksQ0FBQ0wsY0FBYztRQUNyQjtRQUVBOztLQUVDLEdBQ0RNLGNBQWM7WUFDWixJQUFJLENBQUNOLGNBQWM7UUFDckI7UUFFQTs7S0FFQyxHQUNETyxjQUFjO1lBQ1osSUFBSSxDQUFDUCxjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDRFEsY0FBYztZQUNaLElBQUksQ0FBQ1IsY0FBYztRQUNyQjtJQUNGO0FBQ0Y7QUFFQVosUUFBUXFCLFFBQVEsQ0FBRSx5QkFBeUJuQjtBQUMzQyxlQUFlQSxzQkFBc0IifQ==