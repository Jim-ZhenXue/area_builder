// Copyright 2020-2024, University of Colorado Boulder
/**
 * Sepia filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let Sepia = class Sepia extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `sepia(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param [amount] - The amount of the effect, from 0 (none) to 1 (full sepia)
   */ constructor(amount = 1){
        assert && assert(isFinite(amount), 'Sepia amount should be finite');
        assert && assert(amount >= 0, 'Sepia amount should be non-negative');
        assert && assert(amount <= 1, 'Sepia amount should be at most 1');
        super(0.393 + 0.607 * (1 - amount), 0.769 - 0.769 * (1 - amount), 0.189 - 0.189 * (1 - amount), 0, 0, 0.349 - 0.349 * (1 - amount), 0.686 + 0.314 * (1 - amount), 0.168 - 0.168 * (1 - amount), 0, 0, 0.272 - 0.272 * (1 - amount), 0.534 - 0.534 * (1 - amount), 0.131 + 0.869 * (1 - amount), 0, 0, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
Sepia.FULL = new Sepia(1);
export { Sepia as default };
scenery.register('Sepia', Sepia);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9TZXBpYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTZXBpYSBmaWx0ZXJcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy90b1NWR051bWJlci5qcyc7XG5pbXBvcnQgeyBDb2xvck1hdHJpeEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXBpYSBleHRlbmRzIENvbG9yTWF0cml4RmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gW2Ftb3VudF0gLSBUaGUgYW1vdW50IG9mIHRoZSBlZmZlY3QsIGZyb20gMCAobm9uZSkgdG8gMSAoZnVsbCBzZXBpYSlcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW1vdW50ID0gMSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdTZXBpYSBhbW91bnQgc2hvdWxkIGJlIGZpbml0ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbW91bnQgPj0gMCwgJ1NlcGlhIGFtb3VudCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudCA8PSAxLCAnU2VwaWEgYW1vdW50IHNob3VsZCBiZSBhdCBtb3N0IDEnICk7XG5cbiAgICBzdXBlcihcbiAgICAgIDAuMzkzICsgMC42MDcgKiAoIDEgLSBhbW91bnQgKSwgMC43NjkgLSAwLjc2OSAqICggMSAtIGFtb3VudCApLCAwLjE4OSAtIDAuMTg5ICogKCAxIC0gYW1vdW50ICksIDAsIDAsXG4gICAgICAwLjM0OSAtIDAuMzQ5ICogKCAxIC0gYW1vdW50ICksIDAuNjg2ICsgMC4zMTQgKiAoIDEgLSBhbW91bnQgKSwgMC4xNjggLSAwLjE2OCAqICggMSAtIGFtb3VudCApLCAwLCAwLFxuICAgICAgMC4yNzIgLSAwLjI3MiAqICggMSAtIGFtb3VudCApLCAwLjUzNCAtIDAuNTM0ICogKCAxIC0gYW1vdW50ICksIDAuMTMxICsgMC44NjkgKiAoIDEgLSBhbW91bnQgKSwgMCwgMCxcbiAgICAgIDAsIDAsIDAsIDEsIDBcbiAgICApO1xuXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTLXN0eWxlIGZpbHRlciBzdWJzdHJpbmcgc3BlY2lmaWMgdG8gdGhpcyBzaW5nbGUgZmlsdGVyLCBlLmcuIGBncmF5c2NhbGUoMSlgLiBUaGlzIHNob3VsZCBiZSB1c2VkIGZvclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHNlcGlhKCR7dG9TVkdOdW1iZXIoIHRoaXMuYW1vdW50ICl9KWA7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgaXNET01Db21wYXRpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBGVUxMID0gbmV3IFNlcGlhKCAxICk7XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTZXBpYScsIFNlcGlhICk7Il0sIm5hbWVzIjpbInRvU1ZHTnVtYmVyIiwiQ29sb3JNYXRyaXhGaWx0ZXIiLCJzY2VuZXJ5IiwiU2VwaWEiLCJnZXRDU1NGaWx0ZXJTdHJpbmciLCJhbW91bnQiLCJpc0RPTUNvbXBhdGlibGUiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIkZVTEwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsaUNBQWlDO0FBQ3pELFNBQVNDLGlCQUFpQixFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRTVDLElBQUEsQUFBTUMsUUFBTixNQUFNQSxjQUFjRjtJQXNCakM7Ozs7R0FJQyxHQUNELEFBQWdCRyxxQkFBNkI7UUFDM0MsT0FBTyxDQUFDLE1BQU0sRUFBRUosWUFBYSxJQUFJLENBQUNLLE1BQU0sRUFBRyxDQUFDLENBQUM7SUFDL0M7SUFFZ0JDLGtCQUEyQjtRQUN6QyxPQUFPO0lBQ1Q7SUE3QkE7O0dBRUMsR0FDRCxZQUFvQkQsU0FBUyxDQUFDLENBQUc7UUFDL0JFLFVBQVVBLE9BQVFDLFNBQVVILFNBQVU7UUFDdENFLFVBQVVBLE9BQVFGLFVBQVUsR0FBRztRQUMvQkUsVUFBVUEsT0FBUUYsVUFBVSxHQUFHO1FBRS9CLEtBQUssQ0FDSCxRQUFRLFFBQVUsQ0FBQSxJQUFJQSxNQUFLLEdBQUssUUFBUSxRQUFVLENBQUEsSUFBSUEsTUFBSyxHQUFLLFFBQVEsUUFBVSxDQUFBLElBQUlBLE1BQUssR0FBSyxHQUFHLEdBQ25HLFFBQVEsUUFBVSxDQUFBLElBQUlBLE1BQUssR0FBSyxRQUFRLFFBQVUsQ0FBQSxJQUFJQSxNQUFLLEdBQUssUUFBUSxRQUFVLENBQUEsSUFBSUEsTUFBSyxHQUFLLEdBQUcsR0FDbkcsUUFBUSxRQUFVLENBQUEsSUFBSUEsTUFBSyxHQUFLLFFBQVEsUUFBVSxDQUFBLElBQUlBLE1BQUssR0FBSyxRQUFRLFFBQVUsQ0FBQSxJQUFJQSxNQUFLLEdBQUssR0FBRyxHQUNuRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBR2QsSUFBSSxDQUFDQSxNQUFNLEdBQUdBO0lBQ2hCO0FBZ0JGO0FBcENxQkYsTUFtQ0lNLE9BQU8sSUFBSU4sTUFBTztBQW5DM0MsU0FBcUJBLG1CQW9DcEI7QUFFREQsUUFBUVEsUUFBUSxDQUFFLFNBQVNQIn0=