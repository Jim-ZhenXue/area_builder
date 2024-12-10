// Copyright 2013-2024, University of Colorado Boulder
/**
 * Handles a visual Canvas layer of drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { CanvasContextWrapper, Features, FittedBlock, Renderer, scenery, Utils } from '../imports.js';
const scratchMatrix = new Matrix3();
const scratchMatrix2 = new Matrix3();
let CanvasBlock = class CanvasBlock extends FittedBlock {
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
   */ initialize(display, renderer, transformRootInstance, filterRootInstance) {
        super.initialize(display, renderer, transformRootInstance, FittedBlock.COMMON_ANCESTOR);
        // @private {Instance}
        this.filterRootInstance = filterRootInstance;
        // @private {Array.<Drawable>}
        this.dirtyDrawables = cleanArray(this.dirtyDrawables);
        if (!this.domElement) {
            //OHTWO TODO: support tiled Canvas handling (will need to wrap then in a div, or something) https://github.com/phetsims/scenery/issues/1581
            // @public {HTMLCanvasElement}
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = '0';
            this.canvas.style.top = '0';
            this.canvas.style.pointerEvents = 'none';
            // @private {number} - unique ID so that we can support rasterization with Display.foreignObjectRasterization
            this.canvasId = this.canvas.id = `scenery-canvas${this.id}`;
            // @private {CanvasRenderingContext2D}
            this.context = this.canvas.getContext('2d');
            this.context.save(); // We always immediately save every Canvas so we can restore/save for clipping
            // workaround for Chrome (WebKit) miterLimit bug: https://bugs.webkit.org/show_bug.cgi?id=108763
            this.context.miterLimit = 20;
            this.context.miterLimit = 10;
            // @private {CanvasContextWrapper} - Tracks intermediate Canvas context state, so we don't have to send
            // unnecessary Canvas commands.
            this.wrapper = new CanvasContextWrapper(this.canvas, this.context);
            // @public {DOMElement} - TODO: Doc this properly for {Block} as a whole https://github.com/phetsims/scenery/issues/1581
            this.domElement = this.canvas;
            // {Array.<CanvasContextWrapper>} as multiple Canvases are needed to properly render opacity within the block.
            this.wrapperStack = [
                this.wrapper
            ];
        }
        // {number} - The index into the wrapperStack array where our current Canvas (that we are drawing to) is.
        this.wrapperStackIndex = 0;
        // @private {Object.<nodeId:number,number> - Maps node ID => count of how many listeners we WOULD have attached to
        // it. We only attach at most one listener to each node. We need to listen to all ancestors up to our filter root,
        // so that we can pick up opacity changes.
        this.filterListenerCountMap = this.filterListenerCountMap || {};
        // Reset any fit transforms that were applied
        Utils.prepareForTransform(this.canvas); // Apply CSS needed for future CSS transforms to work properly.
        Utils.unsetTransform(this.canvas); // clear out any transforms that could have been previously applied
        // @private {Vector2}
        this.canvasDrawOffset = new Vector2(0, 0);
        // @private {Drawable|null}
        this.currentDrawable = null;
        // @private {boolean} - Whether we need to re-apply clipping to our current Canvas
        this.clipDirty = true;
        // @private {number} - How many clips should be applied (given our current "position" in the walk up/down).
        this.clipCount = 0;
        // @private {number} - store our backing scale so we don't have to look it up while fitting
        this.backingScale = renderer & Renderer.bitmaskCanvasLowResolution ? 1 : Utils.backingScale(this.context);
        // TODO: > You can use window.matchMedia() to check if the value of devicePixelRatio changes (which can happen, https://github.com/phetsims/scenery/issues/1581
        // TODO: > for example, if the user drags the window to a display with a different pixel density). https://github.com/phetsims/scenery/issues/1581
        // TODO: OH NO, we may need to figure out watching this? https://github.com/phetsims/scenery/issues/1581
        // @private {function}
        this.clipDirtyListener = this.markDirty.bind(this);
        this.opacityDirtyListener = this.markDirty.bind(this);
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`initialized #${this.id}`);
    // TODO: dirty list of nodes (each should go dirty only once, easier than scanning all?) https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * @public
   * @override
   */ setSizeFullDisplay() {
        const size = this.display.getSize();
        this.canvas.width = size.width * this.backingScale;
        this.canvas.height = size.height * this.backingScale;
        this.canvas.style.width = `${size.width}px`;
        this.canvas.style.height = `${size.height}px`;
        this.wrapper.resetStyles();
        this.canvasDrawOffset.setXY(0, 0);
        Utils.unsetTransform(this.canvas);
    }
    /**
   * @public
   * @override
   */ setSizeFitBounds() {
        const x = this.fitBounds.minX;
        const y = this.fitBounds.minY;
        this.canvasDrawOffset.setXY(-x, -y); // subtract off so we have a tight fit
        //OHTWO TODO PERFORMANCE: see if we can get a speedup by putting the backing scale in our transform instead of with CSS? https://github.com/phetsims/scenery/issues/1581
        Utils.setTransform(`matrix(1,0,0,1,${x},${y})`, this.canvas); // reapply the translation as a CSS transform
        this.canvas.width = this.fitBounds.width * this.backingScale;
        this.canvas.height = this.fitBounds.height * this.backingScale;
        this.canvas.style.width = `${this.fitBounds.width}px`;
        this.canvas.style.height = `${this.fitBounds.height}px`;
        this.wrapper.resetStyles();
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
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`update #${this.id}`);
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
        while(this.dirtyDrawables.length){
            this.dirtyDrawables.pop().update();
        }
        // udpate the fit BEFORE drawing, since it may change our offset
        this.updateFit();
        // for now, clear everything!
        this.context.restore(); // just in case we were clipping/etc.
        this.context.setTransform(1, 0, 0, 1, 0, 0); // identity
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear everything
        this.context.save();
        this.wrapper.resetStyles();
        //OHTWO TODO: PERFORMANCE: create an array for faster drawable iteration (this is probably a hellish memory access pattern) https://github.com/phetsims/scenery/issues/1581
        //OHTWO TODO: why is "drawable !== null" check needed https://github.com/phetsims/scenery/issues/1581
        this.currentDrawable = null; // we haven't rendered a drawable this frame yet
        for(let drawable = this.firstDrawable; drawable !== null; drawable = drawable.nextDrawable){
            this.renderDrawable(drawable);
            if (drawable === this.lastDrawable) {
                break;
            }
        }
        if (this.currentDrawable) {
            this.walkDown(this.currentDrawable.instance.trail, 0);
        }
        assert && assert(this.clipCount === 0, 'clipCount should be zero after walking back down');
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
        return true;
    }
    /**
   * Reapplies clips to the current context. It's necessary to fully apply every clipping area for every ancestor,
   * due to how Canvas is set up. Should ideally be called when the clip is dirty.
   * @private
   *
   * This is necessary since you can't apply "nested" clipping areas naively in Canvas, but you specify one entire
   * clip area.
   *
   * @param {CanvasSelfDrawable} Drawable
   */ applyClip(drawable) {
        this.clipDirty = false;
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Apply clip ${drawable.instance.trail.toDebugString()}`);
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
        const wrapper = this.wrapperStack[this.wrapperStackIndex];
        const context = wrapper.context;
        // Re-set (even if no clip is needed, so we get rid of the old clip)
        context.restore();
        context.save();
        wrapper.resetStyles();
        // If 0, no clip is needed
        if (this.clipCount) {
            const instance = drawable.instance;
            const trail = instance.trail;
            // Inverse of what we'll be applying to the scene, to get back to the root coordinate transform
            scratchMatrix.rowMajor(this.backingScale, 0, this.canvasDrawOffset.x * this.backingScale, 0, this.backingScale, this.canvasDrawOffset.y * this.backingScale, 0, 0, 1);
            scratchMatrix2.set(this.transformRootInstance.trail.getMatrix()).invert();
            scratchMatrix2.multiplyMatrix(scratchMatrix).canvasSetTransform(context);
            // Recursively apply clips and transforms
            for(let i = 0; i < trail.length; i++){
                const node = trail.nodes[i];
                node.getMatrix().canvasAppendTransform(context);
                if (node.hasClipArea()) {
                    context.beginPath();
                    node.clipArea.writeToContext(context);
                    // TODO: add the ability to show clipping highlights inline? https://github.com/phetsims/scenery/issues/1581
                    // context.save();
                    // context.strokeStyle = 'red';
                    // context.lineWidth = 2;
                    // context.stroke();
                    // context.restore();
                    context.clip();
                }
            }
        }
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
    }
    /**
   * Pushes a wrapper onto our stack (creating if necessary), and initializes.
   * @private
   */ pushWrapper() {
        this.wrapperStackIndex++;
        this.clipDirty = true;
        // If we need to push an entirely new Canvas to the stack
        if (this.wrapperStackIndex === this.wrapperStack.length) {
            const newCanvas = document.createElement('canvas');
            const newContext = newCanvas.getContext('2d');
            newContext.save();
            this.wrapperStack.push(new CanvasContextWrapper(newCanvas, newContext));
        }
        const wrapper = this.wrapperStack[this.wrapperStackIndex];
        const context = wrapper.context;
        // Size and clear our context
        wrapper.setDimensions(this.canvas.width, this.canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0); // identity
        context.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear everything
    }
    /**
   * Pops a wrapper off of our stack.
   * @private
   */ popWrapper() {
        this.wrapperStackIndex--;
        this.clipDirty = true;
    }
    /**
   * Walk down towards the root, popping any clip/opacity effects that were needed.
   * @private
   *
   * @param {Trail} trail
   * @param {number} branchIndex - The first index where our before and after trails have diverged.
   */ walkDown(trail, branchIndex) {
        const filterRootIndex = this.filterRootInstance.trail.length - 1;
        for(let i = trail.length - 1; i >= branchIndex; i--){
            const node = trail.nodes[i];
            if (node.hasClipArea()) {
                sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop clip ${trail.subtrailTo(node).toDebugString()}`);
                // Pop clip
                this.clipCount--;
                this.clipDirty = true;
            }
            // We should not apply opacity or other filters at or below the filter root
            if (i > filterRootIndex) {
                if (node._filters.length) {
                    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop filters ${trail.subtrailTo(node).toDebugString()}`);
                    const topWrapper = this.wrapperStack[this.wrapperStackIndex];
                    const bottomWrapper = this.wrapperStack[this.wrapperStackIndex - 1];
                    this.popWrapper();
                    bottomWrapper.context.setTransform(1, 0, 0, 1, 0, 0);
                    const filters = node._filters;
                    // We need to fall back to a different filter behavior with Chrome, since it over-darkens otherwise with the
                    // built-in feature.
                    // NOTE: Not blocking chromium anymore, see https://github.com/phetsims/scenery/issues/1139
                    // We'll go for the higher-performance but potentially-visually-different option.
                    let canUseInternalFilter = Features.canvasFilter;
                    for(let j = 0; j < filters.length; j++){
                        // If we use context.filter, it's equivalent to checking DOM compatibility on all of them.
                        canUseInternalFilter = canUseInternalFilter && filters[j].isDOMCompatible();
                    }
                    if (canUseInternalFilter) {
                        // Draw using the context.filter operation
                        let filterString = '';
                        for(let j = 0; j < filters.length; j++){
                            filterString += `${filterString ? ' ' : ''}${filters[j].getCSSFilterString()}`;
                        }
                        bottomWrapper.context.filter = filterString;
                        bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
                        bottomWrapper.context.filter = 'none';
                    } else {
                        // Draw by manually manipulating the ImageData pixels of the top Canvas, then draw it in.
                        for(let j = 0; j < filters.length; j++){
                            filters[j].applyCanvasFilter(topWrapper);
                        }
                        bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
                    }
                }
                if (node.getEffectiveOpacity() !== 1) {
                    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Pop opacity ${trail.subtrailTo(node).toDebugString()}`);
                    // Pop opacity
                    const topWrapper = this.wrapperStack[this.wrapperStackIndex];
                    const bottomWrapper = this.wrapperStack[this.wrapperStackIndex - 1];
                    this.popWrapper();
                    // Draw the transparent content into the next-level Canvas.
                    bottomWrapper.context.setTransform(1, 0, 0, 1, 0, 0);
                    bottomWrapper.context.globalAlpha = node.getEffectiveOpacity();
                    bottomWrapper.context.drawImage(topWrapper.canvas, 0, 0);
                    bottomWrapper.context.globalAlpha = 1;
                }
            }
        }
    }
    /**
   * Walk up towards the next leaf, pushing any clip/opacity effects that are needed.
   * @private
   *
   * @param {Trail} trail
   * @param {number} branchIndex - The first index where our before and after trails have diverged.
   */ walkUp(trail, branchIndex) {
        const filterRootIndex = this.filterRootInstance.trail.length - 1;
        for(let i = branchIndex; i < trail.length; i++){
            const node = trail.nodes[i];
            // We should not apply opacity at or below the filter root
            if (i > filterRootIndex) {
                if (node.getEffectiveOpacity() !== 1) {
                    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push opacity ${trail.subtrailTo(node).toDebugString()}`);
                    // Push opacity
                    this.pushWrapper();
                }
                if (node._filters.length) {
                    sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push filters ${trail.subtrailTo(node).toDebugString()}`);
                    // Push filters
                    this.pushWrapper();
                }
            }
            if (node.hasClipArea()) {
                sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`Push clip ${trail.subtrailTo(node).toDebugString()}`);
                // Push clip
                this.clipCount++;
                this.clipDirty = true;
            }
        }
    }
    /**
   * Draws the drawable into our main Canvas.
   * @private
   *
   * For things like opacity/clipping, as part of this we walk up/down part of the instance tree for rendering each
   * drawable.
   *
   * @param {CanvasSelfDrawable} - TODO: In the future, we'll need to support Canvas caches (this should be updated https://github.com/phetsims/scenery/issues/1581
   *                               with a proper generalized type)
   */ renderDrawable(drawable) {
        // do not paint invisible drawables, or drawables that are out of view
        if (!drawable.visible || this.canvas.width === 0 || this.canvas.height === 0) {
            return;
        }
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`renderDrawable #${drawable.id} ${drawable.instance.trail.toDebugString()}`);
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
        // For opacity/clip, walk up/down as necessary (Can only walk down if we are not the first drawable)
        const branchIndex = this.currentDrawable ? drawable.instance.getBranchIndexTo(this.currentDrawable.instance) : 0;
        if (this.currentDrawable) {
            this.walkDown(this.currentDrawable.instance.trail, branchIndex);
        }
        this.walkUp(drawable.instance.trail, branchIndex);
        const wrapper = this.wrapperStack[this.wrapperStackIndex];
        const context = wrapper.context;
        // Re-apply the clip if necessary. The walk down/up may have flagged a potential clip change (if we walked across
        // something with a clip area).
        if (this.clipDirty) {
            this.applyClip(drawable);
        }
        // we're directly accessing the relative transform below, so we need to ensure that it is up-to-date
        assert && assert(drawable.instance.relativeTransform.isValidationNotNeeded());
        const matrix = drawable.instance.relativeTransform.matrix;
        // set the correct (relative to the transform root) transform up, instead of walking the hierarchy (for now)
        //OHTWO TODO: should we start premultiplying these matrices to remove this bottleneck? https://github.com/phetsims/scenery/issues/1581
        context.setTransform(this.backingScale, 0, 0, this.backingScale, this.canvasDrawOffset.x * this.backingScale, this.canvasDrawOffset.y * this.backingScale);
        if (drawable.instance !== this.transformRootInstance) {
            matrix.canvasAppendTransform(context);
        }
        // paint using its local coordinate frame
        drawable.paintCanvas(wrapper, drawable.instance.node, drawable.instance.relativeTransform.matrix);
        this.currentDrawable = drawable;
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`dispose #${this.id}`);
        // clear references
        this.transformRootInstance = null;
        cleanArray(this.dirtyDrawables);
        // minimize memory exposure of the backing raster
        this.canvas.width = 0;
        this.canvas.height = 0;
        super.dispose();
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ markDirtyDrawable(drawable) {
        sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on CanvasBlock#${this.id} with ${drawable.toString()}`);
        assert && assert(drawable);
        if (assert) {
            // Catch infinite loops
            this.display.ensureNotPainting();
        }
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
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
        super.addDrawable(drawable);
        // Add opacity listeners (from this node up to the filter root)
        for(let instance = drawable.instance; instance && instance !== this.filterRootInstance; instance = instance.parent){
            const node = instance.node;
            // Only add the listener if we don't already have one
            if (this.filterListenerCountMap[node.id]) {
                this.filterListenerCountMap[node.id]++;
            } else {
                this.filterListenerCountMap[node.id] = 1;
                node.filterChangeEmitter.addListener(this.opacityDirtyListener);
                node.clipAreaProperty.lazyLink(this.clipDirtyListener);
            }
        }
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */ removeDrawable(drawable) {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);
        // Remove opacity listeners (from this node up to the filter root)
        for(let instance = drawable.instance; instance && instance !== this.filterRootInstance; instance = instance.parent){
            const node = instance.node;
            assert && assert(this.filterListenerCountMap[node.id] > 0);
            this.filterListenerCountMap[node.id]--;
            if (this.filterListenerCountMap[node.id] === 0) {
                delete this.filterListenerCountMap[node.id];
                node.clipAreaProperty.unlink(this.clipDirtyListener);
                node.filterChangeEmitter.removeListener(this.opacityDirtyListener);
            }
        }
        super.removeDrawable(drawable);
    }
    /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ onIntervalChange(firstDrawable, lastDrawable) {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
        super.onIntervalChange(firstDrawable, lastDrawable);
        // If we have an interval change, we'll need to ensure we repaint (even if we're full-display). This was a missed
        // case for https://github.com/phetsims/scenery/issues/512, where it would only clear if it was a common-ancestor
        // fitted block.
        this.markDirty();
    }
    /**
   * @public
   *
   * @param {Drawable} drawable
   */ onPotentiallyMovedDrawable(drawable) {
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.CanvasBlock(`#${this.id}.onPotentiallyMovedDrawable ${drawable.toString()}`);
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.push();
        assert && assert(drawable.parentDrawable === this);
        // For now, mark it as dirty so that we redraw anything containing it. In the future, we could have more advanced
        // behavior that figures out the intersection-region for what was moved and what it was moved past, but that's
        // a harder problem.
        drawable.markDirty();
        sceneryLog && sceneryLog.CanvasBlock && sceneryLog.pop();
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `CanvasBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
    }
    /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {number} renderer - See Renderer.js for more information
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
scenery.register('CanvasBlock', CanvasBlock);
Poolable.mixInto(CanvasBlock);
export default CanvasBlock;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9DYW52YXNCbG9jay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIYW5kbGVzIGEgdmlzdWFsIENhbnZhcyBsYXllciBvZiBkcmF3YWJsZXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcbmltcG9ydCBQb29sYWJsZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbGFibGUuanMnO1xuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIEZlYXR1cmVzLCBGaXR0ZWRCbG9jaywgUmVuZGVyZXIsIHNjZW5lcnksIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IHNjcmF0Y2hNYXRyaXggPSBuZXcgTWF0cml4MygpO1xuY29uc3Qgc2NyYXRjaE1hdHJpeDIgPSBuZXcgTWF0cml4MygpO1xuXG5jbGFzcyBDYW52YXNCbG9jayBleHRlbmRzIEZpdHRlZEJsb2NrIHtcbiAgLyoqXG4gICAqIEBtaXhlcyBQb29sYWJsZVxuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyIC0gU2VlIFJlbmRlcmVyLmpzIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZSAtIEFsbCB0cmFuc2Zvcm1zIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnMgd2lsbCBhbHJlYWR5IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3IgYXBwbHlpbmcgdHJhbnNmb3JtcyBvZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIEFsbCBmaWx0ZXJzICh2aXNpYmlsaXR5L29wYWNpdHkvZmlsdGVycykgb2YgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9yc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGFscmVhZHkgaGF2ZSBiZWVuIGFwcGxpZWQuIFRoaXMgYmxvY2sgd2lsbCBvbmx5IGJlIHJlc3BvbnNpYmxlIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseWluZyBmaWx0ZXJzIG9mIHRoaXMgaW5zdGFuY2UncyBkZXNjZW5kYW50cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBmaWx0ZXJSb290SW5zdGFuY2UgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggZGlzcGxheSwgcmVuZGVyZXIsIHRyYW5zZm9ybVJvb3RJbnN0YW5jZSwgZmlsdGVyUm9vdEluc3RhbmNlICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZSAtIEFsbCB0cmFuc2Zvcm1zIG9mIHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBhbmNlc3RvcnMgd2lsbCBhbHJlYWR5IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWVkLiBUaGlzIGJsb2NrIHdpbGwgb25seSBiZSByZXNwb25zaWJsZSBmb3IgYXBwbHlpbmcgdHJhbnNmb3JtcyBvZlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzIGluc3RhbmNlJ3MgZGVzY2VuZGFudHMuXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZSAtIEFsbCBmaWx0ZXJzICh2aXNpYmlsaXR5L29wYWNpdHkvZmlsdGVycykgb2YgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIGFuY2VzdG9yc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGFscmVhZHkgaGF2ZSBiZWVuIGFwcGxpZWQuIFRoaXMgYmxvY2sgd2lsbCBvbmx5IGJlIHJlc3BvbnNpYmxlIGZvclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseWluZyBmaWx0ZXJzIG9mIHRoaXMgaW5zdGFuY2UncyBkZXNjZW5kYW50cy5cbiAgICovXG4gIGluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGZpbHRlclJvb3RJbnN0YW5jZSApIHtcbiAgICBzdXBlci5pbml0aWFsaXplKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBGaXR0ZWRCbG9jay5DT01NT05fQU5DRVNUT1IgKTtcblxuICAgIC8vIEBwcml2YXRlIHtJbnN0YW5jZX1cbiAgICB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZSA9IGZpbHRlclJvb3RJbnN0YW5jZTtcblxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48RHJhd2FibGU+fVxuICAgIHRoaXMuZGlydHlEcmF3YWJsZXMgPSBjbGVhbkFycmF5KCB0aGlzLmRpcnR5RHJhd2FibGVzICk7XG5cbiAgICBpZiAoICF0aGlzLmRvbUVsZW1lbnQgKSB7XG4gICAgICAvL09IVFdPIFRPRE86IHN1cHBvcnQgdGlsZWQgQ2FudmFzIGhhbmRsaW5nICh3aWxsIG5lZWQgdG8gd3JhcCB0aGVuIGluIGEgZGl2LCBvciBzb21ldGhpbmcpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAvLyBAcHVibGljIHtIVE1MQ2FudmFzRWxlbWVudH1cbiAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgICB0aGlzLmNhbnZhcy5zdHlsZS50b3AgPSAnMCc7XG4gICAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuXG4gICAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHVuaXF1ZSBJRCBzbyB0aGF0IHdlIGNhbiBzdXBwb3J0IHJhc3Rlcml6YXRpb24gd2l0aCBEaXNwbGF5LmZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uXG4gICAgICB0aGlzLmNhbnZhc0lkID0gdGhpcy5jYW52YXMuaWQgPSBgc2NlbmVyeS1jYW52YXMke3RoaXMuaWR9YDtcblxuICAgICAgLy8gQHByaXZhdGUge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1cbiAgICAgIHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbiAgICAgIHRoaXMuY29udGV4dC5zYXZlKCk7IC8vIFdlIGFsd2F5cyBpbW1lZGlhdGVseSBzYXZlIGV2ZXJ5IENhbnZhcyBzbyB3ZSBjYW4gcmVzdG9yZS9zYXZlIGZvciBjbGlwcGluZ1xuXG4gICAgICAvLyB3b3JrYXJvdW5kIGZvciBDaHJvbWUgKFdlYktpdCkgbWl0ZXJMaW1pdCBidWc6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0xMDg3NjNcbiAgICAgIHRoaXMuY29udGV4dC5taXRlckxpbWl0ID0gMjA7XG4gICAgICB0aGlzLmNvbnRleHQubWl0ZXJMaW1pdCA9IDEwO1xuXG4gICAgICAvLyBAcHJpdmF0ZSB7Q2FudmFzQ29udGV4dFdyYXBwZXJ9IC0gVHJhY2tzIGludGVybWVkaWF0ZSBDYW52YXMgY29udGV4dCBzdGF0ZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byBzZW5kXG4gICAgICAvLyB1bm5lY2Vzc2FyeSBDYW52YXMgY29tbWFuZHMuXG4gICAgICB0aGlzLndyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIHRoaXMuY2FudmFzLCB0aGlzLmNvbnRleHQgKTtcblxuICAgICAgLy8gQHB1YmxpYyB7RE9NRWxlbWVudH0gLSBUT0RPOiBEb2MgdGhpcyBwcm9wZXJseSBmb3Ige0Jsb2NrfSBhcyBhIHdob2xlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLmRvbUVsZW1lbnQgPSB0aGlzLmNhbnZhcztcblxuICAgICAgLy8ge0FycmF5LjxDYW52YXNDb250ZXh0V3JhcHBlcj59IGFzIG11bHRpcGxlIENhbnZhc2VzIGFyZSBuZWVkZWQgdG8gcHJvcGVybHkgcmVuZGVyIG9wYWNpdHkgd2l0aGluIHRoZSBibG9jay5cbiAgICAgIHRoaXMud3JhcHBlclN0YWNrID0gWyB0aGlzLndyYXBwZXIgXTtcbiAgICB9XG5cbiAgICAvLyB7bnVtYmVyfSAtIFRoZSBpbmRleCBpbnRvIHRoZSB3cmFwcGVyU3RhY2sgYXJyYXkgd2hlcmUgb3VyIGN1cnJlbnQgQ2FudmFzICh0aGF0IHdlIGFyZSBkcmF3aW5nIHRvKSBpcy5cbiAgICB0aGlzLndyYXBwZXJTdGFja0luZGV4ID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtPYmplY3QuPG5vZGVJZDpudW1iZXIsbnVtYmVyPiAtIE1hcHMgbm9kZSBJRCA9PiBjb3VudCBvZiBob3cgbWFueSBsaXN0ZW5lcnMgd2UgV09VTEQgaGF2ZSBhdHRhY2hlZCB0b1xuICAgIC8vIGl0LiBXZSBvbmx5IGF0dGFjaCBhdCBtb3N0IG9uZSBsaXN0ZW5lciB0byBlYWNoIG5vZGUuIFdlIG5lZWQgdG8gbGlzdGVuIHRvIGFsbCBhbmNlc3RvcnMgdXAgdG8gb3VyIGZpbHRlciByb290LFxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHBpY2sgdXAgb3BhY2l0eSBjaGFuZ2VzLlxuICAgIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcCA9IHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcCB8fCB7fTtcblxuICAgIC8vIFJlc2V0IGFueSBmaXQgdHJhbnNmb3JtcyB0aGF0IHdlcmUgYXBwbGllZFxuICAgIFV0aWxzLnByZXBhcmVGb3JUcmFuc2Zvcm0oIHRoaXMuY2FudmFzICk7IC8vIEFwcGx5IENTUyBuZWVkZWQgZm9yIGZ1dHVyZSBDU1MgdHJhbnNmb3JtcyB0byB3b3JrIHByb3Blcmx5LlxuICAgIFV0aWxzLnVuc2V0VHJhbnNmb3JtKCB0aGlzLmNhbnZhcyApOyAvLyBjbGVhciBvdXQgYW55IHRyYW5zZm9ybXMgdGhhdCBjb3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBhcHBsaWVkXG5cbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn1cbiAgICB0aGlzLmNhbnZhc0RyYXdPZmZzZXQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuXG4gICAgLy8gQHByaXZhdGUge0RyYXdhYmxlfG51bGx9XG4gICAgdGhpcy5jdXJyZW50RHJhd2FibGUgPSBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBuZWVkIHRvIHJlLWFwcGx5IGNsaXBwaW5nIHRvIG91ciBjdXJyZW50IENhbnZhc1xuICAgIHRoaXMuY2xpcERpcnR5ID0gdHJ1ZTtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSG93IG1hbnkgY2xpcHMgc2hvdWxkIGJlIGFwcGxpZWQgKGdpdmVuIG91ciBjdXJyZW50IFwicG9zaXRpb25cIiBpbiB0aGUgd2FsayB1cC9kb3duKS5cbiAgICB0aGlzLmNsaXBDb3VudCA9IDA7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHN0b3JlIG91ciBiYWNraW5nIHNjYWxlIHNvIHdlIGRvbid0IGhhdmUgdG8gbG9vayBpdCB1cCB3aGlsZSBmaXR0aW5nXG4gICAgdGhpcy5iYWNraW5nU2NhbGUgPSAoIHJlbmRlcmVyICYgUmVuZGVyZXIuYml0bWFza0NhbnZhc0xvd1Jlc29sdXRpb24gKSA/IDEgOiBVdGlscy5iYWNraW5nU2NhbGUoIHRoaXMuY29udGV4dCApO1xuICAgIC8vIFRPRE86ID4gWW91IGNhbiB1c2Ugd2luZG93Lm1hdGNoTWVkaWEoKSB0byBjaGVjayBpZiB0aGUgdmFsdWUgb2YgZGV2aWNlUGl4ZWxSYXRpbyBjaGFuZ2VzICh3aGljaCBjYW4gaGFwcGVuLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIFRPRE86ID4gZm9yIGV4YW1wbGUsIGlmIHRoZSB1c2VyIGRyYWdzIHRoZSB3aW5kb3cgdG8gYSBkaXNwbGF5IHdpdGggYSBkaWZmZXJlbnQgcGl4ZWwgZGVuc2l0eSkuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgLy8gVE9ETzogT0ggTk8sIHdlIG1heSBuZWVkIHRvIGZpZ3VyZSBvdXQgd2F0Y2hpbmcgdGhpcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgIC8vIEBwcml2YXRlIHtmdW5jdGlvbn1cbiAgICB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyID0gdGhpcy5tYXJrRGlydHkuYmluZCggdGhpcyApO1xuICAgIHRoaXMub3BhY2l0eURpcnR5TGlzdGVuZXIgPSB0aGlzLm1hcmtEaXJ0eS5iaW5kKCB0aGlzICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYGluaXRpYWxpemVkICMke3RoaXMuaWR9YCApO1xuICAgIC8vIFRPRE86IGRpcnR5IGxpc3Qgb2Ygbm9kZXMgKGVhY2ggc2hvdWxkIGdvIGRpcnR5IG9ubHkgb25jZSwgZWFzaWVyIHRoYW4gc2Nhbm5pbmcgYWxsPykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgc2V0U2l6ZUZ1bGxEaXNwbGF5KCkge1xuICAgIGNvbnN0IHNpemUgPSB0aGlzLmRpc3BsYXkuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gc2l6ZS53aWR0aCAqIHRoaXMuYmFja2luZ1NjYWxlO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogdGhpcy5iYWNraW5nU2NhbGU7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBgJHtzaXplLndpZHRofXB4YDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtzaXplLmhlaWdodH1weGA7XG4gICAgdGhpcy53cmFwcGVyLnJlc2V0U3R5bGVzKCk7XG4gICAgdGhpcy5jYW52YXNEcmF3T2Zmc2V0LnNldFhZKCAwLCAwICk7XG4gICAgVXRpbHMudW5zZXRUcmFuc2Zvcm0oIHRoaXMuY2FudmFzICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICovXG4gIHNldFNpemVGaXRCb3VuZHMoKSB7XG4gICAgY29uc3QgeCA9IHRoaXMuZml0Qm91bmRzLm1pblg7XG4gICAgY29uc3QgeSA9IHRoaXMuZml0Qm91bmRzLm1pblk7XG4gICAgdGhpcy5jYW52YXNEcmF3T2Zmc2V0LnNldFhZKCAteCwgLXkgKTsgLy8gc3VidHJhY3Qgb2ZmIHNvIHdlIGhhdmUgYSB0aWdodCBmaXRcbiAgICAvL09IVFdPIFRPRE8gUEVSRk9STUFOQ0U6IHNlZSBpZiB3ZSBjYW4gZ2V0IGEgc3BlZWR1cCBieSBwdXR0aW5nIHRoZSBiYWNraW5nIHNjYWxlIGluIG91ciB0cmFuc2Zvcm0gaW5zdGVhZCBvZiB3aXRoIENTUz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBVdGlscy5zZXRUcmFuc2Zvcm0oIGBtYXRyaXgoMSwwLDAsMSwke3h9LCR7eX0pYCwgdGhpcy5jYW52YXMgKTsgLy8gcmVhcHBseSB0aGUgdHJhbnNsYXRpb24gYXMgYSBDU1MgdHJhbnNmb3JtXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmZpdEJvdW5kcy53aWR0aCAqIHRoaXMuYmFja2luZ1NjYWxlO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZml0Qm91bmRzLmhlaWdodCAqIHRoaXMuYmFja2luZ1NjYWxlO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gYCR7dGhpcy5maXRCb3VuZHMud2lkdGh9cHhgO1xuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke3RoaXMuZml0Qm91bmRzLmhlaWdodH1weGA7XG4gICAgdGhpcy53cmFwcGVyLnJlc2V0U3R5bGVzKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XG4gICAqICAgICAgICAgICAgICAgICAgICAgIGJlIGRvbmUpLlxuICAgKi9cbiAgdXBkYXRlKCkge1xuICAgIC8vIFNlZSBpZiB3ZSBuZWVkIHRvIGFjdHVhbGx5IHVwZGF0ZSB0aGluZ3MgKHdpbGwgYmFpbCBvdXQgaWYgd2UgYXJlIG5vdCBkaXJ0eSwgb3IgaWYgd2UndmUgYmVlbiBkaXNwb3NlZClcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB3aGlsZSAoIHRoaXMuZGlydHlEcmF3YWJsZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKS51cGRhdGUoKTtcbiAgICB9XG5cbiAgICAvLyB1ZHBhdGUgdGhlIGZpdCBCRUZPUkUgZHJhd2luZywgc2luY2UgaXQgbWF5IGNoYW5nZSBvdXIgb2Zmc2V0XG4gICAgdGhpcy51cGRhdGVGaXQoKTtcblxuICAgIC8vIGZvciBub3csIGNsZWFyIGV2ZXJ5dGhpbmchXG4gICAgdGhpcy5jb250ZXh0LnJlc3RvcmUoKTsgLy8ganVzdCBpbiBjYXNlIHdlIHdlcmUgY2xpcHBpbmcvZXRjLlxuICAgIHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTsgLy8gaWRlbnRpdHlcbiAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7IC8vIGNsZWFyIGV2ZXJ5dGhpbmdcbiAgICB0aGlzLmNvbnRleHQuc2F2ZSgpO1xuICAgIHRoaXMud3JhcHBlci5yZXNldFN0eWxlcygpO1xuXG4gICAgLy9PSFRXTyBUT0RPOiBQRVJGT1JNQU5DRTogY3JlYXRlIGFuIGFycmF5IGZvciBmYXN0ZXIgZHJhd2FibGUgaXRlcmF0aW9uICh0aGlzIGlzIHByb2JhYmx5IGEgaGVsbGlzaCBtZW1vcnkgYWNjZXNzIHBhdHRlcm4pIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgLy9PSFRXTyBUT0RPOiB3aHkgaXMgXCJkcmF3YWJsZSAhPT0gbnVsbFwiIGNoZWNrIG5lZWRlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuY3VycmVudERyYXdhYmxlID0gbnVsbDsgLy8gd2UgaGF2ZW4ndCByZW5kZXJlZCBhIGRyYXdhYmxlIHRoaXMgZnJhbWUgeWV0XG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gdGhpcy5maXJzdERyYXdhYmxlOyBkcmF3YWJsZSAhPT0gbnVsbDsgZHJhd2FibGUgPSBkcmF3YWJsZS5uZXh0RHJhd2FibGUgKSB7XG4gICAgICB0aGlzLnJlbmRlckRyYXdhYmxlKCBkcmF3YWJsZSApO1xuICAgICAgaWYgKCBkcmF3YWJsZSA9PT0gdGhpcy5sYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XG4gICAgfVxuICAgIGlmICggdGhpcy5jdXJyZW50RHJhd2FibGUgKSB7XG4gICAgICB0aGlzLndhbGtEb3duKCB0aGlzLmN1cnJlbnREcmF3YWJsZS5pbnN0YW5jZS50cmFpbCwgMCApO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2xpcENvdW50ID09PSAwLCAnY2xpcENvdW50IHNob3VsZCBiZSB6ZXJvIGFmdGVyIHdhbGtpbmcgYmFjayBkb3duJyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFwcGxpZXMgY2xpcHMgdG8gdGhlIGN1cnJlbnQgY29udGV4dC4gSXQncyBuZWNlc3NhcnkgdG8gZnVsbHkgYXBwbHkgZXZlcnkgY2xpcHBpbmcgYXJlYSBmb3IgZXZlcnkgYW5jZXN0b3IsXG4gICAqIGR1ZSB0byBob3cgQ2FudmFzIGlzIHNldCB1cC4gU2hvdWxkIGlkZWFsbHkgYmUgY2FsbGVkIHdoZW4gdGhlIGNsaXAgaXMgZGlydHkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFRoaXMgaXMgbmVjZXNzYXJ5IHNpbmNlIHlvdSBjYW4ndCBhcHBseSBcIm5lc3RlZFwiIGNsaXBwaW5nIGFyZWFzIG5haXZlbHkgaW4gQ2FudmFzLCBidXQgeW91IHNwZWNpZnkgb25lIGVudGlyZVxuICAgKiBjbGlwIGFyZWEuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzU2VsZkRyYXdhYmxlfSBEcmF3YWJsZVxuICAgKi9cbiAgYXBwbHlDbGlwKCBkcmF3YWJsZSApIHtcbiAgICB0aGlzLmNsaXBEaXJ0eSA9IGZhbHNlO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgQXBwbHkgY2xpcCAke2RyYXdhYmxlLmluc3RhbmNlLnRyYWlsLnRvRGVidWdTdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IHRoaXMud3JhcHBlclN0YWNrWyB0aGlzLndyYXBwZXJTdGFja0luZGV4IF07XG4gICAgY29uc3QgY29udGV4dCA9IHdyYXBwZXIuY29udGV4dDtcblxuICAgIC8vIFJlLXNldCAoZXZlbiBpZiBubyBjbGlwIGlzIG5lZWRlZCwgc28gd2UgZ2V0IHJpZCBvZiB0aGUgb2xkIGNsaXApXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgY29udGV4dC5zYXZlKCk7XG4gICAgd3JhcHBlci5yZXNldFN0eWxlcygpO1xuXG4gICAgLy8gSWYgMCwgbm8gY2xpcCBpcyBuZWVkZWRcbiAgICBpZiAoIHRoaXMuY2xpcENvdW50ICkge1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBkcmF3YWJsZS5pbnN0YW5jZTtcbiAgICAgIGNvbnN0IHRyYWlsID0gaW5zdGFuY2UudHJhaWw7XG5cbiAgICAgIC8vIEludmVyc2Ugb2Ygd2hhdCB3ZSdsbCBiZSBhcHBseWluZyB0byB0aGUgc2NlbmUsIHRvIGdldCBiYWNrIHRvIHRoZSByb290IGNvb3JkaW5hdGUgdHJhbnNmb3JtXG4gICAgICBzY3JhdGNoTWF0cml4LnJvd01ham9yKCB0aGlzLmJhY2tpbmdTY2FsZSwgMCwgdGhpcy5jYW52YXNEcmF3T2Zmc2V0LnggKiB0aGlzLmJhY2tpbmdTY2FsZSxcbiAgICAgICAgMCwgdGhpcy5iYWNraW5nU2NhbGUsIHRoaXMuY2FudmFzRHJhd09mZnNldC55ICogdGhpcy5iYWNraW5nU2NhbGUsXG4gICAgICAgIDAsIDAsIDEgKTtcbiAgICAgIHNjcmF0Y2hNYXRyaXgyLnNldCggdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UudHJhaWwuZ2V0TWF0cml4KCkgKS5pbnZlcnQoKTtcbiAgICAgIHNjcmF0Y2hNYXRyaXgyLm11bHRpcGx5TWF0cml4KCBzY3JhdGNoTWF0cml4ICkuY2FudmFzU2V0VHJhbnNmb3JtKCBjb250ZXh0ICk7XG5cbiAgICAgIC8vIFJlY3Vyc2l2ZWx5IGFwcGx5IGNsaXBzIGFuZCB0cmFuc2Zvcm1zXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLm5vZGVzWyBpIF07XG4gICAgICAgIG5vZGUuZ2V0TWF0cml4KCkuY2FudmFzQXBwZW5kVHJhbnNmb3JtKCBjb250ZXh0ICk7XG4gICAgICAgIGlmICggbm9kZS5oYXNDbGlwQXJlYSgpICkge1xuICAgICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgbm9kZS5jbGlwQXJlYS53cml0ZVRvQ29udGV4dCggY29udGV4dCApO1xuICAgICAgICAgIC8vIFRPRE86IGFkZCB0aGUgYWJpbGl0eSB0byBzaG93IGNsaXBwaW5nIGhpZ2hsaWdodHMgaW5saW5lPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICAgIC8vIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgIC8vIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAncmVkJztcbiAgICAgICAgICAvLyBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgICAgLy8gY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgICAvLyBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgICBjb250ZXh0LmNsaXAoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBhIHdyYXBwZXIgb250byBvdXIgc3RhY2sgKGNyZWF0aW5nIGlmIG5lY2Vzc2FyeSksIGFuZCBpbml0aWFsaXplcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHB1c2hXcmFwcGVyKCkge1xuICAgIHRoaXMud3JhcHBlclN0YWNrSW5kZXgrKztcbiAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XG5cbiAgICAvLyBJZiB3ZSBuZWVkIHRvIHB1c2ggYW4gZW50aXJlbHkgbmV3IENhbnZhcyB0byB0aGUgc3RhY2tcbiAgICBpZiAoIHRoaXMud3JhcHBlclN0YWNrSW5kZXggPT09IHRoaXMud3JhcHBlclN0YWNrLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IG5ld0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgICBjb25zdCBuZXdDb250ZXh0ID0gbmV3Q2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbiAgICAgIG5ld0NvbnRleHQuc2F2ZSgpO1xuICAgICAgdGhpcy53cmFwcGVyU3RhY2sucHVzaCggbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBuZXdDYW52YXMsIG5ld0NvbnRleHQgKSApO1xuICAgIH1cbiAgICBjb25zdCB3cmFwcGVyID0gdGhpcy53cmFwcGVyU3RhY2tbIHRoaXMud3JhcHBlclN0YWNrSW5kZXggXTtcbiAgICBjb25zdCBjb250ZXh0ID0gd3JhcHBlci5jb250ZXh0O1xuXG4gICAgLy8gU2l6ZSBhbmQgY2xlYXIgb3VyIGNvbnRleHRcbiAgICB3cmFwcGVyLnNldERpbWVuc2lvbnMoIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQgKTtcbiAgICBjb250ZXh0LnNldFRyYW5zZm9ybSggMSwgMCwgMCwgMSwgMCwgMCApOyAvLyBpZGVudGl0eVxuICAgIGNvbnRleHQuY2xlYXJSZWN0KCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0ICk7IC8vIGNsZWFyIGV2ZXJ5dGhpbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3BzIGEgd3JhcHBlciBvZmYgb2Ygb3VyIHN0YWNrLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcG9wV3JhcHBlcigpIHtcbiAgICB0aGlzLndyYXBwZXJTdGFja0luZGV4LS07XG4gICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgZG93biB0b3dhcmRzIHRoZSByb290LCBwb3BwaW5nIGFueSBjbGlwL29wYWNpdHkgZWZmZWN0cyB0aGF0IHdlcmUgbmVlZGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1RyYWlsfSB0cmFpbFxuICAgKiBAcGFyYW0ge251bWJlcn0gYnJhbmNoSW5kZXggLSBUaGUgZmlyc3QgaW5kZXggd2hlcmUgb3VyIGJlZm9yZSBhbmQgYWZ0ZXIgdHJhaWxzIGhhdmUgZGl2ZXJnZWQuXG4gICAqL1xuICB3YWxrRG93biggdHJhaWwsIGJyYW5jaEluZGV4ICkge1xuICAgIGNvbnN0IGZpbHRlclJvb3RJbmRleCA9IHRoaXMuZmlsdGVyUm9vdEluc3RhbmNlLnRyYWlsLmxlbmd0aCAtIDE7XG5cbiAgICBmb3IgKCBsZXQgaSA9IHRyYWlsLmxlbmd0aCAtIDE7IGkgPj0gYnJhbmNoSW5kZXg7IGktLSApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5ub2Rlc1sgaSBdO1xuXG4gICAgICBpZiAoIG5vZGUuaGFzQ2xpcEFyZWEoKSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGBQb3AgY2xpcCAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xuICAgICAgICAvLyBQb3AgY2xpcFxuICAgICAgICB0aGlzLmNsaXBDb3VudC0tO1xuICAgICAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlIHNob3VsZCBub3QgYXBwbHkgb3BhY2l0eSBvciBvdGhlciBmaWx0ZXJzIGF0IG9yIGJlbG93IHRoZSBmaWx0ZXIgcm9vdFxuICAgICAgaWYgKCBpID4gZmlsdGVyUm9vdEluZGV4ICkge1xuICAgICAgICBpZiAoIG5vZGUuX2ZpbHRlcnMubGVuZ3RoICkge1xuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUG9wIGZpbHRlcnMgJHt0cmFpbC5zdWJ0cmFpbFRvKCBub2RlICkudG9EZWJ1Z1N0cmluZygpfWAgKTtcblxuICAgICAgICAgIGNvbnN0IHRvcFdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCBdO1xuICAgICAgICAgIGNvbnN0IGJvdHRvbVdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCAtIDEgXTtcbiAgICAgICAgICB0aGlzLnBvcFdyYXBwZXIoKTtcblxuICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5zZXRUcmFuc2Zvcm0oIDEsIDAsIDAsIDEsIDAsIDAgKTtcblxuICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBub2RlLl9maWx0ZXJzO1xuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZmFsbCBiYWNrIHRvIGEgZGlmZmVyZW50IGZpbHRlciBiZWhhdmlvciB3aXRoIENocm9tZSwgc2luY2UgaXQgb3Zlci1kYXJrZW5zIG90aGVyd2lzZSB3aXRoIHRoZVxuICAgICAgICAgIC8vIGJ1aWx0LWluIGZlYXR1cmUuXG4gICAgICAgICAgLy8gTk9URTogTm90IGJsb2NraW5nIGNocm9taXVtIGFueW1vcmUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTEzOVxuICAgICAgICAgIC8vIFdlJ2xsIGdvIGZvciB0aGUgaGlnaGVyLXBlcmZvcm1hbmNlIGJ1dCBwb3RlbnRpYWxseS12aXN1YWxseS1kaWZmZXJlbnQgb3B0aW9uLlxuICAgICAgICAgIGxldCBjYW5Vc2VJbnRlcm5hbEZpbHRlciA9IEZlYXR1cmVzLmNhbnZhc0ZpbHRlcjtcbiAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBmaWx0ZXJzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgICAgLy8gSWYgd2UgdXNlIGNvbnRleHQuZmlsdGVyLCBpdCdzIGVxdWl2YWxlbnQgdG8gY2hlY2tpbmcgRE9NIGNvbXBhdGliaWxpdHkgb24gYWxsIG9mIHRoZW0uXG4gICAgICAgICAgICBjYW5Vc2VJbnRlcm5hbEZpbHRlciA9IGNhblVzZUludGVybmFsRmlsdGVyICYmIGZpbHRlcnNbIGogXS5pc0RPTUNvbXBhdGlibGUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGNhblVzZUludGVybmFsRmlsdGVyICkge1xuICAgICAgICAgICAgLy8gRHJhdyB1c2luZyB0aGUgY29udGV4dC5maWx0ZXIgb3BlcmF0aW9uXG4gICAgICAgICAgICBsZXQgZmlsdGVyU3RyaW5nID0gJyc7XG4gICAgICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBmaWx0ZXJzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgICAgICBmaWx0ZXJTdHJpbmcgKz0gYCR7ZmlsdGVyU3RyaW5nID8gJyAnIDogJyd9JHtmaWx0ZXJzWyBqIF0uZ2V0Q1NTRmlsdGVyU3RyaW5nKCl9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdHRvbVdyYXBwZXIuY29udGV4dC5maWx0ZXIgPSBmaWx0ZXJTdHJpbmc7XG4gICAgICAgICAgICBib3R0b21XcmFwcGVyLmNvbnRleHQuZHJhd0ltYWdlKCB0b3BXcmFwcGVyLmNhbnZhcywgMCwgMCApO1xuICAgICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmZpbHRlciA9ICdub25lJztcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBEcmF3IGJ5IG1hbnVhbGx5IG1hbmlwdWxhdGluZyB0aGUgSW1hZ2VEYXRhIHBpeGVscyBvZiB0aGUgdG9wIENhbnZhcywgdGhlbiBkcmF3IGl0IGluLlxuICAgICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZmlsdGVycy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICAgICAgZmlsdGVyc1sgaiBdLmFwcGx5Q2FudmFzRmlsdGVyKCB0b3BXcmFwcGVyICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3R0b21XcmFwcGVyLmNvbnRleHQuZHJhd0ltYWdlKCB0b3BXcmFwcGVyLmNhbnZhcywgMCwgMCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggbm9kZS5nZXRFZmZlY3RpdmVPcGFjaXR5KCkgIT09IDEgKSB7XG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGBQb3Agb3BhY2l0eSAke3RyYWlsLnN1YnRyYWlsVG8oIG5vZGUgKS50b0RlYnVnU3RyaW5nKCl9YCApO1xuICAgICAgICAgIC8vIFBvcCBvcGFjaXR5XG4gICAgICAgICAgY29uc3QgdG9wV3JhcHBlciA9IHRoaXMud3JhcHBlclN0YWNrWyB0aGlzLndyYXBwZXJTdGFja0luZGV4IF07XG4gICAgICAgICAgY29uc3QgYm90dG9tV3JhcHBlciA9IHRoaXMud3JhcHBlclN0YWNrWyB0aGlzLndyYXBwZXJTdGFja0luZGV4IC0gMSBdO1xuICAgICAgICAgIHRoaXMucG9wV3JhcHBlcigpO1xuXG4gICAgICAgICAgLy8gRHJhdyB0aGUgdHJhbnNwYXJlbnQgY29udGVudCBpbnRvIHRoZSBuZXh0LWxldmVsIENhbnZhcy5cbiAgICAgICAgICBib3R0b21XcmFwcGVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKCAxLCAwLCAwLCAxLCAwLCAwICk7XG4gICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0Lmdsb2JhbEFscGhhID0gbm9kZS5nZXRFZmZlY3RpdmVPcGFjaXR5KCk7XG4gICAgICAgICAgYm90dG9tV3JhcHBlci5jb250ZXh0LmRyYXdJbWFnZSggdG9wV3JhcHBlci5jYW52YXMsIDAsIDAgKTtcbiAgICAgICAgICBib3R0b21XcmFwcGVyLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgdXAgdG93YXJkcyB0aGUgbmV4dCBsZWFmLCBwdXNoaW5nIGFueSBjbGlwL29wYWNpdHkgZWZmZWN0cyB0aGF0IGFyZSBuZWVkZWQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7VHJhaWx9IHRyYWlsXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBicmFuY2hJbmRleCAtIFRoZSBmaXJzdCBpbmRleCB3aGVyZSBvdXIgYmVmb3JlIGFuZCBhZnRlciB0cmFpbHMgaGF2ZSBkaXZlcmdlZC5cbiAgICovXG4gIHdhbGtVcCggdHJhaWwsIGJyYW5jaEluZGV4ICkge1xuICAgIGNvbnN0IGZpbHRlclJvb3RJbmRleCA9IHRoaXMuZmlsdGVyUm9vdEluc3RhbmNlLnRyYWlsLmxlbmd0aCAtIDE7XG5cbiAgICBmb3IgKCBsZXQgaSA9IGJyYW5jaEluZGV4OyBpIDwgdHJhaWwubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBub2RlID0gdHJhaWwubm9kZXNbIGkgXTtcblxuICAgICAgLy8gV2Ugc2hvdWxkIG5vdCBhcHBseSBvcGFjaXR5IGF0IG9yIGJlbG93IHRoZSBmaWx0ZXIgcm9vdFxuICAgICAgaWYgKCBpID4gZmlsdGVyUm9vdEluZGV4ICkge1xuICAgICAgICBpZiAoIG5vZGUuZ2V0RWZmZWN0aXZlT3BhY2l0eSgpICE9PSAxICkge1xuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUHVzaCBvcGFjaXR5ICR7dHJhaWwuc3VidHJhaWxUbyggbm9kZSApLnRvRGVidWdTdHJpbmcoKX1gICk7XG5cbiAgICAgICAgICAvLyBQdXNoIG9wYWNpdHlcbiAgICAgICAgICB0aGlzLnB1c2hXcmFwcGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIG5vZGUuX2ZpbHRlcnMubGVuZ3RoICkge1xuICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUHVzaCBmaWx0ZXJzICR7dHJhaWwuc3VidHJhaWxUbyggbm9kZSApLnRvRGVidWdTdHJpbmcoKX1gICk7XG5cbiAgICAgICAgICAvLyBQdXNoIGZpbHRlcnNcbiAgICAgICAgICB0aGlzLnB1c2hXcmFwcGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCBub2RlLmhhc0NsaXBBcmVhKCkgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgUHVzaCBjbGlwICR7dHJhaWwuc3VidHJhaWxUbyggbm9kZSApLnRvRGVidWdTdHJpbmcoKX1gICk7XG4gICAgICAgIC8vIFB1c2ggY2xpcFxuICAgICAgICB0aGlzLmNsaXBDb3VudCsrO1xuICAgICAgICB0aGlzLmNsaXBEaXJ0eSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIHRoZSBkcmF3YWJsZSBpbnRvIG91ciBtYWluIENhbnZhcy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogRm9yIHRoaW5ncyBsaWtlIG9wYWNpdHkvY2xpcHBpbmcsIGFzIHBhcnQgb2YgdGhpcyB3ZSB3YWxrIHVwL2Rvd24gcGFydCBvZiB0aGUgaW5zdGFuY2UgdHJlZSBmb3IgcmVuZGVyaW5nIGVhY2hcbiAgICogZHJhd2FibGUuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzU2VsZkRyYXdhYmxlfSAtIFRPRE86IEluIHRoZSBmdXR1cmUsIHdlJ2xsIG5lZWQgdG8gc3VwcG9ydCBDYW52YXMgY2FjaGVzICh0aGlzIHNob3VsZCBiZSB1cGRhdGVkIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYSBwcm9wZXIgZ2VuZXJhbGl6ZWQgdHlwZSlcbiAgICovXG4gIHJlbmRlckRyYXdhYmxlKCBkcmF3YWJsZSApIHtcblxuICAgIC8vIGRvIG5vdCBwYWludCBpbnZpc2libGUgZHJhd2FibGVzLCBvciBkcmF3YWJsZXMgdGhhdCBhcmUgb3V0IG9mIHZpZXdcbiAgICBpZiAoICFkcmF3YWJsZS52aXNpYmxlIHx8IHRoaXMuY2FudmFzLndpZHRoID09PSAwIHx8IHRoaXMuY2FudmFzLmhlaWdodCA9PT0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYHJlbmRlckRyYXdhYmxlICMke2RyYXdhYmxlLmlkfSAke2RyYXdhYmxlLmluc3RhbmNlLnRyYWlsLnRvRGVidWdTdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gRm9yIG9wYWNpdHkvY2xpcCwgd2FsayB1cC9kb3duIGFzIG5lY2Vzc2FyeSAoQ2FuIG9ubHkgd2FsayBkb3duIGlmIHdlIGFyZSBub3QgdGhlIGZpcnN0IGRyYXdhYmxlKVxuICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gdGhpcy5jdXJyZW50RHJhd2FibGUgPyBkcmF3YWJsZS5pbnN0YW5jZS5nZXRCcmFuY2hJbmRleFRvKCB0aGlzLmN1cnJlbnREcmF3YWJsZS5pbnN0YW5jZSApIDogMDtcbiAgICBpZiAoIHRoaXMuY3VycmVudERyYXdhYmxlICkge1xuICAgICAgdGhpcy53YWxrRG93biggdGhpcy5jdXJyZW50RHJhd2FibGUuaW5zdGFuY2UudHJhaWwsIGJyYW5jaEluZGV4ICk7XG4gICAgfVxuICAgIHRoaXMud2Fsa1VwKCBkcmF3YWJsZS5pbnN0YW5jZS50cmFpbCwgYnJhbmNoSW5kZXggKTtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSB0aGlzLndyYXBwZXJTdGFja1sgdGhpcy53cmFwcGVyU3RhY2tJbmRleCBdO1xuICAgIGNvbnN0IGNvbnRleHQgPSB3cmFwcGVyLmNvbnRleHQ7XG5cbiAgICAvLyBSZS1hcHBseSB0aGUgY2xpcCBpZiBuZWNlc3NhcnkuIFRoZSB3YWxrIGRvd24vdXAgbWF5IGhhdmUgZmxhZ2dlZCBhIHBvdGVudGlhbCBjbGlwIGNoYW5nZSAoaWYgd2Ugd2Fsa2VkIGFjcm9zc1xuICAgIC8vIHNvbWV0aGluZyB3aXRoIGEgY2xpcCBhcmVhKS5cbiAgICBpZiAoIHRoaXMuY2xpcERpcnR5ICkge1xuICAgICAgdGhpcy5hcHBseUNsaXAoIGRyYXdhYmxlICk7XG4gICAgfVxuXG4gICAgLy8gd2UncmUgZGlyZWN0bHkgYWNjZXNzaW5nIHRoZSByZWxhdGl2ZSB0cmFuc2Zvcm0gYmVsb3csIHNvIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgaXQgaXMgdXAtdG8tZGF0ZVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYXdhYmxlLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLmlzVmFsaWRhdGlvbk5vdE5lZWRlZCgpICk7XG5cbiAgICBjb25zdCBtYXRyaXggPSBkcmF3YWJsZS5pbnN0YW5jZS5yZWxhdGl2ZVRyYW5zZm9ybS5tYXRyaXg7XG5cbiAgICAvLyBzZXQgdGhlIGNvcnJlY3QgKHJlbGF0aXZlIHRvIHRoZSB0cmFuc2Zvcm0gcm9vdCkgdHJhbnNmb3JtIHVwLCBpbnN0ZWFkIG9mIHdhbGtpbmcgdGhlIGhpZXJhcmNoeSAoZm9yIG5vdylcbiAgICAvL09IVFdPIFRPRE86IHNob3VsZCB3ZSBzdGFydCBwcmVtdWx0aXBseWluZyB0aGVzZSBtYXRyaWNlcyB0byByZW1vdmUgdGhpcyBib3R0bGVuZWNrPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKFxuICAgICAgdGhpcy5iYWNraW5nU2NhbGUsXG4gICAgICAwLFxuICAgICAgMCxcbiAgICAgIHRoaXMuYmFja2luZ1NjYWxlLFxuICAgICAgdGhpcy5jYW52YXNEcmF3T2Zmc2V0LnggKiB0aGlzLmJhY2tpbmdTY2FsZSxcbiAgICAgIHRoaXMuY2FudmFzRHJhd09mZnNldC55ICogdGhpcy5iYWNraW5nU2NhbGVcbiAgICApO1xuXG4gICAgaWYgKCBkcmF3YWJsZS5pbnN0YW5jZSAhPT0gdGhpcy50cmFuc2Zvcm1Sb290SW5zdGFuY2UgKSB7XG4gICAgICBtYXRyaXguY2FudmFzQXBwZW5kVHJhbnNmb3JtKCBjb250ZXh0ICk7XG4gICAgfVxuXG4gICAgLy8gcGFpbnQgdXNpbmcgaXRzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICBkcmF3YWJsZS5wYWludENhbnZhcyggd3JhcHBlciwgZHJhd2FibGUuaW5zdGFuY2Uubm9kZSwgZHJhd2FibGUuaW5zdGFuY2UucmVsYXRpdmVUcmFuc2Zvcm0ubWF0cml4ICk7XG5cbiAgICB0aGlzLmN1cnJlbnREcmF3YWJsZSA9IGRyYXdhYmxlO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrKCBgZGlzcG9zZSAjJHt0aGlzLmlkfWAgKTtcblxuICAgIC8vIGNsZWFyIHJlZmVyZW5jZXNcbiAgICB0aGlzLnRyYW5zZm9ybVJvb3RJbnN0YW5jZSA9IG51bGw7XG4gICAgY2xlYW5BcnJheSggdGhpcy5kaXJ0eURyYXdhYmxlcyApO1xuXG4gICAgLy8gbWluaW1pemUgbWVtb3J5IGV4cG9zdXJlIG9mIHRoZSBiYWNraW5nIHJhc3RlclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gMDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSAwO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIG1hcmtEaXJ0eURyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuZGlydHkgJiYgc2NlbmVyeUxvZy5kaXJ0eSggYG1hcmtEaXJ0eURyYXdhYmxlIG9uIENhbnZhc0Jsb2NrIyR7dGhpcy5pZH0gd2l0aCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUgKTtcblxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgLy8gQ2F0Y2ggaW5maW5pdGUgbG9vcHNcbiAgICAgIHRoaXMuZGlzcGxheS5lbnN1cmVOb3RQYWludGluZygpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGluc3RhbmNlIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIGNhbnZhcyBjYWNoZSAodXN1YWxseSB3ZSBkb24ndCBuZWVkIHRvIGNhbGwgdXBkYXRlIG9uIG91ciBkcmF3YWJsZXMpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wdXNoKCBkcmF3YWJsZSApO1xuICAgIHRoaXMubWFya0RpcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAb3ZlcnJpZGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIGFkZERyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYCMke3RoaXMuaWR9LmFkZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICBzdXBlci5hZGREcmF3YWJsZSggZHJhd2FibGUgKTtcblxuICAgIC8vIEFkZCBvcGFjaXR5IGxpc3RlbmVycyAoZnJvbSB0aGlzIG5vZGUgdXAgdG8gdGhlIGZpbHRlciByb290KVxuICAgIGZvciAoIGxldCBpbnN0YW5jZSA9IGRyYXdhYmxlLmluc3RhbmNlOyBpbnN0YW5jZSAmJiBpbnN0YW5jZSAhPT0gdGhpcy5maWx0ZXJSb290SW5zdGFuY2U7IGluc3RhbmNlID0gaW5zdGFuY2UucGFyZW50ICkge1xuICAgICAgY29uc3Qgbm9kZSA9IGluc3RhbmNlLm5vZGU7XG5cbiAgICAgIC8vIE9ubHkgYWRkIHRoZSBsaXN0ZW5lciBpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgb25lXG4gICAgICBpZiAoIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcFsgbm9kZS5pZCBdICkge1xuICAgICAgICB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXSsrO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcFsgbm9kZS5pZCBdID0gMTtcblxuICAgICAgICBub2RlLmZpbHRlckNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMub3BhY2l0eURpcnR5TGlzdGVuZXIgKTtcbiAgICAgICAgbm9kZS5jbGlwQXJlYVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqL1xuICByZW1vdmVEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGAjJHt0aGlzLmlkfS5yZW1vdmVEcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gUmVtb3ZlIG9wYWNpdHkgbGlzdGVuZXJzIChmcm9tIHRoaXMgbm9kZSB1cCB0byB0aGUgZmlsdGVyIHJvb3QpXG4gICAgZm9yICggbGV0IGluc3RhbmNlID0gZHJhd2FibGUuaW5zdGFuY2U7IGluc3RhbmNlICYmIGluc3RhbmNlICE9PSB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZTsgaW5zdGFuY2UgPSBpbnN0YW5jZS5wYXJlbnQgKSB7XG4gICAgICBjb25zdCBub2RlID0gaW5zdGFuY2Uubm9kZTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZmlsdGVyTGlzdGVuZXJDb3VudE1hcFsgbm9kZS5pZCBdID4gMCApO1xuICAgICAgdGhpcy5maWx0ZXJMaXN0ZW5lckNvdW50TWFwWyBub2RlLmlkIF0tLTtcbiAgICAgIGlmICggdGhpcy5maWx0ZXJMaXN0ZW5lckNvdW50TWFwWyBub2RlLmlkIF0gPT09IDAgKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmZpbHRlckxpc3RlbmVyQ291bnRNYXBbIG5vZGUuaWQgXTtcblxuICAgICAgICBub2RlLmNsaXBBcmVhUHJvcGVydHkudW5saW5rKCB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyICk7XG4gICAgICAgIG5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5vcGFjaXR5RGlydHlMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlXG4gICAqL1xuICBvbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2soIGAjJHt0aGlzLmlkfS5vbkludGVydmFsQ2hhbmdlICR7Zmlyc3REcmF3YWJsZS50b1N0cmluZygpfSB0byAke2xhc3REcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgIHN1cGVyLm9uSW50ZXJ2YWxDaGFuZ2UoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApO1xuXG4gICAgLy8gSWYgd2UgaGF2ZSBhbiBpbnRlcnZhbCBjaGFuZ2UsIHdlJ2xsIG5lZWQgdG8gZW5zdXJlIHdlIHJlcGFpbnQgKGV2ZW4gaWYgd2UncmUgZnVsbC1kaXNwbGF5KS4gVGhpcyB3YXMgYSBtaXNzZWRcbiAgICAvLyBjYXNlIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTEyLCB3aGVyZSBpdCB3b3VsZCBvbmx5IGNsZWFyIGlmIGl0IHdhcyBhIGNvbW1vbi1hbmNlc3RvclxuICAgIC8vIGZpdHRlZCBibG9jay5cbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIG9uUG90ZW50aWFsbHlNb3ZlZERyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2FudmFzQmxvY2sgJiYgc2NlbmVyeUxvZy5DYW52YXNCbG9jayggYCMke3RoaXMuaWR9Lm9uUG90ZW50aWFsbHlNb3ZlZERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKTtcblxuICAgIC8vIEZvciBub3csIG1hcmsgaXQgYXMgZGlydHkgc28gdGhhdCB3ZSByZWRyYXcgYW55dGhpbmcgY29udGFpbmluZyBpdC4gSW4gdGhlIGZ1dHVyZSwgd2UgY291bGQgaGF2ZSBtb3JlIGFkdmFuY2VkXG4gICAgLy8gYmVoYXZpb3IgdGhhdCBmaWd1cmVzIG91dCB0aGUgaW50ZXJzZWN0aW9uLXJlZ2lvbiBmb3Igd2hhdCB3YXMgbW92ZWQgYW5kIHdoYXQgaXQgd2FzIG1vdmVkIHBhc3QsIGJ1dCB0aGF0J3NcbiAgICAvLyBhIGhhcmRlciBwcm9ibGVtLlxuICAgIGRyYXdhYmxlLm1hcmtEaXJ0eSgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNhbnZhc0Jsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyBmb3JtIG9mIHRoaXMgb2JqZWN0XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgQ2FudmFzQmxvY2sjJHt0aGlzLmlkfS0ke0ZpdHRlZEJsb2NrLmZpdFN0cmluZ1sgdGhpcy5maXQgXX1gO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDYW52YXNCbG9jaycsIENhbnZhc0Jsb2NrICk7XG5cblBvb2xhYmxlLm1peEludG8oIENhbnZhc0Jsb2NrICk7XG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhc0Jsb2NrOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsImNsZWFuQXJyYXkiLCJQb29sYWJsZSIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwiRmVhdHVyZXMiLCJGaXR0ZWRCbG9jayIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlV0aWxzIiwic2NyYXRjaE1hdHJpeCIsInNjcmF0Y2hNYXRyaXgyIiwiQ2FudmFzQmxvY2siLCJpbml0aWFsaXplIiwiZGlzcGxheSIsInJlbmRlcmVyIiwidHJhbnNmb3JtUm9vdEluc3RhbmNlIiwiZmlsdGVyUm9vdEluc3RhbmNlIiwiQ09NTU9OX0FOQ0VTVE9SIiwiZGlydHlEcmF3YWJsZXMiLCJkb21FbGVtZW50IiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJwb2ludGVyRXZlbnRzIiwiY2FudmFzSWQiLCJpZCIsImNvbnRleHQiLCJnZXRDb250ZXh0Iiwic2F2ZSIsIm1pdGVyTGltaXQiLCJ3cmFwcGVyIiwid3JhcHBlclN0YWNrIiwid3JhcHBlclN0YWNrSW5kZXgiLCJmaWx0ZXJMaXN0ZW5lckNvdW50TWFwIiwicHJlcGFyZUZvclRyYW5zZm9ybSIsInVuc2V0VHJhbnNmb3JtIiwiY2FudmFzRHJhd09mZnNldCIsImN1cnJlbnREcmF3YWJsZSIsImNsaXBEaXJ0eSIsImNsaXBDb3VudCIsImJhY2tpbmdTY2FsZSIsImJpdG1hc2tDYW52YXNMb3dSZXNvbHV0aW9uIiwiY2xpcERpcnR5TGlzdGVuZXIiLCJtYXJrRGlydHkiLCJiaW5kIiwib3BhY2l0eURpcnR5TGlzdGVuZXIiLCJzY2VuZXJ5TG9nIiwic2V0U2l6ZUZ1bGxEaXNwbGF5Iiwic2l6ZSIsImdldFNpemUiLCJ3aWR0aCIsImhlaWdodCIsInJlc2V0U3R5bGVzIiwic2V0WFkiLCJzZXRTaXplRml0Qm91bmRzIiwieCIsImZpdEJvdW5kcyIsIm1pblgiLCJ5IiwibWluWSIsInNldFRyYW5zZm9ybSIsInVwZGF0ZSIsInB1c2giLCJsZW5ndGgiLCJwb3AiLCJ1cGRhdGVGaXQiLCJyZXN0b3JlIiwiY2xlYXJSZWN0IiwiZHJhd2FibGUiLCJmaXJzdERyYXdhYmxlIiwibmV4dERyYXdhYmxlIiwicmVuZGVyRHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJ3YWxrRG93biIsImluc3RhbmNlIiwidHJhaWwiLCJhc3NlcnQiLCJhcHBseUNsaXAiLCJ0b0RlYnVnU3RyaW5nIiwicm93TWFqb3IiLCJzZXQiLCJnZXRNYXRyaXgiLCJpbnZlcnQiLCJtdWx0aXBseU1hdHJpeCIsImNhbnZhc1NldFRyYW5zZm9ybSIsImkiLCJub2RlIiwibm9kZXMiLCJjYW52YXNBcHBlbmRUcmFuc2Zvcm0iLCJoYXNDbGlwQXJlYSIsImJlZ2luUGF0aCIsImNsaXBBcmVhIiwid3JpdGVUb0NvbnRleHQiLCJjbGlwIiwicHVzaFdyYXBwZXIiLCJuZXdDYW52YXMiLCJuZXdDb250ZXh0Iiwic2V0RGltZW5zaW9ucyIsInBvcFdyYXBwZXIiLCJicmFuY2hJbmRleCIsImZpbHRlclJvb3RJbmRleCIsInN1YnRyYWlsVG8iLCJfZmlsdGVycyIsInRvcFdyYXBwZXIiLCJib3R0b21XcmFwcGVyIiwiZmlsdGVycyIsImNhblVzZUludGVybmFsRmlsdGVyIiwiY2FudmFzRmlsdGVyIiwiaiIsImlzRE9NQ29tcGF0aWJsZSIsImZpbHRlclN0cmluZyIsImdldENTU0ZpbHRlclN0cmluZyIsImZpbHRlciIsImRyYXdJbWFnZSIsImFwcGx5Q2FudmFzRmlsdGVyIiwiZ2V0RWZmZWN0aXZlT3BhY2l0eSIsImdsb2JhbEFscGhhIiwid2Fsa1VwIiwidmlzaWJsZSIsImdldEJyYW5jaEluZGV4VG8iLCJyZWxhdGl2ZVRyYW5zZm9ybSIsImlzVmFsaWRhdGlvbk5vdE5lZWRlZCIsIm1hdHJpeCIsInBhaW50Q2FudmFzIiwiZGlzcG9zZSIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZGlydHkiLCJ0b1N0cmluZyIsImVuc3VyZU5vdFBhaW50aW5nIiwiYWRkRHJhd2FibGUiLCJwYXJlbnQiLCJmaWx0ZXJDaGFuZ2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjbGlwQXJlYVByb3BlcnR5IiwibGF6eUxpbmsiLCJyZW1vdmVEcmF3YWJsZSIsInVubGluayIsInJlbW92ZUxpc3RlbmVyIiwib25JbnRlcnZhbENoYW5nZSIsIm9uUG90ZW50aWFsbHlNb3ZlZERyYXdhYmxlIiwicGFyZW50RHJhd2FibGUiLCJmaXRTdHJpbmciLCJmaXQiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBQzdELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLG9CQUFvQixFQUFFQyxRQUFRLEVBQUVDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLEtBQUssUUFBUSxnQkFBZ0I7QUFFdEcsTUFBTUMsZ0JBQWdCLElBQUlWO0FBQzFCLE1BQU1XLGlCQUFpQixJQUFJWDtBQUUzQixJQUFBLEFBQU1ZLGNBQU4sTUFBTUEsb0JBQW9CTjtJQW1CeEI7Ozs7Ozs7Ozs7O0dBV0MsR0FDRE8sV0FBWUMsT0FBTyxFQUFFQyxRQUFRLEVBQUVDLHFCQUFxQixFQUFFQyxrQkFBa0IsRUFBRztRQUN6RSxLQUFLLENBQUNKLFdBQVlDLFNBQVNDLFVBQVVDLHVCQUF1QlYsWUFBWVksZUFBZTtRQUV2RixzQkFBc0I7UUFDdEIsSUFBSSxDQUFDRCxrQkFBa0IsR0FBR0E7UUFFMUIsOEJBQThCO1FBQzlCLElBQUksQ0FBQ0UsY0FBYyxHQUFHakIsV0FBWSxJQUFJLENBQUNpQixjQUFjO1FBRXJELElBQUssQ0FBQyxJQUFJLENBQUNDLFVBQVUsRUFBRztZQUN0QiwySUFBMkk7WUFDM0ksOEJBQThCO1lBQzlCLElBQUksQ0FBQ0MsTUFBTSxHQUFHQyxTQUFTQyxhQUFhLENBQUU7WUFDdEMsSUFBSSxDQUFDRixNQUFNLENBQUNHLEtBQUssQ0FBQ0MsUUFBUSxHQUFHO1lBQzdCLElBQUksQ0FBQ0osTUFBTSxDQUFDRyxLQUFLLENBQUNFLElBQUksR0FBRztZQUN6QixJQUFJLENBQUNMLE1BQU0sQ0FBQ0csS0FBSyxDQUFDRyxHQUFHLEdBQUc7WUFDeEIsSUFBSSxDQUFDTixNQUFNLENBQUNHLEtBQUssQ0FBQ0ksYUFBYSxHQUFHO1lBRWxDLDZHQUE2RztZQUM3RyxJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJLENBQUNSLE1BQU0sQ0FBQ1MsRUFBRSxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQ0EsRUFBRSxFQUFFO1lBRTNELHNDQUFzQztZQUN0QyxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJLENBQUNWLE1BQU0sQ0FBQ1csVUFBVSxDQUFFO1lBQ3ZDLElBQUksQ0FBQ0QsT0FBTyxDQUFDRSxJQUFJLElBQUksOEVBQThFO1lBRW5HLGdHQUFnRztZQUNoRyxJQUFJLENBQUNGLE9BQU8sQ0FBQ0csVUFBVSxHQUFHO1lBQzFCLElBQUksQ0FBQ0gsT0FBTyxDQUFDRyxVQUFVLEdBQUc7WUFFMUIsdUdBQXVHO1lBQ3ZHLCtCQUErQjtZQUMvQixJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJL0IscUJBQXNCLElBQUksQ0FBQ2lCLE1BQU0sRUFBRSxJQUFJLENBQUNVLE9BQU87WUFFbEUsd0hBQXdIO1lBQ3hILElBQUksQ0FBQ1gsVUFBVSxHQUFHLElBQUksQ0FBQ0MsTUFBTTtZQUU3Qiw4R0FBOEc7WUFDOUcsSUFBSSxDQUFDZSxZQUFZLEdBQUc7Z0JBQUUsSUFBSSxDQUFDRCxPQUFPO2FBQUU7UUFDdEM7UUFFQSx5R0FBeUc7UUFDekcsSUFBSSxDQUFDRSxpQkFBaUIsR0FBRztRQUV6QixrSEFBa0g7UUFDbEgsa0hBQWtIO1FBQ2xILDBDQUEwQztRQUMxQyxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUksQ0FBQ0Esc0JBQXNCLElBQUksQ0FBQztRQUU5RCw2Q0FBNkM7UUFDN0M3QixNQUFNOEIsbUJBQW1CLENBQUUsSUFBSSxDQUFDbEIsTUFBTSxHQUFJLCtEQUErRDtRQUN6R1osTUFBTStCLGNBQWMsQ0FBRSxJQUFJLENBQUNuQixNQUFNLEdBQUksbUVBQW1FO1FBRXhHLHFCQUFxQjtRQUNyQixJQUFJLENBQUNvQixnQkFBZ0IsR0FBRyxJQUFJeEMsUUFBUyxHQUFHO1FBRXhDLDJCQUEyQjtRQUMzQixJQUFJLENBQUN5QyxlQUFlLEdBQUc7UUFFdkIsa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQ0MsU0FBUyxHQUFHO1FBRWpCLDJHQUEyRztRQUMzRyxJQUFJLENBQUNDLFNBQVMsR0FBRztRQUVqQiwyRkFBMkY7UUFDM0YsSUFBSSxDQUFDQyxZQUFZLEdBQUcsQUFBRTlCLFdBQVdSLFNBQVN1QywwQkFBMEIsR0FBSyxJQUFJckMsTUFBTW9DLFlBQVksQ0FBRSxJQUFJLENBQUNkLE9BQU87UUFDN0csK0pBQStKO1FBQy9KLGtKQUFrSjtRQUNsSix3R0FBd0c7UUFFeEcsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQ2dCLGlCQUFpQixHQUFHLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJLENBQUUsSUFBSTtRQUNsRCxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUksQ0FBQ0YsU0FBUyxDQUFDQyxJQUFJLENBQUUsSUFBSTtRQUVyREUsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDa0IsRUFBRSxFQUFFO0lBQ3pGLHdJQUF3STtJQUMxSTtJQUVBOzs7R0FHQyxHQUNEc0IscUJBQXFCO1FBQ25CLE1BQU1DLE9BQU8sSUFBSSxDQUFDdkMsT0FBTyxDQUFDd0MsT0FBTztRQUNqQyxJQUFJLENBQUNqQyxNQUFNLENBQUNrQyxLQUFLLEdBQUdGLEtBQUtFLEtBQUssR0FBRyxJQUFJLENBQUNWLFlBQVk7UUFDbEQsSUFBSSxDQUFDeEIsTUFBTSxDQUFDbUMsTUFBTSxHQUFHSCxLQUFLRyxNQUFNLEdBQUcsSUFBSSxDQUFDWCxZQUFZO1FBQ3BELElBQUksQ0FBQ3hCLE1BQU0sQ0FBQ0csS0FBSyxDQUFDK0IsS0FBSyxHQUFHLEdBQUdGLEtBQUtFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDbEMsTUFBTSxDQUFDRyxLQUFLLENBQUNnQyxNQUFNLEdBQUcsR0FBR0gsS0FBS0csTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUNyQixPQUFPLENBQUNzQixXQUFXO1FBQ3hCLElBQUksQ0FBQ2hCLGdCQUFnQixDQUFDaUIsS0FBSyxDQUFFLEdBQUc7UUFDaENqRCxNQUFNK0IsY0FBYyxDQUFFLElBQUksQ0FBQ25CLE1BQU07SUFDbkM7SUFFQTs7O0dBR0MsR0FDRHNDLG1CQUFtQjtRQUNqQixNQUFNQyxJQUFJLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJO1FBQzdCLE1BQU1DLElBQUksSUFBSSxDQUFDRixTQUFTLENBQUNHLElBQUk7UUFDN0IsSUFBSSxDQUFDdkIsZ0JBQWdCLENBQUNpQixLQUFLLENBQUUsQ0FBQ0UsR0FBRyxDQUFDRyxJQUFLLHNDQUFzQztRQUM3RSx3S0FBd0s7UUFDeEt0RCxNQUFNd0QsWUFBWSxDQUFFLENBQUMsZUFBZSxFQUFFTCxFQUFFLENBQUMsRUFBRUcsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMxQyxNQUFNLEdBQUksNkNBQTZDO1FBQzdHLElBQUksQ0FBQ0EsTUFBTSxDQUFDa0MsS0FBSyxHQUFHLElBQUksQ0FBQ00sU0FBUyxDQUFDTixLQUFLLEdBQUcsSUFBSSxDQUFDVixZQUFZO1FBQzVELElBQUksQ0FBQ3hCLE1BQU0sQ0FBQ21DLE1BQU0sR0FBRyxJQUFJLENBQUNLLFNBQVMsQ0FBQ0wsTUFBTSxHQUFHLElBQUksQ0FBQ1gsWUFBWTtRQUM5RCxJQUFJLENBQUN4QixNQUFNLENBQUNHLEtBQUssQ0FBQytCLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQ00sU0FBUyxDQUFDTixLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQ2xDLE1BQU0sQ0FBQ0csS0FBSyxDQUFDZ0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDSyxTQUFTLENBQUNMLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDckIsT0FBTyxDQUFDc0IsV0FBVztJQUMxQjtJQUVBOzs7Ozs7O0dBT0MsR0FDRFMsU0FBUztRQUNQLDBHQUEwRztRQUMxRyxJQUFLLENBQUMsS0FBSyxDQUFDQSxVQUFXO1lBQ3JCLE9BQU87UUFDVDtRQUVBZixjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV3ZDLFdBQVcsQ0FBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUNrQixFQUFFLEVBQUU7UUFDcEZxQixjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV2dCLElBQUk7UUFFdkQsTUFBUSxJQUFJLENBQUNoRCxjQUFjLENBQUNpRCxNQUFNLENBQUc7WUFDbkMsSUFBSSxDQUFDakQsY0FBYyxDQUFDa0QsR0FBRyxHQUFHSCxNQUFNO1FBQ2xDO1FBRUEsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQ0ksU0FBUztRQUVkLDZCQUE2QjtRQUM3QixJQUFJLENBQUN2QyxPQUFPLENBQUN3QyxPQUFPLElBQUkscUNBQXFDO1FBQzdELElBQUksQ0FBQ3hDLE9BQU8sQ0FBQ2tDLFlBQVksQ0FBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSyxXQUFXO1FBQzFELElBQUksQ0FBQ2xDLE9BQU8sQ0FBQ3lDLFNBQVMsQ0FBRSxHQUFHLEdBQUcsSUFBSSxDQUFDbkQsTUFBTSxDQUFDa0MsS0FBSyxFQUFFLElBQUksQ0FBQ2xDLE1BQU0sQ0FBQ21DLE1BQU0sR0FBSSxtQkFBbUI7UUFDMUYsSUFBSSxDQUFDekIsT0FBTyxDQUFDRSxJQUFJO1FBQ2pCLElBQUksQ0FBQ0UsT0FBTyxDQUFDc0IsV0FBVztRQUV4QiwyS0FBMks7UUFDM0sscUdBQXFHO1FBQ3JHLElBQUksQ0FBQ2YsZUFBZSxHQUFHLE1BQU0sZ0RBQWdEO1FBQzdFLElBQU0sSUFBSStCLFdBQVcsSUFBSSxDQUFDQyxhQUFhLEVBQUVELGFBQWEsTUFBTUEsV0FBV0EsU0FBU0UsWUFBWSxDQUFHO1lBQzdGLElBQUksQ0FBQ0MsY0FBYyxDQUFFSDtZQUNyQixJQUFLQSxhQUFhLElBQUksQ0FBQ0ksWUFBWSxFQUFHO2dCQUFFO1lBQU87UUFDakQ7UUFDQSxJQUFLLElBQUksQ0FBQ25DLGVBQWUsRUFBRztZQUMxQixJQUFJLENBQUNvQyxRQUFRLENBQUUsSUFBSSxDQUFDcEMsZUFBZSxDQUFDcUMsUUFBUSxDQUFDQyxLQUFLLEVBQUU7UUFDdEQ7UUFFQUMsVUFBVUEsT0FBUSxJQUFJLENBQUNyQyxTQUFTLEtBQUssR0FBRztRQUV4Q08sY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVdrQixHQUFHO1FBRXRELE9BQU87SUFDVDtJQUVBOzs7Ozs7Ozs7R0FTQyxHQUNEYSxVQUFXVCxRQUFRLEVBQUc7UUFDcEIsSUFBSSxDQUFDOUIsU0FBUyxHQUFHO1FBQ2pCUSxjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV3ZDLFdBQVcsQ0FBRSxDQUFDLFdBQVcsRUFBRTZELFNBQVNNLFFBQVEsQ0FBQ0MsS0FBSyxDQUFDRyxhQUFhLElBQUk7UUFDdkhoQyxjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV2dCLElBQUk7UUFFdkQsTUFBTWhDLFVBQVUsSUFBSSxDQUFDQyxZQUFZLENBQUUsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRTtRQUMzRCxNQUFNTixVQUFVSSxRQUFRSixPQUFPO1FBRS9CLG9FQUFvRTtRQUNwRUEsUUFBUXdDLE9BQU87UUFDZnhDLFFBQVFFLElBQUk7UUFDWkUsUUFBUXNCLFdBQVc7UUFFbkIsMEJBQTBCO1FBQzFCLElBQUssSUFBSSxDQUFDYixTQUFTLEVBQUc7WUFDcEIsTUFBTW1DLFdBQVdOLFNBQVNNLFFBQVE7WUFDbEMsTUFBTUMsUUFBUUQsU0FBU0MsS0FBSztZQUU1QiwrRkFBK0Y7WUFDL0Z0RSxjQUFjMEUsUUFBUSxDQUFFLElBQUksQ0FBQ3ZDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQ0osZ0JBQWdCLENBQUNtQixDQUFDLEdBQUcsSUFBSSxDQUFDZixZQUFZLEVBQ3ZGLEdBQUcsSUFBSSxDQUFDQSxZQUFZLEVBQUUsSUFBSSxDQUFDSixnQkFBZ0IsQ0FBQ3NCLENBQUMsR0FBRyxJQUFJLENBQUNsQixZQUFZLEVBQ2pFLEdBQUcsR0FBRztZQUNSbEMsZUFBZTBFLEdBQUcsQ0FBRSxJQUFJLENBQUNyRSxxQkFBcUIsQ0FBQ2dFLEtBQUssQ0FBQ00sU0FBUyxJQUFLQyxNQUFNO1lBQ3pFNUUsZUFBZTZFLGNBQWMsQ0FBRTlFLGVBQWdCK0Usa0JBQWtCLENBQUUxRDtZQUVuRSx5Q0FBeUM7WUFDekMsSUFBTSxJQUFJMkQsSUFBSSxHQUFHQSxJQUFJVixNQUFNWixNQUFNLEVBQUVzQixJQUFNO2dCQUN2QyxNQUFNQyxPQUFPWCxNQUFNWSxLQUFLLENBQUVGLEVBQUc7Z0JBQzdCQyxLQUFLTCxTQUFTLEdBQUdPLHFCQUFxQixDQUFFOUQ7Z0JBQ3hDLElBQUs0RCxLQUFLRyxXQUFXLElBQUs7b0JBQ3hCL0QsUUFBUWdFLFNBQVM7b0JBQ2pCSixLQUFLSyxRQUFRLENBQUNDLGNBQWMsQ0FBRWxFO29CQUM5Qiw0R0FBNEc7b0JBQzVHLGtCQUFrQjtvQkFDbEIsK0JBQStCO29CQUMvQix5QkFBeUI7b0JBQ3pCLG9CQUFvQjtvQkFDcEIscUJBQXFCO29CQUNyQkEsUUFBUW1FLElBQUk7Z0JBQ2Q7WUFDRjtRQUNGO1FBRUEvQyxjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV2tCLEdBQUc7SUFDeEQ7SUFFQTs7O0dBR0MsR0FDRDhCLGNBQWM7UUFDWixJQUFJLENBQUM5RCxpQkFBaUI7UUFDdEIsSUFBSSxDQUFDTSxTQUFTLEdBQUc7UUFFakIseURBQXlEO1FBQ3pELElBQUssSUFBSSxDQUFDTixpQkFBaUIsS0FBSyxJQUFJLENBQUNELFlBQVksQ0FBQ2dDLE1BQU0sRUFBRztZQUN6RCxNQUFNZ0MsWUFBWTlFLFNBQVNDLGFBQWEsQ0FBRTtZQUMxQyxNQUFNOEUsYUFBYUQsVUFBVXBFLFVBQVUsQ0FBRTtZQUN6Q3FFLFdBQVdwRSxJQUFJO1lBQ2YsSUFBSSxDQUFDRyxZQUFZLENBQUMrQixJQUFJLENBQUUsSUFBSS9ELHFCQUFzQmdHLFdBQVdDO1FBQy9EO1FBQ0EsTUFBTWxFLFVBQVUsSUFBSSxDQUFDQyxZQUFZLENBQUUsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRTtRQUMzRCxNQUFNTixVQUFVSSxRQUFRSixPQUFPO1FBRS9CLDZCQUE2QjtRQUM3QkksUUFBUW1FLGFBQWEsQ0FBRSxJQUFJLENBQUNqRixNQUFNLENBQUNrQyxLQUFLLEVBQUUsSUFBSSxDQUFDbEMsTUFBTSxDQUFDbUMsTUFBTTtRQUM1RHpCLFFBQVFrQyxZQUFZLENBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUssV0FBVztRQUNyRGxDLFFBQVF5QyxTQUFTLENBQUUsR0FBRyxHQUFHLElBQUksQ0FBQ25ELE1BQU0sQ0FBQ2tDLEtBQUssRUFBRSxJQUFJLENBQUNsQyxNQUFNLENBQUNtQyxNQUFNLEdBQUksbUJBQW1CO0lBQ3ZGO0lBRUE7OztHQUdDLEdBQ0QrQyxhQUFhO1FBQ1gsSUFBSSxDQUFDbEUsaUJBQWlCO1FBQ3RCLElBQUksQ0FBQ00sU0FBUyxHQUFHO0lBQ25CO0lBRUE7Ozs7OztHQU1DLEdBQ0RtQyxTQUFVRSxLQUFLLEVBQUV3QixXQUFXLEVBQUc7UUFDN0IsTUFBTUMsa0JBQWtCLElBQUksQ0FBQ3hGLGtCQUFrQixDQUFDK0QsS0FBSyxDQUFDWixNQUFNLEdBQUc7UUFFL0QsSUFBTSxJQUFJc0IsSUFBSVYsTUFBTVosTUFBTSxHQUFHLEdBQUdzQixLQUFLYyxhQUFhZCxJQUFNO1lBQ3RELE1BQU1DLE9BQU9YLE1BQU1ZLEtBQUssQ0FBRUYsRUFBRztZQUU3QixJQUFLQyxLQUFLRyxXQUFXLElBQUs7Z0JBQ3hCM0MsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxTQUFTLEVBQUVvRSxNQUFNMEIsVUFBVSxDQUFFZixNQUFPUixhQUFhLElBQUk7Z0JBQ3RILFdBQVc7Z0JBQ1gsSUFBSSxDQUFDdkMsU0FBUztnQkFDZCxJQUFJLENBQUNELFNBQVMsR0FBRztZQUNuQjtZQUVBLDJFQUEyRTtZQUMzRSxJQUFLK0MsSUFBSWUsaUJBQWtCO2dCQUN6QixJQUFLZCxLQUFLZ0IsUUFBUSxDQUFDdkMsTUFBTSxFQUFHO29CQUMxQmpCLGNBQWNBLFdBQVd2QyxXQUFXLElBQUl1QyxXQUFXdkMsV0FBVyxDQUFFLENBQUMsWUFBWSxFQUFFb0UsTUFBTTBCLFVBQVUsQ0FBRWYsTUFBT1IsYUFBYSxJQUFJO29CQUV6SCxNQUFNeUIsYUFBYSxJQUFJLENBQUN4RSxZQUFZLENBQUUsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRTtvQkFDOUQsTUFBTXdFLGdCQUFnQixJQUFJLENBQUN6RSxZQUFZLENBQUUsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxFQUFHO29CQUNyRSxJQUFJLENBQUNrRSxVQUFVO29CQUVmTSxjQUFjOUUsT0FBTyxDQUFDa0MsWUFBWSxDQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFFbkQsTUFBTTZDLFVBQVVuQixLQUFLZ0IsUUFBUTtvQkFDN0IsNEdBQTRHO29CQUM1RyxvQkFBb0I7b0JBQ3BCLDJGQUEyRjtvQkFDM0YsaUZBQWlGO29CQUNqRixJQUFJSSx1QkFBdUIxRyxTQUFTMkcsWUFBWTtvQkFDaEQsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlILFFBQVExQyxNQUFNLEVBQUU2QyxJQUFNO3dCQUN6QywwRkFBMEY7d0JBQzFGRix1QkFBdUJBLHdCQUF3QkQsT0FBTyxDQUFFRyxFQUFHLENBQUNDLGVBQWU7b0JBQzdFO29CQUVBLElBQUtILHNCQUF1Qjt3QkFDMUIsMENBQTBDO3dCQUMxQyxJQUFJSSxlQUFlO3dCQUNuQixJQUFNLElBQUlGLElBQUksR0FBR0EsSUFBSUgsUUFBUTFDLE1BQU0sRUFBRTZDLElBQU07NEJBQ3pDRSxnQkFBZ0IsR0FBR0EsZUFBZSxNQUFNLEtBQUtMLE9BQU8sQ0FBRUcsRUFBRyxDQUFDRyxrQkFBa0IsSUFBSTt3QkFDbEY7d0JBQ0FQLGNBQWM5RSxPQUFPLENBQUNzRixNQUFNLEdBQUdGO3dCQUMvQk4sY0FBYzlFLE9BQU8sQ0FBQ3VGLFNBQVMsQ0FBRVYsV0FBV3ZGLE1BQU0sRUFBRSxHQUFHO3dCQUN2RHdGLGNBQWM5RSxPQUFPLENBQUNzRixNQUFNLEdBQUc7b0JBQ2pDLE9BQ0s7d0JBQ0gseUZBQXlGO3dCQUN6RixJQUFNLElBQUlKLElBQUksR0FBR0EsSUFBSUgsUUFBUTFDLE1BQU0sRUFBRTZDLElBQU07NEJBQ3pDSCxPQUFPLENBQUVHLEVBQUcsQ0FBQ00saUJBQWlCLENBQUVYO3dCQUNsQzt3QkFDQUMsY0FBYzlFLE9BQU8sQ0FBQ3VGLFNBQVMsQ0FBRVYsV0FBV3ZGLE1BQU0sRUFBRSxHQUFHO29CQUN6RDtnQkFDRjtnQkFFQSxJQUFLc0UsS0FBSzZCLG1CQUFtQixPQUFPLEdBQUk7b0JBQ3RDckUsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxZQUFZLEVBQUVvRSxNQUFNMEIsVUFBVSxDQUFFZixNQUFPUixhQUFhLElBQUk7b0JBQ3pILGNBQWM7b0JBQ2QsTUFBTXlCLGFBQWEsSUFBSSxDQUFDeEUsWUFBWSxDQUFFLElBQUksQ0FBQ0MsaUJBQWlCLENBQUU7b0JBQzlELE1BQU13RSxnQkFBZ0IsSUFBSSxDQUFDekUsWUFBWSxDQUFFLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsRUFBRztvQkFDckUsSUFBSSxDQUFDa0UsVUFBVTtvQkFFZiwyREFBMkQ7b0JBQzNETSxjQUFjOUUsT0FBTyxDQUFDa0MsWUFBWSxDQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztvQkFDbkQ0QyxjQUFjOUUsT0FBTyxDQUFDMEYsV0FBVyxHQUFHOUIsS0FBSzZCLG1CQUFtQjtvQkFDNURYLGNBQWM5RSxPQUFPLENBQUN1RixTQUFTLENBQUVWLFdBQVd2RixNQUFNLEVBQUUsR0FBRztvQkFDdkR3RixjQUFjOUUsT0FBTyxDQUFDMEYsV0FBVyxHQUFHO2dCQUN0QztZQUNGO1FBQ0Y7SUFDRjtJQUVBOzs7Ozs7R0FNQyxHQUNEQyxPQUFRMUMsS0FBSyxFQUFFd0IsV0FBVyxFQUFHO1FBQzNCLE1BQU1DLGtCQUFrQixJQUFJLENBQUN4RixrQkFBa0IsQ0FBQytELEtBQUssQ0FBQ1osTUFBTSxHQUFHO1FBRS9ELElBQU0sSUFBSXNCLElBQUljLGFBQWFkLElBQUlWLE1BQU1aLE1BQU0sRUFBRXNCLElBQU07WUFDakQsTUFBTUMsT0FBT1gsTUFBTVksS0FBSyxDQUFFRixFQUFHO1lBRTdCLDBEQUEwRDtZQUMxRCxJQUFLQSxJQUFJZSxpQkFBa0I7Z0JBQ3pCLElBQUtkLEtBQUs2QixtQkFBbUIsT0FBTyxHQUFJO29CQUN0Q3JFLGNBQWNBLFdBQVd2QyxXQUFXLElBQUl1QyxXQUFXdkMsV0FBVyxDQUFFLENBQUMsYUFBYSxFQUFFb0UsTUFBTTBCLFVBQVUsQ0FBRWYsTUFBT1IsYUFBYSxJQUFJO29CQUUxSCxlQUFlO29CQUNmLElBQUksQ0FBQ2dCLFdBQVc7Z0JBQ2xCO2dCQUVBLElBQUtSLEtBQUtnQixRQUFRLENBQUN2QyxNQUFNLEVBQUc7b0JBQzFCakIsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxhQUFhLEVBQUVvRSxNQUFNMEIsVUFBVSxDQUFFZixNQUFPUixhQUFhLElBQUk7b0JBRTFILGVBQWU7b0JBQ2YsSUFBSSxDQUFDZ0IsV0FBVztnQkFDbEI7WUFDRjtZQUVBLElBQUtSLEtBQUtHLFdBQVcsSUFBSztnQkFDeEIzQyxjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV3ZDLFdBQVcsQ0FBRSxDQUFDLFVBQVUsRUFBRW9FLE1BQU0wQixVQUFVLENBQUVmLE1BQU9SLGFBQWEsSUFBSTtnQkFDdkgsWUFBWTtnQkFDWixJQUFJLENBQUN2QyxTQUFTO2dCQUNkLElBQUksQ0FBQ0QsU0FBUyxHQUFHO1lBQ25CO1FBQ0Y7SUFDRjtJQUVBOzs7Ozs7Ozs7R0FTQyxHQUNEaUMsZUFBZ0JILFFBQVEsRUFBRztRQUV6QixzRUFBc0U7UUFDdEUsSUFBSyxDQUFDQSxTQUFTa0QsT0FBTyxJQUFJLElBQUksQ0FBQ3RHLE1BQU0sQ0FBQ2tDLEtBQUssS0FBSyxLQUFLLElBQUksQ0FBQ2xDLE1BQU0sQ0FBQ21DLE1BQU0sS0FBSyxHQUFJO1lBQzlFO1FBQ0Y7UUFFQUwsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxnQkFBZ0IsRUFBRTZELFNBQVMzQyxFQUFFLENBQUMsQ0FBQyxFQUFFMkMsU0FBU00sUUFBUSxDQUFDQyxLQUFLLENBQUNHLGFBQWEsSUFBSTtRQUMzSWhDLGNBQWNBLFdBQVd2QyxXQUFXLElBQUl1QyxXQUFXZ0IsSUFBSTtRQUV2RCxvR0FBb0c7UUFDcEcsTUFBTXFDLGNBQWMsSUFBSSxDQUFDOUQsZUFBZSxHQUFHK0IsU0FBU00sUUFBUSxDQUFDNkMsZ0JBQWdCLENBQUUsSUFBSSxDQUFDbEYsZUFBZSxDQUFDcUMsUUFBUSxJQUFLO1FBQ2pILElBQUssSUFBSSxDQUFDckMsZUFBZSxFQUFHO1lBQzFCLElBQUksQ0FBQ29DLFFBQVEsQ0FBRSxJQUFJLENBQUNwQyxlQUFlLENBQUNxQyxRQUFRLENBQUNDLEtBQUssRUFBRXdCO1FBQ3REO1FBQ0EsSUFBSSxDQUFDa0IsTUFBTSxDQUFFakQsU0FBU00sUUFBUSxDQUFDQyxLQUFLLEVBQUV3QjtRQUV0QyxNQUFNckUsVUFBVSxJQUFJLENBQUNDLFlBQVksQ0FBRSxJQUFJLENBQUNDLGlCQUFpQixDQUFFO1FBQzNELE1BQU1OLFVBQVVJLFFBQVFKLE9BQU87UUFFL0IsaUhBQWlIO1FBQ2pILCtCQUErQjtRQUMvQixJQUFLLElBQUksQ0FBQ1ksU0FBUyxFQUFHO1lBQ3BCLElBQUksQ0FBQ3VDLFNBQVMsQ0FBRVQ7UUFDbEI7UUFFQSxvR0FBb0c7UUFDcEdRLFVBQVVBLE9BQVFSLFNBQVNNLFFBQVEsQ0FBQzhDLGlCQUFpQixDQUFDQyxxQkFBcUI7UUFFM0UsTUFBTUMsU0FBU3RELFNBQVNNLFFBQVEsQ0FBQzhDLGlCQUFpQixDQUFDRSxNQUFNO1FBRXpELDRHQUE0RztRQUM1RyxzSUFBc0k7UUFDdEloRyxRQUFRa0MsWUFBWSxDQUNsQixJQUFJLENBQUNwQixZQUFZLEVBQ2pCLEdBQ0EsR0FDQSxJQUFJLENBQUNBLFlBQVksRUFDakIsSUFBSSxDQUFDSixnQkFBZ0IsQ0FBQ21CLENBQUMsR0FBRyxJQUFJLENBQUNmLFlBQVksRUFDM0MsSUFBSSxDQUFDSixnQkFBZ0IsQ0FBQ3NCLENBQUMsR0FBRyxJQUFJLENBQUNsQixZQUFZO1FBRzdDLElBQUs0QixTQUFTTSxRQUFRLEtBQUssSUFBSSxDQUFDL0QscUJBQXFCLEVBQUc7WUFDdEQrRyxPQUFPbEMscUJBQXFCLENBQUU5RDtRQUNoQztRQUVBLHlDQUF5QztRQUN6QzBDLFNBQVN1RCxXQUFXLENBQUU3RixTQUFTc0MsU0FBU00sUUFBUSxDQUFDWSxJQUFJLEVBQUVsQixTQUFTTSxRQUFRLENBQUM4QyxpQkFBaUIsQ0FBQ0UsTUFBTTtRQUVqRyxJQUFJLENBQUNyRixlQUFlLEdBQUcrQjtRQUV2QnRCLGNBQWNBLFdBQVd2QyxXQUFXLElBQUl1QyxXQUFXa0IsR0FBRztJQUN4RDtJQUVBOzs7R0FHQyxHQUNENEQsVUFBVTtRQUNSOUUsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDa0IsRUFBRSxFQUFFO1FBRXJGLG1CQUFtQjtRQUNuQixJQUFJLENBQUNkLHFCQUFxQixHQUFHO1FBQzdCZCxXQUFZLElBQUksQ0FBQ2lCLGNBQWM7UUFFL0IsaURBQWlEO1FBQ2pELElBQUksQ0FBQ0UsTUFBTSxDQUFDa0MsS0FBSyxHQUFHO1FBQ3BCLElBQUksQ0FBQ2xDLE1BQU0sQ0FBQ21DLE1BQU0sR0FBRztRQUVyQixLQUFLLENBQUN5RTtJQUNSO0lBRUE7Ozs7R0FJQyxHQUNEQyxrQkFBbUJ6RCxRQUFRLEVBQUc7UUFDNUJ0QixjQUFjQSxXQUFXZ0YsS0FBSyxJQUFJaEYsV0FBV2dGLEtBQUssQ0FBRSxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQ3JHLEVBQUUsQ0FBQyxNQUFNLEVBQUUyQyxTQUFTMkQsUUFBUSxJQUFJO1FBRTdIbkQsVUFBVUEsT0FBUVI7UUFFbEIsSUFBS1EsUUFBUztZQUNaLHVCQUF1QjtZQUN2QixJQUFJLENBQUNuRSxPQUFPLENBQUN1SCxpQkFBaUI7UUFDaEM7UUFFQSw4SkFBOEo7UUFDOUosSUFBSSxDQUFDbEgsY0FBYyxDQUFDZ0QsSUFBSSxDQUFFTTtRQUMxQixJQUFJLENBQUN6QixTQUFTO0lBQ2hCO0lBRUE7Ozs7O0dBS0MsR0FDRHNGLFlBQWE3RCxRQUFRLEVBQUc7UUFDdEJ0QixjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV3ZDLFdBQVcsQ0FBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNrQixFQUFFLENBQUMsYUFBYSxFQUFFMkMsU0FBUzJELFFBQVEsSUFBSTtRQUVoSCxLQUFLLENBQUNFLFlBQWE3RDtRQUVuQiwrREFBK0Q7UUFDL0QsSUFBTSxJQUFJTSxXQUFXTixTQUFTTSxRQUFRLEVBQUVBLFlBQVlBLGFBQWEsSUFBSSxDQUFDOUQsa0JBQWtCLEVBQUU4RCxXQUFXQSxTQUFTd0QsTUFBTSxDQUFHO1lBQ3JILE1BQU01QyxPQUFPWixTQUFTWSxJQUFJO1lBRTFCLHFEQUFxRDtZQUNyRCxJQUFLLElBQUksQ0FBQ3JELHNCQUFzQixDQUFFcUQsS0FBSzdELEVBQUUsQ0FBRSxFQUFHO2dCQUM1QyxJQUFJLENBQUNRLHNCQUFzQixDQUFFcUQsS0FBSzdELEVBQUUsQ0FBRTtZQUN4QyxPQUNLO2dCQUNILElBQUksQ0FBQ1Esc0JBQXNCLENBQUVxRCxLQUFLN0QsRUFBRSxDQUFFLEdBQUc7Z0JBRXpDNkQsS0FBSzZDLG1CQUFtQixDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDdkYsb0JBQW9CO2dCQUMvRHlDLEtBQUsrQyxnQkFBZ0IsQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQzVGLGlCQUFpQjtZQUN4RDtRQUNGO0lBQ0Y7SUFFQTs7Ozs7R0FLQyxHQUNENkYsZUFBZ0JuRSxRQUFRLEVBQUc7UUFDekJ0QixjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV3ZDLFdBQVcsQ0FBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUNrQixFQUFFLENBQUMsZ0JBQWdCLEVBQUUyQyxTQUFTMkQsUUFBUSxJQUFJO1FBRW5ILGtFQUFrRTtRQUNsRSxJQUFNLElBQUlyRCxXQUFXTixTQUFTTSxRQUFRLEVBQUVBLFlBQVlBLGFBQWEsSUFBSSxDQUFDOUQsa0JBQWtCLEVBQUU4RCxXQUFXQSxTQUFTd0QsTUFBTSxDQUFHO1lBQ3JILE1BQU01QyxPQUFPWixTQUFTWSxJQUFJO1lBQzFCVixVQUFVQSxPQUFRLElBQUksQ0FBQzNDLHNCQUFzQixDQUFFcUQsS0FBSzdELEVBQUUsQ0FBRSxHQUFHO1lBQzNELElBQUksQ0FBQ1Esc0JBQXNCLENBQUVxRCxLQUFLN0QsRUFBRSxDQUFFO1lBQ3RDLElBQUssSUFBSSxDQUFDUSxzQkFBc0IsQ0FBRXFELEtBQUs3RCxFQUFFLENBQUUsS0FBSyxHQUFJO2dCQUNsRCxPQUFPLElBQUksQ0FBQ1Esc0JBQXNCLENBQUVxRCxLQUFLN0QsRUFBRSxDQUFFO2dCQUU3QzZELEtBQUsrQyxnQkFBZ0IsQ0FBQ0csTUFBTSxDQUFFLElBQUksQ0FBQzlGLGlCQUFpQjtnQkFDcEQ0QyxLQUFLNkMsbUJBQW1CLENBQUNNLGNBQWMsQ0FBRSxJQUFJLENBQUM1RixvQkFBb0I7WUFDcEU7UUFDRjtRQUVBLEtBQUssQ0FBQzBGLGVBQWdCbkU7SUFDeEI7SUFFQTs7Ozs7O0dBTUMsR0FDRHNFLGlCQUFrQnJFLGFBQWEsRUFBRUcsWUFBWSxFQUFHO1FBQzlDMUIsY0FBY0EsV0FBV3ZDLFdBQVcsSUFBSXVDLFdBQVd2QyxXQUFXLENBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDa0IsRUFBRSxDQUFDLGtCQUFrQixFQUFFNEMsY0FBYzBELFFBQVEsR0FBRyxJQUFJLEVBQUV2RCxhQUFhdUQsUUFBUSxJQUFJO1FBRXhKLEtBQUssQ0FBQ1csaUJBQWtCckUsZUFBZUc7UUFFdkMsaUhBQWlIO1FBQ2pILGlIQUFpSDtRQUNqSCxnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDN0IsU0FBUztJQUNoQjtJQUVBOzs7O0dBSUMsR0FDRGdHLDJCQUE0QnZFLFFBQVEsRUFBRztRQUNyQ3RCLGNBQWNBLFdBQVd2QyxXQUFXLElBQUl1QyxXQUFXdkMsV0FBVyxDQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQ2tCLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRTJDLFNBQVMyRCxRQUFRLElBQUk7UUFDL0hqRixjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV2dCLElBQUk7UUFFdkRjLFVBQVVBLE9BQVFSLFNBQVN3RSxjQUFjLEtBQUssSUFBSTtRQUVsRCxpSEFBaUg7UUFDakgsOEdBQThHO1FBQzlHLG9CQUFvQjtRQUNwQnhFLFNBQVN6QixTQUFTO1FBRWxCRyxjQUFjQSxXQUFXdkMsV0FBVyxJQUFJdUMsV0FBV2tCLEdBQUc7SUFDeEQ7SUFFQTs7Ozs7R0FLQyxHQUNEK0QsV0FBVztRQUNULE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDdEcsRUFBRSxDQUFDLENBQUMsRUFBRXhCLFlBQVk0SSxTQUFTLENBQUUsSUFBSSxDQUFDQyxHQUFHLENBQUUsRUFBRTtJQUN0RTtJQW5sQkE7Ozs7Ozs7Ozs7O0dBV0MsR0FDREMsWUFBYXRJLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLENBQUc7UUFDMUUsS0FBSztRQUVMLElBQUksQ0FBQ0osVUFBVSxDQUFFQyxTQUFTQyxVQUFVQyx1QkFBdUJDO0lBQzdEO0FBb2tCRjtBQUVBVCxRQUFRNkksUUFBUSxDQUFFLGVBQWV6STtBQUVqQ1QsU0FBU21KLE9BQU8sQ0FBRTFJO0FBRWxCLGVBQWVBLFlBQVkifQ==