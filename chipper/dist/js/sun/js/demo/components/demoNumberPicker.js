// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for NumberPicker
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../Checkbox.js';
import NumberPicker from '../../NumberPicker.js';
export default function demoNumberPicker(layoutBounds) {
    const enabledProperty = new BooleanProperty(true);
    const numberPicker = new NumberPicker(new Property(0), new Property(new Range(-10, 10)), {
        font: new Font({
            size: 40
        }),
        enabledProperty: enabledProperty
    });
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: new Font({
            size: 20
        })
    }));
    return new VBox({
        spacing: 40,
        children: [
            numberPicker,
            enabledCheckbox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb051bWJlclBpY2tlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBOdW1iZXJQaWNrZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBGb250LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi9DaGVja2JveC5qcyc7XG5pbXBvcnQgTnVtYmVyUGlja2VyIGZyb20gJy4uLy4uL051bWJlclBpY2tlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9OdW1iZXJQaWNrZXIoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG5cbiAgY29uc3QgbnVtYmVyUGlja2VyID0gbmV3IE51bWJlclBpY2tlciggbmV3IFByb3BlcnR5KCAwICksIG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCAtMTAsIDEwICkgKSwge1xuICAgIGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDQwIH0gKSxcbiAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnZW5hYmxlZCcsIHsgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMjAgfSApIH0gKSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDQwLFxuICAgIGNoaWxkcmVuOiBbIG51bWJlclBpY2tlciwgZW5hYmxlZENoZWNrYm94IF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiUHJvcGVydHkiLCJSYW5nZSIsIkZvbnQiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiTnVtYmVyUGlja2VyIiwiZGVtb051bWJlclBpY2tlciIsImxheW91dEJvdW5kcyIsImVuYWJsZWRQcm9wZXJ0eSIsIm51bWJlclBpY2tlciIsImZvbnQiLCJzaXplIiwiZW5hYmxlZENoZWNrYm94Iiwic3BhY2luZyIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0MsY0FBYyxrQ0FBa0M7QUFFdkQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsSUFBSSxFQUFRQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDM0UsT0FBT0MsY0FBYyxvQkFBb0I7QUFDekMsT0FBT0Msa0JBQWtCLHdCQUF3QjtBQUVqRCxlQUFlLFNBQVNDLGlCQUFrQkMsWUFBcUI7SUFFN0QsTUFBTUMsa0JBQWtCLElBQUlWLGdCQUFpQjtJQUU3QyxNQUFNVyxlQUFlLElBQUlKLGFBQWMsSUFBSU4sU0FBVSxJQUFLLElBQUlBLFNBQVUsSUFBSUMsTUFBTyxDQUFDLElBQUksTUFBUTtRQUM5RlUsTUFBTSxJQUFJVCxLQUFNO1lBQUVVLE1BQU07UUFBRztRQUMzQkgsaUJBQWlCQTtJQUNuQjtJQUVBLE1BQU1JLGtCQUFrQixJQUFJUixTQUFVSSxpQkFBaUIsSUFBSU4sS0FBTSxXQUFXO1FBQUVRLE1BQU0sSUFBSVQsS0FBTTtZQUFFVSxNQUFNO1FBQUc7SUFBSTtJQUU3RyxPQUFPLElBQUlSLEtBQU07UUFDZlUsU0FBUztRQUNUQyxVQUFVO1lBQUVMO1lBQWNHO1NBQWlCO1FBQzNDRyxRQUFRUixhQUFhUSxNQUFNO0lBQzdCO0FBQ0YifQ==