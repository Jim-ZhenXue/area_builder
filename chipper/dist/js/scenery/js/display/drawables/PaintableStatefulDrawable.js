// Copyright 2016-2024, University of Colorado Boulder
/**
 * A trait for drawables for nodes that mix in Paintable that need to store state about what the current display is
 * currently showing, so that updates to the node's fill/stroke will only be made on attributes that specifically
 * changed (and no change will be necessary for an attribute that changed back to its original/currently-displayed
 * value). Generally, this is used for DOM and SVG drawables.
 *
 * Given the type (constructor) of a drawable, we'll mix in a combination of:
 * - initialization/disposal with the *State suffix
 * - mark* methods to be called on all drawables of nodes of this type, that set specific dirty flags
 * @public
 *
 * This will allow drawables that mix in this type to do the following during an update:
 * 1. Check specific dirty flags (e.g. if the fill changed, update the fill of our SVG element).
 * 2. Call setToCleanState() once done, to clear the dirty flags.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { Color, PaintObserver, scenery, SelfDrawable } from '../../imports.js';
const PaintableStatefulDrawable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), SelfDrawable));
    return class extends type {
        /**
     * Initializes the paintable part of the stateful trait state, starting its "lifetime" until it is disposed
     * @public
     *
     * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
     * @param {Instance} instance
     */ initialize(renderer, instance, ...args) {
            super.initialize(renderer, instance, ...args);
            // @protected {boolean} - Whether the fill has changed since our last update.
            this.dirtyFill = true;
            // @protected {boolean} - Stores whether we last had a stroke.
            this.hadStroke = false;
            // @protected {boolean} - Whether the stroke has changed since our last update.
            this.dirtyStroke = true;
            // @protected {boolean} - Whether the lineWidth has changed since our last update.
            this.dirtyLineWidth = true;
            // @protected {boolean} - Whether the line options (cap, join, dash, dashoffset, miterlimit) have changed since
            //                        our last update.
            this.dirtyLineOptions = true;
            // @protected {boolean} - Whether the cached paints has changed since our last update.
            this.dirtyCachedPaints = true;
            // @protected {Array.<PaintDef>}
            // Stores the last seen cached paints, so we can update our listeners/etc.
            this.lastCachedPaints = [];
            // @private {function} - Callback for when the fill is marked as dirty
            this.fillCallback = this.fillCallback || this.markDirtyFill.bind(this);
            // @private {function} - Callback for when the stroke is marked as dirty
            this.strokeCallback = this.strokeCallback || this.markDirtyStroke.bind(this);
            // @private {PaintObserver} - Observers the fill property for nodes
            this.fillObserver = this.fillObserver || new PaintObserver(this.fillCallback);
            // @private {PaintObserver} - Observers the stroke property for nodes
            this.strokeObserver = this.strokeObserver || new PaintObserver(this.strokeCallback);
            // Hook up our fill/stroke observers to this node
            this.fillObserver.setPrimary(instance.node._fill);
            this.strokeObserver.setPrimary(instance.node._stroke);
        }
        /**
     * Cleans the dirty-flag states to the 'not-dirty' option, so that we can listen for future changes.
     * @public
     */ cleanPaintableState() {
            // TODO: is this being called when we need it to be called? https://github.com/phetsims/scenery/issues/1581
            this.dirtyFill = false;
            this.dirtyStroke = false;
            this.dirtyLineWidth = false;
            this.dirtyLineOptions = false;
            this.dirtyCachedPaints = false;
            this.hadStroke = this.node.getStroke() !== null;
        }
        /**
     * Disposes the paintable stateful trait state, so it can be put into the pool to be initialized again.
     * @public
     * @override
     */ dispose() {
            super.dispose();
            this.fillObserver.clean();
            this.strokeObserver.clean();
        }
        /**
     * Called when the fill of the paintable node changes.
     * @public
     */ markDirtyFill() {
            assert && Color.checkPaint(this.instance.node._fill);
            this.dirtyFill = true;
            this.markPaintDirty();
            this.fillObserver.setPrimary(this.instance.node._fill);
        // TODO: look into having the fillObserver be notified of Node changes as our source https://github.com/phetsims/scenery/issues/1581
        }
        /**
     * Called when the stroke of the paintable node changes.
     * @public
     */ markDirtyStroke() {
            assert && Color.checkPaint(this.instance.node._stroke);
            this.dirtyStroke = true;
            this.markPaintDirty();
            this.strokeObserver.setPrimary(this.instance.node._stroke);
        // TODO: look into having the strokeObserver be notified of Node changes as our source https://github.com/phetsims/scenery/issues/1581
        }
        /**
     * Called when the lineWidth of the paintable node changes.
     * @public
     */ markDirtyLineWidth() {
            this.dirtyLineWidth = true;
            this.markPaintDirty();
        }
        /**
     * Called when the line options (lineWidth/lineJoin, etc) of the paintable node changes.
     * @public
     */ markDirtyLineOptions() {
            this.dirtyLineOptions = true;
            this.markPaintDirty();
        }
        /**
     * Called when the cached paints of the paintable node changes.
     * @public
     */ markDirtyCachedPaints() {
            this.dirtyCachedPaints = true;
            this.markPaintDirty();
        }
    };
});
scenery.register('PaintableStatefulDrawable', PaintableStatefulDrawable);
export default PaintableStatefulDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHRyYWl0IGZvciBkcmF3YWJsZXMgZm9yIG5vZGVzIHRoYXQgbWl4IGluIFBhaW50YWJsZSB0aGF0IG5lZWQgdG8gc3RvcmUgc3RhdGUgYWJvdXQgd2hhdCB0aGUgY3VycmVudCBkaXNwbGF5IGlzXG4gKiBjdXJyZW50bHkgc2hvd2luZywgc28gdGhhdCB1cGRhdGVzIHRvIHRoZSBub2RlJ3MgZmlsbC9zdHJva2Ugd2lsbCBvbmx5IGJlIG1hZGUgb24gYXR0cmlidXRlcyB0aGF0IHNwZWNpZmljYWxseVxuICogY2hhbmdlZCAoYW5kIG5vIGNoYW5nZSB3aWxsIGJlIG5lY2Vzc2FyeSBmb3IgYW4gYXR0cmlidXRlIHRoYXQgY2hhbmdlZCBiYWNrIHRvIGl0cyBvcmlnaW5hbC9jdXJyZW50bHktZGlzcGxheWVkXG4gKiB2YWx1ZSkuIEdlbmVyYWxseSwgdGhpcyBpcyB1c2VkIGZvciBET00gYW5kIFNWRyBkcmF3YWJsZXMuXG4gKlxuICogR2l2ZW4gdGhlIHR5cGUgKGNvbnN0cnVjdG9yKSBvZiBhIGRyYXdhYmxlLCB3ZSdsbCBtaXggaW4gYSBjb21iaW5hdGlvbiBvZjpcbiAqIC0gaW5pdGlhbGl6YXRpb24vZGlzcG9zYWwgd2l0aCB0aGUgKlN0YXRlIHN1ZmZpeFxuICogLSBtYXJrKiBtZXRob2RzIHRvIGJlIGNhbGxlZCBvbiBhbGwgZHJhd2FibGVzIG9mIG5vZGVzIG9mIHRoaXMgdHlwZSwgdGhhdCBzZXQgc3BlY2lmaWMgZGlydHkgZmxhZ3NcbiAqIEBwdWJsaWNcbiAqXG4gKiBUaGlzIHdpbGwgYWxsb3cgZHJhd2FibGVzIHRoYXQgbWl4IGluIHRoaXMgdHlwZSB0byBkbyB0aGUgZm9sbG93aW5nIGR1cmluZyBhbiB1cGRhdGU6XG4gKiAxLiBDaGVjayBzcGVjaWZpYyBkaXJ0eSBmbGFncyAoZS5nLiBpZiB0aGUgZmlsbCBjaGFuZ2VkLCB1cGRhdGUgdGhlIGZpbGwgb2Ygb3VyIFNWRyBlbGVtZW50KS5cbiAqIDIuIENhbGwgc2V0VG9DbGVhblN0YXRlKCkgb25jZSBkb25lLCB0byBjbGVhciB0aGUgZGlydHkgZmxhZ3MuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgQ29sb3IsIFBhaW50T2JzZXJ2ZXIsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlID0gbWVtb2l6ZSggdHlwZSA9PiB7XG4gIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIGluaGVyaXRhbmNlKCB0eXBlICksIFNlbGZEcmF3YWJsZSApICk7XG5cbiAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgdHlwZSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHBhaW50YWJsZSBwYXJ0IG9mIHRoZSBzdGF0ZWZ1bCB0cmFpdCBzdGF0ZSwgc3RhcnRpbmcgaXRzIFwibGlmZXRpbWVcIiB1bnRpbCBpdCBpcyBkaXNwb3NlZFxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFJlbmRlcmVyIGJpdG1hc2ssIHNlZSBSZW5kZXJlcidzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgICAqL1xuICAgIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApIHtcbiAgICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgLi4uYXJncyApO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGZpbGwgaGFzIGNoYW5nZWQgc2luY2Ugb3VyIGxhc3QgdXBkYXRlLlxuICAgICAgdGhpcy5kaXJ0eUZpbGwgPSB0cnVlO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFN0b3JlcyB3aGV0aGVyIHdlIGxhc3QgaGFkIGEgc3Ryb2tlLlxuICAgICAgdGhpcy5oYWRTdHJva2UgPSBmYWxzZTtcblxuICAgICAgLy8gQHByb3RlY3RlZCB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBzdHJva2UgaGFzIGNoYW5nZWQgc2luY2Ugb3VyIGxhc3QgdXBkYXRlLlxuICAgICAgdGhpcy5kaXJ0eVN0cm9rZSA9IHRydWU7XG5cbiAgICAgIC8vIEBwcm90ZWN0ZWQge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgbGluZVdpZHRoIGhhcyBjaGFuZ2VkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZS5cbiAgICAgIHRoaXMuZGlydHlMaW5lV2lkdGggPSB0cnVlO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGxpbmUgb3B0aW9ucyAoY2FwLCBqb2luLCBkYXNoLCBkYXNob2Zmc2V0LCBtaXRlcmxpbWl0KSBoYXZlIGNoYW5nZWQgc2luY2VcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgb3VyIGxhc3QgdXBkYXRlLlxuICAgICAgdGhpcy5kaXJ0eUxpbmVPcHRpb25zID0gdHJ1ZTtcblxuICAgICAgLy8gQHByb3RlY3RlZCB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBjYWNoZWQgcGFpbnRzIGhhcyBjaGFuZ2VkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZS5cbiAgICAgIHRoaXMuZGlydHlDYWNoZWRQYWludHMgPSB0cnVlO1xuXG4gICAgICAvLyBAcHJvdGVjdGVkIHtBcnJheS48UGFpbnREZWY+fVxuICAgICAgLy8gU3RvcmVzIHRoZSBsYXN0IHNlZW4gY2FjaGVkIHBhaW50cywgc28gd2UgY2FuIHVwZGF0ZSBvdXIgbGlzdGVuZXJzL2V0Yy5cbiAgICAgIHRoaXMubGFzdENhY2hlZFBhaW50cyA9IFtdO1xuXG4gICAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gQ2FsbGJhY2sgZm9yIHdoZW4gdGhlIGZpbGwgaXMgbWFya2VkIGFzIGRpcnR5XG4gICAgICB0aGlzLmZpbGxDYWxsYmFjayA9IHRoaXMuZmlsbENhbGxiYWNrIHx8IHRoaXMubWFya0RpcnR5RmlsbC5iaW5kKCB0aGlzICk7XG5cbiAgICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn0gLSBDYWxsYmFjayBmb3Igd2hlbiB0aGUgc3Ryb2tlIGlzIG1hcmtlZCBhcyBkaXJ0eVxuICAgICAgdGhpcy5zdHJva2VDYWxsYmFjayA9IHRoaXMuc3Ryb2tlQ2FsbGJhY2sgfHwgdGhpcy5tYXJrRGlydHlTdHJva2UuYmluZCggdGhpcyApO1xuXG4gICAgICAvLyBAcHJpdmF0ZSB7UGFpbnRPYnNlcnZlcn0gLSBPYnNlcnZlcnMgdGhlIGZpbGwgcHJvcGVydHkgZm9yIG5vZGVzXG4gICAgICB0aGlzLmZpbGxPYnNlcnZlciA9IHRoaXMuZmlsbE9ic2VydmVyIHx8IG5ldyBQYWludE9ic2VydmVyKCB0aGlzLmZpbGxDYWxsYmFjayApO1xuXG4gICAgICAvLyBAcHJpdmF0ZSB7UGFpbnRPYnNlcnZlcn0gLSBPYnNlcnZlcnMgdGhlIHN0cm9rZSBwcm9wZXJ0eSBmb3Igbm9kZXNcbiAgICAgIHRoaXMuc3Ryb2tlT2JzZXJ2ZXIgPSB0aGlzLnN0cm9rZU9ic2VydmVyIHx8IG5ldyBQYWludE9ic2VydmVyKCB0aGlzLnN0cm9rZUNhbGxiYWNrICk7XG5cbiAgICAgIC8vIEhvb2sgdXAgb3VyIGZpbGwvc3Ryb2tlIG9ic2VydmVycyB0byB0aGlzIG5vZGVcbiAgICAgIHRoaXMuZmlsbE9ic2VydmVyLnNldFByaW1hcnkoIGluc3RhbmNlLm5vZGUuX2ZpbGwgKTtcbiAgICAgIHRoaXMuc3Ryb2tlT2JzZXJ2ZXIuc2V0UHJpbWFyeSggaW5zdGFuY2Uubm9kZS5fc3Ryb2tlICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYW5zIHRoZSBkaXJ0eS1mbGFnIHN0YXRlcyB0byB0aGUgJ25vdC1kaXJ0eScgb3B0aW9uLCBzbyB0aGF0IHdlIGNhbiBsaXN0ZW4gZm9yIGZ1dHVyZSBjaGFuZ2VzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGVhblBhaW50YWJsZVN0YXRlKCkge1xuICAgICAgLy8gVE9ETzogaXMgdGhpcyBiZWluZyBjYWxsZWQgd2hlbiB3ZSBuZWVkIGl0IHRvIGJlIGNhbGxlZD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIHRoaXMuZGlydHlGaWxsID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuZGlydHlTdHJva2UgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlMaW5lV2lkdGggPSBmYWxzZTtcbiAgICAgIHRoaXMuZGlydHlMaW5lT3B0aW9ucyA9IGZhbHNlO1xuICAgICAgdGhpcy5kaXJ0eUNhY2hlZFBhaW50cyA9IGZhbHNlO1xuICAgICAgdGhpcy5oYWRTdHJva2UgPSB0aGlzLm5vZGUuZ2V0U3Ryb2tlKCkgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzcG9zZXMgdGhlIHBhaW50YWJsZSBzdGF0ZWZ1bCB0cmFpdCBzdGF0ZSwgc28gaXQgY2FuIGJlIHB1dCBpbnRvIHRoZSBwb29sIHRvIGJlIGluaXRpYWxpemVkIGFnYWluLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAb3ZlcnJpZGVcbiAgICAgKi9cbiAgICBkaXNwb3NlKCkge1xuICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgICB0aGlzLmZpbGxPYnNlcnZlci5jbGVhbigpO1xuICAgICAgdGhpcy5zdHJva2VPYnNlcnZlci5jbGVhbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBmaWxsIG9mIHRoZSBwYWludGFibGUgbm9kZSBjaGFuZ2VzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlGaWxsKCkge1xuICAgICAgYXNzZXJ0ICYmIENvbG9yLmNoZWNrUGFpbnQoIHRoaXMuaW5zdGFuY2Uubm9kZS5fZmlsbCApO1xuXG4gICAgICB0aGlzLmRpcnR5RmlsbCA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgICB0aGlzLmZpbGxPYnNlcnZlci5zZXRQcmltYXJ5KCB0aGlzLmluc3RhbmNlLm5vZGUuX2ZpbGwgKTtcbiAgICAgIC8vIFRPRE86IGxvb2sgaW50byBoYXZpbmcgdGhlIGZpbGxPYnNlcnZlciBiZSBub3RpZmllZCBvZiBOb2RlIGNoYW5nZXMgYXMgb3VyIHNvdXJjZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCB3aGVuIHRoZSBzdHJva2Ugb2YgdGhlIHBhaW50YWJsZSBub2RlIGNoYW5nZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eVN0cm9rZSgpIHtcbiAgICAgIGFzc2VydCAmJiBDb2xvci5jaGVja1BhaW50KCB0aGlzLmluc3RhbmNlLm5vZGUuX3N0cm9rZSApO1xuXG4gICAgICB0aGlzLmRpcnR5U3Ryb2tlID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgICAgIHRoaXMuc3Ryb2tlT2JzZXJ2ZXIuc2V0UHJpbWFyeSggdGhpcy5pbnN0YW5jZS5ub2RlLl9zdHJva2UgKTtcbiAgICAgIC8vIFRPRE86IGxvb2sgaW50byBoYXZpbmcgdGhlIHN0cm9rZU9ic2VydmVyIGJlIG5vdGlmaWVkIG9mIE5vZGUgY2hhbmdlcyBhcyBvdXIgc291cmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGxpbmVXaWR0aCBvZiB0aGUgcGFpbnRhYmxlIG5vZGUgY2hhbmdlcy5cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbWFya0RpcnR5TGluZVdpZHRoKCkge1xuICAgICAgdGhpcy5kaXJ0eUxpbmVXaWR0aCA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGxpbmUgb3B0aW9ucyAobGluZVdpZHRoL2xpbmVKb2luLCBldGMpIG9mIHRoZSBwYWludGFibGUgbm9kZSBjaGFuZ2VzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBtYXJrRGlydHlMaW5lT3B0aW9ucygpIHtcbiAgICAgIHRoaXMuZGlydHlMaW5lT3B0aW9ucyA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gdGhlIGNhY2hlZCBwYWludHMgb2YgdGhlIHBhaW50YWJsZSBub2RlIGNoYW5nZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIG1hcmtEaXJ0eUNhY2hlZFBhaW50cygpIHtcbiAgICAgIHRoaXMuZGlydHlDYWNoZWRQYWludHMgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICAgIH1cbiAgfTtcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1BhaW50YWJsZVN0YXRlZnVsRHJhd2FibGUnLCBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlICk7XG5leHBvcnQgZGVmYXVsdCBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlOyJdLCJuYW1lcyI6WyJpbmhlcml0YW5jZSIsIm1lbW9pemUiLCJDb2xvciIsIlBhaW50T2JzZXJ2ZXIiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwiUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImFyZ3MiLCJkaXJ0eUZpbGwiLCJoYWRTdHJva2UiLCJkaXJ0eVN0cm9rZSIsImRpcnR5TGluZVdpZHRoIiwiZGlydHlMaW5lT3B0aW9ucyIsImRpcnR5Q2FjaGVkUGFpbnRzIiwibGFzdENhY2hlZFBhaW50cyIsImZpbGxDYWxsYmFjayIsIm1hcmtEaXJ0eUZpbGwiLCJiaW5kIiwic3Ryb2tlQ2FsbGJhY2siLCJtYXJrRGlydHlTdHJva2UiLCJmaWxsT2JzZXJ2ZXIiLCJzdHJva2VPYnNlcnZlciIsInNldFByaW1hcnkiLCJub2RlIiwiX2ZpbGwiLCJfc3Ryb2tlIiwiY2xlYW5QYWludGFibGVTdGF0ZSIsImdldFN0cm9rZSIsImRpc3Bvc2UiLCJjbGVhbiIsImNoZWNrUGFpbnQiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eUxpbmVXaWR0aCIsIm1hcmtEaXJ0eUxpbmVPcHRpb25zIiwibWFya0RpcnR5Q2FjaGVkUGFpbnRzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUVELE9BQU9BLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsYUFBYSxzQ0FBc0M7QUFDMUQsU0FBU0MsS0FBSyxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxRQUFRLG1CQUFtQjtBQUUvRSxNQUFNQyw0QkFBNEJMLFFBQVNNLENBQUFBO0lBQ3pDQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVWLFlBQWFPLE9BQVFGO0lBRW5ELE9BQU8sY0FBY0U7UUFDbkI7Ozs7OztLQU1DLEdBQ0RJLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFFLEdB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