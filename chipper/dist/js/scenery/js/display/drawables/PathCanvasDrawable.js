// Copyright 2016-2023, University of Colorado Boulder
/**
 * Canvas drawable for Path nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, PaintableStatelessDrawable, scenery } from '../../imports.js';
let PathCanvasDrawable = class PathCanvasDrawable extends PaintableStatelessDrawable(CanvasSelfDrawable) {
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
   * @param {scenery.Node} node - Our node that is being drawn
   * @param {Matrix3} matrix - The transformation matrix applied for this node's coordinate system.
   */ paintCanvas(wrapper, node, matrix) {
        const context = wrapper.context;
        if (node.hasShape()) {
            // TODO: fill/stroke delay optimizations? https://github.com/phetsims/scenery/issues/1581
            context.beginPath();
            node._shape.writeToContext(context);
            if (node.hasFill()) {
                node.beforeCanvasFill(wrapper); // defined in Paintable
                context.fill();
                node.afterCanvasFill(wrapper); // defined in Paintable
            }
            if (node.hasPaintableStroke()) {
                node.beforeCanvasStroke(wrapper); // defined in Paintable
                context.stroke();
                node.afterCanvasStroke(wrapper); // defined in Paintable
            }
        }
    }
    /**
   * @public
   */ markDirtyShape() {
        this.markPaintDirty();
    }
};
scenery.register('PathCanvasDrawable', PathCanvasDrawable);
Poolable.mixInto(PathCanvasDrawable);
export default PathCanvasDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUGF0aENhbnZhc0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhbnZhcyBkcmF3YWJsZSBmb3IgUGF0aCBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XG5pbXBvcnQgeyBDYW52YXNTZWxmRHJhd2FibGUsIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFBhdGhDYW52YXNEcmF3YWJsZSBleHRlbmRzIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlKCBDYW52YXNTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBQYWludHMgdGhpcyBkcmF3YWJsZSB0byBhIENhbnZhcyAodGhlIHdyYXBwZXIgY29udGFpbnMgYm90aCBhIENhbnZhcyByZWZlcmVuY2UgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgQ2FudmFzJ3MgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBwcm9wZXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIG5vZGUsIGFuZCB0aGF0IGFueVxuICAgKiBvdGhlciByZXF1aXJlZCBlZmZlY3RzIChvcGFjaXR5LCBjbGlwcGluZywgZXRjLikgaGF2ZSBhbHJlYWR5IGJlZW4gcHJlcGFyZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgQ2FudmFzU2VsZkRyYXdhYmxlIEFQSSByZXF1aXJlZCB0byBiZSBpbXBsZW1lbnRlZCBmb3Igc3VidHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IHdyYXBwZXIgLSBDb250YWlucyB0aGUgQ2FudmFzIGFuZCBpdHMgZHJhd2luZyBjb250ZXh0XG4gICAqIEBwYXJhbSB7c2NlbmVyeS5Ob2RlfSBub2RlIC0gT3VyIG5vZGUgdGhhdCBpcyBiZWluZyBkcmF3blxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYXBwbGllZCBmb3IgdGhpcyBub2RlJ3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAqL1xuICBwYWludENhbnZhcyggd3JhcHBlciwgbm9kZSwgbWF0cml4ICkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB3cmFwcGVyLmNvbnRleHQ7XG5cbiAgICBpZiAoIG5vZGUuaGFzU2hhcGUoKSApIHtcbiAgICAgIC8vIFRPRE86IGZpbGwvc3Ryb2tlIGRlbGF5IG9wdGltaXphdGlvbnM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgbm9kZS5fc2hhcGUud3JpdGVUb0NvbnRleHQoIGNvbnRleHQgKTtcblxuICAgICAgaWYgKCBub2RlLmhhc0ZpbGwoKSApIHtcbiAgICAgICAgbm9kZS5iZWZvcmVDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgICBub2RlLmFmdGVyQ2FudmFzRmlsbCggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgICAgfVxuXG4gICAgICBpZiAoIG5vZGUuaGFzUGFpbnRhYmxlU3Ryb2tlKCkgKSB7XG4gICAgICAgIG5vZGUuYmVmb3JlQ2FudmFzU3Ryb2tlKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIG5vZGUuYWZ0ZXJDYW52YXNTdHJva2UoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5U2hhcGUoKSB7XG4gICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQYXRoQ2FudmFzRHJhd2FibGUnLCBQYXRoQ2FudmFzRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggUGF0aENhbnZhc0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFBhdGhDYW52YXNEcmF3YWJsZTsiXSwibmFtZXMiOlsiUG9vbGFibGUiLCJDYW52YXNTZWxmRHJhd2FibGUiLCJQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSIsInNjZW5lcnkiLCJQYXRoQ2FudmFzRHJhd2FibGUiLCJwYWludENhbnZhcyIsIndyYXBwZXIiLCJub2RlIiwibWF0cml4IiwiY29udGV4dCIsImhhc1NoYXBlIiwiYmVnaW5QYXRoIiwiX3NoYXBlIiwid3JpdGVUb0NvbnRleHQiLCJoYXNGaWxsIiwiYmVmb3JlQ2FudmFzRmlsbCIsImZpbGwiLCJhZnRlckNhbnZhc0ZpbGwiLCJoYXNQYWludGFibGVTdHJva2UiLCJiZWZvcmVDYW52YXNTdHJva2UiLCJzdHJva2UiLCJhZnRlckNhbnZhc1N0cm9rZSIsIm1hcmtEaXJ0eVNoYXBlIiwibWFya1BhaW50RGlydHkiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0Msa0JBQWtCLEVBQUVDLDBCQUEwQixFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRTNGLElBQUEsQUFBTUMscUJBQU4sTUFBTUEsMkJBQTJCRiwyQkFBNEJEO0lBQzNEOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNESSxZQUFhQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsTUFBTSxFQUFHO1FBQ25DLE1BQU1DLFVBQVVILFFBQVFHLE9BQU87UUFFL0IsSUFBS0YsS0FBS0csUUFBUSxJQUFLO1lBQ3JCLHlGQUF5RjtZQUN6RkQsUUFBUUUsU0FBUztZQUNqQkosS0FBS0ssTUFBTSxDQUFDQyxjQUFjLENBQUVKO1lBRTVCLElBQUtGLEtBQUtPLE9BQU8sSUFBSztnQkFDcEJQLEtBQUtRLGdCQUFnQixDQUFFVCxVQUFXLHVCQUF1QjtnQkFDekRHLFFBQVFPLElBQUk7Z0JBQ1pULEtBQUtVLGVBQWUsQ0FBRVgsVUFBVyx1QkFBdUI7WUFDMUQ7WUFFQSxJQUFLQyxLQUFLVyxrQkFBa0IsSUFBSztnQkFDL0JYLEtBQUtZLGtCQUFrQixDQUFFYixVQUFXLHVCQUF1QjtnQkFDM0RHLFFBQVFXLE1BQU07Z0JBQ2RiLEtBQUtjLGlCQUFpQixDQUFFZixVQUFXLHVCQUF1QjtZQUM1RDtRQUNGO0lBQ0Y7SUFFQTs7R0FFQyxHQUNEZ0IsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDQyxjQUFjO0lBQ3JCO0FBQ0Y7QUFFQXBCLFFBQVFxQixRQUFRLENBQUUsc0JBQXNCcEI7QUFFeENKLFNBQVN5QixPQUFPLENBQUVyQjtBQUVsQixlQUFlQSxtQkFBbUIifQ==