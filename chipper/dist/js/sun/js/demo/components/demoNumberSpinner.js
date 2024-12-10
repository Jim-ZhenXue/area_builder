// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for NumberSpinner
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Font, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../Checkbox.js';
import NumberSpinner from '../../NumberSpinner.js';
export default function demoNumberSpinner(layoutBounds) {
    const valueProperty = new Property(0);
    const valueRangeProperty = new Property(new Range(-5, 5));
    const enabledProperty = new Property(true);
    // options for all spinners
    const spinnerOptions = {
        enabledProperty: enabledProperty,
        deltaValue: 0.1,
        touchAreaXDilation: 20,
        touchAreaYDilation: 10,
        mouseAreaXDilation: 10,
        mouseAreaYDilation: 5,
        numberDisplayOptions: {
            decimalPlaces: 1,
            align: 'center',
            xMargin: 10,
            yMargin: 3,
            minBackgroundWidth: 100,
            textOptions: {
                font: new Font({
                    size: 28
                })
            }
        }
    };
    // Demonstrate each value of options.arrowsPosition
    const spinnerLeftRight = new NumberSpinner(valueProperty, valueRangeProperty, combineOptions({}, spinnerOptions, {
        arrowsPosition: 'leftRight',
        numberDisplayOptions: {
            valuePattern: '{{value}} bottles of beer on the wall'
        }
    }));
    const spinnerTopBottom = new NumberSpinner(valueProperty, valueRangeProperty, combineOptions({}, spinnerOptions, {
        arrowsPosition: 'topBottom',
        arrowsScale: 0.65
    }));
    const spinnerBothRight = new NumberSpinner(valueProperty, valueRangeProperty, combineOptions({}, spinnerOptions, {
        arrowsPosition: 'bothRight',
        numberDisplayOptions: {
            yMargin: 10,
            align: 'right'
        }
    }));
    const spinnerBothBottom = new NumberSpinner(valueProperty, valueRangeProperty, combineOptions({}, spinnerOptions, {
        arrowsPosition: 'bothBottom',
        numberDisplayOptions: {
            backgroundFill: 'pink',
            backgroundStroke: 'red',
            backgroundLineWidth: 3,
            align: 'left'
        },
        arrowButtonFill: 'lightblue',
        arrowButtonStroke: 'blue',
        arrowButtonLineWidth: 0.2
    }));
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: new Font({
            size: 20
        })
    }));
    return new VBox({
        children: [
            spinnerTopBottom,
            spinnerBothRight,
            spinnerBothBottom,
            spinnerLeftRight,
            enabledCheckbox
        ],
        spacing: 40,
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb051bWJlclNwaW5uZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTnVtYmVyU3Bpbm5lclxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgRm9udCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vQ2hlY2tib3guanMnO1xuaW1wb3J0IE51bWJlclNwaW5uZXIsIHsgTnVtYmVyU3Bpbm5lck9wdGlvbnMgfSBmcm9tICcuLi8uLi9OdW1iZXJTcGlubmVyLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb051bWJlclNwaW5uZXIoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCB2YWx1ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7XG4gIGNvbnN0IHZhbHVlUmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCAtNSwgNSApICk7XG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuXG4gIC8vIG9wdGlvbnMgZm9yIGFsbCBzcGlubmVyc1xuICBjb25zdCBzcGlubmVyT3B0aW9uczogTnVtYmVyU3Bpbm5lck9wdGlvbnMgPSB7XG4gICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHksXG4gICAgZGVsdGFWYWx1ZTogMC4xLFxuICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMjAsXG4gICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcbiAgICBtb3VzZUFyZWFYRGlsYXRpb246IDEwLFxuICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogNSxcbiAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgZGVjaW1hbFBsYWNlczogMSxcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHhNYXJnaW46IDEwLFxuICAgICAgeU1hcmdpbjogMyxcbiAgICAgIG1pbkJhY2tncm91bmRXaWR0aDogMTAwLFxuICAgICAgdGV4dE9wdGlvbnM6IHtcbiAgICAgICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMjggfSApXG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIERlbW9uc3RyYXRlIGVhY2ggdmFsdWUgb2Ygb3B0aW9ucy5hcnJvd3NQb3NpdGlvblxuICBjb25zdCBzcGlubmVyTGVmdFJpZ2h0ID0gbmV3IE51bWJlclNwaW5uZXIoIHZhbHVlUHJvcGVydHksIHZhbHVlUmFuZ2VQcm9wZXJ0eSxcbiAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJTcGlubmVyT3B0aW9ucz4oIHt9LCBzcGlubmVyT3B0aW9ucywge1xuICAgICAgYXJyb3dzUG9zaXRpb246ICdsZWZ0UmlnaHQnLFxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgdmFsdWVQYXR0ZXJuOiAne3t2YWx1ZX19IGJvdHRsZXMgb2YgYmVlciBvbiB0aGUgd2FsbCdcbiAgICAgIH1cbiAgICB9ICkgKTtcblxuICBjb25zdCBzcGlubmVyVG9wQm90dG9tID0gbmV3IE51bWJlclNwaW5uZXIoIHZhbHVlUHJvcGVydHksIHZhbHVlUmFuZ2VQcm9wZXJ0eSxcbiAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJTcGlubmVyT3B0aW9ucz4oIHt9LCBzcGlubmVyT3B0aW9ucywge1xuICAgICAgYXJyb3dzUG9zaXRpb246ICd0b3BCb3R0b20nLFxuICAgICAgYXJyb3dzU2NhbGU6IDAuNjVcbiAgICB9ICkgKTtcblxuICBjb25zdCBzcGlubmVyQm90aFJpZ2h0ID0gbmV3IE51bWJlclNwaW5uZXIoIHZhbHVlUHJvcGVydHksIHZhbHVlUmFuZ2VQcm9wZXJ0eSxcbiAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJTcGlubmVyT3B0aW9ucz4oIHt9LCBzcGlubmVyT3B0aW9ucywge1xuICAgICAgYXJyb3dzUG9zaXRpb246ICdib3RoUmlnaHQnLFxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgeU1hcmdpbjogMTAsXG4gICAgICAgIGFsaWduOiAncmlnaHQnXG4gICAgICB9XG4gICAgfSApICk7XG5cbiAgY29uc3Qgc3Bpbm5lckJvdGhCb3R0b20gPSBuZXcgTnVtYmVyU3Bpbm5lciggdmFsdWVQcm9wZXJ0eSwgdmFsdWVSYW5nZVByb3BlcnR5LFxuICAgIGNvbWJpbmVPcHRpb25zPE51bWJlclNwaW5uZXJPcHRpb25zPigge30sIHNwaW5uZXJPcHRpb25zLCB7XG4gICAgICBhcnJvd3NQb3NpdGlvbjogJ2JvdGhCb3R0b20nLFxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgYmFja2dyb3VuZEZpbGw6ICdwaW5rJyxcbiAgICAgICAgYmFja2dyb3VuZFN0cm9rZTogJ3JlZCcsXG4gICAgICAgIGJhY2tncm91bmRMaW5lV2lkdGg6IDMsXG4gICAgICAgIGFsaWduOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICBhcnJvd0J1dHRvbkZpbGw6ICdsaWdodGJsdWUnLFxuICAgICAgYXJyb3dCdXR0b25TdHJva2U6ICdibHVlJyxcbiAgICAgIGFycm93QnV0dG9uTGluZVdpZHRoOiAwLjJcbiAgICB9ICkgKTtcblxuICBjb25zdCBlbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGVuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdlbmFibGVkJywgeyBmb250OiBuZXcgRm9udCggeyBzaXplOiAyMCB9ICkgfSApICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgY2hpbGRyZW46IFsgc3Bpbm5lclRvcEJvdHRvbSwgc3Bpbm5lckJvdGhSaWdodCwgc3Bpbm5lckJvdGhCb3R0b20sIHNwaW5uZXJMZWZ0UmlnaHQsIGVuYWJsZWRDaGVja2JveCBdLFxuICAgIHNwYWNpbmc6IDQwLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiUmFuZ2UiLCJjb21iaW5lT3B0aW9ucyIsIkZvbnQiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiTnVtYmVyU3Bpbm5lciIsImRlbW9OdW1iZXJTcGlubmVyIiwibGF5b3V0Qm91bmRzIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlUmFuZ2VQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsInNwaW5uZXJPcHRpb25zIiwiZGVsdGFWYWx1ZSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiZGVjaW1hbFBsYWNlcyIsImFsaWduIiwieE1hcmdpbiIsInlNYXJnaW4iLCJtaW5CYWNrZ3JvdW5kV2lkdGgiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJzaXplIiwic3Bpbm5lckxlZnRSaWdodCIsImFycm93c1Bvc2l0aW9uIiwidmFsdWVQYXR0ZXJuIiwic3Bpbm5lclRvcEJvdHRvbSIsImFycm93c1NjYWxlIiwic3Bpbm5lckJvdGhSaWdodCIsInNwaW5uZXJCb3RoQm90dG9tIiwiYmFja2dyb3VuZEZpbGwiLCJiYWNrZ3JvdW5kU3Ryb2tlIiwiYmFja2dyb3VuZExpbmVXaWR0aCIsImFycm93QnV0dG9uRmlsbCIsImFycm93QnV0dG9uU3Ryb2tlIiwiYXJyb3dCdXR0b25MaW5lV2lkdGgiLCJlbmFibGVkQ2hlY2tib3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFFdkQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsY0FBYyxRQUFRLHdDQUF3QztBQUN2RSxTQUFTQyxJQUFJLEVBQVFDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMzRSxPQUFPQyxjQUFjLG9CQUFvQjtBQUN6QyxPQUFPQyxtQkFBNkMseUJBQXlCO0FBRTdFLGVBQWUsU0FBU0Msa0JBQW1CQyxZQUFxQjtJQUU5RCxNQUFNQyxnQkFBZ0IsSUFBSVYsU0FBVTtJQUNwQyxNQUFNVyxxQkFBcUIsSUFBSVgsU0FBVSxJQUFJQyxNQUFPLENBQUMsR0FBRztJQUN4RCxNQUFNVyxrQkFBa0IsSUFBSVosU0FBVTtJQUV0QywyQkFBMkI7SUFDM0IsTUFBTWEsaUJBQXVDO1FBQzNDRCxpQkFBaUJBO1FBQ2pCRSxZQUFZO1FBQ1pDLG9CQUFvQjtRQUNwQkMsb0JBQW9CO1FBQ3BCQyxvQkFBb0I7UUFDcEJDLG9CQUFvQjtRQUNwQkMsc0JBQXNCO1lBQ3BCQyxlQUFlO1lBQ2ZDLE9BQU87WUFDUEMsU0FBUztZQUNUQyxTQUFTO1lBQ1RDLG9CQUFvQjtZQUNwQkMsYUFBYTtnQkFDWEMsTUFBTSxJQUFJdkIsS0FBTTtvQkFBRXdCLE1BQU07Z0JBQUc7WUFDN0I7UUFDRjtJQUNGO0lBRUEsbURBQW1EO0lBQ25ELE1BQU1DLG1CQUFtQixJQUFJckIsY0FBZUcsZUFBZUMsb0JBQ3pEVCxlQUFzQyxDQUFDLEdBQUdXLGdCQUFnQjtRQUN4RGdCLGdCQUFnQjtRQUNoQlYsc0JBQXNCO1lBQ3BCVyxjQUFjO1FBQ2hCO0lBQ0Y7SUFFRixNQUFNQyxtQkFBbUIsSUFBSXhCLGNBQWVHLGVBQWVDLG9CQUN6RFQsZUFBc0MsQ0FBQyxHQUFHVyxnQkFBZ0I7UUFDeERnQixnQkFBZ0I7UUFDaEJHLGFBQWE7SUFDZjtJQUVGLE1BQU1DLG1CQUFtQixJQUFJMUIsY0FBZUcsZUFBZUMsb0JBQ3pEVCxlQUFzQyxDQUFDLEdBQUdXLGdCQUFnQjtRQUN4RGdCLGdCQUFnQjtRQUNoQlYsc0JBQXNCO1lBQ3BCSSxTQUFTO1lBQ1RGLE9BQU87UUFDVDtJQUNGO0lBRUYsTUFBTWEsb0JBQW9CLElBQUkzQixjQUFlRyxlQUFlQyxvQkFDMURULGVBQXNDLENBQUMsR0FBR1csZ0JBQWdCO1FBQ3hEZ0IsZ0JBQWdCO1FBQ2hCVixzQkFBc0I7WUFDcEJnQixnQkFBZ0I7WUFDaEJDLGtCQUFrQjtZQUNsQkMscUJBQXFCO1lBQ3JCaEIsT0FBTztRQUNUO1FBQ0FpQixpQkFBaUI7UUFDakJDLG1CQUFtQjtRQUNuQkMsc0JBQXNCO0lBQ3hCO0lBRUYsTUFBTUMsa0JBQWtCLElBQUluQyxTQUFVTSxpQkFBaUIsSUFBSVIsS0FBTSxXQUFXO1FBQUVzQixNQUFNLElBQUl2QixLQUFNO1lBQUV3QixNQUFNO1FBQUc7SUFBSTtJQUU3RyxPQUFPLElBQUl0QixLQUFNO1FBQ2ZxQyxVQUFVO1lBQUVYO1lBQWtCRTtZQUFrQkM7WUFBbUJOO1lBQWtCYTtTQUFpQjtRQUN0R0UsU0FBUztRQUNUQyxRQUFRbkMsYUFBYW1DLE1BQU07SUFDN0I7QUFDRiJ9