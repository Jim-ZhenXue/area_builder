// Copyright 2016-2022, University of Colorado Boulder
/**
 * Canvas drawable for Text nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, PaintableStatelessDrawable, scenery } from '../../imports.js';
let TextCanvasDrawable = class TextCanvasDrawable extends PaintableStatelessDrawable(CanvasSelfDrawable) {
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
        // extra parameters we need to set, but should avoid setting if we aren't drawing anything
        if (node.hasFill() || node.hasPaintableStroke()) {
            wrapper.setFont(node._font.getFont());
            wrapper.setDirection('ltr');
        }
        if (node.hasFill()) {
            node.beforeCanvasFill(wrapper); // defined in Paintable
            context.fillText(node.renderedText, 0, 0);
            node.afterCanvasFill(wrapper); // defined in Paintable
        }
        if (node.hasPaintableStroke()) {
            node.beforeCanvasStroke(wrapper); // defined in Paintable
            context.strokeText(node.renderedText, 0, 0);
            node.afterCanvasStroke(wrapper); // defined in Paintable
        }
    }
    /**
   * @public
   */ markDirtyText() {
        this.markPaintDirty();
    }
    /**
   * @public
   */ markDirtyFont() {
        this.markPaintDirty();
    }
    /**
   * @public
   */ markDirtyBounds() {
        this.markPaintDirty();
    }
};
scenery.register('TextCanvasDrawable', TextCanvasDrawable);
Poolable.mixInto(TextCanvasDrawable);
export default TextCanvasDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvVGV4dENhbnZhc0RyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhbnZhcyBkcmF3YWJsZSBmb3IgVGV4dCBub2Rlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XG5pbXBvcnQgeyBDYW52YXNTZWxmRHJhd2FibGUsIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFRleHRDYW52YXNEcmF3YWJsZSBleHRlbmRzIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlKCBDYW52YXNTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBQYWludHMgdGhpcyBkcmF3YWJsZSB0byBhIENhbnZhcyAodGhlIHdyYXBwZXIgY29udGFpbnMgYm90aCBhIENhbnZhcyByZWZlcmVuY2UgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgQ2FudmFzJ3MgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBwcm9wZXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIG5vZGUsIGFuZCB0aGF0IGFueVxuICAgKiBvdGhlciByZXF1aXJlZCBlZmZlY3RzIChvcGFjaXR5LCBjbGlwcGluZywgZXRjLikgaGF2ZSBhbHJlYWR5IGJlZW4gcHJlcGFyZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgQ2FudmFzU2VsZkRyYXdhYmxlIEFQSSByZXF1aXJlZCB0byBiZSBpbXBsZW1lbnRlZCBmb3Igc3VidHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IHdyYXBwZXIgLSBDb250YWlucyB0aGUgQ2FudmFzIGFuZCBpdHMgZHJhd2luZyBjb250ZXh0XG4gICAqIEBwYXJhbSB7c2NlbmVyeS5Ob2RlfSBub2RlIC0gT3VyIG5vZGUgdGhhdCBpcyBiZWluZyBkcmF3blxuICAgKiBAcGFyYW0ge01hdHJpeDN9IG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYXBwbGllZCBmb3IgdGhpcyBub2RlJ3MgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gICAqL1xuICBwYWludENhbnZhcyggd3JhcHBlciwgbm9kZSwgbWF0cml4ICkge1xuICAgIGNvbnN0IGNvbnRleHQgPSB3cmFwcGVyLmNvbnRleHQ7XG5cbiAgICAvLyBleHRyYSBwYXJhbWV0ZXJzIHdlIG5lZWQgdG8gc2V0LCBidXQgc2hvdWxkIGF2b2lkIHNldHRpbmcgaWYgd2UgYXJlbid0IGRyYXdpbmcgYW55dGhpbmdcbiAgICBpZiAoIG5vZGUuaGFzRmlsbCgpIHx8IG5vZGUuaGFzUGFpbnRhYmxlU3Ryb2tlKCkgKSB7XG4gICAgICB3cmFwcGVyLnNldEZvbnQoIG5vZGUuX2ZvbnQuZ2V0Rm9udCgpICk7XG4gICAgICB3cmFwcGVyLnNldERpcmVjdGlvbiggJ2x0cicgKTtcbiAgICB9XG5cbiAgICBpZiAoIG5vZGUuaGFzRmlsbCgpICkge1xuICAgICAgbm9kZS5iZWZvcmVDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICBjb250ZXh0LmZpbGxUZXh0KCBub2RlLnJlbmRlcmVkVGV4dCwgMCwgMCApO1xuICAgICAgbm9kZS5hZnRlckNhbnZhc0ZpbGwoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICB9XG4gICAgaWYgKCBub2RlLmhhc1BhaW50YWJsZVN0cm9rZSgpICkge1xuICAgICAgbm9kZS5iZWZvcmVDYW52YXNTdHJva2UoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgIGNvbnRleHQuc3Ryb2tlVGV4dCggbm9kZS5yZW5kZXJlZFRleHQsIDAsIDAgKTtcbiAgICAgIG5vZGUuYWZ0ZXJDYW52YXNTdHJva2UoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5VGV4dCgpIHtcbiAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5Rm9udCgpIHtcbiAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5Qm91bmRzKCkge1xuICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnVGV4dENhbnZhc0RyYXdhYmxlJywgVGV4dENhbnZhc0RyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIFRleHRDYW52YXNEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBUZXh0Q2FudmFzRHJhd2FibGU7Il0sIm5hbWVzIjpbIlBvb2xhYmxlIiwiQ2FudmFzU2VsZkRyYXdhYmxlIiwiUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUiLCJzY2VuZXJ5IiwiVGV4dENhbnZhc0RyYXdhYmxlIiwicGFpbnRDYW52YXMiLCJ3cmFwcGVyIiwibm9kZSIsIm1hdHJpeCIsImNvbnRleHQiLCJoYXNGaWxsIiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwic2V0Rm9udCIsIl9mb250IiwiZ2V0Rm9udCIsInNldERpcmVjdGlvbiIsImJlZm9yZUNhbnZhc0ZpbGwiLCJmaWxsVGV4dCIsInJlbmRlcmVkVGV4dCIsImFmdGVyQ2FudmFzRmlsbCIsImJlZm9yZUNhbnZhc1N0cm9rZSIsInN0cm9rZVRleHQiLCJhZnRlckNhbnZhc1N0cm9rZSIsIm1hcmtEaXJ0eVRleHQiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eUZvbnQiLCJtYXJrRGlydHlCb3VuZHMiLCJyZWdpc3RlciIsIm1peEludG8iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBU0Msa0JBQWtCLEVBQUVDLDBCQUEwQixFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRTNGLElBQUEsQUFBTUMscUJBQU4sTUFBTUEsMkJBQTJCRiwyQkFBNEJEO0lBQzNEOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNESSxZQUFhQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsTUFBTSxFQUFHO1FBQ25DLE1BQU1DLFVBQVVILFFBQVFHLE9BQU87UUFFL0IsMEZBQTBGO1FBQzFGLElBQUtGLEtBQUtHLE9BQU8sTUFBTUgsS0FBS0ksa0JBQWtCLElBQUs7WUFDakRMLFFBQVFNLE9BQU8sQ0FBRUwsS0FBS00sS0FBSyxDQUFDQyxPQUFPO1lBQ25DUixRQUFRUyxZQUFZLENBQUU7UUFDeEI7UUFFQSxJQUFLUixLQUFLRyxPQUFPLElBQUs7WUFDcEJILEtBQUtTLGdCQUFnQixDQUFFVixVQUFXLHVCQUF1QjtZQUN6REcsUUFBUVEsUUFBUSxDQUFFVixLQUFLVyxZQUFZLEVBQUUsR0FBRztZQUN4Q1gsS0FBS1ksZUFBZSxDQUFFYixVQUFXLHVCQUF1QjtRQUMxRDtRQUNBLElBQUtDLEtBQUtJLGtCQUFrQixJQUFLO1lBQy9CSixLQUFLYSxrQkFBa0IsQ0FBRWQsVUFBVyx1QkFBdUI7WUFDM0RHLFFBQVFZLFVBQVUsQ0FBRWQsS0FBS1csWUFBWSxFQUFFLEdBQUc7WUFDMUNYLEtBQUtlLGlCQUFpQixDQUFFaEIsVUFBVyx1QkFBdUI7UUFDNUQ7SUFDRjtJQUVBOztHQUVDLEdBQ0RpQixnQkFBZ0I7UUFDZCxJQUFJLENBQUNDLGNBQWM7SUFDckI7SUFFQTs7R0FFQyxHQUNEQyxnQkFBZ0I7UUFDZCxJQUFJLENBQUNELGNBQWM7SUFDckI7SUFFQTs7R0FFQyxHQUNERSxrQkFBa0I7UUFDaEIsSUFBSSxDQUFDRixjQUFjO0lBQ3JCO0FBQ0Y7QUFFQXJCLFFBQVF3QixRQUFRLENBQUUsc0JBQXNCdkI7QUFFeENKLFNBQVM0QixPQUFPLENBQUV4QjtBQUVsQixlQUFlQSxtQkFBbUIifQ==