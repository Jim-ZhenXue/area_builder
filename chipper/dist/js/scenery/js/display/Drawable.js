// Copyright 2013-2023, University of Colorado Boulder
/**
 * Something that can be displayed with a specific renderer.
 * NOTE: Drawables are assumed to be pooled with PoolableMixin, as freeToPool() is called.
 *
 * A drawable's life-cycle starts with its initialization (calling initialize once), and ends with its disposal
 * (where it is freed to its own pool).
 *
 * Drawables are part of an unordered drawable "tree" where each drawable can have a parent references. This is used
 * for, among other things, propagation of 'dirty' flags and usage during stitching.
 *
 * Blocks and backbones (sub-types of Drawable) contain children (creating a tree, although shared caches make it more
 * like a DAG). Our Scenery Display is built from a root backbone, that contains blocks. This can be Canvas/SVG, but
 * may also contain a DOM block with another backbone (used for opacity, CSS transforms, etc.).
 *
 * Drawables are part of two inherent linked lists: an "old" and a "new" one. Usually they are the same, but during
 * updates, the "new" linked list is changed to accomodate any changes, and then a stitch process is done to mark which
 * block (parent) we will belong to.
 *
 * As part of stitching or other processes, a Drawable is responsible for recording its pending state changes. Most
 * notably, we need to determine whether a drawable is being added, moved, or removed in the next frame. This is done
 * with an idempotent API using notePendingAddition/notePendingRemoval/notePendingMove. Either:
 *   - One or more notePendingMove() calls are made. When we are updated with updateBlock(), we will move to the
 *     last block referenced with notePendingMove() (which may be a no-op if it is the same block).
 *   - Zero or one notePendingAddition() call is made, and zero or one notePendingRemoval() call is made. Our action is:
 *     - No addition, no removal: nothing done
 *     - No addition, one removal: We are removed from our last block (and then presumably disposed later)
 *     - One addition, no removal: We are added to our new (pending) block, without being removed from anything
 *     - One addition, one removal: We are removed from our last block and added to our new (pending) block.
 * It is set up so that the order of addition/removal calls doesn't matter, since these can occur from within different
 * backbone stitches (removed in one, added in another, or with the order reversed). Our updateBlocks() is guaranteed
 * to be called after all of those have been completed.
 *
 * APIs for drawable types:
 *
 * DOM: {
 *   domElement: {HTMLElement}
 * }
 * Canvas: {
 *   paintCanvas: function( {CanvasContextWrapper} wrapper, {Node} node, {Matrix3} matrix )
 * }
 * SVG: {
 *   svgElement: {SVGElement}
 * }
 * WebGL: {
 *   onAddToBlock: function( {WebGLBlock} block )
 *   onRemoveFromBlock: function( {WebGLBlock} block )
 *   render: function( {ShaderProgram} shaderProgram )
 *   shaderAttributes: {string[]} - names of vertex attributes to be used
 * }
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import { Block, Renderer, scenery } from '../imports.js';
let globalId = 1;
let Drawable = class Drawable {
    /**
   * @public
   *
   * @param {number} renderer
   * @returns {Drawable} - for chaining
   */ initialize(renderer) {
        assert && assert(!this.id || this.isDisposed, 'If we previously existed, we need to have been disposed');
        // @public {number} - unique ID for drawables
        this.id = this.id || globalId++;
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] initialize ${this.toString()}`);
        this.clean();
        // @public {number} - Bitmask defined by Renderer.js
        this.renderer = renderer;
        // @public {boolean}
        this.dirty = true;
        // @private {boolean}
        this.isDisposed = false;
        this.linksDirty = false;
        // @public {TinyProperty.<boolean>}
        this.visibleProperty = new TinyProperty(true);
        this.fittableProperty = new TinyProperty(true); // If false, will cause our parent block to not be fitted
        return this;
    }
    /**
   * Cleans the state of this drawable to the defaults.
   * @protected
   */ clean() {
        // @public {Drawable|null} - what drawable we are being rendered (or put) into (will be filled in later)
        this.parentDrawable = null;
        // @public {BackboneDrawable|null} - a backbone reference (if applicable).
        this.backbone = null;
        // @public {Drawable|null} - what our parent drawable will be after the stitch is finished
        this.pendingParentDrawable = null;
        // @public {BackboneDrawable|null} - what our backbone will be after the stitch is finished (if applicable)
        this.pendingBackbone = null;
        // @public {boolean} - whether we are to be added to a block/backbone in our updateBlock() call
        this.pendingAddition = false;
        // @public {boolean} - whether we are to be removed from a block/backbone in our updateBlock() call
        this.pendingRemoval = false;
        assert && assert(!this.previousDrawable && !this.nextDrawable, 'By cleaning (disposal or fresh creation), we should have disconnected from the linked list');
        // @public {Drawable|null} - Linked list handling (will be filled in later)
        this.previousDrawable = null;
        this.nextDrawable = null;
        // @public {Drawable|null} - Similar to previousDrawable/nextDrawable, but without recent changes, so that we can
        // traverse both orders at the same time for stitching.
        this.oldPreviousDrawable = null;
        this.oldNextDrawable = null;
        this.visibleProperty && this.visibleProperty.removeAllListeners();
        this.fittableProperty && this.fittableProperty.removeAllListeners();
    }
    /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   *
   * Generally meant to be overridden in subtypes (but should still call this to check if they should update).
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */ update() {
        let needsFurtherUpdates = false;
        if (this.dirty && !this.isDisposed) {
            this.dirty = false;
            needsFurtherUpdates = true;
        }
        return needsFurtherUpdates;
    }
    /**
   * Sets whether the drawable is visible.
   * @public
   *
   * @param {boolean} visible
   */ setVisible(visible) {
        this.visibleProperty.value = visible;
    }
    set visible(value) {
        this.setVisible(value);
    }
    /**
   * Returns whether the drawable is visible.
   * @public
   *
   * @returns {boolean}
   */ isVisible() {
        return this.visibleProperty.value;
    }
    get visible() {
        return this.isVisible();
    }
    /**
   * Sets whether this drawable is fittable.
   * @public
   *
   * NOTE: Should be called just after initialization (before being added to blocks) if we aren't fittable.
   *
   * @param {boolean} fittable
   */ setFittable(fittable) {
        this.fittableProperty.value = fittable;
    }
    set fittable(value) {
        this.setFittable(value);
    }
    /**
   * Returns whether the drawable is fittable.
   * @public
   *
   * @returns {boolean}
   */ isFittable() {
        return this.fittableProperty.value;
    }
    get fittable() {
        return this.isFittable();
    }
    /**
   * Called to add a block (us) as a child of a backbone
   * @public
   *
   * @param {BackboneDrawable} backboneInstance
   */ setBlockBackbone(backboneInstance) {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] setBlockBackbone ${this.toString()} with ${backboneInstance.toString()}`);
        // if this is being called, Block will be guaranteed to be loaded
        assert && assert(this instanceof Block);
        this.parentDrawable = backboneInstance;
        this.backbone = backboneInstance;
        this.pendingParentDrawable = backboneInstance;
        this.pendingBackbone = backboneInstance;
        this.pendingAddition = false;
        this.pendingRemoval = false;
    }
    /**
   * Notifies the Display of a pending addition.
   * @public
   *
   * @param {Display} display
   * @param {Block} block
   * @param {BackboneDrawable} backbone
   */ notePendingAddition(display, block, backbone) {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingAddition ${this.toString()} with ${block.toString()}, ${backbone ? backbone.toString() : '-'}`);
        assert && assert(backbone !== undefined, 'backbone can be either null or a backbone');
        assert && assert(block instanceof Block);
        this.pendingParentDrawable = block;
        this.pendingBackbone = backbone;
        this.pendingAddition = true;
        // if we weren't already marked for an update, mark us
        if (!this.pendingRemoval) {
            display.markDrawableChangedBlock(this);
        }
    }
    /**
   * Notifies the Display of a pending removal.
   * @public
   *
   * @param {Display} display
   */ notePendingRemoval(display) {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingRemoval ${this.toString()}`);
        this.pendingRemoval = true;
        // if we weren't already marked for an update, mark us
        if (!this.pendingAddition) {
            display.markDrawableChangedBlock(this);
        }
    }
    /**
   * Notifies the Display of a pending move.
   * @public
   *
   * Moving a drawable that isn't changing backbones, just potentially changing its block.
   * It should not have notePendingAddition or notePendingRemoval called on it.
   *
   * @param {Display} display
   * @param {Block} block
   */ notePendingMove(display, block) {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] notePendingMove ${this.toString()} with ${block.toString()}`);
        assert && assert(block instanceof Block);
        this.pendingParentDrawable = block;
        if (!this.pendingRemoval || !this.pendingAddition) {
            display.markDrawableChangedBlock(this);
        }
        // set both flags, since we need it to be removed and added
        this.pendingAddition = true;
        this.pendingRemoval = true;
    }
    /**
   * Updates the block.
   * @public
   *
   * @returns {boolean} - Whether we changed our block
   */ updateBlock() {
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] updateBlock ${this.toString()} with add:${this.pendingAddition} remove:${this.pendingRemoval} old:${this.parentDrawable ? this.parentDrawable.toString() : '-'} new:${this.pendingParentDrawable ? this.pendingParentDrawable.toString() : '-'}`);
        sceneryLog && sceneryLog.Drawable && sceneryLog.push();
        let changed = false;
        if (this.pendingRemoval || this.pendingAddition) {
            // we are only unchanged if we have an addition AND removal, and the endpoints are identical
            changed = !this.pendingRemoval || !this.pendingAddition || this.parentDrawable !== this.pendingParentDrawable || this.backbone !== this.pendingBackbone;
            if (changed) {
                if (this.pendingRemoval) {
                    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`removing from ${this.parentDrawable.toString()}`);
                    this.parentDrawable.removeDrawable(this);
                    // remove references if we are not being added back in
                    if (!this.pendingAddition) {
                        this.pendingParentDrawable = null;
                        this.pendingBackbone = null;
                    }
                }
                this.parentDrawable = this.pendingParentDrawable;
                this.backbone = this.pendingBackbone;
                if (this.pendingAddition) {
                    sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`adding to ${this.parentDrawable.toString()}`);
                    this.parentDrawable.addDrawable(this);
                }
            } else {
                sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable('unchanged');
                if (this.pendingAddition && Renderer.isCanvas(this.renderer)) {
                    this.parentDrawable.onPotentiallyMovedDrawable(this);
                }
            }
            this.pendingAddition = false;
            this.pendingRemoval = false;
        }
        sceneryLog && sceneryLog.Drawable && sceneryLog.pop();
        return changed;
    }
    /**
   * Moves the old-drawable-linked-list information into the current-linked-list.
   * @public
   */ updateLinks() {
        this.oldNextDrawable = this.nextDrawable;
        this.oldPreviousDrawable = this.previousDrawable;
        this.linksDirty = false;
    }
    /**
   * Marks this as needing an update.
   * @public
   */ markDirty() {
        if (!this.dirty) {
            this.dirty = true;
            // TODO: notify what we want to call repaint() later https://github.com/phetsims/scenery/issues/1581
            if (this.parentDrawable) {
                this.parentDrawable.markDirtyDrawable(this);
            }
        }
    }
    /**
   * Marks our linked list as dirty.
   * @public
   *
   * Will ensure that after syncTree phase is done, we will have updateLinks() called on us
   *
   * @param {Display} display
   */ markLinksDirty(display) {
        if (!this.linksDirty) {
            this.linksDirty = true;
            display.markDrawableForLinksUpdate(this);
        }
    }
    /**
   * Marks us for disposal in the next phase of updateDisplay(), and disconnects from the linked list
   * @public
   *
   * @param {Display} display
   */ markForDisposal(display) {
        // as we are marked for disposal, we disconnect from the linked list (so our disposal setting nulls won't cause issues)
        Drawable.disconnectBefore(this, display);
        Drawable.disconnectAfter(this, display);
        display.markDrawableForDisposal(this);
    }
    /**
   * Disposes immediately, and makes no guarantees about out linked list's state (disconnects).
   * @public
   *
   * @param {Display} display
   */ disposeImmediately(display) {
        // as we are marked for disposal, we disconnect from the linked list (so our disposal setting nulls won't cause issues)
        Drawable.disconnectBefore(this, display);
        Drawable.disconnectAfter(this, display);
        this.dispose();
    }
    /**
   * Releases references
   * @public
   *
   * NOTE: Generally do not call this directly, use markForDisposal (so Display will dispose us), or disposeImmediately.
   *
   * @param {*} !this.isDisposed
   * @param {*} 'We should not re-dispose drawables'
   */ dispose() {
        assert && assert(!this.isDisposed, 'We should not re-dispose drawables');
        sceneryLog && sceneryLog.Drawable && sceneryLog.Drawable(`[${this.constructor.name}*] dispose ${this.toString()}`);
        sceneryLog && sceneryLog.Drawable && sceneryLog.push();
        this.clean();
        this.isDisposed = true;
        // for now
        this.freeToPool();
        sceneryLog && sceneryLog.Drawable && sceneryLog.pop();
    }
    /**
   * Runs checks on the drawable, based on certain flags.
   * @public
   *
   * @param {boolean} allowPendingBlock
   * @param {boolean} allowPendingList
   * @param {boolean} allowDirty
   */ audit(allowPendingBlock, allowPendingList, allowDirty) {
        if (assertSlow) {
            assertSlow && assertSlow(!this.isDisposed, 'If we are being audited, we assume we are in the drawable display tree, and we should not be marked as disposed');
            assertSlow && assertSlow(this.renderer, 'Should not have a 0 (no) renderer');
            assertSlow && assertSlow(!this.backbone || this.parentDrawable, 'If we have a backbone reference, we must have a parentDrawable (our block)');
            if (!allowPendingBlock) {
                assertSlow && assertSlow(!this.pendingAddition);
                assertSlow && assertSlow(!this.pendingRemoval);
                assertSlow && assertSlow(this.parentDrawable === this.pendingParentDrawable, 'Assure our parent and pending parent match, if we have updated blocks');
                assertSlow && assertSlow(this.backbone === this.pendingBackbone, 'Assure our backbone and pending backbone match, if we have updated blocks');
            }
            if (!allowPendingList) {
                assertSlow && assertSlow(this.oldPreviousDrawable === this.previousDrawable, 'Pending linked-list references should be cleared by now');
                assertSlow && assertSlow(this.oldNextDrawable === this.nextDrawable, 'Pending linked-list references should be cleared by now');
                assertSlow && assertSlow(!this.linksDirty, 'Links dirty flag should be clean');
            }
            if (!allowDirty) {
                assertSlow && assertSlow(!this.dirty, 'Should not be dirty at this phase, if we are in the drawable display tree');
            }
        }
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `${this.constructor.name}#${this.id}`;
    }
    /**
   * Returns a more-informative string form of this object.
   * @public
   *
   * @returns {string}
   */ toDetailedString() {
        return this.toString();
    }
    /**
   * Connects the two drawables in the linked list, while cutting the previous connection and marking
   * @public
   *
   * @param {Drawable} a
   * @param {Drawable} b
   * @param {Display} display
   */ static connectDrawables(a, b, display) {
        // we don't need to do anything if there is no change
        if (a.nextDrawable !== b) {
            // touch previous neighbors
            if (a.nextDrawable) {
                a.nextDrawable.markLinksDirty(display);
                a.nextDrawable.previousDrawable = null;
            }
            if (b.previousDrawable) {
                b.previousDrawable.markLinksDirty(display);
                b.previousDrawable.nextDrawable = null;
            }
            a.nextDrawable = b;
            b.previousDrawable = a;
            // mark these as needing updates
            a.markLinksDirty(display);
            b.markLinksDirty(display);
        }
    }
    /**
   * Disconnects the previous/before drawable from the provided one (for the linked list).
   * @public
   *
   * @param {Drawable} drawable
   * @param {Display} display
   */ static disconnectBefore(drawable, display) {
        // we don't need to do anything if there is no change
        if (drawable.previousDrawable) {
            drawable.markLinksDirty(display);
            drawable.previousDrawable.markLinksDirty(display);
            drawable.previousDrawable.nextDrawable = null;
            drawable.previousDrawable = null;
        }
    }
    /**
   * Disconnects the next/after drawable from the provided one (for the linked list).
   * @public
   *
   * @param {Drawable} drawable
   * @param {Display} display
   */ static disconnectAfter(drawable, display) {
        // we don't need to do anything if there is no change
        if (drawable.nextDrawable) {
            drawable.markLinksDirty(display);
            drawable.nextDrawable.markLinksDirty(display);
            drawable.nextDrawable.previousDrawable = null;
            drawable.nextDrawable = null;
        }
    }
    /**
   * Converts a linked list of drawables to an array (useful for debugging/assertion purposes, should not be used in
   * production code).
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @returns {Array.<Drawable>}
   */ static listToArray(firstDrawable, lastDrawable) {
        const arr = [];
        // assumes we'll hit lastDrawable, otherwise we'll NPE
        for(let drawable = firstDrawable;; drawable = drawable.nextDrawable){
            arr.push(drawable);
            if (drawable === lastDrawable) {
                break;
            }
        }
        return arr;
    }
    /**
   * Converts an old linked list of drawables to an array (useful for debugging/assertion purposes, should not be
   * used in production code)
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @returns {Array.<Drawable>}
   */ static oldListToArray(firstDrawable, lastDrawable) {
        const arr = [];
        // assumes we'll hit lastDrawable, otherwise we'll NPE
        for(let drawable = firstDrawable;; drawable = drawable.oldNextDrawable){
            arr.push(drawable);
            if (drawable === lastDrawable) {
                break;
            }
        }
        return arr;
    }
};
scenery.register('Drawable', Drawable);
export default Drawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9EcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTb21ldGhpbmcgdGhhdCBjYW4gYmUgZGlzcGxheWVkIHdpdGggYSBzcGVjaWZpYyByZW5kZXJlci5cbiAqIE5PVEU6IERyYXdhYmxlcyBhcmUgYXNzdW1lZCB0byBiZSBwb29sZWQgd2l0aCBQb29sYWJsZU1peGluLCBhcyBmcmVlVG9Qb29sKCkgaXMgY2FsbGVkLlxuICpcbiAqIEEgZHJhd2FibGUncyBsaWZlLWN5Y2xlIHN0YXJ0cyB3aXRoIGl0cyBpbml0aWFsaXphdGlvbiAoY2FsbGluZyBpbml0aWFsaXplIG9uY2UpLCBhbmQgZW5kcyB3aXRoIGl0cyBkaXNwb3NhbFxuICogKHdoZXJlIGl0IGlzIGZyZWVkIHRvIGl0cyBvd24gcG9vbCkuXG4gKlxuICogRHJhd2FibGVzIGFyZSBwYXJ0IG9mIGFuIHVub3JkZXJlZCBkcmF3YWJsZSBcInRyZWVcIiB3aGVyZSBlYWNoIGRyYXdhYmxlIGNhbiBoYXZlIGEgcGFyZW50IHJlZmVyZW5jZXMuIFRoaXMgaXMgdXNlZFxuICogZm9yLCBhbW9uZyBvdGhlciB0aGluZ3MsIHByb3BhZ2F0aW9uIG9mICdkaXJ0eScgZmxhZ3MgYW5kIHVzYWdlIGR1cmluZyBzdGl0Y2hpbmcuXG4gKlxuICogQmxvY2tzIGFuZCBiYWNrYm9uZXMgKHN1Yi10eXBlcyBvZiBEcmF3YWJsZSkgY29udGFpbiBjaGlsZHJlbiAoY3JlYXRpbmcgYSB0cmVlLCBhbHRob3VnaCBzaGFyZWQgY2FjaGVzIG1ha2UgaXQgbW9yZVxuICogbGlrZSBhIERBRykuIE91ciBTY2VuZXJ5IERpc3BsYXkgaXMgYnVpbHQgZnJvbSBhIHJvb3QgYmFja2JvbmUsIHRoYXQgY29udGFpbnMgYmxvY2tzLiBUaGlzIGNhbiBiZSBDYW52YXMvU1ZHLCBidXRcbiAqIG1heSBhbHNvIGNvbnRhaW4gYSBET00gYmxvY2sgd2l0aCBhbm90aGVyIGJhY2tib25lICh1c2VkIGZvciBvcGFjaXR5LCBDU1MgdHJhbnNmb3JtcywgZXRjLikuXG4gKlxuICogRHJhd2FibGVzIGFyZSBwYXJ0IG9mIHR3byBpbmhlcmVudCBsaW5rZWQgbGlzdHM6IGFuIFwib2xkXCIgYW5kIGEgXCJuZXdcIiBvbmUuIFVzdWFsbHkgdGhleSBhcmUgdGhlIHNhbWUsIGJ1dCBkdXJpbmdcbiAqIHVwZGF0ZXMsIHRoZSBcIm5ld1wiIGxpbmtlZCBsaXN0IGlzIGNoYW5nZWQgdG8gYWNjb21vZGF0ZSBhbnkgY2hhbmdlcywgYW5kIHRoZW4gYSBzdGl0Y2ggcHJvY2VzcyBpcyBkb25lIHRvIG1hcmsgd2hpY2hcbiAqIGJsb2NrIChwYXJlbnQpIHdlIHdpbGwgYmVsb25nIHRvLlxuICpcbiAqIEFzIHBhcnQgb2Ygc3RpdGNoaW5nIG9yIG90aGVyIHByb2Nlc3NlcywgYSBEcmF3YWJsZSBpcyByZXNwb25zaWJsZSBmb3IgcmVjb3JkaW5nIGl0cyBwZW5kaW5nIHN0YXRlIGNoYW5nZXMuIE1vc3RcbiAqIG5vdGFibHksIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBkcmF3YWJsZSBpcyBiZWluZyBhZGRlZCwgbW92ZWQsIG9yIHJlbW92ZWQgaW4gdGhlIG5leHQgZnJhbWUuIFRoaXMgaXMgZG9uZVxuICogd2l0aCBhbiBpZGVtcG90ZW50IEFQSSB1c2luZyBub3RlUGVuZGluZ0FkZGl0aW9uL25vdGVQZW5kaW5nUmVtb3ZhbC9ub3RlUGVuZGluZ01vdmUuIEVpdGhlcjpcbiAqICAgLSBPbmUgb3IgbW9yZSBub3RlUGVuZGluZ01vdmUoKSBjYWxscyBhcmUgbWFkZS4gV2hlbiB3ZSBhcmUgdXBkYXRlZCB3aXRoIHVwZGF0ZUJsb2NrKCksIHdlIHdpbGwgbW92ZSB0byB0aGVcbiAqICAgICBsYXN0IGJsb2NrIHJlZmVyZW5jZWQgd2l0aCBub3RlUGVuZGluZ01vdmUoKSAod2hpY2ggbWF5IGJlIGEgbm8tb3AgaWYgaXQgaXMgdGhlIHNhbWUgYmxvY2spLlxuICogICAtIFplcm8gb3Igb25lIG5vdGVQZW5kaW5nQWRkaXRpb24oKSBjYWxsIGlzIG1hZGUsIGFuZCB6ZXJvIG9yIG9uZSBub3RlUGVuZGluZ1JlbW92YWwoKSBjYWxsIGlzIG1hZGUuIE91ciBhY3Rpb24gaXM6XG4gKiAgICAgLSBObyBhZGRpdGlvbiwgbm8gcmVtb3ZhbDogbm90aGluZyBkb25lXG4gKiAgICAgLSBObyBhZGRpdGlvbiwgb25lIHJlbW92YWw6IFdlIGFyZSByZW1vdmVkIGZyb20gb3VyIGxhc3QgYmxvY2sgKGFuZCB0aGVuIHByZXN1bWFibHkgZGlzcG9zZWQgbGF0ZXIpXG4gKiAgICAgLSBPbmUgYWRkaXRpb24sIG5vIHJlbW92YWw6IFdlIGFyZSBhZGRlZCB0byBvdXIgbmV3IChwZW5kaW5nKSBibG9jaywgd2l0aG91dCBiZWluZyByZW1vdmVkIGZyb20gYW55dGhpbmdcbiAqICAgICAtIE9uZSBhZGRpdGlvbiwgb25lIHJlbW92YWw6IFdlIGFyZSByZW1vdmVkIGZyb20gb3VyIGxhc3QgYmxvY2sgYW5kIGFkZGVkIHRvIG91ciBuZXcgKHBlbmRpbmcpIGJsb2NrLlxuICogSXQgaXMgc2V0IHVwIHNvIHRoYXQgdGhlIG9yZGVyIG9mIGFkZGl0aW9uL3JlbW92YWwgY2FsbHMgZG9lc24ndCBtYXR0ZXIsIHNpbmNlIHRoZXNlIGNhbiBvY2N1ciBmcm9tIHdpdGhpbiBkaWZmZXJlbnRcbiAqIGJhY2tib25lIHN0aXRjaGVzIChyZW1vdmVkIGluIG9uZSwgYWRkZWQgaW4gYW5vdGhlciwgb3Igd2l0aCB0aGUgb3JkZXIgcmV2ZXJzZWQpLiBPdXIgdXBkYXRlQmxvY2tzKCkgaXMgZ3VhcmFudGVlZFxuICogdG8gYmUgY2FsbGVkIGFmdGVyIGFsbCBvZiB0aG9zZSBoYXZlIGJlZW4gY29tcGxldGVkLlxuICpcbiAqIEFQSXMgZm9yIGRyYXdhYmxlIHR5cGVzOlxuICpcbiAqIERPTToge1xuICogICBkb21FbGVtZW50OiB7SFRNTEVsZW1lbnR9XG4gKiB9XG4gKiBDYW52YXM6IHtcbiAqICAgcGFpbnRDYW52YXM6IGZ1bmN0aW9uKCB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IHdyYXBwZXIsIHtOb2RlfSBub2RlLCB7TWF0cml4M30gbWF0cml4IClcbiAqIH1cbiAqIFNWRzoge1xuICogICBzdmdFbGVtZW50OiB7U1ZHRWxlbWVudH1cbiAqIH1cbiAqIFdlYkdMOiB7XG4gKiAgIG9uQWRkVG9CbG9jazogZnVuY3Rpb24oIHtXZWJHTEJsb2NrfSBibG9jayApXG4gKiAgIG9uUmVtb3ZlRnJvbUJsb2NrOiBmdW5jdGlvbigge1dlYkdMQmxvY2t9IGJsb2NrIClcbiAqICAgcmVuZGVyOiBmdW5jdGlvbigge1NoYWRlclByb2dyYW19IHNoYWRlclByb2dyYW0gKVxuICogICBzaGFkZXJBdHRyaWJ1dGVzOiB7c3RyaW5nW119IC0gbmFtZXMgb2YgdmVydGV4IGF0dHJpYnV0ZXMgdG8gYmUgdXNlZFxuICogfVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCB7IEJsb2NrLCBSZW5kZXJlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5sZXQgZ2xvYmFsSWQgPSAxO1xuXG5jbGFzcyBEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcmV0dXJucyB7RHJhd2FibGV9IC0gZm9yIGNoYWluaW5nXG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciApIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlkIHx8IHRoaXMuaXNEaXNwb3NlZCwgJ0lmIHdlIHByZXZpb3VzbHkgZXhpc3RlZCwgd2UgbmVlZCB0byBoYXZlIGJlZW4gZGlzcG9zZWQnICk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gdW5pcXVlIElEIGZvciBkcmF3YWJsZXNcbiAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCBnbG9iYWxJZCsrO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gaW5pdGlhbGl6ZSAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICB0aGlzLmNsZWFuKCk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gQml0bWFzayBkZWZpbmVkIGJ5IFJlbmRlcmVyLmpzXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn1cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMuaXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMubGlua3NEaXJ0eSA9IGZhbHNlO1xuXG4gICAgLy8gQHB1YmxpYyB7VGlueVByb3BlcnR5Ljxib29sZWFuPn1cbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIHRydWUgKTtcbiAgICB0aGlzLmZpdHRhYmxlUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB0cnVlICk7IC8vIElmIGZhbHNlLCB3aWxsIGNhdXNlIG91ciBwYXJlbnQgYmxvY2sgdG8gbm90IGJlIGZpdHRlZFxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHRoZSBzdGF0ZSBvZiB0aGlzIGRyYXdhYmxlIHRvIHRoZSBkZWZhdWx0cy5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgY2xlYW4oKSB7XG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSB3aGF0IGRyYXdhYmxlIHdlIGFyZSBiZWluZyByZW5kZXJlZCAob3IgcHV0KSBpbnRvICh3aWxsIGJlIGZpbGxlZCBpbiBsYXRlcilcbiAgICB0aGlzLnBhcmVudERyYXdhYmxlID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge0JhY2tib25lRHJhd2FibGV8bnVsbH0gLSBhIGJhY2tib25lIHJlZmVyZW5jZSAoaWYgYXBwbGljYWJsZSkuXG4gICAgdGhpcy5iYWNrYm9uZSA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtEcmF3YWJsZXxudWxsfSAtIHdoYXQgb3VyIHBhcmVudCBkcmF3YWJsZSB3aWxsIGJlIGFmdGVyIHRoZSBzdGl0Y2ggaXMgZmluaXNoZWRcbiAgICB0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtCYWNrYm9uZURyYXdhYmxlfG51bGx9IC0gd2hhdCBvdXIgYmFja2JvbmUgd2lsbCBiZSBhZnRlciB0aGUgc3RpdGNoIGlzIGZpbmlzaGVkIChpZiBhcHBsaWNhYmxlKVxuICAgIHRoaXMucGVuZGluZ0JhY2tib25lID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciB3ZSBhcmUgdG8gYmUgYWRkZWQgdG8gYSBibG9jay9iYWNrYm9uZSBpbiBvdXIgdXBkYXRlQmxvY2soKSBjYWxsXG4gICAgdGhpcy5wZW5kaW5nQWRkaXRpb24gPSBmYWxzZTtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciB3ZSBhcmUgdG8gYmUgcmVtb3ZlZCBmcm9tIGEgYmxvY2svYmFja2JvbmUgaW4gb3VyIHVwZGF0ZUJsb2NrKCkgY2FsbFxuICAgIHRoaXMucGVuZGluZ1JlbW92YWwgPSBmYWxzZTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnByZXZpb3VzRHJhd2FibGUgJiYgIXRoaXMubmV4dERyYXdhYmxlLFxuICAgICAgJ0J5IGNsZWFuaW5nIChkaXNwb3NhbCBvciBmcmVzaCBjcmVhdGlvbiksIHdlIHNob3VsZCBoYXZlIGRpc2Nvbm5lY3RlZCBmcm9tIHRoZSBsaW5rZWQgbGlzdCcgKTtcblxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9IC0gTGlua2VkIGxpc3QgaGFuZGxpbmcgKHdpbGwgYmUgZmlsbGVkIGluIGxhdGVyKVxuICAgIHRoaXMucHJldmlvdXNEcmF3YWJsZSA9IG51bGw7XG4gICAgdGhpcy5uZXh0RHJhd2FibGUgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBTaW1pbGFyIHRvIHByZXZpb3VzRHJhd2FibGUvbmV4dERyYXdhYmxlLCBidXQgd2l0aG91dCByZWNlbnQgY2hhbmdlcywgc28gdGhhdCB3ZSBjYW5cbiAgICAvLyB0cmF2ZXJzZSBib3RoIG9yZGVycyBhdCB0aGUgc2FtZSB0aW1lIGZvciBzdGl0Y2hpbmcuXG4gICAgdGhpcy5vbGRQcmV2aW91c0RyYXdhYmxlID0gbnVsbDtcbiAgICB0aGlzLm9sZE5leHREcmF3YWJsZSA9IG51bGw7XG5cbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eSAmJiB0aGlzLnZpc2libGVQcm9wZXJ0eS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmZpdHRhYmxlUHJvcGVydHkgJiYgdGhpcy5maXR0YWJsZVByb3BlcnR5LnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBHZW5lcmFsbHkgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJ0eXBlcyAoYnV0IHNob3VsZCBzdGlsbCBjYWxsIHRoaXMgdG8gY2hlY2sgaWYgdGhleSBzaG91bGQgdXBkYXRlKS5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gV2hldGhlciB0aGUgdXBkYXRlIHNob3VsZCBjb250aW51ZSAoaWYgZmFsc2UsIGZ1cnRoZXIgdXBkYXRlcyBpbiBzdXBlcnR5cGUgc3RlcHMgc2hvdWxkIG5vdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICBsZXQgbmVlZHNGdXJ0aGVyVXBkYXRlcyA9IGZhbHNlO1xuXG4gICAgaWYgKCB0aGlzLmRpcnR5ICYmICF0aGlzLmlzRGlzcG9zZWQgKSB7XG4gICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gICAgICBuZWVkc0Z1cnRoZXJVcGRhdGVzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmVlZHNGdXJ0aGVyVXBkYXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdGhlIGRyYXdhYmxlIGlzIHZpc2libGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB2aXNpYmxlXG4gICAqL1xuICBzZXRWaXNpYmxlKCB2aXNpYmxlICkge1xuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LnZhbHVlID0gdmlzaWJsZTtcbiAgfVxuXG4gIHNldCB2aXNpYmxlKCB2YWx1ZSApIHsgdGhpcy5zZXRWaXNpYmxlKCB2YWx1ZSApOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgZHJhd2FibGUgaXMgdmlzaWJsZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVmlzaWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpYmxlUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBnZXQgdmlzaWJsZSgpIHsgcmV0dXJuIHRoaXMuaXNWaXNpYmxlKCk7IH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoaXMgZHJhd2FibGUgaXMgZml0dGFibGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogTk9URTogU2hvdWxkIGJlIGNhbGxlZCBqdXN0IGFmdGVyIGluaXRpYWxpemF0aW9uIChiZWZvcmUgYmVpbmcgYWRkZWQgdG8gYmxvY2tzKSBpZiB3ZSBhcmVuJ3QgZml0dGFibGUuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZml0dGFibGVcbiAgICovXG4gIHNldEZpdHRhYmxlKCBmaXR0YWJsZSApIHtcbiAgICB0aGlzLmZpdHRhYmxlUHJvcGVydHkudmFsdWUgPSBmaXR0YWJsZTtcbiAgfVxuXG4gIHNldCBmaXR0YWJsZSggdmFsdWUgKSB7IHRoaXMuc2V0Rml0dGFibGUoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBkcmF3YWJsZSBpcyBmaXR0YWJsZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRml0dGFibGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZml0dGFibGVQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIGdldCBmaXR0YWJsZSgpIHsgcmV0dXJuIHRoaXMuaXNGaXR0YWJsZSgpOyB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBhZGQgYSBibG9jayAodXMpIGFzIGEgY2hpbGQgb2YgYSBiYWNrYm9uZVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7QmFja2JvbmVEcmF3YWJsZX0gYmFja2JvbmVJbnN0YW5jZVxuICAgKi9cbiAgc2V0QmxvY2tCYWNrYm9uZSggYmFja2JvbmVJbnN0YW5jZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSggYFske3RoaXMuY29uc3RydWN0b3IubmFtZX0qXSBzZXRCbG9ja0JhY2tib25lICR7XG4gICAgICB0aGlzLnRvU3RyaW5nKCl9IHdpdGggJHtiYWNrYm9uZUluc3RhbmNlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gaWYgdGhpcyBpcyBiZWluZyBjYWxsZWQsIEJsb2NrIHdpbGwgYmUgZ3VhcmFudGVlZCB0byBiZSBsb2FkZWRcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzIGluc3RhbmNlb2YgQmxvY2sgKTtcblxuICAgIHRoaXMucGFyZW50RHJhd2FibGUgPSBiYWNrYm9uZUluc3RhbmNlO1xuICAgIHRoaXMuYmFja2JvbmUgPSBiYWNrYm9uZUluc3RhbmNlO1xuICAgIHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlID0gYmFja2JvbmVJbnN0YW5jZTtcbiAgICB0aGlzLnBlbmRpbmdCYWNrYm9uZSA9IGJhY2tib25lSW5zdGFuY2U7XG4gICAgdGhpcy5wZW5kaW5nQWRkaXRpb24gPSBmYWxzZTtcbiAgICB0aGlzLnBlbmRpbmdSZW1vdmFsID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgdGhlIERpc3BsYXkgb2YgYSBwZW5kaW5nIGFkZGl0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKiBAcGFyYW0ge0Jsb2NrfSBibG9ja1xuICAgKiBAcGFyYW0ge0JhY2tib25lRHJhd2FibGV9IGJhY2tib25lXG4gICAqL1xuICBub3RlUGVuZGluZ0FkZGl0aW9uKCBkaXNwbGF5LCBibG9jaywgYmFja2JvbmUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gbm90ZVBlbmRpbmdBZGRpdGlvbiAke1xuICAgICAgdGhpcy50b1N0cmluZygpfSB3aXRoICR7YmxvY2sudG9TdHJpbmcoKX0sICR7XG4gICAgICBiYWNrYm9uZSA/IGJhY2tib25lLnRvU3RyaW5nKCkgOiAnLSd9YCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmFja2JvbmUgIT09IHVuZGVmaW5lZCwgJ2JhY2tib25lIGNhbiBiZSBlaXRoZXIgbnVsbCBvciBhIGJhY2tib25lJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJsb2NrIGluc3RhbmNlb2YgQmxvY2sgKTtcblxuICAgIHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlID0gYmxvY2s7XG4gICAgdGhpcy5wZW5kaW5nQmFja2JvbmUgPSBiYWNrYm9uZTtcbiAgICB0aGlzLnBlbmRpbmdBZGRpdGlvbiA9IHRydWU7XG5cbiAgICAvLyBpZiB3ZSB3ZXJlbid0IGFscmVhZHkgbWFya2VkIGZvciBhbiB1cGRhdGUsIG1hcmsgdXNcbiAgICBpZiAoICF0aGlzLnBlbmRpbmdSZW1vdmFsICkge1xuICAgICAgZGlzcGxheS5tYXJrRHJhd2FibGVDaGFuZ2VkQmxvY2soIHRoaXMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTm90aWZpZXMgdGhlIERpc3BsYXkgb2YgYSBwZW5kaW5nIHJlbW92YWwuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqL1xuICBub3RlUGVuZGluZ1JlbW92YWwoIGRpc3BsYXkgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoIGBbJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9Kl0gbm90ZVBlbmRpbmdSZW1vdmFsICR7XG4gICAgICB0aGlzLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgdGhpcy5wZW5kaW5nUmVtb3ZhbCA9IHRydWU7XG5cbiAgICAvLyBpZiB3ZSB3ZXJlbid0IGFscmVhZHkgbWFya2VkIGZvciBhbiB1cGRhdGUsIG1hcmsgdXNcbiAgICBpZiAoICF0aGlzLnBlbmRpbmdBZGRpdGlvbiApIHtcbiAgICAgIGRpc3BsYXkubWFya0RyYXdhYmxlQ2hhbmdlZEJsb2NrKCB0aGlzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIHRoZSBEaXNwbGF5IG9mIGEgcGVuZGluZyBtb3ZlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE1vdmluZyBhIGRyYXdhYmxlIHRoYXQgaXNuJ3QgY2hhbmdpbmcgYmFja2JvbmVzLCBqdXN0IHBvdGVudGlhbGx5IGNoYW5naW5nIGl0cyBibG9jay5cbiAgICogSXQgc2hvdWxkIG5vdCBoYXZlIG5vdGVQZW5kaW5nQWRkaXRpb24gb3Igbm90ZVBlbmRpbmdSZW1vdmFsIGNhbGxlZCBvbiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqL1xuICBub3RlUGVuZGluZ01vdmUoIGRpc3BsYXksIGJsb2NrICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSpdIG5vdGVQZW5kaW5nTW92ZSAke1xuICAgICAgdGhpcy50b1N0cmluZygpfSB3aXRoICR7YmxvY2sudG9TdHJpbmcoKX1gICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBibG9jayBpbnN0YW5jZW9mIEJsb2NrICk7XG5cbiAgICB0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA9IGJsb2NrO1xuXG4gICAgaWYgKCAhdGhpcy5wZW5kaW5nUmVtb3ZhbCB8fCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gKSB7XG4gICAgICBkaXNwbGF5Lm1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayggdGhpcyApO1xuICAgIH1cblxuICAgIC8vIHNldCBib3RoIGZsYWdzLCBzaW5jZSB3ZSBuZWVkIGl0IHRvIGJlIHJlbW92ZWQgYW5kIGFkZGVkXG4gICAgdGhpcy5wZW5kaW5nQWRkaXRpb24gPSB0cnVlO1xuICAgIHRoaXMucGVuZGluZ1JlbW92YWwgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGJsb2NrLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgd2UgY2hhbmdlZCBvdXIgYmxvY2tcbiAgICovXG4gIHVwZGF0ZUJsb2NrKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSpdIHVwZGF0ZUJsb2NrICR7dGhpcy50b1N0cmluZygpXG4gICAgfSB3aXRoIGFkZDoke3RoaXMucGVuZGluZ0FkZGl0aW9uXG4gICAgfSByZW1vdmU6JHt0aGlzLnBlbmRpbmdSZW1vdmFsXG4gICAgfSBvbGQ6JHt0aGlzLnBhcmVudERyYXdhYmxlID8gdGhpcy5wYXJlbnREcmF3YWJsZS50b1N0cmluZygpIDogJy0nXG4gICAgfSBuZXc6JHt0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA/IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlLnRvU3RyaW5nKCkgOiAnLSd9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICBpZiAoIHRoaXMucGVuZGluZ1JlbW92YWwgfHwgdGhpcy5wZW5kaW5nQWRkaXRpb24gKSB7XG4gICAgICAvLyB3ZSBhcmUgb25seSB1bmNoYW5nZWQgaWYgd2UgaGF2ZSBhbiBhZGRpdGlvbiBBTkQgcmVtb3ZhbCwgYW5kIHRoZSBlbmRwb2ludHMgYXJlIGlkZW50aWNhbFxuICAgICAgY2hhbmdlZCA9ICF0aGlzLnBlbmRpbmdSZW1vdmFsIHx8ICF0aGlzLnBlbmRpbmdBZGRpdGlvbiB8fFxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUgIT09IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5iYWNrYm9uZSAhPT0gdGhpcy5wZW5kaW5nQmFja2JvbmU7XG5cbiAgICAgIGlmICggY2hhbmdlZCApIHtcbiAgICAgICAgaWYgKCB0aGlzLnBlbmRpbmdSZW1vdmFsICkge1xuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlKCBgcmVtb3ZpbmcgZnJvbSAke3RoaXMucGFyZW50RHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG4gICAgICAgICAgdGhpcy5wYXJlbnREcmF3YWJsZS5yZW1vdmVEcmF3YWJsZSggdGhpcyApO1xuXG4gICAgICAgICAgLy8gcmVtb3ZlIHJlZmVyZW5jZXMgaWYgd2UgYXJlIG5vdCBiZWluZyBhZGRlZCBiYWNrIGluXG4gICAgICAgICAgaWYgKCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gKSB7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdCYWNrYm9uZSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXJlbnREcmF3YWJsZSA9IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlO1xuICAgICAgICB0aGlzLmJhY2tib25lID0gdGhpcy5wZW5kaW5nQmFja2JvbmU7XG5cbiAgICAgICAgaWYgKCB0aGlzLnBlbmRpbmdBZGRpdGlvbiApIHtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSggYGFkZGluZyB0byAke3RoaXMucGFyZW50RHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG4gICAgICAgICAgdGhpcy5wYXJlbnREcmF3YWJsZS5hZGREcmF3YWJsZSggdGhpcyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRyYXdhYmxlICYmIHNjZW5lcnlMb2cuRHJhd2FibGUoICd1bmNoYW5nZWQnICk7XG5cbiAgICAgICAgaWYgKCB0aGlzLnBlbmRpbmdBZGRpdGlvbiAmJiBSZW5kZXJlci5pc0NhbnZhcyggdGhpcy5yZW5kZXJlciApICkge1xuICAgICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUub25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUoIHRoaXMgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnBlbmRpbmdBZGRpdGlvbiA9IGZhbHNlO1xuICAgICAgdGhpcy5wZW5kaW5nUmVtb3ZhbCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgdGhlIG9sZC1kcmF3YWJsZS1saW5rZWQtbGlzdCBpbmZvcm1hdGlvbiBpbnRvIHRoZSBjdXJyZW50LWxpbmtlZC1saXN0LlxuICAgKiBAcHVibGljXG4gICAqL1xuICB1cGRhdGVMaW5rcygpIHtcbiAgICB0aGlzLm9sZE5leHREcmF3YWJsZSA9IHRoaXMubmV4dERyYXdhYmxlO1xuICAgIHRoaXMub2xkUHJldmlvdXNEcmF3YWJsZSA9IHRoaXMucHJldmlvdXNEcmF3YWJsZTtcbiAgICB0aGlzLmxpbmtzRGlydHkgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGlzIGFzIG5lZWRpbmcgYW4gdXBkYXRlLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHkoKSB7XG4gICAgaWYgKCAhdGhpcy5kaXJ0eSApIHtcbiAgICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuXG4gICAgICAvLyBUT0RPOiBub3RpZnkgd2hhdCB3ZSB3YW50IHRvIGNhbGwgcmVwYWludCgpIGxhdGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIHRoaXMucGFyZW50RHJhd2FibGUgKSB7XG4gICAgICAgIHRoaXMucGFyZW50RHJhd2FibGUubWFya0RpcnR5RHJhd2FibGUoIHRoaXMgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFya3Mgb3VyIGxpbmtlZCBsaXN0IGFzIGRpcnR5LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFdpbGwgZW5zdXJlIHRoYXQgYWZ0ZXIgc3luY1RyZWUgcGhhc2UgaXMgZG9uZSwgd2Ugd2lsbCBoYXZlIHVwZGF0ZUxpbmtzKCkgY2FsbGVkIG9uIHVzXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKi9cbiAgbWFya0xpbmtzRGlydHkoIGRpc3BsYXkgKSB7XG4gICAgaWYgKCAhdGhpcy5saW5rc0RpcnR5ICkge1xuICAgICAgdGhpcy5saW5rc0RpcnR5ID0gdHJ1ZTtcbiAgICAgIGRpc3BsYXkubWFya0RyYXdhYmxlRm9yTGlua3NVcGRhdGUoIHRoaXMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdXMgZm9yIGRpc3Bvc2FsIGluIHRoZSBuZXh0IHBoYXNlIG9mIHVwZGF0ZURpc3BsYXkoKSwgYW5kIGRpc2Nvbm5lY3RzIGZyb20gdGhlIGxpbmtlZCBsaXN0XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqL1xuICBtYXJrRm9yRGlzcG9zYWwoIGRpc3BsYXkgKSB7XG4gICAgLy8gYXMgd2UgYXJlIG1hcmtlZCBmb3IgZGlzcG9zYWwsIHdlIGRpc2Nvbm5lY3QgZnJvbSB0aGUgbGlua2VkIGxpc3QgKHNvIG91ciBkaXNwb3NhbCBzZXR0aW5nIG51bGxzIHdvbid0IGNhdXNlIGlzc3VlcylcbiAgICBEcmF3YWJsZS5kaXNjb25uZWN0QmVmb3JlKCB0aGlzLCBkaXNwbGF5ICk7XG4gICAgRHJhd2FibGUuZGlzY29ubmVjdEFmdGVyKCB0aGlzLCBkaXNwbGF5ICk7XG5cbiAgICBkaXNwbGF5Lm1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgaW1tZWRpYXRlbHksIGFuZCBtYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IG91dCBsaW5rZWQgbGlzdCdzIHN0YXRlIChkaXNjb25uZWN0cykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqL1xuICBkaXNwb3NlSW1tZWRpYXRlbHkoIGRpc3BsYXkgKSB7XG4gICAgLy8gYXMgd2UgYXJlIG1hcmtlZCBmb3IgZGlzcG9zYWwsIHdlIGRpc2Nvbm5lY3QgZnJvbSB0aGUgbGlua2VkIGxpc3QgKHNvIG91ciBkaXNwb3NhbCBzZXR0aW5nIG51bGxzIHdvbid0IGNhdXNlIGlzc3VlcylcbiAgICBEcmF3YWJsZS5kaXNjb25uZWN0QmVmb3JlKCB0aGlzLCBkaXNwbGF5ICk7XG4gICAgRHJhd2FibGUuZGlzY29ubmVjdEFmdGVyKCB0aGlzLCBkaXNwbGF5ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogTk9URTogR2VuZXJhbGx5IGRvIG5vdCBjYWxsIHRoaXMgZGlyZWN0bHksIHVzZSBtYXJrRm9yRGlzcG9zYWwgKHNvIERpc3BsYXkgd2lsbCBkaXNwb3NlIHVzKSwgb3IgZGlzcG9zZUltbWVkaWF0ZWx5LlxuICAgKlxuICAgKiBAcGFyYW0geyp9ICF0aGlzLmlzRGlzcG9zZWRcbiAgICogQHBhcmFtIHsqfSAnV2Ugc2hvdWxkIG5vdCByZS1kaXNwb3NlIGRyYXdhYmxlcydcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNEaXNwb3NlZCwgJ1dlIHNob3VsZCBub3QgcmUtZGlzcG9zZSBkcmF3YWJsZXMnICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSggYFske3RoaXMuY29uc3RydWN0b3IubmFtZX0qXSBkaXNwb3NlICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLmNsZWFuKCk7XG4gICAgdGhpcy5pc0Rpc3Bvc2VkID0gdHJ1ZTtcblxuICAgIC8vIGZvciBub3dcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgY2hlY2tzIG9uIHRoZSBkcmF3YWJsZSwgYmFzZWQgb24gY2VydGFpbiBmbGFncy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93UGVuZGluZ0Jsb2NrXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dQZW5kaW5nTGlzdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93RGlydHlcbiAgICovXG4gIGF1ZGl0KCBhbGxvd1BlbmRpbmdCbG9jaywgYWxsb3dQZW5kaW5nTGlzdCwgYWxsb3dEaXJ0eSApIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coICF0aGlzLmlzRGlzcG9zZWQsXG4gICAgICAgICdJZiB3ZSBhcmUgYmVpbmcgYXVkaXRlZCwgd2UgYXNzdW1lIHdlIGFyZSBpbiB0aGUgZHJhd2FibGUgZGlzcGxheSB0cmVlLCBhbmQgd2Ugc2hvdWxkIG5vdCBiZSBtYXJrZWQgYXMgZGlzcG9zZWQnICk7XG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMucmVuZGVyZXIsICdTaG91bGQgbm90IGhhdmUgYSAwIChubykgcmVuZGVyZXInICk7XG5cbiAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggIXRoaXMuYmFja2JvbmUgfHwgdGhpcy5wYXJlbnREcmF3YWJsZSxcbiAgICAgICAgJ0lmIHdlIGhhdmUgYSBiYWNrYm9uZSByZWZlcmVuY2UsIHdlIG11c3QgaGF2ZSBhIHBhcmVudERyYXdhYmxlIChvdXIgYmxvY2spJyApO1xuXG4gICAgICBpZiAoICFhbGxvd1BlbmRpbmdCbG9jayApIHtcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCAhdGhpcy5wZW5kaW5nQWRkaXRpb24gKTtcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCAhdGhpcy5wZW5kaW5nUmVtb3ZhbCApO1xuICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMucGFyZW50RHJhd2FibGUgPT09IHRoaXMucGVuZGluZ1BhcmVudERyYXdhYmxlLFxuICAgICAgICAgICdBc3N1cmUgb3VyIHBhcmVudCBhbmQgcGVuZGluZyBwYXJlbnQgbWF0Y2gsIGlmIHdlIGhhdmUgdXBkYXRlZCBibG9ja3MnICk7XG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5iYWNrYm9uZSA9PT0gdGhpcy5wZW5kaW5nQmFja2JvbmUsXG4gICAgICAgICAgJ0Fzc3VyZSBvdXIgYmFja2JvbmUgYW5kIHBlbmRpbmcgYmFja2JvbmUgbWF0Y2gsIGlmIHdlIGhhdmUgdXBkYXRlZCBibG9ja3MnICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggIWFsbG93UGVuZGluZ0xpc3QgKSB7XG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5vbGRQcmV2aW91c0RyYXdhYmxlID09PSB0aGlzLnByZXZpb3VzRHJhd2FibGUsXG4gICAgICAgICAgJ1BlbmRpbmcgbGlua2VkLWxpc3QgcmVmZXJlbmNlcyBzaG91bGQgYmUgY2xlYXJlZCBieSBub3cnICk7XG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5vbGROZXh0RHJhd2FibGUgPT09IHRoaXMubmV4dERyYXdhYmxlLFxuICAgICAgICAgICdQZW5kaW5nIGxpbmtlZC1saXN0IHJlZmVyZW5jZXMgc2hvdWxkIGJlIGNsZWFyZWQgYnkgbm93JyApO1xuICAgICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coICF0aGlzLmxpbmtzRGlydHksICdMaW5rcyBkaXJ0eSBmbGFnIHNob3VsZCBiZSBjbGVhbicgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCAhYWxsb3dEaXJ0eSApIHtcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCAhdGhpcy5kaXJ0eSxcbiAgICAgICAgICAnU2hvdWxkIG5vdCBiZSBkaXJ0eSBhdCB0aGlzIHBoYXNlLCBpZiB3ZSBhcmUgaW4gdGhlIGRyYXdhYmxlIGRpc3BsYXkgdHJlZScgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5pZH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtb3JlLWluZm9ybWF0aXZlIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b0RldGFpbGVkU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogQ29ubmVjdHMgdGhlIHR3byBkcmF3YWJsZXMgaW4gdGhlIGxpbmtlZCBsaXN0LCB3aGlsZSBjdXR0aW5nIHRoZSBwcmV2aW91cyBjb25uZWN0aW9uIGFuZCBtYXJraW5nXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gYVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBiXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxuICAgKi9cbiAgc3RhdGljIGNvbm5lY3REcmF3YWJsZXMoIGEsIGIsIGRpc3BsYXkgKSB7XG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBpZiB0aGVyZSBpcyBubyBjaGFuZ2VcbiAgICBpZiAoIGEubmV4dERyYXdhYmxlICE9PSBiICkge1xuICAgICAgLy8gdG91Y2ggcHJldmlvdXMgbmVpZ2hib3JzXG4gICAgICBpZiAoIGEubmV4dERyYXdhYmxlICkge1xuICAgICAgICBhLm5leHREcmF3YWJsZS5tYXJrTGlua3NEaXJ0eSggZGlzcGxheSApO1xuICAgICAgICBhLm5leHREcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggYi5wcmV2aW91c0RyYXdhYmxlICkge1xuICAgICAgICBiLnByZXZpb3VzRHJhd2FibGUubWFya0xpbmtzRGlydHkoIGRpc3BsYXkgKTtcbiAgICAgICAgYi5wcmV2aW91c0RyYXdhYmxlLm5leHREcmF3YWJsZSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGEubmV4dERyYXdhYmxlID0gYjtcbiAgICAgIGIucHJldmlvdXNEcmF3YWJsZSA9IGE7XG5cbiAgICAgIC8vIG1hcmsgdGhlc2UgYXMgbmVlZGluZyB1cGRhdGVzXG4gICAgICBhLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XG4gICAgICBiLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc2Nvbm5lY3RzIHRoZSBwcmV2aW91cy9iZWZvcmUgZHJhd2FibGUgZnJvbSB0aGUgcHJvdmlkZWQgb25lIChmb3IgdGhlIGxpbmtlZCBsaXN0KS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICovXG4gIHN0YXRpYyBkaXNjb25uZWN0QmVmb3JlKCBkcmF3YWJsZSwgZGlzcGxheSApIHtcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIGlmIHRoZXJlIGlzIG5vIGNoYW5nZVxuICAgIGlmICggZHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSApIHtcbiAgICAgIGRyYXdhYmxlLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XG4gICAgICBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XG4gICAgICBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLm5leHREcmF3YWJsZSA9IG51bGw7XG4gICAgICBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgdGhlIG5leHQvYWZ0ZXIgZHJhd2FibGUgZnJvbSB0aGUgcHJvdmlkZWQgb25lIChmb3IgdGhlIGxpbmtlZCBsaXN0KS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICovXG4gIHN0YXRpYyBkaXNjb25uZWN0QWZ0ZXIoIGRyYXdhYmxlLCBkaXNwbGF5ICkge1xuICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgaWYgdGhlcmUgaXMgbm8gY2hhbmdlXG4gICAgaWYgKCBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XG4gICAgICBkcmF3YWJsZS5tYXJrTGlua3NEaXJ0eSggZGlzcGxheSApO1xuICAgICAgZHJhd2FibGUubmV4dERyYXdhYmxlLm1hcmtMaW5rc0RpcnR5KCBkaXNwbGF5ICk7XG4gICAgICBkcmF3YWJsZS5uZXh0RHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSA9IG51bGw7XG4gICAgICBkcmF3YWJsZS5uZXh0RHJhd2FibGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyB0byBhbiBhcnJheSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcvYXNzZXJ0aW9uIHB1cnBvc2VzLCBzaG91bGQgbm90IGJlIHVzZWQgaW5cbiAgICogcHJvZHVjdGlvbiBjb2RlKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxuICAgKiBAcmV0dXJucyB7QXJyYXkuPERyYXdhYmxlPn1cbiAgICovXG4gIHN0YXRpYyBsaXN0VG9BcnJheSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICkge1xuICAgIGNvbnN0IGFyciA9IFtdO1xuXG4gICAgLy8gYXNzdW1lcyB3ZSdsbCBoaXQgbGFzdERyYXdhYmxlLCBvdGhlcndpc2Ugd2UnbGwgTlBFXG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTsgOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgIGFyci5wdXNoKCBkcmF3YWJsZSApO1xuXG4gICAgICBpZiAoIGRyYXdhYmxlID09PSBsYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYW4gb2xkIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyB0byBhbiBhcnJheSAodXNlZnVsIGZvciBkZWJ1Z2dpbmcvYXNzZXJ0aW9uIHB1cnBvc2VzLCBzaG91bGQgbm90IGJlXG4gICAqIHVzZWQgaW4gcHJvZHVjdGlvbiBjb2RlKVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlXG4gICAqIEByZXR1cm5zIHtBcnJheS48RHJhd2FibGU+fVxuICAgKi9cbiAgc3RhdGljIG9sZExpc3RUb0FycmF5KCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XG4gICAgY29uc3QgYXJyID0gW107XG5cbiAgICAvLyBhc3N1bWVzIHdlJ2xsIGhpdCBsYXN0RHJhd2FibGUsIG90aGVyd2lzZSB3ZSdsbCBOUEVcbiAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSBmaXJzdERyYXdhYmxlOyA7IGRyYXdhYmxlID0gZHJhd2FibGUub2xkTmV4dERyYXdhYmxlICkge1xuICAgICAgYXJyLnB1c2goIGRyYXdhYmxlICk7XG5cbiAgICAgIGlmICggZHJhd2FibGUgPT09IGxhc3REcmF3YWJsZSApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRHJhd2FibGUnLCBEcmF3YWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgRHJhd2FibGU7Il0sIm5hbWVzIjpbIlRpbnlQcm9wZXJ0eSIsIkJsb2NrIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiZ2xvYmFsSWQiLCJEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImFzc2VydCIsImlkIiwiaXNEaXNwb3NlZCIsInNjZW5lcnlMb2ciLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJ0b1N0cmluZyIsImNsZWFuIiwiZGlydHkiLCJsaW5rc0RpcnR5IiwidmlzaWJsZVByb3BlcnR5IiwiZml0dGFibGVQcm9wZXJ0eSIsInBhcmVudERyYXdhYmxlIiwiYmFja2JvbmUiLCJwZW5kaW5nUGFyZW50RHJhd2FibGUiLCJwZW5kaW5nQmFja2JvbmUiLCJwZW5kaW5nQWRkaXRpb24iLCJwZW5kaW5nUmVtb3ZhbCIsInByZXZpb3VzRHJhd2FibGUiLCJuZXh0RHJhd2FibGUiLCJvbGRQcmV2aW91c0RyYXdhYmxlIiwib2xkTmV4dERyYXdhYmxlIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwidXBkYXRlIiwibmVlZHNGdXJ0aGVyVXBkYXRlcyIsInNldFZpc2libGUiLCJ2aXNpYmxlIiwidmFsdWUiLCJpc1Zpc2libGUiLCJzZXRGaXR0YWJsZSIsImZpdHRhYmxlIiwiaXNGaXR0YWJsZSIsInNldEJsb2NrQmFja2JvbmUiLCJiYWNrYm9uZUluc3RhbmNlIiwibm90ZVBlbmRpbmdBZGRpdGlvbiIsImRpc3BsYXkiLCJibG9jayIsInVuZGVmaW5lZCIsIm1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayIsIm5vdGVQZW5kaW5nUmVtb3ZhbCIsIm5vdGVQZW5kaW5nTW92ZSIsInVwZGF0ZUJsb2NrIiwicHVzaCIsImNoYW5nZWQiLCJyZW1vdmVEcmF3YWJsZSIsImFkZERyYXdhYmxlIiwiaXNDYW52YXMiLCJvblBvdGVudGlhbGx5TW92ZWREcmF3YWJsZSIsInBvcCIsInVwZGF0ZUxpbmtzIiwibWFya0RpcnR5IiwibWFya0RpcnR5RHJhd2FibGUiLCJtYXJrTGlua3NEaXJ0eSIsIm1hcmtEcmF3YWJsZUZvckxpbmtzVXBkYXRlIiwibWFya0ZvckRpc3Bvc2FsIiwiZGlzY29ubmVjdEJlZm9yZSIsImRpc2Nvbm5lY3RBZnRlciIsIm1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsIiwiZGlzcG9zZUltbWVkaWF0ZWx5IiwiZGlzcG9zZSIsImZyZWVUb1Bvb2wiLCJhdWRpdCIsImFsbG93UGVuZGluZ0Jsb2NrIiwiYWxsb3dQZW5kaW5nTGlzdCIsImFsbG93RGlydHkiLCJhc3NlcnRTbG93IiwidG9EZXRhaWxlZFN0cmluZyIsImNvbm5lY3REcmF3YWJsZXMiLCJhIiwiYiIsImRyYXdhYmxlIiwibGlzdFRvQXJyYXkiLCJmaXJzdERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwiYXJyIiwib2xkTGlzdFRvQXJyYXkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtREMsR0FFRCxPQUFPQSxrQkFBa0IsbUNBQW1DO0FBQzVELFNBQVNDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXpELElBQUlDLFdBQVc7QUFFZixJQUFBLEFBQU1DLFdBQU4sTUFBTUE7SUFDSjs7Ozs7R0FLQyxHQUNEQyxXQUFZQyxRQUFRLEVBQUc7UUFFckJDLFVBQVVBLE9BQVEsQ0FBQyxJQUFJ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