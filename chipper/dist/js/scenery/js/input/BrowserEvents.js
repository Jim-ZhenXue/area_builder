// Copyright 2017-2024, University of Colorado Boulder
/**
 * Handles attaching/detaching and forwarding browser input events to displays.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import platform from '../../../phet-core/js/platform.js';
import { BatchedDOMEventType, Display, EventContext, Features, FocusManager, globalKeyStateTracker, PDOMUtils, scenery } from '../imports.js';
// Sometimes we need to add a listener that does absolutely nothing
const noop = ()=>{};
// Ensure we only attach global window listeners (display independent) once
let isGloballyAttached = false;
const BrowserEvents = {
    // Prevents focus related event callbacks from being dispatched - scenery internal operations might change
    // focus temporarily, we don't want event listeners to be called in this case because they are transient and not
    // caused by user interaction.
    blockFocusCallbacks: false,
    // True while Scenery is dispatching focus and blur related events. Scenery (PDOMTree) needs to restore focus
    // after operations, but that can be very buggy while focus events are already being handled.
    dispatchingFocusEvents: false,
    /**
   * Adds a Display to the list of displays that will be notified of input events.
   * @public
   *
   * @param {Display} display
   * @param {boolean} attachToWindow - Whether events should be attached to the window. If false, they will be
   *                                   attached to the Display's domElement.
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */ addDisplay (display, attachToWindow, passiveEvents) {
        assert && assert(display instanceof Display);
        assert && assert(typeof attachToWindow === 'boolean');
        assert && assert(!_.includes(this.attachedDisplays, display), 'A display cannot be concurrently attached to events more than one time');
        // Always first please
        if (!isGloballyAttached) {
            isGloballyAttached = true;
            // never unattach because we don't know if there are other Displays listening to this.
            globalKeyStateTracker.attachToWindow();
            FocusManager.attachToWindow();
        }
        this.attachedDisplays.push(display);
        if (attachToWindow) {
            // lazily connect listeners
            if (this.attachedDisplays.length === 1) {
                this.connectWindowListeners(passiveEvents);
            }
        } else {
            this.addOrRemoveListeners(display.domElement, true, passiveEvents);
        }
        // Only add the wheel listeners directly on the elements, so it won't trigger outside
        display.domElement.addEventListener('wheel', this.onwheel, BrowserEvents.getEventOptions(passiveEvents, true));
    },
    /**
   * Removes a Display to the list of displays that will be notified of input events.
   * @public
   *
   * @param {Display} display
   * @param {boolean} attachToWindow - The value provided to addDisplay
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */ removeDisplay (display, attachToWindow, passiveEvents) {
        assert && assert(display instanceof Display);
        assert && assert(typeof attachToWindow === 'boolean');
        assert && assert(_.includes(this.attachedDisplays, display), 'This display was not already attached to listen for window events');
        arrayRemove(this.attachedDisplays, display);
        // lazily disconnect listeners
        if (attachToWindow) {
            if (this.attachedDisplays.length === 0) {
                this.disconnectWindowListeners(passiveEvents);
            }
        } else {
            this.addOrRemoveListeners(display.domElement, false, passiveEvents);
        }
        display.domElement.removeEventListener('wheel', this.onwheel, BrowserEvents.getEventOptions(passiveEvents, true));
    },
    /**
   * Returns the value to provide as the 3rd parameter to addEventListener/removeEventListener.
   * @private
   *
   * @param {boolean|null} passiveEvents
   * @param {boolean} isMain - If false, it is used on the "document" for workarounds.
   * @returns {Object|boolean}
   */ getEventOptions (passiveEvents, isMain) {
        const passDirectPassiveFlag = Features.passive && passiveEvents !== null;
        if (!passDirectPassiveFlag) {
            return false;
        } else {
            const eventOptions = {
                passive: passiveEvents
            };
            if (isMain) {
                eventOptions.capture = false;
            }
            assert && assert(!eventOptions.capture, 'Do not use capture without consulting globalKeyStateTracker, ' + 'which expects have listeners called FIRST in keyboard-related cases.');
            return eventOptions;
        }
    },
    /**
   * {number} - Will be checked/mutated when listeners are added/removed.
   * @private
   */ listenersAttachedToWindow: 0,
    /**
   * {number} - Will be checked/mutated when listeners are added/removed.
   * @private
   */ listenersAttachedToElement: 0,
    /**
   * {Array.<Display>} - All Displays that should have input events forwarded.
   * @private
   */ attachedDisplays: [],
    /**
   * {boolean} - Whether pointer events in the format specified by the W3C specification are allowed.
   * @private
   *
   * NOTE: Pointer events are currently disabled for Firefox due to https://github.com/phetsims/scenery/issues/837.
   */ canUsePointerEvents: !!(window.navigator && window.navigator.pointerEnabled || window.PointerEvent) && !platform.firefox,
    /**
   * {boolean} - Whether pointer events in the format specified by the MS specification are allowed.
   * @private
   */ canUseMSPointerEvents: window.navigator && window.navigator.msPointerEnabled,
    /**
   * {Array.<string>} - All W3C pointer event types that we care about.
   * @private
   */ pointerListenerTypes: [
        'pointerdown',
        'pointerup',
        'pointermove',
        'pointerover',
        'pointerout',
        'pointercancel',
        'gotpointercapture',
        'lostpointercapture'
    ],
    /**
   * {Array.<string>} - All MS pointer event types that we care about.
   * @private
   */ msPointerListenerTypes: [
        'MSPointerDown',
        'MSPointerUp',
        'MSPointerMove',
        'MSPointerOver',
        'MSPointerOut',
        'MSPointerCancel'
    ],
    /**
   * {Array.<string>} - All touch event types that we care about
   * @private
   */ touchListenerTypes: [
        'touchstart',
        'touchend',
        'touchmove',
        'touchcancel'
    ],
    /**
   * {Array.<string>} - All mouse event types that we care about
   * @private
   */ mouseListenerTypes: [
        'mousedown',
        'mouseup',
        'mousemove',
        'mouseover',
        'mouseout'
    ],
    /**
   * {Array.<string>} - All wheel event types that we care about
   * @private
   */ wheelListenerTypes: [
        'wheel'
    ],
    /**
   * {Array.<string>} - Alternative input types
   * @private
   */ altListenerTypes: PDOMUtils.DOM_EVENTS,
    /**
   * Returns all event types that will be listened to on this specific platform.
   * @private
   *
   * @returns {Array.<string>}
   */ getNonWheelUsedTypes () {
        let eventTypes;
        if (this.canUsePointerEvents) {
            // accepts pointer events corresponding to the spec at http://www.w3.org/TR/pointerevents/
            sceneryLog && sceneryLog.Input && sceneryLog.Input('Detected pointer events support, using that instead of mouse/touch events');
            eventTypes = this.pointerListenerTypes;
        } else if (this.canUseMSPointerEvents) {
            sceneryLog && sceneryLog.Input && sceneryLog.Input('Detected MS pointer events support, using that instead of mouse/touch events');
            eventTypes = this.msPointerListenerTypes;
        } else {
            sceneryLog && sceneryLog.Input && sceneryLog.Input('No pointer events support detected, using mouse/touch events');
            eventTypes = this.touchListenerTypes.concat(this.mouseListenerTypes);
        }
        eventTypes = eventTypes.concat(this.altListenerTypes);
        // eventTypes = eventTypes.concat( this.wheelListenerTypes );
        return eventTypes;
    },
    /**
   * Connects event listeners directly to the window.
   * @private
   *
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */ connectWindowListeners (passiveEvents) {
        this.addOrRemoveListeners(window, true, passiveEvents);
    },
    /**
   * Disconnects event listeners from the window.
   * @private
   *
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   */ disconnectWindowListeners (passiveEvents) {
        this.addOrRemoveListeners(window, false, passiveEvents);
    },
    /**
   * Either adds or removes event listeners to an object, depending on the flag.
   * @private
   *
   * @param {*} element - The element (window or DOM element) to add listeners to.
   * @param {boolean} addOrRemove - If true, listeners will be added. If false, listeners will be removed.
   * @param {boolean|null} passiveEvents - The value of the `passive` option for adding/removing DOM event listeners
   *                                       NOTE: if it is passed in as null, the default value for the browser will be
   *                                       used.
   */ addOrRemoveListeners (element, addOrRemove, passiveEvents) {
        assert && assert(typeof addOrRemove === 'boolean');
        assert && assert(typeof passiveEvents === 'boolean' || passiveEvents === null);
        const forWindow = element === window;
        assert && assert(!forWindow || this.listenersAttachedToWindow > 0 === !addOrRemove, 'Do not add listeners to the window when already attached, or remove listeners when none are attached');
        const delta = addOrRemove ? 1 : -1;
        if (forWindow) {
            this.listenersAttachedToWindow += delta;
        } else {
            this.listenersAttachedToElement += delta;
        }
        assert && assert(this.listenersAttachedToWindow === 0 || this.listenersAttachedToElement === 0, 'Listeners should not be added both with addDisplayToWindow and addDisplayToElement. Use only one.');
        const method = addOrRemove ? 'addEventListener' : 'removeEventListener';
        // {Array.<string>}
        const eventTypes = this.getNonWheelUsedTypes();
        for(let i = 0; i < eventTypes.length; i++){
            const type = eventTypes[i];
            // If we add input listeners to the window itself, iOS Safari 7 won't send touch events to displays in an
            // iframe unless we also add dummy listeners to the document.
            if (forWindow) {
                // Workaround for older browsers needed,
                // see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
                document[method](type, noop, BrowserEvents.getEventOptions(passiveEvents, false));
            }
            const callback = this[`on${type}`];
            assert && assert(!!callback);
            // Workaround for older browsers needed,
            // see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners
            element[method](type, callback, BrowserEvents.getEventOptions(passiveEvents, true));
        }
    },
    /**
   * Sets an event from the window to be batched on all of the displays.
   * @private
   *
   * @param {EventContext} eventContext
   * @param {BatchedDOMEventType} batchType - TODO: turn to full enumeration? https://github.com/phetsims/scenery/issues/1581
   * @param {string} inputCallbackName - e.g. 'mouseDown', will trigger Input.mouseDown
   * @param {boolean} triggerImmediate - Whether this will be force-executed now, causing all batched events to fire.
   *                                     Useful for events (like mouseup) that responding synchronously is
   *                                     necessary for certain security-sensitive actions (like triggering
   *                                     full-screen).
   */ batchWindowEvent (eventContext, batchType, inputCallbackName, triggerImmediate) {
        // NOTE: For now, we don't check whether the event is actually within the display's boundingClientRect. Most
        // displays will want to receive events outside of their bounds (especially for checking drags and mouse-ups
        // outside of their bounds).
        for(let i = 0; i < this.attachedDisplays.length; i++){
            const display = this.attachedDisplays[i];
            const input = display._input;
            if (!BrowserEvents.blockFocusCallbacks || inputCallbackName !== 'focusIn' && inputCallbackName !== 'focusOut') {
                input.batchEvent(eventContext, batchType, input[inputCallbackName], triggerImmediate);
            }
        }
    },
    /**
   * Listener for window's pointerdown event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointerdown: function onpointerdown(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerdown');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // Get the active element BEFORE any actions are taken
        const eventContext = new EventContext(domEvent);
        if (domEvent.pointerType === 'mouse') {
            Display.userGestureEmitter.emit();
        }
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.POINTER_TYPE, 'pointerDown', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's pointerup event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointerup: function onpointerup(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerup');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // Get the active element BEFORE any actions are taken
        const eventContext = new EventContext(domEvent);
        Display.userGestureEmitter.emit();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.POINTER_TYPE, 'pointerUp', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's pointermove event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointermove: function onpointermove(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointermove');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerMove', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's pointerover event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointerover: function onpointerover(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerover');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerOver', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's pointerout event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointerout: function onpointerout(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointerout');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerOut', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's pointercancel event.
   * @private
   *
   * @param {Event} domEvent
   */ onpointercancel: function onpointercancel(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('pointercancel');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'pointerCancel', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's gotpointercapture event.
   * @private
   *
   * @param {Event} domEvent
   */ ongotpointercapture: function ongotpointercapture(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('gotpointercapture');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'gotPointerCapture', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's lostpointercapture event.
   * @private
   *
   * @param {Event} domEvent
   */ onlostpointercapture: function onlostpointercapture(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('lostpointercapture');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.POINTER_TYPE, 'lostPointerCapture', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerDown event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerDown: function onMSPointerDown(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerDown');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerDown', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerUp event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerUp: function onMSPointerUp(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerUp');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerUp', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerMove event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerMove: function onMSPointerMove(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerMove');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerMove', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerOver event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerOver: function onMSPointerOver(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerOver');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerOver', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerOut event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerOut: function onMSPointerOut(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerOut');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerOut', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's MSPointerCancel event.
   * @private
   *
   * @param {Event} domEvent
   */ onMSPointerCancel: function onMSPointerCancel(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('MSPointerCancel');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MS_POINTER_TYPE, 'pointerCancel', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's touchstart event.
   * @private
   *
   * @param {Event} domEvent
   */ ontouchstart: function ontouchstart(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchstart');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchStart', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's touchend event.
   * @private
   *
   * @param {Event} domEvent
   */ ontouchend: function ontouchend(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchend');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // Get the active element BEFORE any actions are taken
        const eventContext = new EventContext(domEvent);
        Display.userGestureEmitter.emit();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.TOUCH_TYPE, 'touchEnd', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's touchmove event.
   * @private
   *
   * @param {Event} domEvent
   */ ontouchmove: function ontouchmove(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchmove');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchMove', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's touchcancel event.
   * @private
   *
   * @param {Event} domEvent
   */ ontouchcancel: function ontouchcancel(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('touchcancel');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.TOUCH_TYPE, 'touchCancel', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's mousedown event.
   * @private
   *
   * @param {Event} domEvent
   */ onmousedown: function onmousedown(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mousedown');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // Get the active element BEFORE any actions are taken
        const eventContext = new EventContext(domEvent);
        Display.userGestureEmitter.emit();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.MOUSE_TYPE, 'mouseDown', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's mouseup event.
   * @private
   *
   * @param {Event} domEvent
   */ onmouseup: function onmouseup(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseup');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // Get the active element BEFORE any actions are taken
        const eventContext = new EventContext(domEvent);
        Display.userGestureEmitter.emit();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(eventContext, BatchedDOMEventType.MOUSE_TYPE, 'mouseUp', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's mousemove event.
   * @private
   *
   * @param {Event} domEvent
   */ onmousemove: function onmousemove(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mousemove');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseMove', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's mouseover event.
   * @private
   *
   * @param {Event} domEvent
   */ onmouseover: function onmouseover(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseover');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseOver', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's mouseout event.
   * @private
   *
   * @param {Event} domEvent
   */ onmouseout: function onmouseout(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('mouseout');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.MOUSE_TYPE, 'mouseOut', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    /**
   * Listener for window's wheel event.
   * @private
   *
   * @param {Event} domEvent
   */ onwheel: function onwheel(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('wheel');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.WHEEL_TYPE, 'wheel', false);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onfocusin: function onfocusin(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('focusin');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.dispatchingFocusEvents = true;
        // Update state related to focus immediately and allowing for reentrancy for focus state
        // that must match the browser's focus state.
        FocusManager.updatePDOMFocusFromEvent(BrowserEvents.attachedDisplays, domEvent, true);
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'focusIn', true);
        BrowserEvents.dispatchingFocusEvents = false;
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onfocusout: function onfocusout(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('focusout');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.dispatchingFocusEvents = true;
        // Update state related to focus immediately and allowing for reentrancy for focus state
        FocusManager.updatePDOMFocusFromEvent(BrowserEvents.attachedDisplays, domEvent, false);
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'focusOut', true);
        BrowserEvents.dispatchingFocusEvents = false;
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    oninput: function oninput(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('input');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'input', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onchange: function onchange(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('change');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'change', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onclick: function onclick(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('click');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'click', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onkeydown: function onkeydown(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('keydown');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'keyDown', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    },
    onkeyup: function onkeyup(domEvent) {
        sceneryLog && sceneryLog.OnInput && sceneryLog.OnInput('keyup');
        sceneryLog && sceneryLog.OnInput && sceneryLog.push();
        // NOTE: Will be called without a proper 'this' reference. Do NOT rely on it here.
        BrowserEvents.batchWindowEvent(new EventContext(domEvent), BatchedDOMEventType.ALT_TYPE, 'keyUp', true);
        sceneryLog && sceneryLog.OnInput && sceneryLog.pop();
    }
};
scenery.register('BrowserEvents', BrowserEvents);
export default BrowserEvents;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvQnJvd3NlckV2ZW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIYW5kbGVzIGF0dGFjaGluZy9kZXRhY2hpbmcgYW5kIGZvcndhcmRpbmcgYnJvd3NlciBpbnB1dCBldmVudHMgdG8gZGlzcGxheXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IHBsYXRmb3JtIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9wbGF0Zm9ybS5qcyc7XG5pbXBvcnQgeyBCYXRjaGVkRE9NRXZlbnRUeXBlLCBEaXNwbGF5LCBFdmVudENvbnRleHQsIEZlYXR1cmVzLCBGb2N1c01hbmFnZXIsIGdsb2JhbEtleVN0YXRlVHJhY2tlciwgUERPTVV0aWxzLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFNvbWV0aW1lcyB3ZSBuZWVkIHRvIGFkZCBhIGxpc3RlbmVyIHRoYXQgZG9lcyBhYnNvbHV0ZWx5IG5vdGhpbmdcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuLy8gRW5zdXJlIHdlIG9ubHkgYXR0YWNoIGdsb2JhbCB3aW5kb3cgbGlzdGVuZXJzIChkaXNwbGF5IGluZGVwZW5kZW50KSBvbmNlXG5sZXQgaXNHbG9iYWxseUF0dGFjaGVkID0gZmFsc2U7XG5cbmNvbnN0IEJyb3dzZXJFdmVudHMgPSB7XG5cbiAgLy8gUHJldmVudHMgZm9jdXMgcmVsYXRlZCBldmVudCBjYWxsYmFja3MgZnJvbSBiZWluZyBkaXNwYXRjaGVkIC0gc2NlbmVyeSBpbnRlcm5hbCBvcGVyYXRpb25zIG1pZ2h0IGNoYW5nZVxuICAvLyBmb2N1cyB0ZW1wb3JhcmlseSwgd2UgZG9uJ3Qgd2FudCBldmVudCBsaXN0ZW5lcnMgdG8gYmUgY2FsbGVkIGluIHRoaXMgY2FzZSBiZWNhdXNlIHRoZXkgYXJlIHRyYW5zaWVudCBhbmQgbm90XG4gIC8vIGNhdXNlZCBieSB1c2VyIGludGVyYWN0aW9uLlxuICBibG9ja0ZvY3VzQ2FsbGJhY2tzOiBmYWxzZSxcblxuICAvLyBUcnVlIHdoaWxlIFNjZW5lcnkgaXMgZGlzcGF0Y2hpbmcgZm9jdXMgYW5kIGJsdXIgcmVsYXRlZCBldmVudHMuIFNjZW5lcnkgKFBET01UcmVlKSBuZWVkcyB0byByZXN0b3JlIGZvY3VzXG4gIC8vIGFmdGVyIG9wZXJhdGlvbnMsIGJ1dCB0aGF0IGNhbiBiZSB2ZXJ5IGJ1Z2d5IHdoaWxlIGZvY3VzIGV2ZW50cyBhcmUgYWxyZWFkeSBiZWluZyBoYW5kbGVkLlxuICBkaXNwYXRjaGluZ0ZvY3VzRXZlbnRzOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRkcyBhIERpc3BsYXkgdG8gdGhlIGxpc3Qgb2YgZGlzcGxheXMgdGhhdCB3aWxsIGJlIG5vdGlmaWVkIG9mIGlucHV0IGV2ZW50cy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtib29sZWFufSBhdHRhY2hUb1dpbmRvdyAtIFdoZXRoZXIgZXZlbnRzIHNob3VsZCBiZSBhdHRhY2hlZCB0byB0aGUgd2luZG93LiBJZiBmYWxzZSwgdGhleSB3aWxsIGJlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRhY2hlZCB0byB0aGUgRGlzcGxheSdzIGRvbUVsZW1lbnQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzIC0gVGhlIHZhbHVlIG9mIHRoZSBgcGFzc2l2ZWAgb3B0aW9uIGZvciBhZGRpbmcvcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVyc1xuICAgKi9cbiAgYWRkRGlzcGxheSggZGlzcGxheSwgYXR0YWNoVG9XaW5kb3csIHBhc3NpdmVFdmVudHMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGlzcGxheSBpbnN0YW5jZW9mIERpc3BsYXkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgYXR0YWNoVG9XaW5kb3cgPT09ICdib29sZWFuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKSxcbiAgICAgICdBIGRpc3BsYXkgY2Fubm90IGJlIGNvbmN1cnJlbnRseSBhdHRhY2hlZCB0byBldmVudHMgbW9yZSB0aGFuIG9uZSB0aW1lJyApO1xuXG4gICAgLy8gQWx3YXlzIGZpcnN0IHBsZWFzZVxuICAgIGlmICggIWlzR2xvYmFsbHlBdHRhY2hlZCApIHtcbiAgICAgIGlzR2xvYmFsbHlBdHRhY2hlZCA9IHRydWU7XG5cbiAgICAgIC8vIG5ldmVyIHVuYXR0YWNoIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBpZiB0aGVyZSBhcmUgb3RoZXIgRGlzcGxheXMgbGlzdGVuaW5nIHRvIHRoaXMuXG4gICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuYXR0YWNoVG9XaW5kb3coKTtcbiAgICAgIEZvY3VzTWFuYWdlci5hdHRhY2hUb1dpbmRvdygpO1xuICAgIH1cblxuICAgIHRoaXMuYXR0YWNoZWREaXNwbGF5cy5wdXNoKCBkaXNwbGF5ICk7XG5cbiAgICBpZiAoIGF0dGFjaFRvV2luZG93ICkge1xuICAgICAgLy8gbGF6aWx5IGNvbm5lY3QgbGlzdGVuZXJzXG4gICAgICBpZiAoIHRoaXMuYXR0YWNoZWREaXNwbGF5cy5sZW5ndGggPT09IDEgKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdFdpbmRvd0xpc3RlbmVycyggcGFzc2l2ZUV2ZW50cyApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIGRpc3BsYXkuZG9tRWxlbWVudCwgdHJ1ZSwgcGFzc2l2ZUV2ZW50cyApO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIHRoZSB3aGVlbCBsaXN0ZW5lcnMgZGlyZWN0bHkgb24gdGhlIGVsZW1lbnRzLCBzbyBpdCB3b24ndCB0cmlnZ2VyIG91dHNpZGVcbiAgICBkaXNwbGF5LmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgdGhpcy5vbndoZWVsLCBCcm93c2VyRXZlbnRzLmdldEV2ZW50T3B0aW9ucyggcGFzc2l2ZUV2ZW50cywgdHJ1ZSApICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBEaXNwbGF5IHRvIHRoZSBsaXN0IG9mIGRpc3BsYXlzIHRoYXQgd2lsbCBiZSBub3RpZmllZCBvZiBpbnB1dCBldmVudHMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXR0YWNoVG9XaW5kb3cgLSBUaGUgdmFsdWUgcHJvdmlkZWQgdG8gYWRkRGlzcGxheVxuICAgKiBAcGFyYW0ge2Jvb2xlYW58bnVsbH0gcGFzc2l2ZUV2ZW50cyAtIFRoZSB2YWx1ZSBvZiB0aGUgYHBhc3NpdmVgIG9wdGlvbiBmb3IgYWRkaW5nL3JlbW92aW5nIERPTSBldmVudCBsaXN0ZW5lcnNcbiAgICovXG4gIHJlbW92ZURpc3BsYXkoIGRpc3BsYXksIGF0dGFjaFRvV2luZG93LCBwYXNzaXZlRXZlbnRzICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRpc3BsYXkgaW5zdGFuY2VvZiBEaXNwbGF5ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGF0dGFjaFRvV2luZG93ID09PSAnYm9vbGVhbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKSxcbiAgICAgICdUaGlzIGRpc3BsYXkgd2FzIG5vdCBhbHJlYWR5IGF0dGFjaGVkIHRvIGxpc3RlbiBmb3Igd2luZG93IGV2ZW50cycgKTtcblxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmF0dGFjaGVkRGlzcGxheXMsIGRpc3BsYXkgKTtcblxuICAgIC8vIGxhemlseSBkaXNjb25uZWN0IGxpc3RlbmVyc1xuICAgIGlmICggYXR0YWNoVG9XaW5kb3cgKSB7XG4gICAgICBpZiAoIHRoaXMuYXR0YWNoZWREaXNwbGF5cy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdFdpbmRvd0xpc3RlbmVycyggcGFzc2l2ZUV2ZW50cyApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIGRpc3BsYXkuZG9tRWxlbWVudCwgZmFsc2UsIHBhc3NpdmVFdmVudHMgKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5LmRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgdGhpcy5vbndoZWVsLCBCcm93c2VyRXZlbnRzLmdldEV2ZW50T3B0aW9ucyggcGFzc2l2ZUV2ZW50cywgdHJ1ZSApICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIHRvIHByb3ZpZGUgYXMgdGhlIDNyZCBwYXJhbWV0ZXIgdG8gYWRkRXZlbnRMaXN0ZW5lci9yZW1vdmVFdmVudExpc3RlbmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW58bnVsbH0gcGFzc2l2ZUV2ZW50c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTWFpbiAtIElmIGZhbHNlLCBpdCBpcyB1c2VkIG9uIHRoZSBcImRvY3VtZW50XCIgZm9yIHdvcmthcm91bmRzLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fGJvb2xlYW59XG4gICAqL1xuICBnZXRFdmVudE9wdGlvbnMoIHBhc3NpdmVFdmVudHMsIGlzTWFpbiApIHtcbiAgICBjb25zdCBwYXNzRGlyZWN0UGFzc2l2ZUZsYWcgPSBGZWF0dXJlcy5wYXNzaXZlICYmIHBhc3NpdmVFdmVudHMgIT09IG51bGw7XG4gICAgaWYgKCAhcGFzc0RpcmVjdFBhc3NpdmVGbGFnICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGV2ZW50T3B0aW9ucyA9IHsgcGFzc2l2ZTogcGFzc2l2ZUV2ZW50cyB9O1xuICAgICAgaWYgKCBpc01haW4gKSB7XG4gICAgICAgIGV2ZW50T3B0aW9ucy5jYXB0dXJlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFldmVudE9wdGlvbnMuY2FwdHVyZSwgJ0RvIG5vdCB1c2UgY2FwdHVyZSB3aXRob3V0IGNvbnN1bHRpbmcgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3doaWNoIGV4cGVjdHMgaGF2ZSBsaXN0ZW5lcnMgY2FsbGVkIEZJUlNUIGluIGtleWJvYXJkLXJlbGF0ZWQgY2FzZXMuJyApO1xuICAgICAgcmV0dXJuIGV2ZW50T3B0aW9ucztcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIHtudW1iZXJ9IC0gV2lsbCBiZSBjaGVja2VkL211dGF0ZWQgd2hlbiBsaXN0ZW5lcnMgYXJlIGFkZGVkL3JlbW92ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBsaXN0ZW5lcnNBdHRhY2hlZFRvV2luZG93OiAwLFxuXG4gIC8qKlxuICAgKiB7bnVtYmVyfSAtIFdpbGwgYmUgY2hlY2tlZC9tdXRhdGVkIHdoZW4gbGlzdGVuZXJzIGFyZSBhZGRlZC9yZW1vdmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbGlzdGVuZXJzQXR0YWNoZWRUb0VsZW1lbnQ6IDAsXG5cbiAgLyoqXG4gICAqIHtBcnJheS48RGlzcGxheT59IC0gQWxsIERpc3BsYXlzIHRoYXQgc2hvdWxkIGhhdmUgaW5wdXQgZXZlbnRzIGZvcndhcmRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGF0dGFjaGVkRGlzcGxheXM6IFtdLFxuXG4gIC8qKlxuICAgKiB7Ym9vbGVhbn0gLSBXaGV0aGVyIHBvaW50ZXIgZXZlbnRzIGluIHRoZSBmb3JtYXQgc3BlY2lmaWVkIGJ5IHRoZSBXM0Mgc3BlY2lmaWNhdGlvbiBhcmUgYWxsb3dlZC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogTk9URTogUG9pbnRlciBldmVudHMgYXJlIGN1cnJlbnRseSBkaXNhYmxlZCBmb3IgRmlyZWZveCBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzgzNy5cbiAgICovXG4gIGNhblVzZVBvaW50ZXJFdmVudHM6ICEhKCAoIHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci5wb2ludGVyRW5hYmxlZCApIHx8IHdpbmRvdy5Qb2ludGVyRXZlbnQgKSAmJiAhcGxhdGZvcm0uZmlyZWZveCxcblxuICAvKipcbiAgICoge2Jvb2xlYW59IC0gV2hldGhlciBwb2ludGVyIGV2ZW50cyBpbiB0aGUgZm9ybWF0IHNwZWNpZmllZCBieSB0aGUgTVMgc3BlY2lmaWNhdGlvbiBhcmUgYWxsb3dlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNhblVzZU1TUG9pbnRlckV2ZW50czogd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQsXG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBBbGwgVzNDIHBvaW50ZXIgZXZlbnQgdHlwZXMgdGhhdCB3ZSBjYXJlIGFib3V0LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcG9pbnRlckxpc3RlbmVyVHlwZXM6IFtcbiAgICAncG9pbnRlcmRvd24nLFxuICAgICdwb2ludGVydXAnLFxuICAgICdwb2ludGVybW92ZScsXG4gICAgJ3BvaW50ZXJvdmVyJyxcbiAgICAncG9pbnRlcm91dCcsXG4gICAgJ3BvaW50ZXJjYW5jZWwnLFxuICAgICdnb3Rwb2ludGVyY2FwdHVyZScsXG4gICAgJ2xvc3Rwb2ludGVyY2FwdHVyZSdcbiAgXSxcblxuICAvKipcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIEFsbCBNUyBwb2ludGVyIGV2ZW50IHR5cGVzIHRoYXQgd2UgY2FyZSBhYm91dC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1zUG9pbnRlckxpc3RlbmVyVHlwZXM6IFtcbiAgICAnTVNQb2ludGVyRG93bicsXG4gICAgJ01TUG9pbnRlclVwJyxcbiAgICAnTVNQb2ludGVyTW92ZScsXG4gICAgJ01TUG9pbnRlck92ZXInLFxuICAgICdNU1BvaW50ZXJPdXQnLFxuICAgICdNU1BvaW50ZXJDYW5jZWwnXG4gIF0sXG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBBbGwgdG91Y2ggZXZlbnQgdHlwZXMgdGhhdCB3ZSBjYXJlIGFib3V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB0b3VjaExpc3RlbmVyVHlwZXM6IFtcbiAgICAndG91Y2hzdGFydCcsXG4gICAgJ3RvdWNoZW5kJyxcbiAgICAndG91Y2htb3ZlJyxcbiAgICAndG91Y2hjYW5jZWwnXG4gIF0sXG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBBbGwgbW91c2UgZXZlbnQgdHlwZXMgdGhhdCB3ZSBjYXJlIGFib3V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtb3VzZUxpc3RlbmVyVHlwZXM6IFtcbiAgICAnbW91c2Vkb3duJyxcbiAgICAnbW91c2V1cCcsXG4gICAgJ21vdXNlbW92ZScsXG4gICAgJ21vdXNlb3ZlcicsXG4gICAgJ21vdXNlb3V0J1xuICBdLFxuXG4gIC8qKlxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gQWxsIHdoZWVsIGV2ZW50IHR5cGVzIHRoYXQgd2UgY2FyZSBhYm91dFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgd2hlZWxMaXN0ZW5lclR5cGVzOiBbXG4gICAgJ3doZWVsJ1xuICBdLFxuXG4gIC8qKlxuICAgKiB7QXJyYXkuPHN0cmluZz59IC0gQWx0ZXJuYXRpdmUgaW5wdXQgdHlwZXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFsdExpc3RlbmVyVHlwZXM6IFBET01VdGlscy5ET01fRVZFTlRTLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBldmVudCB0eXBlcyB0aGF0IHdpbGwgYmUgbGlzdGVuZWQgdG8gb24gdGhpcyBzcGVjaWZpYyBwbGF0Zm9ybS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHJldHVybnMge0FycmF5LjxzdHJpbmc+fVxuICAgKi9cbiAgZ2V0Tm9uV2hlZWxVc2VkVHlwZXMoKSB7XG4gICAgbGV0IGV2ZW50VHlwZXM7XG5cbiAgICBpZiAoIHRoaXMuY2FuVXNlUG9pbnRlckV2ZW50cyApIHtcbiAgICAgIC8vIGFjY2VwdHMgcG9pbnRlciBldmVudHMgY29ycmVzcG9uZGluZyB0byB0aGUgc3BlYyBhdCBodHRwOi8vd3d3LnczLm9yZy9UUi9wb2ludGVyZXZlbnRzL1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoICdEZXRlY3RlZCBwb2ludGVyIGV2ZW50cyBzdXBwb3J0LCB1c2luZyB0aGF0IGluc3RlYWQgb2YgbW91c2UvdG91Y2ggZXZlbnRzJyApO1xuXG4gICAgICBldmVudFR5cGVzID0gdGhpcy5wb2ludGVyTGlzdGVuZXJUeXBlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuY2FuVXNlTVNQb2ludGVyRXZlbnRzICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0ICYmIHNjZW5lcnlMb2cuSW5wdXQoICdEZXRlY3RlZCBNUyBwb2ludGVyIGV2ZW50cyBzdXBwb3J0LCB1c2luZyB0aGF0IGluc3RlYWQgb2YgbW91c2UvdG91Y2ggZXZlbnRzJyApO1xuXG4gICAgICBldmVudFR5cGVzID0gdGhpcy5tc1BvaW50ZXJMaXN0ZW5lclR5cGVzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dCAmJiBzY2VuZXJ5TG9nLklucHV0KCAnTm8gcG9pbnRlciBldmVudHMgc3VwcG9ydCBkZXRlY3RlZCwgdXNpbmcgbW91c2UvdG91Y2ggZXZlbnRzJyApO1xuXG4gICAgICBldmVudFR5cGVzID0gdGhpcy50b3VjaExpc3RlbmVyVHlwZXMuY29uY2F0KCB0aGlzLm1vdXNlTGlzdGVuZXJUeXBlcyApO1xuICAgIH1cblxuICAgIGV2ZW50VHlwZXMgPSBldmVudFR5cGVzLmNvbmNhdCggdGhpcy5hbHRMaXN0ZW5lclR5cGVzICk7XG5cbiAgICAvLyBldmVudFR5cGVzID0gZXZlbnRUeXBlcy5jb25jYXQoIHRoaXMud2hlZWxMaXN0ZW5lclR5cGVzICk7XG5cbiAgICByZXR1cm4gZXZlbnRUeXBlcztcbiAgfSxcblxuICAvKipcbiAgICogQ29ubmVjdHMgZXZlbnQgbGlzdGVuZXJzIGRpcmVjdGx5IHRvIHRoZSB3aW5kb3cuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzIC0gVGhlIHZhbHVlIG9mIHRoZSBgcGFzc2l2ZWAgb3B0aW9uIGZvciBhZGRpbmcvcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVyc1xuICAgKi9cbiAgY29ubmVjdFdpbmRvd0xpc3RlbmVycyggcGFzc2l2ZUV2ZW50cyApIHtcbiAgICB0aGlzLmFkZE9yUmVtb3ZlTGlzdGVuZXJzKCB3aW5kb3csIHRydWUsIHBhc3NpdmVFdmVudHMgKTtcbiAgfSxcblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgZXZlbnQgbGlzdGVuZXJzIGZyb20gdGhlIHdpbmRvdy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufG51bGx9IHBhc3NpdmVFdmVudHMgLSBUaGUgdmFsdWUgb2YgdGhlIGBwYXNzaXZlYCBvcHRpb24gZm9yIGFkZGluZy9yZW1vdmluZyBET00gZXZlbnQgbGlzdGVuZXJzXG4gICAqL1xuICBkaXNjb25uZWN0V2luZG93TGlzdGVuZXJzKCBwYXNzaXZlRXZlbnRzICkge1xuICAgIHRoaXMuYWRkT3JSZW1vdmVMaXN0ZW5lcnMoIHdpbmRvdywgZmFsc2UsIHBhc3NpdmVFdmVudHMgKTtcbiAgfSxcblxuICAvKipcbiAgICogRWl0aGVyIGFkZHMgb3IgcmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgdG8gYW4gb2JqZWN0LCBkZXBlbmRpbmcgb24gdGhlIGZsYWcuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gZWxlbWVudCAtIFRoZSBlbGVtZW50ICh3aW5kb3cgb3IgRE9NIGVsZW1lbnQpIHRvIGFkZCBsaXN0ZW5lcnMgdG8uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkT3JSZW1vdmUgLSBJZiB0cnVlLCBsaXN0ZW5lcnMgd2lsbCBiZSBhZGRlZC4gSWYgZmFsc2UsIGxpc3RlbmVycyB3aWxsIGJlIHJlbW92ZWQuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbnxudWxsfSBwYXNzaXZlRXZlbnRzIC0gVGhlIHZhbHVlIG9mIHRoZSBgcGFzc2l2ZWAgb3B0aW9uIGZvciBhZGRpbmcvcmVtb3ZpbmcgRE9NIGV2ZW50IGxpc3RlbmVyc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IGlmIGl0IGlzIHBhc3NlZCBpbiBhcyBudWxsLCB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGJyb3dzZXIgd2lsbCBiZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZWQuXG4gICAqL1xuICBhZGRPclJlbW92ZUxpc3RlbmVycyggZWxlbWVudCwgYWRkT3JSZW1vdmUsIHBhc3NpdmVFdmVudHMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGFkZE9yUmVtb3ZlID09PSAnYm9vbGVhbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcGFzc2l2ZUV2ZW50cyA9PT0gJ2Jvb2xlYW4nIHx8IHBhc3NpdmVFdmVudHMgPT09IG51bGwgKTtcblxuICAgIGNvbnN0IGZvcldpbmRvdyA9IGVsZW1lbnQgPT09IHdpbmRvdztcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhZm9yV2luZG93IHx8ICggdGhpcy5saXN0ZW5lcnNBdHRhY2hlZFRvV2luZG93ID4gMCApID09PSAhYWRkT3JSZW1vdmUsXG4gICAgICAnRG8gbm90IGFkZCBsaXN0ZW5lcnMgdG8gdGhlIHdpbmRvdyB3aGVuIGFscmVhZHkgYXR0YWNoZWQsIG9yIHJlbW92ZSBsaXN0ZW5lcnMgd2hlbiBub25lIGFyZSBhdHRhY2hlZCcgKTtcblxuICAgIGNvbnN0IGRlbHRhID0gYWRkT3JSZW1vdmUgPyAxIDogLTE7XG4gICAgaWYgKCBmb3JXaW5kb3cgKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc0F0dGFjaGVkVG9XaW5kb3cgKz0gZGVsdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5saXN0ZW5lcnNBdHRhY2hlZFRvRWxlbWVudCArPSBkZWx0YTtcbiAgICB9XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5saXN0ZW5lcnNBdHRhY2hlZFRvV2luZG93ID09PSAwIHx8IHRoaXMubGlzdGVuZXJzQXR0YWNoZWRUb0VsZW1lbnQgPT09IDAsXG4gICAgICAnTGlzdGVuZXJzIHNob3VsZCBub3QgYmUgYWRkZWQgYm90aCB3aXRoIGFkZERpc3BsYXlUb1dpbmRvdyBhbmQgYWRkRGlzcGxheVRvRWxlbWVudC4gVXNlIG9ubHkgb25lLicgKTtcblxuICAgIGNvbnN0IG1ldGhvZCA9IGFkZE9yUmVtb3ZlID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4gICAgLy8ge0FycmF5LjxzdHJpbmc+fVxuICAgIGNvbnN0IGV2ZW50VHlwZXMgPSB0aGlzLmdldE5vbldoZWVsVXNlZFR5cGVzKCk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBldmVudFR5cGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdHlwZSA9IGV2ZW50VHlwZXNbIGkgXTtcblxuICAgICAgLy8gSWYgd2UgYWRkIGlucHV0IGxpc3RlbmVycyB0byB0aGUgd2luZG93IGl0c2VsZiwgaU9TIFNhZmFyaSA3IHdvbid0IHNlbmQgdG91Y2ggZXZlbnRzIHRvIGRpc3BsYXlzIGluIGFuXG4gICAgICAvLyBpZnJhbWUgdW5sZXNzIHdlIGFsc28gYWRkIGR1bW15IGxpc3RlbmVycyB0byB0aGUgZG9jdW1lbnQuXG4gICAgICBpZiAoIGZvcldpbmRvdyApIHtcbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3Igb2xkZXIgYnJvd3NlcnMgbmVlZGVkLFxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjSW1wcm92aW5nX3Njcm9sbGluZ19wZXJmb3JtYW5jZV93aXRoX3Bhc3NpdmVfbGlzdGVuZXJzXG4gICAgICAgIGRvY3VtZW50WyBtZXRob2QgXSggdHlwZSwgbm9vcCwgQnJvd3NlckV2ZW50cy5nZXRFdmVudE9wdGlvbnMoIHBhc3NpdmVFdmVudHMsIGZhbHNlICkgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzWyBgb24ke3R5cGV9YCBdO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISFjYWxsYmFjayApO1xuXG4gICAgICAvLyBXb3JrYXJvdW5kIGZvciBvbGRlciBicm93c2VycyBuZWVkZWQsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjSW1wcm92aW5nX3Njcm9sbGluZ19wZXJmb3JtYW5jZV93aXRoX3Bhc3NpdmVfbGlzdGVuZXJzXG4gICAgICBlbGVtZW50WyBtZXRob2QgXSggdHlwZSwgY2FsbGJhY2ssIEJyb3dzZXJFdmVudHMuZ2V0RXZlbnRPcHRpb25zKCBwYXNzaXZlRXZlbnRzLCB0cnVlICkgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgYW4gZXZlbnQgZnJvbSB0aGUgd2luZG93IHRvIGJlIGJhdGNoZWQgb24gYWxsIG9mIHRoZSBkaXNwbGF5cy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudENvbnRleHR9IGV2ZW50Q29udGV4dFxuICAgKiBAcGFyYW0ge0JhdGNoZWRET01FdmVudFR5cGV9IGJhdGNoVHlwZSAtIFRPRE86IHR1cm4gdG8gZnVsbCBlbnVtZXJhdGlvbj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlucHV0Q2FsbGJhY2tOYW1lIC0gZS5nLiAnbW91c2VEb3duJywgd2lsbCB0cmlnZ2VyIElucHV0Lm1vdXNlRG93blxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRyaWdnZXJJbW1lZGlhdGUgLSBXaGV0aGVyIHRoaXMgd2lsbCBiZSBmb3JjZS1leGVjdXRlZCBub3csIGNhdXNpbmcgYWxsIGJhdGNoZWQgZXZlbnRzIHRvIGZpcmUuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZWZ1bCBmb3IgZXZlbnRzIChsaWtlIG1vdXNldXApIHRoYXQgcmVzcG9uZGluZyBzeW5jaHJvbm91c2x5IGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lY2Vzc2FyeSBmb3IgY2VydGFpbiBzZWN1cml0eS1zZW5zaXRpdmUgYWN0aW9ucyAobGlrZSB0cmlnZ2VyaW5nXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGwtc2NyZWVuKS5cbiAgICovXG4gIGJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgYmF0Y2hUeXBlLCBpbnB1dENhbGxiYWNrTmFtZSwgdHJpZ2dlckltbWVkaWF0ZSApIHtcbiAgICAvLyBOT1RFOiBGb3Igbm93LCB3ZSBkb24ndCBjaGVjayB3aGV0aGVyIHRoZSBldmVudCBpcyBhY3R1YWxseSB3aXRoaW4gdGhlIGRpc3BsYXkncyBib3VuZGluZ0NsaWVudFJlY3QuIE1vc3RcbiAgICAvLyBkaXNwbGF5cyB3aWxsIHdhbnQgdG8gcmVjZWl2ZSBldmVudHMgb3V0c2lkZSBvZiB0aGVpciBib3VuZHMgKGVzcGVjaWFsbHkgZm9yIGNoZWNraW5nIGRyYWdzIGFuZCBtb3VzZS11cHNcbiAgICAvLyBvdXRzaWRlIG9mIHRoZWlyIGJvdW5kcykuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5hdHRhY2hlZERpc3BsYXlzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZGlzcGxheSA9IHRoaXMuYXR0YWNoZWREaXNwbGF5c1sgaSBdO1xuICAgICAgY29uc3QgaW5wdXQgPSBkaXNwbGF5Ll9pbnB1dDtcblxuICAgICAgaWYgKCAhQnJvd3NlckV2ZW50cy5ibG9ja0ZvY3VzQ2FsbGJhY2tzIHx8ICggaW5wdXRDYWxsYmFja05hbWUgIT09ICdmb2N1c0luJyAmJiBpbnB1dENhbGxiYWNrTmFtZSAhPT0gJ2ZvY3VzT3V0JyApICkge1xuICAgICAgICBpbnB1dC5iYXRjaEV2ZW50KCBldmVudENvbnRleHQsIGJhdGNoVHlwZSwgaW5wdXRbIGlucHV0Q2FsbGJhY2tOYW1lIF0sIHRyaWdnZXJJbW1lZGlhdGUgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyZG93biBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9ucG9pbnRlcmRvd246IGZ1bmN0aW9uIG9ucG9pbnRlcmRvd24oIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJkb3duJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gR2V0IHRoZSBhY3RpdmUgZWxlbWVudCBCRUZPUkUgYW55IGFjdGlvbnMgYXJlIHRha2VuXG4gICAgY29uc3QgZXZlbnRDb250ZXh0ID0gbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKTtcblxuICAgIGlmICggZG9tRXZlbnQucG9pbnRlclR5cGUgPT09ICdtb3VzZScgKSB7XG4gICAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggZXZlbnRDb250ZXh0LCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJEb3duJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVydXAgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XG4gICAqL1xuICBvbnBvaW50ZXJ1cDogZnVuY3Rpb24gb25wb2ludGVydXAoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJ1cCcgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIEdldCB0aGUgYWN0aXZlIGVsZW1lbnQgQkVGT1JFIGFueSBhY3Rpb25zIGFyZSB0YWtlblxuICAgIGNvbnN0IGV2ZW50Q29udGV4dCA9IG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICk7XG5cbiAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5lbWl0KCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBldmVudENvbnRleHQsIEJhdGNoZWRET01FdmVudFR5cGUuUE9JTlRFUl9UWVBFLCAncG9pbnRlclVwJywgdHJ1ZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIHBvaW50ZXJtb3ZlIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25wb2ludGVybW92ZTogZnVuY3Rpb24gb25wb2ludGVybW92ZSggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAncG9pbnRlcm1vdmUnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJNb3ZlJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyb3ZlciBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9ucG9pbnRlcm92ZXI6IGZ1bmN0aW9uIG9ucG9pbnRlcm92ZXIoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJvdmVyJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5QT0lOVEVSX1RZUEUsICdwb2ludGVyT3ZlcicsIGZhbHNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgcG9pbnRlcm91dCBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9ucG9pbnRlcm91dDogZnVuY3Rpb24gb25wb2ludGVyb3V0KCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdwb2ludGVyb3V0JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5QT0lOVEVSX1RZUEUsICdwb2ludGVyT3V0JywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBwb2ludGVyY2FuY2VsIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25wb2ludGVyY2FuY2VsOiBmdW5jdGlvbiBvbnBvaW50ZXJjYW5jZWwoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3BvaW50ZXJjYW5jZWwnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ3BvaW50ZXJDYW5jZWwnLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIGdvdHBvaW50ZXJjYXB0dXJlIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25nb3Rwb2ludGVyY2FwdHVyZTogZnVuY3Rpb24gb25nb3Rwb2ludGVyY2FwdHVyZSggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnZ290cG9pbnRlcmNhcHR1cmUnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlBPSU5URVJfVFlQRSwgJ2dvdFBvaW50ZXJDYXB0dXJlJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBsb3N0cG9pbnRlcmNhcHR1cmUgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XG4gICAqL1xuICBvbmxvc3Rwb2ludGVyY2FwdHVyZTogZnVuY3Rpb24gb25sb3N0cG9pbnRlcmNhcHR1cmUoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ2xvc3Rwb2ludGVyY2FwdHVyZScgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuUE9JTlRFUl9UWVBFLCAnbG9zdFBvaW50ZXJDYXB0dXJlJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBNU1BvaW50ZXJEb3duIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25NU1BvaW50ZXJEb3duOiBmdW5jdGlvbiBvbk1TUG9pbnRlckRvd24oIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ01TUG9pbnRlckRvd24nICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1TX1BPSU5URVJfVFlQRSwgJ3BvaW50ZXJEb3duJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBNU1BvaW50ZXJVcCBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9uTVNQb2ludGVyVXA6IGZ1bmN0aW9uIG9uTVNQb2ludGVyVXAoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ01TUG9pbnRlclVwJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUsICdwb2ludGVyVXAnLCB0cnVlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyTW92ZSBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9uTVNQb2ludGVyTW92ZTogZnVuY3Rpb24gb25NU1BvaW50ZXJNb3ZlKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJNb3ZlJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUsICdwb2ludGVyTW92ZScsIGZhbHNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyT3ZlciBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9uTVNQb2ludGVyT3ZlcjogZnVuY3Rpb24gb25NU1BvaW50ZXJPdmVyKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJPdmVyJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUsICdwb2ludGVyT3ZlcicsIGZhbHNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgTVNQb2ludGVyT3V0IGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25NU1BvaW50ZXJPdXQ6IGZ1bmN0aW9uIG9uTVNQb2ludGVyT3V0KCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdNU1BvaW50ZXJPdXQnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1TX1BPSU5URVJfVFlQRSwgJ3BvaW50ZXJPdXQnLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIE1TUG9pbnRlckNhbmNlbCBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9uTVNQb2ludGVyQ2FuY2VsOiBmdW5jdGlvbiBvbk1TUG9pbnRlckNhbmNlbCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnTVNQb2ludGVyQ2FuY2VsJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NU19QT0lOVEVSX1RZUEUsICdwb2ludGVyQ2FuY2VsJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyB0b3VjaHN0YXJ0IGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb250b3VjaHN0YXJ0OiBmdW5jdGlvbiBvbnRvdWNoc3RhcnQoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3RvdWNoc3RhcnQnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlRPVUNIX1RZUEUsICd0b3VjaFN0YXJ0JywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyB0b3VjaGVuZCBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9udG91Y2hlbmQ6IGZ1bmN0aW9uIG9udG91Y2hlbmQoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ3RvdWNoZW5kJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gR2V0IHRoZSBhY3RpdmUgZWxlbWVudCBCRUZPUkUgYW55IGFjdGlvbnMgYXJlIHRha2VuXG4gICAgY29uc3QgZXZlbnRDb250ZXh0ID0gbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKTtcblxuICAgIERpc3BsYXkudXNlckdlc3R1cmVFbWl0dGVyLmVtaXQoKTtcblxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIGV2ZW50Q29udGV4dCwgQmF0Y2hlZERPTUV2ZW50VHlwZS5UT1VDSF9UWVBFLCAndG91Y2hFbmQnLCB0cnVlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgdG91Y2htb3ZlIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb250b3VjaG1vdmU6IGZ1bmN0aW9uIG9udG91Y2htb3ZlKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICd0b3VjaG1vdmUnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlRPVUNIX1RZUEUsICd0b3VjaE1vdmUnLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIHRvdWNoY2FuY2VsIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb250b3VjaGNhbmNlbDogZnVuY3Rpb24gb250b3VjaGNhbmNlbCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAndG91Y2hjYW5jZWwnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLlRPVUNIX1RZUEUsICd0b3VjaENhbmNlbCcsIGZhbHNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgbW91c2Vkb3duIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25tb3VzZWRvd246IGZ1bmN0aW9uIG9ubW91c2Vkb3duKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdtb3VzZWRvd24nICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBHZXQgdGhlIGFjdGl2ZSBlbGVtZW50IEJFRk9SRSBhbnkgYWN0aW9ucyBhcmUgdGFrZW5cbiAgICBjb25zdCBldmVudENvbnRleHQgPSBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApO1xuXG4gICAgRGlzcGxheS51c2VyR2VzdHVyZUVtaXR0ZXIuZW1pdCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggZXZlbnRDb250ZXh0LCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUsICdtb3VzZURvd24nLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNldXAgZXZlbnQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RXZlbnR9IGRvbUV2ZW50XG4gICAqL1xuICBvbm1vdXNldXA6IGZ1bmN0aW9uIG9ubW91c2V1cCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2V1cCcgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIEdldCB0aGUgYWN0aXZlIGVsZW1lbnQgQkVGT1JFIGFueSBhY3Rpb25zIGFyZSB0YWtlblxuICAgIGNvbnN0IGV2ZW50Q29udGV4dCA9IG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICk7XG5cbiAgICBEaXNwbGF5LnVzZXJHZXN0dXJlRW1pdHRlci5lbWl0KCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBldmVudENvbnRleHQsIEJhdGNoZWRET01FdmVudFR5cGUuTU9VU0VfVFlQRSwgJ21vdXNlVXAnLCB0cnVlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBmb3Igd2luZG93J3MgbW91c2Vtb3ZlIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb25tb3VzZW1vdmU6IGZ1bmN0aW9uIG9ubW91c2Vtb3ZlKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdtb3VzZW1vdmUnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLk1PVVNFX1RZUEUsICdtb3VzZU1vdmUnLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIG1vdXNlb3ZlciBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9ubW91c2VvdmVyOiBmdW5jdGlvbiBvbm1vdXNlb3ZlciggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnbW91c2VvdmVyJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NT1VTRV9UWVBFLCAnbW91c2VPdmVyJywgZmFsc2UgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGZvciB3aW5kb3cncyBtb3VzZW91dCBldmVudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFdmVudH0gZG9tRXZlbnRcbiAgICovXG4gIG9ubW91c2VvdXQ6IGZ1bmN0aW9uIG9ubW91c2VvdXQoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ21vdXNlb3V0JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuICAgIEJyb3dzZXJFdmVudHMuYmF0Y2hXaW5kb3dFdmVudCggbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSwgQmF0Y2hlZERPTUV2ZW50VHlwZS5NT1VTRV9UWVBFLCAnbW91c2VPdXQnLCBmYWxzZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICAvKipcbiAgICogTGlzdGVuZXIgZm9yIHdpbmRvdydzIHdoZWVsIGV2ZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBkb21FdmVudFxuICAgKi9cbiAgb253aGVlbDogZnVuY3Rpb24gb253aGVlbCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnd2hlZWwnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLldIRUVMX1RZUEUsICd3aGVlbCcsIGZhbHNlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIG9uZm9jdXNpbjogZnVuY3Rpb24gb25mb2N1c2luKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdmb2N1c2luJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuXG4gICAgQnJvd3NlckV2ZW50cy5kaXNwYXRjaGluZ0ZvY3VzRXZlbnRzID0gdHJ1ZTtcblxuICAgIC8vIFVwZGF0ZSBzdGF0ZSByZWxhdGVkIHRvIGZvY3VzIGltbWVkaWF0ZWx5IGFuZCBhbGxvd2luZyBmb3IgcmVlbnRyYW5jeSBmb3IgZm9jdXMgc3RhdGVcbiAgICAvLyB0aGF0IG11c3QgbWF0Y2ggdGhlIGJyb3dzZXIncyBmb2N1cyBzdGF0ZS5cbiAgICBGb2N1c01hbmFnZXIudXBkYXRlUERPTUZvY3VzRnJvbUV2ZW50KCBCcm93c2VyRXZlbnRzLmF0dGFjaGVkRGlzcGxheXMsIGRvbUV2ZW50LCB0cnVlICk7XG5cbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuQUxUX1RZUEUsICdmb2N1c0luJywgdHJ1ZSApO1xuXG4gICAgQnJvd3NlckV2ZW50cy5kaXNwYXRjaGluZ0ZvY3VzRXZlbnRzID0gZmFsc2U7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9LFxuXG4gIG9uZm9jdXNvdXQ6IGZ1bmN0aW9uIG9uZm9jdXNvdXQoIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ2ZvY3Vzb3V0JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gTk9URTogV2lsbCBiZSBjYWxsZWQgd2l0aG91dCBhIHByb3BlciAndGhpcycgcmVmZXJlbmNlLiBEbyBOT1QgcmVseSBvbiBpdCBoZXJlLlxuXG4gICAgQnJvd3NlckV2ZW50cy5kaXNwYXRjaGluZ0ZvY3VzRXZlbnRzID0gdHJ1ZTtcblxuICAgIC8vIFVwZGF0ZSBzdGF0ZSByZWxhdGVkIHRvIGZvY3VzIGltbWVkaWF0ZWx5IGFuZCBhbGxvd2luZyBmb3IgcmVlbnRyYW5jeSBmb3IgZm9jdXMgc3RhdGVcbiAgICBGb2N1c01hbmFnZXIudXBkYXRlUERPTUZvY3VzRnJvbUV2ZW50KCBCcm93c2VyRXZlbnRzLmF0dGFjaGVkRGlzcGxheXMsIGRvbUV2ZW50LCBmYWxzZSApO1xuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAnZm9jdXNPdXQnLCB0cnVlICk7XG5cbiAgICBCcm93c2VyRXZlbnRzLmRpc3BhdGNoaW5nRm9jdXNFdmVudHMgPSBmYWxzZTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgb25pbnB1dDogZnVuY3Rpb24gb25pbnB1dCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAnaW5wdXQnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG5cbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuQUxUX1RZUEUsICdpbnB1dCcsIHRydWUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgb25jaGFuZ2U6IGZ1bmN0aW9uIG9uY2hhbmdlKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdjaGFuZ2UnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAnY2hhbmdlJywgdHJ1ZSApO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfSxcblxuICBvbmNsaWNrOiBmdW5jdGlvbiBvbmNsaWNrKCBkb21FdmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQoICdjbGljaycgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIE5PVEU6IFdpbGwgYmUgY2FsbGVkIHdpdGhvdXQgYSBwcm9wZXIgJ3RoaXMnIHJlZmVyZW5jZS4gRG8gTk9UIHJlbHkgb24gaXQgaGVyZS5cbiAgICBCcm93c2VyRXZlbnRzLmJhdGNoV2luZG93RXZlbnQoIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICksIEJhdGNoZWRET01FdmVudFR5cGUuQUxUX1RZUEUsICdjbGljaycsIHRydWUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgb25rZXlkb3duOiBmdW5jdGlvbiBvbmtleWRvd24oIGRvbUV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cuT25JbnB1dCggJ2tleWRvd24nICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAna2V5RG93bicsIHRydWUgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5PbklucHV0ICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH0sXG5cbiAgb25rZXl1cDogZnVuY3Rpb24gb25rZXl1cCggZG9tRXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5PbklucHV0KCAna2V5dXAnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLk9uSW5wdXQgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBOT1RFOiBXaWxsIGJlIGNhbGxlZCB3aXRob3V0IGEgcHJvcGVyICd0aGlzJyByZWZlcmVuY2UuIERvIE5PVCByZWx5IG9uIGl0IGhlcmUuXG4gICAgQnJvd3NlckV2ZW50cy5iYXRjaFdpbmRvd0V2ZW50KCBuZXcgRXZlbnRDb250ZXh0KCBkb21FdmVudCApLCBCYXRjaGVkRE9NRXZlbnRUeXBlLkFMVF9UWVBFLCAna2V5VXAnLCB0cnVlICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuT25JbnB1dCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG59O1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnQnJvd3NlckV2ZW50cycsIEJyb3dzZXJFdmVudHMgKTtcblxuZXhwb3J0IGRlZmF1bHQgQnJvd3NlckV2ZW50czsiXSwibmFtZXMiOlsiYXJyYXlSZW1vdmUiLCJwbGF0Zm9ybSIsIkJhdGNoZWRET01FdmVudFR5cGUiLCJEaXNwbGF5IiwiRXZlbnRDb250ZXh0IiwiRmVhdHVyZXMiLCJGb2N1c01hbmFnZXIiLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJQRE9NVXRpbHMiLCJzY2VuZXJ5Iiwibm9vcCIsImlzR2xvYmFsbHlBdHRhY2hlZCIsIkJyb3dzZXJFdmVudHMiLCJibG9ja0ZvY3VzQ2FsbGJhY2tzIiwiZGlzcGF0Y2hpbmdGb2N1c0V2ZW50cyIsImFkZERpc3BsYXkiLCJkaXNwbGF5IiwiYXR0YWNoVG9XaW5kb3ciLCJwYXNzaXZlRXZlbnRzIiwiYXNzZXJ0IiwiXyIsImluY2x1ZGVzIiwiYXR0YWNoZWREaXNwbGF5cyIsInB1c2giLCJsZW5ndGgiLCJjb25uZWN0V2luZG93TGlzdGVuZXJzIiwiYWRkT3JSZW1vdmVMaXN0ZW5lcnMiLCJkb21FbGVtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9ud2hlZWwiLCJnZXRFdmVudE9wdGlvbnMiLCJyZW1vdmVEaXNwbGF5IiwiZGlzY29ubmVjdFdpbmRvd0xpc3RlbmVycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJpc01haW4iLCJwYXNzRGlyZWN0UGFzc2l2ZUZsYWciLCJwYXNzaXZlIiwiZXZlbnRPcHRpb25zIiwiY2FwdHVyZSIsImxpc3RlbmVyc0F0dGFjaGVkVG9XaW5kb3ciLCJsaXN0ZW5lcnNBdHRhY2hlZFRvRWxlbWVudCIsImNhblVzZVBvaW50ZXJFdmVudHMiLCJ3aW5kb3ciLCJuYXZpZ2F0b3IiLCJwb2ludGVyRW5hYmxlZCIsIlBvaW50ZXJFdmVudCIsImZpcmVmb3giLCJjYW5Vc2VNU1BvaW50ZXJFdmVudHMiLCJtc1BvaW50ZXJFbmFibGVkIiwicG9pbnRlckxpc3RlbmVyVHlwZXMiLCJtc1BvaW50ZXJMaXN0ZW5lclR5cGVzIiwidG91Y2hMaXN0ZW5lclR5cGVzIiwibW91c2VMaXN0ZW5lclR5cGVzIiwid2hlZWxMaXN0ZW5lclR5cGVzIiwiYWx0TGlzdGVuZXJUeXBlcyIsIkRPTV9FVkVOVFMiLCJnZXROb25XaGVlbFVzZWRUeXBlcyIsImV2ZW50VHlwZXMiLCJzY2VuZXJ5TG9nIiwiSW5wdXQiLCJjb25jYXQiLCJlbGVtZW50IiwiYWRkT3JSZW1vdmUiLCJmb3JXaW5kb3ciLCJkZWx0YSIsIm1ldGhvZCIsImkiLCJ0eXBlIiwiZG9jdW1lbnQiLCJjYWxsYmFjayIsImJhdGNoV2luZG93RXZlbnQiLCJldmVudENvbnRleHQiLCJiYXRjaFR5cGUiLCJpbnB1dENhbGxiYWNrTmFtZSIsInRyaWdnZXJJbW1lZGlhdGUiLCJpbnB1dCIsIl9pbnB1dCIsImJhdGNoRXZlbnQiLCJvbnBvaW50ZXJkb3duIiwiZG9tRXZlbnQiLCJPbklucHV0IiwicG9pbnRlclR5cGUiLCJ1c2VyR2VzdHVyZUVtaXR0ZXIiLCJlbWl0IiwiUE9JTlRFUl9UWVBFIiwicG9wIiwib25wb2ludGVydXAiLCJvbnBvaW50ZXJtb3ZlIiwib25wb2ludGVyb3ZlciIsIm9ucG9pbnRlcm91dCIsIm9ucG9pbnRlcmNhbmNlbCIsIm9uZ290cG9pbnRlcmNhcHR1cmUiLCJvbmxvc3Rwb2ludGVyY2FwdHVyZSIsIm9uTVNQb2ludGVyRG93biIsIk1TX1BPSU5URVJfVFlQRSIsIm9uTVNQb2ludGVyVXAiLCJvbk1TUG9pbnRlck1vdmUiLCJvbk1TUG9pbnRlck92ZXIiLCJvbk1TUG9pbnRlck91dCIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib250b3VjaHN0YXJ0IiwiVE9VQ0hfVFlQRSIsIm9udG91Y2hlbmQiLCJvbnRvdWNobW92ZSIsIm9udG91Y2hjYW5jZWwiLCJvbm1vdXNlZG93biIsIk1PVVNFX1RZUEUiLCJvbm1vdXNldXAiLCJvbm1vdXNlbW92ZSIsIm9ubW91c2VvdmVyIiwib25tb3VzZW91dCIsIldIRUVMX1RZUEUiLCJvbmZvY3VzaW4iLCJ1cGRhdGVQRE9NRm9jdXNGcm9tRXZlbnQiLCJBTFRfVFlQRSIsIm9uZm9jdXNvdXQiLCJvbmlucHV0Iiwib25jaGFuZ2UiLCJvbmNsaWNrIiwib25rZXlkb3duIiwib25rZXl1cCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGlCQUFpQix1Q0FBdUM7QUFDL0QsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0MsbUJBQW1CLEVBQUVDLE9BQU8sRUFBRUMsWUFBWSxFQUFFQyxRQUFRLEVBQUVDLFlBQVksRUFBRUMscUJBQXFCLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUU5SSxtRUFBbUU7QUFDbkUsTUFBTUMsT0FBTyxLQUFPO0FBRXBCLDJFQUEyRTtBQUMzRSxJQUFJQyxxQkFBcUI7QUFFekIsTUFBTUMsZ0JBQWdCO0lBRXBCLDBHQUEwRztJQUMxRyxnSEFBZ0g7SUFDaEgsOEJBQThCO0lBQzlCQyxxQkFBcUI7SUFFckIsNkdBQTZHO0lBQzdHLDZGQUE2RjtJQUM3RkMsd0JBQXdCO0lBRXhCOzs7Ozs7OztHQVFDLEdBQ0RDLFlBQVlDLE9BQU8sRUFBRUMsY0FBYyxFQUFFQyxhQUFhO1FBQ2hEQyxVQUFVQSxPQUFRSCxtQkFBbUJiO1FBQ3JDZ0IsVUFBVUEsT0FBUSxPQUFPRixtQkFBbUI7UUFDNUNFLFVBQVVBLE9BQVEsQ0FBQ0MsRUFBRUMsUUFBUSxDQUFFLElBQUksQ0FBQ0MsZ0JBQWdCLEVBQUVOLFVBQ3BEO1FBRUYsc0JBQXNCO1FBQ3RCLElBQUssQ0FBQ0wsb0JBQXFCO1lBQ3pCQSxxQkFBcUI7WUFFckIsc0ZBQXNGO1lBQ3RGSixzQkFBc0JVLGNBQWM7WUFDcENYLGFBQWFXLGNBQWM7UUFDN0I7UUFFQSxJQUFJLENBQUNLLGdCQUFnQixDQUFDQyxJQUFJLENBQUVQO1FBRTVCLElBQUtDLGdCQUFpQjtZQUNwQiwyQkFBMkI7WUFDM0IsSUFBSyxJQUFJLENBQUNLLGdCQUFnQixDQUFDRSxNQUFNLEtBQUssR0FBSTtnQkFDeEMsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBRVA7WUFDL0I7UUFDRixPQUNLO1lBQ0gsSUFBSSxDQUFDUSxvQkFBb0IsQ0FBRVYsUUFBUVcsVUFBVSxFQUFFLE1BQU1UO1FBQ3ZEO1FBRUEscUZBQXFGO1FBQ3JGRixRQUFRVyxVQUFVLENBQUNDLGdCQUFnQixDQUFFLFNBQVMsSUFBSSxDQUFDQyxPQUFPLEVBQUVqQixjQUFja0IsZUFBZSxDQUFFWixlQUFlO0lBQzVHO0lBRUE7Ozs7Ozs7R0FPQyxHQUNEYSxlQUFlZixPQUFPLEVBQUVDLGNBQWMsRUFBRUMsYUFBYTtRQUNuREMsVUFBVUEsT0FBUUgsbUJBQW1CYjtRQUNyQ2dCLFVBQVVBLE9BQVEsT0FBT0YsbUJBQW1CO1FBQzVDRSxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUUsSUFBSSxDQUFDQyxnQkFBZ0IsRUFBRU4sVUFDbkQ7UUFFRmhCLFlBQWEsSUFBSSxDQUFDc0IsZ0JBQWdCLEVBQUVOO1FBRXBDLDhCQUE4QjtRQUM5QixJQUFLQyxnQkFBaUI7WUFDcEIsSUFBSyxJQUFJLENBQUNLLGdCQUFnQixDQUFDRSxNQUFNLEtBQUssR0FBSTtnQkFDeEMsSUFBSSxDQUFDUSx5QkFBeUIsQ0FBRWQ7WUFDbEM7UUFDRixPQUNLO1lBQ0gsSUFBSSxDQUFDUSxvQkFBb0IsQ0FBRVYsUUFBUVcsVUFBVSxFQUFFLE9BQU9UO1FBQ3hEO1FBRUFGLFFBQVFXLFVBQVUsQ0FBQ00sbUJBQW1CLENBQUUsU0FBUyxJQUFJLENBQUNKLE9BQU8sRUFBRWpCLGNBQWNrQixlQUFlLENBQUVaLGVBQWU7SUFDL0c7SUFFQTs7Ozs7OztHQU9DLEdBQ0RZLGlCQUFpQlosYUFBYSxFQUFFZ0IsTUFBTTtRQUNwQyxNQUFNQyx3QkFBd0I5QixTQUFTK0IsT0FBTyxJQUFJbEIsa0JBQWtCO1FBQ3BFLElBQUssQ0FBQ2lCLHVCQUF3QjtZQUM1QixPQUFPO1FBQ1QsT0FDSztZQUNILE1BQU1FLGVBQWU7Z0JBQUVELFNBQVNsQjtZQUFjO1lBQzlDLElBQUtnQixRQUFTO2dCQUNaRyxhQUFhQyxPQUFPLEdBQUc7WUFDekI7WUFFQW5CLFVBQVVBLE9BQVEsQ0FBQ2tCLGFBQWFDLE9BQU8sRUFBRSxrRUFDQTtZQUN6QyxPQUFPRDtRQUNUO0lBQ0Y7SUFFQTs7O0dBR0MsR0FDREUsMkJBQTJCO0lBRTNCOzs7R0FHQyxHQUNEQyw0QkFBNEI7SUFFNUI7OztHQUdDLEdBQ0RsQixrQkFBa0IsRUFBRTtJQUVwQjs7Ozs7R0FLQyxHQUNEbUIscUJBQXFCLENBQUMsQ0FBRyxDQUFBLEFBQUVDLE9BQU9DLFNBQVMsSUFBSUQsT0FBT0MsU0FBUyxDQUFDQyxjQUFjLElBQU1GLE9BQU9HLFlBQVksQUFBRCxLQUFPLENBQUM1QyxTQUFTNkMsT0FBTztJQUU5SDs7O0dBR0MsR0FDREMsdUJBQXVCTCxPQUFPQyxTQUFTLElBQUlELE9BQU9DLFNBQVMsQ0FBQ0ssZ0JBQWdCO0lBRTVFOzs7R0FHQyxHQUNEQyxzQkFBc0I7UUFDcEI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNEO0lBRUQ7OztHQUdDLEdBQ0RDLHdCQUF3QjtRQUN0QjtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRDtJQUVEOzs7R0FHQyxHQUNEQyxvQkFBb0I7UUFDbEI7UUFDQTtRQUNBO1FBQ0E7S0FDRDtJQUVEOzs7R0FHQyxHQUNEQyxvQkFBb0I7UUFDbEI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtLQUNEO0lBRUQ7OztHQUdDLEdBQ0RDLG9CQUFvQjtRQUNsQjtLQUNEO0lBRUQ7OztHQUdDLEdBQ0RDLGtCQUFrQjlDLFVBQVUrQyxVQUFVO0lBRXRDOzs7OztHQUtDLEdBQ0RDO1FBQ0UsSUFBSUM7UUFFSixJQUFLLElBQUksQ0FBQ2hCLG1CQUFtQixFQUFHO1lBQzlCLDBGQUEwRjtZQUMxRmlCLGNBQWNBLFdBQVdDLEtBQUssSUFBSUQsV0FBV0MsS0FBSyxDQUFFO1lBRXBERixhQUFhLElBQUksQ0FBQ1Isb0JBQW9CO1FBQ3hDLE9BQ0ssSUFBSyxJQUFJLENBQUNGLHFCQUFxQixFQUFHO1lBQ3JDVyxjQUFjQSxXQUFXQyxLQUFLLElBQUlELFdBQVdDLEtBQUssQ0FBRTtZQUVwREYsYUFBYSxJQUFJLENBQUNQLHNCQUFzQjtRQUMxQyxPQUNLO1lBQ0hRLGNBQWNBLFdBQVdDLEtBQUssSUFBSUQsV0FBV0MsS0FBSyxDQUFFO1lBRXBERixhQUFhLElBQUksQ0FBQ04sa0JBQWtCLENBQUNTLE1BQU0sQ0FBRSxJQUFJLENBQUNSLGtCQUFrQjtRQUN0RTtRQUVBSyxhQUFhQSxXQUFXRyxNQUFNLENBQUUsSUFBSSxDQUFDTixnQkFBZ0I7UUFFckQsNkRBQTZEO1FBRTdELE9BQU9HO0lBQ1Q7SUFFQTs7Ozs7R0FLQyxHQUNEaEMsd0JBQXdCUCxhQUFhO1FBQ25DLElBQUksQ0FBQ1Esb0JBQW9CLENBQUVnQixRQUFRLE1BQU14QjtJQUMzQztJQUVBOzs7OztHQUtDLEdBQ0RjLDJCQUEyQmQsYUFBYTtRQUN0QyxJQUFJLENBQUNRLG9CQUFvQixDQUFFZ0IsUUFBUSxPQUFPeEI7SUFDNUM7SUFFQTs7Ozs7Ozs7O0dBU0MsR0FDRFEsc0JBQXNCbUMsT0FBTyxFQUFFQyxXQUFXLEVBQUU1QyxhQUFhO1FBQ3ZEQyxVQUFVQSxPQUFRLE9BQU8yQyxnQkFBZ0I7UUFDekMzQyxVQUFVQSxPQUFRLE9BQU9ELGtCQUFrQixhQUFhQSxrQkFBa0I7UUFFMUUsTUFBTTZDLFlBQVlGLFlBQVluQjtRQUM5QnZCLFVBQVVBLE9BQVEsQ0FBQzRDLGFBQWEsQUFBRSxJQUFJLENBQUN4Qix5QkFBeUIsR0FBRyxNQUFRLENBQUN1QixhQUMxRTtRQUVGLE1BQU1FLFFBQVFGLGNBQWMsSUFBSSxDQUFDO1FBQ2pDLElBQUtDLFdBQVk7WUFDZixJQUFJLENBQUN4Qix5QkFBeUIsSUFBSXlCO1FBQ3BDLE9BQ0s7WUFDSCxJQUFJLENBQUN4QiwwQkFBMEIsSUFBSXdCO1FBQ3JDO1FBQ0E3QyxVQUFVQSxPQUFRLElBQUksQ0FBQ29CLHlCQUF5QixLQUFLLEtBQUssSUFBSSxDQUFDQywwQkFBMEIsS0FBSyxHQUM1RjtRQUVGLE1BQU15QixTQUFTSCxjQUFjLHFCQUFxQjtRQUVsRCxtQkFBbUI7UUFDbkIsTUFBTUwsYUFBYSxJQUFJLENBQUNELG9CQUFvQjtRQUU1QyxJQUFNLElBQUlVLElBQUksR0FBR0EsSUFBSVQsV0FBV2pDLE1BQU0sRUFBRTBDLElBQU07WUFDNUMsTUFBTUMsT0FBT1YsVUFBVSxDQUFFUyxFQUFHO1lBRTVCLHlHQUF5RztZQUN6Ryw2REFBNkQ7WUFDN0QsSUFBS0gsV0FBWTtnQkFDZix3Q0FBd0M7Z0JBQ3hDLDJJQUEySTtnQkFDM0lLLFFBQVEsQ0FBRUgsT0FBUSxDQUFFRSxNQUFNekQsTUFBTUUsY0FBY2tCLGVBQWUsQ0FBRVosZUFBZTtZQUNoRjtZQUVBLE1BQU1tRCxXQUFXLElBQUksQ0FBRSxDQUFDLEVBQUUsRUFBRUYsTUFBTSxDQUFFO1lBQ3BDaEQsVUFBVUEsT0FBUSxDQUFDLENBQUNrRDtZQUVwQix3Q0FBd0M7WUFDeEMsMklBQTJJO1lBQzNJUixPQUFPLENBQUVJLE9BQVEsQ0FBRUUsTUFBTUUsVUFBVXpELGNBQWNrQixlQUFlLENBQUVaLGVBQWU7UUFDbkY7SUFDRjtJQUVBOzs7Ozs7Ozs7OztHQVdDLEdBQ0RvRCxrQkFBa0JDLFlBQVksRUFBRUMsU0FBUyxFQUFFQyxpQkFBaUIsRUFBRUMsZ0JBQWdCO1FBQzVFLDRHQUE0RztRQUM1Ryw0R0FBNEc7UUFDNUcsNEJBQTRCO1FBQzVCLElBQU0sSUFBSVIsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQzVDLGdCQUFnQixDQUFDRSxNQUFNLEVBQUUwQyxJQUFNO1lBQ3ZELE1BQU1sRCxVQUFVLElBQUksQ0FBQ00sZ0JBQWdCLENBQUU0QyxFQUFHO1lBQzFDLE1BQU1TLFFBQVEzRCxRQUFRNEQsTUFBTTtZQUU1QixJQUFLLENBQUNoRSxjQUFjQyxtQkFBbUIsSUFBTTRELHNCQUFzQixhQUFhQSxzQkFBc0IsWUFBZTtnQkFDbkhFLE1BQU1FLFVBQVUsQ0FBRU4sY0FBY0MsV0FBV0csS0FBSyxDQUFFRixrQkFBbUIsRUFBRUM7WUFDekU7UUFDRjtJQUNGO0lBRUE7Ozs7O0dBS0MsR0FDREksZUFBZSxTQUFTQSxjQUFlQyxRQUFRO1FBQzdDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsc0RBQXNEO1FBQ3RELE1BQU1nRCxlQUFlLElBQUluRSxhQUFjMkU7UUFFdkMsSUFBS0EsU0FBU0UsV0FBVyxLQUFLLFNBQVU7WUFDdEM5RSxRQUFRK0Usa0JBQWtCLENBQUNDLElBQUk7UUFDakM7UUFFQSxrRkFBa0Y7UUFDbEZ2RSxjQUFjMEQsZ0JBQWdCLENBQUVDLGNBQWNyRSxvQkFBb0JrRixZQUFZLEVBQUUsZUFBZTtRQUUvRjFCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0RDLGFBQWEsU0FBU0EsWUFBYVAsUUFBUTtRQUN6Q3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELHNEQUFzRDtRQUN0RCxNQUFNZ0QsZUFBZSxJQUFJbkUsYUFBYzJFO1FBRXZDNUUsUUFBUStFLGtCQUFrQixDQUFDQyxJQUFJO1FBRS9CLGtGQUFrRjtRQUNsRnZFLGNBQWMwRCxnQkFBZ0IsQ0FBRUMsY0FBY3JFLG9CQUFvQmtGLFlBQVksRUFBRSxhQUFhO1FBRTdGMUIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDREUsZUFBZSxTQUFTQSxjQUFlUixRQUFRO1FBQzdDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9Ca0YsWUFBWSxFQUFFLGVBQWU7UUFFL0cxQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNERyxlQUFlLFNBQVNBLGNBQWVULFFBQVE7UUFDN0NyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JrRixZQUFZLEVBQUUsZUFBZTtRQUUvRzFCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0RJLGNBQWMsU0FBU0EsYUFBY1YsUUFBUTtRQUMzQ3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQmtGLFlBQVksRUFBRSxjQUFjO1FBRTlHMUIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDREssaUJBQWlCLFNBQVNBLGdCQUFpQlgsUUFBUTtRQUNqRHJCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQmtGLFlBQVksRUFBRSxpQkFBaUI7UUFFakgxQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNETSxxQkFBcUIsU0FBU0Esb0JBQXFCWixRQUFRO1FBQ3pEckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9Ca0YsWUFBWSxFQUFFLHFCQUFxQjtRQUVySDFCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0RPLHNCQUFzQixTQUFTQSxxQkFBc0JiLFFBQVE7UUFDM0RyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JrRixZQUFZLEVBQUUsc0JBQXNCO1FBRXRIMUIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRFEsaUJBQWlCLFNBQVNBLGdCQUFpQmQsUUFBUTtRQUNqRHJCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQjRGLGVBQWUsRUFBRSxlQUFlO1FBRWxIcEMsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRFUsZUFBZSxTQUFTQSxjQUFlaEIsUUFBUTtRQUM3Q3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQjRGLGVBQWUsRUFBRSxhQUFhO1FBRWhIcEMsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRFcsaUJBQWlCLFNBQVNBLGdCQUFpQmpCLFFBQVE7UUFDakRyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0I0RixlQUFlLEVBQUUsZUFBZTtRQUVsSHBDLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0RZLGlCQUFpQixTQUFTQSxnQkFBaUJsQixRQUFRO1FBQ2pEckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CNEYsZUFBZSxFQUFFLGVBQWU7UUFFbEhwQyxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEYSxnQkFBZ0IsU0FBU0EsZUFBZ0JuQixRQUFRO1FBQy9DckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CNEYsZUFBZSxFQUFFLGNBQWM7UUFFakhwQyxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEYyxtQkFBbUIsU0FBU0Esa0JBQW1CcEIsUUFBUTtRQUNyRHJCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQjRGLGVBQWUsRUFBRSxpQkFBaUI7UUFFcEhwQyxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEZSxjQUFjLFNBQVNBLGFBQWNyQixRQUFRO1FBQzNDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CbUcsVUFBVSxFQUFFLGNBQWM7UUFFNUczQyxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEaUIsWUFBWSxTQUFTQSxXQUFZdkIsUUFBUTtRQUN2Q3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELHNEQUFzRDtRQUN0RCxNQUFNZ0QsZUFBZSxJQUFJbkUsYUFBYzJFO1FBRXZDNUUsUUFBUStFLGtCQUFrQixDQUFDQyxJQUFJO1FBRS9CLGtGQUFrRjtRQUNsRnZFLGNBQWMwRCxnQkFBZ0IsQ0FBRUMsY0FBY3JFLG9CQUFvQm1HLFVBQVUsRUFBRSxZQUFZO1FBRTFGM0MsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRGtCLGFBQWEsU0FBU0EsWUFBYXhCLFFBQVE7UUFDekNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JtRyxVQUFVLEVBQUUsYUFBYTtRQUUzRzNDLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0RtQixlQUFlLFNBQVNBLGNBQWV6QixRQUFRO1FBQzdDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CbUcsVUFBVSxFQUFFLGVBQWU7UUFFN0czQyxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEb0IsYUFBYSxTQUFTQSxZQUFhMUIsUUFBUTtRQUN6Q3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELHNEQUFzRDtRQUN0RCxNQUFNZ0QsZUFBZSxJQUFJbkUsYUFBYzJFO1FBRXZDNUUsUUFBUStFLGtCQUFrQixDQUFDQyxJQUFJO1FBRS9CLGtGQUFrRjtRQUNsRnZFLGNBQWMwRCxnQkFBZ0IsQ0FBRUMsY0FBY3JFLG9CQUFvQndHLFVBQVUsRUFBRSxhQUFhO1FBRTNGaEQsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRHNCLFdBQVcsU0FBU0EsVUFBVzVCLFFBQVE7UUFDckNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxzREFBc0Q7UUFDdEQsTUFBTWdELGVBQWUsSUFBSW5FLGFBQWMyRTtRQUV2QzVFLFFBQVErRSxrQkFBa0IsQ0FBQ0MsSUFBSTtRQUUvQixrRkFBa0Y7UUFDbEZ2RSxjQUFjMEQsZ0JBQWdCLENBQUVDLGNBQWNyRSxvQkFBb0J3RyxVQUFVLEVBQUUsV0FBVztRQUV6RmhELGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0R1QixhQUFhLFNBQVNBLFlBQWE3QixRQUFRO1FBQ3pDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9Cd0csVUFBVSxFQUFFLGFBQWE7UUFFM0doRCxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTs7Ozs7R0FLQyxHQUNEd0IsYUFBYSxTQUFTQSxZQUFhOUIsUUFBUTtRQUN6Q3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQndHLFVBQVUsRUFBRSxhQUFhO1FBRTNHaEQsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE7Ozs7O0dBS0MsR0FDRHlCLFlBQVksU0FBU0EsV0FBWS9CLFFBQVE7UUFDdkNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0J3RyxVQUFVLEVBQUUsWUFBWTtRQUUxR2hELGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBOzs7OztHQUtDLEdBQ0R4RCxTQUFTLFNBQVNBLFFBQVNrRCxRQUFRO1FBQ2pDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CNkcsVUFBVSxFQUFFLFNBQVM7UUFFdkdyRCxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQTJCLFdBQVcsU0FBU0EsVUFBV2pDLFFBQVE7UUFDckNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFFbEZYLGNBQWNFLHNCQUFzQixHQUFHO1FBRXZDLHdGQUF3RjtRQUN4Riw2Q0FBNkM7UUFDN0NSLGFBQWEyRyx3QkFBd0IsQ0FBRXJHLGNBQWNVLGdCQUFnQixFQUFFeUQsVUFBVTtRQUVqRm5FLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JnSCxRQUFRLEVBQUUsV0FBVztRQUV2R3RHLGNBQWNFLHNCQUFzQixHQUFHO1FBRXZDNEMsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUE4QixZQUFZLFNBQVNBLFdBQVlwQyxRQUFRO1FBQ3ZDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBRWxGWCxjQUFjRSxzQkFBc0IsR0FBRztRQUV2Qyx3RkFBd0Y7UUFDeEZSLGFBQWEyRyx3QkFBd0IsQ0FBRXJHLGNBQWNVLGdCQUFnQixFQUFFeUQsVUFBVTtRQUVqRm5FLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JnSCxRQUFRLEVBQUUsWUFBWTtRQUV4R3RHLGNBQWNFLHNCQUFzQixHQUFHO1FBRXZDNEMsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUErQixTQUFTLFNBQVNBLFFBQVNyQyxRQUFRO1FBQ2pDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBRWxGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CZ0gsUUFBUSxFQUFFLFNBQVM7UUFFckd4RCxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQWdDLFVBQVUsU0FBU0EsU0FBVXRDLFFBQVE7UUFDbkNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JnSCxRQUFRLEVBQUUsVUFBVTtRQUV0R3hELGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtJQUVBaUMsU0FBUyxTQUFTQSxRQUFTdkMsUUFBUTtRQUNqQ3JCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXc0IsT0FBTyxDQUFFO1FBQ3hEdEIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVduQyxJQUFJO1FBRW5ELGtGQUFrRjtRQUNsRlgsY0FBYzBELGdCQUFnQixDQUFFLElBQUlsRSxhQUFjMkUsV0FBWTdFLG9CQUFvQmdILFFBQVEsRUFBRSxTQUFTO1FBRXJHeEQsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVcyQixHQUFHO0lBQ3BEO0lBRUFrQyxXQUFXLFNBQVNBLFVBQVd4QyxRQUFRO1FBQ3JDckIsY0FBY0EsV0FBV3NCLE9BQU8sSUFBSXRCLFdBQVdzQixPQUFPLENBQUU7UUFDeER0QixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV25DLElBQUk7UUFFbkQsa0ZBQWtGO1FBQ2xGWCxjQUFjMEQsZ0JBQWdCLENBQUUsSUFBSWxFLGFBQWMyRSxXQUFZN0Usb0JBQW9CZ0gsUUFBUSxFQUFFLFdBQVc7UUFFdkd4RCxjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBVzJCLEdBQUc7SUFDcEQ7SUFFQW1DLFNBQVMsU0FBU0EsUUFBU3pDLFFBQVE7UUFDakNyQixjQUFjQSxXQUFXc0IsT0FBTyxJQUFJdEIsV0FBV3NCLE9BQU8sQ0FBRTtRQUN4RHRCLGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXbkMsSUFBSTtRQUVuRCxrRkFBa0Y7UUFDbEZYLGNBQWMwRCxnQkFBZ0IsQ0FBRSxJQUFJbEUsYUFBYzJFLFdBQVk3RSxvQkFBb0JnSCxRQUFRLEVBQUUsU0FBUztRQUVyR3hELGNBQWNBLFdBQVdzQixPQUFPLElBQUl0QixXQUFXMkIsR0FBRztJQUNwRDtBQUNGO0FBRUE1RSxRQUFRZ0gsUUFBUSxDQUFFLGlCQUFpQjdHO0FBRW5DLGVBQWVBLGNBQWMifQ==