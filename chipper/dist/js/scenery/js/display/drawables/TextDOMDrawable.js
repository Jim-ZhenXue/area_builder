// Copyright 2016-2023, University of Colorado Boulder
/**
 * DOM drawable for Text nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../../dot/js/Matrix3.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { DOMSelfDrawable, scenery, TextStatefulDrawable, Utils } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepDOMTextElements = true; // whether we should pool DOM elements for the DOM rendering states, or whether we should free them when possible for memory
// scratch matrix used in DOM rendering
const scratchMatrix = Matrix3.pool.fetch();
let TextDOMDrawable = class TextDOMDrawable extends TextStatefulDrawable(DOMSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // only create elements if we don't already have them (we pool visual states always, and depending on the platform may also pool the actual elements to minimize
        // allocation and performance costs)
        if (!this.domElement) {
            // @protected {HTMLElement} - Our primary DOM element. This is exposed as part of the DOMSelfDrawable API.
            this.domElement = document.createElement('div');
            this.domElement.style.display = 'block';
            this.domElement.style.position = 'absolute';
            this.domElement.style.pointerEvents = 'none';
            this.domElement.style.left = '0';
            this.domElement.style.top = '0';
            this.domElement.setAttribute('dir', 'ltr');
        }
    }
    /**
   * Updates our DOM element so that its appearance matches our node's representation.
   * @protected
   *
   * This implements part of the DOMSelfDrawable required API for subtypes.
   */ updateDOM() {
        const node = this.node;
        const div = this.domElement;
        if (this.paintDirty) {
            if (this.dirtyFont) {
                div.style.font = node.getFont();
            }
            if (this.dirtyStroke) {
                div.style.color = node.getCSSFill();
            }
            if (this.dirtyBounds) {
                div.style.width = `${node.getSelfBounds().width}px`;
                div.style.height = `${node.getSelfBounds().height}px`;
            // TODO: do we require the jQuery versions here, or are they vestigial? https://github.com/phetsims/scenery/issues/1581
            // $div.width( node.getSelfBounds().width );
            // $div.height( node.getSelfBounds().height );
            }
            if (this.dirtyText) {
                div.textContent = node.renderedText;
            }
        }
        if (this.transformDirty || this.dirtyText || this.dirtyFont || this.dirtyBounds) {
            // shift the text vertically, postmultiplied with the entire transform.
            const yOffset = node.getSelfBounds().minY;
            scratchMatrix.set(this.getTransformMatrix());
            const translation = Matrix3.translation(0, yOffset);
            scratchMatrix.multiplyMatrix(translation);
            translation.freeToPool();
            Utils.applyPreparedTransform(scratchMatrix, div);
        }
        // clear all of the dirty flags
        this.setToCleanState();
        this.cleanPaintableState();
        this.transformDirty = false;
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        if (!keepDOMTextElements) {
            // clear the references
            this.domElement = null;
        }
        super.dispose();
    }
    /**
   * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
   * @param {Instance} instance
   */ constructor(renderer, instance){
        super(renderer, instance);
        // Apply CSS needed for future CSS transforms to work properly. Just do this once for performance
        Utils.prepareForTransform(this.domElement);
    }
};
scenery.register('TextDOMDrawable', TextDOMDrawable);
Poolable.mixInto(TextDOMDrawable);
export default TextDOMDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvVGV4dERPTURyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERPTSBkcmF3YWJsZSBmb3IgVGV4dCBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XG5pbXBvcnQgeyBET01TZWxmRHJhd2FibGUsIHNjZW5lcnksIFRleHRTdGF0ZWZ1bERyYXdhYmxlLCBVdGlscyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBET01UZXh0RWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIERPTSBlbGVtZW50cyBmb3IgdGhlIERPTSByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XG5cbi8vIHNjcmF0Y2ggbWF0cml4IHVzZWQgaW4gRE9NIHJlbmRlcmluZ1xuY29uc3Qgc2NyYXRjaE1hdHJpeCA9IE1hdHJpeDMucG9vbC5mZXRjaCgpO1xuXG5jbGFzcyBUZXh0RE9NRHJhd2FibGUgZXh0ZW5kcyBUZXh0U3RhdGVmdWxEcmF3YWJsZSggRE9NU2VsZkRyYXdhYmxlICkge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gUmVuZGVyZXIgYml0bWFzaywgc2VlIFJlbmRlcmVyJ3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlciggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBBcHBseSBDU1MgbmVlZGVkIGZvciBmdXR1cmUgQ1NTIHRyYW5zZm9ybXMgdG8gd29yayBwcm9wZXJseS4gSnVzdCBkbyB0aGlzIG9uY2UgZm9yIHBlcmZvcm1hbmNlXG4gICAgVXRpbHMucHJlcGFyZUZvclRyYW5zZm9ybSggdGhpcy5kb21FbGVtZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBvbmx5IGNyZWF0ZSBlbGVtZW50cyBpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgdGhlbSAod2UgcG9vbCB2aXN1YWwgc3RhdGVzIGFsd2F5cywgYW5kIGRlcGVuZGluZyBvbiB0aGUgcGxhdGZvcm0gbWF5IGFsc28gcG9vbCB0aGUgYWN0dWFsIGVsZW1lbnRzIHRvIG1pbmltaXplXG4gICAgLy8gYWxsb2NhdGlvbiBhbmQgcGVyZm9ybWFuY2UgY29zdHMpXG4gICAgaWYgKCAhdGhpcy5kb21FbGVtZW50ICkge1xuICAgICAgLy8gQHByb3RlY3RlZCB7SFRNTEVsZW1lbnR9IC0gT3VyIHByaW1hcnkgRE9NIGVsZW1lbnQuIFRoaXMgaXMgZXhwb3NlZCBhcyBwYXJ0IG9mIHRoZSBET01TZWxmRHJhd2FibGUgQVBJLlxuICAgICAgdGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoICdkaXInLCAnbHRyJyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIG91ciBET00gZWxlbWVudCBzbyB0aGF0IGl0cyBhcHBlYXJhbmNlIG1hdGNoZXMgb3VyIG5vZGUncyByZXByZXNlbnRhdGlvbi5cbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBUaGlzIGltcGxlbWVudHMgcGFydCBvZiB0aGUgRE9NU2VsZkRyYXdhYmxlIHJlcXVpcmVkIEFQSSBmb3Igc3VidHlwZXMuXG4gICAqL1xuICB1cGRhdGVET00oKSB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZTtcblxuICAgIGNvbnN0IGRpdiA9IHRoaXMuZG9tRWxlbWVudDtcblxuICAgIGlmICggdGhpcy5wYWludERpcnR5ICkge1xuICAgICAgaWYgKCB0aGlzLmRpcnR5Rm9udCApIHtcbiAgICAgICAgZGl2LnN0eWxlLmZvbnQgPSBub2RlLmdldEZvbnQoKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5kaXJ0eVN0cm9rZSApIHtcbiAgICAgICAgZGl2LnN0eWxlLmNvbG9yID0gbm9kZS5nZXRDU1NGaWxsKCk7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMuZGlydHlCb3VuZHMgKSB7IC8vIFRPRE86IHRoaXMgY29uZGl0aW9uIGlzIHNldCBvbiBpbnZhbGlkYXRlVGV4dCwgc28gaXQncyBhbG1vc3QgYWx3YXlzIHRydWU/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIGRpdi5zdHlsZS53aWR0aCA9IGAke25vZGUuZ2V0U2VsZkJvdW5kcygpLndpZHRofXB4YDtcbiAgICAgICAgZGl2LnN0eWxlLmhlaWdodCA9IGAke25vZGUuZ2V0U2VsZkJvdW5kcygpLmhlaWdodH1weGA7XG4gICAgICAgIC8vIFRPRE86IGRvIHdlIHJlcXVpcmUgdGhlIGpRdWVyeSB2ZXJzaW9ucyBoZXJlLCBvciBhcmUgdGhleSB2ZXN0aWdpYWw/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIC8vICRkaXYud2lkdGgoIG5vZGUuZ2V0U2VsZkJvdW5kcygpLndpZHRoICk7XG4gICAgICAgIC8vICRkaXYuaGVpZ2h0KCBub2RlLmdldFNlbGZCb3VuZHMoKS5oZWlnaHQgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5kaXJ0eVRleHQgKSB7XG4gICAgICAgIGRpdi50ZXh0Q29udGVudCA9IG5vZGUucmVuZGVyZWRUZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy50cmFuc2Zvcm1EaXJ0eSB8fCB0aGlzLmRpcnR5VGV4dCB8fCB0aGlzLmRpcnR5Rm9udCB8fCB0aGlzLmRpcnR5Qm91bmRzICkge1xuICAgICAgLy8gc2hpZnQgdGhlIHRleHQgdmVydGljYWxseSwgcG9zdG11bHRpcGxpZWQgd2l0aCB0aGUgZW50aXJlIHRyYW5zZm9ybS5cbiAgICAgIGNvbnN0IHlPZmZzZXQgPSBub2RlLmdldFNlbGZCb3VuZHMoKS5taW5ZO1xuICAgICAgc2NyYXRjaE1hdHJpeC5zZXQoIHRoaXMuZ2V0VHJhbnNmb3JtTWF0cml4KCkgKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gTWF0cml4My50cmFuc2xhdGlvbiggMCwgeU9mZnNldCApO1xuICAgICAgc2NyYXRjaE1hdHJpeC5tdWx0aXBseU1hdHJpeCggdHJhbnNsYXRpb24gKTtcbiAgICAgIHRyYW5zbGF0aW9uLmZyZWVUb1Bvb2woKTtcbiAgICAgIFV0aWxzLmFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oIHNjcmF0Y2hNYXRyaXgsIGRpdiApO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3NcbiAgICB0aGlzLnNldFRvQ2xlYW5TdGF0ZSgpO1xuICAgIHRoaXMuY2xlYW5QYWludGFibGVTdGF0ZSgpO1xuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgZHJhd2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIGlmICggIWtlZXBET01UZXh0RWxlbWVudHMgKSB7XG4gICAgICAvLyBjbGVhciB0aGUgcmVmZXJlbmNlc1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1RleHRET01EcmF3YWJsZScsIFRleHRET01EcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBUZXh0RE9NRHJhd2FibGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dERPTURyYXdhYmxlOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiUG9vbGFibGUiLCJET01TZWxmRHJhd2FibGUiLCJzY2VuZXJ5IiwiVGV4dFN0YXRlZnVsRHJhd2FibGUiLCJVdGlscyIsImtlZXBET01UZXh0RWxlbWVudHMiLCJzY3JhdGNoTWF0cml4IiwicG9vbCIsImZldGNoIiwiVGV4dERPTURyYXdhYmxlIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJkb21FbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJkaXNwbGF5IiwicG9zaXRpb24iLCJwb2ludGVyRXZlbnRzIiwibGVmdCIsInRvcCIsInNldEF0dHJpYnV0ZSIsInVwZGF0ZURPTSIsIm5vZGUiLCJkaXYiLCJwYWludERpcnR5IiwiZGlydHlGb250IiwiZm9udCIsImdldEZvbnQiLCJkaXJ0eVN0cm9rZSIsImNvbG9yIiwiZ2V0Q1NTRmlsbCIsImRpcnR5Qm91bmRzIiwid2lkdGgiLCJnZXRTZWxmQm91bmRzIiwiaGVpZ2h0IiwiZGlydHlUZXh0IiwidGV4dENvbnRlbnQiLCJyZW5kZXJlZFRleHQiLCJ0cmFuc2Zvcm1EaXJ0eSIsInlPZmZzZXQiLCJtaW5ZIiwic2V0IiwiZ2V0VHJhbnNmb3JtTWF0cml4IiwidHJhbnNsYXRpb24iLCJtdWx0aXBseU1hdHJpeCIsImZyZWVUb1Bvb2wiLCJhcHBseVByZXBhcmVkVHJhbnNmb3JtIiwic2V0VG9DbGVhblN0YXRlIiwiY2xlYW5QYWludGFibGVTdGF0ZSIsImRpc3Bvc2UiLCJjb25zdHJ1Y3RvciIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLG9CQUFvQixFQUFFQyxLQUFLLFFBQVEsbUJBQW1CO0FBRXpGLG9JQUFvSTtBQUNwSSxNQUFNQyxzQkFBc0IsTUFBTSw0SEFBNEg7QUFFOUosdUNBQXVDO0FBQ3ZDLE1BQU1DLGdCQUFnQlAsUUFBUVEsSUFBSSxDQUFDQyxLQUFLO0FBRXhDLElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCTixxQkFBc0JGO0lBWWxEOzs7Ozs7R0FNQyxHQUNEUyxXQUFZQyxRQUFR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