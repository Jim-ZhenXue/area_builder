// Copyright 2016-2024, University of Colorado Boulder
/**
 * SVG drawable for Path nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import platform from '../../../../phet-core/js/platform.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { PathStatefulDrawable, scenery, svgns, SVGSelfDrawable } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepSVGPathElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory
let PathSVGDrawable = class PathSVGDrawable extends PathStatefulDrawable(SVGSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance, true, keepSVGPathElements); // usesPaint: true
        // @protected {SVGPathElement} - Sole SVG element for this drawable, implementing API for SVGSelfDrawable
        this.svgElement = this.svgElement || document.createElementNS(svgns, 'path');
    }
    /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   *
   * Implements the interface for SVGSelfDrawable (and is called from the SVGSelfDrawable's update).
   */ updateSVGSelf() {
        assert && assert(!this.node.requiresSVGBoundsWorkaround(), 'No workaround for https://github.com/phetsims/scenery/issues/196 is provided at this time, please add an epsilon');
        const path = this.svgElement;
        if (this.dirtyShape) {
            let svgPath = this.node.hasShape() ? this.node._shape.getSVGPath() : '';
            // temporary workaround for https://bugs.webkit.org/show_bug.cgi?id=78980
            // and http://code.google.com/p/chromium/issues/detail?id=231626 where even removing
            // the attribute can cause this bug
            if (!svgPath) {
                svgPath = 'M0 0';
            }
            // only set the SVG path if it's not the empty string
            // We'll conditionally add another M0 0 to the end of the path if we're on Safari, we're running into a bug in
            // https://github.com/phetsims/gravity-and-orbits/issues/472 (debugged in
            // https://github.com/phetsims/geometric-optics-basics/issues/31) where we're getting artifacts.
            path.setAttribute('d', `${svgPath}${platform.safari ? ' M0 0' : ''}`);
        }
        // Apply any fill/stroke changes to our element.
        this.updateFillStrokeStyle(path);
    }
};
scenery.register('PathSVGDrawable', PathSVGDrawable);
Poolable.mixInto(PathSVGDrawable);
export default PathSVGDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUGF0aFNWR0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNWRyBkcmF3YWJsZSBmb3IgUGF0aCBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IFBhdGhTdGF0ZWZ1bERyYXdhYmxlLCBzY2VuZXJ5LCBzdmducywgU1ZHU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFRPRE86IGNoYW5nZSB0aGlzIGJhc2VkIG9uIG1lbW9yeSBhbmQgcGVyZm9ybWFuY2UgY2hhcmFjdGVyaXN0aWNzIG9mIHRoZSBwbGF0Zm9ybSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuY29uc3Qga2VlcFNWR1BhdGhFbGVtZW50cyA9IHRydWU7IC8vIHdoZXRoZXIgd2Ugc2hvdWxkIHBvb2wgU1ZHIGVsZW1lbnRzIGZvciB0aGUgU1ZHIHJlbmRlcmluZyBzdGF0ZXMsIG9yIHdoZXRoZXIgd2Ugc2hvdWxkIGZyZWUgdGhlbSB3aGVuIHBvc3NpYmxlIGZvciBtZW1vcnlcblxuY2xhc3MgUGF0aFNWR0RyYXdhYmxlIGV4dGVuZHMgUGF0aFN0YXRlZnVsRHJhd2FibGUoIFNWR1NlbGZEcmF3YWJsZSApIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgdHJ1ZSwga2VlcFNWR1BhdGhFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IHRydWVcblxuICAgIC8vIEBwcm90ZWN0ZWQge1NWR1BhdGhFbGVtZW50fSAtIFNvbGUgU1ZHIGVsZW1lbnQgZm9yIHRoaXMgZHJhd2FibGUsIGltcGxlbWVudGluZyBBUEkgZm9yIFNWR1NlbGZEcmF3YWJsZVxuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRoaXMuc3ZnRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncGF0aCcgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEltcGxlbWVudHMgdGhlIGludGVyZmFjZSBmb3IgU1ZHU2VsZkRyYXdhYmxlIChhbmQgaXMgY2FsbGVkIGZyb20gdGhlIFNWR1NlbGZEcmF3YWJsZSdzIHVwZGF0ZSkuXG4gICAqL1xuICB1cGRhdGVTVkdTZWxmKCkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLm5vZGUucmVxdWlyZXNTVkdCb3VuZHNXb3JrYXJvdW5kKCksXG4gICAgICAnTm8gd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE5NiBpcyBwcm92aWRlZCBhdCB0aGlzIHRpbWUsIHBsZWFzZSBhZGQgYW4gZXBzaWxvbicgKTtcblxuICAgIGNvbnN0IHBhdGggPSB0aGlzLnN2Z0VsZW1lbnQ7XG4gICAgaWYgKCB0aGlzLmRpcnR5U2hhcGUgKSB7XG4gICAgICBsZXQgc3ZnUGF0aCA9IHRoaXMubm9kZS5oYXNTaGFwZSgpID8gdGhpcy5ub2RlLl9zaGFwZS5nZXRTVkdQYXRoKCkgOiAnJztcblxuICAgICAgLy8gdGVtcG9yYXJ5IHdvcmthcm91bmQgZm9yIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD03ODk4MFxuICAgICAgLy8gYW5kIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTIzMTYyNiB3aGVyZSBldmVuIHJlbW92aW5nXG4gICAgICAvLyB0aGUgYXR0cmlidXRlIGNhbiBjYXVzZSB0aGlzIGJ1Z1xuICAgICAgaWYgKCAhc3ZnUGF0aCApIHsgc3ZnUGF0aCA9ICdNMCAwJzsgfVxuXG4gICAgICAvLyBvbmx5IHNldCB0aGUgU1ZHIHBhdGggaWYgaXQncyBub3QgdGhlIGVtcHR5IHN0cmluZ1xuXG4gICAgICAvLyBXZSdsbCBjb25kaXRpb25hbGx5IGFkZCBhbm90aGVyIE0wIDAgdG8gdGhlIGVuZCBvZiB0aGUgcGF0aCBpZiB3ZSdyZSBvbiBTYWZhcmksIHdlJ3JlIHJ1bm5pbmcgaW50byBhIGJ1ZyBpblxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktYW5kLW9yYml0cy9pc3N1ZXMvNDcyIChkZWJ1Z2dlZCBpblxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MtYmFzaWNzL2lzc3Vlcy8zMSkgd2hlcmUgd2UncmUgZ2V0dGluZyBhcnRpZmFjdHMuXG4gICAgICBwYXRoLnNldEF0dHJpYnV0ZSggJ2QnLCBgJHtzdmdQYXRofSR7cGxhdGZvcm0uc2FmYXJpID8gJyBNMCAwJyA6ICcnfWAgKTtcbiAgICB9XG5cbiAgICAvLyBBcHBseSBhbnkgZmlsbC9zdHJva2UgY2hhbmdlcyB0byBvdXIgZWxlbWVudC5cbiAgICB0aGlzLnVwZGF0ZUZpbGxTdHJva2VTdHlsZSggcGF0aCApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoU1ZHRHJhd2FibGUnLCBQYXRoU1ZHRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggUGF0aFNWR0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFBhdGhTVkdEcmF3YWJsZTsiXSwibmFtZXMiOlsicGxhdGZvcm0iLCJQb29sYWJsZSIsIlBhdGhTdGF0ZWZ1bERyYXdhYmxlIiwic2NlbmVyeSIsInN2Z25zIiwiU1ZHU2VsZkRyYXdhYmxlIiwia2VlcFNWR1BhdGhFbGVtZW50cyIsIlBhdGhTVkdEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwic3ZnRWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwidXBkYXRlU1ZHU2VsZiIsImFzc2VydCIsIm5vZGUiLCJyZXF1aXJlc1NWR0JvdW5kc1dvcmthcm91bmQiLCJwYXRoIiwiZGlydHlTaGFwZSIsInN2Z1BhdGgiLCJoYXNTaGFwZSIsIl9zaGFwZSIsImdldFNWR1BhdGgiLCJzZXRBdHRyaWJ1dGUiLCJzYWZhcmkiLCJ1cGRhdGVGaWxsU3Ryb2tlU3R5bGUiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0Msb0JBQW9CLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxlQUFlLFFBQVEsbUJBQW1CO0FBRXpGLG9JQUFvSTtBQUNwSSxNQUFNQyxzQkFBc0IsTUFBTSw0SEFBNEg7QUFFOUosSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBd0JMLHFCQUFzQkc7SUFDbEQ7Ozs7OztHQU1DLEdBQ0RHLFdBQVlDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO1FBQy9CLEtBQUssQ0FBQ0YsV0FBWUMsVUFBVUMsVUFBVSxNQUFNSixzQkFBdUIsa0JBQWtCO1FBRXJGLHlHQUF5RztRQUN6RyxJQUFJLENBQUNLLFVBQVUsR0FBRyxJQUFJLENBQUNBLFVBQVUsSUFBSUMsU0FBU0MsZUFBZSxDQUFFVCxPQUFPO0lBQ3hFO0lBRUE7Ozs7O0dBS0MsR0FDRFUsZ0JBQWdCO1FBQ2RDLFVBQVVBLE9BQVEsQ0FBQyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsMkJBQTJCLElBQ3REO1FBRUYsTUFBTUMsT0FBTyxJQUFJLENBQUNQLFVBQVU7UUFDNUIsSUFBSyxJQUFJLENBQUNRLFVBQVUsRUFBRztZQUNyQixJQUFJQyxVQUFVLElBQUksQ0FBQ0osSUFBSSxDQUFDSyxRQUFRLEtBQUssSUFBSSxDQUFDTCxJQUFJLENBQUNNLE1BQU0sQ0FBQ0MsVUFBVSxLQUFLO1lBRXJFLHlFQUF5RTtZQUN6RSxvRkFBb0Y7WUFDcEYsbUNBQW1DO1lBQ25DLElBQUssQ0FBQ0gsU0FBVTtnQkFBRUEsVUFBVTtZQUFRO1lBRXBDLHFEQUFxRDtZQUVyRCw4R0FBOEc7WUFDOUcseUVBQXlFO1lBQ3pFLGdHQUFnRztZQUNoR0YsS0FBS00sWUFBWSxDQUFFLEtBQUssR0FBR0osVUFBVXBCLFNBQVN5QixNQUFNLEdBQUcsVUFBVSxJQUFJO1FBQ3ZFO1FBRUEsZ0RBQWdEO1FBQ2hELElBQUksQ0FBQ0MscUJBQXFCLENBQUVSO0lBQzlCO0FBQ0Y7QUFFQWYsUUFBUXdCLFFBQVEsQ0FBRSxtQkFBbUJwQjtBQUVyQ04sU0FBUzJCLE9BQU8sQ0FBRXJCO0FBRWxCLGVBQWVBLGdCQUFnQiJ9