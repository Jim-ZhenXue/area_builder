// Copyright 2024, University of Colorado Boulder
/**
 * This doc assumes you have read the doc in GroupSelectModel. Read that first as it explains the "group select
 * interaction" more generally.
 *
 * The view of the "Group Sort Interaction." This type handles adding the controller for selecting and grabbing
 * in the interaction for (keyboard). It also handles the individual and group focus highlights.
 *
 * This class can be used per scene, but the model is best used per screen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */ import Disposable from '../../../../../axon/js/Disposable.js';
import Emitter from '../../../../../axon/js/Emitter.js';
import Multilink from '../../../../../axon/js/Multilink.js';
import { Shape } from '../../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import { animatedPanZoomSingleton, HighlightFromNode, HighlightPath, isInteractiveHighlighting, KeyboardListener } from '../../../../../scenery/js/imports.js';
import sceneryPhet from '../../../sceneryPhet.js';
import GrabReleaseCueNode from '../../nodes/GrabReleaseCueNode.js';
import SortCueArrowNode from './SortCueArrowNode.js';
function GROUP_SELECT_ACCESSIBLE_NAME_BEHAVIOR(node, options, accessibleName) {
    options.ariaLabel = accessibleName; // IMPORTANT! Divs with innerContent aren't recognized with accessibleNames
    options.innerContent = accessibleName;
    return options;
}
let GroupSelectView = class GroupSelectView extends Disposable {
    // By "change" we mean sort or selection.
    onGroupItemChange(newGroupItem) {
        // When using keyboard input, make sure that the selected group item is still displayed by panning to keep it
        // in view. `panToCenter` is false because centering the group item in the screen is too much movement.
        const node = this.getNodeFromModelItem(newGroupItem);
        node && animatedPanZoomSingleton.listener.panToNode(node, false);
        // Reset to true from keyboard input, in case mouse/touch input set to false during the keyboard interaction.
        this.model.isKeyboardFocusedProperty.value = true;
    }
    dispose() {
        this.groupSortGroupFocusHighlightPath.dispose();
        this.grabReleaseCueNode.dispose();
        this.positionSortCueNodeEmitter.dispose();
        super.dispose();
    }
    /**
   * Use SortCueArrowNode to create a Node for the keyboard sorting cue. Can also be used as the mouse/touch cue
   * Node if desired.
   */ static createSortCueNode(visibleProperty, scale = 1) {
        return new SortCueArrowNode({
            doubleHead: true,
            dashWidth: 3.5 * scale,
            dashHeight: 2.8 * scale,
            numberOfDashes: 3,
            spacing: 2 * scale,
            triangleNodeOptions: {
                triangleWidth: 12 * scale,
                triangleHeight: 11 * scale
            },
            visibleProperty: visibleProperty
        });
    }
    /**
   * Creator factory, similar to PhetioObject.create(). This is most useful if you don't need to keep the instance of
   * your GroupSortInteractionView.
   */ static create(model, primaryFocusedNode, providedOptions) {
        return new GroupSelectView(model, primaryFocusedNode, providedOptions);
    }
    constructor(model, primaryFocusedNode, providedOptions){
        const options = optionize()({
            onGrab: _.noop,
            onRelease: _.noop,
            getHighlightNodeFromModelItem: providedOptions.getNodeFromModelItem,
            // By default, a group item is enabled it if corresponding Node is enabled.
            isGroupItemEnabled: (groupItem)=>{
                const itemNode = providedOptions.getNodeFromModelItem(groupItem);
                assert && assert(itemNode, 'should have a node for the group item');
                return itemNode.enabled;
            },
            primaryFocusedNodeOptions: {
                tagName: 'div',
                focusable: true,
                ariaRole: 'application',
                accessibleNameBehavior: GROUP_SELECT_ACCESSIBLE_NAME_BEHAVIOR
            },
            grabReleaseCueOptions: {}
        }, providedOptions);
        super(options), this.model = model, this.positionSortCueNodeEmitter = new Emitter();
        this.getNodeFromModelItem = options.getNodeFromModelItem;
        const selectedGroupItemProperty = this.model.selectedGroupItemProperty;
        const isKeyboardFocusedProperty = this.model.isKeyboardFocusedProperty;
        const isGroupItemKeyboardGrabbedProperty = this.model.isGroupItemKeyboardGrabbedProperty;
        const hasKeyboardGrabbedGroupItemProperty = this.model.hasKeyboardGrabbedGroupItemProperty;
        // Provide the general accessible content for the provided Node
        primaryFocusedNode.mutate(options.primaryFocusedNodeOptions);
        const grabbedPropertyListener = (grabbed)=>{
            const selectedGroupItem = selectedGroupItemProperty.value;
            if (selectedGroupItem) {
                if (grabbed) {
                    options.onGrab(selectedGroupItem);
                } else {
                    options.onRelease(selectedGroupItem);
                }
            }
        };
        isGroupItemKeyboardGrabbedProperty.lazyLink(grabbedPropertyListener);
        const focusListener = {
            focus: ()=>{
                // It's possible that getGroupItemToSelect's heuristic said that there is nothing to focus here
                if (selectedGroupItemProperty.value === null) {
                    selectedGroupItemProperty.value = options.getGroupItemToSelect();
                }
                isKeyboardFocusedProperty.value = true;
                // When the group receives keyboard focus, make sure that the selected group item is displayed
                if (selectedGroupItemProperty.value !== null) {
                    const node = options.getNodeFromModelItem(selectedGroupItemProperty.value);
                    node && animatedPanZoomSingleton.listener.panToNode(node, true);
                }
            },
            blur: ()=>{
                isKeyboardFocusedProperty.value = false;
                isGroupItemKeyboardGrabbedProperty.value = false;
            },
            over: ()=>{
                // When you mouse over while focused, the highlights are hidden, and so update the state (even though we are
                // still technically keyboard focused). This will assist in showing the mouse cue, https://github.com/phetsims/center-and-variability/issues/406
                isKeyboardFocusedProperty.value = false;
            },
            down: ()=>{
                // We want to remove focus from this node entirely to prevent the focus highlight from showing up when
                // there is no selected group item.
                primaryFocusedNode.blur();
            }
        };
        // When interactive highlights become active on the group, interaction with a mouse has begun while using
        // Interactive Highlighting. When that happens, clear the selection to prevent focus highlight flickering/thrashing.
        // See https://github.com/phetsims/center-and-variability/issues/557 and https://github.com/phetsims/scenery-phet/issues/815
        if (isInteractiveHighlighting(primaryFocusedNode)) {
            const interactiveHighlightingActiveListener = (active)=>{
                if (active) {
                    if (model.selectedGroupItemProperty.value !== null) {
                        // Release the selection if grabbed
                        model.isGroupItemKeyboardGrabbedProperty.value = false;
                        // Clear the selection so that there isn't potential for flickering in between input modalities
                        model.selectedGroupItemProperty.value = null;
                    }
                    // This controls the visibility of interaction cues (keyboard vs mouse), so we need to clear it when
                    // switching interaction modes.
                    isKeyboardFocusedProperty.value = false;
                }
            };
            primaryFocusedNode.isInteractiveHighlightActiveProperty.lazyLink(interactiveHighlightingActiveListener);
            this.disposeEmitter.addListener(()=>{
                primaryFocusedNode.isInteractiveHighlightActiveProperty.unlink(interactiveHighlightingActiveListener);
            });
        }
        const updateFocusHighlight = new Multilink([
            selectedGroupItemProperty,
            isGroupItemKeyboardGrabbedProperty
        ], (selectedGroupItem, isGroupItemGrabbed)=>{
            let focusHighlightSet = false;
            if (selectedGroupItem) {
                const node = options.getHighlightNodeFromModelItem(selectedGroupItem);
                if (node) {
                    const focusForSelectedGroupItem = new HighlightFromNode(node, {
                        dashed: isGroupItemGrabbed
                    });
                    // If available, set to the focused selection for this scene.
                    primaryFocusedNode.setFocusHighlight(focusForSelectedGroupItem);
                    focusHighlightSet = true;
                }
            }
            // If not set above, then actively hide it.
            !focusHighlightSet && primaryFocusedNode.setFocusHighlight('invisible');
            if (selectedGroupItem !== null) {
                this.positionSortCueNodeEmitter.emit();
            }
        });
        // "release" into selecting state when disabled
        const enabledListener = (enabled)=>{
            if (!enabled) {
                hasKeyboardGrabbedGroupItemProperty.value = false;
            }
        };
        this.model.enabledProperty.link(enabledListener);
        this.disposeEmitter.addListener(()=>{
            this.model.enabledProperty.unlink(enabledListener);
        });
        // A KeyboardListener that changes the "sorting" vs "selecting" state of the interaction.
        const grabReleaseKeyboardListener = new KeyboardListener({
            fireOnHold: true,
            keys: [
                'enter',
                'space',
                'escape'
            ],
            fire: (event, keysPressed)=>{
                // Do no grab when the interaction is disabled, if there is no selection, or when the individual group item is disabled
                if (this.model.enabled && selectedGroupItemProperty.value !== null && options.isGroupItemEnabled(selectedGroupItemProperty.value)) {
                    // Do the "Grab/release" action to switch to sorting or selecting
                    if (keysPressed === 'enter' || keysPressed === 'space') {
                        isGroupItemKeyboardGrabbedProperty.toggle();
                        hasKeyboardGrabbedGroupItemProperty.value = true;
                    } else if (isGroupItemKeyboardGrabbedProperty.value && keysPressed === 'escape') {
                        isGroupItemKeyboardGrabbedProperty.value = false;
                    }
                    // Reset to true from keyboard input, in case mouse/touch input set to false during the keyboard interaction.
                    isKeyboardFocusedProperty.value = true;
                }
            }
        });
        const defaultGroupShape = primaryFocusedNode.visibleBounds.isFinite() ? Shape.bounds(primaryFocusedNode.visibleBounds) : null;
        // Set the outer group focus highlight to surround the entire area where group items are located.
        this.groupSortGroupFocusHighlightPath = new HighlightPath(defaultGroupShape, {
            outerStroke: HighlightPath.OUTER_LIGHT_GROUP_FOCUS_COLOR,
            innerStroke: HighlightPath.INNER_LIGHT_GROUP_FOCUS_COLOR,
            outerLineWidth: HighlightPath.GROUP_OUTER_LINE_WIDTH,
            innerLineWidth: HighlightPath.GROUP_INNER_LINE_WIDTH
        });
        this.grabReleaseCueNode = new GrabReleaseCueNode(combineOptions({
            visibleProperty: this.model.grabReleaseCueVisibleProperty
        }, options.grabReleaseCueOptions));
        this.groupSortGroupFocusHighlightPath.addChild(this.grabReleaseCueNode);
        primaryFocusedNode.setGroupFocusHighlight(this.groupSortGroupFocusHighlightPath);
        primaryFocusedNode.addInputListener(focusListener);
        primaryFocusedNode.addInputListener(grabReleaseKeyboardListener);
        this.disposeEmitter.addListener(()=>{
            isGroupItemKeyboardGrabbedProperty.unlink(grabbedPropertyListener);
            primaryFocusedNode.setGroupFocusHighlight(false);
            primaryFocusedNode.setFocusHighlight(null);
            primaryFocusedNode.removeInputListener(grabReleaseKeyboardListener);
            primaryFocusedNode.removeInputListener(focusListener);
            updateFocusHighlight.dispose();
            grabReleaseKeyboardListener.dispose();
        });
    }
};
export { GroupSelectView as default };
sceneryPhet.register('GroupSelectView', GroupSelectView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2dyb3VwLXNvcnQvdmlldy9Hcm91cFNlbGVjdFZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgZG9jIGFzc3VtZXMgeW91IGhhdmUgcmVhZCB0aGUgZG9jIGluIEdyb3VwU2VsZWN0TW9kZWwuIFJlYWQgdGhhdCBmaXJzdCBhcyBpdCBleHBsYWlucyB0aGUgXCJncm91cCBzZWxlY3RcbiAqIGludGVyYWN0aW9uXCIgbW9yZSBnZW5lcmFsbHkuXG4gKlxuICogVGhlIHZpZXcgb2YgdGhlIFwiR3JvdXAgU29ydCBJbnRlcmFjdGlvbi5cIiBUaGlzIHR5cGUgaGFuZGxlcyBhZGRpbmcgdGhlIGNvbnRyb2xsZXIgZm9yIHNlbGVjdGluZyBhbmQgZ3JhYmJpbmdcbiAqIGluIHRoZSBpbnRlcmFjdGlvbiBmb3IgKGtleWJvYXJkKS4gSXQgYWxzbyBoYW5kbGVzIHRoZSBpbmRpdmlkdWFsIGFuZCBncm91cCBmb2N1cyBoaWdobGlnaHRzLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIHVzZWQgcGVyIHNjZW5lLCBidXQgdGhlIG1vZGVsIGlzIGJlc3QgdXNlZCBwZXIgc2NyZWVuLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBEaXNwb3NhYmxlLCB7IERpc3Bvc2FibGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9EaXNwb3NhYmxlLmpzJztcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbiwgSGlnaGxpZ2h0RnJvbU5vZGUsIEhpZ2hsaWdodFBhdGgsIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIEtleWJvYXJkTGlzdGVuZXIsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXJhbGxlbERPTU9wdGlvbnMsIFBhdGgsIFBET01WYWx1ZVR5cGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBHcmFiUmVsZWFzZUN1ZU5vZGUsIHsgR3JhYlJlbGVhc2VDdWVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL25vZGVzL0dyYWJSZWxlYXNlQ3VlTm9kZS5qcyc7XG5pbXBvcnQgR3JvdXBTZWxlY3RNb2RlbCBmcm9tICcuLi9tb2RlbC9Hcm91cFNlbGVjdE1vZGVsLmpzJztcbmltcG9ydCBTb3J0Q3VlQXJyb3dOb2RlIGZyb20gJy4vU29ydEN1ZUFycm93Tm9kZS5qcyc7XG5cbmZ1bmN0aW9uIEdST1VQX1NFTEVDVF9BQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1IoIG5vZGU6IE5vZGUsIG9wdGlvbnM6IE5vZGVPcHRpb25zLCBhY2Nlc3NpYmxlTmFtZTogUERPTVZhbHVlVHlwZSApOiBOb2RlT3B0aW9ucyB7XG4gIG9wdGlvbnMuYXJpYUxhYmVsID0gYWNjZXNzaWJsZU5hbWU7IC8vIElNUE9SVEFOVCEgRGl2cyB3aXRoIGlubmVyQ29udGVudCBhcmVuJ3QgcmVjb2duaXplZCB3aXRoIGFjY2Vzc2libGVOYW1lc1xuICBvcHRpb25zLmlubmVyQ29udGVudCA9IGFjY2Vzc2libGVOYW1lO1xuICByZXR1cm4gb3B0aW9ucztcbn1cblxudHlwZSBTZWxmT3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlIGV4dGVuZHMgTm9kZT4gPSB7XG5cbiAgLy8gSWYgR3JvdXBTb3J0SW50ZXJhY3Rpb24gZG9lc24ndCBrbm93IHdoYXQgdGhlIHNlbGVjdGlvbiBzaG91bGQgYmUsIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHRvIHNldCB0aGUgZGVmYXVsdCBvclxuICAvLyBiZXN0IGd1ZXNzIHNlbGVjdGlvbi4gUmV0dXJuIG51bGwgdG8gbm90IHN1cHBseSBhIHNlbGVjdGlvbiAobm8gZm9jdXMpLlxuICBnZXRHcm91cEl0ZW1Ub1NlbGVjdDogKCAoKSA9PiBJdGVtTW9kZWwgfCBudWxsICk7XG5cbiAgLy8gUmV0dXJuIHRoZSBlbmFibGVkIHN0YXRlIG9mIGEgZ3JvdXAgaXRlbS4gSWYgYSBncm91cCBpdGVtIGlzIG5vdCBlbmFibGVkIGl0IGNhbiBiZSBzZWxlY3RlZCwgYnV0IG5vdCBzb3J0ZWQuXG4gIGlzR3JvdXBJdGVtRW5hYmxlZD86ICggZ3JvdXBJdGVtOiBJdGVtTW9kZWwgKSA9PiBib29sZWFuO1xuXG4gIC8vIEdpdmVuIGEgbW9kZWwgaXRlbSwgcmV0dXJuIHRoZSBjb3JyZXNwb25kaW5nIG5vZGUuIFN1cHBvcnQgJ251bGwnIGFzIGEgd2F5IHRvIHN1cHBvcnQgbXVsdGlwbGUgc2NlbmVzLiBJZiB5b3VcbiAgLy8gcmV0dXJuIG51bGwsIGl0IG1lYW5zIHRoYXQgdGhlIHByb3ZpZGVkIGl0ZW1Nb2RlbCBpcyBub3QgYXNzb2NpYXRlZCB3aXRoIHRoaXMgdmlldywgYW5kIHNob3VsZG4ndCBiZSBoYW5kbGVkLlxuICBnZXROb2RlRnJvbU1vZGVsSXRlbTogKCBtb2RlbDogSXRlbU1vZGVsICkgPT4gSXRlbU5vZGUgfCBudWxsO1xuXG4gIC8vIEdpdmVuIGEgbW9kZWwgaXRlbSwgcmV0dXJuIHRoZSBjb3JyZXNwb25kaW5nIGZvY3VzIGhpZ2hsaWdodCBub2RlLiBEZWZhdWx0cyB0byB0aGUgaW1wbGVtZW50YXRpb24gb2YgZ2V0Tm9kZUZyb21Nb2RlbEl0ZW0uXG4gIC8vIFJldHVybiBudWxsIGlmIG5vIGhpZ2hsaWdodCBzaG91bGQgYmUgc2hvd24gZm9yIHRoZSBzZWxlY3Rpb24gKG5vdCByZWNvbW1lbmRlZCkuXG4gIGdldEhpZ2hsaWdodE5vZGVGcm9tTW9kZWxJdGVtPzogKCBtb2RlbDogSXRlbU1vZGVsICkgPT4gTm9kZSB8IG51bGw7XG5cbiAgLy8gV2hlbiB0aGUgc2VsZWN0ZWQgZ3JvdXAgaXRlbSBoYXMgYmVlbiBncmFiYmVkIChpbnRvIFwic29ydGluZ1wiIHN0YXRlKS5cbiAgb25HcmFiPzogKCBncm91cEl0ZW06IEl0ZW1Nb2RlbCApID0+IHZvaWQ7XG5cbiAgLy8gV2hlbiB0aGUgc2VsZWN0ZWQgZ3JvdXAgaXRlbSBpcyByZWxlYXNlZCAoYmFjayBpbnRvIFwic2VsZWN0aW5nXCIgc3RhdGUpLlxuICBvblJlbGVhc2U/OiAoIGdyb3VwSXRlbTogSXRlbU1vZGVsICkgPT4gdm9pZDtcblxuICAvLyBUbyBiZSBwYXNzZWQgdG8gdGhlIGdyYWIvcmVsZWFzZSBjdWUgbm9kZSAod2hpY2ggaXMgYWRkZWQgdG8gdGhlIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCkuIFRoZSB2aXNpYmxlUHJvcGVydHkgaXNcbiAgLy8gYWx3YXlzIEdyb3VwU2VsZWN0TW9kZWwuZ3JhYlJlbGVhc2VDdWVWaXNpYmxlUHJvcGVydHlcbiAgZ3JhYlJlbGVhc2VDdWVPcHRpb25zPzogUGFydGlhbDxTdHJpY3RPbWl0PEdyYWJSZWxlYXNlQ3VlTm9kZU9wdGlvbnMsICd2aXNpYmxlUHJvcGVydHknPj47XG5cbiAgLy8gQWNjZXNzaWJsZSBjb250ZW50IHByb3ZpZGVkIHRvIHRoZSBub2RlLiBUaGlzIGRvZXNuJ3QgY2hhbmdlIGZyb20gc2VsZWN0aW5nL3NvcnRpbmcgc3RhdGVzLiBDbGllbnQgaXMgcmVzcG9uc2libGVcbiAgLy8gZm9yIHNldHRpbmcgYWNjZXNzaWJsZU5hbWUgYWNjb3JkaW5nIHRvIGdyYWJiZWQgc3RhdGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy84NjBcbiAgcHJpbWFyeUZvY3VzZWROb2RlT3B0aW9ucz86IFBhcmFsbGVsRE9NT3B0aW9ucztcbn07XG5cbnR5cGUgUGFyZW50T3B0aW9ucyA9IERpc3Bvc2FibGVPcHRpb25zO1xuZXhwb3J0IHR5cGUgR3JvdXBTZWxlY3RWaWV3T3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlIGV4dGVuZHMgTm9kZT4gPSBTZWxmT3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlPiAmIFBhcmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyb3VwU2VsZWN0VmlldzxJdGVtTW9kZWwsIEl0ZW1Ob2RlIGV4dGVuZHMgTm9kZT4gZXh0ZW5kcyBEaXNwb3NhYmxlIHtcblxuICAvLyBVcGRhdGUgZ3JvdXAgaGlnaGxpZ2h0IGR5bmFtaWNhbGx5IGJ5IHNldHRpbmcgdGhlIGBzaGFwZWAgb2YgdGhpcyBwYXRoLlxuICBwdWJsaWMgcmVhZG9ubHkgZ3JvdXBTb3J0R3JvdXBGb2N1c0hpZ2hsaWdodFBhdGg6IFBhdGg7XG5cbiAgLy8gVGhlIGN1ZSBub2RlIGZvciBncmFiL3JlbGVhc2UuXG4gIHB1YmxpYyByZWFkb25seSBncmFiUmVsZWFzZUN1ZU5vZGU6IE5vZGU7XG5cbiAgLy8gRW1pdHRlZCB3aGVuIHRoZSBzb3J0aW5nIGN1ZSBzaG91bGQgYmUgcmVwb3NpdGlvbmVkLiBNb3N0IGxpa2VseSBiZWNhdXNlIHRoZSBzZWxlY3Rpb24gaGFzIGNoYW5nZWQuXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvblNvcnRDdWVOb2RlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBnZXROb2RlRnJvbU1vZGVsSXRlbTogKCBtb2RlbDogSXRlbU1vZGVsICkgPT4gSXRlbU5vZGUgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbW9kZWw6IEdyb3VwU2VsZWN0TW9kZWw8SXRlbU1vZGVsPixcbiAgICBwcmltYXJ5Rm9jdXNlZE5vZGU6IE5vZGUsIC8vIENsaWVudCBpcyByZXNwb25zaWJsZSBmb3Igc2V0dGluZyBhY2Nlc3NpYmxlTmFtZSBhbmQgbm90aGluZyBlbHNlIVxuICAgIHByb3ZpZGVkT3B0aW9uczogR3JvdXBTZWxlY3RWaWV3T3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlPiApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8XG4gICAgICBHcm91cFNlbGVjdFZpZXdPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGU+LFxuICAgICAgU2VsZk9wdGlvbnM8SXRlbU1vZGVsLCBJdGVtTm9kZT4sXG4gICAgICBQYXJlbnRPcHRpb25zPigpKCB7XG4gICAgICBvbkdyYWI6IF8ubm9vcCxcbiAgICAgIG9uUmVsZWFzZTogXy5ub29wLFxuICAgICAgZ2V0SGlnaGxpZ2h0Tm9kZUZyb21Nb2RlbEl0ZW06IHByb3ZpZGVkT3B0aW9ucy5nZXROb2RlRnJvbU1vZGVsSXRlbSxcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgYSBncm91cCBpdGVtIGlzIGVuYWJsZWQgaXQgaWYgY29ycmVzcG9uZGluZyBOb2RlIGlzIGVuYWJsZWQuXG4gICAgICBpc0dyb3VwSXRlbUVuYWJsZWQ6IGdyb3VwSXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IGl0ZW1Ob2RlID0gcHJvdmlkZWRPcHRpb25zLmdldE5vZGVGcm9tTW9kZWxJdGVtKCBncm91cEl0ZW0gKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXRlbU5vZGUsICdzaG91bGQgaGF2ZSBhIG5vZGUgZm9yIHRoZSBncm91cCBpdGVtJyApO1xuICAgICAgICByZXR1cm4gaXRlbU5vZGUhLmVuYWJsZWQ7XG4gICAgICB9LFxuICAgICAgcHJpbWFyeUZvY3VzZWROb2RlT3B0aW9uczoge1xuICAgICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgICAgZm9jdXNhYmxlOiB0cnVlLFxuICAgICAgICBhcmlhUm9sZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgICAgYWNjZXNzaWJsZU5hbWVCZWhhdmlvcjogR1JPVVBfU0VMRUNUX0FDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUlxuICAgICAgfSxcbiAgICAgIGdyYWJSZWxlYXNlQ3VlT3B0aW9uczoge31cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmdldE5vZGVGcm9tTW9kZWxJdGVtID0gb3B0aW9ucy5nZXROb2RlRnJvbU1vZGVsSXRlbTtcblxuICAgIGNvbnN0IHNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkgPSB0aGlzLm1vZGVsLnNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHk7XG4gICAgY29uc3QgaXNLZXlib2FyZEZvY3VzZWRQcm9wZXJ0eSA9IHRoaXMubW9kZWwuaXNLZXlib2FyZEZvY3VzZWRQcm9wZXJ0eTtcbiAgICBjb25zdCBpc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5ID0gdGhpcy5tb2RlbC5pc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5O1xuICAgIGNvbnN0IGhhc0tleWJvYXJkR3JhYmJlZEdyb3VwSXRlbVByb3BlcnR5ID0gdGhpcy5tb2RlbC5oYXNLZXlib2FyZEdyYWJiZWRHcm91cEl0ZW1Qcm9wZXJ0eTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGdlbmVyYWwgYWNjZXNzaWJsZSBjb250ZW50IGZvciB0aGUgcHJvdmlkZWQgTm9kZVxuICAgIHByaW1hcnlGb2N1c2VkTm9kZS5tdXRhdGUoIG9wdGlvbnMucHJpbWFyeUZvY3VzZWROb2RlT3B0aW9ucyApO1xuXG4gICAgY29uc3QgZ3JhYmJlZFByb3BlcnR5TGlzdGVuZXIgPSAoIGdyYWJiZWQ6IGJvb2xlYW4gKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZEdyb3VwSXRlbSA9IHNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkudmFsdWU7XG4gICAgICBpZiAoIHNlbGVjdGVkR3JvdXBJdGVtICkge1xuICAgICAgICBpZiAoIGdyYWJiZWQgKSB7XG4gICAgICAgICAgb3B0aW9ucy5vbkdyYWIoIHNlbGVjdGVkR3JvdXBJdGVtICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgb3B0aW9ucy5vblJlbGVhc2UoIHNlbGVjdGVkR3JvdXBJdGVtICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkubGF6eUxpbmsoIGdyYWJiZWRQcm9wZXJ0eUxpc3RlbmVyICk7XG5cbiAgICBjb25zdCBmb2N1c0xpc3RlbmVyID0ge1xuICAgICAgZm9jdXM6ICgpID0+IHtcblxuICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgZ2V0R3JvdXBJdGVtVG9TZWxlY3QncyBoZXVyaXN0aWMgc2FpZCB0aGF0IHRoZXJlIGlzIG5vdGhpbmcgdG8gZm9jdXMgaGVyZVxuICAgICAgICBpZiAoIHNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgICAgICAgc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZSA9IG9wdGlvbnMuZ2V0R3JvdXBJdGVtVG9TZWxlY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzS2V5Ym9hcmRGb2N1c2VkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFdoZW4gdGhlIGdyb3VwIHJlY2VpdmVzIGtleWJvYXJkIGZvY3VzLCBtYWtlIHN1cmUgdGhhdCB0aGUgc2VsZWN0ZWQgZ3JvdXAgaXRlbSBpcyBkaXNwbGF5ZWRcbiAgICAgICAgaWYgKCBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICE9PSBudWxsICkge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBvcHRpb25zLmdldE5vZGVGcm9tTW9kZWxJdGVtKCBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICk7XG4gICAgICAgICAgbm9kZSAmJiBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIucGFuVG9Ob2RlKCBub2RlLCB0cnVlICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBibHVyOiAoKSA9PiB7XG4gICAgICAgIGlzS2V5Ym9hcmRGb2N1c2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgaXNHcm91cEl0ZW1LZXlib2FyZEdyYWJiZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIG92ZXI6ICgpID0+IHtcblxuICAgICAgICAvLyBXaGVuIHlvdSBtb3VzZSBvdmVyIHdoaWxlIGZvY3VzZWQsIHRoZSBoaWdobGlnaHRzIGFyZSBoaWRkZW4sIGFuZCBzbyB1cGRhdGUgdGhlIHN0YXRlIChldmVuIHRob3VnaCB3ZSBhcmVcbiAgICAgICAgLy8gc3RpbGwgdGVjaG5pY2FsbHkga2V5Ym9hcmQgZm9jdXNlZCkuIFRoaXMgd2lsbCBhc3Npc3QgaW4gc2hvd2luZyB0aGUgbW91c2UgY3VlLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2VudGVyLWFuZC12YXJpYWJpbGl0eS9pc3N1ZXMvNDA2XG4gICAgICAgIGlzS2V5Ym9hcmRGb2N1c2VkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBkb3duOiAoKSA9PiB7XG5cbiAgICAgICAgLy8gV2Ugd2FudCB0byByZW1vdmUgZm9jdXMgZnJvbSB0aGlzIG5vZGUgZW50aXJlbHkgdG8gcHJldmVudCB0aGUgZm9jdXMgaGlnaGxpZ2h0IGZyb20gc2hvd2luZyB1cCB3aGVuXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIHNlbGVjdGVkIGdyb3VwIGl0ZW0uXG4gICAgICAgIHByaW1hcnlGb2N1c2VkTm9kZS5ibHVyKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFdoZW4gaW50ZXJhY3RpdmUgaGlnaGxpZ2h0cyBiZWNvbWUgYWN0aXZlIG9uIHRoZSBncm91cCwgaW50ZXJhY3Rpb24gd2l0aCBhIG1vdXNlIGhhcyBiZWd1biB3aGlsZSB1c2luZ1xuICAgIC8vIEludGVyYWN0aXZlIEhpZ2hsaWdodGluZy4gV2hlbiB0aGF0IGhhcHBlbnMsIGNsZWFyIHRoZSBzZWxlY3Rpb24gdG8gcHJldmVudCBmb2N1cyBoaWdobGlnaHQgZmxpY2tlcmluZy90aHJhc2hpbmcuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jZW50ZXItYW5kLXZhcmlhYmlsaXR5L2lzc3Vlcy81NTcgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzgxNVxuICAgIGlmICggaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggcHJpbWFyeUZvY3VzZWROb2RlICkgKSB7XG4gICAgICBjb25zdCBpbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0FjdGl2ZUxpc3RlbmVyID0gKCBhY3RpdmU6IGJvb2xlYW4gKSA9PiB7XG4gICAgICAgIGlmICggYWN0aXZlICkge1xuICAgICAgICAgIGlmICggbW9kZWwuc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCApIHtcblxuICAgICAgICAgICAgLy8gUmVsZWFzZSB0aGUgc2VsZWN0aW9uIGlmIGdyYWJiZWRcbiAgICAgICAgICAgIG1vZGVsLmlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHNlbGVjdGlvbiBzbyB0aGF0IHRoZXJlIGlzbid0IHBvdGVudGlhbCBmb3IgZmxpY2tlcmluZyBpbiBiZXR3ZWVuIGlucHV0IG1vZGFsaXRpZXNcbiAgICAgICAgICAgIG1vZGVsLnNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFRoaXMgY29udHJvbHMgdGhlIHZpc2liaWxpdHkgb2YgaW50ZXJhY3Rpb24gY3VlcyAoa2V5Ym9hcmQgdnMgbW91c2UpLCBzbyB3ZSBuZWVkIHRvIGNsZWFyIGl0IHdoZW5cbiAgICAgICAgICAvLyBzd2l0Y2hpbmcgaW50ZXJhY3Rpb24gbW9kZXMuXG4gICAgICAgICAgaXNLZXlib2FyZEZvY3VzZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcHJpbWFyeUZvY3VzZWROb2RlLmlzSW50ZXJhY3RpdmVIaWdobGlnaHRBY3RpdmVQcm9wZXJ0eS5sYXp5TGluayggaW50ZXJhY3RpdmVIaWdobGlnaHRpbmdBY3RpdmVMaXN0ZW5lciApO1xuXG4gICAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICAgIHByaW1hcnlGb2N1c2VkTm9kZS5pc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZlUHJvcGVydHkudW5saW5rKCBpbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ0FjdGl2ZUxpc3RlbmVyICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlRm9jdXNIaWdobGlnaHQgPSBuZXcgTXVsdGlsaW5rKCBbXG4gICAgICAgIHNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHksXG4gICAgICAgIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHlcbiAgICAgIF0sXG4gICAgICAoIHNlbGVjdGVkR3JvdXBJdGVtLCBpc0dyb3VwSXRlbUdyYWJiZWQgKSA9PiB7XG4gICAgICAgIGxldCBmb2N1c0hpZ2hsaWdodFNldCA9IGZhbHNlO1xuICAgICAgICBpZiAoIHNlbGVjdGVkR3JvdXBJdGVtICkge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBvcHRpb25zLmdldEhpZ2hsaWdodE5vZGVGcm9tTW9kZWxJdGVtKCBzZWxlY3RlZEdyb3VwSXRlbSApO1xuICAgICAgICAgIGlmICggbm9kZSApIHtcbiAgICAgICAgICAgIGNvbnN0IGZvY3VzRm9yU2VsZWN0ZWRHcm91cEl0ZW0gPSBuZXcgSGlnaGxpZ2h0RnJvbU5vZGUoIG5vZGUsIHsgZGFzaGVkOiBpc0dyb3VwSXRlbUdyYWJiZWQgfSApO1xuXG4gICAgICAgICAgICAvLyBJZiBhdmFpbGFibGUsIHNldCB0byB0aGUgZm9jdXNlZCBzZWxlY3Rpb24gZm9yIHRoaXMgc2NlbmUuXG4gICAgICAgICAgICBwcmltYXJ5Rm9jdXNlZE5vZGUuc2V0Rm9jdXNIaWdobGlnaHQoIGZvY3VzRm9yU2VsZWN0ZWRHcm91cEl0ZW0gKTtcbiAgICAgICAgICAgIGZvY3VzSGlnaGxpZ2h0U2V0ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBub3Qgc2V0IGFib3ZlLCB0aGVuIGFjdGl2ZWx5IGhpZGUgaXQuXG4gICAgICAgICFmb2N1c0hpZ2hsaWdodFNldCAmJiBwcmltYXJ5Rm9jdXNlZE5vZGUuc2V0Rm9jdXNIaWdobGlnaHQoICdpbnZpc2libGUnICk7XG5cbiAgICAgICAgaWYgKCBzZWxlY3RlZEdyb3VwSXRlbSAhPT0gbnVsbCApIHtcbiAgICAgICAgICB0aGlzLnBvc2l0aW9uU29ydEN1ZU5vZGVFbWl0dGVyLmVtaXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBcInJlbGVhc2VcIiBpbnRvIHNlbGVjdGluZyBzdGF0ZSB3aGVuIGRpc2FibGVkXG4gICAgY29uc3QgZW5hYmxlZExpc3RlbmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xuICAgICAgaWYgKCAhZW5hYmxlZCApIHtcbiAgICAgICAgaGFzS2V5Ym9hcmRHcmFiYmVkR3JvdXBJdGVtUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMubW9kZWwuZW5hYmxlZFByb3BlcnR5LmxpbmsoIGVuYWJsZWRMaXN0ZW5lciApO1xuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIHRoaXMubW9kZWwuZW5hYmxlZFByb3BlcnR5LnVubGluayggZW5hYmxlZExpc3RlbmVyICk7XG4gICAgfSApO1xuXG4gICAgLy8gQSBLZXlib2FyZExpc3RlbmVyIHRoYXQgY2hhbmdlcyB0aGUgXCJzb3J0aW5nXCIgdnMgXCJzZWxlY3RpbmdcIiBzdGF0ZSBvZiB0aGUgaW50ZXJhY3Rpb24uXG4gICAgY29uc3QgZ3JhYlJlbGVhc2VLZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgIGZpcmVPbkhvbGQ6IHRydWUsXG4gICAgICBrZXlzOiBbICdlbnRlcicsICdzcGFjZScsICdlc2NhcGUnIF0sXG4gICAgICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCApID0+IHtcblxuICAgICAgICAvLyBEbyBubyBncmFiIHdoZW4gdGhlIGludGVyYWN0aW9uIGlzIGRpc2FibGVkLCBpZiB0aGVyZSBpcyBubyBzZWxlY3Rpb24sIG9yIHdoZW4gdGhlIGluZGl2aWR1YWwgZ3JvdXAgaXRlbSBpcyBkaXNhYmxlZFxuICAgICAgICBpZiAoIHRoaXMubW9kZWwuZW5hYmxlZCAmJiBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICE9PSBudWxsICYmIG9wdGlvbnMuaXNHcm91cEl0ZW1FbmFibGVkKCBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICkgKSB7XG5cbiAgICAgICAgICAvLyBEbyB0aGUgXCJHcmFiL3JlbGVhc2VcIiBhY3Rpb24gdG8gc3dpdGNoIHRvIHNvcnRpbmcgb3Igc2VsZWN0aW5nXG4gICAgICAgICAgaWYgKCBrZXlzUHJlc3NlZCA9PT0gJ2VudGVyJyB8fCBrZXlzUHJlc3NlZCA9PT0gJ3NwYWNlJyApIHtcbiAgICAgICAgICAgIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkudG9nZ2xlKCk7XG4gICAgICAgICAgICBoYXNLZXlib2FyZEdyYWJiZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBpc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5LnZhbHVlICYmIGtleXNQcmVzc2VkID09PSAnZXNjYXBlJyApIHtcbiAgICAgICAgICAgIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZXNldCB0byB0cnVlIGZyb20ga2V5Ym9hcmQgaW5wdXQsIGluIGNhc2UgbW91c2UvdG91Y2ggaW5wdXQgc2V0IHRvIGZhbHNlIGR1cmluZyB0aGUga2V5Ym9hcmQgaW50ZXJhY3Rpb24uXG4gICAgICAgICAgaXNLZXlib2FyZEZvY3VzZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBkZWZhdWx0R3JvdXBTaGFwZSA9IHByaW1hcnlGb2N1c2VkTm9kZS52aXNpYmxlQm91bmRzLmlzRmluaXRlKCkgPyBTaGFwZS5ib3VuZHMoIHByaW1hcnlGb2N1c2VkTm9kZS52aXNpYmxlQm91bmRzICkgOiBudWxsO1xuXG4gICAgLy8gU2V0IHRoZSBvdXRlciBncm91cCBmb2N1cyBoaWdobGlnaHQgdG8gc3Vycm91bmQgdGhlIGVudGlyZSBhcmVhIHdoZXJlIGdyb3VwIGl0ZW1zIGFyZSBsb2NhdGVkLlxuICAgIHRoaXMuZ3JvdXBTb3J0R3JvdXBGb2N1c0hpZ2hsaWdodFBhdGggPSBuZXcgSGlnaGxpZ2h0UGF0aCggZGVmYXVsdEdyb3VwU2hhcGUsIHtcbiAgICAgIG91dGVyU3Ryb2tlOiBIaWdobGlnaHRQYXRoLk9VVEVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SLFxuICAgICAgaW5uZXJTdHJva2U6IEhpZ2hsaWdodFBhdGguSU5ORVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IsXG4gICAgICBvdXRlckxpbmVXaWR0aDogSGlnaGxpZ2h0UGF0aC5HUk9VUF9PVVRFUl9MSU5FX1dJRFRILFxuICAgICAgaW5uZXJMaW5lV2lkdGg6IEhpZ2hsaWdodFBhdGguR1JPVVBfSU5ORVJfTElORV9XSURUSFxuICAgIH0gKTtcblxuICAgIHRoaXMuZ3JhYlJlbGVhc2VDdWVOb2RlID0gbmV3IEdyYWJSZWxlYXNlQ3VlTm9kZSggY29tYmluZU9wdGlvbnM8R3JhYlJlbGVhc2VDdWVOb2RlT3B0aW9ucz4oIHtcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5tb2RlbC5ncmFiUmVsZWFzZUN1ZVZpc2libGVQcm9wZXJ0eVxuICAgIH0sIG9wdGlvbnMuZ3JhYlJlbGVhc2VDdWVPcHRpb25zICkgKTtcbiAgICB0aGlzLmdyb3VwU29ydEdyb3VwRm9jdXNIaWdobGlnaHRQYXRoLmFkZENoaWxkKCB0aGlzLmdyYWJSZWxlYXNlQ3VlTm9kZSApO1xuXG4gICAgcHJpbWFyeUZvY3VzZWROb2RlLnNldEdyb3VwRm9jdXNIaWdobGlnaHQoIHRoaXMuZ3JvdXBTb3J0R3JvdXBGb2N1c0hpZ2hsaWdodFBhdGggKTtcbiAgICBwcmltYXJ5Rm9jdXNlZE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggZm9jdXNMaXN0ZW5lciApO1xuICAgIHByaW1hcnlGb2N1c2VkTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBncmFiUmVsZWFzZUtleWJvYXJkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkudW5saW5rKCBncmFiYmVkUHJvcGVydHlMaXN0ZW5lciApO1xuICAgICAgcHJpbWFyeUZvY3VzZWROb2RlLnNldEdyb3VwRm9jdXNIaWdobGlnaHQoIGZhbHNlICk7XG4gICAgICBwcmltYXJ5Rm9jdXNlZE5vZGUuc2V0Rm9jdXNIaWdobGlnaHQoIG51bGwgKTtcbiAgICAgIHByaW1hcnlGb2N1c2VkTm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyKCBncmFiUmVsZWFzZUtleWJvYXJkTGlzdGVuZXIgKTtcbiAgICAgIHByaW1hcnlGb2N1c2VkTm9kZS5yZW1vdmVJbnB1dExpc3RlbmVyKCBmb2N1c0xpc3RlbmVyICk7XG4gICAgICB1cGRhdGVGb2N1c0hpZ2hsaWdodC5kaXNwb3NlKCk7XG4gICAgICBncmFiUmVsZWFzZUtleWJvYXJkTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8vIEJ5IFwiY2hhbmdlXCIgd2UgbWVhbiBzb3J0IG9yIHNlbGVjdGlvbi5cbiAgcHJvdGVjdGVkIG9uR3JvdXBJdGVtQ2hhbmdlKCBuZXdHcm91cEl0ZW06IEl0ZW1Nb2RlbCApOiB2b2lkIHtcbiAgICAvLyBXaGVuIHVzaW5nIGtleWJvYXJkIGlucHV0LCBtYWtlIHN1cmUgdGhhdCB0aGUgc2VsZWN0ZWQgZ3JvdXAgaXRlbSBpcyBzdGlsbCBkaXNwbGF5ZWQgYnkgcGFubmluZyB0byBrZWVwIGl0XG4gICAgLy8gaW4gdmlldy4gYHBhblRvQ2VudGVyYCBpcyBmYWxzZSBiZWNhdXNlIGNlbnRlcmluZyB0aGUgZ3JvdXAgaXRlbSBpbiB0aGUgc2NyZWVuIGlzIHRvbyBtdWNoIG1vdmVtZW50LlxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGVGcm9tTW9kZWxJdGVtKCBuZXdHcm91cEl0ZW0gKTtcbiAgICBub2RlICYmIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5saXN0ZW5lci5wYW5Ub05vZGUoIG5vZGUsIGZhbHNlICk7XG5cbiAgICAvLyBSZXNldCB0byB0cnVlIGZyb20ga2V5Ym9hcmQgaW5wdXQsIGluIGNhc2UgbW91c2UvdG91Y2ggaW5wdXQgc2V0IHRvIGZhbHNlIGR1cmluZyB0aGUga2V5Ym9hcmQgaW50ZXJhY3Rpb24uXG4gICAgdGhpcy5tb2RlbC5pc0tleWJvYXJkRm9jdXNlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZ3JvdXBTb3J0R3JvdXBGb2N1c0hpZ2hsaWdodFBhdGguZGlzcG9zZSgpO1xuICAgIHRoaXMuZ3JhYlJlbGVhc2VDdWVOb2RlLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnBvc2l0aW9uU29ydEN1ZU5vZGVFbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogVXNlIFNvcnRDdWVBcnJvd05vZGUgdG8gY3JlYXRlIGEgTm9kZSBmb3IgdGhlIGtleWJvYXJkIHNvcnRpbmcgY3VlLiBDYW4gYWxzbyBiZSB1c2VkIGFzIHRoZSBtb3VzZS90b3VjaCBjdWVcbiAgICogTm9kZSBpZiBkZXNpcmVkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVTb3J0Q3VlTm9kZSggdmlzaWJsZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiwgc2NhbGUgPSAxICk6IFNvcnRDdWVBcnJvd05vZGUge1xuICAgIHJldHVybiBuZXcgU29ydEN1ZUFycm93Tm9kZSgge1xuICAgICAgZG91YmxlSGVhZDogdHJ1ZSxcbiAgICAgIGRhc2hXaWR0aDogMy41ICogc2NhbGUsXG4gICAgICBkYXNoSGVpZ2h0OiAyLjggKiBzY2FsZSxcbiAgICAgIG51bWJlck9mRGFzaGVzOiAzLFxuICAgICAgc3BhY2luZzogMiAqIHNjYWxlLFxuICAgICAgdHJpYW5nbGVOb2RlT3B0aW9uczoge1xuICAgICAgICB0cmlhbmdsZVdpZHRoOiAxMiAqIHNjYWxlLFxuICAgICAgICB0cmlhbmdsZUhlaWdodDogMTEgKiBzY2FsZVxuICAgICAgfSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0b3IgZmFjdG9yeSwgc2ltaWxhciB0byBQaGV0aW9PYmplY3QuY3JlYXRlKCkuIFRoaXMgaXMgbW9zdCB1c2VmdWwgaWYgeW91IGRvbid0IG5lZWQgdG8ga2VlcCB0aGUgaW5zdGFuY2Ugb2ZcbiAgICogeW91ciBHcm91cFNvcnRJbnRlcmFjdGlvblZpZXcuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZTxJdGVtTW9kZWwsIEl0ZW1Ob2RlIGV4dGVuZHMgTm9kZT4oXG4gICAgbW9kZWw6IEdyb3VwU2VsZWN0TW9kZWw8SXRlbU1vZGVsPixcbiAgICBwcmltYXJ5Rm9jdXNlZE5vZGU6IE5vZGUsXG4gICAgcHJvdmlkZWRPcHRpb25zOiBHcm91cFNlbGVjdFZpZXdPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGU+ICk6IEdyb3VwU2VsZWN0VmlldzxJdGVtTW9kZWwsIEl0ZW1Ob2RlPiB7XG5cbiAgICByZXR1cm4gbmV3IEdyb3VwU2VsZWN0VmlldzxJdGVtTW9kZWwsIEl0ZW1Ob2RlPiggbW9kZWwsIHByaW1hcnlGb2N1c2VkTm9kZSwgcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdHcm91cFNlbGVjdFZpZXcnLCBHcm91cFNlbGVjdFZpZXcgKTsiXSwibmFtZXMiOlsiRGlzcG9zYWJsZSIsIkVtaXR0ZXIiLCJNdWx0aWxpbmsiLCJTaGFwZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uIiwiSGlnaGxpZ2h0RnJvbU5vZGUiLCJIaWdobGlnaHRQYXRoIiwiaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIktleWJvYXJkTGlzdGVuZXIiLCJzY2VuZXJ5UGhldCIsIkdyYWJSZWxlYXNlQ3VlTm9kZSIsIlNvcnRDdWVBcnJvd05vZGUiLCJHUk9VUF9TRUxFQ1RfQUNDRVNTSUJMRV9OQU1FX0JFSEFWSU9SIiwibm9kZSIsIm9wdGlvbnMiLCJhY2Nlc3NpYmxlTmFtZSIsImFyaWFMYWJlbCIsImlubmVyQ29udGVudCIsIkdyb3VwU2VsZWN0VmlldyIsIm9uR3JvdXBJdGVtQ2hhbmdlIiwibmV3R3JvdXBJdGVtIiwiZ2V0Tm9kZUZyb21Nb2RlbEl0ZW0iLCJsaXN0ZW5lciIsInBhblRvTm9kZSIsIm1vZGVsIiwiaXNLZXlib2FyZEZvY3VzZWRQcm9wZXJ0eSIsInZhbHVlIiwiZGlzcG9zZSIsImdyb3VwU29ydEdyb3VwRm9jdXNIaWdobGlnaHRQYXRoIiwiZ3JhYlJlbGVhc2VDdWVOb2RlIiwicG9zaXRpb25Tb3J0Q3VlTm9kZUVtaXR0ZXIiLCJjcmVhdGVTb3J0Q3VlTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInNjYWxlIiwiZG91YmxlSGVhZCIsImRhc2hXaWR0aCIsImRhc2hIZWlnaHQiLCJudW1iZXJPZkRhc2hlcyIsInNwYWNpbmciLCJ0cmlhbmdsZU5vZGVPcHRpb25zIiwidHJpYW5nbGVXaWR0aCIsInRyaWFuZ2xlSGVpZ2h0IiwiY3JlYXRlIiwicHJpbWFyeUZvY3VzZWROb2RlIiwicHJvdmlkZWRPcHRpb25zIiwib25HcmFiIiwiXyIsIm5vb3AiLCJvblJlbGVhc2UiLCJnZXRIaWdobGlnaHROb2RlRnJvbU1vZGVsSXRlbSIsImlzR3JvdXBJdGVtRW5hYmxlZCIsImdyb3VwSXRlbSIsIml0ZW1Ob2RlIiwiYXNzZXJ0IiwiZW5hYmxlZCIsInByaW1hcnlGb2N1c2VkTm9kZU9wdGlvbnMiLCJ0YWdOYW1lIiwiZm9jdXNhYmxlIiwiYXJpYVJvbGUiLCJhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yIiwiZ3JhYlJlbGVhc2VDdWVPcHRpb25zIiwic2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eSIsImlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkiLCJoYXNLZXlib2FyZEdyYWJiZWRHcm91cEl0ZW1Qcm9wZXJ0eSIsIm11dGF0ZSIsImdyYWJiZWRQcm9wZXJ0eUxpc3RlbmVyIiwiZ3JhYmJlZCIsInNlbGVjdGVkR3JvdXBJdGVtIiwibGF6eUxpbmsiLCJmb2N1c0xpc3RlbmVyIiwiZm9jdXMiLCJnZXRHcm91cEl0ZW1Ub1NlbGVjdCIsImJsdXIiLCJvdmVyIiwiZG93biIsImludGVyYWN0aXZlSGlnaGxpZ2h0aW5nQWN0aXZlTGlzdGVuZXIiLCJhY3RpdmUiLCJpc0ludGVyYWN0aXZlSGlnaGxpZ2h0QWN0aXZlUHJvcGVydHkiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidW5saW5rIiwidXBkYXRlRm9jdXNIaWdobGlnaHQiLCJpc0dyb3VwSXRlbUdyYWJiZWQiLCJmb2N1c0hpZ2hsaWdodFNldCIsImZvY3VzRm9yU2VsZWN0ZWRHcm91cEl0ZW0iLCJkYXNoZWQiLCJzZXRGb2N1c0hpZ2hsaWdodCIsImVtaXQiLCJlbmFibGVkTGlzdGVuZXIiLCJlbmFibGVkUHJvcGVydHkiLCJsaW5rIiwiZ3JhYlJlbGVhc2VLZXlib2FyZExpc3RlbmVyIiwiZmlyZU9uSG9sZCIsImtleXMiLCJmaXJlIiwiZXZlbnQiLCJrZXlzUHJlc3NlZCIsInRvZ2dsZSIsImRlZmF1bHRHcm91cFNoYXBlIiwidmlzaWJsZUJvdW5kcyIsImlzRmluaXRlIiwiYm91bmRzIiwib3V0ZXJTdHJva2UiLCJPVVRFUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUiIsImlubmVyU3Ryb2tlIiwiSU5ORVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IiLCJvdXRlckxpbmVXaWR0aCIsIkdST1VQX09VVEVSX0xJTkVfV0lEVEgiLCJpbm5lckxpbmVXaWR0aCIsIkdST1VQX0lOTkVSX0xJTkVfV0lEVEgiLCJncmFiUmVsZWFzZUN1ZVZpc2libGVQcm9wZXJ0eSIsImFkZENoaWxkIiwic2V0R3JvdXBGb2N1c0hpZ2hsaWdodCIsImFkZElucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGdCQUF1Qyx1Q0FBdUM7QUFDckYsT0FBT0MsYUFBYSxvQ0FBb0M7QUFDeEQsT0FBT0MsZUFBZSxzQ0FBc0M7QUFFNUQsU0FBU0MsS0FBSyxRQUFRLG9DQUFvQztBQUMxRCxPQUFPQyxhQUFhQyxjQUFjLFFBQVEsMkNBQTJDO0FBRXJGLFNBQVNDLHdCQUF3QixFQUFFQyxpQkFBaUIsRUFBRUMsYUFBYSxFQUFFQyx5QkFBeUIsRUFBRUMsZ0JBQWdCLFFBQW9FLHVDQUF1QztBQUMzTixPQUFPQyxpQkFBaUIsMEJBQTBCO0FBQ2xELE9BQU9DLHdCQUF1RCxvQ0FBb0M7QUFFbEcsT0FBT0Msc0JBQXNCLHdCQUF3QjtBQUVyRCxTQUFTQyxzQ0FBdUNDLElBQVUsRUFBRUMsT0FBb0IsRUFBRUMsY0FBNkI7SUFDN0dELFFBQVFFLFNBQVMsR0FBR0QsZ0JBQWdCLDJFQUEyRTtJQUMvR0QsUUFBUUcsWUFBWSxHQUFHRjtJQUN2QixPQUFPRDtBQUNUO0FBcUNlLElBQUEsQUFBTUksa0JBQU4sTUFBTUEsd0JBQTBEcEI7SUEwTjdFLHlDQUF5QztJQUMvQnFCLGtCQUFtQkMsWUFBdUIsRUFBUztRQUMzRCw2R0FBNkc7UUFDN0csdUdBQXVHO1FBQ3ZHLE1BQU1QLE9BQU8sSUFBSSxDQUFDUSxvQkFBb0IsQ0FBRUQ7UUFDeENQLFFBQVFULHlCQUF5QmtCLFFBQVEsQ0FBQ0MsU0FBUyxDQUFFVixNQUFNO1FBRTNELDZHQUE2RztRQUM3RyxJQUFJLENBQUNXLEtBQUssQ0FBQ0MseUJBQXlCLENBQUNDLEtBQUssR0FBRztJQUMvQztJQUVnQkMsVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxnQ0FBZ0MsQ0FBQ0QsT0FBTztRQUM3QyxJQUFJLENBQUNFLGtCQUFrQixDQUFDRixPQUFPO1FBQy9CLElBQUksQ0FBQ0csMEJBQTBCLENBQUNILE9BQU87UUFDdkMsS0FBSyxDQUFDQTtJQUNSO0lBRUE7OztHQUdDLEdBQ0QsT0FBY0ksa0JBQW1CQyxlQUEyQyxFQUFFQyxRQUFRLENBQUMsRUFBcUI7UUFDMUcsT0FBTyxJQUFJdEIsaUJBQWtCO1lBQzNCdUIsWUFBWTtZQUNaQyxXQUFXLE1BQU1GO1lBQ2pCRyxZQUFZLE1BQU1IO1lBQ2xCSSxnQkFBZ0I7WUFDaEJDLFNBQVMsSUFBSUw7WUFDYk0scUJBQXFCO2dCQUNuQkMsZUFBZSxLQUFLUDtnQkFDcEJRLGdCQUFnQixLQUFLUjtZQUN2QjtZQUNBRCxpQkFBaUJBO1FBQ25CO0lBQ0Y7SUFFQTs7O0dBR0MsR0FDRCxPQUFjVSxPQUNabEIsS0FBa0MsRUFDbENtQixrQkFBd0IsRUFDeEJDLGVBQTRELEVBQXlDO1FBRXJHLE9BQU8sSUFBSTFCLGdCQUFzQ00sT0FBT21CLG9CQUFvQkM7SUFDOUU7SUE1UEEsWUFDRSxBQUFtQnBCLEtBQWtDLEVBQ3JEbUIsa0JBQXdCLEVBQ3hCQyxlQUE0RCxDQUFHO1FBRS9ELE1BQU05QixVQUFVWixZQUdJO1lBQ2xCMkMsUUFBUUMsRUFBRUMsSUFBSTtZQUNkQyxXQUFXRixFQUFFQyxJQUFJO1lBQ2pCRSwrQkFBK0JMLGdCQUFnQnZCLG9CQUFvQjtZQUVuRSwyRUFBMkU7WUFDM0U2QixvQkFBb0JDLENBQUFBO2dCQUNsQixNQUFNQyxXQUFXUixnQkFBZ0J2QixvQkFBb0IsQ0FBRThCO2dCQUN2REUsVUFBVUEsT0FBUUQsVUFBVTtnQkFDNUIsT0FBT0EsU0FBVUUsT0FBTztZQUMxQjtZQUNBQywyQkFBMkI7Z0JBQ3pCQyxTQUFTO2dCQUNUQyxXQUFXO2dCQUNYQyxVQUFVO2dCQUNWQyx3QkFBd0IvQztZQUMxQjtZQUNBZ0QsdUJBQXVCLENBQUM7UUFDMUIsR0FBR2hCO1FBRUgsS0FBSyxDQUFFOUIsZUEzQllVLFFBQUFBLFlBTExNLDZCQUE2QixJQUFJL0I7UUFrQy9DLElBQUksQ0FBQ3NCLG9CQUFvQixHQUFHUCxRQUFRTyxvQkFBb0I7UUFFeEQsTUFBTXdDLDRCQUE0QixJQUFJLENBQUNyQyxLQUFLLENBQUNxQyx5QkFBeUI7UUFDdEUsTUFBTXBDLDRCQUE0QixJQUFJLENBQUNELEtBQUssQ0FBQ0MseUJBQXlCO1FBQ3RFLE1BQU1xQyxxQ0FBcUMsSUFBSSxDQUFDdEMsS0FBSyxDQUFDc0Msa0NBQWtDO1FBQ3hGLE1BQU1DLHNDQUFzQyxJQUFJLENBQUN2QyxLQUFLLENBQUN1QyxtQ0FBbUM7UUFFMUYsK0RBQStEO1FBQy9EcEIsbUJBQW1CcUIsTUFBTSxDQUFFbEQsUUFBUXlDLHlCQUF5QjtRQUU1RCxNQUFNVSwwQkFBMEIsQ0FBRUM7WUFDaEMsTUFBTUMsb0JBQW9CTiwwQkFBMEJuQyxLQUFLO1lBQ3pELElBQUt5QyxtQkFBb0I7Z0JBQ3ZCLElBQUtELFNBQVU7b0JBQ2JwRCxRQUFRK0IsTUFBTSxDQUFFc0I7Z0JBQ2xCLE9BQ0s7b0JBQ0hyRCxRQUFRa0MsU0FBUyxDQUFFbUI7Z0JBQ3JCO1lBQ0Y7UUFDRjtRQUNBTCxtQ0FBbUNNLFFBQVEsQ0FBRUg7UUFFN0MsTUFBTUksZ0JBQWdCO1lBQ3BCQyxPQUFPO2dCQUVMLCtGQUErRjtnQkFDL0YsSUFBS1QsMEJBQTBCbkMsS0FBSyxLQUFLLE1BQU87b0JBQzlDbUMsMEJBQTBCbkMsS0FBSyxHQUFHWixRQUFReUQsb0JBQW9CO2dCQUNoRTtnQkFFQTlDLDBCQUEwQkMsS0FBSyxHQUFHO2dCQUVsQyw4RkFBOEY7Z0JBQzlGLElBQUttQywwQkFBMEJuQyxLQUFLLEtBQUssTUFBTztvQkFDOUMsTUFBTWIsT0FBT0MsUUFBUU8sb0JBQW9CLENBQUV3QywwQkFBMEJuQyxLQUFLO29CQUMxRWIsUUFBUVQseUJBQXlCa0IsUUFBUSxDQUFDQyxTQUFTLENBQUVWLE1BQU07Z0JBQzdEO1lBQ0Y7WUFDQTJELE1BQU07Z0JBQ0ovQywwQkFBMEJDLEtBQUssR0FBRztnQkFDbENvQyxtQ0FBbUNwQyxLQUFLLEdBQUc7WUFDN0M7WUFDQStDLE1BQU07Z0JBRUosNEdBQTRHO2dCQUM1RyxnSkFBZ0o7Z0JBQ2hKaEQsMEJBQTBCQyxLQUFLLEdBQUc7WUFDcEM7WUFDQWdELE1BQU07Z0JBRUosc0dBQXNHO2dCQUN0RyxtQ0FBbUM7Z0JBQ25DL0IsbUJBQW1CNkIsSUFBSTtZQUN6QjtRQUNGO1FBRUEseUdBQXlHO1FBQ3pHLG9IQUFvSDtRQUNwSCw0SEFBNEg7UUFDNUgsSUFBS2pFLDBCQUEyQm9DLHFCQUF1QjtZQUNyRCxNQUFNZ0Msd0NBQXdDLENBQUVDO2dCQUM5QyxJQUFLQSxRQUFTO29CQUNaLElBQUtwRCxNQUFNcUMseUJBQXlCLENBQUNuQyxLQUFLLEtBQUssTUFBTzt3QkFFcEQsbUNBQW1DO3dCQUNuQ0YsTUFBTXNDLGtDQUFrQyxDQUFDcEMsS0FBSyxHQUFHO3dCQUVqRCwrRkFBK0Y7d0JBQy9GRixNQUFNcUMseUJBQXlCLENBQUNuQyxLQUFLLEdBQUc7b0JBQzFDO29CQUVBLG9HQUFvRztvQkFDcEcsK0JBQStCO29CQUMvQkQsMEJBQTBCQyxLQUFLLEdBQUc7Z0JBQ3BDO1lBQ0Y7WUFDQWlCLG1CQUFtQmtDLG9DQUFvQyxDQUFDVCxRQUFRLENBQUVPO1lBRWxFLElBQUksQ0FBQ0csY0FBYyxDQUFDQyxXQUFXLENBQUU7Z0JBQy9CcEMsbUJBQW1Ca0Msb0NBQW9DLENBQUNHLE1BQU0sQ0FBRUw7WUFDbEU7UUFDRjtRQUVBLE1BQU1NLHVCQUF1QixJQUFJakYsVUFBVztZQUN4QzZEO1lBQ0FDO1NBQ0QsRUFDRCxDQUFFSyxtQkFBbUJlO1lBQ25CLElBQUlDLG9CQUFvQjtZQUN4QixJQUFLaEIsbUJBQW9CO2dCQUN2QixNQUFNdEQsT0FBT0MsUUFBUW1DLDZCQUE2QixDQUFFa0I7Z0JBQ3BELElBQUt0RCxNQUFPO29CQUNWLE1BQU11RSw0QkFBNEIsSUFBSS9FLGtCQUFtQlEsTUFBTTt3QkFBRXdFLFFBQVFIO29CQUFtQjtvQkFFNUYsNkRBQTZEO29CQUM3RHZDLG1CQUFtQjJDLGlCQUFpQixDQUFFRjtvQkFDdENELG9CQUFvQjtnQkFDdEI7WUFDRjtZQUVBLDJDQUEyQztZQUMzQyxDQUFDQSxxQkFBcUJ4QyxtQkFBbUIyQyxpQkFBaUIsQ0FBRTtZQUU1RCxJQUFLbkIsc0JBQXNCLE1BQU87Z0JBQ2hDLElBQUksQ0FBQ3JDLDBCQUEwQixDQUFDeUQsSUFBSTtZQUN0QztRQUNGO1FBR0YsK0NBQStDO1FBQy9DLE1BQU1DLGtCQUFrQixDQUFFbEM7WUFDeEIsSUFBSyxDQUFDQSxTQUFVO2dCQUNkUyxvQ0FBb0NyQyxLQUFLLEdBQUc7WUFDOUM7UUFDRjtRQUNBLElBQUksQ0FBQ0YsS0FBSyxDQUFDaUUsZUFBZSxDQUFDQyxJQUFJLENBQUVGO1FBQ2pDLElBQUksQ0FBQ1YsY0FBYyxDQUFDQyxXQUFXLENBQUU7WUFDL0IsSUFBSSxDQUFDdkQsS0FBSyxDQUFDaUUsZUFBZSxDQUFDVCxNQUFNLENBQUVRO1FBQ3JDO1FBRUEseUZBQXlGO1FBQ3pGLE1BQU1HLDhCQUE4QixJQUFJbkYsaUJBQWtCO1lBQ3hEb0YsWUFBWTtZQUNaQyxNQUFNO2dCQUFFO2dCQUFTO2dCQUFTO2FBQVU7WUFDcENDLE1BQU0sQ0FBRUMsT0FBT0M7Z0JBRWIsdUhBQXVIO2dCQUN2SCxJQUFLLElBQUksQ0FBQ3hFLEtBQUssQ0FBQzhCLE9BQU8sSUFBSU8sMEJBQTBCbkMsS0FBSyxLQUFLLFFBQVFaLFFBQVFvQyxrQkFBa0IsQ0FBRVcsMEJBQTBCbkMsS0FBSyxHQUFLO29CQUVySSxpRUFBaUU7b0JBQ2pFLElBQUtzRSxnQkFBZ0IsV0FBV0EsZ0JBQWdCLFNBQVU7d0JBQ3hEbEMsbUNBQW1DbUMsTUFBTTt3QkFDekNsQyxvQ0FBb0NyQyxLQUFLLEdBQUc7b0JBQzlDLE9BQ0ssSUFBS29DLG1DQUFtQ3BDLEtBQUssSUFBSXNFLGdCQUFnQixVQUFXO3dCQUMvRWxDLG1DQUFtQ3BDLEtBQUssR0FBRztvQkFDN0M7b0JBRUEsNkdBQTZHO29CQUM3R0QsMEJBQTBCQyxLQUFLLEdBQUc7Z0JBQ3BDO1lBQ0Y7UUFDRjtRQUVBLE1BQU13RSxvQkFBb0J2RCxtQkFBbUJ3RCxhQUFhLENBQUNDLFFBQVEsS0FBS25HLE1BQU1vRyxNQUFNLENBQUUxRCxtQkFBbUJ3RCxhQUFhLElBQUs7UUFFM0gsaUdBQWlHO1FBQ2pHLElBQUksQ0FBQ3ZFLGdDQUFnQyxHQUFHLElBQUl0QixjQUFlNEYsbUJBQW1CO1lBQzVFSSxhQUFhaEcsY0FBY2lHLDZCQUE2QjtZQUN4REMsYUFBYWxHLGNBQWNtRyw2QkFBNkI7WUFDeERDLGdCQUFnQnBHLGNBQWNxRyxzQkFBc0I7WUFDcERDLGdCQUFnQnRHLGNBQWN1RyxzQkFBc0I7UUFDdEQ7UUFFQSxJQUFJLENBQUNoRixrQkFBa0IsR0FBRyxJQUFJbkIsbUJBQW9CUCxlQUEyQztZQUMzRjZCLGlCQUFpQixJQUFJLENBQUNSLEtBQUssQ0FBQ3NGLDZCQUE2QjtRQUMzRCxHQUFHaEcsUUFBUThDLHFCQUFxQjtRQUNoQyxJQUFJLENBQUNoQyxnQ0FBZ0MsQ0FBQ21GLFFBQVEsQ0FBRSxJQUFJLENBQUNsRixrQkFBa0I7UUFFdkVjLG1CQUFtQnFFLHNCQUFzQixDQUFFLElBQUksQ0FBQ3BGLGdDQUFnQztRQUNoRmUsbUJBQW1Cc0UsZ0JBQWdCLENBQUU1QztRQUNyQzFCLG1CQUFtQnNFLGdCQUFnQixDQUFFdEI7UUFFckMsSUFBSSxDQUFDYixjQUFjLENBQUNDLFdBQVcsQ0FBRTtZQUMvQmpCLG1DQUFtQ2tCLE1BQU0sQ0FBRWY7WUFDM0N0QixtQkFBbUJxRSxzQkFBc0IsQ0FBRTtZQUMzQ3JFLG1CQUFtQjJDLGlCQUFpQixDQUFFO1lBQ3RDM0MsbUJBQW1CdUUsbUJBQW1CLENBQUV2QjtZQUN4Q2hELG1CQUFtQnVFLG1CQUFtQixDQUFFN0M7WUFDeENZLHFCQUFxQnRELE9BQU87WUFDNUJnRSw0QkFBNEJoRSxPQUFPO1FBQ3JDO0lBQ0Y7QUFrREY7QUExUUEsU0FBcUJULDZCQTBRcEI7QUFFRFQsWUFBWTBHLFFBQVEsQ0FBRSxtQkFBbUJqRyJ9