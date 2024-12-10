// Copyright 2018-2022, University of Colorado Boulder
/**
 * Possible directions for a freely draggable item; it can move up, down, left, right,
 * and along the diagonals of these orientations.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import { KeyboardUtils } from '../../../../scenery/js/imports.js';
import sceneryPhet from '../../sceneryPhet.js';
// It is important that the key and value are the same, so that either way you can access the values of the enum.
const DirectionEnum = EnumerationDeprecated.byKeys([
    'LEFT',
    'RIGHT',
    'UP',
    'DOWN',
    'UP_LEFT',
    'UP_RIGHT',
    'DOWN_LEFT',
    'DOWN_RIGHT'
], {
    beforeFreeze: (DirectionEnum)=>{
        /**
     * Returns true if direction is one of the primary relative directions "up", "down", "left", "right".
     *
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {boolean}
     */ DirectionEnum.isRelativeDirection = function(direction) {
            assert && assert(DirectionEnum.hasOwnProperty(direction));
            return direction === DirectionEnum.LEFT || direction === DirectionEnum.RIGHT || direction === DirectionEnum.UP || direction === DirectionEnum.DOWN;
        };
        /**
     * If the direction is a complex diagonal direction, break it up into its composite pieces
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {Array.<DirectionEnum>}
     */ DirectionEnum.directionToRelativeDirections = function(direction) {
            assert && assert(DirectionEnum.hasOwnProperty(direction));
            return direction === DirectionEnum.UP_LEFT ? [
                DirectionEnum.UP,
                DirectionEnum.LEFT
            ] : direction === DirectionEnum.UP_RIGHT ? [
                DirectionEnum.UP,
                DirectionEnum.RIGHT
            ] : direction === DirectionEnum.DOWN_LEFT ? [
                DirectionEnum.DOWN,
                DirectionEnum.LEFT
            ] : direction === DirectionEnum.DOWN_RIGHT ? [
                DirectionEnum.DOWN,
                DirectionEnum.RIGHT
            ] : [
                DirectionEnum[direction]
            ]; // primary relative direction, so return a single item in the array
        };
        /**
     * Convenience function if a horizontal direction
     * @param {DirectionEnum} direction - one of DirectionEnum
     * @returns {boolean}
     */ DirectionEnum.isHorizontalDirection = function(direction) {
            assert && assert(DirectionEnum.hasOwnProperty(direction));
            return direction === DirectionEnum.LEFT || direction === DirectionEnum.RIGHT;
        };
        /**
     * Support for converting a key to a direction. Arrow keys and WASD will return a primary relative direction.
     * Return null if unrecognized key is given.
     * @param {string} key
     * @returns {DirectionEnum|null}
     */ DirectionEnum.keyToDirection = function(key) {
            assert && assert(typeof key === 'string');
            if (key === KeyboardUtils.KEY_UP_ARROW || key === KeyboardUtils.KEY_W) {
                return DirectionEnum.UP;
            }
            if (key === KeyboardUtils.KEY_LEFT_ARROW || key === KeyboardUtils.KEY_A) {
                return DirectionEnum.LEFT;
            }
            if (key === KeyboardUtils.KEY_DOWN_ARROW || key === KeyboardUtils.KEY_S) {
                return DirectionEnum.DOWN;
            }
            if (key === KeyboardUtils.KEY_RIGHT_ARROW || key === KeyboardUtils.KEY_D) {
                return DirectionEnum.RIGHT;
            }
            return null;
        };
    }
});
sceneryPhet.register('DirectionEnum', DirectionEnum);
export default DirectionEnum;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2Rlc2NyaWJlcnMvRGlyZWN0aW9uRW51bS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQb3NzaWJsZSBkaXJlY3Rpb25zIGZvciBhIGZyZWVseSBkcmFnZ2FibGUgaXRlbTsgaXQgY2FuIG1vdmUgdXAsIGRvd24sIGxlZnQsIHJpZ2h0LFxuICogYW5kIGFsb25nIHRoZSBkaWFnb25hbHMgb2YgdGhlc2Ugb3JpZW50YXRpb25zLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XG5pbXBvcnQgeyBLZXlib2FyZFV0aWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIEl0IGlzIGltcG9ydGFudCB0aGF0IHRoZSBrZXkgYW5kIHZhbHVlIGFyZSB0aGUgc2FtZSwgc28gdGhhdCBlaXRoZXIgd2F5IHlvdSBjYW4gYWNjZXNzIHRoZSB2YWx1ZXMgb2YgdGhlIGVudW0uXG5jb25zdCBEaXJlY3Rpb25FbnVtID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggW1xuICAnTEVGVCcsXG4gICdSSUdIVCcsXG4gICdVUCcsXG4gICdET1dOJyxcbiAgJ1VQX0xFRlQnLFxuICAnVVBfUklHSFQnLFxuICAnRE9XTl9MRUZUJyxcbiAgJ0RPV05fUklHSFQnXG5dLCB7XG4gIGJlZm9yZUZyZWV6ZTogRGlyZWN0aW9uRW51bSA9PiB7XG4gICAgXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIGRpcmVjdGlvbiBpcyBvbmUgb2YgdGhlIHByaW1hcnkgcmVsYXRpdmUgZGlyZWN0aW9ucyBcInVwXCIsIFwiZG93blwiLCBcImxlZnRcIiwgXCJyaWdodFwiLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtEaXJlY3Rpb25FbnVtfSBkaXJlY3Rpb24gLSBvbmUgb2YgRGlyZWN0aW9uRW51bVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIERpcmVjdGlvbkVudW0uaXNSZWxhdGl2ZURpcmVjdGlvbiA9IGZ1bmN0aW9uKCBkaXJlY3Rpb24gKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBEaXJlY3Rpb25FbnVtLmhhc093blByb3BlcnR5KCBkaXJlY3Rpb24gKSApO1xuICAgICAgcmV0dXJuIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5MRUZUIHx8XG4gICAgICAgICAgICAgZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLlJJR0hUIHx8XG4gICAgICAgICAgICAgZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLlVQIHx8XG4gICAgICAgICAgICAgZGlyZWN0aW9uID09PSBEaXJlY3Rpb25FbnVtLkRPV047XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIElmIHRoZSBkaXJlY3Rpb24gaXMgYSBjb21wbGV4IGRpYWdvbmFsIGRpcmVjdGlvbiwgYnJlYWsgaXQgdXAgaW50byBpdHMgY29tcG9zaXRlIHBpZWNlc1xuICAgICAqIEBwYXJhbSB7RGlyZWN0aW9uRW51bX0gZGlyZWN0aW9uIC0gb25lIG9mIERpcmVjdGlvbkVudW1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPERpcmVjdGlvbkVudW0+fVxuICAgICAqL1xuICAgIERpcmVjdGlvbkVudW0uZGlyZWN0aW9uVG9SZWxhdGl2ZURpcmVjdGlvbnMgPSBmdW5jdGlvbiggZGlyZWN0aW9uICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggRGlyZWN0aW9uRW51bS5oYXNPd25Qcm9wZXJ0eSggZGlyZWN0aW9uICkgKTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uVVBfTEVGVCA/IFsgRGlyZWN0aW9uRW51bS5VUCwgRGlyZWN0aW9uRW51bS5MRUZUIF0gOlxuICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5VUF9SSUdIVCA/IFsgRGlyZWN0aW9uRW51bS5VUCwgRGlyZWN0aW9uRW51bS5SSUdIVCBdIDpcbiAgICAgICAgICAgICBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uRE9XTl9MRUZUID8gWyBEaXJlY3Rpb25FbnVtLkRPV04sIERpcmVjdGlvbkVudW0uTEVGVCBdIDpcbiAgICAgICAgICAgICBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uRE9XTl9SSUdIVCA/IFsgRGlyZWN0aW9uRW51bS5ET1dOLCBEaXJlY3Rpb25FbnVtLlJJR0hUIF0gOlxuICAgICAgICAgICAgICAgWyBEaXJlY3Rpb25FbnVtWyBkaXJlY3Rpb24gXSBdOyAvLyBwcmltYXJ5IHJlbGF0aXZlIGRpcmVjdGlvbiwgc28gcmV0dXJuIGEgc2luZ2xlIGl0ZW0gaW4gdGhlIGFycmF5XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlbmllbmNlIGZ1bmN0aW9uIGlmIGEgaG9yaXpvbnRhbCBkaXJlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0RpcmVjdGlvbkVudW19IGRpcmVjdGlvbiAtIG9uZSBvZiBEaXJlY3Rpb25FbnVtXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgRGlyZWN0aW9uRW51bS5pc0hvcml6b250YWxEaXJlY3Rpb24gPSBmdW5jdGlvbiggZGlyZWN0aW9uICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggRGlyZWN0aW9uRW51bS5oYXNPd25Qcm9wZXJ0eSggZGlyZWN0aW9uICkgKTtcbiAgICAgIHJldHVybiBkaXJlY3Rpb24gPT09IERpcmVjdGlvbkVudW0uTEVGVCB8fFxuICAgICAgICAgICAgIGRpcmVjdGlvbiA9PT0gRGlyZWN0aW9uRW51bS5SSUdIVDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3VwcG9ydCBmb3IgY29udmVydGluZyBhIGtleSB0byBhIGRpcmVjdGlvbi4gQXJyb3cga2V5cyBhbmQgV0FTRCB3aWxsIHJldHVybiBhIHByaW1hcnkgcmVsYXRpdmUgZGlyZWN0aW9uLlxuICAgICAqIFJldHVybiBudWxsIGlmIHVucmVjb2duaXplZCBrZXkgaXMgZ2l2ZW4uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEByZXR1cm5zIHtEaXJlY3Rpb25FbnVtfG51bGx9XG4gICAgICovXG4gICAgRGlyZWN0aW9uRW51bS5rZXlUb0RpcmVjdGlvbiA9IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyApO1xuXG4gICAgICBpZiAoIGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1cgfHwga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9XICkge1xuICAgICAgICByZXR1cm4gRGlyZWN0aW9uRW51bS5VUDtcbiAgICAgIH1cbiAgICAgIGlmICgga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9MRUZUX0FSUk9XIHx8IGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfQSApIHtcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbkVudW0uTEVGVDtcbiAgICAgIH1cbiAgICAgIGlmICgga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9ET1dOX0FSUk9XIHx8IGtleSA9PT0gS2V5Ym9hcmRVdGlscy5LRVlfUyApIHtcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbkVudW0uRE9XTjtcbiAgICAgIH1cbiAgICAgIGlmICgga2V5ID09PSBLZXlib2FyZFV0aWxzLktFWV9SSUdIVF9BUlJPVyB8fCBrZXkgPT09IEtleWJvYXJkVXRpbHMuS0VZX0QgKSB7XG4gICAgICAgIHJldHVybiBEaXJlY3Rpb25FbnVtLlJJR0hUO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgfVxufSApO1xuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0RpcmVjdGlvbkVudW0nLCBEaXJlY3Rpb25FbnVtICk7XG5cbmV4cG9ydCBkZWZhdWx0IERpcmVjdGlvbkVudW07Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIktleWJvYXJkVXRpbHMiLCJzY2VuZXJ5UGhldCIsIkRpcmVjdGlvbkVudW0iLCJieUtleXMiLCJiZWZvcmVGcmVlemUiLCJpc1JlbGF0aXZlRGlyZWN0aW9uIiwiZGlyZWN0aW9uIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJMRUZUIiwiUklHSFQiLCJVUCIsIkRPV04iLCJkaXJlY3Rpb25Ub1JlbGF0aXZlRGlyZWN0aW9ucyIsIlVQX0xFRlQiLCJVUF9SSUdIVCIsIkRPV05fTEVGVCIsIkRPV05fUklHSFQiLCJpc0hvcml6b250YWxEaXJlY3Rpb24iLCJrZXlUb0RpcmVjdGlvbiIsImtleSIsIktFWV9VUF9BUlJPVyIsIktFWV9XIiwiS0VZX0xFRlRfQVJST1ciLCJLRVlfQSIsIktFWV9ET1dOX0FSUk9XIiwiS0VZX1MiLCJLRVlfUklHSFRfQVJST1ciLCJLRVlfRCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsMkJBQTJCLG9EQUFvRDtBQUN0RixTQUFTQyxhQUFhLFFBQVEsb0NBQW9DO0FBQ2xFLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFFL0MsaUhBQWlIO0FBQ2pILE1BQU1DLGdCQUFnQkgsc0JBQXNCSSxNQUFNLENBQUU7SUFDbEQ7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNELEVBQUU7SUFDREMsY0FBY0YsQ0FBQUE7UUFFWjs7Ozs7S0FLQyxHQUNEQSxjQUFjRyxtQkFBbUIsR0FBRyxTQUFVQyxTQUFTO1lBQ3JEQyxVQUFVQSxPQUFRTCxjQUFjTSxjQUFjLENBQUVGO1lBQ2hELE9BQU9BLGNBQWNKLGNBQWNPLElBQUksSUFDaENILGNBQWNKLGNBQWNRLEtBQUssSUFDakNKLGNBQWNKLGNBQWNTLEVBQUUsSUFDOUJMLGNBQWNKLGNBQWNVLElBQUk7UUFDekM7UUFFQTs7OztLQUlDLEdBQ0RWLGNBQWNXLDZCQUE2QixHQUFHLFNBQVVQLFNBQVM7WUFDL0RDLFVBQVVBLE9BQVFMLGNBQWNNLGNBQWMsQ0FBRUY7WUFDaEQsT0FBT0EsY0FBY0osY0FBY1ksT0FBTyxHQUFHO2dCQUFFWixjQUFjUyxFQUFFO2dCQUFFVCxjQUFjTyxJQUFJO2FBQUUsR0FDOUVILGNBQWNKLGNBQWNhLFFBQVEsR0FBRztnQkFBRWIsY0FBY1MsRUFBRTtnQkFBRVQsY0FBY1EsS0FBSzthQUFFLEdBQ2hGSixjQUFjSixjQUFjYyxTQUFTLEdBQUc7Z0JBQUVkLGNBQWNVLElBQUk7Z0JBQUVWLGNBQWNPLElBQUk7YUFBRSxHQUNsRkgsY0FBY0osY0FBY2UsVUFBVSxHQUFHO2dCQUFFZixjQUFjVSxJQUFJO2dCQUFFVixjQUFjUSxLQUFLO2FBQUUsR0FDbEY7Z0JBQUVSLGFBQWEsQ0FBRUksVUFBVzthQUFFLEVBQUUsbUVBQW1FO1FBQzlHO1FBRUE7Ozs7S0FJQyxHQUNESixjQUFjZ0IscUJBQXFCLEdBQUcsU0FBVVosU0FBUztZQUN2REMsVUFBVUEsT0FBUUwsY0FBY00sY0FBYyxDQUFFRjtZQUNoRCxPQUFPQSxjQUFjSixjQUFjTyxJQUFJLElBQ2hDSCxjQUFjSixjQUFjUSxLQUFLO1FBQzFDO1FBRUE7Ozs7O0tBS0MsR0FDRFIsY0FBY2lCLGNBQWMsR0FBRyxTQUFVQyxHQUFHO1lBQzFDYixVQUFVQSxPQUFRLE9BQU9hLFFBQVE7WUFFakMsSUFBS0EsUUFBUXBCLGNBQWNxQixZQUFZLElBQUlELFFBQVFwQixjQUFjc0IsS0FBSyxFQUFHO2dCQUN2RSxPQUFPcEIsY0FBY1MsRUFBRTtZQUN6QjtZQUNBLElBQUtTLFFBQVFwQixjQUFjdUIsY0FBYyxJQUFJSCxRQUFRcEIsY0FBY3dCLEtBQUssRUFBRztnQkFDekUsT0FBT3RCLGNBQWNPLElBQUk7WUFDM0I7WUFDQSxJQUFLVyxRQUFRcEIsY0FBY3lCLGNBQWMsSUFBSUwsUUFBUXBCLGNBQWMwQixLQUFLLEVBQUc7Z0JBQ3pFLE9BQU94QixjQUFjVSxJQUFJO1lBQzNCO1lBQ0EsSUFBS1EsUUFBUXBCLGNBQWMyQixlQUFlLElBQUlQLFFBQVFwQixjQUFjNEIsS0FBSyxFQUFHO2dCQUMxRSxPQUFPMUIsY0FBY1EsS0FBSztZQUM1QjtZQUNBLE9BQU87UUFDVDtJQUNGO0FBQ0Y7QUFFQVQsWUFBWTRCLFFBQVEsQ0FBRSxpQkFBaUIzQjtBQUV2QyxlQUFlQSxjQUFjIn0=