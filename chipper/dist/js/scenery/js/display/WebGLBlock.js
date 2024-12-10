// Copyright 2013-2024, University of Colorado Boulder
/**
 * Renders a visual layer of WebGL drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (For Ghent University)
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { FittedBlock, Renderer, scenery, ShaderProgram, SpriteSheet, Utils } from '../imports.js';
let WebGLBlock = class WebGLBlock extends FittedBlock {
    /**
   * @public
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {Instance} filterRootInstance - All filters (visibility/opacity/filters) of this instance and its ancestors
   *                                        will already have been applied. This block will only be responsible for
   *                                        applying filters of this instance's descendants.
   * @returns {WebGLBlock} - For chaining
   */ initialize(display, renderer, transformRootInstance, filterRootInstance) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`initialize #${this.id}`);
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
        // WebGLBlocks are hard-coded to take the full display size (as opposed to svg and canvas)
        // Since we saw some jitter on iPad, see #318 and generally expect WebGL layers to span the entire display
        // In the future, it would be good to understand what was causing the problem and make webgl consistent
        // with svg and canvas again.
        super.initialize(display, renderer, transformRootInstance, FittedBlock.FULL_DISPLAY);
        // TODO: Uhh, is this not used? https://github.com/phetsims/scenery/issues/1581
        this.filterRootInstance = filterRootInstance;
        // {boolean} - Whether we pass this flag to the WebGL Context. It will store the contents displayed on the screen,
        // so that canvas.toDataURL() will work. It also requires clearing the context manually ever frame. Both incur
        // performance costs, so it should be false by default.
        // TODO: This block can be shared across displays, so we need to handle preserveDrawingBuffer separately? https://github.com/phetsims/scenery/issues/1581
        this.preserveDrawingBuffer = display._preserveDrawingBuffer;
        // list of {Drawable}s that need to be updated before we update
        this.dirtyDrawables = cleanArray(this.dirtyDrawables);
        // {Array.<SpriteSheet>}, permanent list of spritesheets for this block
        this.spriteSheets = this.spriteSheets || [];
        // Projection {Matrix3} that maps from Scenery's global coordinate frame to normalized device coordinates,
        // where x,y are both in the range [-1,1] from one side of the Canvas to the other.
        this.projectionMatrix = this.projectionMatrix || new Matrix3();
        // @private {Float32Array} - Column-major 3x3 array specifying our projection matrix for 2D points
        // (homogenized to (x,y,1))
        this.projectionMatrixArray = new Float32Array(9);
        // processor for custom WebGL drawables (e.g. WebGLNode)
        this.customProcessor = this.customProcessor || new CustomProcessor();
        // processor for drawing vertex-colored triangles (e.g. Path types)
        this.vertexColorPolygonsProcessor = this.vertexColorPolygonsProcessor || new VertexColorPolygons(this.projectionMatrixArray);
        // processor for drawing textured triangles (e.g. Image)
        this.texturedTrianglesProcessor = this.texturedTrianglesProcessor || new TexturedTrianglesProcessor(this.projectionMatrixArray);
        // @public {Emitter} - Called when the WebGL context changes to a new context.
        this.glChangedEmitter = new TinyEmitter();
        // @private {boolean}
        this.isContextLost = false;
        // @private {function}
        this.contextLostListener = this.onContextLoss.bind(this);
        this.contextRestoreListener = this.onContextRestoration.bind(this);
        if (!this.domElement) {
            // @public (scenery-internal) {HTMLCanvasElement} - Div wrapper used so we can switch out Canvases if necessary.
            this.domElement = document.createElement('div');
            this.domElement.className = 'webgl-container';
            this.domElement.style.position = 'absolute';
            this.domElement.style.left = '0';
            this.domElement.style.top = '0';
            this.rebuildCanvas();
        }
        // clear buffers when we are reinitialized
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // reset any fit transforms that were applied
        Utils.prepareForTransform(this.canvas); // Apply CSS needed for future CSS transforms to work properly.
        Utils.unsetTransform(this.canvas); // clear out any transforms that could have been previously applied
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
        return this;
    }
    /**
   * Forces a rebuild of the Canvas and its context (as long as a context can be obtained).
   * @private
   *
   * This can be necessary when the browser won't restore our context that was lost (and we need to create another
   * canvas to get a valid context).
   */ rebuildCanvas() {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`rebuildCanvas #${this.id}`);
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
        const canvas = document.createElement('canvas');
        const gl = this.getContextFromCanvas(canvas);
        // Don't assert-failure out if this is not our first attempt (we're testing to see if we can recreate)
        assert && assert(gl || this.canvas, 'We should have a WebGL context by now');
        // If we're aggressively trying to rebuild, we need to ignore context creation failure.
        if (gl) {
            if (this.canvas) {
                this.domElement.removeChild(this.canvas);
                this.canvas.removeEventListener('webglcontextlost', this.contextLostListener, false);
                this.canvas.removeEventListener('webglcontextrestored', this.contextRestoreListener, false);
            }
            // @private {HTMLCanvasElement}
            this.canvas = canvas;
            this.canvas.style.pointerEvents = 'none';
            // @private {number} - unique ID so that we can support rasterization with Display.foreignObjectRasterization
            this.canvasId = this.canvas.id = `scenery-webgl${this.id}`;
            this.canvas.addEventListener('webglcontextlost', this.contextLostListener, false);
            this.canvas.addEventListener('webglcontextrestored', this.contextRestoreListener, false);
            this.domElement.appendChild(this.canvas);
            this.setupContext(gl);
        }
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    }
    /**
   * Takes a fresh WebGL context switches the WebGL block over to use it.
   * @private
   *
   * @param {WebGLRenderingContext} gl
   */ setupContext(gl) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`setupContext #${this.id}`);
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
        assert && assert(gl, 'Should have an actual context if this is called');
        this.isContextLost = false;
        // @private {WebGLRenderingContext}
        this.gl = gl;
        // @private {number} - How much larger our Canvas will be compared to the CSS pixel dimensions, so that our
        // Canvas maps one of its pixels to a physical pixel (for Retina devices, etc.).
        this.backingScale = Utils.backingScale(this.gl);
        // Double the backing scale size if we detect no built-in antialiasing.
        // See https://github.com/phetsims/circuit-construction-kit-dc/issues/139 and
        // https://github.com/phetsims/scenery/issues/859.
        if (this.display._allowBackingScaleAntialiasing && gl.getParameter(gl.SAMPLES) === 0) {
            this.backingScale *= 2;
        }
        // @private {number}
        this.originalBackingScale = this.backingScale;
        Utils.applyWebGLContextDefaults(this.gl); // blending defaults, etc.
        // When the context changes, we need to force certain refreshes
        this.markDirty();
        this.dirtyFit = true; // Force re-fitting
        // Update the context references on the processors
        this.customProcessor.initializeContext(this.gl);
        this.vertexColorPolygonsProcessor.initializeContext(this.gl);
        this.texturedTrianglesProcessor.initializeContext(this.gl);
        // Notify spritesheets of the new context
        for(let i = 0; i < this.spriteSheets.length; i++){
            this.spriteSheets[i].initializeContext(this.gl);
        }
        // Notify (e.g. WebGLNode painters need to be recreated)
        this.glChangedEmitter.emit();
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    }
    /**
   * Attempts to force a Canvas rebuild to get a new Canvas/context pair.
   * @private
   */ delayedRebuildCanvas() {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Delaying rebuilding of Canvas #${this.id}`);
        const self = this;
        // TODO: Can we move this to before the update() step? Could happen same-frame in that case. https://github.com/phetsims/scenery/issues/1581
        // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
        window.setTimeout(function() {
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Executing delayed rebuilding #${this.id}`);
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
            self.rebuildCanvas();
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
        });
    }
    /**
   * Callback for whenever our WebGL context is lost.
   * @private
   *
   * @param {WebGLContextEvent} domEvent
   */ onContextLoss(domEvent) {
        if (!this.isContextLost) {
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Context lost #${this.id}`);
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
            this.isContextLost = true;
            // Preventing default is super-important, otherwise it never attempts to restore the context
            domEvent.preventDefault();
            this.canvas.style.display = 'none';
            this.markDirty();
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
        }
    }
    /**
   * Callback for whenever our WebGL context is restored.
   * @private
   *
   * @param {WebGLContextEvent} domEvent
   */ onContextRestoration(domEvent) {
        if (this.isContextLost) {
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Context restored #${this.id}`);
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
            const gl = this.getContextFromCanvas(this.canvas);
            assert && assert(gl, 'We were told the context was restored, so this should work');
            this.setupContext(gl);
            this.canvas.style.display = '';
            sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
        }
    }
    /**
   * Attempts to get a WebGL context from a Canvas.
   * @private
   *
   * @param {HTMLCanvasElement}
   * @returns {WebGLRenderingContext|*} - If falsy, it did not succeed.
   */ getContextFromCanvas(canvas) {
        const contextOptions = {
            antialias: true,
            preserveDrawingBuffer: this.preserveDrawingBuffer
        };
        // we've already committed to using a WebGLBlock, so no use in a try-catch around our context attempt
        return canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
    }
    /**
   * @public
   * @override
   */ setSizeFullDisplay() {
        const size = this.display.getSize();
        this.canvas.width = Math.ceil(size.width * this.backingScale);
        this.canvas.height = Math.ceil(size.height * this.backingScale);
        this.canvas.style.width = `${size.width}px`;
        this.canvas.style.height = `${size.height}px`;
    }
    /**
   * @public
   * @override
   */ setSizeFitBounds() {
        throw new Error('setSizeFitBounds unimplemented for WebGLBlock');
    }
    /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */ update() {
        // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
        if (!super.update()) {
            return false;
        }
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`update #${this.id}`);
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
        const gl = this.gl;
        if (this.isContextLost && this.display._aggressiveContextRecreation) {
            this.delayedRebuildCanvas();
        }
        // update drawables, so that they have vertex arrays up to date, etc.
        while(this.dirtyDrawables.length){
            this.dirtyDrawables.pop().update();
        }
        // ensure sprite sheet textures are up-to-date
        const numSpriteSheets = this.spriteSheets.length;
        for(let i = 0; i < numSpriteSheets; i++){
            this.spriteSheets[i].updateTexture();
        }
        // temporary hack for supporting webglScale
        if (this.firstDrawable && this.firstDrawable === this.lastDrawable && this.firstDrawable.node && this.firstDrawable.node._webglScale !== null && this.backingScale !== this.originalBackingScale * this.firstDrawable.node._webglScale) {
            this.backingScale = this.originalBackingScale * this.firstDrawable.node._webglScale;
            this.dirtyFit = true;
        }
        // udpate the fit BEFORE drawing, since it may change our offset
        this.updateFit();
        // finalX = 2 * x / display.width - 1
        // finalY = 1 - 2 * y / display.height
        // result = matrix * ( x, y, 1 )
        this.projectionMatrix.rowMajor(2 / this.display.width, 0, -1, 0, -2 / this.display.height, 1, 0, 0, 1);
        this.projectionMatrix.copyToArray(this.projectionMatrixArray);
        // if we created the context with preserveDrawingBuffer, we need to clear before rendering
        if (this.preserveDrawingBuffer) {
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
        // We switch between processors for drawables based on each drawable's webglRenderer property. Each processor
        // will be activated, will process a certain number of adjacent drawables with that processor's webglRenderer,
        // and then will be deactivated. This allows us to switch back-and-forth between different shader programs,
        // and allows us to trigger draw calls for each grouping of drawables in an efficient way.
        let currentProcessor = null;
        // How many draw calls have been executed. If no draw calls are executed while updating, it means nothing should
        // be drawn, and we'll have to manually clear the Canvas if we are not preserving the drawing buffer.
        let cumulativeDrawCount = 0;
        // Iterate through all of our drawables (linked list)
        //OHTWO TODO: PERFORMANCE: create an array for faster drawable iteration (this is probably a hellish memory access pattern) https://github.com/phetsims/scenery/issues/1581
        for(let drawable = this.firstDrawable; drawable !== null; drawable = drawable.nextDrawable){
            // ignore invisible drawables
            if (drawable.visible) {
                // select our desired processor
                let desiredProcessor = null;
                if (drawable.webglRenderer === Renderer.webglTexturedTriangles) {
                    desiredProcessor = this.texturedTrianglesProcessor;
                } else if (drawable.webglRenderer === Renderer.webglCustom) {
                    desiredProcessor = this.customProcessor;
                } else if (drawable.webglRenderer === Renderer.webglVertexColorPolygons) {
                    desiredProcessor = this.vertexColorPolygonsProcessor;
                }
                assert && assert(desiredProcessor);
                // swap processors if necessary
                if (desiredProcessor !== currentProcessor) {
                    // deactivate any old processors
                    if (currentProcessor) {
                        cumulativeDrawCount += currentProcessor.deactivate();
                    }
                    // activate the new processor
                    currentProcessor = desiredProcessor;
                    currentProcessor.activate();
                }
                // process our current drawable with the current processor
                currentProcessor.processDrawable(drawable);
            }
            // exit loop end case
            if (drawable === this.lastDrawable) {
                break;
            }
        }
        // deactivate any processor that still has drawables that need to be handled
        if (currentProcessor) {
            cumulativeDrawCount += currentProcessor.deactivate();
        }
        // If we executed no draw calls AND we aren't preserving the drawing buffer, we'll need to manually clear the
        // drawing buffer ourself.
        if (cumulativeDrawCount === 0 && !this.preserveDrawingBuffer) {
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.flush();
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
        return true;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`dispose #${this.id}`);
        // TODO: many things to dispose!? https://github.com/phetsims/scenery/issues/1581
        // clear references
        cleanArray(this.dirtyDrawables);
        super.dispose();
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ markDirtyDrawable(drawable) {
        sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on WebGLBlock#${this.id} with ${drawable.toString()}`);
        assert && assert(drawable);
        assert && assert(!drawable.isDisposed);
        // TODO: instance check to see if it is a canvas cache (usually we don't need to call update on our drawables) https://github.com/phetsims/scenery/issues/1581
        this.dirtyDrawables.push(drawable);
        this.markDirty();
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ addDrawable(drawable) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
        super.addDrawable(drawable);
        // will trigger changes to the spritesheets for images, or initialization for others
        drawable.onAddToBlock(this);
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
        // Ensure a removed drawable is not present in the dirtyDrawables array afterwards. Don't want to update it.
        // See https://github.com/phetsims/scenery/issues/635
        let index = 0;
        while((index = this.dirtyDrawables.indexOf(drawable, index)) >= 0){
            this.dirtyDrawables.splice(index, 1);
        }
        // wil trigger removal from spritesheets
        drawable.onRemoveFromBlock(this);
        super.removeDrawable(drawable);
    }
    /**
   * Ensures we have an allocated part of a SpriteSheet for this image. If a SpriteSheet already contains this image,
   * we'll just increase the reference count. Otherwise, we'll attempt to add it into one of our SpriteSheets. If
   * it doesn't fit, we'll add a new SpriteSheet and add the image to it.
   * @public
   *
   * @param {HTMLImageElement | HTMLCanvasElement} image
   * @param {number} width
   * @param {number} height
   *
   * @returns {Sprite} - Throws an error if we can't accommodate the image
   */ addSpriteSheetImage(image, width, height) {
        let sprite = null;
        const numSpriteSheets = this.spriteSheets.length;
        // TODO: check for SpriteSheet containment first? https://github.com/phetsims/scenery/issues/1581
        for(let i = 0; i < numSpriteSheets; i++){
            const spriteSheet = this.spriteSheets[i];
            sprite = spriteSheet.addImage(image, width, height);
            if (sprite) {
                break;
            }
        }
        if (!sprite) {
            const newSpriteSheet = new SpriteSheet(true); // use mipmaps for now?
            sprite = newSpriteSheet.addImage(image, width, height);
            newSpriteSheet.initializeContext(this.gl);
            this.spriteSheets.push(newSpriteSheet);
            if (!sprite) {
                // TODO: renderer flags should change for very large images https://github.com/phetsims/scenery/issues/1581
                throw new Error('Attempt to load image that is too large for sprite sheets');
            }
        }
        return sprite;
    }
    /**
   * Removes the reference to the sprite in our spritesheets.
   * @public
   *
   * @param {Sprite} sprite
   */ removeSpriteSheetImage(sprite) {
        sprite.spriteSheet.removeImage(sprite.image);
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ onIntervalChange(firstDrawable, lastDrawable) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
        super.onIntervalChange(firstDrawable, lastDrawable);
        this.markDirty();
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ onPotentiallyMovedDrawable(drawable) {
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.onPotentiallyMovedDrawable ${drawable.toString()}`);
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
        assert && assert(drawable.parentDrawable === this);
        this.markDirty();
        sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `WebGLBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
    }
    /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance - All transforms of this instance and its ancestors will already have been
   *                                           applied. This block will only be responsible for applying transforms of
   *                                           this instance's descendants.
   * @param {Instance} filterRootInstance - All filters (visibility/opacity/filters) of this instance and its ancestors
   *                                        will already have been applied. This block will only be responsible for
   *                                        applying filters of this instance's descendants.
   */ constructor(display, renderer, transformRootInstance, filterRootInstance){
        super();
        this.initialize(display, renderer, transformRootInstance, filterRootInstance);
    }
};
scenery.register('WebGLBlock', WebGLBlock);
/**---------------------------------------------------------------------------*
 * Processors rely on the following lifecycle:
 * 1. activate()
 * 2. processDrawable() - 0 or more times
 * 3. deactivate()
 * Once deactivated, they should have executed all of the draw calls they need to make.
 *---------------------------------------------------------------------------*/ let Processor = class Processor {
    /**
   * @public
   */ activate() {}
    /**
   * Sets the WebGL context that this processor should use.
   * @public
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */ initializeContext(gl) {}
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ processDrawable(drawable) {}
    /**
   * @public
   */ deactivate() {}
};
let CustomProcessor = class CustomProcessor extends Processor {
    /**
   * @public
   * @override
   */ activate() {
        this.drawCount = 0;
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ processDrawable(drawable) {
        assert && assert(drawable.webglRenderer === Renderer.webglCustom);
        this.drawable = drawable;
        this.draw();
    }
    /**
   * @public
   * @override
   */ deactivate() {
        return this.drawCount;
    }
    /**
   * @private
   */ draw() {
        if (this.drawable) {
            const count = this.drawable.draw();
            assert && assert(typeof count === 'number');
            this.drawCount += count;
            this.drawable = null;
        }
    }
    constructor(){
        super();
        // @private {Drawable}
        this.drawable = null;
    }
};
let VertexColorPolygons = class VertexColorPolygons extends Processor {
    /**
   * Sets the WebGL context that this processor should use.
   * @public
   * @override
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */ initializeContext(gl) {
        assert && assert(gl, 'Should be an actual context');
        // @private {WebGLRenderingContext}
        this.gl = gl;
        // @private {ShaderProgram}
        this.shaderProgram = new ShaderProgram(gl, [
            // vertex shader
            'attribute vec2 aVertex;',
            'attribute vec4 aColor;',
            'varying vec4 vColor;',
            'uniform mat3 uProjectionMatrix;',
            'void main() {',
            '  vColor = aColor;',
            '  vec3 ndc = uProjectionMatrix * vec3( aVertex, 1.0 );',
            '  gl_Position = vec4( ndc.xy, 0.0, 1.0 );',
            '}'
        ].join('\n'), [
            // fragment shader
            'precision mediump float;',
            'varying vec4 vColor;',
            'void main() {',
            // NOTE: Premultiplying alpha here is needed since we're going back to the standard blend functions.
            // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
            // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
            '  gl_FragColor = vec4( vColor.rgb * vColor.a, vColor.a );',
            '}'
        ].join('\n'), {
            attributes: [
                'aVertex',
                'aColor'
            ],
            uniforms: [
                'uProjectionMatrix'
            ]
        });
        // @private {WebGLBuffer}
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
    }
    /**
   * @public
   * @override
   */ activate() {
        this.shaderProgram.use();
        this.vertexArrayIndex = 0;
        this.drawCount = 0;
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ processDrawable(drawable) {
        if (drawable.includeVertices) {
            const vertexData = drawable.vertexArray;
            // if our vertex data won't fit, keep doubling the size until it fits
            while(vertexData.length + this.vertexArrayIndex > this.vertexArray.length){
                const newVertexArray = new Float32Array(this.vertexArray.length * 2);
                newVertexArray.set(this.vertexArray);
                this.vertexArray = newVertexArray;
            }
            // copy our vertex data into the main array
            this.vertexArray.set(vertexData, this.vertexArrayIndex);
            this.vertexArrayIndex += vertexData.length;
            this.drawCount++;
        }
    }
    /**
   * @public
   * @override
   */ deactivate() {
        if (this.drawCount) {
            this.draw();
        }
        this.shaderProgram.unuse();
        return this.drawCount;
    }
    /**
   * @private
   */ draw() {
        const gl = this.gl;
        // (uniform) projection transform into normalized device coordinates
        gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uProjectionMatrix, false, this.projectionMatrixArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // if we increased in length, we need to do a full bufferData to resize it on the GPU side
        if (this.vertexArray.length > this.lastArrayLength) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray.subarray(0, this.vertexArrayIndex));
        }
        const sizeOfFloat = Float32Array.BYTES_PER_ELEMENT;
        const stride = 6 * sizeOfFloat;
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, stride, 0 * sizeOfFloat);
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aColor, 4, gl.FLOAT, false, stride, 2 * sizeOfFloat);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayIndex / 6);
        this.vertexArrayIndex = 0;
    }
    /**
   * @param {Float32Array} projectionMatrixArray - Projection matrix entries
   */ constructor(projectionMatrixArray){
        assert && assert(projectionMatrixArray instanceof Float32Array);
        super();
        // @private {Float32Array}
        this.projectionMatrixArray = projectionMatrixArray;
        // @private {number} - Initial length of the vertex buffer. May increase as needed.
        this.lastArrayLength = 128;
        // @private {Float32Array}
        this.vertexArray = new Float32Array(this.lastArrayLength);
    }
};
let TexturedTrianglesProcessor = class TexturedTrianglesProcessor extends Processor {
    /**
   * Sets the WebGL context that this processor should use.
   * @public
   * @override
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */ initializeContext(gl) {
        assert && assert(gl, 'Should be an actual context');
        // @private {WebGLRenderingContext}
        this.gl = gl;
        // @private {ShaderProgram}
        this.shaderProgram = new ShaderProgram(gl, [
            // vertex shader
            'attribute vec2 aVertex;',
            'attribute vec2 aTextureCoord;',
            'attribute float aAlpha;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',
            'uniform mat3 uProjectionMatrix;',
            'void main() {',
            '  vTextureCoord = aTextureCoord;',
            '  vAlpha = aAlpha;',
            '  vec3 ndc = uProjectionMatrix * vec3( aVertex, 1.0 );',
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
            '  color.a *= vAlpha;',
            '  gl_FragColor = color;',
            '}'
        ].join('\n'), {
            // attributes: [ 'aVertex', 'aTextureCoord' ],
            attributes: [
                'aVertex',
                'aTextureCoord',
                'aAlpha'
            ],
            uniforms: [
                'uTexture',
                'uProjectionMatrix'
            ]
        });
        // @private {WebGLBuffer}
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
    }
    /**
   * @public
   * @override
   */ activate() {
        this.shaderProgram.use();
        this.currentSpriteSheet = null;
        this.vertexArrayIndex = 0;
        this.drawCount = 0;
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ processDrawable(drawable) {
        // skip unloaded images or sprites
        if (!drawable.sprite) {
            return;
        }
        assert && assert(drawable.webglRenderer === Renderer.webglTexturedTriangles);
        if (this.currentSpriteSheet && drawable.sprite.spriteSheet !== this.currentSpriteSheet) {
            this.draw();
        }
        this.currentSpriteSheet = drawable.sprite.spriteSheet;
        const vertexData = drawable.vertexArray;
        // if our vertex data won't fit, keep doubling the size until it fits
        while(vertexData.length + this.vertexArrayIndex > this.vertexArray.length){
            const newVertexArray = new Float32Array(this.vertexArray.length * 2);
            newVertexArray.set(this.vertexArray);
            this.vertexArray = newVertexArray;
        }
        // copy our vertex data into the main array
        this.vertexArray.set(vertexData, this.vertexArrayIndex);
        this.vertexArrayIndex += vertexData.length;
    }
    /**
   * @public
   * @override
   */ deactivate() {
        if (this.currentSpriteSheet) {
            this.draw();
        }
        this.shaderProgram.unuse();
        return this.drawCount;
    }
    /**
   * @private
   */ draw() {
        assert && assert(this.currentSpriteSheet);
        const gl = this.gl;
        // (uniform) projection transform into normalized device coordinates
        gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uProjectionMatrix, false, this.projectionMatrixArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // if we increased in length, we need to do a full bufferData to resize it on the GPU side
        if (this.vertexArray.length > this.lastArrayLength) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray.subarray(0, this.vertexArrayIndex));
        }
        const numComponents = 5;
        const sizeOfFloat = Float32Array.BYTES_PER_ELEMENT;
        const stride = numComponents * sizeOfFloat;
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, stride, 0 * sizeOfFloat);
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * sizeOfFloat);
        gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aAlpha, 1, gl.FLOAT, false, stride, 4 * sizeOfFloat);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.currentSpriteSheet.texture);
        gl.uniform1i(this.shaderProgram.uniformLocations.uTexture, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayIndex / numComponents);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.drawCount++;
        this.currentSpriteSheet = null;
        this.vertexArrayIndex = 0;
    }
    /**
   * @param {Float32Array} projectionMatrixArray - Projection matrix entries
   */ constructor(projectionMatrixArray){
        assert && assert(projectionMatrixArray instanceof Float32Array);
        super();
        // @private {Float32Array}
        this.projectionMatrixArray = projectionMatrixArray;
        // @private {number} - Initial length of the vertex buffer. May increase as needed.
        this.lastArrayLength = 128;
        // @private {Float32Array}
        this.vertexArray = new Float32Array(this.lastArrayLength);
    }
};
Poolable.mixInto(WebGLBlock);
export default WebGLBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9XZWJHTEJsb2NrLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlbmRlcnMgYSB2aXN1YWwgbGF5ZXIgb2YgV2ViR0wgZHJhd2FibGVzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChGb3IgR2hlbnQgVW5pdmVyc2l0eSlcbiAqL1xuXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IEZpdHRlZEJsb2NrLCBSZW5kZXJlciwgc2NlbmVyeSwgU2hhZGVyUHJvZ3JhbSwgU3ByaXRlU2hlZXQsIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFdlYkdMQmxvY2sgZXh0ZW5kcyBGaXR0ZWRCbG9jayB7XG4gIC8qKlxuICAgKiBAbWl4ZXMgUG9vbGFibGVcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSB0cmFuc2Zvcm1Sb290SW5zdGFuY2UgLSBBbGwgdHJhbnNmb3JtcyBvZiB0aGlzIGluc3RhbmNlIGFuZCBpdHMgYW5jZXN0b3JzIHdpbGwgYWxyZWFkeSBoYXZlIGJlZW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGllZC4gVGhpcyBibG9jayB3aWxsIG9ubHkgYmUgcmVzcG9uc2libGUgZm9yIGFwcGx5aW5nIHRyYW5zZm9ybXMgb2ZcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBpbnN0YW5jZSdzIGRlc2NlbmRhbnRzLlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBmaWx0ZXJSb290SW5zdGFuY2UgLSBBbGwgZmlsdGVycyAodmlzaWJpbGl0eS9vcGFjaXR5L2ZpbHRlcnMpIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBhbHJlYWR5IGhhdmUgYmVlbiBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlpbmcgZmlsdGVycyBvZiB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvciggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGZpbHRlclJvb3RJbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSB0cmFuc2Zvcm1Sb290SW5zdGFuY2UgLSBBbGwgdHJhbnNmb3JtcyBvZiB0aGlzIGluc3RhbmNlIGFuZCBpdHMgYW5jZXN0b3JzIHdpbGwgYWxyZWFkeSBoYXZlIGJlZW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGllZC4gVGhpcyBibG9jayB3aWxsIG9ubHkgYmUgcmVzcG9uc2libGUgZm9yIGFwcGx5aW5nIHRyYW5zZm9ybXMgb2ZcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBpbnN0YW5jZSdzIGRlc2NlbmRhbnRzLlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBmaWx0ZXJSb290SW5zdGFuY2UgLSBBbGwgZmlsdGVycyAodmlzaWJpbGl0eS9vcGFjaXR5L2ZpbHRlcnMpIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBhbHJlYWR5IGhhdmUgYmVlbiBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlpbmcgZmlsdGVycyBvZiB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEByZXR1cm5zIHtXZWJHTEJsb2NrfSAtIEZvciBjaGFpbmluZ1xuICAgKi9cbiAgaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYGluaXRpYWxpemUgIyR7dGhpcy5pZH1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBXZWJHTEJsb2NrcyBhcmUgaGFyZC1jb2RlZCB0byB0YWtlIHRoZSBmdWxsIGRpc3BsYXkgc2l6ZSAoYXMgb3Bwb3NlZCB0byBzdmcgYW5kIGNhbnZhcylcbiAgICAvLyBTaW5jZSB3ZSBzYXcgc29tZSBqaXR0ZXIgb24gaVBhZCwgc2VlICMzMTggYW5kIGdlbmVyYWxseSBleHBlY3QgV2ViR0wgbGF5ZXJzIHRvIHNwYW4gdGhlIGVudGlyZSBkaXNwbGF5XG4gICAgLy8gSW4gdGhlIGZ1dHVyZSwgaXQgd291bGQgYmUgZ29vZCB0byB1bmRlcnN0YW5kIHdoYXQgd2FzIGNhdXNpbmcgdGhlIHByb2JsZW0gYW5kIG1ha2Ugd2ViZ2wgY29uc2lzdGVudFxuICAgIC8vIHdpdGggc3ZnIGFuZCBjYW52YXMgYWdhaW4uXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgRml0dGVkQmxvY2suRlVMTF9ESVNQTEFZICk7XG5cbiAgICAvLyBUT0RPOiBVaGgsIGlzIHRoaXMgbm90IHVzZWQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5maWx0ZXJSb290SW5zdGFuY2UgPSBmaWx0ZXJSb290SW5zdGFuY2U7XG5cbiAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHdlIHBhc3MgdGhpcyBmbGFnIHRvIHRoZSBXZWJHTCBDb250ZXh0LiBJdCB3aWxsIHN0b3JlIHRoZSBjb250ZW50cyBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlbixcbiAgICAvLyBzbyB0aGF0IGNhbnZhcy50b0RhdGFVUkwoKSB3aWxsIHdvcmsuIEl0IGFsc28gcmVxdWlyZXMgY2xlYXJpbmcgdGhlIGNvbnRleHQgbWFudWFsbHkgZXZlciBmcmFtZS4gQm90aCBpbmN1clxuICAgIC8vIHBlcmZvcm1hbmNlIGNvc3RzLCBzbyBpdCBzaG91bGQgYmUgZmFsc2UgYnkgZGVmYXVsdC5cbiAgICAvLyBUT0RPOiBUaGlzIGJsb2NrIGNhbiBiZSBzaGFyZWQgYWNyb3NzIGRpc3BsYXlzLCBzbyB3ZSBuZWVkIHRvIGhhbmRsZSBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIgc2VwYXJhdGVseT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlciA9IGRpc3BsYXkuX3ByZXNlcnZlRHJhd2luZ0J1ZmZlcjtcblxuICAgIC8vIGxpc3Qgb2Yge0RyYXdhYmxlfXMgdGhhdCBuZWVkIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIHdlIHVwZGF0ZVxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5RHJhd2FibGVzICk7XG5cbiAgICAvLyB7QXJyYXkuPFNwcml0ZVNoZWV0Pn0sIHBlcm1hbmVudCBsaXN0IG9mIHNwcml0ZXNoZWV0cyBmb3IgdGhpcyBibG9ja1xuICAgIHRoaXMuc3ByaXRlU2hlZXRzID0gdGhpcy5zcHJpdGVTaGVldHMgfHwgW107XG5cbiAgICAvLyBQcm9qZWN0aW9uIHtNYXRyaXgzfSB0aGF0IG1hcHMgZnJvbSBTY2VuZXJ5J3MgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXMsXG4gICAgLy8gd2hlcmUgeCx5IGFyZSBib3RoIGluIHRoZSByYW5nZSBbLTEsMV0gZnJvbSBvbmUgc2lkZSBvZiB0aGUgQ2FudmFzIHRvIHRoZSBvdGhlci5cbiAgICB0aGlzLnByb2plY3Rpb25NYXRyaXggPSB0aGlzLnByb2plY3Rpb25NYXRyaXggfHwgbmV3IE1hdHJpeDMoKTtcblxuICAgIC8vIEBwcml2YXRlIHtGbG9hdDMyQXJyYXl9IC0gQ29sdW1uLW1ham9yIDN4MyBhcnJheSBzcGVjaWZ5aW5nIG91ciBwcm9qZWN0aW9uIG1hdHJpeCBmb3IgMkQgcG9pbnRzXG4gICAgLy8gKGhvbW9nZW5pemVkIHRvICh4LHksMSkpXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCA5ICk7XG5cbiAgICAvLyBwcm9jZXNzb3IgZm9yIGN1c3RvbSBXZWJHTCBkcmF3YWJsZXMgKGUuZy4gV2ViR0xOb2RlKVxuICAgIHRoaXMuY3VzdG9tUHJvY2Vzc29yID0gdGhpcy5jdXN0b21Qcm9jZXNzb3IgfHwgbmV3IEN1c3RvbVByb2Nlc3NvcigpO1xuXG4gICAgLy8gcHJvY2Vzc29yIGZvciBkcmF3aW5nIHZlcnRleC1jb2xvcmVkIHRyaWFuZ2xlcyAoZS5nLiBQYXRoIHR5cGVzKVxuICAgIHRoaXMudmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvciA9IHRoaXMudmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvciB8fCBuZXcgVmVydGV4Q29sb3JQb2x5Z29ucyggdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgKTtcblxuICAgIC8vIHByb2Nlc3NvciBmb3IgZHJhd2luZyB0ZXh0dXJlZCB0cmlhbmdsZXMgKGUuZy4gSW1hZ2UpXG4gICAgdGhpcy50ZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3NvciA9IHRoaXMudGV4dHVyZWRUcmlhbmdsZXNQcm9jZXNzb3IgfHwgbmV3IFRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yKCB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSApO1xuXG4gICAgLy8gQHB1YmxpYyB7RW1pdHRlcn0gLSBDYWxsZWQgd2hlbiB0aGUgV2ViR0wgY29udGV4dCBjaGFuZ2VzIHRvIGEgbmV3IGNvbnRleHQuXG4gICAgdGhpcy5nbENoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLmlzQ29udGV4dExvc3QgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLmNvbnRleHRMb3N0TGlzdGVuZXIgPSB0aGlzLm9uQ29udGV4dExvc3MuYmluZCggdGhpcyApO1xuICAgIHRoaXMuY29udGV4dFJlc3RvcmVMaXN0ZW5lciA9IHRoaXMub25Db250ZXh0UmVzdG9yYXRpb24uYmluZCggdGhpcyApO1xuXG4gICAgaWYgKCAhdGhpcy5kb21FbGVtZW50ICkge1xuICAgICAgLy8gQHB1YmxpYyAoc2NlbmVyeS1pbnRlcm5hbCkge0hUTUxDYW52YXNFbGVtZW50fSAtIERpdiB3cmFwcGVyIHVzZWQgc28gd2UgY2FuIHN3aXRjaCBvdXQgQ2FudmFzZXMgaWYgbmVjZXNzYXJ5LlxuICAgICAgdGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5jbGFzc05hbWUgPSAnd2ViZ2wtY29udGFpbmVyJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICB0aGlzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwJztcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XG5cbiAgICAgIHRoaXMucmVidWlsZENhbnZhcygpO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGJ1ZmZlcnMgd2hlbiB3ZSBhcmUgcmVpbml0aWFsaXplZFxuICAgIHRoaXMuZ2wuY2xlYXIoIHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVCApO1xuXG4gICAgLy8gcmVzZXQgYW55IGZpdCB0cmFuc2Zvcm1zIHRoYXQgd2VyZSBhcHBsaWVkXG4gICAgVXRpbHMucHJlcGFyZUZvclRyYW5zZm9ybSggdGhpcy5jYW52YXMgKTsgLy8gQXBwbHkgQ1NTIG5lZWRlZCBmb3IgZnV0dXJlIENTUyB0cmFuc2Zvcm1zIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgVXRpbHMudW5zZXRUcmFuc2Zvcm0oIHRoaXMuY2FudmFzICk7IC8vIGNsZWFyIG91dCBhbnkgdHJhbnNmb3JtcyB0aGF0IGNvdWxkIGhhdmUgYmVlbiBwcmV2aW91c2x5IGFwcGxpZWRcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjZXMgYSByZWJ1aWxkIG9mIHRoZSBDYW52YXMgYW5kIGl0cyBjb250ZXh0IChhcyBsb25nIGFzIGEgY29udGV4dCBjYW4gYmUgb2J0YWluZWQpLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSBuZWNlc3Nhcnkgd2hlbiB0aGUgYnJvd3NlciB3b24ndCByZXN0b3JlIG91ciBjb250ZXh0IHRoYXQgd2FzIGxvc3QgKGFuZCB3ZSBuZWVkIHRvIGNyZWF0ZSBhbm90aGVyXG4gICAqIGNhbnZhcyB0byBnZXQgYSB2YWxpZCBjb250ZXh0KS5cbiAgICovXG4gIHJlYnVpbGRDYW52YXMoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgcmVidWlsZENhbnZhcyAjJHt0aGlzLmlkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY29uc3QgZ2wgPSB0aGlzLmdldENvbnRleHRGcm9tQ2FudmFzKCBjYW52YXMgKTtcblxuICAgIC8vIERvbid0IGFzc2VydC1mYWlsdXJlIG91dCBpZiB0aGlzIGlzIG5vdCBvdXIgZmlyc3QgYXR0ZW1wdCAod2UncmUgdGVzdGluZyB0byBzZWUgaWYgd2UgY2FuIHJlY3JlYXRlKVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdsIHx8IHRoaXMuY2FudmFzLCAnV2Ugc2hvdWxkIGhhdmUgYSBXZWJHTCBjb250ZXh0IGJ5IG5vdycgKTtcblxuICAgIC8vIElmIHdlJ3JlIGFnZ3Jlc3NpdmVseSB0cnlpbmcgdG8gcmVidWlsZCwgd2UgbmVlZCB0byBpZ25vcmUgY29udGV4dCBjcmVhdGlvbiBmYWlsdXJlLlxuICAgIGlmICggZ2wgKSB7XG4gICAgICBpZiAoIHRoaXMuY2FudmFzICkge1xuICAgICAgICB0aGlzLmRvbUVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuY2FudmFzICk7XG4gICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd3ZWJnbGNvbnRleHRsb3N0JywgdGhpcy5jb250ZXh0TG9zdExpc3RlbmVyLCBmYWxzZSApO1xuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCB0aGlzLmNvbnRleHRSZXN0b3JlTGlzdGVuZXIsIGZhbHNlICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEBwcml2YXRlIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgdGhpcy5jYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcblxuICAgICAgLy8gQHByaXZhdGUge251bWJlcn0gLSB1bmlxdWUgSUQgc28gdGhhdCB3ZSBjYW4gc3VwcG9ydCByYXN0ZXJpemF0aW9uIHdpdGggRGlzcGxheS5mb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvblxuICAgICAgdGhpcy5jYW52YXNJZCA9IHRoaXMuY2FudmFzLmlkID0gYHNjZW5lcnktd2ViZ2wke3RoaXMuaWR9YDtcblxuICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggJ3dlYmdsY29udGV4dGxvc3QnLCB0aGlzLmNvbnRleHRMb3N0TGlzdGVuZXIsIGZhbHNlICk7XG4gICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCB0aGlzLmNvbnRleHRSZXN0b3JlTGlzdGVuZXIsIGZhbHNlICk7XG5cbiAgICAgIHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKTtcblxuICAgICAgdGhpcy5zZXR1cENvbnRleHQoIGdsICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIGZyZXNoIFdlYkdMIGNvbnRleHQgc3dpdGNoZXMgdGhlIFdlYkdMIGJsb2NrIG92ZXIgdG8gdXNlIGl0LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcbiAgICovXG4gIHNldHVwQ29udGV4dCggZ2wgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgc2V0dXBDb250ZXh0ICMke3RoaXMuaWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZ2wsICdTaG91bGQgaGF2ZSBhbiBhY3R1YWwgY29udGV4dCBpZiB0aGlzIGlzIGNhbGxlZCcgKTtcblxuICAgIHRoaXMuaXNDb250ZXh0TG9zdCA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge1dlYkdMUmVuZGVyaW5nQ29udGV4dH1cbiAgICB0aGlzLmdsID0gZ2w7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIEhvdyBtdWNoIGxhcmdlciBvdXIgQ2FudmFzIHdpbGwgYmUgY29tcGFyZWQgdG8gdGhlIENTUyBwaXhlbCBkaW1lbnNpb25zLCBzbyB0aGF0IG91clxuICAgIC8vIENhbnZhcyBtYXBzIG9uZSBvZiBpdHMgcGl4ZWxzIHRvIGEgcGh5c2ljYWwgcGl4ZWwgKGZvciBSZXRpbmEgZGV2aWNlcywgZXRjLikuXG4gICAgdGhpcy5iYWNraW5nU2NhbGUgPSBVdGlscy5iYWNraW5nU2NhbGUoIHRoaXMuZ2wgKTtcblxuICAgIC8vIERvdWJsZSB0aGUgYmFja2luZyBzY2FsZSBzaXplIGlmIHdlIGRldGVjdCBubyBidWlsdC1pbiBhbnRpYWxpYXNpbmcuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtZGMvaXNzdWVzLzEzOSBhbmRcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODU5LlxuICAgIGlmICggdGhpcy5kaXNwbGF5Ll9hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZyAmJiBnbC5nZXRQYXJhbWV0ZXIoIGdsLlNBTVBMRVMgKSA9PT0gMCApIHtcbiAgICAgIHRoaXMuYmFja2luZ1NjYWxlICo9IDI7XG4gICAgfVxuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cbiAgICB0aGlzLm9yaWdpbmFsQmFja2luZ1NjYWxlID0gdGhpcy5iYWNraW5nU2NhbGU7XG5cbiAgICBVdGlscy5hcHBseVdlYkdMQ29udGV4dERlZmF1bHRzKCB0aGlzLmdsICk7IC8vIGJsZW5kaW5nIGRlZmF1bHRzLCBldGMuXG5cbiAgICAvLyBXaGVuIHRoZSBjb250ZXh0IGNoYW5nZXMsIHdlIG5lZWQgdG8gZm9yY2UgY2VydGFpbiByZWZyZXNoZXNcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIHRoaXMuZGlydHlGaXQgPSB0cnVlOyAvLyBGb3JjZSByZS1maXR0aW5nXG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbnRleHQgcmVmZXJlbmNlcyBvbiB0aGUgcHJvY2Vzc29yc1xuICAgIHRoaXMuY3VzdG9tUHJvY2Vzc29yLmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XG4gICAgdGhpcy52ZXJ0ZXhDb2xvclBvbHlnb25zUHJvY2Vzc29yLmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XG4gICAgdGhpcy50ZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3Nvci5pbml0aWFsaXplQ29udGV4dCggdGhpcy5nbCApO1xuXG4gICAgLy8gTm90aWZ5IHNwcml0ZXNoZWV0cyBvZiB0aGUgbmV3IGNvbnRleHRcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNwcml0ZVNoZWV0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuc3ByaXRlU2hlZXRzWyBpIF0uaW5pdGlhbGl6ZUNvbnRleHQoIHRoaXMuZ2wgKTtcbiAgICB9XG5cbiAgICAvLyBOb3RpZnkgKGUuZy4gV2ViR0xOb2RlIHBhaW50ZXJzIG5lZWQgdG8gYmUgcmVjcmVhdGVkKVxuICAgIHRoaXMuZ2xDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGZvcmNlIGEgQ2FudmFzIHJlYnVpbGQgdG8gZ2V0IGEgbmV3IENhbnZhcy9jb250ZXh0IHBhaXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWxheWVkUmVidWlsZENhbnZhcygpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGBEZWxheWluZyByZWJ1aWxkaW5nIG9mIENhbnZhcyAjJHt0aGlzLmlkfWAgKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIFRPRE86IENhbiB3ZSBtb3ZlIHRoaXMgdG8gYmVmb3JlIHRoZSB1cGRhdGUoKSBzdGVwPyBDb3VsZCBoYXBwZW4gc2FtZS1mcmFtZSBpbiB0aGF0IGNhc2UuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgLy8gTk9URTogV2UgZG9uJ3Qgd2FudCB0byByZWx5IG9uIGEgY29tbW9uIHRpbWVyLCBzbyB3ZSdyZSB1c2luZyB0aGUgYnVpbHQtaW4gZm9ybSBvbiBwdXJwb3NlLlxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgRXhlY3V0aW5nIGRlbGF5ZWQgcmVidWlsZGluZyAjJHt0aGlzLmlkfWAgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgICAgc2VsZi5yZWJ1aWxkQ2FudmFzKCk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmb3Igd2hlbmV2ZXIgb3VyIFdlYkdMIGNvbnRleHQgaXMgbG9zdC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTENvbnRleHRFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9uQ29udGV4dExvc3MoIGRvbUV2ZW50ICkge1xuICAgIGlmICggIXRoaXMuaXNDb250ZXh0TG9zdCApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYENvbnRleHQgbG9zdCAjJHt0aGlzLmlkfWAgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICB0aGlzLmlzQ29udGV4dExvc3QgPSB0cnVlO1xuXG4gICAgICAvLyBQcmV2ZW50aW5nIGRlZmF1bHQgaXMgc3VwZXItaW1wb3J0YW50LCBvdGhlcndpc2UgaXQgbmV2ZXIgYXR0ZW1wdHMgdG8gcmVzdG9yZSB0aGUgY29udGV4dFxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5jYW52YXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZm9yIHdoZW5ldmVyIG91ciBXZWJHTCBjb250ZXh0IGlzIHJlc3RvcmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMQ29udGV4dEV2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25Db250ZXh0UmVzdG9yYXRpb24oIGRvbUV2ZW50ICkge1xuICAgIGlmICggdGhpcy5pc0NvbnRleHRMb3N0ICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgQ29udGV4dCByZXN0b3JlZCAjJHt0aGlzLmlkfWAgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICBjb25zdCBnbCA9IHRoaXMuZ2V0Q29udGV4dEZyb21DYW52YXMoIHRoaXMuY2FudmFzICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbCwgJ1dlIHdlcmUgdG9sZCB0aGUgY29udGV4dCB3YXMgcmVzdG9yZWQsIHNvIHRoaXMgc2hvdWxkIHdvcmsnICk7XG5cbiAgICAgIHRoaXMuc2V0dXBDb250ZXh0KCBnbCApO1xuXG4gICAgICB0aGlzLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGdldCBhIFdlYkdMIGNvbnRleHQgZnJvbSBhIENhbnZhcy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICogQHJldHVybnMge1dlYkdMUmVuZGVyaW5nQ29udGV4dHwqfSAtIElmIGZhbHN5LCBpdCBkaWQgbm90IHN1Y2NlZWQuXG4gICAqL1xuICBnZXRDb250ZXh0RnJvbUNhbnZhcyggY2FudmFzICkge1xuICAgIGNvbnN0IGNvbnRleHRPcHRpb25zID0ge1xuICAgICAgYW50aWFsaWFzOiB0cnVlLFxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxuICAgICAgLy8gTk9URTogd2UgdXNlIHByZW11bHRpcGxpZWQgYWxwaGEgc2luY2UgaXQgc2hvdWxkIGhhdmUgYmV0dGVyIHBlcmZvcm1hbmNlIEFORCBpdCBhcHBlYXJzIHRvIGJlIHRoZSBvbmx5IG9uZVxuICAgICAgLy8gdHJ1bHkgY29tcGF0aWJsZSB3aXRoIHRleHR1cmUgZmlsdGVyaW5nL2ludGVycG9sYXRpb24uXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8zOSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM5N1xuICAgICAgLy8gYW5kIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM5MzQxNTY0L3dlYmdsLWhvdy10by1jb3JyZWN0bHktYmxlbmQtYWxwaGEtY2hhbm5lbC1wbmdcbiAgICB9O1xuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBjb21taXR0ZWQgdG8gdXNpbmcgYSBXZWJHTEJsb2NrLCBzbyBubyB1c2UgaW4gYSB0cnktY2F0Y2ggYXJvdW5kIG91ciBjb250ZXh0IGF0dGVtcHRcbiAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcsIGNvbnRleHRPcHRpb25zICkgfHwgY2FudmFzLmdldENvbnRleHQoICdleHBlcmltZW50YWwtd2ViZ2wnLCBjb250ZXh0T3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBzZXRTaXplRnVsbERpc3BsYXkoKSB7XG4gICAgY29uc3Qgc2l6ZSA9IHRoaXMuZGlzcGxheS5nZXRTaXplKCk7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSBNYXRoLmNlaWwoIHNpemUud2lkdGggKiB0aGlzLmJhY2tpbmdTY2FsZSApO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggc2l6ZS5oZWlnaHQgKiB0aGlzLmJhY2tpbmdTY2FsZSApO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gYCR7c2l6ZS53aWR0aH1weGA7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7c2l6ZS5oZWlnaHR9cHhgO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBzZXRTaXplRml0Qm91bmRzKCkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ3NldFNpemVGaXRCb3VuZHMgdW5pbXBsZW1lbnRlZCBmb3IgV2ViR0xCbG9jaycgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBET00gYXBwZWFyYW5jZSBvZiB0aGlzIGRyYXdhYmxlICh3aGV0aGVyIGJ5IHByZXBhcmluZy9jYWxsaW5nIGRyYXcgY2FsbHMsIERPTSBlbGVtZW50IHVwZGF0ZXMsIGV0Yy4pXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHVwZGF0ZSBzaG91bGQgY29udGludWUgKGlmIGZhbHNlLCBmdXJ0aGVyIHVwZGF0ZXMgaW4gc3VwZXJ0eXBlIHN0ZXBzIHNob3VsZCBub3RcbiAgICogICAgICAgICAgICAgICAgICAgICAgYmUgZG9uZSkuXG4gICAqL1xuICB1cGRhdGUoKSB7XG4gICAgLy8gU2VlIGlmIHdlIG5lZWQgdG8gYWN0dWFsbHkgdXBkYXRlIHRoaW5ncyAod2lsbCBiYWlsIG91dCBpZiB3ZSBhcmUgbm90IGRpcnR5LCBvciBpZiB3ZSd2ZSBiZWVuIGRpc3Bvc2VkKVxuICAgIGlmICggIXN1cGVyLnVwZGF0ZSgpICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcblxuICAgIGlmICggdGhpcy5pc0NvbnRleHRMb3N0ICYmIHRoaXMuZGlzcGxheS5fYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uICkge1xuICAgICAgdGhpcy5kZWxheWVkUmVidWlsZENhbnZhcygpO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBkcmF3YWJsZXMsIHNvIHRoYXQgdGhleSBoYXZlIHZlcnRleCBhcnJheXMgdXAgdG8gZGF0ZSwgZXRjLlxuICAgIHdoaWxlICggdGhpcy5kaXJ0eURyYXdhYmxlcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLmRpcnR5RHJhd2FibGVzLnBvcCgpLnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIC8vIGVuc3VyZSBzcHJpdGUgc2hlZXQgdGV4dHVyZXMgYXJlIHVwLXRvLWRhdGVcbiAgICBjb25zdCBudW1TcHJpdGVTaGVldHMgPSB0aGlzLnNwcml0ZVNoZWV0cy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU3ByaXRlU2hlZXRzOyBpKysgKSB7XG4gICAgICB0aGlzLnNwcml0ZVNoZWV0c1sgaSBdLnVwZGF0ZVRleHR1cmUoKTtcbiAgICB9XG5cbiAgICAvLyB0ZW1wb3JhcnkgaGFjayBmb3Igc3VwcG9ydGluZyB3ZWJnbFNjYWxlXG4gICAgaWYgKCB0aGlzLmZpcnN0RHJhd2FibGUgJiZcbiAgICAgICAgIHRoaXMuZmlyc3REcmF3YWJsZSA9PT0gdGhpcy5sYXN0RHJhd2FibGUgJiZcbiAgICAgICAgIHRoaXMuZmlyc3REcmF3YWJsZS5ub2RlICYmXG4gICAgICAgICB0aGlzLmZpcnN0RHJhd2FibGUubm9kZS5fd2ViZ2xTY2FsZSAhPT0gbnVsbCAmJlxuICAgICAgICAgdGhpcy5iYWNraW5nU2NhbGUgIT09IHRoaXMub3JpZ2luYWxCYWNraW5nU2NhbGUgKiB0aGlzLmZpcnN0RHJhd2FibGUubm9kZS5fd2ViZ2xTY2FsZSApIHtcbiAgICAgIHRoaXMuYmFja2luZ1NjYWxlID0gdGhpcy5vcmlnaW5hbEJhY2tpbmdTY2FsZSAqIHRoaXMuZmlyc3REcmF3YWJsZS5ub2RlLl93ZWJnbFNjYWxlO1xuICAgICAgdGhpcy5kaXJ0eUZpdCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gdWRwYXRlIHRoZSBmaXQgQkVGT1JFIGRyYXdpbmcsIHNpbmNlIGl0IG1heSBjaGFuZ2Ugb3VyIG9mZnNldFxuICAgIHRoaXMudXBkYXRlRml0KCk7XG5cbiAgICAvLyBmaW5hbFggPSAyICogeCAvIGRpc3BsYXkud2lkdGggLSAxXG4gICAgLy8gZmluYWxZID0gMSAtIDIgKiB5IC8gZGlzcGxheS5oZWlnaHRcbiAgICAvLyByZXN1bHQgPSBtYXRyaXggKiAoIHgsIHksIDEgKVxuICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5yb3dNYWpvcihcbiAgICAgIDIgLyB0aGlzLmRpc3BsYXkud2lkdGgsIDAsIC0xLFxuICAgICAgMCwgLTIgLyB0aGlzLmRpc3BsYXkuaGVpZ2h0LCAxLFxuICAgICAgMCwgMCwgMSApO1xuICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5jb3B5VG9BcnJheSggdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgKTtcblxuICAgIC8vIGlmIHdlIGNyZWF0ZWQgdGhlIGNvbnRleHQgd2l0aCBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIsIHdlIG5lZWQgdG8gY2xlYXIgYmVmb3JlIHJlbmRlcmluZ1xuICAgIGlmICggdGhpcy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXIgKSB7XG4gICAgICBnbC5jbGVhciggZ2wuQ09MT1JfQlVGRkVSX0JJVCApO1xuICAgIH1cblxuICAgIGdsLnZpZXdwb3J0KCAwLjAsIDAuMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCApO1xuXG4gICAgLy8gV2Ugc3dpdGNoIGJldHdlZW4gcHJvY2Vzc29ycyBmb3IgZHJhd2FibGVzIGJhc2VkIG9uIGVhY2ggZHJhd2FibGUncyB3ZWJnbFJlbmRlcmVyIHByb3BlcnR5LiBFYWNoIHByb2Nlc3NvclxuICAgIC8vIHdpbGwgYmUgYWN0aXZhdGVkLCB3aWxsIHByb2Nlc3MgYSBjZXJ0YWluIG51bWJlciBvZiBhZGphY2VudCBkcmF3YWJsZXMgd2l0aCB0aGF0IHByb2Nlc3NvcidzIHdlYmdsUmVuZGVyZXIsXG4gICAgLy8gYW5kIHRoZW4gd2lsbCBiZSBkZWFjdGl2YXRlZC4gVGhpcyBhbGxvd3MgdXMgdG8gc3dpdGNoIGJhY2stYW5kLWZvcnRoIGJldHdlZW4gZGlmZmVyZW50IHNoYWRlciBwcm9ncmFtcyxcbiAgICAvLyBhbmQgYWxsb3dzIHVzIHRvIHRyaWdnZXIgZHJhdyBjYWxscyBmb3IgZWFjaCBncm91cGluZyBvZiBkcmF3YWJsZXMgaW4gYW4gZWZmaWNpZW50IHdheS5cbiAgICBsZXQgY3VycmVudFByb2Nlc3NvciA9IG51bGw7XG4gICAgLy8gSG93IG1hbnkgZHJhdyBjYWxscyBoYXZlIGJlZW4gZXhlY3V0ZWQuIElmIG5vIGRyYXcgY2FsbHMgYXJlIGV4ZWN1dGVkIHdoaWxlIHVwZGF0aW5nLCBpdCBtZWFucyBub3RoaW5nIHNob3VsZFxuICAgIC8vIGJlIGRyYXduLCBhbmQgd2UnbGwgaGF2ZSB0byBtYW51YWxseSBjbGVhciB0aGUgQ2FudmFzIGlmIHdlIGFyZSBub3QgcHJlc2VydmluZyB0aGUgZHJhd2luZyBidWZmZXIuXG4gICAgbGV0IGN1bXVsYXRpdmVEcmF3Q291bnQgPSAwO1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgb2Ygb3VyIGRyYXdhYmxlcyAobGlua2VkIGxpc3QpXG4gICAgLy9PSFRXTyBUT0RPOiBQRVJGT1JNQU5DRTogY3JlYXRlIGFuIGFycmF5IGZvciBmYXN0ZXIgZHJhd2FibGUgaXRlcmF0aW9uICh0aGlzIGlzIHByb2JhYmx5IGEgaGVsbGlzaCBtZW1vcnkgYWNjZXNzIHBhdHRlcm4pIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gdGhpcy5maXJzdERyYXdhYmxlOyBkcmF3YWJsZSAhPT0gbnVsbDsgZHJhd2FibGUgPSBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XG4gICAgICAvLyBpZ25vcmUgaW52aXNpYmxlIGRyYXdhYmxlc1xuICAgICAgaWYgKCBkcmF3YWJsZS52aXNpYmxlICkge1xuICAgICAgICAvLyBzZWxlY3Qgb3VyIGRlc2lyZWQgcHJvY2Vzc29yXG4gICAgICAgIGxldCBkZXNpcmVkUHJvY2Vzc29yID0gbnVsbDtcbiAgICAgICAgaWYgKCBkcmF3YWJsZS53ZWJnbFJlbmRlcmVyID09PSBSZW5kZXJlci53ZWJnbFRleHR1cmVkVHJpYW5nbGVzICkge1xuICAgICAgICAgIGRlc2lyZWRQcm9jZXNzb3IgPSB0aGlzLnRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCBkcmF3YWJsZS53ZWJnbFJlbmRlcmVyID09PSBSZW5kZXJlci53ZWJnbEN1c3RvbSApIHtcbiAgICAgICAgICBkZXNpcmVkUHJvY2Vzc29yID0gdGhpcy5jdXN0b21Qcm9jZXNzb3I7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGRyYXdhYmxlLndlYmdsUmVuZGVyZXIgPT09IFJlbmRlcmVyLndlYmdsVmVydGV4Q29sb3JQb2x5Z29ucyApIHtcbiAgICAgICAgICBkZXNpcmVkUHJvY2Vzc29yID0gdGhpcy52ZXJ0ZXhDb2xvclBvbHlnb25zUHJvY2Vzc29yO1xuICAgICAgICB9XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlc2lyZWRQcm9jZXNzb3IgKTtcblxuICAgICAgICAvLyBzd2FwIHByb2Nlc3NvcnMgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICggZGVzaXJlZFByb2Nlc3NvciAhPT0gY3VycmVudFByb2Nlc3NvciApIHtcbiAgICAgICAgICAvLyBkZWFjdGl2YXRlIGFueSBvbGQgcHJvY2Vzc29yc1xuICAgICAgICAgIGlmICggY3VycmVudFByb2Nlc3NvciApIHtcbiAgICAgICAgICAgIGN1bXVsYXRpdmVEcmF3Q291bnQgKz0gY3VycmVudFByb2Nlc3Nvci5kZWFjdGl2YXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBuZXcgcHJvY2Vzc29yXG4gICAgICAgICAgY3VycmVudFByb2Nlc3NvciA9IGRlc2lyZWRQcm9jZXNzb3I7XG4gICAgICAgICAgY3VycmVudFByb2Nlc3Nvci5hY3RpdmF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcHJvY2VzcyBvdXIgY3VycmVudCBkcmF3YWJsZSB3aXRoIHRoZSBjdXJyZW50IHByb2Nlc3NvclxuICAgICAgICBjdXJyZW50UHJvY2Vzc29yLnByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZXhpdCBsb29wIGVuZCBjYXNlXG4gICAgICBpZiAoIGRyYXdhYmxlID09PSB0aGlzLmxhc3REcmF3YWJsZSApIHsgYnJlYWs7IH1cbiAgICB9XG4gICAgLy8gZGVhY3RpdmF0ZSBhbnkgcHJvY2Vzc29yIHRoYXQgc3RpbGwgaGFzIGRyYXdhYmxlcyB0aGF0IG5lZWQgdG8gYmUgaGFuZGxlZFxuICAgIGlmICggY3VycmVudFByb2Nlc3NvciApIHtcbiAgICAgIGN1bXVsYXRpdmVEcmF3Q291bnQgKz0gY3VycmVudFByb2Nlc3Nvci5kZWFjdGl2YXRlKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZXhlY3V0ZWQgbm8gZHJhdyBjYWxscyBBTkQgd2UgYXJlbid0IHByZXNlcnZpbmcgdGhlIGRyYXdpbmcgYnVmZmVyLCB3ZSdsbCBuZWVkIHRvIG1hbnVhbGx5IGNsZWFyIHRoZVxuICAgIC8vIGRyYXdpbmcgYnVmZmVyIG91cnNlbGYuXG4gICAgaWYgKCBjdW11bGF0aXZlRHJhd0NvdW50ID09PSAwICYmICF0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlciApIHtcbiAgICAgIGdsLmNsZWFyKCBnbC5DT0xPUl9CVUZGRVJfQklUICk7XG4gICAgfVxuXG4gICAgZ2wuZmx1c2goKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgZGlzcG9zZSAjJHt0aGlzLmlkfWAgKTtcblxuICAgIC8vIFRPRE86IG1hbnkgdGhpbmdzIHRvIGRpc3Bvc2UhPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgLy8gY2xlYXIgcmVmZXJlbmNlc1xuICAgIGNsZWFuQXJyYXkoIHRoaXMuZGlydHlEcmF3YWJsZXMgKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICBtYXJrRGlydHlEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmRpcnR5ICYmIHNjZW5lcnlMb2cuZGlydHkoIGBtYXJrRGlydHlEcmF3YWJsZSBvbiBXZWJHTEJsb2NrIyR7dGhpcy5pZH0gd2l0aCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhZHJhd2FibGUuaXNEaXNwb3NlZCApO1xuXG4gICAgLy8gVE9ETzogaW5zdGFuY2UgY2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgY2FudmFzIGNhY2hlICh1c3VhbGx5IHdlIGRvbid0IG5lZWQgdG8gY2FsbCB1cGRhdGUgb24gb3VyIGRyYXdhYmxlcykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLmRpcnR5RHJhd2FibGVzLnB1c2goIGRyYXdhYmxlICk7XG4gICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgYWRkRHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYCMke3RoaXMuaWR9LmFkZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICBzdXBlci5hZGREcmF3YWJsZSggZHJhd2FibGUgKTtcblxuICAgIC8vIHdpbGwgdHJpZ2dlciBjaGFuZ2VzIHRvIHRoZSBzcHJpdGVzaGVldHMgZm9yIGltYWdlcywgb3IgaW5pdGlhbGl6YXRpb24gZm9yIG90aGVyc1xuICAgIGRyYXdhYmxlLm9uQWRkVG9CbG9jayggdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICByZW1vdmVEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgIyR7dGhpcy5pZH0ucmVtb3ZlRHJhd2FibGUgJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgIC8vIEVuc3VyZSBhIHJlbW92ZWQgZHJhd2FibGUgaXMgbm90IHByZXNlbnQgaW4gdGhlIGRpcnR5RHJhd2FibGVzIGFycmF5IGFmdGVyd2FyZHMuIERvbid0IHdhbnQgdG8gdXBkYXRlIGl0LlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjM1XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICB3aGlsZSAoICggaW5kZXggPSB0aGlzLmRpcnR5RHJhd2FibGVzLmluZGV4T2YoIGRyYXdhYmxlLCBpbmRleCApICkgPj0gMCApIHtcbiAgICAgIHRoaXMuZGlydHlEcmF3YWJsZXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgIH1cblxuICAgIC8vIHdpbCB0cmlnZ2VyIHJlbW92YWwgZnJvbSBzcHJpdGVzaGVldHNcbiAgICBkcmF3YWJsZS5vblJlbW92ZUZyb21CbG9jayggdGhpcyApO1xuXG4gICAgc3VwZXIucmVtb3ZlRHJhd2FibGUoIGRyYXdhYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB3ZSBoYXZlIGFuIGFsbG9jYXRlZCBwYXJ0IG9mIGEgU3ByaXRlU2hlZXQgZm9yIHRoaXMgaW1hZ2UuIElmIGEgU3ByaXRlU2hlZXQgYWxyZWFkeSBjb250YWlucyB0aGlzIGltYWdlLFxuICAgKiB3ZSdsbCBqdXN0IGluY3JlYXNlIHRoZSByZWZlcmVuY2UgY291bnQuIE90aGVyd2lzZSwgd2UnbGwgYXR0ZW1wdCB0byBhZGQgaXQgaW50byBvbmUgb2Ygb3VyIFNwcml0ZVNoZWV0cy4gSWZcbiAgICogaXQgZG9lc24ndCBmaXQsIHdlJ2xsIGFkZCBhIG5ldyBTcHJpdGVTaGVldCBhbmQgYWRkIHRoZSBpbWFnZSB0byBpdC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0hUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudH0gaW1hZ2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICpcbiAgICogQHJldHVybnMge1Nwcml0ZX0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgd2UgY2FuJ3QgYWNjb21tb2RhdGUgdGhlIGltYWdlXG4gICAqL1xuICBhZGRTcHJpdGVTaGVldEltYWdlKCBpbWFnZSwgd2lkdGgsIGhlaWdodCApIHtcbiAgICBsZXQgc3ByaXRlID0gbnVsbDtcbiAgICBjb25zdCBudW1TcHJpdGVTaGVldHMgPSB0aGlzLnNwcml0ZVNoZWV0cy5sZW5ndGg7XG4gICAgLy8gVE9ETzogY2hlY2sgZm9yIFNwcml0ZVNoZWV0IGNvbnRhaW5tZW50IGZpcnN0PyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVNwcml0ZVNoZWV0czsgaSsrICkge1xuICAgICAgY29uc3Qgc3ByaXRlU2hlZXQgPSB0aGlzLnNwcml0ZVNoZWV0c1sgaSBdO1xuICAgICAgc3ByaXRlID0gc3ByaXRlU2hlZXQuYWRkSW1hZ2UoIGltYWdlLCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgICBpZiAoIHNwcml0ZSApIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggIXNwcml0ZSApIHtcbiAgICAgIGNvbnN0IG5ld1Nwcml0ZVNoZWV0ID0gbmV3IFNwcml0ZVNoZWV0KCB0cnVlICk7IC8vIHVzZSBtaXBtYXBzIGZvciBub3c/XG4gICAgICBzcHJpdGUgPSBuZXdTcHJpdGVTaGVldC5hZGRJbWFnZSggaW1hZ2UsIHdpZHRoLCBoZWlnaHQgKTtcbiAgICAgIG5ld1Nwcml0ZVNoZWV0LmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XG4gICAgICB0aGlzLnNwcml0ZVNoZWV0cy5wdXNoKCBuZXdTcHJpdGVTaGVldCApO1xuICAgICAgaWYgKCAhc3ByaXRlICkge1xuICAgICAgICAvLyBUT0RPOiByZW5kZXJlciBmbGFncyBzaG91bGQgY2hhbmdlIGZvciB2ZXJ5IGxhcmdlIGltYWdlcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdBdHRlbXB0IHRvIGxvYWQgaW1hZ2UgdGhhdCBpcyB0b28gbGFyZ2UgZm9yIHNwcml0ZSBzaGVldHMnICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzcHJpdGU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBzcHJpdGUgaW4gb3VyIHNwcml0ZXNoZWV0cy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1Nwcml0ZX0gc3ByaXRlXG4gICAqL1xuICByZW1vdmVTcHJpdGVTaGVldEltYWdlKCBzcHJpdGUgKSB7XG4gICAgc3ByaXRlLnNwcml0ZVNoZWV0LnJlbW92ZUltYWdlKCBzcHJpdGUuaW1hZ2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGxhc3REcmF3YWJsZVxuICAgKi9cbiAgb25JbnRlcnZhbENoYW5nZSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYCMke3RoaXMuaWR9Lm9uSW50ZXJ2YWxDaGFuZ2UgJHtmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCl9IHRvICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgc3VwZXIub25JbnRlcnZhbENoYW5nZSggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICk7XG5cbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIG9uUG90ZW50aWFsbHlNb3ZlZERyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGAjJHt0aGlzLmlkfS5vblBvdGVudGlhbGx5TW92ZWREcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKTtcblxuICAgIHRoaXMubWFya0RpcnR5KCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYFdlYkdMQmxvY2sjJHt0aGlzLmlkfS0ke0ZpdHRlZEJsb2NrLmZpdFN0cmluZ1sgdGhpcy5maXQgXX1gO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdXZWJHTEJsb2NrJywgV2ViR0xCbG9jayApO1xuXG4vKiotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gKiBQcm9jZXNzb3JzIHJlbHkgb24gdGhlIGZvbGxvd2luZyBsaWZlY3ljbGU6XG4gKiAxLiBhY3RpdmF0ZSgpXG4gKiAyLiBwcm9jZXNzRHJhd2FibGUoKSAtIDAgb3IgbW9yZSB0aW1lc1xuICogMy4gZGVhY3RpdmF0ZSgpXG4gKiBPbmNlIGRlYWN0aXZhdGVkLCB0aGV5IHNob3VsZCBoYXZlIGV4ZWN1dGVkIGFsbCBvZiB0aGUgZHJhdyBjYWxscyB0aGV5IG5lZWQgdG8gbWFrZS5cbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbmNsYXNzIFByb2Nlc3NvciB7XG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBhY3RpdmF0ZSgpIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiBhIHNpbmdsZSBwcm9jZXNzb3IsIGluIHRoZSBjYXNlIHdoZXJlIHRoZSBwcmV2aW91cyBjb250ZXh0IHdhcyBsb3N0LlxuICAgKiAgICAgICBXZSBzaG91bGQgbm90IG5lZWQgdG8gZGlzcG9zZSBhbnl0aGluZyBmcm9tIHRoYXQuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxuICAgKi9cbiAgaW5pdGlhbGl6ZUNvbnRleHQoIGdsICkge1xuXG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgcHJvY2Vzc0RyYXdhYmxlKCBkcmF3YWJsZSApIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRlYWN0aXZhdGUoKSB7XG5cbiAgfVxufVxuXG5jbGFzcyBDdXN0b21Qcm9jZXNzb3IgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gQHByaXZhdGUge0RyYXdhYmxlfVxuICAgIHRoaXMuZHJhd2FibGUgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmRyYXdDb3VudCA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIHByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUud2ViZ2xSZW5kZXJlciA9PT0gUmVuZGVyZXIud2ViZ2xDdXN0b20gKTtcblxuICAgIHRoaXMuZHJhd2FibGUgPSBkcmF3YWJsZTtcbiAgICB0aGlzLmRyYXcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5kcmF3Q291bnQ7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgaWYgKCB0aGlzLmRyYXdhYmxlICkge1xuICAgICAgY29uc3QgY291bnQgPSB0aGlzLmRyYXdhYmxlLmRyYXcoKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjb3VudCA9PT0gJ251bWJlcicgKTtcbiAgICAgIHRoaXMuZHJhd0NvdW50ICs9IGNvdW50O1xuICAgICAgdGhpcy5kcmF3YWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFZlcnRleENvbG9yUG9seWdvbnMgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IHByb2plY3Rpb25NYXRyaXhBcnJheSAtIFByb2plY3Rpb24gbWF0cml4IGVudHJpZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBwcm9qZWN0aW9uTWF0cml4QXJyYXkgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvamVjdGlvbk1hdHJpeEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gQHByaXZhdGUge0Zsb2F0MzJBcnJheX1cbiAgICB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSA9IHByb2plY3Rpb25NYXRyaXhBcnJheTtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSW5pdGlhbCBsZW5ndGggb2YgdGhlIHZlcnRleCBidWZmZXIuIE1heSBpbmNyZWFzZSBhcyBuZWVkZWQuXG4gICAgdGhpcy5sYXN0QXJyYXlMZW5ndGggPSAxMjg7XG5cbiAgICAvLyBAcHJpdmF0ZSB7RmxvYXQzMkFycmF5fVxuICAgIHRoaXMudmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmxhc3RBcnJheUxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgb24gYSBzaW5nbGUgcHJvY2Vzc29yLCBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgcHJldmlvdXMgY29udGV4dCB3YXMgbG9zdC5cbiAgICogICAgICAgV2Ugc2hvdWxkIG5vdCBuZWVkIHRvIGRpc3Bvc2UgYW55dGhpbmcgZnJvbSB0aGF0LlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcbiAgICovXG4gIGluaXRpYWxpemVDb250ZXh0KCBnbCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbCwgJ1Nob3VsZCBiZSBhbiBhY3R1YWwgY29udGV4dCcgKTtcblxuICAgIC8vIEBwcml2YXRlIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9XG4gICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgLy8gQHByaXZhdGUge1NoYWRlclByb2dyYW19XG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtID0gbmV3IFNoYWRlclByb2dyYW0oIGdsLCBbXG4gICAgICAvLyB2ZXJ0ZXggc2hhZGVyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVZlcnRleDsnLFxuICAgICAgJ2F0dHJpYnV0ZSB2ZWM0IGFDb2xvcjsnLFxuICAgICAgJ3ZhcnlpbmcgdmVjNCB2Q29sb3I7JyxcbiAgICAgICd1bmlmb3JtIG1hdDMgdVByb2plY3Rpb25NYXRyaXg7JyxcblxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxuICAgICAgJyAgdkNvbG9yID0gYUNvbG9yOycsXG4gICAgICAnICB2ZWMzIG5kYyA9IHVQcm9qZWN0aW9uTWF0cml4ICogdmVjMyggYVZlcnRleCwgMS4wICk7JywgLy8gaG9tb2dlbmVvdXMgbWFwIHRvIHRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXG4gICAgICAnICBnbF9Qb3NpdGlvbiA9IHZlYzQoIG5kYy54eSwgMC4wLCAxLjAgKTsnLFxuICAgICAgJ30nXG4gICAgXS5qb2luKCAnXFxuJyApLCBbXG4gICAgICAvLyBmcmFnbWVudCBzaGFkZXJcbiAgICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxuICAgICAgJ3ZhcnlpbmcgdmVjNCB2Q29sb3I7JyxcblxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxuICAgICAgLy8gTk9URTogUHJlbXVsdGlwbHlpbmcgYWxwaGEgaGVyZSBpcyBuZWVkZWQgc2luY2Ugd2UncmUgZ29pbmcgYmFjayB0byB0aGUgc3RhbmRhcmQgYmxlbmQgZnVuY3Rpb25zLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktc2thdGUtcGFyay9pc3N1ZXMvMzksIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8zOTdcbiAgICAgIC8vIGFuZCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTM0MTU2NC93ZWJnbC1ob3ctdG8tY29ycmVjdGx5LWJsZW5kLWFscGhhLWNoYW5uZWwtcG5nXG4gICAgICAnICBnbF9GcmFnQ29sb3IgPSB2ZWM0KCB2Q29sb3IucmdiICogdkNvbG9yLmEsIHZDb2xvci5hICk7JyxcbiAgICAgICd9J1xuICAgIF0uam9pbiggJ1xcbicgKSwge1xuICAgICAgYXR0cmlidXRlczogWyAnYVZlcnRleCcsICdhQ29sb3InIF0sXG4gICAgICB1bmlmb3JtczogWyAndVByb2plY3Rpb25NYXRyaXgnIF1cbiAgICB9ICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7V2ViR0xCdWZmZXJ9XG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcblxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcbiAgICBnbC5idWZmZXJEYXRhKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QXJyYXksIGdsLkRZTkFNSUNfRFJBVyApOyAvLyBmdWxseSBidWZmZXIgYXQgdGhlIHN0YXJ0XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbS51c2UoKTtcblxuICAgIHRoaXMudmVydGV4QXJyYXlJbmRleCA9IDA7XG4gICAgdGhpcy5kcmF3Q291bnQgPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICBwcm9jZXNzRHJhd2FibGUoIGRyYXdhYmxlICkge1xuICAgIGlmICggZHJhd2FibGUuaW5jbHVkZVZlcnRpY2VzICkge1xuICAgICAgY29uc3QgdmVydGV4RGF0YSA9IGRyYXdhYmxlLnZlcnRleEFycmF5O1xuXG4gICAgICAvLyBpZiBvdXIgdmVydGV4IGRhdGEgd29uJ3QgZml0LCBrZWVwIGRvdWJsaW5nIHRoZSBzaXplIHVudGlsIGl0IGZpdHNcbiAgICAgIHdoaWxlICggdmVydGV4RGF0YS5sZW5ndGggKyB0aGlzLnZlcnRleEFycmF5SW5kZXggPiB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCApIHtcbiAgICAgICAgY29uc3QgbmV3VmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCAqIDIgKTtcbiAgICAgICAgbmV3VmVydGV4QXJyYXkuc2V0KCB0aGlzLnZlcnRleEFycmF5ICk7XG4gICAgICAgIHRoaXMudmVydGV4QXJyYXkgPSBuZXdWZXJ0ZXhBcnJheTtcbiAgICAgIH1cblxuICAgICAgLy8gY29weSBvdXIgdmVydGV4IGRhdGEgaW50byB0aGUgbWFpbiBhcnJheVxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheS5zZXQoIHZlcnRleERhdGEsIHRoaXMudmVydGV4QXJyYXlJbmRleCApO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICs9IHZlcnRleERhdGEubGVuZ3RoO1xuXG4gICAgICB0aGlzLmRyYXdDb3VudCsrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIHRoaXMuZHJhd0NvdW50ICkge1xuICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtLnVudXNlKCk7XG5cbiAgICByZXR1cm4gdGhpcy5kcmF3Q291bnQ7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRyYXcoKSB7XG4gICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xuXG4gICAgLy8gKHVuaWZvcm0pIHByb2plY3Rpb24gdHJhbnNmb3JtIGludG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXNcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KCB0aGlzLnNoYWRlclByb2dyYW0udW5pZm9ybUxvY2F0aW9ucy51UHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHRoaXMucHJvamVjdGlvbk1hdHJpeEFycmF5ICk7XG5cbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XG4gICAgLy8gaWYgd2UgaW5jcmVhc2VkIGluIGxlbmd0aCwgd2UgbmVlZCB0byBkbyBhIGZ1bGwgYnVmZmVyRGF0YSB0byByZXNpemUgaXQgb24gdGhlIEdQVSBzaWRlXG4gICAgaWYgKCB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCA+IHRoaXMubGFzdEFycmF5TGVuZ3RoICkge1xuICAgICAgZ2wuYnVmZmVyRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEFycmF5LCBnbC5EWU5BTUlDX0RSQVcgKTsgLy8gZnVsbHkgYnVmZmVyIGF0IHRoZSBzdGFydFxuICAgIH1cbiAgICAvLyBvdGhlcndpc2UgZG8gYSBtb3JlIGVmZmljaWVudCB1cGRhdGUgdGhhdCBvbmx5IHNlbmRzIHBhcnQgb2YgdGhlIGFycmF5IG92ZXJcbiAgICBlbHNlIHtcbiAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgMCwgdGhpcy52ZXJ0ZXhBcnJheS5zdWJhcnJheSggMCwgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICkgKTtcbiAgICB9XG4gICAgY29uc3Qgc2l6ZU9mRmxvYXQgPSBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgY29uc3Qgc3RyaWRlID0gNiAqIHNpemVPZkZsb2F0O1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYVZlcnRleCwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDAgKiBzaXplT2ZGbG9hdCApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYUNvbG9yLCA0LCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgMiAqIHNpemVPZkZsb2F0ICk7XG5cbiAgICBnbC5kcmF3QXJyYXlzKCBnbC5UUklBTkdMRVMsIDAsIHRoaXMudmVydGV4QXJyYXlJbmRleCAvIDYgKTtcblxuICAgIHRoaXMudmVydGV4QXJyYXlJbmRleCA9IDA7XG4gIH1cbn1cblxuY2xhc3MgVGV4dHVyZWRUcmlhbmdsZXNQcm9jZXNzb3IgZXh0ZW5kcyBQcm9jZXNzb3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IHByb2plY3Rpb25NYXRyaXhBcnJheSAtIFByb2plY3Rpb24gbWF0cml4IGVudHJpZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBwcm9qZWN0aW9uTWF0cml4QXJyYXkgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvamVjdGlvbk1hdHJpeEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gQHByaXZhdGUge0Zsb2F0MzJBcnJheX1cbiAgICB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSA9IHByb2plY3Rpb25NYXRyaXhBcnJheTtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSW5pdGlhbCBsZW5ndGggb2YgdGhlIHZlcnRleCBidWZmZXIuIE1heSBpbmNyZWFzZSBhcyBuZWVkZWQuXG4gICAgdGhpcy5sYXN0QXJyYXlMZW5ndGggPSAxMjg7XG5cbiAgICAvLyBAcHJpdmF0ZSB7RmxvYXQzMkFycmF5fVxuICAgIHRoaXMudmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLmxhc3RBcnJheUxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgb24gYSBzaW5nbGUgcHJvY2Vzc29yLCBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgcHJldmlvdXMgY29udGV4dCB3YXMgbG9zdC5cbiAgICogICAgICAgV2Ugc2hvdWxkIG5vdCBuZWVkIHRvIGRpc3Bvc2UgYW55dGhpbmcgZnJvbSB0aGF0LlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcbiAgICovXG4gIGluaXRpYWxpemVDb250ZXh0KCBnbCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbCwgJ1Nob3VsZCBiZSBhbiBhY3R1YWwgY29udGV4dCcgKTtcblxuICAgIC8vIEBwcml2YXRlIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9XG4gICAgdGhpcy5nbCA9IGdsO1xuXG4gICAgLy8gQHByaXZhdGUge1NoYWRlclByb2dyYW19XG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtID0gbmV3IFNoYWRlclByb2dyYW0oIGdsLCBbXG4gICAgICAvLyB2ZXJ0ZXggc2hhZGVyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVZlcnRleDsnLFxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMyIGFUZXh0dXJlQ29vcmQ7JyxcbiAgICAgICdhdHRyaWJ1dGUgZmxvYXQgYUFscGhhOycsXG4gICAgICAndmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7JyxcbiAgICAgICd2YXJ5aW5nIGZsb2F0IHZBbHBoYTsnLFxuICAgICAgJ3VuaWZvcm0gbWF0MyB1UHJvamVjdGlvbk1hdHJpeDsnLFxuXG4gICAgICAndm9pZCBtYWluKCkgeycsXG4gICAgICAnICB2VGV4dHVyZUNvb3JkID0gYVRleHR1cmVDb29yZDsnLFxuICAgICAgJyAgdkFscGhhID0gYUFscGhhOycsXG4gICAgICAnICB2ZWMzIG5kYyA9IHVQcm9qZWN0aW9uTWF0cml4ICogdmVjMyggYVZlcnRleCwgMS4wICk7JywgLy8gaG9tb2dlbmVvdXMgbWFwIHRvIHRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXG4gICAgICAnICBnbF9Qb3NpdGlvbiA9IHZlYzQoIG5kYy54eSwgMC4wLCAxLjAgKTsnLFxuICAgICAgJ30nXG4gICAgXS5qb2luKCAnXFxuJyApLCBbXG4gICAgICAvLyBmcmFnbWVudCBzaGFkZXJcbiAgICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkOycsXG4gICAgICAndmFyeWluZyBmbG9hdCB2QWxwaGE7JyxcbiAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1VGV4dHVyZTsnLFxuXG4gICAgICAndm9pZCBtYWluKCkgeycsXG4gICAgICAnICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKCB1VGV4dHVyZSwgdlRleHR1cmVDb29yZCwgLTAuNyApOycsIC8vIG1pcG1hcCBMT0QgYmlhcyBvZiAtMC43IChmb3Igbm93KVxuICAgICAgJyAgY29sb3IuYSAqPSB2QWxwaGE7JyxcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IGNvbG9yOycsIC8vIGRvbid0IHByZW11bHRpcGx5IGFscGhhICh3ZSBhcmUgbG9hZGluZyB0aGUgdGV4dHVyZXMgYXMgcHJlbXVsdGlwbGllZCBhbHJlYWR5KVxuICAgICAgJ30nXG4gICAgXS5qb2luKCAnXFxuJyApLCB7XG4gICAgICAvLyBhdHRyaWJ1dGVzOiBbICdhVmVydGV4JywgJ2FUZXh0dXJlQ29vcmQnIF0sXG4gICAgICBhdHRyaWJ1dGVzOiBbICdhVmVydGV4JywgJ2FUZXh0dXJlQ29vcmQnLCAnYUFscGhhJyBdLFxuICAgICAgdW5pZm9ybXM6IFsgJ3VUZXh0dXJlJywgJ3VQcm9qZWN0aW9uTWF0cml4JyBdXG4gICAgfSApO1xuXG4gICAgLy8gQHByaXZhdGUge1dlYkdMQnVmZmVyfVxuICAgIHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XG4gICAgZ2wuYnVmZmVyRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEFycmF5LCBnbC5EWU5BTUlDX0RSQVcgKTsgLy8gZnVsbHkgYnVmZmVyIGF0IHRoZSBzdGFydFxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnNoYWRlclByb2dyYW0udXNlKCk7XG5cbiAgICB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldCA9IG51bGw7XG4gICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ID0gMDtcbiAgICB0aGlzLmRyYXdDb3VudCA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIHByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgLy8gc2tpcCB1bmxvYWRlZCBpbWFnZXMgb3Igc3ByaXRlc1xuICAgIGlmICggIWRyYXdhYmxlLnNwcml0ZSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS53ZWJnbFJlbmRlcmVyID09PSBSZW5kZXJlci53ZWJnbFRleHR1cmVkVHJpYW5nbGVzICk7XG4gICAgaWYgKCB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldCAmJiBkcmF3YWJsZS5zcHJpdGUuc3ByaXRlU2hlZXQgIT09IHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ICkge1xuICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ID0gZHJhd2FibGUuc3ByaXRlLnNwcml0ZVNoZWV0O1xuXG4gICAgY29uc3QgdmVydGV4RGF0YSA9IGRyYXdhYmxlLnZlcnRleEFycmF5O1xuXG4gICAgLy8gaWYgb3VyIHZlcnRleCBkYXRhIHdvbid0IGZpdCwga2VlcCBkb3VibGluZyB0aGUgc2l6ZSB1bnRpbCBpdCBmaXRzXG4gICAgd2hpbGUgKCB2ZXJ0ZXhEYXRhLmxlbmd0aCArIHRoaXMudmVydGV4QXJyYXlJbmRleCA+IHRoaXMudmVydGV4QXJyYXkubGVuZ3RoICkge1xuICAgICAgY29uc3QgbmV3VmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCAqIDIgKTtcbiAgICAgIG5ld1ZlcnRleEFycmF5LnNldCggdGhpcy52ZXJ0ZXhBcnJheSApO1xuICAgICAgdGhpcy52ZXJ0ZXhBcnJheSA9IG5ld1ZlcnRleEFycmF5O1xuICAgIH1cblxuICAgIC8vIGNvcHkgb3VyIHZlcnRleCBkYXRhIGludG8gdGhlIG1haW4gYXJyYXlcbiAgICB0aGlzLnZlcnRleEFycmF5LnNldCggdmVydGV4RGF0YSwgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICk7XG4gICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICs9IHZlcnRleERhdGEubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICggdGhpcy5jdXJyZW50U3ByaXRlU2hlZXQgKSB7XG4gICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNoYWRlclByb2dyYW0udW51c2UoKTtcblxuICAgIHJldHVybiB0aGlzLmRyYXdDb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZHJhdygpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldCApO1xuICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcblxuICAgIC8vICh1bmlmb3JtKSBwcm9qZWN0aW9uIHRyYW5zZm9ybSBpbnRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXG4gICAgZ2wudW5pZm9ybU1hdHJpeDNmdiggdGhpcy5zaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVByb2plY3Rpb25NYXRyaXgsIGZhbHNlLCB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSApO1xuXG4gICAgZ2wuYmluZEJ1ZmZlciggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEJ1ZmZlciApO1xuICAgIC8vIGlmIHdlIGluY3JlYXNlZCBpbiBsZW5ndGgsIHdlIG5lZWQgdG8gZG8gYSBmdWxsIGJ1ZmZlckRhdGEgdG8gcmVzaXplIGl0IG9uIHRoZSBHUFUgc2lkZVxuICAgIGlmICggdGhpcy52ZXJ0ZXhBcnJheS5sZW5ndGggPiB0aGlzLmxhc3RBcnJheUxlbmd0aCApIHtcbiAgICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhBcnJheSwgZ2wuRFlOQU1JQ19EUkFXICk7IC8vIGZ1bGx5IGJ1ZmZlciBhdCB0aGUgc3RhcnRcbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlIGRvIGEgbW9yZSBlZmZpY2llbnQgdXBkYXRlIHRoYXQgb25seSBzZW5kcyBwYXJ0IG9mIHRoZSBhcnJheSBvdmVyXG4gICAgZWxzZSB7XG4gICAgICBnbC5idWZmZXJTdWJEYXRhKCBnbC5BUlJBWV9CVUZGRVIsIDAsIHRoaXMudmVydGV4QXJyYXkuc3ViYXJyYXkoIDAsIHRoaXMudmVydGV4QXJyYXlJbmRleCApICk7XG4gICAgfVxuXG4gICAgY29uc3QgbnVtQ29tcG9uZW50cyA9IDU7XG4gICAgY29uc3Qgc2l6ZU9mRmxvYXQgPSBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XG4gICAgY29uc3Qgc3RyaWRlID0gbnVtQ29tcG9uZW50cyAqIHNpemVPZkZsb2F0O1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYVZlcnRleCwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDAgKiBzaXplT2ZGbG9hdCApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYVRleHR1cmVDb29yZCwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDIgKiBzaXplT2ZGbG9hdCApO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYUFscGhhLCAxLCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgNCAqIHNpemVPZkZsb2F0ICk7XG5cbiAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbC5URVhUVVJFMCApO1xuICAgIGdsLmJpbmRUZXh0dXJlKCBnbC5URVhUVVJFXzJELCB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldC50ZXh0dXJlICk7XG4gICAgZ2wudW5pZm9ybTFpKCB0aGlzLnNoYWRlclByb2dyYW0udW5pZm9ybUxvY2F0aW9ucy51VGV4dHVyZSwgMCApO1xuXG4gICAgZ2wuZHJhd0FycmF5cyggZ2wuVFJJQU5HTEVTLCAwLCB0aGlzLnZlcnRleEFycmF5SW5kZXggLyBudW1Db21wb25lbnRzICk7XG5cbiAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgbnVsbCApO1xuXG4gICAgdGhpcy5kcmF3Q291bnQrKztcblxuICAgIHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ID0gbnVsbDtcbiAgICB0aGlzLnZlcnRleEFycmF5SW5kZXggPSAwO1xuICB9XG59XG5cblBvb2xhYmxlLm1peEludG8oIFdlYkdMQmxvY2sgKTtcblxuZXhwb3J0IGRlZmF1bHQgV2ViR0xCbG9jazsiXSwibmFtZXMiOlsiVGlueUVtaXR0ZXIiLCJNYXRyaXgzIiwiY2xlYW5BcnJheSIsIlBvb2xhYmxlIiwiRml0dGVkQmxvY2siLCJSZW5kZXJlciIsInNjZW5lcnkiLCJTaGFkZXJQcm9ncmFtIiwiU3ByaXRlU2hlZXQiLCJVdGlscyIsIldlYkdMQmxvY2siLCJpbml0aWFsaXplIiwiZGlzcGxheSIsInJlbmRlcmVyIiwidHJhbnNmb3JtUm9vdEluc3RhbmNlIiwiZmlsdGVyUm9vdEluc3RhbmNlIiwic2NlbmVyeUxvZyIsImlkIiwicHVzaCIsIkZVTExfRElTUExBWSIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIl9wcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJkaXJ0eURyYXdhYmxlcyIsInNwcml0ZVNoZWV0cyIsInByb2plY3Rpb25NYXRyaXgiLCJwcm9qZWN0aW9uTWF0cml4QXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJjdXN0b21Qcm9jZXNzb3IiLCJDdXN0b21Qcm9jZXNzb3IiLCJ2ZXJ0ZXhDb2xvclBvbHlnb25zUHJvY2Vzc29yIiwiVmVydGV4Q29sb3JQb2x5Z29ucyIsInRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yIiwiVGV4dHVyZWRUcmlhbmdsZXNQcm9jZXNzb3IiLCJnbENoYW5nZWRFbWl0dGVyIiwiaXNDb250ZXh0TG9zdCIsImNvbnRleHRMb3N0TGlzdGVuZXIiLCJvbkNvbnRleHRMb3NzIiwiYmluZCIsImNvbnRleHRSZXN0b3JlTGlzdGVuZXIiLCJvbkNvbnRleHRSZXN0b3JhdGlvbiIsImRvbUVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInJlYnVpbGRDYW52YXMiLCJnbCIsImNsZWFyIiwiQ09MT1JfQlVGRkVSX0JJVCIsInByZXBhcmVGb3JUcmFuc2Zvcm0iLCJjYW52YXMiLCJ1bnNldFRyYW5zZm9ybSIsInBvcCIsImdldENvbnRleHRGcm9tQ2FudmFzIiwiYXNzZXJ0IiwicmVtb3ZlQ2hpbGQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicG9pbnRlckV2ZW50cyIsImNhbnZhc0lkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImFwcGVuZENoaWxkIiwic2V0dXBDb250ZXh0IiwiYmFja2luZ1NjYWxlIiwiX2FsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nIiwiZ2V0UGFyYW1ldGVyIiwiU0FNUExFUyIsIm9yaWdpbmFsQmFja2luZ1NjYWxlIiwiYXBwbHlXZWJHTENvbnRleHREZWZhdWx0cyIsIm1hcmtEaXJ0eSIsImRpcnR5Rml0IiwiaW5pdGlhbGl6ZUNvbnRleHQiLCJpIiwibGVuZ3RoIiwiZW1pdCIsImRlbGF5ZWRSZWJ1aWxkQ2FudmFzIiwic2VsZiIsIndpbmRvdyIsInNldFRpbWVvdXQiLCJkb21FdmVudCIsInByZXZlbnREZWZhdWx0IiwiY29udGV4dE9wdGlvbnMiLCJhbnRpYWxpYXMiLCJnZXRDb250ZXh0Iiwic2V0U2l6ZUZ1bGxEaXNwbGF5Iiwic2l6ZSIsImdldFNpemUiLCJ3aWR0aCIsIk1hdGgiLCJjZWlsIiwiaGVpZ2h0Iiwic2V0U2l6ZUZpdEJvdW5kcyIsIkVycm9yIiwidXBkYXRlIiwiX2FnZ3Jlc3NpdmVDb250ZXh0UmVjcmVhdGlvbiIsIm51bVNwcml0ZVNoZWV0cyIsInVwZGF0ZVRleHR1cmUiLCJmaXJzdERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwibm9kZSIsIl93ZWJnbFNjYWxlIiwidXBkYXRlRml0Iiwicm93TWFqb3IiLCJjb3B5VG9BcnJheSIsInZpZXdwb3J0IiwiY3VycmVudFByb2Nlc3NvciIsImN1bXVsYXRpdmVEcmF3Q291bnQiLCJkcmF3YWJsZSIsIm5leHREcmF3YWJsZSIsInZpc2libGUiLCJkZXNpcmVkUHJvY2Vzc29yIiwid2ViZ2xSZW5kZXJlciIsIndlYmdsVGV4dHVyZWRUcmlhbmdsZXMiLCJ3ZWJnbEN1c3RvbSIsIndlYmdsVmVydGV4Q29sb3JQb2x5Z29ucyIsImRlYWN0aXZhdGUiLCJhY3RpdmF0ZSIsInByb2Nlc3NEcmF3YWJsZSIsImZsdXNoIiwiZGlzcG9zZSIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZGlydHkiLCJ0b1N0cmluZyIsImlzRGlzcG9zZWQiLCJhZGREcmF3YWJsZSIsIm9uQWRkVG9CbG9jayIsInJlbW92ZURyYXdhYmxlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwib25SZW1vdmVGcm9tQmxvY2siLCJhZGRTcHJpdGVTaGVldEltYWdlIiwiaW1hZ2UiLCJzcHJpdGUiLCJzcHJpdGVTaGVldCIsImFkZEltYWdlIiwibmV3U3ByaXRlU2hlZXQiLCJyZW1vdmVTcHJpdGVTaGVldEltYWdlIiwicmVtb3ZlSW1hZ2UiLCJvbkludGVydmFsQ2hhbmdlIiwib25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUiLCJwYXJlbnREcmF3YWJsZSIsImZpdFN0cmluZyIsImZpdCIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiLCJQcm9jZXNzb3IiLCJkcmF3Q291bnQiLCJkcmF3IiwiY291bnQiLCJzaGFkZXJQcm9ncmFtIiwiam9pbiIsImF0dHJpYnV0ZXMiLCJ1bmlmb3JtcyIsInZlcnRleEJ1ZmZlciIsImNyZWF0ZUJ1ZmZlciIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJidWZmZXJEYXRhIiwidmVydGV4QXJyYXkiLCJEWU5BTUlDX0RSQVciLCJ1c2UiLCJ2ZXJ0ZXhBcnJheUluZGV4IiwiaW5jbHVkZVZlcnRpY2VzIiwidmVydGV4RGF0YSIsIm5ld1ZlcnRleEFycmF5Iiwic2V0IiwidW51c2UiLCJ1bmlmb3JtTWF0cml4M2Z2IiwidW5pZm9ybUxvY2F0aW9ucyIsInVQcm9qZWN0aW9uTWF0cml4IiwibGFzdEFycmF5TGVuZ3RoIiwiYnVmZmVyU3ViRGF0YSIsInN1YmFycmF5Iiwic2l6ZU9mRmxvYXQiLCJCWVRFU19QRVJfRUxFTUVOVCIsInN0cmlkZSIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJhdHRyaWJ1dGVMb2NhdGlvbnMiLCJhVmVydGV4IiwiRkxPQVQiLCJhQ29sb3IiLCJkcmF3QXJyYXlzIiwiVFJJQU5HTEVTIiwiY3VycmVudFNwcml0ZVNoZWV0IiwibnVtQ29tcG9uZW50cyIsImFUZXh0dXJlQ29vcmQiLCJhQWxwaGEiLCJhY3RpdmVUZXh0dXJlIiwiVEVYVFVSRTAiLCJiaW5kVGV4dHVyZSIsIlRFWFRVUkVfMkQiLCJ0ZXh0dXJlIiwidW5pZm9ybTFpIiwidVRleHR1cmUiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsaUJBQWlC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