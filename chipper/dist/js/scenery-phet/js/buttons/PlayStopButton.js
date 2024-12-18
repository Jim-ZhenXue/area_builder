// Copyright 2021-2024, University of Colorado Boulder
/**
 * Button for starting/stopping some behavior. Unlike the PlayPauseButton, this indicates that play will re-start
 * from the beginning after switch from play to stop.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Path } from '../../../scenery/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetConstants from '../SceneryPhetConstants.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
import StopIconShape from '../StopIconShape.js';
import PlayControlButton from './PlayControlButton.js';
let PlayStopButton = class PlayStopButton extends PlayControlButton {
    constructor(isPlayingProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // PlayStopButtonOptions
            radius: SceneryPhetConstants.PLAY_CONTROL_BUTTON_RADIUS,
            endPlayingLabel: SceneryPhetStrings.a11y.playControlButton.stopStringProperty
        }, providedOptions);
        // icon is sized relative to radius
        const stopWidth = options.radius * 0.75;
        const stopPath = new Path(new StopIconShape(stopWidth), {
            fill: 'black'
        });
        super(isPlayingProperty, stopPath, options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'PlayStopButton', this);
    }
};
export { PlayStopButton as default };
sceneryPhet.register('PlayStopButton', PlayStopButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1BsYXlTdG9wQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJ1dHRvbiBmb3Igc3RhcnRpbmcvc3RvcHBpbmcgc29tZSBiZWhhdmlvci4gVW5saWtlIHRoZSBQbGF5UGF1c2VCdXR0b24sIHRoaXMgaW5kaWNhdGVzIHRoYXQgcGxheSB3aWxsIHJlLXN0YXJ0XG4gKiBmcm9tIHRoZSBiZWdpbm5pbmcgYWZ0ZXIgc3dpdGNoIGZyb20gcGxheSB0byBzdG9wLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgUGF0aCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0Q29uc3RhbnRzIGZyb20gJy4uL1NjZW5lcnlQaGV0Q29uc3RhbnRzLmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcbmltcG9ydCBTdG9wSWNvblNoYXBlIGZyb20gJy4uL1N0b3BJY29uU2hhcGUuanMnO1xuaW1wb3J0IFBsYXlDb250cm9sQnV0dG9uLCB7IFBsYXlDb250cm9sQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vUGxheUNvbnRyb2xCdXR0b24uanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgUGxheVN0b3BCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQbGF5Q29udHJvbEJ1dHRvbk9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXlTdG9wQnV0dG9uIGV4dGVuZHMgUGxheUNvbnRyb2xCdXR0b24ge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaXNQbGF5aW5nUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM/OiBQbGF5U3RvcEJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBsYXlTdG9wQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBsYXlDb250cm9sQnV0dG9uT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBQbGF5U3RvcEJ1dHRvbk9wdGlvbnNcbiAgICAgIHJhZGl1czogU2NlbmVyeVBoZXRDb25zdGFudHMuUExBWV9DT05UUk9MX0JVVFRPTl9SQURJVVMsXG4gICAgICBlbmRQbGF5aW5nTGFiZWw6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LnBsYXlDb250cm9sQnV0dG9uLnN0b3BTdHJpbmdQcm9wZXJ0eVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gaWNvbiBpcyBzaXplZCByZWxhdGl2ZSB0byByYWRpdXNcbiAgICBjb25zdCBzdG9wV2lkdGggPSBvcHRpb25zLnJhZGl1cyAqIDAuNzU7XG4gICAgY29uc3Qgc3RvcFBhdGggPSBuZXcgUGF0aCggbmV3IFN0b3BJY29uU2hhcGUoIHN0b3BXaWR0aCApLCB7IGZpbGw6ICdibGFjaycgfSApO1xuXG4gICAgc3VwZXIoIGlzUGxheWluZ1Byb3BlcnR5LCBzdG9wUGF0aCwgb3B0aW9ucyApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdQbGF5U3RvcEJ1dHRvbicsIHRoaXMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1BsYXlTdG9wQnV0dG9uJywgUGxheVN0b3BCdXR0b24gKTsiXSwibmFtZXMiOlsiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsIlBhdGgiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0Q29uc3RhbnRzIiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiU3RvcEljb25TaGFwZSIsIlBsYXlDb250cm9sQnV0dG9uIiwiUGxheVN0b3BCdXR0b24iLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJyYWRpdXMiLCJQTEFZX0NPTlRST0xfQlVUVE9OX1JBRElVUyIsImVuZFBsYXlpbmdMYWJlbCIsImExMXkiLCJwbGF5Q29udHJvbEJ1dHRvbiIsInN0b3BTdHJpbmdQcm9wZXJ0eSIsInN0b3BXaWR0aCIsInN0b3BQYXRoIiwiZmlsbCIsImFzc2VydCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FHRCxPQUFPQSxzQkFBc0IsMERBQTBEO0FBQ3ZGLE9BQU9DLGVBQXFDLHFDQUFxQztBQUNqRixTQUFTQyxJQUFJLFFBQVEsaUNBQWlDO0FBQ3RELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFDNUMsT0FBT0MsMEJBQTBCLDZCQUE2QjtBQUM5RCxPQUFPQyx3QkFBd0IsMkJBQTJCO0FBQzFELE9BQU9DLG1CQUFtQixzQkFBc0I7QUFDaEQsT0FBT0MsdUJBQXFELHlCQUF5QjtBQU10RSxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QkQ7SUFFMUMsWUFBb0JFLGlCQUFvQyxFQUFFQyxlQUF1QyxDQUFHO1lBZ0J4RkMsc0NBQUFBLHNCQUFBQTtRQWRWLE1BQU1DLFVBQVVYLFlBQTJFO1lBRXpGLHdCQUF3QjtZQUN4QlksUUFBUVQscUJBQXFCVSwwQkFBMEI7WUFDdkRDLGlCQUFpQlYsbUJBQW1CVyxJQUFJLENBQUNDLGlCQUFpQixDQUFDQyxrQkFBa0I7UUFDL0UsR0FBR1I7UUFFSCxtQ0FBbUM7UUFDbkMsTUFBTVMsWUFBWVAsUUFBUUMsTUFBTSxHQUFHO1FBQ25DLE1BQU1PLFdBQVcsSUFBSWxCLEtBQU0sSUFBSUksY0FBZWEsWUFBYTtZQUFFRSxNQUFNO1FBQVE7UUFFM0UsS0FBSyxDQUFFWixtQkFBbUJXLFVBQVVSO1FBRXBDLG1HQUFtRztRQUNuR1UsWUFBVVgsZUFBQUEsT0FBT1ksSUFBSSxzQkFBWFosdUJBQUFBLGFBQWFhLE9BQU8sc0JBQXBCYix1Q0FBQUEscUJBQXNCYyxlQUFlLHFCQUFyQ2QscUNBQXVDZSxNQUFNLEtBQUkxQixpQkFBaUIyQixlQUFlLENBQUUsZ0JBQWdCLGtCQUFrQixJQUFJO0lBQ3JJO0FBQ0Y7QUFwQkEsU0FBcUJuQiw0QkFvQnBCO0FBRURMLFlBQVl5QixRQUFRLENBQUUsa0JBQWtCcEIifQ==