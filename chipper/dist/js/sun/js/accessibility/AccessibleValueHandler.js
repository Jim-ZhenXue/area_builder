// Copyright 2019-2024, University of Colorado Boulder
/**
 * A trait for subtypes of Node. Meant for Nodes with a value that "run" on a NumberProperty and handles formatting,
 * mapping, and aria-valuetext updating in the PDOM.
 *
 * Also implements the listeners that respond to accessible input, such as keydown, keyup, input, and change
 * events, which may come from a keyboard or other assistive device. Use getAccessibleValueHandlerInputListener() to get
 * these listeners to add to your Node with addInputListener().
 *
 * Browsers have limitations for the interaction of a slider when the range is not evenly divisible by the step size.
 * Rather than allow the browser to natively change the valueProperty with an input event, this trait implements a
 * totally custom interaction keeping the general slider behavior the same.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import DynamicProperty from '../../../axon/js/DynamicProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import platform from '../../../phet-core/js/platform.js';
import { animatedPanZoomSingleton, DelayedMutate, eventCodeToEnglishString, HotkeyData, KeyboardUtils, PDOMUtils, Voicing } from '../../../scenery/js/imports.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import sun from '../sun.js';
import AccessibleValueHandlerHotkeyDataCollection from './AccessibleValueHandlerHotkeyDataCollection.js';
// constants
const DEFAULT_TAG_NAME = 'input';
const toString = (v)=>`${v}`;
// Options for the Voicing response that happens at the end of
const DEFAULT_VOICING_ON_END_RESPONSE_OPTIONS = {
    withNameResponse: false,
    withObjectResponse: true,
    onlyOnValueChange: true // no response if value did not change
};
const ACCESSIBLE_VALUE_HANDLER_OPTIONS = [
    'startInput',
    'endInput',
    'onInput',
    'constrainValue',
    'keyboardStep',
    'shiftKeyboardStep',
    'pageKeyboardStep',
    'ariaOrientation',
    'panTargetNode',
    'roundToStepSize',
    'pdomMapPDOMValue',
    'pdomMapValue',
    'pdomRepeatEqualValueText',
    'pdomCreateAriaValueText',
    'pdomCreateContextResponseAlert',
    'contextResponsePerValueChangeDelay',
    'contextResponseMaxDelay',
    'pdomDependencies',
    'voicingOnEndResponseOptions'
];
/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */ const AccessibleValueHandler = (Type, optionsArgPosition)=>{
    const AccessibleValueHandlerClass = DelayedMutate('AccessibleValueHandler', ACCESSIBLE_VALUE_HANDLER_OPTIONS, class AccessibleValueHandler extends Voicing(Type) {
        set startInput(value) {
            this._startInput = value;
        }
        get startInput() {
            return this._startInput;
        }
        set onInput(value) {
            this._onInput = value;
        }
        get onInput() {
            return this._onInput;
        }
        set endInput(value) {
            this._endInput = value;
        }
        get endInput() {
            return this._endInput;
        }
        set constrainValue(value) {
            // NOTE: Not currently re-constraining the value on set, since hopefully other things are doing this action.
            // If that's not done, we should do something about it here.
            this._constrainValue = value;
        }
        get constrainValue() {
            return this._constrainValue;
        }
        set panTargetNode(value) {
            this._panTargetNode = value;
        }
        get panTargetNode() {
            return this._panTargetNode;
        }
        set roundToStepSize(value) {
            this._roundToStepSize = value;
        }
        get roundToStepSize() {
            return this._roundToStepSize;
        }
        set pdomMapPDOMValue(value) {
            this._pdomMapPDOMValue = value;
            this.invalidateEnabledRange(this._enabledRangeProperty.value);
            this.invalidateValueProperty();
            this.invalidateAriaValueText();
        }
        get pdomMapPDOMValue() {
            return this._pdomMapPDOMValue;
        }
        set pdomMapValue(value) {
            this._pdomMapValue = value;
        }
        get pdomMapValue() {
            return this._pdomMapValue;
        }
        set pdomRepeatEqualValueText(value) {
            this._pdomRepeatEqualValueText = value;
            this.invalidateAriaValueText();
        }
        get pdomRepeatEqualValueText() {
            return this._pdomRepeatEqualValueText;
        }
        set pdomCreateAriaValueText(value) {
            this._pdomCreateAriaValueText = value;
            this.invalidateAriaValueText();
        }
        get pdomCreateAriaValueText() {
            return this._pdomCreateAriaValueText;
        }
        set pdomCreateContextResponseAlert(value) {
            this._pdomCreateContextResponseAlert = value;
        }
        get pdomCreateContextResponseAlert() {
            return this._pdomCreateContextResponseAlert;
        }
        set contextResponsePerValueChangeDelay(value) {
            this._contextResponsePerValueChangeDelay = value;
        }
        get contextResponsePerValueChangeDelay() {
            return this._contextResponsePerValueChangeDelay;
        }
        set contextResponseMaxDelay(value) {
            this._contextResponseMaxDelay = value;
        }
        get contextResponseMaxDelay() {
            return this._contextResponseMaxDelay;
        }
        set voicingOnEndResponseOptions(value) {
            this._voicingOnEndResponseOptions = value;
        }
        get voicingOnEndResponseOptions() {
            return this._voicingOnEndResponseOptions;
        }
        invalidateAriaValueText() {
            this._updateAriaValueText(this._oldValue);
            this._oldValue = this._valueProperty.value;
        }
        invalidateEnabledRange(enabledRange) {
            const mappedMin = this._getMappedValue(enabledRange.min);
            const mappedMax = this._getMappedValue(enabledRange.max);
            // pdom - update enabled slider range for AT, required for screen reader events to behave correctly
            this.setPDOMAttribute('min', mappedMin);
            this.setPDOMAttribute('max', mappedMax);
            // update the step attribute slider element - this attribute is only added because it is required to
            // receive accessibility events on all browsers, and is totally separate from the step values above that
            // will modify the valueProperty. See function for more information.
            this._updateSiblingStepAttribute();
        }
        invalidateValueProperty() {
            const mappedValue = this._getMappedValue();
            // set the aria-valuenow attribute in case the AT requires it to read the value correctly, some may
            // fall back on this from aria-valuetext see
            // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-valuetext_attribute#Possible_effects_on_user_agents_and_assistive_technology
            this.setPDOMAttribute('aria-valuenow', mappedValue);
            // update the PDOM input value on Property change
            this.inputValue = mappedValue;
        }
        invalidatePDOMDependencies() {
            // dispose the previous multilink, there is only one set of dependencies, though they can be overwritten.
            this._dependenciesMultilink && this._dependenciesMultilink.dispose();
            this._dependenciesMultilink = Multilink.multilinkAny(this._pdomDependencies.concat([
                this._valueProperty
            ]), this._pdomValueTextUpdateListener);
        }
        /**
       * There are some features of AccessibleValueHandler that support updating when more than just the valueProperty
       * changes. Use this method to set the dependency Properties for this value handler. This will blow away the
       * previous list (like Node.children).
       */ setPDOMDependencies(dependencies) {
            assert && assert(!dependencies.includes(this._valueProperty), 'The value Property is already a dependency, and does not need to be added to this list');
            this._pdomDependencies = dependencies;
            this.invalidatePDOMDependencies();
        }
        getPDOMDependencies() {
            return this._pdomDependencies;
        }
        set pdomDependencies(value) {
            this.setPDOMDependencies(value);
        }
        get pdomDependencies() {
            return this.getPDOMDependencies();
        }
        _updateAriaValueText(oldPropertyValue) {
            const mappedValue = this._getMappedValue();
            // create the dynamic aria-valuetext from pdomCreateAriaValueText.
            const newAriaValueTextValueType = this._pdomCreateAriaValueText(mappedValue, this._valueProperty.value, oldPropertyValue);
            let newAriaValueText = PDOMUtils.unwrapStringProperty(newAriaValueTextValueType);
            // eslint-disable-next-line phet/no-simple-type-checking-assertions
            assert && assert(typeof newAriaValueText === 'string');
            // Make sure that the new aria-valuetext is different from the previous one, so that if they are the same
            // the screen reader will still read the new text - adding a hairSpace registers as a new string, but the
            // screen reader won't read that character.
            const hairSpace = '\u200A';
            if (this._pdomRepeatEqualValueText && this.ariaValueText && newAriaValueText === this.ariaValueText.replace(new RegExp(hairSpace, 'g'), '')) {
                newAriaValueText = this.ariaValueText + hairSpace;
            }
            this.ariaValueText = newAriaValueText;
        }
        /**
       * If generating an alert when the user changes the slider value, create the alert content and send it
       * to the utteranceQueue. For VoiceOver, it is important that if the value is changed multiple times before
       * the alert can be spoken, we provide more time for the AT to finish speaking aria-valuetext. Otherwise, the
       * alert may be lost. See https://github.com/phetsims/gravity-force-lab-basics/issues/146.
       */ alertContextResponse() {
            // Alerting will occur to each connected display's UtteranceQueue, but we should only increment delay once per
            // time this function is called.
            let timesChangedBeforeAlertingIncremented = false;
            if (this._pdomCreateContextResponseAlert) {
                const mappedValue = this._getMappedValue();
                const endInteractionAlert = this._pdomCreateContextResponseAlert(mappedValue, this._valueProperty.value, this._valueOnStart);
                // only if it returned an alert
                if (endInteractionAlert) {
                    this._contextResponseUtterance.alert = endInteractionAlert;
                    this.forEachUtteranceQueue((utteranceQueue)=>{
                        // Only increment a single time, this has the constraint that if different utteranceQueues move this
                        // alert through at a different time, the delay could be inconsistent, but in general it should work well.
                        if (timesChangedBeforeAlertingIncremented) {
                        // use the current value for this._timesChangedBeforeAlerting
                        } else if (utteranceQueue.hasUtterance(this._contextResponseUtterance)) {
                            timesChangedBeforeAlertingIncremented = true;
                            this._timesChangedBeforeAlerting++;
                        } else {
                            this._timesChangedBeforeAlerting = 1;
                        }
                        // Adjust the delay of the utterance based on number of times it has been re-added to the queue. Each
                        // time the aria-valuetext changes, this method is called, we want to make sure to give enough time for the
                        // aria-valuetext to fully complete before alerting this context response.
                        this._contextResponseUtterance.alertStableDelay = Math.min(this._contextResponseMaxDelay, this._timesChangedBeforeAlerting * this._contextResponsePerValueChangeDelay);
                        utteranceQueue.addToBack(this._contextResponseUtterance);
                    });
                }
            }
        }
        /**
       * Should be called after the model dependencies have been reset
       */ reset() {
            // reset the aria-valuetext creator if it supports that
            this._pdomCreateAriaValueText.reset && this._pdomCreateAriaValueText.reset();
            this._pdomCreateContextResponseAlert && this._pdomCreateContextResponseAlert.reset && this._pdomCreateContextResponseAlert.reset();
            this._timesChangedBeforeAlerting = 0;
            // on reset, make sure that the PDOM descriptions are completely up to date.
            this._updateAriaValueText(null);
        }
        /**
       * get the formatted value based on the current value of the Property.
       * @param [value] - if not provided, will use the current value of the valueProperty
       */ _getMappedValue(value = this._valueProperty.value) {
            return this._pdomMapPDOMValue(value);
        }
        /**
       * Return the input listener that could be attached to mixed in types of AccessibleValueHandler to support
       * interaction.
       */ getAccessibleValueHandlerInputListener() {
            return {
                keydown: this.handleKeyDown.bind(this),
                keyup: this.handleKeyUp.bind(this),
                input: this.handleInput.bind(this),
                change: this.handleChange.bind(this),
                blur: this.handleBlur.bind(this)
            };
        }
        /**
       * Handle a keydown event so that the value handler behaves like a traditional input that modifies
       * a number. We expect the following:
       *   - Up Arrow/Right Arrow increments value by keyboardStep
       *   - Down Arrow/Left Arrow decrements value by step size
       *   - Page up/Page down will increment/decrement value pageKeyboardStep
       *   - Home/End will set value to min/max value for the range
       *   - Pressing shift with an arrow key will increment/decrement value by shiftKeyboardStep
       *
       * Add this as an input listener to the `keydown` event to the Node mixing in AccessibleValueHandler.
       */ handleKeyDown(event) {
            const domEvent = event.domEvent;
            const key = KeyboardUtils.getEventCode(domEvent);
            if (!key) {
                return;
            }
            this._shiftKey = domEvent.shiftKey;
            // if we receive a 'tab' keydown event, do not allow the browser to react to this like a submission and
            // prevent responding to the `input` event
            if (KeyboardUtils.isKeyEvent(domEvent, KeyboardUtils.KEY_TAB)) {
                this._blockInput = true;
            }
            if (this.enabledProperty.get()) {
                const englishKeyString = eventCodeToEnglishString(key);
                // Prevent default so browser doesn't change input value automatically
                if (AccessibleValueHandlerHotkeyDataCollection.isRangeKey(englishKeyString)) {
                    // This should prevent any "change" and "input" events so we don't change the value twice, but it also
                    // prevents a VoiceOver issue where pressing arrow keys both changes the slider value AND moves the
                    // virtual cursor. This needs to be done every range key event so that we don't change the value with
                    // an 'input' or 'change' event, even when the meta key is down.
                    domEvent.preventDefault();
                    // On Mac, we don't get a keyup event when the meta key is down so don't change the value or do
                    // anything that assumes we will get a corresponding keyup event, see
                    // https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
                    if (!domEvent.metaKey) {
                        // signify that this listener is reserved for dragging so that other listeners can change
                        // their behavior during scenery event dispatch
                        event.pointer.reserveForKeyboardDrag();
                        // whether we will use constrainValue to modify the proposed value, see usages below
                        let useConstrainValue = true;
                        // if this is the first keydown this is the start of the drag interaction
                        if (!this._anyKeysDown()) {
                            this._onInteractionStart(event);
                        }
                        // track that a new key is being held down
                        this._rangeKeysDown[key] = true;
                        let newValue = this._valueProperty.get();
                        if (HotkeyData.anyHaveKeyStroke([
                            AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA,
                            AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA
                        ], englishKeyString)) {
                            // on 'end' and 'home' snap to max and min of enabled range respectively (this is typical browser
                            // behavior for sliders)
                            if (AccessibleValueHandlerHotkeyDataCollection.END_HOTKEY_DATA.hasKeyStroke(englishKeyString)) {
                                newValue = this._enabledRangeProperty.get().max;
                            } else if (AccessibleValueHandlerHotkeyDataCollection.HOME_HOTKEY_DATA.hasKeyStroke(englishKeyString)) {
                                newValue = this._enabledRangeProperty.get().min;
                            }
                        } else {
                            let stepSize;
                            if (HotkeyData.anyHaveKeyStroke([
                                AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA,
                                AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA
                            ], englishKeyString)) {
                                // on page up and page down, the default step size is 1/10 of the range (this is typical browser behavior)
                                stepSize = this.pageKeyboardStep;
                                if (AccessibleValueHandlerHotkeyDataCollection.PAGE_UP_HOTKEY_DATA.hasKeyStroke(englishKeyString)) {
                                    newValue = this._valueProperty.get() + stepSize;
                                } else if (AccessibleValueHandlerHotkeyDataCollection.PAGE_DOWN_HOTKEY_DATA.hasKeyStroke(englishKeyString)) {
                                    newValue = this._valueProperty.get() - stepSize;
                                }
                            } else if (HotkeyData.anyHaveKeyStroke([
                                AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA,
                                AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA,
                                AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA,
                                AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA
                            ], englishKeyString)) {
                                // if the shift key is pressed down, modify the step size (this is atypical browser behavior for sliders)
                                stepSize = domEvent.shiftKey ? this.shiftKeyboardStep : this.keyboardStep;
                                // Temporary workaround, if using shift key with arrow keys to use the shiftKeyboardStep, don't
                                // use constrainValue because the constrainValue is often smaller than the values allowed by
                                // constrainValue. See https://github.com/phetsims/sun/issues/698.
                                useConstrainValue = !domEvent.shiftKey;
                                if (HotkeyData.anyHaveKeyStroke([
                                    AccessibleValueHandlerHotkeyDataCollection.UP_ARROW_HOTKEY_DATA,
                                    AccessibleValueHandlerHotkeyDataCollection.RIGHT_ARROW_HOTKEY_DATA
                                ], englishKeyString)) {
                                    newValue = this._valueProperty.get() + stepSize;
                                } else if (HotkeyData.anyHaveKeyStroke([
                                    AccessibleValueHandlerHotkeyDataCollection.DOWN_ARROW_HOTKEY_DATA,
                                    AccessibleValueHandlerHotkeyDataCollection.LEFT_ARROW_HOTKEY_DATA
                                ], englishKeyString)) {
                                    newValue = this._valueProperty.get() - stepSize;
                                }
                                if (this._roundToStepSize) {
                                    newValue = roundValue(newValue, this._valueProperty.get(), stepSize);
                                }
                            }
                        }
                        // Map the value.
                        const mappedValue = this._pdomMapValue(newValue, this._valueProperty.get());
                        // Optionally constrain the value. Only constrain if modifying by shiftKeyboardStep because that step size
                        // may allow finer precision than constrainValue. This is a workaround for
                        // https://github.com/phetsims/sun/issues/698, and is actually a problem for all keyboard steps if they
                        // are smaller than values allowed by constrainValue. In https://github.com/phetsims/sun/issues/703 we
                        // will work to resolve this more generally.
                        let constrainedValue = mappedValue;
                        if (useConstrainValue) {
                            constrainedValue = this._constrainValue(mappedValue);
                        }
                        // limit the value to the enabled range
                        this._valueProperty.set(Utils.clamp(constrainedValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max));
                        // optional callback after the valueProperty is set (even if set to the same value) so that the listener
                        // can use the new value.
                        this._onInput(event, this._valueOnStart);
                        // after any keyboard input, make sure that the Node stays in view
                        const panTargetNode = this._panTargetNode || this;
                        animatedPanZoomSingleton.initialized && animatedPanZoomSingleton.listener.panToNode(panTargetNode, true, panTargetNode.limitPanDirection);
                    }
                }
            }
        }
        /**
       * Handle key up event on this accessible slider, managing the shift key, and calling an optional endDrag
       * function on release. Add this as an input listener to the node mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */ handleKeyUp(event) {
            const code = KeyboardUtils.getEventCode(event.domEvent);
            const englishKeyString = eventCodeToEnglishString(code);
            // handle case where user tabbed to this input while an arrow key might have been held down
            if (this._allKeysUp()) {
                return;
            }
            // reset shift key flag when we release it
            if (AccessibleValueHandlerHotkeyDataCollection.SHIFT_HOTKEY_DATA.hasKeyStroke(englishKeyString)) {
                this._shiftKey = false;
            }
            if (this.enabledProperty.get()) {
                if (AccessibleValueHandlerHotkeyDataCollection.isRangeKey(englishKeyString)) {
                    this._rangeKeysDown[code] = false;
                    // when all range keys are released, we are done dragging
                    if (this._allKeysUp()) {
                        this._onInteractionEnd(event);
                    }
                }
            }
        }
        /**
       * VoiceOver sends a "change" event to the slider (NOT an input event), so we need to handle the case when
       * a change event is sent but an input event ins't handled. Guarded against the case that BOTH change and
       * input are sent to the browser by the AT.
       *
       * Add this as a listener to the 'change' input event on the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */ handleChange(event) {
            if (!this._pdomInputHandled) {
                this.handleInput(event);
            }
            this._pdomInputHandled = false;
        }
        /**
       * Handle a direct 'input' event that might come from assistive technology. It is possible that the user agent
       * (particularly VoiceOver, or a switch device) will initiate an input event directly without going through
       * keydown. In that case, handle the change depending on which direction the user tried to go. We determine
       * this by detecting how the input value changed in response to the `input` event relative to the current
       * value of the valueProperty.
       *
       * Note that it is important to handle the "input" event, rather than the "change" event. The "input" will
       * fire when the value changes from a gesture, while the "change" will only happen on submission, like as
       * navigating away from the element.
       *
       * Add this as a listener to the `input` event on the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */ handleInput(event) {
            if (this.enabledProperty.get() && !this._blockInput) {
                // don't handle again on "change" event
                this._pdomInputHandled = true;
                let newValue = this._valueProperty.get();
                const inputValue = parseFloat(event.domEvent.target.value);
                const stepSize = this._shiftKey ? this.shiftKeyboardStep : this.keyboardStep;
                const mappedValue = this._getMappedValue();
                // start of change event is start of drag
                this._onInteractionStart(event);
                if (inputValue > mappedValue) {
                    newValue = this._valueProperty.get() + stepSize;
                } else if (inputValue < mappedValue) {
                    newValue = this._valueProperty.get() - stepSize;
                }
                if (this._roundToStepSize) {
                    newValue = roundValue(newValue, this._valueProperty.get(), stepSize);
                }
                // limit to enabled range
                newValue = Utils.clamp(newValue, this._enabledRangeProperty.get().min, this._enabledRangeProperty.get().max);
                // optionally constrain value
                this._valueProperty.set(this._constrainValue(this._pdomMapValue(newValue, this._valueProperty.get())));
                // only one change per input, but still call optional onInput function - after valueProperty is set (even if
                // set to the same value) so listener can use new value.
                this._onInput(event, this._valueOnStart);
                // end of change is the end of a drag
                this._onInteractionEnd(event);
            }
            // don't block the next input after receiving one, some AT may send either `keydown` or `input` events
            // depending on modifier keys so we need to be ready to receive either on next interaction
            this._blockInput = false;
        }
        /**
       * Fires when the accessible slider loses focus.
       *
       * Add this as a listener on the `blur` event to the Node that is mixing in AccessibleValueHandler.
       * @mixin-protected - made public for use in the mixin only
       */ handleBlur(event) {
            // if any range keys are currently down, call end drag because user has stopped dragging to do something else
            if (this._anyKeysDown()) {
                this._onInteractionEnd(event);
            }
            // reset flag in case we shift-tabbed away from slider
            this._shiftKey = false;
            // when focus leaves this element stop blocking input events
            this._blockInput = false;
            // reset counter for range keys down
            this._rangeKeysDown = {};
        }
        /**
       * Interaction with this input has started, save the value on start so that it can be used as an "old" value
       * when generating the context response with option pdomCreateContextResponse.
       */ _onInteractionStart(event) {
            assert && assert(!this._pdomPointer, 'Pointer should have been cleared and detached on end or interrupt.');
            this._pdomPointer = event.pointer;
            assert && assert(this._pdomPointer.attachedListener !== this._pdomPointerListener, 'This pointer listener was never removed!');
            this._pdomPointer.addInputListener(this._pdomPointerListener, true);
            this._valueOnStart = this._valueProperty.value;
            this._startInput(event);
        }
        /**
       * Interaction with this input has completed, generate an utterance describing changes if necessary and call
       * optional "end" function.
       *
       * @param [event] - Event is not guaranteed because we need to support interruption
       */ _onInteractionEnd(event) {
            // It is possible that interaction already ended. This can happen if the pointer is interrupted just before
            // receiving a keyup event. This is a rare case and should only be possible while fuzzing.
            if (this._pdomPointer) {
                this.alertContextResponse();
                this.voicingOnEndResponse(this._valueOnStart);
                this._endInput(event);
                // detach the pointer listener that was attached on keydown
                assert && assert(this._pdomPointer.attachedListener === this._pdomPointerListener, 'pointer listener should be attached');
                this._pdomPointer.removeInputListener(this._pdomPointerListener);
                this._pdomPointer = null;
            }
        }
        /**
       * Set the delta for the value Property when using arrow keys to interact with the Node.
       */ setKeyboardStep(keyboardStep) {
            assert && assert(keyboardStep >= 0, 'keyboard step must be non-negative');
            this._keyboardStep = keyboardStep;
        }
        set keyboardStep(keyboardStep) {
            this.setKeyboardStep(keyboardStep);
        }
        get keyboardStep() {
            return this.getKeyboardStep();
        }
        /**
       * Get the delta for value Property when using arrow keys.
       */ getKeyboardStep() {
            return this._keyboardStep;
        }
        /**
       * Set the delta for value Property when using arrow keys with shift to interact with the Node.
       */ setShiftKeyboardStep(shiftKeyboardStep) {
            assert && assert(shiftKeyboardStep >= 0, 'shift keyboard step must be non-negative');
            this._shiftKeyboardStep = shiftKeyboardStep;
        }
        set shiftKeyboardStep(shiftKeyboardStep) {
            this.setShiftKeyboardStep(shiftKeyboardStep);
        }
        get shiftKeyboardStep() {
            return this.getShiftKeyboardStep();
        }
        /**
       * Get the delta for value Property when using arrow keys with shift to interact with the Node.
       */ getShiftKeyboardStep() {
            return this._shiftKeyboardStep;
        }
        /**
       * Returns whether the shift key is currently held down on this slider, changing the size of step.
       */ getShiftKeyDown() {
            return this._shiftKey;
        }
        get shiftKeyDown() {
            return this.getShiftKeyDown();
        }
        /**
       * Set the delta for value Property when using page up/page down to interact with the Node.
       */ setPageKeyboardStep(pageKeyboardStep) {
            assert && assert(pageKeyboardStep >= 0, 'page keyboard step must be non-negative');
            this._pageKeyboardStep = pageKeyboardStep;
        }
        set pageKeyboardStep(pageKeyboardStep) {
            this.setPageKeyboardStep(pageKeyboardStep);
        }
        get pageKeyboardStep() {
            return this.getPageKeyboardStep();
        }
        /**
       * Get the delta for value Property when using page up/page down to interact with the Node.
       */ getPageKeyboardStep() {
            return this._pageKeyboardStep;
        }
        /**
       * Set the orientation for the slider as specified by https://www.w3.org/TR/wai-aria-1.1/#aria-orientation.
       * Depending on the value of this attribute, a screen reader will give different indications about which
       * arrow keys should be used
       */ setAriaOrientation(orientation) {
            this._ariaOrientation = orientation;
            this.setPDOMAttribute('aria-orientation', orientation.ariaOrientation);
        }
        set ariaOrientation(orientation) {
            this.setAriaOrientation(orientation);
        }
        get ariaOrientation() {
            return this._ariaOrientation;
        }
        /**
       * Get the orientation of the accessible slider, see setAriaOrientation for information on the behavior of this
       * attribute.
       */ getAriaOrientation() {
            return this._ariaOrientation;
        }
        /**
       * Returns true if all range keys are currently up (not held down).
       */ _allKeysUp() {
            return _.every(this._rangeKeysDown, (entry)=>!entry);
        }
        /**
       * Returns true if any range keys are currently down on this slider. Useful for determining when to call
       * startDrag or endDrag based on interaction.
       */ _anyKeysDown() {
            return !!_.find(this._rangeKeysDown, (entry)=>entry);
        }
        /**
       * Set the `step` attribute on accessible siblings for this Node. Usually, we can use the 'any' value,
       * which means that any value within the range is allowed. However, iOS VoiceOver does not support 'any'
       * so we have to calculate a valid step value for mobile Safari.
       *
       * The step attribute must be non-zero. Only values which are equal to min value plus
       * the basis of step are allowed. In other words, the following must always be true:
       * value = min + n * step where value <= max and n is an integer.
       *
       * If the input value is set to anything else, the result is confusing
       * keyboard behavior and the screen reader will say "Invalid" when the value changes.
       * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
       *
       * This limitation is too restrictive for PhET as many sliders span physical ranges with keyboard steps that
       * are design to be convenient or pedagogically useful. For example, a slider that spans 0.01 to 15 requires
       * a step of 1, but DOM specification would only allow values 0.01, 1.01, 2.01, ...
       *
       * This restriction is why `step` attribute cannot equal keyboardStep of this trait.
       *
       * Also, if the step attribute is too small relative to the entire range of the slider VoiceOver doesn't allow
       * any input events because...VoiceOver is just interesting like that.
       *
       * Current workaround for all of this is to set the step size to support the precision of the value required
       * by the client so that all values are allowed. If we encounter the VoiceOver case described above we fall
       * back to setting the step size at 1/100th of the max value since the keyboard step generally evenly divides
       * the max value rather than the full range.
       *
       * See the following issues for history:
       * https://github.com/phetsims/sun/issues/413
       * https://github.com/phetsims/sun/issues/873
       */ _updateSiblingStepAttribute() {
            let stepValue = 'any';
            // TODO: Remove when iOS Safari supports the 'any', see https://github.com/phetsims/a11y-research/issues/191
            if (platform.mobileSafari) {
                const smallestStep = Math.min(this.keyboardStep, this.shiftKeyboardStep, this.pageKeyboardStep);
                stepValue = Math.pow(10, -Utils.numberOfDecimalPlaces(smallestStep));
                const mappedMin = this._getMappedValue(this._enabledRangeProperty.get().min);
                const mappedMax = this._getMappedValue(this._enabledRangeProperty.get().max);
                const mappedLength = mappedMax - mappedMin;
                // If the step is too small relative to full range for VoiceOver to receive input, fall back to a portion of
                // the max value as a workaround.
                if (stepValue / mappedLength < 1e-5) {
                    stepValue = mappedMax / 100;
                    // Limit the precision of the calculated value.  This is necessary because otherwise floating point
                    // inaccuracies can lead to problematic behaviors with screen readers,
                    // see https://github.com/phetsims/greenhouse-effect/issues/388. The number of significant digits was chosen
                    // somewhat arbitrarily.
                    stepValue = Number(stepValue.toPrecision(8));
                }
            }
            this.setPDOMAttribute('step', stepValue);
        }
        /**
       * Call this to trigger the voicing response spoken when an interaction ends. Will speak the current
       * name and object responses (according to options). Set those responses of Voicing.ts to hear up-to-date
       * Voicing responses at the end of an interaction.
       *
       * @param valueOnStart - Property value at the start of the interaction.
       * @param providedOptions
       */ voicingOnEndResponse(valueOnStart, providedOptions) {
            const options = combineOptions({}, this._voicingOnEndResponseOptions, providedOptions);
            const valueChanged = valueOnStart !== this._valueProperty.value;
            const valueAtMinMax = this._valueProperty.value === this._enabledRangeProperty.value.min || this._valueProperty.value === this._enabledRangeProperty.value.max;
            // content required to speak a response and add to back of UtteranceQueue.
            const responseContentExists = !!(options.withNameResponse && this.voicingNameResponse) || !!(options.withObjectResponse && this.voicingObjectResponse);
            const shouldSpeak = (!options.onlyOnValueChange || // speak each time if onlyOnValueChange is false.
            valueAtMinMax || // always speak at edges, for "go beyond" responses
            valueChanged) && // If the value changed
            responseContentExists;
            shouldSpeak && this.voicingSpeakFullResponse({
                nameResponse: options.withNameResponse ? this.voicingNameResponse : null,
                objectResponse: options.withObjectResponse ? this.voicingObjectResponse : null,
                hintResponse: null // no hint, there was just a successful interaction
            });
        }
        dispose() {
            this._disposeAccessibleValueHandler();
            super.dispose();
        }
        constructor(...args){
            const providedOptions = args[optionsArgPosition];
            assert && assert(providedOptions, 'providedOptions has required options');
            assert && assert(providedOptions.enabledRangeProperty, 'enabledRangeProperty is a required option');
            assert && assert(providedOptions.valueProperty, 'valueProperty is a required option');
            assert && providedOptions && assert(!providedOptions.hasOwnProperty('tagName') || providedOptions.tagName === null, 'AccessibleValueHandler sets its own tagName. Only provide tagName to clear accessible content from the PDOM');
            // cannot be set by client
            assert && providedOptions && assert(!providedOptions.hasOwnProperty('inputType'), 'AccessibleValueHandler sets its own inputType.');
            // if rounding to keyboard step, keyboardStep must be defined so values aren't skipped and the slider
            // doesn't get stuck while rounding to the nearest value, see https://github.com/phetsims/sun/issues/410
            if (assert && providedOptions && providedOptions.roundToStepSize) {
                assert(providedOptions.keyboardStep, 'rounding to keyboardStep, define appropriate keyboardStep to round to');
            }
            // Override options
            args[optionsArgPosition] = optionize()({
                // @ts-expect-error - TODO: we should be able to have the public API be just null, and internally set to string, Limitation (IV), see https://github.com/phetsims/phet-core/issues/128
                tagName: DEFAULT_TAG_NAME,
                // parent options that we must provide a default to use
                inputType: 'range'
            }, providedOptions);
            super(...args), this._startInput = _.noop, this._onInput = _.noop, this._endInput = _.noop, this._constrainValue = _.identity, this._pdomMapValue = _.identity, this._panTargetNode = null, this._ariaOrientation = Orientation.HORIZONTAL, this._shiftKey = false, this._pdomDependencies = [], // track previous values for callbacks outside of Property listeners
            this._oldValue = null, this._pdomCreateContextResponseAlert = null, // The utterance sent to the utteranceQueue when the value changes, alert content generated by
            // optional pdomCreateContextResponseAlert. The alertStableDelay on this utterance will increase if the input
            // receives many interactions before the utterance can be announced so that VoiceOver has time to read the
            // aria-valuetext (object response) before the alert (context response).
            this._contextResponseUtterance = new Utterance(), // Number of times the input has changed in value before the utterance made was able to be spoken, only applicable
            // if using pdomCreateContextResponseAlert
            this._timesValueTextChangedBeforeAlerting = 0, // in ms, see options for documentation.
            this._contextResponsePerValueChangeDelay = 700, this._contextResponseMaxDelay = 1500, // Whether an input event has been handled. If handled, we will not respond to the
            // change event. An AT (particularly VoiceOver) may send a change event (and not an input event) to the
            // browser in response to a user gesture. We need to handle that change event, without also handling the
            // input event in case a device sends both events to the browser.
            this._pdomInputHandled = false, // Some browsers will receive `input` events when the user tabs away from the slider or
            // on some key presses - if we receive a keydown event for a tab key, do not allow input or change events
            this._blockInput = false, // setting to enable/disable rounding to the step size
            this._roundToStepSize = false, // key is the event.code for the range key, value is whether it is down
            this._rangeKeysDown = {}, this._pdomMapPDOMValue = _.identity, this._pdomCreateAriaValueText = toString // by default make sure it returns a string
            , this._dependenciesMultilink = null, this._pdomRepeatEqualValueText = true, // When context responses are supported, this counter is used to determine a mutable delay between hearing the
            // same response.
            this._timesChangedBeforeAlerting = 0, // Options for the Voicing response at the end of interaction with this component.
            this._voicingOnEndResponseOptions = DEFAULT_VOICING_ON_END_RESPONSE_OPTIONS, // At the start of input, a listener is attached to the PDOMPointer to prevent listeners closer to the
            // scene graph root from firing. A reference to the pointer is saved to support interrupt because
            // there is no SceneryEvent.
            this._pdomPointer = null;
            // members of the Node API that are used by this trait
            assertHasProperties(this, [
                'inputValue',
                'setPDOMAttribute'
            ]);
            const valueProperty = providedOptions.valueProperty;
            const enabledRangeProperty = providedOptions.enabledRangeProperty;
            if (providedOptions.reverseAlternativeInput) {
                // A DynamicProperty will invert the value before setting it to the actual valueProperty, and similarly
                // invert if the valueProperty changes externally.
                this._valueProperty = new DynamicProperty(new Property(valueProperty), {
                    bidirectional: true,
                    map: (propertyValue)=>enabledRangeProperty.value.max - propertyValue,
                    inverseMap: (propertyValue)=>enabledRangeProperty.value.max - propertyValue
                });
            } else {
                this._valueProperty = valueProperty;
            }
            this._enabledRangeProperty = enabledRangeProperty;
            this._pdomValueTextUpdateListener = this.invalidateAriaValueText.bind(this);
            // initialized with setters that validate
            this.keyboardStep = (enabledRangeProperty.get().max - enabledRangeProperty.get().min) / 20;
            this.shiftKeyboardStep = (enabledRangeProperty.get().max - enabledRangeProperty.get().min) / 100;
            this.pageKeyboardStep = (enabledRangeProperty.get().max - enabledRangeProperty.get().min) / 10;
            this._valueOnStart = valueProperty.value;
            // be called last, after options have been set to `this`.
            this.invalidatePDOMDependencies();
            // listeners, must be unlinked in dispose
            const enabledRangeObserver = this.invalidateEnabledRange.bind(this);
            this._enabledRangeProperty.link(enabledRangeObserver);
            // when the property changes, be sure to update the accessible input value and aria-valuetext which is read
            // by assistive technology when the value changes
            const valuePropertyListener = this.invalidateValueProperty.bind(this);
            this._valueProperty.link(valuePropertyListener);
            // A listener that will be attached to the pointer to prevent other listeners from attaching.
            this._pdomPointerListener = {
                interrupt: ()=>{
                    this._onInteractionEnd(null);
                }
            };
            this._disposeAccessibleValueHandler = ()=>{
                this._enabledRangeProperty.unlink(enabledRangeObserver);
                this._valueProperty.unlink(valuePropertyListener);
                if (providedOptions.reverseAlternativeInput) {
                    assert && assert(this._valueProperty instanceof DynamicProperty, 'Only a DynamicProperty can be disposed, otherwise this is disposing a Property that AccessibleValueHandler does not have ownership over.');
                    this._valueProperty.dispose();
                }
                this._dependenciesMultilink && this._dependenciesMultilink.dispose();
                this._panTargetNode = null;
                this._pdomDependencies = [];
            };
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ AccessibleValueHandlerClass.prototype._mutatorKeys = ACCESSIBLE_VALUE_HANDLER_OPTIONS.concat(AccessibleValueHandlerClass.prototype._mutatorKeys);
    assert && assert(AccessibleValueHandlerClass.prototype._mutatorKeys.length === _.uniq(AccessibleValueHandlerClass.prototype._mutatorKeys).length, 'duplicate mutator keys in AccessibleValueHandler');
    return AccessibleValueHandlerClass;
};
sun.register('AccessibleValueHandler', AccessibleValueHandler);
/**
 * Round the value to the nearest step size.
 *
 * @param newValue - value to be rounded
 * @param currentValue - current value of the Property associated with this slider
 * @param stepSize - the delta for this manipulation
 */ const roundValue = function(newValue, currentValue, stepSize) {
    let roundValue = newValue;
    if (stepSize !== 0) {
        // round the value to the nearest keyboard step
        roundValue = Utils.roundSymmetric(roundValue / stepSize) * stepSize;
        // go back a step if we went too far due to rounding
        roundValue = correctRounding(roundValue, currentValue, stepSize);
    }
    return roundValue;
};
/**
 * Helper function, it is possible due to rounding to go up or down a step if we have passed the nearest step during
 * keyboard interaction. This function corrects that.
 *
 */ const correctRounding = function(newValue, currentValue, stepSize) {
    let correctedValue = newValue;
    const proposedStep = Math.abs(newValue - currentValue);
    const stepToFar = proposedStep > stepSize;
    // it is possible that proposedStep will be larger than the stepSize but only because of precision
    // constraints with floating point values, don't correct if that is the cases
    const stepsAboutEqual = Utils.equalsEpsilon(proposedStep, stepSize, 1e-14);
    if (stepToFar && !stepsAboutEqual) {
        correctedValue += newValue > currentValue ? -stepSize : stepSize;
    }
    return correctedValue;
};
AccessibleValueHandler.DEFAULT_TAG_NAME = DEFAULT_TAG_NAME;
export default AccessibleValueHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9hY2Nlc3NpYmlsaXR5L0FjY2Vzc2libGVWYWx1ZUhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB0cmFpdCBmb3Igc3VidHlwZXMgb2YgTm9kZS4gTWVhbnQgZm9yIE5vZGVzIHdpdGggYSB2YWx1ZSB0aGF0IFwicnVuXCIgb24gYSBOdW1iZXJQcm9wZXJ0eSBhbmQgaGFuZGxlcyBmb3JtYXR0aW5nLFxuICogbWFwcGluZywgYW5kIGFyaWEtdmFsdWV0ZXh0IHVwZGF0aW5nIGluIHRoZSBQRE9NLlxuICpcbiAqIEFsc28gaW1wbGVtZW50cyB0aGUgbGlzdGVuZXJzIHRoYXQgcmVzcG9uZCB0byBhY2Nlc3NpYmxlIGlucHV0LCBzdWNoIGFzIGtleWRvd24sIGtleXVwLCBpbnB1dCwgYW5kIGNoYW5nZVxuICogZXZlbnRzLCB3aGljaCBtYXkgY29tZSBmcm9tIGEga2V5Ym9hcmQgb3Igb3RoZXIgYXNzaXN0aXZlIGRldmljZS4gVXNlIGdldEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJJbnB1dExpc3RlbmVyKCkgdG8gZ2V0XG4gKiB0aGVzZSBsaXN0ZW5lcnMgdG8gYWRkIHRvIHlvdXIgTm9kZSB3aXRoIGFkZElucHV0TGlzdGVuZXIoKS5cbiAqXG4gKiBCcm93c2VycyBoYXZlIGxpbWl0YXRpb25zIGZvciB0aGUgaW50ZXJhY3Rpb24gb2YgYSBzbGlkZXIgd2hlbiB0aGUgcmFuZ2UgaXMgbm90IGV2ZW5seSBkaXZpc2libGUgYnkgdGhlIHN0ZXAgc2l6ZS5cbiAqIFJhdGhlciB0aGFuIGFsbG93IHRoZSBicm93c2VyIHRvIG5hdGl2ZWx5IGNoYW5nZSB0aGUgdmFsdWVQcm9wZXJ0eSB3aXRoIGFuIGlucHV0IGV2ZW50LCB0aGlzIHRyYWl0IGltcGxlbWVudHMgYVxuICogdG90YWxseSBjdXN0b20gaW50ZXJhY3Rpb24ga2VlcGluZyB0aGUgZ2VuZXJhbCBzbGlkZXIgYmVoYXZpb3IgdGhlIHNhbWUuXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rLCB7IFVua25vd25NdWx0aWxpbmsgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgYXNzZXJ0SGFzUHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0SGFzUHJvcGVydGllcy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB7IGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbiwgRGVsYXllZE11dGF0ZSwgZXZlbnRDb2RlVG9FbmdsaXNoU3RyaW5nLCBIb3RrZXlEYXRhLCBLZXlib2FyZFV0aWxzLCBOb2RlLCBOb2RlT3B0aW9ucywgUERPTVBvaW50ZXIsIFBET01VdGlscywgUERPTVZhbHVlVHlwZSwgU2NlbmVyeUV2ZW50LCBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbiwgVElucHV0TGlzdGVuZXIsIFRWb2ljaW5nLCBWb2ljaW5nLCBWb2ljaW5nT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5pbXBvcnQgQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uIGZyb20gJy4vQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBERUZBVUxUX1RBR19OQU1FID0gJ2lucHV0JztcbmNvbnN0IHRvU3RyaW5nID0gKCB2OiBJbnRlbnRpb25hbEFueSApID0+IGAke3Z9YDtcblxuLy8gT3B0aW9ucyBmb3IgdGhlIFZvaWNpbmcgcmVzcG9uc2UgdGhhdCBoYXBwZW5zIGF0IHRoZSBlbmQgb2ZcbmNvbnN0IERFRkFVTFRfVk9JQ0lOR19PTl9FTkRfUkVTUE9OU0VfT1BUSU9OUyA9IHtcbiAgd2l0aE5hbWVSZXNwb25zZTogZmFsc2UsIC8vIG5vIG5lZWQgdG8gcmVwZWF0IHRoZSBuYW1lIGV2ZXJ5IGNoYW5nZVxuICB3aXRoT2JqZWN0UmVzcG9uc2U6IHRydWUsIC8vIHJlc3BvbnNlIGZvciB0aGUgbmV3IHZhbHVlXG4gIG9ubHlPblZhbHVlQ2hhbmdlOiB0cnVlIC8vIG5vIHJlc3BvbnNlIGlmIHZhbHVlIGRpZCBub3QgY2hhbmdlXG59O1xuXG4vLyBTaWduYXR1cmUgZm9yIHRoZSBvbklucHV0IGNhbGwuIFNlZSBvcHRpb25zIGZvciBkb2N1bWVudGF0aW9uLlxudHlwZSBPbklucHV0RnVuY3Rpb24gPSAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQsIG9sZFZhbHVlOiBudW1iZXIgKSA9PiB2b2lkO1xuXG50eXBlIENyZWF0ZVRleHRGdW5jdGlvbiA9IHtcblxuICAvKipcbiAgICogQHBhcmFtIHBkb21NYXBwZWRWYWx1ZSAtIHNlZVxuICAgKiBAcGFyYW0gbmV3VmFsdWUgLSB0aGUgbmV3IHZhbHVlLCB1bmZvcm1hdHRlZFxuICAgKiBAcGFyYW0gdmFsdWVPblN0YXJ0IC0gdGhlIHZhbHVlIGF0IHRoZSBzdGFydCBvZiB0aGUgaW50ZXJhY3Rpb24sIHRoZSB2YWx1ZSBvbiBrZXlkb3duIGZvciBwcmVzcyBhbmQgaG9sZFxuICAgKiBAcmV0dXJucyAtIHRleHQvcmVzcG9uc2Uvc3RyaW5nIHRvIGJlIHNldCB0byB0aGUgcHJpbWFyeVNpYmxpbmcsIG51bGwgbWVhbnMgbm90aGluZyB3aWxsIGhhcHBlblxuICAgKiAqL1xuICAoIHBkb21NYXBwZWRWYWx1ZTogbnVtYmVyLCBuZXdWYWx1ZTogbnVtYmVyLCB2YWx1ZU9uU3RhcnQ6IG51bWJlciB8IG51bGwgKTogUERPTVZhbHVlVHlwZSB8IG51bGw7XG5cbiAgLy8gaWYgdGhpcyBmdW5jdGlvbiBuZWVkcyByZXNldHRpbmcsIGluY2x1ZGUgYSBgcmVzZXRgIGZpZWxkIG9uIHRoaXMgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlXG4gIC8vIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgaXMgcmVzZXQuXG4gIHJlc2V0PzogKCkgPT4gdm9pZDtcbn07XG5cbmV4cG9ydCB0eXBlIFZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucyA9IHtcblxuICAvLyBTaG91bGQgdGhlIFZvaWNpbmcgcmVzcG9uc2UgYmUgc3Bva2VuIGlmIHRoZSBpbnRlcmFjdGlvbiBkb2VzIG5vdCBjaGFuZ2UgdGhlIHZhbHVlP1xuICBvbmx5T25WYWx1ZUNoYW5nZT86IGJvb2xlYW47XG5cbiAgLy8gU2hvdWxkIHRoZSBWb2ljaW5nIHJlc3BvbnNlIGluY2x1ZGUgdGhlIG5hbWUgcmVzcG9uc2U/XG4gIHdpdGhOYW1lUmVzcG9uc2U/OiBib29sZWFuO1xuXG4gIC8vIFNob3VsZCB0aGUgVm9pY2luZyByZXNwb25zZSBpbmNsdWRlIHRoZSBvYmplY3QgcmVzcG9uc2U/XG4gIHdpdGhPYmplY3RSZXNwb25zZT86IGJvb2xlYW47XG59O1xuXG4vLyBGdW5jdGlvbiBzaWduYXR1cmUgZm9yIHZvaWNpbmdPbkVuZFJlc3BvbnNlLlxuZXhwb3J0IHR5cGUgVm9pY2luZ09uRW5kUmVzcG9uc2UgPSAoIHZhbHVlT25TdGFydDogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBWb2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMgKSA9PiB2b2lkO1xuXG5jb25zdCBBQ0NFU1NJQkxFX1ZBTFVFX0hBTkRMRVJfT1BUSU9OUzogc3RyaW5nW10gPSBbXG4gICdzdGFydElucHV0JyxcbiAgJ2VuZElucHV0JyxcbiAgJ29uSW5wdXQnLFxuICAnY29uc3RyYWluVmFsdWUnLFxuICAna2V5Ym9hcmRTdGVwJyxcbiAgJ3NoaWZ0S2V5Ym9hcmRTdGVwJyxcbiAgJ3BhZ2VLZXlib2FyZFN0ZXAnLFxuICAnYXJpYU9yaWVudGF0aW9uJyxcbiAgJ3BhblRhcmdldE5vZGUnLFxuICAncm91bmRUb1N0ZXBTaXplJyxcbiAgJ3Bkb21NYXBQRE9NVmFsdWUnLFxuICAncGRvbU1hcFZhbHVlJyxcbiAgJ3Bkb21SZXBlYXRFcXVhbFZhbHVlVGV4dCcsXG4gICdwZG9tQ3JlYXRlQXJpYVZhbHVlVGV4dCcsXG4gICdwZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQnLFxuICAnY29udGV4dFJlc3BvbnNlUGVyVmFsdWVDaGFuZ2VEZWxheScsXG4gICdjb250ZXh0UmVzcG9uc2VNYXhEZWxheScsXG4gICdwZG9tRGVwZW5kZW5jaWVzJyxcbiAgJ3ZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucydcbl07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+O1xuICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+O1xuXG4gIC8vIGNhbGxlZCB3aGVuIGlucHV0IGJlZ2lucyBmcm9tIHVzZXIgaW50ZXJhY3Rpb25cbiAgc3RhcnRJbnB1dD86ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHZvaWQ7XG5cbiAgLy8gY2FsbGVkIHdoZW4gaW5wdXQgZW5kcyBmcm9tIHVzZXIgaW50ZXJhY3Rpb25cbiAgZW5kSW5wdXQ/OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgfCBudWxsICkgPT4gdm9pZDtcblxuICAvLyBDYWxsZWQgZXZlcnkgaW5wdXQgZXZlbnQgKGxpa2UgZHJhZyksIGFmdGVyIHRoZSB2YWx1ZVByb3BlcnR5IGhhcyBiZWVuIHVwZGF0ZWQuIFRoZSBvbGRWYWx1ZSBpcyBhdmFpbGFibGUgaW4gdGhlXG4gIC8vIGNhbGxiYWNrIHNvIHRoYXQgeW91IGNhbiBkZXRlcm1pbmUgaWYvaG93IHRoZSB2YWx1ZSBjaGFuZ2VkLlxuICBvbklucHV0PzogT25JbnB1dEZ1bmN0aW9uO1xuXG4gIC8vIENvbnN0cmFpbnMgdGhlIHZhbHVlLCByZXR1cm5pbmcgYSBuZXcgdmFsdWUgZm9yIHRoZSB2YWx1ZVByb3BlcnR5IGluc3RlYWQuIENhbGxlZCBiZWZvcmUgdGhlIHZhbHVlUHJvcGVydHkgaXMgc2V0LlxuICAvLyBTdWJ0eXBlcyBjYW4gdXNlIHRoaXMgZm9yIG90aGVyIGZvcm1zIG9mIGlucHV0IGFzIHdlbGwuXG4gIC8vIEZvciBrZXlib2FyZCBpbnB1dCwgdGhpcyBpcyBvbmx5IGNhbGxlZCB3aGVuIHRoZSBzaGlmdCBrZXkgaXMgTk9UIGRvd24gYmVjYXVzZSBpdCBpcyBvZnRlbiB0aGUgY2FzZSB0aGF0XG4gIC8vIHNoaWZ0S2V5Ym9hcmRTdGVwIGlzIGEgc21hbGxlciBzdGVwIHNpemUgdGhlbiB3aGF0IGlzIGFsbG93ZWQgYnkgY29uc3RyYWluVmFsdWUuXG4gIGNvbnN0cmFpblZhbHVlPzogKCB2YWx1ZTogbnVtYmVyICkgPT4gbnVtYmVyO1xuXG4gIC8vIGRlbHRhIGZvciB0aGUgdmFsdWVQcm9wZXJ0eSBmb3IgZWFjaCBwcmVzcyBvZiB0aGUgYXJyb3cga2V5c1xuICBrZXlib2FyZFN0ZXA/OiBudW1iZXI7XG5cbiAgLy8gZGVsdGEgZm9yIHRoZSB2YWx1ZVByb3BlcnR5IGZvciBlYWNoIHByZXNzIG9mIHRoZSBhcnJvdyBrZXlzIHdoaWxlIHRoZSBzaGlmdCBtb2RpZmllciBpcyBkb3duXG4gIHNoaWZ0S2V5Ym9hcmRTdGVwPzogbnVtYmVyO1xuXG4gIC8vIGRlbHRhIGZvciB0aGUgdmFsdWVQcm9wZXJ0eSBmb3IgZWFjaCBwcmVzcyBvZiBcIlBhZ2UgVXBcIiBhbmQgXCJQYWdlIERvd25cIlxuICBwYWdlS2V5Ym9hcmRTdGVwPzogbnVtYmVyO1xuXG4gIC8vIElmIHRydWUsIGFsdGVybmF0aXZlIGlucHV0IHdpbGwgYmUgJ3JldmVyc2VkJyBzbyB0aGF0IGtleXMgdGhhdCBub3JtYWxseSBpbmNyZWFzZSB0aGUgdmFsdWUgd2lsbCBkZWNyZWFzZSBpdCxcbiAgLy8gYW5kIHZpY2UgdmVyc2EuIFRoaXMgaXMgdXNlZnVsIGZvciBjYXNlcyB3aGVyZSB0aGUgdmFsdWVQcm9wZXJ0eSBoYXMgYW4gaW52ZXJ0ZWQgYmVoYXZpb3IgZnJvbSB0eXBpY2FsIHNsaWRlclxuICAvLyBpbnB1dC4gRm9yIGV4YW1wbGUsIGEga25vYiB0aGF0IG1vdmVzIHRvIHRoZSBsZWZ0IHRvIGluY3JlYXNlIHRoZSB2YWx1ZVByb3BlcnR5LlxuICByZXZlcnNlQWx0ZXJuYXRpdmVJbnB1dD86IGJvb2xlYW47XG5cbiAgLy8gc3BlY2lmeSBvcmllbnRhdGlvbiwgcmVhZCBieSBhc3Npc3RpdmUgdGVjaG5vbG9neVxuICBhcmlhT3JpZW50YXRpb24/OiBPcmllbnRhdGlvbjtcblxuICAvLyBVcG9uIGFjY2Vzc2libGUgaW5wdXQsIHdlIHdpbGwgdHJ5IHRvIGtlZXAgdGhpcyBOb2RlIGluIHZpZXcgb2YgdGhlIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5cbiAgLy8gSWYgbnVsbCwgJ3RoaXMnIGlzIHVzZWQgKHRoZSBOb2RlIG1peGluZyBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyKVxuICBwYW5UYXJnZXROb2RlPzogbnVsbCB8IE5vZGU7XG5cbiAgLy8gV2hlbiBzZXR0aW5nIHRoZSBQcm9wZXJ0eSB2YWx1ZSBmcm9tIHRoZSBQRE9NIGlucHV0LCB0aGlzIG9wdGlvbiBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0b1xuICAvLyByb3VuZCB0aGUgdmFsdWUgdG8gYSBtdWx0aXBsZSBvZiB0aGUga2V5Ym9hcmRTdGVwLiBUaGlzIHdpbGwgb25seSByb3VuZCB0aGUgdmFsdWUgb24gbm9ybWFsIGtleSBwcmVzc2VzLFxuICAvLyByb3VuZGluZyB3aWxsIG5vdCBvY2N1ciBvbiBsYXJnZSBqdW1wcyBsaWtlIHBhZ2UgdXAvcGFnZSBkb3duL2hvbWUvZW5kLlxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvNzJcbiAgcm91bmRUb1N0ZXBTaXplPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogTWFwIHRoZSB2YWx1ZVByb3BlcnR5IHZhbHVlIHRvIGFub3RoZXIgbnVtYmVyIHRoYXQgd2lsbCBiZSByZWFkIGJ5IGFzc2lzdGl2ZSBkZXZpY2VzIG9uXG4gICAqIHZhbHVlUHJvcGVydHkgY2hhbmdlcyBmcm9tIHRoZSBQRE9NIHZhbHVlcy4gVGhpcyBpcyB1c2VkIHRvIHNldCB0aGUgdmFsdWVzIGZvciBhcmlhLXZhbHVldGV4dCBhbmQgdGhlIG9uXG4gICAqIGNoYW5nZSBhbGVydCwgYXMgd2VsbCBhcyB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXMgb24gdGhlIFBET00gaW5wdXQ6XG4gICAqICAgIHZhbHVlXG4gICAqICAgIGFyaWEtdmFsdWVub3dcbiAgICogICAgbWluXG4gICAqICAgIG1heFxuICAgKiAgICBzdGVwXG4gICAqXG4gICAqIEZvciB0aGlzIHJlYXNvbiwgaXQgaXMgaW1wb3J0YW50IHRoYXQgdGhlIG1hcHBlZCBcIm1pblwiIHdvdWxkIG5vdCBiZSBiaWdnZXIgdGhhbiB0aGUgbWFwcGVkIFwibWF4XCIgZnJvbSB0aGVcbiAgICogZW5hYmxlZFJhbmdlUHJvcGVydHkuXG4gICAqXG4gICAqIFRoaXMgbWFwIGlzIHVzZWQgdG8gY29udHJvbCBhdHRyaWJ1dGVzIGluIHRoZSBQRE9NIChub3QgdGhlIHZhbHVlUHJvcGVydHkpLlxuICAgKi9cbiAgcGRvbU1hcFBET01WYWx1ZT86ICggdmFsdWU6IG51bWJlciApID0+IG51bWJlcjtcblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSBjb25zdHJhaW5pbmcgYW5kIHNldHRpbmcgdGhlIFByb3BlcnR5LiBUaGlzIGlzIHVzZWZ1bCBpbiByYXJlIGNhc2VzIHdoZXJlIHRoZSB2YWx1ZSBiZWluZyBzZXRcbiAgICogYnkgQWNjZXNzaWJsZVZhbHVlSGFuZGxlciBtYXkgY2hhbmdlIGJhc2VkIG9uIG91dHNpZGUgbG9naWMuIFRoaXMgaXMgZm9yIG1hcHBpbmcgdmFsdWUgY2hhbmdlcyBmcm9tIGlucHV0IGxpc3RlbmVyc1xuICAgKiBhc3NpZ25lZCBpbiB0aGlzIHR5cGUgKGtleWJvYXJkL2FsdC1pbnB1dCkgdG8gYSBuZXcgdmFsdWUgYmVmb3JlIHRoZSB2YWx1ZSBpcyBzZXQuXG4gICAqXG4gICAqIFRoaXMgbWFwIGlzIHVzZWQgdG8gY29udHJvbCB0aGUgYWN0dWFsIHZhbHVlUHJvcGVydHkuXG4gICAqL1xuICBwZG9tTWFwVmFsdWU/OiAoIG5ld1ZhbHVlOiBudW1iZXIsIHByZXZpb3VzVmFsdWU6IG51bWJlciApID0+IG51bWJlcjtcblxuICAvKipcbiAgICogSWYgdHJ1ZSwgdGhlIGFyaWEtdmFsdWV0ZXh0IHdpbGwgYmUgc3Bva2VuIGV2ZXJ5IHZhbHVlIGNoYW5nZSwgZXZlbiBpZiB0aGUgYXJpYS12YWx1ZXRleHQgZG9lc24ndFxuICAgKiBhY3R1YWxseSBjaGFuZ2UuIEJ5IGRlZmF1bHQsIHNjcmVlbiByZWFkZXJzIHdvbid0IHNwZWFrIGFyaWEtdmFsdWV0ZXh0IGlmIGl0IHJlbWFpbnMgdGhlIHNhbWUgZm9yXG4gICAqIG11bHRpcGxlIHZhbHVlcy5cbiAgICovXG4gIHBkb21SZXBlYXRFcXVhbFZhbHVlVGV4dD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIGFyaWEtdmFsdWV0ZXh0IGNyZWF0aW9uIGZ1bmN0aW9uLCBjYWxsZWQgd2hlbiB0aGUgdmFsdWVQcm9wZXJ0eSBjaGFuZ2VzLlxuICAgKiBUaGlzIHN0cmluZyBpcyByZWFkIGJ5IEFUIGV2ZXJ5IHRpbWUgdGhlIHNsaWRlciB2YWx1ZSBjaGFuZ2VzLiBUaGlzIGlzIG9mdGVuIGNhbGxlZCB0aGUgXCJvYmplY3QgcmVzcG9uc2VcIlxuICAgKiBmb3IgdGhpcyBpbnRlcmFjdGlvbi5cbiAgICovXG4gIHBkb21DcmVhdGVBcmlhVmFsdWVUZXh0PzogQ3JlYXRlVGV4dEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgY29udGVudCBmb3IgYW4gYWxlcnQgdGhhdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHV0dGVyYW5jZVF1ZXVlIHdoZW4gdGhlIHVzZXIgZmluaXNoZXMgaW50ZXJhY3RpbmdcbiAgICogd2l0aCB0aGUgaW5wdXQuIElzIG5vdCBnZW5lcmF0ZWQgZXZlcnkgY2hhbmdlLCBidXQgb24gZXZlcnkgXCJkcmFnXCIgaW50ZXJhY3Rpb24sIHRoaXMgaXMgY2FsbGVkIHdpdGhcbiAgICogZW5kSW5wdXQuIFdpdGggYSBrZXlib2FyZCwgdGhpcyB3aWxsIGJlIGNhbGxlZCBldmVuIHdpdGggbm8gdmFsdWUgY2hhbmdlIChvbiB0aGUga2V5IHVwIGV2ZW50IGVuZGluZyB0aGVcbiAgICogaW50ZXJhY3Rpb24pLCBPbiBhIHRvdWNoIHN5c3RlbSBsaWtlIGlPUyB3aXRoIFZvaWNlIE92ZXIgaG93ZXZlciwgaW5wdXQgYW5kIGNoYW5nZSBldmVudHMgd2lsbCBvbmx5IGZpcmVcbiAgICogd2hlbiB0aGVyZSBpcyBhIFByb3BlcnR5IHZhbHVlIGNoYW5nZSwgc28gXCJlZGdlXCIgYWxlcnRzIHdpbGwgbm90IGZpcmUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3Jhdml0eS1mb3JjZS1sYWItYmFzaWNzL2lzc3Vlcy8xODUuXG4gICAqIFRoaXMgYWxlcnQgaXMgb2Z0ZW4gY2FsbGVkIHRoZSBcImNvbnRleHQgcmVzcG9uc2VcIiBiZWNhdXNlIGl0IGlzIHRpbWVkIHRvIG9ubHkgYWxlcnQgYWZ0ZXIgYW4gaW50ZXJhY3Rpb25cbiAgICogZW5kLCBpbnN0ZWFkIG9mIGVhY2ggdGltZSB0aGUgdmFsdWUgY2hhbmdlcy5cbiAgICpcbiAgICogSWYgZnVuY3Rpb24gcmV0dXJucyBudWxsLCB0aGVuIG5vIGFsZXJ0IHdpbGwgYmUgc2VudCB0byB1dHRlcmFuY2VRdWV1ZSBmb3IgYWxlcnRpbmcuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGFsc28gc3VwcG9ydCBhIGByZXNldGAgZnVuY3Rpb24gb24gaXQsIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyIGlzIHJlc2V0XG4gICAqL1xuICBwZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQ/OiBDcmVhdGVUZXh0RnVuY3Rpb24gfCBudWxsO1xuXG4gIC8vIFRoaXMgY29lZmZpY2llbnQgaXMgbXVsdGlwbGllZCBieSB0aGUgbnVtYmVyIG9mIHRpbWVzIHRoZSB2YWx1ZSBoYXMgYmVlbiBjaGFuZ2VkIHdpdGhvdXQgdGhlIGNvbnRleHQgcmVzcG9uc2VcbiAgLy8gYWxlcnRpbmcuIFRoaXMgbnVtYmVyIGlzIG1lYW50IHRvIGdpdmUgdGhlIHNjcmVlbiByZWFkZXIgZW5vdWdoIGNoYW5jZSB0byBmaW5pc2ggcmVhZGluZyB0aGUgYXJpYS12YWx1ZXRleHQsXG4gIC8vIHdoaWNoIGNvdWxkIHRha2UgbG9uZ2VyIHRoZSBtb3JlIHRpbWUgdGhlIHZhbHVlIGNoYW5nZXMuIFdlIHdhbnQgdG8gZ2l2ZSBlbm91Z2ggdGltZSBmb3IgVk8gdG8gcmVhZFxuICAvLyBhcmlhLXZhbHVldGV4dCBidXQgZG9uJ3Qgd2FudCB0byBoYXZlIHRvbyBtdWNoIHNpbGVuY2UgYmVmb3JlIHRoZSBhbGVydCBpcyBzcG9rZW4uXG4gIGNvbnRleHRSZXNwb25zZVBlclZhbHVlQ2hhbmdlRGVsYXk/OiBudW1iZXI7XG5cbiAgLy8gaW4gbXMsIFdoZW4gdGhlIHZhbHVlUHJvcGVydHkgY2hhbmdlcyByZXBlYXRlZGx5LCB3aGF0IGlzIHRoZSBtYXhpbXVtIHRpbWUgdG8gc2V0IHRoZVxuICAvLyBhbGVydFN0YWJsZURlbGF5IGZvciB0aGUgY29udGV4dCByZXNwb25zZSB0by4gVGhpcyB2YWx1ZSBzaG91bGQgYmUgc21hbGwgZW5vdWdoIHRoYXQgaXQgZmVlbHMgbGlrZSB5b3UgYXJlXG4gIC8vIGFpdGluZyBmb3IgdGhpcyBhbGVydCBhZnRlciBhbiBpbnRlcmFjdGlvbi4gVGhpcyBzaG91bGQgYmUgYWx0ZXJlZCBkZXBlbmRpbmcgb24gaG93IHF1aWNrbHkgeW91IGV4cGVjdCB0aGVcbiAgLy8gdmFsdWUgdG8gY2hhbmdlLiBXZSB3YW50IHRvIGdpdmUgZW5vdWdoIHRpbWUgZm9yIFZPIHRvIHJlYWQgYXJpYS12YWx1ZXRleHQgYnV0IGRvbid0IHdhbnQgdG8gaGF2ZSB0b28gbXVjaFxuICAvLyBzaWxlbmNlIGJlZm9yZSB0aGUgYWxlcnQgaXMgc3Bva2VuLlxuICBjb250ZXh0UmVzcG9uc2VNYXhEZWxheT86IG51bWJlcjtcblxuICAvKipcbiAgICogTGlzdCB0aGUgZGVwZW5kZW5jaWVzIHRoaXMgTm9kZSdzIFBET00gZGVzY3JpcHRpb25zIGhhdmUuIFRoaXMgc2hvdWxkIG5vdCBpbmNsdWRlIHRoZSB2YWx1ZVByb3BlcnR5LCBidXRcbiAgICogc2hvdWxkIGxpc3QgYW55IFByb3BlcnRpZXMgd2hvc2UgY2hhbmdlIHNob3VsZCB0cmlnZ2VyIGEgZGVzY3JpcHRpb24gdXBkYXRlIGZvciB0aGlzIE5vZGUuXG4gICAqL1xuICBwZG9tRGVwZW5kZW5jaWVzPzogVFJlYWRPbmx5UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+W107XG5cbiAgLy8gT25seSBwcm92aWRlIHRhZ05hbWUgdG8gQWNjZXNzaWJsZVZhbHVlSGFuZGxlciB0byByZW1vdmUgaXQgZnJvbSB0aGUgUERPTSwgb3RoZXJ3aXNlLCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyXG4gIC8vIHNldHMgaXRzIG93biB0YWdOYW1lLlxuICB0YWdOYW1lPzogbnVsbDtcblxuICAvLyBDdXN0b21pemF0aW9ucyBmb3IgdGhlIHZvaWNpbmdPbkVuZFJlc3BvbnNlIGZ1bmN0aW9uLCB3aGljaCBpcyB1c2VkIHRvIHZvaWNlIGNvbnRlbnQgYXQgdGhlIGVuZFxuICAvLyBvZiBhbiBpbnRlcmFjdGlvbi5cbiAgdm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zPzogVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zO1xufTtcblxudHlwZSBQYXJlbnRPcHRpb25zID0gVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgQWNjZXNzaWJsZVZhbHVlSGFuZGxlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFZvaWNpbmdPcHRpb25zOyAvLyBkbyBub3QgdXNlIFBhcmVudE9wdGlvbnMgaGVyZSFcblxuZXhwb3J0IHR5cGUgVEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgPSB7XG4gIHN0YXJ0SW5wdXQ6IFNjZW5lcnlMaXN0ZW5lckZ1bmN0aW9uO1xuICBvbklucHV0OiBPbklucHV0RnVuY3Rpb247XG4gIGVuZElucHV0OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgfCBudWxsICkgPT4gdm9pZDtcbiAgY29uc3RyYWluVmFsdWU6ICggKCB2YWx1ZTogbnVtYmVyICkgPT4gbnVtYmVyICk7XG4gIHBhblRhcmdldE5vZGU6IE5vZGUgfCBudWxsO1xuICByb3VuZFRvU3RlcFNpemU6IGJvb2xlYW47XG4gIHBkb21NYXBQRE9NVmFsdWU6ICggKCB2YWx1ZTogbnVtYmVyICkgPT4gbnVtYmVyICk7XG4gIHBkb21NYXBWYWx1ZTogKCAoIG5ld1ZhbHVlOiBudW1iZXIsIHByZXZpb3VzVmFsdWU6IG51bWJlciApID0+IG51bWJlciApO1xuICBwZG9tUmVwZWF0RXF1YWxWYWx1ZVRleHQ6IGJvb2xlYW47XG4gIHBkb21DcmVhdGVBcmlhVmFsdWVUZXh0OiBDcmVhdGVUZXh0RnVuY3Rpb247XG4gIHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydDogQ3JlYXRlVGV4dEZ1bmN0aW9uIHwgbnVsbDtcbiAgY29udGV4dFJlc3BvbnNlUGVyVmFsdWVDaGFuZ2VEZWxheTogbnVtYmVyO1xuICBjb250ZXh0UmVzcG9uc2VNYXhEZWxheTogbnVtYmVyO1xuICB2b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnM6IFZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucztcbiAgc2V0UERPTURlcGVuZGVuY2llcyggZGVwZW5kZW5jaWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT5bXSApOiB2b2lkO1xuICBnZXRQRE9NRGVwZW5kZW5jaWVzKCk6IFRSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PltdO1xuICBwZG9tRGVwZW5kZW5jaWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT5bXTtcbiAgYWxlcnRDb250ZXh0UmVzcG9uc2UoKTogdm9pZDtcbiAgcmVzZXQoKTogdm9pZDtcbiAgZ2V0QWNjZXNzaWJsZVZhbHVlSGFuZGxlcklucHV0TGlzdGVuZXIoKTogVElucHV0TGlzdGVuZXI7XG4gIGhhbmRsZUtleURvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZDtcblxuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICBoYW5kbGVLZXlVcCggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkO1xuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICBoYW5kbGVDaGFuZ2UoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZDtcbiAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgaGFuZGxlSW5wdXQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZDtcbiAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgaGFuZGxlQmx1ciggZXZlbnQ6IFNjZW5lcnlFdmVudDxGb2N1c0V2ZW50PiApOiB2b2lkO1xuICBzZXRLZXlib2FyZFN0ZXAoIGtleWJvYXJkU3RlcDogbnVtYmVyICk6IHZvaWQ7XG4gIGtleWJvYXJkU3RlcDogbnVtYmVyO1xuICBnZXRLZXlib2FyZFN0ZXAoKTogbnVtYmVyO1xuICBzZXRTaGlmdEtleWJvYXJkU3RlcCggc2hpZnRLZXlib2FyZFN0ZXA6IG51bWJlciApOiB2b2lkO1xuICBzaGlmdEtleWJvYXJkU3RlcDogbnVtYmVyO1xuICBnZXRTaGlmdEtleWJvYXJkU3RlcCgpOiBudW1iZXI7XG4gIGdldFNoaWZ0S2V5RG93bigpOiBib29sZWFuO1xuICBnZXQgc2hpZnRLZXlEb3duKCk6IGJvb2xlYW47XG4gIHNldFBhZ2VLZXlib2FyZFN0ZXAoIHBhZ2VLZXlib2FyZFN0ZXA6IG51bWJlciApOiB2b2lkO1xuICBwYWdlS2V5Ym9hcmRTdGVwOiBudW1iZXI7XG4gIGdldFBhZ2VLZXlib2FyZFN0ZXAoKTogbnVtYmVyO1xuICBzZXRBcmlhT3JpZW50YXRpb24oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiB2b2lkO1xuICBhcmlhT3JpZW50YXRpb246IE9yaWVudGF0aW9uO1xuICBnZXRBcmlhT3JpZW50YXRpb24oKTogT3JpZW50YXRpb247XG4gIHZvaWNpbmdPbkVuZFJlc3BvbnNlKCB2YWx1ZU9uU3RhcnQ6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zICk6IHZvaWQ7XG59ICYgVFZvaWNpbmc7XG5cblxuLyoqXG4gKiBAcGFyYW0gVHlwZVxuICogQHBhcmFtIG9wdGlvbnNBcmdQb3NpdGlvbiAtIHplcm8taW5kZXhlZCBudW1iZXIgdGhhdCB0aGUgb3B0aW9ucyBhcmd1bWVudCBpcyBwcm92aWRlZCBhdFxuICovXG5jb25zdCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyID0gPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPE5vZGU+PiggVHlwZTogU3VwZXJUeXBlLCBvcHRpb25zQXJnUG9zaXRpb246IG51bWJlciApOiBTdXBlclR5cGUgJiBDb25zdHJ1Y3RvcjxUQWNjZXNzaWJsZVZhbHVlSGFuZGxlcj4gPT4ge1xuICBjb25zdCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyQ2xhc3MgPSBEZWxheWVkTXV0YXRlKCAnQWNjZXNzaWJsZVZhbHVlSGFuZGxlcicsIEFDQ0VTU0lCTEVfVkFMVUVfSEFORExFUl9PUFRJT05TLFxuICAgIGNsYXNzIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgZXh0ZW5kcyBWb2ljaW5nKCBUeXBlICkgaW1wbGVtZW50cyBUQWNjZXNzaWJsZVZhbHVlSGFuZGxlciB7XG4gICAgICBwcml2YXRlIHJlYWRvbmx5IF92YWx1ZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcbiAgICAgIHByaXZhdGUgX2VuYWJsZWRSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT47XG4gICAgICBwcml2YXRlIF9zdGFydElucHV0OiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbiA9IF8ubm9vcDtcbiAgICAgIHByaXZhdGUgX29uSW5wdXQ6IE9uSW5wdXRGdW5jdGlvbiA9IF8ubm9vcDtcbiAgICAgIHByaXZhdGUgX2VuZElucHV0OiAoICggZXZlbnQ6IFNjZW5lcnlFdmVudCB8IG51bGwgKSA9PiB2b2lkICkgPSBfLm5vb3A7XG4gICAgICBwcml2YXRlIF9jb25zdHJhaW5WYWx1ZTogKCAoIHZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXIgKSA9IF8uaWRlbnRpdHk7XG4gICAgICBwcml2YXRlIF9wZG9tTWFwVmFsdWU6ICggKCBuZXdWYWx1ZTogbnVtYmVyLCBwcmV2aW91c1ZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXIgKSA9IF8uaWRlbnRpdHk7XG4gICAgICBwcml2YXRlIF9wYW5UYXJnZXROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG4gICAgICBwcml2YXRlIF9rZXlib2FyZFN0ZXAhOiBudW1iZXI7IC8vIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYmFzZWQgb24gdGhlIGVuYWJsZWQgcmFuZ2VcbiAgICAgIHByaXZhdGUgX3NoaWZ0S2V5Ym9hcmRTdGVwITogbnVtYmVyOyAvLyB3aWxsIGJlIGluaXRpYWxpemVkIGJhc2VkIG9uIHRoZSBlbmFibGVkIHJhbmdlXG4gICAgICBwcml2YXRlIF9wYWdlS2V5Ym9hcmRTdGVwITogbnVtYmVyOyAvLyB3aWxsIGJlIGluaXRpYWxpemVkIGJhc2VkIG9uIHRoZSBlbmFibGVkIHJhbmdlXG4gICAgICBwcml2YXRlIF9hcmlhT3JpZW50YXRpb246IE9yaWVudGF0aW9uID0gT3JpZW50YXRpb24uSE9SSVpPTlRBTDtcbiAgICAgIHByaXZhdGUgX3NoaWZ0S2V5ID0gZmFsc2U7XG5cbiAgICAgIHByaXZhdGUgX3Bkb21EZXBlbmRlbmNpZXM6IFRSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PltdID0gW107XG5cbiAgICAgIC8vIHRyYWNrIHByZXZpb3VzIHZhbHVlcyBmb3IgY2FsbGJhY2tzIG91dHNpZGUgb2YgUHJvcGVydHkgbGlzdGVuZXJzXG4gICAgICBwcml2YXRlIF9vbGRWYWx1ZTogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIHByaXZhdGUgX3Bkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydDogQ3JlYXRlVGV4dEZ1bmN0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIC8vIFRoZSBQcm9wZXJ0eSB2YWx1ZSB3aGVuIGFuIGludGVyYWN0aW9uIHN0YXJ0cywgc28gaXQgY2FuIGJlIHVzZWQgYXMgdGhlIFwib2xkXCIgdmFsdWVcbiAgICAgIC8vIHdoZW4gZ2VuZXJhdGluZyBhIGNvbnRleHQgcmVzcG9uc2UgYXQgdGhlIGVuZCBvZiBhbiBpbnRlcmFjdGlvbiB3aXRoIHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydC5cbiAgICAgIHByaXZhdGUgX3ZhbHVlT25TdGFydDogbnVtYmVyO1xuXG4gICAgICAvLyBUaGUgdXR0ZXJhbmNlIHNlbnQgdG8gdGhlIHV0dGVyYW5jZVF1ZXVlIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMsIGFsZXJ0IGNvbnRlbnQgZ2VuZXJhdGVkIGJ5XG4gICAgICAvLyBvcHRpb25hbCBwZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQuIFRoZSBhbGVydFN0YWJsZURlbGF5IG9uIHRoaXMgdXR0ZXJhbmNlIHdpbGwgaW5jcmVhc2UgaWYgdGhlIGlucHV0XG4gICAgICAvLyByZWNlaXZlcyBtYW55IGludGVyYWN0aW9ucyBiZWZvcmUgdGhlIHV0dGVyYW5jZSBjYW4gYmUgYW5ub3VuY2VkIHNvIHRoYXQgVm9pY2VPdmVyIGhhcyB0aW1lIHRvIHJlYWQgdGhlXG4gICAgICAvLyBhcmlhLXZhbHVldGV4dCAob2JqZWN0IHJlc3BvbnNlKSBiZWZvcmUgdGhlIGFsZXJ0IChjb250ZXh0IHJlc3BvbnNlKS5cbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgX2NvbnRleHRSZXNwb25zZVV0dGVyYW5jZTogVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgpO1xuXG4gICAgICAvLyBOdW1iZXIgb2YgdGltZXMgdGhlIGlucHV0IGhhcyBjaGFuZ2VkIGluIHZhbHVlIGJlZm9yZSB0aGUgdXR0ZXJhbmNlIG1hZGUgd2FzIGFibGUgdG8gYmUgc3Bva2VuLCBvbmx5IGFwcGxpY2FibGVcbiAgICAgIC8vIGlmIHVzaW5nIHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydFxuICAgICAgcHJpdmF0ZSBfdGltZXNWYWx1ZVRleHRDaGFuZ2VkQmVmb3JlQWxlcnRpbmcgPSAwO1xuXG4gICAgICAvLyBpbiBtcywgc2VlIG9wdGlvbnMgZm9yIGRvY3VtZW50YXRpb24uXG4gICAgICBwcml2YXRlIF9jb250ZXh0UmVzcG9uc2VQZXJWYWx1ZUNoYW5nZURlbGF5ID0gNzAwO1xuICAgICAgcHJpdmF0ZSBfY29udGV4dFJlc3BvbnNlTWF4RGVsYXkgPSAxNTAwO1xuXG4gICAgICAvLyBXaGV0aGVyIGFuIGlucHV0IGV2ZW50IGhhcyBiZWVuIGhhbmRsZWQuIElmIGhhbmRsZWQsIHdlIHdpbGwgbm90IHJlc3BvbmQgdG8gdGhlXG4gICAgICAvLyBjaGFuZ2UgZXZlbnQuIEFuIEFUIChwYXJ0aWN1bGFybHkgVm9pY2VPdmVyKSBtYXkgc2VuZCBhIGNoYW5nZSBldmVudCAoYW5kIG5vdCBhbiBpbnB1dCBldmVudCkgdG8gdGhlXG4gICAgICAvLyBicm93c2VyIGluIHJlc3BvbnNlIHRvIGEgdXNlciBnZXN0dXJlLiBXZSBuZWVkIHRvIGhhbmRsZSB0aGF0IGNoYW5nZSBldmVudCwgd2l0aG91dCBhbHNvIGhhbmRsaW5nIHRoZVxuICAgICAgLy8gaW5wdXQgZXZlbnQgaW4gY2FzZSBhIGRldmljZSBzZW5kcyBib3RoIGV2ZW50cyB0byB0aGUgYnJvd3Nlci5cbiAgICAgIHByaXZhdGUgX3Bkb21JbnB1dEhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgLy8gU29tZSBicm93c2VycyB3aWxsIHJlY2VpdmUgYGlucHV0YCBldmVudHMgd2hlbiB0aGUgdXNlciB0YWJzIGF3YXkgZnJvbSB0aGUgc2xpZGVyIG9yXG4gICAgICAvLyBvbiBzb21lIGtleSBwcmVzc2VzIC0gaWYgd2UgcmVjZWl2ZSBhIGtleWRvd24gZXZlbnQgZm9yIGEgdGFiIGtleSwgZG8gbm90IGFsbG93IGlucHV0IG9yIGNoYW5nZSBldmVudHNcbiAgICAgIHByaXZhdGUgX2Jsb2NrSW5wdXQgPSBmYWxzZTtcblxuICAgICAgLy8gc2V0dGluZyB0byBlbmFibGUvZGlzYWJsZSByb3VuZGluZyB0byB0aGUgc3RlcCBzaXplXG4gICAgICBwcml2YXRlIF9yb3VuZFRvU3RlcFNpemUgPSBmYWxzZTtcblxuICAgICAgLy8ga2V5IGlzIHRoZSBldmVudC5jb2RlIGZvciB0aGUgcmFuZ2Uga2V5LCB2YWx1ZSBpcyB3aGV0aGVyIGl0IGlzIGRvd25cbiAgICAgIHByaXZhdGUgX3JhbmdlS2V5c0Rvd246IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge307XG4gICAgICBwcml2YXRlIF9wZG9tTWFwUERPTVZhbHVlOiAoICggdmFsdWU6IG51bWJlciApID0+IG51bWJlciApID0gXy5pZGVudGl0eTtcbiAgICAgIHByaXZhdGUgX3Bkb21DcmVhdGVBcmlhVmFsdWVUZXh0OiBDcmVhdGVUZXh0RnVuY3Rpb24gPSB0b1N0cmluZzsgLy8gYnkgZGVmYXVsdCBtYWtlIHN1cmUgaXQgcmV0dXJucyBhIHN0cmluZ1xuICAgICAgcHJpdmF0ZSBfZGVwZW5kZW5jaWVzTXVsdGlsaW5rOiBVbmtub3duTXVsdGlsaW5rIHwgbnVsbCA9IG51bGw7XG4gICAgICBwcml2YXRlIF9wZG9tUmVwZWF0RXF1YWxWYWx1ZVRleHQgPSB0cnVlO1xuXG4gICAgICAvLyBXaGVuIGNvbnRleHQgcmVzcG9uc2VzIGFyZSBzdXBwb3J0ZWQsIHRoaXMgY291bnRlciBpcyB1c2VkIHRvIGRldGVybWluZSBhIG11dGFibGUgZGVsYXkgYmV0d2VlbiBoZWFyaW5nIHRoZVxuICAgICAgLy8gc2FtZSByZXNwb25zZS5cbiAgICAgIHByaXZhdGUgX3RpbWVzQ2hhbmdlZEJlZm9yZUFsZXJ0aW5nID0gMDtcblxuICAgICAgLy8gT3B0aW9ucyBmb3IgdGhlIFZvaWNpbmcgcmVzcG9uc2UgYXQgdGhlIGVuZCBvZiBpbnRlcmFjdGlvbiB3aXRoIHRoaXMgY29tcG9uZW50LlxuICAgICAgcHJpdmF0ZSBfdm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zOiBWb2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMgPSBERUZBVUxUX1ZPSUNJTkdfT05fRU5EX1JFU1BPTlNFX09QVElPTlM7XG5cbiAgICAgIC8vIEF0IHRoZSBzdGFydCBvZiBpbnB1dCwgYSBsaXN0ZW5lciBpcyBhdHRhY2hlZCB0byB0aGUgUERPTVBvaW50ZXIgdG8gcHJldmVudCBsaXN0ZW5lcnMgY2xvc2VyIHRvIHRoZVxuICAgICAgLy8gc2NlbmUgZ3JhcGggcm9vdCBmcm9tIGZpcmluZy4gQSByZWZlcmVuY2UgdG8gdGhlIHBvaW50ZXIgaXMgc2F2ZWQgdG8gc3VwcG9ydCBpbnRlcnJ1cHQgYmVjYXVzZVxuICAgICAgLy8gdGhlcmUgaXMgbm8gU2NlbmVyeUV2ZW50LlxuICAgICAgcHJpdmF0ZSBfcGRvbVBvaW50ZXI6IFBET01Qb2ludGVyIHwgbnVsbCA9IG51bGw7XG4gICAgICBwcml2YXRlIF9wZG9tUG9pbnRlckxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcblxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfcGRvbVZhbHVlVGV4dFVwZGF0ZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuICAgICAgcHJpdmF0ZSByZWFkb25seSBfZGlzcG9zZUFjY2Vzc2libGVWYWx1ZUhhbmRsZXI6ICgpID0+IHZvaWQ7XG5cbiAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcblxuICAgICAgICBjb25zdCBwcm92aWRlZE9wdGlvbnMgPSBhcmdzWyBvcHRpb25zQXJnUG9zaXRpb24gXSBhcyBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyT3B0aW9ucztcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMsICdwcm92aWRlZE9wdGlvbnMgaGFzIHJlcXVpcmVkIG9wdGlvbnMnICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3ZpZGVkT3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSwgJ2VuYWJsZWRSYW5nZVByb3BlcnR5IGlzIGEgcmVxdWlyZWQgb3B0aW9uJyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMudmFsdWVQcm9wZXJ0eSwgJ3ZhbHVlUHJvcGVydHkgaXMgYSByZXF1aXJlZCBvcHRpb24nICk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoICFwcm92aWRlZE9wdGlvbnMuaGFzT3duUHJvcGVydHkoICd0YWdOYW1lJyApIHx8IHByb3ZpZGVkT3B0aW9ucy50YWdOYW1lID09PSBudWxsLFxuICAgICAgICAgICdBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyIHNldHMgaXRzIG93biB0YWdOYW1lLiBPbmx5IHByb3ZpZGUgdGFnTmFtZSB0byBjbGVhciBhY2Nlc3NpYmxlIGNvbnRlbnQgZnJvbSB0aGUgUERPTScgKTtcblxuICAgICAgICAvLyBjYW5ub3QgYmUgc2V0IGJ5IGNsaWVudFxuICAgICAgICBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICYmIGFzc2VydCggIXByb3ZpZGVkT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2lucHV0VHlwZScgKSwgJ0FjY2Vzc2libGVWYWx1ZUhhbmRsZXIgc2V0cyBpdHMgb3duIGlucHV0VHlwZS4nICk7XG5cbiAgICAgICAgLy8gaWYgcm91bmRpbmcgdG8ga2V5Ym9hcmQgc3RlcCwga2V5Ym9hcmRTdGVwIG11c3QgYmUgZGVmaW5lZCBzbyB2YWx1ZXMgYXJlbid0IHNraXBwZWQgYW5kIHRoZSBzbGlkZXJcbiAgICAgICAgLy8gZG9lc24ndCBnZXQgc3R1Y2sgd2hpbGUgcm91bmRpbmcgdG8gdGhlIG5lYXJlc3QgdmFsdWUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy80MTBcbiAgICAgICAgaWYgKCBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5yb3VuZFRvU3RlcFNpemUgKSB7XG4gICAgICAgICAgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMua2V5Ym9hcmRTdGVwLCAncm91bmRpbmcgdG8ga2V5Ym9hcmRTdGVwLCBkZWZpbmUgYXBwcm9wcmlhdGUga2V5Ym9hcmRTdGVwIHRvIHJvdW5kIHRvJyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgb3B0aW9uc1xuICAgICAgICBhcmdzWyBvcHRpb25zQXJnUG9zaXRpb24gXSA9IG9wdGlvbml6ZTxBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gVE9ETzogd2Ugc2hvdWxkIGJlIGFibGUgdG8gaGF2ZSB0aGUgcHVibGljIEFQSSBiZSBqdXN0IG51bGwsIGFuZCBpbnRlcm5hbGx5IHNldCB0byBzdHJpbmcsIExpbWl0YXRpb24gKElWKSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEyOFxuICAgICAgICAgIHRhZ05hbWU6IERFRkFVTFRfVEFHX05BTUUsXG5cbiAgICAgICAgICAvLyBwYXJlbnQgb3B0aW9ucyB0aGF0IHdlIG11c3QgcHJvdmlkZSBhIGRlZmF1bHQgdG8gdXNlXG4gICAgICAgICAgaW5wdXRUeXBlOiAncmFuZ2UnXG4gICAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuICAgICAgICBzdXBlciggLi4uYXJncyApO1xuXG4gICAgICAgIC8vIG1lbWJlcnMgb2YgdGhlIE5vZGUgQVBJIHRoYXQgYXJlIHVzZWQgYnkgdGhpcyB0cmFpdFxuICAgICAgICBhc3NlcnRIYXNQcm9wZXJ0aWVzKCB0aGlzLCBbICdpbnB1dFZhbHVlJywgJ3NldFBET01BdHRyaWJ1dGUnIF0gKTtcblxuICAgICAgICBjb25zdCB2YWx1ZVByb3BlcnR5ID0gcHJvdmlkZWRPcHRpb25zLnZhbHVlUHJvcGVydHk7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRSYW5nZVByb3BlcnR5ID0gcHJvdmlkZWRPcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5O1xuXG4gICAgICAgIGlmICggcHJvdmlkZWRPcHRpb25zLnJldmVyc2VBbHRlcm5hdGl2ZUlucHV0ICkge1xuXG4gICAgICAgICAgLy8gQSBEeW5hbWljUHJvcGVydHkgd2lsbCBpbnZlcnQgdGhlIHZhbHVlIGJlZm9yZSBzZXR0aW5nIGl0IHRvIHRoZSBhY3R1YWwgdmFsdWVQcm9wZXJ0eSwgYW5kIHNpbWlsYXJseVxuICAgICAgICAgIC8vIGludmVydCBpZiB0aGUgdmFsdWVQcm9wZXJ0eSBjaGFuZ2VzIGV4dGVybmFsbHkuXG4gICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG5ldyBQcm9wZXJ0eSggdmFsdWVQcm9wZXJ0eSApLCB7XG4gICAgICAgICAgICBiaWRpcmVjdGlvbmFsOiB0cnVlLFxuICAgICAgICAgICAgbWFwOiAoIHByb3BlcnR5VmFsdWU6IG51bWJlciApID0+IGVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCAtIHByb3BlcnR5VmFsdWUsXG4gICAgICAgICAgICBpbnZlcnNlTWFwOiAoIHByb3BlcnR5VmFsdWU6IG51bWJlciApID0+IGVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCAtIHByb3BlcnR5VmFsdWVcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eSA9IHZhbHVlUHJvcGVydHk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IGVuYWJsZWRSYW5nZVByb3BlcnR5O1xuXG4gICAgICAgIHRoaXMuX3Bkb21WYWx1ZVRleHRVcGRhdGVMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZUFyaWFWYWx1ZVRleHQuYmluZCggdGhpcyApO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemVkIHdpdGggc2V0dGVycyB0aGF0IHZhbGlkYXRlXG4gICAgICAgIHRoaXMua2V5Ym9hcmRTdGVwID0gKCBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggLSBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4gKSAvIDIwO1xuICAgICAgICB0aGlzLnNoaWZ0S2V5Ym9hcmRTdGVwID0gKCBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggLSBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4gKSAvIDEwMDtcbiAgICAgICAgdGhpcy5wYWdlS2V5Ym9hcmRTdGVwID0gKCBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggLSBlbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4gKSAvIDEwO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlT25TdGFydCA9IHZhbHVlUHJvcGVydHkudmFsdWU7XG5cbiAgICAgICAgLy8gYmUgY2FsbGVkIGxhc3QsIGFmdGVyIG9wdGlvbnMgaGF2ZSBiZWVuIHNldCB0byBgdGhpc2AuXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVBET01EZXBlbmRlbmNpZXMoKTtcblxuICAgICAgICAvLyBsaXN0ZW5lcnMsIG11c3QgYmUgdW5saW5rZWQgaW4gZGlzcG9zZVxuICAgICAgICBjb25zdCBlbmFibGVkUmFuZ2VPYnNlcnZlciA9IHRoaXMuaW52YWxpZGF0ZUVuYWJsZWRSYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgICAgIHRoaXMuX2VuYWJsZWRSYW5nZVByb3BlcnR5LmxpbmsoIGVuYWJsZWRSYW5nZU9ic2VydmVyICk7XG5cbiAgICAgICAgLy8gd2hlbiB0aGUgcHJvcGVydHkgY2hhbmdlcywgYmUgc3VyZSB0byB1cGRhdGUgdGhlIGFjY2Vzc2libGUgaW5wdXQgdmFsdWUgYW5kIGFyaWEtdmFsdWV0ZXh0IHdoaWNoIGlzIHJlYWRcbiAgICAgICAgLy8gYnkgYXNzaXN0aXZlIHRlY2hub2xvZ3kgd2hlbiB0aGUgdmFsdWUgY2hhbmdlc1xuICAgICAgICBjb25zdCB2YWx1ZVByb3BlcnR5TGlzdGVuZXIgPSB0aGlzLmludmFsaWRhdGVWYWx1ZVByb3BlcnR5LmJpbmQoIHRoaXMgKTtcbiAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eS5saW5rKCB2YWx1ZVByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgICAgICAvLyBBIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBhdHRhY2hlZCB0byB0aGUgcG9pbnRlciB0byBwcmV2ZW50IG90aGVyIGxpc3RlbmVycyBmcm9tIGF0dGFjaGluZy5cbiAgICAgICAgdGhpcy5fcGRvbVBvaW50ZXJMaXN0ZW5lciA9IHtcbiAgICAgICAgICBpbnRlcnJ1cHQ6ICgpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIHRoaXMuX29uSW50ZXJhY3Rpb25FbmQoIG51bGwgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fZGlzcG9zZUFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZW5hYmxlZFJhbmdlUHJvcGVydHkudW5saW5rKCBlbmFibGVkUmFuZ2VPYnNlcnZlciApO1xuICAgICAgICAgIHRoaXMuX3ZhbHVlUHJvcGVydHkudW5saW5rKCB2YWx1ZVByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgICAgICAgIGlmICggcHJvdmlkZWRPcHRpb25zLnJldmVyc2VBbHRlcm5hdGl2ZUlucHV0ICkge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eSBpbnN0YW5jZW9mIER5bmFtaWNQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgJ09ubHkgYSBEeW5hbWljUHJvcGVydHkgY2FuIGJlIGRpc3Bvc2VkLCBvdGhlcndpc2UgdGhpcyBpcyBkaXNwb3NpbmcgYSBQcm9wZXJ0eSB0aGF0IEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgZG9lcyBub3QgaGF2ZSBvd25lcnNoaXAgb3Zlci4nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fZGVwZW5kZW5jaWVzTXVsdGlsaW5rICYmIHRoaXMuX2RlcGVuZGVuY2llc011bHRpbGluay5kaXNwb3NlKCk7XG4gICAgICAgICAgdGhpcy5fcGFuVGFyZ2V0Tm9kZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fcGRvbURlcGVuZGVuY2llcyA9IFtdO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHN0YXJ0SW5wdXQoIHZhbHVlOiBTY2VuZXJ5TGlzdGVuZXJGdW5jdGlvbiApIHtcbiAgICAgICAgdGhpcy5fc3RhcnRJbnB1dCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHN0YXJ0SW5wdXQoKTogU2NlbmVyeUxpc3RlbmVyRnVuY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnRJbnB1dDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBvbklucHV0KCB2YWx1ZTogT25JbnB1dEZ1bmN0aW9uICkge1xuICAgICAgICB0aGlzLl9vbklucHV0ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgb25JbnB1dCgpOiBPbklucHV0RnVuY3Rpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fb25JbnB1dDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBlbmRJbnB1dCggdmFsdWU6ICggKCBldmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCApID0+IHZvaWQgKSApIHtcbiAgICAgICAgdGhpcy5fZW5kSW5wdXQgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBlbmRJbnB1dCgpOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgfCBudWxsICkgPT4gdm9pZCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbmRJbnB1dDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBjb25zdHJhaW5WYWx1ZSggdmFsdWU6ICggKCB2YWx1ZTogbnVtYmVyICkgPT4gbnVtYmVyICkgKSB7XG4gICAgICAgIC8vIE5PVEU6IE5vdCBjdXJyZW50bHkgcmUtY29uc3RyYWluaW5nIHRoZSB2YWx1ZSBvbiBzZXQsIHNpbmNlIGhvcGVmdWxseSBvdGhlciB0aGluZ3MgYXJlIGRvaW5nIHRoaXMgYWN0aW9uLlxuICAgICAgICAvLyBJZiB0aGF0J3Mgbm90IGRvbmUsIHdlIHNob3VsZCBkbyBzb21ldGhpbmcgYWJvdXQgaXQgaGVyZS5cbiAgICAgICAgdGhpcy5fY29uc3RyYWluVmFsdWUgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBjb25zdHJhaW5WYWx1ZSgpOiAoICggdmFsdWU6IG51bWJlciApID0+IG51bWJlciApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpblZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHBhblRhcmdldE5vZGUoIHZhbHVlOiBOb2RlIHwgbnVsbCApIHtcbiAgICAgICAgdGhpcy5fcGFuVGFyZ2V0Tm9kZSA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHBhblRhcmdldE5vZGUoKTogTm9kZSB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFuVGFyZ2V0Tm9kZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCByb3VuZFRvU3RlcFNpemUoIHZhbHVlOiBib29sZWFuICkge1xuICAgICAgICB0aGlzLl9yb3VuZFRvU3RlcFNpemUgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCByb3VuZFRvU3RlcFNpemUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb3VuZFRvU3RlcFNpemU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgcGRvbU1hcFBET01WYWx1ZSggdmFsdWU6ICggKCB2YWx1ZTogbnVtYmVyICkgPT4gbnVtYmVyICkgKSB7XG4gICAgICAgIHRoaXMuX3Bkb21NYXBQRE9NVmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVFbmFibGVkUmFuZ2UoIHRoaXMuX2VuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlICk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVZhbHVlUHJvcGVydHkoKTtcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlQXJpYVZhbHVlVGV4dCgpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHBkb21NYXBQRE9NVmFsdWUoKTogKCAoIHZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXIgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wZG9tTWFwUERPTVZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHBkb21NYXBWYWx1ZSggdmFsdWU6ICggKCBuZXdWYWx1ZTogbnVtYmVyLCBwcmV2aW91c1ZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXIgKSApIHtcbiAgICAgICAgdGhpcy5fcGRvbU1hcFZhbHVlID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcGRvbU1hcFZhbHVlKCk6ICggKCBuZXdWYWx1ZTogbnVtYmVyLCBwcmV2aW91c1ZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXIgKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wZG9tTWFwVmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgcGRvbVJlcGVhdEVxdWFsVmFsdWVUZXh0KCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICAgICAgdGhpcy5fcGRvbVJlcGVhdEVxdWFsVmFsdWVUZXh0ID0gdmFsdWU7XG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlQXJpYVZhbHVlVGV4dCgpO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHBkb21SZXBlYXRFcXVhbFZhbHVlVGV4dCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bkb21SZXBlYXRFcXVhbFZhbHVlVGV4dDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBwZG9tQ3JlYXRlQXJpYVZhbHVlVGV4dCggdmFsdWU6IENyZWF0ZVRleHRGdW5jdGlvbiApIHtcbiAgICAgICAgdGhpcy5fcGRvbUNyZWF0ZUFyaWFWYWx1ZVRleHQgPSB2YWx1ZTtcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVBcmlhVmFsdWVUZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcGRvbUNyZWF0ZUFyaWFWYWx1ZVRleHQoKTogQ3JlYXRlVGV4dEZ1bmN0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bkb21DcmVhdGVBcmlhVmFsdWVUZXh0O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydCggdmFsdWU6IENyZWF0ZVRleHRGdW5jdGlvbiB8IG51bGwgKSB7XG4gICAgICAgIHRoaXMuX3Bkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydCgpOiBDcmVhdGVUZXh0RnVuY3Rpb24gfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBjb250ZXh0UmVzcG9uc2VQZXJWYWx1ZUNoYW5nZURlbGF5KCB2YWx1ZTogbnVtYmVyICkge1xuICAgICAgICB0aGlzLl9jb250ZXh0UmVzcG9uc2VQZXJWYWx1ZUNoYW5nZURlbGF5ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgY29udGV4dFJlc3BvbnNlUGVyVmFsdWVDaGFuZ2VEZWxheSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dFJlc3BvbnNlUGVyVmFsdWVDaGFuZ2VEZWxheTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBjb250ZXh0UmVzcG9uc2VNYXhEZWxheSggdmFsdWU6IG51bWJlciApIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFJlc3BvbnNlTWF4RGVsYXkgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBjb250ZXh0UmVzcG9uc2VNYXhEZWxheSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dFJlc3BvbnNlTWF4RGVsYXk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgdm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zKCB2YWx1ZTogVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zICkge1xuICAgICAgICB0aGlzLl92b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCB2b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMoKTogVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucztcbiAgICAgIH1cblxuICAgICAgcHJpdmF0ZSBpbnZhbGlkYXRlQXJpYVZhbHVlVGV4dCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlQXJpYVZhbHVlVGV4dCggdGhpcy5fb2xkVmFsdWUgKTtcblxuICAgICAgICB0aGlzLl9vbGRWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHByaXZhdGUgaW52YWxpZGF0ZUVuYWJsZWRSYW5nZSggZW5hYmxlZFJhbmdlOiBSYW5nZSApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbWFwcGVkTWluID0gdGhpcy5fZ2V0TWFwcGVkVmFsdWUoIGVuYWJsZWRSYW5nZS5taW4gKTtcbiAgICAgICAgY29uc3QgbWFwcGVkTWF4ID0gdGhpcy5fZ2V0TWFwcGVkVmFsdWUoIGVuYWJsZWRSYW5nZS5tYXggKTtcblxuICAgICAgICAvLyBwZG9tIC0gdXBkYXRlIGVuYWJsZWQgc2xpZGVyIHJhbmdlIGZvciBBVCwgcmVxdWlyZWQgZm9yIHNjcmVlbiByZWFkZXIgZXZlbnRzIHRvIGJlaGF2ZSBjb3JyZWN0bHlcbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnbWluJywgbWFwcGVkTWluICk7XG4gICAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ21heCcsIG1hcHBlZE1heCApO1xuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgc3RlcCBhdHRyaWJ1dGUgc2xpZGVyIGVsZW1lbnQgLSB0aGlzIGF0dHJpYnV0ZSBpcyBvbmx5IGFkZGVkIGJlY2F1c2UgaXQgaXMgcmVxdWlyZWQgdG9cbiAgICAgICAgLy8gcmVjZWl2ZSBhY2Nlc3NpYmlsaXR5IGV2ZW50cyBvbiBhbGwgYnJvd3NlcnMsIGFuZCBpcyB0b3RhbGx5IHNlcGFyYXRlIGZyb20gdGhlIHN0ZXAgdmFsdWVzIGFib3ZlIHRoYXRcbiAgICAgICAgLy8gd2lsbCBtb2RpZnkgdGhlIHZhbHVlUHJvcGVydHkuIFNlZSBmdW5jdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgICAgdGhpcy5fdXBkYXRlU2libGluZ1N0ZXBBdHRyaWJ1dGUoKTtcbiAgICAgIH1cblxuICAgICAgcHJpdmF0ZSBpbnZhbGlkYXRlVmFsdWVQcm9wZXJ0eSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbWFwcGVkVmFsdWUgPSB0aGlzLl9nZXRNYXBwZWRWYWx1ZSgpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgYXJpYS12YWx1ZW5vdyBhdHRyaWJ1dGUgaW4gY2FzZSB0aGUgQVQgcmVxdWlyZXMgaXQgdG8gcmVhZCB0aGUgdmFsdWUgY29ycmVjdGx5LCBzb21lIG1heVxuICAgICAgICAvLyBmYWxsIGJhY2sgb24gdGhpcyBmcm9tIGFyaWEtdmFsdWV0ZXh0IHNlZVxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BY2Nlc3NpYmlsaXR5L0FSSUEvQVJJQV9UZWNobmlxdWVzL1VzaW5nX3RoZV9hcmlhLXZhbHVldGV4dF9hdHRyaWJ1dGUjUG9zc2libGVfZWZmZWN0c19vbl91c2VyX2FnZW50c19hbmRfYXNzaXN0aXZlX3RlY2hub2xvZ3lcbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS12YWx1ZW5vdycsIG1hcHBlZFZhbHVlICk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBQRE9NIGlucHV0IHZhbHVlIG9uIFByb3BlcnR5IGNoYW5nZVxuICAgICAgICB0aGlzLmlucHV0VmFsdWUgPSBtYXBwZWRWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHJpdmF0ZSBpbnZhbGlkYXRlUERPTURlcGVuZGVuY2llcygpOiB2b2lkIHtcblxuICAgICAgICAvLyBkaXNwb3NlIHRoZSBwcmV2aW91cyBtdWx0aWxpbmssIHRoZXJlIGlzIG9ubHkgb25lIHNldCBvZiBkZXBlbmRlbmNpZXMsIHRob3VnaCB0aGV5IGNhbiBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgdGhpcy5fZGVwZW5kZW5jaWVzTXVsdGlsaW5rICYmIHRoaXMuX2RlcGVuZGVuY2llc011bHRpbGluay5kaXNwb3NlKCk7XG5cbiAgICAgICAgdGhpcy5fZGVwZW5kZW5jaWVzTXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGlua0FueSggdGhpcy5fcGRvbURlcGVuZGVuY2llcy5jb25jYXQoIFsgdGhpcy5fdmFsdWVQcm9wZXJ0eSBdICksIHRoaXMuX3Bkb21WYWx1ZVRleHRVcGRhdGVMaXN0ZW5lciApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFRoZXJlIGFyZSBzb21lIGZlYXR1cmVzIG9mIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgdGhhdCBzdXBwb3J0IHVwZGF0aW5nIHdoZW4gbW9yZSB0aGFuIGp1c3QgdGhlIHZhbHVlUHJvcGVydHlcbiAgICAgICAqIGNoYW5nZXMuIFVzZSB0aGlzIG1ldGhvZCB0byBzZXQgdGhlIGRlcGVuZGVuY3kgUHJvcGVydGllcyBmb3IgdGhpcyB2YWx1ZSBoYW5kbGVyLiBUaGlzIHdpbGwgYmxvdyBhd2F5IHRoZVxuICAgICAgICogcHJldmlvdXMgbGlzdCAobGlrZSBOb2RlLmNoaWxkcmVuKS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFBET01EZXBlbmRlbmNpZXMoIGRlcGVuZGVuY2llczogVFJlYWRPbmx5UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+W10gKTogdm9pZCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFkZXBlbmRlbmNpZXMuaW5jbHVkZXMoIHRoaXMuX3ZhbHVlUHJvcGVydHkgKSxcbiAgICAgICAgICAnVGhlIHZhbHVlIFByb3BlcnR5IGlzIGFscmVhZHkgYSBkZXBlbmRlbmN5LCBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBhZGRlZCB0byB0aGlzIGxpc3QnICk7XG5cbiAgICAgICAgdGhpcy5fcGRvbURlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcztcblxuICAgICAgICB0aGlzLmludmFsaWRhdGVQRE9NRGVwZW5kZW5jaWVzKCk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXRQRE9NRGVwZW5kZW5jaWVzKCk6IFRSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bkb21EZXBlbmRlbmNpZXM7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgcGRvbURlcGVuZGVuY2llcyggdmFsdWU6IFRSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PltdICkge1xuICAgICAgICB0aGlzLnNldFBET01EZXBlbmRlbmNpZXMoIHZhbHVlICk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcGRvbURlcGVuZGVuY2llcygpOiBUUmVhZE9ubHlQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT5bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFBET01EZXBlbmRlbmNpZXMoKTtcbiAgICAgIH1cblxuICAgICAgcHJpdmF0ZSBfdXBkYXRlQXJpYVZhbHVlVGV4dCggb2xkUHJvcGVydHlWYWx1ZTogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbWFwcGVkVmFsdWUgPSB0aGlzLl9nZXRNYXBwZWRWYWx1ZSgpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgZHluYW1pYyBhcmlhLXZhbHVldGV4dCBmcm9tIHBkb21DcmVhdGVBcmlhVmFsdWVUZXh0LlxuICAgICAgICBjb25zdCBuZXdBcmlhVmFsdWVUZXh0VmFsdWVUeXBlID0gdGhpcy5fcGRvbUNyZWF0ZUFyaWFWYWx1ZVRleHQoIG1hcHBlZFZhbHVlLCB0aGlzLl92YWx1ZVByb3BlcnR5LnZhbHVlLCBvbGRQcm9wZXJ0eVZhbHVlICk7XG4gICAgICAgIGxldCBuZXdBcmlhVmFsdWVUZXh0ID0gUERPTVV0aWxzLnVud3JhcFN0cmluZ1Byb3BlcnR5KCBuZXdBcmlhVmFsdWVUZXh0VmFsdWVUeXBlICkhO1xuXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG5ld0FyaWFWYWx1ZVRleHQgPT09ICdzdHJpbmcnICk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgdGhlIG5ldyBhcmlhLXZhbHVldGV4dCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgcHJldmlvdXMgb25lLCBzbyB0aGF0IGlmIHRoZXkgYXJlIHRoZSBzYW1lXG4gICAgICAgIC8vIHRoZSBzY3JlZW4gcmVhZGVyIHdpbGwgc3RpbGwgcmVhZCB0aGUgbmV3IHRleHQgLSBhZGRpbmcgYSBoYWlyU3BhY2UgcmVnaXN0ZXJzIGFzIGEgbmV3IHN0cmluZywgYnV0IHRoZVxuICAgICAgICAvLyBzY3JlZW4gcmVhZGVyIHdvbid0IHJlYWQgdGhhdCBjaGFyYWN0ZXIuXG4gICAgICAgIGNvbnN0IGhhaXJTcGFjZSA9ICdcXHUyMDBBJztcbiAgICAgICAgaWYgKCB0aGlzLl9wZG9tUmVwZWF0RXF1YWxWYWx1ZVRleHQgJiYgdGhpcy5hcmlhVmFsdWVUZXh0ICYmIG5ld0FyaWFWYWx1ZVRleHQgPT09IHRoaXMuYXJpYVZhbHVlVGV4dC5yZXBsYWNlKCBuZXcgUmVnRXhwKCBoYWlyU3BhY2UsICdnJyApLCAnJyApICkge1xuICAgICAgICAgIG5ld0FyaWFWYWx1ZVRleHQgPSB0aGlzLmFyaWFWYWx1ZVRleHQgKyBoYWlyU3BhY2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFyaWFWYWx1ZVRleHQgPSBuZXdBcmlhVmFsdWVUZXh0O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIElmIGdlbmVyYXRpbmcgYW4gYWxlcnQgd2hlbiB0aGUgdXNlciBjaGFuZ2VzIHRoZSBzbGlkZXIgdmFsdWUsIGNyZWF0ZSB0aGUgYWxlcnQgY29udGVudCBhbmQgc2VuZCBpdFxuICAgICAgICogdG8gdGhlIHV0dGVyYW5jZVF1ZXVlLiBGb3IgVm9pY2VPdmVyLCBpdCBpcyBpbXBvcnRhbnQgdGhhdCBpZiB0aGUgdmFsdWUgaXMgY2hhbmdlZCBtdWx0aXBsZSB0aW1lcyBiZWZvcmVcbiAgICAgICAqIHRoZSBhbGVydCBjYW4gYmUgc3Bva2VuLCB3ZSBwcm92aWRlIG1vcmUgdGltZSBmb3IgdGhlIEFUIHRvIGZpbmlzaCBzcGVha2luZyBhcmlhLXZhbHVldGV4dC4gT3RoZXJ3aXNlLCB0aGVcbiAgICAgICAqIGFsZXJ0IG1heSBiZSBsb3N0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiLWJhc2ljcy9pc3N1ZXMvMTQ2LlxuICAgICAgICovXG4gICAgICBwdWJsaWMgYWxlcnRDb250ZXh0UmVzcG9uc2UoKTogdm9pZCB7XG5cbiAgICAgICAgLy8gQWxlcnRpbmcgd2lsbCBvY2N1ciB0byBlYWNoIGNvbm5lY3RlZCBkaXNwbGF5J3MgVXR0ZXJhbmNlUXVldWUsIGJ1dCB3ZSBzaG91bGQgb25seSBpbmNyZW1lbnQgZGVsYXkgb25jZSBwZXJcbiAgICAgICAgLy8gdGltZSB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAgICAgICAgbGV0IHRpbWVzQ2hhbmdlZEJlZm9yZUFsZXJ0aW5nSW5jcmVtZW50ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCB0aGlzLl9wZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQgKSB7XG5cbiAgICAgICAgICBjb25zdCBtYXBwZWRWYWx1ZSA9IHRoaXMuX2dldE1hcHBlZFZhbHVlKCk7XG4gICAgICAgICAgY29uc3QgZW5kSW50ZXJhY3Rpb25BbGVydCA9IHRoaXMuX3Bkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydCggbWFwcGVkVmFsdWUsIHRoaXMuX3ZhbHVlUHJvcGVydHkudmFsdWUsIHRoaXMuX3ZhbHVlT25TdGFydCApO1xuXG4gICAgICAgICAgLy8gb25seSBpZiBpdCByZXR1cm5lZCBhbiBhbGVydFxuICAgICAgICAgIGlmICggZW5kSW50ZXJhY3Rpb25BbGVydCApIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHRSZXNwb25zZVV0dGVyYW5jZS5hbGVydCA9IGVuZEludGVyYWN0aW9uQWxlcnQ7XG4gICAgICAgICAgICB0aGlzLmZvckVhY2hVdHRlcmFuY2VRdWV1ZSggKCB1dHRlcmFuY2VRdWV1ZTogVXR0ZXJhbmNlUXVldWUgKSA9PiB7XG5cbiAgICAgICAgICAgICAgLy8gT25seSBpbmNyZW1lbnQgYSBzaW5nbGUgdGltZSwgdGhpcyBoYXMgdGhlIGNvbnN0cmFpbnQgdGhhdCBpZiBkaWZmZXJlbnQgdXR0ZXJhbmNlUXVldWVzIG1vdmUgdGhpc1xuICAgICAgICAgICAgICAvLyBhbGVydCB0aHJvdWdoIGF0IGEgZGlmZmVyZW50IHRpbWUsIHRoZSBkZWxheSBjb3VsZCBiZSBpbmNvbnNpc3RlbnQsIGJ1dCBpbiBnZW5lcmFsIGl0IHNob3VsZCB3b3JrIHdlbGwuXG4gICAgICAgICAgICAgIGlmICggdGltZXNDaGFuZ2VkQmVmb3JlQWxlcnRpbmdJbmNyZW1lbnRlZCApIHtcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGN1cnJlbnQgdmFsdWUgZm9yIHRoaXMuX3RpbWVzQ2hhbmdlZEJlZm9yZUFsZXJ0aW5nXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSBpZiAoIHV0dGVyYW5jZVF1ZXVlLmhhc1V0dGVyYW5jZSggdGhpcy5fY29udGV4dFJlc3BvbnNlVXR0ZXJhbmNlICkgKSB7XG4gICAgICAgICAgICAgICAgdGltZXNDaGFuZ2VkQmVmb3JlQWxlcnRpbmdJbmNyZW1lbnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGltZXNDaGFuZ2VkQmVmb3JlQWxlcnRpbmcrKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90aW1lc0NoYW5nZWRCZWZvcmVBbGVydGluZyA9IDE7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBBZGp1c3QgdGhlIGRlbGF5IG9mIHRoZSB1dHRlcmFuY2UgYmFzZWQgb24gbnVtYmVyIG9mIHRpbWVzIGl0IGhhcyBiZWVuIHJlLWFkZGVkIHRvIHRoZSBxdWV1ZS4gRWFjaFxuICAgICAgICAgICAgICAvLyB0aW1lIHRoZSBhcmlhLXZhbHVldGV4dCBjaGFuZ2VzLCB0aGlzIG1ldGhvZCBpcyBjYWxsZWQsIHdlIHdhbnQgdG8gbWFrZSBzdXJlIHRvIGdpdmUgZW5vdWdoIHRpbWUgZm9yIHRoZVxuICAgICAgICAgICAgICAvLyBhcmlhLXZhbHVldGV4dCB0byBmdWxseSBjb21wbGV0ZSBiZWZvcmUgYWxlcnRpbmcgdGhpcyBjb250ZXh0IHJlc3BvbnNlLlxuICAgICAgICAgICAgICB0aGlzLl9jb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UuYWxlcnRTdGFibGVEZWxheSA9IE1hdGgubWluKCB0aGlzLl9jb250ZXh0UmVzcG9uc2VNYXhEZWxheSxcbiAgICAgICAgICAgICAgICB0aGlzLl90aW1lc0NoYW5nZWRCZWZvcmVBbGVydGluZyAqIHRoaXMuX2NvbnRleHRSZXNwb25zZVBlclZhbHVlQ2hhbmdlRGVsYXkgKTtcblxuICAgICAgICAgICAgICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHRoaXMuX2NvbnRleHRSZXNwb25zZVV0dGVyYW5jZSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIG1vZGVsIGRlcGVuZGVuY2llcyBoYXZlIGJlZW4gcmVzZXRcbiAgICAgICAqL1xuICAgICAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuXG4gICAgICAgIC8vIHJlc2V0IHRoZSBhcmlhLXZhbHVldGV4dCBjcmVhdG9yIGlmIGl0IHN1cHBvcnRzIHRoYXRcbiAgICAgICAgdGhpcy5fcGRvbUNyZWF0ZUFyaWFWYWx1ZVRleHQucmVzZXQgJiYgdGhpcy5fcGRvbUNyZWF0ZUFyaWFWYWx1ZVRleHQucmVzZXQoKTtcbiAgICAgICAgdGhpcy5fcGRvbUNyZWF0ZUNvbnRleHRSZXNwb25zZUFsZXJ0ICYmIHRoaXMuX3Bkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydC5yZXNldCAmJiB0aGlzLl9wZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQucmVzZXQoKTtcblxuICAgICAgICB0aGlzLl90aW1lc0NoYW5nZWRCZWZvcmVBbGVydGluZyA9IDA7XG4gICAgICAgIC8vIG9uIHJlc2V0LCBtYWtlIHN1cmUgdGhhdCB0aGUgUERPTSBkZXNjcmlwdGlvbnMgYXJlIGNvbXBsZXRlbHkgdXAgdG8gZGF0ZS5cbiAgICAgICAgdGhpcy5fdXBkYXRlQXJpYVZhbHVlVGV4dCggbnVsbCApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIGdldCB0aGUgZm9ybWF0dGVkIHZhbHVlIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBQcm9wZXJ0eS5cbiAgICAgICAqIEBwYXJhbSBbdmFsdWVdIC0gaWYgbm90IHByb3ZpZGVkLCB3aWxsIHVzZSB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgdmFsdWVQcm9wZXJ0eVxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9nZXRNYXBwZWRWYWx1ZSggdmFsdWU6IG51bWJlciA9IHRoaXMuX3ZhbHVlUHJvcGVydHkudmFsdWUgKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Bkb21NYXBQRE9NVmFsdWUoIHZhbHVlICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJuIHRoZSBpbnB1dCBsaXN0ZW5lciB0aGF0IGNvdWxkIGJlIGF0dGFjaGVkIHRvIG1peGVkIGluIHR5cGVzIG9mIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIgdG8gc3VwcG9ydFxuICAgICAgICogaW50ZXJhY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySW5wdXRMaXN0ZW5lcigpOiBUSW5wdXRMaXN0ZW5lciB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAga2V5ZG93bjogdGhpcy5oYW5kbGVLZXlEb3duLmJpbmQoIHRoaXMgKSxcbiAgICAgICAgICBrZXl1cDogdGhpcy5oYW5kbGVLZXlVcC5iaW5kKCB0aGlzICksXG4gICAgICAgICAgaW5wdXQ6IHRoaXMuaGFuZGxlSW5wdXQuYmluZCggdGhpcyApLFxuICAgICAgICAgIGNoYW5nZTogdGhpcy5oYW5kbGVDaGFuZ2UuYmluZCggdGhpcyApLFxuICAgICAgICAgIGJsdXI6IHRoaXMuaGFuZGxlQmx1ci5iaW5kKCB0aGlzIClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGUgYSBrZXlkb3duIGV2ZW50IHNvIHRoYXQgdGhlIHZhbHVlIGhhbmRsZXIgYmVoYXZlcyBsaWtlIGEgdHJhZGl0aW9uYWwgaW5wdXQgdGhhdCBtb2RpZmllc1xuICAgICAgICogYSBudW1iZXIuIFdlIGV4cGVjdCB0aGUgZm9sbG93aW5nOlxuICAgICAgICogICAtIFVwIEFycm93L1JpZ2h0IEFycm93IGluY3JlbWVudHMgdmFsdWUgYnkga2V5Ym9hcmRTdGVwXG4gICAgICAgKiAgIC0gRG93biBBcnJvdy9MZWZ0IEFycm93IGRlY3JlbWVudHMgdmFsdWUgYnkgc3RlcCBzaXplXG4gICAgICAgKiAgIC0gUGFnZSB1cC9QYWdlIGRvd24gd2lsbCBpbmNyZW1lbnQvZGVjcmVtZW50IHZhbHVlIHBhZ2VLZXlib2FyZFN0ZXBcbiAgICAgICAqICAgLSBIb21lL0VuZCB3aWxsIHNldCB2YWx1ZSB0byBtaW4vbWF4IHZhbHVlIGZvciB0aGUgcmFuZ2VcbiAgICAgICAqICAgLSBQcmVzc2luZyBzaGlmdCB3aXRoIGFuIGFycm93IGtleSB3aWxsIGluY3JlbWVudC9kZWNyZW1lbnQgdmFsdWUgYnkgc2hpZnRLZXlib2FyZFN0ZXBcbiAgICAgICAqXG4gICAgICAgKiBBZGQgdGhpcyBhcyBhbiBpbnB1dCBsaXN0ZW5lciB0byB0aGUgYGtleWRvd25gIGV2ZW50IHRvIHRoZSBOb2RlIG1peGluZyBpbiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgaGFuZGxlS2V5RG93biggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcblxuICAgICAgICBjb25zdCBkb21FdmVudCA9IGV2ZW50LmRvbUV2ZW50ITtcblxuICAgICAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZG9tRXZlbnQgKTtcblxuICAgICAgICBpZiAoICFrZXkgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2hpZnRLZXkgPSBkb21FdmVudC5zaGlmdEtleTtcblxuICAgICAgICAvLyBpZiB3ZSByZWNlaXZlIGEgJ3RhYicga2V5ZG93biBldmVudCwgZG8gbm90IGFsbG93IHRoZSBicm93c2VyIHRvIHJlYWN0IHRvIHRoaXMgbGlrZSBhIHN1Ym1pc3Npb24gYW5kXG4gICAgICAgIC8vIHByZXZlbnQgcmVzcG9uZGluZyB0byB0aGUgYGlucHV0YCBldmVudFxuICAgICAgICBpZiAoIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZG9tRXZlbnQsIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApICkge1xuICAgICAgICAgIHRoaXMuX2Jsb2NrSW5wdXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcblxuICAgICAgICAgIGNvbnN0IGVuZ2xpc2hLZXlTdHJpbmcgPSBldmVudENvZGVUb0VuZ2xpc2hTdHJpbmcoIGtleSApITtcblxuICAgICAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBzbyBicm93c2VyIGRvZXNuJ3QgY2hhbmdlIGlucHV0IHZhbHVlIGF1dG9tYXRpY2FsbHlcbiAgICAgICAgICBpZiAoIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5pc1JhbmdlS2V5KCBlbmdsaXNoS2V5U3RyaW5nICkgKSB7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIHByZXZlbnQgYW55IFwiY2hhbmdlXCIgYW5kIFwiaW5wdXRcIiBldmVudHMgc28gd2UgZG9uJ3QgY2hhbmdlIHRoZSB2YWx1ZSB0d2ljZSwgYnV0IGl0IGFsc29cbiAgICAgICAgICAgIC8vIHByZXZlbnRzIGEgVm9pY2VPdmVyIGlzc3VlIHdoZXJlIHByZXNzaW5nIGFycm93IGtleXMgYm90aCBjaGFuZ2VzIHRoZSBzbGlkZXIgdmFsdWUgQU5EIG1vdmVzIHRoZVxuICAgICAgICAgICAgLy8gdmlydHVhbCBjdXJzb3IuIFRoaXMgbmVlZHMgdG8gYmUgZG9uZSBldmVyeSByYW5nZSBrZXkgZXZlbnQgc28gdGhhdCB3ZSBkb24ndCBjaGFuZ2UgdGhlIHZhbHVlIHdpdGhcbiAgICAgICAgICAgIC8vIGFuICdpbnB1dCcgb3IgJ2NoYW5nZScgZXZlbnQsIGV2ZW4gd2hlbiB0aGUgbWV0YSBrZXkgaXMgZG93bi5cbiAgICAgICAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIC8vIE9uIE1hYywgd2UgZG9uJ3QgZ2V0IGEga2V5dXAgZXZlbnQgd2hlbiB0aGUgbWV0YSBrZXkgaXMgZG93biBzbyBkb24ndCBjaGFuZ2UgdGhlIHZhbHVlIG9yIGRvXG4gICAgICAgICAgICAvLyBhbnl0aGluZyB0aGF0IGFzc3VtZXMgd2Ugd2lsbCBnZXQgYSBjb3JyZXNwb25kaW5nIGtleXVwIGV2ZW50LCBzZWVcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzExODE4NjM3L3doeS1kb2VzLWphdmFzY3JpcHQtZHJvcC1rZXl1cC1ldmVudHMtd2hlbi10aGUtbWV0YWtleS1pcy1wcmVzc2VkLW9uLW1hYy1icm93c2VyXG4gICAgICAgICAgICBpZiAoICFkb21FdmVudC5tZXRhS2V5ICkge1xuXG4gICAgICAgICAgICAgIC8vIHNpZ25pZnkgdGhhdCB0aGlzIGxpc3RlbmVyIGlzIHJlc2VydmVkIGZvciBkcmFnZ2luZyBzbyB0aGF0IG90aGVyIGxpc3RlbmVycyBjYW4gY2hhbmdlXG4gICAgICAgICAgICAgIC8vIHRoZWlyIGJlaGF2aW9yIGR1cmluZyBzY2VuZXJ5IGV2ZW50IGRpc3BhdGNoXG4gICAgICAgICAgICAgIGV2ZW50LnBvaW50ZXIucmVzZXJ2ZUZvcktleWJvYXJkRHJhZygpO1xuXG4gICAgICAgICAgICAgIC8vIHdoZXRoZXIgd2Ugd2lsbCB1c2UgY29uc3RyYWluVmFsdWUgdG8gbW9kaWZ5IHRoZSBwcm9wb3NlZCB2YWx1ZSwgc2VlIHVzYWdlcyBiZWxvd1xuICAgICAgICAgICAgICBsZXQgdXNlQ29uc3RyYWluVmFsdWUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGZpcnN0IGtleWRvd24gdGhpcyBpcyB0aGUgc3RhcnQgb2YgdGhlIGRyYWcgaW50ZXJhY3Rpb25cbiAgICAgICAgICAgICAgaWYgKCAhdGhpcy5fYW55S2V5c0Rvd24oKSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkludGVyYWN0aW9uU3RhcnQoIGV2ZW50ICk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyB0cmFjayB0aGF0IGEgbmV3IGtleSBpcyBiZWluZyBoZWxkIGRvd25cbiAgICAgICAgICAgICAgdGhpcy5fcmFuZ2VLZXlzRG93blsga2V5IF0gPSB0cnVlO1xuXG4gICAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkuZ2V0KCk7XG4gICAgICAgICAgICAgIGlmICggSG90a2V5RGF0YS5hbnlIYXZlS2V5U3Ryb2tlKCBbIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5IT01FX0hPVEtFWV9EQVRBLCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uRU5EX0hPVEtFWV9EQVRBIF0sIGVuZ2xpc2hLZXlTdHJpbmcgKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIG9uICdlbmQnIGFuZCAnaG9tZScgc25hcCB0byBtYXggYW5kIG1pbiBvZiBlbmFibGVkIHJhbmdlIHJlc3BlY3RpdmVseSAodGhpcyBpcyB0eXBpY2FsIGJyb3dzZXJcbiAgICAgICAgICAgICAgICAvLyBiZWhhdmlvciBmb3Igc2xpZGVycylcbiAgICAgICAgICAgICAgICBpZiAoIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5FTkRfSE9US0VZX0RBVEEuaGFzS2V5U3Ryb2tlKCBlbmdsaXNoS2V5U3RyaW5nICkgKSB7XG4gICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMuX2VuYWJsZWRSYW5nZVByb3BlcnR5LmdldCgpLm1heDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5IT01FX0hPVEtFWV9EQVRBLmhhc0tleVN0cm9rZSggZW5nbGlzaEtleVN0cmluZyApICkge1xuICAgICAgICAgICAgICAgICAgbmV3VmFsdWUgPSB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzdGVwU2l6ZTtcbiAgICAgICAgICAgICAgICBpZiAoIEhvdGtleURhdGEuYW55SGF2ZUtleVN0cm9rZSggWyBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uUEFHRV9ET1dOX0hPVEtFWV9EQVRBLCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uUEFHRV9VUF9IT1RLRVlfREFUQSBdLCBlbmdsaXNoS2V5U3RyaW5nICkgKSB7XG5cbiAgICAgICAgICAgICAgICAgIC8vIG9uIHBhZ2UgdXAgYW5kIHBhZ2UgZG93biwgdGhlIGRlZmF1bHQgc3RlcCBzaXplIGlzIDEvMTAgb2YgdGhlIHJhbmdlICh0aGlzIGlzIHR5cGljYWwgYnJvd3NlciBiZWhhdmlvcilcbiAgICAgICAgICAgICAgICAgIHN0ZXBTaXplID0gdGhpcy5wYWdlS2V5Ym9hcmRTdGVwO1xuXG4gICAgICAgICAgICAgICAgICBpZiAoIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5QQUdFX1VQX0hPVEtFWV9EQVRBLmhhc0tleVN0cm9rZSggZW5nbGlzaEtleVN0cmluZyApICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkuZ2V0KCkgKyBzdGVwU2l6ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uUEFHRV9ET1dOX0hPVEtFWV9EQVRBLmhhc0tleVN0cm9rZSggZW5nbGlzaEtleVN0cmluZyApICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkuZ2V0KCkgLSBzdGVwU2l6ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIEhvdGtleURhdGEuYW55SGF2ZUtleVN0cm9rZSggW1xuICAgICAgICAgICAgICAgICAgQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLkxFRlRfQVJST1dfSE9US0VZX0RBVEEsIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5SSUdIVF9BUlJPV19IT1RLRVlfREFUQSxcbiAgICAgICAgICAgICAgICAgIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5VUF9BUlJPV19IT1RLRVlfREFUQSwgQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLkRPV05fQVJST1dfSE9US0VZX0RBVEEgXSwgZW5nbGlzaEtleVN0cmluZyApICkge1xuXG4gICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgc2hpZnQga2V5IGlzIHByZXNzZWQgZG93biwgbW9kaWZ5IHRoZSBzdGVwIHNpemUgKHRoaXMgaXMgYXR5cGljYWwgYnJvd3NlciBiZWhhdmlvciBmb3Igc2xpZGVycylcbiAgICAgICAgICAgICAgICAgIHN0ZXBTaXplID0gZG9tRXZlbnQuc2hpZnRLZXkgPyB0aGlzLnNoaWZ0S2V5Ym9hcmRTdGVwIDogdGhpcy5rZXlib2FyZFN0ZXA7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFRlbXBvcmFyeSB3b3JrYXJvdW5kLCBpZiB1c2luZyBzaGlmdCBrZXkgd2l0aCBhcnJvdyBrZXlzIHRvIHVzZSB0aGUgc2hpZnRLZXlib2FyZFN0ZXAsIGRvbid0XG4gICAgICAgICAgICAgICAgICAvLyB1c2UgY29uc3RyYWluVmFsdWUgYmVjYXVzZSB0aGUgY29uc3RyYWluVmFsdWUgaXMgb2Z0ZW4gc21hbGxlciB0aGFuIHRoZSB2YWx1ZXMgYWxsb3dlZCBieVxuICAgICAgICAgICAgICAgICAgLy8gY29uc3RyYWluVmFsdWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82OTguXG4gICAgICAgICAgICAgICAgICB1c2VDb25zdHJhaW5WYWx1ZSA9ICFkb21FdmVudC5zaGlmdEtleTtcblxuICAgICAgICAgICAgICAgICAgaWYgKCBIb3RrZXlEYXRhLmFueUhhdmVLZXlTdHJva2UoIFsgQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLlVQX0FSUk9XX0hPVEtFWV9EQVRBLCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVySG90a2V5RGF0YUNvbGxlY3Rpb24uUklHSFRfQVJST1dfSE9US0VZX0RBVEEgXSwgZW5nbGlzaEtleVN0cmluZyApICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkuZ2V0KCkgKyBzdGVwU2l6ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBIb3RrZXlEYXRhLmFueUhhdmVLZXlTdHJva2UoIFsgQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLkRPV05fQVJST1dfSE9US0VZX0RBVEEsIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbi5MRUZUX0FSUk9XX0hPVEtFWV9EQVRBIF0sIGVuZ2xpc2hLZXlTdHJpbmcgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUgPSB0aGlzLl92YWx1ZVByb3BlcnR5LmdldCgpIC0gc3RlcFNpemU7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5fcm91bmRUb1N0ZXBTaXplICkge1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IHJvdW5kVmFsdWUoIG5ld1ZhbHVlLCB0aGlzLl92YWx1ZVByb3BlcnR5LmdldCgpLCBzdGVwU2l6ZSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIE1hcCB0aGUgdmFsdWUuXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gdGhpcy5fcGRvbU1hcFZhbHVlKCBuZXdWYWx1ZSwgdGhpcy5fdmFsdWVQcm9wZXJ0eS5nZXQoKSApO1xuXG4gICAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgY29uc3RyYWluIHRoZSB2YWx1ZS4gT25seSBjb25zdHJhaW4gaWYgbW9kaWZ5aW5nIGJ5IHNoaWZ0S2V5Ym9hcmRTdGVwIGJlY2F1c2UgdGhhdCBzdGVwIHNpemVcbiAgICAgICAgICAgICAgLy8gbWF5IGFsbG93IGZpbmVyIHByZWNpc2lvbiB0aGFuIGNvbnN0cmFpblZhbHVlLiBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3JcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjk4LCBhbmQgaXMgYWN0dWFsbHkgYSBwcm9ibGVtIGZvciBhbGwga2V5Ym9hcmQgc3RlcHMgaWYgdGhleVxuICAgICAgICAgICAgICAvLyBhcmUgc21hbGxlciB0aGFuIHZhbHVlcyBhbGxvd2VkIGJ5IGNvbnN0cmFpblZhbHVlLiBJbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy83MDMgd2VcbiAgICAgICAgICAgICAgLy8gd2lsbCB3b3JrIHRvIHJlc29sdmUgdGhpcyBtb3JlIGdlbmVyYWxseS5cbiAgICAgICAgICAgICAgbGV0IGNvbnN0cmFpbmVkVmFsdWUgPSBtYXBwZWRWYWx1ZTtcbiAgICAgICAgICAgICAgaWYgKCB1c2VDb25zdHJhaW5WYWx1ZSApIHtcbiAgICAgICAgICAgICAgICBjb25zdHJhaW5lZFZhbHVlID0gdGhpcy5fY29uc3RyYWluVmFsdWUoIG1hcHBlZFZhbHVlICk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBsaW1pdCB0aGUgdmFsdWUgdG8gdGhlIGVuYWJsZWQgcmFuZ2VcbiAgICAgICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eS5zZXQoIFV0aWxzLmNsYW1wKCBjb25zdHJhaW5lZFZhbHVlLCB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4sIHRoaXMuX2VuYWJsZWRSYW5nZVByb3BlcnR5LmdldCgpLm1heCApICk7XG5cbiAgICAgICAgICAgICAgLy8gb3B0aW9uYWwgY2FsbGJhY2sgYWZ0ZXIgdGhlIHZhbHVlUHJvcGVydHkgaXMgc2V0IChldmVuIGlmIHNldCB0byB0aGUgc2FtZSB2YWx1ZSkgc28gdGhhdCB0aGUgbGlzdGVuZXJcbiAgICAgICAgICAgICAgLy8gY2FuIHVzZSB0aGUgbmV3IHZhbHVlLlxuICAgICAgICAgICAgICB0aGlzLl9vbklucHV0KCBldmVudCwgdGhpcy5fdmFsdWVPblN0YXJ0ICk7XG5cbiAgICAgICAgICAgICAgLy8gYWZ0ZXIgYW55IGtleWJvYXJkIGlucHV0LCBtYWtlIHN1cmUgdGhhdCB0aGUgTm9kZSBzdGF5cyBpbiB2aWV3XG4gICAgICAgICAgICAgIGNvbnN0IHBhblRhcmdldE5vZGUgPSB0aGlzLl9wYW5UYXJnZXROb2RlIHx8IHRoaXM7XG4gICAgICAgICAgICAgIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5pbml0aWFsaXplZCAmJiBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIucGFuVG9Ob2RlKCBwYW5UYXJnZXROb2RlLCB0cnVlLCBwYW5UYXJnZXROb2RlLmxpbWl0UGFuRGlyZWN0aW9uICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlIGtleSB1cCBldmVudCBvbiB0aGlzIGFjY2Vzc2libGUgc2xpZGVyLCBtYW5hZ2luZyB0aGUgc2hpZnQga2V5LCBhbmQgY2FsbGluZyBhbiBvcHRpb25hbCBlbmREcmFnXG4gICAgICAgKiBmdW5jdGlvbiBvbiByZWxlYXNlLiBBZGQgdGhpcyBhcyBhbiBpbnB1dCBsaXN0ZW5lciB0byB0aGUgbm9kZSBtaXhpbmcgaW4gQWNjZXNzaWJsZVZhbHVlSGFuZGxlci5cbiAgICAgICAqIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBoYW5kbGVLZXlVcCggZXZlbnQ6IFNjZW5lcnlFdmVudDxLZXlib2FyZEV2ZW50PiApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY29kZSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBldmVudC5kb21FdmVudCApITtcbiAgICAgICAgY29uc3QgZW5nbGlzaEtleVN0cmluZyA9IGV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyggY29kZSApITtcblxuICAgICAgICAvLyBoYW5kbGUgY2FzZSB3aGVyZSB1c2VyIHRhYmJlZCB0byB0aGlzIGlucHV0IHdoaWxlIGFuIGFycm93IGtleSBtaWdodCBoYXZlIGJlZW4gaGVsZCBkb3duXG4gICAgICAgIGlmICggdGhpcy5fYWxsS2V5c1VwKCkgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzZXQgc2hpZnQga2V5IGZsYWcgd2hlbiB3ZSByZWxlYXNlIGl0XG4gICAgICAgIGlmICggQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLlNISUZUX0hPVEtFWV9EQVRBLmhhc0tleVN0cm9rZSggZW5nbGlzaEtleVN0cmluZyApICkge1xuICAgICAgICAgIHRoaXMuX3NoaWZ0S2V5ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LmdldCgpICkge1xuICAgICAgICAgIGlmICggQWNjZXNzaWJsZVZhbHVlSGFuZGxlckhvdGtleURhdGFDb2xsZWN0aW9uLmlzUmFuZ2VLZXkoIGVuZ2xpc2hLZXlTdHJpbmcgKSApIHtcbiAgICAgICAgICAgIHRoaXMuX3JhbmdlS2V5c0Rvd25bIGNvZGUgXSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyB3aGVuIGFsbCByYW5nZSBrZXlzIGFyZSByZWxlYXNlZCwgd2UgYXJlIGRvbmUgZHJhZ2dpbmdcbiAgICAgICAgICAgIGlmICggdGhpcy5fYWxsS2V5c1VwKCkgKSB7XG4gICAgICAgICAgICAgIHRoaXMuX29uSW50ZXJhY3Rpb25FbmQoIGV2ZW50ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVm9pY2VPdmVyIHNlbmRzIGEgXCJjaGFuZ2VcIiBldmVudCB0byB0aGUgc2xpZGVyIChOT1QgYW4gaW5wdXQgZXZlbnQpLCBzbyB3ZSBuZWVkIHRvIGhhbmRsZSB0aGUgY2FzZSB3aGVuXG4gICAgICAgKiBhIGNoYW5nZSBldmVudCBpcyBzZW50IGJ1dCBhbiBpbnB1dCBldmVudCBpbnMndCBoYW5kbGVkLiBHdWFyZGVkIGFnYWluc3QgdGhlIGNhc2UgdGhhdCBCT1RIIGNoYW5nZSBhbmRcbiAgICAgICAqIGlucHV0IGFyZSBzZW50IHRvIHRoZSBicm93c2VyIGJ5IHRoZSBBVC5cbiAgICAgICAqXG4gICAgICAgKiBBZGQgdGhpcyBhcyBhIGxpc3RlbmVyIHRvIHRoZSAnY2hhbmdlJyBpbnB1dCBldmVudCBvbiB0aGUgTm9kZSB0aGF0IGlzIG1peGluZyBpbiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLlxuICAgICAgICogQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgICAqL1xuICAgICAgcHVibGljIGhhbmRsZUNoYW5nZSggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcblxuICAgICAgICBpZiAoICF0aGlzLl9wZG9tSW5wdXRIYW5kbGVkICkge1xuICAgICAgICAgIHRoaXMuaGFuZGxlSW5wdXQoIGV2ZW50ICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wZG9tSW5wdXRIYW5kbGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSGFuZGxlIGEgZGlyZWN0ICdpbnB1dCcgZXZlbnQgdGhhdCBtaWdodCBjb21lIGZyb20gYXNzaXN0aXZlIHRlY2hub2xvZ3kuIEl0IGlzIHBvc3NpYmxlIHRoYXQgdGhlIHVzZXIgYWdlbnRcbiAgICAgICAqIChwYXJ0aWN1bGFybHkgVm9pY2VPdmVyLCBvciBhIHN3aXRjaCBkZXZpY2UpIHdpbGwgaW5pdGlhdGUgYW4gaW5wdXQgZXZlbnQgZGlyZWN0bHkgd2l0aG91dCBnb2luZyB0aHJvdWdoXG4gICAgICAgKiBrZXlkb3duLiBJbiB0aGF0IGNhc2UsIGhhbmRsZSB0aGUgY2hhbmdlIGRlcGVuZGluZyBvbiB3aGljaCBkaXJlY3Rpb24gdGhlIHVzZXIgdHJpZWQgdG8gZ28uIFdlIGRldGVybWluZVxuICAgICAgICogdGhpcyBieSBkZXRlY3RpbmcgaG93IHRoZSBpbnB1dCB2YWx1ZSBjaGFuZ2VkIGluIHJlc3BvbnNlIHRvIHRoZSBgaW5wdXRgIGV2ZW50IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50XG4gICAgICAgKiB2YWx1ZSBvZiB0aGUgdmFsdWVQcm9wZXJ0eS5cbiAgICAgICAqXG4gICAgICAgKiBOb3RlIHRoYXQgaXQgaXMgaW1wb3J0YW50IHRvIGhhbmRsZSB0aGUgXCJpbnB1dFwiIGV2ZW50LCByYXRoZXIgdGhhbiB0aGUgXCJjaGFuZ2VcIiBldmVudC4gVGhlIFwiaW5wdXRcIiB3aWxsXG4gICAgICAgKiBmaXJlIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMgZnJvbSBhIGdlc3R1cmUsIHdoaWxlIHRoZSBcImNoYW5nZVwiIHdpbGwgb25seSBoYXBwZW4gb24gc3VibWlzc2lvbiwgbGlrZSBhc1xuICAgICAgICogbmF2aWdhdGluZyBhd2F5IGZyb20gdGhlIGVsZW1lbnQuXG4gICAgICAgKlxuICAgICAgICogQWRkIHRoaXMgYXMgYSBsaXN0ZW5lciB0byB0aGUgYGlucHV0YCBldmVudCBvbiB0aGUgTm9kZSB0aGF0IGlzIG1peGluZyBpbiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLlxuICAgICAgICogQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgICAqL1xuICAgICAgcHVibGljIGhhbmRsZUlucHV0KCBldmVudDogU2NlbmVyeUV2ZW50ICk6IHZvaWQge1xuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LmdldCgpICYmICF0aGlzLl9ibG9ja0lucHV0ICkge1xuXG4gICAgICAgICAgLy8gZG9uJ3QgaGFuZGxlIGFnYWluIG9uIFwiY2hhbmdlXCIgZXZlbnRcbiAgICAgICAgICB0aGlzLl9wZG9tSW5wdXRIYW5kbGVkID0gdHJ1ZTtcblxuICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IHRoaXMuX3ZhbHVlUHJvcGVydHkuZ2V0KCk7XG5cbiAgICAgICAgICBjb25zdCBpbnB1dFZhbHVlID0gcGFyc2VGbG9hdCggKCBldmVudC5kb21FdmVudCEudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQgKS52YWx1ZSApO1xuICAgICAgICAgIGNvbnN0IHN0ZXBTaXplID0gdGhpcy5fc2hpZnRLZXkgPyB0aGlzLnNoaWZ0S2V5Ym9hcmRTdGVwIDogdGhpcy5rZXlib2FyZFN0ZXA7XG4gICAgICAgICAgY29uc3QgbWFwcGVkVmFsdWUgPSB0aGlzLl9nZXRNYXBwZWRWYWx1ZSgpO1xuXG4gICAgICAgICAgLy8gc3RhcnQgb2YgY2hhbmdlIGV2ZW50IGlzIHN0YXJ0IG9mIGRyYWdcbiAgICAgICAgICB0aGlzLl9vbkludGVyYWN0aW9uU3RhcnQoIGV2ZW50ICk7XG5cbiAgICAgICAgICBpZiAoIGlucHV0VmFsdWUgPiBtYXBwZWRWYWx1ZSApIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gdGhpcy5fdmFsdWVQcm9wZXJ0eS5nZXQoKSArIHN0ZXBTaXplO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggaW5wdXRWYWx1ZSA8IG1hcHBlZFZhbHVlICkge1xuICAgICAgICAgICAgbmV3VmFsdWUgPSB0aGlzLl92YWx1ZVByb3BlcnR5LmdldCgpIC0gc3RlcFNpemU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCB0aGlzLl9yb3VuZFRvU3RlcFNpemUgKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSA9IHJvdW5kVmFsdWUoIG5ld1ZhbHVlLCB0aGlzLl92YWx1ZVByb3BlcnR5LmdldCgpLCBzdGVwU2l6ZSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGxpbWl0IHRvIGVuYWJsZWQgcmFuZ2VcbiAgICAgICAgICBuZXdWYWx1ZSA9IFV0aWxzLmNsYW1wKCBuZXdWYWx1ZSwgdGhpcy5fZW5hYmxlZFJhbmdlUHJvcGVydHkuZ2V0KCkubWluLCB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggKTtcblxuICAgICAgICAgIC8vIG9wdGlvbmFsbHkgY29uc3RyYWluIHZhbHVlXG4gICAgICAgICAgdGhpcy5fdmFsdWVQcm9wZXJ0eS5zZXQoIHRoaXMuX2NvbnN0cmFpblZhbHVlKCB0aGlzLl9wZG9tTWFwVmFsdWUoIG5ld1ZhbHVlLCB0aGlzLl92YWx1ZVByb3BlcnR5LmdldCgpICkgKSApO1xuXG4gICAgICAgICAgLy8gb25seSBvbmUgY2hhbmdlIHBlciBpbnB1dCwgYnV0IHN0aWxsIGNhbGwgb3B0aW9uYWwgb25JbnB1dCBmdW5jdGlvbiAtIGFmdGVyIHZhbHVlUHJvcGVydHkgaXMgc2V0IChldmVuIGlmXG4gICAgICAgICAgLy8gc2V0IHRvIHRoZSBzYW1lIHZhbHVlKSBzbyBsaXN0ZW5lciBjYW4gdXNlIG5ldyB2YWx1ZS5cbiAgICAgICAgICB0aGlzLl9vbklucHV0KCBldmVudCwgdGhpcy5fdmFsdWVPblN0YXJ0ICk7XG5cbiAgICAgICAgICAvLyBlbmQgb2YgY2hhbmdlIGlzIHRoZSBlbmQgb2YgYSBkcmFnXG4gICAgICAgICAgdGhpcy5fb25JbnRlcmFjdGlvbkVuZCggZXZlbnQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IGJsb2NrIHRoZSBuZXh0IGlucHV0IGFmdGVyIHJlY2VpdmluZyBvbmUsIHNvbWUgQVQgbWF5IHNlbmQgZWl0aGVyIGBrZXlkb3duYCBvciBgaW5wdXRgIGV2ZW50c1xuICAgICAgICAvLyBkZXBlbmRpbmcgb24gbW9kaWZpZXIga2V5cyBzbyB3ZSBuZWVkIHRvIGJlIHJlYWR5IHRvIHJlY2VpdmUgZWl0aGVyIG9uIG5leHQgaW50ZXJhY3Rpb25cbiAgICAgICAgdGhpcy5fYmxvY2tJbnB1dCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIGFjY2Vzc2libGUgc2xpZGVyIGxvc2VzIGZvY3VzLlxuICAgICAgICpcbiAgICAgICAqIEFkZCB0aGlzIGFzIGEgbGlzdGVuZXIgb24gdGhlIGBibHVyYCBldmVudCB0byB0aGUgTm9kZSB0aGF0IGlzIG1peGluZyBpbiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLlxuICAgICAgICogQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgICAqL1xuICAgICAgcHVibGljIGhhbmRsZUJsdXIoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8Rm9jdXNFdmVudD4gKTogdm9pZCB7XG5cbiAgICAgICAgLy8gaWYgYW55IHJhbmdlIGtleXMgYXJlIGN1cnJlbnRseSBkb3duLCBjYWxsIGVuZCBkcmFnIGJlY2F1c2UgdXNlciBoYXMgc3RvcHBlZCBkcmFnZ2luZyB0byBkbyBzb21ldGhpbmcgZWxzZVxuICAgICAgICBpZiAoIHRoaXMuX2FueUtleXNEb3duKCkgKSB7XG4gICAgICAgICAgdGhpcy5fb25JbnRlcmFjdGlvbkVuZCggZXZlbnQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlc2V0IGZsYWcgaW4gY2FzZSB3ZSBzaGlmdC10YWJiZWQgYXdheSBmcm9tIHNsaWRlclxuICAgICAgICB0aGlzLl9zaGlmdEtleSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHdoZW4gZm9jdXMgbGVhdmVzIHRoaXMgZWxlbWVudCBzdG9wIGJsb2NraW5nIGlucHV0IGV2ZW50c1xuICAgICAgICB0aGlzLl9ibG9ja0lucHV0ID0gZmFsc2U7XG5cbiAgICAgICAgLy8gcmVzZXQgY291bnRlciBmb3IgcmFuZ2Uga2V5cyBkb3duXG4gICAgICAgIHRoaXMuX3JhbmdlS2V5c0Rvd24gPSB7fTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBJbnRlcmFjdGlvbiB3aXRoIHRoaXMgaW5wdXQgaGFzIHN0YXJ0ZWQsIHNhdmUgdGhlIHZhbHVlIG9uIHN0YXJ0IHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgYXMgYW4gXCJvbGRcIiB2YWx1ZVxuICAgICAgICogd2hlbiBnZW5lcmF0aW5nIHRoZSBjb250ZXh0IHJlc3BvbnNlIHdpdGggb3B0aW9uIHBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2UuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX29uSW50ZXJhY3Rpb25TdGFydCggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5fcGRvbVBvaW50ZXIsICdQb2ludGVyIHNob3VsZCBoYXZlIGJlZW4gY2xlYXJlZCBhbmQgZGV0YWNoZWQgb24gZW5kIG9yIGludGVycnVwdC4nICk7XG4gICAgICAgIHRoaXMuX3Bkb21Qb2ludGVyID0gZXZlbnQucG9pbnRlciBhcyBQRE9NUG9pbnRlcjtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wZG9tUG9pbnRlci5hdHRhY2hlZExpc3RlbmVyICE9PSB0aGlzLl9wZG9tUG9pbnRlckxpc3RlbmVyLCAnVGhpcyBwb2ludGVyIGxpc3RlbmVyIHdhcyBuZXZlciByZW1vdmVkIScgKTtcbiAgICAgICAgdGhpcy5fcGRvbVBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fcGRvbVBvaW50ZXJMaXN0ZW5lciwgdHJ1ZSApO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlT25TdGFydCA9IHRoaXMuX3ZhbHVlUHJvcGVydHkudmFsdWU7XG4gICAgICAgIHRoaXMuX3N0YXJ0SW5wdXQoIGV2ZW50ICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogSW50ZXJhY3Rpb24gd2l0aCB0aGlzIGlucHV0IGhhcyBjb21wbGV0ZWQsIGdlbmVyYXRlIGFuIHV0dGVyYW5jZSBkZXNjcmliaW5nIGNoYW5nZXMgaWYgbmVjZXNzYXJ5IGFuZCBjYWxsXG4gICAgICAgKiBvcHRpb25hbCBcImVuZFwiIGZ1bmN0aW9uLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBbZXZlbnRdIC0gRXZlbnQgaXMgbm90IGd1YXJhbnRlZWQgYmVjYXVzZSB3ZSBuZWVkIHRvIHN1cHBvcnQgaW50ZXJydXB0aW9uXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX29uSW50ZXJhY3Rpb25FbmQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgfCBudWxsICk6IHZvaWQge1xuXG4gICAgICAgIC8vIEl0IGlzIHBvc3NpYmxlIHRoYXQgaW50ZXJhY3Rpb24gYWxyZWFkeSBlbmRlZC4gVGhpcyBjYW4gaGFwcGVuIGlmIHRoZSBwb2ludGVyIGlzIGludGVycnVwdGVkIGp1c3QgYmVmb3JlXG4gICAgICAgIC8vIHJlY2VpdmluZyBhIGtleXVwIGV2ZW50LiBUaGlzIGlzIGEgcmFyZSBjYXNlIGFuZCBzaG91bGQgb25seSBiZSBwb3NzaWJsZSB3aGlsZSBmdXp6aW5nLlxuICAgICAgICBpZiAoIHRoaXMuX3Bkb21Qb2ludGVyICkge1xuXG4gICAgICAgICAgdGhpcy5hbGVydENvbnRleHRSZXNwb25zZSgpO1xuICAgICAgICAgIHRoaXMudm9pY2luZ09uRW5kUmVzcG9uc2UoIHRoaXMuX3ZhbHVlT25TdGFydCApO1xuICAgICAgICAgIHRoaXMuX2VuZElucHV0KCBldmVudCApO1xuXG4gICAgICAgICAgLy8gZGV0YWNoIHRoZSBwb2ludGVyIGxpc3RlbmVyIHRoYXQgd2FzIGF0dGFjaGVkIG9uIGtleWRvd25cbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9wZG9tUG9pbnRlci5hdHRhY2hlZExpc3RlbmVyID09PSB0aGlzLl9wZG9tUG9pbnRlckxpc3RlbmVyLCAncG9pbnRlciBsaXN0ZW5lciBzaG91bGQgYmUgYXR0YWNoZWQnICk7XG4gICAgICAgICAgdGhpcy5fcGRvbVBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5fcGRvbVBvaW50ZXJMaXN0ZW5lciApO1xuICAgICAgICAgIHRoaXMuX3Bkb21Qb2ludGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB0aGUgZGVsdGEgZm9yIHRoZSB2YWx1ZSBQcm9wZXJ0eSB3aGVuIHVzaW5nIGFycm93IGtleXMgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgTm9kZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldEtleWJvYXJkU3RlcCgga2V5Ym9hcmRTdGVwOiBudW1iZXIgKTogdm9pZCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGtleWJvYXJkU3RlcCA+PSAwLCAna2V5Ym9hcmQgc3RlcCBtdXN0IGJlIG5vbi1uZWdhdGl2ZScgKTtcblxuICAgICAgICB0aGlzLl9rZXlib2FyZFN0ZXAgPSBrZXlib2FyZFN0ZXA7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQga2V5Ym9hcmRTdGVwKCBrZXlib2FyZFN0ZXA6IG51bWJlciApIHsgdGhpcy5zZXRLZXlib2FyZFN0ZXAoIGtleWJvYXJkU3RlcCApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQga2V5Ym9hcmRTdGVwKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEtleWJvYXJkU3RlcCgpOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBkZWx0YSBmb3IgdmFsdWUgUHJvcGVydHkgd2hlbiB1c2luZyBhcnJvdyBrZXlzLlxuICAgICAgICovXG4gICAgICBwdWJsaWMgZ2V0S2V5Ym9hcmRTdGVwKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9rZXlib2FyZFN0ZXA7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IHRoZSBkZWx0YSBmb3IgdmFsdWUgUHJvcGVydHkgd2hlbiB1c2luZyBhcnJvdyBrZXlzIHdpdGggc2hpZnQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgTm9kZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNldFNoaWZ0S2V5Ym9hcmRTdGVwKCBzaGlmdEtleWJvYXJkU3RlcDogbnVtYmVyICk6IHZvaWQge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaGlmdEtleWJvYXJkU3RlcCA+PSAwLCAnc2hpZnQga2V5Ym9hcmQgc3RlcCBtdXN0IGJlIG5vbi1uZWdhdGl2ZScgKTtcblxuICAgICAgICB0aGlzLl9zaGlmdEtleWJvYXJkU3RlcCA9IHNoaWZ0S2V5Ym9hcmRTdGVwO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHNoaWZ0S2V5Ym9hcmRTdGVwKCBzaGlmdEtleWJvYXJkU3RlcDogbnVtYmVyICkgeyB0aGlzLnNldFNoaWZ0S2V5Ym9hcmRTdGVwKCBzaGlmdEtleWJvYXJkU3RlcCApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgc2hpZnRLZXlib2FyZFN0ZXAoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0U2hpZnRLZXlib2FyZFN0ZXAoKTsgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEdldCB0aGUgZGVsdGEgZm9yIHZhbHVlIFByb3BlcnR5IHdoZW4gdXNpbmcgYXJyb3cga2V5cyB3aXRoIHNoaWZ0IHRvIGludGVyYWN0IHdpdGggdGhlIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRTaGlmdEtleWJvYXJkU3RlcCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2hpZnRLZXlib2FyZFN0ZXA7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBzaGlmdCBrZXkgaXMgY3VycmVudGx5IGhlbGQgZG93biBvbiB0aGlzIHNsaWRlciwgY2hhbmdpbmcgdGhlIHNpemUgb2Ygc3RlcC5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGdldFNoaWZ0S2V5RG93bigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NoaWZ0S2V5O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHNoaWZ0S2V5RG93bigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZ2V0U2hpZnRLZXlEb3duKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBTZXQgdGhlIGRlbHRhIGZvciB2YWx1ZSBQcm9wZXJ0eSB3aGVuIHVzaW5nIHBhZ2UgdXAvcGFnZSBkb3duIHRvIGludGVyYWN0IHdpdGggdGhlIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBzZXRQYWdlS2V5Ym9hcmRTdGVwKCBwYWdlS2V5Ym9hcmRTdGVwOiBudW1iZXIgKTogdm9pZCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhZ2VLZXlib2FyZFN0ZXAgPj0gMCwgJ3BhZ2Uga2V5Ym9hcmQgc3RlcCBtdXN0IGJlIG5vbi1uZWdhdGl2ZScgKTtcblxuICAgICAgICB0aGlzLl9wYWdlS2V5Ym9hcmRTdGVwID0gcGFnZUtleWJvYXJkU3RlcDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBwYWdlS2V5Ym9hcmRTdGVwKCBwYWdlS2V5Ym9hcmRTdGVwOiBudW1iZXIgKSB7IHRoaXMuc2V0UGFnZUtleWJvYXJkU3RlcCggcGFnZUtleWJvYXJkU3RlcCApOyB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcGFnZUtleWJvYXJkU3RlcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRQYWdlS2V5Ym9hcmRTdGVwKCk7IH1cblxuICAgICAgLyoqXG4gICAgICAgKiBHZXQgdGhlIGRlbHRhIGZvciB2YWx1ZSBQcm9wZXJ0eSB3aGVuIHVzaW5nIHBhZ2UgdXAvcGFnZSBkb3duIHRvIGludGVyYWN0IHdpdGggdGhlIE5vZGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRQYWdlS2V5Ym9hcmRTdGVwKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYWdlS2V5Ym9hcmRTdGVwO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB0aGUgb3JpZW50YXRpb24gZm9yIHRoZSBzbGlkZXIgYXMgc3BlY2lmaWVkIGJ5IGh0dHBzOi8vd3d3LnczLm9yZy9UUi93YWktYXJpYS0xLjEvI2FyaWEtb3JpZW50YXRpb24uXG4gICAgICAgKiBEZXBlbmRpbmcgb24gdGhlIHZhbHVlIG9mIHRoaXMgYXR0cmlidXRlLCBhIHNjcmVlbiByZWFkZXIgd2lsbCBnaXZlIGRpZmZlcmVudCBpbmRpY2F0aW9ucyBhYm91dCB3aGljaFxuICAgICAgICogYXJyb3cga2V5cyBzaG91bGQgYmUgdXNlZFxuICAgICAgICovXG4gICAgICBwdWJsaWMgc2V0QXJpYU9yaWVudGF0aW9uKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogdm9pZCB7XG5cbiAgICAgICAgdGhpcy5fYXJpYU9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gICAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtb3JpZW50YXRpb24nLCBvcmllbnRhdGlvbi5hcmlhT3JpZW50YXRpb24gKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBhcmlhT3JpZW50YXRpb24oIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApIHsgdGhpcy5zZXRBcmlhT3JpZW50YXRpb24oIG9yaWVudGF0aW9uICk7IH1cblxuICAgICAgcHVibGljIGdldCBhcmlhT3JpZW50YXRpb24oKTogT3JpZW50YXRpb24geyByZXR1cm4gdGhpcy5fYXJpYU9yaWVudGF0aW9uOyB9XG5cbiAgICAgIC8qKlxuICAgICAgICogR2V0IHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgYWNjZXNzaWJsZSBzbGlkZXIsIHNlZSBzZXRBcmlhT3JpZW50YXRpb24gZm9yIGluZm9ybWF0aW9uIG9uIHRoZSBiZWhhdmlvciBvZiB0aGlzXG4gICAgICAgKiBhdHRyaWJ1dGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBnZXRBcmlhT3JpZW50YXRpb24oKTogT3JpZW50YXRpb24ge1xuICAgICAgICByZXR1cm4gdGhpcy5fYXJpYU9yaWVudGF0aW9uO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiBhbGwgcmFuZ2Uga2V5cyBhcmUgY3VycmVudGx5IHVwIChub3QgaGVsZCBkb3duKS5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBfYWxsS2V5c1VwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gXy5ldmVyeSggdGhpcy5fcmFuZ2VLZXlzRG93biwgZW50cnkgPT4gIWVudHJ5ICk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIGFueSByYW5nZSBrZXlzIGFyZSBjdXJyZW50bHkgZG93biBvbiB0aGlzIHNsaWRlci4gVXNlZnVsIGZvciBkZXRlcm1pbmluZyB3aGVuIHRvIGNhbGxcbiAgICAgICAqIHN0YXJ0RHJhZyBvciBlbmREcmFnIGJhc2VkIG9uIGludGVyYWN0aW9uLlxuICAgICAgICovXG4gICAgICBwcml2YXRlIF9hbnlLZXlzRG93bigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhXy5maW5kKCB0aGlzLl9yYW5nZUtleXNEb3duLCBlbnRyeSA9PiBlbnRyeSApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNldCB0aGUgYHN0ZXBgIGF0dHJpYnV0ZSBvbiBhY2Nlc3NpYmxlIHNpYmxpbmdzIGZvciB0aGlzIE5vZGUuIFVzdWFsbHksIHdlIGNhbiB1c2UgdGhlICdhbnknIHZhbHVlLFxuICAgICAgICogd2hpY2ggbWVhbnMgdGhhdCBhbnkgdmFsdWUgd2l0aGluIHRoZSByYW5nZSBpcyBhbGxvd2VkLiBIb3dldmVyLCBpT1MgVm9pY2VPdmVyIGRvZXMgbm90IHN1cHBvcnQgJ2FueSdcbiAgICAgICAqIHNvIHdlIGhhdmUgdG8gY2FsY3VsYXRlIGEgdmFsaWQgc3RlcCB2YWx1ZSBmb3IgbW9iaWxlIFNhZmFyaS5cbiAgICAgICAqXG4gICAgICAgKiBUaGUgc3RlcCBhdHRyaWJ1dGUgbXVzdCBiZSBub24temVyby4gT25seSB2YWx1ZXMgd2hpY2ggYXJlIGVxdWFsIHRvIG1pbiB2YWx1ZSBwbHVzXG4gICAgICAgKiB0aGUgYmFzaXMgb2Ygc3RlcCBhcmUgYWxsb3dlZC4gSW4gb3RoZXIgd29yZHMsIHRoZSBmb2xsb3dpbmcgbXVzdCBhbHdheXMgYmUgdHJ1ZTpcbiAgICAgICAqIHZhbHVlID0gbWluICsgbiAqIHN0ZXAgd2hlcmUgdmFsdWUgPD0gbWF4IGFuZCBuIGlzIGFuIGludGVnZXIuXG4gICAgICAgKlxuICAgICAgICogSWYgdGhlIGlucHV0IHZhbHVlIGlzIHNldCB0byBhbnl0aGluZyBlbHNlLCB0aGUgcmVzdWx0IGlzIGNvbmZ1c2luZ1xuICAgICAgICoga2V5Ym9hcmQgYmVoYXZpb3IgYW5kIHRoZSBzY3JlZW4gcmVhZGVyIHdpbGwgc2F5IFwiSW52YWxpZFwiIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuXG4gICAgICAgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9FbGVtZW50L2lucHV0L251bWJlciNzdGVwXG4gICAgICAgKlxuICAgICAgICogVGhpcyBsaW1pdGF0aW9uIGlzIHRvbyByZXN0cmljdGl2ZSBmb3IgUGhFVCBhcyBtYW55IHNsaWRlcnMgc3BhbiBwaHlzaWNhbCByYW5nZXMgd2l0aCBrZXlib2FyZCBzdGVwcyB0aGF0XG4gICAgICAgKiBhcmUgZGVzaWduIHRvIGJlIGNvbnZlbmllbnQgb3IgcGVkYWdvZ2ljYWxseSB1c2VmdWwuIEZvciBleGFtcGxlLCBhIHNsaWRlciB0aGF0IHNwYW5zIDAuMDEgdG8gMTUgcmVxdWlyZXNcbiAgICAgICAqIGEgc3RlcCBvZiAxLCBidXQgRE9NIHNwZWNpZmljYXRpb24gd291bGQgb25seSBhbGxvdyB2YWx1ZXMgMC4wMSwgMS4wMSwgMi4wMSwgLi4uXG4gICAgICAgKlxuICAgICAgICogVGhpcyByZXN0cmljdGlvbiBpcyB3aHkgYHN0ZXBgIGF0dHJpYnV0ZSBjYW5ub3QgZXF1YWwga2V5Ym9hcmRTdGVwIG9mIHRoaXMgdHJhaXQuXG4gICAgICAgKlxuICAgICAgICogQWxzbywgaWYgdGhlIHN0ZXAgYXR0cmlidXRlIGlzIHRvbyBzbWFsbCByZWxhdGl2ZSB0byB0aGUgZW50aXJlIHJhbmdlIG9mIHRoZSBzbGlkZXIgVm9pY2VPdmVyIGRvZXNuJ3QgYWxsb3dcbiAgICAgICAqIGFueSBpbnB1dCBldmVudHMgYmVjYXVzZS4uLlZvaWNlT3ZlciBpcyBqdXN0IGludGVyZXN0aW5nIGxpa2UgdGhhdC5cbiAgICAgICAqXG4gICAgICAgKiBDdXJyZW50IHdvcmthcm91bmQgZm9yIGFsbCBvZiB0aGlzIGlzIHRvIHNldCB0aGUgc3RlcCBzaXplIHRvIHN1cHBvcnQgdGhlIHByZWNpc2lvbiBvZiB0aGUgdmFsdWUgcmVxdWlyZWRcbiAgICAgICAqIGJ5IHRoZSBjbGllbnQgc28gdGhhdCBhbGwgdmFsdWVzIGFyZSBhbGxvd2VkLiBJZiB3ZSBlbmNvdW50ZXIgdGhlIFZvaWNlT3ZlciBjYXNlIGRlc2NyaWJlZCBhYm92ZSB3ZSBmYWxsXG4gICAgICAgKiBiYWNrIHRvIHNldHRpbmcgdGhlIHN0ZXAgc2l6ZSBhdCAxLzEwMHRoIG9mIHRoZSBtYXggdmFsdWUgc2luY2UgdGhlIGtleWJvYXJkIHN0ZXAgZ2VuZXJhbGx5IGV2ZW5seSBkaXZpZGVzXG4gICAgICAgKiB0aGUgbWF4IHZhbHVlIHJhdGhlciB0aGFuIHRoZSBmdWxsIHJhbmdlLlxuICAgICAgICpcbiAgICAgICAqIFNlZSB0aGUgZm9sbG93aW5nIGlzc3VlcyBmb3IgaGlzdG9yeTpcbiAgICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzQxM1xuICAgICAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvODczXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgX3VwZGF0ZVNpYmxpbmdTdGVwQXR0cmlidXRlKCk6IHZvaWQge1xuICAgICAgICBsZXQgc3RlcFZhbHVlOiBudW1iZXIgfCBzdHJpbmcgPSAnYW55JztcblxuICAgICAgICAvLyBUT0RPOiBSZW1vdmUgd2hlbiBpT1MgU2FmYXJpIHN1cHBvcnRzIHRoZSAnYW55Jywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hMTF5LXJlc2VhcmNoL2lzc3Vlcy8xOTFcbiAgICAgICAgaWYgKCBwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgKSB7XG5cbiAgICAgICAgICBjb25zdCBzbWFsbGVzdFN0ZXAgPSBNYXRoLm1pbiggdGhpcy5rZXlib2FyZFN0ZXAsIHRoaXMuc2hpZnRLZXlib2FyZFN0ZXAsIHRoaXMucGFnZUtleWJvYXJkU3RlcCApO1xuICAgICAgICAgIHN0ZXBWYWx1ZSA9IE1hdGgucG93KCAxMCwgLVV0aWxzLm51bWJlck9mRGVjaW1hbFBsYWNlcyggc21hbGxlc3RTdGVwICkgKTtcblxuICAgICAgICAgIGNvbnN0IG1hcHBlZE1pbiA9IHRoaXMuX2dldE1hcHBlZFZhbHVlKCB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4gKTtcbiAgICAgICAgICBjb25zdCBtYXBwZWRNYXggPSB0aGlzLl9nZXRNYXBwZWRWYWx1ZSggdGhpcy5fZW5hYmxlZFJhbmdlUHJvcGVydHkuZ2V0KCkubWF4ICk7XG4gICAgICAgICAgY29uc3QgbWFwcGVkTGVuZ3RoID0gbWFwcGVkTWF4IC0gbWFwcGVkTWluO1xuXG4gICAgICAgICAgLy8gSWYgdGhlIHN0ZXAgaXMgdG9vIHNtYWxsIHJlbGF0aXZlIHRvIGZ1bGwgcmFuZ2UgZm9yIFZvaWNlT3ZlciB0byByZWNlaXZlIGlucHV0LCBmYWxsIGJhY2sgdG8gYSBwb3J0aW9uIG9mXG4gICAgICAgICAgLy8gdGhlIG1heCB2YWx1ZSBhcyBhIHdvcmthcm91bmQuXG4gICAgICAgICAgaWYgKCBzdGVwVmFsdWUgLyBtYXBwZWRMZW5ndGggPCAxZS01ICkge1xuICAgICAgICAgICAgc3RlcFZhbHVlID0gbWFwcGVkTWF4IC8gMTAwO1xuXG4gICAgICAgICAgICAvLyBMaW1pdCB0aGUgcHJlY2lzaW9uIG9mIHRoZSBjYWxjdWxhdGVkIHZhbHVlLiAgVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBvdGhlcndpc2UgZmxvYXRpbmcgcG9pbnRcbiAgICAgICAgICAgIC8vIGluYWNjdXJhY2llcyBjYW4gbGVhZCB0byBwcm9ibGVtYXRpYyBiZWhhdmlvcnMgd2l0aCBzY3JlZW4gcmVhZGVycyxcbiAgICAgICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JlZW5ob3VzZS1lZmZlY3QvaXNzdWVzLzM4OC4gVGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgd2FzIGNob3NlblxuICAgICAgICAgICAgLy8gc29tZXdoYXQgYXJiaXRyYXJpbHkuXG4gICAgICAgICAgICBzdGVwVmFsdWUgPSBOdW1iZXIoIHN0ZXBWYWx1ZS50b1ByZWNpc2lvbiggOCApICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnc3RlcCcsIHN0ZXBWYWx1ZSApO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIENhbGwgdGhpcyB0byB0cmlnZ2VyIHRoZSB2b2ljaW5nIHJlc3BvbnNlIHNwb2tlbiB3aGVuIGFuIGludGVyYWN0aW9uIGVuZHMuIFdpbGwgc3BlYWsgdGhlIGN1cnJlbnRcbiAgICAgICAqIG5hbWUgYW5kIG9iamVjdCByZXNwb25zZXMgKGFjY29yZGluZyB0byBvcHRpb25zKS4gU2V0IHRob3NlIHJlc3BvbnNlcyBvZiBWb2ljaW5nLnRzIHRvIGhlYXIgdXAtdG8tZGF0ZVxuICAgICAgICogVm9pY2luZyByZXNwb25zZXMgYXQgdGhlIGVuZCBvZiBhbiBpbnRlcmFjdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gdmFsdWVPblN0YXJ0IC0gUHJvcGVydHkgdmFsdWUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBpbnRlcmFjdGlvbi5cbiAgICAgICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICAgICAqL1xuICAgICAgcHVibGljIHZvaWNpbmdPbkVuZFJlc3BvbnNlKCB2YWx1ZU9uU3RhcnQ6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogVm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zICk6IHZvaWQge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8Vm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zPigge30sIHRoaXMuX3ZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucywgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgICAgY29uc3QgdmFsdWVDaGFuZ2VkID0gdmFsdWVPblN0YXJ0ICE9PSB0aGlzLl92YWx1ZVByb3BlcnR5LnZhbHVlO1xuICAgICAgICBjb25zdCB2YWx1ZUF0TWluTWF4ID0gdGhpcy5fdmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gdGhpcy5fZW5hYmxlZFJhbmdlUHJvcGVydHkudmFsdWUubWluIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZVByb3BlcnR5LnZhbHVlID09PSB0aGlzLl9lbmFibGVkUmFuZ2VQcm9wZXJ0eS52YWx1ZS5tYXg7XG5cbiAgICAgICAgLy8gY29udGVudCByZXF1aXJlZCB0byBzcGVhayBhIHJlc3BvbnNlIGFuZCBhZGQgdG8gYmFjayBvZiBVdHRlcmFuY2VRdWV1ZS5cbiAgICAgICAgY29uc3QgcmVzcG9uc2VDb250ZW50RXhpc3RzID0gISEoIG9wdGlvbnMud2l0aE5hbWVSZXNwb25zZSAmJiB0aGlzLnZvaWNpbmdOYW1lUmVzcG9uc2UgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhISggb3B0aW9ucy53aXRoT2JqZWN0UmVzcG9uc2UgJiYgdGhpcy52b2ljaW5nT2JqZWN0UmVzcG9uc2UgKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkU3BlYWsgPSAoICFvcHRpb25zLm9ubHlPblZhbHVlQ2hhbmdlIHx8IC8vIHNwZWFrIGVhY2ggdGltZSBpZiBvbmx5T25WYWx1ZUNoYW5nZSBpcyBmYWxzZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQXRNaW5NYXggfHwgLy8gYWx3YXlzIHNwZWFrIGF0IGVkZ2VzLCBmb3IgXCJnbyBiZXlvbmRcIiByZXNwb25zZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlQ2hhbmdlZCApICYmIC8vIElmIHRoZSB2YWx1ZSBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2VDb250ZW50RXhpc3RzO1xuXG4gICAgICAgIHNob3VsZFNwZWFrICYmIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgICAgbmFtZVJlc3BvbnNlOiBvcHRpb25zLndpdGhOYW1lUmVzcG9uc2UgPyB0aGlzLnZvaWNpbmdOYW1lUmVzcG9uc2UgOiBudWxsLFxuICAgICAgICAgIG9iamVjdFJlc3BvbnNlOiBvcHRpb25zLndpdGhPYmplY3RSZXNwb25zZSA/IHRoaXMudm9pY2luZ09iamVjdFJlc3BvbnNlIDogbnVsbCxcbiAgICAgICAgICBoaW50UmVzcG9uc2U6IG51bGwgLy8gbm8gaGludCwgdGhlcmUgd2FzIGp1c3QgYSBzdWNjZXNzZnVsIGludGVyYWN0aW9uXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyKCk7XG5cbiAgICAgICAgc3VwZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAvKipcbiAgICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IE5vZGUubXV0YXRlKCBvcHRpb25zICksIGluXG4gICAqIHRoZSBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkLlxuICAgKlxuICAgKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcbiAgICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXG4gICAqL1xuICBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IEFDQ0VTU0lCTEVfVkFMVUVfSEFORExFUl9PUFRJT05TLmNvbmNhdCggQWNjZXNzaWJsZVZhbHVlSGFuZGxlckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKTtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyQ2xhc3MucHJvdG90eXBlLl9tdXRhdG9yS2V5cy5sZW5ndGggPT09IF8udW5pcSggQWNjZXNzaWJsZVZhbHVlSGFuZGxlckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgbXV0YXRvciBrZXlzIGluIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXInICk7XG5cbiAgcmV0dXJuIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJDbGFzcztcbn07XG5cbnN1bi5yZWdpc3RlciggJ0FjY2Vzc2libGVWYWx1ZUhhbmRsZXInLCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyICk7XG5cbi8qKlxuICogUm91bmQgdGhlIHZhbHVlIHRvIHRoZSBuZWFyZXN0IHN0ZXAgc2l6ZS5cbiAqXG4gKiBAcGFyYW0gbmV3VmFsdWUgLSB2YWx1ZSB0byBiZSByb3VuZGVkXG4gKiBAcGFyYW0gY3VycmVudFZhbHVlIC0gY3VycmVudCB2YWx1ZSBvZiB0aGUgUHJvcGVydHkgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc2xpZGVyXG4gKiBAcGFyYW0gc3RlcFNpemUgLSB0aGUgZGVsdGEgZm9yIHRoaXMgbWFuaXB1bGF0aW9uXG4gKi9cbmNvbnN0IHJvdW5kVmFsdWUgPSBmdW5jdGlvbiggbmV3VmFsdWU6IG51bWJlciwgY3VycmVudFZhbHVlOiBudW1iZXIsIHN0ZXBTaXplOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgbGV0IHJvdW5kVmFsdWUgPSBuZXdWYWx1ZTtcbiAgaWYgKCBzdGVwU2l6ZSAhPT0gMCApIHtcblxuICAgIC8vIHJvdW5kIHRoZSB2YWx1ZSB0byB0aGUgbmVhcmVzdCBrZXlib2FyZCBzdGVwXG4gICAgcm91bmRWYWx1ZSA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCByb3VuZFZhbHVlIC8gc3RlcFNpemUgKSAqIHN0ZXBTaXplO1xuXG4gICAgLy8gZ28gYmFjayBhIHN0ZXAgaWYgd2Ugd2VudCB0b28gZmFyIGR1ZSB0byByb3VuZGluZ1xuICAgIHJvdW5kVmFsdWUgPSBjb3JyZWN0Um91bmRpbmcoIHJvdW5kVmFsdWUsIGN1cnJlbnRWYWx1ZSwgc3RlcFNpemUgKTtcbiAgfVxuICByZXR1cm4gcm91bmRWYWx1ZTtcbn07XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uLCBpdCBpcyBwb3NzaWJsZSBkdWUgdG8gcm91bmRpbmcgdG8gZ28gdXAgb3IgZG93biBhIHN0ZXAgaWYgd2UgaGF2ZSBwYXNzZWQgdGhlIG5lYXJlc3Qgc3RlcCBkdXJpbmdcbiAqIGtleWJvYXJkIGludGVyYWN0aW9uLiBUaGlzIGZ1bmN0aW9uIGNvcnJlY3RzIHRoYXQuXG4gKlxuICovXG5jb25zdCBjb3JyZWN0Um91bmRpbmcgPSBmdW5jdGlvbiggbmV3VmFsdWU6IG51bWJlciwgY3VycmVudFZhbHVlOiBudW1iZXIsIHN0ZXBTaXplOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgbGV0IGNvcnJlY3RlZFZhbHVlID0gbmV3VmFsdWU7XG5cbiAgY29uc3QgcHJvcG9zZWRTdGVwID0gTWF0aC5hYnMoIG5ld1ZhbHVlIC0gY3VycmVudFZhbHVlICk7XG4gIGNvbnN0IHN0ZXBUb0ZhciA9IHByb3Bvc2VkU3RlcCA+IHN0ZXBTaXplO1xuXG4gIC8vIGl0IGlzIHBvc3NpYmxlIHRoYXQgcHJvcG9zZWRTdGVwIHdpbGwgYmUgbGFyZ2VyIHRoYW4gdGhlIHN0ZXBTaXplIGJ1dCBvbmx5IGJlY2F1c2Ugb2YgcHJlY2lzaW9uXG4gIC8vIGNvbnN0cmFpbnRzIHdpdGggZmxvYXRpbmcgcG9pbnQgdmFsdWVzLCBkb24ndCBjb3JyZWN0IGlmIHRoYXQgaXMgdGhlIGNhc2VzXG4gIGNvbnN0IHN0ZXBzQWJvdXRFcXVhbCA9IFV0aWxzLmVxdWFsc0Vwc2lsb24oIHByb3Bvc2VkU3RlcCwgc3RlcFNpemUsIDFlLTE0ICk7XG4gIGlmICggc3RlcFRvRmFyICYmICFzdGVwc0Fib3V0RXF1YWwgKSB7XG4gICAgY29ycmVjdGVkVmFsdWUgKz0gKCBuZXdWYWx1ZSA+IGN1cnJlbnRWYWx1ZSApID8gKCAtc3RlcFNpemUgKSA6IHN0ZXBTaXplO1xuICB9XG4gIHJldHVybiBjb3JyZWN0ZWRWYWx1ZTtcbn07XG5cbkFjY2Vzc2libGVWYWx1ZUhhbmRsZXIuREVGQVVMVF9UQUdfTkFNRSA9IERFRkFVTFRfVEFHX05BTUU7XG5cbmV4cG9ydCBkZWZhdWx0IEFjY2Vzc2libGVWYWx1ZUhhbmRsZXI7Il0sIm5hbWVzIjpbIkR5bmFtaWNQcm9wZXJ0eSIsIk11bHRpbGluayIsIlByb3BlcnR5IiwiVXRpbHMiLCJhc3NlcnRIYXNQcm9wZXJ0aWVzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJPcmllbnRhdGlvbiIsInBsYXRmb3JtIiwiYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uIiwiRGVsYXllZE11dGF0ZSIsImV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyIsIkhvdGtleURhdGEiLCJLZXlib2FyZFV0aWxzIiwiUERPTVV0aWxzIiwiVm9pY2luZyIsIlV0dGVyYW5jZSIsInN1biIsIkFjY2Vzc2libGVWYWx1ZUhhbmRsZXJIb3RrZXlEYXRhQ29sbGVjdGlvbiIsIkRFRkFVTFRfVEFHX05BTUUiLCJ0b1N0cmluZyIsInYiLCJERUZBVUxUX1ZPSUNJTkdfT05fRU5EX1JFU1BPTlNFX09QVElPTlMiLCJ3aXRoTmFtZVJlc3BvbnNlIiwid2l0aE9iamVjdFJlc3BvbnNlIiwib25seU9uVmFsdWVDaGFuZ2UiLCJBQ0NFU1NJQkxFX1ZBTFVFX0hBTkRMRVJfT1BUSU9OUyIsIkFjY2Vzc2libGVWYWx1ZUhhbmRsZXIiLCJUeXBlIiwib3B0aW9uc0FyZ1Bvc2l0aW9uIiwiQWNjZXNzaWJsZVZhbHVlSGFuZGxlckNsYXNzIiwic3RhcnRJbnB1dCIsInZhbHVlIiwiX3N0YXJ0SW5wdXQiLCJvbklucHV0IiwiX29uSW5wdXQiLCJlbmRJbnB1dCIsIl9lbmRJbnB1dCIsImNvbnN0cmFpblZhbHVlIiwiX2NvbnN0cmFpblZhbHVlIiwicGFuVGFyZ2V0Tm9kZSIsIl9wYW5UYXJnZXROb2RlIiwicm91bmRUb1N0ZXBTaXplIiwiX3JvdW5kVG9TdGVwU2l6ZSIsInBkb21NYXBQRE9NVmFsdWUiLCJfcGRvbU1hcFBET01WYWx1ZSIsImludmFsaWRhdGVFbmFibGVkUmFuZ2UiLCJfZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJpbnZhbGlkYXRlVmFsdWVQcm9wZXJ0eSIsImludmFsaWRhdGVBcmlhVmFsdWVUZXh0IiwicGRvbU1hcFZhbHVlIiwiX3Bkb21NYXBWYWx1ZSIsInBkb21SZXBlYXRFcXVhbFZhbHVlVGV4dCIsIl9wZG9tUmVwZWF0RXF1YWxWYWx1ZVRleHQiLCJwZG9tQ3JlYXRlQXJpYVZhbHVlVGV4dCIsIl9wZG9tQ3JlYXRlQXJpYVZhbHVlVGV4dCIsInBkb21DcmVhdGVDb250ZXh0UmVzcG9uc2VBbGVydCIsIl9wZG9tQ3JlYXRlQ29udGV4dFJlc3BvbnNlQWxlcnQiLCJjb250ZXh0UmVzcG9uc2VQZXJWYWx1ZUNoYW5nZURlbGF5IiwiX2NvbnRleHRSZXNwb25zZVBlclZhbHVlQ2hhbmdlRGVsYXkiLCJjb250ZXh0UmVzcG9uc2VNYXhEZWxheSIsIl9jb250ZXh0UmVzcG9uc2VNYXhEZWxheSIsInZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucyIsIl92b2ljaW5nT25FbmRSZXNwb25zZU9wdGlvbnMiLCJfdXBkYXRlQXJpYVZhbHVlVGV4dCIsIl9vbGRWYWx1ZSIsIl92YWx1ZVByb3BlcnR5IiwiZW5hYmxlZFJhbmdlIiwibWFwcGVkTWluIiwiX2dldE1hcHBlZFZhbHVlIiwibWluIiwibWFwcGVkTWF4IiwibWF4Iiwic2V0UERPTUF0dHJpYnV0ZSIsIl91cGRhdGVTaWJsaW5nU3RlcEF0dHJpYnV0ZSIsIm1hcHBlZFZhbHVlIiwiaW5wdXRWYWx1ZSIsImludmFsaWRhdGVQRE9NRGVwZW5kZW5jaWVzIiwiX2RlcGVuZGVuY2llc011bHRpbGluayIsImRpc3Bvc2UiLCJtdWx0aWxpbmtBbnkiLCJfcGRvbURlcGVuZGVuY2llcyIsImNvbmNhdCIsIl9wZG9tVmFsdWVUZXh0VXBkYXRlTGlzdGVuZXIiLCJzZXRQRE9NRGVwZW5kZW5jaWVzIiwiZGVwZW5kZW5jaWVzIiwiYXNzZXJ0IiwiaW5jbHVkZXMiLCJnZXRQRE9NRGVwZW5kZW5jaWVzIiwicGRvbURlcGVuZGVuY2llcyIsIm9sZFByb3BlcnR5VmFsdWUiLCJuZXdBcmlhVmFsdWVUZXh0VmFsdWVUeXBlIiwibmV3QXJpYVZhbHVlVGV4dCIsInVud3JhcFN0cmluZ1Byb3BlcnR5IiwiaGFpclNwYWNlIiwiYXJpYVZhbHVlVGV4dCIsInJlcGxhY2UiLCJSZWdFeHAiLCJhbGVydENvbnRleHRSZXNwb25zZSIsInRpbWVzQ2hhbmdlZEJlZm9yZUFsZXJ0aW5nSW5jcmVtZW50ZWQiLCJlbmRJbnRlcmFjdGlvbkFsZXJ0IiwiX3ZhbHVlT25TdGFydCIsIl9jb250ZXh0UmVzcG9uc2VVdHRlcmFuY2UiLCJhbGVydCIsImZvckVhY2hVdHRlcmFuY2VRdWV1ZSIsInV0dGVyYW5jZVF1ZXVlIiwiaGFzVXR0ZXJhbmNlIiwiX3RpbWVzQ2hhbmdlZEJlZm9yZUFsZXJ0aW5nIiwiYWxlcnRTdGFibGVEZWxheSIsIk1hdGgiLCJhZGRUb0JhY2siLCJyZXNldCIsImdldEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJJbnB1dExpc3RlbmVyIiwia2V5ZG93biIsImhhbmRsZUtleURvd24iLCJiaW5kIiwia2V5dXAiLCJoYW5kbGVLZXlVcCIsImlucHV0IiwiaGFuZGxlSW5wdXQiLCJjaGFuZ2UiLCJoYW5kbGVDaGFuZ2UiLCJibHVyIiwiaGFuZGxlQmx1ciIsImV2ZW50IiwiZG9tRXZlbnQiLCJrZXkiLCJnZXRFdmVudENvZGUiLCJfc2hpZnRLZXkiLCJzaGlmdEtleSIsImlzS2V5RXZlbnQiLCJLRVlfVEFCIiwiX2Jsb2NrSW5wdXQiLCJlbmFibGVkUHJvcGVydHkiLCJnZXQiLCJlbmdsaXNoS2V5U3RyaW5nIiwiaXNSYW5nZUtleSIsInByZXZlbnREZWZhdWx0IiwibWV0YUtleSIsInBvaW50ZXIiLCJyZXNlcnZlRm9yS2V5Ym9hcmREcmFnIiwidXNlQ29uc3RyYWluVmFsdWUiLCJfYW55S2V5c0Rvd24iLCJfb25JbnRlcmFjdGlvblN0YXJ0IiwiX3JhbmdlS2V5c0Rvd24iLCJuZXdWYWx1ZSIsImFueUhhdmVLZXlTdHJva2UiLCJIT01FX0hPVEtFWV9EQVRBIiwiRU5EX0hPVEtFWV9EQVRBIiwiaGFzS2V5U3Ryb2tlIiwic3RlcFNpemUiLCJQQUdFX0RPV05fSE9US0VZX0RBVEEiLCJQQUdFX1VQX0hPVEtFWV9EQVRBIiwicGFnZUtleWJvYXJkU3RlcCIsIkxFRlRfQVJST1dfSE9US0VZX0RBVEEiLCJSSUdIVF9BUlJPV19IT1RLRVlfREFUQSIsIlVQX0FSUk9XX0hPVEtFWV9EQVRBIiwiRE9XTl9BUlJPV19IT1RLRVlfREFUQSIsInNoaWZ0S2V5Ym9hcmRTdGVwIiwia2V5Ym9hcmRTdGVwIiwicm91bmRWYWx1ZSIsImNvbnN0cmFpbmVkVmFsdWUiLCJzZXQiLCJjbGFtcCIsImluaXRpYWxpemVkIiwibGlzdGVuZXIiLCJwYW5Ub05vZGUiLCJsaW1pdFBhbkRpcmVjdGlvbiIsImNvZGUiLCJfYWxsS2V5c1VwIiwiU0hJRlRfSE9US0VZX0RBVEEiLCJfb25JbnRlcmFjdGlvbkVuZCIsIl9wZG9tSW5wdXRIYW5kbGVkIiwicGFyc2VGbG9hdCIsInRhcmdldCIsIl9wZG9tUG9pbnRlciIsImF0dGFjaGVkTGlzdGVuZXIiLCJfcGRvbVBvaW50ZXJMaXN0ZW5lciIsImFkZElucHV0TGlzdGVuZXIiLCJ2b2ljaW5nT25FbmRSZXNwb25zZSIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJzZXRLZXlib2FyZFN0ZXAiLCJfa2V5Ym9hcmRTdGVwIiwiZ2V0S2V5Ym9hcmRTdGVwIiwic2V0U2hpZnRLZXlib2FyZFN0ZXAiLCJfc2hpZnRLZXlib2FyZFN0ZXAiLCJnZXRTaGlmdEtleWJvYXJkU3RlcCIsImdldFNoaWZ0S2V5RG93biIsInNoaWZ0S2V5RG93biIsInNldFBhZ2VLZXlib2FyZFN0ZXAiLCJfcGFnZUtleWJvYXJkU3RlcCIsImdldFBhZ2VLZXlib2FyZFN0ZXAiLCJzZXRBcmlhT3JpZW50YXRpb24iLCJvcmllbnRhdGlvbiIsIl9hcmlhT3JpZW50YXRpb24iLCJhcmlhT3JpZW50YXRpb24iLCJnZXRBcmlhT3JpZW50YXRpb24iLCJfIiwiZXZlcnkiLCJlbnRyeSIsImZpbmQiLCJzdGVwVmFsdWUiLCJtb2JpbGVTYWZhcmkiLCJzbWFsbGVzdFN0ZXAiLCJwb3ciLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJtYXBwZWRMZW5ndGgiLCJOdW1iZXIiLCJ0b1ByZWNpc2lvbiIsInZhbHVlT25TdGFydCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2YWx1ZUNoYW5nZWQiLCJ2YWx1ZUF0TWluTWF4IiwicmVzcG9uc2VDb250ZW50RXhpc3RzIiwidm9pY2luZ05hbWVSZXNwb25zZSIsInZvaWNpbmdPYmplY3RSZXNwb25zZSIsInNob3VsZFNwZWFrIiwidm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlIiwibmFtZVJlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJfZGlzcG9zZUFjY2Vzc2libGVWYWx1ZUhhbmRsZXIiLCJhcmdzIiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJ2YWx1ZVByb3BlcnR5IiwiaGFzT3duUHJvcGVydHkiLCJ0YWdOYW1lIiwiaW5wdXRUeXBlIiwibm9vcCIsImlkZW50aXR5IiwiSE9SSVpPTlRBTCIsIl90aW1lc1ZhbHVlVGV4dENoYW5nZWRCZWZvcmVBbGVydGluZyIsInJldmVyc2VBbHRlcm5hdGl2ZUlucHV0IiwiYmlkaXJlY3Rpb25hbCIsIm1hcCIsInByb3BlcnR5VmFsdWUiLCJpbnZlcnNlTWFwIiwiZW5hYmxlZFJhbmdlT2JzZXJ2ZXIiLCJsaW5rIiwidmFsdWVQcm9wZXJ0eUxpc3RlbmVyIiwiaW50ZXJydXB0IiwidW5saW5rIiwicHJvdG90eXBlIiwiX211dGF0b3JLZXlzIiwibGVuZ3RoIiwidW5pcSIsInJlZ2lzdGVyIiwiY3VycmVudFZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJjb3JyZWN0Um91bmRpbmciLCJjb3JyZWN0ZWRWYWx1ZSIsInByb3Bvc2VkU3RlcCIs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