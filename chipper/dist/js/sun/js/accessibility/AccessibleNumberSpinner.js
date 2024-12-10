// Copyright 2018-2024, University of Colorado Boulder
/**
 * A trait for subtypes of Node, used to make the Node behave like a 'number' input with assistive technology.
 * An accessible number spinner behaves like:
 *
 * - Arrow keys increment/decrement the value by a specified step size.
 * - Page Up and Page Down increments/decrements value by an alternative step size, usually larger than default.
 * - Home key sets value to its minimum.
 * - End key sets value to its maximum.
 *
 * This number spinner is different than typical 'number' inputs because it does not support number key control. It
 * was determined that an input of type range is the best match for a PhET Number Spinner, with a custom role
 * description with aria-roledescription. See https://github.com/phetsims/sun/issues/497 for history on this
 * decision.
 *
 * This trait mixes in a "parent" mixin to handle general "value" formatting and aria-valuetext updating, see
 * AccessibleValueHandler.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 */ import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import Emitter from '../../../axon/js/Emitter.js';
import validate from '../../../axon/js/validate.js';
import assertHasProperties from '../../../phet-core/js/assertHasProperties.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { DelayedMutate, KeyboardUtils } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import SunStrings from '../SunStrings.js';
import AccessibleValueHandler from './AccessibleValueHandler.js';
const ACCESSIBLE_NUMBER_SPINNER_OPTIONS = [
    'pdomTimerDelay',
    'pdomTimerInterval'
];
/**
 * @param Type
 * @param optionsArgPosition - zero-indexed number that the options argument is provided at
 */ const AccessibleNumberSpinner = (Type, optionsArgPosition)=>{
    const AccessibleNumberSpinnerClass = DelayedMutate('AccessibleNumberSpinner', ACCESSIBLE_NUMBER_SPINNER_OPTIONS, class AccessibleNumberSpinner extends AccessibleValueHandler(Type, optionsArgPosition) {
        set pdomTimerDelay(value) {
            this._pdomTimerDelay = value;
            if (this._callbackTimer) {
                this._callbackTimer.delay = value;
            }
        }
        get pdomTimerDelay() {
            return this._pdomTimerDelay;
        }
        set pdomTimerInterval(value) {
            this._pdomTimerInterval = value;
            if (this._callbackTimer) {
                this._callbackTimer.interval = value;
            }
        }
        get pdomTimerInterval() {
            return this._pdomTimerInterval;
        }
        /**
       * Handle the keydown event and emit events related to the user interaction. Ideally, this would
       * override AccessibleValueHandler.handleKeyDown, but overriding is not supported with PhET Trait pattern.
       */ _accessibleNumberSpinnerHandleKeyDown(event) {
            assert && assert(event.domEvent, 'must have a domEvent');
            this.handleKeyDown(event);
            this._emitKeyState(event.domEvent, true);
        }
        /**
       * Emit events related to the keystate of the spinner. Typically used to style the spinner during keyboard
       * interaction.
       *
       * @param domEvent - the code of the key changing state
       * @param isDown - whether or not event was triggered from down or up keys
       */ _emitKeyState(domEvent, isDown) {
            validate(domEvent, {
                valueType: Event
            });
            if (KeyboardUtils.isAnyKeyEvent(domEvent, [
                KeyboardUtils.KEY_UP_ARROW,
                KeyboardUtils.KEY_RIGHT_ARROW
            ])) {
                this.pdomIncrementDownEmitter.emit(isDown);
            } else if (KeyboardUtils.isAnyKeyEvent(domEvent, [
                KeyboardUtils.KEY_DOWN_ARROW,
                KeyboardUtils.KEY_LEFT_ARROW
            ])) {
                this.pdomDecrementDownEmitter.emit(isDown);
            }
        }
        dispose() {
            this._disposeAccessibleNumberSpinner();
            super.dispose();
        }
        constructor(...args){
            const providedOptions = args[optionsArgPosition];
            assert && providedOptions && assert(Object.getPrototypeOf(providedOptions) === Object.prototype, 'Extra prototype on AccessibleSlider options object is a code smell (or probably a bug)');
            const options = combineOptions({
                ariaOrientation: Orientation.VERTICAL // by default, number spinners should be oriented vertically
            }, providedOptions);
            args[optionsArgPosition] = options;
            super(...args), this._pdomTimerDelay = 400, this._pdomTimerInterval = 100;
            // members of the Node API that are used by this trait
            assertHasProperties(this, [
                'addInputListener'
            ]);
            this._callbackTimer = new CallbackTimer({
                delay: this._pdomTimerDelay,
                interval: this._pdomTimerInterval
            });
            this.pdomIncrementDownEmitter = new Emitter({
                parameters: [
                    {
                        valueType: 'boolean'
                    }
                ]
            });
            this.pdomDecrementDownEmitter = new Emitter({
                parameters: [
                    {
                        valueType: 'boolean'
                    }
                ]
            });
            this.setPDOMAttribute('aria-roledescription', SunStrings.a11y.numberSpinnerRoleDescriptionStringProperty);
            // a callback that is added and removed from the timer depending on keystate
            let downCallback = null;
            let runningTimerCallbackEvent = null; // {Event|null}
            // handle all accessible event input
            const accessibleInputListener = {
                keydown: (event)=>{
                    if (this.enabledProperty.get()) {
                        // check for relevant keys here
                        if (KeyboardUtils.isRangeKey(event.domEvent)) {
                            const domEvent = event.domEvent;
                            // If the meta key is down we will not even call the keydown listener of the supertype, so we need
                            // to be sure that default behavior is prevented so we don't receive `input` and `change` events.
                            // See AccessibleValueHandler.handleInput for information on these events and why we don't want
                            // to change in response to them.
                            domEvent.preventDefault();
                            // When the meta key is down Mac will not send keyup events so do not change values or add timer
                            // listeners because they will never be removed since we fail to get a keyup event. See
                            if (!domEvent.metaKey) {
                                if (!this._callbackTimer.isRunning()) {
                                    this._accessibleNumberSpinnerHandleKeyDown(event);
                                    downCallback = this._accessibleNumberSpinnerHandleKeyDown.bind(this, event);
                                    runningTimerCallbackEvent = domEvent;
                                    this._callbackTimer.addCallback(downCallback);
                                    this._callbackTimer.start();
                                }
                            }
                        }
                    }
                },
                keyup: (event)=>{
                    const key = KeyboardUtils.getEventCode(event.domEvent);
                    if (KeyboardUtils.isRangeKey(event.domEvent)) {
                        if (runningTimerCallbackEvent && key === KeyboardUtils.getEventCode(runningTimerCallbackEvent)) {
                            this._emitKeyState(event.domEvent, false);
                            this._callbackTimer.stop(false);
                            assert && assert(downCallback);
                            this._callbackTimer.removeCallback(downCallback);
                            downCallback = null;
                            runningTimerCallbackEvent = null;
                        }
                        this.handleKeyUp(event);
                    }
                },
                blur: (event)=>{
                    // if a key is currently down when focus leaves the spinner, stop callbacks and emit that the
                    // key is up
                    if (downCallback) {
                        assert && assert(runningTimerCallbackEvent !== null, 'key should be down if running downCallback');
                        this._emitKeyState(runningTimerCallbackEvent, false);
                        this._callbackTimer.stop(false);
                        this._callbackTimer.removeCallback(downCallback);
                    }
                    this.handleBlur(event);
                },
                input: this.handleInput.bind(this),
                change: this.handleChange.bind(this)
            };
            this.addInputListener(accessibleInputListener);
            this._disposeAccessibleNumberSpinner = ()=>{
                this._callbackTimer.dispose();
                // emitters owned by this instance, can be disposed here
                this.pdomIncrementDownEmitter.dispose();
                this.pdomDecrementDownEmitter.dispose();
                this.removeInputListener(accessibleInputListener);
            };
        }
    });
    /**
   * {Array.<string>} - String keys for all the allowed options that will be set by Node.mutate( options ), in
   * the order they will be evaluated.
   *
   * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
   *       cases that may apply.
   */ AccessibleNumberSpinnerClass.prototype._mutatorKeys = ACCESSIBLE_NUMBER_SPINNER_OPTIONS.concat(AccessibleNumberSpinnerClass.prototype._mutatorKeys);
    assert && assert(AccessibleNumberSpinnerClass.prototype._mutatorKeys.length === _.uniq(AccessibleNumberSpinnerClass.prototype._mutatorKeys).length, 'duplicate mutator keys in AccessibleNumberSpinner');
    return AccessibleNumberSpinnerClass;
};
sun.register('AccessibleNumberSpinner', AccessibleNumberSpinner);
export default AccessibleNumberSpinner;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9hY2Nlc3NpYmlsaXR5L0FjY2Vzc2libGVOdW1iZXJTcGlubmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgdHJhaXQgZm9yIHN1YnR5cGVzIG9mIE5vZGUsIHVzZWQgdG8gbWFrZSB0aGUgTm9kZSBiZWhhdmUgbGlrZSBhICdudW1iZXInIGlucHV0IHdpdGggYXNzaXN0aXZlIHRlY2hub2xvZ3kuXG4gKiBBbiBhY2Nlc3NpYmxlIG51bWJlciBzcGlubmVyIGJlaGF2ZXMgbGlrZTpcbiAqXG4gKiAtIEFycm93IGtleXMgaW5jcmVtZW50L2RlY3JlbWVudCB0aGUgdmFsdWUgYnkgYSBzcGVjaWZpZWQgc3RlcCBzaXplLlxuICogLSBQYWdlIFVwIGFuZCBQYWdlIERvd24gaW5jcmVtZW50cy9kZWNyZW1lbnRzIHZhbHVlIGJ5IGFuIGFsdGVybmF0aXZlIHN0ZXAgc2l6ZSwgdXN1YWxseSBsYXJnZXIgdGhhbiBkZWZhdWx0LlxuICogLSBIb21lIGtleSBzZXRzIHZhbHVlIHRvIGl0cyBtaW5pbXVtLlxuICogLSBFbmQga2V5IHNldHMgdmFsdWUgdG8gaXRzIG1heGltdW0uXG4gKlxuICogVGhpcyBudW1iZXIgc3Bpbm5lciBpcyBkaWZmZXJlbnQgdGhhbiB0eXBpY2FsICdudW1iZXInIGlucHV0cyBiZWNhdXNlIGl0IGRvZXMgbm90IHN1cHBvcnQgbnVtYmVyIGtleSBjb250cm9sLiBJdFxuICogd2FzIGRldGVybWluZWQgdGhhdCBhbiBpbnB1dCBvZiB0eXBlIHJhbmdlIGlzIHRoZSBiZXN0IG1hdGNoIGZvciBhIFBoRVQgTnVtYmVyIFNwaW5uZXIsIHdpdGggYSBjdXN0b20gcm9sZVxuICogZGVzY3JpcHRpb24gd2l0aCBhcmlhLXJvbGVkZXNjcmlwdGlvbi4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzQ5NyBmb3IgaGlzdG9yeSBvbiB0aGlzXG4gKiBkZWNpc2lvbi5cbiAqXG4gKiBUaGlzIHRyYWl0IG1peGVzIGluIGEgXCJwYXJlbnRcIiBtaXhpbiB0byBoYW5kbGUgZ2VuZXJhbCBcInZhbHVlXCIgZm9ybWF0dGluZyBhbmQgYXJpYS12YWx1ZXRleHQgdXBkYXRpbmcsIHNlZVxuICogQWNjZXNzaWJsZVZhbHVlSGFuZGxlci5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBCYXJsb3cgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IENhbGxiYWNrVGltZXIsIHsgQ2FsbGJhY2tUaW1lckNhbGxiYWNrIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9DYWxsYmFja1RpbWVyLmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy92YWxpZGF0ZS5qcyc7XG5pbXBvcnQgYXNzZXJ0SGFzUHJvcGVydGllcyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0SGFzUHJvcGVydGllcy5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgQ29uc3RydWN0b3IgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0NvbnN0cnVjdG9yLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IHsgRGVsYXllZE11dGF0ZSwgS2V5Ym9hcmRVdGlscywgTm9kZSwgU2NlbmVyeUV2ZW50LCBUSW5wdXRMaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5pbXBvcnQgU3VuU3RyaW5ncyBmcm9tICcuLi9TdW5TdHJpbmdzLmpzJztcbmltcG9ydCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLCB7IEFjY2Vzc2libGVWYWx1ZUhhbmRsZXJPcHRpb25zLCBUQWNjZXNzaWJsZVZhbHVlSGFuZGxlciB9IGZyb20gJy4vQWNjZXNzaWJsZVZhbHVlSGFuZGxlci5qcyc7XG5cbmNvbnN0IEFDQ0VTU0lCTEVfTlVNQkVSX1NQSU5ORVJfT1BUSU9OUyA9IFtcbiAgJ3Bkb21UaW1lckRlbGF5JyxcbiAgJ3Bkb21UaW1lckludGVydmFsJ1xuXTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBzdGFydCB0byBmaXJlIGNvbnRpbnVvdXNseSBhZnRlciBwcmVzc2luZyBmb3IgdGhpcyBsb25nIChtaWxsaXNlY29uZHMpXG4gIHBkb21UaW1lckRlbGF5PzogbnVtYmVyO1xuXG4gIC8vIGZpcmUgY29udGludW91c2x5IGF0IHRoaXMgZnJlcXVlbmN5IChtaWxsaXNlY29uZHMpLFxuICBwZG9tVGltZXJJbnRlcnZhbD86IG51bWJlcjtcbn07XG5cbnR5cGUgQWNjZXNzaWJsZU51bWJlclNwaW5uZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyT3B0aW9ucztcblxudHlwZSBUQWNjZXNzaWJsZU51bWJlclNwaW5uZXIgPSB7XG4gIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gIHJlYWRvbmx5IHBkb21JbmNyZW1lbnREb3duRW1pdHRlcjogVEVtaXR0ZXI8WyBib29sZWFuIF0+O1xuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICByZWFkb25seSBwZG9tRGVjcmVtZW50RG93bkVtaXR0ZXI6IFRFbWl0dGVyPFsgYm9vbGVhbiBdPjtcbiAgcGRvbVRpbWVyRGVsYXk6IG51bWJlcjtcbiAgcGRvbVRpbWVySW50ZXJ2YWw6IG51bWJlcjtcbn0gJiBUQWNjZXNzaWJsZVZhbHVlSGFuZGxlcjtcblxuLyoqXG4gKiBAcGFyYW0gVHlwZVxuICogQHBhcmFtIG9wdGlvbnNBcmdQb3NpdGlvbiAtIHplcm8taW5kZXhlZCBudW1iZXIgdGhhdCB0aGUgb3B0aW9ucyBhcmd1bWVudCBpcyBwcm92aWRlZCBhdFxuICovXG5jb25zdCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciA9IDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3RvcjxOb2RlPj4oIFR5cGU6IFN1cGVyVHlwZSwgb3B0aW9uc0FyZ1Bvc2l0aW9uOiBudW1iZXIgKTogU3VwZXJUeXBlICYgQ29uc3RydWN0b3I8VEFjY2Vzc2libGVOdW1iZXJTcGlubmVyPiA9PiB7XG5cbiAgY29uc3QgQWNjZXNzaWJsZU51bWJlclNwaW5uZXJDbGFzcyA9IERlbGF5ZWRNdXRhdGUoICdBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lcicsIEFDQ0VTU0lCTEVfTlVNQkVSX1NQSU5ORVJfT1BUSU9OUyxcbiAgICBjbGFzcyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciBleHRlbmRzIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIoIFR5cGUsIG9wdGlvbnNBcmdQb3NpdGlvbiApIGltcGxlbWVudHMgVEFjY2Vzc2libGVOdW1iZXJTcGlubmVyIHtcblxuICAgICAgLy8gTWFuYWdlcyB0aW1pbmcgbXVzdCBiZSBkaXNwb3NlZFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfY2FsbGJhY2tUaW1lcjogQ2FsbGJhY2tUaW1lcjtcblxuICAgICAgLy8gRW1pdHMgZXZlbnRzIHdoZW4gaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYWN0aW9ucyBvY2N1ciwgYnV0IG9ubHkgZm9yIGNoYW5nZXMgb2Yga2V5Ym9hcmRTdGVwIGFuZFxuICAgICAgLy8gc2hpZnRLZXlib2FyZFN0ZXAgKG5vdCBwYWdlS2V5Ym9hcmRTdGVwKS4gSW5kaWNhdGVzIFwibm9ybWFsXCIgdXNhZ2Ugd2l0aCBhIGtleWJvYXJkLCBzbyB0aGF0IGNvbXBvbmVudHNcbiAgICAgIC8vIGNvbXBvc2VkIHdpdGggdGhpcyB0cmFpdCBjYW4gc3R5bGUgdGhlbXNlbHZlcyBkaWZmZXJlbnRseSB3aGVuIHRoZSBrZXlib2FyZCBpcyBiZWluZyB1c2VkLlxuICAgICAgLy8gQG1peGluLXByb3RlY3RlZCAtIG1hZGUgcHVibGljIGZvciB1c2UgaW4gdGhlIG1peGluIG9ubHlcbiAgICAgIHB1YmxpYyByZWFkb25seSBwZG9tSW5jcmVtZW50RG93bkVtaXR0ZXI6IFRFbWl0dGVyPFsgYm9vbGVhbiBdPjtcbiAgICAgIHB1YmxpYyByZWFkb25seSBwZG9tRGVjcmVtZW50RG93bkVtaXR0ZXI6IFRFbWl0dGVyPFsgYm9vbGVhbiBdPjtcblxuICAgICAgcHJpdmF0ZSBfcGRvbVRpbWVyRGVsYXkgPSA0MDA7XG4gICAgICBwcml2YXRlIF9wZG9tVGltZXJJbnRlcnZhbCA9IDEwMDtcblxuICAgICAgcHJpdmF0ZSByZWFkb25seSBfZGlzcG9zZUFjY2Vzc2libGVOdW1iZXJTcGlubmVyOiAoKSA9PiB2b2lkO1xuXG4gICAgICBwdWJsaWMgY29uc3RydWN0b3IoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKSB7XG5cbiAgICAgICAgY29uc3QgcHJvdmlkZWRPcHRpb25zID0gYXJnc1sgb3B0aW9uc0FyZ1Bvc2l0aW9uIF0gYXMgQWNjZXNzaWJsZVZhbHVlSGFuZGxlck9wdGlvbnM7XG5cbiAgICAgICAgYXNzZXJ0ICYmIHByb3ZpZGVkT3B0aW9ucyAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggcHJvdmlkZWRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUsXG4gICAgICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBBY2Nlc3NpYmxlU2xpZGVyIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCAob3IgcHJvYmFibHkgYSBidWcpJyApO1xuXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyT3B0aW9ucz4oIHtcbiAgICAgICAgICBhcmlhT3JpZW50YXRpb246IE9yaWVudGF0aW9uLlZFUlRJQ0FMIC8vIGJ5IGRlZmF1bHQsIG51bWJlciBzcGlubmVycyBzaG91bGQgYmUgb3JpZW50ZWQgdmVydGljYWxseVxuICAgICAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgICAgICBhcmdzWyBvcHRpb25zQXJnUG9zaXRpb24gXSA9IG9wdGlvbnM7XG5cbiAgICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcblxuICAgICAgICAvLyBtZW1iZXJzIG9mIHRoZSBOb2RlIEFQSSB0aGF0IGFyZSB1c2VkIGJ5IHRoaXMgdHJhaXRcbiAgICAgICAgYXNzZXJ0SGFzUHJvcGVydGllcyggdGhpcywgWyAnYWRkSW5wdXRMaXN0ZW5lcicgXSApO1xuXG4gICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIgPSBuZXcgQ2FsbGJhY2tUaW1lcigge1xuICAgICAgICAgIGRlbGF5OiB0aGlzLl9wZG9tVGltZXJEZWxheSxcbiAgICAgICAgICBpbnRlcnZhbDogdGhpcy5fcGRvbVRpbWVySW50ZXJ2YWxcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHRoaXMucGRvbUluY3JlbWVudERvd25FbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0gXSB9ICk7XG4gICAgICAgIHRoaXMucGRvbURlY3JlbWVudERvd25FbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH0gXSB9ICk7XG5cbiAgICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnYXJpYS1yb2xlZGVzY3JpcHRpb24nLCBTdW5TdHJpbmdzLmExMXkubnVtYmVyU3Bpbm5lclJvbGVEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ICk7XG5cbiAgICAgICAgLy8gYSBjYWxsYmFjayB0aGF0IGlzIGFkZGVkIGFuZCByZW1vdmVkIGZyb20gdGhlIHRpbWVyIGRlcGVuZGluZyBvbiBrZXlzdGF0ZVxuICAgICAgICBsZXQgZG93bkNhbGxiYWNrOiBDYWxsYmFja1RpbWVyQ2FsbGJhY2sgfCBudWxsID0gbnVsbDtcbiAgICAgICAgbGV0IHJ1bm5pbmdUaW1lckNhbGxiYWNrRXZlbnQ6IEV2ZW50IHwgbnVsbCA9IG51bGw7IC8vIHtFdmVudHxudWxsfVxuXG4gICAgICAgIC8vIGhhbmRsZSBhbGwgYWNjZXNzaWJsZSBldmVudCBpbnB1dFxuICAgICAgICBjb25zdCBhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgPSB7XG4gICAgICAgICAga2V5ZG93bjogZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcblxuICAgICAgICAgICAgICAvLyBjaGVjayBmb3IgcmVsZXZhbnQga2V5cyBoZXJlXG4gICAgICAgICAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc1JhbmdlS2V5KCBldmVudC5kb21FdmVudCApICkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZG9tRXZlbnQgPSBldmVudC5kb21FdmVudCE7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbWV0YSBrZXkgaXMgZG93biB3ZSB3aWxsIG5vdCBldmVuIGNhbGwgdGhlIGtleWRvd24gbGlzdGVuZXIgb2YgdGhlIHN1cGVydHlwZSwgc28gd2UgbmVlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGJlIHN1cmUgdGhhdCBkZWZhdWx0IGJlaGF2aW9yIGlzIHByZXZlbnRlZCBzbyB3ZSBkb24ndCByZWNlaXZlIGBpbnB1dGAgYW5kIGBjaGFuZ2VgIGV2ZW50cy5cbiAgICAgICAgICAgICAgICAvLyBTZWUgQWNjZXNzaWJsZVZhbHVlSGFuZGxlci5oYW5kbGVJbnB1dCBmb3IgaW5mb3JtYXRpb24gb24gdGhlc2UgZXZlbnRzIGFuZCB3aHkgd2UgZG9uJ3Qgd2FudFxuICAgICAgICAgICAgICAgIC8vIHRvIGNoYW5nZSBpbiByZXNwb25zZSB0byB0aGVtLlxuICAgICAgICAgICAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBtZXRhIGtleSBpcyBkb3duIE1hYyB3aWxsIG5vdCBzZW5kIGtleXVwIGV2ZW50cyBzbyBkbyBub3QgY2hhbmdlIHZhbHVlcyBvciBhZGQgdGltZXJcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5lcnMgYmVjYXVzZSB0aGV5IHdpbGwgbmV2ZXIgYmUgcmVtb3ZlZCBzaW5jZSB3ZSBmYWlsIHRvIGdldCBhIGtleXVwIGV2ZW50LiBTZWVcbiAgICAgICAgICAgICAgICBpZiAoICFkb21FdmVudC5tZXRhS2V5ICkge1xuICAgICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5fY2FsbGJhY2tUaW1lci5pc1J1bm5pbmcoKSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWNjZXNzaWJsZU51bWJlclNwaW5uZXJIYW5kbGVLZXlEb3duKCBldmVudCApO1xuXG4gICAgICAgICAgICAgICAgICAgIGRvd25DYWxsYmFjayA9IHRoaXMuX2FjY2Vzc2libGVOdW1iZXJTcGlubmVySGFuZGxlS2V5RG93bi5iaW5kKCB0aGlzLCBldmVudCApO1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nVGltZXJDYWxsYmFja0V2ZW50ID0gZG9tRXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIuYWRkQ2FsbGJhY2soIGRvd25DYWxsYmFjayApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxsYmFja1RpbWVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBrZXl1cDogZXZlbnQgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBrZXkgPSBLZXlib2FyZFV0aWxzLmdldEV2ZW50Q29kZSggZXZlbnQuZG9tRXZlbnQgKTtcblxuICAgICAgICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzUmFuZ2VLZXkoIGV2ZW50LmRvbUV2ZW50ICkgKSB7XG4gICAgICAgICAgICAgIGlmICggcnVubmluZ1RpbWVyQ2FsbGJhY2tFdmVudCAmJiBrZXkgPT09IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBydW5uaW5nVGltZXJDYWxsYmFja0V2ZW50ICkgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW1pdEtleVN0YXRlKCBldmVudC5kb21FdmVudCEsIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FsbGJhY2tUaW1lci5zdG9wKCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRvd25DYWxsYmFjayApO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIucmVtb3ZlQ2FsbGJhY2soIGRvd25DYWxsYmFjayEgKTtcbiAgICAgICAgICAgICAgICBkb3duQ2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUaW1lckNhbGxiYWNrRXZlbnQgPSBudWxsO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlVcCggZXZlbnQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGJsdXI6IGV2ZW50ID0+IHtcblxuICAgICAgICAgICAgLy8gaWYgYSBrZXkgaXMgY3VycmVudGx5IGRvd24gd2hlbiBmb2N1cyBsZWF2ZXMgdGhlIHNwaW5uZXIsIHN0b3AgY2FsbGJhY2tzIGFuZCBlbWl0IHRoYXQgdGhlXG4gICAgICAgICAgICAvLyBrZXkgaXMgdXBcbiAgICAgICAgICAgIGlmICggZG93bkNhbGxiYWNrICkge1xuICAgICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBydW5uaW5nVGltZXJDYWxsYmFja0V2ZW50ICE9PSBudWxsLCAna2V5IHNob3VsZCBiZSBkb3duIGlmIHJ1bm5pbmcgZG93bkNhbGxiYWNrJyApO1xuXG4gICAgICAgICAgICAgIHRoaXMuX2VtaXRLZXlTdGF0ZSggcnVubmluZ1RpbWVyQ2FsbGJhY2tFdmVudCEsIGZhbHNlICk7XG4gICAgICAgICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIuc3RvcCggZmFsc2UgKTtcbiAgICAgICAgICAgICAgdGhpcy5fY2FsbGJhY2tUaW1lci5yZW1vdmVDYWxsYmFjayggZG93bkNhbGxiYWNrICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQmx1ciggZXZlbnQgKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGlucHV0OiB0aGlzLmhhbmRsZUlucHV0LmJpbmQoIHRoaXMgKSxcbiAgICAgICAgICBjaGFuZ2U6IHRoaXMuaGFuZGxlQ2hhbmdlLmJpbmQoIHRoaXMgKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGFjY2Vzc2libGVJbnB1dExpc3RlbmVyICk7XG5cbiAgICAgICAgdGhpcy5fZGlzcG9zZUFjY2Vzc2libGVOdW1iZXJTcGlubmVyID0gKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgLy8gZW1pdHRlcnMgb3duZWQgYnkgdGhpcyBpbnN0YW5jZSwgY2FuIGJlIGRpc3Bvc2VkIGhlcmVcbiAgICAgICAgICB0aGlzLnBkb21JbmNyZW1lbnREb3duRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgICAgICAgdGhpcy5wZG9tRGVjcmVtZW50RG93bkVtaXR0ZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCBhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lciApO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHBkb21UaW1lckRlbGF5KCB2YWx1ZTogbnVtYmVyICkge1xuICAgICAgICB0aGlzLl9wZG9tVGltZXJEZWxheSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICggdGhpcy5fY2FsbGJhY2tUaW1lciApIHtcbiAgICAgICAgICB0aGlzLl9jYWxsYmFja1RpbWVyLmRlbGF5ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBwZG9tVGltZXJEZWxheSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGRvbVRpbWVyRGVsYXk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBzZXQgcGRvbVRpbWVySW50ZXJ2YWwoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgICAgIHRoaXMuX3Bkb21UaW1lckludGVydmFsID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKCB0aGlzLl9jYWxsYmFja1RpbWVyICkge1xuICAgICAgICAgIHRoaXMuX2NhbGxiYWNrVGltZXIuaW50ZXJ2YWwgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwdWJsaWMgZ2V0IHBkb21UaW1lckludGVydmFsKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wZG9tVGltZXJJbnRlcnZhbDtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBIYW5kbGUgdGhlIGtleWRvd24gZXZlbnQgYW5kIGVtaXQgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIHVzZXIgaW50ZXJhY3Rpb24uIElkZWFsbHksIHRoaXMgd291bGRcbiAgICAgICAqIG92ZXJyaWRlIEFjY2Vzc2libGVWYWx1ZUhhbmRsZXIuaGFuZGxlS2V5RG93biwgYnV0IG92ZXJyaWRpbmcgaXMgbm90IHN1cHBvcnRlZCB3aXRoIFBoRVQgVHJhaXQgcGF0dGVybi5cbiAgICAgICAqL1xuXG4gICAgICBwcml2YXRlIF9hY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lckhhbmRsZUtleURvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LmRvbUV2ZW50LCAnbXVzdCBoYXZlIGEgZG9tRXZlbnQnICk7XG4gICAgICAgIHRoaXMuaGFuZGxlS2V5RG93biggZXZlbnQgKTtcbiAgICAgICAgdGhpcy5fZW1pdEtleVN0YXRlKCBldmVudC5kb21FdmVudCEsIHRydWUgKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBFbWl0IGV2ZW50cyByZWxhdGVkIHRvIHRoZSBrZXlzdGF0ZSBvZiB0aGUgc3Bpbm5lci4gVHlwaWNhbGx5IHVzZWQgdG8gc3R5bGUgdGhlIHNwaW5uZXIgZHVyaW5nIGtleWJvYXJkXG4gICAgICAgKiBpbnRlcmFjdGlvbi5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gZG9tRXZlbnQgLSB0aGUgY29kZSBvZiB0aGUga2V5IGNoYW5naW5nIHN0YXRlXG4gICAgICAgKiBAcGFyYW0gaXNEb3duIC0gd2hldGhlciBvciBub3QgZXZlbnQgd2FzIHRyaWdnZXJlZCBmcm9tIGRvd24gb3IgdXAga2V5c1xuICAgICAgICovXG5cbiAgICAgIHByaXZhdGUgX2VtaXRLZXlTdGF0ZSggZG9tRXZlbnQ6IEV2ZW50LCBpc0Rvd246IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgICAgIHZhbGlkYXRlKCBkb21FdmVudCwgeyB2YWx1ZVR5cGU6IEV2ZW50IH0gKTtcbiAgICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzQW55S2V5RXZlbnQoIGRvbUV2ZW50LCBbIEtleWJvYXJkVXRpbHMuS0VZX1VQX0FSUk9XLCBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVyBdICkgKSB7XG4gICAgICAgICAgdGhpcy5wZG9tSW5jcmVtZW50RG93bkVtaXR0ZXIuZW1pdCggaXNEb3duICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIEtleWJvYXJkVXRpbHMuaXNBbnlLZXlFdmVudCggZG9tRXZlbnQsIFsgS2V5Ym9hcmRVdGlscy5LRVlfRE9XTl9BUlJPVywgS2V5Ym9hcmRVdGlscy5LRVlfTEVGVF9BUlJPVyBdICkgKSB7XG4gICAgICAgICAgdGhpcy5wZG9tRGVjcmVtZW50RG93bkVtaXR0ZXIuZW1pdCggaXNEb3duICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lcigpO1xuXG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgLyoqXG4gICAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBOb2RlLm11dGF0ZSggb3B0aW9ucyApLCBpblxuICAgKiB0aGUgb3JkZXIgdGhleSB3aWxsIGJlIGV2YWx1YXRlZC5cbiAgICpcbiAgICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gICAqICAgICAgIGNhc2VzIHRoYXQgbWF5IGFwcGx5LlxuICAgKi9cbiAgQWNjZXNzaWJsZU51bWJlclNwaW5uZXJDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gQUNDRVNTSUJMRV9OVU1CRVJfU1BJTk5FUl9PUFRJT05TLmNvbmNhdCggQWNjZXNzaWJsZU51bWJlclNwaW5uZXJDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzICk7XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggQWNjZXNzaWJsZU51bWJlclNwaW5uZXJDbGFzcy5wcm90b3R5cGUuX211dGF0b3JLZXlzLmxlbmd0aCA9PT0gXy51bmlxKCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lckNsYXNzLnByb3RvdHlwZS5fbXV0YXRvcktleXMgKS5sZW5ndGgsICdkdXBsaWNhdGUgbXV0YXRvciBrZXlzIGluIEFjY2Vzc2libGVOdW1iZXJTcGlubmVyJyApO1xuXG4gIHJldHVybiBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lckNsYXNzO1xufTtcblxuc3VuLnJlZ2lzdGVyKCAnQWNjZXNzaWJsZU51bWJlclNwaW5uZXInLCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciApO1xuXG5leHBvcnQgZGVmYXVsdCBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lcjtcbmV4cG9ydCB0eXBlIHsgQWNjZXNzaWJsZU51bWJlclNwaW5uZXJPcHRpb25zIH07Il0sIm5hbWVzIjpbIkNhbGxiYWNrVGltZXIiLCJFbWl0dGVyIiwidmFsaWRhdGUiLCJhc3NlcnRIYXNQcm9wZXJ0aWVzIiwiY29tYmluZU9wdGlvbnMiLCJPcmllbnRhdGlvbiIsIkRlbGF5ZWRNdXRhdGUiLCJLZXlib2FyZFV0aWxzIiwic3VuIiwiU3VuU3RyaW5ncyIsIkFjY2Vzc2libGVWYWx1ZUhhbmRsZXIiLCJBQ0NFU1NJQkxFX05VTUJFUl9TUElOTkVSX09QVElPTlMiLCJBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciIsIlR5cGUiLCJvcHRpb25zQXJnUG9zaXRpb24iLCJBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lckNsYXNzIiwicGRvbVRpbWVyRGVsYXkiLCJ2YWx1ZSIsIl9wZG9tVGltZXJEZWxheSIsIl9jYWxsYmFja1RpbWVyIiwiZGVsYXkiLCJwZG9tVGltZXJJbnRlcnZhbCIsIl9wZG9tVGltZXJJbnRlcnZhbCIsImludGVydmFsIiwiX2FjY2Vzc2libGVOdW1iZXJTcGlubmVySGFuZGxlS2V5RG93biIsImV2ZW50IiwiYXNzZXJ0IiwiZG9tRXZlbnQiLCJoYW5kbGVLZXlEb3duIiwiX2VtaXRLZXlTdGF0ZSIsImlzRG93biIsInZhbHVlVHlwZSIsIkV2ZW50IiwiaXNBbnlLZXlFdmVudCIsIktFWV9VUF9BUlJPVyIsIktFWV9SSUdIVF9BUlJPVyIsInBkb21JbmNyZW1lbnREb3duRW1pdHRlciIsImVtaXQiLCJLRVlfRE9XTl9BUlJPVyIsIktFWV9MRUZUX0FSUk9XIiwicGRvbURlY3JlbWVudERvd25FbWl0dGVyIiwiZGlzcG9zZSIsIl9kaXNwb3NlQWNjZXNzaWJsZU51bWJlclNwaW5uZXIiLCJhcmdzIiwicHJvdmlkZWRPcHRpb25zIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJvcHRpb25zIiwiYXJpYU9yaWVudGF0aW9uIiwiVkVSVElDQUwiLCJwYXJhbWV0ZXJzIiwic2V0UERPTUF0dHJpYnV0ZSIsImExMXkiLCJudW1iZXJTcGlubmVyUm9sZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJkb3duQ2FsbGJhY2siLCJydW5uaW5nVGltZXJDYWxsYmFja0V2ZW50IiwiYWNjZXNzaWJsZUlucHV0TGlzdGVuZXIiLCJrZXlkb3duIiwiZW5hYmxlZFByb3BlcnR5IiwiZ2V0IiwiaXNSYW5nZUtleSIsInByZXZlbnREZWZhdWx0IiwibWV0YUtleSIsImlzUnVubmluZyIsImJpbmQiLCJhZGRDYWxsYmFjayIsInN0YXJ0Iiwia2V5dXAiLCJrZXkiLCJnZXRFdmVudENvZGUiLCJzdG9wIiwicmVtb3ZlQ2FsbGJhY2siLCJoYW5kbGVLZXlVcCIsImJsdXIiLCJoYW5kbGVCbHVyIiwiaW5wdXQiLCJoYW5kbGVJbnB1dCIsImNoYW5nZSIsImhhbmRsZUNoYW5nZSIsImFkZElucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiX211dGF0b3JLZXlzIiwiY29uY2F0IiwibGVuZ3RoIiwiXyIsInVuaXEiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNE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