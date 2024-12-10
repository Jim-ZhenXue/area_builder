// Copyright 2015-2023, University of Colorado Boulder
/**
 * A single Canvas/texture with multiple different images (sprites) drawn internally. During rendering, this texture
 * can be used in one draw call to render multiple different images by providing UV coordinates to each quad for each
 * image to be drawn.
 *
 * Note that the WebGL texture part is not required to be run - the Canvas-only part can be used functionally without
 * any WebGL dependencies.
 *
 * TODO: How to use custom mipmap levels? https://github.com/phetsims/scenery/issues/1581
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import BinPacker from '../../../dot/js/BinPacker.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { scenery } from '../imports.js';
// constants
// The max SpriteSheet size was selected to minimize memory overhead while still accommodating many large images
// See https://github.com/phetsims/scenery/issues/539
const MAX_DIMENSION = new Dimension2(1024, 1024);
// Amount of space along the edge of each image that is filled with the closest adjacent pixel value. This helps
// get rid of alpha fading, see https://github.com/phetsims/scenery/issues/637.
const GUTTER_SIZE = 1;
// Amount of blank space along the bottom and right of each image that is left transparent, to avoid graphical
// artifacts due to texture filtering blending the adjacent image in.
// See https://github.com/phetsims/scenery/issues/637.
const PADDING = 1;
let SpriteSheet = class SpriteSheet {
    /**
   * Initialize (or reinitialize) ourself with a new GL context. Should be called at least once before updateTexture()
   *
   * NOTE: Should be safe to call with a different context (will recreate a different texture) should this be needed
   *       for things like context loss.
   */ initializeContext(gl) {
        this.gl = gl;
        this.createTexture();
    }
    /**
   * Allocates and creates a GL texture, configures it, and initializes it with our current Canvas.
   */ createTexture() {
        const gl = this.gl;
        assert && assert(gl);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        // NOTE: We switched back to a fully premultiplied setup, and we were running into issues with the default
        // filtering/interpolation EXPECTING the texture ITSELF to be premultipled to work correctly (particularly with
        // textures that are larger or smaller on the screen).
        // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
        // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); // work with premultiplied numbers
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
        if (this.useMipmaps) {
            gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.dirty = false;
    }
    /**
   * Updates a pre-existing texture with our current Canvas.
   */ updateTexture() {
        assert && assert(this.gl, 'SpriteSheet needs context to updateTexture()');
        if (this.dirty) {
            this.dirty = false;
            const gl = this.gl;
            assert && assert(gl);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
            if (this.useMipmaps) {
                gl.hint(gl.GENERATE_MIPMAP_HINT, gl.NICEST);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
    /**
   * Adds an image (if possible) to our sprite sheet. If successful, will return a {Sprite}, otherwise null.
   *
   * @param image
   * @param width - Passed in, since it may not be fully loaded yet?
   * @param height - Passed in, since it may not be fully loaded yet?
   */ addImage(image, width, height) {
        let i;
        // check used cache
        for(i = 0; i < this.usedSprites.length; i++){
            const usedSprite = this.usedSprites[i];
            if (usedSprite.image === image) {
                usedSprite.count++;
                return usedSprite;
            }
        }
        // check unused cache
        for(i = 0; i < this.unusedSprites.length; i++){
            const unusedSprite = this.unusedSprites[i];
            if (unusedSprite.image === image) {
                unusedSprite.count++;
                assert && assert(unusedSprite.count === 1, 'Count should be exactly 1 after coming back from being unused');
                this.unusedSprites.splice(i, 1); // remove it from the unused array
                this.usedSprites.push(unusedSprite); // add it to the used array
                return unusedSprite;
            }
        }
        // Not in any caches, let's try to find space. If we can't find space at first, we start removing unused sprites
        // one-by-one.
        let bin;
        // Enters 'while' loop only if allocate() returns null and we have unused sprites (i.e. conditions where we will
        // want to deallocate the least recently used (LRU) unused sprite and then check for allocation again).
        while(!(bin = this.binPacker.allocate(width + 2 * GUTTER_SIZE + PADDING, height + 2 * GUTTER_SIZE + PADDING)) && this.unusedSprites.length){
            const ejectedSprite = this.unusedSprites.shift(); // LRU policy by taking first item
            // clear its space in the Canvas
            this.dirty = true;
            const ejectedBounds = ejectedSprite.bin.bounds;
            this.context.clearRect(ejectedBounds.x, ejectedBounds.y, ejectedBounds.width, ejectedBounds.height);
            // deallocate its area in the bin packer
            this.binPacker.deallocate(ejectedSprite.bin);
        }
        if (bin) {
            // WebGL will want UV coordinates in the [0,1] range
            // We need to chop off the gutters (on all sides), and the padding (on the bottom and right)
            const uvBounds = new Bounds2((bin.bounds.minX + GUTTER_SIZE) / this.width, (bin.bounds.minY + GUTTER_SIZE) / this.height, (bin.bounds.maxX - GUTTER_SIZE - PADDING) / this.width, (bin.bounds.maxY - GUTTER_SIZE - PADDING) / this.height);
            const sprite = new Sprite(this, bin, uvBounds, image, 1);
            this.copyImageWithGutter(image, width, height, bin.bounds.x, bin.bounds.y);
            this.dirty = true;
            this.usedSprites.push(sprite);
            return sprite;
        } else {
            return null;
        }
    }
    /**
   * Removes an image from our spritesheet. (Removes one from the amount it is used, and if it is 0, gets actually
   * removed).
   */ removeImage(image) {
        // find the used sprite (and its index)
        let usedSprite;
        let i;
        for(i = 0; i < this.usedSprites.length; i++){
            if (this.usedSprites[i].image === image) {
                usedSprite = this.usedSprites[i];
                break;
            }
        }
        assert && assert(usedSprite, 'Sprite not found for removeImage');
        // if we have no more references to the image/sprite
        if (--usedSprite.count <= 0) {
            this.usedSprites.splice(i, 1); // remove it from the used list
            this.unusedSprites.push(usedSprite); // add it to the unused list
        }
    // NOTE: no modification to the Canvas/texture is made, since we can leave it drawn there and unreferenced.
    // If addImage( image ) is called for the same image, we can 'resurrect' it without any further Canvas/texture
    // changes being made.
    }
    /**
   * Whether the sprite for the specified image is handled by this spritesheet. It can be either used or unused, but
   * addImage() calls with the specified image should be extremely fast (no need to modify the Canvas or texture).
   */ containsImage(image) {
        let i;
        // check used cache
        for(i = 0; i < this.usedSprites.length; i++){
            if (this.usedSprites[i].image === image) {
                return true;
            }
        }
        // check unused cache
        for(i = 0; i < this.unusedSprites.length; i++){
            if (this.unusedSprites[i].image === image) {
                return true;
            }
        }
        return false;
    }
    /**
   * Copes the image (width x height) centered into a bin (width+2 x height+2) at (binX,binY), where the padding
   * along the edges is filled with the next closest pixel in the actual image.
   */ copyImageWithGutter(image, width, height, binX, binY) {
        assert && assert(GUTTER_SIZE === 1);
        // Corners, all 1x1
        this.copyImageRegion(image, 1, 1, 0, 0, binX, binY);
        this.copyImageRegion(image, 1, 1, width - 1, 0, binX + 1 + width, binY);
        this.copyImageRegion(image, 1, 1, width - 1, height - 1, binX + 1 + width, binY + 1 + height);
        this.copyImageRegion(image, 1, 1, 0, height - 1, binX, binY + 1 + height);
        // Edges
        this.copyImageRegion(image, width, 1, 0, 0, binX + 1, binY);
        this.copyImageRegion(image, width, 1, 0, height - 1, binX + 1, binY + 1 + height);
        this.copyImageRegion(image, 1, height, 0, 0, binX, binY + 1);
        this.copyImageRegion(image, 1, height, width - 1, 0, binX + 1 + width, binY + 1);
        this.context.drawImage(image, binX + 1, binY + 1);
    }
    /**
   * Helper for drawing gutters.
   */ copyImageRegion(image, width, height, sourceX, sourceY, destinationX, destinationY) {
        this.context.drawImage(image, sourceX, sourceY, width, height, destinationX, destinationY, width, height);
    }
    /**
   * @param useMipmaps - Whether built-in WebGL mipmapping should be used. Higher quality, but may be slower
   *                     to add images (since mipmaps need to be updated).
   */ constructor(useMipmaps){
        this.useMipmaps = useMipmaps;
        // Will be passed in with initializeContext
        this.gl = null;
        // Will be set later, once we have a context
        this.texture = null;
        // TODO: potentially support larger texture sizes based on reported capabilities (could cause fewer draw calls?) https://github.com/phetsims/scenery/issues/1581
        this.bounds = new Bounds2(0, 0, MAX_DIMENSION.width, MAX_DIMENSION.height);
        assert && assert(this.bounds.minX === 0 && this.bounds.minY === 0, 'Assumed constraint later on for transforms');
        this.width = this.bounds.width;
        this.height = this.bounds.height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');
        this.binPacker = new BinPacker(this.bounds);
        this.dirty = true;
        this.usedSprites = [];
        this.unusedSprites = [];
    }
};
// the size of a sprite sheet
SpriteSheet.MAX_DIMENSION = MAX_DIMENSION;
export { SpriteSheet as default };
scenery.register('SpriteSheet', SpriteSheet);
let Sprite = class Sprite {
    /**
   * A reference to a specific part of the texture that can be used.
   */ constructor(spriteSheet, bin, uvBounds, image, initialCount){
        this.spriteSheet = spriteSheet;
        this.bin = bin;
        this.uvBounds = uvBounds;
        this.image = image;
        this.count = initialCount;
    }
};
SpriteSheet.Sprite = Sprite;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9TcHJpdGVTaGVldC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNpbmdsZSBDYW52YXMvdGV4dHVyZSB3aXRoIG11bHRpcGxlIGRpZmZlcmVudCBpbWFnZXMgKHNwcml0ZXMpIGRyYXduIGludGVybmFsbHkuIER1cmluZyByZW5kZXJpbmcsIHRoaXMgdGV4dHVyZVxuICogY2FuIGJlIHVzZWQgaW4gb25lIGRyYXcgY2FsbCB0byByZW5kZXIgbXVsdGlwbGUgZGlmZmVyZW50IGltYWdlcyBieSBwcm92aWRpbmcgVVYgY29vcmRpbmF0ZXMgdG8gZWFjaCBxdWFkIGZvciBlYWNoXG4gKiBpbWFnZSB0byBiZSBkcmF3bi5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIFdlYkdMIHRleHR1cmUgcGFydCBpcyBub3QgcmVxdWlyZWQgdG8gYmUgcnVuIC0gdGhlIENhbnZhcy1vbmx5IHBhcnQgY2FuIGJlIHVzZWQgZnVuY3Rpb25hbGx5IHdpdGhvdXRcbiAqIGFueSBXZWJHTCBkZXBlbmRlbmNpZXMuXG4gKlxuICogVE9ETzogSG93IHRvIHVzZSBjdXN0b20gbWlwbWFwIGxldmVscz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCaW5QYWNrZXIsIHsgQmluIH0gZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JpblBhY2tlci5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuLy8gVGhlIG1heCBTcHJpdGVTaGVldCBzaXplIHdhcyBzZWxlY3RlZCB0byBtaW5pbWl6ZSBtZW1vcnkgb3ZlcmhlYWQgd2hpbGUgc3RpbGwgYWNjb21tb2RhdGluZyBtYW55IGxhcmdlIGltYWdlc1xuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MzlcbmNvbnN0IE1BWF9ESU1FTlNJT04gPSBuZXcgRGltZW5zaW9uMiggMTAyNCwgMTAyNCApO1xuXG4vLyBBbW91bnQgb2Ygc3BhY2UgYWxvbmcgdGhlIGVkZ2Ugb2YgZWFjaCBpbWFnZSB0aGF0IGlzIGZpbGxlZCB3aXRoIHRoZSBjbG9zZXN0IGFkamFjZW50IHBpeGVsIHZhbHVlLiBUaGlzIGhlbHBzXG4vLyBnZXQgcmlkIG9mIGFscGhhIGZhZGluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy82MzcuXG5jb25zdCBHVVRURVJfU0laRSA9IDE7XG5cbi8vIEFtb3VudCBvZiBibGFuayBzcGFjZSBhbG9uZyB0aGUgYm90dG9tIGFuZCByaWdodCBvZiBlYWNoIGltYWdlIHRoYXQgaXMgbGVmdCB0cmFuc3BhcmVudCwgdG8gYXZvaWQgZ3JhcGhpY2FsXG4vLyBhcnRpZmFjdHMgZHVlIHRvIHRleHR1cmUgZmlsdGVyaW5nIGJsZW5kaW5nIHRoZSBhZGphY2VudCBpbWFnZSBpbi5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjM3LlxuY29uc3QgUEFERElORyA9IDE7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwcml0ZVNoZWV0IHtcblxuICBwcml2YXRlIHVzZU1pcG1hcHM6IGJvb2xlYW47XG4gIHByaXZhdGUgZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCB8IG51bGw7XG4gIHB1YmxpYyB0ZXh0dXJlOiBXZWJHTFRleHR1cmUgfCBudWxsO1xuXG4gIC8vIFRoZSB0b3AtbGV2ZWwgYm91bmRpbmcgYm94IGZvciB0ZXh0dXJlIGNvbnRlbnQuIEFsbCBzcHJpdGVzIHdpbGwgaGF2ZSBjb29yZGluYXRlIGJvdW5kaW5nXG4gIC8vIGJveGVzIHRoYXQgYXJlIGluY2x1ZGVkIGluIHRoZXNlIGJvdW5kcy5cbiAgcHJpdmF0ZSBib3VuZHM6IEJvdW5kczI7XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgcHJpdmF0ZSBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG5cbiAgLy8gSGFuZGxlcyBob3cgb3VyIGF2YWlsYWJsZSBhcmVhIGlzIHBhcnRpdGlvbmVkIGludG8gc3ByaXRlcy5cbiAgcHJpdmF0ZSBiaW5QYWNrZXI6IEJpblBhY2tlcjtcblxuICAvLyBXaGV0aGVyIHRoaXMgc3ByaXRlc2hlZXQgbmVlZHMgdXBkYXRlcy5cbiAgcHJpdmF0ZSBkaXJ0eTogYm9vbGVhbjtcblxuICBwcml2YXRlIHVzZWRTcHJpdGVzOiBTcHJpdGVbXTtcblxuICAvLyB3b3JrcyBhcyBhIExSVSBjYWNoZSBmb3IgcmVtb3ZpbmcgaXRlbXMgd2hlbiB3ZSBuZWVkIHRvIGFsbG9jYXRlIG5ldyBzcGFjZVxuICBwcml2YXRlIHVudXNlZFNwcml0ZXM6IFNwcml0ZVtdO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdXNlTWlwbWFwcyAtIFdoZXRoZXIgYnVpbHQtaW4gV2ViR0wgbWlwbWFwcGluZyBzaG91bGQgYmUgdXNlZC4gSGlnaGVyIHF1YWxpdHksIGJ1dCBtYXkgYmUgc2xvd2VyXG4gICAqICAgICAgICAgICAgICAgICAgICAgdG8gYWRkIGltYWdlcyAoc2luY2UgbWlwbWFwcyBuZWVkIHRvIGJlIHVwZGF0ZWQpLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB1c2VNaXBtYXBzOiBib29sZWFuICkge1xuICAgIHRoaXMudXNlTWlwbWFwcyA9IHVzZU1pcG1hcHM7XG5cbiAgICAvLyBXaWxsIGJlIHBhc3NlZCBpbiB3aXRoIGluaXRpYWxpemVDb250ZXh0XG4gICAgdGhpcy5nbCA9IG51bGw7XG5cbiAgICAvLyBXaWxsIGJlIHNldCBsYXRlciwgb25jZSB3ZSBoYXZlIGEgY29udGV4dFxuICAgIHRoaXMudGV4dHVyZSA9IG51bGw7XG5cbiAgICAvLyBUT0RPOiBwb3RlbnRpYWxseSBzdXBwb3J0IGxhcmdlciB0ZXh0dXJlIHNpemVzIGJhc2VkIG9uIHJlcG9ydGVkIGNhcGFiaWxpdGllcyAoY291bGQgY2F1c2UgZmV3ZXIgZHJhdyBjYWxscz8pIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgTUFYX0RJTUVOU0lPTi53aWR0aCwgTUFYX0RJTUVOU0lPTi5oZWlnaHQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJvdW5kcy5taW5YID09PSAwICYmIHRoaXMuYm91bmRzLm1pblkgPT09IDAsICdBc3N1bWVkIGNvbnN0cmFpbnQgbGF0ZXIgb24gZm9yIHRyYW5zZm9ybXMnICk7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5ib3VuZHMud2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmJvdW5kcy5oZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XG5cbiAgICB0aGlzLmJpblBhY2tlciA9IG5ldyBCaW5QYWNrZXIoIHRoaXMuYm91bmRzICk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLnVzZWRTcHJpdGVzID0gW107XG4gICAgdGhpcy51bnVzZWRTcHJpdGVzID0gW107XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSAob3IgcmVpbml0aWFsaXplKSBvdXJzZWxmIHdpdGggYSBuZXcgR0wgY29udGV4dC4gU2hvdWxkIGJlIGNhbGxlZCBhdCBsZWFzdCBvbmNlIGJlZm9yZSB1cGRhdGVUZXh0dXJlKClcbiAgICpcbiAgICogTk9URTogU2hvdWxkIGJlIHNhZmUgdG8gY2FsbCB3aXRoIGEgZGlmZmVyZW50IGNvbnRleHQgKHdpbGwgcmVjcmVhdGUgYSBkaWZmZXJlbnQgdGV4dHVyZSkgc2hvdWxkIHRoaXMgYmUgbmVlZGVkXG4gICAqICAgICAgIGZvciB0aGluZ3MgbGlrZSBjb250ZXh0IGxvc3MuXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZUNvbnRleHQoIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgKTogdm9pZCB7XG4gICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgdGhpcy5jcmVhdGVUZXh0dXJlKCk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb2NhdGVzIGFuZCBjcmVhdGVzIGEgR0wgdGV4dHVyZSwgY29uZmlndXJlcyBpdCwgYW5kIGluaXRpYWxpemVzIGl0IHdpdGggb3VyIGN1cnJlbnQgQ2FudmFzLlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVUZXh0dXJlKCk6IHZvaWQge1xuICAgIGNvbnN0IGdsID0gdGhpcy5nbCE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2wgKTtcblxuICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgdGhpcy50ZXh0dXJlICk7XG4gICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UgKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSApO1xuICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy51c2VNaXBtYXBzID8gZ2wuTElORUFSX01JUE1BUF9MSU5FQVIgOiBnbC5MSU5FQVIgKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKCBnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLkxJTkVBUiApO1xuICAgIGdsLnBpeGVsU3RvcmVpKCBnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCBmYWxzZSApO1xuICAgIC8vIE5PVEU6IFdlIHN3aXRjaGVkIGJhY2sgdG8gYSBmdWxseSBwcmVtdWx0aXBsaWVkIHNldHVwLCBhbmQgd2Ugd2VyZSBydW5uaW5nIGludG8gaXNzdWVzIHdpdGggdGhlIGRlZmF1bHRcbiAgICAvLyBmaWx0ZXJpbmcvaW50ZXJwb2xhdGlvbiBFWFBFQ1RJTkcgdGhlIHRleHR1cmUgSVRTRUxGIHRvIGJlIHByZW11bHRpcGxlZCB0byB3b3JrIGNvcnJlY3RseSAocGFydGljdWxhcmx5IHdpdGhcbiAgICAvLyB0ZXh0dXJlcyB0aGF0IGFyZSBsYXJnZXIgb3Igc21hbGxlciBvbiB0aGUgc2NyZWVuKS5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8zOSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM5N1xuICAgIC8vIGFuZCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTM0MTU2NC93ZWJnbC1ob3ctdG8tY29ycmVjdGx5LWJsZW5kLWFscGhhLWNoYW5uZWwtcG5nXG4gICAgZ2wucGl4ZWxTdG9yZWkoIGdsLlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgdHJ1ZSApOyAvLyB3b3JrIHdpdGggcHJlbXVsdGlwbGllZCBudW1iZXJzXG4gICAgZ2wudGV4SW1hZ2UyRCggZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgdGhpcy5jYW52YXMgKTtcbiAgICBpZiAoIHRoaXMudXNlTWlwbWFwcyApIHtcbiAgICAgIGdsLmhpbnQoIGdsLkdFTkVSQVRFX01JUE1BUF9ISU5ULCBnbC5OSUNFU1QgKTtcbiAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKCBnbC5URVhUVVJFXzJEICk7XG4gICAgfVxuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCBudWxsICk7XG5cbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBhIHByZS1leGlzdGluZyB0ZXh0dXJlIHdpdGggb3VyIGN1cnJlbnQgQ2FudmFzLlxuICAgKi9cbiAgcHVibGljIHVwZGF0ZVRleHR1cmUoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5nbCwgJ1Nwcml0ZVNoZWV0IG5lZWRzIGNvbnRleHQgdG8gdXBkYXRlVGV4dHVyZSgpJyApO1xuXG4gICAgaWYgKCB0aGlzLmRpcnR5ICkge1xuICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBjb25zdCBnbCA9IHRoaXMuZ2whO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZ2wgKTtcblxuICAgICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSApO1xuICAgICAgZ2wudGV4SW1hZ2UyRCggZ2wuVEVYVFVSRV8yRCwgMCwgZ2wuUkdCQSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgdGhpcy5jYW52YXMgKTtcbiAgICAgIGlmICggdGhpcy51c2VNaXBtYXBzICkge1xuICAgICAgICBnbC5oaW50KCBnbC5HRU5FUkFURV9NSVBNQVBfSElOVCwgZ2wuTklDRVNUICk7XG4gICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKCBnbC5URVhUVVJFXzJEICk7XG4gICAgICB9XG4gICAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgbnVsbCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGltYWdlIChpZiBwb3NzaWJsZSkgdG8gb3VyIHNwcml0ZSBzaGVldC4gSWYgc3VjY2Vzc2Z1bCwgd2lsbCByZXR1cm4gYSB7U3ByaXRlfSwgb3RoZXJ3aXNlIG51bGwuXG4gICAqXG4gICAqIEBwYXJhbSBpbWFnZVxuICAgKiBAcGFyYW0gd2lkdGggLSBQYXNzZWQgaW4sIHNpbmNlIGl0IG1heSBub3QgYmUgZnVsbHkgbG9hZGVkIHlldD9cbiAgICogQHBhcmFtIGhlaWdodCAtIFBhc3NlZCBpbiwgc2luY2UgaXQgbWF5IG5vdCBiZSBmdWxseSBsb2FkZWQgeWV0P1xuICAgKi9cbiAgcHVibGljIGFkZEltYWdlKCBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBTcHJpdGUgfCBudWxsIHtcbiAgICBsZXQgaTtcblxuICAgIC8vIGNoZWNrIHVzZWQgY2FjaGVcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMudXNlZFNwcml0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB1c2VkU3ByaXRlID0gdGhpcy51c2VkU3ByaXRlc1sgaSBdO1xuICAgICAgaWYgKCB1c2VkU3ByaXRlLmltYWdlID09PSBpbWFnZSApIHtcbiAgICAgICAgdXNlZFNwcml0ZS5jb3VudCsrO1xuICAgICAgICByZXR1cm4gdXNlZFNwcml0ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGVjayB1bnVzZWQgY2FjaGVcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMudW51c2VkU3ByaXRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHVudXNlZFNwcml0ZSA9IHRoaXMudW51c2VkU3ByaXRlc1sgaSBdO1xuICAgICAgaWYgKCB1bnVzZWRTcHJpdGUuaW1hZ2UgPT09IGltYWdlICkge1xuICAgICAgICB1bnVzZWRTcHJpdGUuY291bnQrKztcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdW51c2VkU3ByaXRlLmNvdW50ID09PSAxLCAnQ291bnQgc2hvdWxkIGJlIGV4YWN0bHkgMSBhZnRlciBjb21pbmcgYmFjayBmcm9tIGJlaW5nIHVudXNlZCcgKTtcbiAgICAgICAgdGhpcy51bnVzZWRTcHJpdGVzLnNwbGljZSggaSwgMSApOyAvLyByZW1vdmUgaXQgZnJvbSB0aGUgdW51c2VkIGFycmF5XG4gICAgICAgIHRoaXMudXNlZFNwcml0ZXMucHVzaCggdW51c2VkU3ByaXRlICk7IC8vIGFkZCBpdCB0byB0aGUgdXNlZCBhcnJheVxuICAgICAgICByZXR1cm4gdW51c2VkU3ByaXRlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE5vdCBpbiBhbnkgY2FjaGVzLCBsZXQncyB0cnkgdG8gZmluZCBzcGFjZS4gSWYgd2UgY2FuJ3QgZmluZCBzcGFjZSBhdCBmaXJzdCwgd2Ugc3RhcnQgcmVtb3ZpbmcgdW51c2VkIHNwcml0ZXNcbiAgICAvLyBvbmUtYnktb25lLlxuICAgIGxldCBiaW47XG4gICAgLy8gRW50ZXJzICd3aGlsZScgbG9vcCBvbmx5IGlmIGFsbG9jYXRlKCkgcmV0dXJucyBudWxsIGFuZCB3ZSBoYXZlIHVudXNlZCBzcHJpdGVzIChpLmUuIGNvbmRpdGlvbnMgd2hlcmUgd2Ugd2lsbFxuICAgIC8vIHdhbnQgdG8gZGVhbGxvY2F0ZSB0aGUgbGVhc3QgcmVjZW50bHkgdXNlZCAoTFJVKSB1bnVzZWQgc3ByaXRlIGFuZCB0aGVuIGNoZWNrIGZvciBhbGxvY2F0aW9uIGFnYWluKS5cbiAgICB3aGlsZSAoICEoIGJpbiA9IHRoaXMuYmluUGFja2VyLmFsbG9jYXRlKCB3aWR0aCArIDIgKiBHVVRURVJfU0laRSArIFBBRERJTkcsIGhlaWdodCArIDIgKiBHVVRURVJfU0laRSArIFBBRERJTkcgKSApICYmIHRoaXMudW51c2VkU3ByaXRlcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBlamVjdGVkU3ByaXRlID0gdGhpcy51bnVzZWRTcHJpdGVzLnNoaWZ0KCkhOyAvLyBMUlUgcG9saWN5IGJ5IHRha2luZyBmaXJzdCBpdGVtXG5cbiAgICAgIC8vIGNsZWFyIGl0cyBzcGFjZSBpbiB0aGUgQ2FudmFzXG4gICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGVqZWN0ZWRCb3VuZHMgPSBlamVjdGVkU3ByaXRlLmJpbi5ib3VuZHM7XG4gICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KCBlamVjdGVkQm91bmRzLngsIGVqZWN0ZWRCb3VuZHMueSwgZWplY3RlZEJvdW5kcy53aWR0aCwgZWplY3RlZEJvdW5kcy5oZWlnaHQgKTtcblxuICAgICAgLy8gZGVhbGxvY2F0ZSBpdHMgYXJlYSBpbiB0aGUgYmluIHBhY2tlclxuICAgICAgdGhpcy5iaW5QYWNrZXIuZGVhbGxvY2F0ZSggZWplY3RlZFNwcml0ZS5iaW4gKTtcbiAgICB9XG5cbiAgICBpZiAoIGJpbiApIHtcbiAgICAgIC8vIFdlYkdMIHdpbGwgd2FudCBVViBjb29yZGluYXRlcyBpbiB0aGUgWzAsMV0gcmFuZ2VcbiAgICAgIC8vIFdlIG5lZWQgdG8gY2hvcCBvZmYgdGhlIGd1dHRlcnMgKG9uIGFsbCBzaWRlcyksIGFuZCB0aGUgcGFkZGluZyAob24gdGhlIGJvdHRvbSBhbmQgcmlnaHQpXG4gICAgICBjb25zdCB1dkJvdW5kcyA9IG5ldyBCb3VuZHMyKFxuICAgICAgICAoIGJpbi5ib3VuZHMubWluWCArIEdVVFRFUl9TSVpFICkgLyB0aGlzLndpZHRoLFxuICAgICAgICAoIGJpbi5ib3VuZHMubWluWSArIEdVVFRFUl9TSVpFICkgLyB0aGlzLmhlaWdodCxcbiAgICAgICAgKCBiaW4uYm91bmRzLm1heFggLSBHVVRURVJfU0laRSAtIFBBRERJTkcgKSAvIHRoaXMud2lkdGgsXG4gICAgICAgICggYmluLmJvdW5kcy5tYXhZIC0gR1VUVEVSX1NJWkUgLSBQQURESU5HICkgLyB0aGlzLmhlaWdodCApO1xuICAgICAgY29uc3Qgc3ByaXRlID0gbmV3IFNwcml0ZSggdGhpcywgYmluLCB1dkJvdW5kcywgaW1hZ2UsIDEgKTtcblxuICAgICAgdGhpcy5jb3B5SW1hZ2VXaXRoR3V0dGVyKCBpbWFnZSwgd2lkdGgsIGhlaWdodCwgYmluLmJvdW5kcy54LCBiaW4uYm91bmRzLnkgKTtcblxuICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLnVzZWRTcHJpdGVzLnB1c2goIHNwcml0ZSApO1xuICAgICAgcmV0dXJuIHNwcml0ZTtcbiAgICB9XG4gICAgLy8gbm8gc3BhY2UsIGV2ZW4gYWZ0ZXIgY2xlYXJpbmcgb3V0IG91ciB1bnVzZWQgc3ByaXRlc1xuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gaW1hZ2UgZnJvbSBvdXIgc3ByaXRlc2hlZXQuIChSZW1vdmVzIG9uZSBmcm9tIHRoZSBhbW91bnQgaXQgaXMgdXNlZCwgYW5kIGlmIGl0IGlzIDAsIGdldHMgYWN0dWFsbHlcbiAgICogcmVtb3ZlZCkuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlSW1hZ2UoIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudCB8IEhUTUxJbWFnZUVsZW1lbnQgKTogdm9pZCB7XG4gICAgLy8gZmluZCB0aGUgdXNlZCBzcHJpdGUgKGFuZCBpdHMgaW5kZXgpXG4gICAgbGV0IHVzZWRTcHJpdGU6IFNwcml0ZTtcbiAgICBsZXQgaTtcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMudXNlZFNwcml0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMudXNlZFNwcml0ZXNbIGkgXS5pbWFnZSA9PT0gaW1hZ2UgKSB7XG4gICAgICAgIHVzZWRTcHJpdGUgPSB0aGlzLnVzZWRTcHJpdGVzWyBpIF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB1c2VkU3ByaXRlISwgJ1Nwcml0ZSBub3QgZm91bmQgZm9yIHJlbW92ZUltYWdlJyApO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSBubyBtb3JlIHJlZmVyZW5jZXMgdG8gdGhlIGltYWdlL3Nwcml0ZVxuICAgIGlmICggLS11c2VkU3ByaXRlIS5jb3VudCA8PSAwICkge1xuICAgICAgdGhpcy51c2VkU3ByaXRlcy5zcGxpY2UoIGksIDEgKTsgLy8gcmVtb3ZlIGl0IGZyb20gdGhlIHVzZWQgbGlzdFxuICAgICAgdGhpcy51bnVzZWRTcHJpdGVzLnB1c2goIHVzZWRTcHJpdGUhICk7IC8vIGFkZCBpdCB0byB0aGUgdW51c2VkIGxpc3RcbiAgICB9XG5cbiAgICAvLyBOT1RFOiBubyBtb2RpZmljYXRpb24gdG8gdGhlIENhbnZhcy90ZXh0dXJlIGlzIG1hZGUsIHNpbmNlIHdlIGNhbiBsZWF2ZSBpdCBkcmF3biB0aGVyZSBhbmQgdW5yZWZlcmVuY2VkLlxuICAgIC8vIElmIGFkZEltYWdlKCBpbWFnZSApIGlzIGNhbGxlZCBmb3IgdGhlIHNhbWUgaW1hZ2UsIHdlIGNhbiAncmVzdXJyZWN0JyBpdCB3aXRob3V0IGFueSBmdXJ0aGVyIENhbnZhcy90ZXh0dXJlXG4gICAgLy8gY2hhbmdlcyBiZWluZyBtYWRlLlxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNwcml0ZSBmb3IgdGhlIHNwZWNpZmllZCBpbWFnZSBpcyBoYW5kbGVkIGJ5IHRoaXMgc3ByaXRlc2hlZXQuIEl0IGNhbiBiZSBlaXRoZXIgdXNlZCBvciB1bnVzZWQsIGJ1dFxuICAgKiBhZGRJbWFnZSgpIGNhbGxzIHdpdGggdGhlIHNwZWNpZmllZCBpbWFnZSBzaG91bGQgYmUgZXh0cmVtZWx5IGZhc3QgKG5vIG5lZWQgdG8gbW9kaWZ5IHRoZSBDYW52YXMgb3IgdGV4dHVyZSkuXG4gICAqL1xuICBwdWJsaWMgY29udGFpbnNJbWFnZSggaW1hZ2U6IEhUTUxDYW52YXNFbGVtZW50IHwgSFRNTEltYWdlRWxlbWVudCApOiBib29sZWFuIHtcbiAgICBsZXQgaTtcblxuICAgIC8vIGNoZWNrIHVzZWQgY2FjaGVcbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMudXNlZFNwcml0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiAoIHRoaXMudXNlZFNwcml0ZXNbIGkgXS5pbWFnZSA9PT0gaW1hZ2UgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIHVudXNlZCBjYWNoZVxuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy51bnVzZWRTcHJpdGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLnVudXNlZFNwcml0ZXNbIGkgXS5pbWFnZSA9PT0gaW1hZ2UgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BlcyB0aGUgaW1hZ2UgKHdpZHRoIHggaGVpZ2h0KSBjZW50ZXJlZCBpbnRvIGEgYmluICh3aWR0aCsyIHggaGVpZ2h0KzIpIGF0IChiaW5YLGJpblkpLCB3aGVyZSB0aGUgcGFkZGluZ1xuICAgKiBhbG9uZyB0aGUgZWRnZXMgaXMgZmlsbGVkIHdpdGggdGhlIG5leHQgY2xvc2VzdCBwaXhlbCBpbiB0aGUgYWN0dWFsIGltYWdlLlxuICAgKi9cbiAgcHJpdmF0ZSBjb3B5SW1hZ2VXaXRoR3V0dGVyKCBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYmluWDogbnVtYmVyLCBiaW5ZOiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggR1VUVEVSX1NJWkUgPT09IDEgKTtcblxuICAgIC8vIENvcm5lcnMsIGFsbCAxeDFcbiAgICB0aGlzLmNvcHlJbWFnZVJlZ2lvbiggaW1hZ2UsIDEsIDEsIDAsIDAsIGJpblgsIGJpblkgKTtcbiAgICB0aGlzLmNvcHlJbWFnZVJlZ2lvbiggaW1hZ2UsIDEsIDEsIHdpZHRoIC0gMSwgMCwgYmluWCArIDEgKyB3aWR0aCwgYmluWSApO1xuICAgIHRoaXMuY29weUltYWdlUmVnaW9uKCBpbWFnZSwgMSwgMSwgd2lkdGggLSAxLCBoZWlnaHQgLSAxLCBiaW5YICsgMSArIHdpZHRoLCBiaW5ZICsgMSArIGhlaWdodCApO1xuICAgIHRoaXMuY29weUltYWdlUmVnaW9uKCBpbWFnZSwgMSwgMSwgMCwgaGVpZ2h0IC0gMSwgYmluWCwgYmluWSArIDEgKyBoZWlnaHQgKTtcblxuICAgIC8vIEVkZ2VzXG4gICAgdGhpcy5jb3B5SW1hZ2VSZWdpb24oIGltYWdlLCB3aWR0aCwgMSwgMCwgMCwgYmluWCArIDEsIGJpblkgKTtcbiAgICB0aGlzLmNvcHlJbWFnZVJlZ2lvbiggaW1hZ2UsIHdpZHRoLCAxLCAwLCBoZWlnaHQgLSAxLCBiaW5YICsgMSwgYmluWSArIDEgKyBoZWlnaHQgKTtcbiAgICB0aGlzLmNvcHlJbWFnZVJlZ2lvbiggaW1hZ2UsIDEsIGhlaWdodCwgMCwgMCwgYmluWCwgYmluWSArIDEgKTtcbiAgICB0aGlzLmNvcHlJbWFnZVJlZ2lvbiggaW1hZ2UsIDEsIGhlaWdodCwgd2lkdGggLSAxLCAwLCBiaW5YICsgMSArIHdpZHRoLCBiaW5ZICsgMSApO1xuXG4gICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIGJpblggKyAxLCBiaW5ZICsgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmb3IgZHJhd2luZyBndXR0ZXJzLlxuICAgKi9cbiAgcHJpdmF0ZSBjb3B5SW1hZ2VSZWdpb24oIGltYWdlOiBIVE1MQ2FudmFzRWxlbWVudCB8IEhUTUxJbWFnZUVsZW1lbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBzb3VyY2VYOiBudW1iZXIsIHNvdXJjZVk6IG51bWJlciwgZGVzdGluYXRpb25YOiBudW1iZXIsIGRlc3RpbmF0aW9uWTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoIGltYWdlLCBzb3VyY2VYLCBzb3VyY2VZLCB3aWR0aCwgaGVpZ2h0LCBkZXN0aW5hdGlvblgsIGRlc3RpbmF0aW9uWSwgd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBTcHJpdGU6IHR5cGVvZiBTcHJpdGU7XG5cbiAgLy8gdGhlIHNpemUgb2YgYSBzcHJpdGUgc2hlZXRcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQVhfRElNRU5TSU9OID0gTUFYX0RJTUVOU0lPTjtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1Nwcml0ZVNoZWV0JywgU3ByaXRlU2hlZXQgKTtcblxuY2xhc3MgU3ByaXRlIHtcblxuICAvLyBUaGUgY29udGFpbmluZyBTcHJpdGVTaGVldFxuICBwdWJsaWMgcmVhZG9ubHkgc3ByaXRlU2hlZXQ6IFNwcml0ZVNoZWV0O1xuXG4gIC8vIENvbnRhaW5zIHRoZSBhY3R1YWwgaW1hZ2UgYm91bmRzIGluIG91ciBDYW52YXMgKHBsdXMgcGFkZGluZyksIGFuZCBpcyB1c2VkIHRvIGRlYWxsb2NhdGUgKG5lZWQgdG8gY2xlYXIgdGhhdCBhcmVhKS5cbiAgLy8gKGRvdC1pbnRlcm5hbClcbiAgcHVibGljIHJlYWRvbmx5IGJpbjogQmluO1xuXG4gIC8vIE5vcm1hbGl6ZWQgYm91bmRzIGJldHdlZW4gWzAsMV0gZm9yIHRoZSBmdWxsIHRleHR1cmUgKGZvciBHTFNMIHRleHR1cmUgbG9va3VwcykuXG4gIHB1YmxpYyByZWFkb25seSB1dkJvdW5kczogQm91bmRzMjtcblxuICAvLyBJbWFnZSBlbGVtZW50IHVzZWQuIChkb3QtaW50ZXJuYWwpXG4gIHB1YmxpYyByZWFkb25seSBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50O1xuXG4gIC8vIFJlZmVyZW5jZSBjb3VudCBmb3IgbnVtYmVyIG9mIGFkZENoaWxkKCkgY2FsbHMgbWludXMgcmVtb3ZlQ2hpbGQoKSBjYWxscy4gSWYgdGhlIGNvdW50IGlzIDAsIGl0IHNob3VsZCBiZSBpbiB0aGVcbiAgLy8gJ3VudXNlZFNwcml0ZXMnIGFycmF5LCBvdGhlcndpc2UgaXQgc2hvdWxkIGJlIGluIHRoZSAndXNlZFNwcml0ZXMnIGFycmF5LiAoZG90LWludGVybmFsKVxuICBwdWJsaWMgY291bnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQSByZWZlcmVuY2UgdG8gYSBzcGVjaWZpYyBwYXJ0IG9mIHRoZSB0ZXh0dXJlIHRoYXQgY2FuIGJlIHVzZWQuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHNwcml0ZVNoZWV0OiBTcHJpdGVTaGVldCwgYmluOiBCaW4sIHV2Qm91bmRzOiBCb3VuZHMyLCBpbWFnZTogSFRNTENhbnZhc0VsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50LCBpbml0aWFsQ291bnQ6IG51bWJlciApIHtcbiAgICB0aGlzLnNwcml0ZVNoZWV0ID0gc3ByaXRlU2hlZXQ7XG4gICAgdGhpcy5iaW4gPSBiaW47XG4gICAgdGhpcy51dkJvdW5kcyA9IHV2Qm91bmRzO1xuICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICB0aGlzLmNvdW50ID0gaW5pdGlhbENvdW50O1xuICB9XG59XG5cblNwcml0ZVNoZWV0LlNwcml0ZSA9IFNwcml0ZTsiXSwibmFtZXMiOlsiQmluUGFja2VyIiwiQm91bmRzMiIsIkRpbWVuc2lvbjIiLCJzY2VuZXJ5IiwiTUFYX0RJTUVOU0lPTiIsIkdVVFRFUl9TSVpFIiwiUEFERElORyIsIlNwcml0ZVNoZWV0IiwiaW5pdGlhbGl6ZUNvbnRleHQiLCJnbCIsImNyZWF0ZVRleHR1cmUiLCJhc3NlcnQiLCJ0ZXh0dXJlIiwiYmluZFRleHR1cmUiLCJURVhUVVJFXzJEIiwidGV4UGFyYW1ldGVyaSIsIlRFWFRVUkVfV1JBUF9TIiwiQ0xBTVBfVE9fRURHRSIsIlRFWFRVUkVfV1JBUF9UIiwiVEVYVFVSRV9NSU5fRklMVEVSIiwidXNlTWlwbWFwcyIsIkxJTkVBUl9NSVBNQVBfTElORUFSIiwiTElORUFSIiwiVEVYVFVSRV9NQUdfRklMVEVSIiwicGl4ZWxTdG9yZWkiLCJVTlBBQ0tfRkxJUF9ZX1dFQkdMIiwiVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMIiwidGV4SW1hZ2UyRCIsIlJHQkEiLCJVTlNJR05FRF9CWVRFIiwiY2FudmFzIiwiaGludCIsIkdFTkVSQVRFX01JUE1BUF9ISU5UIiwiTklDRVNUIiwiZ2VuZXJhdGVNaXBtYXAiLCJkaXJ0eSIsInVwZGF0ZVRleHR1cmUiLCJhZGRJbWFnZSIsImltYWdlIiwid2lkdGgiLCJoZWlnaHQiLCJpIiwidXNlZFNwcml0ZXMiLCJsZW5ndGgiLCJ1c2VkU3ByaXRlIiwiY291bnQiLCJ1bnVzZWRTcHJpdGVzIiwidW51c2VkU3ByaXRlIiwic3BsaWNlIiwicHVzaCIsImJpbiIsImJpblBhY2tlciIsImFsbG9jYXRlIiwiZWplY3RlZFNwcml0ZSIsInNoaWZ0IiwiZWplY3RlZEJvdW5kcyIsImJvdW5kcyIsImNvbnRleHQiLCJjbGVhclJlY3QiLCJ4IiwieSIsImRlYWxsb2NhdGUiLCJ1dkJvdW5kcyIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJzcHJpdGUiLCJTcHJpdGUiLCJjb3B5SW1hZ2VXaXRoR3V0dGVyIiwicmVtb3ZlSW1hZ2UiLCJjb250YWluc0ltYWdlIiwiYmluWCIsImJpblkiLCJjb3B5SW1hZ2VSZWdpb24iLCJkcmF3SW1hZ2UiLCJzb3VyY2VYIiwic291cmNlWSIsImRlc3RpbmF0aW9uWCIsImRlc3RpbmF0aW9uWSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldENvbnRleHQiLCJyZWdpc3RlciIsInNwcml0ZVNoZWV0IiwiaW5pdGlhbENvdW50Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7OztDQVlDLEdBRUQsT0FBT0EsZUFBd0IsK0JBQStCO0FBQzlELE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsU0FB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