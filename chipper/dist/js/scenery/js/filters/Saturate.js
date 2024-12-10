// Copyright 2020-2024, University of Colorado Boulder
/**
 * Saturate filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let Saturate = class Saturate extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `saturate(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param amount - The amount of the effect, from 0 (no saturation), 1 (normal), or higher to over-saturate
   */ constructor(amount){
        assert && assert(isFinite(amount), 'Saturate amount should be finite');
        assert && assert(amount >= 0, 'Saturate amount should be non-negative');
        // near https://drafts.fxtf.org/filter-effects/#attr-valuedef-type-huerotate
        super(0.213 + 0.787 * amount, 0.715 - 0.715 * amount, 0.072 - 0.072 * amount, 0, 0, 0.213 - 0.213 * amount, 0.715 - 0.285 * amount, 0.072 - 0.072 * amount, 0, 0, 0.213 - 0.213 * amount, 0.715 - 0.715 * amount, 0.072 - 0.928 * amount, 0, 0, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
export { Saturate as default };
scenery.register('Saturate', Saturate);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9TYXR1cmF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTYXR1cmF0ZSBmaWx0ZXJcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy90b1NWR051bWJlci5qcyc7XG5pbXBvcnQgeyBDb2xvck1hdHJpeEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTYXR1cmF0ZSBleHRlbmRzIENvbG9yTWF0cml4RmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYW1vdW50IC0gVGhlIGFtb3VudCBvZiB0aGUgZWZmZWN0LCBmcm9tIDAgKG5vIHNhdHVyYXRpb24pLCAxIChub3JtYWwpLCBvciBoaWdoZXIgdG8gb3Zlci1zYXR1cmF0ZVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbW91bnQ6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdTYXR1cmF0ZSBhbW91bnQgc2hvdWxkIGJlIGZpbml0ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbW91bnQgPj0gMCwgJ1NhdHVyYXRlIGFtb3VudCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuXG4gICAgLy8gbmVhciBodHRwczovL2RyYWZ0cy5meHRmLm9yZy9maWx0ZXItZWZmZWN0cy8jYXR0ci12YWx1ZWRlZi10eXBlLWh1ZXJvdGF0ZVxuICAgIHN1cGVyKFxuICAgICAgMC4yMTMgKyAwLjc4NyAqIGFtb3VudCwgMC43MTUgLSAwLjcxNSAqIGFtb3VudCwgMC4wNzIgLSAwLjA3MiAqIGFtb3VudCwgMCwgMCxcbiAgICAgIDAuMjEzIC0gMC4yMTMgKiBhbW91bnQsIDAuNzE1IC0gMC4yODUgKiBhbW91bnQsIDAuMDcyIC0gMC4wNzIgKiBhbW91bnQsIDAsIDAsXG4gICAgICAwLjIxMyAtIDAuMjEzICogYW1vdW50LCAwLjcxNSAtIDAuNzE1ICogYW1vdW50LCAwLjA3MiAtIDAuOTI4ICogYW1vdW50LCAwLCAwLFxuICAgICAgMCwgMCwgMCwgMSwgMFxuICAgICk7XG5cbiAgICB0aGlzLmFtb3VudCA9IGFtb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXG4gICAqIGJvdGggRE9NIGVsZW1lbnRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZmlsdGVyKSBhbmQgd2hlbiBzdXBwb3J0ZWQsIENhbnZhc1xuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldENTU0ZpbHRlclN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgc2F0dXJhdGUoJHt0b1NWR051bWJlciggdGhpcy5hbW91bnQgKX0pYDtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBpc0RPTUNvbXBhdGlibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1NhdHVyYXRlJywgU2F0dXJhdGUgKTsiXSwibmFtZXMiOlsidG9TVkdOdW1iZXIiLCJDb2xvck1hdHJpeEZpbHRlciIsInNjZW5lcnkiLCJTYXR1cmF0ZSIsImdldENTU0ZpbHRlclN0cmluZyIsImFtb3VudCIsImlzRE9NQ29tcGF0aWJsZSIsImFzc2VydCIsImlzRmluaXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsaUJBQWlCLGlDQUFpQztBQUN6RCxTQUFTQyxpQkFBaUIsRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUU1QyxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCRjtJQXNCcEM7Ozs7R0FJQyxHQUNELEFBQWdCRyxxQkFBNkI7UUFDM0MsT0FBTyxDQUFDLFNBQVMsRUFBRUosWUFBYSxJQUFJLENBQUNLLE1BQU0sRUFBRyxDQUFDLENBQUM7SUFDbEQ7SUFFZ0JDLGtCQUEyQjtRQUN6QyxPQUFPO0lBQ1Q7SUE3QkE7O0dBRUMsR0FDRCxZQUFvQkQsTUFBYyxDQUFHO1FBQ25DRSxVQUFVQSxPQUFRQyxTQUFVSCxTQUFVO1FBQ3RDRSxVQUFVQSxPQUFRRixVQUFVLEdBQUc7UUFFL0IsNEVBQTRFO1FBQzVFLEtBQUssQ0FDSCxRQUFRLFFBQVFBLFFBQVEsUUFBUSxRQUFRQSxRQUFRLFFBQVEsUUFBUUEsUUFBUSxHQUFHLEdBQzNFLFFBQVEsUUFBUUEsUUFBUSxRQUFRLFFBQVFBLFFBQVEsUUFBUSxRQUFRQSxRQUFRLEdBQUcsR0FDM0UsUUFBUSxRQUFRQSxRQUFRLFFBQVEsUUFBUUEsUUFBUSxRQUFRLFFBQVFBLFFBQVEsR0FBRyxHQUMzRSxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBR2QsSUFBSSxDQUFDQSxNQUFNLEdBQUdBO0lBQ2hCO0FBY0Y7QUFsQ0EsU0FBcUJGLHNCQWtDcEI7QUFFREQsUUFBUU8sUUFBUSxDQUFFLFlBQVlOIn0=