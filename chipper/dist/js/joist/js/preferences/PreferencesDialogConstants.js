// Copyright 2022-2024, University of Colorado Boulder
/**
 * Styling and layout option constants for preference dialog components
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */ import Dimension2 from '../../../dot/js/Dimension2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../tandem/js/Tandem.js';
const TITLE_FONT = new PhetFont({
    weight: 'bold',
    size: 16
});
const DESCRIPTION_FONT = new PhetFont(16);
const PreferencesDialogConstants = {
    TOGGLE_SWITCH_OPTIONS: {
        size: new Dimension2(36, 18),
        trackFillRight: '#64bd5a',
        // enabled:true by default, but disable if fuzzing when supporting voicing
        enabled: !(phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing),
        // voicing
        voicingIgnoreVoicingManagerProperties: true,
        // phet-io
        tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    },
    CONTROL_LABEL_OPTIONS: {
        font: TITLE_FONT,
        maxWidth: 360
    },
    CONTROL_DESCRIPTION_OPTIONS: {
        font: DESCRIPTION_FONT,
        lineWrap: 'stretch'
    },
    TOGGLE_SWITCH_LABEL_OPTIONS: {
        font: DESCRIPTION_FONT
    }
};
export default PreferencesDialogConstants;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFN0eWxpbmcgYW5kIGxheW91dCBvcHRpb24gY29uc3RhbnRzIGZvciBwcmVmZXJlbmNlIGRpYWxvZyBjb21wb25lbnRzXG4gKlxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKlxuICovXG5cbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcblxuY29uc3QgVElUTEVfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyB3ZWlnaHQ6ICdib2xkJywgc2l6ZTogMTYgfSApO1xuY29uc3QgREVTQ1JJUFRJT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcblxuXG5jb25zdCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyA9IHtcbiAgVE9HR0xFX1NXSVRDSF9PUFRJT05TOiB7XG4gICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDM2LCAxOCApLFxuICAgIHRyYWNrRmlsbFJpZ2h0OiAnIzY0YmQ1YScsXG4gICAgLy8gZW5hYmxlZDp0cnVlIGJ5IGRlZmF1bHQsIGJ1dCBkaXNhYmxlIGlmIGZ1enppbmcgd2hlbiBzdXBwb3J0aW5nIHZvaWNpbmdcbiAgICBlbmFibGVkOiAhKCBwaGV0LmNoaXBwZXIuaXNGdXp6RW5hYmxlZCgpICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuc3VwcG9ydHNWb2ljaW5nICksXG5cblxuICAgIC8vIHZvaWNpbmdcbiAgICB2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzOiB0cnVlLFxuXG4gICAgLy8gcGhldC1pb1xuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxuICB9LFxuICBDT05UUk9MX0xBQkVMX09QVElPTlM6IHtcbiAgICBmb250OiBUSVRMRV9GT05ULFxuICAgIG1heFdpZHRoOiAzNjBcbiAgfSxcbiAgQ09OVFJPTF9ERVNDUklQVElPTl9PUFRJT05TOiB7XG4gICAgZm9udDogREVTQ1JJUFRJT05fRk9OVCxcbiAgICBsaW5lV3JhcDogJ3N0cmV0Y2gnIGFzIGNvbnN0XG4gIH0sXG4gIFRPR0dMRV9TV0lUQ0hfTEFCRUxfT1BUSU9OUzoge1xuICAgIGZvbnQ6IERFU0NSSVBUSU9OX0ZPTlRcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50czsiXSwibmFtZXMiOlsiRGltZW5zaW9uMiIsIlBoZXRGb250IiwiVGFuZGVtIiwiVElUTEVfRk9OVCIsIndlaWdodCIsInNpemUiLCJERVNDUklQVElPTl9GT05UIiwiUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMiLCJUT0dHTEVfU1dJVENIX09QVElPTlMiLCJ0cmFja0ZpbGxSaWdodCIsImVuYWJsZWQiLCJwaGV0IiwiY2hpcHBlciIsImlzRnV6ekVuYWJsZWQiLCJxdWVyeVBhcmFtZXRlcnMiLCJzdXBwb3J0c1ZvaWNpbmciLCJ2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzIiwidGFuZGVtIiwiT1BUX09VVCIsIkNPTlRST0xfTEFCRUxfT1BUSU9OUyIsImZvbnQiLCJtYXhXaWR0aCIsIkNPTlRST0xfREVTQ1JJUFRJT05fT1BUSU9OUyIsImxpbmVXcmFwIiwiVE9HR0xFX1NXSVRDSF9MQUJFTF9PUFRJT05TIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxnQkFBZ0IsZ0NBQWdDO0FBQ3ZELE9BQU9DLGNBQWMsdUNBQXVDO0FBQzVELE9BQU9DLFlBQVksK0JBQStCO0FBRWxELE1BQU1DLGFBQWEsSUFBSUYsU0FBVTtJQUFFRyxRQUFRO0lBQVFDLE1BQU07QUFBRztBQUM1RCxNQUFNQyxtQkFBbUIsSUFBSUwsU0FBVTtBQUd2QyxNQUFNTSw2QkFBNkI7SUFDakNDLHVCQUF1QjtRQUNyQkgsTUFBTSxJQUFJTCxXQUFZLElBQUk7UUFDMUJTLGdCQUFnQjtRQUNoQiwwRUFBMEU7UUFDMUVDLFNBQVMsQ0FBR0MsQ0FBQUEsS0FBS0MsT0FBTyxDQUFDQyxhQUFhLE1BQU1GLEtBQUtDLE9BQU8sQ0FBQ0UsZUFBZSxDQUFDQyxlQUFlLEFBQUQ7UUFHdkYsVUFBVTtRQUNWQyx1Q0FBdUM7UUFFdkMsVUFBVTtRQUNWQyxRQUFRZixPQUFPZ0IsT0FBTyxDQUFDLCtIQUErSDtJQUN4SjtJQUNBQyx1QkFBdUI7UUFDckJDLE1BQU1qQjtRQUNOa0IsVUFBVTtJQUNaO0lBQ0FDLDZCQUE2QjtRQUMzQkYsTUFBTWQ7UUFDTmlCLFVBQVU7SUFDWjtJQUNBQyw2QkFBNkI7UUFDM0JKLE1BQU1kO0lBQ1I7QUFFRjtBQUVBLGVBQWVDLDJCQUEyQiJ9