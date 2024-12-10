// Copyright 2016-2024, University of Colorado Boulder
/**
 * Button with one or more arrows that point up, down, left or right.
 * Press and release immediately and the button fires on 'up'.
 * Press and hold for M milliseconds and the button will fire repeatedly every N milliseconds until released.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Path } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import RectangularPushButton from './RectangularPushButton.js';
// constants
const DEFAULT_ARROW_HEIGHT = 20;
let ArrowButton = class ArrowButton extends RectangularPushButton {
    constructor(direction, callback, providedOptions){
        const options = optionize()({
            // options for the button
            cursor: 'pointer',
            baseColor: 'white',
            stroke: 'black',
            lineWidth: 1,
            cornerRadius: 4,
            xMargin: 7,
            yMargin: 5,
            touchAreaXDilation: 7,
            touchAreaYDilation: 7,
            // options for the arrows
            arrowHeight: DEFAULT_ARROW_HEIGHT,
            arrowWidth: DEFAULT_ARROW_HEIGHT * Math.sqrt(3) / 2,
            arrowFill: 'black',
            arrowStroke: null,
            arrowLineWidth: 1,
            numberOfArrows: 1,
            arrowSpacing: -DEFAULT_ARROW_HEIGHT * (1 / 2),
            // options related to fire-on-hold feature
            fireOnHold: true,
            fireOnHoldDelay: 400,
            fireOnHoldInterval: 100,
            // callbacks
            startCallback: _.noop,
            endCallback: _.noop // {function(over:boolean)} called when the pointer is released, {boolean} over indicates whether the pointer was over when released
        }, providedOptions);
        options.listener = callback;
        // arrow node
        const arrowShape = new Shape();
        for(let i = 0; i < options.numberOfArrows; i++){
            // offset for the base of the arrow, shifting the shape of the arrow when there are more than one
            const arrowOffset = i * (options.arrowHeight + options.arrowSpacing);
            if (direction === 'up') {
                arrowShape.moveTo(options.arrowHeight / 2, arrowOffset).lineTo(options.arrowHeight, options.arrowWidth + arrowOffset).lineTo(0, options.arrowWidth + arrowOffset).close();
            } else if (direction === 'down') {
                arrowShape.moveTo(0, arrowOffset).lineTo(options.arrowHeight, arrowOffset).lineTo(options.arrowHeight / 2, options.arrowWidth + arrowOffset).close();
            } else if (direction === 'left') {
                arrowShape.moveTo(arrowOffset, options.arrowHeight / 2).lineTo(options.arrowWidth + arrowOffset, 0).lineTo(options.arrowWidth + arrowOffset, options.arrowHeight).close();
            } else if (direction === 'right') {
                arrowShape.moveTo(arrowOffset, 0).lineTo(options.arrowWidth + arrowOffset, options.arrowHeight / 2).lineTo(arrowOffset, options.arrowHeight).close();
            } else {
                throw new Error(`unsupported direction: ${direction}`);
            }
        }
        options.content = new Path(arrowShape, {
            fill: options.arrowFill,
            stroke: options.arrowStroke,
            lineWidth: options.arrowLineWidth,
            pickable: false
        });
        super(options);
    }
};
export { ArrowButton as default };
sun.register('ArrowButton', ArrowButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Fycm93QnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJ1dHRvbiB3aXRoIG9uZSBvciBtb3JlIGFycm93cyB0aGF0IHBvaW50IHVwLCBkb3duLCBsZWZ0IG9yIHJpZ2h0LlxuICogUHJlc3MgYW5kIHJlbGVhc2UgaW1tZWRpYXRlbHkgYW5kIHRoZSBidXR0b24gZmlyZXMgb24gJ3VwJy5cbiAqIFByZXNzIGFuZCBob2xkIGZvciBNIG1pbGxpc2Vjb25kcyBhbmQgdGhlIGJ1dHRvbiB3aWxsIGZpcmUgcmVwZWF0ZWRseSBldmVyeSBOIG1pbGxpc2Vjb25kcyB1bnRpbCByZWxlYXNlZC5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBQYXRoLCBUUGFpbnQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuLi9zdW4uanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfQVJST1dfSEVJR0hUID0gMjA7XG5cbmV4cG9ydCB0eXBlIEFycm93QnV0dG9uRGlyZWN0aW9uID0gJ3VwJyB8ICdkb3duJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gICAvLyBmcm9tIHRpcCB0byBiYXNlXG4gIGFycm93SGVpZ2h0PzogbnVtYmVyO1xuXG4gIC8vIHdpZHRoIG9mIGJhc2VcbiAgYXJyb3dXaWR0aD86IG51bWJlcjtcblxuICBhcnJvd0ZpbGw/OiBUUGFpbnQ7XG4gIGFycm93U3Ryb2tlPzogVFBhaW50O1xuICBhcnJvd0xpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyBlYWNoIGFycm93IHdpbGwgaGF2ZSB0aGUgc2FtZSBzaGFwZSBhbmQgc3R5bGluZ1xuICBudW1iZXJPZkFycm93cz86IG51bWJlcjtcblxuICAvLyBzcGFjaW5nIGZvciBlYWNoIGFycm93IHN1Y2ggdGhhdCB0aGV5IG92ZXJsYXAgc2xpZ2h0bHlcbiAgYXJyb3dTcGFjaW5nPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgQXJyb3dCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMsICdjb250ZW50JyB8ICdsaXN0ZW5lcic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcnJvd0J1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkaXJlY3Rpb246IEFycm93QnV0dG9uRGlyZWN0aW9uLCBjYWxsYmFjazogKCkgPT4gdm9pZCwgcHJvdmlkZWRPcHRpb25zPzogQXJyb3dCdXR0b25PcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBcnJvd0J1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIG9wdGlvbnMgZm9yIHRoZSBidXR0b25cbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgY29ybmVyUmFkaXVzOiA0LFxuICAgICAgeE1hcmdpbjogNyxcbiAgICAgIHlNYXJnaW46IDUsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDcsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDcsXG5cbiAgICAgIC8vIG9wdGlvbnMgZm9yIHRoZSBhcnJvd3NcbiAgICAgIGFycm93SGVpZ2h0OiBERUZBVUxUX0FSUk9XX0hFSUdIVCwgLy8gZnJvbSB0aXAgdG8gYmFzZVxuICAgICAgYXJyb3dXaWR0aDogREVGQVVMVF9BUlJPV19IRUlHSFQgKiBNYXRoLnNxcnQoIDMgKSAvIDIsIC8vIHdpZHRoIG9mIGJhc2VcbiAgICAgIGFycm93RmlsbDogJ2JsYWNrJyxcbiAgICAgIGFycm93U3Ryb2tlOiBudWxsLFxuICAgICAgYXJyb3dMaW5lV2lkdGg6IDEsXG4gICAgICBudW1iZXJPZkFycm93czogMSwgLy8gZWFjaCBhcnJvdyB3aWxsIGhhdmUgdGhlIHNhbWUgc2hhcGUgYW5kIHN0eWxpbmdcbiAgICAgIGFycm93U3BhY2luZzogLURFRkFVTFRfQVJST1dfSEVJR0hUICogKCAxIC8gMiApLCAvLyBzcGFjaW5nIGZvciBlYWNoIGFycm93IHN1Y2ggdGhhdCB0aGV5IG92ZXJsYXAgc2xpZ2h0bHlcblxuICAgICAgLy8gb3B0aW9ucyByZWxhdGVkIHRvIGZpcmUtb24taG9sZCBmZWF0dXJlXG4gICAgICBmaXJlT25Ib2xkOiB0cnVlLFxuICAgICAgZmlyZU9uSG9sZERlbGF5OiA0MDAsIC8vIHN0YXJ0IHRvIGZpcmUgY29udGludW91c2x5IGFmdGVyIHByZXNzaW5nIGZvciB0aGlzIGxvbmcgKG1pbGxpc2Vjb25kcylcbiAgICAgIGZpcmVPbkhvbGRJbnRlcnZhbDogMTAwLCAvLyBmaXJlIGNvbnRpbnVvdXNseSBhdCB0aGlzIGludGVydmFsIChtaWxsaXNlY29uZHMpXG5cbiAgICAgIC8vIGNhbGxiYWNrc1xuICAgICAgc3RhcnRDYWxsYmFjazogXy5ub29wLCAvLyB7ZnVuY3Rpb24oKX0gY2FsbGVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgcHJlc3NlZFxuICAgICAgZW5kQ2FsbGJhY2s6IF8ubm9vcCAvLyB7ZnVuY3Rpb24ob3Zlcjpib29sZWFuKX0gY2FsbGVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgcmVsZWFzZWQsIHtib29sZWFufSBvdmVyIGluZGljYXRlcyB3aGV0aGVyIHRoZSBwb2ludGVyIHdhcyBvdmVyIHdoZW4gcmVsZWFzZWRcblxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgb3B0aW9ucy5saXN0ZW5lciA9IGNhbGxiYWNrO1xuXG4gICAgLy8gYXJyb3cgbm9kZVxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgU2hhcGUoKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvcHRpb25zLm51bWJlck9mQXJyb3dzOyBpKysgKSB7XG5cbiAgICAgIC8vIG9mZnNldCBmb3IgdGhlIGJhc2Ugb2YgdGhlIGFycm93LCBzaGlmdGluZyB0aGUgc2hhcGUgb2YgdGhlIGFycm93IHdoZW4gdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmVcbiAgICAgIGNvbnN0IGFycm93T2Zmc2V0ID0gaSAqICggb3B0aW9ucy5hcnJvd0hlaWdodCArIG9wdGlvbnMuYXJyb3dTcGFjaW5nICk7XG4gICAgICBpZiAoIGRpcmVjdGlvbiA9PT0gJ3VwJyApIHtcbiAgICAgICAgYXJyb3dTaGFwZS5tb3ZlVG8oIG9wdGlvbnMuYXJyb3dIZWlnaHQgLyAyLCBhcnJvd09mZnNldCApLmxpbmVUbyggb3B0aW9ucy5hcnJvd0hlaWdodCwgb3B0aW9ucy5hcnJvd1dpZHRoICsgYXJyb3dPZmZzZXQgKS5saW5lVG8oIDAsIG9wdGlvbnMuYXJyb3dXaWR0aCArIGFycm93T2Zmc2V0ICkuY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09ICdkb3duJyApIHtcbiAgICAgICAgYXJyb3dTaGFwZS5tb3ZlVG8oIDAsIGFycm93T2Zmc2V0ICkubGluZVRvKCBvcHRpb25zLmFycm93SGVpZ2h0LCBhcnJvd09mZnNldCApLmxpbmVUbyggb3B0aW9ucy5hcnJvd0hlaWdodCAvIDIsIG9wdGlvbnMuYXJyb3dXaWR0aCArIGFycm93T2Zmc2V0ICkuY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09ICdsZWZ0JyApIHtcbiAgICAgICAgYXJyb3dTaGFwZS5tb3ZlVG8oIGFycm93T2Zmc2V0LCBvcHRpb25zLmFycm93SGVpZ2h0IC8gMiApLmxpbmVUbyggb3B0aW9ucy5hcnJvd1dpZHRoICsgYXJyb3dPZmZzZXQsIDAgKS5saW5lVG8oIG9wdGlvbnMuYXJyb3dXaWR0aCArIGFycm93T2Zmc2V0LCBvcHRpb25zLmFycm93SGVpZ2h0ICkuY2xvc2UoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBkaXJlY3Rpb24gPT09ICdyaWdodCcgKSB7XG4gICAgICAgIGFycm93U2hhcGUubW92ZVRvKCBhcnJvd09mZnNldCwgMCApLmxpbmVUbyggb3B0aW9ucy5hcnJvd1dpZHRoICsgYXJyb3dPZmZzZXQsIG9wdGlvbnMuYXJyb3dIZWlnaHQgLyAyICkubGluZVRvKCBhcnJvd09mZnNldCwgb3B0aW9ucy5hcnJvd0hlaWdodCApLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgZGlyZWN0aW9uOiAke2RpcmVjdGlvbn1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IFBhdGgoIGFycm93U2hhcGUsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYXJyb3dGaWxsLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmFycm93U3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmFycm93TGluZVdpZHRoLFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdBcnJvd0J1dHRvbicsIEFycm93QnV0dG9uICk7Il0sIm5hbWVzIjpbIlNoYXBlIiwib3B0aW9uaXplIiwiUGF0aCIsInN1biIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkRFRkFVTFRfQVJST1dfSEVJR0hUIiwiQXJyb3dCdXR0b24iLCJkaXJlY3Rpb24iLCJjYWxsYmFjayIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjdXJzb3IiLCJiYXNlQ29sb3IiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJjb3JuZXJSYWRpdXMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImFycm93SGVpZ2h0IiwiYXJyb3dXaWR0aCIsIk1hdGgiLCJzcXJ0IiwiYXJyb3dGaWxsIiwiYXJyb3dTdHJva2UiLCJhcnJvd0xpbmVXaWR0aCIsIm51bWJlck9mQXJyb3dzIiwiYXJyb3dTcGFjaW5nIiwiZmlyZU9uSG9sZCIsImZpcmVPbkhvbGREZWxheSIsImZpcmVPbkhvbGRJbnRlcnZhbCIsInN0YXJ0Q2FsbGJhY2siLCJfIiwibm9vcCIsImVuZENhbGxiYWNrIiwibGlzdGVuZXIiLCJhcnJvd1NoYXBlIiwiaSIsImFycm93T2Zmc2V0IiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJFcnJvciIsImNvbnRlbnQiLCJmaWxsIiwicGlja2FibGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELFNBQVNBLEtBQUssUUFBUSw4QkFBOEI7QUFDcEQsT0FBT0MsZUFBZSxxQ0FBcUM7QUFFM0QsU0FBU0MsSUFBSSxRQUFnQixpQ0FBaUM7QUFDOUQsT0FBT0MsU0FBUyxZQUFZO0FBQzVCLE9BQU9DLDJCQUE2RCw2QkFBNkI7QUFFakcsWUFBWTtBQUNaLE1BQU1DLHVCQUF1QjtB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