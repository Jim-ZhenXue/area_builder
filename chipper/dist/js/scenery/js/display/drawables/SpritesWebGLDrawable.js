// Copyright 2019-2024, University of Colorado Boulder
/**
 * WebGL drawable for Sprites.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import animationFrameTimer from '../../../../axon/js/animationFrameTimer.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import platform from '../../../../phet-core/js/platform.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { Renderer, scenery, ShaderProgram, SpriteSheet, WebGLSelfDrawable } from '../../imports.js';
// constants
const COMPONENTS = 5; // { X Y U V A }
const FLOAT_QUANTITY = COMPONENTS * 6; // 6 vertices
// scratch values - corner vertices in the relative transform root coordinate space
const upperLeft = new Vector2(0, 0);
const lowerLeft = new Vector2(0, 0);
const upperRight = new Vector2(0, 0);
const lowerRight = new Vector2(0, 0);
let SpritesWebGLDrawable = class SpritesWebGLDrawable extends WebGLSelfDrawable {
    /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */ initialize(renderer, instance) {
        super.initialize(renderer, instance);
        // @private {function}
        this.contextChangeListener = this.onWebGLContextChange.bind(this);
        // @private {SpriteSheet}
        this.spriteSheet = new SpriteSheet(true);
        // @private {Object} - Maps {number} SpriteImage.id => {Bounds2} UV bounds
        this.spriteImageUVMap = {};
        // @private {Float32Array}
        this.vertexArray = new Float32Array(128 * FLOAT_QUANTITY);
        // @private {Float32Array}
        this.transformMatrixArray = new Float32Array(9);
        // @private {function}
        this.spriteChangeListener = this.onSpriteChange.bind(this);
        this.node._sprites.forEach((sprite)=>{
            sprite.imageProperty.lazyLink(this.spriteChangeListener);
            this.addSpriteImage(sprite.imageProperty.value);
        });
        // @private {boolean} - See https://github.com/phetsims/natural-selection/issues/243
        this.hasDrawn = false;
    }
    /**
   * Adds a SpriteImage to our SpriteSheet.
   * @private
   *
   * @param {SpriteImage} spriteImage
   */ addSpriteImage(spriteImage) {
        this.spriteImageUVMap[spriteImage.id] = this.spriteSheet.addImage(spriteImage.image, spriteImage.image.width, spriteImage.image.height).uvBounds;
    }
    /**
   * Removes a SpriteImage from our SpriteSheet.
   * @private
   *
   * @param {SpriteImage} spriteImage
   */ removeSpriteImage(spriteImage) {
        this.spriteSheet.removeImage(spriteImage.image);
        delete this.spriteImageUVMap[spriteImage.id];
    }
    /**
   * Called when a Sprite's SpriteImage changes.
   * @private
   *
   * @param {SpriteImage} newSpriteImage
   * @param {SpriteImage} oldSpriteImage
   */ onSpriteChange(newSpriteImage, oldSpriteImage) {
        this.removeSpriteImage(oldSpriteImage);
        this.addSpriteImage(newSpriteImage);
    }
    /**
   * Sets up everything with a new WebGL context
   *
   * @private
   */ setup() {
        const gl = this.webGLBlock.gl;
        this.spriteSheet.initializeContext(gl);
        // @private {ShaderProgram}
        this.shaderProgram = new ShaderProgram(gl, [
            // vertex shader
            'attribute vec2 aVertex;',
            'attribute vec2 aTextureCoord;',
            'attribute float aAlpha;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',
            'uniform mat3 uProjectionMatrix;',
            'uniform mat3 uTransformMatrix;',
            'void main() {',
            '  vTextureCoord = aTextureCoord;',
            '  vAlpha = aAlpha;',
            '  vec3 ndc = uProjectionMatrix * ( uTransformMatrix * vec3( aVertex, 1.0 ) );',
            '  gl_Position = vec4( ndc.xy, 0.0, 1.0 );',
            '}'
        ].join('\n'), [
            // fragment shader
            'precision mediump float;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',
            'uniform sampler2D uTexture;',
            'void main() {',
            '  vec4 color = texture2D( uTexture, vTextureCoord, -0.7 );',
            // our input and output is premultiplied alpha, so we need to multiply the color by the alpha
            '  color *= vAlpha;',
            '  gl_FragColor = color;',
            '}'
        ].join('\n'), {
            attributes: [
                'aVertex',
                'aTextureCoord',
                'aAlpha'
            ],
            uniforms: [
                'uTexture',
                'uProjectionMatrix',
                'uTransformMatrix'
            ]
        });
        // @private {WebGLBuffer}
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
    }
    /**
   * Callback for when the WebGL context changes. We'll reconstruct the painter.
   * @public
   */ onWebGLContextChange() {
        this.setup();
    }
    /**
   * Called when this drawable is added to a block.
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */ onAddToBlock(webGLBlock) {
        // @private {WebGLBlock}
        this.webGLBlock = webGLBlock;
        this.setup();
        webGLBlock.glChangedEmitter.addListener(this.contextChangeListener);
    }
    /**
   * Called when this drawable is removed from a block.
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */ onRemoveFromBlock(webGLBlock) {
        webGLBlock.glChangedEmitter.removeListener(this.contextChangeListener);
    }
    /**
   * Draws the WebGL content.
   * @public
   */ draw() {
        const length = this.node._spriteInstances.length;
        // Don't render anything if we have nothing
        if (length === 0) {
            return 0;
        }
        assert && assert(this.node.canvasBounds.isValid(), 'Sprites canvasBounds should be set and have non-negative area if it renders sprites');
        this.spriteSheet.updateTexture();
        this.shaderProgram.use();
        let vertexArrayIndex = 0;
        let changedLength = false;
        // if our vertex data won't fit, keep doubling the size until it fits
        while(FLOAT_QUANTITY * length > this.vertexArray.length){
            this.vertexArray = new Float32Array(this.vertexArray.length * 2);
            changedLength = true;
        }
        for(let i = 0; i < length; i++){
            const spriteInstance = this.node._spriteInstances[i];
            const spriteImage = spriteInstance.sprite.imageProperty.value;
            const alpha = spriteInstance.alpha * spriteImage.imageOpacity;
            const uvBounds = this.spriteImageUVMap[spriteImage.id];
            const matrix = spriteInstance.matrix;
            const offset = spriteImage.offset;
            const width = spriteImage.image.width;
            const height = spriteImage.image.height;
            // Compute our vertices
            matrix.multiplyVector2(upperLeft.setXY(-offset.x, -offset.y));
            matrix.multiplyVector2(lowerLeft.setXY(-offset.x, height - offset.y));
            matrix.multiplyVector2(upperRight.setXY(width - offset.x, -offset.y));
            matrix.multiplyVector2(lowerRight.setXY(width - offset.x, height - offset.y));
            // copy our vertex data into the main array (consensus was that this is the fastest way to fill in data)
            this.vertexArray[vertexArrayIndex + 0] = upperLeft.x;
            this.vertexArray[vertexArrayIndex + 1] = upperLeft.y;
            this.vertexArray[vertexArrayIndex + 2] = uvBounds.minX;
            this.vertexArray[vertexArrayIndex + 3] = uvBounds.minY;
            this.vertexArray[vertexArrayIndex + 4] = alpha;
            this.vertexArray[vertexArrayIndex + 5] = lowerLeft.x;
            this.vertexArray[vertexArrayIndex + 6] = lowerLeft.y;
            this.vertexArray[vertexArrayIndex + 7] = uvBounds.minX;
            this.vertexArray[vertexArrayIndex + 8] = uvBounds.maxY;
            this.vertexArray[vertexArrayIndex + 9] = alpha;
            this.vertexArray[vertexArrayIndex + 10] = upperRight.x;
            this.vertexArray[vertexArrayIndex + 11] = upperRight.y;
            this.vertexArray[vertexArrayIndex + 12] = uvBounds.maxX;
            this.vertexArray[vertexArrayIndex + 13] = uvBounds.minY;
            this.vertexArray[vertexArrayIndex + 14] = alpha;
            this.vertexArray[vertexArrayIndex + 15] = upperRight.x;
            this.vertexArray[vertexArrayIndex + 16] = upperRight.y;
            this.vertexArray[vertexArrayIndex + 17] = uvBounds.maxX;
            this.vertexArray[vertexArrayIndex + 18] = uvBounds.minY;
            this.vertexArray[vertexArrayIndex + 19] = alpha;
            this.vertexArray[vertexArrayIndex + 20] = lowerLeft.x;
            this.vertexArray[vertexArrayIndex + 21] = lowerLeft.y;
            this.vertexArray[vertexArrayIndex + 22] = uvBounds.minX;
            this.vertexArray[vertexArrayIndex + 23] = uvBounds.maxY;
            this.vertexArray[vertexArrayIndex + 24] = alpha;
            this.vertexArray[vertexArrayIndex + 25] = lowerRight.x;
            this.vertexArray[vertexArrayIndex + 26] = lowerRight.y;
            this.vertexArray[vertexArrayIndex + 27] = uvBounds.maxX;
            this.vertexArray[vertexArrayIndex + 28] = uvBounds.maxY;
            this.vertexArray[vertexArrayIndex + 29] = alpha;
            vertexArrayIndex += FLOAT_QUANTITY;
        }
        const gl = this.webGLBlock.gl;
        // (uniform) projection transform into normalized device coordinates
        gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uProjectionMatrix, false, this.webGLBlock.projectionMatrixArray);
        // (uniform) transformation matrix that is common to all sprites
        this.instance.relativeTransform.matrix.copyToArray(this.transformMatrixArray);
        gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uTransformMatrix, false, this.transformMatrixArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // if we increased in length, we need to do a full bufferData to resize it on the GPU side
        if (changedLength) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray.subarray(0, vertexArrayIndex));
        }
        const sizeOfFloat = Float32Array.BYTES_PER_ELEMENT;
        const stride = COMPONENTS * sizeOfFloat;
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, stride, 0 * sizeOfFloat);
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * sizeOfFloat);
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aAlpha, 1, gl.FLOAT, false, stride, 4 * sizeOfFloat);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.spriteSheet.texture);
        gl.uniform1i(this.shaderProgram.uniformLocations.uTexture, 0);
        gl.drawArrays(gl.TRIANGLES, 0, vertexArrayIndex / COMPONENTS);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.shaderProgram.unuse();
        // See https://github.com/phetsims/natural-selection/issues/243
        if (!this.hasDrawn && platform.safari) {
            // Redraw once more if we're in Safari, since it's undetermined why an initial draw isn't working.
            // Everything seems to otherwise be in place.
            animationFrameTimer.setTimeout(()=>this.markDirty(), 0);
        }
        this.hasDrawn = true;
        return 1;
    }
    /**
   * Disposes the drawable.
   * @public
   * @override
   */ dispose() {
        this.node._sprites.forEach((sprite)=>{
            sprite.imageProperty.unlink(this.spriteChangeListener);
        });
        if (this.webGLBlock) {
            this.webGLBlock = null;
        }
        // super
        super.dispose();
    }
    /**
   * A "catch-all" dirty method that directly marks the paintDirty flag and triggers propagation of dirty
   * information. This can be used by other mark* methods, or directly itself if the paintDirty flag is checked.
   * @public
   *
   * It should be fired (indirectly or directly) for anything besides transforms that needs to make a drawable
   * dirty.
   */ markPaintDirty() {
        this.markDirty();
    }
};
// We use a custom renderer for the needed flexibility
SpritesWebGLDrawable.prototype.webglRenderer = Renderer.webglCustom;
scenery.register('SpritesWebGLDrawable', SpritesWebGLDrawable);
Poolable.mixInto(SpritesWebGLDrawable);
export default SpritesWebGLDrawable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9kcmF3YWJsZXMvU3ByaXRlc1dlYkdMRHJhd2FibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogV2ViR0wgZHJhd2FibGUgZm9yIFNwcml0ZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBhbmltYXRpb25GcmFtZVRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvYW5pbWF0aW9uRnJhbWVUaW1lci5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgUmVuZGVyZXIsIHNjZW5lcnksIFNoYWRlclByb2dyYW0sIFNwcml0ZVNoZWV0LCBXZWJHTFNlbGZEcmF3YWJsZSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IENPTVBPTkVOVFMgPSA1OyAvLyB7IFggWSBVIFYgQSB9XG5jb25zdCBGTE9BVF9RVUFOVElUWSA9IENPTVBPTkVOVFMgKiA2OyAvLyA2IHZlcnRpY2VzXG5cbi8vIHNjcmF0Y2ggdmFsdWVzIC0gY29ybmVyIHZlcnRpY2VzIGluIHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0gcm9vdCBjb29yZGluYXRlIHNwYWNlXG5jb25zdCB1cHBlckxlZnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuY29uc3QgbG93ZXJMZWZ0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbmNvbnN0IHVwcGVyUmlnaHQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuY29uc3QgbG93ZXJSaWdodCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbmNsYXNzIFNwcml0ZXNXZWJHTERyYXdhYmxlIGV4dGVuZHMgV2ViR0xTZWxmRHJhd2FibGUge1xuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBpbml0aWFsaXplKCByZW5kZXJlciwgaW5zdGFuY2UgKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggcmVuZGVyZXIsIGluc3RhbmNlICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XG4gICAgdGhpcy5jb250ZXh0Q2hhbmdlTGlzdGVuZXIgPSB0aGlzLm9uV2ViR0xDb250ZXh0Q2hhbmdlLmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtTcHJpdGVTaGVldH1cbiAgICB0aGlzLnNwcml0ZVNoZWV0ID0gbmV3IFNwcml0ZVNoZWV0KCB0cnVlICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0fSAtIE1hcHMge251bWJlcn0gU3ByaXRlSW1hZ2UuaWQgPT4ge0JvdW5kczJ9IFVWIGJvdW5kc1xuICAgIHRoaXMuc3ByaXRlSW1hZ2VVVk1hcCA9IHt9O1xuXG4gICAgLy8gQHByaXZhdGUge0Zsb2F0MzJBcnJheX1cbiAgICB0aGlzLnZlcnRleEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggMTI4ICogRkxPQVRfUVVBTlRJVFkgKTtcblxuICAgIC8vIEBwcml2YXRlIHtGbG9hdDMyQXJyYXl9XG4gICAgdGhpcy50cmFuc2Zvcm1NYXRyaXhBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoIDkgKTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLnNwcml0ZUNoYW5nZUxpc3RlbmVyID0gdGhpcy5vblNwcml0ZUNoYW5nZS5iaW5kKCB0aGlzICk7XG5cbiAgICB0aGlzLm5vZGUuX3Nwcml0ZXMuZm9yRWFjaCggc3ByaXRlID0+IHtcbiAgICAgIHNwcml0ZS5pbWFnZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnNwcml0ZUNoYW5nZUxpc3RlbmVyICk7XG4gICAgICB0aGlzLmFkZFNwcml0ZUltYWdlKCBzcHJpdGUuaW1hZ2VQcm9wZXJ0eS52YWx1ZSApO1xuICAgIH0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzI0M1xuICAgIHRoaXMuaGFzRHJhd24gPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgU3ByaXRlSW1hZ2UgdG8gb3VyIFNwcml0ZVNoZWV0LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1Nwcml0ZUltYWdlfSBzcHJpdGVJbWFnZVxuICAgKi9cbiAgYWRkU3ByaXRlSW1hZ2UoIHNwcml0ZUltYWdlICkge1xuICAgIHRoaXMuc3ByaXRlSW1hZ2VVVk1hcFsgc3ByaXRlSW1hZ2UuaWQgXSA9IHRoaXMuc3ByaXRlU2hlZXQuYWRkSW1hZ2UoIHNwcml0ZUltYWdlLmltYWdlLCBzcHJpdGVJbWFnZS5pbWFnZS53aWR0aCwgc3ByaXRlSW1hZ2UuaW1hZ2UuaGVpZ2h0ICkudXZCb3VuZHM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIFNwcml0ZUltYWdlIGZyb20gb3VyIFNwcml0ZVNoZWV0LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1Nwcml0ZUltYWdlfSBzcHJpdGVJbWFnZVxuICAgKi9cbiAgcmVtb3ZlU3ByaXRlSW1hZ2UoIHNwcml0ZUltYWdlICkge1xuICAgIHRoaXMuc3ByaXRlU2hlZXQucmVtb3ZlSW1hZ2UoIHNwcml0ZUltYWdlLmltYWdlICk7XG5cbiAgICBkZWxldGUgdGhpcy5zcHJpdGVJbWFnZVVWTWFwWyBzcHJpdGVJbWFnZS5pZCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgU3ByaXRlJ3MgU3ByaXRlSW1hZ2UgY2hhbmdlcy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTcHJpdGVJbWFnZX0gbmV3U3ByaXRlSW1hZ2VcbiAgICogQHBhcmFtIHtTcHJpdGVJbWFnZX0gb2xkU3ByaXRlSW1hZ2VcbiAgICovXG4gIG9uU3ByaXRlQ2hhbmdlKCBuZXdTcHJpdGVJbWFnZSwgb2xkU3ByaXRlSW1hZ2UgKSB7XG4gICAgdGhpcy5yZW1vdmVTcHJpdGVJbWFnZSggb2xkU3ByaXRlSW1hZ2UgKTtcbiAgICB0aGlzLmFkZFNwcml0ZUltYWdlKCBuZXdTcHJpdGVJbWFnZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdXAgZXZlcnl0aGluZyB3aXRoIGEgbmV3IFdlYkdMIGNvbnRleHRcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHNldHVwKCkge1xuICAgIGNvbnN0IGdsID0gdGhpcy53ZWJHTEJsb2NrLmdsO1xuXG4gICAgdGhpcy5zcHJpdGVTaGVldC5pbml0aWFsaXplQ29udGV4dCggZ2wgKTtcblxuICAgIC8vIEBwcml2YXRlIHtTaGFkZXJQcm9ncmFtfVxuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbSA9IG5ldyBTaGFkZXJQcm9ncmFtKCBnbCwgW1xuICAgICAgLy8gdmVydGV4IHNoYWRlclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMyIGFWZXJ0ZXg7JyxcbiAgICAgICdhdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkOycsXG4gICAgICAnYXR0cmlidXRlIGZsb2F0IGFBbHBoYTsnLFxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkOycsXG4gICAgICAndmFyeWluZyBmbG9hdCB2QWxwaGE7JyxcbiAgICAgICd1bmlmb3JtIG1hdDMgdVByb2plY3Rpb25NYXRyaXg7JyxcbiAgICAgICd1bmlmb3JtIG1hdDMgdVRyYW5zZm9ybU1hdHJpeDsnLFxuXG4gICAgICAndm9pZCBtYWluKCkgeycsXG4gICAgICAnICB2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDsnLFxuICAgICAgJyAgdkFscGhhID0gYUFscGhhOycsXG4gICAgICAnICB2ZWMzIG5kYyA9IHVQcm9qZWN0aW9uTWF0cml4ICogKCB1VHJhbnNmb3JtTWF0cml4ICogdmVjMyggYVZlcnRleCwgMS4wICkgKTsnLCAvLyBob21vZ2VuZW91cyBtYXAgdG8gdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXNcbiAgICAgICcgIGdsX1Bvc2l0aW9uID0gdmVjNCggbmRjLnh5LCAwLjAsIDEuMCApOycsXG4gICAgICAnfSdcbiAgICBdLmpvaW4oICdcXG4nICksIFtcbiAgICAgIC8vIGZyYWdtZW50IHNoYWRlclxuICAgICAgJ3ByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OycsXG4gICAgICAndmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7JyxcbiAgICAgICd2YXJ5aW5nIGZsb2F0IHZBbHBoYTsnLFxuICAgICAgJ3VuaWZvcm0gc2FtcGxlcjJEIHVUZXh0dXJlOycsXG5cbiAgICAgICd2b2lkIG1haW4oKSB7JyxcbiAgICAgICcgIHZlYzQgY29sb3IgPSB0ZXh0dXJlMkQoIHVUZXh0dXJlLCB2VGV4dHVyZUNvb3JkLCAtMC43ICk7JywgLy8gbWlwbWFwIExPRCBiaWFzIG9mIC0wLjcgKGZvciBub3cpXG4gICAgICAvLyBvdXIgaW5wdXQgYW5kIG91dHB1dCBpcyBwcmVtdWx0aXBsaWVkIGFscGhhLCBzbyB3ZSBuZWVkIHRvIG11bHRpcGx5IHRoZSBjb2xvciBieSB0aGUgYWxwaGFcbiAgICAgICcgIGNvbG9yICo9IHZBbHBoYTsnLFxuICAgICAgJyAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7JyxcbiAgICAgICd9J1xuICAgIF0uam9pbiggJ1xcbicgKSwge1xuICAgICAgYXR0cmlidXRlczogWyAnYVZlcnRleCcsICdhVGV4dHVyZUNvb3JkJywgJ2FBbHBoYScgXSxcbiAgICAgIHVuaWZvcm1zOiBbICd1VGV4dHVyZScsICd1UHJvamVjdGlvbk1hdHJpeCcsICd1VHJhbnNmb3JtTWF0cml4JyBdXG4gICAgfSApO1xuXG4gICAgLy8gQHByaXZhdGUge1dlYkdMQnVmZmVyfVxuICAgIHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XG4gICAgZ2wuYnVmZmVyRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEFycmF5LCBnbC5EWU5BTUlDX0RSQVcgKTsgLy8gZnVsbHkgYnVmZmVyIGF0IHRoZSBzdGFydFxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciB3aGVuIHRoZSBXZWJHTCBjb250ZXh0IGNoYW5nZXMuIFdlJ2xsIHJlY29uc3RydWN0IHRoZSBwYWludGVyLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBvbldlYkdMQ29udGV4dENoYW5nZSgpIHtcbiAgICB0aGlzLnNldHVwKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhpcyBkcmF3YWJsZSBpcyBhZGRlZCB0byBhIGJsb2NrLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViR0xCbG9ja1xuICAgKi9cbiAgb25BZGRUb0Jsb2NrKCB3ZWJHTEJsb2NrICkge1xuICAgIC8vIEBwcml2YXRlIHtXZWJHTEJsb2NrfVxuICAgIHRoaXMud2ViR0xCbG9jayA9IHdlYkdMQmxvY2s7XG5cbiAgICB0aGlzLnNldHVwKCk7XG5cbiAgICB3ZWJHTEJsb2NrLmdsQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY29udGV4dENoYW5nZUxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhpcyBkcmF3YWJsZSBpcyByZW1vdmVkIGZyb20gYSBibG9jay5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMQmxvY2t9IHdlYkdMQmxvY2tcbiAgICovXG4gIG9uUmVtb3ZlRnJvbUJsb2NrKCB3ZWJHTEJsb2NrICkge1xuICAgIHdlYkdMQmxvY2suZ2xDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5jb250ZXh0Q2hhbmdlTGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyB0aGUgV2ViR0wgY29udGVudC5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZHJhdygpIHtcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLm5vZGUuX3Nwcml0ZUluc3RhbmNlcy5sZW5ndGg7XG5cbiAgICAvLyBEb24ndCByZW5kZXIgYW55dGhpbmcgaWYgd2UgaGF2ZSBub3RoaW5nXG4gICAgaWYgKCBsZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUuY2FudmFzQm91bmRzLmlzVmFsaWQoKSxcbiAgICAgICdTcHJpdGVzIGNhbnZhc0JvdW5kcyBzaG91bGQgYmUgc2V0IGFuZCBoYXZlIG5vbi1uZWdhdGl2ZSBhcmVhIGlmIGl0IHJlbmRlcnMgc3ByaXRlcycgKTtcblxuICAgIHRoaXMuc3ByaXRlU2hlZXQudXBkYXRlVGV4dHVyZSgpO1xuXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtLnVzZSgpO1xuXG4gICAgbGV0IHZlcnRleEFycmF5SW5kZXggPSAwO1xuICAgIGxldCBjaGFuZ2VkTGVuZ3RoID0gZmFsc2U7XG5cbiAgICAvLyBpZiBvdXIgdmVydGV4IGRhdGEgd29uJ3QgZml0LCBrZWVwIGRvdWJsaW5nIHRoZSBzaXplIHVudGlsIGl0IGZpdHNcbiAgICB3aGlsZSAoIEZMT0FUX1FVQU5USVRZICogbGVuZ3RoID4gdGhpcy52ZXJ0ZXhBcnJheS5sZW5ndGggKSB7XG4gICAgICB0aGlzLnZlcnRleEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy52ZXJ0ZXhBcnJheS5sZW5ndGggKiAyICk7XG4gICAgICBjaGFuZ2VkTGVuZ3RoID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHNwcml0ZUluc3RhbmNlID0gdGhpcy5ub2RlLl9zcHJpdGVJbnN0YW5jZXNbIGkgXTtcbiAgICAgIGNvbnN0IHNwcml0ZUltYWdlID0gc3ByaXRlSW5zdGFuY2Uuc3ByaXRlLmltYWdlUHJvcGVydHkudmFsdWU7XG4gICAgICBjb25zdCBhbHBoYSA9IHNwcml0ZUluc3RhbmNlLmFscGhhICogc3ByaXRlSW1hZ2UuaW1hZ2VPcGFjaXR5O1xuICAgICAgY29uc3QgdXZCb3VuZHMgPSB0aGlzLnNwcml0ZUltYWdlVVZNYXBbIHNwcml0ZUltYWdlLmlkIF07XG4gICAgICBjb25zdCBtYXRyaXggPSBzcHJpdGVJbnN0YW5jZS5tYXRyaXg7XG4gICAgICBjb25zdCBvZmZzZXQgPSBzcHJpdGVJbWFnZS5vZmZzZXQ7XG5cbiAgICAgIGNvbnN0IHdpZHRoID0gc3ByaXRlSW1hZ2UuaW1hZ2Uud2lkdGg7XG4gICAgICBjb25zdCBoZWlnaHQgPSBzcHJpdGVJbWFnZS5pbWFnZS5oZWlnaHQ7XG5cbiAgICAgIC8vIENvbXB1dGUgb3VyIHZlcnRpY2VzXG4gICAgICBtYXRyaXgubXVsdGlwbHlWZWN0b3IyKCB1cHBlckxlZnQuc2V0WFkoIC1vZmZzZXQueCwgLW9mZnNldC55ICkgKTtcbiAgICAgIG1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIGxvd2VyTGVmdC5zZXRYWSggLW9mZnNldC54LCBoZWlnaHQgLSBvZmZzZXQueSApICk7XG4gICAgICBtYXRyaXgubXVsdGlwbHlWZWN0b3IyKCB1cHBlclJpZ2h0LnNldFhZKCB3aWR0aCAtIG9mZnNldC54LCAtb2Zmc2V0LnkgKSApO1xuICAgICAgbWF0cml4Lm11bHRpcGx5VmVjdG9yMiggbG93ZXJSaWdodC5zZXRYWSggd2lkdGggLSBvZmZzZXQueCwgaGVpZ2h0IC0gb2Zmc2V0LnkgKSApO1xuXG4gICAgICAvLyBjb3B5IG91ciB2ZXJ0ZXggZGF0YSBpbnRvIHRoZSBtYWluIGFycmF5IChjb25zZW5zdXMgd2FzIHRoYXQgdGhpcyBpcyB0aGUgZmFzdGVzdCB3YXkgdG8gZmlsbCBpbiBkYXRhKVxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDAgXSA9IHVwcGVyTGVmdC54O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDEgXSA9IHVwcGVyTGVmdC55O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDIgXSA9IHV2Qm91bmRzLm1pblg7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMyBdID0gdXZCb3VuZHMubWluWTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyA0IF0gPSBhbHBoYTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyA1IF0gPSBsb3dlckxlZnQueDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyA2IF0gPSBsb3dlckxlZnQueTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyA3IF0gPSB1dkJvdW5kcy5taW5YO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDggXSA9IHV2Qm91bmRzLm1heFk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgOSBdID0gYWxwaGE7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMTAgXSA9IHVwcGVyUmlnaHQueDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAxMSBdID0gdXBwZXJSaWdodC55O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDEyIF0gPSB1dkJvdW5kcy5tYXhYO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDEzIF0gPSB1dkJvdW5kcy5taW5ZO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDE0IF0gPSBhbHBoYTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAxNSBdID0gdXBwZXJSaWdodC54O1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDE2IF0gPSB1cHBlclJpZ2h0Lnk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMTcgXSA9IHV2Qm91bmRzLm1heFg7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMTggXSA9IHV2Qm91bmRzLm1pblk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMTkgXSA9IGFscGhhO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDIwIF0gPSBsb3dlckxlZnQueDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAyMSBdID0gbG93ZXJMZWZ0Lnk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMjIgXSA9IHV2Qm91bmRzLm1pblg7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMjMgXSA9IHV2Qm91bmRzLm1heFk7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMjQgXSA9IGFscGhhO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgdmVydGV4QXJyYXlJbmRleCArIDI1IF0gPSBsb3dlclJpZ2h0Lng7XG4gICAgICB0aGlzLnZlcnRleEFycmF5WyB2ZXJ0ZXhBcnJheUluZGV4ICsgMjYgXSA9IGxvd2VyUmlnaHQueTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAyNyBdID0gdXZCb3VuZHMubWF4WDtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAyOCBdID0gdXZCb3VuZHMubWF4WTtcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIHZlcnRleEFycmF5SW5kZXggKyAyOSBdID0gYWxwaGE7XG5cbiAgICAgIHZlcnRleEFycmF5SW5kZXggKz0gRkxPQVRfUVVBTlRJVFk7XG4gICAgfVxuXG4gICAgY29uc3QgZ2wgPSB0aGlzLndlYkdMQmxvY2suZ2w7XG5cbiAgICAvLyAodW5pZm9ybSkgcHJvamVjdGlvbiB0cmFuc2Zvcm0gaW50byBub3JtYWxpemVkIGRldmljZSBjb29yZGluYXRlc1xuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYoIHRoaXMuc2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVQcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgdGhpcy53ZWJHTEJsb2NrLnByb2plY3Rpb25NYXRyaXhBcnJheSApO1xuXG4gICAgLy8gKHVuaWZvcm0pIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCB0aGF0IGlzIGNvbW1vbiB0byBhbGwgc3ByaXRlc1xuICAgIHRoaXMuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4LmNvcHlUb0FycmF5KCB0aGlzLnRyYW5zZm9ybU1hdHJpeEFycmF5ICk7XG4gICAgZ2wudW5pZm9ybU1hdHJpeDNmdiggdGhpcy5zaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVRyYW5zZm9ybU1hdHJpeCwgZmFsc2UsIHRoaXMudHJhbnNmb3JtTWF0cml4QXJyYXkgKTtcblxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcbiAgICAvLyBpZiB3ZSBpbmNyZWFzZWQgaW4gbGVuZ3RoLCB3ZSBuZWVkIHRvIGRvIGEgZnVsbCBidWZmZXJEYXRhIHRvIHJlc2l6ZSBpdCBvbiB0aGUgR1BVIHNpZGVcbiAgICBpZiAoIGNoYW5nZWRMZW5ndGggKSB7XG4gICAgICBnbC5idWZmZXJEYXRhKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QXJyYXksIGdsLkRZTkFNSUNfRFJBVyApOyAvLyBmdWxseSBidWZmZXIgYXQgdGhlIHN0YXJ0XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSBkbyBhIG1vcmUgZWZmaWNpZW50IHVwZGF0ZSB0aGF0IG9ubHkgc2VuZHMgcGFydCBvZiB0aGUgYXJyYXkgb3ZlclxuICAgIGVsc2Uge1xuICAgICAgZ2wuYnVmZmVyU3ViRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCAwLCB0aGlzLnZlcnRleEFycmF5LnN1YmFycmF5KCAwLCB2ZXJ0ZXhBcnJheUluZGV4ICkgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzaXplT2ZGbG9hdCA9IEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICBjb25zdCBzdHJpZGUgPSBDT01QT05FTlRTICogc2l6ZU9mRmxvYXQ7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggdGhpcy5zaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hVmVydGV4LCAyLCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgMCAqIHNpemVPZkZsb2F0ICk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggdGhpcy5zaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hVGV4dHVyZUNvb3JkLCAyLCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgMiAqIHNpemVPZkZsb2F0ICk7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggdGhpcy5zaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hQWxwaGEsIDEsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCA0ICogc2l6ZU9mRmxvYXQgKTtcblxuICAgIGdsLmFjdGl2ZVRleHR1cmUoIGdsLlRFWFRVUkUwICk7XG4gICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMuc3ByaXRlU2hlZXQudGV4dHVyZSApO1xuICAgIGdsLnVuaWZvcm0xaSggdGhpcy5zaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVRleHR1cmUsIDAgKTtcblxuICAgIGdsLmRyYXdBcnJheXMoIGdsLlRSSUFOR0xFUywgMCwgdmVydGV4QXJyYXlJbmRleCAvIENPTVBPTkVOVFMgKTtcblxuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCBudWxsICk7XG5cbiAgICB0aGlzLnNoYWRlclByb2dyYW0udW51c2UoKTtcblxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzI0M1xuICAgIGlmICggIXRoaXMuaGFzRHJhd24gJiYgcGxhdGZvcm0uc2FmYXJpICkge1xuICAgICAgLy8gUmVkcmF3IG9uY2UgbW9yZSBpZiB3ZSdyZSBpbiBTYWZhcmksIHNpbmNlIGl0J3MgdW5kZXRlcm1pbmVkIHdoeSBhbiBpbml0aWFsIGRyYXcgaXNuJ3Qgd29ya2luZy5cbiAgICAgIC8vIEV2ZXJ5dGhpbmcgc2VlbXMgdG8gb3RoZXJ3aXNlIGJlIGluIHBsYWNlLlxuICAgICAgYW5pbWF0aW9uRnJhbWVUaW1lci5zZXRUaW1lb3V0KCAoKSA9PiB0aGlzLm1hcmtEaXJ0eSgpLCAwICk7XG4gICAgfVxuICAgIHRoaXMuaGFzRHJhd24gPSB0cnVlO1xuXG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIGRyYXdhYmxlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5vZGUuX3Nwcml0ZXMuZm9yRWFjaCggc3ByaXRlID0+IHtcbiAgICAgIHNwcml0ZS5pbWFnZVByb3BlcnR5LnVubGluayggdGhpcy5zcHJpdGVDaGFuZ2VMaXN0ZW5lciApO1xuICAgIH0gKTtcblxuICAgIGlmICggdGhpcy53ZWJHTEJsb2NrICkge1xuICAgICAgdGhpcy53ZWJHTEJsb2NrID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBzdXBlclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIFwiY2F0Y2gtYWxsXCIgZGlydHkgbWV0aG9kIHRoYXQgZGlyZWN0bHkgbWFya3MgdGhlIHBhaW50RGlydHkgZmxhZyBhbmQgdHJpZ2dlcnMgcHJvcGFnYXRpb24gb2YgZGlydHlcbiAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcbiAgICogZGlydHkuXG4gICAqL1xuICBtYXJrUGFpbnREaXJ0eSgpIHtcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG59XG5cbi8vIFdlIHVzZSBhIGN1c3RvbSByZW5kZXJlciBmb3IgdGhlIG5lZWRlZCBmbGV4aWJpbGl0eVxuU3ByaXRlc1dlYkdMRHJhd2FibGUucHJvdG90eXBlLndlYmdsUmVuZGVyZXIgPSBSZW5kZXJlci53ZWJnbEN1c3RvbTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ1Nwcml0ZXNXZWJHTERyYXdhYmxlJywgU3ByaXRlc1dlYkdMRHJhd2FibGUgKTtcblxuUG9vbGFibGUubWl4SW50byggU3ByaXRlc1dlYkdMRHJhd2FibGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgU3ByaXRlc1dlYkdMRHJhd2FibGU7Il0sIm5hbWVzIjpbImFuaW1hdGlvbkZyYW1lVGltZXIiLCJWZWN0b3IyIiwicGxhdGZvcm0iLCJQb29sYWJsZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlNoYWRlclByb2dyYW0iLCJTcHJpdGVTaGVldCIsIldlYkdMU2VsZkRyYXdhYmxlIiwiQ09NUE9ORU5UUyIsIkZMT0FUX1FVQU5USVRZIiwidXBwZXJMZWZ0IiwibG93ZXJMZWZ0IiwidXBwZXJSaWdodCIsImxvd2VyUmlnaHQiLCJTcHJpdGVzV2ViR0xEcmF3YWJsZSIsImluaXRpYWxpemUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY29udGV4dENoYW5nZUxpc3RlbmVyIiwib25XZWJHTENvbnRleHRDaGFuZ2UiLCJiaW5kIiwic3ByaXRlU2hlZXQiLCJzcHJpdGVJbWFnZVVWTWFwIiwidmVydGV4QXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJ0cmFuc2Zvcm1NYXRyaXhBcnJheSIsInNwcml0ZUNoYW5nZUxpc3RlbmVyIiwib25TcHJpdGVDaGFuZ2UiLCJub2RlIiwiX3Nwcml0ZXMiLCJmb3JFYWNoIiwic3ByaXRlIiwiaW1hZ2VQcm9wZXJ0eSIsImxhenlMaW5rIiwiYWRkU3ByaXRlSW1hZ2UiLCJ2YWx1ZSIsImhhc0RyYXduIiwic3ByaXRlSW1hZ2UiLCJpZCIsImFkZEltYWdlIiwiaW1hZ2UiLCJ3aWR0aCIsImhlaWdodCIsInV2Qm91bmRzIiwicmVtb3ZlU3ByaXRlSW1hZ2UiLCJyZW1vdmVJbWFnZSIsIm5ld1Nwcml0ZUltYWdlIiwib2xkU3ByaXRlSW1hZ2UiLCJzZXR1cCIsImdsIiwid2ViR0xCbG9jayIsImluaXRpYWxpemVDb250ZXh0Iiwic2hhZGVyUHJvZ3JhbSIsImpvaW4iLCJhdHRyaWJ1dGVzIiwidW5pZm9ybXMiLCJ2ZXJ0ZXhCdWZmZXIiLCJjcmVhdGVCdWZmZXIiLCJiaW5kQnVmZmVyIiwiQVJSQVlfQlVGRkVSIiwiYnVmZmVyRGF0YSIsIkRZTkFNSUNfRFJBVyIsIm9uQWRkVG9CbG9jayIsImdsQ2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIm9uUmVtb3ZlRnJvbUJsb2NrIiwicmVtb3ZlTGlzdGVuZXIiLCJkcmF3IiwibGVuZ3RoIiwiX3Nwcml0ZUluc3RhbmNlcyIsImFzc2VydCIsImNhbnZhc0JvdW5kcyIsImlzVmFsaWQiLCJ1cGRhdGVUZXh0dXJlIiwidXNlIiwidmVydGV4QXJyYXlJbmRleCIsImNoYW5nZWRMZW5ndGgiLCJpIiwic3ByaXRlSW5zdGFuY2UiLCJhbHBoYSIsImltYWdlT3BhY2l0eSIsIm1hdHJpeCIsIm9mZnNldCIsIm11bHRpcGx5VmVjdG9yMiIsInNldFhZIiwieCIsInkiLCJtaW5YIiwibWluWSIsIm1heFkiLCJtYXhYIiwidW5pZm9ybU1hdHJpeDNmdiIsInVuaWZvcm1Mb2NhdGlvbnMiLCJ1UHJvamVjdGlvbk1hdHJpeCIsInByb2plY3Rpb25NYXRyaXhBcnJheSIsInJlbGF0aXZlVHJhbnNmb3JtIiwiY29weVRvQXJyYXkiLCJ1VHJhbnNmb3JtTWF0cml4IiwiYnVmZmVyU3ViRGF0YSIsInN1YmFycmF5Iiwic2l6ZU9mRmxvYXQiLCJCWVRFU19QRVJfRUxFTUVOVCIsInN0cmlkZSIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJhdHRyaWJ1dGVMb2NhdGlvbnMiLCJhVmVydGV4IiwiRkxPQVQiLCJhVGV4dHVyZUNvb3JkIiwiYUFscGhhIiwiYWN0aXZlVGV4dHVyZSIsIlRFWFRVUkUwIiwiYmluZFRleHR1cmUiLCJURVhUVVJFXzJEIiwidGV4dHVyZSIsInVuaWZvcm0xaSIsInVUZXh0dXJlIiwiZHJhd0FycmF5cyIsIlRSSUFOR0xFUyIsInVudXNlIiwic2FmYXJpIiwic2V0VGltZW91dCIsIm1hcmtEaXJ0eSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJtYXJrUGFpbnREaXJ0eSIsInByb3RvdHlwZSIsIndlYmdsUmVuZGVyZXIiLCJ3ZWJnbEN1c3RvbSIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSx5QkFBeUIsNkNBQTZDO0FBQzdFLE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMs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