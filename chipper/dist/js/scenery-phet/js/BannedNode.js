// Copyright 2019-2024, University of Colorado Boulder
/**
 * BannedNode is the universal "no" symbol, which shows a circle with a line through it, see
 * https://en.wikipedia.org/wiki/No_symbol. It's known by a number of  different emoji names, include "banned", see
 * https://emojipedia.org/no-entry-sign/.  It is also referred to as a prohibition sign.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../phet-core/js/optionize.js';
import { Circle, Line, Node } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let BannedNode = class BannedNode extends Node {
    constructor(providedOptions){
        const options = optionize()({
            radius: 20,
            lineWidth: 5,
            stroke: 'red',
            fill: null
        }, providedOptions);
        const circleNode = new Circle(options.radius, {
            lineWidth: options.lineWidth,
            stroke: options.stroke,
            fill: options.fill
        });
        const slashNode = new Line(0, 0, 2 * options.radius, 0, {
            lineWidth: options.lineWidth,
            stroke: options.stroke,
            rotation: Math.PI / 4,
            center: circleNode.center
        });
        options.children = [
            circleNode,
            slashNode
        ];
        super(options);
    }
};
export { BannedNode as default };
sceneryPhet.register('BannedNode', BannedNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYW5uZWROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhbm5lZE5vZGUgaXMgdGhlIHVuaXZlcnNhbCBcIm5vXCIgc3ltYm9sLCB3aGljaCBzaG93cyBhIGNpcmNsZSB3aXRoIGEgbGluZSB0aHJvdWdoIGl0LCBzZWVcbiAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL05vX3N5bWJvbC4gSXQncyBrbm93biBieSBhIG51bWJlciBvZiAgZGlmZmVyZW50IGVtb2ppIG5hbWVzLCBpbmNsdWRlIFwiYmFubmVkXCIsIHNlZVxuICogaHR0cHM6Ly9lbW9qaXBlZGlhLm9yZy9uby1lbnRyeS1zaWduLy4gIEl0IGlzIGFsc28gcmVmZXJyZWQgdG8gYXMgYSBwcm9oaWJpdGlvbiBzaWduLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIExpbmUsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludGFibGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgcmFkaXVzPzogbnVtYmVyO1xufSAmIFBpY2tPcHRpb25hbDxQYWludGFibGVPcHRpb25zLCAnbGluZVdpZHRoJyB8ICdzdHJva2UnIHwgJ2ZpbGwnPjtcblxuZXhwb3J0IHR5cGUgQmFubmVkTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYW5uZWROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBCYW5uZWROb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QmFubmVkTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgcmFkaXVzOiAyMCxcbiAgICAgIGxpbmVXaWR0aDogNSxcbiAgICAgIHN0cm9rZTogJ3JlZCcsXG4gICAgICBmaWxsOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBjaXJjbGVOb2RlID0gbmV3IENpcmNsZSggb3B0aW9ucy5yYWRpdXMsIHtcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxuICAgICAgZmlsbDogb3B0aW9ucy5maWxsXG4gICAgfSApO1xuXG4gICAgY29uc3Qgc2xhc2hOb2RlID0gbmV3IExpbmUoIDAsIDAsIDIgKiBvcHRpb25zLnJhZGl1cywgMCwge1xuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aCxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICByb3RhdGlvbjogTWF0aC5QSSAvIDQsXG4gICAgICBjZW50ZXI6IGNpcmNsZU5vZGUuY2VudGVyXG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgY2lyY2xlTm9kZSwgc2xhc2hOb2RlIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQmFubmVkTm9kZScsIEJhbm5lZE5vZGUgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiQ2lyY2xlIiwiTGluZSIsIk5vZGUiLCJzY2VuZXJ5UGhldCIsIkJhbm5lZE5vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicmFkaXVzIiwibGluZVdpZHRoIiwic3Ryb2tlIiwiZmlsbCIsImNpcmNsZU5vZGUiLCJzbGFzaE5vZGUiLCJyb3RhdGlvbiIsIk1hdGgiLCJQSSIsImNlbnRlciIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxlQUFlLGtDQUFrQztBQUd4RCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUF1Qyw4QkFBOEI7QUFDaEcsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQVE1QixJQUFBLEFBQU1DLGFBQU4sTUFBTUEsbUJBQW1CRjtJQUV0QyxZQUFvQkcsZUFBbUMsQ0FBRztRQUV4RCxNQUFNQyxVQUFVUCxZQUEwRDtZQUN4RVEsUUFBUTtZQUNSQyxXQUFXO1lBQ1hDLFFBQVE7WUFDUkMsTUFBTTtRQUNSLEdBQUdMO1FBRUgsTUFBTU0sYUFBYSxJQUFJWCxPQUFRTSxRQUFRQyxNQUFNLEVBQUU7WUFDN0NDLFdBQVdGLFFBQVFFLFNBQVM7WUFDNUJDLFFBQVFILFFBQVFHLE1BQU07WUFDdEJDLE1BQU1KLFFBQVFJLElBQUk7UUFDcEI7UUFFQSxNQUFNRSxZQUFZLElBQUlYLEtBQU0sR0FBRyxHQUFHLElBQUlLLFFBQVFDLE1BQU0sRUFBRSxHQUFHO1lBQ3ZEQyxXQUFXRixRQUFRRSxTQUFTO1lBQzVCQyxRQUFRSCxRQUFRRyxNQUFNO1lBQ3RCSSxVQUFVQyxLQUFLQyxFQUFFLEdBQUc7WUFDcEJDLFFBQVFMLFdBQVdLLE1BQU07UUFDM0I7UUFFQVYsUUFBUVcsUUFBUSxHQUFHO1lBQUVOO1lBQVlDO1NBQVc7UUFFNUMsS0FBSyxDQUFFTjtJQUNUO0FBQ0Y7QUE1QkEsU0FBcUJGLHdCQTRCcEI7QUFFREQsWUFBWWUsUUFBUSxDQUFFLGNBQWNkIn0=