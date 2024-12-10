// Copyright 2018-2024, University of Colorado Boulder
/**
 * A type that will manage the state of the keyboard. This will track which keys are being held down and for how long.
 * It also offers convenience methods to determine whether or not specific keys are down like shift or enter using
 * KeyboardUtils' key schema.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow
 */ import Emitter from '../../../axon/js/Emitter.js';
import stepTimer from '../../../axon/js/stepTimer.js';
import platform from '../../../phet-core/js/platform.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioAction from '../../../tandem/js/PhetioAction.js';
import { EnglishStringToCodeMap, eventCodeToEnglishString, EventIO, KeyboardUtils, scenery } from '../imports.js';
let KeyStateTracker = class KeyStateTracker {
    /**
   * Implements keyboard dragging when listener is attached to the Node, public so listener is attached
   * with addInputListener(). Only updated when enabled.
   *
   * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
   * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
   * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
   */ keydownUpdate(domEvent) {
        this.enabled && this.keydownUpdateAction.execute(domEvent);
    }
    /**
   * Modifier keys might be part of the domEvent but the browser may or may not have received a keydown/keyup event
   * with specifically for the modifier key. This will add or remove modifier keys in that case.
   */ correctModifierKeys(domEvent) {
        const key = KeyboardUtils.getEventCode(domEvent);
        assert && assert(key, 'key not found from domEvent');
        let changed = false;
        // add modifier keys if they aren't down
        if (domEvent.shiftKey && !KeyboardUtils.isShiftKey(domEvent) && !this.shiftKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils.KEY_SHIFT_LEFT];
            this.keyState[KeyboardUtils.KEY_SHIFT_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.altKey && !KeyboardUtils.isAltKey(domEvent) && !this.altKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils.KEY_ALT_LEFT];
            this.keyState[KeyboardUtils.KEY_ALT_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.ctrlKey && !KeyboardUtils.isControlKey(domEvent) && !this.ctrlKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils.KEY_CONTROL_LEFT];
            this.keyState[KeyboardUtils.KEY_CONTROL_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.metaKey && !KeyboardUtils.isMetaKey(domEvent) && !this.metaKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils.KEY_META_LEFT];
            this.keyState[KeyboardUtils.KEY_META_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        // delete modifier keys if we think they are down
        if (!domEvent.shiftKey && this.shiftKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils.KEY_SHIFT_LEFT] || !!this.keyState[KeyboardUtils.KEY_SHIFT_RIGHT];
            delete this.keyState[KeyboardUtils.KEY_SHIFT_LEFT];
            delete this.keyState[KeyboardUtils.KEY_SHIFT_RIGHT];
        }
        if (!domEvent.altKey && this.altKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils.KEY_ALT_LEFT] || !!this.keyState[KeyboardUtils.KEY_ALT_RIGHT];
            delete this.keyState[KeyboardUtils.KEY_ALT_LEFT];
            delete this.keyState[KeyboardUtils.KEY_ALT_RIGHT];
        }
        if (!domEvent.ctrlKey && this.ctrlKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils.KEY_CONTROL_LEFT] || !!this.keyState[KeyboardUtils.KEY_CONTROL_RIGHT];
            delete this.keyState[KeyboardUtils.KEY_CONTROL_LEFT];
            delete this.keyState[KeyboardUtils.KEY_CONTROL_RIGHT];
        }
        if (!domEvent.metaKey && this.metaKeyDown) {
            changed = changed || KeyboardUtils.META_KEYS.some((key)=>!!this.keyState[key]);
            KeyboardUtils.META_KEYS.forEach((key)=>{
                delete this.keyState[key];
            });
        }
        if (changed) {
            this.keyDownStateChangedEmitter.emit(domEvent);
        }
    }
    /**
   * Behavior for keyboard 'up' DOM event. Public so it can be attached with addInputListener(). Only updated when
   * enabled.
   *
   * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
   * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
   * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
   */ keyupUpdate(domEvent) {
        this.enabled && this.keyupUpdateAction.execute(domEvent);
    }
    /**
   * Returns true if any of the movement keys are down (arrow keys or WASD keys).
   */ get movementKeysDown() {
        return this.isAnyKeyInListDown(KeyboardUtils.MOVEMENT_KEYS);
    }
    /**
   * Returns the KeyboardEvent.code from the last key down that updated the keystate.
   */ getLastKeyDown() {
        return this._lastKeyDown;
    }
    /**
   * Returns true if a key with the KeyboardEvent.code is currently down.
   */ isKeyDown(key) {
        return !!this.keyState[key];
    }
    /**
   * Returns true if the key with the KeyboardEvent.code is currently down.
   */ isEnglishKeyDown(key) {
        return this.isAnyKeyInListDown(EnglishStringToCodeMap[key]);
    }
    /**
   * Returns the set of keys that are currently down.
   *
   * NOTE: Always returns a new array, so a defensive copy is not needed.
   */ getKeysDown() {
        return Object.keys(this.keyState);
    }
    /**
   * Returns the set of EnglishKeys that are currently down.
   *
   * NOTE: Always returns a new Set, so a defensive copy is not needed.
   */ getEnglishKeysDown() {
        const englishKeySet = new Set();
        for (const key of this.getKeysDown()){
            const englishKey = eventCodeToEnglishString(key);
            if (englishKey) {
                englishKeySet.add(englishKey);
            }
        }
        return englishKeySet;
    }
    /**
   * Returns true if any of the keys in the list are currently down. Keys are the KeyboardEvent.code strings.
   */ isAnyKeyInListDown(keyList) {
        for(let i = 0; i < keyList.length; i++){
            if (this.isKeyDown(keyList[i])) {
                return true;
            }
        }
        return false;
    }
    /**
   * Returns true if ALL of the keys in the list are currently down. Values of the keyList array are the
   * KeyboardEvent.code for the keys you are interested in.
   */ areKeysDown(keyList) {
        const keysDown = true;
        for(let i = 0; i < keyList.length; i++){
            if (!this.isKeyDown(keyList[i])) {
                return false;
            }
        }
        return keysDown;
    }
    /**
   * Returns true if ALL keys in the list are down and ONLY the keys in the list are down. Values of keyList array
   * are the KeyboardEvent.code for keys you are interested in OR the KeyboardEvent.key in the special case of
   * modifier keys.
   *
   * (scenery-internal)
   */ areKeysExclusivelyDown(keyList) {
        const keyStateKeys = Object.keys(this.keyState);
        // quick sanity check for equality first
        if (keyStateKeys.length !== keyList.length) {
            return false;
        }
        // Now make sure that every key in the list is in the keyState
        let onlyKeyListDown = true;
        for(let i = 0; i < keyList.length; i++){
            const initialKey = keyList[i];
            let keysToCheck = [
                initialKey
            ];
            // If a modifier key, need to look for the equivalent pair of left/right KeyboardEvent.codes in the list
            // because KeyStateTracker works exclusively with codes.
            if (KeyboardUtils.isModifierKey(initialKey)) {
                keysToCheck = KeyboardUtils.MODIFIER_KEY_TO_CODE_MAP.get(initialKey);
            }
            if (_.intersection(keyStateKeys, keysToCheck).length === 0) {
                onlyKeyListDown = false;
            }
        }
        return onlyKeyListDown;
    }
    /**
   * Returns true if every key in the list is down but no other modifier keys are down, unless
   * the modifier key is in the list. For example
   * areKeysDownWithoutModifiers( [ 'ShiftLeft', 'ArrowLeft' ] ) -> true if left shift and left arrow keys are down.
   * areKeysDownWithoutModifiers( [ 'ShiftLeft', 'ArrowLeft' ] ) -> true if left shift, left arrow, and J keys are down.
   * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> false if left shift and arrow left keys are down.
   * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> true if the left arrow key is down.
   * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> true if the left arrow and R keys are down.
   *
   * This is important for determining when keyboard events should fire listeners. Say you have two KeyboardListeners -
   * One fires from key 'c' and another fires from 'shift-c'. If the user presses 'shift-c', you do NOT want both to
   * fire.
   *
   * @param keyList - List of KeyboardEvent.code strings for keys you are interested in.
   */ areKeysDownWithoutExtraModifiers(keyList) {
        // If any modifier keys are down that are not in the keyList, return false
        for(let i = 0; i < KeyboardUtils.MODIFIER_KEY_CODES.length; i++){
            const modifierKey = KeyboardUtils.MODIFIER_KEY_CODES[i];
            if (this.isKeyDown(modifierKey) && !keyList.includes(modifierKey)) {
                return false;
            }
        }
        // Modifier state seems OK so return true if all keys in the list are down
        return this.areKeysDown(keyList);
    }
    /**
   * Returns true if any keys are down according to teh keyState.
   */ keysAreDown() {
        return Object.keys(this.keyState).length > 0;
    }
    /**
   * Returns true if the "Enter" key is currently down.
   */ get enterKeyDown() {
        return this.isKeyDown(KeyboardUtils.KEY_ENTER);
    }
    /**
   * Returns true if the shift key is currently down.
   */ get shiftKeyDown() {
        return this.isAnyKeyInListDown(KeyboardUtils.SHIFT_KEYS);
    }
    /**
   * Returns true if the alt key is currently down.
   */ get altKeyDown() {
        return this.isAnyKeyInListDown(KeyboardUtils.ALT_KEYS);
    }
    /**
   * Returns true if the control key is currently down.
   */ get ctrlKeyDown() {
        return this.isAnyKeyInListDown(KeyboardUtils.CONTROL_KEYS);
    }
    /**
   * Returns true if one of the meta keys is currently down.
   */ get metaKeyDown() {
        return this.isAnyKeyInListDown(KeyboardUtils.META_KEYS);
    }
    /**
   * Returns the amount of time that the provided key has been held down. Error if the key is not currently down.
   * @param key - KeyboardEvent.code for the key you are inspecting.
   */ timeDownForKey(key) {
        assert && assert(this.isKeyDown(key), 'cannot get timeDown on a key that is not pressed down');
        return this.keyState[key].timeDown;
    }
    /**
   * Clear the entire state of the key tracker, basically restarting the tracker.
   */ clearState(skipNotify) {
        this.keyState = {};
        if (!skipNotify) {
            this.keyDownStateChangedEmitter.emit(null);
        }
    }
    /**
   * Step function for the tracker. JavaScript does not natively handle multiple keydown events at once,
   * so we need to track the state of the keyboard in an Object and manage dragging in this function.
   * In order for the drag handler to work.
   *
   * @param dt - time in seconds that has passed since the last update
   */ step(dt) {
        // no-op unless a key is down
        if (this.keysAreDown()) {
            const ms = dt * 1000;
            // for each key that is still down, increment the tracked time that has been down
            for(const i in this.keyState){
                if (this.keyState[i]) {
                    this.keyState[i].timeDown += ms;
                }
            }
        }
    }
    /**
   * Add this KeyStateTracker to the window so that it updates whenever the document receives key events. This is
   * useful if you want to observe key presses while DOM focus not within the PDOM root.
   */ attachToWindow() {
        assert && assert(!this.attachedToDocument, 'KeyStateTracker is already attached to document.');
        this.documentKeydownListener = (event)=>{
            this.keydownUpdate(event);
        };
        this.documentKeyupListener = (event)=>{
            this.keyupUpdate(event);
        };
        this.documentBlurListener = (event)=>{
            // As recommended for similar situations online, we clear our key state when we get a window blur, since we
            // will not be able to track any key state changes during this time (and users will likely release any keys
            // that are pressed).
            // If shift/alt/ctrl are pressed when we regain focus, we will hopefully get a keyboard event and update their state
            // with correctModifierKeys().
            this.clearState();
        };
        const addListenersToDocument = ()=>{
            // attach with useCapture so that the keyStateTracker is updated before the events dispatch within Scenery
            window.addEventListener('keyup', this.documentKeyupListener, {
                capture: true
            });
            window.addEventListener('keydown', this.documentKeydownListener, {
                capture: true
            });
            window.addEventListener('blur', this.documentBlurListener, {
                capture: true
            });
            this.attachedToDocument = true;
        };
        if (!document) {
            // attach listeners on window load to ensure that the document is defined
            const loadListener = ()=>{
                addListenersToDocument();
                window.removeEventListener('load', loadListener);
            };
            window.addEventListener('load', loadListener);
        } else {
            // document is defined and we won't get another load event so attach right away
            addListenersToDocument();
        }
    }
    /**
   * The KeyState is cleared when the tracker is disabled.
   */ setEnabled(enabled) {
        if (this._enabled !== enabled) {
            this._enabled = enabled;
            // clear state when disabled
            !enabled && this.clearState();
        }
    }
    set enabled(enabled) {
        this.setEnabled(enabled);
    }
    get enabled() {
        return this.isEnabled();
    }
    isEnabled() {
        return this._enabled;
    }
    /**
   * Detach listeners from the document that would update the state of this KeyStateTracker on key presses.
   */ detachFromDocument() {
        assert && assert(this.attachedToDocument, 'KeyStateTracker is not attached to window.');
        assert && assert(this.documentKeyupListener, 'keyup listener was not created or attached to window');
        assert && assert(this.documentKeydownListener, 'keydown listener was not created or attached to window.');
        assert && assert(this.documentBlurListener, 'blur listener was not created or attached to window.');
        window.removeEventListener('keyup', this.documentKeyupListener);
        window.removeEventListener('keydown', this.documentKeydownListener);
        window.removeEventListener('blur', this.documentBlurListener);
        this.documentKeyupListener = null;
        this.documentKeydownListener = null;
        this.documentBlurListener = null;
        this.attachedToDocument = false;
    }
    dispose() {
        this.disposeKeyStateTracker();
    }
    constructor(options){
        var _options_tandem, _options_tandem1;
        // Contains info about which keys are currently pressed for how long. JavaScript doesn't handle multiple key presses,
        // with events so we have to update this object ourselves.
        this.keyState = {};
        // The KeyboardEvent.code of the last key that was pressed down when updating the key state.
        this._lastKeyDown = null;
        // Whether this KeyStateTracker is attached to the document and listening for events.
        this.attachedToDocument = false;
        // Listeners potentially attached to the document to update the state of this KeyStateTracker, see attachToWindow()
        this.documentKeyupListener = null;
        this.documentKeydownListener = null;
        this.documentBlurListener = null;
        // If the KeyStateTracker is enabled. If disabled, keyState is cleared and listeners noop.
        this._enabled = true;
        // Emits events when keyup/keydown updates are received. These will emit after any updates to the
        // keyState so that keyState is correct in time for listeners. Note the valueType is a native KeyboardEvent event.
        this.keydownEmitter = new Emitter({
            parameters: [
                {
                    valueType: KeyboardEvent
                }
            ]
        });
        this.keyupEmitter = new Emitter({
            parameters: [
                {
                    valueType: KeyboardEvent
                }
            ]
        });
        // Emits when any key "down" state changes. This is useful for when you want to know if any key is down or up.
        // Does NOT change for timeDown changes. DOES fire if the browser sends fire-on-hold down.
        this.keyDownStateChangedEmitter = new Emitter({
            parameters: [
                {
                    valueType: [
                        KeyboardEvent,
                        null
                    ]
                }
            ]
        });
        this.keydownUpdateAction = new PhetioAction((domEvent)=>{
            // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
            const key = KeyboardUtils.getEventCode(domEvent);
            if (key) {
                // The dom event might have a modifier key that we weren't able to catch, if that is the case update the keyState.
                // This is likely to happen when pressing browser key commands like "ctrl + tab" to switch tabs.
                this.correctModifierKeys(domEvent);
                if (assert && !KeyboardUtils.isShiftKey(domEvent)) {
                    assert(domEvent.shiftKey === this.shiftKeyDown, 'shift key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils.isAltKey(domEvent)) {
                    assert(domEvent.altKey === this.altKeyDown, 'alt key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils.isControlKey(domEvent)) {
                    assert(domEvent.ctrlKey === this.ctrlKeyDown, 'ctrl key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils.isMetaKey(domEvent)) {
                    assert(domEvent.metaKey === this.metaKeyDown, 'meta key inconsistency between event and keyState.');
                }
                // if the key is already down, don't do anything else (we don't want to create a new keyState object
                // for a key that is already being tracked and down)
                if (!this.isKeyDown(key)) {
                    const key = KeyboardUtils.getEventCode(domEvent);
                    assert && assert(key, 'Could not find key from domEvent');
                    this.keyState[key] = {
                        key: key,
                        timeDown: 0 // in ms
                    };
                }
                this._lastKeyDown = key;
                // keydown update received, notify listeners
                this.keydownEmitter.emit(domEvent);
                this.keyDownStateChangedEmitter.emit(domEvent);
            }
        }, {
            phetioPlayback: true,
            tandem: options == null ? void 0 : (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('keydownUpdateAction'),
            parameters: [
                {
                    name: 'event',
                    phetioType: EventIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Action that executes whenever a keydown occurs from the input listeners this keyStateTracker adds (most likely to the document).'
        });
        this.keyupUpdateAction = new PhetioAction((domEvent)=>{
            // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
            const key = KeyboardUtils.getEventCode(domEvent);
            if (key) {
                // correct keyState in case browser didn't receive keydown/keyup events for a modifier key
                this.correctModifierKeys(domEvent);
                // Remove this key data from the state - There are many cases where we might receive a keyup before keydown like
                // on first tab into scenery Display or when using specific operating system keys with the browser or PrtScn so
                // an assertion for this is too strict. See https://github.com/phetsims/scenery/issues/918
                if (this.isKeyDown(key)) {
                    delete this.keyState[key];
                }
                // On MacOS, we will not get key keyup events while a meta key is pressed. So the keystate will be inaccurate
                // until the meta keys are released. If both meta keys are pressed, We just We will not get a keyup event until
                // BOTH keys are released, so this should be safe in that case.
                // See https://github.com/phetsims/scenery/issues/1555
                if (platform.mac && KeyboardUtils.isMetaKey(domEvent)) {
                    // Skip notification, since we will emit on the state change below
                    this.clearState(true);
                }
                // keyup event received, notify listeners
                this.keyupEmitter.emit(domEvent);
                this.keyDownStateChangedEmitter.emit(domEvent);
            }
        }, {
            phetioPlayback: true,
            tandem: options == null ? void 0 : (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('keyupUpdateAction'),
            parameters: [
                {
                    name: 'event',
                    phetioType: EventIO
                }
            ],
            phetioEventType: EventType.USER,
            phetioDocumentation: 'Action that executes whenever a keyup occurs from the input listeners this keyStateTracker adds (most likely to the document).'
        });
        const stepListener = this.step.bind(this);
        stepTimer.addListener(stepListener);
        this.disposeKeyStateTracker = ()=>{
            stepTimer.removeListener(stepListener);
            if (this.attachedToDocument) {
                this.detachFromDocument();
            }
        };
    }
};
scenery.register('KeyStateTracker', KeyStateTracker);
export default KeyStateTracker;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9LZXlTdGF0ZVRyYWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0eXBlIHRoYXQgd2lsbCBtYW5hZ2UgdGhlIHN0YXRlIG9mIHRoZSBrZXlib2FyZC4gVGhpcyB3aWxsIHRyYWNrIHdoaWNoIGtleXMgYXJlIGJlaW5nIGhlbGQgZG93biBhbmQgZm9yIGhvdyBsb25nLlxuICogSXQgYWxzbyBvZmZlcnMgY29udmVuaWVuY2UgbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBvciBub3Qgc3BlY2lmaWMga2V5cyBhcmUgZG93biBsaWtlIHNoaWZ0IG9yIGVudGVyIHVzaW5nXG4gKiBLZXlib2FyZFV0aWxzJyBrZXkgc2NoZW1hLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvd1xuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgUGhldGlvQWN0aW9uIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24uanMnO1xuaW1wb3J0IHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IHsgRW5nbGlzaEtleSwgRW5nbGlzaEtleVN0cmluZywgRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCwgZXZlbnRDb2RlVG9FbmdsaXNoU3RyaW5nLCBFdmVudElPLCBLZXlib2FyZFV0aWxzLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFR5cGUgZGVzY3JpYmluZyB0aGUgc3RhdGUgb2YgYSBzaW5nbGUga2V5IGluIHRoZSBLZXlTdGF0ZS5cbnR5cGUgS2V5U3RhdGVJbmZvID0ge1xuXG4gIC8vIFRoZSBldmVudC5jb2RlIHN0cmluZyBmb3IgdGhlIGtleS5cbiAga2V5OiBzdHJpbmc7XG5cbiAgLy8gSG93IGxvbmcgaGFzIHRoZSBrZXkgYmVlbiBoZWxkIGRvd24sIGluIG1pbGxpc2Vjb25kc1xuICB0aW1lRG93bjogbnVtYmVyO1xufTtcblxuLy8gVGhlIHR5cGUgZm9yIHRoZSBrZXlTdGF0ZSBPYmplY3QsIGtleXMgYXJlIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgZm9yIHRoZSBwcmVzc2VkIGtleS5cbnR5cGUgS2V5U3RhdGUgPSBSZWNvcmQ8c3RyaW5nLCBLZXlTdGF0ZUluZm8+O1xuXG5leHBvcnQgdHlwZSBLZXlTdGF0ZVRyYWNrZXJPcHRpb25zID0gUGlja09wdGlvbmFsPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcblxuY2xhc3MgS2V5U3RhdGVUcmFja2VyIHtcblxuICAvLyBDb250YWlucyBpbmZvIGFib3V0IHdoaWNoIGtleXMgYXJlIGN1cnJlbnRseSBwcmVzc2VkIGZvciBob3cgbG9uZy4gSmF2YVNjcmlwdCBkb2Vzbid0IGhhbmRsZSBtdWx0aXBsZSBrZXkgcHJlc3NlcyxcbiAgLy8gd2l0aCBldmVudHMgc28gd2UgaGF2ZSB0byB1cGRhdGUgdGhpcyBvYmplY3Qgb3Vyc2VsdmVzLlxuICBwcml2YXRlIGtleVN0YXRlOiBLZXlTdGF0ZSA9IHt9O1xuXG4gIC8vIFRoZSBLZXlib2FyZEV2ZW50LmNvZGUgb2YgdGhlIGxhc3Qga2V5IHRoYXQgd2FzIHByZXNzZWQgZG93biB3aGVuIHVwZGF0aW5nIHRoZSBrZXkgc3RhdGUuXG4gIHByaXZhdGUgX2xhc3RLZXlEb3duOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvLyBXaGV0aGVyIHRoaXMgS2V5U3RhdGVUcmFja2VyIGlzIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgbGlzdGVuaW5nIGZvciBldmVudHMuXG4gIHByaXZhdGUgYXR0YWNoZWRUb0RvY3VtZW50ID0gZmFsc2U7XG5cbiAgLy8gTGlzdGVuZXJzIHBvdGVudGlhbGx5IGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCB0byB1cGRhdGUgdGhlIHN0YXRlIG9mIHRoaXMgS2V5U3RhdGVUcmFja2VyLCBzZWUgYXR0YWNoVG9XaW5kb3coKVxuICBwcml2YXRlIGRvY3VtZW50S2V5dXBMaXN0ZW5lcjogbnVsbCB8ICggKCBldmVudDogS2V5Ym9hcmRFdmVudCApID0+IHZvaWQgKSA9IG51bGw7XG4gIHByaXZhdGUgZG9jdW1lbnRLZXlkb3duTGlzdGVuZXI6IG51bGwgfCAoICggZXZlbnQ6IEtleWJvYXJkRXZlbnQgKSA9PiB2b2lkICkgPSBudWxsO1xuICBwcml2YXRlIGRvY3VtZW50Qmx1ckxpc3RlbmVyOiBudWxsIHwgKCAoIGV2ZW50OiBGb2N1c0V2ZW50ICkgPT4gdm9pZCApID0gbnVsbDtcblxuICAvLyBJZiB0aGUgS2V5U3RhdGVUcmFja2VyIGlzIGVuYWJsZWQuIElmIGRpc2FibGVkLCBrZXlTdGF0ZSBpcyBjbGVhcmVkIGFuZCBsaXN0ZW5lcnMgbm9vcC5cbiAgcHJpdmF0ZSBfZW5hYmxlZCA9IHRydWU7XG5cbiAgLy8gRW1pdHMgZXZlbnRzIHdoZW4ga2V5dXAva2V5ZG93biB1cGRhdGVzIGFyZSByZWNlaXZlZC4gVGhlc2Ugd2lsbCBlbWl0IGFmdGVyIGFueSB1cGRhdGVzIHRvIHRoZVxuICAvLyBrZXlTdGF0ZSBzbyB0aGF0IGtleVN0YXRlIGlzIGNvcnJlY3QgaW4gdGltZSBmb3IgbGlzdGVuZXJzLiBOb3RlIHRoZSB2YWx1ZVR5cGUgaXMgYSBuYXRpdmUgS2V5Ym9hcmRFdmVudCBldmVudC5cbiAgcHVibGljIHJlYWRvbmx5IGtleWRvd25FbWl0dGVyOiBURW1pdHRlcjxbIEtleWJvYXJkRXZlbnQgXT4gPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBLZXlib2FyZEV2ZW50IH0gXSB9ICk7XG4gIHB1YmxpYyByZWFkb25seSBrZXl1cEVtaXR0ZXI6IFRFbWl0dGVyPFsgS2V5Ym9hcmRFdmVudCBdPiA9IG5ldyBFbWl0dGVyKCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6IEtleWJvYXJkRXZlbnQgfSBdIH0gKTtcblxuICAvLyBFbWl0cyB3aGVuIGFueSBrZXkgXCJkb3duXCIgc3RhdGUgY2hhbmdlcy4gVGhpcyBpcyB1c2VmdWwgZm9yIHdoZW4geW91IHdhbnQgdG8ga25vdyBpZiBhbnkga2V5IGlzIGRvd24gb3IgdXAuXG4gIC8vIERvZXMgTk9UIGNoYW5nZSBmb3IgdGltZURvd24gY2hhbmdlcy4gRE9FUyBmaXJlIGlmIHRoZSBicm93c2VyIHNlbmRzIGZpcmUtb24taG9sZCBkb3duLlxuICBwdWJsaWMgcmVhZG9ubHkga2V5RG93blN0YXRlQ2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgS2V5Ym9hcmRFdmVudCB8IG51bGwgXT4gPSBuZXcgRW1pdHRlciggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiBbIEtleWJvYXJkRXZlbnQsIG51bGwgXSB9IF0gfSApO1xuXG4gIC8vIEFjdGlvbiB3aGljaCB1cGRhdGVzIHRoZSBLZXlTdGF0ZVRyYWNrZXIsIHdoZW4gaXQgaXMgdGltZSB0byBkbyBzbyAtIHRoZSB1cGRhdGUgaXMgd3JhcHBlZCBieSBhbiBBY3Rpb24gc28gdGhhdFxuICAvLyB0aGUgS2V5U3RhdGVUcmFja2VyIHN0YXRlIGlzIGNhcHR1cmVkIGZvciBQaEVULWlPLlxuICBwdWJsaWMgcmVhZG9ubHkga2V5ZG93blVwZGF0ZUFjdGlvbjogUGhldGlvQWN0aW9uPFsgS2V5Ym9hcmRFdmVudCBdPjtcblxuICAvLyBBY3Rpb24gd2hpY2ggdXBkYXRlcyB0aGUgc3RhdGUgb2YgdGhlIEtleVN0YXRlVHJhY2tlciBvbiBrZXkgcmVsZWFzZS4gVGhpcyBpcyB3cmFwcGVkIGluIGFuIEFjdGlvbiBzbyB0aGF0IHN0YXRlXG4gIC8vIGlzIGNhcHR1cmVkIGZvciBQaEVULWlPLlxuICBwdWJsaWMgcmVhZG9ubHkga2V5dXBVcGRhdGVBY3Rpb246IFBoZXRpb0FjdGlvbjxbIEtleWJvYXJkRXZlbnQgXT47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlS2V5U3RhdGVUcmFja2VyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEtleVN0YXRlVHJhY2tlck9wdGlvbnMgKSB7XG5cbiAgICB0aGlzLmtleWRvd25VcGRhdGVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uKCBkb21FdmVudCA9PiB7XG5cbiAgICAgIC8vIE5vdCBhbGwga2V5cyBoYXZlIGEgY29kZSBmb3IgdGhlIGJyb3dzZXIgdG8gdXNlLCB3ZSBuZWVkIHRvIGJlIGdyYWNlZnVsIGFuZCBkbyBub3RoaW5nIGlmIHRoZXJlIGlzbid0IG9uZS5cbiAgICAgIGNvbnN0IGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBkb21FdmVudCApO1xuICAgICAgaWYgKCBrZXkgKSB7XG5cbiAgICAgICAgLy8gVGhlIGRvbSBldmVudCBtaWdodCBoYXZlIGEgbW9kaWZpZXIga2V5IHRoYXQgd2Ugd2VyZW4ndCBhYmxlIHRvIGNhdGNoLCBpZiB0aGF0IGlzIHRoZSBjYXNlIHVwZGF0ZSB0aGUga2V5U3RhdGUuXG4gICAgICAgIC8vIFRoaXMgaXMgbGlrZWx5IHRvIGhhcHBlbiB3aGVuIHByZXNzaW5nIGJyb3dzZXIga2V5IGNvbW1hbmRzIGxpa2UgXCJjdHJsICsgdGFiXCIgdG8gc3dpdGNoIHRhYnMuXG4gICAgICAgIHRoaXMuY29ycmVjdE1vZGlmaWVyS2V5cyggZG9tRXZlbnQgKTtcblxuICAgICAgICBpZiAoIGFzc2VydCAmJiAhS2V5Ym9hcmRVdGlscy5pc1NoaWZ0S2V5KCBkb21FdmVudCApICkge1xuICAgICAgICAgIGFzc2VydCggZG9tRXZlbnQuc2hpZnRLZXkgPT09IHRoaXMuc2hpZnRLZXlEb3duLCAnc2hpZnQga2V5IGluY29uc2lzdGVuY3kgYmV0d2VlbiBldmVudCBhbmQga2V5U3RhdGUuJyApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYXNzZXJ0ICYmICFLZXlib2FyZFV0aWxzLmlzQWx0S2V5KCBkb21FdmVudCApICkge1xuICAgICAgICAgIGFzc2VydCggZG9tRXZlbnQuYWx0S2V5ID09PSB0aGlzLmFsdEtleURvd24sICdhbHQga2V5IGluY29uc2lzdGVuY3kgYmV0d2VlbiBldmVudCBhbmQga2V5U3RhdGUuJyApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYXNzZXJ0ICYmICFLZXlib2FyZFV0aWxzLmlzQ29udHJvbEtleSggZG9tRXZlbnQgKSApIHtcbiAgICAgICAgICBhc3NlcnQoIGRvbUV2ZW50LmN0cmxLZXkgPT09IHRoaXMuY3RybEtleURvd24sICdjdHJsIGtleSBpbmNvbnNpc3RlbmN5IGJldHdlZW4gZXZlbnQgYW5kIGtleVN0YXRlLicgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGFzc2VydCAmJiAhS2V5Ym9hcmRVdGlscy5pc01ldGFLZXkoIGRvbUV2ZW50ICkgKSB7XG4gICAgICAgICAgYXNzZXJ0KCBkb21FdmVudC5tZXRhS2V5ID09PSB0aGlzLm1ldGFLZXlEb3duLCAnbWV0YSBrZXkgaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGV2ZW50IGFuZCBrZXlTdGF0ZS4nICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUga2V5IGlzIGFscmVhZHkgZG93biwgZG9uJ3QgZG8gYW55dGhpbmcgZWxzZSAod2UgZG9uJ3Qgd2FudCB0byBjcmVhdGUgYSBuZXcga2V5U3RhdGUgb2JqZWN0XG4gICAgICAgIC8vIGZvciBhIGtleSB0aGF0IGlzIGFscmVhZHkgYmVpbmcgdHJhY2tlZCBhbmQgZG93bilcbiAgICAgICAgaWYgKCAhdGhpcy5pc0tleURvd24oIGtleSApICkge1xuICAgICAgICAgIGNvbnN0IGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBkb21FdmVudCApITtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXksICdDb3VsZCBub3QgZmluZCBrZXkgZnJvbSBkb21FdmVudCcgKTtcbiAgICAgICAgICB0aGlzLmtleVN0YXRlWyBrZXkgXSA9IHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbGFzdEtleURvd24gPSBrZXk7XG5cbiAgICAgICAgLy8ga2V5ZG93biB1cGRhdGUgcmVjZWl2ZWQsIG5vdGlmeSBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5rZXlkb3duRW1pdHRlci5lbWl0KCBkb21FdmVudCApO1xuICAgICAgICB0aGlzLmtleURvd25TdGF0ZUNoYW5nZWRFbWl0dGVyLmVtaXQoIGRvbUV2ZW50ICk7XG4gICAgICB9XG5cbiAgICB9LCB7XG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucz8udGFuZGVtPy5jcmVhdGVUYW5kZW0oICdrZXlkb3duVXBkYXRlQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogWyB7IG5hbWU6ICdldmVudCcsIHBoZXRpb1R5cGU6IEV2ZW50SU8gfSBdLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBY3Rpb24gdGhhdCBleGVjdXRlcyB3aGVuZXZlciBhIGtleWRvd24gb2NjdXJzIGZyb20gdGhlIGlucHV0IGxpc3RlbmVycyB0aGlzIGtleVN0YXRlVHJhY2tlciBhZGRzIChtb3N0IGxpa2VseSB0byB0aGUgZG9jdW1lbnQpLidcbiAgICB9ICk7XG5cbiAgICB0aGlzLmtleXVwVXBkYXRlQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZG9tRXZlbnQgPT4ge1xuXG4gICAgICAvLyBOb3QgYWxsIGtleXMgaGF2ZSBhIGNvZGUgZm9yIHRoZSBicm93c2VyIHRvIHVzZSwgd2UgbmVlZCB0byBiZSBncmFjZWZ1bCBhbmQgZG8gbm90aGluZyBpZiB0aGVyZSBpc24ndCBvbmUuXG4gICAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKTtcbiAgICAgIGlmICgga2V5ICkge1xuXG4gICAgICAgIC8vIGNvcnJlY3Qga2V5U3RhdGUgaW4gY2FzZSBicm93c2VyIGRpZG4ndCByZWNlaXZlIGtleWRvd24va2V5dXAgZXZlbnRzIGZvciBhIG1vZGlmaWVyIGtleVxuICAgICAgICB0aGlzLmNvcnJlY3RNb2RpZmllcktleXMoIGRvbUV2ZW50ICk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoaXMga2V5IGRhdGEgZnJvbSB0aGUgc3RhdGUgLSBUaGVyZSBhcmUgbWFueSBjYXNlcyB3aGVyZSB3ZSBtaWdodCByZWNlaXZlIGEga2V5dXAgYmVmb3JlIGtleWRvd24gbGlrZVxuICAgICAgICAvLyBvbiBmaXJzdCB0YWIgaW50byBzY2VuZXJ5IERpc3BsYXkgb3Igd2hlbiB1c2luZyBzcGVjaWZpYyBvcGVyYXRpbmcgc3lzdGVtIGtleXMgd2l0aCB0aGUgYnJvd3NlciBvciBQcnRTY24gc29cbiAgICAgICAgLy8gYW4gYXNzZXJ0aW9uIGZvciB0aGlzIGlzIHRvbyBzdHJpY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvOTE4XG4gICAgICAgIGlmICggdGhpcy5pc0tleURvd24oIGtleSApICkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmtleVN0YXRlWyBrZXkgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uIE1hY09TLCB3ZSB3aWxsIG5vdCBnZXQga2V5IGtleXVwIGV2ZW50cyB3aGlsZSBhIG1ldGEga2V5IGlzIHByZXNzZWQuIFNvIHRoZSBrZXlzdGF0ZSB3aWxsIGJlIGluYWNjdXJhdGVcbiAgICAgICAgLy8gdW50aWwgdGhlIG1ldGEga2V5cyBhcmUgcmVsZWFzZWQuIElmIGJvdGggbWV0YSBrZXlzIGFyZSBwcmVzc2VkLCBXZSBqdXN0IFdlIHdpbGwgbm90IGdldCBhIGtleXVwIGV2ZW50IHVudGlsXG4gICAgICAgIC8vIEJPVEgga2V5cyBhcmUgcmVsZWFzZWQsIHNvIHRoaXMgc2hvdWxkIGJlIHNhZmUgaW4gdGhhdCBjYXNlLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1NTVcbiAgICAgICAgaWYgKCBwbGF0Zm9ybS5tYWMgJiYgS2V5Ym9hcmRVdGlscy5pc01ldGFLZXkoIGRvbUV2ZW50ICkgKSB7XG4gICAgICAgICAgLy8gU2tpcCBub3RpZmljYXRpb24sIHNpbmNlIHdlIHdpbGwgZW1pdCBvbiB0aGUgc3RhdGUgY2hhbmdlIGJlbG93XG4gICAgICAgICAgdGhpcy5jbGVhclN0YXRlKCB0cnVlICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBrZXl1cCBldmVudCByZWNlaXZlZCwgbm90aWZ5IGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmtleXVwRW1pdHRlci5lbWl0KCBkb21FdmVudCApO1xuICAgICAgICB0aGlzLmtleURvd25TdGF0ZUNoYW5nZWRFbWl0dGVyLmVtaXQoIGRvbUV2ZW50ICk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICB0YW5kZW06IG9wdGlvbnM/LnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAna2V5dXBVcGRhdGVBY3Rpb24nICksXG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ2V2ZW50JywgcGhldGlvVHlwZTogRXZlbnRJTyB9IF0sXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0FjdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW5ldmVyIGEga2V5dXAgb2NjdXJzIGZyb20gdGhlIGlucHV0IGxpc3RlbmVycyB0aGlzIGtleVN0YXRlVHJhY2tlciBhZGRzIChtb3N0IGxpa2VseSB0byB0aGUgZG9jdW1lbnQpLidcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzdGVwTGlzdGVuZXIgPSB0aGlzLnN0ZXAuYmluZCggdGhpcyApO1xuICAgIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggc3RlcExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VLZXlTdGF0ZVRyYWNrZXIgPSAoKSA9PiB7XG4gICAgICBzdGVwVGltZXIucmVtb3ZlTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApO1xuXG4gICAgICBpZiAoIHRoaXMuYXR0YWNoZWRUb0RvY3VtZW50ICkge1xuICAgICAgICB0aGlzLmRldGFjaEZyb21Eb2N1bWVudCgpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50cyBrZXlib2FyZCBkcmFnZ2luZyB3aGVuIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHRvIHRoZSBOb2RlLCBwdWJsaWMgc28gbGlzdGVuZXIgaXMgYXR0YWNoZWRcbiAgICogd2l0aCBhZGRJbnB1dExpc3RlbmVyKCkuIE9ubHkgdXBkYXRlZCB3aGVuIGVuYWJsZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGlzIGV2ZW50IGlzIGFzc2lnbmVkIGluIHRoZSBjb25zdHJ1Y3RvciwgYW5kIG5vdCB0byB0aGUgcHJvdG90eXBlLiBBcyBvZiB3cml0aW5nIHRoaXMsXG4gICAqIGBOb2RlLmFkZElucHV0TGlzdGVuZXJgIG9ubHkgc3VwcG9ydHMgdHlwZSBwcm9wZXJ0aWVzIGFzIGV2ZW50IGxpc3RlbmVycywgYW5kIG5vdCB0aGUgZXZlbnQga2V5cyBhc1xuICAgKiBwcm90b3R5cGUgbWV0aG9kcy4gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUxIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGtleWRvd25VcGRhdGUoIGRvbUV2ZW50OiBLZXlib2FyZEV2ZW50ICk6IHZvaWQge1xuICAgIHRoaXMuZW5hYmxlZCAmJiB0aGlzLmtleWRvd25VcGRhdGVBY3Rpb24uZXhlY3V0ZSggZG9tRXZlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllciBrZXlzIG1pZ2h0IGJlIHBhcnQgb2YgdGhlIGRvbUV2ZW50IGJ1dCB0aGUgYnJvd3NlciBtYXkgb3IgbWF5IG5vdCBoYXZlIHJlY2VpdmVkIGEga2V5ZG93bi9rZXl1cCBldmVudFxuICAgKiB3aXRoIHNwZWNpZmljYWxseSBmb3IgdGhlIG1vZGlmaWVyIGtleS4gVGhpcyB3aWxsIGFkZCBvciByZW1vdmUgbW9kaWZpZXIga2V5cyBpbiB0aGF0IGNhc2UuXG4gICAqL1xuICBwcml2YXRlIGNvcnJlY3RNb2RpZmllcktleXMoIGRvbUV2ZW50OiBLZXlib2FyZEV2ZW50ICk6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBkb21FdmVudCApITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXksICdrZXkgbm90IGZvdW5kIGZyb20gZG9tRXZlbnQnICk7XG5cbiAgICBsZXQgY2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gYWRkIG1vZGlmaWVyIGtleXMgaWYgdGhleSBhcmVuJ3QgZG93blxuICAgIGlmICggZG9tRXZlbnQuc2hpZnRLZXkgJiYgIUtleWJvYXJkVXRpbHMuaXNTaGlmdEtleSggZG9tRXZlbnQgKSAmJiAhdGhpcy5zaGlmdEtleURvd24gKSB7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCAhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCBdO1xuICAgICAgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCBdID0ge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICggZG9tRXZlbnQuYWx0S2V5ICYmICFLZXlib2FyZFV0aWxzLmlzQWx0S2V5KCBkb21FdmVudCApICYmICF0aGlzLmFsdEtleURvd24gKSB7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCAhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQUxUX0xFRlQgXTtcbiAgICAgIHRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0FMVF9MRUZUIF0gPSB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICB0aW1lRG93bjogMCAvLyBpbiBtc1xuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKCBkb21FdmVudC5jdHJsS2V5ICYmICFLZXlib2FyZFV0aWxzLmlzQ29udHJvbEtleSggZG9tRXZlbnQgKSAmJiAhdGhpcy5jdHJsS2V5RG93biApIHtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8ICF0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9DT05UUk9MX0xFRlQgXTtcbiAgICAgIHRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0NPTlRST0xfTEVGVCBdID0ge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdGltZURvd246IDAgLy8gaW4gbXNcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICggZG9tRXZlbnQubWV0YUtleSAmJiAhS2V5Ym9hcmRVdGlscy5pc01ldGFLZXkoIGRvbUV2ZW50ICkgJiYgIXRoaXMubWV0YUtleURvd24gKSB7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCAhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfTUVUQV9MRUZUIF07XG4gICAgICB0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9NRVRBX0xFRlQgXSA9IHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIHRpbWVEb3duOiAwIC8vIGluIG1zXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIGRlbGV0ZSBtb2RpZmllciBrZXlzIGlmIHdlIHRoaW5rIHRoZXkgYXJlIGRvd25cbiAgICBpZiAoICFkb21FdmVudC5zaGlmdEtleSAmJiB0aGlzLnNoaWZ0S2V5RG93biApIHtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8ICEhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfTEVGVCBdIHx8ICEhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfUklHSFQgXTtcbiAgICAgIGRlbGV0ZSB0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9TSElGVF9MRUZUIF07XG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfU0hJRlRfUklHSFQgXTtcbiAgICB9XG4gICAgaWYgKCAhZG9tRXZlbnQuYWx0S2V5ICYmIHRoaXMuYWx0S2V5RG93biApIHtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8ICEhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQUxUX0xFRlQgXSB8fCAhIXRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0FMVF9SSUdIVCBdO1xuICAgICAgZGVsZXRlIHRoaXMua2V5U3RhdGVbIEtleWJvYXJkVXRpbHMuS0VZX0FMVF9MRUZUIF07XG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQUxUX1JJR0hUIF07XG4gICAgfVxuICAgIGlmICggIWRvbUV2ZW50LmN0cmxLZXkgJiYgdGhpcy5jdHJsS2V5RG93biApIHtcbiAgICAgIGNoYW5nZWQgPSBjaGFuZ2VkIHx8ICEhdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQ09OVFJPTF9MRUZUIF0gfHwgISF0aGlzLmtleVN0YXRlWyBLZXlib2FyZFV0aWxzLktFWV9DT05UUk9MX1JJR0hUIF07XG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQ09OVFJPTF9MRUZUIF07XG4gICAgICBkZWxldGUgdGhpcy5rZXlTdGF0ZVsgS2V5Ym9hcmRVdGlscy5LRVlfQ09OVFJPTF9SSUdIVCBdO1xuICAgIH1cbiAgICBpZiAoICFkb21FdmVudC5tZXRhS2V5ICYmIHRoaXMubWV0YUtleURvd24gKSB7XG4gICAgICBjaGFuZ2VkID0gY2hhbmdlZCB8fCBLZXlib2FyZFV0aWxzLk1FVEFfS0VZUy5zb21lKCBrZXkgPT4gISF0aGlzLmtleVN0YXRlWyBrZXkgXSApO1xuICAgICAgS2V5Ym9hcmRVdGlscy5NRVRBX0tFWVMuZm9yRWFjaCgga2V5ID0+IHsgZGVsZXRlIHRoaXMua2V5U3RhdGVbIGtleSBdOyB9ICk7XG4gICAgfVxuXG4gICAgaWYgKCBjaGFuZ2VkICkge1xuICAgICAgdGhpcy5rZXlEb3duU3RhdGVDaGFuZ2VkRW1pdHRlci5lbWl0KCBkb21FdmVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCZWhhdmlvciBmb3Iga2V5Ym9hcmQgJ3VwJyBET00gZXZlbnQuIFB1YmxpYyBzbyBpdCBjYW4gYmUgYXR0YWNoZWQgd2l0aCBhZGRJbnB1dExpc3RlbmVyKCkuIE9ubHkgdXBkYXRlZCB3aGVuXG4gICAqIGVuYWJsZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGlzIGV2ZW50IGlzIGFzc2lnbmVkIGluIHRoZSBjb25zdHJ1Y3RvciwgYW5kIG5vdCB0byB0aGUgcHJvdG90eXBlLiBBcyBvZiB3cml0aW5nIHRoaXMsXG4gICAqIGBOb2RlLmFkZElucHV0TGlzdGVuZXJgIG9ubHkgc3VwcG9ydHMgdHlwZSBwcm9wZXJ0aWVzIGFzIGV2ZW50IGxpc3RlbmVycywgYW5kIG5vdCB0aGUgZXZlbnQga2V5cyBhc1xuICAgKiBwcm90b3R5cGUgbWV0aG9kcy4gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvODUxIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGtleXVwVXBkYXRlKCBkb21FdmVudDogS2V5Ym9hcmRFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmVuYWJsZWQgJiYgdGhpcy5rZXl1cFVwZGF0ZUFjdGlvbi5leGVjdXRlKCBkb21FdmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIG1vdmVtZW50IGtleXMgYXJlIGRvd24gKGFycm93IGtleXMgb3IgV0FTRCBrZXlzKS5cbiAgICovXG4gIHB1YmxpYyBnZXQgbW92ZW1lbnRLZXlzRG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuTU9WRU1FTlRfS0VZUyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEtleWJvYXJkRXZlbnQuY29kZSBmcm9tIHRoZSBsYXN0IGtleSBkb3duIHRoYXQgdXBkYXRlZCB0aGUga2V5c3RhdGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGFzdEtleURvd24oKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RLZXlEb3duO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhIGtleSB3aXRoIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgaXMgY3VycmVudGx5IGRvd24uXG4gICAqL1xuICBwdWJsaWMgaXNLZXlEb3duKCBrZXk6IHN0cmluZyApOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLmtleVN0YXRlWyBrZXkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGtleSB3aXRoIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgaXMgY3VycmVudGx5IGRvd24uXG4gICAqL1xuICBwdWJsaWMgaXNFbmdsaXNoS2V5RG93bigga2V5OiBFbmdsaXNoS2V5ICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQW55S2V5SW5MaXN0RG93biggRW5nbGlzaFN0cmluZ1RvQ29kZU1hcFsga2V5IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzZXQgb2Yga2V5cyB0aGF0IGFyZSBjdXJyZW50bHkgZG93bi5cbiAgICpcbiAgICogTk9URTogQWx3YXlzIHJldHVybnMgYSBuZXcgYXJyYXksIHNvIGEgZGVmZW5zaXZlIGNvcHkgaXMgbm90IG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXRLZXlzRG93bigpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCB0aGlzLmtleVN0YXRlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc2V0IG9mIEVuZ2xpc2hLZXlzIHRoYXQgYXJlIGN1cnJlbnRseSBkb3duLlxuICAgKlxuICAgKiBOT1RFOiBBbHdheXMgcmV0dXJucyBhIG5ldyBTZXQsIHNvIGEgZGVmZW5zaXZlIGNvcHkgaXMgbm90IG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBnZXRFbmdsaXNoS2V5c0Rvd24oKTogU2V0PEVuZ2xpc2hLZXlTdHJpbmc+IHtcbiAgICBjb25zdCBlbmdsaXNoS2V5U2V0ID0gbmV3IFNldDxFbmdsaXNoS2V5U3RyaW5nPigpO1xuXG4gICAgZm9yICggY29uc3Qga2V5IG9mIHRoaXMuZ2V0S2V5c0Rvd24oKSApIHtcbiAgICAgIGNvbnN0IGVuZ2xpc2hLZXkgPSBldmVudENvZGVUb0VuZ2xpc2hTdHJpbmcoIGtleSApO1xuICAgICAgaWYgKCBlbmdsaXNoS2V5ICkge1xuICAgICAgICBlbmdsaXNoS2V5U2V0LmFkZCggZW5nbGlzaEtleSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBlbmdsaXNoS2V5U2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBhbnkgb2YgdGhlIGtleXMgaW4gdGhlIGxpc3QgYXJlIGN1cnJlbnRseSBkb3duLiBLZXlzIGFyZSB0aGUgS2V5Ym9hcmRFdmVudC5jb2RlIHN0cmluZ3MuXG4gICAqL1xuICBwdWJsaWMgaXNBbnlLZXlJbkxpc3REb3duKCBrZXlMaXN0OiBzdHJpbmdbXSApOiBib29sZWFuIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCB0aGlzLmlzS2V5RG93bigga2V5TGlzdFsgaSBdICkgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgQUxMIG9mIHRoZSBrZXlzIGluIHRoZSBsaXN0IGFyZSBjdXJyZW50bHkgZG93bi4gVmFsdWVzIG9mIHRoZSBrZXlMaXN0IGFycmF5IGFyZSB0aGVcbiAgICogS2V5Ym9hcmRFdmVudC5jb2RlIGZvciB0aGUga2V5cyB5b3UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICBwdWJsaWMgYXJlS2V5c0Rvd24oIGtleUxpc3Q6IHN0cmluZ1tdICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGtleXNEb3duID0gdHJ1ZTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCAhdGhpcy5pc0tleURvd24oIGtleUxpc3RbIGkgXSApICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXNEb3duO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBBTEwga2V5cyBpbiB0aGUgbGlzdCBhcmUgZG93biBhbmQgT05MWSB0aGUga2V5cyBpbiB0aGUgbGlzdCBhcmUgZG93bi4gVmFsdWVzIG9mIGtleUxpc3QgYXJyYXlcbiAgICogYXJlIHRoZSBLZXlib2FyZEV2ZW50LmNvZGUgZm9yIGtleXMgeW91IGFyZSBpbnRlcmVzdGVkIGluIE9SIHRoZSBLZXlib2FyZEV2ZW50LmtleSBpbiB0aGUgc3BlY2lhbCBjYXNlIG9mXG4gICAqIG1vZGlmaWVyIGtleXMuXG4gICAqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGFyZUtleXNFeGNsdXNpdmVseURvd24oIGtleUxpc3Q6IHN0cmluZyBbXSApOiBib29sZWFuIHtcbiAgICBjb25zdCBrZXlTdGF0ZUtleXMgPSBPYmplY3Qua2V5cyggdGhpcy5rZXlTdGF0ZSApO1xuXG4gICAgLy8gcXVpY2sgc2FuaXR5IGNoZWNrIGZvciBlcXVhbGl0eSBmaXJzdFxuICAgIGlmICgga2V5U3RhdGVLZXlzLmxlbmd0aCAhPT0ga2V5TGlzdC5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTm93IG1ha2Ugc3VyZSB0aGF0IGV2ZXJ5IGtleSBpbiB0aGUgbGlzdCBpcyBpbiB0aGUga2V5U3RhdGVcbiAgICBsZXQgb25seUtleUxpc3REb3duID0gdHJ1ZTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXlMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgaW5pdGlhbEtleSA9IGtleUxpc3RbIGkgXTtcbiAgICAgIGxldCBrZXlzVG9DaGVjayA9IFsgaW5pdGlhbEtleSBdO1xuXG4gICAgICAvLyBJZiBhIG1vZGlmaWVyIGtleSwgbmVlZCB0byBsb29rIGZvciB0aGUgZXF1aXZhbGVudCBwYWlyIG9mIGxlZnQvcmlnaHQgS2V5Ym9hcmRFdmVudC5jb2RlcyBpbiB0aGUgbGlzdFxuICAgICAgLy8gYmVjYXVzZSBLZXlTdGF0ZVRyYWNrZXIgd29ya3MgZXhjbHVzaXZlbHkgd2l0aCBjb2Rlcy5cbiAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc01vZGlmaWVyS2V5KCBpbml0aWFsS2V5ICkgKSB7XG4gICAgICAgIGtleXNUb0NoZWNrID0gS2V5Ym9hcmRVdGlscy5NT0RJRklFUl9LRVlfVE9fQ09ERV9NQVAuZ2V0KCBpbml0aWFsS2V5ICkhO1xuICAgICAgfVxuXG4gICAgICBpZiAoIF8uaW50ZXJzZWN0aW9uKCBrZXlTdGF0ZUtleXMsIGtleXNUb0NoZWNrICkubGVuZ3RoID09PSAwICkge1xuICAgICAgICBvbmx5S2V5TGlzdERvd24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb25seUtleUxpc3REb3duO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBldmVyeSBrZXkgaW4gdGhlIGxpc3QgaXMgZG93biBidXQgbm8gb3RoZXIgbW9kaWZpZXIga2V5cyBhcmUgZG93biwgdW5sZXNzXG4gICAqIHRoZSBtb2RpZmllciBrZXkgaXMgaW4gdGhlIGxpc3QuIEZvciBleGFtcGxlXG4gICAqIGFyZUtleXNEb3duV2l0aG91dE1vZGlmaWVycyggWyAnU2hpZnRMZWZ0JywgJ0Fycm93TGVmdCcgXSApIC0+IHRydWUgaWYgbGVmdCBzaGlmdCBhbmQgbGVmdCBhcnJvdyBrZXlzIGFyZSBkb3duLlxuICAgKiBhcmVLZXlzRG93bldpdGhvdXRNb2RpZmllcnMoIFsgJ1NoaWZ0TGVmdCcsICdBcnJvd0xlZnQnIF0gKSAtPiB0cnVlIGlmIGxlZnQgc2hpZnQsIGxlZnQgYXJyb3csIGFuZCBKIGtleXMgYXJlIGRvd24uXG4gICAqIGFyZUtleXNEb3duV2l0aG91dE1vZGlmaWVycyggWyAnQXJyb3dMZWZ0JyBdICkgLT4gZmFsc2UgaWYgbGVmdCBzaGlmdCBhbmQgYXJyb3cgbGVmdCBrZXlzIGFyZSBkb3duLlxuICAgKiBhcmVLZXlzRG93bldpdGhvdXRNb2RpZmllcnMoIFsgJ0Fycm93TGVmdCcgXSApIC0+IHRydWUgaWYgdGhlIGxlZnQgYXJyb3cga2V5IGlzIGRvd24uXG4gICAqIGFyZUtleXNEb3duV2l0aG91dE1vZGlmaWVycyggWyAnQXJyb3dMZWZ0JyBdICkgLT4gdHJ1ZSBpZiB0aGUgbGVmdCBhcnJvdyBhbmQgUiBrZXlzIGFyZSBkb3duLlxuICAgKlxuICAgKiBUaGlzIGlzIGltcG9ydGFudCBmb3IgZGV0ZXJtaW5pbmcgd2hlbiBrZXlib2FyZCBldmVudHMgc2hvdWxkIGZpcmUgbGlzdGVuZXJzLiBTYXkgeW91IGhhdmUgdHdvIEtleWJvYXJkTGlzdGVuZXJzIC1cbiAgICogT25lIGZpcmVzIGZyb20ga2V5ICdjJyBhbmQgYW5vdGhlciBmaXJlcyBmcm9tICdzaGlmdC1jJy4gSWYgdGhlIHVzZXIgcHJlc3NlcyAnc2hpZnQtYycsIHlvdSBkbyBOT1Qgd2FudCBib3RoIHRvXG4gICAqIGZpcmUuXG4gICAqXG4gICAqIEBwYXJhbSBrZXlMaXN0IC0gTGlzdCBvZiBLZXlib2FyZEV2ZW50LmNvZGUgc3RyaW5ncyBmb3Iga2V5cyB5b3UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICBwdWJsaWMgYXJlS2V5c0Rvd25XaXRob3V0RXh0cmFNb2RpZmllcnMoIGtleUxpc3Q6IHN0cmluZ1tdICk6IGJvb2xlYW4ge1xuXG4gICAgLy8gSWYgYW55IG1vZGlmaWVyIGtleXMgYXJlIGRvd24gdGhhdCBhcmUgbm90IGluIHRoZSBrZXlMaXN0LCByZXR1cm4gZmFsc2VcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBLZXlib2FyZFV0aWxzLk1PRElGSUVSX0tFWV9DT0RFUy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IG1vZGlmaWVyS2V5ID0gS2V5Ym9hcmRVdGlscy5NT0RJRklFUl9LRVlfQ09ERVNbIGkgXTtcbiAgICAgIGlmICggdGhpcy5pc0tleURvd24oIG1vZGlmaWVyS2V5ICkgJiYgIWtleUxpc3QuaW5jbHVkZXMoIG1vZGlmaWVyS2V5ICkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNb2RpZmllciBzdGF0ZSBzZWVtcyBPSyBzbyByZXR1cm4gdHJ1ZSBpZiBhbGwga2V5cyBpbiB0aGUgbGlzdCBhcmUgZG93blxuICAgIHJldHVybiB0aGlzLmFyZUtleXNEb3duKCBrZXlMaXN0ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIGFueSBrZXlzIGFyZSBkb3duIGFjY29yZGluZyB0byB0ZWgga2V5U3RhdGUuXG4gICAqL1xuICBwdWJsaWMga2V5c0FyZURvd24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKCB0aGlzLmtleVN0YXRlICkubGVuZ3RoID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIFwiRW50ZXJcIiBrZXkgaXMgY3VycmVudGx5IGRvd24uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGVudGVyS2V5RG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0tleURvd24oIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzaGlmdCBrZXkgaXMgY3VycmVudGx5IGRvd24uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHNoaWZ0S2V5RG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuU0hJRlRfS0VZUyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYWx0IGtleSBpcyBjdXJyZW50bHkgZG93bi5cbiAgICovXG4gIHB1YmxpYyBnZXQgYWx0S2V5RG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuQUxUX0tFWVMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGNvbnRyb2wga2V5IGlzIGN1cnJlbnRseSBkb3duLlxuICAgKi9cbiAgcHVibGljIGdldCBjdHJsS2V5RG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuQ09OVFJPTF9LRVlTICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIG9uZSBvZiB0aGUgbWV0YSBrZXlzIGlzIGN1cnJlbnRseSBkb3duLlxuICAgKi9cbiAgcHVibGljIGdldCBtZXRhS2V5RG93bigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0FueUtleUluTGlzdERvd24oIEtleWJvYXJkVXRpbHMuTUVUQV9LRVlTICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCB0aGUgcHJvdmlkZWQga2V5IGhhcyBiZWVuIGhlbGQgZG93bi4gRXJyb3IgaWYgdGhlIGtleSBpcyBub3QgY3VycmVudGx5IGRvd24uXG4gICAqIEBwYXJhbSBrZXkgLSBLZXlib2FyZEV2ZW50LmNvZGUgZm9yIHRoZSBrZXkgeW91IGFyZSBpbnNwZWN0aW5nLlxuICAgKi9cbiAgcHVibGljIHRpbWVEb3duRm9yS2V5KCBrZXk6IHN0cmluZyApOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNLZXlEb3duKCBrZXkgKSwgJ2Nhbm5vdCBnZXQgdGltZURvd24gb24gYSBrZXkgdGhhdCBpcyBub3QgcHJlc3NlZCBkb3duJyApO1xuICAgIHJldHVybiB0aGlzLmtleVN0YXRlWyBrZXkgXS50aW1lRG93bjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgZW50aXJlIHN0YXRlIG9mIHRoZSBrZXkgdHJhY2tlciwgYmFzaWNhbGx5IHJlc3RhcnRpbmcgdGhlIHRyYWNrZXIuXG4gICAqL1xuICBwdWJsaWMgY2xlYXJTdGF0ZSggc2tpcE5vdGlmeT86IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5rZXlTdGF0ZSA9IHt9O1xuXG4gICAgaWYgKCAhc2tpcE5vdGlmeSApIHtcbiAgICAgIHRoaXMua2V5RG93blN0YXRlQ2hhbmdlZEVtaXR0ZXIuZW1pdCggbnVsbCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGVwIGZ1bmN0aW9uIGZvciB0aGUgdHJhY2tlci4gSmF2YVNjcmlwdCBkb2VzIG5vdCBuYXRpdmVseSBoYW5kbGUgbXVsdGlwbGUga2V5ZG93biBldmVudHMgYXQgb25jZSxcbiAgICogc28gd2UgbmVlZCB0byB0cmFjayB0aGUgc3RhdGUgb2YgdGhlIGtleWJvYXJkIGluIGFuIE9iamVjdCBhbmQgbWFuYWdlIGRyYWdnaW5nIGluIHRoaXMgZnVuY3Rpb24uXG4gICAqIEluIG9yZGVyIGZvciB0aGUgZHJhZyBoYW5kbGVyIHRvIHdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgaW4gc2Vjb25kcyB0aGF0IGhhcyBwYXNzZWQgc2luY2UgdGhlIGxhc3QgdXBkYXRlXG4gICAqL1xuICBwcml2YXRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICAvLyBuby1vcCB1bmxlc3MgYSBrZXkgaXMgZG93blxuICAgIGlmICggdGhpcy5rZXlzQXJlRG93bigpICkge1xuICAgICAgY29uc3QgbXMgPSBkdCAqIDEwMDA7XG5cbiAgICAgIC8vIGZvciBlYWNoIGtleSB0aGF0IGlzIHN0aWxsIGRvd24sIGluY3JlbWVudCB0aGUgdHJhY2tlZCB0aW1lIHRoYXQgaGFzIGJlZW4gZG93blxuICAgICAgZm9yICggY29uc3QgaSBpbiB0aGlzLmtleVN0YXRlICkge1xuICAgICAgICBpZiAoIHRoaXMua2V5U3RhdGVbIGkgXSApIHtcbiAgICAgICAgICB0aGlzLmtleVN0YXRlWyBpIF0udGltZURvd24gKz0gbXM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoaXMgS2V5U3RhdGVUcmFja2VyIHRvIHRoZSB3aW5kb3cgc28gdGhhdCBpdCB1cGRhdGVzIHdoZW5ldmVyIHRoZSBkb2N1bWVudCByZWNlaXZlcyBrZXkgZXZlbnRzLiBUaGlzIGlzXG4gICAqIHVzZWZ1bCBpZiB5b3Ugd2FudCB0byBvYnNlcnZlIGtleSBwcmVzc2VzIHdoaWxlIERPTSBmb2N1cyBub3Qgd2l0aGluIHRoZSBQRE9NIHJvb3QuXG4gICAqL1xuICBwdWJsaWMgYXR0YWNoVG9XaW5kb3coKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuYXR0YWNoZWRUb0RvY3VtZW50LCAnS2V5U3RhdGVUcmFja2VyIGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gZG9jdW1lbnQuJyApO1xuXG4gICAgdGhpcy5kb2N1bWVudEtleWRvd25MaXN0ZW5lciA9IGV2ZW50ID0+IHtcbiAgICAgIHRoaXMua2V5ZG93blVwZGF0ZSggZXZlbnQgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb2N1bWVudEtleXVwTGlzdGVuZXIgPSBldmVudCA9PiB7XG4gICAgICB0aGlzLmtleXVwVXBkYXRlKCBldmVudCApO1xuICAgIH07XG5cbiAgICB0aGlzLmRvY3VtZW50Qmx1ckxpc3RlbmVyID0gZXZlbnQgPT4ge1xuXG4gICAgICAvLyBBcyByZWNvbW1lbmRlZCBmb3Igc2ltaWxhciBzaXR1YXRpb25zIG9ubGluZSwgd2UgY2xlYXIgb3VyIGtleSBzdGF0ZSB3aGVuIHdlIGdldCBhIHdpbmRvdyBibHVyLCBzaW5jZSB3ZVxuICAgICAgLy8gd2lsbCBub3QgYmUgYWJsZSB0byB0cmFjayBhbnkga2V5IHN0YXRlIGNoYW5nZXMgZHVyaW5nIHRoaXMgdGltZSAoYW5kIHVzZXJzIHdpbGwgbGlrZWx5IHJlbGVhc2UgYW55IGtleXNcbiAgICAgIC8vIHRoYXQgYXJlIHByZXNzZWQpLlxuICAgICAgLy8gSWYgc2hpZnQvYWx0L2N0cmwgYXJlIHByZXNzZWQgd2hlbiB3ZSByZWdhaW4gZm9jdXMsIHdlIHdpbGwgaG9wZWZ1bGx5IGdldCBhIGtleWJvYXJkIGV2ZW50IGFuZCB1cGRhdGUgdGhlaXIgc3RhdGVcbiAgICAgIC8vIHdpdGggY29ycmVjdE1vZGlmaWVyS2V5cygpLlxuICAgICAgdGhpcy5jbGVhclN0YXRlKCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGFkZExpc3RlbmVyc1RvRG9jdW1lbnQgPSAoKSA9PiB7XG5cbiAgICAgIC8vIGF0dGFjaCB3aXRoIHVzZUNhcHR1cmUgc28gdGhhdCB0aGUga2V5U3RhdGVUcmFja2VyIGlzIHVwZGF0ZWQgYmVmb3JlIHRoZSBldmVudHMgZGlzcGF0Y2ggd2l0aGluIFNjZW5lcnlcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCB0aGlzLmRvY3VtZW50S2V5dXBMaXN0ZW5lciEsIHsgY2FwdHVyZTogdHJ1ZSB9ICk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzLmRvY3VtZW50S2V5ZG93bkxpc3RlbmVyISwgeyBjYXB0dXJlOiB0cnVlIH0gKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsIHRoaXMuZG9jdW1lbnRCbHVyTGlzdGVuZXIhLCB7IGNhcHR1cmU6IHRydWUgfSApO1xuICAgICAgdGhpcy5hdHRhY2hlZFRvRG9jdW1lbnQgPSB0cnVlO1xuICAgIH07XG5cbiAgICBpZiAoICFkb2N1bWVudCApIHtcblxuICAgICAgLy8gYXR0YWNoIGxpc3RlbmVycyBvbiB3aW5kb3cgbG9hZCB0byBlbnN1cmUgdGhhdCB0aGUgZG9jdW1lbnQgaXMgZGVmaW5lZFxuICAgICAgY29uc3QgbG9hZExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICBhZGRMaXN0ZW5lcnNUb0RvY3VtZW50KCk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIGxvYWRMaXN0ZW5lciApO1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIGxvYWRMaXN0ZW5lciApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gZG9jdW1lbnQgaXMgZGVmaW5lZCBhbmQgd2Ugd29uJ3QgZ2V0IGFub3RoZXIgbG9hZCBldmVudCBzbyBhdHRhY2ggcmlnaHQgYXdheVxuICAgICAgYWRkTGlzdGVuZXJzVG9Eb2N1bWVudCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgS2V5U3RhdGUgaXMgY2xlYXJlZCB3aGVuIHRoZSB0cmFja2VyIGlzIGRpc2FibGVkLlxuICAgKi9cbiAgcHVibGljIHNldEVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9lbmFibGVkICE9PSBlbmFibGVkICkge1xuICAgICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG5cbiAgICAgIC8vIGNsZWFyIHN0YXRlIHdoZW4gZGlzYWJsZWRcbiAgICAgICFlbmFibGVkICYmIHRoaXMuY2xlYXJTdGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgZW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApIHsgdGhpcy5zZXRFbmFibGVkKCBlbmFibGVkICk7IH1cblxuICBwdWJsaWMgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRW5hYmxlZCgpOyB9XG5cbiAgcHVibGljIGlzRW5hYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7IH1cblxuICAvKipcbiAgICogRGV0YWNoIGxpc3RlbmVycyBmcm9tIHRoZSBkb2N1bWVudCB0aGF0IHdvdWxkIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhpcyBLZXlTdGF0ZVRyYWNrZXIgb24ga2V5IHByZXNzZXMuXG4gICAqL1xuICBwdWJsaWMgZGV0YWNoRnJvbURvY3VtZW50KCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYXR0YWNoZWRUb0RvY3VtZW50LCAnS2V5U3RhdGVUcmFja2VyIGlzIG5vdCBhdHRhY2hlZCB0byB3aW5kb3cuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZG9jdW1lbnRLZXl1cExpc3RlbmVyLCAna2V5dXAgbGlzdGVuZXIgd2FzIG5vdCBjcmVhdGVkIG9yIGF0dGFjaGVkIHRvIHdpbmRvdycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRvY3VtZW50S2V5ZG93bkxpc3RlbmVyLCAna2V5ZG93biBsaXN0ZW5lciB3YXMgbm90IGNyZWF0ZWQgb3IgYXR0YWNoZWQgdG8gd2luZG93LicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRvY3VtZW50Qmx1ckxpc3RlbmVyLCAnYmx1ciBsaXN0ZW5lciB3YXMgbm90IGNyZWF0ZWQgb3IgYXR0YWNoZWQgdG8gd2luZG93LicgKTtcblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5dXAnLCB0aGlzLmRvY3VtZW50S2V5dXBMaXN0ZW5lciEgKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzLmRvY3VtZW50S2V5ZG93bkxpc3RlbmVyISApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnYmx1cicsIHRoaXMuZG9jdW1lbnRCbHVyTGlzdGVuZXIhICk7XG5cbiAgICB0aGlzLmRvY3VtZW50S2V5dXBMaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5kb2N1bWVudEtleWRvd25MaXN0ZW5lciA9IG51bGw7XG4gICAgdGhpcy5kb2N1bWVudEJsdXJMaXN0ZW5lciA9IG51bGw7XG5cbiAgICB0aGlzLmF0dGFjaGVkVG9Eb2N1bWVudCA9IGZhbHNlO1xuICB9XG5cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlS2V5U3RhdGVUcmFja2VyKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0tleVN0YXRlVHJhY2tlcicsIEtleVN0YXRlVHJhY2tlciApO1xuZXhwb3J0IGRlZmF1bHQgS2V5U3RhdGVUcmFja2VyOyJdLCJuYW1lcyI6WyJFbWl0dGVyIiwic3RlcFRpbWVyIiwicGxhdGZvcm0iLCJFdmVudFR5cGUiLCJQaGV0aW9BY3Rpb24iLCJFbmdsaXNoU3RyaW5nVG9Db2RlTWFwIiwiZXZlbnRDb2RlVG9FbmdsaXNoU3RyaW5nIiwiRXZlbnRJTyIsIktleWJvYXJkVXRpbHMiLCJzY2VuZXJ5IiwiS2V5U3RhdGVUcmFja2VyIiwia2V5ZG93blVwZGF0ZSIsImRvbUV2ZW50IiwiZW5hYmxlZCIsImtleWRvd25VcGRhdGVBY3Rpb24iLCJleGVjdXRlIiwiY29ycmVjdE1vZGlmaWVyS2V5cyIsImtleSIsImdldEV2ZW50Q29kZSIsImFzc2VydCIsImNoYW5nZWQiLCJzaGlmdEtleSIsImlzU2hpZnRLZXkiLCJzaGlmdEtleURvd24iLCJrZXlTdGF0ZSIsIktFWV9TSElGVF9MRUZUIiwidGltZURvd24iLCJhbHRLZXkiLCJpc0FsdEtleSIsImFsdEtleURvd24iLCJLRVlfQUxUX0xFRlQiLCJjdHJsS2V5IiwiaXNDb250cm9sS2V5IiwiY3RybEtleURvd24iLCJLRVlfQ09OVFJPTF9MRUZUIiwibWV0YUtleSIsImlzTWV0YUtleSIsIm1ldGFLZXlEb3duIiwiS0VZX01FVEFfTEVGVCIsIktFWV9TSElGVF9SSUdIVCIsIktFWV9BTFRfUklHSFQiLCJLRVlfQ09OVFJPTF9SSUdIVCIsIk1FVEFfS0VZUyIsInNvbWUiLCJmb3JFYWNoIiwia2V5RG93blN0YXRlQ2hhbmdlZEVtaXR0ZXIiLCJlbWl0Iiwia2V5dXBVcGRhdGUiLCJrZXl1cFVwZGF0ZUFjdGlvbiIsIm1vdmVtZW50S2V5c0Rvd24iLCJpc0FueUtleUluTGlzdERvd24iLCJNT1ZFTUVOVF9LRVlTIiwiZ2V0TGFzdEtleURvd24iLCJfbGFzdEtleURvd24iLCJpc0tleURvd24iLCJpc0VuZ2xpc2hLZXlEb3duIiwiZ2V0S2V5c0Rvd24iLCJPYmplY3QiLCJrZXlzIiwiZ2V0RW5nbGlzaEtleXNEb3duIiwiZW5nbGlzaEtleVNldCIsIlNldCIsImVuZ2xpc2hLZXkiLCJhZGQiLCJrZXlMaXN0IiwiaSIsImxlbmd0aCIsImFyZUtleXNEb3duIiwia2V5c0Rvd24iLCJhcmVLZXlzRXhjbHVzaXZlbHlEb3duIiwia2V5U3RhdGVLZXlzIiwib25seUtleUxpc3REb3duIiwiaW5pdGlhbEtleSIsImtleXNUb0NoZWNrIiwiaXNNb2RpZmllcktleSIsIk1PRElGSUVSX0tFWV9UT19DT0RFX01BUCIsImdldCIsIl8iLCJpbnRlcnNlY3Rpb24iLCJhcmVLZXlzRG93bldpdGhvdXRFeHRyYU1vZGlmaWVycyIsIk1PRElGSUVSX0tFWV9DT0RFUyIsIm1vZGlmaWVyS2V5IiwiaW5jbHVkZXMiLCJrZXlzQXJlRG93biIsImVudGVyS2V5RG93biIsIktFWV9FTlRFUiIsIlNISUZUX0tFWVMiLCJBTFRfS0VZUyIsIkNPTlRST0xfS0VZUyIsInRpbWVEb3duRm9yS2V5IiwiY2xlYXJTdGF0ZSIsInNraXBOb3RpZnkiLCJzdGVwIiwiZHQiLCJtcyIsImF0dGFjaFRvV2luZG93IiwiYXR0YWNoZWRUb0RvY3VtZW50IiwiZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIiLCJldmVudCIsImRvY3VtZW50S2V5dXBMaXN0ZW5lciIsImRvY3VtZW50Qmx1ckxpc3RlbmVyIiwiYWRkTGlzdGVuZXJzVG9Eb2N1bWVudCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJjYXB0dXJlIiwiZG9jdW1lbnQiLCJsb2FkTGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic2V0RW5hYmxlZCIsIl9lbmFibGVkIiwiaXNFbmFibGVkIiwiZGV0YWNoRnJvbURvY3VtZW50IiwiZGlzcG9zZSIsImRpc3Bvc2VLZXlTdGF0ZVRyYWNrZXIiLCJvcHRpb25zIiwia2V5ZG93bkVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiS2V5Ym9hcmRFdmVudCIsImtleXVwRW1pdHRlciIsInBoZXRpb1BsYXliYWNrIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibmFtZSIsInBoZXRpb1R5cGUiLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIm1hYyIsInN0ZXBMaXN0ZW5lciIsImJpbmQiLCJhZGRMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUVELE9BQU9BLGFBQWEsOEJBQThCO0FBQ2xELE9BQU9DLGVBQWUsZ0NBQWdDO0FBRXRELE9BQU9DLGNBQWMsb0NBQW9DO0FBRXpELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFFOUQsU0FBdUNDLHNCQUFzQixFQUFFQyx3QkFBd0IsRUFBRUMsT0FBTyxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFpQmhKLElBQUEsQUFBTUMsa0JBQU4sTUFBTUE7SUEySUo7Ozs7Ozs7R0FPQyxHQUNELEFBQU9DLGNBQWVDLFFBQXVCLEVBQVM7UUFDcEQsSUFBSSxDQUFDQyxPQUFPLElBQUksSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ0MsT0FBTyxDQUFFSDtJQUNwRDtJQUVBOzs7R0FHQyxHQUNELEFBQVFJLG9CQUFxQkosUUFBdUIsRUFBUztRQUMzRCxNQUFNSyxNQUFNVCxjQUFjVSxZQUFZLENBQUVOO1FBQ3hDTyxVQUFVQSxPQUFRRixLQUFLO1FBRXZCLElBQUlHLFVBQVU7UUFFZCx3Q0FBd0M7UUFDeEMsSUFBS1IsU0FBU1MsUUFBUSxJQUFJLENBQUNiLGNBQWNjLFVBQVUsQ0FBRVYsYUFBYyxDQUFDLElBQUksQ0FBQ1csWUFBWSxFQUFHO1lBQ3RGSCxVQUFVQSxXQUFXLENBQUMsSUFBSSxDQUFDSSxRQUFRLENBQUVoQixjQUFjaUIsY0FBYyxDQUFFO1lBQ25FLElBQUksQ0FBQ0QsUUFBUSxDQUFFaEIsY0FBY2lCLGNBQWMsQ0FBRSxHQUFHO2dCQUM5Q1IsS0FBS0E7Z0JBQ0xTLFVBQVUsRUFBRSxRQUFRO1lBQ3RCO1FBQ0Y7UUFDQSxJQUFLZCxTQUFTZSxNQUFNLElBQUksQ0FBQ25CLGNBQWNvQixRQUFRLENBQUVoQixhQUFjLENB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