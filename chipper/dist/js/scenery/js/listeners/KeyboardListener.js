// Copyright 2022-2024, University of Colorado Boulder
/**
 * A listener for general keyboard input. Specify the keys with a `keys` option in a readable format that looks like
 * this: [ 'shift+t', 'alt+shift+r' ]
 *
 * - Each entry in the array represents a combination of keys that must be pressed to fire a callback.
 * - '+' separates each key in a single combination.
 * - The keys leading up to the last key in the combination are considered "modifier" keys. The last key in the
 *   combination needs to be pressed while the modifier keys are down to fire the callback.
 * - The order modifier keys are pressed does not matter for firing the callback.
 *
 * In the above example "shift+t" OR "alt+shift+r" will fire the callback when pressed.
 *
 * An example usage would like this:
 *
 * this.addInputListener( new KeyboardListener( {
 *   keys: [ 'a+b', 'a+c', 'shift+arrowLeft', 'alt+g+t', 'ctrl+3', 'alt+ctrl+t' ],
 *   fire: ( event, keysPressed, listener ) => {
 *     if ( keysPressed === 'a+b' ) {
 *       console.log( 'you just pressed a+b!' );
 *     }
 *     else if ( keysPressed === 'a+c' ) {
 *       console.log( 'you just pressed a+c!' );
 *     }
 *     else if ( keysPressed === 'alt+g+t' ) {
 *       console.log( 'you just pressed alt+g+t' );
 *     }
 *     else if ( keysPressed === 'ctrl+3' ) {
 *       console.log( 'you just pressed ctrl+3' );
 *     }
 *     else if ( keysPressed === 'shift+arrowLeft' ) {
 *       console.log( 'you just pressed shift+arrowLeft' );
 *     }
 *   }
 * } ) );
 *
 * By default, the fire callback will fire when the last key is pressed down. See additional options for firing on key
 * release or other press and hold behavior.
 *
 * **Important Modifier Key Behavior**
 * Modifier keys prevent other key combinations from firing their behavior if they are pressed down.
 * For example, if you have a listener with 'shift+t' and 'y', pressing 'shift' will prevent 'y' from firing.
 * This behavior matches the behavior of the browser and is intended to prevent unexpected behavior. However,
 * this behavior is also true for custom (non-standard) modifier keys. For example, if you have a listener with
 * 'j+t' and 'y', pressing 'j' will prevent 'y' from firing. This is a PhET specific design decision, but it
 * is consistent with typical modifier key behavior.
 *
 * **Ignored Modifier Keys**
 * You can specify modifier keys that should be ignored while the hotkey is active. This allows you to override
 * default modifier key behavior. For example, if you have a listener for the 'y' key and you want it to
 * trigger even when the shift key is pressed, you would add 'shift' to the ignored modifier keys list.
 *
 * Ignored modifier keys are indicated in the key string using the '?' character. You can also choose to ignore
 * all other modifier keys by placing the '?' before the modifier key. Here are some examples:
 *
 * 'shift?+y' - fires when 'y' is pressed, even if 'shift' is down.
 * '?shift+y' - fires when 'y' and shift are pressed, but also allows 'ctrl', 'alt', or 'meta' to be down.
 *
 * **Global Keyboard Listeners**
 * A KeyboardListener can be added to a Node with addInputListener, and it will fire with normal scenery input dispatch
 * behavior when the Node has focus. However, a KeyboardListener can also be added "globally", meaning it will fire
 * regardless of where focus is in the document. Use KeyboardListener.createGlobal. This adds Hotkeys to the
 * globalHotkeyRegistry. Be sure to dispose of the KeyboardListener when it is no longer needed.
 *
 * **Potential Pitfall!**
 * The fire callback is only called if exactly the keys in a group are pressed. If you need to listen to a modifier key,
 * you must include it in the keys array. For example if you add a listener for 'tab', you must ALSO include
 * 'shift+tab' in the array to observe 'shift+tab' presses. If you provide 'tab' alone, the callback will not fire
 * if 'shift' is also pressed.
 *
 * Beware of "key ghosting". Some key combinations are not possible on certain keyboards. For example, some keyboards
 * cannot press all arrow keys at the same time. Be sure to test your key combinations on a variety of keyboards.
 * See https://github.com/phetsims/scenery/issues/1655.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnabledComponent from '../../../axon/js/EnabledComponent.js';
import Property from '../../../axon/js/Property.js';
import assertMutuallyExclusiveOptions from '../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../phet-core/js/optionize.js';
import { DisplayedTrailsProperty, EventContext, globalHotkeyRegistry, Hotkey, scenery, SceneryEvent, Trail } from '../imports.js';
let KeyboardListener = class KeyboardListener extends EnabledComponent {
    /**
   * Whether this listener is currently activated with a press.
   */ get isPressed() {
        return this.isPressedProperty.value;
    }
    /**
   * Fired when the enabledProperty changes
   */ onEnabledPropertyChange(enabled) {
        !enabled && this.interrupt();
    }
    /**
   * Dispose of this listener by disposing of any Callback timers. Then clear all KeyGroups.
   */ dispose() {
        this.hotkeys.forEach((hotkey)=>hotkey.dispose());
        this.isPressedProperty.dispose();
        this.pressedKeyStringPropertiesProperty.dispose();
        this.enabledProperty.unlink(this.enabledPropertyListener);
        super.dispose();
    }
    /**
   * Everything that uses a KeyboardListener should prevent more global scenery keyboard behavior, such as pan/zoom
   * from arrow keys.
   */ keydown(event) {
        event.pointer.reserveForKeyboardDrag();
    }
    /**
   * Public because this is called with the scenery listener API. Do not call this directly.
   */ focusout(event) {
        this.interrupt();
        // Optional work to do on blur.
        this._blur(this);
    }
    /**
   * Public because this is called through the scenery listener API. Do not call this directly.
   */ focusin(event) {
        // Optional work to do on focus.
        this._focus(this);
    }
    /**
   * Part of the scenery listener API. On cancel, clear active KeyGroups and stop their behavior.
   */ cancel() {
        this.handleInterrupt();
    }
    /**
   * Part of the scenery listener API. Clear active KeyGroups and stop their callbacks.
   */ interrupt() {
        this.handleInterrupt();
    }
    /**
   * Work to be done on both cancel and interrupt.
   */ handleInterrupt() {
        // interrupt all hotkeys (will do nothing if hotkeys are interrupted or not active)
        this.hotkeys.forEach((hotkey)=>hotkey.interrupt());
    }
    createSyntheticEvent(pointer) {
        const context = EventContext.createSynthetic();
        return new SceneryEvent(new Trail(), 'synthetic', pointer, context);
    }
    /**
   * Converts the provided keys for this listener into a collection of Hotkeys to easily track what keys are down.
   */ createHotkeys(keys, keyStringProperties) {
        assert && assert(keys || keyStringProperties, 'Must provide keys or keyDescriptorProperties');
        let usableKeyStringProperties;
        if (keyStringProperties) {
            usableKeyStringProperties = keyStringProperties;
        } else {
            // Convert provided keys into KeyDescriptors for the Hotkey.
            usableKeyStringProperties = keys.map((naturalKeys)=>{
                return new Property(naturalKeys);
            });
        }
        return usableKeyStringProperties.map((keyStringProperty)=>{
            const hotkey = new Hotkey({
                keyStringProperty: keyStringProperty,
                fire: (event)=>{
                    this._fire(event, keyStringProperty.value, this);
                },
                press: (event)=>{
                    this.interrupted = false;
                    const naturalKeys = keyStringProperty.value;
                    this._press(event, naturalKeys, this);
                    assert && assert(!this.pressedKeyStringPropertiesProperty.value.includes(keyStringProperty), 'Key already pressed');
                    this.pressedKeyStringPropertiesProperty.value = [
                        ...this.pressedKeyStringPropertiesProperty.value,
                        keyStringProperty
                    ];
                },
                release: (event)=>{
                    this.interrupted = hotkey.interrupted;
                    const naturalKeys = keyStringProperty.value;
                    this._release(event, naturalKeys, this);
                    assert && assert(this.pressedKeyStringPropertiesProperty.value.includes(keyStringProperty), 'Key not pressed');
                    this.pressedKeyStringPropertiesProperty.value = this.pressedKeyStringPropertiesProperty.value.filter((descriptor)=>descriptor !== keyStringProperty);
                },
                fireOnDown: this.fireOnDown,
                fireOnHold: this.fireOnHold,
                fireOnHoldTiming: this.fireOnHoldTiming,
                fireOnHoldCustomDelay: this.fireOnHoldTiming === 'custom' ? this.fireOnHoldCustomDelay : undefined,
                fireOnHoldCustomInterval: this.fireOnHoldTiming === 'custom' ? this.fireOnHoldCustomInterval : undefined,
                allowOverlap: this.allowOverlap,
                enabledProperty: this.enabledProperty,
                override: this.override
            });
            return hotkey;
        });
    }
    /**
   * Adds a global KeyboardListener to a target Node. This listener will fire regardless of where focus is in
   * the document. The listener is returned so that it can be disposed.
   */ static createGlobal(target, providedOptions) {
        return new GlobalKeyboardListener(target, providedOptions);
    }
    constructor(providedOptions){
        // You can either provide keys directly OR provide a list of KeyDescriptor Properties. You cannot provide both.
        assertMutuallyExclusiveOptions(providedOptions, [
            'keys'
        ], [
            'keyStringProperties'
        ]);
        const options = optionize()({
            keys: null,
            keyStringProperties: null,
            fire: _.noop,
            press: _.noop,
            release: _.noop,
            focus: _.noop,
            blur: _.noop,
            fireOnDown: true,
            fireOnHold: false,
            fireOnHoldTiming: 'browser',
            fireOnHoldCustomDelay: 400,
            fireOnHoldCustomInterval: 100,
            allowOverlap: false,
            override: true,
            // EnabledComponent
            // By default, do not instrument the enabledProperty; opt in with this option. See EnabledComponent
            phetioEnabledPropertyInstrumented: false
        }, providedOptions);
        super(options);
        this._fire = options.fire;
        this._press = options.press;
        this._release = options.release;
        this._focus = options.focus;
        this._blur = options.blur;
        this.fireOnDown = options.fireOnDown;
        this.fireOnHold = options.fireOnHold;
        this.fireOnHoldTiming = options.fireOnHoldTiming;
        this.fireOnHoldCustomDelay = options.fireOnHoldCustomDelay;
        this.fireOnHoldCustomInterval = options.fireOnHoldCustomInterval;
        this.allowOverlap = options.allowOverlap;
        this.override = options.override;
        // convert the provided keys to data that we can respond to with scenery's Input system
        this.hotkeys = this.createHotkeys(options.keys, options.keyStringProperties);
        this.isPressedProperty = DerivedProperty.or(this.hotkeys.map((hotkey)=>hotkey.isPressedProperty));
        this.pressedKeyStringPropertiesProperty = new Property([]);
        this.interrupted = false;
        this.enabledPropertyListener = this.onEnabledPropertyChange.bind(this);
        this.enabledProperty.lazyLink(this.enabledPropertyListener);
    }
};
/**
 * Inner class for a KeyboardListener that is global with a target Node. The listener will fire no matter where
 * focus is in the document, as long as the target Node can receive input events. Create this listener with
 * KeyboardListener.createGlobal.
 */ let GlobalKeyboardListener = class GlobalKeyboardListener extends KeyboardListener {
    /**
   * Dispose Properties and remove all Hotkeys from the global registry.
   */ dispose() {
        // Remove all global keys from the registry.
        this.hotkeys.forEach((hotkey)=>{
            globalHotkeyRegistry.remove(hotkey);
        });
        this.globallyEnabledProperty.dispose();
        this.displayedTrailsProperty.dispose();
        super.dispose();
    }
    constructor(target, providedOptions){
        const displayedTrailsProperty = new DisplayedTrailsProperty(target, {
            // For alt input events, use the PDOM trail to determine if the trail is displayed. This may be different
            // from the "visual" trail if the Node is placed in a PDOM order that is different from the visual order.
            followPDOMOrder: true,
            // Additionally, the target must have each of these true up its Trails to receive alt input events.
            requirePDOMVisible: true,
            requireEnabled: true,
            requireInputEnabled: true
        });
        const globallyEnabledProperty = new DerivedProperty([
            displayedTrailsProperty
        ], (trails)=>{
            return trails.length > 0;
        });
        const options = optionize()({
            // The enabledProperty is forwarded to the Hotkeys so that they are disabled when the target cannot receive input.
            enabledProperty: globallyEnabledProperty
        }, providedOptions);
        super(options);
        this.displayedTrailsProperty = displayedTrailsProperty;
        this.globallyEnabledProperty = globallyEnabledProperty;
        // Add all global keys to the registry
        this.hotkeys.forEach((hotkey)=>{
            globalHotkeyRegistry.add(hotkey);
        });
    }
};
scenery.register('KeyboardListener', KeyboardListener);
export default KeyboardListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0tleWJvYXJkTGlzdGVuZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBsaXN0ZW5lciBmb3IgZ2VuZXJhbCBrZXlib2FyZCBpbnB1dC4gU3BlY2lmeSB0aGUga2V5cyB3aXRoIGEgYGtleXNgIG9wdGlvbiBpbiBhIHJlYWRhYmxlIGZvcm1hdCB0aGF0IGxvb2tzIGxpa2VcbiAqIHRoaXM6IFsgJ3NoaWZ0K3QnLCAnYWx0K3NoaWZ0K3InIF1cbiAqXG4gKiAtIEVhY2ggZW50cnkgaW4gdGhlIGFycmF5IHJlcHJlc2VudHMgYSBjb21iaW5hdGlvbiBvZiBrZXlzIHRoYXQgbXVzdCBiZSBwcmVzc2VkIHRvIGZpcmUgYSBjYWxsYmFjay5cbiAqIC0gJysnIHNlcGFyYXRlcyBlYWNoIGtleSBpbiBhIHNpbmdsZSBjb21iaW5hdGlvbi5cbiAqIC0gVGhlIGtleXMgbGVhZGluZyB1cCB0byB0aGUgbGFzdCBrZXkgaW4gdGhlIGNvbWJpbmF0aW9uIGFyZSBjb25zaWRlcmVkIFwibW9kaWZpZXJcIiBrZXlzLiBUaGUgbGFzdCBrZXkgaW4gdGhlXG4gKiAgIGNvbWJpbmF0aW9uIG5lZWRzIHRvIGJlIHByZXNzZWQgd2hpbGUgdGhlIG1vZGlmaWVyIGtleXMgYXJlIGRvd24gdG8gZmlyZSB0aGUgY2FsbGJhY2suXG4gKiAtIFRoZSBvcmRlciBtb2RpZmllciBrZXlzIGFyZSBwcmVzc2VkIGRvZXMgbm90IG1hdHRlciBmb3IgZmlyaW5nIHRoZSBjYWxsYmFjay5cbiAqXG4gKiBJbiB0aGUgYWJvdmUgZXhhbXBsZSBcInNoaWZ0K3RcIiBPUiBcImFsdCtzaGlmdCtyXCIgd2lsbCBmaXJlIHRoZSBjYWxsYmFjayB3aGVuIHByZXNzZWQuXG4gKlxuICogQW4gZXhhbXBsZSB1c2FnZSB3b3VsZCBsaWtlIHRoaXM6XG4gKlxuICogdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xuICogICBrZXlzOiBbICdhK2InLCAnYStjJywgJ3NoaWZ0K2Fycm93TGVmdCcsICdhbHQrZyt0JywgJ2N0cmwrMycsICdhbHQrY3RybCt0JyBdLFxuICogICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCwgbGlzdGVuZXIgKSA9PiB7XG4gKiAgICAgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2ErYicgKSB7XG4gKiAgICAgICBjb25zb2xlLmxvZyggJ3lvdSBqdXN0IHByZXNzZWQgYStiIScgKTtcbiAqICAgICB9XG4gKiAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnYStjJyApIHtcbiAqICAgICAgIGNvbnNvbGUubG9nKCAneW91IGp1c3QgcHJlc3NlZCBhK2MhJyApO1xuICogICAgIH1cbiAqICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdhbHQrZyt0JyApIHtcbiAqICAgICAgIGNvbnNvbGUubG9nKCAneW91IGp1c3QgcHJlc3NlZCBhbHQrZyt0JyApO1xuICogICAgIH1cbiAqICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdjdHJsKzMnICkge1xuICogICAgICAgY29uc29sZS5sb2coICd5b3UganVzdCBwcmVzc2VkIGN0cmwrMycgKTtcbiAqICAgICB9XG4gKiAgICAgZWxzZSBpZiAoIGtleXNQcmVzc2VkID09PSAnc2hpZnQrYXJyb3dMZWZ0JyApIHtcbiAqICAgICAgIGNvbnNvbGUubG9nKCAneW91IGp1c3QgcHJlc3NlZCBzaGlmdCthcnJvd0xlZnQnICk7XG4gKiAgICAgfVxuICogICB9XG4gKiB9ICkgKTtcbiAqXG4gKiBCeSBkZWZhdWx0LCB0aGUgZmlyZSBjYWxsYmFjayB3aWxsIGZpcmUgd2hlbiB0aGUgbGFzdCBrZXkgaXMgcHJlc3NlZCBkb3duLiBTZWUgYWRkaXRpb25hbCBvcHRpb25zIGZvciBmaXJpbmcgb24ga2V5XG4gKiByZWxlYXNlIG9yIG90aGVyIHByZXNzIGFuZCBob2xkIGJlaGF2aW9yLlxuICpcbiAqICoqSW1wb3J0YW50IE1vZGlmaWVyIEtleSBCZWhhdmlvcioqXG4gKiBNb2RpZmllciBrZXlzIHByZXZlbnQgb3RoZXIga2V5IGNvbWJpbmF0aW9ucyBmcm9tIGZpcmluZyB0aGVpciBiZWhhdmlvciBpZiB0aGV5IGFyZSBwcmVzc2VkIGRvd24uXG4gKiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYSBsaXN0ZW5lciB3aXRoICdzaGlmdCt0JyBhbmQgJ3knLCBwcmVzc2luZyAnc2hpZnQnIHdpbGwgcHJldmVudCAneScgZnJvbSBmaXJpbmcuXG4gKiBUaGlzIGJlaGF2aW9yIG1hdGNoZXMgdGhlIGJlaGF2aW9yIG9mIHRoZSBicm93c2VyIGFuZCBpcyBpbnRlbmRlZCB0byBwcmV2ZW50IHVuZXhwZWN0ZWQgYmVoYXZpb3IuIEhvd2V2ZXIsXG4gKiB0aGlzIGJlaGF2aW9yIGlzIGFsc28gdHJ1ZSBmb3IgY3VzdG9tIChub24tc3RhbmRhcmQpIG1vZGlmaWVyIGtleXMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhIGxpc3RlbmVyIHdpdGhcbiAqICdqK3QnIGFuZCAneScsIHByZXNzaW5nICdqJyB3aWxsIHByZXZlbnQgJ3knIGZyb20gZmlyaW5nLiBUaGlzIGlzIGEgUGhFVCBzcGVjaWZpYyBkZXNpZ24gZGVjaXNpb24sIGJ1dCBpdFxuICogaXMgY29uc2lzdGVudCB3aXRoIHR5cGljYWwgbW9kaWZpZXIga2V5IGJlaGF2aW9yLlxuICpcbiAqICoqSWdub3JlZCBNb2RpZmllciBLZXlzKipcbiAqIFlvdSBjYW4gc3BlY2lmeSBtb2RpZmllciBrZXlzIHRoYXQgc2hvdWxkIGJlIGlnbm9yZWQgd2hpbGUgdGhlIGhvdGtleSBpcyBhY3RpdmUuIFRoaXMgYWxsb3dzIHlvdSB0byBvdmVycmlkZVxuICogZGVmYXVsdCBtb2RpZmllciBrZXkgYmVoYXZpb3IuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhIGxpc3RlbmVyIGZvciB0aGUgJ3knIGtleSBhbmQgeW91IHdhbnQgaXQgdG9cbiAqIHRyaWdnZXIgZXZlbiB3aGVuIHRoZSBzaGlmdCBrZXkgaXMgcHJlc3NlZCwgeW91IHdvdWxkIGFkZCAnc2hpZnQnIHRvIHRoZSBpZ25vcmVkIG1vZGlmaWVyIGtleXMgbGlzdC5cbiAqXG4gKiBJZ25vcmVkIG1vZGlmaWVyIGtleXMgYXJlIGluZGljYXRlZCBpbiB0aGUga2V5IHN0cmluZyB1c2luZyB0aGUgJz8nIGNoYXJhY3Rlci4gWW91IGNhbiBhbHNvIGNob29zZSB0byBpZ25vcmVcbiAqIGFsbCBvdGhlciBtb2RpZmllciBrZXlzIGJ5IHBsYWNpbmcgdGhlICc/JyBiZWZvcmUgdGhlIG1vZGlmaWVyIGtleS4gSGVyZSBhcmUgc29tZSBleGFtcGxlczpcbiAqXG4gKiAnc2hpZnQ/K3knIC0gZmlyZXMgd2hlbiAneScgaXMgcHJlc3NlZCwgZXZlbiBpZiAnc2hpZnQnIGlzIGRvd24uXG4gKiAnP3NoaWZ0K3knIC0gZmlyZXMgd2hlbiAneScgYW5kIHNoaWZ0IGFyZSBwcmVzc2VkLCBidXQgYWxzbyBhbGxvd3MgJ2N0cmwnLCAnYWx0Jywgb3IgJ21ldGEnIHRvIGJlIGRvd24uXG4gKlxuICogKipHbG9iYWwgS2V5Ym9hcmQgTGlzdGVuZXJzKipcbiAqIEEgS2V5Ym9hcmRMaXN0ZW5lciBjYW4gYmUgYWRkZWQgdG8gYSBOb2RlIHdpdGggYWRkSW5wdXRMaXN0ZW5lciwgYW5kIGl0IHdpbGwgZmlyZSB3aXRoIG5vcm1hbCBzY2VuZXJ5IGlucHV0IGRpc3BhdGNoXG4gKiBiZWhhdmlvciB3aGVuIHRoZSBOb2RlIGhhcyBmb2N1cy4gSG93ZXZlciwgYSBLZXlib2FyZExpc3RlbmVyIGNhbiBhbHNvIGJlIGFkZGVkIFwiZ2xvYmFsbHlcIiwgbWVhbmluZyBpdCB3aWxsIGZpcmVcbiAqIHJlZ2FyZGxlc3Mgb2Ygd2hlcmUgZm9jdXMgaXMgaW4gdGhlIGRvY3VtZW50LiBVc2UgS2V5Ym9hcmRMaXN0ZW5lci5jcmVhdGVHbG9iYWwuIFRoaXMgYWRkcyBIb3RrZXlzIHRvIHRoZVxuICogZ2xvYmFsSG90a2V5UmVnaXN0cnkuIEJlIHN1cmUgdG8gZGlzcG9zZSBvZiB0aGUgS2V5Ym9hcmRMaXN0ZW5lciB3aGVuIGl0IGlzIG5vIGxvbmdlciBuZWVkZWQuXG4gKlxuICogKipQb3RlbnRpYWwgUGl0ZmFsbCEqKlxuICogVGhlIGZpcmUgY2FsbGJhY2sgaXMgb25seSBjYWxsZWQgaWYgZXhhY3RseSB0aGUga2V5cyBpbiBhIGdyb3VwIGFyZSBwcmVzc2VkLiBJZiB5b3UgbmVlZCB0byBsaXN0ZW4gdG8gYSBtb2RpZmllciBrZXksXG4gKiB5b3UgbXVzdCBpbmNsdWRlIGl0IGluIHRoZSBrZXlzIGFycmF5LiBGb3IgZXhhbXBsZSBpZiB5b3UgYWRkIGEgbGlzdGVuZXIgZm9yICd0YWInLCB5b3UgbXVzdCBBTFNPIGluY2x1ZGVcbiAqICdzaGlmdCt0YWInIGluIHRoZSBhcnJheSB0byBvYnNlcnZlICdzaGlmdCt0YWInIHByZXNzZXMuIElmIHlvdSBwcm92aWRlICd0YWInIGFsb25lLCB0aGUgY2FsbGJhY2sgd2lsbCBub3QgZmlyZVxuICogaWYgJ3NoaWZ0JyBpcyBhbHNvIHByZXNzZWQuXG4gKlxuICogQmV3YXJlIG9mIFwia2V5IGdob3N0aW5nXCIuIFNvbWUga2V5IGNvbWJpbmF0aW9ucyBhcmUgbm90IHBvc3NpYmxlIG9uIGNlcnRhaW4ga2V5Ym9hcmRzLiBGb3IgZXhhbXBsZSwgc29tZSBrZXlib2FyZHNcbiAqIGNhbm5vdCBwcmVzcyBhbGwgYXJyb3cga2V5cyBhdCB0aGUgc2FtZSB0aW1lLiBCZSBzdXJlIHRvIHRlc3QgeW91ciBrZXkgY29tYmluYXRpb25zIG9uIGEgdmFyaWV0eSBvZiBrZXlib2FyZHMuXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE2NTUuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRW5hYmxlZENvbXBvbmVudCwgeyBFbmFibGVkQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW5hYmxlZENvbXBvbmVudC5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2Fzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IERpc3BsYXllZFRyYWlsc1Byb3BlcnR5LCBFdmVudENvbnRleHQsIGdsb2JhbEhvdGtleVJlZ2lzdHJ5LCBIb3RrZXksIEhvdGtleUZpcmVPbkhvbGRUaW1pbmcsIE5vZGUsIE9uZUtleVN0cm9rZSwgUERPTVBvaW50ZXIsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgS2V5Ym9hcmRMaXN0ZW5lclNlbGZPcHRpb25zPEtleXMgZXh0ZW5kcyByZWFkb25seSBPbmVLZXlTdHJva2VbIF0+ID0ge1xuXG4gIC8vIFRoZSBrZXlzIHRoYXQgbmVlZCB0byBiZSBwcmVzc2VkIHRvIGZpcmUgdGhlIGNhbGxiYWNrLiBJbiBhIGZvcm0gbGlrZSBgWyAnc2hpZnQrdCcsICdhbHQrc2hpZnQrcicgXWAuIFNlZSB0b3BcbiAgLy8gbGV2ZWwgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBhbmQgYW4gZXhhbXBsZSBvZiBwcm92aWRpbmcga2V5cy5cbiAga2V5cz86IEtleXMgfCBudWxsO1xuXG4gIC8vIEEgbGlzdCBvZiBLZXlEZXNjcmlwdG9yIFByb3BlcnRpZXMgdGhhdCBkZXNjcmliZSB0aGUga2V5cyB0aGF0IG5lZWQgdG8gYmUgcHJlc3NlZCB0byBmaXJlIHRoZSBjYWxsYmFjay5cbiAgLy8gVGhpcyBpcyBhbiBhbHRlcm5hdGl2ZSB0byBwcm92aWRpbmcga2V5cyBkaXJlY3RseS4gWW91IGNhbm5vdCBwcm92aWRlIGJvdGgga2V5cyBhbmQga2V5RGVzY3JpcHRvclByb3BlcnRpZXMuXG4gIC8vIFRoaXMgaXMgdXNlZnVsIGZvciBkeW5hbWljIGJlaGF2aW9yLCBzdWNoIGFzIGkxOG4gb3IgbWFwcGluZyB0byBhIGRpZmZlcmVudCBzZXQgb2Yga2V5cy5cbiAga2V5U3RyaW5nUHJvcGVydGllcz86IFRSZWFkT25seVByb3BlcnR5PE9uZUtleVN0cm9rZT5bXSB8IG51bGw7XG5cbiAgLy8gQ2FsbGVkIHdoZW4gdGhlIGxpc3RlbmVyIGRldGVjdHMgdGhhdCB0aGUgc2V0IG9mIGtleXMgYXJlIHByZXNzZWQuXG4gIGZpcmU/OiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCwga2V5c1ByZXNzZWQ6IEtleXNbbnVtYmVyXSwgbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xuXG4gIC8vIENhbGxlZCB3aGVuIHRoZSBsaXN0ZW5lciBkZXRlY3RzIHRoYXQgdGhlIHNldCBvZiBrZXlzIGFyZSBwcmVzc2VkLiBQcmVzcyBpcyBhbHdheXMgY2FsbGVkIG9uIHRoZSBmaXJzdCBwcmVzcyBvZlxuICAvLyBrZXlzLCBidXQgZG9lcyBub3QgY29udGludWUgd2l0aCBmaXJlLW9uLWhvbGQgYmVoYXZpb3IuIFdpbGwgYmUgY2FsbGVkIGJlZm9yZSBmaXJlIGlmIGZpcmVPbkRvd24gaXMgdHJ1ZS5cbiAgcHJlc3M/OiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCwga2V5c1ByZXNzZWQ6IEtleXNbbnVtYmVyXSwgbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xuXG4gIC8vIENhbGxlZCB3aGVuIHRoZSBsaXN0ZW5lciBkZXRlY3RzIHRoYXQgdGhlIHNldCBvZiBrZXlzIGhhdmUgYmVlbiByZWxlYXNlZC4ga2V5c1ByZXNzZWQgbWF5IGJlIG51bGxcbiAgLy8gaW4gY2FzZXMgb2YgaW50ZXJydXB0aW9uLlxuICByZWxlYXNlPzogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIGtleXNQcmVzc2VkOiBLZXlzW251bWJlcl0gfCBudWxsLCBsaXN0ZW5lcjogS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzPiApID0+IHZvaWQ7XG5cbiAgLy8gQ2FsbGVkIHdoZW4gdGhlIGxpc3RlbmVyIHRhcmdldCByZWNlaXZlcyBmb2N1cy5cbiAgZm9jdXM/OiAoIGxpc3RlbmVyOiBLZXlib2FyZExpc3RlbmVyPEtleXM+ICkgPT4gdm9pZDtcblxuICAvLyBDYWxsZWQgd2hlbiB0aGUgbGlzdGVuZXIgdGFyZ2V0IGxvc2VzIGZvY3VzLlxuICBibHVyPzogKCBsaXN0ZW5lcjogS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzPiApID0+IHZvaWQ7XG5cbiAgLy8gSWYgdHJ1ZSwgdGhlIGhvdGtleSB3aWxsIGZpcmUgd2hlbiB0aGUgaG90a2V5IGlzIGluaXRpYWxseSBwcmVzc2VkLlxuICAvLyBJZiBmYWxzZSwgdGhlIGhvdGtleSB3aWxsIGZpcmUgd2hlbiB0aGUgaG90a2V5IGlzIGZpbmFsbHkgcmVsZWFzZWQuXG4gIGZpcmVPbkRvd24/OiBib29sZWFuO1xuXG4gIC8vIFdoZXRoZXIgdGhlIGZpcmUtb24taG9sZCBmZWF0dXJlIGlzIGVuYWJsZWRcbiAgZmlyZU9uSG9sZD86IGJvb2xlYW47XG5cbiAgLy8gV2hldGhlciB3ZSBzaG91bGQgbGlzdGVuIHRvIHRoZSBicm93c2VyJ3MgZmlyZS1vbi1ob2xkIHRpbWluZywgb3IgdXNlIG91ciBvd24uXG4gIGZpcmVPbkhvbGRUaW1pbmc/OiBIb3RrZXlGaXJlT25Ib2xkVGltaW5nO1xuXG4gIC8vIFN0YXJ0IHRvIGZpcmUgY29udGludW91c2x5IGFmdGVyIHByZXNzaW5nIGZvciB0aGlzIGxvbmcgKG1pbGxpc2Vjb25kcylcbiAgZmlyZU9uSG9sZEN1c3RvbURlbGF5PzogbnVtYmVyO1xuXG4gIC8vIEZpcmUgY29udGludW91c2x5IGF0IHRoaXMgaW50ZXJ2YWwgKG1pbGxpc2Vjb25kcylcbiAgZmlyZU9uSG9sZEN1c3RvbUludGVydmFsPzogbnVtYmVyO1xuXG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgdGhlIGtleXMgdXNlZCBieSB0aGlzIEtleWJvYXJkTGlzdGVuZXIgYXJlIGFsbG93ZWQgdG8gb3ZlcmxhcCB3aXRoIG90aGVyIEtleWJvYXJkTGlzdGVuZXJzXG4gIC8vIHRoYXQgYXJlIGxpc3RlbmluZyBmb3IgdGhlIHNhbWUga2V5cy4gSWYgdHJ1ZSwgdGhlIEtleWJvYXJkTGlzdGVuZXIgd2lsbCBmaXJlIGV2ZW4gaWYgYW5vdGhlciBLZXlib2FyZExpc3RlbmVyLlxuICAvLyBUaGlzIGlzIGltcGxlbWVudGVkIHdpdGggSG90a2V5LCBzZWUgSG90a2V5LnRzIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICBhbGxvd092ZXJsYXA/OiBib29sZWFuO1xuXG4gIC8vIElmIHRydWUsIEtleWJvYXJkIGxpc3RlbmVycyB3aXRoIG92ZXJsYXBwaW5nIGtleXMgKGVpdGhlciBhZGRlZCB0byBhbiBhbmNlc3RvcidzIGlucHV0TGlzdGVuZXIgb3IgbGF0ZXIgaW4gdGhlXG4gIC8vIGxvY2FsL2dsb2JhbCBvcmRlcikgd2lsbCBiZSBpZ25vcmVkLiBPbmx5IHRoZSBtb3N0ICdsb2NhbCcgSG90a2V5IHdpbGwgZmlyZS4gVGhlIGRlZmF1bHQgaXMgdHJ1ZSBmb3JcbiAgLy8gS2V5Ym9hcmRMaXN0ZW5lcnMgYWRkZWQgdG8gZm9jdXNhYmxlIE5vZGVzLCBhbmQgZmFsc2UgZm9yIGdsb2JhbCBLZXlib2FyZExpc3RlbmVycyB0byBjYXRjaCBvdmVybGFwcGluZyBnbG9iYWxcbiAgLy8ga2V5cy5cbiAgb3ZlcnJpZGU/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgS2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8S2V5cyBleHRlbmRzIHJlYWRvbmx5IE9uZUtleVN0cm9rZVtdPiA9IEtleWJvYXJkTGlzdGVuZXJTZWxmT3B0aW9uczxLZXlzPiAmIEVuYWJsZWRDb21wb25lbnRPcHRpb25zO1xuXG5jbGFzcyBLZXlib2FyZExpc3RlbmVyPEtleXMgZXh0ZW5kcyByZWFkb25seSBPbmVLZXlTdHJva2VbXT4gZXh0ZW5kcyBFbmFibGVkQ29tcG9uZW50IGltcGxlbWVudHMgVElucHV0TGlzdGVuZXIge1xuXG4gIC8vIGZyb20gb3B0aW9uc1xuICBwcml2YXRlIHJlYWRvbmx5IF9maXJlOiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCwga2V5c1ByZXNzZWQ6IEtleXNbbnVtYmVyXSwgbGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8S2V5cz4gKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IF9wcmVzczogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIGtleXNQcmVzc2VkOiBLZXlzW251bWJlcl0sIGxpc3RlbmVyOiBLZXlib2FyZExpc3RlbmVyPEtleXM+ICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBfcmVsZWFzZTogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIGtleXNQcmVzc2VkOiBLZXlzW251bWJlcl0gfCBudWxsLCBsaXN0ZW5lcjogS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzPiApID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2ZvY3VzOiAoIGxpc3RlbmVyOiBLZXlib2FyZExpc3RlbmVyPEtleXM+ICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBfYmx1cjogKCBsaXN0ZW5lcjogS2V5Ym9hcmRMaXN0ZW5lcjxLZXlzPiApID0+IHZvaWQ7XG4gIHB1YmxpYyByZWFkb25seSBmaXJlT25Eb3duOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgZmlyZU9uSG9sZDogYm9vbGVhbjtcbiAgcHVibGljIHJlYWRvbmx5IGZpcmVPbkhvbGRUaW1pbmc6IEhvdGtleUZpcmVPbkhvbGRUaW1pbmc7XG4gIHB1YmxpYyByZWFkb25seSBmaXJlT25Ib2xkQ3VzdG9tRGVsYXk6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGZpcmVPbkhvbGRDdXN0b21JbnRlcnZhbDogbnVtYmVyO1xuICBwdWJsaWMgcmVhZG9ubHkgYWxsb3dPdmVybGFwOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IG92ZXJyaWRlOiBib29sZWFuO1xuXG4gIHB1YmxpYyByZWFkb25seSBob3RrZXlzOiBIb3RrZXlbXTtcblxuICAvLyBBIFByb3BlcnR5IHRoYXQgaXMgdHJ1ZSB3aGVuIGFueSBvZiB0aGUga2V5c1xuICBwdWJsaWMgcmVhZG9ubHkgaXNQcmVzc2VkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIEEgUHJvcGVydHkgdGhhdCBjb250YWlucyBhbGwgdGhlIFByb3BlcnR5PEtleURlc2NyaXB0b3I+IHRoYXQgYXJlIGN1cnJlbnRseSBwcmVzc2VkIGRvd24uXG4gIHB1YmxpYyByZWFkb25seSBwcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllc1Byb3BlcnR5OiBUUHJvcGVydHk8VFJlYWRPbmx5UHJvcGVydHk8T25lS2V5U3Ryb2tlPltdPjtcblxuICAvLyAocmVhZC1vbmx5KSAtIFdoZXRoZXIgdGhlIGxhc3Qga2V5IHByZXNzIHdhcyBpbnRlcnJ1cHRlZC4gV2lsbCBiZSB2YWxpZCB1bnRpbCB0aGUgbmV4dCBwcmVzc3MuXG4gIHB1YmxpYyBpbnRlcnJ1cHRlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSBlbmFibGVkUHJvcGVydHlMaXN0ZW5lcjogKCBlbmFibGVkOiBib29sZWFuICkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogS2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8S2V5cz4gKSB7XG5cbiAgICAvLyBZb3UgY2FuIGVpdGhlciBwcm92aWRlIGtleXMgZGlyZWN0bHkgT1IgcHJvdmlkZSBhIGxpc3Qgb2YgS2V5RGVzY3JpcHRvciBQcm9wZXJ0aWVzLiBZb3UgY2Fubm90IHByb3ZpZGUgYm90aC5cbiAgICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHByb3ZpZGVkT3B0aW9ucywgWyAna2V5cycgXSwgWyAna2V5U3RyaW5nUHJvcGVydGllcycgXSApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxLZXlib2FyZExpc3RlbmVyT3B0aW9uczxLZXlzPiwgS2V5Ym9hcmRMaXN0ZW5lclNlbGZPcHRpb25zPEtleXM+LCBFbmFibGVkQ29tcG9uZW50T3B0aW9ucz4oKSgge1xuICAgICAga2V5czogbnVsbCxcbiAgICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IG51bGwsXG4gICAgICBmaXJlOiBfLm5vb3AsXG4gICAgICBwcmVzczogXy5ub29wLFxuICAgICAgcmVsZWFzZTogXy5ub29wLFxuICAgICAgZm9jdXM6IF8ubm9vcCxcbiAgICAgIGJsdXI6IF8ubm9vcCxcbiAgICAgIGZpcmVPbkRvd246IHRydWUsXG4gICAgICBmaXJlT25Ib2xkOiBmYWxzZSxcbiAgICAgIGZpcmVPbkhvbGRUaW1pbmc6ICdicm93c2VyJyxcbiAgICAgIGZpcmVPbkhvbGRDdXN0b21EZWxheTogNDAwLFxuICAgICAgZmlyZU9uSG9sZEN1c3RvbUludGVydmFsOiAxMDAsXG4gICAgICBhbGxvd092ZXJsYXA6IGZhbHNlLFxuICAgICAgb3ZlcnJpZGU6IHRydWUsXG5cbiAgICAgIC8vIEVuYWJsZWRDb21wb25lbnRcbiAgICAgIC8vIEJ5IGRlZmF1bHQsIGRvIG5vdCBpbnN0cnVtZW50IHRoZSBlbmFibGVkUHJvcGVydHk7IG9wdCBpbiB3aXRoIHRoaXMgb3B0aW9uLiBTZWUgRW5hYmxlZENvbXBvbmVudFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuX2ZpcmUgPSBvcHRpb25zLmZpcmU7XG4gICAgdGhpcy5fcHJlc3MgPSBvcHRpb25zLnByZXNzO1xuICAgIHRoaXMuX3JlbGVhc2UgPSBvcHRpb25zLnJlbGVhc2U7XG4gICAgdGhpcy5fZm9jdXMgPSBvcHRpb25zLmZvY3VzO1xuICAgIHRoaXMuX2JsdXIgPSBvcHRpb25zLmJsdXI7XG4gICAgdGhpcy5maXJlT25Eb3duID0gb3B0aW9ucy5maXJlT25Eb3duO1xuICAgIHRoaXMuZmlyZU9uSG9sZCA9IG9wdGlvbnMuZmlyZU9uSG9sZDtcbiAgICB0aGlzLmZpcmVPbkhvbGRUaW1pbmcgPSBvcHRpb25zLmZpcmVPbkhvbGRUaW1pbmc7XG4gICAgdGhpcy5maXJlT25Ib2xkQ3VzdG9tRGVsYXkgPSBvcHRpb25zLmZpcmVPbkhvbGRDdXN0b21EZWxheTtcbiAgICB0aGlzLmZpcmVPbkhvbGRDdXN0b21JbnRlcnZhbCA9IG9wdGlvbnMuZmlyZU9uSG9sZEN1c3RvbUludGVydmFsO1xuICAgIHRoaXMuYWxsb3dPdmVybGFwID0gb3B0aW9ucy5hbGxvd092ZXJsYXA7XG4gICAgdGhpcy5vdmVycmlkZSA9IG9wdGlvbnMub3ZlcnJpZGU7XG5cbiAgICAvLyBjb252ZXJ0IHRoZSBwcm92aWRlZCBrZXlzIHRvIGRhdGEgdGhhdCB3ZSBjYW4gcmVzcG9uZCB0byB3aXRoIHNjZW5lcnkncyBJbnB1dCBzeXN0ZW1cbiAgICB0aGlzLmhvdGtleXMgPSB0aGlzLmNyZWF0ZUhvdGtleXMoIG9wdGlvbnMua2V5cywgb3B0aW9ucy5rZXlTdHJpbmdQcm9wZXJ0aWVzICk7XG5cbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5Lm9yKCB0aGlzLmhvdGtleXMubWFwKCBob3RrZXkgPT4gaG90a2V5LmlzUHJlc3NlZFByb3BlcnR5ICkgKTtcbiAgICB0aGlzLnByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFtdICk7XG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHlMaXN0ZW5lciA9IHRoaXMub25FbmFibGVkUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmVuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyICk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGxpc3RlbmVyIGlzIGN1cnJlbnRseSBhY3RpdmF0ZWQgd2l0aCBhIHByZXNzLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1ByZXNzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNQcmVzc2VkUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogRmlyZWQgd2hlbiB0aGUgZW5hYmxlZFByb3BlcnR5IGNoYW5nZXNcbiAgICovXG4gIHByaXZhdGUgb25FbmFibGVkUHJvcGVydHlDaGFuZ2UoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgIWVuYWJsZWQgJiYgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHRoaXMgbGlzdGVuZXIgYnkgZGlzcG9zaW5nIG9mIGFueSBDYWxsYmFjayB0aW1lcnMuIFRoZW4gY2xlYXIgYWxsIEtleUdyb3Vwcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgICggdGhpcyBhcyB1bmtub3duIGFzIFRJbnB1dExpc3RlbmVyICkuaG90a2V5cyEuZm9yRWFjaCggaG90a2V5ID0+IGhvdGtleS5kaXNwb3NlKCkgKTtcbiAgICB0aGlzLmlzUHJlc3NlZFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLnByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkudW5saW5rKCB0aGlzLmVuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyICk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogRXZlcnl0aGluZyB0aGF0IHVzZXMgYSBLZXlib2FyZExpc3RlbmVyIHNob3VsZCBwcmV2ZW50IG1vcmUgZ2xvYmFsIHNjZW5lcnkga2V5Ym9hcmQgYmVoYXZpb3IsIHN1Y2ggYXMgcGFuL3pvb21cbiAgICogZnJvbSBhcnJvdyBrZXlzLlxuICAgKi9cbiAgcHVibGljIGtleWRvd24oIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4gKTogdm9pZCB7XG4gICAgZXZlbnQucG9pbnRlci5yZXNlcnZlRm9yS2V5Ym9hcmREcmFnKCk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIGJlY2F1c2UgdGhpcyBpcyBjYWxsZWQgd2l0aCB0aGUgc2NlbmVyeSBsaXN0ZW5lciBBUEkuIERvIG5vdCBjYWxsIHRoaXMgZGlyZWN0bHkuXG4gICAqL1xuICBwdWJsaWMgZm9jdXNvdXQoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcblxuICAgIC8vIE9wdGlvbmFsIHdvcmsgdG8gZG8gb24gYmx1ci5cbiAgICB0aGlzLl9ibHVyKCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIGJlY2F1c2UgdGhpcyBpcyBjYWxsZWQgdGhyb3VnaCB0aGUgc2NlbmVyeSBsaXN0ZW5lciBBUEkuIERvIG5vdCBjYWxsIHRoaXMgZGlyZWN0bHkuXG4gICAqL1xuICBwdWJsaWMgZm9jdXNpbiggZXZlbnQ6IFNjZW5lcnlFdmVudCApOiB2b2lkIHtcblxuICAgIC8vIE9wdGlvbmFsIHdvcmsgdG8gZG8gb24gZm9jdXMuXG4gICAgdGhpcy5fZm9jdXMoIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJ0IG9mIHRoZSBzY2VuZXJ5IGxpc3RlbmVyIEFQSS4gT24gY2FuY2VsLCBjbGVhciBhY3RpdmUgS2V5R3JvdXBzIGFuZCBzdG9wIHRoZWlyIGJlaGF2aW9yLlxuICAgKi9cbiAgcHVibGljIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLmhhbmRsZUludGVycnVwdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnQgb2YgdGhlIHNjZW5lcnkgbGlzdGVuZXIgQVBJLiBDbGVhciBhY3RpdmUgS2V5R3JvdXBzIGFuZCBzdG9wIHRoZWlyIGNhbGxiYWNrcy5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgdGhpcy5oYW5kbGVJbnRlcnJ1cHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXb3JrIHRvIGJlIGRvbmUgb24gYm90aCBjYW5jZWwgYW5kIGludGVycnVwdC5cbiAgICovXG4gIHByaXZhdGUgaGFuZGxlSW50ZXJydXB0KCk6IHZvaWQge1xuXG4gICAgLy8gaW50ZXJydXB0IGFsbCBob3RrZXlzICh3aWxsIGRvIG5vdGhpbmcgaWYgaG90a2V5cyBhcmUgaW50ZXJydXB0ZWQgb3Igbm90IGFjdGl2ZSlcbiAgICB0aGlzLmhvdGtleXMuZm9yRWFjaCggaG90a2V5ID0+IGhvdGtleS5pbnRlcnJ1cHQoKSApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVN5bnRoZXRpY0V2ZW50KCBwb2ludGVyOiBQRE9NUG9pbnRlciApOiBTY2VuZXJ5RXZlbnQ8S2V5Ym9hcmRFdmVudD4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSBFdmVudENvbnRleHQuY3JlYXRlU3ludGhldGljKCk7XG4gICAgcmV0dXJuIG5ldyBTY2VuZXJ5RXZlbnQoIG5ldyBUcmFpbCgpLCAnc3ludGhldGljJywgcG9pbnRlciwgY29udGV4dCBhcyBFdmVudENvbnRleHQ8S2V5Ym9hcmRFdmVudD4gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgcHJvdmlkZWQga2V5cyBmb3IgdGhpcyBsaXN0ZW5lciBpbnRvIGEgY29sbGVjdGlvbiBvZiBIb3RrZXlzIHRvIGVhc2lseSB0cmFjayB3aGF0IGtleXMgYXJlIGRvd24uXG4gICAqL1xuICBwcml2YXRlIGNyZWF0ZUhvdGtleXMoIGtleXM6IEtleXMgfCBudWxsLCBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxPbmVLZXlTdHJva2U+W10gfCBudWxsICk6IEhvdGtleVtdIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXlzIHx8IGtleVN0cmluZ1Byb3BlcnRpZXMsICdNdXN0IHByb3ZpZGUga2V5cyBvciBrZXlEZXNjcmlwdG9yUHJvcGVydGllcycgKTtcblxuICAgIGxldCB1c2FibGVLZXlTdHJpbmdQcm9wZXJ0aWVzOiBUUmVhZE9ubHlQcm9wZXJ0eTxPbmVLZXlTdHJva2U+W107XG4gICAgaWYgKCBrZXlTdHJpbmdQcm9wZXJ0aWVzICkge1xuICAgICAgdXNhYmxlS2V5U3RyaW5nUHJvcGVydGllcyA9IGtleVN0cmluZ1Byb3BlcnRpZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBDb252ZXJ0IHByb3ZpZGVkIGtleXMgaW50byBLZXlEZXNjcmlwdG9ycyBmb3IgdGhlIEhvdGtleS5cbiAgICAgIHVzYWJsZUtleVN0cmluZ1Byb3BlcnRpZXMgPSBrZXlzIS5tYXAoIG5hdHVyYWxLZXlzID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eSggbmF0dXJhbEtleXMgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXNhYmxlS2V5U3RyaW5nUHJvcGVydGllcy5tYXAoIGtleVN0cmluZ1Byb3BlcnR5ID0+IHtcbiAgICAgIGNvbnN0IGhvdGtleSA9IG5ldyBIb3RrZXkoIHtcbiAgICAgICAga2V5U3RyaW5nUHJvcGVydHk6IGtleVN0cmluZ1Byb3BlcnR5LFxuICAgICAgICBmaXJlOiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCApID0+IHtcbiAgICAgICAgICB0aGlzLl9maXJlKCBldmVudCwga2V5U3RyaW5nUHJvcGVydHkudmFsdWUgYXMgS2V5c1tudW1iZXJdLCB0aGlzICk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZXNzOiAoIGV2ZW50OiBLZXlib2FyZEV2ZW50IHwgbnVsbCApID0+IHtcbiAgICAgICAgICB0aGlzLmludGVycnVwdGVkID0gZmFsc2U7XG5cbiAgICAgICAgICBjb25zdCBuYXR1cmFsS2V5cyA9IGtleVN0cmluZ1Byb3BlcnR5LnZhbHVlIGFzIEtleXNbbnVtYmVyXTtcbiAgICAgICAgICB0aGlzLl9wcmVzcyggZXZlbnQsIG5hdHVyYWxLZXlzLCB0aGlzICk7XG5cbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5wcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllc1Byb3BlcnR5LnZhbHVlLmluY2x1ZGVzKCBrZXlTdHJpbmdQcm9wZXJ0eSApLCAnS2V5IGFscmVhZHkgcHJlc3NlZCcgKTtcbiAgICAgICAgICB0aGlzLnByZXNzZWRLZXlTdHJpbmdQcm9wZXJ0aWVzUHJvcGVydHkudmFsdWUgPSBbIC4uLnRoaXMucHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXNQcm9wZXJ0eS52YWx1ZSwga2V5U3RyaW5nUHJvcGVydHkgXTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVsZWFzZTogKCBldmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwgKSA9PiB7XG4gICAgICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGhvdGtleS5pbnRlcnJ1cHRlZDtcbiAgICAgICAgICBjb25zdCBuYXR1cmFsS2V5cyA9IGtleVN0cmluZ1Byb3BlcnR5LnZhbHVlIGFzIEtleXNbbnVtYmVyXTtcblxuICAgICAgICAgIHRoaXMuX3JlbGVhc2UoIGV2ZW50LCBuYXR1cmFsS2V5cywgdGhpcyApO1xuXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllc1Byb3BlcnR5LnZhbHVlLmluY2x1ZGVzKCBrZXlTdHJpbmdQcm9wZXJ0eSApLCAnS2V5IG5vdCBwcmVzc2VkJyApO1xuICAgICAgICAgIHRoaXMucHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMucHJlc3NlZEtleVN0cmluZ1Byb3BlcnRpZXNQcm9wZXJ0eS52YWx1ZS5maWx0ZXIoIGRlc2NyaXB0b3IgPT4gZGVzY3JpcHRvciAhPT0ga2V5U3RyaW5nUHJvcGVydHkgKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmlyZU9uRG93bjogdGhpcy5maXJlT25Eb3duLFxuICAgICAgICBmaXJlT25Ib2xkOiB0aGlzLmZpcmVPbkhvbGQsXG4gICAgICAgIGZpcmVPbkhvbGRUaW1pbmc6IHRoaXMuZmlyZU9uSG9sZFRpbWluZyxcbiAgICAgICAgZmlyZU9uSG9sZEN1c3RvbURlbGF5OiB0aGlzLmZpcmVPbkhvbGRUaW1pbmcgPT09ICdjdXN0b20nID8gdGhpcy5maXJlT25Ib2xkQ3VzdG9tRGVsYXkgOiB1bmRlZmluZWQsXG4gICAgICAgIGZpcmVPbkhvbGRDdXN0b21JbnRlcnZhbDogdGhpcy5maXJlT25Ib2xkVGltaW5nID09PSAnY3VzdG9tJyA/IHRoaXMuZmlyZU9uSG9sZEN1c3RvbUludGVydmFsIDogdW5kZWZpbmVkLFxuICAgICAgICBhbGxvd092ZXJsYXA6IHRoaXMuYWxsb3dPdmVybGFwLFxuICAgICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMuZW5hYmxlZFByb3BlcnR5LFxuICAgICAgICBvdmVycmlkZTogdGhpcy5vdmVycmlkZVxuICAgICAgfSApO1xuXG4gICAgICByZXR1cm4gaG90a2V5O1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgZ2xvYmFsIEtleWJvYXJkTGlzdGVuZXIgdG8gYSB0YXJnZXQgTm9kZS4gVGhpcyBsaXN0ZW5lciB3aWxsIGZpcmUgcmVnYXJkbGVzcyBvZiB3aGVyZSBmb2N1cyBpcyBpblxuICAgKiB0aGUgZG9jdW1lbnQuIFRoZSBsaXN0ZW5lciBpcyByZXR1cm5lZCBzbyB0aGF0IGl0IGNhbiBiZSBkaXNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlR2xvYmFsKCB0YXJnZXQ6IE5vZGUsIHByb3ZpZGVkT3B0aW9uczogS2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8T25lS2V5U3Ryb2tlW10+ICk6IEtleWJvYXJkTGlzdGVuZXI8T25lS2V5U3Ryb2tlW10+IHtcbiAgICByZXR1cm4gbmV3IEdsb2JhbEtleWJvYXJkTGlzdGVuZXIoIHRhcmdldCwgcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbm5lciBjbGFzcyBmb3IgYSBLZXlib2FyZExpc3RlbmVyIHRoYXQgaXMgZ2xvYmFsIHdpdGggYSB0YXJnZXQgTm9kZS4gVGhlIGxpc3RlbmVyIHdpbGwgZmlyZSBubyBtYXR0ZXIgd2hlcmVcbiAqIGZvY3VzIGlzIGluIHRoZSBkb2N1bWVudCwgYXMgbG9uZyBhcyB0aGUgdGFyZ2V0IE5vZGUgY2FuIHJlY2VpdmUgaW5wdXQgZXZlbnRzLiBDcmVhdGUgdGhpcyBsaXN0ZW5lciB3aXRoXG4gKiBLZXlib2FyZExpc3RlbmVyLmNyZWF0ZUdsb2JhbC5cbiAqL1xuY2xhc3MgR2xvYmFsS2V5Ym9hcmRMaXN0ZW5lciBleHRlbmRzIEtleWJvYXJkTGlzdGVuZXI8T25lS2V5U3Ryb2tlW10+IHtcblxuICAvLyBBbGwgb2YgdGhlIFRyYWlscyB0byB0aGUgdGFyZ2V0IE5vZGUgdGhhdCBjYW4gcmVjZWl2ZSBhbHRlcm5hdGl2ZSBpbnB1dCBldmVudHMuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcGxheWVkVHJhaWxzUHJvcGVydHk6IERpc3BsYXllZFRyYWlsc1Byb3BlcnR5O1xuXG4gIC8vIERlcml2ZWQgZnJvbSBhYm92ZSwgd2hldGhlciB0aGUgdGFyZ2V0IE5vZGUgaXMgJ2VuYWJsZWQnIHRvIHJlY2VpdmUgaW5wdXQgZXZlbnRzLlxuICBwcml2YXRlIHJlYWRvbmx5IGdsb2JhbGx5RW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhcmdldDogTm9kZSwgcHJvdmlkZWRPcHRpb25zOiBLZXlib2FyZExpc3RlbmVyT3B0aW9uczxPbmVLZXlTdHJva2VbXT4gKSB7XG4gICAgY29uc3QgZGlzcGxheWVkVHJhaWxzUHJvcGVydHkgPSBuZXcgRGlzcGxheWVkVHJhaWxzUHJvcGVydHkoIHRhcmdldCwge1xuXG4gICAgICAvLyBGb3IgYWx0IGlucHV0IGV2ZW50cywgdXNlIHRoZSBQRE9NIHRyYWlsIHRvIGRldGVybWluZSBpZiB0aGUgdHJhaWwgaXMgZGlzcGxheWVkLiBUaGlzIG1heSBiZSBkaWZmZXJlbnRcbiAgICAgIC8vIGZyb20gdGhlIFwidmlzdWFsXCIgdHJhaWwgaWYgdGhlIE5vZGUgaXMgcGxhY2VkIGluIGEgUERPTSBvcmRlciB0aGF0IGlzIGRpZmZlcmVudCBmcm9tIHRoZSB2aXN1YWwgb3JkZXIuXG4gICAgICBmb2xsb3dQRE9NT3JkZXI6IHRydWUsXG5cbiAgICAgIC8vIEFkZGl0aW9uYWxseSwgdGhlIHRhcmdldCBtdXN0IGhhdmUgZWFjaCBvZiB0aGVzZSB0cnVlIHVwIGl0cyBUcmFpbHMgdG8gcmVjZWl2ZSBhbHQgaW5wdXQgZXZlbnRzLlxuICAgICAgcmVxdWlyZVBET01WaXNpYmxlOiB0cnVlLFxuICAgICAgcmVxdWlyZUVuYWJsZWQ6IHRydWUsXG4gICAgICByZXF1aXJlSW5wdXRFbmFibGVkOiB0cnVlXG4gICAgfSApO1xuICAgIGNvbnN0IGdsb2JhbGx5RW5hYmxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBkaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eSBdLCAoIHRyYWlsczogVHJhaWxbXSApID0+IHtcbiAgICAgIHJldHVybiB0cmFpbHMubGVuZ3RoID4gMDtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEtleWJvYXJkTGlzdGVuZXJPcHRpb25zPE9uZUtleVN0cm9rZVtdPiwgRW1wdHlTZWxmT3B0aW9ucywgS2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnM8T25lS2V5U3Ryb2tlW10+PigpKCB7XG5cbiAgICAgIC8vIFRoZSBlbmFibGVkUHJvcGVydHkgaXMgZm9yd2FyZGVkIHRvIHRoZSBIb3RrZXlzIHNvIHRoYXQgdGhleSBhcmUgZGlzYWJsZWQgd2hlbiB0aGUgdGFyZ2V0IGNhbm5vdCByZWNlaXZlIGlucHV0LlxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBnbG9iYWxseUVuYWJsZWRQcm9wZXJ0eVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcGxheWVkVHJhaWxzUHJvcGVydHkgPSBkaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eTtcbiAgICB0aGlzLmdsb2JhbGx5RW5hYmxlZFByb3BlcnR5ID0gZ2xvYmFsbHlFbmFibGVkUHJvcGVydHk7XG5cbiAgICAvLyBBZGQgYWxsIGdsb2JhbCBrZXlzIHRvIHRoZSByZWdpc3RyeVxuICAgIHRoaXMuaG90a2V5cy5mb3JFYWNoKCBob3RrZXkgPT4ge1xuICAgICAgZ2xvYmFsSG90a2V5UmVnaXN0cnkuYWRkKCBob3RrZXkgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZSBQcm9wZXJ0aWVzIGFuZCByZW1vdmUgYWxsIEhvdGtleXMgZnJvbSB0aGUgZ2xvYmFsIHJlZ2lzdHJ5LlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGdsb2JhbCBrZXlzIGZyb20gdGhlIHJlZ2lzdHJ5LlxuICAgIHRoaXMuaG90a2V5cy5mb3JFYWNoKCBob3RrZXkgPT4ge1xuICAgICAgZ2xvYmFsSG90a2V5UmVnaXN0cnkucmVtb3ZlKCBob3RrZXkgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmdsb2JhbGx5RW5hYmxlZFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmRpc3BsYXllZFRyYWlsc1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0tleWJvYXJkTGlzdGVuZXInLCBLZXlib2FyZExpc3RlbmVyICk7XG5leHBvcnQgZGVmYXVsdCBLZXlib2FyZExpc3RlbmVyOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbmFibGVkQ29tcG9uZW50IiwiUHJvcGVydHkiLCJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJEaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eSIsIkV2ZW50Q29udGV4dCIsImdsb2JhbEhvdGtleVJlZ2lzdHJ5IiwiSG90a2V5Iiwic2NlbmVyeSIsIlNjZW5lcnlFdmVudCIsIlRyYWlsIiwiS2V5Ym9hcmRMaXN0ZW5lciIsImlzUHJlc3NlZCIsImlzUHJlc3NlZFByb3BlcnR5IiwidmFsdWUiLCJvbkVuYWJsZWRQcm9wZXJ0eUNoYW5nZSIsImVuYWJsZWQiLCJpbnRlcnJ1cHQiLCJkaXNwb3NlIiwiaG90a2V5cyIsImZvckVhY2giLCJob3RrZXkiLCJwcmVzc2VkS2V5U3RyaW5nUHJvcGVydGllc1Byb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwidW5saW5rIiwiZW5hYmxlZFByb3BlcnR5TGlzdGVuZXIiLCJrZXlkb3duIiwiZXZlbnQiLCJwb2ludGVyIiwicmVzZXJ2ZUZvcktleWJvYXJkRHJhZyIsImZvY3Vzb3V0IiwiX2JsdXIiLCJmb2N1c2luIiwiX2ZvY3VzIiwiY2FuY2VsIiwiaGFuZGxlSW50ZXJydXB0IiwiY3JlYXRlU3ludGhldGljRXZlbnQiLCJjb250ZXh0IiwiY3JlYXRlU3ludGhldGljIiwiY3JlYXRlSG90a2V5cyIsImtleXMiLCJrZXlTdHJpbmdQcm9wZXJ0aWVzIiwiYXNzZXJ0IiwidXNhYmxlS2V5U3RyaW5nUHJvcGVydGllcyIsIm1hcCIsIm5hdHVyYWxLZXlzIiwia2V5U3RyaW5nUHJvcGVydHkiLCJmaXJlIiwiX2ZpcmUiLCJwcmVzcyIsImludGVycnVwdGVkIiwiX3ByZXNzIiwiaW5jbHVkZXMiLCJyZWxlYXNlIiwiX3JlbGVhc2UiLCJmaWx0ZXIiLCJkZXNjcmlwdG9yIiwiZmlyZU9uRG93biIsImZpcmVPbkhvbGQiLCJmaXJlT25Ib2xkVGltaW5nIiwiZmlyZU9uSG9sZEN1c3RvbURlbGF5IiwidW5kZWZpbmVkIiwiZmlyZU9uSG9sZEN1c3RvbUludGVydmFsIiwiYWxsb3dPdmVybGFwIiwib3ZlcnJpZGUiLCJjcmVhdGVHbG9iYWwiLCJ0YXJnZXQiLCJwcm92aWRlZE9wdGlvbnMiLCJHbG9iYWxLZXlib2FyZExpc3RlbmVyIiwib3B0aW9ucyIsIl8iLCJub29wIiwiZm9jdXMiLCJibHVyIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwib3IiLCJiaW5kIiwibGF6eUxpbmsiLCJyZW1vdmUiLCJnbG9iYWxseUVuYWJsZWRQcm9wZXJ0eSIsImRpc3BsYXllZFRyYWlsc1Byb3BlcnR5IiwiZm9sbG93UERPTU9yZGVyIiwicmVxdWlyZVBET01WaXNpYmxlIiwicmVxdWlyZUVuYWJsZWQiLCJyZXF1aXJlSW5wdXRFbmFibGVkIiwidHJhaWxzIiwibGVuZ3RoIiwiYWRkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EwRUMsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLHNCQUFtRCx1Q0FBdUM7QUFDakcsT0FBT0MsY0FBYywrQkFBK0I7QUFHcEQsT0FBT0Msb0NBQW9DLDBEQUEwRDtBQUNyRyxPQUFPQyxlQUFxQyxxQ0FBcUM7QUFDakYsU0FBU0MsdUJBQXVCLEVBQUVDLFlBQVksRUFBRUMsb0JBQW9CLEVBQUVDLE1BQU0sRUFBMkRDLE9BQU8sRUFBRUMsWUFBWSxFQUFrQkMsS0FBSyxRQUFRLGdCQUFnQjtBQTREM00sSUFBQSxBQUFNQyxtQkFBTixNQUFNQSx5QkFBK0RYO0lBZ0ZuRTs7R0FFQyxHQUNELElBQVdZLFlBQXFCO1FBQzlCLE9BQU8sSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSztJQUNyQztJQUVBOztHQUVDLEdBQ0QsQUFBUUMsd0JBQXlCQyxPQUFnQixFQUFTO1FBQ3hELENBQUNBLFdBQVcsSUFBSSxDQUFDQyxTQUFTO0lBQzVCO0lBRUE7O0dBRUMsR0FDRCxBQUFnQkMsVUFBZ0I7UUFDOUIsQUFBRSxJQUFJLENBQWdDQyxPQUFPLENBQUVDLE9BQU8sQ0FBRUMsQ0FBQUEsU0FBVUEsT0FBT0gsT0FBTztRQUNoRixJQUFJLENBQUNMLGlCQUFpQixDQUFDSyxPQUFPO1FBQzlCLElBQUksQ0FBQ0ksa0NBQWtDLENBQUNKLE9BQU87UUFFL0MsSUFBSSxDQUFDSyxlQUFlLENBQUNDLE1BQU0sQ0FBRSxJQUFJLENBQUNDLHVCQUF1QjtRQUV6RCxLQUFLLENBQUNQO0lBQ1I7SUFFQTs7O0dBR0MsR0FDRCxBQUFPUSxRQUFTQyxLQUFrQyxFQUFTO1FBQ3pEQSxNQUFNQyxPQUFPLENBQUNDLHNCQUFzQjtJQUN0QztJQUVBOztHQUVDLEdBQ0QsQUFBT0MsU0FBVUgsS0FBbUIsRUFBUztRQUMzQyxJQUFJLENBQUNWLFNBQVM7UUFFZCwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDYyxLQUFLLENBQUUsSUFBSTtJQUNsQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsUUFBU0wsS0FBbUIsRUFBUztRQUUxQyxnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDTSxNQUFNLENBQUUsSUFBSTtJQUNuQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsU0FBZTtRQUNwQixJQUFJLENBQUNDLGVBQWU7SUFDdEI7SUFFQTs7R0FFQyxHQUNELEFBQU9sQixZQUFrQjtRQUN2QixJQUFJLENBQUNrQixlQUFlO0lBQ3RCO0lBRUE7O0dBRUMsR0FDRCxBQUFRQSxrQkFBd0I7UUFFOUIsbUZBQW1GO1FBQ25GLElBQUksQ0FBQ2hCLE9BQU8sQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQSxTQUFVQSxPQUFPSixTQUFTO0lBQ2xEO0lBRVVtQixxQkFBc0JSLE9BQW9CLEVBQWdDO1FBQ2xGLE1BQU1TLFVBQVVoQyxhQUFhaUMsZUFBZTtRQUM1QyxPQUFPLElBQUk3QixhQUFjLElBQUlDLFNBQVMsYUFBYWtCLFNBQVNTO0lBQzlEO0lBRUE7O0dBRUMsR0FDRCxBQUFRRSxjQUFlQyxJQUFpQixFQUFFQyxtQkFBNkQsRUFBYTtRQUNsSEMsVUFBVUEsT0FBUUYsUUFBUUMscUJBQXFCO1FBRS9DLElBQUlFO1FBQ0osSUFBS0YscUJBQXNCO1lBQ3pCRSw0QkFBNEJGO1FBQzlCLE9BQ0s7WUFFSCw0REFBNEQ7WUFDNURFLDRCQUE0QkgsS0FBTUksR0FBRyxDQUFFQyxDQUFBQTtnQkFDckMsT0FBTyxJQUFJNUMsU0FBVTRDO1lBQ3ZCO1FBQ0Y7UUFFQSxPQUFPRiwwQkFBMEJDLEdBQUcsQ0FBRUUsQ0FBQUE7WUFDcEMsTUFBTXpCLFNBQVMsSUFBSWQsT0FBUTtnQkFDekJ1QyxtQkFBbUJBO2dCQUNuQkMsTUFBTSxDQUFFcEI7b0JBQ04sSUFBSSxDQUFDcUIsS0FBSyxDQUFFckIsT0FBT21CLGtCQUFrQmhDLEtBQUssRUFBa0IsSUFBSTtnQkFDbEU7Z0JBQ0FtQyxPQUFPLENBQUV0QjtvQkFDUCxJQUFJLENBQUN1QixXQUFXLEdBQUc7b0JBRW5CLE1BQU1MLGNBQWNDLGtCQUFrQmhDLEtBQUs7b0JBQzNDLElBQUksQ0FBQ3FDLE1BQU0sQ0FBRXhCLE9BQU9rQixhQUFhLElBQUk7b0JBRXJDSCxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDcEIsa0NBQWtDLENBQUNSLEtBQUssQ0FBQ3NDLFFBQVEsQ0FBRU4sb0JBQXFCO29CQUNoRyxJQUFJLENBQUN4QixrQ0FBa0MsQ0FBQ1IsS0FBSyxHQUFHOzJCQUFLLElBQUksQ0FBQ1Esa0NBQWtDLENBQUNSLEtBQUs7d0JBQUVnQztxQkFBbUI7Z0JBQ3pIO2dCQUNBTyxTQUFTLENBQUUxQjtvQkFDVCxJQUFJLENBQUN1QixXQUFXLEdBQUc3QixPQUFPNkIsV0FBVztvQkFDckMsTUFBTUwsY0FBY0Msa0JBQWtCaEMsS0FBSztvQkFFM0MsSUFBSSxDQUFDd0MsUUFBUSxDQUFFM0IsT0FBT2tCLGFBQWEsSUFBSTtvQkFFdkNILFVBQVVBLE9BQVEsSUFBSSxDQUFDcEIsa0NBQWtDLENBQUNSLEtBQUssQ0FBQ3NDLFFBQVEsQ0FBRU4sb0JBQXFCO29CQUMvRixJQUFJLENBQUN4QixrQ0FBa0MsQ0FBQ1IsS0FBSyxHQUFHLElBQUksQ0FBQ1Esa0NBQWtDLENBQUNSLEtBQUssQ0FBQ3lDLE1BQU0sQ0FBRUMsQ0FBQUEsYUFBY0EsZUFBZVY7Z0JBQ3JJO2dCQUNBVyxZQUFZLElBQUksQ0FBQ0EsVUFBVTtnQkFDM0JDLFlBQVksSUFBSSxDQUFDQSxVQUFVO2dCQUMzQkMsa0JBQWtCLElBQUksQ0FBQ0EsZ0JBQWdCO2dCQUN2Q0MsdUJBQXVCLElBQUksQ0FBQ0QsZ0JBQWdCLEtBQUssV0FBVyxJQUFJLENBQUNDLHFCQUFxQixHQUFHQztnQkFDekZDLDBCQUEwQixJQUFJLENBQUNILGdCQUFnQixLQUFLLFdBQVcsSUFBSSxDQUFDRyx3QkFBd0IsR0FBR0Q7Z0JBQy9GRSxjQUFjLElBQUksQ0FBQ0EsWUFBWTtnQkFDL0J4QyxpQkFBaUIsSUFBSSxDQUFDQSxlQUFlO2dCQUNyQ3lDLFVBQVUsSUFBSSxDQUFDQSxRQUFRO1lBQ3pCO1lBRUEsT0FBTzNDO1FBQ1Q7SUFDRjtJQUVBOzs7R0FHQyxHQUNELE9BQWM0QyxhQUFjQyxNQUFZLEVBQUVDLGVBQXdELEVBQXFDO1FBQ3JJLE9BQU8sSUFBSUMsdUJBQXdCRixRQUFRQztJQUM3QztJQXBNQSxZQUFvQkEsZUFBOEMsQ0FBRztRQUVuRSwrR0FBK0c7UUFDL0dqRSwrQkFBZ0NpRSxpQkFBaUI7WUFBRTtTQUFRLEVBQUU7WUFBRTtTQUF1QjtRQUV0RixNQUFNRSxVQUFVbEUsWUFBd0c7WUFDdEhxQyxNQUFNO1lBQ05DLHFCQUFxQjtZQUNyQk0sTUFBTXVCLEVBQUVDLElBQUk7WUFDWnRCLE9BQU9xQixFQUFFQyxJQUFJO1lBQ2JsQixTQUFTaUIsRUFBRUMsSUFBSTtZQUNmQyxPQUFPRixFQUFFQyxJQUFJO1lBQ2JFLE1BQU1ILEVBQUVDLElBQUk7WUFDWmQsWUFBWTtZQUNaQyxZQUFZO1lBQ1pDLGtCQUFrQjtZQUNsQkMsdUJBQXVCO1lBQ3ZCRSwwQkFBMEI7WUFDMUJDLGNBQWM7WUFDZEMsVUFBVTtZQUVWLG1CQUFtQjtZQUNuQixtR0FBbUc7WUFDbkdVLG1DQUFtQztRQUNyQyxHQUFHUDtRQUVILEtBQUssQ0FBRUU7UUFFUCxJQUFJLENBQUNyQixLQUFLLEdBQUdxQixRQUFRdEIsSUFBSTtRQUN6QixJQUFJLENBQUNJLE1BQU0sR0FBR2tCLFFBQVFwQixLQUFLO1FBQzNCLElBQUksQ0FBQ0ssUUFBUSxHQUFHZSxRQUFRaEIsT0FBTztRQUMvQixJQUFJLENBQUNwQixNQUFNLEdBQUdvQyxRQUFRRyxLQUFLO1FBQzNCLElBQUksQ0FBQ3pDLEtBQUssR0FBR3NDLFFBQVFJLElBQUk7UUFDekIsSUFBSSxDQUFDaEIsVUFBVSxHQUFHWSxRQUFRWixVQUFVO1FBQ3BDLElBQUksQ0FBQ0MsVUFBVSxHQUFHVyxRQUFRWCxVQUFVO1FBQ3BDLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUdVLFFBQVFWLGdCQUFnQjtRQUNoRCxJQUFJLENBQUNDLHFCQUFxQixHQUFHUyxRQUFRVCxxQkFBcUI7UUFDMUQsSUFBSSxDQUFDRSx3QkFBd0IsR0FBR08sUUFBUVAsd0JBQXdCO1FBQ2hFLElBQUksQ0FBQ0MsWUFBWSxHQUFHTSxRQUFRTixZQUFZO1FBQ3hDLElBQUksQ0FBQ0MsUUFBUSxHQUFHSyxRQUFRTCxRQUFRO1FBRWhDLHVGQUF1RjtRQUN2RixJQUFJLENBQUM3QyxPQUFPLEdBQUcsSUFBSSxDQUFDb0IsYUFBYSxDQUFFOEIsUUFBUTdCLElBQUksRUFBRTZCLFFBQVE1QixtQkFBbUI7UUFFNUUsSUFBSSxDQUFDNUIsaUJBQWlCLEdBQUdkLGdCQUFnQjRFLEVBQUUsQ0FBRSxJQUFJLENBQUN4RCxPQUFPLENBQUN5QixHQUFHLENBQUV2QixDQUFBQSxTQUFVQSxPQUFPUixpQkFBaUI7UUFDakcsSUFBSSxDQUFDUyxrQ0FBa0MsR0FBRyxJQUFJckIsU0FBVSxFQUFFO1FBQzFELElBQUksQ0FBQ2lELFdBQVcsR0FBRztRQUVuQixJQUFJLENBQUN6Qix1QkFBdUIsR0FBRyxJQUFJLENBQUNWLHVCQUF1QixDQUFDNkQsSUFBSSxDQUFFLElBQUk7UUFDdEUsSUFBSSxDQUFDckQsZUFBZSxDQUFDc0QsUUFBUSxDQUFFLElBQUksQ0FBQ3BELHVCQUF1QjtJQUM3RDtBQW1KRjtBQUVBOzs7O0NBSUMsR0FDRCxJQUFBLEFBQU0yQyx5QkFBTixNQUFNQSwrQkFBK0J6RDtJQXlDbkM7O0dBRUMsR0FDRCxBQUFnQk8sVUFBZ0I7UUFFOUIsNENBQTRDO1FBQzVDLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxPQUFPLENBQUVDLENBQUFBO1lBQ3BCZixxQkFBcUJ3RSxNQUFNLENBQUV6RDtRQUMvQjtRQUVBLElBQUksQ0FBQzBELHVCQUF1QixDQUFDN0QsT0FBTztRQUNwQyxJQUFJLENBQUM4RCx1QkFBdUIsQ0FBQzlELE9BQU87UUFDcEMsS0FBSyxDQUFDQTtJQUNSO0lBOUNBLFlBQW9CZ0QsTUFBWSxFQUFFQyxlQUF3RCxDQUFHO1FBQzNGLE1BQU1hLDBCQUEwQixJQUFJNUUsd0JBQXlCOEQsUUFBUTtZQUVuRSx5R0FBeUc7WUFDekcseUdBQXlHO1lBQ3pHZSxpQkFBaUI7WUFFakIsbUdBQW1HO1lBQ25HQyxvQkFBb0I7WUFDcEJDLGdCQUFnQjtZQUNoQkMscUJBQXFCO1FBQ3ZCO1FBQ0EsTUFBTUwsMEJBQTBCLElBQUloRixnQkFBaUI7WUFBRWlGO1NBQXlCLEVBQUUsQ0FBRUs7WUFDbEYsT0FBT0EsT0FBT0MsTUFBTSxHQUFHO1FBQ3pCO1FBRUEsTUFBTWpCLFVBQVVsRSxZQUFpSDtZQUUvSCxrSEFBa0g7WUFDbEhvQixpQkFBaUJ3RDtRQUNuQixHQUFHWjtRQUVILEtBQUssQ0FBRUU7UUFFUCxJQUFJLENBQUNXLHVCQUF1QixHQUFHQTtRQUMvQixJQUFJLENBQUNELHVCQUF1QixHQUFHQTtRQUUvQixzQ0FBc0M7UUFDdEMsSUFBSSxDQUFDNUQsT0FBTyxDQUFDQyxPQUFPLENBQUVDLENBQUFBO1lBQ3BCZixxQkFBcUJpRixHQUFHLENBQUVsRTtRQUM1QjtJQUNGO0FBZ0JGO0FBRUFiLFFBQVFnRixRQUFRLENBQUUsb0JBQW9CN0U7QUFDdEMsZUFBZUEsaUJBQWlCIn0=