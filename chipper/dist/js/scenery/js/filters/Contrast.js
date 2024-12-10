// Copyright 2020-2024, University of Colorado Boulder
/**
 * Contrast filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let Contrast = class Contrast extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `contrast(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param amount - The amount of the effect, from 0 (gray), 1 (normal), or above for high-contrast
   */ constructor(amount){
        assert && assert(isFinite(amount), 'Contrast amount should be finite');
        assert && assert(amount >= 0, 'Contrast amount should be non-negative');
        super(amount, 0, 0, 0, -(0.5 * amount) + 0.5, 0, amount, 0, 0, -(0.5 * amount) + 0.5, 0, 0, amount, 0, -(0.5 * amount) + 0.5, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
// Turns the content gray
Contrast.GRAY = new Contrast(0);
export { Contrast as default };
scenery.register('Contrast', Contrast);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9Db250cmFzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb250cmFzdCBmaWx0ZXJcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy90b1NWR051bWJlci5qcyc7XG5pbXBvcnQgeyBDb2xvck1hdHJpeEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cmFzdCBleHRlbmRzIENvbG9yTWF0cml4RmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYW1vdW50IC0gVGhlIGFtb3VudCBvZiB0aGUgZWZmZWN0LCBmcm9tIDAgKGdyYXkpLCAxIChub3JtYWwpLCBvciBhYm92ZSBmb3IgaGlnaC1jb250cmFzdFxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbW91bnQ6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdDb250cmFzdCBhbW91bnQgc2hvdWxkIGJlIGZpbml0ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbW91bnQgPj0gMCwgJ0NvbnRyYXN0IGFtb3VudCBzaG91bGQgYmUgbm9uLW5lZ2F0aXZlJyApO1xuXG4gICAgc3VwZXIoXG4gICAgICBhbW91bnQsIDAsIDAsIDAsIC0oIDAuNSAqIGFtb3VudCApICsgMC41LFxuICAgICAgMCwgYW1vdW50LCAwLCAwLCAtKCAwLjUgKiBhbW91bnQgKSArIDAuNSxcbiAgICAgIDAsIDAsIGFtb3VudCwgMCwgLSggMC41ICogYW1vdW50ICkgKyAwLjUsXG4gICAgICAwLCAwLCAwLCAxLCAwXG4gICAgKTtcblxuICAgIHRoaXMuYW1vdW50ID0gYW1vdW50O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIENTUy1zdHlsZSBmaWx0ZXIgc3Vic3RyaW5nIHNwZWNpZmljIHRvIHRoaXMgc2luZ2xlIGZpbHRlciwgZS5nLiBgZ3JheXNjYWxlKDEpYC4gVGhpcyBzaG91bGQgYmUgdXNlZCBmb3JcbiAgICogYm90aCBET00gZWxlbWVudHMgKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9maWx0ZXIpIGFuZCB3aGVuIHN1cHBvcnRlZCwgQ2FudmFzXG4gICAqIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEL2ZpbHRlcikuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Q1NTRmlsdGVyU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBjb250cmFzdCgke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFR1cm5zIHRoZSBjb250ZW50IGdyYXlcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHUkFZID0gbmV3IENvbnRyYXN0KCAwICk7XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdDb250cmFzdCcsIENvbnRyYXN0ICk7Il0sIm5hbWVzIjpbInRvU1ZHTnVtYmVyIiwiQ29sb3JNYXRyaXhGaWx0ZXIiLCJzY2VuZXJ5IiwiQ29udHJhc3QiLCJnZXRDU1NGaWx0ZXJTdHJpbmciLCJhbW91bnQiLCJpc0RPTUNvbXBhdGlibGUiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIkdSQVkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsaUNBQWlDO0FBQ3pELFNBQVNDLGlCQUFpQixFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRTVDLElBQUEsQUFBTUMsV0FBTixNQUFNQSxpQkFBaUJGO0lBcUJwQzs7OztHQUlDLEdBQ0QsQUFBZ0JHLHFCQUE2QjtRQUMzQyxPQUFPLENBQUMsU0FBUyxFQUFFSixZQUFhLElBQUksQ0FBQ0ssTUFBTSxFQUFHLENBQUMsQ0FBQztJQUNsRDtJQUVnQkMsa0JBQTJCO1FBQ3pDLE9BQU87SUFDVDtJQTVCQTs7R0FFQyxHQUNELFlBQW9CRCxNQUFjLENBQUc7UUFDbkNFLFVBQVVBLE9BQVFDLFNBQVVILFNBQVU7UUFDdENFLFVBQVVBLE9BQVFGLFVBQVUsR0FBRztRQUUvQixLQUFLLENBQ0hBLFFBQVEsR0FBRyxHQUFHLEdBQUcsQ0FBRyxDQUFBLE1BQU1BLE1BQUssSUFBTSxLQUNyQyxHQUFHQSxRQUFRLEdBQUcsR0FBRyxDQUFHLENBQUEsTUFBTUEsTUFBSyxJQUFNLEtBQ3JDLEdBQUcsR0FBR0EsUUFBUSxHQUFHLENBQUcsQ0FBQSxNQUFNQSxNQUFLLElBQU0sS0FDckMsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUdkLElBQUksQ0FBQ0EsTUFBTSxHQUFHQTtJQUNoQjtBQWlCRjtBQUZFLHlCQUF5QjtBQWxDTkYsU0FtQ0lNLE9BQU8sSUFBSU4sU0FBVTtBQW5DOUMsU0FBcUJBLHNCQW9DcEI7QUFFREQsUUFBUVEsUUFBUSxDQUFFLFlBQVlQIn0=