// Copyright 2013-2024, University of Colorado Boulder
/**
 * A persistent display of a specific Node and its descendants, which is updated at discrete points in time.
 *
 * Use display.getDOMElement or display.domElement to retrieve the Display's DOM representation.
 * Use display.updateDisplay() to trigger the visual update in the Display's DOM element.
 *
 * A standard way of using a Display with Scenery is to:
 * 1. Create a Node that will be the root
 * 2. Create a Display, referencing that node
 * 3. Make changes to the scene graph
 * 4. Call display.updateDisplay() to draw the scene graph into the Display
 * 5. Go to (3)
 *
 * Common ways to simplify the change/update loop would be to:
 * - Use Node-based events. Initialize it with Display.initializeEvents(), then
 *   add input listeners to parts of the scene graph (see Node.addInputListener).
 * - Execute code (and update the display afterwards) by using Display.updateOnRequestAnimationFrame.
 *
 * Internal documentation:
 *
 * Lifecycle information:
 *   Instance (create,dispose)
 *     - out of update:            Stateless stub is created synchronously when a Node's children are added where we
 *                                 have no relevant Instance.
 *     - start of update:          Creates first (root) instance if it doesn't exist (stateless stub).
 *     - synctree:                 Create descendant instances under stubs, fills in state, and marks removed subtree
 *                                 roots for disposal.
 *     - update instance disposal: Disposes root instances that were marked. This also disposes all descendant
 *                                 instances, and for every instance,
 *                                 it disposes the currently-attached drawables.
 *   Drawable (create,dispose)
 *     - synctree:                 Creates all drawables where necessary. If it replaces a self/group/shared drawable on
 *                                 the instance,
 *                                 that old drawable is marked for disposal.
 *     - update instance disposal: Any drawables attached to disposed instances are disposed themselves (see Instance
 *                                 lifecycle).
 *     - update drawable disposal: Any marked drawables that were replaced or removed from an instance (it didn't
 *                                 maintain a reference) are disposed.
 *
 *   add/remove drawables from blocks:
 *     - stitching changes pending "parents", marks for block update
 *     - backbones marked for disposal (e.g. instance is still there, just changed to not have a backbone) will mark
 *         drawables for block updates
 *     - add/remove drawables phase updates drawables that were marked
 *     - disposed backbone instances will only remove drawables if they weren't marked for removal previously (e.g. in
 *         case we are from a removed instance)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Emitter from '../../../axon/js/Emitter.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Matrix3Type } from '../../../dot/js/Matrix3.js';
import escapeHTML from '../../../phet-core/js/escapeHTML.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import AriaLiveAnnouncer from '../../../utterance-queue/js/AriaLiveAnnouncer.js';
import UtteranceQueue from '../../../utterance-queue/js/UtteranceQueue.js';
import { BackboneDrawable, Block, CanvasBlock, CanvasNodeBoundsOverlay, Color, DOMBlock, DOMDrawable, Features, FittedBlockBoundsOverlay, FocusManager, FullScreen, globalKeyStateTracker, HighlightOverlay, HitAreaOverlay, Input, Instance, KeyboardUtils, Node, PDOMInstance, PDOMSiblingStyle, PDOMTree, PDOMUtils, PointerAreaOverlay, PointerOverlay, Renderer, scenery, scenerySerialize, Trail, Utils, WebGLBlock } from '../imports.js';
import SafariWorkaroundOverlay from '../overlays/SafariWorkaroundOverlay.js';
const CUSTOM_CURSORS = {
    'scenery-grab-pointer': [
        'grab',
        '-moz-grab',
        '-webkit-grab',
        'pointer'
    ],
    'scenery-grabbing-pointer': [
        'grabbing',
        '-moz-grabbing',
        '-webkit-grabbing',
        'pointer'
    ]
};
let globalIdCounter = 1;
let Display = class Display {
    getDOMElement() {
        return this._domElement;
    }
    get domElement() {
        return this.getDOMElement();
    }
    /**
   * Updates the display's DOM element with the current visual state of the attached root node and its descendants
   */ updateDisplay() {
        // @ts-expect-error scenery namespace
        if (sceneryLog && scenery.isLoggingPerformance()) {
            this.perfSyncTreeCount = 0;
            this.perfStitchCount = 0;
            this.perfIntervalCount = 0;
            this.perfDrawableBlockChangeCount = 0;
            this.perfDrawableOldIntervalCount = 0;
            this.perfDrawableNewIntervalCount = 0;
        }
        if (assert) {
            Display.assertSubtreeDisposed(this._rootNode);
        }
        sceneryLog && sceneryLog.Display && sceneryLog.Display(`updateDisplay frame ${this._frameId}`);
        sceneryLog && sceneryLog.Display && sceneryLog.push();
        const firstRun = !!this._baseInstance;
        // check to see whether contents under pointers changed (and if so, send the enter/exit events) to
        // maintain consistent state
        if (this._input) {
            // TODO: Should this be handled elsewhere? https://github.com/phetsims/scenery/issues/1581
            this._input.validatePointers();
        }
        if (this._accessible) {
            // update positioning of focusable peer siblings so they are discoverable on mobile assistive devices
            this._rootPDOMInstance.peer.updateSubtreePositioning();
        }
        // validate bounds for everywhere that could trigger bounds listeners. we want to flush out any changes, so that we can call validateBounds()
        // from code below without triggering side effects (we assume that we are not reentrant).
        this._rootNode.validateWatchedBounds();
        if (assertSlow) {
            this._accessible && this._rootPDOMInstance.auditRoot();
        }
        if (assertSlow) {
            this._rootNode._picker.audit();
        }
        // @ts-expect-error TODO Instance https://github.com/phetsims/scenery/issues/1581
        this._baseInstance = this._baseInstance || Instance.createFromPool(this, new Trail(this._rootNode), true, false);
        this._baseInstance.baseSyncTree();
        if (firstRun) {
            // @ts-expect-error TODO instance https://github.com/phetsims/scenery/issues/1581
            this.markTransformRootDirty(this._baseInstance, this._baseInstance.isTransformed); // marks the transform root as dirty (since it is)
        }
        // update our drawable's linked lists where necessary
        while(this._drawablesToUpdateLinks.length){
            this._drawablesToUpdateLinks.pop().updateLinks();
        }
        // clean change-interval information from instances, so we don't leak memory/references
        while(this._changeIntervalsToDispose.length){
            this._changeIntervalsToDispose.pop().dispose();
        }
        this._rootBackbone = this._rootBackbone || this._baseInstance.groupDrawable;
        assert && assert(this._rootBackbone, 'We are guaranteed a root backbone as the groupDrawable on the base instance');
        assert && assert(this._rootBackbone === this._baseInstance.groupDrawable, 'We don\'t want the base instance\'s groupDrawable to change');
        if (assertSlow) {
            this._rootBackbone.audit(true, false, true);
        } // allow pending blocks / dirty
        sceneryLog && sceneryLog.Display && sceneryLog.Display('drawable block change phase');
        sceneryLog && sceneryLog.Display && sceneryLog.push();
        while(this._drawablesToChangeBlock.length){
            const changed = this._drawablesToChangeBlock.pop().updateBlock();
            // @ts-expect-error scenery namespace
            if (sceneryLog && scenery.isLoggingPerformance() && changed) {
                this.perfDrawableBlockChangeCount++;
            }
        }
        sceneryLog && sceneryLog.Display && sceneryLog.pop();
        if (assertSlow) {
            this._rootBackbone.audit(false, false, true);
        } // allow only dirty
        if (assertSlow) {
            this._baseInstance.audit(this._frameId, false);
        }
        // pre-repaint phase: update relative transform information for listeners (notification) and precomputation where desired
        this.updateDirtyTransformRoots();
        // pre-repaint phase update visibility information on instances
        this._baseInstance.updateVisibility(true, true, true, false);
        if (assertSlow) {
            this._baseInstance.auditVisibility(true);
        }
        if (assertSlow) {
            this._baseInstance.audit(this._frameId, true);
        }
        sceneryLog && sceneryLog.Display && sceneryLog.Display('instance root disposal phase');
        sceneryLog && sceneryLog.Display && sceneryLog.push();
        // dispose all of our instances. disposing the root will cause all descendants to also be disposed.
        // will also dispose attached drawables (self/group/etc.)
        while(this._instanceRootsToDispose.length){
            this._instanceRootsToDispose.pop().dispose();
        }
        sceneryLog && sceneryLog.Display && sceneryLog.pop();
        if (assertSlow) {
            this._rootNode.auditInstanceSubtreeForDisplay(this);
        } // make sure trails are valid
        sceneryLog && sceneryLog.Display && sceneryLog.Display('drawable disposal phase');
        sceneryLog && sceneryLog.Display && sceneryLog.push();
        // dispose all of our other drawables.
        while(this._drawablesToDispose.length){
            this._drawablesToDispose.pop().dispose();
        }
        sceneryLog && sceneryLog.Display && sceneryLog.pop();
        if (assertSlow) {
            this._baseInstance.audit(this._frameId, false);
        }
        if (assert) {
            assert(!this._isPainting, 'Display was already updating paint, may have thrown an error on the last update');
            this._isPainting = true;
        }
        // repaint phase
        //OHTWO TODO: can anything be updated more efficiently by tracking at the Display level? Remember, we have recursive updates so things get updated in the right order! https://github.com/phetsims/scenery/issues/1581
        sceneryLog && sceneryLog.Display && sceneryLog.Display('repaint phase');
        sceneryLog && sceneryLog.Display && sceneryLog.push();
        this._rootBackbone.update();
        sceneryLog && sceneryLog.Display && sceneryLog.pop();
        if (assert) {
            this._isPainting = false;
        }
        if (assertSlow) {
            this._rootBackbone.audit(false, false, false);
        } // allow nothing
        if (assertSlow) {
            this._baseInstance.audit(this._frameId, false);
        }
        this.updateCursor();
        this.updateBackgroundColor();
        this.updateSize();
        if (this._overlays.length) {
            let zIndex = this._rootBackbone.lastZIndex;
            for(let i = 0; i < this._overlays.length; i++){
                // layer the overlays properly
                const overlay = this._overlays[i];
                overlay.domElement.style.zIndex = '' + zIndex++;
                overlay.update();
            }
        }
        // After our update and disposals, we want to eliminate any memory leaks from anything that wasn't updated.
        while(this._reduceReferencesNeeded.length){
            this._reduceReferencesNeeded.pop().reduceReferences();
        }
        this._frameId++;
        // @ts-expect-error TODO scenery namespace https://github.com/phetsims/scenery/issues/1581
        if (sceneryLog && scenery.isLoggingPerformance()) {
            const syncTreeMessage = `syncTree count: ${this.perfSyncTreeCount}`;
            if (this.perfSyncTreeCount > 500) {
                sceneryLog.PerfCritical && sceneryLog.PerfCritical(syncTreeMessage);
            } else if (this.perfSyncTreeCount > 100) {
                sceneryLog.PerfMajor && sceneryLog.PerfMajor(syncTreeMessage);
            } else if (this.perfSyncTreeCount > 20) {
                sceneryLog.PerfMinor && sceneryLog.PerfMinor(syncTreeMessage);
            } else if (this.perfSyncTreeCount > 0) {
                sceneryLog.PerfVerbose && sceneryLog.PerfVerbose(syncTreeMessage);
            }
            const drawableBlockCountMessage = `drawable block changes: ${this.perfDrawableBlockChangeCount} for` + ` -${this.perfDrawableOldIntervalCount} +${this.perfDrawableNewIntervalCount}`;
            if (this.perfDrawableBlockChangeCount > 200) {
                sceneryLog.PerfCritical && sceneryLog.PerfCritical(drawableBlockCountMessage);
            } else if (this.perfDrawableBlockChangeCount > 60) {
                sceneryLog.PerfMajor && sceneryLog.PerfMajor(drawableBlockCountMessage);
            } else if (this.perfDrawableBlockChangeCount > 10) {
                sceneryLog.PerfMinor && sceneryLog.PerfMinor(drawableBlockCountMessage);
            } else if (this.perfDrawableBlockChangeCount > 0) {
                sceneryLog.PerfVerbose && sceneryLog.PerfVerbose(drawableBlockCountMessage);
            }
        }
        PDOMTree.auditPDOMDisplays(this.rootNode);
        if (this._forceSVGRefresh || this._refreshSVGPending) {
            this._refreshSVGPending = false;
            this.refreshSVG();
        }
        sceneryLog && sceneryLog.Display && sceneryLog.pop();
    }
    // Used for Studio Autoselect to determine the leafiest PhET-iO Element under the mouse
    getPhetioElementAt(point) {
        const node = this._rootNode.getPhetioMouseHit(point);
        if (node === 'phetioNotSelectable') {
            return null;
        }
        if (node) {
            assert && assert(node.isPhetioInstrumented(), 'a PhetioMouseHit should be instrumented');
        }
        return node;
    }
    updateSize() {
        let sizeDirty = false;
        //OHTWO TODO: if we aren't clipping or setting background colors, can we get away with having a 0x0 container div and using absolutely-positioned children? https://github.com/phetsims/scenery/issues/1581
        if (this.size.width !== this._currentSize.width) {
            sizeDirty = true;
            this._currentSize.width = this.size.width;
            this._domElement.style.width = `${this.size.width}px`;
        }
        if (this.size.height !== this._currentSize.height) {
            sizeDirty = true;
            this._currentSize.height = this.size.height;
            this._domElement.style.height = `${this.size.height}px`;
        }
        if (sizeDirty && !this._allowSceneOverflow) {
            // to prevent overflow, we add a CSS clip
            //TODO: 0px => 0? https://github.com/phetsims/scenery/issues/1581
            this._domElement.style.clip = `rect(0px,${this.size.width}px,${this.size.height}px,0px)`;
        }
    }
    /**
   * Whether WebGL is allowed to be used in drawables for this Display
   */ isWebGLAllowed() {
        return this._allowWebGL;
    }
    get webglAllowed() {
        return this.isWebGLAllowed();
    }
    getRootNode() {
        return this._rootNode;
    }
    get rootNode() {
        return this.getRootNode();
    }
    getRootBackbone() {
        assert && assert(this._rootBackbone);
        return this._rootBackbone;
    }
    get rootBackbone() {
        return this.getRootBackbone();
    }
    /**
   * The dimensions of the Display's DOM element
   */ getSize() {
        return this.sizeProperty.value;
    }
    get size() {
        return this.getSize();
    }
    getBounds() {
        return this.size.toBounds();
    }
    get bounds() {
        return this.getBounds();
    }
    /**
   * Changes the size that the Display's DOM element will be after the next updateDisplay()
   */ setSize(size) {
        assert && assert(size.width % 1 === 0, 'Display.width should be an integer');
        assert && assert(size.width > 0, 'Display.width should be greater than zero');
        assert && assert(size.height % 1 === 0, 'Display.height should be an integer');
        assert && assert(size.height > 0, 'Display.height should be greater than zero');
        this.sizeProperty.value = size;
    }
    /**
   * Changes the size that the Display's DOM element will be after the next updateDisplay()
   */ setWidthHeight(width, height) {
        this.setSize(new Dimension2(width, height));
    }
    /**
   * The width of the Display's DOM element
   */ getWidth() {
        return this.size.width;
    }
    get width() {
        return this.getWidth();
    }
    set width(value) {
        this.setWidth(value);
    }
    /**
   * Sets the width that the Display's DOM element will be after the next updateDisplay(). Should be an integral value.
   */ setWidth(width) {
        if (this.getWidth() !== width) {
            this.setSize(new Dimension2(width, this.getHeight()));
        }
        return this;
    }
    /**
   * The height of the Display's DOM element
   */ getHeight() {
        return this.size.height;
    }
    get height() {
        return this.getHeight();
    }
    set height(value) {
        this.setHeight(value);
    }
    /**
   * Sets the height that the Display's DOM element will be after the next updateDisplay(). Should be an integral value.
   */ setHeight(height) {
        if (this.getHeight() !== height) {
            this.setSize(new Dimension2(this.getWidth(), height));
        }
        return this;
    }
    /**
   * Will be applied to the root DOM element on updateDisplay(), and no sooner.
   */ setBackgroundColor(color) {
        assert && assert(color === null || typeof color === 'string' || color instanceof Color);
        this._backgroundColor = color;
        return this;
    }
    set backgroundColor(value) {
        this.setBackgroundColor(value);
    }
    get backgroundColor() {
        return this.getBackgroundColor();
    }
    getBackgroundColor() {
        return this._backgroundColor;
    }
    get interactive() {
        return this._interactive;
    }
    set interactive(value) {
        if (this._accessible && value !== this._interactive) {
            this._rootPDOMInstance.peer.recursiveDisable(!value);
        }
        this._interactive = value;
        if (!this._interactive && this._input) {
            this._input.interruptPointers();
            this._input.clearBatchedEvents();
            this._input.removeTemporaryPointers();
            this._rootNode.interruptSubtreeInput();
            this.interruptInput();
        }
    }
    /**
   * Adds an overlay to the Display. Each overlay should have a .domElement (the DOM element that will be used for
   * display) and an .update() method.
   */ addOverlay(overlay) {
        this._overlays.push(overlay);
        this._domElement.appendChild(overlay.domElement);
        // ensure that the overlay is hidden from screen readers, all accessible content should be in the dom element
        // of the this._rootPDOMInstance
        overlay.domElement.setAttribute('aria-hidden', 'true');
    }
    /**
   * Removes an overlay from the display.
   */ removeOverlay(overlay) {
        this._domElement.removeChild(overlay.domElement);
        this._overlays.splice(_.indexOf(this._overlays, overlay), 1);
    }
    /**
   * Get the root accessible DOM element which represents this display and provides semantics for assistive
   * technology. If this Display is not accessible, returns null.
   */ getPDOMRootElement() {
        return this._accessible ? this._rootPDOMInstance.peer.primarySibling : null;
    }
    get pdomRootElement() {
        return this.getPDOMRootElement();
    }
    /**
   * Has this Display enabled accessibility features like PDOM creation and support.
   */ isAccessible() {
        return this._accessible;
    }
    /**
   * Returns true if the element is in the PDOM. That is only possible if the display is accessible.
   * @param element
   * @param allowRoot - If true, the root of the PDOM is also considered to be "under" the PDOM.
   */ isElementUnderPDOM(element, allowRoot) {
        if (!this._accessible) {
            return false;
        }
        const isElementContained = this.pdomRootElement.contains(element);
        const isNotRootElement = element !== this.pdomRootElement;
        // If allowRoot is true, just return if the element is contained.
        // Otherwise, also ensure it's not the root element itself.
        return allowRoot ? isElementContained : isElementContained && isNotRootElement;
    }
    /**
   * Implements a workaround that prevents DOM focus from leaving the Display in FullScreen mode. There is
   * a bug in some browsers where DOM focus can be permanently lost if tabbing out of the FullScreen element,
   * see https://github.com/phetsims/scenery/issues/883.
   */ handleFullScreenNavigation(domEvent) {
        assert && assert(this.pdomRootElement, 'There must be a PDOM to support keyboard navigation');
        if (FullScreen.isFullScreen() && KeyboardUtils.isKeyEvent(domEvent, KeyboardUtils.KEY_TAB)) {
            const rootElement = this.pdomRootElement;
            const nextElement = domEvent.shiftKey ? PDOMUtils.getPreviousFocusable(rootElement || undefined) : PDOMUtils.getNextFocusable(rootElement || undefined);
            if (nextElement === domEvent.target) {
                domEvent.preventDefault();
            }
        }
    }
    /**
   * Returns the bitmask union of all renderers (canvas/svg/dom/webgl) that are used for display, excluding
   * BackboneDrawables (which would be DOM).
   */ getUsedRenderersBitmask() {
        function renderersUnderBackbone(backbone) {
            let bitmask = 0;
            _.each(backbone.blocks, (block)=>{
                if (block instanceof DOMBlock && block.domDrawable instanceof BackboneDrawable) {
                    bitmask = bitmask | renderersUnderBackbone(block.domDrawable);
                } else {
                    bitmask = bitmask | block.renderer;
                }
            });
            return bitmask;
        }
        // only return the renderer-specific portion (no other hints, etc)
        return renderersUnderBackbone(this._rootBackbone) & Renderer.bitmaskRendererArea;
    }
    /**
   * Called from Instances that will need a transform update (for listeners and precomputation). (scenery-internal)
   *
   * @param instance
   * @param passTransform - Whether we should pass the first transform root when validating transforms (should
   * be true if the instance is transformed)
   */ markTransformRootDirty(instance, passTransform) {
        passTransform ? this._dirtyTransformRoots.push(instance) : this._dirtyTransformRootsWithoutPass.push(instance);
    }
    updateDirtyTransformRoots() {
        sceneryLog && sceneryLog.transformSystem && sceneryLog.transformSystem('updateDirtyTransformRoots');
        sceneryLog && sceneryLog.transformSystem && sceneryLog.push();
        while(this._dirtyTransformRoots.length){
            this._dirtyTransformRoots.pop().relativeTransform.updateTransformListenersAndCompute(false, false, this._frameId, true);
        }
        while(this._dirtyTransformRootsWithoutPass.length){
            this._dirtyTransformRootsWithoutPass.pop().relativeTransform.updateTransformListenersAndCompute(false, false, this._frameId, false);
        }
        sceneryLog && sceneryLog.transformSystem && sceneryLog.pop();
    }
    /**
   * (scenery-internal)
   */ markDrawableChangedBlock(drawable) {
        sceneryLog && sceneryLog.Display && sceneryLog.Display(`markDrawableChangedBlock: ${drawable.toString()}`);
        this._drawablesToChangeBlock.push(drawable);
    }
    /**
   * Marks an item for later reduceReferences() calls at the end of Display.update().
   * (scenery-internal)
   */ markForReducedReferences(item) {
        assert && assert(!!item.reduceReferences);
        this._reduceReferencesNeeded.push(item);
    }
    /**
   * (scenery-internal)
   */ markInstanceRootForDisposal(instance) {
        sceneryLog && sceneryLog.Display && sceneryLog.Display(`markInstanceRootForDisposal: ${instance.toString()}`);
        this._instanceRootsToDispose.push(instance);
    }
    /**
   * (scenery-internal)
   */ markDrawableForDisposal(drawable) {
        sceneryLog && sceneryLog.Display && sceneryLog.Display(`markDrawableForDisposal: ${drawable.toString()}`);
        this._drawablesToDispose.push(drawable);
    }
    /**
   * (scenery-internal)
   */ markDrawableForLinksUpdate(drawable) {
        this._drawablesToUpdateLinks.push(drawable);
    }
    /**
   * Add a {ChangeInterval} for the "remove change interval info" phase (we don't want to leak memory/references)
   * (scenery-internal)
   */ markChangeIntervalToDispose(changeInterval) {
        this._changeIntervalsToDispose.push(changeInterval);
    }
    updateBackgroundColor() {
        assert && assert(this._backgroundColor === null || typeof this._backgroundColor === 'string' || this._backgroundColor instanceof Color);
        const newBackgroundCSS = this._backgroundColor === null ? '' : this._backgroundColor.toCSS ? this._backgroundColor.toCSS() : this._backgroundColor;
        if (newBackgroundCSS !== this._currentBackgroundCSS) {
            this._currentBackgroundCSS = newBackgroundCSS;
            this._domElement.style.backgroundColor = newBackgroundCSS;
        }
    }
    /*---------------------------------------------------------------------------*
   * Cursors
   *----------------------------------------------------------------------------*/ updateCursor() {
        if (this._input && this._input.mouse && this._input.mouse.point) {
            if (this._input.mouse.cursor) {
                sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`set on pointer: ${this._input.mouse.cursor}`);
                this.setSceneCursor(this._input.mouse.cursor);
                return;
            }
            //OHTWO TODO: For a display, just return an instance and we can avoid the garbage collection/mutation at the cost of the linked-list traversal instead of an array https://github.com/phetsims/scenery/issues/1581
            const mouseTrail = this._rootNode.trailUnderPointer(this._input.mouse);
            if (mouseTrail) {
                for(let i = mouseTrail.getCursorCheckIndex(); i >= 0; i--){
                    const node = mouseTrail.nodes[i];
                    const cursor = node.getEffectiveCursor();
                    if (cursor) {
                        sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`${cursor} on ${node.constructor.name}#${node.id}`);
                        this.setSceneCursor(cursor);
                        return;
                    }
                }
            }
            sceneryLog && sceneryLog.Cursor && sceneryLog.Cursor(`--- for ${mouseTrail ? mouseTrail.toString() : '(no hit)'}`);
        }
        // fallback case
        this.setSceneCursor(this._defaultCursor);
    }
    /**
   * Sets the cursor to be displayed when over the Display.
   */ setElementCursor(cursor) {
        this._domElement.style.cursor = cursor;
        // In some cases, Chrome doesn't seem to respect the cursor set on the Display's domElement. If we are using the
        // full window, we can apply the workaround of controlling the body's style.
        // See https://github.com/phetsims/scenery/issues/983
        if (this._assumeFullWindow) {
            document.body.style.cursor = cursor;
        }
    }
    setSceneCursor(cursor) {
        if (cursor !== this._lastCursor) {
            this._lastCursor = cursor;
            const customCursors = CUSTOM_CURSORS[cursor];
            if (customCursors) {
                // go backwards, so the most desired cursor sticks
                for(let i = customCursors.length - 1; i >= 0; i--){
                    this.setElementCursor(customCursors[i]);
                }
            } else {
                this.setElementCursor(cursor);
            }
        }
    }
    applyCSSHacks() {
        // to use CSS3 transforms for performance, hide anything outside our bounds by default
        if (!this._allowSceneOverflow) {
            this._domElement.style.overflow = 'hidden';
        }
        // forward all pointer events
        // @ts-expect-error legacy
        this._domElement.style.msTouchAction = 'none';
        // don't allow browser to switch between font smoothing methods for text (see https://github.com/phetsims/scenery/issues/431)
        Features.setStyle(this._domElement, Features.fontSmoothing, 'antialiased');
        if (this._allowCSSHacks) {
            // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
            if (!this._listenToOnlyElement) {
                document.onselectstart = ()=>false;
                // prevent any default zooming behavior from a trackpad on IE11 and Edge, all should be handled by scenery - must
                // be on the body, doesn't prevent behavior if on the display div
                // @ts-expect-error legacy
                document.body.style.msContentZooming = 'none';
            }
            // some css hacks (inspired from https://github.com/EightMedia/hammer.js/blob/master/hammer.js).
            // modified to only apply the proper prefixed version instead of spamming all of them, and doesn't use jQuery.
            Features.setStyle(this._domElement, Features.userDrag, 'none');
            Features.setStyle(this._domElement, Features.userSelect, 'none');
            Features.setStyle(this._domElement, Features.touchAction, 'none');
            Features.setStyle(this._domElement, Features.touchCallout, 'none');
            Features.setStyle(this._domElement, Features.tapHighlightColor, 'rgba(0,0,0,0)');
        }
    }
    canvasDataURL(callback) {
        this.canvasSnapshot((canvas)=>{
            callback(canvas.toDataURL());
        });
    }
    /**
   * Renders what it can into a Canvas (so far, Canvas and SVG layers work fine)
   */ canvasSnapshot(callback) {
        const canvas = document.createElement('canvas');
        canvas.width = this.size.width;
        canvas.height = this.size.height;
        const context = canvas.getContext('2d');
        //OHTWO TODO: allow actual background color directly, not having to check the style here!!! https://github.com/phetsims/scenery/issues/1581
        this._rootNode.renderToCanvas(canvas, context, ()=>{
            callback(canvas, context.getImageData(0, 0, canvas.width, canvas.height));
        }, this.domElement.style.backgroundColor);
    }
    /**
   * TODO: reduce code duplication for handling overlays https://github.com/phetsims/scenery/issues/1581
   */ setPointerDisplayVisible(visibility) {
        const hasOverlay = !!this._pointerOverlay;
        if (visibility !== hasOverlay) {
            if (!visibility) {
                this.removeOverlay(this._pointerOverlay);
                this._pointerOverlay.dispose();
                this._pointerOverlay = null;
            } else {
                this._pointerOverlay = new PointerOverlay(this, this._rootNode);
                this.addOverlay(this._pointerOverlay);
            }
        }
    }
    /**
   * TODO: reduce code duplication for handling overlays https://github.com/phetsims/scenery/issues/1581
   */ setPointerAreaDisplayVisible(visibility) {
        const hasOverlay = !!this._pointerAreaOverlay;
        if (visibility !== hasOverlay) {
            if (!visibility) {
                this.removeOverlay(this._pointerAreaOverlay);
                this._pointerAreaOverlay.dispose();
                this._pointerAreaOverlay = null;
            } else {
                this._pointerAreaOverlay = new PointerAreaOverlay(this, this._rootNode);
                this.addOverlay(this._pointerAreaOverlay);
            }
        }
    }
    /**
   * TODO: reduce code duplication for handling overlays https://github.com/phetsims/scenery/issues/1581
   */ setHitAreaDisplayVisible(visibility) {
        const hasOverlay = !!this._hitAreaOverlay;
        if (visibility !== hasOverlay) {
            if (!visibility) {
                this.removeOverlay(this._hitAreaOverlay);
                this._hitAreaOverlay.dispose();
                this._hitAreaOverlay = null;
            } else {
                this._hitAreaOverlay = new HitAreaOverlay(this, this._rootNode);
                this.addOverlay(this._hitAreaOverlay);
            }
        }
    }
    /**
   * TODO: reduce code duplication for handling overlays https://github.com/phetsims/scenery/issues/1581
   */ setCanvasNodeBoundsVisible(visibility) {
        const hasOverlay = !!this._canvasAreaBoundsOverlay;
        if (visibility !== hasOverlay) {
            if (!visibility) {
                this.removeOverlay(this._canvasAreaBoundsOverlay);
                this._canvasAreaBoundsOverlay.dispose();
                this._canvasAreaBoundsOverlay = null;
            } else {
                this._canvasAreaBoundsOverlay = new CanvasNodeBoundsOverlay(this, this._rootNode);
                this.addOverlay(this._canvasAreaBoundsOverlay);
            }
        }
    }
    /**
   * TODO: reduce code duplication for handling overlays https://github.com/phetsims/scenery/issues/1581
   */ setFittedBlockBoundsVisible(visibility) {
        const hasOverlay = !!this._fittedBlockBoundsOverlay;
        if (visibility !== hasOverlay) {
            if (!visibility) {
                this.removeOverlay(this._fittedBlockBoundsOverlay);
                this._fittedBlockBoundsOverlay.dispose();
                this._fittedBlockBoundsOverlay = null;
            } else {
                this._fittedBlockBoundsOverlay = new FittedBlockBoundsOverlay(this, this._rootNode);
                this.addOverlay(this._fittedBlockBoundsOverlay);
            }
        }
    }
    /**
   * Sets up the Display to resize to whatever the window inner dimensions will be.
   */ resizeOnWindowResize() {
        const resizer = ()=>{
            this.setWidthHeight(window.innerWidth, window.innerHeight); // eslint-disable-line phet/bad-sim-text
        };
        window.addEventListener('resize', resizer);
        resizer();
    }
    /**
   * Updates on every request animation frame. If stepCallback is passed in, it is called before updateDisplay() with
   * stepCallback( timeElapsedInSeconds )
   */ updateOnRequestAnimationFrame(stepCallback) {
        // keep track of how much time elapsed over the last frame
        let lastTime = 0;
        let timeElapsedInSeconds = 0;
        const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
        (function step() {
            // @ts-expect-error LEGACY --- it would know to update just the DOM element's location if it's the second argument
            self._requestAnimationFrameID = window.requestAnimationFrame(step, self._domElement);
            // calculate how much time has elapsed since we rendered the last frame
            const timeNow = Date.now();
            if (lastTime !== 0) {
                timeElapsedInSeconds = (timeNow - lastTime) / 1000.0;
            }
            lastTime = timeNow;
            // step the timer that drives any time dependent updates of the Display
            stepTimer.emit(timeElapsedInSeconds);
            stepCallback && stepCallback(timeElapsedInSeconds);
            self.updateDisplay();
        })();
    }
    cancelUpdateOnRequestAnimationFrame() {
        this._requestAnimationFrameID !== null && window.cancelAnimationFrame(this._requestAnimationFrameID);
    }
    /**
   * Initializes event handling, and connects the browser's input event handlers to notify this Display of events.
   *
   * NOTE: This can be reversed with detachEvents().
   */ initializeEvents(options) {
        assert && assert(!this._input, 'Events cannot be attached twice to a display (for now)');
        // TODO: refactor here https://github.com/phetsims/scenery/issues/1581
        const input = new Input(this, !this._listenToOnlyElement, this._batchDOMEvents, this._assumeFullWindow, this._passiveEvents, options);
        this._input = input;
        input.connectListeners();
    }
    /**
   * Detach already-attached input event handling (from initializeEvents()).
   */ detachEvents() {
        assert && assert(this._input, 'detachEvents() should be called only when events are attached');
        this._input.disconnectListeners();
        this._input = null;
    }
    /**
   * Adds an input listener.
   */ addInputListener(listener) {
        assert && assert(!_.includes(this._inputListeners, listener), 'Input listener already registered on this Display');
        // don't allow listeners to be added multiple times
        if (!_.includes(this._inputListeners, listener)) {
            this._inputListeners.push(listener);
        }
        return this;
    }
    /**
   * Removes an input listener that was previously added with addInputListener.
   */ removeInputListener(listener) {
        // ensure the listener is in our list
        assert && assert(_.includes(this._inputListeners, listener));
        this._inputListeners.splice(_.indexOf(this._inputListeners, listener), 1);
        return this;
    }
    /**
   * Returns whether this input listener is currently listening to this Display.
   *
   * More efficient than checking display.inputListeners, as that includes a defensive copy.
   */ hasInputListener(listener) {
        for(let i = 0; i < this._inputListeners.length; i++){
            if (this._inputListeners[i] === listener) {
                return true;
            }
        }
        return false;
    }
    /**
   * Returns a copy of all of our input listeners.
   */ getInputListeners() {
        return this._inputListeners.slice(0); // defensive copy
    }
    get inputListeners() {
        return this.getInputListeners();
    }
    /**
   * Interrupts all input listeners that are attached to this Display.
   */ interruptInput() {
        const listenersCopy = this.inputListeners;
        for(let i = 0; i < listenersCopy.length; i++){
            const listener = listenersCopy[i];
            listener.interrupt && listener.interrupt();
        }
        return this;
    }
    /**
   * Interrupts all pointers associated with this Display, see https://github.com/phetsims/scenery/issues/1582.
   */ interruptPointers() {
        this._input && this._input.interruptPointers();
        return this;
    }
    /**
   * Interrupts all pointers associated with this Display that are NOT currently having events executed.
   * see https://github.com/phetsims/scenery/issues/1582.
   *
   * If excludePointer is provided and is non-null, it's used as the "current" pointer that should be excluded from
   * interruption.
   */ interruptOtherPointers(excludePointer = null) {
        var _this__input_currentSceneryEvent;
        this._input && this._input.interruptPointers(excludePointer || ((_this__input_currentSceneryEvent = this._input.currentSceneryEvent) == null ? void 0 : _this__input_currentSceneryEvent.pointer) || null);
        return this;
    }
    /**
   * (scenery-internal)
   */ ensureNotPainting() {
        assert && assert(!this._isPainting, 'This should not be run in the call tree of updateDisplay(). If you see this, it is likely that either the ' + 'last updateDisplay() had a thrown error and it is trying to be run again (in which case, investigate that ' + 'error), OR code was run/triggered from inside an updateDisplay() that has the potential to cause an infinite ' + 'loop, e.g. CanvasNode paintCanvas() call manipulating another Node, or a bounds listener that Scenery missed.');
    }
    /**
   * Triggers a loss of context for all WebGL blocks.
   *
   * NOTE: Should generally only be used for debugging.
   */ loseWebGLContexts() {
        (function loseBackbone(backbone) {
            if (backbone.blocks) {
                backbone.blocks.forEach((block)=>{
                    const gl = block.gl;
                    if (gl) {
                        Utils.loseContext(gl);
                    }
                    //TODO: pattern for this iteration https://github.com/phetsims/scenery/issues/1581
                    for(let drawable = block.firstDrawable; drawable !== null; drawable = drawable.nextDrawable){
                        loseBackbone(drawable);
                        if (drawable === block.lastDrawable) {
                            break;
                        }
                    }
                });
            }
        })(this._rootBackbone);
    }
    /**
   * Makes this Display available for inspection.
   */ inspect() {
        localStorage.scenerySnapshot = JSON.stringify(scenerySerialize(this));
    }
    /**
   * Returns an HTML fragment that includes a large amount of debugging information, including a view of the
   * instance tree and drawable tree.
   */ getDebugHTML() {
        const headerStyle = 'font-weight: bold; font-size: 120%; margin-top: 5px;';
        let depth = 0;
        let result = '';
        result += `<div style="${headerStyle}">Display (${this.id}) Summary</div>`;
        result += `${this.size.toString()} frame:${this._frameId} input:${!!this._input} cursor:${this._lastCursor}<br/>`;
        function nodeCount(node) {
            let count = 1; // for us
            for(let i = 0; i < node.children.length; i++){
                count += nodeCount(node.children[i]);
            }
            return count;
        }
        result += `Nodes: ${nodeCount(this._rootNode)}<br/>`;
        function instanceCount(instance) {
            let count = 1; // for us
            for(let i = 0; i < instance.children.length; i++){
                count += instanceCount(instance.children[i]);
            }
            return count;
        }
        result += this._baseInstance ? `Instances: ${instanceCount(this._baseInstance)}<br/>` : '';
        function drawableCount(drawable) {
            let count = 1; // for us
            if (drawable.blocks) {
                // we're a backbone
                _.each(drawable.blocks, (childDrawable)=>{
                    count += drawableCount(childDrawable);
                });
            } else if (drawable.firstDrawable && drawable.lastDrawable) {
                // we're a block
                for(let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable){
                    count += drawableCount(childDrawable);
                }
                count += drawableCount(drawable.lastDrawable);
            }
            return count;
        }
        // @ts-expect-error TODO BackboneDrawable https://github.com/phetsims/scenery/issues/1581
        result += this._rootBackbone ? `Drawables: ${drawableCount(this._rootBackbone)}<br/>` : '';
        const drawableCountMap = {}; // {string} drawable constructor name => {number} count of seen
        // increment the count in our map
        function countRetainedDrawable(drawable) {
            const name = drawable.constructor.name;
            if (drawableCountMap[name]) {
                drawableCountMap[name]++;
            } else {
                drawableCountMap[name] = 1;
            }
        }
        function retainedDrawableCount(instance) {
            let count = 0;
            if (instance.selfDrawable) {
                countRetainedDrawable(instance.selfDrawable);
                count++;
            }
            if (instance.groupDrawable) {
                countRetainedDrawable(instance.groupDrawable);
                count++;
            }
            if (instance.sharedCacheDrawable) {
                // @ts-expect-error TODO Instance https://github.com/phetsims/scenery/issues/1581
                countRetainedDrawable(instance.sharedCacheDrawable);
                count++;
            }
            for(let i = 0; i < instance.children.length; i++){
                count += retainedDrawableCount(instance.children[i]);
            }
            return count;
        }
        result += this._baseInstance ? `Retained Drawables: ${retainedDrawableCount(this._baseInstance)}<br/>` : '';
        for(const drawableName in drawableCountMap){
            result += `&nbsp;&nbsp;&nbsp;&nbsp;${drawableName}: ${drawableCountMap[drawableName]}<br/>`;
        }
        function blockSummary(block) {
            // ensure we are a block
            if (!block.firstDrawable || !block.lastDrawable) {
                return '';
            }
            // @ts-expect-error TODO display stuff https://github.com/phetsims/scenery/issues/1581
            const hasBackbone = block.domDrawable && block.domDrawable.blocks;
            let div = `<div style="margin-left: ${depth * 20}px">`;
            div += block.toString();
            if (!hasBackbone) {
                div += ` (${block.drawableCount} drawables)`;
            }
            div += '</div>';
            depth += 1;
            if (hasBackbone) {
                // @ts-expect-error TODO display stuff https://github.com/phetsims/scenery/issues/1581
                for(let k = 0; k < block.domDrawable.blocks.length; k++){
                    // @ts-expect-error TODO display stuff https://github.com/phetsims/scenery/issues/1581
                    div += blockSummary(block.domDrawable.blocks[k]);
                }
            }
            depth -= 1;
            return div;
        }
        if (this._rootBackbone) {
            result += `<div style="${headerStyle}">Block Summary</div>`;
            for(let i = 0; i < this._rootBackbone.blocks.length; i++){
                result += blockSummary(this._rootBackbone.blocks[i]);
            }
        }
        function instanceSummary(instance) {
            let iSummary = '';
            function addQualifier(text) {
                iSummary += ` <span style="color: #008">${text}</span>`;
            }
            const node = instance.node;
            iSummary += instance.id;
            iSummary += ` ${node.constructor.name ? node.constructor.name : '?'}`;
            iSummary += ` <span style="font-weight: ${node.isPainted() ? 'bold' : 'normal'}">${node.id}</span>`;
            iSummary += node.getDebugHTMLExtras();
            if (!node.visible) {
                addQualifier('invis');
            }
            if (!instance.visible) {
                addQualifier('I-invis');
            }
            if (!instance.relativeVisible) {
                addQualifier('I-rel-invis');
            }
            if (!instance.selfVisible) {
                addQualifier('I-self-invis');
            }
            if (!instance.fittability.ancestorsFittable) {
                addQualifier('nofit-ancestor');
            }
            if (!instance.fittability.selfFittable) {
                addQualifier('nofit-self');
            }
            if (node.pickable === true) {
                addQualifier('pickable');
            }
            if (node.pickable === false) {
                addQualifier('unpickable');
            }
            if (instance.trail.isPickable()) {
                addQualifier('<span style="color: #808">hits</span>');
            }
            if (node.getEffectiveCursor()) {
                addQualifier(`effectiveCursor:${node.getEffectiveCursor()}`);
            }
            if (node.clipArea) {
                addQualifier('clipArea');
            }
            if (node.mouseArea) {
                addQualifier('mouseArea');
            }
            if (node.touchArea) {
                addQualifier('touchArea');
            }
            if (node.getInputListeners().length) {
                addQualifier('inputListeners');
            }
            if (node.getRenderer()) {
                addQualifier(`renderer:${node.getRenderer()}`);
            }
            if (node.isLayerSplit()) {
                addQualifier('layerSplit');
            }
            if (node.opacity < 1) {
                addQualifier(`opacity:${node.opacity}`);
            }
            if (node.disabledOpacity < 1) {
                addQualifier(`disabledOpacity:${node.disabledOpacity}`);
            }
            if (node._boundsEventCount > 0) {
                addQualifier(`<span style="color: #800">boundsListen:${node._boundsEventCount}:${node._boundsEventSelfCount}</span>`);
            }
            let transformType = '';
            switch(node.transform.getMatrix().type){
                case Matrix3Type.IDENTITY:
                    transformType = '';
                    break;
                case Matrix3Type.TRANSLATION_2D:
                    transformType = 'translated';
                    break;
                case Matrix3Type.SCALING:
                    transformType = 'scale';
                    break;
                case Matrix3Type.AFFINE:
                    transformType = 'affine';
                    break;
                case Matrix3Type.OTHER:
                    transformType = 'other';
                    break;
                default:
                    throw new Error(`invalid matrix type: ${node.transform.getMatrix().type}`);
            }
            if (transformType) {
                iSummary += ` <span style="color: #88f" title="${node.transform.getMatrix().toString().replace('\n', '&#10;')}">${transformType}</span>`;
            }
            iSummary += ` <span style="color: #888">[Trail ${instance.trail.indices.join('.')}]</span>`;
            // iSummary += ` <span style="color: #c88">${str( instance.state )}</span>`;
            iSummary += ` <span style="color: #8c8">${node._rendererSummary.bitmask.toString(16)}${node._rendererBitmask !== Renderer.bitmaskNodeDefault ? ` (${node._rendererBitmask.toString(16)})` : ''}</span>`;
            return iSummary;
        }
        function drawableSummary(drawable) {
            let drawableString = drawable.toString();
            if (drawable.visible) {
                drawableString = `<strong>${drawableString}</strong>`;
            }
            if (drawable.dirty) {
                drawableString += drawable.dirty ? ' <span style="color: #c00;">[x]</span>' : '';
            }
            if (!drawable.fittable) {
                drawableString += drawable.dirty ? ' <span style="color: #0c0;">[no-fit]</span>' : '';
            }
            return drawableString;
        }
        function printInstanceSubtree(instance) {
            let div = `<div style="margin-left: ${depth * 20}px">`;
            function addDrawable(name, drawable) {
                div += ` <span style="color: #888">${name}:${drawableSummary(drawable)}</span>`;
            }
            div += instanceSummary(instance);
            instance.selfDrawable && addDrawable('self', instance.selfDrawable);
            instance.groupDrawable && addDrawable('group', instance.groupDrawable);
            // @ts-expect-error TODO Instance https://github.com/phetsims/scenery/issues/1581
            instance.sharedCacheDrawable && addDrawable('sharedCache', instance.sharedCacheDrawable);
            div += '</div>';
            result += div;
            depth += 1;
            _.each(instance.children, (childInstance)=>{
                printInstanceSubtree(childInstance);
            });
            depth -= 1;
        }
        if (this._baseInstance) {
            result += `<div style="${headerStyle}">Root Instance Tree</div>`;
            printInstanceSubtree(this._baseInstance);
        }
        _.each(this._sharedCanvasInstances, (instance)=>{
            result += `<div style="${headerStyle}">Shared Canvas Instance Tree</div>`;
            printInstanceSubtree(instance);
        });
        function printDrawableSubtree(drawable) {
            let div = `<div style="margin-left: ${depth * 20}px">`;
            div += drawableSummary(drawable);
            if (drawable.instance) {
                div += ` <span style="color: #0a0;">(${drawable.instance.trail.toPathString()})</span>`;
                div += `&nbsp;&nbsp;&nbsp;${instanceSummary(drawable.instance)}`;
            } else if (drawable.backboneInstance) {
                div += ` <span style="color: #a00;">(${drawable.backboneInstance.trail.toPathString()})</span>`;
                div += `&nbsp;&nbsp;&nbsp;${instanceSummary(drawable.backboneInstance)}`;
            }
            div += '</div>';
            result += div;
            if (drawable.blocks) {
                // we're a backbone
                depth += 1;
                _.each(drawable.blocks, (childDrawable)=>{
                    printDrawableSubtree(childDrawable);
                });
                depth -= 1;
            } else if (drawable.firstDrawable && drawable.lastDrawable) {
                // we're a block
                depth += 1;
                for(let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable){
                    printDrawableSubtree(childDrawable);
                }
                printDrawableSubtree(drawable.lastDrawable); // wasn't hit in our simplified (and safer) loop
                depth -= 1;
            }
        }
        if (this._rootBackbone) {
            result += '<div style="font-weight: bold;">Root Drawable Tree</div>';
            // @ts-expect-error TODO BackboneDrawable https://github.com/phetsims/scenery/issues/1581
            printDrawableSubtree(this._rootBackbone);
        }
        //OHTWO TODO: add shared cache drawable trees https://github.com/phetsims/scenery/issues/1581
        return result;
    }
    /**
   * Returns the getDebugHTML() information, but wrapped into a full HTML page included in a data URI.
   */ getDebugURI() {
        return `data:text/html;charset=utf-8,${encodeURIComponent(`${'<!DOCTYPE html>' + '<html lang="en">' + '<head><title>Scenery Debug Snapshot</title></head>' + '<body style="font-size: 12px;">'}${this.getDebugHTML()}</body>` + '</html>')}`;
    }
    /**
   * Attempts to open a popup with the getDebugHTML() information.
   */ popupDebug() {
        window.open(this.getDebugURI());
    }
    /**
   * Attempts to open an iframe popup with the getDebugHTML() information in the same window. This is similar to
   * popupDebug(), but should work in browsers that block popups, or prevent that type of data URI being opened.
   */ iframeDebug() {
        const iframe = document.createElement('iframe');
        iframe.width = '' + window.innerWidth; // eslint-disable-line phet/bad-sim-text
        iframe.height = '' + window.innerHeight; // eslint-disable-line phet/bad-sim-text
        iframe.style.position = 'absolute';
        iframe.style.left = '0';
        iframe.style.top = '0';
        iframe.style.zIndex = '10000';
        document.body.appendChild(iframe);
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(this.getDebugHTML());
        iframe.contentWindow.document.close();
        iframe.contentWindow.document.body.style.background = 'white';
        const closeButton = document.createElement('button');
        closeButton.style.position = 'absolute';
        closeButton.style.top = '0';
        closeButton.style.right = '0';
        closeButton.style.zIndex = '10001';
        document.body.appendChild(closeButton);
        closeButton.textContent = 'close';
        // A normal 'click' event listener doesn't seem to be working. This is less-than-ideal.
        [
            'pointerdown',
            'click',
            'touchdown'
        ].forEach((eventType)=>{
            closeButton.addEventListener(eventType, ()=>{
                document.body.removeChild(iframe);
                document.body.removeChild(closeButton);
            }, true);
        });
    }
    getPDOMDebugHTML() {
        let result = '';
        const headerStyle = 'font-weight: bold; font-size: 120%; margin-top: 5px;';
        const indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
        result += `<div style="${headerStyle}">Accessible Instances</div><br>`;
        recurse(this._rootPDOMInstance, '');
        function recurse(instance, indentation) {
            result += `${indentation + escapeHTML(`${instance.isRootInstance ? '' : instance.node.tagName} ${instance.toString()}`)}<br>`;
            instance.children.forEach((child)=>{
                recurse(child, indentation + indent);
            });
        }
        result += `<br><div style="${headerStyle}">Parallel DOM</div><br>`;
        let parallelDOM = this._rootPDOMInstance.peer.primarySibling.outerHTML;
        parallelDOM = parallelDOM.replace(/></g, '>\n<');
        const lines = parallelDOM.split('\n');
        let indentation = '';
        for(let i = 0; i < lines.length; i++){
            const line = lines[i];
            const isEndTag = line.startsWith('</');
            if (isEndTag) {
                indentation = indentation.slice(indent.length);
            }
            result += `${indentation + escapeHTML(line)}<br>`;
            if (!isEndTag) {
                indentation += indent;
            }
        }
        return result;
    }
    /**
   * Will attempt to call callback( {string} dataURI ) with the rasterization of the entire Display's DOM structure,
   * used for internal testing. Will call-back null if there was an error
   *
   * Only tested on recent Chrome and Firefox, not recommended for general use. Guaranteed not to work for IE <= 10.
   *
   * See https://github.com/phetsims/scenery/issues/394 for some details.
   */ foreignObjectRasterization(callback) {
        // Scan our drawable tree for Canvases. We'll rasterize them here (to data URLs) so we can replace them later in
        // the HTML tree (with images) before putting that in the foreignObject. That way, we can actually display
        // things rendered in Canvas in our rasterization.
        const canvasUrlMap = {};
        let unknownIds = 0;
        function addCanvas(canvas) {
            if (!canvas.id) {
                canvas.id = `unknown-canvas-${unknownIds++}`;
            }
            canvasUrlMap[canvas.id] = canvas.toDataURL();
        }
        function scanForCanvases(drawable) {
            if (drawable instanceof BackboneDrawable) {
                // we're a backbone
                _.each(drawable.blocks, (childDrawable)=>{
                    scanForCanvases(childDrawable);
                });
            } else if (drawable instanceof Block && drawable.firstDrawable && drawable.lastDrawable) {
                // we're a block
                for(let childDrawable = drawable.firstDrawable; childDrawable !== drawable.lastDrawable; childDrawable = childDrawable.nextDrawable){
                    scanForCanvases(childDrawable);
                }
                scanForCanvases(drawable.lastDrawable); // wasn't hit in our simplified (and safer) loop
                if ((drawable instanceof CanvasBlock || drawable instanceof WebGLBlock) && drawable.canvas && drawable.canvas instanceof window.HTMLCanvasElement) {
                    addCanvas(drawable.canvas);
                }
            }
            if (DOMDrawable && drawable instanceof DOMDrawable) {
                if (drawable.domElement instanceof window.HTMLCanvasElement) {
                    addCanvas(drawable.domElement);
                }
                Array.prototype.forEach.call(drawable.domElement.getElementsByTagName('canvas'), (canvas)=>{
                    addCanvas(canvas);
                });
            }
        }
        // @ts-expect-error TODO BackboneDrawable https://github.com/phetsims/scenery/issues/1581
        scanForCanvases(this._rootBackbone);
        // Create a new document, so that we can (1) serialize it to XHTML, and (2) manipulate it independently.
        // Inspired by http://cburgmer.github.io/rasterizeHTML.js/
        const doc = document.implementation.createHTMLDocument('');
        doc.documentElement.innerHTML = this.domElement.outerHTML;
        doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);
        // Hide the PDOM
        doc.documentElement.appendChild(document.createElement('style')).innerHTML = `.${PDOMSiblingStyle.ROOT_CLASS_NAME} { display:none; } `;
        // Replace each <canvas> with an <img> that has src=canvas.toDataURL() and the same style
        let displayCanvases = doc.documentElement.getElementsByTagName('canvas');
        displayCanvases = Array.prototype.slice.call(displayCanvases); // don't use a live HTMLCollection copy!
        for(let i = 0; i < displayCanvases.length; i++){
            const displayCanvas = displayCanvases[i];
            const cssText = displayCanvas.style.cssText;
            const displayImg = doc.createElement('img');
            const src = canvasUrlMap[displayCanvas.id];
            assert && assert(src, 'Must have missed a toDataURL() on a Canvas');
            displayImg.src = src;
            displayImg.setAttribute('style', cssText);
            displayCanvas.parentNode.replaceChild(displayImg, displayCanvas);
        }
        const displayWidth = this.width;
        const displayHeight = this.height;
        const completeFunction = ()=>{
            Display.elementToSVGDataURL(doc.documentElement, displayWidth, displayHeight, callback);
        };
        // Convert each <image>'s xlink:href so that it's a data URL with the relevant data, e.g.
        // <image ... xlink:href="http://localhost:8080/scenery-phet/images/batteryDCell.png?bust=1476308407988"/>
        // gets replaced with a data URL.
        // See https://github.com/phetsims/scenery/issues/573
        let replacedImages = 0; // Count how many images get replaced. We'll decrement with each finished image.
        let hasReplacedImages = false; // Whether any images are replaced
        const displaySVGImages = Array.prototype.slice.call(doc.documentElement.getElementsByTagName('image'));
        for(let j = 0; j < displaySVGImages.length; j++){
            const displaySVGImage = displaySVGImages[j];
            const currentHref = displaySVGImage.getAttribute('xlink:href');
            if (currentHref.slice(0, 5) !== 'data:') {
                replacedImages++;
                hasReplacedImages = true;
                (()=>{
                    // Closure variables need to be stored for each individual SVG image.
                    const refImage = new window.Image();
                    const svgImage = displaySVGImage;
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    refImage.onload = ()=>{
                        // Get a Canvas
                        const refCanvas = document.createElement('canvas');
                        refCanvas.width = refImage.width;
                        refCanvas.height = refImage.height;
                        const refContext = refCanvas.getContext('2d');
                        // Draw the (now loaded) image into the Canvas
                        refContext.drawImage(refImage, 0, 0);
                        // Replace the <image>'s href with the Canvas' data.
                        svgImage.setAttribute('xlink:href', refCanvas.toDataURL());
                        // If it's the last replaced image, go to the next step
                        if (--replacedImages === 0) {
                            completeFunction();
                        }
                        assert && assert(replacedImages >= 0);
                    };
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    refImage.onerror = ()=>{
                        // NOTE: not much we can do, leave this element alone.
                        // If it's the last replaced image, go to the next step
                        if (--replacedImages === 0) {
                            completeFunction();
                        }
                        assert && assert(replacedImages >= 0);
                    };
                    // Kick off loading of the image.
                    refImage.src = currentHref;
                })();
            }
        }
        // If no images are replaced, we need to call our callback through this route.
        if (!hasReplacedImages) {
            completeFunction();
        }
    }
    popupRasterization() {
        this.foreignObjectRasterization((url)=>{
            if (url) {
                window.open(url);
            }
        });
    }
    /**
   * Will return null if the string of indices isn't part of the PDOMInstance tree
   */ getTrailFromPDOMIndicesString(indicesString) {
        // No PDOMInstance tree if the display isn't accessible
        if (!this._rootPDOMInstance) {
            return null;
        }
        let instance = this._rootPDOMInstance;
        const indexStrings = indicesString.split(PDOMUtils.PDOM_UNIQUE_ID_SEPARATOR);
        for(let i = 0; i < indexStrings.length; i++){
            const digit = Number(indexStrings[i]);
            instance = instance.children[digit];
            if (!instance) {
                return null;
            }
        }
        return instance && instance.trail ? instance.trail : null;
    }
    /**
   * Forces SVG elements to have their visual contents refreshed, by changing state in a non-visually-apparent way.
   * It should trick browsers into re-rendering the SVG elements.
   *
   * See https://github.com/phetsims/scenery/issues/1507
   */ refreshSVG() {
        this._refreshSVGEmitter.emit();
    }
    /**
   * Similar to refreshSVG (see docs above), but will do so on the next frame.
   */ refreshSVGOnNextFrame() {
        this._refreshSVGPending = true;
    }
    /**
   * Releases references.
   *
   * TODO: this dispose function is not complete. https://github.com/phetsims/scenery/issues/1581
   */ dispose() {
        if (assert) {
            assert(!this._isDisposing);
            assert(!this._isDisposed);
            this._isDisposing = true;
        }
        if (this._input) {
            this.detachEvents();
        }
        this._rootNode.removeRootedDisplay(this);
        if (this._accessible) {
            assert && assert(this._boundHandleFullScreenNavigation, '_boundHandleFullScreenNavigation was not added to the keyStateTracker');
            globalKeyStateTracker.keydownEmitter.removeListener(this._boundHandleFullScreenNavigation);
            this._rootPDOMInstance.dispose();
        }
        this._focusOverlay && this._focusOverlay.dispose();
        this.sizeProperty.dispose();
        // Will immediately dispose recursively, all Instances AND their attached drawables, which will include the
        // rootBackbone.
        this._baseInstance && this._baseInstance.dispose();
        this.descriptionUtteranceQueue.dispose();
        this.focusManager && this.focusManager.dispose();
        this.cancelUpdateOnRequestAnimationFrame();
        if (assert) {
            this._isDisposing = false;
            this._isDisposed = true;
        }
    }
    /**
   * Takes a given DOM element, and asynchronously renders it to a string that is a data URL representing an SVG
   * file.
   *
   * @param domElement
   * @param width - The width of the output SVG
   * @param height - The height of the output SVG
   * @param callback - Called as callback( url: {string} ), where the URL will be the encoded SVG file.
   */ static elementToSVGDataURL(domElement, width, height, callback) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        // Serialize it to XHTML that can be used in foreignObject (HTML can't be)
        const xhtml = new window.XMLSerializer().serializeToString(domElement);
        // Create an SVG container with a foreignObject.
        const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` + '<foreignObject width="100%" height="100%">' + `<div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>` + '</foreignObject>' + '</svg>';
        // Load an <img> with the SVG data URL, and when loaded draw it into our Canvas
        const img = new window.Image();
        img.onload = ()=>{
            context.drawImage(img, 0, 0);
            callback(canvas.toDataURL()); // Endpoint here
        };
        img.onerror = ()=>{
            callback(null);
        };
        // We can't btoa() arbitrary unicode, so we need another solution,
        // see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
        // @ts-expect-error - Exterior lib
        const uint8array = new TextEncoderLite('utf-8').encode(data); // eslint-disable-line no-undef
        // @ts-expect-error - fromByteArray Exterior lib
        const base64 = fromByteArray(uint8array); // eslint-disable-line no-undef
        // turn it to base64 and wrap it in the data URL format
        img.src = `data:image/svg+xml;base64,${base64}`;
    }
    /**
   * Returns true when NO nodes in the subtree are disposed.
   */ static assertSubtreeDisposed(node) {
        assert && assert(!node.isDisposed, 'Disposed nodes should not be included in a scene graph to display.');
        if (assert) {
            for(let i = 0; i < node.children.length; i++){
                Display.assertSubtreeDisposed(node.children[i]);
            }
        }
    }
    /**
   * Adds an input listener to be fired for ANY Display
   */ static addInputListener(listener) {
        assert && assert(!_.includes(Display.inputListeners, listener), 'Input listener already registered');
        // don't allow listeners to be added multiple times
        if (!_.includes(Display.inputListeners, listener)) {
            Display.inputListeners.push(listener);
        }
    }
    /**
   * Removes an input listener that was previously added with Display.addInputListener.
   */ static removeInputListener(listener) {
        // ensure the listener is in our list
        assert && assert(_.includes(Display.inputListeners, listener));
        Display.inputListeners.splice(_.indexOf(Display.inputListeners, listener), 1);
    }
    /**
   * Interrupts all input listeners that are attached to all Displays.
   */ static interruptInput() {
        const listenersCopy = Display.inputListeners.slice(0);
        for(let i = 0; i < listenersCopy.length; i++){
            const listener = listenersCopy[i];
            listener.interrupt && listener.interrupt();
        }
    }
    /**
   * Constructs a Display that will show the rootNode and its subtree in a visual state. Default options provided below
   *
   * @param rootNode - Displays this node and all of its descendants
   * @param [providedOptions]
   */ constructor(rootNode, providedOptions){
        // Used for shortcut animation frame functions
        this._requestAnimationFrameID = null;
        // (scenery-internal) When fired, forces an SVG refresh, to try to work around issues
        // like https://github.com/phetsims/scenery/issues/1507
        this._refreshSVGEmitter = new Emitter();
        // If true, we will refresh the SVG elements on the next frame
        this._refreshSVGPending = false;
        assert && assert(rootNode, 'rootNode is a required parameter');
        //OHTWO TODO: hybrid batching (option to batch until an event like 'up' that might be needed for security issues) https://github.com/phetsims/scenery/issues/1581
        const options = optionize()({
            // {number} - Initial display width
            width: providedOptions && providedOptions.container && providedOptions.container.clientWidth || 640,
            // {number} - Initial display height
            height: providedOptions && providedOptions.container && providedOptions.container.clientHeight || 480,
            // {boolean} - Applies CSS styles to the root DOM element that make it amenable to interactive content
            allowCSSHacks: true,
            allowSafariRedrawWorkaround: false,
            // {boolean} - Usually anything displayed outside of our dom element is hidden with CSS overflow
            allowSceneOverflow: false,
            allowLayerFitting: false,
            forceSVGRefresh: false,
            // {string} - What cursor is used when no other cursor is specified
            defaultCursor: 'default',
            // {ColorDef} - Initial background color
            backgroundColor: null,
            // {boolean} - Whether WebGL will preserve the drawing buffer
            preserveDrawingBuffer: false,
            // {boolean} - Whether WebGL is enabled at all for drawables in this Display
            allowWebGL: true,
            // {boolean} - Enables accessibility features
            accessibility: true,
            // {boolean} - See declaration.
            supportsInteractiveHighlights: false,
            // {boolean} - Whether mouse/touch/keyboard inputs are enabled (if input has been added).
            interactive: true,
            // {boolean} - If true, input event listeners will be attached to the Display's DOM element instead of the window.
            // Normally, attaching listeners to the window is preferred (it will see mouse moves/ups outside of the browser
            // window, allowing correct button tracking), however there may be instances where a global listener is not
            // preferred.
            listenToOnlyElement: false,
            // {boolean} - Forwarded to Input: If true, most event types will be batched until otherwise triggered.
            batchDOMEvents: false,
            // {boolean} - If true, the input event location (based on the top-left of the browser tab's viewport, with no
            // scaling applied) will be used. Usually, this is not a safe assumption, so when false the location of the
            // display's DOM element will be used to get the correct event location. There is a slight performance hit to
            // doing so, thus this option is provided if the top-left location can be guaranteed.
            // NOTE: Rotation of the Display's DOM element (e.g. with a CSS transform) will result in an incorrect event
            //       mapping, as getBoundingClientRect() can't work with this. getBoxQuads() should fix this when browser
            //       support is available.
            assumeFullWindow: false,
            // {boolean} - Whether Scenery will try to aggressively re-create WebGL Canvas/context instead of waiting for
            // a context restored event. Sometimes context losses can occur without a restoration afterwards, but this can
            // jump-start the process.
            // See https://github.com/phetsims/scenery/issues/347.
            aggressiveContextRecreation: true,
            // {boolean|null} - Whether the `passive` flag should be set when adding and removing DOM event listeners.
            // See https://github.com/phetsims/scenery/issues/770 for more details.
            // If it is true or false, that is the value of the passive flag that will be used. If it is null, the default
            // behavior of the browser will be used.
            //
            // Safari doesn't support touch-action: none, so we NEED to not use passive events (which would not allow
            // preventDefault to do anything, so drags actually can scroll the sim).
            // Chrome also did the same "passive by default", but because we have `touch-action: none` in place, it doesn't
            // affect us, and we can potentially get performance improvements by allowing passive events.
            // See https://github.com/phetsims/scenery/issues/770 for more information.
            passiveEvents: platform.safari ? false : null,
            // {boolean} - Whether, if no WebGL antialiasing is detected, the backing scale can be increased so as to
            //             provide some antialiasing benefit. See https://github.com/phetsims/scenery/issues/859.
            allowBackingScaleAntialiasing: true
        }, providedOptions);
        this.id = globalIdCounter++;
        this._accessible = options.accessibility;
        this._preserveDrawingBuffer = options.preserveDrawingBuffer;
        this._allowWebGL = options.allowWebGL;
        this._allowCSSHacks = options.allowCSSHacks;
        this._allowSceneOverflow = options.allowSceneOverflow;
        this._defaultCursor = options.defaultCursor;
        this.sizeProperty = new TinyProperty(new Dimension2(options.width, options.height));
        this._currentSize = new Dimension2(-1, -1);
        this._rootNode = rootNode;
        this._rootNode.addRootedDisplay(this);
        this._rootBackbone = null; // to be filled in later
        this._domElement = options.container ? BackboneDrawable.repurposeBackboneContainer(options.container) : BackboneDrawable.createDivBackbone();
        this._sharedCanvasInstances = {};
        this._baseInstance = null; // will be filled with the root Instance
        this._frameId = 0;
        this._dirtyTransformRoots = [];
        this._dirtyTransformRootsWithoutPass = [];
        this._instanceRootsToDispose = [];
        this._reduceReferencesNeeded = [];
        this._drawablesToDispose = [];
        this._drawablesToChangeBlock = [];
        this._drawablesToUpdateLinks = [];
        this._changeIntervalsToDispose = [];
        this._lastCursor = null;
        this._currentBackgroundCSS = null;
        this._backgroundColor = null;
        this._input = null;
        this._inputListeners = [];
        this._interactive = options.interactive;
        this._listenToOnlyElement = options.listenToOnlyElement;
        this._batchDOMEvents = options.batchDOMEvents;
        this._assumeFullWindow = options.assumeFullWindow;
        this._passiveEvents = options.passiveEvents;
        this._aggressiveContextRecreation = options.aggressiveContextRecreation;
        this._allowBackingScaleAntialiasing = options.allowBackingScaleAntialiasing;
        this._allowLayerFitting = options.allowLayerFitting;
        this._forceSVGRefresh = options.forceSVGRefresh;
        this._overlays = [];
        this._pointerOverlay = null;
        this._pointerAreaOverlay = null;
        this._hitAreaOverlay = null;
        this._canvasAreaBoundsOverlay = null;
        this._fittedBlockBoundsOverlay = null;
        if (assert) {
            this._isPainting = false;
            this._isDisposing = false;
            this._isDisposed = false;
        }
        this.applyCSSHacks();
        this.setBackgroundColor(options.backgroundColor);
        const ariaLiveAnnouncer = new AriaLiveAnnouncer();
        this.descriptionUtteranceQueue = new UtteranceQueue(ariaLiveAnnouncer, {
            initialize: this._accessible,
            featureSpecificAnnouncingControlPropertyName: 'descriptionCanAnnounceProperty'
        });
        if (platform.safari && options.allowSafariRedrawWorkaround) {
            this.addOverlay(new SafariWorkaroundOverlay(this));
        }
        this.focusManager = new FocusManager();
        // Features that require the HighlightOverlay
        if (this._accessible || options.supportsInteractiveHighlights) {
            this._focusRootNode = new Node();
            this._focusOverlay = new HighlightOverlay(this, this._focusRootNode, {
                pdomFocusHighlightsVisibleProperty: this.focusManager.pdomFocusHighlightsVisibleProperty,
                interactiveHighlightsVisibleProperty: this.focusManager.interactiveHighlightsVisibleProperty,
                readingBlockHighlightsVisibleProperty: this.focusManager.readingBlockHighlightsVisibleProperty
            });
            this.addOverlay(this._focusOverlay);
        }
        if (this._accessible) {
            this._rootPDOMInstance = PDOMInstance.pool.create(null, this, new Trail());
            sceneryLog && sceneryLog.PDOMInstance && sceneryLog.PDOMInstance(`Display root instance: ${this._rootPDOMInstance.toString()}`);
            PDOMTree.rebuildInstanceTree(this._rootPDOMInstance);
            // add the accessible DOM as a child of this DOM element
            assert && assert(this._rootPDOMInstance.peer, 'Peer should be created from createFromPool');
            this._domElement.appendChild(this._rootPDOMInstance.peer.primarySibling);
            const ariaLiveContainer = ariaLiveAnnouncer.ariaLiveContainer;
            // add aria-live elements to the display
            this._domElement.appendChild(ariaLiveContainer);
            // set `user-select: none` on the aria-live container to prevent iOS text selection issue, see
            // https://github.com/phetsims/scenery/issues/1006
            // @ts-expect-error
            ariaLiveContainer.style[Features.userSelect] = 'none';
            // Prevent focus from being lost in FullScreen mode, listener on the globalKeyStateTracker
            // because tab navigation may happen before focus is within the PDOM. See handleFullScreenNavigation
            // for more.
            this._boundHandleFullScreenNavigation = this.handleFullScreenNavigation.bind(this);
            globalKeyStateTracker.keydownEmitter.addListener(this._boundHandleFullScreenNavigation);
        }
    }
};
Display.INTERRUPT_OTHER_POINTERS = (event)=>{
    var _window_phet_joist_display, _window_phet_joist, _window_phet;
    (_window_phet = window.phet) == null ? void 0 : (_window_phet_joist = _window_phet.joist) == null ? void 0 : (_window_phet_joist_display = _window_phet_joist.display) == null ? void 0 : _window_phet_joist_display.interruptOtherPointers(event == null ? void 0 : event.pointer);
};
export { Display as default };
scenery.register('Display', Display);
Display.userGestureEmitter = new Emitter();
Display.inputListeners = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9EaXNwbGF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgcGVyc2lzdGVudCBkaXNwbGF5IG9mIGEgc3BlY2lmaWMgTm9kZSBhbmQgaXRzIGRlc2NlbmRhbnRzLCB3aGljaCBpcyB1cGRhdGVkIGF0IGRpc2NyZXRlIHBvaW50cyBpbiB0aW1lLlxuICpcbiAqIFVzZSBkaXNwbGF5LmdldERPTUVsZW1lbnQgb3IgZGlzcGxheS5kb21FbGVtZW50IHRvIHJldHJpZXZlIHRoZSBEaXNwbGF5J3MgRE9NIHJlcHJlc2VudGF0aW9uLlxuICogVXNlIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpIHRvIHRyaWdnZXIgdGhlIHZpc3VhbCB1cGRhdGUgaW4gdGhlIERpc3BsYXkncyBET00gZWxlbWVudC5cbiAqXG4gKiBBIHN0YW5kYXJkIHdheSBvZiB1c2luZyBhIERpc3BsYXkgd2l0aCBTY2VuZXJ5IGlzIHRvOlxuICogMS4gQ3JlYXRlIGEgTm9kZSB0aGF0IHdpbGwgYmUgdGhlIHJvb3RcbiAqIDIuIENyZWF0ZSBhIERpc3BsYXksIHJlZmVyZW5jaW5nIHRoYXQgbm9kZVxuICogMy4gTWFrZSBjaGFuZ2VzIHRvIHRoZSBzY2VuZSBncmFwaFxuICogNC4gQ2FsbCBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKSB0byBkcmF3IHRoZSBzY2VuZSBncmFwaCBpbnRvIHRoZSBEaXNwbGF5XG4gKiA1LiBHbyB0byAoMylcbiAqXG4gKiBDb21tb24gd2F5cyB0byBzaW1wbGlmeSB0aGUgY2hhbmdlL3VwZGF0ZSBsb29wIHdvdWxkIGJlIHRvOlxuICogLSBVc2UgTm9kZS1iYXNlZCBldmVudHMuIEluaXRpYWxpemUgaXQgd2l0aCBEaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKSwgdGhlblxuICogICBhZGQgaW5wdXQgbGlzdGVuZXJzIHRvIHBhcnRzIG9mIHRoZSBzY2VuZSBncmFwaCAoc2VlIE5vZGUuYWRkSW5wdXRMaXN0ZW5lcikuXG4gKiAtIEV4ZWN1dGUgY29kZSAoYW5kIHVwZGF0ZSB0aGUgZGlzcGxheSBhZnRlcndhcmRzKSBieSB1c2luZyBEaXNwbGF5LnVwZGF0ZU9uUmVxdWVzdEFuaW1hdGlvbkZyYW1lLlxuICpcbiAqIEludGVybmFsIGRvY3VtZW50YXRpb246XG4gKlxuICogTGlmZWN5Y2xlIGluZm9ybWF0aW9uOlxuICogICBJbnN0YW5jZSAoY3JlYXRlLGRpc3Bvc2UpXG4gKiAgICAgLSBvdXQgb2YgdXBkYXRlOiAgICAgICAgICAgIFN0YXRlbGVzcyBzdHViIGlzIGNyZWF0ZWQgc3luY2hyb25vdXNseSB3aGVuIGEgTm9kZSdzIGNoaWxkcmVuIGFyZSBhZGRlZCB3aGVyZSB3ZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXZlIG5vIHJlbGV2YW50IEluc3RhbmNlLlxuICogICAgIC0gc3RhcnQgb2YgdXBkYXRlOiAgICAgICAgICBDcmVhdGVzIGZpcnN0IChyb290KSBpbnN0YW5jZSBpZiBpdCBkb2Vzbid0IGV4aXN0IChzdGF0ZWxlc3Mgc3R1YikuXG4gKiAgICAgLSBzeW5jdHJlZTogICAgICAgICAgICAgICAgIENyZWF0ZSBkZXNjZW5kYW50IGluc3RhbmNlcyB1bmRlciBzdHVicywgZmlsbHMgaW4gc3RhdGUsIGFuZCBtYXJrcyByZW1vdmVkIHN1YnRyZWVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdHMgZm9yIGRpc3Bvc2FsLlxuICogICAgIC0gdXBkYXRlIGluc3RhbmNlIGRpc3Bvc2FsOiBEaXNwb3NlcyByb290IGluc3RhbmNlcyB0aGF0IHdlcmUgbWFya2VkLiBUaGlzIGFsc28gZGlzcG9zZXMgYWxsIGRlc2NlbmRhbnRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VzLCBhbmQgZm9yIGV2ZXJ5IGluc3RhbmNlLFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdCBkaXNwb3NlcyB0aGUgY3VycmVudGx5LWF0dGFjaGVkIGRyYXdhYmxlcy5cbiAqICAgRHJhd2FibGUgKGNyZWF0ZSxkaXNwb3NlKVxuICogICAgIC0gc3luY3RyZWU6ICAgICAgICAgICAgICAgICBDcmVhdGVzIGFsbCBkcmF3YWJsZXMgd2hlcmUgbmVjZXNzYXJ5LiBJZiBpdCByZXBsYWNlcyBhIHNlbGYvZ3JvdXAvc2hhcmVkIGRyYXdhYmxlIG9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBpbnN0YW5jZSxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhhdCBvbGQgZHJhd2FibGUgaXMgbWFya2VkIGZvciBkaXNwb3NhbC5cbiAqICAgICAtIHVwZGF0ZSBpbnN0YW5jZSBkaXNwb3NhbDogQW55IGRyYXdhYmxlcyBhdHRhY2hlZCB0byBkaXNwb3NlZCBpbnN0YW5jZXMgYXJlIGRpc3Bvc2VkIHRoZW1zZWx2ZXMgKHNlZSBJbnN0YW5jZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWZlY3ljbGUpLlxuICogICAgIC0gdXBkYXRlIGRyYXdhYmxlIGRpc3Bvc2FsOiBBbnkgbWFya2VkIGRyYXdhYmxlcyB0aGF0IHdlcmUgcmVwbGFjZWQgb3IgcmVtb3ZlZCBmcm9tIGFuIGluc3RhbmNlIChpdCBkaWRuJ3RcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFpbnRhaW4gYSByZWZlcmVuY2UpIGFyZSBkaXNwb3NlZC5cbiAqXG4gKiAgIGFkZC9yZW1vdmUgZHJhd2FibGVzIGZyb20gYmxvY2tzOlxuICogICAgIC0gc3RpdGNoaW5nIGNoYW5nZXMgcGVuZGluZyBcInBhcmVudHNcIiwgbWFya3MgZm9yIGJsb2NrIHVwZGF0ZVxuICogICAgIC0gYmFja2JvbmVzIG1hcmtlZCBmb3IgZGlzcG9zYWwgKGUuZy4gaW5zdGFuY2UgaXMgc3RpbGwgdGhlcmUsIGp1c3QgY2hhbmdlZCB0byBub3QgaGF2ZSBhIGJhY2tib25lKSB3aWxsIG1hcmtcbiAqICAgICAgICAgZHJhd2FibGVzIGZvciBibG9jayB1cGRhdGVzXG4gKiAgICAgLSBhZGQvcmVtb3ZlIGRyYXdhYmxlcyBwaGFzZSB1cGRhdGVzIGRyYXdhYmxlcyB0aGF0IHdlcmUgbWFya2VkXG4gKiAgICAgLSBkaXNwb3NlZCBiYWNrYm9uZSBpbnN0YW5jZXMgd2lsbCBvbmx5IHJlbW92ZSBkcmF3YWJsZXMgaWYgdGhleSB3ZXJlbid0IG1hcmtlZCBmb3IgcmVtb3ZhbCBwcmV2aW91c2x5IChlLmcuIGluXG4gKiAgICAgICAgIGNhc2Ugd2UgYXJlIGZyb20gYSByZW1vdmVkIGluc3RhbmNlKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IHsgTWF0cml4M1R5cGUgfSBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgZXNjYXBlSFRNTCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZXNjYXBlSFRNTC5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBBcmlhTGl2ZUFubm91bmNlciBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvQXJpYUxpdmVBbm5vdW5jZXIuanMnO1xuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS5qcyc7XG5pbXBvcnQgeyBCYWNrYm9uZURyYXdhYmxlLCBCbG9jaywgQ2FudmFzQmxvY2ssIENhbnZhc05vZGVCb3VuZHNPdmVybGF5LCBDaGFuZ2VJbnRlcnZhbCwgQ29sb3IsIERPTUJsb2NrLCBET01EcmF3YWJsZSwgRHJhd2FibGUsIEZlYXR1cmVzLCBGaXR0ZWRCbG9ja0JvdW5kc092ZXJsYXksIEZvY3VzTWFuYWdlciwgRnVsbFNjcmVlbiwgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBIaWdobGlnaHRPdmVybGF5LCBIaXRBcmVhT3ZlcmxheSwgSW5wdXQsIElucHV0T3B0aW9ucywgSW5zdGFuY2UsIEtleWJvYXJkVXRpbHMsIE5vZGUsIFBET01JbnN0YW5jZSwgUERPTVNpYmxpbmdTdHlsZSwgUERPTVRyZWUsIFBET01VdGlscywgUG9pbnRlciwgUG9pbnRlckFyZWFPdmVybGF5LCBQb2ludGVyT3ZlcmxheSwgUmVuZGVyZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgc2NlbmVyeVNlcmlhbGl6ZSwgU2VsZkRyYXdhYmxlLCBUSW5wdXRMaXN0ZW5lciwgVE92ZXJsYXksIFRyYWlsLCBVdGlscywgV2ViR0xCbG9jayB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuaW1wb3J0IFNhZmFyaVdvcmthcm91bmRPdmVybGF5IGZyb20gJy4uL292ZXJsYXlzL1NhZmFyaVdvcmthcm91bmRPdmVybGF5LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgLy8gSW5pdGlhbCAob3Igb3ZlcnJpZGUpIGRpc3BsYXkgd2lkdGhcbiAgd2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gSW5pdGlhbCAob3Igb3ZlcnJpZGUpIGRpc3BsYXkgaGVpZ2h0XG4gIGhlaWdodD86IG51bWJlcjtcblxuICAvLyBBcHBsaWVzIENTUyBzdHlsZXMgdG8gdGhlIHJvb3QgRE9NIGVsZW1lbnQgdGhhdCBtYWtlIGl0IGFtZW5hYmxlIHRvIGludGVyYWN0aXZlIGNvbnRlbnRcbiAgYWxsb3dDU1NIYWNrcz86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB3ZSBhbGxvdyB0aGUgZGlzcGxheSB0byBwdXQgYSByZWN0YW5nbGUgaW4gZnJvbnQgb2YgZXZlcnl0aGluZyB0aGF0IHN1YnRseSBzaGlmdHMgZXZlcnkgZnJhbWUsIGluIG9yZGVyIHRvXG4gIC8vIGZvcmNlIHJlcGFpbnRzIGZvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ2VvbWV0cmljLW9wdGljcy1iYXNpY3MvaXNzdWVzLzMxLlxuICBhbGxvd1NhZmFyaVJlZHJhd1dvcmthcm91bmQ/OiBib29sZWFuO1xuXG4gIC8vIFVzdWFsbHkgYW55dGhpbmcgZGlzcGxheWVkIG91dHNpZGUgb3VyIGRvbSBlbGVtZW50IGlzIGhpZGRlbiB3aXRoIENTUyBvdmVyZmxvdy5cbiAgYWxsb3dTY2VuZU92ZXJmbG93PzogYm9vbGVhbjtcblxuICAvLyBJZiBmYWxzZSwgdGhpcyB3aWxsIGRpc2FibGUgbGF5ZXIgZml0dGluZyAobGlrZSBwdXR0aW5nIHByZXZlbnRGaXQ6IHRydWUgb24gTm9kZXMsIGJ1dCBmb3IgdGhlIGVudGlyZSBEaXNwbGF5KS5cbiAgLy8gTGF5ZXIgZml0dGluZyBoYXMgY2F1c2VkIHNvbWUgdW5zaWdodGx5IGppdHRlcmluZyAoaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEyODkpLCBzbyB0aGlzXG4gIC8vIGFsbG93cyBpdCB0byBiZSB0dXJuZWQgb24gaW4gYSBjYXNlLWJ5LWNhc2UgbWFubmVyLlxuICBhbGxvd0xheWVyRml0dGluZz86IGJvb2xlYW47XG5cbiAgLy8gV2hhdCBjdXJzb3IgaXMgdXNlZCB3aGVuIG5vIG90aGVyIGN1cnNvciBpcyBzcGVjaWZpZWRcbiAgZGVmYXVsdEN1cnNvcj86IHN0cmluZztcblxuICAvLyBGb3JjZXMgU1ZHIGVsZW1lbnRzIHRvIGJlIHJlZnJlc2hlZCBldmVyeSBmcmFtZSwgd2hpY2ggY2FuIGZvcmNlIHJlcGFpbnRpbmcgYW5kIGRldGVjdCAob3IgcG90ZW50aWFsbHkgaW4gc29tZVxuICAvLyBjYXNlcyB3b3JrIGFyb3VuZCkgU1ZHIHJlbmRlcmluZyBicm93c2VyIGJ1Z3MuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTUwN1xuICBmb3JjZVNWR1JlZnJlc2g/OiBib29sZWFuO1xuXG4gIC8vIEluaXRpYWwgYmFja2dyb3VuZCBjb2xvclxuICBiYWNrZ3JvdW5kQ29sb3I/OiBDb2xvciB8IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gV2hldGhlciBXZWJHTCB3aWxsIHByZXNlcnZlIHRoZSBkcmF3aW5nIGJ1ZmZlclxuICAvLyBXQVJOSU5HITogVGhpcyBjYW4gc2lnbmlmaWNhbnRseSByZWR1Y2UgcGVyZm9ybWFuY2UgaWYgc2V0IHRvIHRydWUuXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcj86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciBXZWJHTCBpcyBlbmFibGVkIGF0IGFsbCBmb3IgZHJhd2FibGVzIGluIHRoaXMgRGlzcGxheVxuICAvLyBNYWtlcyBpdCBwb3NzaWJsZSB0byBkaXNhYmxlIFdlYkdMIGZvciBlYXNlIG9mIHRlc3Rpbmcgb24gbm9uLVdlYkdMIHBsYXRmb3Jtcywgc2VlICMyODlcbiAgYWxsb3dXZWJHTD86IGJvb2xlYW47XG5cbiAgLy8gRW5hYmxlcyBhY2Nlc3NpYmlsaXR5IGZlYXR1cmVzXG4gIGFjY2Vzc2liaWxpdHk/OiBib29sZWFuO1xuXG4gIC8vIHtib29sZWFufSAtIEVuYWJsZXMgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBpbiB0aGUgSGlnaGxpZ2h0T3ZlcmxheS4gVGhlc2UgYXJlIGhpZ2hsaWdodHMgdGhhdCBzdXJyb3VuZFxuICAvLyBpbnRlcmFjdGl2ZSBjb21wb25lbnRzIHdoZW4gdXNpbmcgbW91c2Ugb3IgdG91Y2ggd2hpY2ggaW1wcm92ZXMgbG93IHZpc2lvbiBhY2Nlc3MuXG4gIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzPzogYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIG1vdXNlL3RvdWNoL2tleWJvYXJkIGlucHV0cyBhcmUgZW5hYmxlZCAoaWYgaW5wdXQgaGFzIGJlZW4gYWRkZWQpLlxuICBpbnRlcmFjdGl2ZT86IGJvb2xlYW47XG5cbiAgLy8gSWYgdHJ1ZSwgaW5wdXQgZXZlbnQgbGlzdGVuZXJzIHdpbGwgYmUgYXR0YWNoZWQgdG8gdGhlIERpc3BsYXkncyBET00gZWxlbWVudCBpbnN0ZWFkIG9mIHRoZSB3aW5kb3cuXG4gIC8vIE5vcm1hbGx5LCBhdHRhY2hpbmcgbGlzdGVuZXJzIHRvIHRoZSB3aW5kb3cgaXMgcHJlZmVycmVkIChpdCB3aWxsIHNlZSBtb3VzZSBtb3Zlcy91cHMgb3V0c2lkZSBvZiB0aGUgYnJvd3NlclxuICAvLyB3aW5kb3csIGFsbG93aW5nIGNvcnJlY3QgYnV0dG9uIHRyYWNraW5nKSwgaG93ZXZlciB0aGVyZSBtYXkgYmUgaW5zdGFuY2VzIHdoZXJlIGEgZ2xvYmFsIGxpc3RlbmVyIGlzIG5vdFxuICAvLyBwcmVmZXJyZWQuXG4gIGxpc3RlblRvT25seUVsZW1lbnQ/OiBib29sZWFuO1xuXG4gIC8vIEZvcndhcmRlZCB0byBJbnB1dDogSWYgdHJ1ZSwgbW9zdCBldmVudCB0eXBlcyB3aWxsIGJlIGJhdGNoZWQgdW50aWwgb3RoZXJ3aXNlIHRyaWdnZXJlZC5cbiAgYmF0Y2hET01FdmVudHM/OiBib29sZWFuO1xuXG4gIC8vIElmIHRydWUsIHRoZSBpbnB1dCBldmVudCBsb2NhdGlvbiAoYmFzZWQgb24gdGhlIHRvcC1sZWZ0IG9mIHRoZSBicm93c2VyIHRhYidzIHZpZXdwb3J0LCB3aXRoIG5vXG4gIC8vIHNjYWxpbmcgYXBwbGllZCkgd2lsbCBiZSB1c2VkLiBVc3VhbGx5LCB0aGlzIGlzIG5vdCBhIHNhZmUgYXNzdW1wdGlvbiwgc28gd2hlbiBmYWxzZSB0aGUgbG9jYXRpb24gb2YgdGhlXG4gIC8vIGRpc3BsYXkncyBET00gZWxlbWVudCB3aWxsIGJlIHVzZWQgdG8gZ2V0IHRoZSBjb3JyZWN0IGV2ZW50IGxvY2F0aW9uLiBUaGVyZSBpcyBhIHNsaWdodCBwZXJmb3JtYW5jZSBoaXQgdG9cbiAgLy8gZG9pbmcgc28sIHRodXMgdGhpcyBvcHRpb24gaXMgcHJvdmlkZWQgaWYgdGhlIHRvcC1sZWZ0IGxvY2F0aW9uIGNhbiBiZSBndWFyYW50ZWVkLlxuICAvLyBOT1RFOiBSb3RhdGlvbiBvZiB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IChlLmcuIHdpdGggYSBDU1MgdHJhbnNmb3JtKSB3aWxsIHJlc3VsdCBpbiBhbiBpbmNvcnJlY3QgZXZlbnRcbiAgLy8gICAgICAgbWFwcGluZywgYXMgZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgY2FuJ3Qgd29yayB3aXRoIHRoaXMuIGdldEJveFF1YWRzKCkgc2hvdWxkIGZpeCB0aGlzIHdoZW4gYnJvd3NlclxuICAvLyAgICAgICBzdXBwb3J0IGlzIGF2YWlsYWJsZS5cbiAgYXNzdW1lRnVsbFdpbmRvdz86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciBTY2VuZXJ5IHdpbGwgdHJ5IHRvIGFnZ3Jlc3NpdmVseSByZS1jcmVhdGUgV2ViR0wgQ2FudmFzL2NvbnRleHQgaW5zdGVhZCBvZiB3YWl0aW5nIGZvclxuICAvLyBhIGNvbnRleHQgcmVzdG9yZWQgZXZlbnQuIFNvbWV0aW1lcyBjb250ZXh0IGxvc3NlcyBjYW4gb2NjdXIgd2l0aG91dCBhIHJlc3RvcmF0aW9uIGFmdGVyd2FyZHMsIGJ1dCB0aGlzIGNhblxuICAvLyBqdW1wLXN0YXJ0IHRoZSBwcm9jZXNzLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM0Ny5cbiAgYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uPzogYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIHRoZSBgcGFzc2l2ZWAgZmxhZyBzaG91bGQgYmUgc2V0IHdoZW4gYWRkaW5nIGFuZCByZW1vdmluZyBET00gZXZlbnQgbGlzdGVuZXJzLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc3MCBmb3IgbW9yZSBkZXRhaWxzLlxuICAvLyBJZiBpdCBpcyB0cnVlIG9yIGZhbHNlLCB0aGF0IGlzIHRoZSB2YWx1ZSBvZiB0aGUgcGFzc2l2ZSBmbGFnIHRoYXQgd2lsbCBiZSB1c2VkLiBJZiBpdCBpcyBudWxsLCB0aGUgZGVmYXVsdFxuICAvLyBiZWhhdmlvciBvZiB0aGUgYnJvd3NlciB3aWxsIGJlIHVzZWQuXG4gIC8vXG4gIC8vIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgdG91Y2gtYWN0aW9uOiBub25lLCBzbyB3ZSBORUVEIHRvIG5vdCB1c2UgcGFzc2l2ZSBldmVudHMgKHdoaWNoIHdvdWxkIG5vdCBhbGxvd1xuICAvLyBwcmV2ZW50RGVmYXVsdCB0byBkbyBhbnl0aGluZywgc28gZHJhZ3MgYWN0dWFsbHkgY2FuIHNjcm9sbCB0aGUgc2ltKS5cbiAgLy8gQ2hyb21lIGFsc28gZGlkIHRoZSBzYW1lIFwicGFzc2l2ZSBieSBkZWZhdWx0XCIsIGJ1dCBiZWNhdXNlIHdlIGhhdmUgYHRvdWNoLWFjdGlvbjogbm9uZWAgaW4gcGxhY2UsIGl0IGRvZXNuJ3RcbiAgLy8gYWZmZWN0IHVzLCBhbmQgd2UgY2FuIHBvdGVudGlhbGx5IGdldCBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudHMgYnkgYWxsb3dpbmcgcGFzc2l2ZSBldmVudHMuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNzcwIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICBwYXNzaXZlRXZlbnRzPzogYm9vbGVhbiB8IG51bGw7XG5cbiAgLy8gV2hldGhlciwgaWYgbm8gV2ViR0wgYW50aWFsaWFzaW5nIGlzIGRldGVjdGVkLCB0aGUgYmFja2luZyBzY2FsZSBjYW4gYmUgaW5jcmVhc2VkIHRvIHByb3ZpZGUgc29tZVxuICAvLyBhbnRpYWxpYXNpbmcgYmVuZWZpdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy84NTkuXG4gIGFsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nPzogYm9vbGVhbjtcblxuICAvLyBBbiBIVE1MRWxlbWVudCB1c2VkIHRvIGNvbnRhaW4gdGhlIGNvbnRlbnRzIG9mIHRoZSBEaXNwbGF5XG4gIGNvbnRhaW5lcj86IEhUTUxFbGVtZW50O1xufTtcblxudHlwZSBQYXJlbnRPcHRpb25zID0gUGljazxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XG5leHBvcnQgdHlwZSBEaXNwbGF5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuY29uc3QgQ1VTVE9NX0NVUlNPUlMgPSB7XG4gICdzY2VuZXJ5LWdyYWItcG9pbnRlcic6IFsgJ2dyYWInLCAnLW1vei1ncmFiJywgJy13ZWJraXQtZ3JhYicsICdwb2ludGVyJyBdLFxuICAnc2NlbmVyeS1ncmFiYmluZy1wb2ludGVyJzogWyAnZ3JhYmJpbmcnLCAnLW1vei1ncmFiYmluZycsICctd2Via2l0LWdyYWJiaW5nJywgJ3BvaW50ZXInIF1cbn0gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuXG5sZXQgZ2xvYmFsSWRDb3VudGVyID0gMTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGxheSB7XG5cbiAgLy8gdW5pcXVlIElEIGZvciB0aGUgZGlzcGxheSBpbnN0YW5jZSwgKHNjZW5lcnktaW50ZXJuYWwpLCBhbmQgdXNlZnVsIGZvciBkZWJ1Z2dpbmcgd2l0aCBtdWx0aXBsZSBkaXNwbGF5cy5cbiAgcHVibGljIHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cbiAgLy8gVGhlIChpbnRlZ3JhbCwgPiAwKSBkaW1lbnNpb25zIG9mIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnQgKG9ubHkgdXBkYXRlcyB0aGUgRE9NIGVsZW1lbnQgb24gdXBkYXRlRGlzcGxheSgpKVxuICBwdWJsaWMgcmVhZG9ubHkgc2l6ZVByb3BlcnR5OiBUUHJvcGVydHk8RGltZW5zaW9uMj47XG5cbiAgLy8gZGF0YSBzdHJ1Y3R1cmUgZm9yIG1hbmFnaW5nIGFyaWEtbGl2ZSBhbGVydHMgdGhlIHRoaXMgRGlzcGxheSBpbnN0YW5jZVxuICBwdWJsaWMgZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZTogVXR0ZXJhbmNlUXVldWU7XG5cbiAgLy8gTWFuYWdlcyB0aGUgdmFyaW91cyB0eXBlcyBvZiBGb2N1cyB0aGF0IGNhbiBnbyB0aHJvdWdoIHRoZSBEaXNwbGF5LCBhcyB3ZWxsIGFzIFByb3BlcnRpZXNcbiAgLy8gY29udHJvbGxpbmcgd2hpY2ggZm9ybXMgb2YgZm9jdXMgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiB0aGUgSGlnaGxpZ2h0T3ZlcmxheS5cbiAgcHVibGljIGZvY3VzTWFuYWdlcjogRm9jdXNNYW5hZ2VyO1xuXG4gIC8vIChwaGV0LWlvLHNjZW5lcnkpIC0gV2lsbCBiZSBmaWxsZWQgaW4gd2l0aCBhIHBoZXQuc2NlbmVyeS5JbnB1dCBpZiBldmVudCBoYW5kbGluZyBpcyBlbmFibGVkXG4gIHB1YmxpYyBfaW5wdXQ6IElucHV0IHwgbnVsbDtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgV2hldGhlciBhY2Nlc3NpYmlsaXR5IGlzIGVuYWJsZWQgZm9yIHRoaXMgcGFydGljdWxhciBkaXNwbGF5LlxuICBwdWJsaWMgcmVhZG9ubHkgX2FjY2Vzc2libGU6IGJvb2xlYW47XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyByZWFkb25seSBfcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBib29sZWFuO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBtYXAgZnJvbSBOb2RlIElEIHRvIEluc3RhbmNlLCBmb3IgZmFzdCBsb29rdXBcbiAgcHVibGljIF9zaGFyZWRDYW52YXNJbnN0YW5jZXM6IFJlY29yZDxudW1iZXIsIEluc3RhbmNlPjtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgLSBXZSBoYXZlIGEgbW9ub3RvbmljYWxseS1pbmNyZWFzaW5nIGZyYW1lIElELCBnZW5lcmFsbHkgZm9yIHVzZSB3aXRoIGEgcGF0dGVyblxuICAvLyB3aGVyZSB3ZSBjYW4gbWFyayBvYmplY3RzIHdpdGggdGhpcyB0byBub3RlIHRoYXQgdGhleSBhcmUgZWl0aGVyIHVwLXRvLWRhdGUgb3IgbmVlZCByZWZyZXNoaW5nIGR1ZSB0byB0aGlzXG4gIC8vIHBhcnRpY3VsYXIgZnJhbWUgKHdpdGhvdXQgaGF2aW5nIHRvIGNsZWFyIHRoYXQgaW5mb3JtYXRpb24gYWZ0ZXIgdXNlKS4gVGhpcyBpcyBpbmNyZW1lbnRlZCBldmVyeSBmcmFtZVxuICBwdWJsaWMgX2ZyYW1lSWQ6IG51bWJlcjtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9hZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb246IGJvb2xlYW47XG4gIHB1YmxpYyBfYWxsb3dCYWNraW5nU2NhbGVBbnRpYWxpYXNpbmc6IGJvb2xlYW47XG4gIHB1YmxpYyBfYWxsb3dMYXllckZpdHRpbmc6IGJvb2xlYW47XG4gIHB1YmxpYyBfZm9yY2VTVkdSZWZyZXNoOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsbG93V2ViR0w6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsbG93Q1NTSGFja3M6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgX2FsbG93U2NlbmVPdmVyZmxvdzogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSBfZGVmYXVsdEN1cnNvcjogc3RyaW5nO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX3Jvb3ROb2RlOiBOb2RlO1xuICBwcml2YXRlIF9yb290QmFja2JvbmU6IEJhY2tib25lRHJhd2FibGUgfCBudWxsOyAvLyB0byBiZSBmaWxsZWQgaW4gbGF0ZXJcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9tRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgX2Jhc2VJbnN0YW5jZTogSW5zdGFuY2UgfCBudWxsOyAvLyB3aWxsIGJlIGZpbGxlZCB3aXRoIHRoZSByb290IEluc3RhbmNlXG5cbiAgLy8gVXNlZCB0byBjaGVjayBhZ2FpbnN0IG5ldyBzaXplIHRvIHNlZSB3aGF0IHdlIG5lZWQgdG8gY2hhbmdlXG4gIHByaXZhdGUgX2N1cnJlbnRTaXplOiBEaW1lbnNpb24yO1xuXG4gIHByaXZhdGUgX2RpcnR5VHJhbnNmb3JtUm9vdHM6IEluc3RhbmNlW107XG4gIHByaXZhdGUgX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzczogSW5zdGFuY2VbXTtcbiAgcHJpdmF0ZSBfaW5zdGFuY2VSb290c1RvRGlzcG9zZTogSW5zdGFuY2VbXTtcblxuICAvLyBBdCB0aGUgZW5kIG9mIERpc3BsYXkudXBkYXRlLCByZWR1Y2VSZWZlcmVuY2VzIHdpbGwgYmUgY2FsbGVkIG9uIGFsbCBvZiB0aGVzZS4gSXQncyBtZWFudCB0b1xuICAvLyBjYXRjaCB2YXJpb3VzIG9iamVjdHMgdGhhdCB3b3VsZCB1c3VhbGx5IGhhdmUgdXBkYXRlKCkgY2FsbGVkLCBidXQgaWYgdGhleSBhcmUgaW52aXNpYmxlIG9yIG90aGVyd2lzZSBub3QgdXBkYXRlZFxuICAvLyBmb3IgcGVyZm9ybWFuY2UsIHRoZXkgbWF5IG5lZWQgdG8gcmVsZWFzZSByZWZlcmVuY2VzIGFub3RoZXIgd2F5IGluc3RlYWQuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8zNTZcbiAgcHJpdmF0ZSBfcmVkdWNlUmVmZXJlbmNlc05lZWRlZDogeyByZWR1Y2VSZWZlcmVuY2VzOiAoKSA9PiB2b2lkIH1bXTtcblxuICBwcml2YXRlIF9kcmF3YWJsZXNUb0Rpc3Bvc2U6IERyYXdhYmxlW107XG5cbiAgLy8gQmxvY2sgY2hhbmdlcyBhcmUgaGFuZGxlZCBieSBjaGFuZ2luZyB0aGUgXCJwZW5kaW5nXCIgYmxvY2svYmFja2JvbmUgb24gZHJhd2FibGVzLiBXZVxuICAvLyB3YW50IHRvIGNoYW5nZSB0aGVtIGFsbCBhZnRlciB0aGUgbWFpbiBzdGl0Y2ggcHJvY2VzcyBoYXMgY29tcGxldGVkLCBzbyB3ZSBjYW4gZ3VhcmFudGVlIHRoYXQgYSBzaW5nbGUgZHJhd2FibGUgaXNcbiAgLy8gcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyBibG9jayBiZWZvcmUgYmVpbmcgYWRkZWQgdG8gYSBuZXcgb25lLiBUaGlzIGlzIHRha2VuIGNhcmUgb2YgaW4gYW4gdXBkYXRlRGlzcGxheSBwYXNzXG4gIC8vIGFmdGVyIHN5bmNUcmVlIC8gc3RpdGNoaW5nLlxuICBwcml2YXRlIF9kcmF3YWJsZXNUb0NoYW5nZUJsb2NrOiBEcmF3YWJsZVtdO1xuXG4gIC8vIERyYXdhYmxlcyBoYXZlIHR3byBpbXBsaWNpdCBsaW5rZWQtbGlzdHMsIFwiY3VycmVudFwiIGFuZCBcIm9sZFwiLiBzeW5jVHJlZSBtb2RpZmllcyB0aGVcbiAgLy8gXCJjdXJyZW50XCIgbGlua2VkLWxpc3QgaW5mb3JtYXRpb24gc28gaXQgaXMgdXAtdG8tZGF0ZSwgYnV0IG5lZWRzIHRvIHVzZSB0aGUgXCJvbGRcIiBpbmZvcm1hdGlvbiBhbHNvLiBXZSBtb3ZlXG4gIC8vIHVwZGF0aW5nIHRoZSBcImN1cnJlbnRcIiA9PiBcIm9sZFwiIGxpbmtlZC1saXN0IGluZm9ybWF0aW9uIHVudGlsIGFmdGVyIHN5bmNUcmVlIGFuZCBzdGl0Y2hpbmcgaXMgY29tcGxldGUsIGFuZCBpc1xuICAvLyB0YWtlbiBjYXJlIG9mIGluIGFuIHVwZGF0ZURpc3BsYXkgcGFzcy5cbiAgcHJpdmF0ZSBfZHJhd2FibGVzVG9VcGRhdGVMaW5rczogRHJhd2FibGVbXTtcblxuICAvLyBXZSBzdG9yZSBpbmZvcm1hdGlvbiBvbiB7Q2hhbmdlSW50ZXJ2YWx9cyB0aGF0IHJlY29yZHMgY2hhbmdlIGludGVydmFsXG4gIC8vIGluZm9ybWF0aW9uLCB0aGF0IG1heSBjb250YWluIHJlZmVyZW5jZXMuIFdlIGRvbid0IHdhbnQgdG8gbGVhdmUgdGhvc2UgcmVmZXJlbmNlcyBkYW5nbGluZyBhZnRlciB3ZSBkb24ndCBuZWVkXG4gIC8vIHRoZW0sIHNvIHRoZXkgYXJlIHJlY29yZGVkIGFuZCBjbGVhbmVkIGluIG9uZSBvZiB1cGRhdGVEaXNwbGF5J3MgcGhhc2VzLlxuICBwcml2YXRlIF9jaGFuZ2VJbnRlcnZhbHNUb0Rpc3Bvc2U6IENoYW5nZUludGVydmFsW107XG5cbiAgcHJpdmF0ZSBfbGFzdEN1cnNvcjogc3RyaW5nIHwgbnVsbDtcbiAgcHJpdmF0ZSBfY3VycmVudEJhY2tncm91bmRDU1M6IHN0cmluZyB8IG51bGw7XG5cbiAgcHJpdmF0ZSBfYmFja2dyb3VuZENvbG9yOiBDb2xvciB8IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gVXNlZCBmb3Igc2hvcnRjdXQgYW5pbWF0aW9uIGZyYW1lIGZ1bmN0aW9uc1xuICBwcml2YXRlIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWVJRDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gTGlzdGVuZXJzIHRoYXQgd2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IGV2ZW50LlxuICBwcml2YXRlIF9pbnB1dExpc3RlbmVyczogVElucHV0TGlzdGVuZXJbXTtcblxuICAvLyBXaGV0aGVyIG1vdXNlL3RvdWNoL2tleWJvYXJkIGlucHV0cyBhcmUgZW5hYmxlZCAoaWYgaW5wdXQgaGFzIGJlZW4gYWRkZWQpLiBTaW11bGF0aW9uIHdpbGwgc3RpbGwgc3RlcC5cbiAgcHJpdmF0ZSBfaW50ZXJhY3RpdmU6IGJvb2xlYW47XG5cbiAgLy8gUGFzc2VkIHRocm91Z2ggdG8gSW5wdXRcbiAgcHJpdmF0ZSBfbGlzdGVuVG9Pbmx5RWxlbWVudDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfYmF0Y2hET01FdmVudHM6IGJvb2xlYW47XG4gIHByaXZhdGUgX2Fzc3VtZUZ1bGxXaW5kb3c6IGJvb2xlYW47XG4gIHByaXZhdGUgX3Bhc3NpdmVFdmVudHM6IGJvb2xlYW4gfCBudWxsO1xuXG4gIC8vIE92ZXJsYXlzIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWQuXG4gIHByaXZhdGUgX292ZXJsYXlzOiBUT3ZlcmxheVtdO1xuXG4gIHByaXZhdGUgX3BvaW50ZXJPdmVybGF5OiBQb2ludGVyT3ZlcmxheSB8IG51bGw7XG4gIHByaXZhdGUgX3BvaW50ZXJBcmVhT3ZlcmxheTogUG9pbnRlckFyZWFPdmVybGF5IHwgbnVsbDtcbiAgcHJpdmF0ZSBfaGl0QXJlYU92ZXJsYXk6IEhpdEFyZWFPdmVybGF5IHwgbnVsbDtcbiAgcHJpdmF0ZSBfY2FudmFzQXJlYUJvdW5kc092ZXJsYXk6IENhbnZhc05vZGVCb3VuZHNPdmVybGF5IHwgbnVsbDtcbiAgcHJpdmF0ZSBfZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5OiBGaXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkgfCBudWxsO1xuXG4gIC8vIEBhc3NlcnRpb24tb25seSAtIFdoZXRoZXIgd2UgYXJlIHJ1bm5pbmcgdGhlIHBhaW50IHBoYXNlIG9mIHVwZGF0ZURpc3BsYXkoKSBmb3IgdGhpcyBEaXNwbGF5LlxuICBwcml2YXRlIF9pc1BhaW50aW5nPzogYm9vbGVhbjtcblxuICAvLyBAYXNzZXJ0aW9uLW9ubHlcbiAgcHVibGljIF9pc0Rpc3Bvc2luZz86IGJvb2xlYW47XG5cbiAgLy8gQGFzc2VydGlvbi1vbmx5IFdoZXRoZXIgZGlzcG9zYWwgaGFzIHN0YXJ0ZWQgKGJ1dCBub3QgZmluaXNoZWQpXG4gIHB1YmxpYyBfaXNEaXNwb3NlZD86IGJvb2xlYW47XG5cbiAgLy8gSWYgYWNjZXNzaWJsZVxuICBwcml2YXRlIF9mb2N1c1Jvb3ROb2RlPzogTm9kZTtcbiAgcHJpdmF0ZSBfZm9jdXNPdmVybGF5PzogSGlnaGxpZ2h0T3ZlcmxheTtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCwgaWYgYWNjZXNzaWJsZSlcbiAgcHVibGljIF9yb290UERPTUluc3RhbmNlPzogUERPTUluc3RhbmNlO1xuXG4gIC8vIChpZiBhY2Nlc3NpYmxlKVxuICBwcml2YXRlIF9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uPzogKCBkb21FdmVudDogS2V5Ym9hcmRFdmVudCApID0+IHZvaWQ7XG5cbiAgLy8gSWYgbG9nZ2luZyBwZXJmb3JtYW5jZVxuICBwcml2YXRlIHBlcmZTeW5jVHJlZUNvdW50PzogbnVtYmVyO1xuICBwcml2YXRlIHBlcmZTdGl0Y2hDb3VudD86IG51bWJlcjtcbiAgcHJpdmF0ZSBwZXJmSW50ZXJ2YWxDb3VudD86IG51bWJlcjtcbiAgcHJpdmF0ZSBwZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50PzogbnVtYmVyO1xuICBwcml2YXRlIHBlcmZEcmF3YWJsZU9sZEludGVydmFsQ291bnQ/OiBudW1iZXI7XG4gIHByaXZhdGUgcGVyZkRyYXdhYmxlTmV3SW50ZXJ2YWxDb3VudD86IG51bWJlcjtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgV2hlbiBmaXJlZCwgZm9yY2VzIGFuIFNWRyByZWZyZXNoLCB0byB0cnkgdG8gd29yayBhcm91bmQgaXNzdWVzXG4gIC8vIGxpa2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1MDdcbiAgcHVibGljIHJlYWRvbmx5IF9yZWZyZXNoU1ZHRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgLy8gSWYgdHJ1ZSwgd2Ugd2lsbCByZWZyZXNoIHRoZSBTVkcgZWxlbWVudHMgb24gdGhlIG5leHQgZnJhbWVcbiAgcHJpdmF0ZSBfcmVmcmVzaFNWR1BlbmRpbmcgPSBmYWxzZTtcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIERpc3BsYXkgdGhhdCB3aWxsIHNob3cgdGhlIHJvb3ROb2RlIGFuZCBpdHMgc3VidHJlZSBpbiBhIHZpc3VhbCBzdGF0ZS4gRGVmYXVsdCBvcHRpb25zIHByb3ZpZGVkIGJlbG93XG4gICAqXG4gICAqIEBwYXJhbSByb290Tm9kZSAtIERpc3BsYXlzIHRoaXMgbm9kZSBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50c1xuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggcm9vdE5vZGU6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IERpc3BsYXlPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJvb3ROb2RlLCAncm9vdE5vZGUgaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInICk7XG5cbiAgICAvL09IVFdPIFRPRE86IGh5YnJpZCBiYXRjaGluZyAob3B0aW9uIHRvIGJhdGNoIHVudGlsIGFuIGV2ZW50IGxpa2UgJ3VwJyB0aGF0IG1pZ2h0IGJlIG5lZWRlZCBmb3Igc2VjdXJpdHkgaXNzdWVzKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXNwbGF5T3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2NvbnRhaW5lcic+LCBQYXJlbnRPcHRpb25zPigpKCB7XG4gICAgICAvLyB7bnVtYmVyfSAtIEluaXRpYWwgZGlzcGxheSB3aWR0aFxuICAgICAgd2lkdGg6ICggcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5jb250YWluZXIgJiYgcHJvdmlkZWRPcHRpb25zLmNvbnRhaW5lci5jbGllbnRXaWR0aCApIHx8IDY0MCxcblxuICAgICAgLy8ge251bWJlcn0gLSBJbml0aWFsIGRpc3BsYXkgaGVpZ2h0XG4gICAgICBoZWlnaHQ6ICggcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5jb250YWluZXIgJiYgcHJvdmlkZWRPcHRpb25zLmNvbnRhaW5lci5jbGllbnRIZWlnaHQgKSB8fCA0ODAsXG5cbiAgICAgIC8vIHtib29sZWFufSAtIEFwcGxpZXMgQ1NTIHN0eWxlcyB0byB0aGUgcm9vdCBET00gZWxlbWVudCB0aGF0IG1ha2UgaXQgYW1lbmFibGUgdG8gaW50ZXJhY3RpdmUgY29udGVudFxuICAgICAgYWxsb3dDU1NIYWNrczogdHJ1ZSxcblxuICAgICAgYWxsb3dTYWZhcmlSZWRyYXdXb3JrYXJvdW5kOiBmYWxzZSxcblxuICAgICAgLy8ge2Jvb2xlYW59IC0gVXN1YWxseSBhbnl0aGluZyBkaXNwbGF5ZWQgb3V0c2lkZSBvZiBvdXIgZG9tIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGggQ1NTIG92ZXJmbG93XG4gICAgICBhbGxvd1NjZW5lT3ZlcmZsb3c6IGZhbHNlLFxuXG4gICAgICBhbGxvd0xheWVyRml0dGluZzogZmFsc2UsXG5cbiAgICAgIGZvcmNlU1ZHUmVmcmVzaDogZmFsc2UsXG5cbiAgICAgIC8vIHtzdHJpbmd9IC0gV2hhdCBjdXJzb3IgaXMgdXNlZCB3aGVuIG5vIG90aGVyIGN1cnNvciBpcyBzcGVjaWZpZWRcbiAgICAgIGRlZmF1bHRDdXJzb3I6ICdkZWZhdWx0JyxcblxuICAgICAgLy8ge0NvbG9yRGVmfSAtIEluaXRpYWwgYmFja2dyb3VuZCBjb2xvclxuICAgICAgYmFja2dyb3VuZENvbG9yOiBudWxsLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFdlYkdMIHdpbGwgcHJlc2VydmUgdGhlIGRyYXdpbmcgYnVmZmVyXG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFdlYkdMIGlzIGVuYWJsZWQgYXQgYWxsIGZvciBkcmF3YWJsZXMgaW4gdGhpcyBEaXNwbGF5XG4gICAgICBhbGxvd1dlYkdMOiB0cnVlLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBFbmFibGVzIGFjY2Vzc2liaWxpdHkgZmVhdHVyZXNcbiAgICAgIGFjY2Vzc2liaWxpdHk6IHRydWUsXG5cbiAgICAgIC8vIHtib29sZWFufSAtIFNlZSBkZWNsYXJhdGlvbi5cbiAgICAgIHN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzOiBmYWxzZSxcblxuICAgICAgLy8ge2Jvb2xlYW59IC0gV2hldGhlciBtb3VzZS90b3VjaC9rZXlib2FyZCBpbnB1dHMgYXJlIGVuYWJsZWQgKGlmIGlucHV0IGhhcyBiZWVuIGFkZGVkKS5cbiAgICAgIGludGVyYWN0aXZlOiB0cnVlLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBJZiB0cnVlLCBpbnB1dCBldmVudCBsaXN0ZW5lcnMgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IGluc3RlYWQgb2YgdGhlIHdpbmRvdy5cbiAgICAgIC8vIE5vcm1hbGx5LCBhdHRhY2hpbmcgbGlzdGVuZXJzIHRvIHRoZSB3aW5kb3cgaXMgcHJlZmVycmVkIChpdCB3aWxsIHNlZSBtb3VzZSBtb3Zlcy91cHMgb3V0c2lkZSBvZiB0aGUgYnJvd3NlclxuICAgICAgLy8gd2luZG93LCBhbGxvd2luZyBjb3JyZWN0IGJ1dHRvbiB0cmFja2luZyksIGhvd2V2ZXIgdGhlcmUgbWF5IGJlIGluc3RhbmNlcyB3aGVyZSBhIGdsb2JhbCBsaXN0ZW5lciBpcyBub3RcbiAgICAgIC8vIHByZWZlcnJlZC5cbiAgICAgIGxpc3RlblRvT25seUVsZW1lbnQ6IGZhbHNlLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBGb3J3YXJkZWQgdG8gSW5wdXQ6IElmIHRydWUsIG1vc3QgZXZlbnQgdHlwZXMgd2lsbCBiZSBiYXRjaGVkIHVudGlsIG90aGVyd2lzZSB0cmlnZ2VyZWQuXG4gICAgICBiYXRjaERPTUV2ZW50czogZmFsc2UsXG5cbiAgICAgIC8vIHtib29sZWFufSAtIElmIHRydWUsIHRoZSBpbnB1dCBldmVudCBsb2NhdGlvbiAoYmFzZWQgb24gdGhlIHRvcC1sZWZ0IG9mIHRoZSBicm93c2VyIHRhYidzIHZpZXdwb3J0LCB3aXRoIG5vXG4gICAgICAvLyBzY2FsaW5nIGFwcGxpZWQpIHdpbGwgYmUgdXNlZC4gVXN1YWxseSwgdGhpcyBpcyBub3QgYSBzYWZlIGFzc3VtcHRpb24sIHNvIHdoZW4gZmFsc2UgdGhlIGxvY2F0aW9uIG9mIHRoZVxuICAgICAgLy8gZGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgdXNlZCB0byBnZXQgdGhlIGNvcnJlY3QgZXZlbnQgbG9jYXRpb24uIFRoZXJlIGlzIGEgc2xpZ2h0IHBlcmZvcm1hbmNlIGhpdCB0b1xuICAgICAgLy8gZG9pbmcgc28sIHRodXMgdGhpcyBvcHRpb24gaXMgcHJvdmlkZWQgaWYgdGhlIHRvcC1sZWZ0IGxvY2F0aW9uIGNhbiBiZSBndWFyYW50ZWVkLlxuICAgICAgLy8gTk9URTogUm90YXRpb24gb2YgdGhlIERpc3BsYXkncyBET00gZWxlbWVudCAoZS5nLiB3aXRoIGEgQ1NTIHRyYW5zZm9ybSkgd2lsbCByZXN1bHQgaW4gYW4gaW5jb3JyZWN0IGV2ZW50XG4gICAgICAvLyAgICAgICBtYXBwaW5nLCBhcyBnZXRCb3VuZGluZ0NsaWVudFJlY3QoKSBjYW4ndCB3b3JrIHdpdGggdGhpcy4gZ2V0Qm94UXVhZHMoKSBzaG91bGQgZml4IHRoaXMgd2hlbiBicm93c2VyXG4gICAgICAvLyAgICAgICBzdXBwb3J0IGlzIGF2YWlsYWJsZS5cbiAgICAgIGFzc3VtZUZ1bGxXaW5kb3c6IGZhbHNlLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIFNjZW5lcnkgd2lsbCB0cnkgdG8gYWdncmVzc2l2ZWx5IHJlLWNyZWF0ZSBXZWJHTCBDYW52YXMvY29udGV4dCBpbnN0ZWFkIG9mIHdhaXRpbmcgZm9yXG4gICAgICAvLyBhIGNvbnRleHQgcmVzdG9yZWQgZXZlbnQuIFNvbWV0aW1lcyBjb250ZXh0IGxvc3NlcyBjYW4gb2NjdXIgd2l0aG91dCBhIHJlc3RvcmF0aW9uIGFmdGVyd2FyZHMsIGJ1dCB0aGlzIGNhblxuICAgICAgLy8ganVtcC1zdGFydCB0aGUgcHJvY2Vzcy5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMzQ3LlxuICAgICAgYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uOiB0cnVlLFxuXG4gICAgICAvLyB7Ym9vbGVhbnxudWxsfSAtIFdoZXRoZXIgdGhlIGBwYXNzaXZlYCBmbGFnIHNob3VsZCBiZSBzZXQgd2hlbiBhZGRpbmcgYW5kIHJlbW92aW5nIERPTSBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzc3MCBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAgLy8gSWYgaXQgaXMgdHJ1ZSBvciBmYWxzZSwgdGhhdCBpcyB0aGUgdmFsdWUgb2YgdGhlIHBhc3NpdmUgZmxhZyB0aGF0IHdpbGwgYmUgdXNlZC4gSWYgaXQgaXMgbnVsbCwgdGhlIGRlZmF1bHRcbiAgICAgIC8vIGJlaGF2aW9yIG9mIHRoZSBicm93c2VyIHdpbGwgYmUgdXNlZC5cbiAgICAgIC8vXG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IHRvdWNoLWFjdGlvbjogbm9uZSwgc28gd2UgTkVFRCB0byBub3QgdXNlIHBhc3NpdmUgZXZlbnRzICh3aGljaCB3b3VsZCBub3QgYWxsb3dcbiAgICAgIC8vIHByZXZlbnREZWZhdWx0IHRvIGRvIGFueXRoaW5nLCBzbyBkcmFncyBhY3R1YWxseSBjYW4gc2Nyb2xsIHRoZSBzaW0pLlxuICAgICAgLy8gQ2hyb21lIGFsc28gZGlkIHRoZSBzYW1lIFwicGFzc2l2ZSBieSBkZWZhdWx0XCIsIGJ1dCBiZWNhdXNlIHdlIGhhdmUgYHRvdWNoLWFjdGlvbjogbm9uZWAgaW4gcGxhY2UsIGl0IGRvZXNuJ3RcbiAgICAgIC8vIGFmZmVjdCB1cywgYW5kIHdlIGNhbiBwb3RlbnRpYWxseSBnZXQgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnRzIGJ5IGFsbG93aW5nIHBhc3NpdmUgZXZlbnRzLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy83NzAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICBwYXNzaXZlRXZlbnRzOiBwbGF0Zm9ybS5zYWZhcmkgPyBmYWxzZSA6IG51bGwsXG5cbiAgICAgIC8vIHtib29sZWFufSAtIFdoZXRoZXIsIGlmIG5vIFdlYkdMIGFudGlhbGlhc2luZyBpcyBkZXRlY3RlZCwgdGhlIGJhY2tpbmcgc2NhbGUgY2FuIGJlIGluY3JlYXNlZCBzbyBhcyB0b1xuICAgICAgLy8gICAgICAgICAgICAgcHJvdmlkZSBzb21lIGFudGlhbGlhc2luZyBiZW5lZml0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1OS5cbiAgICAgIGFsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nOiB0cnVlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLmlkID0gZ2xvYmFsSWRDb3VudGVyKys7XG5cbiAgICB0aGlzLl9hY2Nlc3NpYmxlID0gb3B0aW9ucy5hY2Nlc3NpYmlsaXR5O1xuICAgIHRoaXMuX3ByZXNlcnZlRHJhd2luZ0J1ZmZlciA9IG9wdGlvbnMucHJlc2VydmVEcmF3aW5nQnVmZmVyO1xuICAgIHRoaXMuX2FsbG93V2ViR0wgPSBvcHRpb25zLmFsbG93V2ViR0w7XG4gICAgdGhpcy5fYWxsb3dDU1NIYWNrcyA9IG9wdGlvbnMuYWxsb3dDU1NIYWNrcztcbiAgICB0aGlzLl9hbGxvd1NjZW5lT3ZlcmZsb3cgPSBvcHRpb25zLmFsbG93U2NlbmVPdmVyZmxvdztcblxuICAgIHRoaXMuX2RlZmF1bHRDdXJzb3IgPSBvcHRpb25zLmRlZmF1bHRDdXJzb3I7XG5cbiAgICB0aGlzLnNpemVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIG5ldyBEaW1lbnNpb24yKCBvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCApICk7XG5cbiAgICB0aGlzLl9jdXJyZW50U2l6ZSA9IG5ldyBEaW1lbnNpb24yKCAtMSwgLTEgKTtcbiAgICB0aGlzLl9yb290Tm9kZSA9IHJvb3ROb2RlO1xuICAgIHRoaXMuX3Jvb3ROb2RlLmFkZFJvb3RlZERpc3BsYXkoIHRoaXMgKTtcbiAgICB0aGlzLl9yb290QmFja2JvbmUgPSBudWxsOyAvLyB0byBiZSBmaWxsZWQgaW4gbGF0ZXJcbiAgICB0aGlzLl9kb21FbGVtZW50ID0gb3B0aW9ucy5jb250YWluZXIgP1xuICAgICAgICAgICAgICAgICAgICAgICBCYWNrYm9uZURyYXdhYmxlLnJlcHVycG9zZUJhY2tib25lQ29udGFpbmVyKCBvcHRpb25zLmNvbnRhaW5lciApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgQmFja2JvbmVEcmF3YWJsZS5jcmVhdGVEaXZCYWNrYm9uZSgpO1xuXG4gICAgdGhpcy5fc2hhcmVkQ2FudmFzSW5zdGFuY2VzID0ge307XG4gICAgdGhpcy5fYmFzZUluc3RhbmNlID0gbnVsbDsgLy8gd2lsbCBiZSBmaWxsZWQgd2l0aCB0aGUgcm9vdCBJbnN0YW5jZVxuICAgIHRoaXMuX2ZyYW1lSWQgPSAwO1xuICAgIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHMgPSBbXTtcbiAgICB0aGlzLl9kaXJ0eVRyYW5zZm9ybVJvb3RzV2l0aG91dFBhc3MgPSBbXTtcbiAgICB0aGlzLl9pbnN0YW5jZVJvb3RzVG9EaXNwb3NlID0gW107XG4gICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZCA9IFtdO1xuICAgIHRoaXMuX2RyYXdhYmxlc1RvRGlzcG9zZSA9IFtdO1xuICAgIHRoaXMuX2RyYXdhYmxlc1RvQ2hhbmdlQmxvY2sgPSBbXTtcbiAgICB0aGlzLl9kcmF3YWJsZXNUb1VwZGF0ZUxpbmtzID0gW107XG4gICAgdGhpcy5fY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlID0gW107XG4gICAgdGhpcy5fbGFzdEN1cnNvciA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudEJhY2tncm91bmRDU1MgPSBudWxsO1xuICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciA9IG51bGw7XG4gICAgdGhpcy5faW5wdXQgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0TGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5faW50ZXJhY3RpdmUgPSBvcHRpb25zLmludGVyYWN0aXZlO1xuICAgIHRoaXMuX2xpc3RlblRvT25seUVsZW1lbnQgPSBvcHRpb25zLmxpc3RlblRvT25seUVsZW1lbnQ7XG4gICAgdGhpcy5fYmF0Y2hET01FdmVudHMgPSBvcHRpb25zLmJhdGNoRE9NRXZlbnRzO1xuICAgIHRoaXMuX2Fzc3VtZUZ1bGxXaW5kb3cgPSBvcHRpb25zLmFzc3VtZUZ1bGxXaW5kb3c7XG4gICAgdGhpcy5fcGFzc2l2ZUV2ZW50cyA9IG9wdGlvbnMucGFzc2l2ZUV2ZW50cztcbiAgICB0aGlzLl9hZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb24gPSBvcHRpb25zLmFnZ3Jlc3NpdmVDb250ZXh0UmVjcmVhdGlvbjtcbiAgICB0aGlzLl9hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZyA9IG9wdGlvbnMuYWxsb3dCYWNraW5nU2NhbGVBbnRpYWxpYXNpbmc7XG4gICAgdGhpcy5fYWxsb3dMYXllckZpdHRpbmcgPSBvcHRpb25zLmFsbG93TGF5ZXJGaXR0aW5nO1xuICAgIHRoaXMuX2ZvcmNlU1ZHUmVmcmVzaCA9IG9wdGlvbnMuZm9yY2VTVkdSZWZyZXNoO1xuICAgIHRoaXMuX292ZXJsYXlzID0gW107XG4gICAgdGhpcy5fcG9pbnRlck92ZXJsYXkgPSBudWxsO1xuICAgIHRoaXMuX3BvaW50ZXJBcmVhT3ZlcmxheSA9IG51bGw7XG4gICAgdGhpcy5faGl0QXJlYU92ZXJsYXkgPSBudWxsO1xuICAgIHRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5ID0gbnVsbDtcbiAgICB0aGlzLl9maXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkgPSBudWxsO1xuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICB0aGlzLl9pc1BhaW50aW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9pc0Rpc3Bvc2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuYXBwbHlDU1NIYWNrcygpO1xuXG4gICAgdGhpcy5zZXRCYWNrZ3JvdW5kQ29sb3IoIG9wdGlvbnMuYmFja2dyb3VuZENvbG9yICk7XG5cbiAgICBjb25zdCBhcmlhTGl2ZUFubm91bmNlciA9IG5ldyBBcmlhTGl2ZUFubm91bmNlcigpO1xuICAgIHRoaXMuZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggYXJpYUxpdmVBbm5vdW5jZXIsIHtcbiAgICAgIGluaXRpYWxpemU6IHRoaXMuX2FjY2Vzc2libGUsXG4gICAgICBmZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZTogJ2Rlc2NyaXB0aW9uQ2FuQW5ub3VuY2VQcm9wZXJ0eSdcbiAgICB9ICk7XG5cbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSAmJiBvcHRpb25zLmFsbG93U2FmYXJpUmVkcmF3V29ya2Fyb3VuZCApIHtcbiAgICAgIHRoaXMuYWRkT3ZlcmxheSggbmV3IFNhZmFyaVdvcmthcm91bmRPdmVybGF5KCB0aGlzICkgKTtcbiAgICB9XG5cbiAgICB0aGlzLmZvY3VzTWFuYWdlciA9IG5ldyBGb2N1c01hbmFnZXIoKTtcblxuICAgIC8vIEZlYXR1cmVzIHRoYXQgcmVxdWlyZSB0aGUgSGlnaGxpZ2h0T3ZlcmxheVxuICAgIGlmICggdGhpcy5fYWNjZXNzaWJsZSB8fCBvcHRpb25zLnN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzICkge1xuICAgICAgdGhpcy5fZm9jdXNSb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgICB0aGlzLl9mb2N1c092ZXJsYXkgPSBuZXcgSGlnaGxpZ2h0T3ZlcmxheSggdGhpcywgdGhpcy5fZm9jdXNSb290Tm9kZSwge1xuICAgICAgICBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiB0aGlzLmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LFxuICAgICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IHRoaXMuZm9jdXNNYW5hZ2VyLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSxcbiAgICAgICAgcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogdGhpcy5mb2N1c01hbmFnZXIucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eVxuICAgICAgfSApO1xuICAgICAgdGhpcy5hZGRPdmVybGF5KCB0aGlzLl9mb2N1c092ZXJsYXkgKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX2FjY2Vzc2libGUgKSB7XG4gICAgICB0aGlzLl9yb290UERPTUluc3RhbmNlID0gUERPTUluc3RhbmNlLnBvb2wuY3JlYXRlKCBudWxsLCB0aGlzLCBuZXcgVHJhaWwoKSApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLlBET01JbnN0YW5jZShcbiAgICAgICAgYERpc3BsYXkgcm9vdCBpbnN0YW5jZTogJHt0aGlzLl9yb290UERPTUluc3RhbmNlLnRvU3RyaW5nKCl9YCApO1xuICAgICAgUERPTVRyZWUucmVidWlsZEluc3RhbmNlVHJlZSggdGhpcy5fcm9vdFBET01JbnN0YW5jZSApO1xuXG4gICAgICAvLyBhZGQgdGhlIGFjY2Vzc2libGUgRE9NIGFzIGEgY2hpbGQgb2YgdGhpcyBET00gZWxlbWVudFxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcm9vdFBET01JbnN0YW5jZS5wZWVyLCAnUGVlciBzaG91bGQgYmUgY3JlYXRlZCBmcm9tIGNyZWF0ZUZyb21Qb29sJyApO1xuICAgICAgdGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5fcm9vdFBET01JbnN0YW5jZS5wZWVyIS5wcmltYXJ5U2libGluZyEgKTtcblxuICAgICAgY29uc3QgYXJpYUxpdmVDb250YWluZXIgPSBhcmlhTGl2ZUFubm91bmNlci5hcmlhTGl2ZUNvbnRhaW5lcjtcblxuICAgICAgLy8gYWRkIGFyaWEtbGl2ZSBlbGVtZW50cyB0byB0aGUgZGlzcGxheVxuICAgICAgdGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggYXJpYUxpdmVDb250YWluZXIgKTtcblxuICAgICAgLy8gc2V0IGB1c2VyLXNlbGVjdDogbm9uZWAgb24gdGhlIGFyaWEtbGl2ZSBjb250YWluZXIgdG8gcHJldmVudCBpT1MgdGV4dCBzZWxlY3Rpb24gaXNzdWUsIHNlZVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwMDZcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGFyaWFMaXZlQ29udGFpbmVyLnN0eWxlWyBGZWF0dXJlcy51c2VyU2VsZWN0IF0gPSAnbm9uZSc7XG5cbiAgICAgIC8vIFByZXZlbnQgZm9jdXMgZnJvbSBiZWluZyBsb3N0IGluIEZ1bGxTY3JlZW4gbW9kZSwgbGlzdGVuZXIgb24gdGhlIGdsb2JhbEtleVN0YXRlVHJhY2tlclxuICAgICAgLy8gYmVjYXVzZSB0YWIgbmF2aWdhdGlvbiBtYXkgaGFwcGVuIGJlZm9yZSBmb2N1cyBpcyB3aXRoaW4gdGhlIFBET00uIFNlZSBoYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvblxuICAgICAgLy8gZm9yIG1vcmUuXG4gICAgICB0aGlzLl9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uID0gdGhpcy5oYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvbi5iaW5kKCB0aGlzICk7XG4gICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIua2V5ZG93bkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2JvdW5kSGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24gKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0RE9NRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuX2RvbUVsZW1lbnQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGRvbUVsZW1lbnQoKTogSFRNTEVsZW1lbnQgeyByZXR1cm4gdGhpcy5nZXRET01FbGVtZW50KCk7IH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgZGlzcGxheSdzIERPTSBlbGVtZW50IHdpdGggdGhlIGN1cnJlbnQgdmlzdWFsIHN0YXRlIG9mIHRoZSBhdHRhY2hlZCByb290IG5vZGUgYW5kIGl0cyBkZXNjZW5kYW50c1xuICAgKi9cbiAgcHVibGljIHVwZGF0ZURpc3BsYXkoKTogdm9pZCB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBzY2VuZXJ5IG5hbWVzcGFjZVxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgKSB7XG4gICAgICB0aGlzLnBlcmZTeW5jVHJlZUNvdW50ID0gMDtcbiAgICAgIHRoaXMucGVyZlN0aXRjaENvdW50ID0gMDtcbiAgICAgIHRoaXMucGVyZkludGVydmFsQ291bnQgPSAwO1xuICAgICAgdGhpcy5wZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50ID0gMDtcbiAgICAgIHRoaXMucGVyZkRyYXdhYmxlT2xkSW50ZXJ2YWxDb3VudCA9IDA7XG4gICAgICB0aGlzLnBlcmZEcmF3YWJsZU5ld0ludGVydmFsQ291bnQgPSAwO1xuICAgIH1cblxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgRGlzcGxheS5hc3NlcnRTdWJ0cmVlRGlzcG9zZWQoIHRoaXMuX3Jvb3ROb2RlICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5EaXNwbGF5KCBgdXBkYXRlRGlzcGxheSBmcmFtZSAke3RoaXMuX2ZyYW1lSWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3QgZmlyc3RSdW4gPSAhIXRoaXMuX2Jhc2VJbnN0YW5jZTtcblxuICAgIC8vIGNoZWNrIHRvIHNlZSB3aGV0aGVyIGNvbnRlbnRzIHVuZGVyIHBvaW50ZXJzIGNoYW5nZWQgKGFuZCBpZiBzbywgc2VuZCB0aGUgZW50ZXIvZXhpdCBldmVudHMpIHRvXG4gICAgLy8gbWFpbnRhaW4gY29uc2lzdGVudCBzdGF0ZVxuICAgIGlmICggdGhpcy5faW5wdXQgKSB7XG4gICAgICAvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBoYW5kbGVkIGVsc2V3aGVyZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIHRoaXMuX2lucHV0LnZhbGlkYXRlUG9pbnRlcnMoKTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX2FjY2Vzc2libGUgKSB7XG5cbiAgICAgIC8vIHVwZGF0ZSBwb3NpdGlvbmluZyBvZiBmb2N1c2FibGUgcGVlciBzaWJsaW5ncyBzbyB0aGV5IGFyZSBkaXNjb3ZlcmFibGUgb24gbW9iaWxlIGFzc2lzdGl2ZSBkZXZpY2VzXG4gICAgICB0aGlzLl9yb290UERPTUluc3RhbmNlIS5wZWVyIS51cGRhdGVTdWJ0cmVlUG9zaXRpb25pbmcoKTtcbiAgICB9XG5cbiAgICAvLyB2YWxpZGF0ZSBib3VuZHMgZm9yIGV2ZXJ5d2hlcmUgdGhhdCBjb3VsZCB0cmlnZ2VyIGJvdW5kcyBsaXN0ZW5lcnMuIHdlIHdhbnQgdG8gZmx1c2ggb3V0IGFueSBjaGFuZ2VzLCBzbyB0aGF0IHdlIGNhbiBjYWxsIHZhbGlkYXRlQm91bmRzKClcbiAgICAvLyBmcm9tIGNvZGUgYmVsb3cgd2l0aG91dCB0cmlnZ2VyaW5nIHNpZGUgZWZmZWN0cyAod2UgYXNzdW1lIHRoYXQgd2UgYXJlIG5vdCByZWVudHJhbnQpLlxuICAgIHRoaXMuX3Jvb3ROb2RlLnZhbGlkYXRlV2F0Y2hlZEJvdW5kcygpO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9hY2Nlc3NpYmxlICYmIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLmF1ZGl0Um9vdCgpOyB9XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3Jvb3ROb2RlLl9waWNrZXIuYXVkaXQoKTsgfVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEluc3RhbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5fYmFzZUluc3RhbmNlID0gdGhpcy5fYmFzZUluc3RhbmNlIHx8IEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLCBuZXcgVHJhaWwoIHRoaXMuX3Jvb3ROb2RlICksIHRydWUsIGZhbHNlICk7XG4gICAgdGhpcy5fYmFzZUluc3RhbmNlIS5iYXNlU3luY1RyZWUoKTtcbiAgICBpZiAoIGZpcnN0UnVuICkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIGluc3RhbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLm1hcmtUcmFuc2Zvcm1Sb290RGlydHkoIHRoaXMuX2Jhc2VJbnN0YW5jZSEsIHRoaXMuX2Jhc2VJbnN0YW5jZSEuaXNUcmFuc2Zvcm1lZCApOyAvLyBtYXJrcyB0aGUgdHJhbnNmb3JtIHJvb3QgYXMgZGlydHkgKHNpbmNlIGl0IGlzKVxuICAgIH1cblxuICAgIC8vIHVwZGF0ZSBvdXIgZHJhd2FibGUncyBsaW5rZWQgbGlzdHMgd2hlcmUgbmVjZXNzYXJ5XG4gICAgd2hpbGUgKCB0aGlzLl9kcmF3YWJsZXNUb1VwZGF0ZUxpbmtzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuX2RyYXdhYmxlc1RvVXBkYXRlTGlua3MucG9wKCkhLnVwZGF0ZUxpbmtzKCk7XG4gICAgfVxuXG4gICAgLy8gY2xlYW4gY2hhbmdlLWludGVydmFsIGluZm9ybWF0aW9uIGZyb20gaW5zdGFuY2VzLCBzbyB3ZSBkb24ndCBsZWFrIG1lbW9yeS9yZWZlcmVuY2VzXG4gICAgd2hpbGUgKCB0aGlzLl9jaGFuZ2VJbnRlcnZhbHNUb0Rpc3Bvc2UubGVuZ3RoICkge1xuICAgICAgdGhpcy5fY2hhbmdlSW50ZXJ2YWxzVG9EaXNwb3NlLnBvcCgpIS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcm9vdEJhY2tib25lID0gdGhpcy5fcm9vdEJhY2tib25lIHx8IHRoaXMuX2Jhc2VJbnN0YW5jZSEuZ3JvdXBEcmF3YWJsZTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9yb290QmFja2JvbmUsICdXZSBhcmUgZ3VhcmFudGVlZCBhIHJvb3QgYmFja2JvbmUgYXMgdGhlIGdyb3VwRHJhd2FibGUgb24gdGhlIGJhc2UgaW5zdGFuY2UnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcm9vdEJhY2tib25lID09PSB0aGlzLl9iYXNlSW5zdGFuY2UhLmdyb3VwRHJhd2FibGUsICdXZSBkb25cXCd0IHdhbnQgdGhlIGJhc2UgaW5zdGFuY2VcXCdzIGdyb3VwRHJhd2FibGUgdG8gY2hhbmdlJyApO1xuXG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3Jvb3RCYWNrYm9uZSEuYXVkaXQoIHRydWUsIGZhbHNlLCB0cnVlICk7IH0gLy8gYWxsb3cgcGVuZGluZyBibG9ja3MgLyBkaXJ0eVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5EaXNwbGF5KCAnZHJhd2FibGUgYmxvY2sgY2hhbmdlIHBoYXNlJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgIHdoaWxlICggdGhpcy5fZHJhd2FibGVzVG9DaGFuZ2VCbG9jay5sZW5ndGggKSB7XG4gICAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5fZHJhd2FibGVzVG9DaGFuZ2VCbG9jay5wb3AoKSEudXBkYXRlQmxvY2soKTtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igc2NlbmVyeSBuYW1lc3BhY2VcbiAgICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgJiYgY2hhbmdlZCApIHtcbiAgICAgICAgdGhpcy5wZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50ISsrO1xuICAgICAgfVxuICAgIH1cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9yb290QmFja2JvbmUhLmF1ZGl0KCBmYWxzZSwgZmFsc2UsIHRydWUgKTsgfSAvLyBhbGxvdyBvbmx5IGRpcnR5XG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9iYXNlSW5zdGFuY2UhLmF1ZGl0KCB0aGlzLl9mcmFtZUlkLCBmYWxzZSApOyB9XG5cbiAgICAvLyBwcmUtcmVwYWludCBwaGFzZTogdXBkYXRlIHJlbGF0aXZlIHRyYW5zZm9ybSBpbmZvcm1hdGlvbiBmb3IgbGlzdGVuZXJzIChub3RpZmljYXRpb24pIGFuZCBwcmVjb21wdXRhdGlvbiB3aGVyZSBkZXNpcmVkXG4gICAgdGhpcy51cGRhdGVEaXJ0eVRyYW5zZm9ybVJvb3RzKCk7XG4gICAgLy8gcHJlLXJlcGFpbnQgcGhhc2UgdXBkYXRlIHZpc2liaWxpdHkgaW5mb3JtYXRpb24gb24gaW5zdGFuY2VzXG4gICAgdGhpcy5fYmFzZUluc3RhbmNlIS51cGRhdGVWaXNpYmlsaXR5KCB0cnVlLCB0cnVlLCB0cnVlLCBmYWxzZSApO1xuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fYmFzZUluc3RhbmNlIS5hdWRpdFZpc2liaWxpdHkoIHRydWUgKTsgfVxuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9iYXNlSW5zdGFuY2UhLmF1ZGl0KCB0aGlzLl9mcmFtZUlkLCB0cnVlICk7IH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggJ2luc3RhbmNlIHJvb3QgZGlzcG9zYWwgcGhhc2UnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgLy8gZGlzcG9zZSBhbGwgb2Ygb3VyIGluc3RhbmNlcy4gZGlzcG9zaW5nIHRoZSByb290IHdpbGwgY2F1c2UgYWxsIGRlc2NlbmRhbnRzIHRvIGFsc28gYmUgZGlzcG9zZWQuXG4gICAgLy8gd2lsbCBhbHNvIGRpc3Bvc2UgYXR0YWNoZWQgZHJhd2FibGVzIChzZWxmL2dyb3VwL2V0Yy4pXG4gICAgd2hpbGUgKCB0aGlzLl9pbnN0YW5jZVJvb3RzVG9EaXNwb3NlLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlUm9vdHNUb0Rpc3Bvc2UucG9wKCkhLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcm9vdE5vZGUuYXVkaXRJbnN0YW5jZVN1YnRyZWVGb3JEaXNwbGF5KCB0aGlzICk7IH0gLy8gbWFrZSBzdXJlIHRyYWlscyBhcmUgdmFsaWRcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggJ2RyYXdhYmxlIGRpc3Bvc2FsIHBoYXNlJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgIC8vIGRpc3Bvc2UgYWxsIG9mIG91ciBvdGhlciBkcmF3YWJsZXMuXG4gICAgd2hpbGUgKCB0aGlzLl9kcmF3YWJsZXNUb0Rpc3Bvc2UubGVuZ3RoICkge1xuICAgICAgdGhpcy5fZHJhd2FibGVzVG9EaXNwb3NlLnBvcCgpIS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX2Jhc2VJbnN0YW5jZSEuYXVkaXQoIHRoaXMuX2ZyYW1lSWQsIGZhbHNlICk7IH1cblxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgYXNzZXJ0KCAhdGhpcy5faXNQYWludGluZywgJ0Rpc3BsYXkgd2FzIGFscmVhZHkgdXBkYXRpbmcgcGFpbnQsIG1heSBoYXZlIHRocm93biBhbiBlcnJvciBvbiB0aGUgbGFzdCB1cGRhdGUnICk7XG4gICAgICB0aGlzLl9pc1BhaW50aW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyByZXBhaW50IHBoYXNlXG4gICAgLy9PSFRXTyBUT0RPOiBjYW4gYW55dGhpbmcgYmUgdXBkYXRlZCBtb3JlIGVmZmljaWVudGx5IGJ5IHRyYWNraW5nIGF0IHRoZSBEaXNwbGF5IGxldmVsPyBSZW1lbWJlciwgd2UgaGF2ZSByZWN1cnNpdmUgdXBkYXRlcyBzbyB0aGluZ3MgZ2V0IHVwZGF0ZWQgaW4gdGhlIHJpZ2h0IG9yZGVyISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggJ3JlcGFpbnQgcGhhc2UnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5fcm9vdEJhY2tib25lIS51cGRhdGUoKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRGlzcGxheSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICB0aGlzLl9pc1BhaW50aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9yb290QmFja2JvbmUhLmF1ZGl0KCBmYWxzZSwgZmFsc2UsIGZhbHNlICk7IH0gLy8gYWxsb3cgbm90aGluZ1xuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fYmFzZUluc3RhbmNlIS5hdWRpdCggdGhpcy5fZnJhbWVJZCwgZmFsc2UgKTsgfVxuXG4gICAgdGhpcy51cGRhdGVDdXJzb3IoKTtcbiAgICB0aGlzLnVwZGF0ZUJhY2tncm91bmRDb2xvcigpO1xuXG4gICAgdGhpcy51cGRhdGVTaXplKCk7XG5cbiAgICBpZiAoIHRoaXMuX292ZXJsYXlzLmxlbmd0aCApIHtcbiAgICAgIGxldCB6SW5kZXggPSB0aGlzLl9yb290QmFja2JvbmUhLmxhc3RaSW5kZXghO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fb3ZlcmxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIC8vIGxheWVyIHRoZSBvdmVybGF5cyBwcm9wZXJseVxuICAgICAgICBjb25zdCBvdmVybGF5ID0gdGhpcy5fb3ZlcmxheXNbIGkgXTtcbiAgICAgICAgb3ZlcmxheS5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9ICcnICsgKCB6SW5kZXgrKyApO1xuXG4gICAgICAgIG92ZXJsYXkudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWZ0ZXIgb3VyIHVwZGF0ZSBhbmQgZGlzcG9zYWxzLCB3ZSB3YW50IHRvIGVsaW1pbmF0ZSBhbnkgbWVtb3J5IGxlYWtzIGZyb20gYW55dGhpbmcgdGhhdCB3YXNuJ3QgdXBkYXRlZC5cbiAgICB3aGlsZSAoIHRoaXMuX3JlZHVjZVJlZmVyZW5jZXNOZWVkZWQubGVuZ3RoICkge1xuICAgICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZC5wb3AoKSEucmVkdWNlUmVmZXJlbmNlcygpO1xuICAgIH1cblxuICAgIHRoaXMuX2ZyYW1lSWQrKztcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBzY2VuZXJ5IG5hbWVzcGFjZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgKSB7XG4gICAgICBjb25zdCBzeW5jVHJlZU1lc3NhZ2UgPSBgc3luY1RyZWUgY291bnQ6ICR7dGhpcy5wZXJmU3luY1RyZWVDb3VudH1gO1xuICAgICAgaWYgKCB0aGlzLnBlcmZTeW5jVHJlZUNvdW50ISA+IDUwMCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmQ3JpdGljYWwgJiYgc2NlbmVyeUxvZy5QZXJmQ3JpdGljYWwoIHN5bmNUcmVlTWVzc2FnZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMucGVyZlN5bmNUcmVlQ291bnQhID4gMTAwICkge1xuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZNYWpvciAmJiBzY2VuZXJ5TG9nLlBlcmZNYWpvciggc3luY1RyZWVNZXNzYWdlICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5wZXJmU3luY1RyZWVDb3VudCEgPiAyMCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWlub3IgJiYgc2NlbmVyeUxvZy5QZXJmTWlub3IoIHN5bmNUcmVlTWVzc2FnZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMucGVyZlN5bmNUcmVlQ291bnQhID4gMCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmVmVyYm9zZSAmJiBzY2VuZXJ5TG9nLlBlcmZWZXJib3NlKCBzeW5jVHJlZU1lc3NhZ2UgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZHJhd2FibGVCbG9ja0NvdW50TWVzc2FnZSA9IGBkcmF3YWJsZSBibG9jayBjaGFuZ2VzOiAke3RoaXMucGVyZkRyYXdhYmxlQmxvY2tDaGFuZ2VDb3VudH0gZm9yYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCAtJHt0aGlzLnBlcmZEcmF3YWJsZU9sZEludGVydmFsQ291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ICske3RoaXMucGVyZkRyYXdhYmxlTmV3SW50ZXJ2YWxDb3VudH1gO1xuICAgICAgaWYgKCB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQhID4gMjAwICkge1xuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZDcml0aWNhbCAmJiBzY2VuZXJ5TG9nLlBlcmZDcml0aWNhbCggZHJhd2FibGVCbG9ja0NvdW50TWVzc2FnZSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMucGVyZkRyYXdhYmxlQmxvY2tDaGFuZ2VDb3VudCEgPiA2MCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWFqb3IgJiYgc2NlbmVyeUxvZy5QZXJmTWFqb3IoIGRyYXdhYmxlQmxvY2tDb3VudE1lc3NhZ2UgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLnBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQhID4gMTAgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cuUGVyZk1pbm9yICYmIHNjZW5lcnlMb2cuUGVyZk1pbm9yKCBkcmF3YWJsZUJsb2NrQ291bnRNZXNzYWdlICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5wZXJmRHJhd2FibGVCbG9ja0NoYW5nZUNvdW50ISA+IDAgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cuUGVyZlZlcmJvc2UgJiYgc2NlbmVyeUxvZy5QZXJmVmVyYm9zZSggZHJhd2FibGVCbG9ja0NvdW50TWVzc2FnZSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIFBET01UcmVlLmF1ZGl0UERPTURpc3BsYXlzKCB0aGlzLnJvb3ROb2RlICk7XG5cbiAgICBpZiAoIHRoaXMuX2ZvcmNlU1ZHUmVmcmVzaCB8fCB0aGlzLl9yZWZyZXNoU1ZHUGVuZGluZyApIHtcbiAgICAgIHRoaXMuX3JlZnJlc2hTVkdQZW5kaW5nID0gZmFsc2U7XG5cbiAgICAgIHRoaXMucmVmcmVzaFNWRygpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvLyBVc2VkIGZvciBTdHVkaW8gQXV0b3NlbGVjdCB0byBkZXRlcm1pbmUgdGhlIGxlYWZpZXN0IFBoRVQtaU8gRWxlbWVudCB1bmRlciB0aGUgbW91c2VcbiAgcHVibGljIGdldFBoZXRpb0VsZW1lbnRBdCggcG9pbnQ6IFZlY3RvcjIgKTogUGhldGlvT2JqZWN0IHwgbnVsbCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3Jvb3ROb2RlLmdldFBoZXRpb01vdXNlSGl0KCBwb2ludCApO1xuXG4gICAgaWYgKCBub2RlID09PSAncGhldGlvTm90U2VsZWN0YWJsZScgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIG5vZGUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdhIFBoZXRpb01vdXNlSGl0IHNob3VsZCBiZSBpbnN0cnVtZW50ZWQnICk7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTaXplKCk6IHZvaWQge1xuICAgIGxldCBzaXplRGlydHkgPSBmYWxzZTtcbiAgICAvL09IVFdPIFRPRE86IGlmIHdlIGFyZW4ndCBjbGlwcGluZyBvciBzZXR0aW5nIGJhY2tncm91bmQgY29sb3JzLCBjYW4gd2UgZ2V0IGF3YXkgd2l0aCBoYXZpbmcgYSAweDAgY29udGFpbmVyIGRpdiBhbmQgdXNpbmcgYWJzb2x1dGVseS1wb3NpdGlvbmVkIGNoaWxkcmVuPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggdGhpcy5zaXplLndpZHRoICE9PSB0aGlzLl9jdXJyZW50U2l6ZS53aWR0aCApIHtcbiAgICAgIHNpemVEaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLl9jdXJyZW50U2l6ZS53aWR0aCA9IHRoaXMuc2l6ZS53aWR0aDtcbiAgICAgIHRoaXMuX2RvbUVsZW1lbnQuc3R5bGUud2lkdGggPSBgJHt0aGlzLnNpemUud2lkdGh9cHhgO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuc2l6ZS5oZWlnaHQgIT09IHRoaXMuX2N1cnJlbnRTaXplLmhlaWdodCApIHtcbiAgICAgIHNpemVEaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLl9jdXJyZW50U2l6ZS5oZWlnaHQgPSB0aGlzLnNpemUuaGVpZ2h0O1xuICAgICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBgJHt0aGlzLnNpemUuaGVpZ2h0fXB4YDtcbiAgICB9XG4gICAgaWYgKCBzaXplRGlydHkgJiYgIXRoaXMuX2FsbG93U2NlbmVPdmVyZmxvdyApIHtcbiAgICAgIC8vIHRvIHByZXZlbnQgb3ZlcmZsb3csIHdlIGFkZCBhIENTUyBjbGlwXG4gICAgICAvL1RPRE86IDBweCA9PiAwPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5jbGlwID0gYHJlY3QoMHB4LCR7dGhpcy5zaXplLndpZHRofXB4LCR7dGhpcy5zaXplLmhlaWdodH1weCwwcHgpYDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBXZWJHTCBpcyBhbGxvd2VkIHRvIGJlIHVzZWQgaW4gZHJhd2FibGVzIGZvciB0aGlzIERpc3BsYXlcbiAgICovXG4gIHB1YmxpYyBpc1dlYkdMQWxsb3dlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb3dXZWJHTDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgd2ViZ2xBbGxvd2VkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1dlYkdMQWxsb3dlZCgpOyB9XG5cbiAgcHVibGljIGdldFJvb3ROb2RlKCk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLl9yb290Tm9kZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcm9vdE5vZGUoKTogTm9kZSB7IHJldHVybiB0aGlzLmdldFJvb3ROb2RlKCk7IH1cblxuICBwdWJsaWMgZ2V0Um9vdEJhY2tib25lKCk6IEJhY2tib25lRHJhd2FibGUge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Jvb3RCYWNrYm9uZSApO1xuICAgIHJldHVybiB0aGlzLl9yb290QmFja2JvbmUhO1xuICB9XG5cbiAgcHVibGljIGdldCByb290QmFja2JvbmUoKTogQmFja2JvbmVEcmF3YWJsZSB7IHJldHVybiB0aGlzLmdldFJvb3RCYWNrYm9uZSgpOyB9XG5cbiAgLyoqXG4gICAqIFRoZSBkaW1lbnNpb25zIG9mIHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnRcbiAgICovXG4gIHB1YmxpYyBnZXRTaXplKCk6IERpbWVuc2lvbjIge1xuICAgIHJldHVybiB0aGlzLnNpemVQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2l6ZSgpOiBEaW1lbnNpb24yIHsgcmV0dXJuIHRoaXMuZ2V0U2l6ZSgpOyB9XG5cbiAgcHVibGljIGdldEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5zaXplLnRvQm91bmRzKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7IH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgc2l6ZSB0aGF0IHRoZSBEaXNwbGF5J3MgRE9NIGVsZW1lbnQgd2lsbCBiZSBhZnRlciB0aGUgbmV4dCB1cGRhdGVEaXNwbGF5KClcbiAgICovXG4gIHB1YmxpYyBzZXRTaXplKCBzaXplOiBEaW1lbnNpb24yICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNpemUud2lkdGggJSAxID09PSAwLCAnRGlzcGxheS53aWR0aCBzaG91bGQgYmUgYW4gaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaXplLndpZHRoID4gMCwgJ0Rpc3BsYXkud2lkdGggc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiB6ZXJvJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNpemUuaGVpZ2h0ICUgMSA9PT0gMCwgJ0Rpc3BsYXkuaGVpZ2h0IHNob3VsZCBiZSBhbiBpbnRlZ2VyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNpemUuaGVpZ2h0ID4gMCwgJ0Rpc3BsYXkuaGVpZ2h0IHNob3VsZCBiZSBncmVhdGVyIHRoYW4gemVybycgKTtcblxuICAgIHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlID0gc2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBzaXplIHRoYXQgdGhlIERpc3BsYXkncyBET00gZWxlbWVudCB3aWxsIGJlIGFmdGVyIHRoZSBuZXh0IHVwZGF0ZURpc3BsYXkoKVxuICAgKi9cbiAgcHVibGljIHNldFdpZHRoSGVpZ2h0KCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnNldFNpemUoIG5ldyBEaW1lbnNpb24yKCB3aWR0aCwgaGVpZ2h0ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgd2lkdGggb2YgdGhlIERpc3BsYXkncyBET00gZWxlbWVudFxuICAgKi9cbiAgcHVibGljIGdldFdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZS53aWR0aDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKTsgfVxuXG4gIHB1YmxpYyBzZXQgd2lkdGgoIHZhbHVlOiBudW1iZXIgKSB7IHRoaXMuc2V0V2lkdGgoIHZhbHVlICk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgd2lkdGggdGhhdCB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgYWZ0ZXIgdGhlIG5leHQgdXBkYXRlRGlzcGxheSgpLiBTaG91bGQgYmUgYW4gaW50ZWdyYWwgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgc2V0V2lkdGgoIHdpZHRoOiBudW1iZXIgKTogdGhpcyB7XG5cbiAgICBpZiAoIHRoaXMuZ2V0V2lkdGgoKSAhPT0gd2lkdGggKSB7XG4gICAgICB0aGlzLnNldFNpemUoIG5ldyBEaW1lbnNpb24yKCB3aWR0aCwgdGhpcy5nZXRIZWlnaHQoKSApICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGhlaWdodCBvZiB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50XG4gICAqL1xuICBwdWJsaWMgZ2V0SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZS5oZWlnaHQ7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKTsgfVxuXG4gIHB1YmxpYyBzZXQgaGVpZ2h0KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEhlaWdodCggdmFsdWUgKTsgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgdGhhdCB0aGUgRGlzcGxheSdzIERPTSBlbGVtZW50IHdpbGwgYmUgYWZ0ZXIgdGhlIG5leHQgdXBkYXRlRGlzcGxheSgpLiBTaG91bGQgYmUgYW4gaW50ZWdyYWwgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgc2V0SGVpZ2h0KCBoZWlnaHQ6IG51bWJlciApOiB0aGlzIHtcblxuICAgIGlmICggdGhpcy5nZXRIZWlnaHQoKSAhPT0gaGVpZ2h0ICkge1xuICAgICAgdGhpcy5zZXRTaXplKCBuZXcgRGltZW5zaW9uMiggdGhpcy5nZXRXaWR0aCgpLCBoZWlnaHQgKSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgYmUgYXBwbGllZCB0byB0aGUgcm9vdCBET00gZWxlbWVudCBvbiB1cGRhdGVEaXNwbGF5KCksIGFuZCBubyBzb29uZXIuXG4gICAqL1xuICBwdWJsaWMgc2V0QmFja2dyb3VuZENvbG9yKCBjb2xvcjogQ29sb3IgfCBzdHJpbmcgfCBudWxsICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbG9yID09PSBudWxsIHx8IHR5cGVvZiBjb2xvciA9PT0gJ3N0cmluZycgfHwgY29sb3IgaW5zdGFuY2VvZiBDb2xvciApO1xuXG4gICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYmFja2dyb3VuZENvbG9yKCB2YWx1ZTogQ29sb3IgfCBzdHJpbmcgfCBudWxsICkgeyB0aGlzLnNldEJhY2tncm91bmRDb2xvciggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgYmFja2dyb3VuZENvbG9yKCk6IENvbG9yIHwgc3RyaW5nIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEJhY2tncm91bmRDb2xvcigpOyB9XG5cbiAgcHVibGljIGdldEJhY2tncm91bmRDb2xvcigpOiBDb2xvciB8IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kQ29sb3I7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGludGVyYWN0aXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmU7IH1cblxuICBwdWJsaWMgc2V0IGludGVyYWN0aXZlKCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICBpZiAoIHRoaXMuX2FjY2Vzc2libGUgJiYgdmFsdWUgIT09IHRoaXMuX2ludGVyYWN0aXZlICkge1xuICAgICAgdGhpcy5fcm9vdFBET01JbnN0YW5jZSEucGVlciEucmVjdXJzaXZlRGlzYWJsZSggIXZhbHVlICk7XG4gICAgfVxuXG4gICAgdGhpcy5faW50ZXJhY3RpdmUgPSB2YWx1ZTtcbiAgICBpZiAoICF0aGlzLl9pbnRlcmFjdGl2ZSAmJiB0aGlzLl9pbnB1dCApIHtcbiAgICAgIHRoaXMuX2lucHV0LmludGVycnVwdFBvaW50ZXJzKCk7XG4gICAgICB0aGlzLl9pbnB1dC5jbGVhckJhdGNoZWRFdmVudHMoKTtcbiAgICAgIHRoaXMuX2lucHV0LnJlbW92ZVRlbXBvcmFyeVBvaW50ZXJzKCk7XG4gICAgICB0aGlzLl9yb290Tm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcbiAgICAgIHRoaXMuaW50ZXJydXB0SW5wdXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBvdmVybGF5IHRvIHRoZSBEaXNwbGF5LiBFYWNoIG92ZXJsYXkgc2hvdWxkIGhhdmUgYSAuZG9tRWxlbWVudCAodGhlIERPTSBlbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIGZvclxuICAgKiBkaXNwbGF5KSBhbmQgYW4gLnVwZGF0ZSgpIG1ldGhvZC5cbiAgICovXG4gIHB1YmxpYyBhZGRPdmVybGF5KCBvdmVybGF5OiBUT3ZlcmxheSApOiB2b2lkIHtcbiAgICB0aGlzLl9vdmVybGF5cy5wdXNoKCBvdmVybGF5ICk7XG4gICAgdGhpcy5fZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggb3ZlcmxheS5kb21FbGVtZW50ICk7XG5cbiAgICAvLyBlbnN1cmUgdGhhdCB0aGUgb3ZlcmxheSBpcyBoaWRkZW4gZnJvbSBzY3JlZW4gcmVhZGVycywgYWxsIGFjY2Vzc2libGUgY29udGVudCBzaG91bGQgYmUgaW4gdGhlIGRvbSBlbGVtZW50XG4gICAgLy8gb2YgdGhlIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2VcbiAgICBvdmVybGF5LmRvbUVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIG92ZXJsYXkgZnJvbSB0aGUgZGlzcGxheS5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVPdmVybGF5KCBvdmVybGF5OiBUT3ZlcmxheSApOiB2b2lkIHtcbiAgICB0aGlzLl9kb21FbGVtZW50LnJlbW92ZUNoaWxkKCBvdmVybGF5LmRvbUVsZW1lbnQgKTtcbiAgICB0aGlzLl9vdmVybGF5cy5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5fb3ZlcmxheXMsIG92ZXJsYXkgKSwgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcm9vdCBhY2Nlc3NpYmxlIERPTSBlbGVtZW50IHdoaWNoIHJlcHJlc2VudHMgdGhpcyBkaXNwbGF5IGFuZCBwcm92aWRlcyBzZW1hbnRpY3MgZm9yIGFzc2lzdGl2ZVxuICAgKiB0ZWNobm9sb2d5LiBJZiB0aGlzIERpc3BsYXkgaXMgbm90IGFjY2Vzc2libGUsIHJldHVybnMgbnVsbC5cbiAgICovXG4gIHB1YmxpYyBnZXRQRE9NUm9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fYWNjZXNzaWJsZSA/IHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLnBlZXIhLnByaW1hcnlTaWJsaW5nIDogbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGRvbVJvb3RFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01Sb290RWxlbWVudCgpOyB9XG5cbiAgLyoqXG4gICAqIEhhcyB0aGlzIERpc3BsYXkgZW5hYmxlZCBhY2Nlc3NpYmlsaXR5IGZlYXR1cmVzIGxpa2UgUERPTSBjcmVhdGlvbiBhbmQgc3VwcG9ydC5cbiAgICovXG4gIHB1YmxpYyBpc0FjY2Vzc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FjY2Vzc2libGU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IGlzIGluIHRoZSBQRE9NLiBUaGF0IGlzIG9ubHkgcG9zc2libGUgaWYgdGhlIGRpc3BsYXkgaXMgYWNjZXNzaWJsZS5cbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICogQHBhcmFtIGFsbG93Um9vdCAtIElmIHRydWUsIHRoZSByb290IG9mIHRoZSBQRE9NIGlzIGFsc28gY29uc2lkZXJlZCB0byBiZSBcInVuZGVyXCIgdGhlIFBET00uXG4gICAqL1xuICBwdWJsaWMgaXNFbGVtZW50VW5kZXJQRE9NKCBlbGVtZW50OiBFbGVtZW50LCBhbGxvd1Jvb3Q6IGJvb2xlYW4gKTogYm9vbGVhbiB7XG4gICAgaWYgKCAhdGhpcy5fYWNjZXNzaWJsZSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0VsZW1lbnRDb250YWluZWQgPSB0aGlzLnBkb21Sb290RWxlbWVudCEuY29udGFpbnMoIGVsZW1lbnQgKTtcbiAgICBjb25zdCBpc05vdFJvb3RFbGVtZW50ID0gZWxlbWVudCAhPT0gdGhpcy5wZG9tUm9vdEVsZW1lbnQ7XG5cbiAgICAvLyBJZiBhbGxvd1Jvb3QgaXMgdHJ1ZSwganVzdCByZXR1cm4gaWYgdGhlIGVsZW1lbnQgaXMgY29udGFpbmVkLlxuICAgIC8vIE90aGVyd2lzZSwgYWxzbyBlbnN1cmUgaXQncyBub3QgdGhlIHJvb3QgZWxlbWVudCBpdHNlbGYuXG4gICAgcmV0dXJuIGFsbG93Um9vdCA/IGlzRWxlbWVudENvbnRhaW5lZCA6ICggaXNFbGVtZW50Q29udGFpbmVkICYmIGlzTm90Um9vdEVsZW1lbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRzIGEgd29ya2Fyb3VuZCB0aGF0IHByZXZlbnRzIERPTSBmb2N1cyBmcm9tIGxlYXZpbmcgdGhlIERpc3BsYXkgaW4gRnVsbFNjcmVlbiBtb2RlLiBUaGVyZSBpc1xuICAgKiBhIGJ1ZyBpbiBzb21lIGJyb3dzZXJzIHdoZXJlIERPTSBmb2N1cyBjYW4gYmUgcGVybWFuZW50bHkgbG9zdCBpZiB0YWJiaW5nIG91dCBvZiB0aGUgRnVsbFNjcmVlbiBlbGVtZW50LFxuICAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg4My5cbiAgICovXG4gIHByaXZhdGUgaGFuZGxlRnVsbFNjcmVlbk5hdmlnYXRpb24oIGRvbUV2ZW50OiBLZXlib2FyZEV2ZW50ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGRvbVJvb3RFbGVtZW50LCAnVGhlcmUgbXVzdCBiZSBhIFBET00gdG8gc3VwcG9ydCBrZXlib2FyZCBuYXZpZ2F0aW9uJyApO1xuXG4gICAgaWYgKCBGdWxsU2NyZWVuLmlzRnVsbFNjcmVlbigpICYmIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZG9tRXZlbnQsIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApICkge1xuICAgICAgY29uc3Qgcm9vdEVsZW1lbnQgPSB0aGlzLnBkb21Sb290RWxlbWVudDtcbiAgICAgIGNvbnN0IG5leHRFbGVtZW50ID0gZG9tRXZlbnQuc2hpZnRLZXkgPyBQRE9NVXRpbHMuZ2V0UHJldmlvdXNGb2N1c2FibGUoIHJvb3RFbGVtZW50IHx8IHVuZGVmaW5lZCApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgUERPTVV0aWxzLmdldE5leHRGb2N1c2FibGUoIHJvb3RFbGVtZW50IHx8IHVuZGVmaW5lZCApO1xuICAgICAgaWYgKCBuZXh0RWxlbWVudCA9PT0gZG9tRXZlbnQudGFyZ2V0ICkge1xuICAgICAgICBkb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXRtYXNrIHVuaW9uIG9mIGFsbCByZW5kZXJlcnMgKGNhbnZhcy9zdmcvZG9tL3dlYmdsKSB0aGF0IGFyZSB1c2VkIGZvciBkaXNwbGF5LCBleGNsdWRpbmdcbiAgICogQmFja2JvbmVEcmF3YWJsZXMgKHdoaWNoIHdvdWxkIGJlIERPTSkuXG4gICAqL1xuICBwdWJsaWMgZ2V0VXNlZFJlbmRlcmVyc0JpdG1hc2soKTogbnVtYmVyIHtcbiAgICBmdW5jdGlvbiByZW5kZXJlcnNVbmRlckJhY2tib25lKCBiYWNrYm9uZTogQmFja2JvbmVEcmF3YWJsZSApOiBudW1iZXIge1xuICAgICAgbGV0IGJpdG1hc2sgPSAwO1xuICAgICAgXy5lYWNoKCBiYWNrYm9uZS5ibG9ja3MsIGJsb2NrID0+IHtcbiAgICAgICAgaWYgKCBibG9jayBpbnN0YW5jZW9mIERPTUJsb2NrICYmIGJsb2NrLmRvbURyYXdhYmxlIGluc3RhbmNlb2YgQmFja2JvbmVEcmF3YWJsZSApIHtcbiAgICAgICAgICBiaXRtYXNrID0gYml0bWFzayB8IHJlbmRlcmVyc1VuZGVyQmFja2JvbmUoIGJsb2NrLmRvbURyYXdhYmxlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYml0bWFzayA9IGJpdG1hc2sgfCBibG9jay5yZW5kZXJlcjtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgICAgcmV0dXJuIGJpdG1hc2s7XG4gICAgfVxuXG4gICAgLy8gb25seSByZXR1cm4gdGhlIHJlbmRlcmVyLXNwZWNpZmljIHBvcnRpb24gKG5vIG90aGVyIGhpbnRzLCBldGMpXG4gICAgcmV0dXJuIHJlbmRlcmVyc1VuZGVyQmFja2JvbmUoIHRoaXMuX3Jvb3RCYWNrYm9uZSEgKSAmIFJlbmRlcmVyLmJpdG1hc2tSZW5kZXJlckFyZWE7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gSW5zdGFuY2VzIHRoYXQgd2lsbCBuZWVkIGEgdHJhbnNmb3JtIHVwZGF0ZSAoZm9yIGxpc3RlbmVycyBhbmQgcHJlY29tcHV0YXRpb24pLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIGluc3RhbmNlXG4gICAqIEBwYXJhbSBwYXNzVHJhbnNmb3JtIC0gV2hldGhlciB3ZSBzaG91bGQgcGFzcyB0aGUgZmlyc3QgdHJhbnNmb3JtIHJvb3Qgd2hlbiB2YWxpZGF0aW5nIHRyYW5zZm9ybXMgKHNob3VsZFxuICAgKiBiZSB0cnVlIGlmIHRoZSBpbnN0YW5jZSBpcyB0cmFuc2Zvcm1lZClcbiAgICovXG4gIHB1YmxpYyBtYXJrVHJhbnNmb3JtUm9vdERpcnR5KCBpbnN0YW5jZTogSW5zdGFuY2UsIHBhc3NUcmFuc2Zvcm06IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgcGFzc1RyYW5zZm9ybSA/IHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHMucHVzaCggaW5zdGFuY2UgKSA6IHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcy5wdXNoKCBpbnN0YW5jZSApO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVEaXJ0eVRyYW5zZm9ybVJvb3RzKCk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy50cmFuc2Zvcm1TeXN0ZW0gJiYgc2NlbmVyeUxvZy50cmFuc2Zvcm1TeXN0ZW0oICd1cGRhdGVEaXJ0eVRyYW5zZm9ybVJvb3RzJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy50cmFuc2Zvcm1TeXN0ZW0gJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgd2hpbGUgKCB0aGlzLl9kaXJ0eVRyYW5zZm9ybVJvb3RzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHMucG9wKCkhLnJlbGF0aXZlVHJhbnNmb3JtLnVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUoIGZhbHNlLCBmYWxzZSwgdGhpcy5fZnJhbWVJZCwgdHJ1ZSApO1xuICAgIH1cbiAgICB3aGlsZSAoIHRoaXMuX2RpcnR5VHJhbnNmb3JtUm9vdHNXaXRob3V0UGFzcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLl9kaXJ0eVRyYW5zZm9ybVJvb3RzV2l0aG91dFBhc3MucG9wKCkhLnJlbGF0aXZlVHJhbnNmb3JtLnVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUoIGZhbHNlLCBmYWxzZSwgdGhpcy5fZnJhbWVJZCwgZmFsc2UgKTtcbiAgICB9XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLnRyYW5zZm9ybVN5c3RlbSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jayggZHJhd2FibGU6IERyYXdhYmxlICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggYG1hcmtEcmF3YWJsZUNoYW5nZWRCbG9jazogJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcbiAgICB0aGlzLl9kcmF3YWJsZXNUb0NoYW5nZUJsb2NrLnB1c2goIGRyYXdhYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgYW4gaXRlbSBmb3IgbGF0ZXIgcmVkdWNlUmVmZXJlbmNlcygpIGNhbGxzIGF0IHRoZSBlbmQgb2YgRGlzcGxheS51cGRhdGUoKS5cbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgbWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzKCBpdGVtOiB7IHJlZHVjZVJlZmVyZW5jZXM6ICgpID0+IHZvaWQgfSApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIWl0ZW0ucmVkdWNlUmVmZXJlbmNlcyApO1xuXG4gICAgdGhpcy5fcmVkdWNlUmVmZXJlbmNlc05lZWRlZC5wdXNoKCBpdGVtICk7XG4gIH1cblxuICAvKipcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgbWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsKCBpbnN0YW5jZTogSW5zdGFuY2UgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkRpc3BsYXkgJiYgc2NlbmVyeUxvZy5EaXNwbGF5KCBgbWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsOiAke2luc3RhbmNlLnRvU3RyaW5nKCl9YCApO1xuICAgIHRoaXMuX2luc3RhbmNlUm9vdHNUb0Rpc3Bvc2UucHVzaCggaW5zdGFuY2UgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBtYXJrRHJhd2FibGVGb3JEaXNwb3NhbCggZHJhd2FibGU6IERyYXdhYmxlICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5EaXNwbGF5ICYmIHNjZW5lcnlMb2cuRGlzcGxheSggYG1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsOiAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIHRoaXMuX2RyYXdhYmxlc1RvRGlzcG9zZS5wdXNoKCBkcmF3YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG1hcmtEcmF3YWJsZUZvckxpbmtzVXBkYXRlKCBkcmF3YWJsZTogRHJhd2FibGUgKTogdm9pZCB7XG4gICAgdGhpcy5fZHJhd2FibGVzVG9VcGRhdGVMaW5rcy5wdXNoKCBkcmF3YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHtDaGFuZ2VJbnRlcnZhbH0gZm9yIHRoZSBcInJlbW92ZSBjaGFuZ2UgaW50ZXJ2YWwgaW5mb1wiIHBoYXNlICh3ZSBkb24ndCB3YW50IHRvIGxlYWsgbWVtb3J5L3JlZmVyZW5jZXMpXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG1hcmtDaGFuZ2VJbnRlcnZhbFRvRGlzcG9zZSggY2hhbmdlSW50ZXJ2YWw6IENoYW5nZUludGVydmFsICk6IHZvaWQge1xuICAgIHRoaXMuX2NoYW5nZUludGVydmFsc1RvRGlzcG9zZS5wdXNoKCBjaGFuZ2VJbnRlcnZhbCApO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVCYWNrZ3JvdW5kQ29sb3IoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYmFja2dyb3VuZENvbG9yID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRoaXMuX2JhY2tncm91bmRDb2xvciA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgaW5zdGFuY2VvZiBDb2xvciApO1xuXG4gICAgY29uc3QgbmV3QmFja2dyb3VuZENTUyA9IHRoaXMuX2JhY2tncm91bmRDb2xvciA9PT0gbnVsbCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAoIHRoaXMuX2JhY2tncm91bmRDb2xvciBhcyBDb2xvciApLnRvQ1NTID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuX2JhY2tncm91bmRDb2xvciBhcyBDb2xvciApLnRvQ1NTKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciBhcyBzdHJpbmcgKTtcbiAgICBpZiAoIG5ld0JhY2tncm91bmRDU1MgIT09IHRoaXMuX2N1cnJlbnRCYWNrZ3JvdW5kQ1NTICkge1xuICAgICAgdGhpcy5fY3VycmVudEJhY2tncm91bmRDU1MgPSBuZXdCYWNrZ3JvdW5kQ1NTO1xuXG4gICAgICB0aGlzLl9kb21FbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG5ld0JhY2tncm91bmRDU1M7XG4gICAgfVxuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIEN1cnNvcnNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICBwcml2YXRlIHVwZGF0ZUN1cnNvcigpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuX2lucHV0ICYmIHRoaXMuX2lucHV0Lm1vdXNlICYmIHRoaXMuX2lucHV0Lm1vdXNlLnBvaW50ICkge1xuICAgICAgaWYgKCB0aGlzLl9pbnB1dC5tb3VzZS5jdXJzb3IgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DdXJzb3IgJiYgc2NlbmVyeUxvZy5DdXJzb3IoIGBzZXQgb24gcG9pbnRlcjogJHt0aGlzLl9pbnB1dC5tb3VzZS5jdXJzb3J9YCApO1xuICAgICAgICB0aGlzLnNldFNjZW5lQ3Vyc29yKCB0aGlzLl9pbnB1dC5tb3VzZS5jdXJzb3IgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvL09IVFdPIFRPRE86IEZvciBhIGRpc3BsYXksIGp1c3QgcmV0dXJuIGFuIGluc3RhbmNlIGFuZCB3ZSBjYW4gYXZvaWQgdGhlIGdhcmJhZ2UgY29sbGVjdGlvbi9tdXRhdGlvbiBhdCB0aGUgY29zdCBvZiB0aGUgbGlua2VkLWxpc3QgdHJhdmVyc2FsIGluc3RlYWQgb2YgYW4gYXJyYXkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGNvbnN0IG1vdXNlVHJhaWwgPSB0aGlzLl9yb290Tm9kZS50cmFpbFVuZGVyUG9pbnRlciggdGhpcy5faW5wdXQubW91c2UgKTtcblxuICAgICAgaWYgKCBtb3VzZVRyYWlsICkge1xuICAgICAgICBmb3IgKCBsZXQgaSA9IG1vdXNlVHJhaWwuZ2V0Q3Vyc29yQ2hlY2tJbmRleCgpOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gbW91c2VUcmFpbC5ub2Rlc1sgaSBdO1xuICAgICAgICAgIGNvbnN0IGN1cnNvciA9IG5vZGUuZ2V0RWZmZWN0aXZlQ3Vyc29yKCk7XG5cbiAgICAgICAgICBpZiAoIGN1cnNvciApIHtcbiAgICAgICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DdXJzb3IgJiYgc2NlbmVyeUxvZy5DdXJzb3IoIGAke2N1cnNvcn0gb24gJHtub2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7bm9kZS5pZH1gICk7XG4gICAgICAgICAgICB0aGlzLnNldFNjZW5lQ3Vyc29yKCBjdXJzb3IgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkN1cnNvciAmJiBzY2VuZXJ5TG9nLkN1cnNvciggYC0tLSBmb3IgJHttb3VzZVRyYWlsID8gbW91c2VUcmFpbC50b1N0cmluZygpIDogJyhubyBoaXQpJ31gICk7XG4gICAgfVxuXG4gICAgLy8gZmFsbGJhY2sgY2FzZVxuICAgIHRoaXMuc2V0U2NlbmVDdXJzb3IoIHRoaXMuX2RlZmF1bHRDdXJzb3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJzb3IgdG8gYmUgZGlzcGxheWVkIHdoZW4gb3ZlciB0aGUgRGlzcGxheS5cbiAgICovXG4gIHByaXZhdGUgc2V0RWxlbWVudEN1cnNvciggY3Vyc29yOiBzdHJpbmcgKTogdm9pZCB7XG4gICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XG5cbiAgICAvLyBJbiBzb21lIGNhc2VzLCBDaHJvbWUgZG9lc24ndCBzZWVtIHRvIHJlc3BlY3QgdGhlIGN1cnNvciBzZXQgb24gdGhlIERpc3BsYXkncyBkb21FbGVtZW50LiBJZiB3ZSBhcmUgdXNpbmcgdGhlXG4gICAgLy8gZnVsbCB3aW5kb3csIHdlIGNhbiBhcHBseSB0aGUgd29ya2Fyb3VuZCBvZiBjb250cm9sbGluZyB0aGUgYm9keSdzIHN0eWxlLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTgzXG4gICAgaWYgKCB0aGlzLl9hc3N1bWVGdWxsV2luZG93ICkge1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXRTY2VuZUN1cnNvciggY3Vyc29yOiBzdHJpbmcgKTogdm9pZCB7XG4gICAgaWYgKCBjdXJzb3IgIT09IHRoaXMuX2xhc3RDdXJzb3IgKSB7XG4gICAgICB0aGlzLl9sYXN0Q3Vyc29yID0gY3Vyc29yO1xuICAgICAgY29uc3QgY3VzdG9tQ3Vyc29ycyA9IENVU1RPTV9DVVJTT1JTWyBjdXJzb3IgXTtcbiAgICAgIGlmICggY3VzdG9tQ3Vyc29ycyApIHtcbiAgICAgICAgLy8gZ28gYmFja3dhcmRzLCBzbyB0aGUgbW9zdCBkZXNpcmVkIGN1cnNvciBzdGlja3NcbiAgICAgICAgZm9yICggbGV0IGkgPSBjdXN0b21DdXJzb3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICAgIHRoaXMuc2V0RWxlbWVudEN1cnNvciggY3VzdG9tQ3Vyc29yc1sgaSBdICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnNldEVsZW1lbnRDdXJzb3IoIGN1cnNvciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlDU1NIYWNrcygpOiB2b2lkIHtcbiAgICAvLyB0byB1c2UgQ1NTMyB0cmFuc2Zvcm1zIGZvciBwZXJmb3JtYW5jZSwgaGlkZSBhbnl0aGluZyBvdXRzaWRlIG91ciBib3VuZHMgYnkgZGVmYXVsdFxuICAgIGlmICggIXRoaXMuX2FsbG93U2NlbmVPdmVyZmxvdyApIHtcbiAgICAgIHRoaXMuX2RvbUVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICB9XG5cbiAgICAvLyBmb3J3YXJkIGFsbCBwb2ludGVyIGV2ZW50c1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgbGVnYWN5XG4gICAgdGhpcy5fZG9tRWxlbWVudC5zdHlsZS5tc1RvdWNoQWN0aW9uID0gJ25vbmUnO1xuXG4gICAgLy8gZG9uJ3QgYWxsb3cgYnJvd3NlciB0byBzd2l0Y2ggYmV0d2VlbiBmb250IHNtb290aGluZyBtZXRob2RzIGZvciB0ZXh0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQzMSlcbiAgICBGZWF0dXJlcy5zZXRTdHlsZSggdGhpcy5fZG9tRWxlbWVudCwgRmVhdHVyZXMuZm9udFNtb290aGluZywgJ2FudGlhbGlhc2VkJyApO1xuXG4gICAgaWYgKCB0aGlzLl9hbGxvd0NTU0hhY2tzICkge1xuICAgICAgLy8gUHJldmVudHMgc2VsZWN0aW9uIGN1cnNvciBpc3N1ZXMgaW4gU2FmYXJpLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQ3NlxuICAgICAgaWYgKCAhdGhpcy5fbGlzdGVuVG9Pbmx5RWxlbWVudCApIHtcbiAgICAgICAgZG9jdW1lbnQub25zZWxlY3RzdGFydCA9ICgpID0+IGZhbHNlO1xuXG4gICAgICAgIC8vIHByZXZlbnQgYW55IGRlZmF1bHQgem9vbWluZyBiZWhhdmlvciBmcm9tIGEgdHJhY2twYWQgb24gSUUxMSBhbmQgRWRnZSwgYWxsIHNob3VsZCBiZSBoYW5kbGVkIGJ5IHNjZW5lcnkgLSBtdXN0XG4gICAgICAgIC8vIGJlIG9uIHRoZSBib2R5LCBkb2Vzbid0IHByZXZlbnQgYmVoYXZpb3IgaWYgb24gdGhlIGRpc3BsYXkgZGl2XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgbGVnYWN5XG4gICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUubXNDb250ZW50Wm9vbWluZyA9ICdub25lJztcbiAgICAgIH1cblxuICAgICAgLy8gc29tZSBjc3MgaGFja3MgKGluc3BpcmVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL0VpZ2h0TWVkaWEvaGFtbWVyLmpzL2Jsb2IvbWFzdGVyL2hhbW1lci5qcykuXG4gICAgICAvLyBtb2RpZmllZCB0byBvbmx5IGFwcGx5IHRoZSBwcm9wZXIgcHJlZml4ZWQgdmVyc2lvbiBpbnN0ZWFkIG9mIHNwYW1taW5nIGFsbCBvZiB0aGVtLCBhbmQgZG9lc24ndCB1c2UgalF1ZXJ5LlxuICAgICAgRmVhdHVyZXMuc2V0U3R5bGUoIHRoaXMuX2RvbUVsZW1lbnQsIEZlYXR1cmVzLnVzZXJEcmFnLCAnbm9uZScgKTtcbiAgICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy51c2VyU2VsZWN0LCAnbm9uZScgKTtcbiAgICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy50b3VjaEFjdGlvbiwgJ25vbmUnICk7XG4gICAgICBGZWF0dXJlcy5zZXRTdHlsZSggdGhpcy5fZG9tRWxlbWVudCwgRmVhdHVyZXMudG91Y2hDYWxsb3V0LCAnbm9uZScgKTtcbiAgICAgIEZlYXR1cmVzLnNldFN0eWxlKCB0aGlzLl9kb21FbGVtZW50LCBGZWF0dXJlcy50YXBIaWdobGlnaHRDb2xvciwgJ3JnYmEoMCwwLDAsMCknICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNhbnZhc0RhdGFVUkwoIGNhbGxiYWNrOiAoIHN0cjogc3RyaW5nICkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICB0aGlzLmNhbnZhc1NuYXBzaG90KCAoIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgKSA9PiB7XG4gICAgICBjYWxsYmFjayggY2FudmFzLnRvRGF0YVVSTCgpICk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgd2hhdCBpdCBjYW4gaW50byBhIENhbnZhcyAoc28gZmFyLCBDYW52YXMgYW5kIFNWRyBsYXllcnMgd29yayBmaW5lKVxuICAgKi9cbiAgcHVibGljIGNhbnZhc1NuYXBzaG90KCBjYWxsYmFjazogKCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBpbWFnZURhdGE6IEltYWdlRGF0YSApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICBjYW52YXMud2lkdGggPSB0aGlzLnNpemUud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IHRoaXMuc2l6ZS5oZWlnaHQ7XG5cbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XG5cbiAgICAvL09IVFdPIFRPRE86IGFsbG93IGFjdHVhbCBiYWNrZ3JvdW5kIGNvbG9yIGRpcmVjdGx5LCBub3QgaGF2aW5nIHRvIGNoZWNrIHRoZSBzdHlsZSBoZXJlISEhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5fcm9vdE5vZGUucmVuZGVyVG9DYW52YXMoIGNhbnZhcywgY29udGV4dCwgKCkgPT4ge1xuICAgICAgY2FsbGJhY2soIGNhbnZhcywgY29udGV4dC5nZXRJbWFnZURhdGEoIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCApICk7XG4gICAgfSwgdGhpcy5kb21FbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uIGZvciBoYW5kbGluZyBvdmVybGF5cyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi9cbiAgcHVibGljIHNldFBvaW50ZXJEaXNwbGF5VmlzaWJsZSggdmlzaWJpbGl0eTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBjb25zdCBoYXNPdmVybGF5ID0gISF0aGlzLl9wb2ludGVyT3ZlcmxheTtcblxuICAgIGlmICggdmlzaWJpbGl0eSAhPT0gaGFzT3ZlcmxheSApIHtcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheSggdGhpcy5fcG9pbnRlck92ZXJsYXkhICk7XG4gICAgICAgIHRoaXMuX3BvaW50ZXJPdmVybGF5IS5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3BvaW50ZXJPdmVybGF5ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9wb2ludGVyT3ZlcmxheSA9IG5ldyBQb2ludGVyT3ZlcmxheSggdGhpcywgdGhpcy5fcm9vdE5vZGUgKTtcbiAgICAgICAgdGhpcy5hZGRPdmVybGF5KCB0aGlzLl9wb2ludGVyT3ZlcmxheSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPOiByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbiBmb3IgaGFuZGxpbmcgb3ZlcmxheXMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICovXG4gIHB1YmxpYyBzZXRQb2ludGVyQXJlYURpc3BsYXlWaXNpYmxlKCB2aXNpYmlsaXR5OiBib29sZWFuICk6IHZvaWQge1xuICAgIGNvbnN0IGhhc092ZXJsYXkgPSAhIXRoaXMuX3BvaW50ZXJBcmVhT3ZlcmxheTtcblxuICAgIGlmICggdmlzaWJpbGl0eSAhPT0gaGFzT3ZlcmxheSApIHtcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheSggdGhpcy5fcG9pbnRlckFyZWFPdmVybGF5ISApO1xuICAgICAgICB0aGlzLl9wb2ludGVyQXJlYU92ZXJsYXkhLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fcG9pbnRlckFyZWFPdmVybGF5ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9wb2ludGVyQXJlYU92ZXJsYXkgPSBuZXcgUG9pbnRlckFyZWFPdmVybGF5KCB0aGlzLCB0aGlzLl9yb290Tm9kZSApO1xuICAgICAgICB0aGlzLmFkZE92ZXJsYXkoIHRoaXMuX3BvaW50ZXJBcmVhT3ZlcmxheSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUT0RPOiByZWR1Y2UgY29kZSBkdXBsaWNhdGlvbiBmb3IgaGFuZGxpbmcgb3ZlcmxheXMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICovXG4gIHB1YmxpYyBzZXRIaXRBcmVhRGlzcGxheVZpc2libGUoIHZpc2liaWxpdHk6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgY29uc3QgaGFzT3ZlcmxheSA9ICEhdGhpcy5faGl0QXJlYU92ZXJsYXk7XG5cbiAgICBpZiAoIHZpc2liaWxpdHkgIT09IGhhc092ZXJsYXkgKSB7XG4gICAgICBpZiAoICF2aXNpYmlsaXR5ICkge1xuICAgICAgICB0aGlzLnJlbW92ZU92ZXJsYXkoIHRoaXMuX2hpdEFyZWFPdmVybGF5ISApO1xuICAgICAgICB0aGlzLl9oaXRBcmVhT3ZlcmxheSEuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9oaXRBcmVhT3ZlcmxheSA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5faGl0QXJlYU92ZXJsYXkgPSBuZXcgSGl0QXJlYU92ZXJsYXkoIHRoaXMsIHRoaXMuX3Jvb3ROb2RlICk7XG4gICAgICAgIHRoaXMuYWRkT3ZlcmxheSggdGhpcy5faGl0QXJlYU92ZXJsYXkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gZm9yIGhhbmRsaW5nIG92ZXJsYXlzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgc2V0Q2FudmFzTm9kZUJvdW5kc1Zpc2libGUoIHZpc2liaWxpdHk6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgY29uc3QgaGFzT3ZlcmxheSA9ICEhdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXk7XG5cbiAgICBpZiAoIHZpc2liaWxpdHkgIT09IGhhc092ZXJsYXkgKSB7XG4gICAgICBpZiAoICF2aXNpYmlsaXR5ICkge1xuICAgICAgICB0aGlzLnJlbW92ZU92ZXJsYXkoIHRoaXMuX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5ISApO1xuICAgICAgICB0aGlzLl9jYW52YXNBcmVhQm91bmRzT3ZlcmxheSEuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9jYW52YXNBcmVhQm91bmRzT3ZlcmxheSA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXkgPSBuZXcgQ2FudmFzTm9kZUJvdW5kc092ZXJsYXkoIHRoaXMsIHRoaXMuX3Jvb3ROb2RlICk7XG4gICAgICAgIHRoaXMuYWRkT3ZlcmxheSggdGhpcy5fY2FudmFzQXJlYUJvdW5kc092ZXJsYXkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVE9ETzogcmVkdWNlIGNvZGUgZHVwbGljYXRpb24gZm9yIGhhbmRsaW5nIG92ZXJsYXlzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgc2V0Rml0dGVkQmxvY2tCb3VuZHNWaXNpYmxlKCB2aXNpYmlsaXR5OiBib29sZWFuICk6IHZvaWQge1xuICAgIGNvbnN0IGhhc092ZXJsYXkgPSAhIXRoaXMuX2ZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheTtcblxuICAgIGlmICggdmlzaWJpbGl0eSAhPT0gaGFzT3ZlcmxheSApIHtcbiAgICAgIGlmICggIXZpc2liaWxpdHkgKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlT3ZlcmxheSggdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5ISApO1xuICAgICAgICB0aGlzLl9maXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkhLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fZml0dGVkQmxvY2tCb3VuZHNPdmVybGF5ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9maXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkgPSBuZXcgRml0dGVkQmxvY2tCb3VuZHNPdmVybGF5KCB0aGlzLCB0aGlzLl9yb290Tm9kZSApO1xuICAgICAgICB0aGlzLmFkZE92ZXJsYXkoIHRoaXMuX2ZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIHRoZSBEaXNwbGF5IHRvIHJlc2l6ZSB0byB3aGF0ZXZlciB0aGUgd2luZG93IGlubmVyIGRpbWVuc2lvbnMgd2lsbCBiZS5cbiAgICovXG4gIHB1YmxpYyByZXNpemVPbldpbmRvd1Jlc2l6ZSgpOiB2b2lkIHtcbiAgICBjb25zdCByZXNpemVyID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRXaWR0aEhlaWdodCggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgfTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHJlc2l6ZXIgKTtcbiAgICByZXNpemVyKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBvbiBldmVyeSByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZS4gSWYgc3RlcENhbGxiYWNrIGlzIHBhc3NlZCBpbiwgaXQgaXMgY2FsbGVkIGJlZm9yZSB1cGRhdGVEaXNwbGF5KCkgd2l0aFxuICAgKiBzdGVwQ2FsbGJhY2soIHRpbWVFbGFwc2VkSW5TZWNvbmRzIClcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSggc3RlcENhbGxiYWNrPzogKCBkdDogbnVtYmVyICkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICAvLyBrZWVwIHRyYWNrIG9mIGhvdyBtdWNoIHRpbWUgZWxhcHNlZCBvdmVyIHRoZSBsYXN0IGZyYW1lXG4gICAgbGV0IGxhc3RUaW1lID0gMDtcbiAgICBsZXQgdGltZUVsYXBzZWRJblNlY29uZHMgPSAwO1xuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAoIGZ1bmN0aW9uIHN0ZXAoKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIExFR0FDWSAtLS0gaXQgd291bGQga25vdyB0byB1cGRhdGUganVzdCB0aGUgRE9NIGVsZW1lbnQncyBsb2NhdGlvbiBpZiBpdCdzIHRoZSBzZWNvbmQgYXJndW1lbnRcbiAgICAgIHNlbGYuX3JlcXVlc3RBbmltYXRpb25GcmFtZUlEID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSggc3RlcCwgc2VsZi5fZG9tRWxlbWVudCApO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgaG93IG11Y2ggdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB3ZSByZW5kZXJlZCB0aGUgbGFzdCBmcmFtZVxuICAgICAgY29uc3QgdGltZU5vdyA9IERhdGUubm93KCk7XG4gICAgICBpZiAoIGxhc3RUaW1lICE9PSAwICkge1xuICAgICAgICB0aW1lRWxhcHNlZEluU2Vjb25kcyA9ICggdGltZU5vdyAtIGxhc3RUaW1lICkgLyAxMDAwLjA7XG4gICAgICB9XG4gICAgICBsYXN0VGltZSA9IHRpbWVOb3c7XG5cbiAgICAgIC8vIHN0ZXAgdGhlIHRpbWVyIHRoYXQgZHJpdmVzIGFueSB0aW1lIGRlcGVuZGVudCB1cGRhdGVzIG9mIHRoZSBEaXNwbGF5XG4gICAgICBzdGVwVGltZXIuZW1pdCggdGltZUVsYXBzZWRJblNlY29uZHMgKTtcblxuICAgICAgc3RlcENhbGxiYWNrICYmIHN0ZXBDYWxsYmFjayggdGltZUVsYXBzZWRJblNlY29uZHMgKTtcbiAgICAgIHNlbGYudXBkYXRlRGlzcGxheSgpO1xuICAgIH0gKSgpO1xuICB9XG5cbiAgcHVibGljIGNhbmNlbFVwZGF0ZU9uUmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk6IHZvaWQge1xuICAgIHRoaXMuX3JlcXVlc3RBbmltYXRpb25GcmFtZUlEICE9PSBudWxsICYmIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSggdGhpcy5fcmVxdWVzdEFuaW1hdGlvbkZyYW1lSUQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudCBoYW5kbGluZywgYW5kIGNvbm5lY3RzIHRoZSBicm93c2VyJ3MgaW5wdXQgZXZlbnQgaGFuZGxlcnMgdG8gbm90aWZ5IHRoaXMgRGlzcGxheSBvZiBldmVudHMuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIHJldmVyc2VkIHdpdGggZGV0YWNoRXZlbnRzKCkuXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZUV2ZW50cyggb3B0aW9ucz86IElucHV0T3B0aW9ucyApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5faW5wdXQsICdFdmVudHMgY2Fubm90IGJlIGF0dGFjaGVkIHR3aWNlIHRvIGEgZGlzcGxheSAoZm9yIG5vdyknICk7XG5cbiAgICAvLyBUT0RPOiByZWZhY3RvciBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgY29uc3QgaW5wdXQgPSBuZXcgSW5wdXQoIHRoaXMsICF0aGlzLl9saXN0ZW5Ub09ubHlFbGVtZW50LCB0aGlzLl9iYXRjaERPTUV2ZW50cywgdGhpcy5fYXNzdW1lRnVsbFdpbmRvdywgdGhpcy5fcGFzc2l2ZUV2ZW50cywgb3B0aW9ucyApO1xuICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG5cbiAgICBpbnB1dC5jb25uZWN0TGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogRGV0YWNoIGFscmVhZHktYXR0YWNoZWQgaW5wdXQgZXZlbnQgaGFuZGxpbmcgKGZyb20gaW5pdGlhbGl6ZUV2ZW50cygpKS5cbiAgICovXG4gIHB1YmxpYyBkZXRhY2hFdmVudHMoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5faW5wdXQsICdkZXRhY2hFdmVudHMoKSBzaG91bGQgYmUgY2FsbGVkIG9ubHkgd2hlbiBldmVudHMgYXJlIGF0dGFjaGVkJyApO1xuXG4gICAgdGhpcy5faW5wdXQhLmRpc2Nvbm5lY3RMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9pbnB1dCA9IG51bGw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIGFkZElucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhXy5pbmNsdWRlcyggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICksICdJbnB1dCBsaXN0ZW5lciBhbHJlYWR5IHJlZ2lzdGVyZWQgb24gdGhpcyBEaXNwbGF5JyApO1xuXG4gICAgLy8gZG9uJ3QgYWxsb3cgbGlzdGVuZXJzIHRvIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzXG4gICAgaWYgKCAhXy5pbmNsdWRlcyggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICkgKSB7XG4gICAgICB0aGlzLl9pbnB1dExpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgd2l0aCBhZGRJbnB1dExpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcbiAgICAvLyBlbnN1cmUgdGhlIGxpc3RlbmVyIGlzIGluIG91ciBsaXN0XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICkgKTtcblxuICAgIHRoaXMuX2lucHV0TGlzdGVuZXJzLnNwbGljZSggXy5pbmRleE9mKCB0aGlzLl9pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSwgMSApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaW5wdXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGxpc3RlbmluZyB0byB0aGlzIERpc3BsYXkuXG4gICAqXG4gICAqIE1vcmUgZWZmaWNpZW50IHRoYW4gY2hlY2tpbmcgZGlzcGxheS5pbnB1dExpc3RlbmVycywgYXMgdGhhdCBpbmNsdWRlcyBhIGRlZmVuc2l2ZSBjb3B5LlxuICAgKi9cbiAgcHVibGljIGhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiBib29sZWFuIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbnB1dExpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5faW5wdXRMaXN0ZW5lcnNbIGkgXSA9PT0gbGlzdGVuZXIgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgYWxsIG9mIG91ciBpbnB1dCBsaXN0ZW5lcnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0SW5wdXRMaXN0ZW5lcnMoKTogVElucHV0TGlzdGVuZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0TGlzdGVuZXJzLnNsaWNlKCAwICk7IC8vIGRlZmVuc2l2ZSBjb3B5XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlucHV0TGlzdGVuZXJzKCk6IFRJbnB1dExpc3RlbmVyW10geyByZXR1cm4gdGhpcy5nZXRJbnB1dExpc3RlbmVycygpOyB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgYWxsIGlucHV0IGxpc3RlbmVycyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGlzIERpc3BsYXkuXG4gICAqL1xuICBwdWJsaWMgaW50ZXJydXB0SW5wdXQoKTogdGhpcyB7XG4gICAgY29uc3QgbGlzdGVuZXJzQ29weSA9IHRoaXMuaW5wdXRMaXN0ZW5lcnM7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnNDb3B5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNDb3B5WyBpIF07XG5cbiAgICAgIGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnJ1cHRzIGFsbCBwb2ludGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBEaXNwbGF5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODIuXG4gICAqL1xuICBwdWJsaWMgaW50ZXJydXB0UG9pbnRlcnMoKTogdGhpcyB7XG4gICAgdGhpcy5faW5wdXQgJiYgdGhpcy5faW5wdXQuaW50ZXJydXB0UG9pbnRlcnMoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgYWxsIHBvaW50ZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIERpc3BsYXkgdGhhdCBhcmUgTk9UIGN1cnJlbnRseSBoYXZpbmcgZXZlbnRzIGV4ZWN1dGVkLlxuICAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODIuXG4gICAqXG4gICAqIElmIGV4Y2x1ZGVQb2ludGVyIGlzIHByb3ZpZGVkIGFuZCBpcyBub24tbnVsbCwgaXQncyB1c2VkIGFzIHRoZSBcImN1cnJlbnRcIiBwb2ludGVyIHRoYXQgc2hvdWxkIGJlIGV4Y2x1ZGVkIGZyb21cbiAgICogaW50ZXJydXB0aW9uLlxuICAgKi9cbiAgcHVibGljIGludGVycnVwdE90aGVyUG9pbnRlcnMoIGV4Y2x1ZGVQb2ludGVyOiBQb2ludGVyIHwgbnVsbCA9IG51bGwgKTogdGhpcyB7XG4gICAgdGhpcy5faW5wdXQgJiYgdGhpcy5faW5wdXQuaW50ZXJydXB0UG9pbnRlcnMoXG4gICAgICAoIGV4Y2x1ZGVQb2ludGVyIHx8IHRoaXMuX2lucHV0LmN1cnJlbnRTY2VuZXJ5RXZlbnQ/LnBvaW50ZXIgKSB8fCBudWxsXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJTlRFUlJVUFRfT1RIRVJfUE9JTlRFUlMgPSAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCA9PiB7XG4gICAgd2luZG93LnBoZXQ/LmpvaXN0Py5kaXNwbGF5Py5pbnRlcnJ1cHRPdGhlclBvaW50ZXJzKCBldmVudD8ucG9pbnRlciApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBlbnN1cmVOb3RQYWludGluZygpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5faXNQYWludGluZyxcbiAgICAgICdUaGlzIHNob3VsZCBub3QgYmUgcnVuIGluIHRoZSBjYWxsIHRyZWUgb2YgdXBkYXRlRGlzcGxheSgpLiBJZiB5b3Ugc2VlIHRoaXMsIGl0IGlzIGxpa2VseSB0aGF0IGVpdGhlciB0aGUgJyArXG4gICAgICAnbGFzdCB1cGRhdGVEaXNwbGF5KCkgaGFkIGEgdGhyb3duIGVycm9yIGFuZCBpdCBpcyB0cnlpbmcgdG8gYmUgcnVuIGFnYWluIChpbiB3aGljaCBjYXNlLCBpbnZlc3RpZ2F0ZSB0aGF0ICcgK1xuICAgICAgJ2Vycm9yKSwgT1IgY29kZSB3YXMgcnVuL3RyaWdnZXJlZCBmcm9tIGluc2lkZSBhbiB1cGRhdGVEaXNwbGF5KCkgdGhhdCBoYXMgdGhlIHBvdGVudGlhbCB0byBjYXVzZSBhbiBpbmZpbml0ZSAnICtcbiAgICAgICdsb29wLCBlLmcuIENhbnZhc05vZGUgcGFpbnRDYW52YXMoKSBjYWxsIG1hbmlwdWxhdGluZyBhbm90aGVyIE5vZGUsIG9yIGEgYm91bmRzIGxpc3RlbmVyIHRoYXQgU2NlbmVyeSBtaXNzZWQuJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbG9zcyBvZiBjb250ZXh0IGZvciBhbGwgV2ViR0wgYmxvY2tzLlxuICAgKlxuICAgKiBOT1RFOiBTaG91bGQgZ2VuZXJhbGx5IG9ubHkgYmUgdXNlZCBmb3IgZGVidWdnaW5nLlxuICAgKi9cbiAgcHVibGljIGxvc2VXZWJHTENvbnRleHRzKCk6IHZvaWQge1xuICAgICggZnVuY3Rpb24gbG9zZUJhY2tib25lKCBiYWNrYm9uZTogQmFja2JvbmVEcmF3YWJsZSApIHtcbiAgICAgIGlmICggYmFja2JvbmUuYmxvY2tzICkge1xuICAgICAgICBiYWNrYm9uZS5ibG9ja3MuZm9yRWFjaCggKCBibG9jazogQmxvY2sgKSA9PiB7XG4gICAgICAgICAgY29uc3QgZ2wgPSAoIGJsb2NrIGFzIHVua25vd24gYXMgV2ViR0xCbG9jayApLmdsO1xuICAgICAgICAgIGlmICggZ2wgKSB7XG4gICAgICAgICAgICBVdGlscy5sb3NlQ29udGV4dCggZ2wgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvL1RPRE86IHBhdHRlcm4gZm9yIHRoaXMgaXRlcmF0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgICAgZm9yICggbGV0IGRyYXdhYmxlID0gYmxvY2suZmlyc3REcmF3YWJsZTsgZHJhd2FibGUgIT09IG51bGw7IGRyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlICkge1xuICAgICAgICAgICAgbG9zZUJhY2tib25lKCBkcmF3YWJsZSApO1xuICAgICAgICAgICAgaWYgKCBkcmF3YWJsZSA9PT0gYmxvY2subGFzdERyYXdhYmxlICkgeyBicmVhazsgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0gKSggdGhpcy5fcm9vdEJhY2tib25lISApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIHRoaXMgRGlzcGxheSBhdmFpbGFibGUgZm9yIGluc3BlY3Rpb24uXG4gICAqL1xuICBwdWJsaWMgaW5zcGVjdCgpOiB2b2lkIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2NlbmVyeVNuYXBzaG90ID0gSlNPTi5zdHJpbmdpZnkoIHNjZW5lcnlTZXJpYWxpemUoIHRoaXMgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gSFRNTCBmcmFnbWVudCB0aGF0IGluY2x1ZGVzIGEgbGFyZ2UgYW1vdW50IG9mIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiwgaW5jbHVkaW5nIGEgdmlldyBvZiB0aGVcbiAgICogaW5zdGFuY2UgdHJlZSBhbmQgZHJhd2FibGUgdHJlZS5cbiAgICovXG4gIHB1YmxpYyBnZXREZWJ1Z0hUTUwoKTogc3RyaW5nIHtcbiAgICBjb25zdCBoZWFkZXJTdHlsZSA9ICdmb250LXdlaWdodDogYm9sZDsgZm9udC1zaXplOiAxMjAlOyBtYXJnaW4tdG9wOiA1cHg7JztcblxuICAgIGxldCBkZXB0aCA9IDA7XG5cbiAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICByZXN1bHQgKz0gYDxkaXYgc3R5bGU9XCIke2hlYWRlclN0eWxlfVwiPkRpc3BsYXkgKCR7dGhpcy5pZH0pIFN1bW1hcnk8L2Rpdj5gO1xuICAgIHJlc3VsdCArPSBgJHt0aGlzLnNpemUudG9TdHJpbmcoKX0gZnJhbWU6JHt0aGlzLl9mcmFtZUlkfSBpbnB1dDokeyEhdGhpcy5faW5wdXR9IGN1cnNvcjoke3RoaXMuX2xhc3RDdXJzb3J9PGJyLz5gO1xuXG4gICAgZnVuY3Rpb24gbm9kZUNvdW50KCBub2RlOiBOb2RlICk6IG51bWJlciB7XG4gICAgICBsZXQgY291bnQgPSAxOyAvLyBmb3IgdXNcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvdW50ICs9IG5vZGVDb3VudCggbm9kZS5jaGlsZHJlblsgaSBdICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGBOb2RlczogJHtub2RlQ291bnQoIHRoaXMuX3Jvb3ROb2RlICl9PGJyLz5gO1xuXG4gICAgZnVuY3Rpb24gaW5zdGFuY2VDb3VudCggaW5zdGFuY2U6IEluc3RhbmNlICk6IG51bWJlciB7XG4gICAgICBsZXQgY291bnQgPSAxOyAvLyBmb3IgdXNcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb3VudCArPSBpbnN0YW5jZUNvdW50KCBpbnN0YW5jZS5jaGlsZHJlblsgaSBdICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IHRoaXMuX2Jhc2VJbnN0YW5jZSA/ICggYEluc3RhbmNlczogJHtpbnN0YW5jZUNvdW50KCB0aGlzLl9iYXNlSW5zdGFuY2UgKX08YnIvPmAgKSA6ICcnO1xuXG4gICAgZnVuY3Rpb24gZHJhd2FibGVDb3VudCggZHJhd2FibGU6IERyYXdhYmxlICk6IG51bWJlciB7XG4gICAgICBsZXQgY291bnQgPSAxOyAvLyBmb3IgdXNcbiAgICAgIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5ibG9ja3MgKSB7XG4gICAgICAgIC8vIHdlJ3JlIGEgYmFja2JvbmVcbiAgICAgICAgXy5lYWNoKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJsb2NrcywgY2hpbGREcmF3YWJsZSA9PiB7XG4gICAgICAgICAgY291bnQgKz0gZHJhd2FibGVDb3VudCggY2hpbGREcmF3YWJsZSApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkuZmlyc3REcmF3YWJsZSAmJiAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIC8vIHdlJ3JlIGEgYmxvY2tcbiAgICAgICAgZm9yICggbGV0IGNoaWxkRHJhd2FibGUgPSAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5maXJzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlICE9PSAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGU7IGNoaWxkRHJhd2FibGUgPSBjaGlsZERyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgICAgICBjb3VudCArPSBkcmF3YWJsZUNvdW50KCBjaGlsZERyYXdhYmxlICk7XG4gICAgICAgIH1cbiAgICAgICAgY291bnQgKz0gZHJhd2FibGVDb3VudCggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkubGFzdERyYXdhYmxlISApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBCYWNrYm9uZURyYXdhYmxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgcmVzdWx0ICs9IHRoaXMuX3Jvb3RCYWNrYm9uZSA/ICggYERyYXdhYmxlczogJHtkcmF3YWJsZUNvdW50KCB0aGlzLl9yb290QmFja2JvbmUgKX08YnIvPmAgKSA6ICcnO1xuXG4gICAgY29uc3QgZHJhd2FibGVDb3VudE1hcDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9OyAvLyB7c3RyaW5nfSBkcmF3YWJsZSBjb25zdHJ1Y3RvciBuYW1lID0+IHtudW1iZXJ9IGNvdW50IG9mIHNlZW5cbiAgICAvLyBpbmNyZW1lbnQgdGhlIGNvdW50IGluIG91ciBtYXBcbiAgICBmdW5jdGlvbiBjb3VudFJldGFpbmVkRHJhd2FibGUoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBkcmF3YWJsZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgaWYgKCBkcmF3YWJsZUNvdW50TWFwWyBuYW1lIF0gKSB7XG4gICAgICAgIGRyYXdhYmxlQ291bnRNYXBbIG5hbWUgXSsrO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGRyYXdhYmxlQ291bnRNYXBbIG5hbWUgXSA9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmV0YWluZWREcmF3YWJsZUNvdW50KCBpbnN0YW5jZTogSW5zdGFuY2UgKTogbnVtYmVyIHtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICBpZiAoIGluc3RhbmNlLnNlbGZEcmF3YWJsZSApIHtcbiAgICAgICAgY291bnRSZXRhaW5lZERyYXdhYmxlKCBpbnN0YW5jZS5zZWxmRHJhd2FibGUgKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICAgIGlmICggaW5zdGFuY2UuZ3JvdXBEcmF3YWJsZSApIHtcbiAgICAgICAgY291bnRSZXRhaW5lZERyYXdhYmxlKCBpbnN0YW5jZS5ncm91cERyYXdhYmxlICk7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICB9XG4gICAgICBpZiAoIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBJbnN0YW5jZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICBjb3VudFJldGFpbmVkRHJhd2FibGUoIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGluc3RhbmNlLmNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb3VudCArPSByZXRhaW5lZERyYXdhYmxlQ291bnQoIGluc3RhbmNlLmNoaWxkcmVuWyBpIF0gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb3VudDtcbiAgICB9XG5cbiAgICByZXN1bHQgKz0gdGhpcy5fYmFzZUluc3RhbmNlID8gKCBgUmV0YWluZWQgRHJhd2FibGVzOiAke3JldGFpbmVkRHJhd2FibGVDb3VudCggdGhpcy5fYmFzZUluc3RhbmNlICl9PGJyLz5gICkgOiAnJztcbiAgICBmb3IgKCBjb25zdCBkcmF3YWJsZU5hbWUgaW4gZHJhd2FibGVDb3VudE1hcCApIHtcbiAgICAgIHJlc3VsdCArPSBgJm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7JHtkcmF3YWJsZU5hbWV9OiAke2RyYXdhYmxlQ291bnRNYXBbIGRyYXdhYmxlTmFtZSBdfTxici8+YDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBibG9ja1N1bW1hcnkoIGJsb2NrOiBCbG9jayApOiBzdHJpbmcge1xuICAgICAgLy8gZW5zdXJlIHdlIGFyZSBhIGJsb2NrXG4gICAgICBpZiAoICFibG9jay5maXJzdERyYXdhYmxlIHx8ICFibG9jay5sYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIGRpc3BsYXkgc3R1ZmYgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGNvbnN0IGhhc0JhY2tib25lID0gYmxvY2suZG9tRHJhd2FibGUgJiYgYmxvY2suZG9tRHJhd2FibGUuYmxvY2tzO1xuXG4gICAgICBsZXQgZGl2ID0gYDxkaXYgc3R5bGU9XCJtYXJnaW4tbGVmdDogJHtkZXB0aCAqIDIwfXB4XCI+YDtcblxuICAgICAgZGl2ICs9IGJsb2NrLnRvU3RyaW5nKCk7XG4gICAgICBpZiAoICFoYXNCYWNrYm9uZSApIHtcbiAgICAgICAgZGl2ICs9IGAgKCR7YmxvY2suZHJhd2FibGVDb3VudH0gZHJhd2FibGVzKWA7XG4gICAgICB9XG5cbiAgICAgIGRpdiArPSAnPC9kaXY+JztcblxuICAgICAgZGVwdGggKz0gMTtcbiAgICAgIGlmICggaGFzQmFja2JvbmUgKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBkaXNwbGF5IHN0dWZmIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IGJsb2NrLmRvbURyYXdhYmxlLmJsb2Nrcy5sZW5ndGg7IGsrKyApIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gZGlzcGxheSBzdHVmZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICAgIGRpdiArPSBibG9ja1N1bW1hcnkoIGJsb2NrLmRvbURyYXdhYmxlLmJsb2Nrc1sgayBdICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRlcHRoIC09IDE7XG5cbiAgICAgIHJldHVybiBkaXY7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLl9yb290QmFja2JvbmUgKSB7XG4gICAgICByZXN1bHQgKz0gYDxkaXYgc3R5bGU9XCIke2hlYWRlclN0eWxlfVwiPkJsb2NrIFN1bW1hcnk8L2Rpdj5gO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcm9vdEJhY2tib25lLmJsb2Nrcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgcmVzdWx0ICs9IGJsb2NrU3VtbWFyeSggdGhpcy5fcm9vdEJhY2tib25lLmJsb2Nrc1sgaSBdICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zdGFuY2VTdW1tYXJ5KCBpbnN0YW5jZTogSW5zdGFuY2UgKTogc3RyaW5nIHtcbiAgICAgIGxldCBpU3VtbWFyeSA9ICcnO1xuXG4gICAgICBmdW5jdGlvbiBhZGRRdWFsaWZpZXIoIHRleHQ6IHN0cmluZyApOiB2b2lkIHtcbiAgICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjMDA4XCI+JHt0ZXh0fTwvc3Bhbj5gO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBub2RlID0gaW5zdGFuY2Uubm9kZSE7XG5cbiAgICAgIGlTdW1tYXJ5ICs9IGluc3RhbmNlLmlkO1xuICAgICAgaVN1bW1hcnkgKz0gYCAke25vZGUuY29uc3RydWN0b3IubmFtZSA/IG5vZGUuY29uc3RydWN0b3IubmFtZSA6ICc/J31gO1xuICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImZvbnQtd2VpZ2h0OiAke25vZGUuaXNQYWludGVkKCkgPyAnYm9sZCcgOiAnbm9ybWFsJ31cIj4ke25vZGUuaWR9PC9zcGFuPmA7XG4gICAgICBpU3VtbWFyeSArPSBub2RlLmdldERlYnVnSFRNTEV4dHJhcygpO1xuXG4gICAgICBpZiAoICFub2RlLnZpc2libGUgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJ2ludmlzJyApO1xuICAgICAgfVxuICAgICAgaWYgKCAhaW5zdGFuY2UudmlzaWJsZSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnSS1pbnZpcycgKTtcbiAgICAgIH1cbiAgICAgIGlmICggIWluc3RhbmNlLnJlbGF0aXZlVmlzaWJsZSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnSS1yZWwtaW52aXMnICk7XG4gICAgICB9XG4gICAgICBpZiAoICFpbnN0YW5jZS5zZWxmVmlzaWJsZSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnSS1zZWxmLWludmlzJyApO1xuICAgICAgfVxuICAgICAgaWYgKCAhaW5zdGFuY2UuZml0dGFiaWxpdHkuYW5jZXN0b3JzRml0dGFibGUgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJ25vZml0LWFuY2VzdG9yJyApO1xuICAgICAgfVxuICAgICAgaWYgKCAhaW5zdGFuY2UuZml0dGFiaWxpdHkuc2VsZkZpdHRhYmxlICkge1xuICAgICAgICBhZGRRdWFsaWZpZXIoICdub2ZpdC1zZWxmJyApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLnBpY2thYmxlID09PSB0cnVlICkge1xuICAgICAgICBhZGRRdWFsaWZpZXIoICdwaWNrYWJsZScgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5waWNrYWJsZSA9PT0gZmFsc2UgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJ3VucGlja2FibGUnICk7XG4gICAgICB9XG4gICAgICBpZiAoIGluc3RhbmNlLnRyYWlsIS5pc1BpY2thYmxlKCkgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJzxzcGFuIHN0eWxlPVwiY29sb3I6ICM4MDhcIj5oaXRzPC9zcGFuPicgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5nZXRFZmZlY3RpdmVDdXJzb3IoKSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCBgZWZmZWN0aXZlQ3Vyc29yOiR7bm9kZS5nZXRFZmZlY3RpdmVDdXJzb3IoKX1gICk7XG4gICAgICB9XG4gICAgICBpZiAoIG5vZGUuY2xpcEFyZWEgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJ2NsaXBBcmVhJyApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLm1vdXNlQXJlYSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAnbW91c2VBcmVhJyApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLnRvdWNoQXJlYSApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCAndG91Y2hBcmVhJyApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLmdldElucHV0TGlzdGVuZXJzKCkubGVuZ3RoICkge1xuICAgICAgICBhZGRRdWFsaWZpZXIoICdpbnB1dExpc3RlbmVycycgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5nZXRSZW5kZXJlcigpICkge1xuICAgICAgICBhZGRRdWFsaWZpZXIoIGByZW5kZXJlcjoke25vZGUuZ2V0UmVuZGVyZXIoKX1gICk7XG4gICAgICB9XG4gICAgICBpZiAoIG5vZGUuaXNMYXllclNwbGl0KCkgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggJ2xheWVyU3BsaXQnICk7XG4gICAgICB9XG4gICAgICBpZiAoIG5vZGUub3BhY2l0eSA8IDEgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggYG9wYWNpdHk6JHtub2RlLm9wYWNpdHl9YCApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLmRpc2FibGVkT3BhY2l0eSA8IDEgKSB7XG4gICAgICAgIGFkZFF1YWxpZmllciggYGRpc2FibGVkT3BhY2l0eToke25vZGUuZGlzYWJsZWRPcGFjaXR5fWAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBub2RlLl9ib3VuZHNFdmVudENvdW50ID4gMCApIHtcbiAgICAgICAgYWRkUXVhbGlmaWVyKCBgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzgwMFwiPmJvdW5kc0xpc3Rlbjoke25vZGUuX2JvdW5kc0V2ZW50Q291bnR9OiR7bm9kZS5fYm91bmRzRXZlbnRTZWxmQ291bnR9PC9zcGFuPmAgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRyYW5zZm9ybVR5cGUgPSAnJztcbiAgICAgIHN3aXRjaCggbm9kZS50cmFuc2Zvcm0uZ2V0TWF0cml4KCkudHlwZSApIHtcbiAgICAgICAgY2FzZSBNYXRyaXgzVHlwZS5JREVOVElUWTpcbiAgICAgICAgICB0cmFuc2Zvcm1UeXBlID0gJyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTWF0cml4M1R5cGUuVFJBTlNMQVRJT05fMkQ6XG4gICAgICAgICAgdHJhbnNmb3JtVHlwZSA9ICd0cmFuc2xhdGVkJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNYXRyaXgzVHlwZS5TQ0FMSU5HOlxuICAgICAgICAgIHRyYW5zZm9ybVR5cGUgPSAnc2NhbGUnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1hdHJpeDNUeXBlLkFGRklORTpcbiAgICAgICAgICB0cmFuc2Zvcm1UeXBlID0gJ2FmZmluZSc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTWF0cml4M1R5cGUuT1RIRVI6XG4gICAgICAgICAgdHJhbnNmb3JtVHlwZSA9ICdvdGhlcic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCBtYXRyaXggdHlwZTogJHtub2RlLnRyYW5zZm9ybS5nZXRNYXRyaXgoKS50eXBlfWAgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdHJhbnNmb3JtVHlwZSApIHtcbiAgICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjODhmXCIgdGl0bGU9XCIke25vZGUudHJhbnNmb3JtLmdldE1hdHJpeCgpLnRvU3RyaW5nKCkucmVwbGFjZSggJ1xcbicsICcmIzEwOycgKX1cIj4ke3RyYW5zZm9ybVR5cGV9PC9zcGFuPmA7XG4gICAgICB9XG5cbiAgICAgIGlTdW1tYXJ5ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogIzg4OFwiPltUcmFpbCAke2luc3RhbmNlLnRyYWlsIS5pbmRpY2VzLmpvaW4oICcuJyApfV08L3NwYW4+YDtcbiAgICAgIC8vIGlTdW1tYXJ5ICs9IGAgPHNwYW4gc3R5bGU9XCJjb2xvcjogI2M4OFwiPiR7c3RyKCBpbnN0YW5jZS5zdGF0ZSApfTwvc3Bhbj5gO1xuICAgICAgaVN1bW1hcnkgKz0gYCA8c3BhbiBzdHlsZT1cImNvbG9yOiAjOGM4XCI+JHtub2RlLl9yZW5kZXJlclN1bW1hcnkuYml0bWFzay50b1N0cmluZyggMTYgKX0ke25vZGUuX3JlbmRlcmVyQml0bWFzayAhPT0gUmVuZGVyZXIuYml0bWFza05vZGVEZWZhdWx0ID8gYCAoJHtub2RlLl9yZW5kZXJlckJpdG1hc2sudG9TdHJpbmcoIDE2ICl9KWAgOiAnJ308L3NwYW4+YDtcblxuICAgICAgcmV0dXJuIGlTdW1tYXJ5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdhYmxlU3VtbWFyeSggZHJhd2FibGU6IERyYXdhYmxlICk6IHN0cmluZyB7XG4gICAgICBsZXQgZHJhd2FibGVTdHJpbmcgPSBkcmF3YWJsZS50b1N0cmluZygpO1xuICAgICAgaWYgKCBkcmF3YWJsZS52aXNpYmxlICkge1xuICAgICAgICBkcmF3YWJsZVN0cmluZyA9IGA8c3Ryb25nPiR7ZHJhd2FibGVTdHJpbmd9PC9zdHJvbmc+YDtcbiAgICAgIH1cbiAgICAgIGlmICggZHJhd2FibGUuZGlydHkgKSB7XG4gICAgICAgIGRyYXdhYmxlU3RyaW5nICs9ICggZHJhd2FibGUuZGlydHkgPyAnIDxzcGFuIHN0eWxlPVwiY29sb3I6ICNjMDA7XCI+W3hdPC9zcGFuPicgOiAnJyApO1xuICAgICAgfVxuICAgICAgaWYgKCAhZHJhd2FibGUuZml0dGFibGUgKSB7XG4gICAgICAgIGRyYXdhYmxlU3RyaW5nICs9ICggZHJhd2FibGUuZGlydHkgPyAnIDxzcGFuIHN0eWxlPVwiY29sb3I6ICMwYzA7XCI+W25vLWZpdF08L3NwYW4+JyA6ICcnICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZHJhd2FibGVTdHJpbmc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRJbnN0YW5jZVN1YnRyZWUoIGluc3RhbmNlOiBJbnN0YW5jZSApOiB2b2lkIHtcbiAgICAgIGxldCBkaXYgPSBgPGRpdiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAke2RlcHRoICogMjB9cHhcIj5gO1xuXG4gICAgICBmdW5jdGlvbiBhZGREcmF3YWJsZSggbmFtZTogc3RyaW5nLCBkcmF3YWJsZTogRHJhd2FibGUgKTogdm9pZCB7XG4gICAgICAgIGRpdiArPSBgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICM4ODhcIj4ke25hbWV9OiR7ZHJhd2FibGVTdW1tYXJ5KCBkcmF3YWJsZSApfTwvc3Bhbj5gO1xuICAgICAgfVxuXG4gICAgICBkaXYgKz0gaW5zdGFuY2VTdW1tYXJ5KCBpbnN0YW5jZSApO1xuXG4gICAgICBpbnN0YW5jZS5zZWxmRHJhd2FibGUgJiYgYWRkRHJhd2FibGUoICdzZWxmJywgaW5zdGFuY2Uuc2VsZkRyYXdhYmxlICk7XG4gICAgICBpbnN0YW5jZS5ncm91cERyYXdhYmxlICYmIGFkZERyYXdhYmxlKCAnZ3JvdXAnLCBpbnN0YW5jZS5ncm91cERyYXdhYmxlICk7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gSW5zdGFuY2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgJiYgYWRkRHJhd2FibGUoICdzaGFyZWRDYWNoZScsIGluc3RhbmNlLnNoYXJlZENhY2hlRHJhd2FibGUgKTtcblxuICAgICAgZGl2ICs9ICc8L2Rpdj4nO1xuICAgICAgcmVzdWx0ICs9IGRpdjtcblxuICAgICAgZGVwdGggKz0gMTtcbiAgICAgIF8uZWFjaCggaW5zdGFuY2UuY2hpbGRyZW4sIGNoaWxkSW5zdGFuY2UgPT4ge1xuICAgICAgICBwcmludEluc3RhbmNlU3VidHJlZSggY2hpbGRJbnN0YW5jZSApO1xuICAgICAgfSApO1xuICAgICAgZGVwdGggLT0gMTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX2Jhc2VJbnN0YW5jZSApIHtcbiAgICAgIHJlc3VsdCArPSBgPGRpdiBzdHlsZT1cIiR7aGVhZGVyU3R5bGV9XCI+Um9vdCBJbnN0YW5jZSBUcmVlPC9kaXY+YDtcbiAgICAgIHByaW50SW5zdGFuY2VTdWJ0cmVlKCB0aGlzLl9iYXNlSW5zdGFuY2UgKTtcbiAgICB9XG5cbiAgICBfLmVhY2goIHRoaXMuX3NoYXJlZENhbnZhc0luc3RhbmNlcywgaW5zdGFuY2UgPT4ge1xuICAgICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5TaGFyZWQgQ2FudmFzIEluc3RhbmNlIFRyZWU8L2Rpdj5gO1xuICAgICAgcHJpbnRJbnN0YW5jZVN1YnRyZWUoIGluc3RhbmNlICk7XG4gICAgfSApO1xuXG4gICAgZnVuY3Rpb24gcHJpbnREcmF3YWJsZVN1YnRyZWUoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcbiAgICAgIGxldCBkaXYgPSBgPGRpdiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAke2RlcHRoICogMjB9cHhcIj5gO1xuXG4gICAgICBkaXYgKz0gZHJhd2FibGVTdW1tYXJ5KCBkcmF3YWJsZSApO1xuICAgICAgaWYgKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgU2VsZkRyYXdhYmxlICkuaW5zdGFuY2UgKSB7XG4gICAgICAgIGRpdiArPSBgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICMwYTA7XCI+KCR7KCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIFNlbGZEcmF3YWJsZSApLmluc3RhbmNlLnRyYWlsLnRvUGF0aFN0cmluZygpfSk8L3NwYW4+YDtcbiAgICAgICAgZGl2ICs9IGAmbmJzcDsmbmJzcDsmbmJzcDske2luc3RhbmNlU3VtbWFyeSggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIFNlbGZEcmF3YWJsZSApLmluc3RhbmNlICl9YDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJhY2tib25lSW5zdGFuY2UgKSB7XG4gICAgICAgIGRpdiArPSBgIDxzcGFuIHN0eWxlPVwiY29sb3I6ICNhMDA7XCI+KCR7KCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5iYWNrYm9uZUluc3RhbmNlLnRyYWlsLnRvUGF0aFN0cmluZygpfSk8L3NwYW4+YDtcbiAgICAgICAgZGl2ICs9IGAmbmJzcDsmbmJzcDsmbmJzcDske2luc3RhbmNlU3VtbWFyeSggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJhY2tib25lRHJhd2FibGUgKS5iYWNrYm9uZUluc3RhbmNlICl9YDtcbiAgICAgIH1cblxuICAgICAgZGl2ICs9ICc8L2Rpdj4nO1xuICAgICAgcmVzdWx0ICs9IGRpdjtcblxuICAgICAgaWYgKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmFja2JvbmVEcmF3YWJsZSApLmJsb2NrcyApIHtcbiAgICAgICAgLy8gd2UncmUgYSBiYWNrYm9uZVxuICAgICAgICBkZXB0aCArPSAxO1xuICAgICAgICBfLmVhY2goICggZHJhd2FibGUgYXMgdW5rbm93biBhcyBCYWNrYm9uZURyYXdhYmxlICkuYmxvY2tzLCBjaGlsZERyYXdhYmxlID0+IHtcbiAgICAgICAgICBwcmludERyYXdhYmxlU3VidHJlZSggY2hpbGREcmF3YWJsZSApO1xuICAgICAgICB9ICk7XG4gICAgICAgIGRlcHRoIC09IDE7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggKCBkcmF3YWJsZSBhcyB1bmtub3duIGFzIEJsb2NrICkuZmlyc3REcmF3YWJsZSAmJiAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIC8vIHdlJ3JlIGEgYmxvY2tcbiAgICAgICAgZGVwdGggKz0gMTtcbiAgICAgICAgZm9yICggbGV0IGNoaWxkRHJhd2FibGUgPSAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5maXJzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlICE9PSAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGU7IGNoaWxkRHJhd2FibGUgPSBjaGlsZERyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgICAgICBwcmludERyYXdhYmxlU3VidHJlZSggY2hpbGREcmF3YWJsZSApO1xuICAgICAgICB9XG4gICAgICAgIHByaW50RHJhd2FibGVTdWJ0cmVlKCAoIGRyYXdhYmxlIGFzIHVua25vd24gYXMgQmxvY2sgKS5sYXN0RHJhd2FibGUhICk7IC8vIHdhc24ndCBoaXQgaW4gb3VyIHNpbXBsaWZpZWQgKGFuZCBzYWZlcikgbG9vcFxuICAgICAgICBkZXB0aCAtPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy5fcm9vdEJhY2tib25lICkge1xuICAgICAgcmVzdWx0ICs9ICc8ZGl2IHN0eWxlPVwiZm9udC13ZWlnaHQ6IGJvbGQ7XCI+Um9vdCBEcmF3YWJsZSBUcmVlPC9kaXY+JztcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBCYWNrYm9uZURyYXdhYmxlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBwcmludERyYXdhYmxlU3VidHJlZSggdGhpcy5fcm9vdEJhY2tib25lICk7XG4gICAgfVxuXG4gICAgLy9PSFRXTyBUT0RPOiBhZGQgc2hhcmVkIGNhY2hlIGRyYXdhYmxlIHRyZWVzIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGdldERlYnVnSFRNTCgpIGluZm9ybWF0aW9uLCBidXQgd3JhcHBlZCBpbnRvIGEgZnVsbCBIVE1MIHBhZ2UgaW5jbHVkZWQgaW4gYSBkYXRhIFVSSS5cbiAgICovXG4gIHB1YmxpYyBnZXREZWJ1Z1VSSSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgZGF0YTp0ZXh0L2h0bWw7Y2hhcnNldD11dGYtOCwke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgIGAkeyc8IURPQ1RZUEUgaHRtbD4nICtcbiAgICAgICc8aHRtbCBsYW5nPVwiZW5cIj4nICtcbiAgICAgICc8aGVhZD48dGl0bGU+U2NlbmVyeSBEZWJ1ZyBTbmFwc2hvdDwvdGl0bGU+PC9oZWFkPicgK1xuICAgICAgJzxib2R5IHN0eWxlPVwiZm9udC1zaXplOiAxMnB4O1wiPid9JHt0aGlzLmdldERlYnVnSFRNTCgpfTwvYm9keT5gICtcbiAgICAgICc8L2h0bWw+J1xuICAgICl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBvcGVuIGEgcG9wdXAgd2l0aCB0aGUgZ2V0RGVidWdIVE1MKCkgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgcG9wdXBEZWJ1ZygpOiB2b2lkIHtcbiAgICB3aW5kb3cub3BlbiggdGhpcy5nZXREZWJ1Z1VSSSgpICk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gb3BlbiBhbiBpZnJhbWUgcG9wdXAgd2l0aCB0aGUgZ2V0RGVidWdIVE1MKCkgaW5mb3JtYXRpb24gaW4gdGhlIHNhbWUgd2luZG93LiBUaGlzIGlzIHNpbWlsYXIgdG9cbiAgICogcG9wdXBEZWJ1ZygpLCBidXQgc2hvdWxkIHdvcmsgaW4gYnJvd3NlcnMgdGhhdCBibG9jayBwb3B1cHMsIG9yIHByZXZlbnQgdGhhdCB0eXBlIG9mIGRhdGEgVVJJIGJlaW5nIG9wZW5lZC5cbiAgICovXG4gIHB1YmxpYyBpZnJhbWVEZWJ1ZygpOiB2b2lkIHtcbiAgICBjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaWZyYW1lJyApO1xuICAgIGlmcmFtZS53aWR0aCA9ICcnICsgd2luZG93LmlubmVyV2lkdGg7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICBpZnJhbWUuaGVpZ2h0ID0gJycgKyB3aW5kb3cuaW5uZXJIZWlnaHQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICBpZnJhbWUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGlmcmFtZS5zdHlsZS5sZWZ0ID0gJzAnO1xuICAgIGlmcmFtZS5zdHlsZS50b3AgPSAnMCc7XG4gICAgaWZyYW1lLnN0eWxlLnpJbmRleCA9ICcxMDAwMCc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggaWZyYW1lICk7XG5cbiAgICBpZnJhbWUuY29udGVudFdpbmRvdyEuZG9jdW1lbnQub3BlbigpO1xuICAgIGlmcmFtZS5jb250ZW50V2luZG93IS5kb2N1bWVudC53cml0ZSggdGhpcy5nZXREZWJ1Z0hUTUwoKSApO1xuICAgIGlmcmFtZS5jb250ZW50V2luZG93IS5kb2N1bWVudC5jbG9zZSgpO1xuXG4gICAgaWZyYW1lLmNvbnRlbnRXaW5kb3chLmRvY3VtZW50LmJvZHkuc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG4gICAgY2xvc2VCdXR0b24uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGNsb3NlQnV0dG9uLnN0eWxlLnRvcCA9ICcwJztcbiAgICBjbG9zZUJ1dHRvbi5zdHlsZS5yaWdodCA9ICcwJztcbiAgICBjbG9zZUJ1dHRvbi5zdHlsZS56SW5kZXggPSAnMTAwMDEnO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGNsb3NlQnV0dG9uICk7XG5cbiAgICBjbG9zZUJ1dHRvbi50ZXh0Q29udGVudCA9ICdjbG9zZSc7XG5cbiAgICAvLyBBIG5vcm1hbCAnY2xpY2snIGV2ZW50IGxpc3RlbmVyIGRvZXNuJ3Qgc2VlbSB0byBiZSB3b3JraW5nLiBUaGlzIGlzIGxlc3MtdGhhbi1pZGVhbC5cbiAgICBbICdwb2ludGVyZG93bicsICdjbGljaycsICd0b3VjaGRvd24nIF0uZm9yRWFjaCggZXZlbnRUeXBlID0+IHtcbiAgICAgIGNsb3NlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50VHlwZSwgKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCBpZnJhbWUgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggY2xvc2VCdXR0b24gKTtcbiAgICAgIH0sIHRydWUgKTtcbiAgICB9ICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UERPTURlYnVnSFRNTCgpOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSAnJztcblxuICAgIGNvbnN0IGhlYWRlclN0eWxlID0gJ2ZvbnQtd2VpZ2h0OiBib2xkOyBmb250LXNpemU6IDEyMCU7IG1hcmdpbi10b3A6IDVweDsnO1xuICAgIGNvbnN0IGluZGVudCA9ICcmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsnO1xuXG4gICAgcmVzdWx0ICs9IGA8ZGl2IHN0eWxlPVwiJHtoZWFkZXJTdHlsZX1cIj5BY2Nlc3NpYmxlIEluc3RhbmNlczwvZGl2Pjxicj5gO1xuXG4gICAgcmVjdXJzZSggdGhpcy5fcm9vdFBET01JbnN0YW5jZSEsICcnICk7XG5cbiAgICBmdW5jdGlvbiByZWN1cnNlKCBpbnN0YW5jZTogUERPTUluc3RhbmNlLCBpbmRlbnRhdGlvbjogc3RyaW5nICk6IHZvaWQge1xuICAgICAgcmVzdWx0ICs9IGAke2luZGVudGF0aW9uICsgZXNjYXBlSFRNTCggYCR7aW5zdGFuY2UuaXNSb290SW5zdGFuY2UgPyAnJyA6IGluc3RhbmNlLm5vZGUhLnRhZ05hbWV9ICR7aW5zdGFuY2UudG9TdHJpbmcoKX1gICl9PGJyPmA7XG4gICAgICBpbnN0YW5jZS5jaGlsZHJlbi5mb3JFYWNoKCAoIGNoaWxkOiBQRE9NSW5zdGFuY2UgKSA9PiB7XG4gICAgICAgIHJlY3Vyc2UoIGNoaWxkLCBpbmRlbnRhdGlvbiArIGluZGVudCApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHJlc3VsdCArPSBgPGJyPjxkaXYgc3R5bGU9XCIke2hlYWRlclN0eWxlfVwiPlBhcmFsbGVsIERPTTwvZGl2Pjxicj5gO1xuXG4gICAgbGV0IHBhcmFsbGVsRE9NID0gdGhpcy5fcm9vdFBET01JbnN0YW5jZSEucGVlciEucHJpbWFyeVNpYmxpbmchLm91dGVySFRNTDtcbiAgICBwYXJhbGxlbERPTSA9IHBhcmFsbGVsRE9NLnJlcGxhY2UoIC8+PC9nLCAnPlxcbjwnICk7XG4gICAgY29uc3QgbGluZXMgPSBwYXJhbGxlbERPTS5zcGxpdCggJ1xcbicgKTtcblxuICAgIGxldCBpbmRlbnRhdGlvbiA9ICcnO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgbGluZSA9IGxpbmVzWyBpIF07XG4gICAgICBjb25zdCBpc0VuZFRhZyA9IGxpbmUuc3RhcnRzV2l0aCggJzwvJyApO1xuXG4gICAgICBpZiAoIGlzRW5kVGFnICkge1xuICAgICAgICBpbmRlbnRhdGlvbiA9IGluZGVudGF0aW9uLnNsaWNlKCBpbmRlbnQubGVuZ3RoICk7XG4gICAgICB9XG4gICAgICByZXN1bHQgKz0gYCR7aW5kZW50YXRpb24gKyBlc2NhcGVIVE1MKCBsaW5lICl9PGJyPmA7XG4gICAgICBpZiAoICFpc0VuZFRhZyApIHtcbiAgICAgICAgaW5kZW50YXRpb24gKz0gaW5kZW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgYXR0ZW1wdCB0byBjYWxsIGNhbGxiYWNrKCB7c3RyaW5nfSBkYXRhVVJJICkgd2l0aCB0aGUgcmFzdGVyaXphdGlvbiBvZiB0aGUgZW50aXJlIERpc3BsYXkncyBET00gc3RydWN0dXJlLFxuICAgKiB1c2VkIGZvciBpbnRlcm5hbCB0ZXN0aW5nLiBXaWxsIGNhbGwtYmFjayBudWxsIGlmIHRoZXJlIHdhcyBhbiBlcnJvclxuICAgKlxuICAgKiBPbmx5IHRlc3RlZCBvbiByZWNlbnQgQ2hyb21lIGFuZCBGaXJlZm94LCBub3QgcmVjb21tZW5kZWQgZm9yIGdlbmVyYWwgdXNlLiBHdWFyYW50ZWVkIG5vdCB0byB3b3JrIGZvciBJRSA8PSAxMC5cbiAgICpcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8zOTQgZm9yIHNvbWUgZGV0YWlscy5cbiAgICovXG4gIHB1YmxpYyBmb3JlaWduT2JqZWN0UmFzdGVyaXphdGlvbiggY2FsbGJhY2s6ICggdXJsOiBzdHJpbmcgfCBudWxsICkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICAvLyBTY2FuIG91ciBkcmF3YWJsZSB0cmVlIGZvciBDYW52YXNlcy4gV2UnbGwgcmFzdGVyaXplIHRoZW0gaGVyZSAodG8gZGF0YSBVUkxzKSBzbyB3ZSBjYW4gcmVwbGFjZSB0aGVtIGxhdGVyIGluXG4gICAgLy8gdGhlIEhUTUwgdHJlZSAod2l0aCBpbWFnZXMpIGJlZm9yZSBwdXR0aW5nIHRoYXQgaW4gdGhlIGZvcmVpZ25PYmplY3QuIFRoYXQgd2F5LCB3ZSBjYW4gYWN0dWFsbHkgZGlzcGxheVxuICAgIC8vIHRoaW5ncyByZW5kZXJlZCBpbiBDYW52YXMgaW4gb3VyIHJhc3Rlcml6YXRpb24uXG4gICAgY29uc3QgY2FudmFzVXJsTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgICBsZXQgdW5rbm93bklkcyA9IDA7XG5cbiAgICBmdW5jdGlvbiBhZGRDYW52YXMoIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgKTogdm9pZCB7XG4gICAgICBpZiAoICFjYW52YXMuaWQgKSB7XG4gICAgICAgIGNhbnZhcy5pZCA9IGB1bmtub3duLWNhbnZhcy0ke3Vua25vd25JZHMrK31gO1xuICAgICAgfVxuICAgICAgY2FudmFzVXJsTWFwWyBjYW52YXMuaWQgXSA9IGNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzY2FuRm9yQ2FudmFzZXMoIGRyYXdhYmxlOiBEcmF3YWJsZSApOiB2b2lkIHtcbiAgICAgIGlmICggZHJhd2FibGUgaW5zdGFuY2VvZiBCYWNrYm9uZURyYXdhYmxlICkge1xuICAgICAgICAvLyB3ZSdyZSBhIGJhY2tib25lXG4gICAgICAgIF8uZWFjaCggZHJhd2FibGUuYmxvY2tzLCBjaGlsZERyYXdhYmxlID0+IHtcbiAgICAgICAgICBzY2FuRm9yQ2FudmFzZXMoIGNoaWxkRHJhd2FibGUgKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGRyYXdhYmxlIGluc3RhbmNlb2YgQmxvY2sgJiYgZHJhd2FibGUuZmlyc3REcmF3YWJsZSAmJiBkcmF3YWJsZS5sYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIC8vIHdlJ3JlIGEgYmxvY2tcbiAgICAgICAgZm9yICggbGV0IGNoaWxkRHJhd2FibGUgPSBkcmF3YWJsZS5maXJzdERyYXdhYmxlOyBjaGlsZERyYXdhYmxlICE9PSBkcmF3YWJsZS5sYXN0RHJhd2FibGU7IGNoaWxkRHJhd2FibGUgPSBjaGlsZERyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgICAgICBzY2FuRm9yQ2FudmFzZXMoIGNoaWxkRHJhd2FibGUgKTtcbiAgICAgICAgfVxuICAgICAgICBzY2FuRm9yQ2FudmFzZXMoIGRyYXdhYmxlLmxhc3REcmF3YWJsZSApOyAvLyB3YXNuJ3QgaGl0IGluIG91ciBzaW1wbGlmaWVkIChhbmQgc2FmZXIpIGxvb3BcblxuICAgICAgICBpZiAoICggZHJhd2FibGUgaW5zdGFuY2VvZiBDYW52YXNCbG9jayB8fCBkcmF3YWJsZSBpbnN0YW5jZW9mIFdlYkdMQmxvY2sgKSAmJiBkcmF3YWJsZS5jYW52YXMgJiYgZHJhd2FibGUuY2FudmFzIGluc3RhbmNlb2Ygd2luZG93LkhUTUxDYW52YXNFbGVtZW50ICkge1xuICAgICAgICAgIGFkZENhbnZhcyggZHJhd2FibGUuY2FudmFzICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCBET01EcmF3YWJsZSAmJiBkcmF3YWJsZSBpbnN0YW5jZW9mIERPTURyYXdhYmxlICkge1xuICAgICAgICBpZiAoIGRyYXdhYmxlLmRvbUVsZW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTENhbnZhc0VsZW1lbnQgKSB7XG4gICAgICAgICAgYWRkQ2FudmFzKCBkcmF3YWJsZS5kb21FbGVtZW50ICk7XG4gICAgICAgIH1cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCggZHJhd2FibGUuZG9tRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2NhbnZhcycgKSwgY2FudmFzID0+IHtcbiAgICAgICAgICBhZGRDYW52YXMoIGNhbnZhcyApO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEJhY2tib25lRHJhd2FibGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBzY2FuRm9yQ2FudmFzZXMoIHRoaXMuX3Jvb3RCYWNrYm9uZSEgKTtcblxuICAgIC8vIENyZWF0ZSBhIG5ldyBkb2N1bWVudCwgc28gdGhhdCB3ZSBjYW4gKDEpIHNlcmlhbGl6ZSBpdCB0byBYSFRNTCwgYW5kICgyKSBtYW5pcHVsYXRlIGl0IGluZGVwZW5kZW50bHkuXG4gICAgLy8gSW5zcGlyZWQgYnkgaHR0cDovL2NidXJnbWVyLmdpdGh1Yi5pby9yYXN0ZXJpemVIVE1MLmpzL1xuICAgIGNvbnN0IGRvYyA9IGRvY3VtZW50LmltcGxlbWVudGF0aW9uLmNyZWF0ZUhUTUxEb2N1bWVudCggJycgKTtcbiAgICBkb2MuZG9jdW1lbnRFbGVtZW50LmlubmVySFRNTCA9IHRoaXMuZG9tRWxlbWVudC5vdXRlckhUTUw7XG4gICAgZG9jLmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoICd4bWxucycsIGRvYy5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJISApO1xuXG4gICAgLy8gSGlkZSB0aGUgUERPTVxuICAgIGRvYy5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzdHlsZScgKSApLmlubmVySFRNTCA9IGAuJHtQRE9NU2libGluZ1N0eWxlLlJPT1RfQ0xBU1NfTkFNRX0geyBkaXNwbGF5Om5vbmU7IH0gYDtcblxuICAgIC8vIFJlcGxhY2UgZWFjaCA8Y2FudmFzPiB3aXRoIGFuIDxpbWc+IHRoYXQgaGFzIHNyYz1jYW52YXMudG9EYXRhVVJMKCkgYW5kIHRoZSBzYW1lIHN0eWxlXG4gICAgbGV0IGRpc3BsYXlDYW52YXNlczogSFRNTEVsZW1lbnRbXSB8IEhUTUxDb2xsZWN0aW9uID0gZG9jLmRvY3VtZW50RWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2NhbnZhcycgKTtcbiAgICBkaXNwbGF5Q2FudmFzZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggZGlzcGxheUNhbnZhc2VzICk7IC8vIGRvbid0IHVzZSBhIGxpdmUgSFRNTENvbGxlY3Rpb24gY29weSFcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5Q2FudmFzZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkaXNwbGF5Q2FudmFzID0gZGlzcGxheUNhbnZhc2VzWyBpIF07XG5cbiAgICAgIGNvbnN0IGNzc1RleHQgPSBkaXNwbGF5Q2FudmFzLnN0eWxlLmNzc1RleHQ7XG5cbiAgICAgIGNvbnN0IGRpc3BsYXlJbWcgPSBkb2MuY3JlYXRlRWxlbWVudCggJ2ltZycgKTtcbiAgICAgIGNvbnN0IHNyYyA9IGNhbnZhc1VybE1hcFsgZGlzcGxheUNhbnZhcy5pZCBdO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3JjLCAnTXVzdCBoYXZlIG1pc3NlZCBhIHRvRGF0YVVSTCgpIG9uIGEgQ2FudmFzJyApO1xuXG4gICAgICBkaXNwbGF5SW1nLnNyYyA9IHNyYztcbiAgICAgIGRpc3BsYXlJbWcuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCBjc3NUZXh0ICk7XG5cbiAgICAgIGRpc3BsYXlDYW52YXMucGFyZW50Tm9kZSEucmVwbGFjZUNoaWxkKCBkaXNwbGF5SW1nLCBkaXNwbGF5Q2FudmFzICk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlzcGxheVdpZHRoID0gdGhpcy53aWR0aDtcbiAgICBjb25zdCBkaXNwbGF5SGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG4gICAgY29uc3QgY29tcGxldGVGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgIERpc3BsYXkuZWxlbWVudFRvU1ZHRGF0YVVSTCggZG9jLmRvY3VtZW50RWxlbWVudCwgZGlzcGxheVdpZHRoLCBkaXNwbGF5SGVpZ2h0LCBjYWxsYmFjayApO1xuICAgIH07XG5cbiAgICAvLyBDb252ZXJ0IGVhY2ggPGltYWdlPidzIHhsaW5rOmhyZWYgc28gdGhhdCBpdCdzIGEgZGF0YSBVUkwgd2l0aCB0aGUgcmVsZXZhbnQgZGF0YSwgZS5nLlxuICAgIC8vIDxpbWFnZSAuLi4geGxpbms6aHJlZj1cImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9zY2VuZXJ5LXBoZXQvaW1hZ2VzL2JhdHRlcnlEQ2VsbC5wbmc/YnVzdD0xNDc2MzA4NDA3OTg4XCIvPlxuICAgIC8vIGdldHMgcmVwbGFjZWQgd2l0aCBhIGRhdGEgVVJMLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNTczXG4gICAgbGV0IHJlcGxhY2VkSW1hZ2VzID0gMDsgLy8gQ291bnQgaG93IG1hbnkgaW1hZ2VzIGdldCByZXBsYWNlZC4gV2UnbGwgZGVjcmVtZW50IHdpdGggZWFjaCBmaW5pc2hlZCBpbWFnZS5cbiAgICBsZXQgaGFzUmVwbGFjZWRJbWFnZXMgPSBmYWxzZTsgLy8gV2hldGhlciBhbnkgaW1hZ2VzIGFyZSByZXBsYWNlZFxuICAgIGNvbnN0IGRpc3BsYXlTVkdJbWFnZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggZG9jLmRvY3VtZW50RWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2ltYWdlJyApICk7XG4gICAgZm9yICggbGV0IGogPSAwOyBqIDwgZGlzcGxheVNWR0ltYWdlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IGRpc3BsYXlTVkdJbWFnZSA9IGRpc3BsYXlTVkdJbWFnZXNbIGogXTtcbiAgICAgIGNvbnN0IGN1cnJlbnRIcmVmID0gZGlzcGxheVNWR0ltYWdlLmdldEF0dHJpYnV0ZSggJ3hsaW5rOmhyZWYnICk7XG4gICAgICBpZiAoIGN1cnJlbnRIcmVmLnNsaWNlKCAwLCA1ICkgIT09ICdkYXRhOicgKSB7XG4gICAgICAgIHJlcGxhY2VkSW1hZ2VzKys7XG4gICAgICAgIGhhc1JlcGxhY2VkSW1hZ2VzID0gdHJ1ZTtcblxuICAgICAgICAoICgpID0+IHtcbiAgICAgICAgICAvLyBDbG9zdXJlIHZhcmlhYmxlcyBuZWVkIHRvIGJlIHN0b3JlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIFNWRyBpbWFnZS5cbiAgICAgICAgICBjb25zdCByZWZJbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICAgICAgICBjb25zdCBzdmdJbWFnZSA9IGRpc3BsYXlTVkdJbWFnZTtcblxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbG9vcC1mdW5jXG4gICAgICAgICAgcmVmSW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gR2V0IGEgQ2FudmFzXG4gICAgICAgICAgICBjb25zdCByZWZDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgICAgICAgICAgcmVmQ2FudmFzLndpZHRoID0gcmVmSW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICByZWZDYW52YXMuaGVpZ2h0ID0gcmVmSW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgcmVmQ29udGV4dCA9IHJlZkNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xuXG4gICAgICAgICAgICAvLyBEcmF3IHRoZSAobm93IGxvYWRlZCkgaW1hZ2UgaW50byB0aGUgQ2FudmFzXG4gICAgICAgICAgICByZWZDb250ZXh0LmRyYXdJbWFnZSggcmVmSW1hZ2UsIDAsIDAgKTtcblxuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgPGltYWdlPidzIGhyZWYgd2l0aCB0aGUgQ2FudmFzJyBkYXRhLlxuICAgICAgICAgICAgc3ZnSW1hZ2Uuc2V0QXR0cmlidXRlKCAneGxpbms6aHJlZicsIHJlZkNhbnZhcy50b0RhdGFVUkwoKSApO1xuXG4gICAgICAgICAgICAvLyBJZiBpdCdzIHRoZSBsYXN0IHJlcGxhY2VkIGltYWdlLCBnbyB0byB0aGUgbmV4dCBzdGVwXG4gICAgICAgICAgICBpZiAoIC0tcmVwbGFjZWRJbWFnZXMgPT09IDAgKSB7XG4gICAgICAgICAgICAgIGNvbXBsZXRlRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVwbGFjZWRJbWFnZXMgPj0gMCApO1xuICAgICAgICAgIH07XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmNcbiAgICAgICAgICByZWZJbWFnZS5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gTk9URTogbm90IG11Y2ggd2UgY2FuIGRvLCBsZWF2ZSB0aGlzIGVsZW1lbnQgYWxvbmUuXG5cbiAgICAgICAgICAgIC8vIElmIGl0J3MgdGhlIGxhc3QgcmVwbGFjZWQgaW1hZ2UsIGdvIHRvIHRoZSBuZXh0IHN0ZXBcbiAgICAgICAgICAgIGlmICggLS1yZXBsYWNlZEltYWdlcyA9PT0gMCApIHtcbiAgICAgICAgICAgICAgY29tcGxldGVGdW5jdGlvbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZXBsYWNlZEltYWdlcyA+PSAwICk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIEtpY2sgb2ZmIGxvYWRpbmcgb2YgdGhlIGltYWdlLlxuICAgICAgICAgIHJlZkltYWdlLnNyYyA9IGN1cnJlbnRIcmVmO1xuICAgICAgICB9ICkoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiBubyBpbWFnZXMgYXJlIHJlcGxhY2VkLCB3ZSBuZWVkIHRvIGNhbGwgb3VyIGNhbGxiYWNrIHRocm91Z2ggdGhpcyByb3V0ZS5cbiAgICBpZiAoICFoYXNSZXBsYWNlZEltYWdlcyApIHtcbiAgICAgIGNvbXBsZXRlRnVuY3Rpb24oKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcG9wdXBSYXN0ZXJpemF0aW9uKCk6IHZvaWQge1xuICAgIHRoaXMuZm9yZWlnbk9iamVjdFJhc3Rlcml6YXRpb24oIHVybCA9PiB7XG4gICAgICBpZiAoIHVybCApIHtcbiAgICAgICAgd2luZG93Lm9wZW4oIHVybCApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaWxsIHJldHVybiBudWxsIGlmIHRoZSBzdHJpbmcgb2YgaW5kaWNlcyBpc24ndCBwYXJ0IG9mIHRoZSBQRE9NSW5zdGFuY2UgdHJlZVxuICAgKi9cbiAgcHVibGljIGdldFRyYWlsRnJvbVBET01JbmRpY2VzU3RyaW5nKCBpbmRpY2VzU3RyaW5nOiBzdHJpbmcgKTogVHJhaWwgfCBudWxsIHtcblxuICAgIC8vIE5vIFBET01JbnN0YW5jZSB0cmVlIGlmIHRoZSBkaXNwbGF5IGlzbid0IGFjY2Vzc2libGVcbiAgICBpZiAoICF0aGlzLl9yb290UERPTUluc3RhbmNlICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IGluc3RhbmNlID0gdGhpcy5fcm9vdFBET01JbnN0YW5jZTtcbiAgICBjb25zdCBpbmRleFN0cmluZ3MgPSBpbmRpY2VzU3RyaW5nLnNwbGl0KCBQRE9NVXRpbHMuUERPTV9VTklRVUVfSURfU0VQQVJBVE9SICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5kZXhTdHJpbmdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGlnaXQgPSBOdW1iZXIoIGluZGV4U3RyaW5nc1sgaSBdICk7XG4gICAgICBpbnN0YW5jZSA9IGluc3RhbmNlLmNoaWxkcmVuWyBkaWdpdCBdO1xuICAgICAgaWYgKCAhaW5zdGFuY2UgKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAoIGluc3RhbmNlICYmIGluc3RhbmNlLnRyYWlsICkgPyBpbnN0YW5jZS50cmFpbCA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRm9yY2VzIFNWRyBlbGVtZW50cyB0byBoYXZlIHRoZWlyIHZpc3VhbCBjb250ZW50cyByZWZyZXNoZWQsIGJ5IGNoYW5naW5nIHN0YXRlIGluIGEgbm9uLXZpc3VhbGx5LWFwcGFyZW50IHdheS5cbiAgICogSXQgc2hvdWxkIHRyaWNrIGJyb3dzZXJzIGludG8gcmUtcmVuZGVyaW5nIHRoZSBTVkcgZWxlbWVudHMuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTUwN1xuICAgKi9cbiAgcHVibGljIHJlZnJlc2hTVkcoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVmcmVzaFNWR0VtaXR0ZXIuZW1pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gcmVmcmVzaFNWRyAoc2VlIGRvY3MgYWJvdmUpLCBidXQgd2lsbCBkbyBzbyBvbiB0aGUgbmV4dCBmcmFtZS5cbiAgICovXG4gIHB1YmxpYyByZWZyZXNoU1ZHT25OZXh0RnJhbWUoKTogdm9pZCB7XG4gICAgdGhpcy5fcmVmcmVzaFNWR1BlbmRpbmcgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXMuXG4gICAqXG4gICAqIFRPRE86IHRoaXMgZGlzcG9zZSBmdW5jdGlvbiBpcyBub3QgY29tcGxldGUuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGFzc2VydCggIXRoaXMuX2lzRGlzcG9zaW5nICk7XG4gICAgICBhc3NlcnQoICF0aGlzLl9pc0Rpc3Bvc2VkICk7XG5cbiAgICAgIHRoaXMuX2lzRGlzcG9zaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX2lucHV0ICkge1xuICAgICAgdGhpcy5kZXRhY2hFdmVudHMoKTtcbiAgICB9XG4gICAgdGhpcy5fcm9vdE5vZGUucmVtb3ZlUm9vdGVkRGlzcGxheSggdGhpcyApO1xuXG4gICAgaWYgKCB0aGlzLl9hY2Nlc3NpYmxlICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYm91bmRIYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvbiwgJ19ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uIHdhcyBub3QgYWRkZWQgdG8gdGhlIGtleVN0YXRlVHJhY2tlcicgKTtcbiAgICAgIGdsb2JhbEtleVN0YXRlVHJhY2tlci5rZXlkb3duRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fYm91bmRIYW5kbGVGdWxsU2NyZWVuTmF2aWdhdGlvbiEgKTtcbiAgICAgIHRoaXMuX3Jvb3RQRE9NSW5zdGFuY2UhLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mb2N1c092ZXJsYXkgJiYgdGhpcy5fZm9jdXNPdmVybGF5LmRpc3Bvc2UoKTtcblxuICAgIHRoaXMuc2l6ZVByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgIC8vIFdpbGwgaW1tZWRpYXRlbHkgZGlzcG9zZSByZWN1cnNpdmVseSwgYWxsIEluc3RhbmNlcyBBTkQgdGhlaXIgYXR0YWNoZWQgZHJhd2FibGVzLCB3aGljaCB3aWxsIGluY2x1ZGUgdGhlXG4gICAgLy8gcm9vdEJhY2tib25lLlxuICAgIHRoaXMuX2Jhc2VJbnN0YW5jZSAmJiB0aGlzLl9iYXNlSW5zdGFuY2UuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5kZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlLmRpc3Bvc2UoKTtcblxuICAgIHRoaXMuZm9jdXNNYW5hZ2VyICYmIHRoaXMuZm9jdXNNYW5hZ2VyLmRpc3Bvc2UoKTtcblxuICAgIHRoaXMuY2FuY2VsVXBkYXRlT25SZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcblxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgdGhpcy5faXNEaXNwb3NpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIGdpdmVuIERPTSBlbGVtZW50LCBhbmQgYXN5bmNocm9ub3VzbHkgcmVuZGVycyBpdCB0byBhIHN0cmluZyB0aGF0IGlzIGEgZGF0YSBVUkwgcmVwcmVzZW50aW5nIGFuIFNWR1xuICAgKiBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gZG9tRWxlbWVudFxuICAgKiBAcGFyYW0gd2lkdGggLSBUaGUgd2lkdGggb2YgdGhlIG91dHB1dCBTVkdcbiAgICogQHBhcmFtIGhlaWdodCAtIFRoZSBoZWlnaHQgb2YgdGhlIG91dHB1dCBTVkdcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gQ2FsbGVkIGFzIGNhbGxiYWNrKCB1cmw6IHtzdHJpbmd9ICksIHdoZXJlIHRoZSBVUkwgd2lsbCBiZSB0aGUgZW5jb2RlZCBTVkcgZmlsZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZWxlbWVudFRvU1ZHRGF0YVVSTCggZG9tRWxlbWVudDogSFRNTEVsZW1lbnQsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYWxsYmFjazogKCB1cmw6IHN0cmluZyB8IG51bGwgKSA9PiB2b2lkICk6IHZvaWQge1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAvLyBTZXJpYWxpemUgaXQgdG8gWEhUTUwgdGhhdCBjYW4gYmUgdXNlZCBpbiBmb3JlaWduT2JqZWN0IChIVE1MIGNhbid0IGJlKVxuICAgIGNvbnN0IHhodG1sID0gbmV3IHdpbmRvdy5YTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcoIGRvbUVsZW1lbnQgKTtcblxuICAgIC8vIENyZWF0ZSBhbiBTVkcgY29udGFpbmVyIHdpdGggYSBmb3JlaWduT2JqZWN0LlxuICAgIGNvbnN0IGRhdGEgPSBgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIke3dpZHRofVwiIGhlaWdodD1cIiR7aGVpZ2h0fVwiPmAgK1xuICAgICAgICAgICAgICAgICAnPGZvcmVpZ25PYmplY3Qgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPicgK1xuICAgICAgICAgICAgICAgICBgPGRpdiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIj4ke1xuICAgICAgICAgICAgICAgICAgIHhodG1sXG4gICAgICAgICAgICAgICAgIH08L2Rpdj5gICtcbiAgICAgICAgICAgICAgICAgJzwvZm9yZWlnbk9iamVjdD4nICtcbiAgICAgICAgICAgICAgICAgJzwvc3ZnPic7XG5cbiAgICAvLyBMb2FkIGFuIDxpbWc+IHdpdGggdGhlIFNWRyBkYXRhIFVSTCwgYW5kIHdoZW4gbG9hZGVkIGRyYXcgaXQgaW50byBvdXIgQ2FudmFzXG4gICAgY29uc3QgaW1nID0gbmV3IHdpbmRvdy5JbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZSggaW1nLCAwLCAwICk7XG4gICAgICBjYWxsYmFjayggY2FudmFzLnRvRGF0YVVSTCgpICk7IC8vIEVuZHBvaW50IGhlcmVcbiAgICB9O1xuICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgY2FsbGJhY2soIG51bGwgKTtcbiAgICB9O1xuXG4gICAgLy8gV2UgY2FuJ3QgYnRvYSgpIGFyYml0cmFyeSB1bmljb2RlLCBzbyB3ZSBuZWVkIGFub3RoZXIgc29sdXRpb24sXG4gICAgLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3dCYXNlNjQvQmFzZTY0X2VuY29kaW5nX2FuZF9kZWNvZGluZyNUaGVfLjIyVW5pY29kZV9Qcm9ibGVtLjIyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEV4dGVyaW9yIGxpYlxuICAgIGNvbnN0IHVpbnQ4YXJyYXkgPSBuZXcgVGV4dEVuY29kZXJMaXRlKCAndXRmLTgnICkuZW5jb2RlKCBkYXRhICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gZnJvbUJ5dGVBcnJheSBFeHRlcmlvciBsaWJcbiAgICBjb25zdCBiYXNlNjQgPSBmcm9tQnl0ZUFycmF5KCB1aW50OGFycmF5ICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuICAgIC8vIHR1cm4gaXQgdG8gYmFzZTY0IGFuZCB3cmFwIGl0IGluIHRoZSBkYXRhIFVSTCBmb3JtYXRcbiAgICBpbWcuc3JjID0gYGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJHtiYXNlNjR9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgd2hlbiBOTyBub2RlcyBpbiB0aGUgc3VidHJlZSBhcmUgZGlzcG9zZWQuXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBhc3NlcnRTdWJ0cmVlRGlzcG9zZWQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW5vZGUuaXNEaXNwb3NlZCwgJ0Rpc3Bvc2VkIG5vZGVzIHNob3VsZCBub3QgYmUgaW5jbHVkZWQgaW4gYSBzY2VuZSBncmFwaCB0byBkaXNwbGF5LicgKTtcblxuICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgRGlzcGxheS5hc3NlcnRTdWJ0cmVlRGlzcG9zZWQoIG5vZGUuY2hpbGRyZW5bIGkgXSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyIHRvIGJlIGZpcmVkIGZvciBBTlkgRGlzcGxheVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBhZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIERpc3BsYXkuaW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICksICdJbnB1dCBsaXN0ZW5lciBhbHJlYWR5IHJlZ2lzdGVyZWQnICk7XG5cbiAgICAvLyBkb24ndCBhbGxvdyBsaXN0ZW5lcnMgdG8gYmUgYWRkZWQgbXVsdGlwbGUgdGltZXNcbiAgICBpZiAoICFfLmluY2x1ZGVzKCBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLCBsaXN0ZW5lciApICkge1xuICAgICAgRGlzcGxheS5pbnB1dExpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgd2l0aCBEaXNwbGF5LmFkZElucHV0TGlzdGVuZXIuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB2b2lkIHtcbiAgICAvLyBlbnN1cmUgdGhlIGxpc3RlbmVyIGlzIGluIG91ciBsaXN0XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggRGlzcGxheS5pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSApO1xuXG4gICAgRGlzcGxheS5pbnB1dExpc3RlbmVycy5zcGxpY2UoIF8uaW5kZXhPZiggRGlzcGxheS5pbnB1dExpc3RlbmVycywgbGlzdGVuZXIgKSwgMSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgYWxsIGlucHV0IGxpc3RlbmVycyB0aGF0IGFyZSBhdHRhY2hlZCB0byBhbGwgRGlzcGxheXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGludGVycnVwdElucHV0KCk6IHZvaWQge1xuICAgIGNvbnN0IGxpc3RlbmVyc0NvcHkgPSBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLnNsaWNlKCAwICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnNDb3B5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNDb3B5WyBpIF07XG5cbiAgICAgIGxpc3RlbmVyLmludGVycnVwdCAmJiBsaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaXJlcyB3aGVuIHdlIGRldGVjdCBhbiBpbnB1dCBldmVudCB0aGF0IHdvdWxkIGJlIGNvbnNpZGVyZWQgYSBcInVzZXIgZ2VzdHVyZVwiIGJ5IENocm9tZSwgc29cbiAgLy8gdGhhdCB3ZSBjYW4gdHJpZ2dlciBicm93c2VyIGFjdGlvbnMgdGhhdCBhcmUgb25seSBhbGxvd2VkIGFzIGEgcmVzdWx0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgwMiBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZpYmUvaXNzdWVzLzMyIGZvciBtb3JlXG4gIC8vIGluZm9ybWF0aW9uLlxuICBwdWJsaWMgc3RhdGljIHVzZXJHZXN0dXJlRW1pdHRlcjogVEVtaXR0ZXI7XG5cbiAgLy8gTGlzdGVuZXJzIHRoYXQgd2lsbCBiZSBjYWxsZWQgZm9yIGV2ZXJ5IGV2ZW50IG9uIEFOWSBEaXNwbGF5LCBzZWVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzExNDkuIERvIG5vdCBkaXJlY3RseSBtb2RpZnkgdGhpcyFcbiAgcHVibGljIHN0YXRpYyBpbnB1dExpc3RlbmVyczogVElucHV0TGlzdGVuZXJbXTtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0Rpc3BsYXknLCBEaXNwbGF5ICk7XG5cbkRpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbkRpc3BsYXkuaW5wdXRMaXN0ZW5lcnMgPSBbXTsiXSwibmFtZXMiOlsiRW1pdHRlciIsInN0ZXBUaW1lciIsIlRpbnlQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJNYXRyaXgzVHlwZSIsImVzY2FwZUhUTUwiLCJvcHRpb25pemUiLCJwbGF0Zm9ybSIsIkFyaWFMaXZlQW5ub3VuY2VyIiwiVXR0ZXJhbmNlUXVldWUiLCJCYWNrYm9uZURyYXdhYmxlIiwiQmxvY2siLCJDYW52YXNCbG9jayIsIkNhbnZhc05vZGVCb3VuZHNPdmVybGF5IiwiQ29sb3IiLCJET01CbG9jayIsIkRPTURyYXdhYmxlIiwiRmVhdHVyZXMiLCJGaXR0ZWRCbG9ja0JvdW5kc092ZXJsYXkiLCJGb2N1c01hbmFnZXIiLCJGdWxsU2NyZWVuIiwiZ2xvYmFsS2V5U3RhdGVUcmFja2VyIiwiSGlnaGxpZ2h0T3ZlcmxheSIsIkhpdEFyZWFPdmVybGF5IiwiSW5wdXQiLCJJbnN0YW5jZSIsIktleWJvYXJkVXRpbHMiLCJOb2RlIiwiUERPTUluc3RhbmNlIiwiUERPTVNpYmxpbmdTdHlsZSIsIlBET01UcmVlIiwiUERPTVV0aWxzIiwiUG9pbnRlckFyZWFPdmVybGF5IiwiUG9pbnRlck92ZXJsYXkiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJzY2VuZXJ5U2VyaWFsaXplIiwiVHJhaWwiLCJVdGlscyIsIldlYkdMQmxvY2siLCJTYWZhcmlXb3JrYXJvdW5kT3ZlcmxheSIsIkNVU1RPTV9DVVJTT1JTIiwiZ2xvYmFsSWRDb3VudGVyIiwiRGlzcGxheSIsImdldERPTUVsZW1lbnQiLCJfZG9tRWxlbWVudCIsImRvbUVsZW1lbnQiLCJ1cGRhdGVEaXNwbGF5Iiwic2NlbmVyeUxvZyIsImlzTG9nZ2luZ1BlcmZvcm1hbmNlIiwicGVyZlN5bmNUcmVlQ291bnQiLCJwZXJmU3RpdGNoQ291bnQiLCJwZXJmSW50ZXJ2YWxDb3VudCIsInBlcmZEcmF3YWJsZUJsb2NrQ2hhbmdlQ291bnQiLCJwZXJmRHJhd2FibGVPbGRJbnRlcnZhbENvdW50IiwicGVyZkRyYXdhYmxlTmV3SW50ZXJ2YWxDb3VudCIsImFzc2VydCIsImFzc2VydFN1YnRyZWVEaXNwb3NlZCIsIl9yb290Tm9kZSIsIl9mcmFtZUlkIiwicHVzaCIsImZpcnN0UnVuIiwiX2Jhc2VJbnN0YW5jZSIsIl9pbnB1dCIsInZhbGlkYXRlUG9pbnRlcnMiLCJfYWNjZXNzaWJsZSIsIl9yb290UERPTUluc3RhbmNlIiwicGVlciIsInVwZGF0ZVN1YnRyZWVQb3NpdGlvbmluZyIsInZhbGlkYXRlV2F0Y2hlZEJvdW5kcyIsImFzc2VydFNsb3ciLCJhdWRpdFJvb3QiLCJfcGlja2VyIiwiYXVkaXQiLCJjcmVhdGVGcm9tUG9vbCIsImJhc2VTeW5jVHJlZSIsIm1hcmtUcmFuc2Zvcm1Sb290RGlydHkiLCJpc1RyYW5zZm9ybWVkIiwiX2RyYXdhYmxlc1RvVXBkYXRlTGlua3MiLCJsZW5ndGgiLCJwb3AiLCJ1cGRhdGVMaW5rcyIsIl9jaGFuZ2VJbnRlcnZhbHNUb0Rpc3Bvc2UiLCJkaXNwb3NlIiwiX3Jvb3RCYWNrYm9uZSIsImdyb3VwRHJhd2FibGUiLCJfZHJhd2FibGVzVG9DaGFuZ2VCbG9jayIsImNoYW5nZWQiLCJ1cGRhdGVCbG9jayIsInVwZGF0ZURpcnR5VHJhbnNmb3JtUm9vdHMiLCJ1cGRhdGVWaXNpYmlsaXR5IiwiYXVkaXRWaXNpYmlsaXR5IiwiX2luc3RhbmNlUm9vdHNUb0Rpc3Bvc2UiLCJhdWRpdEluc3RhbmNlU3VidHJlZUZvckRpc3BsYXkiLCJfZHJhd2FibGVzVG9EaXNwb3NlIiwiX2lzUGFpbnRpbmciLCJ1cGRhdGUiLCJ1cGRhdGVDdXJzb3IiLCJ1cGRhdGVCYWNrZ3JvdW5kQ29sb3IiLCJ1cGRhdGVTaXplIiwiX292ZXJsYXlzIiwiekluZGV4IiwibGFzdFpJbmRleCIsImkiLCJvdmVybGF5Iiwic3R5bGUiLCJfcmVkdWNlUmVmZXJlbmNlc05lZWRlZCIsInJlZHVjZVJlZmVyZW5jZXMiLCJzeW5jVHJlZU1lc3NhZ2UiLCJQZXJmQ3JpdGljYWwiLCJQZXJmTWFqb3IiLCJQZXJmTWlub3IiLCJQZXJmVmVyYm9zZSIsImRyYXdhYmxlQmxvY2tDb3VudE1lc3NhZ2UiLCJhdWRpdFBET01EaXNwbGF5cyIsInJvb3ROb2RlIiwiX2ZvcmNlU1ZHUmVmcmVzaCIsIl9yZWZyZXNoU1ZHUGVuZGluZyIsInJlZnJlc2hTVkciLCJnZXRQaGV0aW9FbGVtZW50QXQiLCJwb2ludCIsIm5vZGUiLCJnZXRQaGV0aW9Nb3VzZUhpdCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwic2l6ZURpcnR5Iiwic2l6ZSIsIndpZHRoIiwiX2N1cnJlbnRTaXplIiwiaGVpZ2h0IiwiX2FsbG93U2NlbmVPdmVyZmxvdyIsImNsaXAiLCJpc1dlYkdMQWxsb3dlZCIsIl9hbGxvd1dlYkdMIiwid2ViZ2xBbGxvd2VkIiwiZ2V0Um9vdE5vZGUiLCJnZXRSb290QmFja2JvbmUiLCJyb290QmFja2JvbmUiLCJnZXRTaXplIiwic2l6ZVByb3BlcnR5IiwidmFsdWUiLCJnZXRCb3VuZHMiLCJ0b0JvdW5kcyIsImJvdW5kcyIsInNldFNpemUiLCJzZXRXaWR0aEhlaWdodCIsImdldFdpZHRoIiwic2V0V2lkdGgiLCJnZXRIZWlnaHQiLCJzZXRIZWlnaHQiLCJzZXRCYWNrZ3JvdW5kQ29sb3IiLCJjb2xvciIsIl9iYWNrZ3JvdW5kQ29sb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJnZXRCYWNrZ3JvdW5kQ29sb3IiLCJpbnRlcmFjdGl2ZSIsIl9pbnRlcmFjdGl2ZSIsInJlY3Vyc2l2ZURpc2FibGUiLCJpbnRlcnJ1cHRQb2ludGVycyIsImNsZWFyQmF0Y2hlZEV2ZW50cyIsInJlbW92ZVRlbXBvcmFyeVBvaW50ZXJzIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwiaW50ZXJydXB0SW5wdXQiLCJhZGRPdmVybGF5IiwiYXBwZW5kQ2hpbGQiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVPdmVybGF5IiwicmVtb3ZlQ2hpbGQiLCJzcGxpY2UiLCJfIiwiaW5kZXhPZiIsImdldFBET01Sb290RWxlbWVudCIsInByaW1hcnlTaWJsaW5nIiwicGRvbVJvb3RFbGVtZW50IiwiaXNBY2Nlc3NpYmxlIiwiaXNFbGVtZW50VW5kZXJQRE9NIiwiZWxlbWVudCIsImFsbG93Um9vdCIsImlzRWxlbWVudENvbnRhaW5lZCIsImNvbnRhaW5zIiwiaXNOb3RSb290RWxlbWVudCIsImhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uIiwiZG9tRXZlbnQiLCJpc0Z1bGxTY3JlZW4iLCJpc0tleUV2ZW50IiwiS0VZX1RBQiIsInJvb3RFbGVtZW50IiwibmV4dEVsZW1lbnQiLCJzaGlmdEtleSIsImdldFByZXZpb3VzRm9jdXNhYmxlIiwidW5kZWZpbmVkIiwiZ2V0TmV4dEZvY3VzYWJsZSIsInRhcmdldCIsInByZXZlbnREZWZhdWx0IiwiZ2V0VXNlZFJlbmRlcmVyc0JpdG1hc2siLCJyZW5kZXJlcnNVbmRlckJhY2tib25lIiwiYmFja2JvbmUiLCJiaXRtYXNrIiwiZWFjaCIsImJsb2NrcyIsImJsb2NrIiwiZG9tRHJhd2FibGUiLCJyZW5kZXJlciIsImJpdG1hc2tSZW5kZXJlckFyZWEiLCJpbnN0YW5jZSIsInBhc3NUcmFuc2Zvcm0iLCJfZGlydHlUcmFuc2Zvcm1Sb290cyIsIl9kaXJ0eVRyYW5zZm9ybVJvb3RzV2l0aG91dFBhc3MiLCJ0cmFuc2Zvcm1TeXN0ZW0iLCJyZWxhdGl2ZVRyYW5zZm9ybSIsInVwZGF0ZVRyYW5zZm9ybUxpc3RlbmVyc0FuZENvbXB1dGUiLCJtYXJrRHJhd2FibGVDaGFuZ2VkQmxvY2siLCJkcmF3YWJsZSIsInRvU3RyaW5nIiwibWFya0ZvclJlZHVjZWRSZWZlcmVuY2VzIiwiaXRlbSIsIm1hcmtJbnN0YW5jZVJvb3RGb3JEaXNwb3NhbCIsIm1hcmtEcmF3YWJsZUZvckRpc3Bvc2FsIiwibWFya0RyYXdhYmxlRm9yTGlua3NVcGRhdGUiLCJtYXJrQ2hhbmdlSW50ZXJ2YWxUb0Rpc3Bvc2UiLCJjaGFuZ2VJbnRlcnZhbCIsIm5ld0JhY2tncm91bmRDU1MiLCJ0b0NTUyIsIl9jdXJyZW50QmFja2dyb3VuZENTUyIsIm1vdXNlIiwiY3Vyc29yIiwiQ3Vyc29yIiwic2V0U2NlbmVDdXJzb3IiLCJtb3VzZVRyYWlsIiwidHJhaWxVbmRlclBvaW50ZXIiLCJnZXRDdXJzb3JDaGVja0luZGV4Iiwibm9kZXMiLCJnZXRFZmZlY3RpdmVDdXJzb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJpZCIsIl9kZWZhdWx0Q3Vyc29yIiwic2V0RWxlbWVudEN1cnNvciIsIl9hc3N1bWVGdWxsV2luZG93IiwiZG9jdW1lbnQiLCJib2R5IiwiX2xhc3RDdXJzb3IiLCJjdXN0b21DdXJzb3JzIiwiYXBwbHlDU1NIYWNrcyIsIm92ZXJmbG93IiwibXNUb3VjaEFjdGlvbiIsInNldFN0eWxlIiwiZm9udFNtb290aGluZyIsIl9hbGxvd0NTU0hhY2tzIiwiX2xpc3RlblRvT25seUVsZW1lbnQiLCJvbnNlbGVjdHN0YXJ0IiwibXNDb250ZW50Wm9vbWluZyIsInVzZXJEcmFnIiwidXNlclNlbGVjdCIsInRvdWNoQWN0aW9uIiwidG91Y2hDYWxsb3V0IiwidGFwSGlnaGxpZ2h0Q29sb3IiLCJjYW52YXNEYXRhVVJMIiwiY2FsbGJhY2siLCJjYW52YXNTbmFwc2hvdCIsImNhbnZhcyIsInRvRGF0YVVSTCIsImNyZWF0ZUVsZW1lbnQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInJlbmRlclRvQ2FudmFzIiwiZ2V0SW1hZ2VEYXRhIiwic2V0UG9pbnRlckRpc3BsYXlWaXNpYmxlIiwidmlzaWJpbGl0eSIsImhhc092ZXJsYXkiLCJfcG9pbnRlck92ZXJsYXkiLCJzZXRQb2ludGVyQXJlYURpc3BsYXlWaXNpYmxlIiwiX3BvaW50ZXJBcmVhT3ZlcmxheSIsInNldEhpdEFyZWFEaXNwbGF5VmlzaWJsZSIsIl9oaXRBcmVhT3ZlcmxheSIsInNldENhbnZhc05vZGVCb3VuZHNWaXNpYmxlIiwiX2NhbnZhc0FyZWFCb3VuZHNPdmVybGF5Iiwic2V0Rml0dGVkQmxvY2tCb3VuZHNWaXNpYmxlIiwiX2ZpdHRlZEJsb2NrQm91bmRzT3ZlcmxheSIsInJlc2l6ZU9uV2luZG93UmVzaXplIiwicmVzaXplciIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1cGRhdGVPblJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0ZXBDYWxsYmFjayIsImxhc3RUaW1lIiwidGltZUVsYXBzZWRJblNlY29uZHMiLCJzZWxmIiwic3RlcCIsIl9yZXF1ZXN0QW5pbWF0aW9uRnJhbWVJRCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInRpbWVOb3ciLCJEYXRlIiwibm93IiwiZW1pdCIsImNhbmNlbFVwZGF0ZU9uUmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJpbml0aWFsaXplRXZlbnRzIiwib3B0aW9ucyIsImlucHV0IiwiX2JhdGNoRE9NRXZlbnRzIiwiX3Bhc3NpdmVFdmVudHMiLCJjb25uZWN0TGlzdGVuZXJzIiwiZGV0YWNoRXZlbnRzIiwiZGlzY29ubmVjdExpc3RlbmVycyIsImFkZElucHV0TGlzdGVuZXIiLCJsaXN0ZW5lciIsImluY2x1ZGVzIiwiX2lucHV0TGlzdGVuZXJzIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJnZXRJbnB1dExpc3RlbmVycyIsInNsaWNlIiwiaW5wdXRMaXN0ZW5lcnMiLCJsaXN0ZW5lcnNDb3B5IiwiaW50ZXJydXB0IiwiaW50ZXJydXB0T3RoZXJQb2ludGVycyIsImV4Y2x1ZGVQb2ludGVyIiwiY3VycmVudFNjZW5lcnlFdmVudCIsInBvaW50ZXIiLCJlbnN1cmVOb3RQYWludGluZyIsImxvc2VXZWJHTENvbnRleHRzIiwibG9zZUJhY2tib25lIiwiZm9yRWFjaCIsImdsIiwibG9zZUNvbnRleHQiLCJmaXJzdERyYXdhYmxlIiwibmV4dERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwiaW5zcGVjdCIsImxvY2FsU3RvcmFnZSIsInNjZW5lcnlTbmFwc2hvdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXREZWJ1Z0hUTUwiLCJoZWFkZXJTdHlsZSIsImRlcHRoIiwicmVzdWx0Iiwibm9kZUNvdW50IiwiY291bnQiLCJjaGlsZHJlbiIsImluc3RhbmNlQ291bnQiLCJkcmF3YWJsZUNvdW50IiwiY2hpbGREcmF3YWJsZSIsImRyYXdhYmxlQ291bnRNYXAiLCJjb3VudFJldGFpbmVkRHJhd2FibGUiLCJyZXRhaW5lZERyYXdhYmxlQ291bnQiLCJzZWxmRHJhd2FibGUiLCJzaGFyZWRDYWNoZURyYXdhYmxlIiwiZHJhd2FibGVOYW1lIiwiYmxvY2tTdW1tYXJ5IiwiaGFzQmFja2JvbmUiLCJkaXYiLCJrIiwiaW5zdGFuY2VTdW1tYXJ5IiwiaVN1bW1hcnkiLCJhZGRRdWFsaWZpZXIiLCJ0ZXh0IiwiaXNQYWludGVkIiwiZ2V0RGVidWdIVE1MRXh0cmFzIiwidmlzaWJsZSIsInJlbGF0aXZlVmlzaWJsZSIsInNlbGZWaXNpYmxlIiwiZml0dGFiaWxpdHkiLCJhbmNlc3RvcnNGaXR0YWJsZSIsInNlbGZGaXR0YWJsZSIsInBpY2thYmxlIiwidHJhaWwiLCJpc1BpY2thYmxlIiwiY2xpcEFyZWEiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJnZXRSZW5kZXJlciIsImlzTGF5ZXJTcGxpdCIsIm9wYWNpdHkiLCJkaXNhYmxlZE9wYWNpdHkiLCJfYm91bmRzRXZlbnRDb3VudCIsIl9ib3VuZHNFdmVudFNlbGZDb3VudCIsInRyYW5zZm9ybVR5cGUiLCJ0cmFuc2Zvcm0iLCJnZXRNYXRyaXgiLCJ0eXBlIiwiSURFTlRJVFkiLCJUUkFOU0xBVElPTl8yRCIsIlNDQUxJTkciLCJBRkZJTkUiLCJPVEhFUiIsIkVycm9yIiwicmVwbGFjZSIsImluZGljZXMiLCJqb2luIiwiX3JlbmRlcmVyU3VtbWFyeSIsIl9yZW5kZXJlckJpdG1hc2siLCJiaXRtYXNrTm9kZURlZmF1bHQiLCJkcmF3YWJsZVN1bW1hcnkiLCJkcmF3YWJsZVN0cmluZyIsImRpcnR5IiwiZml0dGFibGUiLCJwcmludEluc3RhbmNlU3VidHJlZSIsImFkZERyYXdhYmxlIiwiY2hpbGRJbnN0YW5jZSIsIl9zaGFyZWRDYW52YXNJbnN0YW5jZXMiLCJwcmludERyYXdhYmxlU3VidHJlZSIsInRvUGF0aFN0cmluZyIsImJhY2tib25lSW5zdGFuY2UiLCJnZXREZWJ1Z1VSSSIsImVuY29kZVVSSUNvbXBvbmVudCIsInBvcHVwRGVidWciLCJvcGVuIiwiaWZyYW1lRGVidWciLCJpZnJhbWUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJjb250ZW50V2luZG93Iiwid3JpdGUiLCJjbG9zZSIsImJhY2tncm91bmQiLCJjbG9zZUJ1dHRvbiIsInJpZ2h0IiwidGV4dENvbnRlbnQiLCJldmVudFR5cGUiLCJnZXRQRE9NRGVidWdIVE1MIiwiaW5kZW50IiwicmVjdXJzZSIsImluZGVudGF0aW9uIiwiaXNSb290SW5zdGFuY2UiLCJ0YWdOYW1lIiwiY2hpbGQiLCJwYXJhbGxlbERPTSIsIm91dGVySFRNTCIsImxpbmVzIiwic3BsaXQiLCJsaW5lIiwiaXNFbmRUYWciLCJzdGFydHNXaXRoIiwiZm9yZWlnbk9iamVjdFJhc3Rlcml6YXRpb24iLCJjYW52YXNVcmxNYXAiLCJ1bmtub3duSWRzIiwiYWRkQ2FudmFzIiwic2NhbkZvckNhbnZhc2VzIiwiSFRNTENhbnZhc0VsZW1lbnQiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImRvYyIsImltcGxlbWVudGF0aW9uIiwiY3JlYXRlSFRNTERvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaW5uZXJIVE1MIiwibmFtZXNwYWNlVVJJIiwiUk9PVF9DTEFTU19OQU1FIiwiZGlzcGxheUNhbnZhc2VzIiwiZGlzcGxheUNhbnZhcyIsImNzc1RleHQiLCJkaXNwbGF5SW1nIiwic3JjIiwicGFyZW50Tm9kZSIsInJlcGxhY2VDaGlsZCIsImRpc3BsYXlXaWR0aCIsImRpc3BsYXlIZWlnaHQiLCJjb21wbGV0ZUZ1bmN0aW9uIiwiZWxlbWVudFRvU1ZHRGF0YVVSTCIsInJlcGxhY2VkSW1hZ2VzIiwiaGFzUmVwbGFjZWRJbWFnZXMiLCJkaXNwbGF5U1ZHSW1hZ2VzIiwiaiIsImRpc3BsYXlTVkdJbWFnZSIsImN1cnJlbnRIcmVmIiwiZ2V0QXR0cmlidXRlIiwicmVmSW1hZ2UiLCJJbWFnZSIsInN2Z0ltYWdlIiwib25sb2FkIiwicmVmQ2FudmFzIiwicmVmQ29udGV4dCIsImRyYXdJbWFnZSIsIm9uZXJyb3IiLCJwb3B1cFJhc3Rlcml6YXRpb24iLCJ1cmwiLCJnZXRUcmFpbEZyb21QRE9NSW5kaWNlc1N0cmluZyIsImluZGljZXNTdHJpbmciLCJpbmRleFN0cmluZ3MiLCJQRE9NX1VOSVFVRV9JRF9TRVBBUkFUT1IiLCJkaWdpdCIsIk51bWJlciIsIl9yZWZyZXNoU1ZHRW1pdHRlciIsInJlZnJlc2hTVkdPbk5leHRGcmFtZSIsIl9pc0Rpc3Bvc2luZyIsIl9pc0Rpc3Bvc2VkIiwicmVtb3ZlUm9vdGVkRGlzcGxheSIsIl9ib3VuZEhhbmRsZUZ1bGxTY3JlZW5OYXZpZ2F0aW9uIiwia2V5ZG93bkVtaXR0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsIl9mb2N1c092ZXJsYXkiLCJkZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlIiwiZm9jdXNNYW5hZ2VyIiwieGh0bWwiLCJYTUxTZXJpYWxpemVyIiwic2VyaWFsaXplVG9TdHJpbmciLCJkYXRhIiwiaW1nIiwidWludDhhcnJheSIsIlRleHRFbmNvZGVyTGl0ZSIsImVuY29kZSIsImJhc2U2NCIsImZyb21CeXRlQXJyYXkiLCJpc0Rpc3Bvc2VkIiwicHJvdmlkZWRPcHRpb25zIiwiY29udGFpbmVyIiwiY2xpZW50V2lkdGgiLCJjbGllbnRIZWlnaHQiLCJhbGxvd0NTU0hhY2tzIiwiYWxsb3dTYWZhcmlSZWRyYXdXb3JrYXJvdW5kIiwiYWxsb3dTY2VuZU92ZXJmbG93IiwiYWxsb3dMYXllckZpdHRpbmciLCJmb3JjZVNWR1JlZnJlc2giLCJkZWZhdWx0Q3Vyc29yIiwicHJlc2VydmVEcmF3aW5nQnVmZmVyIiwiYWxsb3dXZWJHTCIsImFjY2Vzc2liaWxpdHkiLCJzdXBwb3J0c0ludGVyYWN0aXZlSGlnaGxpZ2h0cyIsImxpc3RlblRvT25seUVsZW1lbnQiLCJiYXRjaERPTUV2ZW50cyIsImFzc3VtZUZ1bGxXaW5kb3ciLCJhZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb24iLCJwYXNzaXZlRXZlbnRzIiwic2FmYXJpIiwiYWxsb3dCYWNraW5nU2NhbGVBbnRpYWxpYXNpbmciLCJfcHJlc2VydmVEcmF3aW5nQnVmZmVyIiwiYWRkUm9vdGVkRGlzcGxheSIsInJlcHVycG9zZUJhY2tib25lQ29udGFpbmVyIiwiY3JlYXRlRGl2QmFja2JvbmUiLCJfYWdncmVzc2l2ZUNvbnRleHRSZWNyZWF0aW9uIiwiX2FsbG93QmFja2luZ1NjYWxlQW50aWFsaWFzaW5nIiwiX2FsbG93TGF5ZXJGaXR0aW5nIiwiYXJpYUxpdmVBbm5vdW5jZXIiLCJpbml0aWFsaXplIiwiZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWUiLCJfZm9jdXNSb290Tm9kZSIsInBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJyZWFkaW5nQmxvY2tIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwicG9vbCIsImNyZWF0ZSIsInJlYnVpbGRJbnN0YW5jZVRyZWUiLCJhcmlhTGl2ZUNvbnRhaW5lciIsImJpbmQiLCJhZGRMaXN0ZW5lciIsIklOVEVSUlVQVF9PVEhFUl9QT0lOVEVSUyIsImV2ZW50IiwicGhldCIsImpvaXN0IiwiZGlzcGxheSIsInJlZ2lzdGVyIiwidXNlckdlc3R1cmVFbWl0dGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWdEQyxHQUVELE9BQU9BLGFBQWEsOEJBQThCO0FBQ2xELE9BQU9DLGVBQWUsZ0NBQWdDO0FBRXRELE9BQU9DLGtCQUFrQixtQ0FBbUM7QUFHNUQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUN2RCxTQUFTQyxXQUFXLFFBQVEsNkJBQTZCO0FBRXpELE9BQU9DLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsZUFBZSxxQ0FBcUM7QUFDM0QsT0FBT0MsY0FBYyxvQ0FBb0M7QUFHekQsT0FBT0MsdUJBQXVCLG1EQUFtRDtBQUNqRixPQUFPQyxvQkFBb0IsZ0RBQWdEO0FBQzNFLFNBQVNDLGdCQUFnQixFQUFFQyxLQUFLLEVBQUVDLFdBQVcsRUFBRUMsdUJBQXVCLEVBQWtCQyxLQUFLLEVBQUVDLFFBQVEsRUFBRUMsV0FBVyxFQUFZQyxRQUFRLEVBQUVDLHdCQUF3QixFQUFFQyxZQUFZLEVBQUVDLFVBQVUsRUFBRUMscUJBQXFCLEVBQUVDLGdCQUFnQixFQUFFQyxjQUFjLEVBQUVDLEtBQUssRUFBZ0JDLFFBQVEsRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFXQyxrQkFBa0IsRUFBRUMsY0FBYyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBZ0JDLGdCQUFnQixFQUEwQ0MsS0FBSyxFQUFFQyxLQUFLLEVBQUVDLFVBQVUsUUFBUSxnQkFBZ0I7QUFDeGhCLE9BQU9DLDZCQUE2Qix5Q0FBeUM7QUFtRzdFLE1BQU1DLGlCQUFp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