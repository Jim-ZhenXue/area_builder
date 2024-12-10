// Copyright 2013-2024, University of Colorado Boulder
/**
 * Represents a trail (path in the graph) from a 'root' node down to a descendant node.
 * In a DAG, or with different views, there can be more than one trail up from a node,
 * even to the same root node!
 *
 * It has an array of nodes, in order from the 'root' down to the last node,
 * a length, and an array of indices such that node_i.children[index_i] === node_{i+1}.
 *
 * The indices can sometimes become stale when nodes are added and removed, so Trails
 * can have their indices updated with reindex(). It's designed to be as fast as possible
 * on Trails that are already indexed accurately.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import { Node, PDOMUtils, scenery, TrailPointer } from '../imports.js';
// constants
const ID_SEPARATOR = PDOMUtils.PDOM_UNIQUE_ID_SEPARATOR;
let Trail = class Trail {
    /**
   * Returns a copy of this Trail that can be modified independently
   */ copy() {
        return new Trail(this);
    }
    /**
   * Whether the leaf-most Node in our trail will render something (scenery-internal)
   */ isPainted() {
        return this.lastNode().isPainted();
    }
    /**
   * Whether all nodes in the trail are still connected from the trail's root to its leaf.
   */ isValid() {
        this.reindex();
        const indexLength = this.indices.length;
        for(let i = 0; i < indexLength; i++){
            if (this.indices[i] < 0) {
                return false;
            }
        }
        return true;
    }
    /**
   * This trail is visible only if all nodes on it are marked as visible
   */ isVisible() {
        let i = this.nodes.length;
        while(i--){
            if (!this.nodes[i].isVisible()) {
                return false;
            }
        }
        return true;
    }
    /**
   * This trail is pdomVisible only if all nodes on it are marked as pdomVisible
   */ isPDOMVisible() {
        let i = this.nodes.length;
        while(i--){
            if (!this.nodes[i].isVisible() || !this.nodes[i].isPDOMVisible()) {
                return false;
            }
        }
        return true;
    }
    getOpacity() {
        let opacity = 1;
        let i = this.nodes.length;
        while(i--){
            opacity *= this.nodes[i].getOpacity();
        }
        return opacity;
    }
    /**
   * Essentially whether this node is visited in the hit-testing operation
   */ isPickable() {
        // it won't be if it or any ancestor is pickable: false, or is invisible
        if (_.some(this.nodes, (node)=>node.pickable === false || !node.visible)) {
            return false;
        }
        // if there is any listener or pickable: true, it will be pickable
        if (_.some(this.nodes, (node)=>node._inputListeners.length > 0 || node.pickableProperty.value === true)) {
            return true;
        }
        // no listeners or pickable: true, so it will be pruned
        return false;
    }
    get(index) {
        if (index >= 0) {
            return this.nodes[index];
        } else {
            // negative index goes from the end of the array
            return this.nodes[this.nodes.length + index];
        }
    }
    slice(startIndex, endIndex) {
        return new Trail(this.nodes.slice(startIndex, endIndex));
    }
    /**
   * TODO: consider renaming to subtrailToExcluding and subtrailToIncluding? https://github.com/phetsims/scenery/issues/1581
   */ subtrailTo(node, excludeNode = false) {
        return this.slice(0, _.indexOf(this.nodes, node) + (excludeNode ? 0 : 1));
    }
    isEmpty() {
        return this.nodes.length === 0;
    }
    /**
   * Returns the matrix multiplication of our selected nodes transformation matrices.
   *
   * @param startingIndex - Include nodes matrices starting from this index (inclusive)
   * @param endingIndex - Include nodes matrices up to this index (exclusive)
   */ getMatrixConcatenation(startingIndex, endingIndex) {
        // TODO: performance: can we cache this ever? would need the rootNode to not really change in between https://github.com/phetsims/scenery/issues/1581
        // this matrix will be modified in place, so always start fresh
        const matrix = Matrix3.identity();
        // from the root up
        const nodes = this.nodes;
        for(let i = startingIndex; i < endingIndex; i++){
            matrix.multiplyMatrix(nodes[i].getMatrix());
        }
        return matrix;
    }
    /**
   * From local to global
   *
   * e.g. local coordinate frame of the leaf node to the parent coordinate frame of the root node
   */ getMatrix() {
        return this.getMatrixConcatenation(0, this.nodes.length);
    }
    /**
   * From local to next-to-global (ignores root node matrix)
   *
   * e.g. local coordinate frame of the leaf node to the local coordinate frame of the root node
   */ getAncestorMatrix() {
        return this.getMatrixConcatenation(1, this.nodes.length);
    }
    /**
   * From parent to global
   *
   * e.g. parent coordinate frame of the leaf node to the parent coordinate frame of the root node
   */ getParentMatrix() {
        return this.getMatrixConcatenation(0, this.nodes.length - 1);
    }
    /**
   * From parent to next-to-global (ignores root node matrix)
   *
   * e.g. parent coordinate frame of the leaf node to the local coordinate frame of the root node
   */ getAncestorParentMatrix() {
        return this.getMatrixConcatenation(1, this.nodes.length - 1);
    }
    /**
   * From local to global
   *
   * e.g. local coordinate frame of the leaf node to the parent coordinate frame of the root node
   */ getTransform() {
        return new Transform3(this.getMatrix());
    }
    /**
   * From parent to global
   *
   * e.g. parent coordinate frame of the leaf node to the parent coordinate frame of the root node
   */ getParentTransform() {
        return new Transform3(this.getParentMatrix());
    }
    addAncestor(node, index) {
        assert && assert(!this.immutable, 'cannot modify an immutable Trail with addAncestor');
        assert && assert(node, 'cannot add falsy value to a Trail');
        if (this.nodes.length) {
            const oldRoot = this.nodes[0];
            this.indices.unshift(index === undefined ? _.indexOf(node._children, oldRoot) : index);
        }
        this.nodes.unshift(node);
        this.length++;
        // accelerated version of this.updateUniqueId()
        this.uniqueId = this.uniqueId ? node.id + ID_SEPARATOR + this.uniqueId : `${node.id}`;
        return this;
    }
    removeAncestor() {
        assert && assert(!this.immutable, 'cannot modify an immutable Trail with removeAncestor');
        assert && assert(this.length > 0, 'cannot remove a Node from an empty trail');
        this.nodes.shift();
        if (this.indices.length) {
            this.indices.shift();
        }
        this.length--;
        this.updateUniqueId();
        return this;
    }
    addDescendant(node, index) {
        assert && assert(!this.immutable, 'cannot modify an immutable Trail with addDescendant');
        assert && assert(node, 'cannot add falsy value to a Trail');
        if (this.nodes.length) {
            const parent = this.lastNode();
            this.indices.push(index === undefined ? _.indexOf(parent._children, node) : index);
        }
        this.nodes.push(node);
        this.length++;
        // accelerated version of this.updateUniqueId()
        this.uniqueId = this.uniqueId ? this.uniqueId + ID_SEPARATOR + node.id : `${node.id}`;
        return this;
    }
    removeDescendant() {
        assert && assert(!this.immutable, 'cannot modify an immutable Trail with removeDescendant');
        assert && assert(this.length > 0, 'cannot remove a Node from an empty trail');
        this.nodes.pop();
        if (this.indices.length) {
            this.indices.pop();
        }
        this.length--;
        this.updateUniqueId();
        return this;
    }
    addDescendantTrail(trail) {
        const length = trail.length;
        if (length) {
            this.addDescendant(trail.nodes[0]);
        }
        for(let i = 1; i < length; i++){
            this.addDescendant(trail.nodes[i], this.indices[i - 1]);
        }
    }
    removeDescendantTrail(trail) {
        const length = trail.length;
        for(let i = length - 1; i >= 0; i--){
            assert && assert(this.lastNode() === trail.nodes[i]);
            this.removeDescendant();
        }
    }
    /**
   * Refreshes the internal index references (important if any children arrays were modified!)
   */ reindex() {
        const length = this.length;
        for(let i = 1; i < length; i++){
            // only replace indices where they have changed (this was a performance hotspot)
            const currentIndex = this.indices[i - 1];
            const baseNode = this.nodes[i - 1];
            if (baseNode._children[currentIndex] !== this.nodes[i]) {
                this.indices[i - 1] = _.indexOf(baseNode._children, this.nodes[i]);
            }
        }
    }
    setImmutable() {
        // if assertions are disabled, we hope this is inlined as a no-op
        if (assert) {
            assert(this.immutable !== false, 'A trail cannot be made immutable after being flagged as mutable');
            this.immutable = true;
        }
        // TODO: consider setting mutators to null here instead of the function call check (for performance, and profile the differences) https://github.com/phetsims/scenery/issues/1581
        return this; // allow chaining
    }
    setMutable() {
        // if assertions are disabled, we hope this is inlined as a no-op
        if (assert) {
            assert(this.immutable !== true, 'A trail cannot be made mutable after being flagged as immutable');
            this.immutable = false;
        }
        return this; // allow chaining
    }
    areIndicesValid() {
        for(let i = 1; i < this.length; i++){
            const currentIndex = this.indices[i - 1];
            if (this.nodes[i - 1]._children[currentIndex] !== this.nodes[i]) {
                return false;
            }
        }
        return true;
    }
    equals(other) {
        if (this.length !== other.length) {
            return false;
        }
        for(let i = 0; i < this.nodes.length; i++){
            if (this.nodes[i] !== other.nodes[i]) {
                return false;
            }
        }
        return true;
    }
    /**
   * Returns a new Trail from the root up to the parameter node.
   */ upToNode(node) {
        const nodeIndex = _.indexOf(this.nodes, node);
        assert && assert(nodeIndex >= 0, 'Trail does not contain the node');
        return this.slice(0, _.indexOf(this.nodes, node) + 1);
    }
    /**
   * Whether this trail contains the complete 'other' trail, but with added descendants afterwards.
   *
   * @param other - is other a subset of this trail?
   * @param allowSameTrail
   */ isExtensionOf(other, allowSameTrail) {
        if (this.length <= other.length - (allowSameTrail ? 1 : 0)) {
            return false;
        }
        for(let i = 0; i < other.nodes.length; i++){
            if (this.nodes[i] !== other.nodes[i]) {
                return false;
            }
        }
        return true;
    }
    /**
   * Returns whether a given node is contained in the trail.
   */ containsNode(node) {
        return _.includes(this.nodes, node);
    }
    /**
   * A transform from our local coordinate frame to the other trail's local coordinate frame
   */ getTransformTo(otherTrail) {
        return new Transform3(this.getMatrixTo(otherTrail));
    }
    /**
   * Returns a matrix that transforms a point in our last node's local coordinate frame to the other trail's last node's
   * local coordinate frame
   */ getMatrixTo(otherTrail) {
        this.reindex();
        otherTrail.reindex();
        const branchIndex = this.getBranchIndexTo(otherTrail);
        let idx;
        let matrix = Matrix3.IDENTITY;
        // walk our transform down, prepending
        for(idx = this.length - 1; idx >= branchIndex; idx--){
            matrix = this.nodes[idx].getMatrix().timesMatrix(matrix);
        }
        // walk our transform up, prepending inverses
        for(idx = branchIndex; idx < otherTrail.length; idx++){
            matrix = otherTrail.nodes[idx].getTransform().getInverse().timesMatrix(matrix);
        }
        return matrix;
    }
    /**
   * Returns the first index that is different between this trail and the other trail.
   *
   * If the trails are identical, the index should be equal to the trail's length.
   */ getBranchIndexTo(otherTrail) {
        assert && assert(this.nodes[0] === otherTrail.nodes[0], 'To get a branch index, the trails must have the same root');
        let branchIndex;
        const min = Math.min(this.length, otherTrail.length);
        for(branchIndex = 0; branchIndex < min; branchIndex++){
            if (this.nodes[branchIndex] !== otherTrail.nodes[branchIndex]) {
                break;
            }
        }
        return branchIndex;
    }
    /**
   * Returns the last (largest) index into the trail's nodes that has inputEnabled=true.
   */ getLastInputEnabledIndex() {
        // Determine how far up the Trail input is determined. The first node with !inputEnabled and after will not have
        // events fired (see https://github.com/phetsims/sun/issues/257)
        let trailStartIndex = -1;
        for(let j = 0; j < this.length; j++){
            if (!this.nodes[j].inputEnabled) {
                break;
            }
            trailStartIndex = j;
        }
        return trailStartIndex;
    }
    /**
   * Returns the leaf-most index, unless there is a Node with inputEnabled=false (in which case, the lowest index
   * for those matching Nodes are returned).
   */ getCursorCheckIndex() {
        return this.getLastInputEnabledIndex();
    }
    /**
   * TODO: phase out in favor of get() https://github.com/phetsims/scenery/issues/1581
   */ nodeFromTop(offset) {
        return this.nodes[this.length - 1 - offset];
    }
    lastNode() {
        return this.nodeFromTop(0);
    }
    rootNode() {
        return this.nodes[0];
    }
    /**
   * Returns the previous graph trail in the order of self-rendering
   */ previous() {
        if (this.nodes.length <= 1) {
            return null;
        }
        const top = this.nodeFromTop(0);
        const parent = this.nodeFromTop(1);
        const parentIndex = _.indexOf(parent._children, top);
        assert && assert(parentIndex !== -1);
        const arr = this.nodes.slice(0, this.nodes.length - 1);
        if (parentIndex === 0) {
            // we were the first child, so give it the trail to the parent
            return new Trail(arr);
        } else {
            // previous child
            arr.push(parent._children[parentIndex - 1]);
            // and find its last terminal
            while(arr[arr.length - 1]._children.length !== 0){
                const last = arr[arr.length - 1];
                arr.push(last._children[last._children.length - 1]);
            }
            return new Trail(arr);
        }
    }
    /**
   * Like previous(), but keeps moving back until the trail goes to a node with isPainted() === true
   */ previousPainted() {
        let result = this.previous();
        while(result && !result.isPainted()){
            result = result.previous();
        }
        return result;
    }
    /**
   * In the order of self-rendering
   */ next() {
        const arr = this.nodes.slice(0);
        const top = this.nodeFromTop(0);
        if (top._children.length > 0) {
            // if we have children, return the first child
            arr.push(top._children[0]);
            return new Trail(arr);
        } else {
            // walk down and attempt to find the next parent
            let depth = this.nodes.length - 1;
            while(depth > 0){
                const node = this.nodes[depth];
                const parent = this.nodes[depth - 1];
                arr.pop(); // take off the node so we can add the next sibling if it exists
                const index = _.indexOf(parent._children, node);
                if (index !== parent._children.length - 1) {
                    // there is another (later) sibling. use that!
                    arr.push(parent._children[index + 1]);
                    return new Trail(arr);
                } else {
                    depth--;
                }
            }
            // if we didn't reach a later sibling by now, it doesn't exist
            return null;
        }
    }
    /**
   * Like next(), but keeps moving back until the trail goes to a node with isPainted() === true
   */ nextPainted() {
        let result = this.next();
        while(result && !result.isPainted()){
            result = result.next();
        }
        return result;
    }
    /**
   * Calls callback( trail ) for this trail, and each descendant trail. If callback returns true, subtree will be skipped
   */ eachTrailUnder(callback) {
        // TODO: performance: should be optimized to be much faster, since we don't have to deal with the before/after https://github.com/phetsims/scenery/issues/1581
        new TrailPointer(this, true).eachTrailBetween(new TrailPointer(this, false), callback);
    }
    /**
   * Standard Java-style compare. -1 means this trail is before (under) the other trail, 0 means equal, and 1 means this trail is
   * after (on top of) the other trail.
   * A shorter subtrail will compare as -1.
   *
   * Assumes that the Trails are properly indexed. If not, please reindex them!
   *
   * Comparison is for the rendering order, so an ancestor is 'before' a descendant
   */ compare(other) {
        assert && assert(!this.isEmpty(), 'cannot compare with an empty trail');
        assert && assert(!other.isEmpty(), 'cannot compare with an empty trail');
        assert && assert(this.nodes[0] === other.nodes[0], 'for Trail comparison, trails must have the same root node');
        assertSlow && assertSlow(this.areIndicesValid(), `Trail.compare this.areIndicesValid() failed on ${this.toString()}`);
        assertSlow && assertSlow(other.areIndicesValid(), `Trail.compare other.areIndicesValid() failed on ${other.toString()}`);
        const minNodeIndex = Math.min(this.nodes.length, other.nodes.length);
        for(let i = 0; i < minNodeIndex; i++){
            if (this.nodes[i] !== other.nodes[i]) {
                if (this.nodes[i - 1].children.indexOf(this.nodes[i]) < other.nodes[i - 1].children.indexOf(other.nodes[i])) {
                    return -1;
                } else {
                    return 1;
                }
            }
        }
        // we scanned through and no nodes were different (one is a subtrail of the other)
        if (this.nodes.length < other.nodes.length) {
            return -1;
        } else if (this.nodes.length > other.nodes.length) {
            return 1;
        } else {
            return 0;
        }
    }
    isBefore(other) {
        return this.compare(other) === -1;
    }
    isAfter(other) {
        return this.compare(other) === 1;
    }
    localToGlobalPoint(point) {
        // TODO: performance: multiple timesVector2 calls up the chain is probably faster https://github.com/phetsims/scenery/issues/1581
        return this.getMatrix().timesVector2(point);
    }
    localToGlobalBounds(bounds) {
        return bounds.transformed(this.getMatrix());
    }
    globalToLocalPoint(point) {
        return this.getTransform().inversePosition2(point);
    }
    globalToLocalBounds(bounds) {
        return this.getTransform().inverseBounds2(bounds);
    }
    parentToGlobalPoint(point) {
        // TODO: performance: multiple timesVector2 calls up the chain is probably faster https://github.com/phetsims/scenery/issues/1581
        return this.getParentMatrix().timesVector2(point);
    }
    parentToGlobalBounds(bounds) {
        return bounds.transformed(this.getParentMatrix());
    }
    globalToParentPoint(point) {
        return this.getParentTransform().inversePosition2(point);
    }
    globalToParentBounds(bounds) {
        return this.getParentTransform().inverseBounds2(bounds);
    }
    updateUniqueId() {
        // string concatenation is faster, see http://jsperf.com/string-concat-vs-joins
        let result = '';
        const len = this.nodes.length;
        if (len > 0) {
            result += this.nodes[0]._id;
        }
        for(let i = 1; i < len; i++){
            result += ID_SEPARATOR + this.nodes[i]._id;
        }
        this.uniqueId = result;
    // this.uniqueId = _.map( this.nodes, function( node ) { return node.getId(); } ).join( '-' );
    }
    /**
   * Concatenates the unique IDs of nodes in the trail, so that we can do id-based lookups
   */ getUniqueId() {
        // sanity checks
        if (assert) {
            const oldUniqueId = this.uniqueId;
            this.updateUniqueId();
            assert(oldUniqueId === this.uniqueId);
        }
        return this.uniqueId;
    }
    /**
   * Returns a string form of this object
   */ toString() {
        this.reindex();
        if (!this.length) {
            return 'Empty Trail';
        }
        return `[Trail ${this.indices.join('.')} ${this.getUniqueId()}]`;
    }
    /**
   * Cleaner string form which will show class names. Not optimized by any means, meant for debugging.
   */ toPathString() {
        return _.map(this.nodes, (n)=>{
            let string = n.constructor.name;
            if (string === 'Node') {
                string = '.';
            }
            return string;
        }).join('/');
    }
    /**
   * Returns a debugging string ideal for logged output.
   */ toDebugString() {
        return `${this.toString()} ${this.toPathString()}`;
    }
    /**
   * Like eachTrailBetween, but only fires for painted trails. If callback returns true, subtree will be skipped
   */ static eachPaintedTrailBetween(a, b, callback, excludeEndTrails, rootNode) {
        Trail.eachTrailBetween(a, b, (trail)=>{
            if (trail.isPainted()) {
                return callback(trail);
            }
            return false;
        }, excludeEndTrails, rootNode);
    }
    /**
   * Global way of iterating across trails. when callback returns true, subtree will be skipped
   */ static eachTrailBetween(a, b, callback, excludeEndTrails, rootNode) {
        const aPointer = a ? new TrailPointer(a.copy(), true) : new TrailPointer(new Trail(rootNode), true);
        const bPointer = b ? new TrailPointer(b.copy(), true) : new TrailPointer(new Trail(rootNode), false);
        // if we are excluding endpoints, just bump the pointers towards each other by one step
        if (excludeEndTrails) {
            aPointer.nestedForwards();
            bPointer.nestedBackwards();
            // they were adjacent, so no callbacks will be executed
            if (aPointer.compareNested(bPointer) === 1) {
                return;
            }
        }
        aPointer.depthFirstUntil(bPointer, (pointer)=>{
            if (pointer.isBefore) {
                return callback(pointer.trail);
            }
            return false;
        }, false);
    }
    /**
   * The index at which the two trails diverge. If a.length === b.length === branchIndex, the trails are identical
   */ static branchIndex(a, b) {
        assert && assert(a.nodes[0] === b.nodes[0], 'Branch changes require roots to be the same');
        let branchIndex;
        const shortestLength = Math.min(a.length, b.length);
        for(branchIndex = 0; branchIndex < shortestLength; branchIndex++){
            if (a.nodes[branchIndex] !== b.nodes[branchIndex]) {
                break;
            }
        }
        return branchIndex;
    }
    /**
   * The subtrail from the root that both trails share
   */ static sharedTrail(a, b) {
        return a.slice(0, Trail.branchIndex(a, b));
    }
    /**
   * @param trailResults - Will be muted by appending matching trails
   * @param trail
   * @param predicate
   */ static appendAncestorTrailsWithPredicate(trailResults, trail, predicate) {
        const root = trail.rootNode();
        if (predicate(root)) {
            trailResults.push(trail.copy());
        }
        const parentCount = root._parents.length;
        for(let i = 0; i < parentCount; i++){
            const parent = root._parents[i];
            trail.addAncestor(parent);
            Trail.appendAncestorTrailsWithPredicate(trailResults, trail, predicate);
            trail.removeAncestor();
        }
    }
    /**
   * @param trailResults - Will be muted by appending matching trails
   * @param trail
   * @param predicate
   */ static appendDescendantTrailsWithPredicate(trailResults, trail, predicate) {
        const lastNode = trail.lastNode();
        if (predicate(lastNode)) {
            trailResults.push(trail.copy());
        }
        const childCount = lastNode._children.length;
        for(let i = 0; i < childCount; i++){
            const child = lastNode._children[i];
            trail.addDescendant(child, i);
            Trail.appendDescendantTrailsWithPredicate(trailResults, trail, predicate);
            trail.removeDescendant();
        }
    }
    /*
   * Fires subtree(trail) or self(trail) on the callbacks to create disjoint subtrees (trails) that cover exactly the nodes
   * inclusively between a and b in rendering order.
   * We try to consolidate these as much as possible.
   *
   * "a" and "b" are treated like self painted trails in the rendering order
   *
   *
   * Example tree:
   *   a
   *   - b
   *   --- c
   *   --- d
   *   - e
   *   --- f
   *   ----- g
   *   ----- h
   *   ----- i
   *   --- j
   *   ----- k
   *   - l
   *   - m
   *   --- n
   *
   * spannedSubtrees( a, a ) -> self( a );
   * spannedSubtrees( c, n ) -> subtree( a ); NOTE: if b is painted, that wouldn't work!
   * spannedSubtrees( h, l ) -> subtree( h ); subtree( i ); subtree( j ); self( l );
   * spannedSubtrees( c, i ) -> [b,f] --- wait, include e self?
   */ static spannedSubtrees(a, b) {
    // assert && assert( a.nodes[0] === b.nodes[0], 'Spanned subtrees for a and b requires that a and b have the same root' );
    // a.reindex();
    // b.reindex();
    // var subtrees = [];
    // var branchIndex = Trail.branchIndex( a, b );
    // assert && assert( branchIndex > 0, 'Branch index should always be > 0' );
    // if ( a.length === branchIndex && b.length === branchIndex ) {
    //   // the two trails are equal
    //   subtrees.push( a );
    // } else {
    //   // find the first place where our start isn't the first child
    //   for ( var before = a.length - 1; before >= branchIndex; before-- ) {
    //     if ( a.indices[before-1] !== 0 ) {
    //       break;
    //     }
    //   }
    //   // find the first place where our end isn't the last child
    //   for ( var after = a.length - 1; after >= branchIndex; after-- ) {
    //     if ( b.indices[after-1] !== b.nodes[after-1]._children.length - 1 ) {
    //       break;
    //     }
    //   }
    //   if ( before < branchIndex && after < branchIndex ) {
    //     // we span the entire tree up to nodes[branchIndex-1], so return only that subtree
    //     subtrees.push( a.slice( 0, branchIndex ) );
    //   } else {
    //     // walk the subtrees down from the start
    //     for ( var ia = before; ia >= branchIndex; ia-- ) {
    //       subtrees.push( a.slice( 0, ia + 1 ) );
    //     }
    //     // walk through the middle
    //     var iStart = a.indices[branchIndex-1];
    //     var iEnd = b.indices[branchIndex-1];
    //     var base = a.slice( 0, branchIndex );
    //     var children = base.lastNode()._children;
    //     for ( var im = iStart; im <= iEnd; im++ ) {
    //       subtrees.push( base.copy().addDescendant( children[im], im ) );
    //     }
    //     // walk the subtrees up to the end
    //     for ( var ib = branchIndex; ib <= after; ib++ ) {
    //       subtrees.push( b.slice( 0, ib + 1 ) );
    //     }
    //   }
    // }
    // return subtrees;
    }
    /**
   * Re-create a trail to a root node from an existing Trail id. The rootNode must have the same Id as the first
   * Node id of uniqueId.
   *
   * @param rootNode - the root of the trail being created
   * @param uniqueId - integers separated by ID_SEPARATOR, see getUniqueId
   */ static fromUniqueId(rootNode, uniqueId) {
        const trailIds = uniqueId.split(ID_SEPARATOR);
        const trailIdNumbers = trailIds.map((id)=>Number(id));
        let currentNode = rootNode;
        const rootId = trailIdNumbers.shift();
        const nodes = [
            currentNode
        ];
        assert && assert(rootId === rootNode.id);
        while(trailIdNumbers.length > 0){
            const trailId = trailIdNumbers.shift();
            // if accessible order is set, the trail might not match the hierarchy of children - search through nodes
            // in pdomOrder first because pdomOrder is an override for scene graph structure
            const pdomOrder = currentNode.pdomOrder || [];
            const children = pdomOrder.concat(currentNode.children);
            for(let j = 0; j < children.length; j++){
                // pdomOrder supports null entries to fill in with default order
                if (children[j] !== null && children[j].id === trailId) {
                    const childAlongTrail = children[j];
                    nodes.push(childAlongTrail);
                    currentNode = childAlongTrail;
                    break;
                }
                assert && assert(j !== children.length - 1, 'unable to find node from unique Trail id');
            }
        }
        return new Trail(nodes);
    }
    /**
   * @param [nodes]
   */ constructor(nodes){
        if (assert) {
            // Only do this if assertions are enabled, otherwise we won't access it at all
            this.immutable = undefined;
        }
        if (nodes instanceof Trail) {
            // copy constructor (takes advantage of already built index information)
            const otherTrail = nodes;
            this.nodes = otherTrail.nodes.slice(0);
            this.length = otherTrail.length;
            this.uniqueId = otherTrail.uniqueId;
            this.indices = otherTrail.indices.slice(0);
            return;
        }
        this.nodes = [];
        this.length = 0;
        this.uniqueId = '';
        this.indices = [];
        if (nodes) {
            if (nodes instanceof Node) {
                const node = nodes;
                // add just a single node in
                this.addDescendant(node);
            } else {
                // process it as an array
                const len = nodes.length;
                for(let i = 0; i < len; i++){
                    this.addDescendant(nodes[i]);
                }
            }
        }
    }
};
export { Trail as default };
scenery.register('Trail', Trail);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdHJhaWwgKHBhdGggaW4gdGhlIGdyYXBoKSBmcm9tIGEgJ3Jvb3QnIG5vZGUgZG93biB0byBhIGRlc2NlbmRhbnQgbm9kZS5cbiAqIEluIGEgREFHLCBvciB3aXRoIGRpZmZlcmVudCB2aWV3cywgdGhlcmUgY2FuIGJlIG1vcmUgdGhhbiBvbmUgdHJhaWwgdXAgZnJvbSBhIG5vZGUsXG4gKiBldmVuIHRvIHRoZSBzYW1lIHJvb3Qgbm9kZSFcbiAqXG4gKiBJdCBoYXMgYW4gYXJyYXkgb2Ygbm9kZXMsIGluIG9yZGVyIGZyb20gdGhlICdyb290JyBkb3duIHRvIHRoZSBsYXN0IG5vZGUsXG4gKiBhIGxlbmd0aCwgYW5kIGFuIGFycmF5IG9mIGluZGljZXMgc3VjaCB0aGF0IG5vZGVfaS5jaGlsZHJlbltpbmRleF9pXSA9PT0gbm9kZV97aSsxfS5cbiAqXG4gKiBUaGUgaW5kaWNlcyBjYW4gc29tZXRpbWVzIGJlY29tZSBzdGFsZSB3aGVuIG5vZGVzIGFyZSBhZGRlZCBhbmQgcmVtb3ZlZCwgc28gVHJhaWxzXG4gKiBjYW4gaGF2ZSB0aGVpciBpbmRpY2VzIHVwZGF0ZWQgd2l0aCByZWluZGV4KCkuIEl0J3MgZGVzaWduZWQgdG8gYmUgYXMgZmFzdCBhcyBwb3NzaWJsZVxuICogb24gVHJhaWxzIHRoYXQgYXJlIGFscmVhZHkgaW5kZXhlZCBhY2N1cmF0ZWx5LlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVHJhbnNmb3JtMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVHJhbnNmb3JtMy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBOb2RlLCBQRE9NVXRpbHMsIHNjZW5lcnksIFRyYWlsUG9pbnRlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IElEX1NFUEFSQVRPUiA9IFBET01VdGlscy5QRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1I7XG5cbmV4cG9ydCB0eXBlIFRyYWlsQ2FsbGJhY2sgPSAoICggdHJhaWw6IFRyYWlsICkgPT4gYm9vbGVhbiApIHwgKCAoIHRyYWlsOiBUcmFpbCApID0+IHZvaWQgKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhaWwge1xuXG4gIC8vIFRoZSBtYWluIG5vZGVzIG9mIHRoZSB0cmFpbCwgaW4gb3JkZXIgZnJvbSByb290IHRvIGxlYWZcbiAgcHVibGljIG5vZGVzOiBOb2RlW107XG5cbiAgLy8gU2hvcnRjdXQgZm9yIHRoZSBsZW5ndGggb2Ygbm9kZXMuXG4gIHB1YmxpYyBsZW5ndGg6IG51bWJlcjtcblxuICAvLyBBIHVuaXF1ZSBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIG9ubHkgYmUgc2hhcmVkIGJ5IG90aGVyIHRyYWlscyB0aGF0IGFyZSBpZGVudGljYWwgdG8gdGhpcyBvbmUuXG4gIHB1YmxpYyB1bmlxdWVJZDogc3RyaW5nO1xuXG4gIC8vIGluZGljZXNbeF0gc3RvcmVzIHRoZSBpbmRleCBvZiBub2Rlc1t4XSBpbiBub2Rlc1t4LTFdJ3MgY2hpbGRyZW4sIGUuZy5cbiAgLy8gbm9kZXNbaV0uY2hpbGRyZW5bIGluZGljZXNbaV0gXSA9PT0gbm9kZXNbaSsxXVxuICBwdWJsaWMgaW5kaWNlczogbnVtYmVyW107XG5cbiAgLy8gQ29udHJvbHMgdGhlIGltbXV0YWJpbGl0eSBvZiB0aGUgdHJhaWwuXG4gIC8vIElmIHNldCB0byB0cnVlLCBhZGQvcmVtb3ZlIGRlc2NlbmRhbnQvYW5jZXN0b3Igc2hvdWxkIGZhaWwgaWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxuICAvLyBVc2Ugc2V0SW1tdXRhYmxlKCkgb3Igc2V0TXV0YWJsZSgpIHRvIHNpZ25hbCBhIHNwZWNpZmljIHR5cGUgb2YgcHJvdGVjdGlvbiwgc28gaXQgY2Fubm90IGJlIGNoYW5nZWQgbGF0ZXJcbiAgcHJpdmF0ZSBpbW11dGFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gW25vZGVzXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBub2Rlcz86IFRyYWlsIHwgTm9kZVtdIHwgTm9kZSApIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIC8vIE9ubHkgZG8gdGhpcyBpZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkLCBvdGhlcndpc2Ugd2Ugd29uJ3QgYWNjZXNzIGl0IGF0IGFsbFxuICAgICAgdGhpcy5pbW11dGFibGUgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCBub2RlcyBpbnN0YW5jZW9mIFRyYWlsICkge1xuICAgICAgLy8gY29weSBjb25zdHJ1Y3RvciAodGFrZXMgYWR2YW50YWdlIG9mIGFscmVhZHkgYnVpbHQgaW5kZXggaW5mb3JtYXRpb24pXG4gICAgICBjb25zdCBvdGhlclRyYWlsID0gbm9kZXM7XG5cbiAgICAgIHRoaXMubm9kZXMgPSBvdGhlclRyYWlsLm5vZGVzLnNsaWNlKCAwICk7XG4gICAgICB0aGlzLmxlbmd0aCA9IG90aGVyVHJhaWwubGVuZ3RoO1xuICAgICAgdGhpcy51bmlxdWVJZCA9IG90aGVyVHJhaWwudW5pcXVlSWQ7XG4gICAgICB0aGlzLmluZGljZXMgPSBvdGhlclRyYWlsLmluZGljZXMuc2xpY2UoIDAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLm5vZGVzID0gW107XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHRoaXMudW5pcXVlSWQgPSAnJztcbiAgICB0aGlzLmluZGljZXMgPSBbXTtcblxuICAgIGlmICggbm9kZXMgKSB7XG4gICAgICBpZiAoIG5vZGVzIGluc3RhbmNlb2YgTm9kZSApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzO1xuXG4gICAgICAgIC8vIGFkZCBqdXN0IGEgc2luZ2xlIG5vZGUgaW5cbiAgICAgICAgdGhpcy5hZGREZXNjZW5kYW50KCBub2RlICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gcHJvY2VzcyBpdCBhcyBhbiBhcnJheVxuICAgICAgICBjb25zdCBsZW4gPSBub2Rlcy5sZW5ndGg7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgICAgIHRoaXMuYWRkRGVzY2VuZGFudCggbm9kZXNbIGkgXSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIHRoaXMgVHJhaWwgdGhhdCBjYW4gYmUgbW9kaWZpZWQgaW5kZXBlbmRlbnRseVxuICAgKi9cbiAgcHVibGljIGNvcHkoKTogVHJhaWwge1xuICAgIHJldHVybiBuZXcgVHJhaWwoIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsZWFmLW1vc3QgTm9kZSBpbiBvdXIgdHJhaWwgd2lsbCByZW5kZXIgc29tZXRoaW5nIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGlzUGFpbnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0Tm9kZSgpLmlzUGFpbnRlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIG5vZGVzIGluIHRoZSB0cmFpbCBhcmUgc3RpbGwgY29ubmVjdGVkIGZyb20gdGhlIHRyYWlsJ3Mgcm9vdCB0byBpdHMgbGVhZi5cbiAgICovXG4gIHB1YmxpYyBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMucmVpbmRleCgpO1xuXG4gICAgY29uc3QgaW5kZXhMZW5ndGggPSB0aGlzLmluZGljZXMubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGluZGV4TGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMuaW5kaWNlc1sgaSBdIDwgMCApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgdHJhaWwgaXMgdmlzaWJsZSBvbmx5IGlmIGFsbCBub2RlcyBvbiBpdCBhcmUgbWFya2VkIGFzIHZpc2libGVcbiAgICovXG4gIHB1YmxpYyBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgbGV0IGkgPSB0aGlzLm5vZGVzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGktLSApIHtcbiAgICAgIGlmICggIXRoaXMubm9kZXNbIGkgXS5pc1Zpc2libGUoKSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHRyYWlsIGlzIHBkb21WaXNpYmxlIG9ubHkgaWYgYWxsIG5vZGVzIG9uIGl0IGFyZSBtYXJrZWQgYXMgcGRvbVZpc2libGVcbiAgICovXG4gIHB1YmxpYyBpc1BET01WaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIGxldCBpID0gdGhpcy5ub2Rlcy5sZW5ndGg7XG4gICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICBpZiAoICF0aGlzLm5vZGVzWyBpIF0uaXNWaXNpYmxlKCkgfHwgIXRoaXMubm9kZXNbIGkgXS5pc1BET01WaXNpYmxlKCkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0T3BhY2l0eSgpOiBudW1iZXIge1xuICAgIGxldCBvcGFjaXR5ID0gMTtcbiAgICBsZXQgaSA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIHdoaWxlICggaS0tICkge1xuICAgICAgb3BhY2l0eSAqPSB0aGlzLm5vZGVzWyBpIF0uZ2V0T3BhY2l0eSgpO1xuICAgIH1cbiAgICByZXR1cm4gb3BhY2l0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFc3NlbnRpYWxseSB3aGV0aGVyIHRoaXMgbm9kZSBpcyB2aXNpdGVkIGluIHRoZSBoaXQtdGVzdGluZyBvcGVyYXRpb25cbiAgICovXG4gIHB1YmxpYyBpc1BpY2thYmxlKCk6IGJvb2xlYW4ge1xuICAgIC8vIGl0IHdvbid0IGJlIGlmIGl0IG9yIGFueSBhbmNlc3RvciBpcyBwaWNrYWJsZTogZmFsc2UsIG9yIGlzIGludmlzaWJsZVxuICAgIGlmICggXy5zb21lKCB0aGlzLm5vZGVzLCBub2RlID0+IG5vZGUucGlja2FibGUgPT09IGZhbHNlIHx8ICFub2RlLnZpc2libGUgKSApIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAvLyBpZiB0aGVyZSBpcyBhbnkgbGlzdGVuZXIgb3IgcGlja2FibGU6IHRydWUsIGl0IHdpbGwgYmUgcGlja2FibGVcbiAgICBpZiAoIF8uc29tZSggdGhpcy5ub2Rlcywgbm9kZSA9PiBub2RlLl9pbnB1dExpc3RlbmVycy5sZW5ndGggPiAwIHx8IG5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9PT0gdHJ1ZSApICkgeyByZXR1cm4gdHJ1ZTsgfVxuXG4gICAgLy8gbm8gbGlzdGVuZXJzIG9yIHBpY2thYmxlOiB0cnVlLCBzbyBpdCB3aWxsIGJlIHBydW5lZFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQoIGluZGV4OiBudW1iZXIgKTogTm9kZSB7XG4gICAgaWYgKCBpbmRleCA+PSAwICkge1xuICAgICAgcmV0dXJuIHRoaXMubm9kZXNbIGluZGV4IF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gbmVnYXRpdmUgaW5kZXggZ29lcyBmcm9tIHRoZSBlbmQgb2YgdGhlIGFycmF5XG4gICAgICByZXR1cm4gdGhpcy5ub2Rlc1sgdGhpcy5ub2Rlcy5sZW5ndGggKyBpbmRleCBdO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzbGljZSggc3RhcnRJbmRleDogbnVtYmVyLCBlbmRJbmRleD86IG51bWJlciApOiBUcmFpbCB7XG4gICAgcmV0dXJuIG5ldyBUcmFpbCggdGhpcy5ub2Rlcy5zbGljZSggc3RhcnRJbmRleCwgZW5kSW5kZXggKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IGNvbnNpZGVyIHJlbmFtaW5nIHRvIHN1YnRyYWlsVG9FeGNsdWRpbmcgYW5kIHN1YnRyYWlsVG9JbmNsdWRpbmc/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgc3VidHJhaWxUbyggbm9kZTogTm9kZSwgZXhjbHVkZU5vZGUgPSBmYWxzZSApOiBUcmFpbCB7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoIDAsIF8uaW5kZXhPZiggdGhpcy5ub2Rlcywgbm9kZSApICsgKCBleGNsdWRlTm9kZSA/IDAgOiAxICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBtYXRyaXggbXVsdGlwbGljYXRpb24gb2Ygb3VyIHNlbGVjdGVkIG5vZGVzIHRyYW5zZm9ybWF0aW9uIG1hdHJpY2VzLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRpbmdJbmRleCAtIEluY2x1ZGUgbm9kZXMgbWF0cmljZXMgc3RhcnRpbmcgZnJvbSB0aGlzIGluZGV4IChpbmNsdXNpdmUpXG4gICAqIEBwYXJhbSBlbmRpbmdJbmRleCAtIEluY2x1ZGUgbm9kZXMgbWF0cmljZXMgdXAgdG8gdGhpcyBpbmRleCAoZXhjbHVzaXZlKVxuICAgKi9cbiAgcHVibGljIGdldE1hdHJpeENvbmNhdGVuYXRpb24oIHN0YXJ0aW5nSW5kZXg6IG51bWJlciwgZW5kaW5nSW5kZXg6IG51bWJlciApOiBNYXRyaXgzIHtcbiAgICAvLyBUT0RPOiBwZXJmb3JtYW5jZTogY2FuIHdlIGNhY2hlIHRoaXMgZXZlcj8gd291bGQgbmVlZCB0aGUgcm9vdE5vZGUgdG8gbm90IHJlYWxseSBjaGFuZ2UgaW4gYmV0d2VlbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIHRoaXMgbWF0cml4IHdpbGwgYmUgbW9kaWZpZWQgaW4gcGxhY2UsIHNvIGFsd2F5cyBzdGFydCBmcmVzaFxuICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMuaWRlbnRpdHkoKTtcblxuICAgIC8vIGZyb20gdGhlIHJvb3QgdXBcbiAgICBjb25zdCBub2RlcyA9IHRoaXMubm9kZXM7XG4gICAgZm9yICggbGV0IGkgPSBzdGFydGluZ0luZGV4OyBpIDwgZW5kaW5nSW5kZXg7IGkrKyApIHtcbiAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggbm9kZXNbIGkgXS5nZXRNYXRyaXgoKSApO1xuICAgIH1cbiAgICByZXR1cm4gbWF0cml4O1xuICB9XG5cbiAgLyoqXG4gICAqIEZyb20gbG9jYWwgdG8gZ2xvYmFsXG4gICAqXG4gICAqIGUuZy4gbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgbGVhZiBub2RlIHRvIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgcm9vdCBub2RlXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiB0aGlzLmdldE1hdHJpeENvbmNhdGVuYXRpb24oIDAsIHRoaXMubm9kZXMubGVuZ3RoICk7XG4gIH1cblxuICAvKipcbiAgICogRnJvbSBsb2NhbCB0byBuZXh0LXRvLWdsb2JhbCAoaWdub3JlcyByb290IG5vZGUgbWF0cml4KVxuICAgKlxuICAgKiBlLmcuIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIGxlYWYgbm9kZSB0byB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgcm9vdCBub2RlXG4gICAqL1xuICBwdWJsaWMgZ2V0QW5jZXN0b3JNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWF0cml4Q29uY2F0ZW5hdGlvbiggMSwgdGhpcy5ub2Rlcy5sZW5ndGggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGcm9tIHBhcmVudCB0byBnbG9iYWxcbiAgICpcbiAgICogZS5nLiBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgbGVhZiBub2RlIHRvIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgcm9vdCBub2RlXG4gICAqL1xuICBwdWJsaWMgZ2V0UGFyZW50TWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiB0aGlzLmdldE1hdHJpeENvbmNhdGVuYXRpb24oIDAsIHRoaXMubm9kZXMubGVuZ3RoIC0gMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZyb20gcGFyZW50IHRvIG5leHQtdG8tZ2xvYmFsIChpZ25vcmVzIHJvb3Qgbm9kZSBtYXRyaXgpXG4gICAqXG4gICAqIGUuZy4gcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIGxlYWYgbm9kZSB0byB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgcm9vdCBub2RlXG4gICAqL1xuICBwdWJsaWMgZ2V0QW5jZXN0b3JQYXJlbnRNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWF0cml4Q29uY2F0ZW5hdGlvbiggMSwgdGhpcy5ub2Rlcy5sZW5ndGggLSAxICk7XG4gIH1cblxuICAvKipcbiAgICogRnJvbSBsb2NhbCB0byBnbG9iYWxcbiAgICpcbiAgICogZS5nLiBsb2NhbCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSBsZWFmIG5vZGUgdG8gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSByb290IG5vZGVcbiAgICovXG4gIHB1YmxpYyBnZXRUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0zKCB0aGlzLmdldE1hdHJpeCgpICk7XG4gIH1cblxuICAvKipcbiAgICogRnJvbSBwYXJlbnQgdG8gZ2xvYmFsXG4gICAqXG4gICAqIGUuZy4gcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIGxlYWYgbm9kZSB0byB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIHJvb3Qgbm9kZVxuICAgKi9cbiAgcHVibGljIGdldFBhcmVudFRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zZm9ybTMoIHRoaXMuZ2V0UGFyZW50TWF0cml4KCkgKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRBbmNlc3Rvciggbm9kZTogTm9kZSwgaW5kZXg/OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW1tdXRhYmxlLCAnY2Fubm90IG1vZGlmeSBhbiBpbW11dGFibGUgVHJhaWwgd2l0aCBhZGRBbmNlc3RvcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLCAnY2Fubm90IGFkZCBmYWxzeSB2YWx1ZSB0byBhIFRyYWlsJyApO1xuXG5cbiAgICBpZiAoIHRoaXMubm9kZXMubGVuZ3RoICkge1xuICAgICAgY29uc3Qgb2xkUm9vdCA9IHRoaXMubm9kZXNbIDAgXTtcbiAgICAgIHRoaXMuaW5kaWNlcy51bnNoaWZ0KCBpbmRleCA9PT0gdW5kZWZpbmVkID8gXy5pbmRleE9mKCBub2RlLl9jaGlsZHJlbiwgb2xkUm9vdCApIDogaW5kZXggKTtcbiAgICB9XG4gICAgdGhpcy5ub2Rlcy51bnNoaWZ0KCBub2RlICk7XG5cbiAgICB0aGlzLmxlbmd0aCsrO1xuICAgIC8vIGFjY2VsZXJhdGVkIHZlcnNpb24gb2YgdGhpcy51cGRhdGVVbmlxdWVJZCgpXG4gICAgdGhpcy51bmlxdWVJZCA9ICggdGhpcy51bmlxdWVJZCA/IG5vZGUuaWQgKyBJRF9TRVBBUkFUT1IgKyB0aGlzLnVuaXF1ZUlkIDogYCR7bm9kZS5pZH1gICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVBbmNlc3RvcigpOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbW11dGFibGUsICdjYW5ub3QgbW9kaWZ5IGFuIGltbXV0YWJsZSBUcmFpbCB3aXRoIHJlbW92ZUFuY2VzdG9yJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGVuZ3RoID4gMCwgJ2Nhbm5vdCByZW1vdmUgYSBOb2RlIGZyb20gYW4gZW1wdHkgdHJhaWwnICk7XG5cbiAgICB0aGlzLm5vZGVzLnNoaWZ0KCk7XG4gICAgaWYgKCB0aGlzLmluZGljZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy5pbmRpY2VzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGgtLTtcbiAgICB0aGlzLnVwZGF0ZVVuaXF1ZUlkKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBhZGREZXNjZW5kYW50KCBub2RlOiBOb2RlLCBpbmRleD86IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbW11dGFibGUsICdjYW5ub3QgbW9kaWZ5IGFuIGltbXV0YWJsZSBUcmFpbCB3aXRoIGFkZERlc2NlbmRhbnQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSwgJ2Nhbm5vdCBhZGQgZmFsc3kgdmFsdWUgdG8gYSBUcmFpbCcgKTtcblxuXG4gICAgaWYgKCB0aGlzLm5vZGVzLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMubGFzdE5vZGUoKTtcbiAgICAgIHRoaXMuaW5kaWNlcy5wdXNoKCBpbmRleCA9PT0gdW5kZWZpbmVkID8gXy5pbmRleE9mKCBwYXJlbnQuX2NoaWxkcmVuLCBub2RlICkgOiBpbmRleCApO1xuICAgIH1cbiAgICB0aGlzLm5vZGVzLnB1c2goIG5vZGUgKTtcblxuICAgIHRoaXMubGVuZ3RoKys7XG4gICAgLy8gYWNjZWxlcmF0ZWQgdmVyc2lvbiBvZiB0aGlzLnVwZGF0ZVVuaXF1ZUlkKClcbiAgICB0aGlzLnVuaXF1ZUlkID0gKCB0aGlzLnVuaXF1ZUlkID8gdGhpcy51bmlxdWVJZCArIElEX1NFUEFSQVRPUiArIG5vZGUuaWQgOiBgJHtub2RlLmlkfWAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZURlc2NlbmRhbnQoKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW1tdXRhYmxlLCAnY2Fubm90IG1vZGlmeSBhbiBpbW11dGFibGUgVHJhaWwgd2l0aCByZW1vdmVEZXNjZW5kYW50JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGVuZ3RoID4gMCwgJ2Nhbm5vdCByZW1vdmUgYSBOb2RlIGZyb20gYW4gZW1wdHkgdHJhaWwnICk7XG5cbiAgICB0aGlzLm5vZGVzLnBvcCgpO1xuICAgIGlmICggdGhpcy5pbmRpY2VzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuaW5kaWNlcy5wb3AoKTtcbiAgICB9XG5cbiAgICB0aGlzLmxlbmd0aC0tO1xuICAgIHRoaXMudXBkYXRlVW5pcXVlSWQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGFkZERlc2NlbmRhbnRUcmFpbCggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRyYWlsLmxlbmd0aDtcbiAgICBpZiAoIGxlbmd0aCApIHtcbiAgICAgIHRoaXMuYWRkRGVzY2VuZGFudCggdHJhaWwubm9kZXNbIDAgXSApO1xuICAgIH1cbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkRGVzY2VuZGFudCggdHJhaWwubm9kZXNbIGkgXSwgdGhpcy5pbmRpY2VzWyBpIC0gMSBdICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlbW92ZURlc2NlbmRhbnRUcmFpbCggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRyYWlsLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IGxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5sYXN0Tm9kZSgpID09PSB0cmFpbC5ub2Rlc1sgaSBdICk7XG5cbiAgICAgIHRoaXMucmVtb3ZlRGVzY2VuZGFudCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZyZXNoZXMgdGhlIGludGVybmFsIGluZGV4IHJlZmVyZW5jZXMgKGltcG9ydGFudCBpZiBhbnkgY2hpbGRyZW4gYXJyYXlzIHdlcmUgbW9kaWZpZWQhKVxuICAgKi9cbiAgcHVibGljIHJlaW5kZXgoKTogdm9pZCB7XG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAvLyBvbmx5IHJlcGxhY2UgaW5kaWNlcyB3aGVyZSB0aGV5IGhhdmUgY2hhbmdlZCAodGhpcyB3YXMgYSBwZXJmb3JtYW5jZSBob3RzcG90KVxuICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5pbmRpY2VzWyBpIC0gMSBdO1xuICAgICAgY29uc3QgYmFzZU5vZGUgPSB0aGlzLm5vZGVzWyBpIC0gMSBdO1xuXG4gICAgICBpZiAoIGJhc2VOb2RlLl9jaGlsZHJlblsgY3VycmVudEluZGV4IF0gIT09IHRoaXMubm9kZXNbIGkgXSApIHtcbiAgICAgICAgdGhpcy5pbmRpY2VzWyBpIC0gMSBdID0gXy5pbmRleE9mKCBiYXNlTm9kZS5fY2hpbGRyZW4sIHRoaXMubm9kZXNbIGkgXSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXRJbW11dGFibGUoKTogdGhpcyB7XG4gICAgLy8gaWYgYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQsIHdlIGhvcGUgdGhpcyBpcyBpbmxpbmVkIGFzIGEgbm8tb3BcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGFzc2VydCggdGhpcy5pbW11dGFibGUgIT09IGZhbHNlLCAnQSB0cmFpbCBjYW5ub3QgYmUgbWFkZSBpbW11dGFibGUgYWZ0ZXIgYmVpbmcgZmxhZ2dlZCBhcyBtdXRhYmxlJyApO1xuICAgICAgdGhpcy5pbW11dGFibGUgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGNvbnNpZGVyIHNldHRpbmcgbXV0YXRvcnMgdG8gbnVsbCBoZXJlIGluc3RlYWQgb2YgdGhlIGZ1bmN0aW9uIGNhbGwgY2hlY2sgKGZvciBwZXJmb3JtYW5jZSwgYW5kIHByb2ZpbGUgdGhlIGRpZmZlcmVuY2VzKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgc2V0TXV0YWJsZSgpOiB0aGlzIHtcbiAgICAvLyBpZiBhc3NlcnRpb25zIGFyZSBkaXNhYmxlZCwgd2UgaG9wZSB0aGlzIGlzIGlubGluZWQgYXMgYSBuby1vcFxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgYXNzZXJ0KCB0aGlzLmltbXV0YWJsZSAhPT0gdHJ1ZSwgJ0EgdHJhaWwgY2Fubm90IGJlIG1hZGUgbXV0YWJsZSBhZnRlciBiZWluZyBmbGFnZ2VkIGFzIGltbXV0YWJsZScgKTtcbiAgICAgIHRoaXMuaW1tdXRhYmxlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwdWJsaWMgYXJlSW5kaWNlc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHRoaXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLmluZGljZXNbIGkgLSAxIF07XG4gICAgICBpZiAoIHRoaXMubm9kZXNbIGkgLSAxIF0uX2NoaWxkcmVuWyBjdXJyZW50SW5kZXggXSAhPT0gdGhpcy5ub2Rlc1sgaSBdICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IFRyYWlsICk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5sZW5ndGggIT09IG90aGVyLmxlbmd0aCApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm5vZGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLm5vZGVzWyBpIF0gIT09IG90aGVyLm5vZGVzWyBpIF0gKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IFRyYWlsIGZyb20gdGhlIHJvb3QgdXAgdG8gdGhlIHBhcmFtZXRlciBub2RlLlxuICAgKi9cbiAgcHVibGljIHVwVG9Ob2RlKCBub2RlOiBOb2RlICk6IFRyYWlsIHtcbiAgICBjb25zdCBub2RlSW5kZXggPSBfLmluZGV4T2YoIHRoaXMubm9kZXMsIG5vZGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlSW5kZXggPj0gMCwgJ1RyYWlsIGRvZXMgbm90IGNvbnRhaW4gdGhlIG5vZGUnICk7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoIDAsIF8uaW5kZXhPZiggdGhpcy5ub2Rlcywgbm9kZSApICsgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyB0cmFpbCBjb250YWlucyB0aGUgY29tcGxldGUgJ290aGVyJyB0cmFpbCwgYnV0IHdpdGggYWRkZWQgZGVzY2VuZGFudHMgYWZ0ZXJ3YXJkcy5cbiAgICpcbiAgICogQHBhcmFtIG90aGVyIC0gaXMgb3RoZXIgYSBzdWJzZXQgb2YgdGhpcyB0cmFpbD9cbiAgICogQHBhcmFtIGFsbG93U2FtZVRyYWlsXG4gICAqL1xuICBwdWJsaWMgaXNFeHRlbnNpb25PZiggb3RoZXI6IFRyYWlsLCBhbGxvd1NhbWVUcmFpbD86IGJvb2xlYW4gKTogYm9vbGVhbiB7XG4gICAgaWYgKCB0aGlzLmxlbmd0aCA8PSBvdGhlci5sZW5ndGggLSAoIGFsbG93U2FtZVRyYWlsID8gMSA6IDAgKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvdGhlci5ub2Rlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5ub2Rlc1sgaSBdICE9PSBvdGhlci5ub2Rlc1sgaSBdICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgZ2l2ZW4gbm9kZSBpcyBjb250YWluZWQgaW4gdGhlIHRyYWlsLlxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zTm9kZSggbm9kZTogTm9kZSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gXy5pbmNsdWRlcyggdGhpcy5ub2Rlcywgbm9kZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdHJhbnNmb3JtIGZyb20gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIG90aGVyIHRyYWlsJ3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKi9cbiAgcHVibGljIGdldFRyYW5zZm9ybVRvKCBvdGhlclRyYWlsOiBUcmFpbCApOiBUcmFuc2Zvcm0zIHtcbiAgICByZXR1cm4gbmV3IFRyYW5zZm9ybTMoIHRoaXMuZ2V0TWF0cml4VG8oIG90aGVyVHJhaWwgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCB0cmFuc2Zvcm1zIGEgcG9pbnQgaW4gb3VyIGxhc3Qgbm9kZSdzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIG90aGVyIHRyYWlsJ3MgbGFzdCBub2RlJ3NcbiAgICogbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKi9cbiAgcHVibGljIGdldE1hdHJpeFRvKCBvdGhlclRyYWlsOiBUcmFpbCApOiBNYXRyaXgzIHtcbiAgICB0aGlzLnJlaW5kZXgoKTtcbiAgICBvdGhlclRyYWlsLnJlaW5kZXgoKTtcblxuICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gdGhpcy5nZXRCcmFuY2hJbmRleFRvKCBvdGhlclRyYWlsICk7XG4gICAgbGV0IGlkeDtcblxuICAgIGxldCBtYXRyaXggPSBNYXRyaXgzLklERU5USVRZO1xuXG4gICAgLy8gd2FsayBvdXIgdHJhbnNmb3JtIGRvd24sIHByZXBlbmRpbmdcbiAgICBmb3IgKCBpZHggPSB0aGlzLmxlbmd0aCAtIDE7IGlkeCA+PSBicmFuY2hJbmRleDsgaWR4LS0gKSB7XG4gICAgICBtYXRyaXggPSB0aGlzLm5vZGVzWyBpZHggXS5nZXRNYXRyaXgoKS50aW1lc01hdHJpeCggbWF0cml4ICk7XG4gICAgfVxuXG4gICAgLy8gd2FsayBvdXIgdHJhbnNmb3JtIHVwLCBwcmVwZW5kaW5nIGludmVyc2VzXG4gICAgZm9yICggaWR4ID0gYnJhbmNoSW5kZXg7IGlkeCA8IG90aGVyVHJhaWwubGVuZ3RoOyBpZHgrKyApIHtcbiAgICAgIG1hdHJpeCA9IG90aGVyVHJhaWwubm9kZXNbIGlkeCBdLmdldFRyYW5zZm9ybSgpLmdldEludmVyc2UoKS50aW1lc01hdHJpeCggbWF0cml4ICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdHJpeDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBpbmRleCB0aGF0IGlzIGRpZmZlcmVudCBiZXR3ZWVuIHRoaXMgdHJhaWwgYW5kIHRoZSBvdGhlciB0cmFpbC5cbiAgICpcbiAgICogSWYgdGhlIHRyYWlscyBhcmUgaWRlbnRpY2FsLCB0aGUgaW5kZXggc2hvdWxkIGJlIGVxdWFsIHRvIHRoZSB0cmFpbCdzIGxlbmd0aC5cbiAgICovXG4gIHB1YmxpYyBnZXRCcmFuY2hJbmRleFRvKCBvdGhlclRyYWlsOiBUcmFpbCApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZXNbIDAgXSA9PT0gb3RoZXJUcmFpbC5ub2Rlc1sgMCBdLCAnVG8gZ2V0IGEgYnJhbmNoIGluZGV4LCB0aGUgdHJhaWxzIG11c3QgaGF2ZSB0aGUgc2FtZSByb290JyApO1xuXG4gICAgbGV0IGJyYW5jaEluZGV4O1xuXG4gICAgY29uc3QgbWluID0gTWF0aC5taW4oIHRoaXMubGVuZ3RoLCBvdGhlclRyYWlsLmxlbmd0aCApO1xuICAgIGZvciAoIGJyYW5jaEluZGV4ID0gMDsgYnJhbmNoSW5kZXggPCBtaW47IGJyYW5jaEluZGV4KysgKSB7XG4gICAgICBpZiAoIHRoaXMubm9kZXNbIGJyYW5jaEluZGV4IF0gIT09IG90aGVyVHJhaWwubm9kZXNbIGJyYW5jaEluZGV4IF0gKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBicmFuY2hJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsYXN0IChsYXJnZXN0KSBpbmRleCBpbnRvIHRoZSB0cmFpbCdzIG5vZGVzIHRoYXQgaGFzIGlucHV0RW5hYmxlZD10cnVlLlxuICAgKi9cbiAgcHVibGljIGdldExhc3RJbnB1dEVuYWJsZWRJbmRleCgpOiBudW1iZXIge1xuICAgIC8vIERldGVybWluZSBob3cgZmFyIHVwIHRoZSBUcmFpbCBpbnB1dCBpcyBkZXRlcm1pbmVkLiBUaGUgZmlyc3Qgbm9kZSB3aXRoICFpbnB1dEVuYWJsZWQgYW5kIGFmdGVyIHdpbGwgbm90IGhhdmVcbiAgICAvLyBldmVudHMgZmlyZWQgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy8yNTcpXG4gICAgbGV0IHRyYWlsU3RhcnRJbmRleCA9IC0xO1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICBpZiAoICF0aGlzLm5vZGVzWyBqIF0uaW5wdXRFbmFibGVkICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdHJhaWxTdGFydEluZGV4ID0gajtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJhaWxTdGFydEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxlYWYtbW9zdCBpbmRleCwgdW5sZXNzIHRoZXJlIGlzIGEgTm9kZSB3aXRoIGlucHV0RW5hYmxlZD1mYWxzZSAoaW4gd2hpY2ggY2FzZSwgdGhlIGxvd2VzdCBpbmRleFxuICAgKiBmb3IgdGhvc2UgbWF0Y2hpbmcgTm9kZXMgYXJlIHJldHVybmVkKS5cbiAgICovXG4gIHB1YmxpYyBnZXRDdXJzb3JDaGVja0luZGV4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGFzdElucHV0RW5hYmxlZEluZGV4KCk7XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogcGhhc2Ugb3V0IGluIGZhdm9yIG9mIGdldCgpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgbm9kZUZyb21Ub3AoIG9mZnNldDogbnVtYmVyICk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGVzWyB0aGlzLmxlbmd0aCAtIDEgLSBvZmZzZXQgXTtcbiAgfVxuXG4gIHB1YmxpYyBsYXN0Tm9kZSgpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlRnJvbVRvcCggMCApO1xuICB9XG5cbiAgcHVibGljIHJvb3ROb2RlKCk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLm5vZGVzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgZ3JhcGggdHJhaWwgaW4gdGhlIG9yZGVyIG9mIHNlbGYtcmVuZGVyaW5nXG4gICAqL1xuICBwdWJsaWMgcHJldmlvdXMoKTogVHJhaWwgfCBudWxsIHtcbiAgICBpZiAoIHRoaXMubm9kZXMubGVuZ3RoIDw9IDEgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCB0b3AgPSB0aGlzLm5vZGVGcm9tVG9wKCAwICk7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5ub2RlRnJvbVRvcCggMSApO1xuXG4gICAgY29uc3QgcGFyZW50SW5kZXggPSBfLmluZGV4T2YoIHBhcmVudC5fY2hpbGRyZW4sIHRvcCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudEluZGV4ICE9PSAtMSApO1xuICAgIGNvbnN0IGFyciA9IHRoaXMubm9kZXMuc2xpY2UoIDAsIHRoaXMubm9kZXMubGVuZ3RoIC0gMSApO1xuICAgIGlmICggcGFyZW50SW5kZXggPT09IDAgKSB7XG4gICAgICAvLyB3ZSB3ZXJlIHRoZSBmaXJzdCBjaGlsZCwgc28gZ2l2ZSBpdCB0aGUgdHJhaWwgdG8gdGhlIHBhcmVudFxuICAgICAgcmV0dXJuIG5ldyBUcmFpbCggYXJyICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gcHJldmlvdXMgY2hpbGRcbiAgICAgIGFyci5wdXNoKCBwYXJlbnQuX2NoaWxkcmVuWyBwYXJlbnRJbmRleCAtIDEgXSApO1xuXG4gICAgICAvLyBhbmQgZmluZCBpdHMgbGFzdCB0ZXJtaW5hbFxuICAgICAgd2hpbGUgKCBhcnJbIGFyci5sZW5ndGggLSAxIF0uX2NoaWxkcmVuLmxlbmd0aCAhPT0gMCApIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IGFyclsgYXJyLmxlbmd0aCAtIDEgXTtcbiAgICAgICAgYXJyLnB1c2goIGxhc3QuX2NoaWxkcmVuWyBsYXN0Ll9jaGlsZHJlbi5sZW5ndGggLSAxIF0gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBUcmFpbCggYXJyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpa2UgcHJldmlvdXMoKSwgYnV0IGtlZXBzIG1vdmluZyBiYWNrIHVudGlsIHRoZSB0cmFpbCBnb2VzIHRvIGEgbm9kZSB3aXRoIGlzUGFpbnRlZCgpID09PSB0cnVlXG4gICAqL1xuICBwdWJsaWMgcHJldmlvdXNQYWludGVkKCk6IFRyYWlsIHwgbnVsbCB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMucHJldmlvdXMoKTtcbiAgICB3aGlsZSAoIHJlc3VsdCAmJiAhcmVzdWx0LmlzUGFpbnRlZCgpICkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnByZXZpb3VzKCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogSW4gdGhlIG9yZGVyIG9mIHNlbGYtcmVuZGVyaW5nXG4gICAqL1xuICBwdWJsaWMgbmV4dCgpOiBUcmFpbCB8IG51bGwge1xuICAgIGNvbnN0IGFyciA9IHRoaXMubm9kZXMuc2xpY2UoIDAgKTtcblxuICAgIGNvbnN0IHRvcCA9IHRoaXMubm9kZUZyb21Ub3AoIDAgKTtcbiAgICBpZiAoIHRvcC5fY2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcbiAgICAgIC8vIGlmIHdlIGhhdmUgY2hpbGRyZW4sIHJldHVybiB0aGUgZmlyc3QgY2hpbGRcbiAgICAgIGFyci5wdXNoKCB0b3AuX2NoaWxkcmVuWyAwIF0gKTtcbiAgICAgIHJldHVybiBuZXcgVHJhaWwoIGFyciApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHdhbGsgZG93biBhbmQgYXR0ZW1wdCB0byBmaW5kIHRoZSBuZXh0IHBhcmVudFxuICAgICAgbGV0IGRlcHRoID0gdGhpcy5ub2Rlcy5sZW5ndGggLSAxO1xuXG4gICAgICB3aGlsZSAoIGRlcHRoID4gMCApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZXNbIGRlcHRoIF07XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMubm9kZXNbIGRlcHRoIC0gMSBdO1xuXG4gICAgICAgIGFyci5wb3AoKTsgLy8gdGFrZSBvZmYgdGhlIG5vZGUgc28gd2UgY2FuIGFkZCB0aGUgbmV4dCBzaWJsaW5nIGlmIGl0IGV4aXN0c1xuXG4gICAgICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCBwYXJlbnQuX2NoaWxkcmVuLCBub2RlICk7XG4gICAgICAgIGlmICggaW5kZXggIT09IHBhcmVudC5fY2hpbGRyZW4ubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICAvLyB0aGVyZSBpcyBhbm90aGVyIChsYXRlcikgc2libGluZy4gdXNlIHRoYXQhXG4gICAgICAgICAgYXJyLnB1c2goIHBhcmVudC5fY2hpbGRyZW5bIGluZGV4ICsgMSBdICk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUcmFpbCggYXJyICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVwdGgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpZiB3ZSBkaWRuJ3QgcmVhY2ggYSBsYXRlciBzaWJsaW5nIGJ5IG5vdywgaXQgZG9lc24ndCBleGlzdFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpa2UgbmV4dCgpLCBidXQga2VlcHMgbW92aW5nIGJhY2sgdW50aWwgdGhlIHRyYWlsIGdvZXMgdG8gYSBub2RlIHdpdGggaXNQYWludGVkKCkgPT09IHRydWVcbiAgICovXG4gIHB1YmxpYyBuZXh0UGFpbnRlZCgpOiBUcmFpbCB8IG51bGwge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLm5leHQoKTtcbiAgICB3aGlsZSAoIHJlc3VsdCAmJiAhcmVzdWx0LmlzUGFpbnRlZCgpICkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0Lm5leHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBjYWxsYmFjayggdHJhaWwgKSBmb3IgdGhpcyB0cmFpbCwgYW5kIGVhY2ggZGVzY2VuZGFudCB0cmFpbC4gSWYgY2FsbGJhY2sgcmV0dXJucyB0cnVlLCBzdWJ0cmVlIHdpbGwgYmUgc2tpcHBlZFxuICAgKi9cbiAgcHVibGljIGVhY2hUcmFpbFVuZGVyKCBjYWxsYmFjazogVHJhaWxDYWxsYmFjayApOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBwZXJmb3JtYW5jZTogc2hvdWxkIGJlIG9wdGltaXplZCB0byBiZSBtdWNoIGZhc3Rlciwgc2luY2Ugd2UgZG9uJ3QgaGF2ZSB0byBkZWFsIHdpdGggdGhlIGJlZm9yZS9hZnRlciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIHRoaXMsIHRydWUgKS5lYWNoVHJhaWxCZXR3ZWVuKCBuZXcgVHJhaWxQb2ludGVyKCB0aGlzLCBmYWxzZSApLCBjYWxsYmFjayApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YW5kYXJkIEphdmEtc3R5bGUgY29tcGFyZS4gLTEgbWVhbnMgdGhpcyB0cmFpbCBpcyBiZWZvcmUgKHVuZGVyKSB0aGUgb3RoZXIgdHJhaWwsIDAgbWVhbnMgZXF1YWwsIGFuZCAxIG1lYW5zIHRoaXMgdHJhaWwgaXNcbiAgICogYWZ0ZXIgKG9uIHRvcCBvZikgdGhlIG90aGVyIHRyYWlsLlxuICAgKiBBIHNob3J0ZXIgc3VidHJhaWwgd2lsbCBjb21wYXJlIGFzIC0xLlxuICAgKlxuICAgKiBBc3N1bWVzIHRoYXQgdGhlIFRyYWlscyBhcmUgcHJvcGVybHkgaW5kZXhlZC4gSWYgbm90LCBwbGVhc2UgcmVpbmRleCB0aGVtIVxuICAgKlxuICAgKiBDb21wYXJpc29uIGlzIGZvciB0aGUgcmVuZGVyaW5nIG9yZGVyLCBzbyBhbiBhbmNlc3RvciBpcyAnYmVmb3JlJyBhIGRlc2NlbmRhbnRcbiAgICovXG4gIHB1YmxpYyBjb21wYXJlKCBvdGhlcjogVHJhaWwgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0VtcHR5KCksICdjYW5ub3QgY29tcGFyZSB3aXRoIGFuIGVtcHR5IHRyYWlsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvdGhlci5pc0VtcHR5KCksICdjYW5ub3QgY29tcGFyZSB3aXRoIGFuIGVtcHR5IHRyYWlsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZXNbIDAgXSA9PT0gb3RoZXIubm9kZXNbIDAgXSwgJ2ZvciBUcmFpbCBjb21wYXJpc29uLCB0cmFpbHMgbXVzdCBoYXZlIHRoZSBzYW1lIHJvb3Qgbm9kZScgKTtcbiAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMuYXJlSW5kaWNlc1ZhbGlkKCksIGBUcmFpbC5jb21wYXJlIHRoaXMuYXJlSW5kaWNlc1ZhbGlkKCkgZmFpbGVkIG9uICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIG90aGVyLmFyZUluZGljZXNWYWxpZCgpLCBgVHJhaWwuY29tcGFyZSBvdGhlci5hcmVJbmRpY2VzVmFsaWQoKSBmYWlsZWQgb24gJHtvdGhlci50b1N0cmluZygpfWAgKTtcblxuICAgIGNvbnN0IG1pbk5vZGVJbmRleCA9IE1hdGgubWluKCB0aGlzLm5vZGVzLmxlbmd0aCwgb3RoZXIubm9kZXMubGVuZ3RoICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWluTm9kZUluZGV4OyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMubm9kZXNbIGkgXSAhPT0gb3RoZXIubm9kZXNbIGkgXSApIHtcbiAgICAgICAgaWYgKCB0aGlzLm5vZGVzWyBpIC0gMSBdLmNoaWxkcmVuLmluZGV4T2YoIHRoaXMubm9kZXNbIGkgXSApIDwgb3RoZXIubm9kZXNbIGkgLSAxIF0uY2hpbGRyZW4uaW5kZXhPZiggb3RoZXIubm9kZXNbIGkgXSApICkge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlIHNjYW5uZWQgdGhyb3VnaCBhbmQgbm8gbm9kZXMgd2VyZSBkaWZmZXJlbnQgKG9uZSBpcyBhIHN1YnRyYWlsIG9mIHRoZSBvdGhlcilcbiAgICBpZiAoIHRoaXMubm9kZXMubGVuZ3RoIDwgb3RoZXIubm9kZXMubGVuZ3RoICkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5ub2Rlcy5sZW5ndGggPiBvdGhlci5ub2Rlcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaXNCZWZvcmUoIG90aGVyOiBUcmFpbCApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wYXJlKCBvdGhlciApID09PSAtMTtcbiAgfVxuXG4gIHB1YmxpYyBpc0FmdGVyKCBvdGhlcjogVHJhaWwgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGFyZSggb3RoZXIgKSA9PT0gMTtcbiAgfVxuXG4gIHB1YmxpYyBsb2NhbFRvR2xvYmFsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIC8vIFRPRE86IHBlcmZvcm1hbmNlOiBtdWx0aXBsZSB0aW1lc1ZlY3RvcjIgY2FsbHMgdXAgdGhlIGNoYWluIGlzIHByb2JhYmx5IGZhc3RlciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHJldHVybiB0aGlzLmdldE1hdHJpeCgpLnRpbWVzVmVjdG9yMiggcG9pbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBsb2NhbFRvR2xvYmFsQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm1lZCggdGhpcy5nZXRNYXRyaXgoKSApO1xuICB9XG5cbiAgcHVibGljIGdsb2JhbFRvTG9jYWxQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VHJhbnNmb3JtKCkuaW52ZXJzZVBvc2l0aW9uMiggcG9pbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBnbG9iYWxUb0xvY2FsQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VHJhbnNmb3JtKCkuaW52ZXJzZUJvdW5kczIoIGJvdW5kcyApO1xuICB9XG5cbiAgcHVibGljIHBhcmVudFRvR2xvYmFsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIC8vIFRPRE86IHBlcmZvcm1hbmNlOiBtdWx0aXBsZSB0aW1lc1ZlY3RvcjIgY2FsbHMgdXAgdGhlIGNoYWluIGlzIHByb2JhYmx5IGZhc3RlciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHJldHVybiB0aGlzLmdldFBhcmVudE1hdHJpeCgpLnRpbWVzVmVjdG9yMiggcG9pbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXJlbnRUb0dsb2JhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuZ2V0UGFyZW50TWF0cml4KCkgKTtcbiAgfVxuXG4gIHB1YmxpYyBnbG9iYWxUb1BhcmVudFBvaW50KCBwb2ludDogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXJlbnRUcmFuc2Zvcm0oKS5pbnZlcnNlUG9zaXRpb24yKCBwb2ludCApO1xuICB9XG5cbiAgcHVibGljIGdsb2JhbFRvUGFyZW50Qm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFyZW50VHJhbnNmb3JtKCkuaW52ZXJzZUJvdW5kczIoIGJvdW5kcyApO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVVbmlxdWVJZCgpOiB2b2lkIHtcbiAgICAvLyBzdHJpbmcgY29uY2F0ZW5hdGlvbiBpcyBmYXN0ZXIsIHNlZSBodHRwOi8vanNwZXJmLmNvbS9zdHJpbmctY29uY2F0LXZzLWpvaW5zXG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGNvbnN0IGxlbiA9IHRoaXMubm9kZXMubGVuZ3RoO1xuICAgIGlmICggbGVuID4gMCApIHtcbiAgICAgIHJlc3VsdCArPSB0aGlzLm5vZGVzWyAwIF0uX2lkO1xuICAgIH1cbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgIHJlc3VsdCArPSBJRF9TRVBBUkFUT1IgKyB0aGlzLm5vZGVzWyBpIF0uX2lkO1xuICAgIH1cbiAgICB0aGlzLnVuaXF1ZUlkID0gcmVzdWx0O1xuICAgIC8vIHRoaXMudW5pcXVlSWQgPSBfLm1hcCggdGhpcy5ub2RlcywgZnVuY3Rpb24oIG5vZGUgKSB7IHJldHVybiBub2RlLmdldElkKCk7IH0gKS5qb2luKCAnLScgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25jYXRlbmF0ZXMgdGhlIHVuaXF1ZSBJRHMgb2Ygbm9kZXMgaW4gdGhlIHRyYWlsLCBzbyB0aGF0IHdlIGNhbiBkbyBpZC1iYXNlZCBsb29rdXBzXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5pcXVlSWQoKTogc3RyaW5nIHtcbiAgICAvLyBzYW5pdHkgY2hlY2tzXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBjb25zdCBvbGRVbmlxdWVJZCA9IHRoaXMudW5pcXVlSWQ7XG4gICAgICB0aGlzLnVwZGF0ZVVuaXF1ZUlkKCk7XG4gICAgICBhc3NlcnQoIG9sZFVuaXF1ZUlkID09PSB0aGlzLnVuaXF1ZUlkICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnVuaXF1ZUlkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgdGhpcy5yZWluZGV4KCk7XG4gICAgaWYgKCAhdGhpcy5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gJ0VtcHR5IFRyYWlsJztcbiAgICB9XG4gICAgcmV0dXJuIGBbVHJhaWwgJHt0aGlzLmluZGljZXMuam9pbiggJy4nICl9ICR7dGhpcy5nZXRVbmlxdWVJZCgpfV1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuZXIgc3RyaW5nIGZvcm0gd2hpY2ggd2lsbCBzaG93IGNsYXNzIG5hbWVzLiBOb3Qgb3B0aW1pemVkIGJ5IGFueSBtZWFucywgbWVhbnQgZm9yIGRlYnVnZ2luZy5cbiAgICovXG4gIHB1YmxpYyB0b1BhdGhTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gXy5tYXAoIHRoaXMubm9kZXMsIG4gPT4ge1xuICAgICAgbGV0IHN0cmluZyA9IG4uY29uc3RydWN0b3IubmFtZTtcbiAgICAgIGlmICggc3RyaW5nID09PSAnTm9kZScgKSB7XG4gICAgICAgIHN0cmluZyA9ICcuJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfSApLmpvaW4oICcvJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWJ1Z2dpbmcgc3RyaW5nIGlkZWFsIGZvciBsb2dnZWQgb3V0cHV0LlxuICAgKi9cbiAgcHVibGljIHRvRGVidWdTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy50b1N0cmluZygpfSAke3RoaXMudG9QYXRoU3RyaW5nKCl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIGVhY2hUcmFpbEJldHdlZW4sIGJ1dCBvbmx5IGZpcmVzIGZvciBwYWludGVkIHRyYWlscy4gSWYgY2FsbGJhY2sgcmV0dXJucyB0cnVlLCBzdWJ0cmVlIHdpbGwgYmUgc2tpcHBlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBlYWNoUGFpbnRlZFRyYWlsQmV0d2VlbiggYTogVHJhaWwsIGI6IFRyYWlsLCBjYWxsYmFjazogKCB0cmFpbDogVHJhaWwgKSA9PiB2b2lkLCBleGNsdWRlRW5kVHJhaWxzOiBib29sZWFuLCByb290Tm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICBUcmFpbC5lYWNoVHJhaWxCZXR3ZWVuKCBhLCBiLCAoIHRyYWlsOiBUcmFpbCApID0+IHtcbiAgICAgIGlmICggdHJhaWwuaXNQYWludGVkKCkgKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayggdHJhaWwgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LCBleGNsdWRlRW5kVHJhaWxzLCByb290Tm9kZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdsb2JhbCB3YXkgb2YgaXRlcmF0aW5nIGFjcm9zcyB0cmFpbHMuIHdoZW4gY2FsbGJhY2sgcmV0dXJucyB0cnVlLCBzdWJ0cmVlIHdpbGwgYmUgc2tpcHBlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBlYWNoVHJhaWxCZXR3ZWVuKCBhOiBUcmFpbCwgYjogVHJhaWwsIGNhbGxiYWNrOiAoIHRyYWlsOiBUcmFpbCApID0+IHZvaWQsIGV4Y2x1ZGVFbmRUcmFpbHM6IGJvb2xlYW4sIHJvb3ROb2RlOiBOb2RlICk6IHZvaWQge1xuICAgIGNvbnN0IGFQb2ludGVyID0gYSA/IG5ldyBUcmFpbFBvaW50ZXIoIGEuY29weSgpLCB0cnVlICkgOiBuZXcgVHJhaWxQb2ludGVyKCBuZXcgVHJhaWwoIHJvb3ROb2RlICksIHRydWUgKTtcbiAgICBjb25zdCBiUG9pbnRlciA9IGIgPyBuZXcgVHJhaWxQb2ludGVyKCBiLmNvcHkoKSwgdHJ1ZSApIDogbmV3IFRyYWlsUG9pbnRlciggbmV3IFRyYWlsKCByb290Tm9kZSApLCBmYWxzZSApO1xuXG4gICAgLy8gaWYgd2UgYXJlIGV4Y2x1ZGluZyBlbmRwb2ludHMsIGp1c3QgYnVtcCB0aGUgcG9pbnRlcnMgdG93YXJkcyBlYWNoIG90aGVyIGJ5IG9uZSBzdGVwXG4gICAgaWYgKCBleGNsdWRlRW5kVHJhaWxzICkge1xuICAgICAgYVBvaW50ZXIubmVzdGVkRm9yd2FyZHMoKTtcbiAgICAgIGJQb2ludGVyLm5lc3RlZEJhY2t3YXJkcygpO1xuXG4gICAgICAvLyB0aGV5IHdlcmUgYWRqYWNlbnQsIHNvIG5vIGNhbGxiYWNrcyB3aWxsIGJlIGV4ZWN1dGVkXG4gICAgICBpZiAoIGFQb2ludGVyLmNvbXBhcmVOZXN0ZWQoIGJQb2ludGVyICkgPT09IDEgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhUG9pbnRlci5kZXB0aEZpcnN0VW50aWwoIGJQb2ludGVyLCBwb2ludGVyID0+IHtcbiAgICAgIGlmICggcG9pbnRlci5pc0JlZm9yZSApIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCBwb2ludGVyLnRyYWlsICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSwgZmFsc2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5kZXggYXQgd2hpY2ggdGhlIHR3byB0cmFpbHMgZGl2ZXJnZS4gSWYgYS5sZW5ndGggPT09IGIubGVuZ3RoID09PSBicmFuY2hJbmRleCwgdGhlIHRyYWlscyBhcmUgaWRlbnRpY2FsXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGJyYW5jaEluZGV4KCBhOiBUcmFpbCwgYjogVHJhaWwgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhLm5vZGVzWyAwIF0gPT09IGIubm9kZXNbIDAgXSwgJ0JyYW5jaCBjaGFuZ2VzIHJlcXVpcmUgcm9vdHMgdG8gYmUgdGhlIHNhbWUnICk7XG5cbiAgICBsZXQgYnJhbmNoSW5kZXg7XG4gICAgY29uc3Qgc2hvcnRlc3RMZW5ndGggPSBNYXRoLm1pbiggYS5sZW5ndGgsIGIubGVuZ3RoICk7XG4gICAgZm9yICggYnJhbmNoSW5kZXggPSAwOyBicmFuY2hJbmRleCA8IHNob3J0ZXN0TGVuZ3RoOyBicmFuY2hJbmRleCsrICkge1xuICAgICAgaWYgKCBhLm5vZGVzWyBicmFuY2hJbmRleCBdICE9PSBiLm5vZGVzWyBicmFuY2hJbmRleCBdICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBzdWJ0cmFpbCBmcm9tIHRoZSByb290IHRoYXQgYm90aCB0cmFpbHMgc2hhcmVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2hhcmVkVHJhaWwoIGE6IFRyYWlsLCBiOiBUcmFpbCApOiBUcmFpbCB7XG4gICAgcmV0dXJuIGEuc2xpY2UoIDAsIFRyYWlsLmJyYW5jaEluZGV4KCBhLCBiICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gdHJhaWxSZXN1bHRzIC0gV2lsbCBiZSBtdXRlZCBieSBhcHBlbmRpbmcgbWF0Y2hpbmcgdHJhaWxzXG4gICAqIEBwYXJhbSB0cmFpbFxuICAgKiBAcGFyYW0gcHJlZGljYXRlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFwcGVuZEFuY2VzdG9yVHJhaWxzV2l0aFByZWRpY2F0ZSggdHJhaWxSZXN1bHRzOiBUcmFpbFtdLCB0cmFpbDogVHJhaWwsIHByZWRpY2F0ZTogKCBub2RlOiBOb2RlICkgPT4gYm9vbGVhbiApOiB2b2lkIHtcbiAgICBjb25zdCByb290ID0gdHJhaWwucm9vdE5vZGUoKTtcblxuICAgIGlmICggcHJlZGljYXRlKCByb290ICkgKSB7XG4gICAgICB0cmFpbFJlc3VsdHMucHVzaCggdHJhaWwuY29weSgpICk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50Q291bnQgPSByb290Ll9wYXJlbnRzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJlbnRDb3VudDsgaSsrICkge1xuICAgICAgY29uc3QgcGFyZW50ID0gcm9vdC5fcGFyZW50c1sgaSBdO1xuXG4gICAgICB0cmFpbC5hZGRBbmNlc3RvciggcGFyZW50ICk7XG4gICAgICBUcmFpbC5hcHBlbmRBbmNlc3RvclRyYWlsc1dpdGhQcmVkaWNhdGUoIHRyYWlsUmVzdWx0cywgdHJhaWwsIHByZWRpY2F0ZSApO1xuICAgICAgdHJhaWwucmVtb3ZlQW5jZXN0b3IoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHRyYWlsUmVzdWx0cyAtIFdpbGwgYmUgbXV0ZWQgYnkgYXBwZW5kaW5nIG1hdGNoaW5nIHRyYWlsc1xuICAgKiBAcGFyYW0gdHJhaWxcbiAgICogQHBhcmFtIHByZWRpY2F0ZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhcHBlbmREZXNjZW5kYW50VHJhaWxzV2l0aFByZWRpY2F0ZSggdHJhaWxSZXN1bHRzOiBUcmFpbFtdLCB0cmFpbDogVHJhaWwsIHByZWRpY2F0ZTogKCBub2RlOiBOb2RlICkgPT4gYm9vbGVhbiApOiB2b2lkIHtcbiAgICBjb25zdCBsYXN0Tm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICBpZiAoIHByZWRpY2F0ZSggbGFzdE5vZGUgKSApIHtcbiAgICAgIHRyYWlsUmVzdWx0cy5wdXNoKCB0cmFpbC5jb3B5KCkgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZENvdW50ID0gbGFzdE5vZGUuX2NoaWxkcmVuLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZENvdW50OyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGxhc3ROb2RlLl9jaGlsZHJlblsgaSBdO1xuXG4gICAgICB0cmFpbC5hZGREZXNjZW5kYW50KCBjaGlsZCwgaSApO1xuICAgICAgVHJhaWwuYXBwZW5kRGVzY2VuZGFudFRyYWlsc1dpdGhQcmVkaWNhdGUoIHRyYWlsUmVzdWx0cywgdHJhaWwsIHByZWRpY2F0ZSApO1xuICAgICAgdHJhaWwucmVtb3ZlRGVzY2VuZGFudCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEZpcmVzIHN1YnRyZWUodHJhaWwpIG9yIHNlbGYodHJhaWwpIG9uIHRoZSBjYWxsYmFja3MgdG8gY3JlYXRlIGRpc2pvaW50IHN1YnRyZWVzICh0cmFpbHMpIHRoYXQgY292ZXIgZXhhY3RseSB0aGUgbm9kZXNcbiAgICogaW5jbHVzaXZlbHkgYmV0d2VlbiBhIGFuZCBiIGluIHJlbmRlcmluZyBvcmRlci5cbiAgICogV2UgdHJ5IHRvIGNvbnNvbGlkYXRlIHRoZXNlIGFzIG11Y2ggYXMgcG9zc2libGUuXG4gICAqXG4gICAqIFwiYVwiIGFuZCBcImJcIiBhcmUgdHJlYXRlZCBsaWtlIHNlbGYgcGFpbnRlZCB0cmFpbHMgaW4gdGhlIHJlbmRlcmluZyBvcmRlclxuICAgKlxuICAgKlxuICAgKiBFeGFtcGxlIHRyZWU6XG4gICAqICAgYVxuICAgKiAgIC0gYlxuICAgKiAgIC0tLSBjXG4gICAqICAgLS0tIGRcbiAgICogICAtIGVcbiAgICogICAtLS0gZlxuICAgKiAgIC0tLS0tIGdcbiAgICogICAtLS0tLSBoXG4gICAqICAgLS0tLS0gaVxuICAgKiAgIC0tLSBqXG4gICAqICAgLS0tLS0ga1xuICAgKiAgIC0gbFxuICAgKiAgIC0gbVxuICAgKiAgIC0tLSBuXG4gICAqXG4gICAqIHNwYW5uZWRTdWJ0cmVlcyggYSwgYSApIC0+IHNlbGYoIGEgKTtcbiAgICogc3Bhbm5lZFN1YnRyZWVzKCBjLCBuICkgLT4gc3VidHJlZSggYSApOyBOT1RFOiBpZiBiIGlzIHBhaW50ZWQsIHRoYXQgd291bGRuJ3Qgd29yayFcbiAgICogc3Bhbm5lZFN1YnRyZWVzKCBoLCBsICkgLT4gc3VidHJlZSggaCApOyBzdWJ0cmVlKCBpICk7IHN1YnRyZWUoIGogKTsgc2VsZiggbCApO1xuICAgKiBzcGFubmVkU3VidHJlZXMoIGMsIGkgKSAtPiBbYixmXSAtLS0gd2FpdCwgaW5jbHVkZSBlIHNlbGY/XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNwYW5uZWRTdWJ0cmVlcyggYTogVHJhaWwsIGI6IFRyYWlsICk6IHZvaWQge1xuICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIGEubm9kZXNbMF0gPT09IGIubm9kZXNbMF0sICdTcGFubmVkIHN1YnRyZWVzIGZvciBhIGFuZCBiIHJlcXVpcmVzIHRoYXQgYSBhbmQgYiBoYXZlIHRoZSBzYW1lIHJvb3QnICk7XG5cbiAgICAvLyBhLnJlaW5kZXgoKTtcbiAgICAvLyBiLnJlaW5kZXgoKTtcblxuICAgIC8vIHZhciBzdWJ0cmVlcyA9IFtdO1xuXG4gICAgLy8gdmFyIGJyYW5jaEluZGV4ID0gVHJhaWwuYnJhbmNoSW5kZXgoIGEsIGIgKTtcbiAgICAvLyBhc3NlcnQgJiYgYXNzZXJ0KCBicmFuY2hJbmRleCA+IDAsICdCcmFuY2ggaW5kZXggc2hvdWxkIGFsd2F5cyBiZSA+IDAnICk7XG5cbiAgICAvLyBpZiAoIGEubGVuZ3RoID09PSBicmFuY2hJbmRleCAmJiBiLmxlbmd0aCA9PT0gYnJhbmNoSW5kZXggKSB7XG4gICAgLy8gICAvLyB0aGUgdHdvIHRyYWlscyBhcmUgZXF1YWxcbiAgICAvLyAgIHN1YnRyZWVzLnB1c2goIGEgKTtcbiAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgLy8gZmluZCB0aGUgZmlyc3QgcGxhY2Ugd2hlcmUgb3VyIHN0YXJ0IGlzbid0IHRoZSBmaXJzdCBjaGlsZFxuICAgIC8vICAgZm9yICggdmFyIGJlZm9yZSA9IGEubGVuZ3RoIC0gMTsgYmVmb3JlID49IGJyYW5jaEluZGV4OyBiZWZvcmUtLSApIHtcbiAgICAvLyAgICAgaWYgKCBhLmluZGljZXNbYmVmb3JlLTFdICE9PSAwICkge1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG5cbiAgICAvLyAgIC8vIGZpbmQgdGhlIGZpcnN0IHBsYWNlIHdoZXJlIG91ciBlbmQgaXNuJ3QgdGhlIGxhc3QgY2hpbGRcbiAgICAvLyAgIGZvciAoIHZhciBhZnRlciA9IGEubGVuZ3RoIC0gMTsgYWZ0ZXIgPj0gYnJhbmNoSW5kZXg7IGFmdGVyLS0gKSB7XG4gICAgLy8gICAgIGlmICggYi5pbmRpY2VzW2FmdGVyLTFdICE9PSBiLm5vZGVzW2FmdGVyLTFdLl9jaGlsZHJlbi5sZW5ndGggLSAxICkge1xuICAgIC8vICAgICAgIGJyZWFrO1xuICAgIC8vICAgICB9XG4gICAgLy8gICB9XG5cbiAgICAvLyAgIGlmICggYmVmb3JlIDwgYnJhbmNoSW5kZXggJiYgYWZ0ZXIgPCBicmFuY2hJbmRleCApIHtcbiAgICAvLyAgICAgLy8gd2Ugc3BhbiB0aGUgZW50aXJlIHRyZWUgdXAgdG8gbm9kZXNbYnJhbmNoSW5kZXgtMV0sIHNvIHJldHVybiBvbmx5IHRoYXQgc3VidHJlZVxuICAgIC8vICAgICBzdWJ0cmVlcy5wdXNoKCBhLnNsaWNlKCAwLCBicmFuY2hJbmRleCApICk7XG4gICAgLy8gICB9IGVsc2Uge1xuICAgIC8vICAgICAvLyB3YWxrIHRoZSBzdWJ0cmVlcyBkb3duIGZyb20gdGhlIHN0YXJ0XG4gICAgLy8gICAgIGZvciAoIHZhciBpYSA9IGJlZm9yZTsgaWEgPj0gYnJhbmNoSW5kZXg7IGlhLS0gKSB7XG4gICAgLy8gICAgICAgc3VidHJlZXMucHVzaCggYS5zbGljZSggMCwgaWEgKyAxICkgKTtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIC8vIHdhbGsgdGhyb3VnaCB0aGUgbWlkZGxlXG4gICAgLy8gICAgIHZhciBpU3RhcnQgPSBhLmluZGljZXNbYnJhbmNoSW5kZXgtMV07XG4gICAgLy8gICAgIHZhciBpRW5kID0gYi5pbmRpY2VzW2JyYW5jaEluZGV4LTFdO1xuICAgIC8vICAgICB2YXIgYmFzZSA9IGEuc2xpY2UoIDAsIGJyYW5jaEluZGV4ICk7XG4gICAgLy8gICAgIHZhciBjaGlsZHJlbiA9IGJhc2UubGFzdE5vZGUoKS5fY2hpbGRyZW47XG4gICAgLy8gICAgIGZvciAoIHZhciBpbSA9IGlTdGFydDsgaW0gPD0gaUVuZDsgaW0rKyApIHtcbiAgICAvLyAgICAgICBzdWJ0cmVlcy5wdXNoKCBiYXNlLmNvcHkoKS5hZGREZXNjZW5kYW50KCBjaGlsZHJlbltpbV0sIGltICkgKTtcbiAgICAvLyAgICAgfVxuXG4gICAgLy8gICAgIC8vIHdhbGsgdGhlIHN1YnRyZWVzIHVwIHRvIHRoZSBlbmRcbiAgICAvLyAgICAgZm9yICggdmFyIGliID0gYnJhbmNoSW5kZXg7IGliIDw9IGFmdGVyOyBpYisrICkge1xuICAgIC8vICAgICAgIHN1YnRyZWVzLnB1c2goIGIuc2xpY2UoIDAsIGliICsgMSApICk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyB9XG5cbiAgICAvLyByZXR1cm4gc3VidHJlZXM7XG4gIH1cblxuICAvKipcbiAgICogUmUtY3JlYXRlIGEgdHJhaWwgdG8gYSByb290IG5vZGUgZnJvbSBhbiBleGlzdGluZyBUcmFpbCBpZC4gVGhlIHJvb3ROb2RlIG11c3QgaGF2ZSB0aGUgc2FtZSBJZCBhcyB0aGUgZmlyc3RcbiAgICogTm9kZSBpZCBvZiB1bmlxdWVJZC5cbiAgICpcbiAgICogQHBhcmFtIHJvb3ROb2RlIC0gdGhlIHJvb3Qgb2YgdGhlIHRyYWlsIGJlaW5nIGNyZWF0ZWRcbiAgICogQHBhcmFtIHVuaXF1ZUlkIC0gaW50ZWdlcnMgc2VwYXJhdGVkIGJ5IElEX1NFUEFSQVRPUiwgc2VlIGdldFVuaXF1ZUlkXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21VbmlxdWVJZCggcm9vdE5vZGU6IE5vZGUsIHVuaXF1ZUlkOiBzdHJpbmcgKTogVHJhaWwge1xuICAgIGNvbnN0IHRyYWlsSWRzID0gdW5pcXVlSWQuc3BsaXQoIElEX1NFUEFSQVRPUiApO1xuICAgIGNvbnN0IHRyYWlsSWROdW1iZXJzID0gdHJhaWxJZHMubWFwKCBpZCA9PiBOdW1iZXIoIGlkICkgKTtcblxuICAgIGxldCBjdXJyZW50Tm9kZSA9IHJvb3ROb2RlO1xuXG4gICAgY29uc3Qgcm9vdElkID0gdHJhaWxJZE51bWJlcnMuc2hpZnQoKTtcbiAgICBjb25zdCBub2RlcyA9IFsgY3VycmVudE5vZGUgXTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJvb3RJZCA9PT0gcm9vdE5vZGUuaWQgKTtcblxuICAgIHdoaWxlICggdHJhaWxJZE51bWJlcnMubGVuZ3RoID4gMCApIHtcbiAgICAgIGNvbnN0IHRyYWlsSWQgPSB0cmFpbElkTnVtYmVycy5zaGlmdCgpO1xuXG4gICAgICAvLyBpZiBhY2Nlc3NpYmxlIG9yZGVyIGlzIHNldCwgdGhlIHRyYWlsIG1pZ2h0IG5vdCBtYXRjaCB0aGUgaGllcmFyY2h5IG9mIGNoaWxkcmVuIC0gc2VhcmNoIHRocm91Z2ggbm9kZXNcbiAgICAgIC8vIGluIHBkb21PcmRlciBmaXJzdCBiZWNhdXNlIHBkb21PcmRlciBpcyBhbiBvdmVycmlkZSBmb3Igc2NlbmUgZ3JhcGggc3RydWN0dXJlXG4gICAgICBjb25zdCBwZG9tT3JkZXIgPSBjdXJyZW50Tm9kZS5wZG9tT3JkZXIgfHwgW107XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHBkb21PcmRlci5jb25jYXQoIGN1cnJlbnROb2RlLmNoaWxkcmVuICk7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcblxuICAgICAgICAvLyBwZG9tT3JkZXIgc3VwcG9ydHMgbnVsbCBlbnRyaWVzIHRvIGZpbGwgaW4gd2l0aCBkZWZhdWx0IG9yZGVyXG4gICAgICAgIGlmICggY2hpbGRyZW5bIGogXSAhPT0gbnVsbCAmJiBjaGlsZHJlblsgaiBdIS5pZCA9PT0gdHJhaWxJZCApIHtcbiAgICAgICAgICBjb25zdCBjaGlsZEFsb25nVHJhaWwgPSBjaGlsZHJlblsgaiBdITtcbiAgICAgICAgICBub2Rlcy5wdXNoKCBjaGlsZEFsb25nVHJhaWwgKTtcbiAgICAgICAgICBjdXJyZW50Tm9kZSA9IGNoaWxkQWxvbmdUcmFpbDtcblxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaiAhPT0gY2hpbGRyZW4ubGVuZ3RoIC0gMSwgJ3VuYWJsZSB0byBmaW5kIG5vZGUgZnJvbSB1bmlxdWUgVHJhaWwgaWQnICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBUcmFpbCggbm9kZXMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVHJhaWwnLCBUcmFpbCApOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIk5vZGUiLCJQRE9NVXRpbHMiLCJzY2VuZXJ5IiwiVHJhaWxQb2ludGVyIiwiSURfU0VQQVJBVE9SIiwiUERPTV9VTklRVUVfSURfU0VQQVJBVE9SIiwiVHJhaWwiLCJjb3B5IiwiaXNQYWludGVkIiwibGFzdE5vZGUiLCJpc1ZhbGlkIiwicmVpbmRleCIsImluZGV4TGVuZ3RoIiwiaW5kaWNlcyIsImxlbmd0aCIsImkiLCJpc1Zpc2libGUiLCJub2RlcyIsImlzUERPTVZpc2libGUiLCJnZXRPcGFjaXR5Iiwib3BhY2l0eSIsImlzUGlja2FibGUiLCJfIiwic29tZSIsIm5vZGUiLCJwaWNrYWJsZSIsInZpc2libGUiLCJfaW5wdXRMaXN0ZW5lcnMiLCJwaWNrYWJsZVByb3BlcnR5IiwidmFsdWUiLCJnZXQiLCJpbmRleCIsInNsaWNlIiwic3RhcnRJbmRleCIsImVuZEluZGV4Iiwic3VidHJhaWxUbyIsImV4Y2x1ZGVOb2RlIiwiaW5kZXhPZiIsImlzRW1wdHkiLCJnZXRNYXRyaXhDb25jYXRlbmF0aW9uIiwic3RhcnRpbmdJbmRleCIsImVuZGluZ0luZGV4IiwibWF0cml4IiwiaWRlbnRpdHkiLCJtdWx0aXBseU1hdHJpeCIsImdldE1hdHJpeCIsImdldEFuY2VzdG9yTWF0cml4IiwiZ2V0UGFyZW50TWF0cml4IiwiZ2V0QW5jZXN0b3JQYXJlbnRNYXRyaXgiLCJnZXRUcmFuc2Zvcm0iLCJnZXRQYXJlbnRUcmFuc2Zvcm0iLCJhZGRBbmNlc3RvciIsImFzc2VydCIsImltbXV0YWJsZSIsIm9sZFJvb3QiLCJ1bnNoaWZ0IiwidW5kZWZpbmVkIiwiX2NoaWxkcmVuIiwidW5pcXVlSWQiLCJpZCIsInJlbW92ZUFuY2VzdG9yIiwic2hpZnQiLCJ1cGRhdGVVbmlxdWVJZCIsImFkZERlc2NlbmRhbnQiLCJwYXJlbnQiLCJwdXNoIiwicmVtb3ZlRGVzY2VuZGFudCIsInBvcCIsImFkZERlc2NlbmRhbnRUcmFpbCIsInRyYWlsIiwicmVtb3ZlRGVzY2VuZGFudFRyYWlsIiwiY3VycmVudEluZGV4IiwiYmFzZU5vZGUiLCJzZXRJbW11dGFibGUiLCJzZXRNdXRhYmxlIiwiYXJlSW5kaWNlc1ZhbGlkIiwiZXF1YWxzIiwib3RoZXIiLCJ1cFRvTm9kZSIsIm5vZGVJbmRleCIsImlzRXh0ZW5zaW9uT2YiLCJhbGxvd1NhbWVUcmFpbCIsImNvbnRhaW5zTm9kZSIsImluY2x1ZGVzIiwiZ2V0VHJhbnNmb3JtVG8iLCJvdGhlclRyYWlsIiwiZ2V0TWF0cml4VG8iLCJicmFuY2hJbmRleCIsImdldEJyYW5jaEluZGV4VG8iLCJpZHgiLCJJREVOVElUWSIsInRpbWVzTWF0cml4IiwiZ2V0SW52ZXJzZSIsIm1pbiIsIk1hdGgiLCJnZXRMYXN0SW5wdXRFbmFibGVkSW5kZXgiLCJ0cmFpbFN0YXJ0SW5kZXgiLCJqIiwiaW5wdXRFbmFibGVkIiwiZ2V0Q3Vyc29yQ2hlY2tJbmRleCIsIm5vZGVGcm9tVG9wIiwib2Zmc2V0Iiwicm9vdE5vZGUiLCJwcmV2aW91cyIsInRvcCIsInBhcmVudEluZGV4IiwiYXJyIiwibGFzdCIsInByZXZpb3VzUGFpbnRlZCIsInJlc3VsdCIsIm5leHQiLCJkZXB0aCIsIm5leHRQYWludGVkIiwiZWFjaFRyYWlsVW5kZXIiLCJjYWxsYmFjayIsImVhY2hUcmFpbEJldHdlZW4iLCJjb21wYXJlIiwiYXNzZXJ0U2xvdyIsInRvU3RyaW5nIiwibWluTm9kZUluZGV4IiwiY2hpbGRyZW4iLCJpc0JlZm9yZSIsImlzQWZ0ZXIiLCJsb2NhbFRvR2xvYmFsUG9pbnQiLCJwb2ludCIsInRpbWVzVmVjdG9yMiIsImxvY2FsVG9HbG9iYWxCb3VuZHMiLCJib3VuZHMiLCJ0cmFuc2Zvcm1lZCIsImdsb2JhbFRvTG9jYWxQb2ludCIsImludmVyc2VQb3NpdGlvbjIiLCJnbG9iYWxUb0xvY2FsQm91bmRzIiwiaW52ZXJzZUJvdW5kczIiLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwicGFyZW50VG9HbG9iYWxCb3VuZHMiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiZ2xvYmFsVG9QYXJlbnRCb3VuZHMiLCJsZW4iLCJfaWQiLCJnZXRVbmlxdWVJZCIsIm9sZFVuaXF1ZUlkIiwiam9pbiIsInRvUGF0aFN0cmluZyIsIm1hcCIsIm4iLCJzdHJpbmciLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJ0b0RlYnVnU3RyaW5nIiwiZWFjaFBhaW50ZWRUcmFpbEJldHdlZW4iLCJhIiwiYiIsImV4Y2x1ZGVFbmRUcmFpbHMiLCJhUG9pbnRlciIsImJQb2ludGVyIiwibmVzdGVkRm9yd2FyZHMiLCJuZXN0ZWRCYWNrd2FyZHMiLCJjb21wYXJlTmVzdGVkIiwiZGVwdGhGaXJzdFVudGlsIiwicG9pbnRlciIsInNob3J0ZXN0TGVuZ3RoIiwic2hhcmVkVHJhaWwiLCJhcHBlbmRBbmNlc3RvclRyYWlsc1dpdGhQcmVkaWNhdGUiLCJ0cmFpbFJlc3VsdHMiLCJwcmVkaWNhdGUiLCJyb290IiwicGFyZW50Q291bnQiLCJfcGFyZW50cyIsImFwcGVuZERlc2NlbmRhbnRUcmFpbHNXaXRoUHJlZGljYXRlIiwiY2hpbGRDb3VudCIsImNoaWxkIiwic3Bhbm5lZFN1YnRyZWVzIiwiZnJvbVVuaXF1ZUlkIiwidHJhaWxJZHMiLCJzcGxpdCIsInRyYWlsSWROdW1iZXJzIiwiTnVtYmVyIiwiY3VycmVudE5vZGUiLCJyb290SWQiLCJ0cmFpbElkIiwicGRvbU9yZGVyIiwiY29uY2F0IiwiY2hpbGRBbG9uZ1RyYWlsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7OztDQWFDLEdBR0QsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUV2RCxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLFFBQVEsZ0JBQWdCO0FBRXZFLFlBQVk7QUFDWixNQUFNQyxlQUFlSCxVQUFVSSx3QkFBd0I7QUFJeEMsSUFBQSxBQUFNQyxRQUFOLE1BQU1BO0lBOERuQjs7R0FFQyxHQUNELEFBQU9DLE9BQWM7UUFDbkIsT0FBTyxJQUFJRCxNQUFPLElBQUk7SUFDeEI7SUFFQTs7R0FFQyxHQUNELEFBQU9FLFlBQXFCO1FBQzFCLE9BQU8sSUFBSSxDQUFDQyxRQUFRLEdBQUdELFNBQVM7SUFDbEM7SUFFQTs7R0FFQyxHQUNELEFBQU9FLFVBQW1CO1FBQ3hCLElBQUksQ0FBQ0MsT0FBTztRQUVaLE1BQU1DLGNBQWMsSUFBSSxDQUFDQyxPQUFPLENBQUNDLE1BQU07UUFDdkMsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElB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