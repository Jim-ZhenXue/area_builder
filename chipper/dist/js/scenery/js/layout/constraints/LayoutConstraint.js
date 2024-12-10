// Copyright 2021-2024, University of Colorado Boulder
/**
 * Abstract supertype for layout constraints. Provides a lot of assistance to layout handling, including adding/removing
 * listeners, and reentrancy detection/loop prevention.
 *
 * We'll also handle reentrancy somewhat specially. If code tries to enter a layout reentrantly (while a layout is
 * already executing), we'll instead IGNORE this second one (and set a flag). Once our first layout is done, we'll
 * attempt to run the layout again. In case the subtype needs to lock multiple times (if a layout is FORCED), we have
 * an integer count of how many "layout" calls we're in (_layoutLockCount). Once this reaches zero, we're effectively
 * unlocked and not inside any layout calls.
 *
 * NOTE: This can still trigger infinite loops nominally (if every layout call triggers another layout call), but we
 * have a practical assertion limit that will stop this and flag it as an error.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import { extendsHeightSizable, extendsWidthSizable, LayoutProxy, scenery } from '../../imports.js';
let LayoutConstraint = class LayoutConstraint {
    /**
   * Adds listeners to a Node, so that our layout updates will happen if this Node's Properties
   * (bounds/visibility/minimum size) change. Will be cleared on disposal of this type.
   * (scenery-internal)
   *
   * @param node
   * @param addLock - If true, we'll mark the node as having this layout constraint as responsible for its layout.
   * It will be an assertion failure if another layout container tries to lock the same node (so that we don't run into
   * infinite loops where multiple constraints try to move a node back-and-forth).
   * See Node's _activeParentLayoutConstraint for more information.
   */ addNode(node, addLock = true) {
        assert && assert(!this._listenedNodes.has(node));
        assert && assert(!addLock || !node._activeParentLayoutConstraint, 'This node is already managed by a layout container - make sure to wrap it in a Node if DAG, removing it from an old layout container, etc.');
        if (addLock) {
            node._activeParentLayoutConstraint = this;
        }
        node.boundsProperty.lazyLink(this._updateLayoutListener);
        node.visibleProperty.lazyLink(this._updateLayoutListener);
        if (extendsWidthSizable(node)) {
            node.minimumWidthProperty.lazyLink(this._updateLayoutListener);
            node.isWidthResizableProperty.lazyLink(this._updateLayoutListener);
        }
        if (extendsHeightSizable(node)) {
            node.minimumHeightProperty.lazyLink(this._updateLayoutListener);
            node.isHeightResizableProperty.lazyLink(this._updateLayoutListener);
        }
        this._listenedNodes.add(node);
    }
    /**
   * (scenery-internal)
   */ removeNode(node) {
        assert && assert(this._listenedNodes.has(node));
        // Optional, since we might not have added the "lock" in addNode
        if (node._activeParentLayoutConstraint === this) {
            node._activeParentLayoutConstraint = null;
        }
        node.boundsProperty.unlink(this._updateLayoutListener);
        node.visibleProperty.unlink(this._updateLayoutListener);
        if (extendsWidthSizable(node)) {
            node.minimumWidthProperty.unlink(this._updateLayoutListener);
            node.isWidthResizableProperty.unlink(this._updateLayoutListener);
        }
        if (extendsHeightSizable(node)) {
            node.minimumHeightProperty.unlink(this._updateLayoutListener);
            node.isHeightResizableProperty.unlink(this._updateLayoutListener);
        }
        this._listenedNodes.delete(node);
    }
    /**
   * NOTE: DO NOT call from places other than super.layout() in overridden layout() OR from the existing call in
   *       updateLayout(). Doing so would break the lock mechanism.
   * NOTE: Cannot be marked as abstract due to how mixins work
   */ layout() {
    // See subclass for implementation
    }
    /**
   * (scenery-internal)
   */ get isLocked() {
        return this._layoutLockCount > 0;
    }
    /**
   * Locks the layout, so that automatic layout will NOT be triggered synchronously until unlock() is called and
   * the lock count returns to 0. This is set up so that if we trigger multiple reentrancy, we will only attempt to
   * re-layout once ALL of the layouts are finished.
   * (scenery-internal)
   */ lock() {
        this._layoutLockCount++;
    }
    /**
   * Unlocks the layout. Generally (but not always), updateLayout() or updateLayoutAutomatically() should be called
   * after this, as locks are generally used for this purpose.
   * (scenery-internal)
   */ unlock() {
        this._layoutLockCount--;
    }
    /**
   * Here for manual validation (say, in the devtools) - While some layouts are going on, this may not be correct, so it
   * could not be added to post-layout validation.
   * (scenery-internal)
   */ validateLocalPreferredWidth(layoutContainer) {
        if (assert && layoutContainer.localBounds.isFinite() && !this._layoutAttemptDuringLock) {
            layoutContainer.validateLocalPreferredWidth();
        }
    }
    /**
   * Here for manual validation (say, in the devtools) - While some layouts are going on, this may not be correct, so it
   * could not be added to post-layout validation.
   * (scenery-internal)
   */ validateLocalPreferredHeight(layoutContainer) {
        if (assert && layoutContainer.localBounds.isFinite() && !this._layoutAttemptDuringLock) {
            layoutContainer.validateLocalPreferredHeight();
        }
    }
    /**
   * Here for manual validation (say, in the devtools) - While some layouts are going on, this may not be correct, so it
   * could not be added to post-layout validation.
   * (scenery-internal)
   */ validateLocalPreferredSize(layoutContainer) {
        if (assert && layoutContainer.localBounds.isFinite() && !this._layoutAttemptDuringLock) {
            layoutContainer.validateLocalPreferredSize();
        }
    }
    /**
   * Updates the layout of this constraint. Called automatically during initialization, when children change (if
   * resize is true), or when client wants to call this public method for any reason.
   */ updateLayout() {
        let count = 0;
        // If we're locked AND someone tries to do layout, record this so we can attempt layout once we are not locked
        // anymore. We have some infinite-loop detection here for common development errors.
        if (this.isLocked) {
            assert && count++;
            assert && assert(++count < 500, 'Likely infinite loop detected, are we triggering layout within the layout?');
            this._layoutAttemptDuringLock = true;
        } else {
            this.lock();
            // Run layout until we didn't get a layout attempt during our last attempt. This component's layout should now
            // be correct and stable.
            do {
                this._layoutAttemptDuringLock = false;
                this.layout();
            }while (this._layoutAttemptDuringLock)
            this.unlock();
        }
    }
    /**
   * Called when we attempt to automatically layout components. (scenery-internal)
   */ updateLayoutAutomatically() {
        if (this._enabled) {
            this.updateLayout();
        }
    }
    /**
   * Creates a LayoutProxy for a unique trail from our ancestorNode to this Node (or null if that's not possible)
   * (scenery-internal)
   */ createLayoutProxy(node) {
        const trails = node.getTrails((n)=>n === this.ancestorNode);
        if (trails.length === 1) {
            return LayoutProxy.pool.create(trails[0].removeAncestor());
        } else {
            return null;
        }
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.updateLayoutAutomatically();
        }
    }
    /**
   * Releases references
   */ dispose() {
        // Clean up listeners to any listened nodes
        const listenedNodes = [
            ...this._listenedNodes.keys()
        ];
        for(let i = 0; i < listenedNodes.length; i++){
            this.removeNode(listenedNodes[i]);
        }
        this.finishedLayoutEmitter.dispose();
    }
    /**
   * (scenery-internal)
   */ constructor(ancestorNode){
        // Prevents layout() from running while greater than zero. Generally will be unlocked and laid out.
        // See the documentation at the top of the file for more on reentrancy.
        this._layoutLockCount = 0;
        // Whether there was a layout attempt during the lock
        this._layoutAttemptDuringLock = false;
        // When we are disabled (say, a layout container has resize:false), we won't automatically do layout
        this._enabled = true;
        // Track Nodes we're listening to (for memory cleanup purposes)
        this._listenedNodes = new Set();
        // (scenery-internal) - emits when we've finished layout
        this.finishedLayoutEmitter = new TinyEmitter();
        this.ancestorNode = ancestorNode;
        this._updateLayoutListener = this.updateLayoutAutomatically.bind(this);
    }
};
export { LayoutConstraint as default };
scenery.register('LayoutConstraint', LayoutConstraint);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0xheW91dENvbnN0cmFpbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQWJzdHJhY3Qgc3VwZXJ0eXBlIGZvciBsYXlvdXQgY29uc3RyYWludHMuIFByb3ZpZGVzIGEgbG90IG9mIGFzc2lzdGFuY2UgdG8gbGF5b3V0IGhhbmRsaW5nLCBpbmNsdWRpbmcgYWRkaW5nL3JlbW92aW5nXG4gKiBsaXN0ZW5lcnMsIGFuZCByZWVudHJhbmN5IGRldGVjdGlvbi9sb29wIHByZXZlbnRpb24uXG4gKlxuICogV2UnbGwgYWxzbyBoYW5kbGUgcmVlbnRyYW5jeSBzb21ld2hhdCBzcGVjaWFsbHkuIElmIGNvZGUgdHJpZXMgdG8gZW50ZXIgYSBsYXlvdXQgcmVlbnRyYW50bHkgKHdoaWxlIGEgbGF5b3V0IGlzXG4gKiBhbHJlYWR5IGV4ZWN1dGluZyksIHdlJ2xsIGluc3RlYWQgSUdOT1JFIHRoaXMgc2Vjb25kIG9uZSAoYW5kIHNldCBhIGZsYWcpLiBPbmNlIG91ciBmaXJzdCBsYXlvdXQgaXMgZG9uZSwgd2UnbGxcbiAqIGF0dGVtcHQgdG8gcnVuIHRoZSBsYXlvdXQgYWdhaW4uIEluIGNhc2UgdGhlIHN1YnR5cGUgbmVlZHMgdG8gbG9jayBtdWx0aXBsZSB0aW1lcyAoaWYgYSBsYXlvdXQgaXMgRk9SQ0VEKSwgd2UgaGF2ZVxuICogYW4gaW50ZWdlciBjb3VudCBvZiBob3cgbWFueSBcImxheW91dFwiIGNhbGxzIHdlJ3JlIGluIChfbGF5b3V0TG9ja0NvdW50KS4gT25jZSB0aGlzIHJlYWNoZXMgemVybywgd2UncmUgZWZmZWN0aXZlbHlcbiAqIHVubG9ja2VkIGFuZCBub3QgaW5zaWRlIGFueSBsYXlvdXQgY2FsbHMuXG4gKlxuICogTk9URTogVGhpcyBjYW4gc3RpbGwgdHJpZ2dlciBpbmZpbml0ZSBsb29wcyBub21pbmFsbHkgKGlmIGV2ZXJ5IGxheW91dCBjYWxsIHRyaWdnZXJzIGFub3RoZXIgbGF5b3V0IGNhbGwpLCBidXQgd2VcbiAqIGhhdmUgYSBwcmFjdGljYWwgYXNzZXJ0aW9uIGxpbWl0IHRoYXQgd2lsbCBzdG9wIHRoaXMgYW5kIGZsYWcgaXQgYXMgYW4gZXJyb3IuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBUaW55RW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlFbWl0dGVyLmpzJztcbmltcG9ydCB7IGV4dGVuZHNIZWlnaHRTaXphYmxlLCBleHRlbmRzV2lkdGhTaXphYmxlLCBIZWlnaHRTaXphYmxlTm9kZSwgTGF5b3V0UHJveHksIE5vZGUsIHNjZW5lcnksIFNpemFibGVOb2RlLCBXaWR0aFNpemFibGVOb2RlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIExheW91dENvbnN0cmFpbnQge1xuXG4gIC8vIFRoZSBOb2RlIGluIHdob3NlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgb3VyIGxheW91dCBjb21wdXRhdGlvbnMgYXJlIGRvbmUuXG4gIHB1YmxpYyByZWFkb25seSBhbmNlc3Rvck5vZGU6IE5vZGU7XG5cbiAgLy8gUHJldmVudHMgbGF5b3V0KCkgZnJvbSBydW5uaW5nIHdoaWxlIGdyZWF0ZXIgdGhhbiB6ZXJvLiBHZW5lcmFsbHkgd2lsbCBiZSB1bmxvY2tlZCBhbmQgbGFpZCBvdXQuXG4gIC8vIFNlZSB0aGUgZG9jdW1lbnRhdGlvbiBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlIGZvciBtb3JlIG9uIHJlZW50cmFuY3kuXG4gIHByaXZhdGUgX2xheW91dExvY2tDb3VudCA9IDA7XG5cbiAgLy8gV2hldGhlciB0aGVyZSB3YXMgYSBsYXlvdXQgYXR0ZW1wdCBkdXJpbmcgdGhlIGxvY2tcbiAgcHJpdmF0ZSBfbGF5b3V0QXR0ZW1wdER1cmluZ0xvY2sgPSBmYWxzZTtcblxuICAvLyBXaGVuIHdlIGFyZSBkaXNhYmxlZCAoc2F5LCBhIGxheW91dCBjb250YWluZXIgaGFzIHJlc2l6ZTpmYWxzZSksIHdlIHdvbid0IGF1dG9tYXRpY2FsbHkgZG8gbGF5b3V0XG4gIHByaXZhdGUgX2VuYWJsZWQgPSB0cnVlO1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBfdXBkYXRlTGF5b3V0TGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gVHJhY2sgTm9kZXMgd2UncmUgbGlzdGVuaW5nIHRvIChmb3IgbWVtb3J5IGNsZWFudXAgcHVycG9zZXMpXG4gIHByaXZhdGUgcmVhZG9ubHkgX2xpc3RlbmVkTm9kZXM6IFNldDxOb2RlPiA9IG5ldyBTZXQ8Tm9kZT4oKTtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgLSBlbWl0cyB3aGVuIHdlJ3ZlIGZpbmlzaGVkIGxheW91dFxuICBwdWJsaWMgcmVhZG9ubHkgZmluaXNoZWRMYXlvdXRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggYW5jZXN0b3JOb2RlOiBOb2RlICkge1xuICAgIHRoaXMuYW5jZXN0b3JOb2RlID0gYW5jZXN0b3JOb2RlO1xuICAgIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyID0gdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5LmJpbmQoIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGxpc3RlbmVycyB0byBhIE5vZGUsIHNvIHRoYXQgb3VyIGxheW91dCB1cGRhdGVzIHdpbGwgaGFwcGVuIGlmIHRoaXMgTm9kZSdzIFByb3BlcnRpZXNcbiAgICogKGJvdW5kcy92aXNpYmlsaXR5L21pbmltdW0gc2l6ZSkgY2hhbmdlLiBXaWxsIGJlIGNsZWFyZWQgb24gZGlzcG9zYWwgb2YgdGhpcyB0eXBlLlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIG5vZGVcbiAgICogQHBhcmFtIGFkZExvY2sgLSBJZiB0cnVlLCB3ZSdsbCBtYXJrIHRoZSBub2RlIGFzIGhhdmluZyB0aGlzIGxheW91dCBjb25zdHJhaW50IGFzIHJlc3BvbnNpYmxlIGZvciBpdHMgbGF5b3V0LlxuICAgKiBJdCB3aWxsIGJlIGFuIGFzc2VydGlvbiBmYWlsdXJlIGlmIGFub3RoZXIgbGF5b3V0IGNvbnRhaW5lciB0cmllcyB0byBsb2NrIHRoZSBzYW1lIG5vZGUgKHNvIHRoYXQgd2UgZG9uJ3QgcnVuIGludG9cbiAgICogaW5maW5pdGUgbG9vcHMgd2hlcmUgbXVsdGlwbGUgY29uc3RyYWludHMgdHJ5IHRvIG1vdmUgYSBub2RlIGJhY2stYW5kLWZvcnRoKS5cbiAgICogU2VlIE5vZGUncyBfYWN0aXZlUGFyZW50TGF5b3V0Q29uc3RyYWludCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBhZGROb2RlKCBub2RlOiBOb2RlLCBhZGRMb2NrID0gdHJ1ZSApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5fbGlzdGVuZWROb2Rlcy5oYXMoIG5vZGUgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFhZGRMb2NrIHx8ICFub2RlLl9hY3RpdmVQYXJlbnRMYXlvdXRDb25zdHJhaW50LCAnVGhpcyBub2RlIGlzIGFscmVhZHkgbWFuYWdlZCBieSBhIGxheW91dCBjb250YWluZXIgLSBtYWtlIHN1cmUgdG8gd3JhcCBpdCBpbiBhIE5vZGUgaWYgREFHLCByZW1vdmluZyBpdCBmcm9tIGFuIG9sZCBsYXlvdXQgY29udGFpbmVyLCBldGMuJyApO1xuXG4gICAgaWYgKCBhZGRMb2NrICkge1xuICAgICAgbm9kZS5fYWN0aXZlUGFyZW50TGF5b3V0Q29uc3RyYWludCA9IHRoaXM7XG4gICAgfVxuXG4gICAgbm9kZS5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICBub2RlLnZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICBpZiAoIGV4dGVuZHNXaWR0aFNpemFibGUoIG5vZGUgKSApIHtcbiAgICAgIG5vZGUubWluaW11bVdpZHRoUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG4gICAgICBub2RlLmlzV2lkdGhSZXNpemFibGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCBleHRlbmRzSGVpZ2h0U2l6YWJsZSggbm9kZSApICkge1xuICAgICAgbm9kZS5taW5pbXVtSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG4gICAgICBub2RlLmlzSGVpZ2h0UmVzaXphYmxlUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZWROb2Rlcy5hZGQoIG5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyByZW1vdmVOb2RlKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xpc3RlbmVkTm9kZXMuaGFzKCBub2RlICkgKTtcblxuICAgIC8vIE9wdGlvbmFsLCBzaW5jZSB3ZSBtaWdodCBub3QgaGF2ZSBhZGRlZCB0aGUgXCJsb2NrXCIgaW4gYWRkTm9kZVxuICAgIGlmICggbm9kZS5fYWN0aXZlUGFyZW50TGF5b3V0Q29uc3RyYWludCA9PT0gdGhpcyApIHtcbiAgICAgIG5vZGUuX2FjdGl2ZVBhcmVudExheW91dENvbnN0cmFpbnQgPSBudWxsO1xuICAgIH1cblxuICAgIG5vZGUuYm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICAgIG5vZGUudmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICBpZiAoIGV4dGVuZHNXaWR0aFNpemFibGUoIG5vZGUgKSApIHtcbiAgICAgIG5vZGUubWluaW11bVdpZHRoUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICAgICAgbm9kZS5pc1dpZHRoUmVzaXphYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICAgIH1cbiAgICBpZiAoIGV4dGVuZHNIZWlnaHRTaXphYmxlKCBub2RlICkgKSB7XG4gICAgICBub2RlLm1pbmltdW1IZWlnaHRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG4gICAgICBub2RlLmlzSGVpZ2h0UmVzaXphYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHRoaXMuX2xpc3RlbmVkTm9kZXMuZGVsZXRlKCBub2RlICk7XG4gIH1cblxuICAvKipcbiAgICogTk9URTogRE8gTk9UIGNhbGwgZnJvbSBwbGFjZXMgb3RoZXIgdGhhbiBzdXBlci5sYXlvdXQoKSBpbiBvdmVycmlkZGVuIGxheW91dCgpIE9SIGZyb20gdGhlIGV4aXN0aW5nIGNhbGwgaW5cbiAgICogICAgICAgdXBkYXRlTGF5b3V0KCkuIERvaW5nIHNvIHdvdWxkIGJyZWFrIHRoZSBsb2NrIG1lY2hhbmlzbS5cbiAgICogTk9URTogQ2Fubm90IGJlIG1hcmtlZCBhcyBhYnN0cmFjdCBkdWUgdG8gaG93IG1peGlucyB3b3JrXG4gICAqL1xuICBwcm90ZWN0ZWQgbGF5b3V0KCk6IHZvaWQge1xuICAgIC8vIFNlZSBzdWJjbGFzcyBmb3IgaW1wbGVtZW50YXRpb25cbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXQgaXNMb2NrZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xheW91dExvY2tDb3VudCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogTG9ja3MgdGhlIGxheW91dCwgc28gdGhhdCBhdXRvbWF0aWMgbGF5b3V0IHdpbGwgTk9UIGJlIHRyaWdnZXJlZCBzeW5jaHJvbm91c2x5IHVudGlsIHVubG9jaygpIGlzIGNhbGxlZCBhbmRcbiAgICogdGhlIGxvY2sgY291bnQgcmV0dXJucyB0byAwLiBUaGlzIGlzIHNldCB1cCBzbyB0aGF0IGlmIHdlIHRyaWdnZXIgbXVsdGlwbGUgcmVlbnRyYW5jeSwgd2Ugd2lsbCBvbmx5IGF0dGVtcHQgdG9cbiAgICogcmUtbGF5b3V0IG9uY2UgQUxMIG9mIHRoZSBsYXlvdXRzIGFyZSBmaW5pc2hlZC5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgbG9jaygpOiB2b2lkIHtcbiAgICB0aGlzLl9sYXlvdXRMb2NrQ291bnQrKztcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmxvY2tzIHRoZSBsYXlvdXQuIEdlbmVyYWxseSAoYnV0IG5vdCBhbHdheXMpLCB1cGRhdGVMYXlvdXQoKSBvciB1cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCkgc2hvdWxkIGJlIGNhbGxlZFxuICAgKiBhZnRlciB0aGlzLCBhcyBsb2NrcyBhcmUgZ2VuZXJhbGx5IHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgdW5sb2NrKCk6IHZvaWQge1xuICAgIHRoaXMuX2xheW91dExvY2tDb3VudC0tO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlcmUgZm9yIG1hbnVhbCB2YWxpZGF0aW9uIChzYXksIGluIHRoZSBkZXZ0b29scykgLSBXaGlsZSBzb21lIGxheW91dHMgYXJlIGdvaW5nIG9uLCB0aGlzIG1heSBub3QgYmUgY29ycmVjdCwgc28gaXRcbiAgICogY291bGQgbm90IGJlIGFkZGVkIHRvIHBvc3QtbGF5b3V0IHZhbGlkYXRpb24uXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHZhbGlkYXRlTG9jYWxQcmVmZXJyZWRXaWR0aCggbGF5b3V0Q29udGFpbmVyOiBXaWR0aFNpemFibGVOb2RlICk6IHZvaWQge1xuICAgIGlmICggYXNzZXJ0ICYmIGxheW91dENvbnRhaW5lci5sb2NhbEJvdW5kcy5pc0Zpbml0ZSgpICYmICF0aGlzLl9sYXlvdXRBdHRlbXB0RHVyaW5nTG9jayApIHtcbiAgICAgIGxheW91dENvbnRhaW5lci52YWxpZGF0ZUxvY2FsUHJlZmVycmVkV2lkdGgoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVyZSBmb3IgbWFudWFsIHZhbGlkYXRpb24gKHNheSwgaW4gdGhlIGRldnRvb2xzKSAtIFdoaWxlIHNvbWUgbGF5b3V0cyBhcmUgZ29pbmcgb24sIHRoaXMgbWF5IG5vdCBiZSBjb3JyZWN0LCBzbyBpdFxuICAgKiBjb3VsZCBub3QgYmUgYWRkZWQgdG8gcG9zdC1sYXlvdXQgdmFsaWRhdGlvbi5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgdmFsaWRhdGVMb2NhbFByZWZlcnJlZEhlaWdodCggbGF5b3V0Q29udGFpbmVyOiBIZWlnaHRTaXphYmxlTm9kZSApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCAmJiBsYXlvdXRDb250YWluZXIubG9jYWxCb3VuZHMuaXNGaW5pdGUoKSAmJiAhdGhpcy5fbGF5b3V0QXR0ZW1wdER1cmluZ0xvY2sgKSB7XG4gICAgICBsYXlvdXRDb250YWluZXIudmFsaWRhdGVMb2NhbFByZWZlcnJlZEhlaWdodCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZXJlIGZvciBtYW51YWwgdmFsaWRhdGlvbiAoc2F5LCBpbiB0aGUgZGV2dG9vbHMpIC0gV2hpbGUgc29tZSBsYXlvdXRzIGFyZSBnb2luZyBvbiwgdGhpcyBtYXkgbm90IGJlIGNvcnJlY3QsIHNvIGl0XG4gICAqIGNvdWxkIG5vdCBiZSBhZGRlZCB0byBwb3N0LWxheW91dCB2YWxpZGF0aW9uLlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB2YWxpZGF0ZUxvY2FsUHJlZmVycmVkU2l6ZSggbGF5b3V0Q29udGFpbmVyOiBTaXphYmxlTm9kZSApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCAmJiBsYXlvdXRDb250YWluZXIubG9jYWxCb3VuZHMuaXNGaW5pdGUoKSAmJiAhdGhpcy5fbGF5b3V0QXR0ZW1wdER1cmluZ0xvY2sgKSB7XG4gICAgICBsYXlvdXRDb250YWluZXIudmFsaWRhdGVMb2NhbFByZWZlcnJlZFNpemUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGF5b3V0IG9mIHRoaXMgY29uc3RyYWludC4gQ2FsbGVkIGF1dG9tYXRpY2FsbHkgZHVyaW5nIGluaXRpYWxpemF0aW9uLCB3aGVuIGNoaWxkcmVuIGNoYW5nZSAoaWZcbiAgICogcmVzaXplIGlzIHRydWUpLCBvciB3aGVuIGNsaWVudCB3YW50cyB0byBjYWxsIHRoaXMgcHVibGljIG1ldGhvZCBmb3IgYW55IHJlYXNvbi5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGVMYXlvdXQoKTogdm9pZCB7XG4gICAgbGV0IGNvdW50ID0gMDtcblxuICAgIC8vIElmIHdlJ3JlIGxvY2tlZCBBTkQgc29tZW9uZSB0cmllcyB0byBkbyBsYXlvdXQsIHJlY29yZCB0aGlzIHNvIHdlIGNhbiBhdHRlbXB0IGxheW91dCBvbmNlIHdlIGFyZSBub3QgbG9ja2VkXG4gICAgLy8gYW55bW9yZS4gV2UgaGF2ZSBzb21lIGluZmluaXRlLWxvb3AgZGV0ZWN0aW9uIGhlcmUgZm9yIGNvbW1vbiBkZXZlbG9wbWVudCBlcnJvcnMuXG4gICAgaWYgKCB0aGlzLmlzTG9ja2VkICkge1xuICAgICAgYXNzZXJ0ICYmIGNvdW50Kys7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCArK2NvdW50IDwgNTAwLCAnTGlrZWx5IGluZmluaXRlIGxvb3AgZGV0ZWN0ZWQsIGFyZSB3ZSB0cmlnZ2VyaW5nIGxheW91dCB3aXRoaW4gdGhlIGxheW91dD8nICk7XG4gICAgICB0aGlzLl9sYXlvdXRBdHRlbXB0RHVyaW5nTG9jayA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5sb2NrKCk7XG5cbiAgICAgIC8vIFJ1biBsYXlvdXQgdW50aWwgd2UgZGlkbid0IGdldCBhIGxheW91dCBhdHRlbXB0IGR1cmluZyBvdXIgbGFzdCBhdHRlbXB0LiBUaGlzIGNvbXBvbmVudCdzIGxheW91dCBzaG91bGQgbm93XG4gICAgICAvLyBiZSBjb3JyZWN0IGFuZCBzdGFibGUuXG4gICAgICBkbyB7XG4gICAgICAgIHRoaXMuX2xheW91dEF0dGVtcHREdXJpbmdMb2NrID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGF5b3V0KCk7XG4gICAgICB9XG4gICAgICAgIC8vIElmIHdlIGdvdCBhbnkgbGF5b3V0IGF0dGVtcHRzIGR1cmluZyB0aGUgbG9jaywgd2UnbGwgd2FudCB0byByZXJ1biB0aGUgbGF5b3V0XG4gICAgICB3aGlsZSAoIHRoaXMuX2xheW91dEF0dGVtcHREdXJpbmdMb2NrICk7XG5cbiAgICAgIHRoaXMudW5sb2NrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHdlIGF0dGVtcHQgdG8gYXV0b21hdGljYWxseSBsYXlvdXQgY29tcG9uZW50cy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2VuYWJsZWQgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTGF5b3V0UHJveHkgZm9yIGEgdW5pcXVlIHRyYWlsIGZyb20gb3VyIGFuY2VzdG9yTm9kZSB0byB0aGlzIE5vZGUgKG9yIG51bGwgaWYgdGhhdCdzIG5vdCBwb3NzaWJsZSlcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgY3JlYXRlTGF5b3V0UHJveHkoIG5vZGU6IE5vZGUgKTogTGF5b3V0UHJveHkgfCBudWxsIHtcbiAgICBjb25zdCB0cmFpbHMgPSBub2RlLmdldFRyYWlscyggbiA9PiBuID09PSB0aGlzLmFuY2VzdG9yTm9kZSApO1xuXG4gICAgaWYgKCB0cmFpbHMubGVuZ3RoID09PSAxICkge1xuICAgICAgcmV0dXJuIExheW91dFByb3h5LnBvb2wuY3JlYXRlKCB0cmFpbHNbIDAgXS5yZW1vdmVBbmNlc3RvcigpICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBlbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkO1xuICB9XG5cbiAgcHVibGljIHNldCBlbmFibGVkKCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICBpZiAoIHRoaXMuX2VuYWJsZWQgIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fZW5hYmxlZCA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgLy8gQ2xlYW4gdXAgbGlzdGVuZXJzIHRvIGFueSBsaXN0ZW5lZCBub2Rlc1xuICAgIGNvbnN0IGxpc3RlbmVkTm9kZXMgPSBbIC4uLnRoaXMuX2xpc3RlbmVkTm9kZXMua2V5cygpIF07XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZWROb2Rlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMucmVtb3ZlTm9kZSggbGlzdGVuZWROb2Rlc1sgaSBdICk7XG4gICAgfVxuXG4gICAgdGhpcy5maW5pc2hlZExheW91dEVtaXR0ZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdMYXlvdXRDb25zdHJhaW50JywgTGF5b3V0Q29uc3RyYWludCApOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImV4dGVuZHNIZWlnaHRTaXphYmxlIiwiZXh0ZW5kc1dpZHRoU2l6YWJsZSIsIkxheW91dFByb3h5Iiwic2NlbmVyeSIsIkxheW91dENvbnN0cmFpbnQiLCJhZGROb2RlIiwibm9kZSIsImFkZExvY2siLCJhc3NlcnQiLCJfbGlzdGVuZWROb2RlcyIsImhhcyIsIl9hY3RpdmVQYXJlbnRMYXlvdXRDb25zdHJhaW50IiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsIl91cGRhdGVMYXlvdXRMaXN0ZW5lciIsInZpc2libGVQcm9wZXJ0eSIsIm1pbmltdW1XaWR0aFByb3BlcnR5IiwiaXNXaWR0aFJlc2l6YWJsZVByb3BlcnR5IiwibWluaW11bUhlaWdodFByb3BlcnR5IiwiaXNIZWlnaHRSZXNpemFibGVQcm9wZXJ0eSIsImFkZCIsInJlbW92ZU5vZGUiLCJ1bmxpbmsiLCJkZWxldGUiLCJsYXlvdXQiLCJpc0xvY2tlZCIsIl9sYXlvdXRMb2NrQ291bnQiLCJsb2NrIiwidW5sb2NrIiwidmFsaWRhdGVMb2NhbFByZWZlcnJlZFdpZHRoIiwibGF5b3V0Q29udGFpbmVyIiwibG9jYWxCb3VuZHMiLCJpc0Zpbml0ZSIsIl9sYXlvdXRBdHRlbXB0RHVyaW5nTG9jayIsInZhbGlkYXRlTG9jYWxQcmVmZXJyZWRIZWlnaHQiLCJ2YWxpZGF0ZUxvY2FsUHJlZmVycmVkU2l6ZSIsInVwZGF0ZUxheW91dCIsImNvdW50IiwidXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSIsIl9lbmFibGVkIiwiY3JlYXRlTGF5b3V0UHJveHkiLCJ0cmFpbHMiLCJnZXRUcmFpbHMiLCJuIiwiYW5jZXN0b3JOb2RlIiwibGVuZ3RoIiwicG9vbCIsImNyZWF0ZSIsInJlbW92ZUFuY2VzdG9yIiwiZW5hYmxlZCIsInZhbHVlIiwiZGlzcG9zZSIsImxpc3RlbmVkTm9kZXMiLCJrZXlzIiwiaSIsImZpbmlzaGVkTGF5b3V0RW1pdHRlciIsIlNldCIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBR0QsT0FBT0EsaUJBQWlCLHFDQUFxQztBQUM3RCxTQUFTQyxvQkFBb0IsRUFBRUMsbUJBQW1CLEVBQXFCQyxXQUFXLEVBQVFDLE9BQU8sUUFBdUMsbUJBQW1CO0FBRTVJLElBQUEsQUFBZUMsbUJBQWYsTUFBZUE7SUErQjVCOzs7Ozs7Ozs7O0dBVUMsR0FDRCxBQUFPQyxRQUFTQyxJQUFVLEVBQUVDLFVBQVUsSUFBSSxFQUFTO1FBQ2pEQyxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDQyxjQUFjLENBQUNDLEdBQUcsQ0FBRUo7UUFDNUNFLFVBQVVBLE9BQVEsQ0FBQ0QsV0FBVyxDQUFDRCxLQUFLSyw2QkFBNkIsRUFBRTtRQUVuRSxJQUFLSixTQUFVO1lBQ2JELEtBQUtLLDZCQUE2QixHQUFHLElBQUk7UUFDM0M7UUFFQUwsS0FBS00sY0FBYyxDQUFDQyxRQUFRLENBQUUsSUFBSSxDQUFDQyxxQkFBcUI7UUFDeERSLEtBQUtTLGVBQWUsQ0FBQ0YsUUFBUSxDQUFFLElBQUksQ0FBQ0MscUJBQXFCO1FBQ3pELElBQUtiLG9CQUFxQkssT0FBUztZQUNqQ0EsS0FBS1Usb0JBQW9CLENBQUNILFFBQVEsQ0FBRSxJQUFJLENBQUNDLHFCQUFxQjtZQUM5RFIsS0FBS1csd0JBQXdCLENBQUNKLFFBQVEsQ0FBRSxJQUFJLENBQUNDLHFCQUFxQjtRQUNwRTtRQUNBLElBQUtkLHFCQUFzQk0sT0FBUztZQUNsQ0EsS0FBS1kscUJBQXFCLENBQUNMLFFBQVEsQ0FBRSxJQUFJLENBQUNDLHFCQUFx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