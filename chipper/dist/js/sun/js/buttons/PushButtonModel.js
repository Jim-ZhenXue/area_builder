// Copyright 2014-2024, University of Colorado Boulder
/**
 * Basic model for a push button, including over/down/enabled properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import CallbackTimer from '../../../axon/js/CallbackTimer.js';
import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
let PushButtonModel = class PushButtonModel extends ButtonModel {
    dispose() {
        this.disposePushButtonModel();
        super.dispose();
    }
    /**
   * Adds a listener. If already a listener, this is a no-op.
   * @param listener - function called when the button is pressed, no args
   */ addListener(listener) {
        this.firedEmitter.addListener(listener);
    }
    /**
   * Removes a listener. If not a listener, this is a no-op.
   */ removeListener(listener) {
        this.firedEmitter.removeListener(listener);
    }
    /**
   * Fires all listeners.  Public for phet-io and a11y use.
   */ fire() {
        // Make sure the button is not already firing, see https://github.com/phetsims/energy-skate-park-basics/issues/380
        assert && assert(!this.isFiringProperty.value, 'Cannot fire when already firing');
        this.isFiringProperty.value = true;
        this.firedEmitter.emit();
        this.isFiringProperty.value = false;
    }
    constructor(providedOptions){
        const options = optionize()({
            fireOnDown: false,
            listener: null,
            interruptListener: null,
            fireOnHold: false,
            fireOnHoldDelay: 400,
            fireOnHoldInterval: 100,
            tandem: Tandem.REQUIRED,
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
        }, providedOptions);
        super(options), // the event that kicked off the latest fire (including delayed fire-on-hold cases)
        this.startEvent = null;
        this.isFiringProperty = new BooleanProperty(false);
        this.firedEmitter = new Emitter({
            tandem: options.tandem.createTandem('firedEmitter'),
            phetioDocumentation: 'Emits when the button is fired',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER,
            // Order dependencies, so that we can fire our interruptListener before any other listeners without having to
            // create and maintain other emitters.
            hasListenerOrderDependencies: true
        });
        if (options.interruptListener) {
            this.firedEmitter.addListener(()=>{
                options.interruptListener(this.startEvent);
            });
        }
        if (options.listener !== null) {
            this.firedEmitter.addListener(options.listener);
        }
        // Create a timer to handle the optional fire-on-hold feature.
        // When that feature is enabled, calling this.fire is delegated to the timer.
        if (options.fireOnHold) {
            this.timer = new CallbackTimer({
                callback: this.fire.bind(this),
                delay: options.fireOnHoldDelay,
                interval: options.fireOnHoldInterval
            });
        }
        // Point down
        const downPropertyObserver = (down)=>{
            if (down) {
                if (this.enabledProperty.get()) {
                    var _window_phet_joist_display__input, _window_phet_joist_display, _window_phet_joist, _window_phet;
                    this.startEvent = ((_window_phet = window.phet) == null ? void 0 : (_window_phet_joist = _window_phet.joist) == null ? void 0 : (_window_phet_joist_display = _window_phet_joist.display) == null ? void 0 : (_window_phet_joist_display__input = _window_phet_joist_display._input) == null ? void 0 : _window_phet_joist_display__input.currentSceneryEvent) || null;
                    if (options.fireOnDown) {
                        this.fire();
                    }
                    if (this.timer) {
                        this.timer.start();
                    }
                    if (options.fireOnDown || this.timer) {
                        this.produceSoundEmitter.emit();
                    }
                }
            } else {
                // should the button fire?
                const fire = !options.fireOnDown && (this.overProperty.get() || this.focusedProperty.get()) && this.enabledProperty.get() && !this.interrupted;
                if (this.timer) {
                    this.timer.stop(fire);
                } else if (fire) {
                    // Produce sound before firing, in case firing causes the disposal of this PushButtonModel
                    this.produceSoundEmitter.emit();
                    this.fire();
                }
            }
        };
        this.downProperty.link(downPropertyObserver);
        // Stop the timer when the button is disabled.
        const enabledPropertyObserver = (enabled)=>{
            if (!enabled && this.timer) {
                this.timer.stop(false); // Stop the timer, don't fire if we haven't already
            }
        };
        this.enabledProperty.link(enabledPropertyObserver);
        this.disposePushButtonModel = ()=>{
            // If the button was firing, we must complete the PhET-iO transaction before disposing.
            // see https://github.com/phetsims/energy-skate-park-basics/issues/380
            this.isFiringProperty.value = false;
            this.isFiringProperty.dispose();
            this.firedEmitter.dispose();
            this.downProperty.unlink(downPropertyObserver);
            this.enabledProperty.unlink(enabledPropertyObserver);
            if (this.timer) {
                this.timer.dispose();
                this.timer = null;
            }
        };
    }
};
export { PushButtonModel as default };
sun.register('PushButtonModel', PushButtonModel);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1B1c2hCdXR0b25Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCYXNpYyBtb2RlbCBmb3IgYSBwdXNoIGJ1dHRvbiwgaW5jbHVkaW5nIG92ZXIvZG93bi9lbmFibGVkIHByb3BlcnRpZXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IENhbGxiYWNrVGltZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9DYWxsYmFja1RpbWVyLmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcbmltcG9ydCBCdXR0b25Nb2RlbCwgeyBCdXR0b25Nb2RlbE9wdGlvbnMgfSBmcm9tICcuL0J1dHRvbk1vZGVsLmpzJztcblxuZXhwb3J0IHR5cGUgUHVzaEJ1dHRvbkxpc3RlbmVyID0gKCkgPT4gdm9pZDtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyB0cnVlOiBmaXJlIG9uIHBvaW50ZXIgZG93bjsgZmFsc2U6IGZpcmUgb24gcG9pbnRlciB1cCBpZiBwb2ludGVyIGlzIG92ZXIgYnV0dG9uXG4gIGZpcmVPbkRvd24/OiBib29sZWFuO1xuXG4gIC8vIGNvbnZlbmllbmNlIGZvciBhZGRpbmcgMSBsaXN0ZW5lciwgbm8gYXJnc1xuICBsaXN0ZW5lcj86IFB1c2hCdXR0b25MaXN0ZW5lciB8IG51bGw7XG5cbiAgLy8gYSBsaXN0ZW5lciB0aGF0IGdldHMgZmlyZWQgYmVmb3JlIG90aGVyIGxpc3RlbmVycyBvbiB0aGlzIGJ1dHRvbiwgd2l0aCB0aGUgZXhwcmVzcyBwdXJwb3NlIG9mIGp1c3QgaW50ZXJydXB0aW5nXG4gIC8vIG90aGVyIGlucHV0L3BvaW50ZXJzIGZvciBiZXR0ZXIgbXVsdGktdG91Y2ggc3VwcG9ydC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg1OFxuICBpbnRlcnJ1cHRMaXN0ZW5lcj86ICggKCBldmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCApID0+IHZvaWQgKSB8IG51bGw7XG5cbiAgLy8gZmlyZS1vbi1ob2xkIGZlYXR1cmVcbiAgLy8gVE9ETzogdGhlc2Ugb3B0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCB3aXRoIFBET00gaW50ZXJhY3Rpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTExN1xuICBmaXJlT25Ib2xkPzogYm9vbGVhbjsgLy8gaXMgdGhlIGZpcmUtb24taG9sZCBmZWF0dXJlIGVuYWJsZWQ/XG4gIGZpcmVPbkhvbGREZWxheT86IG51bWJlcjsgLy8gc3RhcnQgdG8gZmlyZSBjb250aW51b3VzbHkgYWZ0ZXIgcHJlc3NpbmcgZm9yIHRoaXMgbG9uZyAobWlsbGlzZWNvbmRzKVxuICBmaXJlT25Ib2xkSW50ZXJ2YWw/OiBudW1iZXI7IC8vIGZpcmUgY29udGludW91c2x5IGF0IHRoaXMgaW50ZXJ2YWwgKG1pbGxpc2Vjb25kcyksIHNhbWUgZGVmYXVsdCBhcyBpbiBCdXR0b25Nb2RlbFxuXG4gIC8vIHRvIHN1cHBvcnQgcHJvcGVybHkgcGFzc2luZyB0aGlzIHRvIGNoaWxkcmVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvNjBcbiAgcGhldGlvUmVhZE9ubHk/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgUHVzaEJ1dHRvbk1vZGVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQnV0dG9uTW9kZWxPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQdXNoQnV0dG9uTW9kZWwgZXh0ZW5kcyBCdXR0b25Nb2RlbCB7XG5cbiAgLy8gdXNlZCBieSBSZXNldEFsbEJ1dHRvbiB0byBjYWxsIGZ1bmN0aW9ucyBkdXJpbmcgcmVzZXQgc3RhcnQvZW5kXG4gIHB1YmxpYyByZWFkb25seSBpc0ZpcmluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBzZW5kcyBvdXQgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBidXR0b24gaXMgcmVsZWFzZWQuXG4gIHByaXZhdGUgcmVhZG9ubHkgZmlyZWRFbWl0dGVyOiBURW1pdHRlcjtcblxuICBwcml2YXRlIHRpbWVyPzogQ2FsbGJhY2tUaW1lciB8IG51bGw7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUHVzaEJ1dHRvbk1vZGVsOiAoKSA9PiB2b2lkO1xuXG4gIC8vIHRoZSBldmVudCB0aGF0IGtpY2tlZCBvZmYgdGhlIGxhdGVzdCBmaXJlIChpbmNsdWRpbmcgZGVsYXllZCBmaXJlLW9uLWhvbGQgY2FzZXMpXG4gIHByaXZhdGUgc3RhcnRFdmVudDogU2NlbmVyeUV2ZW50IHwgbnVsbCA9IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBQdXNoQnV0dG9uTW9kZWxPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQdXNoQnV0dG9uTW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgQnV0dG9uTW9kZWxPcHRpb25zPigpKCB7XG5cbiAgICAgIGZpcmVPbkRvd246IGZhbHNlLFxuICAgICAgbGlzdGVuZXI6IG51bGwsXG4gICAgICBpbnRlcnJ1cHRMaXN0ZW5lcjogbnVsbCxcbiAgICAgIGZpcmVPbkhvbGQ6IGZhbHNlLFxuICAgICAgZmlyZU9uSG9sZERlbGF5OiA0MDAsXG4gICAgICBmaXJlT25Ib2xkSW50ZXJ2YWw6IDEwMCxcblxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICBwaGV0aW9SZWFkT25seTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9SZWFkT25seVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuaXNGaXJpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICB0aGlzLmZpcmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVkRW1pdHRlcicgKSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBidXR0b24gaXMgZmlyZWQnLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9wdGlvbnMucGhldGlvUmVhZE9ubHksXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuXG4gICAgICAvLyBPcmRlciBkZXBlbmRlbmNpZXMsIHNvIHRoYXQgd2UgY2FuIGZpcmUgb3VyIGludGVycnVwdExpc3RlbmVyIGJlZm9yZSBhbnkgb3RoZXIgbGlzdGVuZXJzIHdpdGhvdXQgaGF2aW5nIHRvXG4gICAgICAvLyBjcmVhdGUgYW5kIG1haW50YWluIG90aGVyIGVtaXR0ZXJzLlxuICAgICAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogdHJ1ZVxuICAgIH0gKTtcblxuICAgIGlmICggb3B0aW9ucy5pbnRlcnJ1cHRMaXN0ZW5lciApIHtcbiAgICAgIHRoaXMuZmlyZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICAgIG9wdGlvbnMuaW50ZXJydXB0TGlzdGVuZXIhKCB0aGlzLnN0YXJ0RXZlbnQgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBpZiAoIG9wdGlvbnMubGlzdGVuZXIgIT09IG51bGwgKSB7XG4gICAgICB0aGlzLmZpcmVkRW1pdHRlci5hZGRMaXN0ZW5lciggb3B0aW9ucy5saXN0ZW5lciApO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIHRpbWVyIHRvIGhhbmRsZSB0aGUgb3B0aW9uYWwgZmlyZS1vbi1ob2xkIGZlYXR1cmUuXG4gICAgLy8gV2hlbiB0aGF0IGZlYXR1cmUgaXMgZW5hYmxlZCwgY2FsbGluZyB0aGlzLmZpcmUgaXMgZGVsZWdhdGVkIHRvIHRoZSB0aW1lci5cbiAgICBpZiAoIG9wdGlvbnMuZmlyZU9uSG9sZCApIHtcbiAgICAgIHRoaXMudGltZXIgPSBuZXcgQ2FsbGJhY2tUaW1lcigge1xuICAgICAgICBjYWxsYmFjazogdGhpcy5maXJlLmJpbmQoIHRoaXMgKSxcbiAgICAgICAgZGVsYXk6IG9wdGlvbnMuZmlyZU9uSG9sZERlbGF5LFxuICAgICAgICBpbnRlcnZhbDogb3B0aW9ucy5maXJlT25Ib2xkSW50ZXJ2YWxcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBQb2ludCBkb3duXG4gICAgY29uc3QgZG93blByb3BlcnR5T2JzZXJ2ZXIgPSAoIGRvd246IGJvb2xlYW4gKSA9PiB7XG4gICAgICBpZiAoIGRvd24gKSB7XG4gICAgICAgIGlmICggdGhpcy5lbmFibGVkUHJvcGVydHkuZ2V0KCkgKSB7XG4gICAgICAgICAgdGhpcy5zdGFydEV2ZW50ID0gd2luZG93LnBoZXQ/LmpvaXN0Py5kaXNwbGF5Py5faW5wdXQ/LmN1cnJlbnRTY2VuZXJ5RXZlbnQgfHwgbnVsbDtcblxuICAgICAgICAgIGlmICggb3B0aW9ucy5maXJlT25Eb3duICkge1xuICAgICAgICAgICAgdGhpcy5maXJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggdGhpcy50aW1lciApIHtcbiAgICAgICAgICAgIHRoaXMudGltZXIuc3RhcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBvcHRpb25zLmZpcmVPbkRvd24gfHwgdGhpcy50aW1lciApIHtcbiAgICAgICAgICAgIHRoaXMucHJvZHVjZVNvdW5kRW1pdHRlci5lbWl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBzaG91bGQgdGhlIGJ1dHRvbiBmaXJlP1xuICAgICAgICBjb25zdCBmaXJlID0gKCAhb3B0aW9ucy5maXJlT25Eb3duICYmICggdGhpcy5vdmVyUHJvcGVydHkuZ2V0KCkgfHwgdGhpcy5mb2N1c2VkUHJvcGVydHkuZ2V0KCkgKSAmJiB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5pbnRlcnJ1cHRlZCApO1xuICAgICAgICBpZiAoIHRoaXMudGltZXIgKSB7XG4gICAgICAgICAgdGhpcy50aW1lci5zdG9wKCBmaXJlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGZpcmUgKSB7XG5cbiAgICAgICAgICAvLyBQcm9kdWNlIHNvdW5kIGJlZm9yZSBmaXJpbmcsIGluIGNhc2UgZmlyaW5nIGNhdXNlcyB0aGUgZGlzcG9zYWwgb2YgdGhpcyBQdXNoQnV0dG9uTW9kZWxcbiAgICAgICAgICB0aGlzLnByb2R1Y2VTb3VuZEVtaXR0ZXIuZW1pdCgpO1xuICAgICAgICAgIHRoaXMuZmlyZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmRvd25Qcm9wZXJ0eS5saW5rKCBkb3duUHJvcGVydHlPYnNlcnZlciApO1xuXG4gICAgLy8gU3RvcCB0aGUgdGltZXIgd2hlbiB0aGUgYnV0dG9uIGlzIGRpc2FibGVkLlxuICAgIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eU9ic2VydmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xuICAgICAgaWYgKCAhZW5hYmxlZCAmJiB0aGlzLnRpbWVyICkge1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoIGZhbHNlICk7IC8vIFN0b3AgdGhlIHRpbWVyLCBkb24ndCBmaXJlIGlmIHdlIGhhdmVuJ3QgYWxyZWFkeVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZFByb3BlcnR5T2JzZXJ2ZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVB1c2hCdXR0b25Nb2RlbCA9ICgpID0+IHtcblxuICAgICAgLy8gSWYgdGhlIGJ1dHRvbiB3YXMgZmlyaW5nLCB3ZSBtdXN0IGNvbXBsZXRlIHRoZSBQaEVULWlPIHRyYW5zYWN0aW9uIGJlZm9yZSBkaXNwb3NpbmcuXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrLWJhc2ljcy9pc3N1ZXMvMzgwXG4gICAgICB0aGlzLmlzRmlyaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNGaXJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmZpcmVkRW1pdHRlci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmRvd25Qcm9wZXJ0eS51bmxpbmsoIGRvd25Qcm9wZXJ0eU9ic2VydmVyICk7XG4gICAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRQcm9wZXJ0eU9ic2VydmVyICk7XG4gICAgICBpZiAoIHRoaXMudGltZXIgKSB7XG4gICAgICAgIHRoaXMudGltZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlUHVzaEJ1dHRvbk1vZGVsKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBsaXN0ZW5lci4gSWYgYWxyZWFkeSBhIGxpc3RlbmVyLCB0aGlzIGlzIGEgbm8tb3AuXG4gICAqIEBwYXJhbSBsaXN0ZW5lciAtIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBidXR0b24gaXMgcHJlc3NlZCwgbm8gYXJnc1xuICAgKi9cbiAgcHVibGljIGFkZExpc3RlbmVyKCBsaXN0ZW5lcjogUHVzaEJ1dHRvbkxpc3RlbmVyICk6IHZvaWQge1xuICAgIHRoaXMuZmlyZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci4gSWYgbm90IGEgbGlzdGVuZXIsIHRoaXMgaXMgYSBuby1vcC5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVMaXN0ZW5lciggbGlzdGVuZXI6IFB1c2hCdXR0b25MaXN0ZW5lciApOiB2b2lkIHtcbiAgICB0aGlzLmZpcmVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJlcyBhbGwgbGlzdGVuZXJzLiAgUHVibGljIGZvciBwaGV0LWlvIGFuZCBhMTF5IHVzZS5cbiAgICovXG4gIHB1YmxpYyBmaXJlKCk6IHZvaWQge1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBidXR0b24gaXMgbm90IGFscmVhZHkgZmlyaW5nLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrLWJhc2ljcy9pc3N1ZXMvMzgwXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNGaXJpbmdQcm9wZXJ0eS52YWx1ZSwgJ0Nhbm5vdCBmaXJlIHdoZW4gYWxyZWFkeSBmaXJpbmcnICk7XG4gICAgdGhpcy5pc0ZpcmluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmZpcmVkRW1pdHRlci5lbWl0KCk7XG4gICAgdGhpcy5pc0ZpcmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnUHVzaEJ1dHRvbk1vZGVsJywgUHVzaEJ1dHRvbk1vZGVsICk7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkNhbGxiYWNrVGltZXIiLCJFbWl0dGVyIiwib3B0aW9uaXplIiwiRXZlbnRUeXBlIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwic3VuIiwiQnV0dG9uTW9kZWwiLCJQdXNoQnV0dG9uTW9kZWwiLCJkaXNwb3NlIiwiZGlzcG9zZVB1c2hCdXR0b25Nb2RlbCIsImFkZExpc3RlbmVyIiwibGlzdGVuZXIiLCJmaXJlZEVtaXR0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsImZpcmUiLCJhc3NlcnQiLCJpc0ZpcmluZ1Byb3BlcnR5IiwidmFsdWUiLCJlbWl0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZpcmVPbkRvd24iLCJpbnRlcnJ1cHRMaXN0ZW5lciIsImZpcmVPbkhvbGQiLCJmaXJlT25Ib2xkRGVsYXkiLCJmaXJlT25Ib2xkSW50ZXJ2YWwiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1JlYWRPbmx5IiwiREVGQVVMVF9PUFRJT05TIiwic3RhcnRFdmVudCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwiaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcyIsInRpbWVyIiwiY2FsbGJhY2siLCJiaW5kIiwiZGVsYXkiLCJpbnRlcnZhbCIsImRvd25Qcm9wZXJ0eU9ic2VydmVyIiwiZG93biIsImVuYWJsZWRQcm9wZXJ0eSIsImdldCIsIndpbmRvdyIsInBoZXQiLCJqb2lzdCIsImRpc3BsYXkiLCJfaW5wdXQiLCJjdXJyZW50U2NlbmVyeUV2ZW50Iiwic3RhcnQiLCJwcm9kdWNlU291bmRFbWl0dGVyIiwib3ZlclByb3BlcnR5IiwiZm9jdXNlZFByb3BlcnR5IiwiaW50ZXJydXB0ZWQiLCJzdG9wIiwiZG93blByb3BlcnR5IiwibGluayIsImVuYWJsZWRQcm9wZXJ0eU9ic2VydmVyIiwiZW5hYmxlZCIsInVubGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQyxtQkFBbUIsb0NBQW9DO0FBQzlELE9BQU9DLGFBQWEsOEJBQThCO0FBR2xELE9BQU9DLGVBQWUscUNBQXFDO0FBRTNELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsU0FBUyxZQUFZO0FBQzVCLE9BQU9DLGlCQUF5QyxtQkFBbUI7QUE0QnBELElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCRDtJQTJIM0JFLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msc0JBQXNCO1FBQzNCLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOzs7R0FHQyxHQUNELEFBQU9FLFlBQWFDLFFBQTRCLEVBQVM7UUFDdkQsSUFBSSxDQUFDQyxZQUFZLENBQUNGLFdBQVcsQ0FBRUM7SUFDakM7SUFFQTs7R0FFQyxHQUNELEFBQU9FLGVBQWdCRixRQUE0QixFQUFTO1FBQzFELElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxjQUFjLENBQUVGO0lBQ3BDO0lBRUE7O0dBRUMsR0FDRCxBQUFPRyxPQUFhO1FBRWxCLGtI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