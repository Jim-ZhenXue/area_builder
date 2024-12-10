// Copyright 2016-2024, University of Colorado Boulder
/**
 * A general button, typically used to reset something.
 * Drawn programmatically, does not use any image files.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Path } from '../../../scenery/js/imports.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ResetShape from '../ResetShape.js';
import sceneryPhet from '../sceneryPhet.js';
let ResetButton = class ResetButton extends RoundPushButton {
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // radius is used in computation of defaults for other options
        const BUTTON_RADIUS = providedOptions && providedOptions.radius ? providedOptions.radius : 24;
        const options = optionize()({
            // SelfOptions
            radius: BUTTON_RADIUS,
            arrowColor: 'black',
            // RoundPushButtonOptions
            baseColor: 'white',
            xMargin: 6,
            yMargin: 6,
            // NOTE: this should be handled by RoundButton.ThreeDAppearanceStrategy, see https://github.com/phetsims/sun/issues/236
            // The icon doesn't look right when perfectly centered, account for that here, and see docs in RoundButton.
            // The multiplier values were empirically determined.
            xContentOffset: -0.03 * BUTTON_RADIUS,
            yContentOffset: -0.0125 * BUTTON_RADIUS,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ResetButton'
        }, providedOptions);
        // icon, with bounds adjusted so that center of circle appears to be centered on button, see sun#235
        const resetShape = new ResetShape(options.radius);
        const resetIcon = new Path(resetShape, {
            fill: options.arrowColor
        });
        const reflectedIcon = new Path(resetShape.transformed(Matrix3.scaling(-1, -1)));
        resetIcon.localBounds = resetIcon.localBounds.union(reflectedIcon.localBounds);
        options.content = resetIcon;
        super(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ResetButton', this);
    }
};
export { ResetButton as default };
sceneryPhet.register('ResetButton', ResetButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgZ2VuZXJhbCBidXR0b24sIHR5cGljYWxseSB1c2VkIHRvIHJlc2V0IHNvbWV0aGluZy5cbiAqIERyYXduIHByb2dyYW1tYXRpY2FsbHksIGRvZXMgbm90IHVzZSBhbnkgaW1hZ2UgZmlsZXMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBQYXRoLCBUQ29sb3IgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJvdW5kUHVzaEJ1dHRvbiwgeyBSb3VuZFB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUm91bmRQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgUmVzZXRTaGFwZSBmcm9tICcuLi9SZXNldFNoYXBlLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi9zY2VuZXJ5UGhldC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHJhZGl1cz86IG51bWJlcjtcbiAgYXJyb3dDb2xvcj86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIFJlc2V0QnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxSb3VuZFB1c2hCdXR0b25PcHRpb25zLCAnY29udGVudCc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNldEJ1dHRvbiBleHRlbmRzIFJvdW5kUHVzaEJ1dHRvbiB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBSZXNldEJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICAvLyByYWRpdXMgaXMgdXNlZCBpbiBjb21wdXRhdGlvbiBvZiBkZWZhdWx0cyBmb3Igb3RoZXIgb3B0aW9uc1xuICAgIGNvbnN0IEJVVFRPTl9SQURJVVMgPSAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMucmFkaXVzICkgPyBwcm92aWRlZE9wdGlvbnMucmFkaXVzIDogMjQ7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlc2V0QnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIHJhZGl1czogQlVUVE9OX1JBRElVUyxcbiAgICAgIGFycm93Q29sb3I6ICdibGFjaycsXG5cbiAgICAgIC8vIFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnNcbiAgICAgIGJhc2VDb2xvcjogJ3doaXRlJyxcbiAgICAgIHhNYXJnaW46IDYsXG4gICAgICB5TWFyZ2luOiA2LFxuXG4gICAgICAvLyBOT1RFOiB0aGlzIHNob3VsZCBiZSBoYW5kbGVkIGJ5IFJvdW5kQnV0dG9uLlRocmVlREFwcGVhcmFuY2VTdHJhdGVneSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzIzNlxuICAgICAgLy8gVGhlIGljb24gZG9lc24ndCBsb29rIHJpZ2h0IHdoZW4gcGVyZmVjdGx5IGNlbnRlcmVkLCBhY2NvdW50IGZvciB0aGF0IGhlcmUsIGFuZCBzZWUgZG9jcyBpbiBSb3VuZEJ1dHRvbi5cbiAgICAgIC8vIFRoZSBtdWx0aXBsaWVyIHZhbHVlcyB3ZXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXG4gICAgICB4Q29udGVudE9mZnNldDogLTAuMDMgKiBCVVRUT05fUkFESVVTLFxuICAgICAgeUNvbnRlbnRPZmZzZXQ6IC0wLjAxMjUgKiBCVVRUT05fUkFESVVTLFxuXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdSZXNldEJ1dHRvbidcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGljb24sIHdpdGggYm91bmRzIGFkanVzdGVkIHNvIHRoYXQgY2VudGVyIG9mIGNpcmNsZSBhcHBlYXJzIHRvIGJlIGNlbnRlcmVkIG9uIGJ1dHRvbiwgc2VlIHN1biMyMzVcbiAgICBjb25zdCByZXNldFNoYXBlID0gbmV3IFJlc2V0U2hhcGUoIG9wdGlvbnMucmFkaXVzICk7XG4gICAgY29uc3QgcmVzZXRJY29uID0gbmV3IFBhdGgoIHJlc2V0U2hhcGUsIHsgZmlsbDogb3B0aW9ucy5hcnJvd0NvbG9yIH0gKTtcbiAgICBjb25zdCByZWZsZWN0ZWRJY29uID0gbmV3IFBhdGgoIHJlc2V0U2hhcGUudHJhbnNmb3JtZWQoIE1hdHJpeDMuc2NhbGluZyggLTEsIC0xICkgKSApO1xuICAgIHJlc2V0SWNvbi5sb2NhbEJvdW5kcyA9IHJlc2V0SWNvbi5sb2NhbEJvdW5kcy51bmlvbiggcmVmbGVjdGVkSWNvbi5sb2NhbEJvdW5kcyApO1xuXG4gICAgb3B0aW9ucy5jb250ZW50ID0gcmVzZXRJY29uO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnUmVzZXRCdXR0b24nLCB0aGlzICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdSZXNldEJ1dHRvbicsIFJlc2V0QnV0dG9uICk7Il0sIm5hbWVzIjpbIk1hdHJpeDMiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiUGF0aCIsIlJvdW5kUHVzaEJ1dHRvbiIsIlRhbmRlbSIsIlJlc2V0U2hhcGUiLCJzY2VuZXJ5UGhldCIsIlJlc2V0QnV0dG9uIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93IiwiQlVUVE9OX1JBRElVUyIsInJhZGl1cyIsIm9wdGlvbnMiLCJhcnJvd0NvbG9yIiwiYmFzZUNvbG9yIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ4Q29udGVudE9mZnNldCIsInlDb250ZW50T2Zmc2V0IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicmVzZXRTaGFwZSIsInJlc2V0SWNvbiIsImZpbGwiLCJyZWZsZWN0ZWRJY29uIiwidHJhbnNmb3JtZWQiLCJzY2FsaW5nIiwibG9jYWxCb3VuZHMiLCJ1bmlvbiIsImNvbnRlbnQiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0Msc0JBQXNCLDBEQUEwRDtBQUN2RixPQUFPQyxlQUFlLHFDQUFxQztBQUUzRCxTQUFTQyxJQUFJLFFBQWdCLGlDQUFpQztBQUM5RCxPQUFPQyxxQkFBaUQsNkNBQTZDO0FBQ3JHLE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLGdCQUFnQixtQkFBbUI7QUFDMUMsT0FBT0MsaUJBQWlCLG9CQUFvQjtBQVM3QixJQUFBLEFBQU1DLGNBQU4sTUFBTUEsb0JBQW9CSjtJQUV2QyxZQUFvQkssZUFBb0MsQ0FBRztZQXFDL0NDLHNDQUFBQSxzQkFBQUE7UUFuQ1YsOERBQThEO1FBQzlELE1BQU1DLGdCQUFnQixBQUFFRixtQkFBbUJBLGdCQUFnQkcsTUFBTSxHQUFLSCxnQkFBZ0JHLE1BQU0sR0FBRztRQUUvRixNQUFNQyxVQUFVWCxZQUFzRTtZQUVwRixjQUFjO1lBQ2RVLFFBQVFEO1lBQ1JHLFlBQVk7WUFFWix5QkFBeUI7WUFDekJDLFdBQVc7WUFDWEMsU0FBUztZQUNUQyxTQUFTO1lBRVQsdUhBQXVIO1lBQ3ZILDJHQUEyRztZQUMzRyxxREFBcUQ7WUFDckRDLGdCQUFnQixDQUFDLE9BQU9QO1lBQ3hCUSxnQkFBZ0IsQ0FBQyxTQUFTUjtZQUUxQlMsUUFBUWYsT0FBT2dCLFFBQVE7WUFDdkJDLGtCQUFrQjtRQUNwQixHQUFHYjtRQUVILG9HQUFvRztRQUNwRyxNQUFNYyxhQUFhLElBQUlqQixXQUFZTyxRQUFRRCxNQUFNO1FBQ2pELE1BQU1ZLFlBQVksSUFBSXJCLEtBQU1vQixZQUFZO1lBQUVFLE1BQU1aLFFBQVFDLFVBQVU7UUFBQztRQUNuRSxNQUFNWSxnQkFBZ0IsSUFBSXZCLEtBQU1vQixXQUFXSSxXQUFXLENBQUUzQixRQUFRNEIsT0FBTyxDQUFFLENBQUMsR0FBRyxDQUFDO1FBQzlFSixVQUFVSyxXQUFXLEdBQUdMLFVBQVVLLFdBQVcsQ0FBQ0MsS0FBSyxDQUFFSixjQUFjRyxXQUFXO1FBRTlFaEIsUUFBUWtCLE9BQU8sR0FBR1A7UUFFbEIsS0FBSyxDQUFFWDtRQUVQLG1HQUFtRztRQUNuR21CLFlBQVV0QixlQUFBQSxPQUFPdUIsSUFBSSxzQkFBWHZCLHVCQUFBQSxhQUFhd0IsT0FBTyxzQkFBcEJ4Qix1Q0FBQUEscUJBQXNCeUIsZUFBZSxxQkFBckN6QixxQ0FBdUMwQixNQUFNLEtBQUluQyxpQkFBaUJvQyxlQUFlLENBQUUsZ0JBQWdCLGVBQWUsSUFBSTtJQUNsSTtBQUNGO0FBekNBLFNBQXFCN0IseUJBeUNwQjtBQUVERCxZQUFZK0IsUUFBUSxDQUFFLGVBQWU5QiJ9