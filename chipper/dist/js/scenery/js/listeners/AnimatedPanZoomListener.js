// Copyright 2019-2024, University of Colorado Boulder
/**
 * A PanZoomListener that supports additional forms of input for pan and zoom, including trackpad gestures, mouse
 * wheel, and keyboard input. These gestures will animate the target node to its destination translation and scale so it
 * uses a step function that must be called every animation frame.
 *
 * @author Jesse Greenberg
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import isSettingPhetioStateProperty from '../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { EventIO, FocusManager, globalKeyStateTracker, Intent, KeyboardDragListener, KeyboardUtils, KeyboardZoomUtils, Mouse, PanZoomListener, PDOMPointer, PDOMUtils, PressListener, scenery, TransformTracker } from '../imports.js';
// constants
const MOVE_CURSOR = 'all-scroll';
const MAX_SCROLL_VELOCITY = 150; // max global view coords per second while scrolling with middle mouse button drag
// The max speed of translation when animating from source position to destination position in the coordinate frame
// of the parent of the targetNode of this listener. Increase the value of this to animate faster to the destination
// position when panning to targets.
const MAX_TRANSLATION_SPEED = 1000;
// scratch variables to reduce garbage
const scratchTranslationVector = new Vector2(0, 0);
const scratchScaleTargetVector = new Vector2(0, 0);
const scratchVelocityVector = new Vector2(0, 0);
const scratchBounds = new Bounds2(0, 0, 0, 0);
let AnimatedPanZoomListener = class AnimatedPanZoomListener extends PanZoomListener {
    /**
   * Step the listener, supporting any animation as the target node is transformed to target position and scale.
   */ step(dt) {
        if (this.middlePress) {
            this.handleMiddlePress(dt);
        }
        // if dragging an item with a mouse or touch pointer, make sure that it ramains visible in the zoomed in view,
        // panning to it when it approaches edge of the screen
        if (this._attachedPointers.length > 0) {
            // only need to do this work if we are zoomed in
            if (this.getCurrentScale() > 1) {
                if (this._attachedPointers.length > 0) {
                    // Filter out any pointers that no longer have an attached listener due to interruption from things like opening
                    // the context menu with a right click.
                    this._attachedPointers = this._attachedPointers.filter((pointer)=>pointer.attachedListener);
                    assert && assert(this._attachedPointers.length <= 10, 'Not clearing attachedPointers, there is probably a memory leak');
                }
                // Only reposition if one of the attached pointers is down and dragging within the drag bounds area, or if one
                // of the attached pointers is a PDOMPointer, which indicates that we are dragging with alternative input
                // (in which case draggingInDragBounds does not apply)
                if (this._draggingInDragBounds || this._attachedPointers.some((pointer)=>pointer instanceof PDOMPointer)) {
                    this.repositionDuringDrag();
                }
            }
        }
        this.animateToTargets(dt);
    }
    /**
   * Attach a MiddlePress for drag panning, if detected.
   */ down(event) {
        super.down(event);
        // If the Pointer signifies the input is intended for dragging save a reference to the trail so we can support
        // keeping the event target in view during the drag operation.
        if (this._dragBounds !== null && event.pointer.hasIntent(Intent.DRAG)) {
            // if this is our only down pointer, see if we should start panning during drag
            if (this._attachedPointers.length === 0) {
                this._draggingInDragBounds = this._dragBounds.containsPoint(event.pointer.point);
            }
            // All conditions are met to start watching for bounds to keep in view during a drag interaction. Eagerly
            // save the attachedListener here so that we don't have to do any work in the move event.
            if (event.pointer.attachedListener) {
                if (!this._attachedPointers.includes(event.pointer)) {
                    this._attachedPointers.push(event.pointer);
                }
            }
        }
        // begin middle press panning if we aren't already in that state
        if (event.pointer.type === 'mouse' && event.pointer instanceof Mouse && event.pointer.middleDown && !this.middlePress) {
            this.middlePress = new MiddlePress(event.pointer, event.trail);
            event.pointer.cursor = MOVE_CURSOR;
        } else {
            this.cancelMiddlePress();
        }
    }
    /**
   * If in a state where we are panning from a middle mouse press, exit that state.
   */ cancelMiddlePress() {
        if (this.middlePress) {
            this.middlePress.pointer.cursor = null;
            this.middlePress = null;
            this.stopInProgressAnimation();
        }
    }
    /**
   * Listener for the attached pointer on move. Only move if a middle press is not currently down.
   */ movePress(press) {
        if (!this.middlePress) {
            super.movePress(press);
        }
    }
    /**
   * Part of the Scenery listener API. Supports repositioning while dragging a more descendant level
   * Node under this listener. If the node and pointer are out of the dragBounds, we reposition to keep the Node
   * visible within dragBounds.
   *
   * (scenery-internal)
   */ move(event) {
        // No need to do this work if we are zoomed out.
        if (this._attachedPointers.length > 0 && this.getCurrentScale() > 1) {
            // Only try to get the attached listener if we didn't successfully get it on the down event. This should only
            // happen if the drag did not start withing dragBounds (the listener is likely pulling the Node into view) or
            // if a listener has not been attached yet. Once a listener is attached we can start using it to look for the
            // bounds to keep in view.
            if (this._draggingInDragBounds) {
                if (!this._attachedPointers.includes(event.pointer)) {
                    const hasDragIntent = this.hasDragIntent(event.pointer);
                    const currentTargetExists = event.currentTarget !== null;
                    if (currentTargetExists && hasDragIntent) {
                        if (event.pointer.attachedListener) {
                            this._attachedPointers.push(event.pointer);
                        }
                    }
                }
            } else {
                if (this._dragBounds) {
                    this._draggingInDragBounds = this._dragBounds.containsPoint(event.pointer.point);
                }
            }
        }
    }
    /**
   * This function returns the targetNode if there are attached pointers and an attachedPressListener during a drag event,
   * otherwise the function returns null.
   */ getTargetNodeDuringDrag() {
        if (this._attachedPointers.length > 0) {
            // We have an attachedListener from a SceneryEvent Pointer, see if it has information we can use to
            // get the target Bounds for the drag event.
            // Only use the first one so that unique dragging behaviors don't "fight" if multiple pointers are down.
            const activeListener = this._attachedPointers[0].attachedListener;
            assert && assert(activeListener, 'The attached Pointer is expected to have an attached listener.');
            if (activeListener.listener instanceof PressListener || activeListener.listener instanceof KeyboardDragListener) {
                const attachedPressListener = activeListener.listener;
                // The PressListener might not be pressed anymore but the Pointer is still down, in which case it
                // has been interrupted or cancelled.
                // NOTE: It is possible I need to cancelPanDuringDrag() if it is no longer pressed, but I don't
                // want to clear the reference to the attachedListener, and I want to support resuming drag during touch-snag.
                if (attachedPressListener.isPressed) {
                    // this will either be the PressListener's targetNode or the default target of the SceneryEvent on press
                    return attachedPressListener.getCurrentTarget();
                }
            }
        }
        return null;
    }
    /**
   * Gets the Bounds2 in the global coordinate frame that we are going to try to keep in view during a drag
   * operation.
   */ getGlobalBoundsToViewDuringDrag() {
        let globalBoundsToView = null;
        if (this._attachedPointers.length > 0) {
            // We have an attachedListener from a SceneryEvent Pointer, see if it has information we can use to
            // get the target Bounds for the drag event.
            // Only use the first one so that unique dragging behaviors don't "fight" if multiple pointers are down.
            const activeListener = this._attachedPointers[0].attachedListener;
            assert && assert(activeListener, 'The attached Pointer is expected to have an attached listener.');
            if (activeListener.createPanTargetBounds) {
                // client has defined the Bounds they want to keep in view for this Pointer (it is assigned to the
                // Pointer to support multitouch cases)
                globalBoundsToView = activeListener.createPanTargetBounds();
            } else if (activeListener.listener instanceof PressListener || activeListener.listener instanceof KeyboardDragListener) {
                const attachedPressListener = activeListener.listener;
                // The PressListener might not be pressed anymore but the Pointer is still down, in which case it
                // has been interrupted or cancelled.
                // NOTE: It is possible I need to cancelPanDuringDrag() if it is no longer pressed, but I don't
                // want to clear the reference to the attachedListener, and I want to support resuming drag during touch-snag.
                if (attachedPressListener.isPressed) {
                    // this will either be the PressListener's targetNode or the default target of the SceneryEvent on press
                    const target = attachedPressListener.getCurrentTarget();
                    // TODO: For now we cannot support DAG. We may be able to use PressListener.pressedTrail instead of https://github.com/phetsims/scenery/issues/1581
                    // getCurrentTarget, and then we would have a uniquely defined trail. See
                    // https://github.com/phetsims/scenery/issues/1361 and
                    // https://github.com/phetsims/scenery/issues/1356#issuecomment-1039678678
                    if (target.instances.length === 1) {
                        const trail = target.instances[0].trail;
                        assert && assert(trail, 'The target should be in one scene graph and have an instance with a trail.');
                        globalBoundsToView = trail.parentToGlobalBounds(target.visibleBounds);
                    }
                }
            }
        }
        return globalBoundsToView;
    }
    /**
   * During a drag of another Node that is a descendant of this listener's targetNode, reposition if the
   * node is out of dragBounds so that the Node is always within panBounds.
   */ repositionDuringDrag() {
        const globalBounds = this.getGlobalBoundsToViewDuringDrag();
        const targetNode = this.getTargetNodeDuringDrag();
        globalBounds && this.keepBoundsInView(globalBounds, this._attachedPointers.some((pointer)=>pointer instanceof PDOMPointer), targetNode == null ? void 0 : targetNode.limitPanDirection);
    }
    /**
   * Stop panning during drag by clearing variables that are set to indicate and provide information for this work.
   * @param [event] - if not provided all are panning is cancelled and we assume interruption
   */ cancelPanningDuringDrag(event) {
        if (event) {
            // remove the attachedPointer associated with the event
            const index = this._attachedPointers.indexOf(event.pointer);
            if (index > -1) {
                this._attachedPointers.splice(index, 1);
            }
        } else {
            // There is no SceneryEvent, we must be interrupting - clear all attachedPointers
            this._attachedPointers = [];
        }
        // Clear flag indicating we are "dragging in bounds" next move
        this._draggingInDragBounds = false;
    }
    /**
   * Scenery listener API. Cancel any drag and pan behavior for the Pointer on the event.
   *
   * (scenery-internal)
   */ up(event) {
        this.cancelPanningDuringDrag(event);
    }
    /**
   * Input listener for the 'wheel' event, part of the Scenery Input API.
   * (scenery-internal)
   */ wheel(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener wheel');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // cannot reposition if a dragging with middle mouse button - but wheel zoom should not cancel a middle press
        // (behavior copied from other browsers)
        if (!this.middlePress) {
            const wheel = new Wheel(event, this._targetScale);
            this.repositionFromWheel(wheel, event);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Keydown listener for events outside of the PDOM. Attached as a listener to the body and driven by
   * Events rather than SceneryEvents. When we handle Events from within the PDOM we need the Pointer to
   * determine if attached. But from outside of the PDOM we know that there is no focus in the document and therfore
   * the PDOMPointer is not attached.
   */ windowKeydown(domEvent) {
        // on any keyboard reposition interrupt the middle press panning
        this.cancelMiddlePress();
        const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found
        if (!simGlobal || !simGlobal.display._accessible || !simGlobal.display.pdomRootElement.contains(domEvent.target)) {
            this.handleZoomCommands(domEvent);
            // handle translation without worry of the pointer being attached because there is no pointer at this level
            if (KeyboardUtils.isArrowKey(domEvent)) {
                const keyPress = new KeyPress(globalKeyStateTracker, this.getCurrentScale(), this._targetScale);
                this.repositionFromKeys(keyPress);
            }
        }
    }
    /**
   * For the Scenery listener API, handle a keydown event. This SceneryEvent will have been dispatched from
   * Input.dispatchEvent and so the Event target must be within the PDOM. In this case, we may
   * need to prevent translation if the PDOMPointer is attached.
   *
   * (scenery-internal)
   */ keydown(event) {
        const domEvent = event.domEvent;
        assert && assert(domEvent instanceof KeyboardEvent, 'keydown event must be a KeyboardEvent'); // eslint-disable-line phet/no-simple-type-checking-assertions
        // on any keyboard reposition interrupt the middle press panning
        this.cancelMiddlePress();
        // handle zoom
        this.handleZoomCommands(domEvent);
        const keyboardDragIntent = event.pointer.hasIntent(Intent.KEYBOARD_DRAG);
        // handle translation
        if (KeyboardUtils.isArrowKey(domEvent)) {
            if (!keyboardDragIntent) {
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener handle arrow key down');
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                const keyPress = new KeyPress(globalKeyStateTracker, this.getCurrentScale(), this._targetScale);
                this.repositionFromKeys(keyPress);
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            }
        }
    }
    /**
   * Handle a change of focus by immediately panning so that the focused Node is in view. Also sets up the
   * TransformTracker which will automatically keep the target in the viewport as it is animates, and a listener
   * on the focusPanTargetBoundsProperty (if provided) to handle Node other size or custom changes.
   */ handleFocusChange(focus, previousFocus) {
        // Remove listeners on the previous focus watching transform and bounds changes
        if (this._transformTracker) {
            this._transformTracker.dispose();
            this._transformTracker = null;
        }
        if (previousFocus && previousFocus.trail.lastNode() && previousFocus.trail.lastNode().focusPanTargetBoundsProperty) {
            const previousBoundsProperty = previousFocus.trail.lastNode().focusPanTargetBoundsProperty;
            assert && assert(this._focusBoundsListener && previousBoundsProperty.hasListener(this._focusBoundsListener), 'Focus bounds listener should be linked to the previous Node');
            previousBoundsProperty.unlink(this._focusBoundsListener);
            this._focusBoundsListener = null;
        }
        if (focus) {
            const lastNode = focus.trail.lastNode();
            let trailToTrack = focus.trail;
            if (focus.trail.containsNode(this._targetNode)) {
                // Track transforms to the focused Node, but exclude the targetNode so that repositions during pan don't
                // trigger another transform update.
                const indexOfTarget = focus.trail.nodes.indexOf(this._targetNode);
                const indexOfLeaf = focus.trail.nodes.length; // end of slice is not included
                trailToTrack = focus.trail.slice(indexOfTarget, indexOfLeaf);
            }
            this._transformTracker = new TransformTracker(trailToTrack);
            const focusMovementListener = ()=>{
                if (this.getCurrentScale() > 1) {
                    let globalBounds;
                    if (lastNode.focusPanTargetBoundsProperty) {
                        // This Node has a custom bounds area that we need to keep in view
                        const localBounds = lastNode.focusPanTargetBoundsProperty.value;
                        globalBounds = focus.trail.localToGlobalBounds(localBounds);
                    } else {
                        // by default, use the global bounds of the Node - note this is the full Trail to the focused Node,
                        // not the subtrail used by TransformTracker
                        globalBounds = focus.trail.localToGlobalBounds(focus.trail.lastNode().localBounds);
                    }
                    this.keepBoundsInView(globalBounds, true, lastNode.limitPanDirection);
                }
            };
            // observe changes to the transform
            this._transformTracker.addListener(focusMovementListener);
            // observe changes on the client-provided local bounds
            if (lastNode.focusPanTargetBoundsProperty) {
                this._focusBoundsListener = focusMovementListener;
                lastNode.focusPanTargetBoundsProperty.link(this._focusBoundsListener);
            }
            // Pan to the focus trail right away if it is off-screen
            this.keepTrailInView(focus.trail, lastNode.limitPanDirection);
        }
    }
    /**
   * Handle zoom commands from a keyboard.
   */ handleZoomCommands(domEvent) {
        // handle zoom - Safari doesn't receive the keyup event when the meta key is pressed so we cannot use
        // the keyStateTracker to determine if zoom keys are down
        const zoomInCommandDown = KeyboardZoomUtils.isZoomCommand(domEvent, true);
        const zoomOutCommandDown = KeyboardZoomUtils.isZoomCommand(domEvent, false);
        if (zoomInCommandDown || zoomOutCommandDown) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiPanZoomListener keyboard zoom in');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            // don't allow native browser zoom
            domEvent.preventDefault();
            const nextScale = this.getNextDiscreteScale(zoomInCommandDown);
            const keyPress = new KeyPress(globalKeyStateTracker, nextScale, this._targetScale);
            this.repositionFromKeys(keyPress);
        } else if (KeyboardZoomUtils.isZoomResetCommand(domEvent)) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener keyboard reset');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            // this is a native command, but we are taking over
            domEvent.preventDefault();
            this.resetTransform();
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }
    }
    /**
   * This is just for macOS Safari. Responds to trackpad input. Prevents default browser behavior and sets values
   * required for repositioning as user operates the track pad.
   */ handleGestureStartEvent(domEvent) {
        this.gestureStartAction.execute(domEvent);
    }
    /**
   * This is just for macOS Safari. Responds to trackpad input. Prevends default browser behavior and
   * sets destination scale as user pinches on the trackpad.
   */ handleGestureChangeEvent(domEvent) {
        this.gestureChangeAction.execute(domEvent);
    }
    /**
   * Handle the down MiddlePress during animation. If we have a middle press we need to update position target.
   */ handleMiddlePress(dt) {
        const middlePress = this.middlePress;
        assert && assert(middlePress, 'MiddlePress must be defined to handle');
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to handle middle press, be sure to call initializePositions');
        if (dt > 0) {
            const currentPoint = middlePress.pointer.point;
            const globalDelta = currentPoint.minus(middlePress.initialPoint);
            // magnitude alone is too fast, reduce by a bit
            const reducedMagnitude = globalDelta.magnitude / 100;
            if (reducedMagnitude > 0) {
                // set the delta vector in global coordinates, limited by a maximum view coords/second velocity, corrected
                // for any representative target scale
                globalDelta.setMagnitude(Math.min(reducedMagnitude / dt, MAX_SCROLL_VELOCITY * this._targetScale));
                this.setDestinationPosition(sourcePosition.plus(globalDelta));
            }
        }
    }
    /**
   * Translate and scale to a target point. The result of this function should make it appear that we are scaling
   * in or out of a particular point on the target node. This actually modifies the matrix of the target node. To
   * accomplish zooming into a particular point, we compute a matrix that would transform the target node from
   * the target point, then apply scale, then translate the target back to the target point.
   *
   * @param globalPoint - point to zoom in on, in the global coordinate frame
   * @param scaleDelta
   */ translateScaleToTarget(globalPoint, scaleDelta) {
        const pointInLocalFrame = this._targetNode.globalToLocalPoint(globalPoint);
        const pointInParentFrame = this._targetNode.globalToParentPoint(globalPoint);
        const fromLocalPoint = Matrix3.translation(-pointInLocalFrame.x, -pointInLocalFrame.y);
        const toTargetPoint = Matrix3.translation(pointInParentFrame.x, pointInParentFrame.y);
        const nextScale = this.limitScale(this.getCurrentScale() + scaleDelta);
        // we first translate from target point, then apply scale, then translate back to target point ()
        // so that it appears as though we are zooming into that point
        const scaleMatrix = toTargetPoint.timesMatrix(Matrix3.scaling(nextScale)).timesMatrix(fromLocalPoint);
        this.matrixProperty.set(scaleMatrix);
        // make sure that we are still within PanZoomListener constraints
        this.correctReposition();
    }
    /**
   * Sets the translation and scale to a target point. Like translateScaleToTarget, but instead of taking a scaleDelta
   * it takes the final scale to be used for the target Nodes matrix.
   *
   * @param globalPoint - point to translate to in the global coordinate frame
   * @param scale - final scale for the transformation matrix
   */ setTranslationScaleToTarget(globalPoint, scale) {
        const pointInLocalFrame = this._targetNode.globalToLocalPoint(globalPoint);
        const pointInParentFrame = this._targetNode.globalToParentPoint(globalPoint);
        const fromLocalPoint = Matrix3.translation(-pointInLocalFrame.x, -pointInLocalFrame.y);
        const toTargetPoint = Matrix3.translation(pointInParentFrame.x, pointInParentFrame.y);
        const nextScale = this.limitScale(scale);
        // we first translate from target point, then apply scale, then translate back to target point ()
        // so that it appears as though we are zooming into that point
        const scaleMatrix = toTargetPoint.timesMatrix(Matrix3.scaling(nextScale)).timesMatrix(fromLocalPoint);
        this.matrixProperty.set(scaleMatrix);
        // make sure that we are still within PanZoomListener constraints
        this.correctReposition();
    }
    /**
   * Translate the target node in a direction specified by deltaVector.
   */ translateDelta(deltaVector) {
        const targetPoint = this._targetNode.globalToParentPoint(this._panBounds.center);
        const sourcePoint = targetPoint.plus(deltaVector);
        this.translateToTarget(sourcePoint, targetPoint);
    }
    /**
   * Translate the targetNode from a local point to a target point. Both points should be in the global coordinate
   * frame.
   * @param initialPoint - in global coordinate frame, source position
   * @param targetPoint - in global coordinate frame, target position
   */ translateToTarget(initialPoint, targetPoint) {
        const singleInitialPoint = this._targetNode.globalToParentPoint(initialPoint);
        const singleTargetPoint = this._targetNode.globalToParentPoint(targetPoint);
        const delta = singleTargetPoint.minus(singleInitialPoint);
        this.matrixProperty.set(Matrix3.translationFromVector(delta).timesMatrix(this._targetNode.getMatrix()));
        this.correctReposition();
    }
    /**
   * Repositions the target node in response to keyboard input.
   */ repositionFromKeys(keyPress) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition from key press');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to handle key press, be sure to call initializePositions');
        const newScale = keyPress.scale;
        const currentScale = this.getCurrentScale();
        if (newScale !== currentScale) {
            // key press changed scale
            this.setDestinationScale(newScale);
            this.scaleGestureTargetPosition = keyPress.computeScaleTargetFromKeyPress();
        } else if (!keyPress.translationVector.equals(Vector2.ZERO)) {
            // key press initiated some translation
            this.setDestinationPosition(sourcePosition.plus(keyPress.translationVector));
        }
        this.correctReposition();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Repositions the target node in response to wheel input. Wheel input can come from a mouse, trackpad, or
   * other. Aspects of the event are slightly different for each input source and this function tries to normalize
   * these differences.
   */ repositionFromWheel(wheel, event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition from wheel');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const domEvent = event.domEvent;
        assert && assert(domEvent instanceof WheelEvent, 'wheel event must be a WheelEvent'); // eslint-disable-line phet/no-simple-type-checking-assertions
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to handle wheel, be sure to call initializePositions');
        // prevent any native browser zoom and don't allow browser to go 'back' or 'forward' a page with certain gestures
        domEvent.preventDefault();
        if (wheel.isCtrlKeyDown) {
            const nextScale = this.limitScale(this.getCurrentScale() + wheel.scaleDelta);
            this.scaleGestureTargetPosition = wheel.targetPoint;
            this.setDestinationScale(nextScale);
        } else {
            // wheel does not indicate zoom, must be translation
            this.setDestinationPosition(sourcePosition.plus(wheel.translationVector));
        }
        this.correctReposition();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Upon any kind of reposition, update the source position and scale for the next update in animateToTargets.
   *
   * Note: This assumes that any kind of repositioning of the target node will eventually call correctReposition.
   */ correctReposition() {
        super.correctReposition();
        if (this._panBounds.isFinite()) {
            // the pan bounds in the local coordinate frame of the target Node (generally, bounds of the targetNode
            // that are visible in the global panBounds)
            this._transformedPanBounds = this._panBounds.transformed(this._targetNode.matrix.inverted());
            this.sourcePosition = this._transformedPanBounds.center;
            this.sourceScale = this.getCurrentScale();
        }
    }
    /**
   * When a new press begins, stop any in progress animation.
   */ addPress(press) {
        super.addPress(press);
        this.stopInProgressAnimation();
    }
    /**
   * When presses are removed, reset animation destinations.
   */ removePress(press) {
        super.removePress(press);
        // restore the cursor if we have a middle press as we are in a state where moving the mouse will pan
        if (this.middlePress) {
            press.pointer.cursor = MOVE_CURSOR;
        }
        if (this._presses.length === 0) {
            this.stopInProgressAnimation();
        }
    }
    /**
   * Interrupt the listener. Cancels any active input and clears references upon interaction end.
   */ interrupt() {
        this.cancelPanningDuringDrag();
        this.cancelMiddlePress();
        super.interrupt();
    }
    /**
   * "Cancel" the listener, when input stops abnormally. Part of the scenery Input API.
   */ cancel() {
        this.interrupt();
    }
    /**
   * Returns true if the Intent of the Pointer indicates that it will be used for dragging of some kind.
   */ hasDragIntent(pointer) {
        return pointer.hasIntent(Intent.KEYBOARD_DRAG) || pointer.hasIntent(Intent.DRAG);
    }
    /**
   * Pan to a provided Node, attempting to place the node in the center of the transformedPanBounds. It may not end
   * up exactly in the center since we have to make sure panBounds are completely filled with targetNode content.
   *
   * You can conditionally not pan to the center by setting panToCenter to false. Sometimes shifting the screen so
   * that the Node is at the center is too jarring.
   *
   * @param node - Node to pan to
   * @param panToCenter - If true, listener will pan so that the Node is at the center of the screen. Otherwise, just
   *                      until the Node is fully displayed in the viewport.
   * @param panDirection - if provided, we will only pan in the direction specified, null for all directions
   */ panToNode(node, panToCenter, panDirection) {
        assert && assert(this._panBounds.isFinite(), 'panBounds should be defined when panning.');
        this.keepBoundsInView(node.globalBounds, panToCenter, panDirection);
    }
    /**
   * Set the destination position to pan such that the provided globalBounds are totally visible within the panBounds.
   * This will never pan outside panBounds, if the provided globalBounds extend beyond them.
   *
   * If we are not using panToCenter and the globalBounds is larger than the screen size this function does nothing.
   * It doesn't make sense to try to keep the provided bounds entirely in view if they are larger than the availalable
   * view space.
   *
   * @param globalBounds - in global coordinate frame
   * @param panToCenter - if true, we will pan to the center of the provided bounds, otherwise we will pan
   *                                until all edges are on screen
   * @param panDirection - if provided, we will only pan in the direction specified, null for all directions
   */ keepBoundsInView(globalBounds, panToCenter, panDirection) {
        assert && assert(this._panBounds.isFinite(), 'panBounds should be defined when panning.');
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to handle keepBoundsInView, be sure to call initializePositions');
        const boundsInTargetFrame = this._targetNode.globalToLocalBounds(globalBounds);
        const translationDelta = new Vector2(0, 0);
        let distanceToLeftEdge = 0;
        let distanceToRightEdge = 0;
        let distanceToTopEdge = 0;
        let distanceToBottomEdge = 0;
        if (panToCenter) {
            // If panning to center, the amount to pan is the distance between the center of the screen to the center of the
            // provided bounds. In this case
            distanceToLeftEdge = this._transformedPanBounds.centerX - boundsInTargetFrame.centerX;
            distanceToRightEdge = this._transformedPanBounds.centerX - boundsInTargetFrame.centerX;
            distanceToTopEdge = this._transformedPanBounds.centerY - boundsInTargetFrame.centerY;
            distanceToBottomEdge = this._transformedPanBounds.centerY - boundsInTargetFrame.centerY;
        } else if ((panDirection === 'vertical' || boundsInTargetFrame.width < this._transformedPanBounds.width) && (panDirection === 'horizontal' || boundsInTargetFrame.height < this._transformedPanBounds.height)) {
            // If the provided bounds are wider than the available pan bounds we shouldn't try to shift it, it will awkwardly
            // try to slide the screen to one of the sides of the bounds. This operation only makes sense if the screen can
            // totally contain the object being dragged.
            // A bit of padding helps to pan the screen further so that you can keep dragging even if the cursor/object
            // is right at the edge of the screen. It also looks a little nicer by keeping the object well in view.
            // Increase this value to add more motion when dragging near the edge of the screen. But too much of this
            // will make the screen feel like it is "sliding" around too much.
            // See https://github.com/phetsims/number-line-operations/issues/108
            const paddingDelta = 150; // global coordinate frame, scaled below
            // scale the padding delta by our matrix so that it is appropriate for our zoom level - smaller when zoomed way in
            const matrixScale = this.getCurrentScale();
            const paddingDeltaScaled = paddingDelta / matrixScale;
            distanceToLeftEdge = this._transformedPanBounds.left - boundsInTargetFrame.left + paddingDeltaScaled;
            distanceToRightEdge = this._transformedPanBounds.right - boundsInTargetFrame.right - paddingDeltaScaled;
            distanceToTopEdge = this._transformedPanBounds.top - boundsInTargetFrame.top + paddingDeltaScaled;
            distanceToBottomEdge = this._transformedPanBounds.bottom - boundsInTargetFrame.bottom - paddingDeltaScaled;
        }
        if (panDirection !== 'vertical') {
            // if not panning vertically, we are free to move in the horizontal dimension
            if (distanceToRightEdge < 0) {
                translationDelta.x = -distanceToRightEdge;
            }
            if (distanceToLeftEdge > 0) {
                translationDelta.x = -distanceToLeftEdge;
            }
        }
        if (panDirection !== 'horizontal') {
            // if not panning horizontally, we are free to move in the vertical direction
            if (distanceToBottomEdge < 0) {
                translationDelta.y = -distanceToBottomEdge;
            }
            if (distanceToTopEdge > 0) {
                translationDelta.y = -distanceToTopEdge;
            }
        }
        this.setDestinationPosition(sourcePosition.plus(translationDelta));
    }
    /**
   * Keep a trail in view by panning to it if it has bounds that are outside of the global panBounds.
   */ keepTrailInView(trail, panDirection) {
        if (this._panBounds.isFinite() && trail.lastNode().bounds.isFinite()) {
            const globalBounds = trail.localToGlobalBounds(trail.lastNode().localBounds);
            if (!this._panBounds.containsBounds(globalBounds)) {
                this.keepBoundsInView(globalBounds, true, panDirection);
            }
        }
    }
    /**
   * @param dt - in seconds
   */ animateToTargets(dt) {
        assert && assert(this.boundsFinite, 'initializePositions must be called at least once before animating');
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to animate, be sure to all initializePositions');
        assert && assert(sourcePosition.isFinite(), 'How can the source position not be a finite Vector2?');
        const destinationPosition = this.destinationPosition;
        assert && assert(destinationPosition, 'destinationPosition must be defined to animate, be sure to all initializePositions');
        assert && assert(destinationPosition.isFinite(), 'How can the destination position not be a finite Vector2?');
        // only animate to targets if within this precision so that we don't animate forever, since animation speed
        // is dependent on the difference betwen source and destination positions
        const positionDirty = !destinationPosition.equalsEpsilon(sourcePosition, 0.1);
        const scaleDirty = !Utils.equalsEpsilon(this.sourceScale, this.destinationScale, 0.001);
        this.animatingProperty.value = positionDirty || scaleDirty;
        // Only a MiddlePress can support animation while down
        if (this._presses.length === 0 || this.middlePress !== null) {
            if (positionDirty) {
                // animate to the position, effectively panning over time without any scaling
                const translationDifference = destinationPosition.minus(sourcePosition);
                let translationDirection = translationDifference;
                if (translationDifference.magnitude !== 0) {
                    translationDirection = translationDifference.normalized();
                }
                const translationSpeed = this.getTranslationSpeed(translationDifference.magnitude);
                scratchVelocityVector.setXY(translationSpeed, translationSpeed);
                // finally determine the final panning translation and apply
                const componentMagnitude = scratchVelocityVector.multiplyScalar(dt);
                const translationDelta = translationDirection.componentTimes(componentMagnitude);
                // in case of large dt, don't overshoot the destination
                if (translationDelta.magnitude > translationDifference.magnitude) {
                    translationDelta.set(translationDifference);
                }
                assert && assert(translationDelta.isFinite(), 'Trying to translate with a non-finite Vector2');
                this.translateDelta(translationDelta);
            }
            if (scaleDirty) {
                assert && assert(this.scaleGestureTargetPosition, 'there must be a scale target point');
                const scaleDifference = this.destinationScale - this.sourceScale;
                let scaleDelta = scaleDifference * dt * 6;
                // in case of large dt make sure that we don't overshoot our destination
                if (Math.abs(scaleDelta) > Math.abs(scaleDifference)) {
                    scaleDelta = scaleDifference;
                }
                this.translateScaleToTarget(this.scaleGestureTargetPosition, scaleDelta);
                // after applying the scale, the source position has changed, update destination to match
                this.setDestinationPosition(sourcePosition);
            } else if (this.destinationScale !== this.sourceScale) {
                assert && assert(this.scaleGestureTargetPosition, 'there must be a scale target point');
                // not far enough to animate but close enough that we can set destination equal to source to avoid further
                // animation steps
                this.setTranslationScaleToTarget(this.scaleGestureTargetPosition, this.destinationScale);
                this.setDestinationPosition(sourcePosition);
            }
        }
    }
    /**
   * Stop any in-progress transformations of the target node by setting destinations to sources immediately.
   */ stopInProgressAnimation() {
        if (this.boundsFinite && this.sourcePosition) {
            this.setDestinationScale(this.sourceScale);
            this.setDestinationPosition(this.sourcePosition);
        }
    }
    /**
   * Sets the source and destination positions. Necessary because target or pan bounds may not be defined
   * upon construction. This can set those up when they are defined.
   */ initializePositions() {
        this.boundsFinite = this._transformedPanBounds.isFinite();
        if (this.boundsFinite) {
            this.sourcePosition = this._transformedPanBounds.center;
            this.setDestinationPosition(this.sourcePosition);
        } else {
            this.sourcePosition = null;
            this.destinationPosition = null;
        }
    }
    /**
   * Set the containing panBounds and then make sure that the targetBounds fully fill the new panBounds. Updates
   * bounds that trigger panning during a drag operation.
   */ setPanBounds(bounds) {
        super.setPanBounds(bounds);
        this.initializePositions();
        // drag bounds eroded a bit so that repositioning during drag occurs as the pointer gets close to the edge.
        this._dragBounds = bounds.erodedXY(bounds.width * 0.1, bounds.height * 0.1);
        assert && assert(this._dragBounds.hasNonzeroArea(), 'drag bounds must have some width and height');
    }
    /**
   * Upon setting target bounds, re-set source and destination positions.
   */ setTargetBounds(targetBounds) {
        super.setTargetBounds(targetBounds);
        this.initializePositions();
    }
    /**
   * Set the destination position. In animation, we will try move the targetNode until sourcePosition matches
   * this point. Destination is in the local coordinate frame of the target node.
   */ setDestinationPosition(destination) {
        assert && assert(this.boundsFinite, 'bounds must be finite before setting destination positions');
        assert && assert(destination.isFinite(), 'provided destination position is not defined');
        const sourcePosition = this.sourcePosition;
        assert && assert(sourcePosition, 'sourcePosition must be defined to set destination position, be sure to call initializePositions');
        // limit destination position to be within the available bounds pan bounds
        scratchBounds.setMinMax(sourcePosition.x - this._transformedPanBounds.left - this._panBounds.left, sourcePosition.y - this._transformedPanBounds.top - this._panBounds.top, sourcePosition.x + this._panBounds.right - this._transformedPanBounds.right, sourcePosition.y + this._panBounds.bottom - this._transformedPanBounds.bottom);
        this.destinationPosition = scratchBounds.closestPointTo(destination);
    }
    /**
   * Set the destination scale for the target node. In animation, target node will be repositioned until source
   * scale matches destination scale.
   */ setDestinationScale(scale) {
        this.destinationScale = this.limitScale(scale);
    }
    /**
   * Calculate the translation speed to animate from our sourcePosition to our targetPosition. Speed goes to zero
   * as the translationDistance gets smaller for smooth animation as we reach our destination position. This returns
   * a speed in the coordinate frame of the parent of this listener's target Node.
   */ getTranslationSpeed(translationDistance) {
        assert && assert(translationDistance >= 0, 'distance for getTranslationSpeed should be a non-negative number');
        // The larger the scale, that faster we want to translate because the distances between source and destination
        // are smaller when zoomed in. Otherwise, speeds will be slower while zoomed in.
        const scaleDistance = translationDistance * this.getCurrentScale();
        // A maximum translation factor applied to distance to determine a reasonable speed, determined by
        // inspection but could be modified. This impacts how long the "tail" of translation is as we animate.
        // While we animate to the destination position we move quickly far away from the destination and slow down
        // as we get closer to the target. Reduce this value to exaggerate that effect and move more slowly as we
        // get closer to the destination position.
        const maxScaleFactor = 5;
        // speed falls away exponentially as we get closer to our destination so that we appear to "slide" to our
        // destination which looks nice, but also prevents us from animating for too long
        const translationSpeed = scaleDistance * (1 / (Math.pow(scaleDistance, 2) - Math.pow(maxScaleFactor, 2)) + maxScaleFactor);
        // translationSpeed could be negative or go to infinity due to the behavior of the exponential calculation above.
        // Make sure that the speed is constrained and greater than zero.
        const limitedTranslationSpeed = Math.min(Math.abs(translationSpeed), MAX_TRANSLATION_SPEED * this.getCurrentScale());
        return limitedTranslationSpeed;
    }
    /**
   * Reset all transformations on the target node, and reset destination targets to source values to prevent any
   * in progress animation.
   */ resetTransform() {
        super.resetTransform();
        this.stopInProgressAnimation();
    }
    /**
   * Get the next discrete scale from the current scale. Will be one of the scales along the discreteScales list
   * and limited by the min and max scales assigned to this MultiPanZoomListener.
   *
   * @param zoomIn - direction of zoom change, positive if zooming in
   * @returns number
   */ getNextDiscreteScale(zoomIn) {
        const currentScale = this.getCurrentScale();
        let nearestIndex = null;
        let distanceToCurrentScale = Number.POSITIVE_INFINITY;
        for(let i = 0; i < this.discreteScales.length; i++){
            const distance = Math.abs(this.discreteScales[i] - currentScale);
            if (distance < distanceToCurrentScale) {
                distanceToCurrentScale = distance;
                nearestIndex = i;
            }
        }
        nearestIndex = nearestIndex;
        assert && assert(nearestIndex !== null, 'nearestIndex should have been found');
        let nextIndex = zoomIn ? nearestIndex + 1 : nearestIndex - 1;
        nextIndex = Utils.clamp(nextIndex, 0, this.discreteScales.length - 1);
        return this.discreteScales[nextIndex];
    }
    dispose() {
        this.disposeAnimatedPanZoomListener();
    }
    /**
   * targetNode - Node to be transformed by this listener
   * {Object} [providedOptions]
   */ constructor(targetNode, providedOptions){
        const options = optionize()({
            tandem: Tandem.REQUIRED
        }, providedOptions);
        super(targetNode, options), // scale represented at the start of the gesture, as reported by the GestureEvent, used to calculate how much
        // to scale the target Node
        this.trackpadGestureStartScale = 1, // True when the listener is actively panning or zooming to the destination position and scale. Updated in the
        // animation frame.
        this.animatingProperty = new BooleanProperty(false), // A TransformTracker that will watch for changes to the targetNode's global transformation matrix, used to keep
        // the targetNode in view during animation.
        this._transformTracker = null, // A listener on the focusPanTargetBoundsProperty of the focused Node that will keep those bounds displayed in
        // the viewport.
        this._focusBoundsListener = null;
        this.sourcePosition = null;
        this.destinationPosition = null;
        this.sourceScale = this.getCurrentScale();
        this.destinationScale = this.getCurrentScale();
        this.scaleGestureTargetPosition = null;
        this.discreteScales = calculateDiscreteScales(this._minScale, this._maxScale);
        this.middlePress = null;
        this._dragBounds = null;
        this._transformedPanBounds = this._panBounds.transformed(this._targetNode.matrix.inverted());
        this._draggingInDragBounds = false;
        this._attachedPointers = [];
        this.boundsFinite = false;
        // listeners that will be bound to `this` if we are on a (non-touchscreen) safari platform, referenced for
        // removal on dispose
        let boundGestureStartListener = null;
        let boundGestureChangeListener = null;
        this.gestureStartAction = new PhetioAction((domEvent)=>{
            assert && assert(domEvent.pageX, 'pageX required on DOMEvent');
            assert && assert(domEvent.pageY, 'pageY required on DOMEvent');
            assert && assert(domEvent.scale, 'scale required on DOMEvent');
            // prevent Safari from doing anything native with this gesture
            domEvent.preventDefault();
            this.trackpadGestureStartScale = domEvent.scale;
            this.scaleGestureTargetPosition = new Vector2(domEvent.pageX, domEvent.pageY);
        }, {
            phetioPlayback: true,
            tandem: options.tandem.createTandem('gestureStartAction'),
            parameters: [
                {
                    name: 'event',
                    phetioType: EventIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Action that executes whenever a gesture starts on a trackpad in macOS Safari.'
        });
        this.gestureChangeAction = new PhetioAction((domEvent)=>{
            assert && assert(domEvent.scale, 'scale required on DOMEvent');
            // prevent Safari from changing position or scale natively
            domEvent.preventDefault();
            const newScale = this.sourceScale + domEvent.scale - this.trackpadGestureStartScale;
            this.setDestinationScale(newScale);
        }, {
            phetioPlayback: true,
            tandem: options.tandem.createTandem('gestureChangeAction'),
            parameters: [
                {
                    name: 'event',
                    phetioType: EventIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Action that executes whenever a gesture changes on a trackpad in macOS Safari.'
        });
        // respond to macOS trackpad input, but don't respond to this input on an iOS touch screen
        if (platform.safari && !platform.mobileSafari) {
            boundGestureStartListener = this.handleGestureStartEvent.bind(this);
            boundGestureChangeListener = this.handleGestureChangeEvent.bind(this);
            // the scale of the targetNode at the start of the gesture, used to calculate how scale to apply from
            // 'gesturechange' event
            this.trackpadGestureStartScale = this.getCurrentScale();
            // WARNING: These events are non-standard, but this is the only way to detect and prevent native trackpad
            // input on macOS Safari. For Apple documentation about these events, see
            // https://developer.apple.com/documentation/webkitjs/gestureevent
            // @ts-expect-error - Event type for this Safari specific event isn't available yet
            window.addEventListener('gesturestart', boundGestureStartListener);
            // @ts-expect-error - Event type for this Safari specific event isn't available yet
            window.addEventListener('gesturechange', boundGestureChangeListener);
        }
        // Handle key input from events outside of the PDOM - in this case it is impossible for the PDOMPointer
        // to be attached so we have free reign over the keyboard
        globalKeyStateTracker.keydownEmitter.addListener(this.windowKeydown.bind(this));
        // Make sure that the focused Node stays in view and automatically pan to keep it displayed when it is animated
        // with a transformation change
        const displayFocusListener = this.handleFocusChange.bind(this);
        FocusManager.pdomFocusProperty.link(displayFocusListener);
        // set source and destination positions and scales after setting from state
        // to initialize values for animation with AnimatedPanZoomListener
        this.sourceFramePanBoundsProperty.lazyLink(()=>{
            if (isSettingPhetioStateProperty.value) {
                this.initializePositions();
                this.sourceScale = this.getCurrentScale();
                this.setDestinationScale(this.sourceScale);
            }
        }, {
            // guarantee that the matrixProperty value is up to date when this listener is called
            phetioDependencies: [
                this.matrixProperty
            ]
        });
        this.disposeAnimatedPanZoomListener = ()=>{
            // @ts-expect-error - Event type for this Safari specific event isn't available yet
            boundGestureStartListener && window.removeEventListener('gesturestart', boundGestureStartListener);
            // @ts-expect-error - Event type for this Safari specific event isn't available yet
            boundGestureChangeListener && window.removeEventListener('gestureChange', boundGestureChangeListener);
            this.animatingProperty.dispose();
            if (this._transformTracker) {
                this._transformTracker.dispose();
            }
            FocusManager.pdomFocusProperty.unlink(displayFocusListener);
        };
    }
};
/**
 * A type that contains the information needed to respond to keyboard input.
 */ let KeyPress = class KeyPress {
    /**
   * Compute the target position for scaling from a key press. The target node will appear to get larger and zoom
   * into this point. If focus is within the Display, we zoom into the focused node. If not and focusable content
   * exists in the display, we zoom into the first focusable component. Otherwise, we zoom into the top left corner
   * of the screen.
   *
   * This function could be expensive, so we only call it if we know that the key press is a "scale" gesture.
   *
   * @returns a scratch Vector2 instance with the target position
   */ computeScaleTargetFromKeyPress() {
        // default cause, scale target will be origin of the screen
        scratchScaleTargetVector.setXY(0, 0);
        // zoom into the focused Node if it has defined bounds, it may not if it is for controlling the
        // virtual cursor and has an invisible focus highlight
        const focus = FocusManager.pdomFocusProperty.value;
        if (focus) {
            const focusTrail = focus.trail;
            const focusedNode = focusTrail.lastNode();
            if (focusedNode.bounds.isFinite()) {
                scratchScaleTargetVector.set(focusTrail.parentToGlobalPoint(focusedNode.center));
            }
        } else {
            // no focusable element in the Display so try to zoom into the first focusable element
            const firstFocusable = PDOMUtils.getNextFocusable();
            if (firstFocusable !== document.body) {
                // if not the body, focused node should be contained by the body - error loudly if the browser reports
                // that this is not the case
                assert && assert(document.body.contains(firstFocusable), 'focusable should be attached to the body');
                // assumes that focusable DOM elements are correctly positioned, which should be the case - an alternative
                // could be to use Displat.getTrailFromPDOMIndicesString(), but that function requires information that is not
                // available here.
                const centerX = firstFocusable.offsetLeft + firstFocusable.offsetWidth / 2;
                const centerY = firstFocusable.offsetTop + firstFocusable.offsetHeight / 2;
                scratchScaleTargetVector.setXY(centerX, centerY);
            }
        }
        assert && assert(scratchScaleTargetVector.isFinite(), 'target position not defined');
        return scratchScaleTargetVector;
    }
    /**
   * @param keyStateTracker
   * @param scale
   * @param targetScale - scale describing the targetNode, see PanZoomListener._targetScale
   * @param [providedOptions]
   */ constructor(keyStateTracker, scale, targetScale, providedOptions){
        const options = optionize()({
            translationMagnitude: 80
        }, providedOptions);
        // determine resulting translation
        let xDirection = 0;
        xDirection += keyStateTracker.isKeyDown(KeyboardUtils.KEY_RIGHT_ARROW) ? 1 : 0;
        xDirection -= keyStateTracker.isKeyDown(KeyboardUtils.KEY_LEFT_ARROW) ? 1 : 0;
        let yDirection = 0;
        yDirection += keyStateTracker.isKeyDown(KeyboardUtils.KEY_DOWN_ARROW) ? 1 : 0;
        yDirection -= keyStateTracker.isKeyDown(KeyboardUtils.KEY_UP_ARROW) ? 1 : 0;
        // don't set magnitude if zero vector (as vector will become ill-defined)
        scratchTranslationVector.setXY(xDirection, yDirection);
        if (!scratchTranslationVector.equals(Vector2.ZERO)) {
            const translationMagnitude = options.translationMagnitude * targetScale;
            scratchTranslationVector.setMagnitude(translationMagnitude);
        }
        this.translationVector = scratchTranslationVector;
        this.scale = scale;
    }
};
/**
 * A type that contains the information needed to respond to a wheel input.
 */ let Wheel = class Wheel {
    /**
   * @param event
   * @param targetScale - scale describing the targetNode, see PanZoomListener._targetScale
   */ constructor(event, targetScale){
        const domEvent = event.domEvent;
        assert && assert(domEvent instanceof WheelEvent, 'SceneryEvent should have a DOMEvent from the wheel input'); // eslint-disable-line phet/no-simple-type-checking-assertions
        this.isCtrlKeyDown = domEvent.ctrlKey;
        this.scaleDelta = domEvent.deltaY > 0 ? -0.5 : 0.5;
        this.targetPoint = event.pointer.point;
        // the DOM Event specifies deltas that look appropriate and works well in different cases like
        // mouse wheel and trackpad input, both which trigger wheel events but at different rates with different
        // delta values - but they are generally too large, reducing a bit feels more natural and gives more control
        let translationX = domEvent.deltaX * 0.5;
        let translationY = domEvent.deltaY * 0.5;
        // FireFox defaults to scrolling in units of "lines" rather than pixels, resulting in slow movement - speed up
        // translation in this case
        if (domEvent.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
            translationX = translationX * 25;
            translationY = translationY * 25;
        }
        // Rotate the translation vector by 90 degrees if shift is held. This is a common behavior in many applications,
        // particularly in Chrome.
        if (domEvent.shiftKey) {
            [translationX, translationY] = [
                translationY,
                -translationX
            ];
        }
        this.translationVector = scratchTranslationVector.setXY(translationX * targetScale, translationY * targetScale);
    }
};
/**
 * A press from a middle mouse button. Will initiate panning and destination position will be updated for as long
 * as the Pointer point is dragged away from the initial point.
 */ let MiddlePress = class MiddlePress {
    constructor(pointer, trail){
        assert && assert(pointer.type === 'mouse', 'incorrect pointer type');
        this.pointer = pointer;
        this.trail = trail;
        this.initialPoint = pointer.point.copy();
    }
};
/**
 * Helper function, calculates discrete scales between min and max scale limits. Creates increasing step sizes
 * so that you zoom in from high zoom reaches the max faster with fewer key presses. This is standard behavior for
 * browser zoom.
 */ const calculateDiscreteScales = (minScale, maxScale)=>{
    assert && assert(minScale >= 1, 'min scales less than one are currently not supported');
    // will take this many key presses to reach maximum scale from minimum scale
    const steps = 8;
    // break the range from min to max scale into steps, then exponentiate
    const discreteScales = [];
    for(let i = 0; i < steps; i++){
        discreteScales[i] = (maxScale - minScale) / steps * (i * i);
    }
    // normalize steps back into range of the min and max scale for this listener
    const discreteScalesMax = discreteScales[steps - 1];
    for(let i = 0; i < discreteScales.length; i++){
        discreteScales[i] = minScale + discreteScales[i] * (maxScale - minScale) / discreteScalesMax;
    }
    return discreteScales;
};
scenery.register('AnimatedPanZoomListener', AnimatedPanZoomListener);
export default AnimatedPanZoomListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0FuaW1hdGVkUGFuWm9vbUxpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgUGFuWm9vbUxpc3RlbmVyIHRoYXQgc3VwcG9ydHMgYWRkaXRpb25hbCBmb3JtcyBvZiBpbnB1dCBmb3IgcGFuIGFuZCB6b29tLCBpbmNsdWRpbmcgdHJhY2twYWQgZ2VzdHVyZXMsIG1vdXNlXG4gKiB3aGVlbCwgYW5kIGtleWJvYXJkIGlucHV0LiBUaGVzZSBnZXN0dXJlcyB3aWxsIGFuaW1hdGUgdGhlIHRhcmdldCBub2RlIHRvIGl0cyBkZXN0aW5hdGlvbiB0cmFuc2xhdGlvbiBhbmQgc2NhbGUgc28gaXRcbiAqIHVzZXMgYSBzdGVwIGZ1bmN0aW9uIHRoYXQgbXVzdCBiZSBjYWxsZWQgZXZlcnkgYW5pbWF0aW9uIGZyYW1lLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBQcm9wZXJ0eUxpbmtMaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LmpzJztcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHsgRXZlbnRJTywgRm9jdXMsIEZvY3VzTWFuYWdlciwgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBJbnRlbnQsIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBLZXlib2FyZFV0aWxzLCBLZXlib2FyZFpvb21VdGlscywgS2V5U3RhdGVUcmFja2VyLCBMaW1pdFBhbkRpcmVjdGlvbiwgTW91c2UsIE11bHRpTGlzdGVuZXJQcmVzcywgTm9kZSwgUGFuWm9vbUxpc3RlbmVyLCBQYW5ab29tTGlzdGVuZXJPcHRpb25zLCBQRE9NUG9pbnRlciwgUERPTVV0aWxzLCBQb2ludGVyLCBQcmVzc0xpc3RlbmVyLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRyYWlsLCBUcmFuc2Zvcm1UcmFja2VyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTU9WRV9DVVJTT1IgPSAnYWxsLXNjcm9sbCc7XG5jb25zdCBNQVhfU0NST0xMX1ZFTE9DSVRZID0gMTUwOyAvLyBtYXggZ2xvYmFsIHZpZXcgY29vcmRzIHBlciBzZWNvbmQgd2hpbGUgc2Nyb2xsaW5nIHdpdGggbWlkZGxlIG1vdXNlIGJ1dHRvbiBkcmFnXG5cbi8vIFRoZSBtYXggc3BlZWQgb2YgdHJhbnNsYXRpb24gd2hlbiBhbmltYXRpbmcgZnJvbSBzb3VyY2UgcG9zaXRpb24gdG8gZGVzdGluYXRpb24gcG9zaXRpb24gaW4gdGhlIGNvb3JkaW5hdGUgZnJhbWVcbi8vIG9mIHRoZSBwYXJlbnQgb2YgdGhlIHRhcmdldE5vZGUgb2YgdGhpcyBsaXN0ZW5lci4gSW5jcmVhc2UgdGhlIHZhbHVlIG9mIHRoaXMgdG8gYW5pbWF0ZSBmYXN0ZXIgdG8gdGhlIGRlc3RpbmF0aW9uXG4vLyBwb3NpdGlvbiB3aGVuIHBhbm5pbmcgdG8gdGFyZ2V0cy5cbmNvbnN0IE1BWF9UUkFOU0xBVElPTl9TUEVFRCA9IDEwMDA7XG5cbi8vIHNjcmF0Y2ggdmFyaWFibGVzIHRvIHJlZHVjZSBnYXJiYWdlXG5jb25zdCBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuY29uc3Qgc2NyYXRjaFNjYWxlVGFyZ2V0VmVjdG9yID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbmNvbnN0IHNjcmF0Y2hWZWxvY2l0eVZlY3RvciA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5jb25zdCBzY3JhdGNoQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDAsIDAgKTtcblxuLy8gVHlwZSBmb3IgYSBHZXN0dXJlRXZlbnQgLSBleHBlcmltZW50YWwgYW5kIFNhZmFyaSBzcGVjaWZpYyBFdmVudCwgbm90IGF2YWlsYWJsZSBpbiBkZWZhdWx0IHR5cGluZyBzbyBpdCBpcyBtYW51YWxseVxuLy8gZGVmaW5lZCBoZXJlLiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0dlc3R1cmVFdmVudFxudHlwZSBHZXN0dXJlRXZlbnQgPSB7XG4gIHNjYWxlOiBudW1iZXI7XG4gIHBhZ2VYOiBudW1iZXI7XG4gIHBhZ2VZOiBudW1iZXI7XG59ICYgRXZlbnQ7XG5cbmNsYXNzIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyIGV4dGVuZHMgUGFuWm9vbUxpc3RlbmVyIHtcblxuICAvLyBUaGlzIHBvaW50IGlzIHRoZSBjZW50ZXIgb2YgdGhlIHRyYW5zZm9ybWVkUGFuQm91bmRzIChzZWUgUGFuWm9vbUxpc3RlbmVyKSBpblxuICAvLyB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIHRhcmdldE5vZGUuIFRoaXMgaXMgdGhlIGN1cnJlbnQgY2VudGVyIG9mIHRoZSB0cmFuc2Zvcm1lZFBhbkJvdW5kcywgYW5kXG4gIC8vIGR1cmluZyBhbmltYXRpb24gd2Ugd2lsbCBtb3ZlIHRoaXMgcG9pbnQgY2xvc2VyIHRvIHRoZSBkZXN0aW5hdGlvblBvc2l0aW9uLlxuICBwcml2YXRlIHNvdXJjZVBvc2l0aW9uOiBWZWN0b3IyIHwgbnVsbDtcblxuICAvLyBUaGUgZGVzdGluYXRpb24gZm9yIHRyYW5zbGF0aW9uLCB3ZSB3aWxsIHJlcG9zaXRpb24gdGhlIHRhcmdldE5vZGUgdW50aWwgdGhlXG4gIC8vIHNvdXJjZVBvc2l0aW9uIG1hdGNoZXMgdGhpcyBwb2ludC4gVGhpcyBpcyBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgb2YgdGhlIHRhcmdldE5vZGUuXG4gIHByaXZhdGUgZGVzdGluYXRpb25Qb3NpdGlvbjogVmVjdG9yMiB8IG51bGw7XG5cbiAgLy8gVGhlIGN1cnJlbnQgc2NhbGUgb2YgdGhlIHRhcmdldE5vZGUuIER1cmluZyBhbmltYXRpb24gd2Ugd2lsbCBzY2FsZSB0aGUgdGFyZ2V0Tm9kZSB1bnRpbCB0aGlzIG1hdGNoZXMgdGhlIGRlc3RpbmF0aW9uU2NhbGUuXG4gIHByaXZhdGUgc291cmNlU2NhbGU6IG51bWJlcjtcblxuICAvLyBUaGUgZGVzaXJlZCBzY2FsZSBmb3IgdGhlIHRhcmdldE5vZGUsIHRoZSBub2RlIGlzIHJlcG9zaXRpb25lZCB1bnRpbCBzb3VyY2VTY2FsZSBtYXRjaGVzIGRlc3RpbmF0aW9uU2NhbGUuXG4gIHByaXZhdGUgZGVzdGluYXRpb25TY2FsZTogbnVtYmVyO1xuXG4gIC8vIFRoZSBwb2ludCBhdCB3aGljaCBhIHNjYWxlIGdlc3R1cmUgd2FzIGluaXRpYXRlZC4gVGhpcyBpcyB1c3VhbGx5IHRoZSBtb3VzZSBwb2ludCBpblxuICAvLyB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgd2hlbiBhIHdoZWVsIG9yIHRyYWNrcGFkIHpvb20gZ2VzdHVyZSBpcyBpbml0aWF0ZWQuIFRoZSB0YXJnZXROb2RlIHdpbGwgYXBwZWFyIHRvXG4gIC8vIGJlIHpvb21lZCBpbnRvIHRoaXMgcG9pbnQuIFRoaXMgaXMgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxuICBwcml2YXRlIHNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uOiBWZWN0b3IyIHwgbnVsbDtcblxuICAvLyBTY2FsZSBjaGFuZ2VzIGluIGRpc2NyZXRlIGFtb3VudHMgZm9yIGNlcnRhaW4gdHlwZXMgb2YgaW5wdXQsIGFuZCBpbiB0aGVzZSBjYXNlcyB0aGlzIGFycmF5IGRlZmluZXMgdGhlIGRpc2NyZXRlXG4gIC8vIHNjYWxlcyBwb3NzaWJsZVxuICBwcml2YXRlIGRpc2NyZXRlU2NhbGVzOiBudW1iZXJbXTtcblxuICAvLyBJZiBkZWZpbmVkLCBpbmRpY2F0ZXMgdGhhdCBhIG1pZGRsZSBtb3VzZSBidXR0b24gaXMgZG93biB0byBwYW4gaW4gdGhlIGRpcmVjdGlvbiBvZiBjdXJzb3IgbW92ZW1lbnQuXG4gIHByaXZhdGUgbWlkZGxlUHJlc3M6IE1pZGRsZVByZXNzIHwgbnVsbDtcblxuICAvLyBUaGVzZSBib3VuZHMgZGVmaW5lIGJlaGF2aW9yIG9mIHBhbm5pbmcgZHVyaW5nIGludGVyYWN0aW9uIHdpdGggYW5vdGhlciBsaXN0ZW5lciB0aGF0IGRlY2xhcmVzIGl0cyBpbnRlbnQgZm9yXG4gIC8vIGRyYWdnaW5nLiBJZiB0aGUgcG9pbnRlciBpcyBvdXQgb2YgdGhlc2UgYm91bmRzIGFuZCBpdHMgaW50ZW50IGlzIGZvciBkcmFnZ2luZywgd2Ugd2lsbCB0cnkgdG8gcmVwb3NpdGlvbiBzb1xuICAvLyB0aGF0IHRoZSBkcmFnZ2VkIG9iamVjdCByZW1haW5zIHZpc2libGVcbiAgcHJpdmF0ZSBfZHJhZ0JvdW5kczogQm91bmRzMiB8IG51bGw7XG5cbiAgLy8gVGhlIHBhbkJvdW5kcyBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0Tm9kZS4gR2VuZXJhbGx5LCB0aGVzZSBhcmUgdGhlIGJvdW5kcyBvZiB0aGUgdGFyZ2V0Tm9kZVxuICAvLyB0aGF0IHlvdSBjYW4gc2VlIHdpdGhpbiB0aGUgcGFuQm91bmRzLlxuICBwcml2YXRlIF90cmFuc2Zvcm1lZFBhbkJvdW5kczogQm91bmRzMjtcblxuICAvLyB3aGV0aGVyIG9yIG5vdCB0aGUgUG9pbnRlciB3ZW50IGRvd24gd2l0aGluIHRoZSBkcmFnIGJvdW5kcyAtIGlmIGl0IHdlbnQgZG93biBvdXQgb2YgZHJhZyBib3VuZHNcbiAgLy8gdGhlbiB1c2VyIGxpa2VseSB0cnlpbmcgdG8gcHVsbCBhbiBvYmplY3QgYmFjayBpbnRvIHZpZXcgc28gd2UgcHJldmVudCBwYW5uaW5nIGR1cmluZyBkcmFnXG4gIHByaXZhdGUgX2RyYWdnaW5nSW5EcmFnQm91bmRzOiBib29sZWFuO1xuXG4gIC8vIEEgY29sbGVjdGlvbiBvZiBsaXN0ZW5lcnMgUG9pbnRlcnMgd2l0aCBhdHRhY2hlZCBsaXN0ZW5lcnMgdGhhdCBhcmUgZG93bi4gVXNlZFxuICAvLyBwcmltYXJpbHkgdG8gZGV0ZXJtaW5lIGlmIHRoZSBhdHRhY2hlZCBsaXN0ZW5lciBkZWZpbmVzIGFueSB1bmlxdWUgYmVoYXZpb3IgdGhhdCBzaG91bGQgaGFwcGVuIGR1cmluZyBhIGRyYWcsXG4gIC8vIHN1Y2ggYXMgcGFubmluZyB0byBrZWVwIGN1c3RvbSBCb3VuZHMgaW4gdmlldy4gU2VlIFRJbnB1dExpc3RlbmVyLmNyZWF0ZVBhblRhcmdldEJvdW5kcy5cbiAgcHJpdmF0ZSBfYXR0YWNoZWRQb2ludGVyczogUG9pbnRlcltdO1xuXG4gIC8vIENlcnRhaW4gY2FsY3VsYXRpb25zIGNhbiBvbmx5IGJlIGRvbmUgb25jZSBhdmFpbGFibGUgcGFuIGJvdW5kcyBhcmUgZmluaXRlLlxuICBwcml2YXRlIGJvdW5kc0Zpbml0ZTogYm9vbGVhbjtcblxuICAvLyBBY3Rpb24gd3JhcHBpbmcgd29yayB0byBiZSBkb25lIHdoZW4gYSBnZXN0dXJlIHN0YXJ0cyBvbiBhIG1hY09TIHRyYWNrcGFkIChzcGVjaWZpYyB0byB0aGF0IHBsYXRmb3JtISkuIFdyYXBwZWRcbiAgLy8gaW4gYW4gYWN0aW9uIHNvIHRoYXQgc3RhdGUgaXMgY2FwdHVyZWQgZm9yIFBoRVQtaU9cbiAgcHJpdmF0ZSBnZXN0dXJlU3RhcnRBY3Rpb246IFBoZXRpb0FjdGlvbjxHZXN0dXJlRXZlbnRbXT47XG4gIHByaXZhdGUgZ2VzdHVyZUNoYW5nZUFjdGlvbjogUGhldGlvQWN0aW9uPEdlc3R1cmVFdmVudFtdPjtcblxuICAvLyBzY2FsZSByZXByZXNlbnRlZCBhdCB0aGUgc3RhcnQgb2YgdGhlIGdlc3R1cmUsIGFzIHJlcG9ydGVkIGJ5IHRoZSBHZXN0dXJlRXZlbnQsIHVzZWQgdG8gY2FsY3VsYXRlIGhvdyBtdWNoXG4gIC8vIHRvIHNjYWxlIHRoZSB0YXJnZXQgTm9kZVxuICBwcml2YXRlIHRyYWNrcGFkR2VzdHVyZVN0YXJ0U2NhbGUgPSAxO1xuXG4gIC8vIFRydWUgd2hlbiB0aGUgbGlzdGVuZXIgaXMgYWN0aXZlbHkgcGFubmluZyBvciB6b29taW5nIHRvIHRoZSBkZXN0aW5hdGlvbiBwb3NpdGlvbiBhbmQgc2NhbGUuIFVwZGF0ZWQgaW4gdGhlXG4gIC8vIGFuaW1hdGlvbiBmcmFtZS5cbiAgcHVibGljIHJlYWRvbmx5IGFuaW1hdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcblxuICAvLyBBIFRyYW5zZm9ybVRyYWNrZXIgdGhhdCB3aWxsIHdhdGNoIGZvciBjaGFuZ2VzIHRvIHRoZSB0YXJnZXROb2RlJ3MgZ2xvYmFsIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCwgdXNlZCB0byBrZWVwXG4gIC8vIHRoZSB0YXJnZXROb2RlIGluIHZpZXcgZHVyaW5nIGFuaW1hdGlvbi5cbiAgcHJpdmF0ZSBfdHJhbnNmb3JtVHJhY2tlcjogVHJhbnNmb3JtVHJhY2tlciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIEEgbGlzdGVuZXIgb24gdGhlIGZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkgb2YgdGhlIGZvY3VzZWQgTm9kZSB0aGF0IHdpbGwga2VlcCB0aG9zZSBib3VuZHMgZGlzcGxheWVkIGluXG4gIC8vIHRoZSB2aWV3cG9ydC5cbiAgcHJpdmF0ZSBfZm9jdXNCb3VuZHNMaXN0ZW5lcjogUHJvcGVydHlMaW5rTGlzdGVuZXI8Qm91bmRzMj4gfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VBbmltYXRlZFBhblpvb21MaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogdGFyZ2V0Tm9kZSAtIE5vZGUgdG8gYmUgdHJhbnNmb3JtZWQgYnkgdGhpcyBsaXN0ZW5lclxuICAgKiB7T2JqZWN0fSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YXJnZXROb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBQYW5ab29tTGlzdGVuZXJPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGFuWm9vbUxpc3RlbmVyT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgUGFuWm9vbUxpc3RlbmVyT3B0aW9ucz4oKSgge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgICBzdXBlciggdGFyZ2V0Tm9kZSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5zb3VyY2VQb3NpdGlvbiA9IG51bGw7XG4gICAgdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uID0gbnVsbDtcbiAgICB0aGlzLnNvdXJjZVNjYWxlID0gdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcbiAgICB0aGlzLmRlc3RpbmF0aW9uU2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xuICAgIHRoaXMuc2NhbGVHZXN0dXJlVGFyZ2V0UG9zaXRpb24gPSBudWxsO1xuICAgIHRoaXMuZGlzY3JldGVTY2FsZXMgPSBjYWxjdWxhdGVEaXNjcmV0ZVNjYWxlcyggdGhpcy5fbWluU2NhbGUsIHRoaXMuX21heFNjYWxlICk7XG4gICAgdGhpcy5taWRkbGVQcmVzcyA9IG51bGw7XG4gICAgdGhpcy5fZHJhZ0JvdW5kcyA9IG51bGw7XG4gICAgdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMgPSB0aGlzLl9wYW5Cb3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuX3RhcmdldE5vZGUubWF0cml4LmludmVydGVkKCkgKTtcbiAgICB0aGlzLl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyA9IGZhbHNlO1xuICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMgPSBbXTtcbiAgICB0aGlzLmJvdW5kc0Zpbml0ZSA9IGZhbHNlO1xuXG4gICAgLy8gbGlzdGVuZXJzIHRoYXQgd2lsbCBiZSBib3VuZCB0byBgdGhpc2AgaWYgd2UgYXJlIG9uIGEgKG5vbi10b3VjaHNjcmVlbikgc2FmYXJpIHBsYXRmb3JtLCByZWZlcmVuY2VkIGZvclxuICAgIC8vIHJlbW92YWwgb24gZGlzcG9zZVxuICAgIGxldCBib3VuZEdlc3R1cmVTdGFydExpc3RlbmVyOiBudWxsIHwgKCAoIGV2ZW50OiBHZXN0dXJlRXZlbnQgKSA9PiB2b2lkICkgPSBudWxsO1xuICAgIGxldCBib3VuZEdlc3R1cmVDaGFuZ2VMaXN0ZW5lcjogbnVsbCB8ICggKCBldmVudDogR2VzdHVyZUV2ZW50ICkgPT4gdm9pZCApID0gbnVsbDtcblxuICAgIHRoaXMuZ2VzdHVyZVN0YXJ0QWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZG9tRXZlbnQgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQucGFnZVgsICdwYWdlWCByZXF1aXJlZCBvbiBET01FdmVudCcgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50LnBhZ2VZLCAncGFnZVkgcmVxdWlyZWQgb24gRE9NRXZlbnQnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21FdmVudC5zY2FsZSwgJ3NjYWxlIHJlcXVpcmVkIG9uIERPTUV2ZW50JyApO1xuXG4gICAgICAvLyBwcmV2ZW50IFNhZmFyaSBmcm9tIGRvaW5nIGFueXRoaW5nIG5hdGl2ZSB3aXRoIHRoaXMgZ2VzdHVyZVxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy50cmFja3BhZEdlc3R1cmVTdGFydFNjYWxlID0gZG9tRXZlbnQuc2NhbGU7XG4gICAgICB0aGlzLnNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIGRvbUV2ZW50LnBhZ2VYLCBkb21FdmVudC5wYWdlWSApO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdnZXN0dXJlU3RhcnRBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ2V2ZW50JywgcGhldGlvVHlwZTogRXZlbnRJTyB9IF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEgZ2VzdHVyZSBzdGFydHMgb24gYSB0cmFja3BhZCBpbiBtYWNPUyBTYWZhcmkuJ1xuICAgIH0gKTtcblxuXG4gICAgdGhpcy5nZXN0dXJlQ2hhbmdlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZG9tRXZlbnQgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQuc2NhbGUsICdzY2FsZSByZXF1aXJlZCBvbiBET01FdmVudCcgKTtcblxuICAgICAgLy8gcHJldmVudCBTYWZhcmkgZnJvbSBjaGFuZ2luZyBwb3NpdGlvbiBvciBzY2FsZSBuYXRpdmVseVxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgY29uc3QgbmV3U2NhbGUgPSB0aGlzLnNvdXJjZVNjYWxlICsgZG9tRXZlbnQuc2NhbGUgLSB0aGlzLnRyYWNrcGFkR2VzdHVyZVN0YXJ0U2NhbGU7XG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIG5ld1NjYWxlICk7XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dlc3R1cmVDaGFuZ2VBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ2V2ZW50JywgcGhldGlvVHlwZTogRXZlbnRJTyB9IF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEgZ2VzdHVyZSBjaGFuZ2VzIG9uIGEgdHJhY2twYWQgaW4gbWFjT1MgU2FmYXJpLidcbiAgICB9ICk7XG5cbiAgICAvLyByZXNwb25kIHRvIG1hY09TIHRyYWNrcGFkIGlucHV0LCBidXQgZG9uJ3QgcmVzcG9uZCB0byB0aGlzIGlucHV0IG9uIGFuIGlPUyB0b3VjaCBzY3JlZW5cbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSAmJiAhcGxhdGZvcm0ubW9iaWxlU2FmYXJpICkge1xuICAgICAgYm91bmRHZXN0dXJlU3RhcnRMaXN0ZW5lciA9IHRoaXMuaGFuZGxlR2VzdHVyZVN0YXJ0RXZlbnQuYmluZCggdGhpcyApO1xuICAgICAgYm91bmRHZXN0dXJlQ2hhbmdlTGlzdGVuZXIgPSB0aGlzLmhhbmRsZUdlc3R1cmVDaGFuZ2VFdmVudC5iaW5kKCB0aGlzICk7XG5cbiAgICAgIC8vIHRoZSBzY2FsZSBvZiB0aGUgdGFyZ2V0Tm9kZSBhdCB0aGUgc3RhcnQgb2YgdGhlIGdlc3R1cmUsIHVzZWQgdG8gY2FsY3VsYXRlIGhvdyBzY2FsZSB0byBhcHBseSBmcm9tXG4gICAgICAvLyAnZ2VzdHVyZWNoYW5nZScgZXZlbnRcbiAgICAgIHRoaXMudHJhY2twYWRHZXN0dXJlU3RhcnRTY2FsZSA9IHRoaXMuZ2V0Q3VycmVudFNjYWxlKCk7XG5cbiAgICAgIC8vIFdBUk5JTkc6IFRoZXNlIGV2ZW50cyBhcmUgbm9uLXN0YW5kYXJkLCBidXQgdGhpcyBpcyB0aGUgb25seSB3YXkgdG8gZGV0ZWN0IGFuZCBwcmV2ZW50IG5hdGl2ZSB0cmFja3BhZFxuICAgICAgLy8gaW5wdXQgb24gbWFjT1MgU2FmYXJpLiBGb3IgQXBwbGUgZG9jdW1lbnRhdGlvbiBhYm91dCB0aGVzZSBldmVudHMsIHNlZVxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2RvY3VtZW50YXRpb24vd2Via2l0anMvZ2VzdHVyZWV2ZW50XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBFdmVudCB0eXBlIGZvciB0aGlzIFNhZmFyaSBzcGVjaWZpYyBldmVudCBpc24ndCBhdmFpbGFibGUgeWV0XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2dlc3R1cmVzdGFydCcsIGJvdW5kR2VzdHVyZVN0YXJ0TGlzdGVuZXIgKTtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEV2ZW50IHR5cGUgZm9yIHRoaXMgU2FmYXJpIHNwZWNpZmljIGV2ZW50IGlzbid0IGF2YWlsYWJsZSB5ZXRcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZ2VzdHVyZWNoYW5nZScsIGJvdW5kR2VzdHVyZUNoYW5nZUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGtleSBpbnB1dCBmcm9tIGV2ZW50cyBvdXRzaWRlIG9mIHRoZSBQRE9NIC0gaW4gdGhpcyBjYXNlIGl0IGlzIGltcG9zc2libGUgZm9yIHRoZSBQRE9NUG9pbnRlclxuICAgIC8vIHRvIGJlIGF0dGFjaGVkIHNvIHdlIGhhdmUgZnJlZSByZWlnbiBvdmVyIHRoZSBrZXlib2FyZFxuICAgIGdsb2JhbEtleVN0YXRlVHJhY2tlci5rZXlkb3duRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy53aW5kb3dLZXlkb3duLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIGZvY3VzZWQgTm9kZSBzdGF5cyBpbiB2aWV3IGFuZCBhdXRvbWF0aWNhbGx5IHBhbiB0byBrZWVwIGl0IGRpc3BsYXllZCB3aGVuIGl0IGlzIGFuaW1hdGVkXG4gICAgLy8gd2l0aCBhIHRyYW5zZm9ybWF0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGRpc3BsYXlGb2N1c0xpc3RlbmVyID0gdGhpcy5oYW5kbGVGb2N1c0NoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LmxpbmsoIGRpc3BsYXlGb2N1c0xpc3RlbmVyICk7XG5cbiAgICAvLyBzZXQgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBwb3NpdGlvbnMgYW5kIHNjYWxlcyBhZnRlciBzZXR0aW5nIGZyb20gc3RhdGVcbiAgICAvLyB0byBpbml0aWFsaXplIHZhbHVlcyBmb3IgYW5pbWF0aW9uIHdpdGggQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXJcbiAgICB0aGlzLnNvdXJjZUZyYW1lUGFuQm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcblxuICAgICAgaWYgKCBpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICB0aGlzLmluaXRpYWxpemVQb3NpdGlvbnMoKTtcbiAgICAgICAgdGhpcy5zb3VyY2VTY2FsZSA9IHRoaXMuZ2V0Q3VycmVudFNjYWxlKCk7XG4gICAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25TY2FsZSggdGhpcy5zb3VyY2VTY2FsZSApO1xuICAgICAgfVxuICAgIH0sIHtcblxuICAgICAgLy8gZ3VhcmFudGVlIHRoYXQgdGhlIG1hdHJpeFByb3BlcnR5IHZhbHVlIGlzIHVwIHRvIGRhdGUgd2hlbiB0aGlzIGxpc3RlbmVyIGlzIGNhbGxlZFxuICAgICAgcGhldGlvRGVwZW5kZW5jaWVzOiBbIHRoaXMubWF0cml4UHJvcGVydHkgXVxuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZUFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyID0gKCkgPT4ge1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gRXZlbnQgdHlwZSBmb3IgdGhpcyBTYWZhcmkgc3BlY2lmaWMgZXZlbnQgaXNuJ3QgYXZhaWxhYmxlIHlldFxuICAgICAgYm91bmRHZXN0dXJlU3RhcnRMaXN0ZW5lciAmJiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2dlc3R1cmVzdGFydCcsIGJvdW5kR2VzdHVyZVN0YXJ0TGlzdGVuZXIgKTtcblxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIEV2ZW50IHR5cGUgZm9yIHRoaXMgU2FmYXJpIHNwZWNpZmljIGV2ZW50IGlzbid0IGF2YWlsYWJsZSB5ZXRcbiAgICAgIGJvdW5kR2VzdHVyZUNoYW5nZUxpc3RlbmVyICYmIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZ2VzdHVyZUNoYW5nZScsIGJvdW5kR2VzdHVyZUNoYW5nZUxpc3RlbmVyICk7XG5cbiAgICAgIHRoaXMuYW5pbWF0aW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgKSB7XG4gICAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LnVubGluayggZGlzcGxheUZvY3VzTGlzdGVuZXIgKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZXAgdGhlIGxpc3RlbmVyLCBzdXBwb3J0aW5nIGFueSBhbmltYXRpb24gYXMgdGhlIHRhcmdldCBub2RlIGlzIHRyYW5zZm9ybWVkIHRvIHRhcmdldCBwb3NpdGlvbiBhbmQgc2NhbGUuXG4gICAqL1xuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMubWlkZGxlUHJlc3MgKSB7XG4gICAgICB0aGlzLmhhbmRsZU1pZGRsZVByZXNzKCBkdCApO1xuICAgIH1cblxuICAgIC8vIGlmIGRyYWdnaW5nIGFuIGl0ZW0gd2l0aCBhIG1vdXNlIG9yIHRvdWNoIHBvaW50ZXIsIG1ha2Ugc3VyZSB0aGF0IGl0IHJhbWFpbnMgdmlzaWJsZSBpbiB0aGUgem9vbWVkIGluIHZpZXcsXG4gICAgLy8gcGFubmluZyB0byBpdCB3aGVuIGl0IGFwcHJvYWNoZXMgZWRnZSBvZiB0aGUgc2NyZWVuXG4gICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIC8vIG9ubHkgbmVlZCB0byBkbyB0aGlzIHdvcmsgaWYgd2UgYXJlIHpvb21lZCBpblxuICAgICAgaWYgKCB0aGlzLmdldEN1cnJlbnRTY2FsZSgpID4gMSApIHtcbiAgICAgICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgICAgICAvLyBGaWx0ZXIgb3V0IGFueSBwb2ludGVycyB0aGF0IG5vIGxvbmdlciBoYXZlIGFuIGF0dGFjaGVkIGxpc3RlbmVyIGR1ZSB0byBpbnRlcnJ1cHRpb24gZnJvbSB0aGluZ3MgbGlrZSBvcGVuaW5nXG4gICAgICAgICAgLy8gdGhlIGNvbnRleHQgbWVudSB3aXRoIGEgcmlnaHQgY2xpY2suXG4gICAgICAgICAgdGhpcy5fYXR0YWNoZWRQb2ludGVycyA9IHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMuZmlsdGVyKCBwb2ludGVyID0+IHBvaW50ZXIuYXR0YWNoZWRMaXN0ZW5lciApO1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMubGVuZ3RoIDw9IDEwLCAnTm90IGNsZWFyaW5nIGF0dGFjaGVkUG9pbnRlcnMsIHRoZXJlIGlzIHByb2JhYmx5IGEgbWVtb3J5IGxlYWsnICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IHJlcG9zaXRpb24gaWYgb25lIG9mIHRoZSBhdHRhY2hlZCBwb2ludGVycyBpcyBkb3duIGFuZCBkcmFnZ2luZyB3aXRoaW4gdGhlIGRyYWcgYm91bmRzIGFyZWEsIG9yIGlmIG9uZVxuICAgICAgICAvLyBvZiB0aGUgYXR0YWNoZWQgcG9pbnRlcnMgaXMgYSBQRE9NUG9pbnRlciwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgd2UgYXJlIGRyYWdnaW5nIHdpdGggYWx0ZXJuYXRpdmUgaW5wdXRcbiAgICAgICAgLy8gKGluIHdoaWNoIGNhc2UgZHJhZ2dpbmdJbkRyYWdCb3VuZHMgZG9lcyBub3QgYXBwbHkpXG4gICAgICAgIGlmICggdGhpcy5fZHJhZ2dpbmdJbkRyYWdCb3VuZHMgfHwgdGhpcy5fYXR0YWNoZWRQb2ludGVycy5zb21lKCBwb2ludGVyID0+IHBvaW50ZXIgaW5zdGFuY2VvZiBQRE9NUG9pbnRlciApICkge1xuICAgICAgICAgIHRoaXMucmVwb3NpdGlvbkR1cmluZ0RyYWcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYW5pbWF0ZVRvVGFyZ2V0cyggZHQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBNaWRkbGVQcmVzcyBmb3IgZHJhZyBwYW5uaW5nLCBpZiBkZXRlY3RlZC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkb3duKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuICAgIHN1cGVyLmRvd24oIGV2ZW50ICk7XG5cbiAgICAvLyBJZiB0aGUgUG9pbnRlciBzaWduaWZpZXMgdGhlIGlucHV0IGlzIGludGVuZGVkIGZvciBkcmFnZ2luZyBzYXZlIGEgcmVmZXJlbmNlIHRvIHRoZSB0cmFpbCBzbyB3ZSBjYW4gc3VwcG9ydFxuICAgIC8vIGtlZXBpbmcgdGhlIGV2ZW50IHRhcmdldCBpbiB2aWV3IGR1cmluZyB0aGUgZHJhZyBvcGVyYXRpb24uXG4gICAgaWYgKCB0aGlzLl9kcmFnQm91bmRzICE9PSBudWxsICYmIGV2ZW50LnBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuRFJBRyApICkge1xuXG4gICAgICAvLyBpZiB0aGlzIGlzIG91ciBvbmx5IGRvd24gcG9pbnRlciwgc2VlIGlmIHdlIHNob3VsZCBzdGFydCBwYW5uaW5nIGR1cmluZyBkcmFnXG4gICAgICBpZiAoIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMubGVuZ3RoID09PSAwICkge1xuICAgICAgICB0aGlzLl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyA9IHRoaXMuX2RyYWdCb3VuZHMuY29udGFpbnNQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xuICAgICAgfVxuXG4gICAgICAvLyBBbGwgY29uZGl0aW9ucyBhcmUgbWV0IHRvIHN0YXJ0IHdhdGNoaW5nIGZvciBib3VuZHMgdG8ga2VlcCBpbiB2aWV3IGR1cmluZyBhIGRyYWcgaW50ZXJhY3Rpb24uIEVhZ2VybHlcbiAgICAgIC8vIHNhdmUgdGhlIGF0dGFjaGVkTGlzdGVuZXIgaGVyZSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gZG8gYW55IHdvcmsgaW4gdGhlIG1vdmUgZXZlbnQuXG4gICAgICBpZiAoIGV2ZW50LnBvaW50ZXIuYXR0YWNoZWRMaXN0ZW5lciApIHtcbiAgICAgICAgaWYgKCAhdGhpcy5fYXR0YWNoZWRQb2ludGVycy5pbmNsdWRlcyggZXZlbnQucG9pbnRlciApICkge1xuICAgICAgICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMucHVzaCggZXZlbnQucG9pbnRlciApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYmVnaW4gbWlkZGxlIHByZXNzIHBhbm5pbmcgaWYgd2UgYXJlbid0IGFscmVhZHkgaW4gdGhhdCBzdGF0ZVxuICAgIGlmICggZXZlbnQucG9pbnRlci50eXBlID09PSAnbW91c2UnICYmIGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSAmJiBldmVudC5wb2ludGVyLm1pZGRsZURvd24gJiYgIXRoaXMubWlkZGxlUHJlc3MgKSB7XG4gICAgICB0aGlzLm1pZGRsZVByZXNzID0gbmV3IE1pZGRsZVByZXNzKCBldmVudC5wb2ludGVyLCBldmVudC50cmFpbCApO1xuICAgICAgZXZlbnQucG9pbnRlci5jdXJzb3IgPSBNT1ZFX0NVUlNPUjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmNhbmNlbE1pZGRsZVByZXNzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIGluIGEgc3RhdGUgd2hlcmUgd2UgYXJlIHBhbm5pbmcgZnJvbSBhIG1pZGRsZSBtb3VzZSBwcmVzcywgZXhpdCB0aGF0IHN0YXRlLlxuICAgKi9cbiAgcHJpdmF0ZSBjYW5jZWxNaWRkbGVQcmVzcygpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMubWlkZGxlUHJlc3MgKSB7XG4gICAgICB0aGlzLm1pZGRsZVByZXNzLnBvaW50ZXIuY3Vyc29yID0gbnVsbDtcbiAgICAgIHRoaXMubWlkZGxlUHJlc3MgPSBudWxsO1xuXG4gICAgICB0aGlzLnN0b3BJblByb2dyZXNzQW5pbWF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB0aGUgYXR0YWNoZWQgcG9pbnRlciBvbiBtb3ZlLiBPbmx5IG1vdmUgaWYgYSBtaWRkbGUgcHJlc3MgaXMgbm90IGN1cnJlbnRseSBkb3duLlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIG1vdmVQcmVzcyggcHJlc3M6IE11bHRpTGlzdGVuZXJQcmVzcyApOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLm1pZGRsZVByZXNzICkge1xuICAgICAgc3VwZXIubW92ZVByZXNzKCBwcmVzcyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJ0IG9mIHRoZSBTY2VuZXJ5IGxpc3RlbmVyIEFQSS4gU3VwcG9ydHMgcmVwb3NpdGlvbmluZyB3aGlsZSBkcmFnZ2luZyBhIG1vcmUgZGVzY2VuZGFudCBsZXZlbFxuICAgKiBOb2RlIHVuZGVyIHRoaXMgbGlzdGVuZXIuIElmIHRoZSBub2RlIGFuZCBwb2ludGVyIGFyZSBvdXQgb2YgdGhlIGRyYWdCb3VuZHMsIHdlIHJlcG9zaXRpb24gdG8ga2VlcCB0aGUgTm9kZVxuICAgKiB2aXNpYmxlIHdpdGhpbiBkcmFnQm91bmRzLlxuICAgKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBtb3ZlKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuXG4gICAgLy8gTm8gbmVlZCB0byBkbyB0aGlzIHdvcmsgaWYgd2UgYXJlIHpvb21lZCBvdXQuXG4gICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA+IDAgJiYgdGhpcy5nZXRDdXJyZW50U2NhbGUoKSA+IDEgKSB7XG5cbiAgICAgIC8vIE9ubHkgdHJ5IHRvIGdldCB0aGUgYXR0YWNoZWQgbGlzdGVuZXIgaWYgd2UgZGlkbid0IHN1Y2Nlc3NmdWxseSBnZXQgaXQgb24gdGhlIGRvd24gZXZlbnQuIFRoaXMgc2hvdWxkIG9ubHlcbiAgICAgIC8vIGhhcHBlbiBpZiB0aGUgZHJhZyBkaWQgbm90IHN0YXJ0IHdpdGhpbmcgZHJhZ0JvdW5kcyAodGhlIGxpc3RlbmVyIGlzIGxpa2VseSBwdWxsaW5nIHRoZSBOb2RlIGludG8gdmlldykgb3JcbiAgICAgIC8vIGlmIGEgbGlzdGVuZXIgaGFzIG5vdCBiZWVuIGF0dGFjaGVkIHlldC4gT25jZSBhIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHdlIGNhbiBzdGFydCB1c2luZyBpdCB0byBsb29rIGZvciB0aGVcbiAgICAgIC8vIGJvdW5kcyB0byBrZWVwIGluIHZpZXcuXG4gICAgICBpZiAoIHRoaXMuX2RyYWdnaW5nSW5EcmFnQm91bmRzICkge1xuICAgICAgICBpZiAoICF0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmluY2x1ZGVzKCBldmVudC5wb2ludGVyICkgKSB7XG4gICAgICAgICAgY29uc3QgaGFzRHJhZ0ludGVudCA9IHRoaXMuaGFzRHJhZ0ludGVudCggZXZlbnQucG9pbnRlciApO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRUYXJnZXRFeGlzdHMgPSBldmVudC5jdXJyZW50VGFyZ2V0ICE9PSBudWxsO1xuXG4gICAgICAgICAgaWYgKCBjdXJyZW50VGFyZ2V0RXhpc3RzICYmIGhhc0RyYWdJbnRlbnQgKSB7XG4gICAgICAgICAgICBpZiAoIGV2ZW50LnBvaW50ZXIuYXR0YWNoZWRMaXN0ZW5lciApIHtcbiAgICAgICAgICAgICAgdGhpcy5fYXR0YWNoZWRQb2ludGVycy5wdXNoKCBldmVudC5wb2ludGVyICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKCB0aGlzLl9kcmFnQm91bmRzICkge1xuICAgICAgICAgIHRoaXMuX2RyYWdnaW5nSW5EcmFnQm91bmRzID0gdGhpcy5fZHJhZ0JvdW5kcy5jb250YWluc1BvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSB0YXJnZXROb2RlIGlmIHRoZXJlIGFyZSBhdHRhY2hlZCBwb2ludGVycyBhbmQgYW4gYXR0YWNoZWRQcmVzc0xpc3RlbmVyIGR1cmluZyBhIGRyYWcgZXZlbnQsXG4gICAqIG90aGVyd2lzZSB0aGUgZnVuY3Rpb24gcmV0dXJucyBudWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRUYXJnZXROb2RlRHVyaW5nRHJhZygpOiBOb2RlIHwgbnVsbCB7XG5cbiAgICBpZiAoIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMubGVuZ3RoID4gMCApIHtcblxuICAgICAgLy8gV2UgaGF2ZSBhbiBhdHRhY2hlZExpc3RlbmVyIGZyb20gYSBTY2VuZXJ5RXZlbnQgUG9pbnRlciwgc2VlIGlmIGl0IGhhcyBpbmZvcm1hdGlvbiB3ZSBjYW4gdXNlIHRvXG4gICAgICAvLyBnZXQgdGhlIHRhcmdldCBCb3VuZHMgZm9yIHRoZSBkcmFnIGV2ZW50LlxuXG4gICAgICAvLyBPbmx5IHVzZSB0aGUgZmlyc3Qgb25lIHNvIHRoYXQgdW5pcXVlIGRyYWdnaW5nIGJlaGF2aW9ycyBkb24ndCBcImZpZ2h0XCIgaWYgbXVsdGlwbGUgcG9pbnRlcnMgYXJlIGRvd24uXG4gICAgICBjb25zdCBhY3RpdmVMaXN0ZW5lciA9IHRoaXMuX2F0dGFjaGVkUG9pbnRlcnNbIDAgXS5hdHRhY2hlZExpc3RlbmVyITtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFjdGl2ZUxpc3RlbmVyLCAnVGhlIGF0dGFjaGVkIFBvaW50ZXIgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhbiBhdHRhY2hlZCBsaXN0ZW5lci4nICk7XG5cbiAgICAgIGlmICggYWN0aXZlTGlzdGVuZXIubGlzdGVuZXIgaW5zdGFuY2VvZiBQcmVzc0xpc3RlbmVyIHx8XG4gICAgICAgICAgIGFjdGl2ZUxpc3RlbmVyLmxpc3RlbmVyIGluc3RhbmNlb2YgS2V5Ym9hcmREcmFnTGlzdGVuZXIgKSB7XG4gICAgICAgIGNvbnN0IGF0dGFjaGVkUHJlc3NMaXN0ZW5lciA9IGFjdGl2ZUxpc3RlbmVyLmxpc3RlbmVyO1xuXG4gICAgICAgIC8vIFRoZSBQcmVzc0xpc3RlbmVyIG1pZ2h0IG5vdCBiZSBwcmVzc2VkIGFueW1vcmUgYnV0IHRoZSBQb2ludGVyIGlzIHN0aWxsIGRvd24sIGluIHdoaWNoIGNhc2UgaXRcbiAgICAgICAgLy8gaGFzIGJlZW4gaW50ZXJydXB0ZWQgb3IgY2FuY2VsbGVkLlxuICAgICAgICAvLyBOT1RFOiBJdCBpcyBwb3NzaWJsZSBJIG5lZWQgdG8gY2FuY2VsUGFuRHVyaW5nRHJhZygpIGlmIGl0IGlzIG5vIGxvbmdlciBwcmVzc2VkLCBidXQgSSBkb24ndFxuICAgICAgICAvLyB3YW50IHRvIGNsZWFyIHRoZSByZWZlcmVuY2UgdG8gdGhlIGF0dGFjaGVkTGlzdGVuZXIsIGFuZCBJIHdhbnQgdG8gc3VwcG9ydCByZXN1bWluZyBkcmFnIGR1cmluZyB0b3VjaC1zbmFnLlxuICAgICAgICBpZiAoIGF0dGFjaGVkUHJlc3NMaXN0ZW5lci5pc1ByZXNzZWQgKSB7XG5cbiAgICAgICAgICAvLyB0aGlzIHdpbGwgZWl0aGVyIGJlIHRoZSBQcmVzc0xpc3RlbmVyJ3MgdGFyZ2V0Tm9kZSBvciB0aGUgZGVmYXVsdCB0YXJnZXQgb2YgdGhlIFNjZW5lcnlFdmVudCBvbiBwcmVzc1xuICAgICAgICAgIHJldHVybiBhdHRhY2hlZFByZXNzTGlzdGVuZXIuZ2V0Q3VycmVudFRhcmdldCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIEJvdW5kczIgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIHRoYXQgd2UgYXJlIGdvaW5nIHRvIHRyeSB0byBrZWVwIGluIHZpZXcgZHVyaW5nIGEgZHJhZ1xuICAgKiBvcGVyYXRpb24uXG4gICAqL1xuICBwcml2YXRlIGdldEdsb2JhbEJvdW5kc1RvVmlld0R1cmluZ0RyYWcoKTogQm91bmRzMiB8IG51bGwge1xuICAgIGxldCBnbG9iYWxCb3VuZHNUb1ZpZXcgPSBudWxsO1xuXG4gICAgaWYgKCB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIC8vIFdlIGhhdmUgYW4gYXR0YWNoZWRMaXN0ZW5lciBmcm9tIGEgU2NlbmVyeUV2ZW50IFBvaW50ZXIsIHNlZSBpZiBpdCBoYXMgaW5mb3JtYXRpb24gd2UgY2FuIHVzZSB0b1xuICAgICAgLy8gZ2V0IHRoZSB0YXJnZXQgQm91bmRzIGZvciB0aGUgZHJhZyBldmVudC5cblxuICAgICAgLy8gT25seSB1c2UgdGhlIGZpcnN0IG9uZSBzbyB0aGF0IHVuaXF1ZSBkcmFnZ2luZyBiZWhhdmlvcnMgZG9uJ3QgXCJmaWdodFwiIGlmIG11bHRpcGxlIHBvaW50ZXJzIGFyZSBkb3duLlxuICAgICAgY29uc3QgYWN0aXZlTGlzdGVuZXIgPSB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzWyAwIF0uYXR0YWNoZWRMaXN0ZW5lciE7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhY3RpdmVMaXN0ZW5lciwgJ1RoZSBhdHRhY2hlZCBQb2ludGVyIGlzIGV4cGVjdGVkIHRvIGhhdmUgYW4gYXR0YWNoZWQgbGlzdGVuZXIuJyApO1xuXG4gICAgICBpZiAoIGFjdGl2ZUxpc3RlbmVyLmNyZWF0ZVBhblRhcmdldEJvdW5kcyApIHtcblxuICAgICAgICAvLyBjbGllbnQgaGFzIGRlZmluZWQgdGhlIEJvdW5kcyB0aGV5IHdhbnQgdG8ga2VlcCBpbiB2aWV3IGZvciB0aGlzIFBvaW50ZXIgKGl0IGlzIGFzc2lnbmVkIHRvIHRoZVxuICAgICAgICAvLyBQb2ludGVyIHRvIHN1cHBvcnQgbXVsdGl0b3VjaCBjYXNlcylcbiAgICAgICAgZ2xvYmFsQm91bmRzVG9WaWV3ID0gYWN0aXZlTGlzdGVuZXIuY3JlYXRlUGFuVGFyZ2V0Qm91bmRzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggYWN0aXZlTGlzdGVuZXIubGlzdGVuZXIgaW5zdGFuY2VvZiBQcmVzc0xpc3RlbmVyIHx8XG4gICAgICAgICAgICAgICAgYWN0aXZlTGlzdGVuZXIubGlzdGVuZXIgaW5zdGFuY2VvZiBLZXlib2FyZERyYWdMaXN0ZW5lciApIHtcbiAgICAgICAgY29uc3QgYXR0YWNoZWRQcmVzc0xpc3RlbmVyID0gYWN0aXZlTGlzdGVuZXIubGlzdGVuZXI7XG5cbiAgICAgICAgLy8gVGhlIFByZXNzTGlzdGVuZXIgbWlnaHQgbm90IGJlIHByZXNzZWQgYW55bW9yZSBidXQgdGhlIFBvaW50ZXIgaXMgc3RpbGwgZG93biwgaW4gd2hpY2ggY2FzZSBpdFxuICAgICAgICAvLyBoYXMgYmVlbiBpbnRlcnJ1cHRlZCBvciBjYW5jZWxsZWQuXG4gICAgICAgIC8vIE5PVEU6IEl0IGlzIHBvc3NpYmxlIEkgbmVlZCB0byBjYW5jZWxQYW5EdXJpbmdEcmFnKCkgaWYgaXQgaXMgbm8gbG9uZ2VyIHByZXNzZWQsIGJ1dCBJIGRvbid0XG4gICAgICAgIC8vIHdhbnQgdG8gY2xlYXIgdGhlIHJlZmVyZW5jZSB0byB0aGUgYXR0YWNoZWRMaXN0ZW5lciwgYW5kIEkgd2FudCB0byBzdXBwb3J0IHJlc3VtaW5nIGRyYWcgZHVyaW5nIHRvdWNoLXNuYWcuXG4gICAgICAgIGlmICggYXR0YWNoZWRQcmVzc0xpc3RlbmVyLmlzUHJlc3NlZCApIHtcblxuICAgICAgICAgIC8vIHRoaXMgd2lsbCBlaXRoZXIgYmUgdGhlIFByZXNzTGlzdGVuZXIncyB0YXJnZXROb2RlIG9yIHRoZSBkZWZhdWx0IHRhcmdldCBvZiB0aGUgU2NlbmVyeUV2ZW50IG9uIHByZXNzXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gYXR0YWNoZWRQcmVzc0xpc3RlbmVyLmdldEN1cnJlbnRUYXJnZXQoKTtcblxuICAgICAgICAgIC8vIFRPRE86IEZvciBub3cgd2UgY2Fubm90IHN1cHBvcnQgREFHLiBXZSBtYXkgYmUgYWJsZSB0byB1c2UgUHJlc3NMaXN0ZW5lci5wcmVzc2VkVHJhaWwgaW5zdGVhZCBvZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgICAgIC8vIGdldEN1cnJlbnRUYXJnZXQsIGFuZCB0aGVuIHdlIHdvdWxkIGhhdmUgYSB1bmlxdWVseSBkZWZpbmVkIHRyYWlsLiBTZWVcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM2MSBhbmRcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM1NiNpc3N1ZWNvbW1lbnQtMTAzOTY3ODY3OFxuICAgICAgICAgIGlmICggdGFyZ2V0Lmluc3RhbmNlcy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFpbCA9IHRhcmdldC5pbnN0YW5jZXNbIDAgXS50cmFpbCE7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbCwgJ1RoZSB0YXJnZXQgc2hvdWxkIGJlIGluIG9uZSBzY2VuZSBncmFwaCBhbmQgaGF2ZSBhbiBpbnN0YW5jZSB3aXRoIGEgdHJhaWwuJyApO1xuICAgICAgICAgICAgZ2xvYmFsQm91bmRzVG9WaWV3ID0gdHJhaWwucGFyZW50VG9HbG9iYWxCb3VuZHMoIHRhcmdldC52aXNpYmxlQm91bmRzICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdsb2JhbEJvdW5kc1RvVmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBEdXJpbmcgYSBkcmFnIG9mIGFub3RoZXIgTm9kZSB0aGF0IGlzIGEgZGVzY2VuZGFudCBvZiB0aGlzIGxpc3RlbmVyJ3MgdGFyZ2V0Tm9kZSwgcmVwb3NpdGlvbiBpZiB0aGVcbiAgICogbm9kZSBpcyBvdXQgb2YgZHJhZ0JvdW5kcyBzbyB0aGF0IHRoZSBOb2RlIGlzIGFsd2F5cyB3aXRoaW4gcGFuQm91bmRzLlxuICAgKi9cbiAgcHJpdmF0ZSByZXBvc2l0aW9uRHVyaW5nRHJhZygpOiB2b2lkIHtcbiAgICBjb25zdCBnbG9iYWxCb3VuZHMgPSB0aGlzLmdldEdsb2JhbEJvdW5kc1RvVmlld0R1cmluZ0RyYWcoKTtcbiAgICBjb25zdCB0YXJnZXROb2RlID0gdGhpcy5nZXRUYXJnZXROb2RlRHVyaW5nRHJhZygpO1xuICAgIGdsb2JhbEJvdW5kcyAmJiB0aGlzLmtlZXBCb3VuZHNJblZpZXcoIGdsb2JhbEJvdW5kcywgdGhpcy5fYXR0YWNoZWRQb2ludGVycy5zb21lKCBwb2ludGVyID0+IHBvaW50ZXIgaW5zdGFuY2VvZiBQRE9NUG9pbnRlciApLCB0YXJnZXROb2RlPy5saW1pdFBhbkRpcmVjdGlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGFubmluZyBkdXJpbmcgZHJhZyBieSBjbGVhcmluZyB2YXJpYWJsZXMgdGhhdCBhcmUgc2V0IHRvIGluZGljYXRlIGFuZCBwcm92aWRlIGluZm9ybWF0aW9uIGZvciB0aGlzIHdvcmsuXG4gICAqIEBwYXJhbSBbZXZlbnRdIC0gaWYgbm90IHByb3ZpZGVkIGFsbCBhcmUgcGFubmluZyBpcyBjYW5jZWxsZWQgYW5kIHdlIGFzc3VtZSBpbnRlcnJ1cHRpb25cbiAgICovXG4gIHByaXZhdGUgY2FuY2VsUGFubmluZ0R1cmluZ0RyYWcoIGV2ZW50PzogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuXG4gICAgaWYgKCBldmVudCApIHtcblxuICAgICAgLy8gcmVtb3ZlIHRoZSBhdHRhY2hlZFBvaW50ZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBldmVudFxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9hdHRhY2hlZFBvaW50ZXJzLmluZGV4T2YoIGV2ZW50LnBvaW50ZXIgKTtcbiAgICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgICAgdGhpcy5fYXR0YWNoZWRQb2ludGVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBUaGVyZSBpcyBubyBTY2VuZXJ5RXZlbnQsIHdlIG11c3QgYmUgaW50ZXJydXB0aW5nIC0gY2xlYXIgYWxsIGF0dGFjaGVkUG9pbnRlcnNcbiAgICAgIHRoaXMuX2F0dGFjaGVkUG9pbnRlcnMgPSBbXTtcbiAgICB9XG5cbiAgICAvLyBDbGVhciBmbGFnIGluZGljYXRpbmcgd2UgYXJlIFwiZHJhZ2dpbmcgaW4gYm91bmRzXCIgbmV4dCBtb3ZlXG4gICAgdGhpcy5fZHJhZ2dpbmdJbkRyYWdCb3VuZHMgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2VuZXJ5IGxpc3RlbmVyIEFQSS4gQ2FuY2VsIGFueSBkcmFnIGFuZCBwYW4gYmVoYXZpb3IgZm9yIHRoZSBQb2ludGVyIG9uIHRoZSBldmVudC5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgdXAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5jYW5jZWxQYW5uaW5nRHVyaW5nRHJhZyggZXZlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnB1dCBsaXN0ZW5lciBmb3IgdGhlICd3aGVlbCcgZXZlbnQsIHBhcnQgb2YgdGhlIFNjZW5lcnkgSW5wdXQgQVBJLlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB3aGVlbCggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHdoZWVsJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gY2Fubm90IHJlcG9zaXRpb24gaWYgYSBkcmFnZ2luZyB3aXRoIG1pZGRsZSBtb3VzZSBidXR0b24gLSBidXQgd2hlZWwgem9vbSBzaG91bGQgbm90IGNhbmNlbCBhIG1pZGRsZSBwcmVzc1xuICAgIC8vIChiZWhhdmlvciBjb3BpZWQgZnJvbSBvdGhlciBicm93c2VycylcbiAgICBpZiAoICF0aGlzLm1pZGRsZVByZXNzICkge1xuICAgICAgY29uc3Qgd2hlZWwgPSBuZXcgV2hlZWwoIGV2ZW50LCB0aGlzLl90YXJnZXRTY2FsZSApO1xuICAgICAgdGhpcy5yZXBvc2l0aW9uRnJvbVdoZWVsKCB3aGVlbCwgZXZlbnQgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEtleWRvd24gbGlzdGVuZXIgZm9yIGV2ZW50cyBvdXRzaWRlIG9mIHRoZSBQRE9NLiBBdHRhY2hlZCBhcyBhIGxpc3RlbmVyIHRvIHRoZSBib2R5IGFuZCBkcml2ZW4gYnlcbiAgICogRXZlbnRzIHJhdGhlciB0aGFuIFNjZW5lcnlFdmVudHMuIFdoZW4gd2UgaGFuZGxlIEV2ZW50cyBmcm9tIHdpdGhpbiB0aGUgUERPTSB3ZSBuZWVkIHRoZSBQb2ludGVyIHRvXG4gICAqIGRldGVybWluZSBpZiBhdHRhY2hlZC4gQnV0IGZyb20gb3V0c2lkZSBvZiB0aGUgUERPTSB3ZSBrbm93IHRoYXQgdGhlcmUgaXMgbm8gZm9jdXMgaW4gdGhlIGRvY3VtZW50IGFuZCB0aGVyZm9yZVxuICAgKiB0aGUgUERPTVBvaW50ZXIgaXMgbm90IGF0dGFjaGVkLlxuICAgKi9cbiAgcHJpdmF0ZSB3aW5kb3dLZXlkb3duKCBkb21FdmVudDogRXZlbnQgKTogdm9pZCB7XG5cbiAgICAvLyBvbiBhbnkga2V5Ym9hcmQgcmVwb3NpdGlvbiBpbnRlcnJ1cHQgdGhlIG1pZGRsZSBwcmVzcyBwYW5uaW5nXG4gICAgdGhpcy5jYW5jZWxNaWRkbGVQcmVzcygpO1xuXG4gICAgY29uc3Qgc2ltR2xvYmFsID0gXy5nZXQoIHdpbmRvdywgJ3BoZXQuam9pc3Quc2ltJywgbnVsbCApOyAvLyByZXR1cm5zIG51bGwgaWYgZ2xvYmFsIGlzbid0IGZvdW5kXG5cbiAgICBpZiAoICFzaW1HbG9iYWwgfHwgIXNpbUdsb2JhbC5kaXNwbGF5Ll9hY2Nlc3NpYmxlIHx8XG4gICAgICAgICAhc2ltR2xvYmFsLmRpc3BsYXkucGRvbVJvb3RFbGVtZW50LmNvbnRhaW5zKCBkb21FdmVudC50YXJnZXQgKSApIHtcbiAgICAgIHRoaXMuaGFuZGxlWm9vbUNvbW1hbmRzKCBkb21FdmVudCApO1xuXG4gICAgICAvLyBoYW5kbGUgdHJhbnNsYXRpb24gd2l0aG91dCB3b3JyeSBvZiB0aGUgcG9pbnRlciBiZWluZyBhdHRhY2hlZCBiZWNhdXNlIHRoZXJlIGlzIG5vIHBvaW50ZXIgYXQgdGhpcyBsZXZlbFxuICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzQXJyb3dLZXkoIGRvbUV2ZW50ICkgKSB7XG4gICAgICAgIGNvbnN0IGtleVByZXNzID0gbmV3IEtleVByZXNzKCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCksIHRoaXMuX3RhcmdldFNjYWxlICk7XG4gICAgICAgIHRoaXMucmVwb3NpdGlvbkZyb21LZXlzKCBrZXlQcmVzcyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIFNjZW5lcnkgbGlzdGVuZXIgQVBJLCBoYW5kbGUgYSBrZXlkb3duIGV2ZW50LiBUaGlzIFNjZW5lcnlFdmVudCB3aWxsIGhhdmUgYmVlbiBkaXNwYXRjaGVkIGZyb21cbiAgICogSW5wdXQuZGlzcGF0Y2hFdmVudCBhbmQgc28gdGhlIEV2ZW50IHRhcmdldCBtdXN0IGJlIHdpdGhpbiB0aGUgUERPTS4gSW4gdGhpcyBjYXNlLCB3ZSBtYXlcbiAgICogbmVlZCB0byBwcmV2ZW50IHRyYW5zbGF0aW9uIGlmIHRoZSBQRE9NUG9pbnRlciBpcyBhdHRhY2hlZC5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMga2V5ZG93biggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcbiAgICBjb25zdCBkb21FdmVudCA9IGV2ZW50LmRvbUV2ZW50ITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21FdmVudCBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQsICdrZXlkb3duIGV2ZW50IG11c3QgYmUgYSBLZXlib2FyZEV2ZW50JyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuXG4gICAgLy8gb24gYW55IGtleWJvYXJkIHJlcG9zaXRpb24gaW50ZXJydXB0IHRoZSBtaWRkbGUgcHJlc3MgcGFubmluZ1xuICAgIHRoaXMuY2FuY2VsTWlkZGxlUHJlc3MoKTtcblxuICAgIC8vIGhhbmRsZSB6b29tXG4gICAgdGhpcy5oYW5kbGVab29tQ29tbWFuZHMoIGRvbUV2ZW50ICk7XG5cbiAgICBjb25zdCBrZXlib2FyZERyYWdJbnRlbnQgPSBldmVudC5wb2ludGVyLmhhc0ludGVudCggSW50ZW50LktFWUJPQVJEX0RSQUcgKTtcblxuICAgIC8vIGhhbmRsZSB0cmFuc2xhdGlvblxuICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc0Fycm93S2V5KCBkb21FdmVudCApICkge1xuXG4gICAgICBpZiAoICFrZXlib2FyZERyYWdJbnRlbnQgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgaGFuZGxlIGFycm93IGtleSBkb3duJyApO1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgICBjb25zdCBrZXlQcmVzcyA9IG5ldyBLZXlQcmVzcyggZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCB0aGlzLmdldEN1cnJlbnRTY2FsZSgpLCB0aGlzLl90YXJnZXRTY2FsZSApO1xuICAgICAgICB0aGlzLnJlcG9zaXRpb25Gcm9tS2V5cygga2V5UHJlc3MgKTtcblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYSBjaGFuZ2Ugb2YgZm9jdXMgYnkgaW1tZWRpYXRlbHkgcGFubmluZyBzbyB0aGF0IHRoZSBmb2N1c2VkIE5vZGUgaXMgaW4gdmlldy4gQWxzbyBzZXRzIHVwIHRoZVxuICAgKiBUcmFuc2Zvcm1UcmFja2VyIHdoaWNoIHdpbGwgYXV0b21hdGljYWxseSBrZWVwIHRoZSB0YXJnZXQgaW4gdGhlIHZpZXdwb3J0IGFzIGl0IGlzIGFuaW1hdGVzLCBhbmQgYSBsaXN0ZW5lclxuICAgKiBvbiB0aGUgZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSAoaWYgcHJvdmlkZWQpIHRvIGhhbmRsZSBOb2RlIG90aGVyIHNpemUgb3IgY3VzdG9tIGNoYW5nZXMuXG4gICAqL1xuICBwdWJsaWMgaGFuZGxlRm9jdXNDaGFuZ2UoIGZvY3VzOiBGb2N1cyB8IG51bGwsIHByZXZpb3VzRm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcblxuICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgb24gdGhlIHByZXZpb3VzIGZvY3VzIHdhdGNoaW5nIHRyYW5zZm9ybSBhbmQgYm91bmRzIGNoYW5nZXNcbiAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgKSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm1UcmFja2VyLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoIHByZXZpb3VzRm9jdXMgJiYgcHJldmlvdXNGb2N1cy50cmFpbC5sYXN0Tm9kZSgpICYmIHByZXZpb3VzRm9jdXMudHJhaWwubGFzdE5vZGUoKS5mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5ICkge1xuICAgICAgY29uc3QgcHJldmlvdXNCb3VuZHNQcm9wZXJ0eSA9IHByZXZpb3VzRm9jdXMudHJhaWwubGFzdE5vZGUoKS5mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5ITtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2ZvY3VzQm91bmRzTGlzdGVuZXIgJiYgcHJldmlvdXNCb3VuZHNQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy5fZm9jdXNCb3VuZHNMaXN0ZW5lciApLFxuICAgICAgICAnRm9jdXMgYm91bmRzIGxpc3RlbmVyIHNob3VsZCBiZSBsaW5rZWQgdG8gdGhlIHByZXZpb3VzIE5vZGUnXG4gICAgICApO1xuICAgICAgcHJldmlvdXNCb3VuZHNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2ZvY3VzQm91bmRzTGlzdGVuZXIhICk7XG4gICAgICB0aGlzLl9mb2N1c0JvdW5kc0xpc3RlbmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIGZvY3VzICkge1xuICAgICAgY29uc3QgbGFzdE5vZGUgPSBmb2N1cy50cmFpbC5sYXN0Tm9kZSgpO1xuXG4gICAgICBsZXQgdHJhaWxUb1RyYWNrID0gZm9jdXMudHJhaWw7XG4gICAgICBpZiAoIGZvY3VzLnRyYWlsLmNvbnRhaW5zTm9kZSggdGhpcy5fdGFyZ2V0Tm9kZSApICkge1xuXG4gICAgICAgIC8vIFRyYWNrIHRyYW5zZm9ybXMgdG8gdGhlIGZvY3VzZWQgTm9kZSwgYnV0IGV4Y2x1ZGUgdGhlIHRhcmdldE5vZGUgc28gdGhhdCByZXBvc2l0aW9ucyBkdXJpbmcgcGFuIGRvbid0XG4gICAgICAgIC8vIHRyaWdnZXIgYW5vdGhlciB0cmFuc2Zvcm0gdXBkYXRlLlxuICAgICAgICBjb25zdCBpbmRleE9mVGFyZ2V0ID0gZm9jdXMudHJhaWwubm9kZXMuaW5kZXhPZiggdGhpcy5fdGFyZ2V0Tm9kZSApO1xuICAgICAgICBjb25zdCBpbmRleE9mTGVhZiA9IGZvY3VzLnRyYWlsLm5vZGVzLmxlbmd0aDsgLy8gZW5kIG9mIHNsaWNlIGlzIG5vdCBpbmNsdWRlZFxuICAgICAgICB0cmFpbFRvVHJhY2sgPSBmb2N1cy50cmFpbC5zbGljZSggaW5kZXhPZlRhcmdldCwgaW5kZXhPZkxlYWYgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fdHJhbnNmb3JtVHJhY2tlciA9IG5ldyBUcmFuc2Zvcm1UcmFja2VyKCB0cmFpbFRvVHJhY2sgKTtcblxuICAgICAgY29uc3QgZm9jdXNNb3ZlbWVudExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgPiAxICkge1xuXG4gICAgICAgICAgbGV0IGdsb2JhbEJvdW5kczogQm91bmRzMjtcbiAgICAgICAgICBpZiAoIGxhc3ROb2RlLmZvY3VzUGFuVGFyZ2V0Qm91bmRzUHJvcGVydHkgKSB7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgTm9kZSBoYXMgYSBjdXN0b20gYm91bmRzIGFyZWEgdGhhdCB3ZSBuZWVkIHRvIGtlZXAgaW4gdmlld1xuICAgICAgICAgICAgY29uc3QgbG9jYWxCb3VuZHMgPSBsYXN0Tm9kZS5mb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5LnZhbHVlO1xuICAgICAgICAgICAgZ2xvYmFsQm91bmRzID0gZm9jdXMudHJhaWwubG9jYWxUb0dsb2JhbEJvdW5kcyggbG9jYWxCb3VuZHMgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIHVzZSB0aGUgZ2xvYmFsIGJvdW5kcyBvZiB0aGUgTm9kZSAtIG5vdGUgdGhpcyBpcyB0aGUgZnVsbCBUcmFpbCB0byB0aGUgZm9jdXNlZCBOb2RlLFxuICAgICAgICAgICAgLy8gbm90IHRoZSBzdWJ0cmFpbCB1c2VkIGJ5IFRyYW5zZm9ybVRyYWNrZXJcbiAgICAgICAgICAgIGdsb2JhbEJvdW5kcyA9IGZvY3VzLnRyYWlsLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGZvY3VzLnRyYWlsLmxhc3ROb2RlKCkubG9jYWxCb3VuZHMgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmtlZXBCb3VuZHNJblZpZXcoIGdsb2JhbEJvdW5kcywgdHJ1ZSwgbGFzdE5vZGUubGltaXRQYW5EaXJlY3Rpb24gKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gb2JzZXJ2ZSBjaGFuZ2VzIHRvIHRoZSB0cmFuc2Zvcm1cbiAgICAgIHRoaXMuX3RyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIGZvY3VzTW92ZW1lbnRMaXN0ZW5lciApO1xuXG4gICAgICAvLyBvYnNlcnZlIGNoYW5nZXMgb24gdGhlIGNsaWVudC1wcm92aWRlZCBsb2NhbCBib3VuZHNcbiAgICAgIGlmICggbGFzdE5vZGUuZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eSApIHtcbiAgICAgICAgdGhpcy5fZm9jdXNCb3VuZHNMaXN0ZW5lciA9IGZvY3VzTW92ZW1lbnRMaXN0ZW5lcjtcbiAgICAgICAgbGFzdE5vZGUuZm9jdXNQYW5UYXJnZXRCb3VuZHNQcm9wZXJ0eS5saW5rKCB0aGlzLl9mb2N1c0JvdW5kc0xpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBhbiB0byB0aGUgZm9jdXMgdHJhaWwgcmlnaHQgYXdheSBpZiBpdCBpcyBvZmYtc2NyZWVuXG4gICAgICB0aGlzLmtlZXBUcmFpbEluVmlldyggZm9jdXMudHJhaWwsIGxhc3ROb2RlLmxpbWl0UGFuRGlyZWN0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB6b29tIGNvbW1hbmRzIGZyb20gYSBrZXlib2FyZC5cbiAgICovXG4gIHB1YmxpYyBoYW5kbGVab29tQ29tbWFuZHMoIGRvbUV2ZW50OiBFdmVudCApOiB2b2lkIHtcblxuICAgIC8vIGhhbmRsZSB6b29tIC0gU2FmYXJpIGRvZXNuJ3QgcmVjZWl2ZSB0aGUga2V5dXAgZXZlbnQgd2hlbiB0aGUgbWV0YSBrZXkgaXMgcHJlc3NlZCBzbyB3ZSBjYW5ub3QgdXNlXG4gICAgLy8gdGhlIGtleVN0YXRlVHJhY2tlciB0byBkZXRlcm1pbmUgaWYgem9vbSBrZXlzIGFyZSBkb3duXG4gICAgY29uc3Qgem9vbUluQ29tbWFuZERvd24gPSBLZXlib2FyZFpvb21VdGlscy5pc1pvb21Db21tYW5kKCBkb21FdmVudCwgdHJ1ZSApO1xuICAgIGNvbnN0IHpvb21PdXRDb21tYW5kRG93biA9IEtleWJvYXJkWm9vbVV0aWxzLmlzWm9vbUNvbW1hbmQoIGRvbUV2ZW50LCBmYWxzZSApO1xuXG4gICAgaWYgKCB6b29tSW5Db21tYW5kRG93biB8fCB6b29tT3V0Q29tbWFuZERvd24gKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aVBhblpvb21MaXN0ZW5lciBrZXlib2FyZCB6b29tIGluJyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIC8vIGRvbid0IGFsbG93IG5hdGl2ZSBicm93c2VyIHpvb21cbiAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGNvbnN0IG5leHRTY2FsZSA9IHRoaXMuZ2V0TmV4dERpc2NyZXRlU2NhbGUoIHpvb21JbkNvbW1hbmREb3duICk7XG4gICAgICBjb25zdCBrZXlQcmVzcyA9IG5ldyBLZXlQcmVzcyggZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBuZXh0U2NhbGUsIHRoaXMuX3RhcmdldFNjYWxlICk7XG4gICAgICB0aGlzLnJlcG9zaXRpb25Gcm9tS2V5cygga2V5UHJlc3MgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIEtleWJvYXJkWm9vbVV0aWxzLmlzWm9vbVJlc2V0Q29tbWFuZCggZG9tRXZlbnQgKSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIga2V5Ym9hcmQgcmVzZXQnICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgLy8gdGhpcyBpcyBhIG5hdGl2ZSBjb21tYW5kLCBidXQgd2UgYXJlIHRha2luZyBvdmVyXG4gICAgICBkb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5yZXNldFRyYW5zZm9ybSgpO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGp1c3QgZm9yIG1hY09TIFNhZmFyaS4gUmVzcG9uZHMgdG8gdHJhY2twYWQgaW5wdXQuIFByZXZlbnRzIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvciBhbmQgc2V0cyB2YWx1ZXNcbiAgICogcmVxdWlyZWQgZm9yIHJlcG9zaXRpb25pbmcgYXMgdXNlciBvcGVyYXRlcyB0aGUgdHJhY2sgcGFkLlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVHZXN0dXJlU3RhcnRFdmVudCggZG9tRXZlbnQ6IEdlc3R1cmVFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmdlc3R1cmVTdGFydEFjdGlvbi5leGVjdXRlKCBkb21FdmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMganVzdCBmb3IgbWFjT1MgU2FmYXJpLiBSZXNwb25kcyB0byB0cmFja3BhZCBpbnB1dC4gUHJldmVuZHMgZGVmYXVsdCBicm93c2VyIGJlaGF2aW9yIGFuZFxuICAgKiBzZXRzIGRlc3RpbmF0aW9uIHNjYWxlIGFzIHVzZXIgcGluY2hlcyBvbiB0aGUgdHJhY2twYWQuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZUdlc3R1cmVDaGFuZ2VFdmVudCggZG9tRXZlbnQ6IEdlc3R1cmVFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmdlc3R1cmVDaGFuZ2VBY3Rpb24uZXhlY3V0ZSggZG9tRXZlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGRvd24gTWlkZGxlUHJlc3MgZHVyaW5nIGFuaW1hdGlvbi4gSWYgd2UgaGF2ZSBhIG1pZGRsZSBwcmVzcyB3ZSBuZWVkIHRvIHVwZGF0ZSBwb3NpdGlvbiB0YXJnZXQuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1pZGRsZVByZXNzKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IG1pZGRsZVByZXNzID0gdGhpcy5taWRkbGVQcmVzcyE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbWlkZGxlUHJlc3MsICdNaWRkbGVQcmVzcyBtdXN0IGJlIGRlZmluZWQgdG8gaGFuZGxlJyApO1xuXG4gICAgY29uc3Qgc291cmNlUG9zaXRpb24gPSB0aGlzLnNvdXJjZVBvc2l0aW9uITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VyY2VQb3NpdGlvbiwgJ3NvdXJjZVBvc2l0aW9uIG11c3QgYmUgZGVmaW5lZCB0byBoYW5kbGUgbWlkZGxlIHByZXNzLCBiZSBzdXJlIHRvIGNhbGwgaW5pdGlhbGl6ZVBvc2l0aW9ucycgKTtcblxuICAgIGlmICggZHQgPiAwICkge1xuICAgICAgY29uc3QgY3VycmVudFBvaW50ID0gbWlkZGxlUHJlc3MucG9pbnRlci5wb2ludDtcbiAgICAgIGNvbnN0IGdsb2JhbERlbHRhID0gY3VycmVudFBvaW50Lm1pbnVzKCBtaWRkbGVQcmVzcy5pbml0aWFsUG9pbnQgKTtcblxuICAgICAgLy8gbWFnbml0dWRlIGFsb25lIGlzIHRvbyBmYXN0LCByZWR1Y2UgYnkgYSBiaXRcbiAgICAgIGNvbnN0IHJlZHVjZWRNYWduaXR1ZGUgPSBnbG9iYWxEZWx0YS5tYWduaXR1ZGUgLyAxMDA7XG4gICAgICBpZiAoIHJlZHVjZWRNYWduaXR1ZGUgPiAwICkge1xuXG4gICAgICAgIC8vIHNldCB0aGUgZGVsdGEgdmVjdG9yIGluIGdsb2JhbCBjb29yZGluYXRlcywgbGltaXRlZCBieSBhIG1heGltdW0gdmlldyBjb29yZHMvc2Vjb25kIHZlbG9jaXR5LCBjb3JyZWN0ZWRcbiAgICAgICAgLy8gZm9yIGFueSByZXByZXNlbnRhdGl2ZSB0YXJnZXQgc2NhbGVcbiAgICAgICAgZ2xvYmFsRGVsdGEuc2V0TWFnbml0dWRlKCBNYXRoLm1pbiggcmVkdWNlZE1hZ25pdHVkZSAvIGR0LCBNQVhfU0NST0xMX1ZFTE9DSVRZICogdGhpcy5fdGFyZ2V0U2NhbGUgKSApO1xuICAgICAgICB0aGlzLnNldERlc3RpbmF0aW9uUG9zaXRpb24oIHNvdXJjZVBvc2l0aW9uLnBsdXMoIGdsb2JhbERlbHRhICkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlIGFuZCBzY2FsZSB0byBhIHRhcmdldCBwb2ludC4gVGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uIHNob3VsZCBtYWtlIGl0IGFwcGVhciB0aGF0IHdlIGFyZSBzY2FsaW5nXG4gICAqIGluIG9yIG91dCBvZiBhIHBhcnRpY3VsYXIgcG9pbnQgb24gdGhlIHRhcmdldCBub2RlLiBUaGlzIGFjdHVhbGx5IG1vZGlmaWVzIHRoZSBtYXRyaXggb2YgdGhlIHRhcmdldCBub2RlLiBUb1xuICAgKiBhY2NvbXBsaXNoIHpvb21pbmcgaW50byBhIHBhcnRpY3VsYXIgcG9pbnQsIHdlIGNvbXB1dGUgYSBtYXRyaXggdGhhdCB3b3VsZCB0cmFuc2Zvcm0gdGhlIHRhcmdldCBub2RlIGZyb21cbiAgICogdGhlIHRhcmdldCBwb2ludCwgdGhlbiBhcHBseSBzY2FsZSwgdGhlbiB0cmFuc2xhdGUgdGhlIHRhcmdldCBiYWNrIHRvIHRoZSB0YXJnZXQgcG9pbnQuXG4gICAqXG4gICAqIEBwYXJhbSBnbG9iYWxQb2ludCAtIHBvaW50IHRvIHpvb20gaW4gb24sIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiBAcGFyYW0gc2NhbGVEZWx0YVxuICAgKi9cbiAgcHJpdmF0ZSB0cmFuc2xhdGVTY2FsZVRvVGFyZ2V0KCBnbG9iYWxQb2ludDogVmVjdG9yMiwgc2NhbGVEZWx0YTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHBvaW50SW5Mb2NhbEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb0xvY2FsUG9pbnQoIGdsb2JhbFBvaW50ICk7XG4gICAgY29uc3QgcG9pbnRJblBhcmVudEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xuXG4gICAgY29uc3QgZnJvbUxvY2FsUG9pbnQgPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtcG9pbnRJbkxvY2FsRnJhbWUueCwgLXBvaW50SW5Mb2NhbEZyYW1lLnkgKTtcbiAgICBjb25zdCB0b1RhcmdldFBvaW50ID0gTWF0cml4My50cmFuc2xhdGlvbiggcG9pbnRJblBhcmVudEZyYW1lLngsIHBvaW50SW5QYXJlbnRGcmFtZS55ICk7XG5cbiAgICBjb25zdCBuZXh0U2NhbGUgPSB0aGlzLmxpbWl0U2NhbGUoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgKyBzY2FsZURlbHRhICk7XG5cbiAgICAvLyB3ZSBmaXJzdCB0cmFuc2xhdGUgZnJvbSB0YXJnZXQgcG9pbnQsIHRoZW4gYXBwbHkgc2NhbGUsIHRoZW4gdHJhbnNsYXRlIGJhY2sgdG8gdGFyZ2V0IHBvaW50ICgpXG4gICAgLy8gc28gdGhhdCBpdCBhcHBlYXJzIGFzIHRob3VnaCB3ZSBhcmUgem9vbWluZyBpbnRvIHRoYXQgcG9pbnRcbiAgICBjb25zdCBzY2FsZU1hdHJpeCA9IHRvVGFyZ2V0UG9pbnQudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggbmV4dFNjYWxlICkgKS50aW1lc01hdHJpeCggZnJvbUxvY2FsUG9pbnQgKTtcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LnNldCggc2NhbGVNYXRyaXggKTtcblxuICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGFyZSBzdGlsbCB3aXRoaW4gUGFuWm9vbUxpc3RlbmVyIGNvbnN0cmFpbnRzXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRyYW5zbGF0aW9uIGFuZCBzY2FsZSB0byBhIHRhcmdldCBwb2ludC4gTGlrZSB0cmFuc2xhdGVTY2FsZVRvVGFyZ2V0LCBidXQgaW5zdGVhZCBvZiB0YWtpbmcgYSBzY2FsZURlbHRhXG4gICAqIGl0IHRha2VzIHRoZSBmaW5hbCBzY2FsZSB0byBiZSB1c2VkIGZvciB0aGUgdGFyZ2V0IE5vZGVzIG1hdHJpeC5cbiAgICpcbiAgICogQHBhcmFtIGdsb2JhbFBvaW50IC0gcG9pbnQgdG8gdHJhbnNsYXRlIHRvIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiBAcGFyYW0gc2NhbGUgLSBmaW5hbCBzY2FsZSBmb3IgdGhlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeFxuICAgKi9cbiAgcHJpdmF0ZSBzZXRUcmFuc2xhdGlvblNjYWxlVG9UYXJnZXQoIGdsb2JhbFBvaW50OiBWZWN0b3IyLCBzY2FsZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGNvbnN0IHBvaW50SW5Mb2NhbEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb0xvY2FsUG9pbnQoIGdsb2JhbFBvaW50ICk7XG4gICAgY29uc3QgcG9pbnRJblBhcmVudEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xuXG4gICAgY29uc3QgZnJvbUxvY2FsUG9pbnQgPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCAtcG9pbnRJbkxvY2FsRnJhbWUueCwgLXBvaW50SW5Mb2NhbEZyYW1lLnkgKTtcbiAgICBjb25zdCB0b1RhcmdldFBvaW50ID0gTWF0cml4My50cmFuc2xhdGlvbiggcG9pbnRJblBhcmVudEZyYW1lLngsIHBvaW50SW5QYXJlbnRGcmFtZS55ICk7XG5cbiAgICBjb25zdCBuZXh0U2NhbGUgPSB0aGlzLmxpbWl0U2NhbGUoIHNjYWxlICk7XG5cbiAgICAvLyB3ZSBmaXJzdCB0cmFuc2xhdGUgZnJvbSB0YXJnZXQgcG9pbnQsIHRoZW4gYXBwbHkgc2NhbGUsIHRoZW4gdHJhbnNsYXRlIGJhY2sgdG8gdGFyZ2V0IHBvaW50ICgpXG4gICAgLy8gc28gdGhhdCBpdCBhcHBlYXJzIGFzIHRob3VnaCB3ZSBhcmUgem9vbWluZyBpbnRvIHRoYXQgcG9pbnRcbiAgICBjb25zdCBzY2FsZU1hdHJpeCA9IHRvVGFyZ2V0UG9pbnQudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggbmV4dFNjYWxlICkgKS50aW1lc01hdHJpeCggZnJvbUxvY2FsUG9pbnQgKTtcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LnNldCggc2NhbGVNYXRyaXggKTtcblxuICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGFyZSBzdGlsbCB3aXRoaW4gUGFuWm9vbUxpc3RlbmVyIGNvbnN0cmFpbnRzXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSB0aGUgdGFyZ2V0IG5vZGUgaW4gYSBkaXJlY3Rpb24gc3BlY2lmaWVkIGJ5IGRlbHRhVmVjdG9yLlxuICAgKi9cbiAgcHJpdmF0ZSB0cmFuc2xhdGVEZWx0YSggZGVsdGFWZWN0b3I6IFZlY3RvcjIgKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0UG9pbnQgPSB0aGlzLl90YXJnZXROb2RlLmdsb2JhbFRvUGFyZW50UG9pbnQoIHRoaXMuX3BhbkJvdW5kcy5jZW50ZXIgKTtcbiAgICBjb25zdCBzb3VyY2VQb2ludCA9IHRhcmdldFBvaW50LnBsdXMoIGRlbHRhVmVjdG9yICk7XG4gICAgdGhpcy50cmFuc2xhdGVUb1RhcmdldCggc291cmNlUG9pbnQsIHRhcmdldFBvaW50ICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlIHRoZSB0YXJnZXROb2RlIGZyb20gYSBsb2NhbCBwb2ludCB0byBhIHRhcmdldCBwb2ludC4gQm90aCBwb2ludHMgc2hvdWxkIGJlIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZVxuICAgKiBmcmFtZS5cbiAgICogQHBhcmFtIGluaXRpYWxQb2ludCAtIGluIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLCBzb3VyY2UgcG9zaXRpb25cbiAgICogQHBhcmFtIHRhcmdldFBvaW50IC0gaW4gZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUsIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgcHVibGljIHRyYW5zbGF0ZVRvVGFyZ2V0KCBpbml0aWFsUG9pbnQ6IFZlY3RvcjIsIHRhcmdldFBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xuXG4gICAgY29uc3Qgc2luZ2xlSW5pdGlhbFBvaW50ID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBpbml0aWFsUG9pbnQgKTtcbiAgICBjb25zdCBzaW5nbGVUYXJnZXRQb2ludCA9IHRoaXMuX3RhcmdldE5vZGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggdGFyZ2V0UG9pbnQgKTtcbiAgICBjb25zdCBkZWx0YSA9IHNpbmdsZVRhcmdldFBvaW50Lm1pbnVzKCBzaW5nbGVJbml0aWFsUG9pbnQgKTtcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LnNldCggTWF0cml4My50cmFuc2xhdGlvbkZyb21WZWN0b3IoIGRlbHRhICkudGltZXNNYXRyaXgoIHRoaXMuX3RhcmdldE5vZGUuZ2V0TWF0cml4KCkgKSApO1xuXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9zaXRpb25zIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZSB0byBrZXlib2FyZCBpbnB1dC5cbiAgICovXG4gIHByaXZhdGUgcmVwb3NpdGlvbkZyb21LZXlzKCBrZXlQcmVzczogS2V5UHJlc3MgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciByZXBvc2l0aW9uIGZyb20ga2V5IHByZXNzJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3Qgc291cmNlUG9zaXRpb24gPSB0aGlzLnNvdXJjZVBvc2l0aW9uITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VyY2VQb3NpdGlvbiwgJ3NvdXJjZVBvc2l0aW9uIG11c3QgYmUgZGVmaW5lZCB0byBoYW5kbGUga2V5IHByZXNzLCBiZSBzdXJlIHRvIGNhbGwgaW5pdGlhbGl6ZVBvc2l0aW9ucycgKTtcblxuICAgIGNvbnN0IG5ld1NjYWxlID0ga2V5UHJlc3Muc2NhbGU7XG4gICAgY29uc3QgY3VycmVudFNjYWxlID0gdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcbiAgICBpZiAoIG5ld1NjYWxlICE9PSBjdXJyZW50U2NhbGUgKSB7XG5cbiAgICAgIC8vIGtleSBwcmVzcyBjaGFuZ2VkIHNjYWxlXG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIG5ld1NjYWxlICk7XG4gICAgICB0aGlzLnNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uID0ga2V5UHJlc3MuY29tcHV0ZVNjYWxlVGFyZ2V0RnJvbUtleVByZXNzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCAha2V5UHJlc3MudHJhbnNsYXRpb25WZWN0b3IuZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSApIHtcblxuICAgICAgLy8ga2V5IHByZXNzIGluaXRpYXRlZCBzb21lIHRyYW5zbGF0aW9uXG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uUG9zaXRpb24oIHNvdXJjZVBvc2l0aW9uLnBsdXMoIGtleVByZXNzLnRyYW5zbGF0aW9uVmVjdG9yICkgKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvcnJlY3RSZXBvc2l0aW9uKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcG9zaXRpb25zIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZSB0byB3aGVlbCBpbnB1dC4gV2hlZWwgaW5wdXQgY2FuIGNvbWUgZnJvbSBhIG1vdXNlLCB0cmFja3BhZCwgb3JcbiAgICogb3RoZXIuIEFzcGVjdHMgb2YgdGhlIGV2ZW50IGFyZSBzbGlnaHRseSBkaWZmZXJlbnQgZm9yIGVhY2ggaW5wdXQgc291cmNlIGFuZCB0aGlzIGZ1bmN0aW9uIHRyaWVzIHRvIG5vcm1hbGl6ZVxuICAgKiB0aGVzZSBkaWZmZXJlbmNlcy5cbiAgICovXG4gIHByaXZhdGUgcmVwb3NpdGlvbkZyb21XaGVlbCggd2hlZWw6IFdoZWVsLCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcmVwb3NpdGlvbiBmcm9tIHdoZWVsJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudCE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQgaW5zdGFuY2VvZiBXaGVlbEV2ZW50LCAnd2hlZWwgZXZlbnQgbXVzdCBiZSBhIFdoZWVsRXZlbnQnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXG5cbiAgICBjb25zdCBzb3VyY2VQb3NpdGlvbiA9IHRoaXMuc291cmNlUG9zaXRpb24hO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNvdXJjZVBvc2l0aW9uLCAnc291cmNlUG9zaXRpb24gbXVzdCBiZSBkZWZpbmVkIHRvIGhhbmRsZSB3aGVlbCwgYmUgc3VyZSB0byBjYWxsIGluaXRpYWxpemVQb3NpdGlvbnMnICk7XG5cbiAgICAvLyBwcmV2ZW50IGFueSBuYXRpdmUgYnJvd3NlciB6b29tIGFuZCBkb24ndCBhbGxvdyBicm93c2VyIHRvIGdvICdiYWNrJyBvciAnZm9yd2FyZCcgYSBwYWdlIHdpdGggY2VydGFpbiBnZXN0dXJlc1xuICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBpZiAoIHdoZWVsLmlzQ3RybEtleURvd24gKSB7XG4gICAgICBjb25zdCBuZXh0U2NhbGUgPSB0aGlzLmxpbWl0U2NhbGUoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgKyB3aGVlbC5zY2FsZURlbHRhICk7XG4gICAgICB0aGlzLnNjYWxlR2VzdHVyZVRhcmdldFBvc2l0aW9uID0gd2hlZWwudGFyZ2V0UG9pbnQ7XG4gICAgICB0aGlzLnNldERlc3RpbmF0aW9uU2NhbGUoIG5leHRTY2FsZSApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gd2hlZWwgZG9lcyBub3QgaW5kaWNhdGUgem9vbSwgbXVzdCBiZSB0cmFuc2xhdGlvblxuICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCBzb3VyY2VQb3NpdGlvbi5wbHVzKCB3aGVlbC50cmFuc2xhdGlvblZlY3RvciApICk7XG4gICAgfVxuXG4gICAgdGhpcy5jb3JyZWN0UmVwb3NpdGlvbigpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcG9uIGFueSBraW5kIG9mIHJlcG9zaXRpb24sIHVwZGF0ZSB0aGUgc291cmNlIHBvc2l0aW9uIGFuZCBzY2FsZSBmb3IgdGhlIG5leHQgdXBkYXRlIGluIGFuaW1hdGVUb1RhcmdldHMuXG4gICAqXG4gICAqIE5vdGU6IFRoaXMgYXNzdW1lcyB0aGF0IGFueSBraW5kIG9mIHJlcG9zaXRpb25pbmcgb2YgdGhlIHRhcmdldCBub2RlIHdpbGwgZXZlbnR1YWxseSBjYWxsIGNvcnJlY3RSZXBvc2l0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNvcnJlY3RSZXBvc2l0aW9uKCk6IHZvaWQge1xuICAgIHN1cGVyLmNvcnJlY3RSZXBvc2l0aW9uKCk7XG5cbiAgICBpZiAoIHRoaXMuX3BhbkJvdW5kcy5pc0Zpbml0ZSgpICkge1xuXG4gICAgICAvLyB0aGUgcGFuIGJvdW5kcyBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGUgdGFyZ2V0IE5vZGUgKGdlbmVyYWxseSwgYm91bmRzIG9mIHRoZSB0YXJnZXROb2RlXG4gICAgICAvLyB0aGF0IGFyZSB2aXNpYmxlIGluIHRoZSBnbG9iYWwgcGFuQm91bmRzKVxuICAgICAgdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMgPSB0aGlzLl9wYW5Cb3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuX3RhcmdldE5vZGUubWF0cml4LmludmVydGVkKCkgKTtcblxuICAgICAgdGhpcy5zb3VyY2VQb3NpdGlvbiA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmNlbnRlcjtcbiAgICAgIHRoaXMuc291cmNlU2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGEgbmV3IHByZXNzIGJlZ2lucywgc3RvcCBhbnkgaW4gcHJvZ3Jlc3MgYW5pbWF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGFkZFByZXNzKCBwcmVzczogTXVsdGlMaXN0ZW5lclByZXNzICk6IHZvaWQge1xuICAgIHN1cGVyLmFkZFByZXNzKCBwcmVzcyApO1xuICAgIHRoaXMuc3RvcEluUHJvZ3Jlc3NBbmltYXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHByZXNzZXMgYXJlIHJlbW92ZWQsIHJlc2V0IGFuaW1hdGlvbiBkZXN0aW5hdGlvbnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgcmVtb3ZlUHJlc3MoIHByZXNzOiBNdWx0aUxpc3RlbmVyUHJlc3MgKTogdm9pZCB7XG4gICAgc3VwZXIucmVtb3ZlUHJlc3MoIHByZXNzICk7XG5cbiAgICAvLyByZXN0b3JlIHRoZSBjdXJzb3IgaWYgd2UgaGF2ZSBhIG1pZGRsZSBwcmVzcyBhcyB3ZSBhcmUgaW4gYSBzdGF0ZSB3aGVyZSBtb3ZpbmcgdGhlIG1vdXNlIHdpbGwgcGFuXG4gICAgaWYgKCB0aGlzLm1pZGRsZVByZXNzICkge1xuICAgICAgcHJlc3MucG9pbnRlci5jdXJzb3IgPSBNT1ZFX0NVUlNPUjtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX3ByZXNzZXMubGVuZ3RoID09PSAwICkge1xuICAgICAgdGhpcy5zdG9wSW5Qcm9ncmVzc0FuaW1hdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnJ1cHQgdGhlIGxpc3RlbmVyLiBDYW5jZWxzIGFueSBhY3RpdmUgaW5wdXQgYW5kIGNsZWFycyByZWZlcmVuY2VzIHVwb24gaW50ZXJhY3Rpb24gZW5kLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGludGVycnVwdCgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbFBhbm5pbmdEdXJpbmdEcmFnKCk7XG5cbiAgICB0aGlzLmNhbmNlbE1pZGRsZVByZXNzKCk7XG4gICAgc3VwZXIuaW50ZXJydXB0KCk7XG4gIH1cblxuICAvKipcbiAgICogXCJDYW5jZWxcIiB0aGUgbGlzdGVuZXIsIHdoZW4gaW5wdXQgc3RvcHMgYWJub3JtYWxseS4gUGFydCBvZiB0aGUgc2NlbmVyeSBJbnB1dCBBUEkuXG4gICAqL1xuICBwdWJsaWMgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJydXB0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBJbnRlbnQgb2YgdGhlIFBvaW50ZXIgaW5kaWNhdGVzIHRoYXQgaXQgd2lsbCBiZSB1c2VkIGZvciBkcmFnZ2luZyBvZiBzb21lIGtpbmQuXG4gICAqL1xuICBwcml2YXRlIGhhc0RyYWdJbnRlbnQoIHBvaW50ZXI6IFBvaW50ZXIgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuS0VZQk9BUkRfRFJBRyApIHx8XG4gICAgICAgICAgIHBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuRFJBRyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhbiB0byBhIHByb3ZpZGVkIE5vZGUsIGF0dGVtcHRpbmcgdG8gcGxhY2UgdGhlIG5vZGUgaW4gdGhlIGNlbnRlciBvZiB0aGUgdHJhbnNmb3JtZWRQYW5Cb3VuZHMuIEl0IG1heSBub3QgZW5kXG4gICAqIHVwIGV4YWN0bHkgaW4gdGhlIGNlbnRlciBzaW5jZSB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSBwYW5Cb3VuZHMgYXJlIGNvbXBsZXRlbHkgZmlsbGVkIHdpdGggdGFyZ2V0Tm9kZSBjb250ZW50LlxuICAgKlxuICAgKiBZb3UgY2FuIGNvbmRpdGlvbmFsbHkgbm90IHBhbiB0byB0aGUgY2VudGVyIGJ5IHNldHRpbmcgcGFuVG9DZW50ZXIgdG8gZmFsc2UuIFNvbWV0aW1lcyBzaGlmdGluZyB0aGUgc2NyZWVuIHNvXG4gICAqIHRoYXQgdGhlIE5vZGUgaXMgYXQgdGhlIGNlbnRlciBpcyB0b28gamFycmluZy5cbiAgICpcbiAgICogQHBhcmFtIG5vZGUgLSBOb2RlIHRvIHBhbiB0b1xuICAgKiBAcGFyYW0gcGFuVG9DZW50ZXIgLSBJZiB0cnVlLCBsaXN0ZW5lciB3aWxsIHBhbiBzbyB0aGF0IHRoZSBOb2RlIGlzIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlbi4gT3RoZXJ3aXNlLCBqdXN0XG4gICAqICAgICAgICAgICAgICAgICAgICAgIHVudGlsIHRoZSBOb2RlIGlzIGZ1bGx5IGRpc3BsYXllZCBpbiB0aGUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSBwYW5EaXJlY3Rpb24gLSBpZiBwcm92aWRlZCwgd2Ugd2lsbCBvbmx5IHBhbiBpbiB0aGUgZGlyZWN0aW9uIHNwZWNpZmllZCwgbnVsbCBmb3IgYWxsIGRpcmVjdGlvbnNcbiAgICovXG4gIHB1YmxpYyBwYW5Ub05vZGUoIG5vZGU6IE5vZGUsIHBhblRvQ2VudGVyOiBib29sZWFuLCBwYW5EaXJlY3Rpb24/OiBMaW1pdFBhbkRpcmVjdGlvbiB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcGFuQm91bmRzLmlzRmluaXRlKCksICdwYW5Cb3VuZHMgc2hvdWxkIGJlIGRlZmluZWQgd2hlbiBwYW5uaW5nLicgKTtcbiAgICB0aGlzLmtlZXBCb3VuZHNJblZpZXcoIG5vZGUuZ2xvYmFsQm91bmRzLCBwYW5Ub0NlbnRlciwgcGFuRGlyZWN0aW9uICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBkZXN0aW5hdGlvbiBwb3NpdGlvbiB0byBwYW4gc3VjaCB0aGF0IHRoZSBwcm92aWRlZCBnbG9iYWxCb3VuZHMgYXJlIHRvdGFsbHkgdmlzaWJsZSB3aXRoaW4gdGhlIHBhbkJvdW5kcy5cbiAgICogVGhpcyB3aWxsIG5ldmVyIHBhbiBvdXRzaWRlIHBhbkJvdW5kcywgaWYgdGhlIHByb3ZpZGVkIGdsb2JhbEJvdW5kcyBleHRlbmQgYmV5b25kIHRoZW0uXG4gICAqXG4gICAqIElmIHdlIGFyZSBub3QgdXNpbmcgcGFuVG9DZW50ZXIgYW5kIHRoZSBnbG9iYWxCb3VuZHMgaXMgbGFyZ2VyIHRoYW4gdGhlIHNjcmVlbiBzaXplIHRoaXMgZnVuY3Rpb24gZG9lcyBub3RoaW5nLlxuICAgKiBJdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgdG8gdHJ5IHRvIGtlZXAgdGhlIHByb3ZpZGVkIGJvdW5kcyBlbnRpcmVseSBpbiB2aWV3IGlmIHRoZXkgYXJlIGxhcmdlciB0aGFuIHRoZSBhdmFpbGFsYWJsZVxuICAgKiB2aWV3IHNwYWNlLlxuICAgKlxuICAgKiBAcGFyYW0gZ2xvYmFsQm91bmRzIC0gaW4gZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogQHBhcmFtIHBhblRvQ2VudGVyIC0gaWYgdHJ1ZSwgd2Ugd2lsbCBwYW4gdG8gdGhlIGNlbnRlciBvZiB0aGUgcHJvdmlkZWQgYm91bmRzLCBvdGhlcndpc2Ugd2Ugd2lsbCBwYW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVudGlsIGFsbCBlZGdlcyBhcmUgb24gc2NyZWVuXG4gICAqIEBwYXJhbSBwYW5EaXJlY3Rpb24gLSBpZiBwcm92aWRlZCwgd2Ugd2lsbCBvbmx5IHBhbiBpbiB0aGUgZGlyZWN0aW9uIHNwZWNpZmllZCwgbnVsbCBmb3IgYWxsIGRpcmVjdGlvbnNcbiAgICovXG4gIHByaXZhdGUga2VlcEJvdW5kc0luVmlldyggZ2xvYmFsQm91bmRzOiBCb3VuZHMyLCBwYW5Ub0NlbnRlcjogYm9vbGVhbiwgcGFuRGlyZWN0aW9uPzogTGltaXRQYW5EaXJlY3Rpb24gfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BhbkJvdW5kcy5pc0Zpbml0ZSgpLCAncGFuQm91bmRzIHNob3VsZCBiZSBkZWZpbmVkIHdoZW4gcGFubmluZy4nICk7XG4gICAgY29uc3Qgc291cmNlUG9zaXRpb24gPSB0aGlzLnNvdXJjZVBvc2l0aW9uITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3VyY2VQb3NpdGlvbiwgJ3NvdXJjZVBvc2l0aW9uIG11c3QgYmUgZGVmaW5lZCB0byBoYW5kbGUga2VlcEJvdW5kc0luVmlldywgYmUgc3VyZSB0byBjYWxsIGluaXRpYWxpemVQb3NpdGlvbnMnICk7XG5cbiAgICBjb25zdCBib3VuZHNJblRhcmdldEZyYW1lID0gdGhpcy5fdGFyZ2V0Tm9kZS5nbG9iYWxUb0xvY2FsQm91bmRzKCBnbG9iYWxCb3VuZHMgKTtcbiAgICBjb25zdCB0cmFuc2xhdGlvbkRlbHRhID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcblxuICAgIGxldCBkaXN0YW5jZVRvTGVmdEVkZ2UgPSAwO1xuICAgIGxldCBkaXN0YW5jZVRvUmlnaHRFZGdlID0gMDtcbiAgICBsZXQgZGlzdGFuY2VUb1RvcEVkZ2UgPSAwO1xuICAgIGxldCBkaXN0YW5jZVRvQm90dG9tRWRnZSA9IDA7XG5cbiAgICBpZiAoIHBhblRvQ2VudGVyICkge1xuXG4gICAgICAvLyBJZiBwYW5uaW5nIHRvIGNlbnRlciwgdGhlIGFtb3VudCB0byBwYW4gaXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuIHRvIHRoZSBjZW50ZXIgb2YgdGhlXG4gICAgICAvLyBwcm92aWRlZCBib3VuZHMuIEluIHRoaXMgY2FzZVxuICAgICAgZGlzdGFuY2VUb0xlZnRFZGdlID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMuY2VudGVyWCAtIGJvdW5kc0luVGFyZ2V0RnJhbWUuY2VudGVyWDtcbiAgICAgIGRpc3RhbmNlVG9SaWdodEVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5jZW50ZXJYIC0gYm91bmRzSW5UYXJnZXRGcmFtZS5jZW50ZXJYO1xuICAgICAgZGlzdGFuY2VUb1RvcEVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5jZW50ZXJZIC0gYm91bmRzSW5UYXJnZXRGcmFtZS5jZW50ZXJZO1xuICAgICAgZGlzdGFuY2VUb0JvdHRvbUVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5jZW50ZXJZIC0gYm91bmRzSW5UYXJnZXRGcmFtZS5jZW50ZXJZO1xuICAgIH1cbiAgICBlbHNlIGlmICggKCBwYW5EaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCcgfHwgYm91bmRzSW5UYXJnZXRGcmFtZS53aWR0aCA8IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLndpZHRoICkgJiYgKCBwYW5EaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyB8fCBib3VuZHNJblRhcmdldEZyYW1lLmhlaWdodCA8IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmhlaWdodCApICkge1xuXG4gICAgICAvLyBJZiB0aGUgcHJvdmlkZWQgYm91bmRzIGFyZSB3aWRlciB0aGFuIHRoZSBhdmFpbGFibGUgcGFuIGJvdW5kcyB3ZSBzaG91bGRuJ3QgdHJ5IHRvIHNoaWZ0IGl0LCBpdCB3aWxsIGF3a3dhcmRseVxuICAgICAgLy8gdHJ5IHRvIHNsaWRlIHRoZSBzY3JlZW4gdG8gb25lIG9mIHRoZSBzaWRlcyBvZiB0aGUgYm91bmRzLiBUaGlzIG9wZXJhdGlvbiBvbmx5IG1ha2VzIHNlbnNlIGlmIHRoZSBzY3JlZW4gY2FuXG4gICAgICAvLyB0b3RhbGx5IGNvbnRhaW4gdGhlIG9iamVjdCBiZWluZyBkcmFnZ2VkLlxuXG4gICAgICAvLyBBIGJpdCBvZiBwYWRkaW5nIGhlbHBzIHRvIHBhbiB0aGUgc2NyZWVuIGZ1cnRoZXIgc28gdGhhdCB5b3UgY2FuIGtlZXAgZHJhZ2dpbmcgZXZlbiBpZiB0aGUgY3Vyc29yL29iamVjdFxuICAgICAgLy8gaXMgcmlnaHQgYXQgdGhlIGVkZ2Ugb2YgdGhlIHNjcmVlbi4gSXQgYWxzbyBsb29rcyBhIGxpdHRsZSBuaWNlciBieSBrZWVwaW5nIHRoZSBvYmplY3Qgd2VsbCBpbiB2aWV3LlxuICAgICAgLy8gSW5jcmVhc2UgdGhpcyB2YWx1ZSB0byBhZGQgbW9yZSBtb3Rpb24gd2hlbiBkcmFnZ2luZyBuZWFyIHRoZSBlZGdlIG9mIHRoZSBzY3JlZW4uIEJ1dCB0b28gbXVjaCBvZiB0aGlzXG4gICAgICAvLyB3aWxsIG1ha2UgdGhlIHNjcmVlbiBmZWVsIGxpa2UgaXQgaXMgXCJzbGlkaW5nXCIgYXJvdW5kIHRvbyBtdWNoLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9udW1iZXItbGluZS1vcGVyYXRpb25zL2lzc3Vlcy8xMDhcbiAgICAgIGNvbnN0IHBhZGRpbmdEZWx0YSA9IDE1MDsgLy8gZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUsIHNjYWxlZCBiZWxvd1xuXG4gICAgICAvLyBzY2FsZSB0aGUgcGFkZGluZyBkZWx0YSBieSBvdXIgbWF0cml4IHNvIHRoYXQgaXQgaXMgYXBwcm9wcmlhdGUgZm9yIG91ciB6b29tIGxldmVsIC0gc21hbGxlciB3aGVuIHpvb21lZCB3YXkgaW5cbiAgICAgIGNvbnN0IG1hdHJpeFNjYWxlID0gdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdEZWx0YVNjYWxlZCA9IHBhZGRpbmdEZWx0YSAvIG1hdHJpeFNjYWxlO1xuXG4gICAgICBkaXN0YW5jZVRvTGVmdEVkZ2UgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5sZWZ0IC0gYm91bmRzSW5UYXJnZXRGcmFtZS5sZWZ0ICsgcGFkZGluZ0RlbHRhU2NhbGVkO1xuICAgICAgZGlzdGFuY2VUb1JpZ2h0RWRnZSA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLnJpZ2h0IC0gYm91bmRzSW5UYXJnZXRGcmFtZS5yaWdodCAtIHBhZGRpbmdEZWx0YVNjYWxlZDtcbiAgICAgIGRpc3RhbmNlVG9Ub3BFZGdlID0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMudG9wIC0gYm91bmRzSW5UYXJnZXRGcmFtZS50b3AgKyBwYWRkaW5nRGVsdGFTY2FsZWQ7XG4gICAgICBkaXN0YW5jZVRvQm90dG9tRWRnZSA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmJvdHRvbSAtIGJvdW5kc0luVGFyZ2V0RnJhbWUuYm90dG9tIC0gcGFkZGluZ0RlbHRhU2NhbGVkO1xuICAgIH1cblxuICAgIGlmICggcGFuRGlyZWN0aW9uICE9PSAndmVydGljYWwnICkge1xuXG4gICAgICAvLyBpZiBub3QgcGFubmluZyB2ZXJ0aWNhbGx5LCB3ZSBhcmUgZnJlZSB0byBtb3ZlIGluIHRoZSBob3Jpem9udGFsIGRpbWVuc2lvblxuICAgICAgaWYgKCBkaXN0YW5jZVRvUmlnaHRFZGdlIDwgMCApIHtcbiAgICAgICAgdHJhbnNsYXRpb25EZWx0YS54ID0gLWRpc3RhbmNlVG9SaWdodEVkZ2U7XG4gICAgICB9XG4gICAgICBpZiAoIGRpc3RhbmNlVG9MZWZ0RWRnZSA+IDAgKSB7XG4gICAgICAgIHRyYW5zbGF0aW9uRGVsdGEueCA9IC1kaXN0YW5jZVRvTGVmdEVkZ2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICggcGFuRGlyZWN0aW9uICE9PSAnaG9yaXpvbnRhbCcgKSB7XG5cbiAgICAgIC8vIGlmIG5vdCBwYW5uaW5nIGhvcml6b250YWxseSwgd2UgYXJlIGZyZWUgdG8gbW92ZSBpbiB0aGUgdmVydGljYWwgZGlyZWN0aW9uXG4gICAgICBpZiAoIGRpc3RhbmNlVG9Cb3R0b21FZGdlIDwgMCApIHtcbiAgICAgICAgdHJhbnNsYXRpb25EZWx0YS55ID0gLWRpc3RhbmNlVG9Cb3R0b21FZGdlO1xuICAgICAgfVxuICAgICAgaWYgKCBkaXN0YW5jZVRvVG9wRWRnZSA+IDAgKSB7XG4gICAgICAgIHRyYW5zbGF0aW9uRGVsdGEueSA9IC1kaXN0YW5jZVRvVG9wRWRnZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldERlc3RpbmF0aW9uUG9zaXRpb24oIHNvdXJjZVBvc2l0aW9uLnBsdXMoIHRyYW5zbGF0aW9uRGVsdGEgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEtlZXAgYSB0cmFpbCBpbiB2aWV3IGJ5IHBhbm5pbmcgdG8gaXQgaWYgaXQgaGFzIGJvdW5kcyB0aGF0IGFyZSBvdXRzaWRlIG9mIHRoZSBnbG9iYWwgcGFuQm91bmRzLlxuICAgKi9cbiAgcHJpdmF0ZSBrZWVwVHJhaWxJblZpZXcoIHRyYWlsOiBUcmFpbCwgcGFuRGlyZWN0aW9uPzogTGltaXRQYW5EaXJlY3Rpb24gfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggdGhpcy5fcGFuQm91bmRzLmlzRmluaXRlKCkgJiYgdHJhaWwubGFzdE5vZGUoKS5ib3VuZHMuaXNGaW5pdGUoKSApIHtcbiAgICAgIGNvbnN0IGdsb2JhbEJvdW5kcyA9IHRyYWlsLmxvY2FsVG9HbG9iYWxCb3VuZHMoIHRyYWlsLmxhc3ROb2RlKCkubG9jYWxCb3VuZHMgKTtcbiAgICAgIGlmICggIXRoaXMuX3BhbkJvdW5kcy5jb250YWluc0JvdW5kcyggZ2xvYmFsQm91bmRzICkgKSB7XG4gICAgICAgIHRoaXMua2VlcEJvdW5kc0luVmlldyggZ2xvYmFsQm91bmRzLCB0cnVlLCBwYW5EaXJlY3Rpb24gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGR0IC0gaW4gc2Vjb25kc1xuICAgKi9cbiAgcHJpdmF0ZSBhbmltYXRlVG9UYXJnZXRzKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYm91bmRzRmluaXRlLCAnaW5pdGlhbGl6ZVBvc2l0aW9ucyBtdXN0IGJlIGNhbGxlZCBhdCBsZWFzdCBvbmNlIGJlZm9yZSBhbmltYXRpbmcnICk7XG5cbiAgICBjb25zdCBzb3VyY2VQb3NpdGlvbiA9IHRoaXMuc291cmNlUG9zaXRpb24hO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNvdXJjZVBvc2l0aW9uLCAnc291cmNlUG9zaXRpb24gbXVzdCBiZSBkZWZpbmVkIHRvIGFuaW1hdGUsIGJlIHN1cmUgdG8gYWxsIGluaXRpYWxpemVQb3NpdGlvbnMnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc291cmNlUG9zaXRpb24uaXNGaW5pdGUoKSwgJ0hvdyBjYW4gdGhlIHNvdXJjZSBwb3NpdGlvbiBub3QgYmUgYSBmaW5pdGUgVmVjdG9yMj8nICk7XG5cbiAgICBjb25zdCBkZXN0aW5hdGlvblBvc2l0aW9uID0gdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZXN0aW5hdGlvblBvc2l0aW9uLCAnZGVzdGluYXRpb25Qb3NpdGlvbiBtdXN0IGJlIGRlZmluZWQgdG8gYW5pbWF0ZSwgYmUgc3VyZSB0byBhbGwgaW5pdGlhbGl6ZVBvc2l0aW9ucycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZXN0aW5hdGlvblBvc2l0aW9uLmlzRmluaXRlKCksICdIb3cgY2FuIHRoZSBkZXN0aW5hdGlvbiBwb3NpdGlvbiBub3QgYmUgYSBmaW5pdGUgVmVjdG9yMj8nICk7XG5cbiAgICAvLyBvbmx5IGFuaW1hdGUgdG8gdGFyZ2V0cyBpZiB3aXRoaW4gdGhpcyBwcmVjaXNpb24gc28gdGhhdCB3ZSBkb24ndCBhbmltYXRlIGZvcmV2ZXIsIHNpbmNlIGFuaW1hdGlvbiBzcGVlZFxuICAgIC8vIGlzIGRlcGVuZGVudCBvbiB0aGUgZGlmZmVyZW5jZSBiZXR3ZW4gc291cmNlIGFuZCBkZXN0aW5hdGlvbiBwb3NpdGlvbnNcbiAgICBjb25zdCBwb3NpdGlvbkRpcnR5ID0gIWRlc3RpbmF0aW9uUG9zaXRpb24uZXF1YWxzRXBzaWxvbiggc291cmNlUG9zaXRpb24sIDAuMSApO1xuICAgIGNvbnN0IHNjYWxlRGlydHkgPSAhVXRpbHMuZXF1YWxzRXBzaWxvbiggdGhpcy5zb3VyY2VTY2FsZSwgdGhpcy5kZXN0aW5hdGlvblNjYWxlLCAwLjAwMSApO1xuXG4gICAgdGhpcy5hbmltYXRpbmdQcm9wZXJ0eS52YWx1ZSA9IHBvc2l0aW9uRGlydHkgfHwgc2NhbGVEaXJ0eTtcblxuICAgIC8vIE9ubHkgYSBNaWRkbGVQcmVzcyBjYW4gc3VwcG9ydCBhbmltYXRpb24gd2hpbGUgZG93blxuICAgIGlmICggdGhpcy5fcHJlc3Nlcy5sZW5ndGggPT09IDAgfHwgdGhpcy5taWRkbGVQcmVzcyAhPT0gbnVsbCApIHtcbiAgICAgIGlmICggcG9zaXRpb25EaXJ0eSApIHtcblxuICAgICAgICAvLyBhbmltYXRlIHRvIHRoZSBwb3NpdGlvbiwgZWZmZWN0aXZlbHkgcGFubmluZyBvdmVyIHRpbWUgd2l0aG91dCBhbnkgc2NhbGluZ1xuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbkRpZmZlcmVuY2UgPSBkZXN0aW5hdGlvblBvc2l0aW9uLm1pbnVzKCBzb3VyY2VQb3NpdGlvbiApO1xuXG4gICAgICAgIGxldCB0cmFuc2xhdGlvbkRpcmVjdGlvbiA9IHRyYW5zbGF0aW9uRGlmZmVyZW5jZTtcbiAgICAgICAgaWYgKCB0cmFuc2xhdGlvbkRpZmZlcmVuY2UubWFnbml0dWRlICE9PSAwICkge1xuICAgICAgICAgIHRyYW5zbGF0aW9uRGlyZWN0aW9uID0gdHJhbnNsYXRpb25EaWZmZXJlbmNlLm5vcm1hbGl6ZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uU3BlZWQgPSB0aGlzLmdldFRyYW5zbGF0aW9uU3BlZWQoIHRyYW5zbGF0aW9uRGlmZmVyZW5jZS5tYWduaXR1ZGUgKTtcbiAgICAgICAgc2NyYXRjaFZlbG9jaXR5VmVjdG9yLnNldFhZKCB0cmFuc2xhdGlvblNwZWVkLCB0cmFuc2xhdGlvblNwZWVkICk7XG5cbiAgICAgICAgLy8gZmluYWxseSBkZXRlcm1pbmUgdGhlIGZpbmFsIHBhbm5pbmcgdHJhbnNsYXRpb24gYW5kIGFwcGx5XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudE1hZ25pdHVkZSA9IHNjcmF0Y2hWZWxvY2l0eVZlY3Rvci5tdWx0aXBseVNjYWxhciggZHQgKTtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25EZWx0YSA9IHRyYW5zbGF0aW9uRGlyZWN0aW9uLmNvbXBvbmVudFRpbWVzKCBjb21wb25lbnRNYWduaXR1ZGUgKTtcblxuICAgICAgICAvLyBpbiBjYXNlIG9mIGxhcmdlIGR0LCBkb24ndCBvdmVyc2hvb3QgdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgIGlmICggdHJhbnNsYXRpb25EZWx0YS5tYWduaXR1ZGUgPiB0cmFuc2xhdGlvbkRpZmZlcmVuY2UubWFnbml0dWRlICkge1xuICAgICAgICAgIHRyYW5zbGF0aW9uRGVsdGEuc2V0KCB0cmFuc2xhdGlvbkRpZmZlcmVuY2UgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyYW5zbGF0aW9uRGVsdGEuaXNGaW5pdGUoKSwgJ1RyeWluZyB0byB0cmFuc2xhdGUgd2l0aCBhIG5vbi1maW5pdGUgVmVjdG9yMicgKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGVEZWx0YSggdHJhbnNsYXRpb25EZWx0YSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHNjYWxlRGlydHkgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2NhbGVHZXN0dXJlVGFyZ2V0UG9zaXRpb24sICd0aGVyZSBtdXN0IGJlIGEgc2NhbGUgdGFyZ2V0IHBvaW50JyApO1xuXG4gICAgICAgIGNvbnN0IHNjYWxlRGlmZmVyZW5jZSA9IHRoaXMuZGVzdGluYXRpb25TY2FsZSAtIHRoaXMuc291cmNlU2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gc2NhbGVEaWZmZXJlbmNlICogZHQgKiA2O1xuXG4gICAgICAgIC8vIGluIGNhc2Ugb2YgbGFyZ2UgZHQgbWFrZSBzdXJlIHRoYXQgd2UgZG9uJ3Qgb3ZlcnNob290IG91ciBkZXN0aW5hdGlvblxuICAgICAgICBpZiAoIE1hdGguYWJzKCBzY2FsZURlbHRhICkgPiBNYXRoLmFicyggc2NhbGVEaWZmZXJlbmNlICkgKSB7XG4gICAgICAgICAgc2NhbGVEZWx0YSA9IHNjYWxlRGlmZmVyZW5jZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYW5zbGF0ZVNjYWxlVG9UYXJnZXQoIHRoaXMuc2NhbGVHZXN0dXJlVGFyZ2V0UG9zaXRpb24hLCBzY2FsZURlbHRhICk7XG5cbiAgICAgICAgLy8gYWZ0ZXIgYXBwbHlpbmcgdGhlIHNjYWxlLCB0aGUgc291cmNlIHBvc2l0aW9uIGhhcyBjaGFuZ2VkLCB1cGRhdGUgZGVzdGluYXRpb24gdG8gbWF0Y2hcbiAgICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCBzb3VyY2VQb3NpdGlvbiApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuZGVzdGluYXRpb25TY2FsZSAhPT0gdGhpcy5zb3VyY2VTY2FsZSApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiwgJ3RoZXJlIG11c3QgYmUgYSBzY2FsZSB0YXJnZXQgcG9pbnQnICk7XG5cbiAgICAgICAgLy8gbm90IGZhciBlbm91Z2ggdG8gYW5pbWF0ZSBidXQgY2xvc2UgZW5vdWdoIHRoYXQgd2UgY2FuIHNldCBkZXN0aW5hdGlvbiBlcXVhbCB0byBzb3VyY2UgdG8gYXZvaWQgZnVydGhlclxuICAgICAgICAvLyBhbmltYXRpb24gc3RlcHNcbiAgICAgICAgdGhpcy5zZXRUcmFuc2xhdGlvblNjYWxlVG9UYXJnZXQoIHRoaXMuc2NhbGVHZXN0dXJlVGFyZ2V0UG9zaXRpb24hLCB0aGlzLmRlc3RpbmF0aW9uU2NhbGUgKTtcbiAgICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCBzb3VyY2VQb3NpdGlvbiApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGFueSBpbi1wcm9ncmVzcyB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIHRhcmdldCBub2RlIGJ5IHNldHRpbmcgZGVzdGluYXRpb25zIHRvIHNvdXJjZXMgaW1tZWRpYXRlbHkuXG4gICAqL1xuICBwcml2YXRlIHN0b3BJblByb2dyZXNzQW5pbWF0aW9uKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5ib3VuZHNGaW5pdGUgJiYgdGhpcy5zb3VyY2VQb3NpdGlvbiApIHtcbiAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25TY2FsZSggdGhpcy5zb3VyY2VTY2FsZSApO1xuICAgICAgdGhpcy5zZXREZXN0aW5hdGlvblBvc2l0aW9uKCB0aGlzLnNvdXJjZVBvc2l0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gcG9zaXRpb25zLiBOZWNlc3NhcnkgYmVjYXVzZSB0YXJnZXQgb3IgcGFuIGJvdW5kcyBtYXkgbm90IGJlIGRlZmluZWRcbiAgICogdXBvbiBjb25zdHJ1Y3Rpb24uIFRoaXMgY2FuIHNldCB0aG9zZSB1cCB3aGVuIHRoZXkgYXJlIGRlZmluZWQuXG4gICAqL1xuICBwcml2YXRlIGluaXRpYWxpemVQb3NpdGlvbnMoKTogdm9pZCB7XG4gICAgdGhpcy5ib3VuZHNGaW5pdGUgPSB0aGlzLl90cmFuc2Zvcm1lZFBhbkJvdW5kcy5pc0Zpbml0ZSgpO1xuXG4gICAgaWYgKCB0aGlzLmJvdW5kc0Zpbml0ZSApIHtcblxuICAgICAgdGhpcy5zb3VyY2VQb3NpdGlvbiA9IHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmNlbnRlcjtcbiAgICAgIHRoaXMuc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggdGhpcy5zb3VyY2VQb3NpdGlvbiApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc291cmNlUG9zaXRpb24gPSBudWxsO1xuICAgICAgdGhpcy5kZXN0aW5hdGlvblBvc2l0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjb250YWluaW5nIHBhbkJvdW5kcyBhbmQgdGhlbiBtYWtlIHN1cmUgdGhhdCB0aGUgdGFyZ2V0Qm91bmRzIGZ1bGx5IGZpbGwgdGhlIG5ldyBwYW5Cb3VuZHMuIFVwZGF0ZXNcbiAgICogYm91bmRzIHRoYXQgdHJpZ2dlciBwYW5uaW5nIGR1cmluZyBhIGRyYWcgb3BlcmF0aW9uLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHNldFBhbkJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xuICAgIHN1cGVyLnNldFBhbkJvdW5kcyggYm91bmRzICk7XG4gICAgdGhpcy5pbml0aWFsaXplUG9zaXRpb25zKCk7XG5cbiAgICAvLyBkcmFnIGJvdW5kcyBlcm9kZWQgYSBiaXQgc28gdGhhdCByZXBvc2l0aW9uaW5nIGR1cmluZyBkcmFnIG9jY3VycyBhcyB0aGUgcG9pbnRlciBnZXRzIGNsb3NlIHRvIHRoZSBlZGdlLlxuICAgIHRoaXMuX2RyYWdCb3VuZHMgPSBib3VuZHMuZXJvZGVkWFkoIGJvdW5kcy53aWR0aCAqIDAuMSwgYm91bmRzLmhlaWdodCAqIDAuMSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2RyYWdCb3VuZHMuaGFzTm9uemVyb0FyZWEoKSwgJ2RyYWcgYm91bmRzIG11c3QgaGF2ZSBzb21lIHdpZHRoIGFuZCBoZWlnaHQnICk7XG4gIH1cblxuICAvKipcbiAgICogVXBvbiBzZXR0aW5nIHRhcmdldCBib3VuZHMsIHJlLXNldCBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIHBvc2l0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRUYXJnZXRCb3VuZHMoIHRhcmdldEJvdW5kczogQm91bmRzMiApOiB2b2lkIHtcbiAgICBzdXBlci5zZXRUYXJnZXRCb3VuZHMoIHRhcmdldEJvdW5kcyApO1xuICAgIHRoaXMuaW5pdGlhbGl6ZVBvc2l0aW9ucygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgZGVzdGluYXRpb24gcG9zaXRpb24uIEluIGFuaW1hdGlvbiwgd2Ugd2lsbCB0cnkgbW92ZSB0aGUgdGFyZ2V0Tm9kZSB1bnRpbCBzb3VyY2VQb3NpdGlvbiBtYXRjaGVzXG4gICAqIHRoaXMgcG9pbnQuIERlc3RpbmF0aW9uIGlzIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSB0YXJnZXQgbm9kZS5cbiAgICovXG4gIHByaXZhdGUgc2V0RGVzdGluYXRpb25Qb3NpdGlvbiggZGVzdGluYXRpb246IFZlY3RvcjIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ib3VuZHNGaW5pdGUsICdib3VuZHMgbXVzdCBiZSBmaW5pdGUgYmVmb3JlIHNldHRpbmcgZGVzdGluYXRpb24gcG9zaXRpb25zJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlc3RpbmF0aW9uLmlzRmluaXRlKCksICdwcm92aWRlZCBkZXN0aW5hdGlvbiBwb3NpdGlvbiBpcyBub3QgZGVmaW5lZCcgKTtcblxuICAgIGNvbnN0IHNvdXJjZVBvc2l0aW9uID0gdGhpcy5zb3VyY2VQb3NpdGlvbiE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc291cmNlUG9zaXRpb24sICdzb3VyY2VQb3NpdGlvbiBtdXN0IGJlIGRlZmluZWQgdG8gc2V0IGRlc3RpbmF0aW9uIHBvc2l0aW9uLCBiZSBzdXJlIHRvIGNhbGwgaW5pdGlhbGl6ZVBvc2l0aW9ucycgKTtcblxuICAgIC8vIGxpbWl0IGRlc3RpbmF0aW9uIHBvc2l0aW9uIHRvIGJlIHdpdGhpbiB0aGUgYXZhaWxhYmxlIGJvdW5kcyBwYW4gYm91bmRzXG4gICAgc2NyYXRjaEJvdW5kcy5zZXRNaW5NYXgoXG4gICAgICBzb3VyY2VQb3NpdGlvbi54IC0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMubGVmdCAtIHRoaXMuX3BhbkJvdW5kcy5sZWZ0LFxuICAgICAgc291cmNlUG9zaXRpb24ueSAtIHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLnRvcCAtIHRoaXMuX3BhbkJvdW5kcy50b3AsXG4gICAgICBzb3VyY2VQb3NpdGlvbi54ICsgdGhpcy5fcGFuQm91bmRzLnJpZ2h0IC0gdGhpcy5fdHJhbnNmb3JtZWRQYW5Cb3VuZHMucmlnaHQsXG4gICAgICBzb3VyY2VQb3NpdGlvbi55ICsgdGhpcy5fcGFuQm91bmRzLmJvdHRvbSAtIHRoaXMuX3RyYW5zZm9ybWVkUGFuQm91bmRzLmJvdHRvbVxuICAgICk7XG5cbiAgICB0aGlzLmRlc3RpbmF0aW9uUG9zaXRpb24gPSBzY3JhdGNoQm91bmRzLmNsb3Nlc3RQb2ludFRvKCBkZXN0aW5hdGlvbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgZGVzdGluYXRpb24gc2NhbGUgZm9yIHRoZSB0YXJnZXQgbm9kZS4gSW4gYW5pbWF0aW9uLCB0YXJnZXQgbm9kZSB3aWxsIGJlIHJlcG9zaXRpb25lZCB1bnRpbCBzb3VyY2VcbiAgICogc2NhbGUgbWF0Y2hlcyBkZXN0aW5hdGlvbiBzY2FsZS5cbiAgICovXG4gIHByaXZhdGUgc2V0RGVzdGluYXRpb25TY2FsZSggc2NhbGU6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uU2NhbGUgPSB0aGlzLmxpbWl0U2NhbGUoIHNjYWxlICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSB0cmFuc2xhdGlvbiBzcGVlZCB0byBhbmltYXRlIGZyb20gb3VyIHNvdXJjZVBvc2l0aW9uIHRvIG91ciB0YXJnZXRQb3NpdGlvbi4gU3BlZWQgZ29lcyB0byB6ZXJvXG4gICAqIGFzIHRoZSB0cmFuc2xhdGlvbkRpc3RhbmNlIGdldHMgc21hbGxlciBmb3Igc21vb3RoIGFuaW1hdGlvbiBhcyB3ZSByZWFjaCBvdXIgZGVzdGluYXRpb24gcG9zaXRpb24uIFRoaXMgcmV0dXJuc1xuICAgKiBhIHNwZWVkIGluIHRoZSBjb29yZGluYXRlIGZyYW1lIG9mIHRoZSBwYXJlbnQgb2YgdGhpcyBsaXN0ZW5lcidzIHRhcmdldCBOb2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRUcmFuc2xhdGlvblNwZWVkKCB0cmFuc2xhdGlvbkRpc3RhbmNlOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFuc2xhdGlvbkRpc3RhbmNlID49IDAsICdkaXN0YW5jZSBmb3IgZ2V0VHJhbnNsYXRpb25TcGVlZCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgLy8gVGhlIGxhcmdlciB0aGUgc2NhbGUsIHRoYXQgZmFzdGVyIHdlIHdhbnQgdG8gdHJhbnNsYXRlIGJlY2F1c2UgdGhlIGRpc3RhbmNlcyBiZXR3ZWVuIHNvdXJjZSBhbmQgZGVzdGluYXRpb25cbiAgICAvLyBhcmUgc21hbGxlciB3aGVuIHpvb21lZCBpbi4gT3RoZXJ3aXNlLCBzcGVlZHMgd2lsbCBiZSBzbG93ZXIgd2hpbGUgem9vbWVkIGluLlxuICAgIGNvbnN0IHNjYWxlRGlzdGFuY2UgPSB0cmFuc2xhdGlvbkRpc3RhbmNlICogdGhpcy5nZXRDdXJyZW50U2NhbGUoKTtcblxuICAgIC8vIEEgbWF4aW11bSB0cmFuc2xhdGlvbiBmYWN0b3IgYXBwbGllZCB0byBkaXN0YW5jZSB0byBkZXRlcm1pbmUgYSByZWFzb25hYmxlIHNwZWVkLCBkZXRlcm1pbmVkIGJ5XG4gICAgLy8gaW5zcGVjdGlvbiBidXQgY291bGQgYmUgbW9kaWZpZWQuIFRoaXMgaW1wYWN0cyBob3cgbG9uZyB0aGUgXCJ0YWlsXCIgb2YgdHJhbnNsYXRpb24gaXMgYXMgd2UgYW5pbWF0ZS5cbiAgICAvLyBXaGlsZSB3ZSBhbmltYXRlIHRvIHRoZSBkZXN0aW5hdGlvbiBwb3NpdGlvbiB3ZSBtb3ZlIHF1aWNrbHkgZmFyIGF3YXkgZnJvbSB0aGUgZGVzdGluYXRpb24gYW5kIHNsb3cgZG93blxuICAgIC8vIGFzIHdlIGdldCBjbG9zZXIgdG8gdGhlIHRhcmdldC4gUmVkdWNlIHRoaXMgdmFsdWUgdG8gZXhhZ2dlcmF0ZSB0aGF0IGVmZmVjdCBhbmQgbW92ZSBtb3JlIHNsb3dseSBhcyB3ZVxuICAgIC8vIGdldCBjbG9zZXIgdG8gdGhlIGRlc3RpbmF0aW9uIHBvc2l0aW9uLlxuICAgIGNvbnN0IG1heFNjYWxlRmFjdG9yID0gNTtcblxuICAgIC8vIHNwZWVkIGZhbGxzIGF3YXkgZXhwb25lbnRpYWxseSBhcyB3ZSBnZXQgY2xvc2VyIHRvIG91ciBkZXN0aW5hdGlvbiBzbyB0aGF0IHdlIGFwcGVhciB0byBcInNsaWRlXCIgdG8gb3VyXG4gICAgLy8gZGVzdGluYXRpb24gd2hpY2ggbG9va3MgbmljZSwgYnV0IGFsc28gcHJldmVudHMgdXMgZnJvbSBhbmltYXRpbmcgZm9yIHRvbyBsb25nXG4gICAgY29uc3QgdHJhbnNsYXRpb25TcGVlZCA9IHNjYWxlRGlzdGFuY2UgKiAoIDEgLyAoIE1hdGgucG93KCBzY2FsZURpc3RhbmNlLCAyICkgLSBNYXRoLnBvdyggbWF4U2NhbGVGYWN0b3IsIDIgKSApICsgbWF4U2NhbGVGYWN0b3IgKTtcblxuICAgIC8vIHRyYW5zbGF0aW9uU3BlZWQgY291bGQgYmUgbmVnYXRpdmUgb3IgZ28gdG8gaW5maW5pdHkgZHVlIHRvIHRoZSBiZWhhdmlvciBvZiB0aGUgZXhwb25lbnRpYWwgY2FsY3VsYXRpb24gYWJvdmUuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIHNwZWVkIGlzIGNvbnN0cmFpbmVkIGFuZCBncmVhdGVyIHRoYW4gemVyby5cbiAgICBjb25zdCBsaW1pdGVkVHJhbnNsYXRpb25TcGVlZCA9IE1hdGgubWluKCBNYXRoLmFicyggdHJhbnNsYXRpb25TcGVlZCApLCBNQVhfVFJBTlNMQVRJT05fU1BFRUQgKiB0aGlzLmdldEN1cnJlbnRTY2FsZSgpICk7XG4gICAgcmV0dXJuIGxpbWl0ZWRUcmFuc2xhdGlvblNwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IGFsbCB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIHRhcmdldCBub2RlLCBhbmQgcmVzZXQgZGVzdGluYXRpb24gdGFyZ2V0cyB0byBzb3VyY2UgdmFsdWVzIHRvIHByZXZlbnQgYW55XG4gICAqIGluIHByb2dyZXNzIGFuaW1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldFRyYW5zZm9ybSgpOiB2b2lkIHtcbiAgICBzdXBlci5yZXNldFRyYW5zZm9ybSgpO1xuICAgIHRoaXMuc3RvcEluUHJvZ3Jlc3NBbmltYXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgZGlzY3JldGUgc2NhbGUgZnJvbSB0aGUgY3VycmVudCBzY2FsZS4gV2lsbCBiZSBvbmUgb2YgdGhlIHNjYWxlcyBhbG9uZyB0aGUgZGlzY3JldGVTY2FsZXMgbGlzdFxuICAgKiBhbmQgbGltaXRlZCBieSB0aGUgbWluIGFuZCBtYXggc2NhbGVzIGFzc2lnbmVkIHRvIHRoaXMgTXVsdGlQYW5ab29tTGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSB6b29tSW4gLSBkaXJlY3Rpb24gb2Ygem9vbSBjaGFuZ2UsIHBvc2l0aXZlIGlmIHpvb21pbmcgaW5cbiAgICogQHJldHVybnMgbnVtYmVyXG4gICAqL1xuICBwcml2YXRlIGdldE5leHREaXNjcmV0ZVNjYWxlKCB6b29tSW46IGJvb2xlYW4gKTogbnVtYmVyIHtcblxuICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHRoaXMuZ2V0Q3VycmVudFNjYWxlKCk7XG5cbiAgICBsZXQgbmVhcmVzdEluZGV4OiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgICBsZXQgZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmRpc2NyZXRlU2NhbGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5kaXNjcmV0ZVNjYWxlc1sgaSBdIC0gY3VycmVudFNjYWxlICk7XG4gICAgICBpZiAoIGRpc3RhbmNlIDwgZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSApIHtcbiAgICAgICAgZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSA9IGRpc3RhbmNlO1xuICAgICAgICBuZWFyZXN0SW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5lYXJlc3RJbmRleCA9IG5lYXJlc3RJbmRleCE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbmVhcmVzdEluZGV4ICE9PSBudWxsLCAnbmVhcmVzdEluZGV4IHNob3VsZCBoYXZlIGJlZW4gZm91bmQnICk7XG4gICAgbGV0IG5leHRJbmRleCA9IHpvb21JbiA/IG5lYXJlc3RJbmRleCArIDEgOiBuZWFyZXN0SW5kZXggLSAxO1xuICAgIG5leHRJbmRleCA9IFV0aWxzLmNsYW1wKCBuZXh0SW5kZXgsIDAsIHRoaXMuZGlzY3JldGVTY2FsZXMubGVuZ3RoIC0gMSApO1xuICAgIHJldHVybiB0aGlzLmRpc2NyZXRlU2NhbGVzWyBuZXh0SW5kZXggXTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyKCk7XG4gIH1cbn1cblxudHlwZSBLZXlQcmVzc09wdGlvbnMgPSB7XG5cbiAgLy8gbWFnbml0dWRlIGZvciB0cmFuc2xhdGlvbiB2ZWN0b3IgZm9yIHRoZSB0YXJnZXQgbm9kZSBhcyBsb25nIGFzIGFycm93IGtleXMgYXJlIGhlbGQgZG93blxuICB0cmFuc2xhdGlvbk1hZ25pdHVkZT86IG51bWJlcjtcbn07XG5cbi8qKlxuICogQSB0eXBlIHRoYXQgY29udGFpbnMgdGhlIGluZm9ybWF0aW9uIG5lZWRlZCB0byByZXNwb25kIHRvIGtleWJvYXJkIGlucHV0LlxuICovXG5jbGFzcyBLZXlQcmVzcyB7XG5cbiAgLy8gVGhlIHRyYW5zbGF0aW9uIGRlbHRhIHZlY3RvciB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZSB0byB0aGUga2V5IHByZXNzZXNcbiAgcHVibGljIHJlYWRvbmx5IHRyYW5zbGF0aW9uVmVjdG9yOiBWZWN0b3IyO1xuXG4gIC8vIFRoZSBzY2FsZSB0aGF0IHNob3VsZCBiZSBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgbm9kZSBpbiByZXNwb25zZSB0byB0aGUga2V5IHByZXNzXG4gIHB1YmxpYyByZWFkb25seSBzY2FsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ga2V5U3RhdGVUcmFja2VyXG4gICAqIEBwYXJhbSBzY2FsZVxuICAgKiBAcGFyYW0gdGFyZ2V0U2NhbGUgLSBzY2FsZSBkZXNjcmliaW5nIHRoZSB0YXJnZXROb2RlLCBzZWUgUGFuWm9vbUxpc3RlbmVyLl90YXJnZXRTY2FsZVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcigga2V5U3RhdGVUcmFja2VyOiBLZXlTdGF0ZVRyYWNrZXIsIHNjYWxlOiBudW1iZXIsIHRhcmdldFNjYWxlOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IEtleVByZXNzT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5UHJlc3NPcHRpb25zPigpKCB7XG4gICAgICB0cmFuc2xhdGlvbk1hZ25pdHVkZTogODBcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGRldGVybWluZSByZXN1bHRpbmcgdHJhbnNsYXRpb25cbiAgICBsZXQgeERpcmVjdGlvbiA9IDA7XG4gICAgeERpcmVjdGlvbiArPSBrZXlTdGF0ZVRyYWNrZXIuaXNLZXlEb3duKCBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVyApID8gMSA6IDA7XG4gICAgeERpcmVjdGlvbiAtPSBrZXlTdGF0ZVRyYWNrZXIuaXNLZXlEb3duKCBLZXlib2FyZFV0aWxzLktFWV9MRUZUX0FSUk9XICkgPyAxIDogMDtcblxuICAgIGxldCB5RGlyZWN0aW9uID0gMDtcbiAgICB5RGlyZWN0aW9uICs9IGtleVN0YXRlVHJhY2tlci5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1cgKSA/IDEgOiAwO1xuICAgIHlEaXJlY3Rpb24gLT0ga2V5U3RhdGVUcmFja2VyLmlzS2V5RG93biggS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1cgKSA/IDEgOiAwO1xuXG4gICAgLy8gZG9uJ3Qgc2V0IG1hZ25pdHVkZSBpZiB6ZXJvIHZlY3RvciAoYXMgdmVjdG9yIHdpbGwgYmVjb21lIGlsbC1kZWZpbmVkKVxuICAgIHNjcmF0Y2hUcmFuc2xhdGlvblZlY3Rvci5zZXRYWSggeERpcmVjdGlvbiwgeURpcmVjdGlvbiApO1xuICAgIGlmICggIXNjcmF0Y2hUcmFuc2xhdGlvblZlY3Rvci5lcXVhbHMoIFZlY3RvcjIuWkVSTyApICkge1xuICAgICAgY29uc3QgdHJhbnNsYXRpb25NYWduaXR1ZGUgPSBvcHRpb25zLnRyYW5zbGF0aW9uTWFnbml0dWRlICogdGFyZ2V0U2NhbGU7XG4gICAgICBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3Iuc2V0TWFnbml0dWRlKCB0cmFuc2xhdGlvbk1hZ25pdHVkZSApO1xuICAgIH1cblxuICAgIHRoaXMudHJhbnNsYXRpb25WZWN0b3IgPSBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3I7XG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGUgdGhlIHRhcmdldCBwb3NpdGlvbiBmb3Igc2NhbGluZyBmcm9tIGEga2V5IHByZXNzLiBUaGUgdGFyZ2V0IG5vZGUgd2lsbCBhcHBlYXIgdG8gZ2V0IGxhcmdlciBhbmQgem9vbVxuICAgKiBpbnRvIHRoaXMgcG9pbnQuIElmIGZvY3VzIGlzIHdpdGhpbiB0aGUgRGlzcGxheSwgd2Ugem9vbSBpbnRvIHRoZSBmb2N1c2VkIG5vZGUuIElmIG5vdCBhbmQgZm9jdXNhYmxlIGNvbnRlbnRcbiAgICogZXhpc3RzIGluIHRoZSBkaXNwbGF5LCB3ZSB6b29tIGludG8gdGhlIGZpcnN0IGZvY3VzYWJsZSBjb21wb25lbnQuIE90aGVyd2lzZSwgd2Ugem9vbSBpbnRvIHRoZSB0b3AgbGVmdCBjb3JuZXJcbiAgICogb2YgdGhlIHNjcmVlbi5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjb3VsZCBiZSBleHBlbnNpdmUsIHNvIHdlIG9ubHkgY2FsbCBpdCBpZiB3ZSBrbm93IHRoYXQgdGhlIGtleSBwcmVzcyBpcyBhIFwic2NhbGVcIiBnZXN0dXJlLlxuICAgKlxuICAgKiBAcmV0dXJucyBhIHNjcmF0Y2ggVmVjdG9yMiBpbnN0YW5jZSB3aXRoIHRoZSB0YXJnZXQgcG9zaXRpb25cbiAgICovXG4gIHB1YmxpYyBjb21wdXRlU2NhbGVUYXJnZXRGcm9tS2V5UHJlc3MoKTogVmVjdG9yMiB7XG5cbiAgICAvLyBkZWZhdWx0IGNhdXNlLCBzY2FsZSB0YXJnZXQgd2lsbCBiZSBvcmlnaW4gb2YgdGhlIHNjcmVlblxuICAgIHNjcmF0Y2hTY2FsZVRhcmdldFZlY3Rvci5zZXRYWSggMCwgMCApO1xuXG4gICAgLy8gem9vbSBpbnRvIHRoZSBmb2N1c2VkIE5vZGUgaWYgaXQgaGFzIGRlZmluZWQgYm91bmRzLCBpdCBtYXkgbm90IGlmIGl0IGlzIGZvciBjb250cm9sbGluZyB0aGVcbiAgICAvLyB2aXJ0dWFsIGN1cnNvciBhbmQgaGFzIGFuIGludmlzaWJsZSBmb2N1cyBoaWdobGlnaHRcbiAgICBjb25zdCBmb2N1cyA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZTtcbiAgICBpZiAoIGZvY3VzICkge1xuICAgICAgY29uc3QgZm9jdXNUcmFpbCA9IGZvY3VzLnRyYWlsO1xuICAgICAgY29uc3QgZm9jdXNlZE5vZGUgPSBmb2N1c1RyYWlsLmxhc3ROb2RlKCk7XG4gICAgICBpZiAoIGZvY3VzZWROb2RlLmJvdW5kcy5pc0Zpbml0ZSgpICkge1xuICAgICAgICBzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3Iuc2V0KCBmb2N1c1RyYWlsLnBhcmVudFRvR2xvYmFsUG9pbnQoIGZvY3VzZWROb2RlLmNlbnRlciApICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBubyBmb2N1c2FibGUgZWxlbWVudCBpbiB0aGUgRGlzcGxheSBzbyB0cnkgdG8gem9vbSBpbnRvIHRoZSBmaXJzdCBmb2N1c2FibGUgZWxlbWVudFxuICAgICAgY29uc3QgZmlyc3RGb2N1c2FibGUgPSBQRE9NVXRpbHMuZ2V0TmV4dEZvY3VzYWJsZSgpO1xuICAgICAgaWYgKCBmaXJzdEZvY3VzYWJsZSAhPT0gZG9jdW1lbnQuYm9keSApIHtcblxuICAgICAgICAvLyBpZiBub3QgdGhlIGJvZHksIGZvY3VzZWQgbm9kZSBzaG91bGQgYmUgY29udGFpbmVkIGJ5IHRoZSBib2R5IC0gZXJyb3IgbG91ZGx5IGlmIHRoZSBicm93c2VyIHJlcG9ydHNcbiAgICAgICAgLy8gdGhhdCB0aGlzIGlzIG5vdCB0aGUgY2FzZVxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb2N1bWVudC5ib2R5LmNvbnRhaW5zKCBmaXJzdEZvY3VzYWJsZSApLCAnZm9jdXNhYmxlIHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgYm9keScgKTtcblxuICAgICAgICAvLyBhc3N1bWVzIHRoYXQgZm9jdXNhYmxlIERPTSBlbGVtZW50cyBhcmUgY29ycmVjdGx5IHBvc2l0aW9uZWQsIHdoaWNoIHNob3VsZCBiZSB0aGUgY2FzZSAtIGFuIGFsdGVybmF0aXZlXG4gICAgICAgIC8vIGNvdWxkIGJlIHRvIHVzZSBEaXNwbGF0LmdldFRyYWlsRnJvbVBET01JbmRpY2VzU3RyaW5nKCksIGJ1dCB0aGF0IGZ1bmN0aW9uIHJlcXVpcmVzIGluZm9ybWF0aW9uIHRoYXQgaXMgbm90XG4gICAgICAgIC8vIGF2YWlsYWJsZSBoZXJlLlxuICAgICAgICBjb25zdCBjZW50ZXJYID0gZmlyc3RGb2N1c2FibGUub2Zmc2V0TGVmdCArIGZpcnN0Rm9jdXNhYmxlLm9mZnNldFdpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgY2VudGVyWSA9IGZpcnN0Rm9jdXNhYmxlLm9mZnNldFRvcCArIGZpcnN0Rm9jdXNhYmxlLm9mZnNldEhlaWdodCAvIDI7XG4gICAgICAgIHNjcmF0Y2hTY2FsZVRhcmdldFZlY3Rvci5zZXRYWSggY2VudGVyWCwgY2VudGVyWSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjcmF0Y2hTY2FsZVRhcmdldFZlY3Rvci5pc0Zpbml0ZSgpLCAndGFyZ2V0IHBvc2l0aW9uIG5vdCBkZWZpbmVkJyApO1xuICAgIHJldHVybiBzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3I7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHR5cGUgdGhhdCBjb250YWlucyB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHJlc3BvbmQgdG8gYSB3aGVlbCBpbnB1dC5cbiAqL1xuY2xhc3MgV2hlZWwge1xuXG4gIC8vIGlzIHRoZSBjdHJsIGtleSBkb3duIGR1cmluZyB0aGlzIHdoZWVsIGlucHV0PyBDYW5ub3QgdXNlIEtleVN0YXRlVHJhY2tlciBiZWNhdXNlIHRoZVxuICAvLyBjdHJsIGtleSBtaWdodCBiZSAnZG93bicgb24gdGhpcyBldmVudCB3aXRob3V0IGdvaW5nIHRocm91Z2ggdGhlIGtleWJvYXJkLiBGb3IgZXhhbXBsZSwgd2l0aCBhIHRyYWNrcGFkXG4gIC8vIHRoZSBicm93c2VyIHNldHMgY3RybEtleSB0cnVlIHdpdGggdGhlIHpvb20gZ2VzdHVyZS5cbiAgcHVibGljIHJlYWRvbmx5IGlzQ3RybEtleURvd246IGJvb2xlYW47XG5cbiAgLy8gbWFnbml0dWRlIGFuZCBkaXJlY3Rpb24gb2Ygc2NhbGUgY2hhbmdlIGZyb20gdGhlIHdoZWVsIGlucHV0XG4gIHB1YmxpYyByZWFkb25seSBzY2FsZURlbHRhOiBudW1iZXI7XG5cbiAgLy8gdGhlIHRhcmdldCBvZiB0aGUgd2hlZWwgaW5wdXQgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lXG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRQb2ludDogVmVjdG9yMjtcblxuICAvLyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGZvciB0aGUgdGFyZ2V0IG5vZGUgaW4gcmVzcG9uc2UgdG8gdGhlIHdoZWVsIGlucHV0XG4gIHB1YmxpYyByZWFkb25seSB0cmFuc2xhdGlvblZlY3RvcjogVmVjdG9yMjtcblxuICAvKipcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSB0YXJnZXRTY2FsZSAtIHNjYWxlIGRlc2NyaWJpbmcgdGhlIHRhcmdldE5vZGUsIHNlZSBQYW5ab29tTGlzdGVuZXIuX3RhcmdldFNjYWxlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGV2ZW50OiBTY2VuZXJ5RXZlbnQsIHRhcmdldFNjYWxlOiBudW1iZXIgKSB7XG4gICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudCBhcyBXaGVlbEV2ZW50O1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvbUV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudCwgJ1NjZW5lcnlFdmVudCBzaG91bGQgaGF2ZSBhIERPTUV2ZW50IGZyb20gdGhlIHdoZWVsIGlucHV0JyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuXG4gICAgdGhpcy5pc0N0cmxLZXlEb3duID0gZG9tRXZlbnQuY3RybEtleTtcbiAgICB0aGlzLnNjYWxlRGVsdGEgPSBkb21FdmVudC5kZWx0YVkgPiAwID8gLTAuNSA6IDAuNTtcbiAgICB0aGlzLnRhcmdldFBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludDtcblxuICAgIC8vIHRoZSBET00gRXZlbnQgc3BlY2lmaWVzIGRlbHRhcyB0aGF0IGxvb2sgYXBwcm9wcmlhdGUgYW5kIHdvcmtzIHdlbGwgaW4gZGlmZmVyZW50IGNhc2VzIGxpa2VcbiAgICAvLyBtb3VzZSB3aGVlbCBhbmQgdHJhY2twYWQgaW5wdXQsIGJvdGggd2hpY2ggdHJpZ2dlciB3aGVlbCBldmVudHMgYnV0IGF0IGRpZmZlcmVudCByYXRlcyB3aXRoIGRpZmZlcmVudFxuICAgIC8vIGRlbHRhIHZhbHVlcyAtIGJ1dCB0aGV5IGFyZSBnZW5lcmFsbHkgdG9vIGxhcmdlLCByZWR1Y2luZyBhIGJpdCBmZWVscyBtb3JlIG5hdHVyYWwgYW5kIGdpdmVzIG1vcmUgY29udHJvbFxuICAgIGxldCB0cmFuc2xhdGlvblggPSBkb21FdmVudC5kZWx0YVggKiAwLjU7XG4gICAgbGV0IHRyYW5zbGF0aW9uWSA9IGRvbUV2ZW50LmRlbHRhWSAqIDAuNTtcblxuICAgIC8vIEZpcmVGb3ggZGVmYXVsdHMgdG8gc2Nyb2xsaW5nIGluIHVuaXRzIG9mIFwibGluZXNcIiByYXRoZXIgdGhhbiBwaXhlbHMsIHJlc3VsdGluZyBpbiBzbG93IG1vdmVtZW50IC0gc3BlZWQgdXBcbiAgICAvLyB0cmFuc2xhdGlvbiBpbiB0aGlzIGNhc2VcbiAgICBpZiAoIGRvbUV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX0xJTkUgKSB7XG4gICAgICB0cmFuc2xhdGlvblggPSB0cmFuc2xhdGlvblggKiAyNTtcbiAgICAgIHRyYW5zbGF0aW9uWSA9IHRyYW5zbGF0aW9uWSAqIDI1O1xuICAgIH1cblxuICAgIC8vIFJvdGF0ZSB0aGUgdHJhbnNsYXRpb24gdmVjdG9yIGJ5IDkwIGRlZ3JlZXMgaWYgc2hpZnQgaXMgaGVsZC4gVGhpcyBpcyBhIGNvbW1vbiBiZWhhdmlvciBpbiBtYW55IGFwcGxpY2F0aW9ucyxcbiAgICAvLyBwYXJ0aWN1bGFybHkgaW4gQ2hyb21lLlxuICAgIGlmICggZG9tRXZlbnQuc2hpZnRLZXkgKSB7XG4gICAgICBbIHRyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZIF0gPSBbIHRyYW5zbGF0aW9uWSwgLXRyYW5zbGF0aW9uWCBdO1xuICAgIH1cblxuICAgIHRoaXMudHJhbnNsYXRpb25WZWN0b3IgPSBzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3Iuc2V0WFkoIHRyYW5zbGF0aW9uWCAqIHRhcmdldFNjYWxlLCB0cmFuc2xhdGlvblkgKiB0YXJnZXRTY2FsZSApO1xuICB9XG59XG5cbi8qKlxuICogQSBwcmVzcyBmcm9tIGEgbWlkZGxlIG1vdXNlIGJ1dHRvbi4gV2lsbCBpbml0aWF0ZSBwYW5uaW5nIGFuZCBkZXN0aW5hdGlvbiBwb3NpdGlvbiB3aWxsIGJlIHVwZGF0ZWQgZm9yIGFzIGxvbmdcbiAqIGFzIHRoZSBQb2ludGVyIHBvaW50IGlzIGRyYWdnZWQgYXdheSBmcm9tIHRoZSBpbml0aWFsIHBvaW50LlxuICovXG5jbGFzcyBNaWRkbGVQcmVzcyB7XG5cbiAgcHVibGljIHJlYWRvbmx5IHBvaW50ZXI6IE1vdXNlO1xuICBwdWJsaWMgcmVhZG9ubHkgdHJhaWw6IFRyYWlsO1xuXG4gIC8vIHBvaW50IG9mIHByZXNzIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxuICBwdWJsaWMgcmVhZG9ubHkgaW5pdGlhbFBvaW50OiBWZWN0b3IyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9pbnRlcjogTW91c2UsIHRyYWlsOiBUcmFpbCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludGVyLnR5cGUgPT09ICdtb3VzZScsICdpbmNvcnJlY3QgcG9pbnRlciB0eXBlJyApO1xuXG4gICAgdGhpcy5wb2ludGVyID0gcG9pbnRlcjtcbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XG5cbiAgICB0aGlzLmluaXRpYWxQb2ludCA9IHBvaW50ZXIucG9pbnQuY29weSgpO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uLCBjYWxjdWxhdGVzIGRpc2NyZXRlIHNjYWxlcyBiZXR3ZWVuIG1pbiBhbmQgbWF4IHNjYWxlIGxpbWl0cy4gQ3JlYXRlcyBpbmNyZWFzaW5nIHN0ZXAgc2l6ZXNcbiAqIHNvIHRoYXQgeW91IHpvb20gaW4gZnJvbSBoaWdoIHpvb20gcmVhY2hlcyB0aGUgbWF4IGZhc3RlciB3aXRoIGZld2VyIGtleSBwcmVzc2VzLiBUaGlzIGlzIHN0YW5kYXJkIGJlaGF2aW9yIGZvclxuICogYnJvd3NlciB6b29tLlxuICovXG5jb25zdCBjYWxjdWxhdGVEaXNjcmV0ZVNjYWxlcyA9ICggbWluU2NhbGU6IG51bWJlciwgbWF4U2NhbGU6IG51bWJlciApOiBudW1iZXJbXSA9PiB7XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggbWluU2NhbGUgPj0gMSwgJ21pbiBzY2FsZXMgbGVzcyB0aGFuIG9uZSBhcmUgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQnICk7XG5cbiAgLy8gd2lsbCB0YWtlIHRoaXMgbWFueSBrZXkgcHJlc3NlcyB0byByZWFjaCBtYXhpbXVtIHNjYWxlIGZyb20gbWluaW11bSBzY2FsZVxuICBjb25zdCBzdGVwcyA9IDg7XG5cbiAgLy8gYnJlYWsgdGhlIHJhbmdlIGZyb20gbWluIHRvIG1heCBzY2FsZSBpbnRvIHN0ZXBzLCB0aGVuIGV4cG9uZW50aWF0ZVxuICBjb25zdCBkaXNjcmV0ZVNjYWxlcyA9IFtdO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGVwczsgaSsrICkge1xuICAgIGRpc2NyZXRlU2NhbGVzWyBpIF0gPSAoIG1heFNjYWxlIC0gbWluU2NhbGUgKSAvIHN0ZXBzICogKCBpICogaSApO1xuICB9XG5cbiAgLy8gbm9ybWFsaXplIHN0ZXBzIGJhY2sgaW50byByYW5nZSBvZiB0aGUgbWluIGFuZCBtYXggc2NhbGUgZm9yIHRoaXMgbGlzdGVuZXJcbiAgY29uc3QgZGlzY3JldGVTY2FsZXNNYXggPSBkaXNjcmV0ZVNjYWxlc1sgc3RlcHMgLSAxIF07XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc2NyZXRlU2NhbGVzLmxlbmd0aDsgaSsrICkge1xuICAgIGRpc2NyZXRlU2NhbGVzWyBpIF0gPSBtaW5TY2FsZSArIGRpc2NyZXRlU2NhbGVzWyBpIF0gKiAoIG1heFNjYWxlIC0gbWluU2NhbGUgKSAvIGRpc2NyZXRlU2NhbGVzTWF4O1xuICB9XG5cbiAgcmV0dXJuIGRpc2NyZXRlU2NhbGVzO1xufTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0FuaW1hdGVkUGFuWm9vbUxpc3RlbmVyJywgQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXIgKTtcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJCb3VuZHMyIiwiTWF0cml4MyIsIlV0aWxzIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsInBsYXRmb3JtIiwiRXZlbnRUeXBlIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsIlBoZXRpb0FjdGlvbiIsIlRhbmRlbSIsIkV2ZW50SU8iLCJGb2N1c01hbmFnZXIiLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJJbnRlbnQiLCJLZXlib2FyZERyYWdMaXN0ZW5lciIsIktleWJvYXJkVXRpbHMiLCJLZXlib2FyZFpvb21VdGlscyIsIk1vdXNlIiwiUGFuWm9vbUxpc3RlbmVyIiwiUERPTVBvaW50ZXIiLCJQRE9NVXRpbHMiLCJQcmVzc0xpc3RlbmVyIiwic2NlbmVyeSIsIlRyYW5zZm9ybVRyYWNrZXIiLCJNT1ZFX0NVUlNPUiIsIk1BWF9TQ1JPTExfVkVMT0NJVFkiLCJNQVhfVFJBTlNMQVRJT05fU1BFRUQiLCJzY3JhdGNoVHJhbnNsYXRpb25WZWN0b3IiLCJzY3JhdGNoU2NhbGVUYXJnZXRWZWN0b3IiLCJzY3JhdGNoVmVsb2NpdHlWZWN0b3IiLCJzY3JhdGNoQm91bmRzIiwiQW5pbWF0ZWRQYW5ab29tTGlzdGVuZXIiLCJzdGVwIiwiZHQiLCJtaWRkbGVQcmVzcyIsImhhbmRsZU1pZGRsZVByZXNzIiwiX2F0dGFjaGVkUG9pbnRlcnMiLCJsZW5ndGgiLCJnZXRDdXJyZW50U2NhbGUiLCJmaWx0ZXIiLCJwb2ludGVyIiwiYXR0YWNoZWRMaXN0ZW5lciIsImFzc2VydCIsIl9kcmFnZ2luZ0luRHJhZ0JvdW5kcyIsInNvbWUiLCJyZXBvc2l0aW9uRHVyaW5nRHJhZyIsImFuaW1hdGVUb1RhcmdldHMiLCJkb3duIiwiZXZlbnQiLCJfZHJhZ0JvdW5kcyIsImhhc0ludGVudCIsIkRSQUciLCJjb250YWluc1BvaW50IiwicG9pbnQiLCJpbmNsdWRlcyIsInB1c2giLCJ0eXBlIiwibWlkZGxlRG93biIsIk1pZGRsZVByZXNzIiwidHJhaWwiLCJjdXJzb3IiLCJjYW5jZWxNaWRkbGVQcmVzcyIsInN0b3BJblByb2dyZXNzQW5pbWF0aW9uIiwibW92ZVByZXNzIiwicHJlc3MiLCJtb3ZlIiwiaGFzRHJhZ0ludGVudCIsImN1cnJlbnRUYXJnZXRFeGlzdHMiLCJjdXJyZW50VGFyZ2V0IiwiZ2V0VGFyZ2V0Tm9kZUR1cmluZ0RyYWciLCJhY3RpdmVMaXN0ZW5lciIsImxpc3RlbmVyIiwiYXR0YWNoZWRQcmVzc0xpc3RlbmVyIiwiaXNQcmVzc2VkIiwiZ2V0Q3VycmVudFRhcmdldCIsImdldEdsb2JhbEJvdW5kc1RvVmlld0R1cmluZ0RyYWciLCJnbG9iYWxCb3VuZHNUb1ZpZXciLCJjcmVhdGVQYW5UYXJnZXRCb3VuZHMiLCJ0YXJnZXQiLCJpbnN0YW5jZXMiLCJwYXJlbnRUb0dsb2JhbEJvdW5kcyIsInZpc2libGVCb3VuZHMiLCJnbG9iYWxCb3VuZHMiLCJ0YXJnZXROb2RlIiwia2VlcEJvdW5kc0luVmlldyIsImxpbWl0UGFuRGlyZWN0aW9uIiwiY2FuY2VsUGFubmluZ0R1cmluZ0RyYWciLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJ1cCIsIndoZWVsIiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJXaGVlbCIsIl90YXJnZXRTY2FsZSIsInJlcG9zaXRpb25Gcm9tV2hlZWwiLCJwb3AiLCJ3aW5kb3dLZXlkb3duIiwiZG9tRXZlbnQiLCJzaW1HbG9iYWwiLCJfIiwiZ2V0Iiwid2luZG93IiwiZGlzcGxheSIsIl9hY2Nlc3NpYmxlIiwicGRvbVJvb3RFbGVtZW50IiwiY29udGFpbnMiLCJoYW5kbGVab29tQ29tbWFuZHMiLCJpc0Fycm93S2V5Iiwia2V5UHJlc3MiLCJLZXlQcmVzcyIsInJlcG9zaXRpb25Gcm9tS2V5cyIsImtleWRvd24iLCJLZXlib2FyZEV2ZW50Iiwia2V5Ym9hcmREcmFnSW50ZW50IiwiS0VZQk9BUkRfRFJBRyIsImhhbmRsZUZvY3VzQ2hhbmdlIiwiZm9jdXMiLCJwcmV2aW91c0ZvY3VzIiwiX3RyYW5zZm9ybVRyYWNrZXIiLCJkaXNwb3NlIiwibGFzdE5vZGUiLCJmb2N1c1BhblRhcmdldEJvdW5kc1Byb3BlcnR5IiwicHJldmlvdXNCb3VuZHNQcm9wZXJ0eSIsIl9mb2N1c0JvdW5kc0xpc3RlbmVyIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJ0cmFpbFRvVHJhY2siLCJjb250YWluc05vZGUiLCJfdGFyZ2V0Tm9kZSIsImluZGV4T2ZUYXJnZXQiLCJub2RlcyIsImluZGV4T2ZMZWFmIiwic2xpY2UiLCJmb2N1c01vdmVtZW50TGlzdGVuZXIiLCJsb2NhbEJvdW5kcyIsInZhbHVlIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImFkZExpc3RlbmVyIiwibGluayIsImtlZXBUcmFpbEluVmlldyIsInpvb21JbkNvbW1hbmREb3duIiwiaXNab29tQ29tbWFuZCIsInpvb21PdXRDb21tYW5kRG93biIsInByZXZlbnREZWZhdWx0IiwibmV4dFNjYWxlIiwiZ2V0TmV4dERpc2NyZXRlU2NhbGUiLCJpc1pvb21SZXNldENvbW1hbmQiLCJyZXNldFRyYW5zZm9ybSIsImhhbmRsZUdlc3R1cmVTdGFydEV2ZW50IiwiZ2VzdHVyZVN0YXJ0QWN0aW9uIiwiZXhlY3V0ZSIsImhhbmRsZUdlc3R1cmVDaGFuZ2VFdmVudCIsImdlc3R1cmVDaGFuZ2VBY3Rpb24iLCJzb3VyY2VQb3NpdGlvbiIsImN1cnJlbnRQb2ludCIsImdsb2JhbERlbHRhIiwibWludXMiLCJpbml0aWFsUG9pbnQiLCJyZWR1Y2VkTWFnbml0dWRlIiwibWFnbml0dWRlIiwic2V0TWFnbml0dWRlIiwiTWF0aCIsIm1pbiIsInNldERlc3RpbmF0aW9uUG9zaXRpb24iLCJwbHVzIiwidHJhbnNsYXRlU2NhbGVUb1RhcmdldCIsImdsb2JhbFBvaW50Iiwic2NhbGVEZWx0YSIsInBvaW50SW5Mb2NhbEZyYW1lIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9pbnRJblBhcmVudEZyYW1lIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsImZyb21Mb2NhbFBvaW50IiwidHJhbnNsYXRpb24iLCJ4IiwieSIsInRvVGFyZ2V0UG9pbnQiLCJsaW1pdFNjYWxlIiwic2NhbGVNYXRyaXgiLCJ0aW1lc01hdHJpeCIsInNjYWxpbmciLCJtYXRyaXhQcm9wZXJ0eSIsInNldCIsImNvcnJlY3RSZXBvc2l0aW9uIiwic2V0VHJhbnNsYXRpb25TY2FsZVRvVGFyZ2V0Iiwic2NhbGUiLCJ0cmFuc2xhdGVEZWx0YSIsImRlbHRhVmVjdG9yIiwidGFyZ2V0UG9pbnQiLCJfcGFuQm91bmRzIiwiY2VudGVyIiwic291cmNlUG9pbnQiLCJ0cmFuc2xhdGVUb1RhcmdldCIsInNpbmdsZUluaXRpYWxQb2ludCIsInNpbmdsZVRhcmdldFBvaW50IiwiZGVsdGEiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJnZXRNYXRyaXgiLCJuZXdTY2FsZSIsImN1cnJlbnRTY2FsZSIsInNldERlc3RpbmF0aW9uU2NhbGUiLCJzY2FsZUdlc3R1cmVUYXJnZXRQb3NpdGlvbiIsImNvbXB1dGVTY2FsZVRhcmdldEZyb21LZXlQcmVzcyIsInRyYW5zbGF0aW9uVmVjdG9yIiwiZXF1YWxzIiwiWkVSTyIsIldoZWVsRXZlbnQiLCJpc0N0cmxLZXlEb3duIiwiaXNGaW5pdGUiLCJfdHJhbnNmb3JtZWRQYW5Cb3VuZHMiLCJ0cmFuc2Zvcm1lZCIsIm1hdHJpeCIsImludmVydGVkIiwic291cmNlU2NhbGUiLCJhZGRQcmVzcyIsInJlbW92ZVByZXNzIiwiX3ByZXNzZXMiLCJpbnRlcnJ1cHQiLCJjYW5jZWwiLCJwYW5Ub05vZGUiLCJub2RlIiwicGFuVG9DZW50ZXIiLCJwYW5EaXJlY3Rpb24iLCJib3VuZHNJblRhcmdldEZyYW1lIiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsInRyYW5zbGF0aW9uRGVsdGEiLCJkaXN0YW5jZVRvTGVmdEVkZ2UiLCJkaXN0YW5jZVRvUmlnaHRFZGdlIiwiZGlzdGFuY2VUb1RvcEVkZ2UiLCJkaXN0YW5jZVRvQm90dG9tRWRnZSIsImNlbnRlclgiLCJjZW50ZXJZIiwid2lkdGgiLCJoZWlnaHQiLCJwYWRkaW5nRGVsdGEiLCJtYXRyaXhTY2FsZSIsInBhZGRpbmdEZWx0YVNjYWxlZCIsImxlZnQiLCJyaWdodCIsInRvcCIsImJvdHRvbSIsImJvdW5kcyIsImNvbnRhaW5zQm91bmRzIiwiYm91bmRzRmluaXRlIiwiZGVzdGluYXRpb25Qb3NpdGlvbiIsInBvc2l0aW9uRGlydHkiLCJlcXVhbHNFcHNpbG9uIiwic2NhbGVEaXJ0eSIsImRlc3RpbmF0aW9uU2NhbGUiLCJhbmltYXRpbmdQcm9wZXJ0eSIsInRyYW5zbGF0aW9uRGlmZmVyZW5jZSIsInRyYW5zbGF0aW9uRGlyZWN0aW9uIiwibm9ybWFsaXplZCIsInRyYW5zbGF0aW9uU3BlZWQiLCJnZXRUcmFuc2xhdGlvblNwZWVkIiwic2V0WFkiLCJjb21wb25lbnRNYWduaXR1ZGUiLCJtdWx0aXBseVNjYWxhciIsImNvbXBvbmVudFRpbWVzIiwic2NhbGVEaWZmZXJlbmNlIiwiYWJzIiwiaW5pdGlhbGl6ZVBvc2l0aW9ucyIsInNldFBhbkJvdW5kcyIsImVyb2RlZFhZIiwiaGFzTm9uemVyb0FyZWEiLCJzZXRUYXJnZXRCb3VuZHMiLCJ0YXJnZXRCb3VuZHMiLCJkZXN0aW5hdGlvbiIsInNldE1pbk1heCIsImNsb3Nlc3RQb2ludFRvIiwidHJhbnNsYXRpb25EaXN0YW5jZSIsInNjYWxlRGlzdGFuY2UiLCJtYXhTY2FsZUZhY3RvciIsInBvdyIsImxpbWl0ZWRUcmFuc2xhdGlvblNwZWVkIiwiem9vbUluIiwibmVhcmVzdEluZGV4IiwiZGlzdGFuY2VUb0N1cnJlbnRTY2FsZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiaSIsImRpc2NyZXRlU2NhbGVzIiwiZGlzdGFuY2UiLCJuZXh0SW5kZXgiLCJjbGFtcCIsImRpc3Bvc2VBbmltYXRlZFBhblpvb21MaXN0ZW5lciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRyYWNrcGFkR2VzdHVyZVN0YXJ0U2NhbGUiLCJjYWxjdWxhdGVEaXNjcmV0ZVNjYWxlcyIsIl9taW5TY2FsZSIsIl9tYXhTY2FsZSIsImJvdW5kR2VzdHVyZVN0YXJ0TGlzdGVuZXIiLCJib3VuZEdlc3R1cmVDaGFuZ2VMaXN0ZW5lciIsInBhZ2VYIiwicGFnZVkiLCJwaGV0aW9QbGF5YmFjayIsImNyZWF0ZVRhbmRlbSIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwic2FmYXJpIiwibW9iaWxlU2FmYXJpIiwiYmluZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJrZXlkb3duRW1pdHRlciIsImRpc3BsYXlGb2N1c0xpc3RlbmVyIiwicGRvbUZvY3VzUHJvcGVydHkiLCJzb3VyY2VGcmFtZVBhbkJvdW5kc1Byb3BlcnR5IiwibGF6eUxpbmsiLCJwaGV0aW9EZXBlbmRlbmNpZXMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZm9jdXNUcmFpbCIsImZvY3VzZWROb2RlIiwicGFyZW50VG9HbG9iYWxQb2ludCIsImZpcnN0Rm9jdXNhYmxlIiwiZ2V0TmV4dEZvY3VzYWJsZSIsImRvY3VtZW50IiwiYm9keSIsIm9mZnNldExlZnQiLCJvZmZzZXRXaWR0aCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsImtleVN0YXRlVHJhY2tlciIsInRhcmdldFNjYWxlIiwidHJhbnNsYXRpb25NYWduaXR1ZGUiLCJ4RGlyZWN0aW9uIiwiaXNLZXlEb3duIiwiS0VZX1JJR0hUX0FSUk9XIiwiS0VZX0xFRlRfQVJST1ciLCJ5RGlyZWN0aW9uIiwiS0VZX0RPV05fQVJST1ciLCJLRVlfVVBfQVJST1ciLCJjdHJsS2V5IiwiZGVsdGFZIiwidHJhbnNsYXRpb25YIiwiZGVsdGFYIiwidHJhbnNsYXRpb25ZIiwiZGVsdGFNb2RlIiwiRE9NX0RFTFRBX0xJTkUiLCJzaGlmdEtleSIsImNvcHkiLCJtaW5TY2FsZSIsIm1heFNjYWxlIiwic3RlcHMiLCJkaXNjcmV0ZVNjYWxlc01heCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUVsRSxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxlQUFxQyxxQ0FBcUM7QUFDakYsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0MsZUFBZSxr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