// Copyright 2015-2024, University of Colorado Boulder
/**
 * Model for a momentary button: on when pressed, off when released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import sun from '../sun.js';
import ButtonModel from './ButtonModel.js';
let MomentaryButtonModel = class MomentaryButtonModel extends ButtonModel {
    dispose() {
        this.disposeMomentaryButtonModel();
        super.dispose(); //TODO fails with assertions enabled, see https://github.com/phetsims/sun/issues/212
    }
    /**
   * Produces a sound whenever this button changes the value.
   */ setValue(value) {
        this.valueProperty.set(value);
        this.produceSoundEmitter.emit();
    }
    /**
   * @param valueOff - value when the button is in the off state
   * @param valueOn - value when the button is in the on state
   * @param valueProperty
   * @param [providedOptions]
   */ constructor(valueOff, valueOn, valueProperty, providedOptions){
        const options = optionize()({
            // phet-io
            tandem: Tandem.REQUIRED,
            // to support properly passing this to children, see https://github.com/phetsims/tandem/issues/60
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly
        }, providedOptions);
        super(options);
        // For 'toggle' like behavior for alternative input, tracks the state for the button because it should remain on
        // even when the ButtonModel is not down.
        let wasClickedWhileOn = false;
        const downListener = (down)=>{
            // If clicking with alternative input, the button should behave like a toggle button. Activating it once will
            // set to the on value, and activating it again will set to the off value. This is different from pointer input,
            // where the button is only on while the mouse is down. To match the 'momentary' behavior of pointer input,
            // the button is released when it loses focus.
            if (this.pdomClickingProperty.value) {
                if (down && valueProperty.value === valueOff) {
                    // Button is down from alt input while off, turn on.
                    this.setValue(valueOn);
                    // In this activation the downProperty is going to be set to false right away. This flag prevents the
                    // button from turning off the button until the next click.
                    wasClickedWhileOn = false;
                }
                if (!down && valueProperty.value === valueOn) {
                    if (wasClickedWhileOn) {
                        // Button is up from alt input while on, and it was clicked while on, turn off.
                        this.setValue(valueOff);
                    } else {
                        // Button is up from alt input and it was not pressed while on, so it should remain on. Set
                        // the flag so that it will turn off in the next click.
                        wasClickedWhileOn = true;
                    }
                }
            } else {
                // turn on when pressed (if enabled)
                if (down) {
                    if (this.enabledProperty.get()) {
                        this.setValue(valueOn);
                    }
                } else {
                    this.setValue(valueOff);
                }
            }
        };
        this.downProperty.lazyLink(downListener);
        // Turn off when focus is lost.
        const focusedListener = (focused)=>{
            if (!focused) {
                this.setValue(valueOff);
            }
        };
        this.focusedProperty.lazyLink(focusedListener);
        this.valueProperty = valueProperty;
        this.valueOn = valueOn;
        // if valueProperty set externally, signify to ButtonModel
        const valuePropertyListener = (value)=>{
            this.downProperty.set(value === valueOn);
        };
        valueProperty.link(valuePropertyListener);
        this.disposeMomentaryButtonModel = ()=>{
            this.downProperty.unlink(downListener);
            this.focusedProperty.unlink(focusedListener);
            valueProperty.unlink(valuePropertyListener);
        };
    }
};
export { MomentaryButtonModel as default };
sun.register('MomentaryButtonModel', MomentaryButtonModel);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL01vbWVudGFyeUJ1dHRvbk1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1vZGVsIGZvciBhIG1vbWVudGFyeSBidXR0b246IG9uIHdoZW4gcHJlc3NlZCwgb2ZmIHdoZW4gcmVsZWFzZWQuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5pbXBvcnQgQnV0dG9uTW9kZWwsIHsgQnV0dG9uTW9kZWxPcHRpb25zIH0gZnJvbSAnLi9CdXR0b25Nb2RlbC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBNb21lbnRhcnlCdXR0b25Nb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEJ1dHRvbk1vZGVsT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9tZW50YXJ5QnV0dG9uTW9kZWw8VD4gZXh0ZW5kcyBCdXR0b25Nb2RlbCB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTW9tZW50YXJ5QnV0dG9uTW9kZWw6ICgpID0+IHZvaWQ7XG5cbiAgLy8gKHN1bi1pbnRlcm5hbClcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxUPjtcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlT246IFQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZU9mZiAtIHZhbHVlIHdoZW4gdGhlIGJ1dHRvbiBpcyBpbiB0aGUgb2ZmIHN0YXRlXG4gICAqIEBwYXJhbSB2YWx1ZU9uIC0gdmFsdWUgd2hlbiB0aGUgYnV0dG9uIGlzIGluIHRoZSBvbiBzdGF0ZVxuICAgKiBAcGFyYW0gdmFsdWVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFsdWVPZmY6IFQsIHZhbHVlT246IFQsIHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxUPiwgcHJvdmlkZWRPcHRpb25zPzogTW9tZW50YXJ5QnV0dG9uTW9kZWxPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNb21lbnRhcnlCdXR0b25Nb2RlbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBCdXR0b25Nb2RlbE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG5cbiAgICAgIC8vIHRvIHN1cHBvcnQgcHJvcGVybHkgcGFzc2luZyB0aGlzIHRvIGNoaWxkcmVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvNjBcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb1JlYWRPbmx5XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gRm9yICd0b2dnbGUnIGxpa2UgYmVoYXZpb3IgZm9yIGFsdGVybmF0aXZlIGlucHV0LCB0cmFja3MgdGhlIHN0YXRlIGZvciB0aGUgYnV0dG9uIGJlY2F1c2UgaXQgc2hvdWxkIHJlbWFpbiBvblxuICAgIC8vIGV2ZW4gd2hlbiB0aGUgQnV0dG9uTW9kZWwgaXMgbm90IGRvd24uXG4gICAgbGV0IHdhc0NsaWNrZWRXaGlsZU9uID0gZmFsc2U7XG5cbiAgICBjb25zdCBkb3duTGlzdGVuZXIgPSAoIGRvd246IGJvb2xlYW4gKSA9PiB7XG5cbiAgICAgIC8vIElmIGNsaWNraW5nIHdpdGggYWx0ZXJuYXRpdmUgaW5wdXQsIHRoZSBidXR0b24gc2hvdWxkIGJlaGF2ZSBsaWtlIGEgdG9nZ2xlIGJ1dHRvbi4gQWN0aXZhdGluZyBpdCBvbmNlIHdpbGxcbiAgICAgIC8vIHNldCB0byB0aGUgb24gdmFsdWUsIGFuZCBhY3RpdmF0aW5nIGl0IGFnYWluIHdpbGwgc2V0IHRvIHRoZSBvZmYgdmFsdWUuIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gcG9pbnRlciBpbnB1dCxcbiAgICAgIC8vIHdoZXJlIHRoZSBidXR0b24gaXMgb25seSBvbiB3aGlsZSB0aGUgbW91c2UgaXMgZG93bi4gVG8gbWF0Y2ggdGhlICdtb21lbnRhcnknIGJlaGF2aW9yIG9mIHBvaW50ZXIgaW5wdXQsXG4gICAgICAvLyB0aGUgYnV0dG9uIGlzIHJlbGVhc2VkIHdoZW4gaXQgbG9zZXMgZm9jdXMuXG4gICAgICBpZiAoIHRoaXMucGRvbUNsaWNraW5nUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgIGlmICggZG93biAmJiB2YWx1ZVByb3BlcnR5LnZhbHVlID09PSB2YWx1ZU9mZiApIHtcblxuICAgICAgICAgIC8vIEJ1dHRvbiBpcyBkb3duIGZyb20gYWx0IGlucHV0IHdoaWxlIG9mZiwgdHVybiBvbi5cbiAgICAgICAgICB0aGlzLnNldFZhbHVlKCB2YWx1ZU9uICk7XG5cbiAgICAgICAgICAvLyBJbiB0aGlzIGFjdGl2YXRpb24gdGhlIGRvd25Qcm9wZXJ0eSBpcyBnb2luZyB0byBiZSBzZXQgdG8gZmFsc2UgcmlnaHQgYXdheS4gVGhpcyBmbGFnIHByZXZlbnRzIHRoZVxuICAgICAgICAgIC8vIGJ1dHRvbiBmcm9tIHR1cm5pbmcgb2ZmIHRoZSBidXR0b24gdW50aWwgdGhlIG5leHQgY2xpY2suXG4gICAgICAgICAgd2FzQ2xpY2tlZFdoaWxlT24gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICFkb3duICYmIHZhbHVlUHJvcGVydHkudmFsdWUgPT09IHZhbHVlT24gKSB7XG4gICAgICAgICAgaWYgKCB3YXNDbGlja2VkV2hpbGVPbiApIHtcblxuICAgICAgICAgICAgLy8gQnV0dG9uIGlzIHVwIGZyb20gYWx0IGlucHV0IHdoaWxlIG9uLCBhbmQgaXQgd2FzIGNsaWNrZWQgd2hpbGUgb24sIHR1cm4gb2ZmLlxuICAgICAgICAgICAgdGhpcy5zZXRWYWx1ZSggdmFsdWVPZmYgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgIC8vIEJ1dHRvbiBpcyB1cCBmcm9tIGFsdCBpbnB1dCBhbmQgaXQgd2FzIG5vdCBwcmVzc2VkIHdoaWxlIG9uLCBzbyBpdCBzaG91bGQgcmVtYWluIG9uLiBTZXRcbiAgICAgICAgICAgIC8vIHRoZSBmbGFnIHNvIHRoYXQgaXQgd2lsbCB0dXJuIG9mZiBpbiB0aGUgbmV4dCBjbGljay5cbiAgICAgICAgICAgIHdhc0NsaWNrZWRXaGlsZU9uID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIC8vIHR1cm4gb24gd2hlbiBwcmVzc2VkIChpZiBlbmFibGVkKVxuICAgICAgICBpZiAoIGRvd24gKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUoIHZhbHVlT24gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRWYWx1ZSggdmFsdWVPZmYgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5kb3duUHJvcGVydHkubGF6eUxpbmsoIGRvd25MaXN0ZW5lciApO1xuXG4gICAgLy8gVHVybiBvZmYgd2hlbiBmb2N1cyBpcyBsb3N0LlxuICAgIGNvbnN0IGZvY3VzZWRMaXN0ZW5lciA9ICggZm9jdXNlZDogYm9vbGVhbiApID0+IHtcbiAgICAgIGlmICggIWZvY3VzZWQgKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsdWUoIHZhbHVlT2ZmICk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmZvY3VzZWRQcm9wZXJ0eS5sYXp5TGluayggZm9jdXNlZExpc3RlbmVyICk7XG5cbiAgICB0aGlzLnZhbHVlUHJvcGVydHkgPSB2YWx1ZVByb3BlcnR5O1xuICAgIHRoaXMudmFsdWVPbiA9IHZhbHVlT247XG5cbiAgICAvLyBpZiB2YWx1ZVByb3BlcnR5IHNldCBleHRlcm5hbGx5LCBzaWduaWZ5IHRvIEJ1dHRvbk1vZGVsXG4gICAgY29uc3QgdmFsdWVQcm9wZXJ0eUxpc3RlbmVyID0gKCB2YWx1ZTogVCApID0+IHtcbiAgICAgIHRoaXMuZG93blByb3BlcnR5LnNldCggdmFsdWUgPT09IHZhbHVlT24gKTtcbiAgICB9O1xuICAgIHZhbHVlUHJvcGVydHkubGluayggdmFsdWVQcm9wZXJ0eUxpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VNb21lbnRhcnlCdXR0b25Nb2RlbCA9ICgpID0+IHtcbiAgICAgIHRoaXMuZG93blByb3BlcnR5LnVubGluayggZG93bkxpc3RlbmVyICk7XG4gICAgICB0aGlzLmZvY3VzZWRQcm9wZXJ0eS51bmxpbmsoIGZvY3VzZWRMaXN0ZW5lciApO1xuICAgICAgdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlUHJvcGVydHlMaXN0ZW5lciApO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VNb21lbnRhcnlCdXR0b25Nb2RlbCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTsgLy9UT0RPIGZhaWxzIHdpdGggYXNzZXJ0aW9ucyBlbmFibGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvMjEyXG4gIH1cblxuICAvKipcbiAgICogUHJvZHVjZXMgYSBzb3VuZCB3aGVuZXZlciB0aGlzIGJ1dHRvbiBjaGFuZ2VzIHRoZSB2YWx1ZS5cbiAgICovXG4gIHByaXZhdGUgc2V0VmFsdWUoIHZhbHVlOiBUICk6IHZvaWQge1xuICAgIHRoaXMudmFsdWVQcm9wZXJ0eS5zZXQoIHZhbHVlICk7XG4gICAgdGhpcy5wcm9kdWNlU291bmRFbWl0dGVyLmVtaXQoKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdNb21lbnRhcnlCdXR0b25Nb2RlbCcsIE1vbWVudGFyeUJ1dHRvbk1vZGVsICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsInN1biIsIkJ1dHRvbk1vZGVsIiwiTW9tZW50YXJ5QnV0dG9uTW9kZWwiLCJkaXNwb3NlIiwiZGlzcG9zZU1vbWVudGFyeUJ1dHRvbk1vZGVsIiwic2V0VmFsdWUiLCJ2YWx1ZSIsInZhbHVlUHJvcGVydHkiLCJzZXQiLCJwcm9kdWNlU291bmRFbWl0dGVyIiwiZW1pdCIsInZhbHVlT2ZmIiwidmFsdWVPbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1JlYWRPbmx5IiwiREVGQVVMVF9PUFRJT05TIiwid2FzQ2xpY2tlZFdoaWxlT24iLCJkb3duTGlzdGVuZXIiLCJkb3duIiwicGRvbUNsaWNraW5nUHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJnZXQiLCJkb3duUHJvcGVydHkiLCJsYXp5TGluayIsImZvY3VzZWRMaXN0ZW5lciIsImZvY3VzZWQiLCJmb2N1c2VkUHJvcGVydHkiLCJ2YWx1ZVByb3BlcnR5TGlzdGVuZXIiLCJsaW5rIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtB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