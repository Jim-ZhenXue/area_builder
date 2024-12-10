// Copyright 2016-2023, University of Colorado Boulder
/**
 * DOM drawable for Image nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { DOMSelfDrawable, ImageStatefulDrawable, scenery, Utils } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepDOMImageElements = true; // whether we should pool DOM elements for the DOM rendering states, or whether we should free them when possible for memory
let ImageDOMDrawable = class ImageDOMDrawable extends ImageStatefulDrawable(DOMSelfDrawable) {
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
            this.domElement = document.createElement('img');
            this.domElement.style.display = 'block';
            this.domElement.style.position = 'absolute';
            this.domElement.style.pointerEvents = 'none';
            this.domElement.style.left = '0';
            this.domElement.style.top = '0';
        }
        // Whether we have an opacity attribute specified on the DOM element.
        this.hasOpacity = false;
    }
    /**
   * Updates our DOM element so that its appearance matches our node's representation.
   * @protected
   *
   * This implements part of the DOMSelfDrawable required API for subtypes.
   */ updateDOM() {
        const node = this.node;
        const img = this.domElement;
        if (this.paintDirty && this.dirtyImage) {
            // TODO: allow other ways of showing a DOM image? https://github.com/phetsims/scenery/issues/1581
            img.src = node._image ? node._image.src : '//:0'; // NOTE: for img with no src (but with a string), see http://stackoverflow.com/questions/5775469/whats-the-valid-way-to-include-an-image-with-no-src
        }
        if (this.dirtyImageOpacity) {
            if (node._imageOpacity === 1) {
                if (this.hasOpacity) {
                    this.hasOpacity = false;
                    img.style.opacity = '';
                }
            } else {
                this.hasOpacity = true;
                img.style.opacity = node._imageOpacity;
            }
        }
        if (this.transformDirty) {
            Utils.applyPreparedTransform(this.getTransformMatrix(), this.domElement);
        }
        // clear all of the dirty flags
        this.setToCleanState();
        this.transformDirty = false;
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        if (!keepDOMImageElements) {
            this.domElement = null; // clear our DOM reference if we want to toss it
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
scenery.register('ImageDOMDrawable', ImageDOMDrawable);
Poolable.mixInto(ImageDOMDrawable);
export default ImageDOMDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvSW1hZ2VET01EcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBET00gZHJhd2FibGUgZm9yIEltYWdlIG5vZGVzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IERPTVNlbGZEcmF3YWJsZSwgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBVdGlscyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBET01JbWFnZUVsZW1lbnRzID0gdHJ1ZTsgLy8gd2hldGhlciB3ZSBzaG91bGQgcG9vbCBET00gZWxlbWVudHMgZm9yIHRoZSBET00gcmVuZGVyaW5nIHN0YXRlcywgb3Igd2hldGhlciB3ZSBzaG91bGQgZnJlZSB0aGVtIHdoZW4gcG9zc2libGUgZm9yIG1lbW9yeVxuXG5jbGFzcyBJbWFnZURPTURyYXdhYmxlIGV4dGVuZHMgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlKCBET01TZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXIgLSBSZW5kZXJlciBiaXRtYXNrLCBzZWUgUmVuZGVyZXIncyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBjb25zdHJ1Y3RvciggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcblxuICAgIC8vIEFwcGx5IENTUyBuZWVkZWQgZm9yIGZ1dHVyZSBDU1MgdHJhbnNmb3JtcyB0byB3b3JrIHByb3Blcmx5LlxuICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHRoaXMuZG9tRWxlbWVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuXG4gICAgLy8gb25seSBjcmVhdGUgZWxlbWVudHMgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIHRoZW0gKHdlIHBvb2wgdmlzdWFsIHN0YXRlcyBhbHdheXMsIGFuZCBkZXBlbmRpbmcgb24gdGhlIHBsYXRmb3JtIG1heSBhbHNvIHBvb2wgdGhlIGFjdHVhbCBlbGVtZW50cyB0byBtaW5pbWl6ZVxuICAgIC8vIGFsbG9jYXRpb24gYW5kIHBlcmZvcm1hbmNlIGNvc3RzKVxuICAgIGlmICggIXRoaXMuZG9tRWxlbWVudCApIHtcbiAgICAgIC8vIEBwcm90ZWN0ZWQge0hUTUxFbGVtZW50fSAtIE91ciBwcmltYXJ5IERPTSBlbGVtZW50LiBUaGlzIGlzIGV4cG9zZWQgYXMgcGFydCBvZiB0aGUgRE9NU2VsZkRyYXdhYmxlIEFQSS5cbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbWcnICk7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB3ZSBoYXZlIGFuIG9wYWNpdHkgYXR0cmlidXRlIHNwZWNpZmllZCBvbiB0aGUgRE9NIGVsZW1lbnQuXG4gICAgdGhpcy5oYXNPcGFjaXR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBvdXIgRE9NIGVsZW1lbnQgc28gdGhhdCBpdHMgYXBwZWFyYW5jZSBtYXRjaGVzIG91ciBub2RlJ3MgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwcm90ZWN0ZWRcbiAgICpcbiAgICogVGhpcyBpbXBsZW1lbnRzIHBhcnQgb2YgdGhlIERPTVNlbGZEcmF3YWJsZSByZXF1aXJlZCBBUEkgZm9yIHN1YnR5cGVzLlxuICAgKi9cbiAgdXBkYXRlRE9NKCkge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgY29uc3QgaW1nID0gdGhpcy5kb21FbGVtZW50O1xuXG4gICAgaWYgKCB0aGlzLnBhaW50RGlydHkgJiYgdGhpcy5kaXJ0eUltYWdlICkge1xuICAgICAgLy8gVE9ETzogYWxsb3cgb3RoZXIgd2F5cyBvZiBzaG93aW5nIGEgRE9NIGltYWdlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgaW1nLnNyYyA9IG5vZGUuX2ltYWdlID8gbm9kZS5faW1hZ2Uuc3JjIDogJy8vOjAnOyAvLyBOT1RFOiBmb3IgaW1nIHdpdGggbm8gc3JjIChidXQgd2l0aCBhIHN0cmluZyksIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU3NzU0Njkvd2hhdHMtdGhlLXZhbGlkLXdheS10by1pbmNsdWRlLWFuLWltYWdlLXdpdGgtbm8tc3JjXG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLmRpcnR5SW1hZ2VPcGFjaXR5ICkge1xuICAgICAgaWYgKCBub2RlLl9pbWFnZU9wYWNpdHkgPT09IDEgKSB7XG4gICAgICAgIGlmICggdGhpcy5oYXNPcGFjaXR5ICkge1xuICAgICAgICAgIHRoaXMuaGFzT3BhY2l0eSA9IGZhbHNlO1xuICAgICAgICAgIGltZy5zdHlsZS5vcGFjaXR5ID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmhhc09wYWNpdHkgPSB0cnVlO1xuICAgICAgICBpbWcuc3R5bGUub3BhY2l0eSA9IG5vZGUuX2ltYWdlT3BhY2l0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHRoaXMudHJhbnNmb3JtRGlydHkgKSB7XG4gICAgICBVdGlscy5hcHBseVByZXBhcmVkVHJhbnNmb3JtKCB0aGlzLmdldFRyYW5zZm9ybU1hdHJpeCgpLCB0aGlzLmRvbUVsZW1lbnQgKTtcbiAgICB9XG5cbiAgICAvLyBjbGVhciBhbGwgb2YgdGhlIGRpcnR5IGZsYWdzXG4gICAgdGhpcy5zZXRUb0NsZWFuU3RhdGUoKTtcbiAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAoICFrZWVwRE9NSW1hZ2VFbGVtZW50cyApIHtcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IG51bGw7IC8vIGNsZWFyIG91ciBET00gcmVmZXJlbmNlIGlmIHdlIHdhbnQgdG8gdG9zcyBpdFxuICAgIH1cblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSW1hZ2VET01EcmF3YWJsZScsIEltYWdlRE9NRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggSW1hZ2VET01EcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBJbWFnZURPTURyYXdhYmxlOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIkRPTVNlbGZEcmF3YWJsZSIsIkltYWdlU3RhdGVmdWxEcmF3YWJsZSIsInNjZW5lcnkiLCJVdGlscyIsImtlZXBET01JbWFnZUVsZW1lbnRzIiwiSW1hZ2VET01EcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiZG9tRWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlIiwiZGlzcGxheSIsInBvc2l0aW9uIiwicG9pbnRlckV2ZW50cyIsImxlZnQiLCJ0b3AiLCJoYXNPcGFjaXR5IiwidXBkYXRlRE9NIiwibm9kZSIsImltZyIsInBhaW50RGlydHkiLCJkaXJ0eUltYWdlIiwic3JjIiwiX2ltYWdlIiwiZGlydHlJbWFnZU9wYWNpdHkiLCJfaW1hZ2VPcGFjaXR5Iiwib3BhY2l0eSIsInRyYW5zZm9ybURpcnR5IiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsImdldFRyYW5zZm9ybU1hdHJpeCIsInNldFRvQ2xlYW5TdGF0ZSIsImRpc3Bvc2UiLCJjb25zdHJ1Y3RvciIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsZUFBZSxFQUFFQyxxQkFBcUIsRUFBRUMsT0FBTyxFQUFFQyxLQUFLLFFBQVEsbUJBQW1CO0FBRTFGLG9JQUFvSTtBQUNwSSxNQUFNQyx1QkFBdUIsTUFBTSw0SEFBNEg7QUFFL0osSUFBQSxBQUFNQyxtQkFBTixNQUFNQSx5QkFBeUJKLHNCQUF1QkQ7SUFZcEQ7Ozs7OztHQU1DLEdBQ0RNLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO1FBQy9CLEtBQUssQ0FBQ0YsV0FBWUMsVUFBVUM7UUFFNUIsZ0tBQWdLO1FBQ2hLLG9DQUFvQztRQUNwQyxJQUFLLENBQUMsSUFBSSxDQUFDQyxVQUFVLEVBQUc7WUFDdEIsMEdBQTBHO1lBQzFHLElBQUksQ0FBQ0EsVUFBVSxHQUFHQyxTQUFTQyxhQUFhLENBQUU7WUFDMUMsSUFBSSxDQUFDRixVQUFVLENBQUNHLEtBQUssQ0FBQ0MsT0FBTyxHQUFHO1lBQ2hDLElBQUksQ0FBQ0osVUFBVSxDQUFDRyxLQUFLLENBQUNFLFFBQVEsR0FBRztZQUNqQyxJQUFJLENBQUNMLFVBQVUsQ0FBQ0csS0FBSyxDQUFDRyxhQUFhLEdBQUc7WUFDdEMsSUFBSSxDQUFDTixVQUFVLENBQUNHLEtBQUssQ0FBQ0ksSUFBSSxHQUFHO1lBQzdCLElBQUksQ0FBQ1AsVUFBVSxDQUFDRyxLQUFLLENBQUNLLEdBQUcsR0FBRztRQUM5QjtRQUVBLHFFQUFxRTtRQUNyRSxJQUFJLENBQUNDLFVBQVUsR0FBRztJQUNwQjtJQUVBOzs7OztHQUtDLEdBQ0RDLFlBQVk7UUFDVixNQUFNQyxPQUFPLElBQUksQ0FBQ0EsSUFBSTtRQUN0QixNQUFNQyxNQUFNLElBQUksQ0FBQ1osVUFBVTtRQUUzQixJQUFLLElBQUksQ0FBQ2EsVUFBVSxJQUFJLElBQUksQ0FBQ0MsVUFBVSxFQUFHO1lBQ3hDLGlHQUFpRztZQUNqR0YsSUFBSUcsR0FBRyxHQUFHSixLQUFLSyxNQUFNLEdBQUdMLEtBQUtLLE1BQU0sQ0FBQ0QsR0FBRyxHQUFHLFFBQVEsb0pBQW9KO1FBQ3hNO1FBRUEsSUFBSyxJQUFJLENBQUNFLGlCQUFpQixFQUFHO1lBQzVCLElBQUtOLEtBQUtPLGFBQWEsS0FBSyxHQUFJO2dCQUM5QixJQUFLLElBQUksQ0FBQ1QsVUFBVSxFQUFHO29CQUNyQixJQUFJLENBQUNBLFVBQVUsR0FBRztvQkFDbEJHLElBQUlULEtBQUssQ0FBQ2dCLE9BQU8sR0FBRztnQkFDdEI7WUFDRixPQUNLO2dCQUNILElBQUksQ0FBQ1YsVUFBVSxHQUFHO2dCQUNsQkcsSUFBSVQsS0FBSyxDQUFDZ0IsT0FBTyxHQUFHUixLQUFLTyxhQUFhO1lBQ3hDO1FBQ0Y7UUFFQSxJQUFLLElBQUksQ0FBQ0UsY0FBYyxFQUFHO1lBQ3pCMUIsTUFBTTJCLHNCQUFzQixDQUFFLElBQUksQ0FBQ0Msa0JBQWtCLElBQUksSUFBSSxDQUFDdEIsVUFBVTtRQUMxRTtRQUVBLCtCQUErQjtRQUMvQixJQUFJLENBQUN1QixlQUFlO1FBQ3BCLElBQUksQ0FBQ0gsY0FBYyxHQUFHO0lBQ3hCO0lBRUE7Ozs7R0FJQyxHQUNESSxVQUFVO1FBQ1IsSUFBSyxDQUFDN0Isc0JBQXVCO1lBQzNCLElBQUksQ0FBQ0ssVUFBVSxHQUFHLE1BQU0sZ0RBQWdEO1FBQzFFO1FBRUEsS0FBSyxDQUFDd0I7SUFDUjtJQXJGQTs7O0dBR0MsR0FDREMsWUFBYTNCLFFBQVEsRUFBRUMsUUFBUSxDQUFHO1FBQ2hDLEtBQUssQ0FBRUQsVUFBVUM7UUFFakIsK0RBQStEO1FBQy9ETCxNQUFNZ0MsbUJBQW1CLENBQUUsSUFBSSxDQUFDMUIsVUFBVTtJQUM1QztBQTZFRjtBQUVBUCxRQUFRa0MsUUFBUSxDQUFFLG9CQUFvQi9CO0FBRXRDTixTQUFTc0MsT0FBTyxDQUFFaEM7QUFFbEIsZUFBZUEsaUJBQWlCIn0=