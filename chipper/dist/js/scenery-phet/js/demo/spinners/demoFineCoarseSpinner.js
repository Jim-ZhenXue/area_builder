// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for WavelengthNumberControl
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import FineCoarseSpinner from '../../FineCoarseSpinner.js';
import PhetFont from '../../PhetFont.js';
export default function demoFineCoarseSpinner(layoutBounds, options) {
    var _options_tandem, _options_tandem1, _options_tandem2, _options_tandem3;
    const numberProperty = new NumberProperty(0, {
        range: new Range(0, 100),
        tandem: options == null ? void 0 : (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('numberProperty')
    });
    const enabledProperty = new BooleanProperty(true, {
        tandem: options == null ? void 0 : (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('enabledProperty')
    });
    const spinner = new FineCoarseSpinner(numberProperty, {
        enabledProperty: enabledProperty,
        tandem: options == null ? void 0 : (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('spinner')
    });
    const checkbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: new PhetFont(20),
        tandem: options == null ? void 0 : (_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.createTandem('checkbox')
    }));
    return new VBox({
        spacing: 60,
        children: [
            spinner,
            checkbox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL3NwaW5uZXJzL2RlbW9GaW5lQ29hcnNlU3Bpbm5lci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBXYXZlbGVuZ3RoTnVtYmVyQ29udHJvbFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgeyBTdW5EZW1vT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgRmluZUNvYXJzZVNwaW5uZXIgZnJvbSAnLi4vLi4vRmluZUNvYXJzZVNwaW5uZXIuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL1BoZXRGb250LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0ZpbmVDb2Fyc2VTcGlubmVyKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIG9wdGlvbnM/OiBTdW5EZW1vT3B0aW9ucyApOiBOb2RlIHtcblxuICBjb25zdCBudW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwMCApLFxuICAgIHRhbmRlbTogb3B0aW9ucz8udGFuZGVtPy5jcmVhdGVUYW5kZW0oICdudW1iZXJQcm9wZXJ0eScgKVxuICB9ICk7XG5cbiAgY29uc3QgZW5hYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgIHRhbmRlbTogb3B0aW9ucz8udGFuZGVtPy5jcmVhdGVUYW5kZW0oICdlbmFibGVkUHJvcGVydHknIClcbiAgfSApO1xuXG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgRmluZUNvYXJzZVNwaW5uZXIoIG51bWJlclByb3BlcnR5LCB7XG4gICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHksXG4gICAgdGFuZGVtOiBvcHRpb25zPy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3NwaW5uZXInIClcbiAgfSApO1xuXG4gIGNvbnN0IGNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnZW5hYmxlZCcsIHtcbiAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXG4gICAgdGFuZGVtOiBvcHRpb25zPy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2NoZWNrYm94JyApXG4gIH0gKSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDYwLFxuICAgIGNoaWxkcmVuOiBbIHNwaW5uZXIsIGNoZWNrYm94IF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIlRleHQiLCJWQm94IiwiQ2hlY2tib3giLCJGaW5lQ29hcnNlU3Bpbm5lciIsIlBoZXRGb250IiwiZGVtb0ZpbmVDb2Fyc2VTcGlubmVyIiwibGF5b3V0Qm91bmRzIiwib3B0aW9ucyIsIm51bWJlclByb3BlcnR5IiwicmFuZ2UiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJlbmFibGVkUHJvcGVydHkiLCJzcGlubmVyIiwiY2hlY2tib3giLCJmb250Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0Msb0JBQW9CLHdDQUF3QztBQUVuRSxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFlQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDckUsT0FBT0MsY0FBYyxpQ0FBaUM7QUFFdEQsT0FBT0MsdUJBQXVCLDZCQUE2QjtBQUMzRCxPQUFPQyxjQUFjLG9CQUFvQjtBQUV6QyxlQUFlLFNBQVNDLHNCQUF1QkMsWUFBcUIsRUFBRUMsT0FBd0I7UUFJbEZBLGlCQUlBQSxrQkFLQUEsa0JBS0FBO0lBaEJWLE1BQU1DLGlCQUFpQixJQUFJVixlQUFnQixHQUFHO1FBQzVDVyxPQUFPLElBQUlWLE1BQU8sR0FBRztRQUNyQlcsTUFBTSxFQUFFSCw0QkFBQUEsa0JBQUFBLFFBQVNHLE1BQU0scUJBQWZILGdCQUFpQkksWUFBWSxDQUFFO0lBQ3pDO0lBRUEsTUFBTUMsa0JBQWtCLElBQUlmLGdCQUFpQixNQUFNO1FBQ2pEYSxNQUFNLEVBQUVILDRCQUFBQSxtQkFBQUEsUUFBU0csTUFBTSxxQkFBZkgsaUJBQWlCSSxZQUFZLENBQUU7SUFDekM7SUFFQSxNQUFNRSxVQUFVLElBQUlWLGtCQUFtQkssZ0JBQWdCO1FBQ3JESSxpQkFBaUJBO1FBQ2pCRixNQUFNLEVBQUVILDRCQUFBQSxtQkFBQUEsUUFBU0csTUFBTSxxQkFBZkgsaUJBQWlCSSxZQUFZLENBQUU7SUFDekM7SUFFQSxNQUFNRyxXQUFXLElBQUlaLFNBQVVVLGlCQUFpQixJQUFJWixLQUFNLFdBQVc7UUFDbkVlLE1BQU0sSUFBSVgsU0FBVTtRQUNwQk0sTUFBTSxFQUFFSCw0QkFBQUEsbUJBQUFBLFFBQVNHLE1BQU0scUJBQWZILGlCQUFpQkksWUFBWSxDQUFFO0lBQ3pDO0lBRUEsT0FBTyxJQUFJVixLQUFNO1FBQ2ZlLFNBQVM7UUFDVEMsVUFBVTtZQUFFSjtZQUFTQztTQUFVO1FBQy9CSSxRQUFRWixhQUFhWSxNQUFNO0lBQzdCO0FBQ0YifQ==