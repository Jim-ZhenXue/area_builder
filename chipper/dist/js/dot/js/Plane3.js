// Copyright 2014-2024, University of Colorado Boulder
/**
 * A mathematical plane in 3 dimensions determined by a normal vector to the plane and the distance to the closest
 * point on the plane to the origin
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Ray3 from './Ray3.js';
import Vector3 from './Vector3.js';
let Plane3 = class Plane3 {
    intersectWithRay(ray) {
        return ray.pointAtDistance(ray.distanceToPlane(this));
    }
    /**
   * Returns a new plane that passes through three points $(\vec{a},\vec{b},\vec{c})$
   * The normal of the plane points along $\vec{c-a} \times \vec{b-a}$
   * Passing three collinear points will return null
   *
   * @param a - first point
   * @param b - second point
   * @param c - third point
   */ static fromTriangle(a, b, c) {
        const normal = c.minus(a).cross(b.minus(a));
        if (normal.magnitude === 0) {
            return null;
        }
        normal.normalize();
        return new Plane3(normal, normal.dot(a));
    }
    getIntersection(plane) {
        // see https://en.wikipedia.org/wiki/Plane%E2%80%93plane_intersection
        const dot = this.normal.dot(plane.normal);
        const det = 1 - dot * dot;
        // parallel planes
        if (det === 0) {
            return null;
        }
        const c1 = (this.distance - plane.distance * dot) / det;
        const c2 = (plane.distance - this.distance * dot) / det;
        return new Ray3(this.normal.timesScalar(c1).plus(plane.normal.timesScalar(c2)), this.normal.cross(plane.normal).normalized());
    }
    /**
   * @param normal - A normal vector (perpendicular) to the plane
   * @param distance - The signed distance to the plane from the origin, so that normal.times( distance )
   *                            will be a point on the plane.
   */ constructor(normal, distance){
        this.normal = normal;
        this.distance = distance;
        assert && assert(Math.abs(normal.magnitude - 1) < 0.01, 'the normal vector must be a unit vector');
    }
};
Plane3.XY = new Plane3(new Vector3(0, 0, 1), 0);
Plane3.XZ = new Plane3(new Vector3(0, 1, 0), 0);
Plane3.YZ = new Plane3(new Vector3(1, 0, 0), 0);
export { Plane3 as default };
dot.register('Plane3', Plane3);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9QbGFuZTMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBtYXRoZW1hdGljYWwgcGxhbmUgaW4gMyBkaW1lbnNpb25zIGRldGVybWluZWQgYnkgYSBub3JtYWwgdmVjdG9yIHRvIHRoZSBwbGFuZSBhbmQgdGhlIGRpc3RhbmNlIHRvIHRoZSBjbG9zZXN0XG4gKiBwb2ludCBvbiB0aGUgcGxhbmUgdG8gdGhlIG9yaWdpblxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBSYXkzIGZyb20gJy4vUmF5My5qcyc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuL1ZlY3RvcjMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGFuZTMge1xuXG4gIHB1YmxpYyBub3JtYWw6IFZlY3RvcjM7XG4gIHB1YmxpYyBkaXN0YW5jZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbm9ybWFsIC0gQSBub3JtYWwgdmVjdG9yIChwZXJwZW5kaWN1bGFyKSB0byB0aGUgcGxhbmVcbiAgICogQHBhcmFtIGRpc3RhbmNlIC0gVGhlIHNpZ25lZCBkaXN0YW5jZSB0byB0aGUgcGxhbmUgZnJvbSB0aGUgb3JpZ2luLCBzbyB0aGF0IG5vcm1hbC50aW1lcyggZGlzdGFuY2UgKVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGJlIGEgcG9pbnQgb24gdGhlIHBsYW5lLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBub3JtYWw6IFZlY3RvcjMsIGRpc3RhbmNlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5ub3JtYWwgPSBub3JtYWw7XG4gICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIG5vcm1hbC5tYWduaXR1ZGUgLSAxICkgPCAwLjAxLCAndGhlIG5vcm1hbCB2ZWN0b3IgbXVzdCBiZSBhIHVuaXQgdmVjdG9yJyApO1xuICB9XG5cbiAgcHVibGljIGludGVyc2VjdFdpdGhSYXkoIHJheTogUmF5MyApOiBWZWN0b3IzIHtcbiAgICByZXR1cm4gcmF5LnBvaW50QXREaXN0YW5jZSggcmF5LmRpc3RhbmNlVG9QbGFuZSggdGhpcyApICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBwbGFuZSB0aGF0IHBhc3NlcyB0aHJvdWdoIHRocmVlIHBvaW50cyAkKFxcdmVje2F9LFxcdmVje2J9LFxcdmVje2N9KSRcbiAgICogVGhlIG5vcm1hbCBvZiB0aGUgcGxhbmUgcG9pbnRzIGFsb25nICRcXHZlY3tjLWF9IFxcdGltZXMgXFx2ZWN7Yi1hfSRcbiAgICogUGFzc2luZyB0aHJlZSBjb2xsaW5lYXIgcG9pbnRzIHdpbGwgcmV0dXJuIG51bGxcbiAgICpcbiAgICogQHBhcmFtIGEgLSBmaXJzdCBwb2ludFxuICAgKiBAcGFyYW0gYiAtIHNlY29uZCBwb2ludFxuICAgKiBAcGFyYW0gYyAtIHRoaXJkIHBvaW50XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21UcmlhbmdsZSggYTogVmVjdG9yMywgYjogVmVjdG9yMywgYzogVmVjdG9yMyApOiBQbGFuZTMgfCBudWxsIHtcbiAgICBjb25zdCBub3JtYWwgPSAoIGMubWludXMoIGEgKSApLmNyb3NzKCBiLm1pbnVzKCBhICkgKTtcbiAgICBpZiAoIG5vcm1hbC5tYWduaXR1ZGUgPT09IDAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbm9ybWFsLm5vcm1hbGl6ZSgpO1xuXG4gICAgcmV0dXJuIG5ldyBQbGFuZTMoIG5vcm1hbCwgbm9ybWFsLmRvdCggYSApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0SW50ZXJzZWN0aW9uKCBwbGFuZTogUGxhbmUzICk6IFJheTMgfCBudWxsIHtcbiAgICAvLyBzZWUgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGxhbmUlRTIlODAlOTNwbGFuZV9pbnRlcnNlY3Rpb25cblxuICAgIGNvbnN0IGRvdCA9IHRoaXMubm9ybWFsLmRvdCggcGxhbmUubm9ybWFsICk7XG4gICAgY29uc3QgZGV0ID0gMSAtIGRvdCAqIGRvdDtcblxuICAgIC8vIHBhcmFsbGVsIHBsYW5lc1xuICAgIGlmICggZGV0ID09PSAwICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYzEgPSAoIHRoaXMuZGlzdGFuY2UgLSBwbGFuZS5kaXN0YW5jZSAqIGRvdCApIC8gZGV0O1xuICAgIGNvbnN0IGMyID0gKCBwbGFuZS5kaXN0YW5jZSAtIHRoaXMuZGlzdGFuY2UgKiBkb3QgKSAvIGRldDtcblxuICAgIHJldHVybiBuZXcgUmF5MyhcbiAgICAgIHRoaXMubm9ybWFsLnRpbWVzU2NhbGFyKCBjMSApLnBsdXMoIHBsYW5lLm5vcm1hbC50aW1lc1NjYWxhciggYzIgKSApLFxuICAgICAgdGhpcy5ub3JtYWwuY3Jvc3MoIHBsYW5lLm5vcm1hbCApLm5vcm1hbGl6ZWQoKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFhZID0gbmV3IFBsYW5lMyggbmV3IFZlY3RvcjMoIDAsIDAsIDEgKSwgMCApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFhaID0gbmV3IFBsYW5lMyggbmV3IFZlY3RvcjMoIDAsIDEsIDAgKSwgMCApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFlaID0gbmV3IFBsYW5lMyggbmV3IFZlY3RvcjMoIDEsIDAsIDAgKSwgMCApO1xufVxuXG5kb3QucmVnaXN0ZXIoICdQbGFuZTMnLCBQbGFuZTMgKTsiXSwibmFtZXMiOlsiZG90IiwiUmF5MyIsIlZlY3RvcjMiLCJQbGFuZTMiLCJpbnRlcnNlY3RXaXRoUmF5IiwicmF5IiwicG9pbnRBdERpc3RhbmNlIiwiZGlzdGFuY2VUb1BsYW5lIiwiZnJvbVRyaWFuZ2xlIiwiYSIsImIiLCJjIiwibm9ybWFsIiwibWludXMiLCJjcm9zcyIsIm1hZ25pdHVkZSIsIm5vcm1hbGl6ZSIsImdldEludGVyc2VjdGlvbiIsInBsYW5lIiwiZGV0IiwiYzEiLCJkaXN0YW5jZSIsImMyIiwidGltZXNTY2FsYXIiLCJwbHVzIiwibm9ybWFsaXplZCIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJYWSIsIlhaIiwiWVoiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLFVBQVUsWUFBWTtBQUM3QixPQUFPQyxhQUFhLGVBQWU7QUFFcEIsSUFBQSxBQUFNQyxTQUFOLE1BQU1BO0lBaUJaQyxpQkFBa0JDLEdBQVMsRUFBWTtRQUM1QyxPQUFPQSxJQUFJQyxlQUFlLENBQUVELElBQUlFLGVBQWUsQ0FBRSxJQUFJO0lBQ3ZEO0lBRUE7Ozs7Ozs7O0dBUUMsR0FDRCxPQUFjQyxhQUFjQyxDQUFVLEVBQUVDLENBQVUsRUFBRUMsQ0FBVSxFQUFrQjtRQUM5RSxNQUFNQyxTQUFTLEFBQUVELEVBQUVFLEtBQUssQ0FBRUosR0FBTUssS0FBSyxDQUFFSixFQUFFRyxLQUFLLENBQUVKO1FBQ2hELElBQUtHLE9BQU9HLFNBQVMsS0FBSyxHQUFJO1lBQzVCLE9BQU87UUFDVDtRQUNBSCxPQUFPSSxTQUFTO1FBRWhCLE9BQU8sSUFBSWIsT0FBUVMsUUFBUUEsT0FBT1osR0FBRyxDQUFFUztJQUN6QztJQUVPUSxnQkFBaUJDLEtBQWEsRUFBZ0I7UUFDbkQscUVBQXFFO1FBRXJFLE1BQU1sQixNQUFNLElBQUksQ0FBQ1ksTUFBTSxDQUFDWixHQUFHLENBQUVrQixNQUFNTixNQUFNO1FBQ3pDLE1BQU1PLE1BQU0sSUFBSW5CLE1BQU1BO1FBRXRCLGtCQUFrQjtRQUNsQixJQUFLbUIsUUFBUSxHQUFJO1lBQ2YsT0FBTztRQUNUO1FBRUEsTUFBTUMsS0FBSyxBQUFFLENBQUEsSUFBSSxDQUFDQyxRQUFRLEdBQUdILE1BQU1HLFFBQVEsR0FBR3JCLEdBQUUsSUFBTW1CO1FBQ3RELE1BQU1HLEtBQUssQUFBRUosQ0FBQUEsTUFBTUcsUUFBUSxHQUFHLElBQUksQ0FBQ0EsUUFBUSxHQUFHckIsR0FBRSxJQUFNbUI7UUFFdEQsT0FBTyxJQUFJbEIsS0FDVCxJQUFJLENBQUNXLE1BQU0sQ0FBQ1csV0FBVyxDQUFFSCxJQUFLSSxJQUFJLENBQUVOLE1BQU1OLE1BQU0sQ0FBQ1csV0FBVyxDQUFFRCxNQUM5RCxJQUFJLENBQUNWLE1BQU0sQ0FBQ0UsS0FBSyxDQUFFSSxNQUFNTixNQUFNLEVBQUdhLFVBQVU7SUFFaEQ7SUFyREE7Ozs7R0FJQyxHQUNELFlBQW9CYixNQUFlLEVBQUVTLFFBQWdCLENBQUc7UUFDdEQsSUFBSSxDQUFDVCxNQUFNLEdBQUdBO1FBQ2QsSUFBSSxDQUFDUyxRQUFRLEdBQUdBO1FBRWhCSyxVQUFVQSxPQUFRQyxLQUFLQyxHQUFHLENBQUVoQixPQUFPRyxTQUFTLEdBQUcsS0FBTSxNQUFNO0lBQzdEO0FBZ0RGO0FBL0RxQlosT0E0REkwQixLQUFLLElBQUkxQixPQUFRLElBQUlELFFBQVMsR0FBRyxHQUFHLElBQUs7QUE1RDdDQyxPQTZESTJCLEtBQUssSUFBSTNCLE9BQVEsSUFBSUQsUUFBUyxHQUFHLEdBQUcsSUFBSztBQTdEN0NDLE9BOERJNEIsS0FBSyxJQUFJNUIsT0FBUSxJQUFJRCxRQUFTLEdBQUcsR0FBRyxJQUFLO0FBOURsRSxTQUFxQkMsb0JBK0RwQjtBQUVESCxJQUFJZ0MsUUFBUSxDQUFFLFVBQVU3QiJ9