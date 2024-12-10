// Copyright 2018-2024, University of Colorado Boulder
/**
 * A generic alerting type that will alert positional alerts based on a positionProperty and bounds (see
 * BorderAlertsDescriber) encapsulating the draggable area.
 *
 * This alerter supports response to description (see options.descriptionAlertNode), and voicing (see options.alertToVoicing).
 *
 * General usage involves calling this endDrag() function from all dragListeners that you want this functionality to describe
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import Alerter from './Alerter.js';
import BorderAlertsDescriber from './BorderAlertsDescriber.js';
import DirectionEnum from './DirectionEnum.js';
// constants
const downString = SceneryPhetStrings.a11y.movementAlerter.down;
const leftString = SceneryPhetStrings.a11y.movementAlerter.left;
const rightString = SceneryPhetStrings.a11y.movementAlerter.right;
const upString = SceneryPhetStrings.a11y.movementAlerter.up;
const upAndToTheLeftString = SceneryPhetStrings.a11y.movementAlerter.upAndToTheLeft;
const upAndToTheRightString = SceneryPhetStrings.a11y.movementAlerter.upAndToTheRight;
const downAndToTheLeftString = SceneryPhetStrings.a11y.movementAlerter.downAndToTheLeft;
const downAndToTheRightString = SceneryPhetStrings.a11y.movementAlerter.downAndToTheRight;
// in radians - threshold for diagonal movement is +/- 15 degrees from diagonals
const DIAGONAL_MOVEMENT_THRESHOLD = 15 * Math.PI / 180;
// mapping from alerting direction to the radian range that fills that space in the unit circle.
//
// 'UP' is in the bottom two quadrants and 'DOWN' is in the top two quadrants because y increases down for scenery.
//
// The diagonal directions take up the middle third of each quadrant, such that each "outside" third is in the range
// for a relative (primary) direction. Therefore each diagonal direction is 1/9 of the Unit circle, and each
// primary direction is 2/9 of the unit circle.
const DIRECTION_MAP = {
    UP: new Range(-3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
    DOWN: new Range(Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
    RIGHT: new Range(-Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD),
    // atan2 wraps around PI, so we will use absolute value in checks
    LEFT: new Range(3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI),
    UP_LEFT: new Range(-3 * Math.PI - DIAGONAL_MOVEMENT_THRESHOLD, -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
    DOWN_LEFT: new Range(3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
    UP_RIGHT: new Range(-Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD),
    DOWN_RIGHT: new Range(Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD)
};
const DIRECTION_MAP_KEYS = Object.keys(DIRECTION_MAP);
if (assert) {
    DIRECTION_MAP_KEYS.forEach((direction)=>{
        assert(DirectionEnum.keys.indexOf(direction) >= 0, `unexpected direction: ${direction}. Keys should be the same as those in DirectionEnum`);
    });
}
// the set of directional alerts including cardinal and intercardinal directions
const DEFAULT_MOVEMENT_DESCRIPTIONS = {
    LEFT: leftString,
    RIGHT: rightString,
    UP: upString,
    DOWN: downString,
    UP_LEFT: upAndToTheLeftString,
    UP_RIGHT: upAndToTheRightString,
    DOWN_LEFT: downAndToTheLeftString,
    DOWN_RIGHT: downAndToTheRightString
};
let MovementAlerter = class MovementAlerter extends Alerter {
    /**
   * Override to keep track of positioning between alerts
   * @public
   * @override
   *
   * @param {TAlertable} alertable - anything that can be passed to UtteranceQueue
   */ alert(alertable) {
        super.alert(alertable);
        this.lastAlertedPosition = this.positionProperty.get();
    }
    /**
   * Can be called with multiple directions, or just a single direction
   * @protected
   * @param {Array.<DirectionEnum>|DirectionEnum} directions
   */ alertDirections(directions) {
        if (DirectionEnum.includes(directions)) {
            directions = [
                directions
            ];
        }
        // support if an instance doesn't want to alert in all directions
        directions.forEach((direction)=>{
            this.directionChangeUtterance.alert.objectResponse = this.movementAlerts[direction];
            this.alert(this.directionChangeUtterance);
        });
    }
    /**
   * Alert a movement direction. The direction from this.lastAlertedPosition relative to the current value of the positionProperty
   * Call this from a listener or when the positionProperty has changed enough.
   * Can be overridden. Easy to implement method with the following schema:
   * (1) get the current value of the position property, and make sure it has changed enough from the lastAlertedPosition
   * (2) get the directions from the difference,
   * (3) alert those directions by calling this.alertDirections or this.alert,
   * see friction/view/describers/BookMovementAlerter.
   *
   * NOTE: don't call UtteranceQueue from the subtype!!!
   * NOTE: PhET a11y convention suggests that this should be called on drag end.
   *
   * @public
   */ alertDirectionalMovement() {
        const newPosition = this.positionProperty.get();
        if (!newPosition.equals(this.lastAlertedPosition)) {
            const directions = this.getDirections(newPosition, this.lastAlertedPosition);
            // make sure that these alerts exist
            if (assert) {
                directions.forEach((direction)=>{
                    assert(this.movementAlerts[direction] && typeof this.movementAlerts[direction] === 'string');
                });
            }
            this.alertDirections(directions);
        }
    }
    /**
   * Get the direction of movement that would take you from point A to point B, returning one of DirectionEnum.
   * These directions are described as they appear visually, with positive y going up.
   *
   * Uses Math.atan2, so the angle is mapped from 0 to +/- Math.PI.
   *
   * @param  {Vector2} newPoint - in the model coordinate frame
   * @param  {Vector2} oldPoint - in the model coordinate frame
   * @returns {Array.<DirectionEnum>} - contains one or two of the values in DirectionEnum, depending on whether or no you get
   *                            diagonal directions or their composite. See options.alertDiagonal for more info
   * @protected
   */ getDirections(newPoint, oldPoint) {
        const direction = MovementAlerter.getDirectionEnumerable(newPoint, oldPoint, this.modelViewTransform);
        // This includes complex directions like "UP_LEFT"
        if (this.alertDiagonal) {
            return [
                direction
            ];
        } else {
            return DirectionEnum.directionToRelativeDirections(direction);
        }
    }
    /**
   * Get one of DirectionEnum from a newPoint and an oldPoint that would describe the direction of movement
   * from the old point to the new point. These directions are described as they would appear visually, with
   * +y going up.
   * @private
   *
   * @param {Vector2} newPoint - in model coordinate frame
   * @param {Vector2} oldPoint - in model coordinate frame
   * @param {ModelViewTransform2} modelViewTransform
   * @returns {DirectionEnum}
   */ static getDirectionEnumerable(newPoint, oldPoint, modelViewTransform) {
        // to view coordinates to motion in the screen
        const newViewPoint = modelViewTransform.modelToViewPosition(newPoint);
        const oldViewPoint = modelViewTransform.modelToViewPosition(oldPoint);
        const dx = newViewPoint.x - oldViewPoint.x;
        const dy = newViewPoint.y - oldViewPoint.y;
        const angle = Math.atan2(dy, dx);
        return MovementAlerter.getDirectionEnumerableFromAngle(angle);
    }
    /**
   * Returns one of DirectionEnum from a provided angle.
   * @public
   * 
   * @param angle
   * @param modelViewTransform
   * @returns {DirectionEnum}
   */ static getDirectionEnumerableFromAngle(angle) {
        let direction;
        // atan2 wraps around Math.PI, so special check for moving left from absolute value
        if (DIRECTION_MAP.LEFT.contains(Math.abs(angle))) {
            direction = DirectionEnum.LEFT;
        }
        // otherwise, angle will be in one of the ranges in DIRECTION_MAP
        for(let i = 0; i < DIRECTION_MAP_KEYS.length; i++){
            const entry = DIRECTION_MAP[DIRECTION_MAP_KEYS[i]];
            if (entry.contains(angle)) {
                direction = DirectionEnum[DIRECTION_MAP_KEYS[i]];
                break;
            }
        }
        return direction;
    }
    /**
   * Get a description of direction from the provided angle. This will describe the motion as it appears
   * on screen. The angle should go from 0 to 2PI. Angles in the top two quadrants are described as going 'up'.
   * Angles in bottom two quadrants are described as going 'down'. Angles in the right two quadrants are described
   * as going "right", and angles in the left two quadrants are described as going to the left.
   *
   * For now, this will always include diagonal alerts. In the future we can exclude the primary intercardinal
   * directions.
   * @public
   *
   * @param {number} angle - an angle of directional movement in the model coordinate frame
   * @param {Object} [options]
   * @returns {string}
   */ static getDirectionDescriptionFromAngle(angle, options) {
        options = merge({
            // see constructor options for description
            modelViewTransform: ModelViewTransform2.createIdentity()
        }, options);
        // start and end positions to determine angle in view coordinate frame
        const modelStartPoint = new Vector2(0, 0);
        // trim off precision error when very close to 0 or 1 so that cardinal direction is still described
        // when off by a minuscule amount
        const dx = Utils.toFixedNumber(Math.cos(angle), 8);
        const dy = Utils.toFixedNumber(Math.sin(angle), 8);
        const modelEndPoint = new Vector2(dx, dy);
        const direction = MovementAlerter.getDirectionEnumerable(modelEndPoint, modelStartPoint, options.modelViewTransform);
        return DEFAULT_MOVEMENT_DESCRIPTIONS[direction];
    }
    /**
   * @public
   * @param {window.Event} [domEvent]
   */ endDrag(domEvent) {
        // better to have the movement alerts, then the alert about the border
        this.alertDirectionalMovement();
        const alert = this.borderAlertsDescriber.getAlertOnEndDrag(this.positionProperty.get(), domEvent);
        alert && this.alert(alert);
    }
    /**
   * @public
   */ reset() {
        this.lastAlertedPosition = this.initialFirstPosition;
        // if any alerts are of type Utterance, reset them.
        this.movementAlertKeys.forEach((direction)=>{
            const alert = this.movementAlerts[direction];
            alert && alert.reset && alert.reset();
        });
        this.borderAlertsDescriber.reset();
    }
    /**
   * Get the default movement descriptions
   * @returns {Object.<DirectionEnum, string>}} - not an actual DirectionEnum, but the toString() of it (as a key).
   * @public
   */ static getDefaultMovementDescriptions() {
        return merge({}, DEFAULT_MOVEMENT_DESCRIPTIONS); // clone
    }
    /**
   * @param {Property.<Vector2>} positionProperty - Property that drives movement, in model coordinate frame
   * @param {Object} [options]
   */ constructor(positionProperty, options){
        options = merge({
            // see BorderAlertsDescriber
            borderAlertsOptions: null,
            // {Object.<DIRECTION, TAlertable> see DirectionEnum for allowed keys. Any missing keys will not be alerted.
            // Use `{}` to omit movementAlerts.
            movementAlerts: DEFAULT_MOVEMENT_DESCRIPTIONS,
            // {ModelViewTransform2} - if provided, this will transform between the model and view coordinate frames, so
            // that movement in the view is described
            modelViewTransform: ModelViewTransform2.createIdentity(),
            // if false then diagonal alerts will be converted to two primary direction alerts that are alerted back to back
            // i.e. UP_LEFT becomes "UP" and "LEFT"
            alertDiagonal: false
        }, options);
        assert && assert(options.movementAlerts instanceof Object);
        assert && assert(!Array.isArray(options.movementAlerts)); // should not be an Array
        super(options);
        // @private
        this.movementAlertKeys = Object.keys(options.movementAlerts);
        if (assert) {
            for(let i = 0; i < this.movementAlertKeys.length; i++){
                const key = this.movementAlertKeys[i];
                assert(DirectionEnum.keys.indexOf(key) >= 0, `unexpected key: ${key}. Keys should be the same as those in DirectionEnum`);
            }
        }
        // @private
        this.movementAlerts = options.movementAlerts;
        this.alertDiagonal = options.alertDiagonal;
        this.modelViewTransform = options.modelViewTransform;
        // @private
        // This sub-describer handles the logic for alerting when an item is on the edge of the movement space
        this.borderAlertsDescriber = new BorderAlertsDescriber(options.borderAlertsOptions);
        // @private {Utterance} - single utterance to describe direction changes so that when this
        // happens frequently only the last change is announced
        this.directionChangeUtterance = new Utterance({
            alert: new ResponsePacket()
        });
        // @private
        this.initialFirstPosition = positionProperty.get();
        // @protected
        this.positionProperty = positionProperty;
        this.lastAlertedPosition = this.initialFirstPosition; // initial value of the positionProperty
    }
};
sceneryPhet.register('MovementAlerter', MovementAlerter);
export default MovementAlerter;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2Rlc2NyaWJlcnMvTW92ZW1lbnRBbGVydGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgZ2VuZXJpYyBhbGVydGluZyB0eXBlIHRoYXQgd2lsbCBhbGVydCBwb3NpdGlvbmFsIGFsZXJ0cyBiYXNlZCBvbiBhIHBvc2l0aW9uUHJvcGVydHkgYW5kIGJvdW5kcyAoc2VlXG4gKiBCb3JkZXJBbGVydHNEZXNjcmliZXIpIGVuY2Fwc3VsYXRpbmcgdGhlIGRyYWdnYWJsZSBhcmVhLlxuICpcbiAqIFRoaXMgYWxlcnRlciBzdXBwb3J0cyByZXNwb25zZSB0byBkZXNjcmlwdGlvbiAoc2VlIG9wdGlvbnMuZGVzY3JpcHRpb25BbGVydE5vZGUpLCBhbmQgdm9pY2luZyAoc2VlIG9wdGlvbnMuYWxlcnRUb1ZvaWNpbmcpLlxuICpcbiAqIEdlbmVyYWwgdXNhZ2UgaW52b2x2ZXMgY2FsbGluZyB0aGlzIGVuZERyYWcoKSBmdW5jdGlvbiBmcm9tIGFsbCBkcmFnTGlzdGVuZXJzIHRoYXQgeW91IHdhbnQgdGhpcyBmdW5jdGlvbmFsaXR5IHRvIGRlc2NyaWJlXG4gKlxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcbmltcG9ydCBSZXNwb25zZVBhY2tldCBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvUmVzcG9uc2VQYWNrZXQuanMnO1xuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5pbXBvcnQgQWxlcnRlciBmcm9tICcuL0FsZXJ0ZXIuanMnO1xuaW1wb3J0IEJvcmRlckFsZXJ0c0Rlc2NyaWJlciBmcm9tICcuL0JvcmRlckFsZXJ0c0Rlc2NyaWJlci5qcyc7XG5pbXBvcnQgRGlyZWN0aW9uRW51bSBmcm9tICcuL0RpcmVjdGlvbkVudW0uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IGRvd25TdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tb3ZlbWVudEFsZXJ0ZXIuZG93bjtcbmNvbnN0IGxlZnRTdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tb3ZlbWVudEFsZXJ0ZXIubGVmdDtcbmNvbnN0IHJpZ2h0U3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkubW92ZW1lbnRBbGVydGVyLnJpZ2h0O1xuY29uc3QgdXBTdHJpbmcgPSBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tb3ZlbWVudEFsZXJ0ZXIudXA7XG5jb25zdCB1cEFuZFRvVGhlTGVmdFN0cmluZyA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1vdmVtZW50QWxlcnRlci51cEFuZFRvVGhlTGVmdDtcbmNvbnN0IHVwQW5kVG9UaGVSaWdodFN0cmluZyA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1vdmVtZW50QWxlcnRlci51cEFuZFRvVGhlUmlnaHQ7XG5jb25zdCBkb3duQW5kVG9UaGVMZWZ0U3RyaW5nID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkubW92ZW1lbnRBbGVydGVyLmRvd25BbmRUb1RoZUxlZnQ7XG5jb25zdCBkb3duQW5kVG9UaGVSaWdodFN0cmluZyA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1vdmVtZW50QWxlcnRlci5kb3duQW5kVG9UaGVSaWdodDtcblxuLy8gaW4gcmFkaWFucyAtIHRocmVzaG9sZCBmb3IgZGlhZ29uYWwgbW92ZW1lbnQgaXMgKy8tIDE1IGRlZ3JlZXMgZnJvbSBkaWFnb25hbHNcbmNvbnN0IERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCA9IDE1ICogTWF0aC5QSSAvIDE4MDtcblxuLy8gbWFwcGluZyBmcm9tIGFsZXJ0aW5nIGRpcmVjdGlvbiB0byB0aGUgcmFkaWFuIHJhbmdlIHRoYXQgZmlsbHMgdGhhdCBzcGFjZSBpbiB0aGUgdW5pdCBjaXJjbGUuXG4vL1xuLy8gJ1VQJyBpcyBpbiB0aGUgYm90dG9tIHR3byBxdWFkcmFudHMgYW5kICdET1dOJyBpcyBpbiB0aGUgdG9wIHR3byBxdWFkcmFudHMgYmVjYXVzZSB5IGluY3JlYXNlcyBkb3duIGZvciBzY2VuZXJ5LlxuLy9cbi8vIFRoZSBkaWFnb25hbCBkaXJlY3Rpb25zIHRha2UgdXAgdGhlIG1pZGRsZSB0aGlyZCBvZiBlYWNoIHF1YWRyYW50LCBzdWNoIHRoYXQgZWFjaCBcIm91dHNpZGVcIiB0aGlyZCBpcyBpbiB0aGUgcmFuZ2Vcbi8vIGZvciBhIHJlbGF0aXZlIChwcmltYXJ5KSBkaXJlY3Rpb24uIFRoZXJlZm9yZSBlYWNoIGRpYWdvbmFsIGRpcmVjdGlvbiBpcyAxLzkgb2YgdGhlIFVuaXQgY2lyY2xlLCBhbmQgZWFjaFxuLy8gcHJpbWFyeSBkaXJlY3Rpb24gaXMgMi85IG9mIHRoZSB1bml0IGNpcmNsZS5cbmNvbnN0IERJUkVDVElPTl9NQVAgPSB7XG4gIFVQOiBuZXcgUmFuZ2UoIC0zICogTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIC1NYXRoLlBJIC8gNCAtIERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCApLFxuICBET1dOOiBuZXcgUmFuZ2UoIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCAzICogTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcbiAgUklHSFQ6IG5ldyBSYW5nZSggLU1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCBNYXRoLlBJIC8gNCAtIERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCApLFxuXG4gIC8vIGF0YW4yIHdyYXBzIGFyb3VuZCBQSSwgc28gd2Ugd2lsbCB1c2UgYWJzb2x1dGUgdmFsdWUgaW4gY2hlY2tzXG4gIExFRlQ6IG5ldyBSYW5nZSggMyAqIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xELCBNYXRoLlBJICksXG5cbiAgVVBfTEVGVDogbmV3IFJhbmdlKCAtMyAqIE1hdGguUEkgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIC0zICogTWF0aC5QSSAvIDQgKyBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQgKSxcbiAgRE9XTl9MRUZUOiBuZXcgUmFuZ2UoIDMgKiBNYXRoLlBJIC8gNCAtIERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCwgMyAqIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEICksXG4gIFVQX1JJR0hUOiBuZXcgUmFuZ2UoIC1NYXRoLlBJIC8gNCAtIERJQUdPTkFMX01PVkVNRU5UX1RIUkVTSE9MRCwgLU1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEICksXG4gIERPV05fUklHSFQ6IG5ldyBSYW5nZSggTWF0aC5QSSAvIDQgLSBESUFHT05BTF9NT1ZFTUVOVF9USFJFU0hPTEQsIE1hdGguUEkgLyA0ICsgRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEIClcbn07XG5jb25zdCBESVJFQ1RJT05fTUFQX0tFWVMgPSBPYmplY3Qua2V5cyggRElSRUNUSU9OX01BUCApO1xuXG5pZiAoIGFzc2VydCApIHtcbiAgRElSRUNUSU9OX01BUF9LRVlTLmZvckVhY2goIGRpcmVjdGlvbiA9PiB7XG4gICAgYXNzZXJ0KCBEaXJlY3Rpb25FbnVtLmtleXMuaW5kZXhPZiggZGlyZWN0aW9uICkgPj0gMCwgYHVuZXhwZWN0ZWQgZGlyZWN0aW9uOiAke2RpcmVjdGlvbn0uIEtleXMgc2hvdWxkIGJlIHRoZSBzYW1lIGFzIHRob3NlIGluIERpcmVjdGlvbkVudW1gICk7XG4gIH0gKTtcbn1cblxuLy8gdGhlIHNldCBvZiBkaXJlY3Rpb25hbCBhbGVydHMgaW5jbHVkaW5nIGNhcmRpbmFsIGFuZCBpbnRlcmNhcmRpbmFsIGRpcmVjdGlvbnNcbmNvbnN0IERFRkFVTFRfTU9WRU1FTlRfREVTQ1JJUFRJT05TID0ge1xuICBMRUZUOiBsZWZ0U3RyaW5nLFxuICBSSUdIVDogcmlnaHRTdHJpbmcsXG4gIFVQOiB1cFN0cmluZyxcbiAgRE9XTjogZG93blN0cmluZyxcbiAgVVBfTEVGVDogdXBBbmRUb1RoZUxlZnRTdHJpbmcsXG4gIFVQX1JJR0hUOiB1cEFuZFRvVGhlUmlnaHRTdHJpbmcsXG4gIERPV05fTEVGVDogZG93bkFuZFRvVGhlTGVmdFN0cmluZyxcbiAgRE9XTl9SSUdIVDogZG93bkFuZFRvVGhlUmlnaHRTdHJpbmdcbn07XG5cbmNsYXNzIE1vdmVtZW50QWxlcnRlciBleHRlbmRzIEFsZXJ0ZXIge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxWZWN0b3IyPn0gcG9zaXRpb25Qcm9wZXJ0eSAtIFByb3BlcnR5IHRoYXQgZHJpdmVzIG1vdmVtZW50LCBpbiBtb2RlbCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBwb3NpdGlvblByb3BlcnR5LCBvcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG5cbiAgICAgIC8vIHNlZSBCb3JkZXJBbGVydHNEZXNjcmliZXJcbiAgICAgIGJvcmRlckFsZXJ0c09wdGlvbnM6IG51bGwsXG5cbiAgICAgIC8vIHtPYmplY3QuPERJUkVDVElPTiwgVEFsZXJ0YWJsZT4gc2VlIERpcmVjdGlvbkVudW0gZm9yIGFsbG93ZWQga2V5cy4gQW55IG1pc3Npbmcga2V5cyB3aWxsIG5vdCBiZSBhbGVydGVkLlxuICAgICAgLy8gVXNlIGB7fWAgdG8gb21pdCBtb3ZlbWVudEFsZXJ0cy5cbiAgICAgIG1vdmVtZW50QWxlcnRzOiBERUZBVUxUX01PVkVNRU5UX0RFU0NSSVBUSU9OUyxcblxuICAgICAgLy8ge01vZGVsVmlld1RyYW5zZm9ybTJ9IC0gaWYgcHJvdmlkZWQsIHRoaXMgd2lsbCB0cmFuc2Zvcm0gYmV0d2VlbiB0aGUgbW9kZWwgYW5kIHZpZXcgY29vcmRpbmF0ZSBmcmFtZXMsIHNvXG4gICAgICAvLyB0aGF0IG1vdmVtZW50IGluIHRoZSB2aWV3IGlzIGRlc2NyaWJlZFxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCksXG5cbiAgICAgIC8vIGlmIGZhbHNlIHRoZW4gZGlhZ29uYWwgYWxlcnRzIHdpbGwgYmUgY29udmVydGVkIHRvIHR3byBwcmltYXJ5IGRpcmVjdGlvbiBhbGVydHMgdGhhdCBhcmUgYWxlcnRlZCBiYWNrIHRvIGJhY2tcbiAgICAgIC8vIGkuZS4gVVBfTEVGVCBiZWNvbWVzIFwiVVBcIiBhbmQgXCJMRUZUXCJcbiAgICAgIGFsZXJ0RGlhZ29uYWw6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tb3ZlbWVudEFsZXJ0cyBpbnN0YW5jZW9mIE9iamVjdCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFBcnJheS5pc0FycmF5KCBvcHRpb25zLm1vdmVtZW50QWxlcnRzICkgKTsgLy8gc2hvdWxkIG5vdCBiZSBhbiBBcnJheVxuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlXG4gICAgdGhpcy5tb3ZlbWVudEFsZXJ0S2V5cyA9IE9iamVjdC5rZXlzKCBvcHRpb25zLm1vdmVtZW50QWxlcnRzICk7XG4gICAgaWYgKCBhc3NlcnQgKSB7XG5cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubW92ZW1lbnRBbGVydEtleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMubW92ZW1lbnRBbGVydEtleXNbIGkgXTtcbiAgICAgICAgYXNzZXJ0KCBEaXJlY3Rpb25FbnVtLmtleXMuaW5kZXhPZigga2V5ICkgPj0gMCwgYHVuZXhwZWN0ZWQga2V5OiAke2tleX0uIEtleXMgc2hvdWxkIGJlIHRoZSBzYW1lIGFzIHRob3NlIGluIERpcmVjdGlvbkVudW1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQHByaXZhdGVcbiAgICB0aGlzLm1vdmVtZW50QWxlcnRzID0gb3B0aW9ucy5tb3ZlbWVudEFsZXJ0cztcbiAgICB0aGlzLmFsZXJ0RGlhZ29uYWwgPSBvcHRpb25zLmFsZXJ0RGlhZ29uYWw7XG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybTtcblxuICAgIC8vIEBwcml2YXRlXG4gICAgLy8gVGhpcyBzdWItZGVzY3JpYmVyIGhhbmRsZXMgdGhlIGxvZ2ljIGZvciBhbGVydGluZyB3aGVuIGFuIGl0ZW0gaXMgb24gdGhlIGVkZ2Ugb2YgdGhlIG1vdmVtZW50IHNwYWNlXG4gICAgdGhpcy5ib3JkZXJBbGVydHNEZXNjcmliZXIgPSBuZXcgQm9yZGVyQWxlcnRzRGVzY3JpYmVyKCBvcHRpb25zLmJvcmRlckFsZXJ0c09wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtVdHRlcmFuY2V9IC0gc2luZ2xlIHV0dGVyYW5jZSB0byBkZXNjcmliZSBkaXJlY3Rpb24gY2hhbmdlcyBzbyB0aGF0IHdoZW4gdGhpc1xuICAgIC8vIGhhcHBlbnMgZnJlcXVlbnRseSBvbmx5IHRoZSBsYXN0IGNoYW5nZSBpcyBhbm5vdW5jZWRcbiAgICB0aGlzLmRpcmVjdGlvbkNoYW5nZVV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoIHtcbiAgICAgIGFsZXJ0OiBuZXcgUmVzcG9uc2VQYWNrZXQoKVxuICAgIH0gKTtcblxuICAgIC8vIEBwcml2YXRlXG4gICAgdGhpcy5pbml0aWFsRmlyc3RQb3NpdGlvbiA9IHBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XG5cbiAgICAvLyBAcHJvdGVjdGVkXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gcG9zaXRpb25Qcm9wZXJ0eTtcbiAgICB0aGlzLmxhc3RBbGVydGVkUG9zaXRpb24gPSB0aGlzLmluaXRpYWxGaXJzdFBvc2l0aW9uOyAvLyBpbml0aWFsIHZhbHVlIG9mIHRoZSBwb3NpdGlvblByb3BlcnR5XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgdG8ga2VlcCB0cmFjayBvZiBwb3NpdGlvbmluZyBiZXR3ZWVuIGFsZXJ0c1xuICAgKiBAcHVibGljXG4gICAqIEBvdmVycmlkZVxuICAgKlxuICAgKiBAcGFyYW0ge1RBbGVydGFibGV9IGFsZXJ0YWJsZSAtIGFueXRoaW5nIHRoYXQgY2FuIGJlIHBhc3NlZCB0byBVdHRlcmFuY2VRdWV1ZVxuICAgKi9cbiAgYWxlcnQoIGFsZXJ0YWJsZSApIHtcbiAgICBzdXBlci5hbGVydCggYWxlcnRhYmxlICk7XG4gICAgdGhpcy5sYXN0QWxlcnRlZFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiBiZSBjYWxsZWQgd2l0aCBtdWx0aXBsZSBkaXJlY3Rpb25zLCBvciBqdXN0IGEgc2luZ2xlIGRpcmVjdGlvblxuICAgKiBAcHJvdGVjdGVkXG4gICAqIEBwYXJhbSB7QXJyYXkuPERpcmVjdGlvbkVudW0+fERpcmVjdGlvbkVudW19IGRpcmVjdGlvbnNcbiAgICovXG4gIGFsZXJ0RGlyZWN0aW9ucyggZGlyZWN0aW9ucyApIHtcbiAgICBpZiAoIERpcmVjdGlvbkVudW0uaW5jbHVkZXMoIGRpcmVjdGlvbnMgKSApIHtcbiAgICAgIGRpcmVjdGlvbnMgPSBbIGRpcmVjdGlvbnMgXTtcbiAgICB9XG5cbiAgICAvLyBzdXBwb3J0IGlmIGFuIGluc3RhbmNlIGRvZXNuJ3Qgd2FudCB0byBhbGVydCBpbiBhbGwgZGlyZWN0aW9uc1xuICAgIGRpcmVjdGlvbnMuZm9yRWFjaCggZGlyZWN0aW9uID0+IHtcbiAgICAgIHRoaXMuZGlyZWN0aW9uQ2hhbmdlVXR0ZXJhbmNlLmFsZXJ0Lm9iamVjdFJlc3BvbnNlID0gdGhpcy5tb3ZlbWVudEFsZXJ0c1sgZGlyZWN0aW9uIF07XG4gICAgICB0aGlzLmFsZXJ0KCB0aGlzLmRpcmVjdGlvbkNoYW5nZVV0dGVyYW5jZSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGVydCBhIG1vdmVtZW50IGRpcmVjdGlvbi4gVGhlIGRpcmVjdGlvbiBmcm9tIHRoaXMubGFzdEFsZXJ0ZWRQb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgcG9zaXRpb25Qcm9wZXJ0eVxuICAgKiBDYWxsIHRoaXMgZnJvbSBhIGxpc3RlbmVyIG9yIHdoZW4gdGhlIHBvc2l0aW9uUHJvcGVydHkgaGFzIGNoYW5nZWQgZW5vdWdoLlxuICAgKiBDYW4gYmUgb3ZlcnJpZGRlbi4gRWFzeSB0byBpbXBsZW1lbnQgbWV0aG9kIHdpdGggdGhlIGZvbGxvd2luZyBzY2hlbWE6XG4gICAqICgxKSBnZXQgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHBvc2l0aW9uIHByb3BlcnR5LCBhbmQgbWFrZSBzdXJlIGl0IGhhcyBjaGFuZ2VkIGVub3VnaCBmcm9tIHRoZSBsYXN0QWxlcnRlZFBvc2l0aW9uXG4gICAqICgyKSBnZXQgdGhlIGRpcmVjdGlvbnMgZnJvbSB0aGUgZGlmZmVyZW5jZSxcbiAgICogKDMpIGFsZXJ0IHRob3NlIGRpcmVjdGlvbnMgYnkgY2FsbGluZyB0aGlzLmFsZXJ0RGlyZWN0aW9ucyBvciB0aGlzLmFsZXJ0LFxuICAgKiBzZWUgZnJpY3Rpb24vdmlldy9kZXNjcmliZXJzL0Jvb2tNb3ZlbWVudEFsZXJ0ZXIuXG4gICAqXG4gICAqIE5PVEU6IGRvbid0IGNhbGwgVXR0ZXJhbmNlUXVldWUgZnJvbSB0aGUgc3VidHlwZSEhIVxuICAgKiBOT1RFOiBQaEVUIGExMXkgY29udmVudGlvbiBzdWdnZXN0cyB0aGF0IHRoaXMgc2hvdWxkIGJlIGNhbGxlZCBvbiBkcmFnIGVuZC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYWxlcnREaXJlY3Rpb25hbE1vdmVtZW50KCkge1xuXG4gICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XG4gICAgaWYgKCAhbmV3UG9zaXRpb24uZXF1YWxzKCB0aGlzLmxhc3RBbGVydGVkUG9zaXRpb24gKSApIHtcblxuICAgICAgY29uc3QgZGlyZWN0aW9ucyA9IHRoaXMuZ2V0RGlyZWN0aW9ucyggbmV3UG9zaXRpb24sIHRoaXMubGFzdEFsZXJ0ZWRQb3NpdGlvbiApO1xuXG4gICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGVzZSBhbGVydHMgZXhpc3RcbiAgICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgICBkaXJlY3Rpb25zLmZvckVhY2goIGRpcmVjdGlvbiA9PiB7IGFzc2VydCggdGhpcy5tb3ZlbWVudEFsZXJ0c1sgZGlyZWN0aW9uIF0gJiYgdHlwZW9mIHRoaXMubW92ZW1lbnRBbGVydHNbIGRpcmVjdGlvbiBdID09PSAnc3RyaW5nJyApOyB9ICk7XG4gICAgICB9XG4gICAgICB0aGlzLmFsZXJ0RGlyZWN0aW9ucyggZGlyZWN0aW9ucyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudCB0aGF0IHdvdWxkIHRha2UgeW91IGZyb20gcG9pbnQgQSB0byBwb2ludCBCLCByZXR1cm5pbmcgb25lIG9mIERpcmVjdGlvbkVudW0uXG4gICAqIFRoZXNlIGRpcmVjdGlvbnMgYXJlIGRlc2NyaWJlZCBhcyB0aGV5IGFwcGVhciB2aXN1YWxseSwgd2l0aCBwb3NpdGl2ZSB5IGdvaW5nIHVwLlxuICAgKlxuICAgKiBVc2VzIE1hdGguYXRhbjIsIHNvIHRoZSBhbmdsZSBpcyBtYXBwZWQgZnJvbSAwIHRvICsvLSBNYXRoLlBJLlxuICAgKlxuICAgKiBAcGFyYW0gIHtWZWN0b3IyfSBuZXdQb2ludCAtIGluIHRoZSBtb2RlbCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSAge1ZlY3RvcjJ9IG9sZFBvaW50IC0gaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogQHJldHVybnMge0FycmF5LjxEaXJlY3Rpb25FbnVtPn0gLSBjb250YWlucyBvbmUgb3IgdHdvIG9mIHRoZSB2YWx1ZXMgaW4gRGlyZWN0aW9uRW51bSwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgb3Igbm8geW91IGdldFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFnb25hbCBkaXJlY3Rpb25zIG9yIHRoZWlyIGNvbXBvc2l0ZS4gU2VlIG9wdGlvbnMuYWxlcnREaWFnb25hbCBmb3IgbW9yZSBpbmZvXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIGdldERpcmVjdGlvbnMoIG5ld1BvaW50LCBvbGRQb2ludCApIHtcblxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IE1vdmVtZW50QWxlcnRlci5nZXREaXJlY3Rpb25FbnVtZXJhYmxlKCBuZXdQb2ludCwgb2xkUG9pbnQsIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtICk7XG5cbiAgICAvLyBUaGlzIGluY2x1ZGVzIGNvbXBsZXggZGlyZWN0aW9ucyBsaWtlIFwiVVBfTEVGVFwiXG4gICAgaWYgKCB0aGlzLmFsZXJ0RGlhZ29uYWwgKSB7XG4gICAgICByZXR1cm4gWyBkaXJlY3Rpb24gXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gRGlyZWN0aW9uRW51bS5kaXJlY3Rpb25Ub1JlbGF0aXZlRGlyZWN0aW9ucyggZGlyZWN0aW9uICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBvbmUgb2YgRGlyZWN0aW9uRW51bSBmcm9tIGEgbmV3UG9pbnQgYW5kIGFuIG9sZFBvaW50IHRoYXQgd291bGQgZGVzY3JpYmUgdGhlIGRpcmVjdGlvbiBvZiBtb3ZlbWVudFxuICAgKiBmcm9tIHRoZSBvbGQgcG9pbnQgdG8gdGhlIG5ldyBwb2ludC4gVGhlc2UgZGlyZWN0aW9ucyBhcmUgZGVzY3JpYmVkIGFzIHRoZXkgd291bGQgYXBwZWFyIHZpc3VhbGx5LCB3aXRoXG4gICAqICt5IGdvaW5nIHVwLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IG5ld1BvaW50IC0gaW4gbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IG9sZFBvaW50IC0gaW4gbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxuICAgKiBAcmV0dXJucyB7RGlyZWN0aW9uRW51bX1cbiAgICovXG4gIHN0YXRpYyBnZXREaXJlY3Rpb25FbnVtZXJhYmxlKCBuZXdQb2ludCwgb2xkUG9pbnQsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcblxuICAgIC8vIHRvIHZpZXcgY29vcmRpbmF0ZXMgdG8gbW90aW9uIGluIHRoZSBzY3JlZW5cbiAgICBjb25zdCBuZXdWaWV3UG9pbnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3UG9pbnQgKTtcbiAgICBjb25zdCBvbGRWaWV3UG9pbnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggb2xkUG9pbnQgKTtcblxuICAgIGNvbnN0IGR4ID0gbmV3Vmlld1BvaW50LnggLSBvbGRWaWV3UG9pbnQueDtcbiAgICBjb25zdCBkeSA9IG5ld1ZpZXdQb2ludC55IC0gb2xkVmlld1BvaW50Lnk7XG4gICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKCBkeSwgZHggKTtcblxuICAgIHJldHVybiBNb3ZlbWVudEFsZXJ0ZXIuZ2V0RGlyZWN0aW9uRW51bWVyYWJsZUZyb21BbmdsZSggYW5nbGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9uZSBvZiBEaXJlY3Rpb25FbnVtIGZyb20gYSBwcm92aWRlZCBhbmdsZS5cbiAgICogQHB1YmxpY1xuICAgKiBcbiAgICogQHBhcmFtIGFuZ2xlXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cbiAgICogQHJldHVybnMge0RpcmVjdGlvbkVudW19XG4gICAqL1xuICBzdGF0aWMgZ2V0RGlyZWN0aW9uRW51bWVyYWJsZUZyb21BbmdsZSggYW5nbGUgKSB7XG4gICAgbGV0IGRpcmVjdGlvbjtcblxuICAgIC8vIGF0YW4yIHdyYXBzIGFyb3VuZCBNYXRoLlBJLCBzbyBzcGVjaWFsIGNoZWNrIGZvciBtb3ZpbmcgbGVmdCBmcm9tIGFic29sdXRlIHZhbHVlXG4gICAgaWYgKCBESVJFQ1RJT05fTUFQLkxFRlQuY29udGFpbnMoIE1hdGguYWJzKCBhbmdsZSApICkgKSB7XG4gICAgICBkaXJlY3Rpb24gPSBEaXJlY3Rpb25FbnVtLkxFRlQ7XG4gICAgfVxuXG4gICAgLy8gb3RoZXJ3aXNlLCBhbmdsZSB3aWxsIGJlIGluIG9uZSBvZiB0aGUgcmFuZ2VzIGluIERJUkVDVElPTl9NQVBcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBESVJFQ1RJT05fTUFQX0tFWVMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IERJUkVDVElPTl9NQVBbIERJUkVDVElPTl9NQVBfS0VZU1sgaSBdIF07XG4gICAgICBpZiAoIGVudHJ5LmNvbnRhaW5zKCBhbmdsZSApICkge1xuICAgICAgICBkaXJlY3Rpb24gPSBEaXJlY3Rpb25FbnVtWyBESVJFQ1RJT05fTUFQX0tFWVNbIGkgXSBdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGRlc2NyaXB0aW9uIG9mIGRpcmVjdGlvbiBmcm9tIHRoZSBwcm92aWRlZCBhbmdsZS4gVGhpcyB3aWxsIGRlc2NyaWJlIHRoZSBtb3Rpb24gYXMgaXQgYXBwZWFyc1xuICAgKiBvbiBzY3JlZW4uIFRoZSBhbmdsZSBzaG91bGQgZ28gZnJvbSAwIHRvIDJQSS4gQW5nbGVzIGluIHRoZSB0b3AgdHdvIHF1YWRyYW50cyBhcmUgZGVzY3JpYmVkIGFzIGdvaW5nICd1cCcuXG4gICAqIEFuZ2xlcyBpbiBib3R0b20gdHdvIHF1YWRyYW50cyBhcmUgZGVzY3JpYmVkIGFzIGdvaW5nICdkb3duJy4gQW5nbGVzIGluIHRoZSByaWdodCB0d28gcXVhZHJhbnRzIGFyZSBkZXNjcmliZWRcbiAgICogYXMgZ29pbmcgXCJyaWdodFwiLCBhbmQgYW5nbGVzIGluIHRoZSBsZWZ0IHR3byBxdWFkcmFudHMgYXJlIGRlc2NyaWJlZCBhcyBnb2luZyB0byB0aGUgbGVmdC5cbiAgICpcbiAgICogRm9yIG5vdywgdGhpcyB3aWxsIGFsd2F5cyBpbmNsdWRlIGRpYWdvbmFsIGFsZXJ0cy4gSW4gdGhlIGZ1dHVyZSB3ZSBjYW4gZXhjbHVkZSB0aGUgcHJpbWFyeSBpbnRlcmNhcmRpbmFsXG4gICAqIGRpcmVjdGlvbnMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gYW4gYW5nbGUgb2YgZGlyZWN0aW9uYWwgbW92ZW1lbnQgaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RhdGljIGdldERpcmVjdGlvbkRlc2NyaXB0aW9uRnJvbUFuZ2xlKCBhbmdsZSwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuXG4gICAgICAvLyBzZWUgY29uc3RydWN0b3Igb3B0aW9ucyBmb3IgZGVzY3JpcHRpb25cbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVJZGVudGl0eSgpXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgLy8gc3RhcnQgYW5kIGVuZCBwb3NpdGlvbnMgdG8gZGV0ZXJtaW5lIGFuZ2xlIGluIHZpZXcgY29vcmRpbmF0ZSBmcmFtZVxuICAgIGNvbnN0IG1vZGVsU3RhcnRQb2ludCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XG5cbiAgICAvLyB0cmltIG9mZiBwcmVjaXNpb24gZXJyb3Igd2hlbiB2ZXJ5IGNsb3NlIHRvIDAgb3IgMSBzbyB0aGF0IGNhcmRpbmFsIGRpcmVjdGlvbiBpcyBzdGlsbCBkZXNjcmliZWRcbiAgICAvLyB3aGVuIG9mZiBieSBhIG1pbnVzY3VsZSBhbW91bnRcbiAgICBjb25zdCBkeCA9IFV0aWxzLnRvRml4ZWROdW1iZXIoIE1hdGguY29zKCBhbmdsZSApLCA4ICk7XG4gICAgY29uc3QgZHkgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBNYXRoLnNpbiggYW5nbGUgKSwgOCApO1xuICAgIGNvbnN0IG1vZGVsRW5kUG9pbnQgPSBuZXcgVmVjdG9yMiggZHgsIGR5ICk7XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSBNb3ZlbWVudEFsZXJ0ZXIuZ2V0RGlyZWN0aW9uRW51bWVyYWJsZSggbW9kZWxFbmRQb2ludCwgbW9kZWxTdGFydFBvaW50LCBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybSApO1xuICAgIHJldHVybiBERUZBVUxUX01PVkVNRU5UX0RFU0NSSVBUSU9OU1sgZGlyZWN0aW9uIF07XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge3dpbmRvdy5FdmVudH0gW2RvbUV2ZW50XVxuICAgKi9cbiAgZW5kRHJhZyggZG9tRXZlbnQgKSB7XG5cbiAgICAvLyBiZXR0ZXIgdG8gaGF2ZSB0aGUgbW92ZW1lbnQgYWxlcnRzLCB0aGVuIHRoZSBhbGVydCBhYm91dCB0aGUgYm9yZGVyXG4gICAgdGhpcy5hbGVydERpcmVjdGlvbmFsTW92ZW1lbnQoKTtcbiAgICBjb25zdCBhbGVydCA9IHRoaXMuYm9yZGVyQWxlcnRzRGVzY3JpYmVyLmdldEFsZXJ0T25FbmREcmFnKCB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIGRvbUV2ZW50ICk7XG4gICAgYWxlcnQgJiYgdGhpcy5hbGVydCggYWxlcnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLmxhc3RBbGVydGVkUG9zaXRpb24gPSB0aGlzLmluaXRpYWxGaXJzdFBvc2l0aW9uO1xuXG4gICAgLy8gaWYgYW55IGFsZXJ0cyBhcmUgb2YgdHlwZSBVdHRlcmFuY2UsIHJlc2V0IHRoZW0uXG4gICAgdGhpcy5tb3ZlbWVudEFsZXJ0S2V5cy5mb3JFYWNoKCBkaXJlY3Rpb24gPT4ge1xuICAgICAgY29uc3QgYWxlcnQgPSB0aGlzLm1vdmVtZW50QWxlcnRzWyBkaXJlY3Rpb24gXTtcbiAgICAgIGFsZXJ0ICYmIGFsZXJ0LnJlc2V0ICYmIGFsZXJ0LnJlc2V0KCk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5ib3JkZXJBbGVydHNEZXNjcmliZXIucmVzZXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlZmF1bHQgbW92ZW1lbnQgZGVzY3JpcHRpb25zXG4gICAqIEByZXR1cm5zIHtPYmplY3QuPERpcmVjdGlvbkVudW0sIHN0cmluZz59fSAtIG5vdCBhbiBhY3R1YWwgRGlyZWN0aW9uRW51bSwgYnV0IHRoZSB0b1N0cmluZygpIG9mIGl0IChhcyBhIGtleSkuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0YXRpYyBnZXREZWZhdWx0TW92ZW1lbnREZXNjcmlwdGlvbnMoKSB7XG4gICAgcmV0dXJuIG1lcmdlKCB7fSwgREVGQVVMVF9NT1ZFTUVOVF9ERVNDUklQVElPTlMgKTsgLy8gY2xvbmVcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ01vdmVtZW50QWxlcnRlcicsIE1vdmVtZW50QWxlcnRlciApO1xuZXhwb3J0IGRlZmF1bHQgTW92ZW1lbnRBbGVydGVyOyJdLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsIm1lcmdlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc3BvbnNlUGFja2V0IiwiVXR0ZXJhbmNlIiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJBbGVydGVyIiwiQm9yZGVyQWxlcnRzRGVzY3JpYmVyIiwiRGlyZWN0aW9uRW51bSIsImRvd25TdHJpbmciLCJhMTF5IiwibW92ZW1lbnRBbGVydGVyIiwiZG93biIsImxlZnRTdHJpbmciLCJsZWZ0IiwicmlnaHRTdHJpbmciLCJyaWdodCIsInVwU3RyaW5nIiwidXAiLCJ1cEFuZFRvVGhlTGVmdFN0cmluZyIsInVwQW5kVG9UaGVMZWZ0IiwidXBBbmRUb1RoZVJpZ2h0U3RyaW5nIiwidXBBbmRUb1RoZVJpZ2h0IiwiZG93bkFuZFRvVGhlTGVmdFN0cmluZyIsImRvd25BbmRUb1RoZUxlZnQiLCJkb3duQW5kVG9UaGVSaWdodFN0cmluZyIsImRvd25BbmRUb1RoZVJpZ2h0IiwiRElBR09OQUxfTU9WRU1FTlRfVEhSRVNIT0xEIiwiTWF0aCIsIlBJIiwiRElSRUNUSU9OX01BUCIsIlVQIiwiRE9XTiIsIlJJR0hUIiwiTEVGVCIsIlVQX0xFRlQiLCJET1dOX0xFRlQiLCJVUF9SSUdIVCIsIkRPV05fUklHSFQiLCJESVJFQ1RJT05fTUFQX0tFWVMiLCJPYmplY3QiLCJrZXlzIiwiYXNzZXJ0IiwiZm9yRWFjaCIsImRpcmVjdGlvbiIsImluZGV4T2YiLCJERUZBVUxUX01PVkVNRU5UX0RFU0NSSVBUSU9OUyIsIk1vdmVtZW50QWxlcnRlciIsImFsZXJ0IiwiYWxlcnRhYmxlIiwibGFzdEFsZXJ0ZWRQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJhbGVydERpcmVjdGlvbnMiLCJkaXJlY3Rpb25zIiwiaW5jbHVkZXMiLCJkaXJlY3Rpb25DaGFuZ2VVdHRlcmFuY2UiLCJvYmplY3RSZXNwb25zZSIsIm1vdmVtZW50QWxlcnRzIiwiYWxlcnREaXJlY3Rpb25hbE1vdmVtZW50IiwibmV3UG9zaXRpb24iLCJlcXVhbHMiLCJnZXREaXJlY3Rpb25zIiwibmV3UG9pbnQiLCJvbGRQb2ludCIsImdldERpcmVjdGlvbkVudW1lcmFibGUiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJhbGVydERpYWdvbmFsIiwiZGlyZWN0aW9uVG9SZWxhdGl2ZURpcmVjdGlvbnMiLCJuZXdWaWV3UG9pbnQiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwib2xkVmlld1BvaW50IiwiZHgiLCJ4IiwiZHkiLCJ5IiwiYW5nbGUiLCJhdGFuMiIsImdldERpcmVjdGlvbkVudW1lcmFibGVGcm9tQW5nbGUiLCJjb250YWlucyIsImFicyIsImkiLCJsZW5ndGgiLCJlbnRyeSIsImdldERpcmVjdGlvbkRlc2NyaXB0aW9uRnJvbUFuZ2xlIiwib3B0aW9ucyIsImNyZWF0ZUlkZW50aXR5IiwibW9kZWxTdGFydFBvaW50IiwidG9GaXhlZE51bWJlciIsImNvcyIsInNpbiIsIm1vZGVsRW5kUG9pbnQiLCJlbmREcmFnIiwiZG9tRXZlbnQiLCJib3JkZXJBbGVydHNEZXNjcmliZXIiLCJnZXRBbGVydE9uRW5kRHJhZyIsInJlc2V0IiwiaW5pdGlhbEZpcnN0UG9zaXRpb24iLCJtb3ZlbWVudEFsZXJ0S2V5cyIsImdldERlZmF1bHRNb3ZlbWVudERlc2NyaXB0aW9ucyIsImNvbnN0cnVjdG9yIiwiYm9yZGVyQWxlcnRzT3B0aW9ucyIsIkFycmF5IiwiaXNBcnJheSIsImtleSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7OztDQVNDLEdBRUQs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