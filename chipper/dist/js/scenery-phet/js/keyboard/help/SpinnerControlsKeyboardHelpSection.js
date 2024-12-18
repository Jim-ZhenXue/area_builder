// Copyright 2024, University of Colorado Boulder
/**
 * The keyboard help section that describes how to interact with a "spinner".
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import optionize from '../../../../phet-core/js/optionize.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import SliderControlsKeyboardHelpSection from './SliderControlsKeyboardHelpSection.js';
const spinnerControlsStringProperty = SceneryPhetStrings.keyboardHelpDialog.spinnerControlsStringProperty;
const spinnerStringProperty = SceneryPhetStrings.keyboardHelpDialog.spinnerStringProperty;
let SpinnerControlsKeyboardHelpSection = class SpinnerControlsKeyboardHelpSection extends SliderControlsKeyboardHelpSection {
    constructor(providedOptions){
        const options = optionize()({
            headingStringProperty: spinnerControlsStringProperty,
            sliderStringProperty: spinnerStringProperty,
            // PhET 'spinners' usually do not support larger steps with the page up/page down keys.
            includeLargerStepsRow: false
        }, providedOptions);
        super(options);
    }
};
export { SpinnerControlsKeyboardHelpSection as default };
sceneryPhet.register('SpinnerControlsKeyboardHelpSection', SpinnerControlsKeyboardHelpSection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL1NwaW5uZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSBrZXlib2FyZCBoZWxwIHNlY3Rpb24gdGhhdCBkZXNjcmliZXMgaG93IHRvIGludGVyYWN0IHdpdGggYSBcInNwaW5uZXJcIi5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5pbXBvcnQgU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uLCB7IFNsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgfSBmcm9tICcuL1NsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbi5qcyc7XG5cbmNvbnN0IHNwaW5uZXJDb250cm9sc1N0cmluZ1Byb3BlcnR5ID0gU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5zcGlubmVyQ29udHJvbHNTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHNwaW5uZXJTdHJpbmdQcm9wZXJ0eSA9IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuc3Bpbm5lclN0cmluZ1Byb3BlcnR5O1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFNsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnM7XG5leHBvcnQgdHlwZSBTcGlubmVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3Bpbm5lckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiBleHRlbmRzIFNsaWRlckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbiB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU3Bpbm5lckNvbnRyb2xzS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNwaW5uZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb25PcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuICAgICAgaGVhZGluZ1N0cmluZ1Byb3BlcnR5OiBzcGlubmVyQ29udHJvbHNTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIHNsaWRlclN0cmluZ1Byb3BlcnR5OiBzcGlubmVyU3RyaW5nUHJvcGVydHksXG5cbiAgICAgIC8vIFBoRVQgJ3NwaW5uZXJzJyB1c3VhbGx5IGRvIG5vdCBzdXBwb3J0IGxhcmdlciBzdGVwcyB3aXRoIHRoZSBwYWdlIHVwL3BhZ2UgZG93biBrZXlzLlxuICAgICAgaW5jbHVkZUxhcmdlclN0ZXBzUm93OiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1NwaW5uZXJDb250cm9sc0tleWJvYXJkSGVscFNlY3Rpb24nLCBTcGlubmVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiU2xpZGVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwic3Bpbm5lckNvbnRyb2xzU3RyaW5nUHJvcGVydHkiLCJrZXlib2FyZEhlbHBEaWFsb2ciLCJzcGlubmVyU3RyaW5nUHJvcGVydHkiLCJTcGlubmVyQ29udHJvbHNLZXlib2FyZEhlbHBTZWN0aW9uIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImhlYWRpbmdTdHJpbmdQcm9wZXJ0eSIsInNsaWRlclN0cmluZ1Byb3BlcnR5IiwiaW5jbHVkZUxhcmdlclN0ZXBzUm93IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBcUMsd0NBQXdDO0FBQ3BGLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0Msd0JBQXdCLDhCQUE4QjtBQUM3RCxPQUFPQyx1Q0FBcUYseUNBQXlDO0FBRXJJLE1BQU1DLGdDQUFnQ0YsbUJBQW1CRyxrQkFBa0IsQ0FBQ0QsNkJBQTZCO0FBQ3pHLE1BQU1FLHdCQUF3QkosbUJBQW1CRyxrQkFBa0IsQ0FBQ0MscUJBQXFCO0FBTTFFLElBQUEsQUFBTUMscUNBQU4sTUFBTUEsMkNBQTJDSjtJQUM5RCxZQUFvQkssZUFBMkQsQ0FBRztRQUVoRixNQUFNQyxVQUFVVCxZQUFvRjtZQUNsR1UsdUJBQXVCTjtZQUN2Qk8sc0JBQXNCTDtZQUV0Qix1RkFBdUY7WUFDdkZNLHVCQUF1QjtRQUN6QixHQUFHSjtRQUVILEtBQUssQ0FBRUM7SUFDVDtBQUNGO0FBYkEsU0FBcUJGLGdEQWFwQjtBQUVETixZQUFZWSxRQUFRLENBQUUsc0NBQXNDTiJ9