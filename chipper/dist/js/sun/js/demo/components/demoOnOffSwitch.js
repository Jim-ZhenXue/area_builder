// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for OnOffSwitch
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import OnOffSwitch from '../../OnOffSwitch.js';
export default function demoOnOffSwitch(layoutBounds) {
    return new OnOffSwitch(new BooleanProperty(true), {
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb09uT2ZmU3dpdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIE9uT2ZmU3dpdGNoXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IE9uT2ZmU3dpdGNoIGZyb20gJy4uLy4uL09uT2ZmU3dpdGNoLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb09uT2ZmU3dpdGNoKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG4gIHJldHVybiBuZXcgT25PZmZTd2l0Y2goIG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKSwge1xuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIk9uT2ZmU3dpdGNoIiwiZGVtb09uT2ZmU3dpdGNoIiwibGF5b3V0Qm91bmRzIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFHckUsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUUvQyxlQUFlLFNBQVNDLGdCQUFpQkMsWUFBcUI7SUFDNUQsT0FBTyxJQUFJRixZQUFhLElBQUlELGdCQUFpQixPQUFRO1FBQ25ESSxRQUFRRCxhQUFhQyxNQUFNO0lBQzdCO0FBQ0YifQ==