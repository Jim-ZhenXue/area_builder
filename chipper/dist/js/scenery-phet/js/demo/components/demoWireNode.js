// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for WireNode - two circles connected by a wire.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Circle, DragListener, Node } from '../../../../scenery/js/imports.js';
import WireNode from '../../WireNode.js';
export default function demoWireNode(layoutBounds) {
    const greenCircle = new Circle(20, {
        fill: 'green',
        cursor: 'pointer'
    });
    greenCircle.addInputListener(new DragListener({
        translateNode: true
    }));
    const redCircle = new Circle(20, {
        fill: 'red',
        cursor: 'pointer',
        center: greenCircle.center.plusXY(200, 200)
    });
    redCircle.addInputListener(new DragListener({
        translateNode: true
    }));
    // Distance the wires stick out from the objects
    const NORMAL_DISTANCE = 100;
    // Add the wire behind the probe.
    const wireNode = new WireNode(// Connect to the greenCircle at the center bottom
    new DerivedProperty([
        greenCircle.boundsProperty
    ], (bounds)=>bounds.centerBottom), new Vector2Property(new Vector2(0, NORMAL_DISTANCE)), // Connect to node2 at the left center
    new DerivedProperty([
        redCircle.boundsProperty
    ], (bounds)=>bounds.leftCenter), new Vector2Property(new Vector2(-NORMAL_DISTANCE, 0)), {
        lineWidth: 3
    });
    return new Node({
        children: [
            greenCircle,
            redCircle,
            wireNode
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1dpcmVOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIFdpcmVOb2RlIC0gdHdvIGNpcmNsZXMgY29ubmVjdGVkIGJ5IGEgd2lyZS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBXaXJlTm9kZSBmcm9tICcuLi8uLi9XaXJlTm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9XaXJlTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IGdyZWVuQ2lyY2xlID0gbmV3IENpcmNsZSggMjAsIHtcbiAgICBmaWxsOiAnZ3JlZW4nLFxuICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gIH0gKTtcbiAgZ3JlZW5DaXJjbGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lciggeyB0cmFuc2xhdGVOb2RlOiB0cnVlIH0gKSApO1xuXG4gIGNvbnN0IHJlZENpcmNsZSA9IG5ldyBDaXJjbGUoIDIwLCB7XG4gICAgZmlsbDogJ3JlZCcsXG4gICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgY2VudGVyOiBncmVlbkNpcmNsZS5jZW50ZXIucGx1c1hZKCAyMDAsIDIwMCApXG4gIH0gKTtcbiAgcmVkQ2lyY2xlLmFkZElucHV0TGlzdGVuZXIoIG5ldyBEcmFnTGlzdGVuZXIoIHsgdHJhbnNsYXRlTm9kZTogdHJ1ZSB9ICkgKTtcblxuICAvLyBEaXN0YW5jZSB0aGUgd2lyZXMgc3RpY2sgb3V0IGZyb20gdGhlIG9iamVjdHNcbiAgY29uc3QgTk9STUFMX0RJU1RBTkNFID0gMTAwO1xuXG4gIC8vIEFkZCB0aGUgd2lyZSBiZWhpbmQgdGhlIHByb2JlLlxuICBjb25zdCB3aXJlTm9kZSA9IG5ldyBXaXJlTm9kZShcbiAgICAvLyBDb25uZWN0IHRvIHRoZSBncmVlbkNpcmNsZSBhdCB0aGUgY2VudGVyIGJvdHRvbVxuICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgZ3JlZW5DaXJjbGUuYm91bmRzUHJvcGVydHkgXSwgYm91bmRzID0+IGJvdW5kcy5jZW50ZXJCb3R0b20gKSxcbiAgICBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgTk9STUFMX0RJU1RBTkNFICkgKSxcblxuICAgIC8vIENvbm5lY3QgdG8gbm9kZTIgYXQgdGhlIGxlZnQgY2VudGVyXG4gICAgbmV3IERlcml2ZWRQcm9wZXJ0eSggWyByZWRDaXJjbGUuYm91bmRzUHJvcGVydHkgXSwgYm91bmRzID0+IGJvdW5kcy5sZWZ0Q2VudGVyICksXG4gICAgbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIC1OT1JNQUxfRElTVEFOQ0UsIDAgKSApLCB7XG4gICAgICBsaW5lV2lkdGg6IDNcbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIG5ldyBOb2RlKCB7XG4gICAgY2hpbGRyZW46IFsgZ3JlZW5DaXJjbGUsIHJlZENpcmNsZSwgd2lyZU5vZGUgXSwgLy8gd2lyZU5vZGUgb24gdG9wLCBzbyB3ZSBjYW4gc2VlIGl0IGZ1bGx5XG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIkNpcmNsZSIsIkRyYWdMaXN0ZW5lciIsIk5vZGUiLCJXaXJlTm9kZSIsImRlbW9XaXJlTm9kZSIsImxheW91dEJvdW5kcyIsImdyZWVuQ2lyY2xlIiwiZmlsbCIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJ0cmFuc2xhdGVOb2RlIiwicmVkQ2lyY2xlIiwiY2VudGVyIiwicGx1c1hZIiwiTk9STUFMX0RJU1RBTkNFIiwid2lyZU5vZGUiLCJib3VuZHNQcm9wZXJ0eSIsImJvdW5kcyIsImNlbnRlckJvdHRvbSIsImxlZnRDZW50ZXIiLCJsaW5lV2lkdGgiLCJjaGlsZHJlbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIseUNBQXlDO0FBRXJFLE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLHFCQUFxQix3Q0FBd0M7QUFDcEUsU0FBU0MsTUFBTSxFQUFFQyxZQUFZLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDL0UsT0FBT0MsY0FBYyxvQkFBb0I7QUFFekMsZUFBZSxTQUFTQyxhQUFjQyxZQUFxQjtJQUV6RCxNQUFNQyxjQUFjLElBQUlOLE9BQVEsSUFBSTtRQUNsQ08sTUFBTTtRQUNOQyxRQUFRO0lBQ1Y7SUFDQUYsWUFBWUcsZ0JBQWdCLENBQUUsSUFBSVIsYUFBYztRQUFFUyxlQUFlO0lBQUs7SUFFdEUsTUFBTUMsWUFBWSxJQUFJWCxPQUFRLElBQUk7UUFDaENPLE1BQU07UUFDTkMsUUFBUTtRQUNSSSxRQUFRTixZQUFZTSxNQUFNLENBQUNDLE1BQU0sQ0FBRSxLQUFLO0lBQzFDO0lBQ0FGLFVBQVVGLGdCQUFnQixDQUFFLElBQUlSLGFBQWM7UUFBRVMsZUFBZTtJQUFLO0lBRXBFLGdEQUFnRDtJQUNoRCxNQUFNSSxrQkFBa0I7SUFFeEIsaUNBQWlDO0lBQ2pDLE1BQU1DLFdBQVcsSUFBSVosU0FDbkIsa0RBQWtEO0lBQ2xELElBQUlOLGdCQUFpQjtRQUFFUyxZQUFZVSxjQUFjO0tBQUUsRUFBRUMsQ0FBQUEsU0FBVUEsT0FBT0MsWUFBWSxHQUNsRixJQUFJbkIsZ0JBQWlCLElBQUlELFFBQVMsR0FBR2dCLG1CQUVyQyxzQ0FBc0M7SUFDdEMsSUFBSWpCLGdCQUFpQjtRQUFFYyxVQUFVSyxjQUFjO0tBQUUsRUFBRUMsQ0FBQUEsU0FBVUEsT0FBT0UsVUFBVSxHQUM5RSxJQUFJcEIsZ0JBQWlCLElBQUlELFFBQVMsQ0FBQ2dCLGlCQUFpQixLQUFPO1FBQ3pETSxXQUFXO0lBQ2I7SUFHRixPQUFPLElBQUlsQixLQUFNO1FBQ2ZtQixVQUFVO1lBQUVmO1lBQWFLO1lBQVdJO1NBQVU7UUFDOUNILFFBQVFQLGFBQWFPLE1BQU07SUFDN0I7QUFDRiJ9