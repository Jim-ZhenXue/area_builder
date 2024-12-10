// Copyright 2013-2023, University of Colorado Boulder
/**
 * Basic button handling.
 *
 * Uses 4 states:
 * up: mouse not over, not pressed
 * over: mouse over, not pressed
 * down: mouse over, pressed
 * out: mouse not over, pressed
 *
 * TODO: offscreen handling https://github.com/phetsims/scenery/issues/1581
 * TODO: fix enter/exit edge cases for moving nodes or add/remove child, and when touches are created
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import EventType from '../../../tandem/js/EventType.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { DownUpListener, scenery } from '../imports.js';
/**
 * @deprecated - please use FireListener for new code (set up for the `fire` callback to be easy, and has Properties
 * that can be checked for the other states or complicated cases)
 */ let ButtonListener = class ButtonListener extends DownUpListener {
    /**
   * @public
   *
   * @param {SceneryEvent} event
   * @param {string} state
   */ setButtonState(event, state) {
        if (state !== this.buttonState) {
            sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener state change to ${state} from ${this.buttonState} for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
            const oldState = this.buttonState;
            this.buttonState = state;
            if (this._buttonOptions[state]) {
                // Record this event to the phet-io data stream, including all downstream events as nested children
                this.phetioStartEvent(state);
                // Then invoke the callback
                this._buttonOptions[state](event, oldState);
                this.phetioEndEvent();
            }
            if (this._buttonOptions.fire && this._overCount > 0 && !this.interrupted && (this._buttonOptions.fireOnDown ? state === 'down' : oldState === 'down')) {
                // Record this event to the phet-io data stream, including all downstream events as nested children
                this.phetioStartEvent('fire');
                // Then fire the event
                this._buttonOptions.fire(event);
                this.phetioEndEvent();
            }
        }
    }
    /**
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ enter(event) {
        sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener enter for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
        this._overCount++;
        if (this._overCount === 1) {
            this.setButtonState(event, this.isDown ? 'down' : 'over');
        }
    }
    /**
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ exit(event) {
        sceneryLog && sceneryLog.InputEvent && sceneryLog.InputEvent(`ButtonListener exit for ${this.downTrail ? this.downTrail.toString() : this.downTrail}`);
        assert && assert(this._overCount > 0, 'Exit events not matched by an enter');
        this._overCount--;
        if (this._overCount === 0) {
            this.setButtonState(event, this.isDown ? 'out' : 'up');
        }
    }
    /**
   * Called from "focus" events (part of the Scenery listener API). On focus the PDOMPointer is over the node
   * with the attached listener, so add to the over count.
   * @private
   *
   * @param {SceneryEvent} event
   */ focus(event) {
        this.enter(event);
    }
    /**
   * Called from "blur" events (part of the Scenery listener API). On blur, the PDOMPointer leaves the node
   * with this listener so reduce the over count.
   * @private
   *
   * @param {SceneryEvent} event
   */ blur(event) {
        this.exit(event);
    }
    /**
   * Called with "click" events (part of the Scenery listener API). Typically will be called from a keyboard
   * or assistive device.
   *
   * There are no `keyup` or `keydown` events when an assistive device is active. So we respond generally
   * to the single `click` event, which indicates a logical activation of this button.
   * TODO: This may change after https://github.com/phetsims/scenery/issues/1117 is done, at which point
   * `click` should likely be replaced by `keydown` and `keyup` listeners.
   * @private
   *
   * @param {SceneryEvent} event
   */ click(event) {
        this.setButtonState(event, 'down');
        this.setButtonState(event, 'up');
    }
    /**
   * Options for the ButtonListener:
   *
   * mouseButton: 0
   * fireOnDown: false // default is to fire on 'up' after 'down', but passing fireOnDown: true will fire on 'down' instead
   * up: null          // Called on an 'up' state change, as up( event, oldState )
   * over: null        // Called on an 'over' state change, as over( event, oldState )
   * down: null        // Called on an 'down' state change, as down( event, oldState )
   * out: null         // Called on an 'out' state change, as out( event, oldState )
   * fire: null        // Called on a state change to/from 'down' (depending on fireOnDown), as fire( event ). Called after the triggering up/over/down event.
   */ constructor(options){
        assert && deprecationWarning('ButtonListener is deprecated, please use FireListener instead');
        options = merge({
            // When running in PhET-iO brand, the tandem must be supplied
            phetioType: ButtonListener.ButtonListenerIO,
            phetioState: false,
            phetioEventType: EventType.USER
        }, options);
        // TODO: pass through options https://github.com/phetsims/scenery/issues/1581
        super({
            tandem: options.tandem,
            phetioType: options.phetioType,
            phetioState: options.phetioState,
            mouseButton: options.mouseButton || 0,
            // parameter to DownUpListener, NOT an input listener itself
            down: (event, trail)=>{
                this.setButtonState(event, 'down');
            },
            // parameter to DownUpListener, NOT an input listener itself
            up: (event, trail)=>{
                this.setButtonState(event, this._overCount > 0 ? 'over' : 'up');
            }
        });
        // @public {string} - 'up', 'over', 'down' or 'out'
        this.buttonState = 'up';
        // @private {number} - how many pointers are over us (track a count, so we can handle multiple pointers gracefully)
        this._overCount = 0;
        // @private {Object} - store the options object so we can call the callbacks
        this._buttonOptions = options;
    }
};
scenery.register('ButtonListener', ButtonListener);
ButtonListener.ButtonListenerIO = new IOType('ButtonListenerIO', {
    valueType: ButtonListener,
    documentation: 'Button listener',
    events: [
        'up',
        'over',
        'down',
        'out',
        'fire'
    ]
});
export default ButtonListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvQnV0dG9uTGlzdGVuZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFzaWMgYnV0dG9uIGhhbmRsaW5nLlxuICpcbiAqIFVzZXMgNCBzdGF0ZXM6XG4gKiB1cDogbW91c2Ugbm90IG92ZXIsIG5vdCBwcmVzc2VkXG4gKiBvdmVyOiBtb3VzZSBvdmVyLCBub3QgcHJlc3NlZFxuICogZG93bjogbW91c2Ugb3ZlciwgcHJlc3NlZFxuICogb3V0OiBtb3VzZSBub3Qgb3ZlciwgcHJlc3NlZFxuICpcbiAqIFRPRE86IG9mZnNjcmVlbiBoYW5kbGluZyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICogVE9ETzogZml4IGVudGVyL2V4aXQgZWRnZSBjYXNlcyBmb3IgbW92aW5nIG5vZGVzIG9yIGFkZC9yZW1vdmUgY2hpbGQsIGFuZCB3aGVuIHRvdWNoZXMgYXJlIGNyZWF0ZWRcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IEV2ZW50VHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvRXZlbnRUeXBlLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgeyBEb3duVXBMaXN0ZW5lciwgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIC0gcGxlYXNlIHVzZSBGaXJlTGlzdGVuZXIgZm9yIG5ldyBjb2RlIChzZXQgdXAgZm9yIHRoZSBgZmlyZWAgY2FsbGJhY2sgdG8gYmUgZWFzeSwgYW5kIGhhcyBQcm9wZXJ0aWVzXG4gKiB0aGF0IGNhbiBiZSBjaGVja2VkIGZvciB0aGUgb3RoZXIgc3RhdGVzIG9yIGNvbXBsaWNhdGVkIGNhc2VzKVxuICovXG5jbGFzcyBCdXR0b25MaXN0ZW5lciBleHRlbmRzIERvd25VcExpc3RlbmVyIHtcbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIHRoZSBCdXR0b25MaXN0ZW5lcjpcbiAgICpcbiAgICogbW91c2VCdXR0b246IDBcbiAgICogZmlyZU9uRG93bjogZmFsc2UgLy8gZGVmYXVsdCBpcyB0byBmaXJlIG9uICd1cCcgYWZ0ZXIgJ2Rvd24nLCBidXQgcGFzc2luZyBmaXJlT25Eb3duOiB0cnVlIHdpbGwgZmlyZSBvbiAnZG93bicgaW5zdGVhZFxuICAgKiB1cDogbnVsbCAgICAgICAgICAvLyBDYWxsZWQgb24gYW4gJ3VwJyBzdGF0ZSBjaGFuZ2UsIGFzIHVwKCBldmVudCwgb2xkU3RhdGUgKVxuICAgKiBvdmVyOiBudWxsICAgICAgICAvLyBDYWxsZWQgb24gYW4gJ292ZXInIHN0YXRlIGNoYW5nZSwgYXMgb3ZlciggZXZlbnQsIG9sZFN0YXRlIClcbiAgICogZG93bjogbnVsbCAgICAgICAgLy8gQ2FsbGVkIG9uIGFuICdkb3duJyBzdGF0ZSBjaGFuZ2UsIGFzIGRvd24oIGV2ZW50LCBvbGRTdGF0ZSApXG4gICAqIG91dDogbnVsbCAgICAgICAgIC8vIENhbGxlZCBvbiBhbiAnb3V0JyBzdGF0ZSBjaGFuZ2UsIGFzIG91dCggZXZlbnQsIG9sZFN0YXRlIClcbiAgICogZmlyZTogbnVsbCAgICAgICAgLy8gQ2FsbGVkIG9uIGEgc3RhdGUgY2hhbmdlIHRvL2Zyb20gJ2Rvd24nIChkZXBlbmRpbmcgb24gZmlyZU9uRG93biksIGFzIGZpcmUoIGV2ZW50ICkuIENhbGxlZCBhZnRlciB0aGUgdHJpZ2dlcmluZyB1cC9vdmVyL2Rvd24gZXZlbnQuXG4gICAqL1xuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnQnV0dG9uTGlzdGVuZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBGaXJlTGlzdGVuZXIgaW5zdGVhZCcgKTtcblxuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIFdoZW4gcnVubmluZyBpbiBQaEVULWlPIGJyYW5kLCB0aGUgdGFuZGVtIG11c3QgYmUgc3VwcGxpZWRcbiAgICAgIHBoZXRpb1R5cGU6IEJ1dHRvbkxpc3RlbmVyLkJ1dHRvbkxpc3RlbmVySU8sXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgLy8gVE9ETzogcGFzcyB0aHJvdWdoIG9wdGlvbnMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBzdXBlcigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbSxcbiAgICAgIHBoZXRpb1R5cGU6IG9wdGlvbnMucGhldGlvVHlwZSxcbiAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlLFxuXG4gICAgICBtb3VzZUJ1dHRvbjogb3B0aW9ucy5tb3VzZUJ1dHRvbiB8fCAwLCAvLyBmb3J3YXJkIHRoZSBtb3VzZSBidXR0b24sIGRlZmF1bHQgdG8gMCAoTE1CKVxuXG4gICAgICAvLyBwYXJhbWV0ZXIgdG8gRG93blVwTGlzdGVuZXIsIE5PVCBhbiBpbnB1dCBsaXN0ZW5lciBpdHNlbGZcbiAgICAgIGRvd246ICggZXZlbnQsIHRyYWlsICkgPT4ge1xuICAgICAgICB0aGlzLnNldEJ1dHRvblN0YXRlKCBldmVudCwgJ2Rvd24nICk7XG4gICAgICB9LFxuXG4gICAgICAvLyBwYXJhbWV0ZXIgdG8gRG93blVwTGlzdGVuZXIsIE5PVCBhbiBpbnB1dCBsaXN0ZW5lciBpdHNlbGZcbiAgICAgIHVwOiAoIGV2ZW50LCB0cmFpbCApID0+IHtcbiAgICAgICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsIHRoaXMuX292ZXJDb3VudCA+IDAgPyAnb3ZlcicgOiAndXAnICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfSAtICd1cCcsICdvdmVyJywgJ2Rvd24nIG9yICdvdXQnXG4gICAgdGhpcy5idXR0b25TdGF0ZSA9ICd1cCc7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIGhvdyBtYW55IHBvaW50ZXJzIGFyZSBvdmVyIHVzICh0cmFjayBhIGNvdW50LCBzbyB3ZSBjYW4gaGFuZGxlIG11bHRpcGxlIHBvaW50ZXJzIGdyYWNlZnVsbHkpXG4gICAgdGhpcy5fb3ZlckNvdW50ID0gMDtcblxuICAgIC8vIEBwcml2YXRlIHtPYmplY3R9IC0gc3RvcmUgdGhlIG9wdGlvbnMgb2JqZWN0IHNvIHdlIGNhbiBjYWxsIHRoZSBjYWxsYmFja3NcbiAgICB0aGlzLl9idXR0b25PcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVcbiAgICovXG4gIHNldEJ1dHRvblN0YXRlKCBldmVudCwgc3RhdGUgKSB7XG4gICAgaWYgKCBzdGF0ZSAhPT0gdGhpcy5idXR0b25TdGF0ZSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50ICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudChcbiAgICAgICAgYEJ1dHRvbkxpc3RlbmVyIHN0YXRlIGNoYW5nZSB0byAke3N0YXRlfSBmcm9tICR7dGhpcy5idXR0b25TdGF0ZX0gZm9yICR7dGhpcy5kb3duVHJhaWwgPyB0aGlzLmRvd25UcmFpbC50b1N0cmluZygpIDogdGhpcy5kb3duVHJhaWx9YCApO1xuICAgICAgY29uc3Qgb2xkU3RhdGUgPSB0aGlzLmJ1dHRvblN0YXRlO1xuXG4gICAgICB0aGlzLmJ1dHRvblN0YXRlID0gc3RhdGU7XG5cbiAgICAgIGlmICggdGhpcy5fYnV0dG9uT3B0aW9uc1sgc3RhdGUgXSApIHtcblxuICAgICAgICAvLyBSZWNvcmQgdGhpcyBldmVudCB0byB0aGUgcGhldC1pbyBkYXRhIHN0cmVhbSwgaW5jbHVkaW5nIGFsbCBkb3duc3RyZWFtIGV2ZW50cyBhcyBuZXN0ZWQgY2hpbGRyZW5cbiAgICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCBzdGF0ZSApO1xuXG4gICAgICAgIC8vIFRoZW4gaW52b2tlIHRoZSBjYWxsYmFja1xuICAgICAgICB0aGlzLl9idXR0b25PcHRpb25zWyBzdGF0ZSBdKCBldmVudCwgb2xkU3RhdGUgKTtcblxuICAgICAgICB0aGlzLnBoZXRpb0VuZEV2ZW50KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5fYnV0dG9uT3B0aW9ucy5maXJlICYmXG4gICAgICAgICAgIHRoaXMuX292ZXJDb3VudCA+IDAgJiZcbiAgICAgICAgICAgIXRoaXMuaW50ZXJydXB0ZWQgJiZcbiAgICAgICAgICAgKCB0aGlzLl9idXR0b25PcHRpb25zLmZpcmVPbkRvd24gPyAoIHN0YXRlID09PSAnZG93bicgKSA6ICggb2xkU3RhdGUgPT09ICdkb3duJyApICkgKSB7XG5cbiAgICAgICAgLy8gUmVjb3JkIHRoaXMgZXZlbnQgdG8gdGhlIHBoZXQtaW8gZGF0YSBzdHJlYW0sIGluY2x1ZGluZyBhbGwgZG93bnN0cmVhbSBldmVudHMgYXMgbmVzdGVkIGNoaWxkcmVuXG4gICAgICAgIHRoaXMucGhldGlvU3RhcnRFdmVudCggJ2ZpcmUnICk7XG5cbiAgICAgICAgLy8gVGhlbiBmaXJlIHRoZSBldmVudFxuICAgICAgICB0aGlzLl9idXR0b25PcHRpb25zLmZpcmUoIGV2ZW50ICk7XG5cbiAgICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0ge1NjZW5lcnlFdmVudH0gZXZlbnRcbiAgICovXG4gIGVudGVyKCBldmVudCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRFdmVudCAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQoXG4gICAgICBgQnV0dG9uTGlzdGVuZXIgZW50ZXIgZm9yICR7dGhpcy5kb3duVHJhaWwgPyB0aGlzLmRvd25UcmFpbC50b1N0cmluZygpIDogdGhpcy5kb3duVHJhaWx9YCApO1xuICAgIHRoaXMuX292ZXJDb3VudCsrO1xuICAgIGlmICggdGhpcy5fb3ZlckNvdW50ID09PSAxICkge1xuICAgICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsIHRoaXMuaXNEb3duID8gJ2Rvd24nIDogJ292ZXInICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgZXhpdCggZXZlbnQgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0RXZlbnQgJiYgc2NlbmVyeUxvZy5JbnB1dEV2ZW50KFxuICAgICAgYEJ1dHRvbkxpc3RlbmVyIGV4aXQgZm9yICR7dGhpcy5kb3duVHJhaWwgPyB0aGlzLmRvd25UcmFpbC50b1N0cmluZygpIDogdGhpcy5kb3duVHJhaWx9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX292ZXJDb3VudCA+IDAsICdFeGl0IGV2ZW50cyBub3QgbWF0Y2hlZCBieSBhbiBlbnRlcicgKTtcbiAgICB0aGlzLl9vdmVyQ291bnQtLTtcbiAgICBpZiAoIHRoaXMuX292ZXJDb3VudCA9PT0gMCApIHtcbiAgICAgIHRoaXMuc2V0QnV0dG9uU3RhdGUoIGV2ZW50LCB0aGlzLmlzRG93biA/ICdvdXQnIDogJ3VwJyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZnJvbSBcImZvY3VzXCIgZXZlbnRzIChwYXJ0IG9mIHRoZSBTY2VuZXJ5IGxpc3RlbmVyIEFQSSkuIE9uIGZvY3VzIHRoZSBQRE9NUG9pbnRlciBpcyBvdmVyIHRoZSBub2RlXG4gICAqIHdpdGggdGhlIGF0dGFjaGVkIGxpc3RlbmVyLCBzbyBhZGQgdG8gdGhlIG92ZXIgY291bnQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgZm9jdXMoIGV2ZW50ICkge1xuICAgIHRoaXMuZW50ZXIoIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGZyb20gXCJibHVyXCIgZXZlbnRzIChwYXJ0IG9mIHRoZSBTY2VuZXJ5IGxpc3RlbmVyIEFQSSkuIE9uIGJsdXIsIHRoZSBQRE9NUG9pbnRlciBsZWF2ZXMgdGhlIG5vZGVcbiAgICogd2l0aCB0aGlzIGxpc3RlbmVyIHNvIHJlZHVjZSB0aGUgb3ZlciBjb3VudC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XG4gICAqL1xuICBibHVyKCBldmVudCApIHtcbiAgICB0aGlzLmV4aXQoIGV2ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdpdGggXCJjbGlja1wiIGV2ZW50cyAocGFydCBvZiB0aGUgU2NlbmVyeSBsaXN0ZW5lciBBUEkpLiBUeXBpY2FsbHkgd2lsbCBiZSBjYWxsZWQgZnJvbSBhIGtleWJvYXJkXG4gICAqIG9yIGFzc2lzdGl2ZSBkZXZpY2UuXG4gICAqXG4gICAqIFRoZXJlIGFyZSBubyBga2V5dXBgIG9yIGBrZXlkb3duYCBldmVudHMgd2hlbiBhbiBhc3Npc3RpdmUgZGV2aWNlIGlzIGFjdGl2ZS4gU28gd2UgcmVzcG9uZCBnZW5lcmFsbHlcbiAgICogdG8gdGhlIHNpbmdsZSBgY2xpY2tgIGV2ZW50LCB3aGljaCBpbmRpY2F0ZXMgYSBsb2dpY2FsIGFjdGl2YXRpb24gb2YgdGhpcyBidXR0b24uXG4gICAqIFRPRE86IFRoaXMgbWF5IGNoYW5nZSBhZnRlciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTExNyBpcyBkb25lLCBhdCB3aGljaCBwb2ludFxuICAgKiBgY2xpY2tgIHNob3VsZCBsaWtlbHkgYmUgcmVwbGFjZWQgYnkgYGtleWRvd25gIGFuZCBga2V5dXBgIGxpc3RlbmVycy5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTY2VuZXJ5RXZlbnR9IGV2ZW50XG4gICAqL1xuICBjbGljayggZXZlbnQgKSB7XG4gICAgdGhpcy5zZXRCdXR0b25TdGF0ZSggZXZlbnQsICdkb3duJyApO1xuICAgIHRoaXMuc2V0QnV0dG9uU3RhdGUoIGV2ZW50LCAndXAnICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0J1dHRvbkxpc3RlbmVyJywgQnV0dG9uTGlzdGVuZXIgKTtcblxuQnV0dG9uTGlzdGVuZXIuQnV0dG9uTGlzdGVuZXJJTyA9IG5ldyBJT1R5cGUoICdCdXR0b25MaXN0ZW5lcklPJywge1xuICB2YWx1ZVR5cGU6IEJ1dHRvbkxpc3RlbmVyLFxuICBkb2N1bWVudGF0aW9uOiAnQnV0dG9uIGxpc3RlbmVyJyxcbiAgZXZlbnRzOiBbICd1cCcsICdvdmVyJywgJ2Rvd24nLCAnb3V0JywgJ2ZpcmUnIF1cbn0gKTtcblxuZXhwb3J0IGRlZmF1bHQgQnV0dG9uTGlzdGVuZXI7Il0sIm5hbWVzIjpbImRlcHJlY2F0aW9uV2FybmluZyIsIm1lcmdlIiwiRXZlbnRUeXBlIiwiSU9UeXBlIiwiRG93blVwTGlzdGVuZXIiLCJzY2VuZXJ5IiwiQnV0dG9uTGlzdGVuZXIiLCJzZXRCdXR0b25TdGF0ZSIsImV2ZW50Iiwic3RhdGUiLCJidXR0b25TdGF0ZSIsInNjZW5lcnlMb2ciLCJJbnB1dEV2ZW50IiwiZG93blRyYWlsIiwidG9TdHJpbmciLCJvbGRTdGF0ZSIsIl9idXR0b25PcHRpb25zIiwicGhldGlvU3RhcnRFdmVudCIsInBoZXRpb0VuZEV2ZW50IiwiZmlyZSIsIl9vdmVyQ291bnQiLCJpbnRlcnJ1cHRlZCIsImZpcmVPbkRvd24iLCJlbnRlciIsImlzRG93biIsImV4aXQiLCJhc3NlcnQiLCJmb2N1cyIsImJsdXIiLCJjbGljayIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInBoZXRpb1R5cGUiLCJCdXR0b25MaXN0ZW5lcklPIiwicGhldGlvU3RhdGUiLCJwaGV0aW9FdmVudFR5cGUiLCJVU0VSIiwidGFuZGVtIiwibW91c2VCdXR0b24iLCJkb3duIiwidHJhaWwiLCJ1cCIsInJlZ2lzdGVyIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsImV2ZW50cyJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FFRCxPQUFPQSx3QkFBd0IsOENBQThDO0FBQzdFLE9BQU9DLFdBQVcsaUNBQWlDO0FBQ25ELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELFNBQVNDLGNBQWMsRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUV4RDs7O0NBR0MsR0FDRCxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1QkY7SUFxRDNCOzs7OztHQUtDLEdBQ0RHLGVBQWdCQyxLQUFLLEVBQUVDLEtBQUssRUFBRztRQUM3QixJQUFLQSxVQUFVLElBQUksQ0FBQ0MsV0FBVyxFQUFHO1lBQ2hDQyxjQUFjQSxXQUFXQyxVQUFVLElBQUlELFdBQVdDLFVBQVUsQ0FDMUQsQ0FBQywrQkFBK0IsRUFBRUgsTUFBTSxNQUFNLEVBQUUsSUFBSSxDQUFDQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQ0csU0FBUyxHQUFHLElBQUksQ0FBQ0EsU0FBUyxDQUFDQyxRQUFRLEtBQUssSUFBSSxDQUFDRCxTQUFTLEVBQUU7WUFDdkks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