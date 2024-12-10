// Copyright 2017-2024, University of Colorado Boulder
/**
 * A listener for common button usage, providing the fire() method/callback and helpful properties. NOTE that it doesn't
 * need to be an actual button (or look like a button), this is useful whenever that type of "fire" behavior is helpful.
 *
 * For example usage, see scenery/examples/input.html. Usually you can just pass a fire callback and things work.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import { PressListener, scenery, SceneryEvent } from '../imports.js';
let FireListener = class FireListener extends PressListener {
    /**
   * Fires any associated button fire callback.
   *
   * NOTE: This is safe to call on the listener externally.
   */ fire(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('FireListener fire');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.firedEmitter.emit(event);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * Presses the button.
   *
   * NOTE: This is safe to call externally in order to attempt to start a press. fireListener.canPress( event ) can
   * be used to determine whether this will actually start a press.
   *
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   * @returns success - Returns whether the press was actually started
   */ press(event, targetNode, callback) {
        return super.press(event, targetNode, ()=>{
            // This function is only called on success
            if (this._fireOnDown) {
                this.fire(event);
            }
            if (this._timer) {
                this._timer.start();
            }
            callback && callback();
        });
    }
    /**
   * Releases the button.
   *
   * NOTE: This can be safely called externally in order to force a release of this button (no actual 'up' event is
   * needed). If the cancel/interrupt behavior is more preferable (will not fire the button), then call interrupt()
   * on this listener instead.
   *
   * @param [event] - scenery event if there was one
   * @param [callback] - called at the end of the release
   */ release(event, callback) {
        super.release(event, ()=>{
            // Notify after the rest of release is called in order to prevent it from triggering interrupt().
            const shouldFire = !this._fireOnDown && this.isHoveringProperty.value && !this.interrupted;
            if (this._timer) {
                this._timer.stop(shouldFire);
            } else if (shouldFire) {
                this.fire(event || null);
            }
            callback && callback();
        });
    }
    /**
   * Clicks the listener, pressing it and releasing it immediately. Part of the scenery input API, triggered from PDOM
   * events for accessibility.
   *
   * Click does not involve the FireListener timer because it is a discrete event that
   * presses and releases the listener immediately. This behavior is a limitation imposed
   * by screen reader technology. See PressListener.click for more information.
   *
   * NOTE: This can be safely called externally in order to click the listener, event is not required.
   * fireListener.canClick() can be used to determine if this will actually trigger a click.
   *
   * @param [event]
   * @param [callback] - called at the end of the click
   */ click(event, callback) {
        return super.click(event, ()=>{
            // don't click if listener was interrupted before this callback
            if (!this.interrupted) {
                this.fire(event);
            }
            callback && callback();
        });
    }
    /**
   * Interrupts the listener, releasing it (canceling behavior).
   *
   * This effectively releases/ends the press, and sets the `interrupted` flag to true while firing these events
   * so that code can determine whether a release/end happened naturally, or was canceled in some way.
   *
   * This can be called manually, but can also be called through node.interruptSubtreeInput().
   */ interrupt() {
        super.interrupt();
        this._timer && this._timer.stop(false); // Stop the timer, don't fire if we haven't already
    }
    dispose() {
        this.firedEmitter.dispose();
        this._timer && this._timer.dispose();
        super.dispose();
    }
    constructor(providedOptions){
        const options = optionize()({
            fire: _.noop,
            fireOnDown: false,
            fireOnHold: false,
            fireOnHoldDelay: 400,
            fireOnHoldInterval: 100,
            // phet-io
            tandem: Tandem.REQUIRED,
            // Though FireListener is not instrumented, declare these here to support properly passing this to children
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
        }, providedOptions);
        assert && assert(typeof options.fire === 'function', 'The fire callback should be a function');
        assert && assert(typeof options.fireOnDown === 'boolean', 'fireOnDown should be a boolean');
        // @ts-expect-error TODO see https://github.com/phetsims/phet-core/issues/128
        super(options);
        this._fireOnDown = options.fireOnDown;
        this.firedEmitter = new Emitter({
            tandem: options.tandem.createTandem('firedEmitter'),
            phetioEventType: EventType.USER,
            phetioReadOnly: options.phetioReadOnly,
            phetioDocumentation: 'Emits at the time that the listener fires',
            parameters: [
                {
                    name: 'event',
                    phetioType: NullableIO(SceneryEvent.SceneryEventIO)
                }
            ]
        });
        // @ts-expect-error TODO Emitter https://github.com/phetsims/scenery/issues/1581
        this.firedEmitter.addListener(options.fire);
        // Create a timer to handle the optional fire-on-hold feature.
        // When that feature is enabled, calling this.fire is delegated to the timer.
        if (options.fireOnHold) {
            this._timer = new CallbackTimer({
                callback: this.fire.bind(this, null),
                delay: options.fireOnHoldDelay,
                interval: options.fireOnHoldInterval
            });
        }
    }
};
export { FireListener as default };
scenery.register('FireListener', FireListener);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0ZpcmVMaXN0ZW5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGxpc3RlbmVyIGZvciBjb21tb24gYnV0dG9uIHVzYWdlLCBwcm92aWRpbmcgdGhlIGZpcmUoKSBtZXRob2QvY2FsbGJhY2sgYW5kIGhlbHBmdWwgcHJvcGVydGllcy4gTk9URSB0aGF0IGl0IGRvZXNuJ3RcbiAqIG5lZWQgdG8gYmUgYW4gYWN0dWFsIGJ1dHRvbiAob3IgbG9vayBsaWtlIGEgYnV0dG9uKSwgdGhpcyBpcyB1c2VmdWwgd2hlbmV2ZXIgdGhhdCB0eXBlIG9mIFwiZmlyZVwiIGJlaGF2aW9yIGlzIGhlbHBmdWwuXG4gKlxuICogRm9yIGV4YW1wbGUgdXNhZ2UsIHNlZSBzY2VuZXJ5L2V4YW1wbGVzL2lucHV0Lmh0bWwuIFVzdWFsbHkgeW91IGNhbiBqdXN0IHBhc3MgYSBmaXJlIGNhbGxiYWNrIGFuZCB0aGluZ3Mgd29yay5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IENhbGxiYWNrVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9DYWxsYmFja1RpbWVyLmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IHsgTm9kZSwgUHJlc3NMaXN0ZW5lciwgUHJlc3NMaXN0ZW5lck9wdGlvbnMsIHNjZW5lcnksIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgLy8gQ2FsbGVkIGFzIGZpcmUoKSB3aGVuIHRoZSBidXR0b24gaXMgZmlyZWQuXG4gIGZpcmU/OiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQgfCBGb2N1c0V2ZW50IHwgS2V5Ym9hcmRFdmVudD4gKSA9PiB2b2lkO1xuXG4gIC8vIElmIHRydWUsIHRoZSBidXR0b24gd2lsbCBmaXJlIHdoZW4gdGhlIGJ1dHRvbiBpcyBwcmVzc2VkLiBJZiBmYWxzZSwgdGhlIGJ1dHRvbiB3aWxsIGZpcmUgd2hlbiB0aGVcbiAgLy8gYnV0dG9uIGlzIHJlbGVhc2VkIHdoaWxlIHRoZSBwb2ludGVyIGlzIG92ZXIgdGhlIGJ1dHRvbi5cbiAgZmlyZU9uRG93bj86IGJvb2xlYW47XG5cbiAgLy8gZmlyZS1vbi1ob2xkIGZlYXR1cmUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTAwNFxuICAvLyBUT0RPOiB0aGVzZSBvcHRpb25zIGFyZSBub3Qgc3VwcG9ydGVkIHdpdGggUERPTSBpbnRlcmFjdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTE3XG4gIGZpcmVPbkhvbGQ/OiBib29sZWFuOyAvLyBpcyB0aGUgZmlyZS1vbi1ob2xkIGZlYXR1cmUgZW5hYmxlZD9cbiAgZmlyZU9uSG9sZERlbGF5PzogbnVtYmVyOyAvLyBzdGFydCB0byBmaXJlIGNvbnRpbnVvdXNseSBhZnRlciBwcmVzc2luZyBmb3IgdGhpcyBsb25nIChtaWxsaXNlY29uZHMpXG4gIGZpcmVPbkhvbGRJbnRlcnZhbD86IG51bWJlcjsgLy8gZmlyZSBjb250aW51b3VzbHkgYXQgdGhpcyBpbnRlcnZhbCAobWlsbGlzZWNvbmRzKVxufTtcblxuZXhwb3J0IHR5cGUgRmlyZUxpc3RlbmVyT3B0aW9uczxMaXN0ZW5lciBleHRlbmRzIEZpcmVMaXN0ZW5lcj4gPSBTZWxmT3B0aW9ucyAmIFByZXNzTGlzdGVuZXJPcHRpb25zPExpc3RlbmVyPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlyZUxpc3RlbmVyIGV4dGVuZHMgUHJlc3NMaXN0ZW5lciBpbXBsZW1lbnRzIFRJbnB1dExpc3RlbmVyIHtcblxuICBwcml2YXRlIF9maXJlT25Eb3duOiBib29sZWFuO1xuICBwcml2YXRlIGZpcmVkRW1pdHRlcjogVEVtaXR0ZXI8WyBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQgfCBGb2N1c0V2ZW50IHwgS2V5Ym9hcmRFdmVudD4gfCBudWxsIF0+O1xuICBwcml2YXRlIF90aW1lcj86IENhbGxiYWNrVGltZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBGaXJlTGlzdGVuZXJPcHRpb25zPEZpcmVMaXN0ZW5lcj4gKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGaXJlTGlzdGVuZXJPcHRpb25zPEZpcmVMaXN0ZW5lcj4sIFNlbGZPcHRpb25zLCBQcmVzc0xpc3RlbmVyT3B0aW9uczxGaXJlTGlzdGVuZXI+PigpKCB7XG4gICAgICBmaXJlOiBfLm5vb3AsXG4gICAgICBmaXJlT25Eb3duOiBmYWxzZSxcbiAgICAgIGZpcmVPbkhvbGQ6IGZhbHNlLFxuICAgICAgZmlyZU9uSG9sZERlbGF5OiA0MDAsXG4gICAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDEwMCxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG5cbiAgICAgIC8vIFRob3VnaCBGaXJlTGlzdGVuZXIgaXMgbm90IGluc3RydW1lbnRlZCwgZGVjbGFyZSB0aGVzZSBoZXJlIHRvIHN1cHBvcnQgcHJvcGVybHkgcGFzc2luZyB0aGlzIHRvIGNoaWxkcmVuXG4gICAgICBwaGV0aW9SZWFkT25seTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9SZWFkT25seVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuZmlyZSA9PT0gJ2Z1bmN0aW9uJywgJ1RoZSBmaXJlIGNhbGxiYWNrIHNob3VsZCBiZSBhIGZ1bmN0aW9uJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBvcHRpb25zLmZpcmVPbkRvd24gPT09ICdib29sZWFuJywgJ2ZpcmVPbkRvd24gc2hvdWxkIGJlIGEgYm9vbGVhbicgKTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4XG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuX2ZpcmVPbkRvd24gPSBvcHRpb25zLmZpcmVPbkRvd247XG5cbiAgICB0aGlzLmZpcmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50IHwgRm9jdXNFdmVudCB8IEtleWJvYXJkRXZlbnQ+IHwgbnVsbCBdPigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdmaXJlZEVtaXR0ZXInICksXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgYXQgdGhlIHRpbWUgdGhhdCB0aGUgbGlzdGVuZXIgZmlyZXMnLFxuICAgICAgcGFyYW1ldGVyczogWyB7XG4gICAgICAgIG5hbWU6ICdldmVudCcsXG4gICAgICAgIHBoZXRpb1R5cGU6IE51bGxhYmxlSU8oIFNjZW5lcnlFdmVudC5TY2VuZXJ5RXZlbnRJTyApXG4gICAgICB9IF1cbiAgICB9ICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPIEVtaXR0ZXIgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLmZpcmVkRW1pdHRlci5hZGRMaXN0ZW5lciggb3B0aW9ucy5maXJlICk7XG5cbiAgICAvLyBDcmVhdGUgYSB0aW1lciB0byBoYW5kbGUgdGhlIG9wdGlvbmFsIGZpcmUtb24taG9sZCBmZWF0dXJlLlxuICAgIC8vIFdoZW4gdGhhdCBmZWF0dXJlIGlzIGVuYWJsZWQsIGNhbGxpbmcgdGhpcy5maXJlIGlzIGRlbGVnYXRlZCB0byB0aGUgdGltZXIuXG4gICAgaWYgKCBvcHRpb25zLmZpcmVPbkhvbGQgKSB7XG4gICAgICB0aGlzLl90aW1lciA9IG5ldyBDYWxsYmFja1RpbWVyKCB7XG4gICAgICAgIGNhbGxiYWNrOiB0aGlzLmZpcmUuYmluZCggdGhpcywgbnVsbCApLCAvLyBQYXNzIG51bGwgZm9yIGZpcmUtb24taG9sZCBldmVudHNcbiAgICAgICAgZGVsYXk6IG9wdGlvbnMuZmlyZU9uSG9sZERlbGF5LFxuICAgICAgICBpbnRlcnZhbDogb3B0aW9ucy5maXJlT25Ib2xkSW50ZXJ2YWxcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmlyZXMgYW55IGFzc29jaWF0ZWQgYnV0dG9uIGZpcmUgY2FsbGJhY2suXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgaXMgc2FmZSB0byBjYWxsIG9uIHRoZSBsaXN0ZW5lciBleHRlcm5hbGx5LlxuICAgKi9cbiAgcHVibGljIGZpcmUoIGV2ZW50OiBTY2VuZXJ5RXZlbnQ8TW91c2VFdmVudCB8IFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQgfCBGb2N1c0V2ZW50IHwgS2V5Ym9hcmRFdmVudD4gfCBudWxsICk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0ZpcmVMaXN0ZW5lciBmaXJlJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5maXJlZEVtaXR0ZXIuZW1pdCggZXZlbnQgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUHJlc3NlcyB0aGUgYnV0dG9uLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIHNhZmUgdG8gY2FsbCBleHRlcm5hbGx5IGluIG9yZGVyIHRvIGF0dGVtcHQgdG8gc3RhcnQgYSBwcmVzcy4gZmlyZUxpc3RlbmVyLmNhblByZXNzKCBldmVudCApIGNhblxuICAgKiBiZSB1c2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgd2lsbCBhY3R1YWxseSBzdGFydCBhIHByZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIFt0YXJnZXROb2RlXSAtIElmIHByb3ZpZGVkLCB3aWxsIHRha2UgdGhlIHBsYWNlIG9mIHRoZSB0YXJnZXROb2RlIGZvciB0aGlzIGNhbGwuIFVzZWZ1bCBmb3JcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3J3YXJkZWQgcHJlc3Nlcy5cbiAgICogQHBhcmFtIFtjYWxsYmFja10gLSB0byBiZSBydW4gYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24sIGJ1dCBvbmx5IG9uIHN1Y2Nlc3NcbiAgICogQHJldHVybnMgc3VjY2VzcyAtIFJldHVybnMgd2hldGhlciB0aGUgcHJlc3Mgd2FzIGFjdHVhbGx5IHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBwcmVzcyggZXZlbnQ6IFNjZW5lcnlFdmVudDxNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCB8IFBvaW50ZXJFdmVudCB8IEZvY3VzRXZlbnQgfCBLZXlib2FyZEV2ZW50PiwgdGFyZ2V0Tm9kZT86IE5vZGUsIGNhbGxiYWNrPzogKCkgPT4gdm9pZCApOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3VwZXIucHJlc3MoIGV2ZW50LCB0YXJnZXROb2RlLCAoKSA9PiB7XG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIG9uIHN1Y2Nlc3NcbiAgICAgIGlmICggdGhpcy5fZmlyZU9uRG93biApIHtcbiAgICAgICAgdGhpcy5maXJlKCBldmVudCApO1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLl90aW1lciApIHtcbiAgICAgICAgdGhpcy5fdGltZXIuc3RhcnQoKTtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSBidXR0b24uXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIHNhZmVseSBjYWxsZWQgZXh0ZXJuYWxseSBpbiBvcmRlciB0byBmb3JjZSBhIHJlbGVhc2Ugb2YgdGhpcyBidXR0b24gKG5vIGFjdHVhbCAndXAnIGV2ZW50IGlzXG4gICAqIG5lZWRlZCkuIElmIHRoZSBjYW5jZWwvaW50ZXJydXB0IGJlaGF2aW9yIGlzIG1vcmUgcHJlZmVyYWJsZSAod2lsbCBub3QgZmlyZSB0aGUgYnV0dG9uKSwgdGhlbiBjYWxsIGludGVycnVwdCgpXG4gICAqIG9uIHRoaXMgbGlzdGVuZXIgaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIFtldmVudF0gLSBzY2VuZXJ5IGV2ZW50IGlmIHRoZXJlIHdhcyBvbmVcbiAgICogQHBhcmFtIFtjYWxsYmFja10gLSBjYWxsZWQgYXQgdGhlIGVuZCBvZiB0aGUgcmVsZWFzZVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHJlbGVhc2UoIGV2ZW50PzogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50IHwgRm9jdXNFdmVudCB8IEtleWJvYXJkRXZlbnQ+LCBjYWxsYmFjaz86ICgpID0+IHZvaWQgKTogdm9pZCB7XG4gICAgc3VwZXIucmVsZWFzZSggZXZlbnQsICgpID0+IHtcbiAgICAgIC8vIE5vdGlmeSBhZnRlciB0aGUgcmVzdCBvZiByZWxlYXNlIGlzIGNhbGxlZCBpbiBvcmRlciB0byBwcmV2ZW50IGl0IGZyb20gdHJpZ2dlcmluZyBpbnRlcnJ1cHQoKS5cbiAgICAgIGNvbnN0IHNob3VsZEZpcmUgPSAhdGhpcy5fZmlyZU9uRG93biAmJiB0aGlzLmlzSG92ZXJpbmdQcm9wZXJ0eS52YWx1ZSAmJiAhdGhpcy5pbnRlcnJ1cHRlZDtcbiAgICAgIGlmICggdGhpcy5fdGltZXIgKSB7XG4gICAgICAgIHRoaXMuX3RpbWVyLnN0b3AoIHNob3VsZEZpcmUgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBzaG91bGRGaXJlICkge1xuICAgICAgICB0aGlzLmZpcmUoIGV2ZW50IHx8IG51bGwgKTtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENsaWNrcyB0aGUgbGlzdGVuZXIsIHByZXNzaW5nIGl0IGFuZCByZWxlYXNpbmcgaXQgaW1tZWRpYXRlbHkuIFBhcnQgb2YgdGhlIHNjZW5lcnkgaW5wdXQgQVBJLCB0cmlnZ2VyZWQgZnJvbSBQRE9NXG4gICAqIGV2ZW50cyBmb3IgYWNjZXNzaWJpbGl0eS5cbiAgICpcbiAgICogQ2xpY2sgZG9lcyBub3QgaW52b2x2ZSB0aGUgRmlyZUxpc3RlbmVyIHRpbWVyIGJlY2F1c2UgaXQgaXMgYSBkaXNjcmV0ZSBldmVudCB0aGF0XG4gICAqIHByZXNzZXMgYW5kIHJlbGVhc2VzIHRoZSBsaXN0ZW5lciBpbW1lZGlhdGVseS4gVGhpcyBiZWhhdmlvciBpcyBhIGxpbWl0YXRpb24gaW1wb3NlZFxuICAgKiBieSBzY3JlZW4gcmVhZGVyIHRlY2hub2xvZ3kuIFNlZSBQcmVzc0xpc3RlbmVyLmNsaWNrIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGNhbiBiZSBzYWZlbHkgY2FsbGVkIGV4dGVybmFsbHkgaW4gb3JkZXIgdG8gY2xpY2sgdGhlIGxpc3RlbmVyLCBldmVudCBpcyBub3QgcmVxdWlyZWQuXG4gICAqIGZpcmVMaXN0ZW5lci5jYW5DbGljaygpIGNhbiBiZSB1c2VkIHRvIGRldGVybWluZSBpZiB0aGlzIHdpbGwgYWN0dWFsbHkgdHJpZ2dlciBhIGNsaWNrLlxuICAgKlxuICAgKiBAcGFyYW0gW2V2ZW50XVxuICAgKiBAcGFyYW0gW2NhbGxiYWNrXSAtIGNhbGxlZCBhdCB0aGUgZW5kIG9mIHRoZSBjbGlja1xuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNsaWNrKCBldmVudDogU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQ+IHwgbnVsbCwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzdXBlci5jbGljayggZXZlbnQsICgpID0+IHtcblxuICAgICAgLy8gZG9uJ3QgY2xpY2sgaWYgbGlzdGVuZXIgd2FzIGludGVycnVwdGVkIGJlZm9yZSB0aGlzIGNhbGxiYWNrXG4gICAgICBpZiAoICF0aGlzLmludGVycnVwdGVkICkge1xuICAgICAgICB0aGlzLmZpcmUoIGV2ZW50ICk7XG4gICAgICB9XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcnJ1cHRzIHRoZSBsaXN0ZW5lciwgcmVsZWFzaW5nIGl0IChjYW5jZWxpbmcgYmVoYXZpb3IpLlxuICAgKlxuICAgKiBUaGlzIGVmZmVjdGl2ZWx5IHJlbGVhc2VzL2VuZHMgdGhlIHByZXNzLCBhbmQgc2V0cyB0aGUgYGludGVycnVwdGVkYCBmbGFnIHRvIHRydWUgd2hpbGUgZmlyaW5nIHRoZXNlIGV2ZW50c1xuICAgKiBzbyB0aGF0IGNvZGUgY2FuIGRldGVybWluZSB3aGV0aGVyIGEgcmVsZWFzZS9lbmQgaGFwcGVuZWQgbmF0dXJhbGx5LCBvciB3YXMgY2FuY2VsZWQgaW4gc29tZSB3YXkuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBtYW51YWxseSwgYnV0IGNhbiBhbHNvIGJlIGNhbGxlZCB0aHJvdWdoIG5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCkuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaW50ZXJydXB0KCk6IHZvaWQge1xuICAgIHN1cGVyLmludGVycnVwdCgpO1xuXG4gICAgdGhpcy5fdGltZXIgJiYgdGhpcy5fdGltZXIuc3RvcCggZmFsc2UgKTsgLy8gU3RvcCB0aGUgdGltZXIsIGRvbid0IGZpcmUgaWYgd2UgaGF2ZW4ndCBhbHJlYWR5XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZpcmVkRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fdGltZXIgJiYgdGhpcy5fdGltZXIuZGlzcG9zZSgpO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdGaXJlTGlzdGVuZXInLCBGaXJlTGlzdGVuZXIgKTsiXSwibmFtZXMiOlsiQ2FsbGJhY2tUaW1lciIsIkVtaXR0ZXIiLCJvcHRpb25pemUiLCJFdmVudFR5cGUiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJOdWxsYWJsZUlPIiwiUHJlc3NMaXN0ZW5lciIsInNjZW5lcnkiLCJTY2VuZXJ5RXZlbnQiLCJGaXJlTGlzdGVuZXIiLCJmaXJlIiwiZXZlbnQiLCJzY2VuZXJ5TG9nIiwiSW5wdXRMaXN0ZW5lciIsInB1c2giLCJmaXJlZEVtaXR0ZXIiLCJlbWl0IiwicG9wIiwicHJlc3MiLCJ0YXJnZXROb2RlIiwiY2FsbGJhY2siLCJfZmlyZU9uRG93biIsIl90aW1lciIsInN0YXJ0IiwicmVsZWFzZSIsInNob3VsZEZpcmUiLCJpc0hvdmVyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsImludGVycnVwdGVkIiwic3RvcCIsImNsaWNrIiwiaW50ZXJydXB0IiwiZGlzcG9zZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJfIiwibm9vcCIsImZpcmVPbkRvd24iLCJmaXJlT25Ib2xkIiwiZmlyZU9uSG9sZERlbGF5IiwiZmlyZU9uSG9sZEludGVydmFsIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9SZWFkT25seSIsIkRFRkFVTFRfT1BUSU9OUyIsImFzc2VydCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGFyYW1ldGVycyIsIm5hbWUiLCJwaGV0aW9UeXBlIiwiU2NlbmVyeUV2ZW50SU8iLCJhZGRMaXN0ZW5lciIsImJpbmQiLCJkZWxheSIsImludGVydmFsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EsbUJBQW1CLG9DQUFvQztBQUM5RCxPQUFPQyxhQUFhLDhCQUE4QjtBQUVsRCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLGdCQUFnQix5Q0FBeUM7QUFDaEUsU0FBZUMsYUFBYSxFQUF3QkMsT0FBTyxFQUFFQyxZQUFZLFFBQXdCLGdCQUFnQjtBQW1CbEcsSUFBQSxBQUFNQyxlQUFOLE1BQU1BLHFCQUFxQkg7SUFxRHhDOzs7O0dBSUMsR0FDRCxB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