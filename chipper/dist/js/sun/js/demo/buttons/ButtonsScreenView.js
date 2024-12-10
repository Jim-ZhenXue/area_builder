// Copyright 2014-2024, University of Colorado Boulder
/**
 * Main ScreenView container for demonstrating and testing the various buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import sun from '../../sun.js';
import DemosScreenView from '../DemosScreenView.js';
import demoAquaRadioButtonGroup from './demoAquaRadioButtonGroup.js';
import demoMomentaryButtons from './demoMomentaryButtons.js';
import demoPushButtons from './demoPushButtons.js';
import demoRadioButtons from './demoRadioButtons.js';
import demoRectangularRadioButtonGroup from './demoRectangularRadioButtonGroup.js';
import demoToggleButtons from './demoToggleButtons.js';
let ButtonsScreenView = class ButtonsScreenView extends DemosScreenView {
    constructor(providedOptions){
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'AquaRadioButtonGroup',
                createNode: demoAquaRadioButtonGroup
            },
            {
                label: 'MomentaryButtons',
                createNode: demoMomentaryButtons
            },
            {
                label: 'PushButtons',
                createNode: demoPushButtons
            },
            {
                label: 'RadioButtons',
                createNode: demoRadioButtons
            },
            {
                label: 'RadioButtons',
                createNode: demoRadioButtons
            },
            {
                label: 'RectangularRadioButtonGroup',
                createNode: demoRectangularRadioButtonGroup
            },
            {
                label: 'ToggleButtons',
                createNode: demoToggleButtons
            }
        ];
        super(demos, providedOptions);
    }
};
export { ButtonsScreenView as default };
sun.register('ButtonsScreenView', ButtonsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2J1dHRvbnMvQnV0dG9uc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWFpbiBTY3JlZW5WaWV3IGNvbnRhaW5lciBmb3IgZGVtb25zdHJhdGluZyBhbmQgdGVzdGluZyB0aGUgdmFyaW91cyBidXR0b25zLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi4vLi4vc3VuLmpzJztcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcsIHsgRGVtb3NTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uL0RlbW9zU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgZGVtb0FxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vZGVtb0FxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcbmltcG9ydCBkZW1vTW9tZW50YXJ5QnV0dG9ucyBmcm9tICcuL2RlbW9Nb21lbnRhcnlCdXR0b25zLmpzJztcbmltcG9ydCBkZW1vUHVzaEJ1dHRvbnMgZnJvbSAnLi9kZW1vUHVzaEJ1dHRvbnMuanMnO1xuaW1wb3J0IGRlbW9SYWRpb0J1dHRvbnMgZnJvbSAnLi9kZW1vUmFkaW9CdXR0b25zLmpzJztcbmltcG9ydCBkZW1vUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vZGVtb1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgZGVtb1RvZ2dsZUJ1dHRvbnMgZnJvbSAnLi9kZW1vVG9nZ2xlQnV0dG9ucy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBCdXR0b25zU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxEZW1vc1NjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1dHRvbnNTY3JlZW5WaWV3IGV4dGVuZHMgRGVtb3NTY3JlZW5WaWV3IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEJ1dHRvbnNTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIC8vIFRvIGFkZCBhIGRlbW8sIGFkZCBhbiBlbnRyeSBoZXJlIG9mIHR5cGUgRGVtb0l0ZW1EYXRhLlxuICAgIGNvbnN0IGRlbW9zID0gW1xuICAgICAgeyBsYWJlbDogJ0FxdWFSYWRpb0J1dHRvbkdyb3VwJywgY3JlYXRlTm9kZTogZGVtb0FxdWFSYWRpb0J1dHRvbkdyb3VwIH0sXG4gICAgICB7IGxhYmVsOiAnTW9tZW50YXJ5QnV0dG9ucycsIGNyZWF0ZU5vZGU6IGRlbW9Nb21lbnRhcnlCdXR0b25zIH0sXG4gICAgICB7IGxhYmVsOiAnUHVzaEJ1dHRvbnMnLCBjcmVhdGVOb2RlOiBkZW1vUHVzaEJ1dHRvbnMgfSxcbiAgICAgIHsgbGFiZWw6ICdSYWRpb0J1dHRvbnMnLCBjcmVhdGVOb2RlOiBkZW1vUmFkaW9CdXR0b25zIH0sXG4gICAgICB7IGxhYmVsOiAnUmFkaW9CdXR0b25zJywgY3JlYXRlTm9kZTogZGVtb1JhZGlvQnV0dG9ucyB9LFxuICAgICAgeyBsYWJlbDogJ1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCcsIGNyZWF0ZU5vZGU6IGRlbW9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgfSxcbiAgICAgIHsgbGFiZWw6ICdUb2dnbGVCdXR0b25zJywgY3JlYXRlTm9kZTogZGVtb1RvZ2dsZUJ1dHRvbnMgfVxuICAgIF07XG5cbiAgICBzdXBlciggZGVtb3MsIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ0J1dHRvbnNTY3JlZW5WaWV3JywgQnV0dG9uc1NjcmVlblZpZXcgKTsiXSwibmFtZXMiOlsic3VuIiwiRGVtb3NTY3JlZW5WaWV3IiwiZGVtb0FxdWFSYWRpb0J1dHRvbkdyb3VwIiwiZGVtb01vbWVudGFyeUJ1dHRvbnMiLCJkZW1vUHVzaEJ1dHRvbnMiLCJkZW1vUmFkaW9CdXR0b25zIiwiZGVtb1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsImRlbW9Ub2dnbGVCdXR0b25zIiwiQnV0dG9uc1NjcmVlblZpZXciLCJwcm92aWRlZE9wdGlvbnMiLCJkZW1vcyIsImxhYmVsIiwiY3JlYXRlTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUlELE9BQU9BLFNBQVMsZUFBZTtBQUMvQixPQUFPQyxxQkFBaUQsd0JBQXdCO0FBQ2hGLE9BQU9DLDhCQUE4QixnQ0FBZ0M7QUFDckUsT0FBT0MsMEJBQTBCLDRCQUE0QjtBQUM3RCxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBQ25ELE9BQU9DLHNCQUFzQix3QkFBd0I7QUFDckQsT0FBT0MscUNBQXFDLHVDQUF1QztBQUNuRixPQUFPQyx1QkFBdUIseUJBQXlCO0FBS3hDLElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCUDtJQUM3QyxZQUFvQlEsZUFBeUMsQ0FBRztRQUU5RCx5REFBeUQ7UUFDekQsTUFBTUMsUUFBUTtZQUNaO2dCQUFFQyxPQUFPO2dCQUF3QkMsWUFBWVY7WUFBeUI7WUFDdEU7Z0JBQUVTLE9BQU87Z0JBQW9CQyxZQUFZVDtZQUFxQjtZQUM5RDtnQkFBRVEsT0FBTztnQkFBZUMsWUFBWVI7WUFBZ0I7WUFDcEQ7Z0JBQUVPLE9BQU87Z0JBQWdCQyxZQUFZUDtZQUFpQjtZQUN0RDtnQkFBRU0sT0FBTztnQkFBZ0JDLFlBQVlQO1lBQWlCO1lBQ3REO2dCQUFFTSxPQUFPO2dCQUErQkMsWUFBWU47WUFBZ0M7WUFDcEY7Z0JBQUVLLE9BQU87Z0JBQWlCQyxZQUFZTDtZQUFrQjtTQUN6RDtRQUVELEtBQUssQ0FBRUcsT0FBT0Q7SUFDaEI7QUFDRjtBQWhCQSxTQUFxQkQsK0JBZ0JwQjtBQUVEUixJQUFJYSxRQUFRLENBQUUscUJBQXFCTCJ9