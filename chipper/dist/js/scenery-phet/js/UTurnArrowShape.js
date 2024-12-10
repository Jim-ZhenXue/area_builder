// Copyright 2014-2022, University of Colorado Boulder
/**
 * U-Turn arrow shape, for use with "reset" or "undo" purposes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Shape } from '../../kite/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let UTurnArrowShape = class UTurnArrowShape extends Shape {
    /**
   * @param size A size factor (it'll be a bit bigger)
   */ constructor(size){
        super();
        const strokeWidth = size * 0.3;
        const strokeOffset = strokeWidth / 2;
        const mainWidth = size * 0.6;
        const mainHeight = size;
        const headWidth = size * 0.5;
        const headHeight = size * 0.75;
        const halfHeadWidth = headWidth / 2;
        const halfHeadHeight = headHeight / 2;
        // starts adjacent to the arrowhead on the top, going clockwise
        this.moveTo(halfHeadWidth, -strokeOffset);
        this.lineTo(mainWidth, -strokeOffset);
        // arc (mainWidth,-strokeOffset) => (mainWidth,mainHeight+strokeOffset)
        this.arc(mainWidth, mainHeight / 2, mainHeight / 2 + strokeOffset, -Math.PI / 2, Math.PI / 2, false);
        this.lineTo(0, mainHeight + strokeOffset);
        this.lineTo(0, mainHeight - strokeOffset);
        this.lineTo(mainWidth, mainHeight - strokeOffset);
        // arc (mainWidth,mainHeight-strokeOffset) => (mainWidth,strokeOffset)
        this.arc(mainWidth, mainHeight / 2, mainHeight / 2 - strokeOffset, Math.PI / 2, -Math.PI / 2, true);
        this.lineTo(halfHeadWidth, strokeOffset);
        // three lines of the arrow head
        this.lineTo(halfHeadWidth, halfHeadHeight);
        this.lineTo(-halfHeadWidth, 0);
        this.lineTo(halfHeadWidth, -halfHeadHeight);
        this.close();
    }
};
export { UTurnArrowShape as default };
sceneryPhet.register('UTurnArrowShape', UTurnArrowShape);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9VVHVybkFycm93U2hhcGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVS1UdXJuIGFycm93IHNoYXBlLCBmb3IgdXNlIHdpdGggXCJyZXNldFwiIG9yIFwidW5kb1wiIHB1cnBvc2VzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVVR1cm5BcnJvd1NoYXBlIGV4dGVuZHMgU2hhcGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gc2l6ZSBBIHNpemUgZmFjdG9yIChpdCdsbCBiZSBhIGJpdCBiaWdnZXIpXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpemU6IG51bWJlciApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgY29uc3Qgc3Ryb2tlV2lkdGggPSBzaXplICogMC4zO1xuICAgIGNvbnN0IHN0cm9rZU9mZnNldCA9IHN0cm9rZVdpZHRoIC8gMjtcbiAgICBjb25zdCBtYWluV2lkdGggPSBzaXplICogMC42O1xuICAgIGNvbnN0IG1haW5IZWlnaHQgPSBzaXplO1xuICAgIGNvbnN0IGhlYWRXaWR0aCA9IHNpemUgKiAwLjU7XG4gICAgY29uc3QgaGVhZEhlaWdodCA9IHNpemUgKiAwLjc1O1xuICAgIGNvbnN0IGhhbGZIZWFkV2lkdGggPSBoZWFkV2lkdGggLyAyO1xuICAgIGNvbnN0IGhhbGZIZWFkSGVpZ2h0ID0gaGVhZEhlaWdodCAvIDI7XG5cbiAgICAvLyBzdGFydHMgYWRqYWNlbnQgdG8gdGhlIGFycm93aGVhZCBvbiB0aGUgdG9wLCBnb2luZyBjbG9ja3dpc2VcbiAgICB0aGlzLm1vdmVUbyggaGFsZkhlYWRXaWR0aCwgLXN0cm9rZU9mZnNldCApO1xuICAgIHRoaXMubGluZVRvKCBtYWluV2lkdGgsIC1zdHJva2VPZmZzZXQgKTtcbiAgICAvLyBhcmMgKG1haW5XaWR0aCwtc3Ryb2tlT2Zmc2V0KSA9PiAobWFpbldpZHRoLG1haW5IZWlnaHQrc3Ryb2tlT2Zmc2V0KVxuICAgIHRoaXMuYXJjKCBtYWluV2lkdGgsIG1haW5IZWlnaHQgLyAyLCBtYWluSGVpZ2h0IC8gMiArIHN0cm9rZU9mZnNldCwgLU1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMiwgZmFsc2UgKTtcbiAgICB0aGlzLmxpbmVUbyggMCwgbWFpbkhlaWdodCArIHN0cm9rZU9mZnNldCApO1xuICAgIHRoaXMubGluZVRvKCAwLCBtYWluSGVpZ2h0IC0gc3Ryb2tlT2Zmc2V0ICk7XG4gICAgdGhpcy5saW5lVG8oIG1haW5XaWR0aCwgbWFpbkhlaWdodCAtIHN0cm9rZU9mZnNldCApO1xuICAgIC8vIGFyYyAobWFpbldpZHRoLG1haW5IZWlnaHQtc3Ryb2tlT2Zmc2V0KSA9PiAobWFpbldpZHRoLHN0cm9rZU9mZnNldClcbiAgICB0aGlzLmFyYyggbWFpbldpZHRoLCBtYWluSGVpZ2h0IC8gMiwgbWFpbkhlaWdodCAvIDIgLSBzdHJva2VPZmZzZXQsIE1hdGguUEkgLyAyLCAtTWF0aC5QSSAvIDIsIHRydWUgKTtcbiAgICB0aGlzLmxpbmVUbyggaGFsZkhlYWRXaWR0aCwgc3Ryb2tlT2Zmc2V0ICk7XG4gICAgLy8gdGhyZWUgbGluZXMgb2YgdGhlIGFycm93IGhlYWRcbiAgICB0aGlzLmxpbmVUbyggaGFsZkhlYWRXaWR0aCwgaGFsZkhlYWRIZWlnaHQgKTtcbiAgICB0aGlzLmxpbmVUbyggLWhhbGZIZWFkV2lkdGgsIDAgKTtcbiAgICB0aGlzLmxpbmVUbyggaGFsZkhlYWRXaWR0aCwgLWhhbGZIZWFkSGVpZ2h0ICk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnVVR1cm5BcnJvd1NoYXBlJywgVVR1cm5BcnJvd1NoYXBlICk7Il0sIm5hbWVzIjpbIlNoYXBlIiwic2NlbmVyeVBoZXQiLCJVVHVybkFycm93U2hhcGUiLCJzaXplIiwic3Ryb2tlV2lkdGgiLCJzdHJva2VPZmZzZXQiLCJtYWluV2lkdGgiLCJtYWluSGVpZ2h0IiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImhhbGZIZWFkV2lkdGgiLCJoYWxmSGVhZEhlaWdodCIsIm1vdmVUbyIsImxpbmVUbyIsImFyYyIsIk1hdGgiLCJQSSIsImNsb3NlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTVCLElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXdCRjtJQUUzQzs7R0FFQyxHQUNELFlBQW9CRyxJQUFZLENBQUc7UUFDakMsS0FBSztRQUVMLE1BQU1DLGNBQWNELE9BQU87UUFDM0IsTUFBTUUsZUFBZUQsY0FBYztRQUNuQyxNQUFNRSxZQUFZSCxPQUFPO1FBQ3pCLE1BQU1JLGFBQWFKO1FBQ25CLE1BQU1LLFlBQVlMLE9BQU87UUFDekIsTUFBTU0sYUFBYU4sT0FBTztRQUMxQixNQUFNTyxnQkFBZ0JGLFlBQVk7UUFDbEMsTUFBTUcsaUJBQWlCRixhQUFhO1FBRXBDLCtEQUErRDtRQUMvRCxJQUFJLENBQUNHLE1BQU0sQ0FBRUYsZUFBZSxDQUFDTDtRQUM3QixJQUFJLENBQUNRLE1BQU0sQ0FBRVAsV0FBVyxDQUFDRDtRQUN6Qix1RUFBdUU7UUFDdkUsSUFBSSxDQUFDUyxHQUFHLENBQUVSLFdBQVdDLGFBQWEsR0FBR0EsYUFBYSxJQUFJRixjQUFjLENBQUNVLEtBQUtDLEVBQUUsR0FBRyxHQUFHRCxLQUFLQyxFQUFFLEdBQUcsR0FBRztRQUMvRixJQUFJLENBQUNILE1BQU0sQ0FBRSxHQUFHTixhQUFhRjtRQUM3QixJQUFJLENBQUNRLE1BQU0sQ0FBRSxHQUFHTixhQUFhRjtRQUM3QixJQUFJLENBQUNRLE1BQU0sQ0FBRVAsV0FBV0MsYUFBYUY7UUFDckMsc0VBQXNFO1FBQ3RFLElBQUksQ0FBQ1MsR0FBRyxDQUFFUixXQUFXQyxhQUFhLEdBQUdBLGFBQWEsSUFBSUYsY0FBY1UsS0FBS0MsRUFBRSxHQUFHLEdBQUcsQ0FBQ0QsS0FBS0MsRUFBRSxHQUFHLEdBQUc7UUFDL0YsSUFBSSxDQUFDSCxNQUFNLENBQUVILGVBQWVMO1FBQzVCLGdDQUFnQztRQUNoQyxJQUFJLENBQUNRLE1BQU0sQ0FBRUgsZUFBZUM7UUFDNUIsSUFBSSxDQUFDRSxNQUFNLENBQUUsQ0FBQ0gsZUFBZTtRQUM3QixJQUFJLENBQUNHLE1BQU0sQ0FBRUgsZUFBZSxDQUFDQztRQUM3QixJQUFJLENBQUNNLEtBQUs7SUFDWjtBQUNGO0FBbENBLFNBQXFCZiw2QkFrQ3BCO0FBRURELFlBQVlpQixRQUFRLENBQUUsbUJBQW1CaEIifQ==