// Copyright 2013-2024, University of Colorado Boulder
/**
 * Represents an SVG visual element, and is responsible for tracking changes to the visual element, and then applying
 * any changes at a later time.
 *
 * Abstract methods to implement for concrete implementations:
 *   updateSVGSelf() - Update the SVG element's state to what the Node's self should display
 *   updateDefsSelf( block ) - Update defs on the given block (or if block === null, remove)
 *   initializeState( renderer, instance )
 *   disposeState()
 *
 * Subtypes should also implement drawable.svgElement, as the actual SVG element to be used.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import arrayDifference from '../../../phet-core/js/arrayDifference.js';
import { PaintSVGState, scenery, SelfDrawable } from '../imports.js';
// Scratch arrays so that we are not creating array objects during paint checks
const scratchOldPaints = [];
const scratchNewPaints = [];
const scratchSimilarPaints = [];
const emptyArray = [];
let SVGSelfDrawable = class SVGSelfDrawable extends SelfDrawable {
    /**
   * @public
   *
   * @param {number} renderer
   * @param {Instance} instance
   * @param {boolean} usesPaint - Effectively true if we mix in PaintableStatefulDrawable
   * @param {boolean} keepElements
   * @returns {SVGSelfDrawable}
   */ initialize(renderer, instance, usesPaint, keepElements) {
        assert && assert(typeof usesPaint === 'boolean');
        assert && assert(typeof keepElements === 'boolean');
        super.initialize(renderer, instance);
        // @private {boolean}
        this.usesPaint = usesPaint; // const! (always the same) - Effectively true if we mix in PaintableStatefulDrawable
        this.keepElements = keepElements; // const! (always the same)
        // @public {SVGElement} - should be filled in by subtype
        this.svgElement = null;
        // @public {SVGBlock} - will be updated by updateSVGBlock()
        this.svgBlock = null;
        if (this.usesPaint) {
            if (!this.paintState) {
                this.paintState = new PaintSVGState();
            } else {
                this.paintState.initialize();
            }
        }
        return this; // allow chaining
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
        this.updateSVG();
        return true;
    }
    /**
   * Updates the cached paints for this drawable. This should be called when the paints for the drawable have changed.
   * @protected
   */ setCachedPaints(cachedPaints) {
        assert && assert(this.usesPaint);
        assert && assert(Array.isArray(this.lastCachedPaints));
        // Fill scratch arrays with the differences between the last cached paints and the new cached paints
        arrayDifference(this.lastCachedPaints, cachedPaints, scratchOldPaints, scratchNewPaints, scratchSimilarPaints);
        // Increment paints first, so we DO NOT get rid of things we don't need.
        for(let i = 0; i < scratchNewPaints.length; i++){
            this.svgBlock.incrementPaint(scratchNewPaints[i]);
        }
        for(let i = 0; i < scratchOldPaints.length; i++){
            this.svgBlock.decrementPaint(scratchOldPaints[i]);
        }
        // Clear arrays so we don't temporarily leak memory (the next arrayDifference will push into these). Reduces
        // GC/created references.
        scratchOldPaints.length = 0;
        scratchNewPaints.length = 0;
        scratchSimilarPaints.length = 0;
        // Replace lastCachedPaints contents
        this.lastCachedPaints.length = 0;
        this.lastCachedPaints.push(...cachedPaints);
    }
    /**
   * Called to update the visual appearance of our svgElement
   * @protected
   */ updateSVG() {
        // sync the differences between the previously-recorded list of cached paints and the new list
        if (this.usesPaint && this.dirtyCachedPaints) {
            this.setCachedPaints(this.node._cachedPaints);
        }
        if (this.paintDirty) {
            this.updateSVGSelf(this.node, this.svgElement);
        }
        // clear all of the dirty flags
        this.setToCleanState();
    }
    /**
   * to be used by our passed in options.updateSVG
   * @protected
   *
   * @param {SVGElement} element
   */ updateFillStrokeStyle(element) {
        if (!this.usesPaint) {
            return;
        }
        if (this.dirtyFill) {
            this.paintState.updateFill(this.svgBlock, this.node.getFillValue());
        }
        if (this.dirtyStroke) {
            this.paintState.updateStroke(this.svgBlock, this.node.getStrokeValue());
        }
        const strokeDetailDirty = this.dirtyLineWidth || this.dirtyLineOptions;
        if (strokeDetailDirty) {
            this.paintState.updateStrokeDetailStyle(this.node);
        }
        if (this.dirtyFill || this.dirtyStroke || strokeDetailDirty) {
            element.setAttribute('style', this.paintState.baseStyle + this.paintState.strokeDetailStyle);
        }
        this.cleanPaintableState();
    }
    /**
   * @public
   *
   * @param {SVGBlock} svgBlock
   */ updateSVGBlock(svgBlock) {
        // remove cached paint references from the old svgBlock
        const oldSvgBlock = this.svgBlock;
        if (this.usesPaint && oldSvgBlock) {
            for(let i = 0; i < this.lastCachedPaints.length; i++){
                oldSvgBlock.decrementPaint(this.lastCachedPaints[i]);
            }
        }
        this.svgBlock = svgBlock;
        // add cached paint references from the new svgBlock
        if (this.usesPaint) {
            for(let j = 0; j < this.lastCachedPaints.length; j++){
                svgBlock.incrementPaint(this.lastCachedPaints[j]);
            }
        }
        this.updateDefsSelf && this.updateDefsSelf(svgBlock);
        this.usesPaint && this.paintState.updateSVGBlock(svgBlock);
        // since fill/stroke IDs may be block-specific, we need to mark them dirty so they will be updated
        this.usesPaint && this.markDirtyFill();
        this.usesPaint && this.markDirtyStroke();
    }
    /**
   * Releases references
   * @public
   * @override
   */ dispose() {
        if (!this.keepElements) {
            // clear the references
            this.svgElement = null;
        }
        // release any defs, and dispose composed state objects
        this.updateDefsSelf && this.updateDefsSelf(null);
        if (this.usesPaint) {
            // When we are disposed, clear the cached paints (since we might switch to another node with a different set of
            // cached paints in the future). See https://github.com/phetsims/unit-rates/issues/226
            this.setCachedPaints(emptyArray);
            this.paintState.dispose();
        }
        this.defs = null;
        this.svgBlock = null;
        super.dispose();
    }
};
scenery.register('SVGSelfDrawable', SVGSelfDrawable);
export default SVGSelfDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdTZWxmRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBTVkcgdmlzdWFsIGVsZW1lbnQsIGFuZCBpcyByZXNwb25zaWJsZSBmb3IgdHJhY2tpbmcgY2hhbmdlcyB0byB0aGUgdmlzdWFsIGVsZW1lbnQsIGFuZCB0aGVuIGFwcGx5aW5nXG4gKiBhbnkgY2hhbmdlcyBhdCBhIGxhdGVyIHRpbWUuXG4gKlxuICogQWJzdHJhY3QgbWV0aG9kcyB0byBpbXBsZW1lbnQgZm9yIGNvbmNyZXRlIGltcGxlbWVudGF0aW9uczpcbiAqICAgdXBkYXRlU1ZHU2VsZigpIC0gVXBkYXRlIHRoZSBTVkcgZWxlbWVudCdzIHN0YXRlIHRvIHdoYXQgdGhlIE5vZGUncyBzZWxmIHNob3VsZCBkaXNwbGF5XG4gKiAgIHVwZGF0ZURlZnNTZWxmKCBibG9jayApIC0gVXBkYXRlIGRlZnMgb24gdGhlIGdpdmVuIGJsb2NrIChvciBpZiBibG9jayA9PT0gbnVsbCwgcmVtb3ZlKVxuICogICBpbml0aWFsaXplU3RhdGUoIHJlbmRlcmVyLCBpbnN0YW5jZSApXG4gKiAgIGRpc3Bvc2VTdGF0ZSgpXG4gKlxuICogU3VidHlwZXMgc2hvdWxkIGFsc28gaW1wbGVtZW50IGRyYXdhYmxlLnN2Z0VsZW1lbnQsIGFzIHRoZSBhY3R1YWwgU1ZHIGVsZW1lbnQgdG8gYmUgdXNlZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGFycmF5RGlmZmVyZW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlEaWZmZXJlbmNlLmpzJztcbmltcG9ydCB7IFBhaW50U1ZHU3RhdGUsIHNjZW5lcnksIFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBTY3JhdGNoIGFycmF5cyBzbyB0aGF0IHdlIGFyZSBub3QgY3JlYXRpbmcgYXJyYXkgb2JqZWN0cyBkdXJpbmcgcGFpbnQgY2hlY2tzXG5jb25zdCBzY3JhdGNoT2xkUGFpbnRzID0gW107XG5jb25zdCBzY3JhdGNoTmV3UGFpbnRzID0gW107XG5jb25zdCBzY3JhdGNoU2ltaWxhclBhaW50cyA9IFtdO1xuY29uc3QgZW1wdHlBcnJheSA9IFtdO1xuXG5jbGFzcyBTVkdTZWxmRHJhd2FibGUgZXh0ZW5kcyBTZWxmRHJhd2FibGUge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VzUGFpbnQgLSBFZmZlY3RpdmVseSB0cnVlIGlmIHdlIG1peCBpbiBQYWludGFibGVTdGF0ZWZ1bERyYXdhYmxlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0ga2VlcEVsZW1lbnRzXG4gICAqIEByZXR1cm5zIHtTVkdTZWxmRHJhd2FibGV9XG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIHVzZXNQYWludCwga2VlcEVsZW1lbnRzICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB1c2VzUGFpbnQgPT09ICdib29sZWFuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBrZWVwRWxlbWVudHMgPT09ICdib29sZWFuJyApO1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLnVzZXNQYWludCA9IHVzZXNQYWludDsgLy8gY29uc3QhIChhbHdheXMgdGhlIHNhbWUpIC0gRWZmZWN0aXZlbHkgdHJ1ZSBpZiB3ZSBtaXggaW4gUGFpbnRhYmxlU3RhdGVmdWxEcmF3YWJsZVxuICAgIHRoaXMua2VlcEVsZW1lbnRzID0ga2VlcEVsZW1lbnRzOyAvLyBjb25zdCEgKGFsd2F5cyB0aGUgc2FtZSlcblxuICAgIC8vIEBwdWJsaWMge1NWR0VsZW1lbnR9IC0gc2hvdWxkIGJlIGZpbGxlZCBpbiBieSBzdWJ0eXBlXG4gICAgdGhpcy5zdmdFbGVtZW50ID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge1NWR0Jsb2NrfSAtIHdpbGwgYmUgdXBkYXRlZCBieSB1cGRhdGVTVkdCbG9jaygpXG4gICAgdGhpcy5zdmdCbG9jayA9IG51bGw7XG5cbiAgICBpZiAoIHRoaXMudXNlc1BhaW50ICkge1xuICAgICAgaWYgKCAhdGhpcy5wYWludFN0YXRlICkge1xuICAgICAgICB0aGlzLnBhaW50U3RhdGUgPSBuZXcgUGFpbnRTVkdTdGF0ZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMucGFpbnRTdGF0ZS5pbml0aWFsaXplKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XG4gICAqICAgICAgICAgICAgICAgICAgICAgIGJlIGRvbmUpLlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIC8vIFNlZSBpZiB3ZSBuZWVkIHRvIGFjdHVhbGx5IHVwZGF0ZSB0aGluZ3MgKHdpbGwgYmFpbCBvdXQgaWYgd2UgYXJlIG5vdCBkaXJ0eSwgb3IgaWYgd2UndmUgYmVlbiBkaXNwb3NlZClcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVNWRygpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY2FjaGVkIHBhaW50cyBmb3IgdGhpcyBkcmF3YWJsZS4gVGhpcyBzaG91bGQgYmUgY2FsbGVkIHdoZW4gdGhlIHBhaW50cyBmb3IgdGhlIGRyYXdhYmxlIGhhdmUgY2hhbmdlZC5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgc2V0Q2FjaGVkUGFpbnRzKCBjYWNoZWRQYWludHMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy51c2VzUGFpbnQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCB0aGlzLmxhc3RDYWNoZWRQYWludHMgKSApO1xuXG4gICAgLy8gRmlsbCBzY3JhdGNoIGFycmF5cyB3aXRoIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBsYXN0IGNhY2hlZCBwYWludHMgYW5kIHRoZSBuZXcgY2FjaGVkIHBhaW50c1xuICAgIGFycmF5RGlmZmVyZW5jZSggdGhpcy5sYXN0Q2FjaGVkUGFpbnRzLCBjYWNoZWRQYWludHMsIHNjcmF0Y2hPbGRQYWludHMsIHNjcmF0Y2hOZXdQYWludHMsIHNjcmF0Y2hTaW1pbGFyUGFpbnRzICk7XG5cbiAgICAvLyBJbmNyZW1lbnQgcGFpbnRzIGZpcnN0LCBzbyB3ZSBETyBOT1QgZ2V0IHJpZCBvZiB0aGluZ3Mgd2UgZG9uJ3QgbmVlZC5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzY3JhdGNoTmV3UGFpbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5zdmdCbG9jay5pbmNyZW1lbnRQYWludCggc2NyYXRjaE5ld1BhaW50c1sgaSBdICk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2NyYXRjaE9sZFBhaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuc3ZnQmxvY2suZGVjcmVtZW50UGFpbnQoIHNjcmF0Y2hPbGRQYWludHNbIGkgXSApO1xuICAgIH1cblxuICAgIC8vIENsZWFyIGFycmF5cyBzbyB3ZSBkb24ndCB0ZW1wb3JhcmlseSBsZWFrIG1lbW9yeSAodGhlIG5leHQgYXJyYXlEaWZmZXJlbmNlIHdpbGwgcHVzaCBpbnRvIHRoZXNlKS4gUmVkdWNlc1xuICAgIC8vIEdDL2NyZWF0ZWQgcmVmZXJlbmNlcy5cbiAgICBzY3JhdGNoT2xkUGFpbnRzLmxlbmd0aCA9IDA7XG4gICAgc2NyYXRjaE5ld1BhaW50cy5sZW5ndGggPSAwO1xuICAgIHNjcmF0Y2hTaW1pbGFyUGFpbnRzLmxlbmd0aCA9IDA7XG5cbiAgICAvLyBSZXBsYWNlIGxhc3RDYWNoZWRQYWludHMgY29udGVudHNcbiAgICB0aGlzLmxhc3RDYWNoZWRQYWludHMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmxhc3RDYWNoZWRQYWludHMucHVzaCggLi4uY2FjaGVkUGFpbnRzICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHRvIHVwZGF0ZSB0aGUgdmlzdWFsIGFwcGVhcmFuY2Ugb2Ygb3VyIHN2Z0VsZW1lbnRcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgdXBkYXRlU1ZHKCkge1xuICAgIC8vIHN5bmMgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIHByZXZpb3VzbHktcmVjb3JkZWQgbGlzdCBvZiBjYWNoZWQgcGFpbnRzIGFuZCB0aGUgbmV3IGxpc3RcbiAgICBpZiAoIHRoaXMudXNlc1BhaW50ICYmIHRoaXMuZGlydHlDYWNoZWRQYWludHMgKSB7XG4gICAgICB0aGlzLnNldENhY2hlZFBhaW50cyggdGhpcy5ub2RlLl9jYWNoZWRQYWludHMgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMucGFpbnREaXJ0eSApIHtcbiAgICAgIHRoaXMudXBkYXRlU1ZHU2VsZiggdGhpcy5ub2RlLCB0aGlzLnN2Z0VsZW1lbnQgKTtcbiAgICB9XG5cbiAgICAvLyBjbGVhciBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzXG4gICAgdGhpcy5zZXRUb0NsZWFuU3RhdGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiB0byBiZSB1c2VkIGJ5IG91ciBwYXNzZWQgaW4gb3B0aW9ucy51cGRhdGVTVkdcbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBAcGFyYW0ge1NWR0VsZW1lbnR9IGVsZW1lbnRcbiAgICovXG4gIHVwZGF0ZUZpbGxTdHJva2VTdHlsZSggZWxlbWVudCApIHtcbiAgICBpZiAoICF0aGlzLnVzZXNQYWludCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuZGlydHlGaWxsICkge1xuICAgICAgdGhpcy5wYWludFN0YXRlLnVwZGF0ZUZpbGwoIHRoaXMuc3ZnQmxvY2ssIHRoaXMubm9kZS5nZXRGaWxsVmFsdWUoKSApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlTdHJva2UgKSB7XG4gICAgICB0aGlzLnBhaW50U3RhdGUudXBkYXRlU3Ryb2tlKCB0aGlzLnN2Z0Jsb2NrLCB0aGlzLm5vZGUuZ2V0U3Ryb2tlVmFsdWUoKSApO1xuICAgIH1cbiAgICBjb25zdCBzdHJva2VEZXRhaWxEaXJ0eSA9IHRoaXMuZGlydHlMaW5lV2lkdGggfHwgdGhpcy5kaXJ0eUxpbmVPcHRpb25zO1xuICAgIGlmICggc3Ryb2tlRGV0YWlsRGlydHkgKSB7XG4gICAgICB0aGlzLnBhaW50U3RhdGUudXBkYXRlU3Ryb2tlRGV0YWlsU3R5bGUoIHRoaXMubm9kZSApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlGaWxsIHx8IHRoaXMuZGlydHlTdHJva2UgfHwgc3Ryb2tlRGV0YWlsRGlydHkgKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3N0eWxlJywgdGhpcy5wYWludFN0YXRlLmJhc2VTdHlsZSArIHRoaXMucGFpbnRTdGF0ZS5zdHJva2VEZXRhaWxTdHlsZSApO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYW5QYWludGFibGVTdGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtTVkdCbG9ja30gc3ZnQmxvY2tcbiAgICovXG4gIHVwZGF0ZVNWR0Jsb2NrKCBzdmdCbG9jayApIHtcbiAgICAvLyByZW1vdmUgY2FjaGVkIHBhaW50IHJlZmVyZW5jZXMgZnJvbSB0aGUgb2xkIHN2Z0Jsb2NrXG4gICAgY29uc3Qgb2xkU3ZnQmxvY2sgPSB0aGlzLnN2Z0Jsb2NrO1xuICAgIGlmICggdGhpcy51c2VzUGFpbnQgJiYgb2xkU3ZnQmxvY2sgKSB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxhc3RDYWNoZWRQYWludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIG9sZFN2Z0Jsb2NrLmRlY3JlbWVudFBhaW50KCB0aGlzLmxhc3RDYWNoZWRQYWludHNbIGkgXSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3ZnQmxvY2sgPSBzdmdCbG9jaztcblxuICAgIC8vIGFkZCBjYWNoZWQgcGFpbnQgcmVmZXJlbmNlcyBmcm9tIHRoZSBuZXcgc3ZnQmxvY2tcbiAgICBpZiAoIHRoaXMudXNlc1BhaW50ICkge1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgdGhpcy5sYXN0Q2FjaGVkUGFpbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBzdmdCbG9jay5pbmNyZW1lbnRQYWludCggdGhpcy5sYXN0Q2FjaGVkUGFpbnRzWyBqIF0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZURlZnNTZWxmICYmIHRoaXMudXBkYXRlRGVmc1NlbGYoIHN2Z0Jsb2NrICk7XG5cbiAgICB0aGlzLnVzZXNQYWludCAmJiB0aGlzLnBhaW50U3RhdGUudXBkYXRlU1ZHQmxvY2soIHN2Z0Jsb2NrICk7XG5cbiAgICAvLyBzaW5jZSBmaWxsL3N0cm9rZSBJRHMgbWF5IGJlIGJsb2NrLXNwZWNpZmljLCB3ZSBuZWVkIHRvIG1hcmsgdGhlbSBkaXJ0eSBzbyB0aGV5IHdpbGwgYmUgdXBkYXRlZFxuICAgIHRoaXMudXNlc1BhaW50ICYmIHRoaXMubWFya0RpcnR5RmlsbCgpO1xuICAgIHRoaXMudXNlc1BhaW50ICYmIHRoaXMubWFya0RpcnR5U3Ryb2tlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAoICF0aGlzLmtlZXBFbGVtZW50cyApIHtcbiAgICAgIC8vIGNsZWFyIHRoZSByZWZlcmVuY2VzXG4gICAgICB0aGlzLnN2Z0VsZW1lbnQgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIHJlbGVhc2UgYW55IGRlZnMsIGFuZCBkaXNwb3NlIGNvbXBvc2VkIHN0YXRlIG9iamVjdHNcbiAgICB0aGlzLnVwZGF0ZURlZnNTZWxmICYmIHRoaXMudXBkYXRlRGVmc1NlbGYoIG51bGwgKTtcblxuICAgIGlmICggdGhpcy51c2VzUGFpbnQgKSB7XG4gICAgICAvLyBXaGVuIHdlIGFyZSBkaXNwb3NlZCwgY2xlYXIgdGhlIGNhY2hlZCBwYWludHMgKHNpbmNlIHdlIG1pZ2h0IHN3aXRjaCB0byBhbm90aGVyIG5vZGUgd2l0aCBhIGRpZmZlcmVudCBzZXQgb2ZcbiAgICAgIC8vIGNhY2hlZCBwYWludHMgaW4gdGhlIGZ1dHVyZSkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdW5pdC1yYXRlcy9pc3N1ZXMvMjI2XG4gICAgICB0aGlzLnNldENhY2hlZFBhaW50cyggZW1wdHlBcnJheSApO1xuXG4gICAgICB0aGlzLnBhaW50U3RhdGUuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIHRoaXMuZGVmcyA9IG51bGw7XG5cbiAgICB0aGlzLnN2Z0Jsb2NrID0gbnVsbDtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnU1ZHU2VsZkRyYXdhYmxlJywgU1ZHU2VsZkRyYXdhYmxlICk7XG5leHBvcnQgZGVmYXVsdCBTVkdTZWxmRHJhd2FibGU7Il0sIm5hbWVzIjpbImFycmF5RGlmZmVyZW5jZSIsIlBhaW50U1ZHU3RhdGUiLCJzY2VuZXJ5IiwiU2VsZkRyYXdhYmxlIiwic2NyYXRjaE9sZFBhaW50cyIsInNjcmF0Y2hOZXdQYWludHMiLCJzY3JhdGNoU2ltaWxhclBhaW50cyIsImVtcHR5QXJyYXkiLCJTVkdTZWxmRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInVzZXNQYWludCIsImtlZXBFbGVtZW50cyIsImFzc2VydCIsInN2Z0VsZW1lbnQiLCJzdmdCbG9jayIsInBhaW50U3RhdGUiLCJ1cGRhdGUiLCJ1cGRhdGVTVkciLCJzZXRDYWNoZWRQYWludHMiLCJjYWNoZWRQYWludHMiLCJBcnJheSIsImlzQXJyYXkiLCJsYXN0Q2FjaGVkUGFpbnRzIiwiaSIsImxlbmd0aCIsImluY3JlbWVudFBhaW50IiwiZGVjcmVtZW50UGFpbnQiLCJwdXNoIiwiZGlydHlDYWNoZWRQYWludHMiLCJub2RlIiwiX2NhY2hlZFBhaW50cyIsInBhaW50RGlydHkiLCJ1cGRhdGVTVkdTZWxmIiwic2V0VG9DbGVhblN0YXRlIiwidXBkYXRlRmlsbFN0cm9rZVN0eWxlIiwiZWxlbWVudCIsImRpcnR5RmlsbCIsInVwZGF0ZUZpbGwiLCJnZXRGaWxsVmFsdWUiLCJkaXJ0eVN0cm9rZSIsInVwZGF0ZVN0cm9rZSIsImdldFN0cm9rZVZhbHVlIiwic3Ryb2tlRGV0YWlsRGlydHkiLCJkaXJ0eUxpbmVXaWR0aCIsImRpcnR5TGluZU9wdGlvbnMiLCJ1cGRhdGVTdHJva2VEZXRhaWxTdHlsZSIsInNldEF0dHJpYnV0ZSIsImJhc2VTdHlsZSIsInN0cm9rZURldGFpbFN0eWxlIiwiY2xlYW5QYWludGFibGVTdGF0ZSIsInVwZGF0ZVNWR0Jsb2NrIiwib2xkU3ZnQmxvY2siLCJqIiwidXBkYXRlRGVmc1NlbGYiLCJtYXJrRGlydHlGaWxsIiwibWFya0RpcnR5U3Ryb2tlIiwiZGlzcG9zZSIsImRlZnMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FFRCxPQUFPQSxxQkFBcUIsMkNBQTJDO0FBQ3ZFLFNBQVNDLGFBQWEsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLFFBQVEsZ0JBQWdCO0FBRXJFLCtFQUErRTtBQUMvRSxNQUFNQyxtQkFBbUIsRUFBRTtBQUMzQixNQUFNQyxtQkFBbUIsRUFBRTtBQUMzQixNQUFNQyx1QkFBdUIsRUFBRTtBQUMvQixNQUFNQyxhQUFhLEVBQUU7QUFFckIsSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBd0JMO0lBQzVCOzs7Ozs7OztHQVFDLEdBQ0RNLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFlBQVksRUFBRztRQUN4REMsVUFBVUEsT0FBUSxPQUFPRixjQUFjO1FBQ3ZDRSxVQUFVQSxPQUFRLE9BQU9ELGlCQUFpQjtRQUUxQyxLQUFLLENBQUNKLFdBQVlDLFVBQVVDO1FBRTVCLHFCQUFxQjtRQUNyQixJQUFJLENBQUNDLFNBQVMsR0FBR0EsV0FBVyxxRkFBcUY7UUFDakgsSUFBSSxDQUFDQyxZQUFZLEdBQUdBLGNBQWMsMkJBQTJCO1FBRTdELHdEQUF3RDtRQUN4RCxJQUFJLENBQUNFLFVBQVUsR0FBRztRQUVsQiwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDQyxRQUFRLEdBQUc7UUFFaEIsSUFBSyxJQUFJLENBQUNKLFNBQVMsRUFBRztZQUNwQixJQUFLLENBQUMsSUFBSSxDQUFDSyxVQUFVLEVBQUc7Z0JBQ3RCLElBQUksQ0FBQ0EsVUFBVSxHQUFHLElBQUloQjtZQUN4QixPQUNLO2dCQUNILElBQUksQ0FBQ2dCLFVBQVUsQ0FBQ1IsVUFBVTtZQUM1QjtRQUNGO1FBRUEsT0FBTyxJQUFJLEVBQUUsaUJBQWlCO0lBQ2hDO0lBRUE7Ozs7Ozs7R0FPQyxHQUNEUyxTQUFTO1FBQ1AsMEdBQTBHO1FBQzFHLElBQUssQ0FBQyxLQUFLLENBQUNBLFVBQVc7WUFDckIsT0FBTztRQUNUO1FBRUEsSUFBSSxDQUFDQyxTQUFTO1FBRWQsT0FBTztJQUNUO0lBRUE7OztHQUdDLEdBQ0RDLGdCQUFpQkMsWUFBWSxFQUFHO1FBQzlCUCxVQUFVQSxPQUFRLElBQUksQ0FBQ0YsU0FBUztRQUNoQ0UsVUFBVUEsT0FBUVEsTUFBTUMsT0FBTyxDQUFFLElBQUksQ0FBQ0MsZ0JBQWdCO1FBRXRELG9HQUFvRztRQUNwR3hCLGdCQUFpQixJQUFJLENBQUN3QixnQkFBZ0IsRUFBRUgsY0FBY2pCLGtCQUFrQkMsa0JBQWtCQztRQUUxRix3RUFBd0U7UUFDeEUsSUFBTSxJQUFJbUIsSUFBSSxHQUFHQSxJQUFJcEIsaUJBQWlCcUIsTUFBTSxFQUFFRCxJQUFNO1lBQ2xELElBQUksQ0FBQ1QsUUFBUSxDQUFDVyxjQUFjLENBQUV0QixnQkFBZ0IsQ0FBRW9CLEVBQUc7UUFDckQ7UUFFQSxJQUFNLElBQUlBLElBQUksR0FBR0EsSUFBSXJCLGlCQUFpQnNCLE1BQU0sRUFBRUQsSUFBTTtZQUNsRCxJQUFJLENBQUNULFFBQVEsQ0FBQ1ksY0FBYyxDQUFFeEIsZ0JBQWdCLENBQUVxQixFQUFHO1FBQ3JEO1FBRUEsNEdBQTRHO1FBQzVHLHlCQUF5QjtRQUN6QnJCLGlCQUFpQnNCLE1BQU0sR0FBRztRQUMxQnJCLGlCQUFpQnFCLE1BQU0sR0FBRztRQUMxQnBCLHFCQUFxQm9CLE1BQU0sR0FBRztRQUU5QixvQ0FBb0M7UUFDcEMsSUFBSSxDQUFDRixnQkFBZ0IsQ0FBQ0UsTUFBTSxHQUFHO1FBQy9CLElBQUksQ0FBQ0YsZ0JBQWdCLENBQUNLLElBQUksSUFBS1I7SUFDakM7SUFFQTs7O0dBR0MsR0FDREYsWUFBWTtRQUNWLDhGQUE4RjtRQUM5RixJQUFLLElBQUksQ0FBQ1AsU0FBUyxJQUFJLElBQUksQ0FBQ2tCLGlCQUFpQixFQUFHO1lBQzlDLElBQUksQ0FBQ1YsZUFBZSxDQUFFLElBQUksQ0FBQ1csSUFBSSxDQUFDQyxhQUFhO1FBQy9DO1FBRUEsSUFBSyxJQUFJLENBQUNDLFVBQVUsRUFBRztZQUNyQixJQUFJLENBQUNDLGFBQWEsQ0FBRSxJQUFJLENBQUNILElBQUksRUFBRSxJQUFJLENBQUNoQixVQUFVO1FBQ2hEO1FBRUEsK0JBQStCO1FBQy9CLElBQUksQ0FBQ29CLGVBQWU7SUFDdEI7SUFFQTs7Ozs7R0FLQyxHQUNEQyxzQkFBdUJDLE9BQU8sRUFBRztRQUMvQixJQUFLLENBQUMsSUFBSSxDQUFDekIsU0FBUyxFQUFHO1lBQ3JCO1FBQ0Y7UUFFQSxJQUFLLElBQUksQ0FBQzBCLFNBQVMsRUFBRztZQUNwQixJQUFJLENBQUNyQixVQUFVLENBQUNzQixVQUFVLENBQUUsSUFBSSxDQUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQ2UsSUFBSSxDQUFDUyxZQUFZO1FBQ25FO1FBQ0EsSUFBSyxJQUFJLENBQUNDLFdBQVcsRUFBRztZQUN0QixJQUFJLENBQUN4QixVQUFVLENBQUN5QixZQUFZLENBQUUsSUFBSSxDQUFDMUIsUUFBUSxFQUFFLElBQUksQ0FBQ2UsSUFBSSxDQUFDWSxjQUFjO1FBQ3ZFO1FBQ0EsTUFBTUMsb0JBQW9CLElBQUksQ0FBQ0MsY0FBYyxJQUFJLElBQUksQ0FBQ0MsZ0JBQWdCO1FBQ3RFLElBQUtGLG1CQUFvQjtZQUN2QixJQUFJLENBQUMzQixVQUFVLENBQUM4Qix1QkFBdUIsQ0FBRSxJQUFJLENBQUNoQixJQUFJO1FBQ3BEO1FBQ0EsSUFBSyxJQUFJLENBQUNPLFNBQVMsSUFBSSxJQUFJLENBQUNHLFdBQVcsSUFBSUcsbUJBQW9CO1lBQzdEUCxRQUFRVyxZQUFZLENBQUUsU0FBUyxJQUFJLENBQUMvQixVQUFVLENBQUNnQyxTQUFTLEdBQUcsSUFBSSxDQUFDaEMsVUFBVSxDQUFDaUMsaUJBQWlCO1FBQzlGO1FBRUEsSUFBSSxDQUFDQyxtQkFBbUI7SUFDMUI7SUFFQTs7OztHQUlDLEdBQ0RDLGVBQWdCcEMsUUFBUSxFQUFHO1FBQ3pCLHVEQUF1RDtRQUN2RCxNQUFNcUMsY0FBYyxJQUFJLENBQUNyQyxRQUFRO1FBQ2pDLElBQUssSUFBSSxDQUFDSixTQUFTLElBQUl5QyxhQUFjO1lBQ25DLElBQU0sSUFBSTVCLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNELGdCQUFnQixDQUFDRSxNQUFNLEVBQUVELElBQU07Z0JBQ3ZENEIsWUFBWXpCLGNBQWMsQ0FBRSxJQUFJLENBQUNKLGdCQUFnQixDQUFFQyxFQUFHO1lBQ3hEO1FBQ0Y7UUFFQSxJQUFJLENBQUNULFFBQVEsR0FBR0E7UUFFaEIsb0RBQW9EO1FBQ3BELElBQUssSUFBSSxDQUFDSixTQUFTLEVBQUc7WUFDcEIsSUFBTSxJQUFJMEMsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQzlCLGdCQUFnQixDQUFDRSxNQUFNLEVBQUU0QixJQUFNO2dCQUN2RHRDLFNBQVNXLGNBQWMsQ0FBRSxJQUFJLENBQUNILGdCQUFnQixDQUFFOEIsRUFBRztZQUNyRDtRQUNGO1FBRUEsSUFBSSxDQUFDQyxjQUFjLElBQUksSUFBSSxDQUFDQSxjQUFjLENBQUV2QztRQUU1QyxJQUFJLENBQUNKLFNBQVMsSUFBSSxJQUFJLENBQUNLLFVBQVUsQ0FBQ21DLGNBQWMsQ0FBRXBDO1FBRWxELGtHQUFrRztRQUNsRyxJQUFJLENBQUNKLFNBQVMsSUFBSSxJQUFJLENBQUM0QyxhQUFhO1FBQ3BDLElBQUksQ0FBQzVDLFNBQVMsSUFBSSxJQUFJLENBQUM2QyxlQUFlO0lBQ3hDO0lBRUE7Ozs7R0FJQyxHQUNEQyxVQUFVO1FBQ1IsSUFBSyxDQUFDLElBQUksQ0FBQzdDLFlBQVksRUFBRztZQUN4Qix1QkFBdUI7WUFDdkIsSUFBSSxDQUFDRSxVQUFVLEdBQUc7UUFDcEI7UUFFQSx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDd0MsY0FBYyxJQUFJLElBQUksQ0FBQ0EsY0FBYyxDQUFFO1FBRTVDLElBQUssSUFBSSxDQUFDM0MsU0FBUyxFQUFHO1lBQ3BCLCtHQUErRztZQUMvRyxzRkFBc0Y7WUFDdEYsSUFBSSxDQUFDUSxlQUFlLENBQUViO1lBRXRCLElBQUksQ0FBQ1UsVUFBVSxDQUFDeUMsT0FBTztRQUN6QjtRQUVBLElBQUksQ0FBQ0MsSUFBSSxHQUFHO1FBRVosSUFBSSxDQUFDM0MsUUFBUSxHQUFHO1FBRWhCLEtBQUssQ0FBQzBDO0lBQ1I7QUFDRjtBQUVBeEQsUUFBUTBELFFBQVEsQ0FBRSxtQkFBbUJwRDtBQUNyQyxlQUFlQSxnQkFBZ0IifQ==