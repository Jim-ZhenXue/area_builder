// Copyright 2016-2023, University of Colorado Boulder
/**
 * Canvas drawable for Rectangle nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, PaintableStatelessDrawable, scenery } from '../../imports.js';
let RectangleCanvasDrawable = class RectangleCanvasDrawable extends PaintableStatelessDrawable(CanvasSelfDrawable) {
    /**
   * Convenience function for drawing a rectangular path (with our Rectangle node's parameters) to the Canvas context.
   * @private
   *
   * @param {CanvasRenderingContext2D} context - To execute drawing commands on.
   * @param {Node} node - The node whose rectangle we want to draw
   */ writeRectangularPath(context, node) {
        context.beginPath();
        context.moveTo(node._rectX, node._rectY);
        context.lineTo(node._rectX + node._rectWidth, node._rectY);
        context.lineTo(node._rectX + node._rectWidth, node._rectY + node._rectHeight);
        context.lineTo(node._rectX, node._rectY + node._rectHeight);
        context.closePath();
    }
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
        // use the standard version if it's a rounded rectangle, since there is no Canvas-optimized version for that
        if (node.isRounded()) {
            context.beginPath();
            const maximumArcSize = node.getMaximumArcSize();
            const arcw = Math.min(node._cornerXRadius, maximumArcSize);
            const arch = Math.min(node._cornerYRadius, maximumArcSize);
            const lowX = node._rectX + arcw;
            const highX = node._rectX + node._rectWidth - arcw;
            const lowY = node._rectY + arch;
            const highY = node._rectY + node._rectHeight - arch;
            if (arcw === arch) {
                // we can use circular arcs, which have well defined stroked offsets
                context.arc(highX, lowY, arcw, -Math.PI / 2, 0, false);
                context.arc(highX, highY, arcw, 0, Math.PI / 2, false);
                context.arc(lowX, highY, arcw, Math.PI / 2, Math.PI, false);
                context.arc(lowX, lowY, arcw, Math.PI, Math.PI * 3 / 2, false);
            } else {
                // we have to resort to elliptical arcs
                context.ellipse(highX, lowY, arcw, arch, 0, -Math.PI / 2, 0, false);
                context.ellipse(highX, highY, arcw, arch, 0, 0, Math.PI / 2, false);
                context.ellipse(lowX, highY, arcw, arch, 0, Math.PI / 2, Math.PI, false);
                context.ellipse(lowX, lowY, arcw, arch, 0, Math.PI, Math.PI * 3 / 2, false);
            }
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
        } else {
            // TODO: how to handle fill/stroke delay optimizations here? https://github.com/phetsims/scenery/issues/1581
            if (node.hasFill()) {
                // If we need the fill pattern/gradient to have a different transformation, we can't use fillRect.
                // See https://github.com/phetsims/scenery/issues/543
                if (node.getFillValue().transformMatrix) {
                    this.writeRectangularPath(context, node);
                    node.beforeCanvasFill(wrapper); // defined in Paintable
                    context.fill();
                    node.afterCanvasFill(wrapper); // defined in Paintable
                } else {
                    node.beforeCanvasFill(wrapper); // defined in Paintable
                    context.fillRect(node._rectX, node._rectY, node._rectWidth, node._rectHeight);
                    node.afterCanvasFill(wrapper); // defined in Paintable
                }
            }
            if (node.hasPaintableStroke()) {
                // If we need the fill pattern/gradient to have a different transformation, we can't use fillRect.
                // See https://github.com/phetsims/scenery/issues/543
                if (node.getStrokeValue().transformMatrix) {
                    this.writeRectangularPath(context, node);
                    node.beforeCanvasStroke(wrapper); // defined in Paintable
                    context.stroke();
                    node.afterCanvasStroke(wrapper); // defined in Paintable
                } else {
                    node.beforeCanvasStroke(wrapper); // defined in Paintable
                    context.strokeRect(node._rectX, node._rectY, node._rectWidth, node._rectHeight);
                    node.afterCanvasStroke(wrapper); // defined in Paintable
                }
            }
        }
    }
    /**
   * @public
   */ markDirtyRectangle() {
        this.markPaintDirty();
    }
    /**
   * @public
   */ markDirtyX() {
        this.markDirtyRectangle();
    }
    /**
   * @public
   */ markDirtyY() {
        this.markDirtyRectangle();
    }
    /**
   * @public
   */ markDirtyWidth() {
        this.markDirtyRectangle();
    }
    /**
   * @public
   */ markDirtyHeight() {
        this.markDirtyRectangle();
    }
    /**
   * @public
   */ markDirtyCornerXRadius() {
        this.markDirtyRectangle();
    }
    /**
   * @public
   */ markDirtyCornerYRadius() {
        this.markDirtyRectangle();
    }
};
scenery.register('RectangleCanvasDrawable', RectangleCanvasDrawable);
Poolable.mixInto(RectangleCanvasDrawable);
export default RectangleCanvasDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ2FudmFzIGRyYXdhYmxlIGZvciBSZWN0YW5nbGUgbm9kZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgQ2FudmFzU2VsZkRyYXdhYmxlLCBQYWludGFibGVTdGF0ZWxlc3NEcmF3YWJsZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBSZWN0YW5nbGVDYW52YXNEcmF3YWJsZSBleHRlbmRzIFBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlKCBDYW52YXNTZWxmRHJhd2FibGUgKSB7XG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgZHJhd2luZyBhIHJlY3Rhbmd1bGFyIHBhdGggKHdpdGggb3VyIFJlY3RhbmdsZSBub2RlJ3MgcGFyYW1ldGVycykgdG8gdGhlIENhbnZhcyBjb250ZXh0LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dCAtIFRvIGV4ZWN1dGUgZHJhd2luZyBjb21tYW5kcyBvbi5cbiAgICogQHBhcmFtIHtOb2RlfSBub2RlIC0gVGhlIG5vZGUgd2hvc2UgcmVjdGFuZ2xlIHdlIHdhbnQgdG8gZHJhd1xuICAgKi9cbiAgd3JpdGVSZWN0YW5ndWxhclBhdGgoIGNvbnRleHQsIG5vZGUgKSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyggbm9kZS5fcmVjdFgsIG5vZGUuX3JlY3RZICk7XG4gICAgY29udGV4dC5saW5lVG8oIG5vZGUuX3JlY3RYICsgbm9kZS5fcmVjdFdpZHRoLCBub2RlLl9yZWN0WSApO1xuICAgIGNvbnRleHQubGluZVRvKCBub2RlLl9yZWN0WCArIG5vZGUuX3JlY3RXaWR0aCwgbm9kZS5fcmVjdFkgKyBub2RlLl9yZWN0SGVpZ2h0ICk7XG4gICAgY29udGV4dC5saW5lVG8oIG5vZGUuX3JlY3RYLCBub2RlLl9yZWN0WSArIG5vZGUuX3JlY3RIZWlnaHQgKTtcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhaW50cyB0aGlzIGRyYXdhYmxlIHRvIGEgQ2FudmFzICh0aGUgd3JhcHBlciBjb250YWlucyBib3RoIGEgQ2FudmFzIHJlZmVyZW5jZSBhbmQgaXRzIGRyYXdpbmcgY29udGV4dCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQXNzdW1lcyB0aGF0IHRoZSBDYW52YXMncyBjb250ZXh0IGlzIGFscmVhZHkgaW4gdGhlIHByb3BlciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIGZvciB0aGUgbm9kZSwgYW5kIHRoYXQgYW55XG4gICAqIG90aGVyIHJlcXVpcmVkIGVmZmVjdHMgKG9wYWNpdHksIGNsaXBwaW5nLCBldGMuKSBoYXZlIGFscmVhZHkgYmVlbiBwcmVwYXJlZC5cbiAgICpcbiAgICogVGhpcyBpcyBwYXJ0IG9mIHRoZSBDYW52YXNTZWxmRHJhd2FibGUgQVBJIHJlcXVpcmVkIHRvIGJlIGltcGxlbWVudGVkIGZvciBzdWJ0eXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHtDYW52YXNDb250ZXh0V3JhcHBlcn0gd3JhcHBlciAtIENvbnRhaW5zIHRoZSBDYW52YXMgYW5kIGl0cyBkcmF3aW5nIGNvbnRleHRcbiAgICogQHBhcmFtIHtzY2VuZXJ5Lk5vZGV9IG5vZGUgLSBPdXIgbm9kZSB0aGF0IGlzIGJlaW5nIGRyYXduXG4gICAqIEBwYXJhbSB7TWF0cml4M30gbWF0cml4IC0gVGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBhcHBsaWVkIGZvciB0aGlzIG5vZGUncyBjb29yZGluYXRlIHN5c3RlbS5cbiAgICovXG4gIHBhaW50Q2FudmFzKCB3cmFwcGVyLCBub2RlLCBtYXRyaXggKSB7XG4gICAgY29uc3QgY29udGV4dCA9IHdyYXBwZXIuY29udGV4dDtcblxuICAgIC8vIHVzZSB0aGUgc3RhbmRhcmQgdmVyc2lvbiBpZiBpdCdzIGEgcm91bmRlZCByZWN0YW5nbGUsIHNpbmNlIHRoZXJlIGlzIG5vIENhbnZhcy1vcHRpbWl6ZWQgdmVyc2lvbiBmb3IgdGhhdFxuICAgIGlmICggbm9kZS5pc1JvdW5kZWQoKSApIHtcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb25zdCBtYXhpbXVtQXJjU2l6ZSA9IG5vZGUuZ2V0TWF4aW11bUFyY1NpemUoKTtcbiAgICAgIGNvbnN0IGFyY3cgPSBNYXRoLm1pbiggbm9kZS5fY29ybmVyWFJhZGl1cywgbWF4aW11bUFyY1NpemUgKTtcbiAgICAgIGNvbnN0IGFyY2ggPSBNYXRoLm1pbiggbm9kZS5fY29ybmVyWVJhZGl1cywgbWF4aW11bUFyY1NpemUgKTtcbiAgICAgIGNvbnN0IGxvd1ggPSBub2RlLl9yZWN0WCArIGFyY3c7XG4gICAgICBjb25zdCBoaWdoWCA9IG5vZGUuX3JlY3RYICsgbm9kZS5fcmVjdFdpZHRoIC0gYXJjdztcbiAgICAgIGNvbnN0IGxvd1kgPSBub2RlLl9yZWN0WSArIGFyY2g7XG4gICAgICBjb25zdCBoaWdoWSA9IG5vZGUuX3JlY3RZICsgbm9kZS5fcmVjdEhlaWdodCAtIGFyY2g7XG4gICAgICBpZiAoIGFyY3cgPT09IGFyY2ggKSB7XG4gICAgICAgIC8vIHdlIGNhbiB1c2UgY2lyY3VsYXIgYXJjcywgd2hpY2ggaGF2ZSB3ZWxsIGRlZmluZWQgc3Ryb2tlZCBvZmZzZXRzXG4gICAgICAgIGNvbnRleHQuYXJjKCBoaWdoWCwgbG93WSwgYXJjdywgLU1hdGguUEkgLyAyLCAwLCBmYWxzZSApO1xuICAgICAgICBjb250ZXh0LmFyYyggaGlnaFgsIGhpZ2hZLCBhcmN3LCAwLCBNYXRoLlBJIC8gMiwgZmFsc2UgKTtcbiAgICAgICAgY29udGV4dC5hcmMoIGxvd1gsIGhpZ2hZLCBhcmN3LCBNYXRoLlBJIC8gMiwgTWF0aC5QSSwgZmFsc2UgKTtcbiAgICAgICAgY29udGV4dC5hcmMoIGxvd1gsIGxvd1ksIGFyY3csIE1hdGguUEksIE1hdGguUEkgKiAzIC8gMiwgZmFsc2UgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyB3ZSBoYXZlIHRvIHJlc29ydCB0byBlbGxpcHRpY2FsIGFyY3NcbiAgICAgICAgY29udGV4dC5lbGxpcHNlKCBoaWdoWCwgbG93WSwgYXJjdywgYXJjaCwgMCwgLU1hdGguUEkgLyAyLCAwLCBmYWxzZSApO1xuICAgICAgICBjb250ZXh0LmVsbGlwc2UoIGhpZ2hYLCBoaWdoWSwgYXJjdywgYXJjaCwgMCwgMCwgTWF0aC5QSSAvIDIsIGZhbHNlICk7XG4gICAgICAgIGNvbnRleHQuZWxsaXBzZSggbG93WCwgaGlnaFksIGFyY3csIGFyY2gsIDAsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApO1xuICAgICAgICBjb250ZXh0LmVsbGlwc2UoIGxvd1gsIGxvd1ksIGFyY3csIGFyY2gsIDAsIE1hdGguUEksIE1hdGguUEkgKiAzIC8gMiwgZmFsc2UgKTtcbiAgICAgIH1cbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG5cbiAgICAgIGlmICggbm9kZS5oYXNGaWxsKCkgKSB7XG4gICAgICAgIG5vZGUuYmVmb3JlQ2FudmFzRmlsbCggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgICAgICBjb250ZXh0LmZpbGwoKTtcbiAgICAgICAgbm9kZS5hZnRlckNhbnZhc0ZpbGwoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5oYXNQYWludGFibGVTdHJva2UoKSApIHtcbiAgICAgICAgbm9kZS5iZWZvcmVDYW52YXNTdHJva2UoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgbm9kZS5hZnRlckNhbnZhc1N0cm9rZSggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFRPRE86IGhvdyB0byBoYW5kbGUgZmlsbC9zdHJva2UgZGVsYXkgb3B0aW1pemF0aW9ucyBoZXJlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgaWYgKCBub2RlLmhhc0ZpbGwoKSApIHtcbiAgICAgICAgLy8gSWYgd2UgbmVlZCB0aGUgZmlsbCBwYXR0ZXJuL2dyYWRpZW50IHRvIGhhdmUgYSBkaWZmZXJlbnQgdHJhbnNmb3JtYXRpb24sIHdlIGNhbid0IHVzZSBmaWxsUmVjdC5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81NDNcbiAgICAgICAgaWYgKCBub2RlLmdldEZpbGxWYWx1ZSgpLnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgICAgICB0aGlzLndyaXRlUmVjdGFuZ3VsYXJQYXRoKCBjb250ZXh0LCBub2RlICk7XG4gICAgICAgICAgbm9kZS5iZWZvcmVDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICAgICAgY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgbm9kZS5hZnRlckNhbnZhc0ZpbGwoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBub2RlLmJlZm9yZUNhbnZhc0ZpbGwoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KCBub2RlLl9yZWN0WCwgbm9kZS5fcmVjdFksIG5vZGUuX3JlY3RXaWR0aCwgbm9kZS5fcmVjdEhlaWdodCApO1xuICAgICAgICAgIG5vZGUuYWZ0ZXJDYW52YXNGaWxsKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5oYXNQYWludGFibGVTdHJva2UoKSApIHtcbiAgICAgICAgLy8gSWYgd2UgbmVlZCB0aGUgZmlsbCBwYXR0ZXJuL2dyYWRpZW50IHRvIGhhdmUgYSBkaWZmZXJlbnQgdHJhbnNmb3JtYXRpb24sIHdlIGNhbid0IHVzZSBmaWxsUmVjdC5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81NDNcbiAgICAgICAgaWYgKCBub2RlLmdldFN0cm9rZVZhbHVlKCkudHJhbnNmb3JtTWF0cml4ICkge1xuICAgICAgICAgIHRoaXMud3JpdGVSZWN0YW5ndWxhclBhdGgoIGNvbnRleHQsIG5vZGUgKTtcbiAgICAgICAgICBub2RlLmJlZm9yZUNhbnZhc1N0cm9rZSggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgbm9kZS5hZnRlckNhbnZhc1N0cm9rZSggd3JhcHBlciApOyAvLyBkZWZpbmVkIGluIFBhaW50YWJsZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG5vZGUuYmVmb3JlQ2FudmFzU3Ryb2tlKCB3cmFwcGVyICk7IC8vIGRlZmluZWQgaW4gUGFpbnRhYmxlXG4gICAgICAgICAgY29udGV4dC5zdHJva2VSZWN0KCBub2RlLl9yZWN0WCwgbm9kZS5fcmVjdFksIG5vZGUuX3JlY3RXaWR0aCwgbm9kZS5fcmVjdEhlaWdodCApO1xuICAgICAgICAgIG5vZGUuYWZ0ZXJDYW52YXNTdHJva2UoIHdyYXBwZXIgKTsgLy8gZGVmaW5lZCBpbiBQYWludGFibGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlSZWN0YW5nbGUoKSB7XG4gICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIG1hcmtEaXJ0eVgoKSB7XG4gICAgdGhpcy5tYXJrRGlydHlSZWN0YW5nbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlZKCkge1xuICAgIHRoaXMubWFya0RpcnR5UmVjdGFuZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5V2lkdGgoKSB7XG4gICAgdGhpcy5tYXJrRGlydHlSZWN0YW5nbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlIZWlnaHQoKSB7XG4gICAgdGhpcy5tYXJrRGlydHlSZWN0YW5nbGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlDb3JuZXJYUmFkaXVzKCkge1xuICAgIHRoaXMubWFya0RpcnR5UmVjdGFuZ2xlKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5Q29ybmVyWVJhZGl1cygpIHtcbiAgICB0aGlzLm1hcmtEaXJ0eVJlY3RhbmdsZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSZWN0YW5nbGVDYW52YXNEcmF3YWJsZScsIFJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlICk7XG5cblBvb2xhYmxlLm1peEludG8oIFJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlOyJdLCJuYW1lcyI6WyJQb29sYWJsZSIsIkNhbnZhc1NlbGZEcmF3YWJsZSIsIlBhaW50YWJsZVN0YXRlbGVzc0RyYXdhYmxlIiwic2NlbmVyeSIsIlJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlIiwid3JpdGVSZWN0YW5ndWxhclBhdGgiLCJjb250ZXh0Iiwibm9kZSIsImJlZ2luUGF0aCIsIm1vdmVUbyIsIl9yZWN0WCIsIl9yZWN0WSIsImxpbmVUbyIsIl9yZWN0V2lkdGgiLCJfcmVjdEhlaWdodCIsImNsb3NlUGF0aCIsInBhaW50Q2FudmFzIiwid3JhcHBlciIsIm1hdHJpeCIsImlzUm91bmRlZCIsIm1heGltdW1BcmNTaXplIiwiZ2V0TWF4aW11bUFyY1NpemUiLCJhcmN3IiwiTWF0aCIsIm1pbiIsIl9jb3JuZXJYUmFkaXVzIiwiYXJjaCIsIl9jb3JuZXJZUmFkaXVzIiwibG93WCIsImhpZ2hYIiwibG93WSIsImhpZ2hZIiwiYXJjIiwiUEkiLCJlbGxpcHNlIiwiaGFzRmlsbCIsImJlZm9yZUNhbnZhc0ZpbGwiLCJmaWxsIiwiYWZ0ZXJDYW52YXNGaWxsIiwiaGFzUGFpbnRhYmxlU3Ryb2tlIiwiYmVmb3JlQ2FudmFzU3Ryb2tlIiwic3Ryb2tlIiwiYWZ0ZXJDYW52YXNTdHJva2UiLCJnZXRGaWxsVmFsdWUiLCJ0cmFuc2Zvcm1NYXRyaXgiLCJmaWxsUmVjdCIsImdldFN0cm9rZVZhbHVlIiwic3Ryb2tlUmVjdCIsIm1hcmtEaXJ0eVJlY3RhbmdsZSIsIm1hcmtQYWludERpcnR5IiwibWFya0RpcnR5WCIsIm1hcmtEaXJ0eVkiLCJtYXJrRGlydHlXaWR0aCIsIm1hcmtEaXJ0eUhlaWdodCIsIm1hcmtEaXJ0eUNvcm5lclhSYWRpdXMiLCJtYXJrRGlydHlDb3JuZXJZUmFkaXVzIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsdUNBQXVDO0FBQzVELFNBQVNDLGtCQUFrQixFQUFFQywwQkFBMEIsRUFBRUMsT0FBTyxRQUFRLG1CQUFt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