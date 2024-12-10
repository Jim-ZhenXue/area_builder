// Copyright 2022-2024, University of Colorado Boulder
/**
 * An accelerated data structure of items where it supports fast queries of "what items overlap wth x values",
 * so we don't have to iterate through all items.
 *
 * This effectively combines an interval/segment tree with red-black tree balancing for insertion.
 *
 * For proper red-black constraints, we handle ranges from -infinity to infinity.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Pool from '../../../phet-core/js/Pool.js';
import { kite } from '../imports.js';
let globalId = 1;
const scratchArray = [];
let SegmentTree = class SegmentTree {
    /**
   * Calls interruptableCallback in turn for every "possibly overlapping" item stored in this tree.
   *
   * @param item - The item to use for the bounds range.
   * @param interruptableCallback - When this returns true, the search will be aborted
   */ query(item, interruptableCallback) {
        const id = globalId++;
        if (this.rootNode) {
            return this.rootNode.query(item, this.getMinX(item, this.epsilon), this.getMaxX(item, this.epsilon), id, interruptableCallback);
        } else {
            return false;
        }
    }
    addItem(item) {
        const min = this.getMinX(item, this.epsilon);
        const max = this.getMaxX(item, this.epsilon);
        // TOOD: consider adding into one traversal
        this.rootNode.split(min, this);
        this.rootNode.split(max, this);
        this.rootNode.addItem(item, min, max);
        this.items.add(item);
    }
    removeItem(item) {
        this.rootNode.removeItem(item, this.getMinX(item, this.epsilon), this.getMaxX(item, this.epsilon));
        this.items.delete(item);
    }
    /**
   * For assertion purposes
   */ audit() {
        this.rootNode.audit(this.epsilon, this.items, []);
    }
    toString() {
        let spacing = 0;
        let string = '';
        (function recurse(node) {
            string += `${_.repeat('  ', spacing)}${node.toString()}\n`;
            spacing++;
            if (node.hasChildren()) {
                recurse(node.left);
                recurse(node.right);
            }
            spacing--;
        })(this.rootNode);
        return string;
    }
    /**
   * @param epsilon - Used to expand the bounds of segments so we have some non-zero amount of "overlap" for our
   *                  segments
   */ constructor(epsilon = 1e-6){
        this.rootNode = SegmentNode.pool.create(this, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        this.rootNode.isBlack = true;
        this.epsilon = epsilon;
        this.items = new Set();
    }
};
export { SegmentTree as default };
// The nodes in our tree
let SegmentNode = class SegmentNode {
    initialize(tree, min, max) {
        this.min = min;
        this.max = max;
        this.splitValue = null;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.tree = tree;
        this.isBlack = false;
        cleanArray(this.items);
        return this;
    }
    contains(n) {
        return n >= this.min && n <= this.max;
    }
    hasChildren() {
        return this.splitValue !== null;
    }
    /**
   * Iterates through interruptableCallback for every potentially overlapping edge - aborts when it returns true
   *
   * @param item
   * @param min - computed min for the item
   * @param max - computed max for the item
   * @param id - our 1-time id that we use to not repeat calls with the same item
   * @param interruptableCallback
   * @returns whether we were aborted
   */ query(item, min, max, id, interruptableCallback) {
        let abort = false;
        // Partial containment works for everything checking for possible overlap
        if (this.min <= max && this.max >= min) {
            // Do an interruptable iteration
            for(let i = 0; i < this.items.length; i++){
                var _item_internalData, _item_internalData1;
                const item = this.items[i];
                // @ts-expect-error
                if (!((_item_internalData = item.internalData) == null ? void 0 : _item_internalData.segmentId) || ((_item_internalData1 = item.internalData) == null ? void 0 : _item_internalData1.segmentId) < id) {
                    // @ts-expect-error
                    item.internalData.segmentId = id;
                    abort = interruptableCallback(item);
                    if (abort) {
                        return true;
                    }
                }
            }
            if (this.hasChildren()) {
                if (!abort) {
                    abort = this.left.query(item, min, max, id, interruptableCallback);
                }
                if (!abort) {
                    abort = this.right.query(item, min, max, id, interruptableCallback);
                }
            }
        }
        return abort;
    }
    /**
   * Replaces one child with another
   */ swapChild(oldChild, newChild) {
        assert && assert(this.left === oldChild || this.right === oldChild);
        if (this.left === oldChild) {
            this.left = newChild;
        } else {
            this.right = newChild;
        }
    }
    hasChild(node) {
        return this.left === node || this.right === node;
    }
    otherChild(node) {
        assert && assert(this.hasChild(node));
        return this.left === node ? this.right : this.left;
    }
    /**
   * Tree operation needed for red-black self-balancing
   */ leftRotate(tree) {
        assert && assert(this.hasChildren() && this.right.hasChildren());
        if (this.right.hasChildren()) {
            const y = this.right;
            const alpha = this.left;
            const beta = y.left;
            const gamma = y.right;
            // Recreate parent/child connections
            y.parent = this.parent;
            if (this.parent) {
                this.parent.swapChild(this, y);
            } else {
                tree.rootNode = y;
            }
            this.parent = y;
            beta.parent = this;
            y.left = this;
            this.left = alpha;
            this.right = beta;
            // Recompute min/max/splitValue
            this.max = beta.max;
            this.splitValue = alpha.max;
            y.min = this.min;
            y.splitValue = this.max;
            // Start recomputation of stored items
            const xEdges = cleanArray(scratchArray);
            xEdges.push(...this.items);
            cleanArray(this.items);
            // combine alpha-beta into x
            for(let i = alpha.items.length - 1; i >= 0; i--){
                const edge = alpha.items[i];
                const index = beta.items.indexOf(edge);
                if (index >= 0) {
                    alpha.items.splice(i, 1);
                    beta.items.splice(index, 1);
                    this.items.push(edge);
                }
            }
            // push y to beta and gamma
            beta.items.push(...y.items);
            gamma.items.push(...y.items);
            cleanArray(y.items);
            // x items to y
            y.items.push(...xEdges);
        }
    }
    /**
   * Tree operation needed for red-black self-balancing
   */ rightRotate(tree) {
        assert && assert(this.hasChildren() && this.left.hasChildren());
        const x = this.left;
        const gamma = this.right;
        const alpha = x.left;
        const beta = x.right;
        // Recreate parent/child connections
        x.parent = this.parent;
        if (this.parent) {
            this.parent.swapChild(this, x);
        } else {
            tree.rootNode = x;
        }
        this.parent = x;
        beta.parent = this;
        x.right = this;
        this.left = beta;
        this.right = gamma;
        // Recompute min/max/splitValue
        this.min = beta.min;
        this.splitValue = gamma.min;
        x.max = this.max;
        x.splitValue = this.min;
        // Start recomputation of stored items
        const yEdges = cleanArray(scratchArray);
        yEdges.push(...this.items);
        cleanArray(this.items);
        // combine beta-gamma into y
        for(let i = gamma.items.length - 1; i >= 0; i--){
            const edge = gamma.items[i];
            const index = beta.items.indexOf(edge);
            if (index >= 0) {
                gamma.items.splice(i, 1);
                beta.items.splice(index, 1);
                this.items.push(edge);
            }
        }
        // push x to alpha and beta
        alpha.items.push(...x.items);
        beta.items.push(...x.items);
        cleanArray(x.items);
        // y items to x
        x.items.push(...yEdges);
    }
    /**
   * Called after an insertion (or potentially deletion in the future) that handles red-black tree rebalancing.
   */ fixRedBlack(tree) {
        assert && assert(!this.isBlack);
        if (!this.parent) {
            this.isBlack = true;
        } else {
            const parent = this.parent;
            if (!parent.isBlack) {
                // Due to red-black nature, grandparent should exist since if parent was the root, it would be black.
                const grandparent = parent.parent;
                const uncle = grandparent.otherChild(parent);
                if (!uncle.isBlack) {
                    // case 1
                    parent.isBlack = true;
                    uncle.isBlack = true;
                    grandparent.isBlack = false;
                    grandparent.fixRedBlack(tree);
                } else {
                    if (parent === grandparent.left) {
                        if (this === parent.right) {
                            // case 2
                            parent.leftRotate(tree);
                            parent.parent.isBlack = true;
                            parent.parent.parent.isBlack = false;
                            parent.parent.parent.rightRotate(tree);
                        } else {
                            // case 3
                            parent.isBlack = true;
                            grandparent.isBlack = false;
                            grandparent.rightRotate(tree);
                        }
                    } else {
                        if (this === parent.left) {
                            // case 2
                            parent.rightRotate(tree);
                            parent.parent.isBlack = true;
                            parent.parent.parent.isBlack = false;
                            parent.parent.parent.leftRotate(tree);
                        } else {
                            // case 3
                            parent.isBlack = true;
                            grandparent.isBlack = false;
                            grandparent.leftRotate(tree);
                        }
                    }
                }
            }
        }
    }
    /**
   * Triggers a split of whatever interval contains this value (or is a no-op if we already split at it before).
   */ split(n, tree) {
        assert && assert(this.contains(n));
        // Ignore splits if we are already split on them
        if (n === this.min || n === this.max) {
            return;
        }
        if (this.hasChildren()) {
            // If our split value is the same as our current one, we've already split on that
            if (this.splitValue !== n) {
                (n > this.splitValue ? this.right : this.left).split(n, tree);
            }
        } else {
            this.splitValue = n;
            const newLeft = SegmentNode.pool.create(this.tree, this.min, n);
            newLeft.parent = this;
            this.left = newLeft;
            const newRight = SegmentNode.pool.create(this.tree, n, this.max);
            newRight.parent = this;
            this.right = newRight;
            // Check if we need to do red-black tree balancing
            if (!this.isBlack && this.parent) {
                const parent = this.parent;
                const sibling = parent.otherChild(this);
                if (sibling.isBlack) {
                    if (this === parent.left) {
                        parent.rightRotate(tree);
                        newLeft.isBlack = true;
                    } else {
                        parent.leftRotate(tree);
                        newRight.isBlack = true;
                    }
                    this.fixRedBlack(tree);
                } else {
                    // case 1
                    this.isBlack = true;
                    sibling.isBlack = true;
                    parent.isBlack = false;
                    parent.fixRedBlack(tree);
                }
            }
        }
    }
    /**
   * Recursively adds an item
   */ addItem(item, min, max) {
        // Ignore no-overlap cases
        if (this.min > max || this.max < min) {
            return;
        }
        if (this.min >= min && this.max <= max) {
            // We are fully contained
            this.items.push(item);
        } else if (this.hasChildren()) {
            this.left.addItem(item, min, max);
            this.right.addItem(item, min, max);
        }
    }
    /**
   * Recursively removes an item
   */ removeItem(item, min, max) {
        // Ignore no-overlap cases
        if (this.min > max || this.max < min) {
            return;
        }
        if (this.min >= min && this.max <= max) {
            // We are fully contained
            assert && assert(this.items.includes(item));
            arrayRemove(this.items, item);
        } else if (this.hasChildren()) {
            this.left.removeItem(item, min, max);
            this.right.removeItem(item, min, max);
        }
    }
    /**
   * Recursively audits with assertions, checking all of our assumptions.
   *
   * @param epsilon
   * @param allItems - All items in the tree
   * @param presentItems - Edges that were present in ancestors
   */ audit(epsilon, allItems, presentItems = []) {
        if (assert) {
            for (const item of presentItems){
                assert(!this.items.includes(item));
            }
            for (const item of this.items){
                // Containment check, this node should be fully contained
                assert(this.tree.getMinX(item, epsilon) <= this.min);
                assert(this.tree.getMaxX(item, epsilon) >= this.max);
            }
            for (const item of presentItems){
                if (this.tree.getMinX(item, epsilon) <= this.min && this.tree.getMaxX(item, epsilon) >= this.max) {
                    assert(allItems.has(item) || this.items.includes(item));
                }
            }
            assert(this.hasChildren() === (this.left !== null));
            assert(this.hasChildren() === (this.right !== null));
            assert(this.hasChildren() === (this.splitValue !== null));
            assert(this.min < this.max);
            if (this.parent) {
                assert(this.parent.hasChild(this));
                assert(this.isBlack || this.parent.isBlack);
            }
            if (this.hasChildren()) {
                assert(this.left.parent === this);
                assert(this.right.parent === this);
                assert(this.min === this.left.min);
                assert(this.max === this.right.max);
                assert(this.splitValue === this.left.max);
                assert(this.splitValue === this.right.min);
                for (const item of this.left.items){
                    assert(!this.right.items.includes(item), 'We shouldn\'t have two children with the same item');
                }
                const childPresentItems = [
                    ...presentItems,
                    ...this.items
                ];
                this.left.audit(epsilon, allItems, childPresentItems);
                this.right.audit(epsilon, allItems, childPresentItems);
            }
        }
    }
    toString() {
        return `[${this.min} ${this.max}] split:${this.splitValue} ${this.isBlack ? 'black' : 'red'} ${this.items}`;
    }
    freeToPool() {
        SegmentNode.pool.freeToPool(this);
    }
    constructor(tree, min, max){
        this.items = [];
        this.initialize(tree, min, max);
    }
};
SegmentNode.pool = new Pool(SegmentNode);
kite.register('SegmentTree', SegmentTree);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL1NlZ21lbnRUcmVlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGFjY2VsZXJhdGVkIGRhdGEgc3RydWN0dXJlIG9mIGl0ZW1zIHdoZXJlIGl0IHN1cHBvcnRzIGZhc3QgcXVlcmllcyBvZiBcIndoYXQgaXRlbXMgb3ZlcmxhcCB3dGggeCB2YWx1ZXNcIixcbiAqIHNvIHdlIGRvbid0IGhhdmUgdG8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBpdGVtcy5cbiAqXG4gKiBUaGlzIGVmZmVjdGl2ZWx5IGNvbWJpbmVzIGFuIGludGVydmFsL3NlZ21lbnQgdHJlZSB3aXRoIHJlZC1ibGFjayB0cmVlIGJhbGFuY2luZyBmb3IgaW5zZXJ0aW9uLlxuICpcbiAqIEZvciBwcm9wZXIgcmVkLWJsYWNrIGNvbnN0cmFpbnRzLCB3ZSBoYW5kbGUgcmFuZ2VzIGZyb20gLWluZmluaXR5IHRvIGluZmluaXR5LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IEVkZ2UsIGtpdGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxubGV0IGdsb2JhbElkID0gMTtcbmNvbnN0IHNjcmF0Y2hBcnJheTogRWRnZVtdID0gW107XG5cbnR5cGUgU2VnbWVudEluZm88VD4gPSB7XG4gIGdldE1pblg6ICggaXRlbTogVCwgZXBzaWxvbjogbnVtYmVyICkgPT4gbnVtYmVyO1xuICBnZXRNYXhYOiAoIGl0ZW06IFQsIGVwc2lsb246IG51bWJlciApID0+IG51bWJlcjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFNlZ21lbnRUcmVlPFQ+IGltcGxlbWVudHMgU2VnbWVudEluZm88VD4ge1xuXG4gIHB1YmxpYyByb290Tm9kZTogU2VnbWVudE5vZGU8VD47XG5cbiAgLy8gT3VyIGVwc2lsb24sIHVzZWQgdG8gZXhwYW5kIHRoZSBib3VuZHMgb2Ygc2VnbWVudHMgc28gd2UgaGF2ZSBzb21lIG5vbi16ZXJvIGFtb3VudCBvZiBcIm92ZXJsYXBcIiBmb3Igb3VyIHNlZ21lbnRzXG4gIHByaXZhdGUgcmVhZG9ubHkgZXBzaWxvbjogbnVtYmVyO1xuXG4gIC8vIEFsbCBpdGVtcyBjdXJyZW50bHkgaW4gdGhlIHRyZWVcbiAgcHJpdmF0ZSByZWFkb25seSBpdGVtczogU2V0PFQ+O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZXBzaWxvbiAtIFVzZWQgdG8gZXhwYW5kIHRoZSBib3VuZHMgb2Ygc2VnbWVudHMgc28gd2UgaGF2ZSBzb21lIG5vbi16ZXJvIGFtb3VudCBvZiBcIm92ZXJsYXBcIiBmb3Igb3VyXG4gICAqICAgICAgICAgICAgICAgICAgc2VnbWVudHNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZXBzaWxvbiA9IDFlLTYgKSB7XG4gICAgdGhpcy5yb290Tm9kZSA9IFNlZ21lbnROb2RlLnBvb2wuY3JlYXRlKCB0aGlzLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApIGFzIFNlZ21lbnROb2RlPFQ+O1xuICAgIHRoaXMucm9vdE5vZGUuaXNCbGFjayA9IHRydWU7XG5cbiAgICB0aGlzLmVwc2lsb24gPSBlcHNpbG9uO1xuXG4gICAgdGhpcy5pdGVtcyA9IG5ldyBTZXQ8VD4oKTtcbiAgfVxuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRNaW5YKCBpdGVtOiBULCBlcHNpbG9uOiBudW1iZXIgKTogbnVtYmVyO1xuXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXRNYXhYKCBpdGVtOiBULCBlcHNpbG9uOiBudW1iZXIgKTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDYWxscyBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgaW4gdHVybiBmb3IgZXZlcnkgXCJwb3NzaWJseSBvdmVybGFwcGluZ1wiIGl0ZW0gc3RvcmVkIGluIHRoaXMgdHJlZS5cbiAgICpcbiAgICogQHBhcmFtIGl0ZW0gLSBUaGUgaXRlbSB0byB1c2UgZm9yIHRoZSBib3VuZHMgcmFuZ2UuXG4gICAqIEBwYXJhbSBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgLSBXaGVuIHRoaXMgcmV0dXJucyB0cnVlLCB0aGUgc2VhcmNoIHdpbGwgYmUgYWJvcnRlZFxuICAgKi9cbiAgcHVibGljIHF1ZXJ5KCBpdGVtOiBULCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2s6ICggaXRlbTogVCApID0+IGJvb2xlYW4gKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWQgPSBnbG9iYWxJZCsrO1xuXG4gICAgaWYgKCB0aGlzLnJvb3ROb2RlICkge1xuICAgICAgcmV0dXJuIHRoaXMucm9vdE5vZGUucXVlcnkoIGl0ZW0sIHRoaXMuZ2V0TWluWCggaXRlbSwgdGhpcy5lcHNpbG9uICksIHRoaXMuZ2V0TWF4WCggaXRlbSwgdGhpcy5lcHNpbG9uICksIGlkLCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFkZEl0ZW0oIGl0ZW06IFQgKTogdm9pZCB7XG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRNaW5YKCBpdGVtLCB0aGlzLmVwc2lsb24gKTtcbiAgICBjb25zdCBtYXggPSB0aGlzLmdldE1heFgoIGl0ZW0sIHRoaXMuZXBzaWxvbiApO1xuXG4gICAgLy8gVE9PRDogY29uc2lkZXIgYWRkaW5nIGludG8gb25lIHRyYXZlcnNhbFxuICAgIHRoaXMucm9vdE5vZGUuc3BsaXQoIG1pbiwgdGhpcyApO1xuICAgIHRoaXMucm9vdE5vZGUuc3BsaXQoIG1heCwgdGhpcyApO1xuICAgIHRoaXMucm9vdE5vZGUuYWRkSXRlbSggaXRlbSwgbWluLCBtYXggKTtcblxuICAgIHRoaXMuaXRlbXMuYWRkKCBpdGVtICk7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlSXRlbSggaXRlbTogVCApOiB2b2lkIHtcbiAgICB0aGlzLnJvb3ROb2RlLnJlbW92ZUl0ZW0oIGl0ZW0sIHRoaXMuZ2V0TWluWCggaXRlbSwgdGhpcy5lcHNpbG9uICksIHRoaXMuZ2V0TWF4WCggaXRlbSwgdGhpcy5lcHNpbG9uICkgKTtcbiAgICB0aGlzLml0ZW1zLmRlbGV0ZSggaXRlbSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBhc3NlcnRpb24gcHVycG9zZXNcbiAgICovXG4gIHB1YmxpYyBhdWRpdCgpOiB2b2lkIHtcbiAgICB0aGlzLnJvb3ROb2RlLmF1ZGl0KCB0aGlzLmVwc2lsb24sIHRoaXMuaXRlbXMsIFtdICk7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBsZXQgc3BhY2luZyA9IDA7XG4gICAgbGV0IHN0cmluZyA9ICcnO1xuXG4gICAgKCBmdW5jdGlvbiByZWN1cnNlKCBub2RlOiBTZWdtZW50Tm9kZTxUPiApIHtcbiAgICAgIHN0cmluZyArPSBgJHtfLnJlcGVhdCggJyAgJywgc3BhY2luZyApfSR7bm9kZS50b1N0cmluZygpfVxcbmA7XG4gICAgICBzcGFjaW5nKys7XG4gICAgICBpZiAoIG5vZGUuaGFzQ2hpbGRyZW4oKSApIHtcbiAgICAgICAgcmVjdXJzZSggbm9kZS5sZWZ0ISApO1xuICAgICAgICByZWN1cnNlKCBub2RlLnJpZ2h0ISApO1xuICAgICAgfVxuICAgICAgc3BhY2luZy0tO1xuICAgIH0gKSggdGhpcy5yb290Tm9kZSApO1xuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxufVxuXG4vLyBUaGUgbm9kZXMgaW4gb3VyIHRyZWVcbmNsYXNzIFNlZ21lbnROb2RlPFQ+IHtcblxuICAvLyBUaGUgbWluaW11bSB4IHZhbHVlIG9mIHRoaXMgc3VidHJlZVxuICBwdWJsaWMgbWluITogbnVtYmVyO1xuXG4gIC8vIFRoZSBtYXhpbXVtIHggdmFsdWUgb2YgdGhpcyBzdWJ0cmVlXG4gIHB1YmxpYyBtYXghOiBudW1iZXI7XG5cbiAgLy8gQ2hpbGQgbm9kZXMgKG5vdCBzcGVjaWZpZWQgaWYgd2UgaGF2ZSBubyBjaGlsZHJlbiBvciBzcGxpdFZhbHVlKS4gTGVmdCB2YWx1ZSBpcyBkZWZpbmVkIGFzIHRoZSBzbWFsbGVyIHJhbmdlLlxuICBwdWJsaWMgbGVmdCE6IFNlZ21lbnROb2RlPFQ+IHwgbnVsbDtcbiAgcHVibGljIHJpZ2h0ITogU2VnbWVudE5vZGU8VD4gfCBudWxsO1xuXG4gIC8vIFBhcmVudCBub2RlIChyb290IHdpbGwgaGF2ZSBudWxsKVxuICBwdWJsaWMgcGFyZW50ITogU2VnbWVudE5vZGU8VD4gfCBudWxsO1xuXG4gIC8vIFRoZSB2YWx1ZSB3aGVyZSB3ZSBzcGxpdCBvdXIgaW50ZXJ2YWwgaW50byBvdXIgY2hpbGRyZW4gKHNvIGlmIHdlIGFyZSAwLTEwLCBhbmQgYSBzcGxpdCB2YWx1ZSBvZiA1LCBvdXIgbGVmdCBjaGlsZFxuICAvLyB3aWxsIGhhdmUgMC01IGFuZCBvdXIgcmlnaHQgY2hpbGQgd2lsbCBoYXZlIDUtMTAuXG4gIHB1YmxpYyBzcGxpdFZhbHVlITogbnVtYmVyIHwgbnVsbDtcblxuICAvLyBBbGwgaXRlbXMgdGhhdCBjb3ZlciB0aGlzIGZ1bGwgcmFuZ2Ugb2Ygb3VyIG1pbi1tYXguIFRoZXNlIHdpbGwgYmUgc3RvcmVkIGFzIGhpZ2ggdXAgaW4gdGhlIHRyZWUgYXMgcG9zc2libGUuXG4gIHB1YmxpYyBpdGVtczogVFtdO1xuXG4gIC8vIFJlZC1ibGFjayB0cmVlIGNvbG9yIGluZm9ybWF0aW9uLCBmb3Igc2VsZi1iYWxhbmNpbmdcbiAgcHVibGljIGlzQmxhY2shOiBib29sZWFuO1xuXG4gIHB1YmxpYyB0cmVlITogU2VnbWVudFRyZWU8VD47XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmVlOiBTZWdtZW50VHJlZTxUPiwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyICkge1xuICAgIHRoaXMuaXRlbXMgPSBbXTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggdHJlZSwgbWluLCBtYXggKTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0aWFsaXplKCB0cmVlOiBTZWdtZW50VHJlZTxUPiwgbWluOiBudW1iZXIsIG1heDogbnVtYmVyICk6IHRoaXMge1xuICAgIHRoaXMubWluID0gbWluO1xuICAgIHRoaXMubWF4ID0gbWF4O1xuXG4gICAgdGhpcy5zcGxpdFZhbHVlID0gbnVsbDtcbiAgICB0aGlzLmxlZnQgPSBudWxsO1xuICAgIHRoaXMucmlnaHQgPSBudWxsO1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB0aGlzLnRyZWUgPSB0cmVlO1xuXG4gICAgdGhpcy5pc0JsYWNrID0gZmFsc2U7XG5cbiAgICBjbGVhbkFycmF5KCB0aGlzLml0ZW1zICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBjb250YWlucyggbjogbnVtYmVyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBuID49IHRoaXMubWluICYmIG4gPD0gdGhpcy5tYXg7XG4gIH1cblxuICBwdWJsaWMgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnNwbGl0VmFsdWUgIT09IG51bGw7IH1cblxuICAvKipcbiAgICogSXRlcmF0ZXMgdGhyb3VnaCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgZm9yIGV2ZXJ5IHBvdGVudGlhbGx5IG92ZXJsYXBwaW5nIGVkZ2UgLSBhYm9ydHMgd2hlbiBpdCByZXR1cm5zIHRydWVcbiAgICpcbiAgICogQHBhcmFtIGl0ZW1cbiAgICogQHBhcmFtIG1pbiAtIGNvbXB1dGVkIG1pbiBmb3IgdGhlIGl0ZW1cbiAgICogQHBhcmFtIG1heCAtIGNvbXB1dGVkIG1heCBmb3IgdGhlIGl0ZW1cbiAgICogQHBhcmFtIGlkIC0gb3VyIDEtdGltZSBpZCB0aGF0IHdlIHVzZSB0byBub3QgcmVwZWF0IGNhbGxzIHdpdGggdGhlIHNhbWUgaXRlbVxuICAgKiBAcGFyYW0gaW50ZXJydXB0YWJsZUNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgd2Ugd2VyZSBhYm9ydGVkXG4gICAqL1xuICBwdWJsaWMgcXVlcnkoIGl0ZW06IFQsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciwgaWQ6IG51bWJlciwgaW50ZXJydXB0YWJsZUNhbGxiYWNrOiAoIGl0ZW06IFQgKSA9PiBib29sZWFuICk6IGJvb2xlYW4ge1xuICAgIGxldCBhYm9ydCA9IGZhbHNlO1xuXG4gICAgLy8gUGFydGlhbCBjb250YWlubWVudCB3b3JrcyBmb3IgZXZlcnl0aGluZyBjaGVja2luZyBmb3IgcG9zc2libGUgb3ZlcmxhcFxuICAgIGlmICggdGhpcy5taW4gPD0gbWF4ICYmIHRoaXMubWF4ID49IG1pbiApIHtcblxuICAgICAgLy8gRG8gYW4gaW50ZXJydXB0YWJsZSBpdGVyYXRpb25cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLml0ZW1zWyBpIF07XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgaWYgKCAhaXRlbS5pbnRlcm5hbERhdGE/LnNlZ21lbnRJZCB8fCBpdGVtLmludGVybmFsRGF0YT8uc2VnbWVudElkIDwgaWQgKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgIGl0ZW0uaW50ZXJuYWxEYXRhLnNlZ21lbnRJZCA9IGlkO1xuICAgICAgICAgIGFib3J0ID0gaW50ZXJydXB0YWJsZUNhbGxiYWNrKCBpdGVtICk7XG4gICAgICAgICAgaWYgKCBhYm9ydCApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcbiAgICAgICAgaWYgKCAhYWJvcnQgKSB7XG4gICAgICAgICAgYWJvcnQgPSB0aGlzLmxlZnQhLnF1ZXJ5KCBpdGVtLCBtaW4sIG1heCwgaWQsIGludGVycnVwdGFibGVDYWxsYmFjayApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCAhYWJvcnQgKSB7XG4gICAgICAgICAgYWJvcnQgPSB0aGlzLnJpZ2h0IS5xdWVyeSggaXRlbSwgbWluLCBtYXgsIGlkLCBpbnRlcnJ1cHRhYmxlQ2FsbGJhY2sgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhYm9ydDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyBvbmUgY2hpbGQgd2l0aCBhbm90aGVyXG4gICAqL1xuICBwdWJsaWMgc3dhcENoaWxkKCBvbGRDaGlsZDogU2VnbWVudE5vZGU8VD4sIG5ld0NoaWxkOiBTZWdtZW50Tm9kZTxUPiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxlZnQgPT09IG9sZENoaWxkIHx8IHRoaXMucmlnaHQgPT09IG9sZENoaWxkICk7XG5cbiAgICBpZiAoIHRoaXMubGVmdCA9PT0gb2xkQ2hpbGQgKSB7XG4gICAgICB0aGlzLmxlZnQgPSBuZXdDaGlsZDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJpZ2h0ID0gbmV3Q2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGhhc0NoaWxkKCBub2RlOiBTZWdtZW50Tm9kZTxUPiApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sZWZ0ID09PSBub2RlIHx8IHRoaXMucmlnaHQgPT09IG5vZGU7XG4gIH1cblxuICBwdWJsaWMgb3RoZXJDaGlsZCggbm9kZTogU2VnbWVudE5vZGU8VD4gKTogU2VnbWVudE5vZGU8VD4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIG5vZGUgKSApO1xuXG4gICAgcmV0dXJuICggKCB0aGlzLmxlZnQgPT09IG5vZGUgKSA/IHRoaXMucmlnaHQgOiB0aGlzLmxlZnQgKSE7XG4gIH1cblxuICAvKipcbiAgICogVHJlZSBvcGVyYXRpb24gbmVlZGVkIGZvciByZWQtYmxhY2sgc2VsZi1iYWxhbmNpbmdcbiAgICovXG4gIHB1YmxpYyBsZWZ0Um90YXRlKCB0cmVlOiBTZWdtZW50VHJlZTxUPiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmhhc0NoaWxkcmVuKCkgJiYgdGhpcy5yaWdodCEuaGFzQ2hpbGRyZW4oKSApO1xuXG4gICAgaWYgKCB0aGlzLnJpZ2h0IS5oYXNDaGlsZHJlbigpICkge1xuICAgICAgY29uc3QgeSA9IHRoaXMucmlnaHQhO1xuICAgICAgY29uc3QgYWxwaGEgPSB0aGlzLmxlZnQhO1xuICAgICAgY29uc3QgYmV0YSA9IHkubGVmdCE7XG4gICAgICBjb25zdCBnYW1tYSA9IHkucmlnaHQhO1xuXG4gICAgICAvLyBSZWNyZWF0ZSBwYXJlbnQvY2hpbGQgY29ubmVjdGlvbnNcbiAgICAgIHkucGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgICBpZiAoIHRoaXMucGFyZW50ICkge1xuICAgICAgICB0aGlzLnBhcmVudC5zd2FwQ2hpbGQoIHRoaXMsIHkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0cmVlLnJvb3ROb2RlID0geTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyZW50ID0geTtcbiAgICAgIGJldGEucGFyZW50ID0gdGhpcztcblxuICAgICAgeS5sZWZ0ID0gdGhpcztcbiAgICAgIHRoaXMubGVmdCA9IGFscGhhO1xuICAgICAgdGhpcy5yaWdodCA9IGJldGE7XG5cbiAgICAgIC8vIFJlY29tcHV0ZSBtaW4vbWF4L3NwbGl0VmFsdWVcbiAgICAgIHRoaXMubWF4ID0gYmV0YS5tYXg7XG4gICAgICB0aGlzLnNwbGl0VmFsdWUgPSBhbHBoYS5tYXg7XG4gICAgICB5Lm1pbiA9IHRoaXMubWluO1xuICAgICAgeS5zcGxpdFZhbHVlID0gdGhpcy5tYXg7XG5cbiAgICAgIC8vIFN0YXJ0IHJlY29tcHV0YXRpb24gb2Ygc3RvcmVkIGl0ZW1zXG4gICAgICBjb25zdCB4RWRnZXMgPSBjbGVhbkFycmF5KCBzY3JhdGNoQXJyYXkgYXMgVFtdICk7XG4gICAgICB4RWRnZXMucHVzaCggLi4udGhpcy5pdGVtcyApO1xuICAgICAgY2xlYW5BcnJheSggdGhpcy5pdGVtcyApO1xuXG4gICAgICAvLyBjb21iaW5lIGFscGhhLWJldGEgaW50byB4XG4gICAgICBmb3IgKCBsZXQgaSA9IGFscGhhLml0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBjb25zdCBlZGdlID0gYWxwaGEuaXRlbXNbIGkgXTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBiZXRhLml0ZW1zLmluZGV4T2YoIGVkZ2UgKTtcbiAgICAgICAgaWYgKCBpbmRleCA+PSAwICkge1xuICAgICAgICAgIGFscGhhLml0ZW1zLnNwbGljZSggaSwgMSApO1xuICAgICAgICAgIGJldGEuaXRlbXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICAgIHRoaXMuaXRlbXMucHVzaCggZWRnZSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHB1c2ggeSB0byBiZXRhIGFuZCBnYW1tYVxuICAgICAgYmV0YS5pdGVtcy5wdXNoKCAuLi55Lml0ZW1zICk7XG4gICAgICBnYW1tYS5pdGVtcy5wdXNoKCAuLi55Lml0ZW1zICk7XG4gICAgICBjbGVhbkFycmF5KCB5Lml0ZW1zICk7XG5cbiAgICAgIC8vIHggaXRlbXMgdG8geVxuICAgICAgeS5pdGVtcy5wdXNoKCAuLi54RWRnZXMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJlZSBvcGVyYXRpb24gbmVlZGVkIGZvciByZWQtYmxhY2sgc2VsZi1iYWxhbmNpbmdcbiAgICovXG4gIHB1YmxpYyByaWdodFJvdGF0ZSggdHJlZTogU2VnbWVudFRyZWU8VD4gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZHJlbigpICYmIHRoaXMubGVmdCEuaGFzQ2hpbGRyZW4oKSApO1xuXG4gICAgY29uc3QgeCA9IHRoaXMubGVmdCE7XG4gICAgY29uc3QgZ2FtbWEgPSB0aGlzLnJpZ2h0ITtcbiAgICBjb25zdCBhbHBoYSA9IHgubGVmdCE7XG4gICAgY29uc3QgYmV0YSA9IHgucmlnaHQhO1xuXG4gICAgLy8gUmVjcmVhdGUgcGFyZW50L2NoaWxkIGNvbm5lY3Rpb25zXG4gICAgeC5wYXJlbnQgPSB0aGlzLnBhcmVudDtcbiAgICBpZiAoIHRoaXMucGFyZW50ICkge1xuICAgICAgdGhpcy5wYXJlbnQuc3dhcENoaWxkKCB0aGlzLCB4ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdHJlZS5yb290Tm9kZSA9IHg7XG4gICAgfVxuICAgIHRoaXMucGFyZW50ID0geDtcbiAgICBiZXRhLnBhcmVudCA9IHRoaXM7XG5cbiAgICB4LnJpZ2h0ID0gdGhpcztcbiAgICB0aGlzLmxlZnQgPSBiZXRhO1xuICAgIHRoaXMucmlnaHQgPSBnYW1tYTtcblxuICAgIC8vIFJlY29tcHV0ZSBtaW4vbWF4L3NwbGl0VmFsdWVcbiAgICB0aGlzLm1pbiA9IGJldGEubWluO1xuICAgIHRoaXMuc3BsaXRWYWx1ZSA9IGdhbW1hLm1pbjtcbiAgICB4Lm1heCA9IHRoaXMubWF4O1xuICAgIHguc3BsaXRWYWx1ZSA9IHRoaXMubWluO1xuXG4gICAgLy8gU3RhcnQgcmVjb21wdXRhdGlvbiBvZiBzdG9yZWQgaXRlbXNcbiAgICBjb25zdCB5RWRnZXMgPSBjbGVhbkFycmF5KCBzY3JhdGNoQXJyYXkgYXMgVFtdICk7XG4gICAgeUVkZ2VzLnB1c2goIC4uLnRoaXMuaXRlbXMgKTtcbiAgICBjbGVhbkFycmF5KCB0aGlzLml0ZW1zICk7XG5cbiAgICAvLyBjb21iaW5lIGJldGEtZ2FtbWEgaW50byB5XG4gICAgZm9yICggbGV0IGkgPSBnYW1tYS5pdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBnYW1tYS5pdGVtc1sgaSBdO1xuICAgICAgY29uc3QgaW5kZXggPSBiZXRhLml0ZW1zLmluZGV4T2YoIGVkZ2UgKTtcbiAgICAgIGlmICggaW5kZXggPj0gMCApIHtcbiAgICAgICAgZ2FtbWEuaXRlbXMuc3BsaWNlKCBpLCAxICk7XG4gICAgICAgIGJldGEuaXRlbXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGVkZ2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwdXNoIHggdG8gYWxwaGEgYW5kIGJldGFcbiAgICBhbHBoYS5pdGVtcy5wdXNoKCAuLi54Lml0ZW1zICk7XG4gICAgYmV0YS5pdGVtcy5wdXNoKCAuLi54Lml0ZW1zICk7XG4gICAgY2xlYW5BcnJheSggeC5pdGVtcyApO1xuXG4gICAgLy8geSBpdGVtcyB0byB4XG4gICAgeC5pdGVtcy5wdXNoKCAuLi55RWRnZXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgYW4gaW5zZXJ0aW9uIChvciBwb3RlbnRpYWxseSBkZWxldGlvbiBpbiB0aGUgZnV0dXJlKSB0aGF0IGhhbmRsZXMgcmVkLWJsYWNrIHRyZWUgcmViYWxhbmNpbmcuXG4gICAqL1xuICBwdWJsaWMgZml4UmVkQmxhY2soIHRyZWU6IFNlZ21lbnRUcmVlPFQ+ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzQmxhY2sgKTtcblxuICAgIGlmICggIXRoaXMucGFyZW50ICkge1xuICAgICAgdGhpcy5pc0JsYWNrID0gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudDtcblxuICAgICAgaWYgKCAhcGFyZW50LmlzQmxhY2sgKSB7XG4gICAgICAgIC8vIER1ZSB0byByZWQtYmxhY2sgbmF0dXJlLCBncmFuZHBhcmVudCBzaG91bGQgZXhpc3Qgc2luY2UgaWYgcGFyZW50IHdhcyB0aGUgcm9vdCwgaXQgd291bGQgYmUgYmxhY2suXG4gICAgICAgIGNvbnN0IGdyYW5kcGFyZW50ID0gcGFyZW50LnBhcmVudCE7XG4gICAgICAgIGNvbnN0IHVuY2xlID0gZ3JhbmRwYXJlbnQub3RoZXJDaGlsZCggcGFyZW50ICk7XG5cbiAgICAgICAgaWYgKCAhdW5jbGUuaXNCbGFjayApIHtcbiAgICAgICAgICAvLyBjYXNlIDFcbiAgICAgICAgICBwYXJlbnQuaXNCbGFjayA9IHRydWU7XG4gICAgICAgICAgdW5jbGUuaXNCbGFjayA9IHRydWU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnQuaXNCbGFjayA9IGZhbHNlO1xuICAgICAgICAgIGdyYW5kcGFyZW50LmZpeFJlZEJsYWNrKCB0cmVlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKCBwYXJlbnQgPT09IGdyYW5kcGFyZW50LmxlZnQgKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMgPT09IHBhcmVudC5yaWdodCApIHtcbiAgICAgICAgICAgICAgLy8gY2FzZSAyXG4gICAgICAgICAgICAgIHBhcmVudC5sZWZ0Um90YXRlKCB0cmVlICk7XG4gICAgICAgICAgICAgIHBhcmVudC5wYXJlbnQhLmlzQmxhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLmlzQmxhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcGFyZW50LnBhcmVudCEucGFyZW50IS5yaWdodFJvdGF0ZSggdHJlZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGNhc2UgM1xuICAgICAgICAgICAgICBwYXJlbnQuaXNCbGFjayA9IHRydWU7XG4gICAgICAgICAgICAgIGdyYW5kcGFyZW50LmlzQmxhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgZ3JhbmRwYXJlbnQucmlnaHRSb3RhdGUoIHRyZWUgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMgPT09IHBhcmVudC5sZWZ0ICkge1xuICAgICAgICAgICAgICAvLyBjYXNlIDJcbiAgICAgICAgICAgICAgcGFyZW50LnJpZ2h0Um90YXRlKCB0cmVlICk7XG4gICAgICAgICAgICAgIHBhcmVudC5wYXJlbnQhLmlzQmxhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICBwYXJlbnQucGFyZW50IS5wYXJlbnQhLmlzQmxhY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcGFyZW50LnBhcmVudCEucGFyZW50IS5sZWZ0Um90YXRlKCB0cmVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gY2FzZSAzXG4gICAgICAgICAgICAgIHBhcmVudC5pc0JsYWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgZ3JhbmRwYXJlbnQuaXNCbGFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICBncmFuZHBhcmVudC5sZWZ0Um90YXRlKCB0cmVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgc3BsaXQgb2Ygd2hhdGV2ZXIgaW50ZXJ2YWwgY29udGFpbnMgdGhpcyB2YWx1ZSAob3IgaXMgYSBuby1vcCBpZiB3ZSBhbHJlYWR5IHNwbGl0IGF0IGl0IGJlZm9yZSkuXG4gICAqL1xuICBwdWJsaWMgc3BsaXQoIG46IG51bWJlciwgdHJlZTogU2VnbWVudFRyZWU8VD4gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb250YWlucyggbiApICk7XG5cbiAgICAvLyBJZ25vcmUgc3BsaXRzIGlmIHdlIGFyZSBhbHJlYWR5IHNwbGl0IG9uIHRoZW1cbiAgICBpZiAoIG4gPT09IHRoaXMubWluIHx8IG4gPT09IHRoaXMubWF4ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5oYXNDaGlsZHJlbigpICkge1xuICAgICAgLy8gSWYgb3VyIHNwbGl0IHZhbHVlIGlzIHRoZSBzYW1lIGFzIG91ciBjdXJyZW50IG9uZSwgd2UndmUgYWxyZWFkeSBzcGxpdCBvbiB0aGF0XG4gICAgICBpZiAoIHRoaXMuc3BsaXRWYWx1ZSAhPT0gbiApIHtcbiAgICAgICAgKCBuID4gdGhpcy5zcGxpdFZhbHVlISA/IHRoaXMucmlnaHQgOiB0aGlzLmxlZnQgKSEuc3BsaXQoIG4sIHRyZWUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnNwbGl0VmFsdWUgPSBuO1xuXG4gICAgICBjb25zdCBuZXdMZWZ0ID0gU2VnbWVudE5vZGUucG9vbC5jcmVhdGUoIHRoaXMudHJlZSwgdGhpcy5taW4sIG4gKSBhcyBTZWdtZW50Tm9kZTxUPjtcbiAgICAgIG5ld0xlZnQucGFyZW50ID0gdGhpcztcbiAgICAgIHRoaXMubGVmdCA9IG5ld0xlZnQ7XG5cbiAgICAgIGNvbnN0IG5ld1JpZ2h0ID0gU2VnbWVudE5vZGUucG9vbC5jcmVhdGUoIHRoaXMudHJlZSwgbiwgdGhpcy5tYXggKSBhcyBTZWdtZW50Tm9kZTxUPjtcbiAgICAgIG5ld1JpZ2h0LnBhcmVudCA9IHRoaXM7XG4gICAgICB0aGlzLnJpZ2h0ID0gbmV3UmlnaHQ7XG5cbiAgICAgIC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gZG8gcmVkLWJsYWNrIHRyZWUgYmFsYW5jaW5nXG4gICAgICBpZiAoICF0aGlzLmlzQmxhY2sgJiYgdGhpcy5wYXJlbnQgKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50O1xuICAgICAgICBjb25zdCBzaWJsaW5nID0gcGFyZW50Lm90aGVyQ2hpbGQoIHRoaXMgKTtcbiAgICAgICAgaWYgKCBzaWJsaW5nLmlzQmxhY2sgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzID09PSBwYXJlbnQubGVmdCApIHtcbiAgICAgICAgICAgIHBhcmVudC5yaWdodFJvdGF0ZSggdHJlZSApO1xuICAgICAgICAgICAgbmV3TGVmdC5pc0JsYWNrID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnQubGVmdFJvdGF0ZSggdHJlZSApO1xuICAgICAgICAgICAgbmV3UmlnaHQuaXNCbGFjayA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZml4UmVkQmxhY2soIHRyZWUgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBjYXNlIDFcbiAgICAgICAgICB0aGlzLmlzQmxhY2sgPSB0cnVlO1xuICAgICAgICAgIHNpYmxpbmcuaXNCbGFjayA9IHRydWU7XG4gICAgICAgICAgcGFyZW50LmlzQmxhY2sgPSBmYWxzZTtcblxuICAgICAgICAgIHBhcmVudC5maXhSZWRCbGFjayggdHJlZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGFkZHMgYW4gaXRlbVxuICAgKi9cbiAgcHVibGljIGFkZEl0ZW0oIGl0ZW06IFQsIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciApOiB2b2lkIHtcbiAgICAvLyBJZ25vcmUgbm8tb3ZlcmxhcCBjYXNlc1xuICAgIGlmICggdGhpcy5taW4gPiBtYXggfHwgdGhpcy5tYXggPCBtaW4gKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLm1pbiA+PSBtaW4gJiYgdGhpcy5tYXggPD0gbWF4ICkge1xuICAgICAgLy8gV2UgYXJlIGZ1bGx5IGNvbnRhaW5lZFxuICAgICAgdGhpcy5pdGVtcy5wdXNoKCBpdGVtICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmhhc0NoaWxkcmVuKCkgKSB7XG4gICAgICB0aGlzLmxlZnQhLmFkZEl0ZW0oIGl0ZW0sIG1pbiwgbWF4ICk7XG4gICAgICB0aGlzLnJpZ2h0IS5hZGRJdGVtKCBpdGVtLCBtaW4sIG1heCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSByZW1vdmVzIGFuIGl0ZW1cbiAgICovXG4gIHB1YmxpYyByZW1vdmVJdGVtKCBpdGVtOiBULCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgKTogdm9pZCB7XG4gICAgLy8gSWdub3JlIG5vLW92ZXJsYXAgY2FzZXNcbiAgICBpZiAoIHRoaXMubWluID4gbWF4IHx8IHRoaXMubWF4IDwgbWluICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5taW4gPj0gbWluICYmIHRoaXMubWF4IDw9IG1heCApIHtcbiAgICAgIC8vIFdlIGFyZSBmdWxseSBjb250YWluZWRcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXRlbXMuaW5jbHVkZXMoIGl0ZW0gKSApO1xuICAgICAgYXJyYXlSZW1vdmUoIHRoaXMuaXRlbXMsIGl0ZW0gKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuaGFzQ2hpbGRyZW4oKSApIHtcbiAgICAgIHRoaXMubGVmdCEucmVtb3ZlSXRlbSggaXRlbSwgbWluLCBtYXggKTtcbiAgICAgIHRoaXMucmlnaHQhLnJlbW92ZUl0ZW0oIGl0ZW0sIG1pbiwgbWF4ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGF1ZGl0cyB3aXRoIGFzc2VydGlvbnMsIGNoZWNraW5nIGFsbCBvZiBvdXIgYXNzdW1wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBlcHNpbG9uXG4gICAqIEBwYXJhbSBhbGxJdGVtcyAtIEFsbCBpdGVtcyBpbiB0aGUgdHJlZVxuICAgKiBAcGFyYW0gcHJlc2VudEl0ZW1zIC0gRWRnZXMgdGhhdCB3ZXJlIHByZXNlbnQgaW4gYW5jZXN0b3JzXG4gICAqL1xuICBwdWJsaWMgYXVkaXQoIGVwc2lsb246IG51bWJlciwgYWxsSXRlbXM6IFNldDxUPiwgcHJlc2VudEl0ZW1zOiBUW10gPSBbXSApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgcHJlc2VudEl0ZW1zICkge1xuICAgICAgICBhc3NlcnQoICF0aGlzLml0ZW1zLmluY2x1ZGVzKCBpdGVtICkgKTtcbiAgICAgIH1cbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgdGhpcy5pdGVtcyApIHtcbiAgICAgICAgLy8gQ29udGFpbm1lbnQgY2hlY2ssIHRoaXMgbm9kZSBzaG91bGQgYmUgZnVsbHkgY29udGFpbmVkXG4gICAgICAgIGFzc2VydCggdGhpcy50cmVlLmdldE1pblgoIGl0ZW0sIGVwc2lsb24gKSA8PSB0aGlzLm1pbiApO1xuICAgICAgICBhc3NlcnQoIHRoaXMudHJlZS5nZXRNYXhYKCBpdGVtLCBlcHNpbG9uICkgPj0gdGhpcy5tYXggKTtcbiAgICAgIH1cbiAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgcHJlc2VudEl0ZW1zICkge1xuICAgICAgICBpZiAoIHRoaXMudHJlZS5nZXRNaW5YKCBpdGVtLCBlcHNpbG9uICkgPD0gdGhpcy5taW4gJiYgdGhpcy50cmVlLmdldE1heFgoIGl0ZW0sIGVwc2lsb24gKSA+PSB0aGlzLm1heCApIHtcbiAgICAgICAgICBhc3NlcnQoIGFsbEl0ZW1zLmhhcyggaXRlbSApIHx8IHRoaXMuaXRlbXMuaW5jbHVkZXMoIGl0ZW0gKSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFzc2VydCggdGhpcy5oYXNDaGlsZHJlbigpID09PSAoIHRoaXMubGVmdCAhPT0gbnVsbCApICk7XG4gICAgICBhc3NlcnQoIHRoaXMuaGFzQ2hpbGRyZW4oKSA9PT0gKCB0aGlzLnJpZ2h0ICE9PSBudWxsICkgKTtcbiAgICAgIGFzc2VydCggdGhpcy5oYXNDaGlsZHJlbigpID09PSAoIHRoaXMuc3BsaXRWYWx1ZSAhPT0gbnVsbCApICk7XG4gICAgICBhc3NlcnQoIHRoaXMubWluIDwgdGhpcy5tYXggKTtcblxuICAgICAgaWYgKCB0aGlzLnBhcmVudCApIHtcbiAgICAgICAgYXNzZXJ0KCB0aGlzLnBhcmVudC5oYXNDaGlsZCggdGhpcyApICk7XG4gICAgICAgIGFzc2VydCggdGhpcy5pc0JsYWNrIHx8IHRoaXMucGFyZW50LmlzQmxhY2sgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5oYXNDaGlsZHJlbigpICkge1xuICAgICAgICBhc3NlcnQoIHRoaXMubGVmdCEucGFyZW50ID09PSB0aGlzICk7XG4gICAgICAgIGFzc2VydCggdGhpcy5yaWdodCEucGFyZW50ID09PSB0aGlzICk7XG4gICAgICAgIGFzc2VydCggdGhpcy5taW4gPT09IHRoaXMubGVmdCEubWluICk7XG4gICAgICAgIGFzc2VydCggdGhpcy5tYXggPT09IHRoaXMucmlnaHQhLm1heCApO1xuICAgICAgICBhc3NlcnQoIHRoaXMuc3BsaXRWYWx1ZSA9PT0gdGhpcy5sZWZ0IS5tYXggKTtcbiAgICAgICAgYXNzZXJ0KCB0aGlzLnNwbGl0VmFsdWUgPT09IHRoaXMucmlnaHQhLm1pbiApO1xuXG4gICAgICAgIGZvciAoIGNvbnN0IGl0ZW0gb2YgdGhpcy5sZWZ0IS5pdGVtcyApIHtcbiAgICAgICAgICBhc3NlcnQoICF0aGlzLnJpZ2h0IS5pdGVtcy5pbmNsdWRlcyggaXRlbSApLCAnV2Ugc2hvdWxkblxcJ3QgaGF2ZSB0d28gY2hpbGRyZW4gd2l0aCB0aGUgc2FtZSBpdGVtJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2hpbGRQcmVzZW50SXRlbXMgPSBbIC4uLnByZXNlbnRJdGVtcywgLi4udGhpcy5pdGVtcyBdO1xuICAgICAgICB0aGlzLmxlZnQhLmF1ZGl0KCBlcHNpbG9uLCBhbGxJdGVtcywgY2hpbGRQcmVzZW50SXRlbXMgKTtcbiAgICAgICAgdGhpcy5yaWdodCEuYXVkaXQoIGVwc2lsb24sIGFsbEl0ZW1zLCBjaGlsZFByZXNlbnRJdGVtcyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgWyR7dGhpcy5taW59ICR7dGhpcy5tYXh9XSBzcGxpdDoke3RoaXMuc3BsaXRWYWx1ZX0gJHt0aGlzLmlzQmxhY2sgPyAnYmxhY2snIDogJ3JlZCd9ICR7dGhpcy5pdGVtc31gO1xuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgU2VnbWVudE5vZGUucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggU2VnbWVudE5vZGUgKTtcblxufVxuXG5raXRlLnJlZ2lzdGVyKCAnU2VnbWVudFRyZWUnLCBTZWdtZW50VHJlZSApOyJdLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsImNsZWFuQXJyYXkiLCJQb29sIiwia2l0ZSIsImdsb2JhbElkIiwic2NyYXRjaEFycmF5IiwiU2VnbWVudFRyZWUiLCJxdWVyeSIsIml0ZW0iLCJpbnRlcnJ1cHRhYmxlQ2FsbGJhY2siLCJpZCIsInJvb3ROb2RlIiwiZ2V0TWluWCIsImVwc2lsb24iLCJnZXRNYXhYIiwiYWRkSXRlbSIsIm1pbiIsIm1heCIsInNwbGl0IiwiaXRlbXMiLCJhZGQiLCJyZW1vdmVJdGVtIiwiZGVsZXRlIiwiYXVkaXQiLCJ0b1N0cmluZyIsInNwYWNpbmciLCJzdHJpbmciLCJyZWN1cnNlIiwibm9kZSIsIl8iLCJyZXBlYXQiLCJoYXNDaGlsZHJlbiIsImxlZnQiLCJyaWdodCIsIlNlZ21lbnROb2RlIiwicG9vbCIsImNyZWF0ZSIsIk51bWJlciIsIk5FR0FUSVZFX0lORklOSVRZIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJpc0JsYWNrIiwiU2V0IiwiaW5pdGlhbGl6ZSIsInRyZWUiLCJzcGxpdFZhbHVlIiwicGFyZW50IiwiY29udGFpbnMiLCJuIiwiYWJvcnQiLCJpIiwibGVuZ3RoIiwiaW50ZXJuYWxEYXRhIiwic2VnbWVudElkIiwic3dhcENoaWxkIiwib2xkQ2hpbGQiLCJuZXdDaGlsZCIsImFzc2VydCIsImhhc0NoaWxkIiwib3RoZXJDaGlsZCIsImxlZnRSb3RhdGUiLCJ5IiwiYWxwaGEiLCJiZXRhIiwiZ2FtbWEiLCJ4RWRnZXMiLCJwdXNoIiwiZWRnZSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInJpZ2h0Um90YXRlIiwieCIsInlFZGdlcyIsImZpeFJlZEJsYWNrIiwiZ3JhbmRwYXJlbnQiLCJ1bmNsZSIsIm5ld0xlZnQiLCJuZXdSaWdodCIsInNpYmxpbmciLCJpbmNsdWRlcyIsImFsbEl0ZW1zIiwicHJlc2VudEl0ZW1zIiwiaGFzIiwiY2hpbGRQcmVzZW50SXRlbXMiLCJmcmVlVG9Qb29sIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7O0NBU0MsR0FFRCxPQUFPQSxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsVUFBVSxnQ0FBZ0M7QUFDakQsU0FBZUMsSUFBSSxRQUFRLGdCQUFnQjtBQUUzQyxJQUFJQyxXQUFXO0FBQ2YsTUFBTUMsZUFBdUIsRUFBRTtBQU9oQixJQUFBLEFBQWVDLGNBQWYsTUFBZUE7SUEyQjVCOzs7OztHQUtDLEdBQ0QsQUFBT0MsTUFBT0MsSUFBTyxFQUFFQyxxQkFBNkMsRUFBWTtRQUM5RSxNQUFNQyxLQUFLTjtRQUVYLElBQUssSUFBSSxDQUFDTyxRQUFRLEVBQUc7WUFDbkIsT0FBTyxJQUFJLENBQUNBLFFBQVEsQ0FBQ0osS0FBSyxDQUFFQyxNQUFNLElBQUksQ0FBQ0ksT0FBTyxDQUFFSixNQUFNLElBQUksQ0FBQ0ssT0FBTyxHQUFJLElBQUksQ0FBQ0MsT0FBTyxDQUFFTixNQUFNLElBQUksQ0FBQ0ssT0FBTyxHQUFJSCxJQUFJRDtRQUNoSCxPQUNLO1lBQ0gsT0FBTztRQUNUO0lBQ0Y7SUFFT00sUUFBU1AsSUFBTyxFQUFTO1FBQzlCLE1BQU1RLE1BQU0sSUFBSSxDQUFDSixPQUFPLENBQUVKLE1BQU0sSUFBSSxDQUFDSyxPQUFPO1FBQzVDLE1BQU1JLE1BQU0sSUFBSSxDQUFDSCxPQUFPLENB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