// Copyright 2017-2024, University of Colorado Boulder
/**
 * An intersection between two different segments.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Utils from '../../../dot/js/Utils.js';
import { kite } from '../imports.js';
let SegmentIntersection = class SegmentIntersection {
    /**
   * Returns the intersection with a and b swapped.
   */ getSwapped() {
        return new SegmentIntersection(this.point, this.bT, this.aT);
    }
    /**
   * @param point - The location of the intersection
   * @param aT - The parametric value for the first segment at the location of the intersection
   * @param bT - The parametric value for the second segment at the location of the intersection
   */ constructor(point, aT, bT){
        assert && assert(aT >= -1e-10 && aT <= 1 + 1e-10, 'aT out of range');
        assert && assert(bT >= -1e-10 && bT <= 1 + 1e-10, 'bT out of range');
        this.point = point;
        // Clamped in case it's slightly out-of-range
        this.aT = Utils.clamp(aT, 0, 1);
        this.bT = Utils.clamp(bT, 0, 1);
    }
};
export { SegmentIntersection as default };
kite.register('SegmentIntersection', SegmentIntersection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9TZWdtZW50SW50ZXJzZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGludGVyc2VjdGlvbiBiZXR3ZWVuIHR3byBkaWZmZXJlbnQgc2VnbWVudHMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsga2l0ZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWdtZW50SW50ZXJzZWN0aW9uIHtcblxuICBwdWJsaWMgcG9pbnQ6IFZlY3RvcjI7XG4gIHB1YmxpYyBhVDogbnVtYmVyO1xuICBwdWJsaWMgYlQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQHBhcmFtIHBvaW50IC0gVGhlIGxvY2F0aW9uIG9mIHRoZSBpbnRlcnNlY3Rpb25cbiAgICogQHBhcmFtIGFUIC0gVGhlIHBhcmFtZXRyaWMgdmFsdWUgZm9yIHRoZSBmaXJzdCBzZWdtZW50IGF0IHRoZSBsb2NhdGlvbiBvZiB0aGUgaW50ZXJzZWN0aW9uXG4gICAqIEBwYXJhbSBiVCAtIFRoZSBwYXJhbWV0cmljIHZhbHVlIGZvciB0aGUgc2Vjb25kIHNlZ21lbnQgYXQgdGhlIGxvY2F0aW9uIG9mIHRoZSBpbnRlcnNlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9pbnQ6IFZlY3RvcjIsIGFUOiBudW1iZXIsIGJUOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYVQgPj0gLTFlLTEwICYmIGFUIDw9IDEgKyAxZS0xMCwgJ2FUIG91dCBvZiByYW5nZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiVCA+PSAtMWUtMTAgJiYgYlQgPD0gMSArIDFlLTEwLCAnYlQgb3V0IG9mIHJhbmdlJyApO1xuXG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xuXG4gICAgLy8gQ2xhbXBlZCBpbiBjYXNlIGl0J3Mgc2xpZ2h0bHkgb3V0LW9mLXJhbmdlXG4gICAgdGhpcy5hVCA9IFV0aWxzLmNsYW1wKCBhVCwgMCwgMSApO1xuICAgIHRoaXMuYlQgPSBVdGlscy5jbGFtcCggYlQsIDAsIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb24gd2l0aCBhIGFuZCBiIHN3YXBwZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3dhcHBlZCgpOiBTZWdtZW50SW50ZXJzZWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IFNlZ21lbnRJbnRlcnNlY3Rpb24oIHRoaXMucG9pbnQsIHRoaXMuYlQsIHRoaXMuYVQgKTtcbiAgfVxufVxuXG5raXRlLnJlZ2lzdGVyKCAnU2VnbWVudEludGVyc2VjdGlvbicsIFNlZ21lbnRJbnRlcnNlY3Rpb24gKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJraXRlIiwiU2VnbWVudEludGVyc2VjdGlvbiIsImdldFN3YXBwZWQiLCJwb2ludCIsImJUIiwiYVQiLCJhc3NlcnQiLCJjbGFtcCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFdBQVcsMkJBQTJCO0FBRTdDLFNBQVNDLElBQUksUUFBUSxnQkFBZ0I7QUFFdEIsSUFBQSxBQUFNQyxzQkFBTixNQUFNQTtJQXNCbkI7O0dBRUMsR0FDRCxBQUFPQyxhQUFrQztRQUN2QyxPQUFPLElBQUlELG9CQUFxQixJQUFJLENBQUNFLEtBQUssRUFBRSxJQUFJLENBQUNDLEVBQUUsRUFBRSxJQUFJLENBQUNDLEVBQUU7SUFDOUQ7SUFyQkE7Ozs7R0FJQyxHQUNELFlBQW9CRixLQUFjLEVBQUVFLEVBQVUsRUFBRUQsRUFBVSxDQUFHO1FBQzNERSxVQUFVQSxPQUFRRCxNQUFNLENBQUMsU0FBU0EsTUFBTSxJQUFJLE9BQU87UUFDbkRDLFVBQVVBLE9BQVFGLE1BQU0sQ0FBQyxTQUFTQSxNQUFNLElBQUksT0FBTztRQUVuRCxJQUFJLENBQUNELEtBQUssR0FBR0E7UUFFYiw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDRSxFQUFFLEdBQUdOLE1BQU1RLEtBQUssQ0FBRUYsSUFBSSxHQUFHO1FBQzlCLElBQUksQ0FBQ0QsRUFBRSxHQUFHTCxNQUFNUSxLQUFLLENBQUVILElBQUksR0FBRztJQUNoQztBQVFGO0FBNUJBLFNBQXFCSCxpQ0E0QnBCO0FBRURELEtBQUtRLFFBQVEsQ0FBRSx1QkFBdUJQIn0=