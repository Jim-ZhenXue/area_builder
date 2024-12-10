// Copyright 2015-2024, University of Colorado Boulder
/**
 * An instance that is synchronously created, for handling accessibility needs.
 *
 * Consider the following example:
 *
 * We have a node structure:
 * A
 *  B ( accessible )
 *    C (accessible )
 *      D
 *        E (accessible)
 *         G (accessible)
 *        F
 *          H (accessible)
 *
 *
 * Which has an equivalent accessible instance tree:
 * root
 *  AB
 *    ABC
 *      ABCDE
 *        ABCDEG
 *      ABCDFH
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dotRandom from '../../../../dot/js/dotRandom.js';
import cleanArray from '../../../../phet-core/js/cleanArray.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Pool from '../../../../phet-core/js/Pool.js';
import { FocusManager, Node, PDOMPeer, PDOMUtils, scenery, Trail, TransformTracker } from '../../imports.js';
// PDOMInstances support two different styles of unique IDs, each with their own tradeoffs, https://github.com/phetsims/phet-io/issues/1851
let PDOMUniqueIdStrategy = class PDOMUniqueIdStrategy extends EnumerationValue {
};
PDOMUniqueIdStrategy.INDICES = new PDOMUniqueIdStrategy();
PDOMUniqueIdStrategy.TRAIL_ID = new PDOMUniqueIdStrategy();
PDOMUniqueIdStrategy.enumeration = new Enumeration(PDOMUniqueIdStrategy);
// This constant is set up to allow us to change our unique id strategy. Both strategies have trade-offs that are
// described in https://github.com/phetsims/phet-io/issues/1847#issuecomment-1068377336. TRAIL_ID is our path forward
// currently, but will break PhET-iO playback if any Nodes are created in the recorded sim OR playback sim but not
// both. Further information in the above issue and https://github.com/phetsims/phet-io/issues/1851.
const UNIQUE_ID_STRATEGY = PDOMUniqueIdStrategy.TRAIL_ID;
let globalId = 1;
let PDOMInstance = class PDOMInstance {
    /**
   * Initializes a PDOMInstance, implements construction for pooling.
   *
   * @param parent - null if this PDOMInstance is root of PDOMInstance tree
   * @param display
   * @param trail - trail to node for this PDOMInstance
   * @returns - Returns 'this' reference, for chaining
   */ initializePDOMInstance(parent, display, trail) {
        assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');
        // unique ID
        this.id = this.id || globalId++;
        this.parent = parent;
        // {Display}
        this.display = display;
        // {Trail}
        this.trail = trail;
        // {boolean}
        this.isRootInstance = parent === null;
        // {Node|null}
        this.node = this.isRootInstance ? null : trail.lastNode();
        // {Array.<PDOMInstance>}
        this.children = cleanArray(this.children);
        // If we are the root accessible instance, we won't actually have a reference to a node.
        if (this.node) {
            this.node.addPDOMInstance(this);
        }
        // {number} - The number of nodes in our trail that are NOT in our parent's trail and do NOT have our
        // display in their pdomDisplays. For non-root instances, this is initialized later in the constructor.
        this.invisibleCount = 0;
        // {Array.<Node>} - Nodes that are in our trail (but not those of our parent)
        this.relativeNodes = [];
        // {Array.<boolean>} - Whether our display is in the respective relativeNodes' pdomDisplays
        this.relativeVisibilities = [];
        // {function} - The listeners added to the respective relativeNodes
        this.relativeListeners = [];
        // (scenery-internal) {TransformTracker|null} - Used to quickly compute the global matrix of this
        // instance's transform source Node and observe when the transform changes. Used by PDOMPeer to update
        // positioning of sibling elements. By default, watches this PDOMInstance's visual trail.
        this.transformTracker = null;
        this.updateTransformTracker(this.node ? this.node.pdomTransformSourceNode : null);
        // {boolean} - Whether we are currently in a "disposed" (in the pool) state, or are available to be
        // re-initialized
        this.isDisposed = false;
        if (this.isRootInstance) {
            const accessibilityContainer = document.createElement('div');
            // @ts-expect-error - Poolable is a mixin and TypeScript doesn't have good mixin support
            this.peer = PDOMPeer.createFromPool(this, {
                primarySibling: accessibilityContainer
            });
        } else {
            // @ts-expect-error - Poolable a mixin and TypeScript doesn't have good mixin support
            this.peer = PDOMPeer.createFromPool(this);
            // The peer is not fully constructed until this update function is called, see https://github.com/phetsims/scenery/issues/832
            // Trail Ids will never change, so update them eagerly, a single time during construction.
            this.peer.update(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
            assert && assert(this.peer.primarySibling, 'accessible peer must have a primarySibling upon completion of construction');
            // Scan over all of the nodes in our trail (that are NOT in our parent's trail) to check for pdomDisplays
            // so we can initialize our invisibleCount and add listeners.
            const parentTrail = this.parent.trail;
            for(let i = parentTrail.length; i < trail.length; i++){
                const relativeNode = trail.nodes[i];
                this.relativeNodes.push(relativeNode);
                const pdomDisplays = relativeNode._pdomDisplaysInfo.pdomDisplays;
                const isVisible = _.includes(pdomDisplays, display);
                this.relativeVisibilities.push(isVisible);
                if (!isVisible) {
                    this.invisibleCount++;
                }
                const listener = this.checkAccessibleDisplayVisibility.bind(this, i - parentTrail.length);
                relativeNode.pdomDisplaysEmitter.addListener(listener);
                this.relativeListeners.push(listener);
            }
            this.updateVisibility();
        }
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Initialized ${this.toString()}`);
        return this;
    }
    /**
   * Adds a series of (sorted) accessible instances as children.
   */ addConsecutiveInstances(pdomInstances) {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`addConsecutiveInstances on ${this.toString()} with: ${pdomInstances.map((inst)=>inst.toString()).join(',')}`);
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
        const hadChildren = this.children.length > 0;
        Array.prototype.push.apply(this.children, pdomInstances);
        for(let i = 0; i < pdomInstances.length; i++){
            // Append the container parent to the end (so that, when provided in order, we don't have to resort below
            // when initializing).
            assert && assert(!!this.peer.primarySibling, 'Primary sibling must be defined to insert elements.');
            // @ts-expect-error - when PDOMPeer is converted to TS this ts-expect-error can probably be removed
            PDOMUtils.insertElements(this.peer.primarySibling, pdomInstances[i].peer.topLevelElements);
        }
        if (hadChildren) {
            this.sortChildren();
        }
        if (assert && this.node) {
            assert && assert(this.node instanceof Node);
            // We do not support rendering children into a Node that has innerContent.
            // If you hit this when mutating both children and innerContent at the same time, it is an issue with scenery.
            // Remove one in a single step and them add then other in the next step.
            this.children.length > 0 && assert(!this.node.innerContent, `${this.children.length} child PDOMInstances present but this node has innerContent: ${this.node.innerContent}`);
        }
        if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
            // This kills performance if there are enough PDOMInstances
            this.updateDescendantPeerIds(pdomInstances);
        }
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
    }
    /**
   * Removes any child instances that are based on the provided trail.
   */ removeInstancesForTrail(trail) {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeInstancesForTrail on ${this.toString()} with trail ${trail.toString()}`);
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
        for(let i = 0; i < this.children.length; i++){
            const childInstance = this.children[i];
            const childTrail = childInstance.trail;
            // Not worth it to inspect before our trail ends, since it should be (!) guaranteed to be equal
            let differs = childTrail.length < trail.length;
            if (!differs) {
                for(let j = this.trail.length; j < trail.length; j++){
                    if (trail.nodes[j] !== childTrail.nodes[j]) {
                        differs = true;
                        break;
                    }
                }
            }
            if (!differs) {
                this.children.splice(i, 1);
                childInstance.dispose();
                i -= 1;
            }
        }
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
    }
    /**
   * Removes all of the children.
   */ removeAllChildren() {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeAllChildren on ${this.toString()}`);
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
        while(this.children.length){
            this.children.pop().dispose();
        }
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
    }
    /**
   * Returns a PDOMInstance child (if one exists with the given Trail), or null otherwise.
   */ findChildWithTrail(trail) {
        for(let i = 0; i < this.children.length; i++){
            const child = this.children[i];
            if (child.trail.equals(trail)) {
                return child;
            }
        }
        return null;
    }
    /**
   * Remove a subtree of PDOMInstances from this PDOMInstance
   *
   * @param trail - children of this PDOMInstance will be removed if the child trails are extensions
   *                        of the trail.
   * (scenery-internal)
   */ removeSubtree(trail) {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`removeSubtree on ${this.toString()} with trail ${trail.toString()}`);
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
        for(let i = this.children.length - 1; i >= 0; i--){
            const childInstance = this.children[i];
            if (childInstance.trail.isExtensionOf(trail, true)) {
                sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Remove parent: ${this.toString()}, child: ${childInstance.toString()}`);
                this.children.splice(i, 1); // remove it from the children array
                // Dispose the entire subtree of PDOMInstances
                childInstance.dispose();
            }
        }
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
    }
    /**
   * Checks to see whether our visibility needs an update based on a pdomDisplays change.
   *
   * @param index - Index into the relativeNodes array (which node had the notification)
   */ checkAccessibleDisplayVisibility(index) {
        const isNodeVisible = _.includes(this.relativeNodes[index]._pdomDisplaysInfo.pdomDisplays, this.display);
        const wasNodeVisible = this.relativeVisibilities[index];
        if (isNodeVisible !== wasNodeVisible) {
            this.relativeVisibilities[index] = isNodeVisible;
            const wasVisible = this.invisibleCount === 0;
            this.invisibleCount += isNodeVisible ? -1 : 1;
            assert && assert(this.invisibleCount >= 0 && this.invisibleCount <= this.relativeNodes.length);
            const isVisible = this.invisibleCount === 0;
            if (isVisible !== wasVisible) {
                this.updateVisibility();
            }
        }
    }
    /**
   * Update visibility of this peer's accessible DOM content. The hidden attribute will hide all of the descendant
   * DOM content, so it is not necessary to update the subtree of PDOMInstances since the browser
   * will do this for us.
   */ updateVisibility() {
        assert && assert(!!this.peer, 'Peer needs to be available on update visibility.');
        this.peer.setVisible(this.invisibleCount <= 0);
        // if we hid a parent element, blur focus if active element was an ancestor
        if (!this.peer.isVisible() && FocusManager.pdomFocusedNode) {
            assert && assert(FocusManager.pdomFocusedNode.pdomInstances.length === 1, 'focusable Nodes do not support DAG, and should be connected with an instance if focused.');
            // NOTE: We don't seem to be able to import normally here
            if (FocusManager.pdomFocusedNode.pdomInstances[0].trail.containsNode(this.node)) {
                FocusManager.pdomFocus = null;
            }
        }
    }
    /**
   * Returns whether the parallel DOM for this instance and its ancestors are not hidden.
   */ isGloballyVisible() {
        assert && assert(!!this.peer, 'PDOMPeer needs to be available, has this PDOMInstance been disposed?');
        // If this peer is hidden, then return because that attribute will bubble down to children,
        // otherwise recurse to parent.
        if (!this.peer.isVisible()) {
            return false;
        } else if (this.parent) {
            return this.parent.isGloballyVisible();
        } else {
            return true;
        }
    }
    /**
   * Returns what our list of children (after sorting) should be.
   *
   * @param trail - A partial trail, where the root of the trail is either this.node or the display's root
   *                        node (if we are the root PDOMInstance)
   */ getChildOrdering(trail) {
        const node = trail.lastNode();
        const effectiveChildren = node.getEffectiveChildren();
        let i;
        const instances = [];
        // base case, node has accessible content, but don't match the "root" node of this accessible instance
        if (node.hasPDOMContent && node !== this.node) {
            const potentialInstances = node.pdomInstances;
            instanceLoop: for(i = 0; i < potentialInstances.length; i++){
                const potentialInstance = potentialInstances[i];
                if (potentialInstance.parent !== this) {
                    continue;
                }
                for(let j = 0; j < trail.length; j++){
                    if (trail.nodes[j] !== potentialInstance.trail.nodes[j + potentialInstance.trail.length - trail.length]) {
                        continue instanceLoop; // eslint-disable-line no-labels
                    }
                }
                instances.push(potentialInstance); // length will always be 1
            }
            assert && assert(instances.length <= 1, 'If we select more than one this way, we have problems');
        } else {
            for(i = 0; i < effectiveChildren.length; i++){
                trail.addDescendant(effectiveChildren[i], i);
                Array.prototype.push.apply(instances, this.getChildOrdering(trail));
                trail.removeDescendant();
            }
        }
        return instances;
    }
    /**
   * Sort our child accessible instances in the order they should appear in the parallel DOM. We do this by
   * creating a comparison function between two accessible instances. The function walks along the trails
   * of the children, looking for specified accessible orders that would determine the ordering for the two
   * PDOMInstances.
   *
   * (scenery-internal)
   */ sortChildren() {
        var _FocusManager_pdomFocusedNode_pdomInstances_, _FocusManager_pdomFocusedNode;
        // It's simpler/faster to just grab our order directly with one recursion, rather than specifying a sorting
        // function (since a lot gets re-evaluated in that case).
        assert && assert(this.peer !== null, 'peer required for sort');
        let nodeForTrail;
        if (this.isRootInstance) {
            assert && assert(this.display !== null, 'Display should be available for the root');
            nodeForTrail = this.display.rootNode;
        } else {
            assert && assert(this.node !== null, 'Node should be defined, were we disposed?');
            nodeForTrail = this.node;
        }
        const targetChildren = this.getChildOrdering(new Trail(nodeForTrail));
        assert && assert(targetChildren.length === this.children.length, 'sorting should not change number of children');
        // {Array.<PDOMInstance>}
        this.children = targetChildren;
        // the DOMElement to add the child DOMElements to.
        const primarySibling = this.peer.primarySibling;
        // Ignore DAG for focused trail. We need to know if there is a focused child instance so that we can avoid
        // temporarily detaching the focused element from the DOM. See https://github.com/phetsims/my-solar-system/issues/142
        const focusedTrail = ((_FocusManager_pdomFocusedNode = FocusManager.pdomFocusedNode) == null ? void 0 : (_FocusManager_pdomFocusedNode_pdomInstances_ = _FocusManager_pdomFocusedNode.pdomInstances[0]) == null ? void 0 : _FocusManager_pdomFocusedNode_pdomInstances_.trail) || null;
        // "i" will keep track of the "collapsed" index when all DOMElements for all PDOMInstance children are
        // added to a single parent DOMElement (this PDOMInstance's PDOMPeer's primarySibling)
        let i = primarySibling.childNodes.length - 1;
        const focusedChildInstance = focusedTrail && _.find(this.children, (child)=>focusedTrail.containsNode(child.peer.node));
        if (focusedChildInstance) {
            // If there's a focused child instance, we need to make sure that its primarySibling is not detached from the DOM
            // (this has caused focus issues, see https://github.com/phetsims/my-solar-system/issues/142).
            // Since this doesn't happen often, we can just recompute the full order, and move every other element.
            const desiredOrder = _.flatten(this.children.map((child)=>child.peer.topLevelElements));
            const needsOrderChange = !_.every(desiredOrder, (desiredElement, index)=>primarySibling.children[index] === desiredElement);
            if (needsOrderChange) {
                const pivotElement = focusedChildInstance.peer.getTopLevelElementContainingPrimarySibling();
                const pivotIndex = desiredOrder.indexOf(pivotElement);
                assert && assert(pivotIndex >= 0);
                // Insert all elements before the pivot element
                for(let j = 0; j < pivotIndex; j++){
                    primarySibling.insertBefore(desiredOrder[j], pivotElement);
                }
                // Insert all elements after the pivot element
                for(let j = pivotIndex + 1; j < desiredOrder.length; j++){
                    primarySibling.appendChild(desiredOrder[j]);
                }
            }
        } else {
            // Iterate through all PDOMInstance children
            for(let peerIndex = this.children.length - 1; peerIndex >= 0; peerIndex--){
                const peer = this.children[peerIndex].peer;
                // Iterate through all top level elements of a PDOMInstance's peer
                for(let elementIndex = peer.topLevelElements.length - 1; elementIndex >= 0; elementIndex--){
                    const element = peer.topLevelElements[elementIndex];
                    // Reorder DOM elements in a way that doesn't do any work if they are already in a sorted order.
                    // No need to reinsert if `element` is already in the right order
                    if (primarySibling.childNodes[i] !== element) {
                        primarySibling.insertBefore(element, primarySibling.childNodes[i + 1]);
                    }
                    // Decrement so that it is easier to place elements using the browser's Node.insertBefore API
                    i--;
                }
            }
        }
        if (assert) {
            const desiredOrder = _.flatten(this.children.map((child)=>child.peer.topLevelElements));
            // Verify the order
            assert(_.every(desiredOrder, (desiredElement, index)=>primarySibling.children[index] === desiredElement));
        }
        if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
            // This kills performance if there are enough PDOMInstances
            this.updateDescendantPeerIds(this.children);
        }
    }
    /**
   * Create a new TransformTracker that will observe transforms along the trail of this PDOMInstance OR
   * the provided pdomTransformSourceNode. See ParallelDOM.setPDOMTransformSourceNode(). The The source Node
   * must not use DAG so that its trail is unique.
   */ updateTransformTracker(pdomTransformSourceNode) {
        this.transformTracker && this.transformTracker.dispose();
        let trackedTrail = null;
        if (pdomTransformSourceNode) {
            trackedTrail = pdomTransformSourceNode.getUniqueTrail();
        } else {
            trackedTrail = PDOMInstance.guessVisualTrail(this.trail, this.display.rootNode);
        }
        this.transformTracker = new TransformTracker(trackedTrail);
    }
    /**
   * Depending on what the unique ID strategy is, formulate the correct id for this PDOM instance.
   */ getPDOMInstanceUniqueId() {
        if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
            const indicesString = [];
            let pdomInstance = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
            while(pdomInstance.parent){
                const indexOf = pdomInstance.parent.children.indexOf(pdomInstance);
                if (indexOf === -1) {
                    return 'STILL_BEING_CREATED' + dotRandom.nextDouble();
                }
                indicesString.unshift(indexOf);
                pdomInstance = pdomInstance.parent;
            }
            return indicesString.join(PDOMUtils.PDOM_UNIQUE_ID_SEPARATOR);
        } else {
            assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
            return this.trail.getUniqueId();
        }
    }
    /**
   * Using indices requires updating whenever the PDOMInstance tree changes, so recursively update all descendant
   * ids from such a change. Update peer ids for provided instances and all descendants of provided instances.
   */ updateDescendantPeerIds(pdomInstances) {
        assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES, 'method should not be used with uniqueId comes from TRAIL_ID');
        const toUpdate = Array.from(pdomInstances);
        while(toUpdate.length > 0){
            const pdomInstance = toUpdate.shift();
            pdomInstance.peer.updateIndicesStringAndElementIds();
            toUpdate.push(...pdomInstance.children);
        }
    }
    /**
   * @param display
   * @param uniqueId - value returned from PDOMInstance.getPDOMInstanceUniqueId()
   * @returns null if there is no path to the unique id provided.
   */ static uniqueIdToTrail(display, uniqueId) {
        if (UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.INDICES) {
            return display.getTrailFromPDOMIndicesString(uniqueId);
        } else {
            assert && assert(UNIQUE_ID_STRATEGY === PDOMUniqueIdStrategy.TRAIL_ID);
            return Trail.fromUniqueId(display.rootNode, uniqueId);
        }
    }
    /**
   * Recursive disposal, to make eligible for garbage collection.
   *
   * (scenery-internal)
   */ dispose() {
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Disposing ${this.toString()}`);
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.push();
        assert && assert(!!this.peer, 'PDOMPeer required, were we already disposed?');
        const thisPeer = this.peer;
        // Disconnect DOM and remove listeners
        if (!this.isRootInstance) {
            // remove this peer's primary sibling DOM Element (or its container parent) from the parent peer's
            // primary sibling (or its child container)
            PDOMUtils.removeElements(this.parent.peer.primarySibling, thisPeer.topLevelElements);
            for(let i = 0; i < this.relativeNodes.length; i++){
                this.relativeNodes[i].pdomDisplaysEmitter.removeListener(this.relativeListeners[i]);
            }
        }
        while(this.children.length){
            this.children.pop().dispose();
        }
        // NOTE: We dispose OUR peer after disposing children, so our peer can be available for our children during
        // disposal.
        thisPeer.dispose();
        // dispose after the peer so the peer can remove any listeners from it
        this.transformTracker.dispose();
        this.transformTracker = null;
        // If we are the root accessible instance, we won't actually have a reference to a node.
        if (this.node) {
            this.node.removePDOMInstance(this);
        }
        this.relativeNodes = null;
        this.display = null;
        this.trail = null;
        this.node = null;
        this.peer = null;
        this.isDisposed = true;
        this.freeToPool();
        sceneryLog && sceneryLog.PDOMInstance && sceneryLog.pop();
    }
    /**
   * For debugging purposes.
   */ toString() {
        return `${this.id}#{${this.trail.toString()}}`;
    }
    /**
   * For debugging purposes, inspect the tree of PDOMInstances from the root.
   *
   * Only ever called from the _rootPDOMInstance of the display.
   *
   * (scenery-internal)
   */ auditRoot() {
        if (!assert) {
            return;
        }
        const rootNode = this.display.rootNode;
        assert(this.trail.length === 0, 'Should only call auditRoot() on the root PDOMInstance for a display');
        function audit(fakeInstance, pdomInstance) {
            assert && assert(fakeInstance.children.length === pdomInstance.children.length, 'Different number of children in accessible instance');
            assert && assert(fakeInstance.node === pdomInstance.node, 'Node mismatch for PDOMInstance');
            for(let i = 0; i < pdomInstance.children.length; i++){
                audit(fakeInstance.children[i], pdomInstance.children[i]);
            }
            const isVisible = pdomInstance.isGloballyVisible();
            let shouldBeVisible = true;
            for(let i = 0; i < pdomInstance.trail.length; i++){
                const node = pdomInstance.trail.nodes[i];
                const trails = node.getTrailsTo(rootNode).filter((trail)=>trail.isPDOMVisible());
                if (trails.length === 0) {
                    shouldBeVisible = false;
                    break;
                }
            }
            assert && assert(isVisible === shouldBeVisible, 'Instance visibility mismatch');
        }
        audit(PDOMInstance.createFakePDOMTree(rootNode), this);
    }
    /**
   * Since a "Trail" on PDOMInstance can have discontinuous jumps (due to pdomOrder), this finds the best
   * actual visual Trail to use, from the trail of a PDOMInstance to the root of a Display.
   *
   * @param trail - trail of the PDOMInstance, which can containe "gaps"
   * @param rootNode - root of a Display
   */ static guessVisualTrail(trail, rootNode) {
        trail.reindex();
        // Search for places in the trail where adjacent nodes do NOT have a parent-child relationship, i.e.
        // !nodes[ n ].hasChild( nodes[ n + 1 ] ).
        // NOTE: This index points to the parent where this is the case, because the indices in the trail are such that:
        // trail.nodes[ n ].children[ trail.indices[ n ] ] = trail.nodes[ n + 1 ]
        const lastBadIndex = trail.indices.lastIndexOf(-1);
        // If we have no bad indices, just return our trail immediately.
        if (lastBadIndex < 0) {
            return trail;
        }
        const firstGoodIndex = lastBadIndex + 1;
        const firstGoodNode = trail.nodes[firstGoodIndex];
        const baseTrails = firstGoodNode.getTrailsTo(rootNode);
        // firstGoodNode might not be attached to a Display either! Maybe client just hasn't gotten to it yet, so we
        // fail gracefully-ish?
        // assert && assert( baseTrails.length > 0, '"good node" in trail with gap not attached to root')
        if (baseTrails.length === 0) {
            return trail;
        }
        // Add the rest of the trail back in
        const baseTrail = baseTrails[0];
        for(let i = firstGoodIndex + 1; i < trail.length; i++){
            baseTrail.addDescendant(trail.nodes[i]);
        }
        assert && assert(baseTrail.isValid(), `trail not valid: ${trail.uniqueId}`);
        return baseTrail;
    }
    /**
   * Creates a fake PDOMInstance-like tree structure (with the equivalent nodes and children structure).
   * For debugging.
   *
   * @returns Type FakePDOMInstance: { node: {Node}, children: {Array.<FakePDOMInstance>} }
   */ static createFakePDOMTree(rootNode) {
        function createFakeTree(node) {
            let fakeInstances = _.flatten(node.getEffectiveChildren().map(createFakeTree));
            if (node.hasPDOMContent) {
                fakeInstances = [
                    {
                        node: node,
                        children: fakeInstances
                    }
                ];
            }
            return fakeInstances;
        }
        return {
            node: null,
            // @ts-expect-error
            children: createFakeTree(rootNode)
        };
    }
    freeToPool() {
        PDOMInstance.pool.freeToPool(this);
    }
    /**
   * Constructor for PDOMInstance, uses an initialize method for pooling.
   *
   * @param parent - parent of this instance, null if root of PDOMInstance tree
   * @param display
   * @param trail - trail to the node for this PDOMInstance
   */ constructor(parent, display, trail){
        // {Array.<Node>} - Nodes that are in our trail (but not those of our parent)
        this.relativeNodes = [];
        // {Array.<boolean>} - Whether our display is in the respective relativeNodes' pdomDisplays
        this.relativeVisibilities = [];
        // {function} - The listeners added to the respective relativeNodes
        this.relativeListeners = [];
        // (scenery-internal) {TransformTracker|null} - Used to quickly compute the global matrix of this
        // instance's transform source Node and observe when the transform changes. Used by PDOMPeer to update
        // positioning of sibling elements. By default, watches this PDOMInstance's visual trail.
        this.transformTracker = null;
        this.initializePDOMInstance(parent, display, trail);
    }
};
PDOMInstance.pool = new Pool(PDOMInstance, {
    initialize: PDOMInstance.prototype.initializePDOMInstance
});
scenery.register('PDOMInstance', PDOMInstance);
export default PDOMInstance;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01JbnN0YW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBpbnN0YW5jZSB0aGF0IGlzIHN5bmNocm9ub3VzbHkgY3JlYXRlZCwgZm9yIGhhbmRsaW5nIGFjY2Vzc2liaWxpdHkgbmVlZHMuXG4gKlxuICogQ29uc2lkZXIgdGhlIGZvbGxvd2luZyBleGFtcGxlOlxuICpcbiAqIFdlIGhhdmUgYSBub2RlIHN0cnVjdHVyZTpcbiAqIEFcbiAqICBCICggYWNjZXNzaWJsZSApXG4gKiAgICBDIChhY2Nlc3NpYmxlIClcbiAqICAgICAgRFxuICogICAgICAgIEUgKGFjY2Vzc2libGUpXG4gKiAgICAgICAgIEcgKGFjY2Vzc2libGUpXG4gKiAgICAgICAgRlxuICogICAgICAgICAgSCAoYWNjZXNzaWJsZSlcbiAqXG4gKlxuICogV2hpY2ggaGFzIGFuIGVxdWl2YWxlbnQgYWNjZXNzaWJsZSBpbnN0YW5jZSB0cmVlOlxuICogcm9vdFxuICogIEFCXG4gKiAgICBBQkNcbiAqICAgICAgQUJDREVcbiAqICAgICAgICBBQkNERUdcbiAqICAgICAgQUJDREZIXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IERpc3BsYXksIEZvY3VzTWFuYWdlciwgTm9kZSwgUERPTVBlZXIsIFBET01VdGlscywgc2NlbmVyeSwgVHJhaWwsIFRyYW5zZm9ybVRyYWNrZXIgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gUERPTUluc3RhbmNlcyBzdXBwb3J0IHR3byBkaWZmZXJlbnQgc3R5bGVzIG9mIHVuaXF1ZSBJRHMsIGVhY2ggd2l0aCB0aGVpciBvd24gdHJhZGVvZmZzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg1MVxuY2xhc3MgUERPTVVuaXF1ZUlkU3RyYXRlZ3kgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJTkRJQ0VTID0gbmV3IFBET01VbmlxdWVJZFN0cmF0ZWd5KCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFJBSUxfSUQgPSBuZXcgUERPTVVuaXF1ZUlkU3RyYXRlZ3koKTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBQRE9NVW5pcXVlSWRTdHJhdGVneSApO1xufVxuXG4vLyBBIHR5cGUgcmVwcmVzZW50aW5nIGEgZmFrZSBpbnN0YW5jZSwgZm9yIHNvbWUgYWdncmVzc2l2ZSBhdWRpdGluZyAodW5kZXIgP2Fzc2VydHNsb3cpXG50eXBlIEZha2VJbnN0YW5jZSA9IHtcbiAgbm9kZTogTm9kZSB8IG51bGw7XG4gIGNoaWxkcmVuOiBGYWtlSW5zdGFuY2VbXTtcbn07XG5cbi8vIFRoaXMgY29uc3RhbnQgaXMgc2V0IHVwIHRvIGFsbG93IHVzIHRvIGNoYW5nZSBvdXIgdW5pcXVlIGlkIHN0cmF0ZWd5LiBCb3RoIHN0cmF0ZWdpZXMgaGF2ZSB0cmFkZS1vZmZzIHRoYXQgYXJlXG4vLyBkZXNjcmliZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NDcjaXNzdWVjb21tZW50LTEwNjgzNzczMzYuIFRSQUlMX0lEIGlzIG91ciBwYXRoIGZvcndhcmRcbi8vIGN1cnJlbnRseSwgYnV0IHdpbGwgYnJlYWsgUGhFVC1pTyBwbGF5YmFjayBpZiBhbnkgTm9kZXMgYXJlIGNyZWF0ZWQgaW4gdGhlIHJlY29yZGVkIHNpbSBPUiBwbGF5YmFjayBzaW0gYnV0IG5vdFxuLy8gYm90aC4gRnVydGhlciBpbmZvcm1hdGlvbiBpbiB0aGUgYWJvdmUgaXNzdWUgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xODUxLlxuY29uc3QgVU5JUVVFX0lEX1NUUkFURUdZID0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuVFJBSUxfSUQ7XG5cbmxldCBnbG9iYWxJZCA9IDE7XG5cbmNsYXNzIFBET01JbnN0YW5jZSB7XG5cbiAgLy8gdW5pcXVlIElEXG4gIHByaXZhdGUgaWQhOiBudW1iZXI7XG5cbiAgcHVibGljIHBhcmVudCE6IFBET01JbnN0YW5jZSB8IG51bGw7XG5cbiAgLy8ge0Rpc3BsYXl9XG4gIHByaXZhdGUgZGlzcGxheSE6IERpc3BsYXkgfCBudWxsO1xuXG4gIHB1YmxpYyB0cmFpbCE6IFRyYWlsIHwgbnVsbDtcbiAgcHVibGljIGlzUm9vdEluc3RhbmNlITogYm9vbGVhbjtcbiAgcHVibGljIG5vZGUhOiBOb2RlIHwgbnVsbDtcbiAgcHVibGljIGNoaWxkcmVuITogUERPTUluc3RhbmNlW107XG4gIHB1YmxpYyBwZWVyITogUERPTVBlZXIgfCBudWxsO1xuXG4gIC8vIHtudW1iZXJ9IC0gVGhlIG51bWJlciBvZiBub2RlcyBpbiBvdXIgdHJhaWwgdGhhdCBhcmUgTk9UIGluIG91ciBwYXJlbnQncyB0cmFpbCBhbmQgZG8gTk9UIGhhdmUgb3VyXG4gIC8vIGRpc3BsYXkgaW4gdGhlaXIgcGRvbURpc3BsYXlzLiBGb3Igbm9uLXJvb3QgaW5zdGFuY2VzLCB0aGlzIGlzIGluaXRpYWxpemVkIGxhdGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgcHJpdmF0ZSBpbnZpc2libGVDb3VudCE6IG51bWJlcjtcblxuICAvLyB7QXJyYXkuPE5vZGU+fSAtIE5vZGVzIHRoYXQgYXJlIGluIG91ciB0cmFpbCAoYnV0IG5vdCB0aG9zZSBvZiBvdXIgcGFyZW50KVxuICBwcml2YXRlIHJlbGF0aXZlTm9kZXM6IE5vZGVbXSB8IG51bGwgPSBbXTtcblxuICAvLyB7QXJyYXkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgb3VyIGRpc3BsYXkgaXMgaW4gdGhlIHJlc3BlY3RpdmUgcmVsYXRpdmVOb2RlcycgcGRvbURpc3BsYXlzXG4gIHByaXZhdGUgcmVsYXRpdmVWaXNpYmlsaXRpZXM6IGJvb2xlYW5bXSA9IFtdO1xuXG4gIC8vIHtmdW5jdGlvbn0gLSBUaGUgbGlzdGVuZXJzIGFkZGVkIHRvIHRoZSByZXNwZWN0aXZlIHJlbGF0aXZlTm9kZXNcbiAgcHJpdmF0ZSByZWxhdGl2ZUxpc3RlbmVyczogKCAoKSA9PiB2b2lkIClbXSA9IFtdO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSB7VHJhbnNmb3JtVHJhY2tlcnxudWxsfSAtIFVzZWQgdG8gcXVpY2tseSBjb21wdXRlIHRoZSBnbG9iYWwgbWF0cml4IG9mIHRoaXNcbiAgLy8gaW5zdGFuY2UncyB0cmFuc2Zvcm0gc291cmNlIE5vZGUgYW5kIG9ic2VydmUgd2hlbiB0aGUgdHJhbnNmb3JtIGNoYW5nZXMuIFVzZWQgYnkgUERPTVBlZXIgdG8gdXBkYXRlXG4gIC8vIHBvc2l0aW9uaW5nIG9mIHNpYmxpbmcgZWxlbWVudHMuIEJ5IGRlZmF1bHQsIHdhdGNoZXMgdGhpcyBQRE9NSW5zdGFuY2UncyB2aXN1YWwgdHJhaWwuXG4gIHB1YmxpYyB0cmFuc2Zvcm1UcmFja2VyOiBUcmFuc2Zvcm1UcmFja2VyIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8ge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGluIGEgXCJkaXNwb3NlZFwiIChpbiB0aGUgcG9vbCkgc3RhdGUsIG9yIGFyZSBhdmFpbGFibGUgdG8gYmVcbiAgLy8gcmUtaW5pdGlhbGl6ZWRcbiAgcHJpdmF0ZSBpc0Rpc3Bvc2VkITogYm9vbGVhbjtcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgZm9yIFBET01JbnN0YW5jZSwgdXNlcyBhbiBpbml0aWFsaXplIG1ldGhvZCBmb3IgcG9vbGluZy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmVudCAtIHBhcmVudCBvZiB0aGlzIGluc3RhbmNlLCBudWxsIGlmIHJvb3Qgb2YgUERPTUluc3RhbmNlIHRyZWVcbiAgICogQHBhcmFtIGRpc3BsYXlcbiAgICogQHBhcmFtIHRyYWlsIC0gdHJhaWwgdG8gdGhlIG5vZGUgZm9yIHRoaXMgUERPTUluc3RhbmNlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHBhcmVudDogUERPTUluc3RhbmNlIHwgbnVsbCwgZGlzcGxheTogRGlzcGxheSwgdHJhaWw6IFRyYWlsICkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZVBET01JbnN0YW5jZSggcGFyZW50LCBkaXNwbGF5LCB0cmFpbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGEgUERPTUluc3RhbmNlLCBpbXBsZW1lbnRzIGNvbnN0cnVjdGlvbiBmb3IgcG9vbGluZy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmVudCAtIG51bGwgaWYgdGhpcyBQRE9NSW5zdGFuY2UgaXMgcm9vdCBvZiBQRE9NSW5zdGFuY2UgdHJlZVxuICAgKiBAcGFyYW0gZGlzcGxheVxuICAgKiBAcGFyYW0gdHJhaWwgLSB0cmFpbCB0byBub2RlIGZvciB0aGlzIFBET01JbnN0YW5jZVxuICAgKiBAcmV0dXJucyAtIFJldHVybnMgJ3RoaXMnIHJlZmVyZW5jZSwgZm9yIGNoYWluaW5nXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZVBET01JbnN0YW5jZSggcGFyZW50OiBQRE9NSW5zdGFuY2UgfCBudWxsLCBkaXNwbGF5OiBEaXNwbGF5LCB0cmFpbDogVHJhaWwgKTogUERPTUluc3RhbmNlIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pZCB8fCB0aGlzLmlzRGlzcG9zZWQsICdJZiB3ZSBwcmV2aW91c2x5IGV4aXN0ZWQsIHdlIG5lZWQgdG8gaGF2ZSBiZWVuIGRpc3Bvc2VkJyApO1xuXG4gICAgLy8gdW5pcXVlIElEXG4gICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgZ2xvYmFsSWQrKztcblxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgLy8ge0Rpc3BsYXl9XG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcblxuICAgIC8vIHtUcmFpbH1cbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XG5cbiAgICAvLyB7Ym9vbGVhbn1cbiAgICB0aGlzLmlzUm9vdEluc3RhbmNlID0gcGFyZW50ID09PSBudWxsO1xuXG4gICAgLy8ge05vZGV8bnVsbH1cbiAgICB0aGlzLm5vZGUgPSB0aGlzLmlzUm9vdEluc3RhbmNlID8gbnVsbCA6IHRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICAvLyB7QXJyYXkuPFBET01JbnN0YW5jZT59XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNsZWFuQXJyYXkoIHRoaXMuY2hpbGRyZW4gKTtcblxuICAgIC8vIElmIHdlIGFyZSB0aGUgcm9vdCBhY2Nlc3NpYmxlIGluc3RhbmNlLCB3ZSB3b24ndCBhY3R1YWxseSBoYXZlIGEgcmVmZXJlbmNlIHRvIGEgbm9kZS5cbiAgICBpZiAoIHRoaXMubm9kZSApIHtcbiAgICAgIHRoaXMubm9kZS5hZGRQRE9NSW5zdGFuY2UoIHRoaXMgKTtcbiAgICB9XG5cbiAgICAvLyB7bnVtYmVyfSAtIFRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gb3VyIHRyYWlsIHRoYXQgYXJlIE5PVCBpbiBvdXIgcGFyZW50J3MgdHJhaWwgYW5kIGRvIE5PVCBoYXZlIG91clxuICAgIC8vIGRpc3BsYXkgaW4gdGhlaXIgcGRvbURpc3BsYXlzLiBGb3Igbm9uLXJvb3QgaW5zdGFuY2VzLCB0aGlzIGlzIGluaXRpYWxpemVkIGxhdGVyIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICB0aGlzLmludmlzaWJsZUNvdW50ID0gMDtcblxuICAgIC8vIHtBcnJheS48Tm9kZT59IC0gTm9kZXMgdGhhdCBhcmUgaW4gb3VyIHRyYWlsIChidXQgbm90IHRob3NlIG9mIG91ciBwYXJlbnQpXG4gICAgdGhpcy5yZWxhdGl2ZU5vZGVzID0gW107XG5cbiAgICAvLyB7QXJyYXkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgb3VyIGRpc3BsYXkgaXMgaW4gdGhlIHJlc3BlY3RpdmUgcmVsYXRpdmVOb2RlcycgcGRvbURpc3BsYXlzXG4gICAgdGhpcy5yZWxhdGl2ZVZpc2liaWxpdGllcyA9IFtdO1xuXG4gICAgLy8ge2Z1bmN0aW9ufSAtIFRoZSBsaXN0ZW5lcnMgYWRkZWQgdG8gdGhlIHJlc3BlY3RpdmUgcmVsYXRpdmVOb2Rlc1xuICAgIHRoaXMucmVsYXRpdmVMaXN0ZW5lcnMgPSBbXTtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSB7VHJhbnNmb3JtVHJhY2tlcnxudWxsfSAtIFVzZWQgdG8gcXVpY2tseSBjb21wdXRlIHRoZSBnbG9iYWwgbWF0cml4IG9mIHRoaXNcbiAgICAvLyBpbnN0YW5jZSdzIHRyYW5zZm9ybSBzb3VyY2UgTm9kZSBhbmQgb2JzZXJ2ZSB3aGVuIHRoZSB0cmFuc2Zvcm0gY2hhbmdlcy4gVXNlZCBieSBQRE9NUGVlciB0byB1cGRhdGVcbiAgICAvLyBwb3NpdGlvbmluZyBvZiBzaWJsaW5nIGVsZW1lbnRzLiBCeSBkZWZhdWx0LCB3YXRjaGVzIHRoaXMgUERPTUluc3RhbmNlJ3MgdmlzdWFsIHRyYWlsLlxuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm1UcmFja2VyKCB0aGlzLm5vZGUgPyB0aGlzLm5vZGUucGRvbVRyYW5zZm9ybVNvdXJjZU5vZGUgOiBudWxsICk7XG5cbiAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHdlIGFyZSBjdXJyZW50bHkgaW4gYSBcImRpc3Bvc2VkXCIgKGluIHRoZSBwb29sKSBzdGF0ZSwgb3IgYXJlIGF2YWlsYWJsZSB0byBiZVxuICAgIC8vIHJlLWluaXRpYWxpemVkXG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gZmFsc2U7XG5cbiAgICBpZiAoIHRoaXMuaXNSb290SW5zdGFuY2UgKSB7XG4gICAgICBjb25zdCBhY2Nlc3NpYmlsaXR5Q29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBvb2xhYmxlIGlzIGEgbWl4aW4gYW5kIFR5cGVTY3JpcHQgZG9lc24ndCBoYXZlIGdvb2QgbWl4aW4gc3VwcG9ydFxuICAgICAgdGhpcy5wZWVyID0gUERPTVBlZXIuY3JlYXRlRnJvbVBvb2woIHRoaXMsIHtcbiAgICAgICAgcHJpbWFyeVNpYmxpbmc6IGFjY2Vzc2liaWxpdHlDb250YWluZXJcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBQb29sYWJsZSBhIG1peGluIGFuZCBUeXBlU2NyaXB0IGRvZXNuJ3QgaGF2ZSBnb29kIG1peGluIHN1cHBvcnRcbiAgICAgIHRoaXMucGVlciA9IFBET01QZWVyLmNyZWF0ZUZyb21Qb29sKCB0aGlzICk7XG5cbiAgICAgIC8vIFRoZSBwZWVyIGlzIG5vdCBmdWxseSBjb25zdHJ1Y3RlZCB1bnRpbCB0aGlzIHVwZGF0ZSBmdW5jdGlvbiBpcyBjYWxsZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODMyXG4gICAgICAvLyBUcmFpbCBJZHMgd2lsbCBuZXZlciBjaGFuZ2UsIHNvIHVwZGF0ZSB0aGVtIGVhZ2VybHksIGEgc2luZ2xlIHRpbWUgZHVyaW5nIGNvbnN0cnVjdGlvbi5cbiAgICAgIHRoaXMucGVlciEudXBkYXRlKCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LlRSQUlMX0lEICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBlZXIhLnByaW1hcnlTaWJsaW5nLCAnYWNjZXNzaWJsZSBwZWVyIG11c3QgaGF2ZSBhIHByaW1hcnlTaWJsaW5nIHVwb24gY29tcGxldGlvbiBvZiBjb25zdHJ1Y3Rpb24nICk7XG5cbiAgICAgIC8vIFNjYW4gb3ZlciBhbGwgb2YgdGhlIG5vZGVzIGluIG91ciB0cmFpbCAodGhhdCBhcmUgTk9UIGluIG91ciBwYXJlbnQncyB0cmFpbCkgdG8gY2hlY2sgZm9yIHBkb21EaXNwbGF5c1xuICAgICAgLy8gc28gd2UgY2FuIGluaXRpYWxpemUgb3VyIGludmlzaWJsZUNvdW50IGFuZCBhZGQgbGlzdGVuZXJzLlxuICAgICAgY29uc3QgcGFyZW50VHJhaWwgPSB0aGlzLnBhcmVudCEudHJhaWwhO1xuICAgICAgZm9yICggbGV0IGkgPSBwYXJlbnRUcmFpbC5sZW5ndGg7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgcmVsYXRpdmVOb2RlID0gdHJhaWwubm9kZXNbIGkgXTtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU5vZGVzLnB1c2goIHJlbGF0aXZlTm9kZSApO1xuXG4gICAgICAgIGNvbnN0IHBkb21EaXNwbGF5cyA9IHJlbGF0aXZlTm9kZS5fcGRvbURpc3BsYXlzSW5mby5wZG9tRGlzcGxheXM7XG4gICAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IF8uaW5jbHVkZXMoIHBkb21EaXNwbGF5cywgZGlzcGxheSApO1xuICAgICAgICB0aGlzLnJlbGF0aXZlVmlzaWJpbGl0aWVzLnB1c2goIGlzVmlzaWJsZSApO1xuICAgICAgICBpZiAoICFpc1Zpc2libGUgKSB7XG4gICAgICAgICAgdGhpcy5pbnZpc2libGVDb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLmNoZWNrQWNjZXNzaWJsZURpc3BsYXlWaXNpYmlsaXR5LmJpbmQoIHRoaXMsIGkgLSBwYXJlbnRUcmFpbC5sZW5ndGggKTtcbiAgICAgICAgcmVsYXRpdmVOb2RlLnBkb21EaXNwbGF5c0VtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gICAgICAgIHRoaXMucmVsYXRpdmVMaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcbiAgICAgIGBJbml0aWFsaXplZCAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc2VyaWVzIG9mIChzb3J0ZWQpIGFjY2Vzc2libGUgaW5zdGFuY2VzIGFzIGNoaWxkcmVuLlxuICAgKi9cbiAgcHVibGljIGFkZENvbnNlY3V0aXZlSW5zdGFuY2VzKCBwZG9tSW5zdGFuY2VzOiBQRE9NSW5zdGFuY2VbXSApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxuICAgICAgYGFkZENvbnNlY3V0aXZlSW5zdGFuY2VzIG9uICR7dGhpcy50b1N0cmluZygpfSB3aXRoOiAke3Bkb21JbnN0YW5jZXMubWFwKCBpbnN0ID0+IGluc3QudG9TdHJpbmcoKSApLmpvaW4oICcsJyApfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3QgaGFkQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDA7XG5cbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggdGhpcy5jaGlsZHJlbiwgcGRvbUluc3RhbmNlcyApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGRvbUluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIC8vIEFwcGVuZCB0aGUgY29udGFpbmVyIHBhcmVudCB0byB0aGUgZW5kIChzbyB0aGF0LCB3aGVuIHByb3ZpZGVkIGluIG9yZGVyLCB3ZSBkb24ndCBoYXZlIHRvIHJlc29ydCBiZWxvd1xuICAgICAgLy8gd2hlbiBpbml0aWFsaXppbmcpLlxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISF0aGlzLnBlZXIhLnByaW1hcnlTaWJsaW5nLCAnUHJpbWFyeSBzaWJsaW5nIG11c3QgYmUgZGVmaW5lZCB0byBpbnNlcnQgZWxlbWVudHMuJyApO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gd2hlbiBQRE9NUGVlciBpcyBjb252ZXJ0ZWQgdG8gVFMgdGhpcyB0cy1leHBlY3QtZXJyb3IgY2FuIHByb2JhYmx5IGJlIHJlbW92ZWRcbiAgICAgIFBET01VdGlscy5pbnNlcnRFbGVtZW50cyggdGhpcy5wZWVyLnByaW1hcnlTaWJsaW5nISwgcGRvbUluc3RhbmNlc1sgaSBdLnBlZXIudG9wTGV2ZWxFbGVtZW50cyApO1xuICAgIH1cblxuICAgIGlmICggaGFkQ2hpbGRyZW4gKSB7XG4gICAgICB0aGlzLnNvcnRDaGlsZHJlbigpO1xuICAgIH1cblxuICAgIGlmICggYXNzZXJ0ICYmIHRoaXMubm9kZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcblxuICAgICAgLy8gV2UgZG8gbm90IHN1cHBvcnQgcmVuZGVyaW5nIGNoaWxkcmVuIGludG8gYSBOb2RlIHRoYXQgaGFzIGlubmVyQ29udGVudC5cbiAgICAgIC8vIElmIHlvdSBoaXQgdGhpcyB3aGVuIG11dGF0aW5nIGJvdGggY2hpbGRyZW4gYW5kIGlubmVyQ29udGVudCBhdCB0aGUgc2FtZSB0aW1lLCBpdCBpcyBhbiBpc3N1ZSB3aXRoIHNjZW5lcnkuXG4gICAgICAvLyBSZW1vdmUgb25lIGluIGEgc2luZ2xlIHN0ZXAgYW5kIHRoZW0gYWRkIHRoZW4gb3RoZXIgaW4gdGhlIG5leHQgc3RlcC5cbiAgICAgIHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiBhc3NlcnQoICF0aGlzLm5vZGUuaW5uZXJDb250ZW50LFxuICAgICAgICBgJHt0aGlzLmNoaWxkcmVuLmxlbmd0aH0gY2hpbGQgUERPTUluc3RhbmNlcyBwcmVzZW50IGJ1dCB0aGlzIG5vZGUgaGFzIGlubmVyQ29udGVudDogJHt0aGlzLm5vZGUuaW5uZXJDb250ZW50fWAgKTtcbiAgICB9XG5cbiAgICBpZiAoIFVOSVFVRV9JRF9TVFJBVEVHWSA9PT0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuSU5ESUNFUyApIHtcblxuICAgICAgLy8gVGhpcyBraWxscyBwZXJmb3JtYW5jZSBpZiB0aGVyZSBhcmUgZW5vdWdoIFBET01JbnN0YW5jZXNcbiAgICAgIHRoaXMudXBkYXRlRGVzY2VuZGFudFBlZXJJZHMoIHBkb21JbnN0YW5jZXMgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbnkgY2hpbGQgaW5zdGFuY2VzIHRoYXQgYXJlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0cmFpbC5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVJbnN0YW5jZXNGb3JUcmFpbCggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UoXG4gICAgICBgcmVtb3ZlSW5zdGFuY2VzRm9yVHJhaWwgb24gJHt0aGlzLnRvU3RyaW5nKCl9IHdpdGggdHJhaWwgJHt0cmFpbC50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGNoaWxkSW5zdGFuY2UgPSB0aGlzLmNoaWxkcmVuWyBpIF07XG4gICAgICBjb25zdCBjaGlsZFRyYWlsID0gY2hpbGRJbnN0YW5jZS50cmFpbDtcblxuICAgICAgLy8gTm90IHdvcnRoIGl0IHRvIGluc3BlY3QgYmVmb3JlIG91ciB0cmFpbCBlbmRzLCBzaW5jZSBpdCBzaG91bGQgYmUgKCEpIGd1YXJhbnRlZWQgdG8gYmUgZXF1YWxcbiAgICAgIGxldCBkaWZmZXJzID0gY2hpbGRUcmFpbCEubGVuZ3RoIDwgdHJhaWwubGVuZ3RoO1xuICAgICAgaWYgKCAhZGlmZmVycyApIHtcbiAgICAgICAgZm9yICggbGV0IGogPSB0aGlzLnRyYWlsIS5sZW5ndGg7IGogPCB0cmFpbC5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBpZiAoIHRyYWlsLm5vZGVzWyBqIF0gIT09IGNoaWxkVHJhaWwhLm5vZGVzWyBqIF0gKSB7XG4gICAgICAgICAgICBkaWZmZXJzID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoICFkaWZmZXJzICkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSggaSwgMSApO1xuICAgICAgICBjaGlsZEluc3RhbmNlLmRpc3Bvc2UoKTtcbiAgICAgICAgaSAtPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgY2hpbGRyZW4uXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQWxsQ2hpbGRyZW4oKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSggYHJlbW92ZUFsbENoaWxkcmVuIG9uICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgd2hpbGUgKCB0aGlzLmNoaWxkcmVuLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4ucG9wKCkhLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFBET01JbnN0YW5jZSBjaGlsZCAoaWYgb25lIGV4aXN0cyB3aXRoIHRoZSBnaXZlbiBUcmFpbCksIG9yIG51bGwgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHVibGljIGZpbmRDaGlsZFdpdGhUcmFpbCggdHJhaWw6IFRyYWlsICk6IFBET01JbnN0YW5jZSB8IG51bGwge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcbiAgICAgIGlmICggY2hpbGQudHJhaWwhLmVxdWFscyggdHJhaWwgKSApIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzdWJ0cmVlIG9mIFBET01JbnN0YW5jZXMgZnJvbSB0aGlzIFBET01JbnN0YW5jZVxuICAgKlxuICAgKiBAcGFyYW0gdHJhaWwgLSBjaGlsZHJlbiBvZiB0aGlzIFBET01JbnN0YW5jZSB3aWxsIGJlIHJlbW92ZWQgaWYgdGhlIGNoaWxkIHRyYWlscyBhcmUgZXh0ZW5zaW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIG9mIHRoZSB0cmFpbC5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlU3VidHJlZSggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UoXG4gICAgICBgcmVtb3ZlU3VidHJlZSBvbiAke3RoaXMudG9TdHJpbmcoKX0gd2l0aCB0cmFpbCAke3RyYWlsLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBjb25zdCBjaGlsZEluc3RhbmNlID0gdGhpcy5jaGlsZHJlblsgaSBdO1xuICAgICAgaWYgKCBjaGlsZEluc3RhbmNlLnRyYWlsIS5pc0V4dGVuc2lvbk9mKCB0cmFpbCwgdHJ1ZSApICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlICYmIHNjZW5lcnlMb2cuUERPTUluc3RhbmNlKFxuICAgICAgICAgIGBSZW1vdmUgcGFyZW50OiAke3RoaXMudG9TdHJpbmcoKX0sIGNoaWxkOiAke2NoaWxkSW5zdGFuY2UudG9TdHJpbmcoKX1gICk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpLCAxICk7IC8vIHJlbW92ZSBpdCBmcm9tIHRoZSBjaGlsZHJlbiBhcnJheVxuXG4gICAgICAgIC8vIERpc3Bvc2UgdGhlIGVudGlyZSBzdWJ0cmVlIG9mIFBET01JbnN0YW5jZXNcbiAgICAgICAgY2hpbGRJbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0byBzZWUgd2hldGhlciBvdXIgdmlzaWJpbGl0eSBuZWVkcyBhbiB1cGRhdGUgYmFzZWQgb24gYSBwZG9tRGlzcGxheXMgY2hhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0gaW5kZXggLSBJbmRleCBpbnRvIHRoZSByZWxhdGl2ZU5vZGVzIGFycmF5ICh3aGljaCBub2RlIGhhZCB0aGUgbm90aWZpY2F0aW9uKVxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja0FjY2Vzc2libGVEaXNwbGF5VmlzaWJpbGl0eSggaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBpc05vZGVWaXNpYmxlID0gXy5pbmNsdWRlcyggdGhpcy5yZWxhdGl2ZU5vZGVzIVsgaW5kZXggXS5fcGRvbURpc3BsYXlzSW5mby5wZG9tRGlzcGxheXMsIHRoaXMuZGlzcGxheSApO1xuICAgIGNvbnN0IHdhc05vZGVWaXNpYmxlID0gdGhpcy5yZWxhdGl2ZVZpc2liaWxpdGllc1sgaW5kZXggXTtcblxuICAgIGlmICggaXNOb2RlVmlzaWJsZSAhPT0gd2FzTm9kZVZpc2libGUgKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlVmlzaWJpbGl0aWVzWyBpbmRleCBdID0gaXNOb2RlVmlzaWJsZTtcblxuICAgICAgY29uc3Qgd2FzVmlzaWJsZSA9IHRoaXMuaW52aXNpYmxlQ291bnQgPT09IDA7XG5cbiAgICAgIHRoaXMuaW52aXNpYmxlQ291bnQgKz0gKCBpc05vZGVWaXNpYmxlID8gLTEgOiAxICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmludmlzaWJsZUNvdW50ID49IDAgJiYgdGhpcy5pbnZpc2libGVDb3VudCA8PSB0aGlzLnJlbGF0aXZlTm9kZXMhLmxlbmd0aCApO1xuXG4gICAgICBjb25zdCBpc1Zpc2libGUgPSB0aGlzLmludmlzaWJsZUNvdW50ID09PSAwO1xuXG4gICAgICBpZiAoIGlzVmlzaWJsZSAhPT0gd2FzVmlzaWJsZSApIHtcbiAgICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB2aXNpYmlsaXR5IG9mIHRoaXMgcGVlcidzIGFjY2Vzc2libGUgRE9NIGNvbnRlbnQuIFRoZSBoaWRkZW4gYXR0cmlidXRlIHdpbGwgaGlkZSBhbGwgb2YgdGhlIGRlc2NlbmRhbnRcbiAgICogRE9NIGNvbnRlbnQsIHNvIGl0IGlzIG5vdCBuZWNlc3NhcnkgdG8gdXBkYXRlIHRoZSBzdWJ0cmVlIG9mIFBET01JbnN0YW5jZXMgc2luY2UgdGhlIGJyb3dzZXJcbiAgICogd2lsbCBkbyB0aGlzIGZvciB1cy5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMucGVlciwgJ1BlZXIgbmVlZHMgdG8gYmUgYXZhaWxhYmxlIG9uIHVwZGF0ZSB2aXNpYmlsaXR5LicgKTtcbiAgICB0aGlzLnBlZXIhLnNldFZpc2libGUoIHRoaXMuaW52aXNpYmxlQ291bnQgPD0gMCApO1xuXG4gICAgLy8gaWYgd2UgaGlkIGEgcGFyZW50IGVsZW1lbnQsIGJsdXIgZm9jdXMgaWYgYWN0aXZlIGVsZW1lbnQgd2FzIGFuIGFuY2VzdG9yXG4gICAgaWYgKCAhdGhpcy5wZWVyIS5pc1Zpc2libGUoKSAmJiBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c2VkTm9kZS5wZG9tSW5zdGFuY2VzLmxlbmd0aCA9PT0gMSxcbiAgICAgICAgJ2ZvY3VzYWJsZSBOb2RlcyBkbyBub3Qgc3VwcG9ydCBEQUcsIGFuZCBzaG91bGQgYmUgY29ubmVjdGVkIHdpdGggYW4gaW5zdGFuY2UgaWYgZm9jdXNlZC4nICk7XG5cbiAgICAgIC8vIE5PVEU6IFdlIGRvbid0IHNlZW0gdG8gYmUgYWJsZSB0byBpbXBvcnQgbm9ybWFsbHkgaGVyZVxuICAgICAgaWYgKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlLnBkb21JbnN0YW5jZXNbIDAgXS50cmFpbCEuY29udGFpbnNOb2RlKCB0aGlzLm5vZGUhICkgKSB7XG4gICAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHBhcmFsbGVsIERPTSBmb3IgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9ycyBhcmUgbm90IGhpZGRlbi5cbiAgICovXG4gIHB1YmxpYyBpc0dsb2JhbGx5VmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMucGVlciwgJ1BET01QZWVyIG5lZWRzIHRvIGJlIGF2YWlsYWJsZSwgaGFzIHRoaXMgUERPTUluc3RhbmNlIGJlZW4gZGlzcG9zZWQ/JyApO1xuXG4gICAgLy8gSWYgdGhpcyBwZWVyIGlzIGhpZGRlbiwgdGhlbiByZXR1cm4gYmVjYXVzZSB0aGF0IGF0dHJpYnV0ZSB3aWxsIGJ1YmJsZSBkb3duIHRvIGNoaWxkcmVuLFxuICAgIC8vIG90aGVyd2lzZSByZWN1cnNlIHRvIHBhcmVudC5cbiAgICBpZiAoICF0aGlzLnBlZXIhLmlzVmlzaWJsZSgpICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5wYXJlbnQgKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQuaXNHbG9iYWxseVZpc2libGUoKTtcbiAgICB9XG4gICAgZWxzZSB7IC8vIGJhc2UgY2FzZSBhdCByb290XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGF0IG91ciBsaXN0IG9mIGNoaWxkcmVuIChhZnRlciBzb3J0aW5nKSBzaG91bGQgYmUuXG4gICAqXG4gICAqIEBwYXJhbSB0cmFpbCAtIEEgcGFydGlhbCB0cmFpbCwgd2hlcmUgdGhlIHJvb3Qgb2YgdGhlIHRyYWlsIGlzIGVpdGhlciB0aGlzLm5vZGUgb3IgdGhlIGRpc3BsYXkncyByb290XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSAoaWYgd2UgYXJlIHRoZSByb290IFBET01JbnN0YW5jZSlcbiAgICovXG4gIHByaXZhdGUgZ2V0Q2hpbGRPcmRlcmluZyggdHJhaWw6IFRyYWlsICk6IFBET01JbnN0YW5jZVtdIHtcbiAgICBjb25zdCBub2RlID0gdHJhaWwubGFzdE5vZGUoKTtcbiAgICBjb25zdCBlZmZlY3RpdmVDaGlsZHJlbiA9IG5vZGUuZ2V0RWZmZWN0aXZlQ2hpbGRyZW4oKTtcbiAgICBsZXQgaTtcbiAgICBjb25zdCBpbnN0YW5jZXM6IFBET01JbnN0YW5jZVtdID0gW107XG5cbiAgICAvLyBiYXNlIGNhc2UsIG5vZGUgaGFzIGFjY2Vzc2libGUgY29udGVudCwgYnV0IGRvbid0IG1hdGNoIHRoZSBcInJvb3RcIiBub2RlIG9mIHRoaXMgYWNjZXNzaWJsZSBpbnN0YW5jZVxuICAgIGlmICggbm9kZS5oYXNQRE9NQ29udGVudCAmJiBub2RlICE9PSB0aGlzLm5vZGUgKSB7XG4gICAgICBjb25zdCBwb3RlbnRpYWxJbnN0YW5jZXMgPSBub2RlLnBkb21JbnN0YW5jZXM7XG5cbiAgICAgIGluc3RhbmNlTG9vcDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBwb3RlbnRpYWxJbnN0YW5jZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgcG90ZW50aWFsSW5zdGFuY2UgPSBwb3RlbnRpYWxJbnN0YW5jZXNbIGkgXTtcbiAgICAgICAgICBpZiAoIHBvdGVudGlhbEluc3RhbmNlLnBhcmVudCAhPT0gdGhpcyApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRyYWlsLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgICAgaWYgKCB0cmFpbC5ub2Rlc1sgaiBdICE9PSBwb3RlbnRpYWxJbnN0YW5jZS50cmFpbCEubm9kZXNbIGogKyBwb3RlbnRpYWxJbnN0YW5jZS50cmFpbCEubGVuZ3RoIC0gdHJhaWwubGVuZ3RoIF0gKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIGluc3RhbmNlTG9vcDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1sYWJlbHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbnN0YW5jZXMucHVzaCggcG90ZW50aWFsSW5zdGFuY2UgKTsgLy8gbGVuZ3RoIHdpbGwgYWx3YXlzIGJlIDFcbiAgICAgICAgfVxuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZXMubGVuZ3RoIDw9IDEsICdJZiB3ZSBzZWxlY3QgbW9yZSB0aGFuIG9uZSB0aGlzIHdheSwgd2UgaGF2ZSBwcm9ibGVtcycgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGVmZmVjdGl2ZUNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0cmFpbC5hZGREZXNjZW5kYW50KCBlZmZlY3RpdmVDaGlsZHJlblsgaSBdLCBpICk7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBpbnN0YW5jZXMsIHRoaXMuZ2V0Q2hpbGRPcmRlcmluZyggdHJhaWwgKSApO1xuICAgICAgICB0cmFpbC5yZW1vdmVEZXNjZW5kYW50KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0IG91ciBjaGlsZCBhY2Nlc3NpYmxlIGluc3RhbmNlcyBpbiB0aGUgb3JkZXIgdGhleSBzaG91bGQgYXBwZWFyIGluIHRoZSBwYXJhbGxlbCBET00uIFdlIGRvIHRoaXMgYnlcbiAgICogY3JlYXRpbmcgYSBjb21wYXJpc29uIGZ1bmN0aW9uIGJldHdlZW4gdHdvIGFjY2Vzc2libGUgaW5zdGFuY2VzLiBUaGUgZnVuY3Rpb24gd2Fsa3MgYWxvbmcgdGhlIHRyYWlsc1xuICAgKiBvZiB0aGUgY2hpbGRyZW4sIGxvb2tpbmcgZm9yIHNwZWNpZmllZCBhY2Nlc3NpYmxlIG9yZGVycyB0aGF0IHdvdWxkIGRldGVybWluZSB0aGUgb3JkZXJpbmcgZm9yIHRoZSB0d29cbiAgICogUERPTUluc3RhbmNlcy5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgc29ydENoaWxkcmVuKCk6IHZvaWQge1xuICAgIC8vIEl0J3Mgc2ltcGxlci9mYXN0ZXIgdG8ganVzdCBncmFiIG91ciBvcmRlciBkaXJlY3RseSB3aXRoIG9uZSByZWN1cnNpb24sIHJhdGhlciB0aGFuIHNwZWNpZnlpbmcgYSBzb3J0aW5nXG4gICAgLy8gZnVuY3Rpb24gKHNpbmNlIGEgbG90IGdldHMgcmUtZXZhbHVhdGVkIGluIHRoYXQgY2FzZSkuXG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBlZXIgIT09IG51bGwsICdwZWVyIHJlcXVpcmVkIGZvciBzb3J0JyApO1xuICAgIGxldCBub2RlRm9yVHJhaWw6IE5vZGU7XG4gICAgaWYgKCB0aGlzLmlzUm9vdEluc3RhbmNlICkge1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRpc3BsYXkgIT09IG51bGwsICdEaXNwbGF5IHNob3VsZCBiZSBhdmFpbGFibGUgZm9yIHRoZSByb290JyApO1xuICAgICAgbm9kZUZvclRyYWlsID0gdGhpcy5kaXNwbGF5IS5yb290Tm9kZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUgIT09IG51bGwsICdOb2RlIHNob3VsZCBiZSBkZWZpbmVkLCB3ZXJlIHdlIGRpc3Bvc2VkPycgKTtcbiAgICAgIG5vZGVGb3JUcmFpbCA9IHRoaXMubm9kZSE7XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldENoaWxkcmVuID0gdGhpcy5nZXRDaGlsZE9yZGVyaW5nKCBuZXcgVHJhaWwoIG5vZGVGb3JUcmFpbCApICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YXJnZXRDaGlsZHJlbi5sZW5ndGggPT09IHRoaXMuY2hpbGRyZW4ubGVuZ3RoLCAnc29ydGluZyBzaG91bGQgbm90IGNoYW5nZSBudW1iZXIgb2YgY2hpbGRyZW4nICk7XG5cbiAgICAvLyB7QXJyYXkuPFBET01JbnN0YW5jZT59XG4gICAgdGhpcy5jaGlsZHJlbiA9IHRhcmdldENoaWxkcmVuO1xuXG4gICAgLy8gdGhlIERPTUVsZW1lbnQgdG8gYWRkIHRoZSBjaGlsZCBET01FbGVtZW50cyB0by5cbiAgICBjb25zdCBwcmltYXJ5U2libGluZyA9IHRoaXMucGVlciEucHJpbWFyeVNpYmxpbmchO1xuXG4gICAgLy8gSWdub3JlIERBRyBmb3IgZm9jdXNlZCB0cmFpbC4gV2UgbmVlZCB0byBrbm93IGlmIHRoZXJlIGlzIGEgZm9jdXNlZCBjaGlsZCBpbnN0YW5jZSBzbyB0aGF0IHdlIGNhbiBhdm9pZFxuICAgIC8vIHRlbXBvcmFyaWx5IGRldGFjaGluZyB0aGUgZm9jdXNlZCBlbGVtZW50IGZyb20gdGhlIERPTS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9teS1zb2xhci1zeXN0ZW0vaXNzdWVzLzE0MlxuICAgIGNvbnN0IGZvY3VzZWRUcmFpbCA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGU/LnBkb21JbnN0YW5jZXNbIDAgXT8udHJhaWwgfHwgbnVsbDtcblxuICAgIC8vIFwiaVwiIHdpbGwga2VlcCB0cmFjayBvZiB0aGUgXCJjb2xsYXBzZWRcIiBpbmRleCB3aGVuIGFsbCBET01FbGVtZW50cyBmb3IgYWxsIFBET01JbnN0YW5jZSBjaGlsZHJlbiBhcmVcbiAgICAvLyBhZGRlZCB0byBhIHNpbmdsZSBwYXJlbnQgRE9NRWxlbWVudCAodGhpcyBQRE9NSW5zdGFuY2UncyBQRE9NUGVlcidzIHByaW1hcnlTaWJsaW5nKVxuICAgIGxldCBpID0gcHJpbWFyeVNpYmxpbmcuY2hpbGROb2Rlcy5sZW5ndGggLSAxO1xuXG4gICAgY29uc3QgZm9jdXNlZENoaWxkSW5zdGFuY2UgPSBmb2N1c2VkVHJhaWwgJiYgXy5maW5kKCB0aGlzLmNoaWxkcmVuLCBjaGlsZCA9PiBmb2N1c2VkVHJhaWwuY29udGFpbnNOb2RlKCBjaGlsZC5wZWVyIS5ub2RlISApICk7XG4gICAgaWYgKCBmb2N1c2VkQ2hpbGRJbnN0YW5jZSApIHtcbiAgICAgIC8vIElmIHRoZXJlJ3MgYSBmb2N1c2VkIGNoaWxkIGluc3RhbmNlLCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGl0cyBwcmltYXJ5U2libGluZyBpcyBub3QgZGV0YWNoZWQgZnJvbSB0aGUgRE9NXG4gICAgICAvLyAodGhpcyBoYXMgY2F1c2VkIGZvY3VzIGlzc3Vlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9teS1zb2xhci1zeXN0ZW0vaXNzdWVzLzE0MikuXG4gICAgICAvLyBTaW5jZSB0aGlzIGRvZXNuJ3QgaGFwcGVuIG9mdGVuLCB3ZSBjYW4ganVzdCByZWNvbXB1dGUgdGhlIGZ1bGwgb3JkZXIsIGFuZCBtb3ZlIGV2ZXJ5IG90aGVyIGVsZW1lbnQuXG5cbiAgICAgIGNvbnN0IGRlc2lyZWRPcmRlciA9IF8uZmxhdHRlbiggdGhpcy5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IGNoaWxkLnBlZXIhLnRvcExldmVsRWxlbWVudHMhICkgKTtcbiAgICAgIGNvbnN0IG5lZWRzT3JkZXJDaGFuZ2UgPSAhXy5ldmVyeSggZGVzaXJlZE9yZGVyLCAoIGRlc2lyZWRFbGVtZW50LCBpbmRleCApID0+IHByaW1hcnlTaWJsaW5nLmNoaWxkcmVuWyBpbmRleCBdID09PSBkZXNpcmVkRWxlbWVudCApO1xuXG4gICAgICBpZiAoIG5lZWRzT3JkZXJDaGFuZ2UgKSB7XG4gICAgICAgIGNvbnN0IHBpdm90RWxlbWVudCA9IGZvY3VzZWRDaGlsZEluc3RhbmNlLnBlZXIhLmdldFRvcExldmVsRWxlbWVudENvbnRhaW5pbmdQcmltYXJ5U2libGluZygpO1xuICAgICAgICBjb25zdCBwaXZvdEluZGV4ID0gZGVzaXJlZE9yZGVyLmluZGV4T2YoIHBpdm90RWxlbWVudCApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaXZvdEluZGV4ID49IDAgKTtcblxuICAgICAgICAvLyBJbnNlcnQgYWxsIGVsZW1lbnRzIGJlZm9yZSB0aGUgcGl2b3QgZWxlbWVudFxuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBwaXZvdEluZGV4OyBqKysgKSB7XG4gICAgICAgICAgcHJpbWFyeVNpYmxpbmcuaW5zZXJ0QmVmb3JlKCBkZXNpcmVkT3JkZXJbIGogXSwgcGl2b3RFbGVtZW50ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbnNlcnQgYWxsIGVsZW1lbnRzIGFmdGVyIHRoZSBwaXZvdCBlbGVtZW50XG4gICAgICAgIGZvciAoIGxldCBqID0gcGl2b3RJbmRleCArIDE7IGogPCBkZXNpcmVkT3JkZXIubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgcHJpbWFyeVNpYmxpbmcuYXBwZW5kQ2hpbGQoIGRlc2lyZWRPcmRlclsgaiBdICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggYWxsIFBET01JbnN0YW5jZSBjaGlsZHJlblxuICAgICAgZm9yICggbGV0IHBlZXJJbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgcGVlckluZGV4ID49IDA7IHBlZXJJbmRleC0tICkge1xuICAgICAgICBjb25zdCBwZWVyID0gdGhpcy5jaGlsZHJlblsgcGVlckluZGV4IF0ucGVlciE7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCB0b3AgbGV2ZWwgZWxlbWVudHMgb2YgYSBQRE9NSW5zdGFuY2UncyBwZWVyXG4gICAgICAgIGZvciAoIGxldCBlbGVtZW50SW5kZXggPSBwZWVyLnRvcExldmVsRWxlbWVudHMhLmxlbmd0aCAtIDE7IGVsZW1lbnRJbmRleCA+PSAwOyBlbGVtZW50SW5kZXgtLSApIHtcbiAgICAgICAgICBjb25zdCBlbGVtZW50ID0gcGVlci50b3BMZXZlbEVsZW1lbnRzIVsgZWxlbWVudEluZGV4IF07XG5cbiAgICAgICAgICAvLyBSZW9yZGVyIERPTSBlbGVtZW50cyBpbiBhIHdheSB0aGF0IGRvZXNuJ3QgZG8gYW55IHdvcmsgaWYgdGhleSBhcmUgYWxyZWFkeSBpbiBhIHNvcnRlZCBvcmRlci5cbiAgICAgICAgICAvLyBObyBuZWVkIHRvIHJlaW5zZXJ0IGlmIGBlbGVtZW50YCBpcyBhbHJlYWR5IGluIHRoZSByaWdodCBvcmRlclxuICAgICAgICAgIGlmICggcHJpbWFyeVNpYmxpbmcuY2hpbGROb2Rlc1sgaSBdICE9PSBlbGVtZW50ICkge1xuICAgICAgICAgICAgcHJpbWFyeVNpYmxpbmcuaW5zZXJ0QmVmb3JlKCBlbGVtZW50LCBwcmltYXJ5U2libGluZy5jaGlsZE5vZGVzWyBpICsgMSBdICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVjcmVtZW50IHNvIHRoYXQgaXQgaXMgZWFzaWVyIHRvIHBsYWNlIGVsZW1lbnRzIHVzaW5nIHRoZSBicm93c2VyJ3MgTm9kZS5pbnNlcnRCZWZvcmUgQVBJXG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBjb25zdCBkZXNpcmVkT3JkZXIgPSBfLmZsYXR0ZW4oIHRoaXMuY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBjaGlsZC5wZWVyIS50b3BMZXZlbEVsZW1lbnRzISApICk7XG5cbiAgICAgIC8vIFZlcmlmeSB0aGUgb3JkZXJcbiAgICAgIGFzc2VydCggXy5ldmVyeSggZGVzaXJlZE9yZGVyLCAoIGRlc2lyZWRFbGVtZW50LCBpbmRleCApID0+IHByaW1hcnlTaWJsaW5nLmNoaWxkcmVuWyBpbmRleCBdID09PSBkZXNpcmVkRWxlbWVudCApICk7XG4gICAgfVxuXG4gICAgaWYgKCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LklORElDRVMgKSB7XG5cbiAgICAgIC8vIFRoaXMga2lsbHMgcGVyZm9ybWFuY2UgaWYgdGhlcmUgYXJlIGVub3VnaCBQRE9NSW5zdGFuY2VzXG4gICAgICB0aGlzLnVwZGF0ZURlc2NlbmRhbnRQZWVySWRzKCB0aGlzLmNoaWxkcmVuICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBUcmFuc2Zvcm1UcmFja2VyIHRoYXQgd2lsbCBvYnNlcnZlIHRyYW5zZm9ybXMgYWxvbmcgdGhlIHRyYWlsIG9mIHRoaXMgUERPTUluc3RhbmNlIE9SXG4gICAqIHRoZSBwcm92aWRlZCBwZG9tVHJhbnNmb3JtU291cmNlTm9kZS4gU2VlIFBhcmFsbGVsRE9NLnNldFBET01UcmFuc2Zvcm1Tb3VyY2VOb2RlKCkuIFRoZSBUaGUgc291cmNlIE5vZGVcbiAgICogbXVzdCBub3QgdXNlIERBRyBzbyB0aGF0IGl0cyB0cmFpbCBpcyB1bmlxdWUuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlVHJhbnNmb3JtVHJhY2tlciggcGRvbVRyYW5zZm9ybVNvdXJjZU5vZGU6IE5vZGUgfCBudWxsICk6IHZvaWQge1xuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciAmJiB0aGlzLnRyYW5zZm9ybVRyYWNrZXIuZGlzcG9zZSgpO1xuXG4gICAgbGV0IHRyYWNrZWRUcmFpbCA9IG51bGw7XG4gICAgaWYgKCBwZG9tVHJhbnNmb3JtU291cmNlTm9kZSApIHtcbiAgICAgIHRyYWNrZWRUcmFpbCA9IHBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlLmdldFVuaXF1ZVRyYWlsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdHJhY2tlZFRyYWlsID0gUERPTUluc3RhbmNlLmd1ZXNzVmlzdWFsVHJhaWwoIHRoaXMudHJhaWwhLCB0aGlzLmRpc3BsYXkhLnJvb3ROb2RlICk7XG4gICAgfVxuXG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyID0gbmV3IFRyYW5zZm9ybVRyYWNrZXIoIHRyYWNrZWRUcmFpbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlcGVuZGluZyBvbiB3aGF0IHRoZSB1bmlxdWUgSUQgc3RyYXRlZ3kgaXMsIGZvcm11bGF0ZSB0aGUgY29ycmVjdCBpZCBmb3IgdGhpcyBQRE9NIGluc3RhbmNlLlxuICAgKi9cbiAgcHVibGljIGdldFBET01JbnN0YW5jZVVuaXF1ZUlkKCk6IHN0cmluZyB7XG5cbiAgICBpZiAoIFVOSVFVRV9JRF9TVFJBVEVHWSA9PT0gUERPTVVuaXF1ZUlkU3RyYXRlZ3kuSU5ESUNFUyApIHtcblxuICAgICAgY29uc3QgaW5kaWNlc1N0cmluZyA9IFtdO1xuXG4gICAgICBsZXQgcGRvbUluc3RhbmNlOiBQRE9NSW5zdGFuY2UgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblxuICAgICAgd2hpbGUgKCBwZG9tSW5zdGFuY2UucGFyZW50ICkge1xuICAgICAgICBjb25zdCBpbmRleE9mID0gcGRvbUluc3RhbmNlLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKCBwZG9tSW5zdGFuY2UgKTtcbiAgICAgICAgaWYgKCBpbmRleE9mID09PSAtMSApIHtcbiAgICAgICAgICByZXR1cm4gJ1NUSUxMX0JFSU5HX0NSRUFURUQnICsgZG90UmFuZG9tLm5leHREb3VibGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpbmRpY2VzU3RyaW5nLnVuc2hpZnQoIGluZGV4T2YgKTtcbiAgICAgICAgcGRvbUluc3RhbmNlID0gcGRvbUluc3RhbmNlLnBhcmVudDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmRpY2VzU3RyaW5nLmpvaW4oIFBET01VdGlscy5QRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1IgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LlRSQUlMX0lEICk7XG5cbiAgICAgIHJldHVybiB0aGlzLnRyYWlsIS5nZXRVbmlxdWVJZCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVc2luZyBpbmRpY2VzIHJlcXVpcmVzIHVwZGF0aW5nIHdoZW5ldmVyIHRoZSBQRE9NSW5zdGFuY2UgdHJlZSBjaGFuZ2VzLCBzbyByZWN1cnNpdmVseSB1cGRhdGUgYWxsIGRlc2NlbmRhbnRcbiAgICogaWRzIGZyb20gc3VjaCBhIGNoYW5nZS4gVXBkYXRlIHBlZXIgaWRzIGZvciBwcm92aWRlZCBpbnN0YW5jZXMgYW5kIGFsbCBkZXNjZW5kYW50cyBvZiBwcm92aWRlZCBpbnN0YW5jZXMuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZURlc2NlbmRhbnRQZWVySWRzKCBwZG9tSW5zdGFuY2VzOiBQRE9NSW5zdGFuY2VbXSApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBVTklRVUVfSURfU1RSQVRFR1kgPT09IFBET01VbmlxdWVJZFN0cmF0ZWd5LklORElDRVMsICdtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkIHdpdGggdW5pcXVlSWQgY29tZXMgZnJvbSBUUkFJTF9JRCcgKTtcbiAgICBjb25zdCB0b1VwZGF0ZSA9IEFycmF5LmZyb20oIHBkb21JbnN0YW5jZXMgKTtcbiAgICB3aGlsZSAoIHRvVXBkYXRlLmxlbmd0aCA+IDAgKSB7XG4gICAgICBjb25zdCBwZG9tSW5zdGFuY2UgPSB0b1VwZGF0ZS5zaGlmdCgpITtcbiAgICAgIHBkb21JbnN0YW5jZS5wZWVyIS51cGRhdGVJbmRpY2VzU3RyaW5nQW5kRWxlbWVudElkcygpO1xuICAgICAgdG9VcGRhdGUucHVzaCggLi4ucGRvbUluc3RhbmNlLmNoaWxkcmVuICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBkaXNwbGF5XG4gICAqIEBwYXJhbSB1bmlxdWVJZCAtIHZhbHVlIHJldHVybmVkIGZyb20gUERPTUluc3RhbmNlLmdldFBET01JbnN0YW5jZVVuaXF1ZUlkKClcbiAgICogQHJldHVybnMgbnVsbCBpZiB0aGVyZSBpcyBubyBwYXRoIHRvIHRoZSB1bmlxdWUgaWQgcHJvdmlkZWQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHVuaXF1ZUlkVG9UcmFpbCggZGlzcGxheTogRGlzcGxheSwgdW5pcXVlSWQ6IHN0cmluZyApOiBUcmFpbCB8IG51bGwge1xuICAgIGlmICggVU5JUVVFX0lEX1NUUkFURUdZID09PSBQRE9NVW5pcXVlSWRTdHJhdGVneS5JTkRJQ0VTICkge1xuICAgICAgcmV0dXJuIGRpc3BsYXkuZ2V0VHJhaWxGcm9tUERPTUluZGljZXNTdHJpbmcoIHVuaXF1ZUlkICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggVU5JUVVFX0lEX1NUUkFURUdZID09PSBQRE9NVW5pcXVlSWRTdHJhdGVneS5UUkFJTF9JRCApO1xuICAgICAgcmV0dXJuIFRyYWlsLmZyb21VbmlxdWVJZCggZGlzcGxheS5yb290Tm9kZSwgdW5pcXVlSWQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIGRpc3Bvc2FsLCB0byBtYWtlIGVsaWdpYmxlIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcbiAgICAgIGBEaXNwb3NpbmcgJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QRE9NSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXRoaXMucGVlciwgJ1BET01QZWVyIHJlcXVpcmVkLCB3ZXJlIHdlIGFscmVhZHkgZGlzcG9zZWQ/JyApO1xuICAgIGNvbnN0IHRoaXNQZWVyID0gdGhpcy5wZWVyITtcblxuICAgIC8vIERpc2Nvbm5lY3QgRE9NIGFuZCByZW1vdmUgbGlzdGVuZXJzXG4gICAgaWYgKCAhdGhpcy5pc1Jvb3RJbnN0YW5jZSApIHtcblxuICAgICAgLy8gcmVtb3ZlIHRoaXMgcGVlcidzIHByaW1hcnkgc2libGluZyBET00gRWxlbWVudCAob3IgaXRzIGNvbnRhaW5lciBwYXJlbnQpIGZyb20gdGhlIHBhcmVudCBwZWVyJ3NcbiAgICAgIC8vIHByaW1hcnkgc2libGluZyAob3IgaXRzIGNoaWxkIGNvbnRhaW5lcilcbiAgICAgIFBET01VdGlscy5yZW1vdmVFbGVtZW50cyggdGhpcy5wYXJlbnQhLnBlZXIhLnByaW1hcnlTaWJsaW5nISwgdGhpc1BlZXIudG9wTGV2ZWxFbGVtZW50cyEgKTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZWxhdGl2ZU5vZGVzIS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZU5vZGVzIVsgaSBdLnBkb21EaXNwbGF5c0VtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMucmVsYXRpdmVMaXN0ZW5lcnNbIGkgXSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICggdGhpcy5jaGlsZHJlbi5sZW5ndGggKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnBvcCgpIS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgLy8gTk9URTogV2UgZGlzcG9zZSBPVVIgcGVlciBhZnRlciBkaXNwb3NpbmcgY2hpbGRyZW4sIHNvIG91ciBwZWVyIGNhbiBiZSBhdmFpbGFibGUgZm9yIG91ciBjaGlsZHJlbiBkdXJpbmdcbiAgICAvLyBkaXNwb3NhbC5cbiAgICB0aGlzUGVlci5kaXNwb3NlKCk7XG5cbiAgICAvLyBkaXNwb3NlIGFmdGVyIHRoZSBwZWVyIHNvIHRoZSBwZWVyIGNhbiByZW1vdmUgYW55IGxpc3RlbmVycyBmcm9tIGl0XG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyIS5kaXNwb3NlKCk7XG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyID0gbnVsbDtcblxuICAgIC8vIElmIHdlIGFyZSB0aGUgcm9vdCBhY2Nlc3NpYmxlIGluc3RhbmNlLCB3ZSB3b24ndCBhY3R1YWxseSBoYXZlIGEgcmVmZXJlbmNlIHRvIGEgbm9kZS5cbiAgICBpZiAoIHRoaXMubm9kZSApIHtcbiAgICAgIHRoaXMubm9kZS5yZW1vdmVQRE9NSW5zdGFuY2UoIHRoaXMgKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlbGF0aXZlTm9kZXMgPSBudWxsO1xuICAgIHRoaXMuZGlzcGxheSA9IG51bGw7XG4gICAgdGhpcy50cmFpbCA9IG51bGw7XG4gICAgdGhpcy5ub2RlID0gbnVsbDtcblxuICAgIHRoaXMucGVlciA9IG51bGw7XG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBkZWJ1Z2dpbmcgcHVycG9zZXMuXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5pZH0jeyR7dGhpcy50cmFpbCEudG9TdHJpbmcoKX19YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzLCBpbnNwZWN0IHRoZSB0cmVlIG9mIFBET01JbnN0YW5jZXMgZnJvbSB0aGUgcm9vdC5cbiAgICpcbiAgICogT25seSBldmVyIGNhbGxlZCBmcm9tIHRoZSBfcm9vdFBET01JbnN0YW5jZSBvZiB0aGUgZGlzcGxheS5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgYXVkaXRSb290KCk6IHZvaWQge1xuICAgIGlmICggIWFzc2VydCApIHsgcmV0dXJuOyB9XG5cbiAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuZGlzcGxheSEucm9vdE5vZGU7XG5cbiAgICBhc3NlcnQoIHRoaXMudHJhaWwhLmxlbmd0aCA9PT0gMCxcbiAgICAgICdTaG91bGQgb25seSBjYWxsIGF1ZGl0Um9vdCgpIG9uIHRoZSByb290IFBET01JbnN0YW5jZSBmb3IgYSBkaXNwbGF5JyApO1xuXG4gICAgZnVuY3Rpb24gYXVkaXQoIGZha2VJbnN0YW5jZTogRmFrZUluc3RhbmNlLCBwZG9tSW5zdGFuY2U6IFBET01JbnN0YW5jZSApOiB2b2lkIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZha2VJbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGggPT09IHBkb21JbnN0YW5jZS5jaGlsZHJlbi5sZW5ndGgsXG4gICAgICAgICdEaWZmZXJlbnQgbnVtYmVyIG9mIGNoaWxkcmVuIGluIGFjY2Vzc2libGUgaW5zdGFuY2UnICk7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZha2VJbnN0YW5jZS5ub2RlID09PSBwZG9tSW5zdGFuY2Uubm9kZSwgJ05vZGUgbWlzbWF0Y2ggZm9yIFBET01JbnN0YW5jZScgKTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGRvbUluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBhdWRpdCggZmFrZUluc3RhbmNlLmNoaWxkcmVuWyBpIF0sIHBkb21JbnN0YW5jZS5jaGlsZHJlblsgaSBdICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzVmlzaWJsZSA9IHBkb21JbnN0YW5jZS5pc0dsb2JhbGx5VmlzaWJsZSgpO1xuXG4gICAgICBsZXQgc2hvdWxkQmVWaXNpYmxlID0gdHJ1ZTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBkb21JbnN0YW5jZS50cmFpbCEubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBwZG9tSW5zdGFuY2UudHJhaWwhLm5vZGVzWyBpIF07XG4gICAgICAgIGNvbnN0IHRyYWlscyA9IG5vZGUuZ2V0VHJhaWxzVG8oIHJvb3ROb2RlICkuZmlsdGVyKCB0cmFpbCA9PiB0cmFpbC5pc1BET01WaXNpYmxlKCkgKTtcbiAgICAgICAgaWYgKCB0cmFpbHMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgIHNob3VsZEJlVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzVmlzaWJsZSA9PT0gc2hvdWxkQmVWaXNpYmxlLCAnSW5zdGFuY2UgdmlzaWJpbGl0eSBtaXNtYXRjaCcgKTtcbiAgICB9XG5cbiAgICBhdWRpdCggUERPTUluc3RhbmNlLmNyZWF0ZUZha2VQRE9NVHJlZSggcm9vdE5vZGUgKSwgdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbmNlIGEgXCJUcmFpbFwiIG9uIFBET01JbnN0YW5jZSBjYW4gaGF2ZSBkaXNjb250aW51b3VzIGp1bXBzIChkdWUgdG8gcGRvbU9yZGVyKSwgdGhpcyBmaW5kcyB0aGUgYmVzdFxuICAgKiBhY3R1YWwgdmlzdWFsIFRyYWlsIHRvIHVzZSwgZnJvbSB0aGUgdHJhaWwgb2YgYSBQRE9NSW5zdGFuY2UgdG8gdGhlIHJvb3Qgb2YgYSBEaXNwbGF5LlxuICAgKlxuICAgKiBAcGFyYW0gdHJhaWwgLSB0cmFpbCBvZiB0aGUgUERPTUluc3RhbmNlLCB3aGljaCBjYW4gY29udGFpbmUgXCJnYXBzXCJcbiAgICogQHBhcmFtIHJvb3ROb2RlIC0gcm9vdCBvZiBhIERpc3BsYXlcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ3Vlc3NWaXN1YWxUcmFpbCggdHJhaWw6IFRyYWlsLCByb290Tm9kZTogTm9kZSApOiBUcmFpbCB7XG4gICAgdHJhaWwucmVpbmRleCgpO1xuXG4gICAgLy8gU2VhcmNoIGZvciBwbGFjZXMgaW4gdGhlIHRyYWlsIHdoZXJlIGFkamFjZW50IG5vZGVzIGRvIE5PVCBoYXZlIGEgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcCwgaS5lLlxuICAgIC8vICFub2Rlc1sgbiBdLmhhc0NoaWxkKCBub2Rlc1sgbiArIDEgXSApLlxuICAgIC8vIE5PVEU6IFRoaXMgaW5kZXggcG9pbnRzIHRvIHRoZSBwYXJlbnQgd2hlcmUgdGhpcyBpcyB0aGUgY2FzZSwgYmVjYXVzZSB0aGUgaW5kaWNlcyBpbiB0aGUgdHJhaWwgYXJlIHN1Y2ggdGhhdDpcbiAgICAvLyB0cmFpbC5ub2Rlc1sgbiBdLmNoaWxkcmVuWyB0cmFpbC5pbmRpY2VzWyBuIF0gXSA9IHRyYWlsLm5vZGVzWyBuICsgMSBdXG4gICAgY29uc3QgbGFzdEJhZEluZGV4ID0gdHJhaWwuaW5kaWNlcy5sYXN0SW5kZXhPZiggLTEgKTtcblxuICAgIC8vIElmIHdlIGhhdmUgbm8gYmFkIGluZGljZXMsIGp1c3QgcmV0dXJuIG91ciB0cmFpbCBpbW1lZGlhdGVseS5cbiAgICBpZiAoIGxhc3RCYWRJbmRleCA8IDAgKSB7XG4gICAgICByZXR1cm4gdHJhaWw7XG4gICAgfVxuXG4gICAgY29uc3QgZmlyc3RHb29kSW5kZXggPSBsYXN0QmFkSW5kZXggKyAxO1xuICAgIGNvbnN0IGZpcnN0R29vZE5vZGUgPSB0cmFpbC5ub2Rlc1sgZmlyc3RHb29kSW5kZXggXTtcbiAgICBjb25zdCBiYXNlVHJhaWxzID0gZmlyc3RHb29kTm9kZS5nZXRUcmFpbHNUbyggcm9vdE5vZGUgKTtcblxuICAgIC8vIGZpcnN0R29vZE5vZGUgbWlnaHQgbm90IGJlIGF0dGFjaGVkIHRvIGEgRGlzcGxheSBlaXRoZXIhIE1heWJlIGNsaWVudCBqdXN0IGhhc24ndCBnb3R0ZW4gdG8gaXQgeWV0LCBzbyB3ZVxuICAgIC8vIGZhaWwgZ3JhY2VmdWxseS1pc2g/XG4gICAgLy8gYXNzZXJ0ICYmIGFzc2VydCggYmFzZVRyYWlscy5sZW5ndGggPiAwLCAnXCJnb29kIG5vZGVcIiBpbiB0cmFpbCB3aXRoIGdhcCBub3QgYXR0YWNoZWQgdG8gcm9vdCcpXG4gICAgaWYgKCBiYXNlVHJhaWxzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybiB0cmFpbDtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIHJlc3Qgb2YgdGhlIHRyYWlsIGJhY2sgaW5cbiAgICBjb25zdCBiYXNlVHJhaWwgPSBiYXNlVHJhaWxzWyAwIF07XG4gICAgZm9yICggbGV0IGkgPSBmaXJzdEdvb2RJbmRleCArIDE7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJhc2VUcmFpbC5hZGREZXNjZW5kYW50KCB0cmFpbC5ub2Rlc1sgaSBdICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFzZVRyYWlsLmlzVmFsaWQoKSwgYHRyYWlsIG5vdCB2YWxpZDogJHt0cmFpbC51bmlxdWVJZH1gICk7XG5cbiAgICByZXR1cm4gYmFzZVRyYWlsO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBmYWtlIFBET01JbnN0YW5jZS1saWtlIHRyZWUgc3RydWN0dXJlICh3aXRoIHRoZSBlcXVpdmFsZW50IG5vZGVzIGFuZCBjaGlsZHJlbiBzdHJ1Y3R1cmUpLlxuICAgKiBGb3IgZGVidWdnaW5nLlxuICAgKlxuICAgKiBAcmV0dXJucyBUeXBlIEZha2VQRE9NSW5zdGFuY2U6IHsgbm9kZToge05vZGV9LCBjaGlsZHJlbjoge0FycmF5LjxGYWtlUERPTUluc3RhbmNlPn0gfVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlRmFrZVBET01UcmVlKCByb290Tm9kZTogTm9kZSApOiBGYWtlSW5zdGFuY2Uge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUZha2VUcmVlKCBub2RlOiBOb2RlICk6IG9iamVjdCB7XG4gICAgICBsZXQgZmFrZUluc3RhbmNlcyA9IF8uZmxhdHRlbiggbm9kZS5nZXRFZmZlY3RpdmVDaGlsZHJlbigpLm1hcCggY3JlYXRlRmFrZVRyZWUgKSApIGFzIEZha2VJbnN0YW5jZVtdO1xuICAgICAgaWYgKCBub2RlLmhhc1BET01Db250ZW50ICkge1xuICAgICAgICBmYWtlSW5zdGFuY2VzID0gWyB7XG4gICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICBjaGlsZHJlbjogZmFrZUluc3RhbmNlc1xuICAgICAgICB9IF07XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFrZUluc3RhbmNlcztcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbm9kZTogbnVsbCxcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgY2hpbGRyZW46IGNyZWF0ZUZha2VUcmVlKCByb290Tm9kZSApXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcmVlVG9Qb29sKCk6IHZvaWQge1xuICAgIFBET01JbnN0YW5jZS5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgcG9vbCA9IG5ldyBQb29sKCBQRE9NSW5zdGFuY2UsIHtcbiAgICBpbml0aWFsaXplOiBQRE9NSW5zdGFuY2UucHJvdG90eXBlLmluaXRpYWxpemVQRE9NSW5zdGFuY2VcbiAgfSApO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUERPTUluc3RhbmNlJywgUERPTUluc3RhbmNlICk7XG5cblxuZXhwb3J0IGRlZmF1bHQgUERPTUluc3RhbmNlOyJdLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJjbGVhbkFycmF5IiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiUG9vbCIsIkZvY3VzTWFuYWdlciIsIk5vZGUiLCJQRE9NUGVlciIsIlBET01VdGlscyIsInNjZW5lcnkiLCJUcmFpbCIsIlRyYW5zZm9ybVRyYWNrZXIiLCJQRE9NVW5pcXVlSWRTdHJhdGVneSIsIklORElDRVMiLCJUUkFJTF9JRCIsImVudW1lcmF0aW9uIiwiVU5JUVVFX0lEX1NUUkFURUdZIiwiZ2xvYmFsSWQiLCJQRE9NSW5zdGFuY2UiLCJpbml0aWFsaXplUERPTUluc3RhbmNlIiwicGFyZW50IiwiZGlzcGxheSIsInRyYWlsIiwiYXNzZXJ0IiwiaWQiLCJpc0Rpc3Bvc2VkIiwiaXNSb290SW5zdGFuY2UiLCJub2RlIiwibGFzdE5vZGUiLCJjaGlsZHJlbiIsImFkZFBET01JbnN0YW5jZSIsImludmlzaWJsZUNvdW50IiwicmVsYXRpdmVOb2RlcyIsInJlbGF0aXZlVmlzaWJpbGl0aWVzIiwicmVsYXRpdmVMaXN0ZW5lcnMiLCJ0cmFuc2Zvcm1UcmFja2VyIiwidXBkYXRlVHJhbnNmb3JtVHJhY2tlciIsInBkb21UcmFuc2Zvcm1Tb3VyY2VOb2RlIiwiYWNjZXNzaWJpbGl0eUNvbnRhaW5lciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInBlZXIiLCJjcmVhdGVGcm9tUG9vbCIsInByaW1hcnlTaWJsaW5nIiwidXBkYXRlIiwicGFyZW50VHJhaWwiLCJpIiwibGVuZ3RoIiwicmVsYXRpdmVOb2RlIiwibm9kZXMiLCJwdXNoIiwicGRvbURpc3BsYXlzIiwiX3Bkb21EaXNwbGF5c0luZm8iLCJpc1Zpc2libGUiLCJfIiwiaW5jbHVkZXMiLCJsaXN0ZW5lciIsImNoZWNrQWNjZXNzaWJsZURpc3BsYXlWaXNpYmlsaXR5IiwiYmluZCIsInBkb21EaXNwbGF5c0VtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInVwZGF0ZVZpc2liaWxpdHkiLCJzY2VuZXJ5TG9nIiwidG9TdHJpbmciLCJhZGRDb25zZWN1dGl2ZUluc3RhbmNlcyIsInBkb21JbnN0YW5jZXMiLCJtYXAiLCJpbnN0Iiwiam9pbiIsImhhZENoaWxkcmVuIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsImluc2VydEVsZW1lbnRzIiwidG9wTGV2ZWxFbGVtZW50cyIsInNvcnRDaGlsZHJlbiIsImlubmVyQ29udGVudCIsInVwZGF0ZURlc2NlbmRhbnRQZWVySWRzIiwicG9wIiwicmVtb3ZlSW5zdGFuY2VzRm9yVHJhaWwiLCJjaGlsZEluc3RhbmNlIiwiY2hpbGRUcmFpbCIsImRpZmZlcnMiLCJqIiwic3BsaWNlIiwiZGlzcG9zZSIsInJlbW92ZUFsbENoaWxkcmVuIiwiZmluZENoaWxkV2l0aFRyYWlsIiwiY2hpbGQiLCJlcXVhbHMiLCJyZW1vdmVTdWJ0cmVlIiwiaXNFeHRlbnNpb25PZiIsImluZGV4IiwiaXNOb2RlVmlzaWJsZSIsIndhc05vZGVWaXNpYmxlIiwid2FzVmlzaWJsZSIsInNldFZpc2libGUiLCJwZG9tRm9jdXNlZE5vZGUiLCJjb250YWluc05vZGUiLCJwZG9tRm9jdXMiLCJpc0dsb2JhbGx5VmlzaWJsZSIsImdldENoaWxkT3JkZXJpbmciLCJlZmZlY3RpdmVDaGlsZHJlbiIsImdldEVmZmVjdGl2ZUNoaWxkcmVuIiwiaW5zdGFuY2VzIiwiaGFzUERPTUNvbnRlbnQiLCJwb3RlbnRpYWxJbnN0YW5jZXMiLCJpbnN0YW5jZUxvb3AiLCJwb3RlbnRpYWxJbnN0YW5jZSIsImFkZERlc2NlbmRhbnQiLCJyZW1vdmVEZXNjZW5kYW50Iiwibm9kZUZvclRyYWlsIiwicm9vdE5vZGUiLCJ0YXJnZXRDaGlsZHJlbiIsImZvY3VzZWRUcmFpbCIsImNoaWxkTm9kZXMiLCJmb2N1c2VkQ2hpbGRJbnN0YW5jZSIsImZpbmQiLCJkZXNpcmVkT3JkZXIiLCJmbGF0dGVuIiwibmVlZHNPcmRlckNoYW5nZSIsImV2ZXJ5IiwiZGVzaXJlZEVsZW1lbnQiLCJwaXZvdEVsZW1lbnQiLCJnZXRUb3BMZXZlbEVsZW1lbnRDb250YWluaW5nUHJpbWFyeVNpYmxpbmciLCJwaXZvdEluZGV4IiwiaW5kZXhPZiIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwicGVlckluZGV4IiwiZWxlbWVudEluZGV4IiwiZWxlbWVudCIsInRyYWNrZWRUcmFpbCIsImdldFVuaXF1ZVRyYWlsIiwiZ3Vlc3NWaXN1YWxUcmFpbCIsImdldFBET01JbnN0YW5jZVVuaXF1ZUlkIiwiaW5kaWNlc1N0cmluZyIsInBkb21JbnN0YW5jZSIsIm5leHREb3VibGUiLCJ1bnNoaWZ0IiwiUERPTV9VTklRVUVfSURfU0VQQVJBVE9SIiwiZ2V0VW5pcXVlSWQiLCJ0b1VwZGF0ZSIsImZyb20iLCJzaGlmdCIsInVwZGF0ZUluZGljZXNTdHJpbmdBbmRFbGVtZW50SWRzIiwidW5pcXVlSWRUb1RyYWlsIiwidW5pcXVlSWQiLCJnZXRUcmFpbEZyb21QRE9NSW5kaWNlc1N0cmluZyIsImZyb21VbmlxdWVJZCIsInRoaXNQZWVyIiwicmVtb3ZlRWxlbWVudHMiLCJyZW1vdmVMaXN0ZW5lciIsInJlbW92ZVBET01JbnN0YW5jZSIsImZyZWVUb1Bvb2wiLCJhdWRpdFJvb3QiLCJhdWRpdCIsImZha2VJbnN0YW5jZSIsInNob3VsZEJlVmlzaWJsZSIsInRyYWlscyIsImdldFRyYWlsc1RvIiwiZmlsdGVyIiwiaXNQRE9NVmlzaWJsZSIsImNyZWF0ZUZha2VQRE9NVHJlZSIsInJlaW5kZXgiLCJsYXN0QmFkSW5kZXgiLCJpbmRpY2VzIiwibGFzdEluZGV4T2YiLCJmaXJzdEdvb2RJbmRleCIsImZpcnN0R29vZE5vZGUiLCJiYXNlVHJhaWxzIiwiYmFzZVRyYWlsIiwiaXNWYWxpZCIsImNyZWF0ZUZha2VUcmVlIiwiZmFrZUluc3RhbmNlcyIsInBvb2wiLCJpbml0aWFsaXplIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQyxHQUVELE9BQU9BLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGdCQUFnQix5Q0FBeUM7QUFDaEUsT0FBT0MsaUJBQWlCLDBDQUEwQztBQUNsRSxPQUFPQyxzQkFBc0IsK0NBQStDO0FBQzVFLE9BQU9DLFVBQVUsbUNBQW1DO0FBQ3BELFNBQWtCQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxnQkFBZ0IsUUFBUSxtQkFBbUI7QUFFdEgsMklBQTJJO0FBQzNJLElBQUEsQUFBTUMsdUJBQU4sTUFBTUEsNkJBQTZCVDtBQUtuQztBQUxNUyxxQkFDbUJDLFVBQVUsSUFBSUQ7QUFEakNBLHFCQUVtQkUsV0FBVyxJQUFJRjtBQUZsQ0EscUJBSW1CRyxjQUFjLElBQUliLFlBQWFVO0FBU3hELGlIQUFpSDtBQUNqSCxxSEFBcUg7QUFDckgsa0hBQWtIO0FBQ2xILG9HQUFvRztBQUNwRyxNQUFNSSxxQkFBcUJKLHFCQUFxQkUsUUFB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