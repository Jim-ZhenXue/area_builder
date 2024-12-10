// Copyright 2024, University of Colorado Boulder
/**
 * A Property that will contain a list of Trails where the root of the trail is a root Node of a Display, and the leaf
 * node is the provided Node.
 *
 * // REVIEW: This is a very complicated component and deserves a bit more doc. Some ideas about what to explain:
 * // REVIEW:   1. That this is synchronously updated and doesn't listen to instances.
 * // REVIEW:   2.
 * // REVIEW:   2.
 * // REVIEW:   2.
 *
 * // REVIEW: can you describe this a bit more. Do you mean any Node in a trail? What about if the provided Node is disposed?
 * NOTE: If a Node is disposed, it will be removed from the trails.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Display, scenery, Trail } from '../imports.js';
let DisplayedTrailsProperty = class DisplayedTrailsProperty extends TinyProperty {
    update() {
        // Factored out because we're using a "function" below for recursion (NOT an arrow function)
        const display = this.display;
        const followPDOMOrder = this.followPDOMOrder;
        const requireVisible = this.requireVisible;
        const requirePDOMVisible = this.requirePDOMVisible;
        const requireEnabled = this.requireEnabled;
        const requireInputEnabled = this.requireInputEnabled;
        // Trails accumulated in our recursion that will be our Property's value
        const trails = [];
        // Nodes that were touched in the scan (we should listen to changes to ANY of these to see if there is a connection
        // or disconnection). This could potentially cause our Property to change
        const nodeSet = new Set();
        // Modified in-place during the search
        const trail = new Trail(this.node);
        // We will recursively add things to the "front" of the trail (ancestors)
        (function recurse() {
            const root = trail.rootNode();
            // If a Node is disposed, we won't add listeners to it, so we abort slightly earlier.
            if (root.isDisposed) {
                return;
            }
            nodeSet.add(root);
            // REVIEW: Please say why we need listeners on this Node. Also please confirm (via doc) that adding
            // If we fail other conditions, we won't add a trail OR recurse, but we will STILL have listeners added to the Node.
            if (requireVisible && !root.visible || requirePDOMVisible && !root.pdomVisible || requireEnabled && !root.enabled || requireInputEnabled && !root.inputEnabled) {
                return;
            }
            const displays = root.getRootedDisplays();
            // REVIEW: initialize to false?
            let displayMatches;
            if (display === null) {
                displayMatches = displays.length > 0;
            } else if (display instanceof Display) {
                displayMatches = displays.includes(display);
            } else {
                displayMatches = displays.some(display);
            }
            if (displayMatches) {
                // Create a permanent copy that won't be mutated
                trails.push(trail.copy());
            }
            // REVIEW: I'm officially confused about this feature. What is the value of "either or", why not be able to
            // support both visual and PDOM in the same Property? If this is indeed best, please be sure to explain where
            // the option is defined.
            const parents = followPDOMOrder && root.pdomParent ? [
                root.pdomParent
            ] : root.parents;
            parents.forEach((parent)=>{
                trail.addAncestor(parent);
                recurse();
                trail.removeAncestor();
            });
        })();
        // REVIEW: Webstorm flagged the next 29 lines as duplicated with TrailsBetweenProperty. Let's factor that our or fix that somehow.
        // Add in new needed listeners
        nodeSet.forEach((node)=>{
            if (!this.listenedNodeSet.has(node)) {
                this.addNodeListener(node);
            }
        });
        // Remove listeners not needed anymore
        this.listenedNodeSet.forEach((node)=>{
            if (!nodeSet.has(node)) {
                this.removeNodeListener(node);
            }
        });
        // Guard in a way that deepEquality on the Property wouldn't (because of the Array wrapper)
        // NOTE: Duplicated with TrailsBetweenProperty, likely can be factored out.
        // REVIEW: ^^^^ +1, yes please factor out.
        const currentTrails = this.value;
        let trailsEqual = currentTrails.length === trails.length;
        if (trailsEqual) {
            for(let i = 0; i < trails.length; i++){
                if (!currentTrails[i].equals(trails[i])) {
                    trailsEqual = false;
                    break;
                }
            }
        }
        // REVIEW: Can this be improved upon by utilizing a custom valueComparisonStrategy? I don't see that being much
        // less performant given that you are doing all the above work on each call to update().
        if (!trailsEqual) {
            this.value = trails;
        }
    }
    // REVIEW: Rename to either `addNodeListeners`, or something more general like `listenToNode()`.
    addNodeListener(node) {
        this.listenedNodeSet.add(node);
        // Unconditional listeners, which affect all nodes.
        node.parentAddedEmitter.addListener(this._trailUpdateListener);
        node.parentRemovedEmitter.addListener(this._trailUpdateListener);
        node.rootedDisplayChangedEmitter.addListener(this._trailUpdateListener);
        node.disposeEmitter.addListener(this._trailUpdateListener);
        if (this.followPDOMOrder) {
            node.pdomParentChangedEmitter.addListener(this._trailUpdateListener);
        }
        if (this.requireVisible) {
            node.visibleProperty.lazyLink(this._trailUpdateListener);
        }
        if (this.requirePDOMVisible) {
            node.pdomVisibleProperty.lazyLink(this._trailUpdateListener);
        }
        if (this.requireEnabled) {
            node.enabledProperty.lazyLink(this._trailUpdateListener);
        }
        if (this.requireInputEnabled) {
            node.inputEnabledProperty.lazyLink(this._trailUpdateListener);
        }
    }
    removeNodeListener(node) {
        this.listenedNodeSet.delete(node);
        node.parentAddedEmitter.removeListener(this._trailUpdateListener);
        node.parentRemovedEmitter.removeListener(this._trailUpdateListener);
        node.rootedDisplayChangedEmitter.removeListener(this._trailUpdateListener);
        node.disposeEmitter.removeListener(this._trailUpdateListener);
        if (this.followPDOMOrder) {
            node.pdomParentChangedEmitter.removeListener(this._trailUpdateListener);
        }
        if (this.requireVisible) {
            node.visibleProperty.unlink(this._trailUpdateListener);
        }
        if (this.requirePDOMVisible) {
            node.pdomVisibleProperty.unlink(this._trailUpdateListener);
        }
        if (this.requireEnabled) {
            node.enabledProperty.unlink(this._trailUpdateListener);
        }
        if (this.requireInputEnabled) {
            node.inputEnabledProperty.unlink(this._trailUpdateListener);
        }
    }
    // REVIEW: I always forget why you don't need to also clear your reference to the provided Node. Do you?
    // REVIEW: Also maybe assert here that your provided node is in this listened to Node set?
    dispose() {
        this.listenedNodeSet.forEach((node)=>this.removeNodeListener(node));
        super.dispose();
    }
    /**
   * We will contain Trails whose leaf node (lastNode) is this provided Node.
   */ constructor(node, providedOptions){
        const options = optionize()({
            // Listen to all displays
            display: null,
            // Default to visual trails (just children), with only pruning by normal visibility
            followPDOMOrder: false,
            requireVisible: true,
            requirePDOMVisible: false,
            requireEnabled: false,
            requireInputEnabled: false
        }, providedOptions);
        super([]), // REVIEW: Please add doc why we only need to listen to a Node once, even if it is in multiple trails?
        this.listenedNodeSet = new Set();
        // Save options for later updates
        this.node = node;
        this.display = options.display;
        this.followPDOMOrder = options.followPDOMOrder;
        this.requireVisible = options.requireVisible;
        this.requirePDOMVisible = options.requirePDOMVisible;
        this.requireEnabled = options.requireEnabled;
        this.requireInputEnabled = options.requireInputEnabled;
        this._trailUpdateListener = this.update.bind(this);
        this.update();
    }
};
export { DisplayedTrailsProperty as default };
scenery.register('DisplayedTrailsProperty', DisplayedTrailsProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9EaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0IHdpbGwgY29udGFpbiBhIGxpc3Qgb2YgVHJhaWxzIHdoZXJlIHRoZSByb290IG9mIHRoZSB0cmFpbCBpcyBhIHJvb3QgTm9kZSBvZiBhIERpc3BsYXksIGFuZCB0aGUgbGVhZlxuICogbm9kZSBpcyB0aGUgcHJvdmlkZWQgTm9kZS5cbiAqXG4gKiAvLyBSRVZJRVc6IFRoaXMgaXMgYSB2ZXJ5IGNvbXBsaWNhdGVkIGNvbXBvbmVudCBhbmQgZGVzZXJ2ZXMgYSBiaXQgbW9yZSBkb2MuIFNvbWUgaWRlYXMgYWJvdXQgd2hhdCB0byBleHBsYWluOlxuICogLy8gUkVWSUVXOiAgIDEuIFRoYXQgdGhpcyBpcyBzeW5jaHJvbm91c2x5IHVwZGF0ZWQgYW5kIGRvZXNuJ3QgbGlzdGVuIHRvIGluc3RhbmNlcy5cbiAqIC8vIFJFVklFVzogICAyLlxuICogLy8gUkVWSUVXOiAgIDIuXG4gKiAvLyBSRVZJRVc6ICAgMi5cbiAqXG4gKiAvLyBSRVZJRVc6IGNhbiB5b3UgZGVzY3JpYmUgdGhpcyBhIGJpdCBtb3JlLiBEbyB5b3UgbWVhbiBhbnkgTm9kZSBpbiBhIHRyYWlsPyBXaGF0IGFib3V0IGlmIHRoZSBwcm92aWRlZCBOb2RlIGlzIGRpc3Bvc2VkP1xuICogTk9URTogSWYgYSBOb2RlIGlzIGRpc3Bvc2VkLCBpdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgdHJhaWxzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBOb2RlLCBzY2VuZXJ5LCBUcmFpbCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG50eXBlIERpc3BsYXlQcmVkaWNhdGUgPSBEaXNwbGF5IHwgKCAoIGRpc3BsYXk6IERpc3BsYXkgKSA9PiBib29sZWFuICkgfCBudWxsO1xuXG5leHBvcnQgdHlwZSBEaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eU9wdGlvbnMgPSB7XG4gIC8vIElmIHByb3ZpZGVkLCB3ZSB3aWxsIG9ubHkgcmVwb3J0IHRyYWlscyB0aGF0IGFyZSByb290ZWQgZm9yIHRoZSBzcGVjaWZpYyBEaXNwbGF5IHByb3ZpZGVkLlxuICBkaXNwbGF5PzogRGlzcGxheVByZWRpY2F0ZTtcblxuICAvLyBJZiB0cnVlLCB3ZSB3aWxsIGFkZGl0aW9uYWxseSBmb2xsb3cgdGhlIHBkb21QYXJlbnQgaWYgaXQgaXMgYXZhaWxhYmxlIChpZiBvdXIgY2hpbGQgbm9kZSBpcyBzcGVjaWZpZWQgaW4gYSBwZG9tT3JkZXIgb2YgYW5vdGhlclxuICAvLyBub2RlLCB3ZSB3aWxsIGZvbGxvdyB0aGF0IG9yZGVyKS5cbiAgLy8gVGhpcyBlc3NlbnRpYWxseSB0cmFja3MgdGhlIGZvbGxvd2luZzpcbiAgLy9cbiAgLy8gUkVWSUVXOiBJJ2QgYWN0dWFsbHkgYWRkIFthLXpdP1Bkb21bQS1aXSB0byBwaGV0L2JhZC1zaW0tdGV4dCBpZiB5b3UncmUgYWxyaWdodCB3aXRoIHRoYXQuIENsb3NlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2Jsb2IvZjU2YzI3Mzk3MGYyMmY4NTdiYzhmNWJkMDE0OGYyNTY1MzRhNzAyZi9lc2xpbnQvcnVsZXMvYmFkLXNpbS10ZXh0LmpzI0wzNS1MMzZcbiAgLy9cbiAgLy8gUkVWSUVXOiBBcmVuJ3QgdGhlc2UgYm9vbGVhbiB2YWx1ZXMgb3Bwb3NpdGU/IGZvbGxvd1BET01PcmRlcjp0cnVlIHNob3VsZCByZXNwZWN0IHBkb21PcmRlci4gQWxzbywgaXQgaXNuJ3QgY2xlYXJcbiAgLy8gICAgICAgICBmcm9tIHRoZSBkb2MgaG93IHlvdSBhc2sgZm9yIFwiYWxsIHRyYWlscywgdmlzdWFsIG9yIFBET01cIi4gSXMgdGhhdCBwYXJ0IG9mIHRoZSBmZWF0dXJlc2V0PyBJIGJlbGlldmVcbiAgLy8gICAgICAgICB0aGF0IGxpa2VseSB3ZSB3b3VsZCBhbHdheXMgZm9yY2UgdmlzaWJsZSBhcyBhIGJhc2UgZmVhdHVyZSwgYW5kIG9ubHkgYWRkIG9uIHZpc2liaWxpdHksIGJ1dCB0aGlzIHNob3VsZFxuICAvLyAgICAgICAgIGJlIGV4cGxhaW5lZC4gQXMgZWFzeSBhcyB0aGUgZG9jIHVwZGF0ZSBhYm92ZSBJIGp1c3QgZGlkOiBcIndlIHdpbGwgX2FkZGl0aW9uYWxseV8gZm9sbG93IHRoZSBwZG9tUGFyZW50XCJcbiAgLy8gLSBmb2xsb3dQRE9NT3JkZXI6IHRydWUgPSB2aXN1YWwgdHJhaWxzIChqdXN0IGNoaWxkcmVuKVxuICAvLyAtIGZvbGxvd1BET01PcmRlcjogZmFsc2UgPSBwZG9tIHRyYWlscyAocmVzcGVjdGluZyBwZG9tT3JkZXIpXG4gIGZvbGxvd1BET01PcmRlcj86IGJvb2xlYW47XG5cbiAgLy8gSWYgdHJ1ZSwgd2Ugd2lsbCBvbmx5IHJlcG9ydCB0cmFpbHMgd2hlcmUgZXZlcnkgbm9kZSBpcyB2aXNpYmxlOiB0cnVlLlxuICByZXF1aXJlVmlzaWJsZT86IGJvb2xlYW47XG5cbiAgLy8gSWYgdHJ1ZSwgd2Ugd2lsbCBvbmx5IHJlcG9ydCB0cmFpbHMgd2hlcmUgZXZlcnkgbm9kZSBpcyBwZG9tVmlzaWJsZTogdHJ1ZS5cbiAgcmVxdWlyZVBET01WaXNpYmxlPzogYm9vbGVhbjtcblxuICAvLyBJZiB0cnVlLCB3ZSB3aWxsIG9ubHkgcmVwb3J0IHRyYWlscyB3aGVyZSBldmVyeSBub2RlIGlzIGVuYWJsZWQ6IHRydWUuXG4gIHJlcXVpcmVFbmFibGVkPzogYm9vbGVhbjtcblxuICAvLyBJZiB0cnVlLCB3ZSB3aWxsIG9ubHkgcmVwb3J0IHRyYWlscyB3aGVyZSBldmVyeSBub2RlIGlzIGlucHV0RW5hYmxlZDogdHJ1ZS5cbiAgcmVxdWlyZUlucHV0RW5hYmxlZD86IGJvb2xlYW47XG5cbiAgLy8gUkVWSUVXOiBJbnN0ZWFkIG9mIGZvbGxvd2luZyB0aGUgc2FtZSBmZWF0dXJlIGFib3ZlLCBjYW4gd2UganVzdCB1c2UgYHBpY2thYmxlOmZhbHNlYCB0byBoZWxwIHVzIHBydW5lLiBJIGFncmVlXG4gIC8vICAgICAgICAgICBpdCBtYXkgbm90IGJlIHdvcnRoIHdoaWxlIHRvIGxpc3RlbiB0byB0aGUgY29tYm8gb2YgcGlja2FibGUraW5wdXRMaXN0ZW5lckxlbmd0aC4gQ2FuIHlvdSBkZXNjcmliZSB3aGF0IGJlbmVmaXRcbiAgLy8gICAgICAgICAgIHdlIG1heSBnZXQgYnkgYWRkaW5nIGluIFBpY2thYmxlIGxpc3RlbmluZz9cbiAgLy8gTk9URTogQ291bGQgdGhpbmsgYWJvdXQgYWRkaW5nIHBpY2thYmlsaXR5IGhlcmUgaW4gdGhlIGZ1dHVyZS4gVGhlIGNvbXBsaWNhdGlvbiBpcyB0aGF0IGl0IGRvZXNuJ3QgbWVhc3VyZSBvdXIgaGl0XG4gIC8vIHRlc3RpbmcgcHJlY2lzZWx5LCBiZWNhdXNlIG9mIHBpY2thYmxlOm51bGwgKGRlZmF1bHQpIGFuZCB0aGUgcG90ZW50aWFsIGV4aXN0ZW5jZSBvZiBpbnB1dCBsaXN0ZW5lcnMuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eSBleHRlbmRzIFRpbnlQcm9wZXJ0eTxUcmFpbFtdPiB7XG5cbiAgLy8gUkVWSUVXOiBIb3cgYWJvdXQgYSByZW5hbWUgbGlrZSBcInRhcmdldE5vZGVcIiwgbm8gc3Ryb25nIHByZWZlcmVuY2UgaWYgeW91IGRvbid0IHdhbnQgdG8uXG4gIHB1YmxpYyByZWFkb25seSBub2RlOiBOb2RlO1xuXG4gIC8vIFJFVklFVzogUGxlYXNlIGFkZCBkb2Mgd2h5IHdlIG9ubHkgbmVlZCB0byBsaXN0ZW4gdG8gYSBOb2RlIG9uY2UsIGV2ZW4gaWYgaXQgaXMgaW4gbXVsdGlwbGUgdHJhaWxzP1xuICBwdWJsaWMgcmVhZG9ubHkgbGlzdGVuZWROb2RlU2V0OiBTZXQ8Tm9kZT4gPSBuZXcgU2V0PE5vZGU+KCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3RyYWlsVXBkYXRlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gUmVjb3JkZWQgb3B0aW9uc1xuICAvLyBSRVZJRVc6IFBsZWFzZSByZW5hbWUgdGhpcyBhbmQgdGhlIG9wdGlvbiB0byBzb21ldGhpbmcgbGVzcyBjb25mdXNpbmcuIFBlcmhhcHMgYGRpc3BsYXlTdXBwb3J0YCwgb3JcbiAgLy8gYHdoaWNoRGlzcGxheWAsIG9yIHNvbWV0aGluZyB0aGF0IHNvdW5kcyBsaWtlIGl0IGNvdWxkIGJlIGEgcHJlZGljYXRlLlxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXk6IERpc3BsYXlQcmVkaWNhdGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgZm9sbG93UERPTU9yZGVyOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVWaXNpYmxlOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlcXVpcmVQRE9NVmlzaWJsZTogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSByZXF1aXJlRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSByZXF1aXJlSW5wdXRFbmFibGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXZSB3aWxsIGNvbnRhaW4gVHJhaWxzIHdob3NlIGxlYWYgbm9kZSAobGFzdE5vZGUpIGlzIHRoaXMgcHJvdmlkZWQgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggbm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogRGlzcGxheWVkVHJhaWxzUHJvcGVydHlPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eU9wdGlvbnM+KCkoIHtcbiAgICAgIC8vIExpc3RlbiB0byBhbGwgZGlzcGxheXNcbiAgICAgIGRpc3BsYXk6IG51bGwsXG5cbiAgICAgIC8vIERlZmF1bHQgdG8gdmlzdWFsIHRyYWlscyAoanVzdCBjaGlsZHJlbiksIHdpdGggb25seSBwcnVuaW5nIGJ5IG5vcm1hbCB2aXNpYmlsaXR5XG4gICAgICBmb2xsb3dQRE9NT3JkZXI6IGZhbHNlLFxuICAgICAgcmVxdWlyZVZpc2libGU6IHRydWUsXG4gICAgICByZXF1aXJlUERPTVZpc2libGU6IGZhbHNlLFxuICAgICAgcmVxdWlyZUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgcmVxdWlyZUlucHV0RW5hYmxlZDogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBbXSApO1xuXG4gICAgLy8gU2F2ZSBvcHRpb25zIGZvciBsYXRlciB1cGRhdGVzXG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLmRpc3BsYXkgPSBvcHRpb25zLmRpc3BsYXk7XG4gICAgdGhpcy5mb2xsb3dQRE9NT3JkZXIgPSBvcHRpb25zLmZvbGxvd1BET01PcmRlcjtcbiAgICB0aGlzLnJlcXVpcmVWaXNpYmxlID0gb3B0aW9ucy5yZXF1aXJlVmlzaWJsZTtcbiAgICB0aGlzLnJlcXVpcmVQRE9NVmlzaWJsZSA9IG9wdGlvbnMucmVxdWlyZVBET01WaXNpYmxlO1xuICAgIHRoaXMucmVxdWlyZUVuYWJsZWQgPSBvcHRpb25zLnJlcXVpcmVFbmFibGVkO1xuICAgIHRoaXMucmVxdWlyZUlucHV0RW5hYmxlZCA9IG9wdGlvbnMucmVxdWlyZUlucHV0RW5hYmxlZDtcblxuICAgIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgPSB0aGlzLnVwZGF0ZS5iaW5kKCB0aGlzICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoKTogdm9pZCB7XG5cbiAgICAvLyBGYWN0b3JlZCBvdXQgYmVjYXVzZSB3ZSdyZSB1c2luZyBhIFwiZnVuY3Rpb25cIiBiZWxvdyBmb3IgcmVjdXJzaW9uIChOT1QgYW4gYXJyb3cgZnVuY3Rpb24pXG4gICAgY29uc3QgZGlzcGxheSA9IHRoaXMuZGlzcGxheTtcbiAgICBjb25zdCBmb2xsb3dQRE9NT3JkZXIgPSB0aGlzLmZvbGxvd1BET01PcmRlcjtcbiAgICBjb25zdCByZXF1aXJlVmlzaWJsZSA9IHRoaXMucmVxdWlyZVZpc2libGU7XG4gICAgY29uc3QgcmVxdWlyZVBET01WaXNpYmxlID0gdGhpcy5yZXF1aXJlUERPTVZpc2libGU7XG4gICAgY29uc3QgcmVxdWlyZUVuYWJsZWQgPSB0aGlzLnJlcXVpcmVFbmFibGVkO1xuICAgIGNvbnN0IHJlcXVpcmVJbnB1dEVuYWJsZWQgPSB0aGlzLnJlcXVpcmVJbnB1dEVuYWJsZWQ7XG5cbiAgICAvLyBUcmFpbHMgYWNjdW11bGF0ZWQgaW4gb3VyIHJlY3Vyc2lvbiB0aGF0IHdpbGwgYmUgb3VyIFByb3BlcnR5J3MgdmFsdWVcbiAgICBjb25zdCB0cmFpbHM6IFRyYWlsW10gPSBbXTtcblxuICAgIC8vIE5vZGVzIHRoYXQgd2VyZSB0b3VjaGVkIGluIHRoZSBzY2FuICh3ZSBzaG91bGQgbGlzdGVuIHRvIGNoYW5nZXMgdG8gQU5ZIG9mIHRoZXNlIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGNvbm5lY3Rpb25cbiAgICAvLyBvciBkaXNjb25uZWN0aW9uKS4gVGhpcyBjb3VsZCBwb3RlbnRpYWxseSBjYXVzZSBvdXIgUHJvcGVydHkgdG8gY2hhbmdlXG4gICAgY29uc3Qgbm9kZVNldCA9IG5ldyBTZXQ8Tm9kZT4oKTtcblxuICAgIC8vIE1vZGlmaWVkIGluLXBsYWNlIGR1cmluZyB0aGUgc2VhcmNoXG4gICAgY29uc3QgdHJhaWwgPSBuZXcgVHJhaWwoIHRoaXMubm9kZSApO1xuXG4gICAgLy8gV2Ugd2lsbCByZWN1cnNpdmVseSBhZGQgdGhpbmdzIHRvIHRoZSBcImZyb250XCIgb2YgdGhlIHRyYWlsIChhbmNlc3RvcnMpXG4gICAgKCBmdW5jdGlvbiByZWN1cnNlKCkge1xuICAgICAgY29uc3Qgcm9vdCA9IHRyYWlsLnJvb3ROb2RlKCk7XG5cbiAgICAgIC8vIElmIGEgTm9kZSBpcyBkaXNwb3NlZCwgd2Ugd29uJ3QgYWRkIGxpc3RlbmVycyB0byBpdCwgc28gd2UgYWJvcnQgc2xpZ2h0bHkgZWFybGllci5cbiAgICAgIGlmICggcm9vdC5pc0Rpc3Bvc2VkICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG5vZGVTZXQuYWRkKCByb290ICk7XG5cbiAgICAgIC8vIFJFVklFVzogUGxlYXNlIHNheSB3aHkgd2UgbmVlZCBsaXN0ZW5lcnMgb24gdGhpcyBOb2RlLiBBbHNvIHBsZWFzZSBjb25maXJtICh2aWEgZG9jKSB0aGF0IGFkZGluZ1xuICAgICAgLy8gSWYgd2UgZmFpbCBvdGhlciBjb25kaXRpb25zLCB3ZSB3b24ndCBhZGQgYSB0cmFpbCBPUiByZWN1cnNlLCBidXQgd2Ugd2lsbCBTVElMTCBoYXZlIGxpc3RlbmVycyBhZGRlZCB0byB0aGUgTm9kZS5cbiAgICAgIGlmIChcbiAgICAgICAgKCByZXF1aXJlVmlzaWJsZSAmJiAhcm9vdC52aXNpYmxlICkgfHxcbiAgICAgICAgKCByZXF1aXJlUERPTVZpc2libGUgJiYgIXJvb3QucGRvbVZpc2libGUgKSB8fFxuICAgICAgICAoIHJlcXVpcmVFbmFibGVkICYmICFyb290LmVuYWJsZWQgKSB8fFxuICAgICAgICAoIHJlcXVpcmVJbnB1dEVuYWJsZWQgJiYgIXJvb3QuaW5wdXRFbmFibGVkIClcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRpc3BsYXlzID0gcm9vdC5nZXRSb290ZWREaXNwbGF5cygpO1xuXG4gICAgICAvLyBSRVZJRVc6IGluaXRpYWxpemUgdG8gZmFsc2U/XG4gICAgICBsZXQgZGlzcGxheU1hdGNoZXM6IGJvb2xlYW47XG5cbiAgICAgIGlmICggZGlzcGxheSA9PT0gbnVsbCApIHtcbiAgICAgICAgZGlzcGxheU1hdGNoZXMgPSBkaXNwbGF5cy5sZW5ndGggPiAwO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGRpc3BsYXkgaW5zdGFuY2VvZiBEaXNwbGF5ICkge1xuICAgICAgICBkaXNwbGF5TWF0Y2hlcyA9IGRpc3BsYXlzLmluY2x1ZGVzKCBkaXNwbGF5ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZGlzcGxheU1hdGNoZXMgPSBkaXNwbGF5cy5zb21lKCBkaXNwbGF5ICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggZGlzcGxheU1hdGNoZXMgKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIHBlcm1hbmVudCBjb3B5IHRoYXQgd29uJ3QgYmUgbXV0YXRlZFxuICAgICAgICB0cmFpbHMucHVzaCggdHJhaWwuY29weSgpICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJFVklFVzogSSdtIG9mZmljaWFsbHkgY29uZnVzZWQgYWJvdXQgdGhpcyBmZWF0dXJlLiBXaGF0IGlzIHRoZSB2YWx1ZSBvZiBcImVpdGhlciBvclwiLCB3aHkgbm90IGJlIGFibGUgdG9cbiAgICAgIC8vIHN1cHBvcnQgYm90aCB2aXN1YWwgYW5kIFBET00gaW4gdGhlIHNhbWUgUHJvcGVydHk/IElmIHRoaXMgaXMgaW5kZWVkIGJlc3QsIHBsZWFzZSBiZSBzdXJlIHRvIGV4cGxhaW4gd2hlcmVcbiAgICAgIC8vIHRoZSBvcHRpb24gaXMgZGVmaW5lZC5cbiAgICAgIGNvbnN0IHBhcmVudHMgPSBmb2xsb3dQRE9NT3JkZXIgJiYgcm9vdC5wZG9tUGFyZW50ID8gWyByb290LnBkb21QYXJlbnQgXSA6IHJvb3QucGFyZW50cztcblxuICAgICAgcGFyZW50cy5mb3JFYWNoKCBwYXJlbnQgPT4ge1xuICAgICAgICB0cmFpbC5hZGRBbmNlc3RvciggcGFyZW50ICk7XG4gICAgICAgIHJlY3Vyc2UoKTtcbiAgICAgICAgdHJhaWwucmVtb3ZlQW5jZXN0b3IoKTtcbiAgICAgIH0gKTtcbiAgICB9ICkoKTtcblxuICAgIC8vIFJFVklFVzogV2Vic3Rvcm0gZmxhZ2dlZCB0aGUgbmV4dCAyOSBsaW5lcyBhcyBkdXBsaWNhdGVkIHdpdGggVHJhaWxzQmV0d2VlblByb3BlcnR5LiBMZXQncyBmYWN0b3IgdGhhdCBvdXIgb3IgZml4IHRoYXQgc29tZWhvdy5cbiAgICAvLyBBZGQgaW4gbmV3IG5lZWRlZCBsaXN0ZW5lcnNcbiAgICBub2RlU2V0LmZvckVhY2goIG5vZGUgPT4ge1xuICAgICAgaWYgKCAhdGhpcy5saXN0ZW5lZE5vZGVTZXQuaGFzKCBub2RlICkgKSB7XG4gICAgICAgIHRoaXMuYWRkTm9kZUxpc3RlbmVyKCBub2RlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBub3QgbmVlZGVkIGFueW1vcmVcbiAgICB0aGlzLmxpc3RlbmVkTm9kZVNldC5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgIGlmICggIW5vZGVTZXQuaGFzKCBub2RlICkgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTm9kZUxpc3RlbmVyKCBub2RlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gR3VhcmQgaW4gYSB3YXkgdGhhdCBkZWVwRXF1YWxpdHkgb24gdGhlIFByb3BlcnR5IHdvdWxkbid0IChiZWNhdXNlIG9mIHRoZSBBcnJheSB3cmFwcGVyKVxuICAgIC8vIE5PVEU6IER1cGxpY2F0ZWQgd2l0aCBUcmFpbHNCZXR3ZWVuUHJvcGVydHksIGxpa2VseSBjYW4gYmUgZmFjdG9yZWQgb3V0LlxuICAgIC8vIFJFVklFVzogXl5eXiArMSwgeWVzIHBsZWFzZSBmYWN0b3Igb3V0LlxuICAgIGNvbnN0IGN1cnJlbnRUcmFpbHMgPSB0aGlzLnZhbHVlO1xuICAgIGxldCB0cmFpbHNFcXVhbCA9IGN1cnJlbnRUcmFpbHMubGVuZ3RoID09PSB0cmFpbHMubGVuZ3RoO1xuICAgIGlmICggdHJhaWxzRXF1YWwgKSB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggIWN1cnJlbnRUcmFpbHNbIGkgXS5lcXVhbHMoIHRyYWlsc1sgaSBdICkgKSB7XG4gICAgICAgICAgdHJhaWxzRXF1YWwgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJFVklFVzogQ2FuIHRoaXMgYmUgaW1wcm92ZWQgdXBvbiBieSB1dGlsaXppbmcgYSBjdXN0b20gdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k/IEkgZG9uJ3Qgc2VlIHRoYXQgYmVpbmcgbXVjaFxuICAgIC8vIGxlc3MgcGVyZm9ybWFudCBnaXZlbiB0aGF0IHlvdSBhcmUgZG9pbmcgYWxsIHRoZSBhYm92ZSB3b3JrIG9uIGVhY2ggY2FsbCB0byB1cGRhdGUoKS5cbiAgICBpZiAoICF0cmFpbHNFcXVhbCApIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0cmFpbHM7XG4gICAgfVxuICB9XG5cbiAgLy8gUkVWSUVXOiBSZW5hbWUgdG8gZWl0aGVyIGBhZGROb2RlTGlzdGVuZXJzYCwgb3Igc29tZXRoaW5nIG1vcmUgZ2VuZXJhbCBsaWtlIGBsaXN0ZW5Ub05vZGUoKWAuXG4gIHByaXZhdGUgYWRkTm9kZUxpc3RlbmVyKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmFkZCggbm9kZSApO1xuXG4gICAgLy8gVW5jb25kaXRpb25hbCBsaXN0ZW5lcnMsIHdoaWNoIGFmZmVjdCBhbGwgbm9kZXMuXG4gICAgbm9kZS5wYXJlbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLnBhcmVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl90cmFpbFVwZGF0ZUxpc3RlbmVyICk7XG4gICAgbm9kZS5yb290ZWREaXNwbGF5Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl90cmFpbFVwZGF0ZUxpc3RlbmVyICk7XG5cbiAgICBpZiAoIHRoaXMuZm9sbG93UERPTU9yZGVyICkge1xuICAgICAgbm9kZS5wZG9tUGFyZW50Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnJlcXVpcmVWaXNpYmxlICkge1xuICAgICAgbm9kZS52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnJlcXVpcmVQRE9NVmlzaWJsZSApIHtcbiAgICAgIG5vZGUucGRvbVZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMucmVxdWlyZUVuYWJsZWQgKSB7XG4gICAgICBub2RlLmVuYWJsZWRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMucmVxdWlyZUlucHV0RW5hYmxlZCApIHtcbiAgICAgIG5vZGUuaW5wdXRFbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZU5vZGVMaXN0ZW5lciggbm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RlbmVkTm9kZVNldC5kZWxldGUoIG5vZGUgKTtcbiAgICBub2RlLnBhcmVudEFkZGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIG5vZGUucGFyZW50UmVtb3ZlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLnJvb3RlZERpc3BsYXlDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIG5vZGUuZGlzcG9zZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcblxuICAgIGlmICggdGhpcy5mb2xsb3dQRE9NT3JkZXIgKSB7XG4gICAgICBub2RlLnBkb21QYXJlbnRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMucmVxdWlyZVZpc2libGUgKSB7XG4gICAgICBub2RlLnZpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnJlcXVpcmVQRE9NVmlzaWJsZSApIHtcbiAgICAgIG5vZGUucGRvbVZpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnJlcXVpcmVFbmFibGVkICkge1xuICAgICAgbm9kZS5lbmFibGVkUHJvcGVydHkudW5saW5rKCB0aGlzLl90cmFpbFVwZGF0ZUxpc3RlbmVyICk7XG4gICAgfVxuICAgIGlmICggdGhpcy5yZXF1aXJlSW5wdXRFbmFibGVkICkge1xuICAgICAgbm9kZS5pbnB1dEVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICB9XG4gIH1cblxuICAvLyBSRVZJRVc6IEkgYWx3YXlzIGZvcmdldCB3aHkgeW91IGRvbid0IG5lZWQgdG8gYWxzbyBjbGVhciB5b3VyIHJlZmVyZW5jZSB0byB0aGUgcHJvdmlkZWQgTm9kZS4gRG8geW91P1xuICAvLyBSRVZJRVc6IEFsc28gbWF5YmUgYXNzZXJ0IGhlcmUgdGhhdCB5b3VyIHByb3ZpZGVkIG5vZGUgaXMgaW4gdGhpcyBsaXN0ZW5lZCB0byBOb2RlIHNldD9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5saXN0ZW5lZE5vZGVTZXQuZm9yRWFjaCggbm9kZSA9PiB0aGlzLnJlbW92ZU5vZGVMaXN0ZW5lciggbm9kZSApICk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0Rpc3BsYXllZFRyYWlsc1Byb3BlcnR5JywgRGlzcGxheWVkVHJhaWxzUHJvcGVydHkgKTsiXSwibmFtZXMiOlsiVGlueVByb3BlcnR5Iiwib3B0aW9uaXplIiwiRGlzcGxheSIsInNjZW5lcnkiLCJUcmFpbCIsIkRpc3BsYXllZFRyYWlsc1Byb3BlcnR5IiwidXBkYXRlIiwiZGlzcGxheSIsImZvbGxvd1BET01PcmRlciIsInJlcXVpcmVWaXNpYmxlIiwicmVxdWlyZVBET01WaXNpYmxlIiwicmVxdWlyZUVuYWJsZWQiLCJyZXF1aXJlSW5wdXRFbmFibGVkIiwidHJhaWxzIiwibm9kZVNldCIsIlNldCIsInRyYWlsIiwibm9kZSIsInJlY3Vyc2UiLCJyb290Iiwicm9vdE5vZGUiLCJpc0Rpc3Bvc2VkIiwiYWRkIiwidmlzaWJsZSIsInBkb21WaXNpYmxlIiwiZW5hYmxlZCIsImlucHV0RW5hYmxlZCIsImRpc3BsYXlzIiwiZ2V0Um9vdGVkRGlzcGxheXMiLCJkaXNwbGF5TWF0Y2hlcyIsImxlbmd0aCIsImluY2x1ZGVzIiwic29tZSIsInB1c2giLCJjb3B5IiwicGFyZW50cyIsInBkb21QYXJlbnQiLCJmb3JFYWNoIiwicGFyZW50IiwiYWRkQW5jZXN0b3IiLCJyZW1vdmVBbmNlc3RvciIsImxpc3RlbmVkTm9kZVNldCIsImhhcyIsImFkZE5vZGVMaXN0ZW5lciIsInJlbW92ZU5vZGVMaXN0ZW5lciIsImN1cnJlbnRUcmFpbHMiLCJ2YWx1ZSIsInRyYWlsc0VxdWFsIiwiaSIsImVxdWFscyIsInBhcmVudEFkZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX3RyYWlsVXBkYXRlTGlzdGVuZXIiLCJwYXJlbnRSZW1vdmVkRW1pdHRlciIsInJvb3RlZERpc3BsYXlDaGFuZ2VkRW1pdHRlciIsImRpc3Bvc2VFbWl0dGVyIiwicGRvbVBhcmVudENoYW5nZWRFbWl0dGVyIiwidmlzaWJsZVByb3BlcnR5IiwibGF6eUxpbmsiLCJwZG9tVmlzaWJsZVByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwiaW5wdXRFbmFibGVkUHJvcGVydHkiLCJkZWxldGUiLCJyZW1vdmVMaXN0ZW5lciIsInVubGluayIsImRpc3Bvc2UiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYmluZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FFRCxPQUFPQSxrQkFBa0IsbUNBQW1DO0FBQzVELE9BQU9DLGVBQWUscUNBQXFDO0FBQzNELFNBQVNDLE9BQU8sRUFBUUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsZ0JBQWdCO0FBeUMvQyxJQUFBLEFBQU1DLDBCQUFOLE1BQU1BLGdDQUFnQ0w7SUFvRDNDTSxTQUFlO1FBRXJCLDRGQUE0RjtRQUM1RixNQUFNQyxVQUFVLElBQUksQ0FBQ0EsT0FBTztRQUM1QixNQUFNQyxrQkFBa0IsSUFBSSxDQUFDQSxlQUFlO1FBQzVDLE1BQU1DLGlCQUFpQixJQUFJLENBQUNBLGNBQWM7UUFDMUMsTUFBTUMscUJBQXFCLElBQUksQ0FBQ0Esa0JBQWtCO1FBQ2xELE1BQU1DLGlCQUFpQixJQUFJLENBQUNBLGNBQWM7UUFDMUMsTUFBTUMsc0JBQXNCLElBQUksQ0FBQ0EsbUJBQW1CO1FBRXBELHdFQUF3RTtRQUN4RSxNQUFNQyxTQUFrQixFQUFFO1FBRTFCLG1IQUFtSDtRQUNuSCx5RUFBeUU7UUFDekUsTUFBTUMsVUFBVSxJQUFJQztRQUVwQixzQ0FBc0M7UUFDdEMsTUFBTUMsUUFBUSxJQUFJWixNQUFPLElBQUksQ0FBQ2Es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