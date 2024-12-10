// Copyright 2014-2024, University of Colorado Boulder
/**
 * RectangularRadioButtonGroup is a group of rectangular radio buttons, in either horizontal or vertical orientation.
 * See sun.ButtonsScreenView for example usage.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import InstanceRegistry from '../../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Color, FlowBox, HighlightFromNode, ParallelDOM, PDOMPeer, PDOMUtils, SceneryConstants } from '../../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ColorConstants from '../ColorConstants.js';
import { getGroupItemNodes } from '../GroupItemOptions.js';
import sun from '../sun.js';
import RectangularRadioButton from './RectangularRadioButton.js';
// pdom - Unique ID for each instance of RectangularRadioButtonGroup. Used to create the 'name' option that is passed
// to each RectangularRadioButton in the group. All buttons in the group must have the same 'name', and that name
// must be unique to the group. Otherwise, the browser will treat all inputs of type 'radio' in the document as being
// in a single group.
let instanceCount = 0;
// Prefix for instanceCount, because PhET sims have different types of "groups"
const CLASS_NAME = 'RectangularRadioButtonGroup';
let RectangularRadioButtonGroup = class RectangularRadioButtonGroup extends FlowBox {
    /**
   * Find the RectangularRadioButton corresponding to a value. Note that in the scene graph, the button may be nested
   * under other layers, so use caution for coordinate transformations.
   * @param value
   * @returns the corresponding button
   */ getButtonForValue(value) {
        const result = this.radioButtonMap.get(value);
        assert && assert(result, 'No button found for value: ' + value);
        return result;
    }
    dispose() {
        this.radioButtonMap.clear();
        this.disposeRadioButtonGroup();
        super.dispose();
    }
    constructor(property, items, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && assert(_.uniqBy(items, (item)=>item.value).length === items.length, 'items must have unique values');
        assert && assert(_.find(items, (item)=>item.value === property.value), 'one radio button must be associated with property.value');
        const options = optionize()({
            // SelfOptions
            soundPlayers: null,
            labelAlign: 'bottom',
            labelSpacing: 0,
            touchAreaXDilation: 0,
            touchAreaYDilation: 0,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0,
            radioButtonOptions: {
                baseColor: ColorConstants.LIGHT_BLUE,
                cornerRadius: 4,
                xMargin: 5,
                yMargin: 5,
                xAlign: 'center',
                yAlign: 'center',
                buttonAppearanceStrategyOptions: {
                    selectedStroke: 'black',
                    selectedLineWidth: 1.5,
                    selectedButtonOpacity: 1,
                    deselectedStroke: new Color(50, 50, 50),
                    deselectedLineWidth: 1,
                    deselectedButtonOpacity: 0.6,
                    overButtonOpacity: 0.8
                },
                contentAppearanceStrategy: RectangularRadioButton.ContentAppearanceStrategy,
                contentAppearanceStrategyOptions: {
                    overContentOpacity: 0.8,
                    selectedContentOpacity: 1,
                    deselectedContentOpacity: 0.6
                }
            },
            // FlowBoxOptions
            spacing: 10,
            stretch: true,
            orientation: 'vertical',
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ButtonGroup',
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true,
            phetioFeatured: true,
            // pdom
            tagName: 'ul',
            labelTagName: 'h3',
            ariaRole: 'radiogroup',
            helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT,
            groupFocusHighlight: true
        }, providedOptions);
        assert && assert(options.soundPlayers === null || options.soundPlayers.length === items.length, 'If soundPlayers is provided, there must be one per radio button.');
        instanceCount++;
        const radioButtonMap = new Map();
        const nodes = getGroupItemNodes(items, options.tandem);
        assert && assert(_.every(nodes, (node)=>!node.hasPDOMContent), 'Accessibility is provided by RectangularRadioButton and accessibleName in RectangularRadioButtonGroupItem options. ' + 'Additional PDOM content in the provided Node could break accessibility.');
        // Calculate the maximum width and height of the content, so we can make all radio buttons the same size.
        const widestContentWidth = _.maxBy(nodes, (node)=>node.width).width;
        const tallestContentHeight = _.maxBy(nodes, (node)=>node.height).height;
        // Populated for each radio button in for loop
        const buttons = [];
        const buttonsWithLayoutNodes = [];
        const labelAppearanceStrategies = [];
        const xMargin = options.radioButtonOptions.xMargin;
        const yMargin = options.radioButtonOptions.yMargin;
        for(let i = 0; i < items.length; i++){
            const item = items[i];
            const node = nodes[i];
            const radioButtonOptions = combineOptions({
                content: node,
                minWidth: widestContentWidth + 2 * xMargin,
                minHeight: tallestContentHeight + 2 * yMargin,
                soundPlayer: options.soundPlayers ? options.soundPlayers[i] : multiSelectionSoundPlayerFactory.getSelectionSoundPlayer(i),
                tandem: item.tandemName ? options.tandem.createTandem(item.tandemName) : options.tandem === Tandem.OPT_OUT ? Tandem.OPT_OUT : Tandem.REQUIRED,
                phetioDocumentation: item.phetioDocumentation || '',
                // NOTE: This does NOT support dynamic orientation changes. If you need that, change RectangularButton to
                // support dynamic options.
                touchAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.touchAreaXDilation,
                touchAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.touchAreaYDilation,
                mouseAreaXDilation: options.orientation === 'horizontal' ? options.spacing / 2 : options.mouseAreaXDilation,
                mouseAreaYDilation: options.orientation === 'vertical' ? options.spacing / 2 : options.mouseAreaYDilation
            }, options.radioButtonOptions, item.options);
            const radioButton = new RectangularRadioButton(property, item.value, radioButtonOptions);
            radioButtonMap.set(item.value, radioButton);
            // pdom - so the browser recognizes these buttons are in the same group. See instanceCount for more info.
            radioButton.setPDOMAttribute('name', CLASS_NAME + instanceCount);
            let button;
            if (item.label) {
                // If a label is provided, the button becomes a FlowBox that manages layout of the button and label.
                const label = item.label;
                const labelOrientation = options.labelAlign === 'bottom' || options.labelAlign === 'top' ? 'vertical' : 'horizontal';
                const labelChildren = options.labelAlign === 'left' || options.labelAlign === 'top' ? [
                    label,
                    radioButton
                ] : [
                    radioButton,
                    label
                ];
                button = new FlowBox({
                    children: labelChildren,
                    spacing: options.labelSpacing,
                    orientation: labelOrientation
                });
                // Make sure the label pointer areas don't block the expanded button pointer areas.
                label.pickable = false;
                // Use the same content appearance strategy for the labels that is used for the button content.
                // By default, this reduces opacity of the labels for the deselected radio buttons.
                if (options.radioButtonOptions.contentAppearanceStrategy) {
                    labelAppearanceStrategies.push(new options.radioButtonOptions.contentAppearanceStrategy(label, radioButton.interactionStateProperty, options.radioButtonOptions.contentAppearanceStrategyOptions));
                }
            } else {
                // The button has no label.
                button = radioButton;
            }
            buttons.push(button);
            // pdom - If the radio button was not assigned an accessibleName, search for a default one
            // in the button. It may come from the button content or its label.
            if (!radioButton.accessibleName) {
                radioButton.accessibleName = PDOMUtils.findStringProperty(button);
            }
            // The highlight for the radio button should surround the layout Node if one is used.
            const focusHighlight = new HighlightFromNode(button);
            buttonsWithLayoutNodes.push({
                radioButton: radioButton,
                layoutNode: button,
                focusHighlight: focusHighlight
            });
            radioButton.focusHighlight = focusHighlight;
        }
        options.children = buttons;
        super(options);
        this.radioButtonMap = radioButtonMap;
        // pdom - This node's primary sibling is aria-labelledby its own label, so the label content is read whenever
        // a member of the group receives focus.
        this.addAriaLabelledbyAssociation({
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherNode: this,
            otherElementName: PDOMPeer.LABEL_SIBLING
        });
        // pan and zoom - Signify that key input is reserved, and we should not pan when user presses arrow keys.
        const intentListener = {
            keydown: (event)=>event.pointer.reserveForKeyboardDrag()
        };
        this.addInputListener(intentListener);
        // must be done after this instance is instrumented
        this.addLinkedElement(property, {
            tandemName: 'property'
        });
        this.disposeRadioButtonGroup = ()=>{
            this.removeInputListener(intentListener);
            buttonsWithLayoutNodes.forEach((buttonWithLayoutNode)=>{
                buttonWithLayoutNode.focusHighlight.dispose();
                buttonWithLayoutNode.radioButton.dispose();
                // A layout Node was created for this button, so it should be disposed.
                if (buttonWithLayoutNode.radioButton !== buttonWithLayoutNode.layoutNode) {
                    buttonWithLayoutNode.layoutNode.dispose();
                }
            });
            labelAppearanceStrategies.forEach((strategy)=>strategy.dispose && strategy.dispose());
            nodes.forEach((node)=>node.dispose());
        };
        // pdom - register component for binder docs
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'RectangularRadioButtonGroup', this);
    }
};
export { RectangularRadioButtonGroup as default };
sun.register('RectangularRadioButtonGroup', RectangularRadioButtonGroup);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgaXMgYSBncm91cCBvZiByZWN0YW5ndWxhciByYWRpbyBidXR0b25zLCBpbiBlaXRoZXIgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCBvcmllbnRhdGlvbi5cbiAqIFNlZSBzdW4uQnV0dG9uc1NjcmVlblZpZXcgZm9yIGV4YW1wbGUgdXNhZ2UuXG4gKlxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFBoZXRpb1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUGhldGlvUHJvcGVydHkuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgQ29sb3IsIEZsb3dCb3gsIEZsb3dCb3hPcHRpb25zLCBIaWdobGlnaHRGcm9tTm9kZSwgTm9kZSwgUGFyYWxsZWxET00sIFBhcmFsbGVsRE9NT3B0aW9ucywgUERPTVBlZXIsIFBET01VdGlscywgU2NlbmVyeUNvbnN0YW50cywgVElucHV0TGlzdGVuZXIsIFRyaW1QYXJhbGxlbERPTU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG11bHRpU2VsZWN0aW9uU291bmRQbGF5ZXJGYWN0b3J5IGZyb20gJy4uLy4uLy4uL3RhbWJvL2pzL211bHRpU2VsZWN0aW9uU291bmRQbGF5ZXJGYWN0b3J5LmpzJztcbmltcG9ydCBUU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvVFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQ29sb3JDb25zdGFudHMgZnJvbSAnLi4vQ29sb3JDb25zdGFudHMuanMnO1xuaW1wb3J0IEdyb3VwSXRlbU9wdGlvbnMsIHsgZ2V0R3JvdXBJdGVtTm9kZXMgfSBmcm9tICcuLi9Hcm91cEl0ZW1PcHRpb25zLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uLCB7IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25PcHRpb25zIH0gZnJvbSAnLi9SZWN0YW5ndWxhclJhZGlvQnV0dG9uLmpzJztcbmltcG9ydCBUQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneSBmcm9tICcuL1RDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5LmpzJztcblxuLy8gcGRvbSAtIFVuaXF1ZSBJRCBmb3IgZWFjaCBpbnN0YW5jZSBvZiBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuIFVzZWQgdG8gY3JlYXRlIHRoZSAnbmFtZScgb3B0aW9uIHRoYXQgaXMgcGFzc2VkXG4vLyB0byBlYWNoIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gaW4gdGhlIGdyb3VwLiBBbGwgYnV0dG9ucyBpbiB0aGUgZ3JvdXAgbXVzdCBoYXZlIHRoZSBzYW1lICduYW1lJywgYW5kIHRoYXQgbmFtZVxuLy8gbXVzdCBiZSB1bmlxdWUgdG8gdGhlIGdyb3VwLiBPdGhlcndpc2UsIHRoZSBicm93c2VyIHdpbGwgdHJlYXQgYWxsIGlucHV0cyBvZiB0eXBlICdyYWRpbycgaW4gdGhlIGRvY3VtZW50IGFzIGJlaW5nXG4vLyBpbiBhIHNpbmdsZSBncm91cC5cbmxldCBpbnN0YW5jZUNvdW50ID0gMDtcblxuLy8gUHJlZml4IGZvciBpbnN0YW5jZUNvdW50LCBiZWNhdXNlIFBoRVQgc2ltcyBoYXZlIGRpZmZlcmVudCB0eXBlcyBvZiBcImdyb3Vwc1wiXG5jb25zdCBDTEFTU19OQU1FID0gJ1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCc7XG5cbi8vIERlc2NyaWJlcyBvbmUgcmFkaW8gYnV0dG9uXG5leHBvcnQgdHlwZSBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBJdGVtPFQ+ID0ge1xuICB2YWx1ZTogVDsgLy8gdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBidXR0b25cbiAgbGFiZWw/OiBOb2RlOyAvLyBvcHRpb25hbCBsYWJlbCB0aGF0IGFwcGVhcnMgb3V0c2lkZSB0aGUgYnV0dG9uXG4gIHBoZXRpb0RvY3VtZW50YXRpb24/OiBzdHJpbmc7IC8vIG9wdGlvbmFsIGRvY3VtZW50YXRpb24gZm9yIFBoRVQtaU9cbiAgb3B0aW9ucz86IFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJSYWRpb0J1dHRvbk9wdGlvbnMsICd0YW5kZW0nPjsgLy8gb3B0aW9ucyBwYXNzZWQgdG8gUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiBjb25zdHJ1Y3RvclxufSAmIEdyb3VwSXRlbU9wdGlvbnM7XG5cbi8qKlxuICogSWRlbnRpZmllcyBhIHJhZGlvIGJ1dHRvbiBhbmQgaXRzIGxheW91dCBtYW5hZ2VyLiBQb2ludGVyIGFyZWFzIGFuZCBmb2N1cyBoaWdobGlnaHQgbmVlZCB0byBiZSBzZXQgb25cbiAqIHRoZSBidXR0b24sIGJ1dCBuZWVkIHRvIHN1cnJvdW5kIHRoZSBsYXlvdXQgbWFuYWdlciBjb250YWluaW5nIGJvdGggdGhlIGJ1dHRvbiBhbmQgaXRzIG9wdGlvbmFsIGxhYmVsLlxuICogVGhpcyB3YXMgZm9ybWVybHkgYSBjbGFzcywgY29udmVydGVkIHRvIGEgdHlwZSB3aGVuIFBoRVQgbW92ZWQgdG8gVHlwZVNjcmlwdC5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy83MDhcbiAqL1xudHlwZSBCdXR0b25XaXRoTGF5b3V0Tm9kZTxUPiA9IHtcbiAgcmFkaW9CdXR0b246IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b248VD47XG4gIHJlYWRvbmx5IGZvY3VzSGlnaGxpZ2h0OiBIaWdobGlnaHRGcm9tTm9kZTtcbiAgcmVhZG9ubHkgbGF5b3V0Tm9kZTogTm9kZTtcbn07XG5cbi8vIFdoZXJlIHRoZSBvcHRpb25hbCBsYWJlbCBhcHBlYXJzLCByZWxhdGl2ZSB0byB0aGUgcmFkaW8gYnV0dG9uXG5leHBvcnQgdHlwZSBSZWN0YW5ndWxhclJhZGlvQnV0dG9uTGFiZWxBbGlnbiA9ICd0b3AnIHwgJ2JvdHRvbScgfCAnbGVmdCcgfCAncmlnaHQnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIFNvdW5kIGdlbmVyYXRpb24gZm9yIHRoZSByYWRpbyBidXR0b25zLlxuICAvLyBudWxsIG1lYW5zIHRvIHVzZSB0aGUgZGVmYXVsdHMuIE90aGVyd2lzZSwgdGhlcmUgbXVzdCBiZSBvbmUgZm9yIGVhY2ggYnV0dG9uLlxuICBzb3VuZFBsYXllcnM/OiBUU291bmRQbGF5ZXJbXSB8IG51bGw7XG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGVyZSB0aGUgb3B0aW9uYWwgbGFiZWwgYXBwZWFycywgcmVsYXRpdmUgdG8gdGhlIGJ1dHRvblxuICBsYWJlbEFsaWduPzogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkxhYmVsQWxpZ247XG5cbiAgLy8gU3BhY2luZyBiZXR3ZWVuIHRoZSBvcHRpb25hbCBsYWJlbCBhbmQgdGhlIGJ1dHRvblxuICBsYWJlbFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gQXBwbGllZCB0byBlYWNoIGJ1dHRvbiwgb3IgZWFjaCBidXR0b24gKyBvcHRpb25hbCBsYWJlbC5cbiAgLy8gVGhpcyBpcyBub3QgaGFuZGxlZCB2aWEgcmFkaW9CdXR0b25PcHRpb25zIGJlY2F1c2Ugd2UgbWF5IGhhdmUgYW4gb3B0aW9uYWwgbGFiZWwgaW4gYWRkaXRpb24gdG8gdGhlIGJ1dHRvbi5cbiAgdG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICB0b3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIG1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgbW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIHJhZGlvQnV0dG9uT3B0aW9ucz86IFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJSYWRpb0J1dHRvbk9wdGlvbnMsXG4gICAgJ3NvdW5kUGxheWVyJyB8ICAgICAgICAvLyB1c2UgU2VsZk9wdGlvbnMuc291bmRQbGF5ZXJzXG4gICAgJ3RvdWNoQXJlYVhEaWxhdGlvbicgfCAvLyB1c2UgU2VsZk9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uXG4gICAgJ3RvdWNoQXJlYVlEaWxhdGlvbicgfCAvLyB1c2UgU2VsZk9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uXG4gICAgJ21vdXNlQXJlYVhEaWxhdGlvbicgfCAvLyB1c2UgU2VsZk9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uXG4gICAgJ21vdXNlQXJlYVlEaWxhdGlvbicgICAvLyB1c2UgU2VsZk9wdGlvbnMubW91c2VBcmVhWURpbGF0aW9uXG4gID47XG59O1xuXG4vLyBTbyB0aGF0IGl0IGlzIGNsZWFyIHRoYXQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyBvbmx5IHN1cHBvcnRzIGEgaGlnaC1sZXZlbCBQYXJhbGxlbERPTSBvcHRpb25zLlxuLy8gVE9ETzogVGhpcyBQaWNrT3B0aW9uYWwgc2hvdWxkIGJlIHJlbW92ZWQgb25jZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy85MDAgaXMgcmVzb2x2ZWQuIGxhYmVsVGFnTmFtZSBpcyByZXF1aXJlZCBiZWNhdXNlIGNsaWVudHMgbmVlZCB0byBwcm92aWRlIGEgaGVhZGluZyBsZXZlbC5cbnR5cGUgVHJpbW1lZFBhcmVudE9wdGlvbnMgPSBUcmltUGFyYWxsZWxET01PcHRpb25zPEZsb3dCb3hPcHRpb25zPiAmIFBpY2tPcHRpb25hbDxQYXJhbGxlbERPTU9wdGlvbnMsICdsYWJlbFRhZ05hbWUnPjtcblxuZXhwb3J0IHR5cGUgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxUcmltbWVkUGFyZW50T3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cDxUPiBleHRlbmRzIEZsb3dCb3gge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVJhZGlvQnV0dG9uR3JvdXA6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmFkaW9CdXR0b25NYXA6IE1hcDxULCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uPFQ+PjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBQaGV0aW9Qcm9wZXJ0eTxUPixcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtczogUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwSXRlbTxUPltdLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLnVuaXFCeSggaXRlbXMsIGl0ZW0gPT4gaXRlbS52YWx1ZSApLmxlbmd0aCA9PT0gaXRlbXMubGVuZ3RoLFxuICAgICAgJ2l0ZW1zIG11c3QgaGF2ZSB1bmlxdWUgdmFsdWVzJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZmluZCggaXRlbXMsIGl0ZW0gPT4gKCBpdGVtLnZhbHVlID09PSBwcm9wZXJ0eS52YWx1ZSApICksXG4gICAgICAnb25lIHJhZGlvIGJ1dHRvbiBtdXN0IGJlIGFzc29jaWF0ZWQgd2l0aCBwcm9wZXJ0eS52YWx1ZScgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucywgU2VsZk9wdGlvbnMsIEZsb3dCb3hPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBzb3VuZFBsYXllcnM6IG51bGwsXG4gICAgICBsYWJlbEFsaWduOiAnYm90dG9tJyxcbiAgICAgIGxhYmVsU3BhY2luZzogMCxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xuICAgICAgICBiYXNlQ29sb3I6IENvbG9yQ29uc3RhbnRzLkxJR0hUX0JMVUUsXG4gICAgICAgIGNvcm5lclJhZGl1czogNCxcbiAgICAgICAgeE1hcmdpbjogNSxcbiAgICAgICAgeU1hcmdpbjogNSxcbiAgICAgICAgeEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgeUFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xuICAgICAgICAgIHNlbGVjdGVkU3Ryb2tlOiAnYmxhY2snLFxuICAgICAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiAxLjUsXG4gICAgICAgICAgc2VsZWN0ZWRCdXR0b25PcGFjaXR5OiAxLFxuICAgICAgICAgIGRlc2VsZWN0ZWRTdHJva2U6IG5ldyBDb2xvciggNTAsIDUwLCA1MCApLFxuICAgICAgICAgIGRlc2VsZWN0ZWRMaW5lV2lkdGg6IDEsXG4gICAgICAgICAgZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk6IDAuNixcbiAgICAgICAgICBvdmVyQnV0dG9uT3BhY2l0eTogMC44XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k6IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24uQ29udGVudEFwcGVhcmFuY2VTdHJhdGVneSxcbiAgICAgICAgY29udGVudEFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnM6IHtcbiAgICAgICAgICBvdmVyQ29udGVudE9wYWNpdHk6IDAuOCxcbiAgICAgICAgICBzZWxlY3RlZENvbnRlbnRPcGFjaXR5OiAxLFxuICAgICAgICAgIGRlc2VsZWN0ZWRDb250ZW50T3BhY2l0eTogMC42XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIEZsb3dCb3hPcHRpb25zXG4gICAgICBzcGFjaW5nOiAxMCxcbiAgICAgIHN0cmV0Y2g6IHRydWUsIC8vIGhhdmUgdGhlIGJ1dHRvbnMgbWF0Y2ggc2l6ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg1MVxuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnQnV0dG9uR3JvdXAnLFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLCAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIHRhZ05hbWU6ICd1bCcsXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMycsXG4gICAgICBhcmlhUm9sZTogJ3JhZGlvZ3JvdXAnLFxuICAgICAgaGVscFRleHRCZWhhdmlvcjogUGFyYWxsZWxET00uSEVMUF9URVhUX0JFRk9SRV9DT05URU5ULFxuICAgICAgZ3JvdXBGb2N1c0hpZ2hsaWdodDogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zb3VuZFBsYXllcnMgPT09IG51bGwgfHwgb3B0aW9ucy5zb3VuZFBsYXllcnMubGVuZ3RoID09PSBpdGVtcy5sZW5ndGgsXG4gICAgICAnSWYgc291bmRQbGF5ZXJzIGlzIHByb3ZpZGVkLCB0aGVyZSBtdXN0IGJlIG9uZSBwZXIgcmFkaW8gYnV0dG9uLicgKTtcblxuICAgIGluc3RhbmNlQ291bnQrKztcblxuICAgIGNvbnN0IHJhZGlvQnV0dG9uTWFwID0gbmV3IE1hcDxULCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uPFQ+PigpO1xuXG4gICAgY29uc3Qgbm9kZXMgPSBnZXRHcm91cEl0ZW1Ob2RlcyggaXRlbXMsIG9wdGlvbnMudGFuZGVtICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggbm9kZXMsIG5vZGUgPT4gIW5vZGUuaGFzUERPTUNvbnRlbnQgKSxcbiAgICAgICdBY2Nlc3NpYmlsaXR5IGlzIHByb3ZpZGVkIGJ5IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b24gYW5kIGFjY2Vzc2libGVOYW1lIGluIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cEl0ZW0gb3B0aW9ucy4gJyArXG4gICAgICAnQWRkaXRpb25hbCBQRE9NIGNvbnRlbnQgaW4gdGhlIHByb3ZpZGVkIE5vZGUgY291bGQgYnJlYWsgYWNjZXNzaWJpbGl0eS4nICk7XG5cbiAgICAvLyBDYWxjdWxhdGUgdGhlIG1heGltdW0gd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgY29udGVudCwgc28gd2UgY2FuIG1ha2UgYWxsIHJhZGlvIGJ1dHRvbnMgdGhlIHNhbWUgc2l6ZS5cbiAgICBjb25zdCB3aWRlc3RDb250ZW50V2lkdGggPSBfLm1heEJ5KCBub2Rlcywgbm9kZSA9PiBub2RlLndpZHRoICkhLndpZHRoO1xuICAgIGNvbnN0IHRhbGxlc3RDb250ZW50SGVpZ2h0ID0gXy5tYXhCeSggbm9kZXMsIG5vZGUgPT4gbm9kZS5oZWlnaHQgKSEuaGVpZ2h0O1xuXG4gICAgLy8gUG9wdWxhdGVkIGZvciBlYWNoIHJhZGlvIGJ1dHRvbiBpbiBmb3IgbG9vcFxuICAgIGNvbnN0IGJ1dHRvbnM6IEFycmF5PFJlY3Rhbmd1bGFyUmFkaW9CdXR0b248VD4gfCBGbG93Qm94PiA9IFtdO1xuICAgIGNvbnN0IGJ1dHRvbnNXaXRoTGF5b3V0Tm9kZXM6IEJ1dHRvbldpdGhMYXlvdXROb2RlPFQ+W10gPSBbXTtcbiAgICBjb25zdCBsYWJlbEFwcGVhcmFuY2VTdHJhdGVnaWVzOiBJbnN0YW5jZVR5cGU8VENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k+W10gPSBbXTtcblxuICAgIGNvbnN0IHhNYXJnaW46IG51bWJlciA9IG9wdGlvbnMucmFkaW9CdXR0b25PcHRpb25zLnhNYXJnaW4hO1xuICAgIGNvbnN0IHlNYXJnaW46IG51bWJlciA9IG9wdGlvbnMucmFkaW9CdXR0b25PcHRpb25zLnlNYXJnaW4hO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBpdGVtID0gaXRlbXNbIGkgXTtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1sgaSBdO1xuXG4gICAgICBjb25zdCByYWRpb0J1dHRvbk9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclJhZGlvQnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgICAgY29udGVudDogbm9kZSxcbiAgICAgICAgbWluV2lkdGg6IHdpZGVzdENvbnRlbnRXaWR0aCArIDIgKiB4TWFyZ2luLFxuICAgICAgICBtaW5IZWlnaHQ6IHRhbGxlc3RDb250ZW50SGVpZ2h0ICsgMiAqIHlNYXJnaW4sXG4gICAgICAgIHNvdW5kUGxheWVyOiBvcHRpb25zLnNvdW5kUGxheWVycyA/IG9wdGlvbnMuc291bmRQbGF5ZXJzWyBpIF0gOlxuICAgICAgICAgICAgICAgICAgICAgbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkuZ2V0U2VsZWN0aW9uU291bmRQbGF5ZXIoIGkgKSxcbiAgICAgICAgdGFuZGVtOiBpdGVtLnRhbmRlbU5hbWUgPyBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGl0ZW0udGFuZGVtTmFtZSApIDpcbiAgICAgICAgICAgICAgICBvcHRpb25zLnRhbmRlbSA9PT0gVGFuZGVtLk9QVF9PVVQgPyBUYW5kZW0uT1BUX09VVCA6XG4gICAgICAgICAgICAgICAgVGFuZGVtLlJFUVVJUkVELFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBpdGVtLnBoZXRpb0RvY3VtZW50YXRpb24gfHwgJycsXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgZG9lcyBOT1Qgc3VwcG9ydCBkeW5hbWljIG9yaWVudGF0aW9uIGNoYW5nZXMuIElmIHlvdSBuZWVkIHRoYXQsIGNoYW5nZSBSZWN0YW5ndWxhckJ1dHRvbiB0b1xuICAgICAgICAvLyBzdXBwb3J0IGR5bmFtaWMgb3B0aW9ucy5cbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBvcHRpb25zLnNwYWNpbmcgLyAyIDogb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyA/IG9wdGlvbnMuc3BhY2luZyAvIDIgOiBvcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbixcbiAgICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBvcHRpb25zLnNwYWNpbmcgLyAyIDogb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sXG4gICAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogb3B0aW9ucy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyA/IG9wdGlvbnMuc3BhY2luZyAvIDIgOiBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvblxuICAgICAgfSwgb3B0aW9ucy5yYWRpb0J1dHRvbk9wdGlvbnMsIGl0ZW0ub3B0aW9ucyApO1xuXG4gICAgICBjb25zdCByYWRpb0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uKCBwcm9wZXJ0eSwgaXRlbS52YWx1ZSwgcmFkaW9CdXR0b25PcHRpb25zICk7XG5cbiAgICAgIHJhZGlvQnV0dG9uTWFwLnNldCggaXRlbS52YWx1ZSwgcmFkaW9CdXR0b24gKTtcblxuICAgICAgLy8gcGRvbSAtIHNvIHRoZSBicm93c2VyIHJlY29nbml6ZXMgdGhlc2UgYnV0dG9ucyBhcmUgaW4gdGhlIHNhbWUgZ3JvdXAuIFNlZSBpbnN0YW5jZUNvdW50IGZvciBtb3JlIGluZm8uXG4gICAgICByYWRpb0J1dHRvbi5zZXRQRE9NQXR0cmlidXRlKCAnbmFtZScsIENMQVNTX05BTUUgKyBpbnN0YW5jZUNvdW50ICk7XG5cbiAgICAgIGxldCBidXR0b247XG4gICAgICBpZiAoIGl0ZW0ubGFiZWwgKSB7XG5cbiAgICAgICAgLy8gSWYgYSBsYWJlbCBpcyBwcm92aWRlZCwgdGhlIGJ1dHRvbiBiZWNvbWVzIGEgRmxvd0JveCB0aGF0IG1hbmFnZXMgbGF5b3V0IG9mIHRoZSBidXR0b24gYW5kIGxhYmVsLlxuICAgICAgICBjb25zdCBsYWJlbCA9IGl0ZW0ubGFiZWw7XG4gICAgICAgIGNvbnN0IGxhYmVsT3JpZW50YXRpb24gPSAoIG9wdGlvbnMubGFiZWxBbGlnbiA9PT0gJ2JvdHRvbScgfHwgb3B0aW9ucy5sYWJlbEFsaWduID09PSAndG9wJyApID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJztcbiAgICAgICAgY29uc3QgbGFiZWxDaGlsZHJlbiA9ICggb3B0aW9ucy5sYWJlbEFsaWduID09PSAnbGVmdCcgfHwgb3B0aW9ucy5sYWJlbEFsaWduID09PSAndG9wJyApID8gWyBsYWJlbCwgcmFkaW9CdXR0b24gXSA6IFsgcmFkaW9CdXR0b24sIGxhYmVsIF07XG4gICAgICAgIGJ1dHRvbiA9IG5ldyBGbG93Qm94KCB7XG4gICAgICAgICAgY2hpbGRyZW46IGxhYmVsQ2hpbGRyZW4sXG4gICAgICAgICAgc3BhY2luZzogb3B0aW9ucy5sYWJlbFNwYWNpbmcsXG4gICAgICAgICAgb3JpZW50YXRpb246IGxhYmVsT3JpZW50YXRpb25cbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgbGFiZWwgcG9pbnRlciBhcmVhcyBkb24ndCBibG9jayB0aGUgZXhwYW5kZWQgYnV0dG9uIHBvaW50ZXIgYXJlYXMuXG4gICAgICAgIGxhYmVsLnBpY2thYmxlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gVXNlIHRoZSBzYW1lIGNvbnRlbnQgYXBwZWFyYW5jZSBzdHJhdGVneSBmb3IgdGhlIGxhYmVscyB0aGF0IGlzIHVzZWQgZm9yIHRoZSBidXR0b24gY29udGVudC5cbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgdGhpcyByZWR1Y2VzIG9wYWNpdHkgb2YgdGhlIGxhYmVscyBmb3IgdGhlIGRlc2VsZWN0ZWQgcmFkaW8gYnV0dG9ucy5cbiAgICAgICAgaWYgKCBvcHRpb25zLnJhZGlvQnV0dG9uT3B0aW9ucy5jb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5ICkge1xuICAgICAgICAgIGxhYmVsQXBwZWFyYW5jZVN0cmF0ZWdpZXMucHVzaCggbmV3IG9wdGlvbnMucmFkaW9CdXR0b25PcHRpb25zLmNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3koXG4gICAgICAgICAgICBsYWJlbCxcbiAgICAgICAgICAgIHJhZGlvQnV0dG9uLmludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSxcbiAgICAgICAgICAgIG9wdGlvbnMucmFkaW9CdXR0b25PcHRpb25zLmNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zXG4gICAgICAgICAgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBUaGUgYnV0dG9uIGhhcyBubyBsYWJlbC5cbiAgICAgICAgYnV0dG9uID0gcmFkaW9CdXR0b247XG4gICAgICB9XG4gICAgICBidXR0b25zLnB1c2goIGJ1dHRvbiApO1xuXG4gICAgICAvLyBwZG9tIC0gSWYgdGhlIHJhZGlvIGJ1dHRvbiB3YXMgbm90IGFzc2lnbmVkIGFuIGFjY2Vzc2libGVOYW1lLCBzZWFyY2ggZm9yIGEgZGVmYXVsdCBvbmVcbiAgICAgIC8vIGluIHRoZSBidXR0b24uIEl0IG1heSBjb21lIGZyb20gdGhlIGJ1dHRvbiBjb250ZW50IG9yIGl0cyBsYWJlbC5cbiAgICAgIGlmICggIXJhZGlvQnV0dG9uLmFjY2Vzc2libGVOYW1lICkge1xuICAgICAgICByYWRpb0J1dHRvbi5hY2Nlc3NpYmxlTmFtZSA9IFBET01VdGlscy5maW5kU3RyaW5nUHJvcGVydHkoIGJ1dHRvbiApO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgaGlnaGxpZ2h0IGZvciB0aGUgcmFkaW8gYnV0dG9uIHNob3VsZCBzdXJyb3VuZCB0aGUgbGF5b3V0IE5vZGUgaWYgb25lIGlzIHVzZWQuXG4gICAgICBjb25zdCBmb2N1c0hpZ2hsaWdodCA9IG5ldyBIaWdobGlnaHRGcm9tTm9kZSggYnV0dG9uICk7XG4gICAgICBidXR0b25zV2l0aExheW91dE5vZGVzLnB1c2goIHsgcmFkaW9CdXR0b246IHJhZGlvQnV0dG9uLCBsYXlvdXROb2RlOiBidXR0b24sIGZvY3VzSGlnaGxpZ2h0OiBmb2N1c0hpZ2hsaWdodCB9ICk7XG4gICAgICByYWRpb0J1dHRvbi5mb2N1c0hpZ2hsaWdodCA9IGZvY3VzSGlnaGxpZ2h0O1xuICAgIH1cblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBidXR0b25zO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMucmFkaW9CdXR0b25NYXAgPSByYWRpb0J1dHRvbk1hcDtcblxuICAgIC8vIHBkb20gLSBUaGlzIG5vZGUncyBwcmltYXJ5IHNpYmxpbmcgaXMgYXJpYS1sYWJlbGxlZGJ5IGl0cyBvd24gbGFiZWwsIHNvIHRoZSBsYWJlbCBjb250ZW50IGlzIHJlYWQgd2hlbmV2ZXJcbiAgICAvLyBhIG1lbWJlciBvZiB0aGUgZ3JvdXAgcmVjZWl2ZXMgZm9jdXMuXG4gICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCB7XG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICAgIG90aGVyTm9kZTogdGhpcyxcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcbiAgICB9ICk7XG5cbiAgICAvLyBwYW4gYW5kIHpvb20gLSBTaWduaWZ5IHRoYXQga2V5IGlucHV0IGlzIHJlc2VydmVkLCBhbmQgd2Ugc2hvdWxkIG5vdCBwYW4gd2hlbiB1c2VyIHByZXNzZXMgYXJyb3cga2V5cy5cbiAgICBjb25zdCBpbnRlbnRMaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgPSB7IGtleWRvd246IGV2ZW50ID0+IGV2ZW50LnBvaW50ZXIucmVzZXJ2ZUZvcktleWJvYXJkRHJhZygpIH07XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBpbnRlbnRMaXN0ZW5lciApO1xuXG4gICAgLy8gbXVzdCBiZSBkb25lIGFmdGVyIHRoaXMgaW5zdGFuY2UgaXMgaW5zdHJ1bWVudGVkXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBwcm9wZXJ0eSwge1xuICAgICAgdGFuZGVtTmFtZTogJ3Byb3BlcnR5J1xuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZVJhZGlvQnV0dG9uR3JvdXAgPSAoKSA9PiB7XG4gICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIGludGVudExpc3RlbmVyICk7XG5cbiAgICAgIGJ1dHRvbnNXaXRoTGF5b3V0Tm9kZXMuZm9yRWFjaCggYnV0dG9uV2l0aExheW91dE5vZGUgPT4ge1xuICAgICAgICBidXR0b25XaXRoTGF5b3V0Tm9kZS5mb2N1c0hpZ2hsaWdodC5kaXNwb3NlKCk7XG4gICAgICAgIGJ1dHRvbldpdGhMYXlvdXROb2RlLnJhZGlvQnV0dG9uLmRpc3Bvc2UoKTtcblxuICAgICAgICAvLyBBIGxheW91dCBOb2RlIHdhcyBjcmVhdGVkIGZvciB0aGlzIGJ1dHRvbiwgc28gaXQgc2hvdWxkIGJlIGRpc3Bvc2VkLlxuICAgICAgICBpZiAoIGJ1dHRvbldpdGhMYXlvdXROb2RlLnJhZGlvQnV0dG9uICE9PSBidXR0b25XaXRoTGF5b3V0Tm9kZS5sYXlvdXROb2RlICkge1xuICAgICAgICAgIGJ1dHRvbldpdGhMYXlvdXROb2RlLmxheW91dE5vZGUuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIGxhYmVsQXBwZWFyYW5jZVN0cmF0ZWdpZXMuZm9yRWFjaCggc3RyYXRlZ3kgPT4gKCBzdHJhdGVneS5kaXNwb3NlICYmIHN0cmF0ZWd5LmRpc3Bvc2UoKSApICk7XG4gICAgICBub2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGUuZGlzcG9zZSgpICk7XG4gICAgfTtcblxuICAgIC8vIHBkb20gLSByZWdpc3RlciBjb21wb25lbnQgZm9yIGJpbmRlciBkb2NzXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAnLCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiBjb3JyZXNwb25kaW5nIHRvIGEgdmFsdWUuIE5vdGUgdGhhdCBpbiB0aGUgc2NlbmUgZ3JhcGgsIHRoZSBidXR0b24gbWF5IGJlIG5lc3RlZFxuICAgKiB1bmRlciBvdGhlciBsYXllcnMsIHNvIHVzZSBjYXV0aW9uIGZvciBjb29yZGluYXRlIHRyYW5zZm9ybWF0aW9ucy5cbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIGJ1dHRvblxuICAgKi9cbiAgcHVibGljIGdldEJ1dHRvbkZvclZhbHVlKCB2YWx1ZTogVCApOiBSZWN0YW5ndWxhclJhZGlvQnV0dG9uPFQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJhZGlvQnV0dG9uTWFwLmdldCggdmFsdWUgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0LCAnTm8gYnV0dG9uIGZvdW5kIGZvciB2YWx1ZTogJyArIHZhbHVlICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMucmFkaW9CdXR0b25NYXAuY2xlYXIoKTtcbiAgICB0aGlzLmRpc3Bvc2VSYWRpb0J1dHRvbkdyb3VwKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCcsIFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCApOyJdLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDb2xvciIsIkZsb3dCb3giLCJIaWdobGlnaHRGcm9tTm9kZSIsIlBhcmFsbGVsRE9NIiwiUERPTVBlZXIiLCJQRE9NVXRpbHMiLCJTY2VuZXJ5Q29uc3RhbnRzIiwibXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkiLCJUYW5kZW0iLCJDb2xvckNvbnN0YW50cyIsImdldEdyb3VwSXRlbU5vZGVzIiwic3VuIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbiIsImluc3RhbmNlQ291bnQiLCJDTEFTU19OQU1FIiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwiZ2V0QnV0dG9uRm9yVmFsdWUiLCJ2YWx1ZSIsInJlc3VsdCIsInJhZGlvQnV0dG9uTWFwIiwiZ2V0IiwiYXNzZXJ0IiwiZGlzcG9zZSIsImNsZWFyIiwiZGlzcG9zZVJhZGlvQnV0dG9uR3JvdXAiLCJwcm9wZXJ0eSIsIml0ZW1zIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93IiwiXyIsInVuaXFCeSIsIml0ZW0iLCJsZW5ndGgiLCJmaW5kIiwib3B0aW9ucyIsInNvdW5kUGxheWVycyIsImxhYmVsQWxpZ24iLCJsYWJlbFNwYWNpbmciLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJMSUdIVF9CTFVFIiwiY29ybmVyUmFkaXVzIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ4QWxpZ24iLCJ5QWxpZ24iLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIiwic2VsZWN0ZWRTdHJva2UiLCJzZWxlY3RlZExpbmVXaWR0aCIsInNlbGVjdGVkQnV0dG9uT3BhY2l0eSIsImRlc2VsZWN0ZWRTdHJva2UiLCJkZXNlbGVjdGVkTGluZVdpZHRoIiwiZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHkiLCJvdmVyQnV0dG9uT3BhY2l0eSIsImNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5IiwiY29udGVudEFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJvdmVyQ29udGVudE9wYWNpdHkiLCJzZWxlY3RlZENvbnRlbnRPcGFjaXR5IiwiZGVzZWxlY3RlZENvbnRlbnRPcGFjaXR5Iiwic3BhY2luZyIsInN0cmV0Y2giLCJvcmllbnRhdGlvbiIsImRpc2FibGVkT3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwiYXJpYVJvbGUiLCJoZWxwVGV4dEJlaGF2aW9yIiwiSEVMUF9URVhUX0JFRk9SRV9DT05URU5UIiwiZ3JvdXBGb2N1c0hpZ2hsaWdodCIsIk1hcCIsIm5vZGVzIiwiZXZlcnkiLCJub2RlIiwiaGFzUERPTUNvbnRlbnQiLCJ3aWRlc3RDb250ZW50V2lkdGgiLCJtYXhCeSIsIndpZHRoIiwidGFsbGVzdENvbnRlbnRIZWlnaHQiLCJoZWlnaHQiLCJidXR0b25zIiwiYnV0dG9uc1dpdGhMYXlvdXROb2RlcyIsImxhYmVsQXBwZWFyYW5jZVN0cmF0ZWdpZXMiLCJpIiwiY29udGVudCIsIm1pbldpZHRoIiwibWluSGVpZ2h0Iiwic291bmRQbGF5ZXIiLCJnZXRTZWxlY3Rpb25Tb3VuZFBsYXllciIsInRhbmRlbU5hbWUiLCJjcmVhdGVUYW5kZW0iLCJPUFRfT1VUIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInJhZGlvQnV0dG9uIiwic2V0Iiwic2V0UERPTUF0dHJpYnV0ZSIsImJ1dHRvbiIsImxhYmVsIiwibGFiZWxPcmllbnRhdGlvbiIsImxhYmVsQ2hpbGRyZW4iLCJjaGlsZHJlbiIsInBpY2thYmxlIiwicHVzaCIsImludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSIsImFjY2Vzc2libGVOYW1lIiwiZmluZFN0cmluZ1Byb3BlcnR5IiwiZm9jdXNIaWdobGlnaHQiLCJsYXlvdXROb2RlIiwiYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyTm9kZSIsIm90aGVyRWxlbWVudE5hbWUiLCJMQUJFTF9TSUJMSU5HIiwiaW50ZW50TGlzdGVuZXIiLCJrZXlkb3duIiwiZXZlbnQiLCJwb2ludGVyIiwicmVzZXJ2ZUZvcktleWJvYXJkRHJhZyIsImFkZElucHV0TGlzdGVuZXIiLCJhZGRMaW5rZWRFbGVtZW50IiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImZvckVhY2giLCJidXR0b25XaXRoTGF5b3V0Tm9kZSIsInN0cmF0ZWd5IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUdELE9BQU9BLHNCQUFzQiwwREFBMEQ7QUFDdkYsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLHFDQUFxQztBQUcvRSxTQUFTQyxLQUFLLEVBQUVDLE9BQU8sRUFBa0JDLGlCQUFpQixFQUFRQyxXQUFXLEVBQXNCQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsZ0JBQWdCLFFBQWdELGlDQUFpQztBQUN6TixPQUFPQyxzQ0FBc0Msd0RBQXdEO0FBRXJHLE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLG9CQUFvQix1QkFBdUI7QUFDbEQsU0FBMkJDLGlCQUFpQixRQUFRLHlCQUF5QjtBQUM3RSxPQUFPQyxTQUFTLFlBQVk7QUFDNUIsT0FBT0MsNEJBQStELDhCQUE4QjtBQUdwRyxxSEFBcUg7QUFDckgsaUhBQWlIO0FBQ2pILHFIQUFxSDtBQUNySCxxQkFBcUI7QUFDckIsSUFBSUMsZ0JBQWdCO0FBRXBCLCtFQUErRTtBQUMvRSxNQUFNQyxhQUFhO0FBMkRKLElBQUEsQUFBTUMsOEJBQU4sTUFBTUEsb0NBQXVDZDtJQW1OMUQ7Ozs7O0dBS0MsR0FDRCxBQUFPZSxrQkFBbUJDLEtBQVEsRUFBOEI7UUFDOUQsTUFBTUMsU0FBUyxJQUFJLENBQUNDLGNBQWMsQ0FBQ0MsR0FBRyxDQUFFSDtRQUN4Q0ksVUFBVUEsT0FBUUgsUUFBUSxnQ0FBZ0NEO1FBQzFELE9BQU9DO0lBQ1Q7SUFFZ0JJLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0gsY0FBYyxDQUFDSSxLQUFLO1FBQ3pCLElBQUksQ0FBQ0MsdUJBQXVCO1FB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