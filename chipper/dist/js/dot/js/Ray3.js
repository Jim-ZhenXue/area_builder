// Copyright 2013-2024, University of Colorado Boulder
/**
 * 3-dimensional ray consisting of an origin point and a unit direction vector.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
let Ray3 = class Ray3 {
    /**
   * Returns a new Ray that has it origin shifted to a position given by an amount distance*this.direction.
   */ shifted(distance) {
        return new Ray3(this.pointAtDistance(distance), this.direction);
    }
    /**
   * Returns a position that is a distance 'distance' along the ray.
   */ pointAtDistance(distance) {
        return this.position.plus(this.direction.timesScalar(distance));
    }
    /**
   * Returns the distance of this ray to a plane
   */ distanceToPlane(plane) {
        return (plane.distance - this.position.dot(plane.normal)) / this.direction.dot(plane.normal);
    }
    /**
   * Returns the attributes of this ray into a string
   */ toString() {
        return `${this.position.toString()} => ${this.direction.toString()}`;
    }
    /**
   * Constructs a 3D ray using the supplied origin position and unit length direction vector
   *
   * @param position - the ray's point of origin
   * @param direction - the ray's unit direction vector
   */ constructor(position, direction){
        this.position = position;
        this.direction = direction;
        assert && assert(Math.abs(direction.magnitude - 1) < 0.01, 'the direction must be a unit vector');
    }
};
export { Ray3 as default };
dot.register('Ray3', Ray3);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIDMtZGltZW5zaW9uYWwgcmF5IGNvbnNpc3Rpbmcgb2YgYW4gb3JpZ2luIHBvaW50IGFuZCBhIHVuaXQgZGlyZWN0aW9uIHZlY3Rvci5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XG5pbXBvcnQgUGxhbmUzIGZyb20gJy4vUGxhbmUzLmpzJztcbmltcG9ydCBWZWN0b3IzIGZyb20gJy4vVmVjdG9yMy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJheTMge1xuXG4gIHB1YmxpYyBwb3NpdGlvbjogVmVjdG9yMztcbiAgcHVibGljIGRpcmVjdGlvbjogVmVjdG9yMztcblxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIDNEIHJheSB1c2luZyB0aGUgc3VwcGxpZWQgb3JpZ2luIHBvc2l0aW9uIGFuZCB1bml0IGxlbmd0aCBkaXJlY3Rpb24gdmVjdG9yXG4gICAqXG4gICAqIEBwYXJhbSBwb3NpdGlvbiAtIHRoZSByYXkncyBwb2ludCBvZiBvcmlnaW5cbiAgICogQHBhcmFtIGRpcmVjdGlvbiAtIHRoZSByYXkncyB1bml0IGRpcmVjdGlvbiB2ZWN0b3JcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcG9zaXRpb246IFZlY3RvcjMsIGRpcmVjdGlvbjogVmVjdG9yMyApIHtcblxuICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE1hdGguYWJzKCBkaXJlY3Rpb24ubWFnbml0dWRlIC0gMSApIDwgMC4wMSwgJ3RoZSBkaXJlY3Rpb24gbXVzdCBiZSBhIHVuaXQgdmVjdG9yJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgUmF5IHRoYXQgaGFzIGl0IG9yaWdpbiBzaGlmdGVkIHRvIGEgcG9zaXRpb24gZ2l2ZW4gYnkgYW4gYW1vdW50IGRpc3RhbmNlKnRoaXMuZGlyZWN0aW9uLlxuICAgKi9cbiAgcHVibGljIHNoaWZ0ZWQoIGRpc3RhbmNlOiBudW1iZXIgKTogUmF5MyB7XG4gICAgcmV0dXJuIG5ldyBSYXkzKCB0aGlzLnBvaW50QXREaXN0YW5jZSggZGlzdGFuY2UgKSwgdGhpcy5kaXJlY3Rpb24gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcG9zaXRpb24gdGhhdCBpcyBhIGRpc3RhbmNlICdkaXN0YW5jZScgYWxvbmcgdGhlIHJheS5cbiAgICovXG4gIHB1YmxpYyBwb2ludEF0RGlzdGFuY2UoIGRpc3RhbmNlOiBudW1iZXIgKTogVmVjdG9yMyB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24ucGx1cyggdGhpcy5kaXJlY3Rpb24udGltZXNTY2FsYXIoIGRpc3RhbmNlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaXN0YW5jZSBvZiB0aGlzIHJheSB0byBhIHBsYW5lXG4gICAqL1xuICBwdWJsaWMgZGlzdGFuY2VUb1BsYW5lKCBwbGFuZTogUGxhbmUzICk6IG51bWJlciB7XG4gICAgcmV0dXJuICggcGxhbmUuZGlzdGFuY2UgLSB0aGlzLnBvc2l0aW9uLmRvdCggcGxhbmUubm9ybWFsICkgKSAvIHRoaXMuZGlyZWN0aW9uLmRvdCggcGxhbmUubm9ybWFsICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXR0cmlidXRlcyBvZiB0aGlzIHJheSBpbnRvIGEgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5wb3NpdGlvbi50b1N0cmluZygpfSA9PiAke3RoaXMuZGlyZWN0aW9uLnRvU3RyaW5nKCl9YDtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdSYXkzJywgUmF5MyApOyJdLCJuYW1lcyI6WyJkb3QiLCJSYXkzIiwic2hpZnRlZCIsImRpc3RhbmNlIiwicG9pbnRBdERpc3RhbmNlIiwiZGlyZWN0aW9uIiwicG9zaXRpb24iLCJwbHVzIiwidGltZXNTY2FsYXIiLCJkaXN0YW5jZVRvUGxhbmUiLCJwbGFuZSIsIm5vcm1hbCIsInRvU3RyaW5nIiwiYXNzZXJ0IiwiTWF0aCIsImFicyIsIm1hZ25pdHVkZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUlaLElBQUEsQUFBTUMsT0FBTixNQUFNQTtJQW1CbkI7O0dBRUMsR0FDRCxBQUFPQyxRQUFTQyxRQUFnQixFQUFTO1FBQ3ZDLE9BQU8sSUFBSUYsS0FBTSxJQUFJLENBQUNHLGVBQWUsQ0FBRUQsV0FBWSxJQUFJLENBQUNFLFNBQVM7SUFDbkU7SUFFQTs7R0FFQyxHQUNELEFBQU9ELGdCQUFpQkQsUUFBZ0IsRUFBWTtRQUNsRCxPQUFPLElBQUksQ0FBQ0csUUFBUSxDQUFDQyxJQUFJLENBQUUsSUFBSSxDQUFDRixTQUFTLENBQUNHLFdBQVcsQ0FBRUw7SUFDekQ7SUFFQTs7R0FFQyxHQUNELEFBQU9NLGdCQUFpQkMsS0FBYSxFQUFXO1FBQzlDLE9BQU8sQUFBRUEsQ0FBQUEsTUFBTVAsUUFBUSxHQUFHLElBQUksQ0FBQ0csUUFBUSxDQUFDTixHQUFHLENBQUVVLE1BQU1DLE1BQU0sQ0FBQyxJQUFNLElBQUksQ0FBQ04sU0FBUyxDQUFDTCxHQUFHLENBQUVVLE1BQU1DLE1BQU07SUFDbEc7SUFFQTs7R0FFQyxHQUNELEFBQU9DLFdBQW1CO1FBQ3hCLE9BQU8sR0FBRyxJQUFJLENBQUNOLFFBQVEsQ0FBQ00sUUFBUSxHQUFHLElBQUksRUFBRSxJQUFJLENBQUNQLFNBQVMsQ0FBQ08sUUFBUSxJQUFJO0lBQ3RFO0lBeENBOzs7OztHQUtDLEdBQ0QsWUFBb0JOLFFBQWlCLEVBQUVELFNBQWtCLENBQUc7UUFFMUQsSUFBSSxDQUFDQyxRQUFRLEdBQUdBO1FBQ2hCLElBQUksQ0FBQ0QsU0FBUyxHQUFHQTtRQUVqQlEsVUFBVUEsT0FBUUMsS0FBS0MsR0FBRyxDQUFFVixVQUFVVyxTQUFTLEdBQUcsS0FBTSxNQUFNO0lBQ2hFO0FBNkJGO0FBOUNBLFNBQXFCZixrQkE4Q3BCO0FBRURELElBQUlpQixRQUFRLENBQUUsUUFBUWhCIn0=