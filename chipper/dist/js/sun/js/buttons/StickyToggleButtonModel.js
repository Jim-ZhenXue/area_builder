// Copyright 2014-2024, University of Colorado Boulder
/**
 * Model for a toggle button that sticks when pushed down and pops up when pushed a second time. Unlike other general
 * sun models, 'sticky' implies a specific type of user-interface component, a button that is either popped up or
 * pressed down.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import EventType from '../../../tandem/js/EventType.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
let StickyToggleButtonModel = class StickyToggleButtonModel extends ButtonModel {
    dispose() {
        this.disposeToggleButtonModel();
        super.dispose();
    }
    toggle() {
        this.toggledEmitter.emit();
        this.produceSoundEmitter.emit();
    }
    /**
   * @param valueUp - value when the toggle is in the 'up' position
   * @param valueDown - value when the toggle is in the 'down' position
   * @param valueProperty - axon Property that can be either valueUp or valueDown.
   *   Would have preferred to call this `property` but it would clash with the Property function name.
   * @param providedOptions
   */ constructor(valueUp, valueDown, valueProperty, providedOptions){
        assert && assert(valueProperty.valueComparisonStrategy === 'reference', 'StickyToggleButtonModel depends on "===" equality for value comparison');
        const options = optionize()({
            tandem: Tandem.REQUIRED
        }, providedOptions);
        super(options);
        this.valueUp = valueUp;
        this.valueDown = valueDown;
        this.valueProperty = valueProperty;
        this.toggledEmitter = new Emitter({
            tandem: options.tandem.createTandem('toggledEmitter'),
            phetioDocumentation: 'Emits when the button is toggled',
            phetioEventType: EventType.USER
        });
        this.toggledEmitter.addListener(()=>{
            assert && assert(this.valueProperty.value === this.valueUp || this.valueProperty.value === this.valueDown, `unrecognized value: ${this.valueProperty.value}`);
            this.valueProperty.value = this.valueProperty.value === this.valueUp ? this.valueDown : this.valueUp;
        });
        // When the user releases the toggle button, it should only fire an event if it is not during the same action in
        // which they pressed the button.  Track the state to see if they have already pushed the button.
        // Note: Does this need to be reset when the simulation does "reset all"?  I (Sam Reid) can't find any negative
        // consequences in the user interface of not resetting it, but maybe I missed something. Or maybe it would be safe
        // to reset it anyway.
        this.pressedWhileDownProperty = new BooleanProperty(false);
        // If the button is up and the user presses it, show it pressed and toggle the state right away.  When the button is
        // released, pop up the button (unless it was part of the same action that pressed the button down in the first
        // place).
        const downListener = (down)=>{
            const overOrFocused = this.overProperty.get() || this.focusedProperty.get();
            if (this.enabledProperty.get() && overOrFocused && !this.interrupted) {
                if (down && valueProperty.value === valueUp) {
                    this.toggle();
                    this.pressedWhileDownProperty.set(false);
                }
                if (!down && valueProperty.value === valueDown) {
                    if (this.pressedWhileDownProperty.get()) {
                        this.toggle();
                    } else {
                        this.pressedWhileDownProperty.set(true);
                    }
                }
            }
            // Handle the case where the pointer moved out then up over a toggle button, so it will respond to the next press
            if (!down && !overOrFocused) {
                this.pressedWhileDownProperty.set(true);
            }
        };
        this.downProperty.link(downListener);
        // if the valueProperty is set externally to user interaction, update the buttonModel
        // downProperty so the model stays in sync
        const valuePropertyListener = (value)=>{
            this.downProperty.set(value === valueDown);
        };
        valueProperty.link(valuePropertyListener);
        // make the button ready to toggle when enabled
        const enabledPropertyOnListener = (enabled)=>{
            if (enabled) {
                this.pressedWhileDownProperty.set(true);
            }
        };
        this.enabledProperty.link(enabledPropertyOnListener);
        this.disposeToggleButtonModel = ()=>{
            this.downProperty.unlink(downListener);
            this.enabledProperty.unlink(enabledPropertyOnListener);
            valueProperty.unlink(valuePropertyListener);
            this.toggledEmitter.dispose();
        };
    }
};
export { StickyToggleButtonModel as default };
sun.register('StickyToggleButtonModel', StickyToggleButtonModel);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1N0aWNreVRvZ2dsZUJ1dHRvbk1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1vZGVsIGZvciBhIHRvZ2dsZSBidXR0b24gdGhhdCBzdGlja3Mgd2hlbiBwdXNoZWQgZG93biBhbmQgcG9wcyB1cCB3aGVuIHB1c2hlZCBhIHNlY29uZCB0aW1lLiBVbmxpa2Ugb3RoZXIgZ2VuZXJhbFxuICogc3VuIG1vZGVscywgJ3N0aWNreScgaW1wbGllcyBhIHNwZWNpZmljIHR5cGUgb2YgdXNlci1pbnRlcmZhY2UgY29tcG9uZW50LCBhIGJ1dHRvbiB0aGF0IGlzIGVpdGhlciBwb3BwZWQgdXAgb3JcbiAqIHByZXNzZWQgZG93bi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5pbXBvcnQgQnV0dG9uTW9kZWwsIHsgQnV0dG9uTW9kZWxPcHRpb25zIH0gZnJvbSAnLi9CdXR0b25Nb2RlbC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBTdGlja3lUb2dnbGVCdXR0b25Nb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEJ1dHRvbk1vZGVsT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWw8VD4gZXh0ZW5kcyBCdXR0b25Nb2RlbCB7XG5cbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxUPjtcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlVXA6IFQ7XG4gIHB1YmxpYyByZWFkb25seSB2YWx1ZURvd246IFQ7XG5cbiAgcHJpdmF0ZSByZWFkb25seSB0b2dnbGVkRW1pdHRlcjogVEVtaXR0ZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlc3NlZFdoaWxlRG93blByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVRvZ2dsZUJ1dHRvbk1vZGVsOiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWVVcCAtIHZhbHVlIHdoZW4gdGhlIHRvZ2dsZSBpcyBpbiB0aGUgJ3VwJyBwb3NpdGlvblxuICAgKiBAcGFyYW0gdmFsdWVEb3duIC0gdmFsdWUgd2hlbiB0aGUgdG9nZ2xlIGlzIGluIHRoZSAnZG93bicgcG9zaXRpb25cbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHkgLSBheG9uIFByb3BlcnR5IHRoYXQgY2FuIGJlIGVpdGhlciB2YWx1ZVVwIG9yIHZhbHVlRG93bi5cbiAgICogICBXb3VsZCBoYXZlIHByZWZlcnJlZCB0byBjYWxsIHRoaXMgYHByb3BlcnR5YCBidXQgaXQgd291bGQgY2xhc2ggd2l0aCB0aGUgUHJvcGVydHkgZnVuY3Rpb24gbmFtZS5cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVVwOiBULCB2YWx1ZURvd246IFQsIHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxUPiwgcHJvdmlkZWRPcHRpb25zPzogU3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWxPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlUHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdyZWZlcmVuY2UnLFxuICAgICAgJ1N0aWNreVRvZ2dsZUJ1dHRvbk1vZGVsIGRlcGVuZHMgb24gXCI9PT1cIiBlcXVhbGl0eSBmb3IgdmFsdWUgY29tcGFyaXNvbicgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWxPcHRpb25zLCBTZWxmT3B0aW9ucywgQnV0dG9uTW9kZWxPcHRpb25zPigpKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMudmFsdWVVcCA9IHZhbHVlVXA7XG4gICAgdGhpcy52YWx1ZURvd24gPSB2YWx1ZURvd247XG4gICAgdGhpcy52YWx1ZVByb3BlcnR5ID0gdmFsdWVQcm9wZXJ0eTtcblxuICAgIHRoaXMudG9nZ2xlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b2dnbGVkRW1pdHRlcicgKSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0cyB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZCcsXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXG4gICAgfSApO1xuXG4gICAgdGhpcy50b2dnbGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52YWx1ZVByb3BlcnR5LnZhbHVlID09PSB0aGlzLnZhbHVlVXAgfHwgdGhpcy52YWx1ZVByb3BlcnR5LnZhbHVlID09PSB0aGlzLnZhbHVlRG93bixcbiAgICAgICAgYHVucmVjb2duaXplZCB2YWx1ZTogJHt0aGlzLnZhbHVlUHJvcGVydHkudmFsdWV9YCApO1xuICAgICAgdGhpcy52YWx1ZVByb3BlcnR5LnZhbHVlID0gdGhpcy52YWx1ZVByb3BlcnR5LnZhbHVlID09PSB0aGlzLnZhbHVlVXAgPyB0aGlzLnZhbHVlRG93biA6IHRoaXMudmFsdWVVcDtcbiAgICB9ICk7XG5cbiAgICAvLyBXaGVuIHRoZSB1c2VyIHJlbGVhc2VzIHRoZSB0b2dnbGUgYnV0dG9uLCBpdCBzaG91bGQgb25seSBmaXJlIGFuIGV2ZW50IGlmIGl0IGlzIG5vdCBkdXJpbmcgdGhlIHNhbWUgYWN0aW9uIGluXG4gICAgLy8gd2hpY2ggdGhleSBwcmVzc2VkIHRoZSBidXR0b24uICBUcmFjayB0aGUgc3RhdGUgdG8gc2VlIGlmIHRoZXkgaGF2ZSBhbHJlYWR5IHB1c2hlZCB0aGUgYnV0dG9uLlxuICAgIC8vIE5vdGU6IERvZXMgdGhpcyBuZWVkIHRvIGJlIHJlc2V0IHdoZW4gdGhlIHNpbXVsYXRpb24gZG9lcyBcInJlc2V0IGFsbFwiPyAgSSAoU2FtIFJlaWQpIGNhbid0IGZpbmQgYW55IG5lZ2F0aXZlXG4gICAgLy8gY29uc2VxdWVuY2VzIGluIHRoZSB1c2VyIGludGVyZmFjZSBvZiBub3QgcmVzZXR0aW5nIGl0LCBidXQgbWF5YmUgSSBtaXNzZWQgc29tZXRoaW5nLiBPciBtYXliZSBpdCB3b3VsZCBiZSBzYWZlXG4gICAgLy8gdG8gcmVzZXQgaXQgYW55d2F5LlxuICAgIHRoaXMucHJlc3NlZFdoaWxlRG93blByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcblxuICAgIC8vIElmIHRoZSBidXR0b24gaXMgdXAgYW5kIHRoZSB1c2VyIHByZXNzZXMgaXQsIHNob3cgaXQgcHJlc3NlZCBhbmQgdG9nZ2xlIHRoZSBzdGF0ZSByaWdodCBhd2F5LiAgV2hlbiB0aGUgYnV0dG9uIGlzXG4gICAgLy8gcmVsZWFzZWQsIHBvcCB1cCB0aGUgYnV0dG9uICh1bmxlc3MgaXQgd2FzIHBhcnQgb2YgdGhlIHNhbWUgYWN0aW9uIHRoYXQgcHJlc3NlZCB0aGUgYnV0dG9uIGRvd24gaW4gdGhlIGZpcnN0XG4gICAgLy8gcGxhY2UpLlxuICAgIGNvbnN0IGRvd25MaXN0ZW5lciA9ICggZG93bjogYm9vbGVhbiApID0+IHtcbiAgICAgIGNvbnN0IG92ZXJPckZvY3VzZWQgPSB0aGlzLm92ZXJQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLmZvY3VzZWRQcm9wZXJ0eS5nZXQoKTtcbiAgICAgIGlmICggdGhpcy5lbmFibGVkUHJvcGVydHkuZ2V0KCkgJiYgb3Zlck9yRm9jdXNlZCAmJiAhdGhpcy5pbnRlcnJ1cHRlZCApIHtcbiAgICAgICAgaWYgKCBkb3duICYmIHZhbHVlUHJvcGVydHkudmFsdWUgPT09IHZhbHVlVXAgKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICB0aGlzLnByZXNzZWRXaGlsZURvd25Qcm9wZXJ0eS5zZXQoIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhZG93biAmJiB2YWx1ZVByb3BlcnR5LnZhbHVlID09PSB2YWx1ZURvd24gKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLnByZXNzZWRXaGlsZURvd25Qcm9wZXJ0eS5nZXQoKSApIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkV2hpbGVEb3duUHJvcGVydHkuc2V0KCB0cnVlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0aGUgcG9pbnRlciBtb3ZlZCBvdXQgdGhlbiB1cCBvdmVyIGEgdG9nZ2xlIGJ1dHRvbiwgc28gaXQgd2lsbCByZXNwb25kIHRvIHRoZSBuZXh0IHByZXNzXG4gICAgICBpZiAoICFkb3duICYmICFvdmVyT3JGb2N1c2VkICkge1xuICAgICAgICB0aGlzLnByZXNzZWRXaGlsZURvd25Qcm9wZXJ0eS5zZXQoIHRydWUgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5kb3duUHJvcGVydHkubGluayggZG93bkxpc3RlbmVyICk7XG5cbiAgICAvLyBpZiB0aGUgdmFsdWVQcm9wZXJ0eSBpcyBzZXQgZXh0ZXJuYWxseSB0byB1c2VyIGludGVyYWN0aW9uLCB1cGRhdGUgdGhlIGJ1dHRvbk1vZGVsXG4gICAgLy8gZG93blByb3BlcnR5IHNvIHRoZSBtb2RlbCBzdGF5cyBpbiBzeW5jXG4gICAgY29uc3QgdmFsdWVQcm9wZXJ0eUxpc3RlbmVyID0gKCB2YWx1ZTogVCApID0+IHtcbiAgICAgIHRoaXMuZG93blByb3BlcnR5LnNldCggdmFsdWUgPT09IHZhbHVlRG93biApO1xuICAgIH07XG4gICAgdmFsdWVQcm9wZXJ0eS5saW5rKCB2YWx1ZVByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIC8vIG1ha2UgdGhlIGJ1dHRvbiByZWFkeSB0byB0b2dnbGUgd2hlbiBlbmFibGVkXG4gICAgY29uc3QgZW5hYmxlZFByb3BlcnR5T25MaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcbiAgICAgIGlmICggZW5hYmxlZCApIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkV2hpbGVEb3duUHJvcGVydHkuc2V0KCB0cnVlICk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkUHJvcGVydHlPbkxpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VUb2dnbGVCdXR0b25Nb2RlbCA9ICgpID0+IHtcbiAgICAgIHRoaXMuZG93blByb3BlcnR5LnVubGluayggZG93bkxpc3RlbmVyICk7XG4gICAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRQcm9wZXJ0eU9uTGlzdGVuZXIgKTtcbiAgICAgIHZhbHVlUHJvcGVydHkudW5saW5rKCB2YWx1ZVByb3BlcnR5TGlzdGVuZXIgKTtcbiAgICAgIHRoaXMudG9nZ2xlZEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VUb2dnbGVCdXR0b25Nb2RlbCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgdG9nZ2xlKCk6IHZvaWQge1xuICAgIHRoaXMudG9nZ2xlZEVtaXR0ZXIuZW1pdCgpO1xuICAgIHRoaXMucHJvZHVjZVNvdW5kRW1pdHRlci5lbWl0KCk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnU3RpY2t5VG9nZ2xlQnV0dG9uTW9kZWwnLCBTdGlja3lUb2dnbGVCdXR0b25Nb2RlbCApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwib3B0aW9uaXplIiwiRXZlbnRUeXBlIiwiVGFuZGVtIiwic3VuIiwiQnV0dG9uTW9kZWwiLCJTdGlja3lUb2dnbGVCdXR0b25Nb2RlbCIsImRpc3Bvc2UiLCJkaXNwb3NlVG9nZ2xlQnV0dG9uTW9kZWwiLCJ0b2dnbGUiLCJ0b2dnbGVkRW1pdHRlciIsImVtaXQiLCJwcm9kdWNlU291bmRFbWl0dGVyIiwidmFsdWVVcCIsInZhbHVlRG93biIsInZhbHVlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwiYWRkTGlzdGVuZXIiLCJ2YWx1ZSIsInByZXNzZWRXaGlsZURvd25Qcm9wZXJ0eSIsImRvd25MaXN0ZW5lciIsImRvd24iLCJvdmVyT3JGb2N1c2VkIiwib3ZlclByb3BlcnR5IiwiZ2V0IiwiZm9jdXNlZFByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwiaW50ZXJydXB0ZWQiLCJzZXQiLCJkb3duUHJvcGVydHkiLCJsaW5rIiwidmFsdWVQcm9wZXJ0eUxpc3RlbmVyIiwiZW5hYmxlZFByb3BlcnR5T25MaXN0ZW5lciIsImVuYWJsZWQiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLGFBQWEsOEJBQThCO0FBR2xELE9BQU9DLGVBQXFDLHFDQUFxQztBQUNqRixPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyxTQUFTLFlBQVk7QUFDNUIsT0FBT0MsaUJBQXlDLG1CQUFtQjtBQU1wRCxJQUFBLEFBQU1DLDBCQUFOLE1BQU1BLGdDQUFtQ0Q7SUFxR3RDRSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHdCQUF3QjtRQUM3QixLQUFLLENBQUNEO0lBQ1I7SUFFUUUsU0FBZTtRQUNyQixJQUFJLENBQUNDLGNBQWMsQ0FBQ0MsSUFBSTtRQUN4QixJQUFJLENBQUNDLG1CQUFtQixDQUFDRCxJQUFJO0lBQy9CO0lBbkdBOzs7Ozs7R0FNQyxHQUNELFlBQW9CRSxPQUFVLEVBQUVDLFNBQVksRUFBRUMsYUFBMkIsRUFBRUMsZUFBZ0QsQ0FBRztRQUM1SEMsVUFBVUEsT0FBUUYsY0FBY0csdUJBQXVCLEtBQUssYUFDMUQ7UUFFRixNQUFNQyxVQUFVbEIsWUFBOEU7WUFDNUZtQixRQUFRakIsT0FBT2tCLFFBQVE7UUFDekIsR0FBR0w7UUFFSCxLQUFLLENBQUVHO1FBRVAsSUFBSSxDQUFDTixPQUFPLEdBQUdBO1FBQ2YsSUFBSSxDQUFDQyxTQUFTLEdBQUdBO1FBQ2pCLElBQUksQ0FBQ0MsYUFBYSxHQUFHQTtRQUVyQixJQUFJLENBQUNMLGNBQWMsR0FBRyxJQUFJVixRQUFTO1lBQ2pDb0IsUUFBUUQsUUFBUUMsTUFBTSxDQUFDRSxZQUFZLENBQUU7WUFDckNDLHFCQUFxQjtZQUNyQkMsaUJBQWlCdEIsVUFBVXVCLElBQUk7UUFDakM7UUFFQSxJQUFJLENBQUNmLGNBQWMsQ0FBQ2dCLFdBQVcsQ0FBRTtZQUMvQlQsVUFBVUEsT0FBUSxJQUFJLENBQUNGLGFBQWEsQ0FBQ1ksS0FBSyxLQUFLLElBQUksQ0FBQ2QsT0FBTyxJQUFJLElBQUksQ0FBQ0UsYUFBYSxDQUFDWSxLQUFLLEtBQUssSUFBSSxDQUFDYixTQUFTLEVBQ3hHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDQyxhQUFhLENBQUNZLEtBQUssRUFBRTtZQUNuRCxJQUFJLENBQUNaLGFBQWEsQ0FBQ1ksS0FBSyxHQUFHLElBQUksQ0FBQ1osYUFBYSxDQUFDWSxLQUFLLEtBQUssSUFBSSxDQUFDZCxPQUFPLEdBQUcsSUFBSSxDQUFDQyxTQUFTLEdBQUcsSUFBSSxDQUFDRCxPQUFPO1FBQ3RHO1FBRUEsZ0hBQWdIO1FBQ2hILGlHQUFpRztRQUNqRywrR0FBK0c7UUFDL0csa0hBQWtIO1FBQ2xILHNCQUFzQjtRQUN0QixJQUFJLENBQUNlLHdCQUF3QixHQUFHLElBQUk3QixnQkFBaUI7UUFFckQsb0hBQW9IO1FBQ3BILCtHQUErRztRQUMvRyxVQUFVO1FBQ1YsTUFBTThCLGVBQWUsQ0FBRUM7WUFDckIsTUFBTUMsZ0JBQWdCLElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxHQUFHLE1BQU0sSUFBSSxDQUFDQyxlQUFlLENBQUNELEdBQUc7WUFDekUsSUFBSyxJQUFJLENBQUNFLGVBQWUsQ0FBQ0YsR0FBRyxNQUFNRixpQkFBaUIsQ0FBQyxJQUFJLENBQUNLLFdBQVcsRUFBRztnQkFDdEUsSUFBS04sUUFBUWYsY0FBY1ksS0FBSyxLQUFLZCxTQUFVO29CQUM3QyxJQUFJLENBQUNKLE1BQU07b0JBQ1gsSUFBSSxDQUFDbUIsd0JBQXdCLENBQUNTLEdBQUcsQ0FBRTtnQkFDckM7Z0JBQ0EsSUFBSyxDQUFDUCxRQUFRZixjQUFjWSxLQUFLLEtBQUtiLFdBQVk7b0JBQ2hELElBQUssSUFBSSxDQUFDYyx3QkFBd0IsQ0FBQ0ssR0FBRyxJQUFLO3dCQUN6QyxJQUFJLENBQUN4QixNQUFNO29CQUNiLE9BQ0s7d0JBQ0gsSUFBSSxDQUFDbUIsd0JBQXdCLENBQUNTLEdBQUcsQ0FBRTtvQkFDckM7Z0JBQ0Y7WUFDRjtZQUVBLGlIQUFpSDtZQUNqSCxJQUFLLENBQUNQLFFBQVEsQ0FBQ0MsZUFBZ0I7Z0JBQzdCLElBQUksQ0FBQ0gsd0JBQXdCLENBQUNTLEdBQUcsQ0FBRTtZQUNyQztRQUNGO1FBRUEsSUFBSSxDQUFDQyxZQUFZLENBQUNDLElBQUksQ0FBRVY7UUFFeEIscUZBQXFGO1FBQ3JGLDBDQUEwQztRQUMxQyxNQUFNVyx3QkFBd0IsQ0FBRWI7WUFDOUIsSUFBSSxDQUFDVyxZQUFZLENBQUNELEdBQUcsQ0FBRVYsVUFBVWI7UUFDbkM7UUFDQUMsY0FBY3dCLElBQUksQ0FBRUM7UUFFcEIsK0NBQStDO1FBQy9DLE1BQU1DLDRCQUE0QixDQUFFQztZQUNsQyxJQUFLQSxTQUFVO2dCQUNiLElBQUksQ0FBQ2Qsd0JBQXdCLENBQUNTLEdBQUcsQ0FBRTtZQUNyQztRQUNGO1FBQ0EsSUFBSSxDQUFDRixlQUFlLENBQUNJLElBQUksQ0FBRUU7UUFFM0IsSUFBSSxDQUFDakMsd0JBQXdCLEdBQUc7WUFDOUIsSUFBSSxDQUFDOEIsWUFBWSxDQUFDSyxNQUFNLENBQUVkO1lBQzFCLElBQUksQ0FBQ00sZUFBZSxDQUFDUSxNQUFNLENBQUVGO1lBQzdCMUIsY0FBYzRCLE1BQU0sQ0FBRUg7WUFDdEIsSUFBSSxDQUFDOUIsY0FBYyxDQUFDSCxPQUFPO1FBQzdCO0lBQ0Y7QUFXRjtBQTlHQSxTQUFxQkQscUNBOEdwQjtBQUVERixJQUFJd0MsUUFBUSxDQUFFLDJCQUEyQnRDIn0=