// Copyright 2020-2024, University of Colorado Boulder
/**
 * Grayscale filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let Grayscale = class Grayscale extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `grayscale(${toSVGNumber(this.amount)})`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param [amount] - The amount of the effect, from 0 (none) to 1 (full)
   */ constructor(amount = 1){
        assert && assert(isFinite(amount), 'Grayscale amount should be finite');
        assert && assert(amount >= 0, 'Grayscale amount should be non-negative');
        assert && assert(amount <= 1, 'Grayscale amount should be no greater than 1');
        const n = 1 - amount;
        // https://drafts.fxtf.org/filter-effects/#grayscaleEquivalent
        // (0.2126 + 0.7874 * [1 - amount]) (0.7152 - 0.7152  * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
        // (0.2126 - 0.2126 * [1 - amount]) (0.7152 + 0.2848  * [1 - amount]) (0.0722 - 0.0722 * [1 - amount]) 0 0
        // (0.2126 - 0.2126 * [1 - amount]) (0.7152 - 0.7152  * [1 - amount]) (0.0722 + 0.9278 * [1 - amount]) 0 0
        // 0 0 0 1 0
        super(0.2126 + 0.7874 * n, 0.7152 - 0.7152 * n, 0.0722 - 0.0722 * n, 0, 0, 0.2126 - 0.2126 * n, 0.7152 + 0.2848 * n, 0.0722 - 0.0722 * n, 0, 0, 0.2126 - 0.2126 * n, 0.7152 - 0.7152 * n, 0.0722 + 0.9278 * n, 0, 0, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
// Turns things fully gray-scale (instead of partially)
Grayscale.FULL = new Grayscale(1);
export { Grayscale as default };
scenery.register('Grayscale', Grayscale);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9HcmF5c2NhbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR3JheXNjYWxlIGZpbHRlclxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL3RvU1ZHTnVtYmVyLmpzJztcbmltcG9ydCB7IENvbG9yTWF0cml4RmlsdGVyLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYXlzY2FsZSBleHRlbmRzIENvbG9yTWF0cml4RmlsdGVyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGFtb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gW2Ftb3VudF0gLSBUaGUgYW1vdW50IG9mIHRoZSBlZmZlY3QsIGZyb20gMCAobm9uZSkgdG8gMSAoZnVsbClcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW1vdW50ID0gMSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdHcmF5c2NhbGUgYW1vdW50IHNob3VsZCBiZSBmaW5pdGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50ID49IDAsICdHcmF5c2NhbGUgYW1vdW50IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50IDw9IDEsICdHcmF5c2NhbGUgYW1vdW50IHNob3VsZCBiZSBubyBncmVhdGVyIHRoYW4gMScgKTtcblxuICAgIGNvbnN0IG4gPSAxIC0gYW1vdW50O1xuXG4gICAgLy8gaHR0cHM6Ly9kcmFmdHMuZnh0Zi5vcmcvZmlsdGVyLWVmZmVjdHMvI2dyYXlzY2FsZUVxdWl2YWxlbnRcbiAgICAvLyAoMC4yMTI2ICsgMC43ODc0ICogWzEgLSBhbW91bnRdKSAoMC43MTUyIC0gMC43MTUyICAqIFsxIC0gYW1vdW50XSkgKDAuMDcyMiAtIDAuMDcyMiAqIFsxIC0gYW1vdW50XSkgMCAwXG4gICAgLy8gKDAuMjEyNiAtIDAuMjEyNiAqIFsxIC0gYW1vdW50XSkgKDAuNzE1MiArIDAuMjg0OCAgKiBbMSAtIGFtb3VudF0pICgwLjA3MjIgLSAwLjA3MjIgKiBbMSAtIGFtb3VudF0pIDAgMFxuICAgIC8vICgwLjIxMjYgLSAwLjIxMjYgKiBbMSAtIGFtb3VudF0pICgwLjcxNTIgLSAwLjcxNTIgICogWzEgLSBhbW91bnRdKSAoMC4wNzIyICsgMC45Mjc4ICogWzEgLSBhbW91bnRdKSAwIDBcbiAgICAvLyAwIDAgMCAxIDBcbiAgICBzdXBlcihcbiAgICAgIDAuMjEyNiArIDAuNzg3NCAqIG4sIDAuNzE1MiAtIDAuNzE1MiAqIG4sIDAuMDcyMiAtIDAuMDcyMiAqIG4sIDAsIDAsXG4gICAgICAwLjIxMjYgLSAwLjIxMjYgKiBuLCAwLjcxNTIgKyAwLjI4NDggKiBuLCAwLjA3MjIgLSAwLjA3MjIgKiBuLCAwLCAwLFxuICAgICAgMC4yMTI2IC0gMC4yMTI2ICogbiwgMC43MTUyIC0gMC43MTUyICogbiwgMC4wNzIyICsgMC45Mjc4ICogbiwgMCwgMCxcbiAgICAgIDAsIDAsIDAsIDEsIDBcbiAgICApO1xuXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTLXN0eWxlIGZpbHRlciBzdWJzdHJpbmcgc3BlY2lmaWMgdG8gdGhpcyBzaW5nbGUgZmlsdGVyLCBlLmcuIGBncmF5c2NhbGUoMSlgLiBUaGlzIHNob3VsZCBiZSB1c2VkIGZvclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGdyYXlzY2FsZSgke3RvU1ZHTnVtYmVyKCB0aGlzLmFtb3VudCApfSlgO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGlzRE9NQ29tcGF0aWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFR1cm5zIHRoaW5ncyBmdWxseSBncmF5LXNjYWxlIChpbnN0ZWFkIG9mIHBhcnRpYWxseSlcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBGVUxMID0gbmV3IEdyYXlzY2FsZSggMSApO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnR3JheXNjYWxlJywgR3JheXNjYWxlICk7Il0sIm5hbWVzIjpbInRvU1ZHTnVtYmVyIiwiQ29sb3JNYXRyaXhGaWx0ZXIiLCJzY2VuZXJ5IiwiR3JheXNjYWxlIiwiZ2V0Q1NTRmlsdGVyU3RyaW5nIiwiYW1vdW50IiwiaXNET01Db21wYXRpYmxlIiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJuIiwiRlVMTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGlCQUFpQixpQ0FBaUM7QUFDekQsU0FBU0MsaUJBQWlCLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFNUMsSUFBQSxBQUFNQyxZQUFOLE1BQU1BLGtCQUFrQkY7SUE2QnJDOzs7O0dBSUMsR0FDRCxBQUFnQkcscUJBQTZCO1FBQzNDLE9BQU8sQ0FBQyxVQUFVLEVBQUVKLFlBQWEsSUFBSSxDQUFDSyxNQUFNLEVBQUcsQ0FBQyxDQUFDO0lBQ25EO0lBRWdCQyxrQkFBMkI7UUFDekMsT0FBTztJQUNUO0lBcENBOztHQUVDLEdBQ0QsWUFBb0JELFNBQVMsQ0FBQyxDQUFHO1FBQy9CRSxVQUFVQSxPQUFRQyxTQUFVSCxTQUFVO1FBQ3RDRSxVQUFVQSxPQUFRRixVQUFVLEdBQUc7UUFDL0JFLFVBQVVBLE9BQVFGLFVBQVUsR0FBRztRQUUvQixNQUFNSSxJQUFJLElBQUlKO1FBRWQsOERBQThEO1FBQzlELDBHQUEwRztRQUMxRywwR0FBMEc7UUFDMUcsMEdBQTBHO1FBQzFHLFlBQVk7UUFDWixLQUFLLENBQ0gsU0FBUyxTQUFTSSxHQUFHLFNBQVMsU0FBU0EsR0FBRyxTQUFTLFNBQVNBLEdBQUcsR0FBRyxHQUNsRSxTQUFTLFNBQVNBLEdBQUcsU0FBUyxTQUFTQSxHQUFHLFNBQVMsU0FBU0EsR0FBRyxHQUFHLEdBQ2xFLFNBQVMsU0FBU0EsR0FBRyxTQUFTLFNBQVNBLEdBQUcsU0FBUyxTQUFTQSxHQUFHLEdBQUcsR0FDbEUsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUdkLElBQUksQ0FBQ0osTUFBTSxHQUFHQTtJQUNoQjtBQWlCRjtBQUZFLHVEQUF1RDtBQTFDcENGLFVBMkNJTyxPQUFPLElBQUlQLFVBQVc7QUEzQy9DLFNBQXFCQSx1QkE0Q3BCO0FBRURELFFBQVFTLFFBQVEsQ0FBRSxhQUFhUiJ9