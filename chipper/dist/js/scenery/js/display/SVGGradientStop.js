// Copyright 2017-2024, University of Colorado Boulder
/**
 * Handles creation of an SVG stop element, and handles keeping it updated based on property/color changes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { isTReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Pool from '../../../phet-core/js/Pool.js';
import { Color, scenery, svgns } from '../imports.js';
const scratchColor = new Color('transparent');
let SVGGradientStop = class SVGGradientStop {
    isActiveSVGGradientStop() {
        return !!this.svgGradient;
    }
    initialize(svgGradient, ratio, color) {
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] initialize: ${svgGradient.gradient.id} : ${ratio}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        this.svgGradient = svgGradient;
        this.color = color;
        this.ratio = ratio;
        this.svgElement = this.svgElement || document.createElementNS(svgns, 'stop');
        this.svgElement.setAttribute('offset', '' + ratio);
        this.dirty = true; // true here so our update() actually properly initializes
        this.update();
        this.propertyListener = this.propertyListener || this.onPropertyChange.bind(this);
        this.colorListener = this.colorListener || this.markDirty.bind(this);
        if (isTReadOnlyProperty(color)) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Property listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
            color.lazyLink(this.propertyListener);
            if (color.value instanceof Color) {
                sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
                color.value.changeEmitter.addListener(this.colorListener);
                this.lastColor = color.value;
            }
        } else if (color instanceof Color) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${this.svgGradient.gradient.id} : ${this.ratio}`);
            color.changeEmitter.addListener(this.colorListener);
        }
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
        return this;
    }
    /**
   * Called when our color is a Property and it changes.
   */ onPropertyChange(newValue, oldValue) {
        assert && assert(this.isActiveSVGGradientStop());
        const activeSelf = this;
        if (this.lastColor !== null) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
            this.lastColor.changeEmitter.removeListener(this.colorListener);
            this.lastColor = null;
        }
        if (newValue instanceof Color) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] adding Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
            newValue.changeEmitter.addListener(this.colorListener);
            this.lastColor = newValue;
        }
        this.markDirty();
    }
    /**
   * Should be called when the color stop's value may have changed.
   */ markDirty() {
        assert && assert(this.isActiveSVGGradientStop());
        this.dirty = true;
        this.svgGradient.markDirty();
    }
    /**
   * Updates the color stop to whatever the current color should be.
   */ update() {
        if (!this.dirty) {
            return;
        }
        this.dirty = false;
        assert && assert(this.isActiveSVGGradientStop());
        const activeSelf = this;
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] update: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        // {Color|string|Property.<Color|string|null>|null}
        let color = this.color;
        // to {Color|string|null}
        if (isTReadOnlyProperty(color)) {
            color = color.value;
        }
        // to {Color|string}
        if (color === null) {
            color = 'transparent';
        }
        // to {Color}, in our scratchColor
        if (typeof color === 'string') {
            scratchColor.setCSS(color);
        } else {
            scratchColor.set(color);
        }
        // Since SVG doesn't support parsing scientific notation (e.g. 7e5), we need to output fixed decimal-point strings.
        // Since this needs to be done quickly, and we don't particularly care about slight rounding differences (it's
        // being used for display purposes only, and is never shown to the user), we use the built-in JS toFixed instead of
        // Dot's version of toFixed. See https://github.com/phetsims/kite/issues/50
        const stopOpacityRule = `stop-opacity: ${scratchColor.a.toFixed(20)};`; // eslint-disable-line phet/bad-sim-text
        // For GC, mutate the color so it is just RGB and output that CSS also
        scratchColor.alpha = 1;
        const stopColorRule = `stop-color: ${scratchColor.toCSS()};`;
        this.svgElement.setAttribute('style', `${stopColorRule} ${stopOpacityRule}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    /**
   * Disposes, so that it can be reused from the pool.
   */ dispose() {
        assert && assert(this.isActiveSVGGradientStop());
        const activeSelf = this;
        sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] dispose: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
        sceneryLog && sceneryLog.Paints && sceneryLog.push();
        const color = this.color;
        if (this.lastColor) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
            this.lastColor.changeEmitter.removeListener(this.colorListener);
            this.lastColor = null;
        }
        if (isTReadOnlyProperty(color)) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Property listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
            if (color.hasListener(this.propertyListener)) {
                color.unlink(this.propertyListener);
            }
        } else if (color instanceof Color) {
            sceneryLog && sceneryLog.Paints && sceneryLog.Paints(`[SVGGradientStop] removing Color listener: ${activeSelf.svgGradient.gradient.id} : ${this.ratio}`);
            color.changeEmitter.removeListener(this.colorListener);
        }
        this.color = null; // clear the reference
        this.svgGradient = null; // clear the reference
        this.freeToPool();
        sceneryLog && sceneryLog.Paints && sceneryLog.pop();
    }
    freeToPool() {
        SVGGradientStop.pool.freeToPool(this);
    }
    constructor(svgGradient, ratio, color){
        this.lastColor = null;
        this.initialize(svgGradient, ratio, color);
    }
};
SVGGradientStop.pool = new Pool(SVGGradientStop);
scenery.register('SVGGradientStop', SVGGradientStop);
export default SVGGradientStop;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdHcmFkaWVudFN0b3AudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSGFuZGxlcyBjcmVhdGlvbiBvZiBhbiBTVkcgc3RvcCBlbGVtZW50LCBhbmQgaGFuZGxlcyBrZWVwaW5nIGl0IHVwZGF0ZWQgYmFzZWQgb24gcHJvcGVydHkvY29sb3IgY2hhbmdlcy5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgaXNUUmVhZE9ubHlQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFBvb2wsIHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IFdpdGhvdXROdWxsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9XaXRob3V0TnVsbC5qcyc7XG5pbXBvcnQgeyBBY3RpdmVTVkdHcmFkaWVudCwgQ29sb3IsIHNjZW5lcnksIHN2Z25zLCBUQ29sb3IgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3Qgc2NyYXRjaENvbG9yID0gbmV3IENvbG9yKCAndHJhbnNwYXJlbnQnICk7XG5cbmV4cG9ydCB0eXBlIEFjdGl2ZVNWR0dyYWRpZW50U3RvcCA9IFdpdGhvdXROdWxsPFNWR0dyYWRpZW50U3RvcCwgJ3N2Z0dyYWRpZW50Jz47XG5cbmNsYXNzIFNWR0dyYWRpZW50U3RvcCBpbXBsZW1lbnRzIFRQb29sYWJsZSB7XG5cbiAgLy8gcGVyc2lzdGVudFxuICBwdWJsaWMgc3ZnRWxlbWVudCE6IFNWR1N0b3BFbGVtZW50O1xuXG4gIC8vIHRyYW5zaWVudFxuICBwdWJsaWMgc3ZnR3JhZGllbnQhOiBBY3RpdmVTVkdHcmFkaWVudCB8IG51bGw7XG4gIHB1YmxpYyBjb2xvciE6IFRDb2xvcjtcblxuICBwdWJsaWMgcmF0aW8hOiBudW1iZXI7XG4gIHByaXZhdGUgZGlydHkhOiBib29sZWFuO1xuICBwcml2YXRlIHByb3BlcnR5TGlzdGVuZXIhOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIGNvbG9yTGlzdGVuZXIhOiAoKSA9PiB2b2lkO1xuXG4gIC8vIEFzIGEgd29ya2Fyb3VuZCBmb3IgUHJvcGVydHkgZGVmZXJtZW50IGlzc3Vlcywgd2UnbGwga2VlcCB0cmFjayBvZiB0aGUgbGFzdCBDb2xvciB0aGF0IHdlIGFkZGVkIGEgbGlzdGVuZXIgdG8sIHNvXG4gIC8vIHRoYXQgd2UgY2FuIGNsZWFuIHVwIHRoaW5ncyBQcm9wZXJ0eSBFVkVOIHdoZW4gd2UgZG9uJ3QgZ2V0IGNvcnJlY3QgUHJvcGVydHkgY2hhbmdlIG5vdGlmaWNhdGlvbnMuIFRPRE86IHJlbW92ZSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTYyNFxuICBwcml2YXRlIGxhc3RDb2xvciE6IENvbG9yIHwgbnVsbDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN2Z0dyYWRpZW50OiBBY3RpdmVTVkdHcmFkaWVudCwgcmF0aW86IG51bWJlciwgY29sb3I6IFRDb2xvciApIHtcbiAgICB0aGlzLmxhc3RDb2xvciA9IG51bGw7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIHN2Z0dyYWRpZW50LCByYXRpbywgY29sb3IgKTtcbiAgfVxuXG4gIHB1YmxpYyBpc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpOiB0aGlzIGlzIEFjdGl2ZVNWR0dyYWRpZW50U3RvcCB7IHJldHVybiAhIXRoaXMuc3ZnR3JhZGllbnQ7IH1cblxuICBwdWJsaWMgaW5pdGlhbGl6ZSggc3ZnR3JhZGllbnQ6IEFjdGl2ZVNWR0dyYWRpZW50LCByYXRpbzogbnVtYmVyLCBjb2xvcjogVENvbG9yICk6IHRoaXMge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSBpbml0aWFsaXplOiAke3N2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7cmF0aW99YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB0aGlzLnN2Z0dyYWRpZW50ID0gc3ZnR3JhZGllbnQ7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMucmF0aW8gPSByYXRpbztcblxuICAgIHRoaXMuc3ZnRWxlbWVudCA9IHRoaXMuc3ZnRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnc3RvcCcgKTtcblxuICAgIHRoaXMuc3ZnRWxlbWVudC5zZXRBdHRyaWJ1dGUoICdvZmZzZXQnLCAnJyArIHJhdGlvICk7XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gdHJ1ZSBoZXJlIHNvIG91ciB1cGRhdGUoKSBhY3R1YWxseSBwcm9wZXJseSBpbml0aWFsaXplc1xuXG4gICAgdGhpcy51cGRhdGUoKTtcblxuICAgIHRoaXMucHJvcGVydHlMaXN0ZW5lciA9IHRoaXMucHJvcGVydHlMaXN0ZW5lciB8fCB0aGlzLm9uUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuY29sb3JMaXN0ZW5lciA9IHRoaXMuY29sb3JMaXN0ZW5lciB8fCB0aGlzLm1hcmtEaXJ0eS5iaW5kKCB0aGlzICk7XG5cbiAgICBpZiAoIGlzVFJlYWRPbmx5UHJvcGVydHkoIGNvbG9yICkgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gYWRkaW5nIFByb3BlcnR5IGxpc3RlbmVyOiAke3RoaXMuc3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHt0aGlzLnJhdGlvfWAgKTtcbiAgICAgIGNvbG9yLmxhenlMaW5rKCB0aGlzLnByb3BlcnR5TGlzdGVuZXIgKTtcbiAgICAgIGlmICggY29sb3IudmFsdWUgaW5zdGFuY2VvZiBDb2xvciApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGFkZGluZyBDb2xvciBsaXN0ZW5lcjogJHt0aGlzLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XG4gICAgICAgIGNvbG9yLnZhbHVlLmNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY29sb3JMaXN0ZW5lciApO1xuICAgICAgICB0aGlzLmxhc3RDb2xvciA9IGNvbG9yLnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggY29sb3IgaW5zdGFuY2VvZiBDb2xvciApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSBhZGRpbmcgQ29sb3IgbGlzdGVuZXI6ICR7dGhpcy5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xuICAgICAgY29sb3IuY2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5jb2xvckxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIGNvbG9yIGlzIGEgUHJvcGVydHkgYW5kIGl0IGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIG9uUHJvcGVydHlDaGFuZ2UoIG5ld1ZhbHVlOiBDb2xvciB8IHN0cmluZyB8IG51bGwsIG9sZFZhbHVlOiBDb2xvciB8IHN0cmluZyB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wO1xuXG4gICAgaWYgKCB0aGlzLmxhc3RDb2xvciAhPT0gbnVsbCApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSByZW1vdmluZyBDb2xvciBsaXN0ZW5lcjogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XG4gICAgICB0aGlzLmxhc3RDb2xvci5jaGFuZ2VFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmNvbG9yTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMubGFzdENvbG9yID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoIG5ld1ZhbHVlIGluc3RhbmNlb2YgQ29sb3IgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gYWRkaW5nIENvbG9yIGxpc3RlbmVyOiAke2FjdGl2ZVNlbGYuc3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHt0aGlzLnJhdGlvfWAgKTtcbiAgICAgIG5ld1ZhbHVlLmNoYW5nZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuY29sb3JMaXN0ZW5lciApO1xuICAgICAgdGhpcy5sYXN0Q29sb3IgPSBuZXdWYWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNob3VsZCBiZSBjYWxsZWQgd2hlbiB0aGUgY29sb3Igc3RvcCdzIHZhbHVlIG1heSBoYXZlIGNoYW5nZWQuXG4gICAqL1xuICBwcml2YXRlIG1hcmtEaXJ0eSgpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQWN0aXZlU1ZHR3JhZGllbnRTdG9wKCkgKTtcblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICAgICggdGhpcyBhcyBBY3RpdmVTVkdHcmFkaWVudFN0b3AgKS5zdmdHcmFkaWVudC5tYXJrRGlydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjb2xvciBzdG9wIHRvIHdoYXRldmVyIHRoZSBjdXJyZW50IGNvbG9yIHNob3VsZCBiZS5cbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5kaXJ0eSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIHVwZGF0ZTogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIHtDb2xvcnxzdHJpbmd8UHJvcGVydHkuPENvbG9yfHN0cmluZ3xudWxsPnxudWxsfVxuICAgIGxldCBjb2xvciA9IHRoaXMuY29sb3I7XG5cbiAgICAvLyB0byB7Q29sb3J8c3RyaW5nfG51bGx9XG4gICAgaWYgKCBpc1RSZWFkT25seVByb3BlcnR5KCBjb2xvciApICkge1xuICAgICAgY29sb3IgPSBjb2xvci52YWx1ZTtcbiAgICB9XG5cbiAgICAvLyB0byB7Q29sb3J8c3RyaW5nfVxuICAgIGlmICggY29sb3IgPT09IG51bGwgKSB7XG4gICAgICBjb2xvciA9ICd0cmFuc3BhcmVudCc7XG4gICAgfVxuXG4gICAgLy8gdG8ge0NvbG9yfSwgaW4gb3VyIHNjcmF0Y2hDb2xvclxuICAgIGlmICggdHlwZW9mIGNvbG9yID09PSAnc3RyaW5nJyApIHtcbiAgICAgIHNjcmF0Y2hDb2xvci5zZXRDU1MoIGNvbG9yICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2NyYXRjaENvbG9yLnNldCggY29sb3IgKTtcbiAgICB9XG5cbiAgICAvLyBTaW5jZSBTVkcgZG9lc24ndCBzdXBwb3J0IHBhcnNpbmcgc2NpZW50aWZpYyBub3RhdGlvbiAoZS5nLiA3ZTUpLCB3ZSBuZWVkIHRvIG91dHB1dCBmaXhlZCBkZWNpbWFsLXBvaW50IHN0cmluZ3MuXG4gICAgLy8gU2luY2UgdGhpcyBuZWVkcyB0byBiZSBkb25lIHF1aWNrbHksIGFuZCB3ZSBkb24ndCBwYXJ0aWN1bGFybHkgY2FyZSBhYm91dCBzbGlnaHQgcm91bmRpbmcgZGlmZmVyZW5jZXMgKGl0J3NcbiAgICAvLyBiZWluZyB1c2VkIGZvciBkaXNwbGF5IHB1cnBvc2VzIG9ubHksIGFuZCBpcyBuZXZlciBzaG93biB0byB0aGUgdXNlciksIHdlIHVzZSB0aGUgYnVpbHQtaW4gSlMgdG9GaXhlZCBpbnN0ZWFkIG9mXG4gICAgLy8gRG90J3MgdmVyc2lvbiBvZiB0b0ZpeGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzUwXG4gICAgY29uc3Qgc3RvcE9wYWNpdHlSdWxlID0gYHN0b3Atb3BhY2l0eTogJHtzY3JhdGNoQ29sb3IuYS50b0ZpeGVkKCAyMCApfTtgOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG5cbiAgICAvLyBGb3IgR0MsIG11dGF0ZSB0aGUgY29sb3Igc28gaXQgaXMganVzdCBSR0IgYW5kIG91dHB1dCB0aGF0IENTUyBhbHNvXG4gICAgc2NyYXRjaENvbG9yLmFscGhhID0gMTtcbiAgICBjb25zdCBzdG9wQ29sb3JSdWxlID0gYHN0b3AtY29sb3I6ICR7c2NyYXRjaENvbG9yLnRvQ1NTKCl9O2A7XG5cbiAgICB0aGlzLnN2Z0VsZW1lbnQuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCBgJHtzdG9wQ29sb3JSdWxlfSAke3N0b3BPcGFjaXR5UnVsZX1gICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMsIHNvIHRoYXQgaXQgY2FuIGJlIHJldXNlZCBmcm9tIHRoZSBwb29sLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pc0FjdGl2ZVNWR0dyYWRpZW50U3RvcCgpICk7XG4gICAgY29uc3QgYWN0aXZlU2VsZiA9IHRoaXMgYXMgQWN0aXZlU1ZHR3JhZGllbnRTdG9wO1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIGRpc3Bvc2U6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBjb25zdCBjb2xvciA9IHRoaXMuY29sb3I7XG5cbiAgICBpZiAoIHRoaXMubGFzdENvbG9yICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlBhaW50cyAmJiBzY2VuZXJ5TG9nLlBhaW50cyggYFtTVkdHcmFkaWVudFN0b3BdIHJlbW92aW5nIENvbG9yIGxpc3RlbmVyOiAke2FjdGl2ZVNlbGYuc3ZnR3JhZGllbnQuZ3JhZGllbnQuaWR9IDogJHt0aGlzLnJhdGlvfWAgKTtcbiAgICAgIHRoaXMubGFzdENvbG9yLmNoYW5nZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuY29sb3JMaXN0ZW5lciApO1xuICAgICAgdGhpcy5sYXN0Q29sb3IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggY29sb3IgKSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5QYWludHMgJiYgc2NlbmVyeUxvZy5QYWludHMoIGBbU1ZHR3JhZGllbnRTdG9wXSByZW1vdmluZyBQcm9wZXJ0eSBsaXN0ZW5lcjogJHthY3RpdmVTZWxmLnN2Z0dyYWRpZW50LmdyYWRpZW50LmlkfSA6ICR7dGhpcy5yYXRpb31gICk7XG4gICAgICBpZiAoIGNvbG9yLmhhc0xpc3RlbmVyKCB0aGlzLnByb3BlcnR5TGlzdGVuZXIgKSApIHtcbiAgICAgICAgY29sb3IudW5saW5rKCB0aGlzLnByb3BlcnR5TGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIGNvbG9yIGluc3RhbmNlb2YgQ29sb3IgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cuUGFpbnRzKCBgW1NWR0dyYWRpZW50U3RvcF0gcmVtb3ZpbmcgQ29sb3IgbGlzdGVuZXI6ICR7YWN0aXZlU2VsZi5zdmdHcmFkaWVudC5ncmFkaWVudC5pZH0gOiAke3RoaXMucmF0aW99YCApO1xuICAgICAgY29sb3IuY2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5jb2xvckxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgdGhpcy5jb2xvciA9IG51bGw7IC8vIGNsZWFyIHRoZSByZWZlcmVuY2VcbiAgICB0aGlzLnN2Z0dyYWRpZW50ID0gbnVsbDsgLy8gY2xlYXIgdGhlIHJlZmVyZW5jZVxuXG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuUGFpbnRzICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBTVkdHcmFkaWVudFN0b3AucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggU1ZHR3JhZGllbnRTdG9wICk7XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTVkdHcmFkaWVudFN0b3AnLCBTVkdHcmFkaWVudFN0b3AgKTtcblxuZXhwb3J0IGRlZmF1bHQgU1ZHR3JhZGllbnRTdG9wOyJdLCJuYW1lcyI6WyJpc1RSZWFkT25seVByb3BlcnR5IiwiUG9vbCIsIkNvbG9yIiwic2NlbmVyeSIsInN2Z25zIiwic2NyYXRjaENvbG9yIiwiU1ZHR3JhZGllbnRTdG9wIiwiaXNBY3RpdmVTVkdHcmFkaWVudFN0b3AiLCJzdmdHcmFkaWVudCIsImluaXRpYWxpemUiLCJyYXRpbyIsImNvbG9yIiwic2NlbmVyeUxvZyIsIlBhaW50cyIsImdyYWRpZW50IiwiaWQiLCJwdXNoIiwic3ZnRWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlIiwiZGlydHkiLCJ1cGRhdGUiLCJwcm9wZXJ0eUxpc3RlbmVyIiwib25Qcm9wZXJ0eUNoYW5nZSIsImJpbmQiLCJjb2xvckxpc3RlbmVyIiwibWFya0RpcnR5IiwibGF6eUxpbmsiLCJ2YWx1ZSIsImNoYW5nZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxhc3RDb2xvciIsInBvcCIsIm5ld1ZhbHVlIiwib2xkVmFsdWUiLCJhc3NlcnQiLCJhY3RpdmVTZWxmIiwicmVtb3ZlTGlzdGVuZXIiLCJzZXRDU1MiLCJzZXQiLCJzdG9wT3BhY2l0eVJ1bGUiLCJhIiwidG9GaXhlZCIsImFscGhhIiwic3RvcENvbG9yUnVsZSIsInRvQ1NTIiwiZGlzcG9zZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwiZnJlZVRvUG9vbCIsInBvb2wiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxT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