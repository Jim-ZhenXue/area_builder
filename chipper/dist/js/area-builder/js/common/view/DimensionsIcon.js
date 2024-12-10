// Copyright 2014-2022, University of Colorado Boulder
/**
 * A Scenery node that depicts a basic shape with its dimensions labeled, intended for use in control panels.  It
 * includes an overlying grid that can be turned on or off.
 *
 * @author John Blanco
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import Grid from './Grid.js';
// constants
const UNIT_LENGTH = 10; // in screen coordinates
const WIDTH = 3 * UNIT_LENGTH;
const HEIGHT = 2 * UNIT_LENGTH; // in screen coordinates
const LABEL_FONT = new PhetFont(10);
const DEFAULT_FILL_COLOR = AreaBuilderSharedConstants.GREENISH_COLOR;
let DimensionsIcon = class DimensionsIcon extends Node {
    /**
   * @param {boolean} gridVisible
   * @public
   */ setGridVisible(gridVisible) {
        assert && assert(typeof gridVisible === 'boolean');
        this.grid.visible = gridVisible;
    }
    /**
   * @param color
   * @public
   */ setColor(color) {
        this.singleRectNode.fill = color;
        const strokeColor = Color.toColor(color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);
        this.singleRectNode.stroke = strokeColor;
        this.grid.stroke = strokeColor;
    }
    /**
   * @param {Object} [options]
   */ constructor(options){
        super();
        // Create the background rectangle node.
        this.singleRectNode = new Rectangle(0, 0, WIDTH, HEIGHT, 0, 0);
        this.addChild(this.singleRectNode);
        // Add the grid.
        this.grid = new Grid(new Bounds2(0, 0, WIDTH, HEIGHT), UNIT_LENGTH, {
            stroke: '#b0b0b0',
            lineDash: [
                1,
                2
            ]
        });
        this.addChild(this.grid);
        // Initialize the color.
        this.setColor(DEFAULT_FILL_COLOR);
        // Label the sides.
        this.addChild(new Text('2', {
            font: LABEL_FONT,
            right: -2,
            centerY: HEIGHT / 2
        }));
        this.addChild(new Text('2', {
            font: LABEL_FONT,
            left: WIDTH + 2,
            centerY: HEIGHT / 2
        }));
        this.addChild(new Text('3', {
            font: LABEL_FONT,
            centerX: WIDTH / 2,
            bottom: 0
        }));
        this.addChild(new Text('3', {
            font: LABEL_FONT,
            centerX: WIDTH / 2,
            top: HEIGHT
        }));
        // Pass through any options.
        this.mutate(options);
    }
};
areaBuilder.register('DimensionsIcon', DimensionsIcon);
export default DimensionsIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9EaW1lbnNpb25zSWNvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjZW5lcnkgbm9kZSB0aGF0IGRlcGljdHMgYSBiYXNpYyBzaGFwZSB3aXRoIGl0cyBkaW1lbnNpb25zIGxhYmVsZWQsIGludGVuZGVkIGZvciB1c2UgaW4gY29udHJvbCBwYW5lbHMuICBJdFxuICogaW5jbHVkZXMgYW4gb3Zlcmx5aW5nIGdyaWQgdGhhdCBjYW4gYmUgdHVybmVkIG9uIG9yIG9mZi5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMgZnJvbSAnLi4vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuaW1wb3J0IEdyaWQgZnJvbSAnLi9HcmlkLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBVTklUX0xFTkdUSCA9IDEwOyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbmNvbnN0IFdJRFRIID0gMyAqIFVOSVRfTEVOR1RIO1xuY29uc3QgSEVJR0hUID0gMiAqIFVOSVRfTEVOR1RIOyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDEwICk7XG5jb25zdCBERUZBVUxUX0ZJTExfQ09MT1IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUjtcblxuY2xhc3MgRGltZW5zaW9uc0ljb24gZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgYmFja2dyb3VuZCByZWN0YW5nbGUgbm9kZS5cbiAgICB0aGlzLnNpbmdsZVJlY3ROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgV0lEVEgsIEhFSUdIVCwgMCwgMCApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc2luZ2xlUmVjdE5vZGUgKTtcblxuICAgIC8vIEFkZCB0aGUgZ3JpZC5cbiAgICB0aGlzLmdyaWQgPSBuZXcgR3JpZCggbmV3IEJvdW5kczIoIDAsIDAsIFdJRFRILCBIRUlHSFQgKSwgVU5JVF9MRU5HVEgsIHsgc3Ryb2tlOiAnI2IwYjBiMCcsIGxpbmVEYXNoOiBbIDEsIDIgXSB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ncmlkICk7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBjb2xvci5cbiAgICB0aGlzLnNldENvbG9yKCBERUZBVUxUX0ZJTExfQ09MT1IgKTtcblxuICAgIC8vIExhYmVsIHRoZSBzaWRlcy5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVGV4dCggJzInLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIHJpZ2h0OiAtMiwgY2VudGVyWTogSEVJR0hUIC8gMiB9ICkgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVGV4dCggJzInLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIGxlZnQ6IFdJRFRIICsgMiwgY2VudGVyWTogSEVJR0hUIC8gMiB9ICkgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVGV4dCggJzMnLCB7IGZvbnQ6IExBQkVMX0ZPTlQsIGNlbnRlclg6IFdJRFRIIC8gMiwgYm90dG9tOiAwIH0gKSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnMycsIHsgZm9udDogTEFCRUxfRk9OVCwgY2VudGVyWDogV0lEVEggLyAyLCB0b3A6IEhFSUdIVCB9ICkgKTtcblxuICAgIC8vIFBhc3MgdGhyb3VnaCBhbnkgb3B0aW9ucy5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZ3JpZFZpc2libGVcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2V0R3JpZFZpc2libGUoIGdyaWRWaXNpYmxlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiAoIGdyaWRWaXNpYmxlICkgPT09ICdib29sZWFuJyApO1xuICAgIHRoaXMuZ3JpZC52aXNpYmxlID0gZ3JpZFZpc2libGU7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIGNvbG9yXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHNldENvbG9yKCBjb2xvciApIHtcbiAgICB0aGlzLnNpbmdsZVJlY3ROb2RlLmZpbGwgPSBjb2xvcjtcbiAgICBjb25zdCBzdHJva2VDb2xvciA9IENvbG9yLnRvQ29sb3IoIGNvbG9yICkuY29sb3JVdGlsc0RhcmtlciggQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuUEVSSU1FVEVSX0RBUktFTl9GQUNUT1IgKTtcbiAgICB0aGlzLnNpbmdsZVJlY3ROb2RlLnN0cm9rZSA9IHN0cm9rZUNvbG9yO1xuICAgIHRoaXMuZ3JpZC5zdHJva2UgPSBzdHJva2VDb2xvcjtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0RpbWVuc2lvbnNJY29uJywgRGltZW5zaW9uc0ljb24gKTtcbmV4cG9ydCBkZWZhdWx0IERpbWVuc2lvbnNJY29uOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiUGhldEZvbnQiLCJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyIsIkdyaWQiLCJVTklUX0xFTkdUSCIsIldJRFRIIiwiSEVJR0hUIiwiTEFCRUxfRk9OVCIsIkRFRkFVTFRfRklMTF9DT0xPUiIsIkdSRUVOSVNIX0NPTE9SIiwiRGltZW5zaW9uc0ljb24iLCJzZXRHcmlkVmlzaWJsZSIsImdyaWRWaXNpYmxlIiwiYXNzZXJ0IiwiZ3JpZCIsInZpc2libGUiLCJzZXRDb2xvciIsImNvbG9yIiwic2luZ2xlUmVjdE5vZGUiLCJmaWxsIiwic3Ryb2tlQ29sb3IiLCJ0b0NvbG9yIiwiY29sb3JVdGlsc0RhcmtlciIsIlBFUklNRVRFUl9EQVJLRU5fRkFDVE9SIiwic3Ryb2tlIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiYWRkQ2hpbGQiLCJsaW5lRGFzaCIsImZvbnQiLCJyaWdodCIsImNlbnRlclkiLCJsZWZ0IiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLDBDQUEwQztBQUMvRCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ2pGLE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsZ0NBQWdDLG1DQUFtQztBQUMxRSxPQUFPQyxVQUFVLFlBQVk7QUFFN0IsWUFBWTtBQUNaLE1BQU1DLGNBQWMsSUFBSSx3QkFBd0I7QUFDaEQsTUFBTUMsUUFBUSxJQUFJRDtBQUNsQixNQUFNRSxTQUFTLElBQUlGLGFBQWEsd0JBQXdCO0FBQ3hELE1BQU1HLGFBQWEsSUFBSVgsU0FBVTtBQUNqQyxNQUFNWSxxQkFBcUJOLDJCQUEyQk8sY0FBYztBQUVwRSxJQUFBLEFBQU1DLGlCQUFOLE1BQU1BLHVCQUF1Qlo7SUE2QjNCOzs7R0FHQyxHQUNEYSxlQUFnQkMsV0FBVyxFQUFHO1FBQzVCQyxVQUFVQSxPQUFRLE9BQVNELGdCQUFrQjtRQUM3QyxJQUFJLENBQUNFLElBQUksQ0FBQ0MsT0FBTyxHQUFHSDtJQUN0QjtJQUVBOzs7R0FHQyxHQUNESSxTQUFVQyxLQUFLLEVBQUc7UUFDaEIsSUFBSSxDQUFDQyxjQUFjLENBQUNDLElBQUksR0FBR0Y7UUFDM0IsTUFBTUcsY0FBY3ZCLE1BQU13QixPQUFPLENBQUVKLE9BQVFLLGdCQUFnQixDQUFFcEIsMkJBQTJCcUIsdUJBQXVCO1FBQy9HLElBQUksQ0FBQ0wsY0FBYyxDQUFDTSxNQUFNLEdBQUdKO1FBQzdCLElBQUksQ0FBQ04sSUFBSSxDQUFDVSxNQUFNLEdBQUdKO0lBQ3JCO0lBN0NBOztHQUVDLEdBQ0RLLFlBQWFDLE9BQU8sQ0FBRztRQUNyQixLQUFLO1FBRUwsd0NBQXdDO1FBQ3hDLElBQUksQ0FBQ1IsY0FBYyxHQUFHLElBQUluQixVQUFXLEdBQUcsR0FBR00sT0FBT0MsUUFBUSxHQUFHO1FBQzdELElBQUksQ0FBQ3FCLFFBQVEsQ0FBRSxJQUFJLENBQUNULGNBQWM7UUFFbEMsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQ0osSUFBSSxHQUFHLElBQUlYLEtBQU0sSUFBSVIsUUFBUyxHQUFHLEdBQUdVLE9BQU9DLFNBQVVGLGFBQWE7WUFBRW9CLFFBQVE7WUFBV0ksVUFBVTtnQkFBRTtnQkFBRzthQUFHO1FBQUM7UUFDL0csSUFBSSxDQUFDRCxRQUFRLENBQUUsSUFBSSxDQUFDYixJQUFJO1FBRXhCLHdCQUF3QjtRQUN4QixJQUFJLENBQUNFLFFBQVEsQ0FBRVI7UUFFZixtQkFBbUI7UUFDbkIsSUFBSSxDQUFDbUIsUUFBUSxDQUFFLElBQUkzQixLQUFNLEtBQUs7WUFBRTZCLE1BQU10QjtZQUFZdUIsT0FBTyxDQUFDO1lBQUdDLFNBQVN6QixTQUFTO1FBQUU7UUFDakYsSUFBSSxDQUFDcUIsUUFBUSxDQUFFLElBQUkzQixLQUFNLEtBQUs7WUFBRTZCLE1BQU10QjtZQUFZeUIsTUFBTTNCLFFBQVE7WUFBRzBCLFNBQVN6QixTQUFTO1FBQUU7UUFDdkYsSUFBSSxDQUFDcUIsUUFBUSxDQUFFLElBQUkzQixLQUFNLEtBQUs7WUFBRTZCLE1BQU10QjtZQUFZMEIsU0FBUzVCLFFBQVE7WUFBRzZCLFFBQVE7UUFBRTtRQUNoRixJQUFJLENBQUNQLFFBQVEsQ0FBRSxJQUFJM0IsS0FBTSxLQUFLO1lBQUU2QixNQUFNdEI7WUFBWTBCLFNBQVM1QixRQUFRO1lBQUc4QixLQUFLN0I7UUFBTztRQUVsRiw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDOEIsTUFBTSxDQUFFVjtJQUNmO0FBcUJGO0FBRUF6QixZQUFZb0MsUUFBUSxDQUFFLGtCQUFrQjNCO0FBQ3hDLGVBQWVBLGVBQWUifQ==