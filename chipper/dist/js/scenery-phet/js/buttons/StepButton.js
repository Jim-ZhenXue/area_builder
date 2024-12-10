// Copyright 2014-2024, University of Colorado Boulder
/**
 * Generalized button for stepping forward or back.  While this class is not private, clients will generally use the
 * convenience subclasses: StepForwardButton and StepBackwardButton
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../../kite/js/imports.js';
import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../../phet-core/js/optionize.js';
import { HBox, Path, Rectangle } from '../../../scenery/js/imports.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
const DEFAULT_RADIUS = 20;
const MARGIN_COEFFICIENT = 10.5 / DEFAULT_RADIUS;
let StepButton = class StepButton extends RoundPushButton {
    constructor(providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // these options are used in computation of other default options
        const options = optionize()({
            // SelfOptions
            radius: DEFAULT_RADIUS,
            direction: 'forward',
            iconFill: 'black',
            // RoundPushButtonOptions
            fireOnHold: true,
            soundPlayer: sharedSoundPlayers.get('stepForward'),
            innerContent: SceneryPhetStrings.a11y.stepButton.stepForwardStringProperty,
            appendDescription: true
        }, providedOptions);
        assert && assert(options.direction === 'forward' || options.direction === 'backward', `unsupported direction: ${options.direction}`);
        // shift the content to center align, assumes 3D appearance and specific content
        options.xContentOffset = options.direction === 'forward' ? 0.075 * options.radius : -0.15 * options.radius;
        assert && assert(options.xMargin === undefined && options.yMargin === undefined, 'StepButton sets margins');
        options.xMargin = options.yMargin = options.radius * MARGIN_COEFFICIENT;
        // step icon is sized relative to the radius
        const BAR_WIDTH = options.radius * 0.15;
        const BAR_HEIGHT = options.radius * 0.9;
        const TRIANGLE_WIDTH = options.radius * 0.65;
        const TRIANGLE_HEIGHT = BAR_HEIGHT;
        // icon, in 'forward' orientation
        const barPath = new Rectangle(0, 0, BAR_WIDTH, BAR_HEIGHT, {
            fill: options.iconFill
        });
        const trianglePath = new Path(new Shape().moveTo(0, TRIANGLE_HEIGHT / 2).lineTo(TRIANGLE_WIDTH, 0).lineTo(0, -TRIANGLE_HEIGHT / 2).close(), {
            fill: options.iconFill
        });
        options.content = new HBox({
            children: [
                barPath,
                trianglePath
            ],
            spacing: BAR_WIDTH,
            sizable: false,
            rotation: options.direction === 'forward' ? 0 : Math.PI
        });
        super(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'StepButton', this);
    }
};
export { StepButton as default };
sceneryPhet.register('StepButton', StepButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1N0ZXBCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR2VuZXJhbGl6ZWQgYnV0dG9uIGZvciBzdGVwcGluZyBmb3J3YXJkIG9yIGJhY2suICBXaGlsZSB0aGlzIGNsYXNzIGlzIG5vdCBwcml2YXRlLCBjbGllbnRzIHdpbGwgZ2VuZXJhbGx5IHVzZSB0aGVcbiAqIGNvbnZlbmllbmNlIHN1YmNsYXNzZXM6IFN0ZXBGb3J3YXJkQnV0dG9uIGFuZCBTdGVwQmFja3dhcmRCdXR0b25cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBIQm94LCBQYXRoLCBSZWN0YW5nbGUsIFRQYWludCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uLCB7IFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9Sb3VuZFB1c2hCdXR0b24uanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcblxuY29uc3QgREVGQVVMVF9SQURJVVMgPSAyMDtcbmNvbnN0IE1BUkdJTl9DT0VGRklDSUVOVCA9IDEwLjUgLyBERUZBVUxUX1JBRElVUztcblxudHlwZSBEaXJlY3Rpb24gPSAnZm9yd2FyZCcgfCAnYmFja3dhcmQnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICByYWRpdXM/OiBudW1iZXI7XG4gIGRpcmVjdGlvbj86IERpcmVjdGlvbjtcbiAgaWNvbkZpbGw/OiBUUGFpbnQ7XG59O1xuXG5leHBvcnQgdHlwZSBTdGVwQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcbiAgU3RyaWN0T21pdDxSb3VuZFB1c2hCdXR0b25PcHRpb25zLCAnY29udGVudCcgfCAneENvbnRlbnRPZmZzZXQnIHwgJ3hNYXJnaW4nIHwgJ3lNYXJnaW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RlcEJ1dHRvbiBleHRlbmRzIFJvdW5kUHVzaEJ1dHRvbiB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBTdGVwQnV0dG9uT3B0aW9ucyApIHtcblxuICAgIC8vIHRoZXNlIG9wdGlvbnMgYXJlIHVzZWQgaW4gY29tcHV0YXRpb24gb2Ygb3RoZXIgZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdGVwQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJvdW5kUHVzaEJ1dHRvbk9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIHJhZGl1czogREVGQVVMVF9SQURJVVMsXG4gICAgICBkaXJlY3Rpb246ICdmb3J3YXJkJyxcbiAgICAgIGljb25GaWxsOiAnYmxhY2snLFxuXG4gICAgICAvLyBSb3VuZFB1c2hCdXR0b25PcHRpb25zXG4gICAgICBmaXJlT25Ib2xkOiB0cnVlLFxuICAgICAgc291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdzdGVwRm9yd2FyZCcgKSxcbiAgICAgIGlubmVyQ29udGVudDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuc3RlcEJ1dHRvbi5zdGVwRm9yd2FyZFN0cmluZ1Byb3BlcnR5LFxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZGlyZWN0aW9uID09PSAnZm9yd2FyZCcgfHwgb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdiYWNrd2FyZCcsXG4gICAgICBgdW5zdXBwb3J0ZWQgZGlyZWN0aW9uOiAke29wdGlvbnMuZGlyZWN0aW9ufWAgKTtcblxuICAgIC8vIHNoaWZ0IHRoZSBjb250ZW50IHRvIGNlbnRlciBhbGlnbiwgYXNzdW1lcyAzRCBhcHBlYXJhbmNlIGFuZCBzcGVjaWZpYyBjb250ZW50XG4gICAgb3B0aW9ucy54Q29udGVudE9mZnNldCA9ICggb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdmb3J3YXJkJyApID8gKCAwLjA3NSAqIG9wdGlvbnMucmFkaXVzICkgOiAoIC0wLjE1ICogb3B0aW9ucy5yYWRpdXMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueE1hcmdpbiA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMueU1hcmdpbiA9PT0gdW5kZWZpbmVkLCAnU3RlcEJ1dHRvbiBzZXRzIG1hcmdpbnMnICk7XG4gICAgb3B0aW9ucy54TWFyZ2luID0gb3B0aW9ucy55TWFyZ2luID0gb3B0aW9ucy5yYWRpdXMgKiBNQVJHSU5fQ09FRkZJQ0lFTlQ7XG5cbiAgICAvLyBzdGVwIGljb24gaXMgc2l6ZWQgcmVsYXRpdmUgdG8gdGhlIHJhZGl1c1xuICAgIGNvbnN0IEJBUl9XSURUSCA9IG9wdGlvbnMucmFkaXVzICogMC4xNTtcbiAgICBjb25zdCBCQVJfSEVJR0hUID0gb3B0aW9ucy5yYWRpdXMgKiAwLjk7XG4gICAgY29uc3QgVFJJQU5HTEVfV0lEVEggPSBvcHRpb25zLnJhZGl1cyAqIDAuNjU7XG4gICAgY29uc3QgVFJJQU5HTEVfSEVJR0hUID0gQkFSX0hFSUdIVDtcblxuICAgIC8vIGljb24sIGluICdmb3J3YXJkJyBvcmllbnRhdGlvblxuICAgIGNvbnN0IGJhclBhdGggPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBCQVJfV0lEVEgsIEJBUl9IRUlHSFQsIHsgZmlsbDogb3B0aW9ucy5pY29uRmlsbCB9ICk7XG4gICAgY29uc3QgdHJpYW5nbGVQYXRoID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXG4gICAgICAubW92ZVRvKCAwLCBUUklBTkdMRV9IRUlHSFQgLyAyIClcbiAgICAgIC5saW5lVG8oIFRSSUFOR0xFX1dJRFRILCAwIClcbiAgICAgIC5saW5lVG8oIDAsIC1UUklBTkdMRV9IRUlHSFQgLyAyIClcbiAgICAgIC5jbG9zZSgpLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLmljb25GaWxsXG4gICAgfSApO1xuICAgIG9wdGlvbnMuY29udGVudCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogWyBiYXJQYXRoLCB0cmlhbmdsZVBhdGggXSxcbiAgICAgIHNwYWNpbmc6IEJBUl9XSURUSCxcbiAgICAgIHNpemFibGU6IGZhbHNlLFxuICAgICAgcm90YXRpb246ICggb3B0aW9ucy5kaXJlY3Rpb24gPT09ICdmb3J3YXJkJyApID8gMCA6IE1hdGguUElcbiAgICB9ICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdTdGVwQnV0dG9uJywgdGhpcyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU3RlcEJ1dHRvbicsIFN0ZXBCdXR0b24gKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiSEJveCIsIlBhdGgiLCJSZWN0YW5nbGUiLCJSb3VuZFB1c2hCdXR0b24iLCJzaGFyZWRTb3VuZFBsYXllcnMiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkRFRkFVTFRfUkFESVVTIiwiTUFSR0lOX0NPRUZGSUNJRU5UIiwiU3RlcEJ1dHRvbiIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJyYWRpdXMiLCJkaXJlY3Rpb24iLCJpY29uRmlsbCIsImZpcmVPbkhvbGQiLCJzb3VuZFBsYXllciIsImdldCIsImlubmVyQ29udGVudCIsImExMXkiLCJzdGVwQnV0dG9uIiwic3RlcEZvcndhcmRTdHJpbmdQcm9wZXJ0eSIsImFwcGVuZERlc2NyaXB0aW9uIiwiYXNzZXJ0IiwieENvbnRlbnRPZmZzZXQiLCJ4TWFyZ2luIiwidW5kZWZpbmVkIiwieU1hcmdpbiIsIkJBUl9XSURUSCIsIkJBUl9IRUlHSFQiLCJUUklBTkdMRV9XSURUSCIsIlRSSUFOR0xFX0hFSUdIVCIsImJhclBhdGgiLCJmaWxsIiwidHJpYW5nbGVQYXRoIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwic2l6YWJsZSIsInJvdGF0aW9uIiwiTWF0aCIsIlBJIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwi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