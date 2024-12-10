// Copyright 2024, University of Colorado Boulder
/**
 * Manages hotkeys based on two sources:
 *
 * 1. Global hotkeys (from globalHotkeyRegistry)
 * 2. Hotkeys from the current focus trail (FocusManager.pdomFocusProperty, all hotkeys on all input listeners of
 *    nodes in the trail)
 *
 * Manages key press state using EnglishKey from globalKeyStateTracker.
 *
 * The "available" hotkeys are the union of the above two sources.
 *
 * The "enabled" hotkeys are the subset of available hotkeys whose enabledProperties are true.
 *
 * The "active" hotkeys are the subset of enabled hotkeys that are considered pressed. They will have fire-on-hold
 * behavior active.
 *
 * The set of enabled hotkeys determines the set of modifier keys that are considered "active" (in addition to
 * ctrl/alt/meta/shift, which are always included).
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import { eventCodeToEnglishString, FocusManager, globalHotkeyRegistry, globalKeyStateTracker, KeyboardUtils, metaEnglishKeys, scenery } from '../imports.js';
const arrayComparator = (a, b)=>{
    return a.length === b.length && a.every((element, index)=>element === b[index]);
};
const setComparator = (a, b)=>{
    return a.size === b.size && [
        ...a
    ].every((element)=>b.has(element));
};
let HotkeyManager = class HotkeyManager {
    /**
   * Scenery-internal. If a Node along the focused trail changes its input listeners we need to manually recompute
   * the available hotkeys. There is no other way at this time to observe the input listeners of a Node. Otherwise,
   * the available hotkeys will be recomputed when focus changes, inputEnabledProperty changes for Nodes along the
   * trail, or when global hotkeys change.
   *
   * Called by Node.addInputListener/Node.removeInputListener.
   *
   * (scenery-internal)
   */ updateHotkeysFromInputListenerChange(node) {
        if (FocusManager.pdomFocusProperty.value && FocusManager.pdomFocusProperty.value.trail.nodes.includes(node)) {
            this.availableHotkeysProperty.recomputeDerivation();
        }
    }
    /**
   * Given a main `key`, see if there is a hotkey that should be considered "active/pressed" for it.
   *
   * For a hotkey to be compatible, it needs to have:
   *
   * 1. Main key pressed
   * 2. All modifier keys in the hotkey's modifierKeys pressed
   * 3. All modifier keys not in the hotkey's modifierKeys (but in the other hotkeys above) not pressed
   */ getHotkeysForMainKey(mainKey) {
        // If the main key isn't down, there's no way it could be active
        if (!this.englishKeysDown.has(mainKey)) {
            return [];
        }
        const compatibleKeys = [
            ...this.enabledHotkeysProperty.value
        ].filter((hotkey)=>{
            // Filter out hotkeys that don't have the main key
            const key = hotkey.keyDescriptorProperty.value.key;
            if (key !== mainKey) {
                return false;
            }
            // See whether the modifier keys match
            return this.modifierKeys.every((modifierKey)=>{
                const ignoredModifierKeys = hotkey.keyDescriptorProperty.value.ignoredModifierKeys;
                return this.englishKeysDown.has(modifierKey) === hotkey.keysProperty.value.includes(modifierKey) || ignoredModifierKeys.includes(modifierKey);
            });
        });
        if (assert) {
            const conflictingKeys = compatibleKeys.filter((hotkey)=>!hotkey.allowOverlap);
            assert && assert(conflictingKeys.length < 2, `Key conflict detected: ${conflictingKeys.map((hotkey)=>hotkey.keyDescriptorProperty.value.getHotkeyString())}`);
        }
        return compatibleKeys;
    }
    /**
   * Re-check all hotkey active/pressed states (since modifier keys might have changed, OR we need to validate that
   * there are no conflicts).
   */ updateHotkeyStatus(keyboardEvent) {
        // For fireOnDown on/off cases, we only want to fire the hotkeys when we have a keyboard event specifying hotkey's
        // main `key`.
        const pressedOrReleasedKeyCode = KeyboardUtils.getEventCode(keyboardEvent);
        const pressedOrReleasedEnglishKey = pressedOrReleasedKeyCode ? eventCodeToEnglishString(pressedOrReleasedKeyCode) : null;
        for (const hotkey of this.enabledHotkeysProperty.value){
            // A hotkey should be  active if its main key is pressed. If it was interrupted, it can only become
            // active again if there was an actual key press event from the user. If a Hotkey is interrupted during
            // a press, it should remain inactive and interrupted until the NEXT press.
            const key = hotkey.keyDescriptorProperty.value.key;
            const keyPressed = this.getHotkeysForMainKey(key).includes(hotkey);
            const notInterrupted = !hotkey.interrupted || keyboardEvent && keyboardEvent.type === 'keydown';
            const shouldBeActive = keyPressed && notInterrupted;
            const isActive = this.activeHotkeys.has(hotkey);
            const descriptorKey = hotkey.keyDescriptorProperty.value.key;
            if (shouldBeActive && !isActive) {
                this.addActiveHotkey(hotkey, keyboardEvent, descriptorKey === pressedOrReleasedEnglishKey);
            } else if (!shouldBeActive && isActive) {
                this.removeActiveHotkey(hotkey, keyboardEvent, descriptorKey === pressedOrReleasedEnglishKey);
            }
        }
    }
    /**
   * Hotkey made active/pressed
   */ addActiveHotkey(hotkey, keyboardEvent, triggeredFromPress) {
        this.activeHotkeys.add(hotkey);
        const shouldFire = triggeredFromPress && hotkey.fireOnDown;
        hotkey.onPress(keyboardEvent, shouldFire);
    }
    /**
   * Hotkey made inactive/released.
   */ removeActiveHotkey(hotkey, keyboardEvent, triggeredFromRelease) {
        // Remove from activeHotkeys before Hotkey.onRelease so that we do not try to remove it again if there is
        // re-entrancy. This is possible if the release listener moves focus or interrupts a Hotkey.
        this.activeHotkeys.delete(hotkey);
        const shouldFire = triggeredFromRelease && !hotkey.fireOnDown;
        const interrupted = !triggeredFromRelease;
        hotkey.onRelease(keyboardEvent, interrupted, shouldFire);
    }
    /**
   * Called by Hotkey, removes the Hotkey from the active set when it is interrupted. The Hotkey cannot be active
   * again in this manager until there is an actual key press event from the user.
   */ interruptHotkey(hotkey) {
        assert && assert(hotkey.isPressedProperty.value, 'hotkey must be pressed to be interrupted');
        this.removeActiveHotkey(hotkey, null, false);
    }
    constructor(){
        // Enabled hotkeys that are either global, or under the current focus trail
        this.enabledHotkeysProperty = new TinyProperty([]);
        // The set of EnglishKeys that are currently pressed.
        this.englishKeysDown = new Set();
        // The current set of modifier keys (pressed or not) based on current enabled hotkeys
        // NOTE: Pressed modifier keys will prevent any other Hotkeys from becoming active. For example if you have a hotkey
        // with 'b+x', pressing 'b' will prevent any other hotkeys from becoming active.
        this.modifierKeys = [];
        // Hotkeys that are actively pressed
        this.activeHotkeys = new Set();
        this.availableHotkeysProperty = new DerivedProperty([
            globalHotkeyRegistry.hotkeysProperty,
            FocusManager.pdomFocusProperty
        ], (globalHotkeys, focus)=>{
            const hotkeys = [];
            // If we have focus, include the hotkeys from the focus trail
            if (focus) {
                for (const node of focus.trail.nodes.slice().reverse()){
                    if (!node.isInputEnabled()) {
                        break;
                    }
                    node.inputListeners.forEach((listener)=>{
                        var _listener_hotkeys;
                        (_listener_hotkeys = listener.hotkeys) == null ? void 0 : _listener_hotkeys.forEach((hotkey)=>{
                            hotkeys.push(hotkey);
                        });
                    });
                }
            }
            // Always include global hotkeys. Use a set since we might have duplicates.
            hotkeys.push(...globalHotkeys);
            return _.uniq(hotkeys);
        }, {
            // We want to not over-notify, so we compare the sets directly
            valueComparisonStrategy: arrayComparator
        });
        // If any of the nodes in the focus trail change inputEnabled, we need to recompute availableHotkeysProperty
        const onInputEnabledChanged = ()=>{
            this.availableHotkeysProperty.recomputeDerivation();
        };
        FocusManager.pdomFocusProperty.link((focus, oldFocus)=>{
            if (oldFocus) {
                oldFocus.trail.nodes.forEach((node)=>{
                    node.inputEnabledProperty.unlink(onInputEnabledChanged);
                });
            }
            if (focus) {
                focus.trail.nodes.forEach((node)=>{
                    node.inputEnabledProperty.lazyLink(onInputEnabledChanged);
                });
            }
        });
        // Update enabledHotkeysProperty when availableHotkeysProperty (or any enabledProperty or keyDescriptorProperty)
        // changes.
        const rebuildHotkeys = ()=>{
            const overriddenHotkeyStrings = new Set();
            const enabledHotkeys = [];
            for (const hotkey of this.availableHotkeysProperty.value){
                if (hotkey.enabledProperty.value) {
                    // Each hotkey will have a canonical way to represent it, so we can check for duplicates when overridden.
                    // Catch shift+ctrl+c and ctrl+shift+c as the same hotkey.
                    const modifierKeys = hotkey.keyDescriptorProperty.value.modifierKeys;
                    const key = hotkey.keyDescriptorProperty.value.key;
                    const hotkeyCanonicalString = [
                        ...modifierKeys.slice().sort(),
                        key
                    ].join('+');
                    if (!overriddenHotkeyStrings.has(hotkeyCanonicalString)) {
                        enabledHotkeys.push(hotkey);
                        if (hotkey.override) {
                            overriddenHotkeyStrings.add(hotkeyCanonicalString);
                        }
                    }
                }
            }
            this.enabledHotkeysProperty.value = enabledHotkeys;
        };
        // Because we can't add duplicate listeners, we create extra closures to have a unique handle for each hotkey
        // eslint-disable-next-line comma-spacing, @stylistic/comma-spacing
        const hotkeyRebuildListenerMap = new Map();
        this.availableHotkeysProperty.link((newHotkeys, oldHotkeys)=>{
            // Track whether any hotkeys changed. If none did, we don't need to rebuild.
            let hotkeysChanged = false;
            // Any old hotkeys and aren't in new hotkeys should be unlinked
            if (oldHotkeys) {
                for (const hotkey of oldHotkeys){
                    if (!newHotkeys.includes(hotkey)) {
                        const listener = hotkeyRebuildListenerMap.get(hotkey);
                        hotkeyRebuildListenerMap.delete(hotkey);
                        assert && assert(listener);
                        hotkey.enabledProperty.unlink(listener);
                        hotkey.keyDescriptorProperty.unlink(listener);
                        hotkeysChanged = true;
                    }
                }
            }
            // Any new hotkeys that aren't in old hotkeys should be linked
            for (const hotkey of newHotkeys){
                if (!oldHotkeys || !oldHotkeys.includes(hotkey)) {
                    // Unfortunate. Perhaps in the future we could have an abstraction that makes a "count" of how many times we
                    // are "listening" to a Property.
                    const listener = ()=>rebuildHotkeys();
                    hotkeyRebuildListenerMap.set(hotkey, listener);
                    hotkey.enabledProperty.lazyLink(listener);
                    hotkey.keyDescriptorProperty.lazyLink(listener);
                    hotkeysChanged = true;
                }
            }
            if (hotkeysChanged) {
                rebuildHotkeys();
            }
        });
        // Update modifierKeys and whether each hotkey is currently pressed. This is how hotkeys can have their state change
        // from either themselves (or other hotkeys with modifier keys) being added/removed from enabledHotkeys.
        this.enabledHotkeysProperty.link((newHotkeys, oldHotkeys)=>{
            this.modifierKeys = _.uniq([
                ...metaEnglishKeys,
                // enabledHotkeysProperty is recomputed when the keyDescriptorProperty changes, so we can rely on the current
                // value of keyDescriptorProperty.
                ...[
                    ...newHotkeys
                ].flatMap((hotkey)=>hotkey.keyDescriptorProperty.value.modifierKeys)
            ]);
            // Remove any hotkeys that are no longer available or enabled
            if (oldHotkeys) {
                for (const hotkey of oldHotkeys){
                    if (!newHotkeys.includes(hotkey) && this.activeHotkeys.has(hotkey)) {
                        this.removeActiveHotkey(hotkey, null, false);
                    }
                }
            }
            // Re-check all hotkeys (since modifier keys might have changed, OR we need to validate that there are no conflicts).
            this.updateHotkeyStatus(null);
        });
        // Track key state changes
        globalKeyStateTracker.keyDownStateChangedEmitter.addListener((keyboardEvent)=>{
            const englishKeysDown = globalKeyStateTracker.getEnglishKeysDown();
            const englishKeysChanged = !setComparator(this.englishKeysDown, englishKeysDown);
            if (englishKeysChanged) {
                this.englishKeysDown = englishKeysDown;
                this.updateHotkeyStatus(keyboardEvent);
            } else {
                // No keys changed, got the browser/OS "fire on hold". See what hotkeys have the browser fire-on-hold behavior.
                // Handle re-entrancy (if something changes the state of activeHotkeys)
                for (const hotkey of [
                    ...this.activeHotkeys
                ]){
                    if (hotkey.fireOnHold && hotkey.fireOnHoldTiming === 'browser') {
                        hotkey.fire(keyboardEvent);
                    }
                }
            }
        });
    }
};
scenery.register('HotkeyManager', HotkeyManager);
const hotkeyManager = new HotkeyManager();
export default hotkeyManager;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvaG90a2V5TWFuYWdlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWFuYWdlcyBob3RrZXlzIGJhc2VkIG9uIHR3byBzb3VyY2VzOlxuICpcbiAqIDEuIEdsb2JhbCBob3RrZXlzIChmcm9tIGdsb2JhbEhvdGtleVJlZ2lzdHJ5KVxuICogMi4gSG90a2V5cyBmcm9tIHRoZSBjdXJyZW50IGZvY3VzIHRyYWlsIChGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHksIGFsbCBob3RrZXlzIG9uIGFsbCBpbnB1dCBsaXN0ZW5lcnMgb2ZcbiAqICAgIG5vZGVzIGluIHRoZSB0cmFpbClcbiAqXG4gKiBNYW5hZ2VzIGtleSBwcmVzcyBzdGF0ZSB1c2luZyBFbmdsaXNoS2V5IGZyb20gZ2xvYmFsS2V5U3RhdGVUcmFja2VyLlxuICpcbiAqIFRoZSBcImF2YWlsYWJsZVwiIGhvdGtleXMgYXJlIHRoZSB1bmlvbiBvZiB0aGUgYWJvdmUgdHdvIHNvdXJjZXMuXG4gKlxuICogVGhlIFwiZW5hYmxlZFwiIGhvdGtleXMgYXJlIHRoZSBzdWJzZXQgb2YgYXZhaWxhYmxlIGhvdGtleXMgd2hvc2UgZW5hYmxlZFByb3BlcnRpZXMgYXJlIHRydWUuXG4gKlxuICogVGhlIFwiYWN0aXZlXCIgaG90a2V5cyBhcmUgdGhlIHN1YnNldCBvZiBlbmFibGVkIGhvdGtleXMgdGhhdCBhcmUgY29uc2lkZXJlZCBwcmVzc2VkLiBUaGV5IHdpbGwgaGF2ZSBmaXJlLW9uLWhvbGRcbiAqIGJlaGF2aW9yIGFjdGl2ZS5cbiAqXG4gKiBUaGUgc2V0IG9mIGVuYWJsZWQgaG90a2V5cyBkZXRlcm1pbmVzIHRoZSBzZXQgb2YgbW9kaWZpZXIga2V5cyB0aGF0IGFyZSBjb25zaWRlcmVkIFwiYWN0aXZlXCIgKGluIGFkZGl0aW9uIHRvXG4gKiBjdHJsL2FsdC9tZXRhL3NoaWZ0LCB3aGljaCBhcmUgYWx3YXlzIGluY2x1ZGVkKS5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5LCB7IFVua25vd25EZXJpdmVkUHJvcGVydHkgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgQWxsb3dlZEtleXNTdHJpbmcsIEVuZ2xpc2hLZXlTdHJpbmcsIGV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZywgRm9jdXNNYW5hZ2VyLCBnbG9iYWxIb3RrZXlSZWdpc3RyeSwgZ2xvYmFsS2V5U3RhdGVUcmFja2VyLCBIb3RrZXksIEtleWJvYXJkVXRpbHMsIG1ldGFFbmdsaXNoS2V5cywgTm9kZSwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBhcnJheUNvbXBhcmF0b3IgPSA8S2V5PiggYTogS2V5W10sIGI6IEtleVtdICk6IGJvb2xlYW4gPT4ge1xuICByZXR1cm4gYS5sZW5ndGggPT09IGIubGVuZ3RoICYmIGEuZXZlcnkoICggZWxlbWVudCwgaW5kZXggKSA9PiBlbGVtZW50ID09PSBiWyBpbmRleCBdICk7XG59O1xuXG5jb25zdCBzZXRDb21wYXJhdG9yID0gPEtleT4oIGE6IFNldDxLZXk+LCBiOiBTZXQ8S2V5PiApID0+IHtcbiAgcmV0dXJuIGEuc2l6ZSA9PT0gYi5zaXplICYmIFsgLi4uYSBdLmV2ZXJ5KCBlbGVtZW50ID0+IGIuaGFzKCBlbGVtZW50ICkgKTtcbn07XG5cbmNsYXNzIEhvdGtleU1hbmFnZXIge1xuXG4gIC8vIEFsbCBob3RrZXlzIHRoYXQgYXJlIGVpdGhlciBnbG9iYWxseSBvciB1bmRlciB0aGUgY3VycmVudCBmb2N1cyB0cmFpbC4gVGhleSBhcmUgb3JkZXJlZCwgc28gdGhhdCB0aGUgZmlyc3RcbiAgLy8gXCJpZGVudGljYWwga2V5LXNob3J0Y3V0XCIgaG90a2V5IHdpdGggb3ZlcnJpZGUgd2lsbCBiZSB0aGUgb25lIHRoYXQgaXMgYWN0aXZlLlxuICBwcml2YXRlIHJlYWRvbmx5IGF2YWlsYWJsZUhvdGtleXNQcm9wZXJ0eTogVW5rbm93bkRlcml2ZWRQcm9wZXJ0eTxIb3RrZXlbXT47XG5cbiAgLy8gRW5hYmxlZCBob3RrZXlzIHRoYXQgYXJlIGVpdGhlciBnbG9iYWwsIG9yIHVuZGVyIHRoZSBjdXJyZW50IGZvY3VzIHRyYWlsXG4gIHByaXZhdGUgcmVhZG9ubHkgZW5hYmxlZEhvdGtleXNQcm9wZXJ0eTogVFByb3BlcnR5PEhvdGtleVtdPiA9IG5ldyBUaW55UHJvcGVydHkoIFtdICk7XG5cbiAgLy8gVGhlIHNldCBvZiBFbmdsaXNoS2V5cyB0aGF0IGFyZSBjdXJyZW50bHkgcHJlc3NlZC5cbiAgcHJpdmF0ZSBlbmdsaXNoS2V5c0Rvd246IFNldDxFbmdsaXNoS2V5U3RyaW5nPiA9IG5ldyBTZXQ8RW5nbGlzaEtleVN0cmluZz4oKTtcblxuICAvLyBUaGUgY3VycmVudCBzZXQgb2YgbW9kaWZpZXIga2V5cyAocHJlc3NlZCBvciBub3QpIGJhc2VkIG9uIGN1cnJlbnQgZW5hYmxlZCBob3RrZXlzXG4gIC8vIE5PVEU6IFByZXNzZWQgbW9kaWZpZXIga2V5cyB3aWxsIHByZXZlbnQgYW55IG90aGVyIEhvdGtleXMgZnJvbSBiZWNvbWluZyBhY3RpdmUuIEZvciBleGFtcGxlIGlmIHlvdSBoYXZlIGEgaG90a2V5XG4gIC8vIHdpdGggJ2IreCcsIHByZXNzaW5nICdiJyB3aWxsIHByZXZlbnQgYW55IG90aGVyIGhvdGtleXMgZnJvbSBiZWNvbWluZyBhY3RpdmUuXG4gIHByaXZhdGUgbW9kaWZpZXJLZXlzOiBBbGxvd2VkS2V5c1N0cmluZ1tdID0gW107XG5cbiAgLy8gSG90a2V5cyB0aGF0IGFyZSBhY3RpdmVseSBwcmVzc2VkXG4gIHByaXZhdGUgcmVhZG9ubHkgYWN0aXZlSG90a2V5czogU2V0PEhvdGtleT4gPSBuZXcgU2V0PEhvdGtleT4oKTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hdmFpbGFibGVIb3RrZXlzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXG4gICAgICBnbG9iYWxIb3RrZXlSZWdpc3RyeS5ob3RrZXlzUHJvcGVydHksXG4gICAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHlcbiAgICBdLCAoIGdsb2JhbEhvdGtleXMsIGZvY3VzICkgPT4ge1xuICAgICAgY29uc3QgaG90a2V5czogSG90a2V5W10gPSBbXTtcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBmb2N1cywgaW5jbHVkZSB0aGUgaG90a2V5cyBmcm9tIHRoZSBmb2N1cyB0cmFpbFxuICAgICAgaWYgKCBmb2N1cyApIHtcbiAgICAgICAgZm9yICggY29uc3Qgbm9kZSBvZiBmb2N1cy50cmFpbC5ub2Rlcy5zbGljZSgpLnJldmVyc2UoKSApIHtcbiAgICAgICAgICBpZiAoICFub2RlLmlzSW5wdXRFbmFibGVkKCkgKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBub2RlLmlucHV0TGlzdGVuZXJzLmZvckVhY2goIGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgIGxpc3RlbmVyLmhvdGtleXM/LmZvckVhY2goIGhvdGtleSA9PiB7XG4gICAgICAgICAgICAgIGhvdGtleXMucHVzaCggaG90a2V5ICk7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFsd2F5cyBpbmNsdWRlIGdsb2JhbCBob3RrZXlzLiBVc2UgYSBzZXQgc2luY2Ugd2UgbWlnaHQgaGF2ZSBkdXBsaWNhdGVzLlxuICAgICAgaG90a2V5cy5wdXNoKCAuLi5nbG9iYWxIb3RrZXlzICk7XG5cbiAgICAgIHJldHVybiBfLnVuaXEoIGhvdGtleXMgKTtcbiAgICB9LCB7XG4gICAgICAvLyBXZSB3YW50IHRvIG5vdCBvdmVyLW5vdGlmeSwgc28gd2UgY29tcGFyZSB0aGUgc2V0cyBkaXJlY3RseVxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6IGFycmF5Q29tcGFyYXRvclxuICAgIH0gKSBhcyBVbmtub3duRGVyaXZlZFByb3BlcnR5PEhvdGtleVtdPjtcblxuICAgIC8vIElmIGFueSBvZiB0aGUgbm9kZXMgaW4gdGhlIGZvY3VzIHRyYWlsIGNoYW5nZSBpbnB1dEVuYWJsZWQsIHdlIG5lZWQgdG8gcmVjb21wdXRlIGF2YWlsYWJsZUhvdGtleXNQcm9wZXJ0eVxuICAgIGNvbnN0IG9uSW5wdXRFbmFibGVkQ2hhbmdlZCA9ICgpID0+IHtcbiAgICAgIHRoaXMuYXZhaWxhYmxlSG90a2V5c1Byb3BlcnR5LnJlY29tcHV0ZURlcml2YXRpb24oKTtcbiAgICB9O1xuICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS5saW5rKCAoIGZvY3VzLCBvbGRGb2N1cyApID0+IHtcbiAgICAgIGlmICggb2xkRm9jdXMgKSB7XG4gICAgICAgIG9sZEZvY3VzLnRyYWlsLm5vZGVzLmZvckVhY2goIG5vZGUgPT4ge1xuICAgICAgICAgIG5vZGUuaW5wdXRFbmFibGVkUHJvcGVydHkudW5saW5rKCBvbklucHV0RW5hYmxlZENoYW5nZWQgKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGZvY3VzICkge1xuICAgICAgICBmb2N1cy50cmFpbC5ub2Rlcy5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgICAgICBub2RlLmlucHV0RW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCBvbklucHV0RW5hYmxlZENoYW5nZWQgKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIFVwZGF0ZSBlbmFibGVkSG90a2V5c1Byb3BlcnR5IHdoZW4gYXZhaWxhYmxlSG90a2V5c1Byb3BlcnR5IChvciBhbnkgZW5hYmxlZFByb3BlcnR5IG9yIGtleURlc2NyaXB0b3JQcm9wZXJ0eSlcbiAgICAvLyBjaGFuZ2VzLlxuICAgIGNvbnN0IHJlYnVpbGRIb3RrZXlzID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb3ZlcnJpZGRlbkhvdGtleVN0cmluZ3MgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgIGNvbnN0IGVuYWJsZWRIb3RrZXlzOiBIb3RrZXlbXSA9IFtdO1xuXG4gICAgICBmb3IgKCBjb25zdCBob3RrZXkgb2YgdGhpcy5hdmFpbGFibGVIb3RrZXlzUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgIGlmICggaG90a2V5LmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgICAvLyBFYWNoIGhvdGtleSB3aWxsIGhhdmUgYSBjYW5vbmljYWwgd2F5IHRvIHJlcHJlc2VudCBpdCwgc28gd2UgY2FuIGNoZWNrIGZvciBkdXBsaWNhdGVzIHdoZW4gb3ZlcnJpZGRlbi5cbiAgICAgICAgICAvLyBDYXRjaCBzaGlmdCtjdHJsK2MgYW5kIGN0cmwrc2hpZnQrYyBhcyB0aGUgc2FtZSBob3RrZXkuXG4gICAgICAgICAgY29uc3QgbW9kaWZpZXJLZXlzID0gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5tb2RpZmllcktleXM7XG4gICAgICAgICAgY29uc3Qga2V5ID0gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5rZXk7XG4gICAgICAgICAgY29uc3QgaG90a2V5Q2Fub25pY2FsU3RyaW5nID0gW1xuICAgICAgICAgICAgLi4ubW9kaWZpZXJLZXlzLnNsaWNlKCkuc29ydCgpLFxuICAgICAgICAgICAga2V5XG4gICAgICAgICAgXS5qb2luKCAnKycgKTtcblxuICAgICAgICAgIGlmICggIW92ZXJyaWRkZW5Ib3RrZXlTdHJpbmdzLmhhcyggaG90a2V5Q2Fub25pY2FsU3RyaW5nICkgKSB7XG4gICAgICAgICAgICBlbmFibGVkSG90a2V5cy5wdXNoKCBob3RrZXkgKTtcblxuICAgICAgICAgICAgaWYgKCBob3RrZXkub3ZlcnJpZGUgKSB7XG4gICAgICAgICAgICAgIG92ZXJyaWRkZW5Ib3RrZXlTdHJpbmdzLmFkZCggaG90a2V5Q2Fub25pY2FsU3RyaW5nICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW5hYmxlZEhvdGtleXNQcm9wZXJ0eS52YWx1ZSA9IGVuYWJsZWRIb3RrZXlzO1xuICAgIH07XG4gICAgLy8gQmVjYXVzZSB3ZSBjYW4ndCBhZGQgZHVwbGljYXRlIGxpc3RlbmVycywgd2UgY3JlYXRlIGV4dHJhIGNsb3N1cmVzIHRvIGhhdmUgYSB1bmlxdWUgaGFuZGxlIGZvciBlYWNoIGhvdGtleVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbW1hLXNwYWNpbmcsIEBzdHlsaXN0aWMvY29tbWEtc3BhY2luZ1xuICAgIGNvbnN0IGhvdGtleVJlYnVpbGRMaXN0ZW5lck1hcCA9IG5ldyBNYXA8SG90a2V5LCgpID0+IHZvaWQ+KCk7XG5cbiAgICB0aGlzLmF2YWlsYWJsZUhvdGtleXNQcm9wZXJ0eS5saW5rKCAoIG5ld0hvdGtleXMsIG9sZEhvdGtleXMgKSA9PiB7XG4gICAgICAvLyBUcmFjayB3aGV0aGVyIGFueSBob3RrZXlzIGNoYW5nZWQuIElmIG5vbmUgZGlkLCB3ZSBkb24ndCBuZWVkIHRvIHJlYnVpbGQuXG4gICAgICBsZXQgaG90a2V5c0NoYW5nZWQgPSBmYWxzZTtcblxuICAgICAgLy8gQW55IG9sZCBob3RrZXlzIGFuZCBhcmVuJ3QgaW4gbmV3IGhvdGtleXMgc2hvdWxkIGJlIHVubGlua2VkXG4gICAgICBpZiAoIG9sZEhvdGtleXMgKSB7XG4gICAgICAgIGZvciAoIGNvbnN0IGhvdGtleSBvZiBvbGRIb3RrZXlzICkge1xuICAgICAgICAgIGlmICggIW5ld0hvdGtleXMuaW5jbHVkZXMoIGhvdGtleSApICkge1xuICAgICAgICAgICAgY29uc3QgbGlzdGVuZXIgPSBob3RrZXlSZWJ1aWxkTGlzdGVuZXJNYXAuZ2V0KCBob3RrZXkgKSE7XG4gICAgICAgICAgICBob3RrZXlSZWJ1aWxkTGlzdGVuZXJNYXAuZGVsZXRlKCBob3RrZXkgKTtcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RlbmVyICk7XG5cbiAgICAgICAgICAgIGhvdGtleS5lbmFibGVkUHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApO1xuICAgICAgICAgICAgaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS51bmxpbmsoIGxpc3RlbmVyICk7XG4gICAgICAgICAgICBob3RrZXlzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFueSBuZXcgaG90a2V5cyB0aGF0IGFyZW4ndCBpbiBvbGQgaG90a2V5cyBzaG91bGQgYmUgbGlua2VkXG4gICAgICBmb3IgKCBjb25zdCBob3RrZXkgb2YgbmV3SG90a2V5cyApIHtcbiAgICAgICAgaWYgKCAhb2xkSG90a2V5cyB8fCAhb2xkSG90a2V5cy5pbmNsdWRlcyggaG90a2V5ICkgKSB7XG4gICAgICAgICAgLy8gVW5mb3J0dW5hdGUuIFBlcmhhcHMgaW4gdGhlIGZ1dHVyZSB3ZSBjb3VsZCBoYXZlIGFuIGFic3RyYWN0aW9uIHRoYXQgbWFrZXMgYSBcImNvdW50XCIgb2YgaG93IG1hbnkgdGltZXMgd2VcbiAgICAgICAgICAvLyBhcmUgXCJsaXN0ZW5pbmdcIiB0byBhIFByb3BlcnR5LlxuICAgICAgICAgIGNvbnN0IGxpc3RlbmVyID0gKCkgPT4gcmVidWlsZEhvdGtleXMoKTtcbiAgICAgICAgICBob3RrZXlSZWJ1aWxkTGlzdGVuZXJNYXAuc2V0KCBob3RrZXksIGxpc3RlbmVyICk7XG5cbiAgICAgICAgICBob3RrZXkuZW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCBsaXN0ZW5lciApO1xuICAgICAgICAgIGhvdGtleS5rZXlEZXNjcmlwdG9yUHJvcGVydHkubGF6eUxpbmsoIGxpc3RlbmVyICk7XG4gICAgICAgICAgaG90a2V5c0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggaG90a2V5c0NoYW5nZWQgKSB7XG4gICAgICAgIHJlYnVpbGRIb3RrZXlzKCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gVXBkYXRlIG1vZGlmaWVyS2V5cyBhbmQgd2hldGhlciBlYWNoIGhvdGtleSBpcyBjdXJyZW50bHkgcHJlc3NlZC4gVGhpcyBpcyBob3cgaG90a2V5cyBjYW4gaGF2ZSB0aGVpciBzdGF0ZSBjaGFuZ2VcbiAgICAvLyBmcm9tIGVpdGhlciB0aGVtc2VsdmVzIChvciBvdGhlciBob3RrZXlzIHdpdGggbW9kaWZpZXIga2V5cykgYmVpbmcgYWRkZWQvcmVtb3ZlZCBmcm9tIGVuYWJsZWRIb3RrZXlzLlxuICAgIHRoaXMuZW5hYmxlZEhvdGtleXNQcm9wZXJ0eS5saW5rKCAoIG5ld0hvdGtleXMsIG9sZEhvdGtleXMgKSA9PiB7XG4gICAgICB0aGlzLm1vZGlmaWVyS2V5cyA9IF8udW5pcSggW1xuICAgICAgICAuLi5tZXRhRW5nbGlzaEtleXMsXG5cbiAgICAgICAgLy8gZW5hYmxlZEhvdGtleXNQcm9wZXJ0eSBpcyByZWNvbXB1dGVkIHdoZW4gdGhlIGtleURlc2NyaXB0b3JQcm9wZXJ0eSBjaGFuZ2VzLCBzbyB3ZSBjYW4gcmVseSBvbiB0aGUgY3VycmVudFxuICAgICAgICAvLyB2YWx1ZSBvZiBrZXlEZXNjcmlwdG9yUHJvcGVydHkuXG4gICAgICAgIC4uLlsgLi4ubmV3SG90a2V5cyBdLmZsYXRNYXAoIGhvdGtleSA9PiBob3RrZXkua2V5RGVzY3JpcHRvclByb3BlcnR5LnZhbHVlLm1vZGlmaWVyS2V5cyApXG4gICAgICBdICk7XG5cbiAgICAgIC8vIFJlbW92ZSBhbnkgaG90a2V5cyB0aGF0IGFyZSBubyBsb25nZXIgYXZhaWxhYmxlIG9yIGVuYWJsZWRcbiAgICAgIGlmICggb2xkSG90a2V5cyApIHtcbiAgICAgICAgZm9yICggY29uc3QgaG90a2V5IG9mIG9sZEhvdGtleXMgKSB7XG4gICAgICAgICAgaWYgKCAhbmV3SG90a2V5cy5pbmNsdWRlcyggaG90a2V5ICkgJiYgdGhpcy5hY3RpdmVIb3RrZXlzLmhhcyggaG90a2V5ICkgKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFjdGl2ZUhvdGtleSggaG90a2V5LCBudWxsLCBmYWxzZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZS1jaGVjayBhbGwgaG90a2V5cyAoc2luY2UgbW9kaWZpZXIga2V5cyBtaWdodCBoYXZlIGNoYW5nZWQsIE9SIHdlIG5lZWQgdG8gdmFsaWRhdGUgdGhhdCB0aGVyZSBhcmUgbm8gY29uZmxpY3RzKS5cbiAgICAgIHRoaXMudXBkYXRlSG90a2V5U3RhdHVzKCBudWxsICk7XG4gICAgfSApO1xuXG4gICAgLy8gVHJhY2sga2V5IHN0YXRlIGNoYW5nZXNcbiAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIua2V5RG93blN0YXRlQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwgKSA9PiB7XG4gICAgICBjb25zdCBlbmdsaXNoS2V5c0Rvd24gPSBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuZ2V0RW5nbGlzaEtleXNEb3duKCk7XG4gICAgICBjb25zdCBlbmdsaXNoS2V5c0NoYW5nZWQgPSAhc2V0Q29tcGFyYXRvciggdGhpcy5lbmdsaXNoS2V5c0Rvd24sIGVuZ2xpc2hLZXlzRG93biApO1xuXG4gICAgICBpZiAoIGVuZ2xpc2hLZXlzQ2hhbmdlZCApIHtcbiAgICAgICAgdGhpcy5lbmdsaXNoS2V5c0Rvd24gPSBlbmdsaXNoS2V5c0Rvd247XG5cbiAgICAgICAgdGhpcy51cGRhdGVIb3RrZXlTdGF0dXMoIGtleWJvYXJkRXZlbnQgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBObyBrZXlzIGNoYW5nZWQsIGdvdCB0aGUgYnJvd3Nlci9PUyBcImZpcmUgb24gaG9sZFwiLiBTZWUgd2hhdCBob3RrZXlzIGhhdmUgdGhlIGJyb3dzZXIgZmlyZS1vbi1ob2xkIGJlaGF2aW9yLlxuXG4gICAgICAgIC8vIEhhbmRsZSByZS1lbnRyYW5jeSAoaWYgc29tZXRoaW5nIGNoYW5nZXMgdGhlIHN0YXRlIG9mIGFjdGl2ZUhvdGtleXMpXG4gICAgICAgIGZvciAoIGNvbnN0IGhvdGtleSBvZiBbIC4uLnRoaXMuYWN0aXZlSG90a2V5cyBdICkge1xuICAgICAgICAgIGlmICggaG90a2V5LmZpcmVPbkhvbGQgJiYgaG90a2V5LmZpcmVPbkhvbGRUaW1pbmcgPT09ICdicm93c2VyJyApIHtcbiAgICAgICAgICAgIGhvdGtleS5maXJlKCBrZXlib2FyZEV2ZW50ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjZW5lcnktaW50ZXJuYWwuIElmIGEgTm9kZSBhbG9uZyB0aGUgZm9jdXNlZCB0cmFpbCBjaGFuZ2VzIGl0cyBpbnB1dCBsaXN0ZW5lcnMgd2UgbmVlZCB0byBtYW51YWxseSByZWNvbXB1dGVcbiAgICogdGhlIGF2YWlsYWJsZSBob3RrZXlzLiBUaGVyZSBpcyBubyBvdGhlciB3YXkgYXQgdGhpcyB0aW1lIHRvIG9ic2VydmUgdGhlIGlucHV0IGxpc3RlbmVycyBvZiBhIE5vZGUuIE90aGVyd2lzZSxcbiAgICogdGhlIGF2YWlsYWJsZSBob3RrZXlzIHdpbGwgYmUgcmVjb21wdXRlZCB3aGVuIGZvY3VzIGNoYW5nZXMsIGlucHV0RW5hYmxlZFByb3BlcnR5IGNoYW5nZXMgZm9yIE5vZGVzIGFsb25nIHRoZVxuICAgKiB0cmFpbCwgb3Igd2hlbiBnbG9iYWwgaG90a2V5cyBjaGFuZ2UuXG4gICAqXG4gICAqIENhbGxlZCBieSBOb2RlLmFkZElucHV0TGlzdGVuZXIvTm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyLlxuICAgKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyB1cGRhdGVIb3RrZXlzRnJvbUlucHV0TGlzdGVuZXJDaGFuZ2UoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gICAgaWYgKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzUHJvcGVydHkudmFsdWUgJiYgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LnZhbHVlLnRyYWlsLm5vZGVzLmluY2x1ZGVzKCBub2RlICkgKSB7XG4gICAgICB0aGlzLmF2YWlsYWJsZUhvdGtleXNQcm9wZXJ0eS5yZWNvbXB1dGVEZXJpdmF0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbWFpbiBga2V5YCwgc2VlIGlmIHRoZXJlIGlzIGEgaG90a2V5IHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgXCJhY3RpdmUvcHJlc3NlZFwiIGZvciBpdC5cbiAgICpcbiAgICogRm9yIGEgaG90a2V5IHRvIGJlIGNvbXBhdGlibGUsIGl0IG5lZWRzIHRvIGhhdmU6XG4gICAqXG4gICAqIDEuIE1haW4ga2V5IHByZXNzZWRcbiAgICogMi4gQWxsIG1vZGlmaWVyIGtleXMgaW4gdGhlIGhvdGtleSdzIG1vZGlmaWVyS2V5cyBwcmVzc2VkXG4gICAqIDMuIEFsbCBtb2RpZmllciBrZXlzIG5vdCBpbiB0aGUgaG90a2V5J3MgbW9kaWZpZXJLZXlzIChidXQgaW4gdGhlIG90aGVyIGhvdGtleXMgYWJvdmUpIG5vdCBwcmVzc2VkXG4gICAqL1xuICBwcml2YXRlIGdldEhvdGtleXNGb3JNYWluS2V5KCBtYWluS2V5OiBFbmdsaXNoS2V5U3RyaW5nICk6IEhvdGtleVtdIHtcblxuICAgIC8vIElmIHRoZSBtYWluIGtleSBpc24ndCBkb3duLCB0aGVyZSdzIG5vIHdheSBpdCBjb3VsZCBiZSBhY3RpdmVcbiAgICBpZiAoICF0aGlzLmVuZ2xpc2hLZXlzRG93bi5oYXMoIG1haW5LZXkgKSApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wYXRpYmxlS2V5cyA9IFsgLi4udGhpcy5lbmFibGVkSG90a2V5c1Byb3BlcnR5LnZhbHVlIF0uZmlsdGVyKCBob3RrZXkgPT4ge1xuXG4gICAgICAvLyBGaWx0ZXIgb3V0IGhvdGtleXMgdGhhdCBkb24ndCBoYXZlIHRoZSBtYWluIGtleVxuICAgICAgY29uc3Qga2V5ID0gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5rZXk7XG4gICAgICBpZiAoIGtleSAhPT0gbWFpbktleSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWUgd2hldGhlciB0aGUgbW9kaWZpZXIga2V5cyBtYXRjaFxuICAgICAgcmV0dXJuIHRoaXMubW9kaWZpZXJLZXlzLmV2ZXJ5KCBtb2RpZmllcktleSA9PiB7XG4gICAgICAgIGNvbnN0IGlnbm9yZWRNb2RpZmllcktleXMgPSBob3RrZXkua2V5RGVzY3JpcHRvclByb3BlcnR5LnZhbHVlLmlnbm9yZWRNb2RpZmllcktleXM7XG4gICAgICAgIHJldHVybiB0aGlzLmVuZ2xpc2hLZXlzRG93bi5oYXMoIG1vZGlmaWVyS2V5ICkgPT09IGhvdGtleS5rZXlzUHJvcGVydHkudmFsdWUuaW5jbHVkZXMoIG1vZGlmaWVyS2V5ICkgfHxcbiAgICAgICAgICAgICAgIGlnbm9yZWRNb2RpZmllcktleXMuaW5jbHVkZXMoIG1vZGlmaWVyS2V5ICk7XG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBjb25zdCBjb25mbGljdGluZ0tleXMgPSBjb21wYXRpYmxlS2V5cy5maWx0ZXIoIGhvdGtleSA9PiAhaG90a2V5LmFsbG93T3ZlcmxhcCApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb25mbGljdGluZ0tleXMubGVuZ3RoIDwgMiwgYEtleSBjb25mbGljdCBkZXRlY3RlZDogJHtjb25mbGljdGluZ0tleXMubWFwKCBob3RrZXkgPT4gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5nZXRIb3RrZXlTdHJpbmcoKSApfWAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tcGF0aWJsZUtleXM7XG4gIH1cblxuICAvKipcbiAgICogUmUtY2hlY2sgYWxsIGhvdGtleSBhY3RpdmUvcHJlc3NlZCBzdGF0ZXMgKHNpbmNlIG1vZGlmaWVyIGtleXMgbWlnaHQgaGF2ZSBjaGFuZ2VkLCBPUiB3ZSBuZWVkIHRvIHZhbGlkYXRlIHRoYXRcbiAgICogdGhlcmUgYXJlIG5vIGNvbmZsaWN0cykuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZUhvdGtleVN0YXR1cygga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwgKTogdm9pZCB7XG5cbiAgICAvLyBGb3IgZmlyZU9uRG93biBvbi9vZmYgY2FzZXMsIHdlIG9ubHkgd2FudCB0byBmaXJlIHRoZSBob3RrZXlzIHdoZW4gd2UgaGF2ZSBhIGtleWJvYXJkIGV2ZW50IHNwZWNpZnlpbmcgaG90a2V5J3NcbiAgICAvLyBtYWluIGBrZXlgLlxuICAgIGNvbnN0IHByZXNzZWRPclJlbGVhc2VkS2V5Q29kZSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBrZXlib2FyZEV2ZW50ICk7XG4gICAgY29uc3QgcHJlc3NlZE9yUmVsZWFzZWRFbmdsaXNoS2V5ID0gcHJlc3NlZE9yUmVsZWFzZWRLZXlDb2RlID8gZXZlbnRDb2RlVG9FbmdsaXNoU3RyaW5nKCBwcmVzc2VkT3JSZWxlYXNlZEtleUNvZGUgKSA6IG51bGw7XG5cbiAgICBmb3IgKCBjb25zdCBob3RrZXkgb2YgdGhpcy5lbmFibGVkSG90a2V5c1Byb3BlcnR5LnZhbHVlICkge1xuXG4gICAgICAvLyBBIGhvdGtleSBzaG91bGQgYmUgIGFjdGl2ZSBpZiBpdHMgbWFpbiBrZXkgaXMgcHJlc3NlZC4gSWYgaXQgd2FzIGludGVycnVwdGVkLCBpdCBjYW4gb25seSBiZWNvbWVcbiAgICAgIC8vIGFjdGl2ZSBhZ2FpbiBpZiB0aGVyZSB3YXMgYW4gYWN0dWFsIGtleSBwcmVzcyBldmVudCBmcm9tIHRoZSB1c2VyLiBJZiBhIEhvdGtleSBpcyBpbnRlcnJ1cHRlZCBkdXJpbmdcbiAgICAgIC8vIGEgcHJlc3MsIGl0IHNob3VsZCByZW1haW4gaW5hY3RpdmUgYW5kIGludGVycnVwdGVkIHVudGlsIHRoZSBORVhUIHByZXNzLlxuICAgICAgY29uc3Qga2V5ID0gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5rZXk7XG4gICAgICBjb25zdCBrZXlQcmVzc2VkID0gdGhpcy5nZXRIb3RrZXlzRm9yTWFpbktleSgga2V5ICkuaW5jbHVkZXMoIGhvdGtleSApO1xuICAgICAgY29uc3Qgbm90SW50ZXJydXB0ZWQgPSAhaG90a2V5LmludGVycnVwdGVkIHx8ICgga2V5Ym9hcmRFdmVudCAmJiBrZXlib2FyZEV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyApO1xuICAgICAgY29uc3Qgc2hvdWxkQmVBY3RpdmUgPSBrZXlQcmVzc2VkICYmIG5vdEludGVycnVwdGVkO1xuXG4gICAgICBjb25zdCBpc0FjdGl2ZSA9IHRoaXMuYWN0aXZlSG90a2V5cy5oYXMoIGhvdGtleSApO1xuXG4gICAgICBjb25zdCBkZXNjcmlwdG9yS2V5ID0gaG90a2V5LmtleURlc2NyaXB0b3JQcm9wZXJ0eS52YWx1ZS5rZXk7XG4gICAgICBpZiAoIHNob3VsZEJlQWN0aXZlICYmICFpc0FjdGl2ZSApIHtcbiAgICAgICAgdGhpcy5hZGRBY3RpdmVIb3RrZXkoIGhvdGtleSwga2V5Ym9hcmRFdmVudCwgZGVzY3JpcHRvcktleSA9PT0gcHJlc3NlZE9yUmVsZWFzZWRFbmdsaXNoS2V5ICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIXNob3VsZEJlQWN0aXZlICYmIGlzQWN0aXZlICkge1xuICAgICAgICB0aGlzLnJlbW92ZUFjdGl2ZUhvdGtleSggaG90a2V5LCBrZXlib2FyZEV2ZW50LCBkZXNjcmlwdG9yS2V5ID09PSBwcmVzc2VkT3JSZWxlYXNlZEVuZ2xpc2hLZXkgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSG90a2V5IG1hZGUgYWN0aXZlL3ByZXNzZWRcbiAgICovXG4gIHByaXZhdGUgYWRkQWN0aXZlSG90a2V5KCBob3RrZXk6IEhvdGtleSwga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIHRyaWdnZXJlZEZyb21QcmVzczogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLmFjdGl2ZUhvdGtleXMuYWRkKCBob3RrZXkgKTtcblxuICAgIGNvbnN0IHNob3VsZEZpcmUgPSB0cmlnZ2VyZWRGcm9tUHJlc3MgJiYgaG90a2V5LmZpcmVPbkRvd247XG4gICAgaG90a2V5Lm9uUHJlc3MoIGtleWJvYXJkRXZlbnQsIHNob3VsZEZpcmUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIb3RrZXkgbWFkZSBpbmFjdGl2ZS9yZWxlYXNlZC5cbiAgICovXG4gIHByaXZhdGUgcmVtb3ZlQWN0aXZlSG90a2V5KCBob3RrZXk6IEhvdGtleSwga2V5Ym9hcmRFdmVudDogS2V5Ym9hcmRFdmVudCB8IG51bGwsIHRyaWdnZXJlZEZyb21SZWxlYXNlOiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgLy8gUmVtb3ZlIGZyb20gYWN0aXZlSG90a2V5cyBiZWZvcmUgSG90a2V5Lm9uUmVsZWFzZSBzbyB0aGF0IHdlIGRvIG5vdCB0cnkgdG8gcmVtb3ZlIGl0IGFnYWluIGlmIHRoZXJlIGlzXG4gICAgLy8gcmUtZW50cmFuY3kuIFRoaXMgaXMgcG9zc2libGUgaWYgdGhlIHJlbGVhc2UgbGlzdGVuZXIgbW92ZXMgZm9jdXMgb3IgaW50ZXJydXB0cyBhIEhvdGtleS5cbiAgICB0aGlzLmFjdGl2ZUhvdGtleXMuZGVsZXRlKCBob3RrZXkgKTtcblxuICAgIGNvbnN0IHNob3VsZEZpcmUgPSB0cmlnZ2VyZWRGcm9tUmVsZWFzZSAmJiAhaG90a2V5LmZpcmVPbkRvd247XG4gICAgY29uc3QgaW50ZXJydXB0ZWQgPSAhdHJpZ2dlcmVkRnJvbVJlbGVhc2U7XG4gICAgaG90a2V5Lm9uUmVsZWFzZSgga2V5Ym9hcmRFdmVudCwgaW50ZXJydXB0ZWQsIHNob3VsZEZpcmUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgSG90a2V5LCByZW1vdmVzIHRoZSBIb3RrZXkgZnJvbSB0aGUgYWN0aXZlIHNldCB3aGVuIGl0IGlzIGludGVycnVwdGVkLiBUaGUgSG90a2V5IGNhbm5vdCBiZSBhY3RpdmVcbiAgICogYWdhaW4gaW4gdGhpcyBtYW5hZ2VyIHVudGlsIHRoZXJlIGlzIGFuIGFjdHVhbCBrZXkgcHJlc3MgZXZlbnQgZnJvbSB0aGUgdXNlci5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHRIb3RrZXkoIGhvdGtleTogSG90a2V5ICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGhvdGtleS5pc1ByZXNzZWRQcm9wZXJ0eS52YWx1ZSwgJ2hvdGtleSBtdXN0IGJlIHByZXNzZWQgdG8gYmUgaW50ZXJydXB0ZWQnICk7XG4gICAgdGhpcy5yZW1vdmVBY3RpdmVIb3RrZXkoIGhvdGtleSwgbnVsbCwgZmFsc2UgKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSG90a2V5TWFuYWdlcicsIEhvdGtleU1hbmFnZXIgKTtcblxuY29uc3QgaG90a2V5TWFuYWdlciA9IG5ldyBIb3RrZXlNYW5hZ2VyKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGhvdGtleU1hbmFnZXI7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIlRpbnlQcm9wZXJ0eSIsImV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyIsIkZvY3VzTWFuYWdlciIsImdsb2JhbEhvdGtleVJlZ2lzdHJ5IiwiZ2xvYmFsS2V5U3RhdGVUcmFja2VyIiwiS2V5Ym9hcmRVdGlscyIsIm1ldGFFbmdsaXNoS2V5cyIsInNjZW5lcnkiLCJhcnJheUNvbXBhcmF0b3IiLCJhIiwiYiIsImxlbmd0aCIsImV2ZXJ5IiwiZWxlbWVudCIsImluZGV4Iiwic2V0Q29tcGFyYXRvciIsInNpemUiLCJoYXMiLCJIb3RrZXlNYW5hZ2VyIiwidXBkYXRlSG90a2V5c0Zyb21JbnB1dExpc3RlbmVyQ2hhbmdlIiwibm9kZSIsInBkb21Gb2N1c1Byb3BlcnR5IiwidmFsdWUiLCJ0cmFpbCIsIm5vZGVzIiwiaW5jbHVkZXMiLCJhdmFpbGFibGVIb3RrZXlzUHJvcGVydHkiLCJyZWNvbXB1dGVEZXJpdmF0aW9uIiwiZ2V0SG90a2V5c0Zvck1haW5LZXkiLCJtYWluS2V5IiwiZW5nbGlzaEtleXNEb3duIiwiY29tcGF0aWJsZUtleXMiLCJlbmFibGVkSG90a2V5c1Byb3BlcnR5IiwiZmlsdGVyIiwiaG90a2V5Iiwia2V5Iiwia2V5RGVzY3JpcHRvclByb3BlcnR5IiwibW9kaWZpZXJLZXlzIiwibW9kaWZpZXJLZXkiLCJpZ25vcmVkTW9kaWZpZXJLZXlzIiwia2V5c1Byb3BlcnR5IiwiYXNzZXJ0IiwiY29uZmxpY3RpbmdLZXlzIiwiYWxsb3dPdmVybGFwIiwibWFwIiwiZ2V0SG90a2V5U3RyaW5nIiwidXBkYXRlSG90a2V5U3RhdHVzIiwia2V5Ym9hcmRFdmVudCIsInByZXNzZWRPclJlbGVhc2VkS2V5Q29kZSIsImdldEV2ZW50Q29kZSIsInByZXNzZWRPclJlbGVhc2VkRW5nbGlzaEtleSIsImtleVByZXNzZWQiLCJub3RJbnRlcnJ1cHRlZCIsImludGVycnVwdGVkIiwidHlwZSIsInNob3VsZEJlQWN0aXZlIiwiaXNBY3RpdmUiLCJhY3RpdmVIb3RrZXlzIiwiZGVzY3JpcHRvcktleSIsImFkZEFjdGl2ZUhvdGtleSIsInJlbW92ZUFjdGl2ZUhvdGtleSIsInRyaWdnZXJlZEZyb21QcmVzcyIsImFkZCIsInNob3VsZEZpcmUiLCJmaXJlT25Eb3duIiwib25QcmVzcyIsInRyaWdnZXJlZEZyb21SZWxlYXNlIiwiZGVsZXRlIiwib25SZWxlYXNlIiwiaW50ZXJydXB0SG90a2V5IiwiaXNQcmVzc2VkUHJvcGVydHkiLCJTZXQiLCJob3RrZXlzUHJvcGVydHkiLCJnbG9iYWxIb3RrZXlzIiwiZm9jdXMiLCJob3RrZXlzIiwic2xpY2UiLCJyZXZlcnNlIiwiaXNJbnB1dEVuYWJsZWQiLCJpbnB1dExpc3RlbmVycyIsImZvckVhY2giLCJsaXN0ZW5lciIsInB1c2giLCJfIiwidW5pcSIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5Iiwib25JbnB1dEVuYWJsZWRDaGFuZ2VkIiwibGluayIsIm9sZEZvY3VzIiwiaW5wdXRFbmFibGVkUHJvcGVydHkiLCJ1bmxpbmsiLCJsYXp5TGluayIsInJlYnVpbGRIb3RrZXlzIiwib3ZlcnJpZGRlbkhvdGtleVN0cmluZ3MiLCJlbmFibGVkSG90a2V5cyIsImVuYWJsZWRQcm9wZXJ0eSIsImhvdGtleUNhbm9uaWNhbFN0cmluZyIsInNvcnQiLCJqb2luIiwib3ZlcnJpZGUiLCJob3RrZXlSZWJ1aWxkTGlzdGVuZXJNYXAiLCJNYXAiLCJuZXdIb3RrZXlzIiwib2xkSG90a2V5cyIsImhvdGtleXNDaGFuZ2VkIiwiZ2V0Iiwic2V0IiwiZmxhdE1hcCIsImtleURvd25TdGF0ZUNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJnZXRFbmdsaXNoS2V5c0Rvd24iLCJlbmdsaXNoS2V5c0NoYW5nZWQiLCJmaXJlT25Ib2xkIiwiZmlyZU9uSG9sZFRpbWluZyIsImZpcmUiLCJyZWdpc3RlciIsImhvdGtleU1hbmFnZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBRUQsT0FBT0EscUJBQWlELHNDQUFzQztBQUM5RixPQUFPQyxrQkFBa0IsbUNBQW1DO0FBRTVELFNBQThDQyx3QkFBd0IsRUFBRUMsWUFBWSxFQUFFQyxvQkFBb0IsRUFBRUMscUJBQXFCLEVBQVVDLGFBQWEsRUFBRUMsZUFBZSxFQUFRQyxPQUFPLFFBQVEsZ0JBQWdC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