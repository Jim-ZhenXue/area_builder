// Copyright 2015-2024, University of Colorado Boulder
/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../axon/js/Property.js';
import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { HBox, VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import KeyboardHelpButton from '../KeyboardHelpButton.js';
import NavigationBarPreferencesButton from '../preferences/NavigationBarPreferencesButton.js';
import PreferencesModel from '../preferences/PreferencesModel.js';
import ScreenView from '../ScreenView.js';
import PreferencesDialogDemoSection from './PreferencesDialogDemoSection.js';
let DialogsScreenView = class DialogsScreenView extends ScreenView {
    constructor(providedOptions){
        super(providedOptions);
        const sim = phet.joist.sim;
        const keyboardHelpDialogContent = new BasicActionsKeyboardHelpSection();
        const fakeScreen = {
            createKeyboardHelpNode: ()=>keyboardHelpDialogContent,
            tandem: Tandem.OPT_OUT
        };
        const keyboardHelpButton = new KeyboardHelpButton([
            fakeScreen
        ], new Property(fakeScreen), sim.lookAndFeel.navigationBarFillProperty, {
            tandem: Tandem.GENERAL_VIEW.createTandem('keyboardHelpButton')
        });
        const preferencesModel = new PreferencesModel({
            simulationOptions: {
                customPreferences: [
                    {
                        createContent: (tandem)=>new PreferencesDialogDemoSection()
                    }
                ]
            }
        });
        const preferencesButton = new NavigationBarPreferencesButton(preferencesModel, sim.lookAndFeel.navigationBarFillProperty, {
            tandem: Tandem.GENERAL_VIEW.createTandem('preferencesButton')
        });
        const buttonsHBox = new HBox({
            children: [
                keyboardHelpButton,
                preferencesButton
            ]
        });
        buttonsHBox.setScaleMagnitude(2);
        // Since KeyboardHelpButton adapts its color to the navigation bar, put the button in a panel that's the same
        // color as the navigation bar. You can test this by toggling sim.lookAndFeel.backgroundColorProperty
        // between 'white' and 'black' is the browser console.
        const keyboardHelpPanel = new Panel(buttonsHBox, {
            fill: sim.lookAndFeel.navigationBarFillProperty.value
        });
        sim.lookAndFeel.navigationBarFillProperty.link((navigationBarFill)=>{
            keyboardHelpPanel.setFill(navigationBarFill);
        });
        this.addChild(new VBox({
            children: [
                keyboardHelpPanel
            ],
            spacing: 20,
            center: this.layoutBounds.center
        }));
    }
};
joist.register('DialogsScreenView', DialogsScreenView);
export default DialogsScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL2RlbW8vRGlhbG9nc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVmlldyBmb3IgZGVtb25zdHJhdGluZyBkaWFsb2dzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2tleWJvYXJkL2hlbHAvQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XG5pbXBvcnQgeyBIQm94LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XG5pbXBvcnQgS2V5Ym9hcmRIZWxwQnV0dG9uIGZyb20gJy4uL0tleWJvYXJkSGVscEJ1dHRvbi5qcyc7XG5pbXBvcnQgTmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uIGZyb20gJy4uL3ByZWZlcmVuY2VzL05hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbi5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNNb2RlbCBmcm9tICcuLi9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcbmltcG9ydCB7IEFueVNjcmVlbiB9IGZyb20gJy4uL1NjcmVlbi5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uL1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IFNpbSBmcm9tICcuLi9TaW0uanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24gZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZ0RlbW9TZWN0aW9uLmpzJztcblxuY2xhc3MgRGlhbG9nc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFNjcmVlblZpZXdPcHRpb25zICkge1xuXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgc2ltID0gcGhldC5qb2lzdC5zaW0gYXMgU2ltO1xuXG4gICAgY29uc3Qga2V5Ym9hcmRIZWxwRGlhbG9nQ29udGVudCA9IG5ldyBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uKCk7XG5cbiAgICBjb25zdCBmYWtlU2NyZWVuID0geyBjcmVhdGVLZXlib2FyZEhlbHBOb2RlOiAoKSA9PiBrZXlib2FyZEhlbHBEaWFsb2dDb250ZW50LCB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gYXMgdW5rbm93biBhcyBBbnlTY3JlZW47XG4gICAgY29uc3Qga2V5Ym9hcmRIZWxwQnV0dG9uID0gbmV3IEtleWJvYXJkSGVscEJ1dHRvbihcbiAgICAgIFsgZmFrZVNjcmVlbiBdLFxuICAgICAgbmV3IFByb3BlcnR5KCBmYWtlU2NyZWVuICksXG4gICAgICBzaW0ubG9va0FuZEZlZWwubmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSwge1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAna2V5Ym9hcmRIZWxwQnV0dG9uJyApXG4gICAgICB9ICk7XG5cbiAgICBjb25zdCBwcmVmZXJlbmNlc01vZGVsID0gbmV3IFByZWZlcmVuY2VzTW9kZWwoIHtcbiAgICAgIHNpbXVsYXRpb25PcHRpb25zOiB7XG4gICAgICAgIGN1c3RvbVByZWZlcmVuY2VzOiBbIHtcbiAgICAgICAgICBjcmVhdGVDb250ZW50OiB0YW5kZW0gPT4gbmV3IFByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24oKVxuICAgICAgICB9IF1cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgY29uc3QgcHJlZmVyZW5jZXNCdXR0b24gPSBuZXcgTmF2aWdhdGlvbkJhclByZWZlcmVuY2VzQnV0dG9uKFxuICAgICAgcHJlZmVyZW5jZXNNb2RlbCxcbiAgICAgIHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LCB7XG4gICAgICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfVklFVy5jcmVhdGVUYW5kZW0oICdwcmVmZXJlbmNlc0J1dHRvbicgKVxuICAgICAgfSApO1xuXG5cbiAgICBjb25zdCBidXR0b25zSEJveCA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGtleWJvYXJkSGVscEJ1dHRvbiwgcHJlZmVyZW5jZXNCdXR0b24gXSB9ICk7XG4gICAgYnV0dG9uc0hCb3guc2V0U2NhbGVNYWduaXR1ZGUoIDIgKTtcbiAgICAvLyBTaW5jZSBLZXlib2FyZEhlbHBCdXR0b24gYWRhcHRzIGl0cyBjb2xvciB0byB0aGUgbmF2aWdhdGlvbiBiYXIsIHB1dCB0aGUgYnV0dG9uIGluIGEgcGFuZWwgdGhhdCdzIHRoZSBzYW1lXG4gICAgLy8gY29sb3IgYXMgdGhlIG5hdmlnYXRpb24gYmFyLiBZb3UgY2FuIHRlc3QgdGhpcyBieSB0b2dnbGluZyBzaW0ubG9va0FuZEZlZWwuYmFja2dyb3VuZENvbG9yUHJvcGVydHlcbiAgICAvLyBiZXR3ZWVuICd3aGl0ZScgYW5kICdibGFjaycgaXMgdGhlIGJyb3dzZXIgY29uc29sZS5cbiAgICBjb25zdCBrZXlib2FyZEhlbHBQYW5lbCA9IG5ldyBQYW5lbCggYnV0dG9uc0hCb3gsIHtcbiAgICAgIGZpbGw6IHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LnZhbHVlXG4gICAgfSApO1xuICAgIHNpbS5sb29rQW5kRmVlbC5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LmxpbmsoIG5hdmlnYXRpb25CYXJGaWxsID0+IHtcbiAgICAgIGtleWJvYXJkSGVscFBhbmVsLnNldEZpbGwoIG5hdmlnYXRpb25CYXJGaWxsICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIGtleWJvYXJkSGVscFBhbmVsXG4gICAgICBdLFxuICAgICAgc3BhY2luZzogMjAsXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclxuICAgIH0gKSApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnRGlhbG9nc1NjcmVlblZpZXcnLCBEaWFsb2dzU2NyZWVuVmlldyApO1xuZXhwb3J0IGRlZmF1bHQgRGlhbG9nc1NjcmVlblZpZXc7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiQmFzaWNBY3Rpb25zS2V5Ym9hcmRIZWxwU2VjdGlvbiIsIkhCb3giLCJWQm94IiwiUGFuZWwiLCJUYW5kZW0iLCJqb2lzdCIsIktleWJvYXJkSGVscEJ1dHRvbiIsIk5hdmlnYXRpb25CYXJQcmVmZXJlbmNlc0J1dHRvbiIsIlByZWZlcmVuY2VzTW9kZWwiLCJTY3JlZW5WaWV3IiwiUHJlZmVyZW5jZXNEaWFsb2dEZW1vU2VjdGlvbiIsIkRpYWxvZ3NTY3JlZW5WaWV3IiwicHJvdmlkZWRPcHRpb25zIiwic2ltIiwicGhldCIsImtleWJvYXJkSGVscERpYWxvZ0NvbnRlbnQiLCJmYWtlU2NyZWVuIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsInRhbmRlbSIsIk9QVF9PVVQiLCJrZXlib2FyZEhlbHBCdXR0b24iLCJsb29rQW5kRmVlbCIsIm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkiLCJHRU5FUkFMX1ZJRVciLCJjcmVhdGVUYW5kZW0iLCJwcmVmZXJlbmNlc01vZGVsIiwic2ltdWxhdGlvbk9wdGlvbnMiLCJjdXN0b21QcmVmZXJlbmNlcyIsImNyZWF0ZUNvbnRlbnQiLCJwcmVmZXJlbmNlc0J1dHRvbiIsImJ1dHRvbnNIQm94IiwiY2hpbGRyZW4iLCJzZXRTY2FsZU1hZ25pdHVkZSIsImtleWJvYXJkSGVscFBhbmVsIiwiZmlsbCIsInZhbHVlIiwibGluayIsIm5hdmlnYXRpb25CYXJGaWxsIiwic2V0RmlsbCIsImFkZENoaWxkIiwic3BhY2luZyIsImNlbnRlciIsImxheW91dEJvdW5kcyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsK0JBQStCO0FBQ3BELE9BQU9DLHFDQUFxQyw0RUFBNEU7QUFDeEgsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsaUNBQWlDO0FBQzVELE9BQU9DLFdBQVcsMkJBQTJCO0FBQzdDLE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLFdBQVcsY0FBYztBQUNoQyxPQUFPQyx3QkFBd0IsMkJBQTJCO0FBQzFELE9BQU9DLG9DQUFvQyxtREFBbUQ7QUFDOUYsT0FBT0Msc0JBQXNCLHFDQUFxQztBQUVsRSxPQUFPQyxnQkFBdUMsbUJBQW1CO0FBRWpFLE9BQU9DLGtDQUFrQyxvQ0FBb0M7QUFFN0UsSUFBQSxBQUFNQyxvQkFBTixNQUFNQSwwQkFBMEJGO0lBQzlCLFlBQW9CRyxlQUFrQyxDQUFHO1FBRXZELEtBQUssQ0FBRUE7UUFFUCxNQUFNQyxNQUFNQyxLQUFLVCxLQUFLLENBQUNRLEdBQUc7UUFFMUIsTUFBTUUsNEJBQTRCLElBQUlmO1FBRXRDLE1BQU1nQixhQUFhO1lBQUVDLHdCQUF3QixJQUFNRjtZQUEyQkcsUUFBUWQsT0FBT2UsT0FBTztRQUFDO1FBQ3JHLE1BQU1DLHFCQUFxQixJQUFJZCxtQkFDN0I7WUFBRVU7U0FBWSxFQUNkLElBQUlqQixTQUFVaUIsYUFDZEgsSUFBSVEsV0FBVyxDQUFDQyx5QkFBeUIsRUFBRTtZQUN6Q0osUUFBUWQsT0FBT21CLFlBQVksQ0FBQ0MsWUFBWSxDQUFFO1FBQzVDO1FBRUYsTUFBTUMsbUJBQW1CLElBQUlqQixpQkFBa0I7WUFDN0NrQixtQkFBbUI7Z0JBQ2pCQyxtQkFBbUI7b0JBQUU7d0JBQ25CQyxlQUFlVixDQUFBQSxTQUFVLElBQUlSO29CQUMvQjtpQkFBRztZQUNMO1FBQ0Y7UUFDQSxNQUFNbUIsb0JBQW9CLElBQUl0QiwrQkFDNUJrQixrQkFDQVosSUFBSVEsV0FBVyxDQUFDQyx5QkFBeUIsRUFBRTtZQUN6Q0osUUFBUWQsT0FBT21CLFlBQVksQ0FBQ0MsWUFBWSxDQUFFO1FBQzVDO1FBR0YsTUFBTU0sY0FBYyxJQUFJN0IsS0FBTTtZQUFFOEIsVUFBVTtnQkFBRVg7Z0JBQW9CUzthQUFtQjtRQUFDO1FBQ3BGQyxZQUFZRSxpQkFBaUIsQ0FBRTtRQUMvQiw2R0FBNkc7UUFDN0cscUdBQXFHO1FBQ3JHLHNEQUFzRDtRQUN0RCxNQUFNQyxvQkFBb0IsSUFBSTlCLE1BQU8yQixhQUFhO1lBQ2hESSxNQUFNckIsSUFBSVEsV0FBVyxDQUFDQyx5QkFBeUIsQ0FBQ2EsS0FBSztRQUN2RDtRQUNBdEIsSUFBSVEsV0FBVyxDQUFDQyx5QkFBeUIsQ0FBQ2MsSUFBSSxDQUFFQyxDQUFBQTtZQUM5Q0osa0JBQWtCSyxPQUFPLENBQUVEO1FBQzdCO1FBRUEsSUFBSSxDQUFDRSxRQUFRLENBQUUsSUFBSXJDLEtBQU07WUFDdkI2QixVQUFVO2dCQUNSRTthQUNEO1lBQ0RPLFNBQVM7WUFDVEMsUUFBUSxJQUFJLENBQUNDLFlBQVksQ0FBQ0QsTUFBTTtRQUNsQztJQUNGO0FBQ0Y7QUFFQXBDLE1BQU1zQyxRQUFRLENBQUUscUJBQXFCaEM7QUFDckMsZUFBZUEsa0JBQWtCIn0=