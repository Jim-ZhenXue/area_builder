// Copyright 2013-2024, University of Colorado Boulder
/**
 * FaceNode is a face that can smile or frown.  This is generally used for indicating success or failure.
 * This was ported from a version that was originally written in Java.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, Color, Node, PaintColorProperty, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let FaceNode = class FaceNode extends Node {
    smile() {
        this.smileMouth.visible = true;
        this.frownMouth.visible = false;
        return this;
    }
    frown() {
        this.smileMouth.visible = false;
        this.frownMouth.visible = true;
        return this;
    }
    constructor(headDiameter, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // default options
        const options = optionize()({
            headFill: Color.YELLOW,
            headStroke: null,
            eyeFill: 'black',
            mouthStroke: 'black',
            headLineWidth: 1
        }, providedOptions);
        super();
        // Wrap headFill in a Property, so that we can use darkerColor below.
        // See https://github.com/phetsims/scenery-phet/issues/623
        const headFillProperty = new PaintColorProperty(options.headFill);
        // The derived property listens to our headFillProperty which will be disposed. We don't need to keep a reference.
        options.headStroke = options.headStroke || new DerivedProperty([
            headFillProperty
        ], (color)=>color.darkerColor());
        // Add head.
        this.addChild(new Circle(headDiameter / 2, {
            fill: options.headFill,
            stroke: options.headStroke,
            lineWidth: options.headLineWidth
        }));
        // Add the eyes.
        const eyeDiameter = headDiameter * 0.075;
        this.addChild(new Circle(eyeDiameter, {
            fill: options.eyeFill,
            centerX: -headDiameter * 0.2,
            centerY: -headDiameter * 0.1
        }));
        this.addChild(new Circle(eyeDiameter, {
            fill: options.eyeFill,
            centerX: headDiameter * 0.2,
            centerY: -headDiameter * 0.1
        }));
        // Add the mouths.
        const mouthLineWidth = headDiameter * 0.05;
        this.smileMouth = new Path(new Shape().arc(0, headDiameter * 0.05, headDiameter * 0.25, Math.PI * 0.2, Math.PI * 0.8), {
            stroke: options.mouthStroke,
            lineWidth: mouthLineWidth,
            lineCap: 'round'
        });
        this.addChild(this.smileMouth);
        this.frownMouth = new Path(new Shape().arc(0, headDiameter * 0.4, headDiameter * 0.20, -Math.PI * 0.75, -Math.PI * 0.25), {
            stroke: options.mouthStroke,
            lineWidth: mouthLineWidth,
            lineCap: 'round'
        });
        this.addChild(this.frownMouth);
        this.smile();
        // Pass through any options for positioning and such.
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'FaceNode', this);
    }
};
export { FaceNode as default };
sceneryPhet.register('FaceNode', FaceNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGYWNlTm9kZSBpcyBhIGZhY2UgdGhhdCBjYW4gc21pbGUgb3IgZnJvd24uICBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIGZvciBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAqIFRoaXMgd2FzIHBvcnRlZCBmcm9tIGEgdmVyc2lvbiB0aGF0IHdhcyBvcmlnaW5hbGx5IHdyaXR0ZW4gaW4gSmF2YS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50Q29sb3JQcm9wZXJ0eSwgUGF0aCwgVENvbG9yIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgaGVhZEZpbGw/OiBUQ29sb3I7XG4gIGhlYWRTdHJva2U/OiBUQ29sb3I7XG4gIGV5ZUZpbGw/OiBUQ29sb3I7XG4gIG1vdXRoU3Ryb2tlPzogVENvbG9yO1xuICBoZWFkTGluZVdpZHRoPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgRmFjZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmFjZU5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHNtaWxlTW91dGg6IFBhdGg7XG4gIHByaXZhdGUgcmVhZG9ubHkgZnJvd25Nb3V0aDogUGF0aDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGhlYWREaWFtZXRlcjogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBGYWNlTm9kZU9wdGlvbnMgKSB7XG5cbiAgICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEZhY2VOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG4gICAgICBoZWFkRmlsbDogQ29sb3IuWUVMTE9XLFxuICAgICAgaGVhZFN0cm9rZTogbnVsbCxcbiAgICAgIGV5ZUZpbGw6ICdibGFjaycsXG4gICAgICBtb3V0aFN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGhlYWRMaW5lV2lkdGg6IDFcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBXcmFwIGhlYWRGaWxsIGluIGEgUHJvcGVydHksIHNvIHRoYXQgd2UgY2FuIHVzZSBkYXJrZXJDb2xvciBiZWxvdy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNjIzXG4gICAgY29uc3QgaGVhZEZpbGxQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuaGVhZEZpbGwgKTtcblxuICAgIC8vIFRoZSBkZXJpdmVkIHByb3BlcnR5IGxpc3RlbnMgdG8gb3VyIGhlYWRGaWxsUHJvcGVydHkgd2hpY2ggd2lsbCBiZSBkaXNwb3NlZC4gV2UgZG9uJ3QgbmVlZCB0byBrZWVwIGEgcmVmZXJlbmNlLlxuICAgIG9wdGlvbnMuaGVhZFN0cm9rZSA9IG9wdGlvbnMuaGVhZFN0cm9rZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaGVhZEZpbGxQcm9wZXJ0eSBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgPT4gY29sb3IuZGFya2VyQ29sb3IoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAvLyBBZGQgaGVhZC5cbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCBoZWFkRGlhbWV0ZXIgLyAyLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLmhlYWRGaWxsLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmhlYWRTdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuaGVhZExpbmVXaWR0aFxuICAgIH0gKSApO1xuXG4gICAgLy8gQWRkIHRoZSBleWVzLlxuICAgIGNvbnN0IGV5ZURpYW1ldGVyID0gaGVhZERpYW1ldGVyICogMC4wNzU7XG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggZXllRGlhbWV0ZXIsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZXllRmlsbCxcbiAgICAgIGNlbnRlclg6IC1oZWFkRGlhbWV0ZXIgKiAwLjIsXG4gICAgICBjZW50ZXJZOiAtaGVhZERpYW1ldGVyICogMC4xXG4gICAgfSApICk7XG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggZXllRGlhbWV0ZXIsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZXllRmlsbCxcbiAgICAgIGNlbnRlclg6IGhlYWREaWFtZXRlciAqIDAuMixcbiAgICAgIGNlbnRlclk6IC1oZWFkRGlhbWV0ZXIgKiAwLjFcbiAgICB9ICkgKTtcblxuICAgIC8vIEFkZCB0aGUgbW91dGhzLlxuICAgIGNvbnN0IG1vdXRoTGluZVdpZHRoID0gaGVhZERpYW1ldGVyICogMC4wNTtcblxuICAgIHRoaXMuc21pbGVNb3V0aCA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKS5hcmMoIDAsIGhlYWREaWFtZXRlciAqIDAuMDUsIGhlYWREaWFtZXRlciAqIDAuMjUsIE1hdGguUEkgKiAwLjIsIE1hdGguUEkgKiAwLjggKSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLm1vdXRoU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBtb3V0aExpbmVXaWR0aCxcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCdcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zbWlsZU1vdXRoICk7XG5cbiAgICB0aGlzLmZyb3duTW91dGggPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkuYXJjKCAwLCBoZWFkRGlhbWV0ZXIgKiAwLjQsIGhlYWREaWFtZXRlciAqIDAuMjAsIC1NYXRoLlBJICogMC43NSwgLU1hdGguUEkgKiAwLjI1ICksIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5tb3V0aFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogbW91dGhMaW5lV2lkdGgsXG4gICAgICBsaW5lQ2FwOiAncm91bmQnXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZnJvd25Nb3V0aCApO1xuICAgIHRoaXMuc21pbGUoKTtcblxuICAgIC8vIFBhc3MgdGhyb3VnaCBhbnkgb3B0aW9ucyBmb3IgcG9zaXRpb25pbmcgYW5kIHN1Y2guXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnRmFjZU5vZGUnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgc21pbGUoKTogRmFjZU5vZGUge1xuICAgIHRoaXMuc21pbGVNb3V0aC52aXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLmZyb3duTW91dGgudmlzaWJsZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGZyb3duKCk6IEZhY2VOb2RlIHtcbiAgICB0aGlzLnNtaWxlTW91dGgudmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuZnJvd25Nb3V0aC52aXNpYmxlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0ZhY2VOb2RlJywgRmFjZU5vZGUgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiQ2lyY2xlIiwiQ29sb3IiLCJOb2RlIiwiUGFpbnRDb2xvclByb3BlcnR5IiwiUGF0aCIsInNjZW5lcnlQaGV0IiwiRmFjZU5vZGUiLCJzbWlsZSIsInNtaWxlTW91dGgiLCJ2aXNpYmxlIiwiZnJvd25Nb3V0aCIsImZyb3duIiwiaGVhZERpYW1ldGVyIiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsImhlYWRGaWxsIiwiWUVMTE9XIiwiaGVhZFN0cm9rZSIsImV5ZUZpbGwiLCJtb3V0aFN0cm9rZSIsImhlYWRMaW5lV2lkdGgiLCJoZWFkRmlsbFByb3BlcnR5IiwiY29sb3IiLCJkYXJrZXJDb2xvciIsImFkZENoaWxkIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImV5ZURpYW1ldGVyIiwiY2VudGVyWCIsImNlbnRlclkiLCJtb3V0aExpbmVXaWR0aCIsImFyYyIsIk1hdGgiLCJQSSIsImxpbmVDYXAiLCJtdXRhdGUiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBZUMsa0JBQWtCLEVBQUVDLElBQUksUUFBZ0IsOEJBQThCO0FBQ2pILE9BQU9DLGlCQUFpQixtQkFBbUI7QUFZNUIsSUFBQSxBQUFNQyxXQUFOLE1BQU1BLGlCQUFpQko7SUF5RTdCSyxRQUFrQjtRQUN2QixJQUFJLENBQUNDLFVBQVUsQ0FBQ0MsT0FBTyxHQUFHO1FBQzFCLElBQUksQ0FBQ0MsVUFBVSxDQUFDRCxPQUFPLEdBQUc7UUFDMUIsT0FBTyxJQUFJO0lBQ2I7SUFFT0UsUUFBa0I7UUFDdkIsSUFBSSxDQUFDSCxVQUFVLENBQUNDLE9BQU8sR0FBRztRQUMxQixJQUFJLENBQUNDLFVBQVUsQ0FBQ0QsT0FBTyxHQUFHO1FBQzFCLE9BQU8sSUFBSTtJQUNiO0lBOUVBLFlBQW9CRyxZQUFvQixFQUFFQyxlQUFpQyxDQUFHO1lBaUVsRUMsc0NBQUFBLHNCQUFBQTtRQS9EVixrQkFBa0I7UUFDbEIsTUFBTUMsVUFBVWhCLFlBQXdEO1lBQ3RFaUIsVUFBVWYsTUFBTWdCLE1BQU07WUFDdEJDLFlBQVk7WUFDWkMsU0FBUztZQUNUQyxhQUFhO1lBQ2JDLGVBQWU7UUFDakIsR0FBR1I7UUFFSCxLQUFLO1FBRUwscUVBQXFFO1FBQ3JFLDBEQUEwRDtRQUMxRCxNQUFNUyxtQkFBbUIsSUFBSW5CLG1CQUFvQlksUUFBUUMsUUFBUTtRQUVqRSxrSEFBa0g7UUFDbEhELFFBQVFHLFVBQVUsR0FBR0gsUUFBUUcsVUFBVSxJQUNsQixJQUFJdEIsZ0JBQWlCO1lBQUUwQjtTQUFrQixFQUN2Q0MsQ0FBQUEsUUFBU0EsTUFBTUMsV0FBVztRQUdqRCxZQUFZO1FBQ1osSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSXpCLE9BQVFZLGVBQWUsR0FBRztZQUMzQ2MsTUFBTVgsUUFBUUMsUUFBUTtZQUN0QlcsUUFBUVosUUFBUUcsVUFBVTtZQUMxQlUsV0FBV2IsUUFBUU0sYUFBYTtRQUNsQztRQUVBLGdCQUFnQjtRQUNoQixNQUFNUSxjQUFjakIsZUFBZTtRQUNuQyxJQUFJLENBQUNhLFFBQVEsQ0FBRSxJQUFJekIsT0FBUTZCLGFBQWE7WUFDdENILE1BQU1YLFFBQVFJLE9BQU87WUFDckJXLFNBQVMsQ0FBQ2xCLGVBQWU7WUFDekJtQixTQUFTLENBQUNuQixlQUFlO1FBQzNCO1FBQ0EsSUFBSSxDQUFDYSxRQUFRLENBQUUsSUFBSXpCLE9BQVE2QixhQUFhO1lBQ3RDSCxNQUFNWCxRQUFRSSxPQUFPO1lBQ3JCVyxTQUFTbEIsZUFBZTtZQUN4Qm1CLFNBQVMsQ0FBQ25CLGVBQWU7UUFDM0I7UUFFQSxrQkFBa0I7UUFDbEIsTUFBTW9CLGlCQUFpQnBCLGVBQWU7UUFFdEMsSUFBSSxDQUFDSixVQUFVLEdBQUcsSUFBSUosS0FBTSxJQUFJUCxRQUFRb0MsR0FBRyxDQUFFLEdBQUdyQixlQUFlLE1BQU1BLGVBQWUsTUFBTXNCLEtBQUtDLEVBQUUsR0FBRyxLQUFLRCxLQUFLQyxFQUFFLEdBQUcsTUFBTztZQUN4SFIsUUFBUVosUUFBUUssV0FBVztZQUMzQlEsV0FBV0k7WUFDWEksU0FBUztRQUNYO1FBQ0EsSUFBSSxDQUFDWCxRQUFRLENBQUUsSUFBSSxDQUFDakIsVUFBVTtRQUU5QixJQUFJLENBQUNFLFVBQVUsR0FBRyxJQUFJTixLQUFNLElBQUlQLFFBQVFvQyxHQUFHLENBQUUsR0FBR3JCLGVBQWUsS0FBS0EsZUFBZSxNQUFNLENBQUNzQixLQUFLQyxFQUFFLEdBQUcsTUFBTSxDQUFDRCxLQUFLQyxFQUFFLEdBQUcsT0FBUTtZQUMzSFIsUUFBUVosUUFBUUssV0FBVztZQUMzQlEsV0FBV0k7WUFDWEksU0FBUztRQUNYO1FBQ0EsSUFBSSxDQUFDWCxRQUFRLENBQUUsSUFBSSxDQUFDZixVQUFVO1FBQzlCLElBQUksQ0FBQ0gsS0FBSztRQUVWLHFEQUFxRDtRQUNyRCxJQUFJLENBQUM4QixNQUFNLENBQUV0QjtRQUViLG1HQUFtRztRQUNuR3VCLFlBQVV4QixlQUFBQSxPQUFPeUIsSUFBSSxzQkFBWHpCLHVCQUFBQSxhQUFhMEIsT0FBTyxzQkFBcEIxQix1Q0FBQUEscUJBQXNCMkIsZUFBZSxxQkFBckMzQixxQ0FBdUM0QixNQUFNLEtBQUk1QyxpQkFBaUI2QyxlQUFlLENBQUUsZ0JBQWdCLFlBQVksSUFBSTtJQUMvSDtBQWFGO0FBcEZBLFNBQXFCckMsc0JBb0ZwQjtBQUVERCxZQUFZdUMsUUFBUSxDQUFFLFlBQVl0QyJ9