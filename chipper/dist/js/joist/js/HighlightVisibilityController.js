// Copyright 2021-2024, University of Colorado Boulder
/**
 * A listener that manages the visibility of different highlights when switching between mouse/touch and alternative
 * input for a Display.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import { FocusManager, globalKeyStateTracker, KeyboardUtils } from '../../scenery/js/imports.js';
import joist from './joist.js';
// constants
// The amount of Pointer movement required to switch from showing focus highlights to Interactive Highlights if both
// are enabled, in the global coordinate frame.
const HIDE_FOCUS_HIGHLIGHTS_MOVEMENT_THRESHOLD = 100;
let HighlightVisibilityController = class HighlightVisibilityController {
    /**
   * Switches between focus highlights and Interactive Highlights if there is enough mouse movement.
   */ handleMove(event) {
        // A null initialPointerPoint means that we have not set the point yet since we started listening for mouse
        // movements - set it now so that distance of mose movement will be relative to this initial point.
        if (this.initialPointerPoint === null) {
            this.initialPointerPoint = event.pointer.point;
        } else {
            this.relativePointerDistance = event.pointer.point.distance(this.initialPointerPoint);
            // we have moved enough to switch from focus highlights to Interactive Highlights. Setting the
            // pdomFocusHighlightsVisibleProperty to false will remove this listener for us.
            if (this.relativePointerDistance > HIDE_FOCUS_HIGHLIGHTS_MOVEMENT_THRESHOLD) {
                this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = false;
                this.display.focusManager.interactiveHighlightsVisibleProperty.value = true;
            }
        }
    }
    constructor(display, preferencesModel){
        // {null|Vector2} - The initial point of the Pointer when focus highlights are made visible and Interactive
        // highlights are enabled. Pointer movement to determine whether to switch to showing Interactive Highlights
        // instead of focus highlights will be relative to this point. A value of null means we haven't saved a point
        // yet and we need to on the next move event.
        this.initialPointerPoint = null;
        // {number} - The amount of distance that the Pointer has moved relative to initialPointerPoint, in the global
        // coordinate frame.
        this.relativePointerDistance = 0;
        // A reference to the Display whose FocusManager we will operate on to control the visibility of various kinds of highlights
        this.display = display;
        // A listener that is added/removed from the display to manage visibility of highlights on move events. We
        // usually don't need this listener so it is only added when we need to listen for move events.
        const moveListener = {
            move: this.handleMove.bind(this)
        };
        const setHighlightsVisible = ()=>{
            this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = true;
        };
        const focusHighlightVisibleListener = {};
        // Restore display of focus highlights if we receive PDOM events. Exclude focus-related events here
        // so that we can support some iOS cases where we want PDOM behavior even though iOS + VO only provided pointer
        // events. See https://github.com/phetsims/scenery/issues/1137 for details.
        [
            'click',
            'input',
            'change',
            'keydown',
            'keyup'
        ].forEach((eventType)=>{
            focusHighlightVisibleListener[eventType] = setHighlightsVisible;
        });
        this.display.addInputListener(focusHighlightVisibleListener);
        // When tabbing into the sim, make focus highlights visible - on keyup because the keydown is likely to have
        // occurred on an element outside of the DOM scope.
        globalKeyStateTracker.keyupEmitter.addListener((event)=>{
            if (KeyboardUtils.isKeyEvent(event, KeyboardUtils.KEY_TAB)) {
                setHighlightsVisible();
            }
        });
        if (preferencesModel.visualModel.supportsInteractiveHighlights) {
            preferencesModel.visualModel.interactiveHighlightsEnabledProperty.link((visible)=>{
                this.display.focusManager.interactiveHighlightsVisibleProperty.value = visible;
            });
            // When both Interactive Highlights are enabled and the PDOM focus highlights are visible, add a listener that
            // will make focus highlights invisible and interactive highlights visible if we receive a certain amount of
            // mouse movement. The listener is removed as soon as PDOM focus highlights are made invisible or Interactive
            // Highlights are disabled.
            const interactiveHighlightsEnabledProperty = preferencesModel.visualModel.interactiveHighlightsEnabledProperty;
            const pdomFocusHighlightsVisibleProperty = this.display.focusManager.pdomFocusHighlightsVisibleProperty;
            Multilink.multilink([
                interactiveHighlightsEnabledProperty,
                pdomFocusHighlightsVisibleProperty
            ], (interactiveHighlightsEnabled, pdomHighlightsVisible)=>{
                if (interactiveHighlightsEnabled && pdomHighlightsVisible) {
                    this.display.addInputListener(moveListener);
                    // Setting to null indicates that we should store the Pointer.point as the initialPointerPoint on next move.
                    this.initialPointerPoint = null;
                    // Reset distance of movement for the mouse pointer since we are looking for changes again.
                    this.relativePointerDistance = 0;
                } else {
                    this.display.hasInputListener(moveListener) && this.display.removeInputListener(moveListener);
                }
            });
        }
        this.display.addInputListener({
            // Whenever we receive a down event focus highlights are made invisible. We may also blur the active element in
            // some cases, but not always as is necessary for iOS VoiceOver. See documentation details in the function.
            down: (event)=>{
                // An AT might have sent a down event outside of the display, if this happened we will not do anything
                // to change focus
                if (this.display.bounds.containsPoint(event.pointer.point)) {
                    // in response to pointer events, always hide the focus highlight so it isn't distracting
                    this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = false;
                    // no need to do this work unless some element in the simulation has focus
                    if (FocusManager.pdomFocusedNode) {
                        // if the event trail doesn't include the focusedNode, clear it - otherwise DOM focus is kept on the
                        // active element so that it can remain the target for assistive devices using pointer events
                        // on behalf of the user, see https://github.com/phetsims/scenery/issues/1137
                        if (!event.trail.nodes.includes(FocusManager.pdomFocusedNode)) {
                            FocusManager.pdomFocus = null;
                        }
                    }
                }
            }
        });
    }
};
joist.register('HighlightVisibilityController', HighlightVisibilityController);
export default HighlightVisibilityController;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hpZ2hsaWdodFZpc2liaWxpdHlDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbGlzdGVuZXIgdGhhdCBtYW5hZ2VzIHRoZSB2aXNpYmlsaXR5IG9mIGRpZmZlcmVudCBoaWdobGlnaHRzIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gbW91c2UvdG91Y2ggYW5kIGFsdGVybmF0aXZlXG4gKiBpbnB1dCBmb3IgYSBEaXNwbGF5LlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgRGlzcGxheSwgRm9jdXNNYW5hZ2VyLCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsIEtleWJvYXJkVXRpbHMsIFNjZW5lcnlFdmVudCwgVElucHV0TGlzdGVuZXIgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzTW9kZWwgZnJvbSAnLi9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcblxuLy8gY29uc3RhbnRzXG4vLyBUaGUgYW1vdW50IG9mIFBvaW50ZXIgbW92ZW1lbnQgcmVxdWlyZWQgdG8gc3dpdGNoIGZyb20gc2hvd2luZyBmb2N1cyBoaWdobGlnaHRzIHRvIEludGVyYWN0aXZlIEhpZ2hsaWdodHMgaWYgYm90aFxuLy8gYXJlIGVuYWJsZWQsIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cbmNvbnN0IEhJREVfRk9DVVNfSElHSExJR0hUU19NT1ZFTUVOVF9USFJFU0hPTEQgPSAxMDA7XG5cbmNsYXNzIEhpZ2hsaWdodFZpc2liaWxpdHlDb250cm9sbGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwbGF5OiBEaXNwbGF5O1xuXG4gIC8vIHtudWxsfFZlY3RvcjJ9IC0gVGhlIGluaXRpYWwgcG9pbnQgb2YgdGhlIFBvaW50ZXIgd2hlbiBmb2N1cyBoaWdobGlnaHRzIGFyZSBtYWRlIHZpc2libGUgYW5kIEludGVyYWN0aXZlXG4gIC8vIGhpZ2hsaWdodHMgYXJlIGVuYWJsZWQuIFBvaW50ZXIgbW92ZW1lbnQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gc3dpdGNoIHRvIHNob3dpbmcgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0c1xuICAvLyBpbnN0ZWFkIG9mIGZvY3VzIGhpZ2hsaWdodHMgd2lsbCBiZSByZWxhdGl2ZSB0byB0aGlzIHBvaW50LiBBIHZhbHVlIG9mIG51bGwgbWVhbnMgd2UgaGF2ZW4ndCBzYXZlZCBhIHBvaW50XG4gIC8vIHlldCBhbmQgd2UgbmVlZCB0byBvbiB0aGUgbmV4dCBtb3ZlIGV2ZW50LlxuICBwcml2YXRlIGluaXRpYWxQb2ludGVyUG9pbnQ6IFZlY3RvcjIgfCBudWxsID0gbnVsbDtcblxuICAvLyB7bnVtYmVyfSAtIFRoZSBhbW91bnQgb2YgZGlzdGFuY2UgdGhhdCB0aGUgUG9pbnRlciBoYXMgbW92ZWQgcmVsYXRpdmUgdG8gaW5pdGlhbFBvaW50ZXJQb2ludCwgaW4gdGhlIGdsb2JhbFxuICAvLyBjb29yZGluYXRlIGZyYW1lLlxuICBwcml2YXRlIHJlbGF0aXZlUG9pbnRlckRpc3RhbmNlID0gMDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGRpc3BsYXk6IERpc3BsYXksIHByZWZlcmVuY2VzTW9kZWw6IFByZWZlcmVuY2VzTW9kZWwgKSB7XG5cbiAgICAvLyBBIHJlZmVyZW5jZSB0byB0aGUgRGlzcGxheSB3aG9zZSBGb2N1c01hbmFnZXIgd2Ugd2lsbCBvcGVyYXRlIG9uIHRvIGNvbnRyb2wgdGhlIHZpc2liaWxpdHkgb2YgdmFyaW91cyBraW5kcyBvZiBoaWdobGlnaHRzXG4gICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcblxuICAgIC8vIEEgbGlzdGVuZXIgdGhhdCBpcyBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIGRpc3BsYXkgdG8gbWFuYWdlIHZpc2liaWxpdHkgb2YgaGlnaGxpZ2h0cyBvbiBtb3ZlIGV2ZW50cy4gV2VcbiAgICAvLyB1c3VhbGx5IGRvbid0IG5lZWQgdGhpcyBsaXN0ZW5lciBzbyBpdCBpcyBvbmx5IGFkZGVkIHdoZW4gd2UgbmVlZCB0byBsaXN0ZW4gZm9yIG1vdmUgZXZlbnRzLlxuICAgIGNvbnN0IG1vdmVMaXN0ZW5lciA9IHtcbiAgICAgIG1vdmU6IHRoaXMuaGFuZGxlTW92ZS5iaW5kKCB0aGlzIClcbiAgICB9O1xuXG4gICAgY29uc3Qgc2V0SGlnaGxpZ2h0c1Zpc2libGUgPSAoKSA9PiB7IHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7IH07XG4gICAgY29uc3QgZm9jdXNIaWdobGlnaHRWaXNpYmxlTGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyID0ge307XG5cbiAgICAvLyBSZXN0b3JlIGRpc3BsYXkgb2YgZm9jdXMgaGlnaGxpZ2h0cyBpZiB3ZSByZWNlaXZlIFBET00gZXZlbnRzLiBFeGNsdWRlIGZvY3VzLXJlbGF0ZWQgZXZlbnRzIGhlcmVcbiAgICAvLyBzbyB0aGF0IHdlIGNhbiBzdXBwb3J0IHNvbWUgaU9TIGNhc2VzIHdoZXJlIHdlIHdhbnQgUERPTSBiZWhhdmlvciBldmVuIHRob3VnaCBpT1MgKyBWTyBvbmx5IHByb3ZpZGVkIHBvaW50ZXJcbiAgICAvLyBldmVudHMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTEzNyBmb3IgZGV0YWlscy5cbiAgICAoIFsgJ2NsaWNrJywgJ2lucHV0JywgJ2NoYW5nZScsICdrZXlkb3duJywgJ2tleXVwJyBdIGFzIGNvbnN0ICkuZm9yRWFjaCggZXZlbnRUeXBlID0+IHtcbiAgICAgIGZvY3VzSGlnaGxpZ2h0VmlzaWJsZUxpc3RlbmVyWyBldmVudFR5cGUgXSA9IHNldEhpZ2hsaWdodHNWaXNpYmxlO1xuICAgIH0gKTtcbiAgICB0aGlzLmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggZm9jdXNIaWdobGlnaHRWaXNpYmxlTGlzdGVuZXIgKTtcblxuICAgIC8vIFdoZW4gdGFiYmluZyBpbnRvIHRoZSBzaW0sIG1ha2UgZm9jdXMgaGlnaGxpZ2h0cyB2aXNpYmxlIC0gb24ga2V5dXAgYmVjYXVzZSB0aGUga2V5ZG93biBpcyBsaWtlbHkgdG8gaGF2ZVxuICAgIC8vIG9jY3VycmVkIG9uIGFuIGVsZW1lbnQgb3V0c2lkZSBvZiB0aGUgRE9NIHNjb3BlLlxuICAgIGdsb2JhbEtleVN0YXRlVHJhY2tlci5rZXl1cEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGV2ZW50ID0+IHtcbiAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc0tleUV2ZW50KCBldmVudCwgS2V5Ym9hcmRVdGlscy5LRVlfVEFCICkgKSB7XG4gICAgICAgIHNldEhpZ2hsaWdodHNWaXNpYmxlKCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgaWYgKCBwcmVmZXJlbmNlc01vZGVsLnZpc3VhbE1vZGVsLnN1cHBvcnRzSW50ZXJhY3RpdmVIaWdobGlnaHRzICkge1xuXG4gICAgICBwcmVmZXJlbmNlc01vZGVsLnZpc3VhbE1vZGVsLmludGVyYWN0aXZlSGlnaGxpZ2h0c0VuYWJsZWRQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB2aXNpYmxlO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBXaGVuIGJvdGggSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBhcmUgZW5hYmxlZCBhbmQgdGhlIFBET00gZm9jdXMgaGlnaGxpZ2h0cyBhcmUgdmlzaWJsZSwgYWRkIGEgbGlzdGVuZXIgdGhhdFxuICAgICAgLy8gd2lsbCBtYWtlIGZvY3VzIGhpZ2hsaWdodHMgaW52aXNpYmxlIGFuZCBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzIHZpc2libGUgaWYgd2UgcmVjZWl2ZSBhIGNlcnRhaW4gYW1vdW50IG9mXG4gICAgICAvLyBtb3VzZSBtb3ZlbWVudC4gVGhlIGxpc3RlbmVyIGlzIHJlbW92ZWQgYXMgc29vbiBhcyBQRE9NIGZvY3VzIGhpZ2hsaWdodHMgYXJlIG1hZGUgaW52aXNpYmxlIG9yIEludGVyYWN0aXZlXG4gICAgICAvLyBIaWdobGlnaHRzIGFyZSBkaXNhYmxlZC5cbiAgICAgIGNvbnN0IGludGVyYWN0aXZlSGlnaGxpZ2h0c0VuYWJsZWRQcm9wZXJ0eSA9IHByZWZlcmVuY2VzTW9kZWwudmlzdWFsTW9kZWwuaW50ZXJhY3RpdmVIaWdobGlnaHRzRW5hYmxlZFByb3BlcnR5O1xuICAgICAgY29uc3QgcGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eSA9IHRoaXMuZGlzcGxheS5mb2N1c01hbmFnZXIucGRvbUZvY3VzSGlnaGxpZ2h0c1Zpc2libGVQcm9wZXJ0eTtcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoXG4gICAgICAgIFsgaW50ZXJhY3RpdmVIaWdobGlnaHRzRW5hYmxlZFByb3BlcnR5LCBwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IF0sXG4gICAgICAgICggaW50ZXJhY3RpdmVIaWdobGlnaHRzRW5hYmxlZCwgcGRvbUhpZ2hsaWdodHNWaXNpYmxlICkgPT4ge1xuICAgICAgICAgIGlmICggaW50ZXJhY3RpdmVIaWdobGlnaHRzRW5hYmxlZCAmJiBwZG9tSGlnaGxpZ2h0c1Zpc2libGUgKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggbW92ZUxpc3RlbmVyICk7XG5cbiAgICAgICAgICAgIC8vIFNldHRpbmcgdG8gbnVsbCBpbmRpY2F0ZXMgdGhhdCB3ZSBzaG91bGQgc3RvcmUgdGhlIFBvaW50ZXIucG9pbnQgYXMgdGhlIGluaXRpYWxQb2ludGVyUG9pbnQgb24gbmV4dCBtb3ZlLlxuICAgICAgICAgICAgdGhpcy5pbml0aWFsUG9pbnRlclBvaW50ID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gUmVzZXQgZGlzdGFuY2Ugb2YgbW92ZW1lbnQgZm9yIHRoZSBtb3VzZSBwb2ludGVyIHNpbmNlIHdlIGFyZSBsb29raW5nIGZvciBjaGFuZ2VzIGFnYWluLlxuICAgICAgICAgICAgdGhpcy5yZWxhdGl2ZVBvaW50ZXJEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Lmhhc0lucHV0TGlzdGVuZXIoIG1vdmVMaXN0ZW5lciApICYmIHRoaXMuZGlzcGxheS5yZW1vdmVJbnB1dExpc3RlbmVyKCBtb3ZlTGlzdGVuZXIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwbGF5LmFkZElucHV0TGlzdGVuZXIoIHtcblxuICAgICAgLy8gV2hlbmV2ZXIgd2UgcmVjZWl2ZSBhIGRvd24gZXZlbnQgZm9jdXMgaGlnaGxpZ2h0cyBhcmUgbWFkZSBpbnZpc2libGUuIFdlIG1heSBhbHNvIGJsdXIgdGhlIGFjdGl2ZSBlbGVtZW50IGluXG4gICAgICAvLyBzb21lIGNhc2VzLCBidXQgbm90IGFsd2F5cyBhcyBpcyBuZWNlc3NhcnkgZm9yIGlPUyBWb2ljZU92ZXIuIFNlZSBkb2N1bWVudGF0aW9uIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uLlxuICAgICAgZG93bjogZXZlbnQgPT4ge1xuXG4gICAgICAgIC8vIEFuIEFUIG1pZ2h0IGhhdmUgc2VudCBhIGRvd24gZXZlbnQgb3V0c2lkZSBvZiB0aGUgZGlzcGxheSwgaWYgdGhpcyBoYXBwZW5lZCB3ZSB3aWxsIG5vdCBkbyBhbnl0aGluZ1xuICAgICAgICAvLyB0byBjaGFuZ2UgZm9jdXNcbiAgICAgICAgaWYgKCB0aGlzLmRpc3BsYXkuYm91bmRzLmNvbnRhaW5zUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKSApIHtcblxuICAgICAgICAgIC8vIGluIHJlc3BvbnNlIHRvIHBvaW50ZXIgZXZlbnRzLCBhbHdheXMgaGlkZSB0aGUgZm9jdXMgaGlnaGxpZ2h0IHNvIGl0IGlzbid0IGRpc3RyYWN0aW5nXG4gICAgICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5wZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBubyBuZWVkIHRvIGRvIHRoaXMgd29yayB1bmxlc3Mgc29tZSBlbGVtZW50IGluIHRoZSBzaW11bGF0aW9uIGhhcyBmb2N1c1xuICAgICAgICAgIGlmICggRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c2VkTm9kZSApIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIGV2ZW50IHRyYWlsIGRvZXNuJ3QgaW5jbHVkZSB0aGUgZm9jdXNlZE5vZGUsIGNsZWFyIGl0IC0gb3RoZXJ3aXNlIERPTSBmb2N1cyBpcyBrZXB0IG9uIHRoZVxuICAgICAgICAgICAgLy8gYWN0aXZlIGVsZW1lbnQgc28gdGhhdCBpdCBjYW4gcmVtYWluIHRoZSB0YXJnZXQgZm9yIGFzc2lzdGl2ZSBkZXZpY2VzIHVzaW5nIHBvaW50ZXIgZXZlbnRzXG4gICAgICAgICAgICAvLyBvbiBiZWhhbGYgb2YgdGhlIHVzZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTEzN1xuICAgICAgICAgICAgaWYgKCAhZXZlbnQudHJhaWwubm9kZXMuaW5jbHVkZXMoIEZvY3VzTWFuYWdlci5wZG9tRm9jdXNlZE5vZGUgKSApIHtcbiAgICAgICAgICAgICAgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1cyA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN3aXRjaGVzIGJldHdlZW4gZm9jdXMgaGlnaGxpZ2h0cyBhbmQgSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cyBpZiB0aGVyZSBpcyBlbm91Z2ggbW91c2UgbW92ZW1lbnQuXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZU1vdmUoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKTogdm9pZCB7XG5cbiAgICAvLyBBIG51bGwgaW5pdGlhbFBvaW50ZXJQb2ludCBtZWFucyB0aGF0IHdlIGhhdmUgbm90IHNldCB0aGUgcG9pbnQgeWV0IHNpbmNlIHdlIHN0YXJ0ZWQgbGlzdGVuaW5nIGZvciBtb3VzZVxuICAgIC8vIG1vdmVtZW50cyAtIHNldCBpdCBub3cgc28gdGhhdCBkaXN0YW5jZSBvZiBtb3NlIG1vdmVtZW50IHdpbGwgYmUgcmVsYXRpdmUgdG8gdGhpcyBpbml0aWFsIHBvaW50LlxuICAgIGlmICggdGhpcy5pbml0aWFsUG9pbnRlclBvaW50ID09PSBudWxsICkge1xuICAgICAgdGhpcy5pbml0aWFsUG9pbnRlclBvaW50ID0gZXZlbnQucG9pbnRlci5wb2ludDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbGF0aXZlUG9pbnRlckRpc3RhbmNlID0gZXZlbnQucG9pbnRlci5wb2ludC5kaXN0YW5jZSggdGhpcy5pbml0aWFsUG9pbnRlclBvaW50ICk7XG5cbiAgICAgIC8vIHdlIGhhdmUgbW92ZWQgZW5vdWdoIHRvIHN3aXRjaCBmcm9tIGZvY3VzIGhpZ2hsaWdodHMgdG8gSW50ZXJhY3RpdmUgSGlnaGxpZ2h0cy4gU2V0dGluZyB0aGVcbiAgICAgIC8vIHBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkgdG8gZmFsc2Ugd2lsbCByZW1vdmUgdGhpcyBsaXN0ZW5lciBmb3IgdXMuXG4gICAgICBpZiAoIHRoaXMucmVsYXRpdmVQb2ludGVyRGlzdGFuY2UgPiBISURFX0ZPQ1VTX0hJR0hMSUdIVFNfTU9WRU1FTlRfVEhSRVNIT0xEICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkuZm9jdXNNYW5hZ2VyLnBkb21Gb2N1c0hpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kaXNwbGF5LmZvY3VzTWFuYWdlci5pbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0hpZ2hsaWdodFZpc2liaWxpdHlDb250cm9sbGVyJywgSGlnaGxpZ2h0VmlzaWJpbGl0eUNvbnRyb2xsZXIgKTtcbmV4cG9ydCBkZWZhdWx0IEhpZ2hsaWdodFZpc2liaWxpdHlDb250cm9sbGVyOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJGb2N1c01hbmFnZXIiLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJLZXlib2FyZFV0aWxzIiwiam9pc3QiLCJISURFX0ZPQ1VTX0hJR0hMSUdIVFNfTU9WRU1FTlRfVEhSRVNIT0xEIiwiSGlnaGxpZ2h0VmlzaWJpbGl0eUNvbnRyb2xsZXIiLCJoYW5kbGVNb3ZlIiwiZXZlbnQiLCJpbml0aWFsUG9pbnRlclBvaW50IiwicG9pbnRlciIsInBvaW50IiwicmVsYXRpdmVQb2ludGVyRGlzdGFuY2UiLCJkaXN0YW5jZSIsImRpc3BsYXkiLCJmb2N1c01hbmFnZXIiLCJwZG9tRm9jdXNIaWdobGlnaHRzVmlzaWJsZVByb3BlcnR5IiwidmFsdWUiLCJpbnRlcmFjdGl2ZUhpZ2hsaWdodHNWaXNpYmxlUHJvcGVydHkiLCJwcmVmZXJlbmNlc01vZGVsIiwibW92ZUxpc3RlbmVyIiwibW92ZSIsImJpbmQiLCJzZXRIaWdobGlnaHRzVmlzaWJsZSIsImZvY3VzSGlnaGxpZ2h0VmlzaWJsZUxpc3RlbmVyIiwiZm9yRWFjaCIsImV2ZW50VHlwZSIsImFkZElucHV0TGlzdGVuZXIiLCJrZXl1cEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImlzS2V5RXZlbnQiLCJLRVlfVEFCIiwidmlzdWFsTW9kZWwiLCJzdXBwb3J0c0ludGVyYWN0aXZlSGlnaGxpZ2h0cyIsImludGVyYWN0aXZlSGlnaGxpZ2h0c0VuYWJsZWRQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlIiwibXVsdGlsaW5rIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRzRW5hYmxlZCIsInBkb21IaWdobGlnaHRzVmlzaWJsZSIsImhhc0lucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwiZG93biIsImJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJwZG9tRm9jdXNlZE5vZGUiLCJ0cmFpbCIsIm5vZGVzIiwiaW5jbHVkZXMiLCJwZG9tRm9jdXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFFbkQsU0FBa0JDLFlBQVksRUFBRUMscUJBQXFCLEVBQUVDLGFBQWEsUUFBc0MsOEJBQThCO0FBQ3hJLE9BQU9DLFdBQVcsYUFBYTtBQUcvQixZQUFZO0FBQ1osb0hBQW9IO0FBQ3BILCtDQUErQztBQUMvQyxNQUFNQywyQ0FBMkM7QUFFakQsSUFBQSxBQUFNQyxnQ0FBTixNQUFNQTtJQXNHSjs7R0FFQyxHQUNELEFBQVFDLFdBQVlDLEtBQW1CLEVBQVM7UUFFOUMsMkdBQTJHO1FBQzNHLG1HQUFtRztRQUNuRyxJQUFLLElBQUksQ0FBQ0MsbUJBQW1CLEtBQUssTUFBTztZQUN2QyxJQUFJLENBQUNBLG1CQUFtQixHQUFHRCxNQUFNRSxPQUFPLENBQUNDLEtBQUs7UUFDaEQsT0FDSztZQUNILElBQUksQ0FBQ0MsdUJBQXVCLEdBQUdKLE1BQU1FLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDRSxRQUFRLENBQUUsSUFBSSxDQUFDSixtQkFBbUI7WUFFckYsOEZBQThGO1lBQzlGLGdGQUFnRjtZQUNoRixJQUFLLElBQUksQ0FBQ0csdUJBQXVCLEdBQUdQLDBDQUEyQztnQkFDN0UsSUFB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