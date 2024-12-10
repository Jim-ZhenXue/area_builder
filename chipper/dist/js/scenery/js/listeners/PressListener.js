// Copyright 2017-2024, University of Colorado Boulder
/**
 * Listens to presses (down events), attaching a listener to the pointer when one occurs, so that a release (up/cancel
 * or interruption) can be recorded.
 *
 * This is the base type for both DragListener and FireListener, which contains the shared logic that would be needed
 * by both.
 *
 * PressListener is fine to use directly, particularly when drag-coordinate information is needed (e.g. DragListener),
 * or if the interaction is more complicated than a simple button fire (e.g. FireListener).
 *
 * For example usage, see scenery/examples/input.html. Additionally, a typical "simple" PressListener direct usage
 * would be something like:
 *
 *   someNode.addInputListener( new PressListener( {
 *     press: () => { ... },
 *     release: () => { ... }
 *   } ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import { Mouse, Node, scenery, SceneryEvent } from '../imports.js';
// global
let globalID = 0;
// Factor out to reduce memory footprint, see https://github.com/phetsims/tandem/issues/71
const truePredicate = _.constant(true);
const isPressedListener = (listener)=>listener.isPressed;
let PressListener = class PressListener extends EnabledComponent {
    /**
   * Whether this listener is currently activated with a press.
   */ get isPressed() {
        return this.isPressedProperty.value;
    }
    get cursor() {
        return this.cursorProperty.value;
    }
    get attach() {
        return this._attach;
    }
    get targetNode() {
        return this._targetNode;
    }
    /**
   * The main node that this listener is responsible for dragging.
   */ getCurrentTarget() {
        assert && assert(this.isPressed, 'We have no currentTarget if we are not pressed');
        return this.pressedTrail.lastNode();
    }
    get currentTarget() {
        return this.getCurrentTarget();
    }
    /**
   * Returns whether a press can be started with a particular event.
   */ canPress(event) {
        return !!this.enabledProperty.value && !this.isPressed && this._canStartPress(event, this) && // Only let presses be started with the correct mouse button.
        // @ts-expect-error Typed SceneryEvent
        (!(event.pointer instanceof Mouse) || event.domEvent.button === this._mouseButton) && // We can't attach to a pointer that is already attached.
        (!this._attach || !event.pointer.isAttached());
    }
    /**
   * Returns whether this PressListener can be clicked from keyboard input. This copies part of canPress, but
   * we didn't want to use canClick in canPress because canClick could be overridden in subtypes.
   */ canClick() {
        // If this listener is already involved in pressing something (or our options predicate returns false) we can't
        // press something.
        return this.enabledProperty.value && !this.isPressed && this._canStartPress(null, this);
    }
    /**
   * Moves the listener to the 'pressed' state if possible (attaches listeners and initializes press-related
   * properties).
   *
   * This can be overridden (with super-calls) when custom press behavior is needed for a type.
   *
   * This can be called by outside clients in order to try to begin a process (generally on an already-pressed
   * pointer), and is useful if a 'drag' needs to change between listeners. Use canPress( event ) to determine if
   * a press can be started (if needed beforehand).
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   * @returns success - Returns whether the press was actually started
   */ press(event, targetNode, callback) {
        assert && assert(event, 'An event is required');
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} press`);
        if (!this.canPress(event)) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} could not press`);
            return false;
        }
        // Flush out a pending drag, so it happens before we press
        this.flushCollapsedDrag();
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} successful press`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this._pressAction.execute(event, targetNode || null, callback || null); // cannot pass undefined into execute call
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        return true;
    }
    /**
   * Releases a pressed listener.
   *
   * This can be overridden (with super-calls) when custom release behavior is needed for a type.
   *
   * This can be called from the outside to release the press without the pointer having actually fired any 'up'
   * events. If the cancel/interrupt behavior is more preferable, call interrupt() on this listener instead.
   *
   * @param [event] - scenery event if there was one. We can't guarantee an event, in part to support interrupting.
   * @param [callback] - called at the end of the release
   */ release(event, callback) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} release`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // Flush out a pending drag, so it happens before we release
        this.flushCollapsedDrag();
        this._releaseAction.execute(event || null, callback || null); // cannot pass undefined to execute call
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called when move events are fired on the attached pointer listener.
   *
   * This can be overridden (with super-calls) when custom drag behavior is needed for a type.
   *
   * (scenery-internal, effectively protected)
   */ drag(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} drag`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // If we got interrupted while events were queued up, we MAY get a drag when not pressed. We can ignore this.
        if (!this.isPressed) {
            return;
        }
        this._dragListener(event, this);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Interrupts the listener, releasing it (canceling behavior).
   *
   * This effectively releases/ends the press, and sets the `interrupted` flag to true while firing these events
   * so that code can determine whether a release/end happened naturally, or was canceled in some way.
   *
   * This can be called manually, but can also be called through node.interruptSubtreeInput().
   */ interrupt() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} interrupt`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // handle pdom interrupt
        if (this.pdomClickingProperty.value) {
            this.interrupted = true;
            // it is possible we are interrupting a click with a pointer press, in which case
            // we are listening to the Pointer listener - do a full release in this case
            if (this._listeningToPointer) {
                this.release();
            } else {
                // release on interrupt (without going through onRelease, which handles mouse/touch specific things)
                this.isPressedProperty.value = false;
                this._releaseListener(null, this);
            }
            // clear the clicking timer, specific to pdom input
            // @ts-expect-error TODO: This looks buggy, will need to ignore for now https://github.com/phetsims/scenery/issues/1581
            if (stepTimer.hasListener(this._pdomClickingTimeoutListener)) {
                // @ts-expect-error TODO: This looks buggy, will need to ignore for now https://github.com/phetsims/scenery/issues/1581
                stepTimer.clearTimeout(this._pdomClickingTimeoutListener);
                // interrupt may be called after the PressListener has been disposed (for instance, internally by scenery
                // if the Node receives a blur event after the PressListener is disposed)
                if (!this.pdomClickingProperty.isDisposed) {
                    this.pdomClickingProperty.value = false;
                }
            }
        } else if (this.isPressed) {
            // handle pointer interrupt
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} interrupting`);
            this.interrupted = true;
            this.release();
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * This should be called when the listened "Node" is effectively removed from the scene graph AND
   * expected to be placed back in such that it could potentially get multiple "enter" events, see
   * https://github.com/phetsims/scenery/issues/1021
   *
   * This will clear the list of pointers considered "over" the Node, so that when it is placed back in, the state
   * will be correct, and another "enter" event will not be missing an "exit".
   */ clearOverPointers() {
        this.overPointers.clear(); // We have listeners that will trigger the proper refreshes
    }
    /**
   * If collapseDragEvents is set to true, this step() should be called every frame so that the collapsed drag
   * can be fired.
   */ step() {
        this.flushCollapsedDrag();
    }
    /**
   * Set the callback that will create a Bounds2 in the global coordinate frame for the AnimatedPanZoomListener to
   * keep in view during a drag operation. During drag input the AnimatedPanZoomListener will pan the screen to
   * try and keep the returned Bounds2 visible. By default, the AnimatedPanZoomListener will try to keep the target of
   * the drag in view but that may not always work if the target is not associated with the translated Node, the target
   * is not defined, or the target has bounds that do not accurately surround the graphic you want to keep in view.
   */ setCreatePanTargetBounds(createDragPanTargetBounds) {
        // Forwarded to the pointerListener so that the AnimatedPanZoomListener can get this callback from the attached
        // listener
        this._pointerListener.createPanTargetBounds = createDragPanTargetBounds;
    }
    set createPanTargetBounds(createDragPanTargetBounds) {
        this.setCreatePanTargetBounds(createDragPanTargetBounds);
    }
    /**
   * A convenient way to create and set the callback that will return a Bounds2 in the global coordinate frame for the
   * AnimatedPanZoomListener to keep in view during a drag operation. The AnimatedPanZoomListener will try to keep the
   * bounds of the last Node of the provided trail visible by panning the screen during a drag operation. See
   * setCreatePanTargetBounds() for more documentation.
   */ setCreatePanTargetBoundsFromTrail(trail) {
        assert && assert(trail.length > 0, 'trail has no Nodes to provide localBounds');
        this.setCreatePanTargetBounds(()=>trail.localToGlobalBounds(trail.lastNode().localBounds));
    }
    set createPanTargetBoundsFromTrail(trail) {
        this.setCreatePanTargetBoundsFromTrail(trail);
    }
    /**
   * If there is a pending collapsed drag waiting, we'll fire that drag (usually before other events or during a step)
   */ flushCollapsedDrag() {
        if (this._pendingCollapsedDragEvent) {
            this.drag(this._pendingCollapsedDragEvent);
        }
        this._pendingCollapsedDragEvent = null;
    }
    /**
   * Recomputes the value for isOverProperty. Separate to reduce anonymous function closures.
   */ invalidateOver() {
        let pointerAttachedToOther = false;
        if (this._listeningToPointer) {
            // this pointer listener is attached to the pointer
            pointerAttachedToOther = false;
        } else {
            // a listener other than this one is attached to the pointer so it should not be considered over
            for(let i = 0; i < this.overPointers.length; i++){
                if (this.overPointers.get(i).isAttached()) {
                    pointerAttachedToOther = true;
                    break;
                }
            }
        }
        // isOverProperty is only for the `over` event, looksOverProperty includes focused pressListeners (only when the
        // display is showing focus highlights)
        this.isOverProperty.value = this.overPointers.length > 0 && !pointerAttachedToOther;
        this.looksOverProperty.value = this.isOverProperty.value || this.isFocusedProperty.value && !!this.display && this.display.focusManager.pdomFocusHighlightsVisibleProperty.value;
    }
    /**
   * Recomputes the value for isHoveringProperty. Separate to reduce anonymous function closures.
   */ invalidateHovering() {
        for(let i = 0; i < this.overPointers.length; i++){
            const pointer = this.overPointers[i];
            if (!pointer.isDown || pointer === this.pointer) {
                this.isHoveringProperty.value = true;
                return;
            }
        }
        this.isHoveringProperty.value = false;
    }
    /**
   * Recomputes the value for isHighlightedProperty. Separate to reduce anonymous function closures.
   */ invalidateHighlighted() {
        this.isHighlightedProperty.value = this.isHoveringProperty.value || this.isPressedProperty.value;
    }
    /**
   * Fired when the enabledProperty changes
   */ onEnabledPropertyChange(enabled) {
        !enabled && this.interrupt();
    }
    /**
   * Internal code executed as the first step of a press.
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   */ onPress(event, targetNode, callback) {
        assert && assert(!this.isDisposed, 'Should not press on a disposed listener');
        const givenTargetNode = targetNode || this._targetNode;
        // Set this properties before the property change, so they are visible to listeners.
        this.pointer = event.pointer;
        this.pressedTrail = givenTargetNode ? givenTargetNode.getUniqueTrail() : event.trail.subtrailTo(event.currentTarget, false);
        this.interrupted = false; // clears the flag (don't set to false before here)
        this.pointer.addInputListener(this._pointerListener, this._attach);
        this._listeningToPointer = true;
        this.pointer.cursor = this.pressedTrail.lastNode().getEffectiveCursor() || this._pressCursor;
        this.isPressedProperty.value = true;
        // Notify after everything else is set up
        this._pressListener(event, this);
        callback && callback();
    }
    /**
   * Internal code executed as the first step of a release.
   *
   * @param event - scenery event if there was one
   * @param [callback] - called at the end of the release
   */ onRelease(event, callback) {
        assert && assert(this.isPressed, 'This listener is not pressed');
        const pressedListener = this;
        pressedListener.pointer.removeInputListener(this._pointerListener);
        this._listeningToPointer = false;
        // Set the pressed state false *before* invoking the callback, otherwise an infinite loop can result in some
        // circumstances.
        this.isPressedProperty.value = false;
        // Notify after the rest of release is called in order to prevent it from triggering interrupt().
        this._releaseListener(event, this);
        callback && callback();
        // These properties are cleared now, at the end of the onRelease, in case they were needed by the callback or in
        // listeners on the pressed Property.
        pressedListener.pointer.cursor = null;
        this.pointer = null;
        this.pressedTrail = null;
    }
    /**
   * Called with 'down' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly. See the press method instead.
   */ down(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} down`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.press(event);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'up' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ up(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} up`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // Recalculate over/hovering Properties.
        this.invalidateOver();
        this.invalidateHovering();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'enter' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ enter(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} enter`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.overPointers.push(event.pointer);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with `move` events (part of the listener API). It is necessary to check for `over` state changes on move
   * in case a pointer listener gets interrupted and resumes movement over a target. (scenery-internal)
   */ move(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} move`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.invalidateOver();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'exit' events (part of the listener API). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ exit(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} exit`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // NOTE: We don't require the pointer to be included here, since we may have added the listener after the 'enter'
        // was fired. See https://github.com/phetsims/area-model-common/issues/159 for more details.
        if (this.overPointers.includes(event.pointer)) {
            this.overPointers.remove(event.pointer);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'up' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ pointerUp(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer up`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
        // still pressed by the time we get here. If not pressed, then there is nothing to do.
        // See https://github.com/phetsims/capacitor-lab-basics/issues/251
        if (this.isPressed) {
            assert && assert(event.pointer === this.pointer);
            this.release(event);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'cancel' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ pointerCancel(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer cancel`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
        // still pressed by the time we get here. If not pressed, then there is nothing to do.
        // See https://github.com/phetsims/capacitor-lab-basics/issues/251
        if (this.isPressed) {
            assert && assert(event.pointer === this.pointer);
            this.interrupt(); // will mark as interrupted and release()
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called with 'move' events from the pointer (part of the listener API) (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ pointerMove(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer move`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // Since our callback can get queued up and THEN interrupted before this happens, we'll check to make sure we are
        // still pressed by the time we get here. If not pressed, then there is nothing to do.
        // See https://github.com/phetsims/capacitor-lab-basics/issues/251
        if (this.isPressed) {
            assert && assert(event.pointer === this.pointer);
            if (this._collapseDragEvents) {
                this._pendingCollapsedDragEvent = event;
            } else {
                this.drag(event);
            }
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Called when the pointer needs to interrupt its current listener (usually so another can be added). (scenery-internal)
   *
   * NOTE: Do not call directly.
   */ pointerInterrupt() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} pointer interrupt`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.interrupt();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Click listener, called when this is treated as an accessible input listener.
   * In general not needed to be public, but just used in edge cases to get proper click logic for pdom.
   *
   * Handle the click event from DOM for PDOM. Clicks by calling press and release immediately.
   * When assistive technology is used, the browser may not receive 'keydown' or 'keyup' events on input elements, but
   * only a single 'click' event. We need to toggle the pressed state from the single 'click' event.
   *
   * This will fire listeners immediately, but adds a delay for the pdomClickingProperty so that you can make a
   * button look pressed from a single DOM click event. For example usage, see sun/ButtonModel.looksPressedProperty.
   *
   * @param event
   * @param [callback] optionally called immediately after press, but only on successful click
   * @returns success - Returns whether the press was actually started
   */ click(event, callback) {
        if (this.canClick()) {
            this.interrupted = false; // clears the flag (don't set to false before here)
            this.pdomClickingProperty.value = true;
            // ensure that button is 'focused' so listener can be called while button is down
            this.isFocusedProperty.value = true;
            this.isPressedProperty.value = true;
            // fire the optional callback
            // @ts-expect-error
            this._pressListener(event, this);
            callback && callback();
            // no longer down, don't reset 'over' so button can be styled as long as it has focus
            this.isPressedProperty.value = false;
            // fire the callback from options
            this._releaseListener(event, this);
            // if we are already clicking, remove the previous timeout - this assumes that clearTimeout is a noop if the
            // listener is no longer attached
            // @ts-expect-error TODO: This looks buggy, will need to ignore for now https://github.com/phetsims/scenery/issues/1581
            stepTimer.clearTimeout(this._pdomClickingTimeoutListener);
            // Now add the timeout back to start over, saving so that it can be removed later. Even when this listener was
            // interrupted from above logic, we still delay setting this to false to support visual "pressing" redraw.
            // @ts-expect-error TODO: This looks buggy, will need to ignore for now https://github.com/phetsims/scenery/issues/1581
            this._pdomClickingTimeoutListener = stepTimer.setTimeout(()=>{
                // the listener may have been disposed before the end of a11yLooksPressedInterval, like if it fires and
                // disposes itself immediately
                if (!this.pdomClickingProperty.isDisposed) {
                    this.pdomClickingProperty.value = false;
                }
            }, this._a11yLooksPressedInterval);
        }
        return true;
    }
    /**
   * Focus listener, called when this is treated as an accessible input listener and its target is focused. (scenery-internal)
   * @pdom
   */ focus(event) {
        // Get the Display related to this accessible event.
        const accessibleDisplays = event.trail.rootNode().getRootedDisplays().filter((display)=>display.isAccessible());
        assert && assert(accessibleDisplays.length === 1, 'cannot focus node with zero or multiple accessible displays attached');
        //
        this.display = accessibleDisplays[0];
        if (!this.display.focusManager.pdomFocusHighlightsVisibleProperty.hasListener(this.boundInvalidateOverListener)) {
            this.display.focusManager.pdomFocusHighlightsVisibleProperty.link(this.boundInvalidateOverListener);
        }
        // On focus, button should look 'over'.
        this.isFocusedProperty.value = true;
    }
    /**
   * Blur listener, called when this is treated as an accessible input listener.
   * @pdom
   */ blur() {
        if (this.display) {
            if (this.display.focusManager.pdomFocusHighlightsVisibleProperty.hasListener(this.boundInvalidateOverListener)) {
                this.display.focusManager.pdomFocusHighlightsVisibleProperty.unlink(this.boundInvalidateOverListener);
            }
            this.display = null;
        }
        // On blur, the button should no longer look 'over'.
        this.isFocusedProperty.value = false;
    }
    /**
   * Disposes the listener, releasing references. It should not be used after this.
   */ dispose() {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} dispose`);
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // We need to release references to any pointers that are over us.
        this.overPointers.clear();
        if (this._listeningToPointer && isPressedListener(this)) {
            this.pointer.removeInputListener(this._pointerListener);
        }
        // These Properties could have already been disposed, for example in the sun button hierarchy, see https://github.com/phetsims/sun/issues/372
        if (!this.isPressedProperty.isDisposed) {
            this.isPressedProperty.unlink(this._isHighlightedListener);
            this.isPressedProperty.unlink(this._isHoveringListener);
        }
        !this.isHoveringProperty.isDisposed && this.isHoveringProperty.unlink(this._isHighlightedListener);
        this._pressAction.dispose();
        this._releaseAction.dispose();
        this.looksPressedProperty.dispose();
        this.pdomClickingProperty.dispose();
        this.cursorProperty.dispose();
        this.isFocusedProperty.dispose();
        this.isHighlightedProperty.dispose();
        this.isHoveringProperty.dispose();
        this.looksOverProperty.dispose();
        this.isOverProperty.dispose();
        this.isPressedProperty.dispose();
        this.overPointers.dispose();
        // Remove references to the stored display, if we have any.
        if (this.display) {
            this.display.focusManager.pdomFocusHighlightsVisibleProperty.unlink(this.boundInvalidateOverListener);
            this.display = null;
        }
        super.dispose();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    constructor(providedOptions){
        const options = optionize()({
            press: _.noop,
            release: _.noop,
            targetNode: null,
            drag: _.noop,
            attach: true,
            mouseButton: 0,
            pressCursor: 'pointer',
            useInputListenerCursor: false,
            canStartPress: truePredicate,
            a11yLooksPressedInterval: 100,
            collapseDragEvents: false,
            // EnabledComponent
            // By default, PressListener does not have an instrumented enabledProperty, but you can opt in with this option.
            phetioEnabledPropertyInstrumented: false,
            // phet-io (EnabledComponent)
            // For PhET-iO instrumentation. If only using the PressListener for hover behavior, there is no need to
            // instrument because events are only added to the data stream for press/release and not for hover events. Please pass
            // Tandem.OPT_OUT as the tandem option to not instrument an instance.
            tandem: Tandem.REQUIRED,
            phetioReadOnly: true,
            phetioFeatured: PhetioObject.DEFAULT_OPTIONS.phetioFeatured
        }, providedOptions);
        assert && assert(typeof options.mouseButton === 'number' && options.mouseButton >= 0 && options.mouseButton % 1 === 0, 'mouseButton should be a non-negative integer');
        assert && assert(options.pressCursor === null || typeof options.pressCursor === 'string', 'pressCursor should either be a string or null');
        assert && assert(typeof options.press === 'function', 'The press callback should be a function');
        assert && assert(typeof options.release === 'function', 'The release callback should be a function');
        assert && assert(typeof options.drag === 'function', 'The drag callback should be a function');
        assert && assert(options.targetNode === null || options.targetNode instanceof Node, 'If provided, targetNode should be a Node');
        assert && assert(typeof options.attach === 'boolean', 'attach should be a boolean');
        assert && assert(typeof options.a11yLooksPressedInterval === 'number', 'a11yLooksPressedInterval should be a number');
        super(options);
        this._id = globalID++;
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`PressListener#${this._id} construction`);
        this._mouseButton = options.mouseButton;
        this._a11yLooksPressedInterval = options.a11yLooksPressedInterval;
        this._pressCursor = options.pressCursor;
        this._pressListener = options.press;
        this._releaseListener = options.release;
        this._dragListener = options.drag;
        this._canStartPress = options.canStartPress;
        this._targetNode = options.targetNode;
        this._attach = options.attach;
        this._collapseDragEvents = options.collapseDragEvents;
        this.overPointers = createObservableArray();
        this.isPressedProperty = new BooleanProperty(false, {
            reentrant: true
        });
        this.isOverProperty = new BooleanProperty(false);
        this.looksOverProperty = new BooleanProperty(false);
        this.isHoveringProperty = new BooleanProperty(false);
        this.isHighlightedProperty = new BooleanProperty(false);
        this.isFocusedProperty = new BooleanProperty(false);
        this.cursorProperty = new DerivedProperty([
            this.enabledProperty
        ], (enabled)=>{
            if (options.useInputListenerCursor && enabled && this._attach) {
                return this._pressCursor;
            } else {
                return null;
            }
        });
        this.pointer = null;
        this.pressedTrail = null;
        this.interrupted = false;
        this._pendingCollapsedDragEvent = null;
        this._listeningToPointer = false;
        this._isHoveringListener = this.invalidateHovering.bind(this);
        this._isHighlightedListener = this.invalidateHighlighted.bind(this);
        this.pdomClickingProperty = new BooleanProperty(false);
        this.looksPressedProperty = DerivedProperty.or([
            this.pdomClickingProperty,
            this.isPressedProperty
        ]);
        this._pdomClickingTimeoutListener = null;
        this._pointerListener = {
            up: this.pointerUp.bind(this),
            cancel: this.pointerCancel.bind(this),
            move: this.pointerMove.bind(this),
            interrupt: this.pointerInterrupt.bind(this),
            listener: this
        };
        this._pressAction = new PhetioAction(this.onPress.bind(this), {
            tandem: options.tandem.createTandem('pressAction'),
            phetioDocumentation: 'Executes whenever a press occurs. The first argument when executing can be ' + 'used to convey info about the SceneryEvent.',
            phetioReadOnly: true,
            phetioFeatured: options.phetioFeatured,
            phetioEventType: EventType.USER,
            parameters: [
                {
                    name: 'event',
                    phetioType: SceneryEvent.SceneryEventIO
                },
                {
                    phetioPrivate: true,
                    valueType: [
                        Node,
                        null
                    ]
                },
                {
                    phetioPrivate: true,
                    valueType: [
                        'function',
                        null
                    ]
                }
            ]
        });
        this._releaseAction = new PhetioAction(this.onRelease.bind(this), {
            parameters: [
                {
                    name: 'event',
                    phetioType: NullableIO(SceneryEvent.SceneryEventIO)
                },
                {
                    phetioPrivate: true,
                    valueType: [
                        'function',
                        null
                    ]
                }
            ],
            // phet-io
            tandem: options.tandem.createTandem('releaseAction'),
            phetioDocumentation: 'Executes whenever a release occurs.',
            phetioReadOnly: true,
            phetioFeatured: options.phetioFeatured,
            phetioEventType: EventType.USER
        });
        this.display = null;
        this.boundInvalidateOverListener = this.invalidateOver.bind(this);
        // update isOverProperty (not a DerivedProperty because we need to hook to passed-in properties)
        this.overPointers.lengthProperty.link(this.invalidateOver.bind(this));
        this.isFocusedProperty.link(this.invalidateOver.bind(this));
        // update isHoveringProperty (not a DerivedProperty because we need to hook to passed-in properties)
        this.overPointers.lengthProperty.link(this._isHoveringListener);
        this.isPressedProperty.link(this._isHoveringListener);
        // Update isHovering when any pointer's isDownProperty changes.
        // NOTE: overPointers is cleared on dispose, which should remove all of these (interior) listeners)
        this.overPointers.addItemAddedListener((pointer)=>pointer.isDownProperty.link(this._isHoveringListener));
        this.overPointers.addItemRemovedListener((pointer)=>pointer.isDownProperty.unlink(this._isHoveringListener));
        // update isHighlightedProperty (not a DerivedProperty because we need to hook to passed-in properties)
        this.isHoveringProperty.link(this._isHighlightedListener);
        this.isPressedProperty.link(this._isHighlightedListener);
        this.enabledProperty.lazyLink(this.onEnabledPropertyChange.bind(this));
    }
};
PressListener.phetioAPI = {
    pressAction: {
        phetioType: PhetioAction.PhetioActionIO([
            SceneryEvent.SceneryEventIO
        ])
    },
    releaseAction: {
        phetioType: PhetioAction.PhetioActionIO([
            NullableIO(SceneryEvent.SceneryEventIO)
        ])
    }
};
export { PressListener as default };
scenery.register('PressListener', PressListener);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL1ByZXNzTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTGlzdGVucyB0byBwcmVzc2VzIChkb3duIGV2ZW50cyksIGF0dGFjaGluZyBhIGxpc3RlbmVyIHRvIHRoZSBwb2ludGVyIHdoZW4gb25lIG9jY3Vycywgc28gdGhhdCBhIHJlbGVhc2UgKHVwL2NhbmNlbFxuICogb3IgaW50ZXJydXB0aW9uKSBjYW4gYmUgcmVjb3JkZWQuXG4gKlxuICogVGhpcyBpcyB0aGUgYmFzZSB0eXBlIGZvciBib3RoIERyYWdMaXN0ZW5lciBhbmQgRmlyZUxpc3RlbmVyLCB3aGljaCBjb250YWlucyB0aGUgc2hhcmVkIGxvZ2ljIHRoYXQgd291bGQgYmUgbmVlZGVkXG4gKiBieSBib3RoLlxuICpcbiAqIFByZXNzTGlzdGVuZXIgaXMgZmluZSB0byB1c2UgZGlyZWN0bHksIHBhcnRpY3VsYXJseSB3aGVuIGRyYWctY29vcmRpbmF0ZSBpbmZvcm1hdGlvbiBpcyBuZWVkZWQgKGUuZy4gRHJhZ0xpc3RlbmVyKSxcbiAqIG9yIGlmIHRoZSBpbnRlcmFjdGlvbiBpcyBtb3JlIGNvbXBsaWNhdGVkIHRoYW4gYSBzaW1wbGUgYnV0dG9uIGZpcmUgKGUuZy4gRmlyZUxpc3RlbmVyKS5cbiAqXG4gKiBGb3IgZXhhbXBsZSB1c2FnZSwgc2VlIHNjZW5lcnkvZXhhbXBsZXMvaW5wdXQuaHRtbC4gQWRkaXRpb25hbGx5LCBhIHR5cGljYWwgXCJzaW1wbGVcIiBQcmVzc0xpc3RlbmVyIGRpcmVjdCB1c2FnZVxuICogd291bGQgYmUgc29tZXRoaW5nIGxpa2U6XG4gKlxuICogICBzb21lTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICogICAgIHByZXNzOiAoKSA9PiB7IC4uLiB9LFxuICogICAgIHJlbGVhc2U6ICgpID0+IHsgLi4uIH1cbiAqICAgfSApICk7XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSwgeyBPYnNlcnZhYmxlQXJyYXkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBFbmFibGVkQ29tcG9uZW50LCB7IEVuYWJsZWRDb21wb25lbnRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9FbmFibGVkQ29tcG9uZW50LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgV2l0aG91dE51bGwgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhvdXROdWxsLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgUGhldGlvQWN0aW9uIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24uanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBNb3VzZSwgTm9kZSwgUG9pbnRlciwgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBUSW5wdXRMaXN0ZW5lciwgVHJhaWwgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gZ2xvYmFsXG5sZXQgZ2xvYmFsSUQgPSAwO1xuXG4vLyBGYWN0b3Igb3V0IHRvIHJlZHVjZSBtZW1vcnkgZm9vdHByaW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvNzFcbmNvbnN0IHRydWVQcmVkaWNhdGU6ICggKCAuLi5hcmdzOiBJbnRlbnRpb25hbEFueVtdICkgPT4gdHJ1ZSApID0gXy5jb25zdGFudCggdHJ1ZSApO1xuXG4vLyBHZW5lcmFsIHR5cGUgb2YgY2FsbGJhY2sgc3RydWN0dXJlIHNoYXJlZCBieSBtYW55IHNjZW5lcnkgaW5wdXQtbGlzdGVuZXJzXG5leHBvcnQgdHlwZSBTY2VuZXJ5TGlzdGVuZXJDYWxsYmFjazxMaXN0ZW5lciwgRG9tRXZlbnRUeXBlcyBleHRlbmRzIEV2ZW50PiA9ICggZXZlbnQ6IFNjZW5lcnlFdmVudDxEb21FdmVudFR5cGVzPiwgbGlzdGVuZXI6IExpc3RlbmVyICkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFNjZW5lcnlMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIsIERvbUV2ZW50VHlwZXMgZXh0ZW5kcyBFdmVudD4gPSAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8RG9tRXZlbnRUeXBlcz4gfCBudWxsLCBsaXN0ZW5lcjogTGlzdGVuZXIgKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSBQcmVzc0xpc3RlbmVyRE9NRXZlbnQgPSBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudCB8IEZvY3VzRXZlbnQgfCBLZXlib2FyZEV2ZW50O1xuZXhwb3J0IHR5cGUgUHJlc3NMaXN0ZW5lckV2ZW50ID0gU2NlbmVyeUV2ZW50PFByZXNzTGlzdGVuZXJET01FdmVudD47XG5leHBvcnQgdHlwZSBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyPiA9IFNjZW5lcnlMaXN0ZW5lckNhbGxiYWNrPExpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRE9NRXZlbnQ+O1xuZXhwb3J0IHR5cGUgUHJlc3NMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIgZXh0ZW5kcyBQcmVzc0xpc3RlbmVyPiA9IFNjZW5lcnlMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8TGlzdGVuZXIsIFByZXNzTGlzdGVuZXJET01FdmVudD47XG5leHBvcnQgdHlwZSBQcmVzc0xpc3RlbmVyQ2FuU3RhcnRQcmVzc0NhbGxiYWNrPExpc3RlbmVyIGV4dGVuZHMgUHJlc3NMaXN0ZW5lcj4gPSAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgfCBudWxsLCBsaXN0ZW5lcjogTGlzdGVuZXIgKSA9PiBib29sZWFuO1xuXG50eXBlIFNlbGZPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgUHJlc3NMaXN0ZW5lcj4gPSB7XG4gIC8vIENhbGxlZCB3aGVuIHRoaXMgbGlzdGVuZXIgaXMgcHJlc3NlZCAodHlwaWNhbGx5IGZyb20gYSBkb3duIGV2ZW50LCBidXQgY2FuIGJlIHRyaWdnZXJlZCBieSBvdGhlciBoYW5kbGVycylcbiAgcHJlc3M/OiBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8TGlzdGVuZXI+O1xuXG4gIC8vIENhbGxlZCB3aGVuIHRoaXMgbGlzdGVuZXIgaXMgcmVsZWFzZWQuIE5vdGUgdGhhdCBhbiBTY2VuZXJ5RXZlbnQgYXJnIGNhbm5vdCBiZSBndWFyYW50ZWVkIGZyb20gdGhpcyBsaXN0ZW5lci4gVGhpc1xuICAvLyBpcywgaW4gcGFydCwgdG8gc3VwcG9ydCBpbnRlcnJ1cHQuIChwb2ludGVyIHVwL2NhbmNlbCBvciBpbnRlcnJ1cHQgd2hlbiBwcmVzc2VkL2FmdGVyIGNsaWNrIGZyb20gdGhlIHBkb20pLlxuICAvLyBOT1RFOiBUaGlzIHdpbGwgYWxzbyBiZSBjYWxsZWQgaWYgdGhlIHByZXNzIGlzIFwicmVsZWFzZWRcIiBkdWUgdG8gYmVpbmcgaW50ZXJydXB0ZWQgb3IgY2FuY2VsZWQuXG4gIHJlbGVhc2U/OiBQcmVzc0xpc3RlbmVyTnVsbGFibGVDYWxsYmFjazxMaXN0ZW5lcj47XG5cbiAgLy8gQ2FsbGVkIHdoZW4gdGhpcyBsaXN0ZW5lciBpcyBkcmFnZ2VkIChtb3ZlIGV2ZW50cyBvbiB0aGUgcG9pbnRlciB3aGlsZSBwcmVzc2VkKVxuICBkcmFnPzogUHJlc3NMaXN0ZW5lckNhbGxiYWNrPExpc3RlbmVyPjtcblxuICAvLyBJZiBwcm92aWRlZCwgdGhlIHByZXNzZWRUcmFpbCAoY2FsY3VsYXRlZCBmcm9tIHRoZSBkb3duIGV2ZW50KSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggdGhlIChzdWIpdHJhaWwgdGhhdCBlbmRzIHdpdGhcbiAgLy8gdGhlIHRhcmdldE5vZGUgYXMgdGhlIGxlYWYtbW9zdCBOb2RlLiBUaGlzIGFmZmVjdHMgdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIGNvbXB1dGF0aW9ucy5cbiAgLy8gVGhpcyBpcyBpZGVhbGx5IHVzZWQgd2hlbiB0aGUgTm9kZSB3aGljaCBoYXMgdGhpcyBpbnB1dCBsaXN0ZW5lciBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgTm9kZSBiZWluZyB0cmFuc2Zvcm1lZCxcbiAgLy8gYXMgb3RoZXJ3aXNlIG9mZnNldHMgYW5kIGRyYWcgYmVoYXZpb3Igd291bGQgYmUgaW5jb3JyZWN0IGJ5IGRlZmF1bHQuXG4gIHRhcmdldE5vZGU/OiBOb2RlIHwgbnVsbDtcblxuICAvLyBJZiB0cnVlLCB0aGlzIGxpc3RlbmVyIHdpbGwgbm90IFwicHJlc3NcIiB3aGlsZSB0aGUgYXNzb2NpYXRlZCBwb2ludGVyIGlzIGF0dGFjaGVkLCBhbmQgd2hlbiBwcmVzc2VkLFxuICAvLyB3aWxsIG1hcmsgaXRzZWxmIGFzIGF0dGFjaGVkIHRvIHRoZSBwb2ludGVyLiBJZiB0aGlzIGxpc3RlbmVyIHNob3VsZCBub3QgYmUgaW50ZXJydXB0ZWQgYnkgb3RoZXJzIGFuZCBpc24ndFxuICAvLyBhIFwicHJpbWFyeVwiIGhhbmRsZXIgb2YgdGhlIHBvaW50ZXIncyBiZWhhdmlvciwgdGhpcyBzaG91bGQgYmUgc2V0IHRvIGZhbHNlLlxuICBhdHRhY2g/OiBib29sZWFuO1xuXG4gIC8vIFJlc3RyaWN0cyB0byB0aGUgc3BlY2lmaWMgbW91c2UgYnV0dG9uIChidXQgYWxsb3dzIGFueSB0b3VjaCkuIE9ubHkgb25lIG1vdXNlIGJ1dHRvbiBpcyBhbGxvd2VkIGF0XG4gIC8vIGEgdGltZS4gVGhlIGJ1dHRvbiBudW1iZXJzIGFyZSBkZWZpbmVkIGluIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50L2J1dHRvbixcbiAgLy8gd2hlcmUgdHlwaWNhbGx5OlxuICAvLyAgIDA6IExlZnQgbW91c2UgYnV0dG9uXG4gIC8vICAgMTogTWlkZGxlIG1vdXNlIGJ1dHRvbiAob3Igd2hlZWwgcHJlc3MpXG4gIC8vICAgMjogUmlnaHQgbW91c2UgYnV0dG9uXG4gIC8vICAgMys6IG90aGVyIHNwZWNpZmljIG51bWJlcmVkIGJ1dHRvbnMgdGhhdCBhcmUgbW9yZSByYXJlXG4gIG1vdXNlQnV0dG9uPzogbnVtYmVyO1xuXG4gIC8vIElmIHRoZSB0YXJnZXROb2RlL2N1cnJlbnRUYXJnZXQgZG9uJ3QgaGF2ZSBhIGN1c3RvbSBjdXJzb3IsIHRoaXMgd2lsbCBzZXQgdGhlIHBvaW50ZXIgY3Vyc29yIHRvXG4gIC8vIHRoaXMgdmFsdWUgd2hlbiB0aGlzIGxpc3RlbmVyIGlzIFwicHJlc3NlZFwiLiBUaGlzIG1lYW5zIHRoYXQgZXZlbiB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvdXQgb2YgdGhlIG5vZGUgYWZ0ZXJcbiAgLy8gcHJlc3NpbmcgZG93biwgaXQgd2lsbCBzdGlsbCBoYXZlIHRoaXMgY3Vyc29yIChvdmVycmlkaW5nIHRoZSBjdXJzb3Igb2Ygd2hhdGV2ZXIgbm9kZXMgdGhlIHBvaW50ZXIgbWF5IGJlXG4gIC8vIG92ZXIpLlxuICBwcmVzc0N1cnNvcj86IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gV2hlbiB0cnVlLCBhbnkgbm9kZSB0aGlzIGxpc3RlbmVyIGlzIGFkZGVkIHRvIHdpbGwgdXNlIHRoaXMgbGlzdGVuZXIncyBjdXJzb3IgKHNlZSBvcHRpb25zLnByZXNzQ3Vyc29yKVxuICAvLyBhcyB0aGUgY3Vyc29yIGZvciB0aGF0IG5vZGUuIFRoaXMgb25seSBhcHBsaWVzIGlmIHRoZSBub2RlJ3MgY3Vyc29yIGlzIG51bGwsIHNlZSBOb2RlLmdldEVmZmVjdGl2ZUN1cnNvcigpLlxuICB1c2VJbnB1dExpc3RlbmVyQ3Vyc29yPzogYm9vbGVhbjtcblxuICAvLyBDaGVja3MgdGhpcyB3aGVuIHRyeWluZyB0byBzdGFydCBhIHByZXNzLiBJZiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgZmFsc2UsIGEgcHJlc3Mgd2lsbCBub3QgYmUgc3RhcnRlZFxuICBjYW5TdGFydFByZXNzPzogUHJlc3NMaXN0ZW5lckNhblN0YXJ0UHJlc3NDYWxsYmFjazxMaXN0ZW5lcj47XG5cbiAgLy8gKGExMXkpIC0gSG93IGxvbmcgc29tZXRoaW5nIHNob3VsZCAnbG9vaycgcHJlc3NlZCBhZnRlciBhbiBhY2Nlc3NpYmxlIGNsaWNrIGlucHV0IGV2ZW50LCBpbiBtc1xuICBhMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWw/OiBudW1iZXI7XG5cbiAgLy8gSWYgdHJ1ZSwgbXVsdGlwbGUgZHJhZyBldmVudHMgaW4gYSByb3cgKGJldHdlZW4gc3RlcHMpIHdpbGwgYmUgY29sbGFwc2VkIGludG8gb25lIGRyYWcgZXZlbnRcbiAgLy8gKHVzdWFsbHkgZm9yIHBlcmZvcm1hbmNlKSBieSBqdXN0IGNhbGxpbmcgdGhlIGNhbGxiYWNrcyBmb3IgdGhlIGxhc3QgZHJhZyBldmVudC4gT3RoZXIgZXZlbnRzIChwcmVzcy9yZWxlYXNlXG4gIC8vIGhhbmRsaW5nKSB3aWxsIGZvcmNlIHRocm91Z2ggdGhlIGxhc3QgcGVuZGluZyBkcmFnIGV2ZW50LiBDYWxsaW5nIHN0ZXAoKSBldmVyeSBmcmFtZSB3aWxsIHRoZW4gYmUgZ2VuZXJhbGx5XG4gIC8vIG5lY2Vzc2FyeSB0byBoYXZlIGFjY3VyYXRlLWxvb2tpbmcgZHJhZ3MuIE5PVEUgdGhhdCB0aGlzIG1heSBwdXQgaW4gZXZlbnRzIG91dC1vZi1vcmRlci5cbiAgLy8gVGhpcyBpcyBhcHByb3ByaWF0ZSB3aGVuIHRoZSBkcmFnIG9wZXJhdGlvbiBpcyBleHBlbnNpdmUgcGVyZm9ybWFuY2Utd2lzZSBBTkQgaWRlYWxseSBzaG91bGQgb25seSBiZSBydW4gYXRcbiAgLy8gbW9zdCBvbmNlIHBlciBmcmFtZSAoYW55IG1vcmUsIGFuZCBpdCB3b3VsZCBiZSBhIHdhc3RlKS5cbiAgY29sbGFwc2VEcmFnRXZlbnRzPzogYm9vbGVhbjtcblxuICAvLyBUaG91Z2ggUHJlc3NMaXN0ZW5lciBpcyBub3QgaW5zdHJ1bWVudGVkLCBkZWNsYXJlIHRoZXNlIGhlcmUgdG8gc3VwcG9ydCBwcm9wZXJseSBwYXNzaW5nIHRoaXMgdG8gY2hpbGRyZW4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy82MC5cbiAgLy8gUHJlc3NMaXN0ZW5lciBieSBkZWZhdWx0IGRvZXNuJ3QgYWxsb3cgUGhFVC1pTyB0byB0cmlnZ2VyIHByZXNzL3JlbGVhc2UgQWN0aW9uIGV2ZW50c1xuICBwaGV0aW9SZWFkT25seT86IGJvb2xlYW47XG4gIHBoZXRpb0ZlYXR1cmVkPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFByZXNzTGlzdGVuZXJPcHRpb25zPExpc3RlbmVyIGV4dGVuZHMgUHJlc3NMaXN0ZW5lciA9IFByZXNzTGlzdGVuZXI+ID0gU2VsZk9wdGlvbnM8TGlzdGVuZXI+ICYgRW5hYmxlZENvbXBvbmVudE9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFByZXNzZWRQcmVzc0xpc3RlbmVyID0gV2l0aG91dE51bGw8UHJlc3NMaXN0ZW5lciwgJ3BvaW50ZXInIHwgJ3ByZXNzZWRUcmFpbCc+O1xuY29uc3QgaXNQcmVzc2VkTGlzdGVuZXIgPSAoIGxpc3RlbmVyOiBQcmVzc0xpc3RlbmVyICk6IGxpc3RlbmVyIGlzIFByZXNzZWRQcmVzc0xpc3RlbmVyID0+IGxpc3RlbmVyLmlzUHJlc3NlZDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlc3NMaXN0ZW5lciBleHRlbmRzIEVuYWJsZWRDb21wb25lbnQgaW1wbGVtZW50cyBUSW5wdXRMaXN0ZW5lciB7XG5cbiAgLy8gVW5pcXVlIGdsb2JhbCBJRCBmb3IgdGhpcyBsaXN0ZW5lclxuICBwcml2YXRlIF9pZDogbnVtYmVyO1xuXG4gIHByaXZhdGUgX21vdXNlQnV0dG9uOiBudW1iZXI7XG4gIHByaXZhdGUgX2ExMXlMb29rc1ByZXNzZWRJbnRlcnZhbDogbnVtYmVyO1xuXG4gIHByaXZhdGUgX3ByZXNzQ3Vyc29yOiBzdHJpbmcgfCBudWxsO1xuXG4gIHByaXZhdGUgX3ByZXNzTGlzdGVuZXI6IFByZXNzTGlzdGVuZXJDYWxsYmFjazxQcmVzc0xpc3RlbmVyPjtcbiAgcHJpdmF0ZSBfcmVsZWFzZUxpc3RlbmVyOiBQcmVzc0xpc3RlbmVyTnVsbGFibGVDYWxsYmFjazxQcmVzc0xpc3RlbmVyPjtcbiAgcHJpdmF0ZSBfZHJhZ0xpc3RlbmVyOiBQcmVzc0xpc3RlbmVyQ2FsbGJhY2s8UHJlc3NMaXN0ZW5lcj47XG4gIHByaXZhdGUgX2NhblN0YXJ0UHJlc3M6IFByZXNzTGlzdGVuZXJDYW5TdGFydFByZXNzQ2FsbGJhY2s8UHJlc3NMaXN0ZW5lcj47XG5cbiAgcHJpdmF0ZSBfdGFyZ2V0Tm9kZTogTm9kZSB8IG51bGw7XG5cbiAgcHJpdmF0ZSBfYXR0YWNoOiBib29sZWFuO1xuICBwcml2YXRlIF9jb2xsYXBzZURyYWdFdmVudHM6IGJvb2xlYW47XG5cbiAgLy8gQ29udGFpbnMgYWxsIHBvaW50ZXJzIHRoYXQgYXJlIG92ZXIgb3VyIGJ1dHRvbi4gVHJhY2tlZCBieSBhZGRpbmcgd2l0aCAnZW50ZXInIGV2ZW50cyBhbmQgcmVtb3Zpbmcgd2l0aCAnZXhpdCdcbiAgLy8gZXZlbnRzLlxuICBwdWJsaWMgcmVhZG9ubHkgb3ZlclBvaW50ZXJzOiBPYnNlcnZhYmxlQXJyYXk8UG9pbnRlcj47XG5cbiAgLy8gKHJlYWQtb25seSkgLSBUcmFja3Mgd2hldGhlciB0aGlzIGxpc3RlbmVyIGlzIFwicHJlc3NlZFwiIG9yIG5vdC5cbiAgcHVibGljIHJlYWRvbmx5IGlzUHJlc3NlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gKHJlYWQtb25seSkgLSBJdCB3aWxsIGJlIHNldCB0byB0cnVlIHdoZW4gYXQgbGVhc3Qgb25lIHBvaW50ZXIgaXMgb3ZlciB0aGUgbGlzdGVuZXIuXG4gIC8vIFRoaXMgaXMgbm90IGVmZmVjdGVkIGJ5IFBET00gZm9jdXMuXG4gIHB1YmxpYyByZWFkb25seSBpc092ZXJQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIChyZWFkLW9ubHkpIC0gVHJ1ZSB3aGVuIGVpdGhlciBpc092ZXJQcm9wZXJ0eSBpcyB0cnVlLCBvciB3aGVuIGZvY3VzZWQgYW5kIHRoZVxuICAvLyByZWxhdGVkIERpc3BsYXkgaXMgc2hvd2luZyBpdHMgZm9jdXNIaWdobGlnaHRzLCBzZWUgdGhpcy52YWxpZGF0ZU92ZXIoKSBmb3IgZGV0YWlscy5cbiAgcHVibGljIHJlYWRvbmx5IGxvb2tzT3ZlclByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gKHJlYWQtb25seSkgLSBJdCB3aWxsIGJlIHNldCB0byB0cnVlIHdoZW4gZWl0aGVyOlxuICAvLyAgIDEuIFRoZSBsaXN0ZW5lciBpcyBwcmVzc2VkIGFuZCB0aGUgcG9pbnRlciB0aGF0IGlzIHByZXNzaW5nIGlzIG92ZXIgdGhlIGxpc3RlbmVyLlxuICAvLyAgIDIuIFRoZXJlIGlzIGF0IGxlYXN0IG9uZSB1bnByZXNzZWQgcG9pbnRlciB0aGF0IGlzIG92ZXIgdGhlIGxpc3RlbmVyLlxuICBwdWJsaWMgcmVhZG9ubHkgaXNIb3ZlcmluZ1Byb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gKHJlYWQtb25seSkgLSBJdCB3aWxsIGJlIHNldCB0byB0cnVlIHdoZW4gZWl0aGVyOlxuICAvLyAgIDEuIFRoZSBsaXN0ZW5lciBpcyBwcmVzc2VkLlxuICAvLyAgIDIuIFRoZXJlIGlzIGF0IGxlYXN0IG9uZSB1bnByZXNzZWQgcG9pbnRlciB0aGF0IGlzIG92ZXIgdGhlIGxpc3RlbmVyLlxuICAvLyBUaGlzIGlzIGVzc2VudGlhbGx5IHRydWUgd2hlbiAoIGlzUHJlc3NlZCB8fCBpc0hvdmVyaW5nICkuXG4gIHB1YmxpYyByZWFkb25seSBpc0hpZ2hsaWdodGVkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyAocmVhZC1vbmx5KSAtIFdoZXRoZXIgdGhlIGxpc3RlbmVyIGhhcyBmb2N1cyAoc2hvdWxkIGFwcGVhciB0byBiZSBvdmVyKVxuICBwdWJsaWMgcmVhZG9ubHkgaXNGb2N1c2VkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICBwcml2YXRlIHJlYWRvbmx5IGN1cnNvclByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmcgfCBudWxsPjtcblxuICAvLyAocmVhZC1vbmx5KSAtIFRoZSBjdXJyZW50IHBvaW50ZXIsIG9yIG51bGwgd2hlbiBub3QgcHJlc3NlZC4gVGhlcmUgY2FuIGJlIHNob3J0IHBlcmlvZHMgb2ZcbiAgLy8gdGltZSB3aGVuIHRoaXMgaGFzIGEgdmFsdWUgd2hlbiBpc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSBpcyBmYWxzZSwgc3VjaCBhcyBkdXJpbmcgdGhlIHByb2Nlc3Npbmcgb2YgYSBwb2ludGVyXG4gIC8vIHJlbGVhc2UsIGJ1dCB0aGVzZSBwZXJpb2RzIHNob3VsZCBiZSB2ZXJ5IGJyaWVmLlxuICBwdWJsaWMgcG9pbnRlcjogUG9pbnRlciB8IG51bGw7XG5cbiAgLy8gKHJlYWQtb25seSkgLSBUaGUgVHJhaWwgZm9yIHRoZSBwcmVzcywgd2l0aCBubyBkZXNjZW5kYW50IG5vZGVzIHBhc3QgdGhlIGN1cnJlbnRUYXJnZXRcbiAgLy8gb3IgdGFyZ2V0Tm9kZSAoaWYgcHJvdmlkZWQpLiBXaWxsIGdlbmVyYWxseSBiZSBudWxsIHdoZW4gbm90IHByZXNzZWQsIHRob3VnaCB0aGVyZSBjYW4gYmUgc2hvcnQgcGVyaW9kcyBvZiB0aW1lXG4gIC8vIHdoZXJlIHRoaXMgaGFzIGEgdmFsdWUgd2hlbiBpc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSBpcyBmYWxzZSwgc3VjaCBhcyBkdXJpbmcgdGhlIHByb2Nlc3Npbmcgb2YgYSByZWxlYXNlLCBidXRcbiAgLy8gdGhlc2UgcGVyaW9kcyBzaG91bGQgYmUgdmVyeSBicmllZi5cbiAgcHVibGljIHByZXNzZWRUcmFpbDogVHJhaWwgfCBudWxsO1xuXG4gIC8vKHJlYWQtb25seSkgLSBXaGV0aGVyIHRoZSBsYXN0IHByZXNzIHdhcyBpbnRlcnJ1cHRlZC4gV2lsbCBiZSB2YWxpZCB1bnRpbCB0aGUgbmV4dCBwcmVzcy5cbiAgcHVibGljIGludGVycnVwdGVkOiBib29sZWFuO1xuXG4gIC8vIEZvciB0aGUgY29sbGFwc2VEcmFnRXZlbnRzIGZlYXR1cmUsIHRoaXMgd2lsbCBob2xkIHRoZSBsYXN0IHBlbmRpbmcgZHJhZyBldmVudCB0byB0cmlnZ2VyIGEgY2FsbCB0byBkcmFnKCkgd2l0aCxcbiAgLy8gaWYgb25lIGhhcyBiZWVuIHNraXBwZWQuXG4gIHByaXZhdGUgX3BlbmRpbmdDb2xsYXBzZWREcmFnRXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCB8IG51bGw7XG5cbiAgLy8gV2hldGhlciBvdXIgcG9pbnRlciBsaXN0ZW5lciBpcyByZWZlcmVuY2VkIGJ5IHRoZSBwb2ludGVyIChuZWVkIHRvIGhhdmUgYSBmbGFnIGR1ZSB0byBoYW5kbGluZyBkaXNwb3NhbCBwcm9wZXJseSkuXG4gIHByaXZhdGUgX2xpc3RlbmluZ1RvUG9pbnRlcjogYm9vbGVhbjtcblxuICAvLyBpc0hvdmVyaW5nUHJvcGVydHkgdXBkYXRlcyAobm90IGEgRGVyaXZlZFByb3BlcnR5IGJlY2F1c2Ugd2UgbmVlZCB0byBob29rIHRvIHBhc3NlZC1pbiBwcm9wZXJ0aWVzKVxuICBwcml2YXRlIF9pc0hvdmVyaW5nTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gaXNIaWdobGlnaHRlZFByb3BlcnR5IHVwZGF0ZXMgKG5vdCBhIERlcml2ZWRQcm9wZXJ0eSBiZWNhdXNlIHdlIG5lZWQgdG8gaG9vayB0byBwYXNzZWQtaW4gcHJvcGVydGllcylcbiAgcHJpdmF0ZSBfaXNIaWdobGlnaHRlZExpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIC8vIChyZWFkLW9ubHkpIC0gV2hldGhlciBhIHByZXNzIGlzIGJlaW5nIHByb2Nlc3NlZCBmcm9tIGEgcGRvbSBjbGljayBpbnB1dCBldmVudCBmcm9tIHRoZSBQRE9NLlxuICBwdWJsaWMgcmVhZG9ubHkgcGRvbUNsaWNraW5nUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyAocmVhZC1vbmx5KSAtIFRoaXMgUHJvcGVydHkgd2FzIGFkZGVkIHRvIHN1cHBvcnQgaW5wdXQgZnJvbSB0aGUgUERPTS4gSXQgdHJhY2tzIHdoZXRoZXJcbiAgLy8gb3Igbm90IHRoZSBidXR0b24gc2hvdWxkIFwibG9va1wiIGRvd24uIFRoaXMgd2lsbCBiZSB0cnVlIGlmIGRvd25Qcm9wZXJ0eSBpcyB0cnVlIG9yIGlmIGEgcGRvbSBjbGljayBpcyBpblxuICAvLyBwcm9ncmVzcy4gRm9yIGEgY2xpY2sgZXZlbnQgZnJvbSB0aGUgcGRvbSwgdGhlIGxpc3RlbmVycyBhcmUgZmlyZWQgcmlnaHQgYXdheSBidXQgdGhlIGJ1dHRvbiB3aWxsIGxvb2sgZG93biBmb3JcbiAgLy8gYXMgbG9uZyBhcyBhMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWwuIFNlZSBQcmVzc0xpc3RlbmVyLmNsaWNrKCkgZm9yIG1vcmUgZGV0YWlscy5cbiAgcHVibGljIHJlYWRvbmx5IGxvb2tzUHJlc3NlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBXaGVuIHBkb20gY2xpY2tpbmcgYmVnaW5zLCB0aGlzIHdpbGwgYmUgYWRkZWQgdG8gYSB0aW1lb3V0IHNvIHRoYXQgdGhlXG4gIC8vIHBkb21DbGlja2luZ1Byb3BlcnR5IGlzIHVwZGF0ZWQgYWZ0ZXIgc29tZSBkZWxheS4gVGhpcyBpcyByZXF1aXJlZCBzaW5jZSBhbiBhc3Npc3RpdmUgZGV2aWNlIChsaWtlIGEgc3dpdGNoKSBtYXlcbiAgLy8gc2VuZCBcImNsaWNrXCIgZXZlbnRzIGRpcmVjdGx5IGluc3RlYWQgb2Yga2V5ZG93bi9rZXl1cCBwYWlycy4gSWYgYSBjbGljayBpbml0aWF0ZXMgd2hpbGUgYWxyZWFkeSBpbiBwcm9ncmVzcyxcbiAgLy8gdGhpcyBsaXN0ZW5lciB3aWxsIGJlIHJlbW92ZWQgdG8gc3RhcnQgdGhlIHRpbWVvdXQgb3Zlci4gbnVsbCB1bnRpbCB0aW1vdXQgaXMgYWRkZWQuXG4gIHByaXZhdGUgX3Bkb21DbGlja2luZ1RpbWVvdXRMaXN0ZW5lcjogKCAoKSA9PiB2b2lkICkgfCBudWxsO1xuXG4gIC8vIFRoZSBsaXN0ZW5lciB0aGF0IGdldHMgYWRkZWQgdG8gdGhlIHBvaW50ZXIgd2hlbiB3ZSBhcmUgcHJlc3NlZFxuICBwcml2YXRlIF9wb2ludGVyTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyO1xuXG4gIC8vIEV4ZWN1dGVkIG9uIHByZXNzIGV2ZW50XG4gIC8vIFRoZSBtYWluIGltcGxlbWVudGF0aW9uIG9mIFwicHJlc3NcIiBoYW5kbGluZyBpcyBpbXBsZW1lbnRlZCBhcyBhIGNhbGxiYWNrIHRvIHRoZSBQaGV0aW9BY3Rpb24sIHNvIHRoaW5ncyBhcmUgbmVzdGVkXG4gIC8vIG5pY2VseSBmb3IgcGhldC1pby5cbiAgcHJpdmF0ZSBfcHJlc3NBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFByZXNzTGlzdGVuZXJFdmVudCwgTm9kZSB8IG51bGwsICggKCkgPT4gdm9pZCApIHwgbnVsbCBdPjtcblxuICAvLyBFeGVjdXRlZCBvbiByZWxlYXNlIGV2ZW50XG4gIC8vIFRoZSBtYWluIGltcGxlbWVudGF0aW9uIG9mIFwicmVsZWFzZVwiIGhhbmRsaW5nIGlzIGltcGxlbWVudGVkIGFzIGEgY2FsbGJhY2sgdG8gdGhlIFBoZXRpb0FjdGlvbiwgc28gdGhpbmdzIGFyZSBuZXN0ZWRcbiAgLy8gbmljZWx5IGZvciBwaGV0LWlvLlxuICBwcml2YXRlIF9yZWxlYXNlQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBQcmVzc0xpc3RlbmVyRXZlbnQgfCBudWxsLCAoICgpID0+IHZvaWQgKSB8IG51bGwgXT47XG5cbiAgLy8gVG8gc3VwcG9ydCBsb29rc092ZXJQcm9wZXJ0eSBiZWluZyB0cnVlIGJhc2VkIG9uIGZvY3VzLCB3ZSBuZWVkIHRvIG1vbml0b3IgdGhlIGRpc3BsYXkgZnJvbSB3aGljaFxuICAvLyB0aGUgZXZlbnQgaGFzIGNvbWUgZnJvbSB0byBzZWUgaWYgdGhhdCBkaXNwbGF5IGlzIHNob3dpbmcgaXRzIGZvY3VzSGlnaGxpZ2h0cywgc2VlXG4gIC8vIERpc3BsYXkucHJvdG90eXBlLmZvY3VzTWFuYWdlci5Gb2N1c01hbmFnZXIucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSBmb3IgZGV0YWlscy5cbiAgcHVibGljIGRpc3BsYXk6IERpc3BsYXkgfCBudWxsO1xuXG4gIC8vIHdlIG5lZWQgdGhlIHNhbWUgZXhhY3QgZnVuY3Rpb24gdG8gYWRkIGFuZCByZW1vdmUgYXMgYSBsaXN0ZW5lclxuICBwcml2YXRlIGJvdW5kSW52YWxpZGF0ZU92ZXJMaXN0ZW5lcjogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFByZXNzTGlzdGVuZXJPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJlc3NMaXN0ZW5lck9wdGlvbnMsIFNlbGZPcHRpb25zPFByZXNzTGlzdGVuZXI+LCBFbmFibGVkQ29tcG9uZW50T3B0aW9ucz4oKSgge1xuXG4gICAgICBwcmVzczogXy5ub29wLFxuICAgICAgcmVsZWFzZTogXy5ub29wLFxuICAgICAgdGFyZ2V0Tm9kZTogbnVsbCxcbiAgICAgIGRyYWc6IF8ubm9vcCxcbiAgICAgIGF0dGFjaDogdHJ1ZSxcbiAgICAgIG1vdXNlQnV0dG9uOiAwLFxuICAgICAgcHJlc3NDdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIHVzZUlucHV0TGlzdGVuZXJDdXJzb3I6IGZhbHNlLFxuICAgICAgY2FuU3RhcnRQcmVzczogdHJ1ZVByZWRpY2F0ZSxcbiAgICAgIGExMXlMb29rc1ByZXNzZWRJbnRlcnZhbDogMTAwLFxuICAgICAgY29sbGFwc2VEcmFnRXZlbnRzOiBmYWxzZSxcblxuICAgICAgLy8gRW5hYmxlZENvbXBvbmVudFxuICAgICAgLy8gQnkgZGVmYXVsdCwgUHJlc3NMaXN0ZW5lciBkb2VzIG5vdCBoYXZlIGFuIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHksIGJ1dCB5b3UgY2FuIG9wdCBpbiB3aXRoIHRoaXMgb3B0aW9uLlxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcblxuICAgICAgLy8gcGhldC1pbyAoRW5hYmxlZENvbXBvbmVudClcbiAgICAgIC8vIEZvciBQaEVULWlPIGluc3RydW1lbnRhdGlvbi4gSWYgb25seSB1c2luZyB0aGUgUHJlc3NMaXN0ZW5lciBmb3IgaG92ZXIgYmVoYXZpb3IsIHRoZXJlIGlzIG5vIG5lZWQgdG9cbiAgICAgIC8vIGluc3RydW1lbnQgYmVjYXVzZSBldmVudHMgYXJlIG9ubHkgYWRkZWQgdG8gdGhlIGRhdGEgc3RyZWFtIGZvciBwcmVzcy9yZWxlYXNlIGFuZCBub3QgZm9yIGhvdmVyIGV2ZW50cy4gUGxlYXNlIHBhc3NcbiAgICAgIC8vIFRhbmRlbS5PUFRfT1VUIGFzIHRoZSB0YW5kZW0gb3B0aW9uIHRvIG5vdCBpbnN0cnVtZW50IGFuIGluc3RhbmNlLlxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG5cbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IFBoZXRpb09iamVjdC5ERUZBVUxUX09QVElPTlMucGhldGlvRmVhdHVyZWRcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLm1vdXNlQnV0dG9uID09PSAnbnVtYmVyJyAmJiBvcHRpb25zLm1vdXNlQnV0dG9uID49IDAgJiYgb3B0aW9ucy5tb3VzZUJ1dHRvbiAlIDEgPT09IDAsXG4gICAgICAnbW91c2VCdXR0b24gc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5wcmVzc0N1cnNvciA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucy5wcmVzc0N1cnNvciA9PT0gJ3N0cmluZycsXG4gICAgICAncHJlc3NDdXJzb3Igc2hvdWxkIGVpdGhlciBiZSBhIHN0cmluZyBvciBudWxsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLnByZXNzID09PSAnZnVuY3Rpb24nLFxuICAgICAgJ1RoZSBwcmVzcyBjYWxsYmFjayBzaG91bGQgYmUgYSBmdW5jdGlvbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5yZWxlYXNlID09PSAnZnVuY3Rpb24nLFxuICAgICAgJ1RoZSByZWxlYXNlIGNhbGxiYWNrIHNob3VsZCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLmRyYWcgPT09ICdmdW5jdGlvbicsXG4gICAgICAnVGhlIGRyYWcgY2FsbGJhY2sgc2hvdWxkIGJlIGEgZnVuY3Rpb24nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy50YXJnZXROb2RlID09PSBudWxsIHx8IG9wdGlvbnMudGFyZ2V0Tm9kZSBpbnN0YW5jZW9mIE5vZGUsXG4gICAgICAnSWYgcHJvdmlkZWQsIHRhcmdldE5vZGUgc2hvdWxkIGJlIGEgTm9kZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5hdHRhY2ggPT09ICdib29sZWFuJywgJ2F0dGFjaCBzaG91bGQgYmUgYSBib29sZWFuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLmExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCA9PT0gJ251bWJlcicsXG4gICAgICAnYTExeUxvb2tzUHJlc3NlZEludGVydmFsIHNob3VsZCBiZSBhIG51bWJlcicgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLl9pZCA9IGdsb2JhbElEKys7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IGNvbnN0cnVjdGlvbmAgKTtcblxuICAgIHRoaXMuX21vdXNlQnV0dG9uID0gb3B0aW9ucy5tb3VzZUJ1dHRvbjtcbiAgICB0aGlzLl9hMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWwgPSBvcHRpb25zLmExMXlMb29rc1ByZXNzZWRJbnRlcnZhbDtcbiAgICB0aGlzLl9wcmVzc0N1cnNvciA9IG9wdGlvbnMucHJlc3NDdXJzb3I7XG5cbiAgICB0aGlzLl9wcmVzc0xpc3RlbmVyID0gb3B0aW9ucy5wcmVzcztcbiAgICB0aGlzLl9yZWxlYXNlTGlzdGVuZXIgPSBvcHRpb25zLnJlbGVhc2U7XG4gICAgdGhpcy5fZHJhZ0xpc3RlbmVyID0gb3B0aW9ucy5kcmFnO1xuICAgIHRoaXMuX2NhblN0YXJ0UHJlc3MgPSBvcHRpb25zLmNhblN0YXJ0UHJlc3M7XG5cbiAgICB0aGlzLl90YXJnZXROb2RlID0gb3B0aW9ucy50YXJnZXROb2RlO1xuXG4gICAgdGhpcy5fYXR0YWNoID0gb3B0aW9ucy5hdHRhY2g7XG4gICAgdGhpcy5fY29sbGFwc2VEcmFnRXZlbnRzID0gb3B0aW9ucy5jb2xsYXBzZURyYWdFdmVudHM7XG5cbiAgICB0aGlzLm92ZXJQb2ludGVycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xuXG4gICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7IHJlZW50cmFudDogdHJ1ZSB9ICk7XG4gICAgdGhpcy5pc092ZXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gICAgdGhpcy5sb29rc092ZXJQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gICAgdGhpcy5pc0hvdmVyaW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMuaXNIaWdobGlnaHRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLmlzRm9jdXNlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLmN1cnNvclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmVuYWJsZWRQcm9wZXJ0eSBdLCBlbmFibGVkID0+IHtcbiAgICAgIGlmICggb3B0aW9ucy51c2VJbnB1dExpc3RlbmVyQ3Vyc29yICYmIGVuYWJsZWQgJiYgdGhpcy5fYXR0YWNoICkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJlc3NDdXJzb3I7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSApO1xuXG5cbiAgICB0aGlzLnBvaW50ZXIgPSBudWxsO1xuICAgIHRoaXMucHJlc3NlZFRyYWlsID0gbnVsbDtcbiAgICB0aGlzLmludGVycnVwdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcGVuZGluZ0NvbGxhcHNlZERyYWdFdmVudCA9IG51bGw7XG4gICAgdGhpcy5fbGlzdGVuaW5nVG9Qb2ludGVyID0gZmFsc2U7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0xpc3RlbmVyID0gdGhpcy5pbnZhbGlkYXRlSG92ZXJpbmcuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZUhpZ2hsaWdodGVkLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLnBkb21DbGlja2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLmxvb2tzUHJlc3NlZFByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5Lm9yKCBbIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHksIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkgXSApO1xuICAgIHRoaXMuX3Bkb21DbGlja2luZ1RpbWVvdXRMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5fcG9pbnRlckxpc3RlbmVyID0ge1xuICAgICAgdXA6IHRoaXMucG9pbnRlclVwLmJpbmQoIHRoaXMgKSxcbiAgICAgIGNhbmNlbDogdGhpcy5wb2ludGVyQ2FuY2VsLmJpbmQoIHRoaXMgKSxcbiAgICAgIG1vdmU6IHRoaXMucG9pbnRlck1vdmUuYmluZCggdGhpcyApLFxuICAgICAgaW50ZXJydXB0OiB0aGlzLnBvaW50ZXJJbnRlcnJ1cHQuYmluZCggdGhpcyApLFxuICAgICAgbGlzdGVuZXI6IHRoaXNcbiAgICB9O1xuXG4gICAgdGhpcy5fcHJlc3NBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCB0aGlzLm9uUHJlc3MuYmluZCggdGhpcyApLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXNzQWN0aW9uJyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0V4ZWN1dGVzIHdoZW5ldmVyIGEgcHJlc3Mgb2NjdXJzLiBUaGUgZmlyc3QgYXJndW1lbnQgd2hlbiBleGVjdXRpbmcgY2FuIGJlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3VzZWQgdG8gY29udmV5IGluZm8gYWJvdXQgdGhlIFNjZW5lcnlFdmVudC4nLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICBwaGV0aW9GZWF0dXJlZDogb3B0aW9ucy5waGV0aW9GZWF0dXJlZCxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwYXJhbWV0ZXJzOiBbIHtcbiAgICAgICAgbmFtZTogJ2V2ZW50JyxcbiAgICAgICAgcGhldGlvVHlwZTogU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPXG4gICAgICB9LCB7XG4gICAgICAgIHBoZXRpb1ByaXZhdGU6IHRydWUsXG4gICAgICAgIHZhbHVlVHlwZTogWyBOb2RlLCBudWxsIF1cbiAgICAgIH0sIHtcbiAgICAgICAgcGhldGlvUHJpdmF0ZTogdHJ1ZSxcbiAgICAgICAgdmFsdWVUeXBlOiBbICdmdW5jdGlvbicsIG51bGwgXVxuICAgICAgfVxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIHRoaXMuX3JlbGVhc2VBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCB0aGlzLm9uUmVsZWFzZS5iaW5kKCB0aGlzICksIHtcbiAgICAgIHBhcmFtZXRlcnM6IFsge1xuICAgICAgICBuYW1lOiAnZXZlbnQnLFxuICAgICAgICBwaGV0aW9UeXBlOiBOdWxsYWJsZUlPKCBTY2VuZXJ5RXZlbnQuU2NlbmVyeUV2ZW50SU8gKVxuICAgICAgfSwge1xuICAgICAgICBwaGV0aW9Qcml2YXRlOiB0cnVlLFxuICAgICAgICB2YWx1ZVR5cGU6IFsgJ2Z1bmN0aW9uJywgbnVsbCBdXG4gICAgICB9IF0sXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVsZWFzZUFjdGlvbicgKSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFeGVjdXRlcyB3aGVuZXZlciBhIHJlbGVhc2Ugb2NjdXJzLicsXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUlxuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcGxheSA9IG51bGw7XG4gICAgdGhpcy5ib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGVPdmVyLmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIHVwZGF0ZSBpc092ZXJQcm9wZXJ0eSAobm90IGEgRGVyaXZlZFByb3BlcnR5IGJlY2F1c2Ugd2UgbmVlZCB0byBob29rIHRvIHBhc3NlZC1pbiBwcm9wZXJ0aWVzKVxuICAgIHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aFByb3BlcnR5LmxpbmsoIHRoaXMuaW52YWxpZGF0ZU92ZXIuYmluZCggdGhpcyApICk7XG4gICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS5saW5rKCB0aGlzLmludmFsaWRhdGVPdmVyLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgLy8gdXBkYXRlIGlzSG92ZXJpbmdQcm9wZXJ0eSAobm90IGEgRGVyaXZlZFByb3BlcnR5IGJlY2F1c2Ugd2UgbmVlZCB0byBob29rIHRvIHBhc3NlZC1pbiBwcm9wZXJ0aWVzKVxuICAgIHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aFByb3BlcnR5LmxpbmsoIHRoaXMuX2lzSG92ZXJpbmdMaXN0ZW5lciApO1xuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkubGluayggdGhpcy5faXNIb3ZlcmluZ0xpc3RlbmVyICk7XG5cbiAgICAvLyBVcGRhdGUgaXNIb3ZlcmluZyB3aGVuIGFueSBwb2ludGVyJ3MgaXNEb3duUHJvcGVydHkgY2hhbmdlcy5cbiAgICAvLyBOT1RFOiBvdmVyUG9pbnRlcnMgaXMgY2xlYXJlZCBvbiBkaXNwb3NlLCB3aGljaCBzaG91bGQgcmVtb3ZlIGFsbCBvZiB0aGVzZSAoaW50ZXJpb3IpIGxpc3RlbmVycylcbiAgICB0aGlzLm92ZXJQb2ludGVycy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggcG9pbnRlciA9PiBwb2ludGVyLmlzRG93blByb3BlcnR5LmxpbmsoIHRoaXMuX2lzSG92ZXJpbmdMaXN0ZW5lciApICk7XG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRlciA9PiBwb2ludGVyLmlzRG93blByb3BlcnR5LnVubGluayggdGhpcy5faXNIb3ZlcmluZ0xpc3RlbmVyICkgKTtcblxuICAgIC8vIHVwZGF0ZSBpc0hpZ2hsaWdodGVkUHJvcGVydHkgKG5vdCBhIERlcml2ZWRQcm9wZXJ0eSBiZWNhdXNlIHdlIG5lZWQgdG8gaG9vayB0byBwYXNzZWQtaW4gcHJvcGVydGllcylcbiAgICB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS5saW5rKCB0aGlzLl9pc0hpZ2hsaWdodGVkTGlzdGVuZXIgKTtcbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmxpbmsoIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMub25FbmFibGVkUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGxpc3RlbmVyIGlzIGN1cnJlbnRseSBhY3RpdmF0ZWQgd2l0aCBhIHByZXNzLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1ByZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jdXJzb3JQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYXR0YWNoKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hdHRhY2g7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRhcmdldE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXROb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIG5vZGUgdGhhdCB0aGlzIGxpc3RlbmVyIGlzIHJlc3BvbnNpYmxlIGZvciBkcmFnZ2luZy5cbiAgICovXG4gIHB1YmxpYyBnZXRDdXJyZW50VGFyZ2V0KCk6IE5vZGUge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNQcmVzc2VkLCAnV2UgaGF2ZSBubyBjdXJyZW50VGFyZ2V0IGlmIHdlIGFyZSBub3QgcHJlc3NlZCcgKTtcblxuICAgIHJldHVybiAoIHRoaXMgYXMgUHJlc3NlZFByZXNzTGlzdGVuZXIgKS5wcmVzc2VkVHJhaWwubGFzdE5vZGUoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY3VycmVudFRhcmdldCgpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50VGFyZ2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGEgcHJlc3MgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIHBhcnRpY3VsYXIgZXZlbnQuXG4gICAqL1xuICBwdWJsaWMgY2FuUHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5lbmFibGVkUHJvcGVydHkudmFsdWUgJiZcbiAgICAgICAgICAgIXRoaXMuaXNQcmVzc2VkICYmXG4gICAgICAgICAgIHRoaXMuX2NhblN0YXJ0UHJlc3MoIGV2ZW50LCB0aGlzICkgJiZcbiAgICAgICAgICAgLy8gT25seSBsZXQgcHJlc3NlcyBiZSBzdGFydGVkIHdpdGggdGhlIGNvcnJlY3QgbW91c2UgYnV0dG9uLlxuICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFR5cGVkIFNjZW5lcnlFdmVudFxuICAgICAgICAgICAoICEoIGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSApIHx8IGV2ZW50LmRvbUV2ZW50LmJ1dHRvbiA9PT0gdGhpcy5fbW91c2VCdXR0b24gKSAmJlxuICAgICAgICAgICAvLyBXZSBjYW4ndCBhdHRhY2ggdG8gYSBwb2ludGVyIHRoYXQgaXMgYWxyZWFkeSBhdHRhY2hlZC5cbiAgICAgICAgICAgKCAhdGhpcy5fYXR0YWNoIHx8ICFldmVudC5wb2ludGVyLmlzQXR0YWNoZWQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIFByZXNzTGlzdGVuZXIgY2FuIGJlIGNsaWNrZWQgZnJvbSBrZXlib2FyZCBpbnB1dC4gVGhpcyBjb3BpZXMgcGFydCBvZiBjYW5QcmVzcywgYnV0XG4gICAqIHdlIGRpZG4ndCB3YW50IHRvIHVzZSBjYW5DbGljayBpbiBjYW5QcmVzcyBiZWNhdXNlIGNhbkNsaWNrIGNvdWxkIGJlIG92ZXJyaWRkZW4gaW4gc3VidHlwZXMuXG4gICAqL1xuICBwdWJsaWMgY2FuQ2xpY2soKTogYm9vbGVhbiB7XG4gICAgLy8gSWYgdGhpcyBsaXN0ZW5lciBpcyBhbHJlYWR5IGludm9sdmVkIGluIHByZXNzaW5nIHNvbWV0aGluZyAob3Igb3VyIG9wdGlvbnMgcHJlZGljYXRlIHJldHVybnMgZmFsc2UpIHdlIGNhbid0XG4gICAgLy8gcHJlc3Mgc29tZXRoaW5nLlxuICAgIHJldHVybiB0aGlzLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5pc1ByZXNzZWQgJiYgdGhpcy5fY2FuU3RhcnRQcmVzcyggbnVsbCwgdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRoZSBsaXN0ZW5lciB0byB0aGUgJ3ByZXNzZWQnIHN0YXRlIGlmIHBvc3NpYmxlIChhdHRhY2hlcyBsaXN0ZW5lcnMgYW5kIGluaXRpYWxpemVzIHByZXNzLXJlbGF0ZWRcbiAgICogcHJvcGVydGllcykuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIG92ZXJyaWRkZW4gKHdpdGggc3VwZXItY2FsbHMpIHdoZW4gY3VzdG9tIHByZXNzIGJlaGF2aW9yIGlzIG5lZWRlZCBmb3IgYSB0eXBlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSBjYWxsZWQgYnkgb3V0c2lkZSBjbGllbnRzIGluIG9yZGVyIHRvIHRyeSB0byBiZWdpbiBhIHByb2Nlc3MgKGdlbmVyYWxseSBvbiBhbiBhbHJlYWR5LXByZXNzZWRcbiAgICogcG9pbnRlciksIGFuZCBpcyB1c2VmdWwgaWYgYSAnZHJhZycgbmVlZHMgdG8gY2hhbmdlIGJldHdlZW4gbGlzdGVuZXJzLiBVc2UgY2FuUHJlc3MoIGV2ZW50ICkgdG8gZGV0ZXJtaW5lIGlmXG4gICAqIGEgcHJlc3MgY2FuIGJlIHN0YXJ0ZWQgKGlmIG5lZWRlZCBiZWZvcmVoYW5kKS5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSBbdGFyZ2V0Tm9kZV0gLSBJZiBwcm92aWRlZCwgd2lsbCB0YWtlIHRoZSBwbGFjZSBvZiB0aGUgdGFyZ2V0Tm9kZSBmb3IgdGhpcyBjYWxsLiBVc2VmdWwgZm9yXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yd2FyZGVkIHByZXNzZXMuXG4gICAqIEBwYXJhbSBbY2FsbGJhY2tdIC0gdG8gYmUgcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLCBidXQgb25seSBvbiBzdWNjZXNzXG4gICAqIEByZXR1cm5zIHN1Y2Nlc3MgLSBSZXR1cm5zIHdoZXRoZXIgdGhlIHByZXNzIHdhcyBhY3R1YWxseSBzdGFydGVkXG4gICAqL1xuICBwdWJsaWMgcHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIHRhcmdldE5vZGU/OiBOb2RlLCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogYm9vbGVhbiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQsICdBbiBldmVudCBpcyByZXF1aXJlZCcgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gcHJlc3NgICk7XG5cbiAgICBpZiAoICF0aGlzLmNhblByZXNzKCBldmVudCApICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBjb3VsZCBub3QgcHJlc3NgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRmx1c2ggb3V0IGEgcGVuZGluZyBkcmFnLCBzbyBpdCBoYXBwZW5zIGJlZm9yZSB3ZSBwcmVzc1xuICAgIHRoaXMuZmx1c2hDb2xsYXBzZWREcmFnKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IHN1Y2Nlc3NmdWwgcHJlc3NgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5fcHJlc3NBY3Rpb24uZXhlY3V0ZSggZXZlbnQsIHRhcmdldE5vZGUgfHwgbnVsbCwgY2FsbGJhY2sgfHwgbnVsbCApOyAvLyBjYW5ub3QgcGFzcyB1bmRlZmluZWQgaW50byBleGVjdXRlIGNhbGxcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyBhIHByZXNzZWQgbGlzdGVuZXIuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIG92ZXJyaWRkZW4gKHdpdGggc3VwZXItY2FsbHMpIHdoZW4gY3VzdG9tIHJlbGVhc2UgYmVoYXZpb3IgaXMgbmVlZGVkIGZvciBhIHR5cGUuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBmcm9tIHRoZSBvdXRzaWRlIHRvIHJlbGVhc2UgdGhlIHByZXNzIHdpdGhvdXQgdGhlIHBvaW50ZXIgaGF2aW5nIGFjdHVhbGx5IGZpcmVkIGFueSAndXAnXG4gICAqIGV2ZW50cy4gSWYgdGhlIGNhbmNlbC9pbnRlcnJ1cHQgYmVoYXZpb3IgaXMgbW9yZSBwcmVmZXJhYmxlLCBjYWxsIGludGVycnVwdCgpIG9uIHRoaXMgbGlzdGVuZXIgaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIFtldmVudF0gLSBzY2VuZXJ5IGV2ZW50IGlmIHRoZXJlIHdhcyBvbmUuIFdlIGNhbid0IGd1YXJhbnRlZSBhbiBldmVudCwgaW4gcGFydCB0byBzdXBwb3J0IGludGVycnVwdGluZy5cbiAgICogQHBhcmFtIFtjYWxsYmFja10gLSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgcmVsZWFzZVxuICAgKi9cbiAgcHVibGljIHJlbGVhc2UoIGV2ZW50PzogUHJlc3NMaXN0ZW5lckV2ZW50LCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSByZWxlYXNlYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gRmx1c2ggb3V0IGEgcGVuZGluZyBkcmFnLCBzbyBpdCBoYXBwZW5zIGJlZm9yZSB3ZSByZWxlYXNlXG4gICAgdGhpcy5mbHVzaENvbGxhcHNlZERyYWcoKTtcblxuICAgIHRoaXMuX3JlbGVhc2VBY3Rpb24uZXhlY3V0ZSggZXZlbnQgfHwgbnVsbCwgY2FsbGJhY2sgfHwgbnVsbCApOyAvLyBjYW5ub3QgcGFzcyB1bmRlZmluZWQgdG8gZXhlY3V0ZSBjYWxsXG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIG1vdmUgZXZlbnRzIGFyZSBmaXJlZCBvbiB0aGUgYXR0YWNoZWQgcG9pbnRlciBsaXN0ZW5lci5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgb3ZlcnJpZGRlbiAod2l0aCBzdXBlci1jYWxscykgd2hlbiBjdXN0b20gZHJhZyBiZWhhdmlvciBpcyBuZWVkZWQgZm9yIGEgdHlwZS5cbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwsIGVmZmVjdGl2ZWx5IHByb3RlY3RlZClcbiAgICovXG4gIHB1YmxpYyBkcmFnKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gZHJhZ2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIElmIHdlIGdvdCBpbnRlcnJ1cHRlZCB3aGlsZSBldmVudHMgd2VyZSBxdWV1ZWQgdXAsIHdlIE1BWSBnZXQgYSBkcmFnIHdoZW4gbm90IHByZXNzZWQuIFdlIGNhbiBpZ25vcmUgdGhpcy5cbiAgICBpZiAoICF0aGlzLmlzUHJlc3NlZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kcmFnTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgdGhlIGxpc3RlbmVyLCByZWxlYXNpbmcgaXQgKGNhbmNlbGluZyBiZWhhdmlvcikuXG4gICAqXG4gICAqIFRoaXMgZWZmZWN0aXZlbHkgcmVsZWFzZXMvZW5kcyB0aGUgcHJlc3MsIGFuZCBzZXRzIHRoZSBgaW50ZXJydXB0ZWRgIGZsYWcgdG8gdHJ1ZSB3aGlsZSBmaXJpbmcgdGhlc2UgZXZlbnRzXG4gICAqIHNvIHRoYXQgY29kZSBjYW4gZGV0ZXJtaW5lIHdoZXRoZXIgYSByZWxlYXNlL2VuZCBoYXBwZW5lZCBuYXR1cmFsbHksIG9yIHdhcyBjYW5jZWxlZCBpbiBzb21lIHdheS5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgY2FsbGVkIG1hbnVhbGx5LCBidXQgY2FuIGFsc28gYmUgY2FsbGVkIHRocm91Z2ggbm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKS5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBpbnRlcnJ1cHRgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBoYW5kbGUgcGRvbSBpbnRlcnJ1cHRcbiAgICBpZiAoIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgLy8gaXQgaXMgcG9zc2libGUgd2UgYXJlIGludGVycnVwdGluZyBhIGNsaWNrIHdpdGggYSBwb2ludGVyIHByZXNzLCBpbiB3aGljaCBjYXNlXG4gICAgICAvLyB3ZSBhcmUgbGlzdGVuaW5nIHRvIHRoZSBQb2ludGVyIGxpc3RlbmVyIC0gZG8gYSBmdWxsIHJlbGVhc2UgaW4gdGhpcyBjYXNlXG4gICAgICBpZiAoIHRoaXMuX2xpc3RlbmluZ1RvUG9pbnRlciApIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyByZWxlYXNlIG9uIGludGVycnVwdCAod2l0aG91dCBnb2luZyB0aHJvdWdoIG9uUmVsZWFzZSwgd2hpY2ggaGFuZGxlcyBtb3VzZS90b3VjaCBzcGVjaWZpYyB0aGluZ3MpXG4gICAgICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVsZWFzZUxpc3RlbmVyKCBudWxsLCB0aGlzICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNsZWFyIHRoZSBjbGlja2luZyB0aW1lciwgc3BlY2lmaWMgdG8gcGRvbSBpbnB1dFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBUaGlzIGxvb2tzIGJ1Z2d5LCB3aWxsIG5lZWQgdG8gaWdub3JlIGZvciBub3cgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGlmICggc3RlcFRpbWVyLmhhc0xpc3RlbmVyKCB0aGlzLl9wZG9tQ2xpY2tpbmdUaW1lb3V0TGlzdGVuZXIgKSApIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBUaGlzIGxvb2tzIGJ1Z2d5LCB3aWxsIG5lZWQgdG8gaWdub3JlIGZvciBub3cgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggdGhpcy5fcGRvbUNsaWNraW5nVGltZW91dExpc3RlbmVyICk7XG5cbiAgICAgICAgLy8gaW50ZXJydXB0IG1heSBiZSBjYWxsZWQgYWZ0ZXIgdGhlIFByZXNzTGlzdGVuZXIgaGFzIGJlZW4gZGlzcG9zZWQgKGZvciBpbnN0YW5jZSwgaW50ZXJuYWxseSBieSBzY2VuZXJ5XG4gICAgICAgIC8vIGlmIHRoZSBOb2RlIHJlY2VpdmVzIGEgYmx1ciBldmVudCBhZnRlciB0aGUgUHJlc3NMaXN0ZW5lciBpcyBkaXNwb3NlZClcbiAgICAgICAgaWYgKCAhdGhpcy5wZG9tQ2xpY2tpbmdQcm9wZXJ0eS5pc0Rpc3Bvc2VkICkge1xuICAgICAgICAgIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5pc1ByZXNzZWQgKSB7XG5cbiAgICAgIC8vIGhhbmRsZSBwb2ludGVyIGludGVycnVwdFxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBpbnRlcnJ1cHRpbmdgICk7XG4gICAgICB0aGlzLmludGVycnVwdGVkID0gdHJ1ZTtcblxuICAgICAgdGhpcy5yZWxlYXNlKCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNob3VsZCBiZSBjYWxsZWQgd2hlbiB0aGUgbGlzdGVuZWQgXCJOb2RlXCIgaXMgZWZmZWN0aXZlbHkgcmVtb3ZlZCBmcm9tIHRoZSBzY2VuZSBncmFwaCBBTkRcbiAgICogZXhwZWN0ZWQgdG8gYmUgcGxhY2VkIGJhY2sgaW4gc3VjaCB0aGF0IGl0IGNvdWxkIHBvdGVudGlhbGx5IGdldCBtdWx0aXBsZSBcImVudGVyXCIgZXZlbnRzLCBzZWVcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwMjFcbiAgICpcbiAgICogVGhpcyB3aWxsIGNsZWFyIHRoZSBsaXN0IG9mIHBvaW50ZXJzIGNvbnNpZGVyZWQgXCJvdmVyXCIgdGhlIE5vZGUsIHNvIHRoYXQgd2hlbiBpdCBpcyBwbGFjZWQgYmFjayBpbiwgdGhlIHN0YXRlXG4gICAqIHdpbGwgYmUgY29ycmVjdCwgYW5kIGFub3RoZXIgXCJlbnRlclwiIGV2ZW50IHdpbGwgbm90IGJlIG1pc3NpbmcgYW4gXCJleGl0XCIuXG4gICAqL1xuICBwdWJsaWMgY2xlYXJPdmVyUG9pbnRlcnMoKTogdm9pZCB7XG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuY2xlYXIoKTsgLy8gV2UgaGF2ZSBsaXN0ZW5lcnMgdGhhdCB3aWxsIHRyaWdnZXIgdGhlIHByb3BlciByZWZyZXNoZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBjb2xsYXBzZURyYWdFdmVudHMgaXMgc2V0IHRvIHRydWUsIHRoaXMgc3RlcCgpIHNob3VsZCBiZSBjYWxsZWQgZXZlcnkgZnJhbWUgc28gdGhhdCB0aGUgY29sbGFwc2VkIGRyYWdcbiAgICogY2FuIGJlIGZpcmVkLlxuICAgKi9cbiAgcHVibGljIHN0ZXAoKTogdm9pZCB7XG4gICAgdGhpcy5mbHVzaENvbGxhcHNlZERyYWcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNhbGxiYWNrIHRoYXQgd2lsbCBjcmVhdGUgYSBCb3VuZHMyIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZSBmb3IgdGhlIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyIHRvXG4gICAqIGtlZXAgaW4gdmlldyBkdXJpbmcgYSBkcmFnIG9wZXJhdGlvbi4gRHVyaW5nIGRyYWcgaW5wdXQgdGhlIEFuaW1hdGVkUGFuWm9vbUxpc3RlbmVyIHdpbGwgcGFuIHRoZSBzY3JlZW4gdG9cbiAgICogdHJ5IGFuZCBrZWVwIHRoZSByZXR1cm5lZCBCb3VuZHMyIHZpc2libGUuIEJ5IGRlZmF1bHQsIHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIHRyeSB0byBrZWVwIHRoZSB0YXJnZXQgb2ZcbiAgICogdGhlIGRyYWcgaW4gdmlldyBidXQgdGhhdCBtYXkgbm90IGFsd2F5cyB3b3JrIGlmIHRoZSB0YXJnZXQgaXMgbm90IGFzc29jaWF0ZWQgd2l0aCB0aGUgdHJhbnNsYXRlZCBOb2RlLCB0aGUgdGFyZ2V0XG4gICAqIGlzIG5vdCBkZWZpbmVkLCBvciB0aGUgdGFyZ2V0IGhhcyBib3VuZHMgdGhhdCBkbyBub3QgYWNjdXJhdGVseSBzdXJyb3VuZCB0aGUgZ3JhcGhpYyB5b3Ugd2FudCB0byBrZWVwIGluIHZpZXcuXG4gICAqL1xuICBwdWJsaWMgc2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzKCBjcmVhdGVEcmFnUGFuVGFyZ2V0Qm91bmRzOiAoICgpID0+IEJvdW5kczIgKSB8IG51bGwgKTogdm9pZCB7XG5cbiAgICAvLyBGb3J3YXJkZWQgdG8gdGhlIHBvaW50ZXJMaXN0ZW5lciBzbyB0aGF0IHRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciBjYW4gZ2V0IHRoaXMgY2FsbGJhY2sgZnJvbSB0aGUgYXR0YWNoZWRcbiAgICAvLyBsaXN0ZW5lclxuICAgIHRoaXMuX3BvaW50ZXJMaXN0ZW5lci5jcmVhdGVQYW5UYXJnZXRCb3VuZHMgPSBjcmVhdGVEcmFnUGFuVGFyZ2V0Qm91bmRzO1xuICB9XG5cbiAgcHVibGljIHNldCBjcmVhdGVQYW5UYXJnZXRCb3VuZHMoIGNyZWF0ZURyYWdQYW5UYXJnZXRCb3VuZHM6ICggKCkgPT4gQm91bmRzMiApIHwgbnVsbCApIHsgdGhpcy5zZXRDcmVhdGVQYW5UYXJnZXRCb3VuZHMoIGNyZWF0ZURyYWdQYW5UYXJnZXRCb3VuZHMgKTsgfVxuXG4gIC8qKlxuICAgKiBBIGNvbnZlbmllbnQgd2F5IHRvIGNyZWF0ZSBhbmQgc2V0IHRoZSBjYWxsYmFjayB0aGF0IHdpbGwgcmV0dXJuIGEgQm91bmRzMiBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgZm9yIHRoZVxuICAgKiBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB0byBrZWVwIGluIHZpZXcgZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24uIFRoZSBBbmltYXRlZFBhblpvb21MaXN0ZW5lciB3aWxsIHRyeSB0byBrZWVwIHRoZVxuICAgKiBib3VuZHMgb2YgdGhlIGxhc3QgTm9kZSBvZiB0aGUgcHJvdmlkZWQgdHJhaWwgdmlzaWJsZSBieSBwYW5uaW5nIHRoZSBzY3JlZW4gZHVyaW5nIGEgZHJhZyBvcGVyYXRpb24uIFNlZVxuICAgKiBzZXRDcmVhdGVQYW5UYXJnZXRCb3VuZHMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldENyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyYWlsLmxlbmd0aCA+IDAsICd0cmFpbCBoYXMgbm8gTm9kZXMgdG8gcHJvdmlkZSBsb2NhbEJvdW5kcycgKTtcbiAgICB0aGlzLnNldENyZWF0ZVBhblRhcmdldEJvdW5kcyggKCkgPT4gdHJhaWwubG9jYWxUb0dsb2JhbEJvdW5kcyggdHJhaWwubGFzdE5vZGUoKS5sb2NhbEJvdW5kcyApICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IGNyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCggdHJhaWw6IFRyYWlsICkgeyB0aGlzLnNldENyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCggdHJhaWwgKTsgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGVyZSBpcyBhIHBlbmRpbmcgY29sbGFwc2VkIGRyYWcgd2FpdGluZywgd2UnbGwgZmlyZSB0aGF0IGRyYWcgKHVzdWFsbHkgYmVmb3JlIG90aGVyIGV2ZW50cyBvciBkdXJpbmcgYSBzdGVwKVxuICAgKi9cbiAgcHJpdmF0ZSBmbHVzaENvbGxhcHNlZERyYWcoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50ICkge1xuICAgICAgdGhpcy5kcmFnKCB0aGlzLl9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50ICk7XG4gICAgfVxuICAgIHRoaXMuX3BlbmRpbmdDb2xsYXBzZWREcmFnRXZlbnQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tcHV0ZXMgdGhlIHZhbHVlIGZvciBpc092ZXJQcm9wZXJ0eS4gU2VwYXJhdGUgdG8gcmVkdWNlIGFub255bW91cyBmdW5jdGlvbiBjbG9zdXJlcy5cbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZU92ZXIoKTogdm9pZCB7XG4gICAgbGV0IHBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgPSBmYWxzZTtcblxuICAgIGlmICggdGhpcy5fbGlzdGVuaW5nVG9Qb2ludGVyICkge1xuXG4gICAgICAvLyB0aGlzIHBvaW50ZXIgbGlzdGVuZXIgaXMgYXR0YWNoZWQgdG8gdGhlIHBvaW50ZXJcbiAgICAgIHBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIGEgbGlzdGVuZXIgb3RoZXIgdGhhbiB0aGlzIG9uZSBpcyBhdHRhY2hlZCB0byB0aGUgcG9pbnRlciBzbyBpdCBzaG91bGQgbm90IGJlIGNvbnNpZGVyZWQgb3ZlclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5vdmVyUG9pbnRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggdGhpcy5vdmVyUG9pbnRlcnMuZ2V0KCBpICkuaXNBdHRhY2hlZCgpICkge1xuICAgICAgICAgIHBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaXNPdmVyUHJvcGVydHkgaXMgb25seSBmb3IgdGhlIGBvdmVyYCBldmVudCwgbG9va3NPdmVyUHJvcGVydHkgaW5jbHVkZXMgZm9jdXNlZCBwcmVzc0xpc3RlbmVycyAob25seSB3aGVuIHRoZVxuICAgIC8vIGRpc3BsYXkgaXMgc2hvd2luZyBmb2N1cyBoaWdobGlnaHRzKVxuICAgIHRoaXMuaXNPdmVyUHJvcGVydHkudmFsdWUgPSAoIHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aCA+IDAgJiYgIXBvaW50ZXJBdHRhY2hlZFRvT3RoZXIgKTtcbiAgICB0aGlzLmxvb2tzT3ZlclByb3BlcnR5LnZhbHVlID0gdGhpcy5pc092ZXJQcm9wZXJ0eS52YWx1ZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuaXNGb2N1c2VkUHJvcGVydHkudmFsdWUgJiYgISF0aGlzLmRpc3BsYXkgJiYgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21wdXRlcyB0aGUgdmFsdWUgZm9yIGlzSG92ZXJpbmdQcm9wZXJ0eS4gU2VwYXJhdGUgdG8gcmVkdWNlIGFub255bW91cyBmdW5jdGlvbiBjbG9zdXJlcy5cbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZUhvdmVyaW5nKCk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub3ZlclBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IHRoaXMub3ZlclBvaW50ZXJzWyBpIF07XG4gICAgICBpZiAoICFwb2ludGVyLmlzRG93biB8fCBwb2ludGVyID09PSB0aGlzLnBvaW50ZXIgKSB7XG4gICAgICAgIHRoaXMuaXNIb3ZlcmluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29tcHV0ZXMgdGhlIHZhbHVlIGZvciBpc0hpZ2hsaWdodGVkUHJvcGVydHkuIFNlcGFyYXRlIHRvIHJlZHVjZSBhbm9ueW1vdXMgZnVuY3Rpb24gY2xvc3VyZXMuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVIaWdobGlnaHRlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuaXNIb3ZlcmluZ1Byb3BlcnR5LnZhbHVlIHx8IHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogRmlyZWQgd2hlbiB0aGUgZW5hYmxlZFByb3BlcnR5IGNoYW5nZXNcbiAgICovXG4gIHByb3RlY3RlZCBvbkVuYWJsZWRQcm9wZXJ0eUNoYW5nZSggZW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAhZW5hYmxlZCAmJiB0aGlzLmludGVycnVwdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVybmFsIGNvZGUgZXhlY3V0ZWQgYXMgdGhlIGZpcnN0IHN0ZXAgb2YgYSBwcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSBbdGFyZ2V0Tm9kZV0gLSBJZiBwcm92aWRlZCwgd2lsbCB0YWtlIHRoZSBwbGFjZSBvZiB0aGUgdGFyZ2V0Tm9kZSBmb3IgdGhpcyBjYWxsLiBVc2VmdWwgZm9yXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yd2FyZGVkIHByZXNzZXMuXG4gICAqIEBwYXJhbSBbY2FsbGJhY2tdIC0gdG8gYmUgcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGZ1bmN0aW9uLCBidXQgb25seSBvbiBzdWNjZXNzXG4gICAqL1xuICBwcml2YXRlIG9uUHJlc3MoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIHRhcmdldE5vZGU6IE5vZGUgfCBudWxsLCBjYWxsYmFjazogKCAoKSA9PiB2b2lkICkgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRGlzcG9zZWQsICdTaG91bGQgbm90IHByZXNzIG9uIGEgZGlzcG9zZWQgbGlzdGVuZXInICk7XG5cbiAgICBjb25zdCBnaXZlblRhcmdldE5vZGUgPSB0YXJnZXROb2RlIHx8IHRoaXMuX3RhcmdldE5vZGU7XG5cbiAgICAvLyBTZXQgdGhpcyBwcm9wZXJ0aWVzIGJlZm9yZSB0aGUgcHJvcGVydHkgY2hhbmdlLCBzbyB0aGV5IGFyZSB2aXNpYmxlIHRvIGxpc3RlbmVycy5cbiAgICB0aGlzLnBvaW50ZXIgPSBldmVudC5wb2ludGVyO1xuICAgIHRoaXMucHJlc3NlZFRyYWlsID0gZ2l2ZW5UYXJnZXROb2RlID8gZ2l2ZW5UYXJnZXROb2RlLmdldFVuaXF1ZVRyYWlsKCkgOiBldmVudC50cmFpbC5zdWJ0cmFpbFRvKCBldmVudC5jdXJyZW50VGFyZ2V0ISwgZmFsc2UgKTtcblxuICAgIHRoaXMuaW50ZXJydXB0ZWQgPSBmYWxzZTsgLy8gY2xlYXJzIHRoZSBmbGFnIChkb24ndCBzZXQgdG8gZmFsc2UgYmVmb3JlIGhlcmUpXG5cbiAgICB0aGlzLnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyLCB0aGlzLl9hdHRhY2ggKTtcbiAgICB0aGlzLl9saXN0ZW5pbmdUb1BvaW50ZXIgPSB0cnVlO1xuXG4gICAgdGhpcy5wb2ludGVyLmN1cnNvciA9IHRoaXMucHJlc3NlZFRyYWlsLmxhc3ROb2RlKCkuZ2V0RWZmZWN0aXZlQ3Vyc29yKCkgfHwgdGhpcy5fcHJlc3NDdXJzb3I7XG5cbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcblxuICAgIC8vIE5vdGlmeSBhZnRlciBldmVyeXRoaW5nIGVsc2UgaXMgc2V0IHVwXG4gICAgdGhpcy5fcHJlc3NMaXN0ZW5lciggZXZlbnQsIHRoaXMgKTtcblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJuYWwgY29kZSBleGVjdXRlZCBhcyB0aGUgZmlyc3Qgc3RlcCBvZiBhIHJlbGVhc2UuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudCAtIHNjZW5lcnkgZXZlbnQgaWYgdGhlcmUgd2FzIG9uZVxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSByZWxlYXNlXG4gICAqL1xuICBwcml2YXRlIG9uUmVsZWFzZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCB8IG51bGwsIGNhbGxiYWNrOiAoICgpID0+IHZvaWQgKSB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc1ByZXNzZWQsICdUaGlzIGxpc3RlbmVyIGlzIG5vdCBwcmVzc2VkJyApO1xuICAgIGNvbnN0IHByZXNzZWRMaXN0ZW5lciA9IHRoaXMgYXMgUHJlc3NlZFByZXNzTGlzdGVuZXI7XG5cbiAgICBwcmVzc2VkTGlzdGVuZXIucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcbiAgICB0aGlzLl9saXN0ZW5pbmdUb1BvaW50ZXIgPSBmYWxzZTtcblxuICAgIC8vIFNldCB0aGUgcHJlc3NlZCBzdGF0ZSBmYWxzZSAqYmVmb3JlKiBpbnZva2luZyB0aGUgY2FsbGJhY2ssIG90aGVyd2lzZSBhbiBpbmZpbml0ZSBsb29wIGNhbiByZXN1bHQgaW4gc29tZVxuICAgIC8vIGNpcmN1bXN0YW5jZXMuXG4gICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuXG4gICAgLy8gTm90aWZ5IGFmdGVyIHRoZSByZXN0IG9mIHJlbGVhc2UgaXMgY2FsbGVkIGluIG9yZGVyIHRvIHByZXZlbnQgaXQgZnJvbSB0cmlnZ2VyaW5nIGludGVycnVwdCgpLlxuICAgIHRoaXMuX3JlbGVhc2VMaXN0ZW5lciggZXZlbnQsIHRoaXMgKTtcblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG5cbiAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBjbGVhcmVkIG5vdywgYXQgdGhlIGVuZCBvZiB0aGUgb25SZWxlYXNlLCBpbiBjYXNlIHRoZXkgd2VyZSBuZWVkZWQgYnkgdGhlIGNhbGxiYWNrIG9yIGluXG4gICAgLy8gbGlzdGVuZXJzIG9uIHRoZSBwcmVzc2VkIFByb3BlcnR5LlxuICAgIHByZXNzZWRMaXN0ZW5lci5wb2ludGVyLmN1cnNvciA9IG51bGw7XG4gICAgdGhpcy5wb2ludGVyID0gbnVsbDtcbiAgICB0aGlzLnByZXNzZWRUcmFpbCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdpdGggJ2Rvd24nIGV2ZW50cyAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LiBTZWUgdGhlIHByZXNzIG1ldGhvZCBpbnN0ZWFkLlxuICAgKi9cbiAgcHVibGljIGRvd24oIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBkb3duYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5wcmVzcyggZXZlbnQgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdpdGggJ3VwJyBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBEbyBub3QgY2FsbCBkaXJlY3RseS5cbiAgICovXG4gIHB1YmxpYyB1cCggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IHVwYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gUmVjYWxjdWxhdGUgb3Zlci9ob3ZlcmluZyBQcm9wZXJ0aWVzLlxuICAgIHRoaXMuaW52YWxpZGF0ZU92ZXIoKTtcbiAgICB0aGlzLmludmFsaWRhdGVIb3ZlcmluZygpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2l0aCAnZW50ZXInIGV2ZW50cyAocGFydCBvZiB0aGUgbGlzdGVuZXIgQVBJKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxuICAgKi9cbiAgcHVibGljIGVudGVyKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gZW50ZXJgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLm92ZXJQb2ludGVycy5wdXNoKCBldmVudC5wb2ludGVyICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aXRoIGBtb3ZlYCBldmVudHMgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkuIEl0IGlzIG5lY2Vzc2FyeSB0byBjaGVjayBmb3IgYG92ZXJgIHN0YXRlIGNoYW5nZXMgb24gbW92ZVxuICAgKiBpbiBjYXNlIGEgcG9pbnRlciBsaXN0ZW5lciBnZXRzIGludGVycnVwdGVkIGFuZCByZXN1bWVzIG1vdmVtZW50IG92ZXIgYSB0YXJnZXQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG1vdmUoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBtb3ZlYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlT3ZlcigpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2l0aCAnZXhpdCcgZXZlbnRzIChwYXJ0IG9mIHRoZSBsaXN0ZW5lciBBUEkpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogRG8gbm90IGNhbGwgZGlyZWN0bHkuXG4gICAqL1xuICBwdWJsaWMgZXhpdCggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IGV4aXRgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXZSBkb24ndCByZXF1aXJlIHRoZSBwb2ludGVyIHRvIGJlIGluY2x1ZGVkIGhlcmUsIHNpbmNlIHdlIG1heSBoYXZlIGFkZGVkIHRoZSBsaXN0ZW5lciBhZnRlciB0aGUgJ2VudGVyJ1xuICAgIC8vIHdhcyBmaXJlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvMTU5IGZvciBtb3JlIGRldGFpbHMuXG4gICAgaWYgKCB0aGlzLm92ZXJQb2ludGVycy5pbmNsdWRlcyggZXZlbnQucG9pbnRlciApICkge1xuICAgICAgdGhpcy5vdmVyUG9pbnRlcnMucmVtb3ZlKCBldmVudC5wb2ludGVyICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2l0aCAndXAnIGV2ZW50cyBmcm9tIHRoZSBwb2ludGVyIChwYXJ0IG9mIHRoZSBsaXN0ZW5lciBBUEkpIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBEbyBub3QgY2FsbCBkaXJlY3RseS5cbiAgICovXG4gIHB1YmxpYyBwb2ludGVyVXAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBwb2ludGVyIHVwYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gU2luY2Ugb3VyIGNhbGxiYWNrIGNhbiBnZXQgcXVldWVkIHVwIGFuZCBUSEVOIGludGVycnVwdGVkIGJlZm9yZSB0aGlzIGhhcHBlbnMsIHdlJ2xsIGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBhcmVcbiAgICAvLyBzdGlsbCBwcmVzc2VkIGJ5IHRoZSB0aW1lIHdlIGdldCBoZXJlLiBJZiBub3QgcHJlc3NlZCwgdGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGRvLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FwYWNpdG9yLWxhYi1iYXNpY3MvaXNzdWVzLzI1MVxuICAgIGlmICggdGhpcy5pc1ByZXNzZWQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIgKTtcblxuICAgICAgdGhpcy5yZWxlYXNlKCBldmVudCApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdpdGggJ2NhbmNlbCcgZXZlbnRzIGZyb20gdGhlIHBvaW50ZXIgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxuICAgKi9cbiAgcHVibGljIHBvaW50ZXJDYW5jZWwoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBwb2ludGVyIGNhbmNlbGAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIFNpbmNlIG91ciBjYWxsYmFjayBjYW4gZ2V0IHF1ZXVlZCB1cCBhbmQgVEhFTiBpbnRlcnJ1cHRlZCBiZWZvcmUgdGhpcyBoYXBwZW5zLCB3ZSdsbCBjaGVjayB0byBtYWtlIHN1cmUgd2UgYXJlXG4gICAgLy8gc3RpbGwgcHJlc3NlZCBieSB0aGUgdGltZSB3ZSBnZXQgaGVyZS4gSWYgbm90IHByZXNzZWQsIHRoZW4gdGhlcmUgaXMgbm90aGluZyB0byBkby5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhcGFjaXRvci1sYWItYmFzaWNzL2lzc3Vlcy8yNTFcbiAgICBpZiAoIHRoaXMuaXNQcmVzc2VkICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyICk7XG5cbiAgICAgIHRoaXMuaW50ZXJydXB0KCk7IC8vIHdpbGwgbWFyayBhcyBpbnRlcnJ1cHRlZCBhbmQgcmVsZWFzZSgpXG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2l0aCAnbW92ZScgZXZlbnRzIGZyb20gdGhlIHBvaW50ZXIgKHBhcnQgb2YgdGhlIGxpc3RlbmVyIEFQSSkgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IERvIG5vdCBjYWxsIGRpcmVjdGx5LlxuICAgKi9cbiAgcHVibGljIHBvaW50ZXJNb3ZlKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYFByZXNzTGlzdGVuZXIjJHt0aGlzLl9pZH0gcG9pbnRlciBtb3ZlYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gU2luY2Ugb3VyIGNhbGxiYWNrIGNhbiBnZXQgcXVldWVkIHVwIGFuZCBUSEVOIGludGVycnVwdGVkIGJlZm9yZSB0aGlzIGhhcHBlbnMsIHdlJ2xsIGNoZWNrIHRvIG1ha2Ugc3VyZSB3ZSBhcmVcbiAgICAvLyBzdGlsbCBwcmVzc2VkIGJ5IHRoZSB0aW1lIHdlIGdldCBoZXJlLiBJZiBub3QgcHJlc3NlZCwgdGhlbiB0aGVyZSBpcyBub3RoaW5nIHRvIGRvLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FwYWNpdG9yLWxhYi1iYXNpY3MvaXNzdWVzLzI1MVxuICAgIGlmICggdGhpcy5pc1ByZXNzZWQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBldmVudC5wb2ludGVyID09PSB0aGlzLnBvaW50ZXIgKTtcblxuICAgICAgaWYgKCB0aGlzLl9jb2xsYXBzZURyYWdFdmVudHMgKSB7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdDb2xsYXBzZWREcmFnRXZlbnQgPSBldmVudDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmRyYWcoIGV2ZW50ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgcG9pbnRlciBuZWVkcyB0byBpbnRlcnJ1cHQgaXRzIGN1cnJlbnQgbGlzdGVuZXIgKHVzdWFsbHkgc28gYW5vdGhlciBjYW4gYmUgYWRkZWQpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogRG8gbm90IGNhbGwgZGlyZWN0bHkuXG4gICAqL1xuICBwdWJsaWMgcG9pbnRlckludGVycnVwdCgpOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoIGBQcmVzc0xpc3RlbmVyIyR7dGhpcy5faWR9IHBvaW50ZXIgaW50ZXJydXB0YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xpY2sgbGlzdGVuZXIsIGNhbGxlZCB3aGVuIHRoaXMgaXMgdHJlYXRlZCBhcyBhbiBhY2Nlc3NpYmxlIGlucHV0IGxpc3RlbmVyLlxuICAgKiBJbiBnZW5lcmFsIG5vdCBuZWVkZWQgdG8gYmUgcHVibGljLCBidXQganVzdCB1c2VkIGluIGVkZ2UgY2FzZXMgdG8gZ2V0IHByb3BlciBjbGljayBsb2dpYyBmb3IgcGRvbS5cbiAgICpcbiAgICogSGFuZGxlIHRoZSBjbGljayBldmVudCBmcm9tIERPTSBmb3IgUERPTS4gQ2xpY2tzIGJ5IGNhbGxpbmcgcHJlc3MgYW5kIHJlbGVhc2UgaW1tZWRpYXRlbHkuXG4gICAqIFdoZW4gYXNzaXN0aXZlIHRlY2hub2xvZ3kgaXMgdXNlZCwgdGhlIGJyb3dzZXIgbWF5IG5vdCByZWNlaXZlICdrZXlkb3duJyBvciAna2V5dXAnIGV2ZW50cyBvbiBpbnB1dCBlbGVtZW50cywgYnV0XG4gICAqIG9ubHkgYSBzaW5nbGUgJ2NsaWNrJyBldmVudC4gV2UgbmVlZCB0byB0b2dnbGUgdGhlIHByZXNzZWQgc3RhdGUgZnJvbSB0aGUgc2luZ2xlICdjbGljaycgZXZlbnQuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBmaXJlIGxpc3RlbmVycyBpbW1lZGlhdGVseSwgYnV0IGFkZHMgYSBkZWxheSBmb3IgdGhlIHBkb21DbGlja2luZ1Byb3BlcnR5IHNvIHRoYXQgeW91IGNhbiBtYWtlIGFcbiAgICogYnV0dG9uIGxvb2sgcHJlc3NlZCBmcm9tIGEgc2luZ2xlIERPTSBjbGljayBldmVudC4gRm9yIGV4YW1wbGUgdXNhZ2UsIHNlZSBzdW4vQnV0dG9uTW9kZWwubG9va3NQcmVzc2VkUHJvcGVydHkuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSBvcHRpb25hbGx5IGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBwcmVzcywgYnV0IG9ubHkgb24gc3VjY2Vzc2Z1bCBjbGlja1xuICAgKiBAcmV0dXJucyBzdWNjZXNzIC0gUmV0dXJucyB3aGV0aGVyIHRoZSBwcmVzcyB3YXMgYWN0dWFsbHkgc3RhcnRlZFxuICAgKi9cbiAgcHVibGljIGNsaWNrKCBldmVudDogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQ+IHwgbnVsbCwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkICk6IGJvb2xlYW4ge1xuICAgIGlmICggdGhpcy5jYW5DbGljaygpICkge1xuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlOyAvLyBjbGVhcnMgdGhlIGZsYWcgKGRvbid0IHNldCB0byBmYWxzZSBiZWZvcmUgaGVyZSlcblxuICAgICAgdGhpcy5wZG9tQ2xpY2tpbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG5cbiAgICAgIC8vIGVuc3VyZSB0aGF0IGJ1dHRvbiBpcyAnZm9jdXNlZCcgc28gbGlzdGVuZXIgY2FuIGJlIGNhbGxlZCB3aGlsZSBidXR0b24gaXMgZG93blxuICAgICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcblxuICAgICAgLy8gZmlyZSB0aGUgb3B0aW9uYWwgY2FsbGJhY2tcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHRoaXMuX3ByZXNzTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XG5cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG5cbiAgICAgIC8vIG5vIGxvbmdlciBkb3duLCBkb24ndCByZXNldCAnb3Zlcicgc28gYnV0dG9uIGNhbiBiZSBzdHlsZWQgYXMgbG9uZyBhcyBpdCBoYXMgZm9jdXNcbiAgICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcblxuICAgICAgLy8gZmlyZSB0aGUgY2FsbGJhY2sgZnJvbSBvcHRpb25zXG4gICAgICB0aGlzLl9yZWxlYXNlTGlzdGVuZXIoIGV2ZW50LCB0aGlzICk7XG5cbiAgICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IGNsaWNraW5nLCByZW1vdmUgdGhlIHByZXZpb3VzIHRpbWVvdXQgLSB0aGlzIGFzc3VtZXMgdGhhdCBjbGVhclRpbWVvdXQgaXMgYSBub29wIGlmIHRoZVxuICAgICAgLy8gbGlzdGVuZXIgaXMgbm8gbG9uZ2VyIGF0dGFjaGVkXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IFRoaXMgbG9va3MgYnVnZ3ksIHdpbGwgbmVlZCB0byBpZ25vcmUgZm9yIG5vdyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggdGhpcy5fcGRvbUNsaWNraW5nVGltZW91dExpc3RlbmVyICk7XG5cbiAgICAgIC8vIE5vdyBhZGQgdGhlIHRpbWVvdXQgYmFjayB0byBzdGFydCBvdmVyLCBzYXZpbmcgc28gdGhhdCBpdCBjYW4gYmUgcmVtb3ZlZCBsYXRlci4gRXZlbiB3aGVuIHRoaXMgbGlzdGVuZXIgd2FzXG4gICAgICAvLyBpbnRlcnJ1cHRlZCBmcm9tIGFib3ZlIGxvZ2ljLCB3ZSBzdGlsbCBkZWxheSBzZXR0aW5nIHRoaXMgdG8gZmFsc2UgdG8gc3VwcG9ydCB2aXN1YWwgXCJwcmVzc2luZ1wiIHJlZHJhdy5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogVGhpcyBsb29rcyBidWdneSwgd2lsbCBuZWVkIHRvIGlnbm9yZSBmb3Igbm93IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICB0aGlzLl9wZG9tQ2xpY2tpbmdUaW1lb3V0TGlzdGVuZXIgPSBzdGVwVGltZXIuc2V0VGltZW91dCggKCkgPT4ge1xuXG4gICAgICAgIC8vIHRoZSBsaXN0ZW5lciBtYXkgaGF2ZSBiZWVuIGRpc3Bvc2VkIGJlZm9yZSB0aGUgZW5kIG9mIGExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCwgbGlrZSBpZiBpdCBmaXJlcyBhbmRcbiAgICAgICAgLy8gZGlzcG9zZXMgaXRzZWxmIGltbWVkaWF0ZWx5XG4gICAgICAgIGlmICggIXRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkuaXNEaXNwb3NlZCApIHtcbiAgICAgICAgICB0aGlzLnBkb21DbGlja2luZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMuX2ExMXlMb29rc1ByZXNzZWRJbnRlcnZhbCApO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzIGxpc3RlbmVyLCBjYWxsZWQgd2hlbiB0aGlzIGlzIHRyZWF0ZWQgYXMgYW4gYWNjZXNzaWJsZSBpbnB1dCBsaXN0ZW5lciBhbmQgaXRzIHRhcmdldCBpcyBmb2N1c2VkLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICogQHBkb21cbiAgICovXG4gIHB1YmxpYyBmb2N1cyggZXZlbnQ6IFNjZW5lcnlFdmVudDxGb2N1c0V2ZW50PiApOiB2b2lkIHtcblxuICAgIC8vIEdldCB0aGUgRGlzcGxheSByZWxhdGVkIHRvIHRoaXMgYWNjZXNzaWJsZSBldmVudC5cbiAgICBjb25zdCBhY2Nlc3NpYmxlRGlzcGxheXMgPSBldmVudC50cmFpbC5yb290Tm9kZSgpLmdldFJvb3RlZERpc3BsYXlzKCkuZmlsdGVyKCBkaXNwbGF5ID0+IGRpc3BsYXkuaXNBY2Nlc3NpYmxlKCkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhY2Nlc3NpYmxlRGlzcGxheXMubGVuZ3RoID09PSAxLFxuICAgICAgJ2Nhbm5vdCBmb2N1cyBub2RlIHdpdGggemVybyBvciBtdWx0aXBsZSBhY2Nlc3NpYmxlIGRpc3BsYXlzIGF0dGFjaGVkJyApO1xuICAgIC8vXG4gICAgdGhpcy5kaXNwbGF5ID0gYWNjZXNzaWJsZURpc3BsYXlzWyAwIF07XG4gICAgaWYgKCAhdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLmJvdW5kSW52YWxpZGF0ZU92ZXJMaXN0ZW5lciApICkge1xuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRJbnZhbGlkYXRlT3Zlckxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgLy8gT24gZm9jdXMsIGJ1dHRvbiBzaG91bGQgbG9vayAnb3ZlcicuXG4gICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQmx1ciBsaXN0ZW5lciwgY2FsbGVkIHdoZW4gdGhpcyBpcyB0cmVhdGVkIGFzIGFuIGFjY2Vzc2libGUgaW5wdXQgbGlzdGVuZXIuXG4gICAqIEBwZG9tXG4gICAqL1xuICBwdWJsaWMgYmx1cigpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuZGlzcGxheSApIHtcbiAgICAgIGlmICggdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB0aGlzLmJvdW5kSW52YWxpZGF0ZU92ZXJMaXN0ZW5lciApICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLmJvdW5kSW52YWxpZGF0ZU92ZXJMaXN0ZW5lciApO1xuICAgICAgfVxuICAgICAgdGhpcy5kaXNwbGF5ID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBPbiBibHVyLCB0aGUgYnV0dG9uIHNob3VsZCBubyBsb25nZXIgbG9vayAnb3ZlcicuXG4gICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoZSBsaXN0ZW5lciwgcmVsZWFzaW5nIHJlZmVyZW5jZXMuIEl0IHNob3VsZCBub3QgYmUgdXNlZCBhZnRlciB0aGlzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgUHJlc3NMaXN0ZW5lciMke3RoaXMuX2lkfSBkaXNwb3NlYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gV2UgbmVlZCB0byByZWxlYXNlIHJlZmVyZW5jZXMgdG8gYW55IHBvaW50ZXJzIHRoYXQgYXJlIG92ZXIgdXMuXG4gICAgdGhpcy5vdmVyUG9pbnRlcnMuY2xlYXIoKTtcblxuICAgIGlmICggdGhpcy5fbGlzdGVuaW5nVG9Qb2ludGVyICYmIGlzUHJlc3NlZExpc3RlbmVyKCB0aGlzICkgKSB7XG4gICAgICB0aGlzLnBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgLy8gVGhlc2UgUHJvcGVydGllcyBjb3VsZCBoYXZlIGFscmVhZHkgYmVlbiBkaXNwb3NlZCwgZm9yIGV4YW1wbGUgaW4gdGhlIHN1biBidXR0b24gaGllcmFyY2h5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvMzcyXG4gICAgaWYgKCAhdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS5pc0Rpc3Bvc2VkICkge1xuICAgICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciApO1xuICAgICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2lzSG92ZXJpbmdMaXN0ZW5lciApO1xuICAgIH1cbiAgICAhdGhpcy5pc0hvdmVyaW5nUHJvcGVydHkuaXNEaXNwb3NlZCAmJiB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2lzSGlnaGxpZ2h0ZWRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5fcHJlc3NBY3Rpb24uZGlzcG9zZSgpO1xuICAgIHRoaXMuX3JlbGVhc2VBY3Rpb24uZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5sb29rc1ByZXNzZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5wZG9tQ2xpY2tpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5jdXJzb3JQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5pc0ZvY3VzZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5pc0hpZ2hsaWdodGVkUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMuaXNIb3ZlcmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmxvb2tzT3ZlclByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmlzT3ZlclByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLm92ZXJQb2ludGVycy5kaXNwb3NlKCk7XG5cbiAgICAvLyBSZW1vdmUgcmVmZXJlbmNlcyB0byB0aGUgc3RvcmVkIGRpc3BsYXksIGlmIHdlIGhhdmUgYW55LlxuICAgIGlmICggdGhpcy5kaXNwbGF5ICkge1xuICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5ib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuZGlzcGxheSA9IG51bGw7XG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcGhldGlvQVBJID0ge1xuICAgIHByZXNzQWN0aW9uOiB7IHBoZXRpb1R5cGU6IFBoZXRpb0FjdGlvbi5QaGV0aW9BY3Rpb25JTyggWyBTY2VuZXJ5RXZlbnQuU2NlbmVyeUV2ZW50SU8gXSApIH0sXG4gICAgcmVsZWFzZUFjdGlvbjogeyBwaGV0aW9UeXBlOiBQaGV0aW9BY3Rpb24uUGhldGlvQWN0aW9uSU8oIFsgTnVsbGFibGVJTyggU2NlbmVyeUV2ZW50LlNjZW5lcnlFdmVudElPICkgXSApIH1cbiAgfTtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1ByZXNzTGlzdGVuZXInLCBQcmVzc0xpc3RlbmVyICk7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsImNyZWF0ZU9ic2VydmFibGVBcnJheSIsIkRlcml2ZWRQcm9wZXJ0eSIsIkVuYWJsZWRDb21wb25lbnQiLCJzdGVwVGltZXIiLCJvcHRpb25pemUiLCJFdmVudFR5cGUiLCJQaGV0aW9BY3Rpb24iLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJOdWxsYWJsZUlPIiwiTW91c2UiLCJOb2RlIiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsImdsb2JhbElEIiwidHJ1ZVByZWRpY2F0ZSIsIl8iLCJjb25zdGFudCIsImlzUHJlc3NlZExpc3RlbmVyIiwibGlzdGVuZXIiLCJpc1ByZXNzZWQiLCJQcmVzc0xpc3RlbmVyIiwiaXNQcmVzc2VkUHJvcGVydHkiLCJ2YWx1ZSIsImN1cnNvciIsImN1cnNvclByb3BlcnR5IiwiYXR0YWNoIiwiX2F0dGFjaCIsInRhcmdldE5vZGUiLCJfdGFyZ2V0Tm9kZSIsImdldEN1cnJlbnRUYXJnZXQiLCJhc3NlcnQiLCJwcmVzc2VkVHJhaWwiLCJsYXN0Tm9kZSIsImN1cnJlbnRUYXJnZXQiLCJjYW5QcmVzcyIsImV2ZW50IiwiZW5hYmxlZFByb3BlcnR5IiwiX2NhblN0YXJ0UHJlc3MiLCJwb2ludGVyIiwiZG9tRXZlbnQiLCJidXR0b24iLCJfbW91c2VCdXR0b24iLCJpc0F0dGFjaGVkIiwiY2FuQ2xpY2siLCJwcmVzcyIsImNhbGxiYWNrIiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJfaWQiLCJmbHVzaENvbGxhcHNlZERyYWciLCJwdXNoIiwiX3ByZXNzQWN0aW9uIiwiZXhlY3V0ZSIsInBvcCIsInJlbGVhc2UiLCJfcmVsZWFzZUFjdGlvbiIsImRyYWciLCJfZHJhZ0xpc3RlbmVyIiwiaW50ZXJydXB0IiwicGRvbUNsaWNraW5nUHJvcGVydHkiLCJpbnRlcnJ1cHRlZCIsIl9saXN0ZW5pbmdUb1BvaW50ZXIiLCJfcmVsZWFzZUxpc3RlbmVyIiwiaGFzTGlzdGVuZXIiLCJfcGRvbUNsaWNraW5nVGltZW91dExpc3RlbmVyIiwiY2xlYXJUaW1lb3V0IiwiaXNEaXNwb3NlZCIsImNsZWFyT3ZlclBvaW50ZXJzIiwib3ZlclBvaW50ZXJzIiwiY2xlYXIiLCJzdGVwIiwic2V0Q3JlYXRlUGFuVGFyZ2V0Qm91bmRzIiwiY3JlYXRlRHJhZ1BhblRhcmdldEJvdW5kcyIsIl9wb2ludGVyTGlzdGVuZXIiLCJjcmVhdGVQYW5UYXJnZXRCb3VuZHMiLCJzZXRDcmVhdGVQYW5UYXJnZXRCb3VuZHNGcm9tVHJhaWwiLCJ0cmFpbCIsImxlbmd0aCIsImxvY2FsVG9HbG9iYWxCb3VuZHMiLCJsb2NhbEJvdW5kcyIsImNyZWF0ZVBhblRhcmdldEJvdW5kc0Zyb21UcmFpbCIsIl9wZW5kaW5nQ29sbGFwc2VkRHJhZ0V2ZW50IiwiaW52YWxpZGF0ZU92ZXIiLCJwb2ludGVyQXR0YWNoZWRUb090aGVyIiwiaSIsImdldCIsImlzT3ZlclByb3BlcnR5IiwibG9va3NPdmVyUHJvcGVydHkiLCJpc0ZvY3VzZWRQcm9wZXJ0eSIsImRpc3BsYXkiLCJmb2N1c01hbmFnZXIiLCJwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwiaW52YWxpZGF0ZUhvdmVyaW5nIiwiaXNEb3duIiwiaXNIb3ZlcmluZ1Byb3BlcnR5IiwiaW52YWxpZGF0ZUhpZ2hsaWdodGVkIiwiaXNIaWdobGlnaHRlZFByb3BlcnR5Iiwib25FbmFibGVkUHJvcGVydHlDaGFuZ2UiLCJlbmFibGVkIiwib25QcmVzcyIsImdpdmVuVGFyZ2V0Tm9kZSIsImdldFVuaXF1ZVRyYWlsIiwic3VidHJhaWxUbyIsImFkZElucHV0TGlzdGVuZXIiLCJnZXRFZmZlY3RpdmVDdXJzb3IiLCJfcHJlc3NDdXJzb3IiLCJfcHJlc3NMaXN0ZW5lciIsIm9uUmVsZWFzZSIsInByZXNzZWRMaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkb3duIiwidXAiLCJlbnRlciIsIm1vdmUiLCJleGl0IiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJwb2ludGVyVXAiLCJwb2ludGVyQ2FuY2VsIiwicG9pbnRlck1vdmUiLCJfY29sbGFwc2VEcmFnRXZlbnRzIiwicG9pbnRlckludGVycnVwdCIsImNsaWNrIiwic2V0VGltZW91dCIsIl9hMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWwiLCJmb2N1cyIsImFjY2Vzc2libGVEaXNwbGF5cyIsInJvb3ROb2RlIiwiZ2V0Um9vdGVkRGlzcGxheXMiLCJmaWx0ZXIiLCJpc0FjY2Vzc2libGUiLCJib3VuZEludmFsaWRhdGVPdmVyTGlzdGVuZXIiLCJsaW5rIiwiYmx1ciIsInVubGluayIsImRpc3Bvc2UiLCJfaXNIaWdobGlnaHRlZExpc3RlbmVyIiwiX2lzSG92ZXJpbmdMaXN0ZW5lciIsImxvb2tzUHJlc3NlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5vb3AiLCJtb3VzZUJ1dHRvbiIsInByZXNzQ3Vyc29yIiwidXNlSW5wdXRMaXN0ZW5lckN1cnNvciIsImNhblN0YXJ0UHJlc3MiLCJhMTF5TG9va3NQcmVzc2VkSW50ZXJ2YWwiLCJjb2xsYXBzZURyYWdFdmVudHMiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRmVhdHVyZWQiLCJERUZBVUxUX09QVElPTlMiLCJyZWVudHJhbnQiLCJiaW5kIiwib3IiLCJjYW5jZWwiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsInBhcmFtZXRlcnMiLCJuYW1lIiwicGhldGlvVHlwZSIsIlNjZW5lcnlFdmVudElPIiwicGhldGlvUHJpdmF0ZSIsInZhbHVlVHlwZSIsImxlbmd0aFByb3BlcnR5IiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJpc0Rvd25Qcm9wZXJ0eSIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJsYXp5TGluayIsInBoZXRpb0FQSSIsInByZXNzQWN0aW9uIiwiUGhldGlvQWN0aW9uSU8iLCJyZWxlYXNlQWN0aW9uIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQyxHQUVELE9BQU9BLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0MsMkJBQWdELDRDQUE0QztBQUNuRyxPQUFPQyxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLHNCQUFtRCx1Q0FBdUM7QUFDakcsT0FBT0MsZUFBZSxnQ0FBZ0M7QUFJdEQsT0FBT0MsZUFBZSxxQ0FBcUM7QUFHM0QsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0Msa0JBQWtCLHFDQUFxQztBQUM5RCxPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLGdCQUFnQix5Q0FBeUM7QUFDaEUsU0FBa0JDLEtBQUssRUFBRUMsSUFBSSxFQUFXQyxPQUFPLEVBQUVDLFlBQVksUUFBK0IsZ0JBQWdCO0FBRTVHLFNBQVM7QUFDVCxJQUFJQyxXQUFXO0FBRWYsMEZBQTBGO0FBQzFGLE1BQU1DLGdCQUEyREMsRUFBRUMsUUFBUSxDQUFFO0FBNkU3RSxNQUFNQyxvQkFBb0IsQ0FBRUMsV0FBK0RBLFNBQVNDLFNBQVM7QUFFOUYsSUFBQSxBQUFNQyxnQkFBTixNQUFNQSxzQkFBc0JuQjtJQW1SekM7O0dBRUMsR0FDRCxJQUFXa0IsWUFBcUI7UUFDOUIsT0FBTyxJQUFJLENBQUNFLGlCQUFpQixDQUFDQyxLQUFLO0lBQ3JDO0lBRUEsSUFBV0MsU0FBd0I7UUFDakMsT0FBTyxJQUFJLENBQUNDLGNBQWMsQ0FBQ0YsS0FBSztJQUNsQztJQUVB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