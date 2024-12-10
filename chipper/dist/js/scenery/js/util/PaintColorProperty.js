// Copyright 2018-2024, University of Colorado Boulder
/**
 * A Property that will always hold a `Color` object representing the current value of a given paint (and can be set to
 * different paints).
 *
 * This is valuable, since:
 * ```
 *   const color = new phet.scenery.Color( 'red' );
 *   const fill = new phet.axon.Property( color );
 *   const paintColorProperty = new phet.scenery.PaintColorProperty( fill );
 *
 *   // value is converted to a {Color}
 *   paintColorProperty.value; // r: 255, g: 0, b: 0, a: 1
 *
 *   // watches direct Color mutation
 *   color.red = 128;
 *   paintColorProperty.value; // r: 128, g: 0, b: 0, a: 1
 *
 *   // watches the Property mutation
 *   fill.value = 'green';
 *   paintColorProperty.value; // r: 0, g: 128, b: 0, a: 1
 *
 *   // can switch to a different paint
 *   paintColorProperty.paint = 'blue';
 *   paintColorProperty.value; // r: 0, g: 0, b: 255, a: 1
 * ```
 *
 * Basically, you don't have to add your own listeners to both (optionally) any Properties in a paint and (optionally)
 * any Color objects (since it's all handled).
 *
 * This is particularly helpful to create paints that are either lighter or darker than an original paint (where it
 * will update its color value when the original is updated).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import { PaintDef, PaintObserver, scenery } from '../imports.js';
let PaintColorProperty = class PaintColorProperty extends Property {
    /**
   * Sets the current paint of the PaintColorProperty.
   */ setPaint(paint) {
        assert && assert(PaintDef.isPaintDef(paint));
        this._paint = paint;
        this._paintObserver.setPrimary(paint);
    }
    set paint(value) {
        this.setPaint(value);
    }
    get paint() {
        return this.getPaint();
    }
    /**
   * Returns the current paint.
   */ getPaint() {
        return this._paint;
    }
    /**
   * Sets the current value used for adjusting the brightness or darkness (luminance) of the color.
   *
   * If this factor is a non-zero value, the value of this Property will be either a brightened or darkened version of
   * the paint (depending on the value of the factor). 0 applies no change. Positive numbers brighten the color up to
   * 1 (white). Negative numbers darken the color up to -1 (black).
   *
   * For example, if the given paint is blue, the below factors will result in:
   *
   *   -1: black
   * -0.5: dark blue
   *    0: blue
   *  0.5: light blue
   *    1: white
   *
   * With intermediate values basically "interpolated". This uses the `Color` colorUtilsBrightness method to adjust
   * the paint.
   */ setLuminanceFactor(luminanceFactor) {
        assert && assert(luminanceFactor >= -1 && luminanceFactor <= 1);
        if (this.luminanceFactor !== luminanceFactor) {
            this._luminanceFactor = luminanceFactor;
            this.invalidatePaint();
        }
    }
    set luminanceFactor(value) {
        this.setLuminanceFactor(value);
    }
    get luminanceFactor() {
        return this.getLuminanceFactor();
    }
    /**
   * Returns the current value used for adjusting the brightness or darkness (luminance) of the color.
   *
   * See setLuminanceFactor() for more information.
   */ getLuminanceFactor() {
        return this._luminanceFactor;
    }
    /**
   * Updates the value of this Property.
   */ invalidatePaint() {
        this.value = PaintDef.toColor(this._paint).colorUtilsBrightness(this._luminanceFactor);
    }
    /**
   * Releases references.
   */ dispose() {
        this.paint = null;
        super.dispose();
    }
    constructor(paint, providedOptions){
        const initialColor = PaintDef.toColor(paint);
        const options = optionize()({
            luminanceFactor: 0,
            // Property options
            valueComparisonStrategy: 'equalsFunction' // We don't need to renotify for equivalent colors
        }, providedOptions);
        super(initialColor, options);
        this._paint = null;
        this._luminanceFactor = options.luminanceFactor;
        this._changeListener = this.invalidatePaint.bind(this);
        this._paintObserver = new PaintObserver(this._changeListener);
        this.setPaint(paint);
    }
};
export { PaintColorProperty as default };
scenery.register('PaintColorProperty', PaintColorProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9QYWludENvbG9yUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0IHdpbGwgYWx3YXlzIGhvbGQgYSBgQ29sb3JgIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYSBnaXZlbiBwYWludCAoYW5kIGNhbiBiZSBzZXQgdG9cbiAqIGRpZmZlcmVudCBwYWludHMpLlxuICpcbiAqIFRoaXMgaXMgdmFsdWFibGUsIHNpbmNlOlxuICogYGBgXG4gKiAgIGNvbnN0IGNvbG9yID0gbmV3IHBoZXQuc2NlbmVyeS5Db2xvciggJ3JlZCcgKTtcbiAqICAgY29uc3QgZmlsbCA9IG5ldyBwaGV0LmF4b24uUHJvcGVydHkoIGNvbG9yICk7XG4gKiAgIGNvbnN0IHBhaW50Q29sb3JQcm9wZXJ0eSA9IG5ldyBwaGV0LnNjZW5lcnkuUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsICk7XG4gKlxuICogICAvLyB2YWx1ZSBpcyBjb252ZXJ0ZWQgdG8gYSB7Q29sb3J9XG4gKiAgIHBhaW50Q29sb3JQcm9wZXJ0eS52YWx1ZTsgLy8gcjogMjU1LCBnOiAwLCBiOiAwLCBhOiAxXG4gKlxuICogICAvLyB3YXRjaGVzIGRpcmVjdCBDb2xvciBtdXRhdGlvblxuICogICBjb2xvci5yZWQgPSAxMjg7XG4gKiAgIHBhaW50Q29sb3JQcm9wZXJ0eS52YWx1ZTsgLy8gcjogMTI4LCBnOiAwLCBiOiAwLCBhOiAxXG4gKlxuICogICAvLyB3YXRjaGVzIHRoZSBQcm9wZXJ0eSBtdXRhdGlvblxuICogICBmaWxsLnZhbHVlID0gJ2dyZWVuJztcbiAqICAgcGFpbnRDb2xvclByb3BlcnR5LnZhbHVlOyAvLyByOiAwLCBnOiAxMjgsIGI6IDAsIGE6IDFcbiAqXG4gKiAgIC8vIGNhbiBzd2l0Y2ggdG8gYSBkaWZmZXJlbnQgcGFpbnRcbiAqICAgcGFpbnRDb2xvclByb3BlcnR5LnBhaW50ID0gJ2JsdWUnO1xuICogICBwYWludENvbG9yUHJvcGVydHkudmFsdWU7IC8vIHI6IDAsIGc6IDAsIGI6IDI1NSwgYTogMVxuICogYGBgXG4gKlxuICogQmFzaWNhbGx5LCB5b3UgZG9uJ3QgaGF2ZSB0byBhZGQgeW91ciBvd24gbGlzdGVuZXJzIHRvIGJvdGggKG9wdGlvbmFsbHkpIGFueSBQcm9wZXJ0aWVzIGluIGEgcGFpbnQgYW5kIChvcHRpb25hbGx5KVxuICogYW55IENvbG9yIG9iamVjdHMgKHNpbmNlIGl0J3MgYWxsIGhhbmRsZWQpLlxuICpcbiAqIFRoaXMgaXMgcGFydGljdWxhcmx5IGhlbHBmdWwgdG8gY3JlYXRlIHBhaW50cyB0aGF0IGFyZSBlaXRoZXIgbGlnaHRlciBvciBkYXJrZXIgdGhhbiBhbiBvcmlnaW5hbCBwYWludCAod2hlcmUgaXRcbiAqIHdpbGwgdXBkYXRlIGl0cyBjb2xvciB2YWx1ZSB3aGVuIHRoZSBvcmlnaW5hbCBpcyB1cGRhdGVkKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFByb3BlcnR5LCB7IFByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IENvbG9yLCBQYWludERlZiwgUGFpbnRPYnNlcnZlciwgc2NlbmVyeSwgVFBhaW50IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIDAgYXBwbGllcyBubyBjaGFuZ2UuIFBvc2l0aXZlIG51bWJlcnMgYnJpZ2h0ZW4gdGhlIGNvbG9yIHVwIHRvIDEgKHdoaXRlKS4gTmVnYXRpdmUgbnVtYmVycyBkYXJrZW5cbiAgLy8gdGhlIGNvbG9yIHVwIHRvIC0xIChibGFjaykuIFNlZSBzZXRMdW1pbmFuY2VGYWN0b3IoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgbHVtaW5hbmNlRmFjdG9yPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUGFpbnRDb2xvclByb3BlcnR5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUHJvcGVydHlPcHRpb25zPENvbG9yPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFpbnRDb2xvclByb3BlcnR5IGV4dGVuZHMgUHJvcGVydHk8Q29sb3I+IHtcblxuICBwcml2YXRlIF9wYWludDogVFBhaW50O1xuXG4gIC8vIFNlZSBzZXRMdW1pbmFuY2VGYWN0b3IoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgcHJpdmF0ZSBfbHVtaW5hbmNlRmFjdG9yOiBudW1iZXI7XG5cbiAgLy8gT3VyIFwicGFpbnQgY2hhbmdlZFwiIGxpc3RlbmVyLCB3aWxsIHVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eS5cbiAgcHJpdmF0ZSBfY2hhbmdlTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgcHJpdmF0ZSBfcGFpbnRPYnNlcnZlcjogUGFpbnRPYnNlcnZlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBhaW50OiBUUGFpbnQsIHByb3ZpZGVkT3B0aW9ucz86IFBhaW50Q29sb3JQcm9wZXJ0eU9wdGlvbnMgKSB7XG4gICAgY29uc3QgaW5pdGlhbENvbG9yID0gUGFpbnREZWYudG9Db2xvciggcGFpbnQgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGFpbnRDb2xvclByb3BlcnR5T3B0aW9ucywgU2VsZk9wdGlvbnMsIFByb3BlcnR5T3B0aW9uczxDb2xvcj4+KCkoIHtcbiAgICAgIGx1bWluYW5jZUZhY3RvcjogMCxcblxuICAgICAgLy8gUHJvcGVydHkgb3B0aW9uc1xuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicgLy8gV2UgZG9uJ3QgbmVlZCB0byByZW5vdGlmeSBmb3IgZXF1aXZhbGVudCBjb2xvcnNcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBpbml0aWFsQ29sb3IsIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuX3BhaW50ID0gbnVsbDtcbiAgICB0aGlzLl9sdW1pbmFuY2VGYWN0b3IgPSBvcHRpb25zLmx1bWluYW5jZUZhY3RvcjtcbiAgICB0aGlzLl9jaGFuZ2VMaXN0ZW5lciA9IHRoaXMuaW52YWxpZGF0ZVBhaW50LmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLl9wYWludE9ic2VydmVyID0gbmV3IFBhaW50T2JzZXJ2ZXIoIHRoaXMuX2NoYW5nZUxpc3RlbmVyICk7XG5cbiAgICB0aGlzLnNldFBhaW50KCBwYWludCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1cnJlbnQgcGFpbnQgb2YgdGhlIFBhaW50Q29sb3JQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyBzZXRQYWludCggcGFpbnQ6IFRQYWludCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQYWludERlZi5pc1BhaW50RGVmKCBwYWludCApICk7XG5cbiAgICB0aGlzLl9wYWludCA9IHBhaW50O1xuICAgIHRoaXMuX3BhaW50T2JzZXJ2ZXIuc2V0UHJpbWFyeSggcGFpbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcGFpbnQoIHZhbHVlOiBUUGFpbnQgKSB7IHRoaXMuc2V0UGFpbnQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IHBhaW50KCk6IFRQYWludCB7IHJldHVybiB0aGlzLmdldFBhaW50KCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCBwYWludC5cbiAgICovXG4gIHB1YmxpYyBnZXRQYWludCgpOiBUUGFpbnQge1xuICAgIHJldHVybiB0aGlzLl9wYWludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjdXJyZW50IHZhbHVlIHVzZWQgZm9yIGFkanVzdGluZyB0aGUgYnJpZ2h0bmVzcyBvciBkYXJrbmVzcyAobHVtaW5hbmNlKSBvZiB0aGUgY29sb3IuXG4gICAqXG4gICAqIElmIHRoaXMgZmFjdG9yIGlzIGEgbm9uLXplcm8gdmFsdWUsIHRoZSB2YWx1ZSBvZiB0aGlzIFByb3BlcnR5IHdpbGwgYmUgZWl0aGVyIGEgYnJpZ2h0ZW5lZCBvciBkYXJrZW5lZCB2ZXJzaW9uIG9mXG4gICAqIHRoZSBwYWludCAoZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZSBvZiB0aGUgZmFjdG9yKS4gMCBhcHBsaWVzIG5vIGNoYW5nZS4gUG9zaXRpdmUgbnVtYmVycyBicmlnaHRlbiB0aGUgY29sb3IgdXAgdG9cbiAgICogMSAod2hpdGUpLiBOZWdhdGl2ZSBudW1iZXJzIGRhcmtlbiB0aGUgY29sb3IgdXAgdG8gLTEgKGJsYWNrKS5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIGlmIHRoZSBnaXZlbiBwYWludCBpcyBibHVlLCB0aGUgYmVsb3cgZmFjdG9ycyB3aWxsIHJlc3VsdCBpbjpcbiAgICpcbiAgICogICAtMTogYmxhY2tcbiAgICogLTAuNTogZGFyayBibHVlXG4gICAqICAgIDA6IGJsdWVcbiAgICogIDAuNTogbGlnaHQgYmx1ZVxuICAgKiAgICAxOiB3aGl0ZVxuICAgKlxuICAgKiBXaXRoIGludGVybWVkaWF0ZSB2YWx1ZXMgYmFzaWNhbGx5IFwiaW50ZXJwb2xhdGVkXCIuIFRoaXMgdXNlcyB0aGUgYENvbG9yYCBjb2xvclV0aWxzQnJpZ2h0bmVzcyBtZXRob2QgdG8gYWRqdXN0XG4gICAqIHRoZSBwYWludC5cbiAgICovXG4gIHB1YmxpYyBzZXRMdW1pbmFuY2VGYWN0b3IoIGx1bWluYW5jZUZhY3RvcjogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGx1bWluYW5jZUZhY3RvciA+PSAtMSAmJiBsdW1pbmFuY2VGYWN0b3IgPD0gMSApO1xuXG4gICAgaWYgKCB0aGlzLmx1bWluYW5jZUZhY3RvciAhPT0gbHVtaW5hbmNlRmFjdG9yICkge1xuICAgICAgdGhpcy5fbHVtaW5hbmNlRmFjdG9yID0gbHVtaW5hbmNlRmFjdG9yO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgbHVtaW5hbmNlRmFjdG9yKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEx1bWluYW5jZUZhY3RvciggdmFsdWUgKTsgfVxuXG4gIHB1YmxpYyBnZXQgbHVtaW5hbmNlRmFjdG9yKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEx1bWluYW5jZUZhY3RvcigpOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUgdXNlZCBmb3IgYWRqdXN0aW5nIHRoZSBicmlnaHRuZXNzIG9yIGRhcmtuZXNzIChsdW1pbmFuY2UpIG9mIHRoZSBjb2xvci5cbiAgICpcbiAgICogU2VlIHNldEx1bWluYW5jZUZhY3RvcigpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldEx1bWluYW5jZUZhY3RvcigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9sdW1pbmFuY2VGYWN0b3I7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eS5cbiAgICovXG4gIHByaXZhdGUgaW52YWxpZGF0ZVBhaW50KCk6IHZvaWQge1xuICAgIHRoaXMudmFsdWUgPSBQYWludERlZi50b0NvbG9yKCB0aGlzLl9wYWludCApLmNvbG9yVXRpbHNCcmlnaHRuZXNzKCB0aGlzLl9sdW1pbmFuY2VGYWN0b3IgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5wYWludCA9IG51bGw7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BhaW50Q29sb3JQcm9wZXJ0eScsIFBhaW50Q29sb3JQcm9wZXJ0eSApOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIlBhaW50RGVmIiwiUGFpbnRPYnNlcnZlciIsInNjZW5lcnkiLCJQYWludENvbG9yUHJvcGVydHkiLCJzZXRQYWludCIsInBhaW50IiwiYXNzZXJ0IiwiaXNQYWludERlZiIsIl9wYWludCIsIl9wYWludE9ic2VydmVyIiwic2V0UHJpbWFyeSIsInZhbHVlIiwiZ2V0UGFpbnQiLCJzZXRMdW1pbmFuY2VGYWN0b3IiLCJsdW1pbmFuY2VGYWN0b3IiLCJfbHVtaW5hbmNlRmFjdG9yIiwiaW52YWxpZGF0ZVBhaW50IiwiZ2V0THVtaW5hbmNlRmFjdG9yIiwidG9Db2xvciIsImNvbG9yVXRpbHNCcmlnaHRuZXNzIiwiZGlzcG9zZSIsInByb3ZpZGVkT3B0aW9ucyIsImluaXRpYWxDb2xvciIsIm9wdGlvbnMiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsIl9jaGFuZ2VMaXN0ZW5lciIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQ0MsR0FFRCxPQUFPQSxjQUFtQywrQkFBK0I7QUFDekUsT0FBT0MsZUFBZSxxQ0FBcUM7QUFDM0QsU0FBZ0JDLFFBQVEsRUFBRUMsYUFBYSxFQUFFQyxPQUFPLFFBQWdCLGdCQUFnQjtBQVVqRSxJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQkw7SUFnQzlDOztHQUVDLEdBQ0QsQUFBT00sU0FBVUMsS0FBYSxFQUFTO1FBQ3JDQyxVQUFVQSxPQUFRTixTQUFTTyxVQUFVLENBQUVGO1FBRXZDLElBQUksQ0FBQ0csTUFBTSxHQUFHSDtRQUNkLElBQUksQ0FBQ0ksY0FBYyxDQUFDQyxVQUFVLENBQUVMO0lBQ2xDO0lBRUEsSUFBV0EsTUFBT00sS0FBYSxFQUFHO1FBQUUsSUFBSSxDQUFDUCxRQUFRLENBQUVPO0lBQVM7SUFFNUQsSUFBV04sUUFBZ0I7UUFBRSxPQUFPLElBQUksQ0FBQ08sUUFBUTtJQUFJO0lBRXJEOztHQUVDLEdBQ0QsQUFBT0EsV0FBbUI7UUFDeEIsT0FBTyxJQUFJLENBQUNKLE1BQU07SUFDcEI7SUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkMsR0FDRCxBQUFPSyxtQkFBb0JDLGVBQXVCLEVBQVM7UUFDekRSLFVBQVVBLE9BQVFRLG1CQUFtQixDQUFDLEtBQUtBLG1CQUFtQjtRQUU5RCxJQUFLLElBQUksQ0FBQ0EsZUFBZSxLQUFLQSxpQkFBa0I7WUFDOUMsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0Q7WUFFeEIsSUFBSSxDQUFDRSxlQUFlO1FBQ3RCO0lBQ0Y7SUFFQSxJQUFXRixnQkFBaUJILEtBQWEsRUFBRztRQUFFLElBQUksQ0FBQ0Usa0JBQWtCLENBQUVGO0lBQVM7SUFFaEYsSUFBV0csa0JBQTBCO1FBQUUsT0FBTyxJQUFJLENBQUNHLGtCQUFrQjtJQUFJO0lBRXpFOzs7O0dBSUMsR0FDRCxBQUFPQSxxQkFBNkI7UUFDbEMsT0FBTyxJQUFJLENBQUNGLGdCQUFnQjtJQUM5QjtJQUVBOztHQUVDLEdBQ0QsQUFBUUMsa0JBQXdCO1FBQzlCLElBQUksQ0FBQ0wsS0FBSyxHQUFHWCxTQUFTa0IsT0FBTyxDQUFFLElBQUksQ0FBQ1YsTUFBTSxFQUFHVyxvQkFBb0IsQ0FBRSxJQUFJLENBQUNKLGdCQUFnQjtJQUMxRjtJQUVBOztHQUVDLEdBQ0QsQUFBZ0JLLFVBQWdCO1FBQzlCLElBQUksQ0FBQ2YsS0FBSyxHQUFHO1FBRWIsS0FBSyxDQUFDZTtJQUNSO0lBaEdBLFlBQW9CZixLQUFhLEVBQUVnQixlQUEyQyxDQUFHO1FBQy9FLE1BQU1DLGVBQWV0QixTQUFTa0IsT0FBTyxDQUFFYjtRQUV2QyxNQUFNa0IsVUFBVXhCLFlBQTZFO1lBQzNGZSxpQkFBaUI7WUFFakIsbUJBQW1CO1lBQ25CVSx5QkFBeUIsaUJBQWlCLGtEQUFrRDtRQUM5RixHQUFHSDtRQUVILEtBQUssQ0FBRUMsY0FBY0M7UUFFckIsSUFBSSxDQUFDZixNQUFNLEdBQUc7UUFDZCxJQUFJLENBQUNPLGdCQUFnQixHQUFHUSxRQUFRVCxlQUFlO1FBQy9DLElBQUksQ0FBQ1csZUFBZSxHQUFHLElBQUksQ0FBQ1QsZUFBZSxDQUFDVSxJQUFJLENBQUUsSUFBSTtRQUN0RCxJQUFJLENBQUNqQixjQUFjLEdBQUcsSUFBSVIsY0FBZSxJQUFJLENBQUN3QixlQUFlO1FBRTdELElBQUksQ0FBQ3JCLFFBQVEsQ0FBRUM7SUFDakI7QUErRUY7QUE3R0EsU0FBcUJGLGdDQTZHcEI7QUFFREQsUUFBUXlCLFFBQVEsQ0FBRSxzQkFBc0J4QiJ9