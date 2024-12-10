// Copyright 2013-2024, University of Colorado Boulder
/**
 * Points to a specific node (with a trail), and whether it is conceptually before or after the node.
 *
 * There are two orderings:
 * - rendering order: the order that node selves would be rendered, matching the Trail implicit order
 * - nesting order:   the order in depth first with entering a node being "before" and exiting a node being "after"
 *
 * TODO: more seamless handling of the orders. or just exclusively use the nesting order https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery } from '../imports.js';
let TrailPointer = class TrailPointer {
    isActive() {
        return !!this.trail;
    }
    copy() {
        assert && assert(this.isActive());
        return new TrailPointer(this.trail.copy(), this.isBefore);
    }
    setBefore(isBefore) {
        this.isBefore = isBefore;
        this.isAfter = !isBefore;
    }
    /**
   * Return the equivalent pointer that swaps before and after (may return null if it doesn't exist)
   */ getRenderSwappedPointer() {
        assert && assert(this.isActive());
        const activeSelf = this;
        const newTrail = this.isBefore ? activeSelf.trail.previous() : activeSelf.trail.next();
        if (newTrail === null) {
            return null;
        } else {
            return new TrailPointer(newTrail, !this.isBefore);
        }
    }
    getRenderBeforePointer() {
        return this.isBefore ? this : this.getRenderSwappedPointer();
    }
    getRenderAfterPointer() {
        return this.isAfter ? this : this.getRenderSwappedPointer();
    }
    /**
   * In the render order, will return 0 if the pointers are equivalent, -1 if this pointer is before the
   * other pointer, and 1 if this pointer is after the other pointer.
   */ compareRender(other) {
        assert && assert(other !== null);
        const a = this.getRenderBeforePointer();
        const b = other.getRenderBeforePointer();
        if (a !== null && b !== null) {
            assert && assert(a.isActive() && b.isActive());
            // normal (non-degenerate) case
            return a.trail.compare(b.trail);
        } else {
            // null "before" point is equivalent to the "after" pointer on the last rendered node.
            if (a === b) {
                return 0; // uniqueness guarantees they were the same
            } else {
                return a === null ? 1 : -1;
            }
        }
    }
    /**
   * Like compareRender, but for the nested (depth-first) order
   *
   * TODO: optimization? https://github.com/phetsims/scenery/issues/1581
   */ compareNested(other) {
        assert && assert(other);
        assert && assert(this.isActive() && other.isActive());
        const activeSelf = this;
        const activeOther = other;
        const comparison = activeSelf.trail.compare(activeOther.trail);
        if (comparison === 0) {
            // if trails are equal, just compare before/after
            if (this.isBefore === other.isBefore) {
                return 0;
            } else {
                return this.isBefore ? -1 : 1;
            }
        } else {
            // if one is an extension of the other, the shorter isBefore flag determines the order completely
            if (activeSelf.trail.isExtensionOf(activeOther.trail)) {
                return other.isBefore ? 1 : -1;
            } else if (activeOther.trail.isExtensionOf(activeSelf.trail)) {
                return this.isBefore ? -1 : 1;
            } else {
                // neither is a subtrail of the other, so a straight trail comparison should give the answer
                return comparison;
            }
        }
    }
    equalsRender(other) {
        return this.compareRender(other) === 0;
    }
    equalsNested(other) {
        return this.compareNested(other) === 0;
    }
    /**
   * Will return false if this pointer has gone off of the beginning or end of the tree (will be marked with isAfter or
   * isBefore though)
   */ hasTrail() {
        return !!this.trail;
    }
    /**
   * Moves this pointer forwards one step in the nested order
   *
   * TODO: refactor with "Side"-like handling https://github.com/phetsims/scenery/issues/1581
   */ nestedForwards() {
        assert && assert(this.isActive());
        const activeSelf = this;
        if (this.isBefore) {
            const children = activeSelf.trail.lastNode()._children;
            if (children.length > 0) {
                // stay as before, just walk to the first child
                activeSelf.trail.addDescendant(children[0], 0);
            } else {
                // stay on the same node, but switch to after
                this.setBefore(false);
            }
        } else {
            if (activeSelf.trail.indices.length === 0) {
                // nothing else to jump to below, so indicate the lack of existence
                this.trail = null;
                // stays isAfter
                return null;
            } else {
                const index = activeSelf.trail.indices[activeSelf.trail.indices.length - 1];
                activeSelf.trail.removeDescendant();
                const children = activeSelf.trail.lastNode()._children;
                if (children.length > index + 1) {
                    // more siblings, switch to the beginning of the next one
                    activeSelf.trail.addDescendant(children[index + 1], index + 1);
                    this.setBefore(true);
                } else {
                // no more siblings. exit on parent. nothing else needed since we're already isAfter
                }
            }
        }
        return this;
    }
    /**
   * Moves this pointer backwards one step in the nested order
   */ nestedBackwards() {
        assert && assert(this.isActive());
        const activeSelf = this;
        if (this.isBefore) {
            if (activeSelf.trail.indices.length === 0) {
                // jumping off the front
                this.trail = null;
                // stays isBefore
                return null;
            } else {
                const index = activeSelf.trail.indices[activeSelf.trail.indices.length - 1];
                activeSelf.trail.removeDescendant();
                if (index - 1 >= 0) {
                    // more siblings, switch to the beginning of the previous one and switch to isAfter
                    activeSelf.trail.addDescendant(activeSelf.trail.lastNode()._children[index - 1], index - 1);
                    this.setBefore(false);
                } else {
                // no more siblings. enter on parent. nothing else needed since we're already isBefore
                }
            }
        } else {
            if (activeSelf.trail.lastNode()._children.length > 0) {
                // stay isAfter, but walk to the last child
                const children = activeSelf.trail.lastNode()._children;
                activeSelf.trail.addDescendant(children[children.length - 1], children.length - 1);
            } else {
                // switch to isBefore, since this is a leaf node
                this.setBefore(true);
            }
        }
        return this;
    }
    /**
   * Treats the pointer as render-ordered (includes the start pointer 'before' if applicable, excludes the end pointer
   * 'before' if applicable
   */ eachNodeBetween(other, callback) {
        this.eachTrailBetween(other, (trail)=>callback(trail.lastNode()));
    }
    /**
   * Treats the pointer as render-ordered (includes the start pointer 'before' if applicable, excludes the end pointer
   * 'before' if applicable
   */ eachTrailBetween(other, callback) {
        // this should trigger on all pointers that have the 'before' flag, except a pointer equal to 'other'.
        // since we exclude endpoints in the depthFirstUntil call, we need to fire this off first
        if (this.isBefore) {
            assert && assert(this.isActive());
            callback(this.trail);
        }
        this.depthFirstUntil(other, (pointer)=>{
            if (pointer.isBefore) {
                return callback(pointer.trail);
            }
            return false;
        }, true); // exclude the endpoints so we can ignore the ending 'before' case
    }
    /**
   * Recursively (depth-first) iterates over all pointers between this pointer and 'other', calling
   * callback( pointer ) for each pointer. If excludeEndpoints is truthy, the callback will not be
   * called if pointer is equivalent to this pointer or 'other'.
   *
   * If the callback returns a truthy value, the subtree for the current pointer will be skipped
   * (applies only to before-pointers)
   */ depthFirstUntil(other, callback, excludeEndpoints) {
        assert && assert(this.isActive() && other.isActive());
        const activeSelf = this;
        const activeOther = other;
        // make sure this pointer is before the other, but allow start === end if we are not excluding endpoints
        assert && assert(this.compareNested(other) <= (excludeEndpoints ? -1 : 0), 'TrailPointer.depthFirstUntil pointers out of order, possibly in both meanings of the phrase!');
        assert && assert(activeSelf.trail.rootNode() === activeOther.trail.rootNode(), 'TrailPointer.depthFirstUntil takes pointers with the same root');
        // sanity check TODO: remove later https://github.com/phetsims/scenery/issues/1581
        activeSelf.trail.reindex();
        activeOther.trail.reindex();
        const pointer = this.copy();
        pointer.trail.setMutable(); // this trail will be modified in the iteration, so references to it may be modified
        let first = true;
        while(!pointer.equalsNested(other)){
            assert && assert(pointer.compareNested(other) !== 1, 'skipped in depthFirstUntil');
            let skipSubtree = false; // eslint-disable-line @typescript-eslint/no-invalid-void-type
            if (first) {
                // start point
                if (!excludeEndpoints) {
                    skipSubtree = callback(pointer);
                }
                first = false;
            } else {
                // between point
                skipSubtree = callback(pointer);
            }
            if (skipSubtree && pointer.isBefore) {
                // to skip the subtree, we just change to isAfter
                pointer.setBefore(false);
                // if we skip a subtree, make sure we don't run past the ending pointer
                if (pointer.compareNested(other) === 1) {
                    break;
                }
            } else {
                pointer.nestedForwards();
            }
        }
        // end point
        if (!excludeEndpoints) {
            callback(pointer);
        }
    }
    /**
   * Returns a string form of this object
   */ toString() {
        assert && assert(this.isActive());
        return `[${this.isBefore ? 'before' : 'after'} ${this.trail.toString().slice(1)}`;
    }
    /**
   * Same as new TrailPointer( trailA, isBeforeA ).compareNested( new TrailPointer( trailB, isBeforeB ) )
   */ static compareNested(trailA, isBeforeA, trailB, isBeforeB) {
        const comparison = trailA.compare(trailB);
        if (comparison === 0) {
            // if trails are equal, just compare before/after
            if (isBeforeA === isBeforeB) {
                return 0;
            } else {
                return isBeforeA ? -1 : 1;
            }
        } else {
            // if one is an extension of the other, the shorter isBefore flag determines the order completely
            if (trailA.isExtensionOf(trailB)) {
                return isBeforeB ? 1 : -1;
            } else if (trailB.isExtensionOf(trailA)) {
                return isBeforeA ? -1 : 1;
            } else {
                // neither is a subtrail of the other, so a straight trail comparison should give the answer
                return comparison;
            }
        }
    }
    /**
   * @param trail
   * @param isBefore - whether this points to before the node (and its children) have been rendered, or after
   */ constructor(trail, isBefore){
        this.trail = trail;
        this.setBefore(isBefore);
    }
};
export { TrailPointer as default };
scenery.register('TrailPointer', TrailPointer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFpbFBvaW50ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUG9pbnRzIHRvIGEgc3BlY2lmaWMgbm9kZSAod2l0aCBhIHRyYWlsKSwgYW5kIHdoZXRoZXIgaXQgaXMgY29uY2VwdHVhbGx5IGJlZm9yZSBvciBhZnRlciB0aGUgbm9kZS5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIG9yZGVyaW5nczpcbiAqIC0gcmVuZGVyaW5nIG9yZGVyOiB0aGUgb3JkZXIgdGhhdCBub2RlIHNlbHZlcyB3b3VsZCBiZSByZW5kZXJlZCwgbWF0Y2hpbmcgdGhlIFRyYWlsIGltcGxpY2l0IG9yZGVyXG4gKiAtIG5lc3Rpbmcgb3JkZXI6ICAgdGhlIG9yZGVyIGluIGRlcHRoIGZpcnN0IHdpdGggZW50ZXJpbmcgYSBub2RlIGJlaW5nIFwiYmVmb3JlXCIgYW5kIGV4aXRpbmcgYSBub2RlIGJlaW5nIFwiYWZ0ZXJcIlxuICpcbiAqIFRPRE86IG1vcmUgc2VhbWxlc3MgaGFuZGxpbmcgb2YgdGhlIG9yZGVycy4gb3IganVzdCBleGNsdXNpdmVseSB1c2UgdGhlIG5lc3Rpbmcgb3JkZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFdpdGhvdXROdWxsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRob3V0TnVsbC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBzY2VuZXJ5LCBUcmFpbCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgVHJhaWxDYWxsYmFjayB9IGZyb20gJy4vVHJhaWwuanMnO1xuXG5leHBvcnQgdHlwZSBBY3RpdmVUcmFpbFBvaW50ZXIgPSBXaXRob3V0TnVsbDxUcmFpbFBvaW50ZXIsICd0cmFpbCc+O1xuXG50eXBlIEFjdGl2ZVRyYWlsUG9pbnRlckNhbGxiYWNrID0gKCAoIHRyYWlsUG9pbnRlcjogQWN0aXZlVHJhaWxQb2ludGVyICkgPT4gYm9vbGVhbiApIHwgKCAoIHRyYWlsUG9pbnRlcjogQWN0aXZlVHJhaWxQb2ludGVyICkgPT4gdm9pZCApO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFpbFBvaW50ZXIge1xuXG4gIHB1YmxpYyB0cmFpbDogVHJhaWwgfCBudWxsO1xuICBwdWJsaWMgaXNCZWZvcmUhOiBib29sZWFuO1xuICBwdWJsaWMgaXNBZnRlciE6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0cmFpbFxuICAgKiBAcGFyYW0gaXNCZWZvcmUgLSB3aGV0aGVyIHRoaXMgcG9pbnRzIHRvIGJlZm9yZSB0aGUgbm9kZSAoYW5kIGl0cyBjaGlsZHJlbikgaGF2ZSBiZWVuIHJlbmRlcmVkLCBvciBhZnRlclxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFpbDogVHJhaWwsIGlzQmVmb3JlOiBib29sZWFuICkge1xuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcbiAgICB0aGlzLnNldEJlZm9yZSggaXNCZWZvcmUgKTtcbiAgfVxuXG4gIHB1YmxpYyBpc0FjdGl2ZSgpOiB0aGlzIGlzIEFjdGl2ZVRyYWlsUG9pbnRlciB7XG4gICAgcmV0dXJuICEhdGhpcy50cmFpbDtcbiAgfVxuXG4gIHB1YmxpYyBjb3B5KCk6IFRyYWlsUG9pbnRlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZSgpICk7XG4gICAgcmV0dXJuIG5ldyBUcmFpbFBvaW50ZXIoICggdGhpcyBhcyBBY3RpdmVUcmFpbFBvaW50ZXIgKS50cmFpbC5jb3B5KCksIHRoaXMuaXNCZWZvcmUgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRCZWZvcmUoIGlzQmVmb3JlOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuaXNCZWZvcmUgPSBpc0JlZm9yZTtcbiAgICB0aGlzLmlzQWZ0ZXIgPSAhaXNCZWZvcmU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBlcXVpdmFsZW50IHBvaW50ZXIgdGhhdCBzd2FwcyBiZWZvcmUgYW5kIGFmdGVyIChtYXkgcmV0dXJuIG51bGwgaWYgaXQgZG9lc24ndCBleGlzdClcbiAgICovXG4gIHB1YmxpYyBnZXRSZW5kZXJTd2FwcGVkUG9pbnRlcigpOiBUcmFpbFBvaW50ZXIgfCBudWxsIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQWN0aXZlKCkgKTtcbiAgICBjb25zdCBhY3RpdmVTZWxmID0gdGhpcyBhcyBBY3RpdmVUcmFpbFBvaW50ZXI7XG5cbiAgICBjb25zdCBuZXdUcmFpbCA9IHRoaXMuaXNCZWZvcmUgPyBhY3RpdmVTZWxmLnRyYWlsLnByZXZpb3VzKCkgOiBhY3RpdmVTZWxmLnRyYWlsLm5leHQoKTtcblxuICAgIGlmICggbmV3VHJhaWwgPT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFRyYWlsUG9pbnRlciggbmV3VHJhaWwsICF0aGlzLmlzQmVmb3JlICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldFJlbmRlckJlZm9yZVBvaW50ZXIoKTogVHJhaWxQb2ludGVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuaXNCZWZvcmUgPyB0aGlzIDogdGhpcy5nZXRSZW5kZXJTd2FwcGVkUG9pbnRlcigpO1xuICB9XG5cbiAgcHVibGljIGdldFJlbmRlckFmdGVyUG9pbnRlcigpOiBUcmFpbFBvaW50ZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5pc0FmdGVyID8gdGhpcyA6IHRoaXMuZ2V0UmVuZGVyU3dhcHBlZFBvaW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbiB0aGUgcmVuZGVyIG9yZGVyLCB3aWxsIHJldHVybiAwIGlmIHRoZSBwb2ludGVycyBhcmUgZXF1aXZhbGVudCwgLTEgaWYgdGhpcyBwb2ludGVyIGlzIGJlZm9yZSB0aGVcbiAgICogb3RoZXIgcG9pbnRlciwgYW5kIDEgaWYgdGhpcyBwb2ludGVyIGlzIGFmdGVyIHRoZSBvdGhlciBwb2ludGVyLlxuICAgKi9cbiAgcHVibGljIGNvbXBhcmVSZW5kZXIoIG90aGVyOiBUcmFpbFBvaW50ZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvdGhlciAhPT0gbnVsbCApO1xuXG4gICAgY29uc3QgYSA9IHRoaXMuZ2V0UmVuZGVyQmVmb3JlUG9pbnRlcigpO1xuICAgIGNvbnN0IGIgPSBvdGhlci5nZXRSZW5kZXJCZWZvcmVQb2ludGVyKCk7XG5cbiAgICBpZiAoIGEgIT09IG51bGwgJiYgYiAhPT0gbnVsbCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGEuaXNBY3RpdmUoKSAmJiBiLmlzQWN0aXZlKCkgKTtcblxuICAgICAgLy8gbm9ybWFsIChub24tZGVnZW5lcmF0ZSkgY2FzZVxuICAgICAgcmV0dXJuICggYSBhcyBBY3RpdmVUcmFpbFBvaW50ZXIgKS50cmFpbC5jb21wYXJlKCAoIGIgYXMgQWN0aXZlVHJhaWxQb2ludGVyICkudHJhaWwgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBudWxsIFwiYmVmb3JlXCIgcG9pbnQgaXMgZXF1aXZhbGVudCB0byB0aGUgXCJhZnRlclwiIHBvaW50ZXIgb24gdGhlIGxhc3QgcmVuZGVyZWQgbm9kZS5cbiAgICAgIGlmICggYSA9PT0gYiApIHtcbiAgICAgICAgcmV0dXJuIDA7IC8vIHVuaXF1ZW5lc3MgZ3VhcmFudGVlcyB0aGV5IHdlcmUgdGhlIHNhbWVcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYSA9PT0gbnVsbCA/IDEgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBjb21wYXJlUmVuZGVyLCBidXQgZm9yIHRoZSBuZXN0ZWQgKGRlcHRoLWZpcnN0KSBvcmRlclxuICAgKlxuICAgKiBUT0RPOiBvcHRpbWl6YXRpb24/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgY29tcGFyZU5lc3RlZCggb3RoZXI6IFRyYWlsUG9pbnRlciApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG90aGVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQWN0aXZlKCkgJiYgb3RoZXIuaXNBY3RpdmUoKSApO1xuICAgIGNvbnN0IGFjdGl2ZVNlbGYgPSB0aGlzIGFzIEFjdGl2ZVRyYWlsUG9pbnRlcjtcbiAgICBjb25zdCBhY3RpdmVPdGhlciA9IG90aGVyIGFzIEFjdGl2ZVRyYWlsUG9pbnRlcjtcblxuICAgIGNvbnN0IGNvbXBhcmlzb24gPSBhY3RpdmVTZWxmLnRyYWlsLmNvbXBhcmUoIGFjdGl2ZU90aGVyLnRyYWlsICk7XG5cbiAgICBpZiAoIGNvbXBhcmlzb24gPT09IDAgKSB7XG4gICAgICAvLyBpZiB0cmFpbHMgYXJlIGVxdWFsLCBqdXN0IGNvbXBhcmUgYmVmb3JlL2FmdGVyXG4gICAgICBpZiAoIHRoaXMuaXNCZWZvcmUgPT09IG90aGVyLmlzQmVmb3JlICkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0JlZm9yZSA/IC0xIDogMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBpZiBvbmUgaXMgYW4gZXh0ZW5zaW9uIG9mIHRoZSBvdGhlciwgdGhlIHNob3J0ZXIgaXNCZWZvcmUgZmxhZyBkZXRlcm1pbmVzIHRoZSBvcmRlciBjb21wbGV0ZWx5XG4gICAgICBpZiAoIGFjdGl2ZVNlbGYudHJhaWwuaXNFeHRlbnNpb25PZiggYWN0aXZlT3RoZXIudHJhaWwgKSApIHtcbiAgICAgICAgcmV0dXJuIG90aGVyLmlzQmVmb3JlID8gMSA6IC0xO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGFjdGl2ZU90aGVyLnRyYWlsLmlzRXh0ZW5zaW9uT2YoIGFjdGl2ZVNlbGYudHJhaWwgKSApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNCZWZvcmUgPyAtMSA6IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gbmVpdGhlciBpcyBhIHN1YnRyYWlsIG9mIHRoZSBvdGhlciwgc28gYSBzdHJhaWdodCB0cmFpbCBjb21wYXJpc29uIHNob3VsZCBnaXZlIHRoZSBhbnN3ZXJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmlzb247XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGVxdWFsc1JlbmRlciggb3RoZXI6IFRyYWlsUG9pbnRlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wYXJlUmVuZGVyKCBvdGhlciApID09PSAwO1xuICB9XG5cbiAgcHVibGljIGVxdWFsc05lc3RlZCggb3RoZXI6IFRyYWlsUG9pbnRlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wYXJlTmVzdGVkKCBvdGhlciApID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgcmV0dXJuIGZhbHNlIGlmIHRoaXMgcG9pbnRlciBoYXMgZ29uZSBvZmYgb2YgdGhlIGJlZ2lubmluZyBvciBlbmQgb2YgdGhlIHRyZWUgKHdpbGwgYmUgbWFya2VkIHdpdGggaXNBZnRlciBvclxuICAgKiBpc0JlZm9yZSB0aG91Z2gpXG4gICAqL1xuICBwdWJsaWMgaGFzVHJhaWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy50cmFpbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGlzIHBvaW50ZXIgZm9yd2FyZHMgb25lIHN0ZXAgaW4gdGhlIG5lc3RlZCBvcmRlclxuICAgKlxuICAgKiBUT0RPOiByZWZhY3RvciB3aXRoIFwiU2lkZVwiLWxpa2UgaGFuZGxpbmcgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICovXG4gIHB1YmxpYyBuZXN0ZWRGb3J3YXJkcygpOiB0aGlzIHwgbnVsbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZSgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlVHJhaWxQb2ludGVyO1xuXG4gICAgaWYgKCB0aGlzLmlzQmVmb3JlICkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBhY3RpdmVTZWxmLnRyYWlsLmxhc3ROb2RlKCkuX2NoaWxkcmVuO1xuICAgICAgaWYgKCBjaGlsZHJlbi5sZW5ndGggPiAwICkge1xuICAgICAgICAvLyBzdGF5IGFzIGJlZm9yZSwganVzdCB3YWxrIHRvIHRoZSBmaXJzdCBjaGlsZFxuICAgICAgICBhY3RpdmVTZWxmLnRyYWlsLmFkZERlc2NlbmRhbnQoIGNoaWxkcmVuWyAwIF0sIDAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBzdGF5IG9uIHRoZSBzYW1lIG5vZGUsIGJ1dCBzd2l0Y2ggdG8gYWZ0ZXJcbiAgICAgICAgdGhpcy5zZXRCZWZvcmUoIGZhbHNlICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKCBhY3RpdmVTZWxmLnRyYWlsLmluZGljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAvLyBub3RoaW5nIGVsc2UgdG8ganVtcCB0byBiZWxvdywgc28gaW5kaWNhdGUgdGhlIGxhY2sgb2YgZXhpc3RlbmNlXG4gICAgICAgIHRoaXMudHJhaWwgPSBudWxsO1xuICAgICAgICAvLyBzdGF5cyBpc0FmdGVyXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gYWN0aXZlU2VsZi50cmFpbC5pbmRpY2VzWyBhY3RpdmVTZWxmLnRyYWlsLmluZGljZXMubGVuZ3RoIC0gMSBdO1xuICAgICAgICBhY3RpdmVTZWxmLnRyYWlsLnJlbW92ZURlc2NlbmRhbnQoKTtcblxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGFjdGl2ZVNlbGYudHJhaWwubGFzdE5vZGUoKS5fY2hpbGRyZW47XG4gICAgICAgIGlmICggY2hpbGRyZW4ubGVuZ3RoID4gaW5kZXggKyAxICkge1xuICAgICAgICAgIC8vIG1vcmUgc2libGluZ3MsIHN3aXRjaCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IG9uZVxuICAgICAgICAgIGFjdGl2ZVNlbGYudHJhaWwuYWRkRGVzY2VuZGFudCggY2hpbGRyZW5bIGluZGV4ICsgMSBdLCBpbmRleCArIDEgKTtcbiAgICAgICAgICB0aGlzLnNldEJlZm9yZSggdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIG5vIG1vcmUgc2libGluZ3MuIGV4aXQgb24gcGFyZW50LiBub3RoaW5nIGVsc2UgbmVlZGVkIHNpbmNlIHdlJ3JlIGFscmVhZHkgaXNBZnRlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRoaXMgcG9pbnRlciBiYWNrd2FyZHMgb25lIHN0ZXAgaW4gdGhlIG5lc3RlZCBvcmRlclxuICAgKi9cbiAgcHVibGljIG5lc3RlZEJhY2t3YXJkcygpOiB0aGlzIHwgbnVsbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZSgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlVHJhaWxQb2ludGVyO1xuXG4gICAgaWYgKCB0aGlzLmlzQmVmb3JlICkge1xuICAgICAgaWYgKCBhY3RpdmVTZWxmLnRyYWlsLmluZGljZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAvLyBqdW1waW5nIG9mZiB0aGUgZnJvbnRcbiAgICAgICAgdGhpcy50cmFpbCA9IG51bGw7XG4gICAgICAgIC8vIHN0YXlzIGlzQmVmb3JlXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gYWN0aXZlU2VsZi50cmFpbC5pbmRpY2VzWyBhY3RpdmVTZWxmLnRyYWlsLmluZGljZXMubGVuZ3RoIC0gMSBdO1xuICAgICAgICBhY3RpdmVTZWxmLnRyYWlsLnJlbW92ZURlc2NlbmRhbnQoKTtcblxuICAgICAgICBpZiAoIGluZGV4IC0gMSA+PSAwICkge1xuICAgICAgICAgIC8vIG1vcmUgc2libGluZ3MsIHN3aXRjaCB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwcmV2aW91cyBvbmUgYW5kIHN3aXRjaCB0byBpc0FmdGVyXG4gICAgICAgICAgYWN0aXZlU2VsZi50cmFpbC5hZGREZXNjZW5kYW50KCBhY3RpdmVTZWxmLnRyYWlsLmxhc3ROb2RlKCkuX2NoaWxkcmVuWyBpbmRleCAtIDEgXSwgaW5kZXggLSAxICk7XG4gICAgICAgICAgdGhpcy5zZXRCZWZvcmUoIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gbm8gbW9yZSBzaWJsaW5ncy4gZW50ZXIgb24gcGFyZW50LiBub3RoaW5nIGVsc2UgbmVlZGVkIHNpbmNlIHdlJ3JlIGFscmVhZHkgaXNCZWZvcmVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICggYWN0aXZlU2VsZi50cmFpbC5sYXN0Tm9kZSgpLl9jaGlsZHJlbi5sZW5ndGggPiAwICkge1xuICAgICAgICAvLyBzdGF5IGlzQWZ0ZXIsIGJ1dCB3YWxrIHRvIHRoZSBsYXN0IGNoaWxkXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gYWN0aXZlU2VsZi50cmFpbC5sYXN0Tm9kZSgpLl9jaGlsZHJlbjtcbiAgICAgICAgYWN0aXZlU2VsZi50cmFpbC5hZGREZXNjZW5kYW50KCBjaGlsZHJlblsgY2hpbGRyZW4ubGVuZ3RoIC0gMSBdLCBjaGlsZHJlbi5sZW5ndGggLSAxICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gc3dpdGNoIHRvIGlzQmVmb3JlLCBzaW5jZSB0aGlzIGlzIGEgbGVhZiBub2RlXG4gICAgICAgIHRoaXMuc2V0QmVmb3JlKCB0cnVlICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyZWF0cyB0aGUgcG9pbnRlciBhcyByZW5kZXItb3JkZXJlZCAoaW5jbHVkZXMgdGhlIHN0YXJ0IHBvaW50ZXIgJ2JlZm9yZScgaWYgYXBwbGljYWJsZSwgZXhjbHVkZXMgdGhlIGVuZCBwb2ludGVyXG4gICAqICdiZWZvcmUnIGlmIGFwcGxpY2FibGVcbiAgICovXG4gIHB1YmxpYyBlYWNoTm9kZUJldHdlZW4oIG90aGVyOiBUcmFpbFBvaW50ZXIsIGNhbGxiYWNrOiAoIG5vZGU6IE5vZGUgKSA9PiB2b2lkICk6IHZvaWQge1xuICAgIHRoaXMuZWFjaFRyYWlsQmV0d2Vlbiggb3RoZXIsICggdHJhaWw6IFRyYWlsICkgPT4gY2FsbGJhY2soIHRyYWlsLmxhc3ROb2RlKCkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyZWF0cyB0aGUgcG9pbnRlciBhcyByZW5kZXItb3JkZXJlZCAoaW5jbHVkZXMgdGhlIHN0YXJ0IHBvaW50ZXIgJ2JlZm9yZScgaWYgYXBwbGljYWJsZSwgZXhjbHVkZXMgdGhlIGVuZCBwb2ludGVyXG4gICAqICdiZWZvcmUnIGlmIGFwcGxpY2FibGVcbiAgICovXG4gIHB1YmxpYyBlYWNoVHJhaWxCZXR3ZWVuKCBvdGhlcjogVHJhaWxQb2ludGVyLCBjYWxsYmFjazogVHJhaWxDYWxsYmFjayApOiB2b2lkIHtcbiAgICAvLyB0aGlzIHNob3VsZCB0cmlnZ2VyIG9uIGFsbCBwb2ludGVycyB0aGF0IGhhdmUgdGhlICdiZWZvcmUnIGZsYWcsIGV4Y2VwdCBhIHBvaW50ZXIgZXF1YWwgdG8gJ290aGVyJy5cblxuICAgIC8vIHNpbmNlIHdlIGV4Y2x1ZGUgZW5kcG9pbnRzIGluIHRoZSBkZXB0aEZpcnN0VW50aWwgY2FsbCwgd2UgbmVlZCB0byBmaXJlIHRoaXMgb2ZmIGZpcnN0XG4gICAgaWYgKCB0aGlzLmlzQmVmb3JlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZSgpICk7XG4gICAgICBjYWxsYmFjayggKCB0aGlzIGFzIEFjdGl2ZVRyYWlsUG9pbnRlciApLnRyYWlsICk7XG4gICAgfVxuXG4gICAgdGhpcy5kZXB0aEZpcnN0VW50aWwoIG90aGVyLCAoIHBvaW50ZXI6IEFjdGl2ZVRyYWlsUG9pbnRlciApID0+IHtcbiAgICAgIGlmICggcG9pbnRlci5pc0JlZm9yZSApIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCBwb2ludGVyLnRyYWlsICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSwgdHJ1ZSApOyAvLyBleGNsdWRlIHRoZSBlbmRwb2ludHMgc28gd2UgY2FuIGlnbm9yZSB0aGUgZW5kaW5nICdiZWZvcmUnIGNhc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSAoZGVwdGgtZmlyc3QpIGl0ZXJhdGVzIG92ZXIgYWxsIHBvaW50ZXJzIGJldHdlZW4gdGhpcyBwb2ludGVyIGFuZCAnb3RoZXInLCBjYWxsaW5nXG4gICAqIGNhbGxiYWNrKCBwb2ludGVyICkgZm9yIGVhY2ggcG9pbnRlci4gSWYgZXhjbHVkZUVuZHBvaW50cyBpcyB0cnV0aHksIHRoZSBjYWxsYmFjayB3aWxsIG5vdCBiZVxuICAgKiBjYWxsZWQgaWYgcG9pbnRlciBpcyBlcXVpdmFsZW50IHRvIHRoaXMgcG9pbnRlciBvciAnb3RoZXInLlxuICAgKlxuICAgKiBJZiB0aGUgY2FsbGJhY2sgcmV0dXJucyBhIHRydXRoeSB2YWx1ZSwgdGhlIHN1YnRyZWUgZm9yIHRoZSBjdXJyZW50IHBvaW50ZXIgd2lsbCBiZSBza2lwcGVkXG4gICAqIChhcHBsaWVzIG9ubHkgdG8gYmVmb3JlLXBvaW50ZXJzKVxuICAgKi9cbiAgcHVibGljIGRlcHRoRmlyc3RVbnRpbCggb3RoZXI6IFRyYWlsUG9pbnRlciwgY2FsbGJhY2s6IEFjdGl2ZVRyYWlsUG9pbnRlckNhbGxiYWNrLCBleGNsdWRlRW5kcG9pbnRzOiBib29sZWFuICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNBY3RpdmUoKSAmJiBvdGhlci5pc0FjdGl2ZSgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlVHJhaWxQb2ludGVyO1xuICAgIGNvbnN0IGFjdGl2ZU90aGVyID0gb3RoZXIgYXMgQWN0aXZlVHJhaWxQb2ludGVyO1xuXG4gICAgLy8gbWFrZSBzdXJlIHRoaXMgcG9pbnRlciBpcyBiZWZvcmUgdGhlIG90aGVyLCBidXQgYWxsb3cgc3RhcnQgPT09IGVuZCBpZiB3ZSBhcmUgbm90IGV4Y2x1ZGluZyBlbmRwb2ludHNcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbXBhcmVOZXN0ZWQoIG90aGVyICkgPD0gKCBleGNsdWRlRW5kcG9pbnRzID8gLTEgOiAwICksICdUcmFpbFBvaW50ZXIuZGVwdGhGaXJzdFVudGlsIHBvaW50ZXJzIG91dCBvZiBvcmRlciwgcG9zc2libHkgaW4gYm90aCBtZWFuaW5ncyBvZiB0aGUgcGhyYXNlIScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhY3RpdmVTZWxmLnRyYWlsLnJvb3ROb2RlKCkgPT09IGFjdGl2ZU90aGVyLnRyYWlsLnJvb3ROb2RlKCksICdUcmFpbFBvaW50ZXIuZGVwdGhGaXJzdFVudGlsIHRha2VzIHBvaW50ZXJzIHdpdGggdGhlIHNhbWUgcm9vdCcgKTtcblxuICAgIC8vIHNhbml0eSBjaGVjayBUT0RPOiByZW1vdmUgbGF0ZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBhY3RpdmVTZWxmLnRyYWlsLnJlaW5kZXgoKTtcbiAgICBhY3RpdmVPdGhlci50cmFpbC5yZWluZGV4KCk7XG5cbiAgICBjb25zdCBwb2ludGVyID0gdGhpcy5jb3B5KCkgYXMgQWN0aXZlVHJhaWxQb2ludGVyO1xuICAgIHBvaW50ZXIudHJhaWwuc2V0TXV0YWJsZSgpOyAvLyB0aGlzIHRyYWlsIHdpbGwgYmUgbW9kaWZpZWQgaW4gdGhlIGl0ZXJhdGlvbiwgc28gcmVmZXJlbmNlcyB0byBpdCBtYXkgYmUgbW9kaWZpZWRcblxuICAgIGxldCBmaXJzdCA9IHRydWU7XG5cbiAgICB3aGlsZSAoICFwb2ludGVyLmVxdWFsc05lc3RlZCggb3RoZXIgKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50ZXIuY29tcGFyZU5lc3RlZCggb3RoZXIgKSAhPT0gMSwgJ3NraXBwZWQgaW4gZGVwdGhGaXJzdFVudGlsJyApO1xuICAgICAgbGV0IHNraXBTdWJ0cmVlOiBib29sZWFuIHwgdm9pZCA9IGZhbHNlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1pbnZhbGlkLXZvaWQtdHlwZVxuXG4gICAgICBpZiAoIGZpcnN0ICkge1xuICAgICAgICAvLyBzdGFydCBwb2ludFxuICAgICAgICBpZiAoICFleGNsdWRlRW5kcG9pbnRzICkge1xuICAgICAgICAgIHNraXBTdWJ0cmVlID0gY2FsbGJhY2soIHBvaW50ZXIgKTtcbiAgICAgICAgfVxuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIGJldHdlZW4gcG9pbnRcbiAgICAgICAgc2tpcFN1YnRyZWUgPSBjYWxsYmFjayggcG9pbnRlciApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHNraXBTdWJ0cmVlICYmIHBvaW50ZXIuaXNCZWZvcmUgKSB7XG4gICAgICAgIC8vIHRvIHNraXAgdGhlIHN1YnRyZWUsIHdlIGp1c3QgY2hhbmdlIHRvIGlzQWZ0ZXJcbiAgICAgICAgcG9pbnRlci5zZXRCZWZvcmUoIGZhbHNlICk7XG5cbiAgICAgICAgLy8gaWYgd2Ugc2tpcCBhIHN1YnRyZWUsIG1ha2Ugc3VyZSB3ZSBkb24ndCBydW4gcGFzdCB0aGUgZW5kaW5nIHBvaW50ZXJcbiAgICAgICAgaWYgKCBwb2ludGVyLmNvbXBhcmVOZXN0ZWQoIG90aGVyICkgPT09IDEgKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBwb2ludGVyLm5lc3RlZEZvcndhcmRzKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZW5kIHBvaW50XG4gICAgaWYgKCAhZXhjbHVkZUVuZHBvaW50cyApIHtcbiAgICAgIGNhbGxiYWNrKCBwb2ludGVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZSgpICk7XG5cbiAgICByZXR1cm4gYFske3RoaXMuaXNCZWZvcmUgPyAnYmVmb3JlJyA6ICdhZnRlcid9ICR7KCB0aGlzIGFzIEFjdGl2ZVRyYWlsUG9pbnRlciApLnRyYWlsLnRvU3RyaW5nKCkuc2xpY2UoIDEgKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbWUgYXMgbmV3IFRyYWlsUG9pbnRlciggdHJhaWxBLCBpc0JlZm9yZUEgKS5jb21wYXJlTmVzdGVkKCBuZXcgVHJhaWxQb2ludGVyKCB0cmFpbEIsIGlzQmVmb3JlQiApIClcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29tcGFyZU5lc3RlZCggdHJhaWxBOiBUcmFpbCwgaXNCZWZvcmVBOiBib29sZWFuLCB0cmFpbEI6IFRyYWlsLCBpc0JlZm9yZUI6IGJvb2xlYW4gKTogbnVtYmVyIHtcbiAgICBjb25zdCBjb21wYXJpc29uID0gdHJhaWxBLmNvbXBhcmUoIHRyYWlsQiApO1xuXG4gICAgaWYgKCBjb21wYXJpc29uID09PSAwICkge1xuICAgICAgLy8gaWYgdHJhaWxzIGFyZSBlcXVhbCwganVzdCBjb21wYXJlIGJlZm9yZS9hZnRlclxuICAgICAgaWYgKCBpc0JlZm9yZUEgPT09IGlzQmVmb3JlQiApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGlzQmVmb3JlQSA/IC0xIDogMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBpZiBvbmUgaXMgYW4gZXh0ZW5zaW9uIG9mIHRoZSBvdGhlciwgdGhlIHNob3J0ZXIgaXNCZWZvcmUgZmxhZyBkZXRlcm1pbmVzIHRoZSBvcmRlciBjb21wbGV0ZWx5XG4gICAgICBpZiAoIHRyYWlsQS5pc0V4dGVuc2lvbk9mKCB0cmFpbEIgKSApIHtcbiAgICAgICAgcmV0dXJuIGlzQmVmb3JlQiA/IDEgOiAtMTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0cmFpbEIuaXNFeHRlbnNpb25PZiggdHJhaWxBICkgKSB7XG4gICAgICAgIHJldHVybiBpc0JlZm9yZUEgPyAtMSA6IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gbmVpdGhlciBpcyBhIHN1YnRyYWlsIG9mIHRoZSBvdGhlciwgc28gYSBzdHJhaWdodCB0cmFpbCBjb21wYXJpc29uIHNob3VsZCBnaXZlIHRoZSBhbnN3ZXJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmlzb247XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdUcmFpbFBvaW50ZXInLCBUcmFpbFBvaW50ZXIgKTsiXSwibmFtZXMiOlsic2NlbmVyeSIsIlRyYWlsUG9pbnRlciIsImlzQWN0aXZlIiwidHJhaWwiLCJjb3B5IiwiYXNzZXJ0IiwiaXNCZWZvcmUiLCJzZXRCZWZvcmUiLCJpc0FmdGVyIiwiZ2V0UmVuZGVyU3dhcHBlZFBvaW50ZXIiLCJhY3RpdmVTZWxmIiwibmV3VHJhaWwiLCJwcmV2aW91cyIsIm5leHQiLCJnZXRSZW5kZXJCZWZvcmVQb2ludGVyIiwiZ2V0UmVuZGVyQWZ0ZXJQb2ludGVyIiwiY29tcGFyZVJlbmRlciIsIm90aGVyIiwiYSIsImIiLCJjb21wYXJlIiwiY29tcGFyZU5lc3RlZCIsImFjdGl2ZU90aGVyIiwiY29tcGFyaXNvbiIsImlzRXh0ZW5zaW9uT2YiLCJlcXVhbHNSZW5kZXIiLCJlcXVhbHNOZXN0ZWQiLCJoYXNUcmFpbCIsIm5lc3RlZEZvcndhcmRzIiwiY2hpbGRyZW4iLCJsYXN0Tm9kZSIsIl9jaGlsZHJlbiIsImxlbmd0aCIsImFkZERlc2NlbmRhbnQiLCJpbmRpY2VzIiwiaW5kZXgiLCJyZW1vdmVEZXNjZW5kYW50IiwibmVzdGVkQmFja3dhcmRzIiwiZWFjaE5vZGVCZXR3ZWVuIiwiY2FsbGJhY2siLCJlYWNoVHJhaWxCZXR3ZWVuIiwiZGVwdGhGaXJzdFVudGlsIiwicG9pbnRlciIsImV4Y2x1ZGVFbmRwb2ludHMiLCJyb290Tm9kZSIsInJlaW5kZXgiLCJzZXRNdXRhYmxlIiwiZmlyc3QiLCJza2lwU3VidHJlZSIsInRvU3RyaW5nIiwic2xpY2UiLCJ0cmFpbEEiLCJpc0JlZm9yZUEiLCJ0cmFpbEIiLCJpc0JlZm9yZUIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7O0NBVUMsR0FHRCxTQUFlQSxPQUFPLFFBQWUsZ0JBQWdCO0FBT3RDLElBQUEsQUFBTUMsZUFBTixNQUFNQTtJQWVaQyxXQUF1QztRQUM1QyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUNDLEtBQUs7SUFDckI7SUFFT0MsT0FBcUI7UUFDMUJDLFVBQVVBLE9BQVEsSUFBSSxDQUFDSCxRQUFRO1FBQy9CLE9BQU8sSUFBSUQsYUFBYyxBQUFFLElBQUksQ0FBeUJFLEtBQUssQ0FBQ0MsSUFBSSxJQUFJLElBQUksQ0FBQ0UsUUFBUTtJQUNyRjtJQUVPQyxVQUFXRCxRQUFpQixFQUFTO1FBQzFDLElBQUksQ0FBQ0EsUUFBUSxHQUFHQTtRQUNoQixJQUFJLENBQUNFLE9BQU8sR0FBRyxDQUFDRjtJQUNsQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0csMEJBQStDO1FBQ3BESixVQUFVQSxPQUFRLElB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