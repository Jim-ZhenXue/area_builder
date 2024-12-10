// Copyright 2013-2024, University of Colorado Boulder
/*
 * A pointer is an abstraction that includes a mouse and touch points (and possibly keys). The mouse is a single
 * pointer, and each finger (for touch) is a pointer.
 *
 * Listeners that can be added to the pointer, and events will be fired on these listeners before any listeners are
 * fired on the Node structure. This is typically very useful for tracking dragging behavior (where the pointer may
 * cross areas where the dragged node is not directly below the pointer any more).
 *
 * A valid listener should be an object. If a listener has a property with a Scenery event name (e.g. 'down' or
 * 'touchmove'), then that property will be assumed to be a method and will be called with the Scenery event (like
 * normal input listeners, see Node.addInputListener).
 *
 * Pointers can have one active "attached" listener, which is the main handler for responding to the events. This helps
 * when the main behavior needs to be interrupted, or to determine if the pointer is already in use. Additionally, this
 * can be used to prevent pointers from dragging or interacting with multiple components at the same time.
 *
 * A listener may have an interrupt() method that will attemp to interrupt its behavior. If it is added as an attached
 * listener, then it must have an interrupt() method.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import { scenery } from '../imports.js';
export class Intent extends EnumerationValue {
}
// listener attached to the pointer will be used for dragging
Intent.DRAG = new Intent();
// listener attached to pointer is for dragging with a keyboard
Intent.KEYBOARD_DRAG = new Intent();
Intent.enumeration = new Enumeration(Intent, {
    phetioDocumentation: 'entries when signifying Intent of the pointer'
});
let Pointer = class Pointer {
    /**
   * Sets a cursor that takes precedence over cursor values specified on the pointer's trail.
   *
   * Typically this can be set when a drag starts (and returned to null when the drag ends), so that the cursor won't
   * change while dragging (regardless of what is actually under the pointer). This generally will only apply to the
   * Mouse subtype of Pointer.
   *
   * NOTE: Consider setting this only for attached listeners in the future (or have a cursor field on pointers).
   */ setCursor(cursor) {
        this._cursor = cursor;
        return this;
    }
    set cursor(value) {
        this.setCursor(value);
    }
    get cursor() {
        return this.getCursor();
    }
    /**
   * Returns the current cursor override (or null if there is one). See setCursor().
   */ getCursor() {
        return this._cursor;
    }
    /**
   * Returns a defensive copy of all listeners attached to this pointer. (scenery-internal)
   */ getListeners() {
        return this._listeners.slice();
    }
    get listeners() {
        return this.getListeners();
    }
    /**
   * Adds an input listener to this pointer. If the attach flag is true, then it will be set as the "attached"
   * listener.
   */ addInputListener(listener, attach) {
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`addInputListener to ${this.toString()} attach:${attach}`);
        sceneryLog && sceneryLog.Pointer && sceneryLog.push();
        assert && assert(listener, 'A listener must be provided');
        assert && assert(attach === undefined || typeof attach === 'boolean', 'If provided, the attach parameter should be a boolean value');
        assert && assert(!_.includes(this._listeners, listener), 'Attempted to add an input listener that was already added');
        this._listeners.push(listener);
        if (attach) {
            assert && assert(listener.interrupt, 'Interrupt should exist on attached listeners');
            this.attach(listener);
        }
        sceneryLog && sceneryLog.Pointer && sceneryLog.pop();
    }
    /**
   * Removes an input listener from this pointer.
   */ removeInputListener(listener) {
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`removeInputListener to ${this.toString()}`);
        sceneryLog && sceneryLog.Pointer && sceneryLog.push();
        assert && assert(listener, 'A listener must be provided');
        const index = _.indexOf(this._listeners, listener);
        assert && assert(index !== -1, 'Could not find the input listener to remove');
        // If this listener is our attached listener, also detach it
        if (this.isAttached() && listener === this._attachedListener) {
            this.detach(listener);
        }
        this._listeners.splice(index, 1);
        sceneryLog && sceneryLog.Pointer && sceneryLog.pop();
    }
    /**
   * Returns the listener attached to this pointer with attach(), or null if there isn't one.
   */ getAttachedListener() {
        return this._attachedListener;
    }
    get attachedListener() {
        return this.getAttachedListener();
    }
    /**
   * Returns whether this pointer has an attached (primary) listener.
   */ isAttached() {
        return this.attachedProperty.value;
    }
    /**
   * Some pointers are treated differently because they behave like a touch. This is not exclusive to `Touch and touch
   * events though. See https://github.com/phetsims/scenery/issues/1156
   */ isTouchLike() {
        return false;
    }
    /**
   * Sets whether this pointer is down/pressed, or up.
   *
   * NOTE: Naming convention is for legacy code, would usually have pointer.down
   * TODO: improve name, .setDown( value ) with .down = https://github.com/phetsims/scenery/issues/1581
   */ set isDown(value) {
        this.isDownProperty.value = value;
    }
    /**
   * Returns whether this pointer is down/pressed, or up.
   *
   * NOTE: Naming convention is for legacy code, would usually have pointer.down
   * TODO: improve name, .isDown() with .down https://github.com/phetsims/scenery/issues/1581
   */ get isDown() {
        return this.isDownProperty.value;
    }
    /**
   * If there is an attached listener, interrupt it.
   *
   * After this executes, this pointer should not be attached.
   */ interruptAttached() {
        if (this.isAttached()) {
            this._attachedListener.interrupt(); // Any listener that uses the 'attach' API should have interrupt()
        }
    }
    /**
   * Interrupts all listeners on this pointer.
   */ interruptAll() {
        const listeners = this._listeners.slice();
        for(let i = 0; i < listeners.length; i++){
            const listener = listeners[i];
            listener.interrupt && listener.interrupt();
        }
    }
    /**
   * Marks the pointer as attached to this listener.
   */ attach(listener) {
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Attaching to ${this.toString()}`);
        assert && assert(!this.isAttached(), 'Attempted to attach to an already attached pointer');
        this.attachedProperty.value = true;
        this._attachedListener = listener;
    }
    /**
   * @returns - Whether the point changed
   */ updatePoint(point, eventName = 'event') {
        const pointChanged = this.hasPointChanged(point);
        point && sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`pointer ${eventName} at ${point.toString()}`);
        this.point = point;
        return pointChanged;
    }
    /**
   * Sets information in this Pointer for a given pointer down. (scenery-internal)
   *
   @returns - Whether the point changed
   */ down(event) {
        this.isDown = true;
    }
    /**
   * Sets information in this Pointer for a given pointer up. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ up(point, event) {
        this.isDown = false;
        return this.updatePoint(point, 'up');
    }
    /**
   * Sets information in this Pointer for a given pointer cancel. (scenery-internal)
   *
   * @returns - Whether the point changed
   */ cancel(point) {
        this.isDown = false;
        return this.updatePoint(point, 'cancel');
    }
    /**
   * Marks the pointer as detached from a previously attached listener.
   */ detach(listener) {
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Detaching from ${this.toString()}`);
        assert && assert(this.isAttached(), 'Cannot detach a listener if one is not attached');
        assert && assert(this._attachedListener === listener, 'Cannot detach a different listener');
        this.attachedProperty.value = false;
        this._attachedListener = null;
    }
    /**
   * Determines whether the point of the pointer has changed (used in mouse/touch/pen).
   */ hasPointChanged(point) {
        return this.point !== point && (!point || !this.point || !this.point.equals(point));
    }
    /**
   * Adds an Intent Pointer. By setting Intent, other listeners in the dispatch phase can react accordingly.
   * Note that the Intent can be changed by listeners up the dispatch phase or on the next press. See Intent enum
   * for valid entries.
   */ addIntent(intent) {
        assert && assert(Intent.enumeration.includes(intent), 'trying to set unsupported intent for Pointer');
        if (!this._intents.includes(intent)) {
            this._intents.push(intent);
        }
        assert && assert(this._intents.length <= Intent.enumeration.values.length, 'to many Intents saved, memory leak likely');
    }
    /**
   * Remove an Intent from the Pointer. See addIntent for more information.
   */ removeIntent(intent) {
        assert && assert(Intent.enumeration.includes(intent), 'trying to set unsupported intent for Pointer');
        if (this._intents.includes(intent)) {
            const index = this._intents.indexOf(intent);
            this._intents.splice(index, 1);
        }
    }
    /**
   * Returns whether or not this Pointer has been assigned the provided Intent.
   */ hasIntent(intent) {
        return this._intents.includes(intent);
    }
    /**
   * Set the intent of this Pointer to indicate that it will be used for mouse/touch style dragging, indicating to
   * other listeners in the dispatch phase that behavior may need to change. Adds a listener to the pointer (with
   * self removal) that clears the intent when the pointer receives an "up" event. Should generally be called on
   * the Pointer in response to a down event.
   */ reserveForDrag() {
        // if the Pointer hasn't already been reserved for drag in Input event dispatch, in which
        // case it already has Intent and listener to remove Intent
        if (!this._intents.includes(Intent.DRAG)) {
            this.addIntent(Intent.DRAG);
            const listener = {
                up: (event)=>{
                    this.removeIntent(Intent.DRAG);
                    this.removeInputListener(this._listenerForDragReserve);
                    this._listenerForDragReserve = null;
                }
            };
            assert && assert(this._listenerForDragReserve === null, 'still a listener to reserve pointer, memory leak likely');
            this._listenerForDragReserve = listener;
            this.addInputListener(this._listenerForDragReserve);
        }
    }
    /**
   * Set the intent of this Pointer to indicate that it will be used for keyboard style dragging, indicating to
   * other listeners in the dispatch that behavior may need to change. Adds a listener to the pointer (with self
   * removal) that clears the intent when the pointer receives a "keyup" or "blur" event. Should generally be called
   * on the Pointer in response to a keydown event.
   */ reserveForKeyboardDrag() {
        if (!this._intents.includes(Intent.KEYBOARD_DRAG)) {
            this.addIntent(Intent.KEYBOARD_DRAG);
            const listener = {
                keyup: (event)=>clearIntent(),
                // clear on blur as well since focus may be lost before we receive a keyup event
                blur: (event)=>clearIntent()
            };
            const clearIntent = ()=>{
                this.removeIntent(Intent.KEYBOARD_DRAG);
                this.removeInputListener(this._listenerForKeyboardDragReserve);
                this._listenerForKeyboardDragReserve = null;
            };
            assert && assert(this._listenerForDragReserve === null, 'still a listener on Pointer for reserve, memory leak likely');
            this._listenerForKeyboardDragReserve = listener;
            this.addInputListener(this._listenerForKeyboardDragReserve);
        }
    }
    /**
   * This is called when a capture starts on this pointer. We request it on pointerstart, and if received, we should
   * generally receive events outside the window.
   */ onGotPointerCapture() {
        this._pointerCaptured = true;
    }
    /**
   * This is called when a capture ends on this pointer. This happens normally when the user releases the pointer above
   * the sim or outside, but also in cases where we have NOT received an up/end.
   *
   * See https://github.com/phetsims/scenery/issues/1186 for more information. We'll want to interrupt the pointer
   * on this case regardless,
   */ onLostPointerCapture() {
        if (this._pointerCaptured) {
            this.interruptAll();
        }
        this._pointerCaptured = false;
    }
    /**
   * Releases references so it can be garbage collected.
   */ dispose() {
        sceneryLog && sceneryLog.Pointer && sceneryLog.Pointer(`Disposing ${this.toString()}`);
        // remove listeners that would clear intent on disposal
        if (this._listenerForDragReserve && this._listeners.includes(this._listenerForDragReserve)) {
            this.removeInputListener(this._listenerForDragReserve);
        }
        if (this._listenerForKeyboardDragReserve && this._listeners.includes(this._listenerForKeyboardDragReserve)) {
            this.removeInputListener(this._listenerForKeyboardDragReserve);
        }
        assert && assert(this._attachedListener === null, 'Attached listeners should be cleared before pointer disposal');
        assert && assert(this._listeners.length === 0, 'Should not have listeners when a pointer is disposed');
    }
    toString() {
        return `Pointer#${this.type}_at_${this.point}`;
    }
    /**
   * @param initialPoint
   * @param type - the type of the pointer; can different for each subtype
   */ constructor(initialPoint, type){
        assert && assert(initialPoint === null || initialPoint instanceof Vector2);
        assert && assert(Object.getPrototypeOf(this) !== Pointer.prototype, 'Pointer is an abstract class');
        this.point = initialPoint;
        this.type = type;
        this.trail = null;
        this.inputEnabledTrail = null;
        this.isDownProperty = new BooleanProperty(false);
        this.attachedProperty = new BooleanProperty(false);
        this._listeners = [];
        this._attachedListener = null;
        this._cursor = null;
        this.lastEventContext = null;
        this._intents = [];
        this._pointerCaptured = false;
        this._listenerForDragReserve = null;
        this._listenerForKeyboardDragReserve = null;
    }
};
// Pointer is not a PhetioObject and not instrumented, but this type is used for
// toStateObject in Input
Pointer.PointerIO = new IOType('PointerIO', {
    valueType: Pointer,
    toStateObject: (pointer)=>{
        return {
            point: pointer.point.toStateObject(),
            type: pointer.type
        };
    },
    stateSchema: {
        point: Vector2.Vector2IO,
        type: StringIO
    }
});
export { Pointer as default };
scenery.register('Pointer', Pointer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvUG9pbnRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLypcbiAqIEEgcG9pbnRlciBpcyBhbiBhYnN0cmFjdGlvbiB0aGF0IGluY2x1ZGVzIGEgbW91c2UgYW5kIHRvdWNoIHBvaW50cyAoYW5kIHBvc3NpYmx5IGtleXMpLiBUaGUgbW91c2UgaXMgYSBzaW5nbGVcbiAqIHBvaW50ZXIsIGFuZCBlYWNoIGZpbmdlciAoZm9yIHRvdWNoKSBpcyBhIHBvaW50ZXIuXG4gKlxuICogTGlzdGVuZXJzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBwb2ludGVyLCBhbmQgZXZlbnRzIHdpbGwgYmUgZmlyZWQgb24gdGhlc2UgbGlzdGVuZXJzIGJlZm9yZSBhbnkgbGlzdGVuZXJzIGFyZVxuICogZmlyZWQgb24gdGhlIE5vZGUgc3RydWN0dXJlLiBUaGlzIGlzIHR5cGljYWxseSB2ZXJ5IHVzZWZ1bCBmb3IgdHJhY2tpbmcgZHJhZ2dpbmcgYmVoYXZpb3IgKHdoZXJlIHRoZSBwb2ludGVyIG1heVxuICogY3Jvc3MgYXJlYXMgd2hlcmUgdGhlIGRyYWdnZWQgbm9kZSBpcyBub3QgZGlyZWN0bHkgYmVsb3cgdGhlIHBvaW50ZXIgYW55IG1vcmUpLlxuICpcbiAqIEEgdmFsaWQgbGlzdGVuZXIgc2hvdWxkIGJlIGFuIG9iamVjdC4gSWYgYSBsaXN0ZW5lciBoYXMgYSBwcm9wZXJ0eSB3aXRoIGEgU2NlbmVyeSBldmVudCBuYW1lIChlLmcuICdkb3duJyBvclxuICogJ3RvdWNobW92ZScpLCB0aGVuIHRoYXQgcHJvcGVydHkgd2lsbCBiZSBhc3N1bWVkIHRvIGJlIGEgbWV0aG9kIGFuZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBTY2VuZXJ5IGV2ZW50IChsaWtlXG4gKiBub3JtYWwgaW5wdXQgbGlzdGVuZXJzLCBzZWUgTm9kZS5hZGRJbnB1dExpc3RlbmVyKS5cbiAqXG4gKiBQb2ludGVycyBjYW4gaGF2ZSBvbmUgYWN0aXZlIFwiYXR0YWNoZWRcIiBsaXN0ZW5lciwgd2hpY2ggaXMgdGhlIG1haW4gaGFuZGxlciBmb3IgcmVzcG9uZGluZyB0byB0aGUgZXZlbnRzLiBUaGlzIGhlbHBzXG4gKiB3aGVuIHRoZSBtYWluIGJlaGF2aW9yIG5lZWRzIHRvIGJlIGludGVycnVwdGVkLCBvciB0byBkZXRlcm1pbmUgaWYgdGhlIHBvaW50ZXIgaXMgYWxyZWFkeSBpbiB1c2UuIEFkZGl0aW9uYWxseSwgdGhpc1xuICogY2FuIGJlIHVzZWQgdG8gcHJldmVudCBwb2ludGVycyBmcm9tIGRyYWdnaW5nIG9yIGludGVyYWN0aW5nIHdpdGggbXVsdGlwbGUgY29tcG9uZW50cyBhdCB0aGUgc2FtZSB0aW1lLlxuICpcbiAqIEEgbGlzdGVuZXIgbWF5IGhhdmUgYW4gaW50ZXJydXB0KCkgbWV0aG9kIHRoYXQgd2lsbCBhdHRlbXAgdG8gaW50ZXJydXB0IGl0cyBiZWhhdmlvci4gSWYgaXQgaXMgYWRkZWQgYXMgYW4gYXR0YWNoZWRcbiAqIGxpc3RlbmVyLCB0aGVuIGl0IG11c3QgaGF2ZSBhbiBpbnRlcnJ1cHQoKSBtZXRob2QuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCB7IEV2ZW50Q29udGV4dCwgc2NlbmVyeSwgU2NlbmVyeUV2ZW50LCBUSW5wdXRMaXN0ZW5lciwgVHJhaWwgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcbmltcG9ydCBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgZnJvbSAnLi9UQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIuanMnO1xuXG5leHBvcnQgY2xhc3MgSW50ZW50IGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XG4gIC8vIGxpc3RlbmVyIGF0dGFjaGVkIHRvIHRoZSBwb2ludGVyIHdpbGwgYmUgdXNlZCBmb3IgZHJhZ2dpbmdcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBEUkFHID0gbmV3IEludGVudCgpO1xuXG4gIC8vIGxpc3RlbmVyIGF0dGFjaGVkIHRvIHBvaW50ZXIgaXMgZm9yIGRyYWdnaW5nIHdpdGggYSBrZXlib2FyZFxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWUJPQVJEX0RSQUcgPSBuZXcgSW50ZW50KCk7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggSW50ZW50LCB7XG4gICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2VudHJpZXMgd2hlbiBzaWduaWZ5aW5nIEludGVudCBvZiB0aGUgcG9pbnRlcidcbiAgfSApO1xufVxuXG50eXBlIFBvaW50ZXJUeXBlID0gJ3Bkb20nIHwgJ3RvdWNoJyB8ICdtb3VzZScgfCAncGVuJztcblxuZXhwb3J0IHR5cGUgQWN0aXZlUG9pbnRlciA9IHtcbiAgcG9pbnQ6IFZlY3RvcjI7XG59ICYgUG9pbnRlcjtcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgUG9pbnRlciB7XG5cbiAgLy8gVGhlIGxvY2F0aW9uIG9mIHRoZSBwb2ludGVyIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBzeXN0ZW0uXG4gIHB1YmxpYyBwb2ludDogVmVjdG9yMjtcblxuICAvLyBFYWNoIFBvaW50ZXIgc3VidHlwZSBzaG91bGQgaW1wbGVtZW50IGEgXCJ0eXBlXCIgZmllbGQgdGhhdCBjYW4gYmUgY2hlY2tlZCBhZ2FpbnN0IGZvciBzY2VuZXJ5IGlucHV0LlxuICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogUG9pbnRlclR5cGU7XG5cbiAgLy8gVGhlIHRyYWlsIHRoYXQgdGhlIHBvaW50ZXIgaXMgY3VycmVudGx5IG92ZXIgKGlmIGl0IGhhcyB5ZXQgYmVlbiByZWdpc3RlcmVkKS4gSWYgdGhlIHBvaW50ZXIgaGFzIG5vdCB5ZXQgcmVnaXN0ZXJlZFxuICAvLyBhIHRyYWlsLCBpdCBtYXkgYmUgbnVsbC4gSWYgdGhlIHBvaW50ZXIgd2Fzbid0IG92ZXIgYW55IHNwZWNpZmljIHRyYWlsLCB0aGVuIGEgdHJhaWwgd2l0aCBvbmx5IHRoZSBkaXNwbGF5J3NcbiAgLy8gcm9vdE5vZGUgd2lsbCBiZSBzZXQuXG4gIHB1YmxpYyB0cmFpbDogVHJhaWwgfCBudWxsO1xuXG4gIC8vIFRoZSBzdWJzZXQgb2YgUG9pbnRlci50cmFpbCB0aGF0IGlzIE5vZGUuaW5wdXRFbmFibGVkLiBTZWUgVHJhaWwuZ2V0TGFzdElucHV0RW5hYmxlZEluZGV4KCkgZm9yIGRldGFpbHMuIFRoaXMgaXNcbiAgLy8ga2VwdCBzZXBhcmF0ZWx5IHNvIHRoYXQgaXQgY2FuIGJlIGRldGVjdGVkIHdoZW4gaW5wdXRFbmFibGVkIGNoYW5nZXMuXG4gIHB1YmxpYyBpbnB1dEVuYWJsZWRUcmFpbDogVHJhaWwgfCBudWxsO1xuXG4gIC8vIEBkZXByZWNhdGVkIFdoZXRoZXIgdGhpcyBwb2ludGVyIGlzICdkb3duJyAocHJlc3NlZCkuXG4gIC8vIFdpbGwgYmUgcGhhc2VkIG91dCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODAzIHRvIHNvbWV0aGluZyB0aGF0IGlzIHNwZWNpZmljIGZvciB0aGUgYWN0dWFsXG4gIC8vIG1vdXNlL3BlbiBidXR0b24gKHNpbmNlIHRoaXMgZG9lc24ndCBnZW5lcmFsaXplIHdlbGwgdG8gdGhlIGxlZnQvcmlnaHQgbW91c2UgYnV0dG9ucykuXG4gIHB1YmxpYyBpc0Rvd25Qcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIFdoZXRoZXIgdGhlcmUgaXMgYSBtYWluIGxpc3RlbmVyIFwiYXR0YWNoZWRcIiB0byB0aGlzIHBvaW50ZXIuIFRoaXMgc2lnbmFscyB0aGF0IHRoZVxuICAvLyBsaXN0ZW5lciBpcyBcImRvaW5nXCIgc29tZXRoaW5nIHdpdGggdGhlIHBvaW50ZXIsIGFuZCB0aGF0IGl0IHNob3VsZCBiZSBpbnRlcnJ1cHRlZCBpZiBvdGhlciBhY3Rpb25zIG5lZWQgdG8gdGFrZVxuICAvLyBvdmVyIHRoZSBwb2ludGVyIGJlaGF2aW9yLlxuICBwdWJsaWMgYXR0YWNoZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIEFsbCBhdHRhY2hlZCBsaXN0ZW5lcnMgKHdpbGwgYmUgYWN0aXZhdGVkIGluIG9yZGVyKS5cbiAgcHJpdmF0ZSByZWFkb25seSBfbGlzdGVuZXJzOiBUSW5wdXRMaXN0ZW5lcltdO1xuXG4gIC8vIE91ciBtYWluIFwiYXR0YWNoZWRcIiBsaXN0ZW5lciwgaWYgdGhlcmUgaXMgb25lIChvdGhlcndpc2UgbnVsbClcbiAgcHJpdmF0ZSBfYXR0YWNoZWRMaXN0ZW5lcjogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIHwgbnVsbDtcblxuICAvLyBTZWUgc2V0Q3Vyc29yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIHByaXZhdGUgX2N1cnNvcjogc3RyaW5nIHwgbnVsbDtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgLSBSZWNvcmRlZCBhbmQgZXhwb3NlZCBzbyB0aGF0IGl0IGNhbiBiZSBwcm92aWRlZCB0byBldmVudHMgd2hlbiB0aGVyZVxuICAvLyBpcyBubyBcImltbWVkaWF0ZVwiIERPTSBldmVudCAoZS5nLiB3aGVuIGEgbm9kZSBtb3ZlcyBVTkRFUiBhIHBvaW50ZXIgYW5kIHRyaWdnZXJzIGEgdG91Y2gtc25hZykuXG4gIHB1YmxpYyBsYXN0RXZlbnRDb250ZXh0OiBFdmVudENvbnRleHQgfCBudWxsO1xuXG4gIC8vIEEgUG9pbnRlciBjYW4gYmUgYXNzaWduZWQgYW4gaW50ZW50IHdoZW4gYSBsaXN0ZW5lciBpcyBhdHRhY2hlZCB0byBpbml0aWF0ZSBvciBwcmV2ZW50XG4gIC8vIGNlcnRhaW4gYmVoYXZpb3IgZm9yIHRoZSBsaWZlIG9mIHRoZSBsaXN0ZW5lci4gT3RoZXIgbGlzdGVuZXJzIGNhbiBvYnNlcnZlIHRoZSBJbnRlbnRzIG9uIHRoZSBQb2ludGVyIGFuZFxuICAvLyByZWFjdCBhY2NvcmRpbmdseVxuICBwcml2YXRlIF9pbnRlbnRzOiBJbnRlbnRbXTtcblxuICBwcml2YXRlIF9wb2ludGVyQ2FwdHVyZWQ6IGJvb2xlYW47XG5cbiAgLy8gTGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoaXMgcG9pbnRlciB0aGF0IGNsZWFyIHRoZSB0aGlzLl9pbnRlbnQgYWZ0ZXIgaW5wdXQgaW4gcmVzZXJ2ZUZvckRyYWcgZnVuY3Rpb25zLCByZWZlcmVuY2VkXG4gIC8vIHNvIHRoZXkgY2FuIGJlIHJlbW92ZWQgb24gZGlzcG9zYWxcbiAgcHJpdmF0ZSBfbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZTogVElucHV0TGlzdGVuZXIgfCBudWxsO1xuICBwcml2YXRlIF9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmU6IFRJbnB1dExpc3RlbmVyIHwgbnVsbDtcblxuXG4gIC8vIFBvaW50ZXIgaXMgbm90IGEgUGhldGlvT2JqZWN0IGFuZCBub3QgaW5zdHJ1bWVudGVkLCBidXQgdGhpcyB0eXBlIGlzIHVzZWQgZm9yXG4gIC8vIHRvU3RhdGVPYmplY3QgaW4gSW5wdXRcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQb2ludGVySU8gPSBuZXcgSU9UeXBlPFBvaW50ZXI+KCAnUG9pbnRlcklPJywge1xuICAgIHZhbHVlVHlwZTogUG9pbnRlcixcbiAgICB0b1N0YXRlT2JqZWN0OiAoIHBvaW50ZXI6IFBvaW50ZXIgKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb2ludDogcG9pbnRlci5wb2ludC50b1N0YXRlT2JqZWN0KCksXG4gICAgICAgIHR5cGU6IHBvaW50ZXIudHlwZVxuICAgICAgfTtcbiAgICB9LFxuICAgIHN0YXRlU2NoZW1hOiB7XG4gICAgICBwb2ludDogVmVjdG9yMi5WZWN0b3IySU8sXG4gICAgICB0eXBlOiBTdHJpbmdJT1xuICAgIH1cbiAgfSApO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gaW5pdGlhbFBvaW50XG4gICAqIEBwYXJhbSB0eXBlIC0gdGhlIHR5cGUgb2YgdGhlIHBvaW50ZXI7IGNhbiBkaWZmZXJlbnQgZm9yIGVhY2ggc3VidHlwZVxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBpbml0aWFsUG9pbnQ6IFZlY3RvcjIsIHR5cGU6IFBvaW50ZXJUeXBlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluaXRpYWxQb2ludCA9PT0gbnVsbCB8fCBpbml0aWFsUG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IyICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggT2JqZWN0LmdldFByb3RvdHlwZU9mKCB0aGlzICkgIT09IFBvaW50ZXIucHJvdG90eXBlLCAnUG9pbnRlciBpcyBhbiBhYnN0cmFjdCBjbGFzcycgKTtcblxuICAgIHRoaXMucG9pbnQgPSBpbml0aWFsUG9pbnQ7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnRyYWlsID0gbnVsbDtcbiAgICB0aGlzLmlucHV0RW5hYmxlZFRyYWlsID0gbnVsbDtcbiAgICB0aGlzLmlzRG93blByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLmF0dGFjaGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMuX2N1cnNvciA9IG51bGw7XG4gICAgdGhpcy5sYXN0RXZlbnRDb250ZXh0ID0gbnVsbDtcbiAgICB0aGlzLl9pbnRlbnRzID0gW107XG4gICAgdGhpcy5fcG9pbnRlckNhcHR1cmVkID0gZmFsc2U7XG4gICAgdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSA9IG51bGw7XG4gICAgdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgY3Vyc29yIHRoYXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGN1cnNvciB2YWx1ZXMgc3BlY2lmaWVkIG9uIHRoZSBwb2ludGVyJ3MgdHJhaWwuXG4gICAqXG4gICAqIFR5cGljYWxseSB0aGlzIGNhbiBiZSBzZXQgd2hlbiBhIGRyYWcgc3RhcnRzIChhbmQgcmV0dXJuZWQgdG8gbnVsbCB3aGVuIHRoZSBkcmFnIGVuZHMpLCBzbyB0aGF0IHRoZSBjdXJzb3Igd29uJ3RcbiAgICogY2hhbmdlIHdoaWxlIGRyYWdnaW5nIChyZWdhcmRsZXNzIG9mIHdoYXQgaXMgYWN0dWFsbHkgdW5kZXIgdGhlIHBvaW50ZXIpLiBUaGlzIGdlbmVyYWxseSB3aWxsIG9ubHkgYXBwbHkgdG8gdGhlXG4gICAqIE1vdXNlIHN1YnR5cGUgb2YgUG9pbnRlci5cbiAgICpcbiAgICogTk9URTogQ29uc2lkZXIgc2V0dGluZyB0aGlzIG9ubHkgZm9yIGF0dGFjaGVkIGxpc3RlbmVycyBpbiB0aGUgZnV0dXJlIChvciBoYXZlIGEgY3Vyc29yIGZpZWxkIG9uIHBvaW50ZXJzKS5cbiAgICovXG4gIHB1YmxpYyBzZXRDdXJzb3IoIGN1cnNvcjogc3RyaW5nIHwgbnVsbCApOiB0aGlzIHtcbiAgICB0aGlzLl9jdXJzb3IgPSBjdXJzb3I7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgY3Vyc29yKCB2YWx1ZTogc3RyaW5nIHwgbnVsbCApIHsgdGhpcy5zZXRDdXJzb3IoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHsgcmV0dXJuIHRoaXMuZ2V0Q3Vyc29yKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBjdXJzb3Igb3ZlcnJpZGUgKG9yIG51bGwgaWYgdGhlcmUgaXMgb25lKS4gU2VlIHNldEN1cnNvcigpLlxuICAgKi9cbiAgcHVibGljIGdldEN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY3Vyc29yO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiBhbGwgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoaXMgcG9pbnRlci4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0TGlzdGVuZXJzKCk6IFRJbnB1dExpc3RlbmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9saXN0ZW5lcnMuc2xpY2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGlzdGVuZXJzKCk6IFRJbnB1dExpc3RlbmVyW10geyByZXR1cm4gdGhpcy5nZXRMaXN0ZW5lcnMoKTsgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyIHRvIHRoaXMgcG9pbnRlci4gSWYgdGhlIGF0dGFjaCBmbGFnIGlzIHRydWUsIHRoZW4gaXQgd2lsbCBiZSBzZXQgYXMgdGhlIFwiYXR0YWNoZWRcIlxuICAgKiBsaXN0ZW5lci5cbiAgICovXG4gIHB1YmxpYyBhZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lcjogVElucHV0TGlzdGVuZXIsIGF0dGFjaD86IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgYWRkSW5wdXRMaXN0ZW5lciB0byAke3RoaXMudG9TdHJpbmcoKX0gYXR0YWNoOiR7YXR0YWNofWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RlbmVyLCAnQSBsaXN0ZW5lciBtdXN0IGJlIHByb3ZpZGVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGF0dGFjaCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBhdHRhY2ggPT09ICdib29sZWFuJyxcbiAgICAgICdJZiBwcm92aWRlZCwgdGhlIGF0dGFjaCBwYXJhbWV0ZXIgc2hvdWxkIGJlIGEgYm9vbGVhbiB2YWx1ZScgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9saXN0ZW5lcnMsIGxpc3RlbmVyICksXG4gICAgICAnQXR0ZW1wdGVkIHRvIGFkZCBhbiBpbnB1dCBsaXN0ZW5lciB0aGF0IHdhcyBhbHJlYWR5IGFkZGVkJyApO1xuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG5cbiAgICBpZiAoIGF0dGFjaCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RlbmVyLmludGVycnVwdCwgJ0ludGVycnVwdCBzaG91bGQgZXhpc3Qgb24gYXR0YWNoZWQgbGlzdGVuZXJzJyApO1xuICAgICAgdGhpcy5hdHRhY2goIGxpc3RlbmVyIGFzIFRBdHRhY2hhYmxlSW5wdXRMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBpbnB1dCBsaXN0ZW5lciBmcm9tIHRoaXMgcG9pbnRlci5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVJbnB1dExpc3RlbmVyKCBsaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgcmVtb3ZlSW5wdXRMaXN0ZW5lciB0byAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaXN0ZW5lciwgJ0EgbGlzdGVuZXIgbXVzdCBiZSBwcm92aWRlZCcgKTtcblxuICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB0aGlzLl9saXN0ZW5lcnMsIGxpc3RlbmVyICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnQ291bGQgbm90IGZpbmQgdGhlIGlucHV0IGxpc3RlbmVyIHRvIHJlbW92ZScgKTtcblxuICAgIC8vIElmIHRoaXMgbGlzdGVuZXIgaXMgb3VyIGF0dGFjaGVkIGxpc3RlbmVyLCBhbHNvIGRldGFjaCBpdFxuICAgIGlmICggdGhpcy5pc0F0dGFjaGVkKCkgJiYgbGlzdGVuZXIgPT09IHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgKSB7XG4gICAgICB0aGlzLmRldGFjaCggbGlzdGVuZXIgYXMgVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGlzdGVuZXIgYXR0YWNoZWQgdG8gdGhpcyBwb2ludGVyIHdpdGggYXR0YWNoKCksIG9yIG51bGwgaWYgdGhlcmUgaXNuJ3Qgb25lLlxuICAgKi9cbiAgcHVibGljIGdldEF0dGFjaGVkTGlzdGVuZXIoKTogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaGVkTGlzdGVuZXI7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGF0dGFjaGVkTGlzdGVuZXIoKTogVEF0dGFjaGFibGVJbnB1dExpc3RlbmVyIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldEF0dGFjaGVkTGlzdGVuZXIoKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBwb2ludGVyIGhhcyBhbiBhdHRhY2hlZCAocHJpbWFyeSkgbGlzdGVuZXIuXG4gICAqL1xuICBwdWJsaWMgaXNBdHRhY2hlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hlZFByb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNvbWUgcG9pbnRlcnMgYXJlIHRyZWF0ZWQgZGlmZmVyZW50bHkgYmVjYXVzZSB0aGV5IGJlaGF2ZSBsaWtlIGEgdG91Y2guIFRoaXMgaXMgbm90IGV4Y2x1c2l2ZSB0byBgVG91Y2ggYW5kIHRvdWNoXG4gICAqIGV2ZW50cyB0aG91Z2guIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTE1NlxuICAgKi9cbiAgcHVibGljIGlzVG91Y2hMaWtlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdGhpcyBwb2ludGVyIGlzIGRvd24vcHJlc3NlZCwgb3IgdXAuXG4gICAqXG4gICAqIE5PVEU6IE5hbWluZyBjb252ZW50aW9uIGlzIGZvciBsZWdhY3kgY29kZSwgd291bGQgdXN1YWxseSBoYXZlIHBvaW50ZXIuZG93blxuICAgKiBUT0RPOiBpbXByb3ZlIG5hbWUsIC5zZXREb3duKCB2YWx1ZSApIHdpdGggLmRvd24gPSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi9cbiAgcHVibGljIHNldCBpc0Rvd24oIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuaXNEb3duUHJvcGVydHkudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBwb2ludGVyIGlzIGRvd24vcHJlc3NlZCwgb3IgdXAuXG4gICAqXG4gICAqIE5PVEU6IE5hbWluZyBjb252ZW50aW9uIGlzIGZvciBsZWdhY3kgY29kZSwgd291bGQgdXN1YWxseSBoYXZlIHBvaW50ZXIuZG93blxuICAgKiBUT0RPOiBpbXByb3ZlIG5hbWUsIC5pc0Rvd24oKSB3aXRoIC5kb3duIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzRG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0Rvd25Qcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGVyZSBpcyBhbiBhdHRhY2hlZCBsaXN0ZW5lciwgaW50ZXJydXB0IGl0LlxuICAgKlxuICAgKiBBZnRlciB0aGlzIGV4ZWN1dGVzLCB0aGlzIHBvaW50ZXIgc2hvdWxkIG5vdCBiZSBhdHRhY2hlZC5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHRBdHRhY2hlZCgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuaXNBdHRhY2hlZCgpICkge1xuICAgICAgdGhpcy5fYXR0YWNoZWRMaXN0ZW5lciEuaW50ZXJydXB0KCk7IC8vIEFueSBsaXN0ZW5lciB0aGF0IHVzZXMgdGhlICdhdHRhY2gnIEFQSSBzaG91bGQgaGF2ZSBpbnRlcnJ1cHQoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnJ1cHRzIGFsbCBsaXN0ZW5lcnMgb24gdGhpcyBwb2ludGVyLlxuICAgKi9cbiAgcHVibGljIGludGVycnVwdEFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuc2xpY2UoKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc1sgaSBdO1xuICAgICAgbGlzdGVuZXIuaW50ZXJydXB0ICYmIGxpc3RlbmVyLmludGVycnVwdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgcG9pbnRlciBhcyBhdHRhY2hlZCB0byB0aGlzIGxpc3RlbmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBhdHRhY2goIGxpc3RlbmVyOiBUQXR0YWNoYWJsZUlucHV0TGlzdGVuZXIgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIgJiYgc2NlbmVyeUxvZy5Qb2ludGVyKCBgQXR0YWNoaW5nIHRvICR7dGhpcy50b1N0cmluZygpfWAgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzQXR0YWNoZWQoKSwgJ0F0dGVtcHRlZCB0byBhdHRhY2ggdG8gYW4gYWxyZWFkeSBhdHRhY2hlZCBwb2ludGVyJyApO1xuXG4gICAgdGhpcy5hdHRhY2hlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLl9hdHRhY2hlZExpc3RlbmVyID0gbGlzdGVuZXI7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlUG9pbnQoIHBvaW50OiBWZWN0b3IyLCBldmVudE5hbWUgPSAnZXZlbnQnICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHBvaW50Q2hhbmdlZCA9IHRoaXMuaGFzUG9pbnRDaGFuZ2VkKCBwb2ludCApO1xuICAgIHBvaW50ICYmIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCggYHBvaW50ZXIgJHtldmVudE5hbWV9IGF0ICR7cG9pbnQudG9TdHJpbmcoKX1gICk7XG5cbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG4gICAgcmV0dXJuIHBvaW50Q2hhbmdlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUG9pbnRlciBmb3IgYSBnaXZlbiBwb2ludGVyIGRvd24uIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgZG93biggZXZlbnQ6IEV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGluZm9ybWF0aW9uIGluIHRoaXMgUG9pbnRlciBmb3IgYSBnaXZlbiBwb2ludGVyIHVwLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgdXAoIHBvaW50OiBWZWN0b3IyLCBldmVudDogRXZlbnQgKTogYm9vbGVhbiB7XG5cbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVBvaW50KCBwb2ludCwgJ3VwJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgaW5mb3JtYXRpb24gaW4gdGhpcyBQb2ludGVyIGZvciBhIGdpdmVuIHBvaW50ZXIgY2FuY2VsLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBwb2ludCBjaGFuZ2VkXG4gICAqL1xuICBwdWJsaWMgY2FuY2VsKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcblxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XG5cbiAgICByZXR1cm4gdGhpcy51cGRhdGVQb2ludCggcG9pbnQsICdjYW5jZWwnICk7XG4gIH1cblxuICAvKipcbiAgICogTWFya3MgdGhlIHBvaW50ZXIgYXMgZGV0YWNoZWQgZnJvbSBhIHByZXZpb3VzbHkgYXR0YWNoZWQgbGlzdGVuZXIuXG4gICAqL1xuICBwcml2YXRlIGRldGFjaCggbGlzdGVuZXI6IFRBdHRhY2hhYmxlSW5wdXRMaXN0ZW5lciApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUG9pbnRlciAmJiBzY2VuZXJ5TG9nLlBvaW50ZXIoIGBEZXRhY2hpbmcgZnJvbSAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQXR0YWNoZWQoKSwgJ0Nhbm5vdCBkZXRhY2ggYSBsaXN0ZW5lciBpZiBvbmUgaXMgbm90IGF0dGFjaGVkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgPT09IGxpc3RlbmVyLCAnQ2Fubm90IGRldGFjaCBhIGRpZmZlcmVudCBsaXN0ZW5lcicgKTtcblxuICAgIHRoaXMuYXR0YWNoZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgcG9pbnQgb2YgdGhlIHBvaW50ZXIgaGFzIGNoYW5nZWQgKHVzZWQgaW4gbW91c2UvdG91Y2gvcGVuKS5cbiAgICovXG4gIHByb3RlY3RlZCBoYXNQb2ludENoYW5nZWQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBvaW50ICE9PSBwb2ludCAmJiAoICFwb2ludCB8fCAhdGhpcy5wb2ludCB8fCAhdGhpcy5wb2ludC5lcXVhbHMoIHBvaW50ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIEludGVudCBQb2ludGVyLiBCeSBzZXR0aW5nIEludGVudCwgb3RoZXIgbGlzdGVuZXJzIGluIHRoZSBkaXNwYXRjaCBwaGFzZSBjYW4gcmVhY3QgYWNjb3JkaW5nbHkuXG4gICAqIE5vdGUgdGhhdCB0aGUgSW50ZW50IGNhbiBiZSBjaGFuZ2VkIGJ5IGxpc3RlbmVycyB1cCB0aGUgZGlzcGF0Y2ggcGhhc2Ugb3Igb24gdGhlIG5leHQgcHJlc3MuIFNlZSBJbnRlbnQgZW51bVxuICAgKiBmb3IgdmFsaWQgZW50cmllcy5cbiAgICovXG4gIHB1YmxpYyBhZGRJbnRlbnQoIGludGVudDogSW50ZW50ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEludGVudC5lbnVtZXJhdGlvbi5pbmNsdWRlcyggaW50ZW50ICksICd0cnlpbmcgdG8gc2V0IHVuc3VwcG9ydGVkIGludGVudCBmb3IgUG9pbnRlcicgKTtcblxuICAgIGlmICggIXRoaXMuX2ludGVudHMuaW5jbHVkZXMoIGludGVudCApICkge1xuICAgICAgdGhpcy5faW50ZW50cy5wdXNoKCBpbnRlbnQgKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbnRlbnRzLmxlbmd0aCA8PSBJbnRlbnQuZW51bWVyYXRpb24udmFsdWVzLmxlbmd0aCwgJ3RvIG1hbnkgSW50ZW50cyBzYXZlZCwgbWVtb3J5IGxlYWsgbGlrZWx5JyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBJbnRlbnQgZnJvbSB0aGUgUG9pbnRlci4gU2VlIGFkZEludGVudCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVJbnRlbnQoIGludGVudDogSW50ZW50ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEludGVudC5lbnVtZXJhdGlvbi5pbmNsdWRlcyggaW50ZW50ICksICd0cnlpbmcgdG8gc2V0IHVuc3VwcG9ydGVkIGludGVudCBmb3IgUG9pbnRlcicgKTtcblxuICAgIGlmICggdGhpcy5faW50ZW50cy5pbmNsdWRlcyggaW50ZW50ICkgKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2ludGVudHMuaW5kZXhPZiggaW50ZW50ICk7XG4gICAgICB0aGlzLl9pbnRlbnRzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGlzIFBvaW50ZXIgaGFzIGJlZW4gYXNzaWduZWQgdGhlIHByb3ZpZGVkIEludGVudC5cbiAgICovXG4gIHB1YmxpYyBoYXNJbnRlbnQoIGludGVudDogSW50ZW50ICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pbnRlbnRzLmluY2x1ZGVzKCBpbnRlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGludGVudCBvZiB0aGlzIFBvaW50ZXIgdG8gaW5kaWNhdGUgdGhhdCBpdCB3aWxsIGJlIHVzZWQgZm9yIG1vdXNlL3RvdWNoIHN0eWxlIGRyYWdnaW5nLCBpbmRpY2F0aW5nIHRvXG4gICAqIG90aGVyIGxpc3RlbmVycyBpbiB0aGUgZGlzcGF0Y2ggcGhhc2UgdGhhdCBiZWhhdmlvciBtYXkgbmVlZCB0byBjaGFuZ2UuIEFkZHMgYSBsaXN0ZW5lciB0byB0aGUgcG9pbnRlciAod2l0aFxuICAgKiBzZWxmIHJlbW92YWwpIHRoYXQgY2xlYXJzIHRoZSBpbnRlbnQgd2hlbiB0aGUgcG9pbnRlciByZWNlaXZlcyBhbiBcInVwXCIgZXZlbnQuIFNob3VsZCBnZW5lcmFsbHkgYmUgY2FsbGVkIG9uXG4gICAqIHRoZSBQb2ludGVyIGluIHJlc3BvbnNlIHRvIGEgZG93biBldmVudC5cbiAgICovXG4gIHB1YmxpYyByZXNlcnZlRm9yRHJhZygpOiB2b2lkIHtcblxuICAgIC8vIGlmIHRoZSBQb2ludGVyIGhhc24ndCBhbHJlYWR5IGJlZW4gcmVzZXJ2ZWQgZm9yIGRyYWcgaW4gSW5wdXQgZXZlbnQgZGlzcGF0Y2gsIGluIHdoaWNoXG4gICAgLy8gY2FzZSBpdCBhbHJlYWR5IGhhcyBJbnRlbnQgYW5kIGxpc3RlbmVyIHRvIHJlbW92ZSBJbnRlbnRcbiAgICBpZiAoICF0aGlzLl9pbnRlbnRzLmluY2x1ZGVzKCBJbnRlbnQuRFJBRyApICkge1xuICAgICAgdGhpcy5hZGRJbnRlbnQoIEludGVudC5EUkFHICk7XG5cbiAgICAgIGNvbnN0IGxpc3RlbmVyID0ge1xuICAgICAgICB1cDogKCBldmVudDogU2NlbmVyeUV2ZW50PFRvdWNoRXZlbnQgfCBNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50PiApID0+IHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUludGVudCggSW50ZW50LkRSQUcgKTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2xpc3RlbmVyRm9yRHJhZ1Jlc2VydmUhICk7XG4gICAgICAgICAgdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xpc3RlbmVyRm9yRHJhZ1Jlc2VydmUgPT09IG51bGwsICdzdGlsbCBhIGxpc3RlbmVyIHRvIHJlc2VydmUgcG9pbnRlciwgbWVtb3J5IGxlYWsgbGlrZWx5JyApO1xuICAgICAgdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSA9IGxpc3RlbmVyO1xuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW50ZW50IG9mIHRoaXMgUG9pbnRlciB0byBpbmRpY2F0ZSB0aGF0IGl0IHdpbGwgYmUgdXNlZCBmb3Iga2V5Ym9hcmQgc3R5bGUgZHJhZ2dpbmcsIGluZGljYXRpbmcgdG9cbiAgICogb3RoZXIgbGlzdGVuZXJzIGluIHRoZSBkaXNwYXRjaCB0aGF0IGJlaGF2aW9yIG1heSBuZWVkIHRvIGNoYW5nZS4gQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBwb2ludGVyICh3aXRoIHNlbGZcbiAgICogcmVtb3ZhbCkgdGhhdCBjbGVhcnMgdGhlIGludGVudCB3aGVuIHRoZSBwb2ludGVyIHJlY2VpdmVzIGEgXCJrZXl1cFwiIG9yIFwiYmx1clwiIGV2ZW50LiBTaG91bGQgZ2VuZXJhbGx5IGJlIGNhbGxlZFxuICAgKiBvbiB0aGUgUG9pbnRlciBpbiByZXNwb25zZSB0byBhIGtleWRvd24gZXZlbnQuXG4gICAqL1xuICBwdWJsaWMgcmVzZXJ2ZUZvcktleWJvYXJkRHJhZygpOiB2b2lkIHtcblxuICAgIGlmICggIXRoaXMuX2ludGVudHMuaW5jbHVkZXMoIEludGVudC5LRVlCT0FSRF9EUkFHICkgKSB7XG4gICAgICB0aGlzLmFkZEludGVudCggSW50ZW50LktFWUJPQVJEX0RSQUcgKTtcblxuICAgICAgY29uc3QgbGlzdGVuZXIgPSB7XG4gICAgICAgIGtleXVwOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gKSA9PiBjbGVhckludGVudCgpLFxuXG4gICAgICAgIC8vIGNsZWFyIG9uIGJsdXIgYXMgd2VsbCBzaW5jZSBmb2N1cyBtYXkgYmUgbG9zdCBiZWZvcmUgd2UgcmVjZWl2ZSBhIGtleXVwIGV2ZW50XG4gICAgICAgIGJsdXI6ICggZXZlbnQ6IFNjZW5lcnlFdmVudDxGb2N1c0V2ZW50PiApID0+IGNsZWFySW50ZW50KClcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGNsZWFySW50ZW50ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnJlbW92ZUludGVudCggSW50ZW50LktFWUJPQVJEX0RSQUcgKTtcbiAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmUhICk7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVyRm9yS2V5Ym9hcmREcmFnUmVzZXJ2ZSA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlID09PSBudWxsLCAnc3RpbGwgYSBsaXN0ZW5lciBvbiBQb2ludGVyIGZvciByZXNlcnZlLCBtZW1vcnkgbGVhayBsaWtlbHknICk7XG4gICAgICB0aGlzLl9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmUgPSBsaXN0ZW5lcjtcbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBjYXB0dXJlIHN0YXJ0cyBvbiB0aGlzIHBvaW50ZXIuIFdlIHJlcXVlc3QgaXQgb24gcG9pbnRlcnN0YXJ0LCBhbmQgaWYgcmVjZWl2ZWQsIHdlIHNob3VsZFxuICAgKiBnZW5lcmFsbHkgcmVjZWl2ZSBldmVudHMgb3V0c2lkZSB0aGUgd2luZG93LlxuICAgKi9cbiAgcHVibGljIG9uR290UG9pbnRlckNhcHR1cmUoKTogdm9pZCB7XG4gICAgdGhpcy5fcG9pbnRlckNhcHR1cmVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGNhbGxlZCB3aGVuIGEgY2FwdHVyZSBlbmRzIG9uIHRoaXMgcG9pbnRlci4gVGhpcyBoYXBwZW5zIG5vcm1hbGx5IHdoZW4gdGhlIHVzZXIgcmVsZWFzZXMgdGhlIHBvaW50ZXIgYWJvdmVcbiAgICogdGhlIHNpbSBvciBvdXRzaWRlLCBidXQgYWxzbyBpbiBjYXNlcyB3aGVyZSB3ZSBoYXZlIE5PVCByZWNlaXZlZCBhbiB1cC9lbmQuXG4gICAqXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTE4NiBmb3IgbW9yZSBpbmZvcm1hdGlvbi4gV2UnbGwgd2FudCB0byBpbnRlcnJ1cHQgdGhlIHBvaW50ZXJcbiAgICogb24gdGhpcyBjYXNlIHJlZ2FyZGxlc3MsXG4gICAqL1xuICBwdWJsaWMgb25Mb3N0UG9pbnRlckNhcHR1cmUoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9wb2ludGVyQ2FwdHVyZWQgKSB7XG4gICAgICB0aGlzLmludGVycnVwdEFsbCgpO1xuICAgIH1cbiAgICB0aGlzLl9wb2ludGVyQ2FwdHVyZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzIHNvIGl0IGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5Qb2ludGVyICYmIHNjZW5lcnlMb2cuUG9pbnRlciggYERpc3Bvc2luZyAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJzIHRoYXQgd291bGQgY2xlYXIgaW50ZW50IG9uIGRpc3Bvc2FsXG4gICAgaWYgKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlICYmIHRoaXMuX2xpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSApICkge1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9saXN0ZW5lckZvckRyYWdSZXNlcnZlICk7XG4gICAgfVxuICAgIGlmICggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICYmIHRoaXMuX2xpc3RlbmVycy5pbmNsdWRlcyggdGhpcy5fbGlzdGVuZXJGb3JLZXlib2FyZERyYWdSZXNlcnZlICkgKSB7XG4gICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMuX2xpc3RlbmVyRm9yS2V5Ym9hcmREcmFnUmVzZXJ2ZSApO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2F0dGFjaGVkTGlzdGVuZXIgPT09IG51bGwsICdBdHRhY2hlZCBsaXN0ZW5lcnMgc2hvdWxkIGJlIGNsZWFyZWQgYmVmb3JlIHBvaW50ZXIgZGlzcG9zYWwnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbGlzdGVuZXJzLmxlbmd0aCA9PT0gMCwgJ1Nob3VsZCBub3QgaGF2ZSBsaXN0ZW5lcnMgd2hlbiBhIHBvaW50ZXIgaXMgZGlzcG9zZWQnICk7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFBvaW50ZXIjJHt0aGlzLnR5cGV9X2F0XyR7dGhpcy5wb2ludH1gO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdQb2ludGVyJywgUG9pbnRlciApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwiSU9UeXBlIiwiU3RyaW5nSU8iLCJzY2VuZXJ5IiwiSW50ZW50IiwiRFJBRyIsIktFWUJPQVJEX0RSQUciLCJlbnVtZXJhdGlvbiIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJQb2ludGVyIiwic2V0Q3Vyc29yIiwiY3Vyc29yIiwiX2N1cnNvciIsInZhbHVlIiwiZ2V0Q3Vyc29yIiwiZ2V0TGlzdGVuZXJzIiwiX2xpc3RlbmVycyIsInNsaWNlIiwibGlzdGVuZXJzIiwiYWRkSW5wdXRMaXN0ZW5lciIsImxpc3RlbmVyIiwiYXR0YWNoIiwic2NlbmVyeUxvZyIsInRvU3RyaW5nIiwicHVzaCIsImFzc2VydCIsInVuZGVmaW5lZCIsIl8iLCJpbmNsdWRlcyIsImludGVycnVwdCIsInBvcCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJpbmRleCIsImluZGV4T2YiLCJpc0F0dGFjaGVkIiwiX2F0dGFjaGVkTGlzdGVuZXIiLCJkZXRhY2giLCJzcGxpY2UiLCJnZXRBdHRhY2hlZExpc3RlbmVyIiwiYXR0YWNoZWRMaXN0ZW5lciIsImF0dGFjaGVkUHJvcGVydHkiLCJpc1RvdWNoTGlrZSIsImlzRG93biIsImlzRG93blByb3BlcnR5IiwiaW50ZXJydXB0QXR0YWNoZWQiLCJpbnRlcnJ1cHRBbGwiLCJpIiwibGVuZ3RoIiwidXBkYXRlUG9pbnQiLCJwb2ludCIsImV2ZW50TmFtZSIsInBvaW50Q2hhbmdlZCIsImhhc1BvaW50Q2hhbmdlZCIsIklucHV0RXZlbnQiLCJkb3duIiwiZXZlbnQiLCJ1cCIsImNhbmNlbCIsImVxdWFscyIsImFkZEludGVudCIsImludGVudCIsIl9pbnRlbnRzIiwidmFsdWVzIiwicmVtb3ZlSW50ZW50IiwiaGFzSW50ZW50IiwicmVzZXJ2ZUZvckRyYWciLCJfbGlzdGVuZXJGb3JEcmFnUmVzZXJ2ZSIsInJlc2VydmVGb3JLZXlib2FyZERyYWciLCJrZXl1cCIsImNsZWFySW50ZW50IiwiYmx1ciIsIl9saXN0ZW5lckZvcktleWJvYXJkRHJhZ1Jlc2VydmUiLCJvbkdvdFBvaW50ZXJDYXB0dXJlIiwiX3BvaW50ZXJDYXB0dXJlZCIsIm9uTG9zdFBvaW50ZXJDYXB0dXJlIiwiZGlzcG9zZSIsInR5cGUiLCJpbml0aWFsUG9pbnQiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsInRyYWlsIiwiaW5wdXRFbmFibGVkVHJhaWwiLCJsYXN0RXZlbnRDb250ZXh0IiwiUG9pbnRlcklPIiwidmFsdWVUeXBlIiwidG9TdGF0ZU9iamVjdCIsInBvaW50ZXIiLCJzdGF0ZVNjaGVtYSIsIlZlY3RvcjJJTyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBb0JDLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUVsRSxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLHNCQUFzQiw0Q0FBNEM7QUFDekUsT0FBT0MsWUFBWSxxQ0FBcUM7QUFDeEQsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsU0FBdUJDLE9BQU8sUUFBNkMsZ0JBQWdCO0FBRzNGLE9BQU8sTUFBTUMsZUFBZUo7QUFVNUI7QUFURSw2REFBNkQ7QUFEbERJLE9BRVlDLE9BQU8sSUFBSUQ7QUFFbEMsK0RBQStEO0FBSnBEQSxPQUtZRSxnQkFBZ0IsSUFBSUY7QUFMaENBLE9BT1lHLGNBQWMsSUFBSVIsWUFBYUssUUFBUTtJQUM1REkscUJBQXFCO0FBQ3ZCO0FBU2EsSUFBQSxBQUFlQyxVQUFmLE1BQWVBO0lBNkY1Qjs7Ozs7Ozs7R0FRQyxHQUNELEFBQU9DLFVBQVdDLE1BQXFCLEVBQVM7UUFDOUMsSUFBSSxDQUFDQyxPQUFPLEdBQUdEO1FBRWYsT0FBTyxJQUFJO0lBQ2I7SUFFQSxJQUFX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