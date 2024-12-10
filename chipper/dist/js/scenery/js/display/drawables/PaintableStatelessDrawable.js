// Copyright 2016-2023, University of Colorado Boulder
/**
 * A trait for drawables for Paintable nodes that does not store the fill/stroke state, as it just needs to track
 * dirtyness overall.
 *
 * Assumes existence of the markPaintDirty method.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { Color, PaintObserver, scenery, SelfDrawable } from '../../imports.js';
const PaintableStatelessDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends type {
        /**
     * @public
     * @override
     *
     * @param {number} renderer
     * @param {Instance} instance
     */ initialize(renderer, instance, ...args) {
            super.initialize(renderer, instance, ...args);
            // @private {function}
            this.fillCallback = this.fillCallback || this.markDirtyFill.bind(this);
            this.strokeCallback = this.strokeCallback || this.markDirtyStroke.bind(this);
            // @private {PaintObserver}
            this.fillObserver = this.fillObserver || new PaintObserver(this.fillCallback);
            this.strokeObserver = this.strokeObserver || new PaintObserver(this.strokeCallback);
            this.fillObserver.setPrimary(instance.node._fill);
            this.strokeObserver.setPrimary(instance.node._stroke);
        }
        /**
     * Releases references
     * @public
     * @override
     */ dispose() {
            this.fillObserver.clean();
            this.strokeObserver.clean();
            super.dispose();
        }
        /**
     * @public
     */ markDirtyFill() {
            assert && Color.checkPaint(this.instance.node._fill);
            this.markPaintDirty();
            this.fillObserver.setPrimary(this.instance.node._fill);
        // TODO: look into having the fillObserver be notified of Node changes as our source https://github.com/phetsims/scenery/issues/1581
        }
        /**
     * @public
     */ markDirtyStroke() {
            assert && Color.checkPaint(this.instance.node._stroke);
            this.markPaintDirty();
            this.strokeObserver.setPrimary(this.instance.node._stroke);
        // TODO: look into having the strokeObserver be notified of Node changes as our source https://github.com/phetsims/scenery/issues/1581
        }
        /**
     * @public
     */ markDirtyLineWidth() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyLineOptions() {
            this.markPaintDirty();
        }
        /**
     * @public
     */ markDirtyCachedPaints() {
            this.markPaintDirty();
        }
    };
});
scenery.register('PaintableStatelessDrawable', PaintableStatelessDrawable);
export default PaintableStatelessDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3IgZHJhd2FibGVzIGZvciBQYWludGFibGUgbm9kZXMgdGhhdCBkb2VzIG5vdCBzdG9yZSB0aGUgZmlsbC9zdHJva2Ugc3RhdGUsIGFzIGl0IGp1c3QgbmVlZHMgdG8gdHJhY2tcbiAqIGRpcnR5bmVzcyBvdmVyYWxsLlxuICpcbiAqIEFzc3VtZXMgZXhpc3RlbmNlIG9mIHRoZSBtYXJrUGFpbnREaXJ0eSBtZXRob2QuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgQ29sb3IsIFBhaW50T2JzZXJ2ZXIsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSA9IG1lbW9pemUoIHR5cGUgPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBTZWxmRHJhd2FibGUgKSApO1xuXG4gIHJldHVybiBjbGFzcyBleHRlbmRzIHR5cGUge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICkge1xuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlLCAuLi5hcmdzICk7XG5cbiAgICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICAgIHRoaXMuZmlsbENhbGxiYWNrID0gdGhpcy5maWxsQ2FsbGJhY2sgfHwgdGhpcy5tYXJrRGlydHlGaWxsLmJpbmQoIHRoaXMgKTtcbiAgICAgIHRoaXMuc3Ryb2tlQ2FsbGJhY2sgPSB0aGlzLnN0cm9rZUNhbGxiYWNrIHx8IHRoaXMubWFya0RpcnR5U3Ryb2tlLmJpbmQoIHRoaXMgKTtcblxuICAgICAgLy8gQHByaXZhdGUge1BhaW50T2JzZXJ2ZXJ9XG4gICAgICB0aGlzLmZpbGxPYnNlcnZlciA9IHRoaXMuZmlsbE9ic2VydmVyIHx8IG5ldyBQYWludE9ic2VydmVyKCB0aGlzLmZpbGxDYWxsYmFjayApO1xuICAgICAgdGhpcy5zdHJva2VPYnNlcnZlciA9IHRoaXMuc3Ryb2tlT2JzZXJ2ZXIgfHwgbmV3IFBhaW50T2JzZXJ2ZXIoIHRoaXMuc3Ryb2tlQ2FsbGJhY2sgKTtcblxuICAgICAgdGhpcy5maWxsT2JzZXJ2ZXIuc2V0UHJpbWFyeSggaW5zdGFuY2Uubm9kZS5fZmlsbCApO1xuICAgICAgdGhpcy5zdHJva2VPYnNlcnZlci5zZXRQcmltYXJ5KCBpbnN0YW5jZS5ub2RlLl9zdHJva2UgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBvdmVycmlkZVxuICAgICAqL1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICB0aGlzLmZpbGxPYnNlcnZlci5jbGVhbigpO1xuICAgICAgdGhpcy5zdHJva2VPYnNlcnZlci5jbGVhbigpO1xuXG4gICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUZpbGwoKSB7XG4gICAgICBhc3NlcnQgJiYgQ29sb3IuY2hlY2tQYWludCggdGhpcy5pbnN0YW5jZS5ub2RlLl9maWxsICk7XG5cbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICAgIHRoaXMuZmlsbE9ic2VydmVyLnNldFByaW1hcnkoIHRoaXMuaW5zdGFuY2Uubm9kZS5fZmlsbCApO1xuICAgICAgLy8gVE9ETzogbG9vayBpbnRvIGhhdmluZyB0aGUgZmlsbE9ic2VydmVyIGJlIG5vdGlmaWVkIG9mIE5vZGUgY2hhbmdlcyBhcyBvdXIgc291cmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVN0cm9rZSgpIHtcbiAgICAgIGFzc2VydCAmJiBDb2xvci5jaGVja1BhaW50KCB0aGlzLmluc3RhbmNlLm5vZGUuX3N0cm9rZSApO1xuXG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgICB0aGlzLnN0cm9rZU9ic2VydmVyLnNldFByaW1hcnkoIHRoaXMuaW5zdGFuY2Uubm9kZS5fc3Ryb2tlICk7XG4gICAgICAvLyBUT0RPOiBsb29rIGludG8gaGF2aW5nIHRoZSBzdHJva2VPYnNlcnZlciBiZSBub3RpZmllZCBvZiBOb2RlIGNoYW5nZXMgYXMgb3VyIHNvdXJjZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlMaW5lV2lkdGgoKSB7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUxpbmVPcHRpb25zKCkge1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlDYWNoZWRQYWludHMoKSB7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuICB9O1xufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUnLCBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGU7Il0sIm5hbWVzIjpbImluaGVyaXRhbmNlIiwibWVtb2l6ZSIsIkNvbG9yIiwiUGFpbnRPYnNlcnZlciIsInNjZW5lcnkiLCJTZWxmRHJhd2FibGUiLCJQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImFyZ3MiLCJmaWxsQ2FsbGJhY2siLCJtYXJrRGlydHlGaWxsIiwiYmluZCIsInN0cm9rZUNhbGxiYWNrIiwibWFya0RpcnR5U3Ryb2tlIiwiZmlsbE9ic2VydmVyIiwic3Ryb2tlT2JzZXJ2ZXIiLCJzZXRQcmltYXJ5Iiwibm9kZSIsIl9maWxsIiwiX3N0cm9rZSIsImRpc3Bvc2UiLCJjbGVhbiIsImNoZWNrUGFpbnQiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eUxpbmVXaWR0aCIsIm1hcmtEaXJ0eUxpbmVPcHRpb25zIiwibWFya0RpcnR5Q2FjaGVkUGFpbnRzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsaUJBQWlCLDBDQUEwQztBQUNsRSxPQUFPQyxhQUFhLHNDQUFzQztBQUMxRCxTQUFTQyxLQUFLLEVBQUVDLGFBQWEsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLFFBQVEsbUJBQW1CO0FBRS9FLE1BQU1DLDZCQUE2QkwsUUFBU00sQ0FBQUE7SUFDMUNDLFVBQVVBLE9BQVFDLEVBQUVDLFFBQVEsQ0FBRVYsWUFBYU8sT0FBUUY7SUFFbkQsT0FBTyxjQUFjRTtRQUNuQjs7Ozs7O0tBTUMsR0FDREksV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBR0MsSUFBSSxFQUFHO1lBQ3hDLEtBQUssQ0FBQ0gsV0FBWUMsVUFBVUMsYUFBYUM7WUFFekMsc0JBQXNCO1lBQ3RCLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUksQ0FBQ0EsWUFBWSxJQUFJLElBQUksQ0FBQ0MsYUFBYSxDQUFDQyxJQUFJLENBQUUsSUFBSTtZQUN0RSxJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJLENBQUNBLGNBQWMsSUFBSSxJQUFJLENBQUNDLGVBQWUsQ0FBQ0YsSUFBSSxDQUFFLElBQUk7WUFFNUUsMkJBQTJCO1lBQzNCLElBQUksQ0FBQ0csWUFBWSxHQUFHLElBQUksQ0FBQ0EsWUFBWSxJQUFJLElBQUlqQixjQUFlLElBQUksQ0FBQ1ksWUFBWTtZQUM3RSxJQUFJLENBQUNNLGNBQWMsR0FBRyxJQUFJLENBQUNBLGNBQWMsSUFBSSxJQUFJbEIsY0FBZSxJQUFJLENBQUNlLGNBQWM7WUFFbkYsSUFBSSxDQUFDRSxZQUFZLENBQUNFLFVBQVUsQ0FBRVQsU0FBU1UsSUFBSSxDQUFDQyxLQUFLO1lBQ2pELElBQUksQ0FBQ0gsY0FBYyxDQUFDQyxVQUFVLENBQUVULFNBQVNVLElBQUksQ0FBQ0UsT0FBTztRQUN2RDtRQUVBOzs7O0tBSUMsR0FDREMsVUFBVTtZQUNSLElBQUksQ0FBQ04sWUFBWSxDQUFDTyxLQUFLO1lBQ3ZCLElBQUksQ0FBQ04sY0FBYyxDQUFDTSxLQUFLO1lBRXpCLEtBQUssQ0FBQ0Q7UUFDUjtRQUVBOztLQUVDLEdBQ0RWLGdCQUFnQjtZQUNkUixVQUFVTixNQUFNMEIsVUFBVSxDQUFFLElBQUksQ0FBQ2YsUUFBUSxDQUFDVSxJQUFJLENBQUNDLEtBQUs7WUFFcEQsSUFBSSxDQUFDSyxjQUFjO1lBQ25CLElBQUksQ0FBQ1QsWUFBWSxDQUFDRSxVQUFVLENBQUUsSUFBSSxDQUFDVCxRQUFRLENBQUNVLElBQUksQ0FBQ0MsS0FBSztRQUN0RCxvSUFBb0k7UUFDdEk7UUFFQTs7S0FFQyxHQUNETCxrQkFBa0I7WUFDaEJYLFVBQVVOLE1BQU0wQixVQUFVLENBQUUsSUFBSSxDQUFDZixRQUFRLENBQUNVLElBQUksQ0FBQ0UsT0FBTztZQUV0RCxJQUFJLENBQUNJLGNBQWM7WUFDbkIsSUFBSSxDQUFDUixjQUFjLENBQUNDLFVBQVUsQ0FBRSxJQUFJLENBQUNULFFBQVEsQ0FBQ1UsSUFBSSxDQUFDRSxPQUFPO1FBQzFELHNJQUFzSTtRQUN4STtRQUVBOztLQUVDLEdBQ0RLLHFCQUFxQjtZQUNuQixJQUFJLENBQUNELGNBQWM7UUFDckI7UUFFQTs7S0FFQyxHQUNERSx1QkFBdUI7WUFDckIsSUFBSSxDQUFDRixjQUFjO1FBQ3JCO1FBRUE7O0tBRUMsR0FDREcsd0JBQXdCO1lBQ3RCLElBQUksQ0FBQ0gsY0FBYztRQUNyQjtJQUNGO0FBQ0Y7QUFFQXpCLFFBQVE2QixRQUFRLENBQUUsOEJBQThCM0I7QUFDaEQsZUFBZUEsMkJBQTJCIn0=