// Copyright 2014-2023, University of Colorado Boulder
/**
 * RelativeTransform is a component of an Instance. It is responsible for tracking changes to "relative" transforms, and
 * computing them in an efficient manner.
 *
 * A "relative" transform here is the transform that a Trail would have, not necessarily rooted at the display's root.
 * Imagine we have a CSS-transformed backbone div, and nodes underneath that render to Canvas. On the Canvas, we will
 * need to set the context's transform to the matrix that will transform from the displayed instances' local coordinates
 * frames to the CSS-transformed backbone instance. Notably, transforming the backbone instance or any of its ancestors
 * does NOT affect this "relative" transform from the instance to the displayed instances, while any Node transform
 * changes between (not including) the backbone instance and (including) the displayed instance WILL affect that
 * relative transform. This is key to setting the CSS transform on backbones, DOM nodes, having the transforms necessary
 * for the fastest Canvas display, and determining fitting bounds for layers.
 *
 * Each Instance has its own "relative trail", although these aren't stored. We use implicit hierarchies in the Instance
 * tree for this purpose. If an Instance is a CSS-transformed backbone, or any other case that requires drawing beneath
 * to be done relative to its local coordinate frame, we call it a transform "root", and it has instance.isTransformed
 * set to true. This should NEVER change for an instance (any changes that would do this require reconstructing the
 * instance tree).
 *
 * There are implicit hierarchies for each root, with trails starting from that root's children (they won't apply that
 * root's transform since we assume we are working within that root's local coordinate frame). These should be
 * effectively independent (if there are no bugs), so that flags affecting one implicit hierarchy will not affect the
 * other (dirty flags, etc.), and traversals should not cross these boundaries.
 *
 * For various purposes, we want a system that can:
 * - every frame before repainting: notify listeners on instances whether its relative transform has changed
 *                                  (add|removeListener)
 * - every frame before repainting: precompute relative transforms on instances where we know this is required
 *                                  (add|removePrecompute)
 * - any time during repainting:    provide an efficient way to lazily compute relative transforms when needed
 *
 * This is done by first having one step in the pre-repaint phase that traverses the tree where necessary, notifying
 * relative transform listeners, and precomputing relative transforms when they have changed (and precomputation is
 * requested). This traversal leaves metadata on the instances so that we can (fairly) efficiently force relative
 * transform "validation" any time afterwards that makes sure the matrix property is up-to-date.
 *
 * First of all, to ensure we traverse the right parts of the tree, we need to keep metadata on what needs to be
 * traversed. This is done by tracking counts of listeners/precompution needs, both on the instance itself, and how many
 * children have these needs. We use counts instead of boolean flags so that we can update this quickly while (a) never
 * requiring full children scans to update this metadata, and (b) minimizing the need to traverse all the way up to the
 * root to update the metadata. The end result is hasDescendantListenerNeed and hasDescendantComputeNeed which compute,
 * respectively, whether we need to traverse this instance for listeners and precomputation. Additionally,
 * hasAncestorListenerNeed and hasAncestorComputeNeed compute whether our parent needs to traverse up to us.
 *
 * The other tricky bits to remember for this traversal are the flags it sets, and how later validation uses and updates
 * these flags. First of all, we have relativeSelfDirty and relativeChildDirtyFrame. When a node's transform changes,
 * we mark relativeSelfDirty on the node, and relativeChildDirtyFrame for all ancestors up to (and including) the
 * transform root. relativeChildDirtyFrame allows us to prune our traversal to only modified subtrees. Additionally, so
 * that we can retain the invariant that it is "set" parent node if it is set on a child, we store the rendering frame
 * ID (unique to traversals) instead of a boolean true/false. Our traversal may skip subtrees where
 * relativeChildDirtyFrame is "set" due to no listeners or precomputation needed for that subtree, so if we used
 * booleans this would be violated. Violating that invariant would prevent us from "bailing out" when setting the
 * relativeChildDirtyFrame flag, and on EVERY transform change we would have to traverse ALL of the way to the root
 * (instead of the efficient "stop at the ancestor where it is also set").
 *
 * relativeSelfDirty is initially set on instances whose nodes had transform changes (they mark that this relative
 * transform, and all transforms beneath, are dirty). We maintain the invariant that if a relative transform needs to be
 * recomputed, it or one of its ancestors WILL ALWAYS have this flag set. This is required so that later validation of
 * the relative transform can verify whether it has been changed in an efficient way. When we recompute the relative
 * transform for one instance, we have to set this flag on all children to maintain this invariant.
 *
 * Additionally, so that we can have fast "validation" speed, we also store into relativeFrameId the last rendering
 * frame ID (counter) where we either verified that the relative transform is up to date, or we have recomputed it. Thus
 * when "validating" a relative transform that wasn't precomputed, we only need to scan up the ancestors to the first
 * one that was verified OK this frame (boolean flags are insufficient for this, since we would have to clear them all
 * to false on every frame, requiring a full tree traversal). In the future, we may set this flag to the frame
 * proactively during traversal to speed up validation, but that is not done at the time of this writing.
 *
 * Some helpful notes for the scope of various relativeTransform bits:
 *                         (transformRoot) (regular) (regular) (transformRoot)
 * relativeChildDirtyFrame [---------------------------------]                 (int)
 * relativeSelfDirty                       [---------------------------------]
 * matrix                                  [---------------------------------] (transform on root applies to
 *                                                                             its parent context)
 * relativeFrameId                         [---------------------------------] (int)
 * child counts            [---------------------------------]                 (e.g. relativeChildrenListenersCount,
 *                                                                             relativeChildrenPrecomputeCount)
 * self counts                             [---------------------------------] (e.g. relativePrecomputeCount,
 *                                                                             relativeTransformListeners.length)
 **********************
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import { scenery } from '../imports.js';
let RelativeTransform = class RelativeTransform {
    /**
   * Responsible for initialization and cleaning of this. If the parameters are both null, we'll want to clean our
   * external references (like Instance does).
   * @public
   *
   * @param {Display|null} display
   * @param {Trail|null} trail
   * @returns {RelativeTransform} - Returns this, to allow chaining.
   */ initialize(display, trail) {
        this.display = display;
        this.trail = trail;
        this.node = trail && trail.lastNode();
        // properties relevant to the node's direct transform
        this.transformDirty = true; // whether the node's transform has changed (until the pre-repaint phase)
        this.nodeTransformListener = this.nodeTransformListener || this.onNodeTransformDirty.bind(this);
        // the actual cached transform to the root
        this.matrix = this.matrix || Matrix3.identity();
        // whether our matrix is dirty
        this.relativeSelfDirty = true;
        // how many children have (or have descendants with) relativeTransformListeners
        this.relativeChildrenListenersCount = 0;
        // if >0, indicates this should be precomputed in the pre-repaint phase
        this.relativePrecomputeCount = 0;
        // how many children have (or have descendants with) >0 relativePrecomputeCount
        this.relativeChildrenPrecomputeCount = 0;
        // used to mark what frame the transform was updated in (to accelerate non-precomputed relative transform access)
        this.relativeFrameId = -1;
        // Whether children have dirty transforms (if it is the current frame) NOTE: used only for pre-repaint traversal,
        // and can be ignored if it has a value less than the current frame ID. This allows us to traverse and hit all
        // listeners for this particular traversal, without leaving an invalid subtree (a boolean flag here is
        // insufficient, since our traversal handling would validate our invariant of
        // this.relativeChildDirtyFrame => parent.relativeChildDirtyFrame). In this case, they are both effectively
        // "false" unless they are the current frame ID, in which case that invariant holds.
        this.relativeChildDirtyFrame = display ? display._frameId : 0;
        // will be notified in pre-repaint phase that our relative transform has changed (but not computed by default)
        //OHTWO TODO: should we rely on listeners removing themselves? https://github.com/phetsims/scenery/issues/1581
        this.relativeTransformListeners = cleanArray(this.relativeTransformListeners);
        return this; // allow chaining
    }
    /**
   * @public
   *
   * @returns {RelativeTransform|null}
   */ get parent() {
        return this.instance.parent ? this.instance.parent.relativeTransform : null;
    }
    /**
   * @public
   *
   * @param {Instance} instance
   */ addInstance(instance) {
        if (instance.stateless) {
            assert && assert(!instance.relativeTransform.hasAncestorListenerNeed(), 'We only track changes properly if stateless instances do not have needs');
            assert && assert(!instance.relativeTransform.hasAncestorComputeNeed(), 'We only track changes properly if stateless instances do not have needs');
        } else {
            if (instance.relativeTransform.hasAncestorListenerNeed()) {
                this.incrementTransformListenerChildren();
            }
            if (instance.relativeTransform.hasAncestorComputeNeed()) {
                this.incrementTransformPrecomputeChildren();
            }
        }
        // mark the instance's transform as dirty, so that it will be reachable in the pre-repaint traversal pass
        instance.relativeTransform.forceMarkTransformDirty();
    }
    /**
   * @public
   *
   * @param {Instance} instance
   */ removeInstance(instance) {
        if (instance.relativeTransform.hasAncestorListenerNeed()) {
            this.decrementTransformListenerChildren();
        }
        if (instance.relativeTransform.hasAncestorComputeNeed()) {
            this.decrementTransformPrecomputeChildren();
        }
    }
    /**
   * @public
   */ attachNodeListeners() {
        this.node.transformEmitter.addListener(this.nodeTransformListener);
    }
    /**
   * @public
   */ detachNodeListeners() {
        this.node.transformEmitter.removeListener(this.nodeTransformListener);
    }
    /*---------------------------------------------------------------------------*
   * Relative transform listener count recursive handling
   *----------------------------------------------------------------------------*/ /**
   * Only for descendants need, ignores 'self' need on isTransformed
   * @private
   *
   * @returns {boolean}
   */ hasDescendantListenerNeed() {
        if (this.instance.isTransformed) {
            return this.relativeChildrenListenersCount > 0;
        } else {
            return this.relativeChildrenListenersCount > 0 || this.relativeTransformListeners.length > 0;
        }
    }
    /**
   * Only for ancestors need, ignores child need on isTransformed
   * @private
   *
   * @returns {boolean}
   */ hasAncestorListenerNeed() {
        if (this.instance.isTransformed) {
            return this.relativeTransformListeners.length > 0;
        } else {
            return this.relativeChildrenListenersCount > 0 || this.relativeTransformListeners.length > 0;
        }
    }
    /**
   * @private
   *
   * @returns {boolean}
   */ hasSelfListenerNeed() {
        return this.relativeTransformListeners.length > 0;
    }
    /**
   * Called on the ancestor of the instance with the need
   * @private
   */ incrementTransformListenerChildren() {
        const before = this.hasAncestorListenerNeed();
        this.relativeChildrenListenersCount++;
        if (before !== this.hasAncestorListenerNeed()) {
            assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
            this.parent && this.parent.incrementTransformListenerChildren();
        }
    }
    /**
   * Called on the ancestor of the instance with the need
   * @private
   */ decrementTransformListenerChildren() {
        const before = this.hasAncestorListenerNeed();
        this.relativeChildrenListenersCount--;
        if (before !== this.hasAncestorListenerNeed()) {
            assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
            this.parent && this.parent.decrementTransformListenerChildren();
        }
    }
    /**
   * Called on the instance itself
   * @public
   *
   * @param {function} listener
   */ addListener(listener) {
        const before = this.hasAncestorListenerNeed();
        this.relativeTransformListeners.push(listener);
        if (before !== this.hasAncestorListenerNeed()) {
            this.parent && this.parent.incrementTransformListenerChildren();
            // if we just went from "not needing to be traversed" to "needing to be traversed", mark ourselves as dirty so
            // that we for-sure get future updates
            if (!this.hasAncestorComputeNeed()) {
                // TODO: can we do better than this? https://github.com/phetsims/scenery/issues/1581
                this.forceMarkTransformDirty();
            }
        }
    }
    /**
   * Called on the instance itself
   * @public
   *
   * @param {function} listener
   */ removeListener(listener) {
        const before = this.hasAncestorListenerNeed();
        // TODO: replace with a 'remove' function call https://github.com/phetsims/scenery/issues/1581
        this.relativeTransformListeners.splice(_.indexOf(this.relativeTransformListeners, listener), 1);
        if (before !== this.hasAncestorListenerNeed()) {
            this.parent && this.parent.decrementTransformListenerChildren();
        }
    }
    /*---------------------------------------------------------------------------*
   * Relative transform precompute flag recursive handling
   *----------------------------------------------------------------------------*/ /**
   * Only for descendants need, ignores 'self' need on isTransformed
   * @private
   *
   * @returns {boolean}
   */ hasDescendantComputeNeed() {
        if (this.instance.isTransformed) {
            return this.relativeChildrenPrecomputeCount > 0;
        } else {
            return this.relativeChildrenPrecomputeCount > 0 || this.relativePrecomputeCount > 0;
        }
    }
    /**
   * Only for ancestors need, ignores child need on isTransformed
   * @private
   *
   * @returns {boolean}
   */ hasAncestorComputeNeed() {
        if (this.instance.isTransformed) {
            return this.relativePrecomputeCount > 0;
        } else {
            return this.relativeChildrenPrecomputeCount > 0 || this.relativePrecomputeCount > 0;
        }
    }
    /**
   * @private
   *
   * @returns {boolean}
   */ hasSelfComputeNeed() {
        return this.relativePrecomputeCount > 0;
    }
    /**
   * Called on the ancestor of the instance with the need
   * @private
   */ incrementTransformPrecomputeChildren() {
        const before = this.hasAncestorComputeNeed();
        this.relativeChildrenPrecomputeCount++;
        if (before !== this.hasAncestorComputeNeed()) {
            assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
            this.parent && this.parent.incrementTransformPrecomputeChildren();
        }
    }
    /**
   * Called on the ancestor of the instance with the need
   * @private
   */ decrementTransformPrecomputeChildren() {
        const before = this.hasAncestorComputeNeed();
        this.relativeChildrenPrecomputeCount--;
        if (before !== this.hasAncestorComputeNeed()) {
            assert && assert(!this.instance.isTransformed, 'Should not be a change in need if we have the isTransformed flag');
            this.parent && this.parent.decrementTransformPrecomputeChildren();
        }
    }
    /**
   * Called on the instance itself
   * @public
   */ addPrecompute() {
        const before = this.hasAncestorComputeNeed();
        this.relativePrecomputeCount++;
        if (before !== this.hasAncestorComputeNeed()) {
            this.parent && this.parent.incrementTransformPrecomputeChildren();
            // if we just went from "not needing to be traversed" to "needing to be traversed", mark ourselves as dirty so
            // that we for-sure get future updates
            if (!this.hasAncestorListenerNeed()) {
                // TODO: can we do better than this? https://github.com/phetsims/scenery/issues/1581
                this.forceMarkTransformDirty();
            }
        }
    }
    /**
   * Called on the instance itself
   * @public
   */ removePrecompute() {
        const before = this.hasAncestorComputeNeed();
        this.relativePrecomputeCount--;
        if (before !== this.hasAncestorComputeNeed()) {
            this.parent && this.parent.decrementTransformPrecomputeChildren();
        }
    }
    /*---------------------------------------------------------------------------*
   * Relative transform handling
   *----------------------------------------------------------------------------*/ /**
   * Called immediately when the corresponding node has a transform change (can happen multiple times between renders)
   * @private
   */ onNodeTransformDirty() {
        if (!this.transformDirty) {
            this.forceMarkTransformDirty();
        }
    }
    /**
   * @private
   */ forceMarkTransformDirty() {
        this.transformDirty = true;
        this.relativeSelfDirty = true;
        const frameId = this.display._frameId;
        // mark all ancestors with relativeChildDirtyFrame, bailing out when possible
        let instance = this.instance.parent;
        while(instance && instance.relativeTransform.relativeChildDirtyFrame !== frameId){
            const parentInstance = instance.parent;
            const isTransformed = instance.isTransformed;
            // NOTE: our while loop guarantees that it wasn't frameId
            instance.relativeTransform.relativeChildDirtyFrame = frameId;
            // always mark an instance without a parent (root instance!)
            if (parentInstance === null) {
                // passTransform depends on whether it is marked as a transform root
                this.display.markTransformRootDirty(instance, isTransformed);
                break;
            } else if (isTransformed) {
                this.display.markTransformRootDirty(instance, true); // passTransform true
                break;
            }
            instance = parentInstance;
        }
    }
    /**
   * Updates our matrix based on any parents, and the node's current transform
   * @private
   */ computeRelativeTransform() {
        const nodeMatrix = this.node.getMatrix();
        if (this.instance.parent && !this.instance.parent.isTransformed) {
            // mutable form of parentMatrix * nodeMatrix
            this.matrix.set(this.parent.matrix);
            this.matrix.multiplyMatrix(nodeMatrix);
        } else {
            // we are the first in the trail transform, so we just directly copy the matrix over
            this.matrix.set(nodeMatrix);
        }
        // mark the frame where this transform was updated, to accelerate non-precomputed access
        this.relativeFrameId = this.display._frameId;
        this.relativeSelfDirty = false;
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ isValidationNotNeeded() {
        return this.hasAncestorComputeNeed() || this.relativeFrameId === this.display._frameId;
    }
    /**
   * Called from any place in the rendering process where we are not guaranteed to have a fresh relative transform.
   * needs to scan up the tree, so it is more expensive than precomputed transforms.
   * @returns Whether we had to update this transform
   * @public
   */ validate() {
        // if we are clean, bail out. If we have a compute "need", we will always be clean here since this is after the
        // traversal step. If we did not have a compute "need", we check whether we were already updated this frame by
        // computeRelativeTransform.
        if (this.isValidationNotNeeded()) {
            return;
        }
        // if we are not the first transform from the root, validate our parent. isTransform check prevents us from
        // passing a transform root.
        if (this.instance.parent && !this.instance.parent.isTransformed) {
            this.parent.validate();
        }
        // validation of the parent may have changed our relativeSelfDirty flag to true, so we check now (could also have
        // been true before)
        if (this.relativeSelfDirty) {
            // compute the transform, and mark us as not relative-dirty
            this.computeRelativeTransform();
            // mark all children now as dirty, since we had to update (marked so that other children from the one we are
            // validating will know that they need updates)
            // if we were called from a child's validate(), they will now need to compute their transform
            const len = this.instance.children.length;
            for(let i = 0; i < len; i++){
                this.instance.children[i].relativeTransform.relativeSelfDirty = true;
            }
        }
    }
    /**
   * Called during the pre-repaint phase to (a) fire off all relative transform listeners that should be fired, and
   * (b) precompute transforms were desired.
   * @public
   *
   * @param {boolean} ancestorWasDirty
   * @param {boolean} ancestorIsDirty
   * @param {number} frameId
   * @param {boolean} passTransform
   */ updateTransformListenersAndCompute(ancestorWasDirty, ancestorIsDirty, frameId, passTransform) {
        sceneryLog && sceneryLog.RelativeTransform && sceneryLog.RelativeTransform(`update/compute: ${this.toString()} ${ancestorWasDirty} => ${ancestorIsDirty}${passTransform ? ' passTransform' : ''}`);
        sceneryLog && sceneryLog.RelativeTransform && sceneryLog.push();
        let len;
        let i;
        if (passTransform) {
            // if we are passing isTransform, just apply this to the children
            len = this.instance.children.length;
            for(i = 0; i < len; i++){
                this.instance.children[i].relativeTransform.updateTransformListenersAndCompute(false, false, frameId, false);
            }
        } else {
            const wasDirty = ancestorWasDirty || this.relativeSelfDirty;
            const wasSubtreeDirty = wasDirty || this.relativeChildDirtyFrame === frameId;
            const hasComputeNeed = this.hasDescendantComputeNeed();
            const hasListenerNeed = this.hasDescendantListenerNeed();
            const hasSelfComputeNeed = this.hasSelfComputeNeed();
            const hasSelfListenerNeed = this.hasSelfListenerNeed();
            // if our relative transform will be dirty but our parents' transform will be clean, we need to mark ourselves
            // as dirty (so that later access can identify we are dirty).
            if (!hasComputeNeed && wasDirty && !ancestorIsDirty) {
                this.relativeSelfDirty = true;
            }
            // check if traversal isn't needed (no instances marked as having listeners or needing computation)
            // either the subtree is clean (no traversal needed for compute/listeners), or we have no compute/listener needs
            if (!wasSubtreeDirty || !hasComputeNeed && !hasListenerNeed && !hasSelfComputeNeed && !hasSelfListenerNeed) {
                sceneryLog && sceneryLog.RelativeTransform && sceneryLog.pop();
                return;
            }
            // if desired, compute the transform
            if (wasDirty && (hasComputeNeed || hasSelfComputeNeed)) {
                // compute this transform in the pre-repaint phase, so it is cheap when always used/
                // we update when the child-precompute count >0, since those children will need
                this.computeRelativeTransform();
            }
            if (this.transformDirty) {
                this.transformDirty = false;
            }
            // no hasListenerNeed guard needed?
            this.notifyRelativeTransformListeners();
            // only update children if we aren't transformed (completely other context)
            if (!this.instance.isTransformed || passTransform) {
                const isDirty = wasDirty && !(hasComputeNeed || hasSelfComputeNeed);
                // continue the traversal
                len = this.instance.children.length;
                for(i = 0; i < len; i++){
                    this.instance.children[i].relativeTransform.updateTransformListenersAndCompute(wasDirty, isDirty, frameId, false);
                }
            }
        }
        sceneryLog && sceneryLog.RelativeTransform && sceneryLog.pop();
    }
    /**
   * @private
   */ notifyRelativeTransformListeners() {
        const len = this.relativeTransformListeners.length;
        for(let i = 0; i < len; i++){
            this.relativeTransformListeners[i]();
        }
    }
    /**
   * @public
   *
   * @param {number} frameId
   * @param {boolean} allowValidationNotNeededChecks
   */ audit(frameId, allowValidationNotNeededChecks) {
        // get the relative matrix, computed to be up-to-date, and ignores any flags/counts so we can check whether our
        // state is consistent
        function currentRelativeMatrix(instance) {
            const resultMatrix = Matrix3.pool.fetch();
            const nodeMatrix = instance.node.getMatrix();
            if (!instance.parent) {
                // if our instance has no parent, ignore its transform
                resultMatrix.set(Matrix3.IDENTITY);
            } else if (!instance.parent.isTransformed) {
                // mutable form of parentMatrix * nodeMatrix
                resultMatrix.set(currentRelativeMatrix(instance.parent));
                resultMatrix.multiplyMatrix(nodeMatrix);
            } else {
                // we are the first in the trail transform, so we just directly copy the matrix over
                resultMatrix.set(nodeMatrix);
            }
            return resultMatrix;
        }
        function hasRelativeSelfDirty(instance) {
            // if validation isn't needed, act like nothing is dirty (matching our validate behavior)
            if (allowValidationNotNeededChecks && instance.isValidationNotNeeded()) {
                return false;
            }
            return instance.relativeSelfDirty || instance.parent && hasRelativeSelfDirty(instance.parent);
        }
        if (assertSlow) {
            // count verification for invariants
            let notifyRelativeCount = 0;
            let precomputeRelativeCount = 0;
            for(let i = 0; i < this.instance.children.length; i++){
                const childInstance = this.instance.children[i];
                if (childInstance.relativeTransform.hasAncestorListenerNeed()) {
                    notifyRelativeCount++;
                }
                if (childInstance.relativeTransform.hasAncestorComputeNeed()) {
                    precomputeRelativeCount++;
                }
            }
            assertSlow(notifyRelativeCount === this.relativeChildrenListenersCount, 'Relative listener count invariant');
            assertSlow(precomputeRelativeCount === this.relativeChildrenPrecomputeCount, 'Relative precompute count invariant');
            assertSlow(!this.parent || this.instance.isTransformed || this.relativeChildDirtyFrame !== frameId || this.parent.relativeChildDirtyFrame === frameId, 'If we have a parent, we need to hold the invariant ' + 'this.relativeChildDirtyFrame => parent.relativeChildDirtyFrame');
            // Since we check to see if something is not dirty, we need to handle this when we are actually reporting
            // what is dirty. See https://github.com/phetsims/scenery/issues/512
            if (!allowValidationNotNeededChecks && !hasRelativeSelfDirty(this)) {
                const matrix = currentRelativeMatrix(this);
                assertSlow(matrix.equals(this.matrix), 'If there is no relativeSelfDirty flag set here or in our' + ' ancestors, our matrix should be up-to-date');
            }
        }
    }
    /**
   * @param {Instance} instance
   */ constructor(instance){
        this.instance = instance;
    }
};
scenery.register('RelativeTransform', RelativeTransform);
export default RelativeTransform;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9SZWxhdGl2ZVRyYW5zZm9ybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZWxhdGl2ZVRyYW5zZm9ybSBpcyBhIGNvbXBvbmVudCBvZiBhbiBJbnN0YW5jZS4gSXQgaXMgcmVzcG9uc2libGUgZm9yIHRyYWNraW5nIGNoYW5nZXMgdG8gXCJyZWxhdGl2ZVwiIHRyYW5zZm9ybXMsIGFuZFxuICogY29tcHV0aW5nIHRoZW0gaW4gYW4gZWZmaWNpZW50IG1hbm5lci5cbiAqXG4gKiBBIFwicmVsYXRpdmVcIiB0cmFuc2Zvcm0gaGVyZSBpcyB0aGUgdHJhbnNmb3JtIHRoYXQgYSBUcmFpbCB3b3VsZCBoYXZlLCBub3QgbmVjZXNzYXJpbHkgcm9vdGVkIGF0IHRoZSBkaXNwbGF5J3Mgcm9vdC5cbiAqIEltYWdpbmUgd2UgaGF2ZSBhIENTUy10cmFuc2Zvcm1lZCBiYWNrYm9uZSBkaXYsIGFuZCBub2RlcyB1bmRlcm5lYXRoIHRoYXQgcmVuZGVyIHRvIENhbnZhcy4gT24gdGhlIENhbnZhcywgd2Ugd2lsbFxuICogbmVlZCB0byBzZXQgdGhlIGNvbnRleHQncyB0cmFuc2Zvcm0gdG8gdGhlIG1hdHJpeCB0aGF0IHdpbGwgdHJhbnNmb3JtIGZyb20gdGhlIGRpc3BsYXllZCBpbnN0YW5jZXMnIGxvY2FsIGNvb3JkaW5hdGVzXG4gKiBmcmFtZXMgdG8gdGhlIENTUy10cmFuc2Zvcm1lZCBiYWNrYm9uZSBpbnN0YW5jZS4gTm90YWJseSwgdHJhbnNmb3JtaW5nIHRoZSBiYWNrYm9uZSBpbnN0YW5jZSBvciBhbnkgb2YgaXRzIGFuY2VzdG9yc1xuICogZG9lcyBOT1QgYWZmZWN0IHRoaXMgXCJyZWxhdGl2ZVwiIHRyYW5zZm9ybSBmcm9tIHRoZSBpbnN0YW5jZSB0byB0aGUgZGlzcGxheWVkIGluc3RhbmNlcywgd2hpbGUgYW55IE5vZGUgdHJhbnNmb3JtXG4gKiBjaGFuZ2VzIGJldHdlZW4gKG5vdCBpbmNsdWRpbmcpIHRoZSBiYWNrYm9uZSBpbnN0YW5jZSBhbmQgKGluY2x1ZGluZykgdGhlIGRpc3BsYXllZCBpbnN0YW5jZSBXSUxMIGFmZmVjdCB0aGF0XG4gKiByZWxhdGl2ZSB0cmFuc2Zvcm0uIFRoaXMgaXMga2V5IHRvIHNldHRpbmcgdGhlIENTUyB0cmFuc2Zvcm0gb24gYmFja2JvbmVzLCBET00gbm9kZXMsIGhhdmluZyB0aGUgdHJhbnNmb3JtcyBuZWNlc3NhcnlcbiAqIGZvciB0aGUgZmFzdGVzdCBDYW52YXMgZGlzcGxheSwgYW5kIGRldGVybWluaW5nIGZpdHRpbmcgYm91bmRzIGZvciBsYXllcnMuXG4gKlxuICogRWFjaCBJbnN0YW5jZSBoYXMgaXRzIG93biBcInJlbGF0aXZlIHRyYWlsXCIsIGFsdGhvdWdoIHRoZXNlIGFyZW4ndCBzdG9yZWQuIFdlIHVzZSBpbXBsaWNpdCBoaWVyYXJjaGllcyBpbiB0aGUgSW5zdGFuY2VcbiAqIHRyZWUgZm9yIHRoaXMgcHVycG9zZS4gSWYgYW4gSW5zdGFuY2UgaXMgYSBDU1MtdHJhbnNmb3JtZWQgYmFja2JvbmUsIG9yIGFueSBvdGhlciBjYXNlIHRoYXQgcmVxdWlyZXMgZHJhd2luZyBiZW5lYXRoXG4gKiB0byBiZSBkb25lIHJlbGF0aXZlIHRvIGl0cyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLCB3ZSBjYWxsIGl0IGEgdHJhbnNmb3JtIFwicm9vdFwiLCBhbmQgaXQgaGFzIGluc3RhbmNlLmlzVHJhbnNmb3JtZWRcbiAqIHNldCB0byB0cnVlLiBUaGlzIHNob3VsZCBORVZFUiBjaGFuZ2UgZm9yIGFuIGluc3RhbmNlIChhbnkgY2hhbmdlcyB0aGF0IHdvdWxkIGRvIHRoaXMgcmVxdWlyZSByZWNvbnN0cnVjdGluZyB0aGVcbiAqIGluc3RhbmNlIHRyZWUpLlxuICpcbiAqIFRoZXJlIGFyZSBpbXBsaWNpdCBoaWVyYXJjaGllcyBmb3IgZWFjaCByb290LCB3aXRoIHRyYWlscyBzdGFydGluZyBmcm9tIHRoYXQgcm9vdCdzIGNoaWxkcmVuICh0aGV5IHdvbid0IGFwcGx5IHRoYXRcbiAqIHJvb3QncyB0cmFuc2Zvcm0gc2luY2Ugd2UgYXNzdW1lIHdlIGFyZSB3b3JraW5nIHdpdGhpbiB0aGF0IHJvb3QncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS4gVGhlc2Ugc2hvdWxkIGJlXG4gKiBlZmZlY3RpdmVseSBpbmRlcGVuZGVudCAoaWYgdGhlcmUgYXJlIG5vIGJ1Z3MpLCBzbyB0aGF0IGZsYWdzIGFmZmVjdGluZyBvbmUgaW1wbGljaXQgaGllcmFyY2h5IHdpbGwgbm90IGFmZmVjdCB0aGVcbiAqIG90aGVyIChkaXJ0eSBmbGFncywgZXRjLiksIGFuZCB0cmF2ZXJzYWxzIHNob3VsZCBub3QgY3Jvc3MgdGhlc2UgYm91bmRhcmllcy5cbiAqXG4gKiBGb3IgdmFyaW91cyBwdXJwb3Nlcywgd2Ugd2FudCBhIHN5c3RlbSB0aGF0IGNhbjpcbiAqIC0gZXZlcnkgZnJhbWUgYmVmb3JlIHJlcGFpbnRpbmc6IG5vdGlmeSBsaXN0ZW5lcnMgb24gaW5zdGFuY2VzIHdoZXRoZXIgaXRzIHJlbGF0aXZlIHRyYW5zZm9ybSBoYXMgY2hhbmdlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGFkZHxyZW1vdmVMaXN0ZW5lcilcbiAqIC0gZXZlcnkgZnJhbWUgYmVmb3JlIHJlcGFpbnRpbmc6IHByZWNvbXB1dGUgcmVsYXRpdmUgdHJhbnNmb3JtcyBvbiBpbnN0YW5jZXMgd2hlcmUgd2Uga25vdyB0aGlzIGlzIHJlcXVpcmVkXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoYWRkfHJlbW92ZVByZWNvbXB1dGUpXG4gKiAtIGFueSB0aW1lIGR1cmluZyByZXBhaW50aW5nOiAgICBwcm92aWRlIGFuIGVmZmljaWVudCB3YXkgdG8gbGF6aWx5IGNvbXB1dGUgcmVsYXRpdmUgdHJhbnNmb3JtcyB3aGVuIG5lZWRlZFxuICpcbiAqIFRoaXMgaXMgZG9uZSBieSBmaXJzdCBoYXZpbmcgb25lIHN0ZXAgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlIHRoYXQgdHJhdmVyc2VzIHRoZSB0cmVlIHdoZXJlIG5lY2Vzc2FyeSwgbm90aWZ5aW5nXG4gKiByZWxhdGl2ZSB0cmFuc2Zvcm0gbGlzdGVuZXJzLCBhbmQgcHJlY29tcHV0aW5nIHJlbGF0aXZlIHRyYW5zZm9ybXMgd2hlbiB0aGV5IGhhdmUgY2hhbmdlZCAoYW5kIHByZWNvbXB1dGF0aW9uIGlzXG4gKiByZXF1ZXN0ZWQpLiBUaGlzIHRyYXZlcnNhbCBsZWF2ZXMgbWV0YWRhdGEgb24gdGhlIGluc3RhbmNlcyBzbyB0aGF0IHdlIGNhbiAoZmFpcmx5KSBlZmZpY2llbnRseSBmb3JjZSByZWxhdGl2ZVxuICogdHJhbnNmb3JtIFwidmFsaWRhdGlvblwiIGFueSB0aW1lIGFmdGVyd2FyZHMgdGhhdCBtYWtlcyBzdXJlIHRoZSBtYXRyaXggcHJvcGVydHkgaXMgdXAtdG8tZGF0ZS5cbiAqXG4gKiBGaXJzdCBvZiBhbGwsIHRvIGVuc3VyZSB3ZSB0cmF2ZXJzZSB0aGUgcmlnaHQgcGFydHMgb2YgdGhlIHRyZWUsIHdlIG5lZWQgdG8ga2VlcCBtZXRhZGF0YSBvbiB3aGF0IG5lZWRzIHRvIGJlXG4gKiB0cmF2ZXJzZWQuIFRoaXMgaXMgZG9uZSBieSB0cmFja2luZyBjb3VudHMgb2YgbGlzdGVuZXJzL3ByZWNvbXB1dGlvbiBuZWVkcywgYm90aCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmLCBhbmQgaG93IG1hbnlcbiAqIGNoaWxkcmVuIGhhdmUgdGhlc2UgbmVlZHMuIFdlIHVzZSBjb3VudHMgaW5zdGVhZCBvZiBib29sZWFuIGZsYWdzIHNvIHRoYXQgd2UgY2FuIHVwZGF0ZSB0aGlzIHF1aWNrbHkgd2hpbGUgKGEpIG5ldmVyXG4gKiByZXF1aXJpbmcgZnVsbCBjaGlsZHJlbiBzY2FucyB0byB1cGRhdGUgdGhpcyBtZXRhZGF0YSwgYW5kIChiKSBtaW5pbWl6aW5nIHRoZSBuZWVkIHRvIHRyYXZlcnNlIGFsbCB0aGUgd2F5IHVwIHRvIHRoZVxuICogcm9vdCB0byB1cGRhdGUgdGhlIG1ldGFkYXRhLiBUaGUgZW5kIHJlc3VsdCBpcyBoYXNEZXNjZW5kYW50TGlzdGVuZXJOZWVkIGFuZCBoYXNEZXNjZW5kYW50Q29tcHV0ZU5lZWQgd2hpY2ggY29tcHV0ZSxcbiAqIHJlc3BlY3RpdmVseSwgd2hldGhlciB3ZSBuZWVkIHRvIHRyYXZlcnNlIHRoaXMgaW5zdGFuY2UgZm9yIGxpc3RlbmVycyBhbmQgcHJlY29tcHV0YXRpb24uIEFkZGl0aW9uYWxseSxcbiAqIGhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkIGFuZCBoYXNBbmNlc3RvckNvbXB1dGVOZWVkIGNvbXB1dGUgd2hldGhlciBvdXIgcGFyZW50IG5lZWRzIHRvIHRyYXZlcnNlIHVwIHRvIHVzLlxuICpcbiAqIFRoZSBvdGhlciB0cmlja3kgYml0cyB0byByZW1lbWJlciBmb3IgdGhpcyB0cmF2ZXJzYWwgYXJlIHRoZSBmbGFncyBpdCBzZXRzLCBhbmQgaG93IGxhdGVyIHZhbGlkYXRpb24gdXNlcyBhbmQgdXBkYXRlc1xuICogdGhlc2UgZmxhZ3MuIEZpcnN0IG9mIGFsbCwgd2UgaGF2ZSByZWxhdGl2ZVNlbGZEaXJ0eSBhbmQgcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUuIFdoZW4gYSBub2RlJ3MgdHJhbnNmb3JtIGNoYW5nZXMsXG4gKiB3ZSBtYXJrIHJlbGF0aXZlU2VsZkRpcnR5IG9uIHRoZSBub2RlLCBhbmQgcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgZm9yIGFsbCBhbmNlc3RvcnMgdXAgdG8gKGFuZCBpbmNsdWRpbmcpIHRoZVxuICogdHJhbnNmb3JtIHJvb3QuIHJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lIGFsbG93cyB1cyB0byBwcnVuZSBvdXIgdHJhdmVyc2FsIHRvIG9ubHkgbW9kaWZpZWQgc3VidHJlZXMuIEFkZGl0aW9uYWxseSwgc29cbiAqIHRoYXQgd2UgY2FuIHJldGFpbiB0aGUgaW52YXJpYW50IHRoYXQgaXQgaXMgXCJzZXRcIiBwYXJlbnQgbm9kZSBpZiBpdCBpcyBzZXQgb24gYSBjaGlsZCwgd2Ugc3RvcmUgdGhlIHJlbmRlcmluZyBmcmFtZVxuICogSUQgKHVuaXF1ZSB0byB0cmF2ZXJzYWxzKSBpbnN0ZWFkIG9mIGEgYm9vbGVhbiB0cnVlL2ZhbHNlLiBPdXIgdHJhdmVyc2FsIG1heSBza2lwIHN1YnRyZWVzIHdoZXJlXG4gKiByZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSBpcyBcInNldFwiIGR1ZSB0byBubyBsaXN0ZW5lcnMgb3IgcHJlY29tcHV0YXRpb24gbmVlZGVkIGZvciB0aGF0IHN1YnRyZWUsIHNvIGlmIHdlIHVzZWRcbiAqIGJvb2xlYW5zIHRoaXMgd291bGQgYmUgdmlvbGF0ZWQuIFZpb2xhdGluZyB0aGF0IGludmFyaWFudCB3b3VsZCBwcmV2ZW50IHVzIGZyb20gXCJiYWlsaW5nIG91dFwiIHdoZW4gc2V0dGluZyB0aGVcbiAqIHJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lIGZsYWcsIGFuZCBvbiBFVkVSWSB0cmFuc2Zvcm0gY2hhbmdlIHdlIHdvdWxkIGhhdmUgdG8gdHJhdmVyc2UgQUxMIG9mIHRoZSB3YXkgdG8gdGhlIHJvb3RcbiAqIChpbnN0ZWFkIG9mIHRoZSBlZmZpY2llbnQgXCJzdG9wIGF0IHRoZSBhbmNlc3RvciB3aGVyZSBpdCBpcyBhbHNvIHNldFwiKS5cbiAqXG4gKiByZWxhdGl2ZVNlbGZEaXJ0eSBpcyBpbml0aWFsbHkgc2V0IG9uIGluc3RhbmNlcyB3aG9zZSBub2RlcyBoYWQgdHJhbnNmb3JtIGNoYW5nZXMgKHRoZXkgbWFyayB0aGF0IHRoaXMgcmVsYXRpdmVcbiAqIHRyYW5zZm9ybSwgYW5kIGFsbCB0cmFuc2Zvcm1zIGJlbmVhdGgsIGFyZSBkaXJ0eSkuIFdlIG1haW50YWluIHRoZSBpbnZhcmlhbnQgdGhhdCBpZiBhIHJlbGF0aXZlIHRyYW5zZm9ybSBuZWVkcyB0byBiZVxuICogcmVjb21wdXRlZCwgaXQgb3Igb25lIG9mIGl0cyBhbmNlc3RvcnMgV0lMTCBBTFdBWVMgaGF2ZSB0aGlzIGZsYWcgc2V0LiBUaGlzIGlzIHJlcXVpcmVkIHNvIHRoYXQgbGF0ZXIgdmFsaWRhdGlvbiBvZlxuICogdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSBjYW4gdmVyaWZ5IHdoZXRoZXIgaXQgaGFzIGJlZW4gY2hhbmdlZCBpbiBhbiBlZmZpY2llbnQgd2F5LiBXaGVuIHdlIHJlY29tcHV0ZSB0aGUgcmVsYXRpdmVcbiAqIHRyYW5zZm9ybSBmb3Igb25lIGluc3RhbmNlLCB3ZSBoYXZlIHRvIHNldCB0aGlzIGZsYWcgb24gYWxsIGNoaWxkcmVuIHRvIG1haW50YWluIHRoaXMgaW52YXJpYW50LlxuICpcbiAqIEFkZGl0aW9uYWxseSwgc28gdGhhdCB3ZSBjYW4gaGF2ZSBmYXN0IFwidmFsaWRhdGlvblwiIHNwZWVkLCB3ZSBhbHNvIHN0b3JlIGludG8gcmVsYXRpdmVGcmFtZUlkIHRoZSBsYXN0IHJlbmRlcmluZ1xuICogZnJhbWUgSUQgKGNvdW50ZXIpIHdoZXJlIHdlIGVpdGhlciB2ZXJpZmllZCB0aGF0IHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0gaXMgdXAgdG8gZGF0ZSwgb3Igd2UgaGF2ZSByZWNvbXB1dGVkIGl0LiBUaHVzXG4gKiB3aGVuIFwidmFsaWRhdGluZ1wiIGEgcmVsYXRpdmUgdHJhbnNmb3JtIHRoYXQgd2Fzbid0IHByZWNvbXB1dGVkLCB3ZSBvbmx5IG5lZWQgdG8gc2NhbiB1cCB0aGUgYW5jZXN0b3JzIHRvIHRoZSBmaXJzdFxuICogb25lIHRoYXQgd2FzIHZlcmlmaWVkIE9LIHRoaXMgZnJhbWUgKGJvb2xlYW4gZmxhZ3MgYXJlIGluc3VmZmljaWVudCBmb3IgdGhpcywgc2luY2Ugd2Ugd291bGQgaGF2ZSB0byBjbGVhciB0aGVtIGFsbFxuICogdG8gZmFsc2Ugb24gZXZlcnkgZnJhbWUsIHJlcXVpcmluZyBhIGZ1bGwgdHJlZSB0cmF2ZXJzYWwpLiBJbiB0aGUgZnV0dXJlLCB3ZSBtYXkgc2V0IHRoaXMgZmxhZyB0byB0aGUgZnJhbWVcbiAqIHByb2FjdGl2ZWx5IGR1cmluZyB0cmF2ZXJzYWwgdG8gc3BlZWQgdXAgdmFsaWRhdGlvbiwgYnV0IHRoYXQgaXMgbm90IGRvbmUgYXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLlxuICpcbiAqIFNvbWUgaGVscGZ1bCBub3RlcyBmb3IgdGhlIHNjb3BlIG9mIHZhcmlvdXMgcmVsYXRpdmVUcmFuc2Zvcm0gYml0czpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICh0cmFuc2Zvcm1Sb290KSAocmVndWxhcikgKHJlZ3VsYXIpICh0cmFuc2Zvcm1Sb290KVxuICogcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV0gICAgICAgICAgICAgICAgIChpbnQpXG4gKiByZWxhdGl2ZVNlbGZEaXJ0eSAgICAgICAgICAgICAgICAgICAgICAgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV1cbiAqIG1hdHJpeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXSAodHJhbnNmb3JtIG9uIHJvb3QgYXBwbGllcyB0b1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0cyBwYXJlbnQgY29udGV4dClcbiAqIHJlbGF0aXZlRnJhbWVJZCAgICAgICAgICAgICAgICAgICAgICAgICBbLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXSAoaW50KVxuICogY2hpbGQgY291bnRzICAgICAgICAgICAgWy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV0gICAgICAgICAgICAgICAgIChlLmcuIHJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50KVxuICogc2VsZiBjb3VudHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1dIChlLmcuIHJlbGF0aXZlUHJlY29tcHV0ZUNvdW50LFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLmxlbmd0aClcbiAqKioqKioqKioqKioqKioqKioqKioqXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY2xhc3MgUmVsYXRpdmVUcmFuc2Zvcm0ge1xuICAvKipcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBpbnN0YW5jZSApIHtcbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogUmVzcG9uc2libGUgZm9yIGluaXRpYWxpemF0aW9uIGFuZCBjbGVhbmluZyBvZiB0aGlzLiBJZiB0aGUgcGFyYW1ldGVycyBhcmUgYm90aCBudWxsLCB3ZSdsbCB3YW50IHRvIGNsZWFuIG91clxuICAgKiBleHRlcm5hbCByZWZlcmVuY2VzIChsaWtlIEluc3RhbmNlIGRvZXMpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheXxudWxsfSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7VHJhaWx8bnVsbH0gdHJhaWxcbiAgICogQHJldHVybnMge1JlbGF0aXZlVHJhbnNmb3JtfSAtIFJldHVybnMgdGhpcywgdG8gYWxsb3cgY2hhaW5pbmcuXG4gICAqL1xuICBpbml0aWFsaXplKCBkaXNwbGF5LCB0cmFpbCApIHtcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcbiAgICB0aGlzLm5vZGUgPSB0cmFpbCAmJiB0cmFpbC5sYXN0Tm9kZSgpO1xuXG4gICAgLy8gcHJvcGVydGllcyByZWxldmFudCB0byB0aGUgbm9kZSdzIGRpcmVjdCB0cmFuc2Zvcm1cbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gdHJ1ZTsgLy8gd2hldGhlciB0aGUgbm9kZSdzIHRyYW5zZm9ybSBoYXMgY2hhbmdlZCAodW50aWwgdGhlIHByZS1yZXBhaW50IHBoYXNlKVxuICAgIHRoaXMubm9kZVRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy5ub2RlVHJhbnNmb3JtTGlzdGVuZXIgfHwgdGhpcy5vbk5vZGVUcmFuc2Zvcm1EaXJ0eS5iaW5kKCB0aGlzICk7XG5cbiAgICAvLyB0aGUgYWN0dWFsIGNhY2hlZCB0cmFuc2Zvcm0gdG8gdGhlIHJvb3RcbiAgICB0aGlzLm1hdHJpeCA9IHRoaXMubWF0cml4IHx8IE1hdHJpeDMuaWRlbnRpdHkoKTtcblxuICAgIC8vIHdoZXRoZXIgb3VyIG1hdHJpeCBpcyBkaXJ0eVxuICAgIHRoaXMucmVsYXRpdmVTZWxmRGlydHkgPSB0cnVlO1xuXG4gICAgLy8gaG93IG1hbnkgY2hpbGRyZW4gaGF2ZSAob3IgaGF2ZSBkZXNjZW5kYW50cyB3aXRoKSByZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVyc1xuICAgIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50ID0gMDtcblxuICAgIC8vIGlmID4wLCBpbmRpY2F0ZXMgdGhpcyBzaG91bGQgYmUgcHJlY29tcHV0ZWQgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlXG4gICAgdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA9IDA7XG5cbiAgICAvLyBob3cgbWFueSBjaGlsZHJlbiBoYXZlIChvciBoYXZlIGRlc2NlbmRhbnRzIHdpdGgpID4wIHJlbGF0aXZlUHJlY29tcHV0ZUNvdW50XG4gICAgdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50ID0gMDtcblxuICAgIC8vIHVzZWQgdG8gbWFyayB3aGF0IGZyYW1lIHRoZSB0cmFuc2Zvcm0gd2FzIHVwZGF0ZWQgaW4gKHRvIGFjY2VsZXJhdGUgbm9uLXByZWNvbXB1dGVkIHJlbGF0aXZlIHRyYW5zZm9ybSBhY2Nlc3MpXG4gICAgdGhpcy5yZWxhdGl2ZUZyYW1lSWQgPSAtMTtcblxuICAgIC8vIFdoZXRoZXIgY2hpbGRyZW4gaGF2ZSBkaXJ0eSB0cmFuc2Zvcm1zIChpZiBpdCBpcyB0aGUgY3VycmVudCBmcmFtZSkgTk9URTogdXNlZCBvbmx5IGZvciBwcmUtcmVwYWludCB0cmF2ZXJzYWwsXG4gICAgLy8gYW5kIGNhbiBiZSBpZ25vcmVkIGlmIGl0IGhhcyBhIHZhbHVlIGxlc3MgdGhhbiB0aGUgY3VycmVudCBmcmFtZSBJRC4gVGhpcyBhbGxvd3MgdXMgdG8gdHJhdmVyc2UgYW5kIGhpdCBhbGxcbiAgICAvLyBsaXN0ZW5lcnMgZm9yIHRoaXMgcGFydGljdWxhciB0cmF2ZXJzYWwsIHdpdGhvdXQgbGVhdmluZyBhbiBpbnZhbGlkIHN1YnRyZWUgKGEgYm9vbGVhbiBmbGFnIGhlcmUgaXNcbiAgICAvLyBpbnN1ZmZpY2llbnQsIHNpbmNlIG91ciB0cmF2ZXJzYWwgaGFuZGxpbmcgd291bGQgdmFsaWRhdGUgb3VyIGludmFyaWFudCBvZlxuICAgIC8vIHRoaXMucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPT4gcGFyZW50LnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lKS4gSW4gdGhpcyBjYXNlLCB0aGV5IGFyZSBib3RoIGVmZmVjdGl2ZWx5XG4gICAgLy8gXCJmYWxzZVwiIHVubGVzcyB0aGV5IGFyZSB0aGUgY3VycmVudCBmcmFtZSBJRCwgaW4gd2hpY2ggY2FzZSB0aGF0IGludmFyaWFudCBob2xkcy5cbiAgICB0aGlzLnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lID0gZGlzcGxheSA/IGRpc3BsYXkuX2ZyYW1lSWQgOiAwO1xuXG4gICAgLy8gd2lsbCBiZSBub3RpZmllZCBpbiBwcmUtcmVwYWludCBwaGFzZSB0aGF0IG91ciByZWxhdGl2ZSB0cmFuc2Zvcm0gaGFzIGNoYW5nZWQgKGJ1dCBub3QgY29tcHV0ZWQgYnkgZGVmYXVsdClcbiAgICAvL09IVFdPIFRPRE86IHNob3VsZCB3ZSByZWx5IG9uIGxpc3RlbmVycyByZW1vdmluZyB0aGVtc2VsdmVzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMgPSBjbGVhbkFycmF5KCB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzICk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtSZWxhdGl2ZVRyYW5zZm9ybXxudWxsfVxuICAgKi9cbiAgZ2V0IHBhcmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZS5wYXJlbnQgPyB0aGlzLmluc3RhbmNlLnBhcmVudC5yZWxhdGl2ZVRyYW5zZm9ybSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgYWRkSW5zdGFuY2UoIGluc3RhbmNlICkge1xuICAgIGlmICggaW5zdGFuY2Uuc3RhdGVsZXNzICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCksXG4gICAgICAgICdXZSBvbmx5IHRyYWNrIGNoYW5nZXMgcHJvcGVybHkgaWYgc3RhdGVsZXNzIGluc3RhbmNlcyBkbyBub3QgaGF2ZSBuZWVkcycgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCksXG4gICAgICAgICdXZSBvbmx5IHRyYWNrIGNoYW5nZXMgcHJvcGVybHkgaWYgc3RhdGVsZXNzIGluc3RhbmNlcyBkbyBub3QgaGF2ZSBuZWVkcycgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIGluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbigpO1xuICAgICAgfVxuICAgICAgaWYgKCBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XG4gICAgICAgIHRoaXMuaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWFyayB0aGUgaW5zdGFuY2UncyB0cmFuc2Zvcm0gYXMgZGlydHksIHNvIHRoYXQgaXQgd2lsbCBiZSByZWFjaGFibGUgaW4gdGhlIHByZS1yZXBhaW50IHRyYXZlcnNhbCBwYXNzXG4gICAgaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICByZW1vdmVJbnN0YW5jZSggaW5zdGFuY2UgKSB7XG4gICAgaWYgKCBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCgpICkge1xuICAgICAgdGhpcy5kZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XG4gICAgfVxuICAgIGlmICggaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpICkge1xuICAgICAgdGhpcy5kZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXR0YWNoTm9kZUxpc3RlbmVycygpIHtcbiAgICB0aGlzLm5vZGUudHJhbnNmb3JtRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5ub2RlVHJhbnNmb3JtTGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkZXRhY2hOb2RlTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubm9kZS50cmFuc2Zvcm1FbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm5vZGVUcmFuc2Zvcm1MaXN0ZW5lciApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIFJlbGF0aXZlIHRyYW5zZm9ybSBsaXN0ZW5lciBjb3VudCByZWN1cnNpdmUgaGFuZGxpbmdcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogT25seSBmb3IgZGVzY2VuZGFudHMgbmVlZCwgaWdub3JlcyAnc2VsZicgbmVlZCBvbiBpc1RyYW5zZm9ybWVkXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaGFzRGVzY2VuZGFudExpc3RlbmVyTmVlZCgpIHtcbiAgICBpZiAoIHRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCApIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCA+IDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50ID4gMCB8fCB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLmxlbmd0aCA+IDA7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ubHkgZm9yIGFuY2VzdG9ycyBuZWVkLCBpZ25vcmVzIGNoaWxkIG5lZWQgb24gaXNUcmFuc2Zvcm1lZFxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkge1xuICAgIGlmICggdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkICkge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZUNoaWxkcmVuTGlzdGVuZXJzQ291bnQgPiAwIHx8IHRoaXMucmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMubGVuZ3RoID4gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBoYXNTZWxmTGlzdGVuZXJOZWVkKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLmxlbmd0aCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHRoZSBhbmNlc3RvciBvZiB0aGUgaW5zdGFuY2Ugd2l0aCB0aGUgbmVlZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5jcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbigpIHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCk7XG5cbiAgICB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5MaXN0ZW5lcnNDb3VudCsrO1xuICAgIGlmICggYmVmb3JlICE9PSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkLCAnU2hvdWxkIG5vdCBiZSBhIGNoYW5nZSBpbiBuZWVkIGlmIHdlIGhhdmUgdGhlIGlzVHJhbnNmb3JtZWQgZmxhZycgKTtcblxuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuaW5jcmVtZW50VHJhbnNmb3JtTGlzdGVuZXJDaGlsZHJlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gdGhlIGFuY2VzdG9yIG9mIHRoZSBpbnN0YW5jZSB3aXRoIHRoZSBuZWVkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCkge1xuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKTtcblxuICAgIHRoaXMucmVsYXRpdmVDaGlsZHJlbkxpc3RlbmVyc0NvdW50LS07XG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluc3RhbmNlLmlzVHJhbnNmb3JtZWQsICdTaG91bGQgbm90IGJlIGEgY2hhbmdlIGluIG5lZWQgaWYgd2UgaGF2ZSB0aGUgaXNUcmFuc2Zvcm1lZCBmbGFnJyApO1xuXG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICovXG4gIGFkZExpc3RlbmVyKCBsaXN0ZW5lciApIHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCk7XG5cbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmluY3JlbWVudFRyYW5zZm9ybUxpc3RlbmVyQ2hpbGRyZW4oKTtcblxuICAgICAgLy8gaWYgd2UganVzdCB3ZW50IGZyb20gXCJub3QgbmVlZGluZyB0byBiZSB0cmF2ZXJzZWRcIiB0byBcIm5lZWRpbmcgdG8gYmUgdHJhdmVyc2VkXCIsIG1hcmsgb3Vyc2VsdmVzIGFzIGRpcnR5IHNvXG4gICAgICAvLyB0aGF0IHdlIGZvci1zdXJlIGdldCBmdXR1cmUgdXBkYXRlc1xuICAgICAgaWYgKCAhdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XG4gICAgICAgIC8vIFRPRE86IGNhbiB3ZSBkbyBiZXR0ZXIgdGhhbiB0aGlzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICB0aGlzLmZvcmNlTWFya1RyYW5zZm9ybURpcnR5KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXJcbiAgICovXG4gIHJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApIHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCk7XG5cbiAgICAvLyBUT0RPOiByZXBsYWNlIHdpdGggYSAncmVtb3ZlJyBmdW5jdGlvbiBjYWxsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycywgbGlzdGVuZXIgKSwgMSApO1xuICAgIGlmICggYmVmb3JlICE9PSB0aGlzLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIFJlbGF0aXZlIHRyYW5zZm9ybSBwcmVjb21wdXRlIGZsYWcgcmVjdXJzaXZlIGhhbmRsaW5nXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIE9ubHkgZm9yIGRlc2NlbmRhbnRzIG5lZWQsIGlnbm9yZXMgJ3NlbGYnIG5lZWQgb24gaXNUcmFuc2Zvcm1lZFxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0Rlc2NlbmRhbnRDb21wdXRlTmVlZCgpIHtcbiAgICBpZiAoIHRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCApIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQgPiAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQgPiAwIHx8IHRoaXMucmVsYXRpdmVQcmVjb21wdXRlQ291bnQgPiAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbmx5IGZvciBhbmNlc3RvcnMgbmVlZCwgaWdub3JlcyBjaGlsZCBuZWVkIG9uIGlzVHJhbnNmb3JtZWRcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBoYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkge1xuICAgIGlmICggdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkICkge1xuICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVQcmVjb21wdXRlQ291bnQgPiAwO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQgPiAwIHx8IHRoaXMucmVsYXRpdmVQcmVjb21wdXRlQ291bnQgPiAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc1NlbGZDb21wdXRlTmVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVByZWNvbXB1dGVDb3VudCA+IDA7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHRoZSBhbmNlc3RvciBvZiB0aGUgaW5zdGFuY2Ugd2l0aCB0aGUgbmVlZFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCkge1xuICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpO1xuXG4gICAgdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50Kys7XG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZCwgJ1Nob3VsZCBub3QgYmUgYSBjaGFuZ2UgaW4gbmVlZCBpZiB3ZSBoYXZlIHRoZSBpc1RyYW5zZm9ybWVkIGZsYWcnICk7XG5cbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmluY3JlbWVudFRyYW5zZm9ybVByZWNvbXB1dGVDaGlsZHJlbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gdGhlIGFuY2VzdG9yIG9mIHRoZSBpbnN0YW5jZSB3aXRoIHRoZSBuZWVkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKSB7XG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCk7XG5cbiAgICB0aGlzLnJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQtLTtcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pbnN0YW5jZS5pc1RyYW5zZm9ybWVkLCAnU2hvdWxkIG5vdCBiZSBhIGNoYW5nZSBpbiBuZWVkIGlmIHdlIGhhdmUgdGhlIGlzVHJhbnNmb3JtZWQgZmxhZycgKTtcblxuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuZGVjcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiB0aGUgaW5zdGFuY2UgaXRzZWxmXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFkZFByZWNvbXB1dGUoKSB7XG4gICAgY29uc3QgYmVmb3JlID0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCk7XG5cbiAgICB0aGlzLnJlbGF0aXZlUHJlY29tcHV0ZUNvdW50Kys7XG4gICAgaWYgKCBiZWZvcmUgIT09IHRoaXMuaGFzQW5jZXN0b3JDb21wdXRlTmVlZCgpICkge1xuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuKCk7XG5cbiAgICAgIC8vIGlmIHdlIGp1c3Qgd2VudCBmcm9tIFwibm90IG5lZWRpbmcgdG8gYmUgdHJhdmVyc2VkXCIgdG8gXCJuZWVkaW5nIHRvIGJlIHRyYXZlcnNlZFwiLCBtYXJrIG91cnNlbHZlcyBhcyBkaXJ0eSBzb1xuICAgICAgLy8gdGhhdCB3ZSBmb3Itc3VyZSBnZXQgZnV0dXJlIHVwZGF0ZXNcbiAgICAgIGlmICggIXRoaXMuaGFzQW5jZXN0b3JMaXN0ZW5lck5lZWQoKSApIHtcbiAgICAgICAgLy8gVE9ETzogY2FuIHdlIGRvIGJldHRlciB0aGFuIHRoaXM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIHRoaXMuZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIHRoZSBpbnN0YW5jZSBpdHNlbGZcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlUHJlY29tcHV0ZSgpIHtcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzLmhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQoKTtcblxuICAgIHRoaXMucmVsYXRpdmVQcmVjb21wdXRlQ291bnQtLTtcbiAgICBpZiAoIGJlZm9yZSAhPT0gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XG4gICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5kZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4oKTtcbiAgICB9XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogUmVsYXRpdmUgdHJhbnNmb3JtIGhhbmRsaW5nXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIENhbGxlZCBpbW1lZGlhdGVseSB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIG5vZGUgaGFzIGEgdHJhbnNmb3JtIGNoYW5nZSAoY2FuIGhhcHBlbiBtdWx0aXBsZSB0aW1lcyBiZXR3ZWVuIHJlbmRlcnMpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbk5vZGVUcmFuc2Zvcm1EaXJ0eSgpIHtcbiAgICBpZiAoICF0aGlzLnRyYW5zZm9ybURpcnR5ICkge1xuICAgICAgdGhpcy5mb3JjZU1hcmtUcmFuc2Zvcm1EaXJ0eSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkoKSB7XG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5yZWxhdGl2ZVNlbGZEaXJ0eSA9IHRydWU7XG5cbiAgICBjb25zdCBmcmFtZUlkID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xuXG4gICAgLy8gbWFyayBhbGwgYW5jZXN0b3JzIHdpdGggcmVsYXRpdmVDaGlsZERpcnR5RnJhbWUsIGJhaWxpbmcgb3V0IHdoZW4gcG9zc2libGVcbiAgICBsZXQgaW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlLnBhcmVudDtcbiAgICB3aGlsZSAoIGluc3RhbmNlICYmIGluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lICE9PSBmcmFtZUlkICkge1xuICAgICAgY29uc3QgcGFyZW50SW5zdGFuY2UgPSBpbnN0YW5jZS5wYXJlbnQ7XG4gICAgICBjb25zdCBpc1RyYW5zZm9ybWVkID0gaW5zdGFuY2UuaXNUcmFuc2Zvcm1lZDtcblxuICAgICAgLy8gTk9URTogb3VyIHdoaWxlIGxvb3AgZ3VhcmFudGVlcyB0aGF0IGl0IHdhc24ndCBmcmFtZUlkXG4gICAgICBpbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5yZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSA9IGZyYW1lSWQ7XG5cbiAgICAgIC8vIGFsd2F5cyBtYXJrIGFuIGluc3RhbmNlIHdpdGhvdXQgYSBwYXJlbnQgKHJvb3QgaW5zdGFuY2UhKVxuICAgICAgaWYgKCBwYXJlbnRJbnN0YW5jZSA9PT0gbnVsbCApIHtcbiAgICAgICAgLy8gcGFzc1RyYW5zZm9ybSBkZXBlbmRzIG9uIHdoZXRoZXIgaXQgaXMgbWFya2VkIGFzIGEgdHJhbnNmb3JtIHJvb3RcbiAgICAgICAgdGhpcy5kaXNwbGF5Lm1hcmtUcmFuc2Zvcm1Sb290RGlydHkoIGluc3RhbmNlLCBpc1RyYW5zZm9ybWVkICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGlzVHJhbnNmb3JtZWQgKSB7XG4gICAgICAgIHRoaXMuZGlzcGxheS5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCBpbnN0YW5jZSwgdHJ1ZSApOyAvLyBwYXNzVHJhbnNmb3JtIHRydWVcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGluc3RhbmNlID0gcGFyZW50SW5zdGFuY2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgb3VyIG1hdHJpeCBiYXNlZCBvbiBhbnkgcGFyZW50cywgYW5kIHRoZSBub2RlJ3MgY3VycmVudCB0cmFuc2Zvcm1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXB1dGVSZWxhdGl2ZVRyYW5zZm9ybSgpIHtcbiAgICBjb25zdCBub2RlTWF0cml4ID0gdGhpcy5ub2RlLmdldE1hdHJpeCgpO1xuXG4gICAgaWYgKCB0aGlzLmluc3RhbmNlLnBhcmVudCAmJiAhdGhpcy5pbnN0YW5jZS5wYXJlbnQuaXNUcmFuc2Zvcm1lZCApIHtcbiAgICAgIC8vIG11dGFibGUgZm9ybSBvZiBwYXJlbnRNYXRyaXggKiBub2RlTWF0cml4XG4gICAgICB0aGlzLm1hdHJpeC5zZXQoIHRoaXMucGFyZW50Lm1hdHJpeCApO1xuICAgICAgdGhpcy5tYXRyaXgubXVsdGlwbHlNYXRyaXgoIG5vZGVNYXRyaXggKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB3ZSBhcmUgdGhlIGZpcnN0IGluIHRoZSB0cmFpbCB0cmFuc2Zvcm0sIHNvIHdlIGp1c3QgZGlyZWN0bHkgY29weSB0aGUgbWF0cml4IG92ZXJcbiAgICAgIHRoaXMubWF0cml4LnNldCggbm9kZU1hdHJpeCApO1xuICAgIH1cblxuICAgIC8vIG1hcmsgdGhlIGZyYW1lIHdoZXJlIHRoaXMgdHJhbnNmb3JtIHdhcyB1cGRhdGVkLCB0byBhY2NlbGVyYXRlIG5vbi1wcmVjb21wdXRlZCBhY2Nlc3NcbiAgICB0aGlzLnJlbGF0aXZlRnJhbWVJZCA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcbiAgICB0aGlzLnJlbGF0aXZlU2VsZkRpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVmFsaWRhdGlvbk5vdE5lZWRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgfHwgdGhpcy5yZWxhdGl2ZUZyYW1lSWQgPT09IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSBhbnkgcGxhY2UgaW4gdGhlIHJlbmRlcmluZyBwcm9jZXNzIHdoZXJlIHdlIGFyZSBub3QgZ3VhcmFudGVlZCB0byBoYXZlIGEgZnJlc2ggcmVsYXRpdmUgdHJhbnNmb3JtLlxuICAgKiBuZWVkcyB0byBzY2FuIHVwIHRoZSB0cmVlLCBzbyBpdCBpcyBtb3JlIGV4cGVuc2l2ZSB0aGFuIHByZWNvbXB1dGVkIHRyYW5zZm9ybXMuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgd2UgaGFkIHRvIHVwZGF0ZSB0aGlzIHRyYW5zZm9ybVxuICAgKiBAcHVibGljXG4gICAqL1xuICB2YWxpZGF0ZSgpIHtcbiAgICAvLyBpZiB3ZSBhcmUgY2xlYW4sIGJhaWwgb3V0LiBJZiB3ZSBoYXZlIGEgY29tcHV0ZSBcIm5lZWRcIiwgd2Ugd2lsbCBhbHdheXMgYmUgY2xlYW4gaGVyZSBzaW5jZSB0aGlzIGlzIGFmdGVyIHRoZVxuICAgIC8vIHRyYXZlcnNhbCBzdGVwLiBJZiB3ZSBkaWQgbm90IGhhdmUgYSBjb21wdXRlIFwibmVlZFwiLCB3ZSBjaGVjayB3aGV0aGVyIHdlIHdlcmUgYWxyZWFkeSB1cGRhdGVkIHRoaXMgZnJhbWUgYnlcbiAgICAvLyBjb21wdXRlUmVsYXRpdmVUcmFuc2Zvcm0uXG4gICAgaWYgKCB0aGlzLmlzVmFsaWRhdGlvbk5vdE5lZWRlZCgpICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFyZSBub3QgdGhlIGZpcnN0IHRyYW5zZm9ybSBmcm9tIHRoZSByb290LCB2YWxpZGF0ZSBvdXIgcGFyZW50LiBpc1RyYW5zZm9ybSBjaGVjayBwcmV2ZW50cyB1cyBmcm9tXG4gICAgLy8gcGFzc2luZyBhIHRyYW5zZm9ybSByb290LlxuICAgIGlmICggdGhpcy5pbnN0YW5jZS5wYXJlbnQgJiYgIXRoaXMuaW5zdGFuY2UucGFyZW50LmlzVHJhbnNmb3JtZWQgKSB7XG4gICAgICB0aGlzLnBhcmVudC52YWxpZGF0ZSgpO1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRpb24gb2YgdGhlIHBhcmVudCBtYXkgaGF2ZSBjaGFuZ2VkIG91ciByZWxhdGl2ZVNlbGZEaXJ0eSBmbGFnIHRvIHRydWUsIHNvIHdlIGNoZWNrIG5vdyAoY291bGQgYWxzbyBoYXZlXG4gICAgLy8gYmVlbiB0cnVlIGJlZm9yZSlcbiAgICBpZiAoIHRoaXMucmVsYXRpdmVTZWxmRGlydHkgKSB7XG4gICAgICAvLyBjb21wdXRlIHRoZSB0cmFuc2Zvcm0sIGFuZCBtYXJrIHVzIGFzIG5vdCByZWxhdGl2ZS1kaXJ0eVxuICAgICAgdGhpcy5jb21wdXRlUmVsYXRpdmVUcmFuc2Zvcm0oKTtcblxuICAgICAgLy8gbWFyayBhbGwgY2hpbGRyZW4gbm93IGFzIGRpcnR5LCBzaW5jZSB3ZSBoYWQgdG8gdXBkYXRlIChtYXJrZWQgc28gdGhhdCBvdGhlciBjaGlsZHJlbiBmcm9tIHRoZSBvbmUgd2UgYXJlXG4gICAgICAvLyB2YWxpZGF0aW5nIHdpbGwga25vdyB0aGF0IHRoZXkgbmVlZCB1cGRhdGVzKVxuICAgICAgLy8gaWYgd2Ugd2VyZSBjYWxsZWQgZnJvbSBhIGNoaWxkJ3MgdmFsaWRhdGUoKSwgdGhleSB3aWxsIG5vdyBuZWVkIHRvIGNvbXB1dGUgdGhlaXIgdHJhbnNmb3JtXG4gICAgICBjb25zdCBsZW4gPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgICB0aGlzLmluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucmVsYXRpdmVUcmFuc2Zvcm0ucmVsYXRpdmVTZWxmRGlydHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZHVyaW5nIHRoZSBwcmUtcmVwYWludCBwaGFzZSB0byAoYSkgZmlyZSBvZmYgYWxsIHJlbGF0aXZlIHRyYW5zZm9ybSBsaXN0ZW5lcnMgdGhhdCBzaG91bGQgYmUgZmlyZWQsIGFuZFxuICAgKiAoYikgcHJlY29tcHV0ZSB0cmFuc2Zvcm1zIHdlcmUgZGVzaXJlZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFuY2VzdG9yV2FzRGlydHlcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmNlc3RvcklzRGlydHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyYW1lSWRcbiAgICogQHBhcmFtIHtib29sZWFufSBwYXNzVHJhbnNmb3JtXG4gICAqL1xuICB1cGRhdGVUcmFuc2Zvcm1MaXN0ZW5lcnNBbmRDb21wdXRlKCBhbmNlc3Rvcldhc0RpcnR5LCBhbmNlc3RvcklzRGlydHksIGZyYW1lSWQsIHBhc3NUcmFuc2Zvcm0gKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlJlbGF0aXZlVHJhbnNmb3JtICYmIHNjZW5lcnlMb2cuUmVsYXRpdmVUcmFuc2Zvcm0oXG4gICAgICBgdXBkYXRlL2NvbXB1dGU6ICR7dGhpcy50b1N0cmluZygpfSAke2FuY2VzdG9yV2FzRGlydHl9ID0+ICR7YW5jZXN0b3JJc0RpcnR5XG4gICAgICB9JHtwYXNzVHJhbnNmb3JtID8gJyBwYXNzVHJhbnNmb3JtJyA6ICcnfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmVsYXRpdmVUcmFuc2Zvcm0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBsZXQgbGVuO1xuICAgIGxldCBpO1xuXG4gICAgaWYgKCBwYXNzVHJhbnNmb3JtICkge1xuICAgICAgLy8gaWYgd2UgYXJlIHBhc3NpbmcgaXNUcmFuc2Zvcm0sIGp1c3QgYXBwbHkgdGhpcyB0byB0aGUgY2hpbGRyZW5cbiAgICAgIGxlbiA9IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZS5jaGlsZHJlblsgaSBdLnJlbGF0aXZlVHJhbnNmb3JtLnVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUoIGZhbHNlLCBmYWxzZSwgZnJhbWVJZCwgZmFsc2UgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCB3YXNEaXJ0eSA9IGFuY2VzdG9yV2FzRGlydHkgfHwgdGhpcy5yZWxhdGl2ZVNlbGZEaXJ0eTtcbiAgICAgIGNvbnN0IHdhc1N1YnRyZWVEaXJ0eSA9IHdhc0RpcnR5IHx8IHRoaXMucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPT09IGZyYW1lSWQ7XG4gICAgICBjb25zdCBoYXNDb21wdXRlTmVlZCA9IHRoaXMuaGFzRGVzY2VuZGFudENvbXB1dGVOZWVkKCk7XG4gICAgICBjb25zdCBoYXNMaXN0ZW5lck5lZWQgPSB0aGlzLmhhc0Rlc2NlbmRhbnRMaXN0ZW5lck5lZWQoKTtcbiAgICAgIGNvbnN0IGhhc1NlbGZDb21wdXRlTmVlZCA9IHRoaXMuaGFzU2VsZkNvbXB1dGVOZWVkKCk7XG4gICAgICBjb25zdCBoYXNTZWxmTGlzdGVuZXJOZWVkID0gdGhpcy5oYXNTZWxmTGlzdGVuZXJOZWVkKCk7XG5cbiAgICAgIC8vIGlmIG91ciByZWxhdGl2ZSB0cmFuc2Zvcm0gd2lsbCBiZSBkaXJ0eSBidXQgb3VyIHBhcmVudHMnIHRyYW5zZm9ybSB3aWxsIGJlIGNsZWFuLCB3ZSBuZWVkIHRvIG1hcmsgb3Vyc2VsdmVzXG4gICAgICAvLyBhcyBkaXJ0eSAoc28gdGhhdCBsYXRlciBhY2Nlc3MgY2FuIGlkZW50aWZ5IHdlIGFyZSBkaXJ0eSkuXG4gICAgICBpZiAoICFoYXNDb21wdXRlTmVlZCAmJiB3YXNEaXJ0eSAmJiAhYW5jZXN0b3JJc0RpcnR5ICkge1xuICAgICAgICB0aGlzLnJlbGF0aXZlU2VsZkRpcnR5ID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgaWYgdHJhdmVyc2FsIGlzbid0IG5lZWRlZCAobm8gaW5zdGFuY2VzIG1hcmtlZCBhcyBoYXZpbmcgbGlzdGVuZXJzIG9yIG5lZWRpbmcgY29tcHV0YXRpb24pXG4gICAgICAvLyBlaXRoZXIgdGhlIHN1YnRyZWUgaXMgY2xlYW4gKG5vIHRyYXZlcnNhbCBuZWVkZWQgZm9yIGNvbXB1dGUvbGlzdGVuZXJzKSwgb3Igd2UgaGF2ZSBubyBjb21wdXRlL2xpc3RlbmVyIG5lZWRzXG4gICAgICBpZiAoICF3YXNTdWJ0cmVlRGlydHkgfHwgKCAhaGFzQ29tcHV0ZU5lZWQgJiYgIWhhc0xpc3RlbmVyTmVlZCAmJiAhaGFzU2VsZkNvbXB1dGVOZWVkICYmICFoYXNTZWxmTGlzdGVuZXJOZWVkICkgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5SZWxhdGl2ZVRyYW5zZm9ybSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGRlc2lyZWQsIGNvbXB1dGUgdGhlIHRyYW5zZm9ybVxuICAgICAgaWYgKCB3YXNEaXJ0eSAmJiAoIGhhc0NvbXB1dGVOZWVkIHx8IGhhc1NlbGZDb21wdXRlTmVlZCApICkge1xuICAgICAgICAvLyBjb21wdXRlIHRoaXMgdHJhbnNmb3JtIGluIHRoZSBwcmUtcmVwYWludCBwaGFzZSwgc28gaXQgaXMgY2hlYXAgd2hlbiBhbHdheXMgdXNlZC9cbiAgICAgICAgLy8gd2UgdXBkYXRlIHdoZW4gdGhlIGNoaWxkLXByZWNvbXB1dGUgY291bnQgPjAsIHNpbmNlIHRob3NlIGNoaWxkcmVuIHdpbGwgbmVlZFxuICAgICAgICB0aGlzLmNvbXB1dGVSZWxhdGl2ZVRyYW5zZm9ybSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHRoaXMudHJhbnNmb3JtRGlydHkgKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gbm8gaGFzTGlzdGVuZXJOZWVkIGd1YXJkIG5lZWRlZD9cbiAgICAgIHRoaXMubm90aWZ5UmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMoKTtcblxuICAgICAgLy8gb25seSB1cGRhdGUgY2hpbGRyZW4gaWYgd2UgYXJlbid0IHRyYW5zZm9ybWVkIChjb21wbGV0ZWx5IG90aGVyIGNvbnRleHQpXG4gICAgICBpZiAoICF0aGlzLmluc3RhbmNlLmlzVHJhbnNmb3JtZWQgfHwgcGFzc1RyYW5zZm9ybSApIHtcblxuICAgICAgICBjb25zdCBpc0RpcnR5ID0gd2FzRGlydHkgJiYgISggaGFzQ29tcHV0ZU5lZWQgfHwgaGFzU2VsZkNvbXB1dGVOZWVkICk7XG5cbiAgICAgICAgLy8gY29udGludWUgdGhlIHRyYXZlcnNhbFxuICAgICAgICBsZW4gPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgICB0aGlzLmluc3RhbmNlLmNoaWxkcmVuWyBpIF0ucmVsYXRpdmVUcmFuc2Zvcm0udXBkYXRlVHJhbnNmb3JtTGlzdGVuZXJzQW5kQ29tcHV0ZSggd2FzRGlydHksIGlzRGlydHksIGZyYW1lSWQsIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUmVsYXRpdmVUcmFuc2Zvcm0gJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbm90aWZ5UmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMoKSB7XG4gICAgY29uc3QgbGVuID0gdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtTGlzdGVuZXJzWyBpIF0oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZnJhbWVJZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrc1xuICAgKi9cbiAgYXVkaXQoIGZyYW1lSWQsIGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrcyApIHtcbiAgICAvLyBnZXQgdGhlIHJlbGF0aXZlIG1hdHJpeCwgY29tcHV0ZWQgdG8gYmUgdXAtdG8tZGF0ZSwgYW5kIGlnbm9yZXMgYW55IGZsYWdzL2NvdW50cyBzbyB3ZSBjYW4gY2hlY2sgd2hldGhlciBvdXJcbiAgICAvLyBzdGF0ZSBpcyBjb25zaXN0ZW50XG4gICAgZnVuY3Rpb24gY3VycmVudFJlbGF0aXZlTWF0cml4KCBpbnN0YW5jZSApIHtcbiAgICAgIGNvbnN0IHJlc3VsdE1hdHJpeCA9IE1hdHJpeDMucG9vbC5mZXRjaCgpO1xuICAgICAgY29uc3Qgbm9kZU1hdHJpeCA9IGluc3RhbmNlLm5vZGUuZ2V0TWF0cml4KCk7XG5cbiAgICAgIGlmICggIWluc3RhbmNlLnBhcmVudCApIHtcbiAgICAgICAgLy8gaWYgb3VyIGluc3RhbmNlIGhhcyBubyBwYXJlbnQsIGlnbm9yZSBpdHMgdHJhbnNmb3JtXG4gICAgICAgIHJlc3VsdE1hdHJpeC5zZXQoIE1hdHJpeDMuSURFTlRJVFkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAhaW5zdGFuY2UucGFyZW50LmlzVHJhbnNmb3JtZWQgKSB7XG4gICAgICAgIC8vIG11dGFibGUgZm9ybSBvZiBwYXJlbnRNYXRyaXggKiBub2RlTWF0cml4XG4gICAgICAgIHJlc3VsdE1hdHJpeC5zZXQoIGN1cnJlbnRSZWxhdGl2ZU1hdHJpeCggaW5zdGFuY2UucGFyZW50ICkgKTtcbiAgICAgICAgcmVzdWx0TWF0cml4Lm11bHRpcGx5TWF0cml4KCBub2RlTWF0cml4ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gd2UgYXJlIHRoZSBmaXJzdCBpbiB0aGUgdHJhaWwgdHJhbnNmb3JtLCBzbyB3ZSBqdXN0IGRpcmVjdGx5IGNvcHkgdGhlIG1hdHJpeCBvdmVyXG4gICAgICAgIHJlc3VsdE1hdHJpeC5zZXQoIG5vZGVNYXRyaXggKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdE1hdHJpeDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNSZWxhdGl2ZVNlbGZEaXJ0eSggaW5zdGFuY2UgKSB7XG4gICAgICAvLyBpZiB2YWxpZGF0aW9uIGlzbid0IG5lZWRlZCwgYWN0IGxpa2Ugbm90aGluZyBpcyBkaXJ0eSAobWF0Y2hpbmcgb3VyIHZhbGlkYXRlIGJlaGF2aW9yKVxuICAgICAgaWYgKCBhbGxvd1ZhbGlkYXRpb25Ob3ROZWVkZWRDaGVja3MgJiYgaW5zdGFuY2UuaXNWYWxpZGF0aW9uTm90TmVlZGVkKCkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGluc3RhbmNlLnJlbGF0aXZlU2VsZkRpcnR5IHx8ICggaW5zdGFuY2UucGFyZW50ICYmIGhhc1JlbGF0aXZlU2VsZkRpcnR5KCBpbnN0YW5jZS5wYXJlbnQgKSApO1xuICAgIH1cblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIC8vIGNvdW50IHZlcmlmaWNhdGlvbiBmb3IgaW52YXJpYW50c1xuICAgICAgbGV0IG5vdGlmeVJlbGF0aXZlQ291bnQgPSAwO1xuICAgICAgbGV0IHByZWNvbXB1dGVSZWxhdGl2ZUNvdW50ID0gMDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkSW5zdGFuY2UgPSB0aGlzLmluc3RhbmNlLmNoaWxkcmVuWyBpIF07XG5cbiAgICAgICAgaWYgKCBjaGlsZEluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmhhc0FuY2VzdG9yTGlzdGVuZXJOZWVkKCkgKSB7XG4gICAgICAgICAgbm90aWZ5UmVsYXRpdmVDb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmICggY2hpbGRJbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5oYXNBbmNlc3RvckNvbXB1dGVOZWVkKCkgKSB7XG4gICAgICAgICAgcHJlY29tcHV0ZVJlbGF0aXZlQ291bnQrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXNzZXJ0U2xvdyggbm90aWZ5UmVsYXRpdmVDb3VudCA9PT0gdGhpcy5yZWxhdGl2ZUNoaWxkcmVuTGlzdGVuZXJzQ291bnQsXG4gICAgICAgICdSZWxhdGl2ZSBsaXN0ZW5lciBjb3VudCBpbnZhcmlhbnQnICk7XG4gICAgICBhc3NlcnRTbG93KCBwcmVjb21wdXRlUmVsYXRpdmVDb3VudCA9PT0gdGhpcy5yZWxhdGl2ZUNoaWxkcmVuUHJlY29tcHV0ZUNvdW50LFxuICAgICAgICAnUmVsYXRpdmUgcHJlY29tcHV0ZSBjb3VudCBpbnZhcmlhbnQnICk7XG5cbiAgICAgIGFzc2VydFNsb3coICF0aGlzLnBhcmVudCB8fCB0aGlzLmluc3RhbmNlLmlzVHJhbnNmb3JtZWQgfHwgKCB0aGlzLnJlbGF0aXZlQ2hpbGREaXJ0eUZyYW1lICE9PSBmcmFtZUlkICkgfHxcbiAgICAgICAgICAgICAgICAgICggdGhpcy5wYXJlbnQucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUgPT09IGZyYW1lSWQgKSxcbiAgICAgICAgJ0lmIHdlIGhhdmUgYSBwYXJlbnQsIHdlIG5lZWQgdG8gaG9sZCB0aGUgaW52YXJpYW50ICcgK1xuICAgICAgICAndGhpcy5yZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSA9PiBwYXJlbnQucmVsYXRpdmVDaGlsZERpcnR5RnJhbWUnICk7XG5cbiAgICAgIC8vIFNpbmNlIHdlIGNoZWNrIHRvIHNlZSBpZiBzb21ldGhpbmcgaXMgbm90IGRpcnR5LCB3ZSBuZWVkIHRvIGhhbmRsZSB0aGlzIHdoZW4gd2UgYXJlIGFjdHVhbGx5IHJlcG9ydGluZ1xuICAgICAgLy8gd2hhdCBpcyBkaXJ0eS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MTJcbiAgICAgIGlmICggIWFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrcyAmJiAhaGFzUmVsYXRpdmVTZWxmRGlydHkoIHRoaXMgKSApIHtcbiAgICAgICAgY29uc3QgbWF0cml4ID0gY3VycmVudFJlbGF0aXZlTWF0cml4KCB0aGlzICk7XG4gICAgICAgIGFzc2VydFNsb3coIG1hdHJpeC5lcXVhbHMoIHRoaXMubWF0cml4ICksICdJZiB0aGVyZSBpcyBubyByZWxhdGl2ZVNlbGZEaXJ0eSBmbGFnIHNldCBoZXJlIG9yIGluIG91cicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGFuY2VzdG9ycywgb3VyIG1hdHJpeCBzaG91bGQgYmUgdXAtdG8tZGF0ZScgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlbGF0aXZlVHJhbnNmb3JtJywgUmVsYXRpdmVUcmFuc2Zvcm0gKTtcbmV4cG9ydCBkZWZhdWx0IFJlbGF0aXZlVHJhbnNmb3JtOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiY2xlYW5BcnJheSIsInNjZW5lcnkiLCJSZWxhdGl2ZVRyYW5zZm9ybSIsImluaXRpYWxpemUiLCJkaXNwbGF5IiwidHJhaWwiLCJub2RlIiwibGFzdE5vZGUiLCJ0cmFuc2Zvcm1EaXJ0eSIsIm5vZGVUcmFuc2Zvcm1MaXN0ZW5lciIsIm9uTm9kZVRyYW5zZm9ybURpcnR5IiwiYmluZCIsIm1hdHJpeCIsImlkZW50aXR5IiwicmVsYXRpdmVTZWxmRGlydHkiLCJyZWxhdGl2ZUNoaWxkcmVuTGlzdGVuZXJzQ291bnQiLCJyZWxhdGl2ZVByZWNvbXB1dGVDb3VudCIsInJlbGF0aXZlQ2hpbGRyZW5QcmVjb21wdXRlQ291bnQiLCJyZWxhdGl2ZUZyYW1lSWQiLCJyZWxhdGl2ZUNoaWxkRGlydHlGcmFtZSIsIl9mcmFtZUlkIiwicmVsYXRpdmVUcmFuc2Zvcm1MaXN0ZW5lcnMiLCJwYXJlbnQiLCJpbnN0YW5jZSIsInJlbGF0aXZlVHJhbnNmb3JtIiwiYWRkSW5zdGFuY2UiLCJzdGF0ZWxlc3MiLCJhc3NlcnQiLCJoYXNBbmNlc3Rvckxpc3RlbmVyTmVlZCIsImhhc0FuY2VzdG9yQ29tcHV0ZU5lZWQiLCJpbmNyZW1lbnRUcmFuc2Zvcm1MaXN0ZW5lckNoaWxkcmVuIiwiaW5jcmVtZW50VHJhbnNmb3JtUHJlY29tcHV0ZUNoaWxkcmVuIiwiZm9yY2VNYXJrVHJhbnNmb3JtRGlydHkiLCJyZW1vdmVJbnN0YW5jZSIsImRlY3JlbWVudFRyYW5zZm9ybUxpc3RlbmVyQ2hpbGRyZW4iLCJkZWNyZW1lbnRUcmFuc2Zvcm1QcmVjb21wdXRlQ2hpbGRyZW4iLCJhdHRhY2hOb2RlTGlzdGVuZXJzIiwidHJhbnNmb3JtRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZGV0YWNoTm9kZUxpc3RlbmVycyIsInJlbW92ZUxpc3RlbmVyIiwiaGFzRGVzY2VuZGFudExpc3RlbmVyTmVlZCIsImlzVHJhbnNmb3JtZWQiLCJsZW5ndGgiLCJoYXNTZWxmTGlzdGVuZXJOZWVkIiwiYmVmb3JlIiwibGlzdGVuZXIiLCJwdXNoIiwic3BsaWNlIiwiXyIsImluZGV4T2YiLCJoYXNEZXNjZW5kYW50Q29tcHV0ZU5lZWQiLCJoYXNTZWxmQ29tcHV0ZU5lZWQiLCJhZGRQcmVjb21wdXRlIiwicmVtb3ZlUHJlY29tcHV0ZSIsImZyYW1lSWQiLCJwYXJlbnRJbnN0YW5jZSIsIm1hcmtUcmFuc2Zvcm1Sb290RGlydHkiLCJjb21wdXRlUmVsYXRpdmVUcmFuc2Zvcm0iLCJub2RlTWF0cml4IiwiZ2V0TWF0cml4Iiwic2V0IiwibXVsdGlwbHlNYXRyaXgiLCJpc1ZhbGlkYXRpb25Ob3ROZWVkZWQiLCJ2YWxpZGF0ZSIsImxlbiIsImNoaWxkcmVuIiwiaSIsInVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUiLCJhbmNlc3Rvcldhc0RpcnR5IiwiYW5jZXN0b3JJc0RpcnR5IiwicGFzc1RyYW5zZm9ybSIsInNjZW5lcnlMb2ciLCJ0b1N0cmluZyIsIndhc0RpcnR5Iiwid2FzU3VidHJlZURpcnR5IiwiaGFzQ29tcHV0ZU5lZWQiLCJoYXNMaXN0ZW5lck5lZWQiLCJwb3AiLCJub3RpZnlSZWxhdGl2ZVRyYW5zZm9ybUxpc3RlbmVycyIsImlzRGlydHkiLCJhdWRpdCIsImFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrcyIsImN1cnJlbnRSZWxhdGl2ZU1hdHJpeCIsInJlc3VsdE1hdHJpeCIsInBvb2wiLCJmZXRjaCIsIklERU5USVRZIiwiaGFzUmVsYXRpdmVTZWxmRGlydHkiLCJhc3NlcnRTbG93Iiwibm90aWZ5UmVsYXRpdmVDb3VudCIsInByZWNvbXB1dGVSZWxhdGl2ZUNvdW50IiwiY2hpbGRJbnN0YW5jZSIsImVxdWFscyIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtGQyxHQUVELE9BQU9BLGFBQWEs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