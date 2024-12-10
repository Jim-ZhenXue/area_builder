// Copyright 2015-2024, University of Colorado Boulder
/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Utils from '../../dot/js/Utils.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Image, Node } from '../../scenery/js/imports.js';
import lightBulbOff_png from '../mipmaps/lightBulbOff_png.js';
import lightBulbOn_png from '../mipmaps/lightBulbOn_png.js';
import LightRaysNode from './LightRaysNode.js';
import sceneryPhet from './sceneryPhet.js';
let LightBulbNode = class LightBulbNode extends Node {
    dispose() {
        this.disposeLightBulbNode();
        super.dispose();
    }
    /**
   * Updates the bulb. For performance, this is a no-op when the bulb is not visible.
   */ update() {
        if (this.visible) {
            const brightness = this.brightnessProperty.value;
            assert && assert(brightness >= 0 && brightness <= 1);
            this.onNode.visible = brightness > 0;
            if (this.onNode.visible) {
                this.onNode.opacity = Utils.linear(0, 1, 0.3, 1, brightness);
            }
            this.raysNode.setBrightness(brightness);
        }
    }
    /**
   * @param brightnessProperty - brightness of the bulb, 0 (off) to 1 (full brightness)
   * @param [providedOptions]
   */ constructor(brightnessProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            bulbImageScale: 0.33,
            lightBulbOnImage: lightBulbOn_png,
            lightBulbOffImage: lightBulbOff_png
        }, providedOptions);
        const onNode = new Image(options.lightBulbOnImage, {
            scale: options.bulbImageScale,
            centerX: 0,
            bottom: 0
        });
        const offNode = new Image(options.lightBulbOffImage, {
            scale: options.bulbImageScale,
            centerX: onNode.centerX,
            bottom: onNode.bottom
        });
        // rays
        const bulbRadius = offNode.width / 2; // use 'off' node, the 'on' node is wider because it has a glow around it.
        const raysNode = new LightRaysNode(bulbRadius, optionize()({
            x: onNode.centerX,
            y: offNode.top + bulbRadius
        }, options.lightRaysNodeOptions));
        options.children = [
            raysNode,
            offNode,
            onNode
        ];
        super(options);
        this.onNode = onNode;
        this.raysNode = raysNode;
        this.brightnessProperty = brightnessProperty;
        // Updates this Node when it becomes visible.
        this.visibleProperty.link((visible)=>visible && this.update());
        const brightnessObserver = (brightness)=>this.update();
        brightnessProperty.link(brightnessObserver);
        this.disposeLightBulbNode = ()=>{
            brightnessProperty.unlink(brightnessObserver);
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'LightBulbNode', this);
    }
};
export { LightBulbNode as default };
sceneryPhet.register('LightBulbNode', LightBulbNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MaWdodEJ1bGJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpZ2h0IGJ1bGIsIG1hZGUgdG8gJ2dsb3cnIGJ5IG1vZHVsYXRpbmcgb3BhY2l0eSBvZiB0aGUgJ29uJyBpbWFnZS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEltYWdlLCBJbWFnZWFibGVJbWFnZSwgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGxpZ2h0QnVsYk9mZl9wbmcgZnJvbSAnLi4vbWlwbWFwcy9saWdodEJ1bGJPZmZfcG5nLmpzJztcbmltcG9ydCBsaWdodEJ1bGJPbl9wbmcgZnJvbSAnLi4vbWlwbWFwcy9saWdodEJ1bGJPbl9wbmcuanMnO1xuaW1wb3J0IExpZ2h0UmF5c05vZGUsIHsgTGlnaHRSYXlzTm9kZU9wdGlvbnMgfSBmcm9tICcuL0xpZ2h0UmF5c05vZGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBidWxiSW1hZ2VTY2FsZT86IG51bWJlcjtcbiAgbGlnaHRSYXlzTm9kZU9wdGlvbnM/OiBMaWdodFJheXNOb2RlT3B0aW9ucztcbiAgbGlnaHRCdWxiT25JbWFnZT86IEltYWdlYWJsZUltYWdlO1xuICBsaWdodEJ1bGJPZmZJbWFnZT86IEltYWdlYWJsZUltYWdlO1xufTtcbmV4cG9ydCB0eXBlIExpZ2h0QnVsYk5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlnaHRCdWxiTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgb25Ob2RlOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IHJheXNOb2RlOiBMaWdodFJheXNOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGJyaWdodG5lc3NQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTGlnaHRCdWxiTm9kZTogKCkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIGJyaWdodG5lc3NQcm9wZXJ0eSAtIGJyaWdodG5lc3Mgb2YgdGhlIGJ1bGIsIDAgKG9mZikgdG8gMSAoZnVsbCBicmlnaHRuZXNzKVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYnJpZ2h0bmVzc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBMaWdodEJ1bGJOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGlnaHRCdWxiTm9kZU9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdsaWdodFJheXNOb2RlT3B0aW9ucyc+LCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgYnVsYkltYWdlU2NhbGU6IDAuMzMsXG4gICAgICBsaWdodEJ1bGJPbkltYWdlOiBsaWdodEJ1bGJPbl9wbmcsXG4gICAgICBsaWdodEJ1bGJPZmZJbWFnZTogbGlnaHRCdWxiT2ZmX3BuZ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgb25Ob2RlID0gbmV3IEltYWdlKCBvcHRpb25zLmxpZ2h0QnVsYk9uSW1hZ2UsIHtcbiAgICAgIHNjYWxlOiBvcHRpb25zLmJ1bGJJbWFnZVNjYWxlLFxuICAgICAgY2VudGVyWDogMCxcbiAgICAgIGJvdHRvbTogMFxuICAgIH0gKTtcblxuICAgIGNvbnN0IG9mZk5vZGUgPSBuZXcgSW1hZ2UoIG9wdGlvbnMubGlnaHRCdWxiT2ZmSW1hZ2UsIHtcbiAgICAgIHNjYWxlOiBvcHRpb25zLmJ1bGJJbWFnZVNjYWxlLFxuICAgICAgY2VudGVyWDogb25Ob2RlLmNlbnRlclgsXG4gICAgICBib3R0b206IG9uTm9kZS5ib3R0b21cbiAgICB9ICk7XG5cbiAgICAvLyByYXlzXG4gICAgY29uc3QgYnVsYlJhZGl1cyA9IG9mZk5vZGUud2lkdGggLyAyOyAvLyB1c2UgJ29mZicgbm9kZSwgdGhlICdvbicgbm9kZSBpcyB3aWRlciBiZWNhdXNlIGl0IGhhcyBhIGdsb3cgYXJvdW5kIGl0LlxuICAgIGNvbnN0IHJheXNOb2RlID0gbmV3IExpZ2h0UmF5c05vZGUoIGJ1bGJSYWRpdXMsXG4gICAgICBvcHRpb25pemU8TGlnaHRSYXlzTm9kZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIExpZ2h0UmF5c05vZGVPcHRpb25zPigpKCB7XG4gICAgICAgIHg6IG9uTm9kZS5jZW50ZXJYLFxuICAgICAgICB5OiBvZmZOb2RlLnRvcCArIGJ1bGJSYWRpdXNcbiAgICAgIH0sIG9wdGlvbnMubGlnaHRSYXlzTm9kZU9wdGlvbnMgKSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgcmF5c05vZGUsIG9mZk5vZGUsIG9uTm9kZSBdO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMub25Ob2RlID0gb25Ob2RlO1xuICAgIHRoaXMucmF5c05vZGUgPSByYXlzTm9kZTtcbiAgICB0aGlzLmJyaWdodG5lc3NQcm9wZXJ0eSA9IGJyaWdodG5lc3NQcm9wZXJ0eTtcblxuICAgIC8vIFVwZGF0ZXMgdGhpcyBOb2RlIHdoZW4gaXQgYmVjb21lcyB2aXNpYmxlLlxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4gdmlzaWJsZSAmJiB0aGlzLnVwZGF0ZSgpICk7XG5cbiAgICBjb25zdCBicmlnaHRuZXNzT2JzZXJ2ZXIgPSAoIGJyaWdodG5lc3M6IG51bWJlciApID0+IHRoaXMudXBkYXRlKCk7XG4gICAgYnJpZ2h0bmVzc1Byb3BlcnR5LmxpbmsoIGJyaWdodG5lc3NPYnNlcnZlciApO1xuXG4gICAgdGhpcy5kaXNwb3NlTGlnaHRCdWxiTm9kZSA9ICgpID0+IHtcbiAgICAgIGJyaWdodG5lc3NQcm9wZXJ0eS51bmxpbmsoIGJyaWdodG5lc3NPYnNlcnZlciApO1xuICAgIH07XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0xpZ2h0QnVsYk5vZGUnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VMaWdodEJ1bGJOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGJ1bGIuIEZvciBwZXJmb3JtYW5jZSwgdGhpcyBpcyBhIG5vLW9wIHdoZW4gdGhlIGJ1bGIgaXMgbm90IHZpc2libGUuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMudmlzaWJsZSApIHtcbiAgICAgIGNvbnN0IGJyaWdodG5lc3MgPSB0aGlzLmJyaWdodG5lc3NQcm9wZXJ0eS52YWx1ZTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJyaWdodG5lc3MgPj0gMCAmJiBicmlnaHRuZXNzIDw9IDEgKTtcbiAgICAgIHRoaXMub25Ob2RlLnZpc2libGUgPSAoIGJyaWdodG5lc3MgPiAwICk7XG4gICAgICBpZiAoIHRoaXMub25Ob2RlLnZpc2libGUgKSB7XG4gICAgICAgIHRoaXMub25Ob2RlLm9wYWNpdHkgPSBVdGlscy5saW5lYXIoIDAsIDEsIDAuMywgMSwgYnJpZ2h0bmVzcyApO1xuICAgICAgfVxuICAgICAgdGhpcy5yYXlzTm9kZS5zZXRCcmlnaHRuZXNzKCBicmlnaHRuZXNzICk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnTGlnaHRCdWxiTm9kZScsIExpZ2h0QnVsYk5vZGUgKTsiXSwibmFtZXMiOlsiVXRpbHMiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiSW1hZ2UiLCJOb2RlIiwibGlnaHRCdWxiT2ZmX3BuZyIsImxpZ2h0QnVsYk9uX3BuZyIsIkxpZ2h0UmF5c05vZGUiLCJzY2VuZXJ5UGhldCIsIkxpZ2h0QnVsYk5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUxpZ2h0QnVsYk5vZGUiLCJ1cGRhdGUiLCJ2aXNpYmxlIiwiYnJpZ2h0bmVzcyIsImJyaWdodG5lc3NQcm9wZXJ0eSIsInZhbHVlIiwiYXNzZXJ0Iiwib25Ob2RlIiwib3BhY2l0eSIsImxpbmVhciIsInJheXNOb2RlIiwic2V0QnJpZ2h0bmVzcyIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJidWxiSW1hZ2VTY2FsZSIsImxpZ2h0QnVsYk9uSW1hZ2UiLCJsaWdodEJ1bGJPZmZJbWFnZSIsInNjYWxlIiwiY2VudGVyWCIsImJvdHRvbSIsIm9mZk5vZGUiLCJidWxiUmFkaXVzIiwid2lkdGgiLCJ4IiwieSIsInRvcCIsImxpZ2h0UmF5c05vZGVPcHRpb25zIiwiY2hpbGRyZW4iLCJ2aXNpYmxlUHJvcGVydHkiLCJsaW5rIiwiYnJpZ2h0bmVzc09ic2VydmVyIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQXFDLGtDQUFrQztBQUU5RSxTQUFTQyxLQUFLLEVBQWtCQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUN2RixPQUFPQyxzQkFBc0IsaUNBQWlDO0FBQzlELE9BQU9DLHFCQUFxQixnQ0FBZ0M7QUFDNUQsT0FBT0MsbUJBQTZDLHFCQUFxQjtBQUN6RSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBVTVCLElBQUEsQUFBTUMsZ0JBQU4sTUFBTUEsc0JBQXNCTDtJQTZEekJNLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msb0JBQW9CO1FBQ3pCLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOztHQUVDLEdBQ0QsQUFBUUUsU0FBZTtRQUNyQixJQUFLLElBQUksQ0FBQ0MsT0FBTyxFQUFHO1lBQ2xCLE1BQU1DLGFBQWEsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsS0FBSztZQUNoREMsVUFBVUEsT0FBUUgsY0FBYyxLQUFLQSxjQUFjO1lBQ25ELElBQUksQ0FBQ0ksTUFBTSxDQUFDTCxPQUFPLEdBQUtDLGFBQWE7WUFDckMsSUFBSyxJQUFJLENBQUNJLE1BQU0sQ0FBQ0wsT0FBTyxFQUFHO2dCQUN6QixJQUFJLENBQUNLLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHbkIsTUFBTW9CLE1BQU0sQ0FBRSxHQUFHLEdBQUcsS0FBSyxHQUFHTjtZQUNwRDtZQUNBLElBQUksQ0FBQ08sUUFBUSxDQUFDQyxhQUFhLENBQUVSO1FBQy9CO0lBQ0Y7SUF4RUE7OztHQUdDLEdBQ0QsWUFBb0JDLGtCQUE2QyxFQUFFUSxlQUFzQyxDQUFHO1lBK0NoR0Msc0NBQUFBLHNCQUFBQTtRQTdDVixNQUFNQyxVQUFVdkIsWUFBaUc7WUFDL0d3QixnQkFBZ0I7WUFDaEJDLGtCQUFrQnJCO1lBQ2xCc0IsbUJBQW1CdkI7UUFDckIsR0FBR2tCO1FBRUgsTUFBTUwsU0FBUyxJQUFJZixNQUFPc0IsUUFBUUUsZ0JBQWdCLEVBQUU7WUFDbERFLE9BQU9KLFFBQVFDLGNBQWM7WUFDN0JJLFNBQVM7WUFDVEMsUUFBUTtRQUNWO1FBRUEsTUFBTUMsVUFBVSxJQUFJN0IsTUFBT3NCLFFBQVFHLGlCQUFpQixFQUFFO1lBQ3BEQyxPQUFPSixRQUFRQyxjQUFjO1lBQzdCSSxTQUFTWixPQUFPWSxPQUFPO1lBQ3ZCQyxRQUFRYixPQUFPYSxNQUFNO1FBQ3ZCO1FBRUEsT0FBTztRQUNQLE1BQU1FLGFBQWFELFFBQVFFLEtBQUssR0FBRyxHQUFHLDBFQUEwRTtRQUNoSCxNQUFNYixXQUFXLElBQUlkLGNBQWUwQixZQUNsQy9CLFlBQTJFO1lBQ3pFaUMsR0FBR2pCLE9BQU9ZLE9BQU87WUFDakJNLEdBQUdKLFFBQVFLLEdBQUcsR0FBR0o7UUFDbkIsR0FBR1IsUUFBUWEsb0JBQW9CO1FBRWpDYixRQUFRYyxRQUFRLEdBQUc7WUFBRWxCO1lBQVVXO1lBQVNkO1NBQVE7UUFFaEQsS0FBSyxDQUFFTztRQUVQLElBQUksQ0FBQ1AsTUFBTSxHQUFHQTtRQUNkLElBQUksQ0FBQ0csUUFBUSxHQUFHQTtRQUNoQixJQUFJLENBQUNOLGtCQUFrQixHQUFHQTtRQUUxQiw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDeUIsZUFBZSxDQUFDQyxJQUFJLENBQUU1QixDQUFBQSxVQUFXQSxXQUFXLElBQUksQ0FBQ0QsTUFBTTtRQUU1RCxNQUFNOEIscUJBQXFCLENBQUU1QixhQUF3QixJQUFJLENBQUNGLE1BQU07UUFDaEVHLG1CQUFtQjBCLElBQUksQ0FBRUM7UUFFekIsSUFBSSxDQUFDL0Isb0JBQW9CLEdBQUc7WUFDMUJJLG1CQUFtQjRCLE1BQU0sQ0FBRUQ7UUFDN0I7UUFFQSxtR0FBbUc7UUFDbkd6QixZQUFVTyxlQUFBQSxPQUFPb0IsSUFBSSxzQkFBWHBCLHVCQUFBQSxhQUFhcUIsT0FBTyxzQkFBcEJyQix1Q0FBQUEscUJBQXNCc0IsZUFBZSxxQkFBckN0QixxQ0FBdUN1QixNQUFNLEtBQUk5QyxpQkFBaUIrQyxlQUFlLENBQUUsZ0JBQWdCLGlCQUFpQixJQUFJO0lBQ3BJO0FBcUJGO0FBaEZBLFNBQXFCdkMsMkJBZ0ZwQjtBQUVERCxZQUFZeUMsUUFBUSxDQUFFLGlCQUFpQnhDIn0=