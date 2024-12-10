// Copyright 2013-2024, University of Colorado Boulder
/**
 * Abstract base type for LinearGradient and RadialGradient.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import { Color, Paint, scenery } from '../imports.js';
let Gradient = class Gradient extends Paint {
    /**
   * Adds a color stop to the gradient.
   *
   * Color stops should be added in order (monotonically increasing ratio values).
   *
   * NOTE: Color stops should only be added before using the gradient as a fill/stroke. Adding stops afterwards
   *       will result in undefined behavior.
   * TODO: Catch attempts to do the above. https://github.com/phetsims/scenery/issues/1581
   *
   * @param ratio - Monotonically increasing value in the range of 0 to 1
   * @param color
   * @returns - for chaining
   */ addColorStop(ratio, color) {
        assert && assert(ratio >= 0 && ratio <= 1, 'Ratio needs to be between 0,1 inclusively');
        assert && assert(color === null || typeof color === 'string' || color instanceof Color || isTReadOnlyProperty(color) && (color.value === null || typeof color.value === 'string' || color.value instanceof Color), 'Color should match the addColorStop type specification');
        if (this.lastStopRatio > ratio) {
            // fail out, since browser quirks go crazy for this case
            throw new Error('Color stops not specified in the order of increasing ratios');
        } else {
            this.lastStopRatio = ratio;
        }
        this.stops.push({
            ratio: ratio,
            color: color
        });
        // Easiest to just push a value here, so that it is always the same length as the stops array.
        this.lastColorStopValues.push('');
        return this;
    }
    /**
   * Returns stops suitable for direct SVG use.
   */ getSVGStops() {
        return this.stops;
    }
    /**
   * Forces a re-check of whether colors have changed, so that the Canvas gradient can be regenerated if
   * necessary.
   */ invalidateCanvasGradient() {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`Invalidated Canvas Gradient for #${this.id}`);
        this.colorStopsDirty = true;
    }
    /**
   * Compares the current color values with the last-recorded values for the current Canvas gradient.
   *
   * This is needed since the values of color properties (or the color itself) may change.
   */ haveCanvasColorStopsChanged() {
        if (this.lastColorStopValues === null) {
            return true;
        }
        for(let i = 0; i < this.stops.length; i++){
            if (Gradient.colorToString(this.stops[i].color) !== this.lastColorStopValues[i]) {
                return true;
            }
        }
        return false;
    }
    /**
   * Returns an object that can be passed to a Canvas context's fillStyle or strokeStyle.
   */ getCanvasStyle() {
        // Check if we need to regenerate the Canvas gradient
        if (!this.canvasGradient || this.colorStopsDirty && this.haveCanvasColorStopsChanged()) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`Regenerating Canvas Gradient for #${this.id}`);
            sceneryLog && sceneryLog.Paints && sceneryLog.push();
            this.colorStopsDirty = false;
            cleanArray(this.lastColorStopValues);
            this.canvasGradient = this.createCanvasGradient();
            for(let i = 0; i < this.stops.length; i++){
                const stop = this.stops[i];
                const colorString = Gradient.colorToString(stop.color);
                this.canvasGradient.addColorStop(stop.ratio, colorString);
                // Save it so we can compare next time whether our generated gradient would have changed
                this.lastColorStopValues.push(colorString);
            }
            sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        }
        return this.canvasGradient;
    }
    /**
   * Returns the current value of the generally-allowed color types for Gradient, as a string.
   */ static colorToString(color) {
        // to {Color|string|null}
        if (isTReadOnlyProperty(color)) {
            color = color.value;
        }
        // to {Color|string}
        if (color === null) {
            color = 'transparent';
        }
        // to {string}
        if (color instanceof Color) {
            color = color.toCSS();
        }
        return color;
    }
    /**
   * TODO: add the ability to specify the color-stops inline. possibly [ [0,color1], [0.5,color2], [1,color3] ] https://github.com/phetsims/scenery/issues/1581
   */ constructor(){
        super();
        assert && assert(this.constructor.name !== 'Gradient', 'Please create a LinearGradient or RadialGradient. Do not directly use the supertype Gradient.');
        this.stops = [];
        this.lastStopRatio = 0;
        this.canvasGradient = null;
        this.colorStopsDirty = false;
        this.lastColorStopValues = [];
    }
};
export { Gradient as default };
Gradient.prototype.isGradient = true;
scenery.register('Gradient', Gradient);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9HcmFkaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIHR5cGUgZm9yIExpbmVhckdyYWRpZW50IGFuZCBSYWRpYWxHcmFkaWVudC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IHsgQ29sb3IsIFBhaW50LCBzY2VuZXJ5LCBUQ29sb3IgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IHR5cGUgR3JhZGllbnRTdG9wID0ge1xuICByYXRpbzogbnVtYmVyO1xuICBjb2xvcjogVENvbG9yO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgR3JhZGllbnQgZXh0ZW5kcyBQYWludCB7XG5cbiAgcHVibGljIHN0b3BzOiBHcmFkaWVudFN0b3BbXTsgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHByaXZhdGUgbGFzdFN0b3BSYXRpbzogbnVtYmVyO1xuICBwcml2YXRlIGNhbnZhc0dyYWRpZW50OiBDYW52YXNHcmFkaWVudCB8IG51bGw7IC8vIGxhemlseSBjcmVhdGVkXG5cbiAgLy8gV2hldGhlciB3ZSBzaG91bGQgZm9yY2UgYSBjaGVjayBvZiB3aGV0aGVyIHN0b3BzIGhhdmUgY2hhbmdlZFxuICBwcml2YXRlIGNvbG9yU3RvcHNEaXJ0eTogYm9vbGVhbjtcblxuICAvLyBVc2VkIHRvIGNoZWNrIHRvIHNlZSBpZiBjb2xvcnMgaGF2ZSBjaGFuZ2VkIHNpbmNlIGxhc3QgdGltZVxuICBwcml2YXRlIGxhc3RDb2xvclN0b3BWYWx1ZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBUT0RPOiBhZGQgdGhlIGFiaWxpdHkgdG8gc3BlY2lmeSB0aGUgY29sb3Itc3RvcHMgaW5saW5lLiBwb3NzaWJseSBbIFswLGNvbG9yMV0sIFswLjUsY29sb3IyXSwgWzEsY29sb3IzXSBdIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29uc3RydWN0b3IubmFtZSAhPT0gJ0dyYWRpZW50JyxcbiAgICAgICdQbGVhc2UgY3JlYXRlIGEgTGluZWFyR3JhZGllbnQgb3IgUmFkaWFsR3JhZGllbnQuIERvIG5vdCBkaXJlY3RseSB1c2UgdGhlIHN1cGVydHlwZSBHcmFkaWVudC4nICk7XG5cbiAgICB0aGlzLnN0b3BzID0gW107XG4gICAgdGhpcy5sYXN0U3RvcFJhdGlvID0gMDtcbiAgICB0aGlzLmNhbnZhc0dyYWRpZW50ID0gbnVsbDtcbiAgICB0aGlzLmNvbG9yU3RvcHNEaXJ0eSA9IGZhbHNlO1xuICAgIHRoaXMubGFzdENvbG9yU3RvcFZhbHVlcyA9IFtdO1xuICB9XG5cblxuICAvKipcbiAgICogQWRkcyBhIGNvbG9yIHN0b3AgdG8gdGhlIGdyYWRpZW50LlxuICAgKlxuICAgKiBDb2xvciBzdG9wcyBzaG91bGQgYmUgYWRkZWQgaW4gb3JkZXIgKG1vbm90b25pY2FsbHkgaW5jcmVhc2luZyByYXRpbyB2YWx1ZXMpLlxuICAgKlxuICAgKiBOT1RFOiBDb2xvciBzdG9wcyBzaG91bGQgb25seSBiZSBhZGRlZCBiZWZvcmUgdXNpbmcgdGhlIGdyYWRpZW50IGFzIGEgZmlsbC9zdHJva2UuIEFkZGluZyBzdG9wcyBhZnRlcndhcmRzXG4gICAqICAgICAgIHdpbGwgcmVzdWx0IGluIHVuZGVmaW5lZCBiZWhhdmlvci5cbiAgICogVE9ETzogQ2F0Y2ggYXR0ZW1wdHMgdG8gZG8gdGhlIGFib3ZlLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKlxuICAgKiBAcGFyYW0gcmF0aW8gLSBNb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgdmFsdWUgaW4gdGhlIHJhbmdlIG9mIDAgdG8gMVxuICAgKiBAcGFyYW0gY29sb3JcbiAgICogQHJldHVybnMgLSBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHB1YmxpYyBhZGRDb2xvclN0b3AoIHJhdGlvOiBudW1iZXIsIGNvbG9yOiBUQ29sb3IgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmF0aW8gPj0gMCAmJiByYXRpbyA8PSAxLCAnUmF0aW8gbmVlZHMgdG8gYmUgYmV0d2VlbiAwLDEgaW5jbHVzaXZlbHknICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sb3IgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29sb3IgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgY29sb3IgaW5zdGFuY2VvZiBDb2xvciB8fFxuICAgICAgICAgICAgICAgICAgICAgICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggY29sb3IgKSAmJiAoIGNvbG9yLnZhbHVlID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbG9yLnZhbHVlID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yLnZhbHVlIGluc3RhbmNlb2YgQ29sb3IgKSApLFxuICAgICAgJ0NvbG9yIHNob3VsZCBtYXRjaCB0aGUgYWRkQ29sb3JTdG9wIHR5cGUgc3BlY2lmaWNhdGlvbicgKTtcblxuICAgIGlmICggdGhpcy5sYXN0U3RvcFJhdGlvID4gcmF0aW8gKSB7XG4gICAgICAvLyBmYWlsIG91dCwgc2luY2UgYnJvd3NlciBxdWlya3MgZ28gY3JhenkgZm9yIHRoaXMgY2FzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQ29sb3Igc3RvcHMgbm90IHNwZWNpZmllZCBpbiB0aGUgb3JkZXIgb2YgaW5jcmVhc2luZyByYXRpb3MnICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5sYXN0U3RvcFJhdGlvID0gcmF0aW87XG4gICAgfVxuXG4gICAgdGhpcy5zdG9wcy5wdXNoKCB7XG4gICAgICByYXRpbzogcmF0aW8sXG4gICAgICBjb2xvcjogY29sb3JcbiAgICB9ICk7XG5cbiAgICAvLyBFYXNpZXN0IHRvIGp1c3QgcHVzaCBhIHZhbHVlIGhlcmUsIHNvIHRoYXQgaXQgaXMgYWx3YXlzIHRoZSBzYW1lIGxlbmd0aCBhcyB0aGUgc3RvcHMgYXJyYXkuXG4gICAgdGhpcy5sYXN0Q29sb3JTdG9wVmFsdWVzLnB1c2goICcnICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJ0eXBlcyBzaG91bGQgcmV0dXJuIGEgZnJlc2ggQ2FudmFzR3JhZGllbnQgdHlwZS5cbiAgICovXG4gIHB1YmxpYyBhYnN0cmFjdCBjcmVhdGVDYW52YXNHcmFkaWVudCgpOiBDYW52YXNHcmFkaWVudDtcblxuICAvKipcbiAgICogUmV0dXJucyBzdG9wcyBzdWl0YWJsZSBmb3IgZGlyZWN0IFNWRyB1c2UuXG4gICAqL1xuICBwdWJsaWMgZ2V0U1ZHU3RvcHMoKTogR3JhZGllbnRTdG9wW10ge1xuICAgIHJldHVybiB0aGlzLnN0b3BzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlcyBhIHJlLWNoZWNrIG9mIHdoZXRoZXIgY29sb3JzIGhhdmUgY2hhbmdlZCwgc28gdGhhdCB0aGUgQ2FudmFzIGdyYWRpZW50IGNhbiBiZSByZWdlbmVyYXRlZCBpZlxuICAgKiBuZWNlc3NhcnkuXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZUNhbnZhc0dyYWRpZW50KCk6IHZvaWQge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBJbnZhbGlkYXRlZCBDYW52YXMgR3JhZGllbnQgZm9yICMke3RoaXMuaWR9YCApO1xuICAgIHRoaXMuY29sb3JTdG9wc0RpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGUgY3VycmVudCBjb2xvciB2YWx1ZXMgd2l0aCB0aGUgbGFzdC1yZWNvcmRlZCB2YWx1ZXMgZm9yIHRoZSBjdXJyZW50IENhbnZhcyBncmFkaWVudC5cbiAgICpcbiAgICogVGhpcyBpcyBuZWVkZWQgc2luY2UgdGhlIHZhbHVlcyBvZiBjb2xvciBwcm9wZXJ0aWVzIChvciB0aGUgY29sb3IgaXRzZWxmKSBtYXkgY2hhbmdlLlxuICAgKi9cbiAgcHJpdmF0ZSBoYXZlQ2FudmFzQ29sb3JTdG9wc0NoYW5nZWQoKTogYm9vbGVhbiB7XG4gICAgaWYgKCB0aGlzLmxhc3RDb2xvclN0b3BWYWx1ZXMgPT09IG51bGwgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnN0b3BzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBHcmFkaWVudC5jb2xvclRvU3RyaW5nKCB0aGlzLnN0b3BzWyBpIF0uY29sb3IgKSAhPT0gdGhpcy5sYXN0Q29sb3JTdG9wVmFsdWVzWyBpIF0gKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gYSBDYW52YXMgY29udGV4dCdzIGZpbGxTdHlsZSBvciBzdHJva2VTdHlsZS5cbiAgICovXG4gIHB1YmxpYyBnZXRDYW52YXNTdHlsZSgpOiBDYW52YXNHcmFkaWVudCB7XG4gICAgLy8gQ2hlY2sgaWYgd2UgbmVlZCB0byByZWdlbmVyYXRlIHRoZSBDYW52YXMgZ3JhZGllbnRcbiAgICBpZiAoICF0aGlzLmNhbnZhc0dyYWRpZW50IHx8ICggdGhpcy5jb2xvclN0b3BzRGlydHkgJiYgdGhpcy5oYXZlQ2FudmFzQ29sb3JTdG9wc0NoYW5nZWQoKSApICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFJlZ2VuZXJhdGluZyBDYW52YXMgR3JhZGllbnQgZm9yICMke3RoaXMuaWR9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgdGhpcy5jb2xvclN0b3BzRGlydHkgPSBmYWxzZTtcblxuICAgICAgY2xlYW5BcnJheSggdGhpcy5sYXN0Q29sb3JTdG9wVmFsdWVzICk7XG4gICAgICB0aGlzLmNhbnZhc0dyYWRpZW50ID0gdGhpcy5jcmVhdGVDYW52YXNHcmFkaWVudCgpO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnN0b3BzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBzdG9wID0gdGhpcy5zdG9wc1sgaSBdO1xuXG4gICAgICAgIGNvbnN0IGNvbG9yU3RyaW5nID0gR3JhZGllbnQuY29sb3JUb1N0cmluZyggc3RvcC5jb2xvciApO1xuICAgICAgICB0aGlzLmNhbnZhc0dyYWRpZW50LmFkZENvbG9yU3RvcCggc3RvcC5yYXRpbywgY29sb3JTdHJpbmcgKTtcblxuICAgICAgICAvLyBTYXZlIGl0IHNvIHdlIGNhbiBjb21wYXJlIG5leHQgdGltZSB3aGV0aGVyIG91ciBnZW5lcmF0ZWQgZ3JhZGllbnQgd291bGQgaGF2ZSBjaGFuZ2VkXG4gICAgICAgIHRoaXMubGFzdENvbG9yU3RvcFZhbHVlcy5wdXNoKCBjb2xvclN0cmluZyApO1xuICAgICAgfVxuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY2FudmFzR3JhZGllbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZ2VuZXJhbGx5LWFsbG93ZWQgY29sb3IgdHlwZXMgZm9yIEdyYWRpZW50LCBhcyBhIHN0cmluZy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY29sb3JUb1N0cmluZyggY29sb3I6IFRDb2xvciApOiBzdHJpbmcge1xuICAgIC8vIHRvIHtDb2xvcnxzdHJpbmd8bnVsbH1cbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIGNvbG9yICkgKSB7XG4gICAgICBjb2xvciA9IGNvbG9yLnZhbHVlO1xuICAgIH1cblxuICAgIC8vIHRvIHtDb2xvcnxzdHJpbmd9XG4gICAgaWYgKCBjb2xvciA9PT0gbnVsbCApIHtcbiAgICAgIGNvbG9yID0gJ3RyYW5zcGFyZW50JztcbiAgICB9XG5cbiAgICAvLyB0byB7c3RyaW5nfVxuICAgIGlmICggY29sb3IgaW5zdGFuY2VvZiBDb2xvciApIHtcbiAgICAgIGNvbG9yID0gY29sb3IudG9DU1MoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3I7XG4gIH1cblxuICBwdWJsaWMgaXNHcmFkaWVudCE6IGJvb2xlYW47XG59XG5cbkdyYWRpZW50LnByb3RvdHlwZS5pc0dyYWRpZW50ID0gdHJ1ZTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0dyYWRpZW50JywgR3JhZGllbnQgKTsiXSwibmFtZXMiOlsiaXNUUmVhZE9ubHlQcm9wZXJ0eSIsImNsZWFuQXJyYXkiLCJDb2xvciIsIlBhaW50Iiwic2NlbmVyeSIsIkdyYWRpZW50IiwiYWRkQ29sb3JTdG9wIiwicmF0aW8iLCJjb2xvciIsImFzc2VydCIsInZhbHVlIiwibGFzdFN0b3BSYXRpbyIsIkVycm9yIiwic3RvcHMiLCJwdXNoIiwibGFzdENvbG9yU3RvcFZhbHVlcyIsImdldFNWR1N0b3BzIiwiaW52YWxpZGF0ZUNhbnZhc0dyYWRpZW50Iiwic2NlbmVyeUxvZyIsIlBhaW50cyIsImlkIiwiY29sb3JTdG9wc0RpcnR5IiwiaGF2ZUNhbnZhc0NvbG9yU3RvcHNDaGFuZ2VkIiwiaSIsImxlbmd0aCIsImNvbG9yVG9TdHJpbmciLCJnZXRDYW52YXNTdHlsZSIsImNhbnZhc0dyYWRpZW50IiwiY3JlYXRlQ2FudmFzR3JhZGllbnQiLCJzdG9wIiwiY29sb3JTdHJpbmciLCJwb3AiLCJ0b0NTUyIsImNvbnN0cnVjdG9yIiwibmFtZSIsInByb3RvdHlwZSIsImlzR3JhZGllbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxtQkFBbUIsUUFBUSx3Q0FBd0M7QUFDNUUsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxTQUFTQyxLQUFLLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxRQUFnQixnQkFBZ0I7QUFPL0MsSUFBQSxBQUFlQyxXQUFmLE1BQWVBLGlCQUFpQkY7SUE2QjdDOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNELEFBQU9HLGFBQWNDLEtBQWEsRUFBRUMsS0FBYSxFQUFTO1FBQ3hEQyxVQUFVQSxPQUFRRixTQUFTLEtBQUtBLFNBQVMsR0FBRztRQUM1Q0UsVUFBVUEsT0FBUUQsVUFBVSxRQUNWLE9BQU9BLFVBQVUsWUFDakJBLGlCQUFpQk4sU0FDZkYsb0JBQXFCUSxVQUFhQSxDQUFBQSxNQUFNRSxLQUFLLEtBQUssUUFDaEIsT0FBT0YsTUFBTUUsS0FBSyxLQUFLLFlBQ3ZCRixNQUFNRSxLQUFLLFlBQVlSLEtBQUksR0FDL0U7UUFFRixJQUFLLElBQUksQ0FBQ1MsYUFBYSxHQUFHSixPQUFRO1lBQ2hDLHdEQUF3RDtZQUN4RCxNQUFNLElBQUlLLE1BQU87UUFDbkIsT0FDSztZQUNILElBQUksQ0FBQ0QsYUFBYSxHQUFHSjtRQUN2QjtRQUVBLElBQUksQ0FBQ00s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