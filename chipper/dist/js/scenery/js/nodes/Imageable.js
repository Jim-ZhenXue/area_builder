// Copyright 2020-2024, University of Colorado Boulder
/**
 * Isolates Image handling with HTML/Canvas images, with mipmaps and general support.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import { scenery, svgns, xlinkns } from '../imports.js';
// Need to poly-fill on some browsers
const log2 = Math.log2 || function(x) {
    return Math.log(x) / Math.LN2;
};
const DEFAULT_OPTIONS = {
    imageOpacity: 1,
    initialWidth: 0,
    initialHeight: 0,
    mipmap: false,
    mipmapBias: 0,
    mipmapInitialLevel: 4,
    mipmapMaxLevel: 5,
    hitTestPixels: false
};
// Lazy scratch canvas/context (so we don't incur the startup cost of canvas/context creation)
let scratchCanvas = null;
let scratchContext = null;
const getScratchCanvas = ()=>{
    if (!scratchCanvas) {
        scratchCanvas = document.createElement('canvas');
    }
    return scratchCanvas;
};
const getScratchContext = ()=>{
    if (!scratchContext) {
        scratchContext = getScratchCanvas().getContext('2d', {
            willReadFrequently: true
        });
    }
    return scratchContext;
};
const Imageable = (type)=>{
    return class ImageableMixin extends type {
        /**
     * Sets the current image to be displayed by this Image node. See ImageableImage for details on provided image value.
     *
     */ setImage(image) {
            assert && assert(image, 'image should be available');
            this._imageProperty.value = image;
            return this;
        }
        set image(value) {
            this.setImage(value);
        }
        get image() {
            return this.getImage();
        }
        /**
     * Returns the current image's representation as either a Canvas or img element.
     *
     * NOTE: If a URL or mipmap data was provided, this currently doesn't return the original input to setImage(), but
     *       instead provides the mapped result (or first mipmap level's image). If you need the original, use
     *       imageProperty instead.
     */ getImage() {
            assert && assert(this._image !== null);
            return this._image;
        }
        onImagePropertyChange(image) {
            assert && assert(image, 'image should be available');
            // Generally, if a different value for image is provided, it has changed
            let hasImageChanged = this._image !== image;
            // Except in some cases, where the provided image is a string. If our current image has the same .src as the
            // "new" image, it's basically the same (as we promote string images to HTMLImageElements).
            if (hasImageChanged && typeof image === 'string' && this._image && this._image instanceof HTMLImageElement && image === this._image.src) {
                hasImageChanged = false;
            }
            // Or if our current mipmap data is the same as the input, then we aren't changing it
            if (hasImageChanged && image === this._mipmapData) {
                hasImageChanged = false;
            }
            if (hasImageChanged) {
                // Reset the initial dimensions, since we have a new image that may have different dimensions.
                this._initialWidth = 0;
                this._initialHeight = 0;
                // Don't leak memory by referencing old images
                if (this._image && this._imageLoadListenerAttached) {
                    this._detachImageLoadListener();
                }
                // clear old mipmap data references
                this._mipmapData = null;
                // Convert string => HTMLImageElement
                if (typeof image === 'string') {
                    // create an image with the assumed URL
                    const src = image;
                    image = document.createElement('img');
                    image.src = src;
                } else if (Array.isArray(image)) {
                    // mipmap data!
                    this._mipmapData = image;
                    image = image[0].img; // presumes we are already loaded
                    // force initialization of mipmapping parameters, since invalidateMipmaps() is guaranteed to run below
                    this._mipmapInitialLevel = this._mipmapMaxLevel = this._mipmapData.length;
                    this._mipmap = true;
                }
                // We ruled out the string | Mipmap cases above
                this._image = image;
                // If our image is an HTML image that hasn't loaded yet, attach a load listener.
                if (this._image instanceof HTMLImageElement && (!this._image.width || !this._image.height)) {
                    this._attachImageLoadListener();
                }
                // Try recomputing bounds (may give a 0x0 if we aren't yet loaded)
                this.invalidateImage();
            }
        }
        /**
     * See documentation for Node.setVisibleProperty, except this is for the image
     */ setImageProperty(newTarget) {
            // This is awkward, we are NOT guaranteed a Node.
            return this._imageProperty.setTargetProperty(newTarget);
        }
        set imageProperty(property) {
            this.setImageProperty(property);
        }
        get imageProperty() {
            return this.getImageProperty();
        }
        /**
     * Like Node.getVisibleProperty(), but for the image. Note this is not the same as the Property provided in
     * setImageProperty. Thus is the nature of TinyForwardingProperty.
     */ getImageProperty() {
            return this._imageProperty;
        }
        /**
     * Triggers recomputation of the image's bounds and refreshes any displays output of the image.
     *
     * Generally this can trigger recomputation of mipmaps, will mark any drawables as needing repaints, and will
     * cause a spritesheet change for WebGL.
     *
     * This should be done when the underlying image has changed appearance (usually the case with a Canvas changing,
     * but this is also triggered by our actual image reference changing).
     */ invalidateImage() {
            this.invalidateMipmaps();
            this._invalidateHitTestData();
        }
        /**
     * Sets the image with additional information about dimensions used before the image has loaded.
     *
     * This is essentially the same as setImage(), but also updates the initial dimensions. See setImage()'s
     * documentation for details on the image parameter.
     *
     * NOTE: setImage() will first reset the initial dimensions to 0, which will then be overridden later in this
     *       function. This may trigger bounds changes, even if the previous and next image (and image dimensions)
     *       are the same.
     *
     * @param image - See ImageableImage's type documentation
     * @param width - Initial width of the image. See setInitialWidth() for more documentation
     * @param height - Initial height of the image. See setInitialHeight() for more documentation
     */ setImageWithSize(image, width, height) {
            // First, setImage(), as it will reset the initial width and height
            this.setImage(image);
            // Then apply the initial dimensions
            this.setInitialWidth(width);
            this.setInitialHeight(height);
            return this;
        }
        /**
     * Sets an opacity that is applied only to this image (will not affect children or the rest of the node's subtree).
     *
     * This should generally be preferred over Node's opacity if it has the same result, as modifying this will be much
     * faster, and will not force additional Canvases or intermediate steps in display.
     *
     * @param imageOpacity - Should be a number between 0 (transparent) and 1 (opaque), just like normal
     *                                opacity.
     */ setImageOpacity(imageOpacity) {
            assert && assert(isFinite(imageOpacity) && imageOpacity >= 0 && imageOpacity <= 1, `imageOpacity out of range: ${imageOpacity}`);
            if (this._imageOpacity !== imageOpacity) {
                this._imageOpacity = imageOpacity;
            }
        }
        set imageOpacity(value) {
            this.setImageOpacity(value);
        }
        get imageOpacity() {
            return this.getImageOpacity();
        }
        /**
     * Returns the opacity applied only to this image (not including children).
     *
     * See setImageOpacity() documentation for more information.
     */ getImageOpacity() {
            return this._imageOpacity;
        }
        /**
     * Provides an initial width for an image that has not loaded yet.
     *
     * If the input image hasn't loaded yet, but the (expected) size is known, providing an initialWidth will cause the
     * Image node to have the correct bounds (width) before the pixel data has been fully loaded. A value of 0 will be
     * ignored.
     *
     * This is required for many browsers, as images can show up as a 0x0 (like Safari does for unloaded images).
     *
     * NOTE: setImage will reset this value to 0 (ignored), since it's potentially likely the new image has different
     *       dimensions than the current image.
     *
     * NOTE: If these dimensions end up being different than the actual image width/height once it has been loaded, an
     *       assertion will fail. Only the correct dimensions should be provided. If the width/height is unknown,
     *       please use the localBounds override or a transparent rectangle for taking up the (approximate) bounds.
     *
     * @param width - Expected width of the image's unloaded content
     */ setInitialWidth(width) {
            assert && assert(width >= 0 && width % 1 === 0, 'initialWidth should be a non-negative integer');
            if (width !== this._initialWidth) {
                this._initialWidth = width;
                this.invalidateImage();
            }
            return this;
        }
        set initialWidth(value) {
            this.setInitialWidth(value);
        }
        get initialWidth() {
            return this.getInitialWidth();
        }
        /**
     * Returns the initialWidth value set from setInitialWidth().
     *
     * See setInitialWidth() for more documentation. A value of 0 is ignored.
     */ getInitialWidth() {
            return this._initialWidth;
        }
        /**
     * Provides an initial height for an image that has not loaded yet.
     *
     * If the input image hasn't loaded yet, but the (expected) size is known, providing an initialWidth will cause the
     * Image node to have the correct bounds (height) before the pixel data has been fully loaded. A value of 0 will be
     * ignored.
     *
     * This is required for many browsers, as images can show up as a 0x0 (like Safari does for unloaded images).
     *
     * NOTE: setImage will reset this value to 0 (ignored), since it's potentially likely the new image has different
     *       dimensions than the current image.
     *
     * NOTE: If these dimensions end up being different than the actual image width/height once it has been loaded, an
     *       assertion will fail. Only the correct dimensions should be provided. If the width/height is unknown,
     *       please use the localBounds override or a transparent rectangle for taking up the (approximate) bounds.
     *
     * @param height - Expected height of the image's unloaded content
     */ setInitialHeight(height) {
            assert && assert(height >= 0 && height % 1 === 0, 'initialHeight should be a non-negative integer');
            if (height !== this._initialHeight) {
                this._initialHeight = height;
                this.invalidateImage();
            }
            return this;
        }
        set initialHeight(value) {
            this.setInitialHeight(value);
        }
        get initialHeight() {
            return this.getInitialHeight();
        }
        /**
     * Returns the initialHeight value set from setInitialHeight().
     *
     * See setInitialHeight() for more documentation. A value of 0 is ignored.
     */ getInitialHeight() {
            return this._initialHeight;
        }
        /**
     * Sets whether mipmapping is supported.
     *
     * This defaults to false, but is automatically set to true when a mipmap is provided to setImage(). Setting it to
     * true on non-mipmap images will trigger creation of a medium-quality mipmap that will be used.
     *
     * NOTE: This mipmap generation is slow and CPU-intensive. Providing precomputed mipmap resources to an Image node
     *       will be much faster, and of higher quality.
     *
     * @param mipmap - Whether mipmapping is supported
     */ setMipmap(mipmap) {
            if (this._mipmap !== mipmap) {
                this._mipmap = mipmap;
                this.invalidateMipmaps();
            }
            return this;
        }
        set mipmap(value) {
            this.setMipmap(value);
        }
        get mipmap() {
            return this.isMipmap();
        }
        /**
     * Returns whether mipmapping is supported.
     *
     * See setMipmap() for more documentation.
     */ isMipmap() {
            return this._mipmap;
        }
        /**
     * Sets how much level-of-detail is displayed for mipmapping.
     *
     * When displaying mipmapped images as output, a certain source level of the mipmap needs to be used. Using a level
     * with too much resolution can create an aliased look (but will generally be sharper). Using a level with too
     * little resolution will be blurrier (but not aliased).
     *
     * The value of the mipmap bias is added on to the computed "ideal" mipmap level, and:
     * - A negative bias will typically increase the displayed resolution
     * - A positive bias will typically decrease the displayed resolution
     *
     * This is done approximately like the following formula:
     *   mipmapLevel = Utils.roundSymmetric( computedMipmapLevel + mipmapBias )
     */ setMipmapBias(bias) {
            if (this._mipmapBias !== bias) {
                this._mipmapBias = bias;
                this.invalidateMipmaps();
            }
            return this;
        }
        set mipmapBias(value) {
            this.setMipmapBias(value);
        }
        get mipmapBias() {
            return this.getMipmapBias();
        }
        /**
     * Returns the current mipmap bias.
     *
     * See setMipmapBias() for more documentation.
     */ getMipmapBias() {
            return this._mipmapBias;
        }
        /**
     * The number of initial mipmap levels to compute (if Scenery generates the mipmaps by setting mipmap:true on a
     * non-mipmapped input).
     *
     * @param level - A non-negative integer representing the number of mipmap levels to precompute.
     */ setMipmapInitialLevel(level) {
            assert && assert(level % 1 === 0 && level >= 0, 'mipmapInitialLevel should be a non-negative integer');
            if (this._mipmapInitialLevel !== level) {
                this._mipmapInitialLevel = level;
                this.invalidateMipmaps();
            }
            return this;
        }
        set mipmapInitialLevel(value) {
            this.setMipmapInitialLevel(value);
        }
        get mipmapInitialLevel() {
            return this.getMipmapInitialLevel();
        }
        /**
     * Returns the current initial mipmap level.
     *
     * See setMipmapInitialLevel() for more documentation.
     */ getMipmapInitialLevel() {
            return this._mipmapInitialLevel;
        }
        /**
     * The maximum (lowest-resolution) level that Scenery will compute if it generates mipmaps (e.g. by setting
     * mipmap:true on a non-mipmapped input).
     *
     * The default will precompute all default levels (from mipmapInitialLevel), so that we ideally don't hit mipmap
     * generation during animation.
     *
     * @param level - A non-negative integer representing the maximum mipmap level to compute.
     */ setMipmapMaxLevel(level) {
            assert && assert(level % 1 === 0 && level >= 0, 'mipmapMaxLevel should be a non-negative integer');
            if (this._mipmapMaxLevel !== level) {
                this._mipmapMaxLevel = level;
                this.invalidateMipmaps();
            }
            return this;
        }
        set mipmapMaxLevel(value) {
            this.setMipmapMaxLevel(value);
        }
        get mipmapMaxLevel() {
            return this.getMipmapMaxLevel();
        }
        /**
     * Returns the current maximum mipmap level.
     *
     * See setMipmapMaxLevel() for more documentation.
     */ getMipmapMaxLevel() {
            return this._mipmapMaxLevel;
        }
        /**
     * Controls whether either any pixel in the image will be marked as contained (when false), or whether transparent
     * pixels will be counted as "not contained in the image" for hit-testing (when true).
     *
     * See https://github.com/phetsims/scenery/issues/1049 for more information.
     */ setHitTestPixels(hitTestPixels) {
            if (this._hitTestPixels !== hitTestPixels) {
                this._hitTestPixels = hitTestPixels;
                this._invalidateHitTestData();
            }
            return this;
        }
        set hitTestPixels(value) {
            this.setHitTestPixels(value);
        }
        get hitTestPixels() {
            return this.getHitTestPixels();
        }
        /**
     * Returns whether pixels are checked for hit testing.
     *
     * See setHitTestPixels() for more documentation.
     */ getHitTestPixels() {
            return this._hitTestPixels;
        }
        /**
     * Constructs the next available (uncomputed) mipmap level, as long as the previous level was larger than 1x1.
     */ _constructNextMipmap() {
            const level = this._mipmapCanvases.length;
            const biggerCanvas = this._mipmapCanvases[level - 1];
            // ignore any 1x1 canvases (or smaller?!?)
            if (biggerCanvas.width * biggerCanvas.height > 2) {
                const canvas = document.createElement('canvas');
                canvas.width = Math.ceil(biggerCanvas.width / 2);
                canvas.height = Math.ceil(biggerCanvas.height / 2);
                // sanity check
                if (canvas.width > 0 && canvas.height > 0) {
                    // Draw half-scale into the smaller Canvas
                    const context = canvas.getContext('2d');
                    context.scale(0.5, 0.5);
                    context.drawImage(biggerCanvas, 0, 0);
                    this._mipmapCanvases.push(canvas);
                    this._mipmapURLs.push(canvas.toDataURL());
                }
            }
        }
        /**
     * Triggers recomputation of mipmaps (as long as mipmapping is enabled)
     */ invalidateMipmaps() {
            // Clean output arrays
            cleanArray(this._mipmapCanvases);
            cleanArray(this._mipmapURLs);
            if (this._image && this._mipmap) {
                // If we have mipmap data as an input
                if (this._mipmapData) {
                    for(let k = 0; k < this._mipmapData.length; k++){
                        const url = this._mipmapData[k].url;
                        this._mipmapURLs.push(url);
                        const updateCanvas = this._mipmapData[k].updateCanvas;
                        updateCanvas && updateCanvas();
                        this._mipmapCanvases.push(this._mipmapData[k].canvas);
                    }
                } else {
                    const baseCanvas = document.createElement('canvas');
                    baseCanvas.width = this.getImageWidth();
                    baseCanvas.height = this.getImageHeight();
                    // if we are not loaded yet, just ignore
                    if (baseCanvas.width && baseCanvas.height) {
                        const baseContext = baseCanvas.getContext('2d');
                        baseContext.drawImage(this._image, 0, 0);
                        this._mipmapCanvases.push(baseCanvas);
                        this._mipmapURLs.push(baseCanvas.toDataURL());
                        let level = 0;
                        while(++level < this._mipmapInitialLevel){
                            this._constructNextMipmap();
                        }
                    }
                }
            }
            this.mipmapEmitter.emit();
        }
        /**
     * Returns the desired mipmap level (0-indexed) that should be used for the particular relative transform. (scenery-internal)
     *
     * @param matrix - The relative transformation matrix of the node.
     * @param [additionalBias] - Can be provided to get per-call bias (we want some of this for Canvas output)
     */ getMipmapLevel(matrix, additionalBias = 0) {
            assert && assert(this._mipmap, 'Assumes mipmaps can be used');
            // Handle high-dpi devices like retina with correct mipmap levels.
            const scale = Imageable.getApproximateMatrixScale(matrix) * (window.devicePixelRatio || 1);
            return this.getMipmapLevelFromScale(scale, additionalBias);
        }
        /**
     * Returns the desired mipmap level (0-indexed) that should be used for the particular scale
     */ getMipmapLevelFromScale(scale, additionalBias = 0) {
            assert && assert(scale > 0, 'scale should be a positive number');
            // If we are shown larger than scale, ALWAYS choose the highest resolution
            if (scale >= 1) {
                return 0;
            }
            // our approximate level of detail
            let level = log2(1 / scale);
            // convert to an integer level (-0.7 is a good default)
            level = Utils.roundSymmetric(level + this._mipmapBias + additionalBias - 0.7);
            if (level < 0) {
                level = 0;
            }
            if (level > this._mipmapMaxLevel) {
                level = this._mipmapMaxLevel;
            }
            // If necessary, do lazy construction of the mipmap level
            if (this.mipmap && !this._mipmapCanvases[level]) {
                let currentLevel = this._mipmapCanvases.length - 1;
                while(++currentLevel <= level){
                    this._constructNextMipmap();
                }
                // Sanity check, since _constructNextMipmap() may have had to bail out. We had to compute some, so use the last
                return Math.min(level, this._mipmapCanvases.length - 1);
            } else {
                return level;
            }
        }
        /**
     * Returns a matching Canvas element for the given level-of-detail. (scenery-internal)
     *
     * @param level - Non-negative integer representing the mipmap level
     * @returns - Matching <canvas> for the level of detail
     */ getMipmapCanvas(level) {
            assert && assert(level >= 0 && level < this._mipmapCanvases.length && level % 1 === 0);
            // Sanity check to make sure we have copied the image data in if necessary.
            if (this._mipmapData) {
                // level may not exist (it was generated), and updateCanvas may not exist
                const updateCanvas = this._mipmapData[level] && this._mipmapData[level].updateCanvas;
                updateCanvas && updateCanvas();
            }
            return this._mipmapCanvases[level];
        }
        /**
     * Returns a matching URL string for an image for the given level-of-detail. (scenery-internal)
     *
     * @param level - Non-negative integer representing the mipmap level
     * @returns - Matching data URL for the level of detail
     */ getMipmapURL(level) {
            assert && assert(level >= 0 && level < this._mipmapCanvases.length && level % 1 === 0);
            return this._mipmapURLs[level];
        }
        /**
     * Returns whether there are mipmap levels that have been computed. (scenery-internal)
     */ hasMipmaps() {
            return this._mipmapCanvases.length > 0;
        }
        /**
     * Triggers recomputation of hit test data
     */ _invalidateHitTestData() {
            // Only compute this if we are hit-testing pixels
            if (!this._hitTestPixels) {
                return;
            }
            if (this._image !== null) {
                this._hitTestImageData = Imageable.getHitTestData(this._image, this.imageWidth, this.imageHeight);
            }
        }
        /**
     * Returns the width of the displayed image (not related to how this node is transformed).
     *
     * NOTE: If the image is not loaded and an initialWidth was provided, that width will be used.
     */ getImageWidth() {
            if (this._image === null) {
                return 0;
            }
            const detectedWidth = this._mipmapData ? this._mipmapData[0].width : ('naturalWidth' in this._image ? this._image.naturalWidth : 0) || this._image.width;
            if (detectedWidth === 0) {
                return this._initialWidth; // either 0 (default), or the overridden value
            } else {
                assert && assert(this._initialWidth === 0 || this._initialWidth === detectedWidth, 'Bad Image.initialWidth');
                return detectedWidth;
            }
        }
        get imageWidth() {
            return this.getImageWidth();
        }
        /**
     * Returns the height of the displayed image (not related to how this node is transformed).
     *
     * NOTE: If the image is not loaded and an initialHeight was provided, that height will be used.
     */ getImageHeight() {
            if (this._image === null) {
                return 0;
            }
            const detectedHeight = this._mipmapData ? this._mipmapData[0].height : ('naturalHeight' in this._image ? this._image.naturalHeight : 0) || this._image.height;
            if (detectedHeight === 0) {
                return this._initialHeight; // either 0 (default), or the overridden value
            } else {
                assert && assert(this._initialHeight === 0 || this._initialHeight === detectedHeight, 'Bad Image.initialHeight');
                return detectedHeight;
            }
        }
        get imageHeight() {
            return this.getImageHeight();
        }
        /**
     * If our provided image is an HTMLImageElement, returns its URL (src). (scenery-internal)
     */ getImageURL() {
            assert && assert(this._image instanceof HTMLImageElement, 'Only supported for HTML image elements');
            return this._image.src;
        }
        /**
     * Attaches our on-load listener to our current image.
     */ _attachImageLoadListener() {
            assert && assert(!this._imageLoadListenerAttached, 'Should only be attached to one thing at a time');
            if (!this.isDisposed) {
                this._image.addEventListener('load', this._imageLoadListener);
                this._imageLoadListenerAttached = true;
            }
        }
        /**
     * Detaches our on-load listener from our current image.
     */ _detachImageLoadListener() {
            assert && assert(this._imageLoadListenerAttached, 'Needs to be attached first to be detached.');
            this._image.removeEventListener('load', this._imageLoadListener);
            this._imageLoadListenerAttached = false;
        }
        /**
     * Called when our image has loaded (it was not yet loaded with then listener was added)
     */ _onImageLoad() {
            assert && assert(this._imageLoadListenerAttached, 'If _onImageLoad is firing, it should be attached');
            this.invalidateImage();
            this._detachImageLoadListener();
        }
        /**
     * Disposes the path, releasing image listeners if needed (and preventing new listeners from being added).
     */ dispose() {
            if (this._image && this._imageLoadListenerAttached) {
                this._detachImageLoadListener();
            }
            this._imageProperty.dispose();
            // @ts-expect-error
            super.dispose && super.dispose();
        }
        constructor(...args){
            super(...args);
            // We'll initialize this by mutating.
            this._imageProperty = new TinyForwardingProperty(null, false, this.onImagePropertyChange.bind(this));
            this._image = null;
            this._initialWidth = DEFAULT_OPTIONS.initialWidth;
            this._initialHeight = DEFAULT_OPTIONS.initialHeight;
            this._imageOpacity = DEFAULT_OPTIONS.imageOpacity;
            this._mipmap = DEFAULT_OPTIONS.mipmap;
            this._mipmapBias = DEFAULT_OPTIONS.mipmapBias;
            this._mipmapInitialLevel = DEFAULT_OPTIONS.mipmapInitialLevel;
            this._mipmapMaxLevel = DEFAULT_OPTIONS.mipmapMaxLevel;
            this._hitTestPixels = DEFAULT_OPTIONS.hitTestPixels;
            this._mipmapCanvases = [];
            this._mipmapURLs = [];
            this._mipmapData = null;
            this._imageLoadListener = this._onImageLoad.bind(this);
            this._imageLoadListenerAttached = false;
            this._hitTestImageData = null;
            this.mipmapEmitter = new TinyEmitter();
        }
    };
};
/**
 * Optionally returns an ImageData object useful for hit-testing the pixel data of an image.
 *
 * @param image
 * @param width - logical width of the image
 * @param height - logical height of the image
 */ Imageable.getHitTestData = (image, width, height)=>{
    // If the image isn't loaded yet, we don't want to try loading anything
    if (!(('naturalWidth' in image ? image.naturalWidth : 0) || image.width) || !(('naturalHeight' in image ? image.naturalHeight : 0) || image.height)) {
        return null;
    }
    const canvas = getScratchCanvas();
    const context = getScratchContext();
    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height);
};
/**
 * Tests whether a given pixel in an ImageData is at all non-transparent.
 *
 * @param imageData
 * @param width - logical width of the image
 * @param height - logical height of the image
 * @param point
 */ Imageable.testHitTestData = (imageData, width, height, point)=>{
    // For sanity, map it based on the image dimensions and image data dimensions, and carefully clamp in case things are weird.
    const x = Utils.clamp(Math.floor(point.x / width * imageData.width), 0, imageData.width - 1);
    const y = Utils.clamp(Math.floor(point.y / height * imageData.height), 0, imageData.height - 1);
    const index = 4 * (x + y * imageData.width) + 3;
    return imageData.data[index] !== 0;
};
/**
 * Turns the ImageData into a Shape showing where hit testing would succeed.
 *
 * @param imageData
 * @param width - logical width of the image
 * @param height - logical height of the image
 */ Imageable.hitTestDataToShape = (imageData, width, height)=>{
    const widthScale = width / imageData.width;
    const heightScale = height / imageData.height;
    const shape = new Shape();
    // Create rows at a time, so that if we have 50 adjacent pixels "on", then we'll just make a rectangle 50-wide.
    // This lets us do the CAG faster.
    let active = false;
    let min = 0;
    // NOTE: Rows are more helpful for CAG, even though columns would have better cache behavior when accessing the
    // imageData.
    for(let y = 0; y < imageData.height; y++){
        for(let x = 0; x < imageData.width; x++){
            const index = 4 * (x + y * imageData.width) + 3;
            if (imageData.data[index] !== 0) {
                // If our last pixel was empty, and now we're "on", start our rectangle
                if (!active) {
                    active = true;
                    min = x;
                }
            } else if (active) {
                // Finish a rectangle once we reach an "off" pixel
                active = false;
                shape.rect(min * widthScale, y * widthScale, widthScale * (x - min), heightScale);
            }
        }
        if (active) {
            // We'll need to finish rectangles at the end of each row anyway.
            active = false;
            shape.rect(min * widthScale, y * widthScale, widthScale * (imageData.width - min), heightScale);
        }
    }
    return shape.getSimplifiedAreaShape();
};
/**
 * Creates an SVG image element with a given URL and dimensions
 *
 * @param url - The URL for the image
 * @param width - Non-negative integer for the image's width
 * @param height - Non-negative integer for the image's height
 */ Imageable.createSVGImage = (url, width, height)=>{
    assert && assert(isFinite(width) && width >= 0 && width % 1 === 0, 'width should be a non-negative finite integer');
    assert && assert(isFinite(height) && height >= 0 && height % 1 === 0, 'height should be a non-negative finite integer');
    const element = document.createElementNS(svgns, 'image');
    element.setAttribute('x', '0');
    element.setAttribute('y', '0');
    element.setAttribute('width', `${width}px`);
    element.setAttribute('height', `${height}px`);
    element.setAttributeNS(xlinkns, 'xlink:href', url);
    return element;
};
/**
 * Creates an object suitable to be passed to Image as a mipmap (from a Canvas)
 */ Imageable.createFastMipmapFromCanvas = (baseCanvas)=>{
    const mipmaps = [];
    const baseURL = baseCanvas.toDataURL();
    const baseImage = new window.Image();
    baseImage.src = baseURL;
    // base level
    mipmaps.push({
        img: baseImage,
        url: baseURL,
        width: baseCanvas.width,
        height: baseCanvas.height,
        canvas: baseCanvas
    });
    let largeCanvas = baseCanvas;
    while(largeCanvas.width >= 2 && largeCanvas.height >= 2){
        // draw half-size
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(largeCanvas.width / 2);
        canvas.height = Math.ceil(largeCanvas.height / 2);
        const context = canvas.getContext('2d');
        context.setTransform(0.5, 0, 0, 0.5, 0, 0);
        context.drawImage(largeCanvas, 0, 0);
        // smaller level
        const mipmapLevel = {
            width: canvas.width,
            height: canvas.height,
            canvas: canvas,
            url: canvas.toDataURL(),
            img: new window.Image()
        };
        // set up the image and url
        mipmapLevel.img.src = mipmapLevel.url;
        largeCanvas = canvas;
        mipmaps.push(mipmapLevel);
    }
    return mipmaps;
};
/**
 * Returns a sense of "average" scale, which should be exact if there is no asymmetric scale/shear applied
 */ Imageable.getApproximateMatrixScale = (matrix)=>{
    return (Math.sqrt(matrix.m00() * matrix.m00() + matrix.m10() * matrix.m10()) + Math.sqrt(matrix.m01() * matrix.m01() + matrix.m11() * matrix.m11())) / 2;
};
// {number} - We include this for additional smoothing that seems to be needed for Canvas image quality
Imageable.CANVAS_MIPMAP_BIAS_ADJUSTMENT = 0.5;
// {Object} - Initial values for most Node mutator options
Imageable.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
scenery.register('Imageable', Imageable);
export default Imageable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvSW1hZ2VhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIElzb2xhdGVzIEltYWdlIGhhbmRsaW5nIHdpdGggSFRNTC9DYW52YXMgaW1hZ2VzLCB3aXRoIG1pcG1hcHMgYW5kIGdlbmVyYWwgc3VwcG9ydC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlGb3J3YXJkaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55Rm9yd2FyZGluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgc2NlbmVyeSwgc3ZnbnMsIHhsaW5rbnMgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gTmVlZCB0byBwb2x5LWZpbGwgb24gc29tZSBicm93c2Vyc1xuY29uc3QgbG9nMiA9IE1hdGgubG9nMiB8fCBmdW5jdGlvbiggeDogbnVtYmVyICkgeyByZXR1cm4gTWF0aC5sb2coIHggKSAvIE1hdGguTE4yOyB9O1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGltYWdlT3BhY2l0eTogMSxcbiAgaW5pdGlhbFdpZHRoOiAwLFxuICBpbml0aWFsSGVpZ2h0OiAwLFxuICBtaXBtYXA6IGZhbHNlLFxuICBtaXBtYXBCaWFzOiAwLFxuICBtaXBtYXBJbml0aWFsTGV2ZWw6IDQsXG4gIG1pcG1hcE1heExldmVsOiA1LFxuICBoaXRUZXN0UGl4ZWxzOiBmYWxzZVxufSBhcyBjb25zdDtcblxuLy8gTGF6eSBzY3JhdGNoIGNhbnZhcy9jb250ZXh0IChzbyB3ZSBkb24ndCBpbmN1ciB0aGUgc3RhcnR1cCBjb3N0IG9mIGNhbnZhcy9jb250ZXh0IGNyZWF0aW9uKVxubGV0IHNjcmF0Y2hDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5sZXQgc2NyYXRjaENvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwgPSBudWxsO1xuY29uc3QgZ2V0U2NyYXRjaENhbnZhcyA9ICgpOiBIVE1MQ2FudmFzRWxlbWVudCA9PiB7XG4gIGlmICggIXNjcmF0Y2hDYW52YXMgKSB7XG4gICAgc2NyYXRjaENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIH1cbiAgcmV0dXJuIHNjcmF0Y2hDYW52YXM7XG59O1xuY29uc3QgZ2V0U2NyYXRjaENvbnRleHQgPSAoKSA9PiB7XG4gIGlmICggIXNjcmF0Y2hDb250ZXh0ICkge1xuICAgIHNjcmF0Y2hDb250ZXh0ID0gZ2V0U2NyYXRjaENhbnZhcygpLmdldENvbnRleHQoICcyZCcsIHtcbiAgICAgIHdpbGxSZWFkRnJlcXVlbnRseTogdHJ1ZVxuICAgIH0gKSE7XG4gIH1cbiAgcmV0dXJuIHNjcmF0Y2hDb250ZXh0O1xufTtcblxuZXhwb3J0IHR5cGUgTWlwbWFwID0ge1xuICB3aWR0aDogbnVtYmVyO1xuICBoZWlnaHQ6IG51bWJlcjtcbiAgdXJsOiBzdHJpbmc7XG4gIGNhbnZhcz86IEhUTUxDYW52YXNFbGVtZW50O1xuICBpbWc/OiBIVE1MSW1hZ2VFbGVtZW50O1xuICB1cGRhdGVDYW52YXM/OiAoKSA9PiB2b2lkO1xufVtdO1xuXG4vKipcbiAqIFRoZSBhdmFpbGFibGUgd2F5cyB0byBzcGVjaWZ5IGFuIGltYWdlIGFzIGFuIGlucHV0IHRvIEltYWdlYWJsZS4gU2VlIG9uSW1hZ2VQcm9wZXJ0eUNoYW5nZSgpIGZvciBwYXJzaW5nIGxvZ2ljLlxuICogV2Ugc3VwcG9ydCBhIGZldyBkaWZmZXJlbnQgJ2ltYWdlJyB0eXBlcyB0aGF0IGNhbiBiZSBwYXNzZWQgaW46XG4gKlxuICogSFRNTEltYWdlRWxlbWVudCAtIEEgbm9ybWFsIEhUTUwgPGltZz4uIElmIGl0IGhhc24ndCBiZWVuIGZ1bGx5IGxvYWRlZCB5ZXQsIFNjZW5lcnkgd2lsbCB0YWtlIGNhcmUgb2YgYWRkaW5nIGFcbiAqICAgbGlzdGVuZXIgdGhhdCB3aWxsIHVwZGF0ZSBTY2VuZXJ5IHdpdGggaXRzIHdpZHRoL2hlaWdodCAoYW5kIGxvYWQgaXRzIGRhdGEpIHdoZW4gdGhlIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAqICAgTk9URSB0aGF0IGlmIHlvdSBqdXN0IGNyZWF0ZWQgdGhlIDxpbWc+LCBpdCBwcm9iYWJseSBpc24ndCBsb2FkZWQgeWV0LCBwYXJ0aWN1bGFybHkgaW4gU2FmYXJpLiBJZiB0aGUgSW1hZ2VcbiAqICAgbm9kZSBpcyBjb25zdHJ1Y3RlZCB3aXRoIGFuIDxpbWc+IHRoYXQgaGFzbid0IGZ1bGx5IGxvYWRlZCwgaXQgd2lsbCBoYXZlIGEgd2lkdGggYW5kIGhlaWdodCBvZiAwLCB3aGljaCBtYXlcbiAqICAgY2F1c2UgaXNzdWVzIGlmIHlvdSBhcmUgdXNpbmcgYm91bmRzIGZvciBsYXlvdXQuIFBsZWFzZSBzZWUgaW5pdGlhbFdpZHRoL2luaXRpYWxIZWlnaHQgbm90ZXMgYmVsb3cuXG4gKlxuICogVVJMIC0gUHJvdmlkZSBhIHtzdHJpbmd9LCBhbmQgU2NlbmVyeSB3aWxsIGFzc3VtZSBpdCBpcyBhIFVSTC4gVGhpcyBjYW4gYmUgYSBub3JtYWwgVVJMLCBvciBhIGRhdGEgVVJJLCBib3RoIHdpbGxcbiAqICAgd29yay4gUGxlYXNlIG5vdGUgdGhhdCB0aGlzIGhhcyB0aGUgc2FtZSBsb2FkaW5nLW9yZGVyIGlzc3VlcyBhcyB1c2luZyBIVE1MSW1hZ2VFbGVtZW50LCBidXQgdGhhdCBpdCdzIGFsbW9zdFxuICogICBhbHdheXMgZ3VhcmFudGVlZCB0byBub3QgaGF2ZSBhIHdpZHRoL2hlaWdodCB3aGVuIHlvdSBjcmVhdGUgdGhlIEltYWdlIG5vZGUuIE5vdGUgdGhhdCBkYXRhIFVSSSBzdXBwb3J0IGZvclxuICogICBmb3JtYXRzIGRlcGVuZHMgb24gdGhlIGJyb3dzZXIgLSBvbmx5IEpQRUcgYW5kIFBORyBhcmUgc3VwcG9ydGVkIGJyb2FkbHkuIFBsZWFzZSBzZWUgaW5pdGlhbFdpZHRoL2luaXRpYWxIZWlnaHRcbiAqICAgbm90ZXMgYmVsb3cuXG4gKiAgIEFkZGl0aW9uYWxseSwgbm90ZSB0aGF0IGlmIGEgVVJMIGlzIHByb3ZpZGVkLCBhY2Nlc3NpbmcgaW1hZ2UuZ2V0SW1hZ2UoKSBvciBpbWFnZS5pbWFnZSB3aWxsIHJlc3VsdCBub3QgaW4gdGhlXG4gKiAgIG9yaWdpbmFsIFVSTCAoY3VycmVudGx5KSwgYnV0IHdpdGggdGhlIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBIVE1MSW1hZ2VFbGVtZW50LlxuICpcbiAqIEhUTUxDYW52YXNFbGVtZW50IC0gSXQncyBwb3NzaWJsZSB0byBwYXNzIGFuIEhUTUw1IENhbnZhcyBkaXJlY3RseSBpbnRvIHRoZSBJbWFnZSBub2RlLiBJdCB3aWxsIGltbWVkaWF0ZWx5IGJlXG4gKiAgIGF3YXJlIG9mIHRoZSB3aWR0aC9oZWlnaHQgKGJvdW5kcykgb2YgdGhlIENhbnZhcywgYnV0IE5PVEUgdGhhdCB0aGUgSW1hZ2Ugbm9kZSB3aWxsIG5vdCBsaXN0ZW4gdG8gQ2FudmFzIHNpemVcbiAqICAgY2hhbmdlcy4gSXQgaXMgYXNzdW1lZCB0aGF0IGFmdGVyIHlvdSBwYXNzIGluIGEgQ2FudmFzIHRvIGFuIEltYWdlIG5vZGUgdGhhdCBpdCB3aWxsIG5vdCBiZSBtb2RpZmllZCBmdXJ0aGVyLlxuICogICBBZGRpdGlvbmFsbHksIHRoZSBJbWFnZSBub2RlIHdpbGwgb25seSBiZSByZW5kZXJlZCB1c2luZyBDYW52YXMgb3IgV2ViR0wgaWYgYSBDYW52YXMgaXMgdXNlZCBhcyBpbnB1dC5cbiAqXG4gKiBNaXBtYXAgZGF0YSBzdHJ1Y3R1cmUgLSBJbWFnZSBzdXBwb3J0cyBhIG1pcG1hcCBkYXRhIHN0cnVjdHVyZSB0aGF0IHByb3ZpZGVzIHJhc3Rlcml6ZWQgbWlwbWFwIGxldmVscy4gVGhlICd0b3AnXG4gKiAgIGxldmVsIChsZXZlbCAwKSBpcyB0aGUgZW50aXJlIGZ1bGwtc2l6ZSBpbWFnZSwgYW5kIGV2ZXJ5IG90aGVyIGxldmVsIGlzIHR3aWNlIGFzIHNtYWxsIGluIGV2ZXJ5IGRpcmVjdGlvblxuICogICAofjEvNCB0aGUgcGl4ZWxzKSwgcm91bmRpbmcgZGltZW5zaW9ucyB1cC4gVGhpcyBpcyB1c2VmdWwgZm9yIGJyb3dzZXJzIHRoYXQgZGlzcGxheSB0aGUgaW1hZ2UgYmFkbHkgaWYgdGhlXG4gKiAgIGltYWdlIGlzIHRvbyBsYXJnZS4gSW5zdGVhZCwgU2NlbmVyeSB3aWxsIGR5bmFtaWNhbGx5IHBpY2sgdGhlIG1vc3QgYXBwcm9wcmlhdGUgc2l6ZSBvZiB0aGUgaW1hZ2UgdG8gdXNlLFxuICogICB3aGljaCBpbXByb3ZlcyB0aGUgaW1hZ2UgYXBwZWFyYW5jZS5cbiAqICAgVGhlIHBhc3NlZCBpbiAnaW1hZ2UnIHNob3VsZCBiZSBhbiBBcnJheSBvZiBtaXBtYXAgb2JqZWN0cyBvZiB0aGUgZm9ybWF0OlxuICogICB7XG4gKiAgICAgaW1nOiB7SFRNTEltYWdlRWxlbWVudH0sIC8vIHByZWZlcmFibHkgcHJlbG9hZGVkLCBidXQgaXQgaXNuJ3QgcmVxdWlyZWRcbiAqICAgICB1cmw6IHtzdHJpbmd9LCAvLyBVUkwgKHVzdWFsbHkgYSBkYXRhIFVSTCkgZm9yIHRoZSBpbWFnZSBsZXZlbFxuICogICAgIHdpZHRoOiB7bnVtYmVyfSwgLy8gd2lkdGggb2YgdGhlIG1pcG1hcCBsZXZlbCwgaW4gcGl4ZWxzXG4gKiAgICAgaGVpZ2h0OiB7bnVtYmVyfSAvLyBoZWlnaHQgb2YgdGhlIG1pcG1hcCBsZXZlbCwgaW4gcGl4ZWxzLFxuICogICAgIGNhbnZhczoge0hUTUxDYW52YXNFbGVtZW50fSAvLyBDYW52YXMgZWxlbWVudCBjb250YWluaW5nIHRoZSBpbWFnZSBkYXRhIGZvciB0aGUgaW1nLlxuICogICAgIFt1cGRhdGVDYW52YXNdOiB7ZnVuY3Rpb259IC8vIElmIGF2YWlsYWJsZSwgc2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgdXNpbmcgdGhlIENhbnZhcyBkaXJlY3RseS5cbiAqICAgfVxuICogICBBdCBsZWFzdCBvbmUgbGV2ZWwgaXMgcmVxdWlyZWQgKGxldmVsIDApLCBhbmQgZWFjaCBtaXBtYXAgbGV2ZWwgY29ycmVzcG9uZHMgdG8gdGhlIGluZGV4IGluIHRoZSBhcnJheSwgZS5nLjpcbiAqICAgW1xuICogICAgIGxldmVsIDAgKGZ1bGwgc2l6ZSwgZS5nLiAxMDB4NjQpXG4gKiAgICAgbGV2ZWwgMSAoaGFsZiBzaXplLCBlLmcuIDUweDMyKVxuICogICAgIGxldmVsIDIgKHF1YXJ0ZXIgc2l6ZSwgZS5nLiAyNXgxNilcbiAqICAgICBsZXZlbCAzIChlaWdodGggc2l6ZSwgZS5nLiAxM3g4IC0gbm90ZSB0aGUgcm91bmRpbmcgdXApXG4gKiAgICAgLi4uXG4gKiAgICAgbGV2ZWwgTiAoc2luZ2xlIHBpeGVsLCBlLmcuIDF4MSAtIHRoaXMgaXMgdGhlIHNtYWxsZXN0IGxldmVsIHBlcm1pdHRlZCwgYW5kIHRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSlcbiAqICAgXVxuICogICBBZGRpdGlvbmFsbHksIG5vdGUgdGhhdCAoY3VycmVudGx5KSBpbWFnZS5nZXRJbWFnZSgpIHdpbGwgcmV0dXJuIHRoZSBIVE1MSW1hZ2VFbGVtZW50IGZyb20gdGhlIGZpcnN0IGxldmVsLFxuICogICBub3QgdGhlIG1pcG1hcCBkYXRhLlxuICpcbiAqICBBbHNvIG5vdGUgdGhhdCBpZiB0aGUgdW5kZXJseWluZyBpbWFnZSAobGlrZSBDYW52YXMgZGF0YSkgaGFzIGNoYW5nZWQsIGl0IGlzIHJlY29tbWVuZGVkIHRvIGNhbGxcbiAqICBpbnZhbGlkYXRlSW1hZ2UoKSBpbnN0ZWFkIG9mIGNoYW5naW5nIHRoZSBpbWFnZSByZWZlcmVuY2UgKGNhbGxpbmcgc2V0SW1hZ2UoKSBtdWx0aXBsZSB0aW1lcylcbiAqL1xuZXhwb3J0IHR5cGUgSW1hZ2VhYmxlSW1hZ2UgPSBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTENhbnZhc0VsZW1lbnQgfCBNaXBtYXA7XG5cbi8vIFRoZSBvdXRwdXQgaW1hZ2UgdHlwZSBmcm9tIHBhcnNpbmcgdGhlIGlucHV0IFwiSW1hZ2VhYmxlSW1hZ2VcIiwgc2VlIG9uSW1hZ2VQcm9wZXJ0eUNoYW5nZSgpXG50eXBlIFBhcnNlZEltYWdlID0gSFRNTEltYWdlRWxlbWVudCB8IEhUTUxDYW52YXNFbGVtZW50O1xuXG5leHBvcnQgdHlwZSBJbWFnZWFibGVPcHRpb25zID0ge1xuICBpbWFnZT86IEltYWdlYWJsZUltYWdlO1xuICBpbWFnZVByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8SW1hZ2VhYmxlSW1hZ2U+O1xuICBpbWFnZU9wYWNpdHk/OiBudW1iZXI7XG4gIGluaXRpYWxXaWR0aD86IG51bWJlcjtcbiAgaW5pdGlhbEhlaWdodD86IG51bWJlcjtcbiAgbWlwbWFwPzogYm9vbGVhbjtcbiAgbWlwbWFwQmlhcz86IG51bWJlcjtcbiAgbWlwbWFwSW5pdGlhbExldmVsPzogbnVtYmVyO1xuICBtaXBtYXBNYXhMZXZlbD86IG51bWJlcjtcbiAgaGl0VGVzdFBpeGVscz86IGJvb2xlYW47XG59O1xuXG4vLyBOb3JtYWxseSBvdXIgcHJvamVjdCBwcmVmZXJzIHR5cGUgYWxpYXNlcyB0byBpbnRlcmZhY2VzLCBidXQgaW50ZXJmYWNlcyBhcmUgbmVjZXNzYXJ5IGZvciBjb3JyZWN0IHVzYWdlIG9mIFwidGhpc1wiLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy8xMTMyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1kZWZpbml0aW9uc1xuZXhwb3J0IGludGVyZmFjZSBUSW1hZ2VhYmxlIHtcbiAgX2ltYWdlOiBQYXJzZWRJbWFnZSB8IG51bGw7XG4gIF9pbWFnZU9wYWNpdHk6IG51bWJlcjtcbiAgX21pcG1hcDogYm9vbGVhbjtcbiAgX21pcG1hcEJpYXM6IG51bWJlcjtcbiAgX21pcG1hcEluaXRpYWxMZXZlbDogbnVtYmVyO1xuICBfbWlwbWFwTWF4TGV2ZWw6IG51bWJlcjtcbiAgX2hpdFRlc3RQaXhlbHM6IGJvb2xlYW47XG4gIF9taXBtYXBEYXRhOiBNaXBtYXAgfCBudWxsO1xuICBfaGl0VGVzdEltYWdlRGF0YTogSW1hZ2VEYXRhIHwgbnVsbDtcbiAgbWlwbWFwRW1pdHRlcjogVEVtaXR0ZXI7XG4gIGlzRGlzcG9zZWQ/OiBib29sZWFuO1xuXG4gIHNldEltYWdlKCBpbWFnZTogSW1hZ2VhYmxlSW1hZ2UgKTogdGhpcztcblxuICBzZXQgaW1hZ2UoIHZhbHVlOiBJbWFnZWFibGVJbWFnZSApO1xuXG4gIGdldCBpbWFnZSgpOiBQYXJzZWRJbWFnZTtcblxuICBnZXRJbWFnZSgpOiBQYXJzZWRJbWFnZTtcblxuICBzZXRJbWFnZVByb3BlcnR5KCBuZXdUYXJnZXQ6IFRSZWFkT25seVByb3BlcnR5PEltYWdlYWJsZUltYWdlPiB8IG51bGwgKTogbnVsbDtcblxuICBzZXQgaW1hZ2VQcm9wZXJ0eSggcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEltYWdlYWJsZUltYWdlPiB8IG51bGwgKTtcblxuICBnZXQgaW1hZ2VQcm9wZXJ0eSgpOiBUUHJvcGVydHk8SW1hZ2VhYmxlSW1hZ2U+O1xuXG4gIGdldEltYWdlUHJvcGVydHkoKTogVFByb3BlcnR5PEltYWdlYWJsZUltYWdlPjtcblxuICBpbnZhbGlkYXRlSW1hZ2UoKTogdm9pZDtcblxuICBzZXRJbWFnZVdpdGhTaXplKCBpbWFnZTogSW1hZ2VhYmxlSW1hZ2UsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IHRoaXM7XG5cbiAgc2V0SW1hZ2VPcGFjaXR5KCBpbWFnZU9wYWNpdHk6IG51bWJlciApOiB2b2lkO1xuXG4gIHNldCBpbWFnZU9wYWNpdHkoIHZhbHVlOiBudW1iZXIgKTtcblxuICBnZXQgaW1hZ2VPcGFjaXR5KCk6IG51bWJlcjtcblxuICBnZXRJbWFnZU9wYWNpdHkoKTogbnVtYmVyO1xuXG4gIHNldEluaXRpYWxXaWR0aCggd2lkdGg6IG51bWJlciApOiB0aGlzO1xuXG4gIHNldCBpbml0aWFsV2lkdGgoIHZhbHVlOiBudW1iZXIgKTtcblxuICBnZXQgaW5pdGlhbFdpZHRoKCk6IG51bWJlcjtcblxuICBnZXRJbml0aWFsV2lkdGgoKTogbnVtYmVyO1xuXG4gIHNldEluaXRpYWxIZWlnaHQoIGhlaWdodDogbnVtYmVyICk6IHRoaXM7XG5cbiAgc2V0IGluaXRpYWxIZWlnaHQoIHZhbHVlOiBudW1iZXIgKTtcblxuICBnZXQgaW5pdGlhbEhlaWdodCgpOiBudW1iZXI7XG5cbiAgZ2V0SW5pdGlhbEhlaWdodCgpOiBudW1iZXI7XG5cbiAgc2V0TWlwbWFwKCBtaXBtYXA6IGJvb2xlYW4gKTogdGhpcztcblxuICBzZXQgbWlwbWFwKCB2YWx1ZTogYm9vbGVhbiApO1xuXG4gIGdldCBtaXBtYXAoKTogYm9vbGVhbjtcblxuICBpc01pcG1hcCgpOiBib29sZWFuO1xuXG4gIHNldE1pcG1hcEJpYXMoIGJpYXM6IG51bWJlciApOiB0aGlzO1xuXG4gIHNldCBtaXBtYXBCaWFzKCB2YWx1ZTogbnVtYmVyICk7XG5cbiAgZ2V0IG1pcG1hcEJpYXMoKTogbnVtYmVyO1xuXG4gIGdldE1pcG1hcEJpYXMoKTogbnVtYmVyO1xuXG4gIHNldE1pcG1hcEluaXRpYWxMZXZlbCggbGV2ZWw6IG51bWJlciApOiB0aGlzO1xuXG4gIHNldCBtaXBtYXBJbml0aWFsTGV2ZWwoIHZhbHVlOiBudW1iZXIgKTtcblxuICBnZXQgbWlwbWFwSW5pdGlhbExldmVsKCk6IG51bWJlcjtcblxuICBnZXRNaXBtYXBJbml0aWFsTGV2ZWwoKTogbnVtYmVyO1xuXG4gIHNldE1pcG1hcE1heExldmVsKCBsZXZlbDogbnVtYmVyICk6IHRoaXM7XG5cbiAgc2V0IG1pcG1hcE1heExldmVsKCB2YWx1ZTogbnVtYmVyICk7XG5cbiAgZ2V0IG1pcG1hcE1heExldmVsKCk6IG51bWJlcjtcblxuICBnZXRNaXBtYXBNYXhMZXZlbCgpOiBudW1iZXI7XG5cbi8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gIHNldEhpdFRlc3RQaXhlbHMoIGhpdFRlc3RQaXhlbHM6IGJvb2xlYW4gKTogdGhpcztcblxuLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgc2V0IGhpdFRlc3RQaXhlbHMoIHZhbHVlOiBib29sZWFuICk7XG5cbiAgZ2V0IGhpdFRlc3RQaXhlbHMoKTogYm9vbGVhbjtcblxuICBnZXRIaXRUZXN0UGl4ZWxzKCk6IGJvb2xlYW47XG5cbiAgaW52YWxpZGF0ZU1pcG1hcHMoKTogdm9pZDtcblxuICBnZXRNaXBtYXBMZXZlbCggbWF0cml4OiBNYXRyaXgzLCBhZGRpdGlvbmFsQmlhcz86IG51bWJlciApOiBudW1iZXI7XG5cbiAgZ2V0TWlwbWFwTGV2ZWxGcm9tU2NhbGUoIHNjYWxlOiBudW1iZXIsIGFkZGl0aW9uYWxCaWFzPzogbnVtYmVyICk6IG51bWJlcjtcblxuICBnZXRNaXBtYXBDYW52YXMoIGxldmVsOiBudW1iZXIgKTogSFRNTENhbnZhc0VsZW1lbnQ7XG5cbiAgZ2V0TWlwbWFwVVJMKCBsZXZlbDogbnVtYmVyICk6IHN0cmluZztcblxuICBoYXNNaXBtYXBzKCk6IGJvb2xlYW47XG5cbiAgZ2V0SW1hZ2VXaWR0aCgpOiBudW1iZXI7XG5cbiAgZ2V0IGltYWdlV2lkdGgoKTogbnVtYmVyO1xuXG4gIGdldEltYWdlSGVpZ2h0KCk6IG51bWJlcjtcblxuICBnZXQgaW1hZ2VIZWlnaHQoKTogbnVtYmVyO1xuXG4gIGdldEltYWdlVVJMKCk6IHN0cmluZztcbn1cblxuY29uc3QgSW1hZ2VhYmxlID0gPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPiggdHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRJbWFnZWFibGU+ID0+IHtcbiAgcmV0dXJuIGNsYXNzIEltYWdlYWJsZU1peGluIGV4dGVuZHMgdHlwZSBpbXBsZW1lbnRzIFRJbWFnZWFibGUge1xuXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgb25JbWFnZVByb3BlcnR5Q2hhbmdlKClcbiAgICBwdWJsaWMgX2ltYWdlOiBQYXJzZWRJbWFnZSB8IG51bGw7XG5cbiAgICAvLyBGb3IgaW1hZ2VQcm9wZXJ0eVxuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ltYWdlUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8SW1hZ2VhYmxlSW1hZ2U+O1xuXG4gICAgLy8gSW50ZXJuYWwgc3RhdGVmdWwgdmFsdWUsIHNlZSBzZXRJbml0aWFsV2lkdGgoKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgICBwcml2YXRlIF9pbml0aWFsV2lkdGg6IG51bWJlcjtcblxuICAgIC8vIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgc2V0SW5pdGlhbEhlaWdodCgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAgIHByaXZhdGUgX2luaXRpYWxIZWlnaHQ6IG51bWJlcjtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldEltYWdlT3BhY2l0eSgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAgIHB1YmxpYyBfaW1hZ2VPcGFjaXR5OiBudW1iZXI7XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgSW50ZXJuYWwgc3RhdGVmdWwgdmFsdWUsIHNlZSBzZXRNaXBtYXAoKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgICBwdWJsaWMgX21pcG1hcDogYm9vbGVhbjtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldE1pcG1hcEJpYXMoKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgICBwdWJsaWMgX21pcG1hcEJpYXM6IG51bWJlcjtcblxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldE1pcG1hcEluaXRpYWxMZXZlbCgpIGZvciBkb2N1bWVudGF0aW9uLlxuICAgIHB1YmxpYyBfbWlwbWFwSW5pdGlhbExldmVsOiBudW1iZXI7XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgSW50ZXJuYWwgc3RhdGVmdWwgdmFsdWUsIHNlZSBzZXRNaXBtYXBNYXhMZXZlbCgpIGZvciBkb2N1bWVudGF0aW9uXG4gICAgcHVibGljIF9taXBtYXBNYXhMZXZlbDogbnVtYmVyO1xuXG4gICAgLy8gSW50ZXJuYWwgc3RhdGVmdWwgdmFsdWUsIHNlZSBzZXRIaXRUZXN0UGl4ZWxzKCkgZm9yIGRvY3VtZW50YXRpb24uXG4gICAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICBwdWJsaWMgX2hpdFRlc3RQaXhlbHM6IGJvb2xlYW47XG5cbiAgICAvLyBBcnJheSBvZiBDYW52YXNlcyBmb3IgZWFjaCBsZXZlbCwgY29uc3RydWN0ZWQgaW50ZXJuYWxseSBzbyB0aGF0IENhbnZhcy1iYXNlZCBkcmF3YWJsZXMgKENhbnZhcywgV2ViR0wpIGNhbiBxdWlja2x5IGRyYXcgbWlwbWFwcy5cbiAgICBwcml2YXRlIF9taXBtYXBDYW52YXNlczogSFRNTENhbnZhc0VsZW1lbnRbXTtcblxuICAgIC8vIEFycmF5IG9mIFVSTHMgZm9yIGVhY2ggbGV2ZWwsIHdoZXJlIGVhY2ggVVJMIHdpbGwgZGlzcGxheSBhbiBpbWFnZSAoYW5kIGlzIHR5cGljYWxseSBhIGRhdGEgVVJJIG9yIGJsb2IgVVJJKSwgc29cbiAgICAvLyB0aGF0IHdlIGNhbiBoYW5kbGUgbWlwbWFwcyBpbiBTVkcgd2hlcmUgVVJMcyBhcmUgcmVxdWlyZWQuXG4gICAgcHJpdmF0ZSBfbWlwbWFwVVJMczogc3RyaW5nW107XG5cbiAgICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgTWlwbWFwIGRhdGEgaWYgaXQgaXMgcGFzc2VkIGludG8gb3VyIGltYWdlLiBXaWxsIGJlIHN0b3JlZCBoZXJlIGZvciBwcm9jZXNzaW5nXG4gICAgcHVibGljIF9taXBtYXBEYXRhOiBNaXBtYXAgfCBudWxsO1xuXG4gICAgLy8gTGlzdGVuZXIgZm9yIGludmFsaWRhdGluZyBvdXIgYm91bmRzIHdoZW5ldmVyIGFuIGltYWdlIGlzIGludmFsaWRhdGVkLlxuICAgIHByaXZhdGUgX2ltYWdlTG9hZExpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gICAgLy8gV2hldGhlciBvdXIgX2ltYWdlTG9hZExpc3RlbmVyIGhhcyBiZWVuIGF0dGFjaGVkIGFzIGEgbGlzdGVuZXIgdG8gdGhlIGN1cnJlbnQgaW1hZ2UuXG4gICAgcHJpdmF0ZSBfaW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZDogYm9vbGVhbjtcblxuICAgIC8vIFVzZWQgZm9yIHBpeGVsIGhpdCB0ZXN0aW5nLlxuICAgIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gICAgcHVibGljIF9oaXRUZXN0SW1hZ2VEYXRhOiBJbWFnZURhdGEgfCBudWxsO1xuXG4gICAgLy8gRW1pdHMgd2hlbiBtaXBtYXBzIGFyZSAocmUpZ2VuZXJhdGVkXG4gICAgcHVibGljIG1pcG1hcEVtaXR0ZXI6IFRFbWl0dGVyO1xuXG4gICAgLy8gRm9yIGNvbXBhdGliaWxpdHlcbiAgICBwdWJsaWMgaXNEaXNwb3NlZD86IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKSB7XG5cbiAgICAgIHN1cGVyKCAuLi5hcmdzICk7XG5cbiAgICAgIC8vIFdlJ2xsIGluaXRpYWxpemUgdGhpcyBieSBtdXRhdGluZy5cbiAgICAgIHRoaXMuX2ltYWdlUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSggbnVsbCBhcyB1bmtub3duIGFzIEltYWdlYWJsZUltYWdlLCBmYWxzZSwgdGhpcy5vbkltYWdlUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XG5cbiAgICAgIHRoaXMuX2ltYWdlID0gbnVsbDtcbiAgICAgIHRoaXMuX2luaXRpYWxXaWR0aCA9IERFRkFVTFRfT1BUSU9OUy5pbml0aWFsV2lkdGg7XG4gICAgICB0aGlzLl9pbml0aWFsSGVpZ2h0ID0gREVGQVVMVF9PUFRJT05TLmluaXRpYWxIZWlnaHQ7XG4gICAgICB0aGlzLl9pbWFnZU9wYWNpdHkgPSBERUZBVUxUX09QVElPTlMuaW1hZ2VPcGFjaXR5O1xuICAgICAgdGhpcy5fbWlwbWFwID0gREVGQVVMVF9PUFRJT05TLm1pcG1hcDtcbiAgICAgIHRoaXMuX21pcG1hcEJpYXMgPSBERUZBVUxUX09QVElPTlMubWlwbWFwQmlhcztcbiAgICAgIHRoaXMuX21pcG1hcEluaXRpYWxMZXZlbCA9IERFRkFVTFRfT1BUSU9OUy5taXBtYXBJbml0aWFsTGV2ZWw7XG4gICAgICB0aGlzLl9taXBtYXBNYXhMZXZlbCA9IERFRkFVTFRfT1BUSU9OUy5taXBtYXBNYXhMZXZlbDtcbiAgICAgIHRoaXMuX2hpdFRlc3RQaXhlbHMgPSBERUZBVUxUX09QVElPTlMuaGl0VGVzdFBpeGVscztcbiAgICAgIHRoaXMuX21pcG1hcENhbnZhc2VzID0gW107XG4gICAgICB0aGlzLl9taXBtYXBVUkxzID0gW107XG4gICAgICB0aGlzLl9taXBtYXBEYXRhID0gbnVsbDtcbiAgICAgIHRoaXMuX2ltYWdlTG9hZExpc3RlbmVyID0gdGhpcy5fb25JbWFnZUxvYWQuYmluZCggdGhpcyApO1xuICAgICAgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5faGl0VGVzdEltYWdlRGF0YSA9IG51bGw7XG4gICAgICB0aGlzLm1pcG1hcEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjdXJyZW50IGltYWdlIHRvIGJlIGRpc3BsYXllZCBieSB0aGlzIEltYWdlIG5vZGUuIFNlZSBJbWFnZWFibGVJbWFnZSBmb3IgZGV0YWlscyBvbiBwcm92aWRlZCBpbWFnZSB2YWx1ZS5cbiAgICAgKlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRJbWFnZSggaW1hZ2U6IEltYWdlYWJsZUltYWdlICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW1hZ2UsICdpbWFnZSBzaG91bGQgYmUgYXZhaWxhYmxlJyApO1xuXG4gICAgICB0aGlzLl9pbWFnZVByb3BlcnR5LnZhbHVlID0gaW1hZ2U7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgaW1hZ2UoIHZhbHVlOiBJbWFnZWFibGVJbWFnZSApIHsgdGhpcy5zZXRJbWFnZSggdmFsdWUgKTsgfVxuXG4gICAgcHVibGljIGdldCBpbWFnZSgpOiBQYXJzZWRJbWFnZSB7IHJldHVybiB0aGlzLmdldEltYWdlKCk7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgaW1hZ2UncyByZXByZXNlbnRhdGlvbiBhcyBlaXRoZXIgYSBDYW52YXMgb3IgaW1nIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBOT1RFOiBJZiBhIFVSTCBvciBtaXBtYXAgZGF0YSB3YXMgcHJvdmlkZWQsIHRoaXMgY3VycmVudGx5IGRvZXNuJ3QgcmV0dXJuIHRoZSBvcmlnaW5hbCBpbnB1dCB0byBzZXRJbWFnZSgpLCBidXRcbiAgICAgKiAgICAgICBpbnN0ZWFkIHByb3ZpZGVzIHRoZSBtYXBwZWQgcmVzdWx0IChvciBmaXJzdCBtaXBtYXAgbGV2ZWwncyBpbWFnZSkuIElmIHlvdSBuZWVkIHRoZSBvcmlnaW5hbCwgdXNlXG4gICAgICogICAgICAgaW1hZ2VQcm9wZXJ0eSBpbnN0ZWFkLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbWFnZSgpOiBQYXJzZWRJbWFnZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbWFnZSAhPT0gbnVsbCApO1xuXG4gICAgICByZXR1cm4gdGhpcy5faW1hZ2UhO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25JbWFnZVByb3BlcnR5Q2hhbmdlKCBpbWFnZTogSW1hZ2VhYmxlSW1hZ2UgKTogdm9pZCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbWFnZSwgJ2ltYWdlIHNob3VsZCBiZSBhdmFpbGFibGUnICk7XG5cbiAgICAgIC8vIEdlbmVyYWxseSwgaWYgYSBkaWZmZXJlbnQgdmFsdWUgZm9yIGltYWdlIGlzIHByb3ZpZGVkLCBpdCBoYXMgY2hhbmdlZFxuICAgICAgbGV0IGhhc0ltYWdlQ2hhbmdlZCA9IHRoaXMuX2ltYWdlICE9PSBpbWFnZTtcblxuICAgICAgLy8gRXhjZXB0IGluIHNvbWUgY2FzZXMsIHdoZXJlIHRoZSBwcm92aWRlZCBpbWFnZSBpcyBhIHN0cmluZy4gSWYgb3VyIGN1cnJlbnQgaW1hZ2UgaGFzIHRoZSBzYW1lIC5zcmMgYXMgdGhlXG4gICAgICAvLyBcIm5ld1wiIGltYWdlLCBpdCdzIGJhc2ljYWxseSB0aGUgc2FtZSAoYXMgd2UgcHJvbW90ZSBzdHJpbmcgaW1hZ2VzIHRvIEhUTUxJbWFnZUVsZW1lbnRzKS5cbiAgICAgIGlmICggaGFzSW1hZ2VDaGFuZ2VkICYmIHR5cGVvZiBpbWFnZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5faW1hZ2UgJiYgdGhpcy5faW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ICYmIGltYWdlID09PSB0aGlzLl9pbWFnZS5zcmMgKSB7XG4gICAgICAgIGhhc0ltYWdlQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBPciBpZiBvdXIgY3VycmVudCBtaXBtYXAgZGF0YSBpcyB0aGUgc2FtZSBhcyB0aGUgaW5wdXQsIHRoZW4gd2UgYXJlbid0IGNoYW5naW5nIGl0XG4gICAgICBpZiAoIGhhc0ltYWdlQ2hhbmdlZCAmJiBpbWFnZSA9PT0gdGhpcy5fbWlwbWFwRGF0YSApIHtcbiAgICAgICAgaGFzSW1hZ2VDaGFuZ2VkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICggaGFzSW1hZ2VDaGFuZ2VkICkge1xuICAgICAgICAvLyBSZXNldCB0aGUgaW5pdGlhbCBkaW1lbnNpb25zLCBzaW5jZSB3ZSBoYXZlIGEgbmV3IGltYWdlIHRoYXQgbWF5IGhhdmUgZGlmZmVyZW50IGRpbWVuc2lvbnMuXG4gICAgICAgIHRoaXMuX2luaXRpYWxXaWR0aCA9IDA7XG4gICAgICAgIHRoaXMuX2luaXRpYWxIZWlnaHQgPSAwO1xuXG4gICAgICAgIC8vIERvbid0IGxlYWsgbWVtb3J5IGJ5IHJlZmVyZW5jaW5nIG9sZCBpbWFnZXNcbiAgICAgICAgaWYgKCB0aGlzLl9pbWFnZSAmJiB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkICkge1xuICAgICAgICAgIHRoaXMuX2RldGFjaEltYWdlTG9hZExpc3RlbmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhciBvbGQgbWlwbWFwIGRhdGEgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLl9taXBtYXBEYXRhID0gbnVsbDtcblxuICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyA9PiBIVE1MSW1hZ2VFbGVtZW50XG4gICAgICAgIGlmICggdHlwZW9mIGltYWdlID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAvLyBjcmVhdGUgYW4gaW1hZ2Ugd2l0aCB0aGUgYXNzdW1lZCBVUkxcbiAgICAgICAgICBjb25zdCBzcmMgPSBpbWFnZTtcbiAgICAgICAgICBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbWcnICk7XG4gICAgICAgICAgaW1hZ2Uuc3JjID0gc3JjO1xuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZSB0aGUgcHJvdmlkZWQgbWlwbWFwXG4gICAgICAgIGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBpbWFnZSApICkge1xuICAgICAgICAgIC8vIG1pcG1hcCBkYXRhIVxuICAgICAgICAgIHRoaXMuX21pcG1hcERhdGEgPSBpbWFnZTtcbiAgICAgICAgICBpbWFnZSA9IGltYWdlWyAwIF0uaW1nITsgLy8gcHJlc3VtZXMgd2UgYXJlIGFscmVhZHkgbG9hZGVkXG5cbiAgICAgICAgICAvLyBmb3JjZSBpbml0aWFsaXphdGlvbiBvZiBtaXBtYXBwaW5nIHBhcmFtZXRlcnMsIHNpbmNlIGludmFsaWRhdGVNaXBtYXBzKCkgaXMgZ3VhcmFudGVlZCB0byBydW4gYmVsb3dcbiAgICAgICAgICB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWwgPSB0aGlzLl9taXBtYXBNYXhMZXZlbCA9IHRoaXMuX21pcG1hcERhdGEubGVuZ3RoO1xuICAgICAgICAgIHRoaXMuX21pcG1hcCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBydWxlZCBvdXQgdGhlIHN0cmluZyB8IE1pcG1hcCBjYXNlcyBhYm92ZVxuICAgICAgICB0aGlzLl9pbWFnZSA9IGltYWdlO1xuXG4gICAgICAgIC8vIElmIG91ciBpbWFnZSBpcyBhbiBIVE1MIGltYWdlIHRoYXQgaGFzbid0IGxvYWRlZCB5ZXQsIGF0dGFjaCBhIGxvYWQgbGlzdGVuZXIuXG4gICAgICAgIGlmICggdGhpcy5faW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ICYmICggIXRoaXMuX2ltYWdlLndpZHRoIHx8ICF0aGlzLl9pbWFnZS5oZWlnaHQgKSApIHtcbiAgICAgICAgICB0aGlzLl9hdHRhY2hJbWFnZUxvYWRMaXN0ZW5lcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IHJlY29tcHV0aW5nIGJvdW5kcyAobWF5IGdpdmUgYSAweDAgaWYgd2UgYXJlbid0IHlldCBsb2FkZWQpXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUltYWdlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VlIGRvY3VtZW50YXRpb24gZm9yIE5vZGUuc2V0VmlzaWJsZVByb3BlcnR5LCBleGNlcHQgdGhpcyBpcyBmb3IgdGhlIGltYWdlXG4gICAgICovXG4gICAgcHVibGljIHNldEltYWdlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8SW1hZ2VhYmxlSW1hZ2U+IHwgbnVsbCApOiBudWxsIHtcbiAgICAgIC8vIFRoaXMgaXMgYXdrd2FyZCwgd2UgYXJlIE5PVCBndWFyYW50ZWVkIGEgTm9kZS5cbiAgICAgIHJldHVybiB0aGlzLl9pbWFnZVByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCBuZXdUYXJnZXQgYXMgVFByb3BlcnR5PEltYWdlYWJsZUltYWdlPiApO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgaW1hZ2VQcm9wZXJ0eSggcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEltYWdlYWJsZUltYWdlPiB8IG51bGwgKSB7IHRoaXMuc2V0SW1hZ2VQcm9wZXJ0eSggcHJvcGVydHkgKTsgfVxuXG4gICAgcHVibGljIGdldCBpbWFnZVByb3BlcnR5KCk6IFRQcm9wZXJ0eTxJbWFnZWFibGVJbWFnZT4geyByZXR1cm4gdGhpcy5nZXRJbWFnZVByb3BlcnR5KCk7IH1cblxuICAgIC8qKlxuICAgICAqIExpa2UgTm9kZS5nZXRWaXNpYmxlUHJvcGVydHkoKSwgYnV0IGZvciB0aGUgaW1hZ2UuIE5vdGUgdGhpcyBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIFByb3BlcnR5IHByb3ZpZGVkIGluXG4gICAgICogc2V0SW1hZ2VQcm9wZXJ0eS4gVGh1cyBpcyB0aGUgbmF0dXJlIG9mIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkuXG4gICAgICovXG4gICAgcHVibGljIGdldEltYWdlUHJvcGVydHkoKTogVFByb3BlcnR5PEltYWdlYWJsZUltYWdlPiB7XG4gICAgICByZXR1cm4gdGhpcy5faW1hZ2VQcm9wZXJ0eTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIHRoZSBpbWFnZSdzIGJvdW5kcyBhbmQgcmVmcmVzaGVzIGFueSBkaXNwbGF5cyBvdXRwdXQgb2YgdGhlIGltYWdlLlxuICAgICAqXG4gICAgICogR2VuZXJhbGx5IHRoaXMgY2FuIHRyaWdnZXIgcmVjb21wdXRhdGlvbiBvZiBtaXBtYXBzLCB3aWxsIG1hcmsgYW55IGRyYXdhYmxlcyBhcyBuZWVkaW5nIHJlcGFpbnRzLCBhbmQgd2lsbFxuICAgICAqIGNhdXNlIGEgc3ByaXRlc2hlZXQgY2hhbmdlIGZvciBXZWJHTC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2hvdWxkIGJlIGRvbmUgd2hlbiB0aGUgdW5kZXJseWluZyBpbWFnZSBoYXMgY2hhbmdlZCBhcHBlYXJhbmNlICh1c3VhbGx5IHRoZSBjYXNlIHdpdGggYSBDYW52YXMgY2hhbmdpbmcsXG4gICAgICogYnV0IHRoaXMgaXMgYWxzbyB0cmlnZ2VyZWQgYnkgb3VyIGFjdHVhbCBpbWFnZSByZWZlcmVuY2UgY2hhbmdpbmcpLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnZhbGlkYXRlSW1hZ2UoKTogdm9pZCB7XG4gICAgICB0aGlzLmludmFsaWRhdGVNaXBtYXBzKCk7XG4gICAgICB0aGlzLl9pbnZhbGlkYXRlSGl0VGVzdERhdGEoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBpbWFnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgZGltZW5zaW9ucyB1c2VkIGJlZm9yZSB0aGUgaW1hZ2UgaGFzIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgc2V0SW1hZ2UoKSwgYnV0IGFsc28gdXBkYXRlcyB0aGUgaW5pdGlhbCBkaW1lbnNpb25zLiBTZWUgc2V0SW1hZ2UoKSdzXG4gICAgICogZG9jdW1lbnRhdGlvbiBmb3IgZGV0YWlscyBvbiB0aGUgaW1hZ2UgcGFyYW1ldGVyLlxuICAgICAqXG4gICAgICogTk9URTogc2V0SW1hZ2UoKSB3aWxsIGZpcnN0IHJlc2V0IHRoZSBpbml0aWFsIGRpbWVuc2lvbnMgdG8gMCwgd2hpY2ggd2lsbCB0aGVuIGJlIG92ZXJyaWRkZW4gbGF0ZXIgaW4gdGhpc1xuICAgICAqICAgICAgIGZ1bmN0aW9uLiBUaGlzIG1heSB0cmlnZ2VyIGJvdW5kcyBjaGFuZ2VzLCBldmVuIGlmIHRoZSBwcmV2aW91cyBhbmQgbmV4dCBpbWFnZSAoYW5kIGltYWdlIGRpbWVuc2lvbnMpXG4gICAgICogICAgICAgYXJlIHRoZSBzYW1lLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltYWdlIC0gU2VlIEltYWdlYWJsZUltYWdlJ3MgdHlwZSBkb2N1bWVudGF0aW9uXG4gICAgICogQHBhcmFtIHdpZHRoIC0gSW5pdGlhbCB3aWR0aCBvZiB0aGUgaW1hZ2UuIFNlZSBzZXRJbml0aWFsV2lkdGgoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICAgICogQHBhcmFtIGhlaWdodCAtIEluaXRpYWwgaGVpZ2h0IG9mIHRoZSBpbWFnZS4gU2VlIHNldEluaXRpYWxIZWlnaHQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICAgICovXG4gICAgcHVibGljIHNldEltYWdlV2l0aFNpemUoIGltYWdlOiBJbWFnZWFibGVJbWFnZSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XG4gICAgICAvLyBGaXJzdCwgc2V0SW1hZ2UoKSwgYXMgaXQgd2lsbCByZXNldCB0aGUgaW5pdGlhbCB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICB0aGlzLnNldEltYWdlKCBpbWFnZSApO1xuXG4gICAgICAvLyBUaGVuIGFwcGx5IHRoZSBpbml0aWFsIGRpbWVuc2lvbnNcbiAgICAgIHRoaXMuc2V0SW5pdGlhbFdpZHRoKCB3aWR0aCApO1xuICAgICAgdGhpcy5zZXRJbml0aWFsSGVpZ2h0KCBoZWlnaHQgKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhbiBvcGFjaXR5IHRoYXQgaXMgYXBwbGllZCBvbmx5IHRvIHRoaXMgaW1hZ2UgKHdpbGwgbm90IGFmZmVjdCBjaGlsZHJlbiBvciB0aGUgcmVzdCBvZiB0aGUgbm9kZSdzIHN1YnRyZWUpLlxuICAgICAqXG4gICAgICogVGhpcyBzaG91bGQgZ2VuZXJhbGx5IGJlIHByZWZlcnJlZCBvdmVyIE5vZGUncyBvcGFjaXR5IGlmIGl0IGhhcyB0aGUgc2FtZSByZXN1bHQsIGFzIG1vZGlmeWluZyB0aGlzIHdpbGwgYmUgbXVjaFxuICAgICAqIGZhc3RlciwgYW5kIHdpbGwgbm90IGZvcmNlIGFkZGl0aW9uYWwgQ2FudmFzZXMgb3IgaW50ZXJtZWRpYXRlIHN0ZXBzIGluIGRpc3BsYXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1hZ2VPcGFjaXR5IC0gU2hvdWxkIGJlIGEgbnVtYmVyIGJldHdlZW4gMCAodHJhbnNwYXJlbnQpIGFuZCAxIChvcGFxdWUpLCBqdXN0IGxpa2Ugbm9ybWFsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHkuXG4gICAgICovXG4gICAgcHVibGljIHNldEltYWdlT3BhY2l0eSggaW1hZ2VPcGFjaXR5OiBudW1iZXIgKTogdm9pZCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggaW1hZ2VPcGFjaXR5ICkgJiYgaW1hZ2VPcGFjaXR5ID49IDAgJiYgaW1hZ2VPcGFjaXR5IDw9IDEsXG4gICAgICAgIGBpbWFnZU9wYWNpdHkgb3V0IG9mIHJhbmdlOiAke2ltYWdlT3BhY2l0eX1gICk7XG5cbiAgICAgIGlmICggdGhpcy5faW1hZ2VPcGFjaXR5ICE9PSBpbWFnZU9wYWNpdHkgKSB7XG4gICAgICAgIHRoaXMuX2ltYWdlT3BhY2l0eSA9IGltYWdlT3BhY2l0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGltYWdlT3BhY2l0eSggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRJbWFnZU9wYWNpdHkoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgaW1hZ2VPcGFjaXR5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEltYWdlT3BhY2l0eSgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBvcGFjaXR5IGFwcGxpZWQgb25seSB0byB0aGlzIGltYWdlIChub3QgaW5jbHVkaW5nIGNoaWxkcmVuKS5cbiAgICAgKlxuICAgICAqIFNlZSBzZXRJbWFnZU9wYWNpdHkoKSBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbWFnZU9wYWNpdHkoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbWFnZU9wYWNpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYW4gaW5pdGlhbCB3aWR0aCBmb3IgYW4gaW1hZ2UgdGhhdCBoYXMgbm90IGxvYWRlZCB5ZXQuXG4gICAgICpcbiAgICAgKiBJZiB0aGUgaW5wdXQgaW1hZ2UgaGFzbid0IGxvYWRlZCB5ZXQsIGJ1dCB0aGUgKGV4cGVjdGVkKSBzaXplIGlzIGtub3duLCBwcm92aWRpbmcgYW4gaW5pdGlhbFdpZHRoIHdpbGwgY2F1c2UgdGhlXG4gICAgICogSW1hZ2Ugbm9kZSB0byBoYXZlIHRoZSBjb3JyZWN0IGJvdW5kcyAod2lkdGgpIGJlZm9yZSB0aGUgcGl4ZWwgZGF0YSBoYXMgYmVlbiBmdWxseSBsb2FkZWQuIEEgdmFsdWUgb2YgMCB3aWxsIGJlXG4gICAgICogaWdub3JlZC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgcmVxdWlyZWQgZm9yIG1hbnkgYnJvd3NlcnMsIGFzIGltYWdlcyBjYW4gc2hvdyB1cCBhcyBhIDB4MCAobGlrZSBTYWZhcmkgZG9lcyBmb3IgdW5sb2FkZWQgaW1hZ2VzKS5cbiAgICAgKlxuICAgICAqIE5PVEU6IHNldEltYWdlIHdpbGwgcmVzZXQgdGhpcyB2YWx1ZSB0byAwIChpZ25vcmVkKSwgc2luY2UgaXQncyBwb3RlbnRpYWxseSBsaWtlbHkgdGhlIG5ldyBpbWFnZSBoYXMgZGlmZmVyZW50XG4gICAgICogICAgICAgZGltZW5zaW9ucyB0aGFuIHRoZSBjdXJyZW50IGltYWdlLlxuICAgICAqXG4gICAgICogTk9URTogSWYgdGhlc2UgZGltZW5zaW9ucyBlbmQgdXAgYmVpbmcgZGlmZmVyZW50IHRoYW4gdGhlIGFjdHVhbCBpbWFnZSB3aWR0aC9oZWlnaHQgb25jZSBpdCBoYXMgYmVlbiBsb2FkZWQsIGFuXG4gICAgICogICAgICAgYXNzZXJ0aW9uIHdpbGwgZmFpbC4gT25seSB0aGUgY29ycmVjdCBkaW1lbnNpb25zIHNob3VsZCBiZSBwcm92aWRlZC4gSWYgdGhlIHdpZHRoL2hlaWdodCBpcyB1bmtub3duLFxuICAgICAqICAgICAgIHBsZWFzZSB1c2UgdGhlIGxvY2FsQm91bmRzIG92ZXJyaWRlIG9yIGEgdHJhbnNwYXJlbnQgcmVjdGFuZ2xlIGZvciB0YWtpbmcgdXAgdGhlIChhcHByb3hpbWF0ZSkgYm91bmRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHdpZHRoIC0gRXhwZWN0ZWQgd2lkdGggb2YgdGhlIGltYWdlJ3MgdW5sb2FkZWQgY29udGVudFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRJbml0aWFsV2lkdGgoIHdpZHRoOiBudW1iZXIgKTogdGhpcyB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxID09PSAwICksICdpbml0aWFsV2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG5cbiAgICAgIGlmICggd2lkdGggIT09IHRoaXMuX2luaXRpYWxXaWR0aCApIHtcbiAgICAgICAgdGhpcy5faW5pdGlhbFdpZHRoID0gd2lkdGg7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlSW1hZ2UoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBpbml0aWFsV2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0SW5pdGlhbFdpZHRoKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGluaXRpYWxXaWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRJbml0aWFsV2lkdGgoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5pdGlhbFdpZHRoIHZhbHVlIHNldCBmcm9tIHNldEluaXRpYWxXaWR0aCgpLlxuICAgICAqXG4gICAgICogU2VlIHNldEluaXRpYWxXaWR0aCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uIEEgdmFsdWUgb2YgMCBpcyBpZ25vcmVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRJbml0aWFsV2lkdGgoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsV2lkdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvdmlkZXMgYW4gaW5pdGlhbCBoZWlnaHQgZm9yIGFuIGltYWdlIHRoYXQgaGFzIG5vdCBsb2FkZWQgeWV0LlxuICAgICAqXG4gICAgICogSWYgdGhlIGlucHV0IGltYWdlIGhhc24ndCBsb2FkZWQgeWV0LCBidXQgdGhlIChleHBlY3RlZCkgc2l6ZSBpcyBrbm93biwgcHJvdmlkaW5nIGFuIGluaXRpYWxXaWR0aCB3aWxsIGNhdXNlIHRoZVxuICAgICAqIEltYWdlIG5vZGUgdG8gaGF2ZSB0aGUgY29ycmVjdCBib3VuZHMgKGhlaWdodCkgYmVmb3JlIHRoZSBwaXhlbCBkYXRhIGhhcyBiZWVuIGZ1bGx5IGxvYWRlZC4gQSB2YWx1ZSBvZiAwIHdpbGwgYmVcbiAgICAgKiBpZ25vcmVkLlxuICAgICAqXG4gICAgICogVGhpcyBpcyByZXF1aXJlZCBmb3IgbWFueSBicm93c2VycywgYXMgaW1hZ2VzIGNhbiBzaG93IHVwIGFzIGEgMHgwIChsaWtlIFNhZmFyaSBkb2VzIGZvciB1bmxvYWRlZCBpbWFnZXMpLlxuICAgICAqXG4gICAgICogTk9URTogc2V0SW1hZ2Ugd2lsbCByZXNldCB0aGlzIHZhbHVlIHRvIDAgKGlnbm9yZWQpLCBzaW5jZSBpdCdzIHBvdGVudGlhbGx5IGxpa2VseSB0aGUgbmV3IGltYWdlIGhhcyBkaWZmZXJlbnRcbiAgICAgKiAgICAgICBkaW1lbnNpb25zIHRoYW4gdGhlIGN1cnJlbnQgaW1hZ2UuXG4gICAgICpcbiAgICAgKiBOT1RFOiBJZiB0aGVzZSBkaW1lbnNpb25zIGVuZCB1cCBiZWluZyBkaWZmZXJlbnQgdGhhbiB0aGUgYWN0dWFsIGltYWdlIHdpZHRoL2hlaWdodCBvbmNlIGl0IGhhcyBiZWVuIGxvYWRlZCwgYW5cbiAgICAgKiAgICAgICBhc3NlcnRpb24gd2lsbCBmYWlsLiBPbmx5IHRoZSBjb3JyZWN0IGRpbWVuc2lvbnMgc2hvdWxkIGJlIHByb3ZpZGVkLiBJZiB0aGUgd2lkdGgvaGVpZ2h0IGlzIHVua25vd24sXG4gICAgICogICAgICAgcGxlYXNlIHVzZSB0aGUgbG9jYWxCb3VuZHMgb3ZlcnJpZGUgb3IgYSB0cmFuc3BhcmVudCByZWN0YW5nbGUgZm9yIHRha2luZyB1cCB0aGUgKGFwcHJveGltYXRlKSBib3VuZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaGVpZ2h0IC0gRXhwZWN0ZWQgaGVpZ2h0IG9mIHRoZSBpbWFnZSdzIHVubG9hZGVkIGNvbnRlbnRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0SW5pdGlhbEhlaWdodCggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgPT09IDAgKSwgJ2luaXRpYWxIZWlnaHQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG5cbiAgICAgIGlmICggaGVpZ2h0ICE9PSB0aGlzLl9pbml0aWFsSGVpZ2h0ICkge1xuICAgICAgICB0aGlzLl9pbml0aWFsSGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUltYWdlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgaW5pdGlhbEhlaWdodCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRJbml0aWFsSGVpZ2h0KCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGluaXRpYWxIZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0SW5pdGlhbEhlaWdodCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbml0aWFsSGVpZ2h0IHZhbHVlIHNldCBmcm9tIHNldEluaXRpYWxIZWlnaHQoKS5cbiAgICAgKlxuICAgICAqIFNlZSBzZXRJbml0aWFsSGVpZ2h0KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi4gQSB2YWx1ZSBvZiAwIGlzIGlnbm9yZWQuXG4gICAgICovXG4gICAgcHVibGljIGdldEluaXRpYWxIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsSGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgd2hldGhlciBtaXBtYXBwaW5nIGlzIHN1cHBvcnRlZC5cbiAgICAgKlxuICAgICAqIFRoaXMgZGVmYXVsdHMgdG8gZmFsc2UsIGJ1dCBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlIHdoZW4gYSBtaXBtYXAgaXMgcHJvdmlkZWQgdG8gc2V0SW1hZ2UoKS4gU2V0dGluZyBpdCB0b1xuICAgICAqIHRydWUgb24gbm9uLW1pcG1hcCBpbWFnZXMgd2lsbCB0cmlnZ2VyIGNyZWF0aW9uIG9mIGEgbWVkaXVtLXF1YWxpdHkgbWlwbWFwIHRoYXQgd2lsbCBiZSB1c2VkLlxuICAgICAqXG4gICAgICogTk9URTogVGhpcyBtaXBtYXAgZ2VuZXJhdGlvbiBpcyBzbG93IGFuZCBDUFUtaW50ZW5zaXZlLiBQcm92aWRpbmcgcHJlY29tcHV0ZWQgbWlwbWFwIHJlc291cmNlcyB0byBhbiBJbWFnZSBub2RlXG4gICAgICogICAgICAgd2lsbCBiZSBtdWNoIGZhc3RlciwgYW5kIG9mIGhpZ2hlciBxdWFsaXR5LlxuICAgICAqXG4gICAgICogQHBhcmFtIG1pcG1hcCAtIFdoZXRoZXIgbWlwbWFwcGluZyBpcyBzdXBwb3J0ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TWlwbWFwKCBtaXBtYXA6IGJvb2xlYW4gKTogdGhpcyB7XG4gICAgICBpZiAoIHRoaXMuX21pcG1hcCAhPT0gbWlwbWFwICkge1xuICAgICAgICB0aGlzLl9taXBtYXAgPSBtaXBtYXA7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlTWlwbWFwcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG1pcG1hcCggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0TWlwbWFwKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IG1pcG1hcCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNNaXBtYXAoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIG1pcG1hcHBpbmcgaXMgc3VwcG9ydGVkLlxuICAgICAqXG4gICAgICogU2VlIHNldE1pcG1hcCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGlzTWlwbWFwKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRoaXMuX21pcG1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGhvdyBtdWNoIGxldmVsLW9mLWRldGFpbCBpcyBkaXNwbGF5ZWQgZm9yIG1pcG1hcHBpbmcuXG4gICAgICpcbiAgICAgKiBXaGVuIGRpc3BsYXlpbmcgbWlwbWFwcGVkIGltYWdlcyBhcyBvdXRwdXQsIGEgY2VydGFpbiBzb3VyY2UgbGV2ZWwgb2YgdGhlIG1pcG1hcCBuZWVkcyB0byBiZSB1c2VkLiBVc2luZyBhIGxldmVsXG4gICAgICogd2l0aCB0b28gbXVjaCByZXNvbHV0aW9uIGNhbiBjcmVhdGUgYW4gYWxpYXNlZCBsb29rIChidXQgd2lsbCBnZW5lcmFsbHkgYmUgc2hhcnBlcikuIFVzaW5nIGEgbGV2ZWwgd2l0aCB0b29cbiAgICAgKiBsaXR0bGUgcmVzb2x1dGlvbiB3aWxsIGJlIGJsdXJyaWVyIChidXQgbm90IGFsaWFzZWQpLlxuICAgICAqXG4gICAgICogVGhlIHZhbHVlIG9mIHRoZSBtaXBtYXAgYmlhcyBpcyBhZGRlZCBvbiB0byB0aGUgY29tcHV0ZWQgXCJpZGVhbFwiIG1pcG1hcCBsZXZlbCwgYW5kOlxuICAgICAqIC0gQSBuZWdhdGl2ZSBiaWFzIHdpbGwgdHlwaWNhbGx5IGluY3JlYXNlIHRoZSBkaXNwbGF5ZWQgcmVzb2x1dGlvblxuICAgICAqIC0gQSBwb3NpdGl2ZSBiaWFzIHdpbGwgdHlwaWNhbGx5IGRlY3JlYXNlIHRoZSBkaXNwbGF5ZWQgcmVzb2x1dGlvblxuICAgICAqXG4gICAgICogVGhpcyBpcyBkb25lIGFwcHJveGltYXRlbHkgbGlrZSB0aGUgZm9sbG93aW5nIGZvcm11bGE6XG4gICAgICogICBtaXBtYXBMZXZlbCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBjb21wdXRlZE1pcG1hcExldmVsICsgbWlwbWFwQmlhcyApXG4gICAgICovXG4gICAgcHVibGljIHNldE1pcG1hcEJpYXMoIGJpYXM6IG51bWJlciApOiB0aGlzIHtcbiAgICAgIGlmICggdGhpcy5fbWlwbWFwQmlhcyAhPT0gYmlhcyApIHtcbiAgICAgICAgdGhpcy5fbWlwbWFwQmlhcyA9IGJpYXM7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlTWlwbWFwcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG1pcG1hcEJpYXMoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0TWlwbWFwQmlhcyggdmFsdWUgKTsgfVxuXG4gICAgcHVibGljIGdldCBtaXBtYXBCaWFzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1pcG1hcEJpYXMoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCBtaXBtYXAgYmlhcy5cbiAgICAgKlxuICAgICAqIFNlZSBzZXRNaXBtYXBCaWFzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TWlwbWFwQmlhcygpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuX21pcG1hcEJpYXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIG51bWJlciBvZiBpbml0aWFsIG1pcG1hcCBsZXZlbHMgdG8gY29tcHV0ZSAoaWYgU2NlbmVyeSBnZW5lcmF0ZXMgdGhlIG1pcG1hcHMgYnkgc2V0dGluZyBtaXBtYXA6dHJ1ZSBvbiBhXG4gICAgICogbm9uLW1pcG1hcHBlZCBpbnB1dCkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbGV2ZWwgLSBBIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIG1pcG1hcCBsZXZlbHMgdG8gcHJlY29tcHV0ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0TWlwbWFwSW5pdGlhbExldmVsKCBsZXZlbDogbnVtYmVyICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgJSAxID09PSAwICYmIGxldmVsID49IDAsXG4gICAgICAgICdtaXBtYXBJbml0aWFsTGV2ZWwgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG5cbiAgICAgIGlmICggdGhpcy5fbWlwbWFwSW5pdGlhbExldmVsICE9PSBsZXZlbCApIHtcbiAgICAgICAgdGhpcy5fbWlwbWFwSW5pdGlhbExldmVsID0gbGV2ZWw7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlTWlwbWFwcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG1pcG1hcEluaXRpYWxMZXZlbCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRNaXBtYXBJbml0aWFsTGV2ZWwoIHZhbHVlICk7IH1cblxuICAgIHB1YmxpYyBnZXQgbWlwbWFwSW5pdGlhbExldmVsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1pcG1hcEluaXRpYWxMZXZlbCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGluaXRpYWwgbWlwbWFwIGxldmVsLlxuICAgICAqXG4gICAgICogU2VlIHNldE1pcG1hcEluaXRpYWxMZXZlbCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGdldE1pcG1hcEluaXRpYWxMZXZlbCgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuX21pcG1hcEluaXRpYWxMZXZlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWF4aW11bSAobG93ZXN0LXJlc29sdXRpb24pIGxldmVsIHRoYXQgU2NlbmVyeSB3aWxsIGNvbXB1dGUgaWYgaXQgZ2VuZXJhdGVzIG1pcG1hcHMgKGUuZy4gYnkgc2V0dGluZ1xuICAgICAqIG1pcG1hcDp0cnVlIG9uIGEgbm9uLW1pcG1hcHBlZCBpbnB1dCkuXG4gICAgICpcbiAgICAgKiBUaGUgZGVmYXVsdCB3aWxsIHByZWNvbXB1dGUgYWxsIGRlZmF1bHQgbGV2ZWxzIChmcm9tIG1pcG1hcEluaXRpYWxMZXZlbCksIHNvIHRoYXQgd2UgaWRlYWxseSBkb24ndCBoaXQgbWlwbWFwXG4gICAgICogZ2VuZXJhdGlvbiBkdXJpbmcgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGxldmVsIC0gQSBub24tbmVnYXRpdmUgaW50ZWdlciByZXByZXNlbnRpbmcgdGhlIG1heGltdW0gbWlwbWFwIGxldmVsIHRvIGNvbXB1dGUuXG4gICAgICovXG4gICAgcHVibGljIHNldE1pcG1hcE1heExldmVsKCBsZXZlbDogbnVtYmVyICk6IHRoaXMge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgJSAxID09PSAwICYmIGxldmVsID49IDAsXG4gICAgICAgICdtaXBtYXBNYXhMZXZlbCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgICAgaWYgKCB0aGlzLl9taXBtYXBNYXhMZXZlbCAhPT0gbGV2ZWwgKSB7XG4gICAgICAgIHRoaXMuX21pcG1hcE1heExldmVsID0gbGV2ZWw7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlTWlwbWFwcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IG1pcG1hcE1heExldmVsKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pcG1hcE1heExldmVsKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IG1pcG1hcE1heExldmVsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1pcG1hcE1heExldmVsKCk7IH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbWF4aW11bSBtaXBtYXAgbGV2ZWwuXG4gICAgICpcbiAgICAgKiBTZWUgc2V0TWlwbWFwTWF4TGV2ZWwoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRNaXBtYXBNYXhMZXZlbCgpOiBudW1iZXIge1xuICAgICAgcmV0dXJuIHRoaXMuX21pcG1hcE1heExldmVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnRyb2xzIHdoZXRoZXIgZWl0aGVyIGFueSBwaXhlbCBpbiB0aGUgaW1hZ2Ugd2lsbCBiZSBtYXJrZWQgYXMgY29udGFpbmVkICh3aGVuIGZhbHNlKSwgb3Igd2hldGhlciB0cmFuc3BhcmVudFxuICAgICAqIHBpeGVscyB3aWxsIGJlIGNvdW50ZWQgYXMgXCJub3QgY29udGFpbmVkIGluIHRoZSBpbWFnZVwiIGZvciBoaXQtdGVzdGluZyAod2hlbiB0cnVlKS5cbiAgICAgKlxuICAgICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA0OSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0SGl0VGVzdFBpeGVscyggaGl0VGVzdFBpeGVsczogYm9vbGVhbiApOiB0aGlzIHtcblxuICAgICAgaWYgKCB0aGlzLl9oaXRUZXN0UGl4ZWxzICE9PSBoaXRUZXN0UGl4ZWxzICkge1xuICAgICAgICB0aGlzLl9oaXRUZXN0UGl4ZWxzID0gaGl0VGVzdFBpeGVscztcblxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlSGl0VGVzdERhdGEoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBoaXRUZXN0UGl4ZWxzKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRIaXRUZXN0UGl4ZWxzKCB2YWx1ZSApOyB9XG5cbiAgICBwdWJsaWMgZ2V0IGhpdFRlc3RQaXhlbHMoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEhpdFRlc3RQaXhlbHMoKTsgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHBpeGVscyBhcmUgY2hlY2tlZCBmb3IgaGl0IHRlc3RpbmcuXG4gICAgICpcbiAgICAgKiBTZWUgc2V0SGl0VGVzdFBpeGVscygpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGdldEhpdFRlc3RQaXhlbHMoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5faGl0VGVzdFBpeGVscztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIHRoZSBuZXh0IGF2YWlsYWJsZSAodW5jb21wdXRlZCkgbWlwbWFwIGxldmVsLCBhcyBsb25nIGFzIHRoZSBwcmV2aW91cyBsZXZlbCB3YXMgbGFyZ2VyIHRoYW4gMXgxLlxuICAgICAqL1xuICAgIHByaXZhdGUgX2NvbnN0cnVjdE5leHRNaXBtYXAoKTogdm9pZCB7XG4gICAgICBjb25zdCBsZXZlbCA9IHRoaXMuX21pcG1hcENhbnZhc2VzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGJpZ2dlckNhbnZhcyA9IHRoaXMuX21pcG1hcENhbnZhc2VzWyBsZXZlbCAtIDEgXTtcblxuICAgICAgLy8gaWdub3JlIGFueSAxeDEgY2FudmFzZXMgKG9yIHNtYWxsZXI/IT8pXG4gICAgICBpZiAoIGJpZ2dlckNhbnZhcy53aWR0aCAqIGJpZ2dlckNhbnZhcy5oZWlnaHQgPiAyICkge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgICAgICBjYW52YXMud2lkdGggPSBNYXRoLmNlaWwoIGJpZ2dlckNhbnZhcy53aWR0aCAvIDIgKTtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggYmlnZ2VyQ2FudmFzLmhlaWdodCAvIDIgKTtcblxuICAgICAgICAvLyBzYW5pdHkgY2hlY2tcbiAgICAgICAgaWYgKCBjYW52YXMud2lkdGggPiAwICYmIGNhbnZhcy5oZWlnaHQgPiAwICkge1xuICAgICAgICAgIC8vIERyYXcgaGFsZi1zY2FsZSBpbnRvIHRoZSBzbWFsbGVyIENhbnZhc1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICAgICAgICBjb250ZXh0LnNjYWxlKCAwLjUsIDAuNSApO1xuICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBiaWdnZXJDYW52YXMsIDAsIDAgKTtcblxuICAgICAgICAgIHRoaXMuX21pcG1hcENhbnZhc2VzLnB1c2goIGNhbnZhcyApO1xuICAgICAgICAgIHRoaXMuX21pcG1hcFVSTHMucHVzaCggY2FudmFzLnRvRGF0YVVSTCgpICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIG1pcG1hcHMgKGFzIGxvbmcgYXMgbWlwbWFwcGluZyBpcyBlbmFibGVkKVxuICAgICAqL1xuICAgIHB1YmxpYyBpbnZhbGlkYXRlTWlwbWFwcygpOiB2b2lkIHtcbiAgICAgIC8vIENsZWFuIG91dHB1dCBhcnJheXNcbiAgICAgIGNsZWFuQXJyYXkoIHRoaXMuX21pcG1hcENhbnZhc2VzICk7XG4gICAgICBjbGVhbkFycmF5KCB0aGlzLl9taXBtYXBVUkxzICk7XG5cbiAgICAgIGlmICggdGhpcy5faW1hZ2UgJiYgdGhpcy5fbWlwbWFwICkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIG1pcG1hcCBkYXRhIGFzIGFuIGlucHV0XG4gICAgICAgIGlmICggdGhpcy5fbWlwbWFwRGF0YSApIHtcbiAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLl9taXBtYXBEYXRhLmxlbmd0aDsgaysrICkge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gdGhpcy5fbWlwbWFwRGF0YVsgayBdLnVybDtcbiAgICAgICAgICAgIHRoaXMuX21pcG1hcFVSTHMucHVzaCggdXJsICk7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVDYW52YXMgPSB0aGlzLl9taXBtYXBEYXRhWyBrIF0udXBkYXRlQ2FudmFzO1xuICAgICAgICAgICAgdXBkYXRlQ2FudmFzICYmIHVwZGF0ZUNhbnZhcygpO1xuICAgICAgICAgICAgdGhpcy5fbWlwbWFwQ2FudmFzZXMucHVzaCggdGhpcy5fbWlwbWFwRGF0YVsgayBdLmNhbnZhcyEgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBoYXZlIGFuIGltYWdlIChub3QgbWlwbWFwKSBhcyBvdXIgaW5wdXQsIHNvIHdlJ2xsIG5lZWQgdG8gY29uc3RydWN0IG1pcG1hcCBsZXZlbHMuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGJhc2VDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgICAgICAgIGJhc2VDYW52YXMud2lkdGggPSB0aGlzLmdldEltYWdlV2lkdGgoKTtcbiAgICAgICAgICBiYXNlQ2FudmFzLmhlaWdodCA9IHRoaXMuZ2V0SW1hZ2VIZWlnaHQoKTtcblxuICAgICAgICAgIC8vIGlmIHdlIGFyZSBub3QgbG9hZGVkIHlldCwganVzdCBpZ25vcmVcbiAgICAgICAgICBpZiAoIGJhc2VDYW52YXMud2lkdGggJiYgYmFzZUNhbnZhcy5oZWlnaHQgKSB7XG4gICAgICAgICAgICBjb25zdCBiYXNlQ29udGV4dCA9IGJhc2VDYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICAgICAgICAgIGJhc2VDb250ZXh0LmRyYXdJbWFnZSggdGhpcy5faW1hZ2UsIDAsIDAgKTtcblxuICAgICAgICAgICAgdGhpcy5fbWlwbWFwQ2FudmFzZXMucHVzaCggYmFzZUNhbnZhcyApO1xuICAgICAgICAgICAgdGhpcy5fbWlwbWFwVVJMcy5wdXNoKCBiYXNlQ2FudmFzLnRvRGF0YVVSTCgpICk7XG5cbiAgICAgICAgICAgIGxldCBsZXZlbCA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoICsrbGV2ZWwgPCB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWwgKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbnN0cnVjdE5leHRNaXBtYXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5taXBtYXBFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXNpcmVkIG1pcG1hcCBsZXZlbCAoMC1pbmRleGVkKSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgcGFydGljdWxhciByZWxhdGl2ZSB0cmFuc2Zvcm0uIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqXG4gICAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSByZWxhdGl2ZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggb2YgdGhlIG5vZGUuXG4gICAgICogQHBhcmFtIFthZGRpdGlvbmFsQmlhc10gLSBDYW4gYmUgcHJvdmlkZWQgdG8gZ2V0IHBlci1jYWxsIGJpYXMgKHdlIHdhbnQgc29tZSBvZiB0aGlzIGZvciBDYW52YXMgb3V0cHV0KVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRNaXBtYXBMZXZlbCggbWF0cml4OiBNYXRyaXgzLCBhZGRpdGlvbmFsQmlhcyA9IDAgKTogbnVtYmVyIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX21pcG1hcCwgJ0Fzc3VtZXMgbWlwbWFwcyBjYW4gYmUgdXNlZCcgKTtcblxuICAgICAgLy8gSGFuZGxlIGhpZ2gtZHBpIGRldmljZXMgbGlrZSByZXRpbmEgd2l0aCBjb3JyZWN0IG1pcG1hcCBsZXZlbHMuXG4gICAgICBjb25zdCBzY2FsZSA9IEltYWdlYWJsZS5nZXRBcHByb3hpbWF0ZU1hdHJpeFNjYWxlKCBtYXRyaXggKSAqICggd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSApO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRNaXBtYXBMZXZlbEZyb21TY2FsZSggc2NhbGUsIGFkZGl0aW9uYWxCaWFzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGVzaXJlZCBtaXBtYXAgbGV2ZWwgKDAtaW5kZXhlZCkgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHBhcnRpY3VsYXIgc2NhbGVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0TWlwbWFwTGV2ZWxGcm9tU2NhbGUoIHNjYWxlOiBudW1iZXIsIGFkZGl0aW9uYWxCaWFzID0gMCApOiBudW1iZXIge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NhbGUgPiAwLCAnc2NhbGUgc2hvdWxkIGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuXG4gICAgICAvLyBJZiB3ZSBhcmUgc2hvd24gbGFyZ2VyIHRoYW4gc2NhbGUsIEFMV0FZUyBjaG9vc2UgdGhlIGhpZ2hlc3QgcmVzb2x1dGlvblxuICAgICAgaWYgKCBzY2FsZSA+PSAxICkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cblxuICAgICAgLy8gb3VyIGFwcHJveGltYXRlIGxldmVsIG9mIGRldGFpbFxuICAgICAgbGV0IGxldmVsID0gbG9nMiggMSAvIHNjYWxlICk7XG5cbiAgICAgIC8vIGNvbnZlcnQgdG8gYW4gaW50ZWdlciBsZXZlbCAoLTAuNyBpcyBhIGdvb2QgZGVmYXVsdClcbiAgICAgIGxldmVsID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGxldmVsICsgdGhpcy5fbWlwbWFwQmlhcyArIGFkZGl0aW9uYWxCaWFzIC0gMC43ICk7XG5cbiAgICAgIGlmICggbGV2ZWwgPCAwICkge1xuICAgICAgICBsZXZlbCA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoIGxldmVsID4gdGhpcy5fbWlwbWFwTWF4TGV2ZWwgKSB7XG4gICAgICAgIGxldmVsID0gdGhpcy5fbWlwbWFwTWF4TGV2ZWw7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5lY2Vzc2FyeSwgZG8gbGF6eSBjb25zdHJ1Y3Rpb24gb2YgdGhlIG1pcG1hcCBsZXZlbFxuICAgICAgaWYgKCB0aGlzLm1pcG1hcCAmJiAhdGhpcy5fbWlwbWFwQ2FudmFzZXNbIGxldmVsIF0gKSB7XG4gICAgICAgIGxldCBjdXJyZW50TGV2ZWwgPSB0aGlzLl9taXBtYXBDYW52YXNlcy5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAoICsrY3VycmVudExldmVsIDw9IGxldmVsICkge1xuICAgICAgICAgIHRoaXMuX2NvbnN0cnVjdE5leHRNaXBtYXAoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTYW5pdHkgY2hlY2ssIHNpbmNlIF9jb25zdHJ1Y3ROZXh0TWlwbWFwKCkgbWF5IGhhdmUgaGFkIHRvIGJhaWwgb3V0LiBXZSBoYWQgdG8gY29tcHV0ZSBzb21lLCBzbyB1c2UgdGhlIGxhc3RcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKCBsZXZlbCwgdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoIC0gMSApO1xuICAgICAgfVxuICAgICAgLy8gU2hvdWxkIGFscmVhZHkgYmUgY29uc3RydWN0ZWQsIG9yIGlzbid0IG5lZWRlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBsZXZlbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbWF0Y2hpbmcgQ2FudmFzIGVsZW1lbnQgZm9yIHRoZSBnaXZlbiBsZXZlbC1vZi1kZXRhaWwuIChzY2VuZXJ5LWludGVybmFsKVxuICAgICAqXG4gICAgICogQHBhcmFtIGxldmVsIC0gTm9uLW5lZ2F0aXZlIGludGVnZXIgcmVwcmVzZW50aW5nIHRoZSBtaXBtYXAgbGV2ZWxcbiAgICAgKiBAcmV0dXJucyAtIE1hdGNoaW5nIDxjYW52YXM+IGZvciB0aGUgbGV2ZWwgb2YgZGV0YWlsXG4gICAgICovXG4gICAgcHVibGljIGdldE1pcG1hcENhbnZhcyggbGV2ZWw6IG51bWJlciApOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZXZlbCA+PSAwICYmXG4gICAgICBsZXZlbCA8IHRoaXMuX21pcG1hcENhbnZhc2VzLmxlbmd0aCAmJlxuICAgICAgKCBsZXZlbCAlIDEgKSA9PT0gMCApO1xuXG4gICAgICAvLyBTYW5pdHkgY2hlY2sgdG8gbWFrZSBzdXJlIHdlIGhhdmUgY29waWVkIHRoZSBpbWFnZSBkYXRhIGluIGlmIG5lY2Vzc2FyeS5cbiAgICAgIGlmICggdGhpcy5fbWlwbWFwRGF0YSApIHtcbiAgICAgICAgLy8gbGV2ZWwgbWF5IG5vdCBleGlzdCAoaXQgd2FzIGdlbmVyYXRlZCksIGFuZCB1cGRhdGVDYW52YXMgbWF5IG5vdCBleGlzdFxuICAgICAgICBjb25zdCB1cGRhdGVDYW52YXMgPSB0aGlzLl9taXBtYXBEYXRhWyBsZXZlbCBdICYmIHRoaXMuX21pcG1hcERhdGFbIGxldmVsIF0udXBkYXRlQ2FudmFzO1xuICAgICAgICB1cGRhdGVDYW52YXMgJiYgdXBkYXRlQ2FudmFzKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fbWlwbWFwQ2FudmFzZXNbIGxldmVsIF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG1hdGNoaW5nIFVSTCBzdHJpbmcgZm9yIGFuIGltYWdlIGZvciB0aGUgZ2l2ZW4gbGV2ZWwtb2YtZGV0YWlsLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKlxuICAgICAqIEBwYXJhbSBsZXZlbCAtIE5vbi1uZWdhdGl2ZSBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbWlwbWFwIGxldmVsXG4gICAgICogQHJldHVybnMgLSBNYXRjaGluZyBkYXRhIFVSTCBmb3IgdGhlIGxldmVsIG9mIGRldGFpbFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRNaXBtYXBVUkwoIGxldmVsOiBudW1iZXIgKTogc3RyaW5nIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxldmVsID49IDAgJiZcbiAgICAgIGxldmVsIDwgdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoICYmXG4gICAgICAoIGxldmVsICUgMSApID09PSAwICk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXBVUkxzWyBsZXZlbCBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGVyZSBhcmUgbWlwbWFwIGxldmVscyB0aGF0IGhhdmUgYmVlbiBjb21wdXRlZC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAgICovXG4gICAgcHVibGljIGhhc01pcG1hcHMoKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIGhpdCB0ZXN0IGRhdGFcbiAgICAgKi9cbiAgICBwcml2YXRlIF9pbnZhbGlkYXRlSGl0VGVzdERhdGEoKTogdm9pZCB7XG4gICAgICAvLyBPbmx5IGNvbXB1dGUgdGhpcyBpZiB3ZSBhcmUgaGl0LXRlc3RpbmcgcGl4ZWxzXG4gICAgICBpZiAoICF0aGlzLl9oaXRUZXN0UGl4ZWxzICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5faW1hZ2UgIT09IG51bGwgKSB7XG4gICAgICAgIHRoaXMuX2hpdFRlc3RJbWFnZURhdGEgPSBJbWFnZWFibGUuZ2V0SGl0VGVzdERhdGEoIHRoaXMuX2ltYWdlLCB0aGlzLmltYWdlV2lkdGgsIHRoaXMuaW1hZ2VIZWlnaHQgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGUgZGlzcGxheWVkIGltYWdlIChub3QgcmVsYXRlZCB0byBob3cgdGhpcyBub2RlIGlzIHRyYW5zZm9ybWVkKS5cbiAgICAgKlxuICAgICAqIE5PVEU6IElmIHRoZSBpbWFnZSBpcyBub3QgbG9hZGVkIGFuZCBhbiBpbml0aWFsV2lkdGggd2FzIHByb3ZpZGVkLCB0aGF0IHdpZHRoIHdpbGwgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW1hZ2VXaWR0aCgpOiBudW1iZXIge1xuICAgICAgaWYgKCB0aGlzLl9pbWFnZSA9PT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRldGVjdGVkV2lkdGggPSB0aGlzLl9taXBtYXBEYXRhID8gdGhpcy5fbWlwbWFwRGF0YVsgMCBdLndpZHRoIDogKCAoICduYXR1cmFsV2lkdGgnIGluIHRoaXMuX2ltYWdlID8gdGhpcy5faW1hZ2UubmF0dXJhbFdpZHRoIDogMCApIHx8IHRoaXMuX2ltYWdlLndpZHRoICk7XG4gICAgICBpZiAoIGRldGVjdGVkV2lkdGggPT09IDAgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsV2lkdGg7IC8vIGVpdGhlciAwIChkZWZhdWx0KSwgb3IgdGhlIG92ZXJyaWRkZW4gdmFsdWVcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbml0aWFsV2lkdGggPT09IDAgfHwgdGhpcy5faW5pdGlhbFdpZHRoID09PSBkZXRlY3RlZFdpZHRoLCAnQmFkIEltYWdlLmluaXRpYWxXaWR0aCcgKTtcblxuICAgICAgICByZXR1cm4gZGV0ZWN0ZWRXaWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGltYWdlV2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0SW1hZ2VXaWR0aCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGRpc3BsYXllZCBpbWFnZSAobm90IHJlbGF0ZWQgdG8gaG93IHRoaXMgbm9kZSBpcyB0cmFuc2Zvcm1lZCkuXG4gICAgICpcbiAgICAgKiBOT1RFOiBJZiB0aGUgaW1hZ2UgaXMgbm90IGxvYWRlZCBhbmQgYW4gaW5pdGlhbEhlaWdodCB3YXMgcHJvdmlkZWQsIHRoYXQgaGVpZ2h0IHdpbGwgYmUgdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW1hZ2VIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgIGlmICggdGhpcy5faW1hZ2UgPT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZXRlY3RlZEhlaWdodCA9IHRoaXMuX21pcG1hcERhdGEgPyB0aGlzLl9taXBtYXBEYXRhWyAwIF0uaGVpZ2h0IDogKCAoICduYXR1cmFsSGVpZ2h0JyBpbiB0aGlzLl9pbWFnZSA/IHRoaXMuX2ltYWdlLm5hdHVyYWxIZWlnaHQgOiAwICkgfHwgdGhpcy5faW1hZ2UuaGVpZ2h0ICk7XG4gICAgICBpZiAoIGRldGVjdGVkSGVpZ2h0ID09PSAwICkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW5pdGlhbEhlaWdodDsgLy8gZWl0aGVyIDAgKGRlZmF1bHQpLCBvciB0aGUgb3ZlcnJpZGRlbiB2YWx1ZVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2luaXRpYWxIZWlnaHQgPT09IDAgfHwgdGhpcy5faW5pdGlhbEhlaWdodCA9PT0gZGV0ZWN0ZWRIZWlnaHQsICdCYWQgSW1hZ2UuaW5pdGlhbEhlaWdodCcgKTtcblxuICAgICAgICByZXR1cm4gZGV0ZWN0ZWRIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpbWFnZUhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRJbWFnZUhlaWdodCgpOyB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBvdXIgcHJvdmlkZWQgaW1hZ2UgaXMgYW4gSFRNTEltYWdlRWxlbWVudCwgcmV0dXJucyBpdHMgVVJMIChzcmMpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SW1hZ2VVUkwoKTogc3RyaW5nIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2ltYWdlIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCwgJ09ubHkgc3VwcG9ydGVkIGZvciBIVE1MIGltYWdlIGVsZW1lbnRzJyApO1xuXG4gICAgICByZXR1cm4gKCB0aGlzLl9pbWFnZSBhcyBIVE1MSW1hZ2VFbGVtZW50ICkuc3JjO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIG91ciBvbi1sb2FkIGxpc3RlbmVyIHRvIG91ciBjdXJyZW50IGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgX2F0dGFjaEltYWdlTG9hZExpc3RlbmVyKCk6IHZvaWQge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX2ltYWdlTG9hZExpc3RlbmVyQXR0YWNoZWQsICdTaG91bGQgb25seSBiZSBhdHRhY2hlZCB0byBvbmUgdGhpbmcgYXQgYSB0aW1lJyApO1xuXG4gICAgICBpZiAoICF0aGlzLmlzRGlzcG9zZWQgKSB7XG4gICAgICAgICggdGhpcy5faW1hZ2UgYXMgSFRNTEltYWdlRWxlbWVudCApLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0YWNoZXMgb3VyIG9uLWxvYWQgbGlzdGVuZXIgZnJvbSBvdXIgY3VycmVudCBpbWFnZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIF9kZXRhY2hJbWFnZUxvYWRMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2ltYWdlTG9hZExpc3RlbmVyQXR0YWNoZWQsICdOZWVkcyB0byBiZSBhdHRhY2hlZCBmaXJzdCB0byBiZSBkZXRhY2hlZC4nICk7XG5cbiAgICAgICggdGhpcy5faW1hZ2UgYXMgSFRNTEltYWdlRWxlbWVudCApLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuX2ltYWdlTG9hZExpc3RlbmVyQXR0YWNoZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiBvdXIgaW1hZ2UgaGFzIGxvYWRlZCAoaXQgd2FzIG5vdCB5ZXQgbG9hZGVkIHdpdGggdGhlbiBsaXN0ZW5lciB3YXMgYWRkZWQpXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25JbWFnZUxvYWQoKTogdm9pZCB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkLCAnSWYgX29uSW1hZ2VMb2FkIGlzIGZpcmluZywgaXQgc2hvdWxkIGJlIGF0dGFjaGVkJyApO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVJbWFnZSgpO1xuICAgICAgdGhpcy5fZGV0YWNoSW1hZ2VMb2FkTGlzdGVuZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwb3NlcyB0aGUgcGF0aCwgcmVsZWFzaW5nIGltYWdlIGxpc3RlbmVycyBpZiBuZWVkZWQgKGFuZCBwcmV2ZW50aW5nIG5ldyBsaXN0ZW5lcnMgZnJvbSBiZWluZyBhZGRlZCkuXG4gICAgICovXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICBpZiAoIHRoaXMuX2ltYWdlICYmIHRoaXMuX2ltYWdlTG9hZExpc3RlbmVyQXR0YWNoZWQgKSB7XG4gICAgICAgIHRoaXMuX2RldGFjaEltYWdlTG9hZExpc3RlbmVyKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2ltYWdlUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBzdXBlci5kaXNwb3NlICYmIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIE9wdGlvbmFsbHkgcmV0dXJucyBhbiBJbWFnZURhdGEgb2JqZWN0IHVzZWZ1bCBmb3IgaGl0LXRlc3RpbmcgdGhlIHBpeGVsIGRhdGEgb2YgYW4gaW1hZ2UuXG4gKlxuICogQHBhcmFtIGltYWdlXG4gKiBAcGFyYW0gd2lkdGggLSBsb2dpY2FsIHdpZHRoIG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIGhlaWdodCAtIGxvZ2ljYWwgaGVpZ2h0IG9mIHRoZSBpbWFnZVxuICovXG5JbWFnZWFibGUuZ2V0SGl0VGVzdERhdGEgPSAoIGltYWdlOiBQYXJzZWRJbWFnZSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogSW1hZ2VEYXRhIHwgbnVsbCA9PiB7XG4gIC8vIElmIHRoZSBpbWFnZSBpc24ndCBsb2FkZWQgeWV0LCB3ZSBkb24ndCB3YW50IHRvIHRyeSBsb2FkaW5nIGFueXRoaW5nXG4gIGlmICggISggKCAnbmF0dXJhbFdpZHRoJyBpbiBpbWFnZSA/IGltYWdlLm5hdHVyYWxXaWR0aCA6IDAgKSB8fCBpbWFnZS53aWR0aCApIHx8ICEoICggJ25hdHVyYWxIZWlnaHQnIGluIGltYWdlID8gaW1hZ2UubmF0dXJhbEhlaWdodCA6IDAgKSB8fCBpbWFnZS5oZWlnaHQgKSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNhbnZhcyA9IGdldFNjcmF0Y2hDYW52YXMoKTtcbiAgY29uc3QgY29udGV4dCA9IGdldFNjcmF0Y2hDb250ZXh0KCk7XG5cbiAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIGNvbnRleHQuZHJhd0ltYWdlKCBpbWFnZSwgMCwgMCApO1xuXG4gIHJldHVybiBjb250ZXh0LmdldEltYWdlRGF0YSggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xufTtcblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIGEgZ2l2ZW4gcGl4ZWwgaW4gYW4gSW1hZ2VEYXRhIGlzIGF0IGFsbCBub24tdHJhbnNwYXJlbnQuXG4gKlxuICogQHBhcmFtIGltYWdlRGF0YVxuICogQHBhcmFtIHdpZHRoIC0gbG9naWNhbCB3aWR0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSBoZWlnaHQgLSBsb2dpY2FsIGhlaWdodCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSBwb2ludFxuICovXG5JbWFnZWFibGUudGVzdEhpdFRlc3REYXRhID0gKCBpbWFnZURhdGE6IEltYWdlRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4gPT4ge1xuICAvLyBGb3Igc2FuaXR5LCBtYXAgaXQgYmFzZWQgb24gdGhlIGltYWdlIGRpbWVuc2lvbnMgYW5kIGltYWdlIGRhdGEgZGltZW5zaW9ucywgYW5kIGNhcmVmdWxseSBjbGFtcCBpbiBjYXNlIHRoaW5ncyBhcmUgd2VpcmQuXG4gIGNvbnN0IHggPSBVdGlscy5jbGFtcCggTWF0aC5mbG9vciggKCBwb2ludC54IC8gd2lkdGggKSAqIGltYWdlRGF0YS53aWR0aCApLCAwLCBpbWFnZURhdGEud2lkdGggLSAxICk7XG4gIGNvbnN0IHkgPSBVdGlscy5jbGFtcCggTWF0aC5mbG9vciggKCBwb2ludC55IC8gaGVpZ2h0ICkgKiBpbWFnZURhdGEuaGVpZ2h0ICksIDAsIGltYWdlRGF0YS5oZWlnaHQgLSAxICk7XG5cbiAgY29uc3QgaW5kZXggPSA0ICogKCB4ICsgeSAqIGltYWdlRGF0YS53aWR0aCApICsgMztcblxuICByZXR1cm4gaW1hZ2VEYXRhLmRhdGFbIGluZGV4IF0gIT09IDA7XG59O1xuXG4vKipcbiAqIFR1cm5zIHRoZSBJbWFnZURhdGEgaW50byBhIFNoYXBlIHNob3dpbmcgd2hlcmUgaGl0IHRlc3Rpbmcgd291bGQgc3VjY2VlZC5cbiAqXG4gKiBAcGFyYW0gaW1hZ2VEYXRhXG4gKiBAcGFyYW0gd2lkdGggLSBsb2dpY2FsIHdpZHRoIG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIGhlaWdodCAtIGxvZ2ljYWwgaGVpZ2h0IG9mIHRoZSBpbWFnZVxuICovXG5JbWFnZWFibGUuaGl0VGVzdERhdGFUb1NoYXBlID0gKCBpbWFnZURhdGE6IEltYWdlRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogU2hhcGUgPT4ge1xuICBjb25zdCB3aWR0aFNjYWxlID0gd2lkdGggLyBpbWFnZURhdGEud2lkdGg7XG4gIGNvbnN0IGhlaWdodFNjYWxlID0gaGVpZ2h0IC8gaW1hZ2VEYXRhLmhlaWdodDtcblxuICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xuXG4gIC8vIENyZWF0ZSByb3dzIGF0IGEgdGltZSwgc28gdGhhdCBpZiB3ZSBoYXZlIDUwIGFkamFjZW50IHBpeGVscyBcIm9uXCIsIHRoZW4gd2UnbGwganVzdCBtYWtlIGEgcmVjdGFuZ2xlIDUwLXdpZGUuXG4gIC8vIFRoaXMgbGV0cyB1cyBkbyB0aGUgQ0FHIGZhc3Rlci5cbiAgbGV0IGFjdGl2ZSA9IGZhbHNlO1xuICBsZXQgbWluID0gMDtcblxuICAvLyBOT1RFOiBSb3dzIGFyZSBtb3JlIGhlbHBmdWwgZm9yIENBRywgZXZlbiB0aG91Z2ggY29sdW1ucyB3b3VsZCBoYXZlIGJldHRlciBjYWNoZSBiZWhhdmlvciB3aGVuIGFjY2Vzc2luZyB0aGVcbiAgLy8gaW1hZ2VEYXRhLlxuXG4gIGZvciAoIGxldCB5ID0gMDsgeSA8IGltYWdlRGF0YS5oZWlnaHQ7IHkrKyApIHtcbiAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCBpbWFnZURhdGEud2lkdGg7IHgrKyApIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gNCAqICggeCArIHkgKiBpbWFnZURhdGEud2lkdGggKSArIDM7XG5cbiAgICAgIGlmICggaW1hZ2VEYXRhLmRhdGFbIGluZGV4IF0gIT09IDAgKSB7XG4gICAgICAgIC8vIElmIG91ciBsYXN0IHBpeGVsIHdhcyBlbXB0eSwgYW5kIG5vdyB3ZSdyZSBcIm9uXCIsIHN0YXJ0IG91ciByZWN0YW5nbGVcbiAgICAgICAgaWYgKCAhYWN0aXZlICkge1xuICAgICAgICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgbWluID0geDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGFjdGl2ZSApIHtcbiAgICAgICAgLy8gRmluaXNoIGEgcmVjdGFuZ2xlIG9uY2Ugd2UgcmVhY2ggYW4gXCJvZmZcIiBwaXhlbFxuICAgICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgc2hhcGUucmVjdCggbWluICogd2lkdGhTY2FsZSwgeSAqIHdpZHRoU2NhbGUsIHdpZHRoU2NhbGUgKiAoIHggLSBtaW4gKSwgaGVpZ2h0U2NhbGUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCBhY3RpdmUgKSB7XG4gICAgICAvLyBXZSdsbCBuZWVkIHRvIGZpbmlzaCByZWN0YW5nbGVzIGF0IHRoZSBlbmQgb2YgZWFjaCByb3cgYW55d2F5LlxuICAgICAgYWN0aXZlID0gZmFsc2U7XG4gICAgICBzaGFwZS5yZWN0KCBtaW4gKiB3aWR0aFNjYWxlLCB5ICogd2lkdGhTY2FsZSwgd2lkdGhTY2FsZSAqICggaW1hZ2VEYXRhLndpZHRoIC0gbWluICksIGhlaWdodFNjYWxlICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNoYXBlLmdldFNpbXBsaWZpZWRBcmVhU2hhcGUoKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBTVkcgaW1hZ2UgZWxlbWVudCB3aXRoIGEgZ2l2ZW4gVVJMIGFuZCBkaW1lbnNpb25zXG4gKlxuICogQHBhcmFtIHVybCAtIFRoZSBVUkwgZm9yIHRoZSBpbWFnZVxuICogQHBhcmFtIHdpZHRoIC0gTm9uLW5lZ2F0aXZlIGludGVnZXIgZm9yIHRoZSBpbWFnZSdzIHdpZHRoXG4gKiBAcGFyYW0gaGVpZ2h0IC0gTm9uLW5lZ2F0aXZlIGludGVnZXIgZm9yIHRoZSBpbWFnZSdzIGhlaWdodFxuICovXG5JbWFnZWFibGUuY3JlYXRlU1ZHSW1hZ2UgPSAoIHVybDogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBTVkdJbWFnZUVsZW1lbnQgPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggd2lkdGggKSAmJiB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxICkgPT09IDAsXG4gICAgJ3dpZHRoIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBmaW5pdGUgaW50ZWdlcicgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGhlaWdodCApICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSApID09PSAwLFxuICAgICdoZWlnaHQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBpbnRlZ2VyJyApO1xuXG4gIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnaW1hZ2UnICk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAneCcsICcwJyApO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3knLCAnMCcgKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICd3aWR0aCcsIGAke3dpZHRofXB4YCApO1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIGAke2hlaWdodH1weGAgKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGVOUyggeGxpbmtucywgJ3hsaW5rOmhyZWYnLCB1cmwgKTtcblxuICByZXR1cm4gZWxlbWVudDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvYmplY3Qgc3VpdGFibGUgdG8gYmUgcGFzc2VkIHRvIEltYWdlIGFzIGEgbWlwbWFwIChmcm9tIGEgQ2FudmFzKVxuICovXG5JbWFnZWFibGUuY3JlYXRlRmFzdE1pcG1hcEZyb21DYW52YXMgPSAoIGJhc2VDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ICk6IE1pcG1hcCA9PiB7XG4gIGNvbnN0IG1pcG1hcHM6IE1pcG1hcCA9IFtdO1xuXG4gIGNvbnN0IGJhc2VVUkwgPSBiYXNlQ2FudmFzLnRvRGF0YVVSTCgpO1xuICBjb25zdCBiYXNlSW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gIGJhc2VJbWFnZS5zcmMgPSBiYXNlVVJMO1xuXG4gIC8vIGJhc2UgbGV2ZWxcbiAgbWlwbWFwcy5wdXNoKCB7XG4gICAgaW1nOiBiYXNlSW1hZ2UsXG4gICAgdXJsOiBiYXNlVVJMLFxuICAgIHdpZHRoOiBiYXNlQ2FudmFzLndpZHRoLFxuICAgIGhlaWdodDogYmFzZUNhbnZhcy5oZWlnaHQsXG4gICAgY2FudmFzOiBiYXNlQ2FudmFzXG4gIH0gKTtcblxuICBsZXQgbGFyZ2VDYW52YXMgPSBiYXNlQ2FudmFzO1xuICB3aGlsZSAoIGxhcmdlQ2FudmFzLndpZHRoID49IDIgJiYgbGFyZ2VDYW52YXMuaGVpZ2h0ID49IDIgKSB7XG5cbiAgICAvLyBkcmF3IGhhbGYtc2l6ZVxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCBsYXJnZUNhbnZhcy53aWR0aCAvIDIgKTtcbiAgICBjYW52YXMuaGVpZ2h0ID0gTWF0aC5jZWlsKCBsYXJnZUNhbnZhcy5oZWlnaHQgLyAyICk7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCAwLjUsIDAsIDAsIDAuNSwgMCwgMCApO1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKCBsYXJnZUNhbnZhcywgMCwgMCApO1xuXG4gICAgLy8gc21hbGxlciBsZXZlbFxuICAgIGNvbnN0IG1pcG1hcExldmVsID0ge1xuICAgICAgd2lkdGg6IGNhbnZhcy53aWR0aCxcbiAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodCxcbiAgICAgIGNhbnZhczogY2FudmFzLFxuICAgICAgdXJsOiBjYW52YXMudG9EYXRhVVJMKCksXG4gICAgICBpbWc6IG5ldyB3aW5kb3cuSW1hZ2UoKVxuICAgIH07XG4gICAgLy8gc2V0IHVwIHRoZSBpbWFnZSBhbmQgdXJsXG4gICAgbWlwbWFwTGV2ZWwuaW1nLnNyYyA9IG1pcG1hcExldmVsLnVybDtcblxuICAgIGxhcmdlQ2FudmFzID0gY2FudmFzO1xuICAgIG1pcG1hcHMucHVzaCggbWlwbWFwTGV2ZWwgKTtcbiAgfVxuXG4gIHJldHVybiBtaXBtYXBzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc2Vuc2Ugb2YgXCJhdmVyYWdlXCIgc2NhbGUsIHdoaWNoIHNob3VsZCBiZSBleGFjdCBpZiB0aGVyZSBpcyBubyBhc3ltbWV0cmljIHNjYWxlL3NoZWFyIGFwcGxpZWRcbiAqL1xuSW1hZ2VhYmxlLmdldEFwcHJveGltYXRlTWF0cml4U2NhbGUgPSAoIG1hdHJpeDogTWF0cml4MyApOiBudW1iZXIgPT4ge1xuICByZXR1cm4gKCBNYXRoLnNxcnQoIG1hdHJpeC5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIG1hdHJpeC5tMTAoKSAqIG1hdHJpeC5tMTAoKSApICtcbiAgICAgICAgICAgTWF0aC5zcXJ0KCBtYXRyaXgubTAxKCkgKiBtYXRyaXgubTAxKCkgKyBtYXRyaXgubTExKCkgKiBtYXRyaXgubTExKCkgKSApIC8gMjtcbn07XG5cbi8vIHtudW1iZXJ9IC0gV2UgaW5jbHVkZSB0aGlzIGZvciBhZGRpdGlvbmFsIHNtb290aGluZyB0aGF0IHNlZW1zIHRvIGJlIG5lZWRlZCBmb3IgQ2FudmFzIGltYWdlIHF1YWxpdHlcbkltYWdlYWJsZS5DQU5WQVNfTUlQTUFQX0JJQVNfQURKVVNUTUVOVCA9IDAuNTtcblxuLy8ge09iamVjdH0gLSBJbml0aWFsIHZhbHVlcyBmb3IgbW9zdCBOb2RlIG11dGF0b3Igb3B0aW9uc1xuSW1hZ2VhYmxlLkRFRkFVTFRfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcblxuc2NlbmVyeS5yZWdpc3RlciggJ0ltYWdlYWJsZScsIEltYWdlYWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgSW1hZ2VhYmxlOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlRpbnlGb3J3YXJkaW5nUHJvcGVydHkiLCJVdGlscyIsIlNoYXBlIiwiY2xlYW5BcnJheSIsInNjZW5lcnkiLCJzdmducyIsInhsaW5rbnMiLCJsb2cyIiwiTWF0aCIsIngiLCJsb2ciLCJMTjIiLCJERUZBVUxUX09QVElPTlMiLCJpbWFnZU9wYWNpdHkiLCJpbml0aWFsV2lkdGgiLCJpbml0aWFsSGVpZ2h0IiwibWlwbWFwIiwibWlwbWFwQmlhcyIsIm1pcG1hcEluaXRpYWxMZXZlbCIsIm1pcG1hcE1heExldmVsIiwiaGl0VGVzdFBpeGVscyIsInNjcmF0Y2hDYW52YXMiLCJzY3JhdGNoQ29udGV4dCIsImdldFNjcmF0Y2hDYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRTY3JhdGNoQ29udGV4dCIsImdldENvbnRleHQiLCJ3aWxsUmVhZEZyZXF1ZW50bHkiLCJJbWFnZWFibGUiLCJ0eXBlIiwiSW1hZ2VhYmxlTWl4aW4iLCJzZXRJbWFnZSIsImltYWdlIiwiYXNzZXJ0IiwiX2ltYWdlUHJvcGVydHkiLCJ2YWx1ZSIsImdldEltYWdlIiwiX2ltYWdlIiwib25JbWFnZVByb3BlcnR5Q2hhbmdlIiwiaGFzSW1hZ2VDaGFuZ2VkIiwiSFRNTEltYWdlRWxlbWVudCIsInNyYyIsIl9taXBtYXBEYXRhIiwiX2luaXRpYWxXaWR0aCIsIl9pbml0aWFsSGVpZ2h0IiwiX2ltYWdlTG9hZExpc3RlbmVyQXR0YWNoZWQiLCJfZGV0YWNoSW1hZ2VMb2FkTGlzdGVuZXIiLCJBcnJheSIsImlzQXJyYXkiLCJpbWciLCJfbWlwbWFwSW5pdGlhbExldmVsIiwiX21pcG1hcE1heExldmVsIiwibGVuZ3RoIiwiX21pcG1hcCIsIndpZHRoIiwiaGVpZ2h0IiwiX2F0dGFjaEltYWdlTG9hZExpc3RlbmVyIiwiaW52YWxpZGF0ZUltYWdlIiwic2V0SW1hZ2VQcm9wZXJ0eSIsIm5ld1RhcmdldCIsInNldFRhcmdldFByb3BlcnR5IiwiaW1hZ2VQcm9wZXJ0eSIsInByb3BlcnR5IiwiZ2V0SW1hZ2VQcm9wZXJ0eSIsImludmFsaWRhdGVNaXBtYXBzIiwiX2ludmFsaWRhdGVIaXRUZXN0RGF0YSIsInNldEltYWdlV2l0aFNpemUiLCJzZXRJbml0aWFsV2lkdGgiLCJzZXRJbml0aWFsSGVpZ2h0Iiwic2V0SW1hZ2VPcGFjaXR5IiwiaXNGaW5pdGUiLCJfaW1hZ2VPcGFjaXR5IiwiZ2V0SW1hZ2VPcGFjaXR5IiwiZ2V0SW5pdGlhbFdpZHRoIiwiZ2V0SW5pdGlhbEhlaWdodCIsInNldE1pcG1hcCIsImlzTWlwbWFwIiwic2V0TWlwbWFwQmlhcyIsImJpYXMiLCJfbWlwbWFwQmlhcyIsImdldE1pcG1hcEJpYXMiLCJzZXRNaXBtYXBJbml0aWFsTGV2ZWwiLCJsZXZlbCIsImdldE1pcG1hcEluaXRpYWxMZXZlbCIsInNldE1pcG1hcE1heExldmVsIiwiZ2V0TWlwbWFwTWF4TGV2ZWwiLCJzZXRIaXRUZXN0UGl4ZWxzIiwiX2hpdFRlc3RQaXhlbHMiLCJnZXRIaXRUZXN0UGl4ZWxzIiwiX2NvbnN0cnVjdE5leHRNaXBtYXAiLCJfbWlwbWFwQ2FudmFzZXMiLCJiaWdnZXJDYW52YXMiLCJjYW52YXMiLCJjZWlsIiwiY29udGV4dCIsInNjYWxlIiwiZHJhd0ltYWdlIiwicHVzaCIsIl9taXBtYXBVUkxzIiwidG9EYXRhVVJMIiwiayIsInVybCIsInVwZGF0ZUNhbnZhcyIsImJhc2VDYW52YXMiLCJnZXRJbWFnZVdpZHRoIiwiZ2V0SW1hZ2VIZWlnaHQiLCJiYXNlQ29udGV4dCIsIm1pcG1hcEVtaXR0ZXIiLCJlbWl0IiwiZ2V0TWlwbWFwTGV2ZWwiLCJtYXRyaXgiLCJhZGRpdGlvbmFsQmlhcyIsImdldEFwcHJveGltYXRlTWF0cml4U2NhbGUiLCJ3aW5kb3ciLCJkZXZpY2VQaXhlbFJhdGlvIiwiZ2V0TWlwbWFwTGV2ZWxGcm9tU2NhbGUiLCJyb3VuZFN5bW1ldHJpYyIsImN1cnJlbnRMZXZlbCIsIm1pbiIsImdldE1pcG1hcENhbnZhcyIsImdldE1pcG1hcFVSTCIsImhhc01pcG1hcHMiLCJfaGl0VGVzdEltYWdlRGF0YSIsImdldEhpdFRlc3REYXRhIiwiaW1hZ2VXaWR0aCIsImltYWdlSGVpZ2h0IiwiZGV0ZWN0ZWRXaWR0aCIsIm5hdHVyYWxXaWR0aCIsImRldGVjdGVkSGVpZ2h0IiwibmF0dXJhbEhlaWdodCIsImdldEltYWdlVVJMIiwiaXNEaXNwb3NlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJfaW1hZ2VMb2FkTGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiX29uSW1hZ2VMb2FkIiwiZGlzcG9zZSIsImFyZ3MiLCJiaW5kIiwiZ2V0SW1hZ2VEYXRhIiwidGVzdEhpdFRlc3REYXRhIiwiaW1hZ2VEYXRhIiwicG9pbnQiLCJjbGFtcCIsImZsb29yIiwieSIsImluZGV4IiwiZGF0YSIsImhpdFRlc3REYXRhVG9TaGFwZSIsIndpZHRoU2NhbGUiLCJoZWlnaHRTY2FsZSIsInNoYXBlIiwiYWN0aXZlIiwicmVjdCIsImdldFNpbXBsaWZpZWRBcmVhU2hhcGUiLCJjcmVhdGVTVkdJbWFnZSIsImVsZW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJzZXRBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGVOUyIsImNyZWF0ZUZhc3RNaXBtYXBGcm9tQ2FudmFzIiwibWlwbWFwcyIsImJhc2VVUkwiLCJiYXNlSW1hZ2UiLCJJbWFnZSIsImxhcmdlQ2FudmFzIiwic2V0VHJhbnNmb3JtIiwibWlwbWFwTGV2ZWwiLCJzcXJ0IiwibTAwIiwibTEwIiwibTAxIiwibTExIiwiQ0FOVkFTX01JUE1BUF9CSUFTX0FESlVTVE1FTlQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxpQkFBaUIsa0NBQWtDO0FBQzFELE9BQU9DLDRCQUE0Qiw2Q0FBNkM7QUFJaEYsT0FBT0MsV0FBVywyQkFBMkI7QUFFN0MsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBRzdELFNBQVNDLE9BQU8sRUFBRUMsS0FBSyxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhELHFDQUFxQztBQUNyQyxNQUFNQyxPQUFPQyxLQUFLRCxJQUFJLElBQUksU0FBVUUsQ0FBUztJQUFLLE9BQU9ELEtBQUtFLEdBQUcsQ0FBRUQsS0FBTUQsS0FBS0csR0FBRztBQUFFO0FBRW5GLE1BQU1DLGtCQUFrQjtJQUN0QkMsY0FBYztJQUNkQyxjQUFjO0lBQ2RDLGVBQWU7SUFDZkMsUUFBUTtJQUNSQyxZQUFZO0lBQ1pDLG9CQUFvQjtJQUNwQkMsZ0JBQWdCO0lBQ2hCQyxlQUFlO0FBQ2pCO0FBRUEsOEZBQThGO0FBQzlGLElBQUlDLGdC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