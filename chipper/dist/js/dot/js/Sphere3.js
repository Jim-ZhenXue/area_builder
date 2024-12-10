// Copyright 2014-2020, University of Colorado Boulder
/**
 * A sphere in 3 dimensions (NOT a 3-sphere).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
let Sphere3 = class Sphere3 {
    /**
   * Determines if a ray (a half-line) intersects this sphere.
   * A successful intersection returns the result the closest intersection in the form { distance, hitPoint, normal, fromOutside },
   * distance: {number} distance to the intersection point
   * hitPoint: {Vector3} the intersection point
   * normal: {Vector3} the normal vector on the sphere at the point of intersection. (the normal vector points outwards the sphere by convention)
   * fromOutside: {boolean} is the ray half-line intersecting the sphere from the outside of a sphere or from the inside.
   *
   * Returns null if the ray misses the sphere
   *
   * @public
   * @param {Ray3} ray - The ray to intersect with the sphere
   * @param {number} epsilon - A small varying-point value to be used to handle intersections tangent to the sphere
   * @returns {{ distance: number, hitPoint: Vector3, normal, fromOutside: boolean }| null}
   */ intersect(ray, epsilon) {
        const raydir = ray.direction;
        const pos = ray.position;
        const centerToRay = pos.minus(this.center);
        // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
        const tmp = raydir.dot(centerToRay);
        const centerToRayDistSq = centerToRay.magnitudeSquared;
        const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - this.radius * this.radius);
        if (det < epsilon) {
            // ray misses sphere entirely
            return null;
        }
        const base = raydir.dot(this.center) - raydir.dot(pos);
        const sqt = Math.sqrt(det) / 2;
        // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
        const ta = base - sqt;
        // the "second" entry point distance
        const tb = base + sqt;
        if (tb < epsilon) {
            // sphere is behind ray, so don't return an intersection
            return null;
        }
        const hitPositionB = ray.pointAtDistance(tb);
        const normalB = hitPositionB.minus(this.center).normalized();
        if (ta < epsilon) {
            // we are inside the sphere
            // in => out
            return {
                distance: tb,
                hitPoint: hitPositionB,
                normal: normalB.negated(),
                fromOutside: false
            };
        } else {
            // two possible hits
            const hitPositionA = ray.pointAtDistance(ta);
            const normalA = hitPositionA.minus(this.center).normalized();
            // close hit, we have out => in
            return {
                distance: ta,
                hitPoint: hitPositionA,
                normal: normalA,
                fromOutside: true
            };
        }
    }
    /**
   *
   * Returns the intersections of a ray with a sphere. There will be 0 or 2 intersections, with
   * the "proper" intersection first, if applicable (closest in front of the ray).
   * Note that this method makes the implicit assumptions that the ray's origin does not lie inside the sphere.
   *
   * @public
   * @param {Ray3} ray - The ray to intersect with the sphere
   * @param {number} epsilon - A small varying-point value to be used to handle intersections tangent to the sphere
   * @returns {Array.<{distance:number, hitPoint:Vector3, normal:Vector3, fromOutside:boolean }>| null} -  An array of intersection
   *                                                                         results like { distance, hitPoint, normal, fromOutside }.
   */ intersections(ray, epsilon) {
        const raydir = ray.direction;
        const pos = ray.position;
        const centerToRay = pos.minus(this.center);
        // basically, we can use the quadratic equation to solve for both possible hit points (both +- roots are the hit points)
        const tmp = raydir.dot(centerToRay);
        const centerToRayDistSq = centerToRay.magnitudeSquared;
        const det = 4 * tmp * tmp - 4 * (centerToRayDistSq - this.radius * this.radius);
        if (det < epsilon) {
            // ray misses sphere entirely
            return [];
        }
        const base = raydir.dot(this.center) - raydir.dot(pos);
        const sqt = Math.sqrt(det) / 2;
        // the "first" entry point distance into the sphere. if we are inside the sphere, it is behind us
        const ta = base - sqt;
        // the "second" entry point distance
        const tb = base + sqt;
        if (tb < epsilon) {
            // sphere is behind ray, so don't return an intersection
            return [];
        }
        const hitPositionB = ray.pointAtDistance(tb);
        const normalB = hitPositionB.minus(this.center).normalized();
        const hitPositionA = ray.pointAtDistance(ta);
        const normalA = hitPositionA.minus(this.center).normalized();
        const resultB = {
            distance: tb,
            hitPoint: hitPositionB,
            normal: normalB.negated(),
            fromOutside: false
        };
        const resultA = {
            distance: ta,
            hitPoint: hitPositionA,
            normal: normalA,
            fromOutside: true
        };
        if (ta < epsilon) {
            // we are inside the sphere
            // in => out
            return [
                resultB,
                resultA
            ];
        } else {
            // two possible hits
            // close hit, we have out => in
            return [
                resultA,
                resultB
            ];
        }
    }
    /**
   *
   * @param {Vector3} center  - The center of the sphere
   * @param {number} radius - The radius of the sphere
   */ constructor(center, radius){
        // @public {Vector3} - The location of the center of the sphere
        this.center = center;
        // @public {number} -  the radius of the sphere
        this.radius = radius;
        assert && assert(radius >= 0, 'the radius of a sphere should be positive');
    }
};
dot.register('Sphere3', Sphere3);
export default Sphere3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9TcGhlcmUzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgc3BoZXJlIGluIDMgZGltZW5zaW9ucyAoTk9UIGEgMy1zcGhlcmUpLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcblxuY2xhc3MgU3BoZXJlMyB7XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IGNlbnRlciAgLSBUaGUgY2VudGVyIG9mIHRoZSBzcGhlcmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyAtIFRoZSByYWRpdXMgb2YgdGhlIHNwaGVyZVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGNlbnRlciwgcmFkaXVzICkge1xuXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yM30gLSBUaGUgbG9jYXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGUgc3BoZXJlXG4gICAgdGhpcy5jZW50ZXIgPSBjZW50ZXI7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gIHRoZSByYWRpdXMgb2YgdGhlIHNwaGVyZVxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFkaXVzID49IDAsICd0aGUgcmFkaXVzIG9mIGEgc3BoZXJlIHNob3VsZCBiZSBwb3NpdGl2ZScgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSByYXkgKGEgaGFsZi1saW5lKSBpbnRlcnNlY3RzIHRoaXMgc3BoZXJlLlxuICAgKiBBIHN1Y2Nlc3NmdWwgaW50ZXJzZWN0aW9uIHJldHVybnMgdGhlIHJlc3VsdCB0aGUgY2xvc2VzdCBpbnRlcnNlY3Rpb24gaW4gdGhlIGZvcm0geyBkaXN0YW5jZSwgaGl0UG9pbnQsIG5vcm1hbCwgZnJvbU91dHNpZGUgfSxcbiAgICogZGlzdGFuY2U6IHtudW1iZXJ9IGRpc3RhbmNlIHRvIHRoZSBpbnRlcnNlY3Rpb24gcG9pbnRcbiAgICogaGl0UG9pbnQ6IHtWZWN0b3IzfSB0aGUgaW50ZXJzZWN0aW9uIHBvaW50XG4gICAqIG5vcm1hbDoge1ZlY3RvcjN9IHRoZSBub3JtYWwgdmVjdG9yIG9uIHRoZSBzcGhlcmUgYXQgdGhlIHBvaW50IG9mIGludGVyc2VjdGlvbi4gKHRoZSBub3JtYWwgdmVjdG9yIHBvaW50cyBvdXR3YXJkcyB0aGUgc3BoZXJlIGJ5IGNvbnZlbnRpb24pXG4gICAqIGZyb21PdXRzaWRlOiB7Ym9vbGVhbn0gaXMgdGhlIHJheSBoYWxmLWxpbmUgaW50ZXJzZWN0aW5nIHRoZSBzcGhlcmUgZnJvbSB0aGUgb3V0c2lkZSBvZiBhIHNwaGVyZSBvciBmcm9tIHRoZSBpbnNpZGUuXG4gICAqXG4gICAqIFJldHVybnMgbnVsbCBpZiB0aGUgcmF5IG1pc3NlcyB0aGUgc3BoZXJlXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtSYXkzfSByYXkgLSBUaGUgcmF5IHRvIGludGVyc2VjdCB3aXRoIHRoZSBzcGhlcmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBBIHNtYWxsIHZhcnlpbmctcG9pbnQgdmFsdWUgdG8gYmUgdXNlZCB0byBoYW5kbGUgaW50ZXJzZWN0aW9ucyB0YW5nZW50IHRvIHRoZSBzcGhlcmVcbiAgICogQHJldHVybnMge3sgZGlzdGFuY2U6IG51bWJlciwgaGl0UG9pbnQ6IFZlY3RvcjMsIG5vcm1hbCwgZnJvbU91dHNpZGU6IGJvb2xlYW4gfXwgbnVsbH1cbiAgICovXG4gIGludGVyc2VjdCggcmF5LCBlcHNpbG9uICkge1xuICAgIGNvbnN0IHJheWRpciA9IHJheS5kaXJlY3Rpb247XG4gICAgY29uc3QgcG9zID0gcmF5LnBvc2l0aW9uO1xuICAgIGNvbnN0IGNlbnRlclRvUmF5ID0gcG9zLm1pbnVzKCB0aGlzLmNlbnRlciApO1xuXG4gICAgLy8gYmFzaWNhbGx5LCB3ZSBjYW4gdXNlIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gdG8gc29sdmUgZm9yIGJvdGggcG9zc2libGUgaGl0IHBvaW50cyAoYm90aCArLSByb290cyBhcmUgdGhlIGhpdCBwb2ludHMpXG4gICAgY29uc3QgdG1wID0gcmF5ZGlyLmRvdCggY2VudGVyVG9SYXkgKTtcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XG4gICAgY29uc3QgZGV0ID0gNCAqIHRtcCAqIHRtcCAtIDQgKiAoIGNlbnRlclRvUmF5RGlzdFNxIC0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyApO1xuICAgIGlmICggZGV0IDwgZXBzaWxvbiApIHtcbiAgICAgIC8vIHJheSBtaXNzZXMgc3BoZXJlIGVudGlyZWx5XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlID0gcmF5ZGlyLmRvdCggdGhpcy5jZW50ZXIgKSAtIHJheWRpci5kb3QoIHBvcyApO1xuICAgIGNvbnN0IHNxdCA9IE1hdGguc3FydCggZGV0ICkgLyAyO1xuXG4gICAgLy8gdGhlIFwiZmlyc3RcIiBlbnRyeSBwb2ludCBkaXN0YW5jZSBpbnRvIHRoZSBzcGhlcmUuIGlmIHdlIGFyZSBpbnNpZGUgdGhlIHNwaGVyZSwgaXQgaXMgYmVoaW5kIHVzXG4gICAgY29uc3QgdGEgPSBiYXNlIC0gc3F0O1xuXG4gICAgLy8gdGhlIFwic2Vjb25kXCIgZW50cnkgcG9pbnQgZGlzdGFuY2VcbiAgICBjb25zdCB0YiA9IGJhc2UgKyBzcXQ7XG5cbiAgICBpZiAoIHRiIDwgZXBzaWxvbiApIHtcbiAgICAgIC8vIHNwaGVyZSBpcyBiZWhpbmQgcmF5LCBzbyBkb24ndCByZXR1cm4gYW4gaW50ZXJzZWN0aW9uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRQb3NpdGlvbkIgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YiApO1xuICAgIGNvbnN0IG5vcm1hbEIgPSBoaXRQb3NpdGlvbkIubWludXMoIHRoaXMuY2VudGVyICkubm9ybWFsaXplZCgpO1xuXG4gICAgaWYgKCB0YSA8IGVwc2lsb24gKSB7XG4gICAgICAvLyB3ZSBhcmUgaW5zaWRlIHRoZSBzcGhlcmVcbiAgICAgIC8vIGluID0+IG91dFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzdGFuY2U6IHRiLFxuICAgICAgICBoaXRQb2ludDogaGl0UG9zaXRpb25CLFxuICAgICAgICBub3JtYWw6IG5vcm1hbEIubmVnYXRlZCgpLFxuICAgICAgICBmcm9tT3V0c2lkZTogZmFsc2VcbiAgICAgIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gdHdvIHBvc3NpYmxlIGhpdHNcbiAgICAgIGNvbnN0IGhpdFBvc2l0aW9uQSA9IHJheS5wb2ludEF0RGlzdGFuY2UoIHRhICk7XG4gICAgICBjb25zdCBub3JtYWxBID0gaGl0UG9zaXRpb25BLm1pbnVzKCB0aGlzLmNlbnRlciApLm5vcm1hbGl6ZWQoKTtcblxuICAgICAgLy8gY2xvc2UgaGl0LCB3ZSBoYXZlIG91dCA9PiBpblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzdGFuY2U6IHRhLFxuICAgICAgICBoaXRQb2ludDogaGl0UG9zaXRpb25BLFxuICAgICAgICBub3JtYWw6IG5vcm1hbEEsXG4gICAgICAgIGZyb21PdXRzaWRlOiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBSZXR1cm5zIHRoZSBpbnRlcnNlY3Rpb25zIG9mIGEgcmF5IHdpdGggYSBzcGhlcmUuIFRoZXJlIHdpbGwgYmUgMCBvciAyIGludGVyc2VjdGlvbnMsIHdpdGhcbiAgICogdGhlIFwicHJvcGVyXCIgaW50ZXJzZWN0aW9uIGZpcnN0LCBpZiBhcHBsaWNhYmxlIChjbG9zZXN0IGluIGZyb250IG9mIHRoZSByYXkpLlxuICAgKiBOb3RlIHRoYXQgdGhpcyBtZXRob2QgbWFrZXMgdGhlIGltcGxpY2l0IGFzc3VtcHRpb25zIHRoYXQgdGhlIHJheSdzIG9yaWdpbiBkb2VzIG5vdCBsaWUgaW5zaWRlIHRoZSBzcGhlcmUuXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtSYXkzfSByYXkgLSBUaGUgcmF5IHRvIGludGVyc2VjdCB3aXRoIHRoZSBzcGhlcmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVwc2lsb24gLSBBIHNtYWxsIHZhcnlpbmctcG9pbnQgdmFsdWUgdG8gYmUgdXNlZCB0byBoYW5kbGUgaW50ZXJzZWN0aW9ucyB0YW5nZW50IHRvIHRoZSBzcGhlcmVcbiAgICogQHJldHVybnMge0FycmF5Ljx7ZGlzdGFuY2U6bnVtYmVyLCBoaXRQb2ludDpWZWN0b3IzLCBub3JtYWw6VmVjdG9yMywgZnJvbU91dHNpZGU6Ym9vbGVhbiB9PnwgbnVsbH0gLSAgQW4gYXJyYXkgb2YgaW50ZXJzZWN0aW9uXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgbGlrZSB7IGRpc3RhbmNlLCBoaXRQb2ludCwgbm9ybWFsLCBmcm9tT3V0c2lkZSB9LlxuICAgKi9cbiAgaW50ZXJzZWN0aW9ucyggcmF5LCBlcHNpbG9uICkge1xuICAgIGNvbnN0IHJheWRpciA9IHJheS5kaXJlY3Rpb247XG4gICAgY29uc3QgcG9zID0gcmF5LnBvc2l0aW9uO1xuICAgIGNvbnN0IGNlbnRlclRvUmF5ID0gcG9zLm1pbnVzKCB0aGlzLmNlbnRlciApO1xuXG4gICAgLy8gYmFzaWNhbGx5LCB3ZSBjYW4gdXNlIHRoZSBxdWFkcmF0aWMgZXF1YXRpb24gdG8gc29sdmUgZm9yIGJvdGggcG9zc2libGUgaGl0IHBvaW50cyAoYm90aCArLSByb290cyBhcmUgdGhlIGhpdCBwb2ludHMpXG4gICAgY29uc3QgdG1wID0gcmF5ZGlyLmRvdCggY2VudGVyVG9SYXkgKTtcbiAgICBjb25zdCBjZW50ZXJUb1JheURpc3RTcSA9IGNlbnRlclRvUmF5Lm1hZ25pdHVkZVNxdWFyZWQ7XG4gICAgY29uc3QgZGV0ID0gNCAqIHRtcCAqIHRtcCAtIDQgKiAoIGNlbnRlclRvUmF5RGlzdFNxIC0gdGhpcy5yYWRpdXMgKiB0aGlzLnJhZGl1cyApO1xuICAgIGlmICggZGV0IDwgZXBzaWxvbiApIHtcbiAgICAgIC8vIHJheSBtaXNzZXMgc3BoZXJlIGVudGlyZWx5XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IHJheWRpci5kb3QoIHRoaXMuY2VudGVyICkgLSByYXlkaXIuZG90KCBwb3MgKTtcbiAgICBjb25zdCBzcXQgPSBNYXRoLnNxcnQoIGRldCApIC8gMjtcblxuICAgIC8vIHRoZSBcImZpcnN0XCIgZW50cnkgcG9pbnQgZGlzdGFuY2UgaW50byB0aGUgc3BoZXJlLiBpZiB3ZSBhcmUgaW5zaWRlIHRoZSBzcGhlcmUsIGl0IGlzIGJlaGluZCB1c1xuICAgIGNvbnN0IHRhID0gYmFzZSAtIHNxdDtcblxuICAgIC8vIHRoZSBcInNlY29uZFwiIGVudHJ5IHBvaW50IGRpc3RhbmNlXG4gICAgY29uc3QgdGIgPSBiYXNlICsgc3F0O1xuXG4gICAgaWYgKCB0YiA8IGVwc2lsb24gKSB7XG4gICAgICAvLyBzcGhlcmUgaXMgYmVoaW5kIHJheSwgc28gZG9uJ3QgcmV0dXJuIGFuIGludGVyc2VjdGlvblxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IGhpdFBvc2l0aW9uQiA9IHJheS5wb2ludEF0RGlzdGFuY2UoIHRiICk7XG4gICAgY29uc3Qgbm9ybWFsQiA9IGhpdFBvc2l0aW9uQi5taW51cyggdGhpcy5jZW50ZXIgKS5ub3JtYWxpemVkKCk7XG5cbiAgICBjb25zdCBoaXRQb3NpdGlvbkEgPSByYXkucG9pbnRBdERpc3RhbmNlKCB0YSApO1xuICAgIGNvbnN0IG5vcm1hbEEgPSBoaXRQb3NpdGlvbkEubWludXMoIHRoaXMuY2VudGVyICkubm9ybWFsaXplZCgpO1xuXG4gICAgY29uc3QgcmVzdWx0QiA9IHtcbiAgICAgIGRpc3RhbmNlOiB0YixcbiAgICAgIGhpdFBvaW50OiBoaXRQb3NpdGlvbkIsXG4gICAgICBub3JtYWw6IG5vcm1hbEIubmVnYXRlZCgpLFxuICAgICAgZnJvbU91dHNpZGU6IGZhbHNlXG4gICAgfTtcbiAgICBjb25zdCByZXN1bHRBID0ge1xuICAgICAgZGlzdGFuY2U6IHRhLFxuICAgICAgaGl0UG9pbnQ6IGhpdFBvc2l0aW9uQSxcbiAgICAgIG5vcm1hbDogbm9ybWFsQSxcbiAgICAgIGZyb21PdXRzaWRlOiB0cnVlXG4gICAgfTtcbiAgICBpZiAoIHRhIDwgZXBzaWxvbiApIHtcbiAgICAgIC8vIHdlIGFyZSBpbnNpZGUgdGhlIHNwaGVyZVxuICAgICAgLy8gaW4gPT4gb3V0XG5cbiAgICAgIHJldHVybiBbIHJlc3VsdEIsIHJlc3VsdEEgXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyB0d28gcG9zc2libGUgaGl0c1xuXG4gICAgICAvLyBjbG9zZSBoaXQsIHdlIGhhdmUgb3V0ID0+IGluXG4gICAgICByZXR1cm4gWyByZXN1bHRBLCByZXN1bHRCIF07XG4gICAgfVxuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1NwaGVyZTMnLCBTcGhlcmUzICk7XG5cbmV4cG9ydCBkZWZhdWx0IFNwaGVyZTM7Il0sIm5hbWVzIjpbImRvdCIsIlNwaGVyZTMiLCJpbnRlcnNlY3QiLCJyYXkiLCJlcHNpbG9uIiwicmF5ZGlyIiwiZGlyZWN0aW9uIiwicG9zIiwicG9zaXRpb24iLCJjZW50ZXJUb1JheSIsIm1pbnVzIiwiY2VudGVyIiwidG1wIiwiY2VudGVyVG9SYXlEaXN0U3EiLCJtYWduaXR1ZGVTcXVhcmVkIiwiZGV0IiwicmFkaXVzIiwiYmFzZSIsInNxdCIsIk1hdGgiLCJzcXJ0IiwidGEiLCJ0YiIsImhpdFBvc2l0aW9uQiIsInBvaW50QXREaXN0YW5jZSIsIm5vcm1hbEIiLCJub3JtYWxpemVkIiwiZGlzdGFuY2UiLCJoaXRQb2ludCIsIm5vcm1hbCIsIm5lZ2F0ZWQiLCJmcm9tT3V0c2lkZSIsImhpdFBvc2l0aW9uQSIsIm5vcm1hbEEiLCJpbnRlcnNlY3Rpb25zIiwicmVzdWx0QiIsInJlc3VsdEEiLCJjb25zdHJ1Y3RvciIsImFzc2VydCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUUzQixJQUFBLEFBQU1DLFVBQU4sTUFBTUE7SUFrQko7Ozs7Ozs7Ozs7Ozs7O0dBY0MsR0FDREMsVUFBV0MsR0FBRyxFQUFFQyxPQUFPLEVBQUc7UUFDeEIsTUFBTUMsU0FBU0YsSUFBSUcsU0FBUztRQUM1QixNQUFNQyxNQUFNSixJQUFJSyxRQUFRO1FBQ3hCLE1BQU1DLGNBQWNGLElBQUlHLEtBQUssQ0FBRSxJQUFJLENBQUNDLE1BQU07UUFFMUMsd0hBQXdIO1FBQ3hILE1BQU1DLE1BQU1QLE9BQU9MLEdBQUcsQ0FBRVM7UUFDeEIsTUFBTUksb0JBQW9CSixZQUFZSyxnQkFBZ0I7UUFDdEQsTUFBTUMsTUFBTSxJQUFJSCxNQUFNQSxNQUFNLElBQU1DLENBQUFBLG9CQUFvQixJQUFJLENBQUNHLE1BQU0sR0FBRyxJQUFJLENBQUNBLE1BQU0sQUFBRDtRQUM5RSxJQUFLRCxNQUFNWCxTQUFVO1lBQ25CLDZCQUE2QjtZQUM3QixPQUFPO1FBQ1Q7UUFFQSxNQUFNYSxPQUFPWixPQUFPTCxHQUFHLENBQUUsSUFBSSxDQUFDVyxNQUFNLElBQUtOLE9BQU9MLEdBQUcsQ0FBRU87UUFDckQsTUFBTVcsTUFBTUMsS0FBS0MsSUFBSSxDQUFFTCxPQUFRO1FBRS9CLGlHQUFpRztRQUNqRyxNQUFNTSxLQUFLSixPQUFPQztRQUVsQixvQ0FBb0M7UUFDcEMsTUFBTUksS0FBS0wsT0FBT0M7UUFFbEIsSUFBS0ksS0FBS2xCLFNBQVU7WUFDbEIsd0RBQXdEO1lBQ3hELE9BQU87UUFDVDtRQUVBLE1BQU1tQixlQUFlcEIsSUFBSXFC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