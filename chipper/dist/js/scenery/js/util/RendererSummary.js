// Copyright 2013-2023, University of Colorado Boulder
/**
 * Contains information about what renderers (and a few other flags) are supported for an entire subtree.
 *
 * We effectively do this by tracking bitmask changes from scenery.js (used for rendering properties in general). In particular, we count
 * how many zeros in the bitmask we have in key places.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Node, Renderer, scenery } from '../imports.js';
const summaryBits = [
    // renderer bits ("Is renderer X supported by the entire sub-tree?")
    Renderer.bitmaskCanvas,
    Renderer.bitmaskSVG,
    Renderer.bitmaskDOM,
    Renderer.bitmaskWebGL,
    // summary bits (added to the renderer bitmask to handle special flags for the summary)
    Renderer.bitmaskSingleCanvas,
    Renderer.bitmaskSingleSVG,
    Renderer.bitmaskNotPainted,
    Renderer.bitmaskBoundsValid,
    // NOTE: This could be separated out into its own implementation for this flag, since
    // there are cases where we actually have nothing fromt he PDOM DUE to things being pulled out by another pdom order.
    // This is generally NOT the case, so I've left this in here because it significantly simplifies the implementation.
    Renderer.bitmaskNoPDOM,
    // inverse renderer bits ("Do all painted nodes NOT support renderer X in this sub-tree?")
    Renderer.bitmaskLacksCanvas,
    Renderer.bitmaskLacksSVG,
    Renderer.bitmaskLacksDOM,
    Renderer.bitmaskLacksWebGL
];
const summaryBitIndices = {};
summaryBits.forEach((bit, index)=>{
    summaryBitIndices[bit] = index;
});
const numSummaryBits = summaryBits.length;
// A bitmask with all of the bits set that we record
let bitmaskAll = 0;
for(let l = 0; l < numSummaryBits; l++){
    bitmaskAll |= summaryBits[l];
}
let RendererSummary = class RendererSummary {
    /**
   * Use a bitmask of all 1s to represent 'does not exist' since we count zeros
   * @public
   *
   * @param {number} oldBitmask
   * @param {number} newBitmask
   */ summaryChange(oldBitmask, newBitmask) {
        assert && this.audit();
        const changeBitmask = oldBitmask ^ newBitmask; // bit set only if it changed
        let ancestorOldMask = 0;
        let ancestorNewMask = 0;
        for(let i = 0; i < numSummaryBits; i++){
            const bit = summaryBits[i];
            const bitIndex = summaryBitIndices[bit];
            // If the bit for the renderer has changed
            if (bit & changeBitmask) {
                // If it is now set (wasn't before), gained support for the renderer
                if (bit & newBitmask) {
                    this._counts[bitIndex]--; // reduce count, since we count the number of 0s (unsupported)
                    if (this._counts[bitIndex] === 0) {
                        ancestorNewMask |= bit; // add our bit to the "new" mask we will send to ancestors
                    }
                } else {
                    this._counts[bitIndex]++; // increment the count, since we count the number of 0s (unsupported)
                    if (this._counts[bitIndex] === 1) {
                        ancestorOldMask |= bit; // add our bit to the "old" mask we will send to ancestors
                    }
                }
            }
        }
        if (ancestorOldMask || ancestorNewMask) {
            const oldSubtreeBitmask = this.bitmask;
            assert && assert(oldSubtreeBitmask !== undefined);
            for(let j = 0; j < numSummaryBits; j++){
                const ancestorBit = summaryBits[j];
                // Check for added bits
                if (ancestorNewMask & ancestorBit) {
                    this.bitmask |= ancestorBit;
                }
                // Check for removed bits
                if (ancestorOldMask & ancestorBit) {
                    this.bitmask ^= ancestorBit;
                    assert && assert(!(this.bitmask & ancestorBit), 'Should be cleared, doing cheaper XOR assuming it already was set');
                }
            }
            this.node.instanceRefreshEmitter.emit();
            this.node.onSummaryChange(oldSubtreeBitmask, this.bitmask);
            const len = this.node._parents.length;
            for(let k = 0; k < len; k++){
                this.node._parents[k]._rendererSummary.summaryChange(ancestorOldMask, ancestorNewMask);
            }
            assert && assert(this.bitmask === this.computeBitmask(), 'Sanity check');
        }
        assert && this.audit();
    }
    /**
   * @public
   */ selfChange() {
        const oldBitmask = this.selfBitmask;
        const newBitmask = RendererSummary.summaryBitmaskForNodeSelf(this.node);
        if (oldBitmask !== newBitmask) {
            this.summaryChange(oldBitmask, newBitmask);
            this.selfBitmask = newBitmask;
        }
    }
    /**
   * @private
   *
   * @returns {number}
   */ computeBitmask() {
        let bitmask = 0;
        for(let i = 0; i < numSummaryBits; i++){
            if (this._counts[i] === 0) {
                bitmask |= summaryBits[i];
            }
        }
        return bitmask;
    }
    /**
   * @public
   * Is the renderer compatible with every single painted node under this subtree?
   * (Can this entire sub-tree be rendered with just this renderer)
   *
   * @param {number} renderer - Single bit preferred. If multiple bits set, requires ALL painted nodes are compatible
   *                            with ALL of the bits.
   */ isSubtreeFullyCompatible(renderer) {
        return !!(renderer & this.bitmask);
    }
    /**
   * @public
   * Is the renderer compatible with at least one painted node under this subtree?
   *
   * @param {number} renderer - Single bit preferred. If multiple bits set, will return if a single painted node is
   *                            compatible with at least one of the bits.
   */ isSubtreeContainingCompatible(renderer) {
        return !(renderer << Renderer.bitmaskLacksShift & this.bitmask);
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ isSingleCanvasSupported() {
        return !!(Renderer.bitmaskSingleCanvas & this.bitmask);
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ isSingleSVGSupported() {
        return !!(Renderer.bitmaskSingleSVG & this.bitmask);
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ isNotPainted() {
        return !!(Renderer.bitmaskNotPainted & this.bitmask);
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ hasNoPDOM() {
        return !!(Renderer.bitmaskNoPDOM & this.bitmask);
    }
    /**
   * @public
   *
   * @returns {boolean}
   */ areBoundsValid() {
        return !!(Renderer.bitmaskBoundsValid & this.bitmask);
    }
    /**
   * Given a bitmask representing a list of ordered preferred renderers, we check to see if all of our nodes can be
   * displayed in a single SVG block, AND that given the preferred renderers, that it will actually happen in our
   * rendering process.
   * @public
   *
   * @param {number} preferredRenderers
   * @returns {boolean}
   */ isSubtreeRenderedExclusivelySVG(preferredRenderers) {
        // Check if we have anything that would PREVENT us from having a single SVG block
        if (!this.isSingleSVGSupported()) {
            return false;
        }
        // Check for any renderer preferences that would CAUSE us to choose not to display with a single SVG block
        for(let i = 0; i < Renderer.numActiveRenderers; i++){
            // Grab the next-most preferred renderer
            const renderer = Renderer.bitmaskOrder(preferredRenderers, i);
            // If it's SVG, congrats! Everything will render in SVG (since SVG is supported, as noted above)
            if (Renderer.bitmaskSVG & renderer) {
                return true;
            }
            // Since it's not SVG, if there's a single painted node that supports this renderer (which is preferred over SVG),
            // then it will be rendered with this renderer, NOT SVG.
            if (this.isSubtreeContainingCompatible(renderer)) {
                return false;
            }
        }
        return false; // sanity check
    }
    /**
   * Given a bitmask representing a list of ordered preferred renderers, we check to see if all of our nodes can be
   * displayed in a single Canvas block, AND that given the preferred renderers, that it will actually happen in our
   * rendering process.
   * @public
   *
   * @param {number} preferredRenderers
   * @returns {boolean}
   */ isSubtreeRenderedExclusivelyCanvas(preferredRenderers) {
        // Check if we have anything that would PREVENT us from having a single Canvas block
        if (!this.isSingleCanvasSupported()) {
            return false;
        }
        // Check for any renderer preferences that would CAUSE us to choose not to display with a single Canvas block
        for(let i = 0; i < Renderer.numActiveRenderers; i++){
            // Grab the next-most preferred renderer
            const renderer = Renderer.bitmaskOrder(preferredRenderers, i);
            // If it's Canvas, congrats! Everything will render in Canvas (since Canvas is supported, as noted above)
            if (Renderer.bitmaskCanvas & renderer) {
                return true;
            }
            // Since it's not Canvas, if there's a single painted node that supports this renderer (which is preferred over Canvas),
            // then it will be rendered with this renderer, NOT Canvas.
            if (this.isSubtreeContainingCompatible(renderer)) {
                return false;
            }
        }
        return false; // sanity check
    }
    /**
   * For debugging purposes
   * @public
   */ audit() {
        if (assert) {
            for(let i = 0; i < numSummaryBits; i++){
                const bit = summaryBits[i];
                const countIsZero = this._counts[i] === 0;
                const bitmaskContainsBit = !!(this.bitmask & bit);
                assert(countIsZero === bitmaskContainsBit, 'Bits should be set if count is zero');
            }
        }
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        let result = RendererSummary.bitmaskToString(this.bitmask);
        for(let i = 0; i < numSummaryBits; i++){
            const bit = summaryBits[i];
            const countForBit = this._counts[i];
            if (countForBit !== 0) {
                result += ` ${RendererSummary.bitToString(bit)}:${countForBit}`;
            }
        }
        return result;
    }
    /**
   * Determines which of the summary bits can be set for a specific Node (ignoring children/ancestors).
   * For instance, for bitmaskSingleSVG, we only don't include the flag if THIS node prevents its usage
   * (even though child nodes may prevent it in the renderer summary itself).
   * @public
   *
   * @param {Node} node
   */ static summaryBitmaskForNodeSelf(node) {
        let bitmask = node._rendererBitmask;
        if (node.isPainted()) {
            bitmask |= (node._rendererBitmask & Renderer.bitmaskCurrentRendererArea ^ Renderer.bitmaskCurrentRendererArea) << Renderer.bitmaskLacksShift;
        } else {
            bitmask |= Renderer.bitmaskCurrentRendererArea << Renderer.bitmaskLacksShift;
        }
        // NOTE: If changing, see Instance.updateRenderingState
        const requiresSplit = node._cssTransform || node._layerSplit;
        const rendererHint = node._renderer;
        // Whether this subtree will be able to support a single SVG element
        // NOTE: If changing, see Instance.updateRenderingState
        if (!requiresSplit && // Can't have a single SVG element if we are split
        Renderer.isSVG(node._rendererBitmask) && // If our node doesn't support SVG, can't do it
        (!rendererHint || Renderer.isSVG(rendererHint))) {
            bitmask |= Renderer.bitmaskSingleSVG;
        }
        // Whether this subtree will be able to support a single Canvas element
        // NOTE: If changing, see Instance.updateRenderingState
        if (!requiresSplit && // Can't have a single SVG element if we are split
        Renderer.isCanvas(node._rendererBitmask) && // If our node doesn't support Canvas, can't do it
        (!rendererHint || Renderer.isCanvas(rendererHint))) {
            bitmask |= Renderer.bitmaskSingleCanvas;
        }
        if (!node.isPainted()) {
            bitmask |= Renderer.bitmaskNotPainted;
        }
        if (node.areSelfBoundsValid()) {
            bitmask |= Renderer.bitmaskBoundsValid;
        }
        if (!node.hasPDOMContent && !node.hasPDOMOrder()) {
            bitmask |= Renderer.bitmaskNoPDOM;
        }
        return bitmask;
    }
    /**
   * For debugging purposes
   * @public
   *
   * @param {number} bit
   * @returns {string}
   */ static bitToString(bit) {
        if (bit === Renderer.bitmaskCanvas) {
            return 'Canvas';
        }
        if (bit === Renderer.bitmaskSVG) {
            return 'SVG';
        }
        if (bit === Renderer.bitmaskDOM) {
            return 'DOM';
        }
        if (bit === Renderer.bitmaskWebGL) {
            return 'WebGL';
        }
        if (bit === Renderer.bitmaskLacksCanvas) {
            return '(-Canvas)';
        }
        if (bit === Renderer.bitmaskLacksSVG) {
            return '(-SVG)';
        }
        if (bit === Renderer.bitmaskLacksDOM) {
            return '(-DOM)';
        }
        if (bit === Renderer.bitmaskLacksWebGL) {
            return '(-WebGL)';
        }
        if (bit === Renderer.bitmaskSingleCanvas) {
            return 'SingleCanvas';
        }
        if (bit === Renderer.bitmaskSingleSVG) {
            return 'SingleSVG';
        }
        if (bit === Renderer.bitmaskNotPainted) {
            return 'NotPainted';
        }
        if (bit === Renderer.bitmaskBoundsValid) {
            return 'BoundsValid';
        }
        if (bit === Renderer.bitmaskNoPDOM) {
            return 'NotAccessible';
        }
        return '?';
    }
    /**
   * For debugging purposes
   * @public
   *
   * @param {number} bitmask
   * @returns {string}
   */ static bitmaskToString(bitmask) {
        let result = '';
        for(let i = 0; i < numSummaryBits; i++){
            const bit = summaryBits[i];
            if (bitmask & bit) {
                result += `${RendererSummary.bitToString(bit)} `;
            }
        }
        return result;
    }
    /**
   * @param {Node} node
   */ constructor(node){
        assert && assert(node instanceof Node);
        // NOTE: assumes that we are created in the Node constructor
        assert && assert(node._rendererBitmask === Renderer.bitmaskNodeDefault, 'Node must have a default bitmask when creating a RendererSummary');
        assert && assert(node._children.length === 0, 'Node cannot have children when creating a RendererSummary');
        // @private {Node}
        this.node = node;
        // @private Int16Array, maps bitmask indices (see summaryBitIndices, the index of the bitmask in summaryBits) to
        // a count of how many children (or self) have that property (e.g. can't renderer all of their contents with Canvas)
        this._counts = new Int16Array(numSummaryBits);
        // @public {number} (scenery-internal)
        this.bitmask = bitmaskAll;
        // @private {number}
        this.selfBitmask = RendererSummary.summaryBitmaskForNodeSelf(node);
        this.summaryChange(this.bitmask, this.selfBitmask);
        // required listeners to update our summary based on painted/non-painted information
        const listener = this.selfChange.bind(this);
        this.node.filterChangeEmitter.addListener(listener);
        this.node.clipAreaProperty.lazyLink(listener);
        this.node.rendererSummaryRefreshEmitter.addListener(listener);
    }
};
// @public {number}
RendererSummary.bitmaskAll = bitmaskAll;
scenery.register('RendererSummary', RendererSummary);
export default RendererSummary;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9SZW5kZXJlclN1bW1hcnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCByZW5kZXJlcnMgKGFuZCBhIGZldyBvdGhlciBmbGFncykgYXJlIHN1cHBvcnRlZCBmb3IgYW4gZW50aXJlIHN1YnRyZWUuXG4gKlxuICogV2UgZWZmZWN0aXZlbHkgZG8gdGhpcyBieSB0cmFja2luZyBiaXRtYXNrIGNoYW5nZXMgZnJvbSBzY2VuZXJ5LmpzICh1c2VkIGZvciByZW5kZXJpbmcgcHJvcGVydGllcyBpbiBnZW5lcmFsKS4gSW4gcGFydGljdWxhciwgd2UgY291bnRcbiAqIGhvdyBtYW55IHplcm9zIGluIHRoZSBiaXRtYXNrIHdlIGhhdmUgaW4ga2V5IHBsYWNlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgTm9kZSwgUmVuZGVyZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3Qgc3VtbWFyeUJpdHMgPSBbXG4gIC8vIHJlbmRlcmVyIGJpdHMgKFwiSXMgcmVuZGVyZXIgWCBzdXBwb3J0ZWQgYnkgdGhlIGVudGlyZSBzdWItdHJlZT9cIilcbiAgUmVuZGVyZXIuYml0bWFza0NhbnZhcyxcbiAgUmVuZGVyZXIuYml0bWFza1NWRyxcbiAgUmVuZGVyZXIuYml0bWFza0RPTSxcbiAgUmVuZGVyZXIuYml0bWFza1dlYkdMLFxuXG4gIC8vIHN1bW1hcnkgYml0cyAoYWRkZWQgdG8gdGhlIHJlbmRlcmVyIGJpdG1hc2sgdG8gaGFuZGxlIHNwZWNpYWwgZmxhZ3MgZm9yIHRoZSBzdW1tYXJ5KVxuICBSZW5kZXJlci5iaXRtYXNrU2luZ2xlQ2FudmFzLFxuICBSZW5kZXJlci5iaXRtYXNrU2luZ2xlU1ZHLFxuICBSZW5kZXJlci5iaXRtYXNrTm90UGFpbnRlZCxcbiAgUmVuZGVyZXIuYml0bWFza0JvdW5kc1ZhbGlkLFxuICAvLyBOT1RFOiBUaGlzIGNvdWxkIGJlIHNlcGFyYXRlZCBvdXQgaW50byBpdHMgb3duIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIGZsYWcsIHNpbmNlXG4gIC8vIHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB3ZSBhY3R1YWxseSBoYXZlIG5vdGhpbmcgZnJvbXQgaGUgUERPTSBEVUUgdG8gdGhpbmdzIGJlaW5nIHB1bGxlZCBvdXQgYnkgYW5vdGhlciBwZG9tIG9yZGVyLlxuICAvLyBUaGlzIGlzIGdlbmVyYWxseSBOT1QgdGhlIGNhc2UsIHNvIEkndmUgbGVmdCB0aGlzIGluIGhlcmUgYmVjYXVzZSBpdCBzaWduaWZpY2FudGx5IHNpbXBsaWZpZXMgdGhlIGltcGxlbWVudGF0aW9uLlxuICBSZW5kZXJlci5iaXRtYXNrTm9QRE9NLFxuXG4gIC8vIGludmVyc2UgcmVuZGVyZXIgYml0cyAoXCJEbyBhbGwgcGFpbnRlZCBub2RlcyBOT1Qgc3VwcG9ydCByZW5kZXJlciBYIGluIHRoaXMgc3ViLXRyZWU/XCIpXG4gIFJlbmRlcmVyLmJpdG1hc2tMYWNrc0NhbnZhcyxcbiAgUmVuZGVyZXIuYml0bWFza0xhY2tzU1ZHLFxuICBSZW5kZXJlci5iaXRtYXNrTGFja3NET00sXG4gIFJlbmRlcmVyLmJpdG1hc2tMYWNrc1dlYkdMXG5dO1xuXG5jb25zdCBzdW1tYXJ5Qml0SW5kaWNlcyA9IHt9O1xuc3VtbWFyeUJpdHMuZm9yRWFjaCggKCBiaXQsIGluZGV4ICkgPT4ge1xuICBzdW1tYXJ5Qml0SW5kaWNlc1sgYml0IF0gPSBpbmRleDtcbn0gKTtcblxuY29uc3QgbnVtU3VtbWFyeUJpdHMgPSBzdW1tYXJ5Qml0cy5sZW5ndGg7XG5cbi8vIEEgYml0bWFzayB3aXRoIGFsbCBvZiB0aGUgYml0cyBzZXQgdGhhdCB3ZSByZWNvcmRcbmxldCBiaXRtYXNrQWxsID0gMDtcbmZvciAoIGxldCBsID0gMDsgbCA8IG51bVN1bW1hcnlCaXRzOyBsKysgKSB7XG4gIGJpdG1hc2tBbGwgfD0gc3VtbWFyeUJpdHNbIGwgXTtcbn1cblxuY2xhc3MgUmVuZGVyZXJTdW1tYXJ5IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG5vZGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSBpbnN0YW5jZW9mIE5vZGUgKTtcblxuICAgIC8vIE5PVEU6IGFzc3VtZXMgdGhhdCB3ZSBhcmUgY3JlYXRlZCBpbiB0aGUgTm9kZSBjb25zdHJ1Y3RvclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3JlbmRlcmVyQml0bWFzayA9PT0gUmVuZGVyZXIuYml0bWFza05vZGVEZWZhdWx0LCAnTm9kZSBtdXN0IGhhdmUgYSBkZWZhdWx0IGJpdG1hc2sgd2hlbiBjcmVhdGluZyBhIFJlbmRlcmVyU3VtbWFyeScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLl9jaGlsZHJlbi5sZW5ndGggPT09IDAsICdOb2RlIGNhbm5vdCBoYXZlIGNoaWxkcmVuIHdoZW4gY3JlYXRpbmcgYSBSZW5kZXJlclN1bW1hcnknICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX1cbiAgICB0aGlzLm5vZGUgPSBub2RlO1xuXG4gICAgLy8gQHByaXZhdGUgSW50MTZBcnJheSwgbWFwcyBiaXRtYXNrIGluZGljZXMgKHNlZSBzdW1tYXJ5Qml0SW5kaWNlcywgdGhlIGluZGV4IG9mIHRoZSBiaXRtYXNrIGluIHN1bW1hcnlCaXRzKSB0b1xuICAgIC8vIGEgY291bnQgb2YgaG93IG1hbnkgY2hpbGRyZW4gKG9yIHNlbGYpIGhhdmUgdGhhdCBwcm9wZXJ0eSAoZS5nLiBjYW4ndCByZW5kZXJlciBhbGwgb2YgdGhlaXIgY29udGVudHMgd2l0aCBDYW52YXMpXG4gICAgdGhpcy5fY291bnRzID0gbmV3IEludDE2QXJyYXkoIG51bVN1bW1hcnlCaXRzICk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IChzY2VuZXJ5LWludGVybmFsKVxuICAgIHRoaXMuYml0bWFzayA9IGJpdG1hc2tBbGw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgIHRoaXMuc2VsZkJpdG1hc2sgPSBSZW5kZXJlclN1bW1hcnkuc3VtbWFyeUJpdG1hc2tGb3JOb2RlU2VsZiggbm9kZSApO1xuXG4gICAgdGhpcy5zdW1tYXJ5Q2hhbmdlKCB0aGlzLmJpdG1hc2ssIHRoaXMuc2VsZkJpdG1hc2sgKTtcblxuICAgIC8vIHJlcXVpcmVkIGxpc3RlbmVycyB0byB1cGRhdGUgb3VyIHN1bW1hcnkgYmFzZWQgb24gcGFpbnRlZC9ub24tcGFpbnRlZCBpbmZvcm1hdGlvblxuICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5zZWxmQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgICB0aGlzLm5vZGUuY2xpcEFyZWFQcm9wZXJ0eS5sYXp5TGluayggbGlzdGVuZXIgKTtcbiAgICB0aGlzLm5vZGUucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIGEgYml0bWFzayBvZiBhbGwgMXMgdG8gcmVwcmVzZW50ICdkb2VzIG5vdCBleGlzdCcgc2luY2Ugd2UgY291bnQgemVyb3NcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gb2xkQml0bWFza1xuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3Qml0bWFza1xuICAgKi9cbiAgc3VtbWFyeUNoYW5nZSggb2xkQml0bWFzaywgbmV3Qml0bWFzayApIHtcbiAgICBhc3NlcnQgJiYgdGhpcy5hdWRpdCgpO1xuXG4gICAgY29uc3QgY2hhbmdlQml0bWFzayA9IG9sZEJpdG1hc2sgXiBuZXdCaXRtYXNrOyAvLyBiaXQgc2V0IG9ubHkgaWYgaXQgY2hhbmdlZFxuXG4gICAgbGV0IGFuY2VzdG9yT2xkTWFzayA9IDA7XG4gICAgbGV0IGFuY2VzdG9yTmV3TWFzayA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VtbWFyeUJpdHM7IGkrKyApIHtcbiAgICAgIGNvbnN0IGJpdCA9IHN1bW1hcnlCaXRzWyBpIF07XG4gICAgICBjb25zdCBiaXRJbmRleCA9IHN1bW1hcnlCaXRJbmRpY2VzWyBiaXQgXTtcblxuICAgICAgLy8gSWYgdGhlIGJpdCBmb3IgdGhlIHJlbmRlcmVyIGhhcyBjaGFuZ2VkXG4gICAgICBpZiAoIGJpdCAmIGNoYW5nZUJpdG1hc2sgKSB7XG5cbiAgICAgICAgLy8gSWYgaXQgaXMgbm93IHNldCAod2Fzbid0IGJlZm9yZSksIGdhaW5lZCBzdXBwb3J0IGZvciB0aGUgcmVuZGVyZXJcbiAgICAgICAgaWYgKCBiaXQgJiBuZXdCaXRtYXNrICkge1xuICAgICAgICAgIHRoaXMuX2NvdW50c1sgYml0SW5kZXggXS0tOyAvLyByZWR1Y2UgY291bnQsIHNpbmNlIHdlIGNvdW50IHRoZSBudW1iZXIgb2YgMHMgKHVuc3VwcG9ydGVkKVxuICAgICAgICAgIGlmICggdGhpcy5fY291bnRzWyBiaXRJbmRleCBdID09PSAwICkge1xuICAgICAgICAgICAgYW5jZXN0b3JOZXdNYXNrIHw9IGJpdDsgLy8gYWRkIG91ciBiaXQgdG8gdGhlIFwibmV3XCIgbWFzayB3ZSB3aWxsIHNlbmQgdG8gYW5jZXN0b3JzXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEl0IHdhcyBzZXQgYmVmb3JlIChub3cgaXNuJ3QpLCBsb3N0IHN1cHBvcnQgZm9yIHRoZSByZW5kZXJlclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9jb3VudHNbIGJpdEluZGV4IF0rKzsgLy8gaW5jcmVtZW50IHRoZSBjb3VudCwgc2luY2Ugd2UgY291bnQgdGhlIG51bWJlciBvZiAwcyAodW5zdXBwb3J0ZWQpXG4gICAgICAgICAgaWYgKCB0aGlzLl9jb3VudHNbIGJpdEluZGV4IF0gPT09IDEgKSB7XG4gICAgICAgICAgICBhbmNlc3Rvck9sZE1hc2sgfD0gYml0OyAvLyBhZGQgb3VyIGJpdCB0byB0aGUgXCJvbGRcIiBtYXNrIHdlIHdpbGwgc2VuZCB0byBhbmNlc3RvcnNcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGFuY2VzdG9yT2xkTWFzayB8fCBhbmNlc3Rvck5ld01hc2sgKSB7XG5cbiAgICAgIGNvbnN0IG9sZFN1YnRyZWVCaXRtYXNrID0gdGhpcy5iaXRtYXNrO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb2xkU3VidHJlZUJpdG1hc2sgIT09IHVuZGVmaW5lZCApO1xuXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBudW1TdW1tYXJ5Qml0czsgaisrICkge1xuICAgICAgICBjb25zdCBhbmNlc3RvckJpdCA9IHN1bW1hcnlCaXRzWyBqIF07XG4gICAgICAgIC8vIENoZWNrIGZvciBhZGRlZCBiaXRzXG4gICAgICAgIGlmICggYW5jZXN0b3JOZXdNYXNrICYgYW5jZXN0b3JCaXQgKSB7XG4gICAgICAgICAgdGhpcy5iaXRtYXNrIHw9IGFuY2VzdG9yQml0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHJlbW92ZWQgYml0c1xuICAgICAgICBpZiAoIGFuY2VzdG9yT2xkTWFzayAmIGFuY2VzdG9yQml0ICkge1xuICAgICAgICAgIHRoaXMuYml0bWFzayBePSBhbmNlc3RvckJpdDtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCB0aGlzLmJpdG1hc2sgJiBhbmNlc3RvckJpdCApLFxuICAgICAgICAgICAgJ1Nob3VsZCBiZSBjbGVhcmVkLCBkb2luZyBjaGVhcGVyIFhPUiBhc3N1bWluZyBpdCBhbHJlYWR5IHdhcyBzZXQnICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5ub2RlLmluc3RhbmNlUmVmcmVzaEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgdGhpcy5ub2RlLm9uU3VtbWFyeUNoYW5nZSggb2xkU3VidHJlZUJpdG1hc2ssIHRoaXMuYml0bWFzayApO1xuXG4gICAgICBjb25zdCBsZW4gPSB0aGlzLm5vZGUuX3BhcmVudHMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgbGVuOyBrKysgKSB7XG4gICAgICAgIHRoaXMubm9kZS5fcGFyZW50c1sgayBdLl9yZW5kZXJlclN1bW1hcnkuc3VtbWFyeUNoYW5nZSggYW5jZXN0b3JPbGRNYXNrLCBhbmNlc3Rvck5ld01hc2sgKTtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5iaXRtYXNrID09PSB0aGlzLmNvbXB1dGVCaXRtYXNrKCksICdTYW5pdHkgY2hlY2snICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIHRoaXMuYXVkaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBzZWxmQ2hhbmdlKCkge1xuICAgIGNvbnN0IG9sZEJpdG1hc2sgPSB0aGlzLnNlbGZCaXRtYXNrO1xuICAgIGNvbnN0IG5ld0JpdG1hc2sgPSBSZW5kZXJlclN1bW1hcnkuc3VtbWFyeUJpdG1hc2tGb3JOb2RlU2VsZiggdGhpcy5ub2RlICk7XG4gICAgaWYgKCBvbGRCaXRtYXNrICE9PSBuZXdCaXRtYXNrICkge1xuICAgICAgdGhpcy5zdW1tYXJ5Q2hhbmdlKCBvbGRCaXRtYXNrLCBuZXdCaXRtYXNrICk7XG4gICAgICB0aGlzLnNlbGZCaXRtYXNrID0gbmV3Qml0bWFzaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGNvbXB1dGVCaXRtYXNrKCkge1xuICAgIGxldCBiaXRtYXNrID0gMDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdW1tYXJ5Qml0czsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLl9jb3VudHNbIGkgXSA9PT0gMCApIHtcbiAgICAgICAgYml0bWFzayB8PSBzdW1tYXJ5Qml0c1sgaSBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYml0bWFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIElzIHRoZSByZW5kZXJlciBjb21wYXRpYmxlIHdpdGggZXZlcnkgc2luZ2xlIHBhaW50ZWQgbm9kZSB1bmRlciB0aGlzIHN1YnRyZWU/XG4gICAqIChDYW4gdGhpcyBlbnRpcmUgc3ViLXRyZWUgYmUgcmVuZGVyZWQgd2l0aCBqdXN0IHRoaXMgcmVuZGVyZXIpXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFNpbmdsZSBiaXQgcHJlZmVycmVkLiBJZiBtdWx0aXBsZSBiaXRzIHNldCwgcmVxdWlyZXMgQUxMIHBhaW50ZWQgbm9kZXMgYXJlIGNvbXBhdGlibGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBBTEwgb2YgdGhlIGJpdHMuXG4gICAqL1xuICBpc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIHJlbmRlcmVyICkge1xuICAgIHJldHVybiAhISggcmVuZGVyZXIgJiB0aGlzLmJpdG1hc2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIElzIHRoZSByZW5kZXJlciBjb21wYXRpYmxlIHdpdGggYXQgbGVhc3Qgb25lIHBhaW50ZWQgbm9kZSB1bmRlciB0aGlzIHN1YnRyZWU/XG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlciAtIFNpbmdsZSBiaXQgcHJlZmVycmVkLiBJZiBtdWx0aXBsZSBiaXRzIHNldCwgd2lsbCByZXR1cm4gaWYgYSBzaW5nbGUgcGFpbnRlZCBub2RlIGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhdGlibGUgd2l0aCBhdCBsZWFzdCBvbmUgb2YgdGhlIGJpdHMuXG4gICAqL1xuICBpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggcmVuZGVyZXIgKSB7XG4gICAgcmV0dXJuICEoICggcmVuZGVyZXIgPDwgUmVuZGVyZXIuYml0bWFza0xhY2tzU2hpZnQgKSAmIHRoaXMuYml0bWFzayApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gISEoIFJlbmRlcmVyLmJpdG1hc2tTaW5nbGVDYW52YXMgJiB0aGlzLmJpdG1hc2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTaW5nbGVTVkdTdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuICEhKCBSZW5kZXJlci5iaXRtYXNrU2luZ2xlU1ZHICYgdGhpcy5iaXRtYXNrICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTm90UGFpbnRlZCgpIHtcbiAgICByZXR1cm4gISEoIFJlbmRlcmVyLmJpdG1hc2tOb3RQYWludGVkICYgdGhpcy5iaXRtYXNrICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc05vUERPTSgpIHtcbiAgICByZXR1cm4gISEoIFJlbmRlcmVyLmJpdG1hc2tOb1BET00gJiB0aGlzLmJpdG1hc2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgYXJlQm91bmRzVmFsaWQoKSB7XG4gICAgcmV0dXJuICEhKCBSZW5kZXJlci5iaXRtYXNrQm91bmRzVmFsaWQgJiB0aGlzLmJpdG1hc2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGJpdG1hc2sgcmVwcmVzZW50aW5nIGEgbGlzdCBvZiBvcmRlcmVkIHByZWZlcnJlZCByZW5kZXJlcnMsIHdlIGNoZWNrIHRvIHNlZSBpZiBhbGwgb2Ygb3VyIG5vZGVzIGNhbiBiZVxuICAgKiBkaXNwbGF5ZWQgaW4gYSBzaW5nbGUgU1ZHIGJsb2NrLCBBTkQgdGhhdCBnaXZlbiB0aGUgcHJlZmVycmVkIHJlbmRlcmVycywgdGhhdCBpdCB3aWxsIGFjdHVhbGx5IGhhcHBlbiBpbiBvdXJcbiAgICogcmVuZGVyaW5nIHByb2Nlc3MuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByZWZlcnJlZFJlbmRlcmVyc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlTVkcoIHByZWZlcnJlZFJlbmRlcmVycyApIHtcbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGFueXRoaW5nIHRoYXQgd291bGQgUFJFVkVOVCB1cyBmcm9tIGhhdmluZyBhIHNpbmdsZSBTVkcgYmxvY2tcbiAgICBpZiAoICF0aGlzLmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFueSByZW5kZXJlciBwcmVmZXJlbmNlcyB0aGF0IHdvdWxkIENBVVNFIHVzIHRvIGNob29zZSBub3QgdG8gZGlzcGxheSB3aXRoIGEgc2luZ2xlIFNWRyBibG9ja1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IFJlbmRlcmVyLm51bUFjdGl2ZVJlbmRlcmVyczsgaSsrICkge1xuICAgICAgLy8gR3JhYiB0aGUgbmV4dC1tb3N0IHByZWZlcnJlZCByZW5kZXJlclxuICAgICAgY29uc3QgcmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIHByZWZlcnJlZFJlbmRlcmVycywgaSApO1xuXG4gICAgICAvLyBJZiBpdCdzIFNWRywgY29uZ3JhdHMhIEV2ZXJ5dGhpbmcgd2lsbCByZW5kZXIgaW4gU1ZHIChzaW5jZSBTVkcgaXMgc3VwcG9ydGVkLCBhcyBub3RlZCBhYm92ZSlcbiAgICAgIGlmICggUmVuZGVyZXIuYml0bWFza1NWRyAmIHJlbmRlcmVyICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgaXQncyBub3QgU1ZHLCBpZiB0aGVyZSdzIGEgc2luZ2xlIHBhaW50ZWQgbm9kZSB0aGF0IHN1cHBvcnRzIHRoaXMgcmVuZGVyZXIgKHdoaWNoIGlzIHByZWZlcnJlZCBvdmVyIFNWRyksXG4gICAgICAvLyB0aGVuIGl0IHdpbGwgYmUgcmVuZGVyZWQgd2l0aCB0aGlzIHJlbmRlcmVyLCBOT1QgU1ZHLlxuICAgICAgaWYgKCB0aGlzLmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCByZW5kZXJlciApICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlOyAvLyBzYW5pdHkgY2hlY2tcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGJpdG1hc2sgcmVwcmVzZW50aW5nIGEgbGlzdCBvZiBvcmRlcmVkIHByZWZlcnJlZCByZW5kZXJlcnMsIHdlIGNoZWNrIHRvIHNlZSBpZiBhbGwgb2Ygb3VyIG5vZGVzIGNhbiBiZVxuICAgKiBkaXNwbGF5ZWQgaW4gYSBzaW5nbGUgQ2FudmFzIGJsb2NrLCBBTkQgdGhhdCBnaXZlbiB0aGUgcHJlZmVycmVkIHJlbmRlcmVycywgdGhhdCBpdCB3aWxsIGFjdHVhbGx5IGhhcHBlbiBpbiBvdXJcbiAgICogcmVuZGVyaW5nIHByb2Nlc3MuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByZWZlcnJlZFJlbmRlcmVyc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlDYW52YXMoIHByZWZlcnJlZFJlbmRlcmVycyApIHtcbiAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGFueXRoaW5nIHRoYXQgd291bGQgUFJFVkVOVCB1cyBmcm9tIGhhdmluZyBhIHNpbmdsZSBDYW52YXMgYmxvY2tcbiAgICBpZiAoICF0aGlzLmlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkKCkgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGFueSByZW5kZXJlciBwcmVmZXJlbmNlcyB0aGF0IHdvdWxkIENBVVNFIHVzIHRvIGNob29zZSBub3QgdG8gZGlzcGxheSB3aXRoIGEgc2luZ2xlIENhbnZhcyBibG9ja1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IFJlbmRlcmVyLm51bUFjdGl2ZVJlbmRlcmVyczsgaSsrICkge1xuICAgICAgLy8gR3JhYiB0aGUgbmV4dC1tb3N0IHByZWZlcnJlZCByZW5kZXJlclxuICAgICAgY29uc3QgcmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIHByZWZlcnJlZFJlbmRlcmVycywgaSApO1xuXG4gICAgICAvLyBJZiBpdCdzIENhbnZhcywgY29uZ3JhdHMhIEV2ZXJ5dGhpbmcgd2lsbCByZW5kZXIgaW4gQ2FudmFzIChzaW5jZSBDYW52YXMgaXMgc3VwcG9ydGVkLCBhcyBub3RlZCBhYm92ZSlcbiAgICAgIGlmICggUmVuZGVyZXIuYml0bWFza0NhbnZhcyAmIHJlbmRlcmVyICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2luY2UgaXQncyBub3QgQ2FudmFzLCBpZiB0aGVyZSdzIGEgc2luZ2xlIHBhaW50ZWQgbm9kZSB0aGF0IHN1cHBvcnRzIHRoaXMgcmVuZGVyZXIgKHdoaWNoIGlzIHByZWZlcnJlZCBvdmVyIENhbnZhcyksXG4gICAgICAvLyB0aGVuIGl0IHdpbGwgYmUgcmVuZGVyZWQgd2l0aCB0aGlzIHJlbmRlcmVyLCBOT1QgQ2FudmFzLlxuICAgICAgaWYgKCB0aGlzLmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCByZW5kZXJlciApICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlOyAvLyBzYW5pdHkgY2hlY2tcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGF1ZGl0KCkge1xuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3VtbWFyeUJpdHM7IGkrKyApIHtcbiAgICAgICAgY29uc3QgYml0ID0gc3VtbWFyeUJpdHNbIGkgXTtcbiAgICAgICAgY29uc3QgY291bnRJc1plcm8gPSB0aGlzLl9jb3VudHNbIGkgXSA9PT0gMDtcbiAgICAgICAgY29uc3QgYml0bWFza0NvbnRhaW5zQml0ID0gISEoIHRoaXMuYml0bWFzayAmIGJpdCApO1xuICAgICAgICBhc3NlcnQoIGNvdW50SXNaZXJvID09PSBiaXRtYXNrQ29udGFpbnNCaXQsICdCaXRzIHNob3VsZCBiZSBzZXQgaWYgY291bnQgaXMgemVybycgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIGxldCByZXN1bHQgPSBSZW5kZXJlclN1bW1hcnkuYml0bWFza1RvU3RyaW5nKCB0aGlzLmJpdG1hc2sgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TdW1tYXJ5Qml0czsgaSsrICkge1xuICAgICAgY29uc3QgYml0ID0gc3VtbWFyeUJpdHNbIGkgXTtcbiAgICAgIGNvbnN0IGNvdW50Rm9yQml0ID0gdGhpcy5fY291bnRzWyBpIF07XG4gICAgICBpZiAoIGNvdW50Rm9yQml0ICE9PSAwICkge1xuICAgICAgICByZXN1bHQgKz0gYCAke1JlbmRlcmVyU3VtbWFyeS5iaXRUb1N0cmluZyggYml0ICl9OiR7Y291bnRGb3JCaXR9YDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoaWNoIG9mIHRoZSBzdW1tYXJ5IGJpdHMgY2FuIGJlIHNldCBmb3IgYSBzcGVjaWZpYyBOb2RlIChpZ25vcmluZyBjaGlsZHJlbi9hbmNlc3RvcnMpLlxuICAgKiBGb3IgaW5zdGFuY2UsIGZvciBiaXRtYXNrU2luZ2xlU1ZHLCB3ZSBvbmx5IGRvbid0IGluY2x1ZGUgdGhlIGZsYWcgaWYgVEhJUyBub2RlIHByZXZlbnRzIGl0cyB1c2FnZVxuICAgKiAoZXZlbiB0aG91Z2ggY2hpbGQgbm9kZXMgbWF5IHByZXZlbnQgaXQgaW4gdGhlIHJlbmRlcmVyIHN1bW1hcnkgaXRzZWxmKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICovXG4gIHN0YXRpYyBzdW1tYXJ5Qml0bWFza0Zvck5vZGVTZWxmKCBub2RlICkge1xuICAgIGxldCBiaXRtYXNrID0gbm9kZS5fcmVuZGVyZXJCaXRtYXNrO1xuXG4gICAgaWYgKCBub2RlLmlzUGFpbnRlZCgpICkge1xuICAgICAgYml0bWFzayB8PSAoICggbm9kZS5fcmVuZGVyZXJCaXRtYXNrICYgUmVuZGVyZXIuYml0bWFza0N1cnJlbnRSZW5kZXJlckFyZWEgKSBeIFJlbmRlcmVyLmJpdG1hc2tDdXJyZW50UmVuZGVyZXJBcmVhICkgPDwgUmVuZGVyZXIuYml0bWFza0xhY2tzU2hpZnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrQ3VycmVudFJlbmRlcmVyQXJlYSA8PCBSZW5kZXJlci5iaXRtYXNrTGFja3NTaGlmdDtcbiAgICB9XG5cbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgc2VlIEluc3RhbmNlLnVwZGF0ZVJlbmRlcmluZ1N0YXRlXG4gICAgY29uc3QgcmVxdWlyZXNTcGxpdCA9IG5vZGUuX2Nzc1RyYW5zZm9ybSB8fCBub2RlLl9sYXllclNwbGl0O1xuICAgIGNvbnN0IHJlbmRlcmVySGludCA9IG5vZGUuX3JlbmRlcmVyO1xuXG4gICAgLy8gV2hldGhlciB0aGlzIHN1YnRyZWUgd2lsbCBiZSBhYmxlIHRvIHN1cHBvcnQgYSBzaW5nbGUgU1ZHIGVsZW1lbnRcbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgc2VlIEluc3RhbmNlLnVwZGF0ZVJlbmRlcmluZ1N0YXRlXG4gICAgaWYgKCAhcmVxdWlyZXNTcGxpdCAmJiAvLyBDYW4ndCBoYXZlIGEgc2luZ2xlIFNWRyBlbGVtZW50IGlmIHdlIGFyZSBzcGxpdFxuICAgICAgICAgUmVuZGVyZXIuaXNTVkcoIG5vZGUuX3JlbmRlcmVyQml0bWFzayApICYmIC8vIElmIG91ciBub2RlIGRvZXNuJ3Qgc3VwcG9ydCBTVkcsIGNhbid0IGRvIGl0XG4gICAgICAgICAoICFyZW5kZXJlckhpbnQgfHwgUmVuZGVyZXIuaXNTVkcoIHJlbmRlcmVySGludCApICkgKSB7IC8vIENhbid0IGlmIGEgcmVuZGVyZXIgaGludCBpcyBzZXQgdG8gc29tZXRoaW5nIGVsc2VcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza1NpbmdsZVNWRztcbiAgICB9XG5cbiAgICAvLyBXaGV0aGVyIHRoaXMgc3VidHJlZSB3aWxsIGJlIGFibGUgdG8gc3VwcG9ydCBhIHNpbmdsZSBDYW52YXMgZWxlbWVudFxuICAgIC8vIE5PVEU6IElmIGNoYW5naW5nLCBzZWUgSW5zdGFuY2UudXBkYXRlUmVuZGVyaW5nU3RhdGVcbiAgICBpZiAoICFyZXF1aXJlc1NwbGl0ICYmIC8vIENhbid0IGhhdmUgYSBzaW5nbGUgU1ZHIGVsZW1lbnQgaWYgd2UgYXJlIHNwbGl0XG4gICAgICAgICBSZW5kZXJlci5pc0NhbnZhcyggbm9kZS5fcmVuZGVyZXJCaXRtYXNrICkgJiYgLy8gSWYgb3VyIG5vZGUgZG9lc24ndCBzdXBwb3J0IENhbnZhcywgY2FuJ3QgZG8gaXRcbiAgICAgICAgICggIXJlbmRlcmVySGludCB8fCBSZW5kZXJlci5pc0NhbnZhcyggcmVuZGVyZXJIaW50ICkgKSApIHsgLy8gQ2FuJ3QgaWYgYSByZW5kZXJlciBoaW50IGlzIHNldCB0byBzb21ldGhpbmcgZWxzZVxuICAgICAgYml0bWFzayB8PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlQ2FudmFzO1xuICAgIH1cblxuICAgIGlmICggIW5vZGUuaXNQYWludGVkKCkgKSB7XG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tOb3RQYWludGVkO1xuICAgIH1cbiAgICBpZiAoIG5vZGUuYXJlU2VsZkJvdW5kc1ZhbGlkKCkgKSB7XG4gICAgICBiaXRtYXNrIHw9IFJlbmRlcmVyLmJpdG1hc2tCb3VuZHNWYWxpZDtcbiAgICB9XG4gICAgaWYgKCAhbm9kZS5oYXNQRE9NQ29udGVudCAmJiAhbm9kZS5oYXNQRE9NT3JkZXIoKSApIHtcbiAgICAgIGJpdG1hc2sgfD0gUmVuZGVyZXIuYml0bWFza05vUERPTTtcbiAgICB9XG5cbiAgICByZXR1cm4gYml0bWFzaztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJpdFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGJpdFRvU3RyaW5nKCBiaXQgKSB7XG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSB7IHJldHVybiAnQ2FudmFzJzsgfVxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrU1ZHICkgeyByZXR1cm4gJ1NWRyc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0RPTSApIHsgcmV0dXJuICdET00nOyB9XG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHsgcmV0dXJuICdXZWJHTCc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0xhY2tzQ2FudmFzICkgeyByZXR1cm4gJygtQ2FudmFzKSc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0xhY2tzU1ZHICkgeyByZXR1cm4gJygtU1ZHKSc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0xhY2tzRE9NICkgeyByZXR1cm4gJygtRE9NKSc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0xhY2tzV2ViR0wgKSB7IHJldHVybiAnKC1XZWJHTCknOyB9XG4gICAgaWYgKCBiaXQgPT09IFJlbmRlcmVyLmJpdG1hc2tTaW5nbGVDYW52YXMgKSB7IHJldHVybiAnU2luZ2xlQ2FudmFzJzsgfVxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrU2luZ2xlU1ZHICkgeyByZXR1cm4gJ1NpbmdsZVNWRyc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza05vdFBhaW50ZWQgKSB7IHJldHVybiAnTm90UGFpbnRlZCc7IH1cbiAgICBpZiAoIGJpdCA9PT0gUmVuZGVyZXIuYml0bWFza0JvdW5kc1ZhbGlkICkgeyByZXR1cm4gJ0JvdW5kc1ZhbGlkJzsgfVxuICAgIGlmICggYml0ID09PSBSZW5kZXJlci5iaXRtYXNrTm9QRE9NICkgeyByZXR1cm4gJ05vdEFjY2Vzc2libGUnOyB9XG4gICAgcmV0dXJuICc/JztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgZGVidWdnaW5nIHB1cnBvc2VzXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2tcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBiaXRtYXNrVG9TdHJpbmcoIGJpdG1hc2sgKSB7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVN1bW1hcnlCaXRzOyBpKysgKSB7XG4gICAgICBjb25zdCBiaXQgPSBzdW1tYXJ5Qml0c1sgaSBdO1xuICAgICAgaWYgKCBiaXRtYXNrICYgYml0ICkge1xuICAgICAgICByZXN1bHQgKz0gYCR7UmVuZGVyZXJTdW1tYXJ5LmJpdFRvU3RyaW5nKCBiaXQgKX0gYDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG4vLyBAcHVibGljIHtudW1iZXJ9XG5SZW5kZXJlclN1bW1hcnkuYml0bWFza0FsbCA9IGJpdG1hc2tBbGw7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSZW5kZXJlclN1bW1hcnknLCBSZW5kZXJlclN1bW1hcnkgKTtcbmV4cG9ydCBkZWZhdWx0IFJlbmRlcmVyU3VtbWFyeTsiXSwibmFtZXMiOlsiTm9kZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsInN1bW1hcnlCaXRzIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tTVkciLCJiaXRtYXNrRE9NIiwiYml0bWFza1dlYkdMIiwiYml0bWFza1NpbmdsZUNhbnZhcyIsImJpdG1hc2tTaW5nbGVTVkciLCJiaXRtYXNrTm90UGFpbnRlZCIsImJpdG1hc2tCb3VuZHNWYWxpZCIsImJpdG1hc2tOb1BET00iLCJiaXRtYXNrTGFja3NDYW52YXMiLCJiaXRtYXNrTGFja3NTVkciLCJiaXRtYXNrTGFja3NET00iLCJiaXRtYXNrTGFja3NXZWJHTCIsInN1bW1hcnlCaXRJbmRpY2VzIiwiZm9yRWFjaCIsImJpdCIsImluZGV4IiwibnVtU3VtbWFyeUJpdHMiLCJsZW5ndGgiLCJiaXRtYXNrQWxsIiwibCIsIlJlbmRlcmVyU3VtbWFyeSIsInN1bW1hcnlDaGFuZ2UiLCJvbGRCaXRtYXNrIiwibmV3Qml0bWFzayIsImFzc2VydCIsImF1ZGl0IiwiY2hhbmdlQml0bWFzayIsImFuY2VzdG9yT2xkTWFzayIsImFuY2VzdG9yTmV3TWFzayIsImkiLCJiaXRJbmRleCIsIl9jb3VudHMiLCJvbGRTdWJ0cmVlQml0bWFzayIsImJpdG1hc2siLCJ1bmRlZmluZWQiLCJqIiwiYW5jZXN0b3JCaXQiLCJub2RlIiwiaW5zdGFuY2VSZWZyZXNoRW1pdHRlciIsImVtaXQiLCJvblN1bW1hcnlDaGFuZ2UiLCJsZW4iLCJfcGFyZW50cyIsImsiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiY29tcHV0ZUJpdG1hc2siLCJzZWxmQ2hhbmdlIiwic2VsZkJpdG1hc2siLCJzdW1tYXJ5Qml0bWFza0Zvck5vZGVTZWxmIiwiaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlIiwicmVuZGVyZXIiLCJpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSIsImJpdG1hc2tMYWNrc1NoaWZ0IiwiaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQiLCJpc1NpbmdsZVNWR1N1cHBvcnRlZCIsImlzTm90UGFpbnRlZCIsImhhc05vUERPTSIsImFyZUJvdW5kc1ZhbGlkIiwiaXNTdWJ0cmVlUmVuZGVyZWRFeGNsdXNpdmVseVNWRyIsInByZWZlcnJlZFJlbmRlcmVycyIsIm51bUFjdGl2ZVJlbmRlcmVycyIsImJpdG1hc2tPcmRlciIsImlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlDYW52YXMiLCJjb3VudElzWmVybyIsImJpdG1hc2tDb250YWluc0JpdCIsInRvU3RyaW5nIiwicmVzdWx0IiwiYml0bWFza1RvU3RyaW5nIiwiY291bnRGb3JCaXQiLCJiaXRUb1N0cmluZyIsIl9yZW5kZXJlckJpdG1hc2siLCJpc1BhaW50ZWQiLCJiaXRtYXNrQ3VycmVudFJlbmRlcmVyQXJlYSIsInJlcXVpcmVzU3BsaXQiLCJfY3NzVHJhbnNmb3JtIiwiX2xheWVyU3BsaXQiLCJyZW5kZXJlckhpbnQiLCJfcmVuZGVyZXIiLCJpc1NWRyIsImlzQ2FudmFzIiwiYXJlU2VsZkJvdW5kc1ZhbGlkIiwiaGFzUERPTUNvbnRlbnQiLCJoYXNQRE9NT3JkZXIiLCJjb25zdHJ1Y3RvciIsImJpdG1hc2tOb2RlRGVmYXVsdCIsIl9jaGlsZHJlbiIsIkludDE2QXJyYXkiLCJsaXN0ZW5lciIsImJpbmQiLCJmaWx0ZXJDaGFuZ2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjbGlwQXJlYVByb3BlcnR5Iiwi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