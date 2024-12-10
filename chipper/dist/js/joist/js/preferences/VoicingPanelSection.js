// Copyright 2021-2024, University of Colorado Boulder
/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HighlightFromNode, Node, PressListener, Text, VBox, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import localeProperty from '../i18n/localeProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
// constants
// none of the Voicing strings or feature is translatable yet, all strings in this file
// are nested under the 'a11y' section to make sure that they are not translatable
const voicingLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.titleStringProperty;
const toolbarLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.titleStringProperty;
const rateStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.titleStringProperty;
const rateLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelStringStringProperty;
const pitchStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.titleStringProperty;
const voicingEnabledStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOnStringProperty;
const voicingDisabledStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffStringProperty;
const voicingOffOnlyAvailableInEnglishStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffOnlyAvailableInEnglishStringProperty;
const voiceVariablesPatternStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.variablesPatternStringProperty;
const customizeVoiceStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.titleStringProperty;
const toolbarRemovedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarRemovedStringProperty;
const toolbarAddedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarAddedStringProperty;
const simVoicingOptionsStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.titleStringProperty;
const simVoicingDescriptionStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.descriptionStringProperty;
const objectDetailsLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.labelStringProperty;
const contextChangesLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.labelStringProperty;
const helpfulHintsLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.labelStringProperty;
const voicingObjectChangesStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlertStringProperty;
const objectChangesMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlertStringProperty;
const voicingContextChangesStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlertStringProperty;
const contextChangesMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlertStringProperty;
const voicingHintsStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlertStringProperty;
const hintsMutedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlertStringProperty;
const voiceLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titleStringProperty;
const voiceTitlePatternLabelStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titlePatternStringProperty;
const noVoicesAvailableStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailableStringProperty;
const customizeVoiceExpandedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlertStringProperty;
const customizeVoiceCollapsedStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlertStringProperty;
const voiceRateDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.writtenVariablesPatternStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;
const voiceRateNormalStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormalStringProperty;
const inLowRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.lowStringProperty;
const inNormalRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normalStringProperty;
const aboveNormalRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormalStringProperty;
const inHighRangeStringProperty = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.highStringProperty;
// Voicing can appear but become disabled when running with multiple locales. This translatable label is present for
// translated sims in this case.
const voicingEnglishOnlyLabelStringProperty = JoistStrings.preferences.tabs.audio.voicing.titleEnglishOnlyStringProperty;
const voicingDescriptionStringProperty = JoistStrings.preferences.tabs.audio.voicing.descriptionStringProperty;
const VOICE_PITCH_DESCRIPTION_MAP = new Map();
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(0.5, 0.75), inLowRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(0.75, 1.25), inNormalRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(1.25, 1.5), aboveNormalRangeStringProperty);
VOICE_PITCH_DESCRIPTION_MAP.set(new Range(1.5, 2), inHighRangeStringProperty);
const THUMB_SIZE = new Dimension2(13, 26);
const TRACK_SIZE = new Dimension2(100, 5);
let VoicingPanelSection = class VoicingPanelSection extends PreferencesPanelSection {
    /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param [providedOptions]
   */ constructor(audioModel, providedOptions){
        // Voicing feature only works when running in English. If running in a version where you can change locale,
        // indicate through the title that the feature will only work in English.
        const titleStringProperty = localeProperty.availableRuntimeLocales && localeProperty.supportsDynamicLocale ? voicingEnglishOnlyLabelStringProperty : voicingLabelStringProperty;
        // the checkbox is the title for the section and totally enables/disables the feature
        const voicingLabel = new Text(titleStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
        const voicingEnabledReadingBlockNameResponsePatternStringProperty = new PatternStringProperty(labelledDescriptionPatternStringProperty, {
            label: titleStringProperty,
            description: voicingDescriptionStringProperty
        }, {
            tandem: Tandem.OPT_OUT
        });
        const voicingEnabledSwitchVoicingText = new VoicingText(voicingDescriptionStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
            readingBlockNameResponse: voicingEnabledReadingBlockNameResponsePatternStringProperty
        }));
        const voicingToggleSwitch = new ToggleSwitch(audioModel.voicingEnabledProperty, false, true, combineOptions({
            accessibleName: titleStringProperty
        }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
        const voicingEnabledSwitch = new PreferencesControl({
            labelNode: voicingLabel,
            descriptionNode: voicingEnabledSwitchVoicingText,
            allowDescriptionStretch: false,
            controlNode: voicingToggleSwitch
        });
        // checkbox for the toolbar
        const quickAccessLabel = new Text(toolbarLabelStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS);
        const toolbarToggleSwitch = new ToggleSwitch(audioModel.toolbarEnabledProperty, false, true, combineOptions({
            accessibleName: toolbarLabelStringProperty,
            leftValueContextResponse: toolbarRemovedStringProperty,
            rightValueContextResponse: toolbarAddedStringProperty
        }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS));
        const toolbarEnabledSwitch = new PreferencesControl({
            labelNode: quickAccessLabel,
            controlNode: toolbarToggleSwitch
        });
        // Speech output levels
        const speechOutputLabel = new Text(simVoicingOptionsStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {
            // pdom
            tagName: 'h3',
            innerContent: simVoicingOptionsStringProperty
        }));
        const speechOutputReadingBlockNameResponsePatternStringProperty = new PatternStringProperty(labelledDescriptionPatternStringProperty, {
            label: simVoicingOptionsStringProperty,
            description: simVoicingDescriptionStringProperty
        }, {
            tandem: Tandem.OPT_OUT
        });
        const speechOutputDescription = new VoicingText(simVoicingDescriptionStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
            readingBlockNameResponse: speechOutputReadingBlockNameResponsePatternStringProperty
        }));
        /**
     * Create a checkbox for the features of voicing content with a label.
     */ const createCheckbox = (labelString, property, checkedContextResponse, uncheckedContextResponse, disposable)=>{
            const labelNode = new Text(labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS);
            const checkbox = new Checkbox(property, labelNode, {
                // pdom
                labelTagName: 'label',
                labelContent: labelString,
                // voicing
                voicingNameResponse: labelString,
                voicingIgnoreVoicingManagerProperties: true,
                voiceNameResponseOnSelection: false,
                // both pdom and voicing
                checkedContextResponse: checkedContextResponse,
                uncheckedContextResponse: uncheckedContextResponse,
                // phet-io
                tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
            });
            return checkbox;
        };
        const speechOutputContent = new Node();
        const speechOutputCheckboxes = new VBox({
            align: 'left',
            spacing: PreferencesDialog.VERTICAL_CONTENT_SPACING,
            children: [
                createCheckbox(objectDetailsLabelStringProperty, audioModel.voicingObjectResponsesEnabledProperty, voicingObjectChangesStringProperty, objectChangesMutedStringProperty, speechOutputLabel),
                createCheckbox(contextChangesLabelStringProperty, audioModel.voicingContextResponsesEnabledProperty, voicingContextChangesStringProperty, contextChangesMutedStringProperty, speechOutputLabel),
                createCheckbox(helpfulHintsLabelStringProperty, audioModel.voicingHintResponsesEnabledProperty, voicingHintsStringProperty, hintsMutedStringProperty, speechOutputLabel)
            ]
        });
        speechOutputContent.children = [
            speechOutputLabel,
            speechOutputDescription,
            speechOutputCheckboxes
        ];
        speechOutputDescription.leftTop = speechOutputLabel.leftBottom.plusXY(0, PreferencesDialog.VERTICAL_CONTENT_SPACING);
        speechOutputCheckboxes.leftTop = speechOutputDescription.leftBottom.plusXY(PreferencesDialog.CONTENT_INDENTATION_SPACING, PreferencesDialog.VERTICAL_CONTENT_SPACING);
        const rateSlider = new VoiceRateNumberControl(rateStringProperty, rateLabelStringProperty, audioModel.voiceRateProperty);
        const pitchSlider = new VoicingPitchSlider(pitchStringProperty, audioModel.voicePitchProperty);
        const voiceOptionsContent = new VBox({
            spacing: PreferencesDialog.VERTICAL_CONTENT_SPACING,
            align: 'left',
            children: [
                rateSlider,
                pitchSlider
            ]
        });
        // voice options
        const voiceOptionsLabel = new Text(customizeVoiceStringProperty, merge({}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {
            cursor: 'pointer'
        }));
        const voiceOptionsOpenProperty = new BooleanProperty(false);
        const expandCollapseButton = new ExpandCollapseButton(voiceOptionsOpenProperty, {
            sideLength: 16,
            // pdom
            innerContent: customizeVoiceStringProperty,
            // voicing
            voicingNameResponse: customizeVoiceStringProperty,
            voicingIgnoreVoicingManagerProperties: true,
            // phet-io
            tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
        });
        const voiceOptionsContainer = new Node({
            children: [
                voiceOptionsLabel,
                expandCollapseButton
            ]
        });
        // the visual title of the ExpandCollapseButton needs to be clickable
        const voiceOptionsPressListener = new PressListener({
            press: ()=>{
                voiceOptionsOpenProperty.toggle();
            },
            // phet-io
            tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
        });
        voiceOptionsLabel.addInputListener(voiceOptionsPressListener);
        const content = new Node({
            children: [
                speechOutputContent,
                toolbarEnabledSwitch,
                voiceOptionsContainer,
                voiceOptionsContent
            ]
        });
        // layout for section content, custom rather than using a FlowBox because the voice options label needs
        // to be left aligned with other labels, while the ExpandCollapseButton extends to the left
        toolbarEnabledSwitch.leftTop = speechOutputContent.leftBottom.plusXY(0, 20);
        voiceOptionsLabel.leftTop = toolbarEnabledSwitch.leftBottom.plusXY(0, 20);
        expandCollapseButton.leftCenter = voiceOptionsLabel.rightCenter.plusXY(10, 0);
        voiceOptionsContent.leftTop = voiceOptionsLabel.leftBottom.plusXY(0, 10);
        voiceOptionsOpenProperty.link((open)=>{
            voiceOptionsContent.visible = open;
        });
        // the focus highlight for the voice options expand collapse button should surround the label
        expandCollapseButton.focusHighlight = new HighlightFromNode(voiceOptionsContainer);
        super({
            titleNode: voicingEnabledSwitch,
            contentNode: content
        });
        const contentVisibilityListener = (enabled)=>{
            content.visible = enabled;
        };
        audioModel.voicingEnabledProperty.link(contentVisibilityListener);
        const localeListener = (locale)=>{
            voicingEnabledSwitch.enabledProperty.value = locale.startsWith('en');
        };
        localeProperty.link(localeListener);
        // Speak when voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
        // in response to user input, otherwise all speech will be blocked on many platforms
        const voicingEnabledUtterance = new Utterance();
        const voicingEnabledPropertyListener = (enabled)=>{
            // only speak if "Sim Voicing" is on, all voicing should be disabled except for the Toolbar
            // buttons in this case
            if (audioModel.voicingMainWindowVoicingEnabledProperty.value) {
                // If locale changes, make sure to describe that Voicing has become disabled because Voicing is only available
                // in the English locale.
                voicingEnabledUtterance.alert = enabled ? voicingEnabledStringProperty : localeProperty.value.startsWith('en') ? voicingDisabledStringProperty : voicingOffOnlyAvailableInEnglishStringProperty;
                // PhET-iO Archetypes should never voice responses.
                if (!this.isInsidePhetioArchetype()) {
                    voicingManager.speakIgnoringEnabled(voicingEnabledUtterance);
                }
                this.alertDescriptionUtterance(voicingEnabledUtterance);
            }
        };
        audioModel.voicingEnabledProperty.lazyLink(voicingEnabledPropertyListener);
        // when the list of voices for the ComboBox changes, create a new ComboBox that includes the supported
        // voices. Eagerly create the first ComboBox, even if no voices are available.
        let voiceComboBox = null;
        const voicesChangedListener = (voices)=>{
            if (voiceComboBox) {
                voiceOptionsContent.removeChild(voiceComboBox);
                // Disposal is required before creating a new one when available voices change
                voiceComboBox.dispose();
            }
            let voiceList = [];
            // Only get the prioritized and pruned list of voices if the VoicingManager has voices
            // available, otherwise wait until they are available. If there are no voices available VoiceComboBox will handle
            // that gracefully.
            // Voice changing is not (as of this writing) available on MacOS or iOS, but we hope they fix that bug soon. Perhaps
            // next time someone is working in this area, they can check and see if it is working, https://github.com/phetsims/utterance-queue/issues/74
            if (voices.length > 0) {
                // For now, only English voices are available because the Voicing feature is not translatable.
                const prioritizedVoices = voicingManager.getEnglishPrioritizedVoices();
                // limit the voices for now to keep the size of the ComboBox manageable
                voiceList = prioritizedVoices.slice(0, 12);
            }
            // phet-io - for when creating the Archetype for the Capsule housing the preferencesDialog, we don't have a sim global.
            // TODO: topLayer should be private, see https://github.com/phetsims/joist/issues/841
            const parent = phet.joist.sim.topLayer || new Node();
            voiceComboBox = new VoiceComboBox(audioModel.voiceProperty, voiceList, parent);
            voiceOptionsContent.addChild(voiceComboBox);
        };
        voicingManager.voicesProperty.link(voicesChangedListener);
        voiceOptionsOpenProperty.lazyLink((open)=>{
            const alertStringProperty = open ? customizeVoiceExpandedStringProperty : customizeVoiceCollapsedStringProperty;
            expandCollapseButton.voicingSpeakContextResponse({
                contextResponse: alertStringProperty
            });
            this.alertDescriptionUtterance(alertStringProperty);
        });
    }
};
/**
 * Create a NumberControl for one of the voice parameters of voicing (pitch/rate).
 *
 * @param labelString - label for the NumberControl
 * @param a11yNameString - label for both PDOM and Voicing content
 * @param voiceRateProperty
 */ let VoiceRateNumberControl = class VoiceRateNumberControl extends NumberControl {
    constructor(labelString, a11yNameString, voiceRateProperty){
        super(labelString, voiceRateProperty, voiceRateProperty.range, {
            includeArrowButtons: false,
            layoutFunction: NumberControl.createLayoutFunction4(),
            delta: 0.25,
            accessibleName: a11yNameString,
            titleNodeOptions: merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
                maxWidth: 45
            }),
            numberDisplayOptions: {
                decimalPlaces: 2,
                valuePattern: voiceVariablesPatternStringProperty,
                textOptions: merge({}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
                    maxWidth: 45
                })
            },
            sliderOptions: {
                thumbSize: THUMB_SIZE,
                trackSize: TRACK_SIZE,
                keyboardStep: 0.25,
                minorTickSpacing: 0.25,
                // voicing
                voicingOnEndResponseOptions: {
                    withNameResponse: true
                }
            },
            // phet-io
            tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
        });
        // Voicing goes through the NumberControl slider through AccessibleValueHandler
        this.slider.voicingNameResponse = a11yNameString;
        // ignore the selections of the PreferencesDialog, we always want to hear all responses
        // that happen when changing the voice attributes
        this.slider.voicingIgnoreVoicingManagerProperties = true;
        const voiceRateNonNormalPatternStringProperty = new PatternStringProperty(voiceRateDescriptionPatternStringProperty, {
            value: voiceRateProperty
        }, {
            tandem: Tandem.OPT_OUT
        });
        const voiceRateResponseProperty = new DerivedProperty([
            voiceRateProperty,
            voiceRateNormalStringProperty,
            voiceRateNonNormalPatternStringProperty
        ], (rate, normal, nonNormal)=>{
            return rate === 1 ? normal : nonNormal;
        });
        this.slider.voicingObjectResponse = voiceRateResponseProperty;
    }
};
/**
 * Inner class for the ComboBox that selects the voice for the voicingManager. This ComboBox can be created and destroyed
 * a few times as the browser list of supported voices may change while the SpeechSynthesis is first getting put to
 * use.
 */ let VoiceComboBox = class VoiceComboBox extends ComboBox {
    dispose() {
        this.disposeVoiceComboBox();
        super.dispose();
    }
    /**
   * @param  voiceProperty
   * @param voices - list of voices to include from the voicingManager
   * @param parentNode - node that acts as a parent for the ComboBox list
   * @param [providedOptions]
   */ constructor(voiceProperty, voices, parentNode, providedOptions){
        const options = optionize()({
            listPosition: 'above',
            accessibleName: voiceLabelStringProperty,
            comboBoxVoicingNameResponsePattern: voiceTitlePatternLabelStringProperty.value,
            // phet-io
            // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
            // Furthermore, opt out because we would need to instrument voices, but those could change between runtimes.
            tandem: Tandem.OPT_OUT
        }, providedOptions);
        const items = [];
        if (voices.length === 0) {
            items.push({
                value: null,
                createNode: (tandem)=>new Text(noVoicesAvailableStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS),
                accessibleName: noVoicesAvailableStringProperty
            });
        }
        voices.forEach((voice)=>{
            items.push({
                value: voice,
                createNode: (tandem)=>new Text(voice.name, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS),
                accessibleName: voice.name
            });
        });
        // since we are updating the list, set the VoiceProperty to the first available value, or null if there are
        // voices
        voiceProperty.set(items[0].value);
        super(voiceProperty, items, parentNode, options);
        // voicing -  responses for the button should always come through, regardless of user selection of
        // responses. As of 10/29/21, ComboBox will only read the name response (which are always read regardless)
        // so this isn't really necessary but it is prudent to include it anyway.
        this.button.voicingIgnoreVoicingManagerProperties = true;
        this.disposeVoiceComboBox = ()=>{
            items.forEach((item)=>{
                item.value = null;
            });
        };
    }
};
/**
 * A slider with labels and tick marks used to control voice rate of web speech synthesis.
 */ let VoicingPitchSlider = class VoicingPitchSlider extends VBox {
    /**
   * Gets a description of the pitch at the provided value from VOICE_PITCH_DESCRIPTION_MAP.
   */ getPitchDescriptionString(pitchValue) {
        let pitchDescription = '';
        VOICE_PITCH_DESCRIPTION_MAP.forEach((description, range)=>{
            if (range.contains(pitchValue)) {
                pitchDescription = description;
            }
        });
        assert && assert(pitchDescription, `no description found for pitch at value: ${pitchValue}`);
        return pitchDescription;
    }
    constructor(labelString, voicePitchProperty){
        const label = new Text(labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS);
        const voicePitchRange = voicePitchProperty.range;
        const slider = new HSlider(voicePitchProperty, voicePitchRange, {
            majorTickLength: 10,
            thumbSize: THUMB_SIZE,
            trackSize: TRACK_SIZE,
            keyboardStep: 0.25,
            shiftKeyboardStep: 0.1,
            // constrain the value to the nearest hundredths place so there is no overlap in described ranges in
            // VOICE_PITCH_DESCRIPTION_MAP
            constrainValue: (value)=>Utils.roundToInterval(value, 0.01),
            // pdom
            labelTagName: 'label',
            labelContent: labelString,
            // voicing
            voicingNameResponse: labelString,
            // Voicing controls should not respect voicing response controls so user always hears information about them
            voicingIgnoreVoicingManagerProperties: true,
            // phet-io
            tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
        });
        const lowLabel = new Text('Low', {
            font: new PhetFont(14)
        });
        slider.addMajorTick(voicePitchRange.min, lowLabel);
        const highLabel = new Text('High', {
            font: new PhetFont(14)
        });
        slider.addMajorTick(voicePitchRange.max, highLabel);
        super();
        // voicing
        const voicePitchListener = (pitch, previousValue)=>{
            slider.voicingObjectResponse = this.getPitchDescriptionString(pitch);
        };
        voicePitchProperty.link(voicePitchListener);
        this.mutate({
            children: [
                label,
                slider
            ],
            spacing: 5
        });
    }
};
joist.register('VoicingPanelSection', VoicingPanelSection);
export default VoicingPanelSection;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ZvaWNpbmdQYW5lbFNlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIHNlY3Rpb24gb2YgUHJlZmVyZW5jZXNEaWFsb2cgY29udGVudCBpbiB0aGUgXCJBdWRpb1wiIHBhbmVsIHJlbGF0ZWQgdG8gdm9pY2luZy5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgdHlwZSBEaXNwb3NhYmxlIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGlzcG9zYWJsZS5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgSGlnaGxpZ2h0RnJvbU5vZGUsIE5vZGUsIFByZXNzTGlzdGVuZXIsIFRleHQsIFZCb3gsIHZvaWNpbmdNYW5hZ2VyLCBWb2ljaW5nVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveEl0ZW0sIENvbWJvQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveC5qcyc7XG5pbXBvcnQgRXhwYW5kQ29sbGFwc2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0V4cGFuZENvbGxhcHNlQnV0dG9uLmpzJztcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcbmltcG9ydCBUb2dnbGVTd2l0Y2gsIHsgVG9nZ2xlU3dpdGNoT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9Ub2dnbGVTd2l0Y2guanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgbG9jYWxlUHJvcGVydHksIHsgTG9jYWxlIH0gZnJvbSAnLi4vaTE4bi9sb2NhbGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzQ29udHJvbCBmcm9tICcuL1ByZWZlcmVuY2VzQ29udHJvbC5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cy5qcyc7XG5pbXBvcnQgeyBBdWRpb01vZGVsIH0gZnJvbSAnLi9QcmVmZXJlbmNlc01vZGVsLmpzJztcbmltcG9ydCBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbiwgeyBQcmVmZXJlbmNlc1BhbmVsU2VjdGlvbk9wdGlvbnMgfSBmcm9tICcuL1ByZWZlcmVuY2VzUGFuZWxTZWN0aW9uLmpzJztcblxuLy8gY29uc3RhbnRzXG4vLyBub25lIG9mIHRoZSBWb2ljaW5nIHN0cmluZ3Mgb3IgZmVhdHVyZSBpcyB0cmFuc2xhdGFibGUgeWV0LCBhbGwgc3RyaW5ncyBpbiB0aGlzIGZpbGVcbi8vIGFyZSBuZXN0ZWQgdW5kZXIgdGhlICdhMTF5JyBzZWN0aW9uIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZXkgYXJlIG5vdCB0cmFuc2xhdGFibGVcbmNvbnN0IHZvaWNpbmdMYWJlbFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnRpdGxlU3RyaW5nUHJvcGVydHk7XG5jb25zdCB0b29sYmFyTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy50b29sYmFyLnRpdGxlU3RyaW5nUHJvcGVydHk7XG5jb25zdCByYXRlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS50aXRsZVN0cmluZ1Byb3BlcnR5O1xuY29uc3QgcmF0ZUxhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS5sYWJlbFN0cmluZ1N0cmluZ1Byb3BlcnR5O1xuY29uc3QgcGl0Y2hTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5waXRjaC50aXRsZVN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgdm9pY2luZ0VuYWJsZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy52b2ljaW5nT25TdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHZvaWNpbmdEaXNhYmxlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnZvaWNpbmdPZmZTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHZvaWNpbmdPZmZPbmx5QXZhaWxhYmxlSW5FbmdsaXNoU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcudm9pY2luZ09mZk9ubHlBdmFpbGFibGVJbkVuZ2xpc2hTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHZvaWNlVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UudGl0bGVTdHJpbmdQcm9wZXJ0eTtcblxuY29uc3QgdG9vbGJhclJlbW92ZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy50b29sYmFyLnRvb2xiYXJSZW1vdmVkU3RyaW5nUHJvcGVydHk7XG5jb25zdCB0b29sYmFyQWRkZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy50b29sYmFyLnRvb2xiYXJBZGRlZFN0cmluZ1Byb3BlcnR5O1xuXG5jb25zdCBzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLnRpdGxlU3RyaW5nUHJvcGVydHk7XG5jb25zdCBzaW1Wb2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5kZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5O1xuXG5jb25zdCBvYmplY3REZXRhaWxzTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5zaW1Wb2ljaW5nT3B0aW9ucy5vYmplY3REZXRhaWxzLmxhYmVsU3RyaW5nUHJvcGVydHk7XG5jb25zdCBjb250ZXh0Q2hhbmdlc0xhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuY29udGV4dENoYW5nZXMubGFiZWxTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IGhlbHBmdWxIaW50c0xhYmVsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuaGVscGZ1bEhpbnRzLmxhYmVsU3RyaW5nUHJvcGVydHk7XG5cbmNvbnN0IHZvaWNpbmdPYmplY3RDaGFuZ2VzU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMub2JqZWN0RGV0YWlscy5lbmFibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IG9iamVjdENoYW5nZXNNdXRlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLm9iamVjdERldGFpbHMuZGlzYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgdm9pY2luZ0NvbnRleHRDaGFuZ2VzU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuY29udGV4dENoYW5nZXMuZW5hYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XG5jb25zdCBjb250ZXh0Q2hhbmdlc011dGVkU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuY29udGV4dENoYW5nZXMuZGlzYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgdm9pY2luZ0hpbnRzU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuc2ltVm9pY2luZ09wdGlvbnMuaGVscGZ1bEhpbnRzLmVuYWJsZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xuY29uc3QgaGludHNNdXRlZFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLnNpbVZvaWNpbmdPcHRpb25zLmhlbHBmdWxIaW50cy5kaXNhYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHk7XG5cbmNvbnN0IHZvaWNlTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS52b2ljZS50aXRsZVN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgdm9pY2VUaXRsZVBhdHRlcm5MYWJlbFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnZvaWNlLnRpdGxlUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgbm9Wb2ljZXNBdmFpbGFibGVTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS52b2ljZS5ub1ZvaWNlc0F2YWlsYWJsZVN0cmluZ1Byb3BlcnR5O1xuXG5jb25zdCBjdXN0b21pemVWb2ljZUV4cGFuZGVkU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UuZXhwYW5kZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xuY29uc3QgY3VzdG9taXplVm9pY2VDb2xsYXBzZWRTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5jb2xsYXBzZWRBbGVydFN0cmluZ1Byb3BlcnR5O1xuXG5jb25zdCB2b2ljZVJhdGVEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS53cml0dGVuVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xuY29uc3QgbGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMubGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcblxuY29uc3Qgdm9pY2VSYXRlTm9ybWFsU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS5yYW5nZURlc2NyaXB0aW9ucy52b2ljZVJhdGVOb3JtYWxTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IGluTG93UmFuZ2VTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5yYXRlLnJhbmdlRGVzY3JpcHRpb25zLmxvd1N0cmluZ1Byb3BlcnR5O1xuY29uc3QgaW5Ob3JtYWxSYW5nZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkucHJlZmVyZW5jZXMudGFicy5hdWRpby52b2ljaW5nLmN1c3RvbWl6ZVZvaWNlLnJhdGUucmFuZ2VEZXNjcmlwdGlvbnMubm9ybWFsU3RyaW5nUHJvcGVydHk7XG5jb25zdCBhYm92ZU5vcm1hbFJhbmdlU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuY3VzdG9taXplVm9pY2UucmF0ZS5yYW5nZURlc2NyaXB0aW9ucy5hYm92ZU5vcm1hbFN0cmluZ1Byb3BlcnR5O1xuY29uc3QgaW5IaWdoUmFuZ2VTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy5jdXN0b21pemVWb2ljZS5yYXRlLnJhbmdlRGVzY3JpcHRpb25zLmhpZ2hTdHJpbmdQcm9wZXJ0eTtcblxuLy8gVm9pY2luZyBjYW4gYXBwZWFyIGJ1dCBiZWNvbWUgZGlzYWJsZWQgd2hlbiBydW5uaW5nIHdpdGggbXVsdGlwbGUgbG9jYWxlcy4gVGhpcyB0cmFuc2xhdGFibGUgbGFiZWwgaXMgcHJlc2VudCBmb3Jcbi8vIHRyYW5zbGF0ZWQgc2ltcyBpbiB0aGlzIGNhc2UuXG5jb25zdCB2b2ljaW5nRW5nbGlzaE9ubHlMYWJlbFN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMuYXVkaW8udm9pY2luZy50aXRsZUVuZ2xpc2hPbmx5U3RyaW5nUHJvcGVydHk7XG5jb25zdCB2b2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5wcmVmZXJlbmNlcy50YWJzLmF1ZGlvLnZvaWNpbmcuZGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcblxuY29uc3QgVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQID0gbmV3IE1hcCgpO1xuVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQLnNldCggbmV3IFJhbmdlKCAwLjUsIDAuNzUgKSwgaW5Mb3dSYW5nZVN0cmluZ1Byb3BlcnR5ICk7XG5WT0lDRV9QSVRDSF9ERVNDUklQVElPTl9NQVAuc2V0KCBuZXcgUmFuZ2UoIDAuNzUsIDEuMjUgKSwgaW5Ob3JtYWxSYW5nZVN0cmluZ1Byb3BlcnR5ICk7XG5WT0lDRV9QSVRDSF9ERVNDUklQVElPTl9NQVAuc2V0KCBuZXcgUmFuZ2UoIDEuMjUsIDEuNSApLCBhYm92ZU5vcm1hbFJhbmdlU3RyaW5nUHJvcGVydHkgKTtcblZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUC5zZXQoIG5ldyBSYW5nZSggMS41LCAyICksIGluSGlnaFJhbmdlU3RyaW5nUHJvcGVydHkgKTtcblxuY29uc3QgVEhVTUJfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxMywgMjYgKTtcbmNvbnN0IFRSQUNLX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTAwLCA1ICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBWb2ljaW5nUGFuZWxTZWN0aW9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb25PcHRpb25zO1xuXG5jbGFzcyBWb2ljaW5nUGFuZWxTZWN0aW9uIGV4dGVuZHMgUHJlZmVyZW5jZXNQYW5lbFNlY3Rpb24ge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gYXVkaW9Nb2RlbCAtIGNvbmZpZ3VyYXRpb24gZm9yIGF1ZGlvIHNldHRpbmdzLCBzZWUgUHJlZmVyZW5jZXNNb2RlbFxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYXVkaW9Nb2RlbDogQXVkaW9Nb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogVm9pY2luZ1BhbmVsU2VjdGlvbk9wdGlvbnMgKSB7XG5cbiAgICAvLyBWb2ljaW5nIGZlYXR1cmUgb25seSB3b3JrcyB3aGVuIHJ1bm5pbmcgaW4gRW5nbGlzaC4gSWYgcnVubmluZyBpbiBhIHZlcnNpb24gd2hlcmUgeW91IGNhbiBjaGFuZ2UgbG9jYWxlLFxuICAgIC8vIGluZGljYXRlIHRocm91Z2ggdGhlIHRpdGxlIHRoYXQgdGhlIGZlYXR1cmUgd2lsbCBvbmx5IHdvcmsgaW4gRW5nbGlzaC5cbiAgICBjb25zdCB0aXRsZVN0cmluZ1Byb3BlcnR5ID0gKCBsb2NhbGVQcm9wZXJ0eS5hdmFpbGFibGVSdW50aW1lTG9jYWxlcyAmJiBsb2NhbGVQcm9wZXJ0eS5zdXBwb3J0c0R5bmFtaWNMb2NhbGUgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZvaWNpbmdFbmdsaXNoT25seUxhYmVsU3RyaW5nUHJvcGVydHkgOiB2b2ljaW5nTGFiZWxTdHJpbmdQcm9wZXJ0eTtcblxuICAgIC8vIHRoZSBjaGVja2JveCBpcyB0aGUgdGl0bGUgZm9yIHRoZSBzZWN0aW9uIGFuZCB0b3RhbGx5IGVuYWJsZXMvZGlzYWJsZXMgdGhlIGZlYXR1cmVcbiAgICBjb25zdCB2b2ljaW5nTGFiZWwgPSBuZXcgVGV4dCggdGl0bGVTdHJpbmdQcm9wZXJ0eSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9MQUJFTF9PUFRJT05TICk7XG4gICAgY29uc3Qgdm9pY2luZ0VuYWJsZWRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBsYWJlbGxlZERlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBsYWJlbDogdGl0bGVTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIGRlc2NyaXB0aW9uOiB2b2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxuICAgIH0sIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgY29uc3Qgdm9pY2luZ0VuYWJsZWRTd2l0Y2hWb2ljaW5nVGV4dCA9IG5ldyBWb2ljaW5nVGV4dCggdm9pY2luZ0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHksIG1lcmdlKCB7fSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMsIHtcbiAgICAgIHJlYWRpbmdCbG9ja05hbWVSZXNwb25zZTogdm9pY2luZ0VuYWJsZWRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHlcbiAgICB9ICkgKTtcbiAgICBjb25zdCB2b2ljaW5nVG9nZ2xlU3dpdGNoID0gbmV3IFRvZ2dsZVN3aXRjaCggYXVkaW9Nb2RlbC52b2ljaW5nRW5hYmxlZFByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwgY29tYmluZU9wdGlvbnM8VG9nZ2xlU3dpdGNoT3B0aW9ucz4oIHtcbiAgICAgIGFjY2Vzc2libGVOYW1lOiB0aXRsZVN0cmluZ1Byb3BlcnR5XG4gICAgfSwgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuVE9HR0xFX1NXSVRDSF9PUFRJT05TICkgKTtcbiAgICBjb25zdCB2b2ljaW5nRW5hYmxlZFN3aXRjaCA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcbiAgICAgIGxhYmVsTm9kZTogdm9pY2luZ0xhYmVsLFxuICAgICAgZGVzY3JpcHRpb25Ob2RlOiB2b2ljaW5nRW5hYmxlZFN3aXRjaFZvaWNpbmdUZXh0LFxuICAgICAgYWxsb3dEZXNjcmlwdGlvblN0cmV0Y2g6IGZhbHNlLFxuICAgICAgY29udHJvbE5vZGU6IHZvaWNpbmdUb2dnbGVTd2l0Y2hcbiAgICB9ICk7XG5cbiAgICAvLyBjaGVja2JveCBmb3IgdGhlIHRvb2xiYXJcbiAgICBjb25zdCBxdWlja0FjY2Vzc0xhYmVsID0gbmV3IFRleHQoIHRvb2xiYXJMYWJlbFN0cmluZ1Byb3BlcnR5LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMgKTtcbiAgICBjb25zdCB0b29sYmFyVG9nZ2xlU3dpdGNoID0gbmV3IFRvZ2dsZVN3aXRjaCggYXVkaW9Nb2RlbC50b29sYmFyRW5hYmxlZFByb3BlcnR5LCBmYWxzZSwgdHJ1ZSwgY29tYmluZU9wdGlvbnM8VG9nZ2xlU3dpdGNoT3B0aW9ucz4oIHtcbiAgICAgIGFjY2Vzc2libGVOYW1lOiB0b29sYmFyTGFiZWxTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIGxlZnRWYWx1ZUNvbnRleHRSZXNwb25zZTogdG9vbGJhclJlbW92ZWRTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIHJpZ2h0VmFsdWVDb250ZXh0UmVzcG9uc2U6IHRvb2xiYXJBZGRlZFN0cmluZ1Byb3BlcnR5XG4gICAgfSwgUHJlZmVyZW5jZXNEaWFsb2dDb25zdGFudHMuVE9HR0xFX1NXSVRDSF9PUFRJT05TICkgKTtcbiAgICBjb25zdCB0b29sYmFyRW5hYmxlZFN3aXRjaCA9IG5ldyBQcmVmZXJlbmNlc0NvbnRyb2woIHtcbiAgICAgIGxhYmVsTm9kZTogcXVpY2tBY2Nlc3NMYWJlbCxcbiAgICAgIGNvbnRyb2xOb2RlOiB0b29sYmFyVG9nZ2xlU3dpdGNoXG4gICAgfSApO1xuXG4gICAgLy8gU3BlZWNoIG91dHB1dCBsZXZlbHNcbiAgICBjb25zdCBzcGVlY2hPdXRwdXRMYWJlbCA9IG5ldyBUZXh0KCBzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5LCBtZXJnZSgge30sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fTEFCRUxfT1BUSU9OUywge1xuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnaDMnLFxuICAgICAgaW5uZXJDb250ZW50OiBzaW1Wb2ljaW5nT3B0aW9uc1N0cmluZ1Byb3BlcnR5XG4gICAgfSApICk7XG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0UmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggbGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgbGFiZWw6IHNpbVZvaWNpbmdPcHRpb25zU3RyaW5nUHJvcGVydHksXG4gICAgICBkZXNjcmlwdGlvbjogc2ltVm9pY2luZ0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHlcbiAgICB9LCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xuICAgIGNvbnN0IHNwZWVjaE91dHB1dERlc2NyaXB0aW9uID0gbmV3IFZvaWNpbmdUZXh0KCBzaW1Wb2ljaW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSwgbWVyZ2UoIHt9LCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUywge1xuICAgICAgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlOiBzcGVlY2hPdXRwdXRSZWFkaW5nQmxvY2tOYW1lUmVzcG9uc2VQYXR0ZXJuU3RyaW5nUHJvcGVydHlcbiAgICB9ICkgKTtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIGNoZWNrYm94IGZvciB0aGUgZmVhdHVyZXMgb2Ygdm9pY2luZyBjb250ZW50IHdpdGggYSBsYWJlbC5cbiAgICAgKi9cbiAgICBjb25zdCBjcmVhdGVDaGVja2JveCA9ICggbGFiZWxTdHJpbmc6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIHByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5jaGVja2VkQ29udGV4dFJlc3BvbnNlOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBkaXNwb3NhYmxlOiBEaXNwb3NhYmxlICk6IENoZWNrYm94ID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsTm9kZSA9IG5ldyBUZXh0KCBsYWJlbFN0cmluZywgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMgKTtcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBwcm9wZXJ0eSwgbGFiZWxOb2RlLCB7XG5cbiAgICAgICAgLy8gcGRvbVxuICAgICAgICBsYWJlbFRhZ05hbWU6ICdsYWJlbCcsXG4gICAgICAgIGxhYmVsQ29udGVudDogbGFiZWxTdHJpbmcsXG5cbiAgICAgICAgLy8gdm9pY2luZ1xuICAgICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBsYWJlbFN0cmluZyxcbiAgICAgICAgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllczogdHJ1ZSxcbiAgICAgICAgdm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbjogZmFsc2UsXG5cbiAgICAgICAgLy8gYm90aCBwZG9tIGFuZCB2b2ljaW5nXG4gICAgICAgIGNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IGNoZWNrZWRDb250ZXh0UmVzcG9uc2UsXG4gICAgICAgIHVuY2hlY2tlZENvbnRleHRSZXNwb25zZTogdW5jaGVja2VkQ29udGV4dFJlc3BvbnNlLFxuXG4gICAgICAgIC8vIHBoZXQtaW9cbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCAvLyBXZSBkb24ndCB3YW50IHRvIGluc3RydW1lbnQgY29tcG9uZW50cyBmb3IgcHJlZmVyZW5jZXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNzQ0I2lzc3VlY29tbWVudC0xMTk2MDI4MzYyXG4gICAgICB9ICk7XG5cbiAgICAgIHJldHVybiBjaGVja2JveDtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3BlZWNoT3V0cHV0Q29udGVudCA9IG5ldyBOb2RlKCk7XG5cbiAgICBjb25zdCBzcGVlY2hPdXRwdXRDaGVja2JveGVzID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBzcGFjaW5nOiBQcmVmZXJlbmNlc0RpYWxvZy5WRVJUSUNBTF9DT05URU5UX1NQQUNJTkcsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBjcmVhdGVDaGVja2JveCggb2JqZWN0RGV0YWlsc0xhYmVsU3RyaW5nUHJvcGVydHksIGF1ZGlvTW9kZWwudm9pY2luZ09iamVjdFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICAgICAgICB2b2ljaW5nT2JqZWN0Q2hhbmdlc1N0cmluZ1Byb3BlcnR5LCBvYmplY3RDaGFuZ2VzTXV0ZWRTdHJpbmdQcm9wZXJ0eSwgc3BlZWNoT3V0cHV0TGFiZWxcbiAgICAgICAgKSxcbiAgICAgICAgY3JlYXRlQ2hlY2tib3goIGNvbnRleHRDaGFuZ2VzTGFiZWxTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljaW5nQ29udGV4dFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICAgICAgICB2b2ljaW5nQ29udGV4dENoYW5nZXNTdHJpbmdQcm9wZXJ0eSwgY29udGV4dENoYW5nZXNNdXRlZFN0cmluZ1Byb3BlcnR5LCBzcGVlY2hPdXRwdXRMYWJlbFxuICAgICAgICApLFxuICAgICAgICBjcmVhdGVDaGVja2JveCggaGVscGZ1bEhpbnRzTGFiZWxTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljaW5nSGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSxcbiAgICAgICAgICB2b2ljaW5nSGludHNTdHJpbmdQcm9wZXJ0eSwgaGludHNNdXRlZFN0cmluZ1Byb3BlcnR5LCBzcGVlY2hPdXRwdXRMYWJlbFxuICAgICAgICApXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgc3BlZWNoT3V0cHV0Q29udGVudC5jaGlsZHJlbiA9IFsgc3BlZWNoT3V0cHV0TGFiZWwsIHNwZWVjaE91dHB1dERlc2NyaXB0aW9uLCBzcGVlY2hPdXRwdXRDaGVja2JveGVzIF07XG4gICAgc3BlZWNoT3V0cHV0RGVzY3JpcHRpb24ubGVmdFRvcCA9IHNwZWVjaE91dHB1dExhYmVsLmxlZnRCb3R0b20ucGx1c1hZKCAwLCBQcmVmZXJlbmNlc0RpYWxvZy5WRVJUSUNBTF9DT05URU5UX1NQQUNJTkcgKTtcbiAgICBzcGVlY2hPdXRwdXRDaGVja2JveGVzLmxlZnRUb3AgPSBzcGVlY2hPdXRwdXREZXNjcmlwdGlvbi5sZWZ0Qm90dG9tLnBsdXNYWSggUHJlZmVyZW5jZXNEaWFsb2cuQ09OVEVOVF9JTkRFTlRBVElPTl9TUEFDSU5HLCBQcmVmZXJlbmNlc0RpYWxvZy5WRVJUSUNBTF9DT05URU5UX1NQQUNJTkcgKTtcblxuICAgIGNvbnN0IHJhdGVTbGlkZXIgPSBuZXcgVm9pY2VSYXRlTnVtYmVyQ29udHJvbCggcmF0ZVN0cmluZ1Byb3BlcnR5LCByYXRlTGFiZWxTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljZVJhdGVQcm9wZXJ0eSApO1xuICAgIGNvbnN0IHBpdGNoU2xpZGVyID0gbmV3IFZvaWNpbmdQaXRjaFNsaWRlciggcGl0Y2hTdHJpbmdQcm9wZXJ0eSwgYXVkaW9Nb2RlbC52b2ljZVBpdGNoUHJvcGVydHkgKTtcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNDb250ZW50ID0gbmV3IFZCb3goIHtcbiAgICAgIHNwYWNpbmc6IFByZWZlcmVuY2VzRGlhbG9nLlZFUlRJQ0FMX0NPTlRFTlRfU1BBQ0lORyxcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICByYXRlU2xpZGVyLFxuICAgICAgICBwaXRjaFNsaWRlclxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIC8vIHZvaWNlIG9wdGlvbnNcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNMYWJlbCA9IG5ldyBUZXh0KCBjdXN0b21pemVWb2ljZVN0cmluZ1Byb3BlcnR5LCBtZXJnZSgge30sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fTEFCRUxfT1BUSU9OUywge1xuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9ICkgKTtcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNPcGVuUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIGNvbnN0IGV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IEV4cGFuZENvbGxhcHNlQnV0dG9uKCB2b2ljZU9wdGlvbnNPcGVuUHJvcGVydHksIHtcbiAgICAgIHNpZGVMZW5ndGg6IDE2LFxuXG4gICAgICAvLyBwZG9tXG4gICAgICBpbm5lckNvbnRlbnQ6IGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHksXG5cbiAgICAgIC8vIHZvaWNpbmdcbiAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IGN1c3RvbWl6ZVZvaWNlU3RyaW5nUHJvcGVydHksXG4gICAgICB2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzOiB0cnVlLCAvLyBDb250cm9scyBuZWVkIHRvIGFsd2F5cyBzcGVhayByZXNwb25zZXMgc28gVUkgZnVuY3Rpb25zIGFyZSBjbGVhclxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIFdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCBjb21wb25lbnRzIGZvciBwcmVmZXJlbmNlcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NDQjaXNzdWVjb21tZW50LTExOTYwMjgzNjJcbiAgICB9ICk7XG5cbiAgICBjb25zdCB2b2ljZU9wdGlvbnNDb250YWluZXIgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgdm9pY2VPcHRpb25zTGFiZWwsIGV4cGFuZENvbGxhcHNlQnV0dG9uIF1cbiAgICB9ICk7XG5cbiAgICAvLyB0aGUgdmlzdWFsIHRpdGxlIG9mIHRoZSBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBuZWVkcyB0byBiZSBjbGlja2FibGVcbiAgICBjb25zdCB2b2ljZU9wdGlvbnNQcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcbiAgICAgIHByZXNzOiAoKSA9PiB7XG4gICAgICAgIHZvaWNlT3B0aW9uc09wZW5Qcm9wZXJ0eS50b2dnbGUoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy8gV2UgZG9uJ3Qgd2FudCB0byBpbnN0cnVtZW50IGNvbXBvbmVudHMgZm9yIHByZWZlcmVuY2VzLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc0NCNpc3N1ZWNvbW1lbnQtMTE5NjAyODM2MlxuICAgIH0gKTtcbiAgICB2b2ljZU9wdGlvbnNMYWJlbC5hZGRJbnB1dExpc3RlbmVyKCB2b2ljZU9wdGlvbnNQcmVzc0xpc3RlbmVyICk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHNwZWVjaE91dHB1dENvbnRlbnQsIHRvb2xiYXJFbmFibGVkU3dpdGNoLCB2b2ljZU9wdGlvbnNDb250YWluZXIsIHZvaWNlT3B0aW9uc0NvbnRlbnQgXVxuICAgIH0gKTtcblxuICAgIC8vIGxheW91dCBmb3Igc2VjdGlvbiBjb250ZW50LCBjdXN0b20gcmF0aGVyIHRoYW4gdXNpbmcgYSBGbG93Qm94IGJlY2F1c2UgdGhlIHZvaWNlIG9wdGlvbnMgbGFiZWwgbmVlZHNcbiAgICAvLyB0byBiZSBsZWZ0IGFsaWduZWQgd2l0aCBvdGhlciBsYWJlbHMsIHdoaWxlIHRoZSBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBleHRlbmRzIHRvIHRoZSBsZWZ0XG4gICAgdG9vbGJhckVuYWJsZWRTd2l0Y2gubGVmdFRvcCA9IHNwZWVjaE91dHB1dENvbnRlbnQubGVmdEJvdHRvbS5wbHVzWFkoIDAsIDIwICk7XG4gICAgdm9pY2VPcHRpb25zTGFiZWwubGVmdFRvcCA9IHRvb2xiYXJFbmFibGVkU3dpdGNoLmxlZnRCb3R0b20ucGx1c1hZKCAwLCAyMCApO1xuICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnRDZW50ZXIgPSB2b2ljZU9wdGlvbnNMYWJlbC5yaWdodENlbnRlci5wbHVzWFkoIDEwLCAwICk7XG4gICAgdm9pY2VPcHRpb25zQ29udGVudC5sZWZ0VG9wID0gdm9pY2VPcHRpb25zTGFiZWwubGVmdEJvdHRvbS5wbHVzWFkoIDAsIDEwICk7XG4gICAgdm9pY2VPcHRpb25zT3BlblByb3BlcnR5LmxpbmsoIG9wZW4gPT4geyB2b2ljZU9wdGlvbnNDb250ZW50LnZpc2libGUgPSBvcGVuOyB9ICk7XG5cbiAgICAvLyB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZvciB0aGUgdm9pY2Ugb3B0aW9ucyBleHBhbmQgY29sbGFwc2UgYnV0dG9uIHNob3VsZCBzdXJyb3VuZCB0aGUgbGFiZWxcbiAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbi5mb2N1c0hpZ2hsaWdodCA9IG5ldyBIaWdobGlnaHRGcm9tTm9kZSggdm9pY2VPcHRpb25zQ29udGFpbmVyICk7XG5cbiAgICBzdXBlcigge1xuICAgICAgdGl0bGVOb2RlOiB2b2ljaW5nRW5hYmxlZFN3aXRjaCxcbiAgICAgIGNvbnRlbnROb2RlOiBjb250ZW50XG4gICAgfSApO1xuXG4gICAgY29uc3QgY29udGVudFZpc2liaWxpdHlMaXN0ZW5lciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcbiAgICAgIGNvbnRlbnQudmlzaWJsZSA9IGVuYWJsZWQ7XG4gICAgfTtcbiAgICBhdWRpb01vZGVsLnZvaWNpbmdFbmFibGVkUHJvcGVydHkubGluayggY29udGVudFZpc2liaWxpdHlMaXN0ZW5lciApO1xuXG4gICAgY29uc3QgbG9jYWxlTGlzdGVuZXIgPSAoIGxvY2FsZTogTG9jYWxlICkgPT4ge1xuICAgICAgdm9pY2luZ0VuYWJsZWRTd2l0Y2guZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gbG9jYWxlLnN0YXJ0c1dpdGgoICdlbicgKTtcbiAgICB9O1xuICAgIGxvY2FsZVByb3BlcnR5LmxpbmsoIGxvY2FsZUxpc3RlbmVyICk7XG5cbiAgICAvLyBTcGVhayB3aGVuIHZvaWNpbmcgYmVjb21lcyBpbml0aWFsbHkgZW5hYmxlZC4gRmlyc3Qgc3BlZWNoIGlzIGRvbmUgc3luY2hyb25vdXNseSAobm90IHVzaW5nIHV0dGVyYW5jZS1xdWV1ZSlcbiAgICAvLyBpbiByZXNwb25zZSB0byB1c2VyIGlucHV0LCBvdGhlcndpc2UgYWxsIHNwZWVjaCB3aWxsIGJlIGJsb2NrZWQgb24gbWFueSBwbGF0Zm9ybXNcbiAgICBjb25zdCB2b2ljaW5nRW5hYmxlZFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcbiAgICBjb25zdCB2b2ljaW5nRW5hYmxlZFByb3BlcnR5TGlzdGVuZXIgPSAoIGVuYWJsZWQ6IGJvb2xlYW4gKSA9PiB7XG5cbiAgICAgIC8vIG9ubHkgc3BlYWsgaWYgXCJTaW0gVm9pY2luZ1wiIGlzIG9uLCBhbGwgdm9pY2luZyBzaG91bGQgYmUgZGlzYWJsZWQgZXhjZXB0IGZvciB0aGUgVG9vbGJhclxuICAgICAgLy8gYnV0dG9ucyBpbiB0aGlzIGNhc2VcbiAgICAgIGlmICggYXVkaW9Nb2RlbC52b2ljaW5nTWFpbldpbmRvd1ZvaWNpbmdFbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XG5cbiAgICAgICAgLy8gSWYgbG9jYWxlIGNoYW5nZXMsIG1ha2Ugc3VyZSB0byBkZXNjcmliZSB0aGF0IFZvaWNpbmcgaGFzIGJlY29tZSBkaXNhYmxlZCBiZWNhdXNlIFZvaWNpbmcgaXMgb25seSBhdmFpbGFibGVcbiAgICAgICAgLy8gaW4gdGhlIEVuZ2xpc2ggbG9jYWxlLlxuICAgICAgICB2b2ljaW5nRW5hYmxlZFV0dGVyYW5jZS5hbGVydCA9IGVuYWJsZWQgPyB2b2ljaW5nRW5hYmxlZFN0cmluZ1Byb3BlcnR5IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGxvY2FsZVByb3BlcnR5LnZhbHVlLnN0YXJ0c1dpdGgoICdlbicgKSA/IHZvaWNpbmdEaXNhYmxlZFN0cmluZ1Byb3BlcnR5IDogdm9pY2luZ09mZk9ubHlBdmFpbGFibGVJbkVuZ2xpc2hTdHJpbmdQcm9wZXJ0eSApO1xuXG4gICAgICAgIC8vIFBoRVQtaU8gQXJjaGV0eXBlcyBzaG91bGQgbmV2ZXIgdm9pY2UgcmVzcG9uc2VzLlxuICAgICAgICBpZiAoICF0aGlzLmlzSW5zaWRlUGhldGlvQXJjaGV0eXBlKCkgKSB7XG4gICAgICAgICAgdm9pY2luZ01hbmFnZXIuc3BlYWtJZ25vcmluZ0VuYWJsZWQoIHZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB2b2ljaW5nRW5hYmxlZFV0dGVyYW5jZSApO1xuICAgICAgfVxuICAgIH07XG4gICAgYXVkaW9Nb2RlbC52b2ljaW5nRW5hYmxlZFByb3BlcnR5LmxhenlMaW5rKCB2b2ljaW5nRW5hYmxlZFByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIC8vIHdoZW4gdGhlIGxpc3Qgb2Ygdm9pY2VzIGZvciB0aGUgQ29tYm9Cb3ggY2hhbmdlcywgY3JlYXRlIGEgbmV3IENvbWJvQm94IHRoYXQgaW5jbHVkZXMgdGhlIHN1cHBvcnRlZFxuICAgIC8vIHZvaWNlcy4gRWFnZXJseSBjcmVhdGUgdGhlIGZpcnN0IENvbWJvQm94LCBldmVuIGlmIG5vIHZvaWNlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGxldCB2b2ljZUNvbWJvQm94OiBWb2ljZUNvbWJvQm94IHwgbnVsbCA9IG51bGw7XG4gICAgY29uc3Qgdm9pY2VzQ2hhbmdlZExpc3RlbmVyID0gKCB2b2ljZXM6IFNwZWVjaFN5bnRoZXNpc1ZvaWNlW10gKSA9PiB7XG4gICAgICBpZiAoIHZvaWNlQ29tYm9Cb3ggKSB7XG4gICAgICAgIHZvaWNlT3B0aW9uc0NvbnRlbnQucmVtb3ZlQ2hpbGQoIHZvaWNlQ29tYm9Cb3ggKTtcblxuICAgICAgICAvLyBEaXNwb3NhbCBpcyByZXF1aXJlZCBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgb25lIHdoZW4gYXZhaWxhYmxlIHZvaWNlcyBjaGFuZ2VcbiAgICAgICAgdm9pY2VDb21ib0JveC5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIGxldCB2b2ljZUxpc3Q6IFNwZWVjaFN5bnRoZXNpc1ZvaWNlW10gPSBbXTtcblxuICAgICAgLy8gT25seSBnZXQgdGhlIHByaW9yaXRpemVkIGFuZCBwcnVuZWQgbGlzdCBvZiB2b2ljZXMgaWYgdGhlIFZvaWNpbmdNYW5hZ2VyIGhhcyB2b2ljZXNcbiAgICAgIC8vIGF2YWlsYWJsZSwgb3RoZXJ3aXNlIHdhaXQgdW50aWwgdGhleSBhcmUgYXZhaWxhYmxlLiBJZiB0aGVyZSBhcmUgbm8gdm9pY2VzIGF2YWlsYWJsZSBWb2ljZUNvbWJvQm94IHdpbGwgaGFuZGxlXG4gICAgICAvLyB0aGF0IGdyYWNlZnVsbHkuXG4gICAgICAvLyBWb2ljZSBjaGFuZ2luZyBpcyBub3QgKGFzIG9mIHRoaXMgd3JpdGluZykgYXZhaWxhYmxlIG9uIE1hY09TIG9yIGlPUywgYnV0IHdlIGhvcGUgdGhleSBmaXggdGhhdCBidWcgc29vbi4gUGVyaGFwc1xuICAgICAgLy8gbmV4dCB0aW1lIHNvbWVvbmUgaXMgd29ya2luZyBpbiB0aGlzIGFyZWEsIHRoZXkgY2FuIGNoZWNrIGFuZCBzZWUgaWYgaXQgaXMgd29ya2luZywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3V0dGVyYW5jZS1xdWV1ZS9pc3N1ZXMvNzRcbiAgICAgIGlmICggdm9pY2VzLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgICAgLy8gRm9yIG5vdywgb25seSBFbmdsaXNoIHZvaWNlcyBhcmUgYXZhaWxhYmxlIGJlY2F1c2UgdGhlIFZvaWNpbmcgZmVhdHVyZSBpcyBub3QgdHJhbnNsYXRhYmxlLlxuICAgICAgICBjb25zdCBwcmlvcml0aXplZFZvaWNlcyA9IHZvaWNpbmdNYW5hZ2VyLmdldEVuZ2xpc2hQcmlvcml0aXplZFZvaWNlcygpO1xuXG4gICAgICAgIC8vIGxpbWl0IHRoZSB2b2ljZXMgZm9yIG5vdyB0byBrZWVwIHRoZSBzaXplIG9mIHRoZSBDb21ib0JveCBtYW5hZ2VhYmxlXG4gICAgICAgIHZvaWNlTGlzdCA9IHByaW9yaXRpemVkVm9pY2VzLnNsaWNlKCAwLCAxMiApO1xuICAgICAgfVxuXG4gICAgICAvLyBwaGV0LWlvIC0gZm9yIHdoZW4gY3JlYXRpbmcgdGhlIEFyY2hldHlwZSBmb3IgdGhlIENhcHN1bGUgaG91c2luZyB0aGUgcHJlZmVyZW5jZXNEaWFsb2csIHdlIGRvbid0IGhhdmUgYSBzaW0gZ2xvYmFsLlxuICAgICAgLy8gVE9ETzogdG9wTGF5ZXIgc2hvdWxkIGJlIHByaXZhdGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzg0MVxuICAgICAgY29uc3QgcGFyZW50ID0gcGhldC5qb2lzdC5zaW0udG9wTGF5ZXIgfHwgbmV3IE5vZGUoKTtcblxuICAgICAgdm9pY2VDb21ib0JveCA9IG5ldyBWb2ljZUNvbWJvQm94KCBhdWRpb01vZGVsLnZvaWNlUHJvcGVydHksIHZvaWNlTGlzdCwgcGFyZW50ICk7XG4gICAgICB2b2ljZU9wdGlvbnNDb250ZW50LmFkZENoaWxkKCB2b2ljZUNvbWJvQm94ICk7XG4gICAgfTtcbiAgICB2b2ljaW5nTWFuYWdlci52b2ljZXNQcm9wZXJ0eS5saW5rKCB2b2ljZXNDaGFuZ2VkTGlzdGVuZXIgKTtcblxuICAgIHZvaWNlT3B0aW9uc09wZW5Qcm9wZXJ0eS5sYXp5TGluayggb3BlbiA9PiB7XG4gICAgICBjb25zdCBhbGVydFN0cmluZ1Byb3BlcnR5ID0gb3BlbiA/IGN1c3RvbWl6ZVZvaWNlRXhwYW5kZWRTdHJpbmdQcm9wZXJ0eSA6IGN1c3RvbWl6ZVZvaWNlQ29sbGFwc2VkU3RyaW5nUHJvcGVydHk7XG4gICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbi52b2ljaW5nU3BlYWtDb250ZXh0UmVzcG9uc2UoIHtcbiAgICAgICAgY29udGV4dFJlc3BvbnNlOiBhbGVydFN0cmluZ1Byb3BlcnR5XG4gICAgICB9ICk7XG4gICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGFsZXJ0U3RyaW5nUHJvcGVydHkgKTtcbiAgICB9ICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBOdW1iZXJDb250cm9sIGZvciBvbmUgb2YgdGhlIHZvaWNlIHBhcmFtZXRlcnMgb2Ygdm9pY2luZyAocGl0Y2gvcmF0ZSkuXG4gKlxuICogQHBhcmFtIGxhYmVsU3RyaW5nIC0gbGFiZWwgZm9yIHRoZSBOdW1iZXJDb250cm9sXG4gKiBAcGFyYW0gYTExeU5hbWVTdHJpbmcgLSBsYWJlbCBmb3IgYm90aCBQRE9NIGFuZCBWb2ljaW5nIGNvbnRlbnRcbiAqIEBwYXJhbSB2b2ljZVJhdGVQcm9wZXJ0eVxuICovXG5jbGFzcyBWb2ljZVJhdGVOdW1iZXJDb250cm9sIGV4dGVuZHMgTnVtYmVyQ29udHJvbCB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYWJlbFN0cmluZzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgYTExeU5hbWVTdHJpbmc6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIHZvaWNlUmF0ZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSApIHtcblxuICAgIHN1cGVyKCBsYWJlbFN0cmluZywgdm9pY2VSYXRlUHJvcGVydHksIHZvaWNlUmF0ZVByb3BlcnR5LnJhbmdlLCB7XG4gICAgICBpbmNsdWRlQXJyb3dCdXR0b25zOiBmYWxzZSxcbiAgICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uNCgpLFxuICAgICAgZGVsdGE6IDAuMjUsXG4gICAgICBhY2Nlc3NpYmxlTmFtZTogYTExeU5hbWVTdHJpbmcsXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiBtZXJnZSgge30sIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TLCB7XG4gICAgICAgIG1heFdpZHRoOiA0NVxuICAgICAgfSApLFxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgZGVjaW1hbFBsYWNlczogMixcbiAgICAgICAgdmFsdWVQYXR0ZXJuOiB2b2ljZVZhcmlhYmxlc1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSxcbiAgICAgICAgdGV4dE9wdGlvbnM6IG1lcmdlKCB7fSwgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMsIHtcbiAgICAgICAgICBtYXhXaWR0aDogNDVcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAgc2xpZGVyT3B0aW9uczoge1xuICAgICAgICB0aHVtYlNpemU6IFRIVU1CX1NJWkUsXG4gICAgICAgIHRyYWNrU2l6ZTogVFJBQ0tfU0laRSxcbiAgICAgICAga2V5Ym9hcmRTdGVwOiAwLjI1LFxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAwLjI1LFxuXG4gICAgICAgIC8vIHZvaWNpbmdcbiAgICAgICAgdm9pY2luZ09uRW5kUmVzcG9uc2VPcHRpb25zOiB7XG4gICAgICAgICAgd2l0aE5hbWVSZXNwb25zZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIFdlIGRvbid0IHdhbnQgdG8gaW5zdHJ1bWVudCBjb21wb25lbnRzIGZvciBwcmVmZXJlbmNlcywgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83NDQjaXNzdWVjb21tZW50LTExOTYwMjgzNjJcbiAgICB9ICk7XG5cbiAgICAvLyBWb2ljaW5nIGdvZXMgdGhyb3VnaCB0aGUgTnVtYmVyQ29udHJvbCBzbGlkZXIgdGhyb3VnaCBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyXG4gICAgdGhpcy5zbGlkZXIudm9pY2luZ05hbWVSZXNwb25zZSA9IGExMXlOYW1lU3RyaW5nO1xuXG4gICAgLy8gaWdub3JlIHRoZSBzZWxlY3Rpb25zIG9mIHRoZSBQcmVmZXJlbmNlc0RpYWxvZywgd2UgYWx3YXlzIHdhbnQgdG8gaGVhciBhbGwgcmVzcG9uc2VzXG4gICAgLy8gdGhhdCBoYXBwZW4gd2hlbiBjaGFuZ2luZyB0aGUgdm9pY2UgYXR0cmlidXRlc1xuICAgIHRoaXMuc2xpZGVyLnZvaWNpbmdJZ25vcmVWb2ljaW5nTWFuYWdlclByb3BlcnRpZXMgPSB0cnVlO1xuXG4gICAgY29uc3Qgdm9pY2VSYXRlTm9uTm9ybWFsUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggdm9pY2VSYXRlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIHZhbHVlOiB2b2ljZVJhdGVQcm9wZXJ0eVxuICAgIH0sIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG5cbiAgICBjb25zdCB2b2ljZVJhdGVSZXNwb25zZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xuICAgICAgdm9pY2VSYXRlUHJvcGVydHksIHZvaWNlUmF0ZU5vcm1hbFN0cmluZ1Byb3BlcnR5LCB2b2ljZVJhdGVOb25Ob3JtYWxQYXR0ZXJuU3RyaW5nUHJvcGVydHlcbiAgICBdLCAoIHJhdGUsIG5vcm1hbCwgbm9uTm9ybWFsICkgPT4ge1xuICAgICAgcmV0dXJuIHJhdGUgPT09IDEgPyBub3JtYWwgOiBub25Ob3JtYWw7XG4gICAgfSApO1xuXG4gICAgdGhpcy5zbGlkZXIudm9pY2luZ09iamVjdFJlc3BvbnNlID0gdm9pY2VSYXRlUmVzcG9uc2VQcm9wZXJ0eTtcbiAgfVxufVxuXG50eXBlIFZvaWNlQ29tYm9Cb3hTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG50eXBlIFZvaWNlQ29tYm9Cb3hPcHRpb25zID0gVm9pY2VDb21ib0JveFNlbGZPcHRpb25zICYgQ29tYm9Cb3hPcHRpb25zO1xuXG4vKipcbiAqIElubmVyIGNsYXNzIGZvciB0aGUgQ29tYm9Cb3ggdGhhdCBzZWxlY3RzIHRoZSB2b2ljZSBmb3IgdGhlIHZvaWNpbmdNYW5hZ2VyLiBUaGlzIENvbWJvQm94IGNhbiBiZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWRcbiAqIGEgZmV3IHRpbWVzIGFzIHRoZSBicm93c2VyIGxpc3Qgb2Ygc3VwcG9ydGVkIHZvaWNlcyBtYXkgY2hhbmdlIHdoaWxlIHRoZSBTcGVlY2hTeW50aGVzaXMgaXMgZmlyc3QgZ2V0dGluZyBwdXQgdG9cbiAqIHVzZS5cbiAqL1xuY2xhc3MgVm9pY2VDb21ib0JveCBleHRlbmRzIENvbWJvQm94PFNwZWVjaFN5bnRoZXNpc1ZvaWNlIHwgbnVsbD4ge1xuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWb2ljZUNvbWJvQm94OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gIHZvaWNlUHJvcGVydHlcbiAgICogQHBhcmFtIHZvaWNlcyAtIGxpc3Qgb2Ygdm9pY2VzIHRvIGluY2x1ZGUgZnJvbSB0aGUgdm9pY2luZ01hbmFnZXJcbiAgICogQHBhcmFtIHBhcmVudE5vZGUgLSBub2RlIHRoYXQgYWN0cyBhcyBhIHBhcmVudCBmb3IgdGhlIENvbWJvQm94IGxpc3RcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHZvaWNlUHJvcGVydHk6IFByb3BlcnR5PFNwZWVjaFN5bnRoZXNpc1ZvaWNlIHwgbnVsbD4sIHZvaWNlczogU3BlZWNoU3ludGhlc2lzVm9pY2VbXSwgcGFyZW50Tm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQ29tYm9Cb3hPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Vm9pY2VDb21ib0JveE9wdGlvbnMsIFZvaWNlQ29tYm9Cb3hTZWxmT3B0aW9ucywgQ29tYm9Cb3hPcHRpb25zPigpKCB7XG4gICAgICBsaXN0UG9zaXRpb246ICdhYm92ZScsXG4gICAgICBhY2Nlc3NpYmxlTmFtZTogdm9pY2VMYWJlbFN0cmluZ1Byb3BlcnR5LFxuICAgICAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybjogdm9pY2VUaXRsZVBhdHRlcm5MYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICAvLyBXZSBkb24ndCB3YW50IHRvIGluc3RydW1lbnQgY29tcG9uZW50cyBmb3IgcHJlZmVyZW5jZXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNzQ0I2lzc3VlY29tbWVudC0xMTk2MDI4MzYyXG4gICAgICAvLyBGdXJ0aGVybW9yZSwgb3B0IG91dCBiZWNhdXNlIHdlIHdvdWxkIG5lZWQgdG8gaW5zdHJ1bWVudCB2b2ljZXMsIGJ1dCB0aG9zZSBjb3VsZCBjaGFuZ2UgYmV0d2VlbiBydW50aW1lcy5cbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGl0ZW1zOiBDb21ib0JveEl0ZW08U3BlZWNoU3ludGhlc2lzVm9pY2UgfCBudWxsPltdID0gW107XG5cbiAgICBpZiAoIHZvaWNlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICBpdGVtcy5wdXNoKCB7XG4gICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIG5vVm9pY2VzQXZhaWxhYmxlU3RyaW5nUHJvcGVydHksIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICksXG4gICAgICAgIGFjY2Vzc2libGVOYW1lOiBub1ZvaWNlc0F2YWlsYWJsZVN0cmluZ1Byb3BlcnR5XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgdm9pY2VzLmZvckVhY2goIHZvaWNlID0+IHtcbiAgICAgIGl0ZW1zLnB1c2goIHtcbiAgICAgICAgdmFsdWU6IHZvaWNlLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoIHZvaWNlLm5hbWUsIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TICksXG4gICAgICAgIGFjY2Vzc2libGVOYW1lOiB2b2ljZS5uYW1lXG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gc2luY2Ugd2UgYXJlIHVwZGF0aW5nIHRoZSBsaXN0LCBzZXQgdGhlIFZvaWNlUHJvcGVydHkgdG8gdGhlIGZpcnN0IGF2YWlsYWJsZSB2YWx1ZSwgb3IgbnVsbCBpZiB0aGVyZSBhcmVcbiAgICAvLyB2b2ljZXNcbiAgICB2b2ljZVByb3BlcnR5LnNldCggaXRlbXNbIDAgXS52YWx1ZSApO1xuXG4gICAgc3VwZXIoIHZvaWNlUHJvcGVydHksIGl0ZW1zLCBwYXJlbnROb2RlLCBvcHRpb25zICk7XG5cbiAgICAvLyB2b2ljaW5nIC0gIHJlc3BvbnNlcyBmb3IgdGhlIGJ1dHRvbiBzaG91bGQgYWx3YXlzIGNvbWUgdGhyb3VnaCwgcmVnYXJkbGVzcyBvZiB1c2VyIHNlbGVjdGlvbiBvZlxuICAgIC8vIHJlc3BvbnNlcy4gQXMgb2YgMTAvMjkvMjEsIENvbWJvQm94IHdpbGwgb25seSByZWFkIHRoZSBuYW1lIHJlc3BvbnNlICh3aGljaCBhcmUgYWx3YXlzIHJlYWQgcmVnYXJkbGVzcylcbiAgICAvLyBzbyB0aGlzIGlzbid0IHJlYWxseSBuZWNlc3NhcnkgYnV0IGl0IGlzIHBydWRlbnQgdG8gaW5jbHVkZSBpdCBhbnl3YXkuXG4gICAgdGhpcy5idXR0b24udm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllcyA9IHRydWU7XG4gICAgdGhpcy5kaXNwb3NlVm9pY2VDb21ib0JveCA9ICgpID0+IHtcbiAgICAgIGl0ZW1zLmZvckVhY2goIGl0ZW0gPT4ge1xuICAgICAgICBpdGVtLnZhbHVlID0gbnVsbDtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlVm9pY2VDb21ib0JveCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc2xpZGVyIHdpdGggbGFiZWxzIGFuZCB0aWNrIG1hcmtzIHVzZWQgdG8gY29udHJvbCB2b2ljZSByYXRlIG9mIHdlYiBzcGVlY2ggc3ludGhlc2lzLlxuICovXG5jbGFzcyBWb2ljaW5nUGl0Y2hTbGlkZXIgZXh0ZW5kcyBWQm94IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsYWJlbFN0cmluZzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgdm9pY2VQaXRjaFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSApIHtcbiAgICBjb25zdCBsYWJlbCA9IG5ldyBUZXh0KCBsYWJlbFN0cmluZywgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMgKTtcblxuICAgIGNvbnN0IHZvaWNlUGl0Y2hSYW5nZSA9IHZvaWNlUGl0Y2hQcm9wZXJ0eS5yYW5nZTtcblxuICAgIGNvbnN0IHNsaWRlciA9IG5ldyBIU2xpZGVyKCB2b2ljZVBpdGNoUHJvcGVydHksIHZvaWNlUGl0Y2hSYW5nZSwge1xuICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxMCxcbiAgICAgIHRodW1iU2l6ZTogVEhVTUJfU0laRSxcbiAgICAgIHRyYWNrU2l6ZTogVFJBQ0tfU0laRSxcbiAgICAgIGtleWJvYXJkU3RlcDogMC4yNSxcbiAgICAgIHNoaWZ0S2V5Ym9hcmRTdGVwOiAwLjEsXG5cbiAgICAgIC8vIGNvbnN0cmFpbiB0aGUgdmFsdWUgdG8gdGhlIG5lYXJlc3QgaHVuZHJlZHRocyBwbGFjZSBzbyB0aGVyZSBpcyBubyBvdmVybGFwIGluIGRlc2NyaWJlZCByYW5nZXMgaW5cbiAgICAgIC8vIFZPSUNFX1BJVENIX0RFU0NSSVBUSU9OX01BUFxuICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDAuMDEgKSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxuICAgICAgbGFiZWxDb250ZW50OiBsYWJlbFN0cmluZyxcblxuICAgICAgLy8gdm9pY2luZ1xuICAgICAgdm9pY2luZ05hbWVSZXNwb25zZTogbGFiZWxTdHJpbmcsXG5cbiAgICAgIC8vIFZvaWNpbmcgY29udHJvbHMgc2hvdWxkIG5vdCByZXNwZWN0IHZvaWNpbmcgcmVzcG9uc2UgY29udHJvbHMgc28gdXNlciBhbHdheXMgaGVhcnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlbVxuICAgICAgdm9pY2luZ0lnbm9yZVZvaWNpbmdNYW5hZ2VyUHJvcGVydGllczogdHJ1ZSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCAvLyBXZSBkb24ndCB3YW50IHRvIGluc3RydW1lbnQgY29tcG9uZW50cyBmb3IgcHJlZmVyZW5jZXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNzQ0I2lzc3VlY29tbWVudC0xMTk2MDI4MzYyXG4gICAgfSApO1xuXG4gICAgY29uc3QgbG93TGFiZWwgPSBuZXcgVGV4dCggJ0xvdycsIHsgZm9udDogbmV3IFBoZXRGb250KCAxNCApIH0gKTtcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCB2b2ljZVBpdGNoUmFuZ2UubWluLCBsb3dMYWJlbCApO1xuXG4gICAgY29uc3QgaGlnaExhYmVsID0gbmV3IFRleHQoICdIaWdoJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDE0ICkgfSApO1xuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIHZvaWNlUGl0Y2hSYW5nZS5tYXgsIGhpZ2hMYWJlbCApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIHZvaWNpbmdcbiAgICBjb25zdCB2b2ljZVBpdGNoTGlzdGVuZXIgPSAoIHBpdGNoOiBudW1iZXIsIHByZXZpb3VzVmFsdWU6IG51bWJlciB8IG51bGwgKSA9PiB7XG4gICAgICBzbGlkZXIudm9pY2luZ09iamVjdFJlc3BvbnNlID0gdGhpcy5nZXRQaXRjaERlc2NyaXB0aW9uU3RyaW5nKCBwaXRjaCApO1xuICAgIH07XG4gICAgdm9pY2VQaXRjaFByb3BlcnR5LmxpbmsoIHZvaWNlUGl0Y2hMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5tdXRhdGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsLCBzbGlkZXIgXSxcbiAgICAgIHNwYWNpbmc6IDVcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGRlc2NyaXB0aW9uIG9mIHRoZSBwaXRjaCBhdCB0aGUgcHJvdmlkZWQgdmFsdWUgZnJvbSBWT0lDRV9QSVRDSF9ERVNDUklQVElPTl9NQVAuXG4gICAqL1xuICBwcml2YXRlIGdldFBpdGNoRGVzY3JpcHRpb25TdHJpbmcoIHBpdGNoVmFsdWU6IG51bWJlciApOiBzdHJpbmcge1xuICAgIGxldCBwaXRjaERlc2NyaXB0aW9uID0gJyc7XG4gICAgVk9JQ0VfUElUQ0hfREVTQ1JJUFRJT05fTUFQLmZvckVhY2goICggZGVzY3JpcHRpb24sIHJhbmdlICkgPT4ge1xuICAgICAgaWYgKCByYW5nZS5jb250YWlucyggcGl0Y2hWYWx1ZSApICkge1xuICAgICAgICBwaXRjaERlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG4gICAgICB9XG4gICAgfSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBpdGNoRGVzY3JpcHRpb24sIGBubyBkZXNjcmlwdGlvbiBmb3VuZCBmb3IgcGl0Y2ggYXQgdmFsdWU6ICR7cGl0Y2hWYWx1ZX1gICk7XG4gICAgcmV0dXJuIHBpdGNoRGVzY3JpcHRpb247XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdWb2ljaW5nUGFuZWxTZWN0aW9uJywgVm9pY2luZ1BhbmVsU2VjdGlvbiApO1xuZXhwb3J0IGRlZmF1bHQgVm9pY2luZ1BhbmVsU2VjdGlvbjsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiRGVyaXZlZFByb3BlcnR5IiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiTnVtYmVyQ29udHJvbCIsIlBoZXRGb250IiwiSGlnaGxpZ2h0RnJvbU5vZGUiLCJOb2RlIiwiUHJlc3NMaXN0ZW5lciIsIlRleHQiLCJWQm94Iiwidm9pY2luZ01hbmFnZXIiLCJWb2ljaW5nVGV4dCIsIkNoZWNrYm94IiwiQ29tYm9Cb3giLCJFeHBhbmRDb2xsYXBzZUJ1dHRvbiIsIkhTbGlkZXIiLCJUb2dnbGVTd2l0Y2giLCJUYW5kZW0iLCJVdHRlcmFuY2UiLCJsb2NhbGVQcm9wZXJ0eSIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiUHJlZmVyZW5jZXNDb250cm9sIiwiUHJlZmVyZW5jZXNEaWFsb2ciLCJQcmVmZXJlbmNlc0RpYWxvZ0NvbnN0YW50cyIsIlByZWZlcmVuY2VzUGFuZWxTZWN0aW9uIiwidm9pY2luZ0xhYmVsU3RyaW5nUHJvcGVydHkiLCJhMTF5IiwicHJlZmVyZW5jZXMiLCJ0YWJzIiwiYXVkaW8iLCJ2b2ljaW5nIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRvb2xiYXJMYWJlbFN0cmluZ1Byb3BlcnR5IiwidG9vbGJhciIsInJhdGVTdHJpbmdQcm9wZXJ0eSIsImN1c3RvbWl6ZVZvaWNlIiwicmF0ZSIsInJhdGVMYWJlbFN0cmluZ1Byb3BlcnR5IiwibGFiZWxTdHJpbmdTdHJpbmdQcm9wZXJ0eSIsInBpdGNoU3RyaW5nUHJvcGVydHkiLCJwaXRjaCIsInZvaWNpbmdFbmFibGVkU3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nT25TdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdEaXNhYmxlZFN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ09mZlN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ09mZk9ubHlBdmFpbGFibGVJbkVuZ2xpc2hTdHJpbmdQcm9wZXJ0eSIsInZvaWNlVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwidmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiY3VzdG9taXplVm9pY2VTdHJpbmdQcm9wZXJ0eSIsInRvb2xiYXJSZW1vdmVkU3RyaW5nUHJvcGVydHkiLCJ0b29sYmFyQWRkZWRTdHJpbmdQcm9wZXJ0eSIsInNpbVZvaWNpbmdPcHRpb25zU3RyaW5nUHJvcGVydHkiLCJzaW1Wb2ljaW5nT3B0aW9ucyIsInNpbVZvaWNpbmdEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiZGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsIm9iamVjdERldGFpbHNMYWJlbFN0cmluZ1Byb3BlcnR5Iiwib2JqZWN0RGV0YWlscyIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJjb250ZXh0Q2hhbmdlc0xhYmVsU3RyaW5nUHJvcGVydHkiLCJjb250ZXh0Q2hhbmdlcyIsImhlbHBmdWxIaW50c0xhYmVsU3RyaW5nUHJvcGVydHkiLCJoZWxwZnVsSGludHMiLCJ2b2ljaW5nT2JqZWN0Q2hhbmdlc1N0cmluZ1Byb3BlcnR5IiwiZW5hYmxlZEFsZXJ0U3RyaW5nUHJvcGVydHkiLCJvYmplY3RDaGFuZ2VzTXV0ZWRTdHJpbmdQcm9wZXJ0eSIsImRpc2FibGVkQWxlcnRTdHJpbmdQcm9wZXJ0eSIsInZvaWNpbmdDb250ZXh0Q2hhbmdlc1N0cmluZ1Byb3BlcnR5IiwiY29udGV4dENoYW5nZXNNdXRlZFN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ0hpbnRzU3RyaW5nUHJvcGVydHkiLCJoaW50c011dGVkU3RyaW5nUHJvcGVydHkiLCJ2b2ljZUxhYmVsU3RyaW5nUHJvcGVydHkiLCJ2b2ljZSIsInZvaWNlVGl0bGVQYXR0ZXJuTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInRpdGxlUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwibm9Wb2ljZXNBdmFpbGFibGVTdHJpbmdQcm9wZXJ0eSIsImN1c3RvbWl6ZVZvaWNlRXhwYW5kZWRTdHJpbmdQcm9wZXJ0eSIsImV4cGFuZGVkQWxlcnRTdHJpbmdQcm9wZXJ0eSIsImN1c3RvbWl6ZVZvaWNlQ29sbGFwc2VkU3RyaW5nUHJvcGVydHkiLCJjb2xsYXBzZWRBbGVydFN0cmluZ1Byb3BlcnR5Iiwidm9pY2VSYXRlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ3cml0dGVuVmFyaWFibGVzUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwibGFiZWxsZWREZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInZvaWNlUmF0ZU5vcm1hbFN0cmluZ1Byb3BlcnR5IiwicmFuZ2VEZXNjcmlwdGlvbnMiLCJpbkxvd1JhbmdlU3RyaW5nUHJvcGVydHkiLCJsb3dTdHJpbmdQcm9wZXJ0eSIsImluTm9ybWFsUmFuZ2VTdHJpbmdQcm9wZXJ0eSIsIm5vcm1hbFN0cmluZ1Byb3BlcnR5IiwiYWJvdmVOb3JtYWxSYW5nZVN0cmluZ1Byb3BlcnR5IiwiYWJvdmVOb3JtYWxTdHJpbmdQcm9wZXJ0eSIsImluSGlnaFJhbmdlU3RyaW5nUHJvcGVydHkiLCJoaWdoU3RyaW5nUHJvcGVydHkiLCJ2b2ljaW5nRW5nbGlzaE9ubHlMYWJlbFN0cmluZ1Byb3BlcnR5IiwidGl0bGVFbmdsaXNoT25seVN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJWT0lDRV9QSVRDSF9ERVNDUklQVElPTl9NQVAiLCJNYXAiLCJzZXQiLCJUSFVNQl9TSVpFIiwiVFJBQ0tfU0laRSIsIlZvaWNpbmdQYW5lbFNlY3Rpb24iLCJhdWRpb01vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwiYXZhaWxhYmxlUnVudGltZUxvY2FsZXMiLCJzdXBwb3J0c0R5bmFtaWNMb2NhbGUiLCJ2b2ljaW5nTGFiZWwiLCJQQU5FTF9TRUNUSU9OX0xBQkVMX09QVElPTlMiLCJ2b2ljaW5nRW5hYmxlZFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJ0YW5kZW0iLCJPUFRfT1VUIiwidm9pY2luZ0VuYWJsZWRTd2l0Y2hWb2ljaW5nVGV4dCIsIlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TIiwicmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlIiwidm9pY2luZ1RvZ2dsZVN3aXRjaCIsInZvaWNpbmdFbmFibGVkUHJvcGVydHkiLCJhY2Nlc3NpYmxlTmFtZSIsIlRPR0dMRV9TV0lUQ0hfT1BUSU9OUyIsInZvaWNpbmdFbmFibGVkU3dpdGNoIiwibGFiZWxOb2RlIiwiZGVzY3JpcHRpb25Ob2RlIiwiYWxsb3dEZXNjcmlwdGlvblN0cmV0Y2giLCJjb250cm9sTm9kZSIsInF1aWNrQWNjZXNzTGFiZWwiLCJ0b29sYmFyVG9nZ2xlU3dpdGNoIiwidG9vbGJhckVuYWJsZWRQcm9wZXJ0eSIsImxlZnRWYWx1ZUNvbnRleHRSZXNwb25zZSIsInJpZ2h0VmFsdWVDb250ZXh0UmVzcG9uc2UiLCJ0b29sYmFyRW5hYmxlZFN3aXRjaCIsInNwZWVjaE91dHB1dExhYmVsIiwidGFnTmFtZSIsImlubmVyQ29udGVudCIsInNwZWVjaE91dHB1dFJlYWRpbmdCbG9ja05hbWVSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNwZWVjaE91dHB1dERlc2NyaXB0aW9uIiwiY3JlYXRlQ2hlY2tib3giLCJsYWJlbFN0cmluZyIsInByb3BlcnR5IiwiY2hlY2tlZENvbnRleHRSZXNwb25zZSIsInVuY2hlY2tlZENvbnRleHRSZXNwb25zZSIsImRpc3Bvc2FibGUiLCJjaGVja2JveCIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nSWdub3JlVm9pY2luZ01hbmFnZXJQcm9wZXJ0aWVzIiwidm9pY2VOYW1lUmVzcG9uc2VPblNlbGVjdGlvbiIsInNwZWVjaE91dHB1dENvbnRlbnQiLCJzcGVlY2hPdXRwdXRDaGVja2JveGVzIiwiYWxpZ24iLCJzcGFjaW5nIiwiVkVSVElDQUxfQ09OVEVOVF9TUEFDSU5HIiwiY2hpbGRyZW4iLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2VzRW5hYmxlZFByb3BlcnR5Iiwidm9pY2luZ0NvbnRleHRSZXNwb25zZXNFbmFibGVkUHJvcGVydHkiLCJ2b2ljaW5nSGludFJlc3BvbnNlc0VuYWJsZWRQcm9wZXJ0eSIsImxlZnRUb3AiLCJsZWZ0Qm90dG9tIiwicGx1c1hZIiwiQ09OVEVOVF9JTkRFTlRBVElPTl9TUEFDSU5HIiwicmF0ZVNsaWRlciIsIlZvaWNlUmF0ZU51bWJlckNvbnRyb2wiLCJ2b2ljZVJhdGVQcm9wZXJ0eSIsInBpdGNoU2xpZGVyIiwiVm9pY2luZ1BpdGNoU2xpZGVyIiwidm9pY2VQaXRjaFByb3BlcnR5Iiwidm9pY2VPcHRpb25zQ29udGVudCIsInZvaWNlT3B0aW9uc0xhYmVsIiwiY3Vyc29yIiwidm9pY2VPcHRpb25zT3BlblByb3BlcnR5IiwiZXhwYW5kQ29sbGFwc2VCdXR0b24iLCJzaWRlTGVuZ3RoIiwidm9pY2VPcHRpb25zQ29udGFpbmVyIiwidm9pY2VPcHRpb25zUHJlc3NMaXN0ZW5lciIsInByZXNzIiwidG9nZ2xlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImNvbnRlbnQiLCJsZWZ0Q2VudGVyIiwicmlnaHRDZW50ZXIiLCJsaW5rIiwib3BlbiIsInZpc2libGUiLCJmb2N1c0hpZ2hsaWdodCIsInRpdGxlTm9kZSIsImNvbnRlbnROb2RlIiwiY29udGVudFZpc2liaWxpdHlMaXN0ZW5lciIsImVuYWJsZWQiLCJsb2NhbGVMaXN0ZW5lciIsImxvY2FsZSIsImVuYWJsZWRQcm9wZXJ0eSIsInZhbHVlIiwic3RhcnRzV2l0aCIsInZvaWNpbmdFbmFibGVkVXR0ZXJhbmNlIiwidm9pY2luZ0VuYWJsZWRQcm9wZXJ0eUxpc3RlbmVyIiwidm9pY2luZ01haW5XaW5kb3dWb2ljaW5nRW5hYmxlZFByb3BlcnR5IiwiYWxlcnQiLCJpc0luc2lkZVBoZXRpb0FyY2hldHlwZSIsInNwZWFrSWdub3JpbmdFbmFibGVkIiwiYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSIsImxhenlMaW5rIiwidm9pY2VDb21ib0JveCIsInZvaWNlc0NoYW5nZWRMaXN0ZW5lciIsInZvaWNlcyIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsInZvaWNlTGlzdCIsImxlbmd0aCIsInByaW9yaXRpemVkVm9pY2VzIiwiZ2V0RW5nbGlzaFByaW9yaXRpemVkVm9pY2VzIiwic2xpY2UiLCJwYXJlbnQiLCJwaGV0Iiwic2ltIiwidG9wTGF5ZXIiLCJWb2ljZUNvbWJvQm94Iiwidm9pY2VQcm9wZXJ0eSIsImFkZENoaWxkIiwidm9pY2VzUHJvcGVydHkiLCJhbGVydFN0cmluZ1Byb3BlcnR5Iiwidm9pY2luZ1NwZWFrQ29udGV4dFJlc3BvbnNlIiwiY29udGV4dFJlc3BvbnNlIiwiYTExeU5hbWVTdHJpbmciLCJyYW5nZSIsImluY2x1ZGVBcnJvd0J1dHRvbnMiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uNCIsImRlbHRhIiwidGl0bGVOb2RlT3B0aW9ucyIsIm1heFdpZHRoIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJkZWNpbWFsUGxhY2VzIiwidmFsdWVQYXR0ZXJuIiwidGV4dE9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwidGh1bWJTaXplIiwidHJhY2tTaXplIiwia2V5Ym9hcmRTdGVwIiwibWlub3JUaWNrU3BhY2luZyIsInZvaWNpbmdPbkVuZFJlc3BvbnNlT3B0aW9ucyIsIndpdGhOYW1lUmVzcG9uc2UiLCJzbGlkZXIiLCJ2b2ljZVJhdGVOb25Ob3JtYWxQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ2b2ljZVJhdGVSZXNwb25zZVByb3BlcnR5Iiwibm9ybWFsIiwibm9uTm9ybWFsIiwidm9pY2luZ09iamVjdFJlc3BvbnNlIiwiZGlzcG9zZVZvaWNlQ29tYm9Cb3giLCJwYXJlbnROb2RlIiwib3B0aW9ucyIsImxpc3RQb3NpdGlvbiIsImNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4iLCJpdGVtcyIsInB1c2giLCJjcmVhdGVOb2RlIiwiZm9yRWFjaCIsIm5hbWUiLCJidXR0b24iLCJpdGVtIiwiZ2V0UGl0Y2hEZXNjcmlwdGlvblN0cmluZyIsInBpdGNoVmFsdWUiLCJwaXRjaERlc2NyaXB0aW9uIiwiY29udGFpbnMiLCJhc3NlcnQiLCJ2b2ljZVBpdGNoUmFuZ2UiLCJtYWpvclRpY2tMZW5ndGgiLCJzaGlmdEtleWJvYXJkU3RlcCIsImNvbnN0cmFpblZhbHVlIiwicm91bmRUb0ludGVydmFsIiwibG93TGFiZWwiLCJmb250IiwiYWRkTWFqb3JUaWNrIiwibWluIiwiaGlnaExhYmVsIiwibWF4Iiwidm9pY2VQaXRjaExpc3RlbmVyIiwicHJldmlvdXNWYWx1ZSIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0MscUJBQXFCLHNDQUFzQztBQUdsRSxPQUFPQywyQkFBMkIsNENBQTRDO0FBRzlFLE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsT0FBT0MsYUFBYUMsY0FBYyxRQUEwQixxQ0FBcUM7QUFDakcsT0FBT0MsbUJBQW1CLDRDQUE0QztBQUN0RSxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxTQUFTQyxpQkFBaUIsRUFBRUMsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxjQUFjLEVBQUVDLFdBQVcsUUFBUSxpQ0FBaUM7QUFDakksT0FBT0MsY0FBYyw4QkFBOEI7QUFDbkQsT0FBT0MsY0FBaUQsOEJBQThCO0FBQ3RGLE9BQU9DLDBCQUEwQiwwQ0FBMEM7QUFDM0UsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0Msa0JBQTJDLGtDQUFrQztBQUNwRixPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyxlQUFlLDJDQUEyQztBQUNqRSxPQUFPQyxvQkFBZ0MsNEJBQTRCO0FBQ25FLE9BQU9DLFdBQVcsY0FBYztBQUNoQyxPQUFPQyxrQkFBa0IscUJBQXFCO0FBQzlDLE9BQU9DLHdCQUF3QiwwQkFBMEI7QUFDekQsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUN2RCxPQUFPQyxnQ0FBZ0Msa0NBQWtDO0FBRXpFLE9BQU9DLDZCQUFpRSwrQkFBK0I7QUFFdkcsWUFBWTtBQUNaLHVGQUF1RjtBQUN2RixrRkFBa0Y7QUFDbEYsTUFBTUMsNkJBQTZCTCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0MsbUJBQW1CO0FBQ3ZHLE1BQU1DLDZCQUE2QlosYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNHLE9BQU8sQ0FBQ0YsbUJBQW1CO0FBQy9HLE1BQU1HLHFCQUFxQmQsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDTCxtQkFBbUI7QUFDbkgsTUFBTU0sMEJBQTBCakIsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDRSx5QkFBeUI7QUFDOUgsTUFBTUMsc0JBQXNCbkIsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ0ssS0FBSyxDQUFDVCxtQkFBbUI7QUFDckgsTUFBTVUsK0JBQStCckIsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNZLHVCQUF1QjtBQUM3RyxNQUFNQyxnQ0FBZ0N2QixhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ2Msd0JBQXdCO0FBQy9HLE1BQU1DLGlEQUFpRHpCLGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDZSw4Q0FBOEM7QUFDdEosTUFBTUMsc0NBQXNDMUIsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ1ksOEJBQThCO0FBQzFJLE1BQU1DLCtCQUErQjVCLGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDSyxjQUFjLENBQUNKLG1CQUFtQjtBQUV4SCxNQUFNa0IsK0JBQStCN0IsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNHLE9BQU8sQ0FBQ2dCLDRCQUE0QjtBQUMxSCxNQUFNQyw2QkFBNkI5QixhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0csT0FBTyxDQUFDaUIsMEJBQTBCO0FBRXRILE1BQU1DLGtDQUFrQy9CLGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDc0IsaUJBQWlCLENBQUNyQixtQkFBbUI7QUFDOUgsTUFBTXNCLHNDQUFzQ2pDLGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDc0IsaUJBQWlCLENBQUNFLHlCQUF5QjtBQUV4SSxNQUFNQyxtQ0FBbUNuQyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDSSxhQUFhLENBQUNDLG1CQUFtQjtBQUM3SSxNQUFNQyxvQ0FBb0N0QyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDTyxjQUFjLENBQUNGLG1CQUFtQjtBQUMvSSxNQUFNRyxrQ0FBa0N4QyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDUyxZQUFZLENBQUNKLG1CQUFtQjtBQUUzSSxNQUFNSyxxQ0FBcUMxQyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDSSxhQUFhLENBQUNPLDBCQUEwQjtBQUN0SixNQUFNQyxtQ0FBbUM1QyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDSSxhQUFhLENBQUNTLDJCQUEyQjtBQUNySixNQUFNQyxzQ0FBc0M5QyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDTyxjQUFjLENBQUNJLDBCQUEwQjtBQUN4SixNQUFNSSxvQ0FBb0MvQyxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDTyxjQUFjLENBQUNNLDJCQUEyQjtBQUN2SixNQUFNRyw2QkFBNkJoRCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDUyxZQUFZLENBQUNFLDBCQUEwQjtBQUM3SSxNQUFNTSwyQkFBMkJqRCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3NCLGlCQUFpQixDQUFDUyxZQUFZLENBQUNJLDJCQUEyQjtBQUU1SSxNQUFNSywyQkFBMkJsRCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0ssY0FBYyxDQUFDb0MsS0FBSyxDQUFDeEMsbUJBQW1CO0FBQzFILE1BQU15Qyx1Q0FBdUNwRCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0ssY0FBYyxDQUFDb0MsS0FBSyxDQUFDRSwwQkFBMEI7QUFDN0ksTUFBTUMsa0NBQWtDdEQsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ29DLEtBQUssQ0FBQ0csK0JBQStCO0FBRTdJLE1BQU1DLHVDQUF1Q3ZELGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDSyxjQUFjLENBQUN5QywyQkFBMkI7QUFDeEksTUFBTUMsd0NBQXdDekQsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQzJDLDRCQUE0QjtBQUUxSSxNQUFNQyw0Q0FBNEMzRCxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0ssY0FBYyxDQUFDNkMscUNBQXFDO0FBQ3ZKLE1BQU1DLDJDQUEyQzdELGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNxRCx3Q0FBd0M7QUFFNUgsTUFBTUMsZ0NBQWdDOUQsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDK0MsaUJBQWlCLENBQUNELDZCQUE2QjtBQUMxSixNQUFNRSwyQkFBMkJoRSxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0ssY0FBYyxDQUFDQyxJQUFJLENBQUMrQyxpQkFBaUIsQ0FBQ0UsaUJBQWlCO0FBQ3pJLE1BQU1DLDhCQUE4QmxFLGFBQWFNLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDSyxjQUFjLENBQUNDLElBQUksQ0FBQytDLGlCQUFpQixDQUFDSSxvQkFBb0I7QUFDL0ksTUFBTUMsaUNBQWlDcEUsYUFBYU0sSUFBSSxDQUFDQyxXQUFXLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUNLLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDK0MsaUJBQWlCLENBQUNNLHlCQUF5QjtBQUN2SixNQUFNQyw0QkFBNEJ0RSxhQUFhTSxJQUFJLENBQUNDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0ssY0FBYyxDQUFDQyxJQUFJLENBQUMrQyxpQkFBaUIsQ0FBQ1Esa0JBQWtCO0FBRTNJLG9IQUFvSDtBQUNwSCxnQ0FBZ0M7QUFDaEMsTUFBTUMsd0NBQXdDeEUsYUFBYU8sV0FBVyxDQUFDQyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDK0QsOEJBQThCO0FBQ3hILE1BQU1DLG1DQUFtQzFFLGFBQWFPLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ3dCLHlCQUF5QjtBQUU5RyxNQUFNeUMsOEJBQThCLElBQUlDO0FBQ3hDRCw0QkFBNEJFLEdBQUcsQ0FBRSxJQUFJcEcsTUFBTyxLQUFLLE9BQVF1RjtBQUN6RFcsNEJBQTRCRSxHQUFHLENBQUUsSUFBSXBHLE1BQU8sTUFBTSxPQUFReUY7QUFDMURTLDRCQUE0QkUsR0FBRyxDQUFFLElBQUlwRyxNQUFPLE1BQU0sTUFBTzJGO0FBQ3pETyw0QkFBNEJFLEdBQUcsQ0FBRSxJQUFJcEcsTUFBTyxLQUFLLElBQUs2RjtBQUV0RCxNQUFNUSxhQUFhLElBQUl0RyxXQUFZLElBQUk7QUFDdkMsTUFBTXVHLGFBQWEsSUFBSXZHLFdBQVksS0FBSztBQUt4QyxJQUFBLEFBQU13RyxzQkFBTixNQUFNQSw0QkFBNEI1RTtJQUVoQzs7O0dBR0MsR0FDRCxZQUFvQjZFLFVBQXNCLEVBQUVDLGVBQTRDLENBQUc7UUFFekYsMkdBQTJHO1FBQzNHLHlFQUF5RTtRQUN6RSxNQUFNdkUsc0JBQXNCLEFBQUViLGVBQWVxRix1QkFBdUIsSUFBSXJGLGVBQWVzRixxQkFBcUIsR0FDaEZaLHdDQUF3Q25FO1FBRXBFLHFGQUFxRjtRQUNyRixNQUFNZ0YsZUFBZSxJQUFJbEcsS0FBTXdCLHFCQUFxQlQsa0JBQWtCb0YsMkJBQTJCO1FBQ2pHLE1BQU1DLDhEQUE4RCxJQUFJaEgsc0JBQXVCc0YsMENBQTBDO1lBQ3ZJMkIsT0FBTzdFO1lBQ1A4RSxhQUFhZjtRQUNmLEdBQUc7WUFBRWdCLFFBQVE5RixPQUFPK0YsT0FBTztRQUFDO1FBQzVCLE1BQU1DLGtDQUFrQyxJQUFJdEcsWUFBYW9GLGtDQUFrQy9GLE1BQU8sQ0FBQyxHQUFHdUIsa0JBQWtCMkYsNkJBQTZCLEVBQUU7WUFDckpDLDBCQUEwQlA7UUFDNUI7UUFDQSxNQUFNUSxzQkFBc0IsSUFBSXBHLGFBQWNzRixXQUFXZSxzQkFBc0IsRUFBRSxPQUFPLE1BQU1uSCxlQUFxQztZQUNqSW9ILGdCQUFnQnRGO1FBQ2xCLEdBQUdSLDJCQUEyQitGLHFCQUFxQjtRQUNuRCxNQUFNQyx1QkFBdUIsSUFBSWxHLG1CQUFvQjtZQUNuRG1HLFdBQVdmO1lBQ1hnQixpQkFBaUJUO1lBQ2pCVSx5QkFBeUI7WUFDekJDLGFBQWFSO1FBQ2Y7UUFFQSwyQkFBMkI7UUFDM0IsTUFBTVMsbUJBQW1CLElBQUlySCxLQUFNeUIsNEJBQTRCVixrQkFBa0JvRiwyQkFBMkI7UUFDNUcsTUFBTW1CLHNCQUFzQixJQUFJOUcsYUFBY3NGLFdBQVd5QixzQkFBc0IsRUFBRSxPQUFPLE1BQU03SCxlQUFxQztZQUNqSW9ILGdCQUFnQnJGO1lBQ2hCK0YsMEJBQTBCOUU7WUFDMUIrRSwyQkFBMkI5RTtRQUM3QixHQUFHM0IsMkJBQTJCK0YscUJBQXFCO1FBQ25ELE1BQU1XLHVCQUF1QixJQUFJNUcsbUJBQW9CO1lBQ25EbUcsV0FBV0k7WUFDWEQsYUFBYUU7UUFDZjtRQUVBLHVCQUF1QjtRQUN2QixNQUFNSyxvQkFBb0IsSUFBSTNILEtBQU00QyxpQ0FBaUNwRCxNQUFPLENBQUMsR0FBR3VCLGtCQUFrQm9GLDJCQUEyQixFQUFFO1lBRTdILE9BQU87WUFDUHlCLFNBQVM7WUFDVEMsY0FBY2pGO1FBQ2hCO1FBQ0EsTUFBTWtGLDREQUE0RCxJQUFJMUksc0JBQXVCc0YsMENBQTBDO1lBQ3JJMkIsT0FBT3pEO1lBQ1AwRCxhQUFheEQ7UUFDZixHQUFHO1lBQUV5RCxRQUFROUYsT0FBTytGLE9BQU87UUFBQztRQUM1QixNQUFNdUIsMEJBQTBCLElBQUk1SCxZQUFhMkMscUNBQXFDdEQsTUFBTyxDQUFDLEdBQUd1QixrQkFBa0IyRiw2QkFBNkIsRUFBRTtZQUNoSkMsMEJBQTBCbUI7UUFDNUI7UUFFQTs7S0FFQyxHQUNELE1BQU1FLGlCQUFpQixDQUFFQyxhQUF3Q0MsVUFDeENDLHdCQUNBQywwQkFBcURDO1lBQzVFLE1BQU1wQixZQUFZLElBQUlqSCxLQUFNaUksYUFBYWxILGtCQUFrQjJGLDZCQUE2QjtZQUN4RixNQUFNNEIsV0FBVyxJQUFJbEksU0FBVThILFVBQVVqQixXQUFXO2dCQUVsRCxPQUFPO2dCQUNQc0IsY0FBYztnQkFDZEMsY0FBY1A7Z0JBRWQsVUFBVTtnQkFDVlEscUJBQXFCUjtnQkFDckJTLHVDQUF1QztnQkFDdkNDLDhCQUE4QjtnQkFFOUIsd0JBQXdCO2dCQUN4QlIsd0JBQXdCQTtnQkFDeEJDLDBCQUEwQkE7Z0JBRTFCLFVBQVU7Z0JBQ1Y3QixRQUFROUYsT0FBTytGLE9BQU8sQ0FBQywrSEFBK0g7WUFDeEo7WUFFQSxPQUFPOEI7UUFDVDtRQUVBLE1BQU1NLHNCQUFzQixJQUFJOUk7UUFFaEMsTUFBTStJLHlCQUF5QixJQUFJNUksS0FBTTtZQUN2QzZJLE9BQU87WUFDUEMsU0FBU2hJLGtCQUFrQmlJLHdCQUF3QjtZQUNuREMsVUFBVTtnQkFDUmpCLGVBQWdCaEYsa0NBQWtDOEMsV0FBV29ELHFDQUFxQyxFQUNoRzNGLG9DQUFvQ0Usa0NBQWtDa0U7Z0JBRXhFSyxlQUFnQjdFLG1DQUFtQzJDLFdBQVdxRCxzQ0FBc0MsRUFDbEd4RixxQ0FBcUNDLG1DQUFtQytEO2dCQUUxRUssZUFBZ0IzRSxpQ0FBaUN5QyxXQUFXc0QsbUNBQW1DLEVBQzdGdkYsNEJBQTRCQywwQkFBMEI2RDthQUV6RDtRQUNIO1FBRUFpQixvQkFBb0JLLFFBQVEsR0FBRztZQUFFdEI7WUFBbUJJO1lBQXlCYztTQUF3QjtRQUNyR2Qsd0JBQXdCc0IsT0FBTyxHQUFHMUIsa0JBQWtCMkIsVUFBVSxDQUFDQyxNQUFNLENBQUUsR0FBR3hJLGtCQUFrQmlJLHdCQUF3QjtRQUNwSEgsdUJBQXVCUSxPQUFPLEdBQUd0Qix3QkFBd0J1QixVQUFVLENBQUNDLE1BQU0sQ0FBRXhJLGtCQUFrQnlJLDJCQUEyQixFQUFFekksa0JBQWtCaUksd0JBQXdCO1FBRXJLLE1BQU1TLGFBQWEsSUFBSUMsdUJBQXdCL0gsb0JBQW9CRyx5QkFBeUJnRSxXQUFXNkQsaUJBQWlCO1FBQ3hILE1BQU1DLGNBQWMsSUFBSUMsbUJBQW9CN0gscUJBQXFCOEQsV0FBV2dFLGtCQUFrQjtRQUM5RixNQUFNQyxzQkFBc0IsSUFBSTlKLEtBQU07WUFDcEM4SSxTQUFTaEksa0JBQWtCaUksd0JBQXdCO1lBQ25ERixPQUFPO1lBQ1BHLFVBQVU7Z0JBQ1JRO2dCQUNBRzthQUNEO1FBQ0g7UUFFQSxnQkFBZ0I7UUFDaEIsTUFBTUksb0JBQW9CLElBQUloSyxLQUFNeUMsOEJBQThCakQsTUFBTyxDQUFDLEdBQUd1QixrQkFBa0JvRiwyQkFBMkIsRUFBRTtZQUMxSDhELFFBQVE7UUFDVjtRQUNBLE1BQU1DLDJCQUEyQixJQUFJaEwsZ0JBQWlCO1FBQ3RELE1BQU1pTCx1QkFBdUIsSUFBSTdKLHFCQUFzQjRKLDBCQUEwQjtZQUMvRUUsWUFBWTtZQUVaLE9BQU87WUFDUHZDLGNBQWNwRjtZQUVkLFVBQVU7WUFDVmdHLHFCQUFxQmhHO1lBQ3JCaUcsdUNBQXVDO1lBRXZDLFVBQVU7WUFDVm5DLFFBQVE5RixPQUFPK0YsT0FBTyxDQUFDLCtIQUErSDtRQUN4SjtRQUVBLE1BQU02RCx3QkFBd0IsSUFBSXZLLEtBQU07WUFDdENtSixVQUFVO2dCQUFFZTtnQkFBbUJHO2FBQXNCO1FBQ3ZEO1FBRUEscUVBQXFFO1FBQ3JFLE1BQU1HLDRCQUE0QixJQUFJdkssY0FBZTtZQUNuRHdLLE9BQU87Z0JBQ0xMLHlCQUF5Qk0sTUFBTTtZQUNqQztZQUVBLFVBQVU7WUFDVmpFLFFBQVE5RixPQUFPK0YsT0FBTyxDQUFDLCtIQUErSDtRQUN4SjtRQUNBd0Qsa0JBQWtCUyxnQkFBZ0IsQ0FBRUg7UUFFcEMsTUFBTUksVUFBVSxJQUFJNUssS0FBTTtZQUN4Qm1KLFVBQVU7Z0JBQUVMO2dCQUFxQmxCO2dCQUFzQjJDO2dCQUF1Qk47YUFBcUI7UUFDckc7UUFFQSx1R0FBdUc7UUFDdkcsMkZBQTJGO1FBQzNGckMscUJBQXFCMkIsT0FBTyxHQUFHVCxvQkFBb0JVLFVBQVUsQ0FBQ0MsTUFBTSxDQUFFLEdBQUc7UUFDekVTLGtCQUFrQlgsT0FBTyxHQUFHM0IscUJBQXFCNEIsVUFBVSxDQUFDQyxNQUFNLENBQUUsR0FBRztRQUN2RVkscUJBQXFCUSxVQUFVLEdBQUdYLGtCQUFrQlksV0FBVyxDQUFDckIsTUFBTSxDQUFFLElBQUk7UUFDNUVRLG9CQUFvQlYsT0FBTyxHQUFHVyxrQkFBa0JWLFVBQVUsQ0FBQ0MsTUFBTSxDQUFFLEdBQUc7UUFDdEVXLHlCQUF5QlcsSUFBSSxDQUFFQyxDQUFBQTtZQUFVZixvQkFBb0JnQixPQUFPLEdBQUdEO1FBQU07UUFFN0UsNkZBQTZGO1FBQzdGWCxxQkFBcUJhLGNBQWMsR0FBRyxJQUFJbkwsa0JBQW1Cd0s7UUFFN0QsS0FBSyxDQUFFO1lBQ0xZLFdBQVdqRTtZQUNYa0UsYUFBYVI7UUFDZjtRQUVBLE1BQU1TLDRCQUE0QixDQUFFQztZQUNsQ1YsUUFBUUssT0FBTyxHQUFHSztRQUNwQjtRQUNBdEYsV0FBV2Usc0JBQXNCLENBQUNnRSxJQUFJLENBQUVNO1FBRXhDLE1BQU1FLGlCQUFpQixDQUFFQztZQUN2QnRFLHFCQUFxQnVFLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHRixPQUFPRyxVQUFVLENBQUU7UUFDbEU7UUFDQTlLLGVBQWVrSyxJQUFJLENBQUVRO1FBRXJCLCtHQUErRztRQUMvRyxvRkFBb0Y7UUFDcEYsTUFBTUssMEJBQTBCLElBQUloTDtRQUNwQyxNQUFNaUwsaUNBQWlDLENBQUVQO1lBRXZDLDJGQUEyRjtZQUMzRix1QkFBdUI7WUFDdkIsSUFBS3RGLFdBQVc4Rix1Q0FBdUMsQ0FBQ0osS0FBSyxFQUFHO2dCQUU5RCw4R0FBOEc7Z0JBQzlHLHlCQUF5QjtnQkFDekJFLHdCQUF3QkcsS0FBSyxHQUFHVCxVQUFVbEosK0JBQ1J2QixlQUFlNkssS0FBSyxDQUFDQyxVQUFVLENBQUUsUUFBU3JKLGdDQUFnQ0U7Z0JBRTVHLG1EQUFtRDtnQkFDbkQsSUFBSyxDQUFDLElBQUksQ0FBQ3dKLHVCQUF1QixJQUFLO29CQUNyQzVMLGVBQWU2TCxvQkFBb0IsQ0FBRUw7Z0JBQ3ZDO2dCQUNBLElBQUksQ0FBQ00seUJBQXlCLENBQUVOO1lBQ2xDO1FBQ0Y7UUFDQTVGLFdBQVdlLHNCQUFzQixDQUFDb0YsUUFBUSxDQUFFTjtRQUU1QyxzR0FBc0c7UUFDdEcsOEVBQThFO1FBQzlFLElBQUlPLGdCQUFzQztRQUMxQyxNQUFNQyx3QkFBd0IsQ0FBRUM7WUFDOUIsSUFBS0YsZUFBZ0I7Z0JBQ25CbkMsb0JBQW9Cc0MsV0FBVyxDQUFFSDtnQkFFakMsOEVBQThFO2dCQUM5RUEsY0FBY0ksT0FBTztZQUN2QjtZQUVBLElBQUlDLFlBQW9DLEVBQUU7WUFFMUMsc0ZBQXNGO1lBQ3RGLGlIQUFpSDtZQUNqSCxtQkFBbUI7WUFDbkIsb0hBQW9IO1lBQ3BILDRJQUE0STtZQUM1SSxJQUFLSCxPQUFPSSxNQUFNLEdBQUcsR0FBSTtnQkFFdkIsOEZBQThGO2dCQUM5RixNQUFNQyxvQkFBb0J2TSxlQUFld00sMkJBQTJCO2dCQUVwRSx1RUFBdUU7Z0JBQ3ZFSCxZQUFZRSxrQkFBa0JFLEtBQUssQ0FBRSxHQUFHO1lBQzFDO1lBRUEsdUhBQXVIO1lBQ3ZILHFGQUFxRjtZQUNyRixNQUFNQyxTQUFTQyxLQUFLak0sS0FBSyxDQUFDa00sR0FBRyxDQUFDQyxRQUFRLElBQUksSUFBSWpOO1lBRTlDb00sZ0JBQWdCLElBQUljLGNBQWVsSCxXQUFXbUgsYUFBYSxFQUFFVixXQUFXSztZQUN4RTdDLG9CQUFvQm1ELFFBQVEsQ0FBRWhCO1FBQ2hDO1FBQ0FoTSxlQUFlaU4sY0FBYyxDQUFDdEMsSUFBSSxDQUFFc0I7UUFFcENqQyx5QkFBeUIrQixRQUFRLENBQUVuQixDQUFBQTtZQUNqQyxNQUFNc0Msc0JBQXNCdEMsT0FBTzFHLHVDQUF1Q0U7WUFDMUU2RixxQkFBcUJrRCwyQkFBMkIsQ0FBRTtnQkFDaERDLGlCQUFpQkY7WUFDbkI7WUFDQSxJQUFJLENBQUNwQix5QkFBeUIsQ0FBRW9CO1FBQ2xDO0lBQ0Y7QUFDRjtBQUVBOzs7Ozs7Q0FNQyxHQUNELElBQUEsQUFBTTFELHlCQUFOLE1BQU1BLCtCQUErQi9KO0lBRW5DLFlBQW9Cc0ksV0FBc0MsRUFBRXNGLGNBQXlDLEVBQUU1RCxpQkFBaUMsQ0FBRztRQUV6SSxLQUFLLENBQUUxQixhQUFhMEIsbUJBQW1CQSxrQkFBa0I2RCxLQUFLLEVBQUU7WUFDOURDLHFCQUFxQjtZQUNyQkMsZ0JBQWdCL04sY0FBY2dPLHFCQUFxQjtZQUNuREMsT0FBTztZQUNQOUcsZ0JBQWdCeUc7WUFDaEJNLGtCQUFrQnJPLE1BQU8sQ0FBQyxHQUFHdUIsa0JBQWtCMkYsNkJBQTZCLEVBQUU7Z0JBQzVFb0gsVUFBVTtZQUNaO1lBQ0FDLHNCQUFzQjtnQkFDcEJDLGVBQWU7Z0JBQ2ZDLGNBQWMxTDtnQkFDZDJMLGFBQWExTyxNQUFPLENBQUMsR0FBR3VCLGtCQUFrQjJGLDZCQUE2QixFQUFFO29CQUN2RW9ILFVBQVU7Z0JBQ1o7WUFDRjtZQUNBSyxlQUFlO2dCQUNiQyxXQUFXekk7Z0JBQ1gwSSxXQUFXekk7Z0JBQ1gwSSxjQUFjO2dCQUNkQyxrQkFBa0I7Z0JBRWxCLFVBQVU7Z0JBQ1ZDLDZCQUE2QjtvQkFDM0JDLGtCQUFrQjtnQkFDcEI7WUFDRjtZQUVBLFVBQVU7WUFDVmxJLFFBQVE5RixPQUFPK0YsT0FBTyxDQUFDLCtIQUErSDtRQUN4SjtRQUVBLCtFQUErRTtRQUMvRSxJQUFJLENBQUNrSSxNQUFNLENBQUNqRyxtQkFBbUIsR0FBRzhFO1FBRWxDLHVGQUF1RjtRQUN2RixpREFBaUQ7UUFDakQsSUFBSSxDQUFDbUIsTUFBTSxDQUFDaEcscUNBQXFDLEdBQUc7UUFFcEQsTUFBTWlHLDBDQUEwQyxJQUFJdlAsc0JBQXVCb0YsMkNBQTJDO1lBQ3BIZ0gsT0FBTzdCO1FBQ1QsR0FBRztZQUFFcEQsUUFBUTlGLE9BQU8rRixPQUFPO1FBQUM7UUFFNUIsTUFBTW9JLDRCQUE0QixJQUFJelAsZ0JBQWlCO1lBQ3JEd0s7WUFBbUJoRjtZQUErQmdLO1NBQ25ELEVBQUUsQ0FBRTlNLE1BQU1nTixRQUFRQztZQUNqQixPQUFPak4sU0FBUyxJQUFJZ04sU0FBU0M7UUFDL0I7UUFFQSxJQUFJLENBQUNKLE1BQU0sQ0FBQ0sscUJBQXFCLEdBQUdIO0lBQ3RDO0FBQ0Y7QUFLQTs7OztDQUlDLEdBQ0QsSUFBQSxBQUFNNUIsZ0JBQU4sTUFBTUEsc0JBQXNCM007SUF3RFZpTSxVQUFnQjtRQUM5QixJQUFJLENBQUMwQyxvQkFBb0I7UUFDekIsS0FBSyxDQUFDMUM7SUFDUjtJQXhEQTs7Ozs7R0FLQyxHQUNELFlBQW9CVyxhQUFvRCxFQUFFYixNQUE4QixFQUFFNkMsVUFBZ0IsRUFBRWxKLGVBQWlDLENBQUc7UUFDOUosTUFBTW1KLFVBQVV6UCxZQUE4RTtZQUM1RjBQLGNBQWM7WUFDZHJJLGdCQUFnQi9DO1lBQ2hCcUwsb0NBQW9DbkwscUNBQXFDdUgsS0FBSztZQUU5RSxVQUFVO1lBQ1YsK0hBQStIO1lBQy9ILDRHQUE0RztZQUM1R2pGLFFBQVE5RixPQUFPK0YsT0FBTztRQUN4QixHQUFHVDtRQUVILE1BQU1zSixRQUFxRCxFQUFFO1FBRTdELElBQUtqRCxPQUFPSSxNQUFNLEtBQUssR0FBSTtZQUN6QjZDLE1BQU1DLElBQUksQ0FBRTtnQkFDVjlELE9BQU87Z0JBQ1ArRCxZQUFZLENBQUVoSixTQUFvQixJQUFJdkcsS0FBTW1FLGlDQUFpQ3BELGtCQUFrQjJGLDZCQUE2QjtnQkFDNUhJLGdCQUFnQjNDO1lBQ2xCO1FBQ0Y7UUFFQWlJLE9BQU9vRCxPQUFPLENBQUV4TCxDQUFBQTtZQUNkcUwsTUFBTUMsSUFBSSxDQUFFO2dCQUNWOUQsT0FBT3hIO2dCQUNQdUwsWUFBWSxDQUFFaEosU0FBb0IsSUFBSXZHLEtBQU1nRSxNQUFNeUwsSUFBSSxFQUFFMU8sa0JBQWtCMkYsNkJBQTZCO2dCQUN2R0ksZ0JBQWdCOUMsTUFBTXlMLElBQUk7WUFDNUI7UUFDRjtRQUVBLDJHQUEyRztRQUMzRyxTQUFTO1FBQ1R4QyxjQUFjdkgsR0FBRyxDQUFFMkosS0FBSyxDQUFFLEVBQUcsQ0FBQzdELEtBQUs7UUFFbkMsS0FBSyxDQUFFeUIsZUFBZW9DLE9BQU9KLFlBQVlDO1FBRXpDLGtHQUFrRztRQUNsRywwR0FBMEc7UUFDMUcseUVBQXlFO1FBQ3pFLElBQUksQ0FBQ1EsTUFBTSxDQUFDaEgscUNBQXFDLEdBQUc7UUFDcEQsSUFBSSxDQUFDc0csb0JBQW9CLEdBQUc7WUFDMUJLLE1BQU1HLE9BQU8sQ0FBRUcsQ0FBQUE7Z0JBQ2JBLEtBQUtuRSxLQUFLLEdBQUc7WUFDZjtRQUNGO0lBQ0Y7QUFNRjtBQUVBOztDQUVDLEdBQ0QsSUFBQSxBQUFNM0IscUJBQU4sTUFBTUEsMkJBQTJCNUo7SUFtRC9COztHQUVDLEdBQ0QsQUFBUTJQLDBCQUEyQkMsVUFBa0IsRUFBVztRQUM5RCxJQUFJQyxtQkFBbUI7UUFDdkJ0Syw0QkFBNEJnSyxPQUFPLENBQUUsQ0FBRWxKLGFBQWFrSDtZQUNsRCxJQUFLQSxNQUFNdUMsUUFBUSxDQUFFRixhQUFlO2dCQUNsQ0MsbUJBQW1CeEo7WUFDckI7UUFDRjtRQUNBMEosVUFBVUEsT0FBUUYsa0JBQWtCLENBQUMseUNBQXlDLEVBQUVELFlBQVk7UUFDNUYsT0FBT0M7SUFDVDtJQTlEQSxZQUFvQjdILFdBQXNDLEVBQUU2QixrQkFBa0MsQ0FBRztRQUMvRixNQUFNekQsUUFBUSxJQUFJckcsS0FBTWlJLGFBQWFsSCxrQkFBa0IyRiw2QkFBNkI7UUFFcEYsTUFBTXVKLGtCQUFrQm5HLG1CQUFtQjBELEtBQUs7UUFFaEQsTUFBTWtCLFNBQVMsSUFBSW5PLFFBQVN1SixvQkFBb0JtRyxpQkFBaUI7WUFDL0RDLGlCQUFpQjtZQUNqQjlCLFdBQVd6STtZQUNYMEksV0FBV3pJO1lBQ1gwSSxjQUFjO1lBQ2Q2QixtQkFBbUI7WUFFbkIsb0dBQW9HO1lBQ3BHLDhCQUE4QjtZQUM5QkMsZ0JBQWdCNUUsQ0FBQUEsUUFBU2pNLE1BQU04USxlQUFlLENBQUU3RSxPQUFPO1lBRXZELE9BQU87WUFDUGpELGNBQWM7WUFDZEMsY0FBY1A7WUFFZCxVQUFVO1lBQ1ZRLHFCQUFxQlI7WUFFckIsNEdBQTRHO1lBQzVHUyx1Q0FBdUM7WUFFdkMsVUFBVTtZQUNWbkMsUUFBUTlGLE9BQU8rRixPQUFPLENBQUMsK0hBQStIO1FBQ3hKO1FBRUEsTUFBTThKLFdBQVcsSUFBSXRRLEtBQU0sT0FBTztZQUFFdVEsTUFBTSxJQUFJM1EsU0FBVTtRQUFLO1FBQzdEOE8sT0FBTzhCLFlBQVksQ0FBRVAsZ0JBQWdCUSxHQUFHLEVBQUVIO1FBRTFDLE1BQU1JLFlBQVksSUFBSTFRLEtBQU0sUUFBUTtZQUFFdVEsTUFBTSxJQUFJM1EsU0FBVTtRQUFLO1FBQy9EOE8sT0FBTzhCLFlBQVksQ0FBRVAsZ0JBQWdCVSxHQUFHLEVBQUVEO1FBRTFDLEtBQUs7UUFFTCxVQUFVO1FBQ1YsTUFBTUUscUJBQXFCLENBQUUzTyxPQUFlNE87WUFDMUNuQyxPQUFPSyxxQkFBcUIsR0FBRyxJQUFJLENBQUNhLHlCQUF5QixDQUFFM047UUFDakU7UUFDQTZILG1CQUFtQmUsSUFBSSxDQUFFK0Y7UUFFekIsSUFBSSxDQUFDRSxNQUFNLENBQUU7WUFDWDdILFVBQVU7Z0JBQUU1QztnQkFBT3FJO2FBQVE7WUFDM0IzRixTQUFTO1FBQ1g7SUFDRjtBQWVGO0FBRUFuSSxNQUFNbVEsUUFBUSxDQUFFLHVCQUF1QmxMO0FBQ3ZDLGVBQWVBLG9CQUFvQiJ9