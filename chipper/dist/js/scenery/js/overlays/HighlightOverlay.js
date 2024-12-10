// Copyright 2015-2024, University of Colorado Boulder
/**
 * An overlay that implements highlights for a Display. This is responsible for drawing the highlights and
 * observing Properties or Emitters that dictate when highlights should become active. A highlight surrounds a Node
 * to indicate that it is in focus or relevant.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { isReadingBlock } from '../accessibility/voicing/ReadingBlock.js';
import { ActivatedReadingBlockHighlight, Display, FocusManager, HighlightFromNode, HighlightPath, isInteractiveHighlighting, Node, scenery, TransformTracker } from '../imports.js';
// colors for the focus highlights, can be changed for different application backgrounds or color profiles, see
// the setters and getters below for these values.
let outerHighlightColor = HighlightPath.OUTER_FOCUS_COLOR;
let innerHighlightColor = HighlightPath.INNER_FOCUS_COLOR;
let innerGroupHighlightColor = HighlightPath.INNER_LIGHT_GROUP_FOCUS_COLOR;
let outerGroupHighlightColor = HighlightPath.OUTER_LIGHT_GROUP_FOCUS_COLOR;
let HighlightOverlay = class HighlightOverlay {
    /**
   * Releases references
   */ dispose() {
        if (this.hasHighlight()) {
            this.deactivateHighlight();
        }
        FocusManager.pdomFocusProperty.unlink(this.domFocusListener);
        this.pdomFocusHighlightsVisibleProperty.unlink(this.focusHighlightsVisibleListener);
        this.interactiveHighlightsVisibleProperty.unlink(this.voicingHighlightsVisibleListener);
        this.display.focusManager.pointerFocusProperty.unlink(this.pointerFocusListener);
        this.display.focusManager.readingBlockFocusProperty.unlink(this.readingBlockFocusListener);
        this.focusDisplay.dispose();
    }
    /**
   * Returns whether or not this HighlightOverlay is displaying some highlight.
   */ hasHighlight() {
        return !!this.trail;
    }
    /**
   * Returns true if there is an active highlight around a ReadingBlock while the voicingManager is speaking its
   * Voicing content.
   */ hasReadingBlockHighlight() {
        return !!this.readingBlockTrail;
    }
    /**
   * Activates the highlight, choosing a mode for whether the highlight will be a shape, node, or bounds.
   *
   * @param trail - The focused trail to highlight. It assumes that this trail is in this display.
   * @param node - Node receiving the highlight
   * @param nodeHighlight - the highlight to use
   * @param layerable - Is the highlight layerable in the scene graph?
   * @param visibleProperty - Property controlling the visibility for the provided highlight
   */ activateHighlight(trail, node, nodeHighlight, layerable, visibleProperty) {
        this.trail = trail;
        this.node = node;
        const highlight = nodeHighlight;
        this.activeHighlight = highlight;
        // we may or may not track this trail depending on whether the focus highlight surrounds the trail's leaf node or
        // a different node
        let trailToTrack = trail;
        // Invisible mode - no focus highlight; this is only for testing mode, when Nodes rarely have bounds.
        if (highlight === 'invisible') {
            this.mode = 'invisible';
        } else if (highlight instanceof Shape) {
            this.mode = 'shape';
            this.shapeFocusHighlightPath.visible = true;
            this.shapeFocusHighlightPath.setShape(highlight);
        } else if (highlight instanceof Node) {
            this.mode = 'node';
            // if using a focus highlight from another node, we will track that node's transform instead of the focused node
            if (highlight instanceof HighlightPath) {
                if (highlight.transformSourceNode) {
                    trailToTrack = highlight.getUniqueHighlightTrail(this.trail);
                }
            }
            // store the focus highlight so that it can be removed later
            this.nodeModeHighlight = highlight;
            if (layerable) {
                // flag so that we know how to deactivate in this case
                this.nodeModeHighlightLayered = true;
                // the focusHighlight is just a node in the scene graph, so set it visible - visibility of other highlights
                // controlled by visibility of parent Nodes but that cannot be done in this case because the highlight
                // can be anywhere in the scene graph, so have to check pdomFocusHighlightsVisibleProperty
                this.nodeModeHighlight.visible = visibleProperty.get();
            } else {
                // the node is already in the scene graph, so this will set visibility
                // for all instances.
                this.nodeModeHighlight.visible = true;
                // Use the node itself as the highlight
                this.highlightNode.addChild(this.nodeModeHighlight);
            }
        } else {
            this.mode = 'bounds';
            this.boundsFocusHighlightPath.setShapeFromNode(this.node, this.trail);
            this.boundsFocusHighlightPath.visible = true;
            this.node.localBoundsProperty.lazyLink(this.boundsListener);
            this.onBoundsChange();
        }
        this.transformTracker = new TransformTracker(trailToTrack, {
            isStatic: true
        });
        this.transformTracker.addListener(this.transformListener);
        // handle group focus highlights
        this.activateGroupHighlights();
        // update highlight colors if necessary
        this.updateHighlightColors();
        this.transformDirty = true;
    }
    /**
   * Activate a focus highlight, activating the highlight and adding a listener that will update the highlight whenever
   * the Node's focusHighlight changes
   */ activateFocusHighlight(trail, node) {
        this.activateHighlight(trail, node, node.focusHighlight, node.focusHighlightLayerable, this.pdomFocusHighlightsVisibleProperty);
        // handle any changes to the focus highlight while the node has focus
        node.focusHighlightChangedEmitter.addListener(this.focusHighlightListener);
    }
    /**
   * Activate an interactive highlight, activating the highlight and adding a listener that will update the highlight
   * changes while it is active.
   */ activateInteractiveHighlight(trail, node) {
        this.activateHighlight(trail, node, node.interactiveHighlight || node.focusHighlight, node.interactiveHighlightLayerable, this.interactiveHighlightsVisibleProperty);
        // sanity check that our Node actually uses InteractiveHighlighting
        assert && assert(isInteractiveHighlighting(node), 'Node does not support any kind of interactive highlighting.');
        node.interactiveHighlightChangedEmitter.addListener(this.interactiveHighlightListener);
        // handle changes to the highlight while it is active - Since the highlight can fall back to the focus highlight
        // watch for updates to redraw when that highlight changes as well.
        node.focusHighlightChangedEmitter.addListener(this.interactiveHighlightListener);
    }
    /**
   * Activate the Reading Block highlight. This highlight is separate from others in the overlay and will always
   * surround the Bounds of the focused Node. It is shown in response to certain input on Nodes with Voicing while
   * the voicingManager is speaking.
   *
   * Note that customizations for this highlight are not supported at this time, that could be added in the future if
   * we need.
   */ activateReadingBlockHighlight(trail) {
        this.readingBlockTrail = trail;
        const node = trail.lastNode();
        assert && assert(isReadingBlock(node), 'should not activate a reading block highlight for a Node that is not a ReadingBlock');
        if (isReadingBlock(node)) {
            this.activeReadingBlockNode = node;
            const readingBlockHighlight = this.activeReadingBlockNode.readingBlockActiveHighlight;
            this.addedReadingBlockHighlight = readingBlockHighlight;
            if (readingBlockHighlight === 'invisible') {
            // nothing to draw
            } else if (readingBlockHighlight instanceof Shape) {
                this.readingBlockHighlightPath.setShape(readingBlockHighlight);
                this.readingBlockHighlightPath.visible = true;
            } else if (readingBlockHighlight instanceof Node) {
                // node mode
                this.readingBlockHighlightNode.addChild(readingBlockHighlight);
            } else {
                // bounds mode
                this.readingBlockHighlightPath.setShapeFromNode(this.activeReadingBlockNode, this.readingBlockTrail);
                this.readingBlockHighlightPath.visible = true;
            }
            // update the highlight if the transform for the Node ever changes
            this.readingBlockTransformTracker = new TransformTracker(this.readingBlockTrail, {
                isStatic: true
            });
            this.readingBlockTransformTracker.addListener(this.readingBlockTransformListener);
            // update the highlight if it is changed on the Node while active
            this.activeReadingBlockNode.readingBlockActiveHighlightChangedEmitter.addListener(this.readingBlockHighlightChangeListener);
            this.readingBlockTransformDirty = true;
        }
    }
    /**
   * Deactivate the speaking highlight by making it invisible.
   */ deactivateReadingBlockHighlight() {
        this.readingBlockHighlightPath.visible = false;
        if (this.addedReadingBlockHighlight instanceof Node) {
            this.readingBlockHighlightNode.removeChild(this.addedReadingBlockHighlight);
        }
        assert && assert(this.readingBlockTransformTracker, 'How can we deactivate the TransformTracker if it wasnt assigned.');
        const transformTracker = this.readingBlockTransformTracker;
        transformTracker.removeListener(this.readingBlockTransformListener);
        transformTracker.dispose();
        this.readingBlockTransformTracker = null;
        assert && assert(this.activeReadingBlockNode, 'How can we deactivate the activeReadingBlockNode if it wasnt assigned.');
        this.activeReadingBlockNode.readingBlockActiveHighlightChangedEmitter.removeListener(this.readingBlockHighlightChangeListener);
        this.activeReadingBlockNode = null;
        this.readingBlockTrail = null;
        this.addedReadingBlockHighlight = null;
    }
    /**
   * Deactivates the all active highlights, disposing and removing listeners as necessary.
   */ deactivateHighlight() {
        assert && assert(this.node, 'Need an active Node to deactivate highlights');
        const activeNode = this.node;
        if (this.mode === 'shape') {
            this.shapeFocusHighlightPath.visible = false;
        } else if (this.mode === 'node') {
            assert && assert(this.nodeModeHighlight, 'How can we deactivate if nodeModeHighlight is not assigned');
            // Note it is possible and acceptable that this has been previously disposed, before deactivateHighlight.
            // If we want to re-sequence the calls to make sure this is never disposed at this point, it puts a burden
            // on the client to make sure to blur() at the appropriate point beforehand.
            const nodeModeHighlight = this.nodeModeHighlight;
            // If layered, client has put the Node where they want in the scene graph and we cannot remove it
            if (this.nodeModeHighlightLayered) {
                this.nodeModeHighlightLayered = false;
            } else {
                !nodeModeHighlight.isDisposed && this.highlightNode.removeChild(nodeModeHighlight);
            }
            if (!nodeModeHighlight.isDisposed) {
                nodeModeHighlight.visible = false;
            }
            // node focus highlight can be cleared now that it has been removed
            this.nodeModeHighlight = null;
        } else if (this.mode === 'bounds') {
            this.boundsFocusHighlightPath.visible = false;
            activeNode.localBoundsProperty.unlink(this.boundsListener);
        }
        // remove listeners that redraw the highlight if a type of highlight changes on the Node
        if (activeNode.focusHighlightChangedEmitter.hasListener(this.focusHighlightListener)) {
            activeNode.focusHighlightChangedEmitter.removeListener(this.focusHighlightListener);
        }
        if (isInteractiveHighlighting(activeNode)) {
            if (activeNode.interactiveHighlightChangedEmitter.hasListener(this.interactiveHighlightListener)) {
                activeNode.interactiveHighlightChangedEmitter.removeListener(this.interactiveHighlightListener);
            }
            if (activeNode.focusHighlightChangedEmitter.hasListener(this.interactiveHighlightListener)) {
                activeNode.focusHighlightChangedEmitter.removeListener(this.interactiveHighlightListener);
            }
        }
        // remove all 'group' focus highlights
        this.deactivateGroupHighlights();
        this.trail = null;
        this.node = null;
        this.mode = null;
        this.activeHighlight = null;
        this.transformTracker.removeListener(this.transformListener);
        this.transformTracker.dispose();
        this.transformTracker = null;
    }
    /**
   * Activate all 'group' focus highlights by searching for ancestor nodes from the node that has focus
   * and adding a rectangle around it if it has a "groupFocusHighlight". A group highlight will only appear around
   * the closest ancestor that has a one.
   */ activateGroupHighlights() {
        assert && assert(this.trail, 'must have an active trail to activate group highlights');
        const trail = this.trail;
        for(let i = 0; i < trail.length; i++){
            const node = trail.nodes[i];
            const highlight = node.groupFocusHighlight;
            if (highlight) {
                // update transform tracker
                const trailToParent = trail.upToNode(node);
                this.groupTransformTracker = new TransformTracker(trailToParent);
                this.groupTransformTracker.addListener(this.transformListener);
                if (typeof highlight === 'boolean') {
                    // add a bounding rectangle around the node that uses group highlights
                    this.groupFocusHighlightPath.setShapeFromNode(node, trailToParent);
                    this.groupFocusHighlightPath.visible = true;
                    this.groupHighlightNode = this.groupFocusHighlightPath;
                    this.groupMode = 'bounds';
                } else if (highlight instanceof Node) {
                    this.groupHighlightNode = highlight;
                    this.groupFocusHighlightParent.addChild(highlight);
                    this.groupMode = 'node';
                }
                break;
            }
        }
    }
    /**
   * Update focus highlight colors. This is a no-op if we are in 'node' mode, or if none of the highlight colors
   * have changed.
   *
   * TODO: Support updating focus highlight strokes in 'node' mode as well? https://github.com/phetsims/scenery/issues/1581
   */ updateHighlightColors() {
        if (this.mode === 'shape') {
            if (this.shapeFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerHighlightColor()) {
                this.shapeFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerHighlightColor());
            }
            if (this.shapeFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterHighlightColor()) {
                this.shapeFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterHighlightColor());
            }
        } else if (this.mode === 'bounds') {
            if (this.boundsFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerHighlightColor()) {
                this.boundsFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerHighlightColor());
            }
            if (this.boundsFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterHighlightColor()) {
                this.boundsFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterHighlightColor());
            }
        }
        // if a group focus highlight is active, update strokes
        if (this.groupMode) {
            if (this.groupFocusHighlightPath.innerHighlightColor !== HighlightOverlay.getInnerGroupHighlightColor()) {
                this.groupFocusHighlightPath.setInnerHighlightColor(HighlightOverlay.getInnerGroupHighlightColor());
            }
            if (this.groupFocusHighlightPath.outerHighlightColor !== HighlightOverlay.getOuterGroupHighlightColor()) {
                this.groupFocusHighlightPath.setOuterHighlightColor(HighlightOverlay.getOuterGroupHighlightColor());
            }
        }
    }
    /**
   * Remove all group focus highlights by making them invisible, or removing them from the root of this overlay,
   * depending on mode.
   */ deactivateGroupHighlights() {
        if (this.groupMode) {
            if (this.groupMode === 'bounds') {
                this.groupFocusHighlightPath.visible = false;
            } else if (this.groupMode === 'node') {
                assert && assert(this.groupHighlightNode, 'Need a groupHighlightNode to deactivate this mode');
                this.groupFocusHighlightParent.removeChild(this.groupHighlightNode);
            }
            this.groupMode = null;
            this.groupHighlightNode = null;
            assert && assert(this.groupTransformTracker, 'Need a groupTransformTracker to dispose');
            this.groupTransformTracker.removeListener(this.transformListener);
            this.groupTransformTracker.dispose();
            this.groupTransformTracker = null;
        }
    }
    /**
   * Called from HighlightOverlay after transforming the highlight. Only called when the transform changes.
   */ afterTransform() {
        // This matrix makes sure that the line width of the highlight remains appropriately sized, even when the Node
        // (and therefore its highlight) may be scaled. However, we DO want to scale up the highlight line width when
        // the scene is zoomed in from the global pan/zoom listener, so we include that inverted matrix.
        assert && assert(this.transformTracker, 'Must have an active transformTracker to adjust from transformation.');
        const lineWidthScalingMatrix = this.transformTracker.getMatrix().timesMatrix(HighlightPath.getCorrectiveScalingMatrix());
        if (this.mode === 'shape') {
            this.shapeFocusHighlightPath.updateLineWidth(lineWidthScalingMatrix);
        } else if (this.mode === 'bounds') {
            this.boundsFocusHighlightPath.updateLineWidth(lineWidthScalingMatrix);
        } else if (this.mode === 'node' && this.activeHighlight instanceof HighlightPath && this.activeHighlight.updateLineWidth) {
            this.activeHighlight.updateLineWidth(lineWidthScalingMatrix);
        }
        // If the group highlight is active, we need to correct the line widths for that highlight.
        if (this.groupHighlightNode) {
            if (this.groupMode === 'bounds') {
                this.groupFocusHighlightPath.updateLineWidth(lineWidthScalingMatrix);
            } else if (this.groupMode === 'node' && this.groupHighlightNode instanceof HighlightPath && this.groupHighlightNode.updateLineWidth) {
                this.groupHighlightNode.updateLineWidth(lineWidthScalingMatrix);
            }
        }
        // If the ReadingBlock highlight is active, we need to correct the line widths for that highlight.
        if (this.readingBlockTrail) {
            this.readingBlockHighlightPath.updateLineWidth(lineWidthScalingMatrix);
        }
    }
    /**
   * Every time the transform changes on the target Node signify that updates are necessary, see the usage of the
   * TransformTrackers.
   */ onTransformChange() {
        this.transformDirty = true;
    }
    /**
   * Mark that the transform for the ReadingBlock highlight is out of date and needs to be recalculated next update.
   */ onReadingBlockTransformChange() {
        this.readingBlockTransformDirty = true;
    }
    /**
   * Called when bounds change on our node when we are in "Bounds" mode
   */ onBoundsChange() {
        assert && assert(this.node, 'Must have an active node when bounds are changing');
        assert && assert(this.trail, 'Must have an active trail when updating default bounds highlight');
        this.boundsFocusHighlightPath.setShapeFromNode(this.node, this.trail);
    }
    /**
   * Called when the main Scenery focus pair (Display,Trail) changes. The Trail points to the Node that has
   * focus and a highlight will appear around this Node if focus highlights are visible.
   */ onFocusChange(focus) {
        const newTrail = focus && focus.display === this.display ? focus.trail : null;
        if (this.hasHighlight()) {
            this.deactivateHighlight();
        }
        if (newTrail && this.pdomFocusHighlightsVisibleProperty.value) {
            const node = newTrail.lastNode();
            this.activateFocusHighlight(newTrail, node);
        } else if (this.display.focusManager.pointerFocusProperty.value && this.interactiveHighlightsVisibleProperty.value) {
            this.updateInteractiveHighlight(this.display.focusManager.pointerFocusProperty.value);
        }
    }
    /**
   * Called when the pointerFocusProperty changes. pointerFocusProperty will have the Trail to the
   * Node that composes Voicing and is under the Pointer. A highlight will appear around this Node if
   * voicing highlights are visible.
   */ onPointerFocusChange(focus) {
        // updateInteractiveHighlight will only activate the highlight if pdomFocusHighlightsVisibleProperty is false,
        // but check here as well so that we don't do work to deactivate highlights only to immediately reactivate them
        if (!this.display.focusManager.lockedPointerFocusProperty.value && !this.display.focusManager.pdomFocusHighlightsVisibleProperty.value) {
            this.updateInteractiveHighlight(focus);
        }
    }
    /**
   * Redraws the highlight. There are cases where we want to do this regardless of whether the pointer focus
   * is locked, such as when the highlight changes changes for a Node that is activated for highlighting.
   *
   * As of 8/11/21 we also decided that Interactive Highlights should also never be shown while
   * PDOM highlights are visible, to avoid confusing cases where the Interactive Highlight
   * can appear while the DOM focus highlight is active and conveying information. In the future
   * we might make it so that both can be visible at the same time, but that will require
   * changing the look of one of the highlights so it is clear they are distinct.
   */ updateInteractiveHighlight(focus) {
        const newTrail = focus && focus.display === this.display ? focus.trail : null;
        // always clear the highlight if it is being removed
        if (this.hasHighlight()) {
            this.deactivateHighlight();
        }
        // only activate a new highlight if PDOM focus highlights are not displayed, see JSDoc
        let activated = false;
        if (newTrail && !this.display.focusManager.pdomFocusHighlightsVisibleProperty.value) {
            const node = newTrail.lastNode();
            if (isReadingBlock(node) && this.readingBlockHighlightsVisibleProperty.value || !isReadingBlock(node) && isInteractiveHighlighting(node) && this.interactiveHighlightsVisibleProperty.value) {
                this.activateInteractiveHighlight(newTrail, node);
                activated = true;
            }
        }
        if (!activated && FocusManager.pdomFocus && this.pdomFocusHighlightsVisibleProperty.value) {
            this.onFocusChange(FocusManager.pdomFocus);
        }
    }
    /**
   * Called whenever the lockedPointerFocusProperty changes. If the lockedPointerFocusProperty changes we probably
   * have to update the highlight because interaction with a Node that uses InteractiveHighlighting just ended.
   */ onLockedPointerFocusChange(focus) {
        this.updateInteractiveHighlight(focus || this.display.focusManager.pointerFocusProperty.value);
    }
    /**
   * Responsible for deactivating the Reading Block highlight when the display.focusManager.readingBlockFocusProperty changes.
   * The Reading Block waits to activate until the voicingManager starts speaking because there is often a stop speaking
   * event that comes right after the speaker starts to interrupt the previous utterance.
   */ onReadingBlockFocusChange(focus) {
        if (this.hasReadingBlockHighlight()) {
            this.deactivateReadingBlockHighlight();
        }
        const newTrail = focus && focus.display === this.display ? focus.trail : null;
        if (newTrail) {
            this.activateReadingBlockHighlight(newTrail);
        }
    }
    /**
   * If the focused node has an updated focus highlight, we must do all the work of highlight deactivation/activation
   * as if the application focus changed. If focus highlight mode changed, we need to add/remove static listeners,
   * add/remove highlight children, and so on. Called when focus highlight changes, but should only ever be
   * necessary when the node has focus.
   */ onFocusHighlightChange() {
        assert && assert(this.node && this.node.focused, 'update should only be necessary if node already has focus');
        this.onFocusChange(FocusManager.pdomFocus);
    }
    /**
   * If the Node has pointer focus and the interacive highlight changes, we must do all of the work to reapply the
   * highlight as if the value of the focusProperty changed.
   */ onInteractiveHighlightChange() {
        if (assert) {
            assert && assert(isInteractiveHighlighting(this.node));
            if (isInteractiveHighlighting(this.node)) {
                const lockedPointerFocus = this.display.focusManager.lockedPointerFocusProperty.value;
                assert && assert(this.node || lockedPointerFocus && lockedPointerFocus.trail.lastNode() === this.node, 'Update should only be necessary if Node is activated with a Pointer or pointer focus is locked during interaction');
            }
        }
        // Prefer the trail to the 'locked' highlight
        this.updateInteractiveHighlight(this.display.focusManager.lockedPointerFocusProperty.value || this.display.focusManager.pointerFocusProperty.value);
    }
    /**
   * Redraw the highlight for the ReadingBlock if it changes while the reading block highlight is already
   * active for a Node.
   */ onReadingBlockHighlightChange() {
        assert && assert(this.activeReadingBlockNode, 'Update should only be necessary when there is an active ReadingBlock Node');
        assert && assert(this.activeReadingBlockNode.readingBlockActivated, 'Update should only be necessary while the ReadingBlock is activated');
        this.onReadingBlockFocusChange(this.display.focusManager.readingBlockFocusProperty.value);
    }
    /**
   * When focus highlight visibility changes, deactivate highlights or reactivate the highlight around the Node
   * with focus.
   */ onFocusHighlightsVisibleChange() {
        this.onFocusChange(FocusManager.pdomFocus);
    }
    /**
   * When voicing highlight visibility changes, deactivate highlights or reactivate the highlight around the Node
   * with focus. Note that when voicing is disabled we will never set the pointerFocusProperty to prevent
   * extra work, so this function shouldn't do much. But it is here to complete the API.
   */ onVoicingHighlightsVisibleChange() {
        this.onPointerFocusChange(this.display.focusManager.pointerFocusProperty.value);
    }
    /**
   * Called by Display, updates this overlay in the Display.updateDisplay call.
   */ update() {
        // Transform the highlight to match the position of the node
        if (this.hasHighlight() && this.transformDirty) {
            this.transformDirty = false;
            assert && assert(this.transformTracker, 'The transformTracker must be available on update if transform is dirty');
            this.highlightNode.setMatrix(this.transformTracker.matrix);
            if (this.groupHighlightNode) {
                assert && assert(this.groupTransformTracker, 'The groupTransformTracker must be available on update if transform is dirty');
                this.groupHighlightNode.setMatrix(this.groupTransformTracker.matrix);
            }
            this.afterTransform();
        }
        if (this.hasReadingBlockHighlight() && this.readingBlockTransformDirty) {
            this.readingBlockTransformDirty = false;
            assert && assert(this.readingBlockTransformTracker, 'The groupTransformTracker must be available on update if transform is dirty');
            this.readingBlockHighlightNode.setMatrix(this.readingBlockTransformTracker.matrix);
        }
        if (!this.display.size.equals(this.focusDisplay.size)) {
            this.focusDisplay.setWidthHeight(this.display.width, this.display.height);
        }
        this.focusDisplay.updateDisplay();
    }
    /**
   * Set the inner color of all focus highlights.
   */ static setInnerHighlightColor(color) {
        innerHighlightColor = color;
    }
    /**
   * Get the inner color of all focus highlights.
   */ static getInnerHighlightColor() {
        return innerHighlightColor;
    }
    /**
   * Set the outer color of all focus highlights.
   */ static setOuterHilightColor(color) {
        outerHighlightColor = color;
    }
    /**
   * Get the outer color of all focus highlights.
   */ static getOuterHighlightColor() {
        return outerHighlightColor;
    }
    /**
   * Set the inner color of all group focus highlights.
   */ static setInnerGroupHighlightColor(color) {
        innerGroupHighlightColor = color;
    }
    /**
   * Get the inner color of all group focus highlights
   */ static getInnerGroupHighlightColor() {
        return innerGroupHighlightColor;
    }
    /**
   * Set the outer color of all group focus highlight.
   */ static setOuterGroupHighlightColor(color) {
        outerGroupHighlightColor = color;
    }
    /**
   * Get the outer color of all group focus highlights.
   */ static getOuterGroupHighlightColor() {
        return outerGroupHighlightColor;
    }
    constructor(display, focusRootNode, providedOptions){
        // Trail to the node with focus, modified when focus changes
        this.trail = null;
        // Node with focus, modified when focus changes
        this.node = null;
        // A references to the highlight from the Node that is highlighted.
        this.activeHighlight = null;
        // Signifies method of representing focus, 'bounds'|'node'|'shape'|'invisible', modified
        // when focus changes
        this.mode = null;
        // Signifies method off representing group focus, 'bounds'|'node', modified when
        // focus changes
        this.groupMode = null;
        // The group highlight node around an ancestor of this.node when focus changes, see ParallelDOM.setGroupFocusHighlight
        // for more information on the group focus highlight, modified when focus changes
        this.groupHighlightNode = null;
        // Tracks transformations to the focused node and the node with a group focus highlight, modified when focus changes
        this.transformTracker = null;
        this.groupTransformTracker = null;
        // If a node is using a custom focus highlight, a reference is kept so that it can be removed from the overlay when
        // node focus changes.
        this.nodeModeHighlight = null;
        // If true, the active highlight is in "node" mode and is layered in the scene graph. This field lets us deactivate
        // the highlight appropriately when it is in that state.
        this.nodeModeHighlightLayered = false;
        // If true, the next update() will trigger an update to the highlight's transform
        this.transformDirty = true;
        // The main node for the highlight. It will be transformed.
        this.highlightNode = new Node();
        // The main Node for the ReadingBlock highlight, while ReadingBlock content is being spoken by speech synthesis.
        this.readingBlockHighlightNode = new Node();
        // A reference to the Node that is added when a custom node is specified as the active highlight for the
        // ReadingBlock. Stored so that we can remove it when deactivating reading block highlights.
        this.addedReadingBlockHighlight = null;
        // A reference to the Node that is a ReadingBlock which the Voicing framework is currently speaking about.
        this.activeReadingBlockNode = null;
        // Trail to the ReadingBlock Node with an active highlight around it while the voicingManager is speaking its content.
        this.readingBlockTrail = null;
        // Whether the transform applied to the readinBlockHighlightNode is out of date.
        this.readingBlockTransformDirty = true;
        // The TransformTracker used to observe changes to the transform of the Node with Reading Block focus, so that
        // the highlight can match the ReadingBlock.
        this.readingBlockTransformTracker = null;
        const options = optionize()({
            // Controls whether highlights related to DOM focus are visible
            pdomFocusHighlightsVisibleProperty: new BooleanProperty(true),
            // Controls whether highlights related to Interactive Highlights are visible
            interactiveHighlightsVisibleProperty: new BooleanProperty(false),
            // Controls whether highlights associated with ReadingBlocks (of the Voicing feature set) are shown when
            // pointerFocusProperty changes
            readingBlockHighlightsVisibleProperty: new BooleanProperty(false)
        }, providedOptions);
        this.display = display;
        this.focusRootNode = focusRootNode;
        this.focusRootNode.addChild(this.highlightNode);
        this.focusRootNode.addChild(this.readingBlockHighlightNode);
        this.pdomFocusHighlightsVisibleProperty = options.pdomFocusHighlightsVisibleProperty;
        this.interactiveHighlightsVisibleProperty = options.interactiveHighlightsVisibleProperty;
        this.readingBlockHighlightsVisibleProperty = options.readingBlockHighlightsVisibleProperty;
        this.focusDisplay = new Display(this.focusRootNode, {
            allowWebGL: display.isWebGLAllowed(),
            allowCSSHacks: false,
            accessibility: false,
            interactive: false,
            // Layer fitting solved a chrome bug where we could lose focus highlights when tabbing while zoomed in certain
            // cases, see https://github.com/phetsims/scenery/issues/1605
            allowLayerFitting: true
        });
        this.domElement = this.focusDisplay.domElement;
        this.domElement.style.pointerEvents = 'none';
        this.shapeFocusHighlightPath = new HighlightPath(null);
        this.boundsFocusHighlightPath = new HighlightFromNode(null, {
            useLocalBounds: true
        });
        this.highlightNode.addChild(this.shapeFocusHighlightPath);
        this.highlightNode.addChild(this.boundsFocusHighlightPath);
        this.groupFocusHighlightPath = new HighlightFromNode(null, {
            useLocalBounds: true,
            useGroupDilation: true,
            outerLineWidth: HighlightPath.GROUP_OUTER_LINE_WIDTH,
            innerLineWidth: HighlightPath.GROUP_INNER_LINE_WIDTH,
            innerStroke: HighlightPath.OUTER_FOCUS_COLOR
        });
        this.groupFocusHighlightParent = new Node({
            children: [
                this.groupFocusHighlightPath
            ]
        });
        this.focusRootNode.addChild(this.groupFocusHighlightParent);
        this.readingBlockHighlightPath = new ActivatedReadingBlockHighlight(null);
        this.readingBlockHighlightNode.addChild(this.readingBlockHighlightPath);
        // Listeners bound once, so we can access them for removal.
        this.boundsListener = this.onBoundsChange.bind(this);
        this.transformListener = this.onTransformChange.bind(this);
        this.domFocusListener = this.onFocusChange.bind(this);
        this.readingBlockTransformListener = this.onReadingBlockTransformChange.bind(this);
        this.focusHighlightListener = this.onFocusHighlightChange.bind(this);
        this.interactiveHighlightListener = this.onInteractiveHighlightChange.bind(this);
        this.focusHighlightsVisibleListener = this.onFocusHighlightsVisibleChange.bind(this);
        this.voicingHighlightsVisibleListener = this.onVoicingHighlightsVisibleChange.bind(this);
        this.pointerFocusListener = this.onPointerFocusChange.bind(this);
        this.lockedPointerFocusListener = this.onLockedPointerFocusChange.bind(this);
        this.readingBlockFocusListener = this.onReadingBlockFocusChange.bind(this);
        this.readingBlockHighlightChangeListener = this.onReadingBlockHighlightChange.bind(this);
        FocusManager.pdomFocusProperty.link(this.domFocusListener);
        display.focusManager.pointerFocusProperty.link(this.pointerFocusListener);
        display.focusManager.readingBlockFocusProperty.link(this.readingBlockFocusListener);
        display.focusManager.lockedPointerFocusProperty.link(this.lockedPointerFocusListener);
        this.pdomFocusHighlightsVisibleProperty.link(this.focusHighlightsVisibleListener);
        this.interactiveHighlightsVisibleProperty.link(this.voicingHighlightsVisibleListener);
    }
};
export { HighlightOverlay as default };
scenery.register('HighlightOverlay', HighlightOverlay);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvb3ZlcmxheXMvSGlnaGxpZ2h0T3ZlcmxheS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBvdmVybGF5IHRoYXQgaW1wbGVtZW50cyBoaWdobGlnaHRzIGZvciBhIERpc3BsYXkuIFRoaXMgaXMgcmVzcG9uc2libGUgZm9yIGRyYXdpbmcgdGhlIGhpZ2hsaWdodHMgYW5kXG4gKiBvYnNlcnZpbmcgUHJvcGVydGllcyBvciBFbWl0dGVycyB0aGF0IGRpY3RhdGUgd2hlbiBoaWdobGlnaHRzIHNob3VsZCBiZWNvbWUgYWN0aXZlLiBBIGhpZ2hsaWdodCBzdXJyb3VuZHMgYSBOb2RlXG4gKiB0byBpbmRpY2F0ZSB0aGF0IGl0IGlzIGluIGZvY3VzIG9yIHJlbGV2YW50LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlIH0gZnJvbSAnLi4vYWNjZXNzaWJpbGl0eS92b2ljaW5nL0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLmpzJztcbmltcG9ydCB7IGlzUmVhZGluZ0Jsb2NrLCBSZWFkaW5nQmxvY2tOb2RlIH0gZnJvbSAnLi4vYWNjZXNzaWJpbGl0eS92b2ljaW5nL1JlYWRpbmdCbG9jay5qcyc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQsIERpc3BsYXksIEZvY3VzLCBGb2N1c01hbmFnZXIsIEhpZ2hsaWdodEZyb21Ob2RlLCBIaWdobGlnaHRQYXRoLCBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBOb2RlLCBzY2VuZXJ5LCBUT3ZlcmxheSwgVFBhaW50LCBUcmFpbCwgVHJhbnNmb3JtVHJhY2tlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb2xvcnMgZm9yIHRoZSBmb2N1cyBoaWdobGlnaHRzLCBjYW4gYmUgY2hhbmdlZCBmb3IgZGlmZmVyZW50IGFwcGxpY2F0aW9uIGJhY2tncm91bmRzIG9yIGNvbG9yIHByb2ZpbGVzLCBzZWVcbi8vIHRoZSBzZXR0ZXJzIGFuZCBnZXR0ZXJzIGJlbG93IGZvciB0aGVzZSB2YWx1ZXMuXG5sZXQgb3V0ZXJIaWdobGlnaHRDb2xvcjogVFBhaW50ID0gSGlnaGxpZ2h0UGF0aC5PVVRFUl9GT0NVU19DT0xPUjtcbmxldCBpbm5lckhpZ2hsaWdodENvbG9yOiBUUGFpbnQgPSBIaWdobGlnaHRQYXRoLklOTkVSX0ZPQ1VTX0NPTE9SO1xuXG5sZXQgaW5uZXJHcm91cEhpZ2hsaWdodENvbG9yOiBUUGFpbnQgPSBIaWdobGlnaHRQYXRoLklOTkVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SO1xubGV0IG91dGVyR3JvdXBIaWdobGlnaHRDb2xvcjogVFBhaW50ID0gSGlnaGxpZ2h0UGF0aC5PVVRFUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUjtcblxuLy8gVHlwZSBmb3IgdGhlIFwibW9kZVwiIG9mIGEgcGFydGljdWxhciBoaWdobGlnaHQsIHNpZ25pZnlpbmcgYmVoYXZpb3IgZm9yIGhhbmRsaW5nIHRoZSBhY3RpdmUgaGlnaGxpZ2h0LlxudHlwZSBIaWdobGlnaHRNb2RlID0gbnVsbCB8ICdib3VuZHMnIHwgJ25vZGUnIHwgJ3NoYXBlJyB8ICdpbnZpc2libGUnO1xuXG4vLyBIaWdobGlnaHRzIGRpc3BsYXllZCBieSB0aGUgb3ZlcmxheSBzdXBwb3J0IHRoZXNlIHR5cGVzLiBIaWdobGlnaHQgYmVoYXZpb3Igd29ya3MgbGlrZSB0aGUgZm9sbG93aW5nOlxuLy8gLSBJZiB2YWx1ZSBpcyBudWxsLCB0aGUgaGlnaGxpZ2h0IHdpbGwgdXNlIGRlZmF1bHQgc3R5bGluZ3Mgb2YgSGlnaGxpZ2h0UGF0aCBhbmQgc3Vycm91bmQgdGhlIE5vZGUgd2l0aCBmb2N1cy5cbi8vIC0gSWYgdmFsdWUgaXMgYSBTaGFwZSB0aGUgU2hhcGUgaXMgc2V0IHRvIGEgSGlnaGxpZ2h0UGF0aCB3aXRoIGRlZmF1bHQgc3R5bGluZ3MgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxuLy8gLSBJZiB5b3UgcHJvdmlkZSBhIE5vZGUgaXQgaXMgeW91ciByZXNwb25zaWJpbGl0eSB0byBwb3NpdGlvbiBpdCBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXG4vLyAtIElmIHRoZSB2YWx1ZSBpcyAnaW52aXNpYmxlJyBubyBoaWdobGlnaHQgd2lsbCBiZSBkaXNwbGF5ZWQgYXQgYWxsLlxuZXhwb3J0IHR5cGUgSGlnaGxpZ2h0ID0gTm9kZSB8IFNoYXBlIHwgbnVsbCB8ICdpbnZpc2libGUnO1xuXG5leHBvcnQgdHlwZSBIaWdobGlnaHRPdmVybGF5T3B0aW9ucyA9IHtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIGhpZ2hsaWdodHMgcmVsYXRlZCB0byBET00gZm9jdXMgYXJlIHZpc2libGVcbiAgcGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eT86IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIGhpZ2hsaWdodHMgcmVsYXRlZCB0byBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGFyZSB2aXNpYmxlXG4gIGludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eT86IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIGhpZ2hsaWdodHMgYXNzb2NpYXRlZCB3aXRoIFJlYWRpbmdCbG9ja3MgKG9mIHRoZSBWb2ljaW5nIGZlYXR1cmUgc2V0KVxuICAvLyBhcmUgc2hvd24gd2hlbiBwb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzXG4gIHJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk/OiBUUHJvcGVydHk8Ym9vbGVhbj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaWdobGlnaHRPdmVybGF5IGltcGxlbWVudHMgVE92ZXJsYXkge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcGxheTogRGlzcGxheTtcblxuICAvLyBUaGUgcm9vdCBOb2RlIG9mIG91ciBjaGlsZCBkaXNwbGF5XG4gIHByaXZhdGUgcmVhZG9ubHkgZm9jdXNSb290Tm9kZTogTm9kZTtcblxuICAvLyBUcmFpbCB0byB0aGUgbm9kZSB3aXRoIGZvY3VzLCBtb2RpZmllZCB3aGVuIGZvY3VzIGNoYW5nZXNcbiAgcHJpdmF0ZSB0cmFpbDogVHJhaWwgfCBudWxsID0gbnVsbDtcblxuICAvLyBOb2RlIHdpdGggZm9jdXMsIG1vZGlmaWVkIHdoZW4gZm9jdXMgY2hhbmdlc1xuICBwcml2YXRlIG5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBBIHJlZmVyZW5jZXMgdG8gdGhlIGhpZ2hsaWdodCBmcm9tIHRoZSBOb2RlIHRoYXQgaXMgaGlnaGxpZ2h0ZWQuXG4gIHByaXZhdGUgYWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgPSBudWxsO1xuXG4gIC8vIFNpZ25pZmllcyBtZXRob2Qgb2YgcmVwcmVzZW50aW5nIGZvY3VzLCAnYm91bmRzJ3wnbm9kZSd8J3NoYXBlJ3wnaW52aXNpYmxlJywgbW9kaWZpZWRcbiAgLy8gd2hlbiBmb2N1cyBjaGFuZ2VzXG4gIHByaXZhdGUgbW9kZTogSGlnaGxpZ2h0TW9kZSA9IG51bGw7XG5cbiAgLy8gU2lnbmlmaWVzIG1ldGhvZCBvZmYgcmVwcmVzZW50aW5nIGdyb3VwIGZvY3VzLCAnYm91bmRzJ3wnbm9kZScsIG1vZGlmaWVkIHdoZW5cbiAgLy8gZm9jdXMgY2hhbmdlc1xuICBwcml2YXRlIGdyb3VwTW9kZTogSGlnaGxpZ2h0TW9kZSA9IG51bGw7XG5cbiAgLy8gVGhlIGdyb3VwIGhpZ2hsaWdodCBub2RlIGFyb3VuZCBhbiBhbmNlc3RvciBvZiB0aGlzLm5vZGUgd2hlbiBmb2N1cyBjaGFuZ2VzLCBzZWUgUGFyYWxsZWxET00uc2V0R3JvdXBGb2N1c0hpZ2hsaWdodFxuICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0LCBtb2RpZmllZCB3aGVuIGZvY3VzIGNoYW5nZXNcbiAgcHJpdmF0ZSBncm91cEhpZ2hsaWdodE5vZGU6IE5vZGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBUcmFja3MgdHJhbnNmb3JtYXRpb25zIHRvIHRoZSBmb2N1c2VkIG5vZGUgYW5kIHRoZSBub2RlIHdpdGggYSBncm91cCBmb2N1cyBoaWdobGlnaHQsIG1vZGlmaWVkIHdoZW4gZm9jdXMgY2hhbmdlc1xuICBwcml2YXRlIHRyYW5zZm9ybVRyYWNrZXI6IFRyYW5zZm9ybVRyYWNrZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBncm91cFRyYW5zZm9ybVRyYWNrZXI6IFRyYW5zZm9ybVRyYWNrZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBJZiBhIG5vZGUgaXMgdXNpbmcgYSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0LCBhIHJlZmVyZW5jZSBpcyBrZXB0IHNvIHRoYXQgaXQgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGUgb3ZlcmxheSB3aGVuXG4gIC8vIG5vZGUgZm9jdXMgY2hhbmdlcy5cbiAgcHJpdmF0ZSBub2RlTW9kZUhpZ2hsaWdodDogTm9kZSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIElmIHRydWUsIHRoZSBhY3RpdmUgaGlnaGxpZ2h0IGlzIGluIFwibm9kZVwiIG1vZGUgYW5kIGlzIGxheWVyZWQgaW4gdGhlIHNjZW5lIGdyYXBoLiBUaGlzIGZpZWxkIGxldHMgdXMgZGVhY3RpdmF0ZVxuICAvLyB0aGUgaGlnaGxpZ2h0IGFwcHJvcHJpYXRlbHkgd2hlbiBpdCBpcyBpbiB0aGF0IHN0YXRlLlxuICBwcml2YXRlIG5vZGVNb2RlSGlnaGxpZ2h0TGF5ZXJlZCA9IGZhbHNlO1xuXG4gIC8vIElmIHRydWUsIHRoZSBuZXh0IHVwZGF0ZSgpIHdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlIGhpZ2hsaWdodCdzIHRyYW5zZm9ybVxuICBwcml2YXRlIHRyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcblxuICAvLyBUaGUgbWFpbiBub2RlIGZvciB0aGUgaGlnaGxpZ2h0LiBJdCB3aWxsIGJlIHRyYW5zZm9ybWVkLlxuICBwcml2YXRlIHJlYWRvbmx5IGhpZ2hsaWdodE5vZGUgPSBuZXcgTm9kZSgpO1xuXG4gIC8vIFRoZSBtYWluIE5vZGUgZm9yIHRoZSBSZWFkaW5nQmxvY2sgaGlnaGxpZ2h0LCB3aGlsZSBSZWFkaW5nQmxvY2sgY29udGVudCBpcyBiZWluZyBzcG9rZW4gYnkgc3BlZWNoIHN5bnRoZXNpcy5cbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlID0gbmV3IE5vZGUoKTtcblxuICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IGlzIGFkZGVkIHdoZW4gYSBjdXN0b20gbm9kZSBpcyBzcGVjaWZpZWQgYXMgdGhlIGFjdGl2ZSBoaWdobGlnaHQgZm9yIHRoZVxuICAvLyBSZWFkaW5nQmxvY2suIFN0b3JlZCBzbyB0aGF0IHdlIGNhbiByZW1vdmUgaXQgd2hlbiBkZWFjdGl2YXRpbmcgcmVhZGluZyBibG9jayBoaWdobGlnaHRzLlxuICBwcml2YXRlIGFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0OiBIaWdobGlnaHQgPSBudWxsO1xuXG4gIC8vIEEgcmVmZXJlbmNlIHRvIHRoZSBOb2RlIHRoYXQgaXMgYSBSZWFkaW5nQmxvY2sgd2hpY2ggdGhlIFZvaWNpbmcgZnJhbWV3b3JrIGlzIGN1cnJlbnRseSBzcGVha2luZyBhYm91dC5cbiAgcHJpdmF0ZSBhY3RpdmVSZWFkaW5nQmxvY2tOb2RlOiBudWxsIHwgUmVhZGluZ0Jsb2NrTm9kZSA9IG51bGw7XG5cbiAgLy8gVHJhaWwgdG8gdGhlIFJlYWRpbmdCbG9jayBOb2RlIHdpdGggYW4gYWN0aXZlIGhpZ2hsaWdodCBhcm91bmQgaXQgd2hpbGUgdGhlIHZvaWNpbmdNYW5hZ2VyIGlzIHNwZWFraW5nIGl0cyBjb250ZW50LlxuICBwcml2YXRlIHJlYWRpbmdCbG9ja1RyYWlsOiBudWxsIHwgVHJhaWwgPSBudWxsO1xuXG4gIC8vIFdoZXRoZXIgdGhlIHRyYW5zZm9ybSBhcHBsaWVkIHRvIHRoZSByZWFkaW5CbG9ja0hpZ2hsaWdodE5vZGUgaXMgb3V0IG9mIGRhdGUuXG4gIHByaXZhdGUgcmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSB0cnVlO1xuXG4gIC8vIFRoZSBUcmFuc2Zvcm1UcmFja2VyIHVzZWQgdG8gb2JzZXJ2ZSBjaGFuZ2VzIHRvIHRoZSB0cmFuc2Zvcm0gb2YgdGhlIE5vZGUgd2l0aCBSZWFkaW5nIEJsb2NrIGZvY3VzLCBzbyB0aGF0XG4gIC8vIHRoZSBoaWdobGlnaHQgY2FuIG1hdGNoIHRoZSBSZWFkaW5nQmxvY2suXG4gIHByaXZhdGUgcmVhZGluZ0Jsb2NrVHJhbnNmb3JtVHJhY2tlcjogbnVsbCB8IFRyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xuXG4gIC8vIFNlZSBIaWdobGlnaHRPdmVybGF5T3B0aW9ucyBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgcHJpdmF0ZSByZWFkb25seSBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gU2VlIEhpZ2hsaWdodE92ZXJsYXlPcHRpb25zIGZvciBkb2N1bWVudGF0aW9uLlxuICBwcml2YXRlIHJlYWRvbmx5IGludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIFNlZSBIaWdobGlnaHRPdmVybGF5T3B0aW9ucyBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gRGlzcGxheSB0aGF0IG1hbmFnZXMgYWxsIGhpZ2hsaWdodHNcbiAgcHJpdmF0ZSByZWFkb25seSBmb2N1c0Rpc3BsYXk6IERpc3BsYXk7XG5cbiAgLy8gSFRNTCBlbGVtZW50IG9mIHRoZSBkaXNwbGF5XG4gIHB1YmxpYyByZWFkb25seSBkb21FbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAvLyBVc2VkIGFzIHRoZSBmb2N1cyBoaWdobGlnaHQgd2hlbiB0aGUgb3ZlcmxheSBpcyBwYXNzZWQgYSBzaGFwZVxuICBwcml2YXRlIHJlYWRvbmx5IHNoYXBlRm9jdXNIaWdobGlnaHRQYXRoOiBIaWdobGlnaHRQYXRoO1xuXG4gIC8vIFVzZWQgYXMgdGhlIGRlZmF1bHQgY2FzZSBmb3IgdGhlIGhpZ2hsaWdodCB3aGVuIHRoZSBoaWdobGlnaHQgdmFsdWUgaXMgbnVsbFxuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aDogSGlnaGxpZ2h0RnJvbU5vZGU7XG5cbiAgLy8gRm9jdXMgaGlnaGxpZ2h0IGZvciAnZ3JvdXBzJyBvZiBOb2Rlcy4gV2hlbiBkZXNjZW5kYW50IG5vZGUgaGFzIGZvY3VzLCBhbmNlc3RvciB3aXRoIGdyb3VwRm9jdXNIaWdobGlnaHQgZmxhZyB3aWxsXG4gIC8vIGhhdmUgdGhpcyBleHRyYSBmb2N1cyBoaWdobGlnaHQgc3Vycm91bmQgaXRzIGxvY2FsIGJvdW5kc1xuICBwcml2YXRlIHJlYWRvbmx5IGdyb3VwRm9jdXNIaWdobGlnaHRQYXRoOiBIaWdobGlnaHRGcm9tTm9kZTtcblxuICAvLyBBIHBhcmVudCBOb2RlIGZvciBncm91cCBmb2N1cyBoaWdobGlnaHRzIHNvIHZpc2liaWxpdHkgb2YgYWxsIGdyb3VwIGhpZ2hsaWdodHMgY2FuIGVhc2lseSBiZSBjb250cm9sbGVkXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBGb2N1c0hpZ2hsaWdodFBhcmVudDogTm9kZTtcblxuICAvLyBUaGUgaGlnaGxpZ2h0IHNob3duIGFyb3VuZCBSZWFkaW5nQmxvY2sgTm9kZXMgd2hpbGUgdGhlIHZvaWNpbmdNYW5hZ2VyIGlzIHNwZWFraW5nLlxuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGg6IEFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGJvdW5kc0xpc3RlbmVyOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IHRyYW5zZm9ybUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IGRvbUZvY3VzTGlzdGVuZXI6ICggZm9jdXM6IEZvY3VzIHwgbnVsbCApID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhZGluZ0Jsb2NrVHJhbnNmb3JtTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgZm9jdXNIaWdobGlnaHRMaXN0ZW5lcjogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBpbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IGZvY3VzSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lcjogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSB2b2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lcjogKCkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBwb2ludGVyRm9jdXNMaXN0ZW5lcjogKCBmb2N1czogRm9jdXMgfCBudWxsICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBsb2NrZWRQb2ludGVyRm9jdXNMaXN0ZW5lcjogKCBmb2N1czogRm9jdXMgfCBudWxsICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tGb2N1c0xpc3RlbmVyOiAoIGZvY3VzOiBGb2N1cyB8IG51bGwgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IHJlYWRpbmdCbG9ja0hpZ2hsaWdodENoYW5nZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzcGxheTogRGlzcGxheSwgZm9jdXNSb290Tm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogSGlnaGxpZ2h0T3ZlcmxheU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEhpZ2hsaWdodE92ZXJsYXlPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyByZWxhdGVkIHRvIERPTSBmb2N1cyBhcmUgdmlzaWJsZVxuICAgICAgcGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLFxuXG4gICAgICAvLyBDb250cm9scyB3aGV0aGVyIGhpZ2hsaWdodHMgcmVsYXRlZCB0byBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGFyZSB2aXNpYmxlXG4gICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICksXG5cbiAgICAgIC8vIENvbnRyb2xzIHdoZXRoZXIgaGlnaGxpZ2h0cyBhc3NvY2lhdGVkIHdpdGggUmVhZGluZ0Jsb2NrcyAob2YgdGhlIFZvaWNpbmcgZmVhdHVyZSBzZXQpIGFyZSBzaG93biB3aGVuXG4gICAgICAvLyBwb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzXG4gICAgICByZWFkaW5nQmxvY2tIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgIHRoaXMuZm9jdXNSb290Tm9kZSA9IGZvY3VzUm9vdE5vZGU7XG5cbiAgICB0aGlzLmZvY3VzUm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuaGlnaGxpZ2h0Tm9kZSApO1xuICAgIHRoaXMuZm9jdXNSb290Tm9kZS5hZGRDaGlsZCggdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlICk7XG5cbiAgICB0aGlzLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBvcHRpb25zLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk7XG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBvcHRpb25zLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTtcbiAgICB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBvcHRpb25zLnJlYWRpbmdCbG9ja0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk7XG5cbiAgICB0aGlzLmZvY3VzRGlzcGxheSA9IG5ldyBEaXNwbGF5KCB0aGlzLmZvY3VzUm9vdE5vZGUsIHtcbiAgICAgIGFsbG93V2ViR0w6IGRpc3BsYXkuaXNXZWJHTEFsbG93ZWQoKSxcbiAgICAgIGFsbG93Q1NTSGFja3M6IGZhbHNlLFxuICAgICAgYWNjZXNzaWJpbGl0eTogZmFsc2UsXG4gICAgICBpbnRlcmFjdGl2ZTogZmFsc2UsXG5cbiAgICAgIC8vIExheWVyIGZpdHRpbmcgc29sdmVkIGEgY2hyb21lIGJ1ZyB3aGVyZSB3ZSBjb3VsZCBsb3NlIGZvY3VzIGhpZ2hsaWdodHMgd2hlbiB0YWJiaW5nIHdoaWxlIHpvb21lZCBpbiBjZXJ0YWluXG4gICAgICAvLyBjYXNlcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjA1XG4gICAgICBhbGxvd0xheWVyRml0dGluZzogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRoaXMuZG9tRWxlbWVudCA9IHRoaXMuZm9jdXNEaXNwbGF5LmRvbUVsZW1lbnQ7XG4gICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG5cbiAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoID0gbmV3IEhpZ2hsaWdodFBhdGgoIG51bGwgKTtcbiAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aCA9IG5ldyBIaWdobGlnaHRGcm9tTm9kZSggbnVsbCwge1xuICAgICAgdXNlTG9jYWxCb3VuZHM6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmhpZ2hsaWdodE5vZGUuYWRkQ2hpbGQoIHRoaXMuc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGggKTtcbiAgICB0aGlzLmhpZ2hsaWdodE5vZGUuYWRkQ2hpbGQoIHRoaXMuYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoICk7XG5cbiAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoID0gbmV3IEhpZ2hsaWdodEZyb21Ob2RlKCBudWxsLCB7XG4gICAgICB1c2VMb2NhbEJvdW5kczogdHJ1ZSxcbiAgICAgIHVzZUdyb3VwRGlsYXRpb246IHRydWUsXG4gICAgICBvdXRlckxpbmVXaWR0aDogSGlnaGxpZ2h0UGF0aC5HUk9VUF9PVVRFUl9MSU5FX1dJRFRILFxuICAgICAgaW5uZXJMaW5lV2lkdGg6IEhpZ2hsaWdodFBhdGguR1JPVVBfSU5ORVJfTElORV9XSURUSCxcbiAgICAgIGlubmVyU3Ryb2tlOiBIaWdobGlnaHRQYXRoLk9VVEVSX0ZPQ1VTX0NPTE9SXG4gICAgfSApO1xuXG4gICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGFyZW50ID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGggXVxuICAgIH0gKTtcbiAgICB0aGlzLmZvY3VzUm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhcmVudCApO1xuXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoID0gbmV3IEFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCggbnVsbCApO1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Tm9kZS5hZGRDaGlsZCggdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoICk7XG5cbiAgICAvLyBMaXN0ZW5lcnMgYm91bmQgb25jZSwgc28gd2UgY2FuIGFjY2VzcyB0aGVtIGZvciByZW1vdmFsLlxuICAgIHRoaXMuYm91bmRzTGlzdGVuZXIgPSB0aGlzLm9uQm91bmRzQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy5vblRyYW5zZm9ybUNoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5kb21Gb2N1c0xpc3RlbmVyID0gdGhpcy5vbkZvY3VzQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyID0gdGhpcy5vblJlYWRpbmdCbG9ja1RyYW5zZm9ybUNoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5mb2N1c0hpZ2hsaWdodExpc3RlbmVyID0gdGhpcy5vbkZvY3VzSGlnaGxpZ2h0Q2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0TGlzdGVuZXIgPSB0aGlzLm9uSW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuZm9jdXNIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyID0gdGhpcy5vbkZvY3VzSGlnaGxpZ2h0c1Zpc2libGVDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMudm9pY2luZ0hpZ2hsaWdodHNWaXNpYmxlTGlzdGVuZXIgPSB0aGlzLm9uVm9pY2luZ0hpZ2hsaWdodHNWaXNpYmxlQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLnBvaW50ZXJGb2N1c0xpc3RlbmVyID0gdGhpcy5vblBvaW50ZXJGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5sb2NrZWRQb2ludGVyRm9jdXNMaXN0ZW5lciA9IHRoaXMub25Mb2NrZWRQb2ludGVyRm9jdXNDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNMaXN0ZW5lciA9IHRoaXMub25SZWFkaW5nQmxvY2tGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2VMaXN0ZW5lciA9IHRoaXMub25SZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2UuYmluZCggdGhpcyApO1xuXG4gICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMuZG9tRm9jdXNMaXN0ZW5lciApO1xuICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMucG9pbnRlckZvY3VzTGlzdGVuZXIgKTtcbiAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5yZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNMaXN0ZW5lciApO1xuXG4gICAgZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkubGluayggdGhpcy5sb2NrZWRQb2ludGVyRm9jdXNMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHRoaXMuZm9jdXNIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyICk7XG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkubGluayggdGhpcy52b2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5oYXNIaWdobGlnaHQoKSApIHtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZUhpZ2hsaWdodCgpO1xuICAgIH1cblxuICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZG9tRm9jdXNMaXN0ZW5lciApO1xuICAgIHRoaXMucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZm9jdXNIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyICk7XG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLnZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUxpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnVubGluayggdGhpcy5wb2ludGVyRm9jdXNMaXN0ZW5lciApO1xuICAgIHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5mb2N1c0Rpc3BsYXkuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhpcyBIaWdobGlnaHRPdmVybGF5IGlzIGRpc3BsYXlpbmcgc29tZSBoaWdobGlnaHQuXG4gICAqL1xuICBwdWJsaWMgaGFzSGlnaGxpZ2h0KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMudHJhaWw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFuIGFjdGl2ZSBoaWdobGlnaHQgYXJvdW5kIGEgUmVhZGluZ0Jsb2NrIHdoaWxlIHRoZSB2b2ljaW5nTWFuYWdlciBpcyBzcGVha2luZyBpdHNcbiAgICogVm9pY2luZyBjb250ZW50LlxuICAgKi9cbiAgcHVibGljIGhhc1JlYWRpbmdCbG9ja0hpZ2hsaWdodCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnJlYWRpbmdCbG9ja1RyYWlsO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgaGlnaGxpZ2h0LCBjaG9vc2luZyBhIG1vZGUgZm9yIHdoZXRoZXIgdGhlIGhpZ2hsaWdodCB3aWxsIGJlIGEgc2hhcGUsIG5vZGUsIG9yIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIHRyYWlsIC0gVGhlIGZvY3VzZWQgdHJhaWwgdG8gaGlnaGxpZ2h0LiBJdCBhc3N1bWVzIHRoYXQgdGhpcyB0cmFpbCBpcyBpbiB0aGlzIGRpc3BsYXkuXG4gICAqIEBwYXJhbSBub2RlIC0gTm9kZSByZWNlaXZpbmcgdGhlIGhpZ2hsaWdodFxuICAgKiBAcGFyYW0gbm9kZUhpZ2hsaWdodCAtIHRoZSBoaWdobGlnaHQgdG8gdXNlXG4gICAqIEBwYXJhbSBsYXllcmFibGUgLSBJcyB0aGUgaGlnaGxpZ2h0IGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGg/XG4gICAqIEBwYXJhbSB2aXNpYmxlUHJvcGVydHkgLSBQcm9wZXJ0eSBjb250cm9sbGluZyB0aGUgdmlzaWJpbGl0eSBmb3IgdGhlIHByb3ZpZGVkIGhpZ2hsaWdodFxuICAgKi9cbiAgcHJpdmF0ZSBhY3RpdmF0ZUhpZ2hsaWdodCggdHJhaWw6IFRyYWlsLCBub2RlOiBOb2RlLCBub2RlSGlnaGxpZ2h0OiBIaWdobGlnaHQsIGxheWVyYWJsZTogYm9vbGVhbiwgdmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj4gKTogdm9pZCB7XG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG5cbiAgICBjb25zdCBoaWdobGlnaHQgPSBub2RlSGlnaGxpZ2h0O1xuICAgIHRoaXMuYWN0aXZlSGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgLy8gd2UgbWF5IG9yIG1heSBub3QgdHJhY2sgdGhpcyB0cmFpbCBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgZm9jdXMgaGlnaGxpZ2h0IHN1cnJvdW5kcyB0aGUgdHJhaWwncyBsZWFmIG5vZGUgb3JcbiAgICAvLyBhIGRpZmZlcmVudCBub2RlXG4gICAgbGV0IHRyYWlsVG9UcmFjayA9IHRyYWlsO1xuXG4gICAgLy8gSW52aXNpYmxlIG1vZGUgLSBubyBmb2N1cyBoaWdobGlnaHQ7IHRoaXMgaXMgb25seSBmb3IgdGVzdGluZyBtb2RlLCB3aGVuIE5vZGVzIHJhcmVseSBoYXZlIGJvdW5kcy5cbiAgICBpZiAoIGhpZ2hsaWdodCA9PT0gJ2ludmlzaWJsZScgKSB7XG4gICAgICB0aGlzLm1vZGUgPSAnaW52aXNpYmxlJztcbiAgICB9XG4gICAgLy8gU2hhcGUgbW9kZVxuICAgIGVsc2UgaWYgKCBoaWdobGlnaHQgaW5zdGFuY2VvZiBTaGFwZSApIHtcbiAgICAgIHRoaXMubW9kZSA9ICdzaGFwZSc7XG5cbiAgICAgIHRoaXMuc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGgudmlzaWJsZSA9IHRydWU7XG4gICAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLnNldFNoYXBlKCBoaWdobGlnaHQgKTtcbiAgICB9XG4gICAgLy8gTm9kZSBtb2RlXG4gICAgZWxzZSBpZiAoIGhpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKSB7XG4gICAgICB0aGlzLm1vZGUgPSAnbm9kZSc7XG5cbiAgICAgIC8vIGlmIHVzaW5nIGEgZm9jdXMgaGlnaGxpZ2h0IGZyb20gYW5vdGhlciBub2RlLCB3ZSB3aWxsIHRyYWNrIHRoYXQgbm9kZSdzIHRyYW5zZm9ybSBpbnN0ZWFkIG9mIHRoZSBmb2N1c2VkIG5vZGVcbiAgICAgIGlmICggaGlnaGxpZ2h0IGluc3RhbmNlb2YgSGlnaGxpZ2h0UGF0aCApIHtcblxuICAgICAgICBpZiAoIGhpZ2hsaWdodC50cmFuc2Zvcm1Tb3VyY2VOb2RlICkge1xuICAgICAgICAgIHRyYWlsVG9UcmFjayA9IGhpZ2hsaWdodC5nZXRVbmlxdWVIaWdobGlnaHRUcmFpbCggdGhpcy50cmFpbCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHN0b3JlIHRoZSBmb2N1cyBoaWdobGlnaHQgc28gdGhhdCBpdCBjYW4gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgdGhpcy5ub2RlTW9kZUhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgaWYgKCBsYXllcmFibGUgKSB7XG5cbiAgICAgICAgLy8gZmxhZyBzbyB0aGF0IHdlIGtub3cgaG93IHRvIGRlYWN0aXZhdGUgaW4gdGhpcyBjYXNlXG4gICAgICAgIHRoaXMubm9kZU1vZGVIaWdobGlnaHRMYXllcmVkID0gdHJ1ZTtcblxuICAgICAgICAvLyB0aGUgZm9jdXNIaWdobGlnaHQgaXMganVzdCBhIG5vZGUgaW4gdGhlIHNjZW5lIGdyYXBoLCBzbyBzZXQgaXQgdmlzaWJsZSAtIHZpc2liaWxpdHkgb2Ygb3RoZXIgaGlnaGxpZ2h0c1xuICAgICAgICAvLyBjb250cm9sbGVkIGJ5IHZpc2liaWxpdHkgb2YgcGFyZW50IE5vZGVzIGJ1dCB0aGF0IGNhbm5vdCBiZSBkb25lIGluIHRoaXMgY2FzZSBiZWNhdXNlIHRoZSBoaWdobGlnaHRcbiAgICAgICAgLy8gY2FuIGJlIGFueXdoZXJlIGluIHRoZSBzY2VuZSBncmFwaCwgc28gaGF2ZSB0byBjaGVjayBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5XG4gICAgICAgIHRoaXMubm9kZU1vZGVIaWdobGlnaHQudmlzaWJsZSA9IHZpc2libGVQcm9wZXJ0eS5nZXQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIHRoZSBub2RlIGlzIGFscmVhZHkgaW4gdGhlIHNjZW5lIGdyYXBoLCBzbyB0aGlzIHdpbGwgc2V0IHZpc2liaWxpdHlcbiAgICAgICAgLy8gZm9yIGFsbCBpbnN0YW5jZXMuXG4gICAgICAgIHRoaXMubm9kZU1vZGVIaWdobGlnaHQudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgLy8gVXNlIHRoZSBub2RlIGl0c2VsZiBhcyB0aGUgaGlnaGxpZ2h0XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0Tm9kZS5hZGRDaGlsZCggdGhpcy5ub2RlTW9kZUhpZ2hsaWdodCApO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBCb3VuZHMgbW9kZVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5tb2RlID0gJ2JvdW5kcyc7XG5cbiAgICAgIHRoaXMuYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoLnNldFNoYXBlRnJvbU5vZGUoIHRoaXMubm9kZSwgdGhpcy50cmFpbCApO1xuXG4gICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMubm9kZS5sb2NhbEJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCB0aGlzLmJvdW5kc0xpc3RlbmVyICk7XG5cbiAgICAgIHRoaXMub25Cb3VuZHNDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIgPSBuZXcgVHJhbnNmb3JtVHJhY2tlciggdHJhaWxUb1RyYWNrLCB7XG4gICAgICBpc1N0YXRpYzogdHJ1ZVxuICAgIH0gKTtcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHRoaXMudHJhbnNmb3JtTGlzdGVuZXIgKTtcblxuICAgIC8vIGhhbmRsZSBncm91cCBmb2N1cyBoaWdobGlnaHRzXG4gICAgdGhpcy5hY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cygpO1xuXG4gICAgLy8gdXBkYXRlIGhpZ2hsaWdodCBjb2xvcnMgaWYgbmVjZXNzYXJ5XG4gICAgdGhpcy51cGRhdGVIaWdobGlnaHRDb2xvcnMoKTtcblxuICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIGEgZm9jdXMgaGlnaGxpZ2h0LCBhY3RpdmF0aW5nIHRoZSBoaWdobGlnaHQgYW5kIGFkZGluZyBhIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIGhpZ2hsaWdodCB3aGVuZXZlclxuICAgKiB0aGUgTm9kZSdzIGZvY3VzSGlnaGxpZ2h0IGNoYW5nZXNcbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVGb2N1c0hpZ2hsaWdodCggdHJhaWw6IFRyYWlsLCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZhdGVIaWdobGlnaHQoIHRyYWlsLCBub2RlLCBub2RlLmZvY3VzSGlnaGxpZ2h0LCBub2RlLmZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlLCB0aGlzLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgKTtcblxuICAgIC8vIGhhbmRsZSBhbnkgY2hhbmdlcyB0byB0aGUgZm9jdXMgaGlnaGxpZ2h0IHdoaWxlIHRoZSBub2RlIGhhcyBmb2N1c1xuICAgIG5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5mb2N1c0hpZ2hsaWdodExpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgYW4gaW50ZXJhY3RpdmUgaGlnaGxpZ2h0LCBhY3RpdmF0aW5nIHRoZSBoaWdobGlnaHQgYW5kIGFkZGluZyBhIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIGhpZ2hsaWdodFxuICAgKiBjaGFuZ2VzIHdoaWxlIGl0IGlzIGFjdGl2ZS5cbiAgICovXG4gIHByaXZhdGUgYWN0aXZhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggdHJhaWw6IFRyYWlsLCBub2RlOiBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUgKTogdm9pZCB7XG5cbiAgICB0aGlzLmFjdGl2YXRlSGlnaGxpZ2h0KFxuICAgICAgdHJhaWwsXG4gICAgICBub2RlLFxuICAgICAgbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodCB8fCBub2RlLmZvY3VzSGlnaGxpZ2h0LFxuICAgICAgbm9kZS5pbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSxcbiAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5XG4gICAgKTtcblxuICAgIC8vIHNhbml0eSBjaGVjayB0aGF0IG91ciBOb2RlIGFjdHVhbGx5IHVzZXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBub2RlICksICdOb2RlIGRvZXMgbm90IHN1cHBvcnQgYW55IGtpbmQgb2YgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0aW5nLicgKTtcbiAgICBub2RlLmludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRMaXN0ZW5lciApO1xuXG4gICAgLy8gaGFuZGxlIGNoYW5nZXMgdG8gdGhlIGhpZ2hsaWdodCB3aGlsZSBpdCBpcyBhY3RpdmUgLSBTaW5jZSB0aGUgaGlnaGxpZ2h0IGNhbiBmYWxsIGJhY2sgdG8gdGhlIGZvY3VzIGhpZ2hsaWdodFxuICAgIC8vIHdhdGNoIGZvciB1cGRhdGVzIHRvIHJlZHJhdyB3aGVuIHRoYXQgaGlnaGxpZ2h0IGNoYW5nZXMgYXMgd2VsbC5cbiAgICBub2RlLmZvY3VzSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBSZWFkaW5nIEJsb2NrIGhpZ2hsaWdodC4gVGhpcyBoaWdobGlnaHQgaXMgc2VwYXJhdGUgZnJvbSBvdGhlcnMgaW4gdGhlIG92ZXJsYXkgYW5kIHdpbGwgYWx3YXlzXG4gICAqIHN1cnJvdW5kIHRoZSBCb3VuZHMgb2YgdGhlIGZvY3VzZWQgTm9kZS4gSXQgaXMgc2hvd24gaW4gcmVzcG9uc2UgdG8gY2VydGFpbiBpbnB1dCBvbiBOb2RlcyB3aXRoIFZvaWNpbmcgd2hpbGVcbiAgICogdGhlIHZvaWNpbmdNYW5hZ2VyIGlzIHNwZWFraW5nLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgY3VzdG9taXphdGlvbnMgZm9yIHRoaXMgaGlnaGxpZ2h0IGFyZSBub3Qgc3VwcG9ydGVkIGF0IHRoaXMgdGltZSwgdGhhdCBjb3VsZCBiZSBhZGRlZCBpbiB0aGUgZnV0dXJlIGlmXG4gICAqIHdlIG5lZWQuXG4gICAqL1xuICBwcml2YXRlIGFjdGl2YXRlUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCB0cmFpbDogVHJhaWwgKTogdm9pZCB7XG4gICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFpbCA9IHRyYWlsO1xuXG4gICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNSZWFkaW5nQmxvY2soIG5vZGUgKSxcbiAgICAgICdzaG91bGQgbm90IGFjdGl2YXRlIGEgcmVhZGluZyBibG9jayBoaWdobGlnaHQgZm9yIGEgTm9kZSB0aGF0IGlzIG5vdCBhIFJlYWRpbmdCbG9jaycgKTtcbiAgICBpZiAoIGlzUmVhZGluZ0Jsb2NrKCBub2RlICkgKSB7IC8vIEZvciBUeXBlU2NyaXB0IGNhc3RpbmdcblxuICAgICAgdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlID0gbm9kZTtcblxuICAgICAgY29uc3QgcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ID0gdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlLnJlYWRpbmdCbG9ja0FjdGl2ZUhpZ2hsaWdodDtcblxuICAgICAgdGhpcy5hZGRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCA9IHJlYWRpbmdCbG9ja0hpZ2hsaWdodDtcblxuICAgICAgaWYgKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgPT09ICdpbnZpc2libGUnICkge1xuICAgICAgICAvLyBub3RoaW5nIHRvIGRyYXdcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgaW5zdGFuY2VvZiBTaGFwZSApIHtcbiAgICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnNldFNoYXBlKCByZWFkaW5nQmxvY2tIaWdobGlnaHQgKTtcbiAgICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRQYXRoLnZpc2libGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHJlYWRpbmdCbG9ja0hpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKSB7XG5cbiAgICAgICAgLy8gbm9kZSBtb2RlXG4gICAgICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Tm9kZS5hZGRDaGlsZCggcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBib3VuZHMgbW9kZVxuICAgICAgICB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGguc2V0U2hhcGVGcm9tTm9kZSggdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlLCB0aGlzLnJlYWRpbmdCbG9ja1RyYWlsICk7XG4gICAgICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIHRoZSBoaWdobGlnaHQgaWYgdGhlIHRyYW5zZm9ybSBmb3IgdGhlIE5vZGUgZXZlciBjaGFuZ2VzXG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybVRyYWNrZXIgPSBuZXcgVHJhbnNmb3JtVHJhY2tlciggdGhpcy5yZWFkaW5nQmxvY2tUcmFpbCwge1xuICAgICAgICBpc1N0YXRpYzogdHJ1ZVxuICAgICAgfSApO1xuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyLmFkZExpc3RlbmVyKCB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyICk7XG5cbiAgICAgIC8vIHVwZGF0ZSB0aGUgaGlnaGxpZ2h0IGlmIGl0IGlzIGNoYW5nZWQgb24gdGhlIE5vZGUgd2hpbGUgYWN0aXZlXG4gICAgICB0aGlzLmFjdGl2ZVJlYWRpbmdCbG9ja05vZGUucmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Q2hhbmdlTGlzdGVuZXIgKTtcblxuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlYWN0aXZhdGUgdGhlIHNwZWFraW5nIGhpZ2hsaWdodCBieSBtYWtpbmcgaXQgaW52aXNpYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCk6IHZvaWQge1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gZmFsc2U7XG5cbiAgICBpZiAoIHRoaXMuYWRkZWRSZWFkaW5nQmxvY2tIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICkge1xuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyLCAnSG93IGNhbiB3ZSBkZWFjdGl2YXRlIHRoZSBUcmFuc2Zvcm1UcmFja2VyIGlmIGl0IHdhc250IGFzc2lnbmVkLicgKTtcbiAgICBjb25zdCB0cmFuc2Zvcm1UcmFja2VyID0gdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyITtcbiAgICB0cmFuc2Zvcm1UcmFja2VyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgdHJhbnNmb3JtVHJhY2tlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyID0gbnVsbDtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSwgJ0hvdyBjYW4gd2UgZGVhY3RpdmF0ZSB0aGUgYWN0aXZlUmVhZGluZ0Jsb2NrTm9kZSBpZiBpdCB3YXNudCBhc3NpZ25lZC4nICk7XG4gICAgdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlIS5yZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2VMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlID0gbnVsbDtcbiAgICB0aGlzLnJlYWRpbmdCbG9ja1RyYWlsID0gbnVsbDtcbiAgICB0aGlzLmFkZGVkUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0ID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWFjdGl2YXRlcyB0aGUgYWxsIGFjdGl2ZSBoaWdobGlnaHRzLCBkaXNwb3NpbmcgYW5kIHJlbW92aW5nIGxpc3RlbmVycyBhcyBuZWNlc3NhcnkuXG4gICAqL1xuICBwcml2YXRlIGRlYWN0aXZhdGVIaWdobGlnaHQoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ub2RlLCAnTmVlZCBhbiBhY3RpdmUgTm9kZSB0byBkZWFjdGl2YXRlIGhpZ2hsaWdodHMnICk7XG4gICAgY29uc3QgYWN0aXZlTm9kZSA9IHRoaXMubm9kZSE7XG5cbiAgICBpZiAoIHRoaXMubW9kZSA9PT0gJ3NoYXBlJyApIHtcbiAgICAgIHRoaXMuc2hhcGVGb2N1c0hpZ2hsaWdodFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5tb2RlID09PSAnbm9kZScgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0LCAnSG93IGNhbiB3ZSBkZWFjdGl2YXRlIGlmIG5vZGVNb2RlSGlnaGxpZ2h0IGlzIG5vdCBhc3NpZ25lZCcgKTtcblxuICAgICAgLy8gTm90ZSBpdCBpcyBwb3NzaWJsZSBhbmQgYWNjZXB0YWJsZSB0aGF0IHRoaXMgaGFzIGJlZW4gcHJldmlvdXNseSBkaXNwb3NlZCwgYmVmb3JlIGRlYWN0aXZhdGVIaWdobGlnaHQuXG4gICAgICAvLyBJZiB3ZSB3YW50IHRvIHJlLXNlcXVlbmNlIHRoZSBjYWxscyB0byBtYWtlIHN1cmUgdGhpcyBpcyBuZXZlciBkaXNwb3NlZCBhdCB0aGlzIHBvaW50LCBpdCBwdXRzIGEgYnVyZGVuXG4gICAgICAvLyBvbiB0aGUgY2xpZW50IHRvIG1ha2Ugc3VyZSB0byBibHVyKCkgYXQgdGhlIGFwcHJvcHJpYXRlIHBvaW50IGJlZm9yZWhhbmQuXG4gICAgICBjb25zdCBub2RlTW9kZUhpZ2hsaWdodCA9IHRoaXMubm9kZU1vZGVIaWdobGlnaHQhO1xuXG4gICAgICAvLyBJZiBsYXllcmVkLCBjbGllbnQgaGFzIHB1dCB0aGUgTm9kZSB3aGVyZSB0aGV5IHdhbnQgaW4gdGhlIHNjZW5lIGdyYXBoIGFuZCB3ZSBjYW5ub3QgcmVtb3ZlIGl0XG4gICAgICBpZiAoIHRoaXMubm9kZU1vZGVIaWdobGlnaHRMYXllcmVkICkge1xuICAgICAgICB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0TGF5ZXJlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICFub2RlTW9kZUhpZ2hsaWdodC5pc0Rpc3Bvc2VkICYmIHRoaXMuaGlnaGxpZ2h0Tm9kZS5yZW1vdmVDaGlsZCggbm9kZU1vZGVIaWdobGlnaHQgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCAhbm9kZU1vZGVIaWdobGlnaHQuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgbm9kZU1vZGVIaWdobGlnaHQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBub2RlIGZvY3VzIGhpZ2hsaWdodCBjYW4gYmUgY2xlYXJlZCBub3cgdGhhdCBpdCBoYXMgYmVlbiByZW1vdmVkXG4gICAgICB0aGlzLm5vZGVNb2RlSGlnaGxpZ2h0ID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZSA9PT0gJ2JvdW5kcycgKSB7XG4gICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICBhY3RpdmVOb2RlLmxvY2FsQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLmJvdW5kc0xpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGxpc3RlbmVycyB0aGF0IHJlZHJhdyB0aGUgaGlnaGxpZ2h0IGlmIGEgdHlwZSBvZiBoaWdobGlnaHQgY2hhbmdlcyBvbiB0aGUgTm9kZVxuICAgIGlmICggYWN0aXZlTm9kZS5mb2N1c0hpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmhhc0xpc3RlbmVyKCB0aGlzLmZvY3VzSGlnaGxpZ2h0TGlzdGVuZXIgKSApIHtcbiAgICAgIGFjdGl2ZU5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5mb2N1c0hpZ2hsaWdodExpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgaWYgKCBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBhY3RpdmVOb2RlICkgKSB7XG4gICAgICBpZiAoIGFjdGl2ZU5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5oYXNMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICkgKSB7XG4gICAgICAgIGFjdGl2ZU5vZGUuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICk7XG4gICAgICB9XG4gICAgICBpZiAoIGFjdGl2ZU5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5oYXNMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICkgKSB7XG4gICAgICAgIGFjdGl2ZU5vZGUuZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGFsbCAnZ3JvdXAnIGZvY3VzIGhpZ2hsaWdodHNcbiAgICB0aGlzLmRlYWN0aXZhdGVHcm91cEhpZ2hsaWdodHMoKTtcblxuICAgIHRoaXMudHJhaWwgPSBudWxsO1xuICAgIHRoaXMubm9kZSA9IG51bGw7XG4gICAgdGhpcy5tb2RlID0gbnVsbDtcbiAgICB0aGlzLmFjdGl2ZUhpZ2hsaWdodCA9IG51bGw7XG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyIS5yZW1vdmVMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1MaXN0ZW5lciApO1xuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciEuZGlzcG9zZSgpO1xuICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgYWxsICdncm91cCcgZm9jdXMgaGlnaGxpZ2h0cyBieSBzZWFyY2hpbmcgZm9yIGFuY2VzdG9yIG5vZGVzIGZyb20gdGhlIG5vZGUgdGhhdCBoYXMgZm9jdXNcbiAgICogYW5kIGFkZGluZyBhIHJlY3RhbmdsZSBhcm91bmQgaXQgaWYgaXQgaGFzIGEgXCJncm91cEZvY3VzSGlnaGxpZ2h0XCIuIEEgZ3JvdXAgaGlnaGxpZ2h0IHdpbGwgb25seSBhcHBlYXIgYXJvdW5kXG4gICAqIHRoZSBjbG9zZXN0IGFuY2VzdG9yIHRoYXQgaGFzIGEgb25lLlxuICAgKi9cbiAgcHJpdmF0ZSBhY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cygpOiB2b2lkIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHJhaWwsICdtdXN0IGhhdmUgYW4gYWN0aXZlIHRyYWlsIHRvIGFjdGl2YXRlIGdyb3VwIGhpZ2hsaWdodHMnICk7XG4gICAgY29uc3QgdHJhaWwgPSB0aGlzLnRyYWlsITtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0cmFpbC5ub2Rlc1sgaSBdO1xuICAgICAgY29uc3QgaGlnaGxpZ2h0ID0gbm9kZS5ncm91cEZvY3VzSGlnaGxpZ2h0O1xuICAgICAgaWYgKCBoaWdobGlnaHQgKSB7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRyYW5zZm9ybSB0cmFja2VyXG4gICAgICAgIGNvbnN0IHRyYWlsVG9QYXJlbnQgPSB0cmFpbC51cFRvTm9kZSggbm9kZSApO1xuICAgICAgICB0aGlzLmdyb3VwVHJhbnNmb3JtVHJhY2tlciA9IG5ldyBUcmFuc2Zvcm1UcmFja2VyKCB0cmFpbFRvUGFyZW50ICk7XG4gICAgICAgIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyLmFkZExpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XG5cbiAgICAgICAgaWYgKCB0eXBlb2YgaGlnaGxpZ2h0ID09PSAnYm9vbGVhbicgKSB7XG5cbiAgICAgICAgICAvLyBhZGQgYSBib3VuZGluZyByZWN0YW5nbGUgYXJvdW5kIHRoZSBub2RlIHRoYXQgdXNlcyBncm91cCBoaWdobGlnaHRzXG4gICAgICAgICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRTaGFwZUZyb21Ob2RlKCBub2RlLCB0cmFpbFRvUGFyZW50ICk7XG5cbiAgICAgICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgICAgdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUgPSB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoO1xuICAgICAgICAgIHRoaXMuZ3JvdXBNb2RlID0gJ2JvdW5kcyc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGhpZ2hsaWdodCBpbnN0YW5jZW9mIE5vZGUgKSB7XG4gICAgICAgICAgdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUgPSBoaWdobGlnaHQ7XG4gICAgICAgICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGFyZW50LmFkZENoaWxkKCBoaWdobGlnaHQgKTtcblxuICAgICAgICAgIHRoaXMuZ3JvdXBNb2RlID0gJ25vZGUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSBjbG9zZXN0IGFuY2VzdG9yIHdpdGggZ3JvdXAgaGlnaGxpZ2h0IHdpbGwgZ2V0IHRoZSBncm91cCBoaWdobGlnaHRcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBmb2N1cyBoaWdobGlnaHQgY29sb3JzLiBUaGlzIGlzIGEgbm8tb3AgaWYgd2UgYXJlIGluICdub2RlJyBtb2RlLCBvciBpZiBub25lIG9mIHRoZSBoaWdobGlnaHQgY29sb3JzXG4gICAqIGhhdmUgY2hhbmdlZC5cbiAgICpcbiAgICogVE9ETzogU3VwcG9ydCB1cGRhdGluZyBmb2N1cyBoaWdobGlnaHQgc3Ryb2tlcyBpbiAnbm9kZScgbW9kZSBhcyB3ZWxsPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVIaWdobGlnaHRDb2xvcnMoKTogdm9pZCB7XG5cbiAgICBpZiAoIHRoaXMubW9kZSA9PT0gJ3NoYXBlJyApIHtcbiAgICAgIGlmICggdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC5pbm5lckhpZ2hsaWdodENvbG9yICE9PSBIaWdobGlnaHRPdmVybGF5LmdldElubmVySGlnaGxpZ2h0Q29sb3IoKSApIHtcbiAgICAgICAgdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRJbm5lckhpZ2hsaWdodENvbG9yKCBIaWdobGlnaHRPdmVybGF5LmdldElubmVySGlnaGxpZ2h0Q29sb3IoKSApO1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLm91dGVySGlnaGxpZ2h0Q29sb3IgIT09IEhpZ2hsaWdodE92ZXJsYXkuZ2V0T3V0ZXJIaWdobGlnaHRDb2xvcigpICkge1xuICAgICAgICB0aGlzLnNoYXBlRm9jdXNIaWdobGlnaHRQYXRoLnNldE91dGVySGlnaGxpZ2h0Q29sb3IoIEhpZ2hsaWdodE92ZXJsYXkuZ2V0T3V0ZXJIaWdobGlnaHRDb2xvcigpICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLm1vZGUgPT09ICdib3VuZHMnICkge1xuICAgICAgaWYgKCB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC5pbm5lckhpZ2hsaWdodENvbG9yICE9PSBIaWdobGlnaHRPdmVybGF5LmdldElubmVySGlnaGxpZ2h0Q29sb3IoKSApIHtcbiAgICAgICAgdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGguc2V0SW5uZXJIaWdobGlnaHRDb2xvciggSGlnaGxpZ2h0T3ZlcmxheS5nZXRJbm5lckhpZ2hsaWdodENvbG9yKCkgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGgub3V0ZXJIaWdobGlnaHRDb2xvciAhPT0gSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckhpZ2hsaWdodENvbG9yKCkgKSB7XG4gICAgICAgIHRoaXMuYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoLnNldE91dGVySGlnaGxpZ2h0Q29sb3IoIEhpZ2hsaWdodE92ZXJsYXkuZ2V0T3V0ZXJIaWdobGlnaHRDb2xvcigpICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWYgYSBncm91cCBmb2N1cyBoaWdobGlnaHQgaXMgYWN0aXZlLCB1cGRhdGUgc3Ryb2tlc1xuICAgIGlmICggdGhpcy5ncm91cE1vZGUgKSB7XG4gICAgICBpZiAoIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGguaW5uZXJIaWdobGlnaHRDb2xvciAhPT0gSGlnaGxpZ2h0T3ZlcmxheS5nZXRJbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IoKSApIHtcbiAgICAgICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRJbm5lckhpZ2hsaWdodENvbG9yKCBIaWdobGlnaHRPdmVybGF5LmdldElubmVyR3JvdXBIaWdobGlnaHRDb2xvcigpICk7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMuZ3JvdXBGb2N1c0hpZ2hsaWdodFBhdGgub3V0ZXJIaWdobGlnaHRDb2xvciAhPT0gSGlnaGxpZ2h0T3ZlcmxheS5nZXRPdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IoKSApIHtcbiAgICAgICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5zZXRPdXRlckhpZ2hsaWdodENvbG9yKCBIaWdobGlnaHRPdmVybGF5LmdldE91dGVyR3JvdXBIaWdobGlnaHRDb2xvcigpICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0cyBieSBtYWtpbmcgdGhlbSBpbnZpc2libGUsIG9yIHJlbW92aW5nIHRoZW0gZnJvbSB0aGUgcm9vdCBvZiB0aGlzIG92ZXJsYXksXG4gICAqIGRlcGVuZGluZyBvbiBtb2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlR3JvdXBIaWdobGlnaHRzKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5ncm91cE1vZGUgKSB7XG4gICAgICBpZiAoIHRoaXMuZ3JvdXBNb2RlID09PSAnYm91bmRzJyApIHtcbiAgICAgICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0UGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5ncm91cE1vZGUgPT09ICdub2RlJyApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUsICdOZWVkIGEgZ3JvdXBIaWdobGlnaHROb2RlIHRvIGRlYWN0aXZhdGUgdGhpcyBtb2RlJyApO1xuICAgICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZ3JvdXBIaWdobGlnaHROb2RlISApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmdyb3VwTW9kZSA9IG51bGw7XG4gICAgICB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZSA9IG51bGw7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyLCAnTmVlZCBhIGdyb3VwVHJhbnNmb3JtVHJhY2tlciB0byBkaXNwb3NlJyApO1xuICAgICAgdGhpcy5ncm91cFRyYW5zZm9ybVRyYWNrZXIhLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybUxpc3RlbmVyICk7XG4gICAgICB0aGlzLmdyb3VwVHJhbnNmb3JtVHJhY2tlciEuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5ncm91cFRyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSBIaWdobGlnaHRPdmVybGF5IGFmdGVyIHRyYW5zZm9ybWluZyB0aGUgaGlnaGxpZ2h0LiBPbmx5IGNhbGxlZCB3aGVuIHRoZSB0cmFuc2Zvcm0gY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYWZ0ZXJUcmFuc2Zvcm0oKTogdm9pZCB7XG5cbiAgICAvLyBUaGlzIG1hdHJpeCBtYWtlcyBzdXJlIHRoYXQgdGhlIGxpbmUgd2lkdGggb2YgdGhlIGhpZ2hsaWdodCByZW1haW5zIGFwcHJvcHJpYXRlbHkgc2l6ZWQsIGV2ZW4gd2hlbiB0aGUgTm9kZVxuICAgIC8vIChhbmQgdGhlcmVmb3JlIGl0cyBoaWdobGlnaHQpIG1heSBiZSBzY2FsZWQuIEhvd2V2ZXIsIHdlIERPIHdhbnQgdG8gc2NhbGUgdXAgdGhlIGhpZ2hsaWdodCBsaW5lIHdpZHRoIHdoZW5cbiAgICAvLyB0aGUgc2NlbmUgaXMgem9vbWVkIGluIGZyb20gdGhlIGdsb2JhbCBwYW4vem9vbSBsaXN0ZW5lciwgc28gd2UgaW5jbHVkZSB0aGF0IGludmVydGVkIG1hdHJpeC5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyYW5zZm9ybVRyYWNrZXIsICdNdXN0IGhhdmUgYW4gYWN0aXZlIHRyYW5zZm9ybVRyYWNrZXIgdG8gYWRqdXN0IGZyb20gdHJhbnNmb3JtYXRpb24uJyApO1xuICAgIGNvbnN0IGxpbmVXaWR0aFNjYWxpbmdNYXRyaXggPSB0aGlzLnRyYW5zZm9ybVRyYWNrZXIhLmdldE1hdHJpeCgpLnRpbWVzTWF0cml4KCBIaWdobGlnaHRQYXRoLmdldENvcnJlY3RpdmVTY2FsaW5nTWF0cml4KCkgKTtcblxuICAgIGlmICggdGhpcy5tb2RlID09PSAnc2hhcGUnICkge1xuICAgICAgdGhpcy5zaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aC51cGRhdGVMaW5lV2lkdGgoIGxpbmVXaWR0aFNjYWxpbmdNYXRyaXggKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZSA9PT0gJ2JvdW5kcycgKSB7XG4gICAgICB0aGlzLmJvdW5kc0ZvY3VzSGlnaGxpZ2h0UGF0aC51cGRhdGVMaW5lV2lkdGgoIGxpbmVXaWR0aFNjYWxpbmdNYXRyaXggKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMubW9kZSA9PT0gJ25vZGUnICYmIHRoaXMuYWN0aXZlSGlnaGxpZ2h0IGluc3RhbmNlb2YgSGlnaGxpZ2h0UGF0aCAmJiB0aGlzLmFjdGl2ZUhpZ2hsaWdodC51cGRhdGVMaW5lV2lkdGggKSB7XG4gICAgICB0aGlzLmFjdGl2ZUhpZ2hsaWdodC51cGRhdGVMaW5lV2lkdGgoIGxpbmVXaWR0aFNjYWxpbmdNYXRyaXggKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZ3JvdXAgaGlnaGxpZ2h0IGlzIGFjdGl2ZSwgd2UgbmVlZCB0byBjb3JyZWN0IHRoZSBsaW5lIHdpZHRocyBmb3IgdGhhdCBoaWdobGlnaHQuXG4gICAgaWYgKCB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZSApIHtcbiAgICAgIGlmICggdGhpcy5ncm91cE1vZGUgPT09ICdib3VuZHMnICkge1xuICAgICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRQYXRoLnVwZGF0ZUxpbmVXaWR0aCggbGluZVdpZHRoU2NhbGluZ01hdHJpeCApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuZ3JvdXBNb2RlID09PSAnbm9kZScgJiYgdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUgaW5zdGFuY2VvZiBIaWdobGlnaHRQYXRoICYmIHRoaXMuZ3JvdXBIaWdobGlnaHROb2RlLnVwZGF0ZUxpbmVXaWR0aCApIHtcbiAgICAgICAgdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUudXBkYXRlTGluZVdpZHRoKCBsaW5lV2lkdGhTY2FsaW5nTWF0cml4ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFJlYWRpbmdCbG9jayBoaWdobGlnaHQgaXMgYWN0aXZlLCB3ZSBuZWVkIHRvIGNvcnJlY3QgdGhlIGxpbmUgd2lkdGhzIGZvciB0aGF0IGhpZ2hsaWdodC5cbiAgICBpZiAoIHRoaXMucmVhZGluZ0Jsb2NrVHJhaWwgKSB7XG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGgudXBkYXRlTGluZVdpZHRoKCBsaW5lV2lkdGhTY2FsaW5nTWF0cml4ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV2ZXJ5IHRpbWUgdGhlIHRyYW5zZm9ybSBjaGFuZ2VzIG9uIHRoZSB0YXJnZXQgTm9kZSBzaWduaWZ5IHRoYXQgdXBkYXRlcyBhcmUgbmVjZXNzYXJ5LCBzZWUgdGhlIHVzYWdlIG9mIHRoZVxuICAgKiBUcmFuc2Zvcm1UcmFja2Vycy5cbiAgICovXG4gIHByaXZhdGUgb25UcmFuc2Zvcm1DaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogTWFyayB0aGF0IHRoZSB0cmFuc2Zvcm0gZm9yIHRoZSBSZWFkaW5nQmxvY2sgaGlnaGxpZ2h0IGlzIG91dCBvZiBkYXRlIGFuZCBuZWVkcyB0byBiZSByZWNhbGN1bGF0ZWQgbmV4dCB1cGRhdGUuXG4gICAqL1xuICBwcml2YXRlIG9uUmVhZGluZ0Jsb2NrVHJhbnNmb3JtQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGJvdW5kcyBjaGFuZ2Ugb24gb3VyIG5vZGUgd2hlbiB3ZSBhcmUgaW4gXCJCb3VuZHNcIiBtb2RlXG4gICAqL1xuICBwcml2YXRlIG9uQm91bmRzQ2hhbmdlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm9kZSwgJ011c3QgaGF2ZSBhbiBhY3RpdmUgbm9kZSB3aGVuIGJvdW5kcyBhcmUgY2hhbmdpbmcnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50cmFpbCwgJ011c3QgaGF2ZSBhbiBhY3RpdmUgdHJhaWwgd2hlbiB1cGRhdGluZyBkZWZhdWx0IGJvdW5kcyBoaWdobGlnaHQnICk7XG4gICAgdGhpcy5ib3VuZHNGb2N1c0hpZ2hsaWdodFBhdGguc2V0U2hhcGVGcm9tTm9kZSggdGhpcy5ub2RlISwgdGhpcy50cmFpbCEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFpbiBTY2VuZXJ5IGZvY3VzIHBhaXIgKERpc3BsYXksVHJhaWwpIGNoYW5nZXMuIFRoZSBUcmFpbCBwb2ludHMgdG8gdGhlIE5vZGUgdGhhdCBoYXNcbiAgICogZm9jdXMgYW5kIGEgaGlnaGxpZ2h0IHdpbGwgYXBwZWFyIGFyb3VuZCB0aGlzIE5vZGUgaWYgZm9jdXMgaGlnaGxpZ2h0cyBhcmUgdmlzaWJsZS5cbiAgICovXG4gIHByaXZhdGUgb25Gb2N1c0NoYW5nZSggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcbiAgICBjb25zdCBuZXdUcmFpbCA9ICggZm9jdXMgJiYgZm9jdXMuZGlzcGxheSA9PT0gdGhpcy5kaXNwbGF5ICkgPyBmb2N1cy50cmFpbCA6IG51bGw7XG5cbiAgICBpZiAoIHRoaXMuaGFzSGlnaGxpZ2h0KCkgKSB7XG4gICAgICB0aGlzLmRlYWN0aXZhdGVIaWdobGlnaHQoKTtcbiAgICB9XG5cbiAgICBpZiAoIG5ld1RyYWlsICYmIHRoaXMucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBuZXdUcmFpbC5sYXN0Tm9kZSgpO1xuXG4gICAgICB0aGlzLmFjdGl2YXRlRm9jdXNIaWdobGlnaHQoIG5ld1RyYWlsLCBub2RlICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlICYmIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgdGhpcy51cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgY2hhbmdlcy4gcG9pbnRlckZvY3VzUHJvcGVydHkgd2lsbCBoYXZlIHRoZSBUcmFpbCB0byB0aGVcbiAgICogTm9kZSB0aGF0IGNvbXBvc2VzIFZvaWNpbmcgYW5kIGlzIHVuZGVyIHRoZSBQb2ludGVyLiBBIGhpZ2hsaWdodCB3aWxsIGFwcGVhciBhcm91bmQgdGhpcyBOb2RlIGlmXG4gICAqIHZvaWNpbmcgaGlnaGxpZ2h0cyBhcmUgdmlzaWJsZS5cbiAgICovXG4gIHByaXZhdGUgb25Qb2ludGVyRm9jdXNDaGFuZ2UoIGZvY3VzOiBGb2N1cyB8IG51bGwgKTogdm9pZCB7XG5cbiAgICAvLyB1cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCB3aWxsIG9ubHkgYWN0aXZhdGUgdGhlIGhpZ2hsaWdodCBpZiBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IGlzIGZhbHNlLFxuICAgIC8vIGJ1dCBjaGVjayBoZXJlIGFzIHdlbGwgc28gdGhhdCB3ZSBkb24ndCBkbyB3b3JrIHRvIGRlYWN0aXZhdGUgaGlnaGxpZ2h0cyBvbmx5IHRvIGltbWVkaWF0ZWx5IHJlYWN0aXZhdGUgdGhlbVxuICAgIGlmICggIXRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgJiZcbiAgICAgICAgICF0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLnVwZGF0ZUludGVyYWN0aXZlSGlnaGxpZ2h0KCBmb2N1cyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRyYXdzIHRoZSBoaWdobGlnaHQuIFRoZXJlIGFyZSBjYXNlcyB3aGVyZSB3ZSB3YW50IHRvIGRvIHRoaXMgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSBwb2ludGVyIGZvY3VzXG4gICAqIGlzIGxvY2tlZCwgc3VjaCBhcyB3aGVuIHRoZSBoaWdobGlnaHQgY2hhbmdlcyBjaGFuZ2VzIGZvciBhIE5vZGUgdGhhdCBpcyBhY3RpdmF0ZWQgZm9yIGhpZ2hsaWdodGluZy5cbiAgICpcbiAgICogQXMgb2YgOC8xMS8yMSB3ZSBhbHNvIGRlY2lkZWQgdGhhdCBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIHNob3VsZCBhbHNvIG5ldmVyIGJlIHNob3duIHdoaWxlXG4gICAqIFBET00gaGlnaGxpZ2h0cyBhcmUgdmlzaWJsZSwgdG8gYXZvaWQgY29uZnVzaW5nIGNhc2VzIHdoZXJlIHRoZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHRcbiAgICogY2FuIGFwcGVhciB3aGlsZSB0aGUgRE9NIGZvY3VzIGhpZ2hsaWdodCBpcyBhY3RpdmUgYW5kIGNvbnZleWluZyBpbmZvcm1hdGlvbi4gSW4gdGhlIGZ1dHVyZVxuICAgKiB3ZSBtaWdodCBtYWtlIGl0IHNvIHRoYXQgYm90aCBjYW4gYmUgdmlzaWJsZSBhdCB0aGUgc2FtZSB0aW1lLCBidXQgdGhhdCB3aWxsIHJlcXVpcmVcbiAgICogY2hhbmdpbmcgdGhlIGxvb2sgb2Ygb25lIG9mIHRoZSBoaWdobGlnaHRzIHNvIGl0IGlzIGNsZWFyIHRoZXkgYXJlIGRpc3RpbmN0LlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggZm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcbiAgICBjb25zdCBuZXdUcmFpbCA9ICggZm9jdXMgJiYgZm9jdXMuZGlzcGxheSA9PT0gdGhpcy5kaXNwbGF5ICkgPyBmb2N1cy50cmFpbCA6IG51bGw7XG5cbiAgICAvLyBhbHdheXMgY2xlYXIgdGhlIGhpZ2hsaWdodCBpZiBpdCBpcyBiZWluZyByZW1vdmVkXG4gICAgaWYgKCB0aGlzLmhhc0hpZ2hsaWdodCgpICkge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlSGlnaGxpZ2h0KCk7XG4gICAgfVxuXG4gICAgLy8gb25seSBhY3RpdmF0ZSBhIG5ldyBoaWdobGlnaHQgaWYgUERPTSBmb2N1cyBoaWdobGlnaHRzIGFyZSBub3QgZGlzcGxheWVkLCBzZWUgSlNEb2NcbiAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2U7XG4gICAgaWYgKCBuZXdUcmFpbCAmJiAhdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgY29uc3Qgbm9kZSA9IG5ld1RyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICAgIGlmICggKCBpc1JlYWRpbmdCbG9jayggbm9kZSApICYmIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS52YWx1ZSApIHx8XG4gICAgICAgICAgICggIWlzUmVhZGluZ0Jsb2NrKCBub2RlICkgJiYgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggbm9kZSApICYmIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICkgKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVJbnRlcmFjdGl2ZUhpZ2hsaWdodCggbmV3VHJhaWwsIG5vZGUgKTtcbiAgICAgICAgYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoICFhY3RpdmF0ZWQgJiYgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyAmJiB0aGlzLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLm9uRm9jdXNDaGFuZ2UoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW5ldmVyIHRoZSBsb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzLiBJZiB0aGUgbG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgY2hhbmdlcyB3ZSBwcm9iYWJseVxuICAgKiBoYXZlIHRvIHVwZGF0ZSB0aGUgaGlnaGxpZ2h0IGJlY2F1c2UgaW50ZXJhY3Rpb24gd2l0aCBhIE5vZGUgdGhhdCB1c2VzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIGp1c3QgZW5kZWQuXG4gICAqL1xuICBwcml2YXRlIG9uTG9ja2VkUG9pbnRlckZvY3VzQ2hhbmdlKCBmb2N1czogRm9jdXMgfCBudWxsICk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlSW50ZXJhY3RpdmVIaWdobGlnaHQoIGZvY3VzIHx8IHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNwb25zaWJsZSBmb3IgZGVhY3RpdmF0aW5nIHRoZSBSZWFkaW5nIEJsb2NrIGhpZ2hsaWdodCB3aGVuIHRoZSBkaXNwbGF5LmZvY3VzTWFuYWdlci5yZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5IGNoYW5nZXMuXG4gICAqIFRoZSBSZWFkaW5nIEJsb2NrIHdhaXRzIHRvIGFjdGl2YXRlIHVudGlsIHRoZSB2b2ljaW5nTWFuYWdlciBzdGFydHMgc3BlYWtpbmcgYmVjYXVzZSB0aGVyZSBpcyBvZnRlbiBhIHN0b3Agc3BlYWtpbmdcbiAgICogZXZlbnQgdGhhdCBjb21lcyByaWdodCBhZnRlciB0aGUgc3BlYWtlciBzdGFydHMgdG8gaW50ZXJydXB0IHRoZSBwcmV2aW91cyB1dHRlcmFuY2UuXG4gICAqL1xuICBwcml2YXRlIG9uUmVhZGluZ0Jsb2NrRm9jdXNDaGFuZ2UoIGZvY3VzOiBGb2N1cyB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmhhc1JlYWRpbmdCbG9ja0hpZ2hsaWdodCgpICkge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCk7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3VHJhaWwgPSAoIGZvY3VzICYmIGZvY3VzLmRpc3BsYXkgPT09IHRoaXMuZGlzcGxheSApID8gZm9jdXMudHJhaWwgOiBudWxsO1xuICAgIGlmICggbmV3VHJhaWwgKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCBuZXdUcmFpbCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgZm9jdXNlZCBub2RlIGhhcyBhbiB1cGRhdGVkIGZvY3VzIGhpZ2hsaWdodCwgd2UgbXVzdCBkbyBhbGwgdGhlIHdvcmsgb2YgaGlnaGxpZ2h0IGRlYWN0aXZhdGlvbi9hY3RpdmF0aW9uXG4gICAqIGFzIGlmIHRoZSBhcHBsaWNhdGlvbiBmb2N1cyBjaGFuZ2VkLiBJZiBmb2N1cyBoaWdobGlnaHQgbW9kZSBjaGFuZ2VkLCB3ZSBuZWVkIHRvIGFkZC9yZW1vdmUgc3RhdGljIGxpc3RlbmVycyxcbiAgICogYWRkL3JlbW92ZSBoaWdobGlnaHQgY2hpbGRyZW4sIGFuZCBzbyBvbi4gQ2FsbGVkIHdoZW4gZm9jdXMgaGlnaGxpZ2h0IGNoYW5nZXMsIGJ1dCBzaG91bGQgb25seSBldmVyIGJlXG4gICAqIG5lY2Vzc2FyeSB3aGVuIHRoZSBub2RlIGhhcyBmb2N1cy5cbiAgICovXG4gIHByaXZhdGUgb25Gb2N1c0hpZ2hsaWdodENoYW5nZSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUgJiYgdGhpcy5ub2RlLmZvY3VzZWQsICd1cGRhdGUgc2hvdWxkIG9ubHkgYmUgbmVjZXNzYXJ5IGlmIG5vZGUgYWxyZWFkeSBoYXMgZm9jdXMnICk7XG4gICAgdGhpcy5vbkZvY3VzQ2hhbmdlKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzICk7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIE5vZGUgaGFzIHBvaW50ZXIgZm9jdXMgYW5kIHRoZSBpbnRlcmFjaXZlIGhpZ2hsaWdodCBjaGFuZ2VzLCB3ZSBtdXN0IGRvIGFsbCBvZiB0aGUgd29yayB0byByZWFwcGx5IHRoZVxuICAgKiBoaWdobGlnaHQgYXMgaWYgdGhlIHZhbHVlIG9mIHRoZSBmb2N1c1Byb3BlcnR5IGNoYW5nZWQuXG4gICAqL1xuICBwcml2YXRlIG9uSW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2UoKTogdm9pZCB7XG5cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIHRoaXMubm9kZSApICk7XG4gICAgICBpZiAoIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIHRoaXMubm9kZSApICkge1xuICAgICAgICBjb25zdCBsb2NrZWRQb2ludGVyRm9jdXMgPSB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLmxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm5vZGUgfHwgKCBsb2NrZWRQb2ludGVyRm9jdXMgJiYgbG9ja2VkUG9pbnRlckZvY3VzLnRyYWlsLmxhc3ROb2RlKCkgPT09IHRoaXMubm9kZSApLFxuICAgICAgICAgICdVcGRhdGUgc2hvdWxkIG9ubHkgYmUgbmVjZXNzYXJ5IGlmIE5vZGUgaXMgYWN0aXZhdGVkIHdpdGggYSBQb2ludGVyIG9yIHBvaW50ZXIgZm9jdXMgaXMgbG9ja2VkIGR1cmluZyBpbnRlcmFjdGlvbicgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcmVmZXIgdGhlIHRyYWlsIHRvIHRoZSAnbG9ja2VkJyBoaWdobGlnaHRcbiAgICB0aGlzLnVwZGF0ZUludGVyYWN0aXZlSGlnaGxpZ2h0KFxuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZSB8fFxuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVkcmF3IHRoZSBoaWdobGlnaHQgZm9yIHRoZSBSZWFkaW5nQmxvY2sgaWYgaXQgY2hhbmdlcyB3aGlsZSB0aGUgcmVhZGluZyBibG9jayBoaWdobGlnaHQgaXMgYWxyZWFkeVxuICAgKiBhY3RpdmUgZm9yIGEgTm9kZS5cbiAgICovXG4gIHByaXZhdGUgb25SZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2UoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hY3RpdmVSZWFkaW5nQmxvY2tOb2RlLCAnVXBkYXRlIHNob3VsZCBvbmx5IGJlIG5lY2Vzc2FyeSB3aGVuIHRoZXJlIGlzIGFuIGFjdGl2ZSBSZWFkaW5nQmxvY2sgTm9kZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmFjdGl2ZVJlYWRpbmdCbG9ja05vZGUhLnJlYWRpbmdCbG9ja0FjdGl2YXRlZCwgJ1VwZGF0ZSBzaG91bGQgb25seSBiZSBuZWNlc3Nhcnkgd2hpbGUgdGhlIFJlYWRpbmdCbG9jayBpcyBhY3RpdmF0ZWQnICk7XG4gICAgdGhpcy5vblJlYWRpbmdCbG9ja0ZvY3VzQ2hhbmdlKCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkudmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGZvY3VzIGhpZ2hsaWdodCB2aXNpYmlsaXR5IGNoYW5nZXMsIGRlYWN0aXZhdGUgaGlnaGxpZ2h0cyBvciByZWFjdGl2YXRlIHRoZSBoaWdobGlnaHQgYXJvdW5kIHRoZSBOb2RlXG4gICAqIHdpdGggZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIG9uRm9jdXNIaWdobGlnaHRzVmlzaWJsZUNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLm9uRm9jdXNDaGFuZ2UoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHZvaWNpbmcgaGlnaGxpZ2h0IHZpc2liaWxpdHkgY2hhbmdlcywgZGVhY3RpdmF0ZSBoaWdobGlnaHRzIG9yIHJlYWN0aXZhdGUgdGhlIGhpZ2hsaWdodCBhcm91bmQgdGhlIE5vZGVcbiAgICogd2l0aCBmb2N1cy4gTm90ZSB0aGF0IHdoZW4gdm9pY2luZyBpcyBkaXNhYmxlZCB3ZSB3aWxsIG5ldmVyIHNldCB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgdG8gcHJldmVudFxuICAgKiBleHRyYSB3b3JrLCBzbyB0aGlzIGZ1bmN0aW9uIHNob3VsZG4ndCBkbyBtdWNoLiBCdXQgaXQgaXMgaGVyZSB0byBjb21wbGV0ZSB0aGUgQVBJLlxuICAgKi9cbiAgcHJpdmF0ZSBvblZvaWNpbmdIaWdobGlnaHRzVmlzaWJsZUNoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLm9uUG9pbnRlckZvY3VzQ2hhbmdlKCB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJ5IERpc3BsYXksIHVwZGF0ZXMgdGhpcyBvdmVybGF5IGluIHRoZSBEaXNwbGF5LnVwZGF0ZURpc3BsYXkgY2FsbC5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGhpZ2hsaWdodCB0byBtYXRjaCB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGVcbiAgICBpZiAoIHRoaXMuaGFzSGlnaGxpZ2h0KCkgJiYgdGhpcy50cmFuc2Zvcm1EaXJ0eSApIHtcbiAgICAgIHRoaXMudHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50cmFuc2Zvcm1UcmFja2VyLCAnVGhlIHRyYW5zZm9ybVRyYWNrZXIgbXVzdCBiZSBhdmFpbGFibGUgb24gdXBkYXRlIGlmIHRyYW5zZm9ybSBpcyBkaXJ0eScgKTtcbiAgICAgIHRoaXMuaGlnaGxpZ2h0Tm9kZS5zZXRNYXRyaXgoIHRoaXMudHJhbnNmb3JtVHJhY2tlciEubWF0cml4ICk7XG5cbiAgICAgIGlmICggdGhpcy5ncm91cEhpZ2hsaWdodE5vZGUgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyLCAnVGhlIGdyb3VwVHJhbnNmb3JtVHJhY2tlciBtdXN0IGJlIGF2YWlsYWJsZSBvbiB1cGRhdGUgaWYgdHJhbnNmb3JtIGlzIGRpcnR5JyApO1xuICAgICAgICB0aGlzLmdyb3VwSGlnaGxpZ2h0Tm9kZS5zZXRNYXRyaXgoIHRoaXMuZ3JvdXBUcmFuc2Zvcm1UcmFja2VyIS5tYXRyaXggKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZnRlclRyYW5zZm9ybSgpO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuaGFzUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0KCkgJiYgdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1EaXJ0eSApIHtcbiAgICAgIHRoaXMucmVhZGluZ0Jsb2NrVHJhbnNmb3JtRGlydHkgPSBmYWxzZTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyLCAnVGhlIGdyb3VwVHJhbnNmb3JtVHJhY2tlciBtdXN0IGJlIGF2YWlsYWJsZSBvbiB1cGRhdGUgaWYgdHJhbnNmb3JtIGlzIGRpcnR5JyApO1xuICAgICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlLnNldE1hdHJpeCggdGhpcy5yZWFkaW5nQmxvY2tUcmFuc2Zvcm1UcmFja2VyIS5tYXRyaXggKTtcbiAgICB9XG5cbiAgICBpZiAoICF0aGlzLmRpc3BsYXkuc2l6ZS5lcXVhbHMoIHRoaXMuZm9jdXNEaXNwbGF5LnNpemUgKSApIHtcbiAgICAgIHRoaXMuZm9jdXNEaXNwbGF5LnNldFdpZHRoSGVpZ2h0KCB0aGlzLmRpc3BsYXkud2lkdGgsIHRoaXMuZGlzcGxheS5oZWlnaHQgKTtcbiAgICB9XG4gICAgdGhpcy5mb2N1c0Rpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5uZXIgY29sb3Igb2YgYWxsIGZvY3VzIGhpZ2hsaWdodHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNldElubmVySGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XG4gICAgaW5uZXJIaWdobGlnaHRDb2xvciA9IGNvbG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgaW5uZXIgY29sb3Igb2YgYWxsIGZvY3VzIGhpZ2hsaWdodHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldElubmVySGlnaGxpZ2h0Q29sb3IoKTogVFBhaW50IHtcbiAgICByZXR1cm4gaW5uZXJIaWdobGlnaHRDb2xvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIG91dGVyIGNvbG9yIG9mIGFsbCBmb2N1cyBoaWdobGlnaHRzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzZXRPdXRlckhpbGlnaHRDb2xvciggY29sb3I6IFRQYWludCApOiB2b2lkIHtcbiAgICBvdXRlckhpZ2hsaWdodENvbG9yID0gY29sb3I7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBvdXRlciBjb2xvciBvZiBhbGwgZm9jdXMgaGlnaGxpZ2h0cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3V0ZXJIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQge1xuICAgIHJldHVybiBvdXRlckhpZ2hsaWdodENvbG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5uZXIgY29sb3Igb2YgYWxsIGdyb3VwIGZvY3VzIGhpZ2hsaWdodHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNldElubmVyR3JvdXBIaWdobGlnaHRDb2xvciggY29sb3I6IFRQYWludCApOiB2b2lkIHtcbiAgICBpbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IgPSBjb2xvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlubmVyIGNvbG9yIG9mIGFsbCBncm91cCBmb2N1cyBoaWdobGlnaHRzXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldElubmVyR3JvdXBIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQge1xuICAgIHJldHVybiBpbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3I7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBvdXRlciBjb2xvciBvZiBhbGwgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzZXRPdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XG4gICAgb3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yID0gY29sb3I7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBvdXRlciBjb2xvciBvZiBhbGwgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0T3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yKCk6IFRQYWludCB7XG4gICAgcmV0dXJuIG91dGVyR3JvdXBIaWdobGlnaHRDb2xvcjtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSGlnaGxpZ2h0T3ZlcmxheScsIEhpZ2hsaWdodE92ZXJsYXkgKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiU2hhcGUiLCJvcHRpb25pemUiLCJpc1JlYWRpbmdCbG9jayIsIkFjdGl2YXRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsIkRpc3BsYXkiLCJGb2N1c01hbmFnZXIiLCJIaWdobGlnaHRGcm9tTm9kZSIsIkhpZ2hsaWdodFBhdGgiLCJpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiTm9kZSIsInNjZW5lcnkiLCJUcmFuc2Zvcm1UcmFja2VyIiwib3V0ZXJIaWdobGlnaHRDb2xvciIsIk9VVEVSX0ZPQ1VTX0NPTE9SIiwiaW5uZXJIaWdobGlnaHRDb2xvciIsIklOTkVSX0ZPQ1VTX0NPTE9SIiwiaW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiSU5ORVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IiLCJvdXRlckdyb3VwSGlnaGxpZ2h0Q29sb3IiLCJPVVRFUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUiIsIkhpZ2hsaWdodE92ZXJsYXkiLCJkaXNwb3NlIiwiaGFzSGlnaGxpZ2h0IiwiZGVhY3RpdmF0ZUhpZ2hsaWdodCIsInBkb21Gb2N1c1Byb3BlcnR5IiwidW5saW5rIiwiZG9tRm9jdXNMaXN0ZW5lciIsInBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJmb2N1c0hpZ2hsaWdodHNWaXNpYmxlTGlzdGVuZXIiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJ2b2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVMaXN0ZW5lciIsImRpc3BsYXkiLCJmb2N1c01hbmFnZXIiLCJwb2ludGVyRm9jdXNQcm9wZXJ0eSIsInBvaW50ZXJGb2N1c0xpc3RlbmVyIiwicmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSIsInJlYWRpbmdCbG9ja0ZvY3VzTGlzdGVuZXIiLCJmb2N1c0Rpc3BsYXkiLCJ0cmFpbCIsImhhc1JlYWRpbmdCbG9ja0hpZ2hsaWdodCIsInJlYWRpbmdCbG9ja1RyYWlsIiwiYWN0aXZhdGVIaWdobGlnaHQiLCJub2RlIiwibm9kZUhpZ2hsaWdodCIsImxheWVyYWJsZSIsInZpc2libGVQcm9wZXJ0eSIsImhpZ2hsaWdodCIsImFjdGl2ZUhpZ2hsaWdodCIsInRyYWlsVG9UcmFjayIsIm1vZGUiLCJzaGFwZUZvY3VzSGlnaGxpZ2h0UGF0aCIsInZpc2libGUiLCJzZXRTaGFwZSIsInRyYW5zZm9ybVNvdXJjZU5vZGUiLCJnZXRVbmlxdWVIaWdobGlnaHRUcmFpbCIsIm5vZGVNb2RlSGlnaGxpZ2h0Iiwibm9kZU1vZGVIaWdobGlnaHRMYXllcmVkIiwiZ2V0IiwiaGlnaGxpZ2h0Tm9kZSIsImFkZENoaWxkIiwiYm91bmRzRm9jdXNIaWdobGlnaHRQYXRoIiwic2V0U2hhcGVGcm9tTm9kZSIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsImJvdW5kc0xpc3RlbmVyIiwib25Cb3VuZHNDaGFuZ2UiLCJ0cmFuc2Zvcm1UcmFja2VyIiwiaXNTdGF0aWMiLCJhZGRMaXN0ZW5lciIsInRyYW5zZm9ybUxpc3RlbmVyIiwiYWN0aXZhdGVHcm91cEhpZ2hsaWdodHMiLCJ1cGRhdGVIaWdobGlnaHRDb2xvcnMiLCJ0cmFuc2Zvcm1EaXJ0eSIsImFjdGl2YXRlRm9jdXNIaWdobGlnaHQiLCJmb2N1c0hpZ2hsaWdodCIsImZvY3VzSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiZm9jdXNIaWdobGlnaHRDaGFuZ2VkRW1pdHRlciIsImZvY3VzSGlnaGxpZ2h0TGlzdGVuZXIiLCJhY3RpdmF0ZUludGVyYWN0aXZlSGlnaGxpZ2h0IiwiaW50ZXJhY3RpdmVIaWdobGlnaHQiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSIsImFzc2VydCIsImludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodExpc3RlbmVyIiwiYWN0aXZhdGVSZWFkaW5nQmxvY2tIaWdobGlnaHQiLCJsYXN0Tm9kZSIsImFjdGl2ZVJlYWRpbmdCbG9ja05vZGUiLCJyZWFkaW5nQmxvY2tIaWdobGlnaHQiLCJyZWFkaW5nQmxvY2tBY3RpdmVIaWdobGlnaHQiLCJhZGRlZFJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsInJlYWRpbmdCbG9ja0hpZ2hsaWdodFBhdGgiLCJyZWFkaW5nQmxvY2tIaWdobGlnaHROb2RlIiwicmVhZGluZ0Jsb2NrVHJhbnNmb3JtVHJhY2tlciIsInJlYWRpbmdCbG9ja1RyYW5zZm9ybUxpc3RlbmVyIiwicmVhZGluZ0Jsb2NrQWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJyZWFkaW5nQmxvY2tIaWdobGlnaHRDaGFuZ2VMaXN0ZW5lciIsInJlYWRpbmdCbG9ja1RyYW5zZm9ybURpcnR5IiwiZGVhY3RpdmF0ZVJlYWRpbmdCbG9ja0hpZ2hsaWdodCIsInJlbW92ZUNoaWxkIiwicmVtb3ZlTGlzdGVuZXIiLCJhY3RpdmVOb2RlIiwiaXNEaXNwb3NlZCIsImhhc0xpc3RlbmVyIiwiZGVhY3RpdmF0ZUdyb3VwSGlnaGxpZ2h0cyIsImkiLCJsZW5ndGgiLCJub2RlcyIsImdyb3VwRm9jdXNIaWdobGlnaHQiLCJ0cmFpbFRvUGFyZW50IiwidXBUb05vZGUiLCJncm91cFRyYW5zZm9ybVRyYWNrZXIiLCJncm91cEZvY3VzSGlnaGxpZ2h0UGF0aCIsImdyb3VwSGlnaGxpZ2h0Tm9kZSIsImdyb3VwTW9kZSIsImdyb3VwRm9jdXNIaWdobGlnaHRQYXJlbnQiLCJnZXRJbm5lckhpZ2hsaWdodENvbG9yIiwic2V0SW5uZXJIaWdobGlnaHRDb2xvciIsImdldE91dGVySGlnaGxpZ2h0Q29sb3IiLCJzZXRPdXRlckhpZ2hsaWdodENvbG9yIiwiZ2V0SW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiZ2V0T3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiYWZ0ZXJUcmFuc2Zvcm0iLCJsaW5lV2lkdGhTY2FsaW5nTWF0cml4IiwiZ2V0TWF0cml4IiwidGltZXNNYXRyaXgiLCJnZXRDb3JyZWN0aXZlU2NhbGluZ01hdHJpeCIsInVwZGF0ZUxpbmVXaWR0aCIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwib25SZWFkaW5nQmxvY2tUcmFuc2Zvcm1DaGFuZ2UiLCJvbkZvY3VzQ2hhbmdlIiwiZm9jdXMiLCJuZXdUcmFpbCIsInZhbHVlIiwidXBkYXRlSW50ZXJhY3RpdmVIaWdobGlnaHQiLCJvblBvaW50ZXJGb2N1c0NoYW5nZSIsImxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IiwiYWN0aXZhdGVkIiwicmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsInBkb21Gb2N1cyIsIm9uTG9ja2VkUG9pbnRlckZvY3VzQ2hhbmdlIiwib25SZWFkaW5nQmxvY2tGb2N1c0NoYW5nZSIsIm9uRm9jdXNIaWdobGlnaHRDaGFuZ2UiLCJmb2N1c2VkIiwib25JbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZSIsImxvY2tlZFBvaW50ZXJGb2N1cyIsIm9uUmVhZGluZ0Jsb2NrSGlnaGxpZ2h0Q2hhbmdlIiwicmVhZGluZ0Jsb2NrQWN0aXZhdGVkIiwib25Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlQ2hhbmdlIiwib25Wb2ljaW5nSGlnaGxpZ2h0c1Zpc2libGVDaGFuZ2UiLCJ1cGRhdGUiLCJzZXRNYXRyaXgiLCJtYXRyaXgiLCJzaXplIiwiZXF1YWxzIiwic2V0V2lkdGhIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsInVwZGF0ZURpc3BsYXkiLCJjb2xvciIsInNldE91dGVySGlsaWdodENvbG9yIiwic2V0SW5uZXJHcm91cEhpZ2hsaWdodENvbG9yIiwic2V0T3V0ZXJHcm91cEhpZ2hsaWdodENvbG9yIiwiZm9jdXNSb290Tm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhbGxvd1dlYkdMIiwiaXNXZWJHTEFsbG93ZWQiLCJhbGxvd0NTU0hhY2tzIiwiYWNjZXNzaWJpbGl0eSIsImludGVyYWN0aXZlIiwiYWxsb3dMYXllckZpdHRpbmciLCJkb21FbGVtZW50Iiwic3R5bGUiLCJwb2ludGVyRXZlbnRzIiwidXNlTG9jYWxCb3VuZHMiLCJ1c2VHcm91cERpbGF0aW9uIiwib3V0ZXJMaW5lV2lkdGgiLCJHUk9VUF9PVVRFUl9MSU5FX1dJRFRIIiwiaW5uZXJMaW5lV2lkdGgiLCJHUk9VUF9JTk5FUl9MSU5FX1dJRFRIIiwiaW5uZXJTdHJva2UiLCJjaGlsZHJlbiIsImJpbmQiLCJsb2NrZWRQb2lu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