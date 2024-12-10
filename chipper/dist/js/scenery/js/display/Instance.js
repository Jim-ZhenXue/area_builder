// Copyright 2013-2024, University of Colorado Boulder
/**
 * An instance that is specific to the display (not necessarily a global instance, could be in a Canvas cache, etc),
 * that is needed to tracking instance-specific display information, and signals to the display system when other
 * changes are necessary.
 *
 * Instances generally form a true tree, as opposed to the DAG of nodes. The one exception is for shared Canvas caches,
 * where multiple instances can point to one globally-stored (shared) cache instance.
 *
 * An Instance is pooled, but when constructed will not automatically create children, drawables, etc.
 * syncTree() is responsible for synchronizing the instance itself and its entire subtree.
 *
 * Instances are created as 'stateless' instances, but during syncTree the rendering state (properties to determine
 * how to construct the drawable tree for this instance and its subtree) are set.
 *
 * While Instances are considered 'stateful', they will have listeners added to their Node which records actions taken
 * in-between Display.updateDisplay().
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { BackboneDrawable, CanvasBlock, ChangeInterval, Drawable, Fittability, InlineCanvasCacheDrawable, RelativeTransform, Renderer, scenery, SharedCanvasCacheDrawable, Trail, Utils } from '../imports.js';
// This fixes how Typescript recognizes the "Display" type, used this pattern in javascript files we can't convert to
// TypeScript right now.
/**
 * @typedef {import('../imports').Display} Display
 */ let globalIdCounter = 1;
// preferences top to bottom in general
const defaultPreferredRenderers = Renderer.createOrderBitmask(Renderer.bitmaskSVG, Renderer.bitmaskCanvas, Renderer.bitmaskDOM, Renderer.bitmaskWebGL);
let Instance = class Instance {
    /**
   * @public
   *
   * @param {Display} display - Instances are bound to a single display
   * @param {Trail} trail - The list of ancestors going back up to our root instance (for the display, or for a cache)
   * @param {boolean} isDisplayRoot - Whether our instance is for the root node provided to the Display.
   * @param {boolean} isSharedCanvasCacheRoot - Whether our instance is the root for a shared Canvas cache (which can
   *                                            be used multiple places in the main instance tree)
   */ initialize(display, trail, isDisplayRoot, isSharedCanvasCacheRoot) {
        assert && assert(!this.active, 'We should never try to initialize an already active object');
        // prevent the trail passed in from being mutated after this point (we want a consistent trail)
        trail.setImmutable();
        // @public {number}
        this.id = this.id || globalIdCounter++;
        // @public {boolean}
        this.isWebGLSupported = display.isWebGLAllowed() && Utils.isWebGLSupported;
        // @public {RelativeTransform} - provides high-performance access to 'relative' transforms (from our nearest
        // transform root), and allows for listening to when our relative transform changes (called during a phase of
        // Display.updateDisplay()).
        this.relativeTransform = this.relativeTransform || new RelativeTransform(this);
        // @public {Fittability} - provides logic for whether our drawables (or common-fit ancestors) will support fitting
        // for FittedBlock subtypes. See https://github.com/phetsims/scenery/issues/406.
        this.fittability = this.fittability || new Fittability(this);
        // @public {boolean} - Tracking of visibility {boolean} and associated boolean flags.
        this.visible = true; // global visibility (whether this instance will end up appearing on the display)
        this.relativeVisible = true; // relative visibility (ignores the closest ancestral visibility root and below)
        this.selfVisible = true; // like relative visibility, but is always true if we are a visibility root
        this.visibilityDirty = true; // entire subtree of visibility will need to be updated
        this.childVisibilityDirty = true; // an ancestor needs its visibility updated
        this.voicingVisible = true; // whether this instance is "visible" for Voicing and allows speech with that feature
        // @private {Object.<instanceId:number,number>} - Maps another instance's `instance.id` {number} => branch index
        // {number} (first index where the two trails are different). This effectively operates as a cache (since it's more
        // expensive to compute the value than it is to look up the value).
        // It is also "bidirectional", such that if we add instance A's branch index to this map, we will also add the
        // same value to instance A's map (referencing this instance). In order to clean up and prevent leaks, the
        // instance references are provided in this.branchIndexReferences (on both ends), so that when one instance is
        // disposed it can remove the references bidirectionally.
        this.branchIndexMap = this.branchIndexMap || {};
        // @public {Array.<Instance>} - All instances where we have entries in our map. See docs for branchIndexMap.
        this.branchIndexReferences = cleanArray(this.branchIndexReferences);
        // @private {number} - In the range (-1,0), to help us track insertions and removals of this instance's node to its
        // parent (did we get removed but added back?).
        // If it's -1 at its parent's syncTree, we'll end up removing our reference to it.
        // We use an integer just for sanity checks (if it ever reaches -2 or 1, we've reached an invalid state)
        this.addRemoveCounter = 0;
        // @private {number} - If equal to the current frame ID (it is initialized as such), then it is treated during the
        // change interval waterfall as "completely changed", and an interval for the entire instance is used.
        this.stitchChangeFrame = display._frameId;
        // @private {number} - If equal to the current frame ID, an instance was removed from before or after this instance,
        // so we'll want to add in a proper change interval (related to siblings)
        this.stitchChangeBefore = 0;
        this.stitchChangeAfter = 0;
        // @private {number} - If equal to the current frame ID, child instances were added or removed from this instance.
        this.stitchChangeOnChildren = 0;
        // @private {boolean} - whether we have been included in our parent's drawables the previous frame
        this.stitchChangeIncluded = false;
        // @private {function} - Node listeners for tracking children. Listeners should be added only when we become
        // stateful
        this.childInsertedListener = this.childInsertedListener || this.onChildInserted.bind(this);
        this.childRemovedListener = this.childRemovedListener || this.onChildRemoved.bind(this);
        this.childrenReorderedListener = this.childrenReorderedListener || this.onChildrenReordered.bind(this);
        this.visibilityListener = this.visibilityListener || this.onVisibilityChange.bind(this);
        this.markRenderStateDirtyListener = this.markRenderStateDirtyListener || this.markRenderStateDirty.bind(this);
        // @public {TinyEmitter}
        this.visibleEmitter = new TinyEmitter();
        this.relativeVisibleEmitter = new TinyEmitter();
        this.selfVisibleEmitter = new TinyEmitter();
        this.canVoiceEmitter = new TinyEmitter();
        this.cleanInstance(display, trail);
        // We need to add this reference on stateless instances, so that we can find out if it was removed before our
        // syncTree was called.
        this.node.addInstance(this);
        // @private {number} - Outstanding external references. used for shared cache instances, where multiple instances
        // can point to us.
        this.externalReferenceCount = 0;
        // @public {boolean} - Whether we have had our state initialized yet
        this.stateless = true;
        // @public {boolean} - Whether we are the root instance for a Display. Rendering state constant (will not change
        // over the life of an instance)
        this.isDisplayRoot = isDisplayRoot;
        // @public {boolean} - Whether we are the root of a Canvas cache. Rendering state constant (will not change over the
        // life of an instance)
        this.isSharedCanvasCacheRoot = isSharedCanvasCacheRoot;
        // @private {number} - [CASCADING RENDER STATE] Packed renderer order bitmask (what our renderer preferences are).
        // Part of the 'cascading' render state for the instance tree. These are properties that can affect the entire
        // subtree when set
        this.preferredRenderers = 0;
        // @private {boolean} - [CASCADING RENDER STATE] Whether we are beneath a Canvas cache (Canvas required). Part of
        // the 'cascading' render state for the instance tree. These are properties that can affect the entire subtree when
        // set
        this.isUnderCanvasCache = isSharedCanvasCacheRoot;
        // @public {boolean} - [RENDER STATE EXPORT] Whether we will have a BackboneDrawable group drawable
        this.isBackbone = false;
        // @public {boolean} - [RENDER STATE EXPORT] Whether this instance creates a new "root" for the relative trail
        // transforms
        this.isTransformed = false;
        // @private {boolean} - [RENDER STATE EXPORT] Whether this instance handles visibility with a group drawable
        this.isVisibilityApplied = false;
        // @private {boolean} - [RENDER STATE EXPORT] Whether we have a Canvas cache specific to this instance's position
        this.isInstanceCanvasCache = false;
        // @private {boolean} - [RENDER STATE EXPORT]
        this.isSharedCanvasCachePlaceholder = false;
        // @private {boolean} - [RENDER STATE EXPORT]
        this.isSharedCanvasCacheSelf = isSharedCanvasCacheRoot;
        // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the 'self' drawable (if our Node is painted)
        this.selfRenderer = 0;
        // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the 'group' drawable (if applicable)
        this.groupRenderer = 0;
        // @private {number} - [RENDER STATE EXPORT] Renderer bitmask for the cache drawable (if applicable)
        this.sharedCacheRenderer = 0;
        // @private {number} - When equal to the current frame it is considered "dirty". Is a pruning flag (whether we need
        // to be visited, whether updateRenderingState is required, and whether to visit children)
        this.renderStateDirtyFrame = display._frameId;
        // @private {number} - When equal to the current frame we can't prune at this instance. Is a pruning flag (whether
        // we need to be visited, whether updateRenderingState is required, and whether to visit children)
        this.skipPruningFrame = display._frameId;
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`initialized ${this.toString()}`);
        // Whether we have been instantiated. false if we are in a pool waiting to be instantiated.
        this.active = true;
        return this;
    }
    /**
   * Called for initialization of properties (via initialize(), via constructor), and to clean the instance for
   * placement in the pool (don't leak memory).
   * @private
   *
   * If the parameters are null, we remove all external references so that we don't leak memory.
   *
   * @param {Display|null} display - Instances are bound to a single display
   * @param {Trail|null} trail - The list of ancestors going back up to our root instance (for the display, or for a cache)
   */ cleanInstance(display, trail) {
        // @public {Display|null}
        this.display = display;
        // @public {Trail|null}
        this.trail = trail;
        // @public {Node|null}
        this.node = trail ? trail.lastNode() : null;
        // @public {Instance|null} - will be set as needed
        this.parent = null;
        // @private {Instance|null} - set when removed from us, so that we can easily reattach it when necessary
        this.oldParent = null;
        // @public {Array.<Instance>} - NOTE: reliance on correct order after syncTree by at least SVGBlock/SVGGroup
        this.children = cleanArray(this.children);
        // @private {Instance|null} - reference to a shared cache instance (different than a child)
        this.sharedCacheInstance = null;
        // initialize/clean sub-components
        this.relativeTransform.initialize(display, trail);
        this.fittability.initialize(display, trail);
        // @private {Array.<Instance>} - Child instances are pushed to here when their node is removed from our node.
        // We don't immediately dispose, since it may be added back.
        this.instanceRemovalCheckList = cleanArray(this.instanceRemovalCheckList);
        // @public {Drawable|null} - Our self-drawable in the drawable tree
        this.selfDrawable = null;
        // @public {Drawable|null} - Our backbone or non-shared cache
        this.groupDrawable = null;
        // @public {Drawable|null} - Our drawable if we are a shared cache
        this.sharedCacheDrawable = null;
        // @private {Drawable} - references into the linked list of drawables (null if nothing is drawable under this)
        this.firstDrawable = null;
        this.lastDrawable = null;
        // @private {Drawable} - references into the linked list of drawables (excludes any group drawables handling)
        this.firstInnerDrawable = null;
        this.lastInnerDrawable = null;
        // @private {Array.<SVGGroup>} - List of SVG groups associated with this display instance
        this.svgGroups = cleanArray(this.svgGroups);
        this.cleanSyncTreeResults();
    }
    /**
   * Initializes or clears properties that are all set as pseudo 'return values' of the syncTree() method. It is the
   * responsibility of the caller of syncTree() to afterwards (optionally read these results and) clear the references
   * using this method to prevent memory leaks.
   * @private
   *
   * TODO: consider a pool of (or a single global) typed return object(s), since setting these values on the instance https://github.com/phetsims/scenery/issues/1581
   * generally means hitting the heap, and can slow us down.
   */ cleanSyncTreeResults() {
        // Tracking bounding indices / drawables for what has changed, so we don't have to over-stitch things.
        // @private {number} - if (not iff) child's index <= beforeStableIndex, it hasn't been added/removed. relevant to
        // current children.
        this.beforeStableIndex = this.children.length;
        // @private {number} - if (not iff) child's index >= afterStableIndex, it hasn't been added/removed. relevant to
        // current children.
        this.afterStableIndex = -1;
        // NOTE: both of these being null indicates "there are no change intervals", otherwise it assumes it points to
        // a linked-list of change intervals. We use {ChangeInterval}s to hold this information, see ChangeInterval to see
        // the individual properties that are considered part of a change interval.
        // @private {ChangeInterval}, first change interval (should have nextChangeInterval linked-list to
        // lastChangeInterval)
        this.firstChangeInterval = null;
        // @private {ChangeInterval}, last change interval
        this.lastChangeInterval = null;
        // @private {boolean} - render state change flags, all set in updateRenderingState()
        this.incompatibleStateChange = false; // Whether we need to recreate the instance tree
        this.groupChanged = false; // Whether we need to force a rebuild of the group drawable
        this.cascadingStateChange = false; // Whether we had a render state change that requires visiting all children
        this.anyStateChange = false; // Whether there was any change of rendering state with the last updateRenderingState()
    }
    /**
   * Updates the rendering state properties, and returns a {boolean} flag of whether it was successful if we were
   * already stateful.
   * @private
   *
   * Rendering state properties determine how we construct the drawable tree from our instance tree (e.g. do we
   * create an SVG or Canvas rectangle, where to place CSS transforms, how to handle opacity, etc.)
   *
   * Instances start out as 'stateless' until updateRenderingState() is called the first time.
   *
   * Node changes that can cause a potential state change (using Node event listeners):
   * - hints
   * - opacity
   * - clipArea
   * - _rendererSummary
   * - _rendererBitmask
   *
   * State changes that can cause cascading state changes in descendants:
   * - isUnderCanvasCache
   * - preferredRenderers
   */ updateRenderingState() {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`updateRenderingState ${this.toString()}${this.stateless ? ' (stateless)' : ''}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`old: ${this.getStateString()}`);
        // old state information, so we can compare what was changed
        const wasBackbone = this.isBackbone;
        const wasTransformed = this.isTransformed;
        const wasVisibilityApplied = this.isVisibilityApplied;
        const wasInstanceCanvasCache = this.isInstanceCanvasCache;
        const wasSharedCanvasCacheSelf = this.isSharedCanvasCacheSelf;
        const wasSharedCanvasCachePlaceholder = this.isSharedCanvasCachePlaceholder;
        const wasUnderCanvasCache = this.isUnderCanvasCache;
        const oldSelfRenderer = this.selfRenderer;
        const oldGroupRenderer = this.groupRenderer;
        const oldSharedCacheRenderer = this.sharedCacheRenderer;
        const oldPreferredRenderers = this.preferredRenderers;
        // default values to set (makes the logic much simpler)
        this.isBackbone = false;
        this.isTransformed = false;
        this.isVisibilityApplied = false;
        this.isInstanceCanvasCache = false;
        this.isSharedCanvasCacheSelf = false;
        this.isSharedCanvasCachePlaceholder = false;
        this.selfRenderer = 0;
        this.groupRenderer = 0;
        this.sharedCacheRenderer = 0;
        const node = this.node;
        this.isUnderCanvasCache = this.isSharedCanvasCacheRoot || (this.parent ? this.parent.isUnderCanvasCache || this.parent.isInstanceCanvasCache || this.parent.isSharedCanvasCacheSelf : false);
        // set up our preferred renderer list (generally based on the parent)
        this.preferredRenderers = this.parent ? this.parent.preferredRenderers : defaultPreferredRenderers;
        // allow the node to modify its preferred renderers (and those of its descendants)
        if (node._renderer) {
            this.preferredRenderers = Renderer.pushOrderBitmask(this.preferredRenderers, node._renderer);
        }
        const hasClip = this.node.hasClipArea();
        const hasFilters = this.node.effectiveOpacity !== 1 || node._usesOpacity || this.node._filters.length > 0;
        // let hasNonDOMFilter = false;
        let hasNonSVGFilter = false;
        let hasNonCanvasFilter = false;
        // let hasNonWebGLFilter = false;
        if (hasFilters) {
            // NOTE: opacity is OK with all of those (currently)
            for(let i = 0; i < this.node._filters.length; i++){
                const filter = this.node._filters[i];
                // TODO: how to handle this, if we split AT the node? https://github.com/phetsims/scenery/issues/1581
                // if ( !filter.isDOMCompatible() ) {
                //   hasNonDOMFilter = true;
                // }
                if (!filter.isSVGCompatible()) {
                    hasNonSVGFilter = true;
                }
                if (!filter.isCanvasCompatible()) {
                    hasNonCanvasFilter = true;
                }
            // if ( !filter.isWebGLCompatible() ) {
            //   hasNonWebGLFilter = true;
            // }
            }
        }
        const requiresSplit = node._cssTransform || node._layerSplit;
        const backboneRequired = this.isDisplayRoot || !this.isUnderCanvasCache && requiresSplit;
        // Support either "all Canvas" or "all SVG" opacity/clip
        const applyTransparencyWithBlock = !backboneRequired && (hasFilters || hasClip) && (!hasNonSVGFilter && this.node._rendererSummary.isSubtreeRenderedExclusivelySVG(this.preferredRenderers) || !hasNonCanvasFilter && this.node._rendererSummary.isSubtreeRenderedExclusivelyCanvas(this.preferredRenderers));
        const useBackbone = applyTransparencyWithBlock ? false : backboneRequired || hasFilters || hasClip;
        // check if we need a backbone or cache
        // if we are under a canvas cache, we will NEVER have a backbone
        // splits are accomplished just by having a backbone
        // NOTE: If changing, check RendererSummary.summaryBitmaskForNodeSelf
        //OHTWO TODO: Update this to properly identify when backbones are necessary/and-or when we forward opacity/clipping https://github.com/phetsims/scenery/issues/1581
        if (useBackbone) {
            this.isBackbone = true;
            this.isVisibilityApplied = true;
            this.isTransformed = this.isDisplayRoot || !!node._cssTransform; // for now, only trigger CSS transform if we have the specific hint
            //OHTWO TODO: check whether the force acceleration hint is being used by our DOMBlock https://github.com/phetsims/scenery/issues/1581
            this.groupRenderer = Renderer.bitmaskDOM; // probably won't be used
        } else if (!applyTransparencyWithBlock && (hasFilters || hasClip || node._canvasCache)) {
            // everything underneath needs to be renderable with Canvas, otherwise we cannot cache
            assert && assert(this.node._rendererSummary.isSingleCanvasSupported(), `Node canvasCache provided, but not all node contents can be rendered with Canvas under ${this.node.constructor.name}`);
            // TODO: node._singleCache hint not defined, always undefined https://github.com/phetsims/scenery/issues/1581
            if (node._singleCache) {
                // TODO: scale options - fixed size, match highest resolution (adaptive), or mipmapped https://github.com/phetsims/scenery/issues/1581
                if (this.isSharedCanvasCacheRoot) {
                    this.isSharedCanvasCacheSelf = true;
                    this.sharedCacheRenderer = this.isWebGLSupported ? Renderer.bitmaskWebGL : Renderer.bitmaskCanvas;
                } else {
                    // everything underneath needs to guarantee that its bounds are valid
                    //OHTWO TODO: We'll probably remove this if we go with the "safe bounds" approach https://github.com/phetsims/scenery/issues/1581
                    assert && assert(this.node._rendererSummary.areBoundsValid(), `Node singleCache provided, but not all node contents have valid bounds under ${this.node.constructor.name}`);
                    this.isSharedCanvasCachePlaceholder = true;
                }
            } else {
                this.isInstanceCanvasCache = true;
                this.isUnderCanvasCache = true;
                this.groupRenderer = this.isWebGLSupported ? Renderer.bitmaskWebGL : Renderer.bitmaskCanvas;
            }
        }
        if (this.node.isPainted()) {
            if (this.isUnderCanvasCache) {
                this.selfRenderer = Renderer.bitmaskCanvas;
            } else {
                let supportedNodeBitmask = this.node._rendererBitmask;
                if (!this.isWebGLSupported) {
                    const invalidBitmasks = Renderer.bitmaskWebGL;
                    supportedNodeBitmask = supportedNodeBitmask ^ supportedNodeBitmask & invalidBitmasks;
                }
                // use the preferred rendering order if specified, otherwise use the default
                this.selfRenderer = supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 0) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 1) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 2) || supportedNodeBitmask & Renderer.bitmaskOrder(this.preferredRenderers, 3) || supportedNodeBitmask & Renderer.bitmaskSVG || supportedNodeBitmask & Renderer.bitmaskCanvas || supportedNodeBitmask & Renderer.bitmaskDOM || supportedNodeBitmask & Renderer.bitmaskWebGL || 0;
                assert && assert(this.selfRenderer, 'setSelfRenderer failure?');
            }
        }
        // whether we need to force rebuilding the group drawable
        this.groupChanged = wasBackbone !== this.isBackbone || wasInstanceCanvasCache !== this.isInstanceCanvasCache || wasSharedCanvasCacheSelf !== this.isSharedCanvasCacheSelf;
        // whether any of our render state changes can change descendant render states
        this.cascadingStateChange = wasUnderCanvasCache !== this.isUnderCanvasCache || oldPreferredRenderers !== this.preferredRenderers;
        /*
     * Whether we can just update the state on an Instance when changing from this state => otherState.
     * This is generally not possible if there is a change in whether the instance should be a transform root
     * (e.g. backbone/single-cache), so we will have to recreate the instance and its subtree if that is the case.
     *
     * Only relevant if we were previously stateful, so it can be ignored if this is our first updateRenderingState()
     */ this.incompatibleStateChange = this.isTransformed !== wasTransformed || this.isSharedCanvasCachePlaceholder !== wasSharedCanvasCachePlaceholder;
        // whether there was any render state change
        this.anyStateChange = this.groupChanged || this.cascadingStateChange || this.incompatibleStateChange || oldSelfRenderer !== this.selfRenderer || oldGroupRenderer !== this.groupRenderer || oldSharedCacheRenderer !== this.sharedCacheRenderer;
        // if our visibility applications changed, update the entire subtree
        if (wasVisibilityApplied !== this.isVisibilityApplied) {
            this.visibilityDirty = true;
            this.parent && this.parent.markChildVisibilityDirty();
        }
        // If our fittability has changed, propagate those changes. (It's generally a hint change which will trigger an
        // update of rendering state).
        this.fittability.checkSelfFittability();
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`new: ${this.getStateString()}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    /**
   * A short string that contains a summary of the rendering state, for debugging/logging purposes.
   * @public
   *
   * @returns {string}
   */ getStateString() {
        const result = `S[ ${this.isDisplayRoot ? 'displayRoot ' : ''}${this.isBackbone ? 'backbone ' : ''}${this.isInstanceCanvasCache ? 'instanceCache ' : ''}${this.isSharedCanvasCachePlaceholder ? 'sharedCachePlaceholder ' : ''}${this.isSharedCanvasCacheSelf ? 'sharedCacheSelf ' : ''}${this.isTransformed ? 'TR ' : ''}${this.isVisibilityApplied ? 'VIS ' : ''}${this.selfRenderer ? this.selfRenderer.toString(16) : '-'},${this.groupRenderer ? this.groupRenderer.toString(16) : '-'},${this.sharedCacheRenderer ? this.sharedCacheRenderer.toString(16) : '-'} `;
        return `${result}]`;
    }
    /**
   * The main entry point for syncTree(), called on the root instance. See syncTree() for more information.
   * @public
   */ baseSyncTree() {
        assert && assert(this.isDisplayRoot, 'baseSyncTree() should only be called on the root instance');
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`-------- START baseSyncTree ${this.toString()} --------`);
        this.syncTree();
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`-------- END baseSyncTree ${this.toString()} --------`);
        this.cleanSyncTreeResults();
    }
    /**
   * Updates the rendering state, synchronizes the instance sub-tree (so that our instance tree matches
   * the Node tree the client provided), and back-propagates {ChangeInterval} information for stitching backbones
   * and/or caches.
   * @private
   *
   * syncTree() also sets a number of pseudo 'return values' (documented in cleanSyncTreeResults()). After calling
   * syncTree() and optionally reading those results, cleanSyncTreeResults() should be called on the same instance
   * in order to prevent memory leaks.
   *
   * @returns {boolean} - Whether the sync was possible. If it wasn't, a new instance subtree will need to be created.
   */ syncTree() {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`syncTree ${this.toString()} ${this.getStateString()}${this.stateless ? ' (stateless)' : ''}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        if (sceneryLog && scenery.isLoggingPerformance()) {
            this.display.perfSyncTreeCount++;
        }
        // may access isTransformed up to root to determine relative trails
        assert && assert(!this.parent || !this.parent.stateless, 'We should not have a stateless parent instance');
        const wasStateless = this.stateless;
        if (wasStateless || this.parent && this.parent.cascadingStateChange || // if our parent had cascading state changes, we need to recompute
        this.renderStateDirtyFrame === this.display._frameId) {
            this.updateRenderingState();
        } else {
            // we can check whether updating state would have made any changes when we skip it (for slow assertions)
            if (assertSlow) {
                this.updateRenderingState();
                assertSlow(!this.anyStateChange);
            }
        }
        if (!wasStateless && this.incompatibleStateChange) {
            sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`incompatible instance ${this.toString()} ${this.getStateString()}, aborting`);
            sceneryLog && sceneryLog.Instance && sceneryLog.pop();
            // The false return will signal that a new instance needs to be used. our tree will be disposed soon.
            return false;
        }
        this.stateless = false;
        // no need to overwrite, should always be the same
        assert && assert(!wasStateless || this.children.length === 0, 'We should not have child instances on an instance without state');
        if (wasStateless) {
            // If we are a transform root, notify the display that we are dirty. We'll be validated when it's at that phase
            // at the next updateDisplay().
            if (this.isTransformed) {
                this.display.markTransformRootDirty(this, true);
            }
            this.attachNodeListeners();
        }
        // TODO: pruning of shared caches https://github.com/phetsims/scenery/issues/1581
        if (this.isSharedCanvasCachePlaceholder) {
            this.sharedSyncTree();
        } else if (wasStateless || this.skipPruningFrame === this.display._frameId || this.anyStateChange) {
            // mark fully-removed instances for disposal, and initialize child instances if we were stateless
            this.prepareChildInstances(wasStateless);
            const oldFirstDrawable = this.firstDrawable;
            const oldLastDrawable = this.lastDrawable;
            const oldFirstInnerDrawable = this.firstInnerDrawable;
            const oldLastInnerDrawable = this.lastInnerDrawable;
            const selfChanged = this.updateSelfDrawable();
            // Synchronizes our children and self, with the drawables and change intervals of both combined
            this.localSyncTree(selfChanged);
            if (assertSlow) {
                // before and after first/last drawables (inside any potential group drawable)
                this.auditChangeIntervals(oldFirstInnerDrawable, oldLastInnerDrawable, this.firstInnerDrawable, this.lastInnerDrawable);
            }
            // If we use a group drawable (backbone, etc.), we'll collapse our drawables and change intervals to reference
            // the group drawable (as applicable).
            this.groupSyncTree(wasStateless);
            if (assertSlow) {
                // before and after first/last drawables (outside of any potential group drawable)
                this.auditChangeIntervals(oldFirstDrawable, oldLastDrawable, this.firstDrawable, this.lastDrawable);
            }
        } else {
            // our sub-tree was not visited, since there were no relevant changes to it (that need instance synchronization
            // or drawable changes)
            sceneryLog && sceneryLog.Instance && sceneryLog.Instance('pruned');
        }
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
        return true;
    }
    /**
   * Responsible for syncing children, connecting the drawable linked list as needed, and outputting change intervals
   * and first/last drawable information.
   * @private
   *
   * @param {boolean} selfChanged
   */ localSyncTree(selfChanged) {
        const frameId = this.display._frameId;
        // local variables, since we can't overwrite our instance properties yet
        let firstDrawable = this.selfDrawable; // possibly null
        let currentDrawable = firstDrawable; // possibly null
        assert && assert(this.firstChangeInterval === null && this.lastChangeInterval === null, 'sanity checks that cleanSyncTreeResults were called');
        let firstChangeInterval = null;
        if (selfChanged) {
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('self');
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
            firstChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
        }
        let currentChangeInterval = firstChangeInterval;
        let lastUnchangedDrawable = selfChanged ? null : this.selfDrawable; // possibly null
        for(let i = 0; i < this.children.length; i++){
            let childInstance = this.children[i];
            const isCompatible = childInstance.syncTree();
            if (!isCompatible) {
                childInstance = this.updateIncompatibleChildInstance(childInstance, i);
                childInstance.syncTree();
            }
            const includeChildDrawables = childInstance.shouldIncludeInParentDrawables();
            //OHTWO TODO: only strip out invisible Canvas drawables, while leaving SVG (since we can more efficiently hide https://github.com/phetsims/scenery/issues/1581
            // SVG trees, memory-wise)
            // here we strip out invisible drawable sections out of the drawable linked list
            if (includeChildDrawables) {
                // if there are any drawables for that child, link them up in our linked list
                if (childInstance.firstDrawable) {
                    if (currentDrawable) {
                        // there is already an end of the linked list, so just append to it
                        Drawable.connectDrawables(currentDrawable, childInstance.firstDrawable, this.display);
                    } else {
                        // start out the linked list
                        firstDrawable = childInstance.firstDrawable;
                    }
                    // update the last drawable of the linked list
                    currentDrawable = childInstance.lastDrawable;
                }
            }
            /*---------------------------------------------------------------------------*
       * Change intervals
       *----------------------------------------------------------------------------*/ sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval(`changes for ${childInstance.toString()} in ${this.toString()}`);
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
            const wasIncluded = childInstance.stitchChangeIncluded;
            const isIncluded = includeChildDrawables;
            childInstance.stitchChangeIncluded = isIncluded;
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval(`included: ${wasIncluded} => ${isIncluded}`);
            // check for forcing full change-interval on child
            if (childInstance.stitchChangeFrame === frameId) {
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('stitchChangeFrame full change interval');
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
                // e.g. it was added, moved, or had visibility changes. requires full change interval
                childInstance.firstChangeInterval = childInstance.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
            } else {
                assert && assert(wasIncluded === isIncluded, 'If we do not have stitchChangeFrame activated, our inclusion should not have changed');
            }
            const firstChildChangeInterval = childInstance.firstChangeInterval;
            let isBeforeOpen = currentChangeInterval && currentChangeInterval.drawableAfter === null;
            const isAfterOpen = firstChildChangeInterval && firstChildChangeInterval.drawableBefore === null;
            const needsBridge = childInstance.stitchChangeBefore === frameId && !isBeforeOpen && !isAfterOpen;
            // We need to insert an additional change interval (bridge) when we notice a link in the drawable linked list
            // where there were nodes that needed stitch changes that aren't still children, or were moved. We create a
            // "bridge" change interval to span the gap where nodes were removed.
            if (needsBridge) {
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.ChangeInterval('bridge');
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.push();
                const bridge = ChangeInterval.newForDisplay(lastUnchangedDrawable, null, this.display);
                if (currentChangeInterval) {
                    currentChangeInterval.nextChangeInterval = bridge;
                }
                currentChangeInterval = bridge;
                firstChangeInterval = firstChangeInterval || currentChangeInterval; // store if it is the first
                isBeforeOpen = true;
                sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
            }
            // Exclude child instances that are now (and were before) not included. NOTE: We still need to include those in
            // bridge calculations, since a removed (before-included) instance could be between two still-invisible
            // instances.
            if (wasIncluded || isIncluded) {
                if (isBeforeOpen) {
                    // we want to try to glue our last ChangeInterval up
                    if (firstChildChangeInterval) {
                        if (firstChildChangeInterval.drawableBefore === null) {
                            // we want to glue from both sides
                            // basically have our current change interval replace the child's first change interval
                            currentChangeInterval.drawableAfter = firstChildChangeInterval.drawableAfter;
                            currentChangeInterval.nextChangeInterval = firstChildChangeInterval.nextChangeInterval;
                            currentChangeInterval = childInstance.lastChangeInterval === firstChildChangeInterval ? currentChangeInterval : childInstance.lastChangeInterval;
                        } else {
                            // only a desire to glue from before
                            currentChangeInterval.drawableAfter = childInstance.firstDrawable; // either null or the correct drawable
                            currentChangeInterval.nextChangeInterval = firstChildChangeInterval;
                            currentChangeInterval = childInstance.lastChangeInterval;
                        }
                    } else {
                        // no changes to the child. grabs the first drawable reference it can
                        currentChangeInterval.drawableAfter = childInstance.firstDrawable; // either null or the correct drawable
                    }
                } else if (firstChildChangeInterval) {
                    firstChangeInterval = firstChangeInterval || firstChildChangeInterval; // store if it is the first
                    if (firstChildChangeInterval.drawableBefore === null) {
                        assert && assert(!currentChangeInterval || lastUnchangedDrawable, 'If we have a current change interval, we should be guaranteed a non-null ' + 'lastUnchangedDrawable');
                        firstChildChangeInterval.drawableBefore = lastUnchangedDrawable; // either null or the correct drawable
                    }
                    if (currentChangeInterval) {
                        currentChangeInterval.nextChangeInterval = firstChildChangeInterval;
                    }
                    currentChangeInterval = childInstance.lastChangeInterval;
                }
                lastUnchangedDrawable = currentChangeInterval && currentChangeInterval.drawableAfter === null ? null : childInstance.lastDrawable ? childInstance.lastDrawable : lastUnchangedDrawable;
            }
            // if the last instance, check for post-bridge
            if (i === this.children.length - 1) {
                if (childInstance.stitchChangeAfter === frameId && !(currentChangeInterval && currentChangeInterval.drawableAfter === null)) {
                    const endingBridge = ChangeInterval.newForDisplay(lastUnchangedDrawable, null, this.display);
                    if (currentChangeInterval) {
                        currentChangeInterval.nextChangeInterval = endingBridge;
                    }
                    currentChangeInterval = endingBridge;
                    firstChangeInterval = firstChangeInterval || currentChangeInterval; // store if it is the first
                }
            }
            // clean up the metadata on our child (can't be done in the child call, since we use these values like a
            // composite return value)
            //OHTWO TODO: only do this on instances that were actually traversed https://github.com/phetsims/scenery/issues/1581
            childInstance.cleanSyncTreeResults();
            sceneryLog && sceneryLog.ChangeInterval && sceneryLog.pop();
        }
        // it's really the easiest way to compare if two things (casted to booleans) are the same?
        assert && assert(!!firstChangeInterval === !!currentChangeInterval, 'Presence of first and current change intervals should be equal');
        // Check to see if we are emptied and marked as changed (but without change intervals). This should imply we have
        // no children (and thus no stitchChangeBefore / stitchChangeAfter to use), so we'll want to create a change
        // interval to cover our entire range.
        if (!firstChangeInterval && this.stitchChangeOnChildren === this.display._frameId && this.children.length === 0) {
            firstChangeInterval = currentChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
        }
        // store our results
        // NOTE: these may get overwritten with the group change intervals (in that case, groupSyncTree will read from these)
        this.firstChangeInterval = firstChangeInterval;
        this.lastChangeInterval = currentChangeInterval;
        // NOTE: these may get overwritten with the group drawable (in that case, groupSyncTree will read from these)
        this.firstDrawable = this.firstInnerDrawable = firstDrawable;
        this.lastDrawable = this.lastInnerDrawable = currentDrawable; // either null, or the drawable itself
        // ensure that our firstDrawable and lastDrawable are correct
        if (assertSlow) {
            let firstDrawableCheck = null;
            for(let j = 0; j < this.children.length; j++){
                if (this.children[j].shouldIncludeInParentDrawables() && this.children[j].firstDrawable) {
                    firstDrawableCheck = this.children[j].firstDrawable;
                    break;
                }
            }
            if (this.selfDrawable) {
                firstDrawableCheck = this.selfDrawable;
            }
            let lastDrawableCheck = this.selfDrawable;
            for(let k = this.children.length - 1; k >= 0; k--){
                if (this.children[k].shouldIncludeInParentDrawables() && this.children[k].lastDrawable) {
                    lastDrawableCheck = this.children[k].lastDrawable;
                    break;
                }
            }
            assertSlow(firstDrawableCheck === this.firstDrawable);
            assertSlow(lastDrawableCheck === this.lastDrawable);
        }
    }
    /**
   * If necessary, create/replace/remove our selfDrawable.
   * @private
   *
   * @returns whether the selfDrawable changed
   */ updateSelfDrawable() {
        if (this.node.isPainted()) {
            const selfRenderer = this.selfRenderer; // our new self renderer bitmask
            // bitwise trick, since only one of Canvas/SVG/DOM/WebGL/etc. flags will be chosen, and bitmaskRendererArea is
            // the mask for those flags. In English, "Is the current selfDrawable compatible with our selfRenderer (if any),
            // or do we need to create a selfDrawable?"
            //OHTWO TODO: For Canvas, we won't care about anything else for the drawable, but for DOM we care about the https://github.com/phetsims/scenery/issues/1581
            // force-acceleration flag! That's stripped out here.
            if (!this.selfDrawable || (this.selfDrawable.renderer & selfRenderer & Renderer.bitmaskRendererArea) === 0) {
                if (this.selfDrawable) {
                    sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing old drawable ${this.selfDrawable.toString()} with new renderer`);
                    // scrap the previous selfDrawable, we need to create one with a different renderer.
                    this.selfDrawable.markForDisposal(this.display);
                }
                this.selfDrawable = Renderer.createSelfDrawable(this, this.node, selfRenderer, this.fittability.ancestorsFittable);
                assert && assert(this.selfDrawable);
                return true;
            }
        } else {
            assert && assert(this.selfDrawable === null, 'Non-painted nodes should not have a selfDrawable');
        }
        return false;
    }
    /**
   * Returns the up-to-date instance.
   * @private
   *
   * @param {Instance} childInstance
   * @param {number} index
   * @returns {Instance}
   */ updateIncompatibleChildInstance(childInstance, index) {
        if (sceneryLog && scenery.isLoggingPerformance()) {
            const affectedInstanceCount = childInstance.getDescendantCount() + 1; // +1 for itself
            if (affectedInstanceCount > 100) {
                sceneryLog.PerfCritical && sceneryLog.PerfCritical(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
            } else if (affectedInstanceCount > 40) {
                sceneryLog.PerfMajor && sceneryLog.PerfMajor(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
            } else if (affectedInstanceCount > 0) {
                sceneryLog.PerfMinor && sceneryLog.PerfMinor(`incompatible instance rebuild at ${this.trail.toPathString()}: ${affectedInstanceCount}`);
            }
        }
        // mark it for disposal
        this.display.markInstanceRootForDisposal(childInstance);
        // swap in a new instance
        const replacementInstance = Instance.createFromPool(this.display, this.trail.copy().addDescendant(childInstance.node, index), false, false);
        this.replaceInstanceWithIndex(childInstance, replacementInstance, index);
        return replacementInstance;
    }
    /**
   * @private
   *
   * @param {boolean} wasStateless
   */ groupSyncTree(wasStateless) {
        const groupRenderer = this.groupRenderer;
        assert && assert((this.isBackbone ? 1 : 0) + (this.isInstanceCanvasCache ? 1 : 0) + (this.isSharedCanvasCacheSelf ? 1 : 0) === (groupRenderer ? 1 : 0), 'We should have precisely one of these flags set for us to have a groupRenderer');
        // if we switched to/away from a group, our group type changed, or our group renderer changed
        const groupChanged = !!groupRenderer !== !!this.groupDrawable || !wasStateless && this.groupChanged || this.groupDrawable && this.groupDrawable.renderer !== groupRenderer;
        // if there is a change, prepare
        if (groupChanged) {
            if (this.groupDrawable) {
                sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing group drawable ${this.groupDrawable.toString()}`);
                this.groupDrawable.markForDisposal(this.display);
                this.groupDrawable = null;
            }
            // change everything, since we may need a full restitch
            this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
        }
        if (groupRenderer) {
            // ensure our linked list is fully disconnected from others
            this.firstDrawable && Drawable.disconnectBefore(this.firstDrawable, this.display);
            this.lastDrawable && Drawable.disconnectAfter(this.lastDrawable, this.display);
            if (this.isBackbone) {
                if (groupChanged) {
                    this.groupDrawable = BackboneDrawable.createFromPool(this.display, this, this.getTransformRootInstance(), groupRenderer, this.isDisplayRoot);
                    if (this.isTransformed) {
                        this.display.markTransformRootDirty(this, true);
                    }
                }
                if (this.firstChangeInterval) {
                    this.groupDrawable.stitch(this.firstDrawable, this.lastDrawable, this.firstChangeInterval, this.lastChangeInterval);
                }
            } else if (this.isInstanceCanvasCache) {
                if (groupChanged) {
                    this.groupDrawable = InlineCanvasCacheDrawable.createFromPool(groupRenderer, this);
                }
                if (this.firstChangeInterval) {
                    this.groupDrawable.stitch(this.firstDrawable, this.lastDrawable, this.firstChangeInterval, this.lastChangeInterval);
                }
            } else if (this.isSharedCanvasCacheSelf) {
                if (groupChanged) {
                    this.groupDrawable = CanvasBlock.createFromPool(groupRenderer, this);
                }
            //OHTWO TODO: restitch here??? implement it https://github.com/phetsims/scenery/issues/1581
            }
            // Update the fittable flag
            this.groupDrawable.setFittable(this.fittability.ancestorsFittable);
            this.firstDrawable = this.lastDrawable = this.groupDrawable;
        }
        // change interval handling
        if (groupChanged) {
            // if our group status changed, mark EVERYTHING as potentially changed
            this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
        } else if (groupRenderer) {
            // our group didn't have to change at all, so we prevent any change intervals
            this.firstChangeInterval = this.lastChangeInterval = null;
        }
    }
    /**
   * @private
   */ sharedSyncTree() {
        //OHTWO TODO: we are probably missing syncTree for shared trees properly with pruning. investigate!! https://github.com/phetsims/scenery/issues/1581
        this.ensureSharedCacheInitialized();
        const sharedCacheRenderer = this.sharedCacheRenderer;
        if (!this.sharedCacheDrawable || this.sharedCacheDrawable.renderer !== sharedCacheRenderer) {
            //OHTWO TODO: mark everything as changed (big change interval) https://github.com/phetsims/scenery/issues/1581
            if (this.sharedCacheDrawable) {
                sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`replacing shared cache drawable ${this.sharedCacheDrawable.toString()}`);
                this.sharedCacheDrawable.markForDisposal(this.display);
            }
            //OHTWO TODO: actually create the proper shared cache drawable depending on the specified renderer https://github.com/phetsims/scenery/issues/1581
            // (update it if necessary)
            this.sharedCacheDrawable = new SharedCanvasCacheDrawable(this.trail, sharedCacheRenderer, this, this.sharedCacheInstance);
            this.firstDrawable = this.sharedCacheDrawable;
            this.lastDrawable = this.sharedCacheDrawable;
            // basically everything changed now, and won't from now on
            this.firstChangeInterval = this.lastChangeInterval = ChangeInterval.newForDisplay(null, null, this.display);
        }
    }
    /**
   * @private
   *
   * @param {boolean} wasStateless
   */ prepareChildInstances(wasStateless) {
        // mark all removed instances to be disposed (along with their subtrees)
        while(this.instanceRemovalCheckList.length){
            const instanceToMark = this.instanceRemovalCheckList.pop();
            if (instanceToMark.addRemoveCounter === -1) {
                instanceToMark.addRemoveCounter = 0; // reset it, so we don't mark it for disposal more than once
                this.display.markInstanceRootForDisposal(instanceToMark);
            }
        }
        if (wasStateless) {
            // we need to create all of the child instances
            for(let k = 0; k < this.node.children.length; k++){
                // create a child instance
                const child = this.node.children[k];
                this.appendInstance(Instance.createFromPool(this.display, this.trail.copy().addDescendant(child, k), false, false));
            }
        }
    }
    /**
   * @private
   */ ensureSharedCacheInitialized() {
        // we only need to initialize this shared cache reference once
        if (!this.sharedCacheInstance) {
            const instanceKey = this.node.getId();
            // TODO: have this abstracted away in the Display? https://github.com/phetsims/scenery/issues/1581
            this.sharedCacheInstance = this.display._sharedCanvasInstances[instanceKey];
            // TODO: increment reference counting? https://github.com/phetsims/scenery/issues/1581
            if (!this.sharedCacheInstance) {
                this.sharedCacheInstance = Instance.createFromPool(this.display, new Trail(this.node), false, true);
                this.sharedCacheInstance.syncTree();
                this.display._sharedCanvasInstances[instanceKey] = this.sharedCacheInstance;
                // TODO: reference counting? https://github.com/phetsims/scenery/issues/1581
                // TODO: this.sharedCacheInstance.isTransformed? https://github.com/phetsims/scenery/issues/1581
                //OHTWO TODO: is this necessary? https://github.com/phetsims/scenery/issues/1581
                this.display.markTransformRootDirty(this.sharedCacheInstance, true);
            }
            this.sharedCacheInstance.externalReferenceCount++;
            //OHTWO TODO: is this necessary? https://github.com/phetsims/scenery/issues/1581
            if (this.isTransformed) {
                this.display.markTransformRootDirty(this, true);
            }
        }
    }
    /**
   * Whether out drawables (from firstDrawable to lastDrawable) should be included in our parent's drawables
   * @private
   *
   * @returns {boolean}
   */ shouldIncludeInParentDrawables() {
        return this.node.isVisible() || !this.node.isExcludeInvisible();
    }
    /**
   * Finds the closest drawable (not including the child instance at childIndex) using lastDrawable, or null
   * @private
   *
   * TODO: check usage? https://github.com/phetsims/scenery/issues/1581
   *
   * @param {number} childIndex
   * @returns {Drawable|null}
   */ findPreviousDrawable(childIndex) {
        for(let i = childIndex - 1; i >= 0; i--){
            const option = this.children[i].lastDrawable;
            if (option !== null) {
                return option;
            }
        }
        return null;
    }
    /**
   * Finds the closest drawable (not including the child instance at childIndex) using nextDrawable, or null
   * @private
   *
   * TODO: check usage? https://github.com/phetsims/scenery/issues/1581
   *
   * @param {number} childIndex
   * @returns {Drawable|null}
   */ findNextDrawable(childIndex) {
        const len = this.children.length;
        for(let i = childIndex + 1; i < len; i++){
            const option = this.children[i].firstDrawable;
            if (option !== null) {
                return option;
            }
        }
        return null;
    }
    /*---------------------------------------------------------------------------*
   * Children handling
   *----------------------------------------------------------------------------*/ /**
   * @private
   *
   * @param {Instance} instance
   */ appendInstance(instance) {
        this.insertInstance(instance, this.children.length);
    }
    /**
   * @private
   *
   * NOTE: different parameter order compared to Node
   *
   * @param {Instance} instance
   * @param {number} index
   */ insertInstance(instance, index) {
        assert && assert(instance instanceof Instance);
        assert && assert(index >= 0 && index <= this.children.length, `Instance insertion bounds check for index ${index} with previous children length ${this.children.length}`);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`inserting ${instance.toString()} into ${this.toString()}`);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();
        // mark it as changed during this frame, so that we can properly set the change interval
        instance.stitchChangeFrame = this.display._frameId;
        this.stitchChangeOnChildren = this.display._frameId;
        this.children.splice(index, 0, instance);
        instance.parent = this;
        instance.oldParent = this;
        // maintain our stitch-change interval
        if (index <= this.beforeStableIndex) {
            this.beforeStableIndex = index - 1;
        }
        if (index > this.afterStableIndex) {
            this.afterStableIndex = index + 1;
        } else {
            this.afterStableIndex++;
        }
        // maintain fittable flags
        this.fittability.onInsert(instance.fittability);
        this.relativeTransform.addInstance(instance);
        this.markChildVisibilityDirty();
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
    }
    /**
   * @private
   *
   * @param {Instance} instance
   */ removeInstance(instance) {
        this.removeInstanceWithIndex(instance, _.indexOf(this.children, instance));
    }
    /**
   * @private
   *
   * @param {Instance} instance
   * @param {number} index
   */ removeInstanceWithIndex(instance, index) {
        assert && assert(instance instanceof Instance);
        assert && assert(index >= 0 && index < this.children.length, `Instance removal bounds check for index ${index} with previous children length ${this.children.length}`);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`removing ${instance.toString()} from ${this.toString()}`);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();
        const frameId = this.display._frameId;
        // mark it as changed during this frame, so that we can properly set the change interval
        instance.stitchChangeFrame = frameId;
        this.stitchChangeOnChildren = frameId;
        // mark neighbors so that we can add a change interval for our removal area
        if (index - 1 >= 0) {
            this.children[index - 1].stitchChangeAfter = frameId;
        }
        if (index + 1 < this.children.length) {
            this.children[index + 1].stitchChangeBefore = frameId;
        }
        this.children.splice(index, 1); // TODO: replace with a 'remove' function call https://github.com/phetsims/scenery/issues/1581
        instance.parent = null;
        instance.oldParent = this;
        // maintain our stitch-change interval
        if (index <= this.beforeStableIndex) {
            this.beforeStableIndex = index - 1;
        }
        if (index >= this.afterStableIndex) {
            this.afterStableIndex = index;
        } else {
            this.afterStableIndex--;
        }
        // maintain fittable flags
        this.fittability.onRemove(instance.fittability);
        this.relativeTransform.removeInstance(instance);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
    }
    /**
   * @private
   *
   * @param {Instance} childInstance
   * @param {Instance} replacementInstance
   * @param {number} index
   */ replaceInstanceWithIndex(childInstance, replacementInstance, index) {
        // TODO: optimization? hopefully it won't happen often, so we just do this for now https://github.com/phetsims/scenery/issues/1581
        this.removeInstanceWithIndex(childInstance, index);
        this.insertInstance(replacementInstance, index);
    }
    /**
   * For handling potential reordering of child instances inclusively between the min and max indices.
   * @private
   *
   * @param {number} minChangeIndex
   * @param {number} maxChangeIndex
   */ reorderInstances(minChangeIndex, maxChangeIndex) {
        assert && assert(typeof minChangeIndex === 'number');
        assert && assert(typeof maxChangeIndex === 'number');
        assert && assert(minChangeIndex <= maxChangeIndex);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.InstanceTree(`Reordering ${this.toString()}`);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.push();
        // NOTE: For implementation, we've basically set parameters as if we removed all of the relevant instances and
        // then added them back in. There may be more efficient ways to do this, but the stitching and change interval
        // process is a bit complicated right now.
        const frameId = this.display._frameId;
        // Remove the old ordering of instances
        this.children.splice(minChangeIndex, maxChangeIndex - minChangeIndex + 1);
        // Add the instances back in the correct order
        for(let i = minChangeIndex; i <= maxChangeIndex; i++){
            const child = this.findChildInstanceOnNode(this.node._children[i]);
            this.children.splice(i, 0, child);
            child.stitchChangeFrame = frameId;
            // mark neighbors so that we can add a change interval for our change area
            if (i > minChangeIndex) {
                child.stitchChangeAfter = frameId;
            }
            if (i < maxChangeIndex) {
                child.stitchChangeBefore = frameId;
            }
        }
        this.stitchChangeOnChildren = frameId;
        this.beforeStableIndex = Math.min(this.beforeStableIndex, minChangeIndex - 1);
        this.afterStableIndex = Math.max(this.afterStableIndex, maxChangeIndex + 1);
        sceneryLog && sceneryLog.InstanceTree && sceneryLog.pop();
    }
    /**
   * If we have a child instance that corresponds to this node, return it (otherwise null).
   * @private
   *
   * @param {Node} node
   * @returns {Instance|null}
   */ findChildInstanceOnNode(node) {
        const instances = node.getInstances();
        for(let i = 0; i < instances.length; i++){
            if (instances[i].oldParent === this) {
                return instances[i];
            }
        }
        return null;
    }
    /**
   * Event callback for Node's 'childInserted' event, used to track children.
   * @private
   *
   * @param {Node} childNode
   * @param {number} index
   */ onChildInserted(childNode, index) {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`inserting child node ${childNode.constructor.name}#${childNode.id} into ${this.toString()}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
        let instance = this.findChildInstanceOnNode(childNode);
        if (instance) {
            sceneryLog && sceneryLog.Instance && sceneryLog.Instance('instance already exists');
            // it must have been added back. increment its counter
            instance.addRemoveCounter += 1;
            assert && assert(instance.addRemoveCounter === 0);
        } else {
            sceneryLog && sceneryLog.Instance && sceneryLog.Instance('creating stub instance');
            sceneryLog && sceneryLog.Instance && sceneryLog.push();
            instance = Instance.createFromPool(this.display, this.trail.copy().addDescendant(childNode, index), false, false);
            sceneryLog && sceneryLog.Instance && sceneryLog.pop();
        }
        this.insertInstance(instance, index);
        // make sure we are visited for syncTree()
        this.markSkipPruning();
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    /**
   * Event callback for Node's 'childRemoved' event, used to track children.
   * @private
   *
   * @param {Node} childNode
   * @param {number} index
   */ onChildRemoved(childNode, index) {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`removing child node ${childNode.constructor.name}#${childNode.id} from ${this.toString()}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
        assert && assert(this.children[index].node === childNode, 'Ensure that our instance matches up');
        const instance = this.findChildInstanceOnNode(childNode);
        assert && assert(instance !== null, 'We should always have a reference to a removed instance');
        instance.addRemoveCounter -= 1;
        assert && assert(instance.addRemoveCounter === -1);
        // track the removed instance here. if it doesn't get added back, this will be the only reference we have (we'll
        // need to dispose it)
        this.instanceRemovalCheckList.push(instance);
        this.removeInstanceWithIndex(instance, index);
        // make sure we are visited for syncTree()
        this.markSkipPruning();
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    /**
   * Event callback for Node's 'childrenReordered' event
   * @private
   *
   * @param {number} minChangeIndex
   * @param {number} maxChangeIndex
   */ onChildrenReordered(minChangeIndex, maxChangeIndex) {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`reordering children for ${this.toString()}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        this.reorderInstances(minChangeIndex, maxChangeIndex);
        // make sure we are visited for syncTree()
        this.markSkipPruning();
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    /**
   * Event callback for Node's 'visibility' event, used to notify about stitch changes.
   * @private
   */ onVisibilityChange() {
        assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
        // for now, just mark which frame we were changed for our change interval
        this.stitchChangeFrame = this.display._frameId;
        // make sure we aren't pruned in the next syncTree()
        this.parent && this.parent.markSkipPruning();
        // mark visibility changes
        this.visibilityDirty = true;
        this.parent && this.parent.markChildVisibilityDirty();
    }
    /**
   * Event callback for Node's 'opacity' change event.
   * @private
   */ onOpacityChange() {
        assert && assert(!this.stateless, 'If we are stateless, we should not receive these notifications');
        this.markRenderStateDirty();
    }
    /**
   * @private
   */ markChildVisibilityDirty() {
        if (!this.childVisibilityDirty) {
            this.childVisibilityDirty = true;
            this.parent && this.parent.markChildVisibilityDirty();
        }
    }
    /**
   * Updates the currently fittability for all of the drawables attached to this instance.
   * @public
   *
   * @param {boolean} fittable
   */ updateDrawableFittability(fittable) {
        this.selfDrawable && this.selfDrawable.setFittable(fittable);
        this.groupDrawable && this.groupDrawable.setFittable(fittable);
    // this.sharedCacheDrawable && this.sharedCacheDrawable.setFittable( fittable );
    }
    /**
   * Updates the visible/relativeVisible flags on the Instance and its entire subtree.
   * @public
   *
   * @param {boolean} parentGloballyVisible - Whether our parent (if any) is globally visible
   * @param {boolean} parentGloballyVoicingVisible - Whether our parent (if any) is globally voicingVisible.
   * @param {boolean} parentRelativelyVisible - Whether our parent (if any) is relatively visible
   * @param {boolean} updateFullSubtree - If true, we will visit the entire subtree to ensure visibility is correct.
   */ updateVisibility(parentGloballyVisible, parentGloballyVoicingVisible, parentRelativelyVisible, updateFullSubtree) {
        // If our visibility flag for ourself is dirty, we need to update our entire subtree
        if (this.visibilityDirty) {
            updateFullSubtree = true;
        }
        // calculate our visibilities
        const nodeVisible = this.node.isVisible();
        const wasVisible = this.visible;
        const wasRelativeVisible = this.relativeVisible;
        const wasSelfVisible = this.selfVisible;
        const nodeVoicingVisible = this.node.voicingVisibleProperty.value;
        const wasVoicingVisible = this.voicingVisible;
        const couldVoice = wasVisible && wasVoicingVisible;
        this.visible = parentGloballyVisible && nodeVisible;
        this.voicingVisible = parentGloballyVoicingVisible && nodeVoicingVisible;
        this.relativeVisible = parentRelativelyVisible && nodeVisible;
        this.selfVisible = this.isVisibilityApplied ? true : this.relativeVisible;
        const len = this.children.length;
        for(let i = 0; i < len; i++){
            const child = this.children[i];
            if (updateFullSubtree || child.visibilityDirty || child.childVisibilityDirty) {
                // if we are a visibility root (isVisibilityApplied===true), disregard ancestor visibility
                child.updateVisibility(this.visible, this.voicingVisible, this.isVisibilityApplied ? true : this.relativeVisible, updateFullSubtree);
            }
        }
        this.visibilityDirty = false;
        this.childVisibilityDirty = false;
        // trigger changes after we do the full visibility update
        if (this.visible !== wasVisible) {
            this.visibleEmitter.emit();
        }
        if (this.relativeVisible !== wasRelativeVisible) {
            this.relativeVisibleEmitter.emit();
        }
        if (this.selfVisible !== wasSelfVisible) {
            this.selfVisibleEmitter.emit();
        }
        // An Instance can voice when it is globally visible and voicingVisible. Notify when this state has changed
        // based on these dependencies.
        const canVoice = this.voicingVisible && this.visible;
        if (canVoice !== couldVoice) {
            this.canVoiceEmitter.emit(canVoice);
        }
    }
    /**
   * @private
   *
   * @returns {number}
   */ getDescendantCount() {
        let count = this.children.length;
        for(let i = 0; i < this.children.length; i++){
            count += this.children[i].getDescendantCount();
        }
        return count;
    }
    /*---------------------------------------------------------------------------*
   * Miscellaneous
   *----------------------------------------------------------------------------*/ /**
   * Add a reference for an SVG group (fastest way to track them)
   * @public
   *
   * @param {SVGGroup} group
   */ addSVGGroup(group) {
        this.svgGroups.push(group);
    }
    /**
   * Remove a reference for an SVG group (fastest way to track them)
   * @public
   *
   * @param {SVGGroup} group
   */ removeSVGGroup(group) {
        arrayRemove(this.svgGroups, group);
    }
    /**
   * Returns null when a lookup fails (which is legitimate)
   * @public
   *
   * @param {SVGBlock} block
   * @returns {SVGGroup|null}
   */ lookupSVGGroup(block) {
        const len = this.svgGroups.length;
        for(let i = 0; i < len; i++){
            const group = this.svgGroups[i];
            if (group.block === block) {
                return group;
            }
        }
        return null;
    }
    /**
   * What instance have filters (opacity/visibility/clip) been applied up to?
   * @public
   *
   * @returns {Instance}
   */ getFilterRootInstance() {
        if (this.isBackbone || this.isInstanceCanvasCache || !this.parent) {
            return this;
        } else {
            return this.parent.getFilterRootInstance();
        }
    }
    /**
   * What instance transforms have been applied up to?
   * @public
   *
   * @returns {Instance}
   */ getTransformRootInstance() {
        if (this.isTransformed || !this.parent) {
            return this;
        } else {
            return this.parent.getTransformRootInstance();
        }
    }
    /**
   * @public
   *
   * @returns {Instance}
   */ getVisibilityRootInstance() {
        if (this.isVisibilityApplied || !this.parent) {
            return this;
        } else {
            return this.parent.getVisibilityRootInstance();
        }
    }
    /**
   * @private
   */ attachNodeListeners() {
        // attach listeners to our node
        this.relativeTransform.attachNodeListeners();
        if (!this.isSharedCanvasCachePlaceholder) {
            this.node.childInsertedEmitter.addListener(this.childInsertedListener);
            this.node.childRemovedEmitter.addListener(this.childRemovedListener);
            this.node.childrenReorderedEmitter.addListener(this.childrenReorderedListener);
            this.node.visibleProperty.lazyLink(this.visibilityListener);
            // Marks all visibility dirty when voicingVisible changes to cause necessary updates for voicingVisible
            this.node.voicingVisibleProperty.lazyLink(this.visibilityListener);
            this.node.filterChangeEmitter.addListener(this.markRenderStateDirtyListener);
            this.node.clipAreaProperty.lazyLink(this.markRenderStateDirtyListener);
            this.node.instanceRefreshEmitter.addListener(this.markRenderStateDirtyListener);
        }
    }
    /**
   * @private
   */ detachNodeListeners() {
        this.relativeTransform.detachNodeListeners();
        if (!this.isSharedCanvasCachePlaceholder) {
            this.node.childInsertedEmitter.removeListener(this.childInsertedListener);
            this.node.childRemovedEmitter.removeListener(this.childRemovedListener);
            this.node.childrenReorderedEmitter.removeListener(this.childrenReorderedListener);
            this.node.visibleProperty.unlink(this.visibilityListener);
            this.node.voicingVisibleProperty.unlink(this.visibilityListener);
            this.node.filterChangeEmitter.removeListener(this.markRenderStateDirtyListener);
            this.node.clipAreaProperty.unlink(this.markRenderStateDirtyListener);
            this.node.instanceRefreshEmitter.removeListener(this.markRenderStateDirtyListener);
        }
    }
    /**
   * Ensure that the render state is updated in the next syncTree()
   * @private
   */ markRenderStateDirty() {
        this.renderStateDirtyFrame = this.display._frameId;
        // ensure we aren't pruned (not set on this instance, since we may not need to visit our children)
        this.parent && this.parent.markSkipPruning();
    }
    /**
   * Ensure that this instance and its children will be visited in the next syncTree()
   * @private
   */ markSkipPruning() {
        this.skipPruningFrame = this.display._frameId;
        // walk it up to the root
        this.parent && this.parent.markSkipPruning();
    }
    /**
   * @public
   *
   * NOTE: used in CanvasBlock internals, performance-critical.
   *
   * @param {Instance} instance
   * @returns {number}
   */ getBranchIndexTo(instance) {
        const cachedValue = this.branchIndexMap[instance.id];
        if (cachedValue !== undefined) {
            return cachedValue;
        }
        const branchIndex = this.trail.getBranchIndexTo(instance.trail);
        this.branchIndexMap[instance.id] = branchIndex;
        instance.branchIndexMap[this.id] = branchIndex;
        this.branchIndexReferences.push(instance);
        instance.branchIndexReferences.push(this);
        return branchIndex;
    }
    /**
   * Clean up listeners and garbage, so that we can be recycled (or pooled)
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.Instance && sceneryLog.Instance(`dispose ${this.toString()}`);
        sceneryLog && sceneryLog.Instance && sceneryLog.push();
        assert && assert(this.active, 'Seems like we tried to dispose this Instance twice, it is not active');
        this.active = false;
        // Remove the bidirectional branch index reference data from this instance and any referenced instances.
        while(this.branchIndexReferences.length){
            const referenceInstance = this.branchIndexReferences.pop();
            delete this.branchIndexMap[referenceInstance.id];
            delete referenceInstance.branchIndexMap[this.id];
            arrayRemove(referenceInstance.branchIndexReferences, this);
        }
        // order is somewhat important
        this.groupDrawable && this.groupDrawable.disposeImmediately(this.display);
        this.sharedCacheDrawable && this.sharedCacheDrawable.disposeImmediately(this.display);
        this.selfDrawable && this.selfDrawable.disposeImmediately(this.display);
        // Dispose the rest of our subtree
        const numChildren = this.children.length;
        for(let i = 0; i < numChildren; i++){
            this.children[i].dispose();
        }
        // Check for child instances that were removed (we are still responsible for disposing them, since we didn't get
        // synctree to happen for them).
        while(this.instanceRemovalCheckList.length){
            const child = this.instanceRemovalCheckList.pop();
            // they could have already been disposed, so we need a guard here
            if (child.active) {
                child.dispose();
            }
        }
        // we don't originally add in the listener if we are stateless
        if (!this.stateless) {
            this.detachNodeListeners();
        }
        this.node.removeInstance(this);
        // release our reference to a shared cache if applicable, and dispose if there are no other references
        if (this.sharedCacheInstance) {
            this.sharedCacheInstance.externalReferenceCount--;
            if (this.sharedCacheInstance.externalReferenceCount === 0) {
                delete this.display._sharedCanvasInstances[this.node.getId()];
                this.sharedCacheInstance.dispose();
            }
        }
        // clean our variables out to release memory
        this.cleanInstance(null, null);
        this.visibleEmitter.removeAllListeners();
        this.relativeVisibleEmitter.removeAllListeners();
        this.selfVisibleEmitter.removeAllListeners();
        this.canVoiceEmitter.removeAllListeners();
        this.freeToPool();
        sceneryLog && sceneryLog.Instance && sceneryLog.pop();
    }
    /**
   * @public
   *
   * @param {number} frameId
   * @param {boolean} allowValidationNotNeededChecks
   */ audit(frameId, allowValidationNotNeededChecks) {
        if (assertSlow) {
            if (frameId === undefined) {
                frameId = this.display._frameId;
            }
            assertSlow(!this.stateless, 'State is required for all display instances');
            assertSlow(this.firstDrawable === null === (this.lastDrawable === null), 'First/last drawables need to both be null or non-null');
            assertSlow(!this.isBackbone && !this.isSharedCanvasCachePlaceholder || this.groupDrawable, 'If we are a backbone or shared cache, we need to have a groupDrawable reference');
            assertSlow(!this.isSharedCanvasCachePlaceholder || !this.node.isPainted() || this.selfDrawable, 'We need to have a selfDrawable if we are painted and not a shared cache');
            assertSlow(!this.isTransformed && !this.isCanvasCache || this.groupDrawable, 'We need to have a groupDrawable if we are a backbone or any type of canvas cache');
            assertSlow(!this.isSharedCanvasCachePlaceholder || this.sharedCacheDrawable, 'We need to have a sharedCacheDrawable if we are a shared cache');
            assertSlow(this.addRemoveCounter === 0, 'Our addRemoveCounter should always be 0 at the end of syncTree');
            // validate the subtree
            for(let i = 0; i < this.children.length; i++){
                const childInstance = this.children[i];
                childInstance.audit(frameId, allowValidationNotNeededChecks);
            }
            this.relativeTransform.audit(frameId, allowValidationNotNeededChecks);
            this.fittability.audit();
        }
    }
    /**
   * Applies checks to make sure our visibility tracking is working as expected.
   * @public
   *
   * @param {boolean} parentVisible
   */ auditVisibility(parentVisible) {
        if (assertSlow) {
            const visible = parentVisible && this.node.isVisible();
            const trailVisible = this.trail.isVisible();
            assertSlow(visible === trailVisible, 'Trail visibility failure');
            assertSlow(visible === this.visible, 'Visible flag failure');
            assertSlow(this.voicingVisible === _.reduce(this.trail.nodes, (value, node)=>value && node.voicingVisibleProperty.value, true), 'When this Instance is voicingVisible: true, all Trail Nodes must also be voicingVisible: true');
            // validate the subtree
            for(let i = 0; i < this.children.length; i++){
                const childInstance = this.children[i];
                childInstance.auditVisibility(visible);
            }
        }
    }
    /**
   * @private
   *
   * @param {Drawable|null} oldFirstDrawable
   * @param {Drawable|null} oldLastDrawable
   * @param {Drawable|null} newFirstDrawable
   * @param {Drawable|null} newLastDrawable
   */ auditChangeIntervals(oldFirstDrawable, oldLastDrawable, newFirstDrawable, newLastDrawable) {
        if (oldFirstDrawable) {
            let oldOne = oldFirstDrawable;
            // should hit, or will have NPE
            while(oldOne !== oldLastDrawable){
                oldOne = oldOne.oldNextDrawable;
            }
        }
        if (newFirstDrawable) {
            let newOne = newFirstDrawable;
            // should hit, or will have NPE
            while(newOne !== newLastDrawable){
                newOne = newOne.nextDrawable;
            }
        }
        function checkBetween(a, b) {
            // have the body of the function stripped (it's not inside the if statement due to JSHint)
            if (assertSlow) {
                assertSlow(a !== null);
                assertSlow(b !== null);
                while(a !== b){
                    assertSlow(a.nextDrawable === a.oldNextDrawable, 'Change interval mismatch');
                    a = a.nextDrawable;
                }
            }
        }
        if (assertSlow) {
            const firstChangeInterval = this.firstChangeInterval;
            const lastChangeInterval = this.lastChangeInterval;
            if (!firstChangeInterval || firstChangeInterval.drawableBefore !== null) {
                assertSlow(oldFirstDrawable === newFirstDrawable, 'If we have no changes, or our first change interval is not open, our firsts should be the same');
            }
            if (!lastChangeInterval || lastChangeInterval.drawableAfter !== null) {
                assertSlow(oldLastDrawable === newLastDrawable, 'If we have no changes, or our last change interval is not open, our lasts should be the same');
            }
            if (!firstChangeInterval) {
                assertSlow(!lastChangeInterval, 'We should not be missing only one change interval');
                // with no changes, everything should be identical
                oldFirstDrawable && checkBetween(oldFirstDrawable, oldLastDrawable);
            } else {
                assertSlow(lastChangeInterval, 'We should not be missing only one change interval');
                // endpoints
                if (firstChangeInterval.drawableBefore !== null) {
                    // check to the start if applicable
                    checkBetween(oldFirstDrawable, firstChangeInterval.drawableBefore);
                }
                if (lastChangeInterval.drawableAfter !== null) {
                    // check to the end if applicable
                    checkBetween(lastChangeInterval.drawableAfter, oldLastDrawable);
                }
                // between change intervals (should always be guaranteed to be fixed)
                let interval = firstChangeInterval;
                while(interval && interval.nextChangeInterval){
                    const nextInterval = interval.nextChangeInterval;
                    assertSlow(interval.drawableAfter !== null);
                    assertSlow(nextInterval.drawableBefore !== null);
                    checkBetween(interval.drawableAfter, nextInterval.drawableBefore);
                    interval = nextInterval;
                }
            }
        }
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `${this.id}#${this.node ? `${this.node.constructor.name ? this.node.constructor.name : '?'}#${this.node.id}` : '-'}`;
    }
    /**
   * @mixes Poolable
   *
   * See initialize() for documentation
   *
   * @param {Display} display
   * @param {Trail} trail
   * @param {boolean} isDisplayRoot
   * @param {boolean} isSharedCanvasCacheRoot
   */ constructor(display, trail, isDisplayRoot, isSharedCanvasCacheRoot){
        /**
   * @public
   * @type {Display|null}
   */ this.display = null;
        // @private {boolean}
        this.active = false;
        this.initialize(display, trail, isDisplayRoot, isSharedCanvasCacheRoot);
    }
};
scenery.register('Instance', Instance);
// object pooling
Poolable.mixInto(Instance);
export default Instance;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9JbnN0YW5jZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBpbnN0YW5jZSB0aGF0IGlzIHNwZWNpZmljIHRvIHRoZSBkaXNwbGF5IChub3QgbmVjZXNzYXJpbHkgYSBnbG9iYWwgaW5zdGFuY2UsIGNvdWxkIGJlIGluIGEgQ2FudmFzIGNhY2hlLCBldGMpLFxuICogdGhhdCBpcyBuZWVkZWQgdG8gdHJhY2tpbmcgaW5zdGFuY2Utc3BlY2lmaWMgZGlzcGxheSBpbmZvcm1hdGlvbiwgYW5kIHNpZ25hbHMgdG8gdGhlIGRpc3BsYXkgc3lzdGVtIHdoZW4gb3RoZXJcbiAqIGNoYW5nZXMgYXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBJbnN0YW5jZXMgZ2VuZXJhbGx5IGZvcm0gYSB0cnVlIHRyZWUsIGFzIG9wcG9zZWQgdG8gdGhlIERBRyBvZiBub2Rlcy4gVGhlIG9uZSBleGNlcHRpb24gaXMgZm9yIHNoYXJlZCBDYW52YXMgY2FjaGVzLFxuICogd2hlcmUgbXVsdGlwbGUgaW5zdGFuY2VzIGNhbiBwb2ludCB0byBvbmUgZ2xvYmFsbHktc3RvcmVkIChzaGFyZWQpIGNhY2hlIGluc3RhbmNlLlxuICpcbiAqIEFuIEluc3RhbmNlIGlzIHBvb2xlZCwgYnV0IHdoZW4gY29uc3RydWN0ZWQgd2lsbCBub3QgYXV0b21hdGljYWxseSBjcmVhdGUgY2hpbGRyZW4sIGRyYXdhYmxlcywgZXRjLlxuICogc3luY1RyZWUoKSBpcyByZXNwb25zaWJsZSBmb3Igc3luY2hyb25pemluZyB0aGUgaW5zdGFuY2UgaXRzZWxmIGFuZCBpdHMgZW50aXJlIHN1YnRyZWUuXG4gKlxuICogSW5zdGFuY2VzIGFyZSBjcmVhdGVkIGFzICdzdGF0ZWxlc3MnIGluc3RhbmNlcywgYnV0IGR1cmluZyBzeW5jVHJlZSB0aGUgcmVuZGVyaW5nIHN0YXRlIChwcm9wZXJ0aWVzIHRvIGRldGVybWluZVxuICogaG93IHRvIGNvbnN0cnVjdCB0aGUgZHJhd2FibGUgdHJlZSBmb3IgdGhpcyBpbnN0YW5jZSBhbmQgaXRzIHN1YnRyZWUpIGFyZSBzZXQuXG4gKlxuICogV2hpbGUgSW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkICdzdGF0ZWZ1bCcsIHRoZXkgd2lsbCBoYXZlIGxpc3RlbmVycyBhZGRlZCB0byB0aGVpciBOb2RlIHdoaWNoIHJlY29yZHMgYWN0aW9ucyB0YWtlblxuICogaW4tYmV0d2VlbiBEaXNwbGF5LnVwZGF0ZURpc3BsYXkoKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IEJhY2tib25lRHJhd2FibGUsIENhbnZhc0Jsb2NrLCBDaGFuZ2VJbnRlcnZhbCwgRHJhd2FibGUsIEZpdHRhYmlsaXR5LCBJbmxpbmVDYW52YXNDYWNoZURyYXdhYmxlLCBSZWxhdGl2ZVRyYW5zZm9ybSwgUmVuZGVyZXIsIHNjZW5lcnksIFNoYXJlZENhbnZhc0NhY2hlRHJhd2FibGUsIFRyYWlsLCBVdGlscyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUaGlzIGZpeGVzIGhvdyBUeXBlc2NyaXB0IHJlY29nbml6ZXMgdGhlIFwiRGlzcGxheVwiIHR5cGUsIHVzZWQgdGhpcyBwYXR0ZXJuIGluIGphdmFzY3JpcHQgZmlsZXMgd2UgY2FuJ3QgY29udmVydCB0b1xuLy8gVHlwZVNjcmlwdCByaWdodCBub3cuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ltcG9ydHMnKS5EaXNwbGF5fSBEaXNwbGF5XG4gKi9cblxubGV0IGdsb2JhbElkQ291bnRlciA9IDE7XG5cbi8vIHByZWZlcmVuY2VzIHRvcCB0byBib3R0b20gaW4gZ2VuZXJhbFxuY29uc3QgZGVmYXVsdFByZWZlcnJlZFJlbmRlcmVycyA9IFJlbmRlcmVyLmNyZWF0ZU9yZGVyQml0bWFzayhcbiAgUmVuZGVyZXIuYml0bWFza1NWRyxcbiAgUmVuZGVyZXIuYml0bWFza0NhbnZhcyxcbiAgUmVuZGVyZXIuYml0bWFza0RPTSxcbiAgUmVuZGVyZXIuYml0bWFza1dlYkdMXG4pO1xuXG5jbGFzcyBJbnN0YW5jZSB7XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQHR5cGUge0Rpc3BsYXl8bnVsbH1cbiAgICovXG4gIGRpc3BsYXkgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBAbWl4ZXMgUG9vbGFibGVcbiAgICpcbiAgICogU2VlIGluaXRpYWxpemUoKSBmb3IgZG9jdW1lbnRhdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtUcmFpbH0gdHJhaWxcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0Rpc3BsYXlSb290XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNTaGFyZWRDYW52YXNDYWNoZVJvb3RcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBkaXNwbGF5LCB0cmFpbCwgaXNEaXNwbGF5Um9vdCwgaXNTaGFyZWRDYW52YXNDYWNoZVJvb3QgKSB7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5pbml0aWFsaXplKCBkaXNwbGF5LCB0cmFpbCwgaXNEaXNwbGF5Um9vdCwgaXNTaGFyZWRDYW52YXNDYWNoZVJvb3QgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheSAtIEluc3RhbmNlcyBhcmUgYm91bmQgdG8gYSBzaW5nbGUgZGlzcGxheVxuICAgKiBAcGFyYW0ge1RyYWlsfSB0cmFpbCAtIFRoZSBsaXN0IG9mIGFuY2VzdG9ycyBnb2luZyBiYWNrIHVwIHRvIG91ciByb290IGluc3RhbmNlIChmb3IgdGhlIGRpc3BsYXksIG9yIGZvciBhIGNhY2hlKVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRGlzcGxheVJvb3QgLSBXaGV0aGVyIG91ciBpbnN0YW5jZSBpcyBmb3IgdGhlIHJvb3Qgbm9kZSBwcm92aWRlZCB0byB0aGUgRGlzcGxheS5cbiAgICogQHBhcmFtIHtib29sZWFufSBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCAtIFdoZXRoZXIgb3VyIGluc3RhbmNlIGlzIHRoZSByb290IGZvciBhIHNoYXJlZCBDYW52YXMgY2FjaGUgKHdoaWNoIGNhblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgdXNlZCBtdWx0aXBsZSBwbGFjZXMgaW4gdGhlIG1haW4gaW5zdGFuY2UgdHJlZSlcbiAgICovXG4gIGluaXRpYWxpemUoIGRpc3BsYXksIHRyYWlsLCBpc0Rpc3BsYXlSb290LCBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5hY3RpdmUsXG4gICAgICAnV2Ugc2hvdWxkIG5ldmVyIHRyeSB0byBpbml0aWFsaXplIGFuIGFscmVhZHkgYWN0aXZlIG9iamVjdCcgKTtcblxuICAgIC8vIHByZXZlbnQgdGhlIHRyYWlsIHBhc3NlZCBpbiBmcm9tIGJlaW5nIG11dGF0ZWQgYWZ0ZXIgdGhpcyBwb2ludCAod2Ugd2FudCBhIGNvbnNpc3RlbnQgdHJhaWwpXG4gICAgdHJhaWwuc2V0SW1tdXRhYmxlKCk7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XG4gICAgdGhpcy5pZCA9IHRoaXMuaWQgfHwgZ2xvYmFsSWRDb3VudGVyKys7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufVxuICAgIHRoaXMuaXNXZWJHTFN1cHBvcnRlZCA9IGRpc3BsYXkuaXNXZWJHTEFsbG93ZWQoKSAmJiBVdGlscy5pc1dlYkdMU3VwcG9ydGVkO1xuXG4gICAgLy8gQHB1YmxpYyB7UmVsYXRpdmVUcmFuc2Zvcm19IC0gcHJvdmlkZXMgaGlnaC1wZXJmb3JtYW5jZSBhY2Nlc3MgdG8gJ3JlbGF0aXZlJyB0cmFuc2Zvcm1zIChmcm9tIG91ciBuZWFyZXN0XG4gICAgLy8gdHJhbnNmb3JtIHJvb3QpLCBhbmQgYWxsb3dzIGZvciBsaXN0ZW5pbmcgdG8gd2hlbiBvdXIgcmVsYXRpdmUgdHJhbnNmb3JtIGNoYW5nZXMgKGNhbGxlZCBkdXJpbmcgYSBwaGFzZSBvZlxuICAgIC8vIERpc3BsYXkudXBkYXRlRGlzcGxheSgpKS5cbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtID0gKCB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtIHx8IG5ldyBSZWxhdGl2ZVRyYW5zZm9ybSggdGhpcyApICk7XG5cbiAgICAvLyBAcHVibGljIHtGaXR0YWJpbGl0eX0gLSBwcm92aWRlcyBsb2dpYyBmb3Igd2hldGhlciBvdXIgZHJhd2FibGVzIChvciBjb21tb24tZml0IGFuY2VzdG9ycykgd2lsbCBzdXBwb3J0IGZpdHRpbmdcbiAgICAvLyBmb3IgRml0dGVkQmxvY2sgc3VidHlwZXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNDA2LlxuICAgIHRoaXMuZml0dGFiaWxpdHkgPSAoIHRoaXMuZml0dGFiaWxpdHkgfHwgbmV3IEZpdHRhYmlsaXR5KCB0aGlzICkgKTtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gVHJhY2tpbmcgb2YgdmlzaWJpbGl0eSB7Ym9vbGVhbn0gYW5kIGFzc29jaWF0ZWQgYm9vbGVhbiBmbGFncy5cbiAgICB0aGlzLnZpc2libGUgPSB0cnVlOyAvLyBnbG9iYWwgdmlzaWJpbGl0eSAod2hldGhlciB0aGlzIGluc3RhbmNlIHdpbGwgZW5kIHVwIGFwcGVhcmluZyBvbiB0aGUgZGlzcGxheSlcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZSA9IHRydWU7IC8vIHJlbGF0aXZlIHZpc2liaWxpdHkgKGlnbm9yZXMgdGhlIGNsb3Nlc3QgYW5jZXN0cmFsIHZpc2liaWxpdHkgcm9vdCBhbmQgYmVsb3cpXG4gICAgdGhpcy5zZWxmVmlzaWJsZSA9IHRydWU7IC8vIGxpa2UgcmVsYXRpdmUgdmlzaWJpbGl0eSwgYnV0IGlzIGFsd2F5cyB0cnVlIGlmIHdlIGFyZSBhIHZpc2liaWxpdHkgcm9vdFxuICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gdHJ1ZTsgLy8gZW50aXJlIHN1YnRyZWUgb2YgdmlzaWJpbGl0eSB3aWxsIG5lZWQgdG8gYmUgdXBkYXRlZFxuICAgIHRoaXMuY2hpbGRWaXNpYmlsaXR5RGlydHkgPSB0cnVlOyAvLyBhbiBhbmNlc3RvciBuZWVkcyBpdHMgdmlzaWJpbGl0eSB1cGRhdGVkXG4gICAgdGhpcy52b2ljaW5nVmlzaWJsZSA9IHRydWU7IC8vIHdoZXRoZXIgdGhpcyBpbnN0YW5jZSBpcyBcInZpc2libGVcIiBmb3IgVm9pY2luZyBhbmQgYWxsb3dzIHNwZWVjaCB3aXRoIHRoYXQgZmVhdHVyZVxuXG4gICAgLy8gQHByaXZhdGUge09iamVjdC48aW5zdGFuY2VJZDpudW1iZXIsbnVtYmVyPn0gLSBNYXBzIGFub3RoZXIgaW5zdGFuY2UncyBgaW5zdGFuY2UuaWRgIHtudW1iZXJ9ID0+IGJyYW5jaCBpbmRleFxuICAgIC8vIHtudW1iZXJ9IChmaXJzdCBpbmRleCB3aGVyZSB0aGUgdHdvIHRyYWlscyBhcmUgZGlmZmVyZW50KS4gVGhpcyBlZmZlY3RpdmVseSBvcGVyYXRlcyBhcyBhIGNhY2hlIChzaW5jZSBpdCdzIG1vcmVcbiAgICAvLyBleHBlbnNpdmUgdG8gY29tcHV0ZSB0aGUgdmFsdWUgdGhhbiBpdCBpcyB0byBsb29rIHVwIHRoZSB2YWx1ZSkuXG4gICAgLy8gSXQgaXMgYWxzbyBcImJpZGlyZWN0aW9uYWxcIiwgc3VjaCB0aGF0IGlmIHdlIGFkZCBpbnN0YW5jZSBBJ3MgYnJhbmNoIGluZGV4IHRvIHRoaXMgbWFwLCB3ZSB3aWxsIGFsc28gYWRkIHRoZVxuICAgIC8vIHNhbWUgdmFsdWUgdG8gaW5zdGFuY2UgQSdzIG1hcCAocmVmZXJlbmNpbmcgdGhpcyBpbnN0YW5jZSkuIEluIG9yZGVyIHRvIGNsZWFuIHVwIGFuZCBwcmV2ZW50IGxlYWtzLCB0aGVcbiAgICAvLyBpbnN0YW5jZSByZWZlcmVuY2VzIGFyZSBwcm92aWRlZCBpbiB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcyAob24gYm90aCBlbmRzKSwgc28gdGhhdCB3aGVuIG9uZSBpbnN0YW5jZSBpc1xuICAgIC8vIGRpc3Bvc2VkIGl0IGNhbiByZW1vdmUgdGhlIHJlZmVyZW5jZXMgYmlkaXJlY3Rpb25hbGx5LlxuICAgIHRoaXMuYnJhbmNoSW5kZXhNYXAgPSB0aGlzLmJyYW5jaEluZGV4TWFwIHx8IHt9O1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEluc3RhbmNlPn0gLSBBbGwgaW5zdGFuY2VzIHdoZXJlIHdlIGhhdmUgZW50cmllcyBpbiBvdXIgbWFwLiBTZWUgZG9jcyBmb3IgYnJhbmNoSW5kZXhNYXAuXG4gICAgdGhpcy5icmFuY2hJbmRleFJlZmVyZW5jZXMgPSBjbGVhbkFycmF5KCB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcyApO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBJbiB0aGUgcmFuZ2UgKC0xLDApLCB0byBoZWxwIHVzIHRyYWNrIGluc2VydGlvbnMgYW5kIHJlbW92YWxzIG9mIHRoaXMgaW5zdGFuY2UncyBub2RlIHRvIGl0c1xuICAgIC8vIHBhcmVudCAoZGlkIHdlIGdldCByZW1vdmVkIGJ1dCBhZGRlZCBiYWNrPykuXG4gICAgLy8gSWYgaXQncyAtMSBhdCBpdHMgcGFyZW50J3Mgc3luY1RyZWUsIHdlJ2xsIGVuZCB1cCByZW1vdmluZyBvdXIgcmVmZXJlbmNlIHRvIGl0LlxuICAgIC8vIFdlIHVzZSBhbiBpbnRlZ2VyIGp1c3QgZm9yIHNhbml0eSBjaGVja3MgKGlmIGl0IGV2ZXIgcmVhY2hlcyAtMiBvciAxLCB3ZSd2ZSByZWFjaGVkIGFuIGludmFsaWQgc3RhdGUpXG4gICAgdGhpcy5hZGRSZW1vdmVDb3VudGVyID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gSWYgZXF1YWwgdG8gdGhlIGN1cnJlbnQgZnJhbWUgSUQgKGl0IGlzIGluaXRpYWxpemVkIGFzIHN1Y2gpLCB0aGVuIGl0IGlzIHRyZWF0ZWQgZHVyaW5nIHRoZVxuICAgIC8vIGNoYW5nZSBpbnRlcnZhbCB3YXRlcmZhbGwgYXMgXCJjb21wbGV0ZWx5IGNoYW5nZWRcIiwgYW5kIGFuIGludGVydmFsIGZvciB0aGUgZW50aXJlIGluc3RhbmNlIGlzIHVzZWQuXG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VGcmFtZSA9IGRpc3BsYXkuX2ZyYW1lSWQ7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIElmIGVxdWFsIHRvIHRoZSBjdXJyZW50IGZyYW1lIElELCBhbiBpbnN0YW5jZSB3YXMgcmVtb3ZlZCBmcm9tIGJlZm9yZSBvciBhZnRlciB0aGlzIGluc3RhbmNlLFxuICAgIC8vIHNvIHdlJ2xsIHdhbnQgdG8gYWRkIGluIGEgcHJvcGVyIGNoYW5nZSBpbnRlcnZhbCAocmVsYXRlZCB0byBzaWJsaW5ncylcbiAgICB0aGlzLnN0aXRjaENoYW5nZUJlZm9yZSA9IDA7XG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VBZnRlciA9IDA7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIElmIGVxdWFsIHRvIHRoZSBjdXJyZW50IGZyYW1lIElELCBjaGlsZCBpbnN0YW5jZXMgd2VyZSBhZGRlZCBvciByZW1vdmVkIGZyb20gdGhpcyBpbnN0YW5jZS5cbiAgICB0aGlzLnN0aXRjaENoYW5nZU9uQ2hpbGRyZW4gPSAwO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2hldGhlciB3ZSBoYXZlIGJlZW4gaW5jbHVkZWQgaW4gb3VyIHBhcmVudCdzIGRyYXdhYmxlcyB0aGUgcHJldmlvdXMgZnJhbWVcbiAgICB0aGlzLnN0aXRjaENoYW5nZUluY2x1ZGVkID0gZmFsc2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gTm9kZSBsaXN0ZW5lcnMgZm9yIHRyYWNraW5nIGNoaWxkcmVuLiBMaXN0ZW5lcnMgc2hvdWxkIGJlIGFkZGVkIG9ubHkgd2hlbiB3ZSBiZWNvbWVcbiAgICAvLyBzdGF0ZWZ1bFxuICAgIHRoaXMuY2hpbGRJbnNlcnRlZExpc3RlbmVyID0gdGhpcy5jaGlsZEluc2VydGVkTGlzdGVuZXIgfHwgdGhpcy5vbkNoaWxkSW5zZXJ0ZWQuYmluZCggdGhpcyApO1xuICAgIHRoaXMuY2hpbGRSZW1vdmVkTGlzdGVuZXIgPSB0aGlzLmNoaWxkUmVtb3ZlZExpc3RlbmVyIHx8IHRoaXMub25DaGlsZFJlbW92ZWQuYmluZCggdGhpcyApO1xuICAgIHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRMaXN0ZW5lciA9IHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRMaXN0ZW5lciB8fCB0aGlzLm9uQ2hpbGRyZW5SZW9yZGVyZWQuYmluZCggdGhpcyApO1xuICAgIHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyID0gdGhpcy52aXNpYmlsaXR5TGlzdGVuZXIgfHwgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciA9IHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciB8fCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5LmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIEBwdWJsaWMge1RpbnlFbWl0dGVyfVxuICAgIHRoaXMudmlzaWJsZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZUVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcbiAgICB0aGlzLnNlbGZWaXNpYmxlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuICAgIHRoaXMuY2FuVm9pY2VFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgICB0aGlzLmNsZWFuSW5zdGFuY2UoIGRpc3BsYXksIHRyYWlsICk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGFkZCB0aGlzIHJlZmVyZW5jZSBvbiBzdGF0ZWxlc3MgaW5zdGFuY2VzLCBzbyB0aGF0IHdlIGNhbiBmaW5kIG91dCBpZiBpdCB3YXMgcmVtb3ZlZCBiZWZvcmUgb3VyXG4gICAgLy8gc3luY1RyZWUgd2FzIGNhbGxlZC5cbiAgICB0aGlzLm5vZGUuYWRkSW5zdGFuY2UoIHRoaXMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gT3V0c3RhbmRpbmcgZXh0ZXJuYWwgcmVmZXJlbmNlcy4gdXNlZCBmb3Igc2hhcmVkIGNhY2hlIGluc3RhbmNlcywgd2hlcmUgbXVsdGlwbGUgaW5zdGFuY2VzXG4gICAgLy8gY2FuIHBvaW50IHRvIHVzLlxuICAgIHRoaXMuZXh0ZXJuYWxSZWZlcmVuY2VDb3VudCA9IDA7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFdoZXRoZXIgd2UgaGF2ZSBoYWQgb3VyIHN0YXRlIGluaXRpYWxpemVkIHlldFxuICAgIHRoaXMuc3RhdGVsZXNzID0gdHJ1ZTtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBhcmUgdGhlIHJvb3QgaW5zdGFuY2UgZm9yIGEgRGlzcGxheS4gUmVuZGVyaW5nIHN0YXRlIGNvbnN0YW50ICh3aWxsIG5vdCBjaGFuZ2VcbiAgICAvLyBvdmVyIHRoZSBsaWZlIG9mIGFuIGluc3RhbmNlKVxuICAgIHRoaXMuaXNEaXNwbGF5Um9vdCA9IGlzRGlzcGxheVJvb3Q7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFdoZXRoZXIgd2UgYXJlIHRoZSByb290IG9mIGEgQ2FudmFzIGNhY2hlLiBSZW5kZXJpbmcgc3RhdGUgY29uc3RhbnQgKHdpbGwgbm90IGNoYW5nZSBvdmVyIHRoZVxuICAgIC8vIGxpZmUgb2YgYW4gaW5zdGFuY2UpXG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUm9vdCA9IGlzU2hhcmVkQ2FudmFzQ2FjaGVSb290O1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBbQ0FTQ0FESU5HIFJFTkRFUiBTVEFURV0gUGFja2VkIHJlbmRlcmVyIG9yZGVyIGJpdG1hc2sgKHdoYXQgb3VyIHJlbmRlcmVyIHByZWZlcmVuY2VzIGFyZSkuXG4gICAgLy8gUGFydCBvZiB0aGUgJ2Nhc2NhZGluZycgcmVuZGVyIHN0YXRlIGZvciB0aGUgaW5zdGFuY2UgdHJlZS4gVGhlc2UgYXJlIHByb3BlcnRpZXMgdGhhdCBjYW4gYWZmZWN0IHRoZSBlbnRpcmVcbiAgICAvLyBzdWJ0cmVlIHdoZW4gc2V0XG4gICAgdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgPSAwO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gW0NBU0NBRElORyBSRU5ERVIgU1RBVEVdIFdoZXRoZXIgd2UgYXJlIGJlbmVhdGggYSBDYW52YXMgY2FjaGUgKENhbnZhcyByZXF1aXJlZCkuIFBhcnQgb2ZcbiAgICAvLyB0aGUgJ2Nhc2NhZGluZycgcmVuZGVyIHN0YXRlIGZvciB0aGUgaW5zdGFuY2UgdHJlZS4gVGhlc2UgYXJlIHByb3BlcnRpZXMgdGhhdCBjYW4gYWZmZWN0IHRoZSBlbnRpcmUgc3VidHJlZSB3aGVuXG4gICAgLy8gc2V0XG4gICAgdGhpcy5pc1VuZGVyQ2FudmFzQ2FjaGUgPSBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFdoZXRoZXIgd2Ugd2lsbCBoYXZlIGEgQmFja2JvbmVEcmF3YWJsZSBncm91cCBkcmF3YWJsZVxuICAgIHRoaXMuaXNCYWNrYm9uZSA9IGZhbHNlO1xuXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gV2hldGhlciB0aGlzIGluc3RhbmNlIGNyZWF0ZXMgYSBuZXcgXCJyb290XCIgZm9yIHRoZSByZWxhdGl2ZSB0cmFpbFxuICAgIC8vIHRyYW5zZm9ybXNcbiAgICB0aGlzLmlzVHJhbnNmb3JtZWQgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFtSRU5ERVIgU1RBVEUgRVhQT1JUXSBXaGV0aGVyIHRoaXMgaW5zdGFuY2UgaGFuZGxlcyB2aXNpYmlsaXR5IHdpdGggYSBncm91cCBkcmF3YWJsZVxuICAgIHRoaXMuaXNWaXNpYmlsaXR5QXBwbGllZCA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFdoZXRoZXIgd2UgaGF2ZSBhIENhbnZhcyBjYWNoZSBzcGVjaWZpYyB0byB0aGlzIGluc3RhbmNlJ3MgcG9zaXRpb25cbiAgICB0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdXG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFtSRU5ERVIgU1RBVEUgRVhQT1JUXVxuICAgIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVNlbGYgPSBpc1NoYXJlZENhbnZhc0NhY2hlUm9vdDtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFJlbmRlcmVyIGJpdG1hc2sgZm9yIHRoZSAnc2VsZicgZHJhd2FibGUgKGlmIG91ciBOb2RlIGlzIHBhaW50ZWQpXG4gICAgdGhpcy5zZWxmUmVuZGVyZXIgPSAwO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBbUkVOREVSIFNUQVRFIEVYUE9SVF0gUmVuZGVyZXIgYml0bWFzayBmb3IgdGhlICdncm91cCcgZHJhd2FibGUgKGlmIGFwcGxpY2FibGUpXG4gICAgdGhpcy5ncm91cFJlbmRlcmVyID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gW1JFTkRFUiBTVEFURSBFWFBPUlRdIFJlbmRlcmVyIGJpdG1hc2sgZm9yIHRoZSBjYWNoZSBkcmF3YWJsZSAoaWYgYXBwbGljYWJsZSlcbiAgICB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgPSAwO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBXaGVuIGVxdWFsIHRvIHRoZSBjdXJyZW50IGZyYW1lIGl0IGlzIGNvbnNpZGVyZWQgXCJkaXJ0eVwiLiBJcyBhIHBydW5pbmcgZmxhZyAod2hldGhlciB3ZSBuZWVkXG4gICAgLy8gdG8gYmUgdmlzaXRlZCwgd2hldGhlciB1cGRhdGVSZW5kZXJpbmdTdGF0ZSBpcyByZXF1aXJlZCwgYW5kIHdoZXRoZXIgdG8gdmlzaXQgY2hpbGRyZW4pXG4gICAgdGhpcy5yZW5kZXJTdGF0ZURpcnR5RnJhbWUgPSBkaXNwbGF5Ll9mcmFtZUlkO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBXaGVuIGVxdWFsIHRvIHRoZSBjdXJyZW50IGZyYW1lIHdlIGNhbid0IHBydW5lIGF0IHRoaXMgaW5zdGFuY2UuIElzIGEgcHJ1bmluZyBmbGFnICh3aGV0aGVyXG4gICAgLy8gd2UgbmVlZCB0byBiZSB2aXNpdGVkLCB3aGV0aGVyIHVwZGF0ZVJlbmRlcmluZ1N0YXRlIGlzIHJlcXVpcmVkLCBhbmQgd2hldGhlciB0byB2aXNpdCBjaGlsZHJlbilcbiAgICB0aGlzLnNraXBQcnVuaW5nRnJhbWUgPSBkaXNwbGF5Ll9mcmFtZUlkO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBpbml0aWFsaXplZCAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICAvLyBXaGV0aGVyIHdlIGhhdmUgYmVlbiBpbnN0YW50aWF0ZWQuIGZhbHNlIGlmIHdlIGFyZSBpbiBhIHBvb2wgd2FpdGluZyB0byBiZSBpbnN0YW50aWF0ZWQuXG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBpbml0aWFsaXphdGlvbiBvZiBwcm9wZXJ0aWVzICh2aWEgaW5pdGlhbGl6ZSgpLCB2aWEgY29uc3RydWN0b3IpLCBhbmQgdG8gY2xlYW4gdGhlIGluc3RhbmNlIGZvclxuICAgKiBwbGFjZW1lbnQgaW4gdGhlIHBvb2wgKGRvbid0IGxlYWsgbWVtb3J5KS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogSWYgdGhlIHBhcmFtZXRlcnMgYXJlIG51bGwsIHdlIHJlbW92ZSBhbGwgZXh0ZXJuYWwgcmVmZXJlbmNlcyBzbyB0aGF0IHdlIGRvbid0IGxlYWsgbWVtb3J5LlxuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl8bnVsbH0gZGlzcGxheSAtIEluc3RhbmNlcyBhcmUgYm91bmQgdG8gYSBzaW5nbGUgZGlzcGxheVxuICAgKiBAcGFyYW0ge1RyYWlsfG51bGx9IHRyYWlsIC0gVGhlIGxpc3Qgb2YgYW5jZXN0b3JzIGdvaW5nIGJhY2sgdXAgdG8gb3VyIHJvb3QgaW5zdGFuY2UgKGZvciB0aGUgZGlzcGxheSwgb3IgZm9yIGEgY2FjaGUpXG4gICAqL1xuICBjbGVhbkluc3RhbmNlKCBkaXNwbGF5LCB0cmFpbCApIHtcbiAgICAvLyBAcHVibGljIHtEaXNwbGF5fG51bGx9XG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcblxuICAgIC8vIEBwdWJsaWMge1RyYWlsfG51bGx9XG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xuXG4gICAgLy8gQHB1YmxpYyB7Tm9kZXxudWxsfVxuICAgIHRoaXMubm9kZSA9IHRyYWlsID8gdHJhaWwubGFzdE5vZGUoKSA6IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtJbnN0YW5jZXxudWxsfSAtIHdpbGwgYmUgc2V0IGFzIG5lZWRlZFxuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHtJbnN0YW5jZXxudWxsfSAtIHNldCB3aGVuIHJlbW92ZWQgZnJvbSB1cywgc28gdGhhdCB3ZSBjYW4gZWFzaWx5IHJlYXR0YWNoIGl0IHdoZW4gbmVjZXNzYXJ5XG4gICAgdGhpcy5vbGRQYXJlbnQgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEluc3RhbmNlPn0gLSBOT1RFOiByZWxpYW5jZSBvbiBjb3JyZWN0IG9yZGVyIGFmdGVyIHN5bmNUcmVlIGJ5IGF0IGxlYXN0IFNWR0Jsb2NrL1NWR0dyb3VwXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNsZWFuQXJyYXkoIHRoaXMuY2hpbGRyZW4gKTtcblxuICAgIC8vIEBwcml2YXRlIHtJbnN0YW5jZXxudWxsfSAtIHJlZmVyZW5jZSB0byBhIHNoYXJlZCBjYWNoZSBpbnN0YW5jZSAoZGlmZmVyZW50IHRoYW4gYSBjaGlsZClcbiAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgPSBudWxsO1xuXG4gICAgLy8gaW5pdGlhbGl6ZS9jbGVhbiBzdWItY29tcG9uZW50c1xuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0uaW5pdGlhbGl6ZSggZGlzcGxheSwgdHJhaWwgKTtcbiAgICB0aGlzLmZpdHRhYmlsaXR5LmluaXRpYWxpemUoIGRpc3BsYXksIHRyYWlsICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPEluc3RhbmNlPn0gLSBDaGlsZCBpbnN0YW5jZXMgYXJlIHB1c2hlZCB0byBoZXJlIHdoZW4gdGhlaXIgbm9kZSBpcyByZW1vdmVkIGZyb20gb3VyIG5vZGUuXG4gICAgLy8gV2UgZG9uJ3QgaW1tZWRpYXRlbHkgZGlzcG9zZSwgc2luY2UgaXQgbWF5IGJlIGFkZGVkIGJhY2suXG4gICAgdGhpcy5pbnN0YW5jZVJlbW92YWxDaGVja0xpc3QgPSBjbGVhbkFycmF5KCB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdCApO1xuXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBPdXIgc2VsZi1kcmF3YWJsZSBpbiB0aGUgZHJhd2FibGUgdHJlZVxuICAgIHRoaXMuc2VsZkRyYXdhYmxlID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge0RyYXdhYmxlfG51bGx9IC0gT3VyIGJhY2tib25lIG9yIG5vbi1zaGFyZWQgY2FjaGVcbiAgICB0aGlzLmdyb3VwRHJhd2FibGUgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7RHJhd2FibGV8bnVsbH0gLSBPdXIgZHJhd2FibGUgaWYgd2UgYXJlIGEgc2hhcmVkIGNhY2hlXG4gICAgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHtEcmF3YWJsZX0gLSByZWZlcmVuY2VzIGludG8gdGhlIGxpbmtlZCBsaXN0IG9mIGRyYXdhYmxlcyAobnVsbCBpZiBub3RoaW5nIGlzIGRyYXdhYmxlIHVuZGVyIHRoaXMpXG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gbnVsbDtcbiAgICB0aGlzLmxhc3REcmF3YWJsZSA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7RHJhd2FibGV9IC0gcmVmZXJlbmNlcyBpbnRvIHRoZSBsaW5rZWQgbGlzdCBvZiBkcmF3YWJsZXMgKGV4Y2x1ZGVzIGFueSBncm91cCBkcmF3YWJsZXMgaGFuZGxpbmcpXG4gICAgdGhpcy5maXJzdElubmVyRHJhd2FibGUgPSBudWxsO1xuICAgIHRoaXMubGFzdElubmVyRHJhd2FibGUgPSBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxTVkdHcm91cD59IC0gTGlzdCBvZiBTVkcgZ3JvdXBzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGRpc3BsYXkgaW5zdGFuY2VcbiAgICB0aGlzLnN2Z0dyb3VwcyA9IGNsZWFuQXJyYXkoIHRoaXMuc3ZnR3JvdXBzICk7XG5cbiAgICB0aGlzLmNsZWFuU3luY1RyZWVSZXN1bHRzKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgb3IgY2xlYXJzIHByb3BlcnRpZXMgdGhhdCBhcmUgYWxsIHNldCBhcyBwc2V1ZG8gJ3JldHVybiB2YWx1ZXMnIG9mIHRoZSBzeW5jVHJlZSgpIG1ldGhvZC4gSXQgaXMgdGhlXG4gICAqIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjYWxsZXIgb2Ygc3luY1RyZWUoKSB0byBhZnRlcndhcmRzIChvcHRpb25hbGx5IHJlYWQgdGhlc2UgcmVzdWx0cyBhbmQpIGNsZWFyIHRoZSByZWZlcmVuY2VzXG4gICAqIHVzaW5nIHRoaXMgbWV0aG9kIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBUT0RPOiBjb25zaWRlciBhIHBvb2wgb2YgKG9yIGEgc2luZ2xlIGdsb2JhbCkgdHlwZWQgcmV0dXJuIG9iamVjdChzKSwgc2luY2Ugc2V0dGluZyB0aGVzZSB2YWx1ZXMgb24gdGhlIGluc3RhbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqIGdlbmVyYWxseSBtZWFucyBoaXR0aW5nIHRoZSBoZWFwLCBhbmQgY2FuIHNsb3cgdXMgZG93bi5cbiAgICovXG4gIGNsZWFuU3luY1RyZWVSZXN1bHRzKCkge1xuICAgIC8vIFRyYWNraW5nIGJvdW5kaW5nIGluZGljZXMgLyBkcmF3YWJsZXMgZm9yIHdoYXQgaGFzIGNoYW5nZWQsIHNvIHdlIGRvbid0IGhhdmUgdG8gb3Zlci1zdGl0Y2ggdGhpbmdzLlxuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBpZiAobm90IGlmZikgY2hpbGQncyBpbmRleCA8PSBiZWZvcmVTdGFibGVJbmRleCwgaXQgaGFzbid0IGJlZW4gYWRkZWQvcmVtb3ZlZC4gcmVsZXZhbnQgdG9cbiAgICAvLyBjdXJyZW50IGNoaWxkcmVuLlxuICAgIHRoaXMuYmVmb3JlU3RhYmxlSW5kZXggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcblxuICAgIC8vIEBwcml2YXRlIHtudW1iZXJ9IC0gaWYgKG5vdCBpZmYpIGNoaWxkJ3MgaW5kZXggPj0gYWZ0ZXJTdGFibGVJbmRleCwgaXQgaGFzbid0IGJlZW4gYWRkZWQvcmVtb3ZlZC4gcmVsZXZhbnQgdG9cbiAgICAvLyBjdXJyZW50IGNoaWxkcmVuLlxuICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleCA9IC0xO1xuXG4gICAgLy8gTk9URTogYm90aCBvZiB0aGVzZSBiZWluZyBudWxsIGluZGljYXRlcyBcInRoZXJlIGFyZSBubyBjaGFuZ2UgaW50ZXJ2YWxzXCIsIG90aGVyd2lzZSBpdCBhc3N1bWVzIGl0IHBvaW50cyB0b1xuICAgIC8vIGEgbGlua2VkLWxpc3Qgb2YgY2hhbmdlIGludGVydmFscy4gV2UgdXNlIHtDaGFuZ2VJbnRlcnZhbH1zIHRvIGhvbGQgdGhpcyBpbmZvcm1hdGlvbiwgc2VlIENoYW5nZUludGVydmFsIHRvIHNlZVxuICAgIC8vIHRoZSBpbmRpdmlkdWFsIHByb3BlcnRpZXMgdGhhdCBhcmUgY29uc2lkZXJlZCBwYXJ0IG9mIGEgY2hhbmdlIGludGVydmFsLlxuXG4gICAgLy8gQHByaXZhdGUge0NoYW5nZUludGVydmFsfSwgZmlyc3QgY2hhbmdlIGludGVydmFsIChzaG91bGQgaGF2ZSBuZXh0Q2hhbmdlSW50ZXJ2YWwgbGlua2VkLWxpc3QgdG9cbiAgICAvLyBsYXN0Q2hhbmdlSW50ZXJ2YWwpXG4gICAgdGhpcy5maXJzdENoYW5nZUludGVydmFsID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHtDaGFuZ2VJbnRlcnZhbH0sIGxhc3QgY2hhbmdlIGludGVydmFsXG4gICAgdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gcmVuZGVyIHN0YXRlIGNoYW5nZSBmbGFncywgYWxsIHNldCBpbiB1cGRhdGVSZW5kZXJpbmdTdGF0ZSgpXG4gICAgdGhpcy5pbmNvbXBhdGlibGVTdGF0ZUNoYW5nZSA9IGZhbHNlOyAvLyBXaGV0aGVyIHdlIG5lZWQgdG8gcmVjcmVhdGUgdGhlIGluc3RhbmNlIHRyZWVcbiAgICB0aGlzLmdyb3VwQ2hhbmdlZCA9IGZhbHNlOyAvLyBXaGV0aGVyIHdlIG5lZWQgdG8gZm9yY2UgYSByZWJ1aWxkIG9mIHRoZSBncm91cCBkcmF3YWJsZVxuICAgIHRoaXMuY2FzY2FkaW5nU3RhdGVDaGFuZ2UgPSBmYWxzZTsgLy8gV2hldGhlciB3ZSBoYWQgYSByZW5kZXIgc3RhdGUgY2hhbmdlIHRoYXQgcmVxdWlyZXMgdmlzaXRpbmcgYWxsIGNoaWxkcmVuXG4gICAgdGhpcy5hbnlTdGF0ZUNoYW5nZSA9IGZhbHNlOyAvLyBXaGV0aGVyIHRoZXJlIHdhcyBhbnkgY2hhbmdlIG9mIHJlbmRlcmluZyBzdGF0ZSB3aXRoIHRoZSBsYXN0IHVwZGF0ZVJlbmRlcmluZ1N0YXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSByZW5kZXJpbmcgc3RhdGUgcHJvcGVydGllcywgYW5kIHJldHVybnMgYSB7Ym9vbGVhbn0gZmxhZyBvZiB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIGlmIHdlIHdlcmVcbiAgICogYWxyZWFkeSBzdGF0ZWZ1bC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogUmVuZGVyaW5nIHN0YXRlIHByb3BlcnRpZXMgZGV0ZXJtaW5lIGhvdyB3ZSBjb25zdHJ1Y3QgdGhlIGRyYXdhYmxlIHRyZWUgZnJvbSBvdXIgaW5zdGFuY2UgdHJlZSAoZS5nLiBkbyB3ZVxuICAgKiBjcmVhdGUgYW4gU1ZHIG9yIENhbnZhcyByZWN0YW5nbGUsIHdoZXJlIHRvIHBsYWNlIENTUyB0cmFuc2Zvcm1zLCBob3cgdG8gaGFuZGxlIG9wYWNpdHksIGV0Yy4pXG4gICAqXG4gICAqIEluc3RhbmNlcyBzdGFydCBvdXQgYXMgJ3N0YXRlbGVzcycgdW50aWwgdXBkYXRlUmVuZGVyaW5nU3RhdGUoKSBpcyBjYWxsZWQgdGhlIGZpcnN0IHRpbWUuXG4gICAqXG4gICAqIE5vZGUgY2hhbmdlcyB0aGF0IGNhbiBjYXVzZSBhIHBvdGVudGlhbCBzdGF0ZSBjaGFuZ2UgKHVzaW5nIE5vZGUgZXZlbnQgbGlzdGVuZXJzKTpcbiAgICogLSBoaW50c1xuICAgKiAtIG9wYWNpdHlcbiAgICogLSBjbGlwQXJlYVxuICAgKiAtIF9yZW5kZXJlclN1bW1hcnlcbiAgICogLSBfcmVuZGVyZXJCaXRtYXNrXG4gICAqXG4gICAqIFN0YXRlIGNoYW5nZXMgdGhhdCBjYW4gY2F1c2UgY2FzY2FkaW5nIHN0YXRlIGNoYW5nZXMgaW4gZGVzY2VuZGFudHM6XG4gICAqIC0gaXNVbmRlckNhbnZhc0NhY2hlXG4gICAqIC0gcHJlZmVycmVkUmVuZGVyZXJzXG4gICAqL1xuICB1cGRhdGVSZW5kZXJpbmdTdGF0ZSgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYHVwZGF0ZVJlbmRlcmluZ1N0YXRlICR7dGhpcy50b1N0cmluZygpXG4gICAgfSR7dGhpcy5zdGF0ZWxlc3MgPyAnIChzdGF0ZWxlc3MpJyA6ICcnfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYG9sZDogJHt0aGlzLmdldFN0YXRlU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gb2xkIHN0YXRlIGluZm9ybWF0aW9uLCBzbyB3ZSBjYW4gY29tcGFyZSB3aGF0IHdhcyBjaGFuZ2VkXG4gICAgY29uc3Qgd2FzQmFja2JvbmUgPSB0aGlzLmlzQmFja2JvbmU7XG4gICAgY29uc3Qgd2FzVHJhbnNmb3JtZWQgPSB0aGlzLmlzVHJhbnNmb3JtZWQ7XG4gICAgY29uc3Qgd2FzVmlzaWJpbGl0eUFwcGxpZWQgPSB0aGlzLmlzVmlzaWJpbGl0eUFwcGxpZWQ7XG4gICAgY29uc3Qgd2FzSW5zdGFuY2VDYW52YXNDYWNoZSA9IHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlO1xuICAgIGNvbnN0IHdhc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA9IHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVNlbGY7XG4gICAgY29uc3Qgd2FzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciA9IHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyO1xuICAgIGNvbnN0IHdhc1VuZGVyQ2FudmFzQ2FjaGUgPSB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZTtcbiAgICBjb25zdCBvbGRTZWxmUmVuZGVyZXIgPSB0aGlzLnNlbGZSZW5kZXJlcjtcbiAgICBjb25zdCBvbGRHcm91cFJlbmRlcmVyID0gdGhpcy5ncm91cFJlbmRlcmVyO1xuICAgIGNvbnN0IG9sZFNoYXJlZENhY2hlUmVuZGVyZXIgPSB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXI7XG4gICAgY29uc3Qgb2xkUHJlZmVycmVkUmVuZGVyZXJzID0gdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnM7XG5cbiAgICAvLyBkZWZhdWx0IHZhbHVlcyB0byBzZXQgKG1ha2VzIHRoZSBsb2dpYyBtdWNoIHNpbXBsZXIpXG4gICAgdGhpcy5pc0JhY2tib25lID0gZmFsc2U7XG4gICAgdGhpcy5pc1RyYW5zZm9ybWVkID0gZmFsc2U7XG4gICAgdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkID0gZmFsc2U7XG4gICAgdGhpcy5pc0luc3RhbmNlQ2FudmFzQ2FjaGUgPSBmYWxzZTtcbiAgICB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmID0gZmFsc2U7XG4gICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgPSBmYWxzZTtcbiAgICB0aGlzLnNlbGZSZW5kZXJlciA9IDA7XG4gICAgdGhpcy5ncm91cFJlbmRlcmVyID0gMDtcbiAgICB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgPSAwO1xuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZTtcblxuICAgIHRoaXMuaXNVbmRlckNhbnZhc0NhY2hlID0gdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUm9vdCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLnBhcmVudCA/ICggdGhpcy5wYXJlbnQuaXNVbmRlckNhbnZhc0NhY2hlIHx8IHRoaXMucGFyZW50LmlzSW5zdGFuY2VDYW52YXNDYWNoZSB8fCB0aGlzLnBhcmVudC5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiApIDogZmFsc2UgKTtcblxuICAgIC8vIHNldCB1cCBvdXIgcHJlZmVycmVkIHJlbmRlcmVyIGxpc3QgKGdlbmVyYWxseSBiYXNlZCBvbiB0aGUgcGFyZW50KVxuICAgIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzID0gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5wcmVmZXJyZWRSZW5kZXJlcnMgOiBkZWZhdWx0UHJlZmVycmVkUmVuZGVyZXJzO1xuICAgIC8vIGFsbG93IHRoZSBub2RlIHRvIG1vZGlmeSBpdHMgcHJlZmVycmVkIHJlbmRlcmVycyAoYW5kIHRob3NlIG9mIGl0cyBkZXNjZW5kYW50cylcbiAgICBpZiAoIG5vZGUuX3JlbmRlcmVyICkge1xuICAgICAgdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCB0aGlzLnByZWZlcnJlZFJlbmRlcmVycywgbm9kZS5fcmVuZGVyZXIgKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNDbGlwID0gdGhpcy5ub2RlLmhhc0NsaXBBcmVhKCk7XG4gICAgY29uc3QgaGFzRmlsdGVycyA9IHRoaXMubm9kZS5lZmZlY3RpdmVPcGFjaXR5ICE9PSAxIHx8IG5vZGUuX3VzZXNPcGFjaXR5IHx8IHRoaXMubm9kZS5fZmlsdGVycy5sZW5ndGggPiAwO1xuICAgIC8vIGxldCBoYXNOb25ET01GaWx0ZXIgPSBmYWxzZTtcbiAgICBsZXQgaGFzTm9uU1ZHRmlsdGVyID0gZmFsc2U7XG4gICAgbGV0IGhhc05vbkNhbnZhc0ZpbHRlciA9IGZhbHNlO1xuICAgIC8vIGxldCBoYXNOb25XZWJHTEZpbHRlciA9IGZhbHNlO1xuICAgIGlmICggaGFzRmlsdGVycyApIHtcbiAgICAgIC8vIE5PVEU6IG9wYWNpdHkgaXMgT0sgd2l0aCBhbGwgb2YgdGhvc2UgKGN1cnJlbnRseSlcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubm9kZS5fZmlsdGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZmlsdGVyID0gdGhpcy5ub2RlLl9maWx0ZXJzWyBpIF07XG5cbiAgICAgICAgLy8gVE9ETzogaG93IHRvIGhhbmRsZSB0aGlzLCBpZiB3ZSBzcGxpdCBBVCB0aGUgbm9kZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgLy8gaWYgKCAhZmlsdGVyLmlzRE9NQ29tcGF0aWJsZSgpICkge1xuICAgICAgICAvLyAgIGhhc05vbkRPTUZpbHRlciA9IHRydWU7XG4gICAgICAgIC8vIH1cbiAgICAgICAgaWYgKCAhZmlsdGVyLmlzU1ZHQ29tcGF0aWJsZSgpICkge1xuICAgICAgICAgIGhhc05vblNWR0ZpbHRlciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhZmlsdGVyLmlzQ2FudmFzQ29tcGF0aWJsZSgpICkge1xuICAgICAgICAgIGhhc05vbkNhbnZhc0ZpbHRlciA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgKCAhZmlsdGVyLmlzV2ViR0xDb21wYXRpYmxlKCkgKSB7XG4gICAgICAgIC8vICAgaGFzTm9uV2ViR0xGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlcXVpcmVzU3BsaXQgPSBub2RlLl9jc3NUcmFuc2Zvcm0gfHwgbm9kZS5fbGF5ZXJTcGxpdDtcbiAgICBjb25zdCBiYWNrYm9uZVJlcXVpcmVkID0gdGhpcy5pc0Rpc3BsYXlSb290IHx8ICggIXRoaXMuaXNVbmRlckNhbnZhc0NhY2hlICYmIHJlcXVpcmVzU3BsaXQgKTtcblxuICAgIC8vIFN1cHBvcnQgZWl0aGVyIFwiYWxsIENhbnZhc1wiIG9yIFwiYWxsIFNWR1wiIG9wYWNpdHkvY2xpcFxuICAgIGNvbnN0IGFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrID0gIWJhY2tib25lUmVxdWlyZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggaGFzRmlsdGVycyB8fCBoYXNDbGlwICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggKCAhaGFzTm9uU1ZHRmlsdGVyICYmIHRoaXMubm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlTVkcoIHRoaXMucHJlZmVycmVkUmVuZGVyZXJzICkgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoICFoYXNOb25DYW52YXNGaWx0ZXIgJiYgdGhpcy5ub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlUmVuZGVyZWRFeGNsdXNpdmVseUNhbnZhcyggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMgKSApICk7XG4gICAgY29uc3QgdXNlQmFja2JvbmUgPSBhcHBseVRyYW5zcGFyZW5jeVdpdGhCbG9jayA/IGZhbHNlIDogKCBiYWNrYm9uZVJlcXVpcmVkIHx8IGhhc0ZpbHRlcnMgfHwgaGFzQ2xpcCApO1xuXG4gICAgLy8gY2hlY2sgaWYgd2UgbmVlZCBhIGJhY2tib25lIG9yIGNhY2hlXG4gICAgLy8gaWYgd2UgYXJlIHVuZGVyIGEgY2FudmFzIGNhY2hlLCB3ZSB3aWxsIE5FVkVSIGhhdmUgYSBiYWNrYm9uZVxuICAgIC8vIHNwbGl0cyBhcmUgYWNjb21wbGlzaGVkIGp1c3QgYnkgaGF2aW5nIGEgYmFja2JvbmVcbiAgICAvLyBOT1RFOiBJZiBjaGFuZ2luZywgY2hlY2sgUmVuZGVyZXJTdW1tYXJ5LnN1bW1hcnlCaXRtYXNrRm9yTm9kZVNlbGZcbiAgICAvL09IVFdPIFRPRE86IFVwZGF0ZSB0aGlzIHRvIHByb3Blcmx5IGlkZW50aWZ5IHdoZW4gYmFja2JvbmVzIGFyZSBuZWNlc3NhcnkvYW5kLW9yIHdoZW4gd2UgZm9yd2FyZCBvcGFjaXR5L2NsaXBwaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgaWYgKCB1c2VCYWNrYm9uZSApIHtcbiAgICAgIHRoaXMuaXNCYWNrYm9uZSA9IHRydWU7XG4gICAgICB0aGlzLmlzVmlzaWJpbGl0eUFwcGxpZWQgPSB0cnVlO1xuICAgICAgdGhpcy5pc1RyYW5zZm9ybWVkID0gdGhpcy5pc0Rpc3BsYXlSb290IHx8ICEhbm9kZS5fY3NzVHJhbnNmb3JtOyAvLyBmb3Igbm93LCBvbmx5IHRyaWdnZXIgQ1NTIHRyYW5zZm9ybSBpZiB3ZSBoYXZlIHRoZSBzcGVjaWZpYyBoaW50XG4gICAgICAvL09IVFdPIFRPRE86IGNoZWNrIHdoZXRoZXIgdGhlIGZvcmNlIGFjY2VsZXJhdGlvbiBoaW50IGlzIGJlaW5nIHVzZWQgYnkgb3VyIERPTUJsb2NrIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLmdyb3VwUmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrRE9NOyAvLyBwcm9iYWJseSB3b24ndCBiZSB1c2VkXG4gICAgfVxuICAgIC8vIFRPRE86IG5vZGUuX2NhbnZhc0NhY2hlIGhpbnQgbm90IGRlZmluZWQsIGFsd2F5cyB1bmRlZmluZWQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBlbHNlIGlmICggIWFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrICYmICggaGFzRmlsdGVycyB8fCBoYXNDbGlwIHx8IG5vZGUuX2NhbnZhc0NhY2hlICkgKSB7XG4gICAgICAvLyBldmVyeXRoaW5nIHVuZGVybmVhdGggbmVlZHMgdG8gYmUgcmVuZGVyYWJsZSB3aXRoIENhbnZhcywgb3RoZXJ3aXNlIHdlIGNhbm5vdCBjYWNoZVxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQoKSxcbiAgICAgICAgYE5vZGUgY2FudmFzQ2FjaGUgcHJvdmlkZWQsIGJ1dCBub3QgYWxsIG5vZGUgY29udGVudHMgY2FuIGJlIHJlbmRlcmVkIHdpdGggQ2FudmFzIHVuZGVyICR7XG4gICAgICAgICAgdGhpcy5ub2RlLmNvbnN0cnVjdG9yLm5hbWV9YCApO1xuXG4gICAgICAvLyBUT0RPOiBub2RlLl9zaW5nbGVDYWNoZSBoaW50IG5vdCBkZWZpbmVkLCBhbHdheXMgdW5kZWZpbmVkIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIG5vZGUuX3NpbmdsZUNhY2hlICkge1xuICAgICAgICAvLyBUT0RPOiBzY2FsZSBvcHRpb25zIC0gZml4ZWQgc2l6ZSwgbWF0Y2ggaGlnaGVzdCByZXNvbHV0aW9uIChhZGFwdGl2ZSksIG9yIG1pcG1hcHBlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICBpZiAoIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVJvb3QgKSB7XG4gICAgICAgICAgdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA9IHRydWU7XG5cbiAgICAgICAgICB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgPSB0aGlzLmlzV2ViR0xTdXBwb3J0ZWQgPyBSZW5kZXJlci5iaXRtYXNrV2ViR0wgOiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgdW5kZXJuZWF0aCBuZWVkcyB0byBndWFyYW50ZWUgdGhhdCBpdHMgYm91bmRzIGFyZSB2YWxpZFxuICAgICAgICAgIC8vT0hUV08gVE9ETzogV2UnbGwgcHJvYmFibHkgcmVtb3ZlIHRoaXMgaWYgd2UgZ28gd2l0aCB0aGUgXCJzYWZlIGJvdW5kc1wiIGFwcHJvYWNoIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlLl9yZW5kZXJlclN1bW1hcnkuYXJlQm91bmRzVmFsaWQoKSxcbiAgICAgICAgICAgIGBOb2RlIHNpbmdsZUNhY2hlIHByb3ZpZGVkLCBidXQgbm90IGFsbCBub2RlIGNvbnRlbnRzIGhhdmUgdmFsaWQgYm91bmRzIHVuZGVyICR7XG4gICAgICAgICAgICAgIHRoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWAgKTtcblxuICAgICAgICAgIHRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1VuZGVyQ2FudmFzQ2FjaGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmdyb3VwUmVuZGVyZXIgPSB0aGlzLmlzV2ViR0xTdXBwb3J0ZWQgPyBSZW5kZXJlci5iaXRtYXNrV2ViR0wgOiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy5ub2RlLmlzUGFpbnRlZCgpICkge1xuICAgICAgaWYgKCB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZSApIHtcbiAgICAgICAgdGhpcy5zZWxmUmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBzdXBwb3J0ZWROb2RlQml0bWFzayA9IHRoaXMubm9kZS5fcmVuZGVyZXJCaXRtYXNrO1xuICAgICAgICBpZiAoICF0aGlzLmlzV2ViR0xTdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgY29uc3QgaW52YWxpZEJpdG1hc2tzID0gUmVuZGVyZXIuYml0bWFza1dlYkdMO1xuICAgICAgICAgIHN1cHBvcnRlZE5vZGVCaXRtYXNrID0gc3VwcG9ydGVkTm9kZUJpdG1hc2sgXiAoIHN1cHBvcnRlZE5vZGVCaXRtYXNrICYgaW52YWxpZEJpdG1hc2tzICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2UgdGhlIHByZWZlcnJlZCByZW5kZXJpbmcgb3JkZXIgaWYgc3BlY2lmaWVkLCBvdGhlcndpc2UgdXNlIHRoZSBkZWZhdWx0XG4gICAgICAgIHRoaXMuc2VsZlJlbmRlcmVyID0gKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMsIDAgKSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMsIDEgKSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMsIDIgKSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggdGhpcy5wcmVmZXJyZWRSZW5kZXJlcnMsIDMgKSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICggc3VwcG9ydGVkTm9kZUJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHN1cHBvcnRlZE5vZGVCaXRtYXNrICYgUmVuZGVyZXIuYml0bWFza0RPTSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBzdXBwb3J0ZWROb2RlQml0bWFzayAmIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMDtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGZSZW5kZXJlciwgJ3NldFNlbGZSZW5kZXJlciBmYWlsdXJlPycgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3aGV0aGVyIHdlIG5lZWQgdG8gZm9yY2UgcmVidWlsZGluZyB0aGUgZ3JvdXAgZHJhd2FibGVcbiAgICB0aGlzLmdyb3VwQ2hhbmdlZCA9ICggd2FzQmFja2JvbmUgIT09IHRoaXMuaXNCYWNrYm9uZSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoIHdhc0luc3RhbmNlQ2FudmFzQ2FjaGUgIT09IHRoaXMuaXNJbnN0YW5jZUNhbnZhc0NhY2hlICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICggd2FzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmICE9PSB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmICk7XG5cbiAgICAvLyB3aGV0aGVyIGFueSBvZiBvdXIgcmVuZGVyIHN0YXRlIGNoYW5nZXMgY2FuIGNoYW5nZSBkZXNjZW5kYW50IHJlbmRlciBzdGF0ZXNcbiAgICB0aGlzLmNhc2NhZGluZ1N0YXRlQ2hhbmdlID0gKCB3YXNVbmRlckNhbnZhc0NhY2hlICE9PSB0aGlzLmlzVW5kZXJDYW52YXNDYWNoZSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggb2xkUHJlZmVycmVkUmVuZGVyZXJzICE9PSB0aGlzLnByZWZlcnJlZFJlbmRlcmVycyApO1xuXG4gICAgLypcbiAgICAgKiBXaGV0aGVyIHdlIGNhbiBqdXN0IHVwZGF0ZSB0aGUgc3RhdGUgb24gYW4gSW5zdGFuY2Ugd2hlbiBjaGFuZ2luZyBmcm9tIHRoaXMgc3RhdGUgPT4gb3RoZXJTdGF0ZS5cbiAgICAgKiBUaGlzIGlzIGdlbmVyYWxseSBub3QgcG9zc2libGUgaWYgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gd2hldGhlciB0aGUgaW5zdGFuY2Ugc2hvdWxkIGJlIGEgdHJhbnNmb3JtIHJvb3RcbiAgICAgKiAoZS5nLiBiYWNrYm9uZS9zaW5nbGUtY2FjaGUpLCBzbyB3ZSB3aWxsIGhhdmUgdG8gcmVjcmVhdGUgdGhlIGluc3RhbmNlIGFuZCBpdHMgc3VidHJlZSBpZiB0aGF0IGlzIHRoZSBjYXNlLlxuICAgICAqXG4gICAgICogT25seSByZWxldmFudCBpZiB3ZSB3ZXJlIHByZXZpb3VzbHkgc3RhdGVmdWwsIHNvIGl0IGNhbiBiZSBpZ25vcmVkIGlmIHRoaXMgaXMgb3VyIGZpcnN0IHVwZGF0ZVJlbmRlcmluZ1N0YXRlKClcbiAgICAgKi9cbiAgICB0aGlzLmluY29tcGF0aWJsZVN0YXRlQ2hhbmdlID0gKCB0aGlzLmlzVHJhbnNmb3JtZWQgIT09IHdhc1RyYW5zZm9ybWVkICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciAhPT0gd2FzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciApO1xuXG4gICAgLy8gd2hldGhlciB0aGVyZSB3YXMgYW55IHJlbmRlciBzdGF0ZSBjaGFuZ2VcbiAgICB0aGlzLmFueVN0YXRlQ2hhbmdlID0gdGhpcy5ncm91cENoYW5nZWQgfHwgdGhpcy5jYXNjYWRpbmdTdGF0ZUNoYW5nZSB8fCB0aGlzLmluY29tcGF0aWJsZVN0YXRlQ2hhbmdlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICggb2xkU2VsZlJlbmRlcmVyICE9PSB0aGlzLnNlbGZSZW5kZXJlciApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICggb2xkR3JvdXBSZW5kZXJlciAhPT0gdGhpcy5ncm91cFJlbmRlcmVyICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKCBvbGRTaGFyZWRDYWNoZVJlbmRlcmVyICE9PSB0aGlzLnNoYXJlZENhY2hlUmVuZGVyZXIgKTtcblxuICAgIC8vIGlmIG91ciB2aXNpYmlsaXR5IGFwcGxpY2F0aW9ucyBjaGFuZ2VkLCB1cGRhdGUgdGhlIGVudGlyZSBzdWJ0cmVlXG4gICAgaWYgKCB3YXNWaXNpYmlsaXR5QXBwbGllZCAhPT0gdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkICkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQubWFya0NoaWxkVmlzaWJpbGl0eURpcnR5KCk7XG4gICAgfVxuXG4gICAgLy8gSWYgb3VyIGZpdHRhYmlsaXR5IGhhcyBjaGFuZ2VkLCBwcm9wYWdhdGUgdGhvc2UgY2hhbmdlcy4gKEl0J3MgZ2VuZXJhbGx5IGEgaGludCBjaGFuZ2Ugd2hpY2ggd2lsbCB0cmlnZ2VyIGFuXG4gICAgLy8gdXBkYXRlIG9mIHJlbmRlcmluZyBzdGF0ZSkuXG4gICAgdGhpcy5maXR0YWJpbGl0eS5jaGVja1NlbGZGaXR0YWJpbGl0eSgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBuZXc6ICR7dGhpcy5nZXRTdGF0ZVN0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHNob3J0IHN0cmluZyB0aGF0IGNvbnRhaW5zIGEgc3VtbWFyeSBvZiB0aGUgcmVuZGVyaW5nIHN0YXRlLCBmb3IgZGVidWdnaW5nL2xvZ2dpbmcgcHVycG9zZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIGdldFN0YXRlU3RyaW5nKCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGBTWyAke1xuICAgICAgdGhpcy5pc0Rpc3BsYXlSb290ID8gJ2Rpc3BsYXlSb290ICcgOiAnJ1xuICAgIH0ke3RoaXMuaXNCYWNrYm9uZSA/ICdiYWNrYm9uZSAnIDogJydcbiAgICB9JHt0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSA/ICdpbnN0YW5jZUNhY2hlICcgOiAnJ1xuICAgIH0ke3RoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyID8gJ3NoYXJlZENhY2hlUGxhY2Vob2xkZXIgJyA6ICcnXG4gICAgfSR7dGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA/ICdzaGFyZWRDYWNoZVNlbGYgJyA6ICcnXG4gICAgfSR7dGhpcy5pc1RyYW5zZm9ybWVkID8gJ1RSICcgOiAnJ1xuICAgIH0ke3RoaXMuaXNWaXNpYmlsaXR5QXBwbGllZCA/ICdWSVMgJyA6ICcnXG4gICAgfSR7dGhpcy5zZWxmUmVuZGVyZXIgPyB0aGlzLnNlbGZSZW5kZXJlci50b1N0cmluZyggMTYgKSA6ICctJ30sJHtcbiAgICAgIHRoaXMuZ3JvdXBSZW5kZXJlciA/IHRoaXMuZ3JvdXBSZW5kZXJlci50b1N0cmluZyggMTYgKSA6ICctJ30sJHtcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVSZW5kZXJlciA/IHRoaXMuc2hhcmVkQ2FjaGVSZW5kZXJlci50b1N0cmluZyggMTYgKSA6ICctJ30gYDtcbiAgICByZXR1cm4gYCR7cmVzdWx0fV1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIGVudHJ5IHBvaW50IGZvciBzeW5jVHJlZSgpLCBjYWxsZWQgb24gdGhlIHJvb3QgaW5zdGFuY2UuIFNlZSBzeW5jVHJlZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBiYXNlU3luY1RyZWUoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0Rpc3BsYXlSb290LCAnYmFzZVN5bmNUcmVlKCkgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIHRoZSByb290IGluc3RhbmNlJyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGAtLS0tLS0tLSBTVEFSVCBiYXNlU3luY1RyZWUgJHt0aGlzLnRvU3RyaW5nKCl9IC0tLS0tLS0tYCApO1xuICAgIHRoaXMuc3luY1RyZWUoKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYC0tLS0tLS0tIEVORCBiYXNlU3luY1RyZWUgJHt0aGlzLnRvU3RyaW5nKCl9IC0tLS0tLS0tYCApO1xuICAgIHRoaXMuY2xlYW5TeW5jVHJlZVJlc3VsdHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSByZW5kZXJpbmcgc3RhdGUsIHN5bmNocm9uaXplcyB0aGUgaW5zdGFuY2Ugc3ViLXRyZWUgKHNvIHRoYXQgb3VyIGluc3RhbmNlIHRyZWUgbWF0Y2hlc1xuICAgKiB0aGUgTm9kZSB0cmVlIHRoZSBjbGllbnQgcHJvdmlkZWQpLCBhbmQgYmFjay1wcm9wYWdhdGVzIHtDaGFuZ2VJbnRlcnZhbH0gaW5mb3JtYXRpb24gZm9yIHN0aXRjaGluZyBiYWNrYm9uZXNcbiAgICogYW5kL29yIGNhY2hlcy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogc3luY1RyZWUoKSBhbHNvIHNldHMgYSBudW1iZXIgb2YgcHNldWRvICdyZXR1cm4gdmFsdWVzJyAoZG9jdW1lbnRlZCBpbiBjbGVhblN5bmNUcmVlUmVzdWx0cygpKS4gQWZ0ZXIgY2FsbGluZ1xuICAgKiBzeW5jVHJlZSgpIGFuZCBvcHRpb25hbGx5IHJlYWRpbmcgdGhvc2UgcmVzdWx0cywgY2xlYW5TeW5jVHJlZVJlc3VsdHMoKSBzaG91bGQgYmUgY2FsbGVkIG9uIHRoZSBzYW1lIGluc3RhbmNlXG4gICAqIGluIG9yZGVyIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBzeW5jIHdhcyBwb3NzaWJsZS4gSWYgaXQgd2Fzbid0LCBhIG5ldyBpbnN0YW5jZSBzdWJ0cmVlIHdpbGwgbmVlZCB0byBiZSBjcmVhdGVkLlxuICAgKi9cbiAgc3luY1RyZWUoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBzeW5jVHJlZSAke3RoaXMudG9TdHJpbmcoKX0gJHt0aGlzLmdldFN0YXRlU3RyaW5nKClcbiAgICB9JHt0aGlzLnN0YXRlbGVzcyA/ICcgKHN0YXRlbGVzcyknIDogJyd9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5LmlzTG9nZ2luZ1BlcmZvcm1hbmNlKCkgKSB7XG4gICAgICB0aGlzLmRpc3BsYXkucGVyZlN5bmNUcmVlQ291bnQrKztcbiAgICB9XG5cbiAgICAvLyBtYXkgYWNjZXNzIGlzVHJhbnNmb3JtZWQgdXAgdG8gcm9vdCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdHJhaWxzXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucGFyZW50IHx8ICF0aGlzLnBhcmVudC5zdGF0ZWxlc3MsICdXZSBzaG91bGQgbm90IGhhdmUgYSBzdGF0ZWxlc3MgcGFyZW50IGluc3RhbmNlJyApO1xuXG4gICAgY29uc3Qgd2FzU3RhdGVsZXNzID0gdGhpcy5zdGF0ZWxlc3M7XG4gICAgaWYgKCB3YXNTdGF0ZWxlc3MgfHxcbiAgICAgICAgICggdGhpcy5wYXJlbnQgJiYgdGhpcy5wYXJlbnQuY2FzY2FkaW5nU3RhdGVDaGFuZ2UgKSB8fCAvLyBpZiBvdXIgcGFyZW50IGhhZCBjYXNjYWRpbmcgc3RhdGUgY2hhbmdlcywgd2UgbmVlZCB0byByZWNvbXB1dGVcbiAgICAgICAgICggdGhpcy5yZW5kZXJTdGF0ZURpcnR5RnJhbWUgPT09IHRoaXMuZGlzcGxheS5fZnJhbWVJZCApICkgeyAvLyBpZiBvdXIgcmVuZGVyIHN0YXRlIGlzIGRpcnR5XG4gICAgICB0aGlzLnVwZGF0ZVJlbmRlcmluZ1N0YXRlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gd2UgY2FuIGNoZWNrIHdoZXRoZXIgdXBkYXRpbmcgc3RhdGUgd291bGQgaGF2ZSBtYWRlIGFueSBjaGFuZ2VzIHdoZW4gd2Ugc2tpcCBpdCAoZm9yIHNsb3cgYXNzZXJ0aW9ucylcbiAgICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgICAgdGhpcy51cGRhdGVSZW5kZXJpbmdTdGF0ZSgpO1xuICAgICAgICBhc3NlcnRTbG93KCAhdGhpcy5hbnlTdGF0ZUNoYW5nZSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggIXdhc1N0YXRlbGVzcyAmJiB0aGlzLmluY29tcGF0aWJsZVN0YXRlQ2hhbmdlICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UoIGBpbmNvbXBhdGlibGUgaW5zdGFuY2UgJHt0aGlzLnRvU3RyaW5nKCl9ICR7dGhpcy5nZXRTdGF0ZVN0cmluZygpfSwgYWJvcnRpbmdgICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgICAgLy8gVGhlIGZhbHNlIHJldHVybiB3aWxsIHNpZ25hbCB0aGF0IGEgbmV3IGluc3RhbmNlIG5lZWRzIHRvIGJlIHVzZWQuIG91ciB0cmVlIHdpbGwgYmUgZGlzcG9zZWQgc29vbi5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZWxlc3MgPSBmYWxzZTtcblxuICAgIC8vIG5vIG5lZWQgdG8gb3ZlcndyaXRlLCBzaG91bGQgYWx3YXlzIGJlIHRoZSBzYW1lXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXdhc1N0YXRlbGVzcyB8fCB0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCxcbiAgICAgICdXZSBzaG91bGQgbm90IGhhdmUgY2hpbGQgaW5zdGFuY2VzIG9uIGFuIGluc3RhbmNlIHdpdGhvdXQgc3RhdGUnICk7XG5cbiAgICBpZiAoIHdhc1N0YXRlbGVzcyApIHtcbiAgICAgIC8vIElmIHdlIGFyZSBhIHRyYW5zZm9ybSByb290LCBub3RpZnkgdGhlIGRpc3BsYXkgdGhhdCB3ZSBhcmUgZGlydHkuIFdlJ2xsIGJlIHZhbGlkYXRlZCB3aGVuIGl0J3MgYXQgdGhhdCBwaGFzZVxuICAgICAgLy8gYXQgdGhlIG5leHQgdXBkYXRlRGlzcGxheSgpLlxuICAgICAgaWYgKCB0aGlzLmlzVHJhbnNmb3JtZWQgKSB7XG4gICAgICAgIHRoaXMuZGlzcGxheS5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCB0aGlzLCB0cnVlICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXR0YWNoTm9kZUxpc3RlbmVycygpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHBydW5pbmcgb2Ygc2hhcmVkIGNhY2hlcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgKSB7XG4gICAgICB0aGlzLnNoYXJlZFN5bmNUcmVlKCk7XG4gICAgfVxuICAgIC8vIHBydW5pbmcgc28gdGhhdCBpZiBubyBjaGFuZ2VzIHdvdWxkIGFmZmVjdCBhIHN1YnRyZWUgaXQgaXMgc2tpcHBlZFxuICAgIGVsc2UgaWYgKCB3YXNTdGF0ZWxlc3MgfHwgdGhpcy5za2lwUHJ1bmluZ0ZyYW1lID09PSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQgfHwgdGhpcy5hbnlTdGF0ZUNoYW5nZSApIHtcblxuICAgICAgLy8gbWFyayBmdWxseS1yZW1vdmVkIGluc3RhbmNlcyBmb3IgZGlzcG9zYWwsIGFuZCBpbml0aWFsaXplIGNoaWxkIGluc3RhbmNlcyBpZiB3ZSB3ZXJlIHN0YXRlbGVzc1xuICAgICAgdGhpcy5wcmVwYXJlQ2hpbGRJbnN0YW5jZXMoIHdhc1N0YXRlbGVzcyApO1xuXG4gICAgICBjb25zdCBvbGRGaXJzdERyYXdhYmxlID0gdGhpcy5maXJzdERyYXdhYmxlO1xuICAgICAgY29uc3Qgb2xkTGFzdERyYXdhYmxlID0gdGhpcy5sYXN0RHJhd2FibGU7XG4gICAgICBjb25zdCBvbGRGaXJzdElubmVyRHJhd2FibGUgPSB0aGlzLmZpcnN0SW5uZXJEcmF3YWJsZTtcbiAgICAgIGNvbnN0IG9sZExhc3RJbm5lckRyYXdhYmxlID0gdGhpcy5sYXN0SW5uZXJEcmF3YWJsZTtcblxuICAgICAgY29uc3Qgc2VsZkNoYW5nZWQgPSB0aGlzLnVwZGF0ZVNlbGZEcmF3YWJsZSgpO1xuXG4gICAgICAvLyBTeW5jaHJvbml6ZXMgb3VyIGNoaWxkcmVuIGFuZCBzZWxmLCB3aXRoIHRoZSBkcmF3YWJsZXMgYW5kIGNoYW5nZSBpbnRlcnZhbHMgb2YgYm90aCBjb21iaW5lZFxuICAgICAgdGhpcy5sb2NhbFN5bmNUcmVlKCBzZWxmQ2hhbmdlZCApO1xuXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICAgIC8vIGJlZm9yZSBhbmQgYWZ0ZXIgZmlyc3QvbGFzdCBkcmF3YWJsZXMgKGluc2lkZSBhbnkgcG90ZW50aWFsIGdyb3VwIGRyYXdhYmxlKVxuICAgICAgICB0aGlzLmF1ZGl0Q2hhbmdlSW50ZXJ2YWxzKCBvbGRGaXJzdElubmVyRHJhd2FibGUsIG9sZExhc3RJbm5lckRyYXdhYmxlLCB0aGlzLmZpcnN0SW5uZXJEcmF3YWJsZSwgdGhpcy5sYXN0SW5uZXJEcmF3YWJsZSApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSB1c2UgYSBncm91cCBkcmF3YWJsZSAoYmFja2JvbmUsIGV0Yy4pLCB3ZSdsbCBjb2xsYXBzZSBvdXIgZHJhd2FibGVzIGFuZCBjaGFuZ2UgaW50ZXJ2YWxzIHRvIHJlZmVyZW5jZVxuICAgICAgLy8gdGhlIGdyb3VwIGRyYXdhYmxlIChhcyBhcHBsaWNhYmxlKS5cbiAgICAgIHRoaXMuZ3JvdXBTeW5jVHJlZSggd2FzU3RhdGVsZXNzICk7XG5cbiAgICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgICAgLy8gYmVmb3JlIGFuZCBhZnRlciBmaXJzdC9sYXN0IGRyYXdhYmxlcyAob3V0c2lkZSBvZiBhbnkgcG90ZW50aWFsIGdyb3VwIGRyYXdhYmxlKVxuICAgICAgICB0aGlzLmF1ZGl0Q2hhbmdlSW50ZXJ2YWxzKCBvbGRGaXJzdERyYXdhYmxlLCBvbGRMYXN0RHJhd2FibGUsIHRoaXMuZmlyc3REcmF3YWJsZSwgdGhpcy5sYXN0RHJhd2FibGUgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBvdXIgc3ViLXRyZWUgd2FzIG5vdCB2aXNpdGVkLCBzaW5jZSB0aGVyZSB3ZXJlIG5vIHJlbGV2YW50IGNoYW5nZXMgdG8gaXQgKHRoYXQgbmVlZCBpbnN0YW5jZSBzeW5jaHJvbml6YXRpb25cbiAgICAgIC8vIG9yIGRyYXdhYmxlIGNoYW5nZXMpXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggJ3BydW5lZCcgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3BvbnNpYmxlIGZvciBzeW5jaW5nIGNoaWxkcmVuLCBjb25uZWN0aW5nIHRoZSBkcmF3YWJsZSBsaW5rZWQgbGlzdCBhcyBuZWVkZWQsIGFuZCBvdXRwdXR0aW5nIGNoYW5nZSBpbnRlcnZhbHNcbiAgICogYW5kIGZpcnN0L2xhc3QgZHJhd2FibGUgaW5mb3JtYXRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2VsZkNoYW5nZWRcbiAgICovXG4gIGxvY2FsU3luY1RyZWUoIHNlbGZDaGFuZ2VkICkge1xuICAgIGNvbnN0IGZyYW1lSWQgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XG5cbiAgICAvLyBsb2NhbCB2YXJpYWJsZXMsIHNpbmNlIHdlIGNhbid0IG92ZXJ3cml0ZSBvdXIgaW5zdGFuY2UgcHJvcGVydGllcyB5ZXRcbiAgICBsZXQgZmlyc3REcmF3YWJsZSA9IHRoaXMuc2VsZkRyYXdhYmxlOyAvLyBwb3NzaWJseSBudWxsXG4gICAgbGV0IGN1cnJlbnREcmF3YWJsZSA9IGZpcnN0RHJhd2FibGU7IC8vIHBvc3NpYmx5IG51bGxcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCA9PT0gbnVsbCAmJiB0aGlzLmxhc3RDaGFuZ2VJbnRlcnZhbCA9PT0gbnVsbCxcbiAgICAgICdzYW5pdHkgY2hlY2tzIHRoYXQgY2xlYW5TeW5jVHJlZVJlc3VsdHMgd2VyZSBjYWxsZWQnICk7XG5cbiAgICBsZXQgZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgaWYgKCBzZWxmQ2hhbmdlZCApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCAnc2VsZicgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cbiAgICBsZXQgY3VycmVudENoYW5nZUludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICBsZXQgbGFzdFVuY2hhbmdlZERyYXdhYmxlID0gc2VsZkNoYW5nZWQgPyBudWxsIDogdGhpcy5zZWxmRHJhd2FibGU7IC8vIHBvc3NpYmx5IG51bGxcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBsZXQgY2hpbGRJbnN0YW5jZSA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcblxuICAgICAgY29uc3QgaXNDb21wYXRpYmxlID0gY2hpbGRJbnN0YW5jZS5zeW5jVHJlZSgpO1xuICAgICAgaWYgKCAhaXNDb21wYXRpYmxlICkge1xuICAgICAgICBjaGlsZEluc3RhbmNlID0gdGhpcy51cGRhdGVJbmNvbXBhdGlibGVDaGlsZEluc3RhbmNlKCBjaGlsZEluc3RhbmNlLCBpICk7XG4gICAgICAgIGNoaWxkSW5zdGFuY2Uuc3luY1RyZWUoKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5jbHVkZUNoaWxkRHJhd2FibGVzID0gY2hpbGRJbnN0YW5jZS5zaG91bGRJbmNsdWRlSW5QYXJlbnREcmF3YWJsZXMoKTtcblxuICAgICAgLy9PSFRXTyBUT0RPOiBvbmx5IHN0cmlwIG91dCBpbnZpc2libGUgQ2FudmFzIGRyYXdhYmxlcywgd2hpbGUgbGVhdmluZyBTVkcgKHNpbmNlIHdlIGNhbiBtb3JlIGVmZmljaWVudGx5IGhpZGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIC8vIFNWRyB0cmVlcywgbWVtb3J5LXdpc2UpXG4gICAgICAvLyBoZXJlIHdlIHN0cmlwIG91dCBpbnZpc2libGUgZHJhd2FibGUgc2VjdGlvbnMgb3V0IG9mIHRoZSBkcmF3YWJsZSBsaW5rZWQgbGlzdFxuICAgICAgaWYgKCBpbmNsdWRlQ2hpbGREcmF3YWJsZXMgKSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBhbnkgZHJhd2FibGVzIGZvciB0aGF0IGNoaWxkLCBsaW5rIHRoZW0gdXAgaW4gb3VyIGxpbmtlZCBsaXN0XG4gICAgICAgIGlmICggY2hpbGRJbnN0YW5jZS5maXJzdERyYXdhYmxlICkge1xuICAgICAgICAgIGlmICggY3VycmVudERyYXdhYmxlICkge1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgYWxyZWFkeSBhbiBlbmQgb2YgdGhlIGxpbmtlZCBsaXN0LCBzbyBqdXN0IGFwcGVuZCB0byBpdFxuICAgICAgICAgICAgRHJhd2FibGUuY29ubmVjdERyYXdhYmxlcyggY3VycmVudERyYXdhYmxlLCBjaGlsZEluc3RhbmNlLmZpcnN0RHJhd2FibGUsIHRoaXMuZGlzcGxheSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0IG91dCB0aGUgbGlua2VkIGxpc3RcbiAgICAgICAgICAgIGZpcnN0RHJhd2FibGUgPSBjaGlsZEluc3RhbmNlLmZpcnN0RHJhd2FibGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbGFzdCBkcmF3YWJsZSBvZiB0aGUgbGlua2VkIGxpc3RcbiAgICAgICAgICBjdXJyZW50RHJhd2FibGUgPSBjaGlsZEluc3RhbmNlLmxhc3REcmF3YWJsZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICAgICAqIENoYW5nZSBpbnRlcnZhbHNcbiAgICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCBgY2hhbmdlcyBmb3IgJHtjaGlsZEluc3RhbmNlLnRvU3RyaW5nKClcbiAgICAgIH0gaW4gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICBjb25zdCB3YXNJbmNsdWRlZCA9IGNoaWxkSW5zdGFuY2Uuc3RpdGNoQ2hhbmdlSW5jbHVkZWQ7XG4gICAgICBjb25zdCBpc0luY2x1ZGVkID0gaW5jbHVkZUNoaWxkRHJhd2FibGVzO1xuICAgICAgY2hpbGRJbnN0YW5jZS5zdGl0Y2hDaGFuZ2VJbmNsdWRlZCA9IGlzSW5jbHVkZWQ7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCBgaW5jbHVkZWQ6ICR7d2FzSW5jbHVkZWR9ID0+ICR7aXNJbmNsdWRlZH1gICk7XG5cbiAgICAgIC8vIGNoZWNrIGZvciBmb3JjaW5nIGZ1bGwgY2hhbmdlLWludGVydmFsIG9uIGNoaWxkXG4gICAgICBpZiAoIGNoaWxkSW5zdGFuY2Uuc3RpdGNoQ2hhbmdlRnJhbWUgPT09IGZyYW1lSWQgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsKCAnc3RpdGNoQ2hhbmdlRnJhbWUgZnVsbCBjaGFuZ2UgaW50ZXJ2YWwnICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgICAvLyBlLmcuIGl0IHdhcyBhZGRlZCwgbW92ZWQsIG9yIGhhZCB2aXNpYmlsaXR5IGNoYW5nZXMuIHJlcXVpcmVzIGZ1bGwgY2hhbmdlIGludGVydmFsXG4gICAgICAgIGNoaWxkSW5zdGFuY2UuZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IGNoaWxkSW5zdGFuY2UubGFzdENoYW5nZUludGVydmFsID0gQ2hhbmdlSW50ZXJ2YWwubmV3Rm9yRGlzcGxheSggbnVsbCwgbnVsbCwgdGhpcy5kaXNwbGF5ICk7XG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggd2FzSW5jbHVkZWQgPT09IGlzSW5jbHVkZWQsXG4gICAgICAgICAgJ0lmIHdlIGRvIG5vdCBoYXZlIHN0aXRjaENoYW5nZUZyYW1lIGFjdGl2YXRlZCwgb3VyIGluY2x1c2lvbiBzaG91bGQgbm90IGhhdmUgY2hhbmdlZCcgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlyc3RDaGlsZENoYW5nZUludGVydmFsID0gY2hpbGRJbnN0YW5jZS5maXJzdENoYW5nZUludGVydmFsO1xuICAgICAgbGV0IGlzQmVmb3JlT3BlbiA9IGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCAmJiBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciA9PT0gbnVsbDtcbiAgICAgIGNvbnN0IGlzQWZ0ZXJPcGVuID0gZmlyc3RDaGlsZENoYW5nZUludGVydmFsICYmIGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA9PT0gbnVsbDtcbiAgICAgIGNvbnN0IG5lZWRzQnJpZGdlID0gY2hpbGRJbnN0YW5jZS5zdGl0Y2hDaGFuZ2VCZWZvcmUgPT09IGZyYW1lSWQgJiYgIWlzQmVmb3JlT3BlbiAmJiAhaXNBZnRlck9wZW47XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gaW5zZXJ0IGFuIGFkZGl0aW9uYWwgY2hhbmdlIGludGVydmFsIChicmlkZ2UpIHdoZW4gd2Ugbm90aWNlIGEgbGluayBpbiB0aGUgZHJhd2FibGUgbGlua2VkIGxpc3RcbiAgICAgIC8vIHdoZXJlIHRoZXJlIHdlcmUgbm9kZXMgdGhhdCBuZWVkZWQgc3RpdGNoIGNoYW5nZXMgdGhhdCBhcmVuJ3Qgc3RpbGwgY2hpbGRyZW4sIG9yIHdlcmUgbW92ZWQuIFdlIGNyZWF0ZSBhXG4gICAgICAvLyBcImJyaWRnZVwiIGNoYW5nZSBpbnRlcnZhbCB0byBzcGFuIHRoZSBnYXAgd2hlcmUgbm9kZXMgd2VyZSByZW1vdmVkLlxuICAgICAgaWYgKCBuZWVkc0JyaWRnZSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkNoYW5nZUludGVydmFsICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwoICdicmlkZ2UnICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5DaGFuZ2VJbnRlcnZhbCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgICBjb25zdCBicmlkZ2UgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBsYXN0VW5jaGFuZ2VkRHJhd2FibGUsIG51bGwsIHRoaXMuZGlzcGxheSApO1xuICAgICAgICBpZiAoIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsID0gYnJpZGdlO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCA9IGJyaWRnZTtcbiAgICAgICAgZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IGZpcnN0Q2hhbmdlSW50ZXJ2YWwgfHwgY3VycmVudENoYW5nZUludGVydmFsOyAvLyBzdG9yZSBpZiBpdCBpcyB0aGUgZmlyc3RcbiAgICAgICAgaXNCZWZvcmVPcGVuID0gdHJ1ZTtcblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXhjbHVkZSBjaGlsZCBpbnN0YW5jZXMgdGhhdCBhcmUgbm93IChhbmQgd2VyZSBiZWZvcmUpIG5vdCBpbmNsdWRlZC4gTk9URTogV2Ugc3RpbGwgbmVlZCB0byBpbmNsdWRlIHRob3NlIGluXG4gICAgICAvLyBicmlkZ2UgY2FsY3VsYXRpb25zLCBzaW5jZSBhIHJlbW92ZWQgKGJlZm9yZS1pbmNsdWRlZCkgaW5zdGFuY2UgY291bGQgYmUgYmV0d2VlbiB0d28gc3RpbGwtaW52aXNpYmxlXG4gICAgICAvLyBpbnN0YW5jZXMuXG4gICAgICBpZiAoIHdhc0luY2x1ZGVkIHx8IGlzSW5jbHVkZWQgKSB7XG4gICAgICAgIGlmICggaXNCZWZvcmVPcGVuICkge1xuICAgICAgICAgIC8vIHdlIHdhbnQgdG8gdHJ5IHRvIGdsdWUgb3VyIGxhc3QgQ2hhbmdlSW50ZXJ2YWwgdXBcbiAgICAgICAgICBpZiAoIGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAgICAgICAgIGlmICggZmlyc3RDaGlsZENoYW5nZUludGVydmFsLmRyYXdhYmxlQmVmb3JlID09PSBudWxsICkge1xuICAgICAgICAgICAgICAvLyB3ZSB3YW50IHRvIGdsdWUgZnJvbSBib3RoIHNpZGVzXG5cbiAgICAgICAgICAgICAgLy8gYmFzaWNhbGx5IGhhdmUgb3VyIGN1cnJlbnQgY2hhbmdlIGludGVydmFsIHJlcGxhY2UgdGhlIGNoaWxkJ3MgZmlyc3QgY2hhbmdlIGludGVydmFsXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID0gZmlyc3RDaGlsZENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXI7XG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCA9IGNoaWxkSW5zdGFuY2UubGFzdENoYW5nZUludGVydmFsID09PSBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgOiAvLyBzaW5jZSB3ZSBhcmUgcmVwbGFjaW5nLCBkb24ndCBnaXZlIGFuIG9yaWdpbiByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRJbnN0YW5jZS5sYXN0Q2hhbmdlSW50ZXJ2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gb25seSBhIGRlc2lyZSB0byBnbHVlIGZyb20gYmVmb3JlXG4gICAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID0gY2hpbGRJbnN0YW5jZS5maXJzdERyYXdhYmxlOyAvLyBlaXRoZXIgbnVsbCBvciB0aGUgY29ycmVjdCBkcmF3YWJsZVxuICAgICAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsID0gZmlyc3RDaGlsZENoYW5nZUludGVydmFsO1xuICAgICAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgPSBjaGlsZEluc3RhbmNlLmxhc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBubyBjaGFuZ2VzIHRvIHRoZSBjaGlsZC4gZ3JhYnMgdGhlIGZpcnN0IGRyYXdhYmxlIHJlZmVyZW5jZSBpdCBjYW5cbiAgICAgICAgICAgIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID0gY2hpbGRJbnN0YW5jZS5maXJzdERyYXdhYmxlOyAvLyBlaXRoZXIgbnVsbCBvciB0aGUgY29ycmVjdCBkcmF3YWJsZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggZmlyc3RDaGlsZENoYW5nZUludGVydmFsICkge1xuICAgICAgICAgIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsIHx8IGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbDsgLy8gc3RvcmUgaWYgaXQgaXMgdGhlIGZpcnN0XG4gICAgICAgICAgaWYgKCBmaXJzdENoaWxkQ2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPT09IG51bGwgKSB7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhY3VycmVudENoYW5nZUludGVydmFsIHx8IGxhc3RVbmNoYW5nZWREcmF3YWJsZSxcbiAgICAgICAgICAgICAgJ0lmIHdlIGhhdmUgYSBjdXJyZW50IGNoYW5nZSBpbnRlcnZhbCwgd2Ugc2hvdWxkIGJlIGd1YXJhbnRlZWQgYSBub24tbnVsbCAnICtcbiAgICAgICAgICAgICAgJ2xhc3RVbmNoYW5nZWREcmF3YWJsZScgKTtcbiAgICAgICAgICAgIGZpcnN0Q2hpbGRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA9IGxhc3RVbmNoYW5nZWREcmF3YWJsZTsgLy8gZWl0aGVyIG51bGwgb3IgdGhlIGNvcnJlY3QgZHJhd2FibGVcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgKSB7XG4gICAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsID0gZmlyc3RDaGlsZENoYW5nZUludGVydmFsO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgPSBjaGlsZEluc3RhbmNlLmxhc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICAgICAgfVxuICAgICAgICBsYXN0VW5jaGFuZ2VkRHJhd2FibGUgPSAoIGN1cnJlbnRDaGFuZ2VJbnRlcnZhbCAmJiBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciA9PT0gbnVsbCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggY2hpbGRJbnN0YW5jZS5sYXN0RHJhd2FibGUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkSW5zdGFuY2UubGFzdERyYXdhYmxlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0VW5jaGFuZ2VkRHJhd2FibGUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIGxhc3QgaW5zdGFuY2UsIGNoZWNrIGZvciBwb3N0LWJyaWRnZVxuICAgICAgaWYgKCBpID09PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgIGlmICggY2hpbGRJbnN0YW5jZS5zdGl0Y2hDaGFuZ2VBZnRlciA9PT0gZnJhbWVJZCAmJiAhKCBjdXJyZW50Q2hhbmdlSW50ZXJ2YWwgJiYgY3VycmVudENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXIgPT09IG51bGwgKSApIHtcbiAgICAgICAgICBjb25zdCBlbmRpbmdCcmlkZ2UgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBsYXN0VW5jaGFuZ2VkRHJhd2FibGUsIG51bGwsIHRoaXMuZGlzcGxheSApO1xuICAgICAgICAgIGlmICggY3VycmVudENoYW5nZUludGVydmFsICkge1xuICAgICAgICAgICAgY3VycmVudENoYW5nZUludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCA9IGVuZGluZ0JyaWRnZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudENoYW5nZUludGVydmFsID0gZW5kaW5nQnJpZGdlO1xuICAgICAgICAgIGZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsIHx8IGN1cnJlbnRDaGFuZ2VJbnRlcnZhbDsgLy8gc3RvcmUgaWYgaXQgaXMgdGhlIGZpcnN0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY2xlYW4gdXAgdGhlIG1ldGFkYXRhIG9uIG91ciBjaGlsZCAoY2FuJ3QgYmUgZG9uZSBpbiB0aGUgY2hpbGQgY2FsbCwgc2luY2Ugd2UgdXNlIHRoZXNlIHZhbHVlcyBsaWtlIGFcbiAgICAgIC8vIGNvbXBvc2l0ZSByZXR1cm4gdmFsdWUpXG4gICAgICAvL09IVFdPIFRPRE86IG9ubHkgZG8gdGhpcyBvbiBpbnN0YW5jZXMgdGhhdCB3ZXJlIGFjdHVhbGx5IHRyYXZlcnNlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgY2hpbGRJbnN0YW5jZS5jbGVhblN5bmNUcmVlUmVzdWx0cygpO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuQ2hhbmdlSW50ZXJ2YWwgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG5cbiAgICAvLyBpdCdzIHJlYWxseSB0aGUgZWFzaWVzdCB3YXkgdG8gY29tcGFyZSBpZiB0d28gdGhpbmdzIChjYXN0ZWQgdG8gYm9vbGVhbnMpIGFyZSB0aGUgc2FtZT9cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIWZpcnN0Q2hhbmdlSW50ZXJ2YWwgPT09ICEhY3VycmVudENoYW5nZUludGVydmFsLFxuICAgICAgJ1ByZXNlbmNlIG9mIGZpcnN0IGFuZCBjdXJyZW50IGNoYW5nZSBpbnRlcnZhbHMgc2hvdWxkIGJlIGVxdWFsJyApO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGFyZSBlbXB0aWVkIGFuZCBtYXJrZWQgYXMgY2hhbmdlZCAoYnV0IHdpdGhvdXQgY2hhbmdlIGludGVydmFscykuIFRoaXMgc2hvdWxkIGltcGx5IHdlIGhhdmVcbiAgICAvLyBubyBjaGlsZHJlbiAoYW5kIHRodXMgbm8gc3RpdGNoQ2hhbmdlQmVmb3JlIC8gc3RpdGNoQ2hhbmdlQWZ0ZXIgdG8gdXNlKSwgc28gd2UnbGwgd2FudCB0byBjcmVhdGUgYSBjaGFuZ2VcbiAgICAvLyBpbnRlcnZhbCB0byBjb3ZlciBvdXIgZW50aXJlIHJhbmdlLlxuICAgIGlmICggIWZpcnN0Q2hhbmdlSW50ZXJ2YWwgJiYgdGhpcy5zdGl0Y2hDaGFuZ2VPbkNoaWxkcmVuID09PSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQgJiYgdGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDAgKSB7XG4gICAgICBmaXJzdENoYW5nZUludGVydmFsID0gY3VycmVudENoYW5nZUludGVydmFsID0gQ2hhbmdlSW50ZXJ2YWwubmV3Rm9yRGlzcGxheSggbnVsbCwgbnVsbCwgdGhpcy5kaXNwbGF5ICk7XG4gICAgfVxuXG4gICAgLy8gc3RvcmUgb3VyIHJlc3VsdHNcbiAgICAvLyBOT1RFOiB0aGVzZSBtYXkgZ2V0IG92ZXJ3cml0dGVuIHdpdGggdGhlIGdyb3VwIGNoYW5nZSBpbnRlcnZhbHMgKGluIHRoYXQgY2FzZSwgZ3JvdXBTeW5jVHJlZSB3aWxsIHJlYWQgZnJvbSB0aGVzZSlcbiAgICB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsO1xuICAgIHRoaXMubGFzdENoYW5nZUludGVydmFsID0gY3VycmVudENoYW5nZUludGVydmFsO1xuXG4gICAgLy8gTk9URTogdGhlc2UgbWF5IGdldCBvdmVyd3JpdHRlbiB3aXRoIHRoZSBncm91cCBkcmF3YWJsZSAoaW4gdGhhdCBjYXNlLCBncm91cFN5bmNUcmVlIHdpbGwgcmVhZCBmcm9tIHRoZXNlKVxuICAgIHRoaXMuZmlyc3REcmF3YWJsZSA9IHRoaXMuZmlyc3RJbm5lckRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcbiAgICB0aGlzLmxhc3REcmF3YWJsZSA9IHRoaXMubGFzdElubmVyRHJhd2FibGUgPSBjdXJyZW50RHJhd2FibGU7IC8vIGVpdGhlciBudWxsLCBvciB0aGUgZHJhd2FibGUgaXRzZWxmXG5cbiAgICAvLyBlbnN1cmUgdGhhdCBvdXIgZmlyc3REcmF3YWJsZSBhbmQgbGFzdERyYXdhYmxlIGFyZSBjb3JyZWN0XG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgbGV0IGZpcnN0RHJhd2FibGVDaGVjayA9IG51bGw7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaisrICkge1xuICAgICAgICBpZiAoIHRoaXMuY2hpbGRyZW5bIGogXS5zaG91bGRJbmNsdWRlSW5QYXJlbnREcmF3YWJsZXMoKSAmJiB0aGlzLmNoaWxkcmVuWyBqIF0uZmlyc3REcmF3YWJsZSApIHtcbiAgICAgICAgICBmaXJzdERyYXdhYmxlQ2hlY2sgPSB0aGlzLmNoaWxkcmVuWyBqIF0uZmlyc3REcmF3YWJsZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLnNlbGZEcmF3YWJsZSApIHtcbiAgICAgICAgZmlyc3REcmF3YWJsZUNoZWNrID0gdGhpcy5zZWxmRHJhd2FibGU7XG4gICAgICB9XG5cbiAgICAgIGxldCBsYXN0RHJhd2FibGVDaGVjayA9IHRoaXMuc2VsZkRyYXdhYmxlO1xuICAgICAgZm9yICggbGV0IGsgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGsgPj0gMDsgay0tICkge1xuICAgICAgICBpZiAoIHRoaXMuY2hpbGRyZW5bIGsgXS5zaG91bGRJbmNsdWRlSW5QYXJlbnREcmF3YWJsZXMoKSAmJiB0aGlzLmNoaWxkcmVuWyBrIF0ubGFzdERyYXdhYmxlICkge1xuICAgICAgICAgIGxhc3REcmF3YWJsZUNoZWNrID0gdGhpcy5jaGlsZHJlblsgayBdLmxhc3REcmF3YWJsZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhc3NlcnRTbG93KCBmaXJzdERyYXdhYmxlQ2hlY2sgPT09IHRoaXMuZmlyc3REcmF3YWJsZSApO1xuICAgICAgYXNzZXJ0U2xvdyggbGFzdERyYXdhYmxlQ2hlY2sgPT09IHRoaXMubGFzdERyYXdhYmxlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIG5lY2Vzc2FyeSwgY3JlYXRlL3JlcGxhY2UvcmVtb3ZlIG91ciBzZWxmRHJhd2FibGUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIHNlbGZEcmF3YWJsZSBjaGFuZ2VkXG4gICAqL1xuICB1cGRhdGVTZWxmRHJhd2FibGUoKSB7XG4gICAgaWYgKCB0aGlzLm5vZGUuaXNQYWludGVkKCkgKSB7XG4gICAgICBjb25zdCBzZWxmUmVuZGVyZXIgPSB0aGlzLnNlbGZSZW5kZXJlcjsgLy8gb3VyIG5ldyBzZWxmIHJlbmRlcmVyIGJpdG1hc2tcblxuICAgICAgLy8gYml0d2lzZSB0cmljaywgc2luY2Ugb25seSBvbmUgb2YgQ2FudmFzL1NWRy9ET00vV2ViR0wvZXRjLiBmbGFncyB3aWxsIGJlIGNob3NlbiwgYW5kIGJpdG1hc2tSZW5kZXJlckFyZWEgaXNcbiAgICAgIC8vIHRoZSBtYXNrIGZvciB0aG9zZSBmbGFncy4gSW4gRW5nbGlzaCwgXCJJcyB0aGUgY3VycmVudCBzZWxmRHJhd2FibGUgY29tcGF0aWJsZSB3aXRoIG91ciBzZWxmUmVuZGVyZXIgKGlmIGFueSksXG4gICAgICAvLyBvciBkbyB3ZSBuZWVkIHRvIGNyZWF0ZSBhIHNlbGZEcmF3YWJsZT9cIlxuICAgICAgLy9PSFRXTyBUT0RPOiBGb3IgQ2FudmFzLCB3ZSB3b24ndCBjYXJlIGFib3V0IGFueXRoaW5nIGVsc2UgZm9yIHRoZSBkcmF3YWJsZSwgYnV0IGZvciBET00gd2UgY2FyZSBhYm91dCB0aGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIC8vIGZvcmNlLWFjY2VsZXJhdGlvbiBmbGFnISBUaGF0J3Mgc3RyaXBwZWQgb3V0IGhlcmUuXG4gICAgICBpZiAoICF0aGlzLnNlbGZEcmF3YWJsZSB8fCAoICggdGhpcy5zZWxmRHJhd2FibGUucmVuZGVyZXIgJiBzZWxmUmVuZGVyZXIgJiBSZW5kZXJlci5iaXRtYXNrUmVuZGVyZXJBcmVhICkgPT09IDAgKSApIHtcbiAgICAgICAgaWYgKCB0aGlzLnNlbGZEcmF3YWJsZSApIHtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYHJlcGxhY2luZyBvbGQgZHJhd2FibGUgJHt0aGlzLnNlbGZEcmF3YWJsZS50b1N0cmluZygpfSB3aXRoIG5ldyByZW5kZXJlcmAgKTtcblxuICAgICAgICAgIC8vIHNjcmFwIHRoZSBwcmV2aW91cyBzZWxmRHJhd2FibGUsIHdlIG5lZWQgdG8gY3JlYXRlIG9uZSB3aXRoIGEgZGlmZmVyZW50IHJlbmRlcmVyLlxuICAgICAgICAgIHRoaXMuc2VsZkRyYXdhYmxlLm1hcmtGb3JEaXNwb3NhbCggdGhpcy5kaXNwbGF5ICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbGZEcmF3YWJsZSA9IFJlbmRlcmVyLmNyZWF0ZVNlbGZEcmF3YWJsZSggdGhpcywgdGhpcy5ub2RlLCBzZWxmUmVuZGVyZXIsIHRoaXMuZml0dGFiaWxpdHkuYW5jZXN0b3JzRml0dGFibGUgKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zZWxmRHJhd2FibGUgKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGZEcmF3YWJsZSA9PT0gbnVsbCwgJ05vbi1wYWludGVkIG5vZGVzIHNob3VsZCBub3QgaGF2ZSBhIHNlbGZEcmF3YWJsZScgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdXAtdG8tZGF0ZSBpbnN0YW5jZS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gY2hpbGRJbnN0YW5jZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICogQHJldHVybnMge0luc3RhbmNlfVxuICAgKi9cbiAgdXBkYXRlSW5jb21wYXRpYmxlQ2hpbGRJbnN0YW5jZSggY2hpbGRJbnN0YW5jZSwgaW5kZXggKSB7XG4gICAgaWYgKCBzY2VuZXJ5TG9nICYmIHNjZW5lcnkuaXNMb2dnaW5nUGVyZm9ybWFuY2UoKSApIHtcbiAgICAgIGNvbnN0IGFmZmVjdGVkSW5zdGFuY2VDb3VudCA9IGNoaWxkSW5zdGFuY2UuZ2V0RGVzY2VuZGFudENvdW50KCkgKyAxOyAvLyArMSBmb3IgaXRzZWxmXG5cbiAgICAgIGlmICggYWZmZWN0ZWRJbnN0YW5jZUNvdW50ID4gMTAwICkge1xuICAgICAgICBzY2VuZXJ5TG9nLlBlcmZDcml0aWNhbCAmJiBzY2VuZXJ5TG9nLlBlcmZDcml0aWNhbCggYGluY29tcGF0aWJsZSBpbnN0YW5jZSByZWJ1aWxkIGF0ICR7dGhpcy50cmFpbC50b1BhdGhTdHJpbmcoKX06ICR7YWZmZWN0ZWRJbnN0YW5jZUNvdW50fWAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBhZmZlY3RlZEluc3RhbmNlQ291bnQgPiA0MCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWFqb3IgJiYgc2NlbmVyeUxvZy5QZXJmTWFqb3IoIGBpbmNvbXBhdGlibGUgaW5zdGFuY2UgcmVidWlsZCBhdCAke3RoaXMudHJhaWwudG9QYXRoU3RyaW5nKCl9OiAke2FmZmVjdGVkSW5zdGFuY2VDb3VudH1gICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggYWZmZWN0ZWRJbnN0YW5jZUNvdW50ID4gMCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5QZXJmTWlub3IgJiYgc2NlbmVyeUxvZy5QZXJmTWlub3IoIGBpbmNvbXBhdGlibGUgaW5zdGFuY2UgcmVidWlsZCBhdCAke3RoaXMudHJhaWwudG9QYXRoU3RyaW5nKCl9OiAke2FmZmVjdGVkSW5zdGFuY2VDb3VudH1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbWFyayBpdCBmb3IgZGlzcG9zYWxcbiAgICB0aGlzLmRpc3BsYXkubWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsKCBjaGlsZEluc3RhbmNlICk7XG5cbiAgICAvLyBzd2FwIGluIGEgbmV3IGluc3RhbmNlXG4gICAgY29uc3QgcmVwbGFjZW1lbnRJbnN0YW5jZSA9IEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLmRpc3BsYXksIHRoaXMudHJhaWwuY29weSgpLmFkZERlc2NlbmRhbnQoIGNoaWxkSW5zdGFuY2Uubm9kZSwgaW5kZXggKSwgZmFsc2UsIGZhbHNlICk7XG4gICAgdGhpcy5yZXBsYWNlSW5zdGFuY2VXaXRoSW5kZXgoIGNoaWxkSW5zdGFuY2UsIHJlcGxhY2VtZW50SW5zdGFuY2UsIGluZGV4ICk7XG4gICAgcmV0dXJuIHJlcGxhY2VtZW50SW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB3YXNTdGF0ZWxlc3NcbiAgICovXG4gIGdyb3VwU3luY1RyZWUoIHdhc1N0YXRlbGVzcyApIHtcbiAgICBjb25zdCBncm91cFJlbmRlcmVyID0gdGhpcy5ncm91cFJlbmRlcmVyO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5pc0JhY2tib25lID8gMSA6IDAgKSArXG4gICAgICAgICAgICAgICAgICAgICAgKCB0aGlzLmlzSW5zdGFuY2VDYW52YXNDYWNoZSA/IDEgOiAwICkgK1xuICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlU2VsZiA/IDEgOiAwICkgPT09ICggZ3JvdXBSZW5kZXJlciA/IDEgOiAwICksXG4gICAgICAnV2Ugc2hvdWxkIGhhdmUgcHJlY2lzZWx5IG9uZSBvZiB0aGVzZSBmbGFncyBzZXQgZm9yIHVzIHRvIGhhdmUgYSBncm91cFJlbmRlcmVyJyApO1xuXG4gICAgLy8gaWYgd2Ugc3dpdGNoZWQgdG8vYXdheSBmcm9tIGEgZ3JvdXAsIG91ciBncm91cCB0eXBlIGNoYW5nZWQsIG9yIG91ciBncm91cCByZW5kZXJlciBjaGFuZ2VkXG4gICAgY29uc3QgZ3JvdXBDaGFuZ2VkID0gKCAhIWdyb3VwUmVuZGVyZXIgIT09ICEhdGhpcy5ncm91cERyYXdhYmxlICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAoICF3YXNTdGF0ZWxlc3MgJiYgdGhpcy5ncm91cENoYW5nZWQgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5ncm91cERyYXdhYmxlICYmIHRoaXMuZ3JvdXBEcmF3YWJsZS5yZW5kZXJlciAhPT0gZ3JvdXBSZW5kZXJlciApO1xuXG4gICAgLy8gaWYgdGhlcmUgaXMgYSBjaGFuZ2UsIHByZXBhcmVcbiAgICBpZiAoIGdyb3VwQ2hhbmdlZCApIHtcbiAgICAgIGlmICggdGhpcy5ncm91cERyYXdhYmxlICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYHJlcGxhY2luZyBncm91cCBkcmF3YWJsZSAke3RoaXMuZ3JvdXBEcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUubWFya0ZvckRpc3Bvc2FsKCB0aGlzLmRpc3BsYXkgKTtcbiAgICAgICAgdGhpcy5ncm91cERyYXdhYmxlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gY2hhbmdlIGV2ZXJ5dGhpbmcsIHNpbmNlIHdlIG1heSBuZWVkIGEgZnVsbCByZXN0aXRjaFxuICAgICAgdGhpcy5maXJzdENoYW5nZUludGVydmFsID0gdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcbiAgICB9XG5cbiAgICBpZiAoIGdyb3VwUmVuZGVyZXIgKSB7XG4gICAgICAvLyBlbnN1cmUgb3VyIGxpbmtlZCBsaXN0IGlzIGZ1bGx5IGRpc2Nvbm5lY3RlZCBmcm9tIG90aGVyc1xuICAgICAgdGhpcy5maXJzdERyYXdhYmxlICYmIERyYXdhYmxlLmRpc2Nvbm5lY3RCZWZvcmUoIHRoaXMuZmlyc3REcmF3YWJsZSwgdGhpcy5kaXNwbGF5ICk7XG4gICAgICB0aGlzLmxhc3REcmF3YWJsZSAmJiBEcmF3YWJsZS5kaXNjb25uZWN0QWZ0ZXIoIHRoaXMubGFzdERyYXdhYmxlLCB0aGlzLmRpc3BsYXkgKTtcblxuICAgICAgaWYgKCB0aGlzLmlzQmFja2JvbmUgKSB7XG4gICAgICAgIGlmICggZ3JvdXBDaGFuZ2VkICkge1xuICAgICAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZSA9IEJhY2tib25lRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHRoaXMuZGlzcGxheSwgdGhpcywgdGhpcy5nZXRUcmFuc2Zvcm1Sb290SW5zdGFuY2UoKSwgZ3JvdXBSZW5kZXJlciwgdGhpcy5pc0Rpc3BsYXlSb290ICk7XG5cbiAgICAgICAgICBpZiAoIHRoaXMuaXNUcmFuc2Zvcm1lZCApIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5tYXJrVHJhbnNmb3JtUm9vdERpcnR5KCB0aGlzLCB0cnVlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgKSB7XG4gICAgICAgICAgdGhpcy5ncm91cERyYXdhYmxlLnN0aXRjaCggdGhpcy5maXJzdERyYXdhYmxlLCB0aGlzLmxhc3REcmF3YWJsZSwgdGhpcy5maXJzdENoYW5nZUludGVydmFsLCB0aGlzLmxhc3RDaGFuZ2VJbnRlcnZhbCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5pc0luc3RhbmNlQ2FudmFzQ2FjaGUgKSB7XG4gICAgICAgIGlmICggZ3JvdXBDaGFuZ2VkICkge1xuICAgICAgICAgIHRoaXMuZ3JvdXBEcmF3YWJsZSA9IElubGluZUNhbnZhc0NhY2hlRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIGdyb3VwUmVuZGVyZXIsIHRoaXMgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUuc3RpdGNoKCB0aGlzLmZpcnN0RHJhd2FibGUsIHRoaXMubGFzdERyYXdhYmxlLCB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwsIHRoaXMubGFzdENoYW5nZUludGVydmFsICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmICkge1xuICAgICAgICBpZiAoIGdyb3VwQ2hhbmdlZCApIHtcbiAgICAgICAgICB0aGlzLmdyb3VwRHJhd2FibGUgPSBDYW52YXNCbG9jay5jcmVhdGVGcm9tUG9vbCggZ3JvdXBSZW5kZXJlciwgdGhpcyApO1xuICAgICAgICB9XG4gICAgICAgIC8vT0hUV08gVE9ETzogcmVzdGl0Y2ggaGVyZT8/PyBpbXBsZW1lbnQgaXQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIH1cbiAgICAgIC8vIFVwZGF0ZSB0aGUgZml0dGFibGUgZmxhZ1xuICAgICAgdGhpcy5ncm91cERyYXdhYmxlLnNldEZpdHRhYmxlKCB0aGlzLmZpdHRhYmlsaXR5LmFuY2VzdG9yc0ZpdHRhYmxlICk7XG5cbiAgICAgIHRoaXMuZmlyc3REcmF3YWJsZSA9IHRoaXMubGFzdERyYXdhYmxlID0gdGhpcy5ncm91cERyYXdhYmxlO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBpbnRlcnZhbCBoYW5kbGluZ1xuICAgIGlmICggZ3JvdXBDaGFuZ2VkICkge1xuICAgICAgLy8gaWYgb3VyIGdyb3VwIHN0YXR1cyBjaGFuZ2VkLCBtYXJrIEVWRVJZVEhJTkcgYXMgcG90ZW50aWFsbHkgY2hhbmdlZFxuICAgICAgdGhpcy5maXJzdENoYW5nZUludGVydmFsID0gdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBDaGFuZ2VJbnRlcnZhbC5uZXdGb3JEaXNwbGF5KCBudWxsLCBudWxsLCB0aGlzLmRpc3BsYXkgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGdyb3VwUmVuZGVyZXIgKSB7XG4gICAgICAvLyBvdXIgZ3JvdXAgZGlkbid0IGhhdmUgdG8gY2hhbmdlIGF0IGFsbCwgc28gd2UgcHJldmVudCBhbnkgY2hhbmdlIGludGVydmFsc1xuICAgICAgdGhpcy5maXJzdENoYW5nZUludGVydmFsID0gdGhpcy5sYXN0Q2hhbmdlSW50ZXJ2YWwgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2hhcmVkU3luY1RyZWUoKSB7XG4gICAgLy9PSFRXTyBUT0RPOiB3ZSBhcmUgcHJvYmFibHkgbWlzc2luZyBzeW5jVHJlZSBmb3Igc2hhcmVkIHRyZWVzIHByb3Blcmx5IHdpdGggcHJ1bmluZy4gaW52ZXN0aWdhdGUhISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgdGhpcy5lbnN1cmVTaGFyZWRDYWNoZUluaXRpYWxpemVkKCk7XG5cbiAgICBjb25zdCBzaGFyZWRDYWNoZVJlbmRlcmVyID0gdGhpcy5zaGFyZWRDYWNoZVJlbmRlcmVyO1xuXG4gICAgaWYgKCAhdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlIHx8IHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZS5yZW5kZXJlciAhPT0gc2hhcmVkQ2FjaGVSZW5kZXJlciApIHtcbiAgICAgIC8vT0hUV08gVE9ETzogbWFyayBldmVyeXRoaW5nIGFzIGNoYW5nZWQgKGJpZyBjaGFuZ2UgaW50ZXJ2YWwpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICAgIGlmICggdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggYHJlcGxhY2luZyBzaGFyZWQgY2FjaGUgZHJhd2FibGUgJHt0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG5cbiAgICAgICAgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLm1hcmtGb3JEaXNwb3NhbCggdGhpcy5kaXNwbGF5ICk7XG4gICAgICB9XG5cbiAgICAgIC8vT0hUV08gVE9ETzogYWN0dWFsbHkgY3JlYXRlIHRoZSBwcm9wZXIgc2hhcmVkIGNhY2hlIGRyYXdhYmxlIGRlcGVuZGluZyBvbiB0aGUgc3BlY2lmaWVkIHJlbmRlcmVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAvLyAodXBkYXRlIGl0IGlmIG5lY2Vzc2FyeSlcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZSA9IG5ldyBTaGFyZWRDYW52YXNDYWNoZURyYXdhYmxlKCB0aGlzLnRyYWlsLCBzaGFyZWRDYWNoZVJlbmRlcmVyLCB0aGlzLCB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgKTtcbiAgICAgIHRoaXMuZmlyc3REcmF3YWJsZSA9IHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZTtcbiAgICAgIHRoaXMubGFzdERyYXdhYmxlID0gdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlO1xuXG4gICAgICAvLyBiYXNpY2FsbHkgZXZlcnl0aGluZyBjaGFuZ2VkIG5vdywgYW5kIHdvbid0IGZyb20gbm93IG9uXG4gICAgICB0aGlzLmZpcnN0Q2hhbmdlSW50ZXJ2YWwgPSB0aGlzLmxhc3RDaGFuZ2VJbnRlcnZhbCA9IENoYW5nZUludGVydmFsLm5ld0ZvckRpc3BsYXkoIG51bGwsIG51bGwsIHRoaXMuZGlzcGxheSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHdhc1N0YXRlbGVzc1xuICAgKi9cbiAgcHJlcGFyZUNoaWxkSW5zdGFuY2VzKCB3YXNTdGF0ZWxlc3MgKSB7XG4gICAgLy8gbWFyayBhbGwgcmVtb3ZlZCBpbnN0YW5jZXMgdG8gYmUgZGlzcG9zZWQgKGFsb25nIHdpdGggdGhlaXIgc3VidHJlZXMpXG4gICAgd2hpbGUgKCB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdC5sZW5ndGggKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZVRvTWFyayA9IHRoaXMuaW5zdGFuY2VSZW1vdmFsQ2hlY2tMaXN0LnBvcCgpO1xuICAgICAgaWYgKCBpbnN0YW5jZVRvTWFyay5hZGRSZW1vdmVDb3VudGVyID09PSAtMSApIHtcbiAgICAgICAgaW5zdGFuY2VUb01hcmsuYWRkUmVtb3ZlQ291bnRlciA9IDA7IC8vIHJlc2V0IGl0LCBzbyB3ZSBkb24ndCBtYXJrIGl0IGZvciBkaXNwb3NhbCBtb3JlIHRoYW4gb25jZVxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsKCBpbnN0YW5jZVRvTWFyayApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggd2FzU3RhdGVsZXNzICkge1xuICAgICAgLy8gd2UgbmVlZCB0byBjcmVhdGUgYWxsIG9mIHRoZSBjaGlsZCBpbnN0YW5jZXNcbiAgICAgIGZvciAoIGxldCBrID0gMDsgayA8IHRoaXMubm9kZS5jaGlsZHJlbi5sZW5ndGg7IGsrKyApIHtcbiAgICAgICAgLy8gY3JlYXRlIGEgY2hpbGQgaW5zdGFuY2VcbiAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLm5vZGUuY2hpbGRyZW5bIGsgXTtcbiAgICAgICAgdGhpcy5hcHBlbmRJbnN0YW5jZSggSW5zdGFuY2UuY3JlYXRlRnJvbVBvb2woIHRoaXMuZGlzcGxheSwgdGhpcy50cmFpbC5jb3B5KCkuYWRkRGVzY2VuZGFudCggY2hpbGQsIGsgKSwgZmFsc2UsIGZhbHNlICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVuc3VyZVNoYXJlZENhY2hlSW5pdGlhbGl6ZWQoKSB7XG4gICAgLy8gd2Ugb25seSBuZWVkIHRvIGluaXRpYWxpemUgdGhpcyBzaGFyZWQgY2FjaGUgcmVmZXJlbmNlIG9uY2VcbiAgICBpZiAoICF0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZUtleSA9IHRoaXMubm9kZS5nZXRJZCgpO1xuICAgICAgLy8gVE9ETzogaGF2ZSB0aGlzIGFic3RyYWN0ZWQgYXdheSBpbiB0aGUgRGlzcGxheT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZSA9IHRoaXMuZGlzcGxheS5fc2hhcmVkQ2FudmFzSW5zdGFuY2VzWyBpbnN0YW5jZUtleSBdO1xuXG4gICAgICAvLyBUT0RPOiBpbmNyZW1lbnQgcmVmZXJlbmNlIGNvdW50aW5nPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgaWYgKCAhdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlICkge1xuICAgICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgPSBJbnN0YW5jZS5jcmVhdGVGcm9tUG9vbCggdGhpcy5kaXNwbGF5LCBuZXcgVHJhaWwoIHRoaXMubm9kZSApLCBmYWxzZSwgdHJ1ZSApO1xuICAgICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2Uuc3luY1RyZWUoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5Ll9zaGFyZWRDYW52YXNJbnN0YW5jZXNbIGluc3RhbmNlS2V5IF0gPSB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2U7XG4gICAgICAgIC8vIFRPRE86IHJlZmVyZW5jZSBjb3VudGluZz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgICAgICAvLyBUT0RPOiB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuaXNUcmFuc2Zvcm1lZD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgICAgICAvL09IVFdPIFRPRE86IGlzIHRoaXMgbmVjZXNzYXJ5PyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICB0aGlzLmRpc3BsYXkubWFya1RyYW5zZm9ybVJvb3REaXJ0eSggdGhpcy5zaGFyZWRDYWNoZUluc3RhbmNlLCB0cnVlICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2hhcmVkQ2FjaGVJbnN0YW5jZS5leHRlcm5hbFJlZmVyZW5jZUNvdW50Kys7XG5cbiAgICAgIC8vT0hUV08gVE9ETzogaXMgdGhpcyBuZWNlc3Nhcnk/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIHRoaXMuaXNUcmFuc2Zvcm1lZCApIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5Lm1hcmtUcmFuc2Zvcm1Sb290RGlydHkoIHRoaXMsIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciBvdXQgZHJhd2FibGVzIChmcm9tIGZpcnN0RHJhd2FibGUgdG8gbGFzdERyYXdhYmxlKSBzaG91bGQgYmUgaW5jbHVkZWQgaW4gb3VyIHBhcmVudCdzIGRyYXdhYmxlc1xuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHNob3VsZEluY2x1ZGVJblBhcmVudERyYXdhYmxlcygpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLmlzVmlzaWJsZSgpIHx8ICF0aGlzLm5vZGUuaXNFeGNsdWRlSW52aXNpYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGNsb3Nlc3QgZHJhd2FibGUgKG5vdCBpbmNsdWRpbmcgdGhlIGNoaWxkIGluc3RhbmNlIGF0IGNoaWxkSW5kZXgpIHVzaW5nIGxhc3REcmF3YWJsZSwgb3IgbnVsbFxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBUT0RPOiBjaGVjayB1c2FnZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNoaWxkSW5kZXhcbiAgICogQHJldHVybnMge0RyYXdhYmxlfG51bGx9XG4gICAqL1xuICBmaW5kUHJldmlvdXNEcmF3YWJsZSggY2hpbGRJbmRleCApIHtcbiAgICBmb3IgKCBsZXQgaSA9IGNoaWxkSW5kZXggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHRoaXMuY2hpbGRyZW5bIGkgXS5sYXN0RHJhd2FibGU7XG4gICAgICBpZiAoIG9wdGlvbiAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgY2xvc2VzdCBkcmF3YWJsZSAobm90IGluY2x1ZGluZyB0aGUgY2hpbGQgaW5zdGFuY2UgYXQgY2hpbGRJbmRleCkgdXNpbmcgbmV4dERyYXdhYmxlLCBvciBudWxsXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFRPRE86IGNoZWNrIHVzYWdlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gY2hpbGRJbmRleFxuICAgKiBAcmV0dXJucyB7RHJhd2FibGV8bnVsbH1cbiAgICovXG4gIGZpbmROZXh0RHJhd2FibGUoIGNoaWxkSW5kZXggKSB7XG4gICAgY29uc3QgbGVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSBjaGlsZEluZGV4ICsgMTsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5jaGlsZHJlblsgaSBdLmZpcnN0RHJhd2FibGU7XG4gICAgICBpZiAoIG9wdGlvbiAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBDaGlsZHJlbiBoYW5kbGluZ1xuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKi9cbiAgYXBwZW5kSW5zdGFuY2UoIGluc3RhbmNlICkge1xuICAgIHRoaXMuaW5zZXJ0SW5zdGFuY2UoIGluc3RhbmNlLCB0aGlzLmNoaWxkcmVuLmxlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIE5PVEU6IGRpZmZlcmVudCBwYXJhbWV0ZXIgb3JkZXIgY29tcGFyZWQgdG8gTm9kZVxuICAgKlxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICovXG4gIGluc2VydEluc3RhbmNlKCBpbnN0YW5jZSwgaW5kZXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UgaW5zdGFuY2VvZiBJbnN0YW5jZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAgJiYgaW5kZXggPD0gdGhpcy5jaGlsZHJlbi5sZW5ndGgsXG4gICAgICBgSW5zdGFuY2UgaW5zZXJ0aW9uIGJvdW5kcyBjaGVjayBmb3IgaW5kZXggJHtpbmRleH0gd2l0aCBwcmV2aW91cyBjaGlsZHJlbiBsZW5ndGggJHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5sZW5ndGh9YCApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZShcbiAgICAgIGBpbnNlcnRpbmcgJHtpbnN0YW5jZS50b1N0cmluZygpfSBpbnRvICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gbWFyayBpdCBhcyBjaGFuZ2VkIGR1cmluZyB0aGlzIGZyYW1lLCBzbyB0aGF0IHdlIGNhbiBwcm9wZXJseSBzZXQgdGhlIGNoYW5nZSBpbnRlcnZhbFxuICAgIGluc3RhbmNlLnN0aXRjaENoYW5nZUZyYW1lID0gdGhpcy5kaXNwbGF5Ll9mcmFtZUlkO1xuICAgIHRoaXMuc3RpdGNoQ2hhbmdlT25DaGlsZHJlbiA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcblxuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpbmRleCwgMCwgaW5zdGFuY2UgKTtcbiAgICBpbnN0YW5jZS5wYXJlbnQgPSB0aGlzO1xuICAgIGluc3RhbmNlLm9sZFBhcmVudCA9IHRoaXM7XG5cbiAgICAvLyBtYWludGFpbiBvdXIgc3RpdGNoLWNoYW5nZSBpbnRlcnZhbFxuICAgIGlmICggaW5kZXggPD0gdGhpcy5iZWZvcmVTdGFibGVJbmRleCApIHtcbiAgICAgIHRoaXMuYmVmb3JlU3RhYmxlSW5kZXggPSBpbmRleCAtIDE7XG4gICAgfVxuICAgIGlmICggaW5kZXggPiB0aGlzLmFmdGVyU3RhYmxlSW5kZXggKSB7XG4gICAgICB0aGlzLmFmdGVyU3RhYmxlSW5kZXggPSBpbmRleCArIDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5hZnRlclN0YWJsZUluZGV4Kys7XG4gICAgfVxuXG4gICAgLy8gbWFpbnRhaW4gZml0dGFibGUgZmxhZ3NcbiAgICB0aGlzLmZpdHRhYmlsaXR5Lm9uSW5zZXJ0KCBpbnN0YW5jZS5maXR0YWJpbGl0eSApO1xuXG4gICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybS5hZGRJbnN0YW5jZSggaW5zdGFuY2UgKTtcblxuICAgIHRoaXMubWFya0NoaWxkVmlzaWJpbGl0eURpcnR5KCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICovXG4gIHJlbW92ZUluc3RhbmNlKCBpbnN0YW5jZSApIHtcbiAgICB0aGlzLnJlbW92ZUluc3RhbmNlV2l0aEluZGV4KCBpbnN0YW5jZSwgXy5pbmRleE9mKCB0aGlzLmNoaWxkcmVuLCBpbnN0YW5jZSApICk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqL1xuICByZW1vdmVJbnN0YW5jZVdpdGhJbmRleCggaW5zdGFuY2UsIGluZGV4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlIGluc3RhbmNlb2YgSW5zdGFuY2UgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5jaGlsZHJlbi5sZW5ndGgsXG4gICAgICBgSW5zdGFuY2UgcmVtb3ZhbCBib3VuZHMgY2hlY2sgZm9yIGluZGV4ICR7aW5kZXh9IHdpdGggcHJldmlvdXMgY2hpbGRyZW4gbGVuZ3RoICR7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ubGVuZ3RofWAgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUoXG4gICAgICBgcmVtb3ZpbmcgJHtpbnN0YW5jZS50b1N0cmluZygpfSBmcm9tICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3QgZnJhbWVJZCA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcblxuICAgIC8vIG1hcmsgaXQgYXMgY2hhbmdlZCBkdXJpbmcgdGhpcyBmcmFtZSwgc28gdGhhdCB3ZSBjYW4gcHJvcGVybHkgc2V0IHRoZSBjaGFuZ2UgaW50ZXJ2YWxcbiAgICBpbnN0YW5jZS5zdGl0Y2hDaGFuZ2VGcmFtZSA9IGZyYW1lSWQ7XG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VPbkNoaWxkcmVuID0gZnJhbWVJZDtcblxuICAgIC8vIG1hcmsgbmVpZ2hib3JzIHNvIHRoYXQgd2UgY2FuIGFkZCBhIGNoYW5nZSBpbnRlcnZhbCBmb3Igb3VyIHJlbW92YWwgYXJlYVxuICAgIGlmICggaW5kZXggLSAxID49IDAgKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuWyBpbmRleCAtIDEgXS5zdGl0Y2hDaGFuZ2VBZnRlciA9IGZyYW1lSWQ7XG4gICAgfVxuICAgIGlmICggaW5kZXggKyAxIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGggKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuWyBpbmRleCArIDEgXS5zdGl0Y2hDaGFuZ2VCZWZvcmUgPSBmcmFtZUlkO1xuICAgIH1cblxuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBpbmRleCwgMSApOyAvLyBUT0RPOiByZXBsYWNlIHdpdGggYSAncmVtb3ZlJyBmdW5jdGlvbiBjYWxsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgaW5zdGFuY2UucGFyZW50ID0gbnVsbDtcbiAgICBpbnN0YW5jZS5vbGRQYXJlbnQgPSB0aGlzO1xuXG4gICAgLy8gbWFpbnRhaW4gb3VyIHN0aXRjaC1jaGFuZ2UgaW50ZXJ2YWxcbiAgICBpZiAoIGluZGV4IDw9IHRoaXMuYmVmb3JlU3RhYmxlSW5kZXggKSB7XG4gICAgICB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ID0gaW5kZXggLSAxO1xuICAgIH1cbiAgICBpZiAoIGluZGV4ID49IHRoaXMuYWZ0ZXJTdGFibGVJbmRleCApIHtcbiAgICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleCA9IGluZGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleC0tO1xuICAgIH1cblxuICAgIC8vIG1haW50YWluIGZpdHRhYmxlIGZsYWdzXG4gICAgdGhpcy5maXR0YWJpbGl0eS5vblJlbW92ZSggaW5zdGFuY2UuZml0dGFiaWxpdHkgKTtcblxuICAgIHRoaXMucmVsYXRpdmVUcmFuc2Zvcm0ucmVtb3ZlSW5zdGFuY2UoIGluc3RhbmNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gY2hpbGRJbnN0YW5jZVxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSByZXBsYWNlbWVudEluc3RhbmNlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKi9cbiAgcmVwbGFjZUluc3RhbmNlV2l0aEluZGV4KCBjaGlsZEluc3RhbmNlLCByZXBsYWNlbWVudEluc3RhbmNlLCBpbmRleCApIHtcbiAgICAvLyBUT0RPOiBvcHRpbWl6YXRpb24/IGhvcGVmdWxseSBpdCB3b24ndCBoYXBwZW4gb2Z0ZW4sIHNvIHdlIGp1c3QgZG8gdGhpcyBmb3Igbm93IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5yZW1vdmVJbnN0YW5jZVdpdGhJbmRleCggY2hpbGRJbnN0YW5jZSwgaW5kZXggKTtcbiAgICB0aGlzLmluc2VydEluc3RhbmNlKCByZXBsYWNlbWVudEluc3RhbmNlLCBpbmRleCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBoYW5kbGluZyBwb3RlbnRpYWwgcmVvcmRlcmluZyBvZiBjaGlsZCBpbnN0YW5jZXMgaW5jbHVzaXZlbHkgYmV0d2VlbiB0aGUgbWluIGFuZCBtYXggaW5kaWNlcy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1pbkNoYW5nZUluZGV4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhDaGFuZ2VJbmRleFxuICAgKi9cbiAgcmVvcmRlckluc3RhbmNlcyggbWluQ2hhbmdlSW5kZXgsIG1heENoYW5nZUluZGV4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBtaW5DaGFuZ2VJbmRleCA9PT0gJ251bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgbWF4Q2hhbmdlSW5kZXggPT09ICdudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWluQ2hhbmdlSW5kZXggPD0gbWF4Q2hhbmdlSW5kZXggKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZVRyZWUoIGBSZW9yZGVyaW5nICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2VUcmVlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogRm9yIGltcGxlbWVudGF0aW9uLCB3ZSd2ZSBiYXNpY2FsbHkgc2V0IHBhcmFtZXRlcnMgYXMgaWYgd2UgcmVtb3ZlZCBhbGwgb2YgdGhlIHJlbGV2YW50IGluc3RhbmNlcyBhbmRcbiAgICAvLyB0aGVuIGFkZGVkIHRoZW0gYmFjayBpbi4gVGhlcmUgbWF5IGJlIG1vcmUgZWZmaWNpZW50IHdheXMgdG8gZG8gdGhpcywgYnV0IHRoZSBzdGl0Y2hpbmcgYW5kIGNoYW5nZSBpbnRlcnZhbFxuICAgIC8vIHByb2Nlc3MgaXMgYSBiaXQgY29tcGxpY2F0ZWQgcmlnaHQgbm93LlxuXG4gICAgY29uc3QgZnJhbWVJZCA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcblxuICAgIC8vIFJlbW92ZSB0aGUgb2xkIG9yZGVyaW5nIG9mIGluc3RhbmNlc1xuICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggLSBtaW5DaGFuZ2VJbmRleCArIDEgKTtcblxuICAgIC8vIEFkZCB0aGUgaW5zdGFuY2VzIGJhY2sgaW4gdGhlIGNvcnJlY3Qgb3JkZXJcbiAgICBmb3IgKCBsZXQgaSA9IG1pbkNoYW5nZUluZGV4OyBpIDw9IG1heENoYW5nZUluZGV4OyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuZmluZENoaWxkSW5zdGFuY2VPbk5vZGUoIHRoaXMubm9kZS5fY2hpbGRyZW5bIGkgXSApO1xuICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIGksIDAsIGNoaWxkICk7XG4gICAgICBjaGlsZC5zdGl0Y2hDaGFuZ2VGcmFtZSA9IGZyYW1lSWQ7XG5cbiAgICAgIC8vIG1hcmsgbmVpZ2hib3JzIHNvIHRoYXQgd2UgY2FuIGFkZCBhIGNoYW5nZSBpbnRlcnZhbCBmb3Igb3VyIGNoYW5nZSBhcmVhXG4gICAgICBpZiAoIGkgPiBtaW5DaGFuZ2VJbmRleCApIHtcbiAgICAgICAgY2hpbGQuc3RpdGNoQ2hhbmdlQWZ0ZXIgPSBmcmFtZUlkO1xuICAgICAgfVxuICAgICAgaWYgKCBpIDwgbWF4Q2hhbmdlSW5kZXggKSB7XG4gICAgICAgIGNoaWxkLnN0aXRjaENoYW5nZUJlZm9yZSA9IGZyYW1lSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VPbkNoaWxkcmVuID0gZnJhbWVJZDtcbiAgICB0aGlzLmJlZm9yZVN0YWJsZUluZGV4ID0gTWF0aC5taW4oIHRoaXMuYmVmb3JlU3RhYmxlSW5kZXgsIG1pbkNoYW5nZUluZGV4IC0gMSApO1xuICAgIHRoaXMuYWZ0ZXJTdGFibGVJbmRleCA9IE1hdGgubWF4KCB0aGlzLmFmdGVyU3RhYmxlSW5kZXgsIG1heENoYW5nZUluZGV4ICsgMSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlVHJlZSAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHdlIGhhdmUgYSBjaGlsZCBpbnN0YW5jZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoaXMgbm9kZSwgcmV0dXJuIGl0IChvdGhlcndpc2UgbnVsbCkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V8bnVsbH1cbiAgICovXG4gIGZpbmRDaGlsZEluc3RhbmNlT25Ob2RlKCBub2RlICkge1xuICAgIGNvbnN0IGluc3RhbmNlcyA9IG5vZGUuZ2V0SW5zdGFuY2VzKCk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5zdGFuY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBpbnN0YW5jZXNbIGkgXS5vbGRQYXJlbnQgPT09IHRoaXMgKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZXNbIGkgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgY2FsbGJhY2sgZm9yIE5vZGUncyAnY2hpbGRJbnNlcnRlZCcgZXZlbnQsIHVzZWQgdG8gdHJhY2sgY2hpbGRyZW4uXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gY2hpbGROb2RlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKi9cbiAgb25DaGlsZEluc2VydGVkKCBjaGlsZE5vZGUsIGluZGV4ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKFxuICAgICAgYGluc2VydGluZyBjaGlsZCBub2RlICR7Y2hpbGROb2RlLmNvbnN0cnVjdG9yLm5hbWV9IyR7Y2hpbGROb2RlLmlkfSBpbnRvICR7dGhpcy50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5zdGF0ZWxlc3MsICdJZiB3ZSBhcmUgc3RhdGVsZXNzLCB3ZSBzaG91bGQgbm90IHJlY2VpdmUgdGhlc2Ugbm90aWZpY2F0aW9ucycgKTtcblxuICAgIGxldCBpbnN0YW5jZSA9IHRoaXMuZmluZENoaWxkSW5zdGFuY2VPbk5vZGUoIGNoaWxkTm9kZSApO1xuXG4gICAgaWYgKCBpbnN0YW5jZSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCAnaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMnICk7XG4gICAgICAvLyBpdCBtdXN0IGhhdmUgYmVlbiBhZGRlZCBiYWNrLiBpbmNyZW1lbnQgaXRzIGNvdW50ZXJcbiAgICAgIGluc3RhbmNlLmFkZFJlbW92ZUNvdW50ZXIgKz0gMTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlLmFkZFJlbW92ZUNvdW50ZXIgPT09IDAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSggJ2NyZWF0aW5nIHN0dWIgaW5zdGFuY2UnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgICBpbnN0YW5jZSA9IEluc3RhbmNlLmNyZWF0ZUZyb21Qb29sKCB0aGlzLmRpc3BsYXksIHRoaXMudHJhaWwuY29weSgpLmFkZERlc2NlbmRhbnQoIGNoaWxkTm9kZSwgaW5kZXggKSwgZmFsc2UsIGZhbHNlICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG5cbiAgICB0aGlzLmluc2VydEluc3RhbmNlKCBpbnN0YW5jZSwgaW5kZXggKTtcblxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaXRlZCBmb3Igc3luY1RyZWUoKVxuICAgIHRoaXMubWFya1NraXBQcnVuaW5nKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBjYWxsYmFjayBmb3IgTm9kZSdzICdjaGlsZFJlbW92ZWQnIGV2ZW50LCB1c2VkIHRvIHRyYWNrIGNoaWxkcmVuLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkTm9kZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICovXG4gIG9uQ2hpbGRSZW1vdmVkKCBjaGlsZE5vZGUsIGluZGV4ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKFxuICAgICAgYHJlbW92aW5nIGNoaWxkIG5vZGUgJHtjaGlsZE5vZGUuY29uc3RydWN0b3IubmFtZX0jJHtjaGlsZE5vZGUuaWR9IGZyb20gJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnN0YXRlbGVzcywgJ0lmIHdlIGFyZSBzdGF0ZWxlc3MsIHdlIHNob3VsZCBub3QgcmVjZWl2ZSB0aGVzZSBub3RpZmljYXRpb25zJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY2hpbGRyZW5bIGluZGV4IF0ubm9kZSA9PT0gY2hpbGROb2RlLCAnRW5zdXJlIHRoYXQgb3VyIGluc3RhbmNlIG1hdGNoZXMgdXAnICk7XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IHRoaXMuZmluZENoaWxkSW5zdGFuY2VPbk5vZGUoIGNoaWxkTm9kZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlICE9PSBudWxsLCAnV2Ugc2hvdWxkIGFsd2F5cyBoYXZlIGEgcmVmZXJlbmNlIHRvIGEgcmVtb3ZlZCBpbnN0YW5jZScgKTtcblxuICAgIGluc3RhbmNlLmFkZFJlbW92ZUNvdW50ZXIgLT0gMTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZS5hZGRSZW1vdmVDb3VudGVyID09PSAtMSApO1xuXG4gICAgLy8gdHJhY2sgdGhlIHJlbW92ZWQgaW5zdGFuY2UgaGVyZS4gaWYgaXQgZG9lc24ndCBnZXQgYWRkZWQgYmFjaywgdGhpcyB3aWxsIGJlIHRoZSBvbmx5IHJlZmVyZW5jZSB3ZSBoYXZlICh3ZSdsbFxuICAgIC8vIG5lZWQgdG8gZGlzcG9zZSBpdClcbiAgICB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdC5wdXNoKCBpbnN0YW5jZSApO1xuXG4gICAgdGhpcy5yZW1vdmVJbnN0YW5jZVdpdGhJbmRleCggaW5zdGFuY2UsIGluZGV4ICk7XG5cbiAgICAvLyBtYWtlIHN1cmUgd2UgYXJlIHZpc2l0ZWQgZm9yIHN5bmNUcmVlKClcbiAgICB0aGlzLm1hcmtTa2lwUHJ1bmluZygpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgY2FsbGJhY2sgZm9yIE5vZGUncyAnY2hpbGRyZW5SZW9yZGVyZWQnIGV2ZW50XG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5DaGFuZ2VJbmRleFxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4Q2hhbmdlSW5kZXhcbiAgICovXG4gIG9uQ2hpbGRyZW5SZW9yZGVyZWQoIG1pbkNoYW5nZUluZGV4LCBtYXhDaGFuZ2VJbmRleCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZShcbiAgICAgIGByZW9yZGVyaW5nIGNoaWxkcmVuIGZvciAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5yZW9yZGVySW5zdGFuY2VzKCBtaW5DaGFuZ2VJbmRleCwgbWF4Q2hhbmdlSW5kZXggKTtcblxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaXRlZCBmb3Igc3luY1RyZWUoKVxuICAgIHRoaXMubWFya1NraXBQcnVuaW5nKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5zdGFuY2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBjYWxsYmFjayBmb3IgTm9kZSdzICd2aXNpYmlsaXR5JyBldmVudCwgdXNlZCB0byBub3RpZnkgYWJvdXQgc3RpdGNoIGNoYW5nZXMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvblZpc2liaWxpdHlDaGFuZ2UoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuc3RhdGVsZXNzLCAnSWYgd2UgYXJlIHN0YXRlbGVzcywgd2Ugc2hvdWxkIG5vdCByZWNlaXZlIHRoZXNlIG5vdGlmaWNhdGlvbnMnICk7XG5cbiAgICAvLyBmb3Igbm93LCBqdXN0IG1hcmsgd2hpY2ggZnJhbWUgd2Ugd2VyZSBjaGFuZ2VkIGZvciBvdXIgY2hhbmdlIGludGVydmFsXG4gICAgdGhpcy5zdGl0Y2hDaGFuZ2VGcmFtZSA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcblxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmVuJ3QgcHJ1bmVkIGluIHRoZSBuZXh0IHN5bmNUcmVlKClcbiAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5tYXJrU2tpcFBydW5pbmcoKTtcblxuICAgIC8vIG1hcmsgdmlzaWJpbGl0eSBjaGFuZ2VzXG4gICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSB0cnVlO1xuICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtDaGlsZFZpc2liaWxpdHlEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGNhbGxiYWNrIGZvciBOb2RlJ3MgJ29wYWNpdHknIGNoYW5nZSBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uT3BhY2l0eUNoYW5nZSgpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5zdGF0ZWxlc3MsICdJZiB3ZSBhcmUgc3RhdGVsZXNzLCB3ZSBzaG91bGQgbm90IHJlY2VpdmUgdGhlc2Ugbm90aWZpY2F0aW9ucycgKTtcblxuICAgIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWFya0NoaWxkVmlzaWJpbGl0eURpcnR5KCkge1xuICAgIGlmICggIXRoaXMuY2hpbGRWaXNpYmlsaXR5RGlydHkgKSB7XG4gICAgICB0aGlzLmNoaWxkVmlzaWJpbGl0eURpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtDaGlsZFZpc2liaWxpdHlEaXJ0eSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjdXJyZW50bHkgZml0dGFiaWxpdHkgZm9yIGFsbCBvZiB0aGUgZHJhd2FibGVzIGF0dGFjaGVkIHRvIHRoaXMgaW5zdGFuY2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBmaXR0YWJsZVxuICAgKi9cbiAgdXBkYXRlRHJhd2FibGVGaXR0YWJpbGl0eSggZml0dGFibGUgKSB7XG4gICAgdGhpcy5zZWxmRHJhd2FibGUgJiYgdGhpcy5zZWxmRHJhd2FibGUuc2V0Rml0dGFibGUoIGZpdHRhYmxlICk7XG4gICAgdGhpcy5ncm91cERyYXdhYmxlICYmIHRoaXMuZ3JvdXBEcmF3YWJsZS5zZXRGaXR0YWJsZSggZml0dGFibGUgKTtcbiAgICAvLyB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUgJiYgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLnNldEZpdHRhYmxlKCBmaXR0YWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZpc2libGUvcmVsYXRpdmVWaXNpYmxlIGZsYWdzIG9uIHRoZSBJbnN0YW5jZSBhbmQgaXRzIGVudGlyZSBzdWJ0cmVlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcGFyZW50R2xvYmFsbHlWaXNpYmxlIC0gV2hldGhlciBvdXIgcGFyZW50IChpZiBhbnkpIGlzIGdsb2JhbGx5IHZpc2libGVcbiAgICogQHBhcmFtIHtib29sZWFufSBwYXJlbnRHbG9iYWxseVZvaWNpbmdWaXNpYmxlIC0gV2hldGhlciBvdXIgcGFyZW50IChpZiBhbnkpIGlzIGdsb2JhbGx5IHZvaWNpbmdWaXNpYmxlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHBhcmVudFJlbGF0aXZlbHlWaXNpYmxlIC0gV2hldGhlciBvdXIgcGFyZW50IChpZiBhbnkpIGlzIHJlbGF0aXZlbHkgdmlzaWJsZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHVwZGF0ZUZ1bGxTdWJ0cmVlIC0gSWYgdHJ1ZSwgd2Ugd2lsbCB2aXNpdCB0aGUgZW50aXJlIHN1YnRyZWUgdG8gZW5zdXJlIHZpc2liaWxpdHkgaXMgY29ycmVjdC5cbiAgICovXG4gIHVwZGF0ZVZpc2liaWxpdHkoIHBhcmVudEdsb2JhbGx5VmlzaWJsZSwgcGFyZW50R2xvYmFsbHlWb2ljaW5nVmlzaWJsZSwgcGFyZW50UmVsYXRpdmVseVZpc2libGUsIHVwZGF0ZUZ1bGxTdWJ0cmVlICkge1xuICAgIC8vIElmIG91ciB2aXNpYmlsaXR5IGZsYWcgZm9yIG91cnNlbGYgaXMgZGlydHksIHdlIG5lZWQgdG8gdXBkYXRlIG91ciBlbnRpcmUgc3VidHJlZVxuICAgIGlmICggdGhpcy52aXNpYmlsaXR5RGlydHkgKSB7XG4gICAgICB1cGRhdGVGdWxsU3VidHJlZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gY2FsY3VsYXRlIG91ciB2aXNpYmlsaXRpZXNcbiAgICBjb25zdCBub2RlVmlzaWJsZSA9IHRoaXMubm9kZS5pc1Zpc2libGUoKTtcbiAgICBjb25zdCB3YXNWaXNpYmxlID0gdGhpcy52aXNpYmxlO1xuICAgIGNvbnN0IHdhc1JlbGF0aXZlVmlzaWJsZSA9IHRoaXMucmVsYXRpdmVWaXNpYmxlO1xuICAgIGNvbnN0IHdhc1NlbGZWaXNpYmxlID0gdGhpcy5zZWxmVmlzaWJsZTtcbiAgICBjb25zdCBub2RlVm9pY2luZ1Zpc2libGUgPSB0aGlzLm5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eS52YWx1ZTtcbiAgICBjb25zdCB3YXNWb2ljaW5nVmlzaWJsZSA9IHRoaXMudm9pY2luZ1Zpc2libGU7XG4gICAgY29uc3QgY291bGRWb2ljZSA9IHdhc1Zpc2libGUgJiYgd2FzVm9pY2luZ1Zpc2libGU7XG4gICAgdGhpcy52aXNpYmxlID0gcGFyZW50R2xvYmFsbHlWaXNpYmxlICYmIG5vZGVWaXNpYmxlO1xuICAgIHRoaXMudm9pY2luZ1Zpc2libGUgPSBwYXJlbnRHbG9iYWxseVZvaWNpbmdWaXNpYmxlICYmIG5vZGVWb2ljaW5nVmlzaWJsZTtcbiAgICB0aGlzLnJlbGF0aXZlVmlzaWJsZSA9IHBhcmVudFJlbGF0aXZlbHlWaXNpYmxlICYmIG5vZGVWaXNpYmxlO1xuICAgIHRoaXMuc2VsZlZpc2libGUgPSB0aGlzLmlzVmlzaWJpbGl0eUFwcGxpZWQgPyB0cnVlIDogdGhpcy5yZWxhdGl2ZVZpc2libGU7XG5cbiAgICBjb25zdCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5jaGlsZHJlblsgaSBdO1xuXG4gICAgICBpZiAoIHVwZGF0ZUZ1bGxTdWJ0cmVlIHx8IGNoaWxkLnZpc2liaWxpdHlEaXJ0eSB8fCBjaGlsZC5jaGlsZFZpc2liaWxpdHlEaXJ0eSApIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIGEgdmlzaWJpbGl0eSByb290IChpc1Zpc2liaWxpdHlBcHBsaWVkPT09dHJ1ZSksIGRpc3JlZ2FyZCBhbmNlc3RvciB2aXNpYmlsaXR5XG4gICAgICAgIGNoaWxkLnVwZGF0ZVZpc2liaWxpdHkoIHRoaXMudmlzaWJsZSwgdGhpcy52b2ljaW5nVmlzaWJsZSwgdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkID8gdHJ1ZSA6IHRoaXMucmVsYXRpdmVWaXNpYmxlLCB1cGRhdGVGdWxsU3VidHJlZSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gZmFsc2U7XG4gICAgdGhpcy5jaGlsZFZpc2liaWxpdHlEaXJ0eSA9IGZhbHNlO1xuXG4gICAgLy8gdHJpZ2dlciBjaGFuZ2VzIGFmdGVyIHdlIGRvIHRoZSBmdWxsIHZpc2liaWxpdHkgdXBkYXRlXG4gICAgaWYgKCB0aGlzLnZpc2libGUgIT09IHdhc1Zpc2libGUgKSB7XG4gICAgICB0aGlzLnZpc2libGVFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnJlbGF0aXZlVmlzaWJsZSAhPT0gd2FzUmVsYXRpdmVWaXNpYmxlICkge1xuICAgICAgdGhpcy5yZWxhdGl2ZVZpc2libGVFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnNlbGZWaXNpYmxlICE9PSB3YXNTZWxmVmlzaWJsZSApIHtcbiAgICAgIHRoaXMuc2VsZlZpc2libGVFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG5cbiAgICAvLyBBbiBJbnN0YW5jZSBjYW4gdm9pY2Ugd2hlbiBpdCBpcyBnbG9iYWxseSB2aXNpYmxlIGFuZCB2b2ljaW5nVmlzaWJsZS4gTm90aWZ5IHdoZW4gdGhpcyBzdGF0ZSBoYXMgY2hhbmdlZFxuICAgIC8vIGJhc2VkIG9uIHRoZXNlIGRlcGVuZGVuY2llcy5cbiAgICBjb25zdCBjYW5Wb2ljZSA9IHRoaXMudm9pY2luZ1Zpc2libGUgJiYgdGhpcy52aXNpYmxlO1xuICAgIGlmICggY2FuVm9pY2UgIT09IGNvdWxkVm9pY2UgKSB7XG4gICAgICB0aGlzLmNhblZvaWNlRW1pdHRlci5lbWl0KCBjYW5Wb2ljZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgZ2V0RGVzY2VuZGFudENvdW50KCkge1xuICAgIGxldCBjb3VudCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb3VudCArPSB0aGlzLmNoaWxkcmVuWyBpIF0uZ2V0RGVzY2VuZGFudENvdW50KCk7XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBNaXNjZWxsYW5lb3VzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEFkZCBhIHJlZmVyZW5jZSBmb3IgYW4gU1ZHIGdyb3VwIChmYXN0ZXN0IHdheSB0byB0cmFjayB0aGVtKVxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHR3JvdXB9IGdyb3VwXG4gICAqL1xuICBhZGRTVkdHcm91cCggZ3JvdXAgKSB7XG4gICAgdGhpcy5zdmdHcm91cHMucHVzaCggZ3JvdXAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSByZWZlcmVuY2UgZm9yIGFuIFNWRyBncm91cCAoZmFzdGVzdCB3YXkgdG8gdHJhY2sgdGhlbSlcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR0dyb3VwfSBncm91cFxuICAgKi9cbiAgcmVtb3ZlU1ZHR3JvdXAoIGdyb3VwICkge1xuICAgIGFycmF5UmVtb3ZlKCB0aGlzLnN2Z0dyb3VwcywgZ3JvdXAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG51bGwgd2hlbiBhIGxvb2t1cCBmYWlscyAod2hpY2ggaXMgbGVnaXRpbWF0ZSlcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xuICAgKiBAcmV0dXJucyB7U1ZHR3JvdXB8bnVsbH1cbiAgICovXG4gIGxvb2t1cFNWR0dyb3VwKCBibG9jayApIHtcbiAgICBjb25zdCBsZW4gPSB0aGlzLnN2Z0dyb3Vwcy5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb25zdCBncm91cCA9IHRoaXMuc3ZnR3JvdXBzWyBpIF07XG4gICAgICBpZiAoIGdyb3VwLmJsb2NrID09PSBibG9jayApIHtcbiAgICAgICAgcmV0dXJuIGdyb3VwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGluc3RhbmNlIGhhdmUgZmlsdGVycyAob3BhY2l0eS92aXNpYmlsaXR5L2NsaXApIGJlZW4gYXBwbGllZCB1cCB0bz9cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V9XG4gICAqL1xuICBnZXRGaWx0ZXJSb290SW5zdGFuY2UoKSB7XG4gICAgaWYgKCB0aGlzLmlzQmFja2JvbmUgfHwgdGhpcy5pc0luc3RhbmNlQ2FudmFzQ2FjaGUgfHwgIXRoaXMucGFyZW50ICkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldEZpbHRlclJvb3RJbnN0YW5jZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGF0IGluc3RhbmNlIHRyYW5zZm9ybXMgaGF2ZSBiZWVuIGFwcGxpZWQgdXAgdG8/XG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge0luc3RhbmNlfVxuICAgKi9cbiAgZ2V0VHJhbnNmb3JtUm9vdEluc3RhbmNlKCkge1xuICAgIGlmICggdGhpcy5pc1RyYW5zZm9ybWVkIHx8ICF0aGlzLnBhcmVudCApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXRUcmFuc2Zvcm1Sb290SW5zdGFuY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7SW5zdGFuY2V9XG4gICAqL1xuICBnZXRWaXNpYmlsaXR5Um9vdEluc3RhbmNlKCkge1xuICAgIGlmICggdGhpcy5pc1Zpc2liaWxpdHlBcHBsaWVkIHx8ICF0aGlzLnBhcmVudCApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXRWaXNpYmlsaXR5Um9vdEluc3RhbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhdHRhY2hOb2RlTGlzdGVuZXJzKCkge1xuICAgIC8vIGF0dGFjaCBsaXN0ZW5lcnMgdG8gb3VyIG5vZGVcbiAgICB0aGlzLnJlbGF0aXZlVHJhbnNmb3JtLmF0dGFjaE5vZGVMaXN0ZW5lcnMoKTtcblxuICAgIGlmICggIXRoaXMuaXNTaGFyZWRDYW52YXNDYWNoZVBsYWNlaG9sZGVyICkge1xuICAgICAgdGhpcy5ub2RlLmNoaWxkSW5zZXJ0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmNoaWxkSW5zZXJ0ZWRMaXN0ZW5lciApO1xuICAgICAgdGhpcy5ub2RlLmNoaWxkUmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY2hpbGRSZW1vdmVkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubm9kZS5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRMaXN0ZW5lciApO1xuICAgICAgdGhpcy5ub2RlLnZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy52aXNpYmlsaXR5TGlzdGVuZXIgKTtcblxuICAgICAgLy8gTWFya3MgYWxsIHZpc2liaWxpdHkgZGlydHkgd2hlbiB2b2ljaW5nVmlzaWJsZSBjaGFuZ2VzIHRvIGNhdXNlIG5lY2Vzc2FyeSB1cGRhdGVzIGZvciB2b2ljaW5nVmlzaWJsZVxuICAgICAgdGhpcy5ub2RlLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHRoaXMudmlzaWJpbGl0eUxpc3RlbmVyICk7XG5cbiAgICAgIHRoaXMubm9kZS5maWx0ZXJDaGFuZ2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubm9kZS5jbGlwQXJlYVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubm9kZS5pbnN0YW5jZVJlZnJlc2hFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm1hcmtSZW5kZXJTdGF0ZURpcnR5TGlzdGVuZXIgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRldGFjaE5vZGVMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybS5kZXRhY2hOb2RlTGlzdGVuZXJzKCk7XG5cbiAgICBpZiAoICF0aGlzLmlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciApIHtcbiAgICAgIHRoaXMubm9kZS5jaGlsZEluc2VydGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5jaGlsZEluc2VydGVkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubm9kZS5jaGlsZFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNoaWxkUmVtb3ZlZExpc3RlbmVyICk7XG4gICAgICB0aGlzLm5vZGUuY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNoaWxkcmVuUmVvcmRlcmVkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubm9kZS52aXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLnZpc2liaWxpdHlMaXN0ZW5lciApO1xuICAgICAgdGhpcy5ub2RlLnZvaWNpbmdWaXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLnZpc2liaWxpdHlMaXN0ZW5lciApO1xuXG4gICAgICB0aGlzLm5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5tYXJrUmVuZGVyU3RhdGVEaXJ0eUxpc3RlbmVyICk7XG4gICAgICB0aGlzLm5vZGUuY2xpcEFyZWFQcm9wZXJ0eS51bmxpbmsoIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciApO1xuICAgICAgdGhpcy5ub2RlLmluc3RhbmNlUmVmcmVzaEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMubWFya1JlbmRlclN0YXRlRGlydHlMaXN0ZW5lciApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCB0aGUgcmVuZGVyIHN0YXRlIGlzIHVwZGF0ZWQgaW4gdGhlIG5leHQgc3luY1RyZWUoKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWFya1JlbmRlclN0YXRlRGlydHkoKSB7XG4gICAgdGhpcy5yZW5kZXJTdGF0ZURpcnR5RnJhbWUgPSB0aGlzLmRpc3BsYXkuX2ZyYW1lSWQ7XG5cbiAgICAvLyBlbnN1cmUgd2UgYXJlbid0IHBydW5lZCAobm90IHNldCBvbiB0aGlzIGluc3RhbmNlLCBzaW5jZSB3ZSBtYXkgbm90IG5lZWQgdG8gdmlzaXQgb3VyIGNoaWxkcmVuKVxuICAgIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm1hcmtTa2lwUHJ1bmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IHRoaXMgaW5zdGFuY2UgYW5kIGl0cyBjaGlsZHJlbiB3aWxsIGJlIHZpc2l0ZWQgaW4gdGhlIG5leHQgc3luY1RyZWUoKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbWFya1NraXBQcnVuaW5nKCkge1xuICAgIHRoaXMuc2tpcFBydW5pbmdGcmFtZSA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcblxuICAgIC8vIHdhbGsgaXQgdXAgdG8gdGhlIHJvb3RcbiAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5tYXJrU2tpcFBydW5pbmcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIE5PVEU6IHVzZWQgaW4gQ2FudmFzQmxvY2sgaW50ZXJuYWxzLCBwZXJmb3JtYW5jZS1jcml0aWNhbC5cbiAgICpcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gaW5zdGFuY2VcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGdldEJyYW5jaEluZGV4VG8oIGluc3RhbmNlICkge1xuICAgIGNvbnN0IGNhY2hlZFZhbHVlID0gdGhpcy5icmFuY2hJbmRleE1hcFsgaW5zdGFuY2UuaWQgXTtcbiAgICBpZiAoIGNhY2hlZFZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICByZXR1cm4gY2FjaGVkVmFsdWU7XG4gICAgfVxuXG4gICAgY29uc3QgYnJhbmNoSW5kZXggPSB0aGlzLnRyYWlsLmdldEJyYW5jaEluZGV4VG8oIGluc3RhbmNlLnRyYWlsICk7XG4gICAgdGhpcy5icmFuY2hJbmRleE1hcFsgaW5zdGFuY2UuaWQgXSA9IGJyYW5jaEluZGV4O1xuICAgIGluc3RhbmNlLmJyYW5jaEluZGV4TWFwWyB0aGlzLmlkIF0gPSBicmFuY2hJbmRleDtcbiAgICB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcy5wdXNoKCBpbnN0YW5jZSApO1xuICAgIGluc3RhbmNlLmJyYW5jaEluZGV4UmVmZXJlbmNlcy5wdXNoKCB0aGlzICk7XG5cbiAgICByZXR1cm4gYnJhbmNoSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW4gdXAgbGlzdGVuZXJzIGFuZCBnYXJiYWdlLCBzbyB0aGF0IHdlIGNhbiBiZSByZWN5Y2xlZCAob3IgcG9vbGVkKVxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnN0YW5jZSAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlKCBgZGlzcG9zZSAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hY3RpdmUsICdTZWVtcyBsaWtlIHdlIHRyaWVkIHRvIGRpc3Bvc2UgdGhpcyBJbnN0YW5jZSB0d2ljZSwgaXQgaXMgbm90IGFjdGl2ZScgKTtcblxuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG5cbiAgICAvLyBSZW1vdmUgdGhlIGJpZGlyZWN0aW9uYWwgYnJhbmNoIGluZGV4IHJlZmVyZW5jZSBkYXRhIGZyb20gdGhpcyBpbnN0YW5jZSBhbmQgYW55IHJlZmVyZW5jZWQgaW5zdGFuY2VzLlxuICAgIHdoaWxlICggdGhpcy5icmFuY2hJbmRleFJlZmVyZW5jZXMubGVuZ3RoICkge1xuICAgICAgY29uc3QgcmVmZXJlbmNlSW5zdGFuY2UgPSB0aGlzLmJyYW5jaEluZGV4UmVmZXJlbmNlcy5wb3AoKTtcbiAgICAgIGRlbGV0ZSB0aGlzLmJyYW5jaEluZGV4TWFwWyByZWZlcmVuY2VJbnN0YW5jZS5pZCBdO1xuICAgICAgZGVsZXRlIHJlZmVyZW5jZUluc3RhbmNlLmJyYW5jaEluZGV4TWFwWyB0aGlzLmlkIF07XG4gICAgICBhcnJheVJlbW92ZSggcmVmZXJlbmNlSW5zdGFuY2UuYnJhbmNoSW5kZXhSZWZlcmVuY2VzLCB0aGlzICk7XG4gICAgfVxuXG4gICAgLy8gb3JkZXIgaXMgc29tZXdoYXQgaW1wb3J0YW50XG4gICAgdGhpcy5ncm91cERyYXdhYmxlICYmIHRoaXMuZ3JvdXBEcmF3YWJsZS5kaXNwb3NlSW1tZWRpYXRlbHkoIHRoaXMuZGlzcGxheSApO1xuICAgIHRoaXMuc2hhcmVkQ2FjaGVEcmF3YWJsZSAmJiB0aGlzLnNoYXJlZENhY2hlRHJhd2FibGUuZGlzcG9zZUltbWVkaWF0ZWx5KCB0aGlzLmRpc3BsYXkgKTtcbiAgICB0aGlzLnNlbGZEcmF3YWJsZSAmJiB0aGlzLnNlbGZEcmF3YWJsZS5kaXNwb3NlSW1tZWRpYXRlbHkoIHRoaXMuZGlzcGxheSApO1xuXG4gICAgLy8gRGlzcG9zZSB0aGUgcmVzdCBvZiBvdXIgc3VidHJlZVxuICAgIGNvbnN0IG51bUNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKyApIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5bIGkgXS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIC8vIENoZWNrIGZvciBjaGlsZCBpbnN0YW5jZXMgdGhhdCB3ZXJlIHJlbW92ZWQgKHdlIGFyZSBzdGlsbCByZXNwb25zaWJsZSBmb3IgZGlzcG9zaW5nIHRoZW0sIHNpbmNlIHdlIGRpZG4ndCBnZXRcbiAgICAvLyBzeW5jdHJlZSB0byBoYXBwZW4gZm9yIHRoZW0pLlxuICAgIHdoaWxlICggdGhpcy5pbnN0YW5jZVJlbW92YWxDaGVja0xpc3QubGVuZ3RoICkge1xuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLmluc3RhbmNlUmVtb3ZhbENoZWNrTGlzdC5wb3AoKTtcblxuICAgICAgLy8gdGhleSBjb3VsZCBoYXZlIGFscmVhZHkgYmVlbiBkaXNwb3NlZCwgc28gd2UgbmVlZCBhIGd1YXJkIGhlcmVcbiAgICAgIGlmICggY2hpbGQuYWN0aXZlICkge1xuICAgICAgICBjaGlsZC5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UgZG9uJ3Qgb3JpZ2luYWxseSBhZGQgaW4gdGhlIGxpc3RlbmVyIGlmIHdlIGFyZSBzdGF0ZWxlc3NcbiAgICBpZiAoICF0aGlzLnN0YXRlbGVzcyApIHtcbiAgICAgIHRoaXMuZGV0YWNoTm9kZUxpc3RlbmVycygpO1xuICAgIH1cblxuICAgIHRoaXMubm9kZS5yZW1vdmVJbnN0YW5jZSggdGhpcyApO1xuXG4gICAgLy8gcmVsZWFzZSBvdXIgcmVmZXJlbmNlIHRvIGEgc2hhcmVkIGNhY2hlIGlmIGFwcGxpY2FibGUsIGFuZCBkaXNwb3NlIGlmIHRoZXJlIGFyZSBubyBvdGhlciByZWZlcmVuY2VzXG4gICAgaWYgKCB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UgKSB7XG4gICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuZXh0ZXJuYWxSZWZlcmVuY2VDb3VudC0tO1xuICAgICAgaWYgKCB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuZXh0ZXJuYWxSZWZlcmVuY2VDb3VudCA9PT0gMCApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZGlzcGxheS5fc2hhcmVkQ2FudmFzSW5zdGFuY2VzWyB0aGlzLm5vZGUuZ2V0SWQoKSBdO1xuICAgICAgICB0aGlzLnNoYXJlZENhY2hlSW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNsZWFuIG91ciB2YXJpYWJsZXMgb3V0IHRvIHJlbGVhc2UgbWVtb3J5XG4gICAgdGhpcy5jbGVhbkluc3RhbmNlKCBudWxsLCBudWxsICk7XG5cbiAgICB0aGlzLnZpc2libGVFbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgIHRoaXMucmVsYXRpdmVWaXNpYmxlRW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLnNlbGZWaXNpYmxlRW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmNhblZvaWNlRW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkluc3RhbmNlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gZnJhbWVJZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrc1xuICAgKi9cbiAgYXVkaXQoIGZyYW1lSWQsIGFsbG93VmFsaWRhdGlvbk5vdE5lZWRlZENoZWNrcyApIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBpZiAoIGZyYW1lSWQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgZnJhbWVJZCA9IHRoaXMuZGlzcGxheS5fZnJhbWVJZDtcbiAgICAgIH1cblxuICAgICAgYXNzZXJ0U2xvdyggIXRoaXMuc3RhdGVsZXNzLFxuICAgICAgICAnU3RhdGUgaXMgcmVxdWlyZWQgZm9yIGFsbCBkaXNwbGF5IGluc3RhbmNlcycgKTtcblxuICAgICAgYXNzZXJ0U2xvdyggKCB0aGlzLmZpcnN0RHJhd2FibGUgPT09IG51bGwgKSA9PT0gKCB0aGlzLmxhc3REcmF3YWJsZSA9PT0gbnVsbCApLFxuICAgICAgICAnRmlyc3QvbGFzdCBkcmF3YWJsZXMgbmVlZCB0byBib3RoIGJlIG51bGwgb3Igbm9uLW51bGwnICk7XG5cbiAgICAgIGFzc2VydFNsb3coICggIXRoaXMuaXNCYWNrYm9uZSAmJiAhdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgKSB8fCB0aGlzLmdyb3VwRHJhd2FibGUsXG4gICAgICAgICdJZiB3ZSBhcmUgYSBiYWNrYm9uZSBvciBzaGFyZWQgY2FjaGUsIHdlIG5lZWQgdG8gaGF2ZSBhIGdyb3VwRHJhd2FibGUgcmVmZXJlbmNlJyApO1xuXG4gICAgICBhc3NlcnRTbG93KCAhdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgfHwgIXRoaXMubm9kZS5pc1BhaW50ZWQoKSB8fCB0aGlzLnNlbGZEcmF3YWJsZSxcbiAgICAgICAgJ1dlIG5lZWQgdG8gaGF2ZSBhIHNlbGZEcmF3YWJsZSBpZiB3ZSBhcmUgcGFpbnRlZCBhbmQgbm90IGEgc2hhcmVkIGNhY2hlJyApO1xuXG4gICAgICBhc3NlcnRTbG93KCAoICF0aGlzLmlzVHJhbnNmb3JtZWQgJiYgIXRoaXMuaXNDYW52YXNDYWNoZSApIHx8IHRoaXMuZ3JvdXBEcmF3YWJsZSxcbiAgICAgICAgJ1dlIG5lZWQgdG8gaGF2ZSBhIGdyb3VwRHJhd2FibGUgaWYgd2UgYXJlIGEgYmFja2JvbmUgb3IgYW55IHR5cGUgb2YgY2FudmFzIGNhY2hlJyApO1xuXG4gICAgICBhc3NlcnRTbG93KCAhdGhpcy5pc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIgfHwgdGhpcy5zaGFyZWRDYWNoZURyYXdhYmxlLFxuICAgICAgICAnV2UgbmVlZCB0byBoYXZlIGEgc2hhcmVkQ2FjaGVEcmF3YWJsZSBpZiB3ZSBhcmUgYSBzaGFyZWQgY2FjaGUnICk7XG5cbiAgICAgIGFzc2VydFNsb3coIHRoaXMuYWRkUmVtb3ZlQ291bnRlciA9PT0gMCxcbiAgICAgICAgJ091ciBhZGRSZW1vdmVDb3VudGVyIHNob3VsZCBhbHdheXMgYmUgMCBhdCB0aGUgZW5kIG9mIHN5bmNUcmVlJyApO1xuXG4gICAgICAvLyB2YWxpZGF0ZSB0aGUgc3VidHJlZVxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcblxuICAgICAgICBjaGlsZEluc3RhbmNlLmF1ZGl0KCBmcmFtZUlkLCBhbGxvd1ZhbGlkYXRpb25Ob3ROZWVkZWRDaGVja3MgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZWxhdGl2ZVRyYW5zZm9ybS5hdWRpdCggZnJhbWVJZCwgYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzICk7XG5cbiAgICAgIHRoaXMuZml0dGFiaWxpdHkuYXVkaXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBjaGVja3MgdG8gbWFrZSBzdXJlIG91ciB2aXNpYmlsaXR5IHRyYWNraW5nIGlzIHdvcmtpbmcgYXMgZXhwZWN0ZWQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBwYXJlbnRWaXNpYmxlXG4gICAqL1xuICBhdWRpdFZpc2liaWxpdHkoIHBhcmVudFZpc2libGUgKSB7XG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgY29uc3QgdmlzaWJsZSA9IHBhcmVudFZpc2libGUgJiYgdGhpcy5ub2RlLmlzVmlzaWJsZSgpO1xuICAgICAgY29uc3QgdHJhaWxWaXNpYmxlID0gdGhpcy50cmFpbC5pc1Zpc2libGUoKTtcbiAgICAgIGFzc2VydFNsb3coIHZpc2libGUgPT09IHRyYWlsVmlzaWJsZSwgJ1RyYWlsIHZpc2liaWxpdHkgZmFpbHVyZScgKTtcbiAgICAgIGFzc2VydFNsb3coIHZpc2libGUgPT09IHRoaXMudmlzaWJsZSwgJ1Zpc2libGUgZmxhZyBmYWlsdXJlJyApO1xuXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnZvaWNpbmdWaXNpYmxlID09PSBfLnJlZHVjZSggdGhpcy50cmFpbC5ub2RlcywgKCB2YWx1ZSwgbm9kZSApID0+IHZhbHVlICYmIG5vZGUudm9pY2luZ1Zpc2libGVQcm9wZXJ0eS52YWx1ZSwgdHJ1ZSApLFxuICAgICAgICAnV2hlbiB0aGlzIEluc3RhbmNlIGlzIHZvaWNpbmdWaXNpYmxlOiB0cnVlLCBhbGwgVHJhaWwgTm9kZXMgbXVzdCBhbHNvIGJlIHZvaWNpbmdWaXNpYmxlOiB0cnVlJyApO1xuXG4gICAgICAvLyB2YWxpZGF0ZSB0aGUgc3VidHJlZVxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgY2hpbGRJbnN0YW5jZSA9IHRoaXMuY2hpbGRyZW5bIGkgXTtcblxuICAgICAgICBjaGlsZEluc3RhbmNlLmF1ZGl0VmlzaWJpbGl0eSggdmlzaWJsZSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IG9sZEZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBvbGRMYXN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBuZXdGaXJzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gbmV3TGFzdERyYXdhYmxlXG4gICAqL1xuICBhdWRpdENoYW5nZUludGVydmFscyggb2xkRmlyc3REcmF3YWJsZSwgb2xkTGFzdERyYXdhYmxlLCBuZXdGaXJzdERyYXdhYmxlLCBuZXdMYXN0RHJhd2FibGUgKSB7XG4gICAgaWYgKCBvbGRGaXJzdERyYXdhYmxlICkge1xuICAgICAgbGV0IG9sZE9uZSA9IG9sZEZpcnN0RHJhd2FibGU7XG5cbiAgICAgIC8vIHNob3VsZCBoaXQsIG9yIHdpbGwgaGF2ZSBOUEVcbiAgICAgIHdoaWxlICggb2xkT25lICE9PSBvbGRMYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIG9sZE9uZSA9IG9sZE9uZS5vbGROZXh0RHJhd2FibGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBuZXdGaXJzdERyYXdhYmxlICkge1xuICAgICAgbGV0IG5ld09uZSA9IG5ld0ZpcnN0RHJhd2FibGU7XG5cbiAgICAgIC8vIHNob3VsZCBoaXQsIG9yIHdpbGwgaGF2ZSBOUEVcbiAgICAgIHdoaWxlICggbmV3T25lICE9PSBuZXdMYXN0RHJhd2FibGUgKSB7XG4gICAgICAgIG5ld09uZSA9IG5ld09uZS5uZXh0RHJhd2FibGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tCZXR3ZWVuKCBhLCBiICkge1xuICAgICAgLy8gaGF2ZSB0aGUgYm9keSBvZiB0aGUgZnVuY3Rpb24gc3RyaXBwZWQgKGl0J3Mgbm90IGluc2lkZSB0aGUgaWYgc3RhdGVtZW50IGR1ZSB0byBKU0hpbnQpXG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICAgIGFzc2VydFNsb3coIGEgIT09IG51bGwgKTtcbiAgICAgICAgYXNzZXJ0U2xvdyggYiAhPT0gbnVsbCApO1xuXG4gICAgICAgIHdoaWxlICggYSAhPT0gYiApIHtcbiAgICAgICAgICBhc3NlcnRTbG93KCBhLm5leHREcmF3YWJsZSA9PT0gYS5vbGROZXh0RHJhd2FibGUsICdDaGFuZ2UgaW50ZXJ2YWwgbWlzbWF0Y2gnICk7XG4gICAgICAgICAgYSA9IGEubmV4dERyYXdhYmxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgY29uc3QgZmlyc3RDaGFuZ2VJbnRlcnZhbCA9IHRoaXMuZmlyc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICAgIGNvbnN0IGxhc3RDaGFuZ2VJbnRlcnZhbCA9IHRoaXMubGFzdENoYW5nZUludGVydmFsO1xuXG4gICAgICBpZiAoICFmaXJzdENoYW5nZUludGVydmFsIHx8IGZpcnN0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgIT09IG51bGwgKSB7XG4gICAgICAgIGFzc2VydFNsb3coIG9sZEZpcnN0RHJhd2FibGUgPT09IG5ld0ZpcnN0RHJhd2FibGUsXG4gICAgICAgICAgJ0lmIHdlIGhhdmUgbm8gY2hhbmdlcywgb3Igb3VyIGZpcnN0IGNoYW5nZSBpbnRlcnZhbCBpcyBub3Qgb3Blbiwgb3VyIGZpcnN0cyBzaG91bGQgYmUgdGhlIHNhbWUnICk7XG4gICAgICB9XG4gICAgICBpZiAoICFsYXN0Q2hhbmdlSW50ZXJ2YWwgfHwgbGFzdENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXIgIT09IG51bGwgKSB7XG4gICAgICAgIGFzc2VydFNsb3coIG9sZExhc3REcmF3YWJsZSA9PT0gbmV3TGFzdERyYXdhYmxlLFxuICAgICAgICAgICdJZiB3ZSBoYXZlIG5vIGNoYW5nZXMsIG9yIG91ciBsYXN0IGNoYW5nZSBpbnRlcnZhbCBpcyBub3Qgb3Blbiwgb3VyIGxhc3RzIHNob3VsZCBiZSB0aGUgc2FtZScgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCAhZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAgICAgYXNzZXJ0U2xvdyggIWxhc3RDaGFuZ2VJbnRlcnZhbCwgJ1dlIHNob3VsZCBub3QgYmUgbWlzc2luZyBvbmx5IG9uZSBjaGFuZ2UgaW50ZXJ2YWwnICk7XG5cbiAgICAgICAgLy8gd2l0aCBubyBjaGFuZ2VzLCBldmVyeXRoaW5nIHNob3VsZCBiZSBpZGVudGljYWxcbiAgICAgICAgb2xkRmlyc3REcmF3YWJsZSAmJiBjaGVja0JldHdlZW4oIG9sZEZpcnN0RHJhd2FibGUsIG9sZExhc3REcmF3YWJsZSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydFNsb3coIGxhc3RDaGFuZ2VJbnRlcnZhbCwgJ1dlIHNob3VsZCBub3QgYmUgbWlzc2luZyBvbmx5IG9uZSBjaGFuZ2UgaW50ZXJ2YWwnICk7XG5cbiAgICAgICAgLy8gZW5kcG9pbnRzXG4gICAgICAgIGlmICggZmlyc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSAhPT0gbnVsbCApIHtcbiAgICAgICAgICAvLyBjaGVjayB0byB0aGUgc3RhcnQgaWYgYXBwbGljYWJsZVxuICAgICAgICAgIGNoZWNrQmV0d2Vlbiggb2xkRmlyc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggbGFzdENoYW5nZUludGVydmFsLmRyYXdhYmxlQWZ0ZXIgIT09IG51bGwgKSB7XG4gICAgICAgICAgLy8gY2hlY2sgdG8gdGhlIGVuZCBpZiBhcHBsaWNhYmxlXG4gICAgICAgICAgY2hlY2tCZXR3ZWVuKCBsYXN0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlciwgb2xkTGFzdERyYXdhYmxlICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBiZXR3ZWVuIGNoYW5nZSBpbnRlcnZhbHMgKHNob3VsZCBhbHdheXMgYmUgZ3VhcmFudGVlZCB0byBiZSBmaXhlZClcbiAgICAgICAgbGV0IGludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDtcbiAgICAgICAgd2hpbGUgKCBpbnRlcnZhbCAmJiBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwgKSB7XG4gICAgICAgICAgY29uc3QgbmV4dEludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuXG4gICAgICAgICAgYXNzZXJ0U2xvdyggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciAhPT0gbnVsbCApO1xuICAgICAgICAgIGFzc2VydFNsb3coIG5leHRJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSAhPT0gbnVsbCApO1xuXG4gICAgICAgICAgY2hlY2tCZXR3ZWVuKCBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLCBuZXh0SW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKTtcblxuICAgICAgICAgIGludGVydmFsID0gbmV4dEludGVydmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5pZH0jJHt0aGlzLm5vZGUgPyBgJHt0aGlzLm5vZGUuY29uc3RydWN0b3IubmFtZSA/IHRoaXMubm9kZS5jb25zdHJ1Y3Rvci5uYW1lIDogJz8nfSMke3RoaXMubm9kZS5pZH1gIDogJy0nfWA7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0luc3RhbmNlJywgSW5zdGFuY2UgKTtcblxuLy8gb2JqZWN0IHBvb2xpbmdcblBvb2xhYmxlLm1peEludG8oIEluc3RhbmNlICk7XG5cbmV4cG9ydCBkZWZhdWx0IEluc3RhbmNlOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsImFycmF5UmVtb3ZlIiwiY2xlYW5BcnJheSIsIlBvb2xhYmxlIiwiQmFja2JvbmVEcmF3YWJsZSIsIkNhbnZhc0Jsb2NrIiwiQ2hhbmdlSW50ZXJ2YWwiLCJEcmF3YWJsZSIsIkZpdHRhYmlsaXR5IiwiSW5saW5lQ2FudmFzQ2FjaGVEcmF3YWJsZSIsIlJlbGF0aXZlVHJhbnNmb3JtIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU2hhcmVkQ2FudmFzQ2FjaGVEcmF3YWJsZSIsIlRyYWlsIiwiVXRpbHMiLCJnbG9iYWxJZENvdW50ZXIiLCJkZWZhdWx0UHJlZmVycmVkUmVuZGVyZXJzIiwiY3JlYXRlT3JkZXJCaXRtYXNrIiwiYml0bWFza1NWRyIsImJpdG1hc2tDYW52YXMiLCJiaXRtYXNrRE9NIiwiYml0bWFza1dlYkdMIiwiSW5zdGFuY2UiLCJpbml0aWFsaXplIiwiZGlzcGxheSIsInRyYWlsIiwiaXNEaXNwbGF5Um9vdCIsImlzU2hhcmVkQ2FudmFzQ2FjaGVSb290IiwiYXNzZXJ0IiwiYWN0aXZlIiwic2V0SW1tdXRhYmxlIiwiaWQiLCJpc1dlYkdMU3VwcG9ydGVkIiwiaXNXZWJHTEFsbG93ZWQiLCJyZWxhdGl2ZVRyYW5zZm9ybSIsImZpdHRhYmlsaXR5IiwidmlzaWJsZSIsInJlbGF0aXZlVmlzaWJsZSIsInNlbGZWaXNpYmxlIiwidmlzaWJpbGl0eURpcnR5IiwiY2hpbGRWaXNpYmlsaXR5RGlydHkiLCJ2b2ljaW5nVmlzaWJsZSIsImJyYW5jaEluZGV4TWFwIiwiYnJhbmNoSW5kZXhSZWZlcmVuY2VzIiwiYWRkUmVtb3ZlQ291bnRlciIsInN0aXRjaENoYW5nZUZyYW1lIiwiX2ZyYW1lSWQiLCJzdGl0Y2hDaGFuZ2VCZWZvcmUiLCJzdGl0Y2hDaGFuZ2VBZnRlciIsInN0aXRjaENoYW5nZU9uQ2hpbGRyZW4iLCJzdGl0Y2hDaGFuZ2VJbmNsdWRlZCIsImNoaWxkSW5zZXJ0ZWRMaXN0ZW5lciIsIm9uQ2hpbGRJbnNlcnRlZCIsImJpbmQiLCJjaGlsZFJlbW92ZWRMaXN0ZW5lciIsIm9uQ2hpbGRSZW1vdmVkIiwiY2hpbGRyZW5SZW9yZGVyZWRMaXN0ZW5lciIsIm9uQ2hpbGRyZW5SZW9yZGVyZWQiLCJ2aXNpYmlsaXR5TGlzdGVuZXIiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJtYXJrUmVuZGVyU3RhdGVEaXJ0eUxpc3RlbmVyIiwibWFya1JlbmRlclN0YXRlRGlydHkiLCJ2aXNpYmxlRW1pdHRlciIsInJlbGF0aXZlVmlzaWJsZUVtaXR0ZXIiLCJzZWxmVmlzaWJsZUVtaXR0ZXIiLCJjYW5Wb2ljZUVtaXR0ZXIiLCJjbGVhbkluc3RhbmNlIiwibm9kZSIsImFkZEluc3RhbmNlIiwiZXh0ZXJuYWxSZWZlcmVuY2VDb3VudCIsInN0YXRlbGVzcyIsInByZWZlcnJlZFJlbmRlcmVycyIsImlzVW5kZXJDYW52YXNDYWNoZSIsImlzQmFja2JvbmUiLCJpc1RyYW5zZm9ybWVkIiwiaXNWaXNpYmlsaXR5QXBwbGllZCIsImlzSW5zdGFuY2VDYW52YXNDYWNoZSIsImlzU2hhcmVkQ2FudmFzQ2FjaGVQbGFjZWhvbGRlciIsImlzU2hhcmVkQ2FudmFzQ2FjaGVTZWxmIiwic2VsZlJlbmRlcmVyIiwiZ3JvdXBSZW5kZXJlciIsInNoYXJlZENhY2hlUmVuZGVyZXIiLCJyZW5kZXJTdGF0ZURpcnR5RnJhbWUiLCJza2lwUHJ1bmluZ0ZyYW1lIiwic2NlbmVyeUxvZyIsInRvU3RyaW5nIiwibGFzdE5vZGUiLCJwYXJlbnQiLCJvbGRQYXJlbnQiLCJjaGlsZHJlbiIsInNoYXJlZENhY2hlSW5zdGFuY2UiLCJpbnN0YW5jZVJlbW92YWxDaGVja0xpc3QiLCJzZWxmRHJhd2FibGUiLCJncm91cERyYXdhYmxlIiwic2hhcmVkQ2FjaGVEcmF3YWJsZSIsImZpcnN0RHJhd2FibGUiLCJsYXN0RHJhd2FibGUiLCJmaXJzdElubmVyRHJhd2FibGUiLCJsYXN0SW5uZXJEcmF3YWJsZSIsInN2Z0dyb3VwcyIsImNsZWFuU3luY1RyZWVSZXN1bHRzIiwiYmVmb3JlU3RhYmxlSW5kZXgiLCJsZW5ndGgiLCJhZnRlclN0YWJsZUluZGV4IiwiZmlyc3RDaGFuZ2VJbnRlcnZhbCIsImxhc3RDaGFuZ2VJbnRlcnZhbCIsImluY29tcGF0aWJsZVN0YXRlQ2hhbmdlIiwiZ3JvdXBDaGFuZ2VkIiwiY2FzY2FkaW5nU3RhdGVDaGFuZ2UiLCJhbnlTdGF0ZUNoYW5nZSIsInVwZGF0ZVJlbmRlcmluZ1N0YXRlIiwicHVzaCIsImdldFN0YXRlU3RyaW5nIiwid2FzQmFja2JvbmUiLCJ3YXNUcmFuc2Zvcm1lZCIsIndhc1Zpc2liaWxpdHlBcHBsaWVkIiwid2FzSW5zdGFuY2VDYW52YXNDYWNoZSIsIndhc1NoYXJlZENhbnZhc0NhY2hlU2VsZiIsIndhc1NoYXJlZENhbnZhc0NhY2hlUGxhY2Vob2xkZXIiLCJ3YXNVbmRlckNhbnZhc0NhY2hlIiwib2xkU2VsZlJlbmRlcmVyIiwib2xkR3JvdXBSZW5kZXJlciIsIm9sZFNoYXJlZENhY2hlUmVuZGVyZXIiLCJvbGRQcmVmZXJyZWRSZW5kZXJlcnMiLCJfcmVuZGVyZXIiLCJwdXNoT3JkZXJCaXRtYXNrIiwiaGFzQ2xpcCIsImhhc0NsaXBBcmVhIiwiaGFzRmlsdGVycyIsImVmZmVjdGl2ZU9wYWNpdHkiLCJfdXNlc09wYWNpdHkiLCJfZmlsdGVycyIsImhhc05vblNWR0ZpbHRlciIsImhhc05vbkNhbnZhc0ZpbHRlciIsImkiLCJmaWx0ZXIiLCJpc1NWR0NvbXBhdGlibGUiLCJpc0NhbnZhc0NvbXBhdGlibGUiLCJyZXF1aXJlc1NwbGl0IiwiX2Nzc1RyYW5zZm9ybSIsIl9sYXllclNwbGl0IiwiYmFja2JvbmVSZXF1aXJlZCIsImFwcGx5VHJhbnNwYXJlbmN5V2l0aEJsb2NrIiwiX3JlbmRlcmVyU3VtbWFyeSIsImlzU3VidHJlZVJlbmRlcmVkRXhjbHVzaXZlbHlTVkciLCJpc1N1YnRyZWVSZW5kZXJlZEV4Y2x1c2l2ZWx5Q2FudmFzIiwidXNlQmFja2JvbmUiLCJfY2FudmFzQ2FjaGUiLCJpc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCIsImNvbnN0cnVjdG9yIiwibmFtZSIsIl9zaW5nbGVDYWNoZSIsImFyZUJvdW5kc1ZhbGlkIiwiaXNQYWludGVkIiwic3VwcG9ydGVkTm9kZUJpdG1hc2siLCJfcmVuZGVyZXJCaXRtYXNrIiwiaW52YWxpZEJpdG1hc2tzIiwiYml0bWFza09yZGVyIiwibWFya0NoaWxkVmlzaWJpbGl0eURpcnR5IiwiY2hlY2tTZWxmRml0dGFiaWxpdHkiLCJwb3AiLCJyZXN1bHQiLCJiYXNlU3luY1RyZWUiLCJzeW5jVHJlZSIsImlzTG9nZ2luZ1BlcmZvcm1hbmNlIiwicGVyZlN5bmNUcmVlQ291bnQiLCJ3YXNTdGF0ZWxlc3MiLCJhc3NlcnRTbG93IiwibWFya1RyYW5zZm9ybVJvb3REaXJ0eSIsImF0dGFjaE5vZGVMaXN0ZW5lcnMiLCJzaGFyZWRTeW5jVHJlZSIsInByZXBhcmVDaGlsZEluc3RhbmNlcyIsIm9sZEZpcnN0RHJhd2FibGUiLCJvbGRMYXN0RHJhd2FibGUiLCJvbGRGaXJzdElubmVyRHJhd2FibGUiLCJvbGRMYXN0SW5uZXJEcmF3YWJsZSIsInNlbGZDaGFuZ2VkIiwidXBkYXRlU2VsZkRyYXdhYmxlIiwibG9jYWxTeW5jVHJlZSIsImF1ZGl0Q2hhbmdlSW50ZXJ2YWxzIiwiZ3JvdXBTeW5jVHJlZSIsImZyYW1lSWQiLCJjdXJyZW50RHJhd2FibGUiLCJuZXdGb3JEaXNwbGF5IiwiY3VycmVudENoYW5nZUludGVydmFsIiwibGFzdFVuY2hhbmdlZERyYXdhYmxlIiwiY2hpbGRJbnN0YW5jZSIsImlzQ29tcGF0aWJsZSIsInVwZGF0ZUluY29tcGF0aWJsZUNoaWxkSW5zdGFuY2UiLCJpbmNsdWRlQ2hpbGREcmF3YWJsZXMiLCJzaG91bGRJbmNsdWRlSW5QYXJlbnREcmF3YWJsZXMiLCJjb25uZWN0RHJhd2FibGVzIiwid2FzSW5jbHVkZWQiLCJpc0luY2x1ZGVkIiwiZmlyc3RDaGlsZENoYW5nZUludGVydmFsIiwiaXNCZWZvcmVPcGVuIiwiZHJhd2FibGVBZnRlciIsImlzQWZ0ZXJPcGVuIiwiZHJhd2FibGVCZWZvcmUiLCJuZWVkc0JyaWRnZSIsImJyaWRnZSIsIm5leHRDaGFuZ2VJbnRlcnZhbCIsImVuZGluZ0JyaWRnZSIsImZpcnN0RHJhd2FibGVDaGVjayIsImoiLCJsYXN0RHJhd2FibGVDaGVjayIsImsiLCJyZW5kZXJlciIsImJpdG1hc2tSZW5kZXJlckFyZWEiLCJtYXJrRm9yRGlzcG9zYWwiLCJjcmVhdGVTZWxmRHJhd2FibGUiLCJhbmNlc3RvcnNGaXR0YWJsZSIsImluZGV4IiwiYWZmZWN0ZWRJbnN0YW5jZUNvdW50IiwiZ2V0RGVzY2VuZGFudENvdW50IiwiUGVyZkNyaXRpY2FsIiwidG9QYXRoU3RyaW5nIiwiUGVyZk1ham9yIiwiUGVyZk1pbm9yIiwibWFya0luc3RhbmNlUm9vdEZvckRpc3Bvc2FsIiwicmVwbGFjZW1lbnRJbnN0YW5jZSIsImNyZWF0ZUZyb21Qb29sIiwiY29weSIsImFkZERlc2NlbmRhbnQiLCJyZXBsYWNlSW5zdGFuY2VXaXRoSW5kZXgiLCJkaXNjb25uZWN0QmVmb3JlIiwiZGlzY29ubmVjdEFmdGVyIiwiZ2V0VHJhbnNmb3JtUm9vdEluc3RhbmNlIiwic3RpdGNoIiwic2V0Rml0dGFibGUiLCJlbnN1cmVTaGFyZWRDYWNoZUluaXRpYWxpemVkIiwiaW5zdGFuY2VUb01hcmsiLCJjaGlsZCIsImFwcGVuZEluc3RhbmNlIiwiaW5zdGFuY2VLZXkiLCJnZXRJZCIsIl9zaGFyZWRDYW52YXNJbnN0YW5jZXMiLCJpc1Zpc2libGUiLCJpc0V4Y2x1ZGVJbnZpc2libGUiLCJmaW5kUHJldmlvdXNEcmF3YWJsZSIsImNoaWxkSW5kZXgiLCJvcHRpb24iLCJmaW5kTmV4dERyYXdhYmxlIiwibGVuIiwiaW5zdGFuY2UiLCJpbnNlcnRJbnN0YW5jZSIsIkluc3RhbmNlVHJlZSIsInNwbGljZSIsIm9uSW5zZXJ0IiwicmVtb3ZlSW5zdGFuY2UiLCJyZW1vdmVJbnN0YW5jZVdpdGhJbmRleCIsIl8iLCJpbmRleE9mIiwib25SZW1vdmUiLCJyZW9yZGVySW5zdGFuY2VzIiwibWluQ2hhbmdlSW5kZXgiLCJtYXhDaGFuZ2VJbmRleCIsImZpbmRDaGlsZEluc3RhbmNlT25Ob2RlIiwiX2NoaWxkcmVuIiwiTWF0aCIsIm1pbiIsIm1heCIsImluc3RhbmNlcyIsImdldEluc3RhbmNlcyIsImNoaWxkTm9kZSIsIm1hcmtTa2lwUHJ1bmluZyIsIm9uT3BhY2l0eUNoYW5nZSIsInVwZGF0ZURyYXdhYmxlRml0dGFiaWxpdHkiLCJmaXR0YWJsZSIsInVwZGF0ZVZpc2liaWxpdHkiLCJwYXJlbnRHbG9iYWxseVZpc2libGUiLCJwYXJlbnRHbG9iYWxseVZvaWNpbmdWaXNpYmxlIiwicGFyZW50UmVsYXRpdmVseVZpc2libGUiLCJ1cGRhdGVGdWxsU3VidHJlZSIsIm5vZGVWaXNpYmxlIiwid2FzVmlzaWJsZSIsIndhc1JlbGF0aXZlVmlzaWJsZSIsIndhc1NlbGZWaXNpYmxlIiwibm9kZVZvaWNpbmdWaXNpYmxlIiwidm9pY2luZ1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwid2FzVm9pY2luZ1Zpc2libGUiLCJjb3VsZFZvaWNlIiwiZW1pdCIsImNhblZvaWNlIiwiY291bnQiLCJhZGRTVkdHcm91cCIsImdyb3VwIiwicmVtb3ZlU1ZHR3JvdXAiLCJsb29rdXBTVkdHcm91cCIsImJsb2NrIiwiZ2V0RmlsdGVyUm9vdEluc3RhbmNlIiwiZ2V0VmlzaWJpbGl0eVJvb3RJbnN0YW5jZSIsImNoaWxkSW5zZXJ0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJjaGlsZFJlbW92ZWRFbWl0dGVyIiwiY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyIiwidmlzaWJsZVByb3BlcnR5IiwibGF6eUxpbmsiLCJmaWx0ZXJDaGFuZ2VFbWl0dGVyIiwiY2xpcEFyZWFQcm9wZXJ0eSIsImluc3RhbmNlUmVmcmVzaEVtaXR0ZXIiLCJkZXRhY2hOb2RlTGlzdGVuZXJzIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bmxpbmsiLCJnZXRCcmFuY2hJbmRleFRvIiwiY2FjaGVkVmFsdWUiLCJ1bmRlZmluZWQiLCJicmFuY2hJbmRleCIsImRpc3Bvc2UiLCJyZWZlcmVuY2VJbnN0YW5jZSIsImRpc3Bvc2VJbW1lZGlhdGVseSIsIm51bUNoaWxkcmVuIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiZnJlZVRvUG9vbCIsImF1ZGl0IiwiYWxsb3dWYWxpZGF0aW9uTm90TmVlZGVkQ2hlY2tzIiwiaXNDYW52YXNDYWNoZSIsImF1ZGl0VmlzaWJpbGl0eSIsInBhcmVudFZpc2libGUiLCJ0cmFpbFZpc2libGUiLCJyZWR1Y2UiLCJub2RlcyIsIm5ld0ZpcnN0RHJhd2FibGUiLCJuZXdMYXN0RHJhd2FibGUiLCJvbGRPbmUiLCJvbGROZXh0RHJhd2FibGUiLCJuZXdPbmUiLCJuZXh0RHJhd2FibGUiLCJjaGVja0JldHdlZW4iLCJhIiwiYiIsImludGVydmFsIiwibmV4dEludGVydmFsIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCQyxHQUVELE9BQU9BLGlCQUFpQixrQ0FBa0M7QUFDMUQsT0FBT0MsaUJBQWlC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