// Copyright 2016-2023, University of Colorado Boulder
/**
 * DOM drawable for Circle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../../dot/js/Matrix3.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { CircleStatefulDrawable, DOMSelfDrawable, Features, scenery, Utils } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepDOMCircleElements = true; // whether we should pool DOM elements for the DOM rendering states, or whether we should free them when possible for memory
let CircleDOMDrawable = class CircleDOMDrawable extends CircleStatefulDrawable(DOMSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @protected {Matrix3} - We need to store an independent matrix, as our CSS transform actually depends on the radius.
        this.matrix = this.matrix || Matrix3.pool.fetch();
        // only create elements if we don't already have them (we pool visual states always, and depending on the platform may also pool the actual elements to minimize
        // allocation and performance costs)
        if (!this.fillElement || !this.strokeElement) {
            // @protected {HTMLDivElement} - Will contain the fill by manipulating borderRadius
            const fillElement = document.createElement('div');
            this.fillElement = fillElement;
            // @protected {HTMLDivElement} - Will contain the stroke by manipulating borderRadius
            const strokeElement = document.createElement('div');
            this.strokeElement = strokeElement;
            fillElement.style.display = 'block';
            fillElement.style.position = 'absolute';
            fillElement.style.left = '0';
            fillElement.style.top = '0';
            fillElement.style.pointerEvents = 'none';
            strokeElement.style.display = 'block';
            strokeElement.style.position = 'absolute';
            strokeElement.style.left = '0';
            strokeElement.style.top = '0';
            strokeElement.style.pointerEvents = 'none';
            // Nesting allows us to transform only one AND to guarantee that the stroke is on top.
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
        // If paintDirty is false, there are no updates that are needed.
        if (this.paintDirty) {
            if (this.dirtyRadius) {
                fillElement.style.width = `${2 * node._radius}px`;
                fillElement.style.height = `${2 * node._radius}px`;
                fillElement.style[Features.borderRadius] = `${node._radius}px`;
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
                // the other option would be to update stroked information when there is no stroke (major performance loss for fill-only Circles)
                const hadNoStrokeBefore = !this.hadStroke;
                if (hadNoStrokeBefore || this.dirtyLineWidth || this.dirtyRadius) {
                    strokeElement.style.width = `${2 * node._radius - node.getLineWidth()}px`;
                    strokeElement.style.height = `${2 * node._radius - node.getLineWidth()}px`;
                    strokeElement.style[Features.borderRadius] = `${node._radius + node.getLineWidth() / 2}px`;
                }
                if (hadNoStrokeBefore || this.dirtyLineWidth) {
                    strokeElement.style.left = `${-node.getLineWidth() / 2}px`;
                    strokeElement.style.top = `${-node.getLineWidth() / 2}px`;
                    strokeElement.style.borderWidth = `${node.getLineWidth()}px`;
                }
                if (hadNoStrokeBefore || this.dirtyStroke) {
                    strokeElement.style.borderColor = node.getSimpleCSSStroke();
                }
            }
        }
        // shift the element vertically, postmultiplied with the entire transform.
        if (this.transformDirty || this.dirtyRadius) {
            this.matrix.set(this.getTransformMatrix());
            const translation = Matrix3.translation(-node._radius, -node._radius);
            this.matrix.multiplyMatrix(translation);
            translation.freeToPool();
            Utils.applyPreparedTransform(this.matrix, this.fillElement);
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
        // Release the DOM elements from the poolable visual state so they aren't kept in memory.
        // May not be done on platforms where we have enough memory to pool these
        if (!keepDOMCircleElements) {
            // clear the references
            this.fillElement = null;
            this.strokeElement = null;
            this.domElement = null;
        }
        super.dispose();
    }
    /**
   * @param {number} renderer - Renderer bitmask, see Renderer's documentation for more details.
   * @param {Instance} instance
   */ constructor(renderer, instance){
        super(renderer, instance);
        // Apply CSS needed for future CSS transforms to work properly.
        Utils.prepareForTransform(this.domElement);
    }
};
scenery.register('CircleDOMDrawable', CircleDOMDrawable);
Poolable.mixInto(CircleDOMDrawable);
export default CircleDOMDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvQ2lyY2xlRE9NRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRE9NIGRyYXdhYmxlIGZvciBDaXJjbGUgbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZSwgRE9NU2VsZkRyYXdhYmxlLCBGZWF0dXJlcywgc2NlbmVyeSwgVXRpbHMgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gVE9ETzogY2hhbmdlIHRoaXMgYmFzZWQgb24gbWVtb3J5IGFuZCBwZXJmb3JtYW5jZSBjaGFyYWN0ZXJpc3RpY3Mgb2YgdGhlIHBsYXRmb3JtIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5jb25zdCBrZWVwRE9NQ2lyY2xlRWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIERPTSBlbGVtZW50cyBmb3IgdGhlIERPTSByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XG5cbmNsYXNzIENpcmNsZURPTURyYXdhYmxlIGV4dGVuZHMgQ2lyY2xlU3RhdGVmdWxEcmF3YWJsZSggRE9NU2VsZkRyYXdhYmxlICkge1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gUmVuZGVyZXIgYml0bWFzaywgc2VlIFJlbmRlcmVyJ3MgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlciggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBBcHBseSBDU1MgbmVlZGVkIGZvciBmdXR1cmUgQ1NTIHRyYW5zZm9ybXMgdG8gd29yayBwcm9wZXJseS5cbiAgICBVdGlscy5wcmVwYXJlRm9yVHJhbnNmb3JtKCB0aGlzLmRvbUVsZW1lbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcblxuICAgIC8vIEBwcm90ZWN0ZWQge01hdHJpeDN9IC0gV2UgbmVlZCB0byBzdG9yZSBhbiBpbmRlcGVuZGVudCBtYXRyaXgsIGFzIG91ciBDU1MgdHJhbnNmb3JtIGFjdHVhbGx5IGRlcGVuZHMgb24gdGhlIHJhZGl1cy5cbiAgICB0aGlzLm1hdHJpeCA9IHRoaXMubWF0cml4IHx8IE1hdHJpeDMucG9vbC5mZXRjaCgpO1xuXG4gICAgLy8gb25seSBjcmVhdGUgZWxlbWVudHMgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIHRoZW0gKHdlIHBvb2wgdmlzdWFsIHN0YXRlcyBhbHdheXMsIGFuZCBkZXBlbmRpbmcgb24gdGhlIHBsYXRmb3JtIG1heSBhbHNvIHBvb2wgdGhlIGFjdHVhbCBlbGVtZW50cyB0byBtaW5pbWl6ZVxuICAgIC8vIGFsbG9jYXRpb24gYW5kIHBlcmZvcm1hbmNlIGNvc3RzKVxuICAgIGlmICggIXRoaXMuZmlsbEVsZW1lbnQgfHwgIXRoaXMuc3Ryb2tlRWxlbWVudCApIHtcbiAgICAgIC8vIEBwcm90ZWN0ZWQge0hUTUxEaXZFbGVtZW50fSAtIFdpbGwgY29udGFpbiB0aGUgZmlsbCBieSBtYW5pcHVsYXRpbmcgYm9yZGVyUmFkaXVzXG4gICAgICBjb25zdCBmaWxsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgICB0aGlzLmZpbGxFbGVtZW50ID0gZmlsbEVsZW1lbnQ7XG5cbiAgICAgIC8vIEBwcm90ZWN0ZWQge0hUTUxEaXZFbGVtZW50fSAtIFdpbGwgY29udGFpbiB0aGUgc3Ryb2tlIGJ5IG1hbmlwdWxhdGluZyBib3JkZXJSYWRpdXNcbiAgICAgIGNvbnN0IHN0cm9rZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgICAgdGhpcy5zdHJva2VFbGVtZW50ID0gc3Ryb2tlRWxlbWVudDtcblxuICAgICAgZmlsbEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBmaWxsRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgICAgZmlsbEVsZW1lbnQuc3R5bGUudG9wID0gJzAnO1xuICAgICAgZmlsbEVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICBzdHJva2VFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUudG9wID0gJzAnO1xuICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgICAvLyBOZXN0aW5nIGFsbG93cyB1cyB0byB0cmFuc2Zvcm0gb25seSBvbmUgQU5EIHRvIGd1YXJhbnRlZSB0aGF0IHRoZSBzdHJva2UgaXMgb24gdG9wLlxuICAgICAgZmlsbEVsZW1lbnQuYXBwZW5kQ2hpbGQoIHN0cm9rZUVsZW1lbnQgKTtcbiAgICB9XG5cbiAgICAvLyBAcHJvdGVjdGVkIHtIVE1MRWxlbWVudH0gLSBPdXIgcHJpbWFyeSBET00gZWxlbWVudC4gVGhpcyBpcyBleHBvc2VkIGFzIHBhcnQgb2YgdGhlIERPTVNlbGZEcmF3YWJsZSBBUEkuXG4gICAgdGhpcy5kb21FbGVtZW50ID0gdGhpcy5maWxsRWxlbWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIG91ciBET00gZWxlbWVudCBzbyB0aGF0IGl0cyBhcHBlYXJhbmNlIG1hdGNoZXMgb3VyIG5vZGUncyByZXByZXNlbnRhdGlvbi5cbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBUaGlzIGltcGxlbWVudHMgcGFydCBvZiB0aGUgRE9NU2VsZkRyYXdhYmxlIHJlcXVpcmVkIEFQSSBmb3Igc3VidHlwZXMuXG4gICAqL1xuICB1cGRhdGVET00oKSB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZTtcbiAgICBjb25zdCBmaWxsRWxlbWVudCA9IHRoaXMuZmlsbEVsZW1lbnQ7XG4gICAgY29uc3Qgc3Ryb2tlRWxlbWVudCA9IHRoaXMuc3Ryb2tlRWxlbWVudDtcblxuICAgIC8vIElmIHBhaW50RGlydHkgaXMgZmFsc2UsIHRoZXJlIGFyZSBubyB1cGRhdGVzIHRoYXQgYXJlIG5lZWRlZC5cbiAgICBpZiAoIHRoaXMucGFpbnREaXJ0eSApIHtcbiAgICAgIGlmICggdGhpcy5kaXJ0eVJhZGl1cyApIHtcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHsyICogbm9kZS5fcmFkaXVzfXB4YDtcbiAgICAgICAgZmlsbEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gYCR7MiAqIG5vZGUuX3JhZGl1c31weGA7XG4gICAgICAgIGZpbGxFbGVtZW50LnN0eWxlWyBGZWF0dXJlcy5ib3JkZXJSYWRpdXMgXSA9IGAke25vZGUuX3JhZGl1c31weGA7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMuZGlydHlGaWxsICkge1xuICAgICAgICBmaWxsRWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBub2RlLmdldENTU0ZpbGwoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCB0aGlzLmRpcnR5U3Ryb2tlICkge1xuICAgICAgICAvLyB1cGRhdGUgc3Ryb2tlIHByZXNlbmNlXG4gICAgICAgIGlmICggbm9kZS5oYXNTdHJva2UoKSApIHtcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzdHJva2VFbGVtZW50LnN0eWxlLmJvcmRlclN0eWxlID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggbm9kZS5oYXNTdHJva2UoKSApIHtcbiAgICAgICAgLy8gc2luY2Ugd2Ugb25seSBleGVjdXRlIHRoZXNlIGlmIHdlIGhhdmUgYSBzdHJva2UsIHdlIG5lZWQgdG8gcmVkbyBldmVyeXRoaW5nIGlmIHRoZXJlIHdhcyBubyBzdHJva2UgcHJldmlvdXNseS5cbiAgICAgICAgLy8gdGhlIG90aGVyIG9wdGlvbiB3b3VsZCBiZSB0byB1cGRhdGUgc3Ryb2tlZCBpbmZvcm1hdGlvbiB3aGVuIHRoZXJlIGlzIG5vIHN0cm9rZSAobWFqb3IgcGVyZm9ybWFuY2UgbG9zcyBmb3IgZmlsbC1vbmx5IENpcmNsZXMpXG4gICAgICAgIGNvbnN0IGhhZE5vU3Ryb2tlQmVmb3JlID0gIXRoaXMuaGFkU3Ryb2tlO1xuXG4gICAgICAgIGlmICggaGFkTm9TdHJva2VCZWZvcmUgfHwgdGhpcy5kaXJ0eUxpbmVXaWR0aCB8fCB0aGlzLmRpcnR5UmFkaXVzICkge1xuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHsyICogbm9kZS5fcmFkaXVzIC0gbm9kZS5nZXRMaW5lV2lkdGgoKX1weGA7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHsyICogbm9kZS5fcmFkaXVzIC0gbm9kZS5nZXRMaW5lV2lkdGgoKX1weGA7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZVsgRmVhdHVyZXMuYm9yZGVyUmFkaXVzIF0gPSBgJHtub2RlLl9yYWRpdXMgKyBub2RlLmdldExpbmVXaWR0aCgpIC8gMn1weGA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBoYWROb1N0cm9rZUJlZm9yZSB8fCB0aGlzLmRpcnR5TGluZVdpZHRoICkge1xuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUubGVmdCA9IGAkey1ub2RlLmdldExpbmVXaWR0aCgpIC8gMn1weGA7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS50b3AgPSBgJHstbm9kZS5nZXRMaW5lV2lkdGgoKSAvIDJ9cHhgO1xuICAgICAgICAgIHN0cm9rZUVsZW1lbnQuc3R5bGUuYm9yZGVyV2lkdGggPSBgJHtub2RlLmdldExpbmVXaWR0aCgpfXB4YDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGhhZE5vU3Ryb2tlQmVmb3JlIHx8IHRoaXMuZGlydHlTdHJva2UgKSB7XG4gICAgICAgICAgc3Ryb2tlRWxlbWVudC5zdHlsZS5ib3JkZXJDb2xvciA9IG5vZGUuZ2V0U2ltcGxlQ1NTU3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzaGlmdCB0aGUgZWxlbWVudCB2ZXJ0aWNhbGx5LCBwb3N0bXVsdGlwbGllZCB3aXRoIHRoZSBlbnRpcmUgdHJhbnNmb3JtLlxuICAgIGlmICggdGhpcy50cmFuc2Zvcm1EaXJ0eSB8fCB0aGlzLmRpcnR5UmFkaXVzICkge1xuICAgICAgdGhpcy5tYXRyaXguc2V0KCB0aGlzLmdldFRyYW5zZm9ybU1hdHJpeCgpICk7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IE1hdHJpeDMudHJhbnNsYXRpb24oIC1ub2RlLl9yYWRpdXMsIC1ub2RlLl9yYWRpdXMgKTtcbiAgICAgIHRoaXMubWF0cml4Lm11bHRpcGx5TWF0cml4KCB0cmFuc2xhdGlvbiApO1xuICAgICAgdHJhbnNsYXRpb24uZnJlZVRvUG9vbCgpO1xuICAgICAgVXRpbHMuYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSggdGhpcy5tYXRyaXgsIHRoaXMuZmlsbEVsZW1lbnQgKTtcbiAgICB9XG5cbiAgICAvLyBjbGVhciBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzXG4gICAgdGhpcy5zZXRUb0NsZWFuU3RhdGUoKTtcbiAgICB0aGlzLmNsZWFuUGFpbnRhYmxlU3RhdGUoKTtcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBSZWxlYXNlIHRoZSBET00gZWxlbWVudHMgZnJvbSB0aGUgcG9vbGFibGUgdmlzdWFsIHN0YXRlIHNvIHRoZXkgYXJlbid0IGtlcHQgaW4gbWVtb3J5LlxuICAgIC8vIE1heSBub3QgYmUgZG9uZSBvbiBwbGF0Zm9ybXMgd2hlcmUgd2UgaGF2ZSBlbm91Z2ggbWVtb3J5IHRvIHBvb2wgdGhlc2VcbiAgICBpZiAoICFrZWVwRE9NQ2lyY2xlRWxlbWVudHMgKSB7XG4gICAgICAvLyBjbGVhciB0aGUgcmVmZXJlbmNlc1xuICAgICAgdGhpcy5maWxsRWxlbWVudCA9IG51bGw7XG4gICAgICB0aGlzLnN0cm9rZUVsZW1lbnQgPSBudWxsO1xuICAgICAgdGhpcy5kb21FbGVtZW50ID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0NpcmNsZURPTURyYXdhYmxlJywgQ2lyY2xlRE9NRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggQ2lyY2xlRE9NRHJhd2FibGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgQ2lyY2xlRE9NRHJhd2FibGU7Il0sIm5hbWVzIjpbIk1hdHJpeDMiLCJQb29sYWJsZSIsIkNpcmNsZVN0YXRlZnVsRHJhd2FibGUiLCJET01TZWxmRHJhd2FibGUiLCJGZWF0dXJlcyIsInNjZW5lcnkiLCJVdGlscyIsImtlZXBET01DaXJjbGVFbGVtZW50cyIsIkNpcmNsZURPTURyYXdhYmxlIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJtYXRyaXgiLCJwb29sIiwiZmV0Y2giLCJmaWxsRWxlbWVudCIsInN0cm9rZUVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsImRpc3BsYXkiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJwb2ludGVyRXZlbnRzIiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50IiwidXBkYXRlRE9NIiwibm9kZSIsInBhaW50RGlydHkiLCJkaXJ0eVJhZGl1cyIsIndpZHRoIiwiX3JhZGl1cyIsImhlaWdodCIsImJvcmRlclJhZGl1cyIsImRpcnR5RmlsbCIsImJhY2tncm91bmRDb2xvciIsImdldENTU0ZpbGwiLCJkaXJ0eVN0cm9rZSIsImhhc1N0cm9rZSIsImJvcmRlclN0eWxlIiwiaGFkTm9TdHJva2VCZWZvcmUiLCJoYWRTdHJva2UiLCJkaXJ0eUxpbmVXaWR0aCIsImdldExpbmVXaWR0aCIsImJvcmRlcldpZHRoIiwiYm9yZGVyQ29sb3IiLCJnZXRTaW1wbGVDU1NTdHJva2UiLCJ0cmFuc2Zvcm1EaXJ0eSIsInNldCIsImdldFRyYW5zZm9ybU1hdHJpeCIsInRyYW5zbGF0aW9uIiwibXVsdGlwbHlNYXRyaXgiLCJmcmVlVG9Qb29sIiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsInNldFRvQ2xlYW5TdGF0ZSIsImNsZWFuUGFpbnRhYmxlU3RhdGUiLCJkaXNwb3NlIiwiY29uc3RydWN0b3Ii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