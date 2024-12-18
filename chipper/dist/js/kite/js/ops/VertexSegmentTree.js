// Copyright 2022-2024, University of Colorado Boulder
/**
 * A SegmentTree for Vertices. See SegmentTree for more details
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { kite, SegmentTree } from '../imports.js';
let VertexSegmentTree = class VertexSegmentTree extends SegmentTree {
    getMinX(vertex, epsilon) {
        return vertex.point.x - epsilon;
    }
    getMaxX(vertex, epsilon) {
        return vertex.point.x + epsilon;
    }
};
export { VertexSegmentTree as default };
kite.register('VertexSegmentTree', VertexSegmentTree);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL1ZlcnRleFNlZ21lbnRUcmVlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgU2VnbWVudFRyZWUgZm9yIFZlcnRpY2VzLiBTZWUgU2VnbWVudFRyZWUgZm9yIG1vcmUgZGV0YWlsc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBraXRlLCBTZWdtZW50VHJlZSwgVmVydGV4IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlcnRleFNlZ21lbnRUcmVlIGV4dGVuZHMgU2VnbWVudFRyZWU8VmVydGV4PiB7XG4gIHB1YmxpYyBnZXRNaW5YKCB2ZXJ0ZXg6IFZlcnRleCwgZXBzaWxvbjogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHZlcnRleC5wb2ludCEueCAtIGVwc2lsb247XG4gIH1cblxuICBwdWJsaWMgZ2V0TWF4WCggdmVydGV4OiBWZXJ0ZXgsIGVwc2lsb246IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB2ZXJ0ZXgucG9pbnQhLnggKyBlcHNpbG9uO1xuICB9XG59XG5cbmtpdGUucmVnaXN0ZXIoICdWZXJ0ZXhTZWdtZW50VHJlZScsIFZlcnRleFNlZ21lbnRUcmVlICk7Il0sIm5hbWVzIjpbImtpdGUiLCJTZWdtZW50VHJlZSIsIlZlcnRleFNlZ21lbnRUcmVlIiwiZ2V0TWluWCIsInZlcnRleCIsImVwc2lsb24iLCJwb2ludCIsIngiLCJnZXRNYXhYIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsSUFBSSxFQUFFQyxXQUFXLFFBQWdCLGdCQUFnQjtBQUUzQyxJQUFBLEFBQU1DLG9CQUFOLE1BQU1BLDBCQUEwQkQ7SUFDdENFLFFBQVNDLE1BQWMsRUFBRUMsT0FBZSxFQUFXO1FBQ3hELE9BQU9ELE9BQU9FLEtBQUssQ0FBRUMsQ0FBQyxHQUFHRjtJQUMzQjtJQUVPRyxRQUFTSixNQUFjLEVBQUVDLE9BQWUsRUFBVztRQUN4RCxPQUFPRCxPQUFPRSxLQUFLLENBQUVDLENBQUMsR0FBR0Y7SUFDM0I7QUFDRjtBQVJBLFNBQXFCSCwrQkFRcEI7QUFFREYsS0FBS1MsUUFBUSxDQUFFLHFCQUFxQlAifQ==