// Copyright 2018-2023, University of Colorado Boulder
/**
 * BorderAlertsDescriber is "sub-describer" used in MovementAlerter to manage its border alerts. Border alerts will
 * be alerted either once when object movement intersects with the bounds. With the addition of an option, the
 * border alert will be repeated for as long as the moving object is dragged against that bound, see repeatBorderAlerts.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import { KeyboardUtils } from '../../../../scenery/js/imports.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import DirectionEnum from './DirectionEnum.js';
// constants
const leftBorderAlertString = SceneryPhetStrings.a11y.movementAlerter.leftBorderAlert;
const rightBorderAlertString = SceneryPhetStrings.a11y.movementAlerter.rightBorderAlert;
const topBorderAlertString = SceneryPhetStrings.a11y.movementAlerter.topBorderAlert;
const bottomBorderAlertString = SceneryPhetStrings.a11y.movementAlerter.bottomBorderAlert;
const DEFAULT_TOP_BORDER_ALERT = topBorderAlertString;
/**
 * Responsible for alerting when the temperature increases
 * @param {Object} [options]
 * @constructor
 */ let BorderAlertsDescriber = class BorderAlertsDescriber {
    /**
   * Wrap the direction property in an Utterance if not already one. Null is supported.
   * @private
   * @param {TAlertable} alert
   * @param {DirectionEnum} direction
   * @param {Object} [utteranceOptions] - if creating an Utterance, options to pass to it
   */ setDirectionUtterance(alert, direction, utteranceOptions) {
        // Nothing to set if null;
        if (alert !== null) {
            if (alert instanceof Utterance) {
                this[direction] = alert;
            } else {
                assert && utteranceOptions && assert(!utteranceOptions.alert, ' setDirectionUtterance sets its own alert');
                this[direction] = new Utterance(merge({
                    alert: new ResponsePacket({
                        objectResponse: alert
                    }) // each alert is an object response
                }, utteranceOptions));
            }
        }
    }
    /**
   * Based on a position and the border bounds, if the position is touching the bounds, then alert that we are at border.
   * By passing in an optional key, you can prioritize that direction if you are at the corner.
   * @private
   *
   * @param {Vector2} position
   * @param {string} [key] - prefer this direction key if provided
   * @returns{TAlertable} - null if there is nothing to alert
   */ getAlertAtBorder(position, key) {
        let alertDirection;
        const bordersTouching = [];
        // at left now, but wasn't last position
        if (position.x === this.boundsProperty.value.left) {
            bordersTouching.push(DirectionEnum.LEFT);
        }
        // at right now, but wasn't last position
        if (position.x === this.boundsProperty.value.right) {
            bordersTouching.push(DirectionEnum.RIGHT);
        }
        // at top now, but wasn't last position
        if (position.y === this.boundsProperty.value.top) {
            bordersTouching.push(DirectionEnum.UP);
        }
        // at bottom now, but wasn't last position
        if (position.y === this.boundsProperty.value.bottom) {
            bordersTouching.push(DirectionEnum.DOWN);
        }
        // corner case
        if (bordersTouching.length > 1) {
            key = key || '';
            const possibleDirection = DirectionEnum.keyToDirection(key);
            // if the key matches a border direction, use that instead of another wall that we may also be touching
            if (possibleDirection && bordersTouching.indexOf(possibleDirection) >= 0) {
                alertDirection = possibleDirection;
            }
        } else if (bordersTouching.length === 1) {
            alertDirection = bordersTouching[0];
        }
        // Then we are potentially going to alert
        if (alertDirection) {
            assert && assert(DirectionEnum.isRelativeDirection(alertDirection), `unsupported direction: ${alertDirection}`);
            const utterance = this[alertDirection];
            // Null means unsupported direction, no alert to be had here.
            if (utterance) {
                return utterance;
            }
        }
        return null;
    }
    /**
   * @public
   * @param {Vector2} position
   * @param {KeyboardEvent} [domEvent] - we don't get this from a mouse drag listener
   * @returns{TAlertable} - null if there is nothing to alert
   */ getAlertOnEndDrag(position, domEvent) {
        let key;
        if (domEvent) {
            key = KeyboardUtils.getEventCode(domEvent);
        }
        return this.getAlertAtBorder(position, key);
    }
    /**
   * @public
   */ reset() {
        this[DirectionEnum.LEFT] && this[DirectionEnum.LEFT].reset();
        this[DirectionEnum.RIGHT] && this[DirectionEnum.RIGHT].reset();
        this[DirectionEnum.UP] && this[DirectionEnum.UP].reset();
        this[DirectionEnum.DOWN] && this[DirectionEnum.DOWN].reset();
    }
    /**
   * Default top alert for the border alerts
   * @public
   *
   * @returns {string}
   */ static getDefaultTopAlert() {
        return DEFAULT_TOP_BORDER_ALERT;
    }
    constructor(options){
        options = merge({
            // {Property<Bounds2>} - The bounds that makes the border we alert when against
            boundsProperty: new Property(new Bounds2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)),
            // {TAlertable} At left edge, right edge, top, and bottom with values to alert if you reach that bound.
            // Pass in null if you don't want that border alerted. By default, if these are non-Utterances, they will be wrapped
            // in utterances, and for voicing classified as "object responses", if passing in a custom utterance, it is up to
            // the client to divide into voicing response categories.
            leftAlert: leftBorderAlertString,
            rightAlert: rightBorderAlertString,
            topAlert: DEFAULT_TOP_BORDER_ALERT,
            bottomAlert: bottomBorderAlertString,
            // Applied to any Utterances created from the Alert options above. Utterances are only created to wrap the above
            // options if an Utterance is not already provided
            utteranceOptions: {}
        }, options);
        // @public (Utterance) - these keys should stay the same as keys from DirectionEnum,
        this[DirectionEnum.LEFT] = null;
        this[DirectionEnum.RIGHT] = null;
        this[DirectionEnum.UP] = null;
        this[DirectionEnum.DOWN] = null;
        this.setDirectionUtterance(options.leftAlert, DirectionEnum.LEFT, options.utteranceOptions);
        this.setDirectionUtterance(options.rightAlert, DirectionEnum.RIGHT, options.utteranceOptions);
        this.setDirectionUtterance(options.topAlert, DirectionEnum.UP, options.utteranceOptions);
        this.setDirectionUtterance(options.bottomAlert, DirectionEnum.DOWN, options.utteranceOptions);
        // @private
        this.boundsProperty = options.boundsProperty; // The drag border
    }
};
sceneryPhet.register('BorderAlertsDescriber', BorderAlertsDescriber);
export default BorderAlertsDescriber;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2Rlc2NyaWJlcnMvQm9yZGVyQWxlcnRzRGVzY3JpYmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJvcmRlckFsZXJ0c0Rlc2NyaWJlciBpcyBcInN1Yi1kZXNjcmliZXJcIiB1c2VkIGluIE1vdmVtZW50QWxlcnRlciB0byBtYW5hZ2UgaXRzIGJvcmRlciBhbGVydHMuIEJvcmRlciBhbGVydHMgd2lsbFxuICogYmUgYWxlcnRlZCBlaXRoZXIgb25jZSB3aGVuIG9iamVjdCBtb3ZlbWVudCBpbnRlcnNlY3RzIHdpdGggdGhlIGJvdW5kcy4gV2l0aCB0aGUgYWRkaXRpb24gb2YgYW4gb3B0aW9uLCB0aGVcbiAqIGJvcmRlciBhbGVydCB3aWxsIGJlIHJlcGVhdGVkIGZvciBhcyBsb25nIGFzIHRoZSBtb3Zpbmcgb2JqZWN0IGlzIGRyYWdnZWQgYWdhaW5zdCB0aGF0IGJvdW5kLCBzZWUgcmVwZWF0Qm9yZGVyQWxlcnRzLlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHsgS2V5Ym9hcmRVdGlscyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUmVzcG9uc2VQYWNrZXQgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi4vLi4vLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IERpcmVjdGlvbkVudW0gZnJvbSAnLi9EaXJlY3Rpb25FbnVtLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBsZWZ0Qm9yZGVyQWxlcnRTdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tb3ZlbWVudEFsZXJ0ZXIubGVmdEJvcmRlckFsZXJ0O1xuY29uc3QgcmlnaHRCb3JkZXJBbGVydFN0cmluZyA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1vdmVtZW50QWxlcnRlci5yaWdodEJvcmRlckFsZXJ0O1xuY29uc3QgdG9wQm9yZGVyQWxlcnRTdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tb3ZlbWVudEFsZXJ0ZXIudG9wQm9yZGVyQWxlcnQ7XG5jb25zdCBib3R0b21Cb3JkZXJBbGVydFN0cmluZyA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1vdmVtZW50QWxlcnRlci5ib3R0b21Cb3JkZXJBbGVydDtcblxuY29uc3QgREVGQVVMVF9UT1BfQk9SREVSX0FMRVJUID0gdG9wQm9yZGVyQWxlcnRTdHJpbmc7XG5cbi8qKlxuICogUmVzcG9uc2libGUgZm9yIGFsZXJ0aW5nIHdoZW4gdGhlIHRlbXBlcmF0dXJlIGluY3JlYXNlc1xuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmNsYXNzIEJvcmRlckFsZXJ0c0Rlc2NyaWJlciB7XG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIHtQcm9wZXJ0eTxCb3VuZHMyPn0gLSBUaGUgYm91bmRzIHRoYXQgbWFrZXMgdGhlIGJvcmRlciB3ZSBhbGVydCB3aGVuIGFnYWluc3RcbiAgICAgIGJvdW5kc1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIG5ldyBCb3VuZHMyKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSApLFxuXG4gICAgICAvLyB7VEFsZXJ0YWJsZX0gQXQgbGVmdCBlZGdlLCByaWdodCBlZGdlLCB0b3AsIGFuZCBib3R0b20gd2l0aCB2YWx1ZXMgdG8gYWxlcnQgaWYgeW91IHJlYWNoIHRoYXQgYm91bmQuXG4gICAgICAvLyBQYXNzIGluIG51bGwgaWYgeW91IGRvbid0IHdhbnQgdGhhdCBib3JkZXIgYWxlcnRlZC4gQnkgZGVmYXVsdCwgaWYgdGhlc2UgYXJlIG5vbi1VdHRlcmFuY2VzLCB0aGV5IHdpbGwgYmUgd3JhcHBlZFxuICAgICAgLy8gaW4gdXR0ZXJhbmNlcywgYW5kIGZvciB2b2ljaW5nIGNsYXNzaWZpZWQgYXMgXCJvYmplY3QgcmVzcG9uc2VzXCIsIGlmIHBhc3NpbmcgaW4gYSBjdXN0b20gdXR0ZXJhbmNlLCBpdCBpcyB1cCB0b1xuICAgICAgLy8gdGhlIGNsaWVudCB0byBkaXZpZGUgaW50byB2b2ljaW5nIHJlc3BvbnNlIGNhdGVnb3JpZXMuXG4gICAgICBsZWZ0QWxlcnQ6IGxlZnRCb3JkZXJBbGVydFN0cmluZyxcbiAgICAgIHJpZ2h0QWxlcnQ6IHJpZ2h0Qm9yZGVyQWxlcnRTdHJpbmcsXG4gICAgICB0b3BBbGVydDogREVGQVVMVF9UT1BfQk9SREVSX0FMRVJULFxuICAgICAgYm90dG9tQWxlcnQ6IGJvdHRvbUJvcmRlckFsZXJ0U3RyaW5nLFxuXG4gICAgICAvLyBBcHBsaWVkIHRvIGFueSBVdHRlcmFuY2VzIGNyZWF0ZWQgZnJvbSB0aGUgQWxlcnQgb3B0aW9ucyBhYm92ZS4gVXR0ZXJhbmNlcyBhcmUgb25seSBjcmVhdGVkIHRvIHdyYXAgdGhlIGFib3ZlXG4gICAgICAvLyBvcHRpb25zIGlmIGFuIFV0dGVyYW5jZSBpcyBub3QgYWxyZWFkeSBwcm92aWRlZFxuICAgICAgdXR0ZXJhbmNlT3B0aW9uczoge31cbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICAvLyBAcHVibGljIChVdHRlcmFuY2UpIC0gdGhlc2Uga2V5cyBzaG91bGQgc3RheSB0aGUgc2FtZSBhcyBrZXlzIGZyb20gRGlyZWN0aW9uRW51bSxcbiAgICB0aGlzWyBEaXJlY3Rpb25FbnVtLkxFRlQgXSA9IG51bGw7XG4gICAgdGhpc1sgRGlyZWN0aW9uRW51bS5SSUdIVCBdID0gbnVsbDtcbiAgICB0aGlzWyBEaXJlY3Rpb25FbnVtLlVQIF0gPSBudWxsO1xuICAgIHRoaXNbIERpcmVjdGlvbkVudW0uRE9XTiBdID0gbnVsbDtcblxuICAgIHRoaXMuc2V0RGlyZWN0aW9uVXR0ZXJhbmNlKCBvcHRpb25zLmxlZnRBbGVydCwgRGlyZWN0aW9uRW51bS5MRUZULCBvcHRpb25zLnV0dGVyYW5jZU9wdGlvbnMgKTtcbiAgICB0aGlzLnNldERpcmVjdGlvblV0dGVyYW5jZSggb3B0aW9ucy5yaWdodEFsZXJ0LCBEaXJlY3Rpb25FbnVtLlJJR0hULCBvcHRpb25zLnV0dGVyYW5jZU9wdGlvbnMgKTtcbiAgICB0aGlzLnNldERpcmVjdGlvblV0dGVyYW5jZSggb3B0aW9ucy50b3BBbGVydCwgRGlyZWN0aW9uRW51bS5VUCwgb3B0aW9ucy51dHRlcmFuY2VPcHRpb25zICk7XG4gICAgdGhpcy5zZXREaXJlY3Rpb25VdHRlcmFuY2UoIG9wdGlvbnMuYm90dG9tQWxlcnQsIERpcmVjdGlvbkVudW0uRE9XTiwgb3B0aW9ucy51dHRlcmFuY2VPcHRpb25zICk7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMuYm91bmRzUHJvcGVydHkgPSBvcHRpb25zLmJvdW5kc1Byb3BlcnR5OyAvLyBUaGUgZHJhZyBib3JkZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBXcmFwIHRoZSBkaXJlY3Rpb24gcHJvcGVydHkgaW4gYW4gVXR0ZXJhbmNlIGlmIG5vdCBhbHJlYWR5IG9uZS4gTnVsbCBpcyBzdXBwb3J0ZWQuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7VEFsZXJ0YWJsZX0gYWxlcnRcbiAgICogQHBhcmFtIHtEaXJlY3Rpb25FbnVtfSBkaXJlY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IFt1dHRlcmFuY2VPcHRpb25zXSAtIGlmIGNyZWF0aW5nIGFuIFV0dGVyYW5jZSwgb3B0aW9ucyB0byBwYXNzIHRvIGl0XG4gICAqL1xuICBzZXREaXJlY3Rpb25VdHRlcmFuY2UoIGFsZXJ0LCBkaXJlY3Rpb24sIHV0dGVyYW5jZU9wdGlvbnMgKSB7XG5cbiAgICAvLyBOb3RoaW5nIHRvIHNldCBpZiBudWxsO1xuICAgIGlmICggYWxlcnQgIT09IG51bGwgKSB7XG4gICAgICBpZiAoIGFsZXJ0IGluc3RhbmNlb2YgVXR0ZXJhbmNlICkge1xuICAgICAgICB0aGlzWyBkaXJlY3Rpb24gXSA9IGFsZXJ0O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydCAmJiB1dHRlcmFuY2VPcHRpb25zICYmIGFzc2VydCggIXV0dGVyYW5jZU9wdGlvbnMuYWxlcnQsICcgc2V0RGlyZWN0aW9uVXR0ZXJhbmNlIHNldHMgaXRzIG93biBhbGVydCcgKTtcbiAgICAgICAgdGhpc1sgZGlyZWN0aW9uIF0gPSBuZXcgVXR0ZXJhbmNlKCBtZXJnZSgge1xuICAgICAgICAgICAgYWxlcnQ6IG5ldyBSZXNwb25zZVBhY2tldCggeyBvYmplY3RSZXNwb25zZTogYWxlcnQgfSApIC8vIGVhY2ggYWxlcnQgaXMgYW4gb2JqZWN0IHJlc3BvbnNlXG4gICAgICAgICAgfSwgdXR0ZXJhbmNlT3B0aW9ucyApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEJhc2VkIG9uIGEgcG9zaXRpb24gYW5kIHRoZSBib3JkZXIgYm91bmRzLCBpZiB0aGUgcG9zaXRpb24gaXMgdG91Y2hpbmcgdGhlIGJvdW5kcywgdGhlbiBhbGVydCB0aGF0IHdlIGFyZSBhdCBib3JkZXIuXG4gICAqIEJ5IHBhc3NpbmcgaW4gYW4gb3B0aW9uYWwga2V5LCB5b3UgY2FuIHByaW9yaXRpemUgdGhhdCBkaXJlY3Rpb24gaWYgeW91IGFyZSBhdCB0aGUgY29ybmVyLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBba2V5XSAtIHByZWZlciB0aGlzIGRpcmVjdGlvbiBrZXkgaWYgcHJvdmlkZWRcbiAgICogQHJldHVybnN7VEFsZXJ0YWJsZX0gLSBudWxsIGlmIHRoZXJlIGlzIG5vdGhpbmcgdG8gYWxlcnRcbiAgICovXG4gIGdldEFsZXJ0QXRCb3JkZXIoIHBvc2l0aW9uLCBrZXkgKSB7XG4gICAgbGV0IGFsZXJ0RGlyZWN0aW9uO1xuXG4gICAgY29uc3QgYm9yZGVyc1RvdWNoaW5nID0gW107XG5cbiAgICAvLyBhdCBsZWZ0IG5vdywgYnV0IHdhc24ndCBsYXN0IHBvc2l0aW9uXG4gICAgaWYgKCBwb3NpdGlvbi54ID09PSB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlLmxlZnQgKSB7XG4gICAgICBib3JkZXJzVG91Y2hpbmcucHVzaCggRGlyZWN0aW9uRW51bS5MRUZUICk7XG4gICAgfVxuXG4gICAgLy8gYXQgcmlnaHQgbm93LCBidXQgd2Fzbid0IGxhc3QgcG9zaXRpb25cbiAgICBpZiAoIHBvc2l0aW9uLnggPT09IHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUucmlnaHQgKSB7XG4gICAgICBib3JkZXJzVG91Y2hpbmcucHVzaCggRGlyZWN0aW9uRW51bS5SSUdIVCApO1xuICAgIH1cblxuICAgIC8vIGF0IHRvcCBub3csIGJ1dCB3YXNuJ3QgbGFzdCBwb3NpdGlvblxuICAgIGlmICggcG9zaXRpb24ueSA9PT0gdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZS50b3AgKSB7XG4gICAgICBib3JkZXJzVG91Y2hpbmcucHVzaCggRGlyZWN0aW9uRW51bS5VUCApO1xuICAgIH1cblxuICAgIC8vIGF0IGJvdHRvbSBub3csIGJ1dCB3YXNuJ3QgbGFzdCBwb3NpdGlvblxuICAgIGlmICggcG9zaXRpb24ueSA9PT0gdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZS5ib3R0b20gKSB7XG4gICAgICBib3JkZXJzVG91Y2hpbmcucHVzaCggRGlyZWN0aW9uRW51bS5ET1dOICk7XG4gICAgfVxuXG4gICAgLy8gY29ybmVyIGNhc2VcbiAgICBpZiAoIGJvcmRlcnNUb3VjaGluZy5sZW5ndGggPiAxICkge1xuICAgICAga2V5ID0ga2V5IHx8ICcnO1xuICAgICAgY29uc3QgcG9zc2libGVEaXJlY3Rpb24gPSBEaXJlY3Rpb25FbnVtLmtleVRvRGlyZWN0aW9uKCBrZXkgKTtcblxuICAgICAgLy8gaWYgdGhlIGtleSBtYXRjaGVzIGEgYm9yZGVyIGRpcmVjdGlvbiwgdXNlIHRoYXQgaW5zdGVhZCBvZiBhbm90aGVyIHdhbGwgdGhhdCB3ZSBtYXkgYWxzbyBiZSB0b3VjaGluZ1xuICAgICAgaWYgKCBwb3NzaWJsZURpcmVjdGlvbiAmJiBib3JkZXJzVG91Y2hpbmcuaW5kZXhPZiggcG9zc2libGVEaXJlY3Rpb24gKSA+PSAwICkge1xuICAgICAgICBhbGVydERpcmVjdGlvbiA9IHBvc3NpYmxlRGlyZWN0aW9uO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBub3JtYWwgc2luZ2xlIGJvcmRlciBjYXNlXG4gICAgZWxzZSBpZiAoIGJvcmRlcnNUb3VjaGluZy5sZW5ndGggPT09IDEgKSB7XG4gICAgICBhbGVydERpcmVjdGlvbiA9IGJvcmRlcnNUb3VjaGluZ1sgMCBdO1xuICAgIH1cblxuICAgIC8vIFRoZW4gd2UgYXJlIHBvdGVudGlhbGx5IGdvaW5nIHRvIGFsZXJ0XG4gICAgaWYgKCBhbGVydERpcmVjdGlvbiApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIERpcmVjdGlvbkVudW0uaXNSZWxhdGl2ZURpcmVjdGlvbiggYWxlcnREaXJlY3Rpb24gKSwgYHVuc3VwcG9ydGVkIGRpcmVjdGlvbjogJHthbGVydERpcmVjdGlvbn1gICk7XG4gICAgICBjb25zdCB1dHRlcmFuY2UgPSB0aGlzWyBhbGVydERpcmVjdGlvbiBdO1xuXG4gICAgICAvLyBOdWxsIG1lYW5zIHVuc3VwcG9ydGVkIGRpcmVjdGlvbiwgbm8gYWxlcnQgdG8gYmUgaGFkIGhlcmUuXG4gICAgICBpZiAoIHV0dGVyYW5jZSApIHtcbiAgICAgICAgcmV0dXJuIHV0dGVyYW5jZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gW2RvbUV2ZW50XSAtIHdlIGRvbid0IGdldCB0aGlzIGZyb20gYSBtb3VzZSBkcmFnIGxpc3RlbmVyXG4gICAqIEByZXR1cm5ze1RBbGVydGFibGV9IC0gbnVsbCBpZiB0aGVyZSBpcyBub3RoaW5nIHRvIGFsZXJ0XG4gICAqL1xuICBnZXRBbGVydE9uRW5kRHJhZyggcG9zaXRpb24sIGRvbUV2ZW50ICkge1xuICAgIGxldCBrZXk7XG4gICAgaWYgKCBkb21FdmVudCApIHtcbiAgICAgIGtleSA9IEtleWJvYXJkVXRpbHMuZ2V0RXZlbnRDb2RlKCBkb21FdmVudCApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRBbGVydEF0Qm9yZGVyKCBwb3NpdGlvbiwga2V5ICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpc1sgRGlyZWN0aW9uRW51bS5MRUZUIF0gJiYgdGhpc1sgRGlyZWN0aW9uRW51bS5MRUZUIF0ucmVzZXQoKTtcbiAgICB0aGlzWyBEaXJlY3Rpb25FbnVtLlJJR0hUIF0gJiYgdGhpc1sgRGlyZWN0aW9uRW51bS5SSUdIVCBdLnJlc2V0KCk7XG4gICAgdGhpc1sgRGlyZWN0aW9uRW51bS5VUCBdICYmIHRoaXNbIERpcmVjdGlvbkVudW0uVVAgXS5yZXNldCgpO1xuICAgIHRoaXNbIERpcmVjdGlvbkVudW0uRE9XTiBdICYmIHRoaXNbIERpcmVjdGlvbkVudW0uRE9XTiBdLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogRGVmYXVsdCB0b3AgYWxlcnQgZm9yIHRoZSBib3JkZXIgYWxlcnRzXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICovXG4gIHN0YXRpYyBnZXREZWZhdWx0VG9wQWxlcnQoKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfVE9QX0JPUkRFUl9BTEVSVDtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0JvcmRlckFsZXJ0c0Rlc2NyaWJlcicsIEJvcmRlckFsZXJ0c0Rlc2NyaWJlciApO1xuZXhwb3J0IGRlZmF1bHQgQm9yZGVyQWxlcnRzRGVzY3JpYmVyOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJtZXJnZSIsIktleWJvYXJkVXRpbHMiLCJSZXNwb25zZVBhY2tldCIsIlV0dGVyYW5jZSIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiRGlyZWN0aW9uRW51bSIsImxlZnRCb3JkZXJBbGVydFN0cmluZyIsImExMXkiLCJtb3ZlbWVudEFsZXJ0ZXIiLCJsZWZ0Qm9yZGVyQWxlcnQiLCJyaWdodEJvcmRlckFsZXJ0U3RyaW5nIiwicmlnaHRCb3JkZXJBbGVydCIsInRvcEJvcmRlckFsZXJ0U3RyaW5nIiwidG9wQm9yZGVyQWxlcnQiLCJib3R0b21Cb3JkZXJBbGVydFN0cmluZyIsImJvdHRvbUJvcmRlckFsZXJ0IiwiREVGQVVMVF9UT1BfQk9SREVSX0FMRVJUIiwiQm9yZGVyQWxlcnRzRGVzY3JpYmVyIiwic2V0RGlyZWN0aW9uVXR0ZXJhbmNlIiwiYWxlcnQiLCJkaXJlY3Rpb24iLCJ1dHRlcmFuY2VPcHRpb25zIiwiYXNzZXJ0Iiwib2JqZWN0UmVzcG9uc2UiLCJnZXRBbGVydEF0Qm9yZGVyIiwicG9zaXRpb24iLCJrZXkiLCJhbGVydERpcmVjdGlvbiIsImJvcmRlcnNUb3VjaGluZyIsIngiLCJib3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwibGVmdCIsInB1c2giLCJMRUZUIiwicmlnaHQiLCJSSUdIVCIsInkiLCJ0b3AiLCJVUCIsImJvdHRvbSIsIkRPV04iLCJsZW5ndGgiLCJwb3NzaWJsZURpcmVjdGlvbiIsImtleVRvRGlyZWN0aW9uIiwiaW5kZXhPZiIsImlzUmVsYXRpdmVEaXJlY3Rpb24iLCJ1dHRlcmFuY2UiLCJnZXRBbGVydE9uRW5kRHJhZyIsImRvbUV2ZW50IiwiZ2V0RXZlbnRDb2RlIiwicmVzZXQiLCJnZXREZWZhdWx0VG9wQWxlcnQiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJOdW1iZXIiLCJORUdBVElWRV9JTkZJTklUWSIsIlBPU0lUSVZFX0lORklOSVRZIiwibGVmdEFsZXJ0IiwicmlnaHRBbGVydCIsInRvcEFsZXJ0IiwiYm90dG9tQWxlcnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsY0FBYyxrQ0FBa0M7QUFDdkQsT0FBT0MsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsV0FBVyxvQ0FBb0M7QUFDdEQsU0FBU0MsYUFBYSxRQUFRLG9DQUFvQztBQUNsRSxPQUFPQyxvQkFBb0IsbURBQW1EO0FBQzlFLE9BQU9DLGVBQWUsOENBQThDO0FBQ3BFLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0Msd0JBQXdCLDhCQUE4QjtBQUM3RCxPQUFPQyxtQkFBbUIscUJBQXFCO0FBRS9DLFlBQVk7QUFDWixNQUFNQyx3QkFBd0JGLG1CQUFtQkcsSUFBSSxDQUFDQyxlQUFlLENBQUNDLGVBQWU7QUFDckYsTUFBTUMseUJBQXlCTixtQkFBbUJHLElBQUksQ0FBQ0MsZUFBZSxDQUFDRyxnQkFBZ0I7QUFDdkYsTUFB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