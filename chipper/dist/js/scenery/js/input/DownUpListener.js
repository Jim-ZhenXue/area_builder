// Copyright 2013-2023, University of Colorado Boulder
/**
 * Basic down/up pointer handling for a Node, so that it's easy to handle buttons
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import merge from '../../../phet-core/js/merge.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import { EventContext, Mouse, scenery, SceneryEvent, Trail } from '../imports.js';
/**
 * @deprecated - use PressListener instead
 */ let DownUpListener = class DownUpListener extends PhetioObject {
    /**
   * @private
   *
   * @param {SceneryEvent} event
   */ buttonDown(event) {
        // already down from another pointer, don't do anything
        if (this.isDown) {
            return;
        }
        // ignore other mouse buttons
        if (event.pointer instanceof Mouse && event.domEvent.button !== this.options.mouseButton) {
            return;
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener buttonDown');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        // add our listener so we catch the up wherever we are
        event.pointer.addInputListener(this.downListener);
        this.isDown = true;
        this.downCurrentTarget = event.currentTarget;
        this.downTrail = event.trail.subtrailTo(event.currentTarget, false);
        this.pointer = event.pointer;
        if (this.options.down) {
            this.options.down(event, this.downTrail);
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /**
   * @private
   *
   * @param {SceneryEvent} event
   */ buttonUp(event) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener buttonUp');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.isDown = false;
        this.pointer.removeInputListener(this.downListener);
        const currentTargetSave = event.currentTarget;
        event.currentTarget = this.downCurrentTarget; // up is handled by a pointer listener, so currentTarget would be null.
        if (this.options.upInside || this.options.upOutside) {
            const trailUnderPointer = event.trail;
            // TODO: consider changing this so that it just does a hit check and ignores anything in front? https://github.com/phetsims/scenery/issues/1581
            const isInside = trailUnderPointer.isExtensionOf(this.downTrail, true) && !this.interrupted;
            if (isInside && this.options.upInside) {
                this.options.upInside(event, this.downTrail);
            } else if (!isInside && this.options.upOutside) {
                this.options.upOutside(event, this.downTrail);
            }
        }
        if (this.options.up) {
            this.options.up(event, this.downTrail);
        }
        event.currentTarget = currentTargetSave; // be polite to other listeners, restore currentTarget
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
    }
    /*---------------------------------------------------------------------------*
   * events called from the node input listener
   *----------------------------------------------------------------------------*/ /**
   * mouse/touch down on this node
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */ down(event) {
        this.buttonDown(event);
    }
    /**
   * Called when input is interrupted on this listener, see https://github.com/phetsims/scenery/issues/218
   * @public
   */ interrupt() {
        if (this.isDown) {
            sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('DownUpListener interrupt');
            sceneryLog && sceneryLog.InputListener && sceneryLog.push();
            this.interrupted = true;
            const context = EventContext.createSynthetic();
            // We create a synthetic event here, as there is no available event here.
            // Empty trail, so that it for-sure isn't under our downTrail (guaranteeing that isInside will be false).
            const syntheticEvent = new SceneryEvent(new Trail(), 'synthetic', this.pointer, context);
            syntheticEvent.currentTarget = this.downCurrentTarget;
            this.buttonUp(syntheticEvent);
            this.interrupted = false;
            sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
        }
    }
    /**
   * The 'trail' parameter passed to down/upInside/upOutside will end with the node to which this DownUpListener has
   * been added.
   *
   * Allowed options: {
   *    mouseButton: 0  // The mouse button to use: left: 0, middle: 1, right: 2, see
   *                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
   *    down: null      // down( event, trail ) is called when the pointer is pressed down on this node
   *                    // (and another pointer is not already down on it).
   *    up: null        // up( event, trail ) is called after 'down', regardless of the pointer's current location.
   *                    // Additionally, it is called AFTER upInside or upOutside, whichever is relevant
   *    upInside: null  // upInside( event, trail ) is called after 'down', when the pointer is released inside
   *                    // this node (it or a descendant is the top pickable node under the pointer)
   *    upOutside: null // upOutside( event, trail ) is called after 'down', when the pointer is released outside
   *                    // this node (it or a descendant is the not top pickable node under the pointer, even if the
   *                    // same instance is still directly under the pointer)
   * }
   *
   * @param {Object} [options]
   */ constructor(options){
        assert && deprecationWarning('DownUpListener is deprecated, please use PressListener instead');
        options = merge({
            mouseButton: 0 // allow a different mouse button
        }, options);
        super(options);
        // @private {Object}
        this.options = options;
        // @public {boolean} - whether this listener is down
        this.isDown = false;
        // @public {Node|null} - 'up' is handled via a pointer lister, which will have null currentTarget, so save the
        // 'down' currentTarget
        this.downCurrentTarget = null;
        // @public {Trail|null}
        this.downTrail = null;
        // @public {Pointer|null}
        this.pointer = null;
        // @public {boolean}
        this.interrupted = false;
        // @private {function} - this listener gets added to the pointer on a 'down'
        this.downListener = {
            // mouse/touch up
            up: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) up for ${this.downTrail.toString()}`);
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                assert && assert(event.pointer === this.pointer);
                if (!(event.pointer instanceof Mouse) || event.domEvent.button === this.options.mouseButton) {
                    this.buttonUp(event);
                }
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            // interruption of this Pointer listener
            interrupt: ()=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) interrupt for ${this.downTrail.toString()}`);
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                this.interrupt();
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            },
            // touch cancel
            cancel: (event)=>{
                sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener(`DownUpListener (pointer) cancel for ${this.downTrail.toString()}`);
                sceneryLog && sceneryLog.InputListener && sceneryLog.push();
                assert && assert(event.pointer === this.pointer);
                this.buttonUp(event);
                sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
            }
        };
    }
};
scenery.register('DownUpListener', DownUpListener);
export default DownUpListener;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW5wdXQvRG93blVwTGlzdGVuZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFzaWMgZG93bi91cCBwb2ludGVyIGhhbmRsaW5nIGZvciBhIE5vZGUsIHNvIHRoYXQgaXQncyBlYXN5IHRvIGhhbmRsZSBidXR0b25zXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkZXByZWNhdGlvbldhcm5pbmcgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RlcHJlY2F0aW9uV2FybmluZy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgeyBFdmVudENvbnRleHQsIE1vdXNlLCBzY2VuZXJ5LCBTY2VuZXJ5RXZlbnQsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgLSB1c2UgUHJlc3NMaXN0ZW5lciBpbnN0ZWFkXG4gKi9cbmNsYXNzIERvd25VcExpc3RlbmVyIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcbiAgLyoqXG4gICAqIFRoZSAndHJhaWwnIHBhcmFtZXRlciBwYXNzZWQgdG8gZG93bi91cEluc2lkZS91cE91dHNpZGUgd2lsbCBlbmQgd2l0aCB0aGUgbm9kZSB0byB3aGljaCB0aGlzIERvd25VcExpc3RlbmVyIGhhc1xuICAgKiBiZWVuIGFkZGVkLlxuICAgKlxuICAgKiBBbGxvd2VkIG9wdGlvbnM6IHtcbiAgICogICAgbW91c2VCdXR0b246IDAgIC8vIFRoZSBtb3VzZSBidXR0b24gdG8gdXNlOiBsZWZ0OiAwLCBtaWRkbGU6IDEsIHJpZ2h0OiAyLCBzZWVcbiAgICogICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50XG4gICAqICAgIGRvd246IG51bGwgICAgICAvLyBkb3duKCBldmVudCwgdHJhaWwgKSBpcyBjYWxsZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBwcmVzc2VkIGRvd24gb24gdGhpcyBub2RlXG4gICAqICAgICAgICAgICAgICAgICAgICAvLyAoYW5kIGFub3RoZXIgcG9pbnRlciBpcyBub3QgYWxyZWFkeSBkb3duIG9uIGl0KS5cbiAgICogICAgdXA6IG51bGwgICAgICAgIC8vIHVwKCBldmVudCwgdHJhaWwgKSBpcyBjYWxsZWQgYWZ0ZXIgJ2Rvd24nLCByZWdhcmRsZXNzIG9mIHRoZSBwb2ludGVyJ3MgY3VycmVudCBsb2NhdGlvbi5cbiAgICogICAgICAgICAgICAgICAgICAgIC8vIEFkZGl0aW9uYWxseSwgaXQgaXMgY2FsbGVkIEFGVEVSIHVwSW5zaWRlIG9yIHVwT3V0c2lkZSwgd2hpY2hldmVyIGlzIHJlbGV2YW50XG4gICAqICAgIHVwSW5zaWRlOiBudWxsICAvLyB1cEluc2lkZSggZXZlbnQsIHRyYWlsICkgaXMgY2FsbGVkIGFmdGVyICdkb3duJywgd2hlbiB0aGUgcG9pbnRlciBpcyByZWxlYXNlZCBpbnNpZGVcbiAgICogICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbm9kZSAoaXQgb3IgYSBkZXNjZW5kYW50IGlzIHRoZSB0b3AgcGlja2FibGUgbm9kZSB1bmRlciB0aGUgcG9pbnRlcilcbiAgICogICAgdXBPdXRzaWRlOiBudWxsIC8vIHVwT3V0c2lkZSggZXZlbnQsIHRyYWlsICkgaXMgY2FsbGVkIGFmdGVyICdkb3duJywgd2hlbiB0aGUgcG9pbnRlciBpcyByZWxlYXNlZCBvdXRzaWRlXG4gICAqICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIG5vZGUgKGl0IG9yIGEgZGVzY2VuZGFudCBpcyB0aGUgbm90IHRvcCBwaWNrYWJsZSBub2RlIHVuZGVyIHRoZSBwb2ludGVyLCBldmVuIGlmIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSBpbnN0YW5jZSBpcyBzdGlsbCBkaXJlY3RseSB1bmRlciB0aGUgcG9pbnRlcilcbiAgICogfVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnRG93blVwTGlzdGVuZXIgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBQcmVzc0xpc3RlbmVyIGluc3RlYWQnICk7XG5cblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgbW91c2VCdXR0b246IDAgLy8gYWxsb3cgYSBkaWZmZXJlbnQgbW91c2UgYnV0dG9uXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtPYmplY3R9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gd2hldGhlciB0aGlzIGxpc3RlbmVyIGlzIGRvd25cbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuXG4gICAgLy8gQHB1YmxpYyB7Tm9kZXxudWxsfSAtICd1cCcgaXMgaGFuZGxlZCB2aWEgYSBwb2ludGVyIGxpc3Rlciwgd2hpY2ggd2lsbCBoYXZlIG51bGwgY3VycmVudFRhcmdldCwgc28gc2F2ZSB0aGVcbiAgICAvLyAnZG93bicgY3VycmVudFRhcmdldFxuICAgIHRoaXMuZG93bkN1cnJlbnRUYXJnZXQgPSBudWxsO1xuXG4gICAgLy8gQHB1YmxpYyB7VHJhaWx8bnVsbH1cbiAgICB0aGlzLmRvd25UcmFpbCA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtQb2ludGVyfG51bGx9XG4gICAgdGhpcy5wb2ludGVyID0gbnVsbDtcblxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59XG4gICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIHRoaXMgbGlzdGVuZXIgZ2V0cyBhZGRlZCB0byB0aGUgcG9pbnRlciBvbiBhICdkb3duJ1xuICAgIHRoaXMuZG93bkxpc3RlbmVyID0ge1xuICAgICAgLy8gbW91c2UvdG91Y2ggdXBcbiAgICAgIHVwOiBldmVudCA9PiB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggYERvd25VcExpc3RlbmVyIChwb2ludGVyKSB1cCBmb3IgJHt0aGlzLmRvd25UcmFpbC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyICk7XG4gICAgICAgIGlmICggISggZXZlbnQucG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlICkgfHwgZXZlbnQuZG9tRXZlbnQuYnV0dG9uID09PSB0aGlzLm9wdGlvbnMubW91c2VCdXR0b24gKSB7XG4gICAgICAgICAgdGhpcy5idXR0b25VcCggZXZlbnQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9LFxuXG4gICAgICAvLyBpbnRlcnJ1cHRpb24gb2YgdGhpcyBQb2ludGVyIGxpc3RlbmVyXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgRG93blVwTGlzdGVuZXIgKHBvaW50ZXIpIGludGVycnVwdCBmb3IgJHt0aGlzLmRvd25UcmFpbC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcblxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgICAgfSxcblxuICAgICAgLy8gdG91Y2ggY2FuY2VsXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCBgRG93blVwTGlzdGVuZXIgKHBvaW50ZXIpIGNhbmNlbCBmb3IgJHt0aGlzLmRvd25UcmFpbC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZXZlbnQucG9pbnRlciA9PT0gdGhpcy5wb2ludGVyICk7XG4gICAgICAgIHRoaXMuYnV0dG9uVXAoIGV2ZW50ICk7XG5cbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgYnV0dG9uRG93biggZXZlbnQgKSB7XG4gICAgLy8gYWxyZWFkeSBkb3duIGZyb20gYW5vdGhlciBwb2ludGVyLCBkb24ndCBkbyBhbnl0aGluZ1xuICAgIGlmICggdGhpcy5pc0Rvd24gKSB7IHJldHVybjsgfVxuXG4gICAgLy8gaWdub3JlIG90aGVyIG1vdXNlIGJ1dHRvbnNcbiAgICBpZiAoIGV2ZW50LnBvaW50ZXIgaW5zdGFuY2VvZiBNb3VzZSAmJiBldmVudC5kb21FdmVudC5idXR0b24gIT09IHRoaXMub3B0aW9ucy5tb3VzZUJ1dHRvbiApIHsgcmV0dXJuOyB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdEb3duVXBMaXN0ZW5lciBidXR0b25Eb3duJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gYWRkIG91ciBsaXN0ZW5lciBzbyB3ZSBjYXRjaCB0aGUgdXAgd2hlcmV2ZXIgd2UgYXJlXG4gICAgZXZlbnQucG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmRvd25MaXN0ZW5lciApO1xuXG4gICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgIHRoaXMuZG93bkN1cnJlbnRUYXJnZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgIHRoaXMuZG93blRyYWlsID0gZXZlbnQudHJhaWwuc3VidHJhaWxUbyggZXZlbnQuY3VycmVudFRhcmdldCwgZmFsc2UgKTtcbiAgICB0aGlzLnBvaW50ZXIgPSBldmVudC5wb2ludGVyO1xuXG4gICAgaWYgKCB0aGlzLm9wdGlvbnMuZG93biApIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kb3duKCBldmVudCwgdGhpcy5kb3duVHJhaWwgKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgYnV0dG9uVXAoIGV2ZW50ICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ0Rvd25VcExpc3RlbmVyIGJ1dHRvblVwJyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB0aGlzLnBvaW50ZXIucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5kb3duTGlzdGVuZXIgKTtcblxuICAgIGNvbnN0IGN1cnJlbnRUYXJnZXRTYXZlID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0ID0gdGhpcy5kb3duQ3VycmVudFRhcmdldDsgLy8gdXAgaXMgaGFuZGxlZCBieSBhIHBvaW50ZXIgbGlzdGVuZXIsIHNvIGN1cnJlbnRUYXJnZXQgd291bGQgYmUgbnVsbC5cbiAgICBpZiAoIHRoaXMub3B0aW9ucy51cEluc2lkZSB8fCB0aGlzLm9wdGlvbnMudXBPdXRzaWRlICkge1xuICAgICAgY29uc3QgdHJhaWxVbmRlclBvaW50ZXIgPSBldmVudC50cmFpbDtcblxuICAgICAgLy8gVE9ETzogY29uc2lkZXIgY2hhbmdpbmcgdGhpcyBzbyB0aGF0IGl0IGp1c3QgZG9lcyBhIGhpdCBjaGVjayBhbmQgaWdub3JlcyBhbnl0aGluZyBpbiBmcm9udD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGNvbnN0IGlzSW5zaWRlID0gdHJhaWxVbmRlclBvaW50ZXIuaXNFeHRlbnNpb25PZiggdGhpcy5kb3duVHJhaWwsIHRydWUgKSAmJiAhdGhpcy5pbnRlcnJ1cHRlZDtcblxuICAgICAgaWYgKCBpc0luc2lkZSAmJiB0aGlzLm9wdGlvbnMudXBJbnNpZGUgKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy51cEluc2lkZSggZXZlbnQsIHRoaXMuZG93blRyYWlsICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIWlzSW5zaWRlICYmIHRoaXMub3B0aW9ucy51cE91dHNpZGUgKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy51cE91dHNpZGUoIGV2ZW50LCB0aGlzLmRvd25UcmFpbCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy5vcHRpb25zLnVwICkge1xuICAgICAgdGhpcy5vcHRpb25zLnVwKCBldmVudCwgdGhpcy5kb3duVHJhaWwgKTtcbiAgICB9XG4gICAgZXZlbnQuY3VycmVudFRhcmdldCA9IGN1cnJlbnRUYXJnZXRTYXZlOyAvLyBiZSBwb2xpdGUgdG8gb3RoZXIgbGlzdGVuZXJzLCByZXN0b3JlIGN1cnJlbnRUYXJnZXRcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogZXZlbnRzIGNhbGxlZCBmcm9tIHRoZSBub2RlIGlucHV0IGxpc3RlbmVyXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIG1vdXNlL3RvdWNoIGRvd24gb24gdGhpcyBub2RlXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSB7U2NlbmVyeUV2ZW50fSBldmVudFxuICAgKi9cbiAgZG93biggZXZlbnQgKSB7XG4gICAgdGhpcy5idXR0b25Eb3duKCBldmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGlucHV0IGlzIGludGVycnVwdGVkIG9uIHRoaXMgbGlzdGVuZXIsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjE4XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGludGVycnVwdCgpIHtcbiAgICBpZiAoIHRoaXMuaXNEb3duICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnRG93blVwTGlzdGVuZXIgaW50ZXJydXB0JyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAgIHRoaXMuaW50ZXJydXB0ZWQgPSB0cnVlO1xuXG4gICAgICBjb25zdCBjb250ZXh0ID0gRXZlbnRDb250ZXh0LmNyZWF0ZVN5bnRoZXRpYygpO1xuXG4gICAgICAvLyBXZSBjcmVhdGUgYSBzeW50aGV0aWMgZXZlbnQgaGVyZSwgYXMgdGhlcmUgaXMgbm8gYXZhaWxhYmxlIGV2ZW50IGhlcmUuXG4gICAgICAvLyBFbXB0eSB0cmFpbCwgc28gdGhhdCBpdCBmb3Itc3VyZSBpc24ndCB1bmRlciBvdXIgZG93blRyYWlsIChndWFyYW50ZWVpbmcgdGhhdCBpc0luc2lkZSB3aWxsIGJlIGZhbHNlKS5cbiAgICAgIGNvbnN0IHN5bnRoZXRpY0V2ZW50ID0gbmV3IFNjZW5lcnlFdmVudCggbmV3IFRyYWlsKCksICdzeW50aGV0aWMnLCB0aGlzLnBvaW50ZXIsIGNvbnRleHQgKTtcbiAgICAgIHN5bnRoZXRpY0V2ZW50LmN1cnJlbnRUYXJnZXQgPSB0aGlzLmRvd25DdXJyZW50VGFyZ2V0O1xuICAgICAgdGhpcy5idXR0b25VcCggc3ludGhldGljRXZlbnQgKTtcblxuICAgICAgdGhpcy5pbnRlcnJ1cHRlZCA9IGZhbHNlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRG93blVwTGlzdGVuZXInLCBEb3duVXBMaXN0ZW5lciApO1xuXG5leHBvcnQgZGVmYXVsdCBEb3duVXBMaXN0ZW5lcjsiXSwibmFtZXMiOlsiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJQaGV0aW9PYmplY3QiLCJFdmVudENvbnRleHQiLCJNb3VzZSIsInNjZW5lcnkiLCJTY2VuZXJ5RXZlbnQiLCJUcmFpbCIsIkRvd25VcExpc3RlbmVyIiwiYnV0dG9uRG93biIsImV2ZW50IiwiaXNEb3duIiwicG9pbnRlciIsImRvbUV2ZW50IiwiYnV0dG9uIiwib3B0aW9ucyIsIm1vdXNlQnV0dG9uIiwic2NlbmVyeUxvZyIsIklucHV0TGlzdGVuZXIiLCJwdXNoIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRvd25MaXN0ZW5lciIsImRvd25DdXJyZW50VGFyZ2V0IiwiY3VycmVudFRhcmdldCIsImRvd25UcmFpbCIsInRyYWlsIiwic3VidHJhaWxUbyIsImRvd24iLCJwb3AiLCJidXR0b25VcCIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJjdXJyZW50VGFyZ2V0U2F2ZSIsInVwSW5zaWRlIiwidXBPdXRzaWRlIiwidHJhaWxVbmRlclBvaW50ZXIiLCJpc0luc2lkZSIsImlzRXh0ZW5zaW9uT2YiLCJpbnRlcnJ1cHRlZCIsInVwIiwiaW50ZXJydXB0IiwiY29udGV4dCIsImNyZWF0ZVN5bnRoZXRpYyIsInN5bnRoZXRpY0V2ZW50IiwiY29uc3RydWN0b3IiLCJhc3NlcnQiLCJ0b1N0cmluZyIsImNhbmNlbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHdCQUF3Qiw4Q0FBOEM7QUFDN0UsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsT0FBT0Msa0JBQWtCLHFDQUFxQztBQUM5RCxTQUFTQyxZQUFZLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFFQyxZQUFZLEVBQUVDLEtBQUssUUFBUSxnQkFBZ0I7QUFFbEY7O0NBRUMsR0FDRCxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVC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