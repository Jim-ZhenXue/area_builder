// Copyright 2020-2024, University of Colorado Boulder
/**
 * Brightness filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let Brightness = class Brightness extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `brightness(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param amount - How bright to be, from 0 (dark), 1 (normal), or larger values to brighten
   */ constructor(amount){
        assert && assert(isFinite(amount), 'Brightness amount should be finite');
        assert && assert(amount >= 0, 'Brightness amount should be non-negative');
        super(amount, 0, 0, 0, 0, 0, amount, 0, 0, 0, 0, 0, amount, 0, 0, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
// Fully darkens the content
Brightness.BLACKEN = new Brightness(0);
export { Brightness as default };
scenery.register('Brightness', Brightness);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9CcmlnaHRuZXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJyaWdodG5lc3MgZmlsdGVyXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB0b1NWR051bWJlciBmcm9tICcuLi8uLi8uLi9kb3QvanMvdG9TVkdOdW1iZXIuanMnO1xuaW1wb3J0IHsgQ29sb3JNYXRyaXhGaWx0ZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZ2h0bmVzcyBleHRlbmRzIENvbG9yTWF0cml4RmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYW1vdW50IC0gSG93IGJyaWdodCB0byBiZSwgZnJvbSAwIChkYXJrKSwgMSAobm9ybWFsKSwgb3IgbGFyZ2VyIHZhbHVlcyB0byBicmlnaHRlblxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbW91bnQ6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdCcmlnaHRuZXNzIGFtb3VudCBzaG91bGQgYmUgZmluaXRlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudCA+PSAwLCAnQnJpZ2h0bmVzcyBhbW91bnQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcblxuICAgIHN1cGVyKFxuICAgICAgYW1vdW50LCAwLCAwLCAwLCAwLFxuICAgICAgMCwgYW1vdW50LCAwLCAwLCAwLFxuICAgICAgMCwgMCwgYW1vdW50LCAwLCAwLFxuICAgICAgMCwgMCwgMCwgMSwgMFxuICAgICk7XG5cbiAgICB0aGlzLmFtb3VudCA9IGFtb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXG4gICAqIGJvdGggRE9NIGVsZW1lbnRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZmlsdGVyKSBhbmQgd2hlbiBzdXBwb3J0ZWQsIENhbnZhc1xuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldENTU0ZpbHRlclN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgYnJpZ2h0bmVzcygke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZ1bGx5IGRhcmtlbnMgdGhlIGNvbnRlbnRcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCTEFDS0VOID0gbmV3IEJyaWdodG5lc3MoIDAgKTtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0JyaWdodG5lc3MnLCBCcmlnaHRuZXNzICk7Il0sIm5hbWVzIjpbInRvU1ZHTnVtYmVyIiwiQ29sb3JNYXRyaXhGaWx0ZXIiLCJzY2VuZXJ5IiwiQnJpZ2h0bmVzcyIsImdldENTU0ZpbHRlclN0cmluZyIsImFtb3VudCIsImlzRE9NQ29tcGF0aWJsZSIsImFzc2VydCIsImlzRmluaXRlIiwiQkxBQ0tFTiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGlCQUFpQixpQ0FBaUM7QUFDekQsU0FBU0MsaUJBQWlCLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFNUMsSUFBQSxBQUFNQyxhQUFOLE1BQU1BLG1CQUFtQkY7SUFxQnRDOzs7O0dBSUMsR0FDRCxBQUFnQkcscUJBQTZCO1FBQzNDLE9BQU8sQ0FBQyxXQUFXLEVBQUVKLFlBQWEsSUFBSSxDQUFDSyxNQUFNLEVBQUcsQ0FBQyxDQUFDO0lBQ3BEO0lBRWdCQyxrQkFBMkI7UUFDekMsT0FBTztJQUNUO0lBNUJBOztHQUVDLEdBQ0QsWUFBb0JELE1BQWMsQ0FBRztRQUNuQ0UsVUFBVUEsT0FBUUMsU0FBVUgsU0FBVTtRQUN0Q0UsVUFBVUEsT0FBUUYsVUFBVSxHQUFHO1FBRS9CLEtBQUssQ0FDSEEsUUFBUSxHQUFHLEdBQUcsR0FBRyxHQUNqQixHQUFHQSxRQUFRLEdBQUcsR0FBRyxHQUNqQixHQUFHLEdBQUdBLFFBQVEsR0FBRyxHQUNqQixHQUFHLEdBQUcsR0FBRyxHQUFHO1FBR2QsSUFBSSxDQUFDQSxNQUFNLEdBQUdBO0lBQ2hCO0FBaUJGO0FBRkUsNEJBQTRCO0FBbENURixXQW1DSU0sVUFBVSxJQUFJTixXQUFZO0FBbkNuRCxTQUFxQkEsd0JBb0NwQjtBQUVERCxRQUFRUSxRQUFRLENBQUUsY0FBY1AifQ==