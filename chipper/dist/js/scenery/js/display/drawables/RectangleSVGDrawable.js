// Copyright 2016-2023, University of Colorado Boulder
/**
 * SVG drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { RectangleStatefulDrawable, scenery, svgns, SVGSelfDrawable } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepSVGRectangleElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory
let RectangleSVGDrawable = class RectangleSVGDrawable extends RectangleStatefulDrawable(SVGSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance, true, keepSVGRectangleElements); // usesPaint: true
        this.lastArcW = -1; // invalid on purpose
        this.lastArcH = -1; // invalid on purpose
        // @protected {SVGRectElement} - Sole SVG element for this drawable, implementing API for SVGSelfDrawable
        this.svgElement = this.svgElement || document.createElementNS(svgns, 'rect');
    }
    /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   *
   * Implements the interface for SVGSelfDrawable (and is called from the SVGSelfDrawable's update).
   */ updateSVGSelf() {
        const rect = this.svgElement;
        if (this.dirtyX) {
            rect.setAttribute('x', this.node._rectX);
        }
        if (this.dirtyY) {
            rect.setAttribute('y', this.node._rectY);
        }
        if (this.dirtyWidth) {
            rect.setAttribute('width', this.node._rectWidth);
        }
        if (this.dirtyHeight) {
            rect.setAttribute('height', this.node._rectHeight);
        }
        if (this.dirtyCornerXRadius || this.dirtyCornerYRadius || this.dirtyWidth || this.dirtyHeight) {
            let arcw = 0;
            let arch = 0;
            // workaround for various browsers if rx=20, ry=0 (behavior is inconsistent, either identical to rx=20,ry=20, rx=0,ry=0. We'll treat it as rx=0,ry=0)
            // see https://github.com/phetsims/scenery/issues/183
            if (this.node.isRounded()) {
                const maximumArcSize = this.node.getMaximumArcSize();
                arcw = Math.min(this.node._cornerXRadius, maximumArcSize);
                arch = Math.min(this.node._cornerYRadius, maximumArcSize);
            }
            if (arcw !== this.lastArcW) {
                this.lastArcW = arcw;
                rect.setAttribute('rx', arcw);
            }
            if (arch !== this.lastArcH) {
                this.lastArcH = arch;
                rect.setAttribute('ry', arch);
            }
        }
        // Apply any fill/stroke changes to our element.
        this.updateFillStrokeStyle(rect);
    }
};
scenery.register('RectangleSVGDrawable', RectangleSVGDrawable);
Poolable.mixInto(RectangleSVGDrawable);
export default RectangleSVGDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUmVjdGFuZ2xlU1ZHRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU1ZHIGRyYXdhYmxlIGZvciBSZWN0YW5nbGUgbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgUmVjdGFuZ2xlU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgc3ZnbnMsIFNWR1NlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBTVkdSZWN0YW5nbGVFbGVtZW50cyA9IHRydWU7IC8vIHdoZXRoZXIgd2Ugc2hvdWxkIHBvb2wgU1ZHIGVsZW1lbnRzIGZvciB0aGUgU1ZHIHJlbmRlcmluZyBzdGF0ZXMsIG9yIHdoZXRoZXIgd2Ugc2hvdWxkIGZyZWUgdGhlbSB3aGVuIHBvc3NpYmxlIGZvciBtZW1vcnlcblxuY2xhc3MgUmVjdGFuZ2xlU1ZHRHJhd2FibGUgZXh0ZW5kcyBSZWN0YW5nbGVTdGF0ZWZ1bERyYXdhYmxlKCBTVkdTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UsIHRydWUsIGtlZXBTVkdSZWN0YW5nbGVFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IHRydWVcblxuICAgIHRoaXMubGFzdEFyY1cgPSAtMTsgLy8gaW52YWxpZCBvbiBwdXJwb3NlXG4gICAgdGhpcy5sYXN0QXJjSCA9IC0xOyAvLyBpbnZhbGlkIG9uIHB1cnBvc2VcblxuICAgIC8vIEBwcm90ZWN0ZWQge1NWR1JlY3RFbGVtZW50fSAtIFNvbGUgU1ZHIGVsZW1lbnQgZm9yIHRoaXMgZHJhd2FibGUsIGltcGxlbWVudGluZyBBUEkgZm9yIFNWR1NlbGZEcmF3YWJsZVxuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRoaXMuc3ZnRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncmVjdCcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEltcGxlbWVudHMgdGhlIGludGVyZmFjZSBmb3IgU1ZHU2VsZkRyYXdhYmxlIChhbmQgaXMgY2FsbGVkIGZyb20gdGhlIFNWR1NlbGZEcmF3YWJsZSdzIHVwZGF0ZSkuXG4gICAqL1xuICB1cGRhdGVTVkdTZWxmKCkge1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLnN2Z0VsZW1lbnQ7XG5cbiAgICBpZiAoIHRoaXMuZGlydHlYICkge1xuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoICd4JywgdGhpcy5ub2RlLl9yZWN0WCApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlZICkge1xuICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoICd5JywgdGhpcy5ub2RlLl9yZWN0WSApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlXaWR0aCApIHtcbiAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCAnd2lkdGgnLCB0aGlzLm5vZGUuX3JlY3RXaWR0aCApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlIZWlnaHQgKSB7XG4gICAgICByZWN0LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIHRoaXMubm9kZS5fcmVjdEhlaWdodCApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlDb3JuZXJYUmFkaXVzIHx8IHRoaXMuZGlydHlDb3JuZXJZUmFkaXVzIHx8IHRoaXMuZGlydHlXaWR0aCB8fCB0aGlzLmRpcnR5SGVpZ2h0ICkge1xuICAgICAgbGV0IGFyY3cgPSAwO1xuICAgICAgbGV0IGFyY2ggPSAwO1xuXG4gICAgICAvLyB3b3JrYXJvdW5kIGZvciB2YXJpb3VzIGJyb3dzZXJzIGlmIHJ4PTIwLCByeT0wIChiZWhhdmlvciBpcyBpbmNvbnNpc3RlbnQsIGVpdGhlciBpZGVudGljYWwgdG8gcng9MjAscnk9MjAsIHJ4PTAscnk9MC4gV2UnbGwgdHJlYXQgaXQgYXMgcng9MCxyeT0wKVxuICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xODNcbiAgICAgIGlmICggdGhpcy5ub2RlLmlzUm91bmRlZCgpICkge1xuICAgICAgICBjb25zdCBtYXhpbXVtQXJjU2l6ZSA9IHRoaXMubm9kZS5nZXRNYXhpbXVtQXJjU2l6ZSgpO1xuICAgICAgICBhcmN3ID0gTWF0aC5taW4oIHRoaXMubm9kZS5fY29ybmVyWFJhZGl1cywgbWF4aW11bUFyY1NpemUgKTtcbiAgICAgICAgYXJjaCA9IE1hdGgubWluKCB0aGlzLm5vZGUuX2Nvcm5lcllSYWRpdXMsIG1heGltdW1BcmNTaXplICk7XG4gICAgICB9XG4gICAgICBpZiAoIGFyY3cgIT09IHRoaXMubGFzdEFyY1cgKSB7XG4gICAgICAgIHRoaXMubGFzdEFyY1cgPSBhcmN3O1xuICAgICAgICByZWN0LnNldEF0dHJpYnV0ZSggJ3J4JywgYXJjdyApO1xuICAgICAgfVxuICAgICAgaWYgKCBhcmNoICE9PSB0aGlzLmxhc3RBcmNIICkge1xuICAgICAgICB0aGlzLmxhc3RBcmNIID0gYXJjaDtcbiAgICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoICdyeScsIGFyY2ggKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBhbnkgZmlsbC9zdHJva2UgY2hhbmdlcyB0byBvdXIgZWxlbWVudC5cbiAgICB0aGlzLnVwZGF0ZUZpbGxTdHJva2VTdHlsZSggcmVjdCApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSZWN0YW5nbGVTVkdEcmF3YWJsZScsIFJlY3RhbmdsZVNWR0RyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIFJlY3RhbmdsZVNWR0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlY3RhbmdsZVNWR0RyYXdhYmxlOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIlJlY3RhbmdsZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5Iiwic3ZnbnMiLCJTVkdTZWxmRHJhd2FibGUiLCJrZWVwU1ZHUmVjdGFuZ2xlRWxlbWVudHMiLCJSZWN0YW5nbGVTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwibGFzdEFyY1ciLCJsYXN0QXJjSCIsInN2Z0VsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsInVwZGF0ZVNWR1NlbGYiLCJyZWN0IiwiZGlydHlYIiwic2V0QXR0cmlidXRlIiwibm9kZSIsIl9yZWN0WCIsImRpcnR5WSIsIl9yZWN0WSIsImRpcnR5V2lkdGgiLCJfcmVjdFdpZHRoIiwiZGlydHlIZWlnaHQiLCJfcmVjdEhlaWdodCIsImRpcnR5Q29ybmVyWFJhZGl1cyIsImRpcnR5Q29ybmVyWVJhZGl1cyIsImFyY3ciLCJhcmNoIiwiaXNSb3VuZGVkIiwibWF4aW11bUFyY1NpemUiLCJnZXRNYXhpbXVtQXJjU2l6ZSIsIk1hdGgiLCJtaW4iLCJfY29ybmVyWFJhZGl1cyIsIl9jb3JuZXJZUmFkaXVzIiwidXBkYXRlRmlsbFN0cm9rZVN0eWxlIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLHlCQUF5QixFQUFFQyxPQUFPLEVBQUVDLEtBQUssRUFBRUMsZUFBZSxRQUFRLG1CQUFtQjtBQUU5RixvSUFBb0k7QUFDcEksTUFBTUMsMkJBQTJCLE1BQU0sNEhBQTRIO0FBRW5LLElBQUEsQUFBTUMsdUJBQU4sTUFBTUEsNkJBQTZCTCwwQkFBMkJHO0lBQzVEOzs7Ozs7R0FNQyxHQUNERyxXQUFZQyxRQUFRLEVBQUVDLFFBQVEsRUFBRztRQUMvQixLQUFLLENBQUNGLFdBQVlDLFVBQVVDLFVBQVUsTUFBTUosMkJBQTRCLGtCQUFrQjtRQUUxRixJQUFJLENBQUNLLFFBQVEsR0FBRyxDQUFDLEdBQUcscUJBQXFCO1FBQ3pDLElBQUksQ0FBQ0MsUUFBUSxHQUFHLENBQUMsR0FBRyxxQkFBcUI7UUFFekMseUdBQXlHO1FBQ3pHLElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUksQ0FBQ0EsVUFBVSxJQUFJQyxTQUFTQyxlQUFlLENBQUVYLE9BQU87SUFDeEU7SUFFQTs7Ozs7R0FLQyxHQUNEWSxnQkFBZ0I7UUFDZCxNQUFNQyxPQUFPLElBQUksQ0FBQ0osVUFBVTtRQUU1QixJQUFLLElBQUksQ0FBQ0ssTUFBTSxFQUFHO1lBQ2pCRCxLQUFLRSxZQUFZLENBQUUsS0FBSyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsTUFBTTtRQUMxQztRQUNBLElBQUssSUFBSSxDQUFDQyxNQUFNLEVBQUc7WUFDakJMLEtBQUtFLFlBQVksQ0FBRSxLQUFLLElBQUksQ0FBQ0MsSUFBSSxDQUFDRyxNQUFNO1FBQzFDO1FBQ0EsSUFBSyxJQUFJLENBQUNDLFVBQVUsRUFBRztZQUNyQlAsS0FBS0UsWUFBWSxDQUFFLFNBQVMsSUFBSSxDQUFDQyxJQUFJLENBQUNLLFVBQVU7UUFDbEQ7UUFDQSxJQUFLLElBQUksQ0FBQ0MsV0FBVyxFQUFHO1lBQ3RCVCxLQUFLRSxZQUFZLENBQUUsVUFBVSxJQUFJLENBQUNDLElBQUksQ0FBQ08sV0FBVztRQUNwRDtRQUNBLElBQUssSUFBSSxDQUFDQyxrQkFBa0IsSUFBSSxJQUFJLENBQUNDLGtCQUFrQixJQUFJLElBQUksQ0FBQ0wsVUFBVSxJQUFJLElBQUksQ0FBQ0UsV0FBVyxFQUFHO1lBQy9GLElBQUlJLE9BQU87WUFDWCxJQUFJQyxPQUFPO1lBRVgscUpBQXFKO1lBQ3JKLHFEQUFxRDtZQUNyRCxJQUFLLElBQUksQ0FBQ1gsSUFBSSxDQUFDWSxTQUFTLElBQUs7Z0JBQzNCLE1BQU1DLGlCQUFpQixJQUFJLENBQUNiLElBQUksQ0FBQ2MsaUJBQWlCO2dCQUNsREosT0FBT0ssS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ2hCLElBQUksQ0FBQ2lCLGNBQWMsRUFBRUo7Z0JBQzNDRixPQUFPSSxLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDaEIsSUFBSSxDQUFDa0IsY0FBYyxFQUFFTDtZQUM3QztZQUNBLElBQUtILFNBQVMsSUFBSSxDQUFDbkIsUUFBUSxFQUFHO2dCQUM1QixJQUFJLENBQUNBLFFBQVEsR0FBR21CO2dCQUNoQmIsS0FBS0UsWUFBWSxDQUFFLE1BQU1XO1lBQzNCO1lBQ0EsSUFBS0MsU0FBUyxJQUFJLENBQUNuQixRQUFRLEVBQUc7Z0JBQzVCLElBQUksQ0FBQ0EsUUFBUSxHQUFHbUI7Z0JBQ2hCZCxLQUFLRSxZQUFZLENBQUUsTUFBTVk7WUFDM0I7UUFDRjtRQUVBLGdEQUFnRDtRQUNoRCxJQUFJLENBQUNRLHFCQUFxQixDQUFFdEI7SUFDOUI7QUFDRjtBQUVBZCxRQUFRcUMsUUFBUSxDQUFFLHdCQUF3QmpDO0FBRTFDTixTQUFTd0MsT0FBTyxDQUFFbEM7QUFFbEIsZUFBZUEscUJBQXFCIn0=