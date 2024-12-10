// Copyright 2019-2024, University of Colorado Boulder
/**
 * Utilities specific to the keyboard for handling zoom/pan control.
 *
 * @author Jesse Greenberg
 */ import Property from '../../../axon/js/Property.js';
import { HotkeyData, KeyboardUtils, scenery } from '../imports.js';
const KeyboardZoomUtils = {
    /**
   * Returns true if the platform is most likely a Mac device. Pan/Zoom will use different modifier keys in this case.
   *
   * TODO: Move to platform if generally useful? https://github.com/phetsims/scenery/issues/1581
   */ isPlatformMac: ()=>{
        return _.includes(window.navigator.platform, 'Mac');
    },
    /**
   * Get the 'meta' key for the platform that would indicate user wants to zoom. This is 'metaKey' on Mac and 'ctrl'
   * on Windows.
   *
   */ getPlatformZoomMetaKey: ()=>{
        return KeyboardZoomUtils.isPlatformMac() ? 'metaKey' : 'ctrlKey';
    },
    /**
   * Returns true of the keyboard input indicates that a zoom command was initiated. Different keys are checked
   * on mac devices (which go through the Cmd key) and windows devices (which use the ctrl modifier).
   *
   * @param event
   * @param zoomIn - do you want to check for zoom in or zoom out?
   */ isZoomCommand: (event, zoomIn)=>{
        // This function checks the meta key on the event, so it cannot use HotkeyData.
        const zoomKey = zoomIn ? KeyboardUtils.KEY_EQUALS : KeyboardUtils.KEY_MINUS;
        const metaKey = KeyboardZoomUtils.getPlatformZoomMetaKey();
        // @ts-expect-error
        return event[metaKey] && KeyboardUtils.isKeyEvent(event, zoomKey);
    },
    /**
   * Returns true if the keyboard command indicates a "zoom reset". This is ctrl + 0 on Win and cmd + 0 on mac.
   */ isZoomResetCommand: (event)=>{
        const metaKey = KeyboardZoomUtils.getPlatformZoomMetaKey();
        // This function uses the meta key on the event, so it cannot use HotkeyData.
        // @ts-expect-error
        return event[metaKey] && KeyboardUtils.isKeyEvent(event, KeyboardUtils.KEY_0);
    },
    // Hotkey data is not used in the implementation but is provided for documentation purposes.
    // Beware if you change keys in these, you will need to change other methods in this utils file.
    ZOOM_IN_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('ctrl+equals'),
            new Property('meta+equals')
        ],
        binderName: 'Zoom in',
        repoName: 'scenery',
        global: true
    }),
    ZOOM_OUT_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('ctrl+minus'),
            new Property('meta+minus')
        ],
        binderName: 'Zoom in',
        repoName: 'scenery',
        global: true
    }),
    RESET_ZOOM_HOTKEY_DATA: new HotkeyData({
        keyStringProperties: [
            new Property('ctrl+0'),
            new Property('meta+0')
        ],
        binderName: 'Reset zoom',
        repoName: 'scenery',
        global: true
    })
};
scenery.register('KeyboardZoomUtils', KeyboardZoomUtils);
export default KeyboardZoomUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9LZXlib2FyZFpvb21VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVdGlsaXRpZXMgc3BlY2lmaWMgdG8gdGhlIGtleWJvYXJkIGZvciBoYW5kbGluZyB6b29tL3BhbiBjb250cm9sLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgSG90a2V5RGF0YSwgS2V5Ym9hcmRVdGlscywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBLZXlib2FyZFpvb21VdGlscyA9IHtcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwbGF0Zm9ybSBpcyBtb3N0IGxpa2VseSBhIE1hYyBkZXZpY2UuIFBhbi9ab29tIHdpbGwgdXNlIGRpZmZlcmVudCBtb2RpZmllciBrZXlzIGluIHRoaXMgY2FzZS5cbiAgICpcbiAgICogVE9ETzogTW92ZSB0byBwbGF0Zm9ybSBpZiBnZW5lcmFsbHkgdXNlZnVsPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi9cbiAgaXNQbGF0Zm9ybU1hYzogKCk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiBfLmluY2x1ZGVzKCB3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtLCAnTWFjJyApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlICdtZXRhJyBrZXkgZm9yIHRoZSBwbGF0Zm9ybSB0aGF0IHdvdWxkIGluZGljYXRlIHVzZXIgd2FudHMgdG8gem9vbS4gVGhpcyBpcyAnbWV0YUtleScgb24gTWFjIGFuZCAnY3RybCdcbiAgICogb24gV2luZG93cy5cbiAgICpcbiAgICovXG4gIGdldFBsYXRmb3JtWm9vbU1ldGFLZXk6ICgpOiBzdHJpbmcgPT4ge1xuICAgIHJldHVybiBLZXlib2FyZFpvb21VdGlscy5pc1BsYXRmb3JtTWFjKCkgPyAnbWV0YUtleScgOiAnY3RybEtleSc7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBvZiB0aGUga2V5Ym9hcmQgaW5wdXQgaW5kaWNhdGVzIHRoYXQgYSB6b29tIGNvbW1hbmQgd2FzIGluaXRpYXRlZC4gRGlmZmVyZW50IGtleXMgYXJlIGNoZWNrZWRcbiAgICogb24gbWFjIGRldmljZXMgKHdoaWNoIGdvIHRocm91Z2ggdGhlIENtZCBrZXkpIGFuZCB3aW5kb3dzIGRldmljZXMgKHdoaWNoIHVzZSB0aGUgY3RybCBtb2RpZmllcikuXG4gICAqXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gem9vbUluIC0gZG8geW91IHdhbnQgdG8gY2hlY2sgZm9yIHpvb20gaW4gb3Igem9vbSBvdXQ/XG4gICAqL1xuICBpc1pvb21Db21tYW5kOiAoIGV2ZW50OiBFdmVudCwgem9vbUluOiBib29sZWFuICk6IGJvb2xlYW4gPT4ge1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBjaGVja3MgdGhlIG1ldGEga2V5IG9uIHRoZSBldmVudCwgc28gaXQgY2Fubm90IHVzZSBIb3RrZXlEYXRhLlxuICAgIGNvbnN0IHpvb21LZXkgPSB6b29tSW4gPyBLZXlib2FyZFV0aWxzLktFWV9FUVVBTFMgOiBLZXlib2FyZFV0aWxzLktFWV9NSU5VUztcbiAgICBjb25zdCBtZXRhS2V5ID0gS2V5Ym9hcmRab29tVXRpbHMuZ2V0UGxhdGZvcm1ab29tTWV0YUtleSgpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHJldHVybiBldmVudFsgbWV0YUtleSBdICYmIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZXZlbnQsIHpvb21LZXkgKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBrZXlib2FyZCBjb21tYW5kIGluZGljYXRlcyBhIFwiem9vbSByZXNldFwiLiBUaGlzIGlzIGN0cmwgKyAwIG9uIFdpbiBhbmQgY21kICsgMCBvbiBtYWMuXG4gICAqL1xuICBpc1pvb21SZXNldENvbW1hbmQ6ICggZXZlbnQ6IEV2ZW50ICk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IG1ldGFLZXkgPSBLZXlib2FyZFpvb21VdGlscy5nZXRQbGF0Zm9ybVpvb21NZXRhS2V5KCk7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHVzZXMgdGhlIG1ldGEga2V5IG9uIHRoZSBldmVudCwgc28gaXQgY2Fubm90IHVzZSBIb3RrZXlEYXRhLlxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gZXZlbnRbIG1ldGFLZXkgXSAmJiBLZXlib2FyZFV0aWxzLmlzS2V5RXZlbnQoIGV2ZW50LCBLZXlib2FyZFV0aWxzLktFWV8wICk7XG4gIH0sXG5cbiAgLy8gSG90a2V5IGRhdGEgaXMgbm90IHVzZWQgaW4gdGhlIGltcGxlbWVudGF0aW9uIGJ1dCBpcyBwcm92aWRlZCBmb3IgZG9jdW1lbnRhdGlvbiBwdXJwb3Nlcy5cbiAgLy8gQmV3YXJlIGlmIHlvdSBjaGFuZ2Uga2V5cyBpbiB0aGVzZSwgeW91IHdpbGwgbmVlZCB0byBjaGFuZ2Ugb3RoZXIgbWV0aG9kcyBpbiB0aGlzIHV0aWxzIGZpbGUuXG4gIFpPT01fSU5fSE9US0VZX0RBVEE6IG5ldyBIb3RrZXlEYXRhKCB7XG4gICAga2V5U3RyaW5nUHJvcGVydGllczogWyBuZXcgUHJvcGVydHkoICdjdHJsK2VxdWFscycgKSwgbmV3IFByb3BlcnR5KCAnbWV0YStlcXVhbHMnICkgXSxcbiAgICBiaW5kZXJOYW1lOiAnWm9vbSBpbicsXG4gICAgcmVwb05hbWU6ICdzY2VuZXJ5JyxcbiAgICBnbG9iYWw6IHRydWVcbiAgfSApLFxuXG4gIFpPT01fT1VUX0hPVEtFWV9EQVRBOiBuZXcgSG90a2V5RGF0YSgge1xuICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFsgbmV3IFByb3BlcnR5KCAnY3RybCttaW51cycgKSwgbmV3IFByb3BlcnR5KCAnbWV0YSttaW51cycgKSBdLFxuICAgIGJpbmRlck5hbWU6ICdab29tIGluJyxcbiAgICByZXBvTmFtZTogJ3NjZW5lcnknLFxuICAgIGdsb2JhbDogdHJ1ZVxuICB9ICksXG5cbiAgUkVTRVRfWk9PTV9IT1RLRVlfREFUQTogbmV3IEhvdGtleURhdGEoIHtcbiAgICBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBbIG5ldyBQcm9wZXJ0eSggJ2N0cmwrMCcgKSwgbmV3IFByb3BlcnR5KCAnbWV0YSswJyApIF0sXG4gICAgYmluZGVyTmFtZTogJ1Jlc2V0IHpvb20nLFxuICAgIHJlcG9OYW1lOiAnc2NlbmVyeScsXG4gICAgZ2xvYmFsOiB0cnVlXG4gIH0gKVxufTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0tleWJvYXJkWm9vbVV0aWxzJywgS2V5Ym9hcmRab29tVXRpbHMgKTtcbmV4cG9ydCBkZWZhdWx0IEtleWJvYXJkWm9vbVV0aWxzOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkhvdGtleURhdGEiLCJLZXlib2FyZFV0aWxzIiwic2NlbmVyeSIsIktleWJvYXJkWm9vbVV0aWxzIiwiaXNQbGF0Zm9ybU1hYyIsIl8iLCJpbmNsdWRlcyIsIndpbmRvdyIsIm5hdmlnYXRvciIsInBsYXRmb3JtIiwiZ2V0UGxhdGZvcm1ab29tTWV0YUtleSIsImlzWm9vbUNvbW1hbmQiLCJldmVudCIsInpvb21JbiIsInpvb21LZXkiLCJLRVlfRVFVQUxTIiwiS0VZX01JTlVTIiwibWV0YUtleSIsImlzS2V5RXZlbnQiLCJpc1pvb21SZXNldENvbW1hbmQiLCJLRVlfMCIsIlpPT01fSU5fSE9US0VZX0RBVEEiLCJrZXlTdHJpbmdQcm9wZXJ0aWVzIiwiYmluZGVyTmFtZSIsInJlcG9OYW1lIiwiZ2xvYmFsIiwiWk9PTV9PVVRfSE9US0VZX0RBVEEiLCJSRVNFVF9aT09NX0hPVEtFWV9EQVRBIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYywrQkFBK0I7QUFDcEQsU0FBU0MsVUFBVSxFQUFFQyxhQUFhLEVBQUVDLE9BQU8sUUFBUSxnQkFBZ0I7QUFFbkUsTUFBTUMsb0JBQW9CO0lBRXhCOzs7O0dBSUMsR0FDREMsZUFBZTtRQUNiLE9BQU9DLEVBQUVDLFFBQVEsQ0FBRUMsT0FBT0MsU0FBUyxDQUFDQyxRQUFRLEVBQUU7SUFDaEQ7SUFFQTs7OztHQUlDLEdBQ0RDLHdCQUF3QjtRQUN0QixPQUFPUCxrQkFBa0JDLGFBQWEsS0FBSyxZQUFZO0lBQ3pEO0lBRUE7Ozs7OztHQU1DLEdBQ0RPLGVBQWUsQ0FBRUMsT0FBY0M7UUFFN0IsK0VBQStFO1FBQy9FLE1BQU1DLFVBQVVELFNBQVNaLGNBQWNjLFVBQVUsR0FBR2QsY0FBY2UsU0FBUztRQUMzRSxNQUFNQyxVQUFVZCxrQkFBa0JPLHNCQUFzQjtRQUV4RCxtQkFBbUI7UUFDbkIsT0FBT0UsS0FBSyxDQUFFSyxRQUFTLElBQUloQixjQUFjaUIsVUFBVSxDQUFFTixPQUFPRTtJQUM5RDtJQUVBOztHQUVDLEdBQ0RLLG9CQUFvQixDQUFFUDtRQUNwQixNQUFNSyxVQUFVZCxrQkFBa0JPLHNCQUFzQjtRQUV4RCw2RUFBNkU7UUFDN0UsbUJBQW1CO1FBQ25CLE9BQU9FLEtBQUssQ0FBRUssUUFBUyxJQUFJaEIsY0FBY2lCLFVBQVUsQ0FBRU4sT0FBT1gsY0FBY21CLEtBQUs7SUFDakY7SUFFQSw0RkFBNEY7SUFDNUYsZ0dBQWdHO0lBQ2hHQyxxQkFBcUIsSUFBSXJCLFdBQVk7UUFDbkNzQixxQkFBcUI7WUFBRSxJQUFJdkIsU0FBVTtZQUFpQixJQUFJQSxTQUFVO1NBQWlCO1FBQ3JGd0IsWUFBWTtRQUNaQyxVQUFVO1FBQ1ZDLFFBQVE7SUFDVjtJQUVBQyxzQkFBc0IsSUFBSTFCLFdBQVk7UUFDcENzQixxQkFBcUI7WUFBRSxJQUFJdkIsU0FBVTtZQUFnQixJQUFJQSxTQUFVO1NBQWdCO1FBQ25Gd0IsWUFBWTtRQUNaQyxVQUFVO1FBQ1ZDLFFBQVE7SUFDVjtJQUVBRSx3QkFBd0IsSUFBSTNCLFdBQVk7UUFDdENzQixxQkFBcUI7WUFBRSxJQUFJdkIsU0FBVTtZQUFZLElBQUlBLFNBQVU7U0FBWTtRQUMzRXdCLFlBQVk7UUFDWkMsVUFBVTtRQUNWQyxRQUFRO0lBQ1Y7QUFDRjtBQUVBdkIsUUFBUTBCLFFBQVEsQ0FBRSxxQkFBcUJ6QjtBQUN2QyxlQUFlQSxrQkFBa0IifQ==