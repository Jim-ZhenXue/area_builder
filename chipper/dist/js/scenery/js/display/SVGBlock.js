// Copyright 2013-2024, University of Colorado Boulder
/**
 * Handles a visual SVG layer of drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dotRandom from '../../../dot/js/dotRandom.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { CountMap, FittedBlock, scenery, SVGGroup, svgns, Utils } from '../imports.js';
let SVGBlock = class SVGBlock extends FittedBlock {
    /**
   * @public
   *
   * @param {Display} display - the scenery Display this SVGBlock will appear in
   * @param {number} renderer - the bitmask for the renderer, see Renderer.js
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {Instance} filterRootInstance - All filters (visibility/opacity/filters) of this instance and its ancestors
   *                                        will already have been applied. This block will only be responsible for
   *                                        applying filters of this instance's descendants.
   * @returns {FittedBlock}
   */ initialize(display, renderer, transformRootInstance, filterRootInstance) {
        super.initialize(display, renderer, transformRootInstance, FittedBlock.COMMON_ANCESTOR);
        // @public {Instance}
        this.filterRootInstance = filterRootInstance;
        // @private {Array.<SVGGradient>}
        this.dirtyGradients = cleanArray(this.dirtyGradients);
        // @private {Array.<SVGGroup>}
        this.dirtyGroups = cleanArray(this.dirtyGroups);
        // @private {Array.<Drawable>}
        this.dirtyDrawables = cleanArray(this.dirtyDrawables);
        // @private {CountMap.<Paint,SVGGradient|SVGPattern>}
        this.paintCountMap = this.paintCountMap || new CountMap(this.onAddPaint.bind(this), this.onRemovePaint.bind(this));
        // @private {boolean} - Tracks whether we have no dirty objects that would require cleanup or releases
        this.areReferencesReduced = true;
        if (!this.domElement) {
            // main SVG element
            this.svg = document.createElementNS(svgns, 'svg');
            this.svg.style.pointerEvents = 'none';
            this.svg.style.position = 'absolute';
            this.svg.style.left = '0';
            this.svg.style.top = '0';
            // pdom - make sure the element is not focusable (it is focusable by default in IE11 full screen mode)
            this.svg.setAttribute('focusable', false);
            // @public {SVGDefsElement} - the <defs> block that we will be stuffing gradients and patterns into
            this.defs = document.createElementNS(svgns, 'defs');
            this.svg.appendChild(this.defs);
            this.baseTransformGroup = document.createElementNS(svgns, 'g');
            this.svg.appendChild(this.baseTransformGroup);
            this.domElement = this.svg;
        }
        // Forces SVG elements to be refreshed every frame, which can force repainting and detect (or potentially in some
        // cases work around) SVG rendering browser bugs. See https://github.com/phetsims/scenery/issues/1507
        // @private {function} - Forces a color change on the 0x0 rect
        this.forceRefreshListener = ()=>{
            // Lazily add this, so we're not incurring any performance penalties until we actually need it
            if (!this.workaroundRect) {
                const workaroundGroup = document.createElementNS(svgns, 'g');
                this.svg.appendChild(workaroundGroup);
                this.workaroundRect = document.createElementNS(svgns, 'rect');
                this.workaroundRect.setAttribute('width', '0');
                this.workaroundRect.setAttribute('height', '0');
                this.workaroundRect.setAttribute('fill', 'none');
                workaroundGroup.appendChild(this.workaroundRect);
            }
            const red = dotRandom.nextIntBetween(0, 255);
            const green = dotRandom.nextIntBetween(0, 255);
            const blue = dotRandom.nextIntBetween(0, 255);
            this.workaroundRect.setAttribute('fill', `rgba(${red},${green},${blue},0.02)`);
        };
        this.display._refreshSVGEmitter.addListener(this.forceRefreshListener);
        // reset what layer fitting can do
        Utils.prepareForTransform(this.svg); // Apply CSS needed for future CSS transforms to work properly.
        Utils.unsetTransform(this.svg); // clear out any transforms that could have been previously applied
        this.baseTransformGroup.setAttribute('transform', ''); // no base transform
        const instanceClosestToRoot = transformRootInstance.trail.nodes.length > filterRootInstance.trail.nodes.length ? filterRootInstance : transformRootInstance;
        this.rootGroup = SVGGroup.createFromPool(this, instanceClosestToRoot, null);
        this.baseTransformGroup.appendChild(this.rootGroup.svgGroup);
        // TODO: dirty list of nodes (each should go dirty only once, easier than scanning all?) https://github.com/phetsims/scenery/issues/1581
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`initialized #${this.id}`);
        return this;
    }
    /**
   * Callback for paintCountMap's create
   * @private
   *
   * @param {Paint} paint
   * @returns {SVGGradient|SVGPattern}
   */ onAddPaint(paint) {
        const svgPaint = paint.createSVGPaint(this);
        svgPaint.definition.setAttribute('id', `${paint.id}-${this.id}`);
        this.defs.appendChild(svgPaint.definition);
        return svgPaint;
    }
    /**
   * Callback for paintCountMap's destroy
   * @private
   *
   * @param {Paint} paint
   * @param {SVGGradient|SVGPattern} svgPaint
   */ onRemovePaint(paint, svgPaint) {
        this.defs.removeChild(svgPaint.definition);
        svgPaint.dispose();
    }
    /*
   * Increases our reference count for the specified {Paint}. If it didn't exist before, we'll add the SVG def to the
   * paint can be referenced by SVG id.
   * @public
   *
   * @param {Paint} paint
   */ incrementPaint(paint) {
        assert && assert(paint.isPaint);
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`incrementPaint ${this} ${paint}`);
        this.paintCountMap.increment(paint);
    }
    /*
   * Decreases our reference count for the specified {Paint}. If this was the last reference, we'll remove the SVG def
   * from our SVG tree to prevent memory leaks, etc.
   * @public
   *
   * @param {Paint} paint
   */ decrementPaint(paint) {
        assert && assert(paint.isPaint);
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`decrementPaint ${this} ${paint}`);
        this.paintCountMap.decrement(paint);
    }
    /**
   * @public
   *
   * @param {SVGGradient} gradient
   */ markDirtyGradient(gradient) {
        this.dirtyGradients.push(gradient);
        this.markDirty();
    }
    /**
   * @public
   *
   * @param {Block} block
   */ markDirtyGroup(block) {
        this.dirtyGroups.push(block);
        this.markDirty();
        if (this.areReferencesReduced) {
            this.display.markForReducedReferences(this);
        }
        this.areReferencesReduced = false;
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ markDirtyDrawable(drawable) {
        sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on SVGBlock#${this.id} with ${drawable.toString()}`);
        this.dirtyDrawables.push(drawable);
        this.markDirty();
        if (this.areReferencesReduced) {
            this.display.markForReducedReferences(this);
        }
        this.areReferencesReduced = false;
    }
    /**
   * @public
   * @override
   */ setSizeFullDisplay() {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`setSizeFullDisplay #${this.id}`);
        this.baseTransformGroup.removeAttribute('transform');
        Utils.unsetTransform(this.svg);
        const size = this.display.getSize();
        this.svg.setAttribute('width', size.width);
        this.svg.setAttribute('height', size.height);
    }
    /**
   * @public
   * @override
   */ setSizeFitBounds() {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`setSizeFitBounds #${this.id} with ${this.fitBounds.toString()}`);
        const x = this.fitBounds.minX;
        const y = this.fitBounds.minY;
        assert && assert(isFinite(x) && isFinite(y), 'Invalid SVG transform for SVGBlock');
        assert && assert(this.fitBounds.isValid(), 'Invalid fitBounds');
        this.baseTransformGroup.setAttribute('transform', `translate(${-x},${-y})`); // subtract off so we have a tight fit
        Utils.setTransform(`matrix(1,0,0,1,${x},${y})`, this.svg); // reapply the translation as a CSS transform
        this.svg.setAttribute('width', this.fitBounds.width);
        this.svg.setAttribute('height', this.fitBounds.height);
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
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`update #${this.id}`);
        while(this.dirtyGroups.length){
            const group = this.dirtyGroups.pop();
            // If this group has been disposed or moved to another block, don't mess with it.
            // We don't scan through dirtyGroups when we update which group is assigned to which block (for performance
            // reasons), so we need to check here to make sure it is still "attached" to this block.
            if (group.block === this) {
                group.update();
            }
        }
        while(this.dirtyGradients.length){
            // It is safe enough to update gradients regardless of the block they are in.
            this.dirtyGradients.pop().update();
        }
        while(this.dirtyDrawables.length){
            const drawable = this.dirtyDrawables.pop();
            // If this drawable has been disposed or moved to another block, don't mess with it.
            // We don't scan through dirtyDrawables when we update which drawable is assigned to which block (for performance
            // reasons), so we need to check here to make sure it is still "attached" to this block.
            if (drawable.parentDrawable === this) {
                drawable.update();
            }
        }
        this.areReferencesReduced = true; // Once we've iterated through things, we've automatically reduced our references.
        // checks will be done in updateFit() to see whether it is needed
        this.updateFit();
        return true;
    }
    /**
   * Looks to remove dirty objects that may have been disposed.
   * See https://github.com/phetsims/energy-forms-and-changes/issues/356
   * @public
   *
   * @public
   */ reduceReferences() {
        // no-op if we had an update first
        if (this.areReferencesReduced) {
            return;
        }
        // Attempts to do this in a high-performance way, where we're not shifting array contents around (so we'll do this
        // in one scan).
        let inspectionIndex = 0;
        let replacementIndex = 0;
        while(inspectionIndex < this.dirtyGroups.length){
            const group = this.dirtyGroups[inspectionIndex];
            // Only keep things that reference our block.
            if (group.block === this) {
                // If the indices are the same, don't do the operation
                if (replacementIndex !== inspectionIndex) {
                    this.dirtyGroups[replacementIndex] = group;
                }
                replacementIndex++;
            }
            inspectionIndex++;
        }
        // Our array should be only that length now
        while(this.dirtyGroups.length > replacementIndex){
            this.dirtyGroups.pop();
        }
        // Do a similar thing with dirtyDrawables (not optimized out because for right now we want to maximize performance).
        inspectionIndex = 0;
        replacementIndex = 0;
        while(inspectionIndex < this.dirtyDrawables.length){
            const drawable = this.dirtyDrawables[inspectionIndex];
            // Only keep things that reference our block as the parentDrawable.
            if (drawable.parentDrawable === this) {
                // If the indices are the same, don't do the operation
                if (replacementIndex !== inspectionIndex) {
                    this.dirtyDrawables[replacementIndex] = drawable;
                }
                replacementIndex++;
            }
            inspectionIndex++;
        }
        // Our array should be only that length now
        while(this.dirtyDrawables.length > replacementIndex){
            this.dirtyDrawables.pop();
        }
        this.areReferencesReduced = true;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`dispose #${this.id}`);
        // make it take up zero area, so that we don't use up excess memory
        this.svg.setAttribute('width', '0');
        this.svg.setAttribute('height', '0');
        // clear references
        this.filterRootInstance = null;
        cleanArray(this.dirtyGradients);
        cleanArray(this.dirtyGroups);
        cleanArray(this.dirtyDrawables);
        this.paintCountMap.clear();
        this.display._refreshSVGEmitter.removeListener(this.forceRefreshListener);
        this.baseTransformGroup.removeChild(this.rootGroup.svgGroup);
        this.rootGroup.dispose();
        this.rootGroup = null;
        // since we may not properly remove all defs yet
        while(this.defs.childNodes.length){
            this.defs.removeChild(this.defs.childNodes[0]);
        }
        super.dispose();
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ addDrawable(drawable) {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
        super.addDrawable(drawable);
        SVGGroup.addDrawable(this, drawable);
        drawable.updateSVGBlock(this);
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
        SVGGroup.removeDrawable(this, drawable);
        super.removeDrawable(drawable);
    // NOTE: we don't unset the drawable's defs here, since it will either be disposed (will clear it)
    // or will be added to another SVGBlock (which will overwrite it)
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ onIntervalChange(firstDrawable, lastDrawable) {
        sceneryLog && sceneryLog.SVGBlock && sceneryLog.SVGBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
        super.onIntervalChange(firstDrawable, lastDrawable);
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `SVGBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
    }
    /**
   * @mixes Poolable
   *
   * @param {Display} display - the scenery Display this SVGBlock will appear in
   * @param {number} renderer - the bitmask for the renderer, see Renderer.js
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {Instance} filterRootInstance - All filters (visibility/opacity/filters) of this instance and its ancestors
   *                                        will already have been applied. This block will only be responsible for
   *                                        applying filters of this instance's descendants.
   */ constructor(display, renderer, transformRootInstance, filterRootInstance){
        super();
        this.initialize(display, renderer, transformRootInstance, filterRootInstance);
    }
};
scenery.register('SVGBlock', SVGBlock);
Poolable.mixInto(SVGBlock);
export default SVGBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdCbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIYW5kbGVzIGEgdmlzdWFsIFNWRyBsYXllciBvZiBkcmF3YWJsZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IENvdW50TWFwLCBGaXR0ZWRCbG9jaywgc2NlbmVyeSwgU1ZHR3JvdXAsIHN2Z25zLCBVdGlscyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBTVkdCbG9jayBleHRlbmRzIEZpdHRlZEJsb2NrIHtcbiAgLyoqXG4gICAqIEBtaXhlcyBQb29sYWJsZVxuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXkgLSB0aGUgc2NlbmVyeSBEaXNwbGF5IHRoaXMgU1ZHQmxvY2sgd2lsbCBhcHBlYXIgaW5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gdGhlIGJpdG1hc2sgZm9yIHRoZSByZW5kZXJlciwgc2VlIFJlbmRlcmVyLmpzXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZSAtIEFsbCB0cmFuc2Zvcm1zIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnMgd2lsbCBhbHJlYWR5IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3IgYXBwbHlpbmcgdHJhbnNmb3JtcyBvZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIEFsbCBmaWx0ZXJzICh2aXNpYmlsaXR5L29wYWNpdHkvZmlsdGVycykgb2YgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9yc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGFscmVhZHkgaGF2ZSBiZWVuIGFwcGxpZWQuIFRoaXMgYmxvY2sgd2lsbCBvbmx5IGJlIHJlc3BvbnNpYmxlIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseWluZyBmaWx0ZXJzIG9mIHRoaXMgaW5zdGFuY2UncyBkZXNjZW5kYW50cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBmaWx0ZXJSb290SW5zdGFuY2UgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXkgLSB0aGUgc2NlbmVyeSBEaXNwbGF5IHRoaXMgU1ZHQmxvY2sgd2lsbCBhcHBlYXIgaW5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gdGhlIGJpdG1hc2sgZm9yIHRoZSByZW5kZXJlciwgc2VlIFJlbmRlcmVyLmpzXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZSAtIEFsbCB0cmFuc2Zvcm1zIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnMgd2lsbCBhbHJlYWR5IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3IgYXBwbHlpbmcgdHJhbnNmb3JtcyBvZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIEFsbCBmaWx0ZXJzICh2aXNpYmlsaXR5L29wYWNpdHkvZmlsdGVycykgb2YgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9yc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGFscmVhZHkgaGF2ZSBiZWVuIGFwcGxpZWQuIFRoaXMgYmxvY2sgd2lsbCBvbmx5IGJlIHJlc3BvbnNpYmxlIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseWluZyBmaWx0ZXJzIG9mIHRoaXMgaW5zdGFuY2UncyBkZXNjZW5kYW50cy5cbiAgICogQHJldHVybnMge0ZpdHRlZEJsb2NrfVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIEZpdHRlZEJsb2NrLkNPTU1PTl9BTkNFU1RPUiApO1xuXG4gICAgLy8gQHB1YmxpYyB7SW5zdGFuY2V9XG4gICAgdGhpcy5maWx0ZXJSb290SW5zdGFuY2UgPSBmaWx0ZXJSb290SW5zdGFuY2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFNWR0dyYWRpZW50Pn1cbiAgICB0aGlzLmRpcnR5R3JhZGllbnRzID0gY2xlYW5BcnJheSggdGhpcy5kaXJ0eUdyYWRpZW50cyApO1xuXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxTVkdHcm91cD59XG4gICAgdGhpcy5kaXJ0eUdyb3VwcyA9IGNsZWFuQXJyYXkoIHRoaXMuZGlydHlHcm91cHMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48RHJhd2FibGU+fVxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5RHJhd2FibGVzICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Q291bnRNYXAuPFBhaW50LFNWR0dyYWRpZW50fFNWR1BhdHRlcm4+fVxuICAgIHRoaXMucGFpbnRDb3VudE1hcCA9IHRoaXMucGFpbnRDb3VudE1hcCB8fCBuZXcgQ291bnRNYXAoXG4gICAgICB0aGlzLm9uQWRkUGFpbnQuYmluZCggdGhpcyApLFxuICAgICAgdGhpcy5vblJlbW92ZVBhaW50LmJpbmQoIHRoaXMgKVxuICAgICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBUcmFja3Mgd2hldGhlciB3ZSBoYXZlIG5vIGRpcnR5IG9iamVjdHMgdGhhdCB3b3VsZCByZXF1aXJlIGNsZWFudXAgb3IgcmVsZWFzZXNcbiAgICB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkID0gdHJ1ZTtcblxuICAgIGlmICggIXRoaXMuZG9tRWxlbWVudCApIHtcblxuICAgICAgLy8gbWFpbiBTVkcgZWxlbWVudFxuICAgICAgdGhpcy5zdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3ZnJyApO1xuICAgICAgdGhpcy5zdmcuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgIHRoaXMuc3ZnLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMuc3ZnLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICB0aGlzLnN2Zy5zdHlsZS50b3AgPSAnMCc7XG5cbiAgICAgIC8vIHBkb20gLSBtYWtlIHN1cmUgdGhlIGVsZW1lbnQgaXMgbm90IGZvY3VzYWJsZSAoaXQgaXMgZm9jdXNhYmxlIGJ5IGRlZmF1bHQgaW4gSUUxMSBmdWxsIHNjcmVlbiBtb2RlKVxuICAgICAgdGhpcy5zdmcuc2V0QXR0cmlidXRlKCAnZm9jdXNhYmxlJywgZmFsc2UgKTtcblxuICAgICAgLy8gQHB1YmxpYyB7U1ZHRGVmc0VsZW1lbnR9IC0gdGhlIDxkZWZzPiBibG9jayB0aGF0IHdlIHdpbGwgYmUgc3R1ZmZpbmcgZ3JhZGllbnRzIGFuZCBwYXR0ZXJucyBpbnRvXG4gICAgICB0aGlzLmRlZnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnZGVmcycgKTtcbiAgICAgIHRoaXMuc3ZnLmFwcGVuZENoaWxkKCB0aGlzLmRlZnMgKTtcblxuICAgICAgdGhpcy5iYXNlVHJhbnNmb3JtR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnZycgKTtcbiAgICAgIHRoaXMuc3ZnLmFwcGVuZENoaWxkKCB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cCApO1xuXG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLnN2ZztcbiAgICB9XG5cbiAgICAvLyBGb3JjZXMgU1ZHIGVsZW1lbnRzIHRvIGJlIHJlZnJlc2hlZCBldmVyeSBmcmFtZSwgd2hpY2ggY2FuIGZvcmNlIHJlcGFpbnRpbmcgYW5kIGRldGVjdCAob3IgcG90ZW50aWFsbHkgaW4gc29tZVxuICAgIC8vIGNhc2VzIHdvcmsgYXJvdW5kKSBTVkcgcmVuZGVyaW5nIGJyb3dzZXIgYnVncy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTA3XG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIEZvcmNlcyBhIGNvbG9yIGNoYW5nZSBvbiB0aGUgMHgwIHJlY3RcbiAgICB0aGlzLmZvcmNlUmVmcmVzaExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgLy8gTGF6aWx5IGFkZCB0aGlzLCBzbyB3ZSdyZSBub3QgaW5jdXJyaW5nIGFueSBwZXJmb3JtYW5jZSBwZW5hbHRpZXMgdW50aWwgd2UgYWN0dWFsbHkgbmVlZCBpdFxuICAgICAgaWYgKCAhdGhpcy53b3JrYXJvdW5kUmVjdCApIHtcbiAgICAgICAgY29uc3Qgd29ya2Fyb3VuZEdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2cnICk7XG4gICAgICAgIHRoaXMuc3ZnLmFwcGVuZENoaWxkKCB3b3JrYXJvdW5kR3JvdXAgKTtcblxuICAgICAgICB0aGlzLndvcmthcm91bmRSZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3JlY3QnICk7XG4gICAgICAgIHRoaXMud29ya2Fyb3VuZFJlY3Quc2V0QXR0cmlidXRlKCAnd2lkdGgnLCAnMCcgKTtcbiAgICAgICAgdGhpcy53b3JrYXJvdW5kUmVjdC5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCAnMCcgKTtcbiAgICAgICAgdGhpcy53b3JrYXJvdW5kUmVjdC5zZXRBdHRyaWJ1dGUoICdmaWxsJywgJ25vbmUnICk7XG4gICAgICAgIHdvcmthcm91bmRHcm91cC5hcHBlbmRDaGlsZCggdGhpcy53b3JrYXJvdW5kUmVjdCApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZWQgPSBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIDAsIDI1NSApO1xuICAgICAgY29uc3QgZ3JlZW4gPSBkb3RSYW5kb20ubmV4dEludEJldHdlZW4oIDAsIDI1NSApO1xuICAgICAgY29uc3QgYmx1ZSA9IGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggMCwgMjU1ICk7XG4gICAgICB0aGlzLndvcmthcm91bmRSZWN0LnNldEF0dHJpYnV0ZSggJ2ZpbGwnLCBgcmdiYSgke3JlZH0sJHtncmVlbn0sJHtibHVlfSwwLjAyKWAgKTtcbiAgICB9O1xuICAgIHRoaXMuZGlzcGxheS5fcmVmcmVzaFNWR0VtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuZm9yY2VSZWZyZXNoTGlzdGVuZXIgKTtcblxuICAgIC8vIHJlc2V0IHdoYXQgbGF5ZXIgZml0dGluZyBjYW4gZG9cbiAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCB0aGlzLnN2ZyApOyAvLyBBcHBseSBDU1MgbmVlZGVkIGZvciBmdXR1cmUgQ1NTIHRyYW5zZm9ybXMgdG8gd29yayBwcm9wZXJseS5cblxuICAgIFV0aWxzLnVuc2V0VHJhbnNmb3JtKCB0aGlzLnN2ZyApOyAvLyBjbGVhciBvdXQgYW55IHRyYW5zZm9ybXMgdGhhdCBjb3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBhcHBsaWVkXG4gICAgdGhpcy5iYXNlVHJhbnNmb3JtR3JvdXAuc2V0QXR0cmlidXRlKCAndHJhbnNmb3JtJywgJycgKTsgLy8gbm8gYmFzZSB0cmFuc2Zvcm1cblxuICAgIGNvbnN0IGluc3RhbmNlQ2xvc2VzdFRvUm9vdCA9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZS50cmFpbC5ub2Rlcy5sZW5ndGggPiBmaWx0ZXJSb290SW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJSb290SW5zdGFuY2UgOiB0cmFuc2Zvcm1Sb290SW5zdGFuY2U7XG5cbiAgICB0aGlzLnJvb3RHcm91cCA9IFNWR0dyb3VwLmNyZWF0ZUZyb21Qb29sKCB0aGlzLCBpbnN0YW5jZUNsb3Nlc3RUb1Jvb3QsIG51bGwgKTtcbiAgICB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cC5hcHBlbmRDaGlsZCggdGhpcy5yb290R3JvdXAuc3ZnR3JvdXAgKTtcblxuICAgIC8vIFRPRE86IGRpcnR5IGxpc3Qgb2Ygbm9kZXMgKGVhY2ggc2hvdWxkIGdvIGRpcnR5IG9ubHkgb25jZSwgZWFzaWVyIHRoYW4gc2Nhbm5pbmcgYWxsPykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgaW5pdGlhbGl6ZWQgIyR7dGhpcy5pZH1gICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3IgcGFpbnRDb3VudE1hcCdzIGNyZWF0ZVxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1BhaW50fSBwYWludFxuICAgKiBAcmV0dXJucyB7U1ZHR3JhZGllbnR8U1ZHUGF0dGVybn1cbiAgICovXG4gIG9uQWRkUGFpbnQoIHBhaW50ICkge1xuICAgIGNvbnN0IHN2Z1BhaW50ID0gcGFpbnQuY3JlYXRlU1ZHUGFpbnQoIHRoaXMgKTtcbiAgICBzdmdQYWludC5kZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ2lkJywgYCR7cGFpbnQuaWR9LSR7dGhpcy5pZH1gICk7XG4gICAgdGhpcy5kZWZzLmFwcGVuZENoaWxkKCBzdmdQYWludC5kZWZpbml0aW9uICk7XG5cbiAgICByZXR1cm4gc3ZnUGFpbnQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIHBhaW50Q291bnRNYXAncyBkZXN0cm95XG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7UGFpbnR9IHBhaW50XG4gICAqIEBwYXJhbSB7U1ZHR3JhZGllbnR8U1ZHUGF0dGVybn0gc3ZnUGFpbnRcbiAgICovXG4gIG9uUmVtb3ZlUGFpbnQoIHBhaW50LCBzdmdQYWludCApIHtcbiAgICB0aGlzLmRlZnMucmVtb3ZlQ2hpbGQoIHN2Z1BhaW50LmRlZmluaXRpb24gKTtcbiAgICBzdmdQYWludC5kaXNwb3NlKCk7XG4gIH1cblxuICAvKlxuICAgKiBJbmNyZWFzZXMgb3VyIHJlZmVyZW5jZSBjb3VudCBmb3IgdGhlIHNwZWNpZmllZCB7UGFpbnR9LiBJZiBpdCBkaWRuJ3QgZXhpc3QgYmVmb3JlLCB3ZSdsbCBhZGQgdGhlIFNWRyBkZWYgdG8gdGhlXG4gICAqIHBhaW50IGNhbiBiZSByZWZlcmVuY2VkIGJ5IFNWRyBpZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1BhaW50fSBwYWludFxuICAgKi9cbiAgaW5jcmVtZW50UGFpbnQoIHBhaW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhaW50LmlzUGFpbnQgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBpbmNyZW1lbnRQYWludCAke3RoaXN9ICR7cGFpbnR9YCApO1xuXG4gICAgdGhpcy5wYWludENvdW50TWFwLmluY3JlbWVudCggcGFpbnQgKTtcbiAgfVxuXG4gIC8qXG4gICAqIERlY3JlYXNlcyBvdXIgcmVmZXJlbmNlIGNvdW50IGZvciB0aGUgc3BlY2lmaWVkIHtQYWludH0uIElmIHRoaXMgd2FzIHRoZSBsYXN0IHJlZmVyZW5jZSwgd2UnbGwgcmVtb3ZlIHRoZSBTVkcgZGVmXG4gICAqIGZyb20gb3VyIFNWRyB0cmVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLCBldGMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtQYWludH0gcGFpbnRcbiAgICovXG4gIGRlY3JlbWVudFBhaW50KCBwYWludCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYWludC5pc1BhaW50ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgZGVjcmVtZW50UGFpbnQgJHt0aGlzfSAke3BhaW50fWAgKTtcblxuICAgIHRoaXMucGFpbnRDb3VudE1hcC5kZWNyZW1lbnQoIHBhaW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR0dyYWRpZW50fSBncmFkaWVudFxuICAgKi9cbiAgbWFya0RpcnR5R3JhZGllbnQoIGdyYWRpZW50ICkge1xuICAgIHRoaXMuZGlydHlHcmFkaWVudHMucHVzaCggZ3JhZGllbnQgKTtcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcbiAgICovXG4gIG1hcmtEaXJ0eUdyb3VwKCBibG9jayApIHtcbiAgICB0aGlzLmRpcnR5R3JvdXBzLnB1c2goIGJsb2NrICk7XG4gICAgdGhpcy5tYXJrRGlydHkoKTtcblxuICAgIGlmICggdGhpcy5hcmVSZWZlcmVuY2VzUmVkdWNlZCApIHtcbiAgICAgIHRoaXMuZGlzcGxheS5tYXJrRm9yUmVkdWNlZFJlZmVyZW5jZXMoIHRoaXMgKTtcbiAgICB9XG4gICAgdGhpcy5hcmVSZWZlcmVuY2VzUmVkdWNlZCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIG1hcmtEaXJ0eURyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuZGlydHkgJiYgc2NlbmVyeUxvZy5kaXJ0eSggYG1hcmtEaXJ0eURyYXdhYmxlIG9uIFNWR0Jsb2NrIyR7dGhpcy5pZH0gd2l0aCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMucHVzaCggZHJhd2FibGUgKTtcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuXG4gICAgaWYgKCB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkICkge1xuICAgICAgdGhpcy5kaXNwbGF5Lm1hcmtGb3JSZWR1Y2VkUmVmZXJlbmNlcyggdGhpcyApO1xuICAgIH1cbiAgICB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHNldFNpemVGdWxsRGlzcGxheSgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYHNldFNpemVGdWxsRGlzcGxheSAjJHt0aGlzLmlkfWAgKTtcblxuICAgIHRoaXMuYmFzZVRyYW5zZm9ybUdyb3VwLnJlbW92ZUF0dHJpYnV0ZSggJ3RyYW5zZm9ybScgKTtcbiAgICBVdGlscy51bnNldFRyYW5zZm9ybSggdGhpcy5zdmcgKTtcblxuICAgIGNvbnN0IHNpemUgPSB0aGlzLmRpc3BsYXkuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSggJ3dpZHRoJywgc2l6ZS53aWR0aCApO1xuICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIHNpemUuaGVpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHNldFNpemVGaXRCb3VuZHMoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2soIGBzZXRTaXplRml0Qm91bmRzICMke3RoaXMuaWR9IHdpdGggJHt0aGlzLmZpdEJvdW5kcy50b1N0cmluZygpfWAgKTtcblxuICAgIGNvbnN0IHggPSB0aGlzLmZpdEJvdW5kcy5taW5YO1xuICAgIGNvbnN0IHkgPSB0aGlzLmZpdEJvdW5kcy5taW5ZO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSAmJiBpc0Zpbml0ZSggeSApLCAnSW52YWxpZCBTVkcgdHJhbnNmb3JtIGZvciBTVkdCbG9jaycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmZpdEJvdW5kcy5pc1ZhbGlkKCksICdJbnZhbGlkIGZpdEJvdW5kcycgKTtcblxuICAgIHRoaXMuYmFzZVRyYW5zZm9ybUdyb3VwLnNldEF0dHJpYnV0ZSggJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHsteH0sJHsteX0pYCApOyAvLyBzdWJ0cmFjdCBvZmYgc28gd2UgaGF2ZSBhIHRpZ2h0IGZpdFxuICAgIFV0aWxzLnNldFRyYW5zZm9ybSggYG1hdHJpeCgxLDAsMCwxLCR7eH0sJHt5fSlgLCB0aGlzLnN2ZyApOyAvLyByZWFwcGx5IHRoZSB0cmFuc2xhdGlvbiBhcyBhIENTUyB0cmFuc2Zvcm1cbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIHRoaXMuZml0Qm91bmRzLndpZHRoICk7XG4gICAgdGhpcy5zdmcuc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgdGhpcy5maXRCb3VuZHMuaGVpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XG4gICAqICAgICAgICAgICAgICAgICAgICAgIGJlIGRvbmUpLlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIC8vIFNlZSBpZiB3ZSBuZWVkIHRvIGFjdHVhbGx5IHVwZGF0ZSB0aGluZ3MgKHdpbGwgYmFpbCBvdXQgaWYgd2UgYXJlIG5vdCBkaXJ0eSwgb3IgaWYgd2UndmUgYmVlbiBkaXNwb3NlZClcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcblxuICAgIHdoaWxlICggdGhpcy5kaXJ0eUdyb3Vwcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBncm91cCA9IHRoaXMuZGlydHlHcm91cHMucG9wKCk7XG5cbiAgICAgIC8vIElmIHRoaXMgZ3JvdXAgaGFzIGJlZW4gZGlzcG9zZWQgb3IgbW92ZWQgdG8gYW5vdGhlciBibG9jaywgZG9uJ3QgbWVzcyB3aXRoIGl0LlxuICAgICAgLy8gV2UgZG9uJ3Qgc2NhbiB0aHJvdWdoIGRpcnR5R3JvdXBzIHdoZW4gd2UgdXBkYXRlIHdoaWNoIGdyb3VwIGlzIGFzc2lnbmVkIHRvIHdoaWNoIGJsb2NrIChmb3IgcGVyZm9ybWFuY2VcbiAgICAgIC8vIHJlYXNvbnMpLCBzbyB3ZSBuZWVkIHRvIGNoZWNrIGhlcmUgdG8gbWFrZSBzdXJlIGl0IGlzIHN0aWxsIFwiYXR0YWNoZWRcIiB0byB0aGlzIGJsb2NrLlxuICAgICAgaWYgKCBncm91cC5ibG9jayA9PT0gdGhpcyApIHtcbiAgICAgICAgZ3JvdXAudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlICggdGhpcy5kaXJ0eUdyYWRpZW50cy5sZW5ndGggKSB7XG4gICAgICAvLyBJdCBpcyBzYWZlIGVub3VnaCB0byB1cGRhdGUgZ3JhZGllbnRzIHJlZ2FyZGxlc3Mgb2YgdGhlIGJsb2NrIHRoZXkgYXJlIGluLlxuICAgICAgdGhpcy5kaXJ0eUdyYWRpZW50cy5wb3AoKS51cGRhdGUoKTtcbiAgICB9XG4gICAgd2hpbGUgKCB0aGlzLmRpcnR5RHJhd2FibGVzLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGRyYXdhYmxlID0gdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKTtcblxuICAgICAgLy8gSWYgdGhpcyBkcmF3YWJsZSBoYXMgYmVlbiBkaXNwb3NlZCBvciBtb3ZlZCB0byBhbm90aGVyIGJsb2NrLCBkb24ndCBtZXNzIHdpdGggaXQuXG4gICAgICAvLyBXZSBkb24ndCBzY2FuIHRocm91Z2ggZGlydHlEcmF3YWJsZXMgd2hlbiB3ZSB1cGRhdGUgd2hpY2ggZHJhd2FibGUgaXMgYXNzaWduZWQgdG8gd2hpY2ggYmxvY2sgKGZvciBwZXJmb3JtYW5jZVxuICAgICAgLy8gcmVhc29ucyksIHNvIHdlIG5lZWQgdG8gY2hlY2sgaGVyZSB0byBtYWtlIHN1cmUgaXQgaXMgc3RpbGwgXCJhdHRhY2hlZFwiIHRvIHRoaXMgYmxvY2suXG4gICAgICBpZiAoIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlID09PSB0aGlzICkge1xuICAgICAgICBkcmF3YWJsZS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkID0gdHJ1ZTsgLy8gT25jZSB3ZSd2ZSBpdGVyYXRlZCB0aHJvdWdoIHRoaW5ncywgd2UndmUgYXV0b21hdGljYWxseSByZWR1Y2VkIG91ciByZWZlcmVuY2VzLlxuXG4gICAgLy8gY2hlY2tzIHdpbGwgYmUgZG9uZSBpbiB1cGRhdGVGaXQoKSB0byBzZWUgd2hldGhlciBpdCBpcyBuZWVkZWRcbiAgICB0aGlzLnVwZGF0ZUZpdCgpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogTG9va3MgdG8gcmVtb3ZlIGRpcnR5IG9iamVjdHMgdGhhdCBtYXkgaGF2ZSBiZWVuIGRpc3Bvc2VkLlxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1mb3Jtcy1hbmQtY2hhbmdlcy9pc3N1ZXMvMzU2XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVkdWNlUmVmZXJlbmNlcygpIHtcbiAgICAvLyBuby1vcCBpZiB3ZSBoYWQgYW4gdXBkYXRlIGZpcnN0XG4gICAgaWYgKCB0aGlzLmFyZVJlZmVyZW5jZXNSZWR1Y2VkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEF0dGVtcHRzIHRvIGRvIHRoaXMgaW4gYSBoaWdoLXBlcmZvcm1hbmNlIHdheSwgd2hlcmUgd2UncmUgbm90IHNoaWZ0aW5nIGFycmF5IGNvbnRlbnRzIGFyb3VuZCAoc28gd2UnbGwgZG8gdGhpc1xuICAgIC8vIGluIG9uZSBzY2FuKS5cblxuICAgIGxldCBpbnNwZWN0aW9uSW5kZXggPSAwO1xuICAgIGxldCByZXBsYWNlbWVudEluZGV4ID0gMDtcblxuICAgIHdoaWxlICggaW5zcGVjdGlvbkluZGV4IDwgdGhpcy5kaXJ0eUdyb3Vwcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBncm91cCA9IHRoaXMuZGlydHlHcm91cHNbIGluc3BlY3Rpb25JbmRleCBdO1xuXG4gICAgICAvLyBPbmx5IGtlZXAgdGhpbmdzIHRoYXQgcmVmZXJlbmNlIG91ciBibG9jay5cbiAgICAgIGlmICggZ3JvdXAuYmxvY2sgPT09IHRoaXMgKSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRpY2VzIGFyZSB0aGUgc2FtZSwgZG9uJ3QgZG8gdGhlIG9wZXJhdGlvblxuICAgICAgICBpZiAoIHJlcGxhY2VtZW50SW5kZXggIT09IGluc3BlY3Rpb25JbmRleCApIHtcbiAgICAgICAgICB0aGlzLmRpcnR5R3JvdXBzWyByZXBsYWNlbWVudEluZGV4IF0gPSBncm91cDtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlbWVudEluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIGluc3BlY3Rpb25JbmRleCsrO1xuICAgIH1cblxuICAgIC8vIE91ciBhcnJheSBzaG91bGQgYmUgb25seSB0aGF0IGxlbmd0aCBub3dcbiAgICB3aGlsZSAoIHRoaXMuZGlydHlHcm91cHMubGVuZ3RoID4gcmVwbGFjZW1lbnRJbmRleCApIHtcbiAgICAgIHRoaXMuZGlydHlHcm91cHMucG9wKCk7XG4gICAgfVxuXG4gICAgLy8gRG8gYSBzaW1pbGFyIHRoaW5nIHdpdGggZGlydHlEcmF3YWJsZXMgKG5vdCBvcHRpbWl6ZWQgb3V0IGJlY2F1c2UgZm9yIHJpZ2h0IG5vdyB3ZSB3YW50IHRvIG1heGltaXplIHBlcmZvcm1hbmNlKS5cbiAgICBpbnNwZWN0aW9uSW5kZXggPSAwO1xuICAgIHJlcGxhY2VtZW50SW5kZXggPSAwO1xuXG4gICAgd2hpbGUgKCBpbnNwZWN0aW9uSW5kZXggPCB0aGlzLmRpcnR5RHJhd2FibGVzLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGRyYXdhYmxlID0gdGhpcy5kaXJ0eURyYXdhYmxlc1sgaW5zcGVjdGlvbkluZGV4IF07XG5cbiAgICAgIC8vIE9ubHkga2VlcCB0aGluZ3MgdGhhdCByZWZlcmVuY2Ugb3VyIGJsb2NrIGFzIHRoZSBwYXJlbnREcmF3YWJsZS5cbiAgICAgIGlmICggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKSB7XG4gICAgICAgIC8vIElmIHRoZSBpbmRpY2VzIGFyZSB0aGUgc2FtZSwgZG9uJ3QgZG8gdGhlIG9wZXJhdGlvblxuICAgICAgICBpZiAoIHJlcGxhY2VtZW50SW5kZXggIT09IGluc3BlY3Rpb25JbmRleCApIHtcbiAgICAgICAgICB0aGlzLmRpcnR5RHJhd2FibGVzWyByZXBsYWNlbWVudEluZGV4IF0gPSBkcmF3YWJsZTtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlbWVudEluZGV4Kys7XG4gICAgICB9XG5cbiAgICAgIGluc3BlY3Rpb25JbmRleCsrO1xuICAgIH1cblxuICAgIC8vIE91ciBhcnJheSBzaG91bGQgYmUgb25seSB0aGF0IGxlbmd0aCBub3dcbiAgICB3aGlsZSAoIHRoaXMuZGlydHlEcmF3YWJsZXMubGVuZ3RoID4gcmVwbGFjZW1lbnRJbmRleCApIHtcbiAgICAgIHRoaXMuZGlydHlEcmF3YWJsZXMucG9wKCk7XG4gICAgfVxuXG4gICAgdGhpcy5hcmVSZWZlcmVuY2VzUmVkdWNlZCA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrKCBgZGlzcG9zZSAjJHt0aGlzLmlkfWAgKTtcblxuICAgIC8vIG1ha2UgaXQgdGFrZSB1cCB6ZXJvIGFyZWEsIHNvIHRoYXQgd2UgZG9uJ3QgdXNlIHVwIGV4Y2VzcyBtZW1vcnlcbiAgICB0aGlzLnN2Zy5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsICcwJyApO1xuICAgIHRoaXMuc3ZnLnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsICcwJyApO1xuXG4gICAgLy8gY2xlYXIgcmVmZXJlbmNlc1xuICAgIHRoaXMuZmlsdGVyUm9vdEluc3RhbmNlID0gbnVsbDtcblxuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlHcmFkaWVudHMgKTtcbiAgICBjbGVhbkFycmF5KCB0aGlzLmRpcnR5R3JvdXBzICk7XG4gICAgY2xlYW5BcnJheSggdGhpcy5kaXJ0eURyYXdhYmxlcyApO1xuXG4gICAgdGhpcy5wYWludENvdW50TWFwLmNsZWFyKCk7XG5cbiAgICB0aGlzLmRpc3BsYXkuX3JlZnJlc2hTVkdFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmZvcmNlUmVmcmVzaExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmJhc2VUcmFuc2Zvcm1Hcm91cC5yZW1vdmVDaGlsZCggdGhpcy5yb290R3JvdXAuc3ZnR3JvdXAgKTtcbiAgICB0aGlzLnJvb3RHcm91cC5kaXNwb3NlKCk7XG4gICAgdGhpcy5yb290R3JvdXAgPSBudWxsO1xuXG4gICAgLy8gc2luY2Ugd2UgbWF5IG5vdCBwcm9wZXJseSByZW1vdmUgYWxsIGRlZnMgeWV0XG4gICAgd2hpbGUgKCB0aGlzLmRlZnMuY2hpbGROb2Rlcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLmRlZnMucmVtb3ZlQ2hpbGQoIHRoaXMuZGVmcy5jaGlsZE5vZGVzWyAwIF0gKTtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIGFkZERyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYCMke3RoaXMuaWR9LmFkZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICBzdXBlci5hZGREcmF3YWJsZSggZHJhd2FibGUgKTtcblxuICAgIFNWR0dyb3VwLmFkZERyYXdhYmxlKCB0aGlzLCBkcmF3YWJsZSApO1xuICAgIGRyYXdhYmxlLnVwZGF0ZVNWR0Jsb2NrKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIHJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2sgJiYgc2NlbmVyeUxvZy5TVkdCbG9jayggYCMke3RoaXMuaWR9LnJlbW92ZURyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICBTVkdHcm91cC5yZW1vdmVEcmF3YWJsZSggdGhpcywgZHJhd2FibGUgKTtcblxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xuXG4gICAgLy8gTk9URTogd2UgZG9uJ3QgdW5zZXQgdGhlIGRyYXdhYmxlJ3MgZGVmcyBoZXJlLCBzaW5jZSBpdCB3aWxsIGVpdGhlciBiZSBkaXNwb3NlZCAod2lsbCBjbGVhciBpdClcbiAgICAvLyBvciB3aWxsIGJlIGFkZGVkIHRvIGFub3RoZXIgU1ZHQmxvY2sgKHdoaWNoIHdpbGwgb3ZlcndyaXRlIGl0KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlXG4gICAqL1xuICBvbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0Jsb2NrICYmIHNjZW5lcnlMb2cuU1ZHQmxvY2soIGAjJHt0aGlzLmlkfS5vbkludGVydmFsQ2hhbmdlICR7Zmlyc3REcmF3YWJsZS50b1N0cmluZygpfSB0byAke2xhc3REcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgIHN1cGVyLm9uSW50ZXJ2YWxDaGFuZ2UoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYFNWR0Jsb2NrIyR7dGhpcy5pZH0tJHtGaXR0ZWRCbG9jay5maXRTdHJpbmdbIHRoaXMuZml0IF19YDtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU1ZHQmxvY2snLCBTVkdCbG9jayApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBTVkdCbG9jayApO1xuXG5leHBvcnQgZGVmYXVsdCBTVkdCbG9jazsiXSwibmFtZXMiOlsiZG90UmFuZG9tIiwiY2xlYW5BcnJheSIsIlBvb2xhYmxlIiwiQ291bnRNYXAiLCJGaXR0ZWRCbG9jayIsInNjZW5lcnkiLCJTVkdHcm91cCIsInN2Z25zIiwiVXRpbHMiLCJTVkdCbG9jayIsImluaXRpYWxpemUiLCJkaXNwbGF5IiwicmVuZGVyZXIiLCJ0cmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJmaWx0ZXJSb290SW5zdGFuY2UiLCJDT01NT05fQU5DRVNUT1IiLCJkaXJ0eUdyYWRpZW50cyIsImRpcnR5R3JvdXBzIiwiZGlydHlEcmF3YWJsZXMiLCJwYWludENvdW50TWFwIiwib25BZGRQYWludCIsImJpbmQiLCJvblJlbW92ZVBhaW50IiwiYXJlUmVmZXJlbmNlc1JlZHVjZWQiLCJkb21FbGVtZW50Iiwic3ZnIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJzdHlsZSIsInBvaW50ZXJFdmVudHMiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJzZXRBdHRyaWJ1dGUiLCJkZWZzIiwiYXBwZW5kQ2hpbGQiLCJiYXNlVHJhbnNmb3JtR3JvdXAiLCJmb3JjZVJlZnJlc2hMaXN0ZW5lciIsIndvcmthcm91bmRSZWN0Iiwid29ya2Fyb3VuZEdyb3VwIiwicmVkIiwibmV4dEludEJldHdlZW4iLCJncmVlbiIsImJsdWUiLCJfcmVmcmVzaFNWR0VtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJ1bnNldFRyYW5zZm9ybSIsImluc3RhbmNlQ2xvc2VzdFRvUm9vdCIsInRyYWlsIiwibm9kZXMiLCJsZW5ndGgiLCJyb290R3JvdXAiLCJjcmVhdGVGcm9tUG9vbCIsInN2Z0dyb3VwIiwic2NlbmVyeUxvZyIsImlkIiwicGFpbnQiLCJzdmdQYWludCIsImNyZWF0ZVNWR1BhaW50IiwiZGVmaW5pdGlvbiIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsImluY3JlbWVudFBhaW50IiwiYXNzZXJ0IiwiaXNQYWludCIsIlBhaW50cyIsImluY3JlbWVudCIsImRlY3JlbWVudFBhaW50IiwiZGVjcmVtZW50IiwibWFya0RpcnR5R3JhZGllbnQiLCJncmFkaWVudCIsInB1c2giLCJtYXJrRGlydHkiLCJtYXJrRGlydHlHcm91cCIsImJsb2NrIiwibWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzIiwibWFya0RpcnR5RHJhd2FibGUiLCJkcmF3YWJsZSIsImRpcnR5IiwidG9TdHJpbmciLCJzZXRTaXplRnVsbERpc3BsYXkiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzaXplIiwiZ2V0U2l6ZSIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0U2l6ZUZpdEJvdW5kcyIsImZpdEJvdW5kcyIsIngiLCJtaW5YIiwieSIsIm1pblkiLCJpc0Zpbml0ZSIsImlzVmFsaWQiLCJzZXRUcmFuc2Zvcm0iLCJ1cGRhdGUiLCJncm91cCIsInBvcCIsInBhcmVudERyYXdhYmxlIiwidXBkYXRlRml0IiwicmVkdWNlUmVmZXJlbmNlcyIsImluc3BlY3Rpb25JbmRleCIsInJlcGxhY2VtZW50SW5kZXgiLCJjbGVhciIsInJlbW92ZUxpc3RlbmVyIiwiY2hpbGROb2RlcyIsImFkZERyYXdhYmxlIiwidXBkYXRlU1ZHQmxvY2siLCJyZW1vdmVEcmF3YWJsZSIsIm9uSW50ZXJ2YWxDaGFuZ2UiLCJmaXJzdERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwiZml0U3RyaW5nIiwiZml0IiwiY29uc3RydWN0b3IiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSwrQkFBK0I7QUFDckQsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxTQUFTQyxRQUFRLEVBQUVDLFdBQVcsRUFBRUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLEtBQUssRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUV2RixJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCTDtJQW1CckI7Ozs7Ozs7Ozs7OztHQVlDLEdBQ0RNLFdBQVlDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLEVBQUc7UUFDekUsS0FBSyxDQUFDSixXQUFZQyxTQUFTQyxVQUFVQyx1QkFBdUJULFlBQVlXLGVBQWU7UUFFdkYscUJBQXFCO1FBQ3JCLElBQUksQ0FBQ0Qsa0JBQWtCLEdBQUdBO1FBRTFCLGlDQUFpQztRQUNqQyxJQUFJLENBQUNFLGNBQWMsR0FBR2YsV0FBWSxJQUFJLENBQUNlLGNBQWM7UUFFckQsOEJBQThCO1FBQzlCLElBQUksQ0FBQ0MsV0FBVyxHQUFHaEIsV0FBWSxJQUFJLENBQUNnQixXQUFXO1FBRS9DLDhCQUE4QjtRQUM5QixJQUFJLENBQUNDLGNBQWMsR0FBR2pCLFdBQVksSUFBSSxDQUFDaUIsY0FBYztRQUVyRCxxREFBcUQ7UUFDckQsSUFBSSxDQUFDQyxh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