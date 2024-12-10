// Copyright 2019-2024, University of Colorado Boulder
/**
 * The popup list box for a ComboBox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { KeyboardListener, KeyboardUtils, SceneryEvent, VBox } from '../../scenery/js/imports.js';
import multiSelectionSoundPlayerFactory from '../../tambo/js/multiSelectionSoundPlayerFactory.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import Tandem from '../../tandem/js/Tandem.js';
import ComboBox from './ComboBox.js';
import ComboBoxListItemNode from './ComboBoxListItemNode.js';
import Panel from './Panel.js';
import sun from './sun.js';
let ComboBoxListBox = class ComboBoxListBox extends Panel {
    dispose() {
        this.disposeComboBoxListBox();
        super.dispose();
    }
    /**
   * Sets the visibility of one or more items in the listbox that correspond to a value. Assumes that each item
   * in the listbox has a unique value.
   * @param value - the value associated with the ComboBoxItem
   * @param visible
   */ setItemVisible(value, visible) {
        this.getListItemNode(value).visible = visible;
    }
    /**
   * Is the item that corresponds to a value visible when the listbox is popped up?
   * @param value - the value associated with the ComboBoxItem
   */ isItemVisible(value) {
        return this.getListItemNode(value).visible;
    }
    /**
   * Returns all list item Nodes, as children of the list box content in the correct order which may have changed
   * from PhET-iO.
   */ getAllListItemNodes() {
        return this.content.children;
    }
    /**
   * Returns an array containing all the visible list item Nodes in top-to-bottom order.
   */ getVisibleListItemNodes() {
        return this.getAllListItemNodes().filter((child)=>child.visible);
    }
    /**
   * Gets the ComboBoxListItemNode that corresponds to a specified value. Assumes that values are unique.
   */ getListItemNode(value) {
        const listItemNode = _.find(this.getAllListItemNodes(), (listItemNode)=>listItemNode.item.value === value);
        assert && assert(listItemNode, `no item found for value: ${value}`);
        assert && assert(listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode'); // eslint-disable-line phet/no-simple-type-checking-assertions
        return listItemNode;
    }
    /**
   * Gets the item in the ComboBox that currently has focus.
   */ getFocusedItemNode() {
        const listItemNode = _.find(this.getAllListItemNodes(), (listItemNode)=>listItemNode.focused);
        assert && assert(listItemNode, 'no item found that has focus');
        assert && assert(listItemNode instanceof ComboBoxListItemNode, 'invalid listItemNode'); // eslint-disable-line phet/no-simple-type-checking-assertions
        return listItemNode;
    }
    /**
   * Focuses the ComboBoxListItemNode that corresponds to a specified value. If the item for that value is not
   * visible, focus is placed on the first visible item.
   */ focusListItemNode(value) {
        let listItemNode = this.getListItemNode(value);
        // If the item Node is not visible, just place focus on the first available item.
        if (!listItemNode.visible) {
            listItemNode = _.find(this.getAllListItemNodes(), (listItemNode)=>listItemNode.visible);
        }
        if (listItemNode) {
            listItemNode.supplyOpenResponseOnNextFocus();
            listItemNode.focus();
        }
    }
    /**
   * voice the response from selecting a new item Node. The response will differ depending on if the selection
   * changed the Property.
   */ voiceOnNewSelection(newValue, oldValue, listItemNode) {
        const responseOptions = {
            nameResponse: listItemNode.voicingNameResponse,
            objectResponse: null,
            contextResponse: listItemNode.voicingContextResponse,
            hintResponse: null
        };
        if (oldValue === newValue) {
            // If there is no change in value, then there is no context response
            responseOptions.contextResponse = null;
        }
        // Voice through this node since the listItemNode is about to be hidden (setting it to voicingVisible:false). See https://github.com/phetsims/ratio-and-proportion/issues/474
        this.voiceOnSelectionNode.voicingSpeakResponse(responseOptions);
    }
    /**
   * @param property
   * @param items
   * @param nodes
   * @param hideListBoxCallback - called to hide the list box
   * @param focusButtonCallback - called to transfer focus to the combo box's button
   * @param voiceOnSelectionNode - Node to voice the response when selecting a combo box item.
   * @param tandem
   * @param providedOptions
   */ constructor(property, items, nodes, hideListBoxCallback, focusButtonCallback, voiceOnSelectionNode, tandem, providedOptions){
        assert && assert(items.length > 0, 'empty list box is not supported');
        const options = optionize()({
            highlightFill: 'rgb( 245, 245, 245 )',
            comboBoxListItemNodeOptions: {},
            // Panel options
            xMargin: 12,
            yMargin: 8,
            backgroundPickable: true,
            // pdom
            tagName: 'ul',
            ariaRole: 'listbox',
            groupFocusHighlight: true,
            openedSoundPlayer: sharedSoundPlayers.get('generalOpen'),
            closedNoChangeSoundPlayer: sharedSoundPlayers.get('generalClose'),
            visiblePropertyOptions: {
                phetioReadOnly: true
            }
        }, providedOptions);
        assert && assert(options.xMargin > 0 && options.yMargin > 0, `margins must be > 0, xMargin=${options.xMargin}, yMargin=${options.yMargin}`);
        //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
        // Pops down the list box and sets the property.value to match the chosen item.
        const fireAction = new PhetioAction((event)=>{
            const listItemNode = event.currentTarget;
            assert && assert(listItemNode instanceof ComboBoxListItemNode, 'expected a ComboBoxListItemNode'); // eslint-disable-line phet/no-simple-type-checking-assertions
            // Update the internal state to reflect the selected Node, but don't update the Property value yet because the
            // focus needs to be shifted first.
            this.selectionOnFireAction = listItemNode;
            const oldValue = property.value;
            // So that something related to the ComboBox has focus before changing Property value.
            // See https://github.com/phetsims/sun/issues/721
            focusButtonCallback();
            // It is now safe to set the value based on which item was chosen in the list box.
            property.value = this.selectionOnFireAction.item.value;
            // hide the list
            hideListBoxCallback();
            this.voiceOnNewSelection(property.value, oldValue, listItemNode);
            // prevent nodes (eg, controls) behind the list from receiving the event
            event.abort();
        }, {
            parameters: [
                {
                    phetioPrivate: true,
                    valueType: SceneryEvent
                }
            ],
            // phet-io
            tandem: tandem.createTandem('fireAction'),
            phetioEventType: EventType.USER
        });
        //TODO sun#462 replace fireEmitter and selectionListener with a standard scenery listener
        // Handles selection from the list box.
        const selectionListener = {
            up (event) {
                fireAction.execute(event);
            },
            // Handle keyup on each item in the list box, for a11y.
            keyup: (event)=>{
                if (event.domEvent && KeyboardUtils.isAnyKeyEvent(event.domEvent, [
                    KeyboardUtils.KEY_ENTER,
                    KeyboardUtils.KEY_SPACE
                ])) {
                    fireAction.execute(event);
                }
            },
            // handle activation from an assistive device that may not use a keyboard (such as mobile VoiceOver)
            click: (event)=>{
                fireAction.execute(event);
            }
        };
        // Compute max item size
        const maxItemWidthProperty = ComboBox.getMaxItemWidthProperty(nodes);
        const maxItemHeightProperty = ComboBox.getMaxItemHeightProperty(nodes);
        // Uniform dimensions for all highlighted items in the list, highlight overlaps margin by 50%
        const highlightWidthProperty = new DerivedProperty([
            maxItemWidthProperty
        ], (width)=>width + options.xMargin);
        const highlightHeightProperty = new DerivedProperty([
            maxItemHeightProperty
        ], (width)=>width + options.yMargin);
        // Create a node for each item in the list, and attach a listener.
        const listItemNodes = [];
        items.forEach((item, index)=>{
            // Create the list item node
            const listItemNode = new ComboBoxListItemNode(item, nodes[index], highlightWidthProperty, highlightHeightProperty, combineOptions({
                align: options.align,
                highlightFill: options.highlightFill,
                highlightCornerRadius: options.cornerRadius,
                // highlight overlaps half of margins
                xMargin: 0.5 * options.xMargin,
                tandem: item.tandemName ? tandem.createTandem(item.tandemName) : Tandem.OPTIONAL
            }, options.comboBoxListItemNodeOptions, item.comboBoxListItemNodeOptions));
            listItemNodes.push(listItemNode);
            listItemNode.addInputListener(selectionListener);
        });
        const content = new VBox({
            spacing: 0,
            excludeInvisibleChildrenFromBounds: true,
            children: listItemNodes
        });
        super(content, combineOptions({}, options, {
            // Adjust margins to account for highlight overlap
            xMargin: options.xMargin / 2,
            yMargin: options.yMargin / 2
        }));
        this.content = content;
        this.voiceOnSelectionNode = voiceOnSelectionNode;
        this.selectionOnFireAction = this.getListItemNode(property.value);
        // Create a set of default sound generators, one for each item, to use if the item doesn't provide its own.
        const defaultItemSelectedSoundPlayers = items.map((item)=>multiSelectionSoundPlayerFactory.getSelectionSoundPlayer(items.indexOf(item)));
        // variable for tracking whether the selected value was changed by the user
        let selectionWhenListBoxOpened;
        // sound generation
        this.visibleProperty.lazyLink((visible)=>{
            if (visible) {
                // Play the 'opened' sound when the list box becomes visible.
                options.openedSoundPlayer.play();
                // Keep track of what was selected when the list box was presented.
                selectionWhenListBoxOpened = this.getListItemNode(property.value);
            } else {
                // Verify that the list box became visible before going invisible and the selected value was saved at that time.
                assert && assert(selectionWhenListBoxOpened, 'no Node for when list box was opened');
                // Did the user change the selection in the list box?
                if (selectionWhenListBoxOpened === this.selectionOnFireAction) {
                    // No change.  Play the sound that indicates this.
                    options.closedNoChangeSoundPlayer.play();
                } else {
                    // Play a sound for the selected item.
                    const selectedItem = this.selectionOnFireAction.item;
                    if (selectedItem.soundPlayer) {
                        selectedItem.soundPlayer.play();
                    } else {
                        // The selected item didn't provide a sound player, so use a default based on its position within the list
                        // of visible selections.  With multitouch, it's possible that the selected item may become invisible before
                        // we attempt to play its sound, so play only if it's still visible.
                        // See https://github.com/phetsims/fourier-making-waves/issues/244
                        const selectionIndex = this.getVisibleListItemNodes().indexOf(this.selectionOnFireAction);
                        if (selectionIndex !== -1) {
                            defaultItemSelectedSoundPlayers[selectionIndex].play();
                        }
                    }
                }
            }
        });
        // pdom - listener that navigates listbox items and closes the box from keyboard input
        const keyboardListener = new KeyboardListener({
            keys: [
                'escape',
                'tab',
                'shift+tab',
                'arrowUp',
                'arrowDown',
                'home',
                'end'
            ],
            fire: (event, keysPressed)=>{
                const sceneryEvent = event;
                assert && assert(sceneryEvent, 'event is required for this listener');
                // Only visible item nodes can receive focus - using content children directly because PhET-iO may change their
                // order.
                const visibleItemNodes = this.getVisibleListItemNodes();
                if (keysPressed === 'escape' || keysPressed === 'tab' || keysPressed === 'shift+tab') {
                    // Escape and Tab hide the list box and return focus to the button
                    hideListBoxCallback();
                    focusButtonCallback();
                } else if (keysPressed === 'arrowUp' || keysPressed === 'arrowDown') {
                    const domEvent = event;
                    assert && assert(domEvent, 'domEvent is required for this listener');
                    // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in
                    // full screen mode, see #210
                    domEvent.preventDefault();
                    // Up/down arrow keys move the focus between items in the list box
                    const direction = keysPressed === 'arrowDown' ? 1 : -1;
                    const focusedItemIndex = visibleItemNodes.indexOf(this.getFocusedItemNode());
                    assert && assert(focusedItemIndex > -1, 'how could we receive keydown without a focused list item?');
                    const nextIndex = focusedItemIndex + direction;
                    visibleItemNodes[nextIndex] && visibleItemNodes[nextIndex].focus();
                } else if (keysPressed === 'home') {
                    visibleItemNodes[0].focus();
                } else if (keysPressed === 'end') {
                    visibleItemNodes[visibleItemNodes.length - 1].focus();
                }
            }
        });
        this.addInputListener(keyboardListener);
        this.disposeComboBoxListBox = ()=>{
            for(let i = 0; i < listItemNodes.length; i++){
                listItemNodes[i].dispose(); // to unregister tandem
            }
            this.removeInputListener(keyboardListener);
            keyboardListener.dispose();
            // Private to ComboBoxListBox, but we need to clean up tandem.
            fireAction.dispose();
            maxItemWidthProperty.dispose();
            maxItemHeightProperty.dispose();
        };
    }
};
export { ComboBoxListBox as default };
sun.register('ComboBoxListBox', ComboBoxListBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveExpc3RCb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIHBvcHVwIGxpc3QgYm94IGZvciBhIENvbWJvQm94LlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEtleWJvYXJkTGlzdGVuZXIsIEtleWJvYXJkVXRpbHMsIE5vZGUsIFNjZW5lcnlFdmVudCwgU3BlYWtpbmdPcHRpb25zLCBUSW5wdXRMaXN0ZW5lciwgVFBhaW50LCBWQm94LCBWb2ljaW5nTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkgZnJvbSAnLi4vLi4vdGFtYm8vanMvbXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkuanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBQaGV0aW9BY3Rpb24gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0FjdGlvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IENvbWJvQm94LCB7IENvbWJvQm94SXRlbU5vTm9kZSB9IGZyb20gJy4vQ29tYm9Cb3guanMnO1xuaW1wb3J0IENvbWJvQm94TGlzdEl0ZW1Ob2RlLCB7IENvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucyB9IGZyb20gJy4vQ29tYm9Cb3hMaXN0SXRlbU5vZGUuanMnO1xuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4vUGFuZWwuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gZmlsbCBmb3IgdGhlIGhpZ2hsaWdodCBiZWhpbmQgaXRlbXMgaW4gdGhlIGxpc3RcbiAgaGlnaGxpZ2h0RmlsbD86IFRQYWludDtcblxuICAvLyBPcHRpb25zIHRoYXQgYXBwbHkgdG8gZXZlcnkgQ29tYm9Cb3hJdGVtTm9kZSBjcmVhdGVkIGluIHRoZSBsaXN0XG4gIGNvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucz86IENvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucztcblxuICAvLyBTb3VuZCBnZW5lcmF0b3JzIGZvciB3aGVuIGNvbWJvIGJveCBpcyBvcGVuZWQgYW5kIHdoZW4gaXQgaXMgY2xvc2VkIHdpdGggbm8gY2hhbmdlLiBDbG9zaW5nICp3aXRoKlxuICAvLyBhIGNoYW5nZSBpcyBjb3ZlcmVkIGJ5IGluZGl2aWR1YWwgY29tYm8gYm94IGl0ZW1zLlxuICBvcGVuZWRTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbiAgY2xvc2VkTm9DaGFuZ2VTb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbn07XG5cbmV4cG9ydCB0eXBlIENvbWJvQm94TGlzdEJveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYm9Cb3hMaXN0Qm94PFQ+IGV4dGVuZHMgUGFuZWwge1xuXG4gIC8vIFRoZSBjb250YWluZXIgZm9yIGxpc3QgaXRlbXMgd2hpY2ggd2lsbCBiZSBwcm92aWRlZCB0byB0aGUgcGFuZWwuXG4gIHByaXZhdGUgcmVhZG9ubHkgY29udGVudDogTm9kZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VDb21ib0JveExpc3RCb3g6ICgpID0+IHZvaWQ7XG5cbiAgLy8gV2UgbmVlZCBhIHNlcGFyYXRlIG5vZGUgdG8gdm9pY2UgdGhyb3VnaCBiZWNhdXNlIHdoZW4gYSBzZWxlY3Rpb24gb2NjdXJzLCB0aGUgbGlzdCBib3ggaXMgaGlkZGVuLCBzaWxlbmNpbmcgYW55XG4gIC8vIHZvaWNpbmcgcmVzcG9uc2VzIG9jY3VycmluZyB0aHJvdWdoIE5vZGVzIHdpdGhpbiB0aGlzIGNsYXNzLiBUaGlzIHNlbGVjdGlvbiBub2RlIHNob3VsZCBiZSB2aXNpYmxlIHdoZW4gYSBjb21ib1xuICAvLyBib3ggc2VsZWN0aW9uIG9jY3Vycywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yYXRpby1hbmQtcHJvcG9ydGlvbi9pc3N1ZXMvNDc0XG4gIHByaXZhdGUgcmVhZG9ubHkgdm9pY2VPblNlbGVjdGlvbk5vZGU6IFZvaWNpbmdOb2RlO1xuXG4gIC8vIFRoZSBzZWxlY3RlZCBsaXN0IGl0ZW0gbm9kZSBmcm9tIHRoZSBsaXN0IGJveCBhdCB0aGUgc3RhcnQgb2YgdGhlIGZpcmUgYWN0aW9uLiAgVGhpcyBpcyBuZWVkZWQgZm9yIHNvdW5kIGdlbmVyYXRpb25cbiAgLy8gYmVjYXVzZSB0aGUgbWFuYWdlZCBQcm9wZXJ0eSBpc24ndCBhbHdheXMgdXBkYXRlZCB3aGVuIHRoZSBsaXN0IGJveCBpcyBjbG9zZWQuXG4gIHByaXZhdGUgc2VsZWN0aW9uT25GaXJlQWN0aW9uOiBDb21ib0JveExpc3RJdGVtTm9kZTxUPjtcblxuICAvKipcbiAgICogQHBhcmFtIHByb3BlcnR5XG4gICAqIEBwYXJhbSBpdGVtc1xuICAgKiBAcGFyYW0gbm9kZXNcbiAgICogQHBhcmFtIGhpZGVMaXN0Qm94Q2FsbGJhY2sgLSBjYWxsZWQgdG8gaGlkZSB0aGUgbGlzdCBib3hcbiAgICogQHBhcmFtIGZvY3VzQnV0dG9uQ2FsbGJhY2sgLSBjYWxsZWQgdG8gdHJhbnNmZXIgZm9jdXMgdG8gdGhlIGNvbWJvIGJveCdzIGJ1dHRvblxuICAgKiBAcGFyYW0gdm9pY2VPblNlbGVjdGlvbk5vZGUgLSBOb2RlIHRvIHZvaWNlIHRoZSByZXNwb25zZSB3aGVuIHNlbGVjdGluZyBhIGNvbWJvIGJveCBpdGVtLlxuICAgKiBAcGFyYW0gdGFuZGVtXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwcm9wZXJ0eTogVFByb3BlcnR5PFQ+LFxuICAgIGl0ZW1zOiBDb21ib0JveEl0ZW1Ob05vZGU8VD5bXSxcbiAgICBub2RlczogTm9kZVtdLFxuICAgIGhpZGVMaXN0Qm94Q2FsbGJhY2s6ICgpID0+IHZvaWQsXG4gICAgZm9jdXNCdXR0b25DYWxsYmFjazogKCkgPT4gdm9pZCxcbiAgICB2b2ljZU9uU2VsZWN0aW9uTm9kZTogVm9pY2luZ05vZGUsXG4gICAgdGFuZGVtOiBUYW5kZW0sXG4gICAgcHJvdmlkZWRPcHRpb25zPzogQ29tYm9Cb3hMaXN0Qm94T3B0aW9uc1xuICApIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGl0ZW1zLmxlbmd0aCA+IDAsICdlbXB0eSBsaXN0IGJveCBpcyBub3Qgc3VwcG9ydGVkJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb21ib0JveExpc3RCb3hPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFuZWxPcHRpb25zPigpKCB7XG4gICAgICBoaWdobGlnaHRGaWxsOiAncmdiKCAyNDUsIDI0NSwgMjQ1ICknLFxuICAgICAgY29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zOiB7fSxcblxuICAgICAgLy8gUGFuZWwgb3B0aW9uc1xuICAgICAgeE1hcmdpbjogMTIsXG4gICAgICB5TWFyZ2luOiA4LFxuICAgICAgYmFja2dyb3VuZFBpY2thYmxlOiB0cnVlLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAndWwnLFxuICAgICAgYXJpYVJvbGU6ICdsaXN0Ym94JyxcbiAgICAgIGdyb3VwRm9jdXNIaWdobGlnaHQ6IHRydWUsXG5cbiAgICAgIG9wZW5lZFNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAnZ2VuZXJhbE9wZW4nICksXG4gICAgICBjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAnZ2VuZXJhbENsb3NlJyApLFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9XG5cbiAgICAgIC8vIE5vdCBpbnN0cnVtZW50ZWQgZm9yIFBoRVQtaU8gYmVjYXVzZSB0aGUgbGlzdCdzIHBvc2l0aW9uIGlzbid0IHZhbGlkIHVudGlsIGl0IGhhcyBiZWVuIHBvcHBlZCB1cC5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTEwMlxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy54TWFyZ2luID4gMCAmJiBvcHRpb25zLnlNYXJnaW4gPiAwLFxuICAgICAgYG1hcmdpbnMgbXVzdCBiZSA+IDAsIHhNYXJnaW49JHtvcHRpb25zLnhNYXJnaW59LCB5TWFyZ2luPSR7b3B0aW9ucy55TWFyZ2lufWAgKTtcblxuICAgIC8vVE9ETyBzdW4jNDYyIHJlcGxhY2UgZmlyZUVtaXR0ZXIgYW5kIHNlbGVjdGlvbkxpc3RlbmVyIHdpdGggYSBzdGFuZGFyZCBzY2VuZXJ5IGxpc3RlbmVyXG4gICAgLy8gUG9wcyBkb3duIHRoZSBsaXN0IGJveCBhbmQgc2V0cyB0aGUgcHJvcGVydHkudmFsdWUgdG8gbWF0Y2ggdGhlIGNob3NlbiBpdGVtLlxuICAgIGNvbnN0IGZpcmVBY3Rpb24gPSBuZXcgUGhldGlvQWN0aW9uPFsgU2NlbmVyeUV2ZW50PE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50IHwgUG9pbnRlckV2ZW50IHwgS2V5Ym9hcmRFdmVudD4gXT4oIGV2ZW50ID0+IHtcblxuICAgICAgY29uc3QgbGlzdEl0ZW1Ob2RlID0gZXZlbnQuY3VycmVudFRhcmdldCBhcyBDb21ib0JveExpc3RJdGVtTm9kZTxUPjtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RJdGVtTm9kZSBpbnN0YW5jZW9mIENvbWJvQm94TGlzdEl0ZW1Ob2RlLCAnZXhwZWN0ZWQgYSBDb21ib0JveExpc3RJdGVtTm9kZScgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L25vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcblxuICAgICAgLy8gVXBkYXRlIHRoZSBpbnRlcm5hbCBzdGF0ZSB0byByZWZsZWN0IHRoZSBzZWxlY3RlZCBOb2RlLCBidXQgZG9uJ3QgdXBkYXRlIHRoZSBQcm9wZXJ0eSB2YWx1ZSB5ZXQgYmVjYXVzZSB0aGVcbiAgICAgIC8vIGZvY3VzIG5lZWRzIHRvIGJlIHNoaWZ0ZWQgZmlyc3QuXG4gICAgICB0aGlzLnNlbGVjdGlvbk9uRmlyZUFjdGlvbiA9IGxpc3RJdGVtTm9kZTtcblxuICAgICAgY29uc3Qgb2xkVmFsdWUgPSBwcm9wZXJ0eS52YWx1ZTtcblxuICAgICAgLy8gU28gdGhhdCBzb21ldGhpbmcgcmVsYXRlZCB0byB0aGUgQ29tYm9Cb3ggaGFzIGZvY3VzIGJlZm9yZSBjaGFuZ2luZyBQcm9wZXJ0eSB2YWx1ZS5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy83MjFcbiAgICAgIGZvY3VzQnV0dG9uQ2FsbGJhY2soKTtcblxuICAgICAgLy8gSXQgaXMgbm93IHNhZmUgdG8gc2V0IHRoZSB2YWx1ZSBiYXNlZCBvbiB3aGljaCBpdGVtIHdhcyBjaG9zZW4gaW4gdGhlIGxpc3QgYm94LlxuICAgICAgcHJvcGVydHkudmFsdWUgPSB0aGlzLnNlbGVjdGlvbk9uRmlyZUFjdGlvbi5pdGVtLnZhbHVlO1xuXG4gICAgICAvLyBoaWRlIHRoZSBsaXN0XG4gICAgICBoaWRlTGlzdEJveENhbGxiYWNrKCk7XG5cbiAgICAgIHRoaXMudm9pY2VPbk5ld1NlbGVjdGlvbiggcHJvcGVydHkudmFsdWUsIG9sZFZhbHVlLCBsaXN0SXRlbU5vZGUgKTtcblxuICAgICAgLy8gcHJldmVudCBub2RlcyAoZWcsIGNvbnRyb2xzKSBiZWhpbmQgdGhlIGxpc3QgZnJvbSByZWNlaXZpbmcgdGhlIGV2ZW50XG4gICAgICBldmVudC5hYm9ydCgpO1xuICAgIH0sIHtcbiAgICAgIHBhcmFtZXRlcnM6IFsgeyBwaGV0aW9Qcml2YXRlOiB0cnVlLCB2YWx1ZVR5cGU6IFNjZW5lcnlFdmVudCB9IF0sXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpcmVBY3Rpb24nICksXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXG4gICAgfSApO1xuXG4gICAgLy9UT0RPIHN1biM0NjIgcmVwbGFjZSBmaXJlRW1pdHRlciBhbmQgc2VsZWN0aW9uTGlzdGVuZXIgd2l0aCBhIHN0YW5kYXJkIHNjZW5lcnkgbGlzdGVuZXJcbiAgICAvLyBIYW5kbGVzIHNlbGVjdGlvbiBmcm9tIHRoZSBsaXN0IGJveC5cbiAgICBjb25zdCBzZWxlY3Rpb25MaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgPSB7XG5cbiAgICAgIHVwKCBldmVudCApIHtcbiAgICAgICAgZmlyZUFjdGlvbi5leGVjdXRlKCBldmVudCApO1xuICAgICAgfSxcblxuICAgICAgLy8gSGFuZGxlIGtleXVwIG9uIGVhY2ggaXRlbSBpbiB0aGUgbGlzdCBib3gsIGZvciBhMTF5LlxuICAgICAga2V5dXA6IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCBldmVudC5kb21FdmVudCAmJiBLZXlib2FyZFV0aWxzLmlzQW55S2V5RXZlbnQoIGV2ZW50LmRvbUV2ZW50LCBbIEtleWJvYXJkVXRpbHMuS0VZX0VOVEVSLCBLZXlib2FyZFV0aWxzLktFWV9TUEFDRSBdICkgKSB7XG4gICAgICAgICAgZmlyZUFjdGlvbi5leGVjdXRlKCBldmVudCApO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBoYW5kbGUgYWN0aXZhdGlvbiBmcm9tIGFuIGFzc2lzdGl2ZSBkZXZpY2UgdGhhdCBtYXkgbm90IHVzZSBhIGtleWJvYXJkIChzdWNoIGFzIG1vYmlsZSBWb2ljZU92ZXIpXG4gICAgICBjbGljazogZXZlbnQgPT4ge1xuICAgICAgICBmaXJlQWN0aW9uLmV4ZWN1dGUoIGV2ZW50ICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIENvbXB1dGUgbWF4IGl0ZW0gc2l6ZVxuICAgIGNvbnN0IG1heEl0ZW1XaWR0aFByb3BlcnR5ID0gQ29tYm9Cb3guZ2V0TWF4SXRlbVdpZHRoUHJvcGVydHkoIG5vZGVzICk7XG4gICAgY29uc3QgbWF4SXRlbUhlaWdodFByb3BlcnR5ID0gQ29tYm9Cb3guZ2V0TWF4SXRlbUhlaWdodFByb3BlcnR5KCBub2RlcyApO1xuXG4gICAgLy8gVW5pZm9ybSBkaW1lbnNpb25zIGZvciBhbGwgaGlnaGxpZ2h0ZWQgaXRlbXMgaW4gdGhlIGxpc3QsIGhpZ2hsaWdodCBvdmVybGFwcyBtYXJnaW4gYnkgNTAlXG4gICAgY29uc3QgaGlnaGxpZ2h0V2lkdGhQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbWF4SXRlbVdpZHRoUHJvcGVydHkgXSwgd2lkdGggPT4gd2lkdGggKyBvcHRpb25zLnhNYXJnaW4gKTtcbiAgICBjb25zdCBoaWdobGlnaHRIZWlnaHRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbWF4SXRlbUhlaWdodFByb3BlcnR5IF0sIHdpZHRoID0+IHdpZHRoICsgb3B0aW9ucy55TWFyZ2luICk7XG5cbiAgICAvLyBDcmVhdGUgYSBub2RlIGZvciBlYWNoIGl0ZW0gaW4gdGhlIGxpc3QsIGFuZCBhdHRhY2ggYSBsaXN0ZW5lci5cbiAgICBjb25zdCBsaXN0SXRlbU5vZGVzOiBDb21ib0JveExpc3RJdGVtTm9kZTxUPltdID0gW107XG4gICAgaXRlbXMuZm9yRWFjaCggKCBpdGVtLCBpbmRleCApID0+IHtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBsaXN0IGl0ZW0gbm9kZVxuICAgICAgY29uc3QgbGlzdEl0ZW1Ob2RlID0gbmV3IENvbWJvQm94TGlzdEl0ZW1Ob2RlKCBpdGVtLCBub2Rlc1sgaW5kZXggXSwgaGlnaGxpZ2h0V2lkdGhQcm9wZXJ0eSwgaGlnaGxpZ2h0SGVpZ2h0UHJvcGVydHksXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPENvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucz4oIHtcbiAgICAgICAgICBhbGlnbjogb3B0aW9ucy5hbGlnbixcbiAgICAgICAgICBoaWdobGlnaHRGaWxsOiBvcHRpb25zLmhpZ2hsaWdodEZpbGwsXG4gICAgICAgICAgaGlnaGxpZ2h0Q29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1cyxcblxuICAgICAgICAgIC8vIGhpZ2hsaWdodCBvdmVybGFwcyBoYWxmIG9mIG1hcmdpbnNcbiAgICAgICAgICB4TWFyZ2luOiAwLjUgKiBvcHRpb25zLnhNYXJnaW4sXG5cbiAgICAgICAgICB0YW5kZW06IGl0ZW0udGFuZGVtTmFtZSA/IHRhbmRlbS5jcmVhdGVUYW5kZW0oIGl0ZW0udGFuZGVtTmFtZSApIDogVGFuZGVtLk9QVElPTkFMXG4gICAgICAgIH0sIG9wdGlvbnMuY29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zLCBpdGVtLmNvbWJvQm94TGlzdEl0ZW1Ob2RlT3B0aW9ucyApICk7XG4gICAgICBsaXN0SXRlbU5vZGVzLnB1c2goIGxpc3RJdGVtTm9kZSApO1xuXG4gICAgICBsaXN0SXRlbU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggc2VsZWN0aW9uTGlzdGVuZXIgKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcbiAgICAgIHNwYWNpbmc6IDAsXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxuICAgICAgY2hpbGRyZW46IGxpc3RJdGVtTm9kZXNcbiAgICB9ICk7XG5cbiAgICBzdXBlciggY29udGVudCwgY29tYmluZU9wdGlvbnM8UGFuZWxPcHRpb25zPigge30sIG9wdGlvbnMsIHtcbiAgICAgIC8vIEFkanVzdCBtYXJnaW5zIHRvIGFjY291bnQgZm9yIGhpZ2hsaWdodCBvdmVybGFwXG4gICAgICB4TWFyZ2luOiBvcHRpb25zLnhNYXJnaW4gLyAyLFxuICAgICAgeU1hcmdpbjogb3B0aW9ucy55TWFyZ2luIC8gMlxuICAgIH0gKSApO1xuXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudDtcblxuICAgIHRoaXMudm9pY2VPblNlbGVjdGlvbk5vZGUgPSB2b2ljZU9uU2VsZWN0aW9uTm9kZTtcblxuICAgIHRoaXMuc2VsZWN0aW9uT25GaXJlQWN0aW9uID0gdGhpcy5nZXRMaXN0SXRlbU5vZGUoIHByb3BlcnR5LnZhbHVlICk7XG5cbiAgICAvLyBDcmVhdGUgYSBzZXQgb2YgZGVmYXVsdCBzb3VuZCBnZW5lcmF0b3JzLCBvbmUgZm9yIGVhY2ggaXRlbSwgdG8gdXNlIGlmIHRoZSBpdGVtIGRvZXNuJ3QgcHJvdmlkZSBpdHMgb3duLlxuICAgIGNvbnN0IGRlZmF1bHRJdGVtU2VsZWN0ZWRTb3VuZFBsYXllcnMgPSBpdGVtcy5tYXAoIGl0ZW0gPT5cbiAgICAgIG11bHRpU2VsZWN0aW9uU291bmRQbGF5ZXJGYWN0b3J5LmdldFNlbGVjdGlvblNvdW5kUGxheWVyKCBpdGVtcy5pbmRleE9mKCBpdGVtICkgKVxuICAgICk7XG5cbiAgICAvLyB2YXJpYWJsZSBmb3IgdHJhY2tpbmcgd2hldGhlciB0aGUgc2VsZWN0ZWQgdmFsdWUgd2FzIGNoYW5nZWQgYnkgdGhlIHVzZXJcbiAgICBsZXQgc2VsZWN0aW9uV2hlbkxpc3RCb3hPcGVuZWQ6IENvbWJvQm94TGlzdEl0ZW1Ob2RlPFQ+O1xuXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvblxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB2aXNpYmxlID0+IHtcblxuICAgICAgaWYgKCB2aXNpYmxlICkge1xuXG4gICAgICAgIC8vIFBsYXkgdGhlICdvcGVuZWQnIHNvdW5kIHdoZW4gdGhlIGxpc3QgYm94IGJlY29tZXMgdmlzaWJsZS5cbiAgICAgICAgb3B0aW9ucy5vcGVuZWRTb3VuZFBsYXllci5wbGF5KCk7XG5cbiAgICAgICAgLy8gS2VlcCB0cmFjayBvZiB3aGF0IHdhcyBzZWxlY3RlZCB3aGVuIHRoZSBsaXN0IGJveCB3YXMgcHJlc2VudGVkLlxuICAgICAgICBzZWxlY3Rpb25XaGVuTGlzdEJveE9wZW5lZCA9IHRoaXMuZ2V0TGlzdEl0ZW1Ob2RlKCBwcm9wZXJ0eS52YWx1ZSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIGxpc3QgYm94IGJlY2FtZSB2aXNpYmxlIGJlZm9yZSBnb2luZyBpbnZpc2libGUgYW5kIHRoZSBzZWxlY3RlZCB2YWx1ZSB3YXMgc2F2ZWQgYXQgdGhhdCB0aW1lLlxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWxlY3Rpb25XaGVuTGlzdEJveE9wZW5lZCwgJ25vIE5vZGUgZm9yIHdoZW4gbGlzdCBib3ggd2FzIG9wZW5lZCcgKTtcblxuICAgICAgICAvLyBEaWQgdGhlIHVzZXIgY2hhbmdlIHRoZSBzZWxlY3Rpb24gaW4gdGhlIGxpc3QgYm94P1xuICAgICAgICBpZiAoIHNlbGVjdGlvbldoZW5MaXN0Qm94T3BlbmVkID09PSB0aGlzLnNlbGVjdGlvbk9uRmlyZUFjdGlvbiApIHtcblxuICAgICAgICAgIC8vIE5vIGNoYW5nZS4gIFBsYXkgdGhlIHNvdW5kIHRoYXQgaW5kaWNhdGVzIHRoaXMuXG4gICAgICAgICAgb3B0aW9ucy5jbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgIC8vIFBsYXkgYSBzb3VuZCBmb3IgdGhlIHNlbGVjdGVkIGl0ZW0uXG4gICAgICAgICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3Rpb25PbkZpcmVBY3Rpb24uaXRlbTtcbiAgICAgICAgICBpZiAoIHNlbGVjdGVkSXRlbS5zb3VuZFBsYXllciApIHtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbS5zb3VuZFBsYXllci5wbGF5KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBUaGUgc2VsZWN0ZWQgaXRlbSBkaWRuJ3QgcHJvdmlkZSBhIHNvdW5kIHBsYXllciwgc28gdXNlIGEgZGVmYXVsdCBiYXNlZCBvbiBpdHMgcG9zaXRpb24gd2l0aGluIHRoZSBsaXN0XG4gICAgICAgICAgICAvLyBvZiB2aXNpYmxlIHNlbGVjdGlvbnMuICBXaXRoIG11bHRpdG91Y2gsIGl0J3MgcG9zc2libGUgdGhhdCB0aGUgc2VsZWN0ZWQgaXRlbSBtYXkgYmVjb21lIGludmlzaWJsZSBiZWZvcmVcbiAgICAgICAgICAgIC8vIHdlIGF0dGVtcHQgdG8gcGxheSBpdHMgc291bmQsIHNvIHBsYXkgb25seSBpZiBpdCdzIHN0aWxsIHZpc2libGUuXG4gICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8yNDRcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbkluZGV4ID0gdGhpcy5nZXRWaXNpYmxlTGlzdEl0ZW1Ob2RlcygpLmluZGV4T2YoIHRoaXMuc2VsZWN0aW9uT25GaXJlQWN0aW9uICk7XG4gICAgICAgICAgICBpZiAoIHNlbGVjdGlvbkluZGV4ICE9PSAtMSApIHtcbiAgICAgICAgICAgICAgZGVmYXVsdEl0ZW1TZWxlY3RlZFNvdW5kUGxheWVyc1sgc2VsZWN0aW9uSW5kZXggXS5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gcGRvbSAtIGxpc3RlbmVyIHRoYXQgbmF2aWdhdGVzIGxpc3Rib3ggaXRlbXMgYW5kIGNsb3NlcyB0aGUgYm94IGZyb20ga2V5Ym9hcmQgaW5wdXRcbiAgICBjb25zdCBrZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgIGtleXM6IFsgJ2VzY2FwZScsICd0YWInLCAnc2hpZnQrdGFiJywgJ2Fycm93VXAnLCAnYXJyb3dEb3duJywgJ2hvbWUnLCAnZW5kJyBdLFxuICAgICAgZmlyZTogKCBldmVudCwga2V5c1ByZXNzZWQgKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjZW5lcnlFdmVudCA9IGV2ZW50ITtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NlbmVyeUV2ZW50LCAnZXZlbnQgaXMgcmVxdWlyZWQgZm9yIHRoaXMgbGlzdGVuZXInICk7XG5cbiAgICAgICAgLy8gT25seSB2aXNpYmxlIGl0ZW0gbm9kZXMgY2FuIHJlY2VpdmUgZm9jdXMgLSB1c2luZyBjb250ZW50IGNoaWxkcmVuIGRpcmVjdGx5IGJlY2F1c2UgUGhFVC1pTyBtYXkgY2hhbmdlIHRoZWlyXG4gICAgICAgIC8vIG9yZGVyLlxuICAgICAgICBjb25zdCB2aXNpYmxlSXRlbU5vZGVzID0gdGhpcy5nZXRWaXNpYmxlTGlzdEl0ZW1Ob2RlcygpO1xuXG4gICAgICAgIGlmICgga2V5c1ByZXNzZWQgPT09ICdlc2NhcGUnIHx8IGtleXNQcmVzc2VkID09PSAndGFiJyB8fCBrZXlzUHJlc3NlZCA9PT0gJ3NoaWZ0K3RhYicgKSB7XG5cbiAgICAgICAgICAvLyBFc2NhcGUgYW5kIFRhYiBoaWRlIHRoZSBsaXN0IGJveCBhbmQgcmV0dXJuIGZvY3VzIHRvIHRoZSBidXR0b25cbiAgICAgICAgICBoaWRlTGlzdEJveENhbGxiYWNrKCk7XG4gICAgICAgICAgZm9jdXNCdXR0b25DYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2Fycm93VXAnIHx8IGtleXNQcmVzc2VkID09PSAnYXJyb3dEb3duJyApIHtcbiAgICAgICAgICBjb25zdCBkb21FdmVudCA9IGV2ZW50ITtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21FdmVudCwgJ2RvbUV2ZW50IGlzIHJlcXVpcmVkIGZvciB0aGlzIGxpc3RlbmVyJyApO1xuXG4gICAgICAgICAgLy8gcHJldmVudCBcIm5hdGl2ZVwiIGJlaGF2aW9yIHNvIHRoYXQgU2FmYXJpIGRvZXNuJ3QgbWFrZSBhbiBlcnJvciBzb3VuZCB3aXRoIGFycm93IGtleXMgaW5cbiAgICAgICAgICAvLyBmdWxsIHNjcmVlbiBtb2RlLCBzZWUgIzIxMFxuICAgICAgICAgIGRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAvLyBVcC9kb3duIGFycm93IGtleXMgbW92ZSB0aGUgZm9jdXMgYmV0d2VlbiBpdGVtcyBpbiB0aGUgbGlzdCBib3hcbiAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBrZXlzUHJlc3NlZCA9PT0gJ2Fycm93RG93bicgPyAxIDogLTE7XG4gICAgICAgICAgY29uc3QgZm9jdXNlZEl0ZW1JbmRleCA9IHZpc2libGVJdGVtTm9kZXMuaW5kZXhPZiggdGhpcy5nZXRGb2N1c2VkSXRlbU5vZGUoKSApO1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvY3VzZWRJdGVtSW5kZXggPiAtMSwgJ2hvdyBjb3VsZCB3ZSByZWNlaXZlIGtleWRvd24gd2l0aG91dCBhIGZvY3VzZWQgbGlzdCBpdGVtPycgKTtcblxuICAgICAgICAgIGNvbnN0IG5leHRJbmRleCA9IGZvY3VzZWRJdGVtSW5kZXggKyBkaXJlY3Rpb247XG4gICAgICAgICAgdmlzaWJsZUl0ZW1Ob2Rlc1sgbmV4dEluZGV4IF0gJiYgdmlzaWJsZUl0ZW1Ob2Rlc1sgbmV4dEluZGV4IF0uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdob21lJyApIHtcbiAgICAgICAgICB2aXNpYmxlSXRlbU5vZGVzWyAwIF0uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgga2V5c1ByZXNzZWQgPT09ICdlbmQnICkge1xuICAgICAgICAgIHZpc2libGVJdGVtTm9kZXNbIHZpc2libGVJdGVtTm9kZXMubGVuZ3RoIC0gMSBdLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCBrZXlib2FyZExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveExpc3RCb3ggPSAoKSA9PiB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0SXRlbU5vZGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBsaXN0SXRlbU5vZGVzWyBpIF0uZGlzcG9zZSgpOyAvLyB0byB1bnJlZ2lzdGVyIHRhbmRlbVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcbiAgICAgIGtleWJvYXJkTGlzdGVuZXIuZGlzcG9zZSgpO1xuXG4gICAgICAvLyBQcml2YXRlIHRvIENvbWJvQm94TGlzdEJveCwgYnV0IHdlIG5lZWQgdG8gY2xlYW4gdXAgdGFuZGVtLlxuICAgICAgZmlyZUFjdGlvbi5kaXNwb3NlKCk7XG5cbiAgICAgIG1heEl0ZW1XaWR0aFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIG1heEl0ZW1IZWlnaHRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNvbWJvQm94TGlzdEJveCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2aXNpYmlsaXR5IG9mIG9uZSBvciBtb3JlIGl0ZW1zIGluIHRoZSBsaXN0Ym94IHRoYXQgY29ycmVzcG9uZCB0byBhIHZhbHVlLiBBc3N1bWVzIHRoYXQgZWFjaCBpdGVtXG4gICAqIGluIHRoZSBsaXN0Ym94IGhhcyBhIHVuaXF1ZSB2YWx1ZS5cbiAgICogQHBhcmFtIHZhbHVlIC0gdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgQ29tYm9Cb3hJdGVtXG4gICAqIEBwYXJhbSB2aXNpYmxlXG4gICAqL1xuICBwdWJsaWMgc2V0SXRlbVZpc2libGUoIHZhbHVlOiBULCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuZ2V0TGlzdEl0ZW1Ob2RlKCB2YWx1ZSApLnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBpdGVtIHRoYXQgY29ycmVzcG9uZHMgdG8gYSB2YWx1ZSB2aXNpYmxlIHdoZW4gdGhlIGxpc3Rib3ggaXMgcG9wcGVkIHVwP1xuICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBDb21ib0JveEl0ZW1cbiAgICovXG4gIHB1YmxpYyBpc0l0ZW1WaXNpYmxlKCB2YWx1ZTogVCApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMaXN0SXRlbU5vZGUoIHZhbHVlICkudmlzaWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBsaXN0IGl0ZW0gTm9kZXMsIGFzIGNoaWxkcmVuIG9mIHRoZSBsaXN0IGJveCBjb250ZW50IGluIHRoZSBjb3JyZWN0IG9yZGVyIHdoaWNoIG1heSBoYXZlIGNoYW5nZWRcbiAgICogZnJvbSBQaEVULWlPLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRBbGxMaXN0SXRlbU5vZGVzKCk6IENvbWJvQm94TGlzdEl0ZW1Ob2RlPFQ+W10ge1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnQuY2hpbGRyZW4gYXMgQ29tYm9Cb3hMaXN0SXRlbU5vZGU8VD5bXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSB2aXNpYmxlIGxpc3QgaXRlbSBOb2RlcyBpbiB0b3AtdG8tYm90dG9tIG9yZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRWaXNpYmxlTGlzdEl0ZW1Ob2RlcygpOiBDb21ib0JveExpc3RJdGVtTm9kZTxUPltdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxMaXN0SXRlbU5vZGVzKCkuZmlsdGVyKCBjaGlsZCA9PiBjaGlsZC52aXNpYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgQ29tYm9Cb3hMaXN0SXRlbU5vZGUgdGhhdCBjb3JyZXNwb25kcyB0byBhIHNwZWNpZmllZCB2YWx1ZS4gQXNzdW1lcyB0aGF0IHZhbHVlcyBhcmUgdW5pcXVlLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRMaXN0SXRlbU5vZGUoIHZhbHVlOiBUICk6IENvbWJvQm94TGlzdEl0ZW1Ob2RlPFQ+IHtcbiAgICBjb25zdCBsaXN0SXRlbU5vZGUgPSBfLmZpbmQoIHRoaXMuZ2V0QWxsTGlzdEl0ZW1Ob2RlcygpLCAoIGxpc3RJdGVtTm9kZTogQ29tYm9Cb3hMaXN0SXRlbU5vZGU8VD4gKSA9PiBsaXN0SXRlbU5vZGUuaXRlbS52YWx1ZSA9PT0gdmFsdWUgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGlzdEl0ZW1Ob2RlLCBgbm8gaXRlbSBmb3VuZCBmb3IgdmFsdWU6ICR7dmFsdWV9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RJdGVtTm9kZSBpbnN0YW5jZW9mIENvbWJvQm94TGlzdEl0ZW1Ob2RlLCAnaW52YWxpZCBsaXN0SXRlbU5vZGUnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9uby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXG4gICAgcmV0dXJuIGxpc3RJdGVtTm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpdGVtIGluIHRoZSBDb21ib0JveCB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMuXG4gICAqL1xuICBwcml2YXRlIGdldEZvY3VzZWRJdGVtTm9kZSgpOiBDb21ib0JveExpc3RJdGVtTm9kZTxUPiB7XG4gICAgY29uc3QgbGlzdEl0ZW1Ob2RlID0gXy5maW5kKCB0aGlzLmdldEFsbExpc3RJdGVtTm9kZXMoKSwgKCBsaXN0SXRlbU5vZGU6IENvbWJvQm94TGlzdEl0ZW1Ob2RlPFQ+ICkgPT4gbGlzdEl0ZW1Ob2RlLmZvY3VzZWQgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGlzdEl0ZW1Ob2RlLCAnbm8gaXRlbSBmb3VuZCB0aGF0IGhhcyBmb2N1cycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaXN0SXRlbU5vZGUgaW5zdGFuY2VvZiBDb21ib0JveExpc3RJdGVtTm9kZSwgJ2ludmFsaWQgbGlzdEl0ZW1Ob2RlJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuICAgIHJldHVybiBsaXN0SXRlbU5vZGU7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgQ29tYm9Cb3hMaXN0SXRlbU5vZGUgdGhhdCBjb3JyZXNwb25kcyB0byBhIHNwZWNpZmllZCB2YWx1ZS4gSWYgdGhlIGl0ZW0gZm9yIHRoYXQgdmFsdWUgaXMgbm90XG4gICAqIHZpc2libGUsIGZvY3VzIGlzIHBsYWNlZCBvbiB0aGUgZmlyc3QgdmlzaWJsZSBpdGVtLlxuICAgKi9cbiAgcHVibGljIGZvY3VzTGlzdEl0ZW1Ob2RlKCB2YWx1ZTogVCApOiB2b2lkIHtcbiAgICBsZXQgbGlzdEl0ZW1Ob2RlOiBDb21ib0JveExpc3RJdGVtTm9kZTxUPiB8IHVuZGVmaW5lZCA9IHRoaXMuZ2V0TGlzdEl0ZW1Ob2RlKCB2YWx1ZSApO1xuXG4gICAgLy8gSWYgdGhlIGl0ZW0gTm9kZSBpcyBub3QgdmlzaWJsZSwganVzdCBwbGFjZSBmb2N1cyBvbiB0aGUgZmlyc3QgYXZhaWxhYmxlIGl0ZW0uXG4gICAgaWYgKCAhbGlzdEl0ZW1Ob2RlLnZpc2libGUgKSB7XG4gICAgICBsaXN0SXRlbU5vZGUgPSBfLmZpbmQoIHRoaXMuZ2V0QWxsTGlzdEl0ZW1Ob2RlcygpLCAoIGxpc3RJdGVtTm9kZTogQ29tYm9Cb3hMaXN0SXRlbU5vZGU8VD4gKSA9PiBsaXN0SXRlbU5vZGUudmlzaWJsZSApO1xuICAgIH1cblxuICAgIGlmICggbGlzdEl0ZW1Ob2RlICkge1xuICAgICAgbGlzdEl0ZW1Ob2RlLnN1cHBseU9wZW5SZXNwb25zZU9uTmV4dEZvY3VzKCk7XG4gICAgICBsaXN0SXRlbU5vZGUuZm9jdXMoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdm9pY2UgdGhlIHJlc3BvbnNlIGZyb20gc2VsZWN0aW5nIGEgbmV3IGl0ZW0gTm9kZS4gVGhlIHJlc3BvbnNlIHdpbGwgZGlmZmVyIGRlcGVuZGluZyBvbiBpZiB0aGUgc2VsZWN0aW9uXG4gICAqIGNoYW5nZWQgdGhlIFByb3BlcnR5LlxuICAgKi9cbiAgcHJpdmF0ZSB2b2ljZU9uTmV3U2VsZWN0aW9uKCBuZXdWYWx1ZTogVCwgb2xkVmFsdWU6IFQsIGxpc3RJdGVtTm9kZTogQ29tYm9Cb3hMaXN0SXRlbU5vZGU8VD4gKTogdm9pZCB7XG4gICAgY29uc3QgcmVzcG9uc2VPcHRpb25zOiBTcGVha2luZ09wdGlvbnMgPSB7XG4gICAgICBuYW1lUmVzcG9uc2U6IGxpc3RJdGVtTm9kZS52b2ljaW5nTmFtZVJlc3BvbnNlLFxuICAgICAgb2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICBjb250ZXh0UmVzcG9uc2U6IGxpc3RJdGVtTm9kZS52b2ljaW5nQ29udGV4dFJlc3BvbnNlLFxuICAgICAgaGludFJlc3BvbnNlOiBudWxsXG4gICAgfTtcbiAgICBpZiAoIG9sZFZhbHVlID09PSBuZXdWYWx1ZSApIHtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gY2hhbmdlIGluIHZhbHVlLCB0aGVuIHRoZXJlIGlzIG5vIGNvbnRleHQgcmVzcG9uc2VcbiAgICAgIHJlc3BvbnNlT3B0aW9ucy5jb250ZXh0UmVzcG9uc2UgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFZvaWNlIHRocm91Z2ggdGhpcyBub2RlIHNpbmNlIHRoZSBsaXN0SXRlbU5vZGUgaXMgYWJvdXQgdG8gYmUgaGlkZGVuIChzZXR0aW5nIGl0IHRvIHZvaWNpbmdWaXNpYmxlOmZhbHNlKS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yYXRpby1hbmQtcHJvcG9ydGlvbi9pc3N1ZXMvNDc0XG4gICAgdGhpcy52b2ljZU9uU2VsZWN0aW9uTm9kZS52b2ljaW5nU3BlYWtSZXNwb25zZSggcmVzcG9uc2VPcHRpb25zICk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnQ29tYm9Cb3hMaXN0Qm94JywgQ29tYm9Cb3hMaXN0Qm94ICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiS2V5Ym9hcmRMaXN0ZW5lciIsIktleWJvYXJkVXRpbHMiLCJTY2VuZXJ5RXZlbnQiLCJWQm94IiwibXVsdGlTZWxlY3Rpb25Tb3VuZFBsYXllckZhY3RvcnkiLCJzaGFyZWRTb3VuZFBsYXllcnMiLCJFdmVudFR5cGUiLCJQaGV0aW9BY3Rpb24iLCJUYW5kZW0iLCJDb21ib0JveCIsIkNvbWJvQm94TGlzdEl0ZW1Ob2RlIiwiUGFuZWwiLCJzdW4iLCJDb21ib0JveExpc3RCb3giLCJkaXNwb3NlIiwiZGlzcG9zZUNvbWJvQm94TGlzdEJveCIsInNldEl0ZW1WaXNpYmxlIiwidmFsdWUiLCJ2aXNpYmxlIiwiZ2V0TGlzdEl0ZW1Ob2RlIiwiaXNJdGVtVmlzaWJsZSIsImdldEFsbExpc3RJdGVtTm9kZXMiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJnZXRWaXNpYmxlTGlzdEl0ZW1Ob2RlcyIsImZpbHRlciIsImNoaWxkIiwibGlzdEl0ZW1Ob2RlIiwiXyIsImZpbmQiLCJpdGVtIiwiYXNzZXJ0IiwiZ2V0Rm9jdXNlZEl0ZW1Ob2RlIiwiZm9jdXNlZCIsImZvY3VzTGlzdEl0ZW1Ob2RlIiwic3VwcGx5T3BlblJlc3BvbnNlT25OZXh0Rm9jdXMiLCJmb2N1cyIsInZvaWNlT25OZXdTZWxlY3Rpb24iLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwicmVzcG9uc2VPcHRpb25zIiwibmFtZVJlc3BvbnNlIiwidm9pY2luZ05hbWVSZXNwb25zZSIsIm9iamVjdFJlc3BvbnNlIiwiY29udGV4dFJlc3BvbnNlIiwidm9pY2luZ0NvbnRleHRSZXNwb25zZSIsImhpbnRSZXNwb25zZSIsInZvaWNlT25TZWxlY3Rpb25Ob2RlIiwidm9pY2luZ1NwZWFrUmVzcG9uc2UiLCJwcm9wZXJ0eSIsIml0ZW1zIiwibm9kZXMiLCJoaWRlTGlzdEJveENhbGxiYWNrIiwiZm9jdXNCdXR0b25DYWxsYmFjayIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsImxlbmd0aCIsIm9wdGlvbnMiLCJoaWdobGlnaHRGaWxsIiwiY29tYm9Cb3hMaXN0SXRlbU5vZGVPcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJiYWNrZ3JvdW5kUGlja2FibGUiLCJ0YWdOYW1lIiwiYXJpYVJvbGUiLCJncm91cEZvY3VzSGlnaGxpZ2h0Iiwib3BlbmVkU291bmRQbGF5ZXIiLCJnZXQiLCJjbG9zZWROb0NoYW5nZVNvdW5kUGxheWVyIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwiZmlyZUFjdGlvbiIsImV2ZW50IiwiY3VycmVudFRhcmdldCIsInNlbGVjdGlvbk9uRmlyZUFjdGlvbiIsImFib3J0IiwicGFyYW1ldGVycyIsInBoZXRpb1ByaXZhdGUiLCJ2YWx1ZVR5cGUiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwic2VsZWN0aW9uTGlzdGVuZXIiLCJ1cCIsImV4ZWN1dGUiLCJrZXl1cCIsImRvbUV2ZW50IiwiaXNBbnlLZXlFdmVudCIsIktFWV9FTlRFUiIsIktFWV9TUEFDRSIsImNsaWNrIiwibWF4SXRlbVdpZHRoUHJvcGVydHkiLCJnZXRNYXhJdGVtV2lkdGhQcm9wZXJ0eSIsIm1heEl0ZW1IZWlnaHRQcm9wZXJ0eSIsImdldE1heEl0ZW1IZWlnaHRQcm9wZXJ0eSIsImhpZ2hsaWdodFdpZHRoUHJvcGVydHkiLCJ3aWR0aCIsImhpZ2hsaWdodEhlaWdodFByb3BlcnR5IiwibGlzdEl0ZW1Ob2RlcyIsImZvckVhY2giLCJpbmRleCIsImFsaWduIiwiaGlnaGxpZ2h0Q29ybmVyUmFkaXVzIiwiY29ybmVyUmFkaXVzIiwidGFuZGVtTmFtZSIsIk9QVElPTkFMIiwicHVzaCIsImFkZElucHV0TGlzdGVuZXIiLCJzcGFjaW5nIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImRlZmF1bHRJdGVtU2VsZWN0ZWRTb3VuZFBsYXllcnMiLCJtYXAiLCJnZXRTZWxlY3Rpb25Tb3VuZFBsYXllciIsImluZGV4T2YiLCJzZWxlY3Rpb25XaGVuTGlzdEJveE9wZW5lZCIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwicGxheSIsInNlbGVjdGVkSXRlbSIsInNvdW5kUGxheWVyIiwic2VsZWN0aW9uSW5kZXgiLCJrZXlib2FyZExpc3RlbmVyIiwia2V5cyIsImZpcmUiLCJrZXlzUHJlc3NlZCIsInNjZW5lcnlFdmVudCIsInZpc2libGVJdGVtTm9kZXMiLCJwcmV2ZW50RGVmYXVsdCIsImRpcmVjdGlvbiIsImZvY3VzZWRJdGVtSW5kZXgiLCJuZXh0SW5kZXgiLCJpIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFFL0QsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLGtDQUFrQztBQUM1RSxTQUFTQyxnQkFBZ0IsRUFBRUMsYUFBYSxFQUFRQyxZQUFZLEVBQTJDQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUM5SixPQUFPQyxzQ0FBc0MscURBQXFE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