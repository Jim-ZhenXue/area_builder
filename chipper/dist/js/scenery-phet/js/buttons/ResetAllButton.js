// Copyright 2013-2024, University of Colorado Boulder
/**
 * Reset All button, typically used to reset everything ('reset all') on a Screen.
 * Extends ResetButton, adding things that are specific to 'reset all'.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../axon/js/Property.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { HotkeyData, KeyboardListener, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../utterance-queue/js/ActivationUtterance.js';
import TextKeyNode from '../keyboard/TextKeyNode.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import SceneryPhetConstants from '../SceneryPhetConstants.js';
import SceneryPhetStrings from '../SceneryPhetStrings.js';
import ResetButton from './ResetButton.js';
const MARGIN_COEFFICIENT = 5 / SceneryPhetConstants.DEFAULT_BUTTON_RADIUS;
const isResettingAllProperty = new TinyProperty(false);
let ResetAllButton = class ResetAllButton extends ResetButton {
    interruptScreenViewInput() {
        const screenViews = this.getParentScreenViews();
        for(let i = 0; i < screenViews.length; i++){
            screenViews[i].interruptSubtreeInput();
        }
    }
    getParentScreenViews() {
        var _window_phet_joist, _window_phet;
        const ScreenViewClass = (_window_phet = window.phet) == null ? void 0 : (_window_phet_joist = _window_phet.joist) == null ? void 0 : _window_phet_joist.ScreenView;
        if (!ScreenViewClass) {
            return [];
        }
        const trails = this.getTrails();
        const screenViews = [];
        for(let i = 0; i < trails.length; i++){
            const trail = trails[i];
            const nodes = trail.nodes;
            // Start at the closest ancestor
            for(let j = nodes.length - 1; j >= 0; j--){
                const node = nodes[j];
                if (node instanceof ScreenViewClass) {
                    screenViews.push(node);
                    break; // Stop at first ScreenView
                }
            }
        }
        return _.uniq(screenViews);
    }
    dispose() {
        this.disposeResetAllButton();
        super.dispose();
    }
    constructor(providedOptions){
        const options = optionize()({
            // ResetAllButtonOptions
            radius: SceneryPhetConstants.DEFAULT_BUTTON_RADIUS,
            phetioRestoreScreenStateOnReset: true,
            interruptScreenViewInput: true,
            // Fine tuned in https://github.com/phetsims/tasks/issues/985 and should not be overridden lightly.
            touchAreaDilation: 5.2,
            baseColor: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
            arrowColor: 'white',
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ResetAllButton',
            phetioDocumentation: 'The orange, round button that can be used to restore the initial state',
            // sound generation
            soundPlayer: sharedSoundPlayers.get('resetAll'),
            // pdom
            innerContent: SceneryPhetStrings.a11y.resetAll.labelStringProperty,
            // voicing
            voicingNameResponse: SceneryPhetStrings.a11y.resetAll.labelStringProperty,
            voicingContextResponse: SceneryPhetStrings.a11y.voicing.resetAll.contextResponseStringProperty
        }, providedOptions);
        assert && assert(options.xMargin === undefined && options.yMargin === undefined, 'resetAllButton sets margins');
        options.xMargin = options.yMargin = options.radius * MARGIN_COEFFICIENT;
        super(options);
        // a11y - When reset all button is fired, disable alerts so that there isn't an excessive stream of alerts while
        // many Properties are reset. When callbacks are ended for reset all, enable alerts again and announce an alert that
        // everything was reset.
        const resetUtterance = new ActivationUtterance({
            alert: SceneryPhetStrings.a11y.resetAll.alertStringProperty
        });
        let voicingEnabledOnFire = voicingUtteranceQueue.enabled;
        const ariaEnabledOnFirePerUtteranceQueueMap = new Map(); // Keep track of the enabled of each connected description UtteranceQueue
        this.pushButtonModel.isFiringProperty.lazyLink((isFiring)=>{
            // Handle voicingUtteranceQueue.
            if (isFiring) {
                // Interrupt before doing anything else.
                options.interruptScreenViewInput && this.interruptScreenViewInput();
                voicingEnabledOnFire = voicingUtteranceQueue.enabled;
                voicingUtteranceQueue.enabled = false;
                voicingUtteranceQueue.clear();
            } else {
                // Every ResetAllButton has the option to reset to the last PhET-iO state if desired.
                if (Tandem.PHET_IO_ENABLED && options.phetioRestoreScreenStateOnReset && // Even though this is Tandem.REQUIRED, still be graceful if not yet instrumented.
                this.isPhetioInstrumented()) {
                    phet.phetio.phetioEngine.phetioStateEngine.restoreStateForScreen(options.tandem);
                }
                // Restore the enabled state to each utteranceQueue after resetting.
                voicingUtteranceQueue.enabled = voicingEnabledOnFire;
                this.voicingSpeakFullResponse();
            }
            // Handle each connected description UtteranceQueue.
            this.forEachUtteranceQueue((utteranceQueue)=>{
                if (isFiring) {
                    // Mute and clear the utteranceQueue.
                    ariaEnabledOnFirePerUtteranceQueueMap.set(utteranceQueue, utteranceQueue.enabled);
                    utteranceQueue.enabled = false;
                    utteranceQueue.clear();
                } else {
                    utteranceQueue.enabled = ariaEnabledOnFirePerUtteranceQueueMap.get(utteranceQueue) || utteranceQueue.enabled;
                    utteranceQueue.addToBack(resetUtterance);
                }
            });
        });
        const keyboardListener = KeyboardListener.createGlobal(this, {
            keyStringProperties: ResetAllButton.RESET_ALL_HOTKEY_DATA.keyStringProperties,
            fire: ()=>this.pdomClick(),
            // fires on up because the listener will often call interruptSubtreeInput (interrupting this keyboard listener)
            fireOnDown: false
        });
        // Add a listener that will set and clear the static flag that signals when a reset all is in progress.
        const flagSettingListener = (isFiring)=>{
            isResettingAllProperty.value = isFiring;
        };
        this.pushButtonModel.isFiringProperty.lazyLink(flagSettingListener);
        this.disposeResetAllButton = ()=>{
            keyboardListener.dispose();
            ariaEnabledOnFirePerUtteranceQueueMap.clear();
            this.pushButtonModel.isFiringProperty.unlink(flagSettingListener);
        };
    }
};
// A flag that is true whenever any "reset all" is in progress.  This is often useful for muting sounds that shouldn't
// be triggered by model value changes that occur due to a reset.
ResetAllButton.isResettingAllProperty = isResettingAllProperty;
ResetAllButton.RESET_ALL_HOTKEY_DATA = new HotkeyData({
    // alt+r
    keyStringProperties: [
        new Property('alt+r')
    ],
    // visual label for this Hotkey in the Keyboard Help dialog
    keyboardHelpDialogLabelStringProperty: SceneryPhetStrings.keyboardHelpDialog.resetAllStringProperty,
    // PDOM description for this Hotkey in the Keyboard Help dialog
    keyboardHelpDialogPDOMLabelStringProperty: StringUtils.fillIn(SceneryPhetStrings.a11y.keyboardHelpDialog.general.resetAllDescriptionPatternStringProperty, {
        altOrOption: TextKeyNode.getAltKeyString()
    }),
    repoName: sceneryPhet.name,
    global: true
});
export { ResetAllButton as default };
sceneryPhet.register('ResetAllButton', ResetAllButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlc2V0IEFsbCBidXR0b24sIHR5cGljYWxseSB1c2VkIHRvIHJlc2V0IGV2ZXJ5dGhpbmcgKCdyZXNldCBhbGwnKSBvbiBhIFNjcmVlbi5cbiAqIEV4dGVuZHMgUmVzZXRCdXR0b24sIGFkZGluZyB0aGluZ3MgdGhhdCBhcmUgc3BlY2lmaWMgdG8gJ3Jlc2V0IGFsbCcuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgeyBIb3RrZXlEYXRhLCBLZXlib2FyZExpc3RlbmVyLCBOb2RlLCB2b2ljaW5nVXR0ZXJhbmNlUXVldWUgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBBY3RpdmF0aW9uVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9BY3RpdmF0aW9uVXR0ZXJhbmNlLmpzJztcbmltcG9ydCBUZXh0S2V5Tm9kZSBmcm9tICcuLi9rZXlib2FyZC9UZXh0S2V5Tm9kZS5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uL1BoZXRDb2xvclNjaGVtZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0Q29uc3RhbnRzIGZyb20gJy4uL1NjZW5lcnlQaGV0Q29uc3RhbnRzLmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcbmltcG9ydCBSZXNldEJ1dHRvbiwgeyBSZXNldEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuL1Jlc2V0QnV0dG9uLmpzJztcblxuY29uc3QgTUFSR0lOX0NPRUZGSUNJRU5UID0gNSAvIFNjZW5lcnlQaGV0Q29uc3RhbnRzLkRFRkFVTFRfQlVUVE9OX1JBRElVUztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBvcHRpb24gc3BlY2lmaWMgdG8gUmVzZXRBbGxCdXR0b24uIElmIHRydWUsIHRoZW4gdGhlIHJlc2V0IGFsbCBidXR0b24gd2lsbCByZXNldCBiYWNrIHRvIHRoZVxuICAvLyBwcmV2aW91cyBQaEVULWlPIHN0YXRlLCBpZiBhcHBsaWNhYmxlLlxuICBwaGV0aW9SZXN0b3JlU2NyZWVuU3RhdGVPblJlc2V0PzogYm9vbGVhbjtcblxuICAvLyBXaGVuIHJlc2V0IGFsbCBpcyBjYWxsZWQsIHNlYXJjaCBmb3IgYWxsIGFuY2VzdG9yIE5vZGVzIHRoYXQgYXJlIEpPSVNUL1NjcmVlblZpZXcgYW5kIGNhbGxcbiAgLy8gTm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKSBvbiBlYWNoLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvODYxXG4gIGludGVycnVwdFNjcmVlblZpZXdJbnB1dD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBSZXNldEFsbEJ1dHRvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UmVzZXRCdXR0b25PcHRpb25zLCAneE1hcmdpbicgfCAneU1hcmdpbic+O1xuXG5jb25zdCBpc1Jlc2V0dGluZ0FsbFByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggZmFsc2UgKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzZXRBbGxCdXR0b24gZXh0ZW5kcyBSZXNldEJ1dHRvbiB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUmVzZXRBbGxCdXR0b246ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBSZXNldEFsbEJ1dHRvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFJlc2V0QWxsQnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlc2V0QnV0dG9uT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBSZXNldEFsbEJ1dHRvbk9wdGlvbnNcbiAgICAgIHJhZGl1czogU2NlbmVyeVBoZXRDb25zdGFudHMuREVGQVVMVF9CVVRUT05fUkFESVVTLFxuXG4gICAgICBwaGV0aW9SZXN0b3JlU2NyZWVuU3RhdGVPblJlc2V0OiB0cnVlLFxuICAgICAgaW50ZXJydXB0U2NyZWVuVmlld0lucHV0OiB0cnVlLFxuXG4gICAgICAvLyBGaW5lIHR1bmVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YXNrcy9pc3N1ZXMvOTg1IGFuZCBzaG91bGQgbm90IGJlIG92ZXJyaWRkZW4gbGlnaHRseS5cbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA1LjIsXG4gICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5SRVNFVF9BTExfQlVUVE9OX0JBU0VfQ09MT1IsXG4gICAgICBhcnJvd0NvbG9yOiAnd2hpdGUnLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdSZXNldEFsbEJ1dHRvbicsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIG9yYW5nZSwgcm91bmQgYnV0dG9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVzdG9yZSB0aGUgaW5pdGlhbCBzdGF0ZScsXG5cbiAgICAgIC8vIHNvdW5kIGdlbmVyYXRpb25cbiAgICAgIHNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAncmVzZXRBbGwnICksXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIGlubmVyQ29udGVudDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkucmVzZXRBbGwubGFiZWxTdHJpbmdQcm9wZXJ0eSxcblxuICAgICAgLy8gdm9pY2luZ1xuICAgICAgdm9pY2luZ05hbWVSZXNwb25zZTogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkucmVzZXRBbGwubGFiZWxTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIHZvaWNpbmdDb250ZXh0UmVzcG9uc2U6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LnZvaWNpbmcucmVzZXRBbGwuY29udGV4dFJlc3BvbnNlU3RyaW5nUHJvcGVydHlcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueE1hcmdpbiA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMueU1hcmdpbiA9PT0gdW5kZWZpbmVkLCAncmVzZXRBbGxCdXR0b24gc2V0cyBtYXJnaW5zJyApO1xuICAgIG9wdGlvbnMueE1hcmdpbiA9IG9wdGlvbnMueU1hcmdpbiA9IG9wdGlvbnMucmFkaXVzICogTUFSR0lOX0NPRUZGSUNJRU5UO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIGExMXkgLSBXaGVuIHJlc2V0IGFsbCBidXR0b24gaXMgZmlyZWQsIGRpc2FibGUgYWxlcnRzIHNvIHRoYXQgdGhlcmUgaXNuJ3QgYW4gZXhjZXNzaXZlIHN0cmVhbSBvZiBhbGVydHMgd2hpbGVcbiAgICAvLyBtYW55IFByb3BlcnRpZXMgYXJlIHJlc2V0LiBXaGVuIGNhbGxiYWNrcyBhcmUgZW5kZWQgZm9yIHJlc2V0IGFsbCwgZW5hYmxlIGFsZXJ0cyBhZ2FpbiBhbmQgYW5ub3VuY2UgYW4gYWxlcnQgdGhhdFxuICAgIC8vIGV2ZXJ5dGhpbmcgd2FzIHJlc2V0LlxuICAgIGNvbnN0IHJlc2V0VXR0ZXJhbmNlID0gbmV3IEFjdGl2YXRpb25VdHRlcmFuY2UoIHsgYWxlcnQ6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LnJlc2V0QWxsLmFsZXJ0U3RyaW5nUHJvcGVydHkgfSApO1xuICAgIGxldCB2b2ljaW5nRW5hYmxlZE9uRmlyZSA9IHZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5lbmFibGVkO1xuICAgIGNvbnN0IGFyaWFFbmFibGVkT25GaXJlUGVyVXR0ZXJhbmNlUXVldWVNYXAgPSBuZXcgTWFwKCk7IC8vIEtlZXAgdHJhY2sgb2YgdGhlIGVuYWJsZWQgb2YgZWFjaCBjb25uZWN0ZWQgZGVzY3JpcHRpb24gVXR0ZXJhbmNlUXVldWVcbiAgICB0aGlzLnB1c2hCdXR0b25Nb2RlbC5pc0ZpcmluZ1Byb3BlcnR5LmxhenlMaW5rKCAoIGlzRmlyaW5nOiBib29sZWFuICkgPT4ge1xuXG4gICAgICAvLyBIYW5kbGUgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLlxuICAgICAgaWYgKCBpc0ZpcmluZyApIHtcblxuICAgICAgICAvLyBJbnRlcnJ1cHQgYmVmb3JlIGRvaW5nIGFueXRoaW5nIGVsc2UuXG4gICAgICAgIG9wdGlvbnMuaW50ZXJydXB0U2NyZWVuVmlld0lucHV0ICYmIHRoaXMuaW50ZXJydXB0U2NyZWVuVmlld0lucHV0KCk7XG5cbiAgICAgICAgdm9pY2luZ0VuYWJsZWRPbkZpcmUgPSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuZW5hYmxlZDtcbiAgICAgICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmNsZWFyKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBFdmVyeSBSZXNldEFsbEJ1dHRvbiBoYXMgdGhlIG9wdGlvbiB0byByZXNldCB0byB0aGUgbGFzdCBQaEVULWlPIHN0YXRlIGlmIGRlc2lyZWQuXG4gICAgICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBvcHRpb25zLnBoZXRpb1Jlc3RvcmVTY3JlZW5TdGF0ZU9uUmVzZXQgJiZcblxuICAgICAgICAgICAgIC8vIEV2ZW4gdGhvdWdoIHRoaXMgaXMgVGFuZGVtLlJFUVVJUkVELCBzdGlsbCBiZSBncmFjZWZ1bCBpZiBub3QgeWV0IGluc3RydW1lbnRlZC5cbiAgICAgICAgICAgICB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICAgICAgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnJlc3RvcmVTdGF0ZUZvclNjcmVlbiggb3B0aW9ucy50YW5kZW0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3RvcmUgdGhlIGVuYWJsZWQgc3RhdGUgdG8gZWFjaCB1dHRlcmFuY2VRdWV1ZSBhZnRlciByZXNldHRpbmcuXG4gICAgICAgIHZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5lbmFibGVkID0gdm9pY2luZ0VuYWJsZWRPbkZpcmU7XG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSBlYWNoIGNvbm5lY3RlZCBkZXNjcmlwdGlvbiBVdHRlcmFuY2VRdWV1ZS5cbiAgICAgIHRoaXMuZm9yRWFjaFV0dGVyYW5jZVF1ZXVlKCB1dHRlcmFuY2VRdWV1ZSA9PiB7XG5cbiAgICAgICAgaWYgKCBpc0ZpcmluZyApIHtcblxuICAgICAgICAgIC8vIE11dGUgYW5kIGNsZWFyIHRoZSB1dHRlcmFuY2VRdWV1ZS5cbiAgICAgICAgICBhcmlhRW5hYmxlZE9uRmlyZVBlclV0dGVyYW5jZVF1ZXVlTWFwLnNldCggdXR0ZXJhbmNlUXVldWUsIHV0dGVyYW5jZVF1ZXVlLmVuYWJsZWQgKTtcbiAgICAgICAgICB1dHRlcmFuY2VRdWV1ZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgdXR0ZXJhbmNlUXVldWUuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB1dHRlcmFuY2VRdWV1ZS5lbmFibGVkID0gYXJpYUVuYWJsZWRPbkZpcmVQZXJVdHRlcmFuY2VRdWV1ZU1hcC5nZXQoIHV0dGVyYW5jZVF1ZXVlICkgfHwgdXR0ZXJhbmNlUXVldWUuZW5hYmxlZDtcbiAgICAgICAgICB1dHRlcmFuY2VRdWV1ZS5hZGRUb0JhY2soIHJlc2V0VXR0ZXJhbmNlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBrZXlib2FyZExpc3RlbmVyID0gS2V5Ym9hcmRMaXN0ZW5lci5jcmVhdGVHbG9iYWwoIHRoaXMsIHtcbiAgICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFJlc2V0QWxsQnV0dG9uLlJFU0VUX0FMTF9IT1RLRVlfREFUQS5rZXlTdHJpbmdQcm9wZXJ0aWVzLFxuICAgICAgZmlyZTogKCkgPT4gdGhpcy5wZG9tQ2xpY2soKSxcblxuICAgICAgLy8gZmlyZXMgb24gdXAgYmVjYXVzZSB0aGUgbGlzdGVuZXIgd2lsbCBvZnRlbiBjYWxsIGludGVycnVwdFN1YnRyZWVJbnB1dCAoaW50ZXJydXB0aW5nIHRoaXMga2V5Ym9hcmQgbGlzdGVuZXIpXG4gICAgICBmaXJlT25Eb3duOiBmYWxzZVxuICAgIH0gKTtcblxuICAgIC8vIEFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCBzZXQgYW5kIGNsZWFyIHRoZSBzdGF0aWMgZmxhZyB0aGF0IHNpZ25hbHMgd2hlbiBhIHJlc2V0IGFsbCBpcyBpbiBwcm9ncmVzcy5cbiAgICBjb25zdCBmbGFnU2V0dGluZ0xpc3RlbmVyID0gKCBpc0ZpcmluZzogYm9vbGVhbiApID0+IHtcbiAgICAgIGlzUmVzZXR0aW5nQWxsUHJvcGVydHkudmFsdWUgPSBpc0ZpcmluZztcbiAgICB9O1xuICAgIHRoaXMucHVzaEJ1dHRvbk1vZGVsLmlzRmlyaW5nUHJvcGVydHkubGF6eUxpbmsoIGZsYWdTZXR0aW5nTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVJlc2V0QWxsQnV0dG9uID0gKCkgPT4ge1xuICAgICAga2V5Ym9hcmRMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICBhcmlhRW5hYmxlZE9uRmlyZVBlclV0dGVyYW5jZVF1ZXVlTWFwLmNsZWFyKCk7XG4gICAgICB0aGlzLnB1c2hCdXR0b25Nb2RlbC5pc0ZpcmluZ1Byb3BlcnR5LnVubGluayggZmxhZ1NldHRpbmdMaXN0ZW5lciApO1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGludGVycnVwdFNjcmVlblZpZXdJbnB1dCgpOiB2b2lkIHtcbiAgICBjb25zdCBzY3JlZW5WaWV3cyA9IHRoaXMuZ2V0UGFyZW50U2NyZWVuVmlld3MoKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNjcmVlblZpZXdzLmxlbmd0aDsgaSsrICkge1xuICAgICAgc2NyZWVuVmlld3NbIGkgXS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFBhcmVudFNjcmVlblZpZXdzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgU2NyZWVuVmlld0NsYXNzID0gd2luZG93LnBoZXQ/LmpvaXN0Py5TY3JlZW5WaWV3O1xuICAgIGlmICggIVNjcmVlblZpZXdDbGFzcyApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgdHJhaWxzID0gdGhpcy5nZXRUcmFpbHMoKTtcblxuICAgIGNvbnN0IHNjcmVlblZpZXdzOiBOb2RlW10gPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCB0cmFpbCA9IHRyYWlsc1sgaSBdO1xuICAgICAgY29uc3Qgbm9kZXMgPSB0cmFpbC5ub2RlcztcblxuICAgICAgLy8gU3RhcnQgYXQgdGhlIGNsb3Nlc3QgYW5jZXN0b3JcbiAgICAgIGZvciAoIGxldCBqID0gbm9kZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1sgaiBdO1xuICAgICAgICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBTY3JlZW5WaWV3Q2xhc3MgKSB7XG4gICAgICAgICAgc2NyZWVuVmlld3MucHVzaCggbm9kZSApO1xuICAgICAgICAgIGJyZWFrOyAvLyBTdG9wIGF0IGZpcnN0IFNjcmVlblZpZXdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfLnVuaXEoIHNjcmVlblZpZXdzICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VSZXNldEFsbEJ1dHRvbigpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8vIEEgZmxhZyB0aGF0IGlzIHRydWUgd2hlbmV2ZXIgYW55IFwicmVzZXQgYWxsXCIgaXMgaW4gcHJvZ3Jlc3MuICBUaGlzIGlzIG9mdGVuIHVzZWZ1bCBmb3IgbXV0aW5nIHNvdW5kcyB0aGF0IHNob3VsZG4ndFxuICAvLyBiZSB0cmlnZ2VyZWQgYnkgbW9kZWwgdmFsdWUgY2hhbmdlcyB0aGF0IG9jY3VyIGR1ZSB0byBhIHJlc2V0LlxuICBwdWJsaWMgc3RhdGljIGlzUmVzZXR0aW5nQWxsUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ID0gaXNSZXNldHRpbmdBbGxQcm9wZXJ0eTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFU0VUX0FMTF9IT1RLRVlfREFUQSA9IG5ldyBIb3RrZXlEYXRhKCB7XG5cbiAgICAvLyBhbHQrclxuICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IFsgbmV3IFByb3BlcnR5KCAnYWx0K3InICkgXSxcblxuICAgIC8vIHZpc3VhbCBsYWJlbCBmb3IgdGhpcyBIb3RrZXkgaW4gdGhlIEtleWJvYXJkIEhlbHAgZGlhbG9nXG4gICAga2V5Ym9hcmRIZWxwRGlhbG9nTGFiZWxTdHJpbmdQcm9wZXJ0eTogU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5yZXNldEFsbFN0cmluZ1Byb3BlcnR5LFxuXG4gICAgLy8gUERPTSBkZXNjcmlwdGlvbiBmb3IgdGhpcyBIb3RrZXkgaW4gdGhlIEtleWJvYXJkIEhlbHAgZGlhbG9nXG4gICAga2V5Ym9hcmRIZWxwRGlhbG9nUERPTUxhYmVsU3RyaW5nUHJvcGVydHk6IFN0cmluZ1V0aWxzLmZpbGxJbiggU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLmdlbmVyYWwucmVzZXRBbGxEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgYWx0T3JPcHRpb246IFRleHRLZXlOb2RlLmdldEFsdEtleVN0cmluZygpXG4gICAgfSApLFxuXG4gICAgcmVwb05hbWU6IHNjZW5lcnlQaGV0Lm5hbWUsXG4gICAgZ2xvYmFsOiB0cnVlXG4gIH0gKTtcbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdSZXNldEFsbEJ1dHRvbicsIFJlc2V0QWxsQnV0dG9uICk7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiVGlueVByb3BlcnR5Iiwib3B0aW9uaXplIiwiU3RyaW5nVXRpbHMiLCJIb3RrZXlEYXRhIiwiS2V5Ym9hcmRMaXN0ZW5lciIsInZvaWNpbmdVdHRlcmFuY2VRdWV1ZSIsInNoYXJlZFNvdW5kUGxheWVycyIsIlRhbmRlbSIsIkFjdGl2YXRpb25VdHRlcmFuY2UiLCJUZXh0S2V5Tm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRDb25zdGFudHMiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJSZXNldEJ1dHRvbiIsIk1BUkdJTl9DT0VGRklDSUVOVCIsIkRFRkFVTFRfQlVUVE9OX1JBRElVUyIsImlzUmVzZXR0aW5nQWxsUHJvcGVydHkiLCJSZXNldEFsbEJ1dHRvbiIsImludGVycnVwdFNjcmVlblZpZXdJbnB1dCIsInNjcmVlblZpZXdzIiwiZ2V0UGFyZW50U2NyZWVuVmlld3MiLCJpIiwibGVuZ3RoIiwiaW50ZXJydXB0U3VidHJlZUlucHV0Iiwid2luZG93IiwiU2NyZWVuVmlld0NsYXNzIiwicGhldCIsImpvaXN0IiwiU2NyZWVuVmlldyIsInRyYWlscyIsImdldFRyYWlscyIsInRyYWlsIiwibm9kZXMiLCJqIiwibm9kZSIsInB1c2giLCJfIiwidW5pcSIsImRpc3Bvc2UiLCJkaXNwb3NlUmVzZXRBbGxCdXR0b24iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicmFkaXVzIiwicGhldGlvUmVzdG9yZVNjcmVlblN0YXRlT25SZXNldCIsInRvdWNoQXJlYURpbGF0aW9uIiwiYmFzZUNvbG9yIiwiUkVTRVRfQUxMX0JVVFRPTl9CQVNFX0NPTE9SIiwiYXJyb3dDb2xvciIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJzb3VuZFBsYXllciIsImdldCIsImlubmVyQ29udGVudCIsImExMXkiLCJyZXNldEFsbCIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwidm9pY2luZ0NvbnRleHRSZXNwb25zZSIsInZvaWNpbmciLCJjb250ZXh0UmVzcG9uc2VTdHJpbmdQcm9wZXJ0eSIsImFzc2VydCIsInhNYXJnaW4iLCJ1bmRlZmluZWQiLCJ5TWFyZ2luIiwicmVzZXRVdHRlcmFuY2UiLCJhbGVydCIsImFsZXJ0U3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nRW5hYmxlZE9uRmlyZSIsImVuYWJsZWQiLCJhcmlhRW5hYmxlZE9uRmlyZVBlclV0dGVyYW5jZVF1ZXVlTWFwIiwiTWFwIiwicHVzaEJ1dHRvbk1vZGVsIiwiaXNGaXJpbmdQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNGaXJpbmciLCJjbGVhciIsIlBIRVRfSU9fRU5BQkxFRCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldGlvIiwicGhldGlvRW5naW5lIiwicGhldGlvU3RhdGVFbmdpbmUiLCJyZXN0b3JlU3RhdGVGb3JTY3JlZW4iLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJmb3JFYWNoVXR0ZXJhbmNlUXVldWUiLCJ1dHRlcmFuY2VRdWV1ZSIsInNldCIsImFkZFRvQmFjayIsImtleWJvYXJkTGlzdGVuZXIiLCJjcmVhdGVHbG9iYWwiLCJrZXlTdHJpbmdQcm9wZXJ0aWVzIiwiUkVTRVRfQUxMX0hPVEtFWV9EQVRBIiwiZmlyZSIsInBkb21DbGljayIsImZpcmVPbkRvd24iLCJmbGFnU2V0dGluZ0xpc3RlbmVyIiwidmFsdWUiLCJ1bmxpbmsiLCJrZXlib2FyZEhlbHBEaWFsb2dMYWJlbFN0cmluZ1Byb3BlcnR5Iiwia2V5Ym9hcmRIZWxwRGlhbG9nIiwicmVzZXRBbGxTdHJpbmdQcm9wZXJ0eSIsImtleWJvYXJkSGVscERpYWxvZ1BET01MYWJlbFN0cmluZ1Byb3BlcnR5IiwiZmlsbEluIiwiZ2VuZXJhbCIsInJlc2V0QWxsRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJhbHRPck9wdGlvbiIsImdldEFsdEtleVN0cmluZyIsInJlcG9OYW1lIiwibmFtZSIsImdsb2JhbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsY0FBYywrQkFB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