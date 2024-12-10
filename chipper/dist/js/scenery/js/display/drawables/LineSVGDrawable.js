// Copyright 2016-2023, University of Colorado Boulder
/**
 * SVG drawable for Line nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { LineStatefulDrawable, scenery, svgns, SVGSelfDrawable } from '../../imports.js';
// TODO: change this based on memory and performance characteristics of the platform https://github.com/phetsims/scenery/issues/1581
const keepSVGLineElements = true; // whether we should pool SVG elements for the SVG rendering states, or whether we should free them when possible for memory
/*---------------------------------------------------------------------------*
 * SVG Rendering
 *----------------------------------------------------------------------------*/ let LineSVGDrawable = class LineSVGDrawable extends LineStatefulDrawable(SVGSelfDrawable) {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance, true, keepSVGLineElements); // usesPaint: true
        this.svgElement = this.svgElement || document.createElementNS(svgns, 'line');
    }
    /**
   * Updates the SVG elements so that they will appear like the current node's representation.
   * @protected
   * @override
   */ updateSVGSelf() {
        const line = this.svgElement;
        if (this.dirtyX1) {
            line.setAttribute('x1', this.node.x1);
        }
        if (this.dirtyY1) {
            line.setAttribute('y1', this.node.y1);
        }
        if (this.dirtyX2) {
            line.setAttribute('x2', this.node.x2);
        }
        if (this.dirtyY2) {
            line.setAttribute('y2', this.node.y2);
        }
        // Apply any fill/stroke changes to our element.
        this.updateFillStrokeStyle(line);
    }
};
scenery.register('LineSVGDrawable', LineSVGDrawable);
Poolable.mixInto(LineSVGDrawable);
export default LineSVGDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvTGluZVNWR0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNWRyBkcmF3YWJsZSBmb3IgTGluZSBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XG5pbXBvcnQgeyBMaW5lU3RhdGVmdWxEcmF3YWJsZSwgc2NlbmVyeSwgc3ZnbnMsIFNWR1NlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUT0RPOiBjaGFuZ2UgdGhpcyBiYXNlZCBvbiBtZW1vcnkgYW5kIHBlcmZvcm1hbmNlIGNoYXJhY3RlcmlzdGljcyBvZiB0aGUgcGxhdGZvcm0gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbmNvbnN0IGtlZXBTVkdMaW5lRWxlbWVudHMgPSB0cnVlOyAvLyB3aGV0aGVyIHdlIHNob3VsZCBwb29sIFNWRyBlbGVtZW50cyBmb3IgdGhlIFNWRyByZW5kZXJpbmcgc3RhdGVzLCBvciB3aGV0aGVyIHdlIHNob3VsZCBmcmVlIHRoZW0gd2hlbiBwb3NzaWJsZSBmb3IgbWVtb3J5XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICogU1ZHIFJlbmRlcmluZ1xuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuY2xhc3MgTGluZVNWR0RyYXdhYmxlIGV4dGVuZHMgTGluZVN0YXRlZnVsRHJhd2FibGUoIFNWR1NlbGZEcmF3YWJsZSApIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSwgdHJ1ZSwga2VlcFNWR0xpbmVFbGVtZW50cyApOyAvLyB1c2VzUGFpbnQ6IHRydWVcblxuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRoaXMuc3ZnRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnbGluZScgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBTVkcgZWxlbWVudHMgc28gdGhhdCB0aGV5IHdpbGwgYXBwZWFyIGxpa2UgdGhlIGN1cnJlbnQgbm9kZSdzIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgdXBkYXRlU1ZHU2VsZigpIHtcbiAgICBjb25zdCBsaW5lID0gdGhpcy5zdmdFbGVtZW50O1xuXG4gICAgaWYgKCB0aGlzLmRpcnR5WDEgKSB7XG4gICAgICBsaW5lLnNldEF0dHJpYnV0ZSggJ3gxJywgdGhpcy5ub2RlLngxICk7XG4gICAgfVxuICAgIGlmICggdGhpcy5kaXJ0eVkxICkge1xuICAgICAgbGluZS5zZXRBdHRyaWJ1dGUoICd5MScsIHRoaXMubm9kZS55MSApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuZGlydHlYMiApIHtcbiAgICAgIGxpbmUuc2V0QXR0cmlidXRlKCAneDInLCB0aGlzLm5vZGUueDIgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmRpcnR5WTIgKSB7XG4gICAgICBsaW5lLnNldEF0dHJpYnV0ZSggJ3kyJywgdGhpcy5ub2RlLnkyICk7XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgYW55IGZpbGwvc3Ryb2tlIGNoYW5nZXMgdG8gb3VyIGVsZW1lbnQuXG4gICAgdGhpcy51cGRhdGVGaWxsU3Ryb2tlU3R5bGUoIGxpbmUgKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGluZVNWR0RyYXdhYmxlJywgTGluZVNWR0RyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIExpbmVTVkdEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBMaW5lU1ZHRHJhd2FibGU7Il0sIm5hbWVzIjpbIlBvb2xhYmxlIiwiTGluZVN0YXRlZnVsRHJhd2FibGUiLCJzY2VuZXJ5Iiwic3ZnbnMiLCJTVkdTZWxmRHJhd2FibGUiLCJrZWVwU1ZHTGluZUVsZW1lbnRzIiwiTGluZVNWR0RyYXdhYmxlIiwiaW5pdGlhbGl6ZSIsInJlbmRlcmVyIiwiaW5zdGFuY2UiLCJzdmdFbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJ1cGRhdGVTVkdTZWxmIiwibGluZSIsImRpcnR5WDEiLCJzZXRBdHRyaWJ1dGUiLCJub2RlIiwieDEiLCJkaXJ0eVkxIiwieTEiLCJkaXJ0eVgyIiwieDIiLCJkaXJ0eVkyIiwieTIiLCJ1cGRhdGVGaWxsU3Ryb2tlU3R5bGUiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0Msb0JBQW9CLEVBQUVDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxlQUFlLFFBQVEsbUJBQW1CO0FBRXpGLG9JQUFvSTtBQUNwSSxNQUFNQyxzQkFBc0IsTUFBTSw0SEFBNEg7QUFFOUo7OzhFQUU4RSxHQUU5RSxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QkwscUJBQXNCRztJQUNsRDs7Ozs7O0dBTUMsR0FDREcsV0FBWUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7UUFDL0IsS0FBSyxDQUFDRixXQUFZQyxVQUFVQyxVQUFVLE1BQU1KLHNCQUF1QixrQkFBa0I7UUFFckYsSUFBSSxDQUFDSyxVQUFVLEdBQUcsSUFBSSxDQUFDQSxVQUFVLElBQUlDLFNBQVNDLGVBQWUsQ0FBRVQsT0FBTztJQUN4RTtJQUVBOzs7O0dBSUMsR0FDRFUsZ0JBQWdCO1FBQ2QsTUFBTUMsT0FBTyxJQUFJLENBQUNKLFVBQVU7UUFFNUIsSUFBSyxJQUFJLENBQUNLLE9BQU8sRUFBRztZQUNsQkQsS0FBS0UsWUFBWSxDQUFFLE1BQU0sSUFBSSxDQUFDQyxJQUFJLENBQUNDLEVBQUU7UUFDdkM7UUFDQSxJQUFLLElBQUksQ0FBQ0MsT0FBTyxFQUFHO1lBQ2xCTCxLQUFLRSxZQUFZLENBQUUsTUFBTSxJQUFJLENBQUNDLElBQUksQ0FBQ0csRUFBRTtRQUN2QztRQUNBLElBQUssSUFBSSxDQUFDQyxPQUFPLEVBQUc7WUFDbEJQLEtBQUtFLFlBQVksQ0FBRSxNQUFNLElBQUksQ0FBQ0MsSUFBSSxDQUFDSyxFQUFFO1FBQ3ZDO1FBQ0EsSUFBSyxJQUFJLENBQUNDLE9BQU8sRUFBRztZQUNsQlQsS0FBS0UsWUFBWSxDQUFFLE1BQU0sSUFBSSxDQUFDQyxJQUFJLENBQUNPLEVBQUU7UUFDdkM7UUFFQSxnREFBZ0Q7UUFDaEQsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBRVg7SUFDOUI7QUFDRjtBQUVBWixRQUFRd0IsUUFBUSxDQUFFLG1CQUFtQnBCO0FBRXJDTixTQUFTMkIsT0FBTyxDQUFFckI7QUFFbEIsZUFBZUEsZ0JBQWdCIn0=