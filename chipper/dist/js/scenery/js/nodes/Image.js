// Copyright 2013-2024, University of Colorado Boulder
/**
 * A node that displays a single image either from an actual HTMLImageElement, a URL, a Canvas element, or a mipmap
 * data structure described in the constructor.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import { Imageable, ImageCanvasDrawable, ImageDOMDrawable, ImageSVGDrawable, ImageWebGLDrawable, Node, Renderer, scenery, SpriteSheet } from '../imports.js';
// Image-specific options that can be passed in the constructor or mutate() call.
const IMAGE_OPTION_KEYS = [
    'image',
    'imageProperty',
    'imageOpacity',
    'imageBounds',
    'initialWidth',
    'initialHeight',
    'mipmap',
    'mipmapBias',
    'mipmapInitialLevel',
    'mipmapMaxLevel',
    'hitTestPixels' // {boolean} - Whether non-transparent pixels will control contained points, see setHitTestPixels() for documentation
];
let Image = class Image extends Imageable(Node) {
    /**
   * Triggers recomputation of the image's bounds and refreshes any displays output of the image.
   *
   * Generally this can trigger recomputation of mipmaps, will mark any drawables as needing repaints, and will
   * cause a spritesheet change for WebGL.
   *
   * This should be done when the underlying image has changed appearance (usually the case with a Canvas changing,
   * but this is also triggered by our actual image reference changing).
   */ invalidateImage() {
        if (this._image) {
            this.invalidateSelf(this._imageBounds || new Bounds2(0, 0, this.getImageWidth(), this.getImageHeight()));
        } else {
            this.invalidateSelf(Bounds2.NOTHING);
        }
        const stateLen = this._drawables.length;
        for(let i = 0; i < stateLen; i++){
            this._drawables[i].markDirtyImage();
        }
        super.invalidateImage();
        this.invalidateSupportedRenderers();
    }
    /**
   * Recomputes what renderers are supported, given the current image information.
   */ invalidateSupportedRenderers() {
        // Canvas is always permitted
        let r = Renderer.bitmaskCanvas;
        // If it fits within the sprite sheet, then WebGL is also permitted
        // If the image hasn't loaded, the getImageWidth/Height will be 0 and this rule would pass.  However, this
        // function will be called again after the image loads, and would correctly invalidate WebGL, if too large to fit
        // in a SpriteSheet
        const fitsWithinSpriteSheet = this.getImageWidth() <= SpriteSheet.MAX_DIMENSION.width && this.getImageHeight() <= SpriteSheet.MAX_DIMENSION.height;
        if (fitsWithinSpriteSheet) {
            r |= Renderer.bitmaskWebGL;
        }
        // If it is not a canvas, then it can additionally be rendered in SVG or DOM
        if (!(this._image instanceof HTMLCanvasElement)) {
            // assumes HTMLImageElement
            r |= Renderer.bitmaskSVG | Renderer.bitmaskDOM;
        }
        this.setRendererBitmask(r);
    }
    /**
   * Sets an opacity that is applied only to this image (will not affect children or the rest of the node's subtree).
   *
   * This should generally be preferred over Node's opacity if it has the same result, as modifying this will be much
   * faster, and will not force additional Canvases or intermediate steps in display.
   *
   * @param imageOpacity - Should be a number between 0 (transparent) and 1 (opaque), just like normal opacity.
   */ setImageOpacity(imageOpacity) {
        const changed = this._imageOpacity !== imageOpacity;
        super.setImageOpacity(imageOpacity);
        if (changed) {
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyImageOpacity();
            }
        }
    }
    /**
   * Sets the imageBounds value for the Image. If non-null, determines what is considered "inside" the image for
   * containment and hit-testing.
   *
   * NOTE: This is accomplished by using any provided imageBounds as the node's own selfBounds. This will affect layout,
   * hit-testing, and anything else using the bounds of this node.
   */ setImageBounds(imageBounds) {
        if (this._imageBounds !== imageBounds) {
            this._imageBounds = imageBounds;
            this.invalidateImage();
        }
    }
    set imageBounds(value) {
        this.setImageBounds(value);
    }
    get imageBounds() {
        return this._imageBounds;
    }
    /**
   * Returns the imageBounds, see setImageBounds for details.
   */ getImageBounds() {
        return this._imageBounds;
    }
    /**
   * Whether this Node itself is painted (displays something itself).
   */ isPainted() {
        // Always true for Image nodes
        return true;
    }
    /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
        //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily. https://github.com/phetsims/scenery/issues/1581
        ImageCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
    }
    /**
   * Creates a DOM drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        // @ts-expect-error - Poolable
        return ImageDOMDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a SVG drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        // @ts-expect-error - Poolable
        return ImageSVGDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a Canvas drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        // @ts-expect-error - Poolable
        return ImageCanvasDrawable.createFromPool(renderer, instance);
    }
    /**
   * Creates a WebGL drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createWebGLDrawable(renderer, instance) {
        // @ts-expect-error - Poolable
        return ImageWebGLDrawable.createFromPool(renderer, instance);
    }
    /**
   * Override this for computation of whether a point is inside our self content (defaults to selfBounds check).
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        const inBounds = Node.prototype.containsPointSelf.call(this, point);
        if (!inBounds || !this._hitTestPixels || !this._hitTestImageData) {
            return inBounds;
        }
        return Imageable.testHitTestData(this._hitTestImageData, this.imageWidth, this.imageHeight, point);
    }
    /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */ getSelfShape() {
        if (this._hitTestPixels && this._hitTestImageData) {
            // If we're hit-testing pixels, return that shape included.
            return Imageable.hitTestDataToShape(this._hitTestImageData, this.imageWidth, this.imageHeight);
        } else {
            // Otherwise the super call will just include the rectangle (bounds).
            return Node.prototype.getSelfShape.call(this);
        }
    }
    /**
   * Triggers recomputation of mipmaps (as long as mipmapping is enabled)
   */ invalidateMipmaps() {
        const markDirty = this._image && this._mipmap && !this._mipmapData;
        super.invalidateMipmaps();
        if (markDirty) {
            const stateLen = this._drawables.length;
            for(let i = 0; i < stateLen; i++){
                this._drawables[i].markDirtyMipmap();
            }
        }
    }
    mutate(options) {
        return super.mutate(options);
    }
    constructor(image, providedOptions){
        const initImageOptions = {};
        if (isTReadOnlyProperty(image)) {
            initImageOptions.imageProperty = image;
        } else {
            initImageOptions.image = image;
        }
        // rely on the setImage call from the super constructor to do the setup
        const options = optionize()(initImageOptions, providedOptions);
        super();
        this._imageBounds = null;
        this.mutate(options);
        this.invalidateSupportedRenderers();
    }
};
// Initial values for most Node mutator options
Image.DEFAULT_IMAGE_OPTIONS = combineOptions({}, Node.DEFAULT_NODE_OPTIONS, Imageable.DEFAULT_OPTIONS);
export { Image as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ Image.prototype._mutatorKeys = [
    ...IMAGE_OPTION_KEYS,
    ...Node.prototype._mutatorKeys
];
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */ Image.prototype.drawableMarkFlags = [
    ...Node.prototype.drawableMarkFlags,
    'image',
    'imageOpacity',
    'mipmap'
];
// NOTE: Not currently in use
Image.ImageIO = new IOType('ImageIO', {
    valueType: Image,
    supertype: Node.NodeIO,
    events: [
        'changed'
    ],
    methods: {
        setImage: {
            returnType: VoidIO,
            parameterTypes: [
                StringIO
            ],
            implementation: function(base64Text) {
                const im = new window.Image();
                im.src = base64Text;
                // @ts-expect-error TODO: how would this even work? https://github.com/phetsims/scenery/issues/1581
                this.image = im;
            },
            documentation: 'Set the image from a base64 string',
            invocableForReadOnlyElements: false
        }
    }
});
scenery.register('Image', Image);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvSW1hZ2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBub2RlIHRoYXQgZGlzcGxheXMgYSBzaW5nbGUgaW1hZ2UgZWl0aGVyIGZyb20gYW4gYWN0dWFsIEhUTUxJbWFnZUVsZW1lbnQsIGEgVVJMLCBhIENhbnZhcyBlbGVtZW50LCBvciBhIG1pcG1hcFxuICogZGF0YSBzdHJ1Y3R1cmUgZGVzY3JpYmVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCBWb2lkSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1ZvaWRJTy5qcyc7XG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBET01TZWxmRHJhd2FibGUsIEltYWdlYWJsZSwgSW1hZ2VhYmxlSW1hZ2UsIEltYWdlYWJsZU9wdGlvbnMsIEltYWdlQ2FudmFzRHJhd2FibGUsIEltYWdlRE9NRHJhd2FibGUsIEltYWdlU1ZHRHJhd2FibGUsIEltYWdlV2ViR0xEcmF3YWJsZSwgSW5zdGFuY2UsIE5vZGUsIE5vZGVPcHRpb25zLCBSZW5kZXJlciwgc2NlbmVyeSwgU3ByaXRlU2hlZXQsIFNWR1NlbGZEcmF3YWJsZSwgVEltYWdlRHJhd2FibGUsIFdlYkdMU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cblxuLy8gSW1hZ2Utc3BlY2lmaWMgb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yIG9yIG11dGF0ZSgpIGNhbGwuXG5jb25zdCBJTUFHRV9PUFRJT05fS0VZUyA9IFtcbiAgJ2ltYWdlJywgLy8ge3N0cmluZ3xIVE1MSW1hZ2VFbGVtZW50fEhUTUxDYW52YXNFbGVtZW50fEFycmF5fSAtIENoYW5nZXMgdGhlIGltYWdlIGRpc3BsYXllZCwgc2VlIHNldEltYWdlKCkgZm9yIGRvY3VtZW50YXRpb25cbiAgJ2ltYWdlUHJvcGVydHknLCAvLyB7VFJlYWRPbmx5UHJvcGVydHkuPHN0cmluZ3xIVE1MSW1hZ2VFbGVtZW50fEhUTUxDYW52YXNFbGVtZW50fEFycmF5PnxudWxsfSAtIENoYW5nZXMgdGhlIGltYWdlIGRpc3BsYXllZCwgc2VlIHNldEltYWdlUHJvcGVydHkoKSBmb3IgZG9jdW1lbnRhdGlvblxuICAnaW1hZ2VPcGFjaXR5JywgLy8ge251bWJlcn0gLSBDb250cm9scyBvcGFjaXR5IG9mIHRoaXMgaW1hZ2UgKGFuZCBub3QgY2hpbGRyZW4pLCBzZWUgc2V0SW1hZ2VPcGFjaXR5KCkgZm9yIGRvY3VtZW50YXRpb25cbiAgJ2ltYWdlQm91bmRzJywgLy8ge0JvdW5kczJ8bnVsbH0gLSBDb250cm9scyB0aGUgYW1vdW50IG9mIHRoZSBpbWFnZSB0aGF0IGlzIGhpdC10ZXN0ZWQgb3IgY29uc2lkZXJlZCBcImluc2lkZVwiIHRoZSBpbWFnZSwgc2VlIHNldEltYWdlQm91bmRzKClcbiAgJ2luaXRpYWxXaWR0aCcsIC8vIHtudW1iZXJ9IC0gV2lkdGggb2YgYW4gaW1hZ2Ugbm90LXlldCBsb2FkZWQgKGZvciBsYXlvdXQpLCBzZWUgc2V0SW5pdGlhbFdpZHRoKCkgZm9yIGRvY3VtZW50YXRpb25cbiAgJ2luaXRpYWxIZWlnaHQnLCAvLyB7bnVtYmVyfSAtIEhlaWdodCBvZiBhbiBpbWFnZSBub3QteWV0IGxvYWRlZCAoZm9yIGxheW91dCksIHNlZSBzZXRJbml0aWFsSGVpZ2h0KCkgZm9yIGRvY3VtZW50YXRpb25cbiAgJ21pcG1hcCcsIC8vIHtib29sZWFufSAtIFdoZXRoZXIgbWlwbWFwcGVkIG91dHB1dCBpcyBzdXBwb3J0ZWQsIHNlZSBzZXRNaXBtYXAoKSBmb3IgZG9jdW1lbnRhdGlvblxuICAnbWlwbWFwQmlhcycsIC8vIHtudW1iZXJ9IC0gV2hldGhlciBtaXBtYXBwaW5nIHRlbmRzIHRvd2FyZHMgc2hhcnAvYWxpYXNlZCBvciBibHVycnksIHNlZSBzZXRNaXBtYXBCaWFzKCkgZm9yIGRvY3VtZW50YXRpb25cbiAgJ21pcG1hcEluaXRpYWxMZXZlbCcsIC8vIHtudW1iZXJ9IC0gSG93IG1hbnkgbWlwbWFwIGxldmVscyB0byBnZW5lcmF0ZSBpZiBuZWVkZWQsIHNlZSBzZXRNaXBtYXBJbml0aWFsTGV2ZWwoKSBmb3IgZG9jdW1lbnRhdGlvblxuICAnbWlwbWFwTWF4TGV2ZWwnLCAvLyB7bnVtYmVyfSBUaGUgbWF4aW11bSBtaXBtYXAgbGV2ZWwgdG8gY29tcHV0ZSBpZiBuZWVkZWQsIHNlZSBzZXRNaXBtYXBNYXhMZXZlbCgpIGZvciBkb2N1bWVudGF0aW9uXG4gICdoaXRUZXN0UGl4ZWxzJyAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIG5vbi10cmFuc3BhcmVudCBwaXhlbHMgd2lsbCBjb250cm9sIGNvbnRhaW5lZCBwb2ludHMsIHNlZSBzZXRIaXRUZXN0UGl4ZWxzKCkgZm9yIGRvY3VtZW50YXRpb25cbl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGltYWdlQm91bmRzPzogQm91bmRzMiB8IG51bGw7XG59O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIEltYWdlYWJsZU9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIEltYWdlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW1hZ2UgZXh0ZW5kcyBJbWFnZWFibGUoIE5vZGUgKSB7XG5cbiAgLy8gSWYgbm9uLW51bGwsIGRldGVybWluZXMgd2hhdCBpcyBjb25zaWRlcmVkIFwiaW5zaWRlXCIgdGhlIGltYWdlIGZvciBjb250YWlubWVudCBhbmQgaGl0LXRlc3RpbmcuXG4gIHByaXZhdGUgX2ltYWdlQm91bmRzOiBCb3VuZHMyIHwgbnVsbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGltYWdlOiBJbWFnZWFibGVJbWFnZSB8IFRSZWFkT25seVByb3BlcnR5PEltYWdlYWJsZUltYWdlPiwgcHJvdmlkZWRPcHRpb25zPzogSW1hZ2VPcHRpb25zICkge1xuXG4gICAgY29uc3QgaW5pdEltYWdlT3B0aW9uczogSW1hZ2VPcHRpb25zID0ge307XG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBpbWFnZSApICkge1xuICAgICAgaW5pdEltYWdlT3B0aW9ucy5pbWFnZVByb3BlcnR5ID0gaW1hZ2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaW5pdEltYWdlT3B0aW9ucy5pbWFnZSA9IGltYWdlO1xuICAgIH1cblxuICAgIC8vIHJlbHkgb24gdGhlIHNldEltYWdlIGNhbGwgZnJvbSB0aGUgc3VwZXIgY29uc3RydWN0b3IgdG8gZG8gdGhlIHNldHVwXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJbWFnZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIGluaXRJbWFnZU9wdGlvbnMsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX2ltYWdlQm91bmRzID0gbnVsbDtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIHRoZSBpbWFnZSdzIGJvdW5kcyBhbmQgcmVmcmVzaGVzIGFueSBkaXNwbGF5cyBvdXRwdXQgb2YgdGhlIGltYWdlLlxuICAgKlxuICAgKiBHZW5lcmFsbHkgdGhpcyBjYW4gdHJpZ2dlciByZWNvbXB1dGF0aW9uIG9mIG1pcG1hcHMsIHdpbGwgbWFyayBhbnkgZHJhd2FibGVzIGFzIG5lZWRpbmcgcmVwYWludHMsIGFuZCB3aWxsXG4gICAqIGNhdXNlIGEgc3ByaXRlc2hlZXQgY2hhbmdlIGZvciBXZWJHTC5cbiAgICpcbiAgICogVGhpcyBzaG91bGQgYmUgZG9uZSB3aGVuIHRoZSB1bmRlcmx5aW5nIGltYWdlIGhhcyBjaGFuZ2VkIGFwcGVhcmFuY2UgKHVzdWFsbHkgdGhlIGNhc2Ugd2l0aCBhIENhbnZhcyBjaGFuZ2luZyxcbiAgICogYnV0IHRoaXMgaXMgYWxzbyB0cmlnZ2VyZWQgYnkgb3VyIGFjdHVhbCBpbWFnZSByZWZlcmVuY2UgY2hhbmdpbmcpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVJbWFnZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2ltYWdlICkge1xuICAgICAgdGhpcy5pbnZhbGlkYXRlU2VsZiggdGhpcy5faW1hZ2VCb3VuZHMgfHwgbmV3IEJvdW5kczIoIDAsIDAsIHRoaXMuZ2V0SW1hZ2VXaWR0aCgpLCB0aGlzLmdldEltYWdlSGVpZ2h0KCkgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVNlbGYoIEJvdW5kczIuTk9USElORyApO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXRlTGVuID0gdGhpcy5fZHJhd2FibGVzLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgKCB0aGlzLl9kcmF3YWJsZXNbIGkgXSBhcyB1bmtub3duIGFzIFRJbWFnZURyYXdhYmxlICkubWFya0RpcnR5SW1hZ2UoKTtcbiAgICB9XG5cbiAgICBzdXBlci5pbnZhbGlkYXRlSW1hZ2UoKTtcblxuICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tcHV0ZXMgd2hhdCByZW5kZXJlcnMgYXJlIHN1cHBvcnRlZCwgZ2l2ZW4gdGhlIGN1cnJlbnQgaW1hZ2UgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpOiB2b2lkIHtcblxuICAgIC8vIENhbnZhcyBpcyBhbHdheXMgcGVybWl0dGVkXG4gICAgbGV0IHIgPSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xuXG4gICAgLy8gSWYgaXQgZml0cyB3aXRoaW4gdGhlIHNwcml0ZSBzaGVldCwgdGhlbiBXZWJHTCBpcyBhbHNvIHBlcm1pdHRlZFxuICAgIC8vIElmIHRoZSBpbWFnZSBoYXNuJ3QgbG9hZGVkLCB0aGUgZ2V0SW1hZ2VXaWR0aC9IZWlnaHQgd2lsbCBiZSAwIGFuZCB0aGlzIHJ1bGUgd291bGQgcGFzcy4gIEhvd2V2ZXIsIHRoaXNcbiAgICAvLyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZ2FpbiBhZnRlciB0aGUgaW1hZ2UgbG9hZHMsIGFuZCB3b3VsZCBjb3JyZWN0bHkgaW52YWxpZGF0ZSBXZWJHTCwgaWYgdG9vIGxhcmdlIHRvIGZpdFxuICAgIC8vIGluIGEgU3ByaXRlU2hlZXRcbiAgICBjb25zdCBmaXRzV2l0aGluU3ByaXRlU2hlZXQgPSB0aGlzLmdldEltYWdlV2lkdGgoKSA8PSBTcHJpdGVTaGVldC5NQVhfRElNRU5TSU9OLndpZHRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRJbWFnZUhlaWdodCgpIDw9IFNwcml0ZVNoZWV0Lk1BWF9ESU1FTlNJT04uaGVpZ2h0O1xuICAgIGlmICggZml0c1dpdGhpblNwcml0ZVNoZWV0ICkge1xuICAgICAgciB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XG4gICAgfVxuXG4gICAgLy8gSWYgaXQgaXMgbm90IGEgY2FudmFzLCB0aGVuIGl0IGNhbiBhZGRpdGlvbmFsbHkgYmUgcmVuZGVyZWQgaW4gU1ZHIG9yIERPTVxuICAgIGlmICggISggdGhpcy5faW1hZ2UgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCApICkge1xuICAgICAgLy8gYXNzdW1lcyBIVE1MSW1hZ2VFbGVtZW50XG4gICAgICByIHw9IFJlbmRlcmVyLmJpdG1hc2tTVkcgfCBSZW5kZXJlci5iaXRtYXNrRE9NO1xuICAgIH1cblxuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCByICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBvcGFjaXR5IHRoYXQgaXMgYXBwbGllZCBvbmx5IHRvIHRoaXMgaW1hZ2UgKHdpbGwgbm90IGFmZmVjdCBjaGlsZHJlbiBvciB0aGUgcmVzdCBvZiB0aGUgbm9kZSdzIHN1YnRyZWUpLlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBnZW5lcmFsbHkgYmUgcHJlZmVycmVkIG92ZXIgTm9kZSdzIG9wYWNpdHkgaWYgaXQgaGFzIHRoZSBzYW1lIHJlc3VsdCwgYXMgbW9kaWZ5aW5nIHRoaXMgd2lsbCBiZSBtdWNoXG4gICAqIGZhc3RlciwgYW5kIHdpbGwgbm90IGZvcmNlIGFkZGl0aW9uYWwgQ2FudmFzZXMgb3IgaW50ZXJtZWRpYXRlIHN0ZXBzIGluIGRpc3BsYXkuXG4gICAqXG4gICAqIEBwYXJhbSBpbWFnZU9wYWNpdHkgLSBTaG91bGQgYmUgYSBudW1iZXIgYmV0d2VlbiAwICh0cmFuc3BhcmVudCkgYW5kIDEgKG9wYXF1ZSksIGp1c3QgbGlrZSBub3JtYWwgb3BhY2l0eS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRJbWFnZU9wYWNpdHkoIGltYWdlT3BhY2l0eTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl9pbWFnZU9wYWNpdHkgIT09IGltYWdlT3BhY2l0eTtcblxuICAgIHN1cGVyLnNldEltYWdlT3BhY2l0eSggaW1hZ2VPcGFjaXR5ICk7XG5cbiAgICBpZiAoIGNoYW5nZWQgKSB7XG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVEltYWdlRHJhd2FibGUgKS5tYXJrRGlydHlJbWFnZU9wYWNpdHkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW1hZ2VCb3VuZHMgdmFsdWUgZm9yIHRoZSBJbWFnZS4gSWYgbm9uLW51bGwsIGRldGVybWluZXMgd2hhdCBpcyBjb25zaWRlcmVkIFwiaW5zaWRlXCIgdGhlIGltYWdlIGZvclxuICAgKiBjb250YWlubWVudCBhbmQgaGl0LXRlc3RpbmcuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgaXMgYWNjb21wbGlzaGVkIGJ5IHVzaW5nIGFueSBwcm92aWRlZCBpbWFnZUJvdW5kcyBhcyB0aGUgbm9kZSdzIG93biBzZWxmQm91bmRzLiBUaGlzIHdpbGwgYWZmZWN0IGxheW91dCxcbiAgICogaGl0LXRlc3RpbmcsIGFuZCBhbnl0aGluZyBlbHNlIHVzaW5nIHRoZSBib3VuZHMgb2YgdGhpcyBub2RlLlxuICAgKi9cbiAgcHVibGljIHNldEltYWdlQm91bmRzKCBpbWFnZUJvdW5kczogQm91bmRzMiB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9pbWFnZUJvdW5kcyAhPT0gaW1hZ2VCb3VuZHMgKSB7XG4gICAgICB0aGlzLl9pbWFnZUJvdW5kcyA9IGltYWdlQm91bmRzO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVJbWFnZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgaW1hZ2VCb3VuZHMoIHZhbHVlOiBCb3VuZHMyIHwgbnVsbCApIHsgdGhpcy5zZXRJbWFnZUJvdW5kcyggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgaW1hZ2VCb3VuZHMoKTogQm91bmRzMiB8IG51bGwgeyByZXR1cm4gdGhpcy5faW1hZ2VCb3VuZHM7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW1hZ2VCb3VuZHMsIHNlZSBzZXRJbWFnZUJvdW5kcyBmb3IgZGV0YWlscy5cbiAgICovXG4gIHB1YmxpYyBnZXRJbWFnZUJvdW5kcygpOiBCb3VuZHMyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2ltYWdlQm91bmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlIGl0c2VsZiBpcyBwYWludGVkIChkaXNwbGF5cyBzb21ldGhpbmcgaXRzZWxmKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpc1BhaW50ZWQoKTogYm9vbGVhbiB7XG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIEltYWdlIG5vZGVzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIGN1cnJlbnQgTm9kZSdzIHNlbGYgcmVwcmVzZW50YXRpb24sIGFzc3VtaW5nIHRoZSB3cmFwcGVyJ3MgQ2FudmFzIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgbG9jYWxcbiAgICogY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGlzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB3cmFwcGVyXG4gICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFscmVhZHkgYXBwbGllZCB0byB0aGUgY29udGV4dC5cbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjYW52YXNQYWludFNlbGYoIHdyYXBwZXI6IENhbnZhc0NvbnRleHRXcmFwcGVyLCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgLy9UT0RPOiBIYXZlIGEgc2VwYXJhdGUgbWV0aG9kIGZvciB0aGlzLCBpbnN0ZWFkIG9mIHRvdWNoaW5nIHRoZSBwcm90b3R5cGUuIENhbiBtYWtlICd0aGlzJyByZWZlcmVuY2VzIHRvbyBlYXNpbHkuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgSW1hZ2VDYW52YXNEcmF3YWJsZS5wcm90b3R5cGUucGFpbnRDYW52YXMoIHdyYXBwZXIsIHRoaXMsIG1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBET00gZHJhd2FibGUgZm9yIHRoaXMgSW1hZ2UuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlRE9NRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBET01TZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBQb29sYWJsZVxuICAgIHJldHVybiBJbWFnZURPTURyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgU1ZHIGRyYXdhYmxlIGZvciB0aGlzIEltYWdlLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gUG9vbGFibGVcbiAgICByZXR1cm4gSW1hZ2VTVkdEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBJbWFnZS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVDYW52YXNEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IENhbnZhc1NlbGZEcmF3YWJsZSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBvb2xhYmxlXG4gICAgcmV0dXJuIEltYWdlQ2FudmFzRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBXZWJHTCBkcmF3YWJsZSBmb3IgdGhpcyBJbWFnZS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVXZWJHTERyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogV2ViR0xTZWxmRHJhd2FibGUge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBQb29sYWJsZVxuICAgIHJldHVybiBJbWFnZVdlYkdMRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIHRoaXMgZm9yIGNvbXB1dGF0aW9uIG9mIHdoZXRoZXIgYSBwb2ludCBpcyBpbnNpZGUgb3VyIHNlbGYgY29udGVudCAoZGVmYXVsdHMgdG8gc2VsZkJvdW5kcyBjaGVjaykuXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludCAtIENvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBjb250YWluc1BvaW50U2VsZiggcG9pbnQ6IFZlY3RvcjIgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaW5Cb3VuZHMgPSBOb2RlLnByb3RvdHlwZS5jb250YWluc1BvaW50U2VsZi5jYWxsKCB0aGlzLCBwb2ludCApO1xuXG4gICAgaWYgKCAhaW5Cb3VuZHMgfHwgIXRoaXMuX2hpdFRlc3RQaXhlbHMgfHwgIXRoaXMuX2hpdFRlc3RJbWFnZURhdGEgKSB7XG4gICAgICByZXR1cm4gaW5Cb3VuZHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIEltYWdlYWJsZS50ZXN0SGl0VGVzdERhdGEoIHRoaXMuX2hpdFRlc3RJbWFnZURhdGEsIHRoaXMuaW1hZ2VXaWR0aCwgdGhpcy5pbWFnZUhlaWdodCwgcG9pbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgU2hhcGUgdGhhdCByZXByZXNlbnRzIHRoZSBhcmVhIGNvdmVyZWQgYnkgY29udGFpbnNQb2ludFNlbGYuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0U2VsZlNoYXBlKCk6IFNoYXBlIHtcbiAgICBpZiAoIHRoaXMuX2hpdFRlc3RQaXhlbHMgJiYgdGhpcy5faGl0VGVzdEltYWdlRGF0YSApIHtcbiAgICAgIC8vIElmIHdlJ3JlIGhpdC10ZXN0aW5nIHBpeGVscywgcmV0dXJuIHRoYXQgc2hhcGUgaW5jbHVkZWQuXG4gICAgICByZXR1cm4gSW1hZ2VhYmxlLmhpdFRlc3REYXRhVG9TaGFwZSggdGhpcy5faGl0VGVzdEltYWdlRGF0YSwgdGhpcy5pbWFnZVdpZHRoLCB0aGlzLmltYWdlSGVpZ2h0ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gT3RoZXJ3aXNlIHRoZSBzdXBlciBjYWxsIHdpbGwganVzdCBpbmNsdWRlIHRoZSByZWN0YW5nbGUgKGJvdW5kcykuXG4gICAgICByZXR1cm4gTm9kZS5wcm90b3R5cGUuZ2V0U2VsZlNoYXBlLmNhbGwoIHRoaXMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgcmVjb21wdXRhdGlvbiBvZiBtaXBtYXBzIChhcyBsb25nIGFzIG1pcG1hcHBpbmcgaXMgZW5hYmxlZClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnZhbGlkYXRlTWlwbWFwcygpOiB2b2lkIHtcbiAgICBjb25zdCBtYXJrRGlydHkgPSB0aGlzLl9pbWFnZSAmJiB0aGlzLl9taXBtYXAgJiYgIXRoaXMuX21pcG1hcERhdGE7XG5cbiAgICBzdXBlci5pbnZhbGlkYXRlTWlwbWFwcygpO1xuXG4gICAgaWYgKCBtYXJrRGlydHkgKSB7XG4gICAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xuICAgICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVEltYWdlRHJhd2FibGUgKS5tYXJrRGlydHlNaXBtYXAoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogSW1hZ2VPcHRpb25zICk6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgSW1hZ2VJTzogSU9UeXBlO1xuXG4gIC8vIEluaXRpYWwgdmFsdWVzIGZvciBtb3N0IE5vZGUgbXV0YXRvciBvcHRpb25zXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9JTUFHRV9PUFRJT05TID0gY29tYmluZU9wdGlvbnM8SW1hZ2VPcHRpb25zPigge30sIE5vZGUuREVGQVVMVF9OT0RFX09QVElPTlMsIEltYWdlYWJsZS5ERUZBVUxUX09QVElPTlMgKTtcbn1cblxuLyoqXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxuICpcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXG4gKi9cbkltYWdlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBbIC4uLklNQUdFX09QVElPTl9LRVlTLCAuLi5Ob2RlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgXTtcblxuLyoqXG4gKiB7QXJyYXkuPFN0cmluZz59IC0gTGlzdCBvZiBhbGwgZGlydHkgZmxhZ3MgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlIG9uIGRyYXdhYmxlcyBjcmVhdGVkIGZyb20gdGhpcyBub2RlIChvclxuICogICAgICAgICAgICAgICAgICAgIHN1YnR5cGUpLiBHaXZlbiBhIGZsYWcgKGUuZy4gcmFkaXVzKSwgaXQgaW5kaWNhdGVzIHRoZSBleGlzdGVuY2Ugb2YgYSBmdW5jdGlvblxuICogICAgICAgICAgICAgICAgICAgIGRyYXdhYmxlLm1hcmtEaXJ0eVJhZGl1cygpIHRoYXQgd2lsbCBpbmRpY2F0ZSB0byB0aGUgZHJhd2FibGUgdGhhdCB0aGUgcmFkaXVzIGhhcyBjaGFuZ2VkLlxuICogKHNjZW5lcnktaW50ZXJuYWwpXG4gKiBAb3ZlcnJpZGVcbiAqL1xuSW1hZ2UucHJvdG90eXBlLmRyYXdhYmxlTWFya0ZsYWdzID0gWyAuLi5Ob2RlLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncywgJ2ltYWdlJywgJ2ltYWdlT3BhY2l0eScsICdtaXBtYXAnIF07XG5cbi8vIE5PVEU6IE5vdCBjdXJyZW50bHkgaW4gdXNlXG5JbWFnZS5JbWFnZUlPID0gbmV3IElPVHlwZSggJ0ltYWdlSU8nLCB7XG4gIHZhbHVlVHlwZTogSW1hZ2UsXG4gIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXG4gIGV2ZW50czogWyAnY2hhbmdlZCcgXSxcbiAgbWV0aG9kczoge1xuICAgIHNldEltYWdlOiB7XG4gICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBTdHJpbmdJTyBdLFxuICAgICAgaW1wbGVtZW50YXRpb246IGZ1bmN0aW9uKCBiYXNlNjRUZXh0OiBzdHJpbmcgKSB7XG4gICAgICAgIGNvbnN0IGltID0gbmV3IHdpbmRvdy5JbWFnZSgpO1xuICAgICAgICBpbS5zcmMgPSBiYXNlNjRUZXh0O1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IGhvdyB3b3VsZCB0aGlzIGV2ZW4gd29yaz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgdGhpcy5pbWFnZSA9IGltO1xuICAgICAgfSxcbiAgICAgIGRvY3VtZW50YXRpb246ICdTZXQgdGhlIGltYWdlIGZyb20gYSBiYXNlNjQgc3RyaW5nJyxcbiAgICAgIGludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHM6IGZhbHNlXG4gICAgfVxuICB9XG59ICk7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbWFnZScsIEltYWdlICk7Il0sIm5hbWVzIjpbImlzVFJlYWRPbmx5UHJvcGVydHkiLCJCb3VuZHMyIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJJT1R5cGUiLCJTdHJpbmdJTyIsIlZvaWRJTyIsIkltYWdlYWJsZSIsIkltYWdlQ2FudmFzRHJhd2FibGUiLCJJbWFnZURPTURyYXdhYmxlIiwiSW1hZ2VTVkdEcmF3YWJsZSIsIkltYWdlV2ViR0xEcmF3YWJsZSIsIk5vZGUiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJTcHJpdGVTaGVldCIsIklNQUdFX09QVElPTl9LRVlTIiwiSW1hZ2UiLCJpbnZhbGlkYXRlSW1hZ2UiLCJfaW1hZ2UiLCJpbnZhbGlkYXRlU2VsZiIsIl9pbWFnZUJvdW5kcyIsImdldEltYWdlV2lkdGgiLCJnZXRJbWFnZUhlaWdodCIsIk5PVEhJTkciLCJzdGF0ZUxlbiIsIl9kcmF3YWJsZXMiLCJsZW5ndGgiLCJpIiwibWFya0RpcnR5SW1hZ2UiLCJpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzIiwiciIsImJpdG1hc2tDYW52YXMiLCJmaXRzV2l0aGluU3ByaXRlU2hlZXQiLCJNQVhfRElNRU5TSU9OIiwid2lkdGgiLCJoZWlnaHQiLCJiaXRtYXNrV2ViR0wiLCJIVE1MQ2FudmFzRWxlbWVudCIsImJpdG1hc2tTVkciLCJiaXRtYXNrRE9NIiwic2V0UmVuZGVyZXJCaXRtYXNrIiwic2V0SW1hZ2VPcGFjaXR5IiwiaW1hZ2VPcGFjaXR5IiwiY2hhbmdlZCIsIl9pbWFnZU9wYWNpdHkiLCJtYXJrRGlydHlJbWFnZU9wYWNpdHkiLCJzZXRJbWFnZUJvdW5kcyIsImltYWdlQm91bmRzIiwidmFsdWUiLCJnZXRJbWFnZUJvdW5kcyIsImlzUGFpbnRlZCIsImNhbnZhc1BhaW50U2VsZiIsIndyYXBwZXIiLCJtYXRyaXgiLCJwcm90b3R5cGUiLCJwYWludENhbnZhcyIsImNyZWF0ZURPTURyYXdhYmxlIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY3JlYXRlU1ZHRHJhd2FibGUiLCJjcmVhdGVDYW52YXNEcmF3YWJsZSIsImNyZWF0ZVdlYkdMRHJhd2FibGUiLCJjb250YWluc1BvaW50U2VsZiIsInBvaW50IiwiaW5Cb3VuZHMiLCJjYWxsIiwiX2hpdFRlc3RQaXhlbHMiLCJfaGl0VGVzdEltYWdlRGF0YSIsInRlc3RIaXRUZXN0RGF0YSIsImltYWdlV2lkdGgiLCJpbWFnZUhlaWdodCIsImdldFNlbGZTaGFwZSIsImhpdFRlc3REYXRhVG9TaGFwZSIsImludmFsaWRhdGVNaXBtYXBzIiwibWFya0RpcnR5IiwiX21pcG1hcCIsIl9taXBtYXBEYXRhIiwibWFya0RpcnR5TWlwbWFwIiwibXV0YXRlIiwib3B0aW9ucyIsImltYWdlIiwicHJvdmlkZWRPcHRpb25zIiwiaW5pdEltYWdlT3B0aW9ucyIsImltYWdlUHJvcGVydHkiLCJERUZBVUxUX0lNQUdFX09QVElPTlMiLCJERUZBVUxUX05PREVfT1BUSU9OUyIsIkRFRkFVTFRfT1BUSU9OUyIsIl9tdXRhdG9yS2V5cyIsImRyYXdhYmxlTWFya0ZsYWdzIiwiSW1hZ2VJTyIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk5vZGVJTyIsImV2ZW50cyIsIm1ldGhvZHMiLCJzZXRJbWFnZSIsInJldHVyblR5cGUiLCJwYXJhbWV0ZXJUeXBlcyIsImltcGxlbWVudGF0aW9uIiwiYmFzZTY0VGV4dCIsImltIiwid2luZG93Iiwic3JjIiwiZG9jdW1lbnRhdGlvbiIsImludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsU0FBNEJBLG1CQUFtQixRQUFRLHdDQUF3QztBQUMvRixPQUFPQyxhQUFhLDZCQUE2QjtBQUlqRCxPQUFPQyxhQUFhQyxjQUFjLFFBQTBCLHFDQUFxQztBQUNqRyxPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxTQUFvRUMsU0FBUyxFQUFvQ0MsbUJBQW1CLEVBQUVDLGdCQUFnQixFQUFFQyxnQkFBZ0IsRUFBRUMsa0JBQWtCLEVBQVlDLElBQUksRUFBZUMsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLFdBQVcsUUFBNEQsZ0JBQWdCO0FBR3JVLGlGQUFpRjtBQUNqRixNQUFNQyxvQkFBb0I7SUFDeEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQSxnQkFBZ0IscUhBQXFIO0NBQ3RJO0FBVWMsSUFBQSxBQUFNQyxRQUFOLE1BQU1BLGNBQWNWLFVBQVdLO0lBMkI1Qzs7Ozs7Ozs7R0FRQyxHQUNELEFBQWdCTSxrQkFBd0I7UUFDdEMsSUFBSyxJQUFJLENBQUNDLE1BQU0sRUFBRztZQUNqQixJQUFJLENBQUNDLGNBQWMsQ0FBRSxJQUFJLENBQUNDLFlBQVksSUFBSSxJQUFJcEIsUUFBUyxHQUFHLEdBQUcsSUFBSSxDQUFDcUIsYUFBYSxJQUFJLElBQUksQ0FBQ0MsY0FBYztRQUN4RyxPQUNLO1lBQ0gs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