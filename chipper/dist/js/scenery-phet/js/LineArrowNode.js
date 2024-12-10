// Copyright 2018-2024, University of Colorado Boulder
/**
 * An arrow that is composed of 3 line segments: one for the tail, and 2 for a V-shaped head
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let LineArrowNode = class LineArrowNode extends Node {
    /**
   * Set the tail and tip positions to update the arrow shape.
   */ setTailAndTip(tailX, tailY, tipX, tipY) {
        this.tailNode.shape = Shape.lineSegment(tailX, tailY, tipX, tipY);
        // Set up a coordinate frame that goes from tail to tip.
        const vector = new Vector2(tipX - tailX, tipY - tailY);
        const xHatUnit = vector.normalized();
        const yHatUnit = xHatUnit.rotated(Math.PI / 2);
        const length = vector.magnitude;
        const getPoint = function(xHat, yHat) {
            const x = xHatUnit.x * xHat + yHatUnit.x * yHat + tailX;
            const y = xHatUnit.y * xHat + yHatUnit.y * yHat + tailY;
            return new Vector2(x, y);
        };
        // limit head height to tail length
        const headHeight = Math.min(this.headHeight, 0.99 * length);
        this.headNode.shape = new Shape().moveToPoint(getPoint(length - headHeight, this.headWidth / 2)).lineToPoint(getPoint(length, 0)).lineToPoint(getPoint(length - headHeight, -this.headWidth / 2));
    }
    constructor(tailX, tailY, tipX, tipY, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            stroke: 'black',
            lineJoin: 'miter',
            lineCap: 'butt',
            headHeight: 10,
            headWidth: 10,
            headLineWidth: 1,
            tailLineWidth: 1,
            tailLineDash: []
        }, providedOptions);
        super();
        this.headWidth = options.headWidth;
        this.headHeight = options.headHeight;
        this.tailNode = new Path(null, {
            stroke: options.stroke,
            lineJoin: options.lineJoin,
            lineCap: options.lineCap,
            lineWidth: options.tailLineWidth,
            lineDash: options.tailLineDash
        });
        this.headNode = new Path(null, {
            stroke: options.stroke,
            lineJoin: options.lineJoin,
            lineCap: options.lineCap,
            lineWidth: options.headLineWidth
        });
        this.setTailAndTip(tailX, tailY, tipX, tipY);
        options.children = [
            this.tailNode,
            this.headNode
        ];
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'LineArrowNode', this);
    }
};
export { LineArrowNode as default };
sceneryPhet.register('LineArrowNode', LineArrowNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MaW5lQXJyb3dOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGFycm93IHRoYXQgaXMgY29tcG9zZWQgb2YgMyBsaW5lIHNlZ21lbnRzOiBvbmUgZm9yIHRoZSB0YWlsLCBhbmQgMiBmb3IgYSBWLXNoYXBlZCBoZWFkXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBMaW5lQ2FwLCBMaW5lSm9pbiwgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFRDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gaGVhZCAmIHRhaWxcbiAgc3Ryb2tlPzogVENvbG9yO1xuICBsaW5lSm9pbj86IExpbmVKb2luOyAvLyBhZmZlY3RzIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBhcnJvdyB0aXBcbiAgbGluZUNhcD86IExpbmVDYXA7IC8vIGFmZmVjdHMgYXBwZWFycyBvZiB0aGUgYXJyb3cgdGFpbCwgYW5kIG91dHNpZGUgZW5kcyBvZiB0aGUgaGVhZFxuXG4gIC8vIGhlYWRcbiAgaGVhZEhlaWdodD86IG51bWJlcjtcbiAgaGVhZFdpZHRoPzogbnVtYmVyO1xuICBoZWFkTGluZVdpZHRoPzogbnVtYmVyO1xuXG4gIC8vIHRhaWxcbiAgdGFpbExpbmVXaWR0aD86IG51bWJlcjtcbiAgdGFpbExpbmVEYXNoPzogbnVtYmVyW107XG59O1xuXG5leHBvcnQgdHlwZSBMaW5lQXJyb3dOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpbmVBcnJvd05vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGhlYWRXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGhlYWRIZWlnaHQ6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSB0YWlsTm9kZTogUGF0aDtcbiAgcHJpdmF0ZSByZWFkb25seSBoZWFkTm9kZTogUGF0aDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhaWxYOiBudW1iZXIsIHRhaWxZOiBudW1iZXIsIHRpcFg6IG51bWJlciwgdGlwWTogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBMaW5lQXJyb3dOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGluZUFycm93Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZUpvaW46ICdtaXRlcicsXG4gICAgICBsaW5lQ2FwOiAnYnV0dCcsXG4gICAgICBoZWFkSGVpZ2h0OiAxMCxcbiAgICAgIGhlYWRXaWR0aDogMTAsXG4gICAgICBoZWFkTGluZVdpZHRoOiAxLFxuICAgICAgdGFpbExpbmVXaWR0aDogMSxcbiAgICAgIHRhaWxMaW5lRGFzaDogW11cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmhlYWRXaWR0aCA9IG9wdGlvbnMuaGVhZFdpZHRoO1xuICAgIHRoaXMuaGVhZEhlaWdodCA9IG9wdGlvbnMuaGVhZEhlaWdodDtcblxuICAgIHRoaXMudGFpbE5vZGUgPSBuZXcgUGF0aCggbnVsbCwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLnN0cm9rZSxcbiAgICAgIGxpbmVKb2luOiBvcHRpb25zLmxpbmVKb2luLFxuICAgICAgbGluZUNhcDogb3B0aW9ucy5saW5lQ2FwLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnRhaWxMaW5lV2lkdGgsXG4gICAgICBsaW5lRGFzaDogb3B0aW9ucy50YWlsTGluZURhc2hcbiAgICB9ICk7XG5cbiAgICB0aGlzLmhlYWROb2RlID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICBsaW5lSm9pbjogb3B0aW9ucy5saW5lSm9pbixcbiAgICAgIGxpbmVDYXA6IG9wdGlvbnMubGluZUNhcCxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5oZWFkTGluZVdpZHRoXG4gICAgfSApO1xuXG4gICAgdGhpcy5zZXRUYWlsQW5kVGlwKCB0YWlsWCwgdGFpbFksIHRpcFgsIHRpcFkgKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRoaXMudGFpbE5vZGUsIHRoaXMuaGVhZE5vZGUgXTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0xpbmVBcnJvd05vZGUnLCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB0YWlsIGFuZCB0aXAgcG9zaXRpb25zIHRvIHVwZGF0ZSB0aGUgYXJyb3cgc2hhcGUuXG4gICAqL1xuICBwdWJsaWMgc2V0VGFpbEFuZFRpcCggdGFpbFg6IG51bWJlciwgdGFpbFk6IG51bWJlciwgdGlwWDogbnVtYmVyLCB0aXBZOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICB0aGlzLnRhaWxOb2RlLnNoYXBlID0gU2hhcGUubGluZVNlZ21lbnQoIHRhaWxYLCB0YWlsWSwgdGlwWCwgdGlwWSApO1xuXG4gICAgLy8gU2V0IHVwIGEgY29vcmRpbmF0ZSBmcmFtZSB0aGF0IGdvZXMgZnJvbSB0YWlsIHRvIHRpcC5cbiAgICBjb25zdCB2ZWN0b3IgPSBuZXcgVmVjdG9yMiggdGlwWCAtIHRhaWxYLCB0aXBZIC0gdGFpbFkgKTtcbiAgICBjb25zdCB4SGF0VW5pdCA9IHZlY3Rvci5ub3JtYWxpemVkKCk7XG4gICAgY29uc3QgeUhhdFVuaXQgPSB4SGF0VW5pdC5yb3RhdGVkKCBNYXRoLlBJIC8gMiApO1xuICAgIGNvbnN0IGxlbmd0aCA9IHZlY3Rvci5tYWduaXR1ZGU7XG4gICAgY29uc3QgZ2V0UG9pbnQgPSBmdW5jdGlvbiggeEhhdDogbnVtYmVyLCB5SGF0OiBudW1iZXIgKSB7XG4gICAgICBjb25zdCB4ID0geEhhdFVuaXQueCAqIHhIYXQgKyB5SGF0VW5pdC54ICogeUhhdCArIHRhaWxYO1xuICAgICAgY29uc3QgeSA9IHhIYXRVbml0LnkgKiB4SGF0ICsgeUhhdFVuaXQueSAqIHlIYXQgKyB0YWlsWTtcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xuICAgIH07XG5cbiAgICAvLyBsaW1pdCBoZWFkIGhlaWdodCB0byB0YWlsIGxlbmd0aFxuICAgIGNvbnN0IGhlYWRIZWlnaHQgPSBNYXRoLm1pbiggdGhpcy5oZWFkSGVpZ2h0LCAwLjk5ICogbGVuZ3RoICk7XG5cbiAgICB0aGlzLmhlYWROb2RlLnNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgIC5tb3ZlVG9Qb2ludCggZ2V0UG9pbnQoIGxlbmd0aCAtIGhlYWRIZWlnaHQsIHRoaXMuaGVhZFdpZHRoIC8gMiApIClcbiAgICAgIC5saW5lVG9Qb2ludCggZ2V0UG9pbnQoIGxlbmd0aCwgMCApIClcbiAgICAgIC5saW5lVG9Qb2ludCggZ2V0UG9pbnQoIGxlbmd0aCAtIGhlYWRIZWlnaHQsIC10aGlzLmhlYWRXaWR0aCAvIDIgKSApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTGluZUFycm93Tm9kZScsIExpbmVBcnJvd05vZGUgKTsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsIk5vZGUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJMaW5lQXJyb3dOb2RlIiwic2V0VGFpbEFuZFRpcCIsInRhaWxYIiwidGFpbFkiLCJ0aXBYIiwidGlwWSIsInRhaWxOb2RlIiwic2hhcGUiLCJsaW5lU2VnbWVudCIsInZlY3RvciIsInhIYXRVbml0Iiwibm9ybWFsaXplZCIsInlIYXRVbml0Iiwicm90YXRlZCIsIk1hdGgiLCJQSSIsImxlbmd0aCIsIm1hZ25pdHVkZSIsImdldFBvaW50IiwieEhhdCIsInlIYXQiLCJ4IiwieSIsImhlYWRIZWlnaHQiLCJtaW4iLCJoZWFkTm9kZSIsIm1vdmVUb1BvaW50IiwiaGVhZFdpZHRoIiwibGluZVRvUG9pbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJ3aW5kb3ciLCJvcHRpb25zIiwic3Ryb2tlIiwibGluZUpvaW4iLCJsaW5lQ2FwIiwiaGVhZExpbmVXaWR0aCIsInRhaWxMaW5lV2lkdGgiLCJ0YWlsTGluZURhc2giLCJsaW5lV2lkdGgiLCJsaW5lRGFzaCIsImNoaWxkcmVuIiwibXV0YXRlIiwiYXNzZXJ0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDBCQUEwQjtBQUM5QyxTQUE0QkMsS0FBSyxRQUFRLDJCQUEyQjtBQUNwRSxPQUFPQyxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQWUsa0NBQWtDO0FBRXhELFNBQVNDLElBQUksRUFBZUMsSUFBSSxRQUFnQiw4QkFBOEI7QUFDOUUsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQXFCNUIsSUFBQSxBQUFNQyxnQkFBTixNQUFNQSxzQkFBc0JIO0lBa0R6Qzs7R0FFQyxHQUNELEFBQU9JLGNBQWVDLEtBQWEsRUFBRUMsS0FBYSxFQUFFQyxJQUFZLEVBQUVDLElBQVksRUFBUztRQUVyRixJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsS0FBSyxHQUFHYixNQUFNYyxXQUFXLENBQUVOLE9BQU9DLE9BQU9DLE1BQU1DO1FBRTdELHdEQUF3RDtRQUN4RCxNQUFNSSxTQUFTLElBQUloQixRQUFTVyxPQUFPRixPQUFPRyxPQUFPRjtRQUNqRCxNQUFNTyxXQUFXRCxPQUFPRSxVQUFVO1FBQ2xDLE1BQU1DLFdBQVdGLFNBQVNHLE9BQU8sQ0FBRUMsS0FBS0MsRUFBRSxHQUFHO1FBQzdDLE1BQU1DLFNBQVNQLE9BQU9RLFNBQVM7UUFDL0IsTUFBTUMsV0FBVyxTQUFVQyxJQUFZLEVBQUVDLElBQVk7WUFDbkQsTUFBTUMsSUFBSVgsU0FBU1csQ0FBQyxHQUFHRixPQUFPUCxTQUFTUyxDQUFDLEdBQUdELE9BQU9sQjtZQUNsRCxNQUFNb0IsSUFBSVosU0FBU1ksQ0FBQyxHQUFHSCxPQUFPUCxTQUFTVSxDQUFDLEdBQUdGLE9BQU9qQjtZQUNsRCxPQUFPLElBQUlWLFFBQVM0QixHQUFHQztRQUN6QjtRQUVBLG1DQUFtQztRQUNuQyxNQUFNQyxhQUFhVCxLQUFLVSxHQUFHLENBQUUsSUFBSSxDQUFDRCxVQUFVLEVBQUUsT0FBT1A7UUFFckQsSUFBSSxDQUFDUyxRQUFRLENBQUNsQixLQUFLLEdBQUcsSUFBSWIsUUFDdkJnQyxXQUFXLENBQUVSLFNBQVVGLFNBQVNPLFlBQVksSUFBSSxDQUFDSSxTQUFTLEdBQUcsSUFDN0RDLFdBQVcsQ0FBRVYsU0FBVUYsUUFBUSxJQUMvQlksV0FBVyxDQUFFVixTQUFVRixTQUFTTyxZQUFZLENBQUMsSUFBSSxDQUFDSSxTQUFTLEdBQUc7SUFDbkU7SUFwRUEsWUFBb0J6QixLQUFhLEVBQUVDLEtBQWEsRUFBRUMsSUFBWSxFQUFFQyxJQUFZLEVBQUV3QixlQUFzQyxDQUFHO1lBd0MzR0Msc0NBQUFBLHNCQUFBQTtRQXRDVixNQUFNQyxVQUFVbkMsWUFBNkQ7WUFDM0VvQyxRQUFRO1lBQ1JDLFVBQVU7WUFDVkMsU0FBUztZQUNUWCxZQUFZO1lBQ1pJLFdBQVc7WUFDWFEsZUFBZTtZQUNmQyxlQUFlO1lBQ2ZDLGNBQWMsRUFBRTtRQUNsQixHQUFHUjtRQUVILEtBQUs7UUFFTCxJQUFJLENBQUNGLFNBQVMsR0FBR0ksUUFBUUosU0FBUztRQUNsQyxJQUFJLENBQUNKLFVBQVUsR0FBR1EsUUFBUVIsVUFBVTtRQUVwQyxJQUFJLENBQUNqQixRQUFRLEdBQUcsSUFBSVIsS0FBTSxNQUFNO1lBQzlCa0MsUUFBUUQsUUFBUUMsTUFBTTtZQUN0QkMsVUFBVUYsUUFBUUUsUUFBUTtZQUMxQkMsU0FBU0gsUUFBUUcsT0FBTztZQUN4QkksV0FBV1AsUUFBUUssYUFBYTtZQUNoQ0csVUFBVVIsUUFBUU0sWUFBWTtRQUNoQztRQUVBLElBQUksQ0FBQ1osUUFBUSxHQUFHLElBQUkzQixLQUFNLE1BQU07WUFDOUJrQyxRQUFRRCxRQUFRQyxNQUFNO1lBQ3RCQyxVQUFVRixRQUFRRSxRQUFRO1lBQzFCQyxTQUFTSCxRQUFRRyxPQUFPO1lBQ3hCSSxXQUFXUCxRQUFRSSxhQUFhO1FBQ2xDO1FBRUEsSUFBSSxDQUFDbEMsYUFBYSxDQUFFQyxPQUFPQyxPQUFPQyxNQUFNQztRQUV4QzBCLFFBQVFTLFFBQVEsR0FBRztZQUFFLElBQUksQ0FBQ2xDLFFBQVE7WUFBRSxJQUFJLENBQUNtQixRQUFRO1NBQUU7UUFFbkQsSUFBSSxDQUFDZ0IsTUFBTSxDQUFFVjtRQUViLG1HQUFtRztRQUNuR1csWUFBVVosZUFBQUEsT0FBT2EsSUFBSSxzQkFBWGIsdUJBQUFBLGFBQWFjLE9BQU8sc0JBQXBCZCx1Q0FBQUEscUJBQXNCZSxlQUFlLHFCQUFyQ2YscUNBQXVDZ0IsTUFBTSxLQUFJbkQsaUJBQWlCb0QsZUFBZSxDQUFFLGdCQUFnQixpQkFBaUIsSUFBSTtJQUNwSTtBQTRCRjtBQTVFQSxTQUFxQi9DLDJCQTRFcEI7QUFFREQsWUFBWWlELFFBQVEsQ0FBRSxpQkFBaUJoRCJ9