// Copyright 2019-2024, University of Colorado Boulder
/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise position where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author Arnab Purkayastha
 * @author John Blanco
 */ import { Shape } from '../../kite/js/imports.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Color, Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
import ThermometerNode from './ThermometerNode.js';
let TemperatureAndColorSensorNode = class TemperatureAndColorSensorNode extends Node {
    getThermometerBounds() {
        return this.thermometerNode.bounds;
    }
    get thermometerBounds() {
        return this.getThermometerBounds();
    }
    getColorIndicatorBounds() {
        return this.colorIndicatorNode.bounds;
    }
    get colorIndicatorBounds() {
        return this.getColorIndicatorBounds();
    }
    constructor(temperatureProperty, temperatureRange, colorProperty, providedOptions){
        super();
        const options = optionize()({
            // SelfOptions
            horizontalSpace: 3,
            bottomOffset: 5,
            thermometerNodeOptions: {
                bulbDiameter: 30,
                tubeWidth: 18,
                lineWidth: 2,
                tickSpacingTemperature: 25,
                majorTickLength: 10,
                minorTickLength: 5,
                backgroundFill: new Color(256, 256, 256, 0.67)
            },
            colorIndicatorOptions: {
                fill: new Color(0, 0, 0, 0),
                lineWidth: 2,
                stroke: 'black',
                lineJoin: 'round',
                sideLength: 18
            }
        }, providedOptions);
        // Add the triangle that will display the sensed color.
        // The leftmost point of this triangle will correspond to the position of the sensor in the model.
        const s = options.colorIndicatorOptions.sideLength;
        const triangleShape = new Shape().moveTo(0, 0).lineTo(Math.cos(Math.PI / 6) * s, -Math.sin(Math.PI / 6) * s).lineTo(Math.cos(Math.PI / 6) * s, Math.sin(Math.PI / 6) * s).close();
        this.colorIndicatorNode = new Path(triangleShape, options.colorIndicatorOptions);
        colorProperty.link((color)=>{
            this.colorIndicatorNode.fill = color;
        });
        this.addChild(this.colorIndicatorNode);
        this.thermometerNode = new ThermometerNode(temperatureProperty, temperatureRange.min, temperatureRange.max, combineOptions({
            left: this.colorIndicatorNode.right + options.horizontalSpace,
            bottom: this.colorIndicatorNode.bottom + options.bottomOffset
        }, options.thermometerNodeOptions));
        this.addChild(this.thermometerNode);
        this.mutate(options);
    }
};
export { TemperatureAndColorSensorNode as default };
sceneryPhet.register('TemperatureAndColorSensorNode', TemperatureAndColorSensorNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjZW5lcnkgTm9kZSB0aGF0IHBvcnRyYXlzIGEgdGhlcm1vbWV0ZXIgYW5kIGEgdHJpYW5ndWxhciBpbmRpY2F0b3Igb2YgdGhlIHByZWNpc2UgcG9zaXRpb24gd2hlcmUgdGhlIHRlbXBlcmF0dXJlXG4gKiBpcyBiZWluZyBzZW5zZWQuIFRoZSB0cmlhbmd1bGFyIGluZGljYXRvciBjYW4gYmUgZmlsbGVkIHdpdGggYSBjb2xvciB0byBtYWtlIGl0IG1vcmUgY2xlYXIgd2hhdCBleGFjdGx5IGlzIGJlaW5nXG4gKiBtZWFzdXJlZC5cbiAqXG4gKiBAYXV0aG9yIEFybmFiIFB1cmtheWFzdGhhXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUGF0aE9wdGlvbnMsIFRDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgVGhlcm1vbWV0ZXJOb2RlLCB7IFRoZXJtb21ldGVyTm9kZU9wdGlvbnMgfSBmcm9tICcuL1RoZXJtb21ldGVyTm9kZS5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gaG9yaXpvbnRhbCBzcGFjaW5nIGJldHdlZW4gY29sb3IgaW5kaWNhdG9yIGFuZCB0aGVybW9tZXRlclxuICBob3Jpem9udGFsU3BhY2U/OiBudW1iZXI7XG5cbiAgLy8gdmVydGljYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIGJvdHRvbSBvZiBjb2xvciBpbmRpY2F0b3IgYW5kIHRoZXJtb21ldGVyXG4gIGJvdHRvbU9mZnNldD86IG51bWJlcjtcblxuICB0aGVybW9tZXRlck5vZGVPcHRpb25zPzogU3RyaWN0T21pdDxUaGVybW9tZXRlck5vZGVPcHRpb25zLCAnbGVmdCcgfCAnYm90dG9tJz47XG5cbiAgY29sb3JJbmRpY2F0b3JPcHRpb25zPzogeyBzaWRlTGVuZ3RoPzogbnVtYmVyIH0gJiBQYXRoT3B0aW9ucztcbn07XG5cbmV4cG9ydCB0eXBlIFRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjb2xvckluZGljYXRvck5vZGU6IFBhdGg7XG4gIHByaXZhdGUgcmVhZG9ubHkgdGhlcm1vbWV0ZXJOb2RlOiBOb2RlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGVtcGVyYXR1cmVQcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj4sIHRlbXBlcmF0dXJlUmFuZ2U6IFJhbmdlLCBjb2xvclByb3BlcnR5OiBUUHJvcGVydHk8VENvbG9yPixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZU9wdGlvbnMgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGhvcml6b250YWxTcGFjZTogMyxcbiAgICAgIGJvdHRvbU9mZnNldDogNSxcbiAgICAgIHRoZXJtb21ldGVyTm9kZU9wdGlvbnM6IHtcbiAgICAgICAgYnVsYkRpYW1ldGVyOiAzMCxcbiAgICAgICAgdHViZVdpZHRoOiAxOCxcbiAgICAgICAgbGluZVdpZHRoOiAyLFxuICAgICAgICB0aWNrU3BhY2luZ1RlbXBlcmF0dXJlOiAyNSxcbiAgICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxMCxcbiAgICAgICAgbWlub3JUaWNrTGVuZ3RoOiA1LFxuICAgICAgICBiYWNrZ3JvdW5kRmlsbDogbmV3IENvbG9yKCAyNTYsIDI1NiwgMjU2LCAwLjY3IClcbiAgICAgIH0sXG4gICAgICBjb2xvckluZGljYXRvck9wdGlvbnM6IHtcbiAgICAgICAgZmlsbDogbmV3IENvbG9yKCAwLCAwLCAwLCAwICksXG4gICAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgICBsaW5lSm9pbjogJ3JvdW5kJyxcbiAgICAgICAgc2lkZUxlbmd0aDogMThcbiAgICAgIH1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIEFkZCB0aGUgdHJpYW5nbGUgdGhhdCB3aWxsIGRpc3BsYXkgdGhlIHNlbnNlZCBjb2xvci5cbiAgICAvLyBUaGUgbGVmdG1vc3QgcG9pbnQgb2YgdGhpcyB0cmlhbmdsZSB3aWxsIGNvcnJlc3BvbmQgdG8gdGhlIHBvc2l0aW9uIG9mIHRoZSBzZW5zb3IgaW4gdGhlIG1vZGVsLlxuICAgIGNvbnN0IHMgPSBvcHRpb25zLmNvbG9ySW5kaWNhdG9yT3B0aW9ucy5zaWRlTGVuZ3RoITtcbiAgICBjb25zdCB0cmlhbmdsZVNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgIC5tb3ZlVG8oIDAsIDAgKVxuICAgICAgLmxpbmVUbyggTWF0aC5jb3MoIE1hdGguUEkgLyA2ICkgKiBzLCAtTWF0aC5zaW4oIE1hdGguUEkgLyA2ICkgKiBzIClcbiAgICAgIC5saW5lVG8oIE1hdGguY29zKCBNYXRoLlBJIC8gNiApICogcywgTWF0aC5zaW4oIE1hdGguUEkgLyA2ICkgKiBzIClcbiAgICAgIC5jbG9zZSgpO1xuICAgIHRoaXMuY29sb3JJbmRpY2F0b3JOb2RlID0gbmV3IFBhdGgoIHRyaWFuZ2xlU2hhcGUsIG9wdGlvbnMuY29sb3JJbmRpY2F0b3JPcHRpb25zICk7XG4gICAgY29sb3JQcm9wZXJ0eS5saW5rKCBjb2xvciA9PiB7IHRoaXMuY29sb3JJbmRpY2F0b3JOb2RlLmZpbGwgPSBjb2xvcjsgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY29sb3JJbmRpY2F0b3JOb2RlICk7XG5cbiAgICB0aGlzLnRoZXJtb21ldGVyTm9kZSA9IG5ldyBUaGVybW9tZXRlck5vZGUoIHRlbXBlcmF0dXJlUHJvcGVydHksIHRlbXBlcmF0dXJlUmFuZ2UubWluLCB0ZW1wZXJhdHVyZVJhbmdlLm1heCwgY29tYmluZU9wdGlvbnM8VGhlcm1vbWV0ZXJOb2RlT3B0aW9ucz4oIHtcbiAgICAgIGxlZnQ6IHRoaXMuY29sb3JJbmRpY2F0b3JOb2RlLnJpZ2h0ICsgb3B0aW9ucy5ob3Jpem9udGFsU3BhY2UsXG4gICAgICBib3R0b206IHRoaXMuY29sb3JJbmRpY2F0b3JOb2RlLmJvdHRvbSArIG9wdGlvbnMuYm90dG9tT2Zmc2V0XG4gICAgfSwgb3B0aW9ucy50aGVybW9tZXRlck5vZGVPcHRpb25zICkgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnRoZXJtb21ldGVyTm9kZSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRUaGVybW9tZXRlckJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy50aGVybW9tZXRlck5vZGUuYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCB0aGVybW9tZXRlckJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0VGhlcm1vbWV0ZXJCb3VuZHMoKTsgfVxuXG4gIHB1YmxpYyBnZXRDb2xvckluZGljYXRvckJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5jb2xvckluZGljYXRvck5vZGUuYm91bmRzO1xuICB9XG5cbiAgcHVibGljIGdldCBjb2xvckluZGljYXRvckJvdW5kcygpOiBCb3VuZHMyIHsgcmV0dXJuIHRoaXMuZ2V0Q29sb3JJbmRpY2F0b3JCb3VuZHMoKTsgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlJywgVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGUgKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJzY2VuZXJ5UGhldCIsIlRoZXJtb21ldGVyTm9kZSIsIlRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIiwiZ2V0VGhlcm1vbWV0ZXJCb3VuZHMiLCJ0aGVybW9tZXRlck5vZGUiLCJib3VuZHMiLCJ0aGVybW9tZXRlckJvdW5kcyIsImdldENvbG9ySW5kaWNhdG9yQm91bmRzIiwiY29sb3JJbmRpY2F0b3JOb2RlIiwiY29sb3JJbmRpY2F0b3JCb3VuZHMiLCJ0ZW1wZXJhdHVyZVByb3BlcnR5IiwidGVtcGVyYXR1cmVSYW5nZSIsImNvbG9yUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaG9yaXpvbnRhbFNwYWNlIiwiYm90dG9tT2Zmc2V0IiwidGhlcm1vbWV0ZXJOb2RlT3B0aW9ucyIsImJ1bGJEaWFtZXRlciIsInR1YmVXaWR0aCIsImxpbmVXaWR0aCIsInRpY2tTcGFjaW5nVGVtcGVyYXR1cmUiLCJtYWpvclRpY2tMZW5ndGgiLCJtaW5vclRpY2tMZW5ndGgiLCJiYWNrZ3JvdW5kRmlsbCIsImNvbG9ySW5kaWNhdG9yT3B0aW9ucyIsImZpbGwiLCJzdHJva2UiLCJsaW5lSm9pbiIsInNpZGVMZW5ndGgiLCJzIiwidHJpYW5nbGVTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsIk1hdGgiLCJjb3MiLCJQSSIsInNpbiIsImNsb3NlIiwibGluayIsImNvbG9yIiwiYWRkQ2hpbGQiLCJtaW4iLCJtYXgiLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FLRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFFNUUsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBNkIsOEJBQThCO0FBQ2xHLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MscUJBQWlELHVCQUF1QjtBQWlCaEUsSUFBQSxBQUFNQyxnQ0FBTixNQUFNQSxzQ0FBc0NKO0lBcURsREssdUJBQWdDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDQyxlQUFlLENBQUNDLE1BQU07SUFDcEM7SUFFQSxJQUFXQyxvQkFBNkI7UUFBRSxPQUFPLElBQUksQ0FBQ0gsb0JBQW9CO0lBQUk7SUFFdkVJLDBCQUFtQztRQUN4QyxPQUFPLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNILE1BQU07SUFDdkM7SUFFQSxJQUFXSSx1QkFBZ0M7UUFBRSxPQUFPLElBQUksQ0FBQ0YsdUJBQXVCO0lBQUk7SUExRHBGLFlBQW9CRyxtQkFBc0MsRUFBRUMsZ0JBQXVCLEVBQUVDLGFBQWdDLEVBQ2pHQyxlQUFzRCxDQUFHO1FBQzNFLEtBQUs7UUFFTCxNQUFNQyxVQUFVbkIsWUFBNkU7WUFFM0YsY0FBYztZQUNkb0IsaUJBQWlCO1lBQ2pCQyxjQUFjO1lBQ2RDLHdCQUF3QjtnQkFDdEJDLGNBQWM7Z0JBQ2RDLFdBQVc7Z0JBQ1hDLFdBQVc7Z0JBQ1hDLHdCQUF3QjtnQkFDeEJDLGlCQUFpQjtnQkFDakJDLGlCQUFpQjtnQkFDakJDLGdCQUFnQixJQUFJM0IsTUFBTyxLQUFLLEtBQUssS0FBSztZQUM1QztZQUNBNEIsdUJBQXVCO2dCQUNyQkMsTUFBTSxJQUFJN0IsTUFBTyxHQUFHLEdBQUcsR0FBRztnQkFDMUJ1QixXQUFXO2dCQUNYTyxRQUFRO2dCQUNSQyxVQUFVO2dCQUNWQyxZQUFZO1lBQ2Q7UUFDRixHQUFHaEI7UUFFSCx1REFBdUQ7UUFDdkQsa0dBQWtHO1FBQ2xHLE1BQU1pQixJQUFJaEIsUUFBUVcscUJBQXFCLENBQUNJLFVBQVU7UUFDbEQsTUFBTUUsZ0JBQWdCLElBQUlyQyxRQUN2QnNDLE1BQU0sQ0FBRSxHQUFHLEdBQ1hDLE1BQU0sQ0FBRUMsS0FBS0MsR0FBRyxDQUFFRCxLQUFLRSxFQUFFLEdBQUcsS0FBTU4sR0FBRyxDQUFDSSxLQUFLRyxHQUFHLENBQUVILEtBQUtFLEVBQUUsR0FBRyxLQUFNTixHQUNoRUcsTUFBTSxDQUFFQyxLQUFLQyxHQUFHLENBQUVELEtBQUtFLEVBQUUsR0FBRyxLQUFNTixHQUFHSSxLQUFLRyxHQUFHLENBQUVILEtBQUtFLEVBQUUsR0FBRyxLQUFNTixHQUMvRFEsS0FBSztRQUNSLElBQUksQ0FBQzlCLGtCQUFrQixHQUFHLElBQUlULEtBQU1nQyxlQUFlakIsUUFBUVcscUJBQXFCO1FBQ2hGYixjQUFjMkIsSUFBSSxDQUFFQyxDQUFBQTtZQUFXLElBQUksQ0FBQ2hDLGtCQUFrQixDQUFDa0IsSUFBSSxHQUFHYztRQUFPO1FBQ3JFLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ2pDLGtCQUFrQjtRQUV0QyxJQUFJLENBQUNKLGVBQWUsR0FBRyxJQUFJSCxnQkFBaUJTLHFCQUFxQkMsaUJBQWlCK0IsR0FBRyxFQUFFL0IsaUJBQWlCZ0MsR0FBRyxFQUFFL0MsZUFBd0M7WUFDbkpnRCxNQUFNLElBQUksQ0FBQ3BDLGtCQUFrQixDQUFDcUMsS0FBSyxHQUFHL0IsUUFBUUMsZUFBZTtZQUM3RCtCLFFBQVEsSUFBSSxDQUFDdEMsa0JBQWtCLENBQUNzQyxNQUFNLEdBQUdoQyxRQUFRRSxZQUFZO1FBQy9ELEdBQUdGLFFBQVFHLHNCQUFzQjtRQUNqQyxJQUFJLENBQUN3QixRQUFRLENBQUUsSUFBSSxDQUFDckMsZUFBZTtRQUVuQyxJQUFJLENBQUMyQyxNQUFNLENBQUVqQztJQUNmO0FBYUY7QUFoRUEsU0FBcUJaLDJDQWdFcEI7QUFFREYsWUFBWWdELFFBQVEsQ0FBRSxpQ0FBaUM5QyJ9