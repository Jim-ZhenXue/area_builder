// Copyright 2013-2024, University of Colorado Boulder
/**
 * Main handler for user-input events in Scenery.
 *
 * *** Adding input handling to a display
 *
 * Displays do not have event listeners attached by default. To initialize the event system (that will set up
 * listeners), use one of Display's initialize*Events functions.
 *
 * *** Pointers
 *
 * A 'pointer' is an abstract way of describing a mouse, a single touch point, or a pen/stylus, similar to in the
 * Pointer Events specification (https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html). Touch and pen
 * pointers are transient, created when the relevant DOM down event occurs and released when corresponding the DOM up
 * or cancel event occurs. However, the mouse pointer is persistent.
 *
 * Input event listeners can be added to {Node}s directly, or to a pointer. When a DOM event is received, it is first
 * broken up into multiple events (if necessary, e.g. multiple touch points), then the dispatch is handled for each
 * individual Scenery event. Events are first fired for any listeners attached to the pointer that caused the event,
 * then fire on the node directly under the pointer, and if applicable, bubble up the graph to the Scene from which the
 * event was triggered. Events are not fired directly on nodes that are not under the pointer at the time of the event.
 * To handle many common patterns (like button presses, where mouse-ups could happen when not over the button), it is
 * necessary to add those move/up listeners to the pointer itself.
 *
 * *** Listeners and Events
 *
 * Event listeners are added with node.addInputListener( listener ), pointer.addInputListener( listener ) and
 * display.addInputListener( listener ).
 * This listener can be an arbitrary object, and the listener will be triggered by calling listener[eventType]( event ),
 * where eventType is one of the event types as described below, and event is a Scenery event with the
 * following properties:
 * - trail {Trail} - Points to the node under the pointer
 * - pointer {Pointer} - The pointer that triggered the event. Additional information about the mouse/touch/pen can be
 *                       obtained from the pointer, for example event.pointer.point.
 * - type {string} - The base type of the event (e.g. for touch down events, it will always just be "down").
 * - domEvent {UIEvent} - The underlying DOM event that triggered this Scenery event. The DOM event may correspond to
 *                        multiple Scenery events, particularly for touch events. This could be a TouchEvent,
 *                        PointerEvent, MouseEvent, MSPointerEvent, etc.
 * - target {Node} - The leaf-most Node in the trail.
 * - currentTarget {Node} - The Node to which the listener being fired is attached, or null if the listener is being
 *                          fired directly from a pointer.
 *
 * Additionally, listeners may support an interrupt() method that detaches it from pointers, or may support being
 * "attached" to a pointer (indicating a primary role in controlling the pointer's behavior). See Pointer for more
 * information about these interactions.
 *
 * *** Event Types
 *
 * Scenery will fire the following base event types:
 *
 * - down: Triggered when a pointer is pressed down. Touch / pen pointers are created for each down event, and are
 *         active until an up/cancel event is sent.
 * - up: Triggered when a pointer is released normally. Touch / pen pointers will not have any more events associated
 *       with them after an up event.
 * - cancel: Triggered when a pointer is canceled abnormally. Touch / pen pointers will not have any more events
 *           associated with them after an up event.
 * - move: Triggered when a pointer moves.
 * - wheel: Triggered when the (mouse) wheel is scrolled. The associated pointer will have wheelDelta information.
 * - enter: Triggered when a pointer moves over a Node or one of its children. Does not bubble up. Mirrors behavior from
 *          the DOM mouseenter (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseenter)
 * - exit:  Triggered when a pointer moves out from over a Node or one of its children. Does not bubble up. Mirrors
 *          behavior from the DOM mouseleave (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseleave).
 * - over: Triggered when a pointer moves over a Node (not including its children). Mirrors behavior from the DOM
 *         mouseover (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseover).
 * - out: Triggered when a pointer moves out from over a Node (not including its children). Mirrors behavior from the
 *        DOM mouseout (http://www.w3.org/TR/DOM-Level-3-Events/#event-type-mouseout).
 *
 * Before firing the base event type (for example, 'move'), Scenery will also fire an event specific to the type of
 * pointer. For mice, it will fire 'mousemove', for touch events it will fire 'touchmove', and for pen events it will
 * fire 'penmove'. Similarly, for any type of event, it will first fire pointerType+eventType, and then eventType.
 *
 * **** PDOM Specific Event Types
 *
 * Some event types can only be triggered from the PDOM. If a SCENERY/Node has accessible content (see
 * ParallelDOM.js for more info), then listeners can be added for events fired from the PDOM. The accessibility events
 * triggered from a Node are dependent on the `tagName` (ergo the HTMLElement primary sibling) specified by the Node.
 *
 * Some terminology for understanding:
 * - PDOM:  parallel DOM, see ParallelDOM.js
 * - Primary Sibling:  The Node's HTMLElement in the PDOM that is interacted with for accessible interactions and to
 *                     display accessible content. The primary sibling has the tag name specified by the `tagName`
 *                     option, see `ParallelDOM.setTagName`. Primary sibling is further defined in PDOMPeer.js
 * - Assistive Technology:  aka AT, devices meant to improve the capabilities of an individual with a disability.
 *
 * The following are the supported accessible events:
 *
 * - focus: Triggered when navigation focus is set to this Node's primary sibling. This can be triggered with some
 *          AT too, like screen readers' virtual cursor, but that is not dependable as it can be toggled with a screen
 *          reader option. Furthermore, this event is not triggered on mobile devices. Does not bubble.
 * - focusin: Same as 'focus' event, but bubbles.
 * - blur:  Triggered when navigation focus leaves this Node's primary sibling. This can be triggered with some
 *          AT too, like screen readers' virtual cursor, but that is not dependable as it can be toggled with a screen
 *          reader option. Furthermore, this event is not triggered on mobile devices.
 * - focusout: Same as 'blur' event, but bubbles.
 * - click:  Triggered when this Node's primary sibling is clicked. Note, though this event seems similar to some base
 *           event types (the event implements `MouseEvent`), it only applies when triggered from the PDOM.
 *           See https://www.w3.org/TR/DOM-Level-3-Events/#click
 * - input:  Triggered when the value of an <input>, <select>, or <textarea> element has been changed.
 *           See https://www.w3.org/TR/DOM-Level-3-Events/#input
 * - change:  Triggered for <input>, <select>, and <textarea> elements when an alteration to the element's value is
 *            committed by the user. Unlike the input event, the change event is not necessarily fired for each
 *            alteration to an element's value. See
 *            https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event and
 *            https://html.spec.whatwg.org/multipage/indices.html#event-change
 * - keydown: Triggered for all keys pressed. When a screen reader is active, this event will be omitted
 *            role="button" is activated.
 *            See https://www.w3.org/TR/DOM-Level-3-Events/#keydown
 * - keyup :  Triggered for all keys when released. When a screen reader is active, this event will be omitted
 *            role="button" is activated.
 *            See https://www.w3.org/TR/DOM-Level-3-Events/#keyup
 *
 * *** Event Dispatch
 *
 * Events have two methods that will cause early termination: event.abort() will cause no more listeners to be notified
 * for this event, and event.handle() will allow the current level of listeners to be notified (all pointer listeners,
 * or all listeners attached to the current node), but no more listeners after that level will fire. handle and abort
 * are like stopPropagation, stopImmediatePropagation for DOM events, except they do not trigger those DOM methods on
 * the underlying DOM event.
 *
 * Up/down/cancel events all happen separately, but for move events, a specific sequence of events occurs if the pointer
 * changes the node it is over:
 *
 * 1. The move event is fired (and bubbles).
 * 2. An out event is fired for the old topmost Node (and bubbles).
 * 3. exit events are fired for all Nodes in the Trail hierarchy that are now not under the pointer, from the root-most
 *    to the leaf-most. Does not bubble.
 * 4. enter events are fired for all Nodes in the Trail hierarchy that were not under the pointer (but now are), from
 *    the leaf-most to the root-most. Does not bubble.
 * 5. An over event is fired for the new topmost Node (and bubbles).
 *
 * event.abort() and event.handle() will currently not affect other stages in the 'move' sequence (e.g. event.abort() in
 * the 'move' event will not affect the following 'out' event).
 *
 * For each event type:
 *
 * 1. Listeners on the pointer will be triggered first (in the order they were added)
 * 2. Listeners on the target (top-most) Node will be triggered (in the order they were added to that Node)
 * 3. Then if the event bubbles, each Node in the Trail will be triggered, starting from the Node under the top-most
 *    (that just had listeners triggered) and all the way down to the Scene. Listeners are triggered in the order they
 *    were added for each Node.
 * 4. Listeners on the display will be triggered (in the order they were added)
 *
 * For each listener being notified, it will fire the more specific pointerType+eventType first (e.g. 'mousemove'),
 * then eventType next (e.g. 'move').
 *
 * Currently, preventDefault() is called on the associated DOM event if the top-most node has the 'interactive' property
 * set to a truthy value.
 *
 * *** Relevant Specifications
 *
 * DOM Level 3 events spec: http://www.w3.org/TR/DOM-Level-3-Events/
 * Touch events spec: http://www.w3.org/TR/touch-events/
 * Pointer events spec draft: https://dvcs.w3.org/hg/pointerevents/raw-file/tip/pointerEvents.html
 *                            http://msdn.microsoft.com/en-us/library/ie/hh673557(v=vs.85).aspx
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import stepTimer from '../../../axon/js/stepTimer.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import optionize from '../../../phet-core/js/optionize.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import { BatchedDOMEvent, BatchedDOMEventType, BrowserEvents, Display, EventContext, EventContextIO, Mouse, PDOMInstance, PDOMPointer, PDOMUtils, Pen, Pointer, scenery, SceneryEvent, Touch, Trail } from '../imports.js';
const ArrayIOPointerIO = ArrayIO(Pointer.PointerIO);
// This is the list of keys that get serialized AND deserialized. NOTE: Do not add or change this without
// consulting the PhET-iO IOType schema for this in EventIO
const domEventPropertiesToSerialize = [
    'altKey',
    'button',
    'charCode',
    'clientX',
    'clientY',
    'code',
    'ctrlKey',
    'deltaMode',
    'deltaX',
    'deltaY',
    'deltaZ',
    'key',
    'keyCode',
    'metaKey',
    'pageX',
    'pageY',
    'pointerId',
    'pointerType',
    'scale',
    'shiftKey',
    'target',
    'type',
    'relatedTarget',
    'which'
];
// Cannot be set after construction, and should be provided in the init config to the constructor(), see Input.deserializeDOMEvent
const domEventPropertiesSetInConstructor = [
    'deltaMode',
    'deltaX',
    'deltaY',
    'deltaZ',
    'altKey',
    'button',
    'charCode',
    'clientX',
    'clientY',
    'code',
    'ctrlKey',
    'key',
    'keyCode',
    'metaKey',
    'pageX',
    'pageY',
    'pointerId',
    'pointerType',
    'shiftKey',
    'type',
    'relatedTarget',
    'which'
];
// A list of keys on events that need to be serialized into HTMLElements
const EVENT_KEY_VALUES_AS_ELEMENTS = [
    'target',
    'relatedTarget'
];
// A list of events that should still fire, even when the Node is not pickable
const PDOM_UNPICKABLE_EVENTS = [
    'focus',
    'blur',
    'focusin',
    'focusout'
];
const TARGET_SUBSTITUTE_KEY = 'targetSubstitute';
// A bit more than the maximum amount of time that iOS 14 VoiceOver was observed to delay between
// sending a mouseup event and a click event.
const PDOM_CLICK_DELAY = 80;
let Input = class Input extends PhetioObject {
    /**
   * Interrupts any input actions that are currently taking place (should stop drags, etc.)
   *
   * If excludePointer is provided, it will NOT be interrupted along with the others
   */ interruptPointers(excludePointer = null) {
        _.each(this.pointers, (pointer)=>{
            if (pointer !== excludePointer) {
                pointer.interruptAll();
            }
        });
    }
    /**
   * Called to batch a raw DOM event (which may be immediately fired, depending on the settings). (scenery-internal)
   *
   * @param context
   * @param batchType - See BatchedDOMEvent's "enumeration"
   * @param callback - Parameter types defined by the batchType. See BatchedDOMEvent for details
   * @param triggerImmediate - Certain events can force immediate action, since browsers like Chrome
   *                                     only allow certain operations in the callback for a user gesture (e.g. like
   *                                     a mouseup to open a window).
   */ batchEvent(context, batchType, callback, triggerImmediate) {
        sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent('Input.batchEvent');
        sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
        // If our display is not interactive, do not respond to any events (but still prevent default)
        if (this.display.interactive) {
            this.batchedEvents.push(BatchedDOMEvent.pool.create(context, batchType, callback));
            if (triggerImmediate || !this.batchDOMEvents) {
                this.fireBatchedEvents();
            }
        // NOTE: If we ever want to Display.updateDisplay() on events, do so here
        }
        // Always preventDefault on touch events, since we don't want mouse events triggered afterwards. See
        // http://www.html5rocks.com/en/mobile/touchandmouse/ for more information.
        // Additionally, IE had some issues with skipping prevent default, see
        // https://github.com/phetsims/scenery/issues/464 for mouse handling.
        // WE WILL NOT preventDefault() on keyboard or alternative input events here
        if (!(this.passiveEvents === true) && (callback !== this.mouseDown || platform.edge) && batchType !== BatchedDOMEventType.ALT_TYPE && !context.allowsDOMInput()) {
            // We cannot prevent a passive event, so don't try
            context.domEvent.preventDefault();
        }
        sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
    }
    /**
   * Fires all of our events that were batched into the batchedEvents array. (scenery-internal)
   */ fireBatchedEvents() {
        sceneryLog && sceneryLog.InputEvent && this.currentlyFiringEvents && sceneryLog.InputEvent('REENTRANCE DETECTED');
        // Don't re-entrantly enter our loop, see https://github.com/phetsims/balloons-and-static-electricity/issues/406
        if (!this.currentlyFiringEvents && this.batchedEvents.length) {
            sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`Input.fireBatchedEvents length:${this.batchedEvents.length}`);
            sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
            this.currentlyFiringEvents = true;
            // needs to be done in order
            const batchedEvents = this.batchedEvents;
            // IMPORTANT: We need to check the length of the array at every iteration, as it can change due to re-entrant
            // event handling, see https://github.com/phetsims/balloons-and-static-electricity/issues/406.
            // Events may be appended to this (synchronously) as part of firing initial events, so we want to FULLY run all
            // events before clearing our array.
            for(let i = 0; i < batchedEvents.length; i++){
                const batchedEvent = batchedEvents[i];
                batchedEvent.run(this);
                batchedEvent.dispose();
            }
            cleanArray(batchedEvents);
            this.currentlyFiringEvents = false;
            sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
        }
    }
    /**
   * Clears any batched events that we don't want to process. (scenery-internal)
   *
   * NOTE: It is HIGHLY recommended to interrupt pointers and remove non-Mouse pointers before doing this, as
   * otherwise it can cause incorrect state in certain types of listeners (e.g. ones that count how many pointers
   * are over them).
   */ clearBatchedEvents() {
        this.batchedEvents.length = 0;
    }
    /**
   * Checks all pointers to see whether they are still "over" the same nodes (trail). If not, it will fire the usual
   * enter/exit events. (scenery-internal)
   */ validatePointers() {
        this.validatePointersAction.execute();
    }
    /**
   * Removes all non-Mouse pointers from internal tracking. (scenery-internal)
   */ removeTemporaryPointers() {
        for(let i = this.pointers.length - 1; i >= 0; i--){
            const pointer = this.pointers[i];
            if (!(pointer instanceof Mouse)) {
                this.pointers.splice(i, 1);
                // Send exit events. As we can't get a DOM event, we'll send a fake object instead.
                const exitTrail = pointer.trail || new Trail(this.rootNode);
                this.exitEvents(pointer, EventContext.createSynthetic(), exitTrail, 0, true);
            }
        }
    }
    /**
   * Hooks up DOM listeners to whatever type of object we are going to listen to. (scenery-internal)
   */ connectListeners() {
        BrowserEvents.addDisplay(this.display, this.attachToWindow, this.passiveEvents);
    }
    /**
   * Removes DOM listeners from whatever type of object we were listening to. (scenery-internal)
   */ disconnectListeners() {
        BrowserEvents.removeDisplay(this.display, this.attachToWindow, this.passiveEvents);
    }
    /**
   * Extract a {Vector2} global coordinate point from an arbitrary DOM event. (scenery-internal)
   */ pointFromEvent(domEvent) {
        const position = Vector2.pool.create(domEvent.clientX, domEvent.clientY);
        if (!this.assumeFullWindow) {
            const domBounds = this.display.domElement.getBoundingClientRect();
            // TODO: consider totally ignoring any with zero width/height, as we aren't attached to the display? https://github.com/phetsims/scenery/issues/1581
            // For now, don't offset.
            if (domBounds.width > 0 && domBounds.height > 0) {
                position.subtractXY(domBounds.left, domBounds.top);
                // Detect a scaling of the display here (the client bounding rect having different dimensions from our
                // display), and attempt to compensate.
                // NOTE: We can't handle rotation here.
                if (domBounds.width !== this.display.width || domBounds.height !== this.display.height) {
                    // TODO: Have code verify the correctness here, and that it's not triggering all the time https://github.com/phetsims/scenery/issues/1581
                    position.x *= this.display.width / domBounds.width;
                    position.y *= this.display.height / domBounds.height;
                }
            }
        }
        return position;
    }
    /**
   * Adds a pointer to our list.
   */ addPointer(pointer) {
        this.pointers.push(pointer);
        this.pointerAddedEmitter.emit(pointer);
    }
    /**
   * Removes a pointer from our list. If we get future events for it (based on the ID) it will be ignored.
   */ removePointer(pointer) {
        // sanity check version, will remove all instances
        for(let i = this.pointers.length - 1; i >= 0; i--){
            if (this.pointers[i] === pointer) {
                this.pointers.splice(i, 1);
            }
        }
        pointer.dispose();
    }
    /**
   * Given a pointer's ID (given by the pointer/touch specifications to be unique to a specific pointer/touch),
   * returns the given pointer (if we have one).
   *
   * NOTE: There are some cases where we may have prematurely "removed" a pointer.
   */ findPointerById(id) {
        let i = this.pointers.length;
        while(i--){
            const pointer = this.pointers[i];
            if (pointer.id === id) {
                return pointer;
            }
        }
        return null;
    }
    getPDOMEventTrail(domEvent, eventName) {
        if (!this.display.interactive) {
            return null;
        }
        const trail = this.getTrailFromPDOMEvent(domEvent);
        // Only dispatch the event if the click did not happen rapidly after an up event. It is
        // likely that the screen reader dispatched both pointer AND click events in this case, and
        // we only want to respond to one or the other. See https://github.com/phetsims/scenery/issues/1094.
        // This is outside of the clickAction execution so that blocked clicks are not part of the PhET-iO data
        // stream.
        const notBlockingSubsequentClicksOccurringTooQuickly = trail && !(eventName === 'click' && _.some(trail.nodes, (node)=>node.positionInPDOM) && domEvent.timeStamp - this.upTimeStamp <= PDOM_CLICK_DELAY);
        return notBlockingSubsequentClicksOccurringTooQuickly ? trail : null;
    }
    /**
   * Initializes the Mouse object on the first mouse event (this may never happen on touch devices).
   */ initMouse(point) {
        const mouse = new Mouse(point);
        this.mouse = mouse;
        this.addPointer(mouse);
        return mouse;
    }
    ensureMouse(point) {
        const mouse = this.mouse;
        if (mouse) {
            return mouse;
        } else {
            return this.initMouse(point);
        }
    }
    /**
   * Initializes the accessible pointer object on the first pdom event.
   */ initPDOMPointer() {
        const pdomPointer = new PDOMPointer(this.display);
        this.pdomPointer = pdomPointer;
        this.addPointer(pdomPointer);
        return pdomPointer;
    }
    ensurePDOMPointer() {
        const pdomPointer = this.pdomPointer;
        if (pdomPointer) {
            return pdomPointer;
        } else {
            return this.initPDOMPointer();
        }
    }
    /**
   * Steps to dispatch a pdom-related event. Before dispatch, the PDOMPointer is initialized if it
   * hasn't been created yet and a userGestureEmitter emits to indicate that a user has begun an interaction.
   */ dispatchPDOMEvent(trail, eventType, context, bubbles) {
        this.ensurePDOMPointer().updateTrail(trail);
        // exclude focus and blur events because they can happen with scripting without user input
        if (PDOMUtils.USER_GESTURE_EVENTS.includes(eventType)) {
            Display.userGestureEmitter.emit();
        }
        const domEvent = context.domEvent;
        // This workaround hopefully won't be here forever, see ParallelDOM.setExcludeLabelSiblingFromInput() and https://github.com/phetsims/a11y-research/issues/156
        if (!(domEvent.target && domEvent.target.hasAttribute(PDOMUtils.DATA_EXCLUDE_FROM_INPUT))) {
            // If the trail is not pickable, don't dispatch PDOM events to those targets - but we still
            // dispatch with an empty trail to call listeners on the Display and Pointer.
            const canFireListeners = trail.isPickable() || PDOM_UNPICKABLE_EVENTS.includes(eventType);
            if (!canFireListeners) {
                trail = new Trail([]);
            }
            assert && assert(this.pdomPointer);
            this.dispatchEvent(trail, eventType, this.pdomPointer, context, bubbles);
        }
    }
    /**
   * From a DOM Event, get its relatedTarget and map that to the scenery Node. Will return null if relatedTarget
   * is not provided, or if relatedTarget is not under PDOM, or there is no associated Node with trail id on the
   * relatedTarget element. (scenery-internal)
   *
   * @param domEvent - DOM Event, not a SceneryEvent!
   */ getRelatedTargetTrail(domEvent) {
        const relatedTargetElement = domEvent.relatedTarget;
        if (relatedTargetElement && this.display.isElementUnderPDOM(relatedTargetElement, false)) {
            const relatedTarget = domEvent.relatedTarget;
            assert && assert(relatedTarget instanceof window.Element);
            const trailIndices = relatedTarget.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
            assert && assert(trailIndices, 'should not be null');
            return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
        }
        return null;
    }
    /**
   * Get the trail ID of the node represented by a DOM element who is the target of a DOM Event in the accessible PDOM.
   * This is a bit of a misnomer, because the domEvent doesn't have to be under the PDOM. Returns null if not in the PDOM.
   */ getTrailFromPDOMEvent(domEvent) {
        assert && assert(domEvent.target || domEvent[TARGET_SUBSTITUTE_KEY], 'need a way to get the target');
        if (!this.display._accessible) {
            return null;
        }
        // could be serialized event for phet-io playbacks, see Input.serializeDOMEvent()
        if (domEvent[TARGET_SUBSTITUTE_KEY]) {
            const trailIndices = domEvent[TARGET_SUBSTITUTE_KEY].getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
            return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
        } else {
            const target = domEvent.target;
            if (target && target instanceof window.Element && this.display.isElementUnderPDOM(target, false)) {
                const trailIndices = target.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
                assert && assert(trailIndices, 'should not be null');
                return PDOMInstance.uniqueIdToTrail(this.display, trailIndices);
            }
        }
        return null;
    }
    /**
   * Triggers a logical mousedown event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ mouseDown(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseDown('${id}', ${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.mouseDownAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical mouseup event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ mouseUp(point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseUp(${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.mouseUpAction.execute(point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical mousemove event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ mouseMove(point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseMove(${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.mouseMoveAction.execute(point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical mouseover event (this does NOT correspond to the Scenery event, since this is for the display) (scenery-internal)
   */ mouseOver(point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseOver(${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.mouseOverAction.execute(point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical mouseout event (this does NOT correspond to the Scenery event, since this is for the display) (scenery-internal)
   */ mouseOut(point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`mouseOut(${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.mouseOutAction.execute(point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical mouse-wheel/scroll event. (scenery-internal)
   */ wheel(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`wheel(${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.wheelScrollAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical touchstart event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ touchStart(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchStart('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.touchStartAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical touchend event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ touchEnd(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchEnd('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.touchEndAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical touchmove event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ touchMove(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchMove('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.touchMoveAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical touchcancel event. This is called for each touch point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerCancel) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ touchCancel(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`touchCancel('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.touchCancelAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical penstart event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerDown) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ penStart(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`penStart('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.penStartAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical penend event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerUp) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ penEnd(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`penEnd('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.penEndAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical penmove event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerMove) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ penMove(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`penMove('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.penMoveAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Triggers a logical pencancel event (e.g. a stylus). This is called for each pen point in a 'raw' event. (scenery-internal)
   *
   * NOTE: This may also be called from the pointer event handler (pointerCancel) or from things like fuzzing or
   * playback. The event may be "faked" for certain purposes.
   */ penCancel(id, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`penCancel('${id}',${Input.debugText(point, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.penCancelAction.execute(id, point, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a pointerdown event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerDown(id, type, point, context) {
        // In IE for pointer down events, we want to make sure than the next interactions off the page are sent to
        // this element (it will bubble). See https://github.com/phetsims/scenery/issues/464 and
        // http://news.qooxdoo.org/mouse-capturing.
        const target = this.attachToWindow ? document.body : this.display.domElement;
        if (target.setPointerCapture && context.domEvent.pointerId && !context.allowsDOMInput()) {
            // NOTE: This will error out if run on a playback destination, where a pointer with the given ID does not exist.
            target.setPointerCapture(context.domEvent.pointerId);
        }
        type = this.handleUnknownPointerType(type, id);
        switch(type){
            case 'mouse':
                // The actual event afterwards
                this.mouseDown(id, point, context);
                break;
            case 'touch':
                this.touchStart(id, point, context);
                break;
            case 'pen':
                this.penStart(id, point, context);
                break;
            default:
                if (assert) {
                    throw new Error(`Unknown pointer type: ${type}`);
                }
        }
    }
    /**
   * Handles a pointerup event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerUp(id, type, point, context) {
        // update this outside of the Action executions so that PhET-iO event playback does not override it
        this.upTimeStamp = context.domEvent.timeStamp;
        type = this.handleUnknownPointerType(type, id);
        switch(type){
            case 'mouse':
                this.mouseUp(point, context);
                break;
            case 'touch':
                this.touchEnd(id, point, context);
                break;
            case 'pen':
                this.penEnd(id, point, context);
                break;
            default:
                if (assert) {
                    throw new Error(`Unknown pointer type: ${type}`);
                }
        }
    }
    /**
   * Handles a pointercancel event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerCancel(id, type, point, context) {
        type = this.handleUnknownPointerType(type, id);
        switch(type){
            case 'mouse':
                if (console && console.log) {
                    console.log('WARNING: Pointer mouse cancel was received');
                }
                break;
            case 'touch':
                this.touchCancel(id, point, context);
                break;
            case 'pen':
                this.penCancel(id, point, context);
                break;
            default:
                if (console.log) {
                    console.log(`Unknown pointer type: ${type}`);
                }
        }
    }
    /**
   * Handles a gotpointercapture event, forwarding it to the proper logical event. (scenery-internal)
   */ gotPointerCapture(id, type, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`gotPointerCapture('${id}',${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.gotPointerCaptureAction.execute(id, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a lostpointercapture event, forwarding it to the proper logical event. (scenery-internal)
   */ lostPointerCapture(id, type, point, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`lostPointerCapture('${id}',${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.lostPointerCaptureAction.execute(id, context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a pointermove event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerMove(id, type, point, context) {
        type = this.handleUnknownPointerType(type, id);
        switch(type){
            case 'mouse':
                this.mouseMove(point, context);
                break;
            case 'touch':
                this.touchMove(id, point, context);
                break;
            case 'pen':
                this.penMove(id, point, context);
                break;
            default:
                if (console.log) {
                    console.log(`Unknown pointer type: ${type}`);
                }
        }
    }
    /**
   * Handles a pointerover event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerOver(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed? https://github.com/phetsims/scenery/issues/1581
    // TODO: do we want to branch change on these types of events? https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * Handles a pointerout event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerOut(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed? https://github.com/phetsims/scenery/issues/1581
    // TODO: do we want to branch change on these types of events? https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * Handles a pointerenter event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerEnter(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed? https://github.com/phetsims/scenery/issues/1581
    // TODO: do we want to branch change on these types of events? https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * Handles a pointerleave event, forwarding it to the proper logical event. (scenery-internal)
   */ pointerLeave(id, type, point, context) {
    // TODO: accumulate mouse/touch info in the object if needed? https://github.com/phetsims/scenery/issues/1581
    // TODO: do we want to branch change on these types of events? https://github.com/phetsims/scenery/issues/1581
    }
    /**
   * Handles a focusin event, forwarding it to the proper logical event. (scenery-internal)
   */ focusIn(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusIn('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.focusinAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a focusout event, forwarding it to the proper logical event. (scenery-internal)
   */ focusOut(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusOut('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.focusoutAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles an input event, forwarding it to the proper logical event. (scenery-internal)
   */ input(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`input('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.inputAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a change event, forwarding it to the proper logical event. (scenery-internal)
   */ change(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`change('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.changeAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a click event, forwarding it to the proper logical event. (scenery-internal)
   */ click(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`click('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.clickAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a keydown event, forwarding it to the proper logical event. (scenery-internal)
   */ keyDown(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyDown('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.keydownAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Handles a keyup event, forwarding it to the proper logical event. (scenery-internal)
   */ keyUp(context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyUp('${Input.debugText(null, context.domEvent)});`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        this.keyupAction.execute(context);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * When we get an unknown pointer event type (allowed in the spec, see
   * https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType), we'll try to guess the pointer type
   * so that we can properly start/end the interaction. NOTE: this can happen for an 'up' where we received a
   * proper type for a 'down', so thus we need the detection.
   */ handleUnknownPointerType(type, id) {
        if (type !== '') {
            return type;
        }
        return this.mouse && this.mouse.id === id ? 'mouse' : 'touch';
    }
    /**
   * Given a pointer reference, hit test it and determine the Trail that the pointer is over.
   */ getPointerTrail(pointer) {
        return this.rootNode.trailUnderPointer(pointer) || new Trail(this.rootNode);
    }
    /**
   * Called for each logical "up" event, for any pointer type.
   */ upEvent(pointer, context, point) {
        // if the event target is within the PDOM the AT is sending a fake pointer event to the document - do not
        // dispatch this since the PDOM should only handle Input.PDOM_EVENT_TYPES, and all other pointer input should
        // go through the Display div. Otherwise, activation will be duplicated when we handle pointer and PDOM events
        if (this.display.isElementUnderPDOM(context.domEvent.target, true)) {
            return;
        }
        const pointChanged = pointer.up(point, context.domEvent);
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`upEvent ${pointer.toString()} changed:${pointChanged}`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        // We'll use this trail for the entire dispatch of this event.
        const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
        this.dispatchEvent(eventTrail, 'up', pointer, context, true);
        // touch pointers are transient, so fire exit/out to the trail afterwards
        if (pointer.isTouchLike()) {
            this.exitEvents(pointer, context, eventTrail, 0, true);
        }
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Called for each logical "down" event, for any pointer type.
   */ downEvent(pointer, context, point) {
        // if the event target is within the PDOM the AT is sending a fake pointer event to the document - do not
        // dispatch this since the PDOM should only handle Input.PDOM_EVENT_TYPES, and all other pointer input should
        // go through the Display div. Otherwise, activation will be duplicated when we handle pointer and PDOM events
        if (this.display.isElementUnderPDOM(context.domEvent.target, true)) {
            return;
        }
        const pointChanged = pointer.updatePoint(point);
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`downEvent ${pointer.toString()} changed:${pointChanged}`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        // We'll use this trail for the entire dispatch of this event.
        const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
        pointer.down(context.domEvent);
        this.dispatchEvent(eventTrail, 'down', pointer, context, true);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Called for each logical "move" event, for any pointer type.
   */ moveEvent(pointer, context) {
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`moveEvent ${pointer.toString()}`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        // Always treat move events as "point changed"
        this.branchChangeEvents(pointer, context, true);
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Called for each logical "cancel" event, for any pointer type.
   */ cancelEvent(pointer, context, point) {
        const pointChanged = pointer.cancel(point);
        sceneryLog && sceneryLog.Input && sceneryLog.Input(`cancelEvent ${pointer.toString()} changed:${pointChanged}`);
        sceneryLog && sceneryLog.Input && sceneryLog.push();
        // We'll use this trail for the entire dispatch of this event.
        const eventTrail = this.branchChangeEvents(pointer, context, pointChanged);
        this.dispatchEvent(eventTrail, 'cancel', pointer, context, true);
        // touch pointers are transient, so fire exit/out to the trail afterwards
        if (pointer.isTouchLike()) {
            this.exitEvents(pointer, context, eventTrail, 0, true);
        }
        sceneryLog && sceneryLog.Input && sceneryLog.pop();
    }
    /**
   * Dispatches any necessary events that would result from the pointer's trail changing.
   *
   * This will send the necessary exit/enter events (on subtrails that have diverged between before/after), the
   * out/over events, and if flagged a move event.
   *
   * @param pointer
   * @param context
   * @param sendMove - Whether to send move events
   * @returns - The current trail of the pointer
   */ branchChangeEvents(pointer, context, sendMove) {
        sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`branchChangeEvents: ${pointer.toString()} sendMove:${sendMove}`);
        sceneryLog && sceneryLog.InputEvent && sceneryLog.push();
        const trail = this.getPointerTrail(pointer);
        const inputEnabledTrail = trail.slice(0, Math.min(trail.nodes.length, trail.getLastInputEnabledIndex() + 1));
        const oldInputEnabledTrail = pointer.inputEnabledTrail || new Trail(this.rootNode);
        const branchInputEnabledIndex = Trail.branchIndex(inputEnabledTrail, oldInputEnabledTrail);
        const lastInputEnabledNodeChanged = oldInputEnabledTrail.lastNode() !== inputEnabledTrail.lastNode();
        if (sceneryLog && sceneryLog.InputEvent) {
            const oldTrail = pointer.trail || new Trail(this.rootNode);
            const branchIndex = Trail.branchIndex(trail, oldTrail);
            (branchIndex !== trail.length || branchIndex !== oldTrail.length) && sceneryLog.InputEvent(`changed from ${oldTrail.toString()} to ${trail.toString()}`);
        }
        // event order matches http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
        if (sendMove) {
            this.dispatchEvent(trail, 'move', pointer, context, true);
        }
        // We want to approximately mimic http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevent-event-order
        this.exitEvents(pointer, context, oldInputEnabledTrail, branchInputEnabledIndex, lastInputEnabledNodeChanged);
        this.enterEvents(pointer, context, inputEnabledTrail, branchInputEnabledIndex, lastInputEnabledNodeChanged);
        pointer.trail = trail;
        pointer.inputEnabledTrail = inputEnabledTrail;
        sceneryLog && sceneryLog.InputEvent && sceneryLog.pop();
        return trail;
    }
    /**
   * Triggers 'enter' events along a trail change, and an 'over' event on the leaf.
   *
   * For example, if we change from a trail [ a, b, c, d, e ] => [ a, b, x, y ], it will fire:
   *
   * - enter x
   * - enter y
   * - over y (bubbles)
   *
   * @param pointer
   * @param event
   * @param trail - The "new" trail
   * @param branchIndex - The first index where the old and new trails have a different node. We will notify
   *                               for this node and all "descendant" nodes in the relevant trail.
   * @param lastNodeChanged - If the last node didn't change, we won't sent an over event.
   */ enterEvents(pointer, context, trail, branchIndex, lastNodeChanged) {
        if (lastNodeChanged) {
            this.dispatchEvent(trail, 'over', pointer, context, true, true);
        }
        for(let i = branchIndex; i < trail.length; i++){
            this.dispatchEvent(trail.slice(0, i + 1), 'enter', pointer, context, false);
        }
    }
    /**
   * Triggers 'exit' events along a trail change, and an 'out' event on the leaf.
   *
   * For example, if we change from a trail [ a, b, c, d, e ] => [ a, b, x, y ], it will fire:
   *
   * - out e (bubbles)
   * - exit c
   * - exit d
   * - exit e
   *
   * @param pointer
   * @param event
   * @param trail - The "old" trail
   * @param branchIndex - The first index where the old and new trails have a different node. We will notify
   *                               for this node and all "descendant" nodes in the relevant trail.
   * @param lastNodeChanged - If the last node didn't change, we won't sent an out event.
   */ exitEvents(pointer, context, trail, branchIndex, lastNodeChanged) {
        for(let i = trail.length - 1; i >= branchIndex; i--){
            this.dispatchEvent(trail.slice(0, i + 1), 'exit', pointer, context, false, true);
        }
        if (lastNodeChanged) {
            this.dispatchEvent(trail, 'out', pointer, context, true);
        }
    }
    /**
   * Dispatch to all nodes in the Trail, optionally bubbling down from the leaf to the root.
   *
   * @param trail
   * @param type
   * @param pointer
   * @param context
   * @param bubbles - If bubbles is false, the event is only dispatched to the leaf node of the trail.
   * @param fireOnInputDisabled - Whether to fire this event even if nodes have inputEnabled:false
   */ dispatchEvent(trail, type, pointer, context, bubbles, fireOnInputDisabled = false) {
        sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(`${type} trail:${trail.toString()} pointer:${pointer.toString()} at ${pointer.point ? pointer.point.toString() : 'null'}`);
        sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
        assert && assert(trail, 'Falsy trail for dispatchEvent');
        sceneryLog && sceneryLog.EventPath && sceneryLog.EventPath(`${type} ${trail.toPathString()}`);
        // NOTE: event is not immutable, as its currentTarget changes
        const inputEvent = new SceneryEvent(trail, type, pointer, context);
        this.currentSceneryEvent = inputEvent;
        // first run through the pointer's listeners to see if one of them will handle the event
        this.dispatchToListeners(pointer, pointer.getListeners(), type, inputEvent);
        // if not yet handled, run through the trail in order to see if one of them will handle the event
        // at the base of the trail should be the scene node, so the scene will be notified last
        this.dispatchToTargets(trail, type, pointer, inputEvent, bubbles, fireOnInputDisabled);
        // Notify input listeners on the Display
        this.dispatchToListeners(pointer, this.display.getInputListeners(), type, inputEvent);
        // Notify input listeners to any Display
        if (Display.inputListeners.length) {
            this.dispatchToListeners(pointer, Display.inputListeners.slice(), type, inputEvent);
        }
        this.currentSceneryEvent = null;
        sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
    }
    /**
   * Notifies an array of listeners with a specific event.
   *
   * @param pointer
   * @param listeners - Should be a defensive array copy already.
   * @param type
   * @param inputEvent
   */ dispatchToListeners(pointer, listeners, type, inputEvent) {
        if (inputEvent.handled) {
            return;
        }
        const specificType = pointer.type + type; // e.g. mouseup, touchup
        for(let i = 0; i < listeners.length; i++){
            const listener = listeners[i];
            if (!inputEvent.aborted && listener[specificType]) {
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(specificType);
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
                listener[specificType](inputEvent);
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
            }
            if (!inputEvent.aborted && listener[type]) {
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.EventDispatch(type);
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.push();
                listener[type](inputEvent);
                sceneryLog && sceneryLog.EventDispatch && sceneryLog.pop();
            }
        }
    }
    /**
   * Dispatch to all nodes in the Trail, optionally bubbling down from the leaf to the root.
   *
   * @param trail
   * @param type
   * @param pointer
   * @param inputEvent
   * @param bubbles - If bubbles is false, the event is only dispatched to the leaf node of the trail.
   * @param [fireOnInputDisabled]
   */ dispatchToTargets(trail, type, pointer, inputEvent, bubbles, fireOnInputDisabled = false) {
        if (inputEvent.aborted || inputEvent.handled) {
            return;
        }
        const inputEnabledIndex = trail.getLastInputEnabledIndex();
        for(let i = trail.nodes.length - 1; i >= 0; bubbles ? i-- : i = -1){
            const target = trail.nodes[i];
            const trailInputDisabled = inputEnabledIndex < i;
            if (target.isDisposed || !fireOnInputDisabled && trailInputDisabled) {
                continue;
            }
            inputEvent.currentTarget = target;
            this.dispatchToListeners(pointer, target.getInputListeners(), type, inputEvent);
            // if the input event was aborted or handled, don't follow the trail down another level
            if (inputEvent.aborted || inputEvent.handled) {
                return;
            }
        }
    }
    /**
   * Saves the main information we care about from a DOM `Event` into a JSON-like structure. To support
   * polymorphism, all supported DOM event keys that scenery uses will always be included in this serialization. If
   * the particular Event interface for the instance being serialized doesn't have a certain property, then it will be
   * set as `null`. See domEventPropertiesToSerialize for the full list of supported Event properties.
   *
   * @returns - see domEventPropertiesToSerialize for list keys that are serialized
   */ static serializeDomEvent(domEvent) {
        const entries = {
            constructorName: domEvent.constructor.name
        };
        domEventPropertiesToSerialize.forEach((property)=>{
            const domEventProperty = domEvent[property];
            // We serialize many Event APIs into a single object, so be graceful if properties don't exist.
            if (domEventProperty === undefined || domEventProperty === null) {
                entries[property] = null;
            } else if (domEventProperty instanceof Element && EVENT_KEY_VALUES_AS_ELEMENTS.includes(property) && typeof domEventProperty.getAttribute === 'function' && // If false, then this target isn't a PDOM element, so we can skip this serialization
            domEventProperty.hasAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID)) {
                // If the target came from the accessibility PDOM, then we want to store the Node trail id of where it came from.
                entries[property] = {
                    [PDOMUtils.DATA_PDOM_UNIQUE_ID]: domEventProperty.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID),
                    // Have the ID also
                    id: domEventProperty.getAttribute('id')
                };
            } else {
                // Parse to get rid of functions and circular references.
                entries[property] = typeof domEventProperty === 'object' ? {} : JSON.parse(JSON.stringify(domEventProperty));
            }
        });
        return entries;
    }
    /**
   * From a serialized dom event, return a recreated window.Event (scenery-internal)
   */ static deserializeDomEvent(eventObject) {
        const constructorName = eventObject.constructorName || 'Event';
        const configForConstructor = _.pick(eventObject, domEventPropertiesSetInConstructor);
        // serialize the relatedTarget back into an event Object, so that it can be passed to the init config in the Event
        // constructor
        if (configForConstructor.relatedTarget) {
            // @ts-expect-error
            const htmlElement = document.getElementById(configForConstructor.relatedTarget.id);
            assert && assert(htmlElement, 'cannot deserialize event when related target is not in the DOM.');
            configForConstructor.relatedTarget = htmlElement;
        }
        // @ts-expect-error
        const domEvent = new window[constructorName](constructorName, configForConstructor);
        for(const key in eventObject){
            // `type` is readonly, so don't try to set it.
            if (eventObject.hasOwnProperty(key) && !domEventPropertiesSetInConstructor.includes(key)) {
                // Special case for target since we can't set that read-only property. Instead use a substitute key.
                if (key === 'target') {
                    if (assert) {
                        const target = eventObject.target;
                        if (target && target.id) {
                            assert(document.getElementById(target.id), 'target should exist in the PDOM to support playback.');
                        }
                    }
                    // @ts-expect-error
                    domEvent[TARGET_SUBSTITUTE_KEY] = _.clone(eventObject[key]) || {};
                    // This may not be needed since https://github.com/phetsims/scenery/issues/1296 is complete, double check on getTrailFromPDOMEvent() too
                    // @ts-expect-error
                    domEvent[TARGET_SUBSTITUTE_KEY].getAttribute = function(key) {
                        return this[key];
                    };
                } else {
                    // @ts-expect-error
                    domEvent[key] = eventObject[key];
                }
            }
        }
        return domEvent;
    }
    /**
   * Convenience function for logging out a point/event combination.
   *
   * @param point - Not logged if null
   * @param domEvent
   */ static debugText(point, domEvent) {
        let result = `${domEvent.timeStamp} ${domEvent.type}`;
        if (point !== null) {
            result = `${point.x},${point.y} ${result}`;
        }
        return result;
    }
    /**
   * Maps the current MS pointer types onto the pointer spec. (scenery-internal)
   */ static msPointerType(event) {
        // @ts-expect-error -- legacy API
        if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_TOUCH) {
            return 'touch';
        } else if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_PEN) {
            return 'pen';
        } else if (event.pointerType === window.MSPointerEvent.MSPOINTER_TYPE_MOUSE) {
            return 'mouse';
        } else {
            return event.pointerType; // hope for the best
        }
    }
    /**
   * @param display
   * @param attachToWindow - Whether to add listeners to the window (instead of the Display's domElement).
   * @param batchDOMEvents - If true, most event types will be batched until otherwise triggered.
   * @param assumeFullWindow - We can optimize certain things like computing points if we know the display
   *                                     fills the entire window.
   * @param passiveEvents - See Display's documentation (controls the presence of the passive flag for
   *                                       events, which has some advanced considerations).
   *
   * @param [providedOptions]
   */ constructor(display, attachToWindow, batchDOMEvents, assumeFullWindow, passiveEvents, providedOptions){
        var _options_tandem, _options_tandem1, _options_tandem2, _options_tandem3, _options_tandem4, _options_tandem5, _options_tandem6, _options_tandem7, _options_tandem8, _options_tandem9, _options_tandem10, _options_tandem11, _options_tandem12, _options_tandem13, _options_tandem14, _options_tandem15, _options_tandem16, _options_tandem17, _options_tandem18, _options_tandem19, _options_tandem20, _options_tandem21, _options_tandem22, _options_tandem23;
        const options = optionize()({
            phetioType: Input.InputIO,
            phetioDocumentation: 'Central point for user input events, such as mouse, touch'
        }, providedOptions);
        super(options), this.currentSceneryEvent = null;
        this.display = display;
        this.rootNode = display.rootNode;
        this.attachToWindow = attachToWindow;
        this.batchDOMEvents = batchDOMEvents;
        this.assumeFullWindow = assumeFullWindow;
        this.passiveEvents = passiveEvents;
        this.batchedEvents = [];
        this.pdomPointer = null;
        this.mouse = null;
        this.pointers = [];
        this.pointerAddedEmitter = new TinyEmitter();
        this.currentlyFiringEvents = false;
        this.upTimeStamp = 0;
        ////////////////////////////////////////////////////
        // Declare the Actions that send scenery input events to the PhET-iO data stream.  Note they use the default value
        // of phetioReadOnly false, in case a client wants to synthesize events.
        this.validatePointersAction = new PhetioAction(()=>{
            let i = this.pointers.length;
            while(i--){
                const pointer = this.pointers[i];
                if (pointer.point && pointer !== this.pdomPointer) {
                    this.branchChangeEvents(pointer, pointer.lastEventContext || EventContext.createSynthetic(), false);
                }
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('validatePointersAction'),
            phetioHighFrequency: true
        });
        this.mouseUpAction = new PhetioAction((point, context)=>{
            const mouse = this.ensureMouse(point);
            mouse.id = null;
            this.upEvent(mouse, context, point);
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('mouseUpAction'),
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a mouse button is released.'
        });
        this.mouseDownAction = new PhetioAction((id, point, context)=>{
            const mouse = this.ensureMouse(point);
            mouse.id = id;
            this.downEvent(mouse, context, point);
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('mouseDownAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NullableIO(NumberIO)
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a mouse button is pressed.'
        });
        this.mouseMoveAction = new PhetioAction((point, context)=>{
            const mouse = this.ensureMouse(point);
            mouse.move(point);
            this.moveEvent(mouse, context);
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.createTandem('mouseMoveAction'),
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the mouse is moved.',
            phetioHighFrequency: true
        });
        this.mouseOverAction = new PhetioAction((point, context)=>{
            const mouse = this.ensureMouse(point);
            mouse.over(point);
        // TODO: how to handle mouse-over (and log it)... are we changing the pointer.point without a branch change? https://github.com/phetsims/scenery/issues/1581
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem4 = options.tandem) == null ? void 0 : _options_tandem4.createTandem('mouseOverAction'),
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the mouse is moved while on the sim.'
        });
        this.mouseOutAction = new PhetioAction((point, context)=>{
            const mouse = this.ensureMouse(point);
            mouse.out(point);
        // TODO: how to handle mouse-out (and log it)... are we changing the pointer.point without a branch change? https://github.com/phetsims/scenery/issues/1581
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem5 = options.tandem) == null ? void 0 : _options_tandem5.createTandem('mouseOutAction'),
            parameters: [
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the mouse moves out of the display.'
        });
        this.wheelScrollAction = new PhetioAction((context)=>{
            const event = context.domEvent;
            const mouse = this.ensureMouse(this.pointFromEvent(event));
            mouse.wheel(event);
            // don't send mouse-wheel events if we don't yet have a mouse location!
            // TODO: Can we set the mouse location based on the wheel event? https://github.com/phetsims/scenery/issues/1581
            if (mouse.point) {
                const trail = this.rootNode.trailUnderPointer(mouse) || new Trail(this.rootNode);
                this.dispatchEvent(trail, 'wheel', mouse, context, true);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem6 = options.tandem) == null ? void 0 : _options_tandem6.createTandem('wheelScrollAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the mouse wheel scrolls.',
            phetioHighFrequency: true
        });
        this.touchStartAction = new PhetioAction((id, point, context)=>{
            const touch = new Touch(id, point, context.domEvent);
            this.addPointer(touch);
            this.downEvent(touch, context, point);
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem7 = options.tandem) == null ? void 0 : _options_tandem7.createTandem('touchStartAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a touch begins.'
        });
        this.touchEndAction = new PhetioAction((id, point, context)=>{
            const touch = this.findPointerById(id);
            if (touch) {
                assert && assert(touch instanceof Touch); // eslint-disable-line phet/no-simple-type-checking-assertions, phet/bad-sim-text
                this.upEvent(touch, context, point);
                this.removePointer(touch);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem8 = options.tandem) == null ? void 0 : _options_tandem8.createTandem('touchEndAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a touch ends.'
        });
        this.touchMoveAction = new PhetioAction((id, point, context)=>{
            const touch = this.findPointerById(id);
            if (touch) {
                assert && assert(touch instanceof Touch); // eslint-disable-line phet/no-simple-type-checking-assertions, phet/bad-sim-text
                touch.move(point);
                this.moveEvent(touch, context);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem9 = options.tandem) == null ? void 0 : _options_tandem9.createTandem('touchMoveAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a touch moves.',
            phetioHighFrequency: true
        });
        this.touchCancelAction = new PhetioAction((id, point, context)=>{
            const touch = this.findPointerById(id);
            if (touch) {
                assert && assert(touch instanceof Touch); // eslint-disable-line phet/no-simple-type-checking-assertions, phet/bad-sim-text
                this.cancelEvent(touch, context, point);
                this.removePointer(touch);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem10 = options.tandem) == null ? void 0 : _options_tandem10.createTandem('touchCancelAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a touch is canceled.'
        });
        this.penStartAction = new PhetioAction((id, point, context)=>{
            const pen = new Pen(id, point, context.domEvent);
            this.addPointer(pen);
            this.downEvent(pen, context, point);
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem11 = options.tandem) == null ? void 0 : _options_tandem11.createTandem('penStartAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pen touches the screen.'
        });
        this.penEndAction = new PhetioAction((id, point, context)=>{
            const pen = this.findPointerById(id);
            if (pen) {
                this.upEvent(pen, context, point);
                this.removePointer(pen);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem12 = options.tandem) == null ? void 0 : _options_tandem12.createTandem('penEndAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pen is lifted.'
        });
        this.penMoveAction = new PhetioAction((id, point, context)=>{
            const pen = this.findPointerById(id);
            if (pen) {
                pen.move(point);
                this.moveEvent(pen, context);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem13 = options.tandem) == null ? void 0 : _options_tandem13.createTandem('penMoveAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pen is moved.',
            phetioHighFrequency: true
        });
        this.penCancelAction = new PhetioAction((id, point, context)=>{
            const pen = this.findPointerById(id);
            if (pen) {
                this.cancelEvent(pen, context, point);
                this.removePointer(pen);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem14 = options.tandem) == null ? void 0 : _options_tandem14.createTandem('penCancelAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'point',
                    phetioType: Vector2.Vector2IO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pen is canceled.'
        });
        this.gotPointerCaptureAction = new PhetioAction((id, context)=>{
            const pointer = this.findPointerById(id);
            if (pointer) {
                pointer.onGotPointerCapture();
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem15 = options.tandem) == null ? void 0 : _options_tandem15.createTandem('gotPointerCaptureAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pointer is captured (normally at the start of an interaction)',
            phetioHighFrequency: true
        });
        this.lostPointerCaptureAction = new PhetioAction((id, context)=>{
            const pointer = this.findPointerById(id);
            if (pointer) {
                // While investigating https://github.com/phetsims/mean-share-and-balance/issues/336 it was discovered that
                // pointerUp events were not being transmitted before lostPointerCapture events by the browser. This was
                // surprising since the spec says otherwise: https://w3c.github.io/pointerevents/#implicit-release-of-pointer-capture
                // This behavior was found to be occurring while using a mac trackpad with finger movements that could
                // potentially be perceived as gesture. The following setTimeout gives the pointerUp event a chance to fire first
                // before the lostPointerCapture event so that listeners can rely on the expected order.
                stepTimer.setTimeout(()=>{
                    pointer.onLostPointerCapture();
                }, 2);
            }
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem16 = options.tandem) == null ? void 0 : _options_tandem16.createTandem('lostPointerCaptureAction'),
            parameters: [
                {
                    name: 'id',
                    phetioType: NumberIO
                },
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when a pointer loses its capture (normally at the end of an interaction)',
            phetioHighFrequency: true
        });
        this.focusinAction = new PhetioAction((context)=>{
            const trail = this.getPDOMEventTrail(context.domEvent, 'focusin');
            if (!trail) {
                return;
            }
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusin(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            this.dispatchPDOMEvent(trail, 'focus', context, false);
            this.dispatchPDOMEvent(trail, 'focusin', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem17 = options.tandem) == null ? void 0 : _options_tandem17.createTandem('focusinAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the focusin DOM event.'
        });
        this.focusoutAction = new PhetioAction((context)=>{
            const trail = this.getPDOMEventTrail(context.domEvent, 'focusout');
            if (!trail) {
                return;
            }
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`focusOut(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            this.dispatchPDOMEvent(trail, 'blur', context, false);
            this.dispatchPDOMEvent(trail, 'focusout', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem18 = options.tandem) == null ? void 0 : _options_tandem18.createTandem('focusoutAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the focusout DOM event.'
        });
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event notes that the click action should result
        // in a MouseEvent
        this.clickAction = new PhetioAction((context)=>{
            const trail = this.getPDOMEventTrail(context.domEvent, 'click');
            if (!trail) {
                return;
            }
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`click(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            this.dispatchPDOMEvent(trail, 'click', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem19 = options.tandem) == null ? void 0 : _options_tandem19.createTandem('clickAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the click DOM event.'
        });
        this.inputAction = new PhetioAction((context)=>{
            const trail = this.getPDOMEventTrail(context.domEvent, 'input');
            if (!trail) {
                return;
            }
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`input(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            this.dispatchPDOMEvent(trail, 'input', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem20 = options.tandem) == null ? void 0 : _options_tandem20.createTandem('inputAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the input DOM event.'
        });
        this.changeAction = new PhetioAction((context)=>{
            const trail = this.getPDOMEventTrail(context.domEvent, 'change');
            if (!trail) {
                return;
            }
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`change(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            this.dispatchPDOMEvent(trail, 'change', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem21 = options.tandem) == null ? void 0 : _options_tandem21.createTandem('changeAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the change DOM event.'
        });
        this.keydownAction = new PhetioAction((context)=>{
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`keydown(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            const trail = this.getPDOMEventTrail(context.domEvent, 'keydown');
            trail && this.dispatchPDOMEvent(trail, 'keydown', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem22 = options.tandem) == null ? void 0 : _options_tandem22.createTandem('keydownAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the keydown DOM event.'
        });
        this.keyupAction = new PhetioAction((context)=>{
            sceneryLog && sceneryLog.Input && sceneryLog.Input(`keyup(${Input.debugText(null, context.domEvent)});`);
            sceneryLog && sceneryLog.Input && sceneryLog.push();
            const trail = this.getPDOMEventTrail(context.domEvent, 'keydown');
            trail && this.dispatchPDOMEvent(trail, 'keyup', context, true);
            sceneryLog && sceneryLog.Input && sceneryLog.pop();
        }, {
            phetioPlayback: true,
            tandem: (_options_tandem23 = options.tandem) == null ? void 0 : _options_tandem23.createTandem('keyupAction'),
            parameters: [
                {
                    name: 'context',
                    phetioType: EventContextIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Emits when the PDOM root gets the keyup DOM event.'
        });
    }
};
Input.InputIO = new IOType('InputIO', {
    valueType: Input,
    applyState: _.noop,
    toStateObject: (input)=>{
        return {
            pointers: ArrayIOPointerIO.toStateObject(input.pointers)
        };
    },
    stateSchema: {
        pointers: ArrayIOPointerIO
    }
});
export { Input as default };
scenery.register('Input', Input);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvSW5wdXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWFpbiBoYW5kbGVyIGZvciB1c2VyLWlucHV0IGV2ZW50cyBpbiBTY2VuZXJ5LlxuICpcbiAqICoqKiBBZGRpbmcgaW5wdXQgaGFuZGxpbmcgdG8gYSBkaXNwbGF5XG4gKlxuICogRGlzcGxheXMgZG8gbm90IGhhdmUgZXZlbnQgbGlzdGVuZXJzIGF0dGFjaGVkIGJ5IGRlZmF1bHQuIFRvIGluaXRpYWxpemUgdGhlIGV2ZW50IHN5c3RlbSAodGhhdCB3aWxsIHNldCB1cFxuICogbGlzdGVuZXJzKSwgdXNlIG9uZSBvZiBEaXNwbGF5J3MgaW5pdGlhbGl6ZSpFdmVudHMgZnVuY3Rpb25zLlxuICpcbiAqICoqKiBQb2ludGVyc1xuICpcbiAqIEEgJ3BvaW50ZXInIGlzIGFuIGFic3RyYWN0IHdheSBvZiBkZXNjcmliaW5nIGEgbW91c2UsIGEgc2luZ2xlIHRvdWNoIHBvaW50LCBvciBhIHBlbi9zdHlsdXMsIHNpbWlsYXIgdG8gaW4gdGhlXG4gKiBQb2ludGVyIEV2ZW50cyBzcGVjaWZpY2F0aW9uIChodHRwczovL2R2Y3MudzMub3JnL2hnL3BvaW50ZXJldmVudHMvcmF3LWZpbGUvdGlwL3BvaW50ZXJFdmVudHMuaHRtbCkuIFRvdWNoIGFuZCBwZW5cbiAqIHBvaW50ZXJzIGFyZSB0cmFuc2llbnQsIGNyZWF0ZWQgd2hlbiB0aGUgcmVsZXZhbnQgRE9NIGRvd24gZXZlbnQgb2NjdXJzIGFuZCByZWxlYXNlZCB3aGVuIGNvcnJlc3BvbmRpbmcgdGhlIERPTSB1cFxuICogb3IgY2FuY2VsIGV2ZW50IG9jY3Vycy4gSG93ZXZlciwgdGhlIG1vdXNlIHBvaW50ZXIgaXMgcGVyc2lzdGVudC5cbiAqXG4gKiBJbnB1dCBldmVudCBsaXN0ZW5lcnMgY2FuIGJlIGFkZGVkIHRvIHtOb2RlfXMgZGlyZWN0bHksIG9yIHRvIGEgcG9pbnRlci4gV2hlbiBhIERPTSBldmVudCBpcyByZWNlaXZlZCwgaXQgaXMgZmlyc3RcbiAqIGJyb2tlbiB1cCBpbnRvIG11bHRpcGxlIGV2ZW50cyAoaWYgbmVjZXNzYXJ5LCBlLmcuIG11bHRpcGxlIHRvdWNoIHBvaW50cyksIHRoZW4gdGhlIGRpc3BhdGNoIGlzIGhhbmRsZWQgZm9yIGVhY2hcbiAqIGluZGl2aWR1YWwgU2NlbmVyeSBldmVudC4gRXZlbnRzIGFyZSBmaXJzdCBmaXJlZCBmb3IgYW55IGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGUgcG9pbnRlciB0aGF0IGNhdXNlZCB0aGUgZXZlbnQsXG4gKiB0aGVuIGZpcmUgb24gdGhlIG5vZGUgZGlyZWN0bHkgdW5kZXIgdGhlIHBvaW50ZXIsIGFuZCBpZiBhcHBsaWNhYmxlLCBidWJibGUgdXAgdGhlIGdyYXBoIHRvIHRoZSBTY2VuZSBmcm9tIHdoaWNoIHRoZVxuICogZXZlbnQgd2FzIHRyaWdnZXJlZC4gRXZlbnRzIGFyZSBub3QgZmlyZWQgZGlyZWN0bHkgb24gbm9kZXMgdGhhdCBhcmUgbm90IHVuZGVyIHRoZSBwb2ludGVyIGF0IHRoZSB0aW1lIG9mIHRoZSBldmVudC5cbiAqIFRvIGhhbmRsZSBtYW55IGNvbW1vbiBwYXR0ZXJucyAobGlrZSBidXR0b24gcHJlc3Nlcywgd2hlcmUgbW91c2UtdXBzIGNvdWxkIGhhcHBlbiB3aGVuIG5vdCBvdmVyIHRoZSBidXR0b24pLCBpdCBpc1xuICogbmVjZXNzYXJ5IHRvIGFkZCB0aG9zZSBtb3ZlL3VwIGxpc3RlbmVycyB0byB0aGUgcG9pbnRlciBpdHNlbGYuXG4gKlxuICogKioqIExpc3RlbmVycyBhbmQgRXZlbnRzXG4gKlxuICogRXZlbnQgbGlzdGVuZXJzIGFyZSBhZGRlZCB3aXRoIG5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbGlzdGVuZXIgKSwgcG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApIGFuZFxuICogZGlzcGxheS5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApLlxuICogVGhpcyBsaXN0ZW5lciBjYW4gYmUgYW4gYXJiaXRyYXJ5IG9iamVjdCwgYW5kIHRoZSBsaXN0ZW5lciB3aWxsIGJlIHRyaWdnZXJlZCBieSBjYWxsaW5nIGxpc3RlbmVyW2V2ZW50VHlwZV0oIGV2ZW50ICksXG4gKiB3aGVyZSBldmVudFR5cGUgaXMgb25lIG9mIHRoZSBldmVudCB0eXBlcyBhcyBkZXNjcmliZWQgYmVsb3csIGFuZCBldmVudCBpcyBhIFNjZW5lcnkgZXZlbnQgd2l0aCB0aGVcbiAqIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogLSB0cmFpbCB7VHJhaWx9IC0gUG9pbnRzIHRvIHRoZSBub2RlIHVuZGVyIHRoZSBwb2ludGVyXG4gKiAtIHBvaW50ZXIge1BvaW50ZXJ9IC0gVGhlIHBvaW50ZXIgdGhhdCB0cmlnZ2VyZWQgdGhlIGV2ZW50LiBBZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBtb3VzZS90b3VjaC9wZW4gY2FuIGJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgb2J0YWluZWQgZnJvbSB0aGUgcG9pbnRlciwgZm9yIGV4YW1wbGUgZXZlbnQucG9pbnRlci5wb2ludC5cbiAqIC0gdHlwZSB7c3RyaW5nfSAtIFRoZSBiYXNlIHR5cGUgb2YgdGhlIGV2ZW50IChlLmcuIGZvciB0b3VjaCBkb3duIGV2ZW50cywgaXQgd2lsbCBhbHdheXMganVzdCBiZSBcImRvd25cIikuXG4gKiAtIGRvbUV2ZW50IHtVSUV2ZW50fSAtIFRoZSB1bmRlcmx5aW5nIERPTSBldmVudCB0aGF0IHRyaWdnZXJlZCB0aGlzIFNjZW5lcnkgZXZlbnQuIFRoZSBET00gZXZlbnQgbWF5IGNvcnJlc3BvbmQgdG9cbiAqICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGUgU2NlbmVyeSBldmVudHMsIHBhcnRpY3VsYXJseSBmb3IgdG91Y2ggZXZlbnRzLiBUaGlzIGNvdWxkIGJlIGEgVG91Y2hFdmVudCxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgUG9pbnRlckV2ZW50LCBNb3VzZUV2ZW50LCBNU1BvaW50ZXJFdmVudCwgZXRjLlxuICogLSB0YXJnZXQge05vZGV9IC0gVGhlIGxlYWYtbW9zdCBOb2RlIGluIHRoZSB0cmFpbC5cbiAqIC0gY3VycmVudFRhcmdldCB7Tm9kZX0gLSBUaGUgTm9kZSB0byB3aGljaCB0aGUgbGlzdGVuZXIgYmVpbmcgZmlyZWQgaXMgYXR0YWNoZWQsIG9yIG51bGwgaWYgdGhlIGxpc3RlbmVyIGlzIGJlaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWQgZGlyZWN0bHkgZnJvbSBhIHBvaW50ZXIuXG4gKlxuICogQWRkaXRpb25hbGx5LCBsaXN0ZW5lcnMgbWF5IHN1cHBvcnQgYW4gaW50ZXJydXB0KCkgbWV0aG9kIHRoYXQgZGV0YWNoZXMgaXQgZnJvbSBwb2ludGVycywgb3IgbWF5IHN1cHBvcnQgYmVpbmdcbiAqIFwiYXR0YWNoZWRcIiB0byBhIHBvaW50ZXIgKGluZGljYXRpbmcgYSBwcmltYXJ5IHJvbGUgaW4gY29udHJvbGxpbmcgdGhlIHBvaW50ZXIncyBiZWhhdmlvcikuIFNlZSBQb2ludGVyIGZvciBtb3JlXG4gKiBpbmZvcm1hdGlvbiBhYm91dCB0aGVzZSBpbnRlcmFjdGlvbnMuXG4gKlxuICogKioqIEV2ZW50IFR5cGVzXG4gKlxuICogU2NlbmVyeSB3aWxsIGZpcmUgdGhlIGZvbGxvd2luZyBiYXNlIGV2ZW50IHR5cGVzOlxuICpcbiAqIC0gZG93bjogVHJpZ2dlcmVkIHdoZW4gYSBwb2ludGVyIGlzIHByZXNzZWQgZG93bi4gVG91Y2ggLyBwZW4gcG9pbnRlcnMgYXJlIGNyZWF0ZWQgZm9yIGVhY2ggZG93biBldmVudCwgYW5kIGFyZVxuICogICAgICAgICBhY3RpdmUgdW50aWwgYW4gdXAvY2FuY2VsIGV2ZW50IGlzIHNlbnQuXG4gKiAtIHVwOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgaXMgcmVsZWFzZWQgbm9ybWFsbHkuIFRvdWNoIC8gcGVuIHBvaW50ZXJzIHdpbGwgbm90IGhhdmUgYW55IG1vcmUgZXZlbnRzIGFzc29jaWF0ZWRcbiAqICAgICAgIHdpdGggdGhlbSBhZnRlciBhbiB1cCBldmVudC5cbiAqIC0gY2FuY2VsOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgaXMgY2FuY2VsZWQgYWJub3JtYWxseS4gVG91Y2ggLyBwZW4gcG9pbnRlcnMgd2lsbCBub3QgaGF2ZSBhbnkgbW9yZSBldmVudHNcbiAqICAgICAgICAgICBhc3NvY2lhdGVkIHdpdGggdGhlbSBhZnRlciBhbiB1cCBldmVudC5cbiAqIC0gbW92ZTogVHJpZ2dlcmVkIHdoZW4gYSBwb2ludGVyIG1vdmVzLlxuICogLSB3aGVlbDogVHJpZ2dlcmVkIHdoZW4gdGhlIChtb3VzZSkgd2hlZWwgaXMgc2Nyb2xsZWQuIFRoZSBhc3NvY2lhdGVkIHBvaW50ZXIgd2lsbCBoYXZlIHdoZWVsRGVsdGEgaW5mb3JtYXRpb24uXG4gKiAtIGVudGVyOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3ZlciBhIE5vZGUgb3Igb25lIG9mIGl0cyBjaGlsZHJlbi4gRG9lcyBub3QgYnViYmxlIHVwLiBNaXJyb3JzIGJlaGF2aW9yIGZyb21cbiAqICAgICAgICAgIHRoZSBET00gbW91c2VlbnRlciAoaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudC10eXBlLW1vdXNlZW50ZXIpXG4gKiAtIGV4aXQ6ICBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3V0IGZyb20gb3ZlciBhIE5vZGUgb3Igb25lIG9mIGl0cyBjaGlsZHJlbi4gRG9lcyBub3QgYnViYmxlIHVwLiBNaXJyb3JzXG4gKiAgICAgICAgICBiZWhhdmlvciBmcm9tIHRoZSBET00gbW91c2VsZWF2ZSAoaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudC10eXBlLW1vdXNlbGVhdmUpLlxuICogLSBvdmVyOiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3ZlciBhIE5vZGUgKG5vdCBpbmNsdWRpbmcgaXRzIGNoaWxkcmVuKS4gTWlycm9ycyBiZWhhdmlvciBmcm9tIHRoZSBET01cbiAqICAgICAgICAgbW91c2VvdmVyIChodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2V2ZW50LXR5cGUtbW91c2VvdmVyKS5cbiAqIC0gb3V0OiBUcmlnZ2VyZWQgd2hlbiBhIHBvaW50ZXIgbW92ZXMgb3V0IGZyb20gb3ZlciBhIE5vZGUgKG5vdCBpbmNsdWRpbmcgaXRzIGNoaWxkcmVuKS4gTWlycm9ycyBiZWhhdmlvciBmcm9tIHRoZVxuICogICAgICAgIERPTSBtb3VzZW91dCAoaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudC10eXBlLW1vdXNlb3V0KS5cbiAqXG4gKiBCZWZvcmUgZmlyaW5nIHRoZSBiYXNlIGV2ZW50IHR5cGUgKGZvciBleGFtcGxlLCAnbW92ZScpLCBTY2VuZXJ5IHdpbGwgYWxzbyBmaXJlIGFuIGV2ZW50IHNwZWNpZmljIHRvIHRoZSB0eXBlIG9mXG4gKiBwb2ludGVyLiBGb3IgbWljZSwgaXQgd2lsbCBmaXJlICdtb3VzZW1vdmUnLCBmb3IgdG91Y2ggZXZlbnRzIGl0IHdpbGwgZmlyZSAndG91Y2htb3ZlJywgYW5kIGZvciBwZW4gZXZlbnRzIGl0IHdpbGxcbiAqIGZpcmUgJ3Blbm1vdmUnLiBTaW1pbGFybHksIGZvciBhbnkgdHlwZSBvZiBldmVudCwgaXQgd2lsbCBmaXJzdCBmaXJlIHBvaW50ZXJUeXBlK2V2ZW50VHlwZSwgYW5kIHRoZW4gZXZlbnRUeXBlLlxuICpcbiAqICoqKiogUERPTSBTcGVjaWZpYyBFdmVudCBUeXBlc1xuICpcbiAqIFNvbWUgZXZlbnQgdHlwZXMgY2FuIG9ubHkgYmUgdHJpZ2dlcmVkIGZyb20gdGhlIFBET00uIElmIGEgU0NFTkVSWS9Ob2RlIGhhcyBhY2Nlc3NpYmxlIGNvbnRlbnQgKHNlZVxuICogUGFyYWxsZWxET00uanMgZm9yIG1vcmUgaW5mbyksIHRoZW4gbGlzdGVuZXJzIGNhbiBiZSBhZGRlZCBmb3IgZXZlbnRzIGZpcmVkIGZyb20gdGhlIFBET00uIFRoZSBhY2Nlc3NpYmlsaXR5IGV2ZW50c1xuICogdHJpZ2dlcmVkIGZyb20gYSBOb2RlIGFyZSBkZXBlbmRlbnQgb24gdGhlIGB0YWdOYW1lYCAoZXJnbyB0aGUgSFRNTEVsZW1lbnQgcHJpbWFyeSBzaWJsaW5nKSBzcGVjaWZpZWQgYnkgdGhlIE5vZGUuXG4gKlxuICogU29tZSB0ZXJtaW5vbG9neSBmb3IgdW5kZXJzdGFuZGluZzpcbiAqIC0gUERPTTogIHBhcmFsbGVsIERPTSwgc2VlIFBhcmFsbGVsRE9NLmpzXG4gKiAtIFByaW1hcnkgU2libGluZzogIFRoZSBOb2RlJ3MgSFRNTEVsZW1lbnQgaW4gdGhlIFBET00gdGhhdCBpcyBpbnRlcmFjdGVkIHdpdGggZm9yIGFjY2Vzc2libGUgaW50ZXJhY3Rpb25zIGFuZCB0b1xuICogICAgICAgICAgICAgICAgICAgICBkaXNwbGF5IGFjY2Vzc2libGUgY29udGVudC4gVGhlIHByaW1hcnkgc2libGluZyBoYXMgdGhlIHRhZyBuYW1lIHNwZWNpZmllZCBieSB0aGUgYHRhZ05hbWVgXG4gKiAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiwgc2VlIGBQYXJhbGxlbERPTS5zZXRUYWdOYW1lYC4gUHJpbWFyeSBzaWJsaW5nIGlzIGZ1cnRoZXIgZGVmaW5lZCBpbiBQRE9NUGVlci5qc1xuICogLSBBc3Npc3RpdmUgVGVjaG5vbG9neTogIGFrYSBBVCwgZGV2aWNlcyBtZWFudCB0byBpbXByb3ZlIHRoZSBjYXBhYmlsaXRpZXMgb2YgYW4gaW5kaXZpZHVhbCB3aXRoIGEgZGlzYWJpbGl0eS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGFyZSB0aGUgc3VwcG9ydGVkIGFjY2Vzc2libGUgZXZlbnRzOlxuICpcbiAqIC0gZm9jdXM6IFRyaWdnZXJlZCB3aGVuIG5hdmlnYXRpb24gZm9jdXMgaXMgc2V0IHRvIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZy4gVGhpcyBjYW4gYmUgdHJpZ2dlcmVkIHdpdGggc29tZVxuICogICAgICAgICAgQVQgdG9vLCBsaWtlIHNjcmVlbiByZWFkZXJzJyB2aXJ0dWFsIGN1cnNvciwgYnV0IHRoYXQgaXMgbm90IGRlcGVuZGFibGUgYXMgaXQgY2FuIGJlIHRvZ2dsZWQgd2l0aCBhIHNjcmVlblxuICogICAgICAgICAgcmVhZGVyIG9wdGlvbi4gRnVydGhlcm1vcmUsIHRoaXMgZXZlbnQgaXMgbm90IHRyaWdnZXJlZCBvbiBtb2JpbGUgZGV2aWNlcy4gRG9lcyBub3QgYnViYmxlLlxuICogLSBmb2N1c2luOiBTYW1lIGFzICdmb2N1cycgZXZlbnQsIGJ1dCBidWJibGVzLlxuICogLSBibHVyOiAgVHJpZ2dlcmVkIHdoZW4gbmF2aWdhdGlvbiBmb2N1cyBsZWF2ZXMgdGhpcyBOb2RlJ3MgcHJpbWFyeSBzaWJsaW5nLiBUaGlzIGNhbiBiZSB0cmlnZ2VyZWQgd2l0aCBzb21lXG4gKiAgICAgICAgICBBVCB0b28sIGxpa2Ugc2NyZWVuIHJlYWRlcnMnIHZpcnR1YWwgY3Vyc29yLCBidXQgdGhhdCBpcyBub3QgZGVwZW5kYWJsZSBhcyBpdCBjYW4gYmUgdG9nZ2xlZCB3aXRoIGEgc2NyZWVuXG4gKiAgICAgICAgICByZWFkZXIgb3B0aW9uLiBGdXJ0aGVybW9yZSwgdGhpcyBldmVudCBpcyBub3QgdHJpZ2dlcmVkIG9uIG1vYmlsZSBkZXZpY2VzLlxuICogLSBmb2N1c291dDogU2FtZSBhcyAnYmx1cicgZXZlbnQsIGJ1dCBidWJibGVzLlxuICogLSBjbGljazogIFRyaWdnZXJlZCB3aGVuIHRoaXMgTm9kZSdzIHByaW1hcnkgc2libGluZyBpcyBjbGlja2VkLiBOb3RlLCB0aG91Z2ggdGhpcyBldmVudCBzZWVtcyBzaW1pbGFyIHRvIHNvbWUgYmFzZVxuICogICAgICAgICAgIGV2ZW50IHR5cGVzICh0aGUgZXZlbnQgaW1wbGVtZW50cyBgTW91c2VFdmVudGApLCBpdCBvbmx5IGFwcGxpZXMgd2hlbiB0cmlnZ2VyZWQgZnJvbSB0aGUgUERPTS5cbiAqICAgICAgICAgICBTZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL0RPTS1MZXZlbC0zLUV2ZW50cy8jY2xpY2tcbiAqIC0gaW5wdXQ6ICBUcmlnZ2VyZWQgd2hlbiB0aGUgdmFsdWUgb2YgYW4gPGlucHV0PiwgPHNlbGVjdD4sIG9yIDx0ZXh0YXJlYT4gZWxlbWVudCBoYXMgYmVlbiBjaGFuZ2VkLlxuICogICAgICAgICAgIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNpbnB1dFxuICogLSBjaGFuZ2U6ICBUcmlnZ2VyZWQgZm9yIDxpbnB1dD4sIDxzZWxlY3Q+LCBhbmQgPHRleHRhcmVhPiBlbGVtZW50cyB3aGVuIGFuIGFsdGVyYXRpb24gdG8gdGhlIGVsZW1lbnQncyB2YWx1ZSBpc1xuICogICAgICAgICAgICBjb21taXR0ZWQgYnkgdGhlIHVzZXIuIFVubGlrZSB0aGUgaW5wdXQgZXZlbnQsIHRoZSBjaGFuZ2UgZXZlbnQgaXMgbm90IG5lY2Vzc2FyaWx5IGZpcmVkIGZvciBlYWNoXG4gKiAgICAgICAgICAgIGFsdGVyYXRpb24gdG8gYW4gZWxlbWVudCdzIHZhbHVlLiBTZWVcbiAqICAgICAgICAgICAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxFbGVtZW50L2NoYW5nZV9ldmVudCBhbmRcbiAqICAgICAgICAgICAgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sI2V2ZW50LWNoYW5nZVxuICogLSBrZXlkb3duOiBUcmlnZ2VyZWQgZm9yIGFsbCBrZXlzIHByZXNzZWQuIFdoZW4gYSBzY3JlZW4gcmVhZGVyIGlzIGFjdGl2ZSwgdGhpcyBldmVudCB3aWxsIGJlIG9taXR0ZWRcbiAqICAgICAgICAgICAgcm9sZT1cImJ1dHRvblwiIGlzIGFjdGl2YXRlZC5cbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2tleWRvd25cbiAqIC0ga2V5dXAgOiAgVHJpZ2dlcmVkIGZvciBhbGwga2V5cyB3aGVuIHJlbGVhc2VkLiBXaGVuIGEgc2NyZWVuIHJlYWRlciBpcyBhY3RpdmUsIHRoaXMgZXZlbnQgd2lsbCBiZSBvbWl0dGVkXG4gKiAgICAgICAgICAgIHJvbGU9XCJidXR0b25cIiBpcyBhY3RpdmF0ZWQuXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNrZXl1cFxuICpcbiAqICoqKiBFdmVudCBEaXNwYXRjaFxuICpcbiAqIEV2ZW50cyBoYXZlIHR3byBtZXRob2RzIHRoYXQgd2lsbCBjYXVzZSBlYXJseSB0ZXJtaW5hdGlvbjogZXZlbnQuYWJvcnQoKSB3aWxsIGNhdXNlIG5vIG1vcmUgbGlzdGVuZXJzIHRvIGJlIG5vdGlmaWVkXG4gKiBmb3IgdGhpcyBldmVudCwgYW5kIGV2ZW50LmhhbmRsZSgpIHdpbGwgYWxsb3cgdGhlIGN1cnJlbnQgbGV2ZWwgb2YgbGlzdGVuZXJzIHRvIGJlIG5vdGlmaWVkIChhbGwgcG9pbnRlciBsaXN0ZW5lcnMsXG4gKiBvciBhbGwgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBjdXJyZW50IG5vZGUpLCBidXQgbm8gbW9yZSBsaXN0ZW5lcnMgYWZ0ZXIgdGhhdCBsZXZlbCB3aWxsIGZpcmUuIGhhbmRsZSBhbmQgYWJvcnRcbiAqIGFyZSBsaWtlIHN0b3BQcm9wYWdhdGlvbiwgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIGZvciBET00gZXZlbnRzLCBleGNlcHQgdGhleSBkbyBub3QgdHJpZ2dlciB0aG9zZSBET00gbWV0aG9kcyBvblxuICogdGhlIHVuZGVybHlpbmcgRE9NIGV2ZW50LlxuICpcbiAqIFVwL2Rvd24vY2FuY2VsIGV2ZW50cyBhbGwgaGFwcGVuIHNlcGFyYXRlbHksIGJ1dCBmb3IgbW92ZSBldmVudHMsIGEgc3BlY2lmaWMgc2VxdWVuY2Ugb2YgZXZlbnRzIG9jY3VycyBpZiB0aGUgcG9pbnRlclxuICogY2hhbmdlcyB0aGUgbm9kZSBpdCBpcyBvdmVyOlxuICpcbiAqIDEuIFRoZSBtb3ZlIGV2ZW50IGlzIGZpcmVkIChhbmQgYnViYmxlcykuXG4gKiAyLiBBbiBvdXQgZXZlbnQgaXMgZmlyZWQgZm9yIHRoZSBvbGQgdG9wbW9zdCBOb2RlIChhbmQgYnViYmxlcykuXG4gKiAzLiBleGl0IGV2ZW50cyBhcmUgZmlyZWQgZm9yIGFsbCBOb2RlcyBpbiB0aGUgVHJhaWwgaGllcmFyY2h5IHRoYXQgYXJlIG5vdyBub3QgdW5kZXIgdGhlIHBvaW50ZXIsIGZyb20gdGhlIHJvb3QtbW9zdFxuICogICAgdG8gdGhlIGxlYWYtbW9zdC4gRG9lcyBub3QgYnViYmxlLlxuICogNC4gZW50ZXIgZXZlbnRzIGFyZSBmaXJlZCBmb3IgYWxsIE5vZGVzIGluIHRoZSBUcmFpbCBoaWVyYXJjaHkgdGhhdCB3ZXJlIG5vdCB1bmRlciB0aGUgcG9pbnRlciAoYnV0IG5vdyBhcmUpLCBmcm9tXG4gKiAgICB0aGUgbGVhZi1tb3N0IHRvIHRoZSByb290LW1vc3QuIERvZXMgbm90IGJ1YmJsZS5cbiAqIDUuIEFuIG92ZXIgZXZlbnQgaXMgZmlyZWQgZm9yIHRoZSBuZXcgdG9wbW9zdCBOb2RlIChhbmQgYnViYmxlcykuXG4gKlxuICogZXZlbnQuYWJvcnQoKSBhbmQgZXZlbnQuaGFuZGxlKCkgd2lsbCBjdXJyZW50bHkgbm90IGFmZmVjdCBvdGhlciBzdGFnZXMgaW4gdGhlICdtb3ZlJyBzZXF1ZW5jZSAoZS5nLiBldmVudC5hYm9ydCgpIGluXG4gKiB0aGUgJ21vdmUnIGV2ZW50IHdpbGwgbm90IGFmZmVjdCB0aGUgZm9sbG93aW5nICdvdXQnIGV2ZW50KS5cbiAqXG4gKiBGb3IgZWFjaCBldmVudCB0eXBlOlxuICpcbiAqIDEuIExpc3RlbmVycyBvbiB0aGUgcG9pbnRlciB3aWxsIGJlIHRyaWdnZXJlZCBmaXJzdCAoaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBhZGRlZClcbiAqIDIuIExpc3RlbmVycyBvbiB0aGUgdGFyZ2V0ICh0b3AtbW9zdCkgTm9kZSB3aWxsIGJlIHRyaWdnZXJlZCAoaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSBhZGRlZCB0byB0aGF0IE5vZGUpXG4gKiAzLiBUaGVuIGlmIHRoZSBldmVudCBidWJibGVzLCBlYWNoIE5vZGUgaW4gdGhlIFRyYWlsIHdpbGwgYmUgdHJpZ2dlcmVkLCBzdGFydGluZyBmcm9tIHRoZSBOb2RlIHVuZGVyIHRoZSB0b3AtbW9zdFxuICogICAgKHRoYXQganVzdCBoYWQgbGlzdGVuZXJzIHRyaWdnZXJlZCkgYW5kIGFsbCB0aGUgd2F5IGRvd24gdG8gdGhlIFNjZW5lLiBMaXN0ZW5lcnMgYXJlIHRyaWdnZXJlZCBpbiB0aGUgb3JkZXIgdGhleVxuICogICAgd2VyZSBhZGRlZCBmb3IgZWFjaCBOb2RlLlxuICogNC4gTGlzdGVuZXJzIG9uIHRoZSBkaXNwbGF5IHdpbGwgYmUgdHJpZ2dlcmVkIChpbiB0aGUgb3JkZXIgdGhleSB3ZXJlIGFkZGVkKVxuICpcbiAqIEZvciBlYWNoIGxpc3RlbmVyIGJlaW5nIG5vdGlmaWVkLCBpdCB3aWxsIGZpcmUgdGhlIG1vcmUgc3BlY2lmaWMgcG9pbnRlclR5cGUrZXZlbnRUeXBlIGZpcnN0IChlLmcuICdtb3VzZW1vdmUnKSxcbiAqIHRoZW4gZXZlbnRUeXBlIG5leHQgKGUuZy4gJ21vdmUnKS5cbiAqXG4gKiBDdXJyZW50bHksIHByZXZlbnREZWZhdWx0KCkgaXMgY2FsbGVkIG9uIHRoZSBhc3NvY2lhdGVkIERPTSBldmVudCBpZiB0aGUgdG9wLW1vc3Qgbm9kZSBoYXMgdGhlICdpbnRlcmFjdGl2ZScgcHJvcGVydHlcbiAqIHNldCB0byBhIHRydXRoeSB2YWx1ZS5cbiAqXG4gKiAqKiogUmVsZXZhbnQgU3BlY2lmaWNhdGlvbnNcbiAqXG4gKiBET00gTGV2ZWwgMyBldmVudHMgc3BlYzogaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzL1xuICogVG91Y2ggZXZlbnRzIHNwZWM6IGh0dHA6Ly93d3cudzMub3JnL1RSL3RvdWNoLWV2ZW50cy9cbiAqIFBvaW50ZXIgZXZlbnRzIHNwZWMgZHJhZnQ6IGh0dHBzOi8vZHZjcy53My5vcmcvaGcvcG9pbnRlcmV2ZW50cy9yYXctZmlsZS90aXAvcG9pbnRlckV2ZW50cy5odG1sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvaGg2NzM1NTcodj12cy44NSkuYXNweFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgUGhldGlvQWN0aW9uIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24uanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgQXJyYXlJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQXJyYXlJTy5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgeyBCYXRjaGVkRE9NRXZlbnQsIEJhdGNoZWRET01FdmVudENhbGxiYWNrLCBCYXRjaGVkRE9NRXZlbnRUeXBlLCBCcm93c2VyRXZlbnRzLCBEaXNwbGF5LCBFdmVudENvbnRleHQsIEV2ZW50Q29udGV4dElPLCBNb3VzZSwgTm9kZSwgUERPTUluc3RhbmNlLCBQRE9NUG9pbnRlciwgUERPTVV0aWxzLCBQZW4sIFBvaW50ZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb24sIFN1cHBvcnRlZEV2ZW50VHlwZXMsIFRJbnB1dExpc3RlbmVyLCBUb3VjaCwgVHJhaWwsIFdpbmRvd1RvdWNoIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IEFycmF5SU9Qb2ludGVySU8gPSBBcnJheUlPKCBQb2ludGVyLlBvaW50ZXJJTyApO1xuXG4vLyBUaGlzIGlzIHRoZSBsaXN0IG9mIGtleXMgdGhhdCBnZXQgc2VyaWFsaXplZCBBTkQgZGVzZXJpYWxpemVkLiBOT1RFOiBEbyBub3QgYWRkIG9yIGNoYW5nZSB0aGlzIHdpdGhvdXRcbi8vIGNvbnN1bHRpbmcgdGhlIFBoRVQtaU8gSU9UeXBlIHNjaGVtYSBmb3IgdGhpcyBpbiBFdmVudElPXG5jb25zdCBkb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZSA9IFtcbiAgJ2FsdEtleScsXG4gICdidXR0b24nLFxuICAnY2hhckNvZGUnLFxuICAnY2xpZW50WCcsXG4gICdjbGllbnRZJyxcbiAgJ2NvZGUnLFxuICAnY3RybEtleScsXG4gICdkZWx0YU1vZGUnLFxuICAnZGVsdGFYJyxcbiAgJ2RlbHRhWScsXG4gICdkZWx0YVonLFxuICAna2V5JyxcbiAgJ2tleUNvZGUnLFxuICAnbWV0YUtleScsXG4gICdwYWdlWCcsXG4gICdwYWdlWScsXG4gICdwb2ludGVySWQnLFxuICAncG9pbnRlclR5cGUnLFxuICAnc2NhbGUnLFxuICAnc2hpZnRLZXknLFxuICAndGFyZ2V0JyxcbiAgJ3R5cGUnLFxuICAncmVsYXRlZFRhcmdldCcsXG4gICd3aGljaCdcbl0gYXMgY29uc3Q7XG5cbi8vIFRoZSBsaXN0IG9mIHNlcmlhbGl6ZWQgcHJvcGVydGllcyBuZWVkZWQgZm9yIGRlc2VyaWFsaXphdGlvblxudHlwZSBTZXJpYWxpemVkUHJvcGVydGllc0ZvckRlc2VyaWFsaXphdGlvbiA9IHR5cGVvZiBkb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZVtudW1iZXJdO1xuXG4vLyBDYW5ub3QgYmUgc2V0IGFmdGVyIGNvbnN0cnVjdGlvbiwgYW5kIHNob3VsZCBiZSBwcm92aWRlZCBpbiB0aGUgaW5pdCBjb25maWcgdG8gdGhlIGNvbnN0cnVjdG9yKCksIHNlZSBJbnB1dC5kZXNlcmlhbGl6ZURPTUV2ZW50XG5jb25zdCBkb21FdmVudFByb3BlcnRpZXNTZXRJbkNvbnN0cnVjdG9yOiBTZXJpYWxpemVkUHJvcGVydGllc0ZvckRlc2VyaWFsaXphdGlvbltdID0gW1xuICAnZGVsdGFNb2RlJyxcbiAgJ2RlbHRhWCcsXG4gICdkZWx0YVknLFxuICAnZGVsdGFaJyxcbiAgJ2FsdEtleScsXG4gICdidXR0b24nLFxuICAnY2hhckNvZGUnLFxuICAnY2xpZW50WCcsXG4gICdjbGllbnRZJyxcbiAgJ2NvZGUnLFxuICAnY3RybEtleScsXG4gICdrZXknLFxuICAna2V5Q29kZScsXG4gICdtZXRhS2V5JyxcbiAgJ3BhZ2VYJyxcbiAgJ3BhZ2VZJyxcbiAgJ3BvaW50ZXJJZCcsXG4gICdwb2ludGVyVHlwZScsXG4gICdzaGlmdEtleScsXG4gICd0eXBlJyxcbiAgJ3JlbGF0ZWRUYXJnZXQnLFxuICAnd2hpY2gnXG5dO1xuXG50eXBlIFNlcmlhbGl6ZWRET01FdmVudCA9IHtcbiAgY29uc3RydWN0b3JOYW1lOiBzdHJpbmc7IC8vIHVzZWQgdG8gZ2V0IHRoZSBjb25zdHJ1Y3RvciBmcm9tIHRoZSB3aW5kb3cgb2JqZWN0LCBzZWUgSW5wdXQuZGVzZXJpYWxpemVET01FdmVudFxufSAmIFBhcnRpYWw8UmVjb3JkPFNlcmlhbGl6ZWRQcm9wZXJ0aWVzRm9yRGVzZXJpYWxpemF0aW9uLCB1bmtub3duPj47XG5cbi8vIEEgbGlzdCBvZiBrZXlzIG9uIGV2ZW50cyB0aGF0IG5lZWQgdG8gYmUgc2VyaWFsaXplZCBpbnRvIEhUTUxFbGVtZW50c1xuY29uc3QgRVZFTlRfS0VZX1ZBTFVFU19BU19FTEVNRU5UUzogU2VyaWFsaXplZFByb3BlcnRpZXNGb3JEZXNlcmlhbGl6YXRpb25bXSA9IFsgJ3RhcmdldCcsICdyZWxhdGVkVGFyZ2V0JyBdO1xuXG4vLyBBIGxpc3Qgb2YgZXZlbnRzIHRoYXQgc2hvdWxkIHN0aWxsIGZpcmUsIGV2ZW4gd2hlbiB0aGUgTm9kZSBpcyBub3QgcGlja2FibGVcbmNvbnN0IFBET01fVU5QSUNLQUJMRV9FVkVOVFMgPSBbICdmb2N1cycsICdibHVyJywgJ2ZvY3VzaW4nLCAnZm9jdXNvdXQnIF07XG5jb25zdCBUQVJHRVRfU1VCU1RJVFVURV9LRVkgPSAndGFyZ2V0U3Vic3RpdHV0ZSc7XG50eXBlIFRhcmdldFN1YnN0aXR1ZGVBdWdtZW50ZWRFdmVudCA9IEV2ZW50ICYge1xuICBbIFRBUkdFVF9TVUJTVElUVVRFX0tFWSBdPzogRWxlbWVudDtcbn07XG5cblxuLy8gQSBiaXQgbW9yZSB0aGFuIHRoZSBtYXhpbXVtIGFtb3VudCBvZiB0aW1lIHRoYXQgaU9TIDE0IFZvaWNlT3ZlciB3YXMgb2JzZXJ2ZWQgdG8gZGVsYXkgYmV0d2VlblxuLy8gc2VuZGluZyBhIG1vdXNldXAgZXZlbnQgYW5kIGEgY2xpY2sgZXZlbnQuXG5jb25zdCBQRE9NX0NMSUNLX0RFTEFZID0gODA7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBJbnB1dE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0IGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcblxuICBwdWJsaWMgcmVhZG9ubHkgZGlzcGxheTogRGlzcGxheTtcbiAgcHVibGljIHJlYWRvbmx5IHJvb3ROb2RlOiBOb2RlO1xuXG4gIHB1YmxpYyByZWFkb25seSBhdHRhY2hUb1dpbmRvdzogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IGJhdGNoRE9NRXZlbnRzOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgYXNzdW1lRnVsbFdpbmRvdzogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IHBhc3NpdmVFdmVudHM6IGJvb2xlYW4gfCBudWxsO1xuXG4gIC8vIFBvaW50ZXIgZm9yIGFjY2Vzc2liaWxpdHksIG9ubHkgY3JlYXRlZCBsYXppbHkgb24gZmlyc3QgcGRvbSBldmVudC5cbiAgcHVibGljIHBkb21Qb2ludGVyOiBQRE9NUG9pbnRlciB8IG51bGw7XG5cbiAgLy8gUG9pbnRlciBmb3IgbW91c2UsIG9ubHkgY3JlYXRlZCBsYXppbHkgb24gZmlyc3QgbW91c2UgZXZlbnQsIHNvIG5vIG1vdXNlIGlzIGFsbG9jYXRlZCBvbiB0YWJsZXRzLlxuICBwdWJsaWMgbW91c2U6IE1vdXNlIHwgbnVsbDtcblxuICAvLyBBbGwgYWN0aXZlIHBvaW50ZXJzLlxuICBwdWJsaWMgcG9pbnRlcnM6IFBvaW50ZXJbXTtcblxuICBwdWJsaWMgcG9pbnRlckFkZGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBQb2ludGVyIF0+O1xuXG4gIC8vIFdoZXRoZXIgd2UgYXJlIGN1cnJlbnRseSBmaXJpbmcgZXZlbnRzLiBXZSBuZWVkIHRvIHRyYWNrIHRoaXMgdG8gaGFuZGxlIHJlLWVudHJhbnQgY2FzZXNcbiAgLy8gbGlrZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmFsbG9vbnMtYW5kLXN0YXRpYy1lbGVjdHJpY2l0eS9pc3N1ZXMvNDA2LlxuICBwdWJsaWMgY3VycmVudGx5RmlyaW5nRXZlbnRzOiBib29sZWFuO1xuXG4gIHB1YmxpYyBjdXJyZW50U2NlbmVyeUV2ZW50OiBTY2VuZXJ5RXZlbnQgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIGJhdGNoZWRFdmVudHM6IEJhdGNoZWRET01FdmVudFtdO1xuXG4gIC8vIEluIG1pbGlzZWNvbmRzLCB0aGUgRE9NRXZlbnQgdGltZVN0YW1wIHdoZW4gd2UgcmVjZWl2ZSBhIGxvZ2ljYWwgdXAgZXZlbnQuXG4gIC8vIFdlIGNhbiBjb21wYXJlIHRoaXMgdG8gdGhlIHRpbWVTdGFtcCBvbiBhIGNsaWNrIHZlbnQgdG8gZmlsdGVyIG91dCB0aGUgY2xpY2sgZXZlbnRzXG4gIC8vIHdoZW4gc29tZSBzY3JlZW4gcmVhZGVycyBzZW5kIGJvdGggZG93bi91cCBldmVudHMgQU5EIGNsaWNrIGV2ZW50cyB0byB0aGUgdGFyZ2V0XG4gIC8vIGVsZW1lbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA5NFxuICBwcml2YXRlIHVwVGltZVN0YW1wOiBudW1iZXI7XG5cbiAgLy8gRW1pdHMgcG9pbnRlciB2YWxpZGF0aW9uIHRvIHRoZSBpbnB1dCBzdHJlYW0gZm9yIHBsYXliYWNrXG4gIC8vIFRoaXMgaXMgYSBoaWdoIGZyZXF1ZW5jeSBldmVudCB0aGF0IGlzIG5lY2Vzc2FyeSBmb3IgcmVwcm9kdWNpYmxlIHBsYXliYWNrc1xuICBwcml2YXRlIHJlYWRvbmx5IHZhbGlkYXRlUG9pbnRlcnNBY3Rpb246IFBoZXRpb0FjdGlvbjtcblxuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlVXBBY3Rpb246IFBoZXRpb0FjdGlvbjxbIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBtb3VzZURvd25BY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgVmVjdG9yMiwgRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlTW92ZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgVmVjdG9yMiwgRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlT3ZlckFjdGlvbjogUGhldGlvQWN0aW9uPFsgVmVjdG9yMiwgRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IG1vdXNlT3V0QWN0aW9uOiBQaGV0aW9BY3Rpb248WyBWZWN0b3IyLCBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgd2hlZWxTY3JvbGxBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dDxXaGVlbEV2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSB0b3VjaFN0YXJ0QWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSB0b3VjaEVuZEFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgdG91Y2hNb3ZlQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSB0b3VjaENhbmNlbEFjdGlvbjogUGhldGlvQWN0aW9uPFsgbnVtYmVyLCBWZWN0b3IyLCBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuU3RhcnRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgVmVjdG9yMiwgRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuRW5kQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbk1vdmVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgVmVjdG9yMiwgRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuQ2FuY2VsQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIFZlY3RvcjIsIEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IGdvdFBvaW50ZXJDYXB0dXJlQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIEV2ZW50Q29udGV4dCBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBsb3N0UG9pbnRlckNhcHR1cmVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciwgRXZlbnRDb250ZXh0IF0+O1xuXG4gIC8vIElmIGFjY2Vzc2libGVcbiAgcHJpdmF0ZSByZWFkb25seSBmb2N1c2luQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8Rm9jdXNFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkgZm9jdXNvdXRBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dDxGb2N1c0V2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBjbGlja0FjdGlvbjogUGhldGlvQWN0aW9uPFsgRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+IF0+O1xuICBwcml2YXRlIHJlYWRvbmx5IGlucHV0QWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8RXZlbnQgfCBJbnB1dEV2ZW50PiBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBjaGFuZ2VBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dCBdPjtcbiAgcHJpdmF0ZSByZWFkb25seSBrZXlkb3duQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBFdmVudENvbnRleHQ8S2V5Ym9hcmRFdmVudD4gXT47XG4gIHByaXZhdGUgcmVhZG9ubHkga2V5dXBBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiBdPjtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElucHV0SU8gPSBuZXcgSU9UeXBlPElucHV0PiggJ0lucHV0SU8nLCB7XG4gICAgdmFsdWVUeXBlOiBJbnB1dCxcbiAgICBhcHBseVN0YXRlOiBfLm5vb3AsXG4gICAgdG9TdGF0ZU9iamVjdDogKCBpbnB1dDogSW5wdXQgKSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb2ludGVyczogQXJyYXlJT1BvaW50ZXJJTy50b1N0YXRlT2JqZWN0KCBpbnB1dC5wb2ludGVycyApXG4gICAgICB9O1xuICAgIH0sXG4gICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgIHBvaW50ZXJzOiBBcnJheUlPUG9pbnRlcklPXG4gICAgfVxuICB9ICk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBkaXNwbGF5XG4gICAqIEBwYXJhbSBhdHRhY2hUb1dpbmRvdyAtIFdoZXRoZXIgdG8gYWRkIGxpc3RlbmVycyB0byB0aGUgd2luZG93IChpbnN0ZWFkIG9mIHRoZSBEaXNwbGF5J3MgZG9tRWxlbWVudCkuXG4gICAqIEBwYXJhbSBiYXRjaERPTUV2ZW50cyAtIElmIHRydWUsIG1vc3QgZXZlbnQgdHlwZXMgd2lsbCBiZSBiYXRjaGVkIHVudGlsIG90aGVyd2lzZSB0cmlnZ2VyZWQuXG4gICAqIEBwYXJhbSBhc3N1bWVGdWxsV2luZG93IC0gV2UgY2FuIG9wdGltaXplIGNlcnRhaW4gdGhpbmdzIGxpa2UgY29tcHV0aW5nIHBvaW50cyBpZiB3ZSBrbm93IHRoZSBkaXNwbGF5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxzIHRoZSBlbnRpcmUgd2luZG93LlxuICAgKiBAcGFyYW0gcGFzc2l2ZUV2ZW50cyAtIFNlZSBEaXNwbGF5J3MgZG9jdW1lbnRhdGlvbiAoY29udHJvbHMgdGhlIHByZXNlbmNlIG9mIHRoZSBwYXNzaXZlIGZsYWcgZm9yXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLCB3aGljaCBoYXMgc29tZSBhZHZhbmNlZCBjb25zaWRlcmF0aW9ucykuXG4gICAqXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkaXNwbGF5OiBEaXNwbGF5LCBhdHRhY2hUb1dpbmRvdzogYm9vbGVhbiwgYmF0Y2hET01FdmVudHM6IGJvb2xlYW4sIGFzc3VtZUZ1bGxXaW5kb3c6IGJvb2xlYW4sIHBhc3NpdmVFdmVudHM6IGJvb2xlYW4gfCBudWxsLCBwcm92aWRlZE9wdGlvbnM/OiBJbnB1dE9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPElucHV0T3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcbiAgICAgIHBoZXRpb1R5cGU6IElucHV0LklucHV0SU8sXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ2VudHJhbCBwb2ludCBmb3IgdXNlciBpbnB1dCBldmVudHMsIHN1Y2ggYXMgbW91c2UsIHRvdWNoJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgdGhpcy5yb290Tm9kZSA9IGRpc3BsYXkucm9vdE5vZGU7XG5cbiAgICB0aGlzLmF0dGFjaFRvV2luZG93ID0gYXR0YWNoVG9XaW5kb3c7XG4gICAgdGhpcy5iYXRjaERPTUV2ZW50cyA9IGJhdGNoRE9NRXZlbnRzO1xuICAgIHRoaXMuYXNzdW1lRnVsbFdpbmRvdyA9IGFzc3VtZUZ1bGxXaW5kb3c7XG4gICAgdGhpcy5wYXNzaXZlRXZlbnRzID0gcGFzc2l2ZUV2ZW50cztcbiAgICB0aGlzLmJhdGNoZWRFdmVudHMgPSBbXTtcbiAgICB0aGlzLnBkb21Qb2ludGVyID0gbnVsbDtcbiAgICB0aGlzLm1vdXNlID0gbnVsbDtcbiAgICB0aGlzLnBvaW50ZXJzID0gW107XG4gICAgdGhpcy5wb2ludGVyQWRkZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyPFsgUG9pbnRlciBdPigpO1xuICAgIHRoaXMuY3VycmVudGx5RmlyaW5nRXZlbnRzID0gZmFsc2U7XG4gICAgdGhpcy51cFRpbWVTdGFtcCA9IDA7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gRGVjbGFyZSB0aGUgQWN0aW9ucyB0aGF0IHNlbmQgc2NlbmVyeSBpbnB1dCBldmVudHMgdG8gdGhlIFBoRVQtaU8gZGF0YSBzdHJlYW0uICBOb3RlIHRoZXkgdXNlIHRoZSBkZWZhdWx0IHZhbHVlXG4gICAgLy8gb2YgcGhldGlvUmVhZE9ubHkgZmFsc2UsIGluIGNhc2UgYSBjbGllbnQgd2FudHMgdG8gc3ludGhlc2l6ZSBldmVudHMuXG5cbiAgICB0aGlzLnZhbGlkYXRlUG9pbnRlcnNBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoKSA9PiB7XG4gICAgICBsZXQgaSA9IHRoaXMucG9pbnRlcnMubGVuZ3RoO1xuICAgICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLnBvaW50ZXJzWyBpIF07XG4gICAgICAgIGlmICggcG9pbnRlci5wb2ludCAmJiBwb2ludGVyICE9PSB0aGlzLnBkb21Qb2ludGVyICkge1xuICAgICAgICAgIHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPEV2ZW50PiggcG9pbnRlciwgcG9pbnRlci5sYXN0RXZlbnRDb250ZXh0IHx8IEV2ZW50Q29udGV4dC5jcmVhdGVTeW50aGV0aWMoKSwgZmFsc2UgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAndmFsaWRhdGVQb2ludGVyc0FjdGlvbicgKSxcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLm1vdXNlVXBBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCBtb3VzZSA9IHRoaXMuZW5zdXJlTW91c2UoIHBvaW50ICk7XG4gICAgICBtb3VzZS5pZCA9IG51bGw7XG4gICAgICB0aGlzLnVwRXZlbnQ8TW91c2VFdmVudD4oIG1vdXNlLCBjb250ZXh0LCBwb2ludCApO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnbW91c2VVcEFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4nXG4gICAgfSApO1xuXG4gICAgdGhpcy5tb3VzZURvd25BY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCBtb3VzZSA9IHRoaXMuZW5zdXJlTW91c2UoIHBvaW50ICk7XG4gICAgICBtb3VzZS5pZCA9IGlkO1xuICAgICAgdGhpcy5kb3duRXZlbnQ8TW91c2VFdmVudD4oIG1vdXNlLCBjb250ZXh0LCBwb2ludCApO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnbW91c2VEb3duQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bGxhYmxlSU8oIE51bWJlcklPICkgfSxcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIG1vdXNlIGJ1dHRvbiBpcyBwcmVzc2VkLidcbiAgICB9ICk7XG5cbiAgICB0aGlzLm1vdXNlTW92ZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcbiAgICAgIG1vdXNlLm1vdmUoIHBvaW50ICk7XG4gICAgICB0aGlzLm1vdmVFdmVudDxNb3VzZUV2ZW50PiggbW91c2UsIGNvbnRleHQgKTtcbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ21vdXNlTW92ZUFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgbW91c2UgaXMgbW92ZWQuJyxcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLm1vdXNlT3ZlckFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcbiAgICAgIG1vdXNlLm92ZXIoIHBvaW50ICk7XG4gICAgICAvLyBUT0RPOiBob3cgdG8gaGFuZGxlIG1vdXNlLW92ZXIgKGFuZCBsb2cgaXQpLi4uIGFyZSB3ZSBjaGFuZ2luZyB0aGUgcG9pbnRlci5wb2ludCB3aXRob3V0IGEgYnJhbmNoIGNoYW5nZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ21vdXNlT3ZlckFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgbW91c2UgaXMgbW92ZWQgd2hpbGUgb24gdGhlIHNpbS4nXG4gICAgfSApO1xuXG4gICAgdGhpcy5tb3VzZU91dEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggcG9pbnQgKTtcbiAgICAgIG1vdXNlLm91dCggcG9pbnQgKTtcbiAgICAgIC8vIFRPRE86IGhvdyB0byBoYW5kbGUgbW91c2Utb3V0IChhbmQgbG9nIGl0KS4uLiBhcmUgd2UgY2hhbmdpbmcgdGhlIHBvaW50ZXIucG9pbnQgd2l0aG91dCBhIGJyYW5jaCBjaGFuZ2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdtb3VzZU91dEFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiB0aGUgbW91c2UgbW92ZXMgb3V0IG9mIHRoZSBkaXNwbGF5LidcbiAgICB9ICk7XG5cbiAgICB0aGlzLndoZWVsU2Nyb2xsQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBjb250ZXh0OiBFdmVudENvbnRleHQ8V2hlZWxFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCBldmVudCA9IGNvbnRleHQuZG9tRXZlbnQ7XG5cbiAgICAgIGNvbnN0IG1vdXNlID0gdGhpcy5lbnN1cmVNb3VzZSggdGhpcy5wb2ludEZyb21FdmVudCggZXZlbnQgKSApO1xuICAgICAgbW91c2Uud2hlZWwoIGV2ZW50ICk7XG5cbiAgICAgIC8vIGRvbid0IHNlbmQgbW91c2Utd2hlZWwgZXZlbnRzIGlmIHdlIGRvbid0IHlldCBoYXZlIGEgbW91c2UgbG9jYXRpb24hXG4gICAgICAvLyBUT0RPOiBDYW4gd2Ugc2V0IHRoZSBtb3VzZSBsb2NhdGlvbiBiYXNlZCBvbiB0aGUgd2hlZWwgZXZlbnQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIG1vdXNlLnBvaW50ICkge1xuICAgICAgICBjb25zdCB0cmFpbCA9IHRoaXMucm9vdE5vZGUudHJhaWxVbmRlclBvaW50ZXIoIG1vdXNlICkgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxXaGVlbEV2ZW50PiggdHJhaWwsICd3aGVlbCcsIG1vdXNlLCBjb250ZXh0LCB0cnVlICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd3aGVlbFNjcm9sbEFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIG1vdXNlIHdoZWVsIHNjcm9sbHMuJyxcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLnRvdWNoU3RhcnRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCB0b3VjaCA9IG5ldyBUb3VjaCggaWQsIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICk7XG4gICAgICB0aGlzLmFkZFBvaW50ZXIoIHRvdWNoICk7XG4gICAgICB0aGlzLmRvd25FdmVudDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiggdG91Y2gsIGNvbnRleHQsIHBvaW50ICk7XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd0b3VjaFN0YXJ0QWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSB0b3VjaCBiZWdpbnMuJ1xuICAgIH0gKTtcblxuICAgIHRoaXMudG91Y2hFbmRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCB0b3VjaCA9IHRoaXMuZmluZFBvaW50ZXJCeUlkKCBpZCApIGFzIFRvdWNoIHwgbnVsbDtcbiAgICAgIGlmICggdG91Y2ggKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRvdWNoIGluc3RhbmNlb2YgVG91Y2ggKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnMsIHBoZXQvYmFkLXNpbS10ZXh0XG4gICAgICAgIHRoaXMudXBFdmVudDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiggdG91Y2gsIGNvbnRleHQsIHBvaW50ICk7XG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlciggdG91Y2ggKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3RvdWNoRW5kQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSB0b3VjaCBlbmRzLidcbiAgICB9ICk7XG5cbiAgICB0aGlzLnRvdWNoTW92ZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgVG91Y2ggfCBudWxsO1xuICAgICAgaWYgKCB0b3VjaCApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdG91Y2ggaW5zdGFuY2VvZiBUb3VjaCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9ucywgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgICAgdG91Y2gubW92ZSggcG9pbnQgKTtcbiAgICAgICAgdGhpcy5tb3ZlRXZlbnQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4oIHRvdWNoLCBjb250ZXh0ICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICd0b3VjaE1vdmVBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHRvdWNoIG1vdmVzLicsXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXG4gICAgfSApO1xuXG4gICAgdGhpcy50b3VjaENhbmNlbEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IHRvdWNoID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgVG91Y2ggfCBudWxsO1xuICAgICAgaWYgKCB0b3VjaCApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdG91Y2ggaW5zdGFuY2VvZiBUb3VjaCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9ucywgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgICAgdGhpcy5jYW5jZWxFdmVudDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiggdG91Y2gsIGNvbnRleHQsIHBvaW50ICk7XG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlciggdG91Y2ggKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3RvdWNoQ2FuY2VsQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSB0b3VjaCBpcyBjYW5jZWxlZC4nXG4gICAgfSApO1xuXG4gICAgdGhpcy5wZW5TdGFydEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xuICAgICAgY29uc3QgcGVuID0gbmV3IFBlbiggaWQsIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICk7XG4gICAgICB0aGlzLmFkZFBvaW50ZXIoIHBlbiApO1xuICAgICAgdGhpcy5kb3duRXZlbnQ8UG9pbnRlckV2ZW50PiggcGVuLCBjb250ZXh0LCBwb2ludCApO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAncGVuU3RhcnRBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBlbiB0b3VjaGVzIHRoZSBzY3JlZW4uJ1xuICAgIH0gKTtcblxuICAgIHRoaXMucGVuRW5kQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCBwZW4gPSB0aGlzLmZpbmRQb2ludGVyQnlJZCggaWQgKSBhcyBQZW4gfCBudWxsO1xuICAgICAgaWYgKCBwZW4gKSB7XG4gICAgICAgIHRoaXMudXBFdmVudDxQb2ludGVyRXZlbnQ+KCBwZW4sIGNvbnRleHQsIHBvaW50ICk7XG4gICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlciggcGVuICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdwZW5FbmRBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcbiAgICAgICAgeyBuYW1lOiAncG9pbnQnLCBwaGV0aW9UeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBlbiBpcyBsaWZ0ZWQuJ1xuICAgIH0gKTtcblxuICAgIHRoaXMucGVuTW92ZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xuICAgICAgY29uc3QgcGVuID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgUGVuIHwgbnVsbDtcbiAgICAgIGlmICggcGVuICkge1xuICAgICAgICBwZW4ubW92ZSggcG9pbnQgKTtcbiAgICAgICAgdGhpcy5tb3ZlRXZlbnQ8UG9pbnRlckV2ZW50PiggcGVuLCBjb250ZXh0ICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdwZW5Nb3ZlQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogW1xuICAgICAgICB7IG5hbWU6ICdpZCcsIHBoZXRpb1R5cGU6IE51bWJlcklPIH0sXG4gICAgICAgIHsgbmFtZTogJ3BvaW50JywgcGhldGlvVHlwZTogVmVjdG9yMi5WZWN0b3IySU8gfSxcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSBwZW4gaXMgbW92ZWQuJyxcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLnBlbkNhbmNlbEFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICkgPT4ge1xuICAgICAgY29uc3QgcGVuID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICkgYXMgUGVuIHwgbnVsbDtcbiAgICAgIGlmICggcGVuICkge1xuICAgICAgICB0aGlzLmNhbmNlbEV2ZW50PFBvaW50ZXJFdmVudD4oIHBlbiwgY29udGV4dCwgcG9pbnQgKTtcbiAgICAgICAgdGhpcy5yZW1vdmVQb2ludGVyKCBwZW4gKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3BlbkNhbmNlbEFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnaWQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdwb2ludCcsIHBoZXRpb1R5cGU6IFZlY3RvcjIuVmVjdG9yMklPIH0sXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIGEgcGVuIGlzIGNhbmNlbGVkLidcbiAgICB9ICk7XG5cbiAgICB0aGlzLmdvdFBvaW50ZXJDYXB0dXJlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBpZDogbnVtYmVyLCBjb250ZXh0OiBFdmVudENvbnRleHQgKSA9PiB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICk7XG5cbiAgICAgIGlmICggcG9pbnRlciApIHtcbiAgICAgICAgcG9pbnRlci5vbkdvdFBvaW50ZXJDYXB0dXJlKCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdnb3RQb2ludGVyQ2FwdHVyZUFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnaWQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdjb250ZXh0JywgcGhldGlvVHlwZTogRXZlbnRDb250ZXh0SU8gfVxuICAgICAgXSxcbiAgICAgIHBoZXRpb0V2ZW50VHlwZTogRXZlbnRUeXBlLlVTRVIsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhIHBvaW50ZXIgaXMgY2FwdHVyZWQgKG5vcm1hbGx5IGF0IHRoZSBzdGFydCBvZiBhbiBpbnRlcmFjdGlvbiknLFxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRoaXMubG9zdFBvaW50ZXJDYXB0dXJlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBpZDogbnVtYmVyLCBjb250ZXh0OiBFdmVudENvbnRleHQgKSA9PiB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5maW5kUG9pbnRlckJ5SWQoIGlkICk7XG5cbiAgICAgIGlmICggcG9pbnRlciApIHtcblxuICAgICAgICAvLyBXaGlsZSBpbnZlc3RpZ2F0aW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tZWFuLXNoYXJlLWFuZC1iYWxhbmNlL2lzc3Vlcy8zMzYgaXQgd2FzIGRpc2NvdmVyZWQgdGhhdFxuICAgICAgICAvLyBwb2ludGVyVXAgZXZlbnRzIHdlcmUgbm90IGJlaW5nIHRyYW5zbWl0dGVkIGJlZm9yZSBsb3N0UG9pbnRlckNhcHR1cmUgZXZlbnRzIGJ5IHRoZSBicm93c2VyLiBUaGlzIHdhc1xuICAgICAgICAvLyBzdXJwcmlzaW5nIHNpbmNlIHRoZSBzcGVjIHNheXMgb3RoZXJ3aXNlOiBodHRwczovL3czYy5naXRodWIuaW8vcG9pbnRlcmV2ZW50cy8jaW1wbGljaXQtcmVsZWFzZS1vZi1wb2ludGVyLWNhcHR1cmVcbiAgICAgICAgLy8gVGhpcyBiZWhhdmlvciB3YXMgZm91bmQgdG8gYmUgb2NjdXJyaW5nIHdoaWxlIHVzaW5nIGEgbWFjIHRyYWNrcGFkIHdpdGggZmluZ2VyIG1vdmVtZW50cyB0aGF0IGNvdWxkXG4gICAgICAgIC8vIHBvdGVudGlhbGx5IGJlIHBlcmNlaXZlZCBhcyBnZXN0dXJlLiBUaGUgZm9sbG93aW5nIHNldFRpbWVvdXQgZ2l2ZXMgdGhlIHBvaW50ZXJVcCBldmVudCBhIGNoYW5jZSB0byBmaXJlIGZpcnN0XG4gICAgICAgIC8vIGJlZm9yZSB0aGUgbG9zdFBvaW50ZXJDYXB0dXJlIGV2ZW50IHNvIHRoYXQgbGlzdGVuZXJzIGNhbiByZWx5IG9uIHRoZSBleHBlY3RlZCBvcmRlci5cbiAgICAgICAgc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHsgcG9pbnRlci5vbkxvc3RQb2ludGVyQ2FwdHVyZSgpOyB9LCAyICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdsb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2lkJywgcGhldGlvVHlwZTogTnVtYmVySU8gfSxcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gYSBwb2ludGVyIGxvc2VzIGl0cyBjYXB0dXJlIChub3JtYWxseSBhdCB0aGUgZW5kIG9mIGFuIGludGVyYWN0aW9uKScsXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlXG4gICAgfSApO1xuXG4gICAgdGhpcy5mb2N1c2luQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBjb250ZXh0OiBFdmVudENvbnRleHQ8Rm9jdXNFdmVudD4gKSA9PiB7XG4gICAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UERPTUV2ZW50VHJhaWwoIGNvbnRleHQuZG9tRXZlbnQsICdmb2N1c2luJyApO1xuICAgICAgaWYgKCAhdHJhaWwgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBmb2N1c2luKCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8Rm9jdXNFdmVudD4oIHRyYWlsLCAnZm9jdXMnLCBjb250ZXh0LCBmYWxzZSApO1xuICAgICAgdGhpcy5kaXNwYXRjaFBET01FdmVudDxGb2N1c0V2ZW50PiggdHJhaWwsICdmb2N1c2luJywgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2ZvY3VzaW5BY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUgZm9jdXNpbiBET00gZXZlbnQuJ1xuICAgIH0gKTtcblxuICAgIHRoaXMuZm9jdXNvdXRBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxGb2N1c0V2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRQRE9NRXZlbnRUcmFpbCggY29udGV4dC5kb21FdmVudCwgJ2ZvY3Vzb3V0JyApO1xuICAgICAgaWYgKCAhdHJhaWwgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBmb2N1c091dCgke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICB0aGlzLmRpc3BhdGNoUERPTUV2ZW50PEZvY3VzRXZlbnQ+KCB0cmFpbCwgJ2JsdXInLCBjb250ZXh0LCBmYWxzZSApO1xuICAgICAgdGhpcy5kaXNwYXRjaFBET01FdmVudDxGb2N1c0V2ZW50PiggdHJhaWwsICdmb2N1c291dCcsIGNvbnRleHQsIHRydWUgKTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdmb2N1c291dEFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBmb2N1c291dCBET00gZXZlbnQuJ1xuICAgIH0gKTtcblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2NsaWNrX2V2ZW50IG5vdGVzIHRoYXQgdGhlIGNsaWNrIGFjdGlvbiBzaG91bGQgcmVzdWx0XG4gICAgLy8gaW4gYSBNb3VzZUV2ZW50XG4gICAgdGhpcy5jbGlja0FjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQ+ICkgPT4ge1xuICAgICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFBET01FdmVudFRyYWlsKCBjb250ZXh0LmRvbUV2ZW50LCAnY2xpY2snICk7XG4gICAgICBpZiAoICF0cmFpbCApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGNsaWNrKCR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8TW91c2VFdmVudD4oIHRyYWlsLCAnY2xpY2snLCBjb250ZXh0LCB0cnVlICk7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnY2xpY2tBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUgY2xpY2sgRE9NIGV2ZW50LidcbiAgICB9ICk7XG5cbiAgICB0aGlzLmlucHV0QWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCBjb250ZXh0OiBFdmVudENvbnRleHQ8RXZlbnQgfCBJbnB1dEV2ZW50PiApID0+IHtcbiAgICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRQRE9NRXZlbnRUcmFpbCggY29udGV4dC5kb21FdmVudCwgJ2lucHV0JyApO1xuICAgICAgaWYgKCAhdHJhaWwgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBpbnB1dCgke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICB0aGlzLmRpc3BhdGNoUERPTUV2ZW50PEV2ZW50IHwgSW5wdXRFdmVudD4oIHRyYWlsLCAnaW5wdXQnLCBjb250ZXh0LCB0cnVlICk7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnaW5wdXRBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUgaW5wdXQgRE9NIGV2ZW50LidcbiAgICB9ICk7XG5cbiAgICB0aGlzLmNoYW5nZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb24oICggY29udGV4dDogRXZlbnRDb250ZXh0ICkgPT4ge1xuICAgICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFBET01FdmVudFRyYWlsKCBjb250ZXh0LmRvbUV2ZW50LCAnY2hhbmdlJyApO1xuICAgICAgaWYgKCAhdHJhaWwgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBjaGFuZ2UoJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgdGhpcy5kaXNwYXRjaFBET01FdmVudDxFdmVudD4oIHRyYWlsLCAnY2hhbmdlJywgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2NoYW5nZUFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnY29udGV4dCcsIHBoZXRpb1R5cGU6IEV2ZW50Q29udGV4dElPIH1cbiAgICAgIF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0VtaXRzIHdoZW4gdGhlIFBET00gcm9vdCBnZXRzIHRoZSBjaGFuZ2UgRE9NIGV2ZW50LidcbiAgICB9ICk7XG5cbiAgICB0aGlzLmtleWRvd25BY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiApID0+IHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBga2V5ZG93bigke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UERPTUV2ZW50VHJhaWwoIGNvbnRleHQuZG9tRXZlbnQsICdrZXlkb3duJyApO1xuICAgICAgdHJhaWwgJiYgdGhpcy5kaXNwYXRjaFBET01FdmVudDxLZXlib2FyZEV2ZW50PiggdHJhaWwsICdrZXlkb3duJywgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2tleWRvd25BY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUga2V5ZG93biBET00gZXZlbnQuJ1xuICAgIH0gKTtcblxuICAgIHRoaXMua2V5dXBBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCAoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxLZXlib2FyZEV2ZW50PiApID0+IHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBga2V5dXAoJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgY29uc3QgdHJhaWwgPSB0aGlzLmdldFBET01FdmVudFRyYWlsKCBjb250ZXh0LmRvbUV2ZW50LCAna2V5ZG93bicgKTtcbiAgICAgIHRyYWlsICYmIHRoaXMuZGlzcGF0Y2hQRE9NRXZlbnQ8S2V5Ym9hcmRFdmVudD4oIHRyYWlsLCAna2V5dXAnLCBjb250ZXh0LCB0cnVlICk7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH0sIHtcbiAgICAgIHBoZXRpb1BsYXliYWNrOiB0cnVlLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAna2V5dXBBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHsgbmFtZTogJ2NvbnRleHQnLCBwaGV0aW9UeXBlOiBFdmVudENvbnRleHRJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBQRE9NIHJvb3QgZ2V0cyB0aGUga2V5dXAgRE9NIGV2ZW50LidcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJydXB0cyBhbnkgaW5wdXQgYWN0aW9ucyB0aGF0IGFyZSBjdXJyZW50bHkgdGFraW5nIHBsYWNlIChzaG91bGQgc3RvcCBkcmFncywgZXRjLilcbiAgICpcbiAgICogSWYgZXhjbHVkZVBvaW50ZXIgaXMgcHJvdmlkZWQsIGl0IHdpbGwgTk9UIGJlIGludGVycnVwdGVkIGFsb25nIHdpdGggdGhlIG90aGVyc1xuICAgKi9cbiAgcHVibGljIGludGVycnVwdFBvaW50ZXJzKCBleGNsdWRlUG9pbnRlcjogUG9pbnRlciB8IG51bGwgPSBudWxsICk6IHZvaWQge1xuICAgIF8uZWFjaCggdGhpcy5wb2ludGVycywgcG9pbnRlciA9PiB7XG4gICAgICBpZiAoIHBvaW50ZXIgIT09IGV4Y2x1ZGVQb2ludGVyICkge1xuICAgICAgICBwb2ludGVyLmludGVycnVwdEFsbCgpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gYmF0Y2ggYSByYXcgRE9NIGV2ZW50ICh3aGljaCBtYXkgYmUgaW1tZWRpYXRlbHkgZmlyZWQsIGRlcGVuZGluZyBvbiB0aGUgc2V0dGluZ3MpLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogQHBhcmFtIGNvbnRleHRcbiAgICogQHBhcmFtIGJhdGNoVHlwZSAtIFNlZSBCYXRjaGVkRE9NRXZlbnQncyBcImVudW1lcmF0aW9uXCJcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gUGFyYW1ldGVyIHR5cGVzIGRlZmluZWQgYnkgdGhlIGJhdGNoVHlwZS4gU2VlIEJhdGNoZWRET01FdmVudCBmb3IgZGV0YWlsc1xuICAgKiBAcGFyYW0gdHJpZ2dlckltbWVkaWF0ZSAtIENlcnRhaW4gZXZlbnRzIGNhbiBmb3JjZSBpbW1lZGlhdGUgYWN0aW9uLCBzaW5jZSBicm93c2VycyBsaWtlIENocm9tZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmx5IGFsbG93IGNlcnRhaW4gb3BlcmF0aW9ucyBpbiB0aGUgY2FsbGJhY2sgZm9yIGEgdXNlciBnZXN0dXJlIChlLmcuIGxpa2VcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBtb3VzZXVwIHRvIG9wZW4gYSB3aW5kb3cpLlxuICAgKi9cbiAgcHVibGljIGJhdGNoRXZlbnQoIGNvbnRleHQ6IEV2ZW50Q29udGV4dCwgYmF0Y2hUeXBlOiBCYXRjaGVkRE9NRXZlbnRUeXBlLCBjYWxsYmFjazogQmF0Y2hlZERPTUV2ZW50Q2FsbGJhY2ssIHRyaWdnZXJJbW1lZGlhdGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KCAnSW5wdXQuYmF0Y2hFdmVudCcgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIElmIG91ciBkaXNwbGF5IGlzIG5vdCBpbnRlcmFjdGl2ZSwgZG8gbm90IHJlc3BvbmQgdG8gYW55IGV2ZW50cyAoYnV0IHN0aWxsIHByZXZlbnQgZGVmYXVsdClcbiAgICBpZiAoIHRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcbiAgICAgIHRoaXMuYmF0Y2hlZEV2ZW50cy5wdXNoKCBCYXRjaGVkRE9NRXZlbnQucG9vbC5jcmVhdGUoIGNvbnRleHQsIGJhdGNoVHlwZSwgY2FsbGJhY2sgKSApO1xuICAgICAgaWYgKCB0cmlnZ2VySW1tZWRpYXRlIHx8ICF0aGlzLmJhdGNoRE9NRXZlbnRzICkge1xuICAgICAgICB0aGlzLmZpcmVCYXRjaGVkRXZlbnRzKCk7XG4gICAgICB9XG4gICAgICAvLyBOT1RFOiBJZiB3ZSBldmVyIHdhbnQgdG8gRGlzcGxheS51cGRhdGVEaXNwbGF5KCkgb24gZXZlbnRzLCBkbyBzbyBoZXJlXG4gICAgfVxuXG4gICAgLy8gQWx3YXlzIHByZXZlbnREZWZhdWx0IG9uIHRvdWNoIGV2ZW50cywgc2luY2Ugd2UgZG9uJ3Qgd2FudCBtb3VzZSBldmVudHMgdHJpZ2dlcmVkIGFmdGVyd2FyZHMuIFNlZVxuICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vbW9iaWxlL3RvdWNoYW5kbW91c2UvIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgIC8vIEFkZGl0aW9uYWxseSwgSUUgaGFkIHNvbWUgaXNzdWVzIHdpdGggc2tpcHBpbmcgcHJldmVudCBkZWZhdWx0LCBzZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNDY0IGZvciBtb3VzZSBoYW5kbGluZy5cbiAgICAvLyBXRSBXSUxMIE5PVCBwcmV2ZW50RGVmYXVsdCgpIG9uIGtleWJvYXJkIG9yIGFsdGVybmF0aXZlIGlucHV0IGV2ZW50cyBoZXJlXG4gICAgaWYgKFxuICAgICAgISggdGhpcy5wYXNzaXZlRXZlbnRzID09PSB0cnVlICkgJiZcbiAgICAgICggY2FsbGJhY2sgIT09IHRoaXMubW91c2VEb3duIHx8IHBsYXRmb3JtLmVkZ2UgKSAmJlxuICAgICAgYmF0Y2hUeXBlICE9PSBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFICYmXG4gICAgICAhY29udGV4dC5hbGxvd3NET01JbnB1dCgpXG4gICAgKSB7XG4gICAgICAvLyBXZSBjYW5ub3QgcHJldmVudCBhIHBhc3NpdmUgZXZlbnQsIHNvIGRvbid0IHRyeVxuICAgICAgY29udGV4dC5kb21FdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogRmlyZXMgYWxsIG9mIG91ciBldmVudHMgdGhhdCB3ZXJlIGJhdGNoZWQgaW50byB0aGUgYmF0Y2hlZEV2ZW50cyBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZmlyZUJhdGNoZWRFdmVudHMoKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgdGhpcy5jdXJyZW50bHlGaXJpbmdFdmVudHMgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KFxuICAgICAgJ1JFRU5UUkFOQ0UgREVURUNURUQnICk7XG4gICAgLy8gRG9uJ3QgcmUtZW50cmFudGx5IGVudGVyIG91ciBsb29wLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JhbGxvb25zLWFuZC1zdGF0aWMtZWxlY3RyaWNpdHkvaXNzdWVzLzQwNlxuICAgIGlmICggIXRoaXMuY3VycmVudGx5RmlyaW5nRXZlbnRzICYmIHRoaXMuYmF0Y2hlZEV2ZW50cy5sZW5ndGggKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoIGBJbnB1dC5maXJlQmF0Y2hlZEV2ZW50cyBsZW5ndGg6JHt0aGlzLmJhdGNoZWRFdmVudHMubGVuZ3RofWAgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICB0aGlzLmN1cnJlbnRseUZpcmluZ0V2ZW50cyA9IHRydWU7XG5cbiAgICAgIC8vIG5lZWRzIHRvIGJlIGRvbmUgaW4gb3JkZXJcbiAgICAgIGNvbnN0IGJhdGNoZWRFdmVudHMgPSB0aGlzLmJhdGNoZWRFdmVudHM7XG4gICAgICAvLyBJTVBPUlRBTlQ6IFdlIG5lZWQgdG8gY2hlY2sgdGhlIGxlbmd0aCBvZiB0aGUgYXJyYXkgYXQgZXZlcnkgaXRlcmF0aW9uLCBhcyBpdCBjYW4gY2hhbmdlIGR1ZSB0byByZS1lbnRyYW50XG4gICAgICAvLyBldmVudCBoYW5kbGluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxsb29ucy1hbmQtc3RhdGljLWVsZWN0cmljaXR5L2lzc3Vlcy80MDYuXG4gICAgICAvLyBFdmVudHMgbWF5IGJlIGFwcGVuZGVkIHRvIHRoaXMgKHN5bmNocm9ub3VzbHkpIGFzIHBhcnQgb2YgZmlyaW5nIGluaXRpYWwgZXZlbnRzLCBzbyB3ZSB3YW50IHRvIEZVTExZIHJ1biBhbGxcbiAgICAgIC8vIGV2ZW50cyBiZWZvcmUgY2xlYXJpbmcgb3VyIGFycmF5LlxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYmF0Y2hlZEV2ZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgYmF0Y2hlZEV2ZW50ID0gYmF0Y2hlZEV2ZW50c1sgaSBdO1xuICAgICAgICBiYXRjaGVkRXZlbnQucnVuKCB0aGlzICk7XG4gICAgICAgIGJhdGNoZWRFdmVudC5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICBjbGVhbkFycmF5KCBiYXRjaGVkRXZlbnRzICk7XG5cbiAgICAgIHRoaXMuY3VycmVudGx5RmlyaW5nRXZlbnRzID0gZmFsc2U7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbnkgYmF0Y2hlZCBldmVudHMgdGhhdCB3ZSBkb24ndCB3YW50IHRvIHByb2Nlc3MuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBJdCBpcyBISUdITFkgcmVjb21tZW5kZWQgdG8gaW50ZXJydXB0IHBvaW50ZXJzIGFuZCByZW1vdmUgbm9uLU1vdXNlIHBvaW50ZXJzIGJlZm9yZSBkb2luZyB0aGlzLCBhc1xuICAgKiBvdGhlcndpc2UgaXQgY2FuIGNhdXNlIGluY29ycmVjdCBzdGF0ZSBpbiBjZXJ0YWluIHR5cGVzIG9mIGxpc3RlbmVycyAoZS5nLiBvbmVzIHRoYXQgY291bnQgaG93IG1hbnkgcG9pbnRlcnNcbiAgICogYXJlIG92ZXIgdGhlbSkuXG4gICAqL1xuICBwdWJsaWMgY2xlYXJCYXRjaGVkRXZlbnRzKCk6IHZvaWQge1xuICAgIHRoaXMuYmF0Y2hlZEV2ZW50cy5sZW5ndGggPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhbGwgcG9pbnRlcnMgdG8gc2VlIHdoZXRoZXIgdGhleSBhcmUgc3RpbGwgXCJvdmVyXCIgdGhlIHNhbWUgbm9kZXMgKHRyYWlsKS4gSWYgbm90LCBpdCB3aWxsIGZpcmUgdGhlIHVzdWFsXG4gICAqIGVudGVyL2V4aXQgZXZlbnRzLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB2YWxpZGF0ZVBvaW50ZXJzKCk6IHZvaWQge1xuICAgIHRoaXMudmFsaWRhdGVQb2ludGVyc0FjdGlvbi5leGVjdXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgbm9uLU1vdXNlIHBvaW50ZXJzIGZyb20gaW50ZXJuYWwgdHJhY2tpbmcuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHJlbW92ZVRlbXBvcmFyeVBvaW50ZXJzKCk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gdGhpcy5wb2ludGVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgIGNvbnN0IHBvaW50ZXIgPSB0aGlzLnBvaW50ZXJzWyBpIF07XG4gICAgICBpZiAoICEoIHBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSApICkge1xuICAgICAgICB0aGlzLnBvaW50ZXJzLnNwbGljZSggaSwgMSApO1xuXG4gICAgICAgIC8vIFNlbmQgZXhpdCBldmVudHMuIEFzIHdlIGNhbid0IGdldCBhIERPTSBldmVudCwgd2UnbGwgc2VuZCBhIGZha2Ugb2JqZWN0IGluc3RlYWQuXG4gICAgICAgIGNvbnN0IGV4aXRUcmFpbCA9IHBvaW50ZXIudHJhaWwgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XG4gICAgICAgIHRoaXMuZXhpdEV2ZW50cyggcG9pbnRlciwgRXZlbnRDb250ZXh0LmNyZWF0ZVN5bnRoZXRpYygpLCBleGl0VHJhaWwsIDAsIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSG9va3MgdXAgRE9NIGxpc3RlbmVycyB0byB3aGF0ZXZlciB0eXBlIG9mIG9iamVjdCB3ZSBhcmUgZ29pbmcgdG8gbGlzdGVuIHRvLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBjb25uZWN0TGlzdGVuZXJzKCk6IHZvaWQge1xuICAgIEJyb3dzZXJFdmVudHMuYWRkRGlzcGxheSggdGhpcy5kaXNwbGF5LCB0aGlzLmF0dGFjaFRvV2luZG93LCB0aGlzLnBhc3NpdmVFdmVudHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIERPTSBsaXN0ZW5lcnMgZnJvbSB3aGF0ZXZlciB0eXBlIG9mIG9iamVjdCB3ZSB3ZXJlIGxpc3RlbmluZyB0by4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZGlzY29ubmVjdExpc3RlbmVycygpOiB2b2lkIHtcbiAgICBCcm93c2VyRXZlbnRzLnJlbW92ZURpc3BsYXkoIHRoaXMuZGlzcGxheSwgdGhpcy5hdHRhY2hUb1dpbmRvdywgdGhpcy5wYXNzaXZlRXZlbnRzICk7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBhIHtWZWN0b3IyfSBnbG9iYWwgY29vcmRpbmF0ZSBwb2ludCBmcm9tIGFuIGFyYml0cmFyeSBET00gZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHBvaW50RnJvbUV2ZW50KCBkb21FdmVudDogTW91c2VFdmVudCB8IFdpbmRvd1RvdWNoICk6IFZlY3RvcjIge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gVmVjdG9yMi5wb29sLmNyZWF0ZSggZG9tRXZlbnQuY2xpZW50WCwgZG9tRXZlbnQuY2xpZW50WSApO1xuICAgIGlmICggIXRoaXMuYXNzdW1lRnVsbFdpbmRvdyApIHtcbiAgICAgIGNvbnN0IGRvbUJvdW5kcyA9IHRoaXMuZGlzcGxheS5kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciB0b3RhbGx5IGlnbm9yaW5nIGFueSB3aXRoIHplcm8gd2lkdGgvaGVpZ2h0LCBhcyB3ZSBhcmVuJ3QgYXR0YWNoZWQgdG8gdGhlIGRpc3BsYXk/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAvLyBGb3Igbm93LCBkb24ndCBvZmZzZXQuXG4gICAgICBpZiAoIGRvbUJvdW5kcy53aWR0aCA+IDAgJiYgZG9tQm91bmRzLmhlaWdodCA+IDAgKSB7XG4gICAgICAgIHBvc2l0aW9uLnN1YnRyYWN0WFkoIGRvbUJvdW5kcy5sZWZ0LCBkb21Cb3VuZHMudG9wICk7XG5cbiAgICAgICAgLy8gRGV0ZWN0IGEgc2NhbGluZyBvZiB0aGUgZGlzcGxheSBoZXJlICh0aGUgY2xpZW50IGJvdW5kaW5nIHJlY3QgaGF2aW5nIGRpZmZlcmVudCBkaW1lbnNpb25zIGZyb20gb3VyXG4gICAgICAgIC8vIGRpc3BsYXkpLCBhbmQgYXR0ZW1wdCB0byBjb21wZW5zYXRlLlxuICAgICAgICAvLyBOT1RFOiBXZSBjYW4ndCBoYW5kbGUgcm90YXRpb24gaGVyZS5cbiAgICAgICAgaWYgKCBkb21Cb3VuZHMud2lkdGggIT09IHRoaXMuZGlzcGxheS53aWR0aCB8fCBkb21Cb3VuZHMuaGVpZ2h0ICE9PSB0aGlzLmRpc3BsYXkuaGVpZ2h0ICkge1xuICAgICAgICAgIC8vIFRPRE86IEhhdmUgY29kZSB2ZXJpZnkgdGhlIGNvcnJlY3RuZXNzIGhlcmUsIGFuZCB0aGF0IGl0J3Mgbm90IHRyaWdnZXJpbmcgYWxsIHRoZSB0aW1lIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgICAgcG9zaXRpb24ueCAqPSB0aGlzLmRpc3BsYXkud2lkdGggLyBkb21Cb3VuZHMud2lkdGg7XG4gICAgICAgICAgcG9zaXRpb24ueSAqPSB0aGlzLmRpc3BsYXkuaGVpZ2h0IC8gZG9tQm91bmRzLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIHBvaW50ZXIgdG8gb3VyIGxpc3QuXG4gICAqL1xuICBwcml2YXRlIGFkZFBvaW50ZXIoIHBvaW50ZXI6IFBvaW50ZXIgKTogdm9pZCB7XG4gICAgdGhpcy5wb2ludGVycy5wdXNoKCBwb2ludGVyICk7XG5cbiAgICB0aGlzLnBvaW50ZXJBZGRlZEVtaXR0ZXIuZW1pdCggcG9pbnRlciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBwb2ludGVyIGZyb20gb3VyIGxpc3QuIElmIHdlIGdldCBmdXR1cmUgZXZlbnRzIGZvciBpdCAoYmFzZWQgb24gdGhlIElEKSBpdCB3aWxsIGJlIGlnbm9yZWQuXG4gICAqL1xuICBwcml2YXRlIHJlbW92ZVBvaW50ZXIoIHBvaW50ZXI6IFBvaW50ZXIgKTogdm9pZCB7XG4gICAgLy8gc2FuaXR5IGNoZWNrIHZlcnNpb24sIHdpbGwgcmVtb3ZlIGFsbCBpbnN0YW5jZXNcbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMucG9pbnRlcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBpZiAoIHRoaXMucG9pbnRlcnNbIGkgXSA9PT0gcG9pbnRlciApIHtcbiAgICAgICAgdGhpcy5wb2ludGVycy5zcGxpY2UoIGksIDEgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwb2ludGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHBvaW50ZXIncyBJRCAoZ2l2ZW4gYnkgdGhlIHBvaW50ZXIvdG91Y2ggc3BlY2lmaWNhdGlvbnMgdG8gYmUgdW5pcXVlIHRvIGEgc3BlY2lmaWMgcG9pbnRlci90b3VjaCksXG4gICAqIHJldHVybnMgdGhlIGdpdmVuIHBvaW50ZXIgKGlmIHdlIGhhdmUgb25lKS5cbiAgICpcbiAgICogTk9URTogVGhlcmUgYXJlIHNvbWUgY2FzZXMgd2hlcmUgd2UgbWF5IGhhdmUgcHJlbWF0dXJlbHkgXCJyZW1vdmVkXCIgYSBwb2ludGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kUG9pbnRlckJ5SWQoIGlkOiBudW1iZXIgKTogTW91c2UgfCBUb3VjaCB8IFBlbiB8IG51bGwge1xuICAgIGxldCBpID0gdGhpcy5wb2ludGVycy5sZW5ndGg7XG4gICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gdGhpcy5wb2ludGVyc1sgaSBdIGFzIE1vdXNlIHwgVG91Y2ggfCBQZW47XG4gICAgICBpZiAoIHBvaW50ZXIuaWQgPT09IGlkICkge1xuICAgICAgICByZXR1cm4gcG9pbnRlcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGdldFBET01FdmVudFRyYWlsKCBkb21FdmVudDogVGFyZ2V0U3Vic3RpdHVkZUF1Z21lbnRlZEV2ZW50LCBldmVudE5hbWU6IHN0cmluZyApOiBUcmFpbCB8IG51bGwge1xuICAgIGlmICggIXRoaXMuZGlzcGxheS5pbnRlcmFjdGl2ZSApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRyYWlsID0gdGhpcy5nZXRUcmFpbEZyb21QRE9NRXZlbnQoIGRvbUV2ZW50ICk7XG5cbiAgICAvLyBPbmx5IGRpc3BhdGNoIHRoZSBldmVudCBpZiB0aGUgY2xpY2sgZGlkIG5vdCBoYXBwZW4gcmFwaWRseSBhZnRlciBhbiB1cCBldmVudC4gSXQgaXNcbiAgICAvLyBsaWtlbHkgdGhhdCB0aGUgc2NyZWVuIHJlYWRlciBkaXNwYXRjaGVkIGJvdGggcG9pbnRlciBBTkQgY2xpY2sgZXZlbnRzIGluIHRoaXMgY2FzZSwgYW5kXG4gICAgLy8gd2Ugb25seSB3YW50IHRvIHJlc3BvbmQgdG8gb25lIG9yIHRoZSBvdGhlci4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMDk0LlxuICAgIC8vIFRoaXMgaXMgb3V0c2lkZSBvZiB0aGUgY2xpY2tBY3Rpb24gZXhlY3V0aW9uIHNvIHRoYXQgYmxvY2tlZCBjbGlja3MgYXJlIG5vdCBwYXJ0IG9mIHRoZSBQaEVULWlPIGRhdGFcbiAgICAvLyBzdHJlYW0uXG4gICAgY29uc3Qgbm90QmxvY2tpbmdTdWJzZXF1ZW50Q2xpY2tzT2NjdXJyaW5nVG9vUXVpY2tseSA9IHRyYWlsICYmICEoIGV2ZW50TmFtZSA9PT0gJ2NsaWNrJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLnNvbWUoIHRyYWlsLm5vZGVzLCBub2RlID0+IG5vZGUucG9zaXRpb25JblBET00gKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21FdmVudC50aW1lU3RhbXAgLSB0aGlzLnVwVGltZVN0YW1wIDw9IFBET01fQ0xJQ0tfREVMQVkgKTtcblxuICAgIHJldHVybiBub3RCbG9ja2luZ1N1YnNlcXVlbnRDbGlja3NPY2N1cnJpbmdUb29RdWlja2x5ID8gdHJhaWwgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBNb3VzZSBvYmplY3Qgb24gdGhlIGZpcnN0IG1vdXNlIGV2ZW50ICh0aGlzIG1heSBuZXZlciBoYXBwZW4gb24gdG91Y2ggZGV2aWNlcykuXG4gICAqL1xuICBwcml2YXRlIGluaXRNb3VzZSggcG9pbnQ6IFZlY3RvcjIgKTogTW91c2Uge1xuICAgIGNvbnN0IG1vdXNlID0gbmV3IE1vdXNlKCBwb2ludCApO1xuICAgIHRoaXMubW91c2UgPSBtb3VzZTtcbiAgICB0aGlzLmFkZFBvaW50ZXIoIG1vdXNlICk7XG4gICAgcmV0dXJuIG1vdXNlO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVNb3VzZSggcG9pbnQ6IFZlY3RvcjIgKTogTW91c2Uge1xuICAgIGNvbnN0IG1vdXNlID0gdGhpcy5tb3VzZTtcbiAgICBpZiAoIG1vdXNlICkge1xuICAgICAgcmV0dXJuIG1vdXNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRNb3VzZSggcG9pbnQgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY2Vzc2libGUgcG9pbnRlciBvYmplY3Qgb24gdGhlIGZpcnN0IHBkb20gZXZlbnQuXG4gICAqL1xuICBwcml2YXRlIGluaXRQRE9NUG9pbnRlcigpOiBQRE9NUG9pbnRlciB7XG4gICAgY29uc3QgcGRvbVBvaW50ZXIgPSBuZXcgUERPTVBvaW50ZXIoIHRoaXMuZGlzcGxheSApO1xuICAgIHRoaXMucGRvbVBvaW50ZXIgPSBwZG9tUG9pbnRlcjtcblxuICAgIHRoaXMuYWRkUG9pbnRlciggcGRvbVBvaW50ZXIgKTtcblxuICAgIHJldHVybiBwZG9tUG9pbnRlcjtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlUERPTVBvaW50ZXIoKTogUERPTVBvaW50ZXIge1xuICAgIGNvbnN0IHBkb21Qb2ludGVyID0gdGhpcy5wZG9tUG9pbnRlcjtcbiAgICBpZiAoIHBkb21Qb2ludGVyICkge1xuICAgICAgcmV0dXJuIHBkb21Qb2ludGVyO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmluaXRQRE9NUG9pbnRlcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGVwcyB0byBkaXNwYXRjaCBhIHBkb20tcmVsYXRlZCBldmVudC4gQmVmb3JlIGRpc3BhdGNoLCB0aGUgUERPTVBvaW50ZXIgaXMgaW5pdGlhbGl6ZWQgaWYgaXRcbiAgICogaGFzbid0IGJlZW4gY3JlYXRlZCB5ZXQgYW5kIGEgdXNlckdlc3R1cmVFbWl0dGVyIGVtaXRzIHRvIGluZGljYXRlIHRoYXQgYSB1c2VyIGhhcyBiZWd1biBhbiBpbnRlcmFjdGlvbi5cbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hQRE9NRXZlbnQ8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHRyYWlsOiBUcmFpbCwgZXZlbnRUeXBlOiBTdXBwb3J0ZWRFdmVudFR5cGVzLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBidWJibGVzOiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgdGhpcy5lbnN1cmVQRE9NUG9pbnRlcigpLnVwZGF0ZVRyYWlsKCB0cmFpbCApO1xuXG4gICAgLy8gZXhjbHVkZSBmb2N1cyBhbmQgYmx1ciBldmVudHMgYmVjYXVzZSB0aGV5IGNhbiBoYXBwZW4gd2l0aCBzY3JpcHRpbmcgd2l0aG91dCB1c2VyIGlucHV0XG4gICAgaWYgKCBQRE9NVXRpbHMuVVNFUl9HRVNUVVJFX0VWRU5UUy5pbmNsdWRlcyggZXZlbnRUeXBlICkgKSB7XG4gICAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuXG4gICAgY29uc3QgZG9tRXZlbnQgPSBjb250ZXh0LmRvbUV2ZW50O1xuXG4gICAgLy8gVGhpcyB3b3JrYXJvdW5kIGhvcGVmdWxseSB3b24ndCBiZSBoZXJlIGZvcmV2ZXIsIHNlZSBQYXJhbGxlbERPTS5zZXRFeGNsdWRlTGFiZWxTaWJsaW5nRnJvbUlucHV0KCkgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hMTF5LXJlc2VhcmNoL2lzc3Vlcy8xNTZcbiAgICBpZiAoICEoIGRvbUV2ZW50LnRhcmdldCAmJiAoIGRvbUV2ZW50LnRhcmdldCBhcyBFbGVtZW50ICkuaGFzQXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9FWENMVURFX0ZST01fSU5QVVQgKSApICkge1xuXG4gICAgICAvLyBJZiB0aGUgdHJhaWwgaXMgbm90IHBpY2thYmxlLCBkb24ndCBkaXNwYXRjaCBQRE9NIGV2ZW50cyB0byB0aG9zZSB0YXJnZXRzIC0gYnV0IHdlIHN0aWxsXG4gICAgICAvLyBkaXNwYXRjaCB3aXRoIGFuIGVtcHR5IHRyYWlsIHRvIGNhbGwgbGlzdGVuZXJzIG9uIHRoZSBEaXNwbGF5IGFuZCBQb2ludGVyLlxuICAgICAgY29uc3QgY2FuRmlyZUxpc3RlbmVycyA9IHRyYWlsLmlzUGlja2FibGUoKSB8fCBQRE9NX1VOUElDS0FCTEVfRVZFTlRTLmluY2x1ZGVzKCBldmVudFR5cGUgKTtcblxuICAgICAgaWYgKCAhY2FuRmlyZUxpc3RlbmVycyApIHtcbiAgICAgICAgdHJhaWwgPSBuZXcgVHJhaWwoIFtdICk7XG4gICAgICB9XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBkb21Qb2ludGVyICk7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbCwgZXZlbnRUeXBlLCB0aGlzLnBkb21Qb2ludGVyISwgY29udGV4dCwgYnViYmxlcyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGcm9tIGEgRE9NIEV2ZW50LCBnZXQgaXRzIHJlbGF0ZWRUYXJnZXQgYW5kIG1hcCB0aGF0IHRvIHRoZSBzY2VuZXJ5IE5vZGUuIFdpbGwgcmV0dXJuIG51bGwgaWYgcmVsYXRlZFRhcmdldFxuICAgKiBpcyBub3QgcHJvdmlkZWQsIG9yIGlmIHJlbGF0ZWRUYXJnZXQgaXMgbm90IHVuZGVyIFBET00sIG9yIHRoZXJlIGlzIG5vIGFzc29jaWF0ZWQgTm9kZSB3aXRoIHRyYWlsIGlkIG9uIHRoZVxuICAgKiByZWxhdGVkVGFyZ2V0IGVsZW1lbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gZG9tRXZlbnQgLSBET00gRXZlbnQsIG5vdCBhIFNjZW5lcnlFdmVudCFcbiAgICovXG4gIHB1YmxpYyBnZXRSZWxhdGVkVGFyZ2V0VHJhaWwoIGRvbUV2ZW50OiBGb2N1c0V2ZW50IHwgTW91c2VFdmVudCApOiBUcmFpbCB8IG51bGwge1xuICAgIGNvbnN0IHJlbGF0ZWRUYXJnZXRFbGVtZW50ID0gZG9tRXZlbnQucmVsYXRlZFRhcmdldDtcblxuICAgIGlmICggcmVsYXRlZFRhcmdldEVsZW1lbnQgJiYgdGhpcy5kaXNwbGF5LmlzRWxlbWVudFVuZGVyUERPTSggcmVsYXRlZFRhcmdldEVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsIGZhbHNlICkgKSB7XG5cbiAgICAgIGNvbnN0IHJlbGF0ZWRUYXJnZXQgPSAoIGRvbUV2ZW50LnJlbGF0ZWRUYXJnZXQgYXMgdW5rbm93biBhcyBFbGVtZW50ICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByZWxhdGVkVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgKTtcbiAgICAgIGNvbnN0IHRyYWlsSW5kaWNlcyA9IHJlbGF0ZWRUYXJnZXQuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhaWxJbmRpY2VzLCAnc2hvdWxkIG5vdCBiZSBudWxsJyApO1xuXG4gICAgICByZXR1cm4gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggdGhpcy5kaXNwbGF5LCB0cmFpbEluZGljZXMhICk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdHJhaWwgSUQgb2YgdGhlIG5vZGUgcmVwcmVzZW50ZWQgYnkgYSBET00gZWxlbWVudCB3aG8gaXMgdGhlIHRhcmdldCBvZiBhIERPTSBFdmVudCBpbiB0aGUgYWNjZXNzaWJsZSBQRE9NLlxuICAgKiBUaGlzIGlzIGEgYml0IG9mIGEgbWlzbm9tZXIsIGJlY2F1c2UgdGhlIGRvbUV2ZW50IGRvZXNuJ3QgaGF2ZSB0byBiZSB1bmRlciB0aGUgUERPTS4gUmV0dXJucyBudWxsIGlmIG5vdCBpbiB0aGUgUERPTS5cbiAgICovXG4gIHByaXZhdGUgZ2V0VHJhaWxGcm9tUERPTUV2ZW50KCBkb21FdmVudDogVGFyZ2V0U3Vic3RpdHVkZUF1Z21lbnRlZEV2ZW50ICk6IFRyYWlsIHwgbnVsbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9tRXZlbnQudGFyZ2V0IHx8IGRvbUV2ZW50WyBUQVJHRVRfU1VCU1RJVFVURV9LRVkgXSwgJ25lZWQgYSB3YXkgdG8gZ2V0IHRoZSB0YXJnZXQnICk7XG5cbiAgICBpZiAoICF0aGlzLmRpc3BsYXkuX2FjY2Vzc2libGUgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBjb3VsZCBiZSBzZXJpYWxpemVkIGV2ZW50IGZvciBwaGV0LWlvIHBsYXliYWNrcywgc2VlIElucHV0LnNlcmlhbGl6ZURPTUV2ZW50KClcbiAgICBpZiAoIGRvbUV2ZW50WyBUQVJHRVRfU1VCU1RJVFVURV9LRVkgXSApIHtcbiAgICAgIGNvbnN0IHRyYWlsSW5kaWNlcyA9IGRvbUV2ZW50WyBUQVJHRVRfU1VCU1RJVFVURV9LRVkgXS5nZXRBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX1BET01fVU5JUVVFX0lEICk7XG4gICAgICByZXR1cm4gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggdGhpcy5kaXNwbGF5LCB0cmFpbEluZGljZXMhICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZG9tRXZlbnQudGFyZ2V0O1xuICAgICAgaWYgKCB0YXJnZXQgJiYgdGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQgJiYgdGhpcy5kaXNwbGF5LmlzRWxlbWVudFVuZGVyUERPTSggdGFyZ2V0LCBmYWxzZSApICkge1xuICAgICAgICBjb25zdCB0cmFpbEluZGljZXMgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbEluZGljZXMsICdzaG91bGQgbm90IGJlIG51bGwnICk7XG4gICAgICAgIHJldHVybiBQRE9NSW5zdGFuY2UudW5pcXVlSWRUb1RyYWlsKCB0aGlzLmRpc3BsYXksIHRyYWlsSW5kaWNlcyEgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlZG93biBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdGhlIHBvaW50ZXIgZXZlbnQgaGFuZGxlciAocG9pbnRlckRvd24pIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXG4gICAqL1xuICBwdWJsaWMgbW91c2VEb3duKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW91c2VEb3duKCcke2lkfScsICR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLm1vdXNlRG93bkFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgbW91c2V1cCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdGhlIHBvaW50ZXIgZXZlbnQgaGFuZGxlciAocG9pbnRlclVwKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcbiAgICogcGxheWJhY2suIFRoZSBldmVudCBtYXkgYmUgXCJmYWtlZFwiIGZvciBjZXJ0YWluIHB1cnBvc2VzLlxuICAgKi9cbiAgcHVibGljIG1vdXNlVXAoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBtb3VzZVVwKCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLm1vdXNlVXBBY3Rpb24uZXhlY3V0ZSggcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgbW91c2Vtb3ZlIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyTW92ZSkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cbiAgICovXG4gIHB1YmxpYyBtb3VzZU1vdmUoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBtb3VzZU1vdmUoJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgIHRoaXMubW91c2VNb3ZlQWN0aW9uLmV4ZWN1dGUoIHBvaW50LCBjb250ZXh0ICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgYSBsb2dpY2FsIG1vdXNlb3ZlciBldmVudCAodGhpcyBkb2VzIE5PVCBjb3JyZXNwb25kIHRvIHRoZSBTY2VuZXJ5IGV2ZW50LCBzaW5jZSB0aGlzIGlzIGZvciB0aGUgZGlzcGxheSkgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgbW91c2VPdmVyKCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PE1vdXNlRXZlbnQgfCBQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbW91c2VPdmVyKCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLm1vdXNlT3ZlckFjdGlvbi5leGVjdXRlKCBwb2ludCwgY29udGV4dCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCBtb3VzZW91dCBldmVudCAodGhpcyBkb2VzIE5PVCBjb3JyZXNwb25kIHRvIHRoZSBTY2VuZXJ5IGV2ZW50LCBzaW5jZSB0aGlzIGlzIGZvciB0aGUgZGlzcGxheSkgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgbW91c2VPdXQoIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8TW91c2VFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBtb3VzZU91dCgke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5tb3VzZU91dEFjdGlvbi5leGVjdXRlKCBwb2ludCwgY29udGV4dCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCBtb3VzZS13aGVlbC9zY3JvbGwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHdoZWVsKCBjb250ZXh0OiBFdmVudENvbnRleHQ8V2hlZWxFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGB3aGVlbCgke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLndoZWVsU2Nyb2xsQWN0aW9uLmV4ZWN1dGUoIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgdG91Y2hzdGFydCBldmVudC4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggdG91Y2ggcG9pbnQgaW4gYSAncmF3JyBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IGFsc28gYmUgY2FsbGVkIGZyb20gdGhlIHBvaW50ZXIgZXZlbnQgaGFuZGxlciAocG9pbnRlckRvd24pIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXG4gICAqL1xuICBwdWJsaWMgdG91Y2hTdGFydCggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoU3RhcnQoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLnRvdWNoU3RhcnRBY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgdG91Y2hlbmQgZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHRvdWNoIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJVcCkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cbiAgICovXG4gIHB1YmxpYyB0b3VjaEVuZCggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoRW5kKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy50b3VjaEVuZEFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCB0b3VjaG1vdmUgZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHRvdWNoIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJNb3ZlKSBvciBmcm9tIHRoaW5ncyBsaWtlIGZ1enppbmcgb3JcbiAgICogcGxheWJhY2suIFRoZSBldmVudCBtYXkgYmUgXCJmYWtlZFwiIGZvciBjZXJ0YWluIHB1cnBvc2VzLlxuICAgKi9cbiAgcHVibGljIHRvdWNoTW92ZSggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50PiApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHRvdWNoTW92ZSgnJHtpZH0nLCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLnRvdWNoTW92ZUFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgdG91Y2hjYW5jZWwgZXZlbnQuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHRvdWNoIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJDYW5jZWwpIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXG4gICAqL1xuICBwdWJsaWMgdG91Y2hDYW5jZWwoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8VG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGB0b3VjaENhbmNlbCgnJHtpZH0nLCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLnRvdWNoQ2FuY2VsQWN0aW9uLmV4ZWN1dGUoIGlkLCBwb2ludCwgY29udGV4dCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgbG9naWNhbCBwZW5zdGFydCBldmVudCAoZS5nLiBhIHN0eWx1cykuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHBlbiBwb2ludCBpbiBhICdyYXcnIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyRG93bikgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cbiAgICovXG4gIHB1YmxpYyBwZW5TdGFydCggaWQ6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgcGVuU3RhcnQoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5wZW5TdGFydEFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgcGVuZW5kIGV2ZW50IChlLmcuIGEgc3R5bHVzKS4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggcGVuIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJVcCkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cbiAgICovXG4gIHB1YmxpYyBwZW5FbmQoIGlkOiBudW1iZXIsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHBlbkVuZCgnJHtpZH0nLCR7SW5wdXQuZGVidWdUZXh0KCBwb2ludCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLnBlbkVuZEFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgcGVubW92ZSBldmVudCAoZS5nLiBhIHN0eWx1cykuIFRoaXMgaXMgY2FsbGVkIGZvciBlYWNoIHBlbiBwb2ludCBpbiBhICdyYXcnIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB0aGUgcG9pbnRlciBldmVudCBoYW5kbGVyIChwb2ludGVyTW92ZSkgb3IgZnJvbSB0aGluZ3MgbGlrZSBmdXp6aW5nIG9yXG4gICAqIHBsYXliYWNrLiBUaGUgZXZlbnQgbWF5IGJlIFwiZmFrZWRcIiBmb3IgY2VydGFpbiBwdXJwb3Nlcy5cbiAgICovXG4gIHB1YmxpYyBwZW5Nb3ZlKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBwZW5Nb3ZlKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgIHRoaXMucGVuTW92ZUFjdGlvbi5leGVjdXRlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGxvZ2ljYWwgcGVuY2FuY2VsIGV2ZW50IChlLmcuIGEgc3R5bHVzKS4gVGhpcyBpcyBjYWxsZWQgZm9yIGVhY2ggcGVuIHBvaW50IGluIGEgJ3JhdycgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHRoZSBwb2ludGVyIGV2ZW50IGhhbmRsZXIgKHBvaW50ZXJDYW5jZWwpIG9yIGZyb20gdGhpbmdzIGxpa2UgZnV6emluZyBvclxuICAgKiBwbGF5YmFjay4gVGhlIGV2ZW50IG1heSBiZSBcImZha2VkXCIgZm9yIGNlcnRhaW4gcHVycG9zZXMuXG4gICAqL1xuICBwdWJsaWMgcGVuQ2FuY2VsKCBpZDogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBwZW5DYW5jZWwoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggcG9pbnQsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5wZW5DYW5jZWxBY3Rpb24uZXhlY3V0ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJkb3duIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9pbnRlckRvd24oIGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZywgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIC8vIEluIElFIGZvciBwb2ludGVyIGRvd24gZXZlbnRzLCB3ZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGFuIHRoZSBuZXh0IGludGVyYWN0aW9ucyBvZmYgdGhlIHBhZ2UgYXJlIHNlbnQgdG9cbiAgICAvLyB0aGlzIGVsZW1lbnQgKGl0IHdpbGwgYnViYmxlKS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy80NjQgYW5kXG4gICAgLy8gaHR0cDovL25ld3MucW9veGRvby5vcmcvbW91c2UtY2FwdHVyaW5nLlxuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYXR0YWNoVG9XaW5kb3cgPyBkb2N1bWVudC5ib2R5IDogdGhpcy5kaXNwbGF5LmRvbUVsZW1lbnQ7XG4gICAgaWYgKCB0YXJnZXQuc2V0UG9pbnRlckNhcHR1cmUgJiYgY29udGV4dC5kb21FdmVudC5wb2ludGVySWQgJiYgIWNvbnRleHQuYWxsb3dzRE9NSW5wdXQoKSApIHtcbiAgICAgIC8vIE5PVEU6IFRoaXMgd2lsbCBlcnJvciBvdXQgaWYgcnVuIG9uIGEgcGxheWJhY2sgZGVzdGluYXRpb24sIHdoZXJlIGEgcG9pbnRlciB3aXRoIHRoZSBnaXZlbiBJRCBkb2VzIG5vdCBleGlzdC5cbiAgICAgIHRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZSggY29udGV4dC5kb21FdmVudC5wb2ludGVySWQgKTtcbiAgICB9XG5cbiAgICB0eXBlID0gdGhpcy5oYW5kbGVVbmtub3duUG9pbnRlclR5cGUoIHR5cGUsIGlkICk7XG4gICAgc3dpdGNoKCB0eXBlICkge1xuICAgICAgY2FzZSAnbW91c2UnOlxuICAgICAgICAvLyBUaGUgYWN0dWFsIGV2ZW50IGFmdGVyd2FyZHNcbiAgICAgICAgdGhpcy5tb3VzZURvd24oIGlkLCBwb2ludCwgY29udGV4dCApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RvdWNoJzpcbiAgICAgICAgdGhpcy50b3VjaFN0YXJ0KCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwZW4nOlxuICAgICAgICB0aGlzLnBlblN0YXJ0KCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmtub3duIHBvaW50ZXIgdHlwZTogJHt0eXBlfWAgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcnVwIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9pbnRlclVwKCBpZDogbnVtYmVyLCB0eXBlOiBzdHJpbmcsIHBvaW50OiBWZWN0b3IyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8UG9pbnRlckV2ZW50PiApOiB2b2lkIHtcblxuICAgIC8vIHVwZGF0ZSB0aGlzIG91dHNpZGUgb2YgdGhlIEFjdGlvbiBleGVjdXRpb25zIHNvIHRoYXQgUGhFVC1pTyBldmVudCBwbGF5YmFjayBkb2VzIG5vdCBvdmVycmlkZSBpdFxuICAgIHRoaXMudXBUaW1lU3RhbXAgPSBjb250ZXh0LmRvbUV2ZW50LnRpbWVTdGFtcDtcblxuICAgIHR5cGUgPSB0aGlzLmhhbmRsZVVua25vd25Qb2ludGVyVHlwZSggdHlwZSwgaWQgKTtcbiAgICBzd2l0Y2goIHR5cGUgKSB7XG4gICAgICBjYXNlICdtb3VzZSc6XG4gICAgICAgIHRoaXMubW91c2VVcCggcG9pbnQsIGNvbnRleHQgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0b3VjaCc6XG4gICAgICAgIHRoaXMudG91Y2hFbmQoIGlkLCBwb2ludCwgY29udGV4dCApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Blbic6XG4gICAgICAgIHRoaXMucGVuRW5kKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbmtub3duIHBvaW50ZXIgdHlwZTogJHt0eXBlfWAgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcmNhbmNlbCBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHBvaW50ZXJDYW5jZWwoIGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZywgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIHR5cGUgPSB0aGlzLmhhbmRsZVVua25vd25Qb2ludGVyVHlwZSggdHlwZSwgaWQgKTtcbiAgICBzd2l0Y2goIHR5cGUgKSB7XG4gICAgICBjYXNlICdtb3VzZSc6XG4gICAgICAgIGlmICggY29uc29sZSAmJiBjb25zb2xlLmxvZyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ1dBUk5JTkc6IFBvaW50ZXIgbW91c2UgY2FuY2VsIHdhcyByZWNlaXZlZCcgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RvdWNoJzpcbiAgICAgICAgdGhpcy50b3VjaENhbmNlbCggaWQsIHBvaW50LCBjb250ZXh0ICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGVuJzpcbiAgICAgICAgdGhpcy5wZW5DYW5jZWwoIGlkLCBwb2ludCwgY29udGV4dCApO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmICggY29uc29sZS5sb2cgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGBVbmtub3duIHBvaW50ZXIgdHlwZTogJHt0eXBlfWAgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgZ290cG9pbnRlcmNhcHR1cmUgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnb3RQb2ludGVyQ2FwdHVyZSggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgZ290UG9pbnRlckNhcHR1cmUoJyR7aWR9Jywke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICB0aGlzLmdvdFBvaW50ZXJDYXB0dXJlQWN0aW9uLmV4ZWN1dGUoIGlkLCBjb250ZXh0ICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGxvc3Rwb2ludGVyY2FwdHVyZSBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGxvc3RQb2ludGVyQ2FwdHVyZSggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgbG9zdFBvaW50ZXJDYXB0dXJlKCcke2lkfScsJHtJbnB1dC5kZWJ1Z1RleHQoIG51bGwsIGNvbnRleHQuZG9tRXZlbnQgKX0pO2AgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgdGhpcy5sb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24uZXhlY3V0ZSggaWQsIGNvbnRleHQgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgcG9pbnRlcm1vdmUgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBwb2ludGVyTW92ZSggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgdHlwZSA9IHRoaXMuaGFuZGxlVW5rbm93blBvaW50ZXJUeXBlKCB0eXBlLCBpZCApO1xuICAgIHN3aXRjaCggdHlwZSApIHtcbiAgICAgIGNhc2UgJ21vdXNlJzpcbiAgICAgICAgdGhpcy5tb3VzZU1vdmUoIHBvaW50LCBjb250ZXh0ICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndG91Y2gnOlxuICAgICAgICB0aGlzLnRvdWNoTW92ZSggaWQsIHBvaW50LCBjb250ZXh0ICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGVuJzpcbiAgICAgICAgdGhpcy5wZW5Nb3ZlKCBpZCwgcG9pbnQsIGNvbnRleHQgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoIGNvbnNvbGUubG9nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgVW5rbm93biBwb2ludGVyIHR5cGU6ICR7dHlwZX1gICk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJvdmVyIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9pbnRlck92ZXIoIGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZywgcG9pbnQ6IFZlY3RvcjIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxQb2ludGVyRXZlbnQ+ICk6IHZvaWQge1xuICAgIC8vIFRPRE86IGFjY3VtdWxhdGUgbW91c2UvdG91Y2ggaW5mbyBpbiB0aGUgb2JqZWN0IGlmIG5lZWRlZD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAvLyBUT0RPOiBkbyB3ZSB3YW50IHRvIGJyYW5jaCBjaGFuZ2Ugb24gdGhlc2UgdHlwZXMgb2YgZXZlbnRzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgYSBwb2ludGVyb3V0IGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcG9pbnRlck91dCggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgLy8gVE9ETzogYWNjdW11bGF0ZSBtb3VzZS90b3VjaCBpbmZvIGluIHRoZSBvYmplY3QgaWYgbmVlZGVkPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIFRPRE86IGRvIHdlIHdhbnQgdG8gYnJhbmNoIGNoYW5nZSBvbiB0aGVzZSB0eXBlcyBvZiBldmVudHM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJlbnRlciBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHBvaW50ZXJFbnRlciggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgLy8gVE9ETzogYWNjdW11bGF0ZSBtb3VzZS90b3VjaCBpbmZvIGluIHRoZSBvYmplY3QgaWYgbmVlZGVkPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIFRPRE86IGRvIHdlIHdhbnQgdG8gYnJhbmNoIGNoYW5nZSBvbiB0aGVzZSB0eXBlcyBvZiBldmVudHM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIHBvaW50ZXJsZWF2ZSBldmVudCwgZm9yd2FyZGluZyBpdCB0byB0aGUgcHJvcGVyIGxvZ2ljYWwgZXZlbnQuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHBvaW50ZXJMZWF2ZSggaWQ6IG51bWJlciwgdHlwZTogc3RyaW5nLCBwb2ludDogVmVjdG9yMiwgY29udGV4dDogRXZlbnRDb250ZXh0PFBvaW50ZXJFdmVudD4gKTogdm9pZCB7XG4gICAgLy8gVE9ETzogYWNjdW11bGF0ZSBtb3VzZS90b3VjaCBpbmZvIGluIHRoZSBvYmplY3QgaWYgbmVlZGVkPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIC8vIFRPRE86IGRvIHdlIHdhbnQgdG8gYnJhbmNoIGNoYW5nZSBvbiB0aGVzZSB0eXBlcyBvZiBldmVudHM/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGZvY3VzaW4gZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBmb2N1c0luKCBjb250ZXh0OiBFdmVudENvbnRleHQ8Rm9jdXNFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBmb2N1c0luKCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHRoaXMuZm9jdXNpbkFjdGlvbi5leGVjdXRlKCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgZm9jdXNvdXQgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBmb2N1c091dCggY29udGV4dDogRXZlbnRDb250ZXh0PEZvY3VzRXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgZm9jdXNPdXQoJyR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5mb2N1c291dEFjdGlvbi5leGVjdXRlKCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGFuIGlucHV0IGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgaW5wdXQoIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxFdmVudCB8IElucHV0RXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgaW5wdXQoJyR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5pbnB1dEFjdGlvbi5leGVjdXRlKCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgY2hhbmdlIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgY2hhbmdlKCBjb250ZXh0OiBFdmVudENvbnRleHQgKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBjaGFuZ2UoJyR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5jaGFuZ2VBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGNsaWNrIGV2ZW50LCBmb3J3YXJkaW5nIGl0IHRvIHRoZSBwcm9wZXIgbG9naWNhbCBldmVudC4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgY2xpY2soIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxNb3VzZUV2ZW50PiApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYGNsaWNrKCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHRoaXMuY2xpY2tBY3Rpb24uZXhlY3V0ZSggY29udGV4dCApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGtleWRvd24gZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBrZXlEb3duKCBjb250ZXh0OiBFdmVudENvbnRleHQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBrZXlEb3duKCcke0lucHV0LmRlYnVnVGV4dCggbnVsbCwgY29udGV4dC5kb21FdmVudCApfSk7YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIHRoaXMua2V5ZG93bkFjdGlvbi5leGVjdXRlKCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEga2V5dXAgZXZlbnQsIGZvcndhcmRpbmcgaXQgdG8gdGhlIHByb3BlciBsb2dpY2FsIGV2ZW50LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBrZXlVcCggY29udGV4dDogRXZlbnRDb250ZXh0PEtleWJvYXJkRXZlbnQ+ICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBga2V5VXAoJyR7SW5wdXQuZGVidWdUZXh0KCBudWxsLCBjb250ZXh0LmRvbUV2ZW50ICl9KTtgICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5rZXl1cEFjdGlvbi5leGVjdXRlKCBjb250ZXh0ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHdlIGdldCBhbiB1bmtub3duIHBvaW50ZXIgZXZlbnQgdHlwZSAoYWxsb3dlZCBpbiB0aGUgc3BlYywgc2VlXG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Qb2ludGVyRXZlbnQvcG9pbnRlclR5cGUpLCB3ZSdsbCB0cnkgdG8gZ3Vlc3MgdGhlIHBvaW50ZXIgdHlwZVxuICAgKiBzbyB0aGF0IHdlIGNhbiBwcm9wZXJseSBzdGFydC9lbmQgdGhlIGludGVyYWN0aW9uLiBOT1RFOiB0aGlzIGNhbiBoYXBwZW4gZm9yIGFuICd1cCcgd2hlcmUgd2UgcmVjZWl2ZWQgYVxuICAgKiBwcm9wZXIgdHlwZSBmb3IgYSAnZG93bicsIHNvIHRodXMgd2UgbmVlZCB0aGUgZGV0ZWN0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVVbmtub3duUG9pbnRlclR5cGUoIHR5cGU6IHN0cmluZywgaWQ6IG51bWJlciApOiBzdHJpbmcge1xuICAgIGlmICggdHlwZSAhPT0gJycgKSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gICAgcmV0dXJuICggdGhpcy5tb3VzZSAmJiB0aGlzLm1vdXNlLmlkID09PSBpZCApID8gJ21vdXNlJyA6ICd0b3VjaCc7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBwb2ludGVyIHJlZmVyZW5jZSwgaGl0IHRlc3QgaXQgYW5kIGRldGVybWluZSB0aGUgVHJhaWwgdGhhdCB0aGUgcG9pbnRlciBpcyBvdmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRQb2ludGVyVHJhaWwoIHBvaW50ZXI6IFBvaW50ZXIgKTogVHJhaWwge1xuICAgIHJldHVybiB0aGlzLnJvb3ROb2RlLnRyYWlsVW5kZXJQb2ludGVyKCBwb2ludGVyICkgfHwgbmV3IFRyYWlsKCB0aGlzLnJvb3ROb2RlICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJ1cFwiIGV2ZW50LCBmb3IgYW55IHBvaW50ZXIgdHlwZS5cbiAgICovXG4gIHByaXZhdGUgdXBFdmVudDxET01FdmVudCBleHRlbmRzIEV2ZW50PiggcG9pbnRlcjogUG9pbnRlciwgY29udGV4dDogRXZlbnRDb250ZXh0PERPTUV2ZW50PiwgcG9pbnQ6IFZlY3RvcjIgKTogdm9pZCB7XG4gICAgLy8gaWYgdGhlIGV2ZW50IHRhcmdldCBpcyB3aXRoaW4gdGhlIFBET00gdGhlIEFUIGlzIHNlbmRpbmcgYSBmYWtlIHBvaW50ZXIgZXZlbnQgdG8gdGhlIGRvY3VtZW50IC0gZG8gbm90XG4gICAgLy8gZGlzcGF0Y2ggdGhpcyBzaW5jZSB0aGUgUERPTSBzaG91bGQgb25seSBoYW5kbGUgSW5wdXQuUERPTV9FVkVOVF9UWVBFUywgYW5kIGFsbCBvdGhlciBwb2ludGVyIGlucHV0IHNob3VsZFxuICAgIC8vIGdvIHRocm91Z2ggdGhlIERpc3BsYXkgZGl2LiBPdGhlcndpc2UsIGFjdGl2YXRpb24gd2lsbCBiZSBkdXBsaWNhdGVkIHdoZW4gd2UgaGFuZGxlIHBvaW50ZXIgYW5kIFBET00gZXZlbnRzXG4gICAgaWYgKCB0aGlzLmRpc3BsYXkuaXNFbGVtZW50VW5kZXJQRE9NKCBjb250ZXh0LmRvbUV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCwgdHJ1ZSApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBvaW50Q2hhbmdlZCA9IHBvaW50ZXIudXAoIHBvaW50LCBjb250ZXh0LmRvbUV2ZW50ICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXQgJiYgc2NlbmVyeUxvZy5JbnB1dCggYHVwRXZlbnQgJHtwb2ludGVyLnRvU3RyaW5nKCl9IGNoYW5nZWQ6JHtwb2ludENoYW5nZWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIFdlJ2xsIHVzZSB0aGlzIHRyYWlsIGZvciB0aGUgZW50aXJlIGRpc3BhdGNoIG9mIHRoaXMgZXZlbnQuXG4gICAgY29uc3QgZXZlbnRUcmFpbCA9IHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgcG9pbnRDaGFuZ2VkICk7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCBldmVudFRyYWlsLCAndXAnLCBwb2ludGVyLCBjb250ZXh0LCB0cnVlICk7XG5cbiAgICAvLyB0b3VjaCBwb2ludGVycyBhcmUgdHJhbnNpZW50LCBzbyBmaXJlIGV4aXQvb3V0IHRvIHRoZSB0cmFpbCBhZnRlcndhcmRzXG4gICAgaWYgKCBwb2ludGVyLmlzVG91Y2hMaWtlKCkgKSB7XG4gICAgICB0aGlzLmV4aXRFdmVudHM8RE9NRXZlbnQ+KCBwb2ludGVyLCBjb250ZXh0LCBldmVudFRyYWlsLCAwLCB0cnVlICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJkb3duXCIgZXZlbnQsIGZvciBhbnkgcG9pbnRlciB0eXBlLlxuICAgKi9cbiAgcHJpdmF0ZSBkb3duRXZlbnQ8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIHBvaW50OiBWZWN0b3IyICk6IHZvaWQge1xuICAgIC8vIGlmIHRoZSBldmVudCB0YXJnZXQgaXMgd2l0aGluIHRoZSBQRE9NIHRoZSBBVCBpcyBzZW5kaW5nIGEgZmFrZSBwb2ludGVyIGV2ZW50IHRvIHRoZSBkb2N1bWVudCAtIGRvIG5vdFxuICAgIC8vIGRpc3BhdGNoIHRoaXMgc2luY2UgdGhlIFBET00gc2hvdWxkIG9ubHkgaGFuZGxlIElucHV0LlBET01fRVZFTlRfVFlQRVMsIGFuZCBhbGwgb3RoZXIgcG9pbnRlciBpbnB1dCBzaG91bGRcbiAgICAvLyBnbyB0aHJvdWdoIHRoZSBEaXNwbGF5IGRpdi4gT3RoZXJ3aXNlLCBhY3RpdmF0aW9uIHdpbGwgYmUgZHVwbGljYXRlZCB3aGVuIHdlIGhhbmRsZSBwb2ludGVyIGFuZCBQRE9NIGV2ZW50c1xuICAgIGlmICggdGhpcy5kaXNwbGF5LmlzRWxlbWVudFVuZGVyUERPTSggY29udGV4dC5kb21FdmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRydWUgKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSBwb2ludGVyLnVwZGF0ZVBvaW50KCBwb2ludCApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBkb3duRXZlbnQgJHtwb2ludGVyLnRvU3RyaW5nKCl9IGNoYW5nZWQ6JHtwb2ludENoYW5nZWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIFdlJ2xsIHVzZSB0aGlzIHRyYWlsIGZvciB0aGUgZW50aXJlIGRpc3BhdGNoIG9mIHRoaXMgZXZlbnQuXG4gICAgY29uc3QgZXZlbnRUcmFpbCA9IHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgcG9pbnRDaGFuZ2VkICk7XG5cbiAgICBwb2ludGVyLmRvd24oIGNvbnRleHQuZG9tRXZlbnQgKTtcblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIGV2ZW50VHJhaWwsICdkb3duJywgcG9pbnRlciwgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJtb3ZlXCIgZXZlbnQsIGZvciBhbnkgcG9pbnRlciB0eXBlLlxuICAgKi9cbiAgcHJpdmF0ZSBtb3ZlRXZlbnQ8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4gKTogdm9pZCB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoIGBtb3ZlRXZlbnQgJHtwb2ludGVyLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIEFsd2F5cyB0cmVhdCBtb3ZlIGV2ZW50cyBhcyBcInBvaW50IGNoYW5nZWRcIlxuICAgIHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZvciBlYWNoIGxvZ2ljYWwgXCJjYW5jZWxcIiBldmVudCwgZm9yIGFueSBwb2ludGVyIHR5cGUuXG4gICAqL1xuICBwcml2YXRlIGNhbmNlbEV2ZW50PERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCBwb2ludDogVmVjdG9yMiApOiB2b2lkIHtcbiAgICBjb25zdCBwb2ludENoYW5nZWQgPSBwb2ludGVyLmNhbmNlbCggcG9pbnQgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCBgY2FuY2VsRXZlbnQgJHtwb2ludGVyLnRvU3RyaW5nKCl9IGNoYW5nZWQ6JHtwb2ludENoYW5nZWR9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIFdlJ2xsIHVzZSB0aGlzIHRyYWlsIGZvciB0aGUgZW50aXJlIGRpc3BhdGNoIG9mIHRoaXMgZXZlbnQuXG4gICAgY29uc3QgZXZlbnRUcmFpbCA9IHRoaXMuYnJhbmNoQ2hhbmdlRXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgcG9pbnRDaGFuZ2VkICk7XG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCBldmVudFRyYWlsLCAnY2FuY2VsJywgcG9pbnRlciwgY29udGV4dCwgdHJ1ZSApO1xuXG4gICAgLy8gdG91Y2ggcG9pbnRlcnMgYXJlIHRyYW5zaWVudCwgc28gZmlyZSBleGl0L291dCB0byB0aGUgdHJhaWwgYWZ0ZXJ3YXJkc1xuICAgIGlmICggcG9pbnRlci5pc1RvdWNoTGlrZSgpICkge1xuICAgICAgdGhpcy5leGl0RXZlbnRzPERPTUV2ZW50PiggcG9pbnRlciwgY29udGV4dCwgZXZlbnRUcmFpbCwgMCwgdHJ1ZSApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW55IG5lY2Vzc2FyeSBldmVudHMgdGhhdCB3b3VsZCByZXN1bHQgZnJvbSB0aGUgcG9pbnRlcidzIHRyYWlsIGNoYW5naW5nLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgc2VuZCB0aGUgbmVjZXNzYXJ5IGV4aXQvZW50ZXIgZXZlbnRzIChvbiBzdWJ0cmFpbHMgdGhhdCBoYXZlIGRpdmVyZ2VkIGJldHdlZW4gYmVmb3JlL2FmdGVyKSwgdGhlXG4gICAqIG91dC9vdmVyIGV2ZW50cywgYW5kIGlmIGZsYWdnZWQgYSBtb3ZlIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gcG9pbnRlclxuICAgKiBAcGFyYW0gY29udGV4dFxuICAgKiBAcGFyYW0gc2VuZE1vdmUgLSBXaGV0aGVyIHRvIHNlbmQgbW92ZSBldmVudHNcbiAgICogQHJldHVybnMgLSBUaGUgY3VycmVudCB0cmFpbCBvZiB0aGUgcG9pbnRlclxuICAgKi9cbiAgcHJpdmF0ZSBicmFuY2hDaGFuZ2VFdmVudHM8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIHNlbmRNb3ZlOiBib29sZWFuICk6IFRyYWlsIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoXG4gICAgICBgYnJhbmNoQ2hhbmdlRXZlbnRzOiAke3BvaW50ZXIudG9TdHJpbmcoKX0gc2VuZE1vdmU6JHtzZW5kTW92ZX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCB0cmFpbCA9IHRoaXMuZ2V0UG9pbnRlclRyYWlsKCBwb2ludGVyICk7XG5cbiAgICBjb25zdCBpbnB1dEVuYWJsZWRUcmFpbCA9IHRyYWlsLnNsaWNlKCAwLCBNYXRoLm1pbiggdHJhaWwubm9kZXMubGVuZ3RoLCB0cmFpbC5nZXRMYXN0SW5wdXRFbmFibGVkSW5kZXgoKSArIDEgKSApO1xuICAgIGNvbnN0IG9sZElucHV0RW5hYmxlZFRyYWlsID0gcG9pbnRlci5pbnB1dEVuYWJsZWRUcmFpbCB8fCBuZXcgVHJhaWwoIHRoaXMucm9vdE5vZGUgKTtcbiAgICBjb25zdCBicmFuY2hJbnB1dEVuYWJsZWRJbmRleCA9IFRyYWlsLmJyYW5jaEluZGV4KCBpbnB1dEVuYWJsZWRUcmFpbCwgb2xkSW5wdXRFbmFibGVkVHJhaWwgKTtcbiAgICBjb25zdCBsYXN0SW5wdXRFbmFibGVkTm9kZUNoYW5nZWQgPSBvbGRJbnB1dEVuYWJsZWRUcmFpbC5sYXN0Tm9kZSgpICE9PSBpbnB1dEVuYWJsZWRUcmFpbC5sYXN0Tm9kZSgpO1xuXG4gICAgaWYgKCBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCApIHtcbiAgICAgIGNvbnN0IG9sZFRyYWlsID0gcG9pbnRlci50cmFpbCB8fCBuZXcgVHJhaWwoIHRoaXMucm9vdE5vZGUgKTtcbiAgICAgIGNvbnN0IGJyYW5jaEluZGV4ID0gVHJhaWwuYnJhbmNoSW5kZXgoIHRyYWlsLCBvbGRUcmFpbCApO1xuXG4gICAgICAoIGJyYW5jaEluZGV4ICE9PSB0cmFpbC5sZW5ndGggfHwgYnJhbmNoSW5kZXggIT09IG9sZFRyYWlsLmxlbmd0aCApICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudChcbiAgICAgICAgYGNoYW5nZWQgZnJvbSAke29sZFRyYWlsLnRvU3RyaW5nKCl9IHRvICR7dHJhaWwudG9TdHJpbmcoKX1gICk7XG4gICAgfVxuXG4gICAgLy8gZXZlbnQgb3JkZXIgbWF0Y2hlcyBodHRwOi8vd3d3LnczLm9yZy9UUi9ET00tTGV2ZWwtMy1FdmVudHMvI2V2ZW50cy1tb3VzZWV2ZW50LWV2ZW50LW9yZGVyXG4gICAgaWYgKCBzZW5kTW92ZSApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLCAnbW92ZScsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3YW50IHRvIGFwcHJveGltYXRlbHkgbWltaWMgaHR0cDovL3d3dy53My5vcmcvVFIvRE9NLUxldmVsLTMtRXZlbnRzLyNldmVudHMtbW91c2VldmVudC1ldmVudC1vcmRlclxuICAgIHRoaXMuZXhpdEV2ZW50czxET01FdmVudD4oIHBvaW50ZXIsIGNvbnRleHQsIG9sZElucHV0RW5hYmxlZFRyYWlsLCBicmFuY2hJbnB1dEVuYWJsZWRJbmRleCwgbGFzdElucHV0RW5hYmxlZE5vZGVDaGFuZ2VkICk7XG4gICAgdGhpcy5lbnRlckV2ZW50czxET01FdmVudD4oIHBvaW50ZXIsIGNvbnRleHQsIGlucHV0RW5hYmxlZFRyYWlsLCBicmFuY2hJbnB1dEVuYWJsZWRJbmRleCwgbGFzdElucHV0RW5hYmxlZE5vZGVDaGFuZ2VkICk7XG5cbiAgICBwb2ludGVyLnRyYWlsID0gdHJhaWw7XG4gICAgcG9pbnRlci5pbnB1dEVuYWJsZWRUcmFpbCA9IGlucHV0RW5hYmxlZFRyYWlsO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICByZXR1cm4gdHJhaWw7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlcnMgJ2VudGVyJyBldmVudHMgYWxvbmcgYSB0cmFpbCBjaGFuZ2UsIGFuZCBhbiAnb3ZlcicgZXZlbnQgb24gdGhlIGxlYWYuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBpZiB3ZSBjaGFuZ2UgZnJvbSBhIHRyYWlsIFsgYSwgYiwgYywgZCwgZSBdID0+IFsgYSwgYiwgeCwgeSBdLCBpdCB3aWxsIGZpcmU6XG4gICAqXG4gICAqIC0gZW50ZXIgeFxuICAgKiAtIGVudGVyIHlcbiAgICogLSBvdmVyIHkgKGJ1YmJsZXMpXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludGVyXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gdHJhaWwgLSBUaGUgXCJuZXdcIiB0cmFpbFxuICAgKiBAcGFyYW0gYnJhbmNoSW5kZXggLSBUaGUgZmlyc3QgaW5kZXggd2hlcmUgdGhlIG9sZCBhbmQgbmV3IHRyYWlscyBoYXZlIGEgZGlmZmVyZW50IG5vZGUuIFdlIHdpbGwgbm90aWZ5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGlzIG5vZGUgYW5kIGFsbCBcImRlc2NlbmRhbnRcIiBub2RlcyBpbiB0aGUgcmVsZXZhbnQgdHJhaWwuXG4gICAqIEBwYXJhbSBsYXN0Tm9kZUNoYW5nZWQgLSBJZiB0aGUgbGFzdCBub2RlIGRpZG4ndCBjaGFuZ2UsIHdlIHdvbid0IHNlbnQgYW4gb3ZlciBldmVudC5cbiAgICovXG4gIHByaXZhdGUgZW50ZXJFdmVudHM8RE9NRXZlbnQgZXh0ZW5kcyBFdmVudD4oIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIHRyYWlsOiBUcmFpbCwgYnJhbmNoSW5kZXg6IG51bWJlciwgbGFzdE5vZGVDaGFuZ2VkOiBib29sZWFuICk6IHZvaWQge1xuICAgIGlmICggbGFzdE5vZGVDaGFuZ2VkICkge1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50PERPTUV2ZW50PiggdHJhaWwsICdvdmVyJywgcG9pbnRlciwgY29udGV4dCwgdHJ1ZSwgdHJ1ZSApO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gYnJhbmNoSW5kZXg7IGkgPCB0cmFpbC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLnNsaWNlKCAwLCBpICsgMSApLCAnZW50ZXInLCBwb2ludGVyLCBjb250ZXh0LCBmYWxzZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyAnZXhpdCcgZXZlbnRzIGFsb25nIGEgdHJhaWwgY2hhbmdlLCBhbmQgYW4gJ291dCcgZXZlbnQgb24gdGhlIGxlYWYuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBpZiB3ZSBjaGFuZ2UgZnJvbSBhIHRyYWlsIFsgYSwgYiwgYywgZCwgZSBdID0+IFsgYSwgYiwgeCwgeSBdLCBpdCB3aWxsIGZpcmU6XG4gICAqXG4gICAqIC0gb3V0IGUgKGJ1YmJsZXMpXG4gICAqIC0gZXhpdCBjXG4gICAqIC0gZXhpdCBkXG4gICAqIC0gZXhpdCBlXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludGVyXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gdHJhaWwgLSBUaGUgXCJvbGRcIiB0cmFpbFxuICAgKiBAcGFyYW0gYnJhbmNoSW5kZXggLSBUaGUgZmlyc3QgaW5kZXggd2hlcmUgdGhlIG9sZCBhbmQgbmV3IHRyYWlscyBoYXZlIGEgZGlmZmVyZW50IG5vZGUuIFdlIHdpbGwgbm90aWZ5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB0aGlzIG5vZGUgYW5kIGFsbCBcImRlc2NlbmRhbnRcIiBub2RlcyBpbiB0aGUgcmVsZXZhbnQgdHJhaWwuXG4gICAqIEBwYXJhbSBsYXN0Tm9kZUNoYW5nZWQgLSBJZiB0aGUgbGFzdCBub2RlIGRpZG4ndCBjaGFuZ2UsIHdlIHdvbid0IHNlbnQgYW4gb3V0IGV2ZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBleGl0RXZlbnRzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBjb250ZXh0OiBFdmVudENvbnRleHQ8RE9NRXZlbnQ+LCB0cmFpbDogVHJhaWwsIGJyYW5jaEluZGV4OiBudW1iZXIsIGxhc3ROb2RlQ2hhbmdlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IHRyYWlsLmxlbmd0aCAtIDE7IGkgPj0gYnJhbmNoSW5kZXg7IGktLSApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudDxET01FdmVudD4oIHRyYWlsLnNsaWNlKCAwLCBpICsgMSApLCAnZXhpdCcsIHBvaW50ZXIsIGNvbnRleHQsIGZhbHNlLCB0cnVlICk7XG4gICAgfVxuXG4gICAgaWYgKCBsYXN0Tm9kZUNoYW5nZWQgKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbCwgJ291dCcsIHBvaW50ZXIsIGNvbnRleHQsIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2ggdG8gYWxsIG5vZGVzIGluIHRoZSBUcmFpbCwgb3B0aW9uYWxseSBidWJibGluZyBkb3duIGZyb20gdGhlIGxlYWYgdG8gdGhlIHJvb3QuXG4gICAqXG4gICAqIEBwYXJhbSB0cmFpbFxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gcG9pbnRlclxuICAgKiBAcGFyYW0gY29udGV4dFxuICAgKiBAcGFyYW0gYnViYmxlcyAtIElmIGJ1YmJsZXMgaXMgZmFsc2UsIHRoZSBldmVudCBpcyBvbmx5IGRpc3BhdGNoZWQgdG8gdGhlIGxlYWYgbm9kZSBvZiB0aGUgdHJhaWwuXG4gICAqIEBwYXJhbSBmaXJlT25JbnB1dERpc2FibGVkIC0gV2hldGhlciB0byBmaXJlIHRoaXMgZXZlbnQgZXZlbiBpZiBub2RlcyBoYXZlIGlucHV0RW5hYmxlZDpmYWxzZVxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaEV2ZW50PERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCB0cmFpbDogVHJhaWwsIHR5cGU6IFN1cHBvcnRlZEV2ZW50VHlwZXMsIHBvaW50ZXI6IFBvaW50ZXIsIGNvbnRleHQ6IEV2ZW50Q29udGV4dDxET01FdmVudD4sIGJ1YmJsZXM6IGJvb2xlYW4sIGZpcmVPbklucHV0RGlzYWJsZWQgPSBmYWxzZSApOiB2b2lkIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2goXG4gICAgICBgJHt0eXBlfSB0cmFpbDoke3RyYWlsLnRvU3RyaW5nKCl9IHBvaW50ZXI6JHtwb2ludGVyLnRvU3RyaW5nKCl9IGF0ICR7cG9pbnRlci5wb2ludCA/IHBvaW50ZXIucG9pbnQudG9TdHJpbmcoKSA6ICdudWxsJ31gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbCwgJ0ZhbHN5IHRyYWlsIGZvciBkaXNwYXRjaEV2ZW50JyApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50UGF0aCAmJiBzY2VuZXJ5TG9nLkV2ZW50UGF0aCggYCR7dHlwZX0gJHt0cmFpbC50b1BhdGhTdHJpbmcoKX1gICk7XG5cbiAgICAvLyBOT1RFOiBldmVudCBpcyBub3QgaW1tdXRhYmxlLCBhcyBpdHMgY3VycmVudFRhcmdldCBjaGFuZ2VzXG4gICAgY29uc3QgaW5wdXRFdmVudCA9IG5ldyBTY2VuZXJ5RXZlbnQ8RE9NRXZlbnQ+KCB0cmFpbCwgdHlwZSwgcG9pbnRlciwgY29udGV4dCApO1xuXG4gICAgdGhpcy5jdXJyZW50U2NlbmVyeUV2ZW50ID0gaW5wdXRFdmVudDtcblxuICAgIC8vIGZpcnN0IHJ1biB0aHJvdWdoIHRoZSBwb2ludGVyJ3MgbGlzdGVuZXJzIHRvIHNlZSBpZiBvbmUgb2YgdGhlbSB3aWxsIGhhbmRsZSB0aGUgZXZlbnRcbiAgICB0aGlzLmRpc3BhdGNoVG9MaXN0ZW5lcnM8RE9NRXZlbnQ+KCBwb2ludGVyLCBwb2ludGVyLmdldExpc3RlbmVycygpLCB0eXBlLCBpbnB1dEV2ZW50ICk7XG5cbiAgICAvLyBpZiBub3QgeWV0IGhhbmRsZWQsIHJ1biB0aHJvdWdoIHRoZSB0cmFpbCBpbiBvcmRlciB0byBzZWUgaWYgb25lIG9mIHRoZW0gd2lsbCBoYW5kbGUgdGhlIGV2ZW50XG4gICAgLy8gYXQgdGhlIGJhc2Ugb2YgdGhlIHRyYWlsIHNob3VsZCBiZSB0aGUgc2NlbmUgbm9kZSwgc28gdGhlIHNjZW5lIHdpbGwgYmUgbm90aWZpZWQgbGFzdFxuICAgIHRoaXMuZGlzcGF0Y2hUb1RhcmdldHM8RE9NRXZlbnQ+KCB0cmFpbCwgdHlwZSwgcG9pbnRlciwgaW5wdXRFdmVudCwgYnViYmxlcywgZmlyZU9uSW5wdXREaXNhYmxlZCApO1xuXG4gICAgLy8gTm90aWZ5IGlucHV0IGxpc3RlbmVycyBvbiB0aGUgRGlzcGxheVxuICAgIHRoaXMuZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudD4oIHBvaW50ZXIsIHRoaXMuZGlzcGxheS5nZXRJbnB1dExpc3RlbmVycygpLCB0eXBlLCBpbnB1dEV2ZW50ICk7XG5cbiAgICAvLyBOb3RpZnkgaW5wdXQgbGlzdGVuZXJzIHRvIGFueSBEaXNwbGF5XG4gICAgaWYgKCBEaXNwbGF5LmlucHV0TGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hUb0xpc3RlbmVyczxET01FdmVudD4oIHBvaW50ZXIsIERpc3BsYXkuaW5wdXRMaXN0ZW5lcnMuc2xpY2UoKSwgdHlwZSwgaW5wdXRFdmVudCApO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudFNjZW5lcnlFdmVudCA9IG51bGw7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGlmaWVzIGFuIGFycmF5IG9mIGxpc3RlbmVycyB3aXRoIGEgc3BlY2lmaWMgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSBwb2ludGVyXG4gICAqIEBwYXJhbSBsaXN0ZW5lcnMgLSBTaG91bGQgYmUgYSBkZWZlbnNpdmUgYXJyYXkgY29weSBhbHJlYWR5LlxuICAgKiBAcGFyYW0gdHlwZVxuICAgKiBAcGFyYW0gaW5wdXRFdmVudFxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaFRvTGlzdGVuZXJzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCBwb2ludGVyOiBQb2ludGVyLCBsaXN0ZW5lcnM6IFRJbnB1dExpc3RlbmVyW10sIHR5cGU6IFN1cHBvcnRlZEV2ZW50VHlwZXMsIGlucHV0RXZlbnQ6IFNjZW5lcnlFdmVudDxET01FdmVudD4gKTogdm9pZCB7XG5cbiAgICBpZiAoIGlucHV0RXZlbnQuaGFuZGxlZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzcGVjaWZpY1R5cGUgPSBwb2ludGVyLnR5cGUgKyB0eXBlIGFzIFN1cHBvcnRlZEV2ZW50VHlwZXM7IC8vIGUuZy4gbW91c2V1cCwgdG91Y2h1cFxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbIGkgXTtcblxuICAgICAgaWYgKCAhaW5wdXRFdmVudC5hYm9ydGVkICYmIGxpc3RlbmVyWyBzcGVjaWZpY1R5cGUgYXMga2V5b2YgVElucHV0TGlzdGVuZXIgXSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoKCBzcGVjaWZpY1R5cGUgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgKCBsaXN0ZW5lclsgc3BlY2lmaWNUeXBlIGFzIGtleW9mIFRJbnB1dExpc3RlbmVyIF0gYXMgU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb248RE9NRXZlbnQ+ICkoIGlucHV0RXZlbnQgKTtcblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuRXZlbnREaXNwYXRjaCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFpbnB1dEV2ZW50LmFib3J0ZWQgJiYgbGlzdGVuZXJbIHR5cGUgYXMga2V5b2YgVElucHV0TGlzdGVuZXIgXSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkV2ZW50RGlzcGF0Y2ggJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoKCB0eXBlICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAgICggbGlzdGVuZXJbIHR5cGUgYXMga2V5b2YgVElucHV0TGlzdGVuZXIgXSBhcyBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbjxET01FdmVudD4gKSggaW5wdXRFdmVudCApO1xuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5FdmVudERpc3BhdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIHRvIGFsbCBub2RlcyBpbiB0aGUgVHJhaWwsIG9wdGlvbmFsbHkgYnViYmxpbmcgZG93biBmcm9tIHRoZSBsZWFmIHRvIHRoZSByb290LlxuICAgKlxuICAgKiBAcGFyYW0gdHJhaWxcbiAgICogQHBhcmFtIHR5cGVcbiAgICogQHBhcmFtIHBvaW50ZXJcbiAgICogQHBhcmFtIGlucHV0RXZlbnRcbiAgICogQHBhcmFtIGJ1YmJsZXMgLSBJZiBidWJibGVzIGlzIGZhbHNlLCB0aGUgZXZlbnQgaXMgb25seSBkaXNwYXRjaGVkIHRvIHRoZSBsZWFmIG5vZGUgb2YgdGhlIHRyYWlsLlxuICAgKiBAcGFyYW0gW2ZpcmVPbklucHV0RGlzYWJsZWRdXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoVG9UYXJnZXRzPERPTUV2ZW50IGV4dGVuZHMgRXZlbnQ+KCB0cmFpbDogVHJhaWwsIHR5cGU6IFN1cHBvcnRlZEV2ZW50VHlwZXMsIHBvaW50ZXI6IFBvaW50ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0RXZlbnQ6IFNjZW5lcnlFdmVudDxET01FdmVudD4sIGJ1YmJsZXM6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcmVPbklucHV0RGlzYWJsZWQgPSBmYWxzZSApOiB2b2lkIHtcblxuICAgIGlmICggaW5wdXRFdmVudC5hYm9ydGVkIHx8IGlucHV0RXZlbnQuaGFuZGxlZCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dEVuYWJsZWRJbmRleCA9IHRyYWlsLmdldExhc3RJbnB1dEVuYWJsZWRJbmRleCgpO1xuXG4gICAgZm9yICggbGV0IGkgPSB0cmFpbC5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGJ1YmJsZXMgPyBpLS0gOiBpID0gLTEgKSB7XG5cbiAgICAgIGNvbnN0IHRhcmdldCA9IHRyYWlsLm5vZGVzWyBpIF07XG5cbiAgICAgIGNvbnN0IHRyYWlsSW5wdXREaXNhYmxlZCA9IGlucHV0RW5hYmxlZEluZGV4IDwgaTtcblxuICAgICAgaWYgKCB0YXJnZXQuaXNEaXNwb3NlZCB8fCAoICFmaXJlT25JbnB1dERpc2FibGVkICYmIHRyYWlsSW5wdXREaXNhYmxlZCApICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaW5wdXRFdmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuXG4gICAgICB0aGlzLmRpc3BhdGNoVG9MaXN0ZW5lcnM8RE9NRXZlbnQ+KCBwb2ludGVyLCB0YXJnZXQuZ2V0SW5wdXRMaXN0ZW5lcnMoKSwgdHlwZSwgaW5wdXRFdmVudCApO1xuXG4gICAgICAvLyBpZiB0aGUgaW5wdXQgZXZlbnQgd2FzIGFib3J0ZWQgb3IgaGFuZGxlZCwgZG9uJ3QgZm9sbG93IHRoZSB0cmFpbCBkb3duIGFub3RoZXIgbGV2ZWxcbiAgICAgIGlmICggaW5wdXRFdmVudC5hYm9ydGVkIHx8IGlucHV0RXZlbnQuaGFuZGxlZCApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlcyB0aGUgbWFpbiBpbmZvcm1hdGlvbiB3ZSBjYXJlIGFib3V0IGZyb20gYSBET00gYEV2ZW50YCBpbnRvIGEgSlNPTi1saWtlIHN0cnVjdHVyZS4gVG8gc3VwcG9ydFxuICAgKiBwb2x5bW9ycGhpc20sIGFsbCBzdXBwb3J0ZWQgRE9NIGV2ZW50IGtleXMgdGhhdCBzY2VuZXJ5IHVzZXMgd2lsbCBhbHdheXMgYmUgaW5jbHVkZWQgaW4gdGhpcyBzZXJpYWxpemF0aW9uLiBJZlxuICAgKiB0aGUgcGFydGljdWxhciBFdmVudCBpbnRlcmZhY2UgZm9yIHRoZSBpbnN0YW5jZSBiZWluZyBzZXJpYWxpemVkIGRvZXNuJ3QgaGF2ZSBhIGNlcnRhaW4gcHJvcGVydHksIHRoZW4gaXQgd2lsbCBiZVxuICAgKiBzZXQgYXMgYG51bGxgLiBTZWUgZG9tRXZlbnRQcm9wZXJ0aWVzVG9TZXJpYWxpemUgZm9yIHRoZSBmdWxsIGxpc3Qgb2Ygc3VwcG9ydGVkIEV2ZW50IHByb3BlcnRpZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gc2VlIGRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplIGZvciBsaXN0IGtleXMgdGhhdCBhcmUgc2VyaWFsaXplZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzZXJpYWxpemVEb21FdmVudCggZG9tRXZlbnQ6IEV2ZW50ICk6IFNlcmlhbGl6ZWRET01FdmVudCB7XG4gICAgY29uc3QgZW50cmllczogU2VyaWFsaXplZERPTUV2ZW50ID0ge1xuICAgICAgY29uc3RydWN0b3JOYW1lOiBkb21FdmVudC5jb25zdHJ1Y3Rvci5uYW1lXG4gICAgfTtcblxuICAgIGRvbUV2ZW50UHJvcGVydGllc1RvU2VyaWFsaXplLmZvckVhY2goIHByb3BlcnR5ID0+IHtcblxuICAgICAgY29uc3QgZG9tRXZlbnRQcm9wZXJ0eTogRXZlbnRbIGtleW9mIEV2ZW50IF0gfCBFbGVtZW50ID0gZG9tRXZlbnRbIHByb3BlcnR5IGFzIGtleW9mIEV2ZW50IF07XG5cbiAgICAgIC8vIFdlIHNlcmlhbGl6ZSBtYW55IEV2ZW50IEFQSXMgaW50byBhIHNpbmdsZSBvYmplY3QsIHNvIGJlIGdyYWNlZnVsIGlmIHByb3BlcnRpZXMgZG9uJ3QgZXhpc3QuXG4gICAgICBpZiAoIGRvbUV2ZW50UHJvcGVydHkgPT09IHVuZGVmaW5lZCB8fCBkb21FdmVudFByb3BlcnR5ID09PSBudWxsICkge1xuICAgICAgICBlbnRyaWVzWyBwcm9wZXJ0eSBdID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAoIGRvbUV2ZW50UHJvcGVydHkgaW5zdGFuY2VvZiBFbGVtZW50ICYmIEVWRU5UX0tFWV9WQUxVRVNfQVNfRUxFTUVOVFMuaW5jbHVkZXMoIHByb3BlcnR5ICkgJiYgdHlwZW9mIGRvbUV2ZW50UHJvcGVydHkuZ2V0QXR0cmlidXRlID09PSAnZnVuY3Rpb24nICYmXG5cbiAgICAgICAgICAgICAgICAvLyBJZiBmYWxzZSwgdGhlbiB0aGlzIHRhcmdldCBpc24ndCBhIFBET00gZWxlbWVudCwgc28gd2UgY2FuIHNraXAgdGhpcyBzZXJpYWxpemF0aW9uXG4gICAgICAgICAgICAgICAgZG9tRXZlbnRQcm9wZXJ0eS5oYXNBdHRyaWJ1dGUoIFBET01VdGlscy5EQVRBX1BET01fVU5JUVVFX0lEICkgKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlIHRhcmdldCBjYW1lIGZyb20gdGhlIGFjY2Vzc2liaWxpdHkgUERPTSwgdGhlbiB3ZSB3YW50IHRvIHN0b3JlIHRoZSBOb2RlIHRyYWlsIGlkIG9mIHdoZXJlIGl0IGNhbWUgZnJvbS5cbiAgICAgICAgZW50cmllc1sgcHJvcGVydHkgXSA9IHtcbiAgICAgICAgICBbIFBET01VdGlscy5EQVRBX1BET01fVU5JUVVFX0lEIF06IGRvbUV2ZW50UHJvcGVydHkuZ2V0QXR0cmlidXRlKCBQRE9NVXRpbHMuREFUQV9QRE9NX1VOSVFVRV9JRCApLFxuXG4gICAgICAgICAgLy8gSGF2ZSB0aGUgSUQgYWxzb1xuICAgICAgICAgIGlkOiBkb21FdmVudFByb3BlcnR5LmdldEF0dHJpYnV0ZSggJ2lkJyApXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBQYXJzZSB0byBnZXQgcmlkIG9mIGZ1bmN0aW9ucyBhbmQgY2lyY3VsYXIgcmVmZXJlbmNlcy5cbiAgICAgICAgZW50cmllc1sgcHJvcGVydHkgXSA9ICggKCB0eXBlb2YgZG9tRXZlbnRQcm9wZXJ0eSA9PT0gJ29iamVjdCcgKSA/IHt9IDogSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIGRvbUV2ZW50UHJvcGVydHkgKSApICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH1cblxuICAvKipcbiAgICogRnJvbSBhIHNlcmlhbGl6ZWQgZG9tIGV2ZW50LCByZXR1cm4gYSByZWNyZWF0ZWQgd2luZG93LkV2ZW50IChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZURvbUV2ZW50KCBldmVudE9iamVjdDogU2VyaWFsaXplZERPTUV2ZW50ICk6IEV2ZW50IHtcbiAgICBjb25zdCBjb25zdHJ1Y3Rvck5hbWUgPSBldmVudE9iamVjdC5jb25zdHJ1Y3Rvck5hbWUgfHwgJ0V2ZW50JztcblxuICAgIGNvbnN0IGNvbmZpZ0ZvckNvbnN0cnVjdG9yID0gXy5waWNrKCBldmVudE9iamVjdCwgZG9tRXZlbnRQcm9wZXJ0aWVzU2V0SW5Db25zdHJ1Y3RvciApO1xuICAgIC8vIHNlcmlhbGl6ZSB0aGUgcmVsYXRlZFRhcmdldCBiYWNrIGludG8gYW4gZXZlbnQgT2JqZWN0LCBzbyB0aGF0IGl0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIGluaXQgY29uZmlnIGluIHRoZSBFdmVudFxuICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgaWYgKCBjb25maWdGb3JDb25zdHJ1Y3Rvci5yZWxhdGVkVGFyZ2V0ICkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgY29uc3QgaHRtbEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggY29uZmlnRm9yQ29uc3RydWN0b3IucmVsYXRlZFRhcmdldC5pZCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaHRtbEVsZW1lbnQsICdjYW5ub3QgZGVzZXJpYWxpemUgZXZlbnQgd2hlbiByZWxhdGVkIHRhcmdldCBpcyBub3QgaW4gdGhlIERPTS4nICk7XG4gICAgICBjb25maWdGb3JDb25zdHJ1Y3Rvci5yZWxhdGVkVGFyZ2V0ID0gaHRtbEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIGNvbnN0IGRvbUV2ZW50OiBFdmVudCA9IG5ldyB3aW5kb3dbIGNvbnN0cnVjdG9yTmFtZSBdKCBjb25zdHJ1Y3Rvck5hbWUsIGNvbmZpZ0ZvckNvbnN0cnVjdG9yICk7XG5cbiAgICBmb3IgKCBjb25zdCBrZXkgaW4gZXZlbnRPYmplY3QgKSB7XG5cbiAgICAgIC8vIGB0eXBlYCBpcyByZWFkb25seSwgc28gZG9uJ3QgdHJ5IHRvIHNldCBpdC5cbiAgICAgIGlmICggZXZlbnRPYmplY3QuaGFzT3duUHJvcGVydHkoIGtleSApICYmICEoIGRvbUV2ZW50UHJvcGVydGllc1NldEluQ29uc3RydWN0b3IgYXMgc3RyaW5nW10gKS5pbmNsdWRlcygga2V5ICkgKSB7XG5cbiAgICAgICAgLy8gU3BlY2lhbCBjYXNlIGZvciB0YXJnZXQgc2luY2Ugd2UgY2FuJ3Qgc2V0IHRoYXQgcmVhZC1vbmx5IHByb3BlcnR5LiBJbnN0ZWFkIHVzZSBhIHN1YnN0aXR1dGUga2V5LlxuICAgICAgICBpZiAoIGtleSA9PT0gJ3RhcmdldCcgKSB7XG5cbiAgICAgICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50T2JqZWN0LnRhcmdldCBhcyB7IGlkPzogc3RyaW5nIH0gfCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoIHRhcmdldCAmJiB0YXJnZXQuaWQgKSB7XG4gICAgICAgICAgICAgIGFzc2VydCggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIHRhcmdldC5pZCApLCAndGFyZ2V0IHNob3VsZCBleGlzdCBpbiB0aGUgUERPTSB0byBzdXBwb3J0IHBsYXliYWNrLicgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgICAgZG9tRXZlbnRbIFRBUkdFVF9TVUJTVElUVVRFX0tFWSBdID0gXy5jbG9uZSggZXZlbnRPYmplY3RbIGtleSBdICkgfHwge307XG5cbiAgICAgICAgICAvLyBUaGlzIG1heSBub3QgYmUgbmVlZGVkIHNpbmNlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMjk2IGlzIGNvbXBsZXRlLCBkb3VibGUgY2hlY2sgb24gZ2V0VHJhaWxGcm9tUERPTUV2ZW50KCkgdG9vXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgIGRvbUV2ZW50WyBUQVJHRVRfU1VCU1RJVFVURV9LRVkgXS5nZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbigga2V5ICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbIGtleSBdO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgICAgZG9tRXZlbnRbIGtleSBdID0gZXZlbnRPYmplY3RbIGtleSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkb21FdmVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgbG9nZ2luZyBvdXQgYSBwb2ludC9ldmVudCBjb21iaW5hdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHBvaW50IC0gTm90IGxvZ2dlZCBpZiBudWxsXG4gICAqIEBwYXJhbSBkb21FdmVudFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZGVidWdUZXh0KCBwb2ludDogVmVjdG9yMiB8IG51bGwsIGRvbUV2ZW50OiBFdmVudCApOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgJHtkb21FdmVudC50aW1lU3RhbXB9ICR7ZG9tRXZlbnQudHlwZX1gO1xuICAgIGlmICggcG9pbnQgIT09IG51bGwgKSB7XG4gICAgICByZXN1bHQgPSBgJHtwb2ludC54fSwke3BvaW50Lnl9ICR7cmVzdWx0fWA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyB0aGUgY3VycmVudCBNUyBwb2ludGVyIHR5cGVzIG9udG8gdGhlIHBvaW50ZXIgc3BlYy4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG1zUG9pbnRlclR5cGUoIGV2ZW50OiBQb2ludGVyRXZlbnQgKTogc3RyaW5nIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0tIGxlZ2FjeSBBUElcbiAgICBpZiAoIGV2ZW50LnBvaW50ZXJUeXBlID09PSB3aW5kb3cuTVNQb2ludGVyRXZlbnQuTVNQT0lOVEVSX1RZUEVfVE9VQ0ggKSB7XG4gICAgICByZXR1cm4gJ3RvdWNoJztcbiAgICB9XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtLSBsZWdhY3kgQVBJXG4gICAgZWxzZSBpZiAoIGV2ZW50LnBvaW50ZXJUeXBlID09PSB3aW5kb3cuTVNQb2ludGVyRXZlbnQuTVNQT0lOVEVSX1RZUEVfUEVOICkge1xuICAgICAgcmV0dXJuICdwZW4nO1xuICAgIH1cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0tIGxlZ2FjeSBBUElcbiAgICBlbHNlIGlmICggZXZlbnQucG9pbnRlclR5cGUgPT09IHdpbmRvdy5NU1BvaW50ZXJFdmVudC5NU1BPSU5URVJfVFlQRV9NT1VTRSApIHtcbiAgICAgIHJldHVybiAnbW91c2UnO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBldmVudC5wb2ludGVyVHlwZTsgLy8gaG9wZSBmb3IgdGhlIGJlc3RcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0lucHV0JywgSW5wdXQgKTsiXSwibmFtZXMiOlsic3RlcFRpbWVyIiwiVGlueUVtaXR0ZXIiLCJWZWN0b3IyIiwiY2xlYW5BcnJheSIsIm9wdGlvbml6ZSIsInBsYXRmb3JtIiwiRXZlbnRUeXBlIiwiUGhldGlvQWN0aW9uIiwiUGhldGlvT2JqZWN0IiwiQXJyYXlJTyIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJOdW1iZXJJTyIsIkJhdGNoZWRET01FdmVudCIsIkJhdGNoZWRET01FdmVudFR5cGUiLCJCcm93c2VyRXZlbnRzIiwiRGlzcGxheSIsIkV2ZW50Q29udGV4dCIsIkV2ZW50Q29udGV4dElPIiwiTW91c2UiLCJQRE9NSW5zdGFuY2UiLCJQRE9NUG9pbnRlciIsIlBET01VdGlscyIsIlBlbiIsIlBvaW50ZXIiLCJzY2VuZXJ5IiwiU2NlbmVyeUV2ZW50IiwiVG91Y2giLCJUcmFpbCIsIkFycmF5SU9Qb2ludGVySU8iLCJQb2ludGVySU8iLCJkb21FdmVudFByb3BlcnRpZXNUb1NlcmlhbGl6ZSIsImRvbUV2ZW50UHJvcGVydGllc1NldEluQ29uc3RydWN0b3IiLCJFVkVOVF9LRVlfVkFMVUVTX0FTX0VMRU1FTlRTIiwiUERPTV9VTlBJQ0tBQkxFX0VWRU5UUyIsIlRBUkdFVF9TVUJTVElUVVRFX0tFWSIsIlBET01fQ0xJQ0tfREVMQVkiLCJJbnB1dCIsImludGVycnVwdFBvaW50ZXJzIiwiZXhjbHVkZVBvaW50ZXIiLCJfIiwiZWFjaCIsInBvaW50ZXJzIiwicG9pbnRlciIsImludGVycnVwdEFsbCIsImJhdGNoRXZlbnQiLCJjb250ZXh0IiwiYmF0Y2hUeXBlIiwiY2FsbGJhY2siLCJ0cmlnZ2VySW1tZWRpYXRlIiwic2NlbmVyeUxvZyIsIklucHV0RXZlbnQiLCJwdXNoIiwiZGlzcGxheSIsImludGVyYWN0aXZlIiwiYmF0Y2hlZEV2ZW50cyIsInBvb2wiLCJjcmVhdGUiLCJiYXRjaERPTUV2ZW50cyIsImZpcmVCYXRjaGVkRXZlbnRzIiwicGFzc2l2ZUV2ZW50cyIsIm1vdXNlRG93biIsImVkZ2UiLCJBTFRfVFlQRSIsImFsbG93c0RPTUlucHV0IiwiZG9tRXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInBvcCIsImN1cnJlbnRseUZpcmluZ0V2ZW50cyIsImxlbmd0aCIsImkiLCJiYXRjaGVkRXZlbnQiLCJydW4iLCJkaXNwb3NlIiwiY2xlYXJCYXRjaGVkRXZlbnRzIiwidmFsaWRhdGVQb2ludGVycyIsInZhbGlkYXRlUG9pbnRlcnNBY3Rpb24iLCJleGVjdXRlIiwicmVtb3ZlVGVtcG9yYXJ5UG9pbnRlcnMiLCJzcGxpY2UiLCJleGl0VHJhaWwiLCJ0cmFpbCIsInJvb3ROb2RlIiwiZXhpdEV2ZW50cyIsImNyZWF0ZVN5bnRoZXRpYyIsImNvbm5lY3RMaXN0ZW5lcnMiLCJhZGREaXNwbGF5IiwiYXR0YWNoVG9XaW5kb3ciLCJkaXNjb25uZWN0TGlzdGVuZXJzIiwicmVtb3ZlRGlzcGxheSIsInBvaW50RnJvbUV2ZW50IiwicG9zaXRpb24iLCJjbGllbnRYIiwiY2xpZW50WSIsImFzc3VtZUZ1bGxXaW5kb3ciLCJkb21Cb3VuZHMiLCJkb21FbGVtZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJzdWJ0cmFjdFhZIiwibGVmdCIsInRvcCIsIngiLCJ5IiwiYWRkUG9pbnRlciIsInBvaW50ZXJBZGRlZEVtaXR0ZXIiLCJlbWl0IiwicmVtb3ZlUG9pbnRlciIsImZpbmRQb2ludGVyQnlJZCIsImlkIiwiZ2V0UERPTUV2ZW50VHJhaWwiLCJldmVudE5hbWUiLCJnZXRUcmFpbEZyb21QRE9NRXZlbnQiLCJub3RCbG9ja2luZ1N1YnNlcXVlbnRDbGlja3NPY2N1cnJpbmdUb29RdWlja2x5Iiwic29tZSIsIm5vZGVzIiwibm9kZSIsInBvc2l0aW9uSW5QRE9NIiwidGltZVN0YW1wIiwidXBUaW1lU3RhbXAiLCJpbml0TW91c2UiLCJwb2ludCIsIm1vdXNlIiwiZW5zdXJlTW91c2UiLCJpbml0UERPTVBvaW50ZXIiLCJwZG9tUG9pbnRlciIsImVuc3VyZVBET01Qb2ludGVyIiwiZGlzcGF0Y2hQRE9NRXZlbnQiLCJldmVudFR5cGUiLCJidWJibGVzIiwidXBkYXRlVHJhaWwiLCJVU0VSX0dFU1RVUkVfRVZFTlRTIiwiaW5jbHVkZXMiLCJ1c2VyR2VzdHVyZUVtaXR0ZXIiLCJ0YXJnZXQiLCJoYXNBdHRyaWJ1dGUiLCJEQVRBX0VYQ0xVREVfRlJPTV9JTlBVVCIsImNhbkZpcmVMaXN0ZW5lcnMiLCJpc1BpY2thYmxlIiwiYXNzZXJ0IiwiZGlzcGF0Y2hFdmVudCIsImdldFJlbGF0ZWRUYXJnZXRUcmFpbCIsInJlbGF0ZWRUYXJnZXRFbGVtZW50IiwicmVsYXRlZFRhcmdldCIsImlzRWxlbWVudFVuZGVyUERPTSIsIndpbmRvdyIsIkVsZW1lbnQiLCJ0cmFpbEluZGljZXMiLCJnZXRBdHRyaWJ1dGUiLCJEQVRBX1BET01fVU5JUVVFX0lEIiwidW5pcXVlSWRUb1RyYWlsIiwiX2FjY2Vzc2libGUiLCJkZWJ1Z1RleHQiLCJtb3VzZURvd25BY3Rpb24iLCJtb3VzZVVwIiwibW91c2VVcEFjdGlvbiIsIm1vdXNlTW92ZSIsIm1vdXNlTW92ZUFjdGlvbiIsIm1vdXNlT3ZlciIsIm1vdXNlT3ZlckFjdGlvbiIsIm1vdXNlT3V0IiwibW91c2VPdXRBY3Rpb24iLCJ3aGVlbCIsIndoZWVsU2Nyb2xsQWN0aW9uIiwidG91Y2hTdGFydCIsInRvdWNoU3RhcnRBY3Rpb24iLCJ0b3VjaEVuZCIsInRvdWNoRW5kQWN0aW9uIiwidG91Y2hNb3ZlIiwidG91Y2hNb3ZlQWN0aW9uIiwidG91Y2hDYW5jZWwiLCJ0b3VjaENhbmNlbEFjdGlvbiIsInBlblN0YXJ0IiwicGVuU3RhcnRBY3Rpb24iLCJwZW5FbmQiLCJwZW5FbmRBY3Rpb24iLCJwZW5Nb3ZlIiwicGVuTW92ZUFjdGlvbiIsInBlbkNhbmNlbCIsInBlbkNhbmNlbEFjdGlvbiIsInBvaW50ZXJEb3duIiwidHlwZSIsImRvY3VtZW50IiwiYm9keSIsInNldFBvaW50ZXJDYXB0dXJlIiwicG9pbnRlcklkIiwiaGFuZGxlVW5rbm93blBvaW50ZXJUeXBlIiwiRXJyb3IiLCJwb2ludGVyVXAiLCJwb2ludGVyQ2FuY2VsIiwiY29uc29sZSIsImxvZyIsImdvdFBvaW50ZXJDYXB0dXJlIiwiZ290UG9pbnRlckNhcHR1cmVBY3Rpb24iLCJsb3N0UG9pbnRlckNhcHR1cmUiLCJsb3N0UG9pbnRlckNhcHR1cmVBY3Rpb24iLCJwb2ludGVyTW92ZSIsInBvaW50ZXJPdmVyIiwicG9pbnRlck91dCIsInBvaW50ZXJFbnRlciIsInBvaW50ZXJMZWF2ZSIsImZvY3VzSW4iLCJmb2N1c2luQWN0aW9uIiwiZm9jdXNPdXQiLCJmb2N1c291dEFjdGlvbiIsImlucHV0IiwiaW5wdXRBY3Rpb24iLCJjaGFuZ2UiLCJjaGFuZ2VBY3Rpb24iLCJjbGljayIsImNsaWNrQWN0aW9uIiwia2V5RG93biIsImtleWRvd25BY3Rpb24iLCJrZXlVcCIsImtleXVwQWN0aW9uIiwiZ2V0UG9pbnRlclRyYWlsIiwidHJhaWxVbmRlclBvaW50ZXIiLCJ1cEV2ZW50IiwicG9pbnRDaGFuZ2VkIiwidXAiLCJ0b1N0cmluZyIsImV2ZW50VHJhaWwiLCJicmFuY2hDaGFuZ2VFdmVudHMiLCJpc1RvdWNoTGlrZSIsImRvd25FdmVudCIsInVwZGF0ZVBvaW50IiwiZG93biIsIm1vdmVFdmVudCIsImNhbmNlbEV2ZW50IiwiY2FuY2VsIiwic2VuZE1vdmUiLCJpbnB1dEVuYWJsZWRUcmFpbCIsInNsaWNlIiwiTWF0aCIsIm1pbiIsImdldExhc3RJbnB1dEVuYWJsZWRJbmRleCIsIm9sZElucHV0RW5hYmxlZFRyYWlsIiwiYnJhbmNoSW5wdXRFbmFibGVkSW5kZXgiLCJicmFuY2hJbmRleCIsImxhc3RJbnB1dEVuYWJsZWROb2RlQ2hhbmdlZCIsImxhc3ROb2RlIiwib2xkVHJhaWwiLCJlbnRlckV2ZW50cyIsImxhc3ROb2RlQ2hhbmdlZCIsImZpcmVPbklucHV0RGlzYWJsZWQiLCJFdmVudERpc3BhdGNoIiwiRXZlbnRQYXRoIiwidG9QYXRoU3RyaW5nIiwiaW5wdXRFdmVudCIsImN1cnJlbnRTY2VuZXJ5RXZlbnQiLCJkaXNwYXRjaFRvTGlzdGVuZXJzIiwiZ2V0TGlzdGVuZXJzIiwiZGlzcGF0Y2hUb1RhcmdldHMiLCJnZXRJbnB1dExpc3RlbmVycyIsImlucHV0TGlzdGVuZXJzIiwibGlzdGVuZXJzIiwiaGFuZGxlZCIsInNwZWNpZmljVHlwZSIsImxpc3RlbmVyIiwiYWJvcnRlZCIsImlucHV0RW5hYmxlZEluZGV4IiwidHJhaWxJbnB1dERpc2FibGVkIiwiaXNEaXNwb3NlZCIsImN1cnJlbnRUYXJnZXQiLCJzZXJpYWxpemVEb21FdmVudCIsImVudHJpZXMiLCJjb25zdHJ1Y3Rvck5hbWUiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJmb3JFYWNoIiwicHJvcGVydHkiLCJkb21FdmVudFByb3BlcnR5IiwidW5kZWZpbmVkIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiZGVzZXJpYWxpemVEb21FdmVudCIsImV2ZW50T2JqZWN0IiwiY29uZmlnRm9yQ29uc3RydWN0b3IiLCJwaWNrIiwiaHRtbEVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImtleSIsImhhc093blByb3BlcnR5IiwiY2xvbmUiLCJyZXN1bHQiLCJtc1BvaW50ZXJUeXBlIiwiZXZlbnQiLCJwb2ludGVyVHlwZSIsIk1TUG9pbnRlckV2ZW50IiwiTVNQT0lOVEVSX1RZUEVfVE9VQ0giLCJNU1BPSU5URVJfVFlQRV9QRU4iLCJNU1BPSU5URVJfVFlQRV9NT1VTRSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9UeXBlIiwiSW5wdXRJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJsYXN0RXZlbnRDb250ZXh0IiwicGhldGlvUGxheWJhY2siLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGFyYW1ldGVycyIsIlZlY3RvcjJJTyIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJtb3ZlIiwib3ZlciIsIm91dCIsInRvdWNoIiwicGVuIiwib25Hb3RQb2ludGVyQ2FwdHVyZSIsInNldFRpbWVvdXQiLCJvbkxvc3RQb2ludGVyQ2FwdHVyZSIsInZhbHVlVHlwZSIsImFwcGx5U3RhdGUiLCJub29wIiwidG9TdGF0ZU9iamVjdCIsInN0YXRl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