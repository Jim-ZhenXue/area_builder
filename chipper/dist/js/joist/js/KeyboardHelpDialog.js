// Copyright 2016-2024, University of Colorado Boulder
/**
 * Shows a Dialog with content describing keyboard interactions. Opened via a button in the navigation bar.
 *
 * @author Jesse Greenberg
 */ import Multilink from '../../axon/js/Multilink.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import KeyboardHelpSectionRow from '../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TextKeyNode from '../../scenery-phet/js/keyboard/TextKeyNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { HBox, Node, ReadingBlock, VBox, VoicingText } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
// constants
const TITLE_MAX_WIDTH = 670;
const tabToGetStartedStringProperty = JoistStrings.a11y.keyboardHelp.tabToGetStartedStringProperty;
let KeyboardHelpDialog = class KeyboardHelpDialog extends Dialog {
    constructor(screens, screenProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            titleAlign: 'center',
            fill: 'rgb( 214, 237, 249 )',
            ySpacing: 15,
            // phet-io
            phetioReadOnly: true,
            phetioDynamicElement: true,
            // Append the title to the close button
            closeButtonVoicingDialogTitle: JoistStrings.keyboardShortcuts.titleStringProperty,
            isDisposable: false
        }, providedOptions);
        const content = new Node({
            tagName: 'div'
        });
        const contentTandem = options.tandem.createTandem('content');
        const screenContentNodes = [];
        screens.forEach((screen)=>{
            assert && assert(screen.createKeyboardHelpNode, 'if any screen has keyboard help content, then all screens need content');
            const screenTandem = screen.tandem.supplied ? contentTandem.createTandem(screen.tandem.name) : Tandem.REQUIRED;
            const keyboardHelpNode = screen.createKeyboardHelpNode(screenTandem);
            screenContentNodes.push(keyboardHelpNode);
        });
        const shortcutsTitleText = new VoicingText(JoistStrings.keyboardShortcuts.titleStringProperty, {
            font: new PhetFont({
                weight: 'bold',
                size: 24
            }),
            maxWidth: TITLE_MAX_WIDTH,
            // voicing options
            readingBlockDisabledTagName: null
        });
        // a 'tab to get started' hint
        const tabHintLine = new TabHintLine();
        // stack the two items with a bit of spacing
        assert && assert(!options.title, 'KeyboardHelpDialog sets title');
        const titleVBox = new VBox({
            children: [
                shortcutsTitleText,
                tabHintLine
            ],
            spacing: 5,
            // pdom
            tagName: 'div'
        });
        options.title = titleVBox;
        // help content surrounded by a div unless already specified, so that all content is read when dialog opens
        super(content, options);
        // When the screen changes, swap out keyboard help content to the selected screen's content
        Multilink.multilink([
            screenProperty,
            this.isShowingProperty
        ], (screen, isShowing)=>{
            assert && assert(screens.includes(screen), 'double check that this is an expected screen');
            const currentContentNode = screenContentNodes[screens.indexOf(screen)];
            if (isShowing) {
                assert && assert(currentContentNode, 'a displayed KeyboardHelpButton for a screen should have content');
                content.children = [
                    currentContentNode
                ];
            }
        });
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        if (assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder)) {
            screenContentNodes.forEach((node)=>{
                content.children = [
                    node
                ];
                InstanceRegistry.registerDataURL('joist', 'KeyboardHelpDialog', this);
            });
        }
    }
};
export { KeyboardHelpDialog as default };
let TabHintLine = class TabHintLine extends ReadingBlock(Node) {
    constructor(providedOptions){
        const options = optionize()({
            readingBlockNameResponse: tabToGetStartedStringProperty
        }, providedOptions);
        super();
        const tabIcon = TextKeyNode.tab();
        // a line to say "tab to get started" below the "Keyboard Shortcuts" 'title'
        const labelWithIcon = KeyboardHelpSectionRow.labelWithIcon(JoistStrings.keyboardShortcuts.toGetStartedStringProperty, tabIcon, {
            labelInnerContent: tabToGetStartedStringProperty,
            iconOptions: {
                tagName: 'p' // because there is only one, and the default is an li tag
            }
        });
        // labelWithIcon is meant to be passed to KeyboardHelpSection, so we have to hack a bit here
        const hBox = new HBox({
            children: [
                labelWithIcon.icon,
                labelWithIcon.label
            ],
            spacing: 4
        });
        this.addChild(hBox);
        this.mutate(options);
    }
};
joist.register('KeyboardHelpDialog', KeyboardHelpDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0tleWJvYXJkSGVscERpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTaG93cyBhIERpYWxvZyB3aXRoIGNvbnRlbnQgZGVzY3JpYmluZyBrZXlib2FyZCBpbnRlcmFjdGlvbnMuIE9wZW5lZCB2aWEgYSBidXR0b24gaW4gdGhlIG5hdmlnYXRpb24gYmFyLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBLZXlib2FyZEhlbHBTZWN0aW9uUm93IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscFNlY3Rpb25Sb3cuanMnO1xuaW1wb3J0IFRleHRLZXlOb2RlIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9UZXh0S2V5Tm9kZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIE5vZGVPcHRpb25zLCBSZWFkaW5nQmxvY2ssIFJlYWRpbmdCbG9ja09wdGlvbnMsIFZCb3gsIFZvaWNpbmdUZXh0IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBEaWFsb2csIHsgRGlhbG9nT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IHsgQW55U2NyZWVuIH0gZnJvbSAnLi9TY3JlZW4uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFRJVExFX01BWF9XSURUSCA9IDY3MDtcblxuY29uc3QgdGFiVG9HZXRTdGFydGVkU3RyaW5nUHJvcGVydHkgPSBKb2lzdFN0cmluZ3MuYTExeS5rZXlib2FyZEhlbHAudGFiVG9HZXRTdGFydGVkU3RyaW5nUHJvcGVydHk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBLZXlib2FyZEhlbHBEaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PERpYWxvZ09wdGlvbnMsICd0aXRsZSc+ICYgUGlja1JlcXVpcmVkPERpYWxvZ09wdGlvbnMsICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5Ym9hcmRIZWxwRGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjcmVlbnM6IEFueVNjcmVlbltdLCBzY3JlZW5Qcm9wZXJ0eTogUHJvcGVydHk8QW55U2NyZWVuPiwgcHJvdmlkZWRPcHRpb25zPzogS2V5Ym9hcmRIZWxwRGlhbG9nT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwRGlhbG9nT3B0aW9ucywgU2VsZk9wdGlvbnMsIERpYWxvZ09wdGlvbnM+KCkoIHtcbiAgICAgIHRpdGxlQWxpZ246ICdjZW50ZXInLFxuICAgICAgZmlsbDogJ3JnYiggMjE0LCAyMzcsIDI0OSApJyxcbiAgICAgIHlTcGFjaW5nOiAxNSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsIC8vIHRoZSBLZXlib2FyZEhlbHBEaWFsb2cgc2hvdWxkIG5vdCBiZSBzZXR0YWJsZVxuICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWUsXG5cbiAgICAgIC8vIEFwcGVuZCB0aGUgdGl0bGUgdG8gdGhlIGNsb3NlIGJ1dHRvblxuICAgICAgY2xvc2VCdXR0b25Wb2ljaW5nRGlhbG9nVGl0bGU6IEpvaXN0U3RyaW5ncy5rZXlib2FyZFNob3J0Y3V0cy50aXRsZVN0cmluZ1Byb3BlcnR5LFxuICAgICAgaXNEaXNwb3NhYmxlOiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBOb2RlKCB7XG4gICAgICB0YWdOYW1lOiAnZGl2J1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGNvbnRlbnRUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250ZW50JyApO1xuICAgIGNvbnN0IHNjcmVlbkNvbnRlbnROb2RlczogTm9kZVtdID0gW107XG4gICAgc2NyZWVucy5mb3JFYWNoKCBzY3JlZW4gPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLmNyZWF0ZUtleWJvYXJkSGVscE5vZGUsICdpZiBhbnkgc2NyZWVuIGhhcyBrZXlib2FyZCBoZWxwIGNvbnRlbnQsIHRoZW4gYWxsIHNjcmVlbnMgbmVlZCBjb250ZW50JyApO1xuICAgICAgY29uc3Qgc2NyZWVuVGFuZGVtID0gc2NyZWVuLnRhbmRlbS5zdXBwbGllZCA/IGNvbnRlbnRUYW5kZW0uY3JlYXRlVGFuZGVtKCBzY3JlZW4udGFuZGVtLm5hbWUgKSA6IFRhbmRlbS5SRVFVSVJFRDtcbiAgICAgIGNvbnN0IGtleWJvYXJkSGVscE5vZGUgPSBzY3JlZW4uY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSEoIHNjcmVlblRhbmRlbSApO1xuICAgICAgc2NyZWVuQ29udGVudE5vZGVzLnB1c2goIGtleWJvYXJkSGVscE5vZGUgKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzaG9ydGN1dHNUaXRsZVRleHQgPSBuZXcgVm9pY2luZ1RleHQoIEpvaXN0U3RyaW5ncy5rZXlib2FyZFNob3J0Y3V0cy50aXRsZVN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHtcbiAgICAgICAgd2VpZ2h0OiAnYm9sZCcsXG4gICAgICAgIHNpemU6IDI0XG4gICAgICB9ICksXG4gICAgICBtYXhXaWR0aDogVElUTEVfTUFYX1dJRFRILFxuXG4gICAgICAvLyB2b2ljaW5nIG9wdGlvbnNcbiAgICAgIHJlYWRpbmdCbG9ja0Rpc2FibGVkVGFnTmFtZTogbnVsbFxuICAgIH0gKTtcblxuICAgIC8vIGEgJ3RhYiB0byBnZXQgc3RhcnRlZCcgaGludFxuICAgIGNvbnN0IHRhYkhpbnRMaW5lID0gbmV3IFRhYkhpbnRMaW5lKCk7XG5cbiAgICAvLyBzdGFjayB0aGUgdHdvIGl0ZW1zIHdpdGggYSBiaXQgb2Ygc3BhY2luZ1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnRpdGxlLCAnS2V5Ym9hcmRIZWxwRGlhbG9nIHNldHMgdGl0bGUnICk7XG4gICAgY29uc3QgdGl0bGVWQm94ID0gbmV3IFZCb3goIHtcbiAgICAgICAgY2hpbGRyZW46IFsgc2hvcnRjdXRzVGl0bGVUZXh0LCB0YWJIaW50TGluZSBdLFxuICAgICAgICBzcGFjaW5nOiA1LFxuXG4gICAgICAgIC8vIHBkb21cbiAgICAgICAgdGFnTmFtZTogJ2RpdidcbiAgICAgIH1cbiAgICApO1xuICAgIG9wdGlvbnMudGl0bGUgPSB0aXRsZVZCb3g7XG5cbiAgICAvLyBoZWxwIGNvbnRlbnQgc3Vycm91bmRlZCBieSBhIGRpdiB1bmxlc3MgYWxyZWFkeSBzcGVjaWZpZWQsIHNvIHRoYXQgYWxsIGNvbnRlbnQgaXMgcmVhZCB3aGVuIGRpYWxvZyBvcGVuc1xuXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcblxuICAgIC8vIFdoZW4gdGhlIHNjcmVlbiBjaGFuZ2VzLCBzd2FwIG91dCBrZXlib2FyZCBoZWxwIGNvbnRlbnQgdG8gdGhlIHNlbGVjdGVkIHNjcmVlbidzIGNvbnRlbnRcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHNjcmVlblByb3BlcnR5LCB0aGlzLmlzU2hvd2luZ1Byb3BlcnR5IF0sICggc2NyZWVuLCBpc1Nob3dpbmcgKSA9PiB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzY3JlZW5zLmluY2x1ZGVzKCBzY3JlZW4gKSwgJ2RvdWJsZSBjaGVjayB0aGF0IHRoaXMgaXMgYW4gZXhwZWN0ZWQgc2NyZWVuJyApO1xuICAgICAgY29uc3QgY3VycmVudENvbnRlbnROb2RlID0gc2NyZWVuQ29udGVudE5vZGVzWyBzY3JlZW5zLmluZGV4T2YoIHNjcmVlbiApIF07XG4gICAgICBpZiAoIGlzU2hvd2luZyApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudENvbnRlbnROb2RlLCAnYSBkaXNwbGF5ZWQgS2V5Ym9hcmRIZWxwQnV0dG9uIGZvciBhIHNjcmVlbiBzaG91bGQgaGF2ZSBjb250ZW50JyApO1xuICAgICAgICBjb250ZW50LmNoaWxkcmVuID0gWyBjdXJyZW50Q29udGVudE5vZGUgXTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBpZiAoIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgKSB7XG4gICAgICBzY3JlZW5Db250ZW50Tm9kZXMuZm9yRWFjaCggbm9kZSA9PiB7XG4gICAgICAgIGNvbnRlbnQuY2hpbGRyZW4gPSBbIG5vZGUgXTtcbiAgICAgICAgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdqb2lzdCcsICdLZXlib2FyZEhlbHBEaWFsb2cnLCB0aGlzICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gaW5uZXIgY2xhc3MgdGhhdCBhc3NlbWJsZXMgdGhlIFwiVGFiIHRvIGdldCBzdGFydGVkXCIgY29udGVudCBvZiB0aGUgRGlhbG9nIHRpdGxlLiBUaGlzIGNvbnRlbnRcbiAqIGlzIGludGVyYWN0aXZlIHdpdGggVm9pY2luZyBpbiB0aGF0IGl0IGNhbiBiZSBjbGlja2VkIHRvIGhlYXIgdGhpcyBjb250ZW50ICh3aGVuIFZvaWNpbmcgaXMgZW5hYmxlZCkuXG4gKi9cblxudHlwZSBUYWJIaW50TGluZVNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgVGFiSGludExpbmVPcHRpb25zID0gVGFiSGludExpbmVTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zICYgUmVhZGluZ0Jsb2NrT3B0aW9ucztcblxuY2xhc3MgVGFiSGludExpbmUgZXh0ZW5kcyBSZWFkaW5nQmxvY2soIE5vZGUgKSB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBUYWJIaW50TGluZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRhYkhpbnRMaW5lT3B0aW9ucywgVGFiSGludExpbmVTZWxmT3B0aW9ucywgUmVhZGluZ0Jsb2NrT3B0aW9ucz4oKSgge1xuICAgICAgcmVhZGluZ0Jsb2NrTmFtZVJlc3BvbnNlOiB0YWJUb0dldFN0YXJ0ZWRTdHJpbmdQcm9wZXJ0eVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IHRhYkljb24gPSBUZXh0S2V5Tm9kZS50YWIoKTtcblxuICAgIC8vIGEgbGluZSB0byBzYXkgXCJ0YWIgdG8gZ2V0IHN0YXJ0ZWRcIiBiZWxvdyB0aGUgXCJLZXlib2FyZCBTaG9ydGN1dHNcIiAndGl0bGUnXG4gICAgY29uc3QgbGFiZWxXaXRoSWNvbiA9IEtleWJvYXJkSGVscFNlY3Rpb25Sb3cubGFiZWxXaXRoSWNvbiggSm9pc3RTdHJpbmdzLmtleWJvYXJkU2hvcnRjdXRzLnRvR2V0U3RhcnRlZFN0cmluZ1Byb3BlcnR5LFxuICAgICAgdGFiSWNvbiwge1xuICAgICAgICBsYWJlbElubmVyQ29udGVudDogdGFiVG9HZXRTdGFydGVkU3RyaW5nUHJvcGVydHksXG4gICAgICAgIGljb25PcHRpb25zOiB7XG4gICAgICAgICAgdGFnTmFtZTogJ3AnIC8vIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmUsIGFuZCB0aGUgZGVmYXVsdCBpcyBhbiBsaSB0YWdcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgLy8gbGFiZWxXaXRoSWNvbiBpcyBtZWFudCB0byBiZSBwYXNzZWQgdG8gS2V5Ym9hcmRIZWxwU2VjdGlvbiwgc28gd2UgaGF2ZSB0byBoYWNrIGEgYml0IGhlcmVcbiAgICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbIGxhYmVsV2l0aEljb24uaWNvbiwgbGFiZWxXaXRoSWNvbi5sYWJlbCBdLFxuICAgICAgc3BhY2luZzogNFxuICAgIH0gKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIGhCb3ggKTtcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnS2V5Ym9hcmRIZWxwRGlhbG9nJywgS2V5Ym9hcmRIZWxwRGlhbG9nICk7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJLZXlib2FyZEhlbHBTZWN0aW9uUm93IiwiVGV4dEtleU5vZGUiLCJQaGV0Rm9udCIsIkhCb3giLCJOb2RlIiwiUmVhZGluZ0Jsb2NrIiwiVkJveCIsIlZvaWNpbmdUZXh0IiwiRGlhbG9nIiwiVGFuZGVtIiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJUSVRMRV9NQVhfV0lEVEgiLCJ0YWJUb0dldFN0YXJ0ZWRTdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJrZXlib2FyZEhlbHAiLCJLZXlib2FyZEhlbHBEaWFsb2ciLCJzY3JlZW5zIiwic2NyZWVuUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJ3aW5kb3ciLCJvcHRpb25zIiwidGl0bGVBbGlnbiIsImZpbGwiLCJ5U3BhY2luZyIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJjbG9zZUJ1dHRvblZvaWNpbmdEaWFsb2dUaXRsZSIsImtleWJvYXJkU2hvcnRjdXRzIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImlzRGlzcG9zYWJsZSIsImNvbnRlbnQiLCJ0YWdOYW1lIiwiY29udGVudFRhbmRlbSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNjcmVlbkNvbnRlbnROb2RlcyIsImZvckVhY2giLCJzY3JlZW4iLCJhc3NlcnQiLCJjcmVhdGVLZXlib2FyZEhlbHBOb2RlIiwic2NyZWVuVGFuZGVtIiwic3VwcGxpZWQiLCJuYW1lIiwiUkVRVUlSRUQiLCJrZXlib2FyZEhlbHBOb2RlIiwicHVzaCIsInNob3J0Y3V0c1RpdGxlVGV4dCIsImZvbnQiLCJ3ZWlnaHQiLCJzaXplIiwibWF4V2lkdGgiLCJyZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWUiLCJ0YWJIaW50TGluZSIsIlRhYkhpbnRMaW5lIiwidGl0bGUiLCJ0aXRsZVZCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJtdWx0aWxpbmsiLCJpc1Nob3dpbmdQcm9wZXJ0eSIsImlzU2hvd2luZyIsImluY2x1ZGVzIiwiY3VycmVudENvbnRlbnROb2RlIiwiaW5kZXhPZiIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwibm9kZSIsInJlZ2lzdGVyRGF0YVVSTCIsInJlYWRpbmdCbG9ja05hbWVSZXNwb25zZSIsInRhYkljb24iLCJ0YWIiLCJsYWJlbFdpdGhJY29uIiwidG9HZXRTdGFydGVkU3RyaW5nUHJvcGVydHkiLCJsYWJlbElubmVyQ29udGVudCIsImljb25PcHRpb25zIiwiaEJveCIsImljb24iLCJsYWJlbCIsImFkZENoaWxkIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFFbkQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxlQUFxQyxrQ0FBa0M7QUFHOUUsT0FBT0MsNEJBQTRCLGdFQUFnRTtBQUNuRyxPQUFPQyxpQkFBaUIsZ0RBQWdEO0FBQ3hFLE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFlQyxZQUFZLEVBQXVCQyxJQUFJLEVBQUVDLFdBQVcsUUFBUSw4QkFBOEI7QUFDNUgsT0FBT0MsWUFBK0IseUJBQXlCO0FBQy9ELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFdBQVcsYUFBYTtBQUMvQixPQUFPQyxrQkFBa0Isb0JBQW9CO0FBRzdDLFlBQVk7QUFDWixNQUFNQyxrQkFBa0I7QUFFeEIsTUFBTUMsZ0NBQWdDRixhQUFhRyxJQUFJLENBQUNDLFlBQVksQ0FBQ0YsNkJBQTZCO0FBTW5GLElBQUEsQUFBTUcscUJBQU4sTUFBTUEsMkJBQTJCUjtJQUU5QyxZQUFvQlMsT0FBb0IsRUFBRUMsY0FBbUMsRUFBRUMsZUFBMkMsQ0FBRztZQXNFNUdDLHNDQUFBQSxzQkFBQUE7UUFwRWYsTUFBTUMsVUFBVXRCLFlBQW9FO1lBQ2xGdUIsWUFBWTtZQUNaQyxNQUFNO1lBQ05DLFVBQVU7WUFFVixVQUFVO1lBQ1ZDLGdCQUFnQjtZQUNoQkMs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