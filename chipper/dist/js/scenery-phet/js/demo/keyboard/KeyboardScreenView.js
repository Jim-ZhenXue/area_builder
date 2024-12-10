// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demos for things in scenery-phet/js/keyboard/.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../../../phet-core/js/optionize.js';
import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import sceneryPhet from '../../sceneryPhet.js';
import demoBasicActionsKeyboardHelpSection from './demoBasicActionsKeyboardHelpSection.js';
import demoComboBoxKeyboardHelpSection from './demoComboBoxKeyboardHelpSection.js';
import demoFaucetControlsKeyboardHelpSection from './demoFaucetControlsKeyboardHelpSection.js';
import demoGrabReleaseKeyboardHelpSection from './demoGrabReleaseKeyboardHelpSection.js';
import demoHeatCoolControlsKeyboardHelpSection from './demoHeatCoolControlsKeyboardHelpSection.js';
import demoKeyboardHelpIconFactory from './demoKeyboardHelpIconFactory.js';
import demoKeyboardHelpSection from './demoKeyboardHelpSection.js';
import demoKeyNode from './demoKeyNode.js';
import demoSliderControlsKeyboardHelpSection from './demoSliderControlsKeyboardHelpSection.js';
import demoSpinnerControlsKeyboardHelpSection from './demoSpinnerControlsKeyboardHelpSection.js';
let KeyboardScreenView = class KeyboardScreenView extends DemosScreenView {
    constructor(providedOptions){
        const options = optionize()({
        }, providedOptions);
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'BasicActionsKeyboardHelpSection',
                createNode: demoBasicActionsKeyboardHelpSection
            },
            {
                label: 'ComboBoxKeyboardHelpSection',
                createNode: demoComboBoxKeyboardHelpSection
            },
            {
                label: 'FaucetControlsKeyboardHelpSection',
                createNode: demoFaucetControlsKeyboardHelpSection
            },
            {
                label: 'HeatCoolControlsKeyboardHelpSection',
                createNode: demoHeatCoolControlsKeyboardHelpSection
            },
            {
                label: 'KeyboardHelpIconFactory',
                createNode: demoKeyboardHelpIconFactory
            },
            {
                label: 'KeyboardHelpSection',
                createNode: demoKeyboardHelpSection
            },
            {
                label: 'KeyNode',
                createNode: demoKeyNode
            },
            {
                label: 'SpinnerControlsKeyboardHelpSection',
                createNode: demoSpinnerControlsKeyboardHelpSection
            },
            {
                label: 'SliderControlsKeyboardHelpSection',
                createNode: demoSliderControlsKeyboardHelpSection
            },
            {
                label: 'GrabReleaseKeyboardHelpSection',
                createNode: demoGrabReleaseKeyboardHelpSection
            }
        ];
        super(demos, options);
    }
};
export { KeyboardScreenView as default };
sceneryPhet.register('KeyboardScreenView', KeyboardScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2tleWJvYXJkL0tleWJvYXJkU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vcyBmb3IgdGhpbmdzIGluIHNjZW5lcnktcGhldC9qcy9rZXlib2FyZC8uXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgRGVtb3NTY3JlZW5WaWV3LCB7IERlbW9zU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvZGVtby9EZW1vc1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBkZW1vQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuL2RlbW9CYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcbmltcG9ydCBkZW1vQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4vZGVtb0NvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XG5pbXBvcnQgZGVtb0ZhdWNldENvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuL2RlbW9GYXVjZXRDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuaW1wb3J0IGRlbW9HcmFiUmVsZWFzZUtleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi9kZW1vR3JhYlJlbGVhc2VLZXlib2FyZEhlbHBTZWN0aW9uLmpzJztcbmltcG9ydCBkZW1vSGVhdENvb2xDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi9kZW1vSGVhdENvb2xDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuaW1wb3J0IGRlbW9LZXlib2FyZEhlbHBJY29uRmFjdG9yeSBmcm9tICcuL2RlbW9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XG5pbXBvcnQgZGVtb0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi9kZW1vS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XG5pbXBvcnQgZGVtb0tleU5vZGUgZnJvbSAnLi9kZW1vS2V5Tm9kZS5qcyc7XG5pbXBvcnQgZGVtb1NsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuL2RlbW9TbGlkZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuaW1wb3J0IGRlbW9TcGlubmVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4vZGVtb1NwaW5uZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgS2V5Ym9hcmRTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERlbW9zU2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5Ym9hcmRTY3JlZW5WaWV3IGV4dGVuZHMgRGVtb3NTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogS2V5Ym9hcmRTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRTY3JlZW5WaWV3T3B0aW9ucywgU2VsZk9wdGlvbnMsIERlbW9zU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcbiAgICAgIC8vIG5vdGhpbmcgZm9yIG5vd1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gVG8gYWRkIGEgZGVtbywgYWRkIGFuIGVudHJ5IGhlcmUgb2YgdHlwZSBEZW1vSXRlbURhdGEuXG4gICAgY29uc3QgZGVtb3MgPSBbXG4gICAgICB7IGxhYmVsOiAnQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9CYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIH0sXG4gICAgICB7IGxhYmVsOiAnQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uJywgY3JlYXRlTm9kZTogZGVtb0NvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbiB9LFxuICAgICAgeyBsYWJlbDogJ0ZhdWNldENvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9GYXVjZXRDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24gfSxcbiAgICAgIHsgbGFiZWw6ICdIZWF0Q29vbENvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9IZWF0Q29vbENvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiB9LFxuICAgICAgeyBsYWJlbDogJ0tleWJvYXJkSGVscEljb25GYWN0b3J5JywgY3JlYXRlTm9kZTogZGVtb0tleWJvYXJkSGVscEljb25GYWN0b3J5IH0sXG4gICAgICB7IGxhYmVsOiAnS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9LZXlib2FyZEhlbHBTZWN0aW9uIH0sXG4gICAgICB7IGxhYmVsOiAnS2V5Tm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9LZXlOb2RlIH0sXG4gICAgICB7IGxhYmVsOiAnU3Bpbm5lckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9TcGlubmVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIH0sXG4gICAgICB7IGxhYmVsOiAnU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uJywgY3JlYXRlTm9kZTogZGVtb1NsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiB9LFxuICAgICAgeyBsYWJlbDogJ0dyYWJSZWxlYXNlS2V5Ym9hcmRIZWxwU2VjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9HcmFiUmVsZWFzZUtleWJvYXJkSGVscFNlY3Rpb24gfVxuICAgIF07XG5cbiAgICBzdXBlciggZGVtb3MsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0tleWJvYXJkU2NyZWVuVmlldycsIEtleWJvYXJkU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJEZW1vc1NjcmVlblZpZXciLCJzY2VuZXJ5UGhldCIsImRlbW9CYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiZGVtb0NvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbiIsImRlbW9GYXVjZXRDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24iLCJkZW1vR3JhYlJlbGVhc2VLZXlib2FyZEhlbHBTZWN0aW9uIiwiZGVtb0hlYXRDb29sQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwiZGVtb0tleWJvYXJkSGVscEljb25GYWN0b3J5IiwiZGVtb0tleWJvYXJkSGVscFNlY3Rpb24iLCJkZW1vS2V5Tm9kZSIsImRlbW9TbGlkZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24iLCJkZW1vU3Bpbm5lckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiIsIktleWJvYXJkU2NyZWVuVmlldyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkZW1vcyIsImxhYmVsIiwiY3JlYXRlTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGVBQXFDLHdDQUF3QztBQUVwRixPQUFPQyxxQkFBaUQsNkNBQTZDO0FBQ3JHLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MseUNBQXlDLDJDQUEyQztBQUMzRixPQUFPQyxxQ0FBcUMsdUNBQXVDO0FBQ25GLE9BQU9DLDJDQUEyQyw2Q0FBNkM7QUFDL0YsT0FBT0Msd0NBQXdDLDBDQUEwQztBQUN6RixPQUFPQyw2Q0FBNkMsK0NBQStDO0FBQ25HLE9BQU9DLGlDQUFpQyxtQ0FBbUM7QUFDM0UsT0FBT0MsNkJBQTZCLCtCQUErQjtBQUNuRSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLDJDQUEyQyw2Q0FBNkM7QUFDL0YsT0FBT0MsNENBQTRDLDhDQUE4QztBQUtsRixJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQlo7SUFFOUMsWUFBb0JhLGVBQTBDLENBQUc7UUFFL0QsTUFBTUMsVUFBVWYsWUFBNkU7UUFFN0YsR0FBR2M7UUFFSCx5REFBeUQ7UUFDekQsTUFBTUUsUUFBUTtZQUNaO2dCQUFFQyxPQUFPO2dCQUFtQ0MsWUFBWWY7WUFBb0M7WUFDNUY7Z0JBQUVjLE9BQU87Z0JBQStCQyxZQUFZZDtZQUFnQztZQUNwRjtnQkFBRWEsT0FBTztnQkFBcUNDLFlBQVliO1lBQXNDO1lBQ2hHO2dCQUFFWSxPQUFPO2dCQUF1Q0MsWUFBWVg7WUFBd0M7WUFDcEc7Z0JBQUVVLE9BQU87Z0JBQTJCQyxZQUFZVjtZQUE0QjtZQUM1RTtnQkFBRVMsT0FBTztnQkFBdUJDLFlBQVlUO1lBQXdCO1lBQ3BFO2dCQUFFUSxPQUFPO2dCQUFXQyxZQUFZUjtZQUFZO1lBQzVDO2dCQUFFTyxPQUFPO2dCQUFzQ0MsWUFBWU47WUFBdUM7WUFDbEc7Z0JBQUVLLE9BQU87Z0JBQXFDQyxZQUFZUDtZQUFzQztZQUNoRztnQkFBRU0sT0FBTztnQkFBa0NDLFlBQVlaO1lBQW1DO1NBQzNGO1FBRUQsS0FBSyxDQUFFVSxPQUFPRDtJQUNoQjtBQUNGO0FBeEJBLFNBQXFCRixnQ0F3QnBCO0FBRURYLFlBQVlpQixRQUFRLENBQUUsc0JBQXNCTiJ9