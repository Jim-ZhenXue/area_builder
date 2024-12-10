// Copyright 2016-2022, University of Colorado Boulder
/**
 * Canvas drawable for Image nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Poolable from '../../../../phet-core/js/Poolable.js';
import { CanvasSelfDrawable, Imageable, scenery } from '../../imports.js';
let ImageCanvasDrawable = class ImageCanvasDrawable extends CanvasSelfDrawable {
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
        const hasImageOpacity = node._imageOpacity !== 1;
        // Ensure that the image has been loaded by checking whether it has a width or height of 0.
        // See https://github.com/phetsims/scenery/issues/536
        if (node._image && node._image.width !== 0 && node._image.height !== 0) {
            // If we have image opacity, we need to apply the opacity on top of whatever globalAlpha may exist
            if (hasImageOpacity) {
                wrapper.context.save();
                wrapper.context.globalAlpha *= node._imageOpacity;
            }
            if (node._mipmap && node.hasMipmaps()) {
                const level = node.getMipmapLevel(matrix, Imageable.CANVAS_MIPMAP_BIAS_ADJUSTMENT);
                const canvas = node.getMipmapCanvas(level);
                const multiplier = Math.pow(2, level);
                wrapper.context.drawImage(canvas, 0, 0, canvas.width * multiplier, canvas.height * multiplier);
            } else {
                wrapper.context.drawImage(node._image, 0, 0);
            }
            if (hasImageOpacity) {
                wrapper.context.restore();
            }
        }
    }
    /**
   * @public
   */ markDirtyImage() {
        this.markPaintDirty();
    }
    /**
   * @public
   */ markDirtyMipmap() {
        this.markPaintDirty();
    }
    /**
   * @public
   */ markDirtyImageOpacity() {
        this.markPaintDirty();
    }
};
scenery.register('ImageCanvasDrawable', ImageCanvasDrawable);
Poolable.mixInto(ImageCanvasDrawable);
export default ImageCanvasDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvSW1hZ2VDYW52YXNEcmF3YWJsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDYW52YXMgZHJhd2FibGUgZm9yIEltYWdlIG5vZGVzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IENhbnZhc1NlbGZEcmF3YWJsZSwgSW1hZ2VhYmxlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIEltYWdlQ2FudmFzRHJhd2FibGUgZXh0ZW5kcyBDYW52YXNTZWxmRHJhd2FibGUge1xuICAvKipcbiAgICogUGFpbnRzIHRoaXMgZHJhd2FibGUgdG8gYSBDYW52YXMgKHRoZSB3cmFwcGVyIGNvbnRhaW5zIGJvdGggYSBDYW52YXMgcmVmZXJlbmNlIGFuZCBpdHMgZHJhd2luZyBjb250ZXh0KS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBBc3N1bWVzIHRoYXQgdGhlIENhbnZhcydzIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgcHJvcGVyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgZm9yIHRoZSBub2RlLCBhbmQgdGhhdCBhbnlcbiAgICogb3RoZXIgcmVxdWlyZWQgZWZmZWN0cyAob3BhY2l0eSwgY2xpcHBpbmcsIGV0Yy4pIGhhdmUgYWxyZWFkeSBiZWVuIHByZXBhcmVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHBhcnQgb2YgdGhlIENhbnZhc1NlbGZEcmF3YWJsZSBBUEkgcmVxdWlyZWQgdG8gYmUgaW1wbGVtZW50ZWQgZm9yIHN1YnR5cGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0NhbnZhc0NvbnRleHRXcmFwcGVyfSB3cmFwcGVyIC0gQ29udGFpbnMgdGhlIENhbnZhcyBhbmQgaXRzIGRyYXdpbmcgY29udGV4dFxuICAgKiBAcGFyYW0ge3NjZW5lcnkuTm9kZX0gbm9kZSAtIE91ciBub2RlIHRoYXQgaXMgYmVpbmcgZHJhd25cbiAgICogQHBhcmFtIHtNYXRyaXgzfSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFwcGxpZWQgZm9yIHRoaXMgbm9kZSdzIGNvb3JkaW5hdGUgc3lzdGVtLlxuICAgKi9cbiAgcGFpbnRDYW52YXMoIHdyYXBwZXIsIG5vZGUsIG1hdHJpeCApIHtcbiAgICBjb25zdCBoYXNJbWFnZU9wYWNpdHkgPSBub2RlLl9pbWFnZU9wYWNpdHkgIT09IDE7XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgaW1hZ2UgaGFzIGJlZW4gbG9hZGVkIGJ5IGNoZWNraW5nIHdoZXRoZXIgaXQgaGFzIGEgd2lkdGggb3IgaGVpZ2h0IG9mIDAuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MzZcbiAgICBpZiAoIG5vZGUuX2ltYWdlICYmIG5vZGUuX2ltYWdlLndpZHRoICE9PSAwICYmIG5vZGUuX2ltYWdlLmhlaWdodCAhPT0gMCApIHtcbiAgICAgIC8vIElmIHdlIGhhdmUgaW1hZ2Ugb3BhY2l0eSwgd2UgbmVlZCB0byBhcHBseSB0aGUgb3BhY2l0eSBvbiB0b3Agb2Ygd2hhdGV2ZXIgZ2xvYmFsQWxwaGEgbWF5IGV4aXN0XG4gICAgICBpZiAoIGhhc0ltYWdlT3BhY2l0eSApIHtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0Lmdsb2JhbEFscGhhICo9IG5vZGUuX2ltYWdlT3BhY2l0eTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBub2RlLl9taXBtYXAgJiYgbm9kZS5oYXNNaXBtYXBzKCkgKSB7XG4gICAgICAgIGNvbnN0IGxldmVsID0gbm9kZS5nZXRNaXBtYXBMZXZlbCggbWF0cml4LCBJbWFnZWFibGUuQ0FOVkFTX01JUE1BUF9CSUFTX0FESlVTVE1FTlQgKTtcbiAgICAgICAgY29uc3QgY2FudmFzID0gbm9kZS5nZXRNaXBtYXBDYW52YXMoIGxldmVsICk7XG4gICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSBNYXRoLnBvdyggMiwgbGV2ZWwgKTtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LmRyYXdJbWFnZSggY2FudmFzLCAwLCAwLCBjYW52YXMud2lkdGggKiBtdWx0aXBsaWVyLCBjYW52YXMuaGVpZ2h0ICogbXVsdGlwbGllciApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHdyYXBwZXIuY29udGV4dC5kcmF3SW1hZ2UoIG5vZGUuX2ltYWdlLCAwLCAwICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggaGFzSW1hZ2VPcGFjaXR5ICkge1xuICAgICAgICB3cmFwcGVyLmNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlJbWFnZSgpIHtcbiAgICB0aGlzLm1hcmtQYWludERpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5TWlwbWFwKCkge1xuICAgIHRoaXMubWFya1BhaW50RGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrRGlydHlJbWFnZU9wYWNpdHkoKSB7XG4gICAgdGhpcy5tYXJrUGFpbnREaXJ0eSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbWFnZUNhbnZhc0RyYXdhYmxlJywgSW1hZ2VDYW52YXNEcmF3YWJsZSApO1xuXG5Qb29sYWJsZS5taXhJbnRvKCBJbWFnZUNhbnZhc0RyYXdhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IEltYWdlQ2FudmFzRHJhd2FibGU7Il0sIm5hbWVzIjpbIlBvb2xhYmxlIiwiQ2FudmFzU2VsZkRyYXdhYmxlIiwiSW1hZ2VhYmxlIiwic2NlbmVyeSIsIkltYWdlQ2FudmFzRHJhd2FibGUiLCJwYWludENhbnZhcyIsIndyYXBwZXIiLCJub2RlIiwibWF0cml4IiwiaGFzSW1hZ2VPcGFjaXR5IiwiX2ltYWdlT3BhY2l0eSIsIl9pbWFnZSIsIndpZHRoIiwiaGVpZ2h0IiwiY29udGV4dCIsInNhdmUiLCJnbG9iYWxBbHBoYSIsIl9taXBtYXAiLCJoYXNNaXBtYXBzIiwibGV2ZWwiLCJnZXRNaXBtYXBMZXZlbCIsIkNBTlZBU19NSVBNQVBfQklBU19BREpVU1RNRU5UIiwiY2FudmFzIiwiZ2V0TWlwbWFwQ2FudmFzIiwibXVsdGlwbGllciIsIk1hdGgiLCJwb3ciLCJkcmF3SW1hZ2UiLCJyZXN0b3JlIiwibWFya0RpcnR5SW1hZ2UiLCJtYXJrUGFpbnREaXJ0eSIsIm1hcmtEaXJ0eU1pcG1hcCIsIm1hcmtEaXJ0eUltYWdlT3BhY2l0eSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxrQkFBa0IsRUFBRUMsU0FBUyxFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRTFFLElBQUEsQUFBTUMsc0JBQU4sTUFBTUEsNEJBQTRCSDtJQUNoQzs7Ozs7Ozs7Ozs7O0dBWUMsR0FDREksWUFBYUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLE1BQU0sRUFBRztRQUNuQyxNQUFNQyxrQkFBa0JGLEtBQUtHLGFBQWEsS0FBSztRQUUvQywyRkFBMkY7UUFDM0YscURBQXFEO1FBQ3JELElBQUtILEtBQUtJLE1BQU0sSUFBSUosS0FBS0ksTUFBTSxDQUFDQyxLQUFLLEtBQUssS0FBS0wsS0FBS0ksTUFBTSxDQUFDRSxNQUFNLEtBQUssR0FBSTtZQUN4RSxrR0FBa0c7WUFDbEcsSUFBS0osaUJBQWtCO2dCQUNyQkgsUUFBUVEsT0FBTyxDQUFDQyxJQUFJO2dCQUNwQlQsUUFBUVEsT0FBTyxDQUFDRSxXQUFXLElBQUlULEtBQUtHLGFBQWE7WUFDbkQ7WUFFQSxJQUFLSCxLQUFLVSxPQUFPLElBQUlWLEtBQUtXLFVBQVUsSUFBSztnQkFDdkMsTUFBTUMsUUFBUVosS0FBS2EsY0FBYyxDQUFFWixRQUFRTixVQUFVbUIsNkJBQTZCO2dCQUNsRixNQUFNQyxTQUFTZixLQUFLZ0IsZUFBZSxDQUFFSjtnQkFDckMsTUFBTUssYUFBYUMsS0FBS0MsR0FBRyxDQUFFLEdBQUdQO2dCQUNoQ2IsUUFBUVEsT0FBTyxDQUFDYSxTQUFTLENBQUVMLFFBQVEsR0FBRyxHQUFHQSxPQUFPVixLQUFLLEdBQUdZLFlBQVlGLE9BQU9ULE1BQU0sR0FBR1c7WUFDdEYsT0FDSztnQkFDSGxCLFFBQVFRLE9BQU8sQ0FBQ2EsU0FBUyxDQUFFcEIsS0FBS0ksTUFBTSxFQUFFLEdBQUc7WUFDN0M7WUFFQSxJQUFLRixpQkFBa0I7Z0JBQ3JCSCxRQUFRUSxPQUFPLENBQUNjLE9BQU87WUFDekI7UUFDRjtJQUNGO0lBRUE7O0dBRUMsR0FDREMsaUJBQWlCO1FBQ2YsSUFBSSxDQUFDQyxjQUFjO0lBQ3JCO0lBRUE7O0dBRUMsR0FDREMsa0JBQWtCO1FBQ2hCLElBQUksQ0FBQ0QsY0FBYztJQUNyQjtJQUVBOztHQUVDLEdBQ0RFLHdCQUF3QjtRQUN0QixJQUFJLENBQUNGLGNBQWM7SUFDckI7QUFDRjtBQUVBM0IsUUFBUThCLFFBQVEsQ0FBRSx1QkFBdUI3QjtBQUV6Q0osU0FBU2tDLE9BQU8sQ0FBRTlCO0FBRWxCLGVBQWVBLG9CQUFvQiJ9