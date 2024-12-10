// Copyright 2020-2024, University of Colorado Boulder
/**
 * HueRotate filter
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import Utils from '../../../dot/js/Utils.js';
import { ColorMatrixFilter, scenery } from '../imports.js';
let HueRotate = class HueRotate extends ColorMatrixFilter {
    /**
   * Returns the CSS-style filter substring specific to this single filter, e.g. `grayscale(1)`. This should be used for
   * both DOM elements (https://developer.mozilla.org/en-US/docs/Web/CSS/filter) and when supported, Canvas
   * (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter).
   */ getCSSFilterString() {
        return `hue-rotate(${toSVGNumber(Utils.toDegrees(this.amount))}deg)`;
    }
    isDOMCompatible() {
        return true;
    }
    /**
   * @param amount - In radians, the amount of hue to color-shift
   */ constructor(amount){
        assert && assert(isFinite(amount), 'HueRotate amount should be finite');
        assert && assert(amount >= 0, 'HueRotate amount should be non-negative');
        const cos = Math.cos(amount);
        const sin = Math.sin(amount);
        // https://drafts.fxtf.org/filter-effects/#attr-valuedef-type-huerotate
        super(0.213 + 0.787 * cos - 0.213 * sin, 0.715 - 0.715 * cos - 0.715 * sin, 0.072 - 0.072 * cos + 0.928 * sin, 0, 0, 0.213 - 0.213 * cos + 0.143 * sin, 0.715 + 0.285 * cos + 0.140 * sin, 0.072 - 0.072 * cos - 0.283 * sin, 0, 0, 0.213 - 0.213 * cos - 0.787 * sin, 0.715 - 0.715 * cos + 0.715 * sin, 0.072 + 0.928 * cos + 0.072 * sin, 0, 0, 0, 0, 0, 1, 0);
        this.amount = amount;
    }
};
export { HueRotate as default };
scenery.register('HueRotate', HueRotate);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZmlsdGVycy9IdWVSb3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSHVlUm90YXRlIGZpbHRlclxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgdG9TVkdOdW1iZXIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL3RvU1ZHTnVtYmVyLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IHsgQ29sb3JNYXRyaXhGaWx0ZXIsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHVlUm90YXRlIGV4dGVuZHMgQ29sb3JNYXRyaXhGaWx0ZXIge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgYW1vdW50OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhbW91bnQgLSBJbiByYWRpYW5zLCB0aGUgYW1vdW50IG9mIGh1ZSB0byBjb2xvci1zaGlmdFxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhbW91bnQ6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW1vdW50ICksICdIdWVSb3RhdGUgYW1vdW50IHNob3VsZCBiZSBmaW5pdGUnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50ID49IDAsICdIdWVSb3RhdGUgYW1vdW50IHNob3VsZCBiZSBub24tbmVnYXRpdmUnICk7XG5cbiAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyggYW1vdW50ICk7XG4gICAgY29uc3Qgc2luID0gTWF0aC5zaW4oIGFtb3VudCApO1xuXG4gICAgLy8gaHR0cHM6Ly9kcmFmdHMuZnh0Zi5vcmcvZmlsdGVyLWVmZmVjdHMvI2F0dHItdmFsdWVkZWYtdHlwZS1odWVyb3RhdGVcbiAgICBzdXBlcihcbiAgICAgIDAuMjEzICsgMC43ODcgKiBjb3MgLSAwLjIxMyAqIHNpbixcbiAgICAgIDAuNzE1IC0gMC43MTUgKiBjb3MgLSAwLjcxNSAqIHNpbixcbiAgICAgIDAuMDcyIC0gMC4wNzIgKiBjb3MgKyAwLjkyOCAqIHNpbixcbiAgICAgIDAsIDAsXG4gICAgICAwLjIxMyAtIDAuMjEzICogY29zICsgMC4xNDMgKiBzaW4sXG4gICAgICAwLjcxNSArIDAuMjg1ICogY29zICsgMC4xNDAgKiBzaW4sXG4gICAgICAwLjA3MiAtIDAuMDcyICogY29zIC0gMC4yODMgKiBzaW4sXG4gICAgICAwLCAwLFxuICAgICAgMC4yMTMgLSAwLjIxMyAqIGNvcyAtIDAuNzg3ICogc2luLFxuICAgICAgMC43MTUgLSAwLjcxNSAqIGNvcyArIDAuNzE1ICogc2luLFxuICAgICAgMC4wNzIgKyAwLjkyOCAqIGNvcyArIDAuMDcyICogc2luLFxuICAgICAgMCwgMCxcbiAgICAgIDAsIDAsIDAsIDEsIDBcbiAgICApO1xuXG4gICAgdGhpcy5hbW91bnQgPSBhbW91bnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ1NTLXN0eWxlIGZpbHRlciBzdWJzdHJpbmcgc3BlY2lmaWMgdG8gdGhpcyBzaW5nbGUgZmlsdGVyLCBlLmcuIGBncmF5c2NhbGUoMSlgLiBUaGlzIHNob3VsZCBiZSB1c2VkIGZvclxuICAgKiBib3RoIERPTSBlbGVtZW50cyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZpbHRlcikgYW5kIHdoZW4gc3VwcG9ydGVkLCBDYW52YXNcbiAgICogKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQvZmlsdGVyKS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRDU1NGaWx0ZXJTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh1ZS1yb3RhdGUoJHt0b1NWR051bWJlciggVXRpbHMudG9EZWdyZWVzKCB0aGlzLmFtb3VudCApICl9ZGVnKWA7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgaXNET01Db21wYXRpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdIdWVSb3RhdGUnLCBIdWVSb3RhdGUgKTsiXSwibmFtZXMiOlsidG9TVkdOdW1iZXIiLCJVdGlscyIsIkNvbG9yTWF0cml4RmlsdGVyIiwic2NlbmVyeSIsIkh1ZVJvdGF0ZSIsImdldENTU0ZpbHRlclN0cmluZyIsInRvRGVncmVlcyIsImFtb3VudCIsImlzRE9NQ29tcGF0aWJsZSIsImFzc2VydCIsImlzRmluaXRlIiwiY29zIiwiTWF0aCIsInNpbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGlCQUFpQixpQ0FBaUM7QUFDekQsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsU0FBU0MsaUJBQWlCLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFNUMsSUFBQSxBQUFNQyxZQUFOLE1BQU1BLGtCQUFrQkY7SUFrQ3JDOzs7O0dBSUMsR0FDRCxBQUFnQkcscUJBQTZCO1FBQzNDLE9BQU8sQ0FBQyxXQUFXLEVBQUVMLFlBQWFDLE1BQU1LLFNBQVMsQ0FBRSxJQUFJLENBQUNDLE1BQU0sR0FBSyxJQUFJLENBQUM7SUFDMUU7SUFFZ0JDLGtCQUEyQjtRQUN6QyxPQUFPO0lBQ1Q7SUF6Q0E7O0dBRUMsR0FDRCxZQUFvQkQsTUFBYyxDQUFHO1FBQ25DRSxVQUFVQSxPQUFRQyxTQUFVSCxTQUFVO1FBQ3RDRSxVQUFVQSxPQUFRRixVQUFVLEdBQUc7UUFFL0IsTUFBTUksTUFBTUMsS0FBS0QsR0FBRyxDQUFFSjtRQUN0QixNQUFNTSxNQUFNRCxLQUFLQyxHQUFHLENBQUVOO1FBRXRCLHVFQUF1RTtRQUN2RSxLQUFLLENBQ0gsUUFBUSxRQUFRSSxNQUFNLFFBQVFFLEtBQzlCLFFBQVEsUUFBUUYsTUFBTSxRQUFRRSxLQUM5QixRQUFRLFFBQVFGLE1BQU0sUUFBUUUsS0FDOUIsR0FBRyxHQUNILFFBQVEsUUFBUUYsTUFBTSxRQUFRRSxLQUM5QixRQUFRLFFBQVFGLE1BQU0sUUFBUUUsS0FDOUIsUUFBUSxRQUFRRixNQUFNLFFBQVFFLEtBQzlCLEdBQUcsR0FDSCxRQUFRLFFBQVFGLE1BQU0sUUFBUUUsS0FDOUIsUUFBUSxRQUFRRixNQUFNLFFBQVFFLEtBQzlCLFFBQVEsUUFBUUYsTUFBTSxRQUFRRSxLQUM5QixHQUFHLEdBQ0gsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUdkLElBQUksQ0FBQ04sTUFBTSxHQUFHQTtJQUNoQjtBQWNGO0FBOUNBLFNBQXFCSCx1QkE4Q3BCO0FBRURELFFBQVFXLFFBQVEsQ0FBRSxhQUFhViJ9