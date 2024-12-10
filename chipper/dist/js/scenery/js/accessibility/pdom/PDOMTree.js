// Copyright 2018-2024, University of Colorado Boulder
/**
 * The main logic for maintaining the PDOM instance tree (see https://github.com/phetsims/scenery-phet/issues/365)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import { BrowserEvents, FocusManager, Node, PartialPDOMTrail, PDOMInstance, scenery, Trail } from '../../imports.js';
const PDOMTree = {
    /**
   * Called when a child node is added to a parent node (and the child is likely to have pdom content).
   * @public
   *
   * @param {Node} parent
   * @param {Node} child
   */ addChild (parent, child) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`addChild parent:n#${parent._id}, child:n#${child._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && assert(parent instanceof Node);
        assert && assert(child instanceof Node);
        assert && assert(!child._rendererSummary.hasNoPDOM());
        const focusedNode = PDOMTree.beforeOp();
        if (!child._pdomParent) {
            PDOMTree.addTree(parent, child);
        }
        PDOMTree.afterOp(focusedNode);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Called when a child node is removed from a parent node (and the child is likely to have pdom content).
   * @public
   *
   * @param {Node} parent
   * @param {Node} child
   */ removeChild (parent, child) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removeChild parent:n#${parent._id}, child:n#${child._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && assert(parent instanceof Node);
        assert && assert(child instanceof Node);
        assert && assert(!child._rendererSummary.hasNoPDOM());
        const focusedNode = PDOMTree.beforeOp();
        if (!child._pdomParent) {
            PDOMTree.removeTree(parent, child);
        }
        PDOMTree.afterOp(focusedNode);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Called when a node's children are reordered (no additions/removals).
   * @public
   *
   * @param {Node} node
   */ childrenOrderChange (node) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`childrenOrderChange node:n#${node._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && assert(node instanceof Node);
        assert && assert(!node._rendererSummary.hasNoPDOM());
        const focusedNode = PDOMTree.beforeOp();
        PDOMTree.reorder(node);
        PDOMTree.afterOp(focusedNode);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Called when a node has a pdomOrder change.
   * @public
   *
   * @param {Node} node
   * @param {Array.<Node|null>|null} oldOrder
   * @param {Array.<Node|null>|null} newOrder
   */ pdomOrderChange (node, oldOrder, newOrder) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`pdomOrderChange n#${node._id}: ${PDOMTree.debugOrder(oldOrder)},${PDOMTree.debugOrder(newOrder)}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && assert(node instanceof Node);
        const focusedNode = PDOMTree.beforeOp();
        const removedItems = []; // {Array.<Node|null>} - May contain the placeholder null
        const addedItems = []; // {Array.<Node|null>} - May contain the placeholder null
        arrayDifference(oldOrder || [], newOrder || [], removedItems, addedItems);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removed: ${PDOMTree.debugOrder(removedItems)}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`added: ${PDOMTree.debugOrder(addedItems)}`);
        let i;
        let j;
        // Check some initial conditions
        if (assert) {
            for(i = 0; i < removedItems; i++){
                assert(removedItems[i] === null || removedItems[i]._pdomParent === node, 'Node should have had a pdomOrder');
            }
            for(i = 0; i < addedItems; i++){
                assert(addedItems[i] === null || addedItems[i]._pdomParent === null, 'Node is already specified in a pdomOrder');
            }
        }
        // NOTE: Performance could be improved in some cases if we can avoid rebuilding a pdom tree for DIRECT children
        // when changing whether they are present in the pdomOrder. Basically, if something is a child and NOT
        // in a pdomOrder, changing its parent's order to include it (or vice versa) triggers a rebuild when it
        // would not strictly be necessary.
        const pdomTrails = PDOMTree.findPDOMTrails(node);
        // Remove subtrees from us (that were removed)
        for(i = 0; i < removedItems.length; i++){
            const removedItemToRemove = removedItems[i];
            if (removedItemToRemove) {
                PDOMTree.removeTree(node, removedItemToRemove, pdomTrails);
                removedItemToRemove._pdomParent = null;
                removedItemToRemove.pdomParentChangedEmitter.emit();
            }
        }
        // Remove subtrees from their parents (that will be added here instead)
        for(i = 0; i < addedItems.length; i++){
            const addedItemToRemove = addedItems[i];
            if (addedItemToRemove) {
                const removedParents = addedItemToRemove._parents;
                for(j = 0; j < removedParents.length; j++){
                    PDOMTree.removeTree(removedParents[j], addedItemToRemove);
                }
                addedItemToRemove._pdomParent = node;
                addedItemToRemove.pdomParentChangedEmitter.emit();
            }
        }
        // Add subtrees to their parents (that were removed from our order)
        for(i = 0; i < removedItems.length; i++){
            const removedItemToAdd = removedItems[i];
            if (removedItemToAdd) {
                const addedParents = removedItemToAdd._parents;
                for(j = 0; j < addedParents.length; j++){
                    PDOMTree.addTree(addedParents[j], removedItemToAdd);
                }
            }
        }
        // Add subtrees to us (that were added in this order change)
        for(i = 0; i < addedItems.length; i++){
            const addedItemToAdd = addedItems[i];
            addedItemToAdd && PDOMTree.addTree(node, addedItemToAdd, pdomTrails);
        }
        PDOMTree.reorder(node, pdomTrails);
        PDOMTree.afterOp(focusedNode);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Called when a node has a pdomContent change.
   * @public
   *
   * @param {Node} node
   */ pdomContentChange (node) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`pdomContentChange n#${node._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && assert(node instanceof Node);
        const focusedNode = PDOMTree.beforeOp();
        let i;
        const parents = node._pdomParent ? [
            node._pdomParent
        ] : node._parents;
        const pdomTrailsList = []; // pdomTrailsList[ i ] := PDOMTree.findPDOMTrails( parents[ i ] )
        // For now, just regenerate the full tree. Could optimize in the future, if we can swap the content for an
        // PDOMInstance.
        for(i = 0; i < parents.length; i++){
            const parent = parents[i];
            const pdomTrails = PDOMTree.findPDOMTrails(parent);
            pdomTrailsList.push(pdomTrails);
            PDOMTree.removeTree(parent, node, pdomTrails);
        }
        // Do all removals before adding anything back in.
        for(i = 0; i < parents.length; i++){
            PDOMTree.addTree(parents[i], node, pdomTrailsList[i]);
        }
        // An edge case is where we change the rootNode of the display (and don't have an effective parent)
        for(i = 0; i < node._rootedDisplays.length; i++){
            const display = node._rootedDisplays[i];
            if (display._accessible) {
                PDOMTree.rebuildInstanceTree(display._rootPDOMInstance);
            }
        }
        PDOMTree.afterOp(focusedNode);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Sets up a root instance with a given root node.
   * @public
   *
   * @param {PDOMInstance} rootInstance
   */ rebuildInstanceTree (rootInstance) {
        const rootNode = rootInstance.display.rootNode;
        assert && assert(rootNode);
        rootInstance.removeAllChildren();
        rootInstance.addConsecutiveInstances(PDOMTree.createTree(new Trail(rootNode), rootInstance.display, rootInstance));
    },
    /**
   * Handles the conceptual addition of a pdom subtree.
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */ addTree (parent, child, pdomTrails) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`addTree parent:n#${parent._id}, child:n#${child._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        assert && PDOMTree.auditNodeForPDOMCycles(parent);
        pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(parent);
        for(let i = 0; i < pdomTrails.length; i++){
            sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`trail: ${pdomTrails[i].trail.toString()} full:${pdomTrails[i].fullTrail.toString()} for ${pdomTrails[i].pdomInstance.toString()} root:${pdomTrails[i].isRoot}`);
            sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
            const partialTrail = pdomTrails[i];
            const parentInstance = partialTrail.pdomInstance;
            // The full trail doesn't have the child in it, so we temporarily add that for tree creation
            partialTrail.fullTrail.addDescendant(child);
            const childInstances = PDOMTree.createTree(partialTrail.fullTrail, parentInstance.display, parentInstance);
            partialTrail.fullTrail.removeDescendant(child);
            parentInstance.addConsecutiveInstances(childInstances);
            sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
        }
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Handles the conceptual removal of a pdom subtree.
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */ removeTree (parent, child, pdomTrails) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`removeTree parent:n#${parent._id}, child:n#${child._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(parent);
        for(let i = 0; i < pdomTrails.length; i++){
            const partialTrail = pdomTrails[i];
            // The full trail doesn't have the child in it, so we temporarily add that for tree removal
            partialTrail.fullTrail.addDescendant(child);
            partialTrail.pdomInstance.removeInstancesForTrail(partialTrail.fullTrail);
            partialTrail.fullTrail.removeDescendant(child);
        }
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Handles the conceptual sorting of a pdom subtree.
   * @private
   *
   * @param {Node} node
   * @param {Array.<PartialPDOMTrail>} [pdomTrails] - Will be computed if needed
   */ reorder (node, pdomTrails) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`reorder n#${node._id}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        pdomTrails = pdomTrails || PDOMTree.findPDOMTrails(node);
        for(let i = 0; i < pdomTrails.length; i++){
            const partialTrail = pdomTrails[i];
            // TODO: does it optimize things to pass the partial trail in (so we scan less)? https://github.com/phetsims/scenery/issues/1581
            partialTrail.pdomInstance.sortChildren();
        }
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
    },
    /**
   * Creates PDOM instances, returning an array of instances that should be added to the next level.
   * @private
   *
   * NOTE: Trails for which an already-existing instance exists will NOT create a new instance here. We only want to
   * fill in the "missing" structure. There are cases (a.children=[b,c], b.children=[c]) where removing an
   * pdomOrder can trigger addTree(a,b) AND addTree(b,c), and we can't create duplicate content.
   *
   * @param {Trail} trail
   * @param {Display} display
   * @param {PDOMInstance} parentInstance - Since we don't create the root here, can't be null
   * @returns {Array.<PDOMInstance>}
   */ createTree (trail, display, parentInstance) {
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`createTree ${trail.toString()} parent:${parentInstance ? parentInstance.toString() : 'null'}`);
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.push();
        const node = trail.lastNode();
        const effectiveChildren = node.getEffectiveChildren();
        sceneryLog && sceneryLog.PDOMTree && sceneryLog.PDOMTree(`effectiveChildren: ${PDOMTree.debugOrder(effectiveChildren)}`);
        // If we have pdom content ourself, we need to create the instance (so we can provide it to child instances).
        let instance;
        let existed = false;
        if (node.hasPDOMContent) {
            instance = parentInstance.findChildWithTrail(trail);
            if (instance) {
                existed = true;
            } else {
                instance = PDOMInstance.pool.create(parentInstance, display, trail.copy());
            }
            // If there was an instance, then it should be the parent to effective children, otherwise, it isn't part of the
            // trail.
            parentInstance = instance;
        }
        // Create all of the direct-child instances.
        const childInstances = [];
        for(let i = 0; i < effectiveChildren.length; i++){
            trail.addDescendant(effectiveChildren[i], i);
            Array.prototype.push.apply(childInstances, PDOMTree.createTree(trail, display, parentInstance));
            trail.removeDescendant();
        }
        // If we have an instance, hook things up, and return just it.
        if (instance) {
            instance.addConsecutiveInstances(childInstances);
            sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
            return existed ? [] : [
                instance
            ];
        } else {
            sceneryLog && sceneryLog.PDOMTree && sceneryLog.pop();
            return childInstances;
        }
    },
    /**
   * Prepares for a pdom-tree-changing operation (saving some state). During DOM operations we don't want Display
   * input to dispatch events as focus changes.
   * @private
   * @returns {Node|null}
   */ beforeOp () {
        BrowserEvents.blockFocusCallbacks = true;
        return FocusManager.pdomFocusedNode;
    },
    /**
   * Finalizes a pdom-tree-changing operation (restoring some state).
   * @param {Node|null} focusedNode
   * @private
   */ afterOp (focusedNode) {
        // If Scenery is in the middle of dispatching focus events, it is buggy to change focus again internally.
        if (!BrowserEvents.dispatchingFocusEvents) {
            focusedNode && focusedNode.focusable && focusedNode.focus();
        }
        BrowserEvents.blockFocusCallbacks = false;
    },
    /**
   * Returns all "pdom" trails from this node ancestor-wise to nodes that have display roots.
   * @private
   *
   * NOTE: "pdom" trails may not have strict parent-child relationships between adjacent nodes, as remapping of
   * the tree can have a "PDOM parent" and "pdom child" case (the child is in the parent's pdomOrder).
   *
   * @param {Node} node
   * @returns {Array.<PartialPDOMTrail>}
   */ findPDOMTrails (node) {
        const trails = [];
        PDOMTree.recursivePDOMTrailSearch(trails, new Trail(node));
        return trails;
    },
    /**
   * Finds all partial "pdom" trails
   * @private
   *
   * @param {Array.<PartialPDOMTrail>} trailResults - Mutated, this is how we "return" our value.
   * @param {Trail} trail - Where to start from
   */ recursivePDOMTrailSearch (trailResults, trail) {
        const root = trail.rootNode();
        let i;
        // If we find pdom content, our search ends here. IF it is connected to any accessible pdom displays somehow, it
        // will have pdom instances. We only care about these pdom instances, as they already have any DAG
        // deduplication applied.
        if (root.hasPDOMContent) {
            const instances = root.pdomInstances;
            for(i = 0; i < instances.length; i++){
                trailResults.push(new PartialPDOMTrail(instances[i], trail.copy(), false));
            }
            return;
        } else {
            const rootedDisplays = root.rootedDisplays;
            for(i = 0; i < rootedDisplays.length; i++){
                const display = rootedDisplays[i];
                if (display._accessible) {
                    trailResults.push(new PartialPDOMTrail(display._rootPDOMInstance, trail.copy(), true));
                }
            }
        }
        const parents = root._pdomParent ? [
            root._pdomParent
        ] : root._parents;
        const parentCount = parents.length;
        for(i = 0; i < parentCount; i++){
            const parent = parents[i];
            trail.addAncestor(parent);
            PDOMTree.recursivePDOMTrailSearch(trailResults, trail);
            trail.removeAncestor();
        }
    },
    /**
   * Ensures that the pdomDisplays on the node (and its subtree) are accurate.
   * @public
   */ auditPDOMDisplays (node) {
        if (assertSlow) {
            if (node._pdomDisplaysInfo.canHavePDOMDisplays()) {
                let i;
                const displays = [];
                // Concatenation of our parents' pdomDisplays
                for(i = 0; i < node._parents.length; i++){
                    Array.prototype.push.apply(displays, node._parents[i]._pdomDisplaysInfo.pdomDisplays);
                }
                // And concatenation of any rooted displays (that support pdom)
                for(i = 0; i < node._rootedDisplays.length; i++){
                    const display = node._rootedDisplays[i];
                    if (display._accessible) {
                        displays.push(display);
                    }
                }
                const actualArray = node._pdomDisplaysInfo.pdomDisplays.slice();
                const expectedArray = displays.slice(); // slice helps in debugging
                assertSlow(actualArray.length === expectedArray.length);
                for(i = 0; i < expectedArray.length; i++){
                    for(let j = 0; j < actualArray.length; j++){
                        if (expectedArray[i] === actualArray[j]) {
                            expectedArray.splice(i, 1);
                            actualArray.splice(j, 1);
                            i--;
                            break;
                        }
                    }
                }
                assertSlow(actualArray.length === 0 && expectedArray.length === 0, 'Mismatch with accessible pdom displays');
            } else {
                assertSlow(node._pdomDisplaysInfo.pdomDisplays.length === 0, 'Invisible/nonaccessible things should have no displays');
            }
        }
    },
    /**
   * Checks a given Node (with assertions) to ensure it is not part of a cycle in the combined graph with edges
   * defined by "there is a parent-child or pdomParent-pdomOrder" relationship between the two nodes.
   * @public (scenery-internal)
   *
   * See https://github.com/phetsims/scenery/issues/787 for more information (and for some detail on the cases
   * that we want to catch).
   *
   * @param {Node} node
   */ auditNodeForPDOMCycles (node) {
        if (assert) {
            const trail = new Trail(node);
            (function recursiveSearch() {
                const root = trail.rootNode();
                assert(trail.length <= 1 || root !== node, `${'Accessible PDOM graph cycle detected. The combined scene-graph DAG with pdomOrder defining additional ' + 'parent-child relationships should still be a DAG. Cycle detected with the trail: '}${trail.toString()} path: ${trail.toPathString()}`);
                const parentCount = root._parents.length;
                for(let i = 0; i < parentCount; i++){
                    const parent = root._parents[i];
                    trail.addAncestor(parent);
                    recursiveSearch();
                    trail.removeAncestor();
                }
                // Only visit the pdomParent if we didn't already visit it as a parent.
                if (root._pdomParent && !root._pdomParent.hasChild(root)) {
                    trail.addAncestor(root._pdomParent);
                    recursiveSearch();
                    trail.removeAncestor();
                }
            })();
        }
    },
    /**
   * Returns a string representation of an order (using Node ids) for debugging.
   * @private
   *
   * @param {Array.<Node|null>|null} pdomOrder
   * @returns {string}
   */ debugOrder (pdomOrder) {
        if (pdomOrder === null) {
            return 'null';
        }
        return `[${pdomOrder.map((nodeOrNull)=>nodeOrNull === null ? 'null' : nodeOrNull._id).join(',')}]`;
    }
};
scenery.register('PDOMTree', PDOMTree);
export default PDOMTree;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01UcmVlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSBtYWluIGxvZ2ljIGZvciBtYWludGFpbmluZyB0aGUgUERPTSBpbnN0YW5jZSB0cmVlIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzY1KVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXJyYXlEaWZmZXJlbmNlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheURpZmZlcmVuY2UuanMnO1xuaW1wb3J0IHsgQnJvd3NlckV2ZW50cywgRm9jdXNNYW5hZ2VyLCBOb2RlLCBQYXJ0aWFsUERPTVRyYWlsLCBQRE9NSW5zdGFuY2UsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IFBET01UcmVlID0ge1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjaGlsZCBub2RlIGlzIGFkZGVkIHRvIGEgcGFyZW50IG5vZGUgKGFuZCB0aGUgY2hpbGQgaXMgbGlrZWx5IHRvIGhhdmUgcGRvbSBjb250ZW50KS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudFxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXG4gICAqL1xuICBhZGRDaGlsZCggcGFyZW50LCBjaGlsZCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGFkZENoaWxkIHBhcmVudDpuIyR7cGFyZW50Ll9pZH0sIGNoaWxkOm4jJHtjaGlsZC5faWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudCBpbnN0YW5jZW9mIE5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGlsZCBpbnN0YW5jZW9mIE5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhY2hpbGQuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApO1xuXG4gICAgY29uc3QgZm9jdXNlZE5vZGUgPSBQRE9NVHJlZS5iZWZvcmVPcCgpO1xuXG4gICAgaWYgKCAhY2hpbGQuX3Bkb21QYXJlbnQgKSB7XG4gICAgICBQRE9NVHJlZS5hZGRUcmVlKCBwYXJlbnQsIGNoaWxkICk7XG4gICAgfVxuXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCggZm9jdXNlZE5vZGUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGNoaWxkIG5vZGUgaXMgcmVtb3ZlZCBmcm9tIGEgcGFyZW50IG5vZGUgKGFuZCB0aGUgY2hpbGQgaXMgbGlrZWx5IHRvIGhhdmUgcGRvbSBjb250ZW50KS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudFxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXG4gICAqL1xuICByZW1vdmVDaGlsZCggcGFyZW50LCBjaGlsZCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHJlbW92ZUNoaWxkIHBhcmVudDpuIyR7cGFyZW50Ll9pZH0sIGNoaWxkOm4jJHtjaGlsZC5faWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudCBpbnN0YW5jZW9mIE5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGlsZCBpbnN0YW5jZW9mIE5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhY2hpbGQuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApO1xuXG4gICAgY29uc3QgZm9jdXNlZE5vZGUgPSBQRE9NVHJlZS5iZWZvcmVPcCgpO1xuXG4gICAgaWYgKCAhY2hpbGQuX3Bkb21QYXJlbnQgKSB7XG4gICAgICBQRE9NVHJlZS5yZW1vdmVUcmVlKCBwYXJlbnQsIGNoaWxkICk7XG4gICAgfVxuXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCggZm9jdXNlZE5vZGUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIG5vZGUncyBjaGlsZHJlbiBhcmUgcmVvcmRlcmVkIChubyBhZGRpdGlvbnMvcmVtb3ZhbHMpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKi9cbiAgY2hpbGRyZW5PcmRlckNoYW5nZSggbm9kZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGNoaWxkcmVuT3JkZXJDaGFuZ2Ugbm9kZTpuIyR7bm9kZS5faWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgaW5zdGFuY2VvZiBOb2RlICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW5vZGUuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApO1xuXG4gICAgY29uc3QgZm9jdXNlZE5vZGUgPSBQRE9NVHJlZS5iZWZvcmVPcCgpO1xuXG4gICAgUERPTVRyZWUucmVvcmRlciggbm9kZSApO1xuXG4gICAgUERPTVRyZWUuYWZ0ZXJPcCggZm9jdXNlZE5vZGUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIG5vZGUgaGFzIGEgcGRvbU9yZGVyIGNoYW5nZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZXxudWxsPnxudWxsfSBvbGRPcmRlclxuICAgKiBAcGFyYW0ge0FycmF5LjxOb2RlfG51bGw+fG51bGx9IG5ld09yZGVyXG4gICAqL1xuICBwZG9tT3JkZXJDaGFuZ2UoIG5vZGUsIG9sZE9yZGVyLCBuZXdPcmRlciApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHBkb21PcmRlckNoYW5nZSBuIyR7bm9kZS5faWR9OiAke1BET01UcmVlLmRlYnVnT3JkZXIoIG9sZE9yZGVyICl9LCR7UERPTVRyZWUuZGVidWdPcmRlciggbmV3T3JkZXIgKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcblxuICAgIGNvbnN0IGZvY3VzZWROb2RlID0gUERPTVRyZWUuYmVmb3JlT3AoKTtcblxuICAgIGNvbnN0IHJlbW92ZWRJdGVtcyA9IFtdOyAvLyB7QXJyYXkuPE5vZGV8bnVsbD59IC0gTWF5IGNvbnRhaW4gdGhlIHBsYWNlaG9sZGVyIG51bGxcbiAgICBjb25zdCBhZGRlZEl0ZW1zID0gW107IC8vIHtBcnJheS48Tm9kZXxudWxsPn0gLSBNYXkgY29udGFpbiB0aGUgcGxhY2Vob2xkZXIgbnVsbFxuXG4gICAgYXJyYXlEaWZmZXJlbmNlKCBvbGRPcmRlciB8fCBbXSwgbmV3T3JkZXIgfHwgW10sIHJlbW92ZWRJdGVtcywgYWRkZWRJdGVtcyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGByZW1vdmVkOiAke1BET01UcmVlLmRlYnVnT3JkZXIoIHJlbW92ZWRJdGVtcyApfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGFkZGVkOiAke1BET01UcmVlLmRlYnVnT3JkZXIoIGFkZGVkSXRlbXMgKX1gICk7XG5cbiAgICBsZXQgaTtcbiAgICBsZXQgajtcblxuICAgIC8vIENoZWNrIHNvbWUgaW5pdGlhbCBjb25kaXRpb25zXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IHJlbW92ZWRJdGVtczsgaSsrICkge1xuICAgICAgICBhc3NlcnQoIHJlbW92ZWRJdGVtc1sgaSBdID09PSBudWxsIHx8IHJlbW92ZWRJdGVtc1sgaSBdLl9wZG9tUGFyZW50ID09PSBub2RlLFxuICAgICAgICAgICdOb2RlIHNob3VsZCBoYXZlIGhhZCBhIHBkb21PcmRlcicgKTtcbiAgICAgIH1cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgYWRkZWRJdGVtczsgaSsrICkge1xuICAgICAgICBhc3NlcnQoIGFkZGVkSXRlbXNbIGkgXSA9PT0gbnVsbCB8fCBhZGRlZEl0ZW1zWyBpIF0uX3Bkb21QYXJlbnQgPT09IG51bGwsXG4gICAgICAgICAgJ05vZGUgaXMgYWxyZWFkeSBzcGVjaWZpZWQgaW4gYSBwZG9tT3JkZXInICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTk9URTogUGVyZm9ybWFuY2UgY291bGQgYmUgaW1wcm92ZWQgaW4gc29tZSBjYXNlcyBpZiB3ZSBjYW4gYXZvaWQgcmVidWlsZGluZyBhIHBkb20gdHJlZSBmb3IgRElSRUNUIGNoaWxkcmVuXG4gICAgLy8gd2hlbiBjaGFuZ2luZyB3aGV0aGVyIHRoZXkgYXJlIHByZXNlbnQgaW4gdGhlIHBkb21PcmRlci4gQmFzaWNhbGx5LCBpZiBzb21ldGhpbmcgaXMgYSBjaGlsZCBhbmQgTk9UXG4gICAgLy8gaW4gYSBwZG9tT3JkZXIsIGNoYW5naW5nIGl0cyBwYXJlbnQncyBvcmRlciB0byBpbmNsdWRlIGl0IChvciB2aWNlIHZlcnNhKSB0cmlnZ2VycyBhIHJlYnVpbGQgd2hlbiBpdFxuICAgIC8vIHdvdWxkIG5vdCBzdHJpY3RseSBiZSBuZWNlc3NhcnkuXG5cbiAgICBjb25zdCBwZG9tVHJhaWxzID0gUERPTVRyZWUuZmluZFBET01UcmFpbHMoIG5vZGUgKTtcblxuICAgIC8vIFJlbW92ZSBzdWJ0cmVlcyBmcm9tIHVzICh0aGF0IHdlcmUgcmVtb3ZlZClcbiAgICBmb3IgKCBpID0gMDsgaSA8IHJlbW92ZWRJdGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHJlbW92ZWRJdGVtVG9SZW1vdmUgPSByZW1vdmVkSXRlbXNbIGkgXTtcbiAgICAgIGlmICggcmVtb3ZlZEl0ZW1Ub1JlbW92ZSApIHtcbiAgICAgICAgUERPTVRyZWUucmVtb3ZlVHJlZSggbm9kZSwgcmVtb3ZlZEl0ZW1Ub1JlbW92ZSwgcGRvbVRyYWlscyApO1xuICAgICAgICByZW1vdmVkSXRlbVRvUmVtb3ZlLl9wZG9tUGFyZW50ID0gbnVsbDtcbiAgICAgICAgcmVtb3ZlZEl0ZW1Ub1JlbW92ZS5wZG9tUGFyZW50Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBzdWJ0cmVlcyBmcm9tIHRoZWlyIHBhcmVudHMgKHRoYXQgd2lsbCBiZSBhZGRlZCBoZXJlIGluc3RlYWQpXG4gICAgZm9yICggaSA9IDA7IGkgPCBhZGRlZEl0ZW1zLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgYWRkZWRJdGVtVG9SZW1vdmUgPSBhZGRlZEl0ZW1zWyBpIF07XG4gICAgICBpZiAoIGFkZGVkSXRlbVRvUmVtb3ZlICkge1xuICAgICAgICBjb25zdCByZW1vdmVkUGFyZW50cyA9IGFkZGVkSXRlbVRvUmVtb3ZlLl9wYXJlbnRzO1xuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IHJlbW92ZWRQYXJlbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgIFBET01UcmVlLnJlbW92ZVRyZWUoIHJlbW92ZWRQYXJlbnRzWyBqIF0sIGFkZGVkSXRlbVRvUmVtb3ZlICk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkZWRJdGVtVG9SZW1vdmUuX3Bkb21QYXJlbnQgPSBub2RlO1xuICAgICAgICBhZGRlZEl0ZW1Ub1JlbW92ZS5wZG9tUGFyZW50Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBzdWJ0cmVlcyB0byB0aGVpciBwYXJlbnRzICh0aGF0IHdlcmUgcmVtb3ZlZCBmcm9tIG91ciBvcmRlcilcbiAgICBmb3IgKCBpID0gMDsgaSA8IHJlbW92ZWRJdGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHJlbW92ZWRJdGVtVG9BZGQgPSByZW1vdmVkSXRlbXNbIGkgXTtcbiAgICAgIGlmICggcmVtb3ZlZEl0ZW1Ub0FkZCApIHtcbiAgICAgICAgY29uc3QgYWRkZWRQYXJlbnRzID0gcmVtb3ZlZEl0ZW1Ub0FkZC5fcGFyZW50cztcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBhZGRlZFBhcmVudHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgUERPTVRyZWUuYWRkVHJlZSggYWRkZWRQYXJlbnRzWyBqIF0sIHJlbW92ZWRJdGVtVG9BZGQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBzdWJ0cmVlcyB0byB1cyAodGhhdCB3ZXJlIGFkZGVkIGluIHRoaXMgb3JkZXIgY2hhbmdlKVxuICAgIGZvciAoIGkgPSAwOyBpIDwgYWRkZWRJdGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGFkZGVkSXRlbVRvQWRkID0gYWRkZWRJdGVtc1sgaSBdO1xuICAgICAgYWRkZWRJdGVtVG9BZGQgJiYgUERPTVRyZWUuYWRkVHJlZSggbm9kZSwgYWRkZWRJdGVtVG9BZGQsIHBkb21UcmFpbHMgKTtcbiAgICB9XG5cbiAgICBQRE9NVHJlZS5yZW9yZGVyKCBub2RlLCBwZG9tVHJhaWxzICk7XG5cbiAgICBQRE9NVHJlZS5hZnRlck9wKCBmb2N1c2VkTm9kZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgbm9kZSBoYXMgYSBwZG9tQ29udGVudCBjaGFuZ2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICBwZG9tQ29udGVudENoYW5nZSggbm9kZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHBkb21Db250ZW50Q2hhbmdlIG4jJHtub2RlLl9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcblxuICAgIGNvbnN0IGZvY3VzZWROb2RlID0gUERPTVRyZWUuYmVmb3JlT3AoKTtcblxuICAgIGxldCBpO1xuICAgIGNvbnN0IHBhcmVudHMgPSBub2RlLl9wZG9tUGFyZW50ID8gWyBub2RlLl9wZG9tUGFyZW50IF0gOiBub2RlLl9wYXJlbnRzO1xuICAgIGNvbnN0IHBkb21UcmFpbHNMaXN0ID0gW107IC8vIHBkb21UcmFpbHNMaXN0WyBpIF0gOj0gUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudHNbIGkgXSApXG5cbiAgICAvLyBGb3Igbm93LCBqdXN0IHJlZ2VuZXJhdGUgdGhlIGZ1bGwgdHJlZS4gQ291bGQgb3B0aW1pemUgaW4gdGhlIGZ1dHVyZSwgaWYgd2UgY2FuIHN3YXAgdGhlIGNvbnRlbnQgZm9yIGFuXG4gICAgLy8gUERPTUluc3RhbmNlLlxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGFyZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudHNbIGkgXTtcblxuICAgICAgY29uc3QgcGRvbVRyYWlscyA9IFBET01UcmVlLmZpbmRQRE9NVHJhaWxzKCBwYXJlbnQgKTtcbiAgICAgIHBkb21UcmFpbHNMaXN0LnB1c2goIHBkb21UcmFpbHMgKTtcblxuICAgICAgUERPTVRyZWUucmVtb3ZlVHJlZSggcGFyZW50LCBub2RlLCBwZG9tVHJhaWxzICk7XG4gICAgfVxuXG4gICAgLy8gRG8gYWxsIHJlbW92YWxzIGJlZm9yZSBhZGRpbmcgYW55dGhpbmcgYmFjayBpbi5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhcmVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBQRE9NVHJlZS5hZGRUcmVlKCBwYXJlbnRzWyBpIF0sIG5vZGUsIHBkb21UcmFpbHNMaXN0WyBpIF0gKTtcbiAgICB9XG5cbiAgICAvLyBBbiBlZGdlIGNhc2UgaXMgd2hlcmUgd2UgY2hhbmdlIHRoZSByb290Tm9kZSBvZiB0aGUgZGlzcGxheSAoYW5kIGRvbid0IGhhdmUgYW4gZWZmZWN0aXZlIHBhcmVudClcbiAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGUuX3Jvb3RlZERpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGlzcGxheSA9IG5vZGUuX3Jvb3RlZERpc3BsYXlzWyBpIF07XG4gICAgICBpZiAoIGRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XG4gICAgICAgIFBET01UcmVlLnJlYnVpbGRJbnN0YW5jZVRyZWUoIGRpc3BsYXkuX3Jvb3RQRE9NSW5zdGFuY2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBQRE9NVHJlZS5hZnRlck9wKCBmb2N1c2VkTm9kZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgdXAgYSByb290IGluc3RhbmNlIHdpdGggYSBnaXZlbiByb290IG5vZGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtQRE9NSW5zdGFuY2V9IHJvb3RJbnN0YW5jZVxuICAgKi9cbiAgcmVidWlsZEluc3RhbmNlVHJlZSggcm9vdEluc3RhbmNlICkge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gcm9vdEluc3RhbmNlLmRpc3BsYXkucm9vdE5vZGU7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcm9vdE5vZGUgKTtcblxuICAgIHJvb3RJbnN0YW5jZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xuXG4gICAgcm9vdEluc3RhbmNlLmFkZENvbnNlY3V0aXZlSW5zdGFuY2VzKCBQRE9NVHJlZS5jcmVhdGVUcmVlKCBuZXcgVHJhaWwoIHJvb3ROb2RlICksIHJvb3RJbnN0YW5jZS5kaXNwbGF5LCByb290SW5zdGFuY2UgKSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBjb25jZXB0dWFsIGFkZGl0aW9uIG9mIGEgcGRvbSBzdWJ0cmVlLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudFxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXG4gICAqIEBwYXJhbSB7QXJyYXkuPFBhcnRpYWxQRE9NVHJhaWw+fSBbcGRvbVRyYWlsc10gLSBXaWxsIGJlIGNvbXB1dGVkIGlmIG5lZWRlZFxuICAgKi9cbiAgYWRkVHJlZSggcGFyZW50LCBjaGlsZCwgcGRvbVRyYWlscyApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYGFkZFRyZWUgcGFyZW50Om4jJHtwYXJlbnQuX2lkfSwgY2hpbGQ6biMke2NoaWxkLl9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIFBET01UcmVlLmF1ZGl0Tm9kZUZvclBET01DeWNsZXMoIHBhcmVudCApO1xuXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudCApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGRvbVRyYWlscy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgdHJhaWw6ICR7cGRvbVRyYWlsc1sgaSBdLnRyYWlsLnRvU3RyaW5nKCl9IGZ1bGw6JHtwZG9tVHJhaWxzWyBpIF0uZnVsbFRyYWlsLnRvU3RyaW5nKCl9IGZvciAke3Bkb21UcmFpbHNbIGkgXS5wZG9tSW5zdGFuY2UudG9TdHJpbmcoKX0gcm9vdDoke3Bkb21UcmFpbHNbIGkgXS5pc1Jvb3R9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICBjb25zdCBwYXJ0aWFsVHJhaWwgPSBwZG9tVHJhaWxzWyBpIF07XG4gICAgICBjb25zdCBwYXJlbnRJbnN0YW5jZSA9IHBhcnRpYWxUcmFpbC5wZG9tSW5zdGFuY2U7XG5cbiAgICAgIC8vIFRoZSBmdWxsIHRyYWlsIGRvZXNuJ3QgaGF2ZSB0aGUgY2hpbGQgaW4gaXQsIHNvIHdlIHRlbXBvcmFyaWx5IGFkZCB0aGF0IGZvciB0cmVlIGNyZWF0aW9uXG4gICAgICBwYXJ0aWFsVHJhaWwuZnVsbFRyYWlsLmFkZERlc2NlbmRhbnQoIGNoaWxkICk7XG4gICAgICBjb25zdCBjaGlsZEluc3RhbmNlcyA9IFBET01UcmVlLmNyZWF0ZVRyZWUoIHBhcnRpYWxUcmFpbC5mdWxsVHJhaWwsIHBhcmVudEluc3RhbmNlLmRpc3BsYXksIHBhcmVudEluc3RhbmNlICk7XG4gICAgICBwYXJ0aWFsVHJhaWwuZnVsbFRyYWlsLnJlbW92ZURlc2NlbmRhbnQoIGNoaWxkICk7XG5cbiAgICAgIHBhcmVudEluc3RhbmNlLmFkZENvbnNlY3V0aXZlSW5zdGFuY2VzKCBjaGlsZEluc3RhbmNlcyApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgY29uY2VwdHVhbCByZW1vdmFsIG9mIGEgcGRvbSBzdWJ0cmVlLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudFxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXG4gICAqIEBwYXJhbSB7QXJyYXkuPFBhcnRpYWxQRE9NVHJhaWw+fSBbcGRvbVRyYWlsc10gLSBXaWxsIGJlIGNvbXB1dGVkIGlmIG5lZWRlZFxuICAgKi9cbiAgcmVtb3ZlVHJlZSggcGFyZW50LCBjaGlsZCwgcGRvbVRyYWlscyApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSggYHJlbW92ZVRyZWUgcGFyZW50Om4jJHtwYXJlbnQuX2lkfSwgY2hpbGQ6biMke2NoaWxkLl9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIHBhcmVudCApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGRvbVRyYWlscy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBhcnRpYWxUcmFpbCA9IHBkb21UcmFpbHNbIGkgXTtcblxuICAgICAgLy8gVGhlIGZ1bGwgdHJhaWwgZG9lc24ndCBoYXZlIHRoZSBjaGlsZCBpbiBpdCwgc28gd2UgdGVtcG9yYXJpbHkgYWRkIHRoYXQgZm9yIHRyZWUgcmVtb3ZhbFxuICAgICAgcGFydGlhbFRyYWlsLmZ1bGxUcmFpbC5hZGREZXNjZW5kYW50KCBjaGlsZCApO1xuICAgICAgcGFydGlhbFRyYWlsLnBkb21JbnN0YW5jZS5yZW1vdmVJbnN0YW5jZXNGb3JUcmFpbCggcGFydGlhbFRyYWlsLmZ1bGxUcmFpbCApO1xuICAgICAgcGFydGlhbFRyYWlsLmZ1bGxUcmFpbC5yZW1vdmVEZXNjZW5kYW50KCBjaGlsZCApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBjb25jZXB0dWFsIHNvcnRpbmcgb2YgYSBwZG9tIHN1YnRyZWUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge0FycmF5LjxQYXJ0aWFsUERPTVRyYWlsPn0gW3Bkb21UcmFpbHNdIC0gV2lsbCBiZSBjb21wdXRlZCBpZiBuZWVkZWRcbiAgICovXG4gIHJlb3JkZXIoIG5vZGUsIHBkb21UcmFpbHMgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGByZW9yZGVyIG4jJHtub2RlLl9pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgcGRvbVRyYWlscyA9IHBkb21UcmFpbHMgfHwgUERPTVRyZWUuZmluZFBET01UcmFpbHMoIG5vZGUgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21UcmFpbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBwYXJ0aWFsVHJhaWwgPSBwZG9tVHJhaWxzWyBpIF07XG5cbiAgICAgIC8vIFRPRE86IGRvZXMgaXQgb3B0aW1pemUgdGhpbmdzIHRvIHBhc3MgdGhlIHBhcnRpYWwgdHJhaWwgaW4gKHNvIHdlIHNjYW4gbGVzcyk/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBwYXJ0aWFsVHJhaWwucGRvbUluc3RhbmNlLnNvcnRDaGlsZHJlbigpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFBET00gaW5zdGFuY2VzLCByZXR1cm5pbmcgYW4gYXJyYXkgb2YgaW5zdGFuY2VzIHRoYXQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBuZXh0IGxldmVsLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBOT1RFOiBUcmFpbHMgZm9yIHdoaWNoIGFuIGFscmVhZHktZXhpc3RpbmcgaW5zdGFuY2UgZXhpc3RzIHdpbGwgTk9UIGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBoZXJlLiBXZSBvbmx5IHdhbnQgdG9cbiAgICogZmlsbCBpbiB0aGUgXCJtaXNzaW5nXCIgc3RydWN0dXJlLiBUaGVyZSBhcmUgY2FzZXMgKGEuY2hpbGRyZW49W2IsY10sIGIuY2hpbGRyZW49W2NdKSB3aGVyZSByZW1vdmluZyBhblxuICAgKiBwZG9tT3JkZXIgY2FuIHRyaWdnZXIgYWRkVHJlZShhLGIpIEFORCBhZGRUcmVlKGIsYyksIGFuZCB3ZSBjYW4ndCBjcmVhdGUgZHVwbGljYXRlIGNvbnRlbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhaWx9IHRyYWlsXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKiBAcGFyYW0ge1BET01JbnN0YW5jZX0gcGFyZW50SW5zdGFuY2UgLSBTaW5jZSB3ZSBkb24ndCBjcmVhdGUgdGhlIHJvb3QgaGVyZSwgY2FuJ3QgYmUgbnVsbFxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFBET01JbnN0YW5jZT59XG4gICAqL1xuICBjcmVhdGVUcmVlKCB0cmFpbCwgZGlzcGxheSwgcGFyZW50SW5zdGFuY2UgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cuUERPTVRyZWUoIGBjcmVhdGVUcmVlICR7dHJhaWwudG9TdHJpbmcoKX0gcGFyZW50OiR7cGFyZW50SW5zdGFuY2UgPyBwYXJlbnRJbnN0YW5jZS50b1N0cmluZygpIDogJ251bGwnfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCBub2RlID0gdHJhaWwubGFzdE5vZGUoKTtcbiAgICBjb25zdCBlZmZlY3RpdmVDaGlsZHJlbiA9IG5vZGUuZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NVHJlZSAmJiBzY2VuZXJ5TG9nLlBET01UcmVlKCBgZWZmZWN0aXZlQ2hpbGRyZW46ICR7UERPTVRyZWUuZGVidWdPcmRlciggZWZmZWN0aXZlQ2hpbGRyZW4gKX1gICk7XG5cbiAgICAvLyBJZiB3ZSBoYXZlIHBkb20gY29udGVudCBvdXJzZWxmLCB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgaW5zdGFuY2UgKHNvIHdlIGNhbiBwcm92aWRlIGl0IHRvIGNoaWxkIGluc3RhbmNlcykuXG4gICAgbGV0IGluc3RhbmNlO1xuICAgIGxldCBleGlzdGVkID0gZmFsc2U7XG4gICAgaWYgKCBub2RlLmhhc1BET01Db250ZW50ICkge1xuICAgICAgaW5zdGFuY2UgPSBwYXJlbnRJbnN0YW5jZS5maW5kQ2hpbGRXaXRoVHJhaWwoIHRyYWlsICk7XG4gICAgICBpZiAoIGluc3RhbmNlICkge1xuICAgICAgICBleGlzdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpbnN0YW5jZSA9IFBET01JbnN0YW5jZS5wb29sLmNyZWF0ZSggcGFyZW50SW5zdGFuY2UsIGRpc3BsYXksIHRyYWlsLmNvcHkoKSApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSB3YXMgYW4gaW5zdGFuY2UsIHRoZW4gaXQgc2hvdWxkIGJlIHRoZSBwYXJlbnQgdG8gZWZmZWN0aXZlIGNoaWxkcmVuLCBvdGhlcndpc2UsIGl0IGlzbid0IHBhcnQgb2YgdGhlXG4gICAgICAvLyB0cmFpbC5cbiAgICAgIHBhcmVudEluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFsbCBvZiB0aGUgZGlyZWN0LWNoaWxkIGluc3RhbmNlcy5cbiAgICBjb25zdCBjaGlsZEluc3RhbmNlcyA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGVmZmVjdGl2ZUNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgdHJhaWwuYWRkRGVzY2VuZGFudCggZWZmZWN0aXZlQ2hpbGRyZW5bIGkgXSwgaSApO1xuICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGNoaWxkSW5zdGFuY2VzLCBQRE9NVHJlZS5jcmVhdGVUcmVlKCB0cmFpbCwgZGlzcGxheSwgcGFyZW50SW5zdGFuY2UgKSApO1xuICAgICAgdHJhaWwucmVtb3ZlRGVzY2VuZGFudCgpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGhhdmUgYW4gaW5zdGFuY2UsIGhvb2sgdGhpbmdzIHVwLCBhbmQgcmV0dXJuIGp1c3QgaXQuXG4gICAgaWYgKCBpbnN0YW5jZSApIHtcbiAgICAgIGluc3RhbmNlLmFkZENvbnNlY3V0aXZlSW5zdGFuY2VzKCBjaGlsZEluc3RhbmNlcyApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTVRyZWUgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIHJldHVybiBleGlzdGVkID8gW10gOiBbIGluc3RhbmNlIF07XG4gICAgfVxuICAgIC8vIE90aGVyd2lzZSBwYXNzIHRoaW5ncyBmb3J3YXJkIHNvIHRoZXkgY2FuIGJlIGFkZGVkIGFzIGNoaWxkcmVuIGJ5IHRoZSBwYXJlbnRJbnN0YW5jZVxuICAgIGVsc2Uge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01UcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICByZXR1cm4gY2hpbGRJbnN0YW5jZXM7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBmb3IgYSBwZG9tLXRyZWUtY2hhbmdpbmcgb3BlcmF0aW9uIChzYXZpbmcgc29tZSBzdGF0ZSkuIER1cmluZyBET00gb3BlcmF0aW9ucyB3ZSBkb24ndCB3YW50IERpc3BsYXlcbiAgICogaW5wdXQgdG8gZGlzcGF0Y2ggZXZlbnRzIGFzIGZvY3VzIGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtOb2RlfG51bGx9XG4gICAqL1xuICBiZWZvcmVPcCgpIHtcbiAgICBCcm93c2VyRXZlbnRzLmJsb2NrRm9jdXNDYWxsYmFja3MgPSB0cnVlO1xuICAgIHJldHVybiBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5hbGl6ZXMgYSBwZG9tLXRyZWUtY2hhbmdpbmcgb3BlcmF0aW9uIChyZXN0b3Jpbmcgc29tZSBzdGF0ZSkuXG4gICAqIEBwYXJhbSB7Tm9kZXxudWxsfSBmb2N1c2VkTm9kZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgYWZ0ZXJPcCggZm9jdXNlZE5vZGUgKSB7XG5cbiAgICAvLyBJZiBTY2VuZXJ5IGlzIGluIHRoZSBtaWRkbGUgb2YgZGlzcGF0Y2hpbmcgZm9jdXMgZXZlbnRzLCBpdCBpcyBidWdneSB0byBjaGFuZ2UgZm9jdXMgYWdhaW4gaW50ZXJuYWxseS5cbiAgICBpZiAoICFCcm93c2VyRXZlbnRzLmRpc3BhdGNoaW5nRm9jdXNFdmVudHMgKSB7XG4gICAgICBmb2N1c2VkTm9kZSAmJiBmb2N1c2VkTm9kZS5mb2N1c2FibGUgJiYgZm9jdXNlZE5vZGUuZm9jdXMoKTtcbiAgICB9XG4gICAgQnJvd3NlckV2ZW50cy5ibG9ja0ZvY3VzQ2FsbGJhY2tzID0gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIFwicGRvbVwiIHRyYWlscyBmcm9tIHRoaXMgbm9kZSBhbmNlc3Rvci13aXNlIHRvIG5vZGVzIHRoYXQgaGF2ZSBkaXNwbGF5IHJvb3RzLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBOT1RFOiBcInBkb21cIiB0cmFpbHMgbWF5IG5vdCBoYXZlIHN0cmljdCBwYXJlbnQtY2hpbGQgcmVsYXRpb25zaGlwcyBiZXR3ZWVuIGFkamFjZW50IG5vZGVzLCBhcyByZW1hcHBpbmcgb2ZcbiAgICogdGhlIHRyZWUgY2FuIGhhdmUgYSBcIlBET00gcGFyZW50XCIgYW5kIFwicGRvbSBjaGlsZFwiIGNhc2UgKHRoZSBjaGlsZCBpcyBpbiB0aGUgcGFyZW50J3MgcGRvbU9yZGVyKS5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm5zIHtBcnJheS48UGFydGlhbFBET01UcmFpbD59XG4gICAqL1xuICBmaW5kUERPTVRyYWlscyggbm9kZSApIHtcbiAgICBjb25zdCB0cmFpbHMgPSBbXTtcbiAgICBQRE9NVHJlZS5yZWN1cnNpdmVQRE9NVHJhaWxTZWFyY2goIHRyYWlscywgbmV3IFRyYWlsKCBub2RlICkgKTtcbiAgICByZXR1cm4gdHJhaWxzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgcGFydGlhbCBcInBkb21cIiB0cmFpbHNcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48UGFydGlhbFBET01UcmFpbD59IHRyYWlsUmVzdWx0cyAtIE11dGF0ZWQsIHRoaXMgaXMgaG93IHdlIFwicmV0dXJuXCIgb3VyIHZhbHVlLlxuICAgKiBAcGFyYW0ge1RyYWlsfSB0cmFpbCAtIFdoZXJlIHRvIHN0YXJ0IGZyb21cbiAgICovXG4gIHJlY3Vyc2l2ZVBET01UcmFpbFNlYXJjaCggdHJhaWxSZXN1bHRzLCB0cmFpbCApIHtcbiAgICBjb25zdCByb290ID0gdHJhaWwucm9vdE5vZGUoKTtcbiAgICBsZXQgaTtcblxuICAgIC8vIElmIHdlIGZpbmQgcGRvbSBjb250ZW50LCBvdXIgc2VhcmNoIGVuZHMgaGVyZS4gSUYgaXQgaXMgY29ubmVjdGVkIHRvIGFueSBhY2Nlc3NpYmxlIHBkb20gZGlzcGxheXMgc29tZWhvdywgaXRcbiAgICAvLyB3aWxsIGhhdmUgcGRvbSBpbnN0YW5jZXMuIFdlIG9ubHkgY2FyZSBhYm91dCB0aGVzZSBwZG9tIGluc3RhbmNlcywgYXMgdGhleSBhbHJlYWR5IGhhdmUgYW55IERBR1xuICAgIC8vIGRlZHVwbGljYXRpb24gYXBwbGllZC5cbiAgICBpZiAoIHJvb3QuaGFzUERPTUNvbnRlbnQgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZXMgPSByb290LnBkb21JbnN0YW5jZXM7XG5cbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgaW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0cmFpbFJlc3VsdHMucHVzaCggbmV3IFBhcnRpYWxQRE9NVHJhaWwoIGluc3RhbmNlc1sgaSBdLCB0cmFpbC5jb3B5KCksIGZhbHNlICkgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIGNoZWNrIGZvciBhY2Nlc3NpYmxlIHBkb20gZGlzcGxheXMgZm9yIHdoaWNoIG91ciBub2RlIGlzIHRoZSByb290Tm9kZS5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHJvb3RlZERpc3BsYXlzID0gcm9vdC5yb290ZWREaXNwbGF5cztcbiAgICAgIGZvciAoIGkgPSAwOyBpIDwgcm9vdGVkRGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGRpc3BsYXkgPSByb290ZWREaXNwbGF5c1sgaSBdO1xuXG4gICAgICAgIGlmICggZGlzcGxheS5fYWNjZXNzaWJsZSApIHtcbiAgICAgICAgICB0cmFpbFJlc3VsdHMucHVzaCggbmV3IFBhcnRpYWxQRE9NVHJhaWwoIGRpc3BsYXkuX3Jvb3RQRE9NSW5zdGFuY2UsIHRyYWlsLmNvcHkoKSwgdHJ1ZSApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnRzID0gcm9vdC5fcGRvbVBhcmVudCA/IFsgcm9vdC5fcGRvbVBhcmVudCBdIDogcm9vdC5fcGFyZW50cztcbiAgICBjb25zdCBwYXJlbnRDb3VudCA9IHBhcmVudHMubGVuZ3RoO1xuICAgIGZvciAoIGkgPSAwOyBpIDwgcGFyZW50Q291bnQ7IGkrKyApIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhcmVudHNbIGkgXTtcblxuICAgICAgdHJhaWwuYWRkQW5jZXN0b3IoIHBhcmVudCApO1xuICAgICAgUERPTVRyZWUucmVjdXJzaXZlUERPTVRyYWlsU2VhcmNoKCB0cmFpbFJlc3VsdHMsIHRyYWlsICk7XG4gICAgICB0cmFpbC5yZW1vdmVBbmNlc3RvcigpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBwZG9tRGlzcGxheXMgb24gdGhlIG5vZGUgKGFuZCBpdHMgc3VidHJlZSkgYXJlIGFjY3VyYXRlLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBhdWRpdFBET01EaXNwbGF5cyggbm9kZSApIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBpZiAoIG5vZGUuX3Bkb21EaXNwbGF5c0luZm8uY2FuSGF2ZVBET01EaXNwbGF5cygpICkge1xuXG4gICAgICAgIGxldCBpO1xuICAgICAgICBjb25zdCBkaXNwbGF5cyA9IFtdO1xuXG4gICAgICAgIC8vIENvbmNhdGVuYXRpb24gb2Ygb3VyIHBhcmVudHMnIHBkb21EaXNwbGF5c1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGUuX3BhcmVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoIGRpc3BsYXlzLCBub2RlLl9wYXJlbnRzWyBpIF0uX3Bkb21EaXNwbGF5c0luZm8ucGRvbURpc3BsYXlzICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbmQgY29uY2F0ZW5hdGlvbiBvZiBhbnkgcm9vdGVkIGRpc3BsYXlzICh0aGF0IHN1cHBvcnQgcGRvbSlcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBub2RlLl9yb290ZWREaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gbm9kZS5fcm9vdGVkRGlzcGxheXNbIGkgXTtcbiAgICAgICAgICBpZiAoIGRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XG4gICAgICAgICAgICBkaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWN0dWFsQXJyYXkgPSBub2RlLl9wZG9tRGlzcGxheXNJbmZvLnBkb21EaXNwbGF5cy5zbGljZSgpO1xuICAgICAgICBjb25zdCBleHBlY3RlZEFycmF5ID0gZGlzcGxheXMuc2xpY2UoKTsgLy8gc2xpY2UgaGVscHMgaW4gZGVidWdnaW5nXG4gICAgICAgIGFzc2VydFNsb3coIGFjdHVhbEFycmF5Lmxlbmd0aCA9PT0gZXhwZWN0ZWRBcnJheS5sZW5ndGggKTtcblxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGV4cGVjdGVkQXJyYXkubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgYWN0dWFsQXJyYXkubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgICBpZiAoIGV4cGVjdGVkQXJyYXlbIGkgXSA9PT0gYWN0dWFsQXJyYXlbIGogXSApIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWRBcnJheS5zcGxpY2UoIGksIDEgKTtcbiAgICAgICAgICAgICAgYWN0dWFsQXJyYXkuc3BsaWNlKCBqLCAxICk7XG4gICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0U2xvdyggYWN0dWFsQXJyYXkubGVuZ3RoID09PSAwICYmIGV4cGVjdGVkQXJyYXkubGVuZ3RoID09PSAwLCAnTWlzbWF0Y2ggd2l0aCBhY2Nlc3NpYmxlIHBkb20gZGlzcGxheXMnICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXNzZXJ0U2xvdyggbm9kZS5fcGRvbURpc3BsYXlzSW5mby5wZG9tRGlzcGxheXMubGVuZ3RoID09PSAwLCAnSW52aXNpYmxlL25vbmFjY2Vzc2libGUgdGhpbmdzIHNob3VsZCBoYXZlIG5vIGRpc3BsYXlzJyApO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGEgZ2l2ZW4gTm9kZSAod2l0aCBhc3NlcnRpb25zKSB0byBlbnN1cmUgaXQgaXMgbm90IHBhcnQgb2YgYSBjeWNsZSBpbiB0aGUgY29tYmluZWQgZ3JhcGggd2l0aCBlZGdlc1xuICAgKiBkZWZpbmVkIGJ5IFwidGhlcmUgaXMgYSBwYXJlbnQtY2hpbGQgb3IgcGRvbVBhcmVudC1wZG9tT3JkZXJcIiByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgdHdvIG5vZGVzLlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc4NyBmb3IgbW9yZSBpbmZvcm1hdGlvbiAoYW5kIGZvciBzb21lIGRldGFpbCBvbiB0aGUgY2FzZXNcbiAgICogdGhhdCB3ZSB3YW50IHRvIGNhdGNoKS5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqL1xuICBhdWRpdE5vZGVGb3JQRE9NQ3ljbGVzKCBub2RlICkge1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgY29uc3QgdHJhaWwgPSBuZXcgVHJhaWwoIG5vZGUgKTtcblxuICAgICAgKCBmdW5jdGlvbiByZWN1cnNpdmVTZWFyY2goKSB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSB0cmFpbC5yb290Tm9kZSgpO1xuXG4gICAgICAgIGFzc2VydCggdHJhaWwubGVuZ3RoIDw9IDEgfHwgcm9vdCAhPT0gbm9kZSxcbiAgICAgICAgICBgJHsnQWNjZXNzaWJsZSBQRE9NIGdyYXBoIGN5Y2xlIGRldGVjdGVkLiBUaGUgY29tYmluZWQgc2NlbmUtZ3JhcGggREFHIHdpdGggcGRvbU9yZGVyIGRlZmluaW5nIGFkZGl0aW9uYWwgJyArXG4gICAgICAgICAgICAgJ3BhcmVudC1jaGlsZCByZWxhdGlvbnNoaXBzIHNob3VsZCBzdGlsbCBiZSBhIERBRy4gQ3ljbGUgZGV0ZWN0ZWQgd2l0aCB0aGUgdHJhaWw6ICd9JHt0cmFpbC50b1N0cmluZygpXG4gICAgICAgICAgfSBwYXRoOiAke3RyYWlsLnRvUGF0aFN0cmluZygpfWAgKTtcblxuICAgICAgICBjb25zdCBwYXJlbnRDb3VudCA9IHJvb3QuX3BhcmVudHMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJlbnRDb3VudDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHJvb3QuX3BhcmVudHNbIGkgXTtcblxuICAgICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCBwYXJlbnQgKTtcbiAgICAgICAgICByZWN1cnNpdmVTZWFyY2goKTtcbiAgICAgICAgICB0cmFpbC5yZW1vdmVBbmNlc3RvcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9ubHkgdmlzaXQgdGhlIHBkb21QYXJlbnQgaWYgd2UgZGlkbid0IGFscmVhZHkgdmlzaXQgaXQgYXMgYSBwYXJlbnQuXG4gICAgICAgIGlmICggcm9vdC5fcGRvbVBhcmVudCAmJiAhcm9vdC5fcGRvbVBhcmVudC5oYXNDaGlsZCggcm9vdCApICkge1xuICAgICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCByb290Ll9wZG9tUGFyZW50ICk7XG4gICAgICAgICAgcmVjdXJzaXZlU2VhcmNoKCk7XG4gICAgICAgICAgdHJhaWwucmVtb3ZlQW5jZXN0b3IoKTtcbiAgICAgICAgfVxuICAgICAgfSApKCk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGFuIG9yZGVyICh1c2luZyBOb2RlIGlkcykgZm9yIGRlYnVnZ2luZy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48Tm9kZXxudWxsPnxudWxsfSBwZG9tT3JkZXJcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGRlYnVnT3JkZXIoIHBkb21PcmRlciApIHtcbiAgICBpZiAoIHBkb21PcmRlciA9PT0gbnVsbCApIHsgcmV0dXJuICdudWxsJzsgfVxuXG4gICAgcmV0dXJuIGBbJHtwZG9tT3JkZXIubWFwKCBub2RlT3JOdWxsID0+IG5vZGVPck51bGwgPT09IG51bGwgPyAnbnVsbCcgOiBub2RlT3JOdWxsLl9pZCApLmpvaW4oICcsJyApfV1gO1xuICB9XG59O1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUERPTVRyZWUnLCBQRE9NVHJlZSApO1xuXG5leHBvcnQgZGVmYXVsdCBQRE9NVHJlZTsiXSwibmFtZXMiOlsiYXJyYXlEaWZmZXJlbmNlIiwiQnJvd3NlckV2ZW50cyIsIkZvY3VzTWFuYWdlciIsIk5vZGUiLCJQYXJ0aWFsUERPTVRyYWlsIiwiUERPTUluc3RhbmNlIiwic2NlbmVyeSIsIlRyYWlsIiwiUERPTVRyZWUiLCJhZGRDaGlsZCIsInBhcmVudCIsImNoaWxkIiwic2NlbmVyeUxvZyIsIl9pZCIsInB1c2giLCJhc3NlcnQiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiaGFzTm9QRE9NIiwiZm9jdXNlZE5vZGUiLCJiZWZvcmVPcCIsIl9wZG9tUGFyZW50IiwiYWRkVHJlZSIsImFmdGVyT3AiLCJwb3AiLCJyZW1vdmVDaGlsZCIsInJlbW92ZVRyZWUiLCJjaGlsZHJlbk9yZGVyQ2hhbmdlIiwibm9kZSIsInJlb3JkZXIiLCJwZG9tT3JkZXJDaGFuZ2UiLCJvbGRPcmRlciIsIm5ld09yZGVyIiwiZGVidWdPcmRlciIsInJlbW92ZWRJdGVtcyIsImFkZGVkSXRlbXMiLCJpIiwiaiIsInBkb21UcmFpbHMiLCJmaW5kUERPTVRyYWlscyIsImxlbmd0aCIsInJlbW92ZWRJdGVtVG9SZW1vdmUiLCJwZG9tUGFyZW50Q2hhbmdlZEVtaXR0ZXIiLCJlbWl0IiwiYWRkZWRJdGVtVG9SZW1vdmUiLCJyZW1vdmVkUGFyZW50cyIsIl9wYXJlbnRzIiwicmVtb3ZlZEl0ZW1Ub0FkZCIsImFkZGVkUGFyZW50cyIsImFkZGVkSXRlbVRvQWRkIiwicGRvbUNvbnRlbnRDaGFuZ2UiLCJwYXJlbnRzIiwicGRvbVRyYWlsc0xpc3QiLCJfcm9vdGVkRGlzcGxheXMiLCJkaXNwbGF5IiwiX2FjY2Vzc2libGUiLCJyZWJ1aWxkSW5zdGFuY2VUcmVlIiwiX3Jvb3RQRE9NSW5zdGFuY2UiLCJyb290SW5zdGFuY2UiLCJyb290Tm9kZSIsInJlbW92ZUFsbENoaWxkcmVuIiwiYWRkQ29uc2VjdXRpdmVJbnN0YW5jZXMiLCJjcmVhdGVUcmVlIiwiYXVkaXROb2RlRm9yUERPTUN5Y2xlcyIsInRyYWlsIiwidG9TdHJpbmciLCJmdWxsVHJhaWwiLCJwZG9tSW5zdGFuY2UiLCJpc1Jvb3QiLCJwYXJ0aWFsVHJhaWwiLCJwYXJlbnRJbnN0YW5jZSIsImFkZERlc2NlbmRhbnQiLCJjaGlsZEluc3RhbmNlcyIsInJlbW92ZURlc2NlbmRhbnQiLCJyZW1vdmVJbnN0YW5jZXNGb3JUcmFpbCIsInNvcnRDaGlsZHJlbiIsImxhc3ROb2RlIiwiZWZmZWN0aXZlQ2hpbGRyZW4iLCJnZXRFZmZlY3RpdmVDaGlsZHJlbiIsImluc3RhbmNlIiwiZXhpc3RlZCIsImhhc1BET01Db250ZW50IiwiZmluZENoaWxkV2l0aFRyYWlsIiwicG9vbCIsImNyZWF0ZSIsImNvcHkiLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiYmxvY2tGb2N1c0NhbGxiYWNrcyIsInBkb21Gb2N1c2VkTm9kZSIsImRpc3BhdGNoaW5nRm9jdXNFdmVudHMiLCJmb2N1c2FibGUiLCJmb2N1cyIsInRyYWlscyIsInJlY3Vyc2l2ZVBET01UcmFpbFNlYXJjaCIsInRyYWlsUmVzdWx0cyIsInJvb3QiLCJpbnN0YW5jZXMiLCJwZG9tSW5zdGFuY2VzIiwicm9vdGVkRGlzcGxheXMiLCJwYXJlbnRDb3VudCIsImFkZEFuY2VzdG9yIiwicmVtb3ZlQW5jZXN0b3IiLCJhdWRpdFBET01EaXNwbGF5cyIsImFzc2VydFNsb3ciLCJfcGRvbURpc3BsYXlzSW5mbyIsImNhbkhhdmVQRE9NRGlzcGxheXMiLCJkaXNwbGF5cyIsInBkb21EaXNwbGF5cyIsImFjdHVhbEFycmF5Iiwic2xpY2UiLCJleHBlY3RlZEFycmF5Iiwic3BsaWNlIiwicmVjdXJzaXZlU2VhcmNoIiwidG9QYXRoU3RyaW5nIiwiaGFzQ2hpbGQiLCJwZG9tT3JkZXIiLCJtYXAiLCJub2RlT3JOdWxsIiwiam9pbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQiw4Q0FBOEM7QUFDMUUsU0FBU0MsYUFBYSxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsZ0JBQWdCLEVBQUVDLFlBQVksRUFBRUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsbUJBQW1CO0FBRXJILE1BQU1DLFdBQVc7SUFDZjs7Ozs7O0dBTUMsR0FDREMsVUFBVUMsTUFBTSxFQUFFQyxLQUFLO1FBQ3JCQyxjQUFjQSxXQUFXSixRQUFRLElBQUlJLFdBQVdKLFFBQVEsQ0FBRSxDQUFDLGtCQUFrQixFQUFFRSxPQUFPRyxHQUFHLENBQUMsVUFBVSxFQUFFRixNQUFNRSxHQUFHLEVBQUU7UUFDakhELGNBQWNBLFdBQVdKLFFBQVEsSUFBSUksV0FBV0UsSUFBSTtRQUVwREMsVUFBVUEsT0FBUUwsa0JBQWtCUDtRQUNwQ1ksVUFBVUEsT0FBUUosaUJBQWlCUjtRQUNuQ1ksVUFBVUEsT0FBUSxDQUFDSixNQUFNSyxnQkFBZ0IsQ0FBQ0Ms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