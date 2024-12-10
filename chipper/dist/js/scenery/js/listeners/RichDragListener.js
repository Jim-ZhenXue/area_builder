// Copyright 2024, University of Colorado Boulder
/**
 * A drag listener that supports both pointer and keyboard input. It is composed with a DragListener and a
 * KeyboardDragListener to support pointer input and alternative input. In the future it can support other
 * input modalities or PhET-specific features.
 *
 * Be sure to dispose of this listener when it is no longer needed.
 *
 * Options that are common to both listeners are provided directly to this listener. Options that are specific to
 * a particular listener can be provided through the dragListenerOptions or keyboardDragListenerOptions.
 *
 * Typical PhET usage will use a position Property in a model coordinate frame and look like this:
 *
 *     // A focusable Node that can be dragged with pointer or keyboard.
 *     const draggableNode = new Node( {
 *       tagName: 'div',
 *       focusable: true
 *     } );
 *
 *     const richDragListener = new RichDragListener( {
 *       positionProperty: someObject.positionProperty,
 *       transform: modelViewTransform
 *     } );
 *
 *     draggableNode.addInputListener( richDragListener );
 *
 * This listener works by implementing TInputListener and forwarding input events to the specific listeners. This is
 * how we support adding this listener through the scenery input listener API.
 *
 * @author Jesse Greenberg
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { DragListener, KeyboardDragListener, scenery } from '../imports.js';
let RichDragListener = class RichDragListener {
    get isPressed() {
        return this.dragListener.isPressed || this.keyboardDragListener.isPressed;
    }
    dispose() {
        this.isPressedProperty.dispose();
        this.dragListener.dispose();
        this.keyboardDragListener.dispose();
    }
    /**
   * ********************************************************************
   * Forward input to both listeners
   * ********************************************************************
   */ interrupt() {
        this.dragListener.interrupt();
        this.keyboardDragListener.interrupt();
    }
    /**
   * ********************************************************************
   * Forward to the KeyboardListener
   * ********************************************************************
   */ keydown(event) {
        this.keyboardDragListener.keydown(event);
    }
    focusout(event) {
        this.keyboardDragListener.focusout(event);
    }
    focusin(event) {
        this.keyboardDragListener.focusin(event);
    }
    cancel() {
        this.keyboardDragListener.cancel();
    }
    /**
   * ********************************************************************
   * Forward to the DragListener
   * ********************************************************************
   */ click(event) {
        this.dragListener.click(event);
    }
    touchenter(event) {
        this.dragListener.touchenter(event);
    }
    touchmove(event) {
        this.dragListener.touchmove(event);
    }
    focus(event) {
        this.dragListener.focus(event);
    }
    blur() {
        this.dragListener.blur();
    }
    down(event) {
        this.dragListener.down(event);
    }
    up(event) {
        this.dragListener.up(event);
    }
    enter(event) {
        this.dragListener.enter(event);
    }
    move(event) {
        this.dragListener.move(event);
    }
    exit(event) {
        this.dragListener.exit(event);
    }
    pointerUp(event) {
        this.dragListener.pointerUp(event);
    }
    pointerCancel(event) {
        this.dragListener.pointerCancel(event);
    }
    pointerMove(event) {
        this.dragListener.pointerMove(event);
    }
    pointerInterrupt() {
        this.dragListener.pointerInterrupt();
    }
    constructor(providedOptions){
        const options = optionize()({
            // RichDragListenerOptions
            positionProperty: null,
            // Called when the drag is started, for any input type. If you want to determine the type of input, you can check
            // SceneryEvent.isFromPDOM or SceneryEvent.type. If you need a start behavior for a specific form of input,
            // provide a start callback for that listener's options. It will be called IN ADDITION to this callback.
            start: null,
            // Called when the drag is ended, for any input type. If you want to determine the type of input, you can check
            // SceneryEvent.isFromPDOM or SceneryEvent.type. If you need an end behavior for a specific form of input,
            // provide an end callback for that listener's options. It will be called IN ADDITION to this callback. The event
            // may be null for cases of interruption.
            end: null,
            // Called during the drag event, for any input type. If you want to determine the type of input, you can check
            // SceneryEvent.isFromPDOM or SceneryEvent.type. If you need a drag behavior for a specific form of input,
            // provide a drag callback for that listener's options. It will be called IN ADDITION to this callback.
            drag: null,
            transform: null,
            dragBoundsProperty: null,
            mapPosition: null,
            translateNode: false,
            dragListenerOptions: {},
            keyboardDragListenerOptions: {}
        }, providedOptions);
        // Options that will apply to both listeners.
        const sharedOptions = {
            positionProperty: options.positionProperty,
            transform: options.transform,
            dragBoundsProperty: options.dragBoundsProperty || undefined,
            mapPosition: options.mapPosition || undefined,
            translateNode: options.translateNode
        };
        //---------------------------------------------------------------------------------
        // Construct the DragListener and combine its options.
        //---------------------------------------------------------------------------------
        const wrappedDragListenerStart = (event, listener)=>{
            // when the drag listener starts, interrupt the keyboard dragging
            this.keyboardDragListener.interrupt();
            options.start && options.start(event, listener);
            options.dragListenerOptions.start && options.dragListenerOptions.start(event, listener);
        };
        const wrappedDragListenerDrag = (event, listener)=>{
            options.drag && options.drag(event, listener);
            options.dragListenerOptions.drag && options.dragListenerOptions.drag(event, listener);
        };
        const wrappedDragListenerEnd = (event, listener)=>{
            options.end && options.end(event, listener);
            options.dragListenerOptions.end && options.dragListenerOptions.end(event, listener);
        };
        const dragListenerOptions = combineOptions(// target object
        {}, // Options that apply to both, but can be overridden by provided listener-specific options
        sharedOptions, // Provided listener-specific options
        options.dragListenerOptions, // Options that cannot be overridden - see wrapped callbacks above
        {
            start: wrappedDragListenerStart,
            drag: wrappedDragListenerDrag,
            end: wrappedDragListenerEnd
        });
        this.dragListener = new DragListener(dragListenerOptions);
        //---------------------------------------------------------------------------------
        // Construct the KeyboardDragListener and combine its options.
        //---------------------------------------------------------------------------------
        const wrappedKeyboardListenerStart = (event, listener)=>{
            // when the drag listener starts, interrupt the pointer dragging
            this.dragListener.interrupt();
            options.start && options.start(event, listener);
            options.keyboardDragListenerOptions.start && options.keyboardDragListenerOptions.start(event, listener);
        };
        const wrappedKeyboardListenerDrag = (event, listener)=>{
            options.drag && options.drag(event, listener);
            options.keyboardDragListenerOptions.drag && options.keyboardDragListenerOptions.drag(event, listener);
        };
        const wrappedKeyboardListenerEnd = (event, listener)=>{
            options.end && options.end(event, listener);
            options.keyboardDragListenerOptions.end && options.keyboardDragListenerOptions.end(event, listener);
        };
        const keyboardDragListenerOptions = combineOptions(// target object
        {}, // Options that apply to both, but can be overridden by provided listener-specific options
        sharedOptions, // Provided listener-specific options
        options.keyboardDragListenerOptions, // Options that cannot be overridden - see wrapped callbacks above
        {
            start: wrappedKeyboardListenerStart,
            drag: wrappedKeyboardListenerDrag,
            end: wrappedKeyboardListenerEnd
        });
        this.keyboardDragListener = new KeyboardDragListener(keyboardDragListenerOptions);
        // The hotkeys from the keyboard listener are assigned to this listener so that they are activated for Nodes
        // where this listener is added.
        this.hotkeys = this.keyboardDragListener.hotkeys;
        this.isPressedProperty = DerivedProperty.or([
            this.dragListener.isPressedProperty,
            this.keyboardDragListener.isPressedProperty
        ]);
    }
};
export { RichDragListener as default };
scenery.register('RichDragListener', RichDragListener);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL1JpY2hEcmFnTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgZHJhZyBsaXN0ZW5lciB0aGF0IHN1cHBvcnRzIGJvdGggcG9pbnRlciBhbmQga2V5Ym9hcmQgaW5wdXQuIEl0IGlzIGNvbXBvc2VkIHdpdGggYSBEcmFnTGlzdGVuZXIgYW5kIGFcbiAqIEtleWJvYXJkRHJhZ0xpc3RlbmVyIHRvIHN1cHBvcnQgcG9pbnRlciBpbnB1dCBhbmQgYWx0ZXJuYXRpdmUgaW5wdXQuIEluIHRoZSBmdXR1cmUgaXQgY2FuIHN1cHBvcnQgb3RoZXJcbiAqIGlucHV0IG1vZGFsaXRpZXMgb3IgUGhFVC1zcGVjaWZpYyBmZWF0dXJlcy5cbiAqXG4gKiBCZSBzdXJlIHRvIGRpc3Bvc2Ugb2YgdGhpcyBsaXN0ZW5lciB3aGVuIGl0IGlzIG5vIGxvbmdlciBuZWVkZWQuXG4gKlxuICogT3B0aW9ucyB0aGF0IGFyZSBjb21tb24gdG8gYm90aCBsaXN0ZW5lcnMgYXJlIHByb3ZpZGVkIGRpcmVjdGx5IHRvIHRoaXMgbGlzdGVuZXIuIE9wdGlvbnMgdGhhdCBhcmUgc3BlY2lmaWMgdG9cbiAqIGEgcGFydGljdWxhciBsaXN0ZW5lciBjYW4gYmUgcHJvdmlkZWQgdGhyb3VnaCB0aGUgZHJhZ0xpc3RlbmVyT3B0aW9ucyBvciBrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMuXG4gKlxuICogVHlwaWNhbCBQaEVUIHVzYWdlIHdpbGwgdXNlIGEgcG9zaXRpb24gUHJvcGVydHkgaW4gYSBtb2RlbCBjb29yZGluYXRlIGZyYW1lIGFuZCBsb29rIGxpa2UgdGhpczpcbiAqXG4gKiAgICAgLy8gQSBmb2N1c2FibGUgTm9kZSB0aGF0IGNhbiBiZSBkcmFnZ2VkIHdpdGggcG9pbnRlciBvciBrZXlib2FyZC5cbiAqICAgICBjb25zdCBkcmFnZ2FibGVOb2RlID0gbmV3IE5vZGUoIHtcbiAqICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICogICAgICAgZm9jdXNhYmxlOiB0cnVlXG4gKiAgICAgfSApO1xuICpcbiAqICAgICBjb25zdCByaWNoRHJhZ0xpc3RlbmVyID0gbmV3IFJpY2hEcmFnTGlzdGVuZXIoIHtcbiAqICAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHNvbWVPYmplY3QucG9zaXRpb25Qcm9wZXJ0eSxcbiAqICAgICAgIHRyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtXG4gKiAgICAgfSApO1xuICpcbiAqICAgICBkcmFnZ2FibGVOb2RlLmFkZElucHV0TGlzdGVuZXIoIHJpY2hEcmFnTGlzdGVuZXIgKTtcbiAqXG4gKiBUaGlzIGxpc3RlbmVyIHdvcmtzIGJ5IGltcGxlbWVudGluZyBUSW5wdXRMaXN0ZW5lciBhbmQgZm9yd2FyZGluZyBpbnB1dCBldmVudHMgdG8gdGhlIHNwZWNpZmljIGxpc3RlbmVycy4gVGhpcyBpc1xuICogaG93IHdlIHN1cHBvcnQgYWRkaW5nIHRoaXMgbGlzdGVuZXIgdGhyb3VnaCB0aGUgc2NlbmVyeSBpbnB1dCBsaXN0ZW5lciBBUEkuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEFsbERyYWdMaXN0ZW5lck9wdGlvbnMsIERyYWdMaXN0ZW5lciwgRHJhZ0xpc3RlbmVyT3B0aW9ucywgSG90a2V5LCBLZXlib2FyZERyYWdMaXN0ZW5lciwgS2V5Ym9hcmREcmFnTGlzdGVuZXJDYWxsYmFjaywgS2V5Ym9hcmREcmFnTGlzdGVuZXJOdWxsYWJsZUNhbGxiYWNrLCBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMsIFByZXNzZWREcmFnTGlzdGVuZXIsIFByZXNzTGlzdGVuZXJDYWxsYmFjaywgUHJlc3NMaXN0ZW5lckRPTUV2ZW50LCBQcmVzc0xpc3RlbmVyRXZlbnQsIFByZXNzTGlzdGVuZXJOdWxsYWJsZUNhbGxiYWNrLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRJbnB1dExpc3RlbmVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBLZXlib2FyZERyYWdMaXN0ZW5lckRPTUV2ZW50IH0gZnJvbSAnLi9LZXlib2FyZERyYWdMaXN0ZW5lci5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBBbGxEcmFnTGlzdGVuZXJPcHRpb25zPERyYWdMaXN0ZW5lciB8IEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRE9NRXZlbnQgfCBLZXlib2FyZERyYWdMaXN0ZW5lckRPTUV2ZW50PiAmIHtcblxuICAvLyBBZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoZSBEcmFnTGlzdGVuZXIsIE9SIGFueSBvdmVycmlkZXMgZm9yIHRoZSBEcmFnTGlzdGVuZXIgdGhhdCBzaG91bGRcbiAgLy8gYmUgdXNlZCBpbnN0ZWFkIG9mIEFsbERyYWdMaXN0ZW5lck9wdGlvbnMuIEZvciBleGFtcGxlLCBpZiB0aGUgRHJhZ0xpc3RlbmVyIHNob3VsZCBoYXZlIGRpZmZlcmVudFxuICAvLyBtYXBQb3NpdGlvbiwgeW91IGNhbiBwcm92aWRlIHRoYXQgb3B0aW9uIGhlcmUuXG4gIGRyYWdMaXN0ZW5lck9wdGlvbnM/OiBEcmFnTGlzdGVuZXJPcHRpb25zO1xuXG4gIC8vIEFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhlIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBPUiBhbnkgb3ZlcnJpZGVzIGZvciB0aGUgS2V5Ym9hcmREcmFnTGlzdGVuZXIgdGhhdCBzaG91bGRcbiAgLy8gYmUgdXNlZCBpbnN0ZWFkIG9mIEFsbERyYWdMaXN0ZW5lck9wdGlvbnMuIEZvciBleGFtcGxlLCBpZiB0aGUgS2V5Ym9hcmREcmFnTGlzdGVuZXIgc2hvdWxkIGhhdmUgZGlmZmVyZW50XG4gIC8vIG1hcFBvc2l0aW9uLCB5b3UgY2FuIHByb3ZpZGUgdGhhdCBvcHRpb24gaGVyZS5cbiAga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zPzogS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zO1xufTtcblxuZXhwb3J0IHR5cGUgUmljaERyYWdMaXN0ZW5lck9wdGlvbnMgPSBTZWxmT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmljaERyYWdMaXN0ZW5lciBpbXBsZW1lbnRzIFRJbnB1dExpc3RlbmVyIHtcblxuICAvLyBUaGUgRHJhZ0xpc3RlbmVyIGFuZCBLZXlib2FyZERyYWdMaXN0ZW5lciB0aGF0IGFyZSBjb21wb3NlZCB0byBjcmVhdGUgdGhpcyBsaXN0ZW5lci4gUHVibGljIHNvIHRoYXQgeW91IGNhblxuICAvLyBhZGQgdGhlbSB0byBkaWZmZXJlbnQgTm9kZXMgaWYgeW91IG5lZWQgdG8sIGZvciBjYXNlcyB3aGVyZSB5b3UgbmVlZCB0byBhY2Nlc3MgdGhlaXIgcHJvcGVydGllcyBkaXJlY3RseSxcbiAgLy8gb3IgaWYgeW91IG9ubHkgbmVlZCBvbmUgb2YgdGhlIGxpc3RlbmVycy5cbiAgcHVibGljIHJlYWRvbmx5IGRyYWdMaXN0ZW5lcjogRHJhZ0xpc3RlbmVyO1xuICBwdWJsaWMgcmVhZG9ubHkga2V5Ym9hcmREcmFnTGlzdGVuZXI6IEtleWJvYXJkRHJhZ0xpc3RlbmVyO1xuXG4gIC8vIFRydWUgaWYgdGhlIGxpc3RlbmVyIGlzIGN1cnJlbnRseSBwcmVzc2VkIChEcmFnTGlzdGVuZXIgT1IgS2V5Ym9hcmREcmFnTGlzdGVuZXIpLlxuICBwdWJsaWMgcmVhZG9ubHkgaXNQcmVzc2VkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIEltcGxlbWVudHMgVElucHV0TGlzdGVuZXJcbiAgcHVibGljIHJlYWRvbmx5IGhvdGtleXM6IEhvdGtleVtdO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUmljaERyYWdMaXN0ZW5lck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJpY2hEcmFnTGlzdGVuZXJPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFJpY2hEcmFnTGlzdGVuZXJPcHRpb25zXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBudWxsLFxuXG4gICAgICAvLyBDYWxsZWQgd2hlbiB0aGUgZHJhZyBpcyBzdGFydGVkLCBmb3IgYW55IGlucHV0IHR5cGUuIElmIHlvdSB3YW50IHRvIGRldGVybWluZSB0aGUgdHlwZSBvZiBpbnB1dCwgeW91IGNhbiBjaGVja1xuICAgICAgLy8gU2NlbmVyeUV2ZW50LmlzRnJvbVBET00gb3IgU2NlbmVyeUV2ZW50LnR5cGUuIElmIHlvdSBuZWVkIGEgc3RhcnQgYmVoYXZpb3IgZm9yIGEgc3BlY2lmaWMgZm9ybSBvZiBpbnB1dCxcbiAgICAgIC8vIHByb3ZpZGUgYSBzdGFydCBjYWxsYmFjayBmb3IgdGhhdCBsaXN0ZW5lcidzIG9wdGlvbnMuIEl0IHdpbGwgYmUgY2FsbGVkIElOIEFERElUSU9OIHRvIHRoaXMgY2FsbGJhY2suXG4gICAgICBzdGFydDogbnVsbCxcblxuICAgICAgLy8gQ2FsbGVkIHdoZW4gdGhlIGRyYWcgaXMgZW5kZWQsIGZvciBhbnkgaW5wdXQgdHlwZS4gSWYgeW91IHdhbnQgdG8gZGV0ZXJtaW5lIHRoZSB0eXBlIG9mIGlucHV0LCB5b3UgY2FuIGNoZWNrXG4gICAgICAvLyBTY2VuZXJ5RXZlbnQuaXNGcm9tUERPTSBvciBTY2VuZXJ5RXZlbnQudHlwZS4gSWYgeW91IG5lZWQgYW4gZW5kIGJlaGF2aW9yIGZvciBhIHNwZWNpZmljIGZvcm0gb2YgaW5wdXQsXG4gICAgICAvLyBwcm92aWRlIGFuIGVuZCBjYWxsYmFjayBmb3IgdGhhdCBsaXN0ZW5lcidzIG9wdGlvbnMuIEl0IHdpbGwgYmUgY2FsbGVkIElOIEFERElUSU9OIHRvIHRoaXMgY2FsbGJhY2suIFRoZSBldmVudFxuICAgICAgLy8gbWF5IGJlIG51bGwgZm9yIGNhc2VzIG9mIGludGVycnVwdGlvbi5cbiAgICAgIGVuZDogbnVsbCxcblxuICAgICAgLy8gQ2FsbGVkIGR1cmluZyB0aGUgZHJhZyBldmVudCwgZm9yIGFueSBpbnB1dCB0eXBlLiBJZiB5b3Ugd2FudCB0byBkZXRlcm1pbmUgdGhlIHR5cGUgb2YgaW5wdXQsIHlvdSBjYW4gY2hlY2tcbiAgICAgIC8vIFNjZW5lcnlFdmVudC5pc0Zyb21QRE9NIG9yIFNjZW5lcnlFdmVudC50eXBlLiBJZiB5b3UgbmVlZCBhIGRyYWcgYmVoYXZpb3IgZm9yIGEgc3BlY2lmaWMgZm9ybSBvZiBpbnB1dCxcbiAgICAgIC8vIHByb3ZpZGUgYSBkcmFnIGNhbGxiYWNrIGZvciB0aGF0IGxpc3RlbmVyJ3Mgb3B0aW9ucy4gSXQgd2lsbCBiZSBjYWxsZWQgSU4gQURESVRJT04gdG8gdGhpcyBjYWxsYmFjay5cbiAgICAgIGRyYWc6IG51bGwsXG4gICAgICB0cmFuc2Zvcm06IG51bGwsXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG51bGwsXG4gICAgICBtYXBQb3NpdGlvbjogbnVsbCxcbiAgICAgIHRyYW5zbGF0ZU5vZGU6IGZhbHNlLFxuICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9uczoge30sXG4gICAgICBrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnM6IHt9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBPcHRpb25zIHRoYXQgd2lsbCBhcHBseSB0byBib3RoIGxpc3RlbmVycy5cbiAgICBjb25zdCBzaGFyZWRPcHRpb25zID0ge1xuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogb3B0aW9ucy5wb3NpdGlvblByb3BlcnR5LFxuICAgICAgdHJhbnNmb3JtOiBvcHRpb25zLnRyYW5zZm9ybSxcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHkgfHwgdW5kZWZpbmVkLFxuICAgICAgbWFwUG9zaXRpb246IG9wdGlvbnMubWFwUG9zaXRpb24gfHwgdW5kZWZpbmVkLFxuICAgICAgdHJhbnNsYXRlTm9kZTogb3B0aW9ucy50cmFuc2xhdGVOb2RlXG4gICAgfTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQ29uc3RydWN0IHRoZSBEcmFnTGlzdGVuZXIgYW5kIGNvbWJpbmUgaXRzIG9wdGlvbnMuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBjb25zdCB3cmFwcGVkRHJhZ0xpc3RlbmVyU3RhcnQ6IFByZXNzTGlzdGVuZXJDYWxsYmFjazxQcmVzc2VkRHJhZ0xpc3RlbmVyPiA9ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuXG4gICAgICAvLyB3aGVuIHRoZSBkcmFnIGxpc3RlbmVyIHN0YXJ0cywgaW50ZXJydXB0IHRoZSBrZXlib2FyZCBkcmFnZ2luZ1xuICAgICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcblxuICAgICAgb3B0aW9ucy5zdGFydCAmJiBvcHRpb25zLnN0YXJ0KCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICAgIG9wdGlvbnMuZHJhZ0xpc3RlbmVyT3B0aW9ucy5zdGFydCAmJiBvcHRpb25zLmRyYWdMaXN0ZW5lck9wdGlvbnMuc3RhcnQoIGV2ZW50LCBsaXN0ZW5lciApO1xuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkRHJhZ0xpc3RlbmVyRHJhZzogUHJlc3NMaXN0ZW5lckNhbGxiYWNrPFByZXNzZWREcmFnTGlzdGVuZXI+ID0gKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG4gICAgICBvcHRpb25zLmRyYWcgJiYgb3B0aW9ucy5kcmFnKCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICAgIG9wdGlvbnMuZHJhZ0xpc3RlbmVyT3B0aW9ucy5kcmFnICYmIG9wdGlvbnMuZHJhZ0xpc3RlbmVyT3B0aW9ucy5kcmFnKCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZERyYWdMaXN0ZW5lckVuZDogUHJlc3NMaXN0ZW5lck51bGxhYmxlQ2FsbGJhY2s8UHJlc3NlZERyYWdMaXN0ZW5lcj4gPSAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgICAgIG9wdGlvbnMuZW5kICYmIG9wdGlvbnMuZW5kKCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICAgIG9wdGlvbnMuZHJhZ0xpc3RlbmVyT3B0aW9ucy5lbmQgJiYgb3B0aW9ucy5kcmFnTGlzdGVuZXJPcHRpb25zLmVuZCggZXZlbnQsIGxpc3RlbmVyICk7XG4gICAgfTtcblxuICAgIGNvbnN0IGRyYWdMaXN0ZW5lck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxEcmFnTGlzdGVuZXJPcHRpb25zPFByZXNzZWREcmFnTGlzdGVuZXI+PihcbiAgICAgIC8vIHRhcmdldCBvYmplY3RcbiAgICAgIHt9LFxuICAgICAgLy8gT3B0aW9ucyB0aGF0IGFwcGx5IHRvIGJvdGgsIGJ1dCBjYW4gYmUgb3ZlcnJpZGRlbiBieSBwcm92aWRlZCBsaXN0ZW5lci1zcGVjaWZpYyBvcHRpb25zXG4gICAgICBzaGFyZWRPcHRpb25zLFxuICAgICAgLy8gUHJvdmlkZWQgbGlzdGVuZXItc3BlY2lmaWMgb3B0aW9uc1xuICAgICAgb3B0aW9ucy5kcmFnTGlzdGVuZXJPcHRpb25zLFxuICAgICAgLy8gT3B0aW9ucyB0aGF0IGNhbm5vdCBiZSBvdmVycmlkZGVuIC0gc2VlIHdyYXBwZWQgY2FsbGJhY2tzIGFib3ZlXG4gICAgICB7XG4gICAgICAgIHN0YXJ0OiB3cmFwcGVkRHJhZ0xpc3RlbmVyU3RhcnQsXG4gICAgICAgIGRyYWc6IHdyYXBwZWREcmFnTGlzdGVuZXJEcmFnLFxuICAgICAgICBlbmQ6IHdyYXBwZWREcmFnTGlzdGVuZXJFbmRcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCBkcmFnTGlzdGVuZXJPcHRpb25zICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIENvbnN0cnVjdCB0aGUgS2V5Ym9hcmREcmFnTGlzdGVuZXIgYW5kIGNvbWJpbmUgaXRzIG9wdGlvbnMuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBjb25zdCB3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lclN0YXJ0OiBLZXlib2FyZERyYWdMaXN0ZW5lckNhbGxiYWNrID0gKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG5cbiAgICAgIC8vIHdoZW4gdGhlIGRyYWcgbGlzdGVuZXIgc3RhcnRzLCBpbnRlcnJ1cHQgdGhlIHBvaW50ZXIgZHJhZ2dpbmdcbiAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyLmludGVycnVwdCgpO1xuXG4gICAgICBvcHRpb25zLnN0YXJ0ICYmIG9wdGlvbnMuc3RhcnQoIGV2ZW50LCBsaXN0ZW5lciApO1xuICAgICAgb3B0aW9ucy5rZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMuc3RhcnQgJiYgb3B0aW9ucy5rZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMuc3RhcnQoIGV2ZW50LCBsaXN0ZW5lciApO1xuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lckRyYWc6IEtleWJvYXJkRHJhZ0xpc3RlbmVyQ2FsbGJhY2sgPSAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgICAgIG9wdGlvbnMuZHJhZyAmJiBvcHRpb25zLmRyYWcoIGV2ZW50LCBsaXN0ZW5lciApO1xuICAgICAgb3B0aW9ucy5rZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMuZHJhZyAmJiBvcHRpb25zLmtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucy5kcmFnKCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd3JhcHBlZEtleWJvYXJkTGlzdGVuZXJFbmQ6IEtleWJvYXJkRHJhZ0xpc3RlbmVyTnVsbGFibGVDYWxsYmFjayA9ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgb3B0aW9ucy5lbmQgJiYgb3B0aW9ucy5lbmQoIGV2ZW50LCBsaXN0ZW5lciApO1xuICAgICAgb3B0aW9ucy5rZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMuZW5kICYmIG9wdGlvbnMua2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zLmVuZCggZXZlbnQsIGxpc3RlbmVyICk7XG4gICAgfTtcblxuICAgIGNvbnN0IGtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz4oXG4gICAgICAvLyB0YXJnZXQgb2JqZWN0XG4gICAgICB7fSxcbiAgICAgIC8vIE9wdGlvbnMgdGhhdCBhcHBseSB0byBib3RoLCBidXQgY2FuIGJlIG92ZXJyaWRkZW4gYnkgcHJvdmlkZWQgbGlzdGVuZXItc3BlY2lmaWMgb3B0aW9uc1xuICAgICAgc2hhcmVkT3B0aW9ucyxcbiAgICAgIC8vIFByb3ZpZGVkIGxpc3RlbmVyLXNwZWNpZmljIG9wdGlvbnNcbiAgICAgIG9wdGlvbnMua2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zLFxuICAgICAgLy8gT3B0aW9ucyB0aGF0IGNhbm5vdCBiZSBvdmVycmlkZGVuIC0gc2VlIHdyYXBwZWQgY2FsbGJhY2tzIGFib3ZlXG4gICAgICB7XG4gICAgICAgIHN0YXJ0OiB3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lclN0YXJ0LFxuICAgICAgICBkcmFnOiB3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lckRyYWcsXG4gICAgICAgIGVuZDogd3JhcHBlZEtleWJvYXJkTGlzdGVuZXJFbmRcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lciA9IG5ldyBLZXlib2FyZERyYWdMaXN0ZW5lcigga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zICk7XG5cbiAgICAvLyBUaGUgaG90a2V5cyBmcm9tIHRoZSBrZXlib2FyZCBsaXN0ZW5lciBhcmUgYXNzaWduZWQgdG8gdGhpcyBsaXN0ZW5lciBzbyB0aGF0IHRoZXkgYXJlIGFjdGl2YXRlZCBmb3IgTm9kZXNcbiAgICAvLyB3aGVyZSB0aGlzIGxpc3RlbmVyIGlzIGFkZGVkLlxuICAgIHRoaXMuaG90a2V5cyA9IHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIuaG90a2V5cztcblxuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkub3IoIFsgdGhpcy5kcmFnTGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHksIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIuaXNQcmVzc2VkUHJvcGVydHkgXSApO1xuICB9XG5cbiAgcHVibGljIGdldCBpc1ByZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZHJhZ0xpc3RlbmVyLmlzUHJlc3NlZCB8fCB0aGlzLmtleWJvYXJkRHJhZ0xpc3RlbmVyLmlzUHJlc3NlZDtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIEZvcndhcmQgaW5wdXQgdG8gYm90aCBsaXN0ZW5lcnNcbiAgICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIuaW50ZXJydXB0KCk7XG4gICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiBGb3J3YXJkIHRvIHRoZSBLZXlib2FyZExpc3RlbmVyXG4gICAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqL1xuICBwdWJsaWMga2V5ZG93biggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcbiAgICB0aGlzLmtleWJvYXJkRHJhZ0xpc3RlbmVyLmtleWRvd24oIGV2ZW50ICk7XG4gIH1cblxuICBwdWJsaWMgZm9jdXNvdXQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5mb2N1c291dCggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBmb2N1c2luKCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIuZm9jdXNpbiggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5jYW5jZWwoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiBGb3J3YXJkIHRvIHRoZSBEcmFnTGlzdGVuZXJcbiAgICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICovXG4gIHB1YmxpYyBjbGljayggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50PiApOiB2b2lkIHtcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5jbGljayggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyB0b3VjaGVudGVyKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMuZHJhZ0xpc3RlbmVyLnRvdWNoZW50ZXIoIGV2ZW50ICk7XG4gIH1cblxuICBwdWJsaWMgdG91Y2htb3ZlKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMuZHJhZ0xpc3RlbmVyLnRvdWNobW92ZSggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBmb2N1cyggZXZlbnQ6IFNjZW5lcnlFdmVudDxGb2N1c0V2ZW50PiApOiB2b2lkIHtcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5mb2N1cyggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBibHVyKCk6IHZvaWQge1xuICAgIHRoaXMuZHJhZ0xpc3RlbmVyLmJsdXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBkb3duKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMuZHJhZ0xpc3RlbmVyLmRvd24oIGV2ZW50ICk7XG4gIH1cblxuICBwdWJsaWMgdXAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIudXAoIGV2ZW50ICk7XG4gIH1cblxuICBwdWJsaWMgZW50ZXIoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIuZW50ZXIoIGV2ZW50ICk7XG4gIH1cblxuICBwdWJsaWMgbW92ZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5tb3ZlKCBldmVudCApO1xuICB9XG5cbiAgcHVibGljIGV4aXQoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIuZXhpdCggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBwb2ludGVyVXAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIucG9pbnRlclVwKCBldmVudCApO1xuICB9XG5cbiAgcHVibGljIHBvaW50ZXJDYW5jZWwoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5kcmFnTGlzdGVuZXIucG9pbnRlckNhbmNlbCggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBwb2ludGVyTW92ZSggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmRyYWdMaXN0ZW5lci5wb2ludGVyTW92ZSggZXZlbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBwb2ludGVySW50ZXJydXB0KCk6IHZvaWQge1xuICAgIHRoaXMuZHJhZ0xpc3RlbmVyLnBvaW50ZXJJbnRlcnJ1cHQoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmljaERyYWdMaXN0ZW5lcicsIFJpY2hEcmFnTGlzdGVuZXIgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJEcmFnTGlzdGVuZXIiLCJLZXlib2FyZERyYWdMaXN0ZW5lciIsInNjZW5lcnkiLCJSaWNoRHJhZ0xpc3RlbmVyIiwiaXNQcmVzc2VkIiwiZHJhZ0xpc3RlbmVyIiwia2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJkaXNwb3NlIiwiaXNQcmVzc2VkUHJvcGVydHkiLCJpbnRlcnJ1cHQiLCJrZXlkb3duIiwiZXZlbnQiLCJmb2N1c291dCIsImZvY3VzaW4iLCJjYW5jZWwiLCJjbGljayIsInRvdWNoZW50ZXIiLCJ0b3VjaG1vdmUiLCJmb2N1cyIsImJsdXIiLCJkb3duIiwidXAiLCJlbnRlciIsIm1vdmUiLCJleGl0IiwicG9pbnRlclVwIiwicG9pbnRlckNhbmNlbCIsInBvaW50ZXJNb3ZlIiwicG9pbnRlckludGVycnVwdCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwb3NpdGlvblByb3BlcnR5Iiwic3RhcnQiLCJlbmQiLCJkcmFnIiwidHJhbnNmb3JtIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwibWFwUG9zaXRpb24iLCJ0cmFuc2xhdGVOb2RlIiwiZHJhZ0xpc3RlbmVyT3B0aW9ucyIsImtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyIsInNoYXJlZE9wdGlvbnMiLCJ1bmRlZmluZWQiLCJ3cmFwcGVkRHJhZ0xpc3RlbmVyU3RhcnQiLCJsaXN0ZW5lciIsIndyYXBwZWREcmFnTGlzdGVuZXJEcmFnIiwid3JhcHBlZERyYWdMaXN0ZW5lckVuZCIsIndyYXBwZWRLZXlib2FyZExpc3RlbmVyU3RhcnQiLCJ3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lckRyYWciLCJ3cmFwcGVkS2V5Ym9hcmRMaXN0ZW5lckVuZCIsImhvdGtleXMiLCJvciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNkJDLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUVsRSxPQUFPQyxhQUFhQyxjQUFjLFFBQVEscUNBQXFDO0FBQy9FLFNBQWlDQyxZQUFZLEVBQStCQyxvQkFBb0IsRUFBeU5DLE9BQU8sUUFBc0MsZ0JBQWdCO0FBa0J2VyxJQUFBLEFBQU1DLG1CQUFOLE1BQU1BO0lBMEluQixJQUFXQyxZQUFxQjtR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