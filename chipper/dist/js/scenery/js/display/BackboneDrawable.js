// Copyright 2013-2024, University of Colorado Boulder
/**
 * A DOM drawable (div element) that contains child blocks (and is placed in the main DOM tree when visible). It should
 * use z-index for properly ordering its blocks in the correct stacking order.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { Drawable, GreedyStitcher, RebuildStitcher, scenery, Stitcher, Utils } from '../imports.js';
// constants
const useGreedyStitcher = true;
let BackboneDrawable = class BackboneDrawable extends Drawable {
    /**
   * @public
   *
   * @param {Display} display
   * @param {Instance} backboneInstance
   * @param {Instance} transformRootInstance
   * @param {number} renderer
   * @param {boolean} isDisplayRoot
   */ initialize(display, backboneInstance, transformRootInstance, renderer, isDisplayRoot) {
        super.initialize(renderer);
        this.display = display;
        // @public {Instance} - reference to the instance that controls this backbone
        this.backboneInstance = backboneInstance;
        // @public {Instance} - where is the transform root for our generated blocks?
        this.transformRootInstance = transformRootInstance;
        // @private {Instance} - where have filters been applied to up? our responsibility is to apply filters between this
        // and our backboneInstance
        this.filterRootAncestorInstance = backboneInstance.parent ? backboneInstance.parent.getFilterRootInstance() : backboneInstance;
        // where have transforms been applied up to? our responsibility is to apply transforms between this and our backboneInstance
        this.transformRootAncestorInstance = backboneInstance.parent ? backboneInstance.parent.getTransformRootInstance() : backboneInstance;
        this.willApplyTransform = this.transformRootAncestorInstance !== this.transformRootInstance;
        this.willApplyFilters = this.filterRootAncestorInstance !== this.backboneInstance;
        this.transformListener = this.transformListener || this.markTransformDirty.bind(this);
        if (this.willApplyTransform) {
            this.backboneInstance.relativeTransform.addListener(this.transformListener); // when our relative transform changes, notify us in the pre-repaint phase
            this.backboneInstance.relativeTransform.addPrecompute(); // trigger precomputation of the relative transform, since we will always need it when it is updated
        }
        this.backboneVisibilityListener = this.backboneVisibilityListener || this.updateBackboneVisibility.bind(this);
        this.backboneInstance.relativeVisibleEmitter.addListener(this.backboneVisibilityListener);
        this.updateBackboneVisibility();
        this.visibilityDirty = true;
        this.renderer = renderer;
        this.domElement = isDisplayRoot ? display.domElement : BackboneDrawable.createDivBackbone();
        this.isDisplayRoot = isDisplayRoot;
        this.dirtyDrawables = cleanArray(this.dirtyDrawables);
        // Apply CSS needed for future CSS transforms to work properly.
        Utils.prepareForTransform(this.domElement);
        // Ff we need to, watch nodes below us (and including us) and apply their filters (opacity/visibility/clip) to the
        // backbone. Order will be important, since we'll visit them in the order of filter application
        this.watchedFilterNodes = cleanArray(this.watchedFilterNodes);
        // @private {boolean}
        this.filterDirty = true;
        // @private {boolean}
        this.clipDirty = true;
        this.filterDirtyListener = this.filterDirtyListener || this.onFilterDirty.bind(this);
        this.clipDirtyListener = this.clipDirtyListener || this.onClipDirty.bind(this);
        if (this.willApplyFilters) {
            assert && assert(this.filterRootAncestorInstance.trail.nodes.length < this.backboneInstance.trail.nodes.length, 'Our backboneInstance should be deeper if we are applying filters');
            // walk through to see which instances we'll need to watch for filter changes
            // NOTE: order is important, so that the filters are applied in the correct order!
            for(let instance = this.backboneInstance; instance !== this.filterRootAncestorInstance; instance = instance.parent){
                const node = instance.node;
                this.watchedFilterNodes.push(node);
                node.filterChangeEmitter.addListener(this.filterDirtyListener);
                node.clipAreaProperty.lazyLink(this.clipDirtyListener);
            }
        }
        this.lastZIndex = 0; // our last zIndex is stored, so that overlays can be added easily
        this.blocks = this.blocks || []; // we are responsible for their disposal
        // the first/last drawables for the last the this backbone was stitched
        this.previousFirstDrawable = null;
        this.previousLastDrawable = null;
        // We track whether our drawables were marked for removal (in which case, they should all be removed by the time we dispose).
        // If removedDrawables = false during disposal, it means we need to remove the drawables manually (this should only happen if an instance tree is removed)
        this.removedDrawables = false;
        this.stitcher = this.stitcher || (useGreedyStitcher ? new GreedyStitcher() : new RebuildStitcher());
        sceneryLog && sceneryLog.BackboneDrawable && sceneryLog.BackboneDrawable(`initialized ${this.toString()}`);
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.BackboneDrawable && sceneryLog.BackboneDrawable(`dispose ${this.toString()}`);
        sceneryLog && sceneryLog.BackboneDrawable && sceneryLog.push();
        while(this.watchedFilterNodes.length){
            const node = this.watchedFilterNodes.pop();
            node.filterChangeEmitter.removeListener(this.filterDirtyListener);
            node.clipAreaProperty.unlink(this.clipDirtyListener);
        }
        this.backboneInstance.relativeVisibleEmitter.removeListener(this.backboneVisibilityListener);
        // if we need to remove drawables from the blocks, do so
        if (!this.removedDrawables) {
            for(let d = this.previousFirstDrawable; d !== null; d = d.nextDrawable){
                d.parentDrawable.removeDrawable(d);
                if (d === this.previousLastDrawable) {
                    break;
                }
            }
        }
        this.markBlocksForDisposal();
        if (this.willApplyTransform) {
            this.backboneInstance.relativeTransform.removeListener(this.transformListener);
            this.backboneInstance.relativeTransform.removePrecompute();
        }
        this.backboneInstance = null;
        this.transformRootInstance = null;
        this.filterRootAncestorInstance = null;
        this.transformRootAncestorInstance = null;
        cleanArray(this.dirtyDrawables);
        cleanArray(this.watchedFilterNodes);
        this.previousFirstDrawable = null;
        this.previousLastDrawable = null;
        super.dispose();
        sceneryLog && sceneryLog.BackboneDrawable && sceneryLog.pop();
    }
    /**
   * Dispose all of the blocks while clearing our references to them
   * @public
   */ markBlocksForDisposal() {
        while(this.blocks.length){
            const block = this.blocks.pop();
            sceneryLog && sceneryLog.BackboneDrawable && sceneryLog.BackboneDrawable(`${this.toString()} removing block: ${block.toString()}`);
            //TODO: PERFORMANCE: does this cause reflows / style calculation https://github.com/phetsims/scenery/issues/1581
            if (block.domElement.parentNode === this.domElement) {
                // guarded, since we may have a (new) child drawable add it before we can remove it
                this.domElement.removeChild(block.domElement);
            }
            block.markForDisposal(this.display);
        }
    }
    /**
   * @private
   */ updateBackboneVisibility() {
        this.visible = this.backboneInstance.relativeVisible;
        if (!this.visibilityDirty) {
            this.visibilityDirty = true;
            this.markDirty();
        }
    }
    /**
   * Marks this backbone for disposal.
   * @public
   * @override
   *
   * NOTE: Should be called during syncTree
   *
   * @param {Display} display
   */ markForDisposal(display) {
        for(let d = this.previousFirstDrawable; d !== null; d = d.oldNextDrawable){
            d.notePendingRemoval(this.display);
            if (d === this.previousLastDrawable) {
                break;
            }
        }
        this.removedDrawables = true;
        // super call
        super.markForDisposal(display);
    }
    /**
   * Marks a drawable as dirty.
   * @public
   *
   * @param {Drawable} drawable
   */ markDirtyDrawable(drawable) {
        if (assert) {
            // Catch infinite loops
            this.display.ensureNotPainting();
        }
        this.dirtyDrawables.push(drawable);
        this.markDirty();
    }
    /**
   * Marks our transform as dirty.
   * @public
   */ markTransformDirty() {
        assert && assert(this.willApplyTransform, 'Sanity check for willApplyTransform');
        // relative matrix on backbone instance should be up to date, since we added the compute flags
        Utils.applyPreparedTransform(this.backboneInstance.relativeTransform.matrix, this.domElement);
    }
    /**
   * Marks our opacity as dirty.
   * @private
   */ onFilterDirty() {
        if (!this.filterDirty) {
            this.filterDirty = true;
            this.markDirty();
        }
    }
    /**
   * Marks our clip as dirty.
   * @private
   */ onClipDirty() {
        if (!this.clipDirty) {
            this.clipDirty = true;
            this.markDirty();
        }
    }
    /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */ update() {
        // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
        if (!super.update()) {
            return false;
        }
        while(this.dirtyDrawables.length){
            this.dirtyDrawables.pop().update();
        }
        if (this.filterDirty) {
            this.filterDirty = false;
            let filterString = '';
            const len = this.watchedFilterNodes.length;
            for(let i = 0; i < len; i++){
                const node = this.watchedFilterNodes[i];
                const opacity = node.getEffectiveOpacity();
                for(let j = 0; j < node._filters.length; j++){
                    filterString += `${filterString ? ' ' : ''}${node._filters[j].getCSSFilterString()}`;
                }
                // Apply opacity after other effects
                if (opacity !== 1) {
                    filterString += `${filterString ? ' ' : ''}opacity(${toSVGNumber(opacity)})`;
                }
            }
            this.domElement.style.filter = filterString;
        }
        if (this.visibilityDirty) {
            this.visibilityDirty = false;
            this.domElement.style.display = this.visible ? '' : 'none';
        }
        if (this.clipDirty) {
            this.clipDirty = false;
        // var clip = this.willApplyFilters ? this.getFilterClip() : '';
        //OHTWO TODO: CSS clip-path/mask support here. see http://www.html5rocks.com/en/tutorials/masking/adobe/ https://github.com/phetsims/scenery/issues/1581
        // this.domElement.style.clipPath = clip; // yikes! temporary, since we already threw something?
        }
        return true;
    }
    /**
   * Returns the combined visibility of nodes "above us" that will need to be taken into account for displaying this
   * backbone.
   * @public
   *
   * @returns {boolean}
   */ getFilterVisibility() {
        const len = this.watchedFilterNodes.length;
        for(let i = 0; i < len; i++){
            if (!this.watchedFilterNodes[i].isVisible()) {
                return false;
            }
        }
        return true;
    }
    /**
   * Returns the combined clipArea (string???) for nodes "above us".
   * @public
   *
   * @returns {string}
   */ getFilterClip() {
        const clip = '';
        //OHTWO TODO: proper clipping support https://github.com/phetsims/scenery/issues/1581
        // var len = this.watchedFilterNodes.length;
        // for ( var i = 0; i < len; i++ ) {
        //   if ( this.watchedFilterNodes[i].clipArea ) {
        //     throw new Error( 'clip-path for backbones unimplemented, and with questionable browser support!' );
        //   }
        // }
        return clip;
    }
    /**
   * Ensures that z-indices are strictly increasing, while trying to minimize the number of times we must change it
   * @public
   */ reindexBlocks() {
        // full-pass change for zindex.
        let zIndex = 0; // don't start below 1 (we ensure > in loop)
        for(let k = 0; k < this.blocks.length; k++){
            const block = this.blocks[k];
            if (block.zIndex <= zIndex) {
                const newIndex = k + 1 < this.blocks.length && this.blocks[k + 1].zIndex - 1 > zIndex ? Math.ceil((zIndex + this.blocks[k + 1].zIndex) / 2) : zIndex + 20;
                // NOTE: this should give it its own stacking index (which is what we want)
                block.domElement.style.zIndex = block.zIndex = newIndex;
            }
            zIndex = block.zIndex;
            if (assert) {
                assert(this.blocks[k].zIndex % 1 === 0, 'z-indices should be integers');
                assert(this.blocks[k].zIndex > 0, 'z-indices should be greater than zero for our needs (see spec)');
                if (k > 0) {
                    assert(this.blocks[k - 1].zIndex < this.blocks[k].zIndex, 'z-indices should be strictly increasing');
                }
            }
        }
        // sanity check
        this.lastZIndex = zIndex + 1;
    }
    /**
   * Stitches multiple change intervals.
   * @public
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */ stitch(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval) {
        // no stitch necessary if there are no change intervals
        if (firstChangeInterval === null || lastChangeInterval === null) {
            assert && assert(firstChangeInterval === null);
            assert && assert(lastChangeInterval === null);
            return;
        }
        assert && assert(lastChangeInterval.nextChangeInterval === null, 'This allows us to have less checks in the loop');
        if (sceneryLog && sceneryLog.Stitch) {
            sceneryLog.Stitch(`Stitch intervals before constricting: ${this.toString()}`);
            sceneryLog.push();
            Stitcher.debugIntervals(firstChangeInterval);
            sceneryLog.pop();
        }
        // Make the intervals as small as possible by skipping areas without changes, and collapse the interval
        // linked list
        let lastNonemptyInterval = null;
        let interval = firstChangeInterval;
        let intervalsChanged = false;
        while(interval){
            intervalsChanged = interval.constrict() || intervalsChanged;
            if (interval.isEmpty()) {
                assert && assert(intervalsChanged);
                if (lastNonemptyInterval) {
                    // skip it, hook the correct reference
                    lastNonemptyInterval.nextChangeInterval = interval.nextChangeInterval;
                }
            } else {
                // our first non-empty interval will be our new firstChangeInterval
                if (!lastNonemptyInterval) {
                    firstChangeInterval = interval;
                }
                lastNonemptyInterval = interval;
            }
            interval = interval.nextChangeInterval;
        }
        if (!lastNonemptyInterval) {
            // eek, no nonempty change intervals. do nothing (good to catch here, but ideally there shouldn't be change
            // intervals that all collapse).
            return;
        }
        lastChangeInterval = lastNonemptyInterval;
        lastChangeInterval.nextChangeInterval = null;
        if (sceneryLog && sceneryLog.Stitch && intervalsChanged) {
            sceneryLog.Stitch(`Stitch intervals after constricting: ${this.toString()}`);
            sceneryLog.push();
            Stitcher.debugIntervals(firstChangeInterval);
            sceneryLog.pop();
        }
        if (sceneryLog && scenery.isLoggingPerformance()) {
            this.display.perfStitchCount++;
            let dInterval = firstChangeInterval;
            while(dInterval){
                this.display.perfIntervalCount++;
                this.display.perfDrawableOldIntervalCount += dInterval.getOldInternalDrawableCount(this.previousFirstDrawable, this.previousLastDrawable);
                this.display.perfDrawableNewIntervalCount += dInterval.getNewInternalDrawableCount(firstDrawable, lastDrawable);
                dInterval = dInterval.nextChangeInterval;
            }
        }
        this.stitcher.stitch(this, firstDrawable, lastDrawable, this.previousFirstDrawable, this.previousLastDrawable, firstChangeInterval, lastChangeInterval);
    }
    /**
   * Runs checks on the drawable, based on certain flags.
   * @public
   * @override
   *
   * @param {boolean} allowPendingBlock
   * @param {boolean} allowPendingList
   * @param {boolean} allowDirty
   */ audit(allowPendingBlock, allowPendingList, allowDirty) {
        if (assertSlow) {
            super.audit(allowPendingBlock, allowPendingList, allowDirty);
            assertSlow && assertSlow(this.backboneInstance.isBackbone, 'We should reference an instance that requires a backbone');
            assertSlow && assertSlow(this.transformRootInstance.isTransformed, 'Transform root should be transformed');
            for(let i = 0; i < this.blocks.length; i++){
                this.blocks[i].audit(allowPendingBlock, allowPendingList, allowDirty);
            }
        }
    }
    /**
   * Creates a base DOM element for a backbone.
   * @public
   *
   * @returns {HTMLDivElement}
   */ static createDivBackbone() {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = '0';
        div.style.top = '0';
        div.style.width = '0';
        div.style.height = '0';
        return div;
    }
    /**
   * Given an external element, we apply the necessary style to make it compatible as a backbone DOM element.
   * @public
   *
   * @param {HTMLElement} element
   * @returns {HTMLElement} - For chaining
   */ static repurposeBackboneContainer(element) {
        if (element.style.position !== 'relative' || element.style.position !== 'absolute') {
            element.style.position = 'relative';
        }
        element.style.left = '0';
        element.style.top = '0';
        return element;
    }
    /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {Instance} backboneInstance
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {number} renderer
   * @param {boolean} isDisplayRoot
   */ constructor(display, backboneInstance, transformRootInstance, renderer, isDisplayRoot){
        super();
        this.initialize(display, backboneInstance, transformRootInstance, renderer, isDisplayRoot);
    }
};
scenery.register('BackboneDrawable', BackboneDrawable);
Poolable.mixInto(BackboneDrawable);
export default BackboneDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9CYWNrYm9uZURyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgRE9NIGRyYXdhYmxlIChkaXYgZWxlbWVudCkgdGhhdCBjb250YWlucyBjaGlsZCBibG9ja3MgKGFuZCBpcyBwbGFjZWQgaW4gdGhlIG1haW4gRE9NIHRyZWUgd2hlbiB2aXNpYmxlKS4gSXQgc2hvdWxkXG4gKiB1c2Ugei1pbmRleCBmb3IgcHJvcGVybHkgb3JkZXJpbmcgaXRzIGJsb2NrcyBpbiB0aGUgY29ycmVjdCBzdGFja2luZyBvcmRlci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy90b1NWR051bWJlci5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IERyYXdhYmxlLCBHcmVlZHlTdGl0Y2hlciwgUmVidWlsZFN0aXRjaGVyLCBzY2VuZXJ5LCBTdGl0Y2hlciwgVXRpbHMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCB1c2VHcmVlZHlTdGl0Y2hlciA9IHRydWU7XG5cbmNsYXNzIEJhY2tib25lRHJhd2FibGUgZXh0ZW5kcyBEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBAbWl4ZXMgUG9vbGFibGVcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGJhY2tib25lSW5zdGFuY2VcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gdHJhbnNmb3JtUm9vdEluc3RhbmNlIC0gQWxsIHRyYW5zZm9ybXMgb2YgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9ycyB3aWxsIGFscmVhZHkgaGF2ZSBiZWVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpZWQuIFRoaXMgYmxvY2sgd2lsbCBvbmx5IGJlIHJlc3BvbnNpYmxlIGZvciBhcHBseWluZyB0cmFuc2Zvcm1zIG9mXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMgaW5zdGFuY2UncyBkZXNjZW5kYW50cy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEaXNwbGF5Um9vdFxuICAgKi9cbiAgY29uc3RydWN0b3IoIGRpc3BsYXksIGJhY2tib25lSW5zdGFuY2UsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgcmVuZGVyZXIsIGlzRGlzcGxheVJvb3QgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZGlzcGxheSwgYmFja2JvbmVJbnN0YW5jZSwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCByZW5kZXJlciwgaXNEaXNwbGF5Um9vdCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGJhY2tib25lSW5zdGFuY2VcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gdHJhbnNmb3JtUm9vdEluc3RhbmNlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRGlzcGxheVJvb3RcbiAgICovXG4gIGluaXRpYWxpemUoIGRpc3BsYXksIGJhY2tib25lSW5zdGFuY2UsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgcmVuZGVyZXIsIGlzRGlzcGxheVJvb3QgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIgKTtcblxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG5cbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZX0gLSByZWZlcmVuY2UgdG8gdGhlIGluc3RhbmNlIHRoYXQgY29udHJvbHMgdGhpcyBiYWNrYm9uZVxuICAgIHRoaXMuYmFja2JvbmVJbnN0YW5jZSA9IGJhY2tib25lSW5zdGFuY2U7XG5cbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZX0gLSB3aGVyZSBpcyB0aGUgdHJhbnNmb3JtIHJvb3QgZm9yIG91ciBnZW5lcmF0ZWQgYmxvY2tzP1xuICAgIHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlID0gdHJhbnNmb3JtUm9vdEluc3RhbmNlO1xuXG4gICAgLy8gQHByaXZhdGUge0luc3RhbmNlfSAtIHdoZXJlIGhhdmUgZmlsdGVycyBiZWVuIGFwcGxpZWQgdG8gdXA/IG91ciByZXNwb25zaWJpbGl0eSBpcyB0byBhcHBseSBmaWx0ZXJzIGJldHdlZW4gdGhpc1xuICAgIC8vIGFuZCBvdXIgYmFja2JvbmVJbnN0YW5jZVxuICAgIHRoaXMuZmlsdGVyUm9vdEFuY2VzdG9ySW5zdGFuY2UgPSBiYWNrYm9uZUluc3RhbmNlLnBhcmVudCA/IGJhY2tib25lSW5zdGFuY2UucGFyZW50LmdldEZpbHRlclJvb3RJbnN0YW5jZSgpIDogYmFja2JvbmVJbnN0YW5jZTtcblxuICAgIC8vIHdoZXJlIGhhdmUgdHJhbnNmb3JtcyBiZWVuIGFwcGxpZWQgdXAgdG8/IG91ciByZXNwb25zaWJpbGl0eSBpcyB0byBhcHBseSB0cmFuc2Zvcm1zIGJldHdlZW4gdGhpcyBhbmQgb3VyIGJhY2tib25lSW5zdGFuY2VcbiAgICB0aGlzLnRyYW5zZm9ybVJvb3RBbmNlc3Rvckluc3RhbmNlID0gYmFja2JvbmVJbnN0YW5jZS5wYXJlbnQgPyBiYWNrYm9uZUluc3RhbmNlLnBhcmVudC5nZXRUcmFuc2Zvcm1Sb290SW5zdGFuY2UoKSA6IGJhY2tib25lSW5zdGFuY2U7XG5cbiAgICB0aGlzLndpbGxBcHBseVRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtUm9vdEFuY2VzdG9ySW5zdGFuY2UgIT09IHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlO1xuICAgIHRoaXMud2lsbEFwcGx5RmlsdGVycyA9IHRoaXMuZmlsdGVyUm9vdEFuY2VzdG9ySW5zdGFuY2UgIT09IHRoaXMuYmFja2JvbmVJbnN0YW5jZTtcblxuICAgIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgPSB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyIHx8IHRoaXMubWFya1RyYW5zZm9ybURpcnR5LmJpbmQoIHRoaXMgKTtcbiAgICBpZiAoIHRoaXMud2lsbEFwcGx5VHJhbnNmb3JtICkge1xuICAgICAgdGhpcy5iYWNrYm9uZUluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmFkZExpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7IC8vIHdoZW4gb3VyIHJlbGF0aXZlIHRyYW5zZm9ybSBjaGFuZ2VzLCBub3RpZnkgdXMgaW4gdGhlIHByZS1yZXBhaW50IHBoYXNlXG4gICAgICB0aGlzLmJhY2tib25lSW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0uYWRkUHJlY29tcHV0ZSgpOyAvLyB0cmlnZ2VyIHByZWNvbXB1dGF0aW9uIG9mIHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0sIHNpbmNlIHdlIHdpbGwgYWx3YXlzIG5lZWQgaXQgd2hlbiBpdCBpcyB1cGRhdGVkXG4gICAgfVxuXG4gICAgdGhpcy5iYWNrYm9uZVZpc2liaWxpdHlMaXN0ZW5lciA9IHRoaXMuYmFja2JvbmVWaXNpYmlsaXR5TGlzdGVuZXIgfHwgdGhpcy51cGRhdGVCYWNrYm9uZVZpc2liaWxpdHkuYmluZCggdGhpcyApO1xuICAgIHRoaXMuYmFja2JvbmVJbnN0YW5jZS5yZWxhdGl2ZVZpc2libGVFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmJhY2tib25lVmlzaWJpbGl0eUxpc3RlbmVyICk7XG4gICAgdGhpcy51cGRhdGVCYWNrYm9uZVZpc2liaWxpdHkoKTtcbiAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy5kb21FbGVtZW50ID0gaXNEaXNwbGF5Um9vdCA/IGRpc3BsYXkuZG9tRWxlbWVudCA6IEJhY2tib25lRHJhd2FibGUuY3JlYXRlRGl2QmFja2JvbmUoKTtcbiAgICB0aGlzLmlzRGlzcGxheVJvb3QgPSBpc0Rpc3BsYXlSb290O1xuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5RHJhd2FibGVzICk7XG5cbiAgICAvLyBBcHBseSBDU1MgbmVlZGVkIGZvciBmdXR1cmUgQ1NTIHRyYW5zZm9ybXMgdG8gd29yayBwcm9wZXJseS5cbiAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuICAgIC8vIEZmIHdlIG5lZWQgdG8sIHdhdGNoIG5vZGVzIGJlbG93IHVzIChhbmQgaW5jbHVkaW5nIHVzKSBhbmQgYXBwbHkgdGhlaXIgZmlsdGVycyAob3BhY2l0eS92aXNpYmlsaXR5L2NsaXApIHRvIHRoZVxuICAgIC8vIGJhY2tib25lLiBPcmRlciB3aWxsIGJlIGltcG9ydGFudCwgc2luY2Ugd2UnbGwgdmlzaXQgdGhlbSBpbiB0aGUgb3JkZXIgb2YgZmlsdGVyIGFwcGxpY2F0aW9uXG4gICAgdGhpcy53YXRjaGVkRmlsdGVyTm9kZXMgPSBjbGVhbkFycmF5KCB0aGlzLndhdGNoZWRGaWx0ZXJOb2RlcyApO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XG4gICAgdGhpcy5maWx0ZXJEaXJ0eSA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmZpbHRlckRpcnR5TGlzdGVuZXIgPSB0aGlzLmZpbHRlckRpcnR5TGlzdGVuZXIgfHwgdGhpcy5vbkZpbHRlckRpcnR5LmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyID0gdGhpcy5jbGlwRGlydHlMaXN0ZW5lciB8fCB0aGlzLm9uQ2xpcERpcnR5LmJpbmQoIHRoaXMgKTtcbiAgICBpZiAoIHRoaXMud2lsbEFwcGx5RmlsdGVycyApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZmlsdGVyUm9vdEFuY2VzdG9ySW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoIDwgdGhpcy5iYWNrYm9uZUluc3RhbmNlLnRyYWlsLm5vZGVzLmxlbmd0aCxcbiAgICAgICAgJ091ciBiYWNrYm9uZUluc3RhbmNlIHNob3VsZCBiZSBkZWVwZXIgaWYgd2UgYXJlIGFwcGx5aW5nIGZpbHRlcnMnICk7XG5cbiAgICAgIC8vIHdhbGsgdGhyb3VnaCB0byBzZWUgd2hpY2ggaW5zdGFuY2VzIHdlJ2xsIG5lZWQgdG8gd2F0Y2ggZm9yIGZpbHRlciBjaGFuZ2VzXG4gICAgICAvLyBOT1RFOiBvcmRlciBpcyBpbXBvcnRhbnQsIHNvIHRoYXQgdGhlIGZpbHRlcnMgYXJlIGFwcGxpZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIhXG4gICAgICBmb3IgKCBsZXQgaW5zdGFuY2UgPSB0aGlzLmJhY2tib25lSW5zdGFuY2U7IGluc3RhbmNlICE9PSB0aGlzLmZpbHRlclJvb3RBbmNlc3Rvckluc3RhbmNlOyBpbnN0YW5jZSA9IGluc3RhbmNlLnBhcmVudCApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGluc3RhbmNlLm5vZGU7XG5cbiAgICAgICAgdGhpcy53YXRjaGVkRmlsdGVyTm9kZXMucHVzaCggbm9kZSApO1xuICAgICAgICBub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuZmlsdGVyRGlydHlMaXN0ZW5lciApO1xuICAgICAgICBub2RlLmNsaXBBcmVhUHJvcGVydHkubGF6eUxpbmsoIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxhc3RaSW5kZXggPSAwOyAvLyBvdXIgbGFzdCB6SW5kZXggaXMgc3RvcmVkLCBzbyB0aGF0IG92ZXJsYXlzIGNhbiBiZSBhZGRlZCBlYXNpbHlcblxuICAgIHRoaXMuYmxvY2tzID0gdGhpcy5ibG9ja3MgfHwgW107IC8vIHdlIGFyZSByZXNwb25zaWJsZSBmb3IgdGhlaXIgZGlzcG9zYWxcblxuICAgIC8vIHRoZSBmaXJzdC9sYXN0IGRyYXdhYmxlcyBmb3IgdGhlIGxhc3QgdGhlIHRoaXMgYmFja2JvbmUgd2FzIHN0aXRjaGVkXG4gICAgdGhpcy5wcmV2aW91c0ZpcnN0RHJhd2FibGUgPSBudWxsO1xuICAgIHRoaXMucHJldmlvdXNMYXN0RHJhd2FibGUgPSBudWxsO1xuXG4gICAgLy8gV2UgdHJhY2sgd2hldGhlciBvdXIgZHJhd2FibGVzIHdlcmUgbWFya2VkIGZvciByZW1vdmFsIChpbiB3aGljaCBjYXNlLCB0aGV5IHNob3VsZCBhbGwgYmUgcmVtb3ZlZCBieSB0aGUgdGltZSB3ZSBkaXNwb3NlKS5cbiAgICAvLyBJZiByZW1vdmVkRHJhd2FibGVzID0gZmFsc2UgZHVyaW5nIGRpc3Bvc2FsLCBpdCBtZWFucyB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgZHJhd2FibGVzIG1hbnVhbGx5ICh0aGlzIHNob3VsZCBvbmx5IGhhcHBlbiBpZiBhbiBpbnN0YW5jZSB0cmVlIGlzIHJlbW92ZWQpXG4gICAgdGhpcy5yZW1vdmVkRHJhd2FibGVzID0gZmFsc2U7XG5cbiAgICB0aGlzLnN0aXRjaGVyID0gdGhpcy5zdGl0Y2hlciB8fCAoIHVzZUdyZWVkeVN0aXRjaGVyID8gbmV3IEdyZWVkeVN0aXRjaGVyKCkgOiBuZXcgUmVidWlsZFN0aXRjaGVyKCkgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5CYWNrYm9uZURyYXdhYmxlICYmIHNjZW5lcnlMb2cuQmFja2JvbmVEcmF3YWJsZSggYGluaXRpYWxpemVkICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkJhY2tib25lRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5CYWNrYm9uZURyYXdhYmxlKCBgZGlzcG9zZSAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkJhY2tib25lRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cblxuICAgIHdoaWxlICggdGhpcy53YXRjaGVkRmlsdGVyTm9kZXMubGVuZ3RoICkge1xuICAgICAgY29uc3Qgbm9kZSA9IHRoaXMud2F0Y2hlZEZpbHRlck5vZGVzLnBvcCgpO1xuXG4gICAgICBub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuZmlsdGVyRGlydHlMaXN0ZW5lciApO1xuICAgICAgbm9kZS5jbGlwQXJlYVByb3BlcnR5LnVubGluayggdGhpcy5jbGlwRGlydHlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHRoaXMuYmFja2JvbmVJbnN0YW5jZS5yZWxhdGl2ZVZpc2libGVFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmJhY2tib25lVmlzaWJpbGl0eUxpc3RlbmVyICk7XG5cbiAgICAvLyBpZiB3ZSBuZWVkIHRvIHJlbW92ZSBkcmF3YWJsZXMgZnJvbSB0aGUgYmxvY2tzLCBkbyBzb1xuICAgIGlmICggIXRoaXMucmVtb3ZlZERyYXdhYmxlcyApIHtcbiAgICAgIGZvciAoIGxldCBkID0gdGhpcy5wcmV2aW91c0ZpcnN0RHJhd2FibGU7IGQgIT09IG51bGw7IGQgPSBkLm5leHREcmF3YWJsZSApIHtcbiAgICAgICAgZC5wYXJlbnREcmF3YWJsZS5yZW1vdmVEcmF3YWJsZSggZCApO1xuICAgICAgICBpZiAoIGQgPT09IHRoaXMucHJldmlvdXNMYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tYXJrQmxvY2tzRm9yRGlzcG9zYWwoKTtcblxuICAgIGlmICggdGhpcy53aWxsQXBwbHlUcmFuc2Zvcm0gKSB7XG4gICAgICB0aGlzLmJhY2tib25lSW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuYmFja2JvbmVJbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5yZW1vdmVQcmVjb21wdXRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5iYWNrYm9uZUluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLnRyYW5zZm9ybVJvb3RJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5maWx0ZXJSb290QW5jZXN0b3JJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy50cmFuc2Zvcm1Sb290QW5jZXN0b3JJbnN0YW5jZSA9IG51bGw7XG4gICAgY2xlYW5BcnJheSggdGhpcy5kaXJ0eURyYXdhYmxlcyApO1xuICAgIGNsZWFuQXJyYXkoIHRoaXMud2F0Y2hlZEZpbHRlck5vZGVzICk7XG5cbiAgICB0aGlzLnByZXZpb3VzRmlyc3REcmF3YWJsZSA9IG51bGw7XG4gICAgdGhpcy5wcmV2aW91c0xhc3REcmF3YWJsZSA9IG51bGw7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQmFja2JvbmVEcmF3YWJsZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgYWxsIG9mIHRoZSBibG9ja3Mgd2hpbGUgY2xlYXJpbmcgb3VyIHJlZmVyZW5jZXMgdG8gdGhlbVxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrQmxvY2tzRm9yRGlzcG9zYWwoKSB7XG4gICAgd2hpbGUgKCB0aGlzLmJsb2Nrcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBibG9jayA9IHRoaXMuYmxvY2tzLnBvcCgpO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkJhY2tib25lRHJhd2FibGUgJiYgc2NlbmVyeUxvZy5CYWNrYm9uZURyYXdhYmxlKCBgJHt0aGlzLnRvU3RyaW5nKCl9IHJlbW92aW5nIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgICAgLy9UT0RPOiBQRVJGT1JNQU5DRTogZG9lcyB0aGlzIGNhdXNlIHJlZmxvd3MgLyBzdHlsZSBjYWxjdWxhdGlvbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgaWYgKCBibG9jay5kb21FbGVtZW50LnBhcmVudE5vZGUgPT09IHRoaXMuZG9tRWxlbWVudCApIHtcbiAgICAgICAgLy8gZ3VhcmRlZCwgc2luY2Ugd2UgbWF5IGhhdmUgYSAobmV3KSBjaGlsZCBkcmF3YWJsZSBhZGQgaXQgYmVmb3JlIHdlIGNhbiByZW1vdmUgaXRcbiAgICAgICAgdGhpcy5kb21FbGVtZW50LnJlbW92ZUNoaWxkKCBibG9jay5kb21FbGVtZW50ICk7XG4gICAgICB9XG4gICAgICBibG9jay5tYXJrRm9yRGlzcG9zYWwoIHRoaXMuZGlzcGxheSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdXBkYXRlQmFja2JvbmVWaXNpYmlsaXR5KCkge1xuICAgIHRoaXMudmlzaWJsZSA9IHRoaXMuYmFja2JvbmVJbnN0YW5jZS5yZWxhdGl2ZVZpc2libGU7XG5cbiAgICBpZiAoICF0aGlzLnZpc2liaWxpdHlEaXJ0eSApIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIHRoaXMgYmFja2JvbmUgZm9yIGRpc3Bvc2FsLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBOT1RFOiBTaG91bGQgYmUgY2FsbGVkIGR1cmluZyBzeW5jVHJlZVxuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICovXG4gIG1hcmtGb3JEaXNwb3NhbCggZGlzcGxheSApIHtcbiAgICBmb3IgKCBsZXQgZCA9IHRoaXMucHJldmlvdXNGaXJzdERyYXdhYmxlOyBkICE9PSBudWxsOyBkID0gZC5vbGROZXh0RHJhd2FibGUgKSB7XG4gICAgICBkLm5vdGVQZW5kaW5nUmVtb3ZhbCggdGhpcy5kaXNwbGF5ICk7XG4gICAgICBpZiAoIGQgPT09IHRoaXMucHJldmlvdXNMYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlZERyYXdhYmxlcyA9IHRydWU7XG5cbiAgICAvLyBzdXBlciBjYWxsXG4gICAgc3VwZXIubWFya0ZvckRpc3Bvc2FsKCBkaXNwbGF5ICk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgYSBkcmF3YWJsZSBhcyBkaXJ0eS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgbWFya0RpcnR5RHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgLy8gQ2F0Y2ggaW5maW5pdGUgbG9vcHNcbiAgICAgIHRoaXMuZGlzcGxheS5lbnN1cmVOb3RQYWludGluZygpO1xuICAgIH1cblxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMucHVzaCggZHJhd2FibGUgKTtcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIG91ciB0cmFuc2Zvcm0gYXMgZGlydHkuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIG1hcmtUcmFuc2Zvcm1EaXJ0eSgpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLndpbGxBcHBseVRyYW5zZm9ybSwgJ1Nhbml0eSBjaGVjayBmb3Igd2lsbEFwcGx5VHJhbnNmb3JtJyApO1xuXG4gICAgLy8gcmVsYXRpdmUgbWF0cml4IG9uIGJhY2tib25lIGluc3RhbmNlIHNob3VsZCBiZSB1cCB0byBkYXRlLCBzaW5jZSB3ZSBhZGRlZCB0aGUgY29tcHV0ZSBmbGFnc1xuICAgIFV0aWxzLmFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oIHRoaXMuYmFja2JvbmVJbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5tYXRyaXgsIHRoaXMuZG9tRWxlbWVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIG91ciBvcGFjaXR5IGFzIGRpcnR5LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25GaWx0ZXJEaXJ0eSgpIHtcbiAgICBpZiAoICF0aGlzLmZpbHRlckRpcnR5ICkge1xuICAgICAgdGhpcy5maWx0ZXJEaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyBvdXIgY2xpcCBhcyBkaXJ0eS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQ2xpcERpcnR5KCkge1xuICAgIGlmICggIXRoaXMuY2xpcERpcnR5ICkge1xuICAgICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XG4gICAqICAgICAgICAgICAgICAgICAgICAgIGJlIGRvbmUpLlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIC8vIFNlZSBpZiB3ZSBuZWVkIHRvIGFjdHVhbGx5IHVwZGF0ZSB0aGluZ3MgKHdpbGwgYmFpbCBvdXQgaWYgd2UgYXJlIG5vdCBkaXJ0eSwgb3IgaWYgd2UndmUgYmVlbiBkaXNwb3NlZClcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB3aGlsZSAoIHRoaXMuZGlydHlEcmF3YWJsZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKS51cGRhdGUoKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuZmlsdGVyRGlydHkgKSB7XG4gICAgICB0aGlzLmZpbHRlckRpcnR5ID0gZmFsc2U7XG5cbiAgICAgIGxldCBmaWx0ZXJTdHJpbmcgPSAnJztcblxuICAgICAgY29uc3QgbGVuID0gdGhpcy53YXRjaGVkRmlsdGVyTm9kZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLndhdGNoZWRGaWx0ZXJOb2Rlc1sgaSBdO1xuICAgICAgICBjb25zdCBvcGFjaXR5ID0gbm9kZS5nZXRFZmZlY3RpdmVPcGFjaXR5KCk7XG5cbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbm9kZS5fZmlsdGVycy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBmaWx0ZXJTdHJpbmcgKz0gYCR7ZmlsdGVyU3RyaW5nID8gJyAnIDogJyd9JHtub2RlLl9maWx0ZXJzWyBqIF0uZ2V0Q1NTRmlsdGVyU3RyaW5nKCl9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFwcGx5IG9wYWNpdHkgYWZ0ZXIgb3RoZXIgZWZmZWN0c1xuICAgICAgICBpZiAoIG9wYWNpdHkgIT09IDEgKSB7XG4gICAgICAgICAgZmlsdGVyU3RyaW5nICs9IGAke2ZpbHRlclN0cmluZyA/ICcgJyA6ICcnfW9wYWNpdHkoJHt0b1NWR051bWJlciggb3BhY2l0eSApfSlgO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5maWx0ZXIgPSBmaWx0ZXJTdHJpbmc7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlEaXJ0eSApIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gZmFsc2U7XG5cbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdGhpcy52aXNpYmxlID8gJycgOiAnbm9uZSc7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmNsaXBEaXJ0eSApIHtcbiAgICAgIHRoaXMuY2xpcERpcnR5ID0gZmFsc2U7XG5cbiAgICAgIC8vIHZhciBjbGlwID0gdGhpcy53aWxsQXBwbHlGaWx0ZXJzID8gdGhpcy5nZXRGaWx0ZXJDbGlwKCkgOiAnJztcblxuICAgICAgLy9PSFRXTyBUT0RPOiBDU1MgY2xpcC1wYXRoL21hc2sgc3VwcG9ydCBoZXJlLiBzZWUgaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvbWFza2luZy9hZG9iZS8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIC8vIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5jbGlwUGF0aCA9IGNsaXA7IC8vIHlpa2VzISB0ZW1wb3JhcnksIHNpbmNlIHdlIGFscmVhZHkgdGhyZXcgc29tZXRoaW5nP1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbWJpbmVkIHZpc2liaWxpdHkgb2Ygbm9kZXMgXCJhYm92ZSB1c1wiIHRoYXQgd2lsbCBuZWVkIHRvIGJlIHRha2VuIGludG8gYWNjb3VudCBmb3IgZGlzcGxheWluZyB0aGlzXG4gICAqIGJhY2tib25lLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgZ2V0RmlsdGVyVmlzaWJpbGl0eSgpIHtcbiAgICBjb25zdCBsZW4gPSB0aGlzLndhdGNoZWRGaWx0ZXJOb2Rlcy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBpZiAoICF0aGlzLndhdGNoZWRGaWx0ZXJOb2Rlc1sgaSBdLmlzVmlzaWJsZSgpICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tYmluZWQgY2xpcEFyZWEgKHN0cmluZz8/PykgZm9yIG5vZGVzIFwiYWJvdmUgdXNcIi5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0RmlsdGVyQ2xpcCgpIHtcbiAgICBjb25zdCBjbGlwID0gJyc7XG5cbiAgICAvL09IVFdPIFRPRE86IHByb3BlciBjbGlwcGluZyBzdXBwb3J0IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgLy8gdmFyIGxlbiA9IHRoaXMud2F0Y2hlZEZpbHRlck5vZGVzLmxlbmd0aDtcbiAgICAvLyBmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAvLyAgIGlmICggdGhpcy53YXRjaGVkRmlsdGVyTm9kZXNbaV0uY2xpcEFyZWEgKSB7XG4gICAgLy8gICAgIHRocm93IG5ldyBFcnJvciggJ2NsaXAtcGF0aCBmb3IgYmFja2JvbmVzIHVuaW1wbGVtZW50ZWQsIGFuZCB3aXRoIHF1ZXN0aW9uYWJsZSBicm93c2VyIHN1cHBvcnQhJyApO1xuICAgIC8vICAgfVxuICAgIC8vIH1cblxuICAgIHJldHVybiBjbGlwO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCB6LWluZGljZXMgYXJlIHN0cmljdGx5IGluY3JlYXNpbmcsIHdoaWxlIHRyeWluZyB0byBtaW5pbWl6ZSB0aGUgbnVtYmVyIG9mIHRpbWVzIHdlIG11c3QgY2hhbmdlIGl0XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHJlaW5kZXhCbG9ja3MoKSB7XG4gICAgLy8gZnVsbC1wYXNzIGNoYW5nZSBmb3IgemluZGV4LlxuICAgIGxldCB6SW5kZXggPSAwOyAvLyBkb24ndCBzdGFydCBiZWxvdyAxICh3ZSBlbnN1cmUgPiBpbiBsb29wKVxuICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaysrICkge1xuICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLmJsb2Nrc1sgayBdO1xuICAgICAgaWYgKCBibG9jay56SW5kZXggPD0gekluZGV4ICkge1xuICAgICAgICBjb25zdCBuZXdJbmRleCA9ICggayArIDEgPCB0aGlzLmJsb2Nrcy5sZW5ndGggJiYgdGhpcy5ibG9ja3NbIGsgKyAxIF0uekluZGV4IC0gMSA+IHpJbmRleCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLmNlaWwoICggekluZGV4ICsgdGhpcy5ibG9ja3NbIGsgKyAxIF0uekluZGV4ICkgLyAyICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIHpJbmRleCArIDIwO1xuXG4gICAgICAgIC8vIE5PVEU6IHRoaXMgc2hvdWxkIGdpdmUgaXQgaXRzIG93biBzdGFja2luZyBpbmRleCAod2hpY2ggaXMgd2hhdCB3ZSB3YW50KVxuICAgICAgICBibG9jay5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9IGJsb2NrLnpJbmRleCA9IG5ld0luZGV4O1xuICAgICAgfVxuICAgICAgekluZGV4ID0gYmxvY2suekluZGV4O1xuXG4gICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgYXNzZXJ0KCB0aGlzLmJsb2Nrc1sgayBdLnpJbmRleCAlIDEgPT09IDAsICd6LWluZGljZXMgc2hvdWxkIGJlIGludGVnZXJzJyApO1xuICAgICAgICBhc3NlcnQoIHRoaXMuYmxvY2tzWyBrIF0uekluZGV4ID4gMCwgJ3otaW5kaWNlcyBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIHplcm8gZm9yIG91ciBuZWVkcyAoc2VlIHNwZWMpJyApO1xuICAgICAgICBpZiAoIGsgPiAwICkge1xuICAgICAgICAgIGFzc2VydCggdGhpcy5ibG9ja3NbIGsgLSAxIF0uekluZGV4IDwgdGhpcy5ibG9ja3NbIGsgXS56SW5kZXgsICd6LWluZGljZXMgc2hvdWxkIGJlIHN0cmljdGx5IGluY3JlYXNpbmcnICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICB0aGlzLmxhc3RaSW5kZXggPSB6SW5kZXggKyAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0aXRjaGVzIG11bHRpcGxlIGNoYW5nZSBpbnRlcnZhbHMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gZmlyc3RDaGFuZ2VJbnRlcnZhbFxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBsYXN0Q2hhbmdlSW50ZXJ2YWxcbiAgICovXG4gIHN0aXRjaCggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKSB7XG4gICAgLy8gbm8gc3RpdGNoIG5lY2Vzc2FyeSBpZiB0aGVyZSBhcmUgbm8gY2hhbmdlIGludGVydmFsc1xuICAgIGlmICggZmlyc3RDaGFuZ2VJbnRlcnZhbCA9PT0gbnVsbCB8fCBsYXN0Q2hhbmdlSW50ZXJ2YWwgPT09IG51bGwgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdENoYW5nZUludGVydmFsID09PSBudWxsICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYXN0Q2hhbmdlSW50ZXJ2YWwgPT09IG51bGwgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYXN0Q2hhbmdlSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsID09PSBudWxsLCAnVGhpcyBhbGxvd3MgdXMgdG8gaGF2ZSBsZXNzIGNoZWNrcyBpbiB0aGUgbG9vcCcgKTtcblxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCApIHtcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoKCBgU3RpdGNoIGludGVydmFscyBiZWZvcmUgY29uc3RyaWN0aW5nOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgICBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIFN0aXRjaGVyLmRlYnVnSW50ZXJ2YWxzKCBmaXJzdENoYW5nZUludGVydmFsICk7XG4gICAgICBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgdGhlIGludGVydmFscyBhcyBzbWFsbCBhcyBwb3NzaWJsZSBieSBza2lwcGluZyBhcmVhcyB3aXRob3V0IGNoYW5nZXMsIGFuZCBjb2xsYXBzZSB0aGUgaW50ZXJ2YWxcbiAgICAvLyBsaW5rZWQgbGlzdFxuICAgIGxldCBsYXN0Tm9uZW1wdHlJbnRlcnZhbCA9IG51bGw7XG4gICAgbGV0IGludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICBsZXQgaW50ZXJ2YWxzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHdoaWxlICggaW50ZXJ2YWwgKSB7XG4gICAgICBpbnRlcnZhbHNDaGFuZ2VkID0gaW50ZXJ2YWwuY29uc3RyaWN0KCkgfHwgaW50ZXJ2YWxzQ2hhbmdlZDtcblxuICAgICAgaWYgKCBpbnRlcnZhbC5pc0VtcHR5KCkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGludGVydmFsc0NoYW5nZWQgKTtcblxuICAgICAgICBpZiAoIGxhc3ROb25lbXB0eUludGVydmFsICkge1xuICAgICAgICAgIC8vIHNraXAgaXQsIGhvb2sgdGhlIGNvcnJlY3QgcmVmZXJlbmNlXG4gICAgICAgICAgbGFzdE5vbmVtcHR5SW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gb3VyIGZpcnN0IG5vbi1lbXB0eSBpbnRlcnZhbCB3aWxsIGJlIG91ciBuZXcgZmlyc3RDaGFuZ2VJbnRlcnZhbFxuICAgICAgICBpZiAoICFsYXN0Tm9uZW1wdHlJbnRlcnZhbCApIHtcbiAgICAgICAgICBmaXJzdENoYW5nZUludGVydmFsID0gaW50ZXJ2YWw7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdE5vbmVtcHR5SW50ZXJ2YWwgPSBpbnRlcnZhbDtcbiAgICAgIH1cbiAgICAgIGludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuICAgIH1cblxuICAgIGlmICggIWxhc3ROb25lbXB0eUludGVydmFsICkge1xuICAgICAgLy8gZWVrLCBubyBub25lbXB0eSBjaGFuZ2UgaW50ZXJ2YWxzLiBkbyBub3RoaW5nIChnb29kIHRvIGNhdGNoIGhlcmUsIGJ1dCBpZGVhbGx5IHRoZXJlIHNob3VsZG4ndCBiZSBjaGFuZ2VcbiAgICAgIC8vIGludGVydmFscyB0aGF0IGFsbCBjb2xsYXBzZSkuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGFzdENoYW5nZUludGVydmFsID0gbGFzdE5vbmVtcHR5SW50ZXJ2YWw7XG4gICAgbGFzdENoYW5nZUludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG5cbiAgICBpZiAoIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgaW50ZXJ2YWxzQ2hhbmdlZCApIHtcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoKCBgU3RpdGNoIGludGVydmFscyBhZnRlciBjb25zdHJpY3Rpbmc6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICAgIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgICAgU3RpdGNoZXIuZGVidWdJbnRlcnZhbHMoIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgKTtcbiAgICAgIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuXG4gICAgaWYgKCBzY2VuZXJ5TG9nICYmIHNjZW5lcnkuaXNMb2dnaW5nUGVyZm9ybWFuY2UoKSApIHtcbiAgICAgIHRoaXMuZGlzcGxheS5wZXJmU3RpdGNoQ291bnQrKztcblxuICAgICAgbGV0IGRJbnRlcnZhbCA9IGZpcnN0Q2hhbmdlSW50ZXJ2YWw7XG5cbiAgICAgIHdoaWxlICggZEludGVydmFsICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkucGVyZkludGVydmFsQ291bnQrKztcblxuICAgICAgICB0aGlzLmRpc3BsYXkucGVyZkRyYXdhYmxlT2xkSW50ZXJ2YWxDb3VudCArPSBkSW50ZXJ2YWwuZ2V0T2xkSW50ZXJuYWxEcmF3YWJsZUNvdW50KCB0aGlzLnByZXZpb3VzRmlyc3REcmF3YWJsZSwgdGhpcy5wcmV2aW91c0xhc3REcmF3YWJsZSApO1xuICAgICAgICB0aGlzLmRpc3BsYXkucGVyZkRyYXdhYmxlTmV3SW50ZXJ2YWxDb3VudCArPSBkSW50ZXJ2YWwuZ2V0TmV3SW50ZXJuYWxEcmF3YWJsZUNvdW50KCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKTtcblxuICAgICAgICBkSW50ZXJ2YWwgPSBkSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RpdGNoZXIuc3RpdGNoKCB0aGlzLCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUsIHRoaXMucHJldmlvdXNGaXJzdERyYXdhYmxlLCB0aGlzLnByZXZpb3VzTGFzdERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGNoZWNrcyBvbiB0aGUgZHJhd2FibGUsIGJhc2VkIG9uIGNlcnRhaW4gZmxhZ3MuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dQZW5kaW5nQmxvY2tcbiAgICogQHBhcmFtIHtib29sZWFufSBhbGxvd1BlbmRpbmdMaXN0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWxsb3dEaXJ0eVxuICAgKi9cbiAgYXVkaXQoIGFsbG93UGVuZGluZ0Jsb2NrLCBhbGxvd1BlbmRpbmdMaXN0LCBhbGxvd0RpcnR5ICkge1xuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIHN1cGVyLmF1ZGl0KCBhbGxvd1BlbmRpbmdCbG9jaywgYWxsb3dQZW5kaW5nTGlzdCwgYWxsb3dEaXJ0eSApO1xuXG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMuYmFja2JvbmVJbnN0YW5jZS5pc0JhY2tib25lLCAnV2Ugc2hvdWxkIHJlZmVyZW5jZSBhbiBpbnN0YW5jZSB0aGF0IHJlcXVpcmVzIGEgYmFja2JvbmUnICk7XG4gICAgICBhc3NlcnRTbG93ICYmIGFzc2VydFNsb3coIHRoaXMudHJhbnNmb3JtUm9vdEluc3RhbmNlLmlzVHJhbnNmb3JtZWQsICdUcmFuc2Zvcm0gcm9vdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQnICk7XG5cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICB0aGlzLmJsb2Nrc1sgaSBdLmF1ZGl0KCBhbGxvd1BlbmRpbmdCbG9jaywgYWxsb3dQZW5kaW5nTGlzdCwgYWxsb3dEaXJ0eSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgYmFzZSBET00gZWxlbWVudCBmb3IgYSBiYWNrYm9uZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7SFRNTERpdkVsZW1lbnR9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlRGl2QmFja2JvbmUoKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBkaXYuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGRpdi5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGRpdi5zdHlsZS50b3AgPSAnMCc7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzAnO1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSAnMCc7XG4gICAgcmV0dXJuIGRpdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhbiBleHRlcm5hbCBlbGVtZW50LCB3ZSBhcHBseSB0aGUgbmVjZXNzYXJ5IHN0eWxlIHRvIG1ha2UgaXQgY29tcGF0aWJsZSBhcyBhIGJhY2tib25lIERPTSBlbGVtZW50LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSAtIEZvciBjaGFpbmluZ1xuICAgKi9cbiAgc3RhdGljIHJlcHVycG9zZUJhY2tib25lQ29udGFpbmVyKCBlbGVtZW50ICkge1xuICAgIGlmICggZWxlbWVudC5zdHlsZS5wb3NpdGlvbiAhPT0gJ3JlbGF0aXZlJyB8fCBlbGVtZW50LnN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICkge1xuICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgfVxuICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9ICcwJztcbiAgICBlbGVtZW50LnN0eWxlLnRvcCA9ICcwJztcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQmFja2JvbmVEcmF3YWJsZScsIEJhY2tib25lRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggQmFja2JvbmVEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZURyYXdhYmxlOyJdLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsImNsZWFuQXJyYXkiLCJQb29sYWJsZSIsIkRyYXdhYmxlIiwiR3JlZWR5U3RpdGNoZXIiLCJSZWJ1aWxkU3RpdGNoZXIiLCJzY2VuZXJ5IiwiU3RpdGNoZXIiLCJVdGlscyIsInVzZUdyZWVkeVN0aXRjaGVyIiwiQmFja2JvbmVEcmF3YWJsZSIsImluaXRpYWxpemUiLCJkaXNwbGF5IiwiYmFja2JvbmVJbnN0YW5jZSIsInRyYW5zZm9ybVJvb3RJbnN0YW5jZSIsInJlbmRlcmVyIiwiaXNEaXNwbGF5Um9vdCIsImZpbHRlclJvb3RBbmNlc3Rvckluc3RhbmNlIiwicGFyZW50IiwiZ2V0RmlsdGVyUm9vdEluc3RhbmNlIiwidHJhbnNmb3JtUm9vdEFuY2VzdG9ySW5zdGFuY2UiLCJnZXRUcmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJ3aWxsQXBwbHlUcmFuc2Zvcm0iLCJ3aWxsQXBwbHlGaWx0ZXJzIiwidHJhbnNmb3JtTGlzdGVuZXIiLCJtYXJrVHJhbnNmb3JtRGlydHkiLCJiaW5kIiwicmVsYXRpdmVUcmFuc2Zvcm0iLCJhZGRMaXN0ZW5lciIsImFkZFByZWNvbXB1dGUiLCJiYWNrYm9uZVZpc2liaWxpdHlMaXN0ZW5lciIsInVwZGF0ZUJhY2tib25lVmlzaWJpbGl0eSIsInJlbGF0aXZlVmlzaWJsZUVtaXR0ZXIiLCJ2aXNpYmlsaXR5RGlydHkiLCJkb21FbGVtZW50IiwiY3JlYXRlRGl2QmFja2JvbmUiLCJkaXJ0eURyYXdhYmxlcyIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJ3YXRjaGVkRmlsdGVyTm9kZXMiLCJmaWx0ZXJEaXJ0eSIsImNsaXBEaXJ0eSIsImZpbHRlckRpcnR5TGlzdGVuZXIiLCJvbkZpbHRlckRpcnR5IiwiY2xpcERpcnR5TGlzdGVuZXIiLCJvbkNsaXBEaXJ0eSIsImFzc2VydCIsInRyYWlsIiwibm9kZXMiLCJsZW5ndGgiLCJpbnN0YW5jZSIsIm5vZGUiLCJwdXNoIiwiZmlsdGVyQ2hhbmdlRW1pdHRlciIsImNsaXBBcmVhUHJvcGVydHkiLCJsYXp5TGluayIsImxhc3RaSW5kZXgiLCJibG9ja3MiLCJwcmV2aW91c0ZpcnN0RHJhd2FibGUiLCJwcmV2aW91c0xhc3REcmF3YWJsZSIsInJlbW92ZWREcmF3YWJsZXMiLCJzdGl0Y2hlciIsInNjZW5lcnlMb2ciLCJ0b1N0cmluZyIsImRpc3Bvc2UiLCJwb3AiLCJyZW1vdmVMaXN0ZW5lciIsInVubGluayIsImQiLCJuZXh0RHJhd2FibGUiLCJwYXJlbnREcmF3YWJsZSIsInJlbW92ZURyYXdhYmxlIiwibWFya0Jsb2Nrc0ZvckRpc3Bvc2FsIiwicmVtb3ZlUHJlY29tcHV0ZSIsImJsb2NrIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwibWFya0ZvckRpc3Bvc2FsIiwidmlzaWJsZSIsInJlbGF0aXZlVmlzaWJsZSIsIm1hcmtEaXJ0eSIsIm9sZE5leHREcmF3YWJsZSIsIm5vdGVQZW5kaW5nUmVtb3ZhbCIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZHJhd2FibGUiLCJlbnN1cmVOb3RQYWludGluZyIsImFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0iLCJtYXRyaXgiLCJ1cGRhdGUiLCJmaWx0ZXJTdHJpbmciLCJsZW4iLCJpIiwib3BhY2l0eSIsImdldEVmZmVjdGl2ZU9wYWNpdHkiLCJqIiwiX2ZpbHRlcnMiLCJnZXRDU1NGaWx0ZXJTdHJpbmciLCJzdHlsZSIsImZpbHRlciIsImdldEZpbHRlclZpc2liaWxpdHkiLCJpc1Zpc2libGUiLCJnZXRGaWx0ZXJDbGlwIiwiY2xpcCIsInJlaW5kZXhCbG9ja3MiLCJ6SW5kZXgiLCJrIiwibmV3SW5kZXgiLCJNYXRoIiwiY2VpbCIsInN0aXRjaCIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwibmV4dENoYW5nZUludGVydmFsIiwiU3RpdGNoIiwiZGVidWdJbnRlcnZhbHMiLCJsYXN0Tm9uZW1wdHlJbnRlcnZhbCIsImludGVydmFsIiwiaW50ZXJ2YWxzQ2hhbmdlZCIsImNvbnN0cmljdCIsImlzRW1wdHkiLCJpc0xvZ2dpbmdQZXJmb3JtYW5jZSIsInBlcmZTdGl0Y2hDb3VudCIsImRJbnRlcnZhbCIsInBlcmZJbnRlcnZhbENvdW50IiwicGVyZkRyYXdhYmxlT2xkSW50ZXJ2YWxDb3VudCIsImdldE9sZEludGVybmFsRHJhd2FibGVDb3VudCIsInBlcmZEcmF3YWJsZU5ld0ludGVydmFsQ291bnQiLCJnZXROZXdJbnRlcm5hbERyYXdhYmxlQ291bnQiLCJhdWRpdCIsImFsbG93UGVuZGluZ0Jsb2NrIiwiYWxsb3dQZW5kaW5nTGlzdCIsImFsbG93RGlydHkiLCJhc3NlcnRTbG93IiwiaXNCYWNrYm9uZSIsImlzVHJhbnNmb3JtZWQiLCJkaXYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJ3aWR0aCIsImhlaWdodCIsInJlcHVycG9zZUJhY2tib25lQ29udGFpbmVyIiwiZWxlbWVudCIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxpQkFBaUIsaUNBQWlDO0FBQ3pELE9BQU9DLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0MsUUFBUSxFQUFFQyxjQUFjLEVBQUVDLGVBQWUsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLEtBQUssUUFBUSxnQkFBZ0I7QUFFcEcsWUFBWTtBQUNaLE1BQU1DLG9CQUFvQjtBQUUxQixJQUFBLEFBQU1DLG1CQUFOLE1BQU1BLHlCQUF5QlA7SUFrQjdCOzs7Ozs7OztHQVFDLEdBQ0RRLFdBQVlDLE9BQU8sRUFBRUMsZ0JBQWdCLEVBQUVDLHFCQUFxQixFQUFFQyxRQUFRLEVBQUVDLGFBQWEsRUFBRztRQUN0RixLQUFLLENBQUNMLFdBQVlJO1FBRWxCLElBQUksQ0FBQ0gsT0FBTyxHQUFHQTtRQUVmLDZFQUE2RTtRQUM3RSxJQUFJLENBQUNDLGdCQUFnQixHQUFHQTtRQUV4Qiw2RUFBNkU7UUFDN0UsSUFBSSxDQUFDQyxxQkFBcUIsR0FBR0E7UUFFN0IsbUhBQW1IO1FBQ25ILDJCQUEyQjtRQUMzQixJQUFJLENBQUNHLDBCQUEwQixHQUFHSixpQkFBaUJLLE1BQU0sR0FBR0wsaUJB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