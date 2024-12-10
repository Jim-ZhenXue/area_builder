// Copyright 2020-2024, University of Colorado Boulder
/**
 * Opacity filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { Filter, scenery } from '../imports.js';
let Opacity = class Opacity extends Filter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `opacity(${toSVGNumber(this.amount)})`;
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
   * NOTE: Generally prefer setting a Node's opacity, unless this is required for stacking of filters.
   *
   * @param amount - The amount of opacity, from 0 (invisible) to 1 (fully visible)
   */ constructor(amount){
        assert && assert(isFinite(amount), 'Opacity amount should be finite');
        assert && assert(amount >= 0, 'Opacity amount should be non-negative');
        assert && assert(amount <= 1, 'Opacity amount should be no greater than 1');
        super();
        this.amount = amount;
    }
};
export { Opacity as default };
scenery.register('Opacity', Opacity);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9PcGFjaXR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE9wYWNpdHkgZmlsdGVyXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB0b1NWR051bWJlciBmcm9tICcuLi8uLi8uLi9kb3QvanMvdG9TVkdOdW1iZXIuanMnO1xuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIEZpbHRlciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcGFjaXR5IGV4dGVuZHMgRmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBOT1RFOiBHZW5lcmFsbHkgcHJlZmVyIHNldHRpbmcgYSBOb2RlJ3Mgb3BhY2l0eSwgdW5sZXNzIHRoaXMgaXMgcmVxdWlyZWQgZm9yIHN0YWNraW5nIG9mIGZpbHRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBhbW91bnQgLSBUaGUgYW1vdW50IG9mIG9wYWNpdHksIGZyb20gMCAoaW52aXNpYmxlKSB0byAxIChmdWxseSB2aXNpYmxlKVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbW91bnQ6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdPcGFjaXR5IGFtb3VudCBzaG91bGQgYmUgZmluaXRlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudCA+PSAwLCAnT3BhY2l0eSBhbW91bnQgc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbW91bnQgPD0gMSwgJ09wYWNpdHkgYW1vdW50IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFtb3VudCA9IGFtb3VudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1Mtc3R5bGUgZmlsdGVyIHN1YnN0cmluZyBzcGVjaWZpYyB0byB0aGlzIHNpbmdsZSBmaWx0ZXIsIGUuZy4gYGdyYXlzY2FsZSgxKWAuIFRoaXMgc2hvdWxkIGJlIHVzZWQgZm9yXG4gICAqIGJvdGggRE9NIGVsZW1lbnRzIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZmlsdGVyKSBhbmQgd2hlbiBzdXBwb3J0ZWQsIENhbnZhc1xuICAgKiAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRC9maWx0ZXIpLlxuICAgKi9cbiAgcHVibGljIGdldENTU0ZpbHRlclN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgb3BhY2l0eSgke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHB1YmxpYyBhcHBseUNhbnZhc0ZpbHRlciggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIgKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAndW5pbXBsZW1lbnRlZCcgKTtcbiAgfVxuXG4gIHB1YmxpYyBhcHBseVNWR0ZpbHRlciggc3ZnRmlsdGVyOiBTVkdGaWx0ZXJFbGVtZW50LCBpbk5hbWU6IHN0cmluZywgcmVzdWx0TmFtZT86IHN0cmluZyApOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICd1bmltcGxlbWVudGVkJyApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdPcGFjaXR5JywgT3BhY2l0eSApOyJdLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsIkZpbHRlciIsInNjZW5lcnkiLCJPcGFjaXR5IiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwiYW1vdW50IiwiaXNET01Db21wYXRpYmxlIiwiYXBwbHlDYW52YXNGaWx0ZXIiLCJ3cmFwcGVyIiwiRXJyb3IiLCJhcHBseVNWR0ZpbHRlciIsInN2Z0ZpbHRlciIsImluTmFtZSIsInJlc3VsdE5hbWUiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGlCQUFpQixpQ0FBaUM7QUFDekQsU0FBK0JDLE1BQU0sRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUV2RCxJQUFBLEFBQU1DLFVBQU4sTUFBTUEsZ0JBQWdCRjtJQW1CbkM7Ozs7R0FJQyxHQUNELEFBQU9HLHFCQUE2QjtRQUNsQyxPQUFPLENBQUMsUUFBUSxFQUFFSixZQUFhLElBQUksQ0FBQ0ssTUFBTSxFQUFHLENBQUMsQ0FBQztJQUNqRDtJQUVnQkMsa0JBQTJCO1FBQ3pDLE9BQU87SUFDVDtJQUVPQyxrQkFBbUJDLE9BQTZCLEVBQVM7UUFDOUQsTUFBTSxJQUFJQyxNQUFPO0lBQ25CO0lBRU9DLGVBQWdCQyxTQUEyQixFQUFFQyxNQUFjLEVBQUVDLFVBQW1CLEVBQVM7UUFDOUYsTUFBTSxJQUFJSixNQUFPO0lBQ25CO0lBbENBOzs7O0dBSUMsR0FDRCxZQUFvQkosTUFBYyxDQUFHO1FBQ25DUyxVQUFVQSxPQUFRQyxTQUFVVixTQUFVO1FBQ3RDUyxVQUFVQSxPQUFRVCxVQUFVLEdBQUc7UUFDL0JTLFVBQVVBLE9BQVFULFVBQVUsR0FBRztRQUUvQixLQUFLO1FBRUwsSUFBSSxDQUFDQSxNQUFNLEdBQUdBO0lBQ2hCO0FBc0JGO0FBdkNBLFNBQXFCRixxQkF1Q3BCO0FBRURELFFBQVFjLFFBQVEsQ0FBRSxXQUFXYiJ9