// Copyright 2013-2024, University of Colorado Boulder
/**
 * Scenery-based combo box. Composed of a button and a popup 'list box' of items. ComboBox has no interaction of its
 * own, all interaction is handled by its subcomponents. The list box is displayed when the button is pressed, and
 * dismissed when an item is selected, the user clicks on the button, or the user clicks outside the list. The list
 * can be displayed either above or below the button.
 *
 * The supporting types and classes are:
 *
 * ComboBoxItem - items provided to ComboBox constructor
 * ComboBoxButton - the button
 * ComboBoxListBox - the list box
 * ComboBoxListItemNode - an item in the list box
 *
 * For info on ComboBox UI design, including a11y, see https://github.com/phetsims/sun/blob/main/doc/ComboBox.md
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import dotRandom from '../../dot/js/dotRandom.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { extendsWidthSizable, FocusManager, isWidthSizable, MatrixBetweenProperty, Node, PDOMPeer, PDOMUtils, WidthSizable } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ComboBoxButton from './ComboBoxButton.js';
import ComboBoxListBox from './ComboBoxListBox.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
// const
const LIST_POSITION_VALUES = [
    'above',
    'below'
]; // where the list pops up relative to the button
const ALIGN_VALUES = [
    'left',
    'right',
    'center'
]; // alignment of item on button and in list
// Tandem names for ComboBoxItem must have this suffix.
const ITEM_TANDEM_NAME_SUFFIX = 'Item';
// The definition for how ComboBox sets its accessibleName and helpText in the PDOM. Forward it onto its button. See
// ComboBox.md for further style guide and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR = (node, options, accessibleName, otherNodeCallbacks)=>{
    otherNodeCallbacks.push(()=>{
        node.button.accessibleName = accessibleName;
    });
    return options;
};
const HELP_TEXT_BEHAVIOR = (node, options, helpText, otherNodeCallbacks)=>{
    otherNodeCallbacks.push(()=>{
        node.button.helpText = helpText;
    });
    return options;
};
let ComboBox = class ComboBox extends WidthSizable(Node) {
    dispose() {
        this.disposeComboBox();
        super.dispose();
    }
    /**
   * Shows the list box.
   */ showListBox() {
        this.listBox.visibleProperty.value = true;
    }
    /**
   * Hides the list box.
   */ hideListBox() {
        this.listBox.visibleProperty.value = false;
    }
    /**
   * Because the button and list box have different parents (and therefore different coordinate frames)
   * they may be scaled differently. This method scales the list box so that items on the button and in
   * the list appear to be the same size.
   */ scaleListBox() {
        // To support an empty list box due to PhET-iO customization, see https://github.com/phetsims/sun/issues/606
        if (!this.listBox.localBounds.isEmpty()) {
            const buttonScale = this.button.localToGlobalBounds(this.button.localBounds).width / this.button.localBounds.width;
            const listBoxScale = this.listBox.localToGlobalBounds(this.listBox.localBounds).width / this.listBox.localBounds.width;
            this.listBox.scale(buttonScale / listBoxScale);
        }
    }
    scaleAndPositionListBox(listBoxMatrix) {
        if (listBoxMatrix) {
            // Scale the box before positioning.
            this.scaleListBox();
            if (this.listPosition === 'above') {
                this.listBox.leftBottom = listBoxMatrix.timesVector2(this.button.leftTop);
            } else {
                this.listBox.leftTop = listBoxMatrix.timesVector2(this.button.leftBottom);
            }
        }
    }
    /**
   * Sets the visibility of items that correspond to a value. If the selected item has this value, it's your
   * responsibility to change the Property value to something else. Otherwise, the combo box button will continue
   * to display this value.
   * @param value - the value associated with the ComboBoxItem
   * @param visible
   */ setItemVisible(value, visible) {
        this.listBox.setItemVisible(value, visible);
    }
    /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param value - the value associated with the ComboBoxItem
   */ isItemVisible(value) {
        return this.listBox.isItemVisible(value);
    }
    static getMaxItemWidthProperty(nodes) {
        const widthProperties = _.flatten(nodes.map((node)=>{
            const properties = [
                node.boundsProperty
            ];
            if (extendsWidthSizable(node)) {
                properties.push(node.isWidthResizableProperty);
                properties.push(node.minimumWidthProperty);
            }
            return properties;
        }));
        return DerivedProperty.deriveAny(widthProperties, ()=>{
            return Math.max(...nodes.map((node)=>isWidthSizable(node) ? node.minimumWidth || 0 : node.width));
        });
    }
    static getMaxItemHeightProperty(nodes) {
        const heightProperties = nodes.map((node)=>node.boundsProperty);
        return DerivedProperty.deriveAny(heightProperties, ()=>{
            return Math.max(...nodes.map((node)=>node.height));
        });
    }
    /**
   * @param property - must be settable and linkable, but needs to support Property, DerivedProperty and DynamicProperty
   * @param items - items, in the order that they appear in the listbox
   * @param listParent node that will be used as the list's parent, use this to ensure that the list is in front of everything else
   * @param [providedOptions]
   */ constructor(property, items, listParent, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && assert(_.uniqBy(items, (item)=>item.value).length === items.length, 'items must have unique values');
        assert && items.forEach((item)=>{
            assert && assert(!item.tandemName || item.tandemName.endsWith(ITEM_TANDEM_NAME_SUFFIX), `ComboBoxItem tandemName must end with '${ITEM_TANDEM_NAME_SUFFIX}': ${item.tandemName}`);
        });
        // See https://github.com/phetsims/sun/issues/542
        assert && assert(listParent.maxWidth === null, 'ComboBox is responsible for scaling listBox. Setting maxWidth for listParent may result in buggy behavior.');
        const options = optionize()({
            align: 'left',
            listPosition: 'below',
            labelXSpacing: 10,
            disabledOpacity: 0.5,
            cornerRadius: 4,
            highlightFill: 'rgb( 245, 245, 245 )',
            xMargin: 12,
            yMargin: 8,
            // button
            buttonFill: 'white',
            buttonStroke: 'black',
            buttonLineWidth: 1,
            buttonTouchAreaXDilation: 0,
            buttonTouchAreaYDilation: 0,
            buttonMouseAreaXDilation: 0,
            buttonMouseAreaYDilation: 0,
            // list
            listFill: 'white',
            listStroke: 'black',
            listLineWidth: 1,
            openedSoundPlayer: sharedSoundPlayers.get('generalOpen'),
            closedNoChangeSoundPlayer: sharedSoundPlayers.get('generalClose'),
            // pdom
            tagName: 'div',
            buttonLabelTagName: 'p',
            accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR,
            helpTextBehavior: HELP_TEXT_BEHAVIOR,
            comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
            comboBoxVoicingContextResponse: null,
            comboBoxVoicingHintResponse: null,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ComboBox',
            phetioType: ComboBox.ComboBoxIO,
            phetioFeatured: true,
            phetioEventType: EventType.USER,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
        }, providedOptions);
        const nodes = getGroupItemNodes(items, options.tandem.createTandem('items'));
        // pdom - If an item has not been given an accessibleName, try to find a default value from the visual Node.
        // Assigned to the item, because the accessible name is used in the ComboBoxButton and ComboBoxListItemNode.
        items.forEach((item, i)=>{
            if (!item.accessibleName) {
                item.accessibleName = PDOMUtils.findStringProperty(nodes[i]);
            }
        });
        assert && nodes.forEach((node)=>{
            assert && assert(!node.hasPDOMContent, 'Accessibility is provided by ComboBoxItemNode and ' + 'ComboBoxItem.accessibleName. Additional PDOM content in the provided ' + 'Node could break accessibility.');
        });
        // validate option values
        assert && assert(options.xMargin > 0 && options.yMargin > 0, `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}`);
        assert && assert(_.includes(LIST_POSITION_VALUES, options.listPosition), `invalid listPosition: ${options.listPosition}`);
        assert && assert(_.includes(ALIGN_VALUES, options.align), `invalid align: ${options.align}`);
        super();
        this.nodes = nodes;
        this.listPosition = options.listPosition;
        this.button = new ComboBoxButton(property, items, nodes, {
            align: options.align,
            arrowDirection: options.listPosition === 'below' ? 'down' : 'up',
            cornerRadius: options.cornerRadius,
            xMargin: options.xMargin,
            yMargin: options.yMargin,
            baseColor: options.buttonFill,
            stroke: options.buttonStroke,
            lineWidth: options.buttonLineWidth,
            touchAreaXDilation: options.buttonTouchAreaXDilation,
            touchAreaYDilation: options.buttonTouchAreaYDilation,
            mouseAreaXDilation: options.buttonMouseAreaXDilation,
            mouseAreaYDilation: options.buttonMouseAreaYDilation,
            localPreferredWidthProperty: this.localPreferredWidthProperty,
            localMinimumWidthProperty: this.localMinimumWidthProperty,
            comboBoxVoicingNameResponsePattern: options.comboBoxVoicingNameResponsePattern,
            // pdom - accessibleName and helpText are set via behavior functions on the ComboBox
            labelTagName: options.buttonLabelTagName,
            // phet-io
            tandem: options.tandem.createTandem('button')
        });
        this.addChild(this.button);
        this.listBox = new ComboBoxListBox(property, items, nodes, this.hideListBox.bind(this), ()=>{
            this.button.blockNextVoicingFocusListener();
            this.button.focus();
        }, this.button, options.tandem.createTandem('listBox'), {
            align: options.align,
            highlightFill: options.highlightFill,
            xMargin: options.xMargin,
            yMargin: options.yMargin,
            cornerRadius: options.cornerRadius,
            fill: options.listFill,
            stroke: options.listStroke,
            lineWidth: options.listLineWidth,
            visible: false,
            comboBoxListItemNodeOptions: {
                comboBoxVoicingNameResponsePattern: options.comboBoxVoicingNameResponsePattern,
                voicingContextResponse: options.comboBoxVoicingContextResponse,
                voicingHintResponse: options.comboBoxVoicingHintResponse
            },
            // sound generation
            openedSoundPlayer: options.openedSoundPlayer,
            closedNoChangeSoundPlayer: options.closedNoChangeSoundPlayer,
            // pdom
            // the list box is aria-labelledby its own label sibling
            ariaLabelledbyAssociations: [
                {
                    otherNode: this.button,
                    otherElementName: PDOMPeer.LABEL_SIBLING,
                    thisElementName: PDOMPeer.PRIMARY_SIBLING
                }
            ]
        });
        listParent.addChild(this.listBox);
        this.listParent = listParent;
        // We want the drop-down combo list to be just AFTER the main ComboBox content in the PDOM.
        this.pdomOrder = [
            null,
            this.listBox
        ];
        const listBoxMatrixProperty = new MatrixBetweenProperty(this.button, this.listParent, {
            fromCoordinateFrame: 'parent',
            toCoordinateFrame: 'local'
        });
        Multilink.multilink([
            listBoxMatrixProperty,
            this.button.localBoundsProperty,
            this.listBox.localBoundsProperty
        ], (matrix)=>{
            this.scaleAndPositionListBox(matrix);
        });
        // The listBox is not a child Node of ComboBox and, as a result, listen to opacity of the ComboBox and keep
        // the listBox in sync with them. See https://github.com/phetsims/sun/issues/587
        this.opacityProperty.link((opacity)=>{
            this.listBox.opacityProperty.value = opacity;
        });
        this.mutate(options);
        if (assert && Tandem.VALIDATION && this.isPhetioInstrumented()) {
            items.forEach((item)=>{
                assert && assert(item.tandemName !== null, `PhET-iO instrumented ComboBoxes require ComboBoxItems to have tandemName: ${item.value}`);
            });
        }
        // Clicking on the button toggles visibility of the list box
        this.button.addListener(()=>{
            this.listBox.visibleProperty.value = !this.listBox.visibleProperty.value;
            this.listBox.visibleProperty.value && this.listBox.focusListItemNode(property.value);
        });
        this.display = null;
        this.clickToDismissListener = {
            down: (event)=>{
                // If fuzzing is enabled, exercise this listener some percentage of the time, so that this listener is tested.
                // The rest of the time, ignore this listener, so that the listbox remains popped up, and we test making
                // choices from the listbox. See https://github.com/phetsims/sun/issues/677 for the initial implementation,
                // and See https://github.com/phetsims/aqua/issues/136 for the probability value chosen.
                if (!phet.chipper.isFuzzEnabled() || dotRandom.nextDouble() < 0.005) {
                    // Ignore if we click over the button, since the button will handle hiding the list.
                    if (!(event.trail.containsNode(this.button) || event.trail.containsNode(this.listBox))) {
                        this.hideListBox();
                    }
                }
            }
        };
        this.dismissWithFocusListener = (focus)=>{
            if (focus && !focus.trail.containsNode(this.listBox)) {
                this.hideListBox();
            }
        };
        FocusManager.pdomFocusProperty.link(this.dismissWithFocusListener);
        this.listBox.visibleProperty.link((visible)=>{
            if (visible) {
                // show the list box
                this.scaleListBox();
                this.listBox.moveToFront();
                // manage clickToDismissListener
                assert && assert(!this.display, 'unexpected display');
                this.display = this.getUniqueTrail().rootNode().getRootedDisplays()[0];
                this.display.addInputListener(this.clickToDismissListener);
            } else {
                // manage clickToDismissListener
                if (this.display && this.display.hasInputListener(this.clickToDismissListener)) {
                    this.display.removeInputListener(this.clickToDismissListener);
                    this.display = null;
                }
            }
        });
        this.displayOnlyProperty = new BooleanProperty(false, {
            tandem: options.tandem.createTandem('displayOnlyProperty'),
            phetioFeatured: true,
            phetioDocumentation: 'disables interaction with the ComboBox and ' + 'makes it appear like a display that shows the current selection'
        });
        this.displayOnlyProperty.link((displayOnly)=>{
            this.hideListBox();
            this.button.setDisplayOnly(displayOnly);
            this.pickable = !displayOnly;
        });
        this.addLinkedElement(property, {
            tandemName: 'property'
        });
        this.disposeComboBox = ()=>{
            listBoxMatrixProperty.dispose();
            if (this.display && this.display.hasInputListener(this.clickToDismissListener)) {
                this.display.removeInputListener(this.clickToDismissListener);
            }
            FocusManager.pdomFocusProperty.unlink(this.dismissWithFocusListener);
            // dispose of subcomponents
            this.displayOnlyProperty.dispose(); // tandems must be cleaned up
            this.listBox.dispose();
            this.button.dispose();
            nodes.forEach((node)=>node.dispose());
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'ComboBox', this);
    }
};
ComboBox.ComboBoxIO = new IOType('ComboBoxIO', {
    valueType: ComboBox,
    documentation: 'A combo box is composed of a push button and a listbox. The listbox contains items that represent ' + 'choices. Pressing the button pops up the listbox. Selecting from an item in the listbox sets the ' + 'value of an associated Property. The button shows the item that is currently selected.',
    supertype: Node.NodeIO,
    events: [
        'listBoxShown',
        'listBoxHidden'
    ]
});
export { ComboBox as default };
sun.register('ComboBox', ComboBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTY2VuZXJ5LWJhc2VkIGNvbWJvIGJveC4gQ29tcG9zZWQgb2YgYSBidXR0b24gYW5kIGEgcG9wdXAgJ2xpc3QgYm94JyBvZiBpdGVtcy4gQ29tYm9Cb3ggaGFzIG5vIGludGVyYWN0aW9uIG9mIGl0c1xuICogb3duLCBhbGwgaW50ZXJhY3Rpb24gaXMgaGFuZGxlZCBieSBpdHMgc3ViY29tcG9uZW50cy4gVGhlIGxpc3QgYm94IGlzIGRpc3BsYXllZCB3aGVuIHRoZSBidXR0b24gaXMgcHJlc3NlZCwgYW5kXG4gKiBkaXNtaXNzZWQgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkLCB0aGUgdXNlciBjbGlja3Mgb24gdGhlIGJ1dHRvbiwgb3IgdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgdGhlIGxpc3QuIFRoZSBsaXN0XG4gKiBjYW4gYmUgZGlzcGxheWVkIGVpdGhlciBhYm92ZSBvciBiZWxvdyB0aGUgYnV0dG9uLlxuICpcbiAqIFRoZSBzdXBwb3J0aW5nIHR5cGVzIGFuZCBjbGFzc2VzIGFyZTpcbiAqXG4gKiBDb21ib0JveEl0ZW0gLSBpdGVtcyBwcm92aWRlZCB0byBDb21ib0JveCBjb25zdHJ1Y3RvclxuICogQ29tYm9Cb3hCdXR0b24gLSB0aGUgYnV0dG9uXG4gKiBDb21ib0JveExpc3RCb3ggLSB0aGUgbGlzdCBib3hcbiAqIENvbWJvQm94TGlzdEl0ZW1Ob2RlIC0gYW4gaXRlbSBpbiB0aGUgbGlzdCBib3hcbiAqXG4gKiBGb3IgaW5mbyBvbiBDb21ib0JveCBVSSBkZXNpZ24sIGluY2x1ZGluZyBhMTF5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9ibG9iL21haW4vZG9jL0NvbWJvQm94Lm1kXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUGhldGlvUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9QaGV0aW9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBleHRlbmRzV2lkdGhTaXphYmxlLCBGb2N1cywgRm9jdXNNYW5hZ2VyLCBpc1dpZHRoU2l6YWJsZSwgTWF0cml4QmV0d2VlblByb3BlcnR5LCBOb2RlLCBOb2RlT3B0aW9ucywgUERPTUJlaGF2aW9yRnVuY3Rpb24sIFBET01QZWVyLCBQRE9NVXRpbHMsIFBET01WYWx1ZVR5cGUsIFRDb2xvciwgVElucHV0TGlzdGVuZXIsIFRQYWludCwgVHJpbVBhcmFsbGVsRE9NT3B0aW9ucywgV2lkdGhTaXphYmxlLCBXaWR0aFNpemFibGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzaGFyZWRTb3VuZFBsYXllcnMgZnJvbSAnLi4vLi4vdGFtYm8vanMvc2hhcmVkU291bmRQbGF5ZXJzLmpzJztcbmltcG9ydCBUU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvVFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCB7IFNwZWFrYWJsZVJlc29sdmVkUmVzcG9uc2UgfSBmcm9tICcuLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xuaW1wb3J0IENvbWJvQm94QnV0dG9uIGZyb20gJy4vQ29tYm9Cb3hCdXR0b24uanMnO1xuaW1wb3J0IENvbWJvQm94TGlzdEJveCBmcm9tICcuL0NvbWJvQm94TGlzdEJveC5qcyc7XG5pbXBvcnQgeyBDb21ib0JveExpc3RJdGVtTm9kZU9wdGlvbnMgfSBmcm9tICcuL0NvbWJvQm94TGlzdEl0ZW1Ob2RlLmpzJztcbmltcG9ydCBHcm91cEl0ZW1PcHRpb25zLCB7IGdldEdyb3VwSXRlbU5vZGVzIH0gZnJvbSAnLi9Hcm91cEl0ZW1PcHRpb25zLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xuaW1wb3J0IFN1bkNvbnN0YW50cyBmcm9tICcuL1N1bkNvbnN0YW50cy5qcyc7XG5cbi8vIGNvbnN0XG5jb25zdCBMSVNUX1BPU0lUSU9OX1ZBTFVFUyA9IFsgJ2Fib3ZlJywgJ2JlbG93JyBdIGFzIGNvbnN0OyAvLyB3aGVyZSB0aGUgbGlzdCBwb3BzIHVwIHJlbGF0aXZlIHRvIHRoZSBidXR0b25cbmNvbnN0IEFMSUdOX1ZBTFVFUyA9IFsgJ2xlZnQnLCAncmlnaHQnLCAnY2VudGVyJyBdIGFzIGNvbnN0OyAvLyBhbGlnbm1lbnQgb2YgaXRlbSBvbiBidXR0b24gYW5kIGluIGxpc3RcblxuLy8gVGFuZGVtIG5hbWVzIGZvciBDb21ib0JveEl0ZW0gbXVzdCBoYXZlIHRoaXMgc3VmZml4LlxuY29uc3QgSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVggPSAnSXRlbSc7XG5cbmV4cG9ydCB0eXBlIENvbWJvQm94SXRlbTxUPiA9IHtcblxuICAvLyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBpdGVtXG4gIHZhbHVlOiBUO1xuXG4gIC8vIFNvdW5kIHRoYXQgd2lsbCBiZSBwbGF5ZWQgd2hlbiB0aGlzIGl0ZW0gaXMgc2VsZWN0ZWQuICBJZiBzZXQgdG8gYG51bGxgIGEgZGVmYXVsdCBzb3VuZCB3aWxsIGJlIHVzZWQgdGhhdCBpcyBiYXNlZFxuICAvLyBvbiB0aGlzIGl0ZW0ncyBwb3NpdGlvbiBpbiB0aGUgY29tYm8gYm94IGxpc3QuICBBIHZhbHVlIG9mIGBudWxsU291bmRQbGF5ZXJgIGNhbiBiZSB1c2VkIHRvIGRpc2FibGUuXG4gIHNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyIHwgbnVsbDtcblxuICAvLyBwZG9tIC0gdGhlIGxhYmVsIGZvciB0aGlzIGl0ZW0ncyBhc3NvY2lhdGVkIE5vZGUgaW4gdGhlIGNvbWJvIGJveFxuICBhY2Nlc3NpYmxlTmFtZT86IFBET01WYWx1ZVR5cGUgfCBudWxsO1xuXG4gIC8vIE9wdGlvbnMgcGFzc2VkIHRvIENvbWJvQm94TGlzdEl0ZW1Ob2RlLCB0aGUgTm9kZSB0aGF0IGFwcGVhcnMgaW4gdGhlIGxpc3RCb3hcbiAgY29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zPzogQ29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zO1xufSAmIEdyb3VwSXRlbU9wdGlvbnM7XG5cbi8vIE1vc3QgdXNhZ2VzIG9mIHRoZSBpdGVtcyBzaG91bGQgbm90IGJlIGFibGUgdG8gY3JlYXRlIHRoZSBOb2RlLCBidXQgcmF0aGVyIHNob3VsZCB1c2UgdGhlIGNvcnJlc3BvbmRpbmcgYG5vZGVzYCBhcnJheSxcbi8vIGhlbmNlIHRoZSB0eXBlIG5hbWUgXCJObyBOb2RlXCIuXG5leHBvcnQgdHlwZSBDb21ib0JveEl0ZW1Ob05vZGU8VD4gPSBTdHJpY3RPbWl0PENvbWJvQm94SXRlbTxUPiwgJ2NyZWF0ZU5vZGUnPjtcblxuZXhwb3J0IHR5cGUgQ29tYm9Cb3hMaXN0UG9zaXRpb24gPSB0eXBlb2YgTElTVF9QT1NJVElPTl9WQUxVRVNbbnVtYmVyXTtcbmV4cG9ydCB0eXBlIENvbWJvQm94QWxpZ24gPSB0eXBlb2YgQUxJR05fVkFMVUVTW251bWJlcl07XG5cbi8vIFRoZSBkZWZpbml0aW9uIGZvciBob3cgQ29tYm9Cb3ggc2V0cyBpdHMgYWNjZXNzaWJsZU5hbWUgYW5kIGhlbHBUZXh0IGluIHRoZSBQRE9NLiBGb3J3YXJkIGl0IG9udG8gaXRzIGJ1dHRvbi4gU2VlXG4vLyBDb21ib0JveC5tZCBmb3IgZnVydGhlciBzdHlsZSBndWlkZSBhbmQgZG9jdW1lbnRhdGlvbiBvbiB0aGUgcGF0dGVybi5cbmNvbnN0IEFDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUjogUERPTUJlaGF2aW9yRnVuY3Rpb24gPSAoIG5vZGUsIG9wdGlvbnMsIGFjY2Vzc2libGVOYW1lLCBvdGhlck5vZGVDYWxsYmFja3MgKSA9PiB7XG4gIG90aGVyTm9kZUNhbGxiYWNrcy5wdXNoKCAoKSA9PiB7XG4gICAgKCBub2RlIGFzIENvbWJvQm94PHVua25vd24+ICkuYnV0dG9uLmFjY2Vzc2libGVOYW1lID0gYWNjZXNzaWJsZU5hbWU7XG4gIH0gKTtcbiAgcmV0dXJuIG9wdGlvbnM7XG59O1xuY29uc3QgSEVMUF9URVhUX0JFSEFWSU9SOiBQRE9NQmVoYXZpb3JGdW5jdGlvbiA9ICggbm9kZSwgb3B0aW9ucywgaGVscFRleHQsIG90aGVyTm9kZUNhbGxiYWNrcyApID0+IHtcbiAgb3RoZXJOb2RlQ2FsbGJhY2tzLnB1c2goICgpID0+IHtcbiAgICAoIG5vZGUgYXMgQ29tYm9Cb3g8dW5rbm93bj4gKS5idXR0b24uaGVscFRleHQgPSBoZWxwVGV4dDtcbiAgfSApO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGFsaWduPzogQ29tYm9Cb3hBbGlnbjtcbiAgbGlzdFBvc2l0aW9uPzogQ29tYm9Cb3hMaXN0UG9zaXRpb247XG5cbiAgLy8gaG9yaXpvbnRhbCBzcGFjZSBiZXR3ZWVuIGxhYmVsIGFuZCBjb21ibyBib3hcbiAgbGFiZWxYU3BhY2luZz86IG51bWJlcjtcblxuICAvLyBvcGFjaXR5IHVzZWQgdG8gbWFrZSB0aGUgY29udHJvbCBsb29rIGRpc2FibGVkLCAwLTFcbiAgZGlzYWJsZWRPcGFjaXR5PzogbnVtYmVyO1xuXG4gIC8vIGFwcGxpZWQgdG8gYnV0dG9uLCBsaXN0Qm94LCBhbmQgaXRlbSBoaWdobGlnaHRzXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjtcblxuICAvLyBoaWdobGlnaHQgYmVoaW5kIGl0ZW1zIGluIHRoZSBsaXN0XG4gIGhpZ2hsaWdodEZpbGw/OiBUUGFpbnQ7XG5cbiAgLy8gTWFyZ2lucyBhcm91bmQgdGhlIGVkZ2VzIG9mIHRoZSBidXR0b24gYW5kIGxpc3Rib3ggd2hlbiBoaWdobGlnaHQgaXMgaW52aXNpYmxlLlxuICAvLyBIaWdobGlnaHQgbWFyZ2lucyBhcm91bmQgdGhlIGl0ZW1zIGluIHRoZSBsaXN0IGFyZSBzZXQgdG8gMS8yIG9mIHRoZXNlIHZhbHVlcy5cbiAgLy8gVGhlc2UgdmFsdWVzIG11c3QgYmUgPiAwLlxuICB4TWFyZ2luPzogbnVtYmVyO1xuICB5TWFyZ2luPzogbnVtYmVyO1xuXG4gIC8vIGJ1dHRvblxuICBidXR0b25GaWxsPzogVENvbG9yO1xuICBidXR0b25TdHJva2U/OiBUUGFpbnQ7XG4gIGJ1dHRvbkxpbmVXaWR0aD86IG51bWJlcjtcbiAgYnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICBidXR0b25Ub3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIGJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgYnV0dG9uTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIC8vIGxpc3RcbiAgbGlzdEZpbGw/OiBUUGFpbnQ7XG4gIGxpc3RTdHJva2U/OiBUUGFpbnQ7XG4gIGxpc3RMaW5lV2lkdGg/OiBudW1iZXI7XG5cbiAgLy8gU291bmQgZ2VuZXJhdG9ycyBmb3Igd2hlbiBjb21ibyBib3ggaXMgb3BlbmVkIGFuZCBmb3Igd2hlbiBpdCBpcyBjbG9zZWQgd2l0aCBubyBjaGFuZ2UgKGNsb3NpbmdcbiAgLy8gKndpdGgqIGEgY2hhbmdlIGlzIGhhbmRsZWQgZWxzZXdoZXJlKS5cbiAgb3BlbmVkU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG4gIGNsb3NlZE5vQ2hhbmdlU291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG5cbiAgLy8gcGRvbVxuICAvLyBUaGUgdGFnIG5hbWUgZm9yIHRoZSBsYWJlbCBvZiB0aGUgQ29tYm9Cb3guIFRoZSBBY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIGZvcndhcmRzIHRoZSBuYW1lIHRvIHRoZSBDb21ib0JveEJ1dHRvbixcbiAgLy8gc28gaWYgeW91IG5lZWQgYSBkaWZmZXJlbnQgdGFnIG5hbWUgZm9yIHRoZSBDb21ib0JveCwgc2V0IGl0IGhlcmUuIFNlZSB0aGUgQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIGZ1bmN0aW9uc1xuICAvLyBmb3IgQ29tYm9Cb3ggYW5kIENvbWJvQm94QnV0dG9uLlxuICBidXR0b25MYWJlbFRhZ05hbWU/OiBzdHJpbmc7XG5cbiAgLy8gVm9pY2luZ1xuICAvLyBDb21ib0JveCBkb2VzIG5vdCBtaXggVm9pY2luZywgc28gaXQgY3JlYXRlcyBjdXN0b20gb3B0aW9ucyB0byBwYXNzIHRvIGNvbXBvc2VkIFZvaWNpbmcgTm9kZXMuXG4gIC8vIFRoZSBwYXR0ZXJuIGZvciB0aGUgbmFtZSByZXNwb25zZSBzdHJpbmcsIG11c3QgaW5jbHVkZSBge3t2YWx1ZX19YCBzbyB0aGF0IHRoZSBzZWxlY3RlZCB2YWx1ZSBzdHJpbmcgY2FuXG4gIC8vIGJlIGZpbGxlZCBpbi5cbiAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybj86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gfCBzdHJpbmc7XG5cbiAgLy8gbW9zdCBjb250ZXh0IHJlc3BvbnNlcyBhcmUgZHluYW1pYyB0byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgc2ltLCBzbyBsYXppbHkgY3JlYXRlIHRoZW0gd2hlbiBuZWVkZWQuXG4gIGNvbWJvQm94Vm9pY2luZ0NvbnRleHRSZXNwb25zZT86ICggKCkgPT4gc3RyaW5nIHwgbnVsbCApIHwgbnVsbDtcblxuICAvLyBzdHJpbmcgZm9yIHRoZSB2b2ljaW5nIHJlc3BvbnNlXG4gIGNvbWJvQm94Vm9pY2luZ0hpbnRSZXNwb25zZT86IFNwZWFrYWJsZVJlc29sdmVkUmVzcG9uc2UgfCBudWxsO1xufTtcblxudHlwZSBQYXJlbnRPcHRpb25zID0gTm9kZU9wdGlvbnMgJiBXaWR0aFNpemFibGVPcHRpb25zO1xuZXhwb3J0IHR5cGUgQ29tYm9Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBUcmltUGFyYWxsZWxET01PcHRpb25zPFBhcmVudE9wdGlvbnM+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21ib0JveDxUPiBleHRlbmRzIFdpZHRoU2l6YWJsZSggTm9kZSApIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGxpc3RQb3NpdGlvbjogQ29tYm9Cb3hMaXN0UG9zaXRpb247XG5cbiAgLy8gTGlzdCBvZiBub2RlcyBjcmVhdGVkIGZyb20gQ29tYm9Cb3hJdGVtcyB0byBiZSBkaXNwbGF5ZWQgd2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIHZhbHVlLiBTZWUgQ29tYm9Cb3hJdGVtLmNyZWF0ZU5vZGUoKS5cbiAgcHVibGljIHJlYWRvbmx5IG5vZGVzOiBOb2RlW107XG5cbiAgLy8gYnV0dG9uIHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIChpbnRlcm5hbClcbiAgcHVibGljIGJ1dHRvbjogQ29tYm9Cb3hCdXR0b248VD47XG5cbiAgLy8gdGhlIHBvcHVwIGxpc3QgYm94XG4gIHByaXZhdGUgcmVhZG9ubHkgbGlzdEJveDogQ29tYm9Cb3hMaXN0Qm94PFQ+O1xuXG4gIHByaXZhdGUgbGlzdFBhcmVudDogTm9kZTtcblxuICAvLyB0aGUgZGlzcGxheSB0aGF0IGNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgaXMgYWRkZWQgdG8sIGJlY2F1c2UgdGhlIHNjZW5lIG1heSBjaGFuZ2UsIHNlZSBzdW4jMTRcbiAgcHJpdmF0ZSBkaXNwbGF5OiBEaXNwbGF5IHwgbnVsbDtcblxuICAvLyBDbGlja2luZyBhbnl3aGVyZSBvdGhlciB0aGFuIHRoZSBidXR0b24gb3IgbGlzdCBib3ggd2lsbCBoaWRlIHRoZSBsaXN0IGJveC5cbiAgcHJpdmF0ZSByZWFkb25seSBjbGlja1RvRGlzbWlzc0xpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lcjtcblxuICAvLyAoUERPTSkgd2hlbiBmb2N1cyBsZWF2ZXMgdGhlIENvbWJvQm94TGlzdEJveCwgaXQgc2hvdWxkIGJlIGNsb3NlZC4gVGhpcyBjb3VsZCBoYXBwZW4gZnJvbSBrZXlib2FyZFxuICAvLyBvciBmcm9tIG90aGVyIHNjcmVlbiByZWFkZXIgY29udHJvbHMgKGxpa2UgVm9pY2VPdmVyIGdlc3R1cmVzKVxuICBwcml2YXRlIHJlYWRvbmx5IGRpc21pc3NXaXRoRm9jdXNMaXN0ZW5lcjogKCBmb2N1czogRm9jdXMgfCBudWxsICkgPT4gdm9pZDtcblxuICAvLyBGb3IgdXNlIHZpYSBQaEVULWlPLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNDUxXG4gIC8vIFRoaXMgaXMgbm90IGdlbmVyYWxseSBjb250cm9sbGVkIGJ5IHRoZSB1c2VyLCBzbyBpdCBpcyBub3QgcmVzZXQgd2hlbiB0aGUgUmVzZXQgQWxsIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXlPbmx5UHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbWJvQm94OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gcHJvcGVydHkgLSBtdXN0IGJlIHNldHRhYmxlIGFuZCBsaW5rYWJsZSwgYnV0IG5lZWRzIHRvIHN1cHBvcnQgUHJvcGVydHksIERlcml2ZWRQcm9wZXJ0eSBhbmQgRHluYW1pY1Byb3BlcnR5XG4gICAqIEBwYXJhbSBpdGVtcyAtIGl0ZW1zLCBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IGFwcGVhciBpbiB0aGUgbGlzdGJveFxuICAgKiBAcGFyYW0gbGlzdFBhcmVudCBub2RlIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBsaXN0J3MgcGFyZW50LCB1c2UgdGhpcyB0byBlbnN1cmUgdGhhdCB0aGUgbGlzdCBpcyBpbiBmcm9udCBvZiBldmVyeXRoaW5nIGVsc2VcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3BlcnR5OiBQaGV0aW9Qcm9wZXJ0eTxUPiwgaXRlbXM6IENvbWJvQm94SXRlbTxUPltdLCBsaXN0UGFyZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBDb21ib0JveE9wdGlvbnMgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLnVuaXFCeSggaXRlbXMsICggaXRlbTogQ29tYm9Cb3hJdGVtPFQ+ICkgPT4gaXRlbS52YWx1ZSApLmxlbmd0aCA9PT0gaXRlbXMubGVuZ3RoLFxuICAgICAgJ2l0ZW1zIG11c3QgaGF2ZSB1bmlxdWUgdmFsdWVzJyApO1xuICAgIGFzc2VydCAmJiBpdGVtcy5mb3JFYWNoKCBpdGVtID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpdGVtLnRhbmRlbU5hbWUgfHwgaXRlbS50YW5kZW1OYW1lLmVuZHNXaXRoKCBJVEVNX1RBTkRFTV9OQU1FX1NVRkZJWCApLFxuICAgICAgICBgQ29tYm9Cb3hJdGVtIHRhbmRlbU5hbWUgbXVzdCBlbmQgd2l0aCAnJHtJVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH0nOiAke2l0ZW0udGFuZGVtTmFtZX1gICk7XG4gICAgfSApO1xuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzU0MlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RQYXJlbnQubWF4V2lkdGggPT09IG51bGwsXG4gICAgICAnQ29tYm9Cb3ggaXMgcmVzcG9uc2libGUgZm9yIHNjYWxpbmcgbGlzdEJveC4gU2V0dGluZyBtYXhXaWR0aCBmb3IgbGlzdFBhcmVudCBtYXkgcmVzdWx0IGluIGJ1Z2d5IGJlaGF2aW9yLicgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q29tYm9Cb3hPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuXG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgbGlzdFBvc2l0aW9uOiAnYmVsb3cnLFxuICAgICAgbGFiZWxYU3BhY2luZzogMTAsXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IDAuNSxcbiAgICAgIGNvcm5lclJhZGl1czogNCxcbiAgICAgIGhpZ2hsaWdodEZpbGw6ICdyZ2IoIDI0NSwgMjQ1LCAyNDUgKScsXG4gICAgICB4TWFyZ2luOiAxMixcbiAgICAgIHlNYXJnaW46IDgsXG5cbiAgICAgIC8vIGJ1dHRvblxuICAgICAgYnV0dG9uRmlsbDogJ3doaXRlJyxcbiAgICAgIGJ1dHRvblN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGJ1dHRvbkxpbmVXaWR0aDogMSxcbiAgICAgIGJ1dHRvblRvdWNoQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIGJ1dHRvblRvdWNoQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIGJ1dHRvbk1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIGJ1dHRvbk1vdXNlQXJlYVlEaWxhdGlvbjogMCxcblxuICAgICAgLy8gbGlzdFxuICAgICAgbGlzdEZpbGw6ICd3aGl0ZScsXG4gICAgICBsaXN0U3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGlzdExpbmVXaWR0aDogMSxcblxuICAgICAgb3BlbmVkU291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdnZW5lcmFsT3BlbicgKSxcbiAgICAgIGNsb3NlZE5vQ2hhbmdlU291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdnZW5lcmFsQ2xvc2UnICksXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIHRhZ05hbWU6ICdkaXYnLCAvLyBtdXN0IGhhdmUgYWNjZXNzaWJsZSBjb250ZW50IHRvIHN1cHBvcnQgYmVoYXZpb3IgZnVuY3Rpb25zXG4gICAgICBidXR0b25MYWJlbFRhZ05hbWU6ICdwJyxcbiAgICAgIGFjY2Vzc2libGVOYW1lQmVoYXZpb3I6IEFDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUixcbiAgICAgIGhlbHBUZXh0QmVoYXZpb3I6IEhFTFBfVEVYVF9CRUhBVklPUixcblxuICAgICAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybjogU3VuQ29uc3RhbnRzLlZBTFVFX05BTUVEX1BMQUNFSE9MREVSLFxuICAgICAgY29tYm9Cb3hWb2ljaW5nQ29udGV4dFJlc3BvbnNlOiBudWxsLFxuICAgICAgY29tYm9Cb3hWb2ljaW5nSGludFJlc3BvbnNlOiBudWxsLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdDb21ib0JveCcsXG4gICAgICBwaGV0aW9UeXBlOiBDb21ib0JveC5Db21ib0JveElPLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSLFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlIC8vIG9wdCBpbnRvIGRlZmF1bHQgUGhFVC1pTyBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBub2RlcyA9IGdldEdyb3VwSXRlbU5vZGVzKCBpdGVtcywgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXRlbXMnICkgKTtcblxuICAgIC8vIHBkb20gLSBJZiBhbiBpdGVtIGhhcyBub3QgYmVlbiBnaXZlbiBhbiBhY2Nlc3NpYmxlTmFtZSwgdHJ5IHRvIGZpbmQgYSBkZWZhdWx0IHZhbHVlIGZyb20gdGhlIHZpc3VhbCBOb2RlLlxuICAgIC8vIEFzc2lnbmVkIHRvIHRoZSBpdGVtLCBiZWNhdXNlIHRoZSBhY2Nlc3NpYmxlIG5hbWUgaXMgdXNlZCBpbiB0aGUgQ29tYm9Cb3hCdXR0b24gYW5kIENvbWJvQm94TGlzdEl0ZW1Ob2RlLlxuICAgIGl0ZW1zLmZvckVhY2goICggKCBpdGVtLCBpICkgPT4ge1xuICAgICAgaWYgKCAhaXRlbS5hY2Nlc3NpYmxlTmFtZSApIHtcbiAgICAgICAgaXRlbS5hY2Nlc3NpYmxlTmFtZSA9IFBET01VdGlscy5maW5kU3RyaW5nUHJvcGVydHkoIG5vZGVzWyBpIF0gKTtcbiAgICAgIH1cbiAgICB9ICkgKTtcblxuICAgIGFzc2VydCAmJiBub2Rlcy5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFub2RlLmhhc1BET01Db250ZW50LCAnQWNjZXNzaWJpbGl0eSBpcyBwcm92aWRlZCBieSBDb21ib0JveEl0ZW1Ob2RlIGFuZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ29tYm9Cb3hJdGVtLmFjY2Vzc2libGVOYW1lLiBBZGRpdGlvbmFsIFBET00gY29udGVudCBpbiB0aGUgcHJvdmlkZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vZGUgY291bGQgYnJlYWsgYWNjZXNzaWJpbGl0eS4nICk7XG4gICAgfSApO1xuXG4gICAgLy8gdmFsaWRhdGUgb3B0aW9uIHZhbHVlc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueE1hcmdpbiA+IDAgJiYgb3B0aW9ucy55TWFyZ2luID4gMCxcbiAgICAgIGBtYXJnaW5zIG11c3QgYmUgPiAwLCB4TWFyZ2luPSR7b3B0aW9ucy54TWFyZ2lufSwgeU1hcmdpbj0ke29wdGlvbnMueU1hcmdpbn1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggTElTVF9QT1NJVElPTl9WQUxVRVMsIG9wdGlvbnMubGlzdFBvc2l0aW9uICksXG4gICAgICBgaW52YWxpZCBsaXN0UG9zaXRpb246ICR7b3B0aW9ucy5saXN0UG9zaXRpb259YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEFMSUdOX1ZBTFVFUywgb3B0aW9ucy5hbGlnbiApLFxuICAgICAgYGludmFsaWQgYWxpZ246ICR7b3B0aW9ucy5hbGlnbn1gICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5ub2RlcyA9IG5vZGVzO1xuXG4gICAgdGhpcy5saXN0UG9zaXRpb24gPSBvcHRpb25zLmxpc3RQb3NpdGlvbjtcblxuICAgIHRoaXMuYnV0dG9uID0gbmV3IENvbWJvQm94QnV0dG9uKCBwcm9wZXJ0eSwgaXRlbXMsIG5vZGVzLCB7XG4gICAgICBhbGlnbjogb3B0aW9ucy5hbGlnbixcbiAgICAgIGFycm93RGlyZWN0aW9uOiAoIG9wdGlvbnMubGlzdFBvc2l0aW9uID09PSAnYmVsb3cnICkgPyAnZG93bicgOiAndXAnLFxuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1cyxcbiAgICAgIHhNYXJnaW46IG9wdGlvbnMueE1hcmdpbixcbiAgICAgIHlNYXJnaW46IG9wdGlvbnMueU1hcmdpbixcbiAgICAgIGJhc2VDb2xvcjogb3B0aW9ucy5idXR0b25GaWxsLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmJ1dHRvblN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5idXR0b25MaW5lV2lkdGgsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IG9wdGlvbnMuYnV0dG9uVG91Y2hBcmVhWERpbGF0aW9uLFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBvcHRpb25zLmJ1dHRvblRvdWNoQXJlYVlEaWxhdGlvbixcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogb3B0aW9ucy5idXR0b25Nb3VzZUFyZWFYRGlsYXRpb24sXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IG9wdGlvbnMuYnV0dG9uTW91c2VBcmVhWURpbGF0aW9uLFxuICAgICAgbG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5OiB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSxcbiAgICAgIGxvY2FsTWluaW11bVdpZHRoUHJvcGVydHk6IHRoaXMubG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eSxcblxuICAgICAgY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybjogb3B0aW9ucy5jb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuLFxuXG4gICAgICAvLyBwZG9tIC0gYWNjZXNzaWJsZU5hbWUgYW5kIGhlbHBUZXh0IGFyZSBzZXQgdmlhIGJlaGF2aW9yIGZ1bmN0aW9ucyBvbiB0aGUgQ29tYm9Cb3hcbiAgICAgIGxhYmVsVGFnTmFtZTogb3B0aW9ucy5idXR0b25MYWJlbFRhZ05hbWUsXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYnV0dG9uJyApXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYnV0dG9uICk7XG5cbiAgICB0aGlzLmxpc3RCb3ggPSBuZXcgQ29tYm9Cb3hMaXN0Qm94KCBwcm9wZXJ0eSwgaXRlbXMsIG5vZGVzLFxuICAgICAgdGhpcy5oaWRlTGlzdEJveC5iaW5kKCB0aGlzICksIC8vIGNhbGxiYWNrIHRvIGhpZGUgdGhlIGxpc3QgYm94XG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuYnV0dG9uLmJsb2NrTmV4dFZvaWNpbmdGb2N1c0xpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuYnV0dG9uLmZvY3VzKCk7XG4gICAgICB9LFxuICAgICAgdGhpcy5idXR0b24sXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsaXN0Qm94JyApLCB7XG4gICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduLFxuICAgICAgICBoaWdobGlnaHRGaWxsOiBvcHRpb25zLmhpZ2hsaWdodEZpbGwsXG4gICAgICAgIHhNYXJnaW46IG9wdGlvbnMueE1hcmdpbixcbiAgICAgICAgeU1hcmdpbjogb3B0aW9ucy55TWFyZ2luLFxuICAgICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzLFxuICAgICAgICBmaWxsOiBvcHRpb25zLmxpc3RGaWxsLFxuICAgICAgICBzdHJva2U6IG9wdGlvbnMubGlzdFN0cm9rZSxcbiAgICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpc3RMaW5lV2lkdGgsXG4gICAgICAgIHZpc2libGU6IGZhbHNlLFxuXG4gICAgICAgIGNvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9uczoge1xuICAgICAgICAgIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm46IG9wdGlvbnMuY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybixcbiAgICAgICAgICB2b2ljaW5nQ29udGV4dFJlc3BvbnNlOiBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ0NvbnRleHRSZXNwb25zZSxcbiAgICAgICAgICB2b2ljaW5nSGludFJlc3BvbnNlOiBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ0hpbnRSZXNwb25zZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHNvdW5kIGdlbmVyYXRpb25cbiAgICAgICAgb3BlbmVkU291bmRQbGF5ZXI6IG9wdGlvbnMub3BlbmVkU291bmRQbGF5ZXIsXG4gICAgICAgIGNsb3NlZE5vQ2hhbmdlU291bmRQbGF5ZXI6IG9wdGlvbnMuY2xvc2VkTm9DaGFuZ2VTb3VuZFBsYXllcixcblxuICAgICAgICAvLyBwZG9tXG4gICAgICAgIC8vIHRoZSBsaXN0IGJveCBpcyBhcmlhLWxhYmVsbGVkYnkgaXRzIG93biBsYWJlbCBzaWJsaW5nXG4gICAgICAgIGFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zOiBbIHtcbiAgICAgICAgICBvdGhlck5vZGU6IHRoaXMuYnV0dG9uLFxuICAgICAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkcsXG4gICAgICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgICAgICAgfSBdXG4gICAgICB9ICk7XG4gICAgbGlzdFBhcmVudC5hZGRDaGlsZCggdGhpcy5saXN0Qm94ICk7XG4gICAgdGhpcy5saXN0UGFyZW50ID0gbGlzdFBhcmVudDtcblxuICAgIC8vIFdlIHdhbnQgdGhlIGRyb3AtZG93biBjb21ibyBsaXN0IHRvIGJlIGp1c3QgQUZURVIgdGhlIG1haW4gQ29tYm9Cb3ggY29udGVudCBpbiB0aGUgUERPTS5cbiAgICB0aGlzLnBkb21PcmRlciA9IFsgbnVsbCwgdGhpcy5saXN0Qm94IF07XG5cbiAgICBjb25zdCBsaXN0Qm94TWF0cml4UHJvcGVydHkgPSBuZXcgTWF0cml4QmV0d2VlblByb3BlcnR5KCB0aGlzLmJ1dHRvbiwgdGhpcy5saXN0UGFyZW50LCB7XG4gICAgICBmcm9tQ29vcmRpbmF0ZUZyYW1lOiAncGFyZW50JyxcbiAgICAgIHRvQ29vcmRpbmF0ZUZyYW1lOiAnbG9jYWwnXG4gICAgfSApO1xuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBsaXN0Qm94TWF0cml4UHJvcGVydHksIHRoaXMuYnV0dG9uLmxvY2FsQm91bmRzUHJvcGVydHksIHRoaXMubGlzdEJveC5sb2NhbEJvdW5kc1Byb3BlcnR5IF0sXG4gICAgICBtYXRyaXggPT4ge1xuICAgICAgICB0aGlzLnNjYWxlQW5kUG9zaXRpb25MaXN0Qm94KCBtYXRyaXggKTtcbiAgICAgIH0gKTtcblxuICAgIC8vIFRoZSBsaXN0Qm94IGlzIG5vdCBhIGNoaWxkIE5vZGUgb2YgQ29tYm9Cb3ggYW5kLCBhcyBhIHJlc3VsdCwgbGlzdGVuIHRvIG9wYWNpdHkgb2YgdGhlIENvbWJvQm94IGFuZCBrZWVwXG4gICAgLy8gdGhlIGxpc3RCb3ggaW4gc3luYyB3aXRoIHRoZW0uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy81ODdcbiAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eS5saW5rKCBvcGFjaXR5ID0+IHsgdGhpcy5saXN0Qm94Lm9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IG9wYWNpdHk7IH0gKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICBpZiAoIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG4gICAgICBpdGVtcy5mb3JFYWNoKCBpdGVtID0+IHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXRlbS50YW5kZW1OYW1lICE9PSBudWxsLCBgUGhFVC1pTyBpbnN0cnVtZW50ZWQgQ29tYm9Cb3hlcyByZXF1aXJlIENvbWJvQm94SXRlbXMgdG8gaGF2ZSB0YW5kZW1OYW1lOiAke2l0ZW0udmFsdWV9YCApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIENsaWNraW5nIG9uIHRoZSBidXR0b24gdG9nZ2xlcyB2aXNpYmlsaXR5IG9mIHRoZSBsaXN0IGJveFxuICAgIHRoaXMuYnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICB0aGlzLmxpc3RCb3gudmlzaWJsZVByb3BlcnR5LnZhbHVlID0gIXRoaXMubGlzdEJveC52aXNpYmxlUHJvcGVydHkudmFsdWU7XG4gICAgICB0aGlzLmxpc3RCb3gudmlzaWJsZVByb3BlcnR5LnZhbHVlICYmIHRoaXMubGlzdEJveC5mb2N1c0xpc3RJdGVtTm9kZSggcHJvcGVydHkudmFsdWUgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3BsYXkgPSBudWxsO1xuXG4gICAgdGhpcy5jbGlja1RvRGlzbWlzc0xpc3RlbmVyID0ge1xuICAgICAgZG93bjogZXZlbnQgPT4ge1xuXG4gICAgICAgIC8vIElmIGZ1enppbmcgaXMgZW5hYmxlZCwgZXhlcmNpc2UgdGhpcyBsaXN0ZW5lciBzb21lIHBlcmNlbnRhZ2Ugb2YgdGhlIHRpbWUsIHNvIHRoYXQgdGhpcyBsaXN0ZW5lciBpcyB0ZXN0ZWQuXG4gICAgICAgIC8vIFRoZSByZXN0IG9mIHRoZSB0aW1lLCBpZ25vcmUgdGhpcyBsaXN0ZW5lciwgc28gdGhhdCB0aGUgbGlzdGJveCByZW1haW5zIHBvcHBlZCB1cCwgYW5kIHdlIHRlc3QgbWFraW5nXG4gICAgICAgIC8vIGNob2ljZXMgZnJvbSB0aGUgbGlzdGJveC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzY3NyBmb3IgdGhlIGluaXRpYWwgaW1wbGVtZW50YXRpb24sXG4gICAgICAgIC8vIGFuZCBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzEzNiBmb3IgdGhlIHByb2JhYmlsaXR5IHZhbHVlIGNob3Nlbi5cbiAgICAgICAgaWYgKCAhcGhldC5jaGlwcGVyLmlzRnV6ekVuYWJsZWQoKSB8fCBkb3RSYW5kb20ubmV4dERvdWJsZSgpIDwgMC4wMDUgKSB7XG5cbiAgICAgICAgICAvLyBJZ25vcmUgaWYgd2UgY2xpY2sgb3ZlciB0aGUgYnV0dG9uLCBzaW5jZSB0aGUgYnV0dG9uIHdpbGwgaGFuZGxlIGhpZGluZyB0aGUgbGlzdC5cbiAgICAgICAgICBpZiAoICEoIGV2ZW50LnRyYWlsLmNvbnRhaW5zTm9kZSggdGhpcy5idXR0b24gKSB8fCBldmVudC50cmFpbC5jb250YWluc05vZGUoIHRoaXMubGlzdEJveCApICkgKSB7XG4gICAgICAgICAgICB0aGlzLmhpZGVMaXN0Qm94KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZGlzbWlzc1dpdGhGb2N1c0xpc3RlbmVyID0gZm9jdXMgPT4ge1xuICAgICAgaWYgKCBmb2N1cyAmJiAhZm9jdXMudHJhaWwuY29udGFpbnNOb2RlKCB0aGlzLmxpc3RCb3ggKSApIHtcbiAgICAgICAgdGhpcy5oaWRlTGlzdEJveCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LmxpbmsoIHRoaXMuZGlzbWlzc1dpdGhGb2N1c0xpc3RlbmVyICk7XG5cbiAgICB0aGlzLmxpc3RCb3gudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xuICAgICAgaWYgKCB2aXNpYmxlICkge1xuXG4gICAgICAgIC8vIHNob3cgdGhlIGxpc3QgYm94XG4gICAgICAgIHRoaXMuc2NhbGVMaXN0Qm94KCk7XG4gICAgICAgIHRoaXMubGlzdEJveC5tb3ZlVG9Gcm9udCgpO1xuXG4gICAgICAgIC8vIG1hbmFnZSBjbGlja1RvRGlzbWlzc0xpc3RlbmVyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmRpc3BsYXksICd1bmV4cGVjdGVkIGRpc3BsYXknICk7XG4gICAgICAgIHRoaXMuZGlzcGxheSA9IHRoaXMuZ2V0VW5pcXVlVHJhaWwoKS5yb290Tm9kZSgpLmdldFJvb3RlZERpc3BsYXlzKClbIDAgXTtcbiAgICAgICAgdGhpcy5kaXNwbGF5LmFkZElucHV0TGlzdGVuZXIoIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gbWFuYWdlIGNsaWNrVG9EaXNtaXNzTGlzdGVuZXJcbiAgICAgICAgaWYgKCB0aGlzLmRpc3BsYXkgJiYgdGhpcy5kaXNwbGF5Lmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApICkge1xuICAgICAgICAgIHRoaXMuZGlzcGxheS5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgKTtcbiAgICAgICAgICB0aGlzLmRpc3BsYXkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5kaXNwbGF5T25seVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlzcGxheU9ubHlQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2Rpc2FibGVzIGludGVyYWN0aW9uIHdpdGggdGhlIENvbWJvQm94IGFuZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYWtlcyBpdCBhcHBlYXIgbGlrZSBhIGRpc3BsYXkgdGhhdCBzaG93cyB0aGUgY3VycmVudCBzZWxlY3Rpb24nXG4gICAgfSApO1xuICAgIHRoaXMuZGlzcGxheU9ubHlQcm9wZXJ0eS5saW5rKCBkaXNwbGF5T25seSA9PiB7XG4gICAgICB0aGlzLmhpZGVMaXN0Qm94KCk7XG4gICAgICB0aGlzLmJ1dHRvbi5zZXREaXNwbGF5T25seSggZGlzcGxheU9ubHkgKTtcbiAgICAgIHRoaXMucGlja2FibGUgPSAhZGlzcGxheU9ubHk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBwcm9wZXJ0eSwge1xuICAgICAgdGFuZGVtTmFtZTogJ3Byb3BlcnR5J1xuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZUNvbWJvQm94ID0gKCkgPT4ge1xuICAgICAgbGlzdEJveE1hdHJpeFByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgICAgaWYgKCB0aGlzLmRpc3BsYXkgJiYgdGhpcy5kaXNwbGF5Lmhhc0lucHV0TGlzdGVuZXIoIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciApICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5jbGlja1RvRGlzbWlzc0xpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS51bmxpbmsoIHRoaXMuZGlzbWlzc1dpdGhGb2N1c0xpc3RlbmVyICk7XG5cbiAgICAgIC8vIGRpc3Bvc2Ugb2Ygc3ViY29tcG9uZW50c1xuICAgICAgdGhpcy5kaXNwbGF5T25seVByb3BlcnR5LmRpc3Bvc2UoKTsgLy8gdGFuZGVtcyBtdXN0IGJlIGNsZWFuZWQgdXBcbiAgICAgIHRoaXMubGlzdEJveC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmJ1dHRvbi5kaXNwb3NlKCk7XG4gICAgICBub2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGUuZGlzcG9zZSgpICk7XG4gICAgfTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnQ29tYm9Cb3gnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgbGlzdCBib3guXG4gICAqL1xuICBwdWJsaWMgc2hvd0xpc3RCb3goKTogdm9pZCB7XG4gICAgdGhpcy5saXN0Qm94LnZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgdGhlIGxpc3QgYm94LlxuICAgKi9cbiAgcHVibGljIGhpZGVMaXN0Qm94KCk6IHZvaWQge1xuICAgIHRoaXMubGlzdEJveC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCZWNhdXNlIHRoZSBidXR0b24gYW5kIGxpc3QgYm94IGhhdmUgZGlmZmVyZW50IHBhcmVudHMgKGFuZCB0aGVyZWZvcmUgZGlmZmVyZW50IGNvb3JkaW5hdGUgZnJhbWVzKVxuICAgKiB0aGV5IG1heSBiZSBzY2FsZWQgZGlmZmVyZW50bHkuIFRoaXMgbWV0aG9kIHNjYWxlcyB0aGUgbGlzdCBib3ggc28gdGhhdCBpdGVtcyBvbiB0aGUgYnV0dG9uIGFuZCBpblxuICAgKiB0aGUgbGlzdCBhcHBlYXIgdG8gYmUgdGhlIHNhbWUgc2l6ZS5cbiAgICovXG4gIHByaXZhdGUgc2NhbGVMaXN0Qm94KCk6IHZvaWQge1xuXG4gICAgLy8gVG8gc3VwcG9ydCBhbiBlbXB0eSBsaXN0IGJveCBkdWUgdG8gUGhFVC1pTyBjdXN0b21pemF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjA2XG4gICAgaWYgKCAhdGhpcy5saXN0Qm94LmxvY2FsQm91bmRzLmlzRW1wdHkoKSApIHtcbiAgICAgIGNvbnN0IGJ1dHRvblNjYWxlID0gdGhpcy5idXR0b24ubG9jYWxUb0dsb2JhbEJvdW5kcyggdGhpcy5idXR0b24ubG9jYWxCb3VuZHMgKS53aWR0aCAvIHRoaXMuYnV0dG9uLmxvY2FsQm91bmRzLndpZHRoO1xuICAgICAgY29uc3QgbGlzdEJveFNjYWxlID0gdGhpcy5saXN0Qm94LmxvY2FsVG9HbG9iYWxCb3VuZHMoIHRoaXMubGlzdEJveC5sb2NhbEJvdW5kcyApLndpZHRoIC8gdGhpcy5saXN0Qm94LmxvY2FsQm91bmRzLndpZHRoO1xuICAgICAgdGhpcy5saXN0Qm94LnNjYWxlKCBidXR0b25TY2FsZSAvIGxpc3RCb3hTY2FsZSApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2NhbGVBbmRQb3NpdGlvbkxpc3RCb3goIGxpc3RCb3hNYXRyaXg6IE1hdHJpeDMgfCBudWxsICk6IHZvaWQge1xuICAgIGlmICggbGlzdEJveE1hdHJpeCApIHtcblxuICAgICAgLy8gU2NhbGUgdGhlIGJveCBiZWZvcmUgcG9zaXRpb25pbmcuXG4gICAgICB0aGlzLnNjYWxlTGlzdEJveCgpO1xuXG4gICAgICBpZiAoIHRoaXMubGlzdFBvc2l0aW9uID09PSAnYWJvdmUnICkge1xuICAgICAgICB0aGlzLmxpc3RCb3gubGVmdEJvdHRvbSA9IGxpc3RCb3hNYXRyaXgudGltZXNWZWN0b3IyKCB0aGlzLmJ1dHRvbi5sZWZ0VG9wICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5saXN0Qm94LmxlZnRUb3AgPSBsaXN0Qm94TWF0cml4LnRpbWVzVmVjdG9yMiggdGhpcy5idXR0b24ubGVmdEJvdHRvbSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IG9mIGl0ZW1zIHRoYXQgY29ycmVzcG9uZCB0byBhIHZhbHVlLiBJZiB0aGUgc2VsZWN0ZWQgaXRlbSBoYXMgdGhpcyB2YWx1ZSwgaXQncyB5b3VyXG4gICAqIHJlc3BvbnNpYmlsaXR5IHRvIGNoYW5nZSB0aGUgUHJvcGVydHkgdmFsdWUgdG8gc29tZXRoaW5nIGVsc2UuIE90aGVyd2lzZSwgdGhlIGNvbWJvIGJveCBidXR0b24gd2lsbCBjb250aW51ZVxuICAgKiB0byBkaXNwbGF5IHRoaXMgdmFsdWUuXG4gICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIENvbWJvQm94SXRlbVxuICAgKiBAcGFyYW0gdmlzaWJsZVxuICAgKi9cbiAgcHVibGljIHNldEl0ZW1WaXNpYmxlKCB2YWx1ZTogVCwgdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RCb3guc2V0SXRlbVZpc2libGUoIHZhbHVlLCB2aXNpYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGl0ZW0gdGhhdCBjb3JyZXNwb25kcyB0byBhIHZhbHVlIHZpc2libGUgd2hlbiB0aGUgbGlzdGJveCBpcyBwb3BwZWQgdXA/XG4gICAqIEBwYXJhbSB2YWx1ZSAtIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIENvbWJvQm94SXRlbVxuICAgKi9cbiAgcHVibGljIGlzSXRlbVZpc2libGUoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpc3RCb3guaXNJdGVtVmlzaWJsZSggdmFsdWUgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TWF4SXRlbVdpZHRoUHJvcGVydHkoIG5vZGVzOiBOb2RlW10gKTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiB7XG4gICAgY29uc3Qgd2lkdGhQcm9wZXJ0aWVzID0gXy5mbGF0dGVuKCBub2Rlcy5tYXAoIG5vZGUgPT4ge1xuICAgICAgY29uc3QgcHJvcGVydGllczogVFJlYWRPbmx5UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+W10gPSBbIG5vZGUuYm91bmRzUHJvcGVydHkgXTtcbiAgICAgIGlmICggZXh0ZW5kc1dpZHRoU2l6YWJsZSggbm9kZSApICkge1xuICAgICAgICBwcm9wZXJ0aWVzLnB1c2goIG5vZGUuaXNXaWR0aFJlc2l6YWJsZVByb3BlcnR5ICk7XG4gICAgICAgIHByb3BlcnRpZXMucHVzaCggbm9kZS5taW5pbXVtV2lkdGhQcm9wZXJ0eSApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3BlcnRpZXM7XG4gICAgfSApICk7XG4gICAgcmV0dXJuIERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIHdpZHRoUHJvcGVydGllcywgKCkgPT4ge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KCAuLi5ub2Rlcy5tYXAoIG5vZGUgPT4gaXNXaWR0aFNpemFibGUoIG5vZGUgKSA/IG5vZGUubWluaW11bVdpZHRoIHx8IDAgOiBub2RlLndpZHRoICkgKTtcbiAgICB9ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldE1heEl0ZW1IZWlnaHRQcm9wZXJ0eSggbm9kZXM6IE5vZGVbXSApOiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+IHtcbiAgICBjb25zdCBoZWlnaHRQcm9wZXJ0aWVzID0gbm9kZXMubWFwKCBub2RlID0+IG5vZGUuYm91bmRzUHJvcGVydHkgKTtcbiAgICByZXR1cm4gRGVyaXZlZFByb3BlcnR5LmRlcml2ZUFueSggaGVpZ2h0UHJvcGVydGllcywgKCkgPT4ge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KCAuLi5ub2Rlcy5tYXAoIG5vZGUgPT4gbm9kZS5oZWlnaHQgKSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgQ29tYm9Cb3hJTyA9IG5ldyBJT1R5cGUoICdDb21ib0JveElPJywge1xuICAgIHZhbHVlVHlwZTogQ29tYm9Cb3gsXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgY29tYm8gYm94IGlzIGNvbXBvc2VkIG9mIGEgcHVzaCBidXR0b24gYW5kIGEgbGlzdGJveC4gVGhlIGxpc3Rib3ggY29udGFpbnMgaXRlbXMgdGhhdCByZXByZXNlbnQgJyArXG4gICAgICAgICAgICAgICAgICAgJ2Nob2ljZXMuIFByZXNzaW5nIHRoZSBidXR0b24gcG9wcyB1cCB0aGUgbGlzdGJveC4gU2VsZWN0aW5nIGZyb20gYW4gaXRlbSBpbiB0aGUgbGlzdGJveCBzZXRzIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAndmFsdWUgb2YgYW4gYXNzb2NpYXRlZCBQcm9wZXJ0eS4gVGhlIGJ1dHRvbiBzaG93cyB0aGUgaXRlbSB0aGF0IGlzIGN1cnJlbnRseSBzZWxlY3RlZC4nLFxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU8sXG4gICAgZXZlbnRzOiBbICdsaXN0Qm94U2hvd24nLCAnbGlzdEJveEhpZGRlbicgXVxuICB9ICk7XG59XG5cbnN1bi5yZWdpc3RlciggJ0NvbWJvQm94JywgQ29tYm9Cb3ggKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiRGVyaXZlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwiZG90UmFuZG9tIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImV4dGVuZHNXaWR0aFNpemFibGUiLCJGb2N1c01hbmFnZXIiLCJpc1dpZHRoU2l6YWJsZSIsIk1hdHJpeEJldHdlZW5Qcm9wZXJ0eSIsIk5vZGUiLCJQRE9NUGVlciIsIlBET01VdGlscyIsIldpZHRoU2l6YWJsZSIsInNoYXJlZFNvdW5kUGxheWVycyIsIkV2ZW50VHlwZSIsIlRhbmRlbSIsIklPVHlwZSIsIkNvbWJvQm94QnV0dG9uIiwiQ29tYm9Cb3hMaXN0Qm94IiwiZ2V0R3JvdXBJdGVtTm9kZXMiLCJzdW4iLCJTdW5Db25zdGFudHMiLCJMSVNUX1BPU0lUSU9OX1ZBTFVFUyIsIkFMSUdOX1ZBTFVFUyIsIklURU1fVEFOREVNX05BTUVfU1VGRklYIiwiQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIiwibm9kZSIsIm9wdGlvbnMiLCJhY2Nlc3NpYmxlTmFtZSIsIm90aGVyTm9kZUNhbGxiYWNrcyIsInB1c2giLCJidXR0b24iLCJIRUxQX1RFWFRfQkVIQVZJT1IiLCJoZWxwVGV4dCIsIkNvbWJvQm94IiwiZGlzcG9zZSIsImRpc3Bvc2VDb21ib0JveCIsInNob3dMaXN0Qm94IiwibGlzdEJveCIsInZpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwiaGlkZUxpc3RCb3giLCJzY2FsZUxpc3RCb3giLCJsb2NhbEJvdW5kcyIsImlzRW1wdHkiLCJidXR0b25TY2FsZSIsImxvY2FsVG9HbG9iYWxCb3VuZHMiLCJ3aWR0aCIsImxpc3RCb3hTY2FsZSIsInNjYWxlIiwic2NhbGVBbmRQb3NpdGlvbkxpc3RCb3giLCJsaXN0Qm94TWF0cml4IiwibGlzdFBvc2l0aW9uIiwibGVmdEJvdHRvbSIsInRpbWVzVmVjdG9yMiIsImxlZnRUb3AiLCJzZXRJdGVtVmlzaWJsZSIsInZpc2libGUiLCJpc0l0ZW1WaXNpYmxlIiwiZ2V0TWF4SXRlbVdpZHRoUHJvcGVydHkiLCJub2RlcyIsIndpZHRoUHJvcGVydGllcyIsIl8iLCJmbGF0dGVuIiwibWFwIiwicHJvcGVydGllcyIsImJvdW5kc1Byb3BlcnR5IiwiaXNXaWR0aFJlc2l6YWJsZVByb3BlcnR5IiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJkZXJpdmVBbnkiLCJNYXRoIiwibWF4IiwibWluaW11bVdpZHRoIiwiZ2V0TWF4SXRlbUhlaWdodFByb3BlcnR5IiwiaGVpZ2h0UHJvcGVydGllcyIsImhlaWdodCIsInByb3BlcnR5IiwiaXRlbXMiLCJsaXN0UGFyZW50IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93IiwiYXNzZXJ0IiwidW5pcUJ5IiwiaXRlbSIsImxlbmd0aCIsImZvckVhY2giLCJ0YW5kZW1OYW1lIiwiZW5kc1dpdGgiLCJtYXhXaWR0aCIsImFsaWduIiwibGFiZWxYU3BhY2luZyIsImRpc2FibGVkT3BhY2l0eSIsImNvcm5lclJhZGl1cyIsImhpZ2hsaWdodEZpbGwiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJ1dHRvbkZpbGwiLCJidXR0b25TdHJva2UiLCJidXR0b25MaW5lV2lkdGgiLCJidXR0b25Ub3VjaEFyZWFYRGlsYXRpb24iLCJidXR0b25Ub3VjaEFyZWFZRGlsYXRpb24iLCJidXR0b25Nb3VzZUFyZWFYRGlsYXRpb24iLCJidXR0b25Nb3VzZUFyZWFZRGlsYXRpb24iLCJsaXN0RmlsbCIsImxpc3RTdHJva2UiLCJsaXN0TGluZVdpZHRoIiwib3BlbmVkU291bmRQbGF5ZXIiLCJnZXQiLCJjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyIiwidGFnTmFtZSIsImJ1dHRvbkxhYmVsVGFnTmFtZSIsImFjY2Vzc2libGVOYW1lQmVoYXZpb3IiLCJoZWxwVGV4dEJlaGF2aW9yIiwiY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybiIsIlZBTFVFX05BTUVEX1BMQUNFSE9MREVSIiwiY29tYm9Cb3hWb2ljaW5nQ29udGV4dFJlc3BvbnNlIiwiY29tYm9Cb3hWb2ljaW5nSGludFJlc3BvbnNlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIkNvbWJvQm94SU8iLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0V2ZW50VHlwZSIsIlVTRVIiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiY3JlYXRlVGFuZGVtIiwiaSIsImZpbmRTdHJpbmdQcm9wZXJ0eSIsImhhc1BET01Db250ZW50IiwiaW5jbHVkZXMiLCJhcnJvd0RpcmVjdGlvbiIsImJhc2VDb2xvciIsInN0cm9rZSIsImxpbmVXaWR0aCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsIm1vdXNlQXJlYVhEaWxhdGlvbiIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsImxvY2FsTWluaW11bVdpZHRoUHJvcGVydHkiLCJsYWJlbFRhZ05hbWUiLCJhZGRDaGlsZCIsImJpbmQiLCJibG9ja05leHRWb2ljaW5nRm9jdXNMaXN0ZW5lciIsImZvY3VzIiwiZmlsbCIsImNvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucyIsInZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwiYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMiLCJvdGhlck5vZGUiLCJvdGhlckVsZW1lbnROYW1lIiwiTEFCRUxfU0lCTElORyIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsInBkb21PcmRlciIsImxpc3RCb3hNYXRyaXhQcm9wZXJ0eSIsImZyb21Db29yZGluYXRlRnJhbWUiLCJ0b0Nvb3JkaW5hdGVGcmFtZSIsIm11bHRpbGluayIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJtYXRyaXgiLCJvcGFjaXR5UHJvcGVydHkiLCJsaW5rIiwib3BhY2l0eSIsIm11dGF0ZSIsIlZBTElEQVRJT04iLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsImFkZExpc3RlbmVyIiwiZm9jdXNMaXN0SXRlbU5vZGUiLCJkaXNwbGF5IiwiY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciIsImRvd24iLCJldmVudCIsInBoZXQiLCJjaGlwcGVyIiwiaXNGdXp6RW5hYmxlZCIsIm5leHREb3VibGUiLCJ0cmFpbCIsImNvbnRhaW5zTm9kZSIsImRpc21pc3NXaXRoRm9jdXNMaXN0ZW5lciIsInBkb21Gb2N1c1Byb3BlcnR5IiwibW92ZVRvRnJvbnQiLCJnZXRVbmlxdWVUcmFpbCIsInJvb3ROb2RlIiwiZ2V0Um9vdGVkRGlzcGxheXMiLCJhZGRJbnB1dExpc3RlbmVyIiwiaGFzSW5wdXRMaXN0ZW5lciIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkaXNwbGF5T25seVByb3BlcnR5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImRpc3BsYXlPbmx5Iiwic2V0RGlzcGxheU9ubHkiLCJwaWNrYWJsZSIsImFkZExpbmtlZEVsZW1lbnQiLCJ1bmxpbmsiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwic3VwZXJ0eXBlIiwiTm9kZUlPIiwiZXZlbnRzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxlQUFlLDZCQUE2QjtBQUluRCxPQUFPQyxlQUFlLDRCQUE0QjtBQUVsRCxPQUFPQyxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQWUsa0NBQWtDO0FBR3hELFNBQWtCQyxtQkFBbUIsRUFBU0MsWUFBWSxFQUFFQyxjQUFjLEVBQUVDLHFCQUFxQixFQUFFQyxJQUFJLEVBQXFDQyxRQUFRLEVBQUVDLFNBQVMsRUFBeUVDLFlBQVksUUFBNkIsOEJBQThCO0FBQy9TLE9BQU9DLHdCQUF3Qix1Q0FBdUM7QUFFdEUsT0FBT0MsZUFBZSwrQkFBK0I7QUFDckQsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsWUFBWSxrQ0FBa0M7QUFFckQsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyxxQkFBcUIsdUJBQXVCO0FBRW5ELFNBQTJCQyxpQkFBaUIsUUFBUSx3QkFBd0I7QUFDNUUsT0FBT0MsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFFN0MsUUFBUTtBQUNSLE1BQU1DLHVCQUF1QjtJQUFFO0lBQVM7Q0FBUyxFQUFXLGdEQUFnRDtBQUM1RyxNQUFNQyxlQUFlO0lBQUU7SUFBUTtJQUFTO0NBQVUsRUFBVywwQ0FBMEM7QUFFdkcsdURBQXVEO0FBQ3ZELE1BQU1DLDBCQUEwQjtBQXlCaEMsb0hBQW9IO0FBQ3BILHdFQUF3RTtBQUN4RSxNQUFNQywyQkFBaUQsQ0FBRUMsTUFBTUMsU0FBU0MsZ0JBQWdCQztJQUN0RkEsbUJBQW1CQyxJQUFJLENBQUU7UUFDckJKLEtBQTRCSyxNQUFNLENBQUNILGNBQWMsR0FBR0E7SUFDeEQ7SUFDQSxPQUFPRDtBQUNUO0FBQ0EsTUFBTUsscUJBQTJDLENBQUVOLE1BQU1DLFNBQVNNLFVBQVVKO0lBQzFFQSxtQkFBbUJDLElBQUksQ0FBRTtRQUNyQkosS0FBNEJLLE1BQU0sQ0FBQ0UsUUFBUSxHQUFHQTtJQUNsRDtJQUNBLE9BQU9OO0FBQ1Q7QUFpRWUsSUFBQSxBQUFNTyxXQUFOLE1BQU1BLGlCQUFvQnRCLGFBQWNIO0lBb1RyQzBCLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsZUFBZTtRQUNwQixLQUFLLENBQUNEO0lBQ1I7SUFFQTs7R0FFQyxHQUNELEFBQU9FLGNBQW9CO1FBQ3pCLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxlQUFlLENBQUNDLEtBQUssR0FBRztJQUN2QztJQUVBOztHQUVDLEdBQ0QsQUFBT0MsY0FBb0I7UUFDekIsSUFBSSxDQUFDSCxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHO0lBQ3ZDO0lBRUE7Ozs7R0FJQyxHQUNELEFBQVFFLGVBQXFCO1FBRTNCLDRHQUE0RztRQUM1RyxJQUFLLENBQUMsSUFBSSxDQUFDSixPQUFPLENBQUNLLFdBQVcsQ0FBQ0MsT0FBTyxJQUFLO1lBQ3pDLE1BQU1DLGNBQWMsSUFBSSxDQUFDZCxNQUFNLENBQUNlLG1CQUFtQixDQUFFLElBQUksQ0FBQ2YsTUFBTSxDQUFDWSxXQUFXLEVBQUdJLEtBQUssR0FBRyxJQUFJLENBQUNoQixNQUFNLENBQUNZLFdBQVcsQ0FBQ0ksS0FBSztZQUNwSCxNQUFNQyxlQUFlLElBQUksQ0FBQ1YsT0FBTyxDQUFDUSxtQkFBbUIsQ0FBRSxJQUFJLENBQUNSLE9BQU8sQ0FBQ0ssV0FBVyxFQUFHSSxLQUFLLEdBQUcsSUFBSSxDQUFDVCxPQUFPLENBQUNLLFdBQVcsQ0FBQ0ksS0FBSztZQUN4SCxJQUFJLENBQUNULE9BQU8sQ0FBQ1csS0FBSyxDQUFFSixjQUFjRztRQUNwQztJQUNGO0lBRVFFLHdCQUF5QkMsYUFBNkIsRUFBUztRQUNyRSxJQUFLQSxlQUFnQjtZQUVuQixvQ0FBb0M7WUFDcEMsSUFBSSxDQUFDVCxZQUFZO1lBRWpCLElBQUssSUFBSSxDQUFDVSxZQUFZLEtBQUssU0FBVTtnQkFDbkMsSUFBSSxDQUFDZCxPQUFPLENBQUNlLFVBQVUsR0FBR0YsY0FBY0csWUFBWSxDQUFFLElBQUksQ0FBQ3ZCLE1BQU0sQ0FBQ3dCLE9BQU87WUFDM0UsT0FDSztnQkFDSCxJQUFJLENBQUNqQixPQUFPLENBQUNpQixPQUFPLEdBQUdKLGNBQWNHLFlBQVksQ0FBRSxJQUFJLENBQUN2QixNQUFNLENBQUNzQixVQUFVO1lBQzNFO1FBQ0Y7SUFDRjtJQUVBOzs7Ozs7R0FNQyxHQUNELEFBQU9HLGVBQWdCaEIsS0FBUSxFQUFFaUIsT0FBZ0IsRUFBUztRQUN4RCxJQUFJLENBQUNuQixPQUFPLENBQUNrQixjQUFjLENBQUVoQixPQUFPaUI7SUFDdEM7SUFFQTs7O0dBR0MsR0FDRCxBQUFPQyxjQUFlbEIsS0FBUSxFQUFZO1FBQ3hDLE9BQU8sSUFBSSxDQUFDRixPQUFPLENBQUNvQixhQUFhLENBQUVsQjtJQUNyQztJQUVBLE9BQWNtQix3QkFBeUJDLEtBQWEsRUFBOEI7UUFDaEYsTUFBTUMsa0JBQWtCQyxFQUFFQyxPQUFPLENBQUVILE1BQU1JLEdBQUcsQ0FBRXRDLENBQUFBO1lBQzVDLE1BQU11QyxhQUFrRDtnQkFBRXZDLEtBQUt3QyxjQUFjO2FBQUU7WUFDL0UsSUFBSzdELG9CQUFxQnFCLE9BQVM7Z0JBQ2pDdUMsV0FBV25DLElBQUksQ0FBRUosS0FBS3lDLHdCQUF3QjtnQkFDOUNGLFdBQVduQyxJQUFJLENBQUVKLEtBQUswQyxvQkFBb0I7WUFDNUM7WUFDQSxPQUFPSDtRQUNUO1FBQ0EsT0FBT2pFLGdCQUFnQnFFLFNBQVMsQ0FBRVIsaUJBQWlCO1lBQ2pELE9BQU9TLEtBQUtDLEdBQUcsSUFBS1gsTUFBTUksR0FBRyxDQUFFdEMsQ0FBQUEsT0FBUW5CLGVBQWdCbUIsUUFBU0EsS0FBSzhDLFlBQVksSUFBSSxJQUFJOUMsS0FBS3FCLEtBQUs7UUFDckc7SUFDRjtJQUVBLE9BQWMwQix5QkFBMEJiLEtBQWEsRUFBOEI7UUFDakYsTUFBTWMsbUJBQW1CZCxNQUFNSSxHQUFHLENBQUV0QyxDQUFBQSxPQUFRQSxLQUFLd0MsY0FBYztRQUMvRCxPQUFPbEUsZ0JBQWdCcUUsU0FBUyxDQUFFSyxrQkFBa0I7WUFDbEQsT0FBT0osS0FBS0MsR0FBRyxJQUFLWCxNQUFNSSxHQUFHLENBQUV0QyxDQUFBQSxPQUFRQSxLQUFLaUQsTUFBTTtRQUNwRDtJQUNGO0lBNVdBOzs7OztHQUtDLEdBQ0QsWUFBb0JDLFFBQTJCLEVBQUVDLEtBQXdCLEVBQUVDLFVBQWdCLEVBQUVDLGVBQWlDLENBQUc7WUE0UXJIQyxzQ0FBQUEsc0JBQUFBO1FBMVFWQyxVQUFVQSxPQUFRbkIsRUFBRW9CLE1BQU0sQ0FBRUwsT0FBTyxDQUFFTSxPQUEyQkEsS0FBSzNDLEtBQUssRUFBRzRDLE1BQU0sS0FBS1AsTUFBTU8sTUFBTSxFQUNsRztRQUNGSCxVQUFVSixNQUFNUSxPQUFPLENBQUVGLENBQUFBO1lBQ3ZCRixVQUFVQSxPQUFRLENBQUNFLEtBQUtHLFVBQVUsSUFBSUgsS0FBS0csVUFBVSxDQUFDQyxRQUFRLENBQUUvRCwwQkFDOUQsQ0FBQyx1Q0FBdUMsRUFBRUEsd0JBQXdCLEdBQUcsRUFBRTJELEtBQUtHLFVBQVUsRUFBRTtRQUM1RjtRQUVBLGlEQUFpRDtRQUNqREwsVUFBVUEsT0FBUUgsV0FBV1UsUUFBUSxLQUFLLE1BQ3hDO1FBRUYsTUFBTTdELFVBQVV2QixZQUEwRDtZQUV4RXFGLE9BQU87WUFDUHJDLGNBQWM7WUFDZHNDLGVBQWU7WUFDZkMsaUJBQWlCO1lBQ2pCQyxjQUFjO1lBQ2RDLGVBQWU7WUFDZkMsU0FBUztZQUNUQyxTQUFTO1lBRVQsU0FBUztZQUNUQyxZQUFZO1lBQ1pDLGNBQWM7WUFDZEMsaUJBQWlCO1lBQ2pCQywwQkFBMEI7WUFDMUJDLDBCQUEwQjtZQUMxQkMsMEJBQTBCO1lBQzFCQywwQkFBMEI7WUFFMUIsT0FBTztZQUNQQyxVQUFVO1lBQ1ZDLFlBQVk7WUFDWkMsZUFBZTtZQUVmQyxtQkFBbUI3RixtQkFBbUI4RixHQUFHLENBQUU7WUFDM0NDLDJCQUEyQi9GLG1CQUFtQjhGLEdBQUcsQ0FBRTtZQUVuRCxPQUFPO1lBQ1BFLFNBQVM7WUFDVEMsb0JBQW9CO1lBQ3BCQyx3QkFBd0J0RjtZQUN4QnVGLGtCQUFrQmhGO1lBRWxCaUYsb0NBQW9DNUYsYUFBYTZGLHVCQUF1QjtZQUN4RUMsZ0NBQWdDO1lBQ2hDQyw2QkFBNkI7WUFFN0IsVUFBVTtZQUNWQyxRQUFRdEcsT0FBT3VHLFFBQVE7WUFDdkJDLGtCQUFrQjtZQUNsQkMsWUFBWXRGLFNBQVN1RixVQUFVO1lBQy9CQyxnQkFBZ0I7WUFDaEJDLGlCQUFpQjdHLFVBQVU4RyxJQUFJO1lBQy9CQyx3QkFBd0I7Z0JBQUVILGdCQUFnQjtZQUFLO1lBQy9DSSxtQ0FBbUMsS0FBSyx3REFBd0Q7UUFDbEcsR0FBRy9DO1FBRUgsTUFBTW5CLFFBQVF6QyxrQkFBbUIwRCxPQUFPbEQsUUFBUTBGLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFO1FBRXJFLDRHQUE0RztRQUM1Ryw0R0FBNEc7UUFDNUdsRCxNQUFNUSxPQUFPLENBQUksQ0FBRUYsTUFBTTZDO1lBQ3ZCLElBQUssQ0FBQzdDLEtBQUt2RCxjQUFjLEVBQUc7Z0JBQzFCdUQsS0FBS3ZELGNBQWMsR0FBR2pCLFVBQVVzSCxrQkFBa0IsQ0FBRXJFLEtBQUssQ0FBRW9FLEVBQUc7WUFDaEU7UUFDRjtRQUVBL0MsVUFBVXJCLE1BQU15QixPQUFPLENBQUUzRCxDQUFBQTtZQUN2QnVELFVBQVVBLE9BQVEsQ0FBQ3ZELEtBQUt3RyxjQUFjLEVBQUUsdURBQ0EsMEVBQ0E7UUFDMUM7UUFFQSx5QkFBeUI7UUFDekJqRCxVQUFVQSxPQUFRdEQsUUFBUW1FLE9BQU8sR0FBRyxLQUFLbkUsUUFBUW9FLE9BQU8sR0FBRyxHQUN6RCxDQUFDLDZCQUE2QixFQUFFcEUsUUFBUW1FLE9BQU8sQ0FBQyxVQUFVLEVBQUVuRSxRQUFRb0UsT0FBTyxFQUFFO1FBQy9FZCxVQUFVQSxPQUFRbkIsRUFBRXFFLFFBQVEsQ0FBRTdHLHNCQUFzQkssUUFBUXlCLFlBQVksR0FDdEUsQ0FBQyxzQkFBc0IsRUFBRXpCLFFBQVF5QixZQUFZLEVBQUU7UUFDakQ2QixVQUFVQSxPQUFRbkIsRUFBRXFFLFFBQVEsQ0FBRTVHLGNBQWNJLFFBQVE4RCxLQUFLLEdBQ3ZELENBQUMsZUFBZSxFQUFFOUQsUUFBUThELEtBQUssRUFBRTtRQUVuQyxLQUFLO1FBRUwsSUFBSSxDQUFDN0IsS0FBSyxHQUFHQTtRQUViLElBQUksQ0FBQ1IsWUFBWSxHQUFHekIsUUFBUXlCLFlBQVk7UUFFeEMsSUFBSSxDQUFDckIsTUFBTSxHQUFHLElBQUlkLGVBQWdCMkQsVUFBVUMsT0FBT2pCLE9BQU87WUFDeEQ2QixPQUFPOUQsUUFBUThELEtBQUs7WUFDcEIyQyxnQkFBZ0IsQUFBRXpHLFFBQVF5QixZQUFZLEtBQUssVUFBWSxTQUFTO1lBQ2hFd0MsY0FBY2pFLFFBQVFpRSxZQUFZO1lBQ2xDRSxTQUFTbkUsUUFBUW1FLE9BQU87WUFDeEJDLFNBQVNwRSxRQUFRb0UsT0FBTztZQUN4QnNDLFdBQVcxRyxRQUFRcUUsVUFBVTtZQUM3QnNDLFFBQVEzRyxRQUFRc0UsWUFBWTtZQUM1QnNDLFdBQVc1RyxRQUFRdUUsZUFBZTtZQUNsQ3NDLG9CQUFvQjdHLFFBQVF3RSx3QkFBd0I7WUFDcERzQyxvQkFBb0I5RyxRQUFReUUsd0JBQXdCO1lBQ3BEc0Msb0JBQW9CL0csUUFBUTBFLHdCQUF3QjtZQUNwRHNDLG9CQUFvQmhILFFBQVEyRSx3QkFBd0I7WUFDcERzQyw2QkFBNkIsSUFBSSxDQUFDQSwyQkFBMkI7WUFDN0RDLDJCQUEyQixJQUFJLENBQUNBLHlCQUF5QjtZQUV6RDVCLG9DQUFvQ3RGLFFBQVFzRixrQ0FBa0M7WUFFOUUsb0ZBQW9GO1lBQ3BGNkIsY0FBY25ILFFBQVFtRixrQkFBa0I7WUFFeEMsVUFBVTtZQUNWTyxRQUFRMUYsUUFBUTBGLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFO1FBQ3ZDO1FBQ0EsSUFBSSxDQUFDZ0IsUUFBUSxDQUFFLElBQUksQ0FBQ2hILE1BQU07UUFFMUIsSUFBSSxDQUFDTyxPQUFPLEdBQUcsSUFBSXBCLGdCQUFpQjBELFVBQVVDLE9BQU9qQixPQUNuRCxJQUFJLENBQUNuQixXQUFXLENBQUN1RyxJQUFJLENBQUUsSUFBSSxHQUMzQjtZQUNFLElBQUksQ0FBQ2pILE1BQU0sQ0FBQ2tILDZCQUE2QjtZQUN6QyxJQUFJLENBQUNsSCxNQUFNLENBQUNtSCxLQUFLO1FBQ25CLEdBQ0EsSUFBSSxDQUFDbkgsTUFBTSxFQUNYSixRQUFRMEYsTUFBTSxDQUFDVSxZQUFZLENBQUUsWUFBYTtZQUN4Q3RDLE9BQU85RCxRQUFROEQsS0FBSztZQUNwQkksZUFBZWxFLFFBQVFrRSxhQUFhO1lBQ3BDQyxTQUFTbkUsUUFBUW1FLE9BQU87WUFDeEJDLFNBQVNwRSxRQUFRb0UsT0FBTztZQUN4QkgsY0FBY2pFLFFBQVFpRSxZQUFZO1lBQ2xDdUQsTUFBTXhILFFBQVE0RSxRQUFRO1lBQ3RCK0IsUUFBUTNHLFFBQVE2RSxVQUFVO1lBQzFCK0IsV0FBVzVHLFFBQVE4RSxhQUFhO1lBQ2hDaEQsU0FBUztZQUVUMkYsNkJBQTZCO2dCQUMzQm5DLG9DQUFvQ3RGLFFBQVFzRixrQ0FBa0M7Z0JBQzlFb0Msd0JBQXdCMUgsUUFBUXdGLDhCQUE4QjtnQkFDOURtQyxxQkFBcUIzSCxRQUFReUYsMkJBQTJCO1lBQzFEO1lBRUEsbUJBQW1CO1lBQ25CVixtQkFBbUIvRSxRQUFRK0UsaUJBQWlCO1lBQzVDRSwyQkFBMkJqRixRQUFRaUYseUJBQXlCO1lBRTVELE9BQU87WUFDUCx3REFBd0Q7WUFDeEQyQyw0QkFBNEI7Z0JBQUU7b0JBQzVCQyxXQUFXLElBQUksQ0FBQ3pILE1BQU07b0JBQ3RCMEgsa0JBQWtCL0ksU0FBU2dKLGFBQWE7b0JBQ3hDQyxpQkFBaUJqSixTQUFTa0osZUFBZTtnQkFDM0M7YUFBRztRQUNMO1FBQ0Y5RSxXQUFXaUUsUUFBUSxDQUFFLElBQUksQ0FBQ3pHLE9BQU87UUFDakMsSUFBSSxDQUFDd0MsVUFBVSxHQUFHQTtRQUVsQiwyRkFBMkY7UUFDM0YsSUFBSSxDQUFDK0UsU0FBUyxHQUFHO1lBQUU7WUFBTSxJQUFJLENBQUN2SCxPQUFPO1NBQUU7UUFFdkMsTUFBTXdILHdCQUF3QixJQUFJdEosc0JBQXVCLElBQUksQ0FBQ3VCLE1BQU0sRUFBRSxJQUFJLENBQUMrQyxVQUFVLEVBQUU7WUFDckZpRixxQkFBcUI7WUFDckJDLG1CQUFtQjtRQUNyQjtRQUVBL0osVUFBVWdLLFNBQVMsQ0FBRTtZQUFFSDtZQUF1QixJQUFJLENBQUMvSCxNQUFNLENBQUNtSSxtQkFBbUI7WUFBRSxJQUFJLENBQUM1SCxPQUFPLENBQUM0SCxtQkFBbUI7U0FBRSxFQUMvR0MsQ0FBQUE7WUFDRSxJQUFJLENBQUNqSCx1QkFBdUIsQ0FBRWlIO1FBQ2hDO1FBRUYsMkdBQTJHO1FBQzNHLGdGQUFnRjtRQUNoRixJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsSUFBSSxDQUFFQyxDQUFBQTtZQUFhLElBQUksQ0FBQ2hJLE9BQU8sQ0FBQzhILGVBQWUsQ0FBQzVILEtBQUssR0FBRzhIO1FBQVM7UUFFdEYsSUFBSSxDQUFDQyxNQUFNLENBQUU1STtRQUViLElBQUtzRCxVQUFVbEUsT0FBT3lKLFVBQVUsSUFBSSxJQUFJLENBQUNDLG9CQUFvQixJQUFLO1lBQ2hFNUYsTUFBTVEsT0FBTyxDQUFFRixDQUFBQTtnQkFDYkYsVUFBVUEsT0FBUUUsS0FBS0csVUFBVSxLQUFLLE1BQU0sQ0FBQywwRUFBMEUsRUFBRUgsS0FBSzNDLEtBQUssRUFBRTtZQUN2STtRQUNGO1FBRUEsNERBQTREO1FBQzVELElBQUksQ0FBQ1QsTUFBTSxDQUFDMkksV0FBVyxDQUFFO1lBQ3ZCLElBQUksQ0FBQ3BJLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUNGLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxLQUFLO1lBQ3hFLElBQUksQ0FBQ0YsT0FBTyxDQUFDQyxlQUFlLENBQUNDLEtBQUssSUFBSSxJQUFJLENBQUNGLE9BQU8sQ0FBQ3FJLGlCQUFpQixDQUFFL0YsU0FBU3BDLEtBQUs7UUFDdEY7UUFFQSxJQUFJLENBQUNvSSxPQUFPLEdBQUc7UUFFZixJQUFJLENBQUNDLHNCQUFzQixHQUFHO1lBQzVCQyxNQUFNQyxDQUFBQTtnQkFFSiw4R0FBOEc7Z0JBQzlHLHdHQUF3RztnQkFDeEcsMkdBQTJHO2dCQUMzRyx3RkFBd0Y7Z0JBQ3hGLElBQUssQ0FBQ0MsS0FBS0MsT0FBTyxDQUFDQyxhQUFhLE1BQU1oTCxVQUFVaUwsVUFBVSxLQUFLLE9BQVE7b0JBRXJFLG9GQUFvRjtvQkFDcEYsSUFBSyxDQUFHSixDQUFBQSxNQUFNSyxLQUFLLENBQUNDLFlBQVksQ0FBRSxJQUFJLENBQUN0SixNQUFNLEtBQU1nSixNQUFNSyxLQUFLLENBQUNDLFlBQVksQ0FBRSxJQUFJLENBQUMvSSxPQUFPLENBQUMsR0FBTTt3QkFDOUYsSUFBSSxDQUFDRyxXQUFXO29CQUNsQjtnQkFDRjtZQUNGO1FBQ0Y7UUFFQSxJQUFJLENBQUM2SSx3QkFBd0IsR0FBR3BDLENBQUFBO1lBQzlCLElBQUtBLFNBQVMsQ0FBQ0EsTUFBTWtDLEtBQUssQ0FBQ0MsWUFBWSxDQUFFLElBQUksQ0FBQy9JLE9BQU8sR0FBSztnQkFDeEQsSUFBSSxDQUFDRyxXQUFXO1lBQ2xCO1FBQ0Y7UUFDQW5DLGFBQWFpTCxpQkFBaUIsQ0FBQ2xCLElBQUksQ0FBRSxJQUFJLENBQUNpQix3QkFBd0I7UUFFbEUsSUFBSSxDQUFDaEosT0FBTyxDQUFDQyxlQUFlLENBQUM4SCxJQUFJLENBQUU1RyxDQUFBQTtZQUNqQyxJQUFLQSxTQUFVO2dCQUViLG9CQUFvQjtnQkFDcEIsSUFBSSxDQUFDZixZQUFZO2dCQUNqQixJQUFJLENBQUNKLE9BQU8sQ0FBQ2tKLFdBQVc7Z0JBRXhCLGdDQUFnQztnQkFDaEN2RyxVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDMkYsT0FBTyxFQUFFO2dCQUNqQyxJQUFJLENBQUNBLE9BQU8sR0FBRyxJQUFJLENBQUNhLGNBQWMsR0FBR0MsUUFBUSxHQUFHQyxpQkFBaUIsRUFBRSxDQUFFLEVBQUc7Z0JBQ3hFLElBQUksQ0FBQ2YsT0FBTyxDQUFDZ0IsZ0JBQWdCLENBQUUsSUFBSSxDQUFDZixzQkFBc0I7WUFDNUQsT0FDSztnQkFFSCxnQ0FBZ0M7Z0JBQ2hDLElBQUssSUFBSSxDQUFDRCxPQUFPLElBQUksSUFBSSxDQUFDQSxPQUFPLENBQUNpQixnQkFBZ0IsQ0FBRSxJQUFJLENBQUNoQixzQkFBc0IsR0FBSztvQkFDbEYsSUFBSSxDQUFDRCxPQUFPLENBQUNrQixtQkFBbUIsQ0FBRSxJQUFJLENBQUNqQixzQkFBc0I7b0JBQzdELElBQUksQ0FBQ0QsT0FBTyxHQUFHO2dCQUNqQjtZQUNGO1FBQ0Y7UUFFQSxJQUFJLENBQUNtQixtQkFBbUIsR0FBRyxJQUFJaE0sZ0JBQWlCLE9BQU87WUFDckRzSCxRQUFRMUYsUUFBUTBGLE1BQU0sQ0FBQ1UsWUFBWSxDQUFFO1lBQ3JDTCxnQkFBZ0I7WUFDaEJzRSxxQkFBcUIsZ0RBQ0E7UUFDdkI7UUFDQSxJQUFJLENBQUNELG1CQUFtQixDQUFDMUIsSUFBSSxDQUFFNEIsQ0FBQUE7WUFDN0IsSUFBSSxDQUFDeEosV0FBVztZQUNoQixJQUFJLENBQUNWLE1BQU0sQ0FBQ21LLGNBQWMsQ0FBRUQ7WUFDNUIsSUFBSSxDQUFDRSxRQUFRLEdBQUcsQ0FBQ0Y7UUFDbkI7UUFFQSxJQUFJLENBQUNHLGdCQUFnQixDQUFFeEgsVUFBVTtZQUMvQlUsWUFBWTtRQUNkO1FBRUEsSUFBSSxDQUFDbEQsZUFBZSxHQUFHO1lBQ3JCMEgsc0JBQXNCM0gsT0FBTztZQUU3QixJQUFLLElBQUksQ0FBQ3lJLE9BQU8sSUFBSSxJQUFJLENBQUNBLE9BQU8sQ0FBQ2lCLGdCQUFnQixDQUFFLElBQUksQ0FBQ2hCLHNCQUFzQixHQUFLO2dCQUNsRixJQUFJLENBQUNELE9BQU8sQ0FBQ2tCLG1CQUFtQixDQUFFLElBQUksQ0FBQ2pCLHNCQUFzQjtZQUMvRDtZQUVBdkssYUFBYWlMLGlCQUFpQixDQUFDYyxNQUFNLENBQUUsSUFBSSxDQUFDZix3QkFBd0I7WUFFcEUsMkJBQTJCO1lBQzNCLElBQUksQ0FBQ1MsbUJBQW1CLENBQUM1SixPQUFPLElBQUksNkJBQTZCO1lBQ2pFLElBQUksQ0FBQ0csT0FBTyxDQUFDSCxPQUFPO1lBQ3BCLElBQUksQ0FBQ0osTUFBTSxDQUFDSSxPQUFPO1lBQ25CeUIsTUFBTXlCLE9BQU8sQ0FBRTNELENBQUFBLE9BQVFBLEtBQUtTLE9BQU87UUFDckM7UUFFQSxtR0FBbUc7UUFDbkc4QyxZQUFVRCxlQUFBQSxPQUFPZ0csSUFBSSxzQkFBWGhHLHVCQUFBQSxhQUFhaUcsT0FBTyxzQkFBcEJqRyx1Q0FBQUEscUJBQXNCc0gsZUFBZSxxQkFBckN0SCxxQ0FBdUN1SCxNQUFNLEtBQUlwTSxpQkFBaUJxTSxlQUFlLENBQUUsT0FBTyxZQUFZLElBQUk7SUFDdEg7QUFtR0Y7QUFyWnFCdEssU0E2WUx1RixhQUFhLElBQUl6RyxPQUFRLGNBQWM7SUFDbkR5TCxXQUFXdks7SUFDWHdLLGVBQWUsdUdBQ0Esc0dBQ0E7SUFDZkMsV0FBV2xNLEtBQUttTSxNQUFNO0lBQ3RCQyxRQUFRO1FBQUU7UUFBZ0I7S0FBaUI7QUFDN0M7QUFwWkYsU0FBcUIzSyxzQkFxWnBCO0FBRURkLElBQUkwTCxRQUFRLENBQUUsWUFBWTVLIn0=