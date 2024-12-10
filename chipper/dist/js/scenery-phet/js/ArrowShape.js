// Copyright 2013-2022, University of Colorado Boulder
/**
 * An arrow shape, either single or double headed.
 * ArrowShape has an optimization that allows you to reuse an array of Vector2.
 * The array will have 0 points if the tail and tip are the same point.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Aaron Davis
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import sceneryPhet from './sceneryPhet.js';
let ArrowShape = class ArrowShape extends Shape {
    /**
   * This method is static so it can be used in ArrowShape as well as in ArrowNode.  If the tail and tip are at the
   * same position, there are no points and the arrow will not be shown.
   * @param tailX
   * @param tailY
   * @param tipX
   * @param tipY
   * @param shapePoints - if provided, values will be overwritten. This is to achieve high performance and is used
   *   by ArrowNode to avoid re-creating shapes. Tested this implementation vs the old one by creating hundreds of
   *   arrows and saw significant performance gains.
   * @param providedOptions
   */ static getArrowShapePoints(tailX, tailY, tipX, tipY, shapePoints, providedOptions) {
        const options = optionize()({
            // ArrowShapeOptions
            tailWidth: 5,
            headWidth: 10,
            headHeight: 10,
            fractionalHeadHeight: 0.5,
            doubleHead: false,
            isHeadDynamic: false,
            scaleTailToo: false
        }, providedOptions);
        // default shapePoints to empty array if it isn't passed in
        if (!shapePoints) {
            shapePoints = [];
        }
        if (tipX === tailX && tipY === tailY) {
            // if arrow has no length, it should have no points so that we don't attempt to draw anything
            shapePoints.length = 0;
        } else {
            // create a vector representation of the arrow
            const vector = new Vector2(tipX - tailX, tipY - tailY);
            const length = vector.magnitude;
            // start with the dimensions specified in options
            let headWidth = options.headWidth;
            let headHeight = options.headHeight;
            let tailWidth = options.tailWidth;
            // handle scaling of the head and tail
            if (options.isHeadDynamic) {
                const maxHeadHeight = options.fractionalHeadHeight * length;
                // scale down the head height if it exceeds the max
                if (options.headHeight > maxHeadHeight) {
                    headHeight = maxHeadHeight;
                    // optionally scale down the head width and tail width
                    if (options.scaleTailToo) {
                        headWidth = options.headWidth * headHeight / options.headHeight;
                        tailWidth = options.tailWidth * headHeight / options.headHeight;
                    }
                }
            } else {
                // otherwise, just make sure that head height is less than arrow length
                headHeight = Math.min(options.headHeight, options.doubleHead ? 0.35 * length : 0.99 * length);
            }
            // Index into shapePoints, incremented each time addPoint is called.
            let index = 0;
            // Set up a coordinate frame that goes from the tail of the arrow to the tip.
            const xHatUnit = vector.normalized();
            const yHatUnit = xHatUnit.rotated(Math.PI / 2);
            // Function to add a point to shapePoints
            const addPoint = function(xHat, yHat) {
                const x = xHatUnit.x * xHat + yHatUnit.x * yHat + tailX;
                const y = xHatUnit.y * xHat + yHatUnit.y * yHat + tailY;
                if (shapePoints[index]) {
                    shapePoints[index].x = x;
                    shapePoints[index].y = y;
                } else {
                    shapePoints.push(new Vector2(x, y));
                }
                index++;
            };
            // Compute points for single- or double-headed arrow
            if (options.doubleHead) {
                addPoint(0, 0);
                addPoint(headHeight, headWidth / 2);
                addPoint(headHeight, tailWidth / 2);
            } else {
                addPoint(0, tailWidth / 2);
            }
            addPoint(length - headHeight, tailWidth / 2);
            addPoint(length - headHeight, headWidth / 2);
            addPoint(length, 0);
            addPoint(length - headHeight, -headWidth / 2);
            addPoint(length - headHeight, -tailWidth / 2);
            if (options.doubleHead) {
                addPoint(headHeight, -tailWidth / 2);
                addPoint(headHeight, -headWidth / 2);
            } else {
                addPoint(0, -tailWidth / 2);
            }
            if (index < shapePoints.length) {
                shapePoints.length = index;
            }
        }
        return shapePoints;
    }
    constructor(tailX, tailY, tipX, tipY, providedOptions){
        super();
        if (tipX !== tailX || tipY !== tailY) {
            const points = ArrowShape.getArrowShapePoints(tailX, tailY, tipX, tipY, [], providedOptions);
            // Describe the shape
            this.moveTo(points[0].x, points[0].y);
            const tail = _.tail(points);
            _.each(tail, (point)=>this.lineTo(point.x, point.y));
            this.close();
        }
    }
};
export { ArrowShape as default };
sceneryPhet.register('ArrowShape', ArrowShape);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd1NoYXBlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFuIGFycm93IHNoYXBlLCBlaXRoZXIgc2luZ2xlIG9yIGRvdWJsZSBoZWFkZWQuXG4gKiBBcnJvd1NoYXBlIGhhcyBhbiBvcHRpbWl6YXRpb24gdGhhdCBhbGxvd3MgeW91IHRvIHJldXNlIGFuIGFycmF5IG9mIFZlY3RvcjIuXG4gKiBUaGUgYXJyYXkgd2lsbCBoYXZlIDAgcG9pbnRzIGlmIHRoZSB0YWlsIGFuZCB0aXAgYXJlIHRoZSBzYW1lIHBvaW50LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbmV4cG9ydCB0eXBlIEFycm93U2hhcGVPcHRpb25zID0ge1xuICB0YWlsV2lkdGg/OiBudW1iZXI7XG4gIGhlYWRXaWR0aD86IG51bWJlcjtcbiAgaGVhZEhlaWdodD86IG51bWJlcjtcbiAgZnJhY3Rpb25hbEhlYWRIZWlnaHQ/OiBudW1iZXI7IC8vIGhlYWQgd2lsbCBiZSBzY2FsZWQgd2hlbiBoZWFkSGVpZ2h0IGlzIGdyZWF0ZXIgdGhhbiBmcmFjdGlvbmFsSGVhZEhlaWdodCAqIGFycm93IGxlbmd0aFxuICBkb3VibGVIZWFkPzogYm9vbGVhbjsgLy8gZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBhcnJvdyBoYXMgYSBoZWFkIGF0IGJvdGggZW5kcyBvZiB0aGUgdGFpbFxuICBpc0hlYWREeW5hbWljPzogYm9vbGVhbjsgLy8gZGV0ZXJtaW5lcyB3aGV0aGVyIHRvIHNjYWxlIGRvd24gdGhlIGFycm93IGhlYWQgaGVpZ2h0IGZvciBmcmFjdGlvbmFsSGVhZEhlaWdodCBjb25zdHJhaW50XG4gIHNjYWxlVGFpbFRvbz86IGJvb2xlYW47ICAvLyBkZXRlcm1pbmVzIHdoZXRoZXIgdG8gYWxzbyBzY2FsZSBhcnJvdyBoZWFkIHdpZHRoIGFuZCB0YWlsIHdpZHRoIHdoZW4gc2NhbGluZyBoZWFkIGhlaWdodFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJyb3dTaGFwZSBleHRlbmRzIFNoYXBlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhaWxYOiBudW1iZXIsIHRhaWxZOiBudW1iZXIsIHRpcFg6IG51bWJlciwgdGlwWTogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM6IEFycm93U2hhcGVPcHRpb25zICkge1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGlmICggdGlwWCAhPT0gdGFpbFggfHwgdGlwWSAhPT0gdGFpbFkgKSB7XG5cbiAgICAgIGNvbnN0IHBvaW50cyA9IEFycm93U2hhcGUuZ2V0QXJyb3dTaGFwZVBvaW50cyggdGFpbFgsIHRhaWxZLCB0aXBYLCB0aXBZLCBbXSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAgIC8vIERlc2NyaWJlIHRoZSBzaGFwZVxuICAgICAgdGhpcy5tb3ZlVG8oIHBvaW50c1sgMCBdLngsIHBvaW50c1sgMCBdLnkgKTtcbiAgICAgIGNvbnN0IHRhaWwgPSBfLnRhaWwoIHBvaW50cyApO1xuICAgICAgXy5lYWNoKCB0YWlsLCAoIHBvaW50OiBWZWN0b3IyICkgPT4gdGhpcy5saW5lVG8oIHBvaW50LngsIHBvaW50LnkgKSApO1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBzdGF0aWMgc28gaXQgY2FuIGJlIHVzZWQgaW4gQXJyb3dTaGFwZSBhcyB3ZWxsIGFzIGluIEFycm93Tm9kZS4gIElmIHRoZSB0YWlsIGFuZCB0aXAgYXJlIGF0IHRoZVxuICAgKiBzYW1lIHBvc2l0aW9uLCB0aGVyZSBhcmUgbm8gcG9pbnRzIGFuZCB0aGUgYXJyb3cgd2lsbCBub3QgYmUgc2hvd24uXG4gICAqIEBwYXJhbSB0YWlsWFxuICAgKiBAcGFyYW0gdGFpbFlcbiAgICogQHBhcmFtIHRpcFhcbiAgICogQHBhcmFtIHRpcFlcbiAgICogQHBhcmFtIHNoYXBlUG9pbnRzIC0gaWYgcHJvdmlkZWQsIHZhbHVlcyB3aWxsIGJlIG92ZXJ3cml0dGVuLiBUaGlzIGlzIHRvIGFjaGlldmUgaGlnaCBwZXJmb3JtYW5jZSBhbmQgaXMgdXNlZFxuICAgKiAgIGJ5IEFycm93Tm9kZSB0byBhdm9pZCByZS1jcmVhdGluZyBzaGFwZXMuIFRlc3RlZCB0aGlzIGltcGxlbWVudGF0aW9uIHZzIHRoZSBvbGQgb25lIGJ5IGNyZWF0aW5nIGh1bmRyZWRzIG9mXG4gICAqICAgYXJyb3dzIGFuZCBzYXcgc2lnbmlmaWNhbnQgcGVyZm9ybWFuY2UgZ2FpbnMuXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0QXJyb3dTaGFwZVBvaW50cyggdGFpbFg6IG51bWJlciwgdGFpbFk6IG51bWJlciwgdGlwWDogbnVtYmVyLCB0aXBZOiBudW1iZXIsIHNoYXBlUG9pbnRzOiBWZWN0b3IyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQXJyb3dTaGFwZU9wdGlvbnMgKTogVmVjdG9yMltdIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QXJyb3dTaGFwZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gQXJyb3dTaGFwZU9wdGlvbnNcbiAgICAgIHRhaWxXaWR0aDogNSxcbiAgICAgIGhlYWRXaWR0aDogMTAsXG4gICAgICBoZWFkSGVpZ2h0OiAxMCxcbiAgICAgIGZyYWN0aW9uYWxIZWFkSGVpZ2h0OiAwLjUsXG4gICAgICBkb3VibGVIZWFkOiBmYWxzZSxcbiAgICAgIGlzSGVhZER5bmFtaWM6IGZhbHNlLFxuICAgICAgc2NhbGVUYWlsVG9vOiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gZGVmYXVsdCBzaGFwZVBvaW50cyB0byBlbXB0eSBhcnJheSBpZiBpdCBpc24ndCBwYXNzZWQgaW5cbiAgICBpZiAoICFzaGFwZVBvaW50cyApIHtcbiAgICAgIHNoYXBlUG9pbnRzID0gW107XG4gICAgfVxuXG4gICAgaWYgKCB0aXBYID09PSB0YWlsWCAmJiB0aXBZID09PSB0YWlsWSApIHtcblxuICAgICAgLy8gaWYgYXJyb3cgaGFzIG5vIGxlbmd0aCwgaXQgc2hvdWxkIGhhdmUgbm8gcG9pbnRzIHNvIHRoYXQgd2UgZG9uJ3QgYXR0ZW1wdCB0byBkcmF3IGFueXRoaW5nXG4gICAgICBzaGFwZVBvaW50cy5sZW5ndGggPSAwO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gY3JlYXRlIGEgdmVjdG9yIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhcnJvd1xuICAgICAgY29uc3QgdmVjdG9yID0gbmV3IFZlY3RvcjIoIHRpcFggLSB0YWlsWCwgdGlwWSAtIHRhaWxZICk7XG4gICAgICBjb25zdCBsZW5ndGggPSB2ZWN0b3IubWFnbml0dWRlO1xuXG4gICAgICAvLyBzdGFydCB3aXRoIHRoZSBkaW1lbnNpb25zIHNwZWNpZmllZCBpbiBvcHRpb25zXG4gICAgICBsZXQgaGVhZFdpZHRoID0gb3B0aW9ucy5oZWFkV2lkdGg7XG4gICAgICBsZXQgaGVhZEhlaWdodCA9IG9wdGlvbnMuaGVhZEhlaWdodDtcbiAgICAgIGxldCB0YWlsV2lkdGggPSBvcHRpb25zLnRhaWxXaWR0aDtcblxuICAgICAgLy8gaGFuZGxlIHNjYWxpbmcgb2YgdGhlIGhlYWQgYW5kIHRhaWxcbiAgICAgIGlmICggb3B0aW9ucy5pc0hlYWREeW5hbWljICkge1xuXG4gICAgICAgIGNvbnN0IG1heEhlYWRIZWlnaHQgPSBvcHRpb25zLmZyYWN0aW9uYWxIZWFkSGVpZ2h0ICogbGVuZ3RoO1xuXG4gICAgICAgIC8vIHNjYWxlIGRvd24gdGhlIGhlYWQgaGVpZ2h0IGlmIGl0IGV4Y2VlZHMgdGhlIG1heFxuICAgICAgICBpZiAoIG9wdGlvbnMuaGVhZEhlaWdodCA+IG1heEhlYWRIZWlnaHQgKSB7XG4gICAgICAgICAgaGVhZEhlaWdodCA9IG1heEhlYWRIZWlnaHQ7XG5cbiAgICAgICAgICAvLyBvcHRpb25hbGx5IHNjYWxlIGRvd24gdGhlIGhlYWQgd2lkdGggYW5kIHRhaWwgd2lkdGhcbiAgICAgICAgICBpZiAoIG9wdGlvbnMuc2NhbGVUYWlsVG9vICkge1xuICAgICAgICAgICAgaGVhZFdpZHRoID0gb3B0aW9ucy5oZWFkV2lkdGggKiBoZWFkSGVpZ2h0IC8gb3B0aW9ucy5oZWFkSGVpZ2h0O1xuICAgICAgICAgICAgdGFpbFdpZHRoID0gb3B0aW9ucy50YWlsV2lkdGggKiBoZWFkSGVpZ2h0IC8gb3B0aW9ucy5oZWFkSGVpZ2h0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gb3RoZXJ3aXNlLCBqdXN0IG1ha2Ugc3VyZSB0aGF0IGhlYWQgaGVpZ2h0IGlzIGxlc3MgdGhhbiBhcnJvdyBsZW5ndGhcbiAgICAgICAgaGVhZEhlaWdodCA9IE1hdGgubWluKCBvcHRpb25zLmhlYWRIZWlnaHQsIG9wdGlvbnMuZG91YmxlSGVhZCA/IDAuMzUgKiBsZW5ndGggOiAwLjk5ICogbGVuZ3RoICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluZGV4IGludG8gc2hhcGVQb2ludHMsIGluY3JlbWVudGVkIGVhY2ggdGltZSBhZGRQb2ludCBpcyBjYWxsZWQuXG4gICAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgICAvLyBTZXQgdXAgYSBjb29yZGluYXRlIGZyYW1lIHRoYXQgZ29lcyBmcm9tIHRoZSB0YWlsIG9mIHRoZSBhcnJvdyB0byB0aGUgdGlwLlxuICAgICAgY29uc3QgeEhhdFVuaXQgPSB2ZWN0b3Iubm9ybWFsaXplZCgpO1xuICAgICAgY29uc3QgeUhhdFVuaXQgPSB4SGF0VW5pdC5yb3RhdGVkKCBNYXRoLlBJIC8gMiApO1xuXG4gICAgICAvLyBGdW5jdGlvbiB0byBhZGQgYSBwb2ludCB0byBzaGFwZVBvaW50c1xuICAgICAgY29uc3QgYWRkUG9pbnQgPSBmdW5jdGlvbiggeEhhdDogbnVtYmVyLCB5SGF0OiBudW1iZXIgKSB7XG4gICAgICAgIGNvbnN0IHggPSB4SGF0VW5pdC54ICogeEhhdCArIHlIYXRVbml0LnggKiB5SGF0ICsgdGFpbFg7XG4gICAgICAgIGNvbnN0IHkgPSB4SGF0VW5pdC55ICogeEhhdCArIHlIYXRVbml0LnkgKiB5SGF0ICsgdGFpbFk7XG4gICAgICAgIGlmICggc2hhcGVQb2ludHNbIGluZGV4IF0gKSB7XG4gICAgICAgICAgc2hhcGVQb2ludHNbIGluZGV4IF0ueCA9IHg7XG4gICAgICAgICAgc2hhcGVQb2ludHNbIGluZGV4IF0ueSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2hhcGVQb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xuICAgICAgICB9XG4gICAgICAgIGluZGV4Kys7XG4gICAgICB9O1xuXG4gICAgICAvLyBDb21wdXRlIHBvaW50cyBmb3Igc2luZ2xlLSBvciBkb3VibGUtaGVhZGVkIGFycm93XG4gICAgICBpZiAoIG9wdGlvbnMuZG91YmxlSGVhZCApIHtcbiAgICAgICAgYWRkUG9pbnQoIDAsIDAgKTtcbiAgICAgICAgYWRkUG9pbnQoIGhlYWRIZWlnaHQsIGhlYWRXaWR0aCAvIDIgKTtcbiAgICAgICAgYWRkUG9pbnQoIGhlYWRIZWlnaHQsIHRhaWxXaWR0aCAvIDIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhZGRQb2ludCggMCwgdGFpbFdpZHRoIC8gMiApO1xuICAgICAgfVxuICAgICAgYWRkUG9pbnQoIGxlbmd0aCAtIGhlYWRIZWlnaHQsIHRhaWxXaWR0aCAvIDIgKTtcbiAgICAgIGFkZFBvaW50KCBsZW5ndGggLSBoZWFkSGVpZ2h0LCBoZWFkV2lkdGggLyAyICk7XG4gICAgICBhZGRQb2ludCggbGVuZ3RoLCAwICk7XG4gICAgICBhZGRQb2ludCggbGVuZ3RoIC0gaGVhZEhlaWdodCwgLWhlYWRXaWR0aCAvIDIgKTtcbiAgICAgIGFkZFBvaW50KCBsZW5ndGggLSBoZWFkSGVpZ2h0LCAtdGFpbFdpZHRoIC8gMiApO1xuICAgICAgaWYgKCBvcHRpb25zLmRvdWJsZUhlYWQgKSB7XG4gICAgICAgIGFkZFBvaW50KCBoZWFkSGVpZ2h0LCAtdGFpbFdpZHRoIC8gMiApO1xuICAgICAgICBhZGRQb2ludCggaGVhZEhlaWdodCwgLWhlYWRXaWR0aCAvIDIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhZGRQb2ludCggMCwgLXRhaWxXaWR0aCAvIDIgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBpbmRleCA8IHNoYXBlUG9pbnRzLmxlbmd0aCApIHtcbiAgICAgICAgc2hhcGVQb2ludHMubGVuZ3RoID0gaW5kZXg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYXBlUG9pbnRzO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQXJyb3dTaGFwZScsIEFycm93U2hhcGUgKTsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIlNoYXBlIiwib3B0aW9uaXplIiwic2NlbmVyeVBoZXQiLCJBcnJvd1NoYXBlIiwiZ2V0QXJyb3dTaGFwZVBvaW50cyIsInRhaWxYIiwidGFpbFkiLCJ0aXBYIiwidGlwWSIsInNoYXBlUG9pbnRzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRhaWxXaWR0aCIsImhlYWRXaWR0aCIsImhlYWRIZWlnaHQiLCJmcmFjdGlvbmFsSGVhZEhlaWdodCIsImRvdWJsZUhlYWQiLCJpc0hlYWREeW5hbWljIiwic2NhbGVUYWlsVG9vIiwibGVuZ3RoIiwidmVjdG9yIiwibWFnbml0dWRlIiwibWF4SGVhZEhlaWdodCIsIk1hdGgiLCJtaW4iLCJpbmRleCIsInhIYXRVbml0Iiwibm9ybWFsaXplZCIsInlIYXRVbml0Iiwicm90YXRlZCIsIlBJIiwiYWRkUG9pbnQiLCJ4SGF0IiwieUhhdCIsIngiLCJ5IiwicHVzaCIsInBvaW50cyIsIm1vdmVUbyIsInRhaWwiLCJfIiwiZWFjaCIsInBvaW50IiwibGluZVRvIiwiY2xvc2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQVk1QixJQUFBLEFBQU1DLGFBQU4sTUFBTUEsbUJBQW1CSDtJQWtCdEM7Ozs7Ozs7Ozs7O0dBV0MsR0FDRCxPQUFjSSxvQkFBcUJDLEtBQWEsRUFBRUMsS0FBYSxFQUFFQyxJQUFZLEVBQUVDLElBQVksRUFBRUMsV0FBc0IsRUFDaEZDLGVBQW1DLEVBQWM7UUFFbEYsTUFBTUMsVUFBVVYsWUFBZ0M7WUFFOUMsb0JBQW9CO1lBQ3BCVyxXQUFXO1lBQ1hDLFdBQVc7WUFDWEMsWUFBWTtZQUNaQyxzQkFBc0I7WUFDdEJDLFlBQVk7WUFDWkMsZUFBZTtZQUNmQyxjQUFjO1FBQ2hCLEdBQUdSO1FBRUgsMkRBQTJEO1FBQzNELElBQUssQ0FBQ0QsYUFBYztZQUNsQkEsY0FBYyxFQUFFO1FBQ2xCO1FBRUEsSUFBS0YsU0FBU0YsU0FBU0csU0FBU0YsT0FBUTtZQUV0Qyw2RkFBNkY7WUFDN0ZHLFlBQVlV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