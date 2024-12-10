// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ThermometerNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { Node } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import ThermometerNode from '../../ThermometerNode.js';
export default function demoThermometerNode(layoutBounds) {
    const temperatureProperty = new Property(50);
    const thermometer = new ThermometerNode(temperatureProperty, 0, 100, {
        scale: 1.5
    });
    const temperatureSlider = new HSlider(temperatureProperty, new Range(0, 100), {
        trackSize: new Dimension2(200, 5),
        thumbSize: new Dimension2(25, 50),
        thumbFillHighlighted: 'red',
        thumbFill: 'rgb(158,35,32)'
    });
    temperatureSlider.rotation = -Math.PI / 2;
    temperatureSlider.right = thermometer.left - 50;
    temperatureSlider.centerY = thermometer.centerY;
    return new Node({
        children: [
            thermometer,
            temperatureSlider
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1RoZXJtb21ldGVyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBUaGVybW9tZXRlck5vZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XG5pbXBvcnQgVGhlcm1vbWV0ZXJOb2RlIGZyb20gJy4uLy4uL1RoZXJtb21ldGVyTm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9UaGVybW9tZXRlck5vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCB0ZW1wZXJhdHVyZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCA1MCApO1xuXG4gIGNvbnN0IHRoZXJtb21ldGVyID0gbmV3IFRoZXJtb21ldGVyTm9kZSggdGVtcGVyYXR1cmVQcm9wZXJ0eSwgMCwgMTAwLCB7XG4gICAgc2NhbGU6IDEuNVxuICB9ICk7XG5cbiAgY29uc3QgdGVtcGVyYXR1cmVTbGlkZXIgPSBuZXcgSFNsaWRlciggdGVtcGVyYXR1cmVQcm9wZXJ0eSwgbmV3IFJhbmdlKCAwLCAxMDAgKSwge1xuICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDIwMCwgNSApLFxuICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDI1LCA1MCApLFxuICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAncmVkJyxcbiAgICB0aHVtYkZpbGw6ICdyZ2IoMTU4LDM1LDMyKSdcbiAgfSApO1xuICB0ZW1wZXJhdHVyZVNsaWRlci5yb3RhdGlvbiA9IC1NYXRoLlBJIC8gMjtcbiAgdGVtcGVyYXR1cmVTbGlkZXIucmlnaHQgPSB0aGVybW9tZXRlci5sZWZ0IC0gNTA7XG4gIHRlbXBlcmF0dXJlU2xpZGVyLmNlbnRlclkgPSB0aGVybW9tZXRlci5jZW50ZXJZO1xuXG4gIHJldHVybiBuZXcgTm9kZSgge1xuICAgIGNoaWxkcmVuOiBbIHRoZXJtb21ldGVyLCB0ZW1wZXJhdHVyZVNsaWRlciBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiTm9kZSIsIkhTbGlkZXIiLCJUaGVybW9tZXRlck5vZGUiLCJkZW1vVGhlcm1vbWV0ZXJOb2RlIiwibGF5b3V0Qm91bmRzIiwidGVtcGVyYXR1cmVQcm9wZXJ0eSIsInRoZXJtb21ldGVyIiwic2NhbGUiLCJ0ZW1wZXJhdHVyZVNsaWRlciIsInRyYWNrU2l6ZSIsInRodW1iU2l6ZSIsInRodW1iRmlsbEhpZ2hsaWdodGVkIiwidGh1bWJGaWxsIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJyaWdodCIsImxlZnQiLCJjZW50ZXJZIiwiY2hpbGRyZW4iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFFdkQsT0FBT0MsZ0JBQWdCLG1DQUFtQztBQUMxRCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFTQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3pELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLHFCQUFxQiwyQkFBMkI7QUFFdkQsZUFBZSxTQUFTQyxvQkFBcUJDLFlBQXFCO0lBRWhFLE1BQU1DLHNCQUFzQixJQUFJUixTQUFVO0lBRTFDLE1BQU1TLGNBQWMsSUFBSUosZ0JBQWlCRyxxQkFBcUIsR0FBRyxLQUFLO1FBQ3BFRSxPQUFPO0lBQ1Q7SUFFQSxNQUFNQyxvQkFBb0IsSUFBSVAsUUFBU0kscUJBQXFCLElBQUlOLE1BQU8sR0FBRyxNQUFPO1FBQy9FVSxXQUFXLElBQUlYLFdBQVksS0FBSztRQUNoQ1ksV0FBVyxJQUFJWixXQUFZLElBQUk7UUFDL0JhLHNCQUFzQjtRQUN0QkMsV0FBVztJQUNiO0lBQ0FKLGtCQUFrQkssUUFBUSxHQUFHLENBQUNDLEtBQUtDLEVBQUUsR0FBRztJQUN4Q1Asa0JBQWtCUSxLQUFLLEdBQUdWLFlBQVlXLElBQUksR0FBRztJQUM3Q1Qsa0JBQWtCVSxPQUFPLEdBQUdaLFlBQVlZLE9BQU87SUFFL0MsT0FBTyxJQUFJbEIsS0FBTTtRQUNmbUIsVUFBVTtZQUFFYjtZQUFhRTtTQUFtQjtRQUM1Q1ksUUFBUWhCLGFBQWFnQixNQUFNO0lBQzdCO0FBQ0YifQ==