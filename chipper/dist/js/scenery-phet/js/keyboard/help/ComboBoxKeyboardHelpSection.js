// Copyright 2020-2024, University of Colorado Boulder
/**
 * Help section for explaining how to use a keyboard to interact with a ComboBox.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import TextKeyNode from '../TextKeyNode.js';
import KeyboardHelpIconFactory from './KeyboardHelpIconFactory.js';
import KeyboardHelpSection from './KeyboardHelpSection.js';
import KeyboardHelpSectionRow from './KeyboardHelpSectionRow.js';
let ComboBoxKeyboardHelpSection = class ComboBoxKeyboardHelpSection extends KeyboardHelpSection {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            headingString: SceneryPhetStrings.keyboardHelpDialog.comboBox.headingStringStringProperty,
            thingAsLowerCaseSingular: SceneryPhetStrings.keyboardHelpDialog.comboBox.optionStringProperty,
            thingAsLowerCasePlural: SceneryPhetStrings.keyboardHelpDialog.comboBox.optionsStringProperty,
            // KeyboardHelpSectionOptions
            a11yContentTagName: 'ol',
            vBoxOptions: {
                spacing: 8 // A bit tighter so that it looks like one set of instructions
            }
        }, providedOptions);
        // options may be string or TReadOnlyProperty<string>, so ensure that we have a TReadOnlyProperty<string>.
        const thingAsLowerCasePluralStringProperty = typeof options.thingAsLowerCasePlural === 'string' ? new StringProperty(options.thingAsLowerCasePlural) : options.thingAsLowerCasePlural;
        const thingAsLowerCaseSingularStringProperty = typeof options.thingAsLowerCaseSingular === 'string' ? new StringProperty(options.thingAsLowerCaseSingular) : options.thingAsLowerCaseSingular;
        // Create a PatternStringProperty that fills in a plural/singular pattern, and support dynamic locale.
        const createPatternStringProperty = (providedStringProperty)=>{
            return new PatternStringProperty(providedStringProperty, {
                thingPlural: thingAsLowerCasePluralStringProperty,
                thingSingular: thingAsLowerCaseSingularStringProperty
            }, {
                tandem: Tandem.OPT_OUT
            });
        };
        const spaceKeyNode = TextKeyNode.space();
        const enterKeyNode = TextKeyNode.enter();
        const spaceOrEnterIcon = KeyboardHelpIconFactory.iconOrIcon(spaceKeyNode, enterKeyNode);
        const popUpList = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.popUpListPatternStringProperty), spaceOrEnterIcon, {
            labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.popUpListPatternDescriptionStringProperty)
        });
        const moveThrough = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.moveThroughPatternStringProperty), KeyboardHelpIconFactory.upDownArrowKeysRowIcon(), {
            labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.moveThroughPatternDescriptionStringProperty)
        });
        const chooseNew = KeyboardHelpSectionRow.labelWithIcon(createPatternStringProperty(SceneryPhetStrings.keyboardHelpDialog.comboBox.chooseNewPatternStringProperty), enterKeyNode, {
            labelInnerContent: createPatternStringProperty(SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.chooseNewPatternDescriptionStringProperty)
        });
        const escapeKeyNode = TextKeyNode.esc();
        const closeWithoutChanging = KeyboardHelpSectionRow.labelWithIcon(SceneryPhetStrings.keyboardHelpDialog.comboBox.closeWithoutChangingStringProperty, escapeKeyNode, {
            labelInnerContent: SceneryPhetStrings.a11y.keyboardHelpDialog.comboBox.closeWithoutChangingDescriptionStringProperty
        });
        // order the rows of content
        const rows = [
            popUpList,
            moveThrough,
            chooseNew,
            closeWithoutChanging
        ];
        super(options.headingString, rows, options);
    }
};
export { ComboBoxKeyboardHelpSection as default };
sceneryPhet.register('ComboBoxKeyboardHelpSection', ComboBoxKeyboardHelpSection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0NvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIZWxwIHNlY3Rpb24gZm9yIGV4cGxhaW5pbmcgaG93IHRvIHVzZSBhIGtleWJvYXJkIHRvIGludGVyYWN0IHdpdGggYSBDb21ib0JveC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5pbXBvcnQgVGV4dEtleU5vZGUgZnJvbSAnLi4vVGV4dEtleU5vZGUuanMnO1xuaW1wb3J0IEtleWJvYXJkSGVscEljb25GYWN0b3J5IGZyb20gJy4vS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuanMnO1xuaW1wb3J0IEtleWJvYXJkSGVscFNlY3Rpb24sIHsgS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgfSBmcm9tICcuL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuaW1wb3J0IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cgZnJvbSAnLi9LZXlib2FyZEhlbHBTZWN0aW9uUm93LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBIZWFkaW5nIGZvciB0aGUgc2VjdGlvbiwgc2hvdWxkIGJlIGNhcGl0YWxpemVkIGFzIGEgdGl0bGVcbiAgaGVhZGluZ1N0cmluZz86IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XG5cbiAgLy8gdGhlIGl0ZW0gYmVpbmcgY2hhbmdlZCBieSB0aGUgY29tYm8gYm94LCBsb3dlciBjYXNlIGFzIHVzZWQgaW4gYSBzZW50ZW5jZVxuICB0aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXI/OiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xuXG4gIC8vIHBsdXJhbCB2ZXJzaW9uIG9mIHRoaW5nQXNMb3dlckNhc2VTaW5ndWxhclxuICB0aGluZ0FzTG93ZXJDYXNlUGx1cmFsPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbn07XG5cbmV4cG9ydCB0eXBlIENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEtleWJvYXJkSGVscFNlY3Rpb25PcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21ib0JveEtleWJvYXJkSGVscFNlY3Rpb24gZXh0ZW5kcyBLZXlib2FyZEhlbHBTZWN0aW9uIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbWJvQm94S2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBLZXlib2FyZEhlbHBTZWN0aW9uT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgaGVhZGluZ1N0cmluZzogU2NlbmVyeVBoZXRTdHJpbmdzLmtleWJvYXJkSGVscERpYWxvZy5jb21ib0JveC5oZWFkaW5nU3RyaW5nU3RyaW5nUHJvcGVydHksXG4gICAgICB0aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXI6IFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gub3B0aW9uU3RyaW5nUHJvcGVydHksXG4gICAgICB0aGluZ0FzTG93ZXJDYXNlUGx1cmFsOiBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94Lm9wdGlvbnNTdHJpbmdQcm9wZXJ0eSxcblxuICAgICAgLy8gS2V5Ym9hcmRIZWxwU2VjdGlvbk9wdGlvbnNcbiAgICAgIGExMXlDb250ZW50VGFnTmFtZTogJ29sJywgLy8gb3JkZXJlZCBsaXN0XG4gICAgICB2Qm94T3B0aW9uczoge1xuICAgICAgICBzcGFjaW5nOiA4IC8vIEEgYml0IHRpZ2h0ZXIgc28gdGhhdCBpdCBsb29rcyBsaWtlIG9uZSBzZXQgb2YgaW5zdHJ1Y3Rpb25zXG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBvcHRpb25zIG1heSBiZSBzdHJpbmcgb3IgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgc28gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4uXG4gICAgY29uc3QgdGhpbmdBc0xvd2VyQ2FzZVBsdXJhbFN0cmluZ1Byb3BlcnR5ID0gKCB0eXBlb2Ygb3B0aW9ucy50aGluZ0FzTG93ZXJDYXNlUGx1cmFsID09PSAnc3RyaW5nJyApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU3RyaW5nUHJvcGVydHkoIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVBsdXJhbCApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRoaW5nQXNMb3dlckNhc2VQbHVyYWw7XG4gICAgY29uc3QgdGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyU3RyaW5nUHJvcGVydHkgPSAoIHR5cGVvZiBvcHRpb25zLnRoaW5nQXNMb3dlckNhc2VTaW5ndWxhciA9PT0gJ3N0cmluZycgKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU3RyaW5nUHJvcGVydHkoIG9wdGlvbnMudGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy50aGluZ0FzTG93ZXJDYXNlU2luZ3VsYXI7XG5cbiAgICAvLyBDcmVhdGUgYSBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgdGhhdCBmaWxscyBpbiBhIHBsdXJhbC9zaW5ndWxhciBwYXR0ZXJuLCBhbmQgc3VwcG9ydCBkeW5hbWljIGxvY2FsZS5cbiAgICBjb25zdCBjcmVhdGVQYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSAoIHByb3ZpZGVkU3RyaW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eShcbiAgICAgICAgcHJvdmlkZWRTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICAgIHRoaW5nUGx1cmFsOiB0aGluZ0FzTG93ZXJDYXNlUGx1cmFsU3RyaW5nUHJvcGVydHksXG4gICAgICAgICAgdGhpbmdTaW5ndWxhcjogdGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyU3RyaW5nUHJvcGVydHlcbiAgICAgICAgfSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3BhY2VLZXlOb2RlID0gVGV4dEtleU5vZGUuc3BhY2UoKTtcbiAgICBjb25zdCBlbnRlcktleU5vZGUgPSBUZXh0S2V5Tm9kZS5lbnRlcigpO1xuICAgIGNvbnN0IHNwYWNlT3JFbnRlckljb24gPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uT3JJY29uKCBzcGFjZUtleU5vZGUsIGVudGVyS2V5Tm9kZSApO1xuXG4gICAgY29uc3QgcG9wVXBMaXN0ID0gS2V5Ym9hcmRIZWxwU2VjdGlvblJvdy5sYWJlbFdpdGhJY29uKFxuICAgICAgY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94LnBvcFVwTGlzdFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSApLFxuICAgICAgc3BhY2VPckVudGVySWNvbiwge1xuICAgICAgICBsYWJlbElubmVyQ29udGVudDogY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gucG9wVXBMaXN0UGF0dGVybkRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgKVxuICAgICAgfSApO1xuXG4gICAgY29uc3QgbW92ZVRocm91Z2ggPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oXG4gICAgICBjcmVhdGVQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gubW92ZVRocm91Z2hQYXR0ZXJuU3RyaW5nUHJvcGVydHkgKSxcbiAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5LnVwRG93bkFycm93S2V5c1Jvd0ljb24oKSwge1xuICAgICAgICBsYWJlbElubmVyQ29udGVudDogY3JlYXRlUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3gubW92ZVRocm91Z2hQYXR0ZXJuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSApXG4gICAgICB9ICk7XG5cbiAgICBjb25zdCBjaG9vc2VOZXcgPSBLZXlib2FyZEhlbHBTZWN0aW9uUm93LmxhYmVsV2l0aEljb24oXG4gICAgICBjcmVhdGVQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3guY2hvb3NlTmV3UGF0dGVyblN0cmluZ1Byb3BlcnR5ICksXG4gICAgICBlbnRlcktleU5vZGUsIHtcbiAgICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IGNyZWF0ZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkua2V5Ym9hcmRIZWxwRGlhbG9nLmNvbWJvQm94LmNob29zZU5ld1BhdHRlcm5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IClcbiAgICAgIH0gKTtcblxuICAgIGNvbnN0IGVzY2FwZUtleU5vZGUgPSBUZXh0S2V5Tm9kZS5lc2MoKTtcbiAgICBjb25zdCBjbG9zZVdpdGhvdXRDaGFuZ2luZyA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbihcbiAgICAgIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuY29tYm9Cb3guY2xvc2VXaXRob3V0Q2hhbmdpbmdTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIGVzY2FwZUtleU5vZGUsIHtcbiAgICAgICAgbGFiZWxJbm5lckNvbnRlbnQ6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5LmtleWJvYXJkSGVscERpYWxvZy5jb21ib0JveC5jbG9zZVdpdGhvdXRDaGFuZ2luZ0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHlcbiAgICAgIH0gKTtcblxuICAgIC8vIG9yZGVyIHRoZSByb3dzIG9mIGNvbnRlbnRcbiAgICBjb25zdCByb3dzID0gWyBwb3BVcExpc3QsIG1vdmVUaHJvdWdoLCBjaG9vc2VOZXcsIGNsb3NlV2l0aG91dENoYW5naW5nIF07XG4gICAgc3VwZXIoIG9wdGlvbnMuaGVhZGluZ1N0cmluZywgcm93cywgb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uJywgQ29tYm9Cb3hLZXlib2FyZEhlbHBTZWN0aW9uICk7Il0sIm5hbWVzIjpbIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5Iiwib3B0aW9uaXplIiwiVGFuZGVtIiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJUZXh0S2V5Tm9kZSIsIktleWJvYXJkSGVscEljb25GYWN0b3J5IiwiS2V5Ym9hcmRIZWxwU2VjdGlvbiIsIktleWJvYXJkSGVscFNlY3Rpb25Sb3ciLCJDb21ib0JveEtleWJvYXJkSGVscFNlY3Rpb24iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGVhZGluZ1N0cmluZyIsImtleWJvYXJkSGVscERpYWxvZyIsImNvbWJvQm94IiwiaGVhZGluZ1N0cmluZ1N0cmluZ1Byb3BlcnR5IiwidGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyIiwib3B0aW9uU3RyaW5nUHJvcGVydHkiLCJ0aGluZ0FzTG93ZXJDYXNlUGx1cmFsIiwib3B0aW9uc1N0cmluZ1Byb3BlcnR5IiwiYTExeUNvbnRlbnRUYWdOYW1lIiwidkJveE9wdGlvbnMiLCJzcGFjaW5nIiwidGhpbmdBc0xvd2VyQ2FzZVBsdXJhbFN0cmluZ1Byb3BlcnR5IiwidGhpbmdBc0xvd2VyQ2FzZVNpbmd1bGFyU3RyaW5nUHJvcGVydHkiLCJjcmVhdGVQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJwcm92aWRlZFN0cmluZ1Byb3BlcnR5IiwidGhpbmdQbHVyYWwiLCJ0aGluZ1Npbmd1bGFyIiwidGFuZGVtIiwiT1BUX09VVCIsInNwYWNlS2V5Tm9kZSIsInNwYWNlIiwiZW50ZXJLZXlOb2RlIiwiZW50ZXIiLCJzcGFjZU9yRW50ZXJJY29uIiwiaWNvbk9ySWNvbiIsInBvcFVwTGlzdCIsImxhYmVsV2l0aEljb24iLCJwb3BVcExpc3RQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJsYWJlbElubmVyQ29udGVudCIsImExMXkiLCJwb3BVcExpc3RQYXR0ZXJuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsIm1vdmVUaHJvdWdoIiwibW92ZVRocm91Z2hQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ1cERvd25BcnJvd0tleXNSb3dJY29uIiwibW92ZVRocm91Z2hQYXR0ZXJuRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImNob29zZU5ldyIsImNob29zZU5ld1BhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImNob29zZU5ld1BhdHRlcm5EZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwiZXNjYXBlS2V5Tm9kZSIsImVzYyIsImNsb3NlV2l0aG91dENoYW5naW5nIiwiY2xvc2VXaXRob3V0Q2hhbmdpbmdTdHJpbmdQcm9wZXJ0eSIsImNsb3NlV2l0aG91dENoYW5naW5nRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInJvd3MiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSwyQkFBMkIsK0NBQStDO0FBQ2pGLE9BQU9DLG9CQUFvQix3Q0FBd0M7QUFFbkUsT0FBT0MsZUFBZSx3Q0FBd0M7QUFDOUQsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUMvQyxPQUFPQyx3QkFBd0IsOEJBQThCO0FBQzdELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFDNUMsT0FBT0MsNkJBQTZCLCtCQUErQjtBQUNuRSxPQUFPQyx5QkFBeUQsMkJBQTJCO0FBQzNGLE9BQU9DLDRCQUE0Qiw4QkFBOEI7QUFnQmxELElBQUEsQUFBTUMsOEJBQU4sTUFBTUEsb0NBQW9DRjtJQUV2RCxZQUFvQkcsZUFBb0QsQ0FBRztRQUV6RSxNQUFNQyxVQUFVVixZQUEwRjtZQUV4RyxjQUFjO1lBQ2RXLGVBQWVSLG1C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