// Copyright 2021-2024, University of Colorado Boulder
/**
 * Manages the Properties which signify and control where various forms of focus are. A Focus
 * just contains the Trail pointing to the Node with focus and a Display whose root is at the
 * root of that Trail. So it can be used for more than just DOM focus. At the time of this writing,
 * the forms of Focus include
 *
 *  - DOM Focus - The Focus Trail points to the Node whose element has DOM focus in the Parallel DOM.
 *                Only one element can have focus at a time (DOM limitation) so this is managed by a static on
 *                FocusManager.
 *  - Pointer Focus - The Focus trail points to a Node that supports Highlighting with pointer events.
 *  - Reading Block Focus - The Focus Trail points to a Node that supports ReadingBlocks, and is active
 *                          while the ReadingBlock content is being spoken for Voicing. See ReadingBlock.ts
 *
 * There may be other forms of Focus in the future.
 *
 * This class also controls setting and clearing of several (but not all) of these Properties. It does not set the
 * pdomFocusProperty because that Property is set only when the browser's focus changes. Some of the focus
 * Properties are set in feature traits, such as pointerFocusProperty which is set by InteractiveHighlighting because it is
 * set through listeners on each individual Node.
 *
 * This class also has a few Properties that control the behavior of the Display's HighlightOverlay.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import { Focus, FocusDisplayedController, isInteractiveHighlighting, PDOMInstance, PDOMUtils, ReadingBlockUtterance, scenery, voicingManager } from '../imports.js';
let FocusManager = class FocusManager {
    dispose() {
        this.pointerFocusProperty.dispose();
        this.readingBlockFocusProperty.dispose();
        this.lockedPointerFocusProperty.dispose();
        this.pdomFocusHighlightsVisibleProperty.dispose();
        this.interactiveHighlightsVisibleProperty.dispose();
        this.readingBlockHighlightsVisibleProperty.dispose();
        this.readingBlockFocusController.dispose();
        this.pointerFocusDisplayedController.dispose();
        this.pointerHighlightsVisibleProperty.dispose();
        this.lockedPointerFocusDisplayedController.dispose();
        // @ts-expect-error
        voicingManager.startSpeakingEmitter.removeListener(this.startSpeakingListener);
        // @ts-expect-error
        voicingManager.endSpeakingEmitter.removeListener(this.endSpeakingListener);
        voicingManager.voicingFullyEnabledProperty.unlink(this.voicingFullyEnabledListener);
    }
    /**
   * Update the pdomFocus from a focusin/focusout event. Scenery events are batched so that they cannot be
   * reentrant. However, that means that scenery state that needs to be updated synchronously with the
   * changing DOM cannot happen in listeners that fire from scenery input. This method
   * is meant to be called from focusin/focusout listeners on the window so that The pdomFocus matches
   * browser state.
   *
   * @param displays - List of any displays that are attached to BrowserEvents.
   * @param event - The focusin/focusout event that triggered this update.
   * @param focus - True for focusin event, false for focusout event.
   */ static updatePDOMFocusFromEvent(displays, event, focus) {
        assert && assert(document.activeElement, 'Must be called from focusin, therefore active elemetn expected');
        if (focus) {
            // Look for the scenery target under the PDOM
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                const activeElement = document.activeElement;
                if (display.isElementUnderPDOM(activeElement, false)) {
                    const uniqueId = activeElement.getAttribute(PDOMUtils.DATA_PDOM_UNIQUE_ID);
                    assert && assert(uniqueId, 'Event target must have a unique ID on its data if it is in the PDOM.');
                    const trail = PDOMInstance.uniqueIdToTrail(display, uniqueId);
                    assert && assert(trail, 'We must have a trail since the target was under the PDOM.');
                    const visualTrail = PDOMInstance.guessVisualTrail(trail, display.rootNode);
                    if (visualTrail.lastNode().focusable) {
                        FocusManager.pdomFocus = new Focus(display, visualTrail);
                    } else {
                        // It is possible that `blur` or `focusout` listeners have removed the element from the traversal order
                        // before we receive the `focus` event. In that case, the browser will still try to put focus on the element
                        // even though the PDOM element and Node are not in the traversal order. It is more consistent to remove
                        // focus in this case.
                        event.target.blur();
                        // do not allow any more focus listeners to dispatch, this target should never have been focused in the
                        // first place, but the browser did it anyway
                        event.stopImmediatePropagation();
                    }
                    break;
                }
            }
        } else {
            for(let i = 0; i < displays.length; i++){
                const display = displays[i];
                // will be null if it is not in the PDOM or if it is undefined
                const relatedTargetTrail = display._input.getRelatedTargetTrail(event);
                // If there is a related target, set focus to the element that will receive focus right away. This prevents
                // the pdomFocus from being set to null. That is important for PDOMTree operations that will restore focus
                // to the next element after the PDOM is re-rendered.
                // See https://github.com/phetsims/scenery/issues/1296.
                if (relatedTargetTrail && relatedTargetTrail.lastNode().focusable) {
                    FocusManager.pdomFocus = new Focus(display, PDOMInstance.guessVisualTrail(relatedTargetTrail, display.rootNode));
                } else {
                    // Don't set this before the related target case because we want to support Node.blur listeners overwriting
                    // the relatedTarget behavior.
                    FocusManager.pdomFocus = null;
                }
            }
        }
    }
    // Listener to update the "active" highlight state for an interactiveHighlightingNode
    onPointerFocusChange(pointerFocus, oldFocus) {
        const focusNode = pointerFocus == null ? void 0 : pointerFocus.trail.lastNode();
        focusNode && isInteractiveHighlighting(focusNode) && focusNode.handleHighlightActiveChange();
        const oldFocusNode = oldFocus == null ? void 0 : oldFocus.trail.lastNode();
        oldFocusNode && isInteractiveHighlighting(oldFocusNode) && oldFocusNode.handleHighlightActiveChange();
    }
    /**
   * Set the DOM focus. A DOM limitation is that there can only be one element with focus at a time so this must
   * be a static for the FocusManager.
   */ static set pdomFocus(value) {
        if (FocusManager.pdomFocusProperty.value !== value) {
            let previousFocus;
            if (FocusManager.pdomFocusProperty.value) {
                previousFocus = FocusManager.pdomFocusedNode;
            }
            FocusManager.pdomFocusProperty.value = value;
            // if set to null, make sure that the active element is no longer focused
            if (previousFocus && !value) {
                previousFocus.blur();
            }
        }
    }
    /**
   * Get the Focus pointing to the Node whose Parallel DOM element has DOM focus.
   */ static get pdomFocus() {
        return FocusManager.pdomFocusProperty.value;
    }
    /**
   * Get the Node that currently has DOM focus, the leaf-most Node of the Focus Trail. Null if no
   * Node has focus.
   */ static getPDOMFocusedNode() {
        let focusedNode = null;
        const focus = FocusManager.pdomFocusProperty.get();
        if (focus) {
            focusedNode = focus.trail.lastNode();
        }
        return focusedNode;
    }
    static get pdomFocusedNode() {
        return this.getPDOMFocusedNode();
    }
    /**
   * Updates the _windowHasFocusProperty when the window receives/loses focus. When the window has focus
   * it is in the foreground of the user. When in the background, the window will not receive keyboard input.
   * https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event.
   *
   * This will be called by scenery for you when you use Display.initializeEvents().
   */ static attachToWindow() {
        assert && assert(!FocusManager.globallyAttached, 'Can only be attached statically once.');
        FocusManager.attachedWindowFocusListener = ()=>{
            FocusManager._windowHasFocusProperty.value = true;
        };
        FocusManager.attachedWindowBlurListener = ()=>{
            FocusManager._windowHasFocusProperty.value = false;
        };
        window.addEventListener('focus', FocusManager.attachedWindowFocusListener);
        window.addEventListener('blur', FocusManager.attachedWindowBlurListener);
        // value will be updated with window, but we need a proper initial value (this function may be called while
        // the window is not in the foreground).
        FocusManager._windowHasFocusProperty.value = document.hasFocus();
        FocusManager.globallyAttached = true;
    }
    /**
   * Detach all window focus/blur listeners from FocusManager watching for when the window loses focus.
   */ static detachFromWindow() {
        window.removeEventListener('focus', FocusManager.attachedWindowFocusListener);
        window.removeEventListener('blur', FocusManager.attachedWindowBlurListener);
        // For cleanup, this Property becomes false again when detaching because we will no longer be watching for changes.
        FocusManager._windowHasFocusProperty.value = false;
        FocusManager.globallyAttached = false;
    }
    constructor(){
        this.pointerFocusProperty = new Property(null);
        this.readingBlockFocusProperty = new Property(null);
        this.lockedPointerFocusProperty = new Property(null);
        this.pdomFocusHighlightsVisibleProperty = new BooleanProperty(true);
        this.interactiveHighlightsVisibleProperty = new BooleanProperty(false);
        this.readingBlockHighlightsVisibleProperty = new BooleanProperty(false);
        // TODO: perhaps remove once reading blocks are set up to listen instead to Node.canSpeakProperty (voicingVisible), https://github.com/phetsims/scenery/issues/1343
        this.voicingFullyEnabledListener = (enabled)=>{
            this.readingBlockHighlightsVisibleProperty.value = enabled;
        };
        voicingManager.voicingFullyEnabledProperty.link(this.voicingFullyEnabledListener);
        this.pointerHighlightsVisibleProperty = new DerivedProperty([
            this.interactiveHighlightsVisibleProperty,
            this.readingBlockHighlightsVisibleProperty
        ], (interactiveHighlightsVisible, voicingEnabled)=>{
            return interactiveHighlightsVisible || voicingEnabled;
        });
        //-----------------------------------------------------------------------------------------------------------------
        // The following section manages control of ReadingBlockFocusProperty. It takes a value whenever the
        // voicingManager starts speaking and the value is cleared when it stops speaking. Focus is also cleared
        // by the FocusDisplayedController.
        this.readingBlockFocusController = new FocusDisplayedController(this.readingBlockFocusProperty);
        this.startSpeakingListener = (text, utterance)=>{
            this.readingBlockFocusProperty.value = utterance instanceof ReadingBlockUtterance ? utterance.readingBlockFocus : null;
        };
        // @ts-expect-error
        voicingManager.startSpeakingEmitter.addListener(this.startSpeakingListener);
        this.endSpeakingListener = (text, utterance)=>{
            if (utterance instanceof ReadingBlockUtterance && this.readingBlockFocusProperty.value) {
                assert && assert(utterance.readingBlockFocus, 'should be non null focus');
                // only clear the readingBlockFocusProperty if the ReadingBlockUtterance has a Focus that matches the
                // current value for readingBlockFocusProperty so that the highlight doesn't disappear every time
                // the speaker stops talking
                if (utterance.readingBlockFocus.trail.equals(this.readingBlockFocusProperty.value.trail)) {
                    this.readingBlockFocusProperty.value = null;
                }
            }
        };
        // @ts-expect-error
        voicingManager.endSpeakingEmitter.addListener(this.endSpeakingListener);
        //-----------------------------------------------------------------------------------------------------------------
        // The following section manages control of pointerFocusProperty - pointerFocusProperty is set with a Focus
        // by InteractiveHighlighting from listeners on Nodes that use that Trait. But it uses a FocusDisplayedController
        // to remove the focus at the right time.
        this.pointerFocusDisplayedController = new FocusDisplayedController(this.pointerFocusProperty);
        this.lockedPointerFocusDisplayedController = new FocusDisplayedController(this.lockedPointerFocusProperty);
        [
            this.pointerFocusProperty,
            this.lockedPointerFocusProperty
        ].forEach((property)=>{
            property.link(this.onPointerFocusChange.bind(this));
        });
    }
};
// References to the window listeners that update when the window has focus. So they can be removed if needed.
FocusManager.attachedWindowFocusListener = null;
FocusManager.attachedWindowBlurListener = null;
FocusManager.globallyAttached = false;
// Display has an axon `Property to indicate which component is focused (or null if no
// scenery Node has focus). By passing the tandem and phetioTye, PhET-iO is able to interoperate (save, restore,
// control, observe what is currently focused). See FocusManager.pdomFocus for setting the focus. Don't set the value
// of this Property directly.
FocusManager.pdomFocusProperty = new Property(null, {
    tandem: Tandem.GENERAL_MODEL.createTandem('pdomFocusProperty'),
    phetioDocumentation: 'Stores the current focus in the Parallel DOM, null if nothing has focus. This is not updated ' + 'based on mouse or touch input, only keyboard and other alternative inputs. Note that this only ' + 'applies to simulations that support alternative input.',
    phetioValueType: NullableIO(Focus.FocusIO),
    phetioState: false,
    phetioFeatured: true,
    phetioReadOnly: true
});
/**
   * A Property that lets you know when the window has focus. When the window has focus, it is in the user's foreground.
   * When in the background, the window does not receive keyboard input (important for global keyboard events).
   */ FocusManager._windowHasFocusProperty = new BooleanProperty(false);
FocusManager.windowHasFocusProperty = FocusManager._windowHasFocusProperty;
export { FocusManager as default };
scenery.register('FocusManager', FocusManager);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9Gb2N1c01hbmFnZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWFuYWdlcyB0aGUgUHJvcGVydGllcyB3aGljaCBzaWduaWZ5IGFuZCBjb250cm9sIHdoZXJlIHZhcmlvdXMgZm9ybXMgb2YgZm9jdXMgYXJlLiBBIEZvY3VzXG4gKiBqdXN0IGNvbnRhaW5zIHRoZSBUcmFpbCBwb2ludGluZyB0byB0aGUgTm9kZSB3aXRoIGZvY3VzIGFuZCBhIERpc3BsYXkgd2hvc2Ugcm9vdCBpcyBhdCB0aGVcbiAqIHJvb3Qgb2YgdGhhdCBUcmFpbC4gU28gaXQgY2FuIGJlIHVzZWQgZm9yIG1vcmUgdGhhbiBqdXN0IERPTSBmb2N1cy4gQXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLFxuICogdGhlIGZvcm1zIG9mIEZvY3VzIGluY2x1ZGVcbiAqXG4gKiAgLSBET00gRm9jdXMgLSBUaGUgRm9jdXMgVHJhaWwgcG9pbnRzIHRvIHRoZSBOb2RlIHdob3NlIGVsZW1lbnQgaGFzIERPTSBmb2N1cyBpbiB0aGUgUGFyYWxsZWwgRE9NLlxuICogICAgICAgICAgICAgICAgT25seSBvbmUgZWxlbWVudCBjYW4gaGF2ZSBmb2N1cyBhdCBhIHRpbWUgKERPTSBsaW1pdGF0aW9uKSBzbyB0aGlzIGlzIG1hbmFnZWQgYnkgYSBzdGF0aWMgb25cbiAqICAgICAgICAgICAgICAgIEZvY3VzTWFuYWdlci5cbiAqICAtIFBvaW50ZXIgRm9jdXMgLSBUaGUgRm9jdXMgdHJhaWwgcG9pbnRzIHRvIGEgTm9kZSB0aGF0IHN1cHBvcnRzIEhpZ2hsaWdodGluZyB3aXRoIHBvaW50ZXIgZXZlbnRzLlxuICogIC0gUmVhZGluZyBCbG9jayBGb2N1cyAtIFRoZSBGb2N1cyBUcmFpbCBwb2ludHMgdG8gYSBOb2RlIHRoYXQgc3VwcG9ydHMgUmVhZGluZ0Jsb2NrcywgYW5kIGlzIGFjdGl2ZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIHRoZSBSZWFkaW5nQmxvY2sgY29udGVudCBpcyBiZWluZyBzcG9rZW4gZm9yIFZvaWNpbmcuIFNlZSBSZWFkaW5nQmxvY2sudHNcbiAqXG4gKiBUaGVyZSBtYXkgYmUgb3RoZXIgZm9ybXMgb2YgRm9jdXMgaW4gdGhlIGZ1dHVyZS5cbiAqXG4gKiBUaGlzIGNsYXNzIGFsc28gY29udHJvbHMgc2V0dGluZyBhbmQgY2xlYXJpbmcgb2Ygc2V2ZXJhbCAoYnV0IG5vdCBhbGwpIG9mIHRoZXNlIFByb3BlcnRpZXMuIEl0IGRvZXMgbm90IHNldCB0aGVcbiAqIHBkb21Gb2N1c1Byb3BlcnR5IGJlY2F1c2UgdGhhdCBQcm9wZXJ0eSBpcyBzZXQgb25seSB3aGVuIHRoZSBicm93c2VyJ3MgZm9jdXMgY2hhbmdlcy4gU29tZSBvZiB0aGUgZm9jdXNcbiAqIFByb3BlcnRpZXMgYXJlIHNldCBpbiBmZWF0dXJlIHRyYWl0cywgc3VjaCBhcyBwb2ludGVyRm9jdXNQcm9wZXJ0eSB3aGljaCBpcyBzZXQgYnkgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgYmVjYXVzZSBpdCBpc1xuICogc2V0IHRocm91Z2ggbGlzdGVuZXJzIG9uIGVhY2ggaW5kaXZpZHVhbCBOb2RlLlxuICpcbiAqIFRoaXMgY2xhc3MgYWxzbyBoYXMgYSBmZXcgUHJvcGVydGllcyB0aGF0IGNvbnRyb2wgdGhlIGJlaGF2aW9yIG9mIHRoZSBEaXNwbGF5J3MgSGlnaGxpZ2h0T3ZlcmxheS5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcbmltcG9ydCB7IERpc3BsYXksIEZvY3VzLCBGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIsIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIE5vZGUsIFBET01JbnN0YW5jZSwgUERPTVV0aWxzLCBSZWFkaW5nQmxvY2tVdHRlcmFuY2UsIHNjZW5lcnksIHZvaWNpbmdNYW5hZ2VyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgU3BlYWtpbmdMaXN0ZW5lciA9ICggdGV4dDogc3RyaW5nLCB1dHRlcmFuY2U6IFV0dGVyYW5jZSApID0+IHZvaWQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvY3VzTWFuYWdlciB7XG5cbiAgLy8gVGhpcyBQcm9wZXJ0eSB3aG9zZSBGb2N1cyBUcmFpbCBwb2ludHMgdG8gdGhlIE5vZGUgdW5kZXIgdGhlIHBvaW50ZXIgdG9cbiAgLy8gc3VwcG9ydCBmZWF0dXJlcyBvZiBWb2ljaW5nIGFuZCBJbnRlcmFjdGl2ZSBIaWdobGlnaHRzLiBOb2RlcyB0aGF0IGNvbXBvc2UgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcgY2FuXG4gIC8vIHJlY2VpdmUgdGhpcyBGb2N1cyBhbmQgYSBoaWdobGlnaHQgbWF5IGFwcGVhciBhcm91bmQgaXQuXG4gIHB1YmxpYyByZWFkb25seSBwb2ludGVyRm9jdXNQcm9wZXJ0eTogVFByb3BlcnR5PEZvY3VzIHwgbnVsbD47XG5cbiAgLy8gVGhlIFByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoaWNoIE5vZGUgdGhhdCB1c2VzIFJlYWRpbmdCbG9jayBpcyBjdXJyZW50bHlcbiAgLy8gYWN0aXZlLiBVc2VkIGJ5IHRoZSBIaWdobGlnaHRPdmVybGF5IHRvIGhpZ2hsaWdodCBSZWFkaW5nQmxvY2sgTm9kZXMgd2hvc2UgY29udGVudCBpcyBiZWluZyBzcG9rZW4uXG4gIHB1YmxpYyByZWFkb25seSByZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5OiBUUHJvcGVydHk8Rm9jdXMgfCBudWxsPjtcblxuICAvLyBBIFByb3BlcnR5IHdob3NlIHZhbHVlIGlzIGVpdGhlciBudWxsIG9yIGEgRm9jdXMgd2l0aCBUcmFpbCBhbmQgRGlzcGxheSBlcXVhbFxuICAvLyB0byB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkuIFdoZW4gdGhpcyBQcm9wZXJ0eSBoYXMgYSB2YWx1ZSwgdGhlIEhpZ2hsaWdodE92ZXJsYXkgd2lsbCB3YWl0IHRvIHVwZGF0ZSB0aGVcbiAgLy8gaGlnaGxpZ2h0IGZvciB0aGUgcG9pbnRlckZvY3VzUHJvcGVydHkuIFRoaXMgaXMgdXNlZnVsIHdoZW4gdGhlIHBvaW50ZXIgaGFzIGJlZ3VuIHRvIGludGVyYWN0IHdpdGggYSBOb2RlXG4gIC8vIHRoYXQgdXNlcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgYnV0IHRoZSBtb3VzZSBoYXMgbW92ZWQgb3V0IG9mIGl0IG9yIG92ZXIgYW5vdGhlciBkdXJpbmcgaW50ZXJhY3Rpb24uIFRoZVxuICAvLyBoaWdobGlnaHQgc2hvdWxkIHJlbWFpbiBvbiB0aGUgTm9kZSByZWNlaXZpbmcgaW50ZXJhY3Rpb24gYW5kIHdhaXQgdG8gdXBkYXRlIHVudGlsIGludGVyYWN0aW9uIGNvbXBsZXRlcy5cbiAgcHVibGljIHJlYWRvbmx5IGxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5OiBUUHJvcGVydHk8Rm9jdXMgfCBudWxsPjtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIG9yIG5vdCBoaWdobGlnaHRzIHJlbGF0ZWQgdG8gUERPTSBmb2N1cyBhcmUgdmlzaWJsZS5cbiAgcHVibGljIHJlYWRvbmx5IHBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBDb250cm9scyB3aGV0aGVyIFwiSW50ZXJhY3RpdmUgSGlnaGxpZ2h0c1wiIGFyZSB2aXNpYmxlLlxuICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gQ29udHJvbHMgd2hldGhlciBcIlJlYWRpbmcgQmxvY2tcIiBoaWdobGlnaHRzIHdpbGwgYmUgdmlzaWJsZSBhcm91bmQgTm9kZXNcbiAgLy8gdGhhdCB1c2UgUmVhZGluZ0Jsb2NrLlxuICBwdWJsaWMgcmVhZG9ubHkgcmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIEluZGljYXRlcyB3aGV0aGVyIGFueSBoaWdobGlnaHRzIHNob3VsZCBhcHBlYXIgZnJvbSBwb2ludGVyXG4gIC8vIGlucHV0IChtb3VzZS90b3VjaCkuIElmIGZhbHNlLCB3ZSB3aWxsIHRyeSB0byBhdm9pZCBkb2luZyBleHBlbnNpdmUgd29yayBpbiBQb2ludGVySGlnaGxpZ2h0aW5nLmpzLlxuICBwdWJsaWMgcmVhZG9ubHkgcG9pbnRlckhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIFdoZW5ldmVyIHRoZSByZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5J3MgRm9jdXNlZCBOb2RlIGlzIHJlbW92ZWQgZnJvbVxuICAvLyB0aGUgc2NlbmUgZ3JhcGggb3IgaXRzIFRyYWlsIGJlY29tZXMgaW52aXNpYmxlIHRoaXMgcmVtb3ZlcyBmb2N1cy5cbiAgcHJpdmF0ZSByZWFkb25seSByZWFkaW5nQmxvY2tGb2N1c0NvbnRyb2xsZXI6IEZvY3VzRGlzcGxheWVkQ29udHJvbGxlcjtcblxuICAvLyBXaGVuIHRoZSBsb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eSdzIE5vZGUgYmVjb21lcyBpbnZpc2libGUgb3IgaXMgcmVtb3ZlZCBmcm9tIHRoZSBzY2VuZVxuICAvLyBncmFwaCwgdGhlIGxvY2tlZCBwb2ludGVyIGZvY3VzIGlzIGNsZWFyZWQuXG4gIHByaXZhdGUgcmVhZG9ubHkgbG9ja2VkUG9pbnRlckZvY3VzRGlzcGxheWVkQ29udHJvbGxlcjogRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyO1xuXG4gIC8vIElmIHRoZSB2b2ljaW5nTWFuYWdlciBzdGFydHMgc3BlYWtpbmcgYW4gVXR0ZXJhbmNlIGZvciBhIFJlYWRpbmdCTG9jaywgc2V0IHRoZSByZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5IGFuZFxuICAvLyBhZGQgbGlzdGVuZXJzIHRvIGNsZWFyIGl0IHdoZW4gdGhlIE5vZGUgaXMgcmVtb3ZlZCBvciBiZWNvbWVzIGludmlzaWJsZVxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXJ0U3BlYWtpbmdMaXN0ZW5lcjogU3BlYWtpbmdMaXN0ZW5lcjtcblxuICAvLyBXaGVuZXZlciB0aGUgdm9pY2luZ01hbmFnZXIgc3RvcHMgc3BlYWtpbmcgYW4gdXR0ZXJhbmNlIGZvciB0aGUgUmVhZGluZ0Jsb2NrIHRoYXQgaGFzIGZvY3VzLCBjbGVhciBpdFxuICBwcml2YXRlIHJlYWRvbmx5IGVuZFNwZWFraW5nTGlzdGVuZXI6IFNwZWFraW5nTGlzdGVuZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgcG9pbnRlckZvY3VzRGlzcGxheWVkQ29udHJvbGxlcjogRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgdm9pY2luZ0Z1bGx5RW5hYmxlZExpc3RlbmVyOiAoIGVuYWJsZWQ6IGJvb2xlYW4gKSA9PiB2b2lkO1xuXG4gIC8vIFJlZmVyZW5jZXMgdG8gdGhlIHdpbmRvdyBsaXN0ZW5lcnMgdGhhdCB1cGRhdGUgd2hlbiB0aGUgd2luZG93IGhhcyBmb2N1cy4gU28gdGhleSBjYW4gYmUgcmVtb3ZlZCBpZiBuZWVkZWQuXG4gIHByaXZhdGUgc3RhdGljIGF0dGFjaGVkV2luZG93Rm9jdXNMaXN0ZW5lcjogbnVsbCB8ICggKCkgPT4gdm9pZCApID0gbnVsbDtcbiAgcHJpdmF0ZSBzdGF0aWMgYXR0YWNoZWRXaW5kb3dCbHVyTGlzdGVuZXI6IG51bGwgfCAoICgpID0+IHZvaWQgKSA9IG51bGw7XG4gIHByaXZhdGUgc3RhdGljIGdsb2JhbGx5QXR0YWNoZWQgPSBmYWxzZTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wb2ludGVyRm9jdXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xuICAgIHRoaXMubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcbiAgICB0aGlzLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG4gICAgdGhpcy5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICAvLyBUT0RPOiBwZXJoYXBzIHJlbW92ZSBvbmNlIHJlYWRpbmcgYmxvY2tzIGFyZSBzZXQgdXAgdG8gbGlzdGVuIGluc3RlYWQgdG8gTm9kZS5jYW5TcGVha1Byb3BlcnR5ICh2b2ljaW5nVmlzaWJsZSksIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMzQzXG4gICAgdGhpcy52b2ljaW5nRnVsbHlFbmFibGVkTGlzdGVuZXIgPSBlbmFibGVkID0+IHtcbiAgICAgIHRoaXMucmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGVuYWJsZWQ7XG4gICAgfTtcbiAgICB2b2ljaW5nTWFuYWdlci52b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkubGluayggdGhpcy52b2ljaW5nRnVsbHlFbmFibGVkTGlzdGVuZXIgKTtcblxuICAgIHRoaXMucG9pbnRlckhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxuICAgICAgWyB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSwgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IF0sXG4gICAgICAoIGludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGUsIHZvaWNpbmdFbmFibGVkICkgPT4ge1xuICAgICAgICByZXR1cm4gaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZSB8fCB2b2ljaW5nRW5hYmxlZDtcbiAgICAgIH0gKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBUaGUgZm9sbG93aW5nIHNlY3Rpb24gbWFuYWdlcyBjb250cm9sIG9mIFJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkuIEl0IHRha2VzIGEgdmFsdWUgd2hlbmV2ZXIgdGhlXG4gICAgLy8gdm9pY2luZ01hbmFnZXIgc3RhcnRzIHNwZWFraW5nIGFuZCB0aGUgdmFsdWUgaXMgY2xlYXJlZCB3aGVuIGl0IHN0b3BzIHNwZWFraW5nLiBGb2N1cyBpcyBhbHNvIGNsZWFyZWRcbiAgICAvLyBieSB0aGUgRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyLlxuXG4gICAgdGhpcy5yZWFkaW5nQmxvY2tGb2N1c0NvbnRyb2xsZXIgPSBuZXcgRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyKCB0aGlzLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkgKTtcblxuICAgIHRoaXMuc3RhcnRTcGVha2luZ0xpc3RlbmVyID0gKCB0ZXh0LCB1dHRlcmFuY2UgKSA9PiB7XG4gICAgICB0aGlzLnJlYWRpbmdCbG9ja0ZvY3VzUHJvcGVydHkudmFsdWUgPSB1dHRlcmFuY2UgaW5zdGFuY2VvZiBSZWFkaW5nQmxvY2tVdHRlcmFuY2UgPyB1dHRlcmFuY2UucmVhZGluZ0Jsb2NrRm9jdXMgOiBudWxsO1xuICAgIH07XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgdm9pY2luZ01hbmFnZXIuc3RhcnRTcGVha2luZ0VtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuc3RhcnRTcGVha2luZ0xpc3RlbmVyICk7XG5cbiAgICB0aGlzLmVuZFNwZWFraW5nTGlzdGVuZXIgPSAoIHRleHQsIHV0dGVyYW5jZSApID0+IHtcbiAgICAgIGlmICggdXR0ZXJhbmNlIGluc3RhbmNlb2YgUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlICYmIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eS52YWx1ZSApIHtcblxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB1dHRlcmFuY2UucmVhZGluZ0Jsb2NrRm9jdXMsICdzaG91bGQgYmUgbm9uIG51bGwgZm9jdXMnICk7XG5cbiAgICAgICAgLy8gb25seSBjbGVhciB0aGUgcmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSBpZiB0aGUgUmVhZGluZ0Jsb2NrVXR0ZXJhbmNlIGhhcyBhIEZvY3VzIHRoYXQgbWF0Y2hlcyB0aGVcbiAgICAgICAgLy8gY3VycmVudCB2YWx1ZSBmb3IgcmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eSBzbyB0aGF0IHRoZSBoaWdobGlnaHQgZG9lc24ndCBkaXNhcHBlYXIgZXZlcnkgdGltZVxuICAgICAgICAvLyB0aGUgc3BlYWtlciBzdG9wcyB0YWxraW5nXG4gICAgICAgIGlmICggdXR0ZXJhbmNlLnJlYWRpbmdCbG9ja0ZvY3VzIS50cmFpbC5lcXVhbHMoIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eS52YWx1ZS50cmFpbCApICkge1xuICAgICAgICAgIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHZvaWNpbmdNYW5hZ2VyLmVuZFNwZWFraW5nRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5lbmRTcGVha2luZ0xpc3RlbmVyICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gVGhlIGZvbGxvd2luZyBzZWN0aW9uIG1hbmFnZXMgY29udHJvbCBvZiBwb2ludGVyRm9jdXNQcm9wZXJ0eSAtIHBvaW50ZXJGb2N1c1Byb3BlcnR5IGlzIHNldCB3aXRoIGEgRm9jdXNcbiAgICAvLyBieSBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyBmcm9tIGxpc3RlbmVycyBvbiBOb2RlcyB0aGF0IHVzZSB0aGF0IFRyYWl0LiBCdXQgaXQgdXNlcyBhIEZvY3VzRGlzcGxheWVkQ29udHJvbGxlclxuICAgIC8vIHRvIHJlbW92ZSB0aGUgZm9jdXMgYXQgdGhlIHJpZ2h0IHRpbWUuXG4gICAgdGhpcy5wb2ludGVyRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyID0gbmV3IEZvY3VzRGlzcGxheWVkQ29udHJvbGxlciggdGhpcy5wb2ludGVyRm9jdXNQcm9wZXJ0eSApO1xuICAgIHRoaXMubG9ja2VkUG9pbnRlckZvY3VzRGlzcGxheWVkQ29udHJvbGxlciA9IG5ldyBGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIoIHRoaXMubG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkgKTtcblxuICAgIFtcbiAgICAgIHRoaXMucG9pbnRlckZvY3VzUHJvcGVydHksXG4gICAgICB0aGlzLmxvY2tlZFBvaW50ZXJGb2N1c1Byb3BlcnR5XG4gICAgXS5mb3JFYWNoKCBwcm9wZXJ0eSA9PiB7XG4gICAgICBwcm9wZXJ0eS5saW5rKCB0aGlzLm9uUG9pbnRlckZvY3VzQ2hhbmdlLmJpbmQoIHRoaXMgKSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMucG9pbnRlckZvY3VzUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMucmVhZGluZ0Jsb2NrRm9jdXNQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5sb2NrZWRQb2ludGVyRm9jdXNQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5yZWFkaW5nQmxvY2tIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLnJlYWRpbmdCbG9ja0ZvY3VzQ29udHJvbGxlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5wb2ludGVyRm9jdXNEaXNwbGF5ZWRDb250cm9sbGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnBvaW50ZXJIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLmxvY2tlZFBvaW50ZXJGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIuZGlzcG9zZSgpO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHZvaWNpbmdNYW5hZ2VyLnN0YXJ0U3BlYWtpbmdFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnN0YXJ0U3BlYWtpbmdMaXN0ZW5lciApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHZvaWNpbmdNYW5hZ2VyLmVuZFNwZWFraW5nRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5lbmRTcGVha2luZ0xpc3RlbmVyICk7XG5cbiAgICB2b2ljaW5nTWFuYWdlci52b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkudW5saW5rKCB0aGlzLnZvaWNpbmdGdWxseUVuYWJsZWRMaXN0ZW5lciApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgcGRvbUZvY3VzIGZyb20gYSBmb2N1c2luL2ZvY3Vzb3V0IGV2ZW50LiBTY2VuZXJ5IGV2ZW50cyBhcmUgYmF0Y2hlZCBzbyB0aGF0IHRoZXkgY2Fubm90IGJlXG4gICAqIHJlZW50cmFudC4gSG93ZXZlciwgdGhhdCBtZWFucyB0aGF0IHNjZW5lcnkgc3RhdGUgdGhhdCBuZWVkcyB0byBiZSB1cGRhdGVkIHN5bmNocm9ub3VzbHkgd2l0aCB0aGVcbiAgICogY2hhbmdpbmcgRE9NIGNhbm5vdCBoYXBwZW4gaW4gbGlzdGVuZXJzIHRoYXQgZmlyZSBmcm9tIHNjZW5lcnkgaW5wdXQuIFRoaXMgbWV0aG9kXG4gICAqIGlzIG1lYW50IHRvIGJlIGNhbGxlZCBmcm9tIGZvY3VzaW4vZm9jdXNvdXQgbGlzdGVuZXJzIG9uIHRoZSB3aW5kb3cgc28gdGhhdCBUaGUgcGRvbUZvY3VzIG1hdGNoZXNcbiAgICogYnJvd3NlciBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIGRpc3BsYXlzIC0gTGlzdCBvZiBhbnkgZGlzcGxheXMgdGhhdCBhcmUgYXR0YWNoZWQgdG8gQnJvd3NlckV2ZW50cy5cbiAgICogQHBhcmFtIGV2ZW50IC0gVGhlIGZvY3VzaW4vZm9jdXNvdXQgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhpcyB1cGRhdGUuXG4gICAqIEBwYXJhbSBmb2N1cyAtIFRydWUgZm9yIGZvY3VzaW4gZXZlbnQsIGZhbHNlIGZvciBmb2N1c291dCBldmVudC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgdXBkYXRlUERPTUZvY3VzRnJvbUV2ZW50KCBkaXNwbGF5czogRGlzcGxheVtdLCBldmVudDogRm9jdXNFdmVudCwgZm9jdXM6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgJ011c3QgYmUgY2FsbGVkIGZyb20gZm9jdXNpbiwgdGhlcmVmb3JlIGFjdGl2ZSBlbGVtZXRuIGV4cGVjdGVkJyApO1xuXG4gICAgaWYgKCBmb2N1cyApIHtcblxuICAgICAgLy8gTG9vayBmb3IgdGhlIHNjZW5lcnkgdGFyZ2V0IHVuZGVyIHRoZSBQRE9NXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBkaXNwbGF5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XG5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmICggZGlzcGxheS5pc0VsZW1lbnRVbmRlclBET00oIGFjdGl2ZUVsZW1lbnQsIGZhbHNlICkgKSB7XG4gICAgICAgICAgY29uc3QgdW5pcXVlSWQgPSBhY3RpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSggUERPTVV0aWxzLkRBVEFfUERPTV9VTklRVUVfSUQgKSE7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdW5pcXVlSWQsICdFdmVudCB0YXJnZXQgbXVzdCBoYXZlIGEgdW5pcXVlIElEIG9uIGl0cyBkYXRhIGlmIGl0IGlzIGluIHRoZSBQRE9NLicgKTtcblxuICAgICAgICAgIGNvbnN0IHRyYWlsID0gUERPTUluc3RhbmNlLnVuaXF1ZUlkVG9UcmFpbCggZGlzcGxheSwgdW5pcXVlSWQgKSE7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhaWwsICdXZSBtdXN0IGhhdmUgYSB0cmFpbCBzaW5jZSB0aGUgdGFyZ2V0IHdhcyB1bmRlciB0aGUgUERPTS4nICk7XG5cbiAgICAgICAgICBjb25zdCB2aXN1YWxUcmFpbCA9IFBET01JbnN0YW5jZS5ndWVzc1Zpc3VhbFRyYWlsKCB0cmFpbCwgZGlzcGxheS5yb290Tm9kZSApO1xuICAgICAgICAgIGlmICggdmlzdWFsVHJhaWwubGFzdE5vZGUoKS5mb2N1c2FibGUgKSB7XG4gICAgICAgICAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzID0gbmV3IEZvY3VzKCBkaXNwbGF5LCB2aXN1YWxUcmFpbCApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgLy8gSXQgaXMgcG9zc2libGUgdGhhdCBgYmx1cmAgb3IgYGZvY3Vzb3V0YCBsaXN0ZW5lcnMgaGF2ZSByZW1vdmVkIHRoZSBlbGVtZW50IGZyb20gdGhlIHRyYXZlcnNhbCBvcmRlclxuICAgICAgICAgICAgLy8gYmVmb3JlIHdlIHJlY2VpdmUgdGhlIGBmb2N1c2AgZXZlbnQuIEluIHRoYXQgY2FzZSwgdGhlIGJyb3dzZXIgd2lsbCBzdGlsbCB0cnkgdG8gcHV0IGZvY3VzIG9uIHRoZSBlbGVtZW50XG4gICAgICAgICAgICAvLyBldmVuIHRob3VnaCB0aGUgUERPTSBlbGVtZW50IGFuZCBOb2RlIGFyZSBub3QgaW4gdGhlIHRyYXZlcnNhbCBvcmRlci4gSXQgaXMgbW9yZSBjb25zaXN0ZW50IHRvIHJlbW92ZVxuICAgICAgICAgICAgLy8gZm9jdXMgaW4gdGhpcyBjYXNlLlxuICAgICAgICAgICAgKCBldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQgKS5ibHVyKCk7XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCBhbGxvdyBhbnkgbW9yZSBmb2N1cyBsaXN0ZW5lcnMgdG8gZGlzcGF0Y2gsIHRoaXMgdGFyZ2V0IHNob3VsZCBuZXZlciBoYXZlIGJlZW4gZm9jdXNlZCBpbiB0aGVcbiAgICAgICAgICAgIC8vIGZpcnN0IHBsYWNlLCBidXQgdGhlIGJyb3dzZXIgZGlkIGl0IGFueXdheVxuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gbm8gbmVlZCB0byBrZWVwIHNlYXJjaGluZ1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZGlzcGxheXMubGVuZ3RoOyBpKysgKSB7XG5cbiAgICAgICAgY29uc3QgZGlzcGxheSA9IGRpc3BsYXlzWyBpIF07XG5cbiAgICAgICAgLy8gd2lsbCBiZSBudWxsIGlmIGl0IGlzIG5vdCBpbiB0aGUgUERPTSBvciBpZiBpdCBpcyB1bmRlZmluZWRcbiAgICAgICAgY29uc3QgcmVsYXRlZFRhcmdldFRyYWlsID0gZGlzcGxheS5faW5wdXQhLmdldFJlbGF0ZWRUYXJnZXRUcmFpbCggZXZlbnQgKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHJlbGF0ZWQgdGFyZ2V0LCBzZXQgZm9jdXMgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIHJlY2VpdmUgZm9jdXMgcmlnaHQgYXdheS4gVGhpcyBwcmV2ZW50c1xuICAgICAgICAvLyB0aGUgcGRvbUZvY3VzIGZyb20gYmVpbmcgc2V0IHRvIG51bGwuIFRoYXQgaXMgaW1wb3J0YW50IGZvciBQRE9NVHJlZSBvcGVyYXRpb25zIHRoYXQgd2lsbCByZXN0b3JlIGZvY3VzXG4gICAgICAgIC8vIHRvIHRoZSBuZXh0IGVsZW1lbnQgYWZ0ZXIgdGhlIFBET00gaXMgcmUtcmVuZGVyZWQuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI5Ni5cbiAgICAgICAgaWYgKCByZWxhdGVkVGFyZ2V0VHJhaWwgJiYgcmVsYXRlZFRhcmdldFRyYWlsLmxhc3ROb2RlKCkuZm9jdXNhYmxlICkge1xuICAgICAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXMgPSBuZXcgRm9jdXMoIGRpc3BsYXksIFBET01JbnN0YW5jZS5ndWVzc1Zpc3VhbFRyYWlsKCByZWxhdGVkVGFyZ2V0VHJhaWwsIGRpc3BsYXkucm9vdE5vZGUgKSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgLy8gRG9uJ3Qgc2V0IHRoaXMgYmVmb3JlIHRoZSByZWxhdGVkIHRhcmdldCBjYXNlIGJlY2F1c2Ugd2Ugd2FudCB0byBzdXBwb3J0IE5vZGUuYmx1ciBsaXN0ZW5lcnMgb3ZlcndyaXRpbmdcbiAgICAgICAgICAvLyB0aGUgcmVsYXRlZFRhcmdldCBiZWhhdmlvci5cbiAgICAgICAgICBGb2N1c01hbmFnZXIucGRvbUZvY3VzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIExpc3RlbmVyIHRvIHVwZGF0ZSB0aGUgXCJhY3RpdmVcIiBoaWdobGlnaHQgc3RhdGUgZm9yIGFuIGludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZVxuICBwcml2YXRlIG9uUG9pbnRlckZvY3VzQ2hhbmdlKCBwb2ludGVyRm9jdXM6IEZvY3VzIHwgbnVsbCwgb2xkRm9jdXM6IEZvY3VzIHwgbnVsbCApOiB2b2lkIHtcbiAgICBjb25zdCBmb2N1c05vZGUgPSBwb2ludGVyRm9jdXM/LnRyYWlsLmxhc3ROb2RlKCk7XG4gICAgZm9jdXNOb2RlICYmIGlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIGZvY3VzTm9kZSApICYmIGZvY3VzTm9kZS5oYW5kbGVIaWdobGlnaHRBY3RpdmVDaGFuZ2UoKTtcbiAgICBjb25zdCBvbGRGb2N1c05vZGUgPSBvbGRGb2N1cz8udHJhaWwubGFzdE5vZGUoKTtcbiAgICBvbGRGb2N1c05vZGUgJiYgaXNJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggb2xkRm9jdXNOb2RlICkgJiYgb2xkRm9jdXNOb2RlLmhhbmRsZUhpZ2hsaWdodEFjdGl2ZUNoYW5nZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgRE9NIGZvY3VzLiBBIERPTSBsaW1pdGF0aW9uIGlzIHRoYXQgdGhlcmUgY2FuIG9ubHkgYmUgb25lIGVsZW1lbnQgd2l0aCBmb2N1cyBhdCBhIHRpbWUgc28gdGhpcyBtdXN0XG4gICAqIGJlIGEgc3RhdGljIGZvciB0aGUgRm9jdXNNYW5hZ2VyLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzZXQgcGRvbUZvY3VzKCB2YWx1ZTogRm9jdXMgfCBudWxsICkge1xuICAgIGlmICggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LnZhbHVlICE9PSB2YWx1ZSApIHtcblxuICAgICAgbGV0IHByZXZpb3VzRm9jdXM7XG4gICAgICBpZiAoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgcHJldmlvdXNGb2N1cyA9IEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGU7XG4gICAgICB9XG5cbiAgICAgIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICAvLyBpZiBzZXQgdG8gbnVsbCwgbWFrZSBzdXJlIHRoYXQgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIG5vIGxvbmdlciBmb2N1c2VkXG4gICAgICBpZiAoIHByZXZpb3VzRm9jdXMgJiYgIXZhbHVlICkge1xuICAgICAgICBwcmV2aW91c0ZvY3VzLmJsdXIoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBGb2N1cyBwb2ludGluZyB0byB0aGUgTm9kZSB3aG9zZSBQYXJhbGxlbCBET00gZWxlbWVudCBoYXMgRE9NIGZvY3VzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXQgcGRvbUZvY3VzKCk6IEZvY3VzIHwgbnVsbCB7XG4gICAgcmV0dXJuIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIE5vZGUgdGhhdCBjdXJyZW50bHkgaGFzIERPTSBmb2N1cywgdGhlIGxlYWYtbW9zdCBOb2RlIG9mIHRoZSBGb2N1cyBUcmFpbC4gTnVsbCBpZiBub1xuICAgKiBOb2RlIGhhcyBmb2N1cy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0UERPTUZvY3VzZWROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICBsZXQgZm9jdXNlZE5vZGUgPSBudWxsO1xuICAgIGNvbnN0IGZvY3VzID0gRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c1Byb3BlcnR5LmdldCgpO1xuICAgIGlmICggZm9jdXMgKSB7XG4gICAgICBmb2N1c2VkTm9kZSA9IGZvY3VzLnRyYWlsLmxhc3ROb2RlKCk7XG4gICAgfVxuICAgIHJldHVybiBmb2N1c2VkTm9kZTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IHBkb21Gb2N1c2VkTm9kZSgpOiBOb2RlIHwgbnVsbCB7IHJldHVybiB0aGlzLmdldFBET01Gb2N1c2VkTm9kZSgpOyB9XG5cbiAgLy8gRGlzcGxheSBoYXMgYW4gYXhvbiBgUHJvcGVydHkgdG8gaW5kaWNhdGUgd2hpY2ggY29tcG9uZW50IGlzIGZvY3VzZWQgKG9yIG51bGwgaWYgbm9cbiAgLy8gc2NlbmVyeSBOb2RlIGhhcyBmb2N1cykuIEJ5IHBhc3NpbmcgdGhlIHRhbmRlbSBhbmQgcGhldGlvVHllLCBQaEVULWlPIGlzIGFibGUgdG8gaW50ZXJvcGVyYXRlIChzYXZlLCByZXN0b3JlLFxuICAvLyBjb250cm9sLCBvYnNlcnZlIHdoYXQgaXMgY3VycmVudGx5IGZvY3VzZWQpLiBTZWUgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyBmb3Igc2V0dGluZyB0aGUgZm9jdXMuIERvbid0IHNldCB0aGUgdmFsdWVcbiAgLy8gb2YgdGhpcyBQcm9wZXJ0eSBkaXJlY3RseS5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwZG9tRm9jdXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxGb2N1cyB8IG51bGw+KCBudWxsLCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdwZG9tRm9jdXNQcm9wZXJ0eScgKSxcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnU3RvcmVzIHRoZSBjdXJyZW50IGZvY3VzIGluIHRoZSBQYXJhbGxlbCBET00sIG51bGwgaWYgbm90aGluZyBoYXMgZm9jdXMuIFRoaXMgaXMgbm90IHVwZGF0ZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2Jhc2VkIG9uIG1vdXNlIG9yIHRvdWNoIGlucHV0LCBvbmx5IGtleWJvYXJkIGFuZCBvdGhlciBhbHRlcm5hdGl2ZSBpbnB1dHMuIE5vdGUgdGhhdCB0aGlzIG9ubHkgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpZXMgdG8gc2ltdWxhdGlvbnMgdGhhdCBzdXBwb3J0IGFsdGVybmF0aXZlIGlucHV0LicsXG4gICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBGb2N1cy5Gb2N1c0lPICksXG4gICAgcGhldGlvU3RhdGU6IGZhbHNlLFxuICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxuICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXG4gIH0gKTtcblxuICAvKipcbiAgICogQSBQcm9wZXJ0eSB0aGF0IGxldHMgeW91IGtub3cgd2hlbiB0aGUgd2luZG93IGhhcyBmb2N1cy4gV2hlbiB0aGUgd2luZG93IGhhcyBmb2N1cywgaXQgaXMgaW4gdGhlIHVzZXIncyBmb3JlZ3JvdW5kLlxuICAgKiBXaGVuIGluIHRoZSBiYWNrZ3JvdW5kLCB0aGUgd2luZG93IGRvZXMgbm90IHJlY2VpdmUga2V5Ym9hcmQgaW5wdXQgKGltcG9ydGFudCBmb3IgZ2xvYmFsIGtleWJvYXJkIGV2ZW50cykuXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBfd2luZG93SGFzRm9jdXNQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gIHB1YmxpYyBzdGF0aWMgd2luZG93SGFzRm9jdXNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gPSBGb2N1c01hbmFnZXIuX3dpbmRvd0hhc0ZvY3VzUHJvcGVydHk7XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIF93aW5kb3dIYXNGb2N1c1Byb3BlcnR5IHdoZW4gdGhlIHdpbmRvdyByZWNlaXZlcy9sb3NlcyBmb2N1cy4gV2hlbiB0aGUgd2luZG93IGhhcyBmb2N1c1xuICAgKiBpdCBpcyBpbiB0aGUgZm9yZWdyb3VuZCBvZiB0aGUgdXNlci4gV2hlbiBpbiB0aGUgYmFja2dyb3VuZCwgdGhlIHdpbmRvdyB3aWxsIG5vdCByZWNlaXZlIGtleWJvYXJkIGlucHV0LlxuICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2luZG93L2ZvY3VzX2V2ZW50LlxuICAgKlxuICAgKiBUaGlzIHdpbGwgYmUgY2FsbGVkIGJ5IHNjZW5lcnkgZm9yIHlvdSB3aGVuIHlvdSB1c2UgRGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGF0dGFjaFRvV2luZG93KCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFGb2N1c01hbmFnZXIuZ2xvYmFsbHlBdHRhY2hlZCwgJ0NhbiBvbmx5IGJlIGF0dGFjaGVkIHN0YXRpY2FsbHkgb25jZS4nICk7XG4gICAgRm9jdXNNYW5hZ2VyLmF0dGFjaGVkV2luZG93Rm9jdXNMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIEZvY3VzTWFuYWdlci5fd2luZG93SGFzRm9jdXNQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgfTtcblxuICAgIEZvY3VzTWFuYWdlci5hdHRhY2hlZFdpbmRvd0JsdXJMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIEZvY3VzTWFuYWdlci5fd2luZG93SGFzRm9jdXNQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgRm9jdXNNYW5hZ2VyLmF0dGFjaGVkV2luZG93Rm9jdXNMaXN0ZW5lciApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsIEZvY3VzTWFuYWdlci5hdHRhY2hlZFdpbmRvd0JsdXJMaXN0ZW5lciApO1xuXG4gICAgLy8gdmFsdWUgd2lsbCBiZSB1cGRhdGVkIHdpdGggd2luZG93LCBidXQgd2UgbmVlZCBhIHByb3BlciBpbml0aWFsIHZhbHVlICh0aGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgd2hpbGVcbiAgICAvLyB0aGUgd2luZG93IGlzIG5vdCBpbiB0aGUgZm9yZWdyb3VuZCkuXG4gICAgRm9jdXNNYW5hZ2VyLl93aW5kb3dIYXNGb2N1c1Byb3BlcnR5LnZhbHVlID0gZG9jdW1lbnQuaGFzRm9jdXMoKTtcblxuICAgIEZvY3VzTWFuYWdlci5nbG9iYWxseUF0dGFjaGVkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRhY2ggYWxsIHdpbmRvdyBmb2N1cy9ibHVyIGxpc3RlbmVycyBmcm9tIEZvY3VzTWFuYWdlciB3YXRjaGluZyBmb3Igd2hlbiB0aGUgd2luZG93IGxvc2VzIGZvY3VzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZXRhY2hGcm9tV2luZG93KCk6IHZvaWQge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBGb2N1c01hbmFnZXIuYXR0YWNoZWRXaW5kb3dGb2N1c0xpc3RlbmVyISApO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnYmx1cicsIEZvY3VzTWFuYWdlci5hdHRhY2hlZFdpbmRvd0JsdXJMaXN0ZW5lciEgKTtcblxuICAgIC8vIEZvciBjbGVhbnVwLCB0aGlzIFByb3BlcnR5IGJlY29tZXMgZmFsc2UgYWdhaW4gd2hlbiBkZXRhY2hpbmcgYmVjYXVzZSB3ZSB3aWxsIG5vIGxvbmdlciBiZSB3YXRjaGluZyBmb3IgY2hhbmdlcy5cbiAgICBGb2N1c01hbmFnZXIuX3dpbmRvd0hhc0ZvY3VzUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcblxuICAgIEZvY3VzTWFuYWdlci5nbG9iYWxseUF0dGFjaGVkID0gZmFsc2U7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0ZvY3VzTWFuYWdlcicsIEZvY3VzTWFuYWdlciApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlRhbmRlbSIsIk51bGxhYmxlSU8iLCJGb2N1cyIsIkZvY3VzRGlzcGxheWVkQ29udHJvbGxlciIsImlzSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJQRE9NSW5zdGFuY2UiLCJQRE9NVXRpbHMiLCJSZWFkaW5nQmxvY2tVdHRlcmFuY2UiLCJzY2VuZXJ5Iiwidm9pY2luZ01hbmFnZXIiLCJGb2N1c01hbmFnZXIiLCJkaXNwb3NlIiwicG9pbnRlckZvY3VzUHJvcGVydHkiLCJyZWFkaW5nQmxvY2tGb2N1c1Byb3BlcnR5IiwibG9ja2VkUG9pbnRlckZvY3VzUHJvcGVydHkiLCJwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwiaW50ZXJhY3RpdmVIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwicmVhZGluZ0Jsb2NrSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsInJlYWRpbmdCbG9ja0ZvY3VzQ29udHJvbGxlciIsInBvaW50ZXJGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIiLCJwb2ludGVySGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSIsImxvY2tlZFBvaW50ZXJGb2N1c0Rpc3BsYXllZENvbnRyb2xsZXIiLCJzdGFydFNwZWFraW5nRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwic3RhcnRTcGVha2luZ0xpc3RlbmVyIiwiZW5kU3BlYWtpbmdFbWl0dGVyIiwiZW5kU3BlYWtpbmdMaXN0ZW5lciIsInZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSIsInVubGluayIsInZvaWNpbmdGdWxseUVuYWJsZWRMaXN0ZW5lciIsInVwZGF0ZVBET01Gb2N1c0Zyb21FdmVudCIsImRpc3BsYXlzIiwiZXZlbnQiLCJmb2N1cyIsImFzc2VydCIsImRvY3VtZW50IiwiYWN0aXZlRWxlbWVudCIsImkiLCJsZW5ndGgiLCJkaXNwbGF5IiwiaXNFbGVtZW50VW5kZXJQRE9NIiwidW5pcXVlSWQiLCJnZXRBdHRyaWJ1dGUiLCJEQVRBX1BET01fVU5JUVVFX0lEIiwidHJhaWwiLCJ1bmlxdWVJZFRvVHJhaWwiLCJ2aXN1YWxUcmFpbCIsImd1ZXNzVmlzdWFsVHJhaWwiLCJyb290Tm9kZSIsImxhc3ROb2RlIiwiZm9jdXNhYmxlIiwicGRvbUZvY3VzIiwidGFyZ2V0IiwiYmx1ciIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsInJlbGF0ZWRUYXJnZXRUcmFpbCIsIl9pbnB1dCIsImdldFJlbGF0ZWRUYXJnZXRUcmFpbCIsIm9uUG9pbnRlckZvY3VzQ2hhbmdlIiwicG9pbnRlckZvY3VzIiwib2xkRm9jdXMiLCJmb2N1c05vZGUiLCJoYW5kbGVIaWdobGlnaHRBY3RpdmVDaGFuZ2UiLCJvbGRGb2N1c05vZGUiLCJ2YWx1ZSIsInBkb21Gb2N1c1Byb3BlcnR5IiwicHJldmlvdXNGb2N1cyIsInBkb21Gb2N1c2VkTm9kZSIsImdldFBET01Gb2N1c2VkTm9kZSIsImZvY3VzZWROb2RlIiwiZ2V0IiwiYXR0YWNoVG9XaW5kb3ciLCJnbG9iYWxseUF0dGFjaGVkIiwiYXR0YWNoZWRXaW5kb3dGb2N1c0xpc3RlbmVyIiwiX3dpbmRvd0hhc0ZvY3VzUHJvcGVydHkiLCJhdHRhY2hlZFdpbmRvd0JsdXJMaXN0ZW5lciIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJoYXNGb2N1cyIsImRldGFjaEZyb21XaW5kb3ciLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZW5hYmxlZCIsImxpbmsiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlIiwidm9pY2luZ0VuYWJsZWQiLCJ0ZXh0IiwidXR0ZXJhbmNlIiwicmVhZGluZ0Jsb2NrRm9jdXMiLCJhZGRMaXN0ZW5lciIsImVxdWFscyIsImZvckVhY2giLCJwcm9wZXJ0eSIsImJpbmQiLCJ0YW5kZW0iLCJHRU5FUkFMX01PREVMIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1ZhbHVlVHlwZSIsIkZvY3VzSU8iLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvUmVhZE9ubHkiLCJ3aW5kb3dIYXNGb2N1c1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F1QkMsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLHFCQUFxQixzQ0FBc0M7QUFDbEUsT0FBT0MsY0FBYywrQkFBK0I7QUFHcEQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsZ0JBQWdCLHlDQUF5QztBQUVoRSxTQUFrQkMsS0FBSyxFQUFFQyx3QkFBd0IsRUFBRUMseUJBQXlCLEVBQVFDLFlBQVksRUFBRUMsU0FBUyxFQUFFQyxxQkFBcUIsRUFBRUMsT0FBTyxFQUFFQyxjQUFjLFFBQVEsZ0JBQWdCO0FBSXBLLElBQUEsQUFBTUMsZUFBTixNQUFNQTtJQXlIWkMsVUFBZ0I7UUFDckIsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQ0QsT0FBTztRQUNqQyxJQUFJLENBQUNFLHlCQUF5QixDQUFDRixPQUFPO1FBQ3RDLElBQUksQ0FBQ0csMEJBQTBCLENBQUNILE9BQU87UUFDdkMsSUFBSSxDQUFDSSxrQ0FBa0MsQ0FBQ0osT0FBTztRQUMvQyxJQUFJLENBQUNLLG9DQUFvQyxDQUFDTCxPQUFPO1FBQ2pELElBQUksQ0FBQ00scUNBQXFDLENBQUNOLE9BQU87UUFDbEQsSUFBSSxDQUFDTywyQkFBMkIsQ0FBQ1AsT0FBTztRQUN4QyxJQUFJLENBQUNRLCtCQUErQixDQUFDUixPQUFPO1FBQzVDLElBQUksQ0FBQ1MsZ0NBQWdDLENBQUNULE9BQU87UUFDN0MsSUFBSSxDQUFDVSxxQ0FBcUMsQ0FBQ1YsT0FBTztRQUVs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