// Copyright 2021-2024, University of Colorado Boulder
/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import { combineOptions } from '../../../phet-core/js/optionize.js';
import { HBox, Text, VBox } from '../../../scenery/js/imports.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';
// constants
const audioFeaturesStringProperty = JoistStrings.preferences.tabs.audio.audioFeatures.titleStringProperty;
let AudioPreferencesTabPanel = class AudioPreferencesTabPanel extends PreferencesPanel {
    /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param selectedTabProperty
   * @param tabVisibleProperty
   * @param providedOptions
   */ constructor(audioModel, selectedTabProperty, tabVisibleProperty, providedOptions){
        super(PreferencesType.AUDIO, selectedTabProperty, tabVisibleProperty, {
            labelContent: audioFeaturesStringProperty
        });
        // Some contents of this Dialog will be dynamically removed. Dont resize when this happens because we don't want
        // to shift contents of the entire Preferences dialog.
        const contentOptions = {
            align: 'left',
            spacing: PreferencesDialog.CONTENT_SPACING,
            excludeInvisibleChildrenFromBounds: false
        };
        const leftContent = new VBox(contentOptions);
        const rightContent = new VBox(contentOptions);
        if (audioModel.supportsVoicing) {
            const voicingPanelSection = new VoicingPanelSection(audioModel);
            leftContent.addChild(voicingPanelSection);
        }
        if (audioModel.supportsSound) {
            // If only one of the audio features are in use, do not include the toggle switch to
            // enable/disable that feature because the control is redundant. The audio output should go
            // through the "Audio Features" toggle only.
            const hideSoundToggle = audioModel.supportsVoicing !== audioModel.supportsSound;
            const soundPanelSection = new SoundPanelSection(audioModel, {
                includeTitleToggleSwitch: !hideSoundToggle
            });
            rightContent.addChild(soundPanelSection);
        }
        const sections = new HBox({
            align: 'top',
            spacing: 10,
            children: [
                leftContent,
                rightContent
            ],
            tagName: 'div' // Must have PDOM content to support toggling enabled in the PDOM. Could be removed after https://github.com/phetsims/scenery/issues/1514
        });
        audioModel.customPreferences.forEach((customPreference, i)=>{
            const container = i % 2 === 0 ? leftContent : rightContent;
            const customContent = customPreference.createContent(providedOptions.tandem);
            const preferencesPanelSection = new PreferencesPanelSection({
                contentNode: customContent,
                contentNodeOptions: {
                    excludeInvisibleChildrenFromBounds: true
                },
                contentLeftMargin: 0
            });
            container.addChild(preferencesPanelSection);
        });
        const audioFeaturesText = new Text(audioFeaturesStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
        const audioFeaturesSwitch = new ToggleSwitch(audioModel.audioEnabledProperty, false, true, combineOptions({
            accessibleName: audioFeaturesStringProperty
        }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
        const allAudioSwitch = new PreferencesControl({
            labelNode: audioFeaturesText,
            controlNode: audioFeaturesSwitch,
            headingControl: true
        });
        const audioEnabledListener = (enabled)=>{
            sections.enabled = enabled;
        };
        audioModel.audioEnabledProperty.link(audioEnabledListener);
        const panelContent = new VBox({
            align: 'center',
            spacing: 25,
            children: [
                allAudioSwitch,
                sections
            ]
        });
        this.addChild(panelContent);
    }
};
joist.register('AudioPreferencesTabPanel', AudioPreferencesTabPanel);
export default AudioPreferencesTabPanel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL0F1ZGlvUHJlZmVyZW5jZXNQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgcGFuZWwgZm9yIHRoZSBQcmVmZXJlbmNlc0RpYWxvZyBjb250YWluaW5nIHByZWZlcmVuY2VzIHJlbGF0ZWQgdG8gYXVkaW8uXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVG9nZ2xlU3dpdGNoLCB7IFRvZ2dsZVN3aXRjaE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvVG9nZ2xlU3dpdGNoLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4uL0pvaXN0U3RyaW5ncy5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNDb250cm9sIGZyb20gJy4vUHJlZmVyZW5jZXNDb250cm9sLmpzJztcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZyBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nLmpzJztcbmltcG9ydCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyBmcm9tICcuL1ByZWZlcmVuY2VzRGlhbG9nQ29uc3RhbnRzLmpzJztcbmltcG9ydCB7IEF1ZGlvTW9kZWwgfSBmcm9tICcuL1ByZWZlcmVuY2VzTW9kZWwuanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzUGFuZWwsIHsgUHJlZmVyZW5jZXNQYW5lbE9wdGlvbnMgfSBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWwuanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzUGFuZWxTZWN0aW9uIGZyb20gJy4vUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24uanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzVHlwZSBmcm9tICcuL1ByZWZlcmVuY2VzVHlwZS5qcyc7XG5pbXBvcnQgU291bmRQYW5lbFNlY3Rpb24gZnJvbSAnLi9Tb3VuZFBhbmVsU2VjdGlvbi5qcyc7XG5pbXBvcnQgVm9pY2luZ1BhbmVsU2VjdGlvbiBmcm9tICcuL1ZvaWNpbmdQYW5lbFNlY3Rpb24uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IGF1ZGlvRmVhdHVyZXNTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLmF1ZGlvRmVhdHVyZXMudGl0bGVTdHJpbmdQcm9wZXJ0eTtcblxudHlwZSBBdWRpb1ByZWZlcmVuY2VzUGFuZWxPcHRpb25zID0gUGlja1JlcXVpcmVkPFByZWZlcmVuY2VzUGFuZWxPcHRpb25zLCAndGFuZGVtJz47XG5cbmNsYXNzIEF1ZGlvUHJlZmVyZW5jZXNUYWJQYW5lbCBleHRlbmRzIFByZWZlcmVuY2VzUGFuZWwge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXVkaW9Nb2RlbCAtIGNvbmZpZ3VyYXRpb24gZm9yIGF1ZGlvIHNldHRpbmdzLCBzZWUgUHJlZmVyZW5jZXNNb2RlbFxuICAgKiBAcGFyYW0gc2VsZWN0ZWRUYWJQcm9wZXJ0eVxuICAgKiBAcGFyYW0gdGFiVmlzaWJsZVByb3BlcnR5XG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYXVkaW9Nb2RlbDogQXVkaW9Nb2RlbCwgc2VsZWN0ZWRUYWJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UHJlZmVyZW5jZXNUeXBlPiwgdGFiVmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgcHJvdmlkZWRPcHRpb25zOiBBdWRpb1ByZWZlcmVuY2VzUGFuZWxPcHRpb25zICkge1xuICAgIHN1cGVyKCBQcmVmZXJlbmNlc1R5cGUuQVVESU8sIHNlbGVjdGVkVGFiUHJvcGVydHksIHRhYlZpc2libGVQcm9wZXJ0eSwge1xuICAgICAgbGFiZWxDb250ZW50OiBhdWRpb0ZlYXR1cmVzU3RyaW5nUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICAvLyBTb21lIGNvbnRlbnRzIG9mIHRoaXMgRGlhbG9nIHdpbGwgYmUgZHluYW1pY2FsbHkgcmVtb3ZlZC4gRG9udCByZXNpemUgd2hlbiB0aGlzIGhhcHBlbnMgYmVjYXVzZSB3ZSBkb24ndCB3YW50XG4gICAgLy8gdG8gc2hpZnQgY29udGVudHMgb2YgdGhlIGVudGlyZSBQcmVmZXJlbmNlcyBkaWFsb2cuXG4gICAgY29uc3QgY29udGVudE9wdGlvbnM6IFZCb3hPcHRpb25zID0ge1xuICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgIHNwYWNpbmc6IFByZWZlcmVuY2VzRGlhbG9nLkNPTlRFTlRfU1BBQ0lORyxcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGZhbHNlXG4gICAgfTtcbiAgICBjb25zdCBsZWZ0Q29udGVudCA9IG5ldyBWQm94KCBjb250ZW50T3B0aW9ucyApO1xuICAgIGNvbnN0IHJpZ2h0Q29udGVudCA9IG5ldyBWQm94KCBjb250ZW50T3B0aW9ucyApO1xuXG4gICAgaWYgKCBhdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyApIHtcbiAgICAgIGNvbnN0IHZvaWNpbmdQYW5lbFNlY3Rpb24gPSBuZXcgVm9pY2luZ1BhbmVsU2VjdGlvbiggYXVkaW9Nb2RlbCApO1xuICAgICAgbGVmdENvbnRlbnQuYWRkQ2hpbGQoIHZvaWNpbmdQYW5lbFNlY3Rpb24gKTtcbiAgICB9XG5cbiAgICBpZiAoIGF1ZGlvTW9kZWwuc3VwcG9ydHNTb3VuZCApIHtcblxuICAgICAgLy8gSWYgb25seSBvbmUgb2YgdGhlIGF1ZGlvIGZlYXR1cmVzIGFyZSBpbiB1c2UsIGRvIG5vdCBpbmNsdWRlIHRoZSB0b2dnbGUgc3dpdGNoIHRvXG4gICAgICAvLyBlbmFibGUvZGlzYWJsZSB0aGF0IGZlYXR1cmUgYmVjYXVzZSB0aGUgY29udHJvbCBpcyByZWR1bmRhbnQuIFRoZSBhdWRpbyBvdXRwdXQgc2hvdWxkIGdvXG4gICAgICAvLyB0aHJvdWdoIHRoZSBcIkF1ZGlvIEZlYXR1cmVzXCIgdG9nZ2xlIG9ubHkuXG4gICAgICBjb25zdCBoaWRlU291bmRUb2dnbGUgPSBhdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyAhPT0gYXVkaW9Nb2RlbC5zdXBwb3J0c1NvdW5kO1xuXG4gICAgICBjb25zdCBzb3VuZFBhbmVsU2VjdGlvbiA9IG5ldyBTb3VuZFBhbmVsU2VjdGlvbiggYXVkaW9Nb2RlbCwge1xuICAgICAgICBpbmNsdWRlVGl0bGVUb2dnbGVTd2l0Y2g6ICFoaWRlU291bmRUb2dnbGVcbiAgICAgIH0gKTtcbiAgICAgIHJpZ2h0Q29udGVudC5hZGRDaGlsZCggc291bmRQYW5lbFNlY3Rpb24gKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWN0aW9ucyA9IG5ldyBIQm94KCB7XG4gICAgICBhbGlnbjogJ3RvcCcsXG4gICAgICBzcGFjaW5nOiAxMCxcbiAgICAgIGNoaWxkcmVuOiBbIGxlZnRDb250ZW50LCByaWdodENvbnRlbnQgXSxcbiAgICAgIHRhZ05hbWU6ICdkaXYnIC8vIE11c3QgaGF2ZSBQRE9NIGNvbnRlbnQgdG8gc3VwcG9ydCB0b2dnbGluZyBlbmFibGVkIGluIHRoZSBQRE9NLiBDb3VsZCBiZSByZW1vdmVkIGFmdGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTE0XG4gICAgfSApO1xuXG4gICAgYXVkaW9Nb2RlbC5jdXN0b21QcmVmZXJlbmNlcy5mb3JFYWNoKCAoIGN1c3RvbVByZWZlcmVuY2UsIGkgKSA9PiB7XG4gICAgICBjb25zdCBjb250YWluZXIgPSBpICUgMiA9PT0gMCA/IGxlZnRDb250ZW50IDogcmlnaHRDb250ZW50O1xuICAgICAgY29uc3QgY3VzdG9tQ29udGVudCA9IGN1c3RvbVByZWZlcmVuY2UuY3JlYXRlQ29udGVudCggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSApO1xuICAgICAgY29uc3QgcHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24gPSBuZXcgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24oIHtcbiAgICAgICAgY29udGVudE5vZGU6IGN1c3RvbUNvbnRlbnQsXG4gICAgICAgIGNvbnRlbnROb2RlT3B0aW9uczoge1xuICAgICAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudExlZnRNYXJnaW46IDBcbiAgICAgIH0gKTtcbiAgICAgIGNvbnRhaW5lci5hZGRDaGlsZCggcHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24gKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBhdWRpb0ZlYXR1cmVzVGV4dCA9IG5ldyBUZXh0KCBhdWRpb0ZlYXR1cmVzU3RyaW5nUHJvcGVydHksIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fTEFCRUxfT1BUSU9OUyApO1xuICAgIGNvbnN0IGF1ZGlvRmVhdHVyZXNTd2l0Y2ggPSBuZXcgVG9nZ2xlU3dpdGNoKCBhdWRpb01vZGVsLmF1ZGlvRW5hYmxlZFByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwgY29tYmluZU9wdGlvbnM8VG9nZ2xlU3dpdGNoT3B0aW9ucz4oIHtcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBhdWRpb0ZlYXR1cmVzU3RyaW5nUHJvcGVydHlcbiAgICB9LCBQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5UT0dHTEVfU1dJVENIX09QVElPTlMgKSApO1xuICAgIGNvbnN0IGFsbEF1ZGlvU3dpdGNoID0gbmV3IFByZWZlcmVuY2VzQ29udHJvbCgge1xuICAgICAgbGFiZWxOb2RlOiBhdWRpb0ZlYXR1cmVzVGV4dCxcbiAgICAgIGNvbnRyb2xOb2RlOiBhdWRpb0ZlYXR1cmVzU3dpdGNoLFxuICAgICAgaGVhZGluZ0NvbnRyb2w6IHRydWVcbiAgICB9ICk7XG5cbiAgICBjb25zdCBhdWRpb0VuYWJsZWRMaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcbiAgICAgIHNlY3Rpb25zLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgIH07XG5cbiAgICBhdWRpb01vZGVsLmF1ZGlvRW5hYmxlZFByb3BlcnR5LmxpbmsoIGF1ZGlvRW5hYmxlZExpc3RlbmVyICk7XG5cbiAgICBjb25zdCBwYW5lbENvbnRlbnQgPSBuZXcgVkJveCgge1xuICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgc3BhY2luZzogMjUsXG4gICAgICBjaGlsZHJlbjogWyBhbGxBdWRpb1N3aXRjaCwgc2VjdGlvbnMgXVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCBwYW5lbENvbnRlbnQgKTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0F1ZGlvUHJlZmVyZW5jZXNUYWJQYW5lbCcsIEF1ZGlvUHJlZmVyZW5jZXNUYWJQYW5lbCApO1xuZXhwb3J0IGRlZmF1bHQgQXVkaW9QcmVmZXJlbmNlc1RhYlBhbmVsOyJdLCJuYW1lcyI6WyJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJUZXh0IiwiVkJveCIsIlRvZ2dsZVN3aXRjaCIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiUHJlZmVyZW5jZXNDb250cm9sIiwiUHJlZmVyZW5jZXNEaWFsb2ciLCJQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyIsIlByZWZlcmVuY2VzUGFuZWwiLCJQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiIsIlByZWZlcmVuY2VzVHlwZSIsIlNvdW5kUGFuZWxTZWN0aW9uIiwiVm9pY2luZ1BhbmVsU2VjdGlvbiIsImF1ZGlvRmVhdHVyZXNTdHJpbmdQcm9wZXJ0eSIsInByZWZlcmVuY2VzIiwidGFicyIsImF1ZGlvIiwiYXVkaW9GZWF0dXJlcyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJBdWRpb1ByZWZlcmVuY2VzVGFiUGFuZWwiLCJhdWRpb01vZGVsIiwic2VsZWN0ZWRUYWJQcm9wZXJ0eSIsInRhYlZpc2libGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIkFVRElPIiwibGFiZWxDb250ZW50IiwiY29udGVudE9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJDT05URU5UX1NQQUNJTkciLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwibGVmdENvbnRlbnQiLCJyaWdodENvbnRlbnQiLCJzdXBwb3J0c1ZvaWNpbmciLCJ2b2ljaW5nUGFuZWxTZWN0aW9uIiwiYWRkQ2hpbGQiLCJzdXBwb3J0c1NvdW5kIiwiaGlkZVNvdW5kVG9nZ2xlIiwic291bmRQYW5lbFNlY3Rpb24iLCJpbmNsdWRlVGl0bGVUb2dnbGVTd2l0Y2giLCJzZWN0aW9ucyIsImNoaWxkcmVuIiwidGFnTmFtZSIsImN1c3RvbVByZWZlcmVuY2VzIiwiZm9yRWFjaCIsImN1c3RvbVByZWZlcmVuY2UiLCJpIiwiY29udGFpbmVyIiwiY3VzdG9tQ29udGVudCIsImNyZWF0ZUNvbnRlbnQiLCJ0YW5kZW0iLCJwcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiIsImNvbnRlbnROb2RlIiwiY29udGVudE5vZGVPcHRpb25zIiwiY29udGVudExlZnRNYXJnaW4iLCJhdWRpb0ZlYXR1cmVzVGV4dCIsIlBBTkVMX1NFQ1RJT05fTEFCRUxfT1BUSU9OUyIsImF1ZGlvRmVhdHVyZXNTd2l0Y2giLCJhdWRpb0VuYWJsZWRQcm9wZXJ0eSIsImFjY2Vzc2libGVOYW1lIiwiVE9HR0xFX1NXSVRDSF9PUFRJT05TIiwiYWxsQXVkaW9Td2l0Y2giLCJsYWJlbE5vZGUiLCJjb250cm9sTm9kZSIsImhlYWRpbmdDb250cm9sIiwiYXVkaW9FbmFibGVkTGlzdGVuZXIiLCJlbmFibGVkIiwibGluayIsInBhbmVsQ29udGVudCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLGNBQWMsUUFBUSxxQ0FBcUM7QUFFcEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBcUIsaUNBQWlDO0FBQy9FLE9BQU9DLGtCQUEyQyxrQ0FBa0M7QUFDcEYsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0Msd0JBQXdCLDBCQUEwQjtBQUN6RCxPQUFPQyx1QkFBdUIseUJBQXlCO0FBQ3ZELE9BQU9DLGdDQUFnQyxrQ0FBa0M7QUFFekUsT0FBT0Msc0JBQW1ELHdCQUF3QjtBQUNsRixPQUFPQyw2QkFBNkIsK0JBQStCO0FBQ25FLE9BQU9DLHFCQUFxQix1QkFBdUI7QUFDbkQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyx5QkFBeUIsMkJBQTJCO0FBRTNELFlBQVk7QUFDWixNQUFNQyw4QkFBOEJULGFBQWFVLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLGFBQWEsQ0FBQ0MsbUJBQW1CO0FBSXpHLElBQUEsQUFBTUMsMkJBQU4sTUFBTUEsaUNBQWlDWDtJQUVyQzs7Ozs7R0FLQyxHQUNELFlBQW9CWSxVQUFzQixFQUFFQyxtQkFBdUQsRUFBRUMsa0JBQThDLEVBQUVDLGVBQTZDLENBQUc7UUFDbk0sS0FBSyxDQUFFYixnQkFBZ0JjLEtBQUssRUFBRUgscUJBQXFCQyxvQkFBb0I7WUFDckVHLGNBQWNaO1FBQ2hCO1FBRUEsZ0hBQWdIO1FBQ2hILHNEQUFzRDtRQUN0RCxNQUFNYSxpQkFBOEI7WUFDbENDLE9BQU87WUFDUEMsU0FBU3RCLGtCQUFrQnVCLGVBQWU7WUFDMUNDLG9DQUFvQztRQUN0QztRQUNBLE1BQU1DLGNBQWMsSUFBSTlCLEtBQU15QjtRQUM5QixNQUFNTSxlQUFlLElBQUkvQixLQUFNeUI7UUFFL0IsSUFBS04sV0FBV2EsZUFBZSxFQUFHO1lBQ2hDLE1BQU1DLHNCQUFzQixJQUFJdEIsb0JBQXFCUTtZQUNyRFcsWUFBWUksUUFBUSxDQUFFRDtRQUN4QjtRQUVBLElBQUtkLFdBQVdnQixhQUFhLEVBQUc7WUFFOUIsb0ZBQW9GO1lBQ3BGLDJGQUEyRjtZQUMzRiw0Q0FBNEM7WUFDNUMsTUFBTUMsa0JBQWtCakIsV0FBV2EsZUFBZSxLQUFLYixXQUFXZ0IsYUFBYTtZQUUvRSxNQUFNRSxvQkFBb0IsSUFBSTNCLGtCQUFtQlMsWUFBWTtnQkFDM0RtQiwwQkFBMEIsQ0FBQ0Y7WUFDN0I7WUFDQUwsYUFBYUcsUUFBUSxDQUFFRztRQUN6QjtRQUVBLE1BQU1FLFdBQVcsSUFBSXpDLEtBQU07WUFDekI0QixPQUFPO1lBQ1BDLFNBQVM7WUFDVGEsVUFBVTtnQkFBRVY7Z0JBQWFDO2FBQWM7WUFDdkNVLFNBQVMsTUFBTSx5SUFBeUk7UUFDMUo7UUFFQXRCLFdBQVd1QixpQkFBaUIsQ0FBQ0MsT0FBTyxDQUFFLENBQUVDLGtCQUFrQkM7WUFDeEQsTUFBTUMsWUFBWUQsSUFBSSxNQUFNLElBQUlmLGNBQWNDO1lBQzlDLE1BQU1nQixnQkFBZ0JILGlCQUFpQkksYUFBYSxDQUFFMUIsZ0JBQWdCMkIsTUFBTTtZQUM1RSxNQUFNQywwQkFBMEIsSUFBSTFDLHdCQUF5QjtnQkFDM0QyQyxhQUFhSjtnQkFDYkssb0JBQW9CO29CQUNsQnZCLG9DQUFvQztnQkFDdEM7Z0JBQ0F3QixtQkFBbUI7WUFDckI7WUFDQVAsVUFBVVosUUFBUSxDQUFFZ0I7UUFDdEI7UUFFQSxNQUFNSSxvQkFBb0IsSUFBSXZELEtBQU1hLDZCQUE2QlAsa0JBQWtCa0QsMkJBQTJCO1FBQzlHLE1BQU1DLHNCQUFzQixJQUFJdkQsYUFBY2tCLFdBQVdzQyxvQkFBb0IsRUFBRSxPQUFPLE1BQU01RCxlQUFxQztZQUMvSDZELGdCQUFnQjlDO1FBQ2xCLEdBQUdOLDJCQUEyQnFELHFCQUFxQjtRQUNuRCxNQUFNQyxpQkFBaUIsSUFBSXhELG1CQUFvQjtZQUM3Q3lELFdBQVdQO1lBQ1hRLGFBQWFOO1lBQ2JPLGdCQUFnQjtRQUNsQjtRQUVBLE1BQU1DLHVCQUF1QixDQUFFQztZQUM3QjFCLFNBQVMwQixPQUFPLEdBQUdBO1FBQ3JCO1FBRUE5QyxXQUFXc0Msb0JBQW9CLENBQUNTLElBQUksQ0FBRUY7UUFFdEMsTUFBTUcsZUFBZSxJQUFJbkUsS0FBTTtZQUM3QjBCLE9BQU87WUFDUEMsU0FBUztZQUNUYSxVQUFVO2dCQUFFb0I7Z0JBQWdCckI7YUFBVTtRQUN4QztRQUNBLElBQUksQ0FBQ0wsUUFBUSxDQUFFaUM7SUFDakI7QUFDRjtBQUVBakUsTUFBTWtFLFFBQVEsQ0FBRSw0QkFBNEJsRDtBQUM1QyxlQUFlQSx5QkFBeUIifQ==