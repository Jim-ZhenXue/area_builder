// Copyright 2016-2024, University of Colorado Boulder
/**
 * SVG drawable for Text nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import platform from '../../../../phet-core/js/platform.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { scenery, svgns, SVGSelfDrawable, TextStatefulDrawable, Utils } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepSVGTextElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory
// Some browsers (IE/Edge) can't handle our UTF-8 embedding marks AND SVG textLength/spacingAndGlyphs. We disable
// using these features, because they aren't necessary on these browsers.
// See https://github.com/phetsims/scenery/issues/455 for more information.
const useSVGTextLengthAdjustments = !platform.edge;
// Safari seems to have many issues with text and repaint regions, resulting in artifacts showing up when not correctly
// repainted (https://github.com/phetsims/qa/issues/1039#issuecomment-1949196606), and
// cutting off some portions of the text (https://github.com/phetsims/scenery/issues/1610).
// We have persistently created "transparent" rectangles to force repaints (requiring the client to do so), but this
// seems to not work in many cases, and seems to be a usability issue to have to add workarounds.
// If we place it in the same SVG group as the text, we'll get the same transform, but it seems to provide a consistent
// workaround.
const useTransparentSVGTextWorkaround = platform.safari;
let TextSVGDrawable = class TextSVGDrawable extends TextStatefulDrawable(SVGSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance, true, keepSVGTextElements); // usesPaint: true
        // @private {boolean}
        this.hasLength = false;
        if (!this.svgElement) {
            const text = document.createElementNS(svgns, 'text');
            // @private {SVGTextElement}
            this.text = text;
            // If we're applying the workaround, we'll nest everything under a group element
            if (useTransparentSVGTextWorkaround) {
                const group = document.createElementNS(svgns, 'g');
                group.appendChild(text);
                this.svgElement = group;
                // "transparent" fill seems to trick Safari into repainting the region correctly.
                this.workaroundRect = document.createElementNS(svgns, 'rect');
                this.workaroundRect.setAttribute('fill', 'transparent');
                group.appendChild(this.workaroundRect);
            } else {
                // @protected {SVGTextElement|SVGGroup} - Sole SVG element for this drawable, implementing API for SVGSelfDrawable
                this.svgElement = text;
            }
            text.appendChild(document.createTextNode(''));
            // TODO: flag adjustment for SVG qualities https://github.com/phetsims/scenery/issues/1581
            text.setAttribute('dominant-baseline', 'alphabetic'); // to match Canvas right now
            text.setAttribute('text-rendering', 'geometricPrecision');
            text.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
            text.setAttribute('direction', 'ltr');
        }
    }
    /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   *
   * Implements the interface for SVGSelfDrawable (and is called from the SVGSelfDrawable's update).
   */ updateSVGSelf() {
        const text = this.text;
        // set all of the font attributes, since we can't use the combined one
        if (this.dirtyFont) {
            text.setAttribute('font-family', this.node._font.getFamily());
            text.setAttribute('font-size', this.node._font.getSize());
            text.setAttribute('font-style', this.node._font.getStyle());
            text.setAttribute('font-weight', this.node._font.getWeight());
            text.setAttribute('font-stretch', this.node._font.getStretch());
        }
        // update the text-node's value
        if (this.dirtyText) {
            let string = Utils.safariEmbeddingMarkWorkaround(this.node.renderedText);
            // Workaround for Firefox handling of RTL embedding marks, https://github.com/phetsims/scenery/issues/1643
            if (platform.firefox) {
                string = '\u200b' + string;
            }
            text.lastChild.nodeValue = string;
        }
        // text length correction, tested with scenery/tests/text-quality-test.html to determine how to match Canvas/SVG rendering (and overall length)
        if (this.dirtyBounds && useSVGTextLengthAdjustments) {
            const useLengthAdjustment = this.node._boundsMethod !== 'accurate' && isFinite(this.node.selfBounds.width);
            if (useLengthAdjustment) {
                if (!this.hasLength) {
                    this.hasLength = true;
                    text.setAttribute('lengthAdjust', 'spacingAndGlyphs');
                }
                text.setAttribute('textLength', this.node.selfBounds.width);
            } else if (this.hasLength) {
                this.hasLength = false;
                text.removeAttribute('lengthAdjust');
                text.removeAttribute('textLength');
            }
            if (useTransparentSVGTextWorkaround) {
                // Since text can get bigger/smaller, lets make the region larger than the "reported" bounds - this is needed
                // for the usually-problematic locales that have glyphs that extend well past the normal browser-reported
                // bounds. Since this is transparent, we can make it larger than the actual bounds.
                const paddingRatio = 0.2;
                const horizontalPadding = this.node.selfBounds.width * paddingRatio;
                const verticalPadding = this.node.selfBounds.height * paddingRatio;
                this.workaroundRect.setAttribute('x', this.node.selfBounds.minX - horizontalPadding);
                this.workaroundRect.setAttribute('y', this.node.selfBounds.minY - verticalPadding);
                this.workaroundRect.setAttribute('width', this.node.selfBounds.width + 2 * horizontalPadding);
                this.workaroundRect.setAttribute('height', this.node.selfBounds.height + 2 * verticalPadding);
            }
        }
        // Apply any fill/stroke changes to our element.
        this.updateFillStrokeStyle(text);
    }
};
scenery.register('TextSVGDrawable', TextSVGDrawable);
Poolable.mixInto(TextSVGDrawable);
export default TextSVGDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvVGV4dFNWR0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNWRyBkcmF3YWJsZSBmb3IgVGV4dCBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IHNjZW5lcnksIHN2Z25zLCBTVkdTZWxmRHJhd2FibGUsIFRleHRTdGF0ZWZ1bERyYXdhYmxlLCBVdGlscyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBTVkdUZXh0RWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIFNWRyBlbGVtZW50cyBmb3IgdGhlIFNWRyByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XG5cbi8vIFNvbWUgYnJvd3NlcnMgKElFL0VkZ2UpIGNhbid0IGhhbmRsZSBvdXIgVVRGLTggZW1iZWRkaW5nIG1hcmtzIEFORCBTVkcgdGV4dExlbmd0aC9zcGFjaW5nQW5kR2x5cGhzLiBXZSBkaXNhYmxlXG4vLyB1c2luZyB0aGVzZSBmZWF0dXJlcywgYmVjYXVzZSB0aGV5IGFyZW4ndCBuZWNlc3Nhcnkgb24gdGhlc2UgYnJvd3NlcnMuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQ1NSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbmNvbnN0IHVzZVNWR1RleHRMZW5ndGhBZGp1c3RtZW50cyA9ICFwbGF0Zm9ybS5lZGdlO1xuXG4vLyBTYWZhcmkgc2VlbXMgdG8gaGF2ZSBtYW55IGlzc3VlcyB3aXRoIHRleHQgYW5kIHJlcGFpbnQgcmVnaW9ucywgcmVzdWx0aW5nIGluIGFydGlmYWN0cyBzaG93aW5nIHVwIHdoZW4gbm90IGNvcnJlY3RseVxuLy8gcmVwYWludGVkIChodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcWEvaXNzdWVzLzEwMzkjaXNzdWVjb21tZW50LTE5NDkxOTY2MDYpLCBhbmRcbi8vIGN1dHRpbmcgb2ZmIHNvbWUgcG9ydGlvbnMgb2YgdGhlIHRleHQgKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjEwKS5cbi8vIFdlIGhhdmUgcGVyc2lzdGVudGx5IGNyZWF0ZWQgXCJ0cmFuc3BhcmVudFwiIHJlY3RhbmdsZXMgdG8gZm9yY2UgcmVwYWludHMgKHJlcXVpcmluZyB0aGUgY2xpZW50IHRvIGRvIHNvKSwgYnV0IHRoaXNcbi8vIHNlZW1zIHRvIG5vdCB3b3JrIGluIG1hbnkgY2FzZXMsIGFuZCBzZWVtcyB0byBiZSBhIHVzYWJpbGl0eSBpc3N1ZSB0byBoYXZlIHRvIGFkZCB3b3JrYXJvdW5kcy5cbi8vIElmIHdlIHBsYWNlIGl0IGluIHRoZSBzYW1lIFNWRyBncm91cCBhcyB0aGUgdGV4dCwgd2UnbGwgZ2V0IHRoZSBzYW1lIHRyYW5zZm9ybSwgYnV0IGl0IHNlZW1zIHRvIHByb3ZpZGUgYSBjb25zaXN0ZW50XG4vLyB3b3JrYXJvdW5kLlxuY29uc3QgdXNlVHJhbnNwYXJlbnRTVkdUZXh0V29ya2Fyb3VuZCA9IHBsYXRmb3JtLnNhZmFyaTtcblxuY2xhc3MgVGV4dFNWR0RyYXdhYmxlIGV4dGVuZHMgVGV4dFN0YXRlZnVsRHJhd2FibGUoIFNWR1NlbGZEcmF3YWJsZSApIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgdHJ1ZSwga2VlcFNWR1RleHRFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IHRydWVcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMuaGFzTGVuZ3RoID0gZmFsc2U7XG5cbiAgICBpZiAoICF0aGlzLnN2Z0VsZW1lbnQgKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ3RleHQnICk7XG5cbiAgICAgIC8vIEBwcml2YXRlIHtTVkdUZXh0RWxlbWVudH1cbiAgICAgIHRoaXMudGV4dCA9IHRleHQ7XG5cbiAgICAgIC8vIElmIHdlJ3JlIGFwcGx5aW5nIHRoZSB3b3JrYXJvdW5kLCB3ZSdsbCBuZXN0IGV2ZXJ5dGhpbmcgdW5kZXIgYSBncm91cCBlbGVtZW50XG4gICAgICBpZiAoIHVzZVRyYW5zcGFyZW50U1ZHVGV4dFdvcmthcm91bmQgKSB7XG4gICAgICAgIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2cnICk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKCB0ZXh0ICk7XG5cbiAgICAgICAgdGhpcy5zdmdFbGVtZW50ID0gZ3JvdXA7XG5cbiAgICAgICAgLy8gXCJ0cmFuc3BhcmVudFwiIGZpbGwgc2VlbXMgdG8gdHJpY2sgU2FmYXJpIGludG8gcmVwYWludGluZyB0aGUgcmVnaW9uIGNvcnJlY3RseS5cbiAgICAgICAgdGhpcy53b3JrYXJvdW5kUmVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdyZWN0JyApO1xuICAgICAgICB0aGlzLndvcmthcm91bmRSZWN0LnNldEF0dHJpYnV0ZSggJ2ZpbGwnLCAndHJhbnNwYXJlbnQnICk7XG4gICAgICAgIGdyb3VwLmFwcGVuZENoaWxkKCB0aGlzLndvcmthcm91bmRSZWN0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQHByb3RlY3RlZCB7U1ZHVGV4dEVsZW1lbnR8U1ZHR3JvdXB9IC0gU29sZSBTVkcgZWxlbWVudCBmb3IgdGhpcyBkcmF3YWJsZSwgaW1wbGVtZW50aW5nIEFQSSBmb3IgU1ZHU2VsZkRyYXdhYmxlXG4gICAgICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIHRleHQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCAnJyApICk7XG5cbiAgICAgIC8vIFRPRE86IGZsYWcgYWRqdXN0bWVudCBmb3IgU1ZHIHF1YWxpdGllcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgdGV4dC5zZXRBdHRyaWJ1dGUoICdkb21pbmFudC1iYXNlbGluZScsICdhbHBoYWJldGljJyApOyAvLyB0byBtYXRjaCBDYW52YXMgcmlnaHQgbm93XG4gICAgICB0ZXh0LnNldEF0dHJpYnV0ZSggJ3RleHQtcmVuZGVyaW5nJywgJ2dlb21ldHJpY1ByZWNpc2lvbicgKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlTlMoICdodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2UnLCAneG1sOnNwYWNlJywgJ3ByZXNlcnZlJyApO1xuICAgICAgdGV4dC5zZXRBdHRyaWJ1dGUoICdkaXJlY3Rpb24nLCAnbHRyJyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEltcGxlbWVudHMgdGhlIGludGVyZmFjZSBmb3IgU1ZHU2VsZkRyYXdhYmxlIChhbmQgaXMgY2FsbGVkIGZyb20gdGhlIFNWR1NlbGZEcmF3YWJsZSdzIHVwZGF0ZSkuXG4gICAqL1xuICB1cGRhdGVTVkdTZWxmKCkge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHQ7XG5cbiAgICAvLyBzZXQgYWxsIG9mIHRoZSBmb250IGF0dHJpYnV0ZXMsIHNpbmNlIHdlIGNhbid0IHVzZSB0aGUgY29tYmluZWQgb25lXG4gICAgaWYgKCB0aGlzLmRpcnR5Rm9udCApIHtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCAnZm9udC1mYW1pbHknLCB0aGlzLm5vZGUuX2ZvbnQuZ2V0RmFtaWx5KCkgKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCAnZm9udC1zaXplJywgdGhpcy5ub2RlLl9mb250LmdldFNpemUoKSApO1xuICAgICAgdGV4dC5zZXRBdHRyaWJ1dGUoICdmb250LXN0eWxlJywgdGhpcy5ub2RlLl9mb250LmdldFN0eWxlKCkgKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCAnZm9udC13ZWlnaHQnLCB0aGlzLm5vZGUuX2ZvbnQuZ2V0V2VpZ2h0KCkgKTtcbiAgICAgIHRleHQuc2V0QXR0cmlidXRlKCAnZm9udC1zdHJldGNoJywgdGhpcy5ub2RlLl9mb250LmdldFN0cmV0Y2goKSApO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSB0aGUgdGV4dC1ub2RlJ3MgdmFsdWVcbiAgICBpZiAoIHRoaXMuZGlydHlUZXh0ICkge1xuICAgICAgbGV0IHN0cmluZyA9IFV0aWxzLnNhZmFyaUVtYmVkZGluZ01hcmtXb3JrYXJvdW5kKCB0aGlzLm5vZGUucmVuZGVyZWRUZXh0ICk7XG5cbiAgICAgIC8vIFdvcmthcm91bmQgZm9yIEZpcmVmb3ggaGFuZGxpbmcgb2YgUlRMIGVtYmVkZGluZyBtYXJrcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE2NDNcbiAgICAgIGlmICggcGxhdGZvcm0uZmlyZWZveCApIHtcbiAgICAgICAgc3RyaW5nID0gJ1xcdTIwMGInICsgc3RyaW5nO1xuICAgICAgfVxuXG4gICAgICB0ZXh0Lmxhc3RDaGlsZC5ub2RlVmFsdWUgPSBzdHJpbmc7XG4gICAgfVxuXG4gICAgLy8gdGV4dCBsZW5ndGggY29ycmVjdGlvbiwgdGVzdGVkIHdpdGggc2NlbmVyeS90ZXN0cy90ZXh0LXF1YWxpdHktdGVzdC5odG1sIHRvIGRldGVybWluZSBob3cgdG8gbWF0Y2ggQ2FudmFzL1NWRyByZW5kZXJpbmcgKGFuZCBvdmVyYWxsIGxlbmd0aClcbiAgICBpZiAoIHRoaXMuZGlydHlCb3VuZHMgJiYgdXNlU1ZHVGV4dExlbmd0aEFkanVzdG1lbnRzICkge1xuICAgICAgY29uc3QgdXNlTGVuZ3RoQWRqdXN0bWVudCA9IHRoaXMubm9kZS5fYm91bmRzTWV0aG9kICE9PSAnYWNjdXJhdGUnICYmIGlzRmluaXRlKCB0aGlzLm5vZGUuc2VsZkJvdW5kcy53aWR0aCApO1xuXG4gICAgICBpZiAoIHVzZUxlbmd0aEFkanVzdG1lbnQgKSB7XG4gICAgICAgIGlmICggIXRoaXMuaGFzTGVuZ3RoICkge1xuICAgICAgICAgIHRoaXMuaGFzTGVuZ3RoID0gdHJ1ZTtcbiAgICAgICAgICB0ZXh0LnNldEF0dHJpYnV0ZSggJ2xlbmd0aEFkanVzdCcsICdzcGFjaW5nQW5kR2x5cGhzJyApO1xuICAgICAgICB9XG4gICAgICAgIHRleHQuc2V0QXR0cmlidXRlKCAndGV4dExlbmd0aCcsIHRoaXMubm9kZS5zZWxmQm91bmRzLndpZHRoICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5oYXNMZW5ndGggKSB7XG4gICAgICAgIHRoaXMuaGFzTGVuZ3RoID0gZmFsc2U7XG4gICAgICAgIHRleHQucmVtb3ZlQXR0cmlidXRlKCAnbGVuZ3RoQWRqdXN0JyApO1xuICAgICAgICB0ZXh0LnJlbW92ZUF0dHJpYnV0ZSggJ3RleHRMZW5ndGgnICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdXNlVHJhbnNwYXJlbnRTVkdUZXh0V29ya2Fyb3VuZCApIHtcbiAgICAgICAgLy8gU2luY2UgdGV4dCBjYW4gZ2V0IGJpZ2dlci9zbWFsbGVyLCBsZXRzIG1ha2UgdGhlIHJlZ2lvbiBsYXJnZXIgdGhhbiB0aGUgXCJyZXBvcnRlZFwiIGJvdW5kcyAtIHRoaXMgaXMgbmVlZGVkXG4gICAgICAgIC8vIGZvciB0aGUgdXN1YWxseS1wcm9ibGVtYXRpYyBsb2NhbGVzIHRoYXQgaGF2ZSBnbHlwaHMgdGhhdCBleHRlbmQgd2VsbCBwYXN0IHRoZSBub3JtYWwgYnJvd3Nlci1yZXBvcnRlZFxuICAgICAgICAvLyBib3VuZHMuIFNpbmNlIHRoaXMgaXMgdHJhbnNwYXJlbnQsIHdlIGNhbiBtYWtlIGl0IGxhcmdlciB0aGFuIHRoZSBhY3R1YWwgYm91bmRzLlxuICAgICAgICBjb25zdCBwYWRkaW5nUmF0aW8gPSAwLjI7XG4gICAgICAgIGNvbnN0IGhvcml6b250YWxQYWRkaW5nID0gdGhpcy5ub2RlLnNlbGZCb3VuZHMud2lkdGggKiBwYWRkaW5nUmF0aW87XG4gICAgICAgIGNvbnN0IHZlcnRpY2FsUGFkZGluZyA9IHRoaXMubm9kZS5zZWxmQm91bmRzLmhlaWdodCAqIHBhZGRpbmdSYXRpbztcbiAgICAgICAgdGhpcy53b3JrYXJvdW5kUmVjdC5zZXRBdHRyaWJ1dGUoICd4JywgdGhpcy5ub2RlLnNlbGZCb3VuZHMubWluWCAtIGhvcml6b250YWxQYWRkaW5nICk7XG4gICAgICAgIHRoaXMud29ya2Fyb3VuZFJlY3Quc2V0QXR0cmlidXRlKCAneScsIHRoaXMubm9kZS5zZWxmQm91bmRzLm1pblkgLSB2ZXJ0aWNhbFBhZGRpbmcgKTtcbiAgICAgICAgdGhpcy53b3JrYXJvdW5kUmVjdC5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIHRoaXMubm9kZS5zZWxmQm91bmRzLndpZHRoICsgMiAqIGhvcml6b250YWxQYWRkaW5nICk7XG4gICAgICAgIHRoaXMud29ya2Fyb3VuZFJlY3Quc2V0QXR0cmlidXRlKCAnaGVpZ2h0JywgdGhpcy5ub2RlLnNlbGZCb3VuZHMuaGVpZ2h0ICsgMiAqIHZlcnRpY2FsUGFkZGluZyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFwcGx5IGFueSBmaWxsL3N0cm9rZSBjaGFuZ2VzIHRvIG91ciBlbGVtZW50LlxuICAgIHRoaXMudXBkYXRlRmlsbFN0cm9rZVN0eWxlKCB0ZXh0ICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1RleHRTVkdEcmF3YWJsZScsIFRleHRTVkdEcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBUZXh0U1ZHRHJhd2FibGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dFNWR0RyYXdhYmxlOyJdLCJuYW1lcyI6WyJwbGF0Zm9ybSIsIlBvb2xhYmxlIiwic2NlbmVyeSIsInN2Z25zIiwiU1ZHU2VsZkRyYXdhYmxlIiwiVGV4dFN0YXRlZnVsRHJhd2FibGUiLCJVdGlscyIsImtlZXBTVkdUZXh0RWxlbWVudHMiLCJ1c2VTVkdUZXh0TGVuZ3RoQWRqdXN0bWVudHMiLCJlZGdlIiwidXNlVHJhbnNwYXJlbnRTVkdUZXh0V29ya2Fyb3VuZCIsInNhZmFyaSIsIlRleHRTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiaGFzTGVuZ3RoIiwic3ZnRWxlbWVudCIsInRleHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImdyb3VwIiwiYXBwZW5kQ2hpbGQiLCJ3b3JrYXJvdW5kUmVjdCIsInNldEF0dHJpYnV0ZSIsImNyZWF0ZVRleHROb2RlIiwic2V0QXR0cmlidXRlTlMiLCJ1cGRhdGVTVkdTZWxmIiwiZGlydHlGb250Iiwibm9kZSIsIl9mb250IiwiZ2V0RmFtaWx5IiwiZ2V0U2l6ZSIsImdldFN0eWxlIiwiZ2V0V2VpZ2h0IiwiZ2V0U3RyZXRjaCIsImRpcnR5VGV4dCIsInN0cmluZyIsInNhZmFyaUVtYmVkZGluZ01hcmtXb3JrYXJvdW5kIiwicmVuZGVyZWRUZXh0IiwiZmlyZWZveCIsImxhc3RDaGlsZCIsIm5vZGVWYWx1ZSIsImRpcnR5Qm91bmRzIiwidXNlTGVuZ3RoQWRqdXN0bWVudCIsIl9ib3VuZHNNZXRob2QiLCJpc0Zpbml0ZSIsInNlbGZCb3VuZHMiLCJ3aWR0aCIsInJlbW92ZUF0dHJpYnV0ZSIsInBhZGRpbmdSYXRpbyIsImhvcml6b250YWxQYWRkaW5nIiwidmVydGljYWxQYWRkaW5nIiwiaGVpZ2h0IiwibWluWCIsIm1pblkiLCJ1cGRhdGVGaWxsU3Ryb2tlU3R5bGUiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0MsT0FBTyxFQUFFQyxLQUFLLEVBQUVDLGVBQWUsRUFBRUMsb0JBQW9CLEVBQUVDLEtBQUssUUFBUSxtQkFBbUI7QUFFaEcsb0lBQW9JO0FBQ3BJLE1BQU1DLHNCQUFzQixNQUFNLDRIQUE0SDtBQUU5SixpSEFBaUg7QUFDakgseUVBQXlFO0FBQ3pFLDJFQUEyRTtBQUMzRSxNQUFNQyw4QkFBOEIsQ0FBQ1IsU0FBU1MsSUFBSTtBQUVsRCx1SEFBdUg7QUFDdkgsc0ZBQXNGO0FBQ3RGLDJGQUEyRjtBQUMzRixvSEFBb0g7QUFDcEgsaUdBQWlHO0FBQ2pHLHVIQUF1SDtBQUN2SCxjQUFjO0FBQ2QsTUFBTUMsa0NBQWtDVixTQUFTVyxNQUFNO0FBRXZELElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCUCxxQkFBc0JEO0lBQ2xEOzs7Ozs7R0FNQyxHQUNEUyxXQUFZQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztRQUMvQixLQUFLLENBQUNGLFdBQVlDLFVBQVVD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