// Copyright 2016-2024, University of Colorado Boulder
/**
 * A default slider thumb, currently intended for use only in HSlider. It's a rectangle with a vertical white line down
 * the center.  The origin is at the top left (HSlider uses the thumb center for positioning).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path, PressListener, Rectangle } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
export const DEFAULT_FILL = 'rgb( 50, 145, 184 )';
export const DEFAULT_FILL_HIGHLIGHTED = 'rgb( 71, 207, 255 )';
let SliderThumb = class SliderThumb extends Rectangle {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            size: new Dimension2(22, 45),
            fillHighlighted: DEFAULT_FILL_HIGHLIGHTED,
            centerLineStroke: 'white',
            // RectangleOptions
            fill: DEFAULT_FILL,
            stroke: 'black',
            lineWidth: 1,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'ThumbNode'
        }, providedOptions);
        // Set a default corner radius
        if (options.cornerRadius === undefined) {
            options.cornerRadius = 0.25 * options.size.width;
        }
        options.cachedPaints = [
            options.fill,
            options.fillHighlighted
        ];
        super(0, 0, options.size.width, options.size.height, options);
        // Paint area that is slightly larger than the slider thumb so SVG updates a large enough paintable region.
        // Related to https://github.com/phetsims/masses-and-springs/issues/334
        const paintLayer = Rectangle.bounds(this.bounds.dilated(5), {
            fill: 'transparent',
            localBounds: this.bounds,
            pickable: false
        });
        this.addChild(paintLayer);
        // vertical line down the center
        const centerLineYMargin = 3;
        this.addChild(new Path(Shape.lineSegment(options.size.width / 2, centerLineYMargin, options.size.width / 2, options.size.height - centerLineYMargin), {
            stroke: options.centerLineStroke
        }));
        // highlight thumb on pointer over
        const pressListener = new PressListener({
            attach: false,
            tandem: Tandem.OPT_OUT // Highlighting doesn't need instrumentation
        });
        pressListener.isHighlightedProperty.link((isHighlighted)=>{
            this.fill = isHighlighted ? options.fillHighlighted : options.fill;
        });
        this.addInputListener(pressListener);
    }
};
export { SliderThumb as default };
sun.register('SliderThumb', SliderThumb);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9TbGlkZXJUaHVtYi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIGRlZmF1bHQgc2xpZGVyIHRodW1iLCBjdXJyZW50bHkgaW50ZW5kZWQgZm9yIHVzZSBvbmx5IGluIEhTbGlkZXIuIEl0J3MgYSByZWN0YW5nbGUgd2l0aCBhIHZlcnRpY2FsIHdoaXRlIGxpbmUgZG93blxuICogdGhlIGNlbnRlci4gIFRoZSBvcmlnaW4gaXMgYXQgdGhlIHRvcCBsZWZ0IChIU2xpZGVyIHVzZXMgdGhlIHRodW1iIGNlbnRlciBmb3IgcG9zaXRpb25pbmcpLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IFBhdGgsIFByZXNzTGlzdGVuZXIsIFJlY3RhbmdsZSwgUmVjdGFuZ2xlT3B0aW9ucywgVFBhaW50IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgc2l6ZT86IERpbWVuc2lvbjI7XG4gIGZpbGxIaWdobGlnaHRlZD86IFRQYWludDtcbiAgY2VudGVyTGluZVN0cm9rZT86IFRQYWludDtcbn07XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0ZJTEwgPSAncmdiKCA1MCwgMTQ1LCAxODQgKSc7XG5leHBvcnQgY29uc3QgREVGQVVMVF9GSUxMX0hJR0hMSUdIVEVEID0gJ3JnYiggNzEsIDIwNywgMjU1ICknO1xuXG50eXBlIFNsaWRlclRodW1iT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxSZWN0YW5nbGVPcHRpb25zLCAnY2FjaGVkUGFpbnRzJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWRlclRodW1iIGV4dGVuZHMgUmVjdGFuZ2xlIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogU2xpZGVyVGh1bWJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTbGlkZXJUaHVtYk9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5nbGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggMjIsIDQ1ICksXG4gICAgICBmaWxsSGlnaGxpZ2h0ZWQ6IERFRkFVTFRfRklMTF9ISUdITElHSFRFRCxcbiAgICAgIGNlbnRlckxpbmVTdHJva2U6ICd3aGl0ZScsXG5cbiAgICAgIC8vIFJlY3RhbmdsZU9wdGlvbnNcbiAgICAgIGZpbGw6IERFRkFVTFRfRklMTCxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELCAvLyBTbGlkZXIuanMgYWRkcyB0byB0aGlzIHRhbmRlbSB0byBuZXN0IGl0cyBkcmFnTGlzdGVuZXIgdW5kZXIgdGhlIHRodW1iLlxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1RodW1iTm9kZSdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIFNldCBhIGRlZmF1bHQgY29ybmVyIHJhZGl1c1xuICAgIGlmICggb3B0aW9ucy5jb3JuZXJSYWRpdXMgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG9wdGlvbnMuY29ybmVyUmFkaXVzID0gMC4yNSAqIG9wdGlvbnMuc2l6ZS53aWR0aDtcbiAgICB9XG5cbiAgICBvcHRpb25zLmNhY2hlZFBhaW50cyA9IFsgb3B0aW9ucy5maWxsLCBvcHRpb25zLmZpbGxIaWdobGlnaHRlZCBdO1xuXG4gICAgc3VwZXIoIDAsIDAsIG9wdGlvbnMuc2l6ZS53aWR0aCwgb3B0aW9ucy5zaXplLmhlaWdodCwgb3B0aW9ucyApO1xuXG4gICAgLy8gUGFpbnQgYXJlYSB0aGF0IGlzIHNsaWdodGx5IGxhcmdlciB0aGFuIHRoZSBzbGlkZXIgdGh1bWIgc28gU1ZHIHVwZGF0ZXMgYSBsYXJnZSBlbm91Z2ggcGFpbnRhYmxlIHJlZ2lvbi5cbiAgICAvLyBSZWxhdGVkIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tYXNzZXMtYW5kLXNwcmluZ3MvaXNzdWVzLzMzNFxuICAgIGNvbnN0IHBhaW50TGF5ZXIgPSBSZWN0YW5nbGUuYm91bmRzKCB0aGlzLmJvdW5kcy5kaWxhdGVkKCA1ICksIHtcbiAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXG4gICAgICBsb2NhbEJvdW5kczogdGhpcy5ib3VuZHMsXG4gICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcGFpbnRMYXllciApO1xuXG4gICAgLy8gdmVydGljYWwgbGluZSBkb3duIHRoZSBjZW50ZXJcbiAgICBjb25zdCBjZW50ZXJMaW5lWU1hcmdpbiA9IDM7XG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhdGgoIFNoYXBlLmxpbmVTZWdtZW50KFxuICAgICAgb3B0aW9ucy5zaXplLndpZHRoIC8gMiwgY2VudGVyTGluZVlNYXJnaW4sXG4gICAgICBvcHRpb25zLnNpemUud2lkdGggLyAyLCBvcHRpb25zLnNpemUuaGVpZ2h0IC0gY2VudGVyTGluZVlNYXJnaW4gKSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNlbnRlckxpbmVTdHJva2VcbiAgICB9ICkgKTtcblxuICAgIC8vIGhpZ2hsaWdodCB0aHVtYiBvbiBwb2ludGVyIG92ZXJcbiAgICBjb25zdCBwcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcbiAgICAgIGF0dGFjaDogZmFsc2UsXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIEhpZ2hsaWdodGluZyBkb2Vzbid0IG5lZWQgaW5zdHJ1bWVudGF0aW9uXG4gICAgfSApO1xuICAgIHByZXNzTGlzdGVuZXIuaXNIaWdobGlnaHRlZFByb3BlcnR5LmxpbmsoIGlzSGlnaGxpZ2h0ZWQgPT4ge1xuICAgICAgdGhpcy5maWxsID0gaXNIaWdobGlnaHRlZCA/IG9wdGlvbnMuZmlsbEhpZ2hsaWdodGVkIDogb3B0aW9ucy5maWxsO1xuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHByZXNzTGlzdGVuZXIgKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdTbGlkZXJUaHVtYicsIFNsaWRlclRodW1iICk7Il0sIm5hbWVzIjpbIkRpbWVuc2lvbjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIlBhdGgiLCJQcmVzc0xpc3RlbmVyIiwiUmVjdGFuZ2xlIiwiVGFuZGVtIiwic3VuIiwiREVGQVVMVF9GSUxMIiwiREVGQVVMVF9GSUxMX0hJR0hMSUdIVEVEIiwiU2xpZGVyVGh1bWIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2l6ZSIsImZpbGxIaWdobGlnaHRlZCIsImNlbnRlckxpbmVTdHJva2UiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwiY29ybmVyUmFkaXVzIiwidW5kZWZpbmVkIiwid2lkdGgiLCJjYWNoZWRQYWludHMiLCJoZWlnaHQiLCJwYWludExheWVyIiwiYm91bmRzIiwiZGlsYXRlZCIsImxvY2FsQm91bmRzIiwicGlja2FibGUiLCJhZGRDaGlsZCIsImNlbnRlckxpbmVZTWFyZ2luIiwibGluZVNlZ21lbnQiLCJwcmVzc0xpc3RlbmVyIiwiYXR0YWNoIiwiT1BUX09VVCIsImlzSGlnaGxpZ2h0ZWRQcm9wZXJ0eSIsImxpbmsiLCJpc0hpZ2hsaWdodGVkIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxnQkFBZ0IsNkJBQTZCO0FBQ3BELFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLFNBQVMsUUFBa0MsOEJBQThCO0FBQ3ZHLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFNBQVMsV0FBVztBQVEzQixPQUFPLE1BQU1DLGVBQWUsc0JBQXNCO0FBQ2xELE9BQU8sTUFBTUMsMkJBQTJCLHNCQUFzQjtBQUkvQyxJQUFBLEFBQU1DLGNBQU4sTUFBTUEsb0JBQW9CTDtJQUV2QyxZQUFvQk0sZUFBbUMsQ0FBRztRQUV4RCxNQUFNQyxVQUFVVixZQUFnRTtZQUU5RSxjQUFjO1lBQ2RXLE1BQU0sSUFBSWIsV0FBWSxJQUFJO1lBQzFCYyxpQkFBaUJMO1lBQ2pCTSxrQkFBa0I7WUFFbEIsbUJBQW1CO1lBQ25CQyxNQUFNUjtZQUNOUyxRQUFRO1lBQ1JDLFdBQVc7WUFDWEMsUUFBUWIsT0FBT2MsUUFBUTtZQUN2QkMsa0JBQWtCO1FBQ3BCLEdBQUdWO1FBRUgsOEJBQThCO1FBQzlCLElBQUtDLFFBQVFVLFlBQVksS0FBS0MsV0FBWTtZQUN4Q1gsUUFBUVUsWUFBWSxHQUFHLE9BQU9WLFFBQVFDLElBQUksQ0FBQ1csS0FBSztRQUNsRDtRQUVBWixRQUFRYSxZQUFZLEdBQUc7WUFBRWIsUUFBUUksSUFBSTtZQUFFSixRQUFRRSxlQUFlO1NBQUU7UUFFaEUsS0FBSyxDQUFFLEdBQUcsR0FBR0YsUUFBUUMsSUFBSSxDQUFDVyxLQUFLLEVBQUVaLFFBQVFDLElBQUksQ0FBQ2EsTUFBTSxFQUFFZDtRQUV0RCwyR0FBMkc7UUFDM0csdUVBQXVFO1FBQ3ZFLE1BQU1lLGFBQWF0QixVQUFVdUIsTUFBTSxDQUFFLElBQUksQ0FBQ0EsTUFBTSxDQUFDQyxPQUFPLENBQUUsSUFBSztZQUM3RGIsTUFBTTtZQUNOYyxhQUFhLElBQUksQ0FBQ0YsTUFBTTtZQUN4QkcsVUFBVTtRQUNaO1FBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUVMO1FBRWYsZ0NBQWdDO1FBQ2hDLE1BQU1NLG9CQUFvQjtRQUMxQixJQUFJLENBQUNELFFBQVEsQ0FBRSxJQUFJN0IsS0FBTUYsTUFBTWlDLFdBQVcsQ0FDeEN0QixRQUFRQyxJQUFJLENBQUNXLEtBQUssR0FBRyxHQUFHUyxtQkFDeEJyQixRQUFRQyxJQUFJLENBQUNXLEtBQUssR0FBRyxHQUFHWixRQUFRQyxJQUFJLENBQUNhLE1BQU0sR0FBR08sb0JBQXFCO1lBQ25FaEIsUUFBUUwsUUFBUUcsZ0JBQWdCO1FBQ2xDO1FBRUEsa0NBQWtDO1FBQ2xDLE1BQU1vQixnQkFBZ0IsSUFBSS9CLGNBQWU7WUFDdkNnQyxRQUFRO1lBQ1JqQixRQUFRYixPQUFPK0IsT0FBTyxDQUFDLDRDQUE0QztRQUNyRTtRQUNBRixjQUFjRyxxQkFBcUIsQ0FBQ0MsSUFBSSxDQUFFQyxDQUFBQTtZQUN4QyxJQUFJLENBQUN4QixJQUFJLEdBQUd3QixnQkFBZ0I1QixRQUFRRSxlQUFlLEdBQUdGLFFBQVFJLElBQUk7UUFDcEU7UUFDQSxJQUFJLENBQUN5QixnQkFBZ0IsQ0FBRU47SUFDekI7QUFDRjtBQXZEQSxTQUFxQnpCLHlCQXVEcEI7QUFFREgsSUFBSW1DLFFBQVEsQ0FBRSxlQUFlaEMifQ==