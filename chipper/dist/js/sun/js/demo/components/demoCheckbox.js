// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for Checkbox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../Checkbox.js';
export default function demoCheckbox(layoutBounds) {
    const property = new BooleanProperty(true);
    const enabledProperty = new BooleanProperty(true, {
        phetioFeatured: true
    });
    const checkbox = new Checkbox(property, new Text('My Awesome Checkbox', {
        font: new Font({
            size: 30
        })
    }), {
        enabledProperty: enabledProperty
    });
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: new Font({
            size: 20
        })
    }));
    return new VBox({
        children: [
            checkbox,
            enabledCheckbox
        ],
        spacing: 30,
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0NoZWNrYm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIENoZWNrYm94XG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uL0NoZWNrYm94LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0NoZWNrYm94KCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSApO1xuXG4gIGNvbnN0IGNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBwcm9wZXJ0eSwgbmV3IFRleHQoICdNeSBBd2Vzb21lIENoZWNrYm94Jywge1xuICAgIGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDMwIH0gKVxuICB9ICksIHtcbiAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnZW5hYmxlZCcsIHtcbiAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAyMCB9IClcbiAgfSApICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgY2hpbGRyZW46IFsgY2hlY2tib3gsIGVuYWJsZWRDaGVja2JveCBdLFxuICAgIHNwYWNpbmc6IDMwLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkZvbnQiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiZGVtb0NoZWNrYm94IiwibGF5b3V0Qm91bmRzIiwicHJvcGVydHkiLCJlbmFibGVkUHJvcGVydHkiLCJwaGV0aW9GZWF0dXJlZCIsImNoZWNrYm94IiwiZm9udCIsInNpemUiLCJlbmFibGVkQ2hlY2tib3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EscUJBQXFCLHlDQUF5QztBQUVyRSxTQUFTQyxJQUFJLEVBQVFDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMzRSxPQUFPQyxjQUFjLG9CQUFvQjtBQUV6QyxlQUFlLFNBQVNDLGFBQWNDLFlBQXFCO0lBRXpELE1BQU1DLFdBQVcsSUFBSVAsZ0JBQWlCO0lBQ3RDLE1BQU1RLGtCQUFrQixJQUFJUixnQkFBaUIsTUFBTTtRQUFFUyxnQkFBZ0I7SUFBSztJQUUxRSxNQUFNQyxXQUFXLElBQUlOLFNBQVVHLFVBQVUsSUFBSUwsS0FBTSx1QkFBdUI7UUFDeEVTLE1BQU0sSUFBSVYsS0FBTTtZQUFFVyxNQUFNO1FBQUc7SUFDN0IsSUFBSztRQUNISixpQkFBaUJBO0lBQ25CO0lBRUEsTUFBTUssa0JBQWtCLElBQUlULFNBQVVJLGlCQUFpQixJQUFJTixLQUFNLFdBQVc7UUFDMUVTLE1BQU0sSUFBSVYsS0FBTTtZQUFFVyxNQUFNO1FBQUc7SUFDN0I7SUFFQSxPQUFPLElBQUlULEtBQU07UUFDZlcsVUFBVTtZQUFFSjtZQUFVRztTQUFpQjtRQUN2Q0UsU0FBUztRQUNUQyxRQUFRVixhQUFhVSxNQUFNO0lBQzdCO0FBQ0YifQ==