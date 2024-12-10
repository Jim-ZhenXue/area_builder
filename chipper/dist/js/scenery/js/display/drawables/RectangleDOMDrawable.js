// Copyright 2016-2023, University of Colorado Boulder
/**
 * DOM drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../../dot/js/Matrix3.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { DOMSelfDrawable, Features, RectangleStatefulDrawable, scenery, Utils } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepDOMRectangleElements = true; // whether we should pool DOM elements for the DOM rendering states, or whether we should free them when possible for memory
// scratch matrix used in DOM rendering
const scratchMatrix = Matrix3.pool.fetch();
let RectangleDOMDrawable = class RectangleDOMDrawable extends RectangleStatefulDrawable(DOMSelfDrawable) {
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
        if (!this.fillElement || !this.strokeElement) {
            const fillElement = document.createElement('div');
            this.fillElement = fillElement;
            fillElement.style.display = 'block';
            fillElement.style.position = 'absolute';
            fillElement.style.left = '0';
            fillElement.style.top = '0';
            fillElement.style.pointerEvents = 'none';
            const strokeElement = document.createElement('div');
            this.strokeElement = strokeElement;
            strokeElement.style.display = 'block';
            strokeElement.style.position = 'absolute';
            strokeElement.style.left = '0';
            strokeElement.style.top = '0';
            strokeElement.style.pointerEvents = 'none';
            fillElement.appendChild(strokeElement);
        }
        // @protected {HTMLElement} - Our primary DOM element. This is exposed as part of the DOMSelfDrawable API.
        this.domElement = this.fillElement;
    }
    /**
   * Updates our DOM element so that its appearance matches our node's representation.
   * @protected
   *
   * This implements part of the DOMSelfDrawable required API for subtypes.
   */ updateDOM() {
        const node = this.node;
        const fillElement = this.fillElement;
        const strokeElement = this.strokeElement;
        if (this.paintDirty) {
            const borderRadius = Math.min(node._cornerXRadius, node._cornerYRadius);
            const borderRadiusDirty = this.dirtyCornerXRadius || this.dirtyCornerYRadius;
            if (this.dirtyWidth) {
                fillElement.style.width = `${node._rectWidth}px`;
            }
            if (this.dirtyHeight) {
                fillElement.style.height = `${node._rectHeight}px`;
            }
            if (borderRadiusDirty) {
                fillElement.style[Features.borderRadius] = `${borderRadius}px`; // if one is zero, we are not rounded, so we do the min here
            }
            if (this.dirtyFill) {
                fillElement.style.backgroundColor = node.getCSSFill();
            }
            if (this.dirtyStroke) {
                // update stroke presence
                if (node.hasStroke()) {
                    strokeElement.style.borderStyle = 'solid';
                } else {
                    strokeElement.style.borderStyle = 'none';
                }
            }
            if (node.hasStroke()) {
                // since we only execute these if we have a stroke, we need to redo everything if there was no stroke previously.
                // the other option would be to update stroked information when there is no stroke (major performance loss for fill-only rectangles)
                const hadNoStrokeBefore = !this.hadStroke;
                if (hadNoStrokeBefore || this.dirtyWidth || this.dirtyLineWidth) {
                    strokeElement.style.width = `${node._rectWidth - node.getLineWidth()}px`;
                }
                if (hadNoStrokeBefore || this.dirtyHeight || this.dirtyLineWidth) {
                    strokeElement.style.height = `${node._rectHeight - node.getLineWidth()}px`;
                }
                if (hadNoStrokeBefore || this.dirtyLineWidth) {
                    strokeElement.style.left = `${-node.getLineWidth() / 2}px`;
                    strokeElement.style.top = `${-node.getLineWidth() / 2}px`;
                    strokeElement.style.borderWidth = `${node.getLineWidth()}px`;
                }
                if (hadNoStrokeBefore || this.dirtyStroke) {
                    strokeElement.style.borderColor = node.getSimpleCSSStroke();
                }
                if (hadNoStrokeBefore || borderRadiusDirty || this.dirtyLineWidth || this.dirtyLineOptions) {
                    strokeElement.style[Features.borderRadius] = node.isRounded() || node.getLineJoin() === 'round' ? `${borderRadius + node.getLineWidth() / 2}px` : '0';
                }
            }
        }
        // shift the element vertically, postmultiplied with the entire transform.
        if (this.transformDirty || this.dirtyX || this.dirtyY) {
            scratchMatrix.set(this.getTransformMatrix());
            const translation = Matrix3.translation(node._rectX, node._rectY);
            scratchMatrix.multiplyMatrix(translation);
            translation.freeToPool();
            Utils.applyPreparedTransform(scratchMatrix, this.fillElement);
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
        if (!keepDOMRectangleElements) {
            // clear the references
            this.fillElement = null;
            this.strokeElement = null;
            this.domElement = null;
        }
        super.dispose();
    }
    /**
   * @param {number} renderer
   * @param {Instance} instance
   */ constructor(renderer, instance){
        super(renderer, instance);
        // Apply CSS needed for future CSS transforms to work properly.
        Utils.prepareForTransform(this.domElement);
    }
};
scenery.register('RectangleDOMDrawable', RectangleDOMDrawable);
Poolable.mixInto(RectangleDOMDrawable);
export default RectangleDOMDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUmVjdGFuZ2xlRE9NRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRE9NIGRyYXdhYmxlIGZvciBSZWN0YW5nbGUgbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgRE9NU2VsZkRyYXdhYmxlLCBGZWF0dXJlcywgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgVXRpbHMgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gVE9ETzogY2hhbmdlIHRoaXMgYmFzZWQgb24gbWVtb3J5IGFuZCBwZXJmb3JtYW5jZSBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlIHBsYXRmb3JtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5jb25zdCBrZWVwRE9NUmVjdGFuZ2xlRWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIERPTSBlbGVtZW50cyBmb3IgdGhlIERPTSByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XG5cbi8vIHNjcmF0Y2ggbWF0cml4IHVzZWQgaW4gRE9NIHJlbmRlcmluZ1xuY29uc3Qgc2NyYXRjaE1hdHJpeCA9IE1hdHJpeDMucG9vbC5mZXRjaCgpO1xuXG5jbGFzcyBSZWN0YW5nbGVET01EcmF3YWJsZSBleHRlbmRzIFJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUoIERPTVNlbGZEcmF3YWJsZSApIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlciggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBBcHBseSBDU1MgbmVlZGVkIGZvciBmdXR1cmUgQ1NTIHRyYW5zZm9ybXMgdG8gd29yayBwcm9wZXJseS5cbiAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCB0aGlzLmRvbUVsZW1lbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcblxuICAgIC8vIG9ubHkgY3JlYXRlIGVsZW1lbnRzIGlmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSB0aGVtICh3ZSBwb29sIHZpc3VhbCBzdGF0ZXMgYWx3YXlzLCBhbmQgZGVwZW5kaW5nIG9uIHRoZSBwbGF0Zm9ybSBtYXkgYWxzbyBwb29sIHRoZSBhY3R1YWwgZWxlbWVudHMgdG8gbWluaW1pemVcbiAgICAvLyBhbGxvY2F0aW9uIGFuZCBwZXJmb3JtYW5jZSBjb3N0cylcbiAgICBpZiAoICF0aGlzLmZpbGxFbGVtZW50IHx8ICF0aGlzLnN0cm9rZUVsZW1lbnQgKSB7XG4gICAgICBjb25zdCBmaWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgICB0aGlzLmZpbGxFbGVtZW50ID0gZmlsbEVsZW1lbnQ7XG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgIGZpbGxFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIGZpbGxFbGVtZW50LnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgICBjb25zdCBzdHJva2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAgIHRoaXMuc3Ryb2tlRWxlbWVudCA9IHN0cm9rZUVsZW1lbnQ7XG4gICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICBzdHJva2VFbGVtZW50LnN0eWxlLnRvcCA9ICcwJztcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgIGZpbGxFbGVtZW50LmFwcGVuZENoaWxkKCBzdHJva2VFbGVtZW50ICk7XG4gICAgfVxuXG4gICAgLy8gQHByb3RlY3RlZCB7SFRNTEVsZW1lbnR9IC0gT3VyIHByaW1hcnkgRE9NIGVsZW1lbnQuIFRoaXMgaXMgZXhwb3NlZCBhcyBwYXJ0IG9mIHRoZSBET01TZWxmRHJhd2FibGUgQVBJLlxuICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMuZmlsbEVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBvdXIgRE9NIGVsZW1lbnQgc28gdGhhdCBpdHMgYXBwZWFyYW5jZSBtYXRjaGVzIG91ciBub2RlJ3MgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwcm90ZWN0ZWRcbiAgICpcbiAgICogVGhpcyBpbXBsZW1lbnRzIHBhcnQgb2YgdGhlIERPTVNlbGZEcmF3YWJsZSByZXF1aXJlZCBBUEkgZm9yIHN1YnR5cGVzLlxuICAgKi9cbiAgdXBkYXRlRE9NKCkge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgY29uc3QgZmlsbEVsZW1lbnQgPSB0aGlzLmZpbGxFbGVtZW50O1xuICAgIGNvbnN0IHN0cm9rZUVsZW1lbnQgPSB0aGlzLnN0cm9rZUVsZW1lbnQ7XG5cbiAgICBpZiAoIHRoaXMucGFpbnREaXJ0eSApIHtcbiAgICAgIGNvbnN0IGJvcmRlclJhZGl1cyA9IE1hdGgubWluKCBub2RlLl9jb3JuZXJYUmFkaXVzLCBub2RlLl9jb3JuZXJZUmFkaXVzICk7XG4gICAgICBjb25zdCBib3JkZXJSYWRpdXNEaXJ0eSA9IHRoaXMuZGlydHlDb3JuZXJYUmFkaXVzIHx8IHRoaXMuZGlydHlDb3JuZXJZUmFkaXVzO1xuXG4gICAgICBpZiAoIHRoaXMuZGlydHlXaWR0aCApIHtcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHtub2RlLl9yZWN0V2lkdGh9cHhgO1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLmRpcnR5SGVpZ2h0ICkge1xuICAgICAgICBmaWxsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHtub2RlLl9yZWN0SGVpZ2h0fXB4YDtcbiAgICAgIH1cbiAgICAgIGlmICggYm9yZGVyUmFkaXVzRGlydHkgKSB7XG4gICAgICAgIGZpbGxFbGVtZW50LnN0eWxlWyBGZWF0dXJlcy5ib3JkZXJSYWRpdXMgXSA9IGAke2JvcmRlclJhZGl1c31weGA7IC8vIGlmIG9uZSBpcyB6ZXJvLCB3ZSBhcmUgbm90IHJvdW5kZWQsIHNvIHdlIGRvIHRoZSBtaW4gaGVyZVxuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLmRpcnR5RmlsbCApIHtcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gbm9kZS5nZXRDU1NGaWxsKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5kaXJ0eVN0cm9rZSApIHtcbiAgICAgICAgLy8gdXBkYXRlIHN0cm9rZSBwcmVzZW5jZVxuICAgICAgICBpZiAoIG5vZGUuaGFzU3Ryb2tlKCkgKSB7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJTdHlsZSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIG5vZGUuaGFzU3Ryb2tlKCkgKSB7XG4gICAgICAgIC8vIHNpbmNlIHdlIG9ubHkgZXhlY3V0ZSB0aGVzZSBpZiB3ZSBoYXZlIGEgc3Ryb2tlLCB3ZSBuZWVkIHRvIHJlZG8gZXZlcnl0aGluZyBpZiB0aGVyZSB3YXMgbm8gc3Ryb2tlIHByZXZpb3VzbHkuXG4gICAgICAgIC8vIHRoZSBvdGhlciBvcHRpb24gd291bGQgYmUgdG8gdXBkYXRlIHN0cm9rZWQgaW5mb3JtYXRpb24gd2hlbiB0aGVyZSBpcyBubyBzdHJva2UgKG1ham9yIHBlcmZvcm1hbmNlIGxvc3MgZm9yIGZpbGwtb25seSByZWN0YW5nbGVzKVxuICAgICAgICBjb25zdCBoYWROb1N0cm9rZUJlZm9yZSA9ICF0aGlzLmhhZFN0cm9rZTtcblxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlXaWR0aCB8fCB0aGlzLmRpcnR5TGluZVdpZHRoICkge1xuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHtub2RlLl9yZWN0V2lkdGggLSBub2RlLmdldExpbmVXaWR0aCgpfXB4YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlIZWlnaHQgfHwgdGhpcy5kaXJ0eUxpbmVXaWR0aCApIHtcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmhlaWdodCA9IGAke25vZGUuX3JlY3RIZWlnaHQgLSBub2RlLmdldExpbmVXaWR0aCgpfXB4YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlMaW5lV2lkdGggKSB7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7LW5vZGUuZ2V0TGluZVdpZHRoKCkgLyAyfXB4YDtcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlLnRvcCA9IGAkey1ub2RlLmdldExpbmVXaWR0aCgpIC8gMn1weGA7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJXaWR0aCA9IGAke25vZGUuZ2V0TGluZVdpZHRoKCl9cHhgO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBoYWROb1N0cm9rZUJlZm9yZSB8fCB0aGlzLmRpcnR5U3Ryb2tlICkge1xuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUuYm9yZGVyQ29sb3IgPSBub2RlLmdldFNpbXBsZUNTU1N0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBoYWROb1N0cm9rZUJlZm9yZSB8fCBib3JkZXJSYWRpdXNEaXJ0eSB8fCB0aGlzLmRpcnR5TGluZVdpZHRoIHx8IHRoaXMuZGlydHlMaW5lT3B0aW9ucyApIHtcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlWyBGZWF0dXJlcy5ib3JkZXJSYWRpdXMgXSA9ICggbm9kZS5pc1JvdW5kZWQoKSB8fCBub2RlLmdldExpbmVKb2luKCkgPT09ICdyb3VuZCcgKSA/IGAke2JvcmRlclJhZGl1cyArIG5vZGUuZ2V0TGluZVdpZHRoKCkgLyAyfXB4YCA6ICcwJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNoaWZ0IHRoZSBlbGVtZW50IHZlcnRpY2FsbHksIHBvc3RtdWx0aXBsaWVkIHdpdGggdGhlIGVudGlyZSB0cmFuc2Zvcm0uXG4gICAgaWYgKCB0aGlzLnRyYW5zZm9ybURpcnR5IHx8IHRoaXMuZGlydHlYIHx8IHRoaXMuZGlydHlZICkge1xuICAgICAgc2NyYXRjaE1hdHJpeC5zZXQoIHRoaXMuZ2V0VHJhbnNmb3JtTWF0cml4KCkgKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gTWF0cml4My50cmFuc2xhdGlvbiggbm9kZS5fcmVjdFgsIG5vZGUuX3JlY3RZICk7XG4gICAgICBzY3JhdGNoTWF0cml4Lm11bHRpcGx5TWF0cml4KCB0cmFuc2xhdGlvbiApO1xuICAgICAgdHJhbnNsYXRpb24uZnJlZVRvUG9vbCgpO1xuICAgICAgVXRpbHMuYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSggc2NyYXRjaE1hdHJpeCwgdGhpcy5maWxsRWxlbWVudCApO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGFsbCBvZiB0aGUgZGlydHkgZmxhZ3NcbiAgICB0aGlzLnNldFRvQ2xlYW5TdGF0ZSgpO1xuICAgIHRoaXMuY2xlYW5QYWludGFibGVTdGF0ZSgpO1xuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgZHJhd2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIGlmICggIWtlZXBET01SZWN0YW5nbGVFbGVtZW50cyApIHtcbiAgICAgIC8vIGNsZWFyIHRoZSByZWZlcmVuY2VzXG4gICAgICB0aGlzLmZpbGxFbGVtZW50ID0gbnVsbDtcbiAgICAgIHRoaXMuc3Ryb2tlRWxlbWVudCA9IG51bGw7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSBudWxsO1xuICAgIH1cblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmVjdGFuZ2xlRE9NRHJhd2FibGUnLCBSZWN0YW5nbGVET01EcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBSZWN0YW5nbGVET01EcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBSZWN0YW5nbGVET01EcmF3YWJsZTsiXSwibmFtZXMiOlsiTWF0cml4MyIsIlBvb2xhYmxlIiwiRE9NU2VsZkRyYXdhYmxlIiwiRmVhdHVyZXMiLCJSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsIlV0aWxzIiwia2VlcERPTVJlY3RhbmdsZUVsZW1lbnRzIiwic2NyYXRjaE1hdHJpeCIsInBvb2wiLCJmZXRjaCIsIlJlY3RhbmdsZURPTURyYXdhYmxlIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJmaWxsRWxlbWVudCIsInN0cm9rZUVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJwb2ludGVyRXZlbnRzIiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwidXBkYXRlRE9NIiwibm9kZSIsInBhaW50RGlydHkiLCJib3JkZXJSYWRpdXMiLCJNYXRoIiwibWluIiwiX2Nvcm5lclhSYWRpdXMiLCJfY29ybmVyWVJhZGl1cyIsImJvcmRlclJhZGl1c0RpcnR5IiwiZGlydHlDb3JuZXJYUmFkaXVzIiwiZGlydHlDb3JuZXJZUmFkaXVzIiwiZGlydHlXaWR0aCIsIndpZHRoIiwiX3JlY3RXaWR0aCIsImRpcnR5SGVpZ2h0IiwiaGVpZ2h0IiwiX3JlY3RIZWlnaHQiLCJkaXJ0eUZpbGwiLCJiYWNrZ3JvdW5kQ29sb3IiLCJnZXRDU1NGaWxsIiwiZGlydHlTdHJva2UiLCJoYXNTdHJva2UiLCJib3JkZXJTdHlsZSIsImhhZE5vU3Ryb2tlQmVmb3JlIiwiaGFkU3Ryb2tlIiwiZGlydHlMaW5lV2lkdGgiLCJnZXRMaW5lV2lkdGgiLCJib3JkZXJXaWR0aCIsImJvcmRlckNvbG9yIiwiZ2V0U2ltcGxlQ1NTU3Ryb2tlIiwiZGlydHlMaW5lT3B0aW9ucyIsImlzUm91bmRlZCIsImdldExpbmVKb2luIiwidHJhbnNmb3JtRGlydHkiLCJkaXJ0eVgiLCJkaXJ0eVkiLCJzZXQiLCJnZXRUcmFuc2Zvcm1NYXRyaXgiLCJ0cmFuc2xhdGlvbiIsIl9yZWN0WCIsIl9yZWN0WSIsIm11bHRpcGx5TWF0cml4IiwiZnJlZVRvUG9vbCIsImFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0iLCJzZXRUb0NsZWFuU3RhdGUiLCJjbGVhblBhaW50YWJsZVN0YXRlIiwiZGlzcG9zZSIsImNvbnN0cnVjdG9yIiwicHJlcGFyZUZvclRyYW5zZm9ybSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxlQUFlLEVBQUVDLFFBQVEsRUFBRUMseUJBQXlCLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxRQUFRLG1CQUFtQjtBQUV4RyxvSUFBb0k7QUFDcEksTUFBTUMsMkJBQTJCLE1BQU0sNEhBQTRIO0FBRW5LLHVDQUF1QztBQUN2QyxNQUFNQyxnQkFBZ0JSLFFBQVFTLElBQUksQ0FBQ0MsS0FBSztBQUV4QyxJQUFBLEFBQU1DLHVCQUFOLE1BQU1BLDZCQUE2QlAsMEJBQTJCRjtJQVk1RDs7Ozs7O0dBTUMsR0FDRFUsV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7UUFDL0IsS0FBSyxDQUFDRixXQUFZQyxVQUFVQztRQUU1QixnS0FBZ0s7UUFDaEssb0NBQW9DO1FBQ3BDLElBQUssQ0FBQyxJQUFJLENBQUNDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQ0MsYUFBYSxFQUFHO1lBQzlDLE1BQU1ELGNBQWNFLFNBQVNDLGFBQWEsQ0FBRTtZQUM1QyxJQUFJLENBQUNILFdBQVcsR0FBR0E7WUFDbkJBLFlBQVlJLEtBQUssQ0FBQ0MsT0FBTyxHQUFHO1lBQzVCTCxZQUFZSSxLQUFLLENBQUNFLFFBQVEsR0FBRztZQUM3Qk4sWUFBWUksS0FBSyxDQUFDRyxJQUFJLEdBQUc7WUFDekJQLFlBQVlJLEtBQUssQ0FBQ0ksR0FBRyxHQUFHO1lBQ3hCUixZQUFZSSxLQUFLLENBQUNLLGFBQWEsR0FBRztZQUVsQyxNQUFNUixnQkFBZ0JDLFNBQVNDLGFBQWEsQ0FBRTtZQUM5QyxJQUFJLENBQUNGLGFBQWEsR0FBR0E7WUFDckJBLGNBQWNHLEtBQUssQ0FBQ0MsT0FBTyxHQUFHO1lBQzlCSixjQUFjRyxLQUFLLENBQUNFLFFBQVEsR0FBRztZQUMvQkwsY0FBY0csS0FBSyxDQUFDRyxJQUFJLEdBQUc7WUFDM0JOLGNBQWNHLEtBQUssQ0FBQ0ksR0FBRyxHQUFHO1lBQzFCUCxjQUFjRyxLQUFLLENBQUNLLGFBQWEsR0FBRztZQUNwQ1QsWUFBWVUsV0FBVyxDQUFFVDtRQUMzQjtRQUVBLDBHQUEwRztRQUMxRyxJQUFJLENBQUNVLFVBQVUsR0FBRyxJQUFJLENBQUNYLFdBQVc7SUFDcEM7SUFFQTs7Ozs7R0FLQyxHQUNEWSxZQUFZO1FBQ1YsTUFBTUMsT0FBTyxJQUFJLENBQUNBLElBQUk7UUFDdEIsTUFBTWIsY0FBYyxJQUFJLENBQUNBLFdBQVc7UUFDcEMsTUFBTUMsZ0JBQWdCLElBQUksQ0FBQ0EsYUFBYTtRQUV4QyxJQUFLLElBQUksQ0FBQ2EsVUFBVSxFQUFHO1lBQ3JCLE1BQU1DLGVBQWVDLEtBQUtDLEdBQUcsQ0FBRUosS0FBS0ssY0FBYyxFQUFFTCxLQUFLTSxjQUFjO1lBQ3ZFLE1BQU1DLG9CQUFvQixJQUFJLENBQUNDLGtCQUFrQixJQUFJLElBQUksQ0FBQ0Msa0JBQWtCO1lBRTVFLElBQUssSUFBSSxDQUFDQyxVQUFVLEVBQUc7Z0JBQ3JCdkIsWUFBWUksS0FBSyxDQUFDb0IsS0FBSyxHQUFHLEdBQUdYLEtBQUtZLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDbEQ7WUFDQSxJQUFLLElBQUksQ0FBQ0MsV0FBVyxFQUFHO2dCQUN0QjFCLFlBQVlJLEtBQUssQ0FBQ3VCLE1BQU0sR0FBRyxHQUFHZCxLQUFLZSxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3BEO1lBQ0EsSUFBS1IsbUJBQW9CO2dCQUN2QnBCLFlBQVlJLEtBQUssQ0FBRWhCLFNBQVMyQixZQUFZLENBQUUsR0FBRyxHQUFHQSxhQUFhLEVBQUUsQ0FBQyxFQUFFLDREQUE0RDtZQUNoSTtZQUNBLElBQUssSUFBSSxDQUFDYyxTQUFTLEVBQUc7Z0JBQ3BCN0IsWUFBWUksS0FBSyxDQUFDMEIsZUFBZSxHQUFHakIsS0FBS2tCLFVBQVU7WUFDckQ7WUFFQSxJQUFLLElBQUksQ0FBQ0MsV0FBVyxFQUFHO2dCQUN0Qix5QkFBeUI7Z0JBQ3pCLElBQUtuQixLQUFLb0IsU0FBUyxJQUFLO29CQUN0QmhDLGNBQWNHLEtBQUssQ0FBQzhCLFdBQVcsR0FBRztnQkFDcEMsT0FDSztvQkFDSGpDLGNBQWNHLEtBQUssQ0FBQzhCLFdBQVcsR0FBRztnQkFDcEM7WUFDRjtZQUVBLElBQUtyQixLQUFLb0IsU0FBUyxJQUFLO2dCQUN0QixpSEFBaUg7Z0JBQ2pILG9JQUFvSTtnQkFDcEksTUFBTUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDQyxTQUFTO2dCQUV6QyxJQUFLRCxxQkFBcUIsSUFBSSxDQUFDWixVQUFVLElBQUksSUFBSSxDQUFDYyxjQUFjLEVBQUc7b0JBQ2pFcEMsY0FBY0csS0FBSyxDQUFDb0IsS0FBSyxHQUFHLEdBQUdYLEtBQUtZLFVBQVUsR0FBR1osS0FBS3lCLFlBQVksR0FBRyxFQUFFLENBQUM7Z0JBQzFFO2dCQUNBLElBQUtILHFCQUFxQixJQUFJLENBQUNULFdBQVcsSUFBSSxJQUFJLENBQUNXLGNBQWMsRUFBRztvQkFDbEVwQyxjQUFjRyxLQUFLLENBQUN1QixNQUFNLEdBQUcsR0FBR2QsS0FBS2UsV0FBVyxHQUFHZixLQUFLeUIsWUFBWSxHQUFHLEVBQUUsQ0FBQztnQkFDNUU7Z0JBQ0EsSUFBS0gscUJBQXFCLElBQUksQ0FBQ0UsY0FBYyxFQUFHO29CQUM5Q3BDLGNBQWNHLEtBQUssQ0FBQ0csSUFBSSxHQUFHLEdBQUcsQ0FBQ00sS0FBS3lCLFlBQVksS0FBSyxFQUFFLEVBQUUsQ0FBQztvQkFDMURyQyxjQUFjRyxLQUFLLENBQUNJLEdBQUcsR0FBRyxHQUFHLENBQUNLLEtBQUt5QixZQUFZLEtBQUssRUFBRSxFQUFFLENBQUM7b0JBQ3pEckMsY0FBY0csS0FBSyxDQUFDbUMsV0FBVyxHQUFHLEdBQUcxQixLQUFLeUIsWUFBWSxHQUFHLEVBQUUsQ0FBQztnQkFDOUQ7Z0JBRUEsSUFBS0gscUJBQXFCLElBQUksQ0FBQ0gsV0FBVyxFQUFHO29CQUMzQy9CLGNBQWNHLEtBQUssQ0FBQ29DLFdBQVcsR0FBRzNCLEtBQUs0QixrQkFBa0I7Z0JBQzNEO2dCQUVBLElBQUtOLHFCQUFxQmYscUJBQXFCLElBQUksQ0FBQ2lCLGNBQWMsSUFBSSxJQUFJLENBQUNLLGdCQUFnQixFQUFHO29CQUM1RnpDLGNBQWNHLEtBQUssQ0FBRWhCLFNBQVMyQixZQUFZLENBQUUsR0FBRyxBQUFFRixLQUFLOEIsU0FBUyxNQUFNOUIsS0FBSytCLFdBQVcsT0FBTyxVQUFZLEdBQUc3QixlQUFlRixLQUFLeUIsWUFBWSxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUc7Z0JBQzFKO1lBQ0Y7UUFDRjtRQUVBLDBFQUEwRTtRQUMxRSxJQUFLLElBQUksQ0FBQ08sY0FBYyxJQUFJLElBQUksQ0FBQ0MsTUFBTSxJQUFJLElBQUksQ0FBQ0MsTUFBTSxFQUFHO1lBQ3ZEdEQsY0FBY3VELEdBQUcsQ0FBRSxJQUFJLENBQUNDLGtCQUFrQjtZQUMxQyxNQUFNQyxjQUFjakUsUUFBUWlFLFdBQVcsQ0FBRXJDLEtBQUtzQyxNQUFNLEVBQUV0QyxLQUFLdUMsTUFBTTtZQUNqRTNELGNBQWM0RCxjQUFjLENBQUVIO1lBQzlCQSxZQUFZSSxVQUFVO1lBQ3RCL0QsTUFBTWdFLHNCQUFzQixDQUFFOUQsZUFBZSxJQUFJLENBQUNPLFdBQVc7UUFDL0Q7UUFFQSwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDd0QsZUFBZTtRQUNwQixJQUFJLENBQUNDLG1CQUFtQjtRQUN4QixJQUFJLENBQUNaLGNBQWMsR0FBRztJQUN4QjtJQUVBOzs7O0dBSUMsR0FDRGEsVUFBVTtRQUNSLElBQUssQ0FBQ2xFLDBCQUEyQjtZQUMvQix1QkFBdUI7WUFDdkIsSUFBSSxDQUFDUSxXQUFXLEdBQUc7WUFDbkIsSUFBSSxDQUFDQyxhQUFhLEdBQUc7WUFDckIsSUFBSSxDQUFDVSxVQUFVLEdBQUc7UUFDcEI7UUFFQSxLQUFLLENBQUMrQztJQUNSO0lBNUlBOzs7R0FHQyxHQUNEQyxZQUFhN0QsUUFBUSxFQUFFQyxRQUFRLENBQUc7UUFDaEMsS0FBSyxDQUFFRCxVQUFVQztRQUVqQiwrREFBK0Q7UUFDL0RSLE1BQU1xRSxtQkFBbUIsQ0FBRSxJQUFJLENBQUNqRCxVQUFVO0lBQzVDO0FBb0lGO0FBRUFyQixRQUFRdUUsUUFBUSxDQUFFLHdCQUF3QmpFO0FBRTFDVixTQUFTNEUsT0FBTyxDQUFFbEU7QUFFbEIsZUFBZUEscUJBQXFCIn0=