// Copyright 2024, University of Colorado Boulder
/**
 * Represents a single hotkey (keyboard shortcut) that can be either:
 *
 * 1. Added to globalHotkeyRegistry (to be available regardless of keyboard focus)
 * 2. Added to a node's inputListeners (to be available only when that node is part of the focused trail)
 *
 * For example:
 *
 *    globalHotkeyRegistry.add( new Hotkey( {
 *      keyStringProperty: new Property( 'y' ),
 *      fire: () => console.log( 'fire: y' )
 *    } ) );
 *
 *    myNode.addInputListener( {
 *      hotkeys: [
 *        new Hotkey( {
 *          keyStringProperty: new Property( 'x' ),
 *          fire: () => console.log( 'fire: x' )
 *        } )
 *      ]
 *    } );
 *
 * Also supports modifier keys that must be pressed in addition to the Key. See options for a description of how
 * they behave.
 *
 * Hotkeys are managed by hotkeyManager, which determines which hotkeys are active based on the globalHotkeyRegistry
 * and what Node has focus. See that class for information about how hotkeys work.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import optionize from '../../../phet-core/js/optionize.js';
import { EnglishStringToCodeMap, hotkeyManager, KeyDescriptor, scenery } from '../imports.js';
let Hotkey = class Hotkey extends EnabledComponent {
    /**
   * On "press" of a Hotkey. All keys are pressed while the Hotkey is active. May also fire depending on
   * events. See hotkeyManager.
   *
   * (scenery-internal)
   */ onPress(event, shouldFire) {
        // clear the flag on every press (set before notifying the isPressedProperty)
        this.interrupted = false;
        this.isPressedProperty.value = true;
        // press after setting up state
        this.press(event);
        if (shouldFire) {
            this.fire(event);
        }
    }
    /**
   * On "release" of a Hotkey. All keys are released while the Hotkey is inactive. May also fire depending on
   * events. See hotkeyManager.
   */ onRelease(event, interrupted, shouldFire) {
        this.interrupted = interrupted;
        this.isPressedProperty.value = false;
        this.release(event);
        if (shouldFire) {
            this.fire(event);
        }
    }
    /**
   * Manually interrupt this hotkey, releasing it and setting a flag so that it will not fire until the next time
   * keys are pressed.
   */ interrupt() {
        if (this.isPressedProperty.value) {
            hotkeyManager.interruptHotkey(this);
        }
    }
    dispose() {
        this.isPressedProperty.dispose();
        this.keysProperty.dispose();
        this.keyDescriptorProperty.dispose();
        super.dispose();
    }
    constructor(providedOptions){
        assert && assert(providedOptions.fireOnHoldTiming === 'custom' || providedOptions.fireOnHoldCustomDelay === undefined && providedOptions.fireOnHoldCustomInterval === undefined, 'Cannot specify fireOnHoldCustomDelay / fireOnHoldCustomInterval if fireOnHoldTiming is not custom');
        const options = optionize()({
            fire: _.noop,
            press: _.noop,
            release: _.noop,
            fireOnDown: true,
            fireOnHold: false,
            fireOnHoldTiming: 'browser',
            fireOnHoldCustomDelay: 400,
            fireOnHoldCustomInterval: 100,
            allowOverlap: false,
            override: false
        }, providedOptions);
        super(options), // A Property that tracks whether the hotkey is currently pressed.
        // Will be true if it meets the following conditions:
        //
        // 1. Main `key` pressed
        // 2. All modifier keys in the hotkey's `modifierKeys` are pressed
        // 3. All modifier keys not in the hotkey's `modifierKeys` (but in the other enabled hotkeys) are not pressed
        this.isPressedProperty = new BooleanProperty(false), // (read-only for client code)
        // Whether the last release (value during isPressedProperty => false) was due to an interruption (e.g. focus changed).
        // If false, the hotkey was released due to the key being released.
        this.interrupted = false;
        // Store public things
        this.keyStringProperty = options.keyStringProperty;
        this.fire = options.fire;
        this.press = options.press;
        this.release = options.release;
        this.fireOnDown = options.fireOnDown;
        this.fireOnHold = options.fireOnHold;
        this.fireOnHoldTiming = options.fireOnHoldTiming;
        this.allowOverlap = options.allowOverlap;
        this.override = options.override;
        this.keyDescriptorProperty = new DerivedProperty([
            this.keyStringProperty
        ], (keyString)=>{
            return KeyDescriptor.keyStrokeToKeyDescriptor(keyString);
        });
        this.keysProperty = new DerivedProperty([
            this.keyDescriptorProperty
        ], (keyDescriptor)=>{
            const keys = _.uniq([
                keyDescriptor.key,
                ...keyDescriptor.modifierKeys
            ]);
            // Make sure that every key has an entry in the EnglishStringToCodeMap
            for (const key of keys){
                assert && assert(EnglishStringToCodeMap[key], `No codes for this key exists, do you need to add it to EnglishStringToCodeMap?: ${key}`);
            }
            return keys;
        });
        // Create a timer to handle the optional fire-on-hold feature.
        if (this.fireOnHold && this.fireOnHoldTiming === 'custom') {
            this.fireOnHoldTimer = new CallbackTimer({
                callback: this.fire.bind(this, null),
                delay: options.fireOnHoldCustomDelay,
                interval: options.fireOnHoldCustomInterval
            });
            this.disposeEmitter.addListener(()=>this.fireOnHoldTimer.dispose());
            this.isPressedProperty.link((isPressed)=>{
                // We need to reset the timer, so we stop it (even if we are starting it in just a bit again)
                this.fireOnHoldTimer.stop(false);
                if (isPressed) {
                    this.fireOnHoldTimer.start();
                }
            });
        }
    }
};
export { Hotkey as default };
scenery.register('Hotkey', Hotkey);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvSG90a2V5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2luZ2xlIGhvdGtleSAoa2V5Ym9hcmQgc2hvcnRjdXQpIHRoYXQgY2FuIGJlIGVpdGhlcjpcbiAqXG4gKiAxLiBBZGRlZCB0byBnbG9iYWxIb3RrZXlSZWdpc3RyeSAodG8gYmUgYXZhaWxhYmxlIHJlZ2FyZGxlc3Mgb2Yga2V5Ym9hcmQgZm9jdXMpXG4gKiAyLiBBZGRlZCB0byBhIG5vZGUncyBpbnB1dExpc3RlbmVycyAodG8gYmUgYXZhaWxhYmxlIG9ubHkgd2hlbiB0aGF0IG5vZGUgaXMgcGFydCBvZiB0aGUgZm9jdXNlZCB0cmFpbClcbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgICBnbG9iYWxIb3RrZXlSZWdpc3RyeS5hZGQoIG5ldyBIb3RrZXkoIHtcbiAqICAgICAga2V5U3RyaW5nUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggJ3knICksXG4gKiAgICAgIGZpcmU6ICgpID0+IGNvbnNvbGUubG9nKCAnZmlyZTogeScgKVxuICogICAgfSApICk7XG4gKlxuICogICAgbXlOb2RlLmFkZElucHV0TGlzdGVuZXIoIHtcbiAqICAgICAgaG90a2V5czogW1xuICogICAgICAgIG5ldyBIb3RrZXkoIHtcbiAqICAgICAgICAgIGtleVN0cmluZ1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoICd4JyApLFxuICogICAgICAgICAgZmlyZTogKCkgPT4gY29uc29sZS5sb2coICdmaXJlOiB4JyApXG4gKiAgICAgICAgfSApXG4gKiAgICAgIF1cbiAqICAgIH0gKTtcbiAqXG4gKiBBbHNvIHN1cHBvcnRzIG1vZGlmaWVyIGtleXMgdGhhdCBtdXN0IGJlIHByZXNzZWQgaW4gYWRkaXRpb24gdG8gdGhlIEtleS4gU2VlIG9wdGlvbnMgZm9yIGEgZGVzY3JpcHRpb24gb2YgaG93XG4gKiB0aGV5IGJlaGF2ZS5cbiAqXG4gKiBIb3RrZXlzIGFyZSBtYW5hZ2VkIGJ5IGhvdGtleU1hbmFnZXIsIHdoaWNoIGRldGVybWluZXMgd2hpY2ggaG90a2V5cyBhcmUgYWN0aXZlIGJhc2VkIG9uIHRoZSBnbG9iYWxIb3RrZXlSZWdpc3RyeVxuICogYW5kIHdoYXQgTm9kZSBoYXMgZm9jdXMuIFNlZSB0aGF0IGNsYXNzIGZvciBpbmZvcm1hdGlvbiBhYm91dCBob3cgaG90a2V5cyB3b3JrLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IENhbGxiYWNrVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9DYWxsYmFja1RpbWVyLmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IEVuYWJsZWRDb21wb25lbnQsIHsgRW5hYmxlZENvbXBvbmVudE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VuYWJsZWRDb21wb25lbnQuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgQWxsb3dlZEtleXNTdHJpbmcsIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAsIGhvdGtleU1hbmFnZXIsIEtleURlc2NyaXB0b3IsIE9uZUtleVN0cm9rZSwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgdHlwZSBIb3RrZXlGaXJlT25Ib2xkVGltaW5nID0gJ2Jyb3dzZXInIHwgJ2N1c3RvbSc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gRGVzY3JpYmVzIHRoZSBrZXlzLCBtb2RpZmllciBrZXlzLCBhbmQgaWdub3JlZCBtb2RpZmllciBrZXlzIGZvciB0aGlzIGhvdGtleS4gVGhpcyBpcyBhIFByb3BlcnR5IHRvIHN1cHBvcnRcbiAgLy8gZHluYW1pYyBiZWhhdmlvci4gVGhpcyB3aWxsIGJlIHVzZWZ1bCBmb3IgaTE4biBvciBjcmVhdGluZyBuZXcga2V5bWFwcy4gU2VlIEtleURlc2NyaXB0b3IgZm9yIGRvY3VtZW50YXRpb25cbiAgLy8gYWJvdXQgdGhlIGtleSBhbmQgbW9kaWZpZXJLZXlzLlxuICBrZXlTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8T25lS2V5U3Ryb2tlPjtcblxuICAvLyBDYWxsZWQgYXMgZmlyZSgpIHdoZW4gdGhlIGhvdGtleSBpcyBmaXJlZCAoc2VlIGZpcmVPbkRvd24vZmlyZU9uSG9sZCBmb3Igd2hlbiB0aGF0IGhhcHBlbnMpLlxuICAvLyBUaGUgZXZlbnQgd2lsbCBiZSBudWxsIGlmIHRoZSBob3RrZXkgd2FzIGZpcmVkIGR1ZSB0byBmaXJlLW9uLWhvbGQuXG4gIGZpcmU/OiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCApID0+IHZvaWQ7XG5cbiAgLy8gQ2FsbGVkIGFzIHByZXNzKCkgd2hlbiB0aGUgaG90a2V5IGlzIHByZXNzZWQuIE5vdGUgdGhhdCB0aGUgSG90a2V5IG1heSBiZSBwcmVzc2VkIGJlZm9yZSBmaXJpbmcgZGVwZW5kaW5nXG4gIC8vIG9uIGZpcmVPbkRvd24uIEFuZCBwcmVzcyBpcyBub3QgY2FsbGVkIHdpdGggZmlyZS1vbi1ob2xkLiBUaGUgZXZlbnQgbWF5IGJlIG51bGwgaWYgdGhlcmUgaXMgYSBwcmVzcyBkdWUgdG9cbiAgLy8gdGhlIGhvdGtleSBiZWNvbWluZyBhY3RpdmUgZHVlIHRvIGNoYW5nZSBpbiBzdGF0ZSB3aXRob3V0IGEga2V5IHByZXNzLlxuICBwcmVzcz86ICggZXZlbnQ6IEtleWJvYXJkRXZlbnQgfCBudWxsICkgPT4gdm9pZDtcblxuICAvLyBDYWxsZWQgYXMgcmVsZWFzZSgpIHdoZW4gdGhlIEhvdGtleSBpcyByZWxlYXNlZC4gTm90ZSB0aGF0IHRoZSBIb3RrZXkgbWF5IHJlbGVhc2Ugd2l0aG91dCBjYWxsaW5nIGZpcmUoKSBkZXBlbmRpbmdcbiAgLy8gb24gZmlyZU9uRG93bi4gRXZlbnQgbWF5IGJlIG51bGwgaW4gY2FzZXMgb2YgaW50ZXJydXB0IG9yIGlmIHRoZSBob3RrZXkgaXMgcmVsZWFzZWQgZHVlIHRvIGNoYW5nZSBpbiBzdGF0ZSB3aXRob3V0XG4gIC8vIGEga2V5IHJlbGVhc2UuXG4gIHJlbGVhc2U/OiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCApID0+IHZvaWQ7XG5cbiAgLy8gSWYgdHJ1ZSwgdGhlIGhvdGtleSB3aWxsIGZpcmUgd2hlbiB0aGUgaG90a2V5IGlzIGluaXRpYWxseSBwcmVzc2VkLlxuICAvLyBJZiBmYWxzZSwgdGhlIGhvdGtleSB3aWxsIGZpcmUgd2hlbiB0aGUgaG90a2V5IGlzIGZpbmFsbHkgcmVsZWFzZWQuXG4gIGZpcmVPbkRvd24/OiBib29sZWFuO1xuXG4gIC8vIFdoZXRoZXIgdGhlIGZpcmUtb24taG9sZCBmZWF0dXJlIGlzIGVuYWJsZWRcbiAgZmlyZU9uSG9sZD86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB3ZSBzaG91bGQgbGlzdGVuIHRvIHRoZSBicm93c2VyJ3MgZmlyZS1vbi1ob2xkIHRpbWluZywgb3IgdXNlIG91ciBvd24uXG4gIGZpcmVPbkhvbGRUaW1pbmc/OiBIb3RrZXlGaXJlT25Ib2xkVGltaW5nO1xuXG4gIC8vIFN0YXJ0IHRvIGZpcmUgY29udGludW91c2x5IGFmdGVyIHByZXNzaW5nIGZvciB0aGlzIGxvbmcgKG1pbGxpc2Vjb25kcylcbiAgZmlyZU9uSG9sZEN1c3RvbURlbGF5PzogbnVtYmVyO1xuXG4gIC8vIEZpcmUgY29udGludW91c2x5IGF0IHRoaXMgaW50ZXJ2YWwgKG1pbGxpc2Vjb25kcylcbiAgZmlyZU9uSG9sZEN1c3RvbUludGVydmFsPzogbnVtYmVyO1xuXG4gIC8vIEZvciBlYWNoIG1haW4gYGtleWAsIHRoZSBob3RrZXkgc3lzdGVtIHdpbGwgb25seSBhbGxvdyBvbmUgaG90a2V5IHdpdGggYWxsb3dPdmVybGFwOmZhbHNlIHRvIGJlIGFjdGl2ZSBhdCBhbnkgdGltZS5cbiAgLy8gVGhpcyBpcyBwcm92aWRlZCB0byBhbGxvdyBtdWx0aXBsZSBob3RrZXlzIHdpdGggdGhlIHNhbWUga2V5cyB0byBmaXJlLiBEZWZhdWx0IGlzIGZhbHNlLlxuICBhbGxvd092ZXJsYXA/OiBib29sZWFuO1xuXG4gIC8vIElmIHRydWUsIGFueSBvdmVybGFwcGluZyBob3RrZXlzIChlaXRoZXIgYWRkZWQgdG8gYW4gYW5jZXN0b3IncyBpbnB1dExpc3RlbmVyIG9yIGxhdGVyIGluIHRoZSBsb2NhbC9nbG9iYWwgb3JkZXIpXG4gIC8vIHdpbGwgYmUgaWdub3JlZC5cbiAgb3ZlcnJpZGU/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgSG90a2V5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRW5hYmxlZENvbXBvbmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvdGtleSBleHRlbmRzIEVuYWJsZWRDb21wb25lbnQge1xuXG4gIC8vIFN0cmFpZ2h0IGZyb20gb3B0aW9uc1xuICBwdWJsaWMgcmVhZG9ubHkga2V5U3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE9uZUtleVN0cm9rZT47XG4gIHB1YmxpYyByZWFkb25seSBmaXJlOiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCApID0+IHZvaWQ7XG4gIHB1YmxpYyByZWFkb25seSBwcmVzczogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwgKSA9PiB2b2lkO1xuICBwdWJsaWMgcmVhZG9ubHkgcmVsZWFzZTogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwgKSA9PiB2b2lkO1xuICBwdWJsaWMgcmVhZG9ubHkgZmlyZU9uRG93bjogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IGZpcmVPbkhvbGQ6IGJvb2xlYW47XG4gIHB1YmxpYyByZWFkb25seSBmaXJlT25Ib2xkVGltaW5nOiBIb3RrZXlGaXJlT25Ib2xkVGltaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgYWxsb3dPdmVybGFwOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgb3ZlcnJpZGU6IGJvb2xlYW47XG5cbiAgLy8gQSBQcm9wZXJ0eSBmb3IgdGhlIEtleURlc2NyaXB0b3IgZGVzY3JpYmluZyB0aGUga2V5IGFuZCBtb2RpZmllciBrZXlzIGZvciB0aGlzIGhvdGtleSBmcm9tIHRoZSBrZXlTdHJpbmdQcm9wZXJ0eS5cbiAgcHVibGljIHJlYWRvbmx5IGtleURlc2NyaXB0b3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8S2V5RGVzY3JpcHRvcj47XG5cbiAgLy8gQWxsIGtleXMgdGhhdCBhcmUgcGFydCBvZiB0aGlzIGhvdGtleSAoa2V5ICsgbW9kaWZpZXJLZXlzKSBhcyBkZWZpbmVkIGJ5IHRoZSBjdXJyZW50IEtleURlc2NyaXB0b3IuXG4gIHB1YmxpYyBrZXlzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEFsbG93ZWRLZXlzU3RyaW5nW10+O1xuXG4gIC8vIEEgUHJvcGVydHkgdGhhdCB0cmFja3Mgd2hldGhlciB0aGUgaG90a2V5IGlzIGN1cnJlbnRseSBwcmVzc2VkLlxuICAvLyBXaWxsIGJlIHRydWUgaWYgaXQgbWVldHMgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICAvL1xuICAvLyAxLiBNYWluIGBrZXlgIHByZXNzZWRcbiAgLy8gMi4gQWxsIG1vZGlmaWVyIGtleXMgaW4gdGhlIGhvdGtleSdzIGBtb2RpZmllcktleXNgIGFyZSBwcmVzc2VkXG4gIC8vIDMuIEFsbCBtb2RpZmllciBrZXlzIG5vdCBpbiB0aGUgaG90a2V5J3MgYG1vZGlmaWVyS2V5c2AgKGJ1dCBpbiB0aGUgb3RoZXIgZW5hYmxlZCBob3RrZXlzKSBhcmUgbm90IHByZXNzZWRcbiAgcHVibGljIHJlYWRvbmx5IGlzUHJlc3NlZFByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj4gPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuXG4gIC8vIChyZWFkLW9ubHkgZm9yIGNsaWVudCBjb2RlKVxuICAvLyBXaGV0aGVyIHRoZSBsYXN0IHJlbGVhc2UgKHZhbHVlIGR1cmluZyBpc1ByZXNzZWRQcm9wZXJ0eSA9PiBmYWxzZSkgd2FzIGR1ZSB0byBhbiBpbnRlcnJ1cHRpb24gKGUuZy4gZm9jdXMgY2hhbmdlZCkuXG4gIC8vIElmIGZhbHNlLCB0aGUgaG90a2V5IHdhcyByZWxlYXNlZCBkdWUgdG8gdGhlIGtleSBiZWluZyByZWxlYXNlZC5cbiAgcHVibGljIGludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgLy8gSW50ZXJuYWwgdGltZXIgZm9yIHdoZW4gZmlyZU9uSG9sZDp0cnVlIGFuZCBmaXJlT25Ib2xkVGltaW5nOmN1c3RvbS5cbiAgcHJpdmF0ZSBmaXJlT25Ib2xkVGltZXI/OiBDYWxsYmFja1RpbWVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwcm92aWRlZE9wdGlvbnM6IEhvdGtleU9wdGlvbnNcbiAgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm92aWRlZE9wdGlvbnMuZmlyZU9uSG9sZFRpbWluZyA9PT0gJ2N1c3RvbScgfHwgKCBwcm92aWRlZE9wdGlvbnMuZmlyZU9uSG9sZEN1c3RvbURlbGF5ID09PSB1bmRlZmluZWQgJiYgcHJvdmlkZWRPcHRpb25zLmZpcmVPbkhvbGRDdXN0b21JbnRlcnZhbCA9PT0gdW5kZWZpbmVkICksXG4gICAgICAnQ2Fubm90IHNwZWNpZnkgZmlyZU9uSG9sZEN1c3RvbURlbGF5IC8gZmlyZU9uSG9sZEN1c3RvbUludGVydmFsIGlmIGZpcmVPbkhvbGRUaW1pbmcgaXMgbm90IGN1c3RvbScgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SG90a2V5T3B0aW9ucywgU2VsZk9wdGlvbnMsIEVuYWJsZWRDb21wb25lbnRPcHRpb25zPigpKCB7XG4gICAgICBmaXJlOiBfLm5vb3AsXG4gICAgICBwcmVzczogXy5ub29wLFxuICAgICAgcmVsZWFzZTogXy5ub29wLFxuICAgICAgZmlyZU9uRG93bjogdHJ1ZSxcbiAgICAgIGZpcmVPbkhvbGQ6IGZhbHNlLFxuICAgICAgZmlyZU9uSG9sZFRpbWluZzogJ2Jyb3dzZXInLFxuICAgICAgZmlyZU9uSG9sZEN1c3RvbURlbGF5OiA0MDAsXG4gICAgICBmaXJlT25Ib2xkQ3VzdG9tSW50ZXJ2YWw6IDEwMCxcbiAgICAgIGFsbG93T3ZlcmxhcDogZmFsc2UsXG4gICAgICBvdmVycmlkZTogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBTdG9yZSBwdWJsaWMgdGhpbmdzXG4gICAgdGhpcy5rZXlTdHJpbmdQcm9wZXJ0eSA9IG9wdGlvbnMua2V5U3RyaW5nUHJvcGVydHk7XG4gICAgdGhpcy5maXJlID0gb3B0aW9ucy5maXJlO1xuICAgIHRoaXMucHJlc3MgPSBvcHRpb25zLnByZXNzO1xuICAgIHRoaXMucmVsZWFzZSA9IG9wdGlvbnMucmVsZWFzZTtcbiAgICB0aGlzLmZpcmVPbkRvd24gPSBvcHRpb25zLmZpcmVPbkRvd247XG4gICAgdGhpcy5maXJlT25Ib2xkID0gb3B0aW9ucy5maXJlT25Ib2xkO1xuICAgIHRoaXMuZmlyZU9uSG9sZFRpbWluZyA9IG9wdGlvbnMuZmlyZU9uSG9sZFRpbWluZztcbiAgICB0aGlzLmFsbG93T3ZlcmxhcCA9IG9wdGlvbnMuYWxsb3dPdmVybGFwO1xuICAgIHRoaXMub3ZlcnJpZGUgPSBvcHRpb25zLm92ZXJyaWRlO1xuXG4gICAgdGhpcy5rZXlEZXNjcmlwdG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMua2V5U3RyaW5nUHJvcGVydHkgXSwgKCBrZXlTdHJpbmc6IE9uZUtleVN0cm9rZSApID0+IHtcbiAgICAgIHJldHVybiBLZXlEZXNjcmlwdG9yLmtleVN0cm9rZVRvS2V5RGVzY3JpcHRvcigga2V5U3RyaW5nICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5rZXlzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMua2V5RGVzY3JpcHRvclByb3BlcnR5IF0sICgga2V5RGVzY3JpcHRvcjogS2V5RGVzY3JpcHRvciApID0+IHtcbiAgICAgIGNvbnN0IGtleXMgPSBfLnVuaXEoIFsga2V5RGVzY3JpcHRvci5rZXksIC4uLmtleURlc2NyaXB0b3IubW9kaWZpZXJLZXlzIF0gKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZXZlcnkga2V5IGhhcyBhbiBlbnRyeSBpbiB0aGUgRW5nbGlzaFN0cmluZ1RvQ29kZU1hcFxuICAgICAgZm9yICggY29uc3Qga2V5IG9mIGtleXMgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXBbIGtleSBdLCBgTm8gY29kZXMgZm9yIHRoaXMga2V5IGV4aXN0cywgZG8geW91IG5lZWQgdG8gYWRkIGl0IHRvIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXA/OiAke2tleX1gICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBrZXlzO1xuICAgIH0gKTtcblxuICAgIC8vIENyZWF0ZSBhIHRpbWVyIHRvIGhhbmRsZSB0aGUgb3B0aW9uYWwgZmlyZS1vbi1ob2xkIGZlYXR1cmUuXG4gICAgaWYgKCB0aGlzLmZpcmVPbkhvbGQgJiYgdGhpcy5maXJlT25Ib2xkVGltaW5nID09PSAnY3VzdG9tJyApIHtcbiAgICAgIHRoaXMuZmlyZU9uSG9sZFRpbWVyID0gbmV3IENhbGxiYWNrVGltZXIoIHtcbiAgICAgICAgY2FsbGJhY2s6IHRoaXMuZmlyZS5iaW5kKCB0aGlzLCBudWxsICksIC8vIFBhc3MgbnVsbCBmb3IgZmlyZS1vbi1ob2xkIGV2ZW50c1xuICAgICAgICBkZWxheTogb3B0aW9ucy5maXJlT25Ib2xkQ3VzdG9tRGVsYXksXG4gICAgICAgIGludGVydmFsOiBvcHRpb25zLmZpcmVPbkhvbGRDdXN0b21JbnRlcnZhbFxuICAgICAgfSApO1xuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5maXJlT25Ib2xkVGltZXIhLmRpc3Bvc2UoKSApO1xuXG4gICAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmxpbmsoIGlzUHJlc3NlZCA9PiB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gcmVzZXQgdGhlIHRpbWVyLCBzbyB3ZSBzdG9wIGl0IChldmVuIGlmIHdlIGFyZSBzdGFydGluZyBpdCBpbiBqdXN0IGEgYml0IGFnYWluKVxuICAgICAgICB0aGlzLmZpcmVPbkhvbGRUaW1lciEuc3RvcCggZmFsc2UgKTtcblxuICAgICAgICBpZiAoIGlzUHJlc3NlZCApIHtcbiAgICAgICAgICB0aGlzLmZpcmVPbkhvbGRUaW1lciEuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBcInByZXNzXCIgb2YgYSBIb3RrZXkuIEFsbCBrZXlzIGFyZSBwcmVzc2VkIHdoaWxlIHRoZSBIb3RrZXkgaXMgYWN0aXZlLiBNYXkgYWxzbyBmaXJlIGRlcGVuZGluZyBvblxuICAgKiBldmVudHMuIFNlZSBob3RrZXlNYW5hZ2VyLlxuICAgKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvblByZXNzKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIHNob3VsZEZpcmU6IGJvb2xlYW4gKTogdm9pZCB7XG5cbiAgICAvLyBjbGVhciB0aGUgZmxhZyBvbiBldmVyeSBwcmVzcyAoc2V0IGJlZm9yZSBub3RpZnlpbmcgdGhlIGlzUHJlc3NlZFByb3BlcnR5KVxuICAgIHRoaXMuaW50ZXJydXB0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuXG4gICAgLy8gcHJlc3MgYWZ0ZXIgc2V0dGluZyB1cCBzdGF0ZVxuICAgIHRoaXMucHJlc3MoIGV2ZW50ICk7XG5cbiAgICBpZiAoIHNob3VsZEZpcmUgKSB7XG4gICAgICB0aGlzLmZpcmUoIGV2ZW50ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIFwicmVsZWFzZVwiIG9mIGEgSG90a2V5LiBBbGwga2V5cyBhcmUgcmVsZWFzZWQgd2hpbGUgdGhlIEhvdGtleSBpcyBpbmFjdGl2ZS4gTWF5IGFsc28gZmlyZSBkZXBlbmRpbmcgb25cbiAgICogZXZlbnRzLiBTZWUgaG90a2V5TWFuYWdlci5cbiAgICovXG4gIHB1YmxpYyBvblJlbGVhc2UoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCwgaW50ZXJydXB0ZWQ6IGJvb2xlYW4sIHNob3VsZEZpcmU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGludGVycnVwdGVkO1xuXG4gICAgdGhpcy5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZWxlYXNlKCBldmVudCApO1xuXG4gICAgaWYgKCBzaG91bGRGaXJlICkge1xuICAgICAgdGhpcy5maXJlKCBldmVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSBpbnRlcnJ1cHQgdGhpcyBob3RrZXksIHJlbGVhc2luZyBpdCBhbmQgc2V0dGluZyBhIGZsYWcgc28gdGhhdCBpdCB3aWxsIG5vdCBmaXJlIHVudGlsIHRoZSBuZXh0IHRpbWVcbiAgICoga2V5cyBhcmUgcHJlc3NlZC5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgaG90a2V5TWFuYWdlci5pbnRlcnJ1cHRIb3RrZXkoIHRoaXMgKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmtleXNQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5rZXlEZXNjcmlwdG9yUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSG90a2V5JywgSG90a2V5ICk7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkNhbGxiYWNrVGltZXIiLCJEZXJpdmVkUHJvcGVydHkiLCJFbmFibGVkQ29tcG9uZW50Iiwib3B0aW9uaXplIiwiRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCIsImhvdGtleU1hbmFnZXIiLCJLZXlEZXNjcmlwdG9yIiwic2NlbmVyeSIsIkhvdGtleSIsIm9uUHJlc3MiLCJldmVudCIsInNob3VsZEZpcmUiLCJpbnRlcnJ1cHRlZCIsImlzUHJlc3NlZFByb3BlcnR5IiwidmFsdWUiLCJwcmVzcyIsImZpcmUiLCJvblJlbGVhc2UiLCJyZWxlYXNlIiwiaW50ZXJydXB0IiwiaW50ZXJydXB0SG90a2V5IiwiZGlzcG9zZSIsImtleXNQcm9wZXJ0eSIsImtleURlc2NyaXB0b3JQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsImZpcmVPbkhvbGRUaW1pbmciLCJmaXJlT25Ib2xkQ3VzdG9tRGVsYXkiLCJ1bmRlZmluZWQiLCJmaXJlT25Ib2xkQ3VzdG9tSW50ZXJ2YWwiLCJvcHRpb25zIiwiXyIsIm5vb3AiLCJmaXJlT25Eb3duIiwiZmlyZU9uSG9sZCIsImFsbG93T3ZlcmxhcCIsIm92ZXJyaWRlIiwia2V5U3RyaW5nUHJvcGVydHkiLCJrZXlTdHJpbmciLCJrZXlTdHJva2VUb0tleURlc2NyaXB0b3IiLCJrZXlEZXNjcmlwdG9yIiwia2V5cyIsInVuaXEiLCJrZXkiLCJtb2RpZmllcktleXMiLCJmaXJlT25Ib2xkVGltZXIiLCJjYWxsYmFjayIsImJpbmQiLCJkZWxheSIsImludGVydmFsIiwiZGlzcG9zZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxpbmsiLCJpc1ByZXNzZWQiLCJzdG9wIiwic3RhcnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0E4QkMsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLG1CQUFtQixvQ0FBb0M7QUFDOUQsT0FBT0MscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQyxzQkFBbUQsdUNBQXVDO0FBR2pHLE9BQU9DLGVBQWUscUNBQXFDO0FBQzNELFNBQTRCQyxzQkFBc0IsRUFBRUMsYUFBYSxFQUFFQyxhQUFhLEVBQWdCQyxPQUFPLFFBQVEsZ0JBQWdCO0FBb0RoSCxJQUFBLEFBQU1DLFNBQU4sTUFBTUEsZUFBZU47SUF1R2xDOzs7OztHQUtDLEdBQ0QsQUFBT08sUUFBU0MsS0FBMkIsRUFBRUMsVUFBbUIsRUFBUztRQUV2RSw2RUFBNkU7UUFDN0UsSUFBSSxDQUFDQyxXQUFXLEdBQUc7UUFFbkIsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxHQUFHO1FBRS9CLCtCQUErQjtRQUMvQixJQUFJLENBQUNDLEtBQUssQ0FBRUw7UUFFWixJQUFLQyxZQUFhO1lBQ2hCLElBQUksQ0FBQ0ssSUFBSSxDQUFFTjtRQUNiO0lBQ0Y7SUFFQTs7O0dBR0MsR0FDRCxBQUFPTyxVQUFXUCxLQUEyQixFQUFFRSxXQUFvQixFQUFFRCxVQUFtQixFQUFTO1FBQy9GLElBQUksQ0FBQ0MsV0FBVyxHQUFHQTtRQUVuQixJQUFJLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLEdBQUc7UUFFL0IsSUFBSSxDQUFDSSxPQUFPLENBQUVSO1FBRWQsSUFBS0MsWUFBYTtZQUNoQixJQUFJLENBQUNLLElBQUksQ0FBRU47UUFDYjtJQUNGO0lBRUE7OztHQUdDLEdBQ0QsQUFBT1MsWUFBa0I7UUFDdkIsSUFBSyxJQUFJLENBQUNOLGlCQUFpQixDQUFDQyxLQUFLLEVBQUc7WUFDbENULGNBQWNlLGVBQWUsQ0FBRSxJQUFJO1FBQ3JDO0lBQ0Y7SUFFZ0JDLFVBQWdCO1FBQzlCLElBQUksQ0FBQ1IsaUJBQWlCLENBQUNRLE9BQU87UUFDOUIsSUFBSSxDQUFDQyxZQUFZLENBQUNELE9BQU87UUFDekIsSUFBSSxDQUFDRSxxQkFBcUIsQ0FBQ0YsT0FBTztRQUVsQyxLQUFLLENBQUNBO0lBQ1I7SUF6SEEsWUFDRUcsZUFBOEIsQ0FDOUI7UUFFQUMsVUFBVUEsT0FBUUQsZ0JBQWdCRSxnQkFBZ0IsS0FBSyxZQUFjRixnQkFBZ0JHLHFCQUFxQixLQUFLQyxhQUFhSixnQkFBZ0JLLHdCQUF3QixLQUFLRCxXQUN2SztRQUVGLE1BQU1FLFVBQVUzQixZQUFrRTtZQUNoRmEsTUFBTWUsRUFBRUMsSUFBSTtZQUNaakIsT0FBT2dCLEVBQUVDLElBQUk7WUFDYmQsU0FBU2EsRUFBRUMsSUFBSTtZQUNmQyxZQUFZO1lBQ1pDLFlBQVk7WUFDWlIsa0JBQWtCO1lBQ2xCQyx1QkFBdUI7WUFDdkJFLDBCQUEwQjtZQUMxQk0sY0FBYztZQUNkQyxVQUFVO1FBQ1osR0FBR1o7UUFFSCxLQUFLLENBQUVNLFVBcENULGtFQUFrRTtRQUNsRSxxREFBcUQ7UUFDckQsRUFBRTtRQUNGLHdCQUF3QjtRQUN4QixrRUFBa0U7UUFDbEUsNkdBQTZHO2FBQzdGakIsb0JBQXdDLElBQUlkLGdCQUFpQixRQUU3RSw4QkFBOEI7UUFDOUIsc0hBQXNIO1FBQ3RILG1FQUFtRTthQUM1RGEsY0FBYztRQTJCbkIsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQ3lCLGlCQUFpQixHQUFHUCxRQUFRTyxpQkFBaUI7UUFDbEQsSUFBSSxDQUFDckIsSUFBSSxHQUFHYyxRQUFRZCxJQUFJO1FBQ3hCLElBQUksQ0FBQ0QsS0FBSyxHQUFHZSxRQUFRZixLQUFLO1FBQzFCLElBQUksQ0FBQ0csT0FBTyxHQUFHWSxRQUFRWixPQUFPO1FBQzlCLElBQUksQ0FBQ2UsVUFBVSxHQUFHSCxRQUFRRyxVQUFVO1FBQ3BDLElBQUksQ0FBQ0MsVUFBVSxHQUFHSixRQUFRSSxVQUFVO1FBQ3BDLElBQUksQ0FBQ1IsZ0JBQWdCLEdBQUdJLFFBQVFKLGdCQUFnQjtRQUNoRCxJQUFJLENBQUNTLFlBQVksR0FBR0wsUUFBUUssWUFBWTtRQUN4QyxJQUFJLENBQUNDLFFBQVEsR0FBR04sUUFBUU0sUUFBUTtRQUVoQyxJQUFJLENBQUNiLHFCQUFxQixHQUFHLElBQUl0QixnQkFBaUI7WUFBRSxJQUFJLENBQUNvQyxpQkFBaUI7U0FBRSxFQUFFLENBQUVDO1lBQzlFLE9BQU9oQyxjQUFjaUMsd0JBQXdCLENBQUVEO1FBQ2pEO1FBRUEsSUFBSSxDQUFDaEIsWUFBWSxHQUFHLElBQUlyQixnQkFBaUI7WUFBRSxJQUFJLENBQUNzQixxQkFBcUI7U0FBRSxFQUFFLENBQUVpQjtZQUN6RSxNQUFNQyxPQUFPVixFQUFFVyxJQUFJLENBQUU7Z0JBQUVGLGNBQWNHLEdBQUc7bUJBQUtILGNBQWNJLFlBQVk7YUFBRTtZQUV6RSxzRUFBc0U7WUFDdEUsS0FBTSxNQUFNRCxPQUFPRixLQUFPO2dCQUN4QmhCLFVBQVVBLE9BQVFyQixzQkFBc0IsQ0FBRXVDLElBQUssRUFBRSxDQUFDLGdGQUFnRixFQUFFQSxLQUFLO1lBQzNJO1lBRUEsT0FBT0Y7UUFDVDtRQUVBLDhEQUE4RDtRQUM5RCxJQUFLLElBQUksQ0FBQ1AsVUFBVSxJQUFJLElBQUksQ0FBQ1IsZ0JBQWdCLEtBQUssVUFBVztZQUMzRCxJQUFJLENBQUNtQixlQUFlLEdBQUcsSUFBSTdDLGNBQWU7Z0JBQ3hDOEMsVUFBVSxJQUFJLENBQUM5QixJQUFJLENBQUMrQixJQUFJLENBQUUsSUFBSSxFQUFFO2dCQUNoQ0MsT0FBT2xCLFFBQVFILHFCQUFxQjtnQkFDcENzQixVQUFVbkIsUUFBUUQsd0JBQXdCO1lBQzVDO1lBQ0EsSUFBSSxDQUFDcUIsY0FBYyxDQUFDQyxXQUFXLENBQUUsSUFBTSxJQUFJLENBQUNOLGVBQWUsQ0FBRXhCLE9BQU87WUFFcEUsSUFBSSxDQUFDUixpQkFBaUIsQ0FBQ3VDLElBQUksQ0FBRUMsQ0FBQUE7Z0JBQzNCLDZGQUE2RjtnQkFDN0YsSUFBSSxDQUFDUixlQUFlLENBQUVTLElBQUksQ0FBRTtnQkFFNUIsSUFBS0QsV0FBWTtvQkFDZixJQUFJLENBQUNSLGVBQWUsQ0FBRVUsS0FBSztnQkFDN0I7WUFDRjtRQUNGO0lBQ0Y7QUF3REY7QUE3SkEsU0FBcUIvQyxvQkE2SnBCO0FBQ0RELFFBQVFpRCxRQUFRLENBQUUsVUFBVWhEIn0=