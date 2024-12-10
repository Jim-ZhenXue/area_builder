// Copyright 2015-2024, University of Colorado Boulder
/**
 * Light rays that indicate brightness of a light source such as a bulb.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
// constants, these are specific to bulb images
const RAYS_START_ANGLE = 3 * Math.PI / 4;
const RAYS_ARC_ANGLE = 3 * Math.PI / 2;
let LightRaysNode = class LightRaysNode extends Path {
    /**
   * Sets the brightness, which updates the number and length of light rays.
   * @param brightness -a value in the range [0,1]
   */ setBrightness(brightness) {
        assert && assert(brightness >= 0 && brightness <= 1);
        // number of rays is a function of brightness
        const numberOfRays = brightness === 0 ? 0 : this.minRays + Utils.roundSymmetric(brightness * (this.maxRays - this.minRays));
        // ray length is a function of brightness
        const rayLength = this.minRayLength + brightness * (this.maxRayLength - this.minRayLength);
        let angle = RAYS_START_ANGLE;
        const deltaAngle = RAYS_ARC_ANGLE / (numberOfRays - 1);
        // The ray line width is a linear function within the allowed range
        const lineWidth = Utils.linear(0.3 * this.maxRayLength, 0.6 * this.maxRayLength, this.shortRayLineWidth, this.longRayLineWidth, rayLength);
        this.lineWidth = Utils.clamp(lineWidth, this.shortRayLineWidth, this.longRayLineWidth);
        const shape = new Shape();
        // rays fill part of a circle, incrementing clockwise
        for(let i = 0, x1, x2, y1, y2, cosAngle, sinAngle; i < this.maxRays; i++){
            if (i < numberOfRays) {
                cosAngle = Math.cos(angle);
                sinAngle = Math.sin(angle);
                // determine the end points of the ray
                x1 = cosAngle * this.bulbRadius;
                y1 = sinAngle * this.bulbRadius;
                x2 = cosAngle * (this.bulbRadius + rayLength);
                y2 = sinAngle * (this.bulbRadius + rayLength);
                shape.moveTo(x1, y1).lineTo(x2, y2);
                // increment the angle
                angle += deltaAngle;
            }
        }
        // Set shape to an invisible circle to maintain local bounds if there aren't any rays.
        this.setVisible(numberOfRays > 0);
        if (numberOfRays === 0) {
            shape.circle(0, 0, this.bulbRadius);
        }
        // Set the shape of the path to the shape created above
        this.setShape(shape);
    }
    constructor(bulbRadius, provideOptions){
        assert && assert(bulbRadius > 0);
        const options = optionize()({
            // LightRaysNodeOptions
            minRays: 8,
            maxRays: 60,
            minRayLength: 0,
            maxRayLength: 200,
            longRayLineWidth: 1.5,
            mediumRayLineWidth: 1,
            shortRayLineWidth: 0.5,
            // PathOptions
            stroke: 'yellow'
        }, provideOptions);
        super(null);
        this.bulbRadius = bulbRadius;
        this.minRays = options.minRays;
        this.maxRays = options.maxRays;
        this.minRayLength = options.minRayLength;
        this.maxRayLength = options.maxRayLength;
        this.mediumRayLineWidth = options.mediumRayLineWidth;
        this.longRayLineWidth = options.longRayLineWidth;
        this.shortRayLineWidth = options.shortRayLineWidth;
        // Ensures there are well-defined bounds at initialization
        this.setBrightness(0);
        this.mutate(options);
    }
};
export { LightRaysNode as default };
sceneryPhet.register('LightRaysNode', LightRaysNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MaWdodFJheXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpZ2h0IHJheXMgdGhhdCBpbmRpY2F0ZSBicmlnaHRuZXNzIG9mIGEgbGlnaHQgc291cmNlIHN1Y2ggYXMgYSBidWxiLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgUGF0aCwgUGF0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHMsIHRoZXNlIGFyZSBzcGVjaWZpYyB0byBidWxiIGltYWdlc1xuY29uc3QgUkFZU19TVEFSVF9BTkdMRSA9IDMgKiBNYXRoLlBJIC8gNDtcbmNvbnN0IFJBWVNfQVJDX0FOR0xFID0gMyAqIE1hdGguUEkgLyAyO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBtaW5SYXlzPzogbnVtYmVyO1xuICBtYXhSYXlzPzogbnVtYmVyO1xuICBtaW5SYXlMZW5ndGg/OiBudW1iZXI7XG4gIG1heFJheUxlbmd0aD86IG51bWJlcjtcbiAgbG9uZ1JheUxpbmVXaWR0aD86IG51bWJlcjsgLy8gZm9yIGxvbmcgcmF5c1xuICBtZWRpdW1SYXlMaW5lV2lkdGg/OiBudW1iZXI7IC8vIGZvciBtZWRpdW0tbGVuZ3RoIHJheXNcbiAgc2hvcnRSYXlMaW5lV2lkdGg/OiBudW1iZXI7IC8vIGZvciBzaG9ydCByYXlzXG59O1xuXG5leHBvcnQgdHlwZSBMaWdodFJheXNOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGF0aE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpZ2h0UmF5c05vZGUgZXh0ZW5kcyBQYXRoIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGJ1bGJSYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBtaW5SYXlzOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWF4UmF5czogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IG1pblJheUxlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IG1heFJheUxlbmd0aDogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IGxvbmdSYXlMaW5lV2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBtZWRpdW1SYXlMaW5lV2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBzaG9ydFJheUxpbmVXaWR0aDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYnVsYlJhZGl1czogbnVtYmVyLCBwcm92aWRlT3B0aW9ucz86IExpZ2h0UmF5c05vZGVPcHRpb25zICkge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYnVsYlJhZGl1cyA+IDAgKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGlnaHRSYXlzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBMaWdodFJheXNOb2RlT3B0aW9uc1xuICAgICAgbWluUmF5czogOCxcbiAgICAgIG1heFJheXM6IDYwLFxuICAgICAgbWluUmF5TGVuZ3RoOiAwLFxuICAgICAgbWF4UmF5TGVuZ3RoOiAyMDAsXG4gICAgICBsb25nUmF5TGluZVdpZHRoOiAxLjUsIC8vIGZvciBsb25nIHJheXNcbiAgICAgIG1lZGl1bVJheUxpbmVXaWR0aDogMSwgLy8gZm9yIG1lZGl1bS1sZW5ndGggcmF5c1xuICAgICAgc2hvcnRSYXlMaW5lV2lkdGg6IDAuNSwgLy8gZm9yIHNob3J0IHJheXNcblxuICAgICAgLy8gUGF0aE9wdGlvbnNcbiAgICAgIHN0cm9rZTogJ3llbGxvdydcbiAgICB9LCBwcm92aWRlT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG51bGwgKTtcblxuICAgIHRoaXMuYnVsYlJhZGl1cyA9IGJ1bGJSYWRpdXM7XG4gICAgdGhpcy5taW5SYXlzID0gb3B0aW9ucy5taW5SYXlzO1xuICAgIHRoaXMubWF4UmF5cyA9IG9wdGlvbnMubWF4UmF5cztcbiAgICB0aGlzLm1pblJheUxlbmd0aCA9IG9wdGlvbnMubWluUmF5TGVuZ3RoO1xuICAgIHRoaXMubWF4UmF5TGVuZ3RoID0gb3B0aW9ucy5tYXhSYXlMZW5ndGg7XG4gICAgdGhpcy5tZWRpdW1SYXlMaW5lV2lkdGggPSBvcHRpb25zLm1lZGl1bVJheUxpbmVXaWR0aDtcbiAgICB0aGlzLmxvbmdSYXlMaW5lV2lkdGggPSBvcHRpb25zLmxvbmdSYXlMaW5lV2lkdGg7XG4gICAgdGhpcy5zaG9ydFJheUxpbmVXaWR0aCA9IG9wdGlvbnMuc2hvcnRSYXlMaW5lV2lkdGg7XG5cbiAgICAvLyBFbnN1cmVzIHRoZXJlIGFyZSB3ZWxsLWRlZmluZWQgYm91bmRzIGF0IGluaXRpYWxpemF0aW9uXG4gICAgdGhpcy5zZXRCcmlnaHRuZXNzKCAwICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJyaWdodG5lc3MsIHdoaWNoIHVwZGF0ZXMgdGhlIG51bWJlciBhbmQgbGVuZ3RoIG9mIGxpZ2h0IHJheXMuXG4gICAqIEBwYXJhbSBicmlnaHRuZXNzIC1hIHZhbHVlIGluIHRoZSByYW5nZSBbMCwxXVxuICAgKi9cbiAgcHVibGljIHNldEJyaWdodG5lc3MoIGJyaWdodG5lc3M6IG51bWJlciApOiB2b2lkIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJyaWdodG5lc3MgPj0gMCAmJiBicmlnaHRuZXNzIDw9IDEgKTtcblxuICAgIC8vIG51bWJlciBvZiByYXlzIGlzIGEgZnVuY3Rpb24gb2YgYnJpZ2h0bmVzc1xuICAgIGNvbnN0IG51bWJlck9mUmF5cyA9ICggYnJpZ2h0bmVzcyA9PT0gMCApID8gMCA6IHRoaXMubWluUmF5cyArIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBicmlnaHRuZXNzICogKCB0aGlzLm1heFJheXMgLSB0aGlzLm1pblJheXMgKSApO1xuXG4gICAgLy8gcmF5IGxlbmd0aCBpcyBhIGZ1bmN0aW9uIG9mIGJyaWdodG5lc3NcbiAgICBjb25zdCByYXlMZW5ndGggPSB0aGlzLm1pblJheUxlbmd0aCArICggYnJpZ2h0bmVzcyAqICggdGhpcy5tYXhSYXlMZW5ndGggLSB0aGlzLm1pblJheUxlbmd0aCApICk7XG5cbiAgICBsZXQgYW5nbGUgPSBSQVlTX1NUQVJUX0FOR0xFO1xuICAgIGNvbnN0IGRlbHRhQW5nbGUgPSBSQVlTX0FSQ19BTkdMRSAvICggbnVtYmVyT2ZSYXlzIC0gMSApO1xuXG4gICAgLy8gVGhlIHJheSBsaW5lIHdpZHRoIGlzIGEgbGluZWFyIGZ1bmN0aW9uIHdpdGhpbiB0aGUgYWxsb3dlZCByYW5nZVxuICAgIGNvbnN0IGxpbmVXaWR0aCA9IFV0aWxzLmxpbmVhcihcbiAgICAgIDAuMyAqIHRoaXMubWF4UmF5TGVuZ3RoLFxuICAgICAgMC42ICogdGhpcy5tYXhSYXlMZW5ndGgsXG4gICAgICB0aGlzLnNob3J0UmF5TGluZVdpZHRoLFxuICAgICAgdGhpcy5sb25nUmF5TGluZVdpZHRoLFxuICAgICAgcmF5TGVuZ3RoXG4gICAgKTtcbiAgICB0aGlzLmxpbmVXaWR0aCA9IFV0aWxzLmNsYW1wKCBsaW5lV2lkdGgsIHRoaXMuc2hvcnRSYXlMaW5lV2lkdGgsIHRoaXMubG9uZ1JheUxpbmVXaWR0aCApO1xuXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKTtcblxuICAgIC8vIHJheXMgZmlsbCBwYXJ0IG9mIGEgY2lyY2xlLCBpbmNyZW1lbnRpbmcgY2xvY2t3aXNlXG4gICAgZm9yICggbGV0IGkgPSAwLCB4MSwgeDIsIHkxLCB5MiwgY29zQW5nbGUsIHNpbkFuZ2xlOyBpIDwgdGhpcy5tYXhSYXlzOyBpKysgKSB7XG4gICAgICBpZiAoIGkgPCBudW1iZXJPZlJheXMgKSB7XG5cbiAgICAgICAgY29zQW5nbGUgPSBNYXRoLmNvcyggYW5nbGUgKTtcbiAgICAgICAgc2luQW5nbGUgPSBNYXRoLnNpbiggYW5nbGUgKTtcblxuICAgICAgICAvLyBkZXRlcm1pbmUgdGhlIGVuZCBwb2ludHMgb2YgdGhlIHJheVxuICAgICAgICB4MSA9IGNvc0FuZ2xlICogdGhpcy5idWxiUmFkaXVzO1xuICAgICAgICB5MSA9IHNpbkFuZ2xlICogdGhpcy5idWxiUmFkaXVzO1xuICAgICAgICB4MiA9IGNvc0FuZ2xlICogKCB0aGlzLmJ1bGJSYWRpdXMgKyByYXlMZW5ndGggKTtcbiAgICAgICAgeTIgPSBzaW5BbmdsZSAqICggdGhpcy5idWxiUmFkaXVzICsgcmF5TGVuZ3RoICk7XG5cbiAgICAgICAgc2hhcGUubW92ZVRvKCB4MSwgeTEgKS5saW5lVG8oIHgyLCB5MiApO1xuXG4gICAgICAgIC8vIGluY3JlbWVudCB0aGUgYW5nbGVcbiAgICAgICAgYW5nbGUgKz0gZGVsdGFBbmdsZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgc2hhcGUgdG8gYW4gaW52aXNpYmxlIGNpcmNsZSB0byBtYWludGFpbiBsb2NhbCBib3VuZHMgaWYgdGhlcmUgYXJlbid0IGFueSByYXlzLlxuICAgIHRoaXMuc2V0VmlzaWJsZSggbnVtYmVyT2ZSYXlzID4gMCApO1xuICAgIGlmICggbnVtYmVyT2ZSYXlzID09PSAwICkge1xuICAgICAgc2hhcGUuY2lyY2xlKCAwLCAwLCB0aGlzLmJ1bGJSYWRpdXMgKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHNoYXBlIG9mIHRoZSBwYXRoIHRvIHRoZSBzaGFwZSBjcmVhdGVkIGFib3ZlXG4gICAgdGhpcy5zZXRTaGFwZSggc2hhcGUgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0xpZ2h0UmF5c05vZGUnLCBMaWdodFJheXNOb2RlICk7Il0sIm5hbWVzIjpbIlV0aWxzIiwiU2hhcGUiLCJvcHRpb25pemUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJSQVlTX1NUQVJUX0FOR0xFIiwiTWF0aCIsIlBJIiwiUkFZU19BUkNfQU5HTEUiLCJMaWdodFJheXNOb2RlIiwic2V0QnJpZ2h0bmVzcyIsImJyaWdodG5lc3MiLCJhc3NlcnQiLCJudW1iZXJPZlJheXMiLCJtaW5SYXlzIiwicm91bmRTeW1tZXRyaWMiLCJtYXhSYXlzIiwicmF5TGVuZ3RoIiwibWluUmF5TGVuZ3RoIiwibWF4UmF5TGVuZ3RoIiwiYW5nbGUiLCJkZWx0YUFuZ2xlIiwibGluZVdpZHRoIiwibGluZWFyIiwic2hvcnRSYXlMaW5lV2lkdGgiLCJsb25nUmF5TGluZVdpZHRoIiwiY2xhbXAiLCJzaGFwZSIsImkiLCJ4MSIsIngyIiwieTEiLCJ5MiIsImNvc0FuZ2xlIiwic2luQW5nbGUiLCJjb3MiLCJzaW4iLCJidWxiUmFkaXVzIiwibW92ZVRvIiwibGluZVRvIiwic2V0VmlzaWJsZSIsImNpcmNsZSIsInNldFNoYXBlIiwicHJvdmlkZU9wdGlvbnMiLCJvcHRpb25zIiwibWVkaXVtUmF5TGluZVdpZHRoIiwic3Ryb2tlIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsV0FBVyx3QkFBd0I7QUFDMUMsU0FBU0MsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxTQUFTQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUNoRSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLCtDQUErQztBQUMvQyxNQUFNQyxtQkFBbUIsSUFBSUMsS0FBS0MsRUFBRSxHQUFHO0FBQ3ZDLE1BQU1DLGlCQUFpQixJQUFJRixLQUFLQyxFQUFFLEdBQUc7QUFjdEIsSUFBQSxBQUFNRSxnQkFBTixNQUFNQSxzQkFBc0JOO0lBK0N6Qzs7O0dBR0MsR0FDRCxBQUFPTyxjQUFlQyxVQUFrQixFQUFTO1FBRS9DQyxVQUFVQSxPQUFRRCxjQUFjLEtBQUtBLGNBQWM7UUFFbkQsNkNBQTZDO1FBQzdDLE1BQU1FLGVBQWUsQUFBRUYsZUFBZSxJQUFNLElBQUksSUFBSSxDQUFDRyxPQUFPLEdBQUdkLE1BQU1lLGNBQWMsQ0FBRUosYUFBZSxDQUFBLElBQUksQ0FBQ0ssT0FBTyxHQUFHLElBQUksQ0FBQ0YsT0FBTyxBQUFEO1FBRTlILHlDQUF5QztRQUN6QyxNQUFNRyxZQUFZLElBQUksQ0FBQ0MsWUFBWSxHQUFLUCxhQUFlLENBQUEsSUFBSSxDQUFDUSxZQUFZLEdBQUcsSUFBSSxDQUFDRCxZQUFZLEFBQUQ7UUFFM0YsSUFBSUUsUUFBUWY7UUFDWixNQUFNZ0IsYUFBYWIsaUJBQW1CSyxDQUFBQSxlQUFlLENBQUE7UUFFckQsbUVBQW1FO1FBQ25FLE1BQU1TLFlBQVl0QixNQUFNdUIsTUFBTSxDQUM1QixNQUFNLElBQUksQ0FBQ0osWUFBWSxFQUN2QixNQUFNLElBQUksQ0FBQ0EsWUFBWSxFQUN2QixJQUFJLENBQUNLLGlCQUFpQixFQUN0QixJQUFJLENBQUNDLGdCQUFnQixFQUNyQlI7UUFFRixJQUFJLENBQUNLLFNBQVMsR0FBR3RCLE1BQU0wQixLQUFLLENBQUVKLFdBQVcsSUFBSSxDQUFDRSxpQkFBaUIsRUFBRSxJQUFJLENBQUNDLGdCQUFnQjtRQUV0RixNQUFNRSxRQUFRLElBQUkxQjtRQUVsQixxREFBcUQ7UUFDckQsSUFBTSxJQUFJMkIsSUFBSSxHQUFHQyxJQUFJQyxJQUFJQyxJQUFJQyxJQUFJQyxVQUFVQyxVQUFVTixJQUFJLElBQUksQ0FBQ1osT0FBTyxFQUFFWSxJQUFNO1lBQzNFLElBQUtBLElBQUlmLGNBQWU7Z0JBRXRCb0IsV0FBVzNCLEtBQUs2QixHQUFHLENBQUVmO2dCQUNyQmMsV0FBVzVCLEtBQUs4QixHQUFHLENBQUVoQjtnQkFFckIsc0NBQXNDO2dCQUN0Q1MsS0FBS0ksV0FBVyxJQUFJLENBQUNJLFVBQVU7Z0JBQy9CTixLQUFLRyxXQUFXLElBQUksQ0FBQ0csVUFBVTtnQkFDL0JQLEtBQUtHLFdBQWEsQ0FBQSxJQUFJLENBQUNJLFVBQVUsR0FBR3BCLFNBQVE7Z0JBQzVDZSxLQUFLRSxXQUFhLENBQUEsSUFBSSxDQUFDRyxVQUFVLEdBQUdwQixTQUFRO2dCQUU1Q1UsTUFBTVcsTUFBTSxDQUFFVCxJQUFJRSxJQUFLUSxNQUFNLENBQUVULElBQUlFO2dCQUVuQyxzQkFBc0I7Z0JBQ3RCWixTQUFTQztZQUNYO1FBQ0Y7UUFFQSxzRkFBc0Y7UUFDdEYsSUFBSSxDQUFDbUIsVUFBVSxDQUFFM0IsZUFBZTtRQUNoQyxJQUFLQSxpQkFBaUIsR0FBSTtZQUN4QmMsTUFBTWMsTUFBTSxDQUFFLEdBQUcsR0FBRyxJQUFJLENBQUNKLFVBQVU7UUFDckM7UUFFQSx1REFBdUQ7UUFDdkQsSUFBSSxDQUFDSyxRQUFRLENBQUVmO0lBQ2pCO0lBN0ZBLFlBQW9CVSxVQUFrQixFQUFFTSxjQUFxQyxDQUFHO1FBRTlFL0IsVUFBVUEsT0FBUXlCLGFBQWE7UUFFL0IsTUFBTU8sVUFBVTFDLFlBQTZEO1lBRTNFLHVCQUF1QjtZQUN2QlksU0FBUztZQUNURSxTQUFTO1lBQ1RFLGNBQWM7WUFDZEMsY0FBYztZQUNkTSxrQkFBa0I7WUFDbEJvQixvQkFBb0I7WUFDcEJyQixtQkFBbUI7WUFFbkIsY0FBYztZQUNkc0IsUUFBUTtRQUNWLEdBQUdIO1FBRUgsS0FBSyxDQUFFO1FBRVAsSUFBSSxDQUFDTixVQUFVLEdBQUdBO1FBQ2xCLElBQUksQ0FBQ3ZCLE9BQU8sR0FBRzhCLFFBQVE5QixPQUFPO1FBQzlCLElBQUksQ0FBQ0UsT0FBTyxHQUFHNEIsUUFBUTVCLE9BQU87UUFDOUIsSUFBSSxDQUFDRSxZQUFZLEdBQUcwQixRQUFRMUIsWUFBWTtRQUN4QyxJQUFJLENBQUNDLFlBQVksR0FBR3lCLFFBQVF6QixZQUFZO1FBQ3hDLElBQUksQ0FBQzBCLGtCQUFrQixHQUFHRCxRQUFRQyxrQkFBa0I7UUFDcEQsSUFBSSxDQUFDcEIsZ0JBQWdCLEdBQUdtQixRQUFRbkIsZ0JBQWdCO1FBQ2hELElBQUksQ0FBQ0QsaUJBQWlCLEdBQUdvQixRQUFRcEIsaUJBQWlCO1FBRWxELDBEQUEwRDtRQUMxRCxJQUFJLENBQUNkLGFBQWEsQ0FBRTtRQUVwQixJQUFJLENBQUNxQyxNQUFNLENBQUVIO0lBQ2Y7QUE0REY7QUF6R0EsU0FBcUJuQywyQkF5R3BCO0FBRURMLFlBQVk0QyxRQUFRLENBQUUsaUJBQWlCdkMifQ==