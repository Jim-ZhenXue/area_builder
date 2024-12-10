// Copyright 2016-2022, University of Colorado Boulder
/**
 * Canvas drawable for Circle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, Node, PaintableStatelessDrawable, scenery } from '../../imports.js';
let CircleCanvasDrawable = class CircleCanvasDrawable extends PaintableStatelessDrawable(CanvasSelfDrawable) {
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
        assert && assert(node instanceof Node);
        const context = wrapper.context;
        context.beginPath();
        context.arc(0, 0, node._radius, 0, Math.PI * 2, false);
        context.closePath();
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
    /**
   * Called when the radius of the circle changes.
   * @public
   */ markDirtyRadius() {
        this.markPaintDirty();
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        super.dispose();
    }
};
scenery.register('CircleCanvasDrawable', CircleCanvasDrawable);
Poolable.mixInto(CircleCanvasDrawable);
export default CircleCanvasDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvQ2lyY2xlQ2FudmFzRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ2FudmFzIGRyYXdhYmxlIGZvciBDaXJjbGUgbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgQ2FudmFzU2VsZkRyYXdhYmxlLCBOb2RlLCBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBDaXJjbGVDYW52YXNEcmF3YWJsZSBleHRlbmRzIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlKCBDYW52YXNTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBQYWludHMgdGhpcyBkcmF3YWJsZSB0byBhIENhbnZhcyAodGhlIHdyYXBwZXIgY29udGFpbnMgYm90aCBhIENhbnZhcyByZWZlcmVuY2UgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHQpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgQ2FudmFzJ3MgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBwcm9wZXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIG5vZGUsIGFuZCB0aGF0IGFueVxuICAgKiBvdGhlciByZXF1aXJlZCBlZmZlY3RzIChvcGFjaXR5LCBjbGlwcGluZywgZXRjLikgaGF2ZSBhbHJlYWR5IGJlZW4gcHJlcGFyZWQuXG4gICAqXG4gICAqIFRoaXMgaXMgcGFydCBvZiB0aGUgQ2FudmFzU2VsZkRyYXdhYmxlIEFQSSByZXF1aXJlZCB0byBiZSBpbXBsZW1lbnRlZCBmb3Igc3VidHlwZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IHdyYXBwZXIgLSBDb250YWlucyB0aGUgQ2FudmFzIGFuZCBpdHMgZHJhd2luZyBjb250ZXh0XG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAtIE91ciBub2RlIHRoYXQgaXMgYmVpbmcgZHJhd25cbiAgICogQHBhcmFtIHtNYXRyaXgzfSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFwcGxpZWQgZm9yIHRoaXMgbm9kZSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgKi9cbiAgcGFpbnRDYW52YXMoIHdyYXBwZXIsIG5vZGUsIG1hdHJpeCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlIGluc3RhbmNlb2YgTm9kZSApO1xuICAgIGNvbnN0IGNvbnRleHQgPSB3cmFwcGVyLmNvbnRleHQ7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKCAwLCAwLCBub2RlLl9yYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSApO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cbiAgICBpZiAoIG5vZGUuaGFzRmlsbCgpICkge1xuICAgICAgbm9kZS5iZWZvcmVDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgIG5vZGUuYWZ0ZXJDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgfVxuICAgIGlmICggbm9kZS5oYXNQYWludGFibGVTdHJva2UoKSApIHtcbiAgICAgIG5vZGUuYmVmb3JlQ2FudmFzU3Ryb2tlKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgbm9kZS5hZnRlckNhbnZhc1N0cm9rZSggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcmFkaXVzIG9mIHRoZSBjaXJjbGUgY2hhbmdlcy5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5UmFkaXVzKCkge1xuICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGUgZHJhd2FibGUuXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQ2lyY2xlQ2FudmFzRHJhd2FibGUnLCBDaXJjbGVDYW52YXNEcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBDaXJjbGVDYW52YXNEcmF3YWJsZSApO1xuXG5leHBvcnQgZGVmYXVsdCBDaXJjbGVDYW52YXNEcmF3YWJsZTsiXSwibmFtZXMiOlsiUG9vbGFibGUiLCJDYW52YXNTZWxmRHJhd2FibGUiLCJOb2RlIiwiUGFpbnRhYmxlU3RhdGVsZXNzRHJhd2FibGUiLCJzY2VuZXJ5IiwiQ2lyY2xlQ2FudmFzRHJhd2FibGUiLCJwYWludENhbnZhcyIsIndyYXBwZXIiLCJub2RlIiwibWF0cml4IiwiYXNzZXJ0IiwiY29udGV4dCIsImJlZ2luUGF0aCIsImFyYyIsIl9yYWRpdXMiLCJNYXRoIiwiUEkiLCJjbG9zZVBhdGgiLCJoYXNGaWxsIiwiYmVmb3JlQ2FudmFzRmlsbCIsImZpbGwiLCJhZnRlckNhbnZhc0ZpbGwiLCJoYXNQYWludGFibGVTdHJva2UiLCJiZWZvcmVDYW52YXNTdHJva2UiLCJzdHJva2UiLCJhZnRlckNhbnZhc1N0cm9rZSIsIm1hcmtEaXJ0eVJhZGl1cyIsIm1hcmtQYWludERpcnR5IiwiZGlzcG9zZSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFFQywwQkFBMEIsRUFBRUMsT0FBTyxRQUFRLG1CQUFtQjtBQUVqRyxJQUFBLEFBQU1DLHVCQUFOLE1BQU1BLDZCQUE2QkYsMkJBQTRCRjtJQUM3RDs7Ozs7Ozs7Ozs7O0dBWUMsR0FDREssWUFBYUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLE1BQU0sRUFBRztRQUNuQ0MsVUFBVUEsT0FBUUYsZ0JBQWdCTjtRQUNsQyxNQUFNUyxVQUFVSixRQUFRSSxPQUFPO1FBRS9CQSxRQUFRQyxTQUFTO1FBQ2pCRCxRQUFRRSxHQUFHLENBQUUsR0FBRyxHQUFHTCxLQUFLTSxPQUFPLEVBQUUsR0FBR0MsS0FBS0MsRUFBRSxHQUFHLEdBQUc7UUFDakRMLFFBQVFNLFNBQVM7UUFFakIsSUFBS1QsS0FBS1UsT0FBTyxJQUFLO1lBQ3BCVixLQUFLVyxnQkFBZ0IsQ0FBRVosVUFBVyx1QkFBdUI7WUFDekRJLFFBQVFTLElBQUk7WUFDWlosS0FBS2EsZUFBZSxDQUFFZCxVQUFXLHVCQUF1QjtRQUMxRDtRQUNBLElBQUtDLEtBQUtjLGtCQUFrQixJQUFLO1lBQy9CZCxLQUFLZSxrQkFBa0IsQ0FBRWhCLFVBQVcsdUJBQXVCO1lBQzNESSxRQUFRYSxNQUFNO1lBQ2RoQixLQUFLaUIsaUJBQWlCLENBQUVsQixVQUFXLHVCQUF1QjtRQUM1RDtJQUNGO0lBRUE7OztHQUdDLEdBQ0RtQixrQkFBa0I7UUFDaEIsSUFBSSxDQUFDQyxjQUFjO0lBQ3JCO0lBRUE7Ozs7R0FJQyxHQUNEQyxVQUFVO1FBQ1IsS0FBSyxDQUFDQTtJQUNSO0FBQ0Y7QUFFQXhCLFFBQVF5QixRQUFRLENBQUUsd0JBQXdCeEI7QUFFMUNMLFNBQVM4QixPQUFPLENBQUV6QjtBQUVsQixlQUFlQSxxQkFBcUIifQ==