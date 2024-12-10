// Copyright 2016-2024, University of Colorado Boulder
/**
 * Sub-component of a Node that handles pickability and hit testing.
 *
 * A "listener equivalent" is either the existence of at least one input listener, or pickable:true. Nodes with
 * listener equivalents will basically try to hit-test ALL descendants that aren't invisible or pickable:false.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { scenery, Trail } from '../imports.js';
let Picker = class Picker {
    /*
   * Return a trail to the top node (if any, otherwise null) whose self-rendered area contains the
   * point (in parent coordinates).
   *
   * @param point
   * @param useMouse - Whether mouse-specific customizations (and acceleration) applies
   * @param useTouch - Whether touch-specific customizations (and acceleration) applies
   */ hitTest(point, useMouse, useTouch) {
        assert && assert(point, 'trailUnderPointer requires a point');
        sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`-------------- ${this.node.constructor.name}#${this.node.id}`);
        const isBaseInclusive = this.selfInclusive;
        // Validate the bounds that we will be using for hit acceleration. This should validate all bounds that could be
        // hit by recursiveHitTest.
        if (useMouse) {
            if (isBaseInclusive) {
                this.validateMouseInclusive();
            } else {
                this.validateMouseExclusive();
            }
        } else if (useTouch) {
            if (isBaseInclusive) {
                this.validateTouchInclusive();
            } else {
                this.validateTouchExclusive();
            }
        } else {
            this.node.validateBounds();
        }
        // Kick off recursive handling, with isInclusive:false
        return this.recursiveHitTest(point, useMouse, useTouch, false);
    }
    /**
   * @param point
   * @param useMouse
   * @param useTouch
   * @param isInclusive - Essentially true if there is an ancestor or self with an input listener
   */ recursiveHitTest(point, useMouse, useTouch, isInclusive) {
        isInclusive = isInclusive || this.selfInclusive;
        // If we are selfPruned, ignore this node and its subtree (invisible or pickable:false).
        // If the search is NOT inclusive (no listener equivalent), also ignore this subtree if subtreePrunable is true.
        if (this.selfPruned || !isInclusive && this.subtreePrunable) {
            sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} pruned ${this.selfPruned ? '(self)' : '(subtree)'}`);
            return null;
        }
        // Validation should have already been done in hitTest(), we just need to grab the accelerated bounds.
        let pruningBounds;
        if (useMouse) {
            pruningBounds = isInclusive ? this.mouseInclusiveBounds : this.mouseExclusiveBounds;
            assert && assert(isInclusive ? !this.mouseInclusiveDirty : !this.mouseExclusiveDirty);
        } else if (useTouch) {
            pruningBounds = isInclusive ? this.touchInclusiveBounds : this.touchExclusiveBounds;
            assert && assert(isInclusive ? !this.touchInclusiveDirty : !this.touchExclusiveDirty);
        } else {
            pruningBounds = this.node.bounds;
            assert && assert(!this.node._boundsDirty);
        }
        // Bail quickly if our point is not inside the bounds for the subtree.
        if (!pruningBounds.containsPoint(point)) {
            sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} pruned: ${useMouse ? 'mouse' : useTouch ? 'touch' : 'regular'}`);
            return null; // not in our bounds, so this point can't possibly be contained
        }
        // Transform the point in the local coordinate frame, so we can test it with the clipArea/children
        const localPoint = this.node._transform.getInverse().multiplyVector2(this.scratchVector.set(point));
        // If our point is outside of the local-coordinate clipping area, there should be no hit.
        const clipArea = this.node.clipArea;
        if (clipArea !== null && !clipArea.containsPoint(localPoint)) {
            sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} out of clip area`);
            return null;
        }
        sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id}`);
        // Check children before our "self", since the children are rendered on top.
        // Manual iteration here so we can return directly, and so we can iterate backwards (last node is in front).
        for(let i = this.node._children.length - 1; i >= 0; i--){
            const child = this.node._children[i];
            sceneryLog && sceneryLog.hitTest && sceneryLog.push();
            const childHit = child._picker.recursiveHitTest(localPoint, useMouse, useTouch, isInclusive);
            sceneryLog && sceneryLog.hitTest && sceneryLog.pop();
            // If there was a hit, immediately add our node to the start of the Trail (will recursively build the Trail).
            if (childHit) {
                return childHit.addAncestor(this.node, i);
            }
        }
        // Tests for mouse and touch hit areas before testing containsPointSelf
        if (useMouse && this.node._mouseArea) {
            sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} mouse area hit`);
            // NOTE: both Bounds2 and Shape have containsPoint! We use both here!
            return this.node._mouseArea.containsPoint(localPoint) ? new Trail(this.node) : null;
        }
        if (useTouch && this.node._touchArea) {
            sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} touch area hit`);
            // NOTE: both Bounds2 and Shape have containsPoint! We use both here!
            return this.node._touchArea.containsPoint(localPoint) ? new Trail(this.node) : null;
        }
        // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
        // avoid hit-testing the actual object (which may be more expensive).
        if (this.node.selfBounds.containsPoint(localPoint)) {
            if (this.node.containsPointSelf(localPoint)) {
                sceneryLog && sceneryLog.hitTest && sceneryLog.hitTest(`${this.node.constructor.name}#${this.node.id} self hit`);
                return new Trail(this.node);
            }
        }
        // No hit
        return null;
    }
    /**
   * Recursively sets dirty flags to true. If the andExclusive parameter is false, only the "inclusive" flags
   * are set to dirty.
   *
   * @param andExclusive
   * @param [ignoreSelfDirty] - If true, will invalidate parents even if we were dirty.
   */ invalidate(andExclusive, ignoreSelfDirty) {
        // Track whether a 'dirty' flag was changed from false=>true (or if ignoreSelfDirty is passed).
        let wasNotDirty = !!ignoreSelfDirty || !this.mouseInclusiveDirty || !this.touchInclusiveDirty;
        this.mouseInclusiveDirty = true;
        this.touchInclusiveDirty = true;
        if (andExclusive) {
            wasNotDirty = wasNotDirty || !this.mouseExclusiveDirty || !this.touchExclusiveDirty;
            this.mouseExclusiveDirty = true;
            this.touchExclusiveDirty = true;
        }
        // If we are selfPruned (or if we were already fully dirty), there should be no reason to call this on our
        // parents. If we are selfPruned, we are guaranteed to not be visited in a search by our parents, so changes
        // that make this picker dirty should NOT affect our parents' pickers values.
        if (!this.selfPruned && wasNotDirty) {
            const parents = this.node._parents;
            for(let i = 0; i < parents.length; i++){
                parents[i]._picker.invalidate(andExclusive || this.selfInclusive, false);
            }
        }
    }
    /**
   * Computes the mouseInclusiveBounds for this picker (if dirty), and recursively validates it for all non-pruned
   * children.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */ validateMouseInclusive() {
        if (!this.mouseInclusiveDirty) {
            return;
        }
        this.mouseInclusiveBounds.set(this.node.selfBounds);
        const children = this.node._children;
        for(let i = 0; i < children.length; i++){
            const childPicker = children[i]._picker;
            // Since we are "inclusive", we don't care about subtreePrunable (we won't prune for that). Only check
            // if pruning is force (selfPruned).
            if (!childPicker.selfPruned) {
                childPicker.validateMouseInclusive();
                this.mouseInclusiveBounds.includeBounds(childPicker.mouseInclusiveBounds);
            }
        }
        // Include mouseArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
        // coordinate frame.
        this.applyAreasAndTransform(this.mouseInclusiveBounds, this.node._mouseArea);
        this.mouseInclusiveDirty = false;
    }
    /**
   * Computes the mouseExclusiveBounds for this picker (if dirty), and recursively validates the mouse-related bounds
   * for all non-pruned children.
   *
   * Notably, if a picker is selfInclusive, we will switch to validating mouseInclusiveBounds for its subtree, as this
   * is what the hit-testing will use.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */ validateMouseExclusive() {
        if (!this.mouseExclusiveDirty) {
            return;
        }
        this.mouseExclusiveBounds.set(this.node.selfBounds);
        const children = this.node._children;
        for(let i = 0; i < children.length; i++){
            const childPicker = children[i]._picker;
            // Since we are not "inclusive", we will prune the search if subtreePrunable is true.
            if (!childPicker.subtreePrunable) {
                // If our child is selfInclusive, we need to switch to the "inclusive" validation.
                if (childPicker.selfInclusive) {
                    childPicker.validateMouseInclusive();
                    this.mouseExclusiveBounds.includeBounds(childPicker.mouseInclusiveBounds);
                } else {
                    childPicker.validateMouseExclusive();
                    this.mouseExclusiveBounds.includeBounds(childPicker.mouseExclusiveBounds);
                }
            }
        }
        // Include mouseArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
        // coordinate frame.
        this.applyAreasAndTransform(this.mouseExclusiveBounds, this.node._mouseArea);
        this.mouseExclusiveDirty = false;
    }
    /**
   * Computes the touchInclusiveBounds for this picker (if dirty), and recursively validates it for all non-pruned
   * children.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */ validateTouchInclusive() {
        if (!this.touchInclusiveDirty) {
            return;
        }
        this.touchInclusiveBounds.set(this.node.selfBounds);
        const children = this.node._children;
        for(let i = 0; i < children.length; i++){
            const childPicker = children[i]._picker;
            // Since we are "inclusive", we don't care about subtreePrunable (we won't prune for that). Only check
            // if pruning is force (selfPruned).
            if (!childPicker.selfPruned) {
                childPicker.validateTouchInclusive();
                this.touchInclusiveBounds.includeBounds(childPicker.touchInclusiveBounds);
            }
        }
        // Include touchArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
        // coordinate frame.
        this.applyAreasAndTransform(this.touchInclusiveBounds, this.node._touchArea);
        this.touchInclusiveDirty = false;
    }
    /**
   * Computes the touchExclusiveBounds for this picker (if dirty), and recursively validates the touch-related bounds
   * for all non-pruned children.
   *
   * Notably, if a picker is selfInclusive, we will switch to validating touchInclusiveBounds for its subtree, as this
   * is what the hit-testing will use.
   *
   * NOTE: For the future, consider sharing more code with related functions. I tried this, and it made things look
   * more complicated (and probably slower), so I've kept some duplication. If a change is made to this function,
   * please check the other validate* methods to see if they also need a change.
   */ validateTouchExclusive() {
        if (!this.touchExclusiveDirty) {
            return;
        }
        this.touchExclusiveBounds.set(this.node.selfBounds);
        const children = this.node._children;
        for(let i = 0; i < children.length; i++){
            const childPicker = children[i]._picker;
            // Since we are not "inclusive", we will prune the search if subtreePrunable is true.
            if (!childPicker.subtreePrunable) {
                // If our child is selfInclusive, we need to switch to the "inclusive" validation.
                if (childPicker.selfInclusive) {
                    childPicker.validateTouchInclusive();
                    this.touchExclusiveBounds.includeBounds(childPicker.touchInclusiveBounds);
                } else {
                    childPicker.validateTouchExclusive();
                    this.touchExclusiveBounds.includeBounds(childPicker.touchExclusiveBounds);
                }
            }
        }
        // Include touchArea (if applicable), exclude outside clipArea (if applicable), and transform to the parent
        // coordinate frame.
        this.applyAreasAndTransform(this.touchExclusiveBounds, this.node._touchArea);
        this.touchExclusiveDirty = false;
    }
    /**
   * Include pointer areas (if applicable), exclude bounds outside the clip area (if applicable), and transform
   * into the parent coordinate frame. Mutates the bounds provided.
   *
   * Meant to be called by the validation methods, as this part is the same for every validation that is done.
   *
   * @param mutableBounds - The bounds to be mutated (e.g. mouseExclusiveBounds).
   * @param pointerArea - A mouseArea/touchArea that should be included in the search.
   */ applyAreasAndTransform(mutableBounds, pointerArea) {
        // do this before the transformation to the parent coordinate frame (the mouseArea is in the local coordinate frame)
        if (pointerArea) {
            // we accept either Bounds2, or a Shape (in which case, we take the Shape's bounds)
            mutableBounds.includeBounds(pointerArea instanceof Bounds2 ? pointerArea : pointerArea.bounds);
        }
        const clipArea = this.node.clipArea;
        if (clipArea) {
            const clipBounds = clipArea.bounds;
            // exclude areas outside of the clipping area's bounds (for efficiency)
            // Uses Bounds2.constrainBounds, but inlined to prevent https://github.com/phetsims/projectile-motion/issues/155
            mutableBounds.minX = Math.max(mutableBounds.minX, clipBounds.minX);
            mutableBounds.minY = Math.max(mutableBounds.minY, clipBounds.minY);
            mutableBounds.maxX = Math.min(mutableBounds.maxX, clipBounds.maxX);
            mutableBounds.maxY = Math.min(mutableBounds.maxY, clipBounds.maxY);
        }
        // transform it to the parent coordinate frame
        this.node.transformBoundsFromLocalToParent(mutableBounds);
    }
    /**
   * Called from Node when a child is inserted. (scenery-internal)
   *
   * NOTE: The child may not be fully added when this is called. Don't audit, or assume that calls to the Node would
   * indicate the parent-child relationship.
   *
   * @param childNode - Our picker node's new child node.
   */ onInsertChild(childNode) {
        // If the child is selfPruned, we don't have to update any metadata.
        if (!childNode._picker.selfPruned) {
            const hasPickable = childNode._picker.subtreePickableCount > 0;
            // If it has a non-zero subtreePickableCount, we'll need to increment our own count by 1.
            if (hasPickable) {
                this.changePickableCount(1);
            }
            // If it has a subtreePickableCount of zero, it would be pruned by "exclusive" searches, so we only need to
            // invalidate the "inclusive" bounds.
            this.invalidate(hasPickable, true);
        }
    }
    /**
   * Called from Node when a child is removed. (scenery-internal)
   *
   * NOTE: The child may not be fully removed when this is called. Don't audit, or assume that calls to the Node would
   * indicate the parent-child relationship.
   *
   * @param childNode - Our picker node's child that will be removed.
   */ onRemoveChild(childNode) {
        // If the child is selfPruned, we don't have to update any metadata.
        if (!childNode._picker.selfPruned) {
            const hasPickable = childNode._picker.subtreePickableCount > 0;
            // If it has a non-zero subtreePickableCount, we'll need to decrement our own count by 1.
            if (hasPickable) {
                this.changePickableCount(-1);
            }
            // If it has a subtreePickableCount of zero, it would be pruned by "exclusive" searches, so we only need to
            // invalidate the "inclusive" bounds.
            this.invalidate(hasPickable, true);
        }
    }
    /**
   * Called from Node when an input listener is added to our node. (scenery-internal)
   */ onAddInputListener() {
        // Update flags that depend on listener count
        this.checkSelfInclusive();
        this.checkSubtreePrunable();
        // Update our pickable count, since it includes a count of how many input listeners we have.
        this.changePickableCount(1); // NOTE: this should also trigger invalidation of mouse/touch bounds
        if (assertSlow) {
            this.audit();
        }
    }
    /**
   * Called from Node when an input listener is removed from our node. (scenery-internal)
   */ onRemoveInputListener() {
        // Update flags that depend on listener count
        this.checkSelfInclusive();
        this.checkSubtreePrunable();
        // Update our pickable count, since it includes a count of how many input listeners we have.
        this.changePickableCount(-1); // NOTE: this should also trigger invalidation of mouse/touch bounds
        if (assertSlow) {
            this.audit();
        }
    }
    /**
   * Called when the 'pickable' value of our Node is changed. (scenery-internal)
   */ onPickableChange(oldPickable, pickable) {
        // Update flags that depend on our pickable setting.
        this.checkSelfPruned();
        this.checkSelfInclusive();
        this.checkSubtreePrunable();
        // Compute our pickable count change (pickable:true counts for 1)
        const change = (oldPickable === true ? -1 : 0) + (pickable === true ? 1 : 0);
        if (change) {
            this.changePickableCount(change);
        }
        if (assertSlow) {
            this.audit();
        }
    }
    /**
   * Called when the visibility of our Node is changed. (scenery-internal)
   */ onVisibilityChange() {
        // Update flags that depend on our visibility.
        this.checkSelfPruned();
        this.checkSubtreePrunable();
    }
    /**
   * Called when the mouseArea of the Node is changed. (scenery-internal)
   */ onMouseAreaChange() {
        // Bounds can depend on the mouseArea, so we'll invalidate those.
        // TODO: Consider bounds invalidation that only does the 'mouse' flags, since we don't need to invalidate touches. https://github.com/phetsims/scenery/issues/1581
        this.invalidate(true);
    }
    /**
   * Called when the mouseArea of the Node is changed. (scenery-internal)
   */ onTouchAreaChange() {
        // Bounds can depend on the touchArea, so we'll invalidate those.
        // TODO: Consider bounds invalidation that only does the 'touch' flags, since we don't need to invalidate mice. https://github.com/phetsims/scenery/issues/1581
        this.invalidate(true);
    }
    /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */ onTransformChange() {
        // Can affect our bounds
        this.invalidate(true);
    }
    /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */ onSelfBoundsDirty() {
        // Can affect our bounds
        this.invalidate(true);
    }
    /**
   * Called when the transform of the Node is changed. (scenery-internal)
   */ onClipAreaChange() {
        // Can affect our bounds.
        this.invalidate(true);
    }
    /**
   * Check to see if we are 'selfPruned', and update the value. If it changed, we'll need to notify our parents.
   *
   * Note that the prunability "pickable:false" or "invisible" won't affect our computed bounds, so we don't
   * invalidate ourself.
   */ checkSelfPruned() {
        const selfPruned = this.node.pickableProperty.value === false || !this.node.isVisible();
        if (this.selfPruned !== selfPruned) {
            this.selfPruned = selfPruned;
            // Notify parents
            const parents = this.node._parents;
            for(let i = 0; i < parents.length; i++){
                const picker = parents[i]._picker;
                // If we have an input listener/pickable:true in our subtree, we'll need to invalidate exclusive bounds also,
                // and we'll want to update the pickable count of our parent.
                if (this.subtreePickableCount > 0) {
                    picker.invalidate(true, true);
                    picker.changePickableCount(this.selfPruned ? -1 : 1);
                } else {
                    picker.invalidate(false, true);
                }
            }
        }
    }
    /**
   * Check to see if we are 'selfInclusive', and update the value. If it changed, we'll need to invalidate ourself.
   */ checkSelfInclusive() {
        const selfInclusive = this.node.pickableProperty.value === true || this.node._inputListeners.length > 0;
        if (this.selfInclusive !== selfInclusive) {
            this.selfInclusive = selfInclusive;
            // Our dirty flag handling for both inclusive and exclusive depend on this value.
            this.invalidate(true, true);
        }
    }
    /**
   * Update our 'subtreePrunable' flag.
   */ checkSubtreePrunable() {
        const subtreePrunable = this.node.pickableProperty.value === false || !this.node.isVisible() || this.node.pickableProperty.value !== true && this.subtreePickableCount === 0;
        if (this.subtreePrunable !== subtreePrunable) {
            this.subtreePrunable = subtreePrunable;
            // Our dirty flag handling for both inclusive and exclusive depend on this value.
            this.invalidate(true, true);
        }
    }
    /**
   * Propagate the pickable count change down to our ancestors.
   *
   * @param n - The delta of how many pickable counts have been added/removed
   */ changePickableCount(n) {
        if (n === 0) {
            return;
        }
        // Switching between 0 and 1 matters, since we then need to update the counts of our parents.
        const wasZero = this.subtreePickableCount === 0;
        this.subtreePickableCount += n;
        const isZero = this.subtreePickableCount === 0;
        // Our subtreePrunable value depends on our pickable count, make sure it gets updated.
        this.checkSubtreePrunable();
        assert && assert(this.subtreePickableCount >= 0, 'subtree pickable count should be guaranteed to be >= 0');
        if (!this.selfPruned && wasZero !== isZero) {
            // Update our parents if our count changed (AND if it matters, i.e. we aren't selfPruned).
            const len = this.node._parents.length;
            for(let i = 0; i < len; i++){
                this.node._parents[i]._picker.changePickableCount(wasZero ? 1 : -1);
            }
        }
    }
    /**
   * Returns whether our node is potentially pickable from its parents (i.e. whether it could be hit-tested and sent
   * input events, and thus whether its input listeners are relevant and could be interrupted).
   */ isPotentiallyPickable() {
        // subtreePrunable is equivalent to:
        // node.pickable === false || !node.isVisible() || ( node.pickable !== true && subtreePickableCount === 0 )
        return !this.subtreePrunable && this.node.inputEnabled;
    }
    /**
   * Runs a number of consistency tests when assertSlow is enabled. Verifies most conditions, and helps to catch
   * bugs earlier when they are initially triggered. (scenery-internal)
   */ audit() {
        if (assertSlow) {
            this.node._children.forEach((node)=>{
                node._picker.audit();
            });
            const localAssertSlow = assertSlow;
            const expectedSelfPruned = this.node.pickable === false || !this.node.isVisible();
            const expectedSelfInclusive = this.node.pickable === true || this.node._inputListeners.length > 0;
            const expectedSubtreePrunable = this.node.pickable === false || !this.node.isVisible() || this.node.pickable !== true && this.subtreePickableCount === 0;
            const expectedSubtreePickableCount = this.node._inputListeners.length + (this.node.pickableProperty.value === true ? 1 : 0) + _.filter(this.node._children, (child)=>!child._picker.selfPruned && child._picker.subtreePickableCount > 0).length;
            assertSlow(this.selfPruned === expectedSelfPruned, 'selfPruned mismatch');
            assertSlow(this.selfInclusive === expectedSelfInclusive, 'selfInclusive mismatch');
            assertSlow(this.subtreePrunable === expectedSubtreePrunable, 'subtreePrunable mismatch');
            assertSlow(this.subtreePickableCount === expectedSubtreePickableCount, 'subtreePickableCount mismatch');
            this.node._parents.forEach((parent)=>{
                const parentPicker = parent._picker;
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const childPicker = this; // eslint-disable-line consistent-this
                if (!parentPicker.mouseInclusiveDirty) {
                    localAssertSlow(childPicker.selfPruned || !childPicker.mouseInclusiveDirty);
                }
                if (!parentPicker.mouseExclusiveDirty) {
                    if (childPicker.selfInclusive) {
                        localAssertSlow(childPicker.selfPruned || !childPicker.mouseInclusiveDirty);
                    } else {
                        localAssertSlow(childPicker.selfPruned || childPicker.subtreePrunable || !childPicker.mouseExclusiveDirty);
                    }
                }
                if (!parentPicker.touchInclusiveDirty) {
                    localAssertSlow(childPicker.selfPruned || !childPicker.touchInclusiveDirty);
                }
                if (!parentPicker.touchExclusiveDirty) {
                    if (childPicker.selfInclusive) {
                        localAssertSlow(childPicker.selfPruned || !childPicker.touchInclusiveDirty);
                    } else {
                        localAssertSlow(childPicker.selfPruned || childPicker.subtreePrunable || !childPicker.touchExclusiveDirty);
                    }
                }
            });
        }
    }
    constructor(node){
        this.node = node;
        this.selfPruned = false;
        this.selfInclusive = false;
        this.subtreePrunable = true;
        this.subtreePickableCount = 0;
        this.mouseInclusiveBounds = Bounds2.NOTHING.copy();
        this.mouseExclusiveBounds = Bounds2.NOTHING.copy();
        this.touchInclusiveBounds = Bounds2.NOTHING.copy();
        this.touchExclusiveBounds = Bounds2.NOTHING.copy();
        this.mouseInclusiveDirty = true;
        this.mouseExclusiveDirty = true;
        this.touchInclusiveDirty = true;
        this.touchExclusiveDirty = true;
        this.scratchVector = new Vector2(0, 0);
    }
};
export { Picker as default };
scenery.register('Picker', Picker);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9QaWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3ViLWNvbXBvbmVudCBvZiBhIE5vZGUgdGhhdCBoYW5kbGVzIHBpY2thYmlsaXR5IGFuZCBoaXQgdGVzdGluZy5cbiAqXG4gKiBBIFwibGlzdGVuZXIgZXF1aXZhbGVudFwiIGlzIGVpdGhlciB0aGUgZXhpc3RlbmNlIG9mIGF0IGxlYXN0IG9uZSBpbnB1dCBsaXN0ZW5lciwgb3IgcGlja2FibGU6dHJ1ZS4gTm9kZXMgd2l0aFxuICogbGlzdGVuZXIgZXF1aXZhbGVudHMgd2lsbCBiYXNpY2FsbHkgdHJ5IHRvIGhpdC10ZXN0IEFMTCBkZXNjZW5kYW50cyB0aGF0IGFyZW4ndCBpbnZpc2libGUgb3IgcGlja2FibGU6ZmFsc2UuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IE5vZGUsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBpY2tlciB7XG5cbiAgLy8gT3VyIG5vZGVcbiAgcHJpdmF0ZSByZWFkb25seSBub2RlOiBOb2RlO1xuXG4gIC8vIFdoZXRoZXIgb3VyIGxhc3Qta25vd24gc3RhdGUgd291bGQgaGF2ZSB1cyBiZSBwcnVuZWQgYnkgaGl0LXRlc3Qgc2VhcmNoZXMuIFNob3VsZCBiZSBlcXVhbCB0b1xuICAvLyBub2RlLnBpY2thYmxlID09PSBmYWxzZSB8fCBub2RlLmlzVmlzaWJsZSgpID09PSBmYWxzZS4gVXBkYXRlZCBzeW5jaHJvbm91c2x5LlxuICBwcml2YXRlIHNlbGZQcnVuZWQ6IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciBvdXIgbGFzdC1rbm93biBzdGF0ZSB3b3VsZCBoYXZlIHVzIG5vdCBwcnVuZSBkZXNjZW5kYW50IHN1YnRyZWVzIGZvciB0aGUgbGFjayBvZiBsaXN0ZW5lciBlcXVpdmFsZW50c1xuICAvLyAod2hldGhlciB3ZSBoYXZlIGEgbGlzdGVuZXIgZXF1aXZhbGVudCkuIFNob3VsZCBiZSBlcXVhbCB0b1xuICAvLyBub2RlLnBpY2thYmxlID09PSB0cnVlIHx8IG5vZGUuX2lucHV0TGlzdGVuZXJzLmxlbmd0aCA+IDAuIFVwZGF0ZWQgc3luY2hyb25vdXNseS5cbiAgcHJpdmF0ZSBzZWxmSW5jbHVzaXZlOiBib29sZWFuO1xuXG4gIC8vIFdoZXRoZXIgb3VyIHN1YnRyZWUgY2FuIGJlIHBydW5lZCBJRiBubyBhbmNlc3RvciAob3IgdXMpIGhhcyBzZWxmSW5jbHVzaXZlIGFzIHRydWUuIEVxdWl2YWxlbnQgdG86XG4gIC8vIG5vZGUucGlja2FibGUgPT09IGZhbHNlIHx8ICFub2RlLmlzVmlzaWJsZSgpIHx8ICggbm9kZS5waWNrYWJsZSAhPT0gdHJ1ZSAmJiBzdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gMCApXG4gIHByaXZhdGUgc3VidHJlZVBydW5hYmxlOiBib29sZWFuO1xuXG4gIC8vIENvdW50IGRlc2lnbmVkIHRvIGJlIG5vbi16ZXJvIHdoZW4gdGhlcmUgaXMgYSBsaXN0ZW5lciBlcXVpdmFsZW50IGluIHRoaXMgbm9kZSdzIHN1YnRyZWUuIEVmZmVjdGl2ZWx5IHRoZSBzdW0gb2ZcbiAgLy8gI2lucHV0TGlzdGVuZXJzICsgKDE/aXNQaWNrYWJsZTp0cnVlKSArICNjaGlsZHJlbldpdGhOb25aZXJvQ291bnQuIE5vdGFibHksIGl0IGlnbm9yZXMgY2hpbGRyZW4gd2hvIGFyZSBndWFyYW50ZWVkXG4gIC8vIHRvIGJlIHBydW5lZCAoc2VsZlBydW5lZDp0cnVlKS5cbiAgcHJpdmF0ZSBzdWJ0cmVlUGlja2FibGVDb3VudDogbnVtYmVyO1xuXG4gIC8vIE5PVEU6IFdlIG5lZWQgXCJpbmNsdXNpdmVcIiBhbmQgXCJleGNsdXNpdmVcIiBib3VuZHMgdG8gaWRlYWxseSBiZSBzZXBhcmF0ZSwgc28gdGhhdCB0aGV5IGNhbiBiZSBjYWNoZWRcbiAgLy8gaW5kZXBlbmRlbnRseS4gSXQncyBwb3NzaWJsZSBmb3Igb25lIHRyYWlsIHRvIGhhdmUgYW4gYW5jZXN0b3Igd2l0aCBwaWNrYWJsZTp0cnVlIChpbmNsdXNpdmUpIHdoaWxlIGFub3RoZXJcbiAgLy8gdHJhaWwgaGFzIG5vIGFuY2VzdG9ycyB0aGF0IG1ha2UgdGhlIHNlYXJjaCBpbmNsdXNpdmUuIFRoaXMgd291bGQgaW50cm9kdWNlIFwidGhyYXNoaW5nXCIgaW4gdGhlIG9sZGVyIHZlcnNpb24sXG4gIC8vIHdoZXJlIGl0IHdvdWxkIGNvbnRpbnVvdXNseSBjb21wdXRlIG9uZSBvciB0aGUgb3RoZXIuIEhlcmUsIGJvdGggdmVyc2lvbnMgY2FuIGJlIHN0b3JlZC5cblxuICAvLyBCb3VuZHMgdG8gYmUgdXNlZCBmb3IgcHJ1bmluZyBtb3VzZSBoaXQgdGVzdHMgd2hlbiBhbiBhbmNlc3RvciBoYXMgYSBsaXN0ZW5lciBlcXVpdmFsZW50LiBVcGRhdGVkIGxhemlseSwgd2hpbGVcbiAgLy8gdGhlIGRpcnR5IGZsYWcgaXMgdXBkYXRlZCBzeW5jaHJvbm91c2x5LlxuICBwcml2YXRlIG1vdXNlSW5jbHVzaXZlQm91bmRzOiBCb3VuZHMyO1xuXG4gIC8vIEJvdW5kcyB0byBiZSB1c2VkIGZvciBwcnVuaW5nIG1vdXNlIGhpdCB0ZXN0cyB3aGVuIGFuY2VzdG9ycyBoYXZlIE5PIGxpc3RlbmVyIGVxdWl2YWxlbnQuIFVwZGF0ZWQgbGF6aWx5LCB3aGlsZVxuICAvLyB0aGUgZGlydHkgZmxhZyBpcyB1cGRhdGVkIHN5bmNocm9ub3VzbHkuXG4gIHByaXZhdGUgbW91c2VFeGNsdXNpdmVCb3VuZHM6IEJvdW5kczI7XG5cbiAgLy8gQm91bmRzIHRvIGJlIHVzZWQgZm9yIHBydW5pbmcgdG91Y2ggaGl0IHRlc3RzIHdoZW4gYW4gYW5jZXN0b3IgaGFzIGEgbGlzdGVuZXIgZXF1aXZhbGVudC4gVXBkYXRlZCBsYXppbHksIHdoaWxlXG4gIC8vIHRoZSBkaXJ0eSBmbGFnIGlzIHVwZGF0ZWQgc3luY2hyb25vdXNseS5cbiAgcHJpdmF0ZSB0b3VjaEluY2x1c2l2ZUJvdW5kczogQm91bmRzMjtcblxuICAvLyBCb3VuZHMgdG8gYmUgdXNlZCBmb3IgcHJ1bmluZyB0b3VjaCBoaXQgdGVzdHMgd2hlbiBhbmNlc3RvcnMgaGF2ZSBOTyBsaXN0ZW5lciBlcXVpdmFsZW50LiBVcGRhdGVkIGxhemlseSwgd2hpbGVcbiAgLy8gdGhlIGRpcnR5IGZsYWcgaXMgdXBkYXRlZCBzeW5jaHJvbm91c2x5LlxuICBwcml2YXRlIHRvdWNoRXhjbHVzaXZlQm91bmRzOiBCb3VuZHMyO1xuXG4gIC8vIERpcnR5IGZsYWdzLCBvbmUgZm9yIGVhY2ggQm91bmRzLlxuICBwcml2YXRlIG1vdXNlSW5jbHVzaXZlRGlydHk6IGJvb2xlYW47XG4gIHByaXZhdGUgbW91c2VFeGNsdXNpdmVEaXJ0eTogYm9vbGVhbjtcbiAgcHJpdmF0ZSB0b3VjaEluY2x1c2l2ZURpcnR5OiBib29sZWFuO1xuICBwcml2YXRlIHRvdWNoRXhjbHVzaXZlRGlydHk6IGJvb2xlYW47XG5cbiAgLy8gVXNlZCB0byBtaW5pbWl6ZSBnYXJiYWdlIGNyZWF0ZWQgaW4gdGhlIGhpdC10ZXN0aW5nIHByb2Nlc3NcbiAgcHJpdmF0ZSBzY3JhdGNoVmVjdG9yOiBWZWN0b3IyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggbm9kZTogTm9kZSApIHtcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIHRoaXMuc2VsZlBydW5lZCA9IGZhbHNlO1xuICAgIHRoaXMuc2VsZkluY2x1c2l2ZSA9IGZhbHNlO1xuICAgIHRoaXMuc3VidHJlZVBydW5hYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID0gMDtcbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICB0aGlzLm1vdXNlRXhjbHVzaXZlQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICB0aGlzLnRvdWNoSW5jbHVzaXZlQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICB0aGlzLnRvdWNoRXhjbHVzaXZlQm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgPSB0cnVlO1xuICAgIHRoaXMubW91c2VFeGNsdXNpdmVEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy50b3VjaEluY2x1c2l2ZURpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnRvdWNoRXhjbHVzaXZlRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuc2NyYXRjaFZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm4gYSB0cmFpbCB0byB0aGUgdG9wIG5vZGUgKGlmIGFueSwgb3RoZXJ3aXNlIG51bGwpIHdob3NlIHNlbGYtcmVuZGVyZWQgYXJlYSBjb250YWlucyB0aGVcbiAgICogcG9pbnQgKGluIHBhcmVudCBjb29yZGluYXRlcykuXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludFxuICAgKiBAcGFyYW0gdXNlTW91c2UgLSBXaGV0aGVyIG1vdXNlLXNwZWNpZmljIGN1c3RvbWl6YXRpb25zIChhbmQgYWNjZWxlcmF0aW9uKSBhcHBsaWVzXG4gICAqIEBwYXJhbSB1c2VUb3VjaCAtIFdoZXRoZXIgdG91Y2gtc3BlY2lmaWMgY3VzdG9taXphdGlvbnMgKGFuZCBhY2NlbGVyYXRpb24pIGFwcGxpZXNcbiAgICovXG4gIHB1YmxpYyBoaXRUZXN0KCBwb2ludDogVmVjdG9yMiwgdXNlTW91c2U6IGJvb2xlYW4sIHVzZVRvdWNoOiBib29sZWFuICk6IFRyYWlsIHwgbnVsbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcG9pbnQsICd0cmFpbFVuZGVyUG9pbnRlciByZXF1aXJlcyBhIHBvaW50JyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5oaXRUZXN0KCBgLS0tLS0tLS0tLS0tLS0gJHt0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZX0jJHt0aGlzLm5vZGUuaWR9YCApO1xuXG4gICAgY29uc3QgaXNCYXNlSW5jbHVzaXZlID0gdGhpcy5zZWxmSW5jbHVzaXZlO1xuXG4gICAgLy8gVmFsaWRhdGUgdGhlIGJvdW5kcyB0aGF0IHdlIHdpbGwgYmUgdXNpbmcgZm9yIGhpdCBhY2NlbGVyYXRpb24uIFRoaXMgc2hvdWxkIHZhbGlkYXRlIGFsbCBib3VuZHMgdGhhdCBjb3VsZCBiZVxuICAgIC8vIGhpdCBieSByZWN1cnNpdmVIaXRUZXN0LlxuICAgIGlmICggdXNlTW91c2UgKSB7XG4gICAgICBpZiAoIGlzQmFzZUluY2x1c2l2ZSApIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZU1vdXNlSW5jbHVzaXZlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy52YWxpZGF0ZU1vdXNlRXhjbHVzaXZlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCB1c2VUb3VjaCApIHtcbiAgICAgIGlmICggaXNCYXNlSW5jbHVzaXZlICkge1xuICAgICAgICB0aGlzLnZhbGlkYXRlVG91Y2hJbmNsdXNpdmUoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnZhbGlkYXRlVG91Y2hFeGNsdXNpdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm5vZGUudmFsaWRhdGVCb3VuZHMoKTtcbiAgICB9XG5cbiAgICAvLyBLaWNrIG9mZiByZWN1cnNpdmUgaGFuZGxpbmcsIHdpdGggaXNJbmNsdXNpdmU6ZmFsc2VcbiAgICByZXR1cm4gdGhpcy5yZWN1cnNpdmVIaXRUZXN0KCBwb2ludCwgdXNlTW91c2UsIHVzZVRvdWNoLCBmYWxzZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwb2ludFxuICAgKiBAcGFyYW0gdXNlTW91c2VcbiAgICogQHBhcmFtIHVzZVRvdWNoXG4gICAqIEBwYXJhbSBpc0luY2x1c2l2ZSAtIEVzc2VudGlhbGx5IHRydWUgaWYgdGhlcmUgaXMgYW4gYW5jZXN0b3Igb3Igc2VsZiB3aXRoIGFuIGlucHV0IGxpc3RlbmVyXG4gICAqL1xuICBwcml2YXRlIHJlY3Vyc2l2ZUhpdFRlc3QoIHBvaW50OiBWZWN0b3IyLCB1c2VNb3VzZTogYm9vbGVhbiwgdXNlVG91Y2g6IGJvb2xlYW4sIGlzSW5jbHVzaXZlOiBib29sZWFuICk6IFRyYWlsIHwgbnVsbCB7XG4gICAgaXNJbmNsdXNpdmUgPSBpc0luY2x1c2l2ZSB8fCB0aGlzLnNlbGZJbmNsdXNpdmU7XG5cbiAgICAvLyBJZiB3ZSBhcmUgc2VsZlBydW5lZCwgaWdub3JlIHRoaXMgbm9kZSBhbmQgaXRzIHN1YnRyZWUgKGludmlzaWJsZSBvciBwaWNrYWJsZTpmYWxzZSkuXG4gICAgLy8gSWYgdGhlIHNlYXJjaCBpcyBOT1QgaW5jbHVzaXZlIChubyBsaXN0ZW5lciBlcXVpdmFsZW50KSwgYWxzbyBpZ25vcmUgdGhpcyBzdWJ0cmVlIGlmIHN1YnRyZWVQcnVuYWJsZSBpcyB0cnVlLlxuICAgIGlmICggdGhpcy5zZWxmUHJ1bmVkIHx8ICggIWlzSW5jbHVzaXZlICYmIHRoaXMuc3VidHJlZVBydW5hYmxlICkgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZFxuICAgICAgfSBwcnVuZWQgJHt0aGlzLnNlbGZQcnVuZWQgPyAnKHNlbGYpJyA6ICcoc3VidHJlZSknfWAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRpb24gc2hvdWxkIGhhdmUgYWxyZWFkeSBiZWVuIGRvbmUgaW4gaGl0VGVzdCgpLCB3ZSBqdXN0IG5lZWQgdG8gZ3JhYiB0aGUgYWNjZWxlcmF0ZWQgYm91bmRzLlxuICAgIGxldCBwcnVuaW5nQm91bmRzO1xuICAgIGlmICggdXNlTW91c2UgKSB7XG4gICAgICBwcnVuaW5nQm91bmRzID0gaXNJbmNsdXNpdmUgPyB0aGlzLm1vdXNlSW5jbHVzaXZlQm91bmRzIDogdGhpcy5tb3VzZUV4Y2x1c2l2ZUJvdW5kcztcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzSW5jbHVzaXZlID8gIXRoaXMubW91c2VJbmNsdXNpdmVEaXJ0eSA6ICF0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHVzZVRvdWNoICkge1xuICAgICAgcHJ1bmluZ0JvdW5kcyA9IGlzSW5jbHVzaXZlID8gdGhpcy50b3VjaEluY2x1c2l2ZUJvdW5kcyA6IHRoaXMudG91Y2hFeGNsdXNpdmVCb3VuZHM7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0luY2x1c2l2ZSA/ICF0aGlzLnRvdWNoSW5jbHVzaXZlRGlydHkgOiAhdGhpcy50b3VjaEV4Y2x1c2l2ZURpcnR5ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJ1bmluZ0JvdW5kcyA9IHRoaXMubm9kZS5ib3VuZHM7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5ub2RlLl9ib3VuZHNEaXJ0eSApO1xuICAgIH1cblxuICAgIC8vIEJhaWwgcXVpY2tseSBpZiBvdXIgcG9pbnQgaXMgbm90IGluc2lkZSB0aGUgYm91bmRzIGZvciB0aGUgc3VidHJlZS5cbiAgICBpZiAoICFwcnVuaW5nQm91bmRzLmNvbnRhaW5zUG9pbnQoIHBvaW50ICkgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZH0gcHJ1bmVkOiAke3VzZU1vdXNlID8gJ21vdXNlJyA6ICggdXNlVG91Y2ggPyAndG91Y2gnIDogJ3JlZ3VsYXInICl9YCApO1xuICAgICAgcmV0dXJuIG51bGw7IC8vIG5vdCBpbiBvdXIgYm91bmRzLCBzbyB0aGlzIHBvaW50IGNhbid0IHBvc3NpYmx5IGJlIGNvbnRhaW5lZFxuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgcG9pbnQgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUsIHNvIHdlIGNhbiB0ZXN0IGl0IHdpdGggdGhlIGNsaXBBcmVhL2NoaWxkcmVuXG4gICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMubm9kZS5fdHJhbnNmb3JtLmdldEludmVyc2UoKS5tdWx0aXBseVZlY3RvcjIoIHRoaXMuc2NyYXRjaFZlY3Rvci5zZXQoIHBvaW50ICkgKTtcblxuICAgIC8vIElmIG91ciBwb2ludCBpcyBvdXRzaWRlIG9mIHRoZSBsb2NhbC1jb29yZGluYXRlIGNsaXBwaW5nIGFyZWEsIHRoZXJlIHNob3VsZCBiZSBubyBoaXQuXG4gICAgY29uc3QgY2xpcEFyZWEgPSB0aGlzLm5vZGUuY2xpcEFyZWE7XG4gICAgaWYgKCBjbGlwQXJlYSAhPT0gbnVsbCAmJiAhY2xpcEFyZWEuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5oaXRUZXN0KCBgJHt0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZX0jJHt0aGlzLm5vZGUuaWR9IG91dCBvZiBjbGlwIGFyZWFgICk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZH1gICk7XG5cbiAgICAvLyBDaGVjayBjaGlsZHJlbiBiZWZvcmUgb3VyIFwic2VsZlwiLCBzaW5jZSB0aGUgY2hpbGRyZW4gYXJlIHJlbmRlcmVkIG9uIHRvcC5cbiAgICAvLyBNYW51YWwgaXRlcmF0aW9uIGhlcmUgc28gd2UgY2FuIHJldHVybiBkaXJlY3RseSwgYW5kIHNvIHdlIGNhbiBpdGVyYXRlIGJhY2t3YXJkcyAobGFzdCBub2RlIGlzIGluIGZyb250KS5cbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMubm9kZS5fY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMubm9kZS5fY2hpbGRyZW5bIGkgXTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgICBjb25zdCBjaGlsZEhpdCA9IGNoaWxkLl9waWNrZXIucmVjdXJzaXZlSGl0VGVzdCggbG9jYWxQb2ludCwgdXNlTW91c2UsIHVzZVRvdWNoLCBpc0luY2x1c2l2ZSApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgICAgLy8gSWYgdGhlcmUgd2FzIGEgaGl0LCBpbW1lZGlhdGVseSBhZGQgb3VyIG5vZGUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBUcmFpbCAod2lsbCByZWN1cnNpdmVseSBidWlsZCB0aGUgVHJhaWwpLlxuICAgICAgaWYgKCBjaGlsZEhpdCApIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkSGl0LmFkZEFuY2VzdG9yKCB0aGlzLm5vZGUsIGkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUZXN0cyBmb3IgbW91c2UgYW5kIHRvdWNoIGhpdCBhcmVhcyBiZWZvcmUgdGVzdGluZyBjb250YWluc1BvaW50U2VsZlxuICAgIGlmICggdXNlTW91c2UgJiYgdGhpcy5ub2RlLl9tb3VzZUFyZWEgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuaGl0VGVzdCAmJiBzY2VuZXJ5TG9nLmhpdFRlc3QoIGAke3RoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfSMke3RoaXMubm9kZS5pZH0gbW91c2UgYXJlYSBoaXRgICk7XG4gICAgICAvLyBOT1RFOiBib3RoIEJvdW5kczIgYW5kIFNoYXBlIGhhdmUgY29udGFpbnNQb2ludCEgV2UgdXNlIGJvdGggaGVyZSFcbiAgICAgIHJldHVybiB0aGlzLm5vZGUuX21vdXNlQXJlYS5jb250YWluc1BvaW50KCBsb2NhbFBvaW50ICkgPyBuZXcgVHJhaWwoIHRoaXMubm9kZSApIDogbnVsbDtcbiAgICB9XG4gICAgaWYgKCB1c2VUb3VjaCAmJiB0aGlzLm5vZGUuX3RvdWNoQXJlYSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSB0b3VjaCBhcmVhIGhpdGAgKTtcbiAgICAgIC8vIE5PVEU6IGJvdGggQm91bmRzMiBhbmQgU2hhcGUgaGF2ZSBjb250YWluc1BvaW50ISBXZSB1c2UgYm90aCBoZXJlIVxuICAgICAgcmV0dXJuIHRoaXMubm9kZS5fdG91Y2hBcmVhLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSA/IG5ldyBUcmFpbCggdGhpcy5ub2RlICkgOiBudWxsO1xuICAgIH1cblxuICAgIC8vIERpZG4ndCBoaXQgb3VyIGNoaWxkcmVuLCBzbyBjaGVjayBvdXJzZWxmIGFzIGEgbGFzdCByZXNvcnQuIENoZWNrIG91ciBzZWxmQm91bmRzIGZpcnN0LCBzbyB3ZSBjYW4gcG90ZW50aWFsbHlcbiAgICAvLyBhdm9pZCBoaXQtdGVzdGluZyB0aGUgYWN0dWFsIG9iamVjdCAod2hpY2ggbWF5IGJlIG1vcmUgZXhwZW5zaXZlKS5cbiAgICBpZiAoIHRoaXMubm9kZS5zZWxmQm91bmRzLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcbiAgICAgIGlmICggdGhpcy5ub2RlLmNvbnRhaW5zUG9pbnRTZWxmKCBsb2NhbFBvaW50ICkgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5oaXRUZXN0ICYmIHNjZW5lcnlMb2cuaGl0VGVzdCggYCR7dGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5ub2RlLmlkfSBzZWxmIGhpdGAgKTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFpbCggdGhpcy5ub2RlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm8gaGl0XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgc2V0cyBkaXJ0eSBmbGFncyB0byB0cnVlLiBJZiB0aGUgYW5kRXhjbHVzaXZlIHBhcmFtZXRlciBpcyBmYWxzZSwgb25seSB0aGUgXCJpbmNsdXNpdmVcIiBmbGFnc1xuICAgKiBhcmUgc2V0IHRvIGRpcnR5LlxuICAgKlxuICAgKiBAcGFyYW0gYW5kRXhjbHVzaXZlXG4gICAqIEBwYXJhbSBbaWdub3JlU2VsZkRpcnR5XSAtIElmIHRydWUsIHdpbGwgaW52YWxpZGF0ZSBwYXJlbnRzIGV2ZW4gaWYgd2Ugd2VyZSBkaXJ0eS5cbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZSggYW5kRXhjbHVzaXZlOiBib29sZWFuLCBpZ25vcmVTZWxmRGlydHk/OiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgLy8gVHJhY2sgd2hldGhlciBhICdkaXJ0eScgZmxhZyB3YXMgY2hhbmdlZCBmcm9tIGZhbHNlPT50cnVlIChvciBpZiBpZ25vcmVTZWxmRGlydHkgaXMgcGFzc2VkKS5cbiAgICBsZXQgd2FzTm90RGlydHkgPSAhIWlnbm9yZVNlbGZEaXJ0eSB8fCAhdGhpcy5tb3VzZUluY2x1c2l2ZURpcnR5IHx8ICF0aGlzLnRvdWNoSW5jbHVzaXZlRGlydHk7XG5cbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgPSB0cnVlO1xuICAgIHRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eSA9IHRydWU7XG4gICAgaWYgKCBhbmRFeGNsdXNpdmUgKSB7XG4gICAgICB3YXNOb3REaXJ0eSA9IHdhc05vdERpcnR5IHx8ICF0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgfHwgIXRoaXMudG91Y2hFeGNsdXNpdmVEaXJ0eTtcbiAgICAgIHRoaXMubW91c2VFeGNsdXNpdmVEaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLnRvdWNoRXhjbHVzaXZlRGlydHkgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGFyZSBzZWxmUHJ1bmVkIChvciBpZiB3ZSB3ZXJlIGFscmVhZHkgZnVsbHkgZGlydHkpLCB0aGVyZSBzaG91bGQgYmUgbm8gcmVhc29uIHRvIGNhbGwgdGhpcyBvbiBvdXJcbiAgICAvLyBwYXJlbnRzLiBJZiB3ZSBhcmUgc2VsZlBydW5lZCwgd2UgYXJlIGd1YXJhbnRlZWQgdG8gbm90IGJlIHZpc2l0ZWQgaW4gYSBzZWFyY2ggYnkgb3VyIHBhcmVudHMsIHNvIGNoYW5nZXNcbiAgICAvLyB0aGF0IG1ha2UgdGhpcyBwaWNrZXIgZGlydHkgc2hvdWxkIE5PVCBhZmZlY3Qgb3VyIHBhcmVudHMnIHBpY2tlcnMgdmFsdWVzLlxuICAgIGlmICggIXRoaXMuc2VsZlBydW5lZCAmJiB3YXNOb3REaXJ0eSApIHtcbiAgICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLm5vZGUuX3BhcmVudHM7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBwYXJlbnRzWyBpIF0uX3BpY2tlci5pbnZhbGlkYXRlKCBhbmRFeGNsdXNpdmUgfHwgdGhpcy5zZWxmSW5jbHVzaXZlLCBmYWxzZSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgbW91c2VJbmNsdXNpdmVCb3VuZHMgZm9yIHRoaXMgcGlja2VyIChpZiBkaXJ0eSksIGFuZCByZWN1cnNpdmVseSB2YWxpZGF0ZXMgaXQgZm9yIGFsbCBub24tcHJ1bmVkXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiBOT1RFOiBGb3IgdGhlIGZ1dHVyZSwgY29uc2lkZXIgc2hhcmluZyBtb3JlIGNvZGUgd2l0aCByZWxhdGVkIGZ1bmN0aW9ucy4gSSB0cmllZCB0aGlzLCBhbmQgaXQgbWFkZSB0aGluZ3MgbG9va1xuICAgKiBtb3JlIGNvbXBsaWNhdGVkIChhbmQgcHJvYmFibHkgc2xvd2VyKSwgc28gSSd2ZSBrZXB0IHNvbWUgZHVwbGljYXRpb24uIElmIGEgY2hhbmdlIGlzIG1hZGUgdG8gdGhpcyBmdW5jdGlvbixcbiAgICogcGxlYXNlIGNoZWNrIHRoZSBvdGhlciB2YWxpZGF0ZSogbWV0aG9kcyB0byBzZWUgaWYgdGhleSBhbHNvIG5lZWQgYSBjaGFuZ2UuXG4gICAqL1xuICBwcml2YXRlIHZhbGlkYXRlTW91c2VJbmNsdXNpdmUoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5tb3VzZUluY2x1c2l2ZURpcnR5ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMubW91c2VJbmNsdXNpdmVCb3VuZHMuc2V0KCB0aGlzLm5vZGUuc2VsZkJvdW5kcyApO1xuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGUuX2NoaWxkcmVuO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGRQaWNrZXIgPSBjaGlsZHJlblsgaSBdLl9waWNrZXI7XG5cbiAgICAgIC8vIFNpbmNlIHdlIGFyZSBcImluY2x1c2l2ZVwiLCB3ZSBkb24ndCBjYXJlIGFib3V0IHN1YnRyZWVQcnVuYWJsZSAod2Ugd29uJ3QgcHJ1bmUgZm9yIHRoYXQpLiBPbmx5IGNoZWNrXG4gICAgICAvLyBpZiBwcnVuaW5nIGlzIGZvcmNlIChzZWxmUHJ1bmVkKS5cbiAgICAgIGlmICggIWNoaWxkUGlja2VyLnNlbGZQcnVuZWQgKSB7XG4gICAgICAgIGNoaWxkUGlja2VyLnZhbGlkYXRlTW91c2VJbmNsdXNpdmUoKTtcbiAgICAgICAgdGhpcy5tb3VzZUluY2x1c2l2ZUJvdW5kcy5pbmNsdWRlQm91bmRzKCBjaGlsZFBpY2tlci5tb3VzZUluY2x1c2l2ZUJvdW5kcyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluY2x1ZGUgbW91c2VBcmVhIChpZiBhcHBsaWNhYmxlKSwgZXhjbHVkZSBvdXRzaWRlIGNsaXBBcmVhIChpZiBhcHBsaWNhYmxlKSwgYW5kIHRyYW5zZm9ybSB0byB0aGUgcGFyZW50XG4gICAgLy8gY29vcmRpbmF0ZSBmcmFtZS5cbiAgICB0aGlzLmFwcGx5QXJlYXNBbmRUcmFuc2Zvcm0oIHRoaXMubW91c2VJbmNsdXNpdmVCb3VuZHMsIHRoaXMubm9kZS5fbW91c2VBcmVhICk7XG5cbiAgICB0aGlzLm1vdXNlSW5jbHVzaXZlRGlydHkgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgbW91c2VFeGNsdXNpdmVCb3VuZHMgZm9yIHRoaXMgcGlja2VyIChpZiBkaXJ0eSksIGFuZCByZWN1cnNpdmVseSB2YWxpZGF0ZXMgdGhlIG1vdXNlLXJlbGF0ZWQgYm91bmRzXG4gICAqIGZvciBhbGwgbm9uLXBydW5lZCBjaGlsZHJlbi5cbiAgICpcbiAgICogTm90YWJseSwgaWYgYSBwaWNrZXIgaXMgc2VsZkluY2x1c2l2ZSwgd2Ugd2lsbCBzd2l0Y2ggdG8gdmFsaWRhdGluZyBtb3VzZUluY2x1c2l2ZUJvdW5kcyBmb3IgaXRzIHN1YnRyZWUsIGFzIHRoaXNcbiAgICogaXMgd2hhdCB0aGUgaGl0LXRlc3Rpbmcgd2lsbCB1c2UuXG4gICAqXG4gICAqIE5PVEU6IEZvciB0aGUgZnV0dXJlLCBjb25zaWRlciBzaGFyaW5nIG1vcmUgY29kZSB3aXRoIHJlbGF0ZWQgZnVuY3Rpb25zLiBJIHRyaWVkIHRoaXMsIGFuZCBpdCBtYWRlIHRoaW5ncyBsb29rXG4gICAqIG1vcmUgY29tcGxpY2F0ZWQgKGFuZCBwcm9iYWJseSBzbG93ZXIpLCBzbyBJJ3ZlIGtlcHQgc29tZSBkdXBsaWNhdGlvbi4gSWYgYSBjaGFuZ2UgaXMgbWFkZSB0byB0aGlzIGZ1bmN0aW9uLFxuICAgKiBwbGVhc2UgY2hlY2sgdGhlIG90aGVyIHZhbGlkYXRlKiBtZXRob2RzIHRvIHNlZSBpZiB0aGV5IGFsc28gbmVlZCBhIGNoYW5nZS5cbiAgICovXG4gIHByaXZhdGUgdmFsaWRhdGVNb3VzZUV4Y2x1c2l2ZSgpOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLm1vdXNlRXhjbHVzaXZlRGlydHkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5tb3VzZUV4Y2x1c2l2ZUJvdW5kcy5zZXQoIHRoaXMubm9kZS5zZWxmQm91bmRzICk7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMubm9kZS5fY2hpbGRyZW47XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZFBpY2tlciA9IGNoaWxkcmVuWyBpIF0uX3BpY2tlcjtcblxuICAgICAgLy8gU2luY2Ugd2UgYXJlIG5vdCBcImluY2x1c2l2ZVwiLCB3ZSB3aWxsIHBydW5lIHRoZSBzZWFyY2ggaWYgc3VidHJlZVBydW5hYmxlIGlzIHRydWUuXG4gICAgICBpZiAoICFjaGlsZFBpY2tlci5zdWJ0cmVlUHJ1bmFibGUgKSB7XG4gICAgICAgIC8vIElmIG91ciBjaGlsZCBpcyBzZWxmSW5jbHVzaXZlLCB3ZSBuZWVkIHRvIHN3aXRjaCB0byB0aGUgXCJpbmNsdXNpdmVcIiB2YWxpZGF0aW9uLlxuICAgICAgICBpZiAoIGNoaWxkUGlja2VyLnNlbGZJbmNsdXNpdmUgKSB7XG4gICAgICAgICAgY2hpbGRQaWNrZXIudmFsaWRhdGVNb3VzZUluY2x1c2l2ZSgpO1xuICAgICAgICAgIHRoaXMubW91c2VFeGNsdXNpdmVCb3VuZHMuaW5jbHVkZUJvdW5kcyggY2hpbGRQaWNrZXIubW91c2VJbmNsdXNpdmVCb3VuZHMgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIGtlZXAgd2l0aCB0aGUgZXhjbHVzaXZlIHZhbGlkYXRpb24uXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNoaWxkUGlja2VyLnZhbGlkYXRlTW91c2VFeGNsdXNpdmUoKTtcbiAgICAgICAgICB0aGlzLm1vdXNlRXhjbHVzaXZlQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkUGlja2VyLm1vdXNlRXhjbHVzaXZlQm91bmRzICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmNsdWRlIG1vdXNlQXJlYSAoaWYgYXBwbGljYWJsZSksIGV4Y2x1ZGUgb3V0c2lkZSBjbGlwQXJlYSAoaWYgYXBwbGljYWJsZSksIGFuZCB0cmFuc2Zvcm0gdG8gdGhlIHBhcmVudFxuICAgIC8vIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAgdGhpcy5hcHBseUFyZWFzQW5kVHJhbnNmb3JtKCB0aGlzLm1vdXNlRXhjbHVzaXZlQm91bmRzLCB0aGlzLm5vZGUuX21vdXNlQXJlYSApO1xuXG4gICAgdGhpcy5tb3VzZUV4Y2x1c2l2ZURpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIHRvdWNoSW5jbHVzaXZlQm91bmRzIGZvciB0aGlzIHBpY2tlciAoaWYgZGlydHkpLCBhbmQgcmVjdXJzaXZlbHkgdmFsaWRhdGVzIGl0IGZvciBhbGwgbm9uLXBydW5lZFxuICAgKiBjaGlsZHJlbi5cbiAgICpcbiAgICogTk9URTogRm9yIHRoZSBmdXR1cmUsIGNvbnNpZGVyIHNoYXJpbmcgbW9yZSBjb2RlIHdpdGggcmVsYXRlZCBmdW5jdGlvbnMuIEkgdHJpZWQgdGhpcywgYW5kIGl0IG1hZGUgdGhpbmdzIGxvb2tcbiAgICogbW9yZSBjb21wbGljYXRlZCAoYW5kIHByb2JhYmx5IHNsb3dlciksIHNvIEkndmUga2VwdCBzb21lIGR1cGxpY2F0aW9uLiBJZiBhIGNoYW5nZSBpcyBtYWRlIHRvIHRoaXMgZnVuY3Rpb24sXG4gICAqIHBsZWFzZSBjaGVjayB0aGUgb3RoZXIgdmFsaWRhdGUqIG1ldGhvZHMgdG8gc2VlIGlmIHRoZXkgYWxzbyBuZWVkIGEgY2hhbmdlLlxuICAgKi9cbiAgcHJpdmF0ZSB2YWxpZGF0ZVRvdWNoSW5jbHVzaXZlKCk6IHZvaWQge1xuICAgIGlmICggIXRoaXMudG91Y2hJbmNsdXNpdmVEaXJ0eSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnRvdWNoSW5jbHVzaXZlQm91bmRzLnNldCggdGhpcy5ub2RlLnNlbGZCb3VuZHMgKTtcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5ub2RlLl9jaGlsZHJlbjtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGNoaWxkUGlja2VyID0gY2hpbGRyZW5bIGkgXS5fcGlja2VyO1xuXG4gICAgICAvLyBTaW5jZSB3ZSBhcmUgXCJpbmNsdXNpdmVcIiwgd2UgZG9uJ3QgY2FyZSBhYm91dCBzdWJ0cmVlUHJ1bmFibGUgKHdlIHdvbid0IHBydW5lIGZvciB0aGF0KS4gT25seSBjaGVja1xuICAgICAgLy8gaWYgcHJ1bmluZyBpcyBmb3JjZSAoc2VsZlBydW5lZCkuXG4gICAgICBpZiAoICFjaGlsZFBpY2tlci5zZWxmUHJ1bmVkICkge1xuICAgICAgICBjaGlsZFBpY2tlci52YWxpZGF0ZVRvdWNoSW5jbHVzaXZlKCk7XG4gICAgICAgIHRoaXMudG91Y2hJbmNsdXNpdmVCb3VuZHMuaW5jbHVkZUJvdW5kcyggY2hpbGRQaWNrZXIudG91Y2hJbmNsdXNpdmVCb3VuZHMgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbmNsdWRlIHRvdWNoQXJlYSAoaWYgYXBwbGljYWJsZSksIGV4Y2x1ZGUgb3V0c2lkZSBjbGlwQXJlYSAoaWYgYXBwbGljYWJsZSksIGFuZCB0cmFuc2Zvcm0gdG8gdGhlIHBhcmVudFxuICAgIC8vIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAgdGhpcy5hcHBseUFyZWFzQW5kVHJhbnNmb3JtKCB0aGlzLnRvdWNoSW5jbHVzaXZlQm91bmRzLCB0aGlzLm5vZGUuX3RvdWNoQXJlYSApO1xuXG4gICAgdGhpcy50b3VjaEluY2x1c2l2ZURpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIHRvdWNoRXhjbHVzaXZlQm91bmRzIGZvciB0aGlzIHBpY2tlciAoaWYgZGlydHkpLCBhbmQgcmVjdXJzaXZlbHkgdmFsaWRhdGVzIHRoZSB0b3VjaC1yZWxhdGVkIGJvdW5kc1xuICAgKiBmb3IgYWxsIG5vbi1wcnVuZWQgY2hpbGRyZW4uXG4gICAqXG4gICAqIE5vdGFibHksIGlmIGEgcGlja2VyIGlzIHNlbGZJbmNsdXNpdmUsIHdlIHdpbGwgc3dpdGNoIHRvIHZhbGlkYXRpbmcgdG91Y2hJbmNsdXNpdmVCb3VuZHMgZm9yIGl0cyBzdWJ0cmVlLCBhcyB0aGlzXG4gICAqIGlzIHdoYXQgdGhlIGhpdC10ZXN0aW5nIHdpbGwgdXNlLlxuICAgKlxuICAgKiBOT1RFOiBGb3IgdGhlIGZ1dHVyZSwgY29uc2lkZXIgc2hhcmluZyBtb3JlIGNvZGUgd2l0aCByZWxhdGVkIGZ1bmN0aW9ucy4gSSB0cmllZCB0aGlzLCBhbmQgaXQgbWFkZSB0aGluZ3MgbG9va1xuICAgKiBtb3JlIGNvbXBsaWNhdGVkIChhbmQgcHJvYmFibHkgc2xvd2VyKSwgc28gSSd2ZSBrZXB0IHNvbWUgZHVwbGljYXRpb24uIElmIGEgY2hhbmdlIGlzIG1hZGUgdG8gdGhpcyBmdW5jdGlvbixcbiAgICogcGxlYXNlIGNoZWNrIHRoZSBvdGhlciB2YWxpZGF0ZSogbWV0aG9kcyB0byBzZWUgaWYgdGhleSBhbHNvIG5lZWQgYSBjaGFuZ2UuXG4gICAqL1xuICBwcml2YXRlIHZhbGlkYXRlVG91Y2hFeGNsdXNpdmUoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy50b3VjaEV4Y2x1c2l2ZURpcnR5ICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudG91Y2hFeGNsdXNpdmVCb3VuZHMuc2V0KCB0aGlzLm5vZGUuc2VsZkJvdW5kcyApO1xuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLm5vZGUuX2NoaWxkcmVuO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGRQaWNrZXIgPSBjaGlsZHJlblsgaSBdLl9waWNrZXI7XG5cbiAgICAgIC8vIFNpbmNlIHdlIGFyZSBub3QgXCJpbmNsdXNpdmVcIiwgd2Ugd2lsbCBwcnVuZSB0aGUgc2VhcmNoIGlmIHN1YnRyZWVQcnVuYWJsZSBpcyB0cnVlLlxuICAgICAgaWYgKCAhY2hpbGRQaWNrZXIuc3VidHJlZVBydW5hYmxlICkge1xuICAgICAgICAvLyBJZiBvdXIgY2hpbGQgaXMgc2VsZkluY2x1c2l2ZSwgd2UgbmVlZCB0byBzd2l0Y2ggdG8gdGhlIFwiaW5jbHVzaXZlXCIgdmFsaWRhdGlvbi5cbiAgICAgICAgaWYgKCBjaGlsZFBpY2tlci5zZWxmSW5jbHVzaXZlICkge1xuICAgICAgICAgIGNoaWxkUGlja2VyLnZhbGlkYXRlVG91Y2hJbmNsdXNpdmUoKTtcbiAgICAgICAgICB0aGlzLnRvdWNoRXhjbHVzaXZlQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkUGlja2VyLnRvdWNoSW5jbHVzaXZlQm91bmRzICk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBrZWVwIHdpdGggdGhlIGV4Y2x1c2l2ZSB2YWxpZGF0aW9uLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjaGlsZFBpY2tlci52YWxpZGF0ZVRvdWNoRXhjbHVzaXZlKCk7XG4gICAgICAgICAgdGhpcy50b3VjaEV4Y2x1c2l2ZUJvdW5kcy5pbmNsdWRlQm91bmRzKCBjaGlsZFBpY2tlci50b3VjaEV4Y2x1c2l2ZUJvdW5kcyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW5jbHVkZSB0b3VjaEFyZWEgKGlmIGFwcGxpY2FibGUpLCBleGNsdWRlIG91dHNpZGUgY2xpcEFyZWEgKGlmIGFwcGxpY2FibGUpLCBhbmQgdHJhbnNmb3JtIHRvIHRoZSBwYXJlbnRcbiAgICAvLyBjb29yZGluYXRlIGZyYW1lLlxuICAgIHRoaXMuYXBwbHlBcmVhc0FuZFRyYW5zZm9ybSggdGhpcy50b3VjaEV4Y2x1c2l2ZUJvdW5kcywgdGhpcy5ub2RlLl90b3VjaEFyZWEgKTtcblxuICAgIHRoaXMudG91Y2hFeGNsdXNpdmVEaXJ0eSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY2x1ZGUgcG9pbnRlciBhcmVhcyAoaWYgYXBwbGljYWJsZSksIGV4Y2x1ZGUgYm91bmRzIG91dHNpZGUgdGhlIGNsaXAgYXJlYSAoaWYgYXBwbGljYWJsZSksIGFuZCB0cmFuc2Zvcm1cbiAgICogaW50byB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIE11dGF0ZXMgdGhlIGJvdW5kcyBwcm92aWRlZC5cbiAgICpcbiAgICogTWVhbnQgdG8gYmUgY2FsbGVkIGJ5IHRoZSB2YWxpZGF0aW9uIG1ldGhvZHMsIGFzIHRoaXMgcGFydCBpcyB0aGUgc2FtZSBmb3IgZXZlcnkgdmFsaWRhdGlvbiB0aGF0IGlzIGRvbmUuXG4gICAqXG4gICAqIEBwYXJhbSBtdXRhYmxlQm91bmRzIC0gVGhlIGJvdW5kcyB0byBiZSBtdXRhdGVkIChlLmcuIG1vdXNlRXhjbHVzaXZlQm91bmRzKS5cbiAgICogQHBhcmFtIHBvaW50ZXJBcmVhIC0gQSBtb3VzZUFyZWEvdG91Y2hBcmVhIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGluIHRoZSBzZWFyY2guXG4gICAqL1xuICBwcml2YXRlIGFwcGx5QXJlYXNBbmRUcmFuc2Zvcm0oIG11dGFibGVCb3VuZHM6IEJvdW5kczIsIHBvaW50ZXJBcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICk6IHZvaWQge1xuICAgIC8vIGRvIHRoaXMgYmVmb3JlIHRoZSB0cmFuc2Zvcm1hdGlvbiB0byB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgKHRoZSBtb3VzZUFyZWEgaXMgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpXG4gICAgaWYgKCBwb2ludGVyQXJlYSApIHtcbiAgICAgIC8vIHdlIGFjY2VwdCBlaXRoZXIgQm91bmRzMiwgb3IgYSBTaGFwZSAoaW4gd2hpY2ggY2FzZSwgd2UgdGFrZSB0aGUgU2hhcGUncyBib3VuZHMpXG4gICAgICBtdXRhYmxlQm91bmRzLmluY2x1ZGVCb3VuZHMoIHBvaW50ZXJBcmVhIGluc3RhbmNlb2YgQm91bmRzMiA/ICggcG9pbnRlckFyZWEgKSA6ICggcG9pbnRlckFyZWEgYXMgdW5rbm93biBhcyBTaGFwZSApLmJvdW5kcyApO1xuICAgIH1cblxuICAgIGNvbnN0IGNsaXBBcmVhID0gdGhpcy5ub2RlLmNsaXBBcmVhO1xuICAgIGlmICggY2xpcEFyZWEgKSB7XG4gICAgICBjb25zdCBjbGlwQm91bmRzID0gY2xpcEFyZWEuYm91bmRzO1xuICAgICAgLy8gZXhjbHVkZSBhcmVhcyBvdXRzaWRlIG9mIHRoZSBjbGlwcGluZyBhcmVhJ3MgYm91bmRzIChmb3IgZWZmaWNpZW5jeSlcbiAgICAgIC8vIFVzZXMgQm91bmRzMi5jb25zdHJhaW5Cb3VuZHMsIGJ1dCBpbmxpbmVkIHRvIHByZXZlbnQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb2plY3RpbGUtbW90aW9uL2lzc3Vlcy8xNTVcbiAgICAgIG11dGFibGVCb3VuZHMubWluWCA9IE1hdGgubWF4KCBtdXRhYmxlQm91bmRzLm1pblgsIGNsaXBCb3VuZHMubWluWCApO1xuICAgICAgbXV0YWJsZUJvdW5kcy5taW5ZID0gTWF0aC5tYXgoIG11dGFibGVCb3VuZHMubWluWSwgY2xpcEJvdW5kcy5taW5ZICk7XG4gICAgICBtdXRhYmxlQm91bmRzLm1heFggPSBNYXRoLm1pbiggbXV0YWJsZUJvdW5kcy5tYXhYLCBjbGlwQm91bmRzLm1heFggKTtcbiAgICAgIG11dGFibGVCb3VuZHMubWF4WSA9IE1hdGgubWluKCBtdXRhYmxlQm91bmRzLm1heFksIGNsaXBCb3VuZHMubWF4WSApO1xuICAgIH1cblxuICAgIC8vIHRyYW5zZm9ybSBpdCB0byB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWVcbiAgICB0aGlzLm5vZGUudHJhbnNmb3JtQm91bmRzRnJvbUxvY2FsVG9QYXJlbnQoIG11dGFibGVCb3VuZHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSBOb2RlIHdoZW4gYSBjaGlsZCBpcyBpbnNlcnRlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFRoZSBjaGlsZCBtYXkgbm90IGJlIGZ1bGx5IGFkZGVkIHdoZW4gdGhpcyBpcyBjYWxsZWQuIERvbid0IGF1ZGl0LCBvciBhc3N1bWUgdGhhdCBjYWxscyB0byB0aGUgTm9kZSB3b3VsZFxuICAgKiBpbmRpY2F0ZSB0aGUgcGFyZW50LWNoaWxkIHJlbGF0aW9uc2hpcC5cbiAgICpcbiAgICogQHBhcmFtIGNoaWxkTm9kZSAtIE91ciBwaWNrZXIgbm9kZSdzIG5ldyBjaGlsZCBub2RlLlxuICAgKi9cbiAgcHVibGljIG9uSW5zZXJ0Q2hpbGQoIGNoaWxkTm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgY2hpbGQgaXMgc2VsZlBydW5lZCwgd2UgZG9uJ3QgaGF2ZSB0byB1cGRhdGUgYW55IG1ldGFkYXRhLlxuICAgIGlmICggIWNoaWxkTm9kZS5fcGlja2VyLnNlbGZQcnVuZWQgKSB7XG4gICAgICBjb25zdCBoYXNQaWNrYWJsZSA9IGNoaWxkTm9kZS5fcGlja2VyLnN1YnRyZWVQaWNrYWJsZUNvdW50ID4gMDtcblxuICAgICAgLy8gSWYgaXQgaGFzIGEgbm9uLXplcm8gc3VidHJlZVBpY2thYmxlQ291bnQsIHdlJ2xsIG5lZWQgdG8gaW5jcmVtZW50IG91ciBvd24gY291bnQgYnkgMS5cbiAgICAgIGlmICggaGFzUGlja2FibGUgKSB7XG4gICAgICAgIHRoaXMuY2hhbmdlUGlja2FibGVDb3VudCggMSApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBpdCBoYXMgYSBzdWJ0cmVlUGlja2FibGVDb3VudCBvZiB6ZXJvLCBpdCB3b3VsZCBiZSBwcnVuZWQgYnkgXCJleGNsdXNpdmVcIiBzZWFyY2hlcywgc28gd2Ugb25seSBuZWVkIHRvXG4gICAgICAvLyBpbnZhbGlkYXRlIHRoZSBcImluY2x1c2l2ZVwiIGJvdW5kcy5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZSggaGFzUGlja2FibGUsIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gTm9kZSB3aGVuIGEgY2hpbGQgaXMgcmVtb3ZlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFRoZSBjaGlsZCBtYXkgbm90IGJlIGZ1bGx5IHJlbW92ZWQgd2hlbiB0aGlzIGlzIGNhbGxlZC4gRG9uJ3QgYXVkaXQsIG9yIGFzc3VtZSB0aGF0IGNhbGxzIHRvIHRoZSBOb2RlIHdvdWxkXG4gICAqIGluZGljYXRlIHRoZSBwYXJlbnQtY2hpbGQgcmVsYXRpb25zaGlwLlxuICAgKlxuICAgKiBAcGFyYW0gY2hpbGROb2RlIC0gT3VyIHBpY2tlciBub2RlJ3MgY2hpbGQgdGhhdCB3aWxsIGJlIHJlbW92ZWQuXG4gICAqL1xuICBwdWJsaWMgb25SZW1vdmVDaGlsZCggY2hpbGROb2RlOiBOb2RlICk6IHZvaWQge1xuICAgIC8vIElmIHRoZSBjaGlsZCBpcyBzZWxmUHJ1bmVkLCB3ZSBkb24ndCBoYXZlIHRvIHVwZGF0ZSBhbnkgbWV0YWRhdGEuXG4gICAgaWYgKCAhY2hpbGROb2RlLl9waWNrZXIuc2VsZlBydW5lZCApIHtcbiAgICAgIGNvbnN0IGhhc1BpY2thYmxlID0gY2hpbGROb2RlLl9waWNrZXIuc3VidHJlZVBpY2thYmxlQ291bnQgPiAwO1xuXG4gICAgICAvLyBJZiBpdCBoYXMgYSBub24temVybyBzdWJ0cmVlUGlja2FibGVDb3VudCwgd2UnbGwgbmVlZCB0byBkZWNyZW1lbnQgb3VyIG93biBjb3VudCBieSAxLlxuICAgICAgaWYgKCBoYXNQaWNrYWJsZSApIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VQaWNrYWJsZUNvdW50KCAtMSApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBpdCBoYXMgYSBzdWJ0cmVlUGlja2FibGVDb3VudCBvZiB6ZXJvLCBpdCB3b3VsZCBiZSBwcnVuZWQgYnkgXCJleGNsdXNpdmVcIiBzZWFyY2hlcywgc28gd2Ugb25seSBuZWVkIHRvXG4gICAgICAvLyBpbnZhbGlkYXRlIHRoZSBcImluY2x1c2l2ZVwiIGJvdW5kcy5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZSggaGFzUGlja2FibGUsIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gTm9kZSB3aGVuIGFuIGlucHV0IGxpc3RlbmVyIGlzIGFkZGVkIHRvIG91ciBub2RlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvbkFkZElucHV0TGlzdGVuZXIoKTogdm9pZCB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHRoYXQgZGVwZW5kIG9uIGxpc3RlbmVyIGNvdW50XG4gICAgdGhpcy5jaGVja1NlbGZJbmNsdXNpdmUoKTtcbiAgICB0aGlzLmNoZWNrU3VidHJlZVBydW5hYmxlKCk7XG5cbiAgICAvLyBVcGRhdGUgb3VyIHBpY2thYmxlIGNvdW50LCBzaW5jZSBpdCBpbmNsdWRlcyBhIGNvdW50IG9mIGhvdyBtYW55IGlucHV0IGxpc3RlbmVycyB3ZSBoYXZlLlxuICAgIHRoaXMuY2hhbmdlUGlja2FibGVDb3VudCggMSApOyAvLyBOT1RFOiB0aGlzIHNob3VsZCBhbHNvIHRyaWdnZXIgaW52YWxpZGF0aW9uIG9mIG1vdXNlL3RvdWNoIGJvdW5kc1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLmF1ZGl0KCk7IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSBOb2RlIHdoZW4gYW4gaW5wdXQgbGlzdGVuZXIgaXMgcmVtb3ZlZCBmcm9tIG91ciBub2RlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblJlbW92ZUlucHV0TGlzdGVuZXIoKTogdm9pZCB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHRoYXQgZGVwZW5kIG9uIGxpc3RlbmVyIGNvdW50XG4gICAgdGhpcy5jaGVja1NlbGZJbmNsdXNpdmUoKTtcbiAgICB0aGlzLmNoZWNrU3VidHJlZVBydW5hYmxlKCk7XG5cbiAgICAvLyBVcGRhdGUgb3VyIHBpY2thYmxlIGNvdW50LCBzaW5jZSBpdCBpbmNsdWRlcyBhIGNvdW50IG9mIGhvdyBtYW55IGlucHV0IGxpc3RlbmVycyB3ZSBoYXZlLlxuICAgIHRoaXMuY2hhbmdlUGlja2FibGVDb3VudCggLTEgKTsgLy8gTk9URTogdGhpcyBzaG91bGQgYWxzbyB0cmlnZ2VyIGludmFsaWRhdGlvbiBvZiBtb3VzZS90b3VjaCBib3VuZHNcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5hdWRpdCgpOyB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlICdwaWNrYWJsZScgdmFsdWUgb2Ygb3VyIE5vZGUgaXMgY2hhbmdlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgb25QaWNrYWJsZUNoYW5nZSggb2xkUGlja2FibGU6IGJvb2xlYW4gfCBudWxsLCBwaWNrYWJsZTogYm9vbGVhbiB8IG51bGwgKTogdm9pZCB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHRoYXQgZGVwZW5kIG9uIG91ciBwaWNrYWJsZSBzZXR0aW5nLlxuICAgIHRoaXMuY2hlY2tTZWxmUHJ1bmVkKCk7XG4gICAgdGhpcy5jaGVja1NlbGZJbmNsdXNpdmUoKTtcbiAgICB0aGlzLmNoZWNrU3VidHJlZVBydW5hYmxlKCk7XG5cbiAgICAvLyBDb21wdXRlIG91ciBwaWNrYWJsZSBjb3VudCBjaGFuZ2UgKHBpY2thYmxlOnRydWUgY291bnRzIGZvciAxKVxuICAgIGNvbnN0IGNoYW5nZSA9ICggb2xkUGlja2FibGUgPT09IHRydWUgPyAtMSA6IDAgKSArICggcGlja2FibGUgPT09IHRydWUgPyAxIDogMCApO1xuXG4gICAgaWYgKCBjaGFuZ2UgKSB7XG4gICAgICB0aGlzLmNoYW5nZVBpY2thYmxlQ291bnQoIGNoYW5nZSApO1xuICAgIH1cblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5hdWRpdCgpOyB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHZpc2liaWxpdHkgb2Ygb3VyIE5vZGUgaXMgY2hhbmdlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgb25WaXNpYmlsaXR5Q2hhbmdlKCk6IHZvaWQge1xuICAgIC8vIFVwZGF0ZSBmbGFncyB0aGF0IGRlcGVuZCBvbiBvdXIgdmlzaWJpbGl0eS5cbiAgICB0aGlzLmNoZWNrU2VsZlBydW5lZCgpO1xuICAgIHRoaXMuY2hlY2tTdWJ0cmVlUHJ1bmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbW91c2VBcmVhIG9mIHRoZSBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uTW91c2VBcmVhQ2hhbmdlKCk6IHZvaWQge1xuICAgIC8vIEJvdW5kcyBjYW4gZGVwZW5kIG9uIHRoZSBtb3VzZUFyZWEsIHNvIHdlJ2xsIGludmFsaWRhdGUgdGhvc2UuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYm91bmRzIGludmFsaWRhdGlvbiB0aGF0IG9ubHkgZG9lcyB0aGUgJ21vdXNlJyBmbGFncywgc2luY2Ugd2UgZG9uJ3QgbmVlZCB0byBpbnZhbGlkYXRlIHRvdWNoZXMuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG1vdXNlQXJlYSBvZiB0aGUgTm9kZSBpcyBjaGFuZ2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblRvdWNoQXJlYUNoYW5nZSgpOiB2b2lkIHtcbiAgICAvLyBCb3VuZHMgY2FuIGRlcGVuZCBvbiB0aGUgdG91Y2hBcmVhLCBzbyB3ZSdsbCBpbnZhbGlkYXRlIHRob3NlLlxuICAgIC8vIFRPRE86IENvbnNpZGVyIGJvdW5kcyBpbnZhbGlkYXRpb24gdGhhdCBvbmx5IGRvZXMgdGhlICd0b3VjaCcgZmxhZ3MsIHNpbmNlIHdlIGRvbid0IG5lZWQgdG8gaW52YWxpZGF0ZSBtaWNlLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuaW52YWxpZGF0ZSggdHJ1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIE5vZGUgaXMgY2hhbmdlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgb25UcmFuc2Zvcm1DaGFuZ2UoKTogdm9pZCB7XG4gICAgLy8gQ2FuIGFmZmVjdCBvdXIgYm91bmRzXG4gICAgdGhpcy5pbnZhbGlkYXRlKCB0cnVlICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHRyYW5zZm9ybSBvZiB0aGUgTm9kZSBpcyBjaGFuZ2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblNlbGZCb3VuZHNEaXJ0eSgpOiB2b2lkIHtcbiAgICAvLyBDYW4gYWZmZWN0IG91ciBib3VuZHNcbiAgICB0aGlzLmludmFsaWRhdGUoIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdHJhbnNmb3JtIG9mIHRoZSBOb2RlIGlzIGNoYW5nZWQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uQ2xpcEFyZWFDaGFuZ2UoKTogdm9pZCB7XG4gICAgLy8gQ2FuIGFmZmVjdCBvdXIgYm91bmRzLlxuICAgIHRoaXMuaW52YWxpZGF0ZSggdHJ1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSBpZiB3ZSBhcmUgJ3NlbGZQcnVuZWQnLCBhbmQgdXBkYXRlIHRoZSB2YWx1ZS4gSWYgaXQgY2hhbmdlZCwgd2UnbGwgbmVlZCB0byBub3RpZnkgb3VyIHBhcmVudHMuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgcHJ1bmFiaWxpdHkgXCJwaWNrYWJsZTpmYWxzZVwiIG9yIFwiaW52aXNpYmxlXCIgd29uJ3QgYWZmZWN0IG91ciBjb21wdXRlZCBib3VuZHMsIHNvIHdlIGRvbid0XG4gICAqIGludmFsaWRhdGUgb3Vyc2VsZi5cbiAgICovXG4gIHByaXZhdGUgY2hlY2tTZWxmUHJ1bmVkKCk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGZQcnVuZWQgPSB0aGlzLm5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9PT0gZmFsc2UgfHwgIXRoaXMubm9kZS5pc1Zpc2libGUoKTtcbiAgICBpZiAoIHRoaXMuc2VsZlBydW5lZCAhPT0gc2VsZlBydW5lZCApIHtcbiAgICAgIHRoaXMuc2VsZlBydW5lZCA9IHNlbGZQcnVuZWQ7XG5cbiAgICAgIC8vIE5vdGlmeSBwYXJlbnRzXG4gICAgICBjb25zdCBwYXJlbnRzID0gdGhpcy5ub2RlLl9wYXJlbnRzO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGFyZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgcGlja2VyID0gcGFyZW50c1sgaSBdLl9waWNrZXI7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBpbnB1dCBsaXN0ZW5lci9waWNrYWJsZTp0cnVlIGluIG91ciBzdWJ0cmVlLCB3ZSdsbCBuZWVkIHRvIGludmFsaWRhdGUgZXhjbHVzaXZlIGJvdW5kcyBhbHNvLFxuICAgICAgICAvLyBhbmQgd2UnbGwgd2FudCB0byB1cGRhdGUgdGhlIHBpY2thYmxlIGNvdW50IG9mIG91ciBwYXJlbnQuXG4gICAgICAgIGlmICggdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA+IDAgKSB7XG4gICAgICAgICAgcGlja2VyLmludmFsaWRhdGUoIHRydWUsIHRydWUgKTtcbiAgICAgICAgICBwaWNrZXIuY2hhbmdlUGlja2FibGVDb3VudCggdGhpcy5zZWxmUHJ1bmVkID8gLTEgOiAxICk7XG4gICAgICAgIH1cbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlIG5vdGhpbmcgaW4gb3VyIHN1YnRyZWUgdGhhdCB3b3VsZCBmb3JjZSBhIHZpc2l0LCB3ZSBvbmx5IG5lZWQgdG8gaW52YWxpZGF0ZSB0aGUgXCJpbmNsdXNpdmVcIlxuICAgICAgICAvLyBib3VuZHMuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHBpY2tlci5pbnZhbGlkYXRlKCBmYWxzZSwgdHJ1ZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHRvIHNlZSBpZiB3ZSBhcmUgJ3NlbGZJbmNsdXNpdmUnLCBhbmQgdXBkYXRlIHRoZSB2YWx1ZS4gSWYgaXQgY2hhbmdlZCwgd2UnbGwgbmVlZCB0byBpbnZhbGlkYXRlIG91cnNlbGYuXG4gICAqL1xuICBwcml2YXRlIGNoZWNrU2VsZkluY2x1c2l2ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxmSW5jbHVzaXZlID0gdGhpcy5ub2RlLnBpY2thYmxlUHJvcGVydHkudmFsdWUgPT09IHRydWUgfHwgdGhpcy5ub2RlLl9pbnB1dExpc3RlbmVycy5sZW5ndGggPiAwO1xuICAgIGlmICggdGhpcy5zZWxmSW5jbHVzaXZlICE9PSBzZWxmSW5jbHVzaXZlICkge1xuICAgICAgdGhpcy5zZWxmSW5jbHVzaXZlID0gc2VsZkluY2x1c2l2ZTtcblxuICAgICAgLy8gT3VyIGRpcnR5IGZsYWcgaGFuZGxpbmcgZm9yIGJvdGggaW5jbHVzaXZlIGFuZCBleGNsdXNpdmUgZGVwZW5kIG9uIHRoaXMgdmFsdWUuXG4gICAgICB0aGlzLmludmFsaWRhdGUoIHRydWUsIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIG91ciAnc3VidHJlZVBydW5hYmxlJyBmbGFnLlxuICAgKi9cbiAgcHJpdmF0ZSBjaGVja1N1YnRyZWVQcnVuYWJsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJ0cmVlUHJ1bmFibGUgPSB0aGlzLm5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy5ub2RlLmlzVmlzaWJsZSgpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLm5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSAhPT0gdHJ1ZSAmJiB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID09PSAwICk7XG5cbiAgICBpZiAoIHRoaXMuc3VidHJlZVBydW5hYmxlICE9PSBzdWJ0cmVlUHJ1bmFibGUgKSB7XG4gICAgICB0aGlzLnN1YnRyZWVQcnVuYWJsZSA9IHN1YnRyZWVQcnVuYWJsZTtcblxuICAgICAgLy8gT3VyIGRpcnR5IGZsYWcgaGFuZGxpbmcgZm9yIGJvdGggaW5jbHVzaXZlIGFuZCBleGNsdXNpdmUgZGVwZW5kIG9uIHRoaXMgdmFsdWUuXG4gICAgICB0aGlzLmludmFsaWRhdGUoIHRydWUsIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvcGFnYXRlIHRoZSBwaWNrYWJsZSBjb3VudCBjaGFuZ2UgZG93biB0byBvdXIgYW5jZXN0b3JzLlxuICAgKlxuICAgKiBAcGFyYW0gbiAtIFRoZSBkZWx0YSBvZiBob3cgbWFueSBwaWNrYWJsZSBjb3VudHMgaGF2ZSBiZWVuIGFkZGVkL3JlbW92ZWRcbiAgICovXG4gIHByaXZhdGUgY2hhbmdlUGlja2FibGVDb3VudCggbjogbnVtYmVyICk6IHZvaWQge1xuICAgIGlmICggbiA9PT0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTd2l0Y2hpbmcgYmV0d2VlbiAwIGFuZCAxIG1hdHRlcnMsIHNpbmNlIHdlIHRoZW4gbmVlZCB0byB1cGRhdGUgdGhlIGNvdW50cyBvZiBvdXIgcGFyZW50cy5cbiAgICBjb25zdCB3YXNaZXJvID0gdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gMDtcbiAgICB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ICs9IG47XG4gICAgY29uc3QgaXNaZXJvID0gdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA9PT0gMDtcblxuICAgIC8vIE91ciBzdWJ0cmVlUHJ1bmFibGUgdmFsdWUgZGVwZW5kcyBvbiBvdXIgcGlja2FibGUgY291bnQsIG1ha2Ugc3VyZSBpdCBnZXRzIHVwZGF0ZWQuXG4gICAgdGhpcy5jaGVja1N1YnRyZWVQcnVuYWJsZSgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zdWJ0cmVlUGlja2FibGVDb3VudCA+PSAwLCAnc3VidHJlZSBwaWNrYWJsZSBjb3VudCBzaG91bGQgYmUgZ3VhcmFudGVlZCB0byBiZSA+PSAwJyApO1xuXG4gICAgaWYgKCAhdGhpcy5zZWxmUHJ1bmVkICYmIHdhc1plcm8gIT09IGlzWmVybyApIHtcbiAgICAgIC8vIFVwZGF0ZSBvdXIgcGFyZW50cyBpZiBvdXIgY291bnQgY2hhbmdlZCAoQU5EIGlmIGl0IG1hdHRlcnMsIGkuZS4gd2UgYXJlbid0IHNlbGZQcnVuZWQpLlxuICAgICAgY29uc3QgbGVuID0gdGhpcy5ub2RlLl9wYXJlbnRzLmxlbmd0aDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgICB0aGlzLm5vZGUuX3BhcmVudHNbIGkgXS5fcGlja2VyLmNoYW5nZVBpY2thYmxlQ291bnQoIHdhc1plcm8gPyAxIDogLTEgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIG91ciBub2RlIGlzIHBvdGVudGlhbGx5IHBpY2thYmxlIGZyb20gaXRzIHBhcmVudHMgKGkuZS4gd2hldGhlciBpdCBjb3VsZCBiZSBoaXQtdGVzdGVkIGFuZCBzZW50XG4gICAqIGlucHV0IGV2ZW50cywgYW5kIHRodXMgd2hldGhlciBpdHMgaW5wdXQgbGlzdGVuZXJzIGFyZSByZWxldmFudCBhbmQgY291bGQgYmUgaW50ZXJydXB0ZWQpLlxuICAgKi9cbiAgcHVibGljIGlzUG90ZW50aWFsbHlQaWNrYWJsZSgpOiBib29sZWFuIHtcbiAgICAvLyBzdWJ0cmVlUHJ1bmFibGUgaXMgZXF1aXZhbGVudCB0bzpcbiAgICAvLyBub2RlLnBpY2thYmxlID09PSBmYWxzZSB8fCAhbm9kZS5pc1Zpc2libGUoKSB8fCAoIG5vZGUucGlja2FibGUgIT09IHRydWUgJiYgc3VidHJlZVBpY2thYmxlQ291bnQgPT09IDAgKVxuICAgIHJldHVybiAhdGhpcy5zdWJ0cmVlUHJ1bmFibGUgJiYgdGhpcy5ub2RlLmlucHV0RW5hYmxlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgbnVtYmVyIG9mIGNvbnNpc3RlbmN5IHRlc3RzIHdoZW4gYXNzZXJ0U2xvdyBpcyBlbmFibGVkLiBWZXJpZmllcyBtb3N0IGNvbmRpdGlvbnMsIGFuZCBoZWxwcyB0byBjYXRjaFxuICAgKiBidWdzIGVhcmxpZXIgd2hlbiB0aGV5IGFyZSBpbml0aWFsbHkgdHJpZ2dlcmVkLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBhdWRpdCgpOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLm5vZGUuX2NoaWxkcmVuLmZvckVhY2goIG5vZGUgPT4ge1xuICAgICAgICBub2RlLl9waWNrZXIuYXVkaXQoKTtcbiAgICAgIH0gKTtcblxuICAgICAgY29uc3QgbG9jYWxBc3NlcnRTbG93ID0gYXNzZXJ0U2xvdztcblxuICAgICAgY29uc3QgZXhwZWN0ZWRTZWxmUHJ1bmVkID0gdGhpcy5ub2RlLnBpY2thYmxlID09PSBmYWxzZSB8fCAhdGhpcy5ub2RlLmlzVmlzaWJsZSgpO1xuICAgICAgY29uc3QgZXhwZWN0ZWRTZWxmSW5jbHVzaXZlID0gdGhpcy5ub2RlLnBpY2thYmxlID09PSB0cnVlIHx8IHRoaXMubm9kZS5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoID4gMDtcbiAgICAgIGNvbnN0IGV4cGVjdGVkU3VidHJlZVBydW5hYmxlID0gdGhpcy5ub2RlLnBpY2thYmxlID09PSBmYWxzZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhdGhpcy5ub2RlLmlzVmlzaWJsZSgpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5ub2RlLnBpY2thYmxlICE9PSB0cnVlICYmIHRoaXMuc3VidHJlZVBpY2thYmxlQ291bnQgPT09IDAgKTtcbiAgICAgIGNvbnN0IGV4cGVjdGVkU3VidHJlZVBpY2thYmxlQ291bnQgPSB0aGlzLm5vZGUuX2lucHV0TGlzdGVuZXJzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLm5vZGUucGlja2FibGVQcm9wZXJ0eS52YWx1ZSA9PT0gdHJ1ZSA/IDEgOiAwICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uZmlsdGVyKCB0aGlzLm5vZGUuX2NoaWxkcmVuLCBjaGlsZCA9PiAhY2hpbGQuX3BpY2tlci5zZWxmUHJ1bmVkICYmIGNoaWxkLl9waWNrZXIuc3VidHJlZVBpY2thYmxlQ291bnQgPiAwICkubGVuZ3RoO1xuXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnNlbGZQcnVuZWQgPT09IGV4cGVjdGVkU2VsZlBydW5lZCwgJ3NlbGZQcnVuZWQgbWlzbWF0Y2gnICk7XG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnNlbGZJbmNsdXNpdmUgPT09IGV4cGVjdGVkU2VsZkluY2x1c2l2ZSwgJ3NlbGZJbmNsdXNpdmUgbWlzbWF0Y2gnICk7XG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnN1YnRyZWVQcnVuYWJsZSA9PT0gZXhwZWN0ZWRTdWJ0cmVlUHJ1bmFibGUsICdzdWJ0cmVlUHJ1bmFibGUgbWlzbWF0Y2gnICk7XG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnN1YnRyZWVQaWNrYWJsZUNvdW50ID09PSBleHBlY3RlZFN1YnRyZWVQaWNrYWJsZUNvdW50LCAnc3VidHJlZVBpY2thYmxlQ291bnQgbWlzbWF0Y2gnICk7XG5cbiAgICAgIHRoaXMubm9kZS5fcGFyZW50cy5mb3JFYWNoKCBwYXJlbnQgPT4ge1xuICAgICAgICBjb25zdCBwYXJlbnRQaWNrZXIgPSBwYXJlbnQuX3BpY2tlcjtcblxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgICAgY29uc3QgY2hpbGRQaWNrZXIgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuXG4gICAgICAgIGlmICggIXBhcmVudFBpY2tlci5tb3VzZUluY2x1c2l2ZURpcnR5ICkge1xuICAgICAgICAgIGxvY2FsQXNzZXJ0U2xvdyggY2hpbGRQaWNrZXIuc2VsZlBydW5lZCB8fCAhY2hpbGRQaWNrZXIubW91c2VJbmNsdXNpdmVEaXJ0eSApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCAhcGFyZW50UGlja2VyLm1vdXNlRXhjbHVzaXZlRGlydHkgKSB7XG4gICAgICAgICAgaWYgKCBjaGlsZFBpY2tlci5zZWxmSW5jbHVzaXZlICkge1xuICAgICAgICAgICAgbG9jYWxBc3NlcnRTbG93KCBjaGlsZFBpY2tlci5zZWxmUHJ1bmVkIHx8ICFjaGlsZFBpY2tlci5tb3VzZUluY2x1c2l2ZURpcnR5ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxBc3NlcnRTbG93KCBjaGlsZFBpY2tlci5zZWxmUHJ1bmVkIHx8IGNoaWxkUGlja2VyLnN1YnRyZWVQcnVuYWJsZSB8fCAhY2hpbGRQaWNrZXIubW91c2VFeGNsdXNpdmVEaXJ0eSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggIXBhcmVudFBpY2tlci50b3VjaEluY2x1c2l2ZURpcnR5ICkge1xuICAgICAgICAgIGxvY2FsQXNzZXJ0U2xvdyggY2hpbGRQaWNrZXIuc2VsZlBydW5lZCB8fCAhY2hpbGRQaWNrZXIudG91Y2hJbmNsdXNpdmVEaXJ0eSApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCAhcGFyZW50UGlja2VyLnRvdWNoRXhjbHVzaXZlRGlydHkgKSB7XG4gICAgICAgICAgaWYgKCBjaGlsZFBpY2tlci5zZWxmSW5jbHVzaXZlICkge1xuICAgICAgICAgICAgbG9jYWxBc3NlcnRTbG93KCBjaGlsZFBpY2tlci5zZWxmUHJ1bmVkIHx8ICFjaGlsZFBpY2tlci50b3VjaEluY2x1c2l2ZURpcnR5ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9jYWxBc3NlcnRTbG93KCBjaGlsZFBpY2tlci5zZWxmUHJ1bmVkIHx8IGNoaWxkUGlja2VyLnN1YnRyZWVQcnVuYWJsZSB8fCAhY2hpbGRQaWNrZXIudG91Y2hFeGNsdXNpdmVEaXJ0eSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUGlja2VyJywgUGlja2VyICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJWZWN0b3IyIiwic2NlbmVyeSIsIlRyYWlsIiwiUGlja2VyIiwiaGl0VGVzdCIsInBvaW50IiwidXNlTW91c2UiLCJ1c2VUb3VjaCIsImFzc2VydCIsInNjZW5lcnlMb2ciLCJub2RlIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiaWQiLCJpc0Jhc2VJbmNsdXNpdmUiLCJzZWxmSW5jbHVzaXZlIiwidmFsaWRhdGVNb3VzZUluY2x1c2l2ZSIsInZhbGlkYXRlTW91c2VFeGNsdXNpdmUiLCJ2YWxpZGF0ZVRvdWNoSW5jbHVzaXZlIiwidmFsaWRhdGVUb3VjaEV4Y2x1c2l2ZSIsInZhbGlkYXRlQm91bmRzIiwicmVjdXJzaXZlSGl0VGVzdCIsImlzSW5jbHVzaXZlIiwic2VsZlBydW5lZCIsInN1YnRyZWVQcnVuYWJsZSIsInBydW5pbmdCb3VuZHMiLCJtb3VzZUluY2x1c2l2ZUJvdW5kcyIsIm1vdXNlRXhjbHVzaXZlQm91bmRzIiwibW91c2VJbmNsdXNpdmVEaXJ0eSIsIm1vdXNlRXhjbHVzaXZlRGlydHkiLCJ0b3VjaEluY2x1c2l2ZUJvdW5kcyIsInRvdWNoRXhjbHVzaXZlQm91bmRzIiwidG91Y2hJbmNsdXNpdmVEaXJ0eSIsInRvdWNoRXhjbHVzaXZlRGlydHkiLCJib3VuZHMiLCJfYm91bmRzRGlydHkiLCJjb250YWluc1BvaW50IiwibG9jYWxQb2ludCIsIl90cmFuc2Zvcm0iLCJnZXRJbnZlcnNlIiwibXVsdGlwbHlWZWN0b3IyIiwic2NyYXRjaFZlY3RvciIsInNldCIsImNsaXBBcmVhIiwiaSIsIl9jaGlsZHJlbiIsImxlbmd0aCIsImNoaWxkIiwicHVzaCIsImNoaWxkSGl0IiwiX3BpY2tlciIsInBvcCIsImFkZEFuY2VzdG9yIiwiX21vdXNlQXJlYSIsIl90b3VjaEFyZWEiLCJzZWxmQm91bmRzIiwiY29udGFpbnNQb2ludFNlbGYiLCJpbnZhbGlkYXRlIiwiYW5kRXhjbHVzaXZlIiwiaWdub3JlU2VsZkRpcnR5Iiwid2FzTm90RGlydHkiLCJwYXJlbnRzIiwiX3BhcmVudHMiLCJjaGlsZHJlbiIsImNoaWxkUGlja2VyIiwiaW5jbHVkZUJvdW5kcyIsImFwcGx5QXJlYXNBbmRUcmFuc2Zvcm0iLCJtdXRhYmxlQm91bmRzIiwicG9pbnRlckFyZWEiLCJjbGlwQm91bmRzIiwibWluWCIsIk1hdGgiLCJtYXgiLCJtaW5ZIiwibWF4WCIsIm1pbiIsIm1heFkiLCJ0cmFuc2Zvcm1Cb3VuZHNGcm9tTG9jYWxUb1BhcmVudCIsIm9uSW5zZXJ0Q2hpbGQiLCJjaGlsZE5vZGUiLCJoYXNQaWNrYWJsZSIsInN1YnRyZWVQaWNrYWJsZUNvdW50IiwiY2hhbmdlUGlja2FibGVDb3VudCIsIm9uUmVtb3ZlQ2hpbGQiLCJvbkFkZElucHV0TGlzdGVuZXIiLCJjaGVja1NlbGZJbmNsdXNpdmUiLCJjaGVja1N1YnRyZWVQcnVuYWJsZSIsImFzc2VydFNsb3ciLCJhdWRpdCIsIm9uUmVtb3ZlSW5wdXRMaXN0ZW5lciIsIm9uUGlja2FibGVDaGFuZ2UiLCJvbGRQaWNrYWJsZSIsInBpY2thYmxlIiwiY2hlY2tTZWxmUHJ1bmVkIiwiY2hhbmdlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwib25Nb3VzZUFyZWFDaGFuZ2UiLCJvblRvdWNoQXJlYUNoYW5nZSIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwib25TZWxmQm91bmRzRGlydHkiLCJvbkNsaXBBcmVhQ2hhbmdlIiwicGlja2FibGVQcm9wZXJ0eSIsInZhbHVlIiwiaXNWaXNpYmxlIiwicGlja2VyIiwiX2lucHV0TGlzdGVuZXJzIiwibiIsIndhc1plcm8iLCJpc1plcm8iLCJsZW4iLCJpc1BvdGVudGlhbGx5UGlja2FibGUiLCJpbnB1dEVuYWJsZWQiLCJmb3JFYWNoIiwibG9jYWxBc3NlcnRTbG93IiwiZXhwZWN0ZWRTZWxmUHJ1bmVkIiwiZXhwZWN0ZWRTZWxmSW5jbHVzaXZlIiwiZXhwZWN0ZWRTdWJ0cmVlUHJ1bmFibGUiLCJleHBlY3RlZFN1YnRyZWVQaWNrYWJsZUNvdW50IiwiXyIsImZpbHRlciIsInBhcmVudCIsInBhcmVudFBpY2tlciIsIk5PVEhJTkciLCJjb3B5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYSw2QkFBNkI7QUFFakQsU0FBZUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsZ0JBQWdCO0FBRXRDLElBQUEsQUFBTUMsU0FBTixNQUFNQTtJQXNFbkI7Ozs7Ozs7R0FPQyxHQUNELEFBQU9DLFFBQVNDLEtBQWMsRUFBRUMsUUFBaUIsRUFBRUMsUUFBaUIsRUFBaUI7UUFDbkZDLFVBQVVBLE9BQVFILE9BQU87UUFFekJJLGNBQWNBLFdBQVdMLE9BQU8sSUFBSUssV0FBV0ws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