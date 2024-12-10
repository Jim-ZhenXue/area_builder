// Copyright 2016-2023, University of Colorado Boulder
/**
 * Canvas drawable for CanvasNode. A generated CanvasSelfDrawable whose purpose will be drawing our CanvasNode.
 * One of these drawables will be created for each displayed instance of a CanvasNode.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, scenery } from '../../imports.js';
const emptyArray = []; // constant, used for line-dash
let CanvasNodeDrawable = class CanvasNodeDrawable extends CanvasSelfDrawable {
    /**
   * Paints this drawable to a Canvas (the wrapper contains both a Canvas reference and its drawing context).
   * @public
   *
   * Assumes that the Canvas's context is already in the proper local coordinate frame for the node, and that any
   * other required effects (opacity, clipping, etc.) have already been prepared.
   *
   * This is part of the CanvasSelfDrawable API required to be implemented for subtypes.
   *
   * @param {CanvasContextWrapper} wrapper - Contains the Canvas and its drawing context
   * @param {Node} node - Our node that is being drawn
   * @param {Matrix3} matrix - The transformation matrix applied for this node's coordinate system.
   */ paintCanvas(wrapper, node, matrix) {
        assert && assert(!node.selfBounds.isEmpty(), `${'CanvasNode should not be used with an empty canvasBounds. ' + 'Please set canvasBounds (or use setCanvasBounds()) on '}${node.constructor.name}`);
        if (!node.selfBounds.isEmpty()) {
            const context = wrapper.context;
            context.save();
            // set back to Canvas default styles
            // TODO: are these necessary, or can we drop them for performance? https://github.com/phetsims/scenery/issues/1581
            context.fillStyle = 'black';
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.lineCap = 'butt';
            context.lineJoin = 'miter';
            context.lineDash = emptyArray;
            context.lineDashOffset = 0;
            context.miterLimit = 10;
            node.paintCanvas(context);
            context.restore();
        }
    }
};
scenery.register('CanvasNodeDrawable', CanvasNodeDrawable);
Poolable.mixInto(CanvasNodeDrawable);
export default CanvasNodeDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvQ2FudmFzTm9kZURyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhbnZhcyBkcmF3YWJsZSBmb3IgQ2FudmFzTm9kZS4gQSBnZW5lcmF0ZWQgQ2FudmFzU2VsZkRyYXdhYmxlIHdob3NlIHB1cnBvc2Ugd2lsbCBiZSBkcmF3aW5nIG91ciBDYW52YXNOb2RlLlxuICogT25lIG9mIHRoZXNlIGRyYXdhYmxlcyB3aWxsIGJlIGNyZWF0ZWQgZm9yIGVhY2ggZGlzcGxheWVkIGluc3RhbmNlIG9mIGEgQ2FudmFzTm9kZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XG5pbXBvcnQgeyBDYW52YXNTZWxmRHJhd2FibGUsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3QgZW1wdHlBcnJheSA9IFtdOyAvLyBjb25zdGFudCwgdXNlZCBmb3IgbGluZS1kYXNoXG5cbmNsYXNzIENhbnZhc05vZGVEcmF3YWJsZSBleHRlbmRzIENhbnZhc1NlbGZEcmF3YWJsZSB7XG4gIC8qKlxuICAgKiBQYWludHMgdGhpcyBkcmF3YWJsZSB0byBhIENhbnZhcyAodGhlIHdyYXBwZXIgY29udGFpbnMgYm90aCBhIENhbnZhcyByZWZlcmVuY2UgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgQ2FudmFzJ3MgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBwcm9wZXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIG5vZGUsIGFuZCB0aGF0IGFueVxuICAgKiBvdGhlciByZXF1aXJlZCBlZmZlY3RzIChvcGFjaXR5LCBjbGlwcGluZywgZXRjLikgaGF2ZSBhbHJlYWR5IGJlZW4gcHJlcGFyZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgQ2FudmFzU2VsZkRyYXdhYmxlIEFQSSByZXF1aXJlZCB0byBiZSBpbXBsZW1lbnRlZCBmb3Igc3VidHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IHdyYXBwZXIgLSBDb250YWlucyB0aGUgQ2FudmFzIGFuZCBpdHMgZHJhd2luZyBjb250ZXh0XG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAtIE91ciBub2RlIHRoYXQgaXMgYmVpbmcgZHJhd25cbiAgICogQHBhcmFtIHtNYXRyaXgzfSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFwcGxpZWQgZm9yIHRoaXMgbm9kZSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgKi9cbiAgcGFpbnRDYW52YXMoIHdyYXBwZXIsIG5vZGUsIG1hdHJpeCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbm9kZS5zZWxmQm91bmRzLmlzRW1wdHkoKSwgYCR7J0NhbnZhc05vZGUgc2hvdWxkIG5vdCBiZSB1c2VkIHdpdGggYW4gZW1wdHkgY2FudmFzQm91bmRzLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1BsZWFzZSBzZXQgY2FudmFzQm91bmRzIChvciB1c2Ugc2V0Q2FudmFzQm91bmRzKCkpIG9uICd9JHtub2RlLmNvbnN0cnVjdG9yLm5hbWV9YCApO1xuXG4gICAgaWYgKCAhbm9kZS5zZWxmQm91bmRzLmlzRW1wdHkoKSApIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSB3cmFwcGVyLmNvbnRleHQ7XG4gICAgICBjb250ZXh0LnNhdmUoKTtcblxuICAgICAgLy8gc2V0IGJhY2sgdG8gQ2FudmFzIGRlZmF1bHQgc3R5bGVzXG4gICAgICAvLyBUT0RPOiBhcmUgdGhlc2UgbmVjZXNzYXJ5LCBvciBjYW4gd2UgZHJvcCB0aGVtIGZvciBwZXJmb3JtYW5jZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgICAgY29udGV4dC5saW5lQ2FwID0gJ2J1dHQnO1xuICAgICAgY29udGV4dC5saW5lSm9pbiA9ICdtaXRlcic7XG4gICAgICBjb250ZXh0LmxpbmVEYXNoID0gZW1wdHlBcnJheTtcbiAgICAgIGNvbnRleHQubGluZURhc2hPZmZzZXQgPSAwO1xuICAgICAgY29udGV4dC5taXRlckxpbWl0ID0gMTA7XG5cbiAgICAgIG5vZGUucGFpbnRDYW52YXMoIGNvbnRleHQgKTtcblxuICAgICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDYW52YXNOb2RlRHJhd2FibGUnLCBDYW52YXNOb2RlRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggQ2FudmFzTm9kZURyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhc05vZGVEcmF3YWJsZTsiXSwibmFtZXMiOlsiUG9vbGFibGUiLCJDYW52YXNTZWxmRHJhd2FibGUiLCJzY2VuZXJ5IiwiZW1wdHlBcnJheSIsIkNhbnZhc05vZGVEcmF3YWJsZSIsInBhaW50Q2FudmFzIiwid3JhcHBlciIsIm5vZGUiLCJtYXRyaXgiLCJhc3NlcnQiLCJzZWxmQm91bmRzIiwiaXNFbXB0eSIsImNvbnN0cnVjdG9yIiwibmFtZSIsImNvbnRleHQiLCJzYXZlIiwiZmlsbFN0eWxlIiwic3Ryb2tlU3R5bGUiLCJsaW5lV2lkdGgiLCJsaW5lQ2FwIiwibGluZUpvaW4iLCJsaW5lRGFzaCIsImxpbmVEYXNoT2Zmc2V0IiwibWl0ZXJMaW1pdCIsInJlc3RvcmUiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLGtCQUFrQixFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRS9ELE1BQU1DLGFBQWEsRUFBRSxFQUFFLCtCQUErQjtBQUV0RCxJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQkg7SUFDL0I7Ozs7Ozs7Ozs7OztHQVlDLEdBQ0RJLFlBQWFDLE9BQU8sRUFBRUMsSUFBSSxFQUFFQyxNQUFNLEVBQUc7UUFDbkNDLFVBQVVBLE9BQVEsQ0FBQ0YsS0FBS0csVUFBVSxDQUFDQyxPQUFPLElBQUksR0FBRywrREFDQSwyREFBMkRKLEtBQUtLLFdBQVcsQ0FBQ0MsSUFBSSxFQUFFO1FBRW5JLElBQUssQ0FBQ04sS0FBS0csVUFBVSxDQUFDQyxPQUFPLElBQUs7WUFDaEMsTUFBTUcsVUFBVVIsUUFBUVEsT0FBTztZQUMvQkEsUUFBUUMsSUFBSTtZQUVaLG9DQUFvQztZQUNwQyxrSEFBa0g7WUFDbEhELFFBQVFFLFNBQVMsR0FBRztZQUNwQkYsUUFBUUcsV0FBVyxHQUFHO1lBQ3RCSCxRQUFRSSxTQUFTLEdBQUc7WUFDcEJKLFFBQVFLLE9BQU8sR0FBRztZQUNsQkwsUUFBUU0sUUFBUSxHQUFHO1lBQ25CTixRQUFRTyxRQUFRLEdBQUdsQjtZQUNuQlcsUUFBUVEsY0FBYyxHQUFHO1lBQ3pCUixRQUFRUyxVQUFVLEdBQUc7WUFFckJoQixLQUFLRixXQUFXLENBQUVTO1lBRWxCQSxRQUFRVSxPQUFPO1FBQ2pCO0lBQ0Y7QUFDRjtBQUVBdEIsUUFBUXVCLFFBQVEsQ0FBRSxzQkFBc0JyQjtBQUV4Q0osU0FBUzBCLE9BQU8sQ0FBRXRCO0FBRWxCLGVBQWVBLG1CQUFtQiJ9