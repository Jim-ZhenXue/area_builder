// Copyright 2018-2024, University of Colorado Boulder
/**
 * Per-node information required to track what PDOM Displays our Node is visible under. A PDOM display is a Display that
 * is marked true with the `accessibility` option, and thus creates and manages a ParallelDOM (see ParallelDOM and
 * general scenery accessibility doc for more details). Acts like a multimap
 * (duplicates allowed) to indicate how many times we appear in a pdom display.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Renderer, scenery } from '../../imports.js';
let PDOMDisplaysInfo = class PDOMDisplaysInfo {
    /**
   * Called when the node is added as a child to this node AND the node's subtree contains pdom content. (scenery-internal)
   */ onAddChild(node) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onAddChild n#${node.id} (parent:n#${this.node.id})`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
            node._pdomDisplaysInfo.addPDOMDisplays(this.pdomDisplays);
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when the node is removed as a child from this node AND the node's subtree contains pdom content. (scenery-internal)
   */ onRemoveChild(node) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onRemoveChild n#${node.id} (parent:n#${this.node.id})`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
            node._pdomDisplaysInfo.removePDOMDisplays(this.pdomDisplays);
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when our summary bitmask changes (scenery-internal)
   */ onSummaryChange(oldBitmask, newBitmask) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onSummaryChange n#${this.node.id} wasPDOM:${!(Renderer.bitmaskNoPDOM & oldBitmask)}, isPDOM:${!(Renderer.bitmaskNoPDOM & newBitmask)}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        // If we are invisible, our pdomDisplays would not have changed ([] => [])
        if (this.node.visible && this.node.pdomVisible) {
            const hadPDOM = !(Renderer.bitmaskNoPDOM & oldBitmask);
            const hasPDOM = !(Renderer.bitmaskNoPDOM & newBitmask);
            // If we changed to have pdom content, we need to recursively add pdom displays.
            if (hasPDOM && !hadPDOM) {
                this.addAllPDOMDisplays();
            }
            // If we changed to NOT have pdom content, we need to recursively remove pdom displays.
            if (!hasPDOM && hadPDOM) {
                this.removeAllPDOMDisplays();
            }
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when our visibility changes. (scenery-internal)
   */ onVisibilityChange(visible) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onVisibilityChange n#${this.node.id} visible:${visible}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        // If we don't have pdom (or pdomVisible), our pdomDisplays would not have changed ([] => [])
        if (this.node.pdomVisible && !this.node._rendererSummary.hasNoPDOM()) {
            if (visible) {
                this.addAllPDOMDisplays();
            } else {
                this.removeAllPDOMDisplays();
            }
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when our pdomVisibility changes. (scenery-internal)
   */ onPDOMVisibilityChange(visible) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onPDOMVisibilityChange n#${this.node.id} pdomVisible:${visible}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        // If we don't have pdom, our pdomDisplays would not have changed ([] => [])
        if (this.node.visible && !this.node._rendererSummary.hasNoPDOM()) {
            if (visible) {
                this.addAllPDOMDisplays();
            } else {
                this.removeAllPDOMDisplays();
            }
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when we have a rooted display added to this node. (scenery-internal)
   */ onAddedRootedDisplay(display) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onAddedRootedDisplay n#${this.node.id}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        if (display._accessible && this.canHavePDOMDisplays()) {
            this.addPDOMDisplays([
                display
            ]);
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Called when we have a rooted display removed from this node. (scenery-internal)
   */ onRemovedRootedDisplay(display) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`onRemovedRootedDisplay n#${this.node.id}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        if (display._accessible && this.canHavePDOMDisplays()) {
            this.removePDOMDisplays([
                display
            ]);
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Returns whether we can have pdomDisplays specified in our array. (scenery-internal)
   */ canHavePDOMDisplays() {
        return this.node.visible && this.node.pdomVisible && !this.node._rendererSummary.hasNoPDOM();
    }
    /**
   * Adds all of our pdom displays to our array (and propagates).
   */ addAllPDOMDisplays() {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`addAllPDOMDisplays n#${this.node.id}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        assert && assert(this.pdomDisplays.length === 0, 'Should be empty before adding everything');
        assert && assert(this.canHavePDOMDisplays(), 'Should happen when we can store pdomDisplays');
        let i;
        const displays = [];
        // Concatenation of our parents' pdomDisplays
        for(i = 0; i < this.node._parents.length; i++){
            Array.prototype.push.apply(displays, this.node._parents[i]._pdomDisplaysInfo.pdomDisplays);
        }
        // AND any acessible displays rooted at this node
        for(i = 0; i < this.node._rootedDisplays.length; i++){
            const display = this.node._rootedDisplays[i];
            if (display._accessible) {
                displays.push(display);
            }
        }
        this.addPDOMDisplays(displays);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Removes all of our pdom displays from our array (and propagates).
   */ removeAllPDOMDisplays() {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`removeAllPDOMDisplays n#${this.node.id}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        assert && assert(!this.canHavePDOMDisplays(), 'Should happen when we cannot store pdomDisplays');
        // TODO: is there a way to avoid a copy? https://github.com/phetsims/scenery/issues/1581
        this.removePDOMDisplays(this.pdomDisplays.slice());
        assert && assert(this.pdomDisplays.length === 0, 'Should be empty after removing everything');
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Adds a list of pdom displays to our internal list. See pdomDisplays documentation.
   */ addPDOMDisplays(displays) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`addPDOMDisplays n#${this.node.id} numDisplays:${displays.length}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        assert && assert(Array.isArray(displays));
        // Simplifies things if we can stop no-ops here.
        if (displays.length !== 0) {
            Array.prototype.push.apply(this.pdomDisplays, displays);
            // Propagate the change to our children
            for(let i = 0; i < this.node._children.length; i++){
                const child = this.node._children[i];
                if (child._pdomDisplaysInfo.canHavePDOMDisplays()) {
                    this.node._children[i]._pdomDisplaysInfo.addPDOMDisplays(displays);
                }
            }
            this.node.pdomDisplaysEmitter.emit();
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Removes a list of pdom displays from our internal list. See pdomDisplays documentation.
   */ removePDOMDisplays(displays) {
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.PDOMDisplaysInfo(`removePDOMDisplays n#${this.node.id} numDisplays:${displays.length}`);
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.push();
        assert && assert(Array.isArray(displays));
        assert && assert(this.pdomDisplays.length >= displays.length, 'there should be at least as many PDOMDisplays as Displays');
        // Simplifies things if we can stop no-ops here.
        if (displays.length !== 0) {
            let i;
            for(i = displays.length - 1; i >= 0; i--){
                const index = this.pdomDisplays.lastIndexOf(displays[i]);
                assert && assert(index >= 0);
                this.pdomDisplays.splice(i, 1);
            }
            // Propagate the change to our children
            for(i = 0; i < this.node._children.length; i++){
                const child = this.node._children[i];
                // NOTE: Since this gets called many times from the RendererSummary (which happens before the actual child
                // modification happens), we DO NOT want to traverse to the child node getting removed. Ideally a better
                // solution than this flag should be found.
                if (child._pdomDisplaysInfo.canHavePDOMDisplays() && !child._isGettingRemovedFromParent) {
                    child._pdomDisplaysInfo.removePDOMDisplays(displays);
                }
            }
            this.node.pdomDisplaysEmitter.emit();
        }
        sceneryLog && sceneryLog.PDOMDisplaysInfo && sceneryLog.pop();
    }
    /**
   * Tracks pdom display information for our given node.
   * (scenery-internal)
   */ constructor(node){
        this.node = node;
        this.pdomDisplays = [];
    }
};
export { PDOMDisplaysInfo as default };
scenery.register('PDOMDisplaysInfo', PDOMDisplaysInfo);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01EaXNwbGF5c0luZm8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUGVyLW5vZGUgaW5mb3JtYXRpb24gcmVxdWlyZWQgdG8gdHJhY2sgd2hhdCBQRE9NIERpc3BsYXlzIG91ciBOb2RlIGlzIHZpc2libGUgdW5kZXIuIEEgUERPTSBkaXNwbGF5IGlzIGEgRGlzcGxheSB0aGF0XG4gKiBpcyBtYXJrZWQgdHJ1ZSB3aXRoIHRoZSBgYWNjZXNzaWJpbGl0eWAgb3B0aW9uLCBhbmQgdGh1cyBjcmVhdGVzIGFuZCBtYW5hZ2VzIGEgUGFyYWxsZWxET00gKHNlZSBQYXJhbGxlbERPTSBhbmRcbiAqIGdlbmVyYWwgc2NlbmVyeSBhY2Nlc3NpYmlsaXR5IGRvYyBmb3IgbW9yZSBkZXRhaWxzKS4gQWN0cyBsaWtlIGEgbXVsdGltYXBcbiAqIChkdXBsaWNhdGVzIGFsbG93ZWQpIHRvIGluZGljYXRlIGhvdyBtYW55IHRpbWVzIHdlIGFwcGVhciBpbiBhIHBkb20gZGlzcGxheS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgRGlzcGxheSwgTm9kZSwgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUERPTURpc3BsYXlzSW5mbyB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBub2RlOiBOb2RlO1xuXG4gIC8vIChkdXBsaWNhdGVzIGFsbG93ZWQpIC0gVGhlcmUgaXMgb25lIGNvcHkgb2YgZWFjaCBwZG9tXG4gIC8vIERpc3BsYXkgZm9yIGVhY2ggdHJhaWwgKGZyb20gaXRzIHJvb3Qgbm9kZSB0byB0aGlzIG5vZGUpIHRoYXQgaXMgZnVsbHkgdmlzaWJsZSAoYXNzdW1pbmcgdGhpcyBzdWJ0cmVlIGhhc1xuICAvLyBwZG9tIGNvbnRlbnQpLlxuICAvLyBUaHVzLCB0aGUgdmFsdWUgb2YgdGhpcyBpczpcbiAgLy8gLSBJZiB0aGlzIG5vZGUgaXMgaW52aXNpYmxlIE9SIHRoZSBzdWJ0cmVlIGhhcyBubyBwZG9tQ29udGVudC9wZG9tT3JkZXI6IFtdXG4gIC8vIC0gT3RoZXJ3aXNlLCBpdCBpcyB0aGUgY29uY2F0ZW5hdGlvbiBvZiBvdXIgcGFyZW50cycgcGRvbURpc3BsYXlzIChBTkQgYW55IHBkb20gZGlzcGxheXMgcm9vdGVkXG4gIC8vICAgYXQgdGhpcyBub2RlKS5cbiAgLy8gVGhpcyB2YWx1ZSBpcyBzeW5jaHJvbm91c2x5IHVwZGF0ZWQsIGFuZCBzdXBwb3J0cyBwZG9tSW5zdGFuY2VzIGJ5IGxldHRpbmcgdGhlbSBrbm93IHdoZW4gY2VydGFpblxuICAvLyBub2RlcyBhcmUgdmlzaWJsZSBvbiB0aGUgZGlzcGxheS5cbiAgcHVibGljIHJlYWRvbmx5IHBkb21EaXNwbGF5czogRGlzcGxheVtdO1xuXG4gIC8qKlxuICAgKiBUcmFja3MgcGRvbSBkaXNwbGF5IGluZm9ybWF0aW9uIGZvciBvdXIgZ2l2ZW4gbm9kZS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIG5vZGU6IE5vZGUgKSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLnBkb21EaXNwbGF5cyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBub2RlIGlzIGFkZGVkIGFzIGEgY2hpbGQgdG8gdGhpcyBub2RlIEFORCB0aGUgbm9kZSdzIHN1YnRyZWUgY29udGFpbnMgcGRvbSBjb250ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvbkFkZENoaWxkKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYG9uQWRkQ2hpbGQgbiMke25vZGUuaWR9IChwYXJlbnQ6biMke3RoaXMubm9kZS5pZH0pYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgaWYgKCBub2RlLl9wZG9tRGlzcGxheXNJbmZvLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcbiAgICAgIG5vZGUuX3Bkb21EaXNwbGF5c0luZm8uYWRkUERPTURpc3BsYXlzKCB0aGlzLnBkb21EaXNwbGF5cyApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG5vZGUgaXMgcmVtb3ZlZCBhcyBhIGNoaWxkIGZyb20gdGhpcyBub2RlIEFORCB0aGUgbm9kZSdzIHN1YnRyZWUgY29udGFpbnMgcGRvbSBjb250ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblJlbW92ZUNoaWxkKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYG9uUmVtb3ZlQ2hpbGQgbiMke25vZGUuaWR9IChwYXJlbnQ6biMke3RoaXMubm9kZS5pZH0pYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgaWYgKCBub2RlLl9wZG9tRGlzcGxheXNJbmZvLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcbiAgICAgIG5vZGUuX3Bkb21EaXNwbGF5c0luZm8ucmVtb3ZlUERPTURpc3BsYXlzKCB0aGlzLnBkb21EaXNwbGF5cyApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIHN1bW1hcnkgYml0bWFzayBjaGFuZ2VzIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uU3VtbWFyeUNoYW5nZSggb2xkQml0bWFzazogbnVtYmVyLCBuZXdCaXRtYXNrOiBudW1iZXIgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25TdW1tYXJ5Q2hhbmdlIG4jJHt0aGlzLm5vZGUuaWR9IHdhc1BET006JHshKCBSZW5kZXJlci5iaXRtYXNrTm9QRE9NICYgb2xkQml0bWFzayApfSwgaXNQRE9NOiR7ISggUmVuZGVyZXIuYml0bWFza05vUERPTSAmIG5ld0JpdG1hc2sgKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBJZiB3ZSBhcmUgaW52aXNpYmxlLCBvdXIgcGRvbURpc3BsYXlzIHdvdWxkIG5vdCBoYXZlIGNoYW5nZWQgKFtdID0+IFtdKVxuICAgIGlmICggdGhpcy5ub2RlLnZpc2libGUgJiYgdGhpcy5ub2RlLnBkb21WaXNpYmxlICkge1xuICAgICAgY29uc3QgaGFkUERPTSA9ICEoIFJlbmRlcmVyLmJpdG1hc2tOb1BET00gJiBvbGRCaXRtYXNrICk7XG4gICAgICBjb25zdCBoYXNQRE9NID0gISggUmVuZGVyZXIuYml0bWFza05vUERPTSAmIG5ld0JpdG1hc2sgKTtcblxuICAgICAgLy8gSWYgd2UgY2hhbmdlZCB0byBoYXZlIHBkb20gY29udGVudCwgd2UgbmVlZCB0byByZWN1cnNpdmVseSBhZGQgcGRvbSBkaXNwbGF5cy5cbiAgICAgIGlmICggaGFzUERPTSAmJiAhaGFkUERPTSApIHtcbiAgICAgICAgdGhpcy5hZGRBbGxQRE9NRGlzcGxheXMoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgY2hhbmdlZCB0byBOT1QgaGF2ZSBwZG9tIGNvbnRlbnQsIHdlIG5lZWQgdG8gcmVjdXJzaXZlbHkgcmVtb3ZlIHBkb20gZGlzcGxheXMuXG4gICAgICBpZiAoICFoYXNQRE9NICYmIGhhZFBET00gKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsUERPTURpc3BsYXlzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgdmlzaWJpbGl0eSBjaGFuZ2VzLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblZpc2liaWxpdHlDaGFuZ2UoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25WaXNpYmlsaXR5Q2hhbmdlIG4jJHt0aGlzLm5vZGUuaWR9IHZpc2libGU6JHt2aXNpYmxlfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIElmIHdlIGRvbid0IGhhdmUgcGRvbSAob3IgcGRvbVZpc2libGUpLCBvdXIgcGRvbURpc3BsYXlzIHdvdWxkIG5vdCBoYXZlIGNoYW5nZWQgKFtdID0+IFtdKVxuICAgIGlmICggdGhpcy5ub2RlLnBkb21WaXNpYmxlICYmICF0aGlzLm5vZGUuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApIHtcbiAgICAgIGlmICggdmlzaWJsZSApIHtcbiAgICAgICAgdGhpcy5hZGRBbGxQRE9NRGlzcGxheXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZUFsbFBET01EaXNwbGF5cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIHBkb21WaXNpYmlsaXR5IGNoYW5nZXMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uUERPTVZpc2liaWxpdHlDaGFuZ2UoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25QRE9NVmlzaWJpbGl0eUNoYW5nZSBuIyR7dGhpcy5ub2RlLmlkfSBwZG9tVmlzaWJsZToke3Zpc2libGV9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBwZG9tLCBvdXIgcGRvbURpc3BsYXlzIHdvdWxkIG5vdCBoYXZlIGNoYW5nZWQgKFtdID0+IFtdKVxuICAgIGlmICggdGhpcy5ub2RlLnZpc2libGUgJiYgIXRoaXMubm9kZS5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkge1xuICAgICAgaWYgKCB2aXNpYmxlICkge1xuICAgICAgICB0aGlzLmFkZEFsbFBET01EaXNwbGF5cygpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsUERPTURpc3BsYXlzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB3ZSBoYXZlIGEgcm9vdGVkIGRpc3BsYXkgYWRkZWQgdG8gdGhpcyBub2RlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvbkFkZGVkUm9vdGVkRGlzcGxheSggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8oIGBvbkFkZGVkUm9vdGVkRGlzcGxheSBuIyR7dGhpcy5ub2RlLmlkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSAmJiB0aGlzLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcbiAgICAgIHRoaXMuYWRkUERPTURpc3BsYXlzKCBbIGRpc3BsYXkgXSApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gd2UgaGF2ZSBhIHJvb3RlZCBkaXNwbGF5IHJlbW92ZWQgZnJvbSB0aGlzIG5vZGUuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uUmVtb3ZlZFJvb3RlZERpc3BsYXkoIGRpc3BsYXk6IERpc3BsYXkgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgb25SZW1vdmVkUm9vdGVkRGlzcGxheSBuIyR7dGhpcy5ub2RlLmlkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSAmJiB0aGlzLmNhbkhhdmVQRE9NRGlzcGxheXMoKSApIHtcbiAgICAgIHRoaXMucmVtb3ZlUERPTURpc3BsYXlzKCBbIGRpc3BsYXkgXSApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHdlIGNhbiBoYXZlIHBkb21EaXNwbGF5cyBzcGVjaWZpZWQgaW4gb3VyIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBjYW5IYXZlUERPTURpc3BsYXlzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5vZGUudmlzaWJsZSAmJiB0aGlzLm5vZGUucGRvbVZpc2libGUgJiYgIXRoaXMubm9kZS5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYWxsIG9mIG91ciBwZG9tIGRpc3BsYXlzIHRvIG91ciBhcnJheSAoYW5kIHByb3BhZ2F0ZXMpLlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRBbGxQRE9NRGlzcGxheXMoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvKCBgYWRkQWxsUERPTURpc3BsYXlzIG4jJHt0aGlzLm5vZGUuaWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tRGlzcGxheXMubGVuZ3RoID09PSAwLCAnU2hvdWxkIGJlIGVtcHR5IGJlZm9yZSBhZGRpbmcgZXZlcnl0aGluZycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNhbkhhdmVQRE9NRGlzcGxheXMoKSwgJ1Nob3VsZCBoYXBwZW4gd2hlbiB3ZSBjYW4gc3RvcmUgcGRvbURpc3BsYXlzJyApO1xuXG4gICAgbGV0IGk7XG4gICAgY29uc3QgZGlzcGxheXM6IERpc3BsYXlbXSA9IFtdO1xuXG4gICAgLy8gQ29uY2F0ZW5hdGlvbiBvZiBvdXIgcGFyZW50cycgcGRvbURpc3BsYXlzXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLm5vZGUuX3BhcmVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggZGlzcGxheXMsIHRoaXMubm9kZS5fcGFyZW50c1sgaSBdLl9wZG9tRGlzcGxheXNJbmZvLnBkb21EaXNwbGF5cyApO1xuICAgIH1cblxuICAgIC8vIEFORCBhbnkgYWNlc3NpYmxlIGRpc3BsYXlzIHJvb3RlZCBhdCB0aGlzIG5vZGVcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMubm9kZS5fcm9vdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkaXNwbGF5ID0gdGhpcy5ub2RlLl9yb290ZWREaXNwbGF5c1sgaSBdO1xuICAgICAgaWYgKCBkaXNwbGF5Ll9hY2Nlc3NpYmxlICkge1xuICAgICAgICBkaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hZGRQRE9NRGlzcGxheXMoIGRpc3BsYXlzICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIG9mIG91ciBwZG9tIGRpc3BsYXlzIGZyb20gb3VyIGFycmF5IChhbmQgcHJvcGFnYXRlcykuXG4gICAqL1xuICBwcml2YXRlIHJlbW92ZUFsbFBET01EaXNwbGF5cygpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8oIGByZW1vdmVBbGxQRE9NRGlzcGxheXMgbiMke3RoaXMubm9kZS5pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jYW5IYXZlUERPTURpc3BsYXlzKCksICdTaG91bGQgaGFwcGVuIHdoZW4gd2UgY2Fubm90IHN0b3JlIHBkb21EaXNwbGF5cycgKTtcblxuICAgIC8vIFRPRE86IGlzIHRoZXJlIGEgd2F5IHRvIGF2b2lkIGEgY29weT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLnJlbW92ZVBET01EaXNwbGF5cyggdGhpcy5wZG9tRGlzcGxheXMuc2xpY2UoKSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tRGlzcGxheXMubGVuZ3RoID09PSAwLCAnU2hvdWxkIGJlIGVtcHR5IGFmdGVyIHJlbW92aW5nIGV2ZXJ5dGhpbmcnICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0IG9mIHBkb20gZGlzcGxheXMgdG8gb3VyIGludGVybmFsIGxpc3QuIFNlZSBwZG9tRGlzcGxheXMgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgYWRkUERPTURpc3BsYXlzKCBkaXNwbGF5czogRGlzcGxheVtdICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYGFkZFBET01EaXNwbGF5cyBuIyR7dGhpcy5ub2RlLmlkfSBudW1EaXNwbGF5czoke2Rpc3BsYXlzLmxlbmd0aH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkaXNwbGF5cyApICk7XG5cbiAgICAvLyBTaW1wbGlmaWVzIHRoaW5ncyBpZiB3ZSBjYW4gc3RvcCBuby1vcHMgaGVyZS5cbiAgICBpZiAoIGRpc3BsYXlzLmxlbmd0aCAhPT0gMCApIHtcbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCB0aGlzLnBkb21EaXNwbGF5cywgZGlzcGxheXMgKTtcblxuICAgICAgLy8gUHJvcGFnYXRlIHRoZSBjaGFuZ2UgdG8gb3VyIGNoaWxkcmVuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGUuX2NoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMubm9kZS5fY2hpbGRyZW5bIGkgXTtcbiAgICAgICAgaWYgKCBjaGlsZC5fcGRvbURpc3BsYXlzSW5mby5jYW5IYXZlUERPTURpc3BsYXlzKCkgKSB7XG4gICAgICAgICAgdGhpcy5ub2RlLl9jaGlsZHJlblsgaSBdLl9wZG9tRGlzcGxheXNJbmZvLmFkZFBET01EaXNwbGF5cyggZGlzcGxheXMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLm5vZGUucGRvbURpc3BsYXlzRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgbGlzdCBvZiBwZG9tIGRpc3BsYXlzIGZyb20gb3VyIGludGVybmFsIGxpc3QuIFNlZSBwZG9tRGlzcGxheXMgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHByaXZhdGUgcmVtb3ZlUERPTURpc3BsYXlzKCBkaXNwbGF5czogRGlzcGxheVtdICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NRGlzcGxheXNJbmZvICYmIHNjZW5lcnlMb2cuUERPTURpc3BsYXlzSW5mbyggYHJlbW92ZVBET01EaXNwbGF5cyBuIyR7dGhpcy5ub2RlLmlkfSBudW1EaXNwbGF5czoke2Rpc3BsYXlzLmxlbmd0aH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBkaXNwbGF5cyApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wZG9tRGlzcGxheXMubGVuZ3RoID49IGRpc3BsYXlzLmxlbmd0aCwgJ3RoZXJlIHNob3VsZCBiZSBhdCBsZWFzdCBhcyBtYW55IFBET01EaXNwbGF5cyBhcyBEaXNwbGF5cycgKTtcblxuICAgIC8vIFNpbXBsaWZpZXMgdGhpbmdzIGlmIHdlIGNhbiBzdG9wIG5vLW9wcyBoZXJlLlxuICAgIGlmICggZGlzcGxheXMubGVuZ3RoICE9PSAwICkge1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGZvciAoIGkgPSBkaXNwbGF5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnBkb21EaXNwbGF5cy5sYXN0SW5kZXhPZiggZGlzcGxheXNbIGkgXSApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICk7XG4gICAgICAgIHRoaXMucGRvbURpc3BsYXlzLnNwbGljZSggaSwgMSApO1xuICAgICAgfVxuXG4gICAgICAvLyBQcm9wYWdhdGUgdGhlIGNoYW5nZSB0byBvdXIgY2hpbGRyZW5cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5ub2RlLl9jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLm5vZGUuX2NoaWxkcmVuWyBpIF07XG4gICAgICAgIC8vIE5PVEU6IFNpbmNlIHRoaXMgZ2V0cyBjYWxsZWQgbWFueSB0aW1lcyBmcm9tIHRoZSBSZW5kZXJlclN1bW1hcnkgKHdoaWNoIGhhcHBlbnMgYmVmb3JlIHRoZSBhY3R1YWwgY2hpbGRcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9uIGhhcHBlbnMpLCB3ZSBETyBOT1Qgd2FudCB0byB0cmF2ZXJzZSB0byB0aGUgY2hpbGQgbm9kZSBnZXR0aW5nIHJlbW92ZWQuIElkZWFsbHkgYSBiZXR0ZXJcbiAgICAgICAgLy8gc29sdXRpb24gdGhhbiB0aGlzIGZsYWcgc2hvdWxkIGJlIGZvdW5kLlxuICAgICAgICBpZiAoIGNoaWxkLl9wZG9tRGlzcGxheXNJbmZvLmNhbkhhdmVQRE9NRGlzcGxheXMoKSAmJiAhY2hpbGQuX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50ICkge1xuICAgICAgICAgIGNoaWxkLl9wZG9tRGlzcGxheXNJbmZvLnJlbW92ZVBET01EaXNwbGF5cyggZGlzcGxheXMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLm5vZGUucGRvbURpc3BsYXlzRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01EaXNwbGF5c0luZm8gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUERPTURpc3BsYXlzSW5mbycsIFBET01EaXNwbGF5c0luZm8gKTsiXSwibmFtZXMiOlsiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiUERPTURpc3BsYXlzSW5mbyIsIm9uQWRkQ2hpbGQiLCJub2RlIiwic2NlbmVyeUxvZyIsImlkIiwicHVzaCIsIl9wZG9tRGlzcGxheXNJbmZvIiwiY2FuSGF2ZVBET01EaXNwbGF5cyIsImFkZFBET01EaXNwbGF5cyIsInBkb21EaXNwbGF5cyIsInBvcCIsIm9uUmVtb3ZlQ2hpbGQiLCJyZW1vdmVQRE9NRGlzcGxheXMiLCJvblN1bW1hcnlDaGFuZ2UiLCJvbGRCaXRtYXNrIiwibmV3Qml0bWFzayIsImJpdG1hc2tOb1BET00iLCJ2aXNpYmxlIiwicGRvbVZpc2libGUiLCJoYWRQRE9NIiwiaGFzUERPTSIsImFkZEFsbFBET01EaXNwbGF5cyIsInJlbW92ZUFsbFBET01EaXNwbGF5cyIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsIl9yZW5kZXJlclN1bW1hcnkiLCJoYXNOb1BET00iLCJvblBET01WaXNpYmlsaXR5Q2hhbmdlIiwib25BZGRlZFJvb3RlZERpc3BsYXkiLCJkaXNwbGF5IiwiX2FjY2Vzc2libGUiLCJvblJlbW92ZWRSb290ZWREaXNwbGF5IiwiYXNzZXJ0IiwibGVuZ3RoIiwiaSIsImRpc3BsYXlzIiwiX3BhcmVudHMiLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiX3Jvb3RlZERpc3BsYXlzIiwic2xpY2UiLCJpc0FycmF5IiwiX2NoaWxkcmVuIiwiY2hpbGQiLCJwZG9tRGlzcGxheXNFbWl0dGVyIiwiZW1pdCIsImluZGV4IiwibGFzdEluZGV4T2YiLCJzcGxpY2UiLCJfaXNHZXR0aW5nUmVtb3ZlZEZyb21QYXJlbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxTQUF3QkEsUUFBUSxFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRXJELElBQUEsQUFBTUMsbUJBQU4sTUFBTUE7SUF3Qm5COztHQUVDLEdBQ0QsQUFBT0MsV0FBWUMsSUFBVSxFQUFTO1FBQ3BDQyxjQUFjQSxXQUFXSCxnQkFBZ0IsSUFBSUcsV0FBV0gsZ0JBQWdCLENBQUUsQ0FBQyxhQUFhLEVBQUVFLEtBQUtFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDRixJQUFJLENBQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUhELGNBQWNBLFdBQVdILGdCQUFnQixJQUFJRyxXQUFXRSxJQUFJO1FBRTVELElBQUtILEtBQUtJLGlCQUFpQixDQUFDQyxtQkFBbUIs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