// Copyright 2014-2022, University of Colorado Boulder
/**
 * CurvedArrowShape draws a single- or double-headed curved arrow.
 * Arrow heads are not curved, their tips are perpendicular to the ends of the arrow tail.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import sceneryPhet from './sceneryPhet.js';
let CurvedArrowShape = class CurvedArrowShape extends Shape {
    /**
   * @param radius - radius at the center of the arrow's tail
   * @param startAngle - starting angle, in radians (at tail, or optional 2nd head)
   * @param endAngle - end angle, in radians (at head of arrow)
   * @param providedOptions
   */ constructor(radius, startAngle, endAngle, providedOptions){
        const options = optionize()({
            // SelfOptions
            doubleHead: false,
            headWidth: 10,
            headHeight: 10,
            tailWidth: 5,
            anticlockwise: false
        }, providedOptions);
        super();
        // Points that define the base of an arrow head. 'inner' is closer to the center of the circle, 'outer' is farther away.
        let baseInnerX;
        let baseInnerY;
        let baseOuterX;
        let baseOuterY;
        // optional head at startAngle
        if (options.doubleHead) {
            // base of the arrow head at startAngle
            baseInnerX = Math.cos(startAngle) * (radius - options.headWidth / 2);
            baseInnerY = Math.sin(startAngle) * (radius - options.headWidth / 2);
            baseOuterX = Math.cos(startAngle) * (radius + options.headWidth / 2);
            baseOuterY = Math.sin(startAngle) * (radius + options.headWidth / 2);
            // tip of the arrow head at startAngle
            const startTip = computePerpendicularPoint(baseOuterX, baseOuterY, baseInnerX, baseInnerY, options.headHeight);
            // head at startAngle
            this.moveTo(baseInnerX, baseInnerY).lineTo(startTip.x, startTip.y).lineTo(baseOuterX, baseOuterY);
        }
        // outer arc from startAngle to endAngle
        this.arc(0, 0, radius + options.tailWidth / 2, startAngle, endAngle, options.anticlockwise);
        // base of the arrow head at endAngle
        baseInnerX = Math.cos(endAngle) * (radius - options.headWidth / 2);
        baseInnerY = Math.sin(endAngle) * (radius - options.headWidth / 2);
        baseOuterX = Math.cos(endAngle) * (radius + options.headWidth / 2);
        baseOuterY = Math.sin(endAngle) * (radius + options.headWidth / 2);
        // tip of the arrow head at endAngle
        const endTip = computePerpendicularPoint(baseInnerX, baseInnerY, baseOuterX, baseOuterY, options.headHeight);
        // arrow head at endAngle
        this.lineTo(baseOuterX, baseOuterY).lineTo(endTip.x, endTip.y).lineTo(baseInnerX, baseInnerY);
        // inner arc from endAngle to startAngle
        this.arc(0, 0, radius - options.tailWidth / 2, endAngle, startAngle, !options.anticlockwise);
        // Workaround for https://github.com/phetsims/scenery/issues/214 (Firefox-specific path rendering issue)
        this.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius + 0.00001);
        this.close();
    }
};
export { CurvedArrowShape as default };
/**
 * This is a general algorithm, used herein to compute the point for an arrow's tip.
 * Given 2 points that define a line segment (the arrow's base), compute the point (the tip) that
 * is a specified distance away from a perpendicular line that runs through the center point
 * of the line segment.
 */ const computePerpendicularPoint = function(x1, y1, x2, y2, distance) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const r = Math.sqrt(dx * dx + dy * dy);
    // midpoint + distance * unitVector
    const x = (x1 + x2) / 2 + distance * dy / r;
    const y = (y1 + y2) / 2 - distance * dx / r;
    return new Vector2(x, y);
};
sceneryPhet.register('CurvedArrowShape', CurvedArrowShape);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9DdXJ2ZWRBcnJvd1NoYXBlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEN1cnZlZEFycm93U2hhcGUgZHJhd3MgYSBzaW5nbGUtIG9yIGRvdWJsZS1oZWFkZWQgY3VydmVkIGFycm93LlxuICogQXJyb3cgaGVhZHMgYXJlIG5vdCBjdXJ2ZWQsIHRoZWlyIHRpcHMgYXJlIHBlcnBlbmRpY3VsYXIgdG8gdGhlIGVuZHMgb2YgdGhlIGFycm93IHRhaWwuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBkb3VibGVIZWFkPzogYm9vbGVhbjsgLy8gZmFsc2UgPSBzaW5nbGUgaGVhZCBhdCBlbmRBbmdsZSwgdHJ1ZSA9IGhlYWRzIGF0IHN0YXJ0QW5nbGUgYW5kIGVuZEFuZ2xlXG4gIGhlYWRXaWR0aD86IG51bWJlcjtcbiAgaGVhZEhlaWdodD86IG51bWJlcjtcbiAgdGFpbFdpZHRoPzogbnVtYmVyO1xuICBhbnRpY2xvY2t3aXNlPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEN1cnZlZEFycm93U2hhcGVPcHRpb25zID0gU2VsZk9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1cnZlZEFycm93U2hhcGUgZXh0ZW5kcyBTaGFwZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSByYWRpdXMgLSByYWRpdXMgYXQgdGhlIGNlbnRlciBvZiB0aGUgYXJyb3cncyB0YWlsXG4gICAqIEBwYXJhbSBzdGFydEFuZ2xlIC0gc3RhcnRpbmcgYW5nbGUsIGluIHJhZGlhbnMgKGF0IHRhaWwsIG9yIG9wdGlvbmFsIDJuZCBoZWFkKVxuICAgKiBAcGFyYW0gZW5kQW5nbGUgLSBlbmQgYW5nbGUsIGluIHJhZGlhbnMgKGF0IGhlYWQgb2YgYXJyb3cpXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmFkaXVzOiBudW1iZXIsIHN0YXJ0QW5nbGU6IG51bWJlciwgZW5kQW5nbGU6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogQ3VydmVkQXJyb3dTaGFwZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEN1cnZlZEFycm93U2hhcGVPcHRpb25zLCBTZWxmT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgZG91YmxlSGVhZDogZmFsc2UsXG4gICAgICBoZWFkV2lkdGg6IDEwLFxuICAgICAgaGVhZEhlaWdodDogMTAsXG4gICAgICB0YWlsV2lkdGg6IDUsXG4gICAgICBhbnRpY2xvY2t3aXNlOiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFBvaW50cyB0aGF0IGRlZmluZSB0aGUgYmFzZSBvZiBhbiBhcnJvdyBoZWFkLiAnaW5uZXInIGlzIGNsb3NlciB0byB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUsICdvdXRlcicgaXMgZmFydGhlciBhd2F5LlxuICAgIGxldCBiYXNlSW5uZXJYO1xuICAgIGxldCBiYXNlSW5uZXJZO1xuICAgIGxldCBiYXNlT3V0ZXJYO1xuICAgIGxldCBiYXNlT3V0ZXJZO1xuXG4gICAgLy8gb3B0aW9uYWwgaGVhZCBhdCBzdGFydEFuZ2xlXG4gICAgaWYgKCBvcHRpb25zLmRvdWJsZUhlYWQgKSB7XG5cbiAgICAgIC8vIGJhc2Ugb2YgdGhlIGFycm93IGhlYWQgYXQgc3RhcnRBbmdsZVxuICAgICAgYmFzZUlubmVyWCA9IE1hdGguY29zKCBzdGFydEFuZ2xlICkgKiAoIHJhZGl1cyAtIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuICAgICAgYmFzZUlubmVyWSA9IE1hdGguc2luKCBzdGFydEFuZ2xlICkgKiAoIHJhZGl1cyAtIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuICAgICAgYmFzZU91dGVyWCA9IE1hdGguY29zKCBzdGFydEFuZ2xlICkgKiAoIHJhZGl1cyArIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuICAgICAgYmFzZU91dGVyWSA9IE1hdGguc2luKCBzdGFydEFuZ2xlICkgKiAoIHJhZGl1cyArIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuXG4gICAgICAvLyB0aXAgb2YgdGhlIGFycm93IGhlYWQgYXQgc3RhcnRBbmdsZVxuICAgICAgY29uc3Qgc3RhcnRUaXAgPSBjb21wdXRlUGVycGVuZGljdWxhclBvaW50KCBiYXNlT3V0ZXJYLCBiYXNlT3V0ZXJZLCBiYXNlSW5uZXJYLCBiYXNlSW5uZXJZLCBvcHRpb25zLmhlYWRIZWlnaHQgKTtcblxuICAgICAgLy8gaGVhZCBhdCBzdGFydEFuZ2xlXG4gICAgICB0aGlzLm1vdmVUbyggYmFzZUlubmVyWCwgYmFzZUlubmVyWSApXG4gICAgICAgIC5saW5lVG8oIHN0YXJ0VGlwLngsIHN0YXJ0VGlwLnkgKVxuICAgICAgICAubGluZVRvKCBiYXNlT3V0ZXJYLCBiYXNlT3V0ZXJZICk7XG4gICAgfVxuXG4gICAgLy8gb3V0ZXIgYXJjIGZyb20gc3RhcnRBbmdsZSB0byBlbmRBbmdsZVxuICAgIHRoaXMuYXJjKCAwLCAwLCByYWRpdXMgKyBvcHRpb25zLnRhaWxXaWR0aCAvIDIsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBvcHRpb25zLmFudGljbG9ja3dpc2UgKTtcblxuICAgIC8vIGJhc2Ugb2YgdGhlIGFycm93IGhlYWQgYXQgZW5kQW5nbGVcbiAgICBiYXNlSW5uZXJYID0gTWF0aC5jb3MoIGVuZEFuZ2xlICkgKiAoIHJhZGl1cyAtIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuICAgIGJhc2VJbm5lclkgPSBNYXRoLnNpbiggZW5kQW5nbGUgKSAqICggcmFkaXVzIC0gb3B0aW9ucy5oZWFkV2lkdGggLyAyICk7XG4gICAgYmFzZU91dGVyWCA9IE1hdGguY29zKCBlbmRBbmdsZSApICogKCByYWRpdXMgKyBvcHRpb25zLmhlYWRXaWR0aCAvIDIgKTtcbiAgICBiYXNlT3V0ZXJZID0gTWF0aC5zaW4oIGVuZEFuZ2xlICkgKiAoIHJhZGl1cyArIG9wdGlvbnMuaGVhZFdpZHRoIC8gMiApO1xuXG4gICAgLy8gdGlwIG9mIHRoZSBhcnJvdyBoZWFkIGF0IGVuZEFuZ2xlXG4gICAgY29uc3QgZW5kVGlwID0gY29tcHV0ZVBlcnBlbmRpY3VsYXJQb2ludCggYmFzZUlubmVyWCwgYmFzZUlubmVyWSwgYmFzZU91dGVyWCwgYmFzZU91dGVyWSwgb3B0aW9ucy5oZWFkSGVpZ2h0ICk7XG5cbiAgICAvLyBhcnJvdyBoZWFkIGF0IGVuZEFuZ2xlXG4gICAgdGhpcy5saW5lVG8oIGJhc2VPdXRlclgsIGJhc2VPdXRlclkgKVxuICAgICAgLmxpbmVUbyggZW5kVGlwLngsIGVuZFRpcC55IClcbiAgICAgIC5saW5lVG8oIGJhc2VJbm5lclgsIGJhc2VJbm5lclkgKTtcblxuICAgIC8vIGlubmVyIGFyYyBmcm9tIGVuZEFuZ2xlIHRvIHN0YXJ0QW5nbGVcbiAgICB0aGlzLmFyYyggMCwgMCwgcmFkaXVzIC0gb3B0aW9ucy50YWlsV2lkdGggLyAyLCBlbmRBbmdsZSwgc3RhcnRBbmdsZSwgIW9wdGlvbnMuYW50aWNsb2Nrd2lzZSApO1xuXG4gICAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzIxNCAoRmlyZWZveC1zcGVjaWZpYyBwYXRoIHJlbmRlcmluZyBpc3N1ZSlcbiAgICB0aGlzLmxpbmVUbyggTWF0aC5jb3MoIHN0YXJ0QW5nbGUgKSAqIHJhZGl1cywgTWF0aC5zaW4oIHN0YXJ0QW5nbGUgKSAqIHJhZGl1cyArIDAuMDAwMDEgKTtcblxuICAgIHRoaXMuY2xvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgaXMgYSBnZW5lcmFsIGFsZ29yaXRobSwgdXNlZCBoZXJlaW4gdG8gY29tcHV0ZSB0aGUgcG9pbnQgZm9yIGFuIGFycm93J3MgdGlwLlxuICogR2l2ZW4gMiBwb2ludHMgdGhhdCBkZWZpbmUgYSBsaW5lIHNlZ21lbnQgKHRoZSBhcnJvdydzIGJhc2UpLCBjb21wdXRlIHRoZSBwb2ludCAodGhlIHRpcCkgdGhhdFxuICogaXMgYSBzcGVjaWZpZWQgZGlzdGFuY2UgYXdheSBmcm9tIGEgcGVycGVuZGljdWxhciBsaW5lIHRoYXQgcnVucyB0aHJvdWdoIHRoZSBjZW50ZXIgcG9pbnRcbiAqIG9mIHRoZSBsaW5lIHNlZ21lbnQuXG4gKi9cbmNvbnN0IGNvbXB1dGVQZXJwZW5kaWN1bGFyUG9pbnQgPSBmdW5jdGlvbiggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgZGlzdGFuY2U6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgY29uc3QgZHggPSB4MSAtIHgyO1xuICBjb25zdCBkeSA9IHkxIC0geTI7XG4gIGNvbnN0IHIgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cbiAgLy8gbWlkcG9pbnQgKyBkaXN0YW5jZSAqIHVuaXRWZWN0b3JcbiAgY29uc3QgeCA9ICggeDEgKyB4MiApIC8gMiArICggZGlzdGFuY2UgKiBkeSAvIHIgKTtcbiAgY29uc3QgeSA9ICggeTEgKyB5MiApIC8gMiAtICggZGlzdGFuY2UgKiBkeCAvIHIgKTtcbiAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCB5ICk7XG59O1xuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0N1cnZlZEFycm93U2hhcGUnLCBDdXJ2ZWRBcnJvd1NoYXBlICk7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsInNjZW5lcnlQaGV0IiwiQ3VydmVkQXJyb3dTaGFwZSIsInJhZGl1cyIsInN0YXJ0QW5nbGUiLCJlbmRBbmdsZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkb3VibGVIZWFkIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInRhaWxXaWR0aCIsImFudGljbG9ja3dpc2UiLCJiYXNlSW5uZXJYIiwiYmFzZUlubmVyWSIsImJhc2VPdXRlclgiLCJiYXNlT3V0ZXJZIiwiTWF0aCIsImNvcyIsInNpbiIsInN0YXJ0VGlwIiwiY29tcHV0ZVBlcnBlbmRpY3VsYXJQb2ludCIsIm1vdmVUbyIsImxpbmVUbyIsIngiLCJ5IiwiYXJjIiwiZW5kVGlwIiwiY2xvc2UiLCJ4MSIsInkxIiwieDIiLCJ5MiIsImRpc3RhbmNlIiwiZHgiLCJkeSIsInIiLCJzcXJ0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQVk1QixJQUFBLEFBQU1DLG1CQUFOLE1BQU1BLHlCQUF5Qkg7SUFFNUM7Ozs7O0dBS0MsR0FDRCxZQUFvQkksTUFBYyxFQUFFQyxVQUFrQixFQUFFQyxRQUFnQixFQUFFQyxlQUF5QyxDQUFHO1FBRXBILE1BQU1DLFVBQVVQLFlBQW1EO1lBRWpFLGNBQWM7WUFDZFEsWUFBWTtZQUNaQyxXQUFXO1lBQ1hDLFlBQVk7WUFDWkMsV0FBVztZQUNYQyxlQUFlO1FBQ2pCLEdBQUdOO1FBRUgsS0FBSztRQUVMLHdIQUF3SDtRQUN4SCxJQUFJTztRQUNKLElBQUlDO1FBQ0osSUFBSUM7UUFDSixJQUFJQztRQUVKLDhCQUE4QjtRQUM5QixJQUFL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