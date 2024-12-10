// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for various momentary buttons.
 *
 * @author various contributors
 */ import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Font, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RectangularMomentaryButton from '../../buttons/RectangularMomentaryButton.js';
import RoundMomentaryButton from '../../buttons/RoundMomentaryButton.js';
import Checkbox from '../../Checkbox.js';
export default function demoMomentaryButtons(layoutBounds) {
    // For enabling/disabling all buttons
    const buttonsEnabledProperty = new Property(true);
    const buttonsEnabledCheckbox = new Checkbox(buttonsEnabledProperty, new Text('buttons enabled', {
        font: new Font({
            size: 20
        })
    }), {
        tandem: Tandem.OPT_OUT
    });
    // round
    const roundMomentaryProperty = new Property(false);
    roundMomentaryProperty.lazyLink((value)=>console.log(`roundMomentaryProperty.value = ${value}`));
    const roundMomentaryButton = new RoundMomentaryButton(roundMomentaryProperty, false, true, {
        baseColor: '#D76958',
        enabledProperty: buttonsEnabledProperty,
        tandem: Tandem.OPT_OUT
    });
    // rectangular
    const rectangularMomentaryProperty = new Property(false);
    rectangularMomentaryProperty.lazyLink((value)=>console.log(`rectangularMomentaryProperty.value = ${value}`));
    const rectangularMomentaryButton = new RectangularMomentaryButton(rectangularMomentaryProperty, false, true, {
        baseColor: '#724C35',
        enabledProperty: buttonsEnabledProperty,
        size: new Dimension2(50, 40),
        tandem: Tandem.OPT_OUT
    });
    return new VBox({
        spacing: 35,
        children: [
            new HBox({
                children: [
                    roundMomentaryButton,
                    rectangularMomentaryButton
                ],
                spacing: 15
            }),
            buttonsEnabledCheckbox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvZGVtb01vbWVudGFyeUJ1dHRvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgdmFyaW91cyBtb21lbnRhcnkgYnV0dG9ucy5cbiAqXG4gKiBAYXV0aG9yIHZhcmlvdXMgY29udHJpYnV0b3JzXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyTW9tZW50YXJ5QnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24uanMnO1xuaW1wb3J0IFJvdW5kTW9tZW50YXJ5QnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUm91bmRNb21lbnRhcnlCdXR0b24uanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uL0NoZWNrYm94LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb01vbWVudGFyeUJ1dHRvbnMoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICAvLyBGb3IgZW5hYmxpbmcvZGlzYWJsaW5nIGFsbCBidXR0b25zXG4gIGNvbnN0IGJ1dHRvbnNFbmFibGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTtcbiAgY29uc3QgYnV0dG9uc0VuYWJsZWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdidXR0b25zIGVuYWJsZWQnLCB7XG4gICAgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMjAgfSApXG4gIH0gKSwge1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgfSApO1xuXG4gIC8vIHJvdW5kXG4gIGNvbnN0IHJvdW5kTW9tZW50YXJ5UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG4gIHJvdW5kTW9tZW50YXJ5UHJvcGVydHkubGF6eUxpbmsoIHZhbHVlID0+IGNvbnNvbGUubG9nKCBgcm91bmRNb21lbnRhcnlQcm9wZXJ0eS52YWx1ZSA9ICR7dmFsdWV9YCApICk7XG4gIGNvbnN0IHJvdW5kTW9tZW50YXJ5QnV0dG9uID0gbmV3IFJvdW5kTW9tZW50YXJ5QnV0dG9uKCByb3VuZE1vbWVudGFyeVByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwge1xuICAgIGJhc2VDb2xvcjogJyNENzY5NTgnLFxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gIH0gKTtcblxuICAvLyByZWN0YW5ndWxhclxuICBjb25zdCByZWN0YW5ndWxhck1vbWVudGFyeVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuICByZWN0YW5ndWxhck1vbWVudGFyeVByb3BlcnR5LmxhenlMaW5rKCB2YWx1ZSA9PiBjb25zb2xlLmxvZyggYHJlY3Rhbmd1bGFyTW9tZW50YXJ5UHJvcGVydHkudmFsdWUgPSAke3ZhbHVlfWAgKSApO1xuICBjb25zdCByZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbiggcmVjdGFuZ3VsYXJNb21lbnRhcnlQcm9wZXJ0eSwgZmFsc2UsIHRydWUsIHtcbiAgICBiYXNlQ29sb3I6ICcjNzI0QzM1JyxcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXG4gICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDUwLCA0MCApLFxuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDM1LFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBuZXcgSEJveCgge1xuICAgICAgICBjaGlsZHJlbjogWyByb3VuZE1vbWVudGFyeUJ1dHRvbiwgcmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24gXSxcbiAgICAgICAgc3BhY2luZzogMTVcbiAgICAgIH0gKSxcbiAgICAgIGJ1dHRvbnNFbmFibGVkQ2hlY2tib3hcbiAgICBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIkZvbnQiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJUYW5kZW0iLCJSZWN0YW5ndWxhck1vbWVudGFyeUJ1dHRvbiIsIlJvdW5kTW9tZW50YXJ5QnV0dG9uIiwiQ2hlY2tib3giLCJkZW1vTW9tZW50YXJ5QnV0dG9ucyIsImxheW91dEJvdW5kcyIsImJ1dHRvbnNFbmFibGVkUHJvcGVydHkiLCJidXR0b25zRW5hYmxlZENoZWNrYm94IiwiZm9udCIsInNpemUiLCJ0YW5kZW0iLCJPUFRfT1VUIiwicm91bmRNb21lbnRhcnlQcm9wZXJ0eSIsImxhenlMaW5rIiwidmFsdWUiLCJjb25zb2xlIiwibG9nIiwicm91bmRNb21lbnRhcnlCdXR0b24iLCJiYXNlQ29sb3IiLCJlbmFibGVkUHJvcGVydHkiLCJyZWN0YW5ndWxhck1vbWVudGFyeVByb3BlcnR5IiwicmVjdGFuZ3VsYXJNb21lbnRhcnlCdXR0b24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFFdkQsT0FBT0MsZ0JBQWdCLG1DQUFtQztBQUMxRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ2pGLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGdDQUFnQyw4Q0FBOEM7QUFDckYsT0FBT0MsMEJBQTBCLHdDQUF3QztBQUN6RSxPQUFPQyxjQUFjLG9CQUFvQjtBQUV6QyxlQUFlLFNBQVNDLHFCQUFzQkMsWUFBcUI7SUFFakUscUNBQXFDO0lBQ3JDLE1BQU1DLHlCQUF5QixJQUFJWixTQUFVO0lBQzdDLE1BQU1hLHlCQUF5QixJQUFJSixTQUFVRyx3QkFBd0IsSUFBSVIsS0FBTSxtQkFBbUI7UUFDaEdVLE1BQU0sSUFBSVosS0FBTTtZQUFFYSxNQUFNO1FBQUc7SUFDN0IsSUFBSztRQUNIQyxRQUFRVixPQUFPVyxPQUFPO0lBQ3hCO0lBRUEsUUFBUTtJQUNSLE1BQU1DLHlCQUF5QixJQUFJbEIsU0FBVTtJQUM3Q2tCLHVCQUF1QkMsUUFBUSxDQUFFQyxDQUFBQSxRQUFTQyxRQUFRQyxHQUFHLENBQUUsQ0FBQywrQkFBK0IsRUFBRUYsT0FBTztJQUNoRyxNQUFNRyx1QkFBdUIsSUFBSWYscUJBQXNCVSx3QkFBd0IsT0FBTyxNQUFNO1FBQzFGTSxXQUFXO1FBQ1hDLGlCQUFpQmI7UUFDakJJLFFBQVFWLE9BQU9XLE9BQU87SUFDeEI7SUFFQSxjQUFjO0lBQ2QsTUFBTVMsK0JBQStCLElBQUkxQixTQUFVO0lBQ25EMEIsNkJBQTZCUCxRQUFRLENBQUVDLENBQUFBLFFBQVNDLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLHFDQUFxQyxFQUFFRixPQUFPO0lBQzVHLE1BQU1PLDZCQUE2QixJQUFJcEIsMkJBQTRCbUIsOEJBQThCLE9BQU8sTUFBTTtRQUM1R0YsV0FBVztRQUNYQyxpQkFBaUJiO1FBQ2pCRyxNQUFNLElBQUlkLFdBQVksSUFBSTtRQUMxQmUsUUFBUVYsT0FBT1csT0FBTztJQUN4QjtJQUVBLE9BQU8sSUFBSVosS0FBTTtRQUNmdUIsU0FBUztRQUNUQyxVQUFVO1lBQ1IsSUFBSTFCLEtBQU07Z0JBQ1IwQixVQUFVO29CQUFFTjtvQkFBc0JJO2lCQUE0QjtnQkFDOURDLFNBQVM7WUFDWDtZQUNBZjtTQUNEO1FBQ0RpQixRQUFRbkIsYUFBYW1CLE1BQU07SUFDN0I7QUFDRiJ9