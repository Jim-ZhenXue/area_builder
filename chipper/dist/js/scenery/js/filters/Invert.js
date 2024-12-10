// Copyright 2020-2024, University of Colorado Boulder
/**
 * Invert filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { Filter, scenery } from '../imports.js';
let Invert = class Invert extends Filter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `invert(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    applyCanvasFilter(wrapper) {
        throw new Error('unimplemented');
    }
    applySVGFilter(svgFilter, inName, resultName) {
        throw new Error('unimplemented');
    }
    /**
   * @param [amount] - The amount of the effect, from 0 (none) to 1 (full)
   */ constructor(amount = 1){
        assert && assert(isFinite(amount), 'Invert amount should be finite');
        assert && assert(amount >= 0, 'Invert amount should be non-negative');
        assert && assert(amount <= 1, 'Invert amount should be no greater than 1');
        super();
        this.amount = amount;
    }
};
Invert.FULL = new Invert(1);
export { Invert as default };
scenery.register('Invert', Invert);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9JbnZlcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSW52ZXJ0IGZpbHRlclxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL3RvU1ZHTnVtYmVyLmpzJztcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBGaWx0ZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW52ZXJ0IGV4dGVuZHMgRmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gW2Ftb3VudF0gLSBUaGUgYW1vdW50IG9mIHRoZSBlZmZlY3QsIGZyb20gMCAobm9uZSkgdG8gMSAoZnVsbClcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW1vdW50ID0gMSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdJbnZlcnQgYW1vdW50IHNob3VsZCBiZSBmaW5pdGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50ID49IDAsICdJbnZlcnQgYW1vdW50IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50IDw9IDEsICdJbnZlcnQgYW1vdW50IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFtb3VudCA9IGFtb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXG4gICAqIGJvdGggRE9NIGVsZW1lbnRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZmlsdGVyKSBhbmQgd2hlbiBzdXBwb3J0ZWQsIENhbnZhc1xuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxuICAgKi9cbiAgcHVibGljIGdldENTU0ZpbHRlclN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgaW52ZXJ0KCR7dG9TVkdOdW1iZXIoIHRoaXMuYW1vdW50ICl9KWA7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgaXNET01Db21wYXRpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBGVUxMID0gbmV3IEludmVydCggMSApO1xuXG4gIHB1YmxpYyBhcHBseUNhbnZhc0ZpbHRlciggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAndW5pbXBsZW1lbnRlZCcgKTtcbiAgfVxuXG4gIHB1YmxpYyBhcHBseVNWR0ZpbHRlciggc3ZnRmlsdGVyOiBTVkdGaWx0ZXJFbGVtZW50LCBpbk5hbWU6IHN0cmluZywgcmVzdWx0TmFtZT86IHN0cmluZyApOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd1bmltcGxlbWVudGVkJyApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdJbnZlcnQnLCBJbnZlcnQgKTsiXSwibmFtZXMiOlsidG9TVkdOdW1iZXIiLCJGaWx0ZXIiLCJzY2VuZXJ5IiwiSW52ZXJ0IiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwiYW1vdW50IiwiaXNET01Db21wYXRpYmxlIiwiYXBwbHlDYW52YXNGaWx0ZXIiLCJ3cmFwcGVyIiwiRXJyb3IiLCJhcHBseVNWR0ZpbHRlciIsInN2Z0ZpbHRlciIsImluTmFtZSIsInJlc3VsdE5hbWUiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIkZVTEwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsaUNBQWlDO0FBQ3pELFNBQStCQyxNQUFNLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFdkQsSUFBQSxBQUFNQyxTQUFOLE1BQU1BLGVBQWVGO0lBaUJsQzs7OztHQUlDLEdBQ0QsQUFBT0cscUJBQTZCO1FBQ2xDLE9BQU8sQ0FBQyxPQUFPLEVBQUVKLFlBQWEsSUFBSSxDQUFDSyxNQUFNLEVBQUcsQ0FBQyxDQUFDO0lBQ2hEO0lBRWdCQyxrQkFBMkI7UUFDekMsT0FBTztJQUNUO0lBSU9DLGtCQUFtQkMsT0FBNkIsRUFBUztRQUM5RCxNQUFNLElBQUlDLE1BQU87SUFDbkI7SUFFT0MsZUFBZ0JDLFNBQTJCLEVBQUVDLE1BQWMsRUFBRUMsVUFBbUIsRUFBUztRQUM5RixNQUFNLElBQUlKLE1BQU87SUFDbkI7SUFsQ0E7O0dBRUMsR0FDRCxZQUFvQkosU0FBUyxDQUFDLENBQUc7UUFDL0JTLFVBQVVBLE9BQVFDLFNBQVVWLFNBQVU7UUFDdENTLFVBQVVBLE9BQVFULFVBQVUsR0FBRztRQUMvQlMsVUFBVUEsT0FBUVQsVUFBVSxHQUFHO1FBRS9CLEtBQUs7UUFFTCxJQUFJLENBQUNBLE1BQU0sR0FBR0E7SUFDaEI7QUF3QkY7QUF2Q3FCRixPQThCSWEsT0FBTyxJQUFJYixPQUFRO0FBOUI1QyxTQUFxQkEsb0JBdUNwQjtBQUVERCxRQUFRZSxRQUFRLENBQUUsVUFBVWQifQ==