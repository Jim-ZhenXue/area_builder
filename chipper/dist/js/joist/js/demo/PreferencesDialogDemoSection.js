// Copyright 2022-2024, University of Colorado Boulder
/**
 * A demo for the different features and components for a preferences dialog.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import { HBox, RichText, Text } from '../../../scenery/js/imports.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import joist from '../joist.js';
import PreferencesControl from '../preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../preferences/PreferencesDialogConstants.js';
import PreferencesPanelContentNode from '../preferences/PreferencesPanelContentNode.js';
let PreferencesDialogDemoSection = class PreferencesDialogDemoSection extends PreferencesPanelContentNode {
    constructor(){
        const sampleTitle = new PreferencesControl({
            labelNode: new Text('A Great Title', PreferencesDialogConstants.CONTROL_LABEL_OPTIONS)
        });
        const sampleDescription = new PreferencesControl({
            descriptionNode: new RichText('A description can be written here that gives the user useful information', PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS)
        });
        const sampleToggleControl = new PreferencesControl({
            labelNode: new Text('Toggle', PreferencesDialogConstants.CONTROL_LABEL_OPTIONS),
            descriptionNode: new RichText('This toggle can be clicked to turn on or off', PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS),
            controlNode: new ToggleSwitch(new BooleanProperty(true), false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS)
        });
        const sampleNumberControl = new PreferencesControl({
            labelNode: new Text('Number Control', PreferencesDialogConstants.CONTROL_LABEL_OPTIONS),
            descriptionNode: new RichText('This number control will allow you to change the value of a preference', PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS),
            controlNode: new NumberControl('integers:', new NumberProperty(0), new Range(0, 5), {
                layoutFunction: (titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton)=>{
                    assert && assert(leftArrowButton && rightArrowButton);
                    return new HBox({
                        spacing: 8,
                        resize: false,
                        children: [
                            numberDisplay,
                            leftArrowButton,
                            slider,
                            rightArrowButton
                        ]
                    });
                }
            })
        });
        super({
            content: [
                sampleTitle,
                sampleDescription,
                sampleToggleControl,
                sampleNumberControl
            ]
        });
    }
};
export { PreferencesDialogDemoSection as default };
joist.register('PreferencesDialogDemoSection', PreferencesDialogDemoSection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL2RlbW8vUHJlZmVyZW5jZXNEaWFsb2dEZW1vU2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGRlbW8gZm9yIHRoZSBkaWZmZXJlbnQgZmVhdHVyZXMgYW5kIGNvbXBvbmVudHMgZm9yIGEgcHJlZmVyZW5jZXMgZGlhbG9nLlxuICpcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICpcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckNvbnRyb2wuanMnO1xuaW1wb3J0IHsgSEJveCwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRvZ2dsZVN3aXRjaCBmcm9tICcuLi8uLi8uLi9zdW4vanMvVG9nZ2xlU3dpdGNoLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNDb250cm9sIGZyb20gJy4uL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMgZnJvbSAnLi4vcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzUGFuZWxDb250ZW50Tm9kZSBmcm9tICcuLi9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc1BhbmVsQ29udGVudE5vZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVmZXJlbmNlc0RpYWxvZ0RlbW9TZWN0aW9uIGV4dGVuZHMgUHJlZmVyZW5jZXNQYW5lbENvbnRlbnROb2RlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cbiAgICBjb25zdCBzYW1wbGVUaXRsZSA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcbiAgICAgIGxhYmVsTm9kZTogbmV3IFRleHQoICdBIEdyZWF0IFRpdGxlJyxcbiAgICAgICAgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuQ09OVFJPTF9MQUJFTF9PUFRJT05TIClcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzYW1wbGVEZXNjcmlwdGlvbiA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcbiAgICAgIGRlc2NyaXB0aW9uTm9kZTogbmV3IFJpY2hUZXh0KCAnQSBkZXNjcmlwdGlvbiBjYW4gYmUgd3JpdHRlbiBoZXJlIHRoYXQgZ2l2ZXMgdGhlIHVzZXIgdXNlZnVsIGluZm9ybWF0aW9uJyxcbiAgICAgICAgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuQ09OVFJPTF9ERVNDUklQVElPTl9PUFRJT05TIClcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzYW1wbGVUb2dnbGVDb250cm9sID0gbmV3IFByZWZlcmVuY2VzQ29udHJvbCgge1xuICAgICAgbGFiZWxOb2RlOiBuZXcgVGV4dCggJ1RvZ2dsZScsIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLkNPTlRST0xfTEFCRUxfT1BUSU9OUyApLFxuICAgICAgZGVzY3JpcHRpb25Ob2RlOiBuZXcgUmljaFRleHQoICdUaGlzIHRvZ2dsZSBjYW4gYmUgY2xpY2tlZCB0byB0dXJuIG9uIG9yIG9mZicsIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLkNPTlRST0xfREVTQ1JJUFRJT05fT1BUSU9OUyApLFxuICAgICAgY29udHJvbE5vZGU6IG5ldyBUb2dnbGVTd2l0Y2goIG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKSwgZmFsc2UsIHRydWUsIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLlRPR0dMRV9TV0lUQ0hfT1BUSU9OUyApXG4gICAgfSApO1xuXG4gICAgY29uc3Qgc2FtcGxlTnVtYmVyQ29udHJvbCA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcbiAgICAgIGxhYmVsTm9kZTogbmV3IFRleHQoICdOdW1iZXIgQ29udHJvbCcsIFByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLkNPTlRST0xfTEFCRUxfT1BUSU9OUyApLFxuICAgICAgZGVzY3JpcHRpb25Ob2RlOiBuZXcgUmljaFRleHQoICdUaGlzIG51bWJlciBjb250cm9sIHdpbGwgYWxsb3cgeW91IHRvIGNoYW5nZSB0aGUgdmFsdWUgb2YgYSBwcmVmZXJlbmNlJywgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuQ09OVFJPTF9ERVNDUklQVElPTl9PUFRJT05TICksXG4gICAgICBjb250cm9sTm9kZTogbmV3IE51bWJlckNvbnRyb2woICdpbnRlZ2VyczonLCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgbmV3IFJhbmdlKCAwLCA1ICksXG4gICAgICAgIHtcbiAgICAgICAgICBsYXlvdXRGdW5jdGlvbjogKCB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXksIHNsaWRlciwgbGVmdEFycm93QnV0dG9uLCByaWdodEFycm93QnV0dG9uICkgPT4ge1xuICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdEFycm93QnV0dG9uICYmIHJpZ2h0QXJyb3dCdXR0b24gKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgSEJveCgge1xuICAgICAgICAgICAgICBzcGFjaW5nOiA4LFxuICAgICAgICAgICAgICByZXNpemU6IGZhbHNlLCAvLyBwcmV2ZW50IHNsaWRlcnMgZnJvbSBjYXVzaW5nIGEgcmVzaXplIHdoZW4gdGh1bWIgaXMgYXQgbWluIG9yIG1heFxuICAgICAgICAgICAgICBjaGlsZHJlbjogWyBudW1iZXJEaXNwbGF5LCBsZWZ0QXJyb3dCdXR0b24hLCBzbGlkZXIsIHJpZ2h0QXJyb3dCdXR0b24hIF1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKVxuICAgIH0gKTtcblxuICAgIHN1cGVyKCB7IGNvbnRlbnQ6IFsgc2FtcGxlVGl0bGUsIHNhbXBsZURlc2NyaXB0aW9uLCBzYW1wbGVUb2dnbGVDb250cm9sLCBzYW1wbGVOdW1iZXJDb250cm9sIF0gfSApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnUHJlZmVyZW5jZXNEaWFsb2dEZW1vU2VjdGlvbicsIFByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24gKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIk51bWJlckNvbnRyb2wiLCJIQm94IiwiUmljaFRleHQiLCJUZXh0IiwiVG9nZ2xlU3dpdGNoIiwiam9pc3QiLCJQcmVmZXJlbmNlc0NvbnRyb2wiLCJQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyIsIlByZWZlcmVuY2VzUGFuZWxDb250ZW50Tm9kZSIsIlByZWZlcmVuY2VzRGlhbG9nRGVtb1NlY3Rpb24iLCJzYW1wbGVUaXRsZSIsImxhYmVsTm9kZSIsIkNPTlRST0xfTEFCRUxfT1BUSU9OUyIsInNhbXBsZURlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25Ob2RlIiwiQ09OVFJPTF9ERVNDUklQVElPTl9PUFRJT05TIiwic2FtcGxlVG9nZ2xlQ29udHJvbCIsImNvbnRyb2xOb2RlIiwiVE9HR0xFX1NXSVRDSF9PUFRJT05TIiwic2FtcGxlTnVtYmVyQ29udHJvbCIsImxheW91dEZ1bmN0aW9uIiwidGl0bGVOb2RlIiwibnVtYmVyRGlzcGxheSIsInNsaWRlciIsImxlZnRBcnJvd0J1dHRvbiIsInJpZ2h0QXJyb3dCdXR0b24iLCJhc3NlcnQiLCJzcGFjaW5nIiwicmVzaXplIiwiY2hpbGRyZW4iLCJjb250ZW50IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0Msb0JBQW9CLHFDQUFxQztBQUNoRSxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxtQkFBbUIsNENBQTRDO0FBQ3RFLFNBQVNDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxJQUFJLFFBQVEsaUNBQWlDO0FBQ3RFLE9BQU9DLGtCQUFrQixrQ0FBa0M7QUFDM0QsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9DLHdCQUF3Qix1Q0FBdUM7QUFDdEUsT0FBT0MsZ0NBQWdDLCtDQUErQztBQUN0RixPQUFPQyxpQ0FBaUMsZ0RBQWdEO0FBRXpFLElBQUEsQUFBTUMsK0JBQU4sTUFBTUEscUNBQXFDRDtJQUV4RCxhQUFxQjtRQUVuQixNQUFNRSxjQUFjLElBQUlKLG1CQUFvQjtZQUMxQ0ssV0FBVyxJQUFJUixLQUFNLGlCQUNuQkksMkJBQTJCSyxxQkFBcUI7UUFDcEQ7UUFFQSxNQUFNQyxvQkFBb0IsSUFBSVAsbUJBQW9CO1lBQ2hEUSxpQkFBaUIsSUFBSVosU0FBVSw0RUFDN0JLLDJCQUEyQlEsMkJBQTJCO1FBQzFEO1FBRUEsTUFBTUMsc0JBQXNCLElBQUlWLG1CQUFvQjtZQUNsREssV0FBVyxJQUFJUixLQUFNLFVBQVVJLDJCQUEyQksscUJBQXFCO1lBQy9FRSxpQkFBaUIsSUFBSVosU0FBVSxnREFBZ0RLLDJCQUEyQlEsMkJBQTJCO1lBQ3JJRSxhQUFhLElBQUliLGFBQWMsSUFBSVAsZ0JBQWlCLE9BQVEsT0FBTyxNQUFNVSwyQkFBMkJXLHFCQUFxQjtRQUMzSDtRQUVBLE1BQU1DLHNCQUFzQixJQUFJYixtQkFBb0I7WUFDbERLLFdBQVcsSUFBSVIsS0FBTSxrQkFBa0JJLDJCQUEyQksscUJBQXFCO1lBQ3ZGRSxpQkFBaUIsSUFBSVosU0FBVSwwRUFBMEVLLDJCQUEyQlEsMkJBQTJCO1lBQy9KRSxhQUFhLElBQUlqQixjQUFlLGFBQWEsSUFBSUYsZUFBZ0IsSUFBSyxJQUFJQyxNQUFPLEdBQUcsSUFDbEY7Z0JBQ0VxQixnQkFBZ0IsQ0FBRUMsV0FBV0MsZUFBZUMsUUFBUUMsaUJBQWlCQztvQkFDbkVDLFVBQVVBLE9BQVFGLG1CQUFtQkM7b0JBQ3JDLE9BQU8sSUFBSXhCLEtBQU07d0JBQ2YwQixTQUFTO3dCQUNUQyxRQUFRO3dCQUNSQyxVQUFVOzRCQUFFUDs0QkFBZUU7NEJBQWtCRDs0QkFBUUU7eUJBQW1CO29CQUMxRTtnQkFDRjtZQUNGO1FBQ0o7UUFFQSxLQUFLLENBQUU7WUFBRUssU0FBUztnQkFBRXBCO2dCQUFhRztnQkFBbUJHO2dCQUFxQkc7YUFBcUI7UUFBQztJQUNqRztBQUNGO0FBdENBLFNBQXFCViwwQ0FzQ3BCO0FBRURKLE1BQU0wQixRQUFRLENBQUUsZ0NBQWdDdEIifQ==