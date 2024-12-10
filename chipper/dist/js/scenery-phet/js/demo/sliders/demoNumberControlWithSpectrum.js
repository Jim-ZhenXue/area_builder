// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demos a NumberControl that uses SpectrumSliderTrack and SpectrumSliderThumb.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import NumberControl from '../../NumberControl.js';
import PhetFont from '../../PhetFont.js';
import SpectrumSliderThumb from '../../SpectrumSliderThumb.js';
import SpectrumSliderTrack from '../../SpectrumSliderTrack.js';
import VisibleColor from '../../VisibleColor.js';
export default function demoNumberControlWithSpectrum(layoutBounds) {
    const property = new Property(380);
    const wavelengthToColor = VisibleColor.wavelengthToColor;
    // NumberControl with default layout
    const range = new Range(380, 780);
    return new NumberControl('', property, range, {
        titleNodeOptions: {
            font: new PhetFont(14)
        },
        numberDisplayOptions: {
            textOptions: {
                font: new PhetFont(14)
            },
            valuePattern: '{0} nm'
        },
        sliderOptions: {
            trackNode: new SpectrumSliderTrack(property, range, {
                valueToColor: wavelengthToColor
            }),
            thumbNode: new SpectrumSliderThumb(property, {
                valueToColor: wavelengthToColor
            })
        },
        center: layoutBounds.center,
        layoutFunction: NumberControl.createLayoutFunction3({
            alignTitle: 'left'
        })
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL3NsaWRlcnMvZGVtb051bWJlckNvbnRyb2xXaXRoU3BlY3RydW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb3MgYSBOdW1iZXJDb250cm9sIHRoYXQgdXNlcyBTcGVjdHJ1bVNsaWRlclRyYWNrIGFuZCBTcGVjdHJ1bVNsaWRlclRodW1iLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uL051bWJlckNvbnRyb2wuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL1BoZXRGb250LmpzJztcbmltcG9ydCBTcGVjdHJ1bVNsaWRlclRodW1iIGZyb20gJy4uLy4uL1NwZWN0cnVtU2xpZGVyVGh1bWIuanMnO1xuaW1wb3J0IFNwZWN0cnVtU2xpZGVyVHJhY2sgZnJvbSAnLi4vLi4vU3BlY3RydW1TbGlkZXJUcmFjay5qcyc7XG5pbXBvcnQgVmlzaWJsZUNvbG9yIGZyb20gJy4uLy4uL1Zpc2libGVDb2xvci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9OdW1iZXJDb250cm9sV2l0aFNwZWN0cnVtKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAzODAgKTtcbiAgY29uc3Qgd2F2ZWxlbmd0aFRvQ29sb3IgPSBWaXNpYmxlQ29sb3Iud2F2ZWxlbmd0aFRvQ29sb3I7XG5cbiAgLy8gTnVtYmVyQ29udHJvbCB3aXRoIGRlZmF1bHQgbGF5b3V0XG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKCAzODAsIDc4MCApO1xuICByZXR1cm4gbmV3IE51bWJlckNvbnRyb2woICcnLCBwcm9wZXJ0eSwgcmFuZ2UsIHtcbiAgICB0aXRsZU5vZGVPcHRpb25zOiB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcbiAgICB9LFxuICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICB0ZXh0T3B0aW9uczoge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcbiAgICAgIH0sXG4gICAgICB2YWx1ZVBhdHRlcm46ICd7MH0gbm0nXG4gICAgfSxcbiAgICBzbGlkZXJPcHRpb25zOiB7XG4gICAgICB0cmFja05vZGU6IG5ldyBTcGVjdHJ1bVNsaWRlclRyYWNrKCBwcm9wZXJ0eSwgcmFuZ2UsIHsgdmFsdWVUb0NvbG9yOiB3YXZlbGVuZ3RoVG9Db2xvciB9ICksXG4gICAgICB0aHVtYk5vZGU6IG5ldyBTcGVjdHJ1bVNsaWRlclRodW1iKCBwcm9wZXJ0eSwgeyB2YWx1ZVRvQ29sb3I6IHdhdmVsZW5ndGhUb0NvbG9yIH0gKVxuICAgIH0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uMygge1xuICAgICAgYWxpZ25UaXRsZTogJ2xlZnQnXG4gICAgfSApXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiUHJvcGVydHkiLCJSYW5nZSIsIk51bWJlckNvbnRyb2wiLCJQaGV0Rm9udCIsIlNwZWN0cnVtU2xpZGVyVGh1bWIiLCJTcGVjdHJ1bVNsaWRlclRyYWNrIiwiVmlzaWJsZUNvbG9yIiwiZGVtb051bWJlckNvbnRyb2xXaXRoU3BlY3RydW0iLCJsYXlvdXRCb3VuZHMiLCJwcm9wZXJ0eSIsIndhdmVsZW5ndGhUb0NvbG9yIiwicmFuZ2UiLCJ0aXRsZU5vZGVPcHRpb25zIiwiZm9udCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJ2YWx1ZVBhdHRlcm4iLCJzbGlkZXJPcHRpb25zIiwidHJhY2tOb2RlIiwidmFsdWVUb0NvbG9yIiwidGh1bWJOb2RlIiwiY2VudGVyIiwibGF5b3V0RnVuY3Rpb24iLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjMiLCJhbGlnblRpdGxlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBRXZELE9BQU9DLFdBQVcsOEJBQThCO0FBRWhELE9BQU9DLG1CQUFtQix5QkFBeUI7QUFDbkQsT0FBT0MsY0FBYyxvQkFBb0I7QUFDekMsT0FBT0MseUJBQXlCLCtCQUErQjtBQUMvRCxPQUFPQyx5QkFBeUIsK0JBQStCO0FBQy9ELE9BQU9DLGtCQUFrQix3QkFBd0I7QUFFakQsZUFBZSxTQUFTQyw4QkFBK0JDLFlBQXFCO0lBQzFFLE1BQU1DLFdBQVcsSUFBSVQsU0FBVTtJQUMvQixNQUFNVSxvQkFBb0JKLGFBQWFJLGlCQUFpQjtJQUV4RCxvQ0FBb0M7SUFDcEMsTUFBTUMsUUFBUSxJQUFJVixNQUFPLEtBQUs7SUFDOUIsT0FBTyxJQUFJQyxjQUFlLElBQUlPLFVBQVVFLE9BQU87UUFDN0NDLGtCQUFrQjtZQUNoQkMsTUFBTSxJQUFJVixTQUFVO1FBQ3RCO1FBQ0FXLHNCQUFzQjtZQUNwQkMsYUFBYTtnQkFDWEYsTUFBTSxJQUFJVixTQUFVO1lBQ3RCO1lBQ0FhLGNBQWM7UUFDaEI7UUFDQUMsZUFBZTtZQUNiQyxXQUFXLElBQUliLG9CQUFxQkksVUFBVUUsT0FBTztnQkFBRVEsY0FBY1Q7WUFBa0I7WUFDdkZVLFdBQVcsSUFBSWhCLG9CQUFxQkssVUFBVTtnQkFBRVUsY0FBY1Q7WUFBa0I7UUFDbEY7UUFDQVcsUUFBUWIsYUFBYWEsTUFBTTtRQUMzQkMsZ0JBQWdCcEIsY0FBY3FCLHFCQUFxQixDQUFFO1lBQ25EQyxZQUFZO1FBQ2Q7SUFDRjtBQUNGIn0=