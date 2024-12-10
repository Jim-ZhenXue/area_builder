// Copyright 2020-2023, University of Colorado Boulder
/**
 * A prototype listener for accessibility purposes. Intended to be added to the display
 * with the following behavior when the user interacts anywhere on the screen, unless
 * the pointer is already attached.
 *
 * - Swipe right, focus next
 * - Swipe left, focus previous
 * - Double tap, activate focusable item (sending click event)
 * - Press and hold, initiate drag of focused item (forwarding press to item)
 *
 * We hope that the above input strategies will allow BVI users to interact with the sim
 * without the use of a screen reader, but in combination with the voicing feature set.
 *
 * PROTOTYPE. DO NOT USE IN PRODUCTION CODE.
 *
 * @author Jesse Greenberg
 */ import stepTimer from '../../../axon/js/stepTimer.js';
import { FocusManager, Intent, PDOMUtils, scenery } from '../imports.js';
// constants
// in seconds, amount of time to initiate a press and hold gesture - note, it must be at least this long
// or else vibrations won't start from a press and hold gesture because the default press and hold
// vibration from safari interferes, see https://github.com/phetsims/gravity-force-lab-basics/issues/260
const PRESS_AND_HOLD_INTERVAL = 0.75;
const DOUBLE_TAP_INTERVAL = 0.6; // in seconds, max time between down events that would indicate a click gesture
let SwipeListener = class SwipeListener {
    /**
   * @public (scenery-internal)
   * @param event
   */ handleDown(event) {
        event.pointer.addIntent(Intent.DRAG);
        this.downPointers.push(event.pointer);
        // allow zoom gestures if there is more than one pointer down
        if (this.downPointers.length > 1) {
            this.downPointers.forEach((downPointer)=>downPointer.removeIntent(Intent.DRAG));
            event.pointer.removeIntent(Intent.DRAG);
        }
        assert && assert(event.pointer.attachedProperty.get(), 'should be attached to the handle listener');
        event.pointer.removeInputListener(this.handleEventListener);
        if (this._pointer === null && event.pointer.type === 'touch') {
            // don't add new listeners if we weren't able to successfully detach and interrupt
            // the previous listener
            this._pointer = event.pointer;
            event.pointer.addInputListener(this._pointerListener, true);
            // this takes priority, no other listeners should fire
            event.abort();
            // keep a reference to the event on down so we can use it in the swipeStart
            // callback if the pointer remains down for long enough
            this.downEvent = event;
            this.downPoint = event.pointer.point;
            this.currentPoint = this.downPoint.copy();
            this.previousPoint = this.currentPoint.copy();
        }
    }
    /**
   * @public
   * @param event
   */ up(event) {
        const index = this.downPointers.indexOf(event.pointer);
        if (index > -1) {
            this.downPointers.splice(index, 1);
        }
    }
    /**
   * Step the listener, updating timers used to determine swipe speeds and
   * double tap gestures.
   * @param dt
   * @private
   */ step(dt) {
        // detecting a double-tap
        if (this.firstUp) {
            this.timeSinceLastDown += dt;
            // too long for gesture, wait till next attempt
            if (this.timeSinceLastDown > DOUBLE_TAP_INTERVAL) {
                this.firstUp = false;
                this.timeSinceLastDown = 0;
            }
        }
        // detecting a press and hold
        if (this._pointer) {
            if (!this._pointer.listeners.includes(this._attachedPointerListener)) {
                if (this.holdingTime > PRESS_AND_HOLD_INTERVAL) {
                    // user has pressed down for long enough to forward a drag event to the
                    // focused node
                    const focusedNode = FocusManager.pdomFocusedNode;
                    if (focusedNode) {
                        // remove the listener looking for gestures
                        this._pointer.removeInputListener(this._pointerListener);
                        this.holdingTime = 0;
                        this.focusedNode = focusedNode;
                        this._pointer.addInputListener(this._attachedPointerListener, true);
                        this.focusedNode.swipeStart && this.focusedNode.swipeStart(this.downEvent, this);
                        this.downEvent = null;
                    }
                } else {
                    this.holdingTime += dt;
                }
            }
        }
        // determining swipe velocity
        if (this.lastPoint !== null && this.currentPoint !== null) {
            this.velocity = this.lastPoint.minus(this.currentPoint).dividedScalar(dt);
        }
    }
    /**
   * Ends a swipe gesture, removing listeners and clearing references.
   * @private
   */ endSwipe() {
        this.holdingTime = 0;
        // remove if we haven't been interrupted already
        if (this._pointer && this._pointer.listeners.includes(this._pointerListener)) {
            this._pointer.removeInputListener(this._pointerListener);
        }
    }
    /**
   * Detach the Pointer listener that is observing movement after a press-and-hold gesture.
   * This allows you to forward the down event to another listener if you don't want to
   * re-implement an interaction with swipeMove. This does not remove the listener from the Pointer,
   * just detaches it so that another listener can be attached.
   * @public
   */ detachPointerListener() {
        this._pointer.detach(this._attachedPointerListener);
    }
    /**
   * Interrupt this listener.
   * @public
   */ interrupt() {
        this.endSwipe();
        this._pointer = null;
        this.downEvent = null;
    }
    /**
   * @param {Input} input
   */ constructor(input){
        // @private - reference to the pointer taken on down, to watch for the user gesture
        this._pointer = null;
        // @private the position (in global coordinate frame) of the point on initial down
        this.downPoint = null;
        // @private - reference to the down event initially so we can pass it to swipeStart
        // if the pointer remains down for long enough
        this.downEvent = null;
        // @public - is the input listener enabled?
        this.enabled = false;
        // @private {Vector2} - point of the last Pointer on down
        this.lastPoint = null;
        this.currentPoint = null;
        this.velocity = null;
        this.swipeDistance = null;
        this.firstUp = false;
        this.timeSinceLastDown = 0;
        // @private - list of all pointers that are currently down for this listener - if there are more than one
        // we will allow responding to zoom gestures, but if there is only one pointer we will prevent pan
        // gestures because we are taking over for swipe gestures instead
        this.downPointers = [];
        // amount of time in seconds that a finger has been down on the screen - when this
        // time becomes larger than the interval we forward a drag listener to the
        // display target
        this.holdingTime = 0;
        // @private - a reference to the focused Node so that we can call swipe functions
        // implemented on the Node when a swipe to drag gesture has been initiated
        this.focusedNode = null;
        // @private - listener that gets attached to the Pointer right as it is added to Input,
        // to prevent any other input handling or dispatching
        this.handleEventListener = {
            down: (event)=>{
                // do not allow any other input handling, this listener assumes control
                event.handle();
                event.abort();
                // start the event handling, down will add Pointer listeners to respond to swipes
                // and other gestures
                this.handleDown(event);
            }
        };
        input.pointerAddedEmitter.addListener((pointer)=>{
            if (this.enabled) {
                pointer.addInputListener(this.handleEventListener, true);
            }
        });
        // @private - listener added to the pointer with attachment to call swipe functions
        // on a particular node with focus
        this._attachedPointerListener = {
            up: (event)=>{
                this.focusedNode && this.focusedNode.swipeEnd && this.focusedNode.swipeEnd.bind(this.focusedNode)(event, this);
                // remove this listener, call the focusedNode's swipeEnd function
                this.focusedNode = null;
                this._pointer.removeInputListener(this._attachedPointerListener);
                this._pointer = null;
            },
            move: (event)=>{
                // call the focusedNode's swipeDrag function
                this.focusedNode && this.focusedNode.swipeMove && this.focusedNode.swipeMove.bind(this.focusedNode)(event, this);
            },
            interrupt: (event)=>{
                this.focusedNode = null;
                this._pointer.removeInputListener(this._attachedPointerListener);
                this._pointer = null;
            },
            cancel: (event)=>{
                this.focusedNode = null;
                this._pointer.removeInputListener(this._attachedPointerListener);
                this._pointer = null;
            }
        };
        // @private - added to Pointer on down without attaching so that if the event does result
        // in attachment elsewhere, this listener can be interrupted
        this._pointerListener = {
            up: (event)=>{
                // on all releases, clear references and timers
                this.endSwipe();
                this._pointer = null;
                this.swipeDistance = event.pointer.point.minus(this.downPoint);
                const verticalDistance = this.swipeDistance.y;
                const horizontalDistance = this.swipeDistance.x;
                if (Math.abs(horizontalDistance) > 100 && Math.abs(verticalDistance) < 100) {
                    // some sort of horizontal swipe
                    if (horizontalDistance > 0) {
                        // for upcoming interviews, lets limit the focus to be within the simulation,
                        // don't allow it to go into the (uninstrumented) navigation bar
                        if (FocusManager.pdomFocusedNode && FocusManager.pdomFocusedNode.innerContent === 'Reset All') {
                            return;
                        }
                        PDOMUtils.getNextFocusable(document.body).focus();
                    } else {
                        PDOMUtils.getPreviousFocusable(document.body).focus();
                    }
                } else {
                    // potentially a double tap
                    if (this.firstUp) {
                        if (this.timeSinceLastDown < DOUBLE_TAP_INTERVAL) {
                            this.firstUp = false;
                            this.timeSinceLastDown = 0;
                            // send a click event to the active element
                            const pdomRoot = document.getElementsByClassName('a11y-pdom-root')[0];
                            if (pdomRoot && pdomRoot.contains(event.activeElement)) {
                                event.activeElement.click();
                            }
                        }
                    } else {
                        this.firstUp = true;
                    }
                }
            },
            move: (event)=>{
                this.lastPoint = this.currentPoint;
                this.currentPoint = event.pointer.point;
            },
            interrupt: ()=>{
                this.interrupt();
            },
            cancel: ()=>{
                this.interrupt();
            }
        };
        stepTimer.addListener(this.step.bind(this));
    }
};
scenery.register('SwipeListener', SwipeListener);
export default SwipeListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL1N3aXBlTGlzdGVuZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBwcm90b3R5cGUgbGlzdGVuZXIgZm9yIGFjY2Vzc2liaWxpdHkgcHVycG9zZXMuIEludGVuZGVkIHRvIGJlIGFkZGVkIHRvIHRoZSBkaXNwbGF5XG4gKiB3aXRoIHRoZSBmb2xsb3dpbmcgYmVoYXZpb3Igd2hlbiB0aGUgdXNlciBpbnRlcmFjdHMgYW55d2hlcmUgb24gdGhlIHNjcmVlbiwgdW5sZXNzXG4gKiB0aGUgcG9pbnRlciBpcyBhbHJlYWR5IGF0dGFjaGVkLlxuICpcbiAqIC0gU3dpcGUgcmlnaHQsIGZvY3VzIG5leHRcbiAqIC0gU3dpcGUgbGVmdCwgZm9jdXMgcHJldmlvdXNcbiAqIC0gRG91YmxlIHRhcCwgYWN0aXZhdGUgZm9jdXNhYmxlIGl0ZW0gKHNlbmRpbmcgY2xpY2sgZXZlbnQpXG4gKiAtIFByZXNzIGFuZCBob2xkLCBpbml0aWF0ZSBkcmFnIG9mIGZvY3VzZWQgaXRlbSAoZm9yd2FyZGluZyBwcmVzcyB0byBpdGVtKVxuICpcbiAqIFdlIGhvcGUgdGhhdCB0aGUgYWJvdmUgaW5wdXQgc3RyYXRlZ2llcyB3aWxsIGFsbG93IEJWSSB1c2VycyB0byBpbnRlcmFjdCB3aXRoIHRoZSBzaW1cbiAqIHdpdGhvdXQgdGhlIHVzZSBvZiBhIHNjcmVlbiByZWFkZXIsIGJ1dCBpbiBjb21iaW5hdGlvbiB3aXRoIHRoZSB2b2ljaW5nIGZlYXR1cmUgc2V0LlxuICpcbiAqIFBST1RPVFlQRS4gRE8gTk9UIFVTRSBJTiBQUk9EVUNUSU9OIENPREUuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCB7IEZvY3VzTWFuYWdlciwgSW50ZW50LCBQRE9NVXRpbHMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuLy8gY29uc3RhbnRzXG4vLyBpbiBzZWNvbmRzLCBhbW91bnQgb2YgdGltZSB0byBpbml0aWF0ZSBhIHByZXNzIGFuZCBob2xkIGdlc3R1cmUgLSBub3RlLCBpdCBtdXN0IGJlIGF0IGxlYXN0IHRoaXMgbG9uZ1xuLy8gb3IgZWxzZSB2aWJyYXRpb25zIHdvbid0IHN0YXJ0IGZyb20gYSBwcmVzcyBhbmQgaG9sZCBnZXN0dXJlIGJlY2F1c2UgdGhlIGRlZmF1bHQgcHJlc3MgYW5kIGhvbGRcbi8vIHZpYnJhdGlvbiBmcm9tIHNhZmFyaSBpbnRlcmZlcmVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMjYwXG5jb25zdCBQUkVTU19BTkRfSE9MRF9JTlRFUlZBTCA9IDAuNzU7XG5jb25zdCBET1VCTEVfVEFQX0lOVEVSVkFMID0gMC42OyAvLyBpbiBzZWNvbmRzLCBtYXggdGltZSBiZXR3ZWVuIGRvd24gZXZlbnRzIHRoYXQgd291bGQgaW5kaWNhdGUgYSBjbGljayBnZXN0dXJlXG5cbmNsYXNzIFN3aXBlTGlzdGVuZXIge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0lucHV0fSBpbnB1dFxuICAgKi9cbiAgY29uc3RydWN0b3IoIGlucHV0ICkge1xuXG4gICAgLy8gQHByaXZhdGUgLSByZWZlcmVuY2UgdG8gdGhlIHBvaW50ZXIgdGFrZW4gb24gZG93biwgdG8gd2F0Y2ggZm9yIHRoZSB1c2VyIGdlc3R1cmVcbiAgICB0aGlzLl9wb2ludGVyID0gbnVsbDtcblxuICAgIC8vIEBwcml2YXRlIHRoZSBwb3NpdGlvbiAoaW4gZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUpIG9mIHRoZSBwb2ludCBvbiBpbml0aWFsIGRvd25cbiAgICB0aGlzLmRvd25Qb2ludCA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSAtIHJlZmVyZW5jZSB0byB0aGUgZG93biBldmVudCBpbml0aWFsbHkgc28gd2UgY2FuIHBhc3MgaXQgdG8gc3dpcGVTdGFydFxuICAgIC8vIGlmIHRoZSBwb2ludGVyIHJlbWFpbnMgZG93biBmb3IgbG9uZyBlbm91Z2hcbiAgICB0aGlzLmRvd25FdmVudCA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIC0gaXMgdGhlIGlucHV0IGxpc3RlbmVyIGVuYWJsZWQ/XG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG5cbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn0gLSBwb2ludCBvZiB0aGUgbGFzdCBQb2ludGVyIG9uIGRvd25cbiAgICB0aGlzLmxhc3RQb2ludCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50UG9pbnQgPSBudWxsO1xuICAgIHRoaXMudmVsb2NpdHkgPSBudWxsO1xuICAgIHRoaXMuc3dpcGVEaXN0YW5jZSA9IG51bGw7XG5cbiAgICB0aGlzLmZpcnN0VXAgPSBmYWxzZTtcbiAgICB0aGlzLnRpbWVTaW5jZUxhc3REb3duID0gMDtcblxuICAgIC8vIEBwcml2YXRlIC0gbGlzdCBvZiBhbGwgcG9pbnRlcnMgdGhhdCBhcmUgY3VycmVudGx5IGRvd24gZm9yIHRoaXMgbGlzdGVuZXIgLSBpZiB0aGVyZSBhcmUgbW9yZSB0aGFuIG9uZVxuICAgIC8vIHdlIHdpbGwgYWxsb3cgcmVzcG9uZGluZyB0byB6b29tIGdlc3R1cmVzLCBidXQgaWYgdGhlcmUgaXMgb25seSBvbmUgcG9pbnRlciB3ZSB3aWxsIHByZXZlbnQgcGFuXG4gICAgLy8gZ2VzdHVyZXMgYmVjYXVzZSB3ZSBhcmUgdGFraW5nIG92ZXIgZm9yIHN3aXBlIGdlc3R1cmVzIGluc3RlYWRcbiAgICB0aGlzLmRvd25Qb2ludGVycyA9IFtdO1xuXG4gICAgLy8gYW1vdW50IG9mIHRpbWUgaW4gc2Vjb25kcyB0aGF0IGEgZmluZ2VyIGhhcyBiZWVuIGRvd24gb24gdGhlIHNjcmVlbiAtIHdoZW4gdGhpc1xuICAgIC8vIHRpbWUgYmVjb21lcyBsYXJnZXIgdGhhbiB0aGUgaW50ZXJ2YWwgd2UgZm9yd2FyZCBhIGRyYWcgbGlzdGVuZXIgdG8gdGhlXG4gICAgLy8gZGlzcGxheSB0YXJnZXRcbiAgICB0aGlzLmhvbGRpbmdUaW1lID0gMDtcblxuICAgIC8vIEBwcml2YXRlIC0gYSByZWZlcmVuY2UgdG8gdGhlIGZvY3VzZWQgTm9kZSBzbyB0aGF0IHdlIGNhbiBjYWxsIHN3aXBlIGZ1bmN0aW9uc1xuICAgIC8vIGltcGxlbWVudGVkIG9uIHRoZSBOb2RlIHdoZW4gYSBzd2lwZSB0byBkcmFnIGdlc3R1cmUgaGFzIGJlZW4gaW5pdGlhdGVkXG4gICAgdGhpcy5mb2N1c2VkTm9kZSA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSAtIGxpc3RlbmVyIHRoYXQgZ2V0cyBhdHRhY2hlZCB0byB0aGUgUG9pbnRlciByaWdodCBhcyBpdCBpcyBhZGRlZCB0byBJbnB1dCxcbiAgICAvLyB0byBwcmV2ZW50IGFueSBvdGhlciBpbnB1dCBoYW5kbGluZyBvciBkaXNwYXRjaGluZ1xuICAgIHRoaXMuaGFuZGxlRXZlbnRMaXN0ZW5lciA9IHtcbiAgICAgIGRvd246IGV2ZW50ID0+IHtcblxuICAgICAgICAvLyBkbyBub3QgYWxsb3cgYW55IG90aGVyIGlucHV0IGhhbmRsaW5nLCB0aGlzIGxpc3RlbmVyIGFzc3VtZXMgY29udHJvbFxuICAgICAgICBldmVudC5oYW5kbGUoKTtcbiAgICAgICAgZXZlbnQuYWJvcnQoKTtcblxuICAgICAgICAvLyBzdGFydCB0aGUgZXZlbnQgaGFuZGxpbmcsIGRvd24gd2lsbCBhZGQgUG9pbnRlciBsaXN0ZW5lcnMgdG8gcmVzcG9uZCB0byBzd2lwZXNcbiAgICAgICAgLy8gYW5kIG90aGVyIGdlc3R1cmVzXG4gICAgICAgIHRoaXMuaGFuZGxlRG93biggZXZlbnQgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlucHV0LnBvaW50ZXJBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHBvaW50ZXIgPT4ge1xuICAgICAgaWYgKCB0aGlzLmVuYWJsZWQgKSB7XG4gICAgICAgIHBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5oYW5kbGVFdmVudExpc3RlbmVyLCB0cnVlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gQHByaXZhdGUgLSBsaXN0ZW5lciBhZGRlZCB0byB0aGUgcG9pbnRlciB3aXRoIGF0dGFjaG1lbnQgdG8gY2FsbCBzd2lwZSBmdW5jdGlvbnNcbiAgICAvLyBvbiBhIHBhcnRpY3VsYXIgbm9kZSB3aXRoIGZvY3VzXG4gICAgdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIgPSB7XG4gICAgICB1cDogZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLmZvY3VzZWROb2RlICYmIHRoaXMuZm9jdXNlZE5vZGUuc3dpcGVFbmQgJiYgdGhpcy5mb2N1c2VkTm9kZS5zd2lwZUVuZC5iaW5kKCB0aGlzLmZvY3VzZWROb2RlICkoIGV2ZW50LCB0aGlzICk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRoaXMgbGlzdGVuZXIsIGNhbGwgdGhlIGZvY3VzZWROb2RlJ3Mgc3dpcGVFbmQgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XG4gICAgICB9LFxuXG4gICAgICBtb3ZlOiBldmVudCA9PiB7XG5cbiAgICAgICAgLy8gY2FsbCB0aGUgZm9jdXNlZE5vZGUncyBzd2lwZURyYWcgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZSAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlTW92ZSAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlTW92ZS5iaW5kKCB0aGlzLmZvY3VzZWROb2RlICkoIGV2ZW50LCB0aGlzICk7XG4gICAgICB9LFxuXG4gICAgICBpbnRlcnJ1cHQ6IGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XG4gICAgICB9LFxuXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5mb2N1c2VkTm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIEBwcml2YXRlIC0gYWRkZWQgdG8gUG9pbnRlciBvbiBkb3duIHdpdGhvdXQgYXR0YWNoaW5nIHNvIHRoYXQgaWYgdGhlIGV2ZW50IGRvZXMgcmVzdWx0XG4gICAgLy8gaW4gYXR0YWNobWVudCBlbHNld2hlcmUsIHRoaXMgbGlzdGVuZXIgY2FuIGJlIGludGVycnVwdGVkXG4gICAgdGhpcy5fcG9pbnRlckxpc3RlbmVyID0ge1xuICAgICAgdXA6IGV2ZW50ID0+IHtcblxuICAgICAgICAvLyBvbiBhbGwgcmVsZWFzZXMsIGNsZWFyIHJlZmVyZW5jZXMgYW5kIHRpbWVyc1xuICAgICAgICB0aGlzLmVuZFN3aXBlKCk7XG4gICAgICAgIHRoaXMuX3BvaW50ZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuc3dpcGVEaXN0YW5jZSA9IGV2ZW50LnBvaW50ZXIucG9pbnQubWludXMoIHRoaXMuZG93blBvaW50ICk7XG5cbiAgICAgICAgY29uc3QgdmVydGljYWxEaXN0YW5jZSA9IHRoaXMuc3dpcGVEaXN0YW5jZS55O1xuICAgICAgICBjb25zdCBob3Jpem9udGFsRGlzdGFuY2UgPSB0aGlzLnN3aXBlRGlzdGFuY2UueDtcbiAgICAgICAgaWYgKCBNYXRoLmFicyggaG9yaXpvbnRhbERpc3RhbmNlICkgPiAxMDAgJiYgTWF0aC5hYnMoIHZlcnRpY2FsRGlzdGFuY2UgKSA8IDEwMCApIHtcblxuICAgICAgICAgIC8vIHNvbWUgc29ydCBvZiBob3Jpem9udGFsIHN3aXBlXG4gICAgICAgICAgaWYgKCBob3Jpem9udGFsRGlzdGFuY2UgPiAwICkge1xuXG4gICAgICAgICAgICAvLyBmb3IgdXBjb21pbmcgaW50ZXJ2aWV3cywgbGV0cyBsaW1pdCB0aGUgZm9jdXMgdG8gYmUgd2l0aGluIHRoZSBzaW11bGF0aW9uLFxuICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgaXQgdG8gZ28gaW50byB0aGUgKHVuaW5zdHJ1bWVudGVkKSBuYXZpZ2F0aW9uIGJhclxuICAgICAgICAgICAgaWYgKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlICYmIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGUuaW5uZXJDb250ZW50ID09PSAnUmVzZXQgQWxsJyApIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUERPTVV0aWxzLmdldE5leHRGb2N1c2FibGUoIGRvY3VtZW50LmJvZHkgKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFBET01VdGlscy5nZXRQcmV2aW91c0ZvY3VzYWJsZSggZG9jdW1lbnQuYm9keSApLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgLy8gcG90ZW50aWFsbHkgYSBkb3VibGUgdGFwXG4gICAgICAgICAgaWYgKCB0aGlzLmZpcnN0VXAgKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMudGltZVNpbmNlTGFzdERvd24gPCBET1VCTEVfVEFQX0lOVEVSVkFMICkge1xuICAgICAgICAgICAgICB0aGlzLmZpcnN0VXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgdGhpcy50aW1lU2luY2VMYXN0RG93biA9IDA7XG5cbiAgICAgICAgICAgICAgLy8gc2VuZCBhIGNsaWNrIGV2ZW50IHRvIHRoZSBhY3RpdmUgZWxlbWVudFxuICAgICAgICAgICAgICBjb25zdCBwZG9tUm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoICdhMTF5LXBkb20tcm9vdCcgKVsgMCBdO1xuXG4gICAgICAgICAgICAgIGlmICggcGRvbVJvb3QgJiYgcGRvbVJvb3QuY29udGFpbnMoIGV2ZW50LmFjdGl2ZUVsZW1lbnQgKSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5hY3RpdmVFbGVtZW50LmNsaWNrKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VXAgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgbW92ZTogZXZlbnQgPT4ge1xuICAgICAgICB0aGlzLmxhc3RQb2ludCA9IHRoaXMuY3VycmVudFBvaW50O1xuICAgICAgICB0aGlzLmN1cnJlbnRQb2ludCA9IGV2ZW50LnBvaW50ZXIucG9pbnQ7XG4gICAgICB9LFxuXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICAgIH0sXG5cbiAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICB0aGlzLmludGVycnVwdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoIHRoaXMuc3RlcC5iaW5kKCB0aGlzICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIGhhbmRsZURvd24oIGV2ZW50ICkge1xuICAgIGV2ZW50LnBvaW50ZXIuYWRkSW50ZW50KCBJbnRlbnQuRFJBRyApO1xuICAgIHRoaXMuZG93blBvaW50ZXJzLnB1c2goIGV2ZW50LnBvaW50ZXIgKTtcblxuICAgIC8vIGFsbG93IHpvb20gZ2VzdHVyZXMgaWYgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZSBwb2ludGVyIGRvd25cbiAgICBpZiAoIHRoaXMuZG93blBvaW50ZXJzLmxlbmd0aCA+IDEgKSB7XG4gICAgICB0aGlzLmRvd25Qb2ludGVycy5mb3JFYWNoKCBkb3duUG9pbnRlciA9PiBkb3duUG9pbnRlci5yZW1vdmVJbnRlbnQoIEludGVudC5EUkFHICkgKTtcbiAgICAgIGV2ZW50LnBvaW50ZXIucmVtb3ZlSW50ZW50KCBJbnRlbnQuRFJBRyApO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LnBvaW50ZXIuYXR0YWNoZWRQcm9wZXJ0eS5nZXQoKSwgJ3Nob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgaGFuZGxlIGxpc3RlbmVyJyApO1xuICAgIGV2ZW50LnBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5oYW5kbGVFdmVudExpc3RlbmVyICk7XG5cbiAgICBpZiAoIHRoaXMuX3BvaW50ZXIgPT09IG51bGwgJiYgZXZlbnQucG9pbnRlci50eXBlID09PSAndG91Y2gnICkge1xuXG4gICAgICAvLyBkb24ndCBhZGQgbmV3IGxpc3RlbmVycyBpZiB3ZSB3ZXJlbid0IGFibGUgdG8gc3VjY2Vzc2Z1bGx5IGRldGFjaCBhbmQgaW50ZXJydXB0XG4gICAgICAvLyB0aGUgcHJldmlvdXMgbGlzdGVuZXJcbiAgICAgIHRoaXMuX3BvaW50ZXIgPSBldmVudC5wb2ludGVyO1xuICAgICAgZXZlbnQucG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIsIHRydWUgKTtcblxuICAgICAgLy8gdGhpcyB0YWtlcyBwcmlvcml0eSwgbm8gb3RoZXIgbGlzdGVuZXJzIHNob3VsZCBmaXJlXG4gICAgICBldmVudC5hYm9ydCgpO1xuXG4gICAgICAvLyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBldmVudCBvbiBkb3duIHNvIHdlIGNhbiB1c2UgaXQgaW4gdGhlIHN3aXBlU3RhcnRcbiAgICAgIC8vIGNhbGxiYWNrIGlmIHRoZSBwb2ludGVyIHJlbWFpbnMgZG93biBmb3IgbG9uZyBlbm91Z2hcbiAgICAgIHRoaXMuZG93bkV2ZW50ID0gZXZlbnQ7XG5cbiAgICAgIHRoaXMuZG93blBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludDtcbiAgICAgIHRoaXMuY3VycmVudFBvaW50ID0gdGhpcy5kb3duUG9pbnQuY29weSgpO1xuICAgICAgdGhpcy5wcmV2aW91c1BvaW50ID0gdGhpcy5jdXJyZW50UG9pbnQuY29weSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgdXAoIGV2ZW50ICkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kb3duUG9pbnRlcnMuaW5kZXhPZiggZXZlbnQucG9pbnRlciApO1xuICAgIGlmICggaW5kZXggPiAtMSApIHtcbiAgICAgIHRoaXMuZG93blBvaW50ZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RlcCB0aGUgbGlzdGVuZXIsIHVwZGF0aW5nIHRpbWVycyB1c2VkIHRvIGRldGVybWluZSBzd2lwZSBzcGVlZHMgYW5kXG4gICAqIGRvdWJsZSB0YXAgZ2VzdHVyZXMuXG4gICAqIEBwYXJhbSBkdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RlcCggZHQgKSB7XG5cbiAgICAvLyBkZXRlY3RpbmcgYSBkb3VibGUtdGFwXG4gICAgaWYgKCB0aGlzLmZpcnN0VXAgKSB7XG4gICAgICB0aGlzLnRpbWVTaW5jZUxhc3REb3duICs9IGR0O1xuXG4gICAgICAvLyB0b28gbG9uZyBmb3IgZ2VzdHVyZSwgd2FpdCB0aWxsIG5leHQgYXR0ZW1wdFxuICAgICAgaWYgKCB0aGlzLnRpbWVTaW5jZUxhc3REb3duID4gRE9VQkxFX1RBUF9JTlRFUlZBTCApIHtcbiAgICAgICAgdGhpcy5maXJzdFVwID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGltZVNpbmNlTGFzdERvd24gPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRldGVjdGluZyBhIHByZXNzIGFuZCBob2xkXG4gICAgaWYgKCB0aGlzLl9wb2ludGVyICkge1xuICAgICAgaWYgKCAhdGhpcy5fcG9pbnRlci5saXN0ZW5lcnMuaW5jbHVkZXMoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICkgKSB7XG4gICAgICAgIGlmICggdGhpcy5ob2xkaW5nVGltZSA+IFBSRVNTX0FORF9IT0xEX0lOVEVSVkFMICkge1xuXG4gICAgICAgICAgLy8gdXNlciBoYXMgcHJlc3NlZCBkb3duIGZvciBsb25nIGVub3VnaCB0byBmb3J3YXJkIGEgZHJhZyBldmVudCB0byB0aGVcbiAgICAgICAgICAvLyBmb2N1c2VkIG5vZGVcbiAgICAgICAgICBjb25zdCBmb2N1c2VkTm9kZSA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGU7XG4gICAgICAgICAgaWYgKCBmb2N1c2VkTm9kZSApIHtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBsaXN0ZW5lciBsb29raW5nIGZvciBnZXN0dXJlc1xuICAgICAgICAgICAgdGhpcy5fcG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZGluZ1RpbWUgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLmZvY3VzZWROb2RlID0gZm9jdXNlZE5vZGU7XG4gICAgICAgICAgICB0aGlzLl9wb2ludGVyLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyLCB0cnVlICk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9jdXNlZE5vZGUuc3dpcGVTdGFydCAmJiB0aGlzLmZvY3VzZWROb2RlLnN3aXBlU3RhcnQoIHRoaXMuZG93bkV2ZW50LCB0aGlzICk7XG4gICAgICAgICAgICB0aGlzLmRvd25FdmVudCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRoaXMuaG9sZGluZ1RpbWUgKz0gZHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkZXRlcm1pbmluZyBzd2lwZSB2ZWxvY2l0eVxuICAgIGlmICggdGhpcy5sYXN0UG9pbnQgIT09IG51bGwgJiYgdGhpcy5jdXJyZW50UG9pbnQgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5sYXN0UG9pbnQubWludXMoIHRoaXMuY3VycmVudFBvaW50ICkuZGl2aWRlZFNjYWxhciggZHQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW5kcyBhIHN3aXBlIGdlc3R1cmUsIHJlbW92aW5nIGxpc3RlbmVycyBhbmQgY2xlYXJpbmcgcmVmZXJlbmNlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGVuZFN3aXBlKCkge1xuICAgIHRoaXMuaG9sZGluZ1RpbWUgPSAwO1xuXG4gICAgLy8gcmVtb3ZlIGlmIHdlIGhhdmVuJ3QgYmVlbiBpbnRlcnJ1cHRlZCBhbHJlYWR5XG4gICAgaWYgKCB0aGlzLl9wb2ludGVyICYmIHRoaXMuX3BvaW50ZXIubGlzdGVuZXJzLmluY2x1ZGVzKCB0aGlzLl9wb2ludGVyTGlzdGVuZXIgKSApIHtcbiAgICAgIHRoaXMuX3BvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcG9pbnRlckxpc3RlbmVyICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERldGFjaCB0aGUgUG9pbnRlciBsaXN0ZW5lciB0aGF0IGlzIG9ic2VydmluZyBtb3ZlbWVudCBhZnRlciBhIHByZXNzLWFuZC1ob2xkIGdlc3R1cmUuXG4gICAqIFRoaXMgYWxsb3dzIHlvdSB0byBmb3J3YXJkIHRoZSBkb3duIGV2ZW50IHRvIGFub3RoZXIgbGlzdGVuZXIgaWYgeW91IGRvbid0IHdhbnQgdG9cbiAgICogcmUtaW1wbGVtZW50IGFuIGludGVyYWN0aW9uIHdpdGggc3dpcGVNb3ZlLiBUaGlzIGRvZXMgbm90IHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSB0aGUgUG9pbnRlcixcbiAgICoganVzdCBkZXRhY2hlcyBpdCBzbyB0aGF0IGFub3RoZXIgbGlzdGVuZXIgY2FuIGJlIGF0dGFjaGVkLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkZXRhY2hQb2ludGVyTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5fcG9pbnRlci5kZXRhY2goIHRoaXMuX2F0dGFjaGVkUG9pbnRlckxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJydXB0IHRoaXMgbGlzdGVuZXIuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGludGVycnVwdCgpIHtcbiAgICB0aGlzLmVuZFN3aXBlKCk7XG4gICAgdGhpcy5fcG9pbnRlciA9IG51bGw7XG4gICAgdGhpcy5kb3duRXZlbnQgPSBudWxsO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTd2lwZUxpc3RlbmVyJywgU3dpcGVMaXN0ZW5lciApO1xuZXhwb3J0IGRlZmF1bHQgU3dpcGVMaXN0ZW5lcjsiXSwibmFtZXMiOlsic3RlcFRpbWVyIiwiRm9jdXNNYW5hZ2VyIiwiSW50ZW50IiwiUERPTVV0aWxzIiwic2NlbmVyeSIsIlBSRVNTX0FORF9IT0xEX0lOVEVSVkFMIiwiRE9VQkxFX1RBUF9JTlRFUlZBTCIsIlN3aXBlTGlzdGVuZXIiLCJoYW5kbGVEb3duIiwiZXZlbnQiLCJwb2ludGVyIiwiYWRkSW50ZW50IiwiRFJBRyIsImRvd25Qb2ludGVycyIsInB1c2giLCJsZW5ndGgiLCJmb3JFYWNoIiwiZG93blBvaW50ZXIiLCJyZW1vdmVJbnRlbnQiLCJhc3NlcnQiLCJhdHRhY2hlZFByb3BlcnR5IiwiZ2V0IiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImhhbmRsZUV2ZW50TGlzdGVuZXIiLCJfcG9pbnRlciIsInR5cGUiLCJhZGRJbnB1dExpc3RlbmVyIiwiX3BvaW50ZXJMaXN0ZW5lciIsImFib3J0IiwiZG93bkV2ZW50IiwiZG93blBvaW50IiwicG9pbnQiLCJjdXJyZW50UG9pbnQiLCJjb3B5IiwicHJldmlvdXNQb2ludCIsInVwIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwic3RlcCIsImR0IiwiZmlyc3RVcCIsInRpbWVTaW5jZUxhc3REb3duIiwibGlzdGVuZXJzIiwiaW5jbHVkZXMiLCJfYXR0YWNoZWRQb2ludGVyTGlzdGVuZXIiLCJob2xkaW5nVGltZSIsImZvY3VzZWROb2RlIiwicGRvbUZvY3VzZWROb2RlIiwic3dpcGVTdGFydCIsImxhc3RQb2ludCIsInZlbG9jaXR5IiwibWludXMiLCJkaXZpZGVkU2NhbGFyIiwiZW5kU3dpcGUiLCJkZXRhY2hQb2ludGVyTGlzdGVuZXIiLCJkZXRhY2giLCJpbnRlcnJ1cHQiLCJjb25zdHJ1Y3RvciIsImlucHV0IiwiZW5hYmxlZCIsInN3aXBlRGlzdGFuY2UiLCJkb3duIiwiaGFuZGxlIiwicG9pbnRlckFkZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3dpcGVFbmQiLCJiaW5kIiwibW92ZSIsInN3aXBlTW92ZSIsImNhbmNlbCIsInZlcnRpY2FsRGlzdGFuY2UiLCJ5IiwiaG9yaXpvbnRhbERpc3RhbmNlIiwieCIsIk1hdGgiLCJhYnMiLCJpbm5lckNvbnRlbnQiLCJnZXROZXh0Rm9jdXNhYmxlIiwiZG9jdW1lbnQiLCJib2R5IiwiZm9jdXMiLCJnZXRQcmV2aW91c0ZvY3VzYWJsZSIsInBkb21Sb290IiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImNvbnRhaW5zIiwiYWN0aXZlRWxlbWVudCIsImNsaWNrIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUVELE9BQU9BLGVBQWUsZ0NBQWdDO0FBQ3RELFNBQVNDLFlBQVksRUFBRUMsTUFBTSxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFekUsWUFBWTtBQUNa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