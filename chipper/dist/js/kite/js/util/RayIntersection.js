// Copyright 2017-2024, University of Colorado Boulder
/**
 * An intersection between a ray and a segment.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Utils from '../../../dot/js/Utils.js';
import { kite } from '../imports.js';
let RayIntersection = class RayIntersection {
    /**
   * @param distance - The distance between the ray's position and the point of intersection
   * @param point - The location of the intersection
   * @param normal - The normal (unit vector perpendicular to the segment at the location) at the
   *                           intersection, such that the dot product between the normal and ray direction is <= 0.
   * @param wind - The winding number for the intersection. Either 1 or -1, depending on the direction the
   *                        segment goes relative to the ray (to the left or right). Used for computing Shape
   *                        intersection via the non-zero fill rule.
   * @param t - Parametric value (for the segment) of the intersection
   */ constructor(distance, point, normal, wind, t){
        assert && assert(isFinite(distance) && distance >= 0, 'invalid distance');
        assert && assert(Math.abs(normal.magnitude - 1) < 1e-7, 'invalid normal');
        assert && assert(t >= -1e-10 && t <= 1 + 1e-10, `t out of range: ${t}`);
        this.point = point;
        this.normal = normal;
        this.distance = distance;
        this.wind = wind;
        this.t = Utils.clamp(t, 0, 1); // In case it is slightly out of range
    }
};
export { RayIntersection as default };
kite.register('RayIntersection', RayIntersection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9SYXlJbnRlcnNlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gaW50ZXJzZWN0aW9uIGJldHdlZW4gYSByYXkgYW5kIGEgc2VnbWVudC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBraXRlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJheUludGVyc2VjdGlvbiB7XG5cbiAgcHVibGljIHBvaW50OiBWZWN0b3IyO1xuICBwdWJsaWMgbm9ybWFsOiBWZWN0b3IyO1xuICBwdWJsaWMgZGlzdGFuY2U6IG51bWJlcjtcbiAgcHVibGljIHdpbmQ6IG51bWJlcjtcbiAgcHVibGljIHQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQHBhcmFtIGRpc3RhbmNlIC0gVGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHJheSdzIHBvc2l0aW9uIGFuZCB0aGUgcG9pbnQgb2YgaW50ZXJzZWN0aW9uXG4gICAqIEBwYXJhbSBwb2ludCAtIFRoZSBsb2NhdGlvbiBvZiB0aGUgaW50ZXJzZWN0aW9uXG4gICAqIEBwYXJhbSBub3JtYWwgLSBUaGUgbm9ybWFsICh1bml0IHZlY3RvciBwZXJwZW5kaWN1bGFyIHRvIHRoZSBzZWdtZW50IGF0IHRoZSBsb2NhdGlvbikgYXQgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJzZWN0aW9uLCBzdWNoIHRoYXQgdGhlIGRvdCBwcm9kdWN0IGJldHdlZW4gdGhlIG5vcm1hbCBhbmQgcmF5IGRpcmVjdGlvbiBpcyA8PSAwLlxuICAgKiBAcGFyYW0gd2luZCAtIFRoZSB3aW5kaW5nIG51bWJlciBmb3IgdGhlIGludGVyc2VjdGlvbi4gRWl0aGVyIDEgb3IgLTEsIGRlcGVuZGluZyBvbiB0aGUgZGlyZWN0aW9uIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIHNlZ21lbnQgZ29lcyByZWxhdGl2ZSB0byB0aGUgcmF5ICh0byB0aGUgbGVmdCBvciByaWdodCkuIFVzZWQgZm9yIGNvbXB1dGluZyBTaGFwZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbiB2aWEgdGhlIG5vbi16ZXJvIGZpbGwgcnVsZS5cbiAgICogQHBhcmFtIHQgLSBQYXJhbWV0cmljIHZhbHVlIChmb3IgdGhlIHNlZ21lbnQpIG9mIHRoZSBpbnRlcnNlY3Rpb25cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGlzdGFuY2U6IG51bWJlciwgcG9pbnQ6IFZlY3RvcjIsIG5vcm1hbDogVmVjdG9yMiwgd2luZDogbnVtYmVyLCB0OiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGRpc3RhbmNlICkgJiYgZGlzdGFuY2UgPj0gMCwgJ2ludmFsaWQgZGlzdGFuY2UnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIG5vcm1hbC5tYWduaXR1ZGUgLSAxICkgPCAxZS03LCAnaW52YWxpZCBub3JtYWwnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdCA+PSAtMWUtMTAgJiYgdCA8PSAxICsgMWUtMTAsIGB0IG91dCBvZiByYW5nZTogJHt0fWAgKTtcblxuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcbiAgICB0aGlzLm5vcm1hbCA9IG5vcm1hbDtcbiAgICB0aGlzLmRpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgdGhpcy53aW5kID0gd2luZDtcbiAgICB0aGlzLnQgPSBVdGlscy5jbGFtcCggdCwgMCwgMSApOyAvLyBJbiBjYXNlIGl0IGlzIHNsaWdodGx5IG91dCBvZiByYW5nZVxuICB9XG59XG5cbmtpdGUucmVnaXN0ZXIoICdSYXlJbnRlcnNlY3Rpb24nLCBSYXlJbnRlcnNlY3Rpb24gKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJraXRlIiwiUmF5SW50ZXJzZWN0aW9uIiwiZGlzdGFuY2UiLCJwb2ludCIsIm5vcm1hbCIsIndpbmQiLCJ0IiwiYXNzZXJ0IiwiaXNGaW5pdGUiLCJNYXRoIiwiYWJzIiwibWFnbml0dWRlIiwiY2xhbXAiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxXQUFXLDJCQUEyQjtBQUU3QyxTQUFTQyxJQUFJLFFBQVEsZ0JBQWdCO0FBRXRCLElBQUEsQUFBTUMsa0JBQU4sTUFBTUE7SUFRbkI7Ozs7Ozs7OztHQVNDLEdBQ0QsWUFBb0JDLFFBQWdCLEVBQUVDLEtBQWMsRUFBRUMsTUFBZSxFQUFFQyxJQUFZLEVBQUVDLENBQVMsQ0FBRztRQUMvRkMsVUFBVUEsT0FBUUMsU0FBVU4sYUFBY0EsWUFBWSxHQUFHO1FBQ3pESyxVQUFVQSxPQUFRRSxLQUFLQyxHQUFHLENBQUVOLE9BQU9PLFNBQVMsR0FBRyxLQUFNLE1BQU07UUFDM0RKLFVBQVVBLE9BQVFELEtBQUssQ0FBQyxTQUFTQSxLQUFLLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFQSxHQUFHO1FBRXZFLElBQUksQ0FBQ0gsS0FBSyxHQUFHQTtRQUNiLElBQUksQ0FBQ0MsTUFBTSxHQUFHQTtRQUNkLElBQUksQ0FBQ0YsUUFBUSxHQUFHQTtRQUNoQixJQUFJLENBQUNHLElBQUksR0FBR0E7UUFDWixJQUFJLENBQUNDLENBQUMsR0FBR1AsTUFBTWEsS0FBSyxDQUFFTixHQUFHLEdBQUcsSUFBSyxzQ0FBc0M7SUFDekU7QUFDRjtBQTdCQSxTQUFxQkwsNkJBNkJwQjtBQUVERCxLQUFLYSxRQUFRLENBQUUsbUJBQW1CWiJ9