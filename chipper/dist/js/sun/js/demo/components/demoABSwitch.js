// Copyright 2022, University of Colorado Boulder
/**
 * Demo for ABSwitch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import StringProperty from '../../../../axon/js/StringProperty.js';
import { Font, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ABSwitch from '../../ABSwitch.js';
export default function demoABSwitch(layoutBounds) {
    const property = new StringProperty('A');
    const labelOptions = {
        font: new Font({
            size: 24
        })
    };
    const labelA = new Text('A', labelOptions);
    const labelB = new Text('B', labelOptions);
    return new ABSwitch(property, 'A', labelA, 'B', labelB, {
        center: layoutBounds.center,
        tandem: Tandem.OPT_OUT
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0FCU3dpdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBBQlN3aXRjaC5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBBQlN3aXRjaCBmcm9tICcuLi8uLi9BQlN3aXRjaC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9BQlN3aXRjaCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnQScgKTtcblxuICBjb25zdCBsYWJlbE9wdGlvbnMgPSB7IGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDI0IH0gKSB9O1xuICBjb25zdCBsYWJlbEEgPSBuZXcgVGV4dCggJ0EnLCBsYWJlbE9wdGlvbnMgKTtcbiAgY29uc3QgbGFiZWxCID0gbmV3IFRleHQoICdCJywgbGFiZWxPcHRpb25zICk7XG5cbiAgcmV0dXJuIG5ldyBBQlN3aXRjaCggcHJvcGVydHksICdBJywgbGFiZWxBLCAnQicsIGxhYmVsQiwge1xuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlcixcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiU3RyaW5nUHJvcGVydHkiLCJGb250IiwiVGV4dCIsIlRhbmRlbSIsIkFCU3dpdGNoIiwiZGVtb0FCU3dpdGNoIiwibGF5b3V0Qm91bmRzIiwicHJvcGVydHkiLCJsYWJlbE9wdGlvbnMiLCJmb250Iiwic2l6ZSIsImxhYmVsQSIsImxhYmVsQiIsImNlbnRlciIsInRhbmRlbSIsIk9QVF9PVVQiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUVuRSxTQUFTQyxJQUFJLEVBQVFDLElBQUksUUFBUSxvQ0FBb0M7QUFDckUsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsY0FBYyxvQkFBb0I7QUFFekMsZUFBZSxTQUFTQyxhQUFjQyxZQUFxQjtJQUV6RCxNQUFNQyxXQUFXLElBQUlQLGVBQWdCO0lBRXJDLE1BQU1RLGVBQWU7UUFBRUMsTUFBTSxJQUFJUixLQUFNO1lBQUVTLE1BQU07UUFBRztJQUFJO0lBQ3RELE1BQU1DLFNBQVMsSUFBSVQsS0FBTSxLQUFLTTtJQUM5QixNQUFNSSxTQUFTLElBQUlWLEtBQU0sS0FBS007SUFFOUIsT0FBTyxJQUFJSixTQUFVRyxVQUFVLEtBQUtJLFFBQVEsS0FBS0MsUUFBUTtRQUN2REMsUUFBUVAsYUFBYU8sTUFBTTtRQUMzQkMsUUFBUVgsT0FBT1ksT0FBTztJQUN4QjtBQUNGIn0=