// Copyright 2021-2024, University of Colorado Boulder
/**
 * A trait for Node that mixes functionality to support visual highlights that appear on hover with a pointer.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import TinyEmitter from '../../../../axon/js/TinyEmitter.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { DelayedMutate, Focus, Node, scenery } from '../../imports.js';
// constants
// option keys for InteractiveHighlighting, each of these will have a setter and getter and values are applied with mutate()
const INTERACTIVE_HIGHLIGHTING_OPTIONS = [
    'interactiveHighlight',
    'interactiveHighlightLayerable',
    'interactiveHighlightEnabled'
];
const InteractiveHighlighting = memoize((Type)=>{
    // @ts-expect-error
    assert && assert(!Type._mixesInteractiveHighlighting, 'InteractiveHighlighting is already added to this Type');
    const InteractiveHighlightingClass = DelayedMutate('InteractiveHighlightingClass', INTERACTIVE_HIGHLIGHTING_OPTIONS, class InteractiveHighlightingClass extends Type {
        /**
       * Whether a Node composes InteractiveHighlighting.
       */ get _isInteractiveHighlighting() {
            return true;
        }
        static get _mixesInteractiveHighlighting() {
            return true;
        }
        /**
       * Set the interactive highlight for this node. By default, the highlight will be a pink rectangle that surrounds
       * the node's local bounds.
       */ setInteractiveHighlight(interactiveHighlight) {
            if (this._interactiveHighlight !== interactiveHighlight) {
                this._interactiveHighlight = interactiveHighlight;
                if (this._interactiveHighlightLayerable) {
                    // if focus highlight is layerable, it must be a node for the scene graph
                    assert && assert(interactiveHighlight instanceof Node); // eslint-disable-line phet/no-simple-type-checking-assertions
                    // make sure the highlight is invisible, the HighlightOverlay will manage visibility
                    interactiveHighlight.visible = false;
                }
                this.interactiveHighlightChangedEmitter.emit();
            }
        }
        set interactiveHighlight(interactiveHighlight) {
            this.setInteractiveHighlight(interactiveHighlight);
        }
        get interactiveHighlight() {
            return this.getInteractiveHighlight();
        }
        /**
       * Returns the interactive highlight for this Node.
       */ getInteractiveHighlight() {
            return this._interactiveHighlight;
        }
        /**
       * Sets whether the highlight is layerable in the scene graph instead of above everything in the
       * highlight overlay. If layerable, you must provide a custom highlight and it must be a Node. The highlight
       * Node will always be invisible unless this Node is activated with a pointer.
       */ setInteractiveHighlightLayerable(interactiveHighlightLayerable) {
            if (this._interactiveHighlightLayerable !== interactiveHighlightLayerable) {
                this._interactiveHighlightLayerable = interactiveHighlightLayerable;
                if (this._interactiveHighlight) {
                    assert && assert(this._interactiveHighlight instanceof Node);
                    this._interactiveHighlight.visible = false;
                    this.interactiveHighlightChangedEmitter.emit();
                }
            }
        }
        set interactiveHighlightLayerable(interactiveHighlightLayerable) {
            this.setInteractiveHighlightLayerable(interactiveHighlightLayerable);
        }
        get interactiveHighlightLayerable() {
            return this.getInteractiveHighlightLayerable();
        }
        /**
       * Get whether the interactive highlight is layerable in the scene graph.
       */ getInteractiveHighlightLayerable() {
            return this._interactiveHighlightLayerable;
        }
        /**
       * Set the enabled state of Interactive Highlights on this Node. When false, highlights will not activate
       * on this Node with mouse and touch input. You can also disable Interactive Highlights by making the node
       * pickable: false. Use this when you want to disable Interactive Highlights without modifying pickability.
       */ setInteractiveHighlightEnabled(enabled) {
            this._interactiveHighlightEnabled = enabled;
            // Each display has its own focusManager.pointerHighlightsVisibleProperty, so we need to go through all of them
            // and update after this enabled change
            const trailIds = Object.keys(this.displays);
            for(let i = 0; i < trailIds.length; i++){
                const display = this.displays[trailIds[i]];
                this._interactiveHighlightingEnabledListener(display.focusManager.pointerHighlightsVisibleProperty.value);
            }
        }
        /**
       * Are Interactive Highlights enabled for this Node? When false, no highlights activate from mouse and touch.
       */ getInteractiveHighlightEnabled() {
            return this._interactiveHighlightEnabled;
        }
        set interactiveHighlightEnabled(enabled) {
            this.setInteractiveHighlightEnabled(enabled);
        }
        get interactiveHighlightEnabled() {
            return this.getInteractiveHighlightEnabled();
        }
        /**
       * Returns true if this Node is "activated" by a pointer, indicating that a Pointer is over it
       * and this Node mixes InteractiveHighlighting so an interactive highlight should surround it.
       *
       * This algorithm depends on the direct focus over the pointer, the "locked" focus (from an attached listener),
       * and if pointer highlights are visible at all.
       *
       * If you come to desire this private function, instead you should use isInteractiveHighlightActiveProperty.
       *
       */ isInteractiveHighlightActivated() {
            let activated = false;
            const trailIds = Object.keys(this.displays);
            for(let i = 0; i < trailIds.length; i++){
                const display = this.displays[trailIds[i]];
                // Only if the interactive highlights feature is enabled can we be active
                if (display.focusManager.pointerHighlightsVisibleProperty.value) {
                    const pointerFocus = display.focusManager.pointerFocusProperty.value;
                    const lockedPointerFocus = display.focusManager.lockedPointerFocusProperty.value;
                    if (lockedPointerFocus) {
                        if ((lockedPointerFocus == null ? void 0 : lockedPointerFocus.trail.lastNode()) === this) {
                            activated = true;
                            break;
                        }
                    } else if ((pointerFocus == null ? void 0 : pointerFocus.trail.lastNode()) === this) {
                        activated = true;
                        break;
                    }
                }
            }
            return activated;
        }
        handleHighlightActiveChange() {
            // The performance of this is OK at the time of this writing. It depends greatly on how often this function is
            // called, since recalculation involves looping through all instances' displays, but since recalculation only
            // occurs from FocusManager's Property updates (and not on every pointer operation), this is acceptable.
            this._isInteractiveHighlightActiveProperty.value = this.isInteractiveHighlightActivated();
        }
        dispose() {
            this.changedInstanceEmitter.removeListener(this._changedInstanceListener);
            // remove the activation listener if it is currently attached
            if (this.hasInputListener(this._activationListener)) {
                this.removeInputListener(this._activationListener);
            }
            if (this._pointer) {
                this._pointer.removeInputListener(this._pointerListener);
                this._pointer = null;
            }
            // remove listeners on displays and remove Displays from the map
            const trailIds = Object.keys(this.displays);
            for(let i = 0; i < trailIds.length; i++){
                const display = this.displays[trailIds[i]];
                this.onDisplayRemoved(display);
                delete this.displays[trailIds[i]];
            }
            super.dispose && super.dispose();
        }
        /**
       * When the pointer goes 'over' a node (not including children), look for a group focus highlight to
       * activate. This is most useful for InteractiveHighlighting Nodes that act as a "group" container
       * for other nodes. When the pointer leaves a child, we get the 'exited' event on the child, immediately
       * followed by an 'over' event on the parent. This keeps the group highlight visible without any flickering.
       * The group parent must be composed with InteractiveHighlighting so that it has these event listeners.
       */ _onPointerOver(event) {
            // If there is an ancestor that is a group focus highlight that is composed with InteractiveHighlight (
            // (should activate with pointer input)...
            const groupHighlightNode = event.trail.nodes.find((node)=>node.groupFocusHighlight && isInteractiveHighlighting(node));
            if (groupHighlightNode) {
                // trail to the group highlight Node
                const rootToGroupNode = event.trail.subtrailTo(groupHighlightNode);
                const displays = Object.values(this.displays);
                for(let i = 0; i < displays.length; i++){
                    const display = displays[i];
                    // only set focus if current Pointer focus is not defined (from a more descendant Node)
                    if (display.focusManager.pointerFocusProperty.value === null) {
                        display.focusManager.pointerFocusProperty.set(new Focus(display, rootToGroupNode));
                    }
                }
            }
        }
        /**
       * When a Pointer enters this Node, signal to the Displays that the pointer is over this Node so that the
       * HighlightOverlay can be activated.
       *
       * This is most likely how most pointerFocusProperty is set. First we get an `enter` event then we may get
       * a down event or move event which could do further updates on the event Pointer or FocusManager.
       */ _onPointerEntered(event) {
            let lockPointer = false;
            const displays = Object.values(this.displays);
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                if (display.focusManager.pointerFocusProperty.value === null || !event.trail.equals(display.focusManager.pointerFocusProperty.value.trail)) {
                    const newFocus = new Focus(display, event.trail);
                    display.focusManager.pointerFocusProperty.set(newFocus);
                    if (display.focusManager.lockedPointerFocusProperty.value === null && event.pointer.attachedListener) {
                        this.lockHighlight(newFocus, display.focusManager);
                        lockPointer = true;
                    }
                }
            }
            if (lockPointer) {
                this.savePointer(event.pointer);
            }
        }
        /**
       * Update highlights when the Pointer moves over this Node. In general, highlights will activate on 'enter'. But
       * in cases where multiple Nodes in a Trail support InteractiveHighlighting this listener can move focus
       * to the most reasonable target (the closest ancestor or descendent that is composed with InteractiveHighlighting).
       */ _onPointerMove(event) {
            let lockPointer = false;
            const displays = Object.values(this.displays);
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                // the SceneryEvent might have gone through a descendant of this Node
                const rootToSelf = event.trail.subtrailTo(this);
                // only do more work on move if the event indicates that pointer focus might have changed.
                if (display.focusManager.pointerFocusProperty.value === null || !rootToSelf.equals(display.focusManager.pointerFocusProperty.value.trail)) {
                    if (!this.getDescendantsUseHighlighting(event.trail)) {
                        const newFocus = new Focus(display, rootToSelf);
                        display.focusManager.pointerFocusProperty.set(newFocus);
                        if (display.focusManager.lockedPointerFocusProperty.value === null && event.pointer.attachedListener) {
                            this.lockHighlight(newFocus, display.focusManager);
                            lockPointer = true;
                        }
                    }
                }
            }
            if (lockPointer) {
                this.savePointer(event.pointer);
            }
        }
        /**
       * When a pointer exits this Node or its children, signal to the Displays that pointer focus has changed to
       * deactivate the HighlightOverlay. This can also fire when visibility/pickability of the Node changes.
       */ _onPointerExited(event) {
            const displays = Object.values(this.displays);
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                display.focusManager.pointerFocusProperty.set(null);
                // An exit event may come from a Node along the trail becoming invisible or unpickable. In that case unlock
                // focus and remove pointer listeners so that highlights can continue to update from new input.
                const lockedPointerFocus = display.focusManager.lockedPointerFocusProperty.value;
                if (!event.trail.isPickable() && (lockedPointerFocus === null || // We do not want to remove the lockedPointerFocus if this event trail has nothing
                // to do with the node that is receiving a locked focus.
                event.trail.containsNode(lockedPointerFocus.trail.lastNode()))) {
                    // unlock and remove pointer listeners
                    this._onPointerRelease(event);
                }
            }
        }
        /**
       * When a pointer goes down on this Node, signal to the Displays that the pointerFocus is locked. On the down
       * event, the pointerFocusProperty will have been set first from the `enter` event.
       */ _onPointerDown(event) {
            if (this._pointer === null) {
                let lockPointer = false;
                const displays = Object.values(this.displays);
                for(let i = 0; i < displays.length; i++){
                    const display = displays[i];
                    const focus = display.focusManager.pointerFocusProperty.value;
                    const locked = !!display.focusManager.lockedPointerFocusProperty.value;
                    // Focus should generally be defined when pointer enters the Node, but it may be null in cases of
                    // cancel or interrupt. Don't attempt to lock if the FocusManager already has a locked highlight (especially
                    // important for gracefully handling multitouch).
                    if (focus && !locked) {
                        assert && assert(!focus.trail.lastNode().isDisposed, 'Focus should not be set to a disposed Node');
                        // Set the lockedPointerFocusProperty with a copy of the Focus (as deep as possible) because we want
                        // to keep a reference to the old Trail while pointerFocusProperty changes.
                        this.lockHighlight(focus, display.focusManager);
                        lockPointer = true;
                    }
                }
                if (lockPointer) {
                    this.savePointer(event.pointer);
                }
            }
        }
        onDisplayAdded(display) {
            // Listener may already by on the display in cases of DAG, only add if this is the first instance of this Node
            if (!display.focusManager.pointerHighlightsVisibleProperty.hasListener(this._interactiveHighlightingEnabledListener)) {
                display.focusManager.pointerHighlightsVisibleProperty.link(this._interactiveHighlightingEnabledListener);
            }
        }
        onDisplayRemoved(display) {
            // Pointer focus was locked due to interaction with this listener, but unlocked because of other
            // scenery-internal listeners. But the Property still has this listener so it needs to be removed now.
            if (display.focusManager.lockedPointerFocusProperty.hasListener(this._boundPointerFocusClearedListener)) {
                display.focusManager.lockedPointerFocusProperty.unlink(this._boundPointerFocusClearedListener);
            }
            display.focusManager.pointerHighlightsVisibleProperty.unlink(this._interactiveHighlightingEnabledListener);
        }
        /**
       * When a Pointer goes up after going down on this Node, signal to the Displays that the pointerFocusProperty no
       * longer needs to be locked.
       *
       * @param [event] - may be called during interrupt or cancel, in which case there is no event
       */ _onPointerRelease(event) {
            const displays = Object.values(this.displays);
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                display.focusManager.lockedPointerFocusProperty.value = null;
                // Unlink the listener that was watching for the lockedPointerFocusProperty to be cleared externally
                if (display.focusManager.lockedPointerFocusProperty.hasListener(this._boundPointerFocusClearedListener)) {
                    display.focusManager.lockedPointerFocusProperty.unlink(this._boundPointerFocusClearedListener);
                }
            }
            if (this._pointer && this._pointer.listeners.includes(this._pointerListener)) {
                this._pointer.removeInputListener(this._pointerListener);
                this._pointer = null;
            }
        }
        /**
       * If the pointer listener is cancelled or interrupted, clear focus and remove input listeners.
       */ _onPointerCancel(event) {
            const displays = Object.values(this.displays);
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                display.focusManager.pointerFocusProperty.set(null);
            }
            // unlock and remove pointer listeners
            this._onPointerRelease(event);
        }
        /**
       * Save the Pointer and add a listener to it to remove highlights when a pointer is released/cancelled.
       */ savePointer(eventPointer) {
            assert && assert(this._pointer === null, 'It should be impossible to already have a Pointer before locking from touchSnag');
            this._pointer = eventPointer;
            this._pointer.addInputListener(this._pointerListener);
        }
        /**
       * Sets the "locked" focus for Interactive Highlighting. The "locking" makes sure that the highlight remains
       * active on the Node that is receiving interaction even when the pointer has move away from the Node
       * (but presumably is still down somewhere else on the screen).
       */ lockHighlight(newFocus, focusManager) {
            assert && assert(this._pointer === null, 'It should be impossible to already have a Pointer before locking from touchSnag');
            // A COPY of the focus is saved to the Property because we need the value of the Trail at this event.
            focusManager.lockedPointerFocusProperty.set(new Focus(newFocus.display, newFocus.trail.copy()));
            // Attach a listener that will clear the pointer and its listener if the lockedPointerFocusProperty is cleared
            // externally (not by InteractiveHighlighting).
            assert && assert(!focusManager.lockedPointerFocusProperty.hasListener(this._boundPointerFocusClearedListener), 'this listener still on the lockedPointerFocusProperty indicates a memory leak');
            focusManager.lockedPointerFocusProperty.link(this._boundPointerFocusClearedListener);
        }
        /**
       * FocusManager.lockedPointerFocusProperty does not belong to InteractiveHighlighting and can be cleared
       * for any reason. If it is set to null while a pointer is down we need to release the Pointer and remove input
       * listeners.
       */ handleLockedPointerFocusCleared(lockedPointerFocus) {
            if (lockedPointerFocus === null) {
                this._onPointerRelease();
            }
        }
        /**
       * Add or remove listeners related to activating interactive highlighting when the feature becomes enabled.
       * Work related to interactive highlighting is avoided unless the feature is enabled.
       */ _onInteractiveHighlightingEnabledChange(featureEnabled) {
            // Only listen to the activation listener if the feature is enabled and highlighting is enabled for this Node.
            const enabled = featureEnabled && this._interactiveHighlightEnabled;
            const hasActivationListener = this.hasInputListener(this._activationListener);
            if (enabled && !hasActivationListener) {
                this.addInputListener(this._activationListener);
            } else if (!enabled && hasActivationListener) {
                this.removeInputListener(this._activationListener);
            }
            // If now displayed, then we should recompute if we are active or not.
            this.handleHighlightActiveChange();
        }
        /**
       * Add the Display to the collection when this Node is added to a scene graph. Also adds listeners to the
       * Display that turns on highlighting when the feature is enabled.
       */ onChangedInstance(instance, added) {
            assert && assert(instance.trail, 'should have a trail');
            assert && assert(instance.display, 'should have a display');
            const uniqueId = instance.trail.uniqueId;
            if (added) {
                const display = instance.display; // eslint-disable-line @typescript-eslint/non-nullable-type-assertion-style
                this.displays[uniqueId] = display;
                this.onDisplayAdded(display);
            } else {
                assert && assert(instance.node, 'should have a node');
                const display = this.displays[uniqueId];
                assert && assert(display, `interactive highlighting does not have a Display for removed instance: ${uniqueId}`);
                // If the node was disposed, this display reference has already been cleaned up, but instances are updated
                // (disposed) on the next frame after the node was disposed. Only unlink if there are no more instances of
                // this node;
                instance.node.instances.length === 0 && this.onDisplayRemoved(display);
                delete this.displays[uniqueId];
            }
        }
        /**
       * Returns true if any nodes from this Node to the leaf of the Trail use Voicing features in some way. In
       * general, we do not want to activate voicing features in this case because the leaf-most Nodes in the Trail
       * should be activated instead.
       * @mixin-protected - made public for use in the mixin only
       */ getDescendantsUseHighlighting(trail) {
            const indexOfSelf = trail.nodes.indexOf(this);
            // all the way to length, end not included in slice - and if start value is greater than index range
            // an empty array is returned
            const childToLeafNodes = trail.nodes.slice(indexOfSelf + 1, trail.nodes.length);
            // if any of the nodes from leaf to self use InteractiveHighlighting, they should receive input, and we shouldn't
            // speak the content for this Node
            let descendantsUseVoicing = false;
            for(let i = 0; i < childToLeafNodes.length; i++){
                if (isInteractiveHighlighting(childToLeafNodes[i])) {
                    descendantsUseVoicing = true;
                    break;
                }
            }
            return descendantsUseVoicing;
        }
        mutate(options) {
            return super.mutate(options);
        }
        constructor(...args){
            super(...args), // A reference to the Pointer so that we can add and remove listeners from it when necessary.
            // Since this is on the trait, only one pointer can have a listener for this Node that uses InteractiveHighlighting
            // at one time.
            this._pointer = null, // A map that collects all of the Displays that this InteractiveHighlighting Node is
            // attached to, mapping the unique ID of the Instance Trail to the Display. We need a reference to the
            // Displays to activate the Focus Property associated with highlighting, and to add/remove listeners when
            // features that require highlighting are enabled/disabled. Note that this is updated asynchronously
            // (with updateDisplay) since Instances are added asynchronously.
            // @mixin-protected - made public for use in the mixin only
            this.displays = {}, // The highlight that will surround this Node when it is activated and a Pointer is currently over it. When
            // null, the focus highlight will be used (as defined in ParallelDOM.js).
            this._interactiveHighlight = null, // If true, the highlight will be layerable in the scene graph instead of drawn
            // above everything in the HighlightOverlay. If true, you are responsible for adding the interactiveHighlight
            // in the location you want in the scene graph. The interactiveHighlight will become visible when
            // this.isInteractiveHighlightActiveProperty is true.
            this._interactiveHighlightLayerable = false, // If true, the highlight will be displayed on activation input. If false, it will not and we can remove listeners
            // that would do this work.
            this._interactiveHighlightEnabled = true, // Emits an event when the interactive highlight changes for this Node
            this.interactiveHighlightChangedEmitter = new TinyEmitter(), this._isInteractiveHighlightActiveProperty = new TinyProperty(false);
            this._activationListener = {
                enter: this._onPointerEntered.bind(this),
                over: this._onPointerOver.bind(this),
                move: this._onPointerMove.bind(this),
                exit: this._onPointerExited.bind(this),
                down: this._onPointerDown.bind(this)
            };
            this._changedInstanceListener = this.onChangedInstance.bind(this);
            // This is potentially dangerous to listen to generally, but in this case it is safe because the state we change
            // will only affect a separate display's state, not this one.
            this.changedInstanceEmitter.addListener(this._changedInstanceListener);
            this._interactiveHighlightingEnabledListener = this._onInteractiveHighlightingEnabledChange.bind(this);
            this._boundPointerFocusClearedListener = this.handleLockedPointerFocusCleared.bind(this);
            const boundPointerReleaseListener = this._onPointerRelease.bind(this);
            const boundPointerCancel = this._onPointerCancel.bind(this);
            this._pointerListener = {
                up: boundPointerReleaseListener,
                cancel: boundPointerCancel,
                interrupt: boundPointerCancel
            };
            this.isInteractiveHighlightActiveProperty = this._isInteractiveHighlightActiveProperty;
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ InteractiveHighlightingClass.prototype._mutatorKeys = INTERACTIVE_HIGHLIGHTING_OPTIONS.concat(InteractiveHighlightingClass.prototype._mutatorKeys);
    assert && assert(InteractiveHighlightingClass.prototype._mutatorKeys.length === _.uniq(InteractiveHighlightingClass.prototype._mutatorKeys).length, 'duplicate mutator keys in InteractiveHighlighting');
    return InteractiveHighlightingClass;
});
export function isInteractiveHighlighting(something) {
    return something instanceof Node && something._isInteractiveHighlighting;
}
scenery.register('InteractiveHighlighting', InteractiveHighlighting);
export default InteractiveHighlighting;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS92b2ljaW5nL0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgdHJhaXQgZm9yIE5vZGUgdGhhdCBtaXhlcyBmdW5jdGlvbmFsaXR5IHRvIHN1cHBvcnQgdmlzdWFsIGhpZ2hsaWdodHMgdGhhdCBhcHBlYXIgb24gaG92ZXIgd2l0aCBhIHBvaW50ZXIuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVtb2l6ZS5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgRGVsYXllZE11dGF0ZSwgRGlzcGxheSwgRm9jdXMsIEZvY3VzTWFuYWdlciwgSW5zdGFuY2UsIE5vZGUsIFBvaW50ZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIsIFRyYWlsIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBIaWdobGlnaHQgfSBmcm9tICcuLi8uLi9vdmVybGF5cy9IaWdobGlnaHRPdmVybGF5LmpzJztcblxuLy8gY29uc3RhbnRzXG4vLyBvcHRpb24ga2V5cyBmb3IgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIGVhY2ggb2YgdGhlc2Ugd2lsbCBoYXZlIGEgc2V0dGVyIGFuZCBnZXR0ZXIgYW5kIHZhbHVlcyBhcmUgYXBwbGllZCB3aXRoIG11dGF0ZSgpXG5jb25zdCBJTlRFUkFDVElWRV9ISUdITElHSFRJTkdfT1BUSU9OUyA9IFtcbiAgJ2ludGVyYWN0aXZlSGlnaGxpZ2h0JyxcbiAgJ2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlJyxcbiAgJ2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCdcbl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGludGVyYWN0aXZlSGlnaGxpZ2h0PzogSGlnaGxpZ2h0O1xuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZT86IGJvb2xlYW47XG4gIGludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ09wdGlvbnMgPSBTZWxmT3B0aW9ucztcblxuLy8gTm9ybWFsbHkgb3VyIHByb2plY3QgcHJlZmVycyB0eXBlIGFsaWFzZXMgdG8gaW50ZXJmYWNlcywgYnV0IGludGVyZmFjZXMgYXJlIG5lY2Vzc2FyeSBmb3IgY29ycmVjdCB1c2FnZSBvZiBcInRoaXNcIiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YXNrcy9pc3N1ZXMvMTEzMlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnNcbmV4cG9ydCBpbnRlcmZhY2UgVEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nPFN1cGVyVHlwZSBleHRlbmRzIE5vZGUgPSBOb2RlPiB7XG5cbiAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgZGlzcGxheXM6IFJlY29yZDxzdHJpbmcsIERpc3BsYXk+O1xuXG4gIGludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyO1xuICByZWFkb25seSBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIFByZWZlciBleHBvcnRlZCBmdW5jdGlvbiBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCkgZm9yIGJldHRlciBUeXBlU2NyaXB0IHN1cHBvcnRcbiAgcmVhZG9ubHkgX2lzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmc6IHRydWU7XG5cbiAgc2V0SW50ZXJhY3RpdmVIaWdobGlnaHQoIGludGVyYWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgKTogdm9pZDtcblxuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodDogSGlnaGxpZ2h0O1xuXG4gIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodDtcblxuICBzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSggaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGU6IGJvb2xlYW4gKTogdm9pZDtcblxuICBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZTogYm9vbGVhbjtcblxuICBnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSgpOiBib29sZWFuO1xuXG4gIHNldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApOiB2b2lkO1xuXG4gIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCgpOiBib29sZWFuO1xuXG4gIGludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZDogYm9vbGVhbjtcblxuICBoYW5kbGVIaWdobGlnaHRBY3RpdmVDaGFuZ2UoKTogdm9pZDtcblxuICBvbkNoYW5nZWRJbnN0YW5jZSggaW5zdGFuY2U6IEluc3RhbmNlLCBhZGRlZDogYm9vbGVhbiApOiB2b2lkO1xuXG4gIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gIGdldERlc2NlbmRhbnRzVXNlSGlnaGxpZ2h0aW5nKCB0cmFpbDogVHJhaWwgKTogYm9vbGVhbjtcblxuICAvLyBCZXR0ZXIgb3B0aW9ucyB0eXBlIGZvciB0aGUgc3VidHlwZSBpbXBsZW1lbnRhdGlvbiB0aGF0IGFkZHMgbXV0YXRvciBrZXlzXG4gIG11dGF0ZSggb3B0aW9ucz86IFNlbGZPcHRpb25zICYgUGFyYW1ldGVyczxTdXBlclR5cGVbICdtdXRhdGUnIF0+WyAwIF0gKTogdGhpcztcbn1cblxuY29uc3QgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgPSBtZW1vaXplKCA8U3VwZXJUeXBlIGV4dGVuZHMgQ29uc3RydWN0b3I8Tm9kZT4+KCBUeXBlOiBTdXBlclR5cGUgKTogU3VwZXJUeXBlICYgQ29uc3RydWN0b3I8VEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nPEluc3RhbmNlVHlwZTxTdXBlclR5cGU+Pj4gPT4ge1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgYXNzZXJ0ICYmIGFzc2VydCggIVR5cGUuX21peGVzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsICdJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyBpcyBhbHJlYWR5IGFkZGVkIHRvIHRoaXMgVHlwZScgKTtcblxuICBjb25zdCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzID0gRGVsYXllZE11dGF0ZSggJ0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3MnLCBJTlRFUkFDVElWRV9ISUdITElHSFRJTkdfT1BUSU9OUyxcbiAgICBjbGFzcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzIGV4dGVuZHMgVHlwZSBpbXBsZW1lbnRzIFRJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZzxJbnN0YW5jZVR5cGU8U3VwZXJUeXBlPj4ge1xuXG4gICAgICAvLyBJbnB1dCBsaXN0ZW5lciB0byBhY3RpdmF0ZSB0aGUgSGlnaGxpZ2h0T3ZlcmxheSB1cG9uIHBvaW50ZXIgaW5wdXQuIFVzZXMgZXhpdCBhbmQgZW50ZXIgaW5zdGVhZCBvZiBvdmVyIGFuZCBvdXRcbiAgICAgIC8vIGJlY2F1c2Ugd2UgZG8gbm90IHdhbnQgdGhpcyB0byBmaXJlIGZyb20gYnViYmxpbmcuIFRoZSBoaWdobGlnaHQgc2hvdWxkIGJlIGFyb3VuZCB0aGlzIE5vZGUgd2hlbiBpdCByZWNlaXZlc1xuICAgICAgLy8gaW5wdXQuXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9hY3RpdmF0aW9uTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyO1xuXG4gICAgICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgUG9pbnRlciBzbyB0aGF0IHdlIGNhbiBhZGQgYW5kIHJlbW92ZSBsaXN0ZW5lcnMgZnJvbSBpdCB3aGVuIG5lY2Vzc2FyeS5cbiAgICAgIC8vIFNpbmNlIHRoaXMgaXMgb24gdGhlIHRyYWl0LCBvbmx5IG9uZSBwb2ludGVyIGNhbiBoYXZlIGEgbGlzdGVuZXIgZm9yIHRoaXMgTm9kZSB0aGF0IHVzZXMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdcbiAgICAgIC8vIGF0IG9uZSB0aW1lLlxuICAgICAgcHJpdmF0ZSBfcG9pbnRlcjogbnVsbCB8IFBvaW50ZXIgPSBudWxsO1xuXG4gICAgICAvLyBBIG1hcCB0aGF0IGNvbGxlY3RzIGFsbCBvZiB0aGUgRGlzcGxheXMgdGhhdCB0aGlzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIE5vZGUgaXNcbiAgICAgIC8vIGF0dGFjaGVkIHRvLCBtYXBwaW5nIHRoZSB1bmlxdWUgSUQgb2YgdGhlIEluc3RhbmNlIFRyYWlsIHRvIHRoZSBEaXNwbGF5LiBXZSBuZWVkIGEgcmVmZXJlbmNlIHRvIHRoZVxuICAgICAgLy8gRGlzcGxheXMgdG8gYWN0aXZhdGUgdGhlIEZvY3VzIFByb3BlcnR5IGFzc29jaWF0ZWQgd2l0aCBoaWdobGlnaHRpbmcsIGFuZCB0byBhZGQvcmVtb3ZlIGxpc3RlbmVycyB3aGVuXG4gICAgICAvLyBmZWF0dXJlcyB0aGF0IHJlcXVpcmUgaGlnaGxpZ2h0aW5nIGFyZSBlbmFibGVkL2Rpc2FibGVkLiBOb3RlIHRoYXQgdGhpcyBpcyB1cGRhdGVkIGFzeW5jaHJvbm91c2x5XG4gICAgICAvLyAod2l0aCB1cGRhdGVEaXNwbGF5KSBzaW5jZSBJbnN0YW5jZXMgYXJlIGFkZGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgIHB1YmxpYyBkaXNwbGF5czogUmVjb3JkPHN0cmluZywgRGlzcGxheT4gPSB7fTtcblxuICAgICAgLy8gVGhlIGhpZ2hsaWdodCB0aGF0IHdpbGwgc3Vycm91bmQgdGhpcyBOb2RlIHdoZW4gaXQgaXMgYWN0aXZhdGVkIGFuZCBhIFBvaW50ZXIgaXMgY3VycmVudGx5IG92ZXIgaXQuIFdoZW5cbiAgICAgIC8vIG51bGwsIHRoZSBmb2N1cyBoaWdobGlnaHQgd2lsbCBiZSB1c2VkIChhcyBkZWZpbmVkIGluIFBhcmFsbGVsRE9NLmpzKS5cbiAgICAgIHByaXZhdGUgX2ludGVyYWN0aXZlSGlnaGxpZ2h0OiBIaWdobGlnaHQgPSBudWxsO1xuXG4gICAgICAvLyBJZiB0cnVlLCB0aGUgaGlnaGxpZ2h0IHdpbGwgYmUgbGF5ZXJhYmxlIGluIHRoZSBzY2VuZSBncmFwaCBpbnN0ZWFkIG9mIGRyYXduXG4gICAgICAvLyBhYm92ZSBldmVyeXRoaW5nIGluIHRoZSBIaWdobGlnaHRPdmVybGF5LiBJZiB0cnVlLCB5b3UgYXJlIHJlc3BvbnNpYmxlIGZvciBhZGRpbmcgdGhlIGludGVyYWN0aXZlSGlnaGxpZ2h0XG4gICAgICAvLyBpbiB0aGUgbG9jYXRpb24geW91IHdhbnQgaW4gdGhlIHNjZW5lIGdyYXBoLiBUaGUgaW50ZXJhY3RpdmVIaWdobGlnaHQgd2lsbCBiZWNvbWUgdmlzaWJsZSB3aGVuXG4gICAgICAvLyB0aGlzLmlzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmVQcm9wZXJ0eSBpcyB0cnVlLlxuICAgICAgcHJpdmF0ZSBfaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgPSBmYWxzZTtcblxuICAgICAgLy8gSWYgdHJ1ZSwgdGhlIGhpZ2hsaWdodCB3aWxsIGJlIGRpc3BsYXllZCBvbiBhY3RpdmF0aW9uIGlucHV0LiBJZiBmYWxzZSwgaXQgd2lsbCBub3QgYW5kIHdlIGNhbiByZW1vdmUgbGlzdGVuZXJzXG4gICAgICAvLyB0aGF0IHdvdWxkIGRvIHRoaXMgd29yay5cbiAgICAgIHByaXZhdGUgX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCA9IHRydWU7XG5cbiAgICAgIC8vIEVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIGludGVyYWN0aXZlIGhpZ2hsaWdodCBjaGFuZ2VzIGZvciB0aGlzIE5vZGVcbiAgICAgIHB1YmxpYyBpbnRlcmFjdGl2ZUhpZ2hsaWdodENoYW5nZWRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gICAgICAvLyBUaGlzIFByb3BlcnR5IHdpbGwgYmUgdHJ1ZSB3aGVuIHRoaXMgbm9kZSBoYXMgaGlnaGxpZ2h0cyBhY3RpdmF0ZWQgb24gaXQuIFNlZSBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZhdGVkKCkuXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2lzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICAgIC8vIFdoZW4gbmV3IGluc3RhbmNlcyBvZiB0aGlzIE5vZGUgYXJlIGNyZWF0ZWQsIGFkZHMgYW4gZW50cnkgdG8gdGhlIG1hcCBvZiBEaXNwbGF5cy5cbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2NoYW5nZWRJbnN0YW5jZUxpc3RlbmVyOiAoIGluc3RhbmNlOiBJbnN0YW5jZSwgYWRkZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xuXG4gICAgICAvLyBMaXN0ZW5lciB0aGF0IGFkZHMvcmVtb3ZlcyBvdGhlciBsaXN0ZW5lcnMgdGhhdCBhY3RpdmF0ZSBoaWdobGlnaHRzIHdoZW5cbiAgICAgIC8vIHRoZSBmZWF0dXJlIGJlY29tZXMgZW5hYmxlZC9kaXNhYmxlZCBzbyB0aGF0IHdlIGRvbid0IGRvIGV4dHJhIHdvcmsgcmVsYXRlZCB0byBoaWdobGlnaHRpbmcgdW5sZXNzXG4gICAgICAvLyBpdCBpcyBuZWNlc3NhcnkuXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9pbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRMaXN0ZW5lcjogKCBlbmFibGVkOiBib29sZWFuICkgPT4gdm9pZDtcblxuICAgICAgLy8gQSBsaXN0ZW5lciB0aGF0IGlzIGFkZGVkIHRvIHRoZSBGb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgdG8gY2xlYXIgdGhpcy5fcG9pbnRlciBhbmQgaXRzIGxpc3RlbmVycyBmcm9tXG4gICAgICAvLyB0aGlzIGluc3RhbmNlIHdoZW4gdGhlIGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IGlzIHNldCB0byBudWxsIGV4dGVybmFsbHkgKG5vdCBieSBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZykuXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF9ib3VuZFBvaW50ZXJGb2N1c0NsZWFyZWRMaXN0ZW5lcjogKCBsb2NrZWRQb2ludGVyRm9jdXM6IEZvY3VzIHwgbnVsbCApID0+IHZvaWQ7XG5cbiAgICAgIC8vIElucHV0IGxpc3RlbmVyIHRoYXQgbG9ja3MgdGhlIEhpZ2hsaWdodE92ZXJsYXkgc28gdGhhdCB0aGVyZSBhcmUgbm8gdXBkYXRlcyB0byB0aGUgaGlnaGxpZ2h0XG4gICAgICAvLyB3aGlsZSB0aGUgcG9pbnRlciBpcyBkb3duIG92ZXIgc29tZXRoaW5nIHRoYXQgdXNlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZy5cbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX3BvaW50ZXJMaXN0ZW5lcjogVElucHV0TGlzdGVuZXI7XG5cbiAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcbiAgICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcblxuICAgICAgICB0aGlzLl9hY3RpdmF0aW9uTGlzdGVuZXIgPSB7XG4gICAgICAgICAgZW50ZXI6IHRoaXMuX29uUG9pbnRlckVudGVyZWQuYmluZCggdGhpcyApLFxuICAgICAgICAgIG92ZXI6IHRoaXMuX29uUG9pbnRlck92ZXIuYmluZCggdGhpcyApLFxuICAgICAgICAgIG1vdmU6IHRoaXMuX29uUG9pbnRlck1vdmUuYmluZCggdGhpcyApLFxuICAgICAgICAgIGV4aXQ6IHRoaXMuX29uUG9pbnRlckV4aXRlZC5iaW5kKCB0aGlzICksXG4gICAgICAgICAgZG93bjogdGhpcy5fb25Qb2ludGVyRG93bi5iaW5kKCB0aGlzIClcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9jaGFuZ2VkSW5zdGFuY2VMaXN0ZW5lciA9IHRoaXMub25DaGFuZ2VkSW5zdGFuY2UuYmluZCggdGhpcyApO1xuXG4gICAgICAgIC8vIFRoaXMgaXMgcG90ZW50aWFsbHkgZGFuZ2Vyb3VzIHRvIGxpc3RlbiB0byBnZW5lcmFsbHksIGJ1dCBpbiB0aGlzIGNhc2UgaXQgaXMgc2FmZSBiZWNhdXNlIHRoZSBzdGF0ZSB3ZSBjaGFuZ2VcbiAgICAgICAgLy8gd2lsbCBvbmx5IGFmZmVjdCBhIHNlcGFyYXRlIGRpc3BsYXkncyBzdGF0ZSwgbm90IHRoaXMgb25lLlxuICAgICAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX2NoYW5nZWRJbnN0YW5jZUxpc3RlbmVyICk7XG5cbiAgICAgICAgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIgPSB0aGlzLl9vbkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nRW5hYmxlZENoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgICAgIHRoaXMuX2JvdW5kUG9pbnRlckZvY3VzQ2xlYXJlZExpc3RlbmVyID0gdGhpcy5oYW5kbGVMb2NrZWRQb2ludGVyRm9jdXNDbGVhcmVkLmJpbmQoIHRoaXMgKTtcblxuICAgICAgICBjb25zdCBib3VuZFBvaW50ZXJSZWxlYXNlTGlzdGVuZXIgPSB0aGlzLl9vblBvaW50ZXJSZWxlYXNlLmJpbmQoIHRoaXMgKTtcbiAgICAgICAgY29uc3QgYm91bmRQb2ludGVyQ2FuY2VsID0gdGhpcy5fb25Qb2ludGVyQ2FuY2VsLmJpbmQoIHRoaXMgKTtcblxuICAgICAgICB0aGlzLl9wb2ludGVyTGlzdGVuZXIgPSB7XG4gICAgICAgICAgdXA6IGJvdW5kUG9pbnRlclJlbGVhc2VMaXN0ZW5lcixcbiAgICAgICAgICBjYW5jZWw6IGJvdW5kUG9pbnRlckNhbmNlbCxcbiAgICAgICAgICBpbnRlcnJ1cHQ6IGJvdW5kUG9pbnRlckNhbmNlbFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2ZVByb3BlcnR5ID0gdGhpcy5faXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2ZVByb3BlcnR5O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdoZXRoZXIgYSBOb2RlIGNvbXBvc2VzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0IF9pc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCk6IHRydWUge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHN0YXRpYyBnZXQgX21peGVzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlO31cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdGhlIGludGVyYWN0aXZlIGhpZ2hsaWdodCBmb3IgdGhpcyBub2RlLiBCeSBkZWZhdWx0LCB0aGUgaGlnaGxpZ2h0IHdpbGwgYmUgYSBwaW5rIHJlY3RhbmdsZSB0aGF0IHN1cnJvdW5kc1xuICAgICAgICogdGhlIG5vZGUncyBsb2NhbCBib3VuZHMuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCggaW50ZXJhY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodCApOiB2b2lkIHtcblxuICAgICAgICBpZiAoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0ICE9PSBpbnRlcmFjdGl2ZUhpZ2hsaWdodCApIHtcbiAgICAgICAgICB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodCA9IGludGVyYWN0aXZlSGlnaGxpZ2h0O1xuXG4gICAgICAgICAgaWYgKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSApIHtcblxuICAgICAgICAgICAgLy8gaWYgZm9jdXMgaGlnaGxpZ2h0IGlzIGxheWVyYWJsZSwgaXQgbXVzdCBiZSBhIG5vZGUgZm9yIHRoZSBzY2VuZSBncmFwaFxuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW50ZXJhY3RpdmVIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgaGlnaGxpZ2h0IGlzIGludmlzaWJsZSwgdGhlIEhpZ2hsaWdodE92ZXJsYXkgd2lsbCBtYW5hZ2UgdmlzaWJpbGl0eVxuICAgICAgICAgICAgKCBpbnRlcmFjdGl2ZUhpZ2hsaWdodCBhcyBOb2RlICkudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodCggaW50ZXJhY3RpdmVIaWdobGlnaHQ6IEhpZ2hsaWdodCApIHsgdGhpcy5zZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCggaW50ZXJhY3RpdmVIaWdobGlnaHQgKTsgfVxuXG4gICAgICBwdWJsaWMgZ2V0IGludGVyYWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodCB7IHJldHVybiB0aGlzLmdldEludGVyYWN0aXZlSGlnaGxpZ2h0KCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSBpbnRlcmFjdGl2ZSBoaWdobGlnaHQgZm9yIHRoaXMgTm9kZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0KCk6IEhpZ2hsaWdodCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXRzIHdoZXRoZXIgdGhlIGhpZ2hsaWdodCBpcyBsYXllcmFibGUgaW4gdGhlIHNjZW5lIGdyYXBoIGluc3RlYWQgb2YgYWJvdmUgZXZlcnl0aGluZyBpbiB0aGVcbiAgICAgICAqIGhpZ2hsaWdodCBvdmVybGF5LiBJZiBsYXllcmFibGUsIHlvdSBtdXN0IHByb3ZpZGUgYSBjdXN0b20gaGlnaGxpZ2h0IGFuZCBpdCBtdXN0IGJlIGEgTm9kZS4gVGhlIGhpZ2hsaWdodFxuICAgICAgICogTm9kZSB3aWxsIGFsd2F5cyBiZSBpbnZpc2libGUgdW5sZXNzIHRoaXMgTm9kZSBpcyBhY3RpdmF0ZWQgd2l0aCBhIHBvaW50ZXIuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSggaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgICAgIGlmICggdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUgIT09IGludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlICkge1xuICAgICAgICAgIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlID0gaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGU7XG5cbiAgICAgICAgICBpZiAoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0ICkge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHQgaW5zdGFuY2VvZiBOb2RlICk7XG4gICAgICAgICAgICAoIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0IGFzIE5vZGUgKS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUoIGludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlOiBib29sZWFuICkgeyB0aGlzLnNldEludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlKCBpbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgaW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUoKSB7IHJldHVybiB0aGlzLmdldEludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgd2hldGhlciB0aGUgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0IGlzIGxheWVyYWJsZSBpbiB0aGUgc2NlbmUgZ3JhcGguXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB0aGUgZW5hYmxlZCBzdGF0ZSBvZiBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIG9uIHRoaXMgTm9kZS4gV2hlbiBmYWxzZSwgaGlnaGxpZ2h0cyB3aWxsIG5vdCBhY3RpdmF0ZVxuICAgICAgICogb24gdGhpcyBOb2RlIHdpdGggbW91c2UgYW5kIHRvdWNoIGlucHV0LiBZb3UgY2FuIGFsc28gZGlzYWJsZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGJ5IG1ha2luZyB0aGUgbm9kZVxuICAgICAgICogcGlja2FibGU6IGZhbHNlLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRvIGRpc2FibGUgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyB3aXRob3V0IG1vZGlmeWluZyBwaWNrYWJpbGl0eS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkID0gZW5hYmxlZDtcblxuICAgICAgICAvLyBFYWNoIGRpc3BsYXkgaGFzIGl0cyBvd24gZm9jdXNNYW5hZ2VyLnBvaW50ZXJIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LCBzbyB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggYWxsIG9mIHRoZW1cbiAgICAgICAgLy8gYW5kIHVwZGF0ZSBhZnRlciB0aGlzIGVuYWJsZWQgY2hhbmdlXG4gICAgICAgIGNvbnN0IHRyYWlsSWRzID0gT2JqZWN0LmtleXMoIHRoaXMuZGlzcGxheXMgKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWxJZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IHRoaXMuZGlzcGxheXNbIHRyYWlsSWRzWyBpIF0gXTtcbiAgICAgICAgICB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRMaXN0ZW5lciggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFyZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzIGVuYWJsZWQgZm9yIHRoaXMgTm9kZT8gV2hlbiBmYWxzZSwgbm8gaGlnaGxpZ2h0cyBhY3RpdmF0ZSBmcm9tIG1vdXNlIGFuZCB0b3VjaC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKSB7IHRoaXMuc2V0SW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkKCBlbmFibGVkICk7IH1cblxuICAgICAgcHVibGljIGdldCBpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgTm9kZSBpcyBcImFjdGl2YXRlZFwiIGJ5IGEgcG9pbnRlciwgaW5kaWNhdGluZyB0aGF0IGEgUG9pbnRlciBpcyBvdmVyIGl0XG4gICAgICAgKiBhbmQgdGhpcyBOb2RlIG1peGVzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIHNvIGFuIGludGVyYWN0aXZlIGhpZ2hsaWdodCBzaG91bGQgc3Vycm91bmQgaXQuXG4gICAgICAgKlxuICAgICAgICogVGhpcyBhbGdvcml0aG0gZGVwZW5kcyBvbiB0aGUgZGlyZWN0IGZvY3VzIG92ZXIgdGhlIHBvaW50ZXIsIHRoZSBcImxvY2tlZFwiIGZvY3VzIChmcm9tIGFuIGF0dGFjaGVkIGxpc3RlbmVyKSxcbiAgICAgICAqIGFuZCBpZiBwb2ludGVyIGhpZ2hsaWdodHMgYXJlIHZpc2libGUgYXQgYWxsLlxuICAgICAgICpcbiAgICAgICAqIElmIHlvdSBjb21lIHRvIGRlc2lyZSB0aGlzIHByaXZhdGUgZnVuY3Rpb24sIGluc3RlYWQgeW91IHNob3VsZCB1c2UgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2ZVByb3BlcnR5LlxuICAgICAgICpcbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZhdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgdHJhaWxJZHMgPSBPYmplY3Qua2V5cyggdGhpcy5kaXNwbGF5cyApO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbElkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gdGhpcy5kaXNwbGF5c1sgdHJhaWxJZHNbIGkgXSBdO1xuXG4gICAgICAgICAgLy8gT25seSBpZiB0aGUgaW50ZXJhY3RpdmUgaGlnaGxpZ2h0cyBmZWF0dXJlIGlzIGVuYWJsZWQgY2FuIHdlIGJlIGFjdGl2ZVxuICAgICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvaW50ZXJGb2N1cyA9IGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgbG9ja2VkUG9pbnRlckZvY3VzID0gZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgICBpZiAoIGxvY2tlZFBvaW50ZXJGb2N1cyApIHtcbiAgICAgICAgICAgICAgaWYgKCBsb2NrZWRQb2ludGVyRm9jdXM/LnRyYWlsLmxhc3ROb2RlKCkgPT09IHRoaXMgKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIHBvaW50ZXJGb2N1cz8udHJhaWwubGFzdE5vZGUoKSA9PT0gdGhpcyApIHtcbiAgICAgICAgICAgICAgYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBoYW5kbGVIaWdobGlnaHRBY3RpdmVDaGFuZ2UoKTogdm9pZCB7XG5cbiAgICAgICAgLy8gVGhlIHBlcmZvcm1hbmNlIG9mIHRoaXMgaXMgT0sgYXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLiBJdCBkZXBlbmRzIGdyZWF0bHkgb24gaG93IG9mdGVuIHRoaXMgZnVuY3Rpb24gaXNcbiAgICAgICAgLy8gY2FsbGVkLCBzaW5jZSByZWNhbGN1bGF0aW9uIGludm9sdmVzIGxvb3BpbmcgdGhyb3VnaCBhbGwgaW5zdGFuY2VzJyBkaXNwbGF5cywgYnV0IHNpbmNlIHJlY2FsY3VsYXRpb24gb25seVxuICAgICAgICAvLyBvY2N1cnMgZnJvbSBGb2N1c01hbmFnZXIncyBQcm9wZXJ0eSB1cGRhdGVzIChhbmQgbm90IG9uIGV2ZXJ5IHBvaW50ZXIgb3BlcmF0aW9uKSwgdGhpcyBpcyBhY2NlcHRhYmxlLlxuICAgICAgICB0aGlzLl9pc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZlUHJvcGVydHkudmFsdWUgPSB0aGlzLmlzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmF0ZWQoKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2hhbmdlZEluc3RhbmNlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fY2hhbmdlZEluc3RhbmNlTGlzdGVuZXIgKTtcblxuICAgICAgICAvLyByZW1vdmUgdGhlIGFjdGl2YXRpb24gbGlzdGVuZXIgaWYgaXQgaXMgY3VycmVudGx5IGF0dGFjaGVkXG4gICAgICAgIGlmICggdGhpcy5oYXNJbnB1dExpc3RlbmVyKCB0aGlzLl9hY3RpdmF0aW9uTGlzdGVuZXIgKSApIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2FjdGl2YXRpb25MaXN0ZW5lciApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLl9wb2ludGVyICkge1xuICAgICAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XG4gICAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXJzIG9uIGRpc3BsYXlzIGFuZCByZW1vdmUgRGlzcGxheXMgZnJvbSB0aGUgbWFwXG4gICAgICAgIGNvbnN0IHRyYWlsSWRzID0gT2JqZWN0LmtleXMoIHRoaXMuZGlzcGxheXMgKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWxJZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IHRoaXMuZGlzcGxheXNbIHRyYWlsSWRzWyBpIF0gXTtcbiAgICAgICAgICB0aGlzLm9uRGlzcGxheVJlbW92ZWQoIGRpc3BsYXkgKTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5kaXNwbGF5c1sgdHJhaWxJZHNbIGkgXSBdO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIuZGlzcG9zZSAmJiBzdXBlci5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV2hlbiB0aGUgcG9pbnRlciBnb2VzICdvdmVyJyBhIG5vZGUgKG5vdCBpbmNsdWRpbmcgY2hpbGRyZW4pLCBsb29rIGZvciBhIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCB0b1xuICAgICAgICogYWN0aXZhdGUuIFRoaXMgaXMgbW9zdCB1c2VmdWwgZm9yIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIE5vZGVzIHRoYXQgYWN0IGFzIGEgXCJncm91cFwiIGNvbnRhaW5lclxuICAgICAgICogZm9yIG90aGVyIG5vZGVzLiBXaGVuIHRoZSBwb2ludGVyIGxlYXZlcyBhIGNoaWxkLCB3ZSBnZXQgdGhlICdleGl0ZWQnIGV2ZW50IG9uIHRoZSBjaGlsZCwgaW1tZWRpYXRlbHlcbiAgICAgICAqIGZvbGxvd2VkIGJ5IGFuICdvdmVyJyBldmVudCBvbiB0aGUgcGFyZW50LiBUaGlzIGtlZXBzIHRoZSBncm91cCBoaWdobGlnaHQgdmlzaWJsZSB3aXRob3V0IGFueSBmbGlja2VyaW5nLlxuICAgICAgICogVGhlIGdyb3VwIHBhcmVudCBtdXN0IGJlIGNvbXBvc2VkIHdpdGggSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgc28gdGhhdCBpdCBoYXMgdGhlc2UgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9vblBvaW50ZXJPdmVyKCBldmVudDogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBhbmNlc3RvciB0aGF0IGlzIGEgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IHRoYXQgaXMgY29tcG9zZWQgd2l0aCBJbnRlcmFjdGl2ZUhpZ2hsaWdodCAoXG4gICAgICAgIC8vIChzaG91bGQgYWN0aXZhdGUgd2l0aCBwb2ludGVyIGlucHV0KS4uLlxuICAgICAgICBjb25zdCBncm91cEhpZ2hsaWdodE5vZGUgPSBldmVudC50cmFpbC5ub2Rlcy5maW5kKCBub2RlID0+ICggbm9kZS5ncm91cEZvY3VzSGlnaGxpZ2h0ICYmIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIG5vZGUgKSApICk7XG4gICAgICAgIGlmICggZ3JvdXBIaWdobGlnaHROb2RlICkge1xuXG4gICAgICAgICAgLy8gdHJhaWwgdG8gdGhlIGdyb3VwIGhpZ2hsaWdodCBOb2RlXG4gICAgICAgICAgY29uc3Qgcm9vdFRvR3JvdXBOb2RlID0gZXZlbnQudHJhaWwuc3VidHJhaWxUbyggZ3JvdXBIaWdobGlnaHROb2RlICk7XG4gICAgICAgICAgY29uc3QgZGlzcGxheXMgPSBPYmplY3QudmFsdWVzKCB0aGlzLmRpc3BsYXlzICk7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gZGlzcGxheXNbIGkgXTtcblxuICAgICAgICAgICAgLy8gb25seSBzZXQgZm9jdXMgaWYgY3VycmVudCBQb2ludGVyIGZvY3VzIGlzIG5vdCBkZWZpbmVkIChmcm9tIGEgbW9yZSBkZXNjZW5kYW50IE5vZGUpXG4gICAgICAgICAgICBpZiAoIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xuICAgICAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS5zZXQoIG5ldyBGb2N1cyggZGlzcGxheSwgcm9vdFRvR3JvdXBOb2RlICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIGEgUG9pbnRlciBlbnRlcnMgdGhpcyBOb2RlLCBzaWduYWwgdG8gdGhlIERpc3BsYXlzIHRoYXQgdGhlIHBvaW50ZXIgaXMgb3ZlciB0aGlzIE5vZGUgc28gdGhhdCB0aGVcbiAgICAgICAqIEhpZ2hsaWdodE92ZXJsYXkgY2FuIGJlIGFjdGl2YXRlZC5cbiAgICAgICAqXG4gICAgICAgKiBUaGlzIGlzIG1vc3QgbGlrZWx5IGhvdyBtb3N0IHBvaW50ZXJGb2N1c1Byb3BlcnR5IGlzIHNldC4gRmlyc3Qgd2UgZ2V0IGFuIGBlbnRlcmAgZXZlbnQgdGhlbiB3ZSBtYXkgZ2V0XG4gICAgICAgKiBhIGRvd24gZXZlbnQgb3IgbW92ZSBldmVudCB3aGljaCBjb3VsZCBkbyBmdXJ0aGVyIHVwZGF0ZXMgb24gdGhlIGV2ZW50IFBvaW50ZXIgb3IgRm9jdXNNYW5hZ2VyLlxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9vblBvaW50ZXJFbnRlcmVkKCBldmVudDogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcblxuICAgICAgICBsZXQgbG9ja1BvaW50ZXIgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBkaXNwbGF5cyA9IE9iamVjdC52YWx1ZXMoIHRoaXMuZGlzcGxheXMgKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XG5cbiAgICAgICAgICBpZiAoIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAhZXZlbnQudHJhaWwuZXF1YWxzKCBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZS50cmFpbCApICkge1xuXG4gICAgICAgICAgICBjb25zdCBuZXdGb2N1cyA9IG5ldyBGb2N1cyggZGlzcGxheSwgZXZlbnQudHJhaWwgKTtcbiAgICAgICAgICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnNldCggbmV3Rm9jdXMgKTtcbiAgICAgICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgPT09IG51bGwgJiYgZXZlbnQucG9pbnRlci5hdHRhY2hlZExpc3RlbmVyICkge1xuICAgICAgICAgICAgICB0aGlzLmxvY2tIaWdobGlnaHQoIG5ld0ZvY3VzLCBkaXNwbGF5LmZvY3VzTWFuYWdlciApO1xuICAgICAgICAgICAgICBsb2NrUG9pbnRlciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBsb2NrUG9pbnRlciApIHtcbiAgICAgICAgICB0aGlzLnNhdmVQb2ludGVyKCBldmVudC5wb2ludGVyICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBVcGRhdGUgaGlnaGxpZ2h0cyB3aGVuIHRoZSBQb2ludGVyIG1vdmVzIG92ZXIgdGhpcyBOb2RlLiBJbiBnZW5lcmFsLCBoaWdobGlnaHRzIHdpbGwgYWN0aXZhdGUgb24gJ2VudGVyJy4gQnV0XG4gICAgICAgKiBpbiBjYXNlcyB3aGVyZSBtdWx0aXBsZSBOb2RlcyBpbiBhIFRyYWlsIHN1cHBvcnQgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgdGhpcyBsaXN0ZW5lciBjYW4gbW92ZSBmb2N1c1xuICAgICAgICogdG8gdGhlIG1vc3QgcmVhc29uYWJsZSB0YXJnZXQgKHRoZSBjbG9zZXN0IGFuY2VzdG9yIG9yIGRlc2NlbmRlbnQgdGhhdCBpcyBjb21wb3NlZCB3aXRoIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKS5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBfb25Qb2ludGVyTW92ZSggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgICAgIGxldCBsb2NrUG9pbnRlciA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGRpc3BsYXlzID0gT2JqZWN0LnZhbHVlcyggdGhpcy5kaXNwbGF5cyApO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gZGlzcGxheXNbIGkgXTtcblxuICAgICAgICAgIC8vIHRoZSBTY2VuZXJ5RXZlbnQgbWlnaHQgaGF2ZSBnb25lIHRocm91Z2ggYSBkZXNjZW5kYW50IG9mIHRoaXMgTm9kZVxuICAgICAgICAgIGNvbnN0IHJvb3RUb1NlbGYgPSBldmVudC50cmFpbC5zdWJ0cmFpbFRvKCB0aGlzICk7XG5cbiAgICAgICAgICAvLyBvbmx5IGRvIG1vcmUgd29yayBvbiBtb3ZlIGlmIHRoZSBldmVudCBpbmRpY2F0ZXMgdGhhdCBwb2ludGVyIGZvY3VzIG1pZ2h0IGhhdmUgY2hhbmdlZC5cbiAgICAgICAgICBpZiAoIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlID09PSBudWxsIHx8ICFyb290VG9TZWxmLmVxdWFscyggZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUudHJhaWwgKSApIHtcblxuICAgICAgICAgICAgaWYgKCAhdGhpcy5nZXREZXNjZW5kYW50c1VzZUhpZ2hsaWdodGluZyggZXZlbnQudHJhaWwgKSApIHtcbiAgICAgICAgICAgICAgY29uc3QgbmV3Rm9jdXMgPSBuZXcgRm9jdXMoIGRpc3BsYXksIHJvb3RUb1NlbGYgKTtcbiAgICAgICAgICAgICAgZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkuc2V0KCBuZXdGb2N1cyApO1xuXG4gICAgICAgICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgPT09IG51bGwgJiYgZXZlbnQucG9pbnRlci5hdHRhY2hlZExpc3RlbmVyICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9ja0hpZ2hsaWdodCggbmV3Rm9jdXMsIGRpc3BsYXkuZm9jdXNNYW5hZ2VyICk7XG4gICAgICAgICAgICAgICAgbG9ja1BvaW50ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBsb2NrUG9pbnRlciApIHtcbiAgICAgICAgICB0aGlzLnNhdmVQb2ludGVyKCBldmVudC5wb2ludGVyICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIGEgcG9pbnRlciBleGl0cyB0aGlzIE5vZGUgb3IgaXRzIGNoaWxkcmVuLCBzaWduYWwgdG8gdGhlIERpc3BsYXlzIHRoYXQgcG9pbnRlciBmb2N1cyBoYXMgY2hhbmdlZCB0b1xuICAgICAgICogZGVhY3RpdmF0ZSB0aGUgSGlnaGxpZ2h0T3ZlcmxheS4gVGhpcyBjYW4gYWxzbyBmaXJlIHdoZW4gdmlzaWJpbGl0eS9waWNrYWJpbGl0eSBvZiB0aGUgTm9kZSBjaGFuZ2VzLlxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9vblBvaW50ZXJFeGl0ZWQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuXG4gICAgICAgIGNvbnN0IGRpc3BsYXlzID0gT2JqZWN0LnZhbHVlcyggdGhpcy5kaXNwbGF5cyApO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gZGlzcGxheXNbIGkgXTtcbiAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVyRm9jdXNQcm9wZXJ0eS5zZXQoIG51bGwgKTtcblxuICAgICAgICAgIC8vIEFuIGV4aXQgZXZlbnQgbWF5IGNvbWUgZnJvbSBhIE5vZGUgYWxvbmcgdGhlIHRyYWlsIGJlY29taW5nIGludmlzaWJsZSBvciB1bnBpY2thYmxlLiBJbiB0aGF0IGNhc2UgdW5sb2NrXG4gICAgICAgICAgLy8gZm9jdXMgYW5kIHJlbW92ZSBwb2ludGVyIGxpc3RlbmVycyBzbyB0aGF0IGhpZ2hsaWdodHMgY2FuIGNvbnRpbnVlIHRvIHVwZGF0ZSBmcm9tIG5ldyBpbnB1dC5cbiAgICAgICAgICBjb25zdCBsb2NrZWRQb2ludGVyRm9jdXMgPSBkaXNwbGF5LmZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgICBpZiAoICFldmVudC50cmFpbC5pc1BpY2thYmxlKCkgJiZcbiAgICAgICAgICAgICAgICggbG9ja2VkUG9pbnRlckZvY3VzID09PSBudWxsIHx8XG5cbiAgICAgICAgICAgICAgICAgLy8gV2UgZG8gbm90IHdhbnQgdG8gcmVtb3ZlIHRoZSBsb2NrZWRQb2ludGVyRm9jdXMgaWYgdGhpcyBldmVudCB0cmFpbCBoYXMgbm90aGluZ1xuICAgICAgICAgICAgICAgICAvLyB0byBkbyB3aXRoIHRoZSBub2RlIHRoYXQgaXMgcmVjZWl2aW5nIGEgbG9ja2VkIGZvY3VzLlxuICAgICAgICAgICAgICAgICBldmVudC50cmFpbC5jb250YWluc05vZGUoIGxvY2tlZFBvaW50ZXJGb2N1cy50cmFpbC5sYXN0Tm9kZSgpICkgKSApIHtcblxuICAgICAgICAgICAgLy8gdW5sb2NrIGFuZCByZW1vdmUgcG9pbnRlciBsaXN0ZW5lcnNcbiAgICAgICAgICAgIHRoaXMuX29uUG9pbnRlclJlbGVhc2UoIGV2ZW50ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogV2hlbiBhIHBvaW50ZXIgZ29lcyBkb3duIG9uIHRoaXMgTm9kZSwgc2lnbmFsIHRvIHRoZSBEaXNwbGF5cyB0aGF0IHRoZSBwb2ludGVyRm9jdXMgaXMgbG9ja2VkLiBPbiB0aGUgZG93blxuICAgICAgICogZXZlbnQsIHRoZSBwb2ludGVyRm9jdXNQcm9wZXJ0eSB3aWxsIGhhdmUgYmVlbiBzZXQgZmlyc3QgZnJvbSB0aGUgYGVudGVyYCBldmVudC5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBfb25Qb2ludGVyRG93biggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG5cbiAgICAgICAgaWYgKCB0aGlzLl9wb2ludGVyID09PSBudWxsICkge1xuICAgICAgICAgIGxldCBsb2NrUG9pbnRlciA9IGZhbHNlO1xuXG4gICAgICAgICAgY29uc3QgZGlzcGxheXMgPSBPYmplY3QudmFsdWVzKCB0aGlzLmRpc3BsYXlzICk7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5ID0gZGlzcGxheXNbIGkgXTtcbiAgICAgICAgICAgIGNvbnN0IGZvY3VzID0gZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBsb2NrZWQgPSAhIWRpc3BsYXkuZm9jdXNNYW5hZ2VyLmxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5LnZhbHVlO1xuXG4gICAgICAgICAgICAvLyBGb2N1cyBzaG91bGQgZ2VuZXJhbGx5IGJlIGRlZmluZWQgd2hlbiBwb2ludGVyIGVudGVycyB0aGUgTm9kZSwgYnV0IGl0IG1heSBiZSBudWxsIGluIGNhc2VzIG9mXG4gICAgICAgICAgICAvLyBjYW5jZWwgb3IgaW50ZXJydXB0LiBEb24ndCBhdHRlbXB0IHRvIGxvY2sgaWYgdGhlIEZvY3VzTWFuYWdlciBhbHJlYWR5IGhhcyBhIGxvY2tlZCBoaWdobGlnaHQgKGVzcGVjaWFsbHlcbiAgICAgICAgICAgIC8vIGltcG9ydGFudCBmb3IgZ3JhY2VmdWxseSBoYW5kbGluZyBtdWx0aXRvdWNoKS5cbiAgICAgICAgICAgIGlmICggZm9jdXMgJiYgIWxvY2tlZCApIHtcbiAgICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWZvY3VzLnRyYWlsLmxhc3ROb2RlKCkuaXNEaXNwb3NlZCwgJ0ZvY3VzIHNob3VsZCBub3QgYmUgc2V0IHRvIGEgZGlzcG9zZWQgTm9kZScgKTtcblxuICAgICAgICAgICAgICAvLyBTZXQgdGhlIGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IHdpdGggYSBjb3B5IG9mIHRoZSBGb2N1cyAoYXMgZGVlcCBhcyBwb3NzaWJsZSkgYmVjYXVzZSB3ZSB3YW50XG4gICAgICAgICAgICAgIC8vIHRvIGtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIG9sZCBUcmFpbCB3aGlsZSBwb2ludGVyRm9jdXNQcm9wZXJ0eSBjaGFuZ2VzLlxuICAgICAgICAgICAgICB0aGlzLmxvY2tIaWdobGlnaHQoIGZvY3VzLCBkaXNwbGF5LmZvY3VzTWFuYWdlciApO1xuICAgICAgICAgICAgICBsb2NrUG9pbnRlciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBsb2NrUG9pbnRlciApIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVBvaW50ZXIoIGV2ZW50LnBvaW50ZXIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJpdmF0ZSBvbkRpc3BsYXlBZGRlZCggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcblxuICAgICAgICAvLyBMaXN0ZW5lciBtYXkgYWxyZWFkeSBieSBvbiB0aGUgZGlzcGxheSBpbiBjYXNlcyBvZiBEQUcsIG9ubHkgYWRkIGlmIHRoaXMgaXMgdGhlIGZpcnN0IGluc3RhbmNlIG9mIHRoaXMgTm9kZVxuICAgICAgICBpZiAoICFkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIgKSApIHtcbiAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5wb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5saW5rKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByaXZhdGUgb25EaXNwbGF5UmVtb3ZlZCggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcblxuICAgICAgICAvLyBQb2ludGVyIGZvY3VzIHdhcyBsb2NrZWQgZHVlIHRvIGludGVyYWN0aW9uIHdpdGggdGhpcyBsaXN0ZW5lciwgYnV0IHVubG9ja2VkIGJlY2F1c2Ugb2Ygb3RoZXJcbiAgICAgICAgLy8gc2NlbmVyeS1pbnRlcm5hbCBsaXN0ZW5lcnMuIEJ1dCB0aGUgUHJvcGVydHkgc3RpbGwgaGFzIHRoaXMgbGlzdGVuZXIgc28gaXQgbmVlZHMgdG8gYmUgcmVtb3ZlZCBub3cuXG4gICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuX2JvdW5kUG9pbnRlckZvY3VzQ2xlYXJlZExpc3RlbmVyICkgKSB7XG4gICAgICAgICAgZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudW5saW5rKCB0aGlzLl9ib3VuZFBvaW50ZXJGb2N1c0NsZWFyZWRMaXN0ZW5lciApO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzcGxheS5mb2N1c01hbmFnZXIucG9pbnRlckhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLl9pbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFdoZW4gYSBQb2ludGVyIGdvZXMgdXAgYWZ0ZXIgZ29pbmcgZG93biBvbiB0aGlzIE5vZGUsIHNpZ25hbCB0byB0aGUgRGlzcGxheXMgdGhhdCB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkgbm9cbiAgICAgICAqIGxvbmdlciBuZWVkcyB0byBiZSBsb2NrZWQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIFtldmVudF0gLSBtYXkgYmUgY2FsbGVkIGR1cmluZyBpbnRlcnJ1cHQgb3IgY2FuY2VsLCBpbiB3aGljaCBjYXNlIHRoZXJlIGlzIG5vIGV2ZW50XG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX29uUG9pbnRlclJlbGVhc2UoIGV2ZW50PzogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBkaXNwbGF5cyA9IE9iamVjdC52YWx1ZXMoIHRoaXMuZGlzcGxheXMgKTtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XG4gICAgICAgICAgZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkudmFsdWUgPSBudWxsO1xuXG4gICAgICAgICAgLy8gVW5saW5rIHRoZSBsaXN0ZW5lciB0aGF0IHdhcyB3YXRjaGluZyBmb3IgdGhlIGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IHRvIGJlIGNsZWFyZWQgZXh0ZXJuYWxseVxuICAgICAgICAgIGlmICggZGlzcGxheS5mb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMuX2JvdW5kUG9pbnRlckZvY3VzQ2xlYXJlZExpc3RlbmVyICkgKSB7XG4gICAgICAgICAgICBkaXNwbGF5LmZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX2JvdW5kUG9pbnRlckZvY3VzQ2xlYXJlZExpc3RlbmVyICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLl9wb2ludGVyICYmIHRoaXMuX3BvaW50ZXIubGlzdGVuZXJzLmluY2x1ZGVzKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKSApIHtcbiAgICAgICAgICB0aGlzLl9wb2ludGVyLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX3BvaW50ZXJMaXN0ZW5lciApO1xuICAgICAgICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSWYgdGhlIHBvaW50ZXIgbGlzdGVuZXIgaXMgY2FuY2VsbGVkIG9yIGludGVycnVwdGVkLCBjbGVhciBmb2N1cyBhbmQgcmVtb3ZlIGlucHV0IGxpc3RlbmVycy5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBfb25Qb2ludGVyQ2FuY2VsKCBldmVudD86IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG5cbiAgICAgICAgY29uc3QgZGlzcGxheXMgPSBPYmplY3QudmFsdWVzKCB0aGlzLmRpc3BsYXlzICk7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGNvbnN0IGRpc3BsYXkgPSBkaXNwbGF5c1sgaSBdO1xuICAgICAgICAgIGRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBvaW50ZXJGb2N1c1Byb3BlcnR5LnNldCggbnVsbCApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdW5sb2NrIGFuZCByZW1vdmUgcG9pbnRlciBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5fb25Qb2ludGVyUmVsZWFzZSggZXZlbnQgKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTYXZlIHRoZSBQb2ludGVyIGFuZCBhZGQgYSBsaXN0ZW5lciB0byBpdCB0byByZW1vdmUgaGlnaGxpZ2h0cyB3aGVuIGEgcG9pbnRlciBpcyByZWxlYXNlZC9jYW5jZWxsZWQuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgc2F2ZVBvaW50ZXIoIGV2ZW50UG9pbnRlcjogUG9pbnRlciApOiB2b2lkIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgICAgICB0aGlzLl9wb2ludGVyID09PSBudWxsLFxuICAgICAgICAgICdJdCBzaG91bGQgYmUgaW1wb3NzaWJsZSB0byBhbHJlYWR5IGhhdmUgYSBQb2ludGVyIGJlZm9yZSBsb2NraW5nIGZyb20gdG91Y2hTbmFnJ1xuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudFBvaW50ZXI7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0cyB0aGUgXCJsb2NrZWRcIiBmb2N1cyBmb3IgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0aW5nLiBUaGUgXCJsb2NraW5nXCIgbWFrZXMgc3VyZSB0aGF0IHRoZSBoaWdobGlnaHQgcmVtYWluc1xuICAgICAgICogYWN0aXZlIG9uIHRoZSBOb2RlIHRoYXQgaXMgcmVjZWl2aW5nIGludGVyYWN0aW9uIGV2ZW4gd2hlbiB0aGUgcG9pbnRlciBoYXMgbW92ZSBhd2F5IGZyb20gdGhlIE5vZGVcbiAgICAgICAqIChidXQgcHJlc3VtYWJseSBpcyBzdGlsbCBkb3duIHNvbWV3aGVyZSBlbHNlIG9uIHRoZSBzY3JlZW4pLlxuICAgICAgICovXG4gICAgICBwcml2YXRlIGxvY2tIaWdobGlnaHQoIG5ld0ZvY3VzOiBGb2N1cywgZm9jdXNNYW5hZ2VyOiBGb2N1c01hbmFnZXIgKTogdm9pZCB7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fcG9pbnRlciA9PT0gbnVsbCxcbiAgICAgICAgICAnSXQgc2hvdWxkIGJlIGltcG9zc2libGUgdG8gYWxyZWFkeSBoYXZlIGEgUG9pbnRlciBiZWZvcmUgbG9ja2luZyBmcm9tIHRvdWNoU25hZycgKTtcblxuICAgICAgICAvLyBBIENPUFkgb2YgdGhlIGZvY3VzIGlzIHNhdmVkIHRvIHRoZSBQcm9wZXJ0eSBiZWNhdXNlIHdlIG5lZWQgdGhlIHZhbHVlIG9mIHRoZSBUcmFpbCBhdCB0aGlzIGV2ZW50LlxuICAgICAgICBmb2N1c01hbmFnZXIubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkuc2V0KCBuZXcgRm9jdXMoIG5ld0ZvY3VzLmRpc3BsYXksIG5ld0ZvY3VzLnRyYWlsLmNvcHkoKSApICk7XG5cbiAgICAgICAgLy8gQXR0YWNoIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGNsZWFyIHRoZSBwb2ludGVyIGFuZCBpdHMgbGlzdGVuZXIgaWYgdGhlIGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5IGlzIGNsZWFyZWRcbiAgICAgICAgLy8gZXh0ZXJuYWxseSAobm90IGJ5IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKS5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIWZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdGhpcy5fYm91bmRQb2ludGVyRm9jdXNDbGVhcmVkTGlzdGVuZXIgKSxcbiAgICAgICAgICAndGhpcyBsaXN0ZW5lciBzdGlsbCBvbiB0aGUgbG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgaW5kaWNhdGVzIGEgbWVtb3J5IGxlYWsnXG4gICAgICAgICk7XG4gICAgICAgIGZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS5saW5rKCB0aGlzLl9ib3VuZFBvaW50ZXJGb2N1c0NsZWFyZWRMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEZvY3VzTWFuYWdlci5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eSBkb2VzIG5vdCBiZWxvbmcgdG8gSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgYW5kIGNhbiBiZSBjbGVhcmVkXG4gICAgICAgKiBmb3IgYW55IHJlYXNvbi4gSWYgaXQgaXMgc2V0IHRvIG51bGwgd2hpbGUgYSBwb2ludGVyIGlzIGRvd24gd2UgbmVlZCB0byByZWxlYXNlIHRoZSBQb2ludGVyIGFuZCByZW1vdmUgaW5wdXRcbiAgICAgICAqIGxpc3RlbmVycy5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBoYW5kbGVMb2NrZWRQb2ludGVyRm9jdXNDbGVhcmVkKCBsb2NrZWRQb2ludGVyRm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcbiAgICAgICAgaWYgKCBsb2NrZWRQb2ludGVyRm9jdXMgPT09IG51bGwgKSB7XG4gICAgICAgICAgdGhpcy5fb25Qb2ludGVyUmVsZWFzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkIG9yIHJlbW92ZSBsaXN0ZW5lcnMgcmVsYXRlZCB0byBhY3RpdmF0aW5nIGludGVyYWN0aXZlIGhpZ2hsaWdodGluZyB3aGVuIHRoZSBmZWF0dXJlIGJlY29tZXMgZW5hYmxlZC5cbiAgICAgICAqIFdvcmsgcmVsYXRlZCB0byBpbnRlcmFjdGl2ZSBoaWdobGlnaHRpbmcgaXMgYXZvaWRlZCB1bmxlc3MgdGhlIGZlYXR1cmUgaXMgZW5hYmxlZC5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBfb25JbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRDaGFuZ2UoIGZlYXR1cmVFbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xuICAgICAgICAvLyBPbmx5IGxpc3RlbiB0byB0aGUgYWN0aXZhdGlvbiBsaXN0ZW5lciBpZiB0aGUgZmVhdHVyZSBpcyBlbmFibGVkIGFuZCBoaWdobGlnaHRpbmcgaXMgZW5hYmxlZCBmb3IgdGhpcyBOb2RlLlxuICAgICAgICBjb25zdCBlbmFibGVkID0gZmVhdHVyZUVuYWJsZWQgJiYgdGhpcy5faW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkO1xuXG4gICAgICAgIGNvbnN0IGhhc0FjdGl2YXRpb25MaXN0ZW5lciA9IHRoaXMuaGFzSW5wdXRMaXN0ZW5lciggdGhpcy5fYWN0aXZhdGlvbkxpc3RlbmVyICk7XG4gICAgICAgIGlmICggZW5hYmxlZCAmJiAhaGFzQWN0aXZhdGlvbkxpc3RlbmVyICkge1xuICAgICAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fYWN0aXZhdGlvbkxpc3RlbmVyICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoICFlbmFibGVkICYmIGhhc0FjdGl2YXRpb25MaXN0ZW5lciApIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2FjdGl2YXRpb25MaXN0ZW5lciApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgbm93IGRpc3BsYXllZCwgdGhlbiB3ZSBzaG91bGQgcmVjb21wdXRlIGlmIHdlIGFyZSBhY3RpdmUgb3Igbm90LlxuICAgICAgICB0aGlzLmhhbmRsZUhpZ2hsaWdodEFjdGl2ZUNoYW5nZSgpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEFkZCB0aGUgRGlzcGxheSB0byB0aGUgY29sbGVjdGlvbiB3aGVuIHRoaXMgTm9kZSBpcyBhZGRlZCB0byBhIHNjZW5lIGdyYXBoLiBBbHNvIGFkZHMgbGlzdGVuZXJzIHRvIHRoZVxuICAgICAgICogRGlzcGxheSB0aGF0IHR1cm5zIG9uIGhpZ2hsaWdodGluZyB3aGVuIHRoZSBmZWF0dXJlIGlzIGVuYWJsZWQuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBvbkNoYW5nZWRJbnN0YW5jZSggaW5zdGFuY2U6IEluc3RhbmNlLCBhZGRlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UudHJhaWwsICdzaG91bGQgaGF2ZSBhIHRyYWlsJyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnN0YW5jZS5kaXNwbGF5LCAnc2hvdWxkIGhhdmUgYSBkaXNwbGF5JyApO1xuXG4gICAgICAgIGNvbnN0IHVuaXF1ZUlkID0gaW5zdGFuY2UudHJhaWwhLnVuaXF1ZUlkO1xuXG4gICAgICAgIGlmICggYWRkZWQgKSB7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IGluc3RhbmNlLmRpc3BsYXkgYXMgRGlzcGxheTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm9uLW51bGxhYmxlLXR5cGUtYXNzZXJ0aW9uLXN0eWxlXG4gICAgICAgICAgdGhpcy5kaXNwbGF5c1sgdW5pcXVlSWQgXSA9IGRpc3BsYXk7XG4gICAgICAgICAgdGhpcy5vbkRpc3BsYXlBZGRlZCggZGlzcGxheSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluc3RhbmNlLm5vZGUsICdzaG91bGQgaGF2ZSBhIG5vZGUnICk7XG4gICAgICAgICAgY29uc3QgZGlzcGxheSA9IHRoaXMuZGlzcGxheXNbIHVuaXF1ZUlkIF07XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzcGxheSwgYGludGVyYWN0aXZlIGhpZ2hsaWdodGluZyBkb2VzIG5vdCBoYXZlIGEgRGlzcGxheSBmb3IgcmVtb3ZlZCBpbnN0YW5jZTogJHt1bmlxdWVJZH1gICk7XG5cbiAgICAgICAgICAvLyBJZiB0aGUgbm9kZSB3YXMgZGlzcG9zZWQsIHRoaXMgZGlzcGxheSByZWZlcmVuY2UgaGFzIGFscmVhZHkgYmVlbiBjbGVhbmVkIHVwLCBidXQgaW5zdGFuY2VzIGFyZSB1cGRhdGVkXG4gICAgICAgICAgLy8gKGRpc3Bvc2VkKSBvbiB0aGUgbmV4dCBmcmFtZSBhZnRlciB0aGUgbm9kZSB3YXMgZGlzcG9zZWQuIE9ubHkgdW5saW5rIGlmIHRoZXJlIGFyZSBubyBtb3JlIGluc3RhbmNlcyBvZlxuICAgICAgICAgIC8vIHRoaXMgbm9kZTtcbiAgICAgICAgICBpbnN0YW5jZS5ub2RlIS5pbnN0YW5jZXMubGVuZ3RoID09PSAwICYmIHRoaXMub25EaXNwbGF5UmVtb3ZlZCggZGlzcGxheSApO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmRpc3BsYXlzWyB1bmlxdWVJZCBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIGFueSBub2RlcyBmcm9tIHRoaXMgTm9kZSB0byB0aGUgbGVhZiBvZiB0aGUgVHJhaWwgdXNlIFZvaWNpbmcgZmVhdHVyZXMgaW4gc29tZSB3YXkuIEluXG4gICAgICAgKiBnZW5lcmFsLCB3ZSBkbyBub3Qgd2FudCB0byBhY3RpdmF0ZSB2b2ljaW5nIGZlYXR1cmVzIGluIHRoaXMgY2FzZSBiZWNhdXNlIHRoZSBsZWFmLW1vc3QgTm9kZXMgaW4gdGhlIFRyYWlsXG4gICAgICAgKiBzaG91bGQgYmUgYWN0aXZhdGVkIGluc3RlYWQuXG4gICAgICAgKiBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0RGVzY2VuZGFudHNVc2VIaWdobGlnaHRpbmcoIHRyYWlsOiBUcmFpbCApOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgaW5kZXhPZlNlbGYgPSB0cmFpbC5ub2Rlcy5pbmRleE9mKCB0aGlzICk7XG5cbiAgICAgICAgLy8gYWxsIHRoZSB3YXkgdG8gbGVuZ3RoLCBlbmQgbm90IGluY2x1ZGVkIGluIHNsaWNlIC0gYW5kIGlmIHN0YXJ0IHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBpbmRleCByYW5nZVxuICAgICAgICAvLyBhbiBlbXB0eSBhcnJheSBpcyByZXR1cm5lZFxuICAgICAgICBjb25zdCBjaGlsZFRvTGVhZk5vZGVzID0gdHJhaWwubm9kZXMuc2xpY2UoIGluZGV4T2ZTZWxmICsgMSwgdHJhaWwubm9kZXMubGVuZ3RoICk7XG5cbiAgICAgICAgLy8gaWYgYW55IG9mIHRoZSBub2RlcyBmcm9tIGxlYWYgdG8gc2VsZiB1c2UgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIHRoZXkgc2hvdWxkIHJlY2VpdmUgaW5wdXQsIGFuZCB3ZSBzaG91bGRuJ3RcbiAgICAgICAgLy8gc3BlYWsgdGhlIGNvbnRlbnQgZm9yIHRoaXMgTm9kZVxuICAgICAgICBsZXQgZGVzY2VuZGFudHNVc2VWb2ljaW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkVG9MZWFmTm9kZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgaWYgKCBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBjaGlsZFRvTGVhZk5vZGVzWyBpIF0gKSApIHtcbiAgICAgICAgICAgIGRlc2NlbmRhbnRzVXNlVm9pY2luZyA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVzY2VuZGFudHNVc2VWb2ljaW5nO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogU2VsZk9wdGlvbnMgJiBQYXJhbWV0ZXJzPEluc3RhbmNlVHlwZTxTdXBlclR5cGU+WyAnbXV0YXRlJyBdPlsgMCBdICk6IHRoaXMge1xuICAgICAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIC8qKlxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgTm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW5cbiAgICogdGhlIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQuXG4gICAqXG4gICAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxuICAgKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cbiAgICovXG4gIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IElOVEVSQUNUSVZFX0hJR0hMSUdIVElOR19PUFRJT05TLmNvbmNhdCggSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzLmxlbmd0aCA9PT1cbiAgICAgICAgICAgICAgICAgICAgXy51bmlxKCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsXG4gICAgJ2R1cGxpY2F0ZSBtdXRhdG9yIGtleXMgaW4gSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcnICk7XG5cbiAgcmV0dXJuIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQ2xhc3M7XG59ICk7XG5cbmV4cG9ydCB0eXBlIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSA9IE5vZGUgJiBUSW50ZXJhY3RpdmVIaWdobGlnaHRpbmc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBzb21ldGhpbmc6IEludGVudGlvbmFsQW55ICk6IHNvbWV0aGluZyBpcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUge1xuICByZXR1cm4gc29tZXRoaW5nIGluc3RhbmNlb2YgTm9kZSAmJiAoIHNvbWV0aGluZyBhcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUgKS5faXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZztcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0ludGVyYWN0aXZlSGlnaGxpZ2h0aW5nJywgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgKTtcbmV4cG9ydCBkZWZhdWx0IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nOyJdLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlRpbnlQcm9wZXJ0eSIsIm1lbW9pemUiLCJEZWxheWVkTXV0YXRlIiwiRm9jdXMiLCJOb2RlIiwic2NlbmVyeSIsIklOVEVSQUNUSVZFX0hJR0hMSUdIVElOR19PUFRJT05TIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJUeXBlIiwiYXNzZXJ0IiwiX21peGVzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0NsYXNzIiwiX2lzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodCIsImludGVyYWN0aXZlSGlnaGxpZ2h0IiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0IiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlIiwidmlzaWJsZSIsImludGVyYWN0aXZlSGlnaGxpZ2h0Q2hhbmdlZEVtaXR0ZXIiLCJlbWl0IiwiZ2V0SW50ZXJhY3RpdmVIaWdobGlnaHQiLCJzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodExheWVyYWJsZSIsImludGVyYWN0aXZlSGlnaGxpZ2h0TGF5ZXJhYmxlIiwiZ2V0SW50ZXJhY3RpdmVIaWdobGlnaHRMYXllcmFibGUiLCJzZXRJbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQiLCJlbmFibGVkIiwiX2ludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCIsInRyYWlsSWRzIiwiT2JqZWN0Iiwia2V5cyIsImRpc3BsYXlzIiwiaSIsImxlbmd0aCIsImRpc3BsYXkiLCJfaW50ZXJhY3RpdmVIaWdobGlnaHRpbmdFbmFibGVkTGlzdGVuZXIiLCJmb2N1c01hbmFnZXIiLCJwb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwiZ2V0SW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwiaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodEFjdGl2YXRlZCIsImFjdGl2YXRlZCIsInBvaW50ZXJGb2N1cyIsInBvaW50ZXJGb2N1c1Byb3BlcnR5IiwibG9ja2VkUG9pbnRlckZvY3VzIiwibG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkiLCJ0cmFpbCIsImxhc3ROb2RlIiwiaGFuZGxlSGlnaGxpZ2h0QWN0aXZlQ2hhbmdlIiwiX2lzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmVQcm9wZXJ0eSIsImRpc3Bvc2UiLCJjaGFuZ2VkSW5zdGFuY2VFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJfY2hhbmdlZEluc3RhbmNlTGlzdGVuZXIiLCJoYXNJbnB1dExpc3RlbmVyIiwiX2FjdGl2YXRpb25MaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJfcG9pbnRlciIsIl9wb2ludGVyTGlzdGVuZXIiLCJvbkRpc3BsYXlSZW1vdmVkIiwiX29uUG9pbnRlck92ZXIiLCJldmVudCIsImdyb3VwSGlnaGxpZ2h0Tm9kZSIsIm5vZGVzIiwiZmluZCIsIm5vZGUiLCJncm91cEZvY3VzSGlnaGxpZ2h0IiwiaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsInJvb3RUb0dyb3VwTm9kZSIsInN1YnRyYWlsVG8iLCJ2YWx1ZXMiLCJzZXQiLCJfb25Qb2ludGVyRW50ZXJlZCIsImxvY2tQb2ludGVyIiwiZXF1YWxzIiwibmV3Rm9jdXMiLCJwb2ludGVyIiwiYXR0YWNoZWRMaXN0ZW5lciIsImxvY2tIaWdobGlnaHQiLCJzYXZlUG9pbnRlciIsIl9vblBvaW50ZXJNb3ZlIiwicm9vdFRvU2VsZiIsImdldERlc2NlbmRhbnRzVXNlSGlnaGxpZ2h0aW5nIiwiX29uUG9pbnRlckV4aXRlZCIsImlzUGlja2FibGUiLCJjb250YWluc05vZGUiLCJfb25Qb2ludGVyUmVsZWFzZSIsIl9vblBvaW50ZXJEb3duIiwiZm9jdXMiLCJsb2NrZWQiLCJpc0Rpc3Bvc2VkIiwib25EaXNwbGF5QWRkZWQiLCJoYXNMaXN0ZW5lciIsImxpbmsiLCJfYm91bmRQb2ludGVyRm9jdXNDbGVhcmVkTGlzdGVuZXIiLCJ1bmxpbmsiLCJsaXN0ZW5lcnMiLCJpbmNsdWRlcyIsIl9vblBvaW50ZXJDYW5jZWwiLCJldmVudFBvaW50ZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwiY29weSIsImhhbmRsZUxvY2tlZFBvaW50ZXJGb2N1c0NsZWFyZWQiLCJfb25JbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0VuYWJsZWRDaGFuZ2UiLCJmZWF0dXJlRW5hYmxlZCIsImhhc0FjdGl2YXRpb25MaXN0ZW5lciIsIm9uQ2hhbmdlZEluc3RhbmNlIiwiaW5zdGFuY2UiLCJhZGRlZCIsInVuaXF1ZUlkIiwiaW5zdGFuY2VzIiwiaW5kZXhPZlNlbGYiLCJpbmRleE9mIiwiY2hpbGRUb0xlYWZOb2RlcyIsInNsaWNlIiwiZGVzY2VuZGFudHNVc2VWb2ljaW5nIiwibXV0YXRlIiwib3B0aW9ucyIsImFyZ3MiLCJlbnRlciIsImJpbmQiLCJvdmVyIiwibW92ZSIsImV4aXQiLCJkb3duIiwiYWRkTGlzdGVuZXIiLCJib3VuZFBvaW50ZXJSZWxlYXNlTGlzdGVuZXIiLCJib3VuZFBvaW50ZXJDYW5jZWwiLCJ1cCIsImNhbmNlbCIsImludGVycnVwdCIsImlzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmVQcm9wZXJ0eSIsInByb3RvdHlwZSIsIl9tdXRhdG9yS2V5cyIsImNvbmNhdCIsIl8iLCJ1bmlxIiwic29tZXRoaW5nIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsT0FBT0EsaUJBQWlCLHFDQUFxQztBQUM3RCxPQUFPQyxrQkFBa0Isc0NBQXNDO0FBRS9ELE9BQU9DLGFBQWEsc0NBQXNDO0FBRzFELFNBQVNDLGFBQWEsRUFBV0MsS0FBSyxFQUEwQkMsSUFBSSxFQUFXQyxPQUFPLFFBQTZDLG1CQUFtQjtBQUd0SixZQUFZO0FBQ1osNEhBQTRIO0FBQzVILE1BQU1DLG1DQUFtQztJQUN2QztJQUNBO0lBQ0E7Q0FDRDtBQW9ERCxNQUFNQywwQkFBMEJOLFFBQVMsQ0FBdUNPO0lBRTlFLG1CQUFtQjtJQUNuQkMsVUFBVUEsT0FBUSxDQUFDRCxLQUFLRSw2QkFBNkIsRUFBRTtJQUV2RCxNQUFNQywrQkFBK0JULGNBQWUsZ0NBQWdD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