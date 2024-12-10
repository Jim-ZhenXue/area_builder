// Copyright 2014-2024, University of Colorado Boulder
/**
 * RoundButton is the base class for round buttons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Circle, LayoutConstraint, Node, PaintColorProperty, RadialGradient } from '../../../scenery/js/imports.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
import ButtonNode from './ButtonNode.js';
// constants
const HIGHLIGHT_GRADIENT_LENGTH = 5; // In screen coords, which are roughly pixels.
let RoundButton = class RoundButton extends ButtonNode {
    constructor(buttonModel, interactionStateProperty, providedOptions){
        let options = optionize()({
            // Round buttons default to not being sizable. You can set them to sizable in up to ONE dimension, where they will
            // take their size (radius) from that dimension.
            sizable: false,
            // SelfOptions
            radius: providedOptions && providedOptions.content ? null : 30,
            lineWidth: 0.5,
            stroke: null,
            touchAreaDilation: 0,
            mouseAreaDilation: 0,
            touchAreaXShift: 0,
            touchAreaYShift: 0,
            mouseAreaXShift: 0,
            mouseAreaYShift: 0,
            // ButtonNodeOptions
            cursor: 'pointer',
            // If these are not the same, the larger one will be used to calculate the size of the button
            xMargin: 5,
            yMargin: 5,
            // Class that determines the button's appearance for the values of interactionStateProperty.
            // See RoundButton.ThreeDAppearanceStrategy for an example of the interface required.
            buttonAppearanceStrategy: RoundButton.ThreeDAppearanceStrategy
        }, providedOptions);
        if (!options.content) {
            assert && assert(typeof options.radius === 'number', `invalid radius: ${options.radius}`);
        }
        if (options.radius) {
            assert && assert(options.xMargin < options.radius, 'xMargin cannot be larger than radius');
            assert && assert(options.yMargin < options.radius, 'yMargin cannot be larger than radius');
        }
        // If no options were explicitly passed in for the button appearance strategy, pass through the general appearance
        // options.
        if (!options.buttonAppearanceStrategyOptions) {
            options.buttonAppearanceStrategyOptions = {
                stroke: options.stroke,
                lineWidth: options.lineWidth
            };
        }
        // Create the circular part of the button.
        const buttonBackground = new Circle(1);
        const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
        options = _.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
        super(buttonModel, buttonBackground, interactionStateProperty, options);
        var _options_content;
        this.buttonNodeConstraint = new RoundButtonNodeConstraint(this, this.layoutSizeProperty, {
            content: (_options_content = options.content) != null ? _options_content : null,
            radius: options.radius,
            buttonBackground: buttonBackground,
            xMargin: options.xMargin,
            yMargin: options.yMargin,
            maxLineWidth: this.maxLineWidth,
            touchAreaDilation: options.touchAreaDilation,
            touchAreaXShift: options.touchAreaXShift,
            touchAreaYShift: options.touchAreaYShift,
            mouseAreaDilation: options.mouseAreaDilation,
            mouseAreaXShift: options.mouseAreaXShift,
            mouseAreaYShift: options.mouseAreaYShift
        });
        this.disposeEmitter.addListener(()=>this.buttonNodeConstraint.dispose());
        this.mutate(boundsRequiredOptionKeys);
    }
};
export { RoundButton as default };
/**
 * ThreeDAppearanceStrategy is a value for RoundButton options.buttonAppearanceStrategy. It makes a round button
 * look 3D-ish by using gradients that create the appearance of highlighted and shaded edges. The gradients are
 * set up to make the light source appear to be in the upper left.
 */ export class ThreeDAppearanceStrategy {
    dispose() {
        this.disposeThreeDAppearanceStrategy();
    }
    /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty
   * @param baseColorProperty
   * @param [providedOptions]
   */ constructor(buttonBackground, interactionStateProperty, baseColorProperty, providedOptions){
        // If stroke and lineWidth exist in the provided options, they become the default for all strokes and line widths.
        // If not, defaults are created.
        const defaultStroke = providedOptions && providedOptions.stroke ? providedOptions.stroke : new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.4
        });
        const defaultLineWidth = providedOptions && providedOptions.lineWidth !== undefined ? providedOptions.lineWidth : 0.3;
        const options = optionize()({
            stroke: defaultStroke,
            lineWidth: defaultLineWidth,
            overStroke: defaultStroke,
            overLineWidth: defaultLineWidth,
            overButtonOpacity: 1,
            selectedStroke: defaultStroke,
            selectedLineWidth: defaultLineWidth,
            selectedButtonOpacity: 1,
            deselectedFill: null,
            deselectedStroke: defaultStroke,
            deselectedLineWidth: defaultLineWidth,
            deselectedButtonOpacity: 1,
            overFill: baseColorProperty
        }, providedOptions);
        // Dynamic colors
        const baseBrighter8Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: 0.8
        });
        const baseBrighter7Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: 0.7
        });
        const baseBrighter3Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: 0.3
        });
        const baseDarker1Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.1
        });
        const baseDarker2Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.2
        });
        const baseDarker4Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.4
        });
        const baseDarker5Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.5
        });
        const baseTransparentProperty = new DerivedProperty([
            baseColorProperty
        ], (color)=>color.withAlpha(0));
        // Create and add the overlay that is used to add shading.
        const shadowNode = new Circle(1, {
            stroke: !options.stroke ? baseDarker4Property : options.stroke,
            lineWidth: options.lineWidth,
            pickable: false
        });
        buttonBackground.addChild(shadowNode);
        this.maxLineWidth = shadowNode.hasStroke() && options && typeof options.lineWidth === 'number' ? options.lineWidth : 0;
        let interactionStateListener;
        // We'll need to listen to the shape changes in order to update our appearance.
        const listener = ()=>{
            // Set up variables needed to create the various gradient fills and otherwise modify the appearance
            // eslint-disable-next-line phet/no-simple-type-checking-assertions
            assert && assert(buttonBackground instanceof Circle);
            const buttonRadius = buttonBackground.radius;
            const innerGradientRadius = buttonRadius - HIGHLIGHT_GRADIENT_LENGTH / 2;
            const outerGradientRadius = buttonRadius + HIGHLIGHT_GRADIENT_LENGTH / 2;
            const gradientOffset = HIGHLIGHT_GRADIENT_LENGTH / 2;
            // If our button is not large enough for the gradients to be visible, don't bother setting them up.
            if (buttonRadius < gradientOffset) {
                return;
            }
            const upFillHighlight = new RadialGradient(gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius).addColorStop(0, baseColorProperty).addColorStop(1, baseBrighter7Property);
            const upFillShadow = new RadialGradient(-gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius).addColorStop(0, baseTransparentProperty).addColorStop(1, baseDarker5Property);
            const overFillHighlight = new RadialGradient(gradientOffset, gradientOffset, innerGradientRadius, gradientOffset, gradientOffset, outerGradientRadius).addColorStop(0, baseBrighter3Property).addColorStop(1, baseBrighter8Property);
            const overFillShadow = new RadialGradient(-gradientOffset, -gradientOffset, innerGradientRadius, -gradientOffset, -gradientOffset, outerGradientRadius).addColorStop(0, baseTransparentProperty).addColorStop(1, baseDarker5Property);
            const pressedFill = new RadialGradient(-gradientOffset, -gradientOffset, 0, 0, 0, outerGradientRadius).addColorStop(0, baseDarker1Property).addColorStop(0.6, baseDarker2Property).addColorStop(0.8, baseColorProperty).addColorStop(1, baseBrighter8Property);
            shadowNode.radius = buttonRadius;
            // Cache gradients
            buttonBackground.cachedPaints = [
                upFillHighlight,
                overFillHighlight,
                pressedFill
            ];
            shadowNode.cachedPaints = [
                upFillShadow,
                overFillShadow
            ];
            interactionStateListener && interactionStateProperty.unlink(interactionStateListener);
            // Change colors to match interactionState
            interactionStateListener = (interactionState)=>{
                switch(interactionState){
                    case ButtonInteractionState.IDLE:
                        buttonBackground.fill = options.deselectedFill || upFillHighlight;
                        buttonBackground.stroke = options.deselectedStroke;
                        buttonBackground.lineWidth = options.deselectedLineWidth;
                        buttonBackground.opacity = options.deselectedButtonOpacity;
                        shadowNode.fill = upFillShadow;
                        shadowNode.opacity = options.deselectedButtonOpacity;
                        break;
                    case ButtonInteractionState.OVER:
                        buttonBackground.fill = overFillHighlight;
                        buttonBackground.stroke = options.overStroke;
                        buttonBackground.lineWidth = options.overLineWidth;
                        buttonBackground.opacity = options.overButtonOpacity;
                        shadowNode.fill = overFillShadow;
                        shadowNode.opacity = options.overButtonOpacity;
                        break;
                    case ButtonInteractionState.PRESSED:
                        buttonBackground.fill = pressedFill;
                        buttonBackground.stroke = options.selectedStroke;
                        buttonBackground.lineWidth = options.selectedLineWidth;
                        buttonBackground.opacity = options.selectedButtonOpacity;
                        shadowNode.fill = overFillShadow;
                        shadowNode.opacity = options.selectedButtonOpacity;
                        break;
                    default:
                        throw new Error(`unsupported interactionState: ${interactionState}`);
                }
            };
            interactionStateProperty.link(interactionStateListener);
        };
        buttonBackground.selfBoundsProperty.link(listener);
        this.disposeThreeDAppearanceStrategy = ()=>{
            buttonBackground.selfBoundsProperty.unlink(listener);
            if (interactionStateProperty.hasListener(interactionStateListener)) {
                interactionStateProperty.unlink(interactionStateListener);
            }
            baseBrighter8Property.dispose();
            baseBrighter7Property.dispose();
            baseBrighter3Property.dispose();
            baseDarker1Property.dispose();
            baseDarker2Property.dispose();
            baseDarker4Property.dispose();
            baseDarker5Property.dispose();
            baseTransparentProperty.dispose();
        };
    }
}
RoundButton.ThreeDAppearanceStrategy = ThreeDAppearanceStrategy;
let RoundButtonNodeConstraint = class RoundButtonNodeConstraint extends LayoutConstraint {
    layout() {
        super.layout();
        const buttonNode = this.buttonNode;
        const content = this.options.content;
        const contentProxy = content ? this.createLayoutProxy(content) : null;
        // Should only happen when we are disconnected during disposal
        if (!!content !== !!contentProxy) {
            return;
        }
        const widthSizable = buttonNode.widthSizable;
        const heightSizable = buttonNode.heightSizable;
        const contentMinimumWidthWithMargins = contentProxy ? contentProxy.minimumWidth + this.options.xMargin * 2 : 0;
        const contentMinimumHeightWithMargins = contentProxy ? contentProxy.minimumHeight + this.options.yMargin * 2 : 0;
        let contentMinimumRadius = Math.max(contentMinimumWidthWithMargins, contentMinimumHeightWithMargins) / 2;
        // If a initial (minimum) radius is specified, use this as an override (and we will scale the content down to fit)
        if (this.options.radius !== null) {
            contentMinimumRadius = this.options.radius;
        }
        // Only allow an initial update if we are not sizable in that dimension
        let minimumWidth = this.isFirstLayout || widthSizable ? 2 * contentMinimumRadius : buttonNode.localMinimumWidth;
        let minimumHeight = this.isFirstLayout || heightSizable ? 2 * contentMinimumRadius : buttonNode.localMinimumHeight;
        var _buttonNode_localPreferredWidth;
        // Our resulting sizes (allow setting preferred width/height on the buttonNode)
        this.lastLocalWidth = this.isFirstLayout || widthSizable ? Math.max(minimumWidth, widthSizable ? (_buttonNode_localPreferredWidth = buttonNode.localPreferredWidth) != null ? _buttonNode_localPreferredWidth : 0 : 0) : this.lastLocalWidth;
        var _buttonNode_localPreferredHeight;
        this.lastLocalHeight = this.isFirstLayout || heightSizable ? Math.max(minimumHeight, heightSizable ? (_buttonNode_localPreferredHeight = buttonNode.localPreferredHeight) != null ? _buttonNode_localPreferredHeight : 0 : 0) : this.lastLocalHeight;
        const actualSize = Math.max(this.lastLocalWidth, this.lastLocalHeight);
        assert && assert(!widthSizable || !heightSizable, 'RoundButton should not be sizable in both dimensions');
        // If we have a single sizable direction, we will adjust the minimum width of the OTHER direction to match.
        // This does not work if both dimensions are sizable, because it will run into conflicts.
        if (!widthSizable && heightSizable) {
            minimumWidth = actualSize;
        }
        if (!heightSizable && widthSizable) {
            minimumHeight = actualSize;
        }
        if (this.isFirstLayout || widthSizable || heightSizable) {
            const preferredRadius = (actualSize - this.options.maxLineWidth) / 2;
            this.options.buttonBackground.radius = preferredRadius;
        }
        if (this.isFirstLayout || widthSizable || heightSizable) {
            // Get the actual button radius after calling super, so that buttonAppearanceStrategy has applied the stroke.
            // This accounts for stroke + lineWidth, which is important when setting pointer areas and focus highlight.
            // See https://github.com/phetsims/sun/issues/660
            const buttonBackgroundRadius = this.options.buttonBackground.localBounds.width / 2;
            // Set pointer areas.
            this.buttonNode.touchArea = Shape.circle(this.options.touchAreaXShift, this.options.touchAreaYShift, buttonBackgroundRadius + this.options.touchAreaDilation);
            this.buttonNode.mouseArea = Shape.circle(this.options.mouseAreaXShift, this.options.mouseAreaYShift, buttonBackgroundRadius + this.options.mouseAreaDilation);
            // pdom - focus highlight is circular for round buttons, with a little bit of padding
            // between button shape and inner edge of highlight
            this.buttonNode.focusHighlight = Shape.circle(0, 0, buttonBackgroundRadius + 5);
        }
        if (contentProxy) {
            const preferredContentWidth = actualSize - this.options.xMargin * 2;
            const preferredContentHeight = actualSize - this.options.yMargin * 2;
            contentProxy.preferredWidth = preferredContentWidth;
            contentProxy.preferredHeight = preferredContentHeight;
            // Only apply max sizes if a size is specified in the button, see https://github.com/phetsims/sun/issues/889
            if (this.options.radius !== null) {
                const contentContainer = this.buttonNode.contentContainer;
                assert && assert(contentContainer);
                contentContainer.maxWidth = preferredContentWidth;
                contentContainer.maxHeight = preferredContentHeight;
            }
        }
        this.isFirstLayout = false;
        this.layoutSizeProperty.value = new Dimension2(this.lastLocalWidth, this.lastLocalHeight);
        // Set minimums at the end
        buttonNode.localMinimumWidth = minimumWidth;
        buttonNode.localMinimumHeight = minimumHeight;
    }
    dispose() {
        this.buttonNode.localPreferredWidthProperty.unlink(this._updateLayoutListener);
        this.buttonNode.localPreferredHeightProperty.unlink(this._updateLayoutListener);
        super.dispose();
    }
    constructor(buttonNode, layoutSizeProperty, options){
        super(buttonNode), this.buttonNode = buttonNode, this.layoutSizeProperty = layoutSizeProperty, this.isFirstLayout = true, this.lastLocalWidth = 0, this.lastLocalHeight = 0;
        this.options = options;
        this.buttonNode.localPreferredWidthProperty.lazyLink(this._updateLayoutListener);
        this.buttonNode.localPreferredHeightProperty.lazyLink(this._updateLayoutListener);
        if (this.options.content) {
            this.addNode(this.options.content);
        }
        this.layout();
    }
};
sun.register('RoundButton', RoundButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JvdW5kQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJvdW5kQnV0dG9uIGlzIHRoZSBiYXNlIGNsYXNzIGZvciByb3VuZCBidXR0b25zLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgTGF5b3V0Q29uc3RyYWludCwgTm9kZSwgUGFpbnRDb2xvclByb3BlcnR5LCBQYXRoLCBSYWRpYWxHcmFkaWVudCwgVFBhaW50IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzdW4gZnJvbSAnLi4vc3VuLmpzJztcbmltcG9ydCBCdXR0b25JbnRlcmFjdGlvblN0YXRlIGZyb20gJy4vQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5qcyc7XG5pbXBvcnQgQnV0dG9uTW9kZWwgZnJvbSAnLi9CdXR0b25Nb2RlbC5qcyc7XG5pbXBvcnQgQnV0dG9uTm9kZSwgeyBCdXR0b25Ob2RlT3B0aW9ucyB9IGZyb20gJy4vQnV0dG9uTm9kZS5qcyc7XG5pbXBvcnQgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlIGZyb20gJy4vUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlLmpzJztcbmltcG9ydCBUQnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5LCB7IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIH0gZnJvbSAnLi9UQnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBISUdITElHSFRfR1JBRElFTlRfTEVOR1RIID0gNTsgLy8gSW4gc2NyZWVuIGNvb3Jkcywgd2hpY2ggYXJlIHJvdWdobHkgcGl4ZWxzLlxuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIHJhZGl1cz86IG51bWJlciB8IG51bGw7XG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbiAgc3Ryb2tlPzogVFBhaW50IHwgbnVsbDsgLy8gd2hlbiBudWxsLCBhIHN0cm9rZSB3aWxsIGJlIGRlcml2ZWQgZnJvbSB0aGUgYmFzZSBjb2xvclxuXG4gIC8vIHBvaW50ZXIgYXJlYSBkaWxhdGlvblxuICB0b3VjaEFyZWFEaWxhdGlvbj86IG51bWJlcjsgLy8gcmFkaXVzIGRpbGF0aW9uIGZvciB0b3VjaCBhcmVhXG4gIG1vdXNlQXJlYURpbGF0aW9uPzogbnVtYmVyOyAvLyByYWRpdXMgZGlsYXRpb24gZm9yIG1vdXNlIGFyZWFcblxuICAvLyBwb2ludGVyIGFyZWEgc2hpZnRcbiAgdG91Y2hBcmVhWFNoaWZ0PzogbnVtYmVyO1xuICB0b3VjaEFyZWFZU2hpZnQ/OiBudW1iZXI7XG4gIG1vdXNlQXJlYVhTaGlmdD86IG51bWJlcjtcbiAgbW91c2VBcmVhWVNoaWZ0PzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUm91bmRCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBCdXR0b25Ob2RlT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm91bmRCdXR0b24gZXh0ZW5kcyBCdXR0b25Ob2RlIHtcblxuICBwdWJsaWMgc3RhdGljIFRocmVlREFwcGVhcmFuY2VTdHJhdGVneTogVEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGJ1dHRvbk5vZGVDb25zdHJhaW50OiBSb3VuZEJ1dHRvbk5vZGVDb25zdHJhaW50O1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggYnV0dG9uTW9kZWw6IEJ1dHRvbk1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogUm91bmRCdXR0b25PcHRpb25zICkge1xuXG4gICAgbGV0IG9wdGlvbnMgPSBvcHRpb25pemU8Um91bmRCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgQnV0dG9uTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gUm91bmQgYnV0dG9ucyBkZWZhdWx0IHRvIG5vdCBiZWluZyBzaXphYmxlLiBZb3UgY2FuIHNldCB0aGVtIHRvIHNpemFibGUgaW4gdXAgdG8gT05FIGRpbWVuc2lvbiwgd2hlcmUgdGhleSB3aWxsXG4gICAgICAvLyB0YWtlIHRoZWlyIHNpemUgKHJhZGl1cykgZnJvbSB0aGF0IGRpbWVuc2lvbi5cbiAgICAgIHNpemFibGU6IGZhbHNlLFxuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgcmFkaXVzOiAoIHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMuY29udGVudCApID8gbnVsbCA6IDMwLFxuICAgICAgbGluZVdpZHRoOiAwLjUsIC8vIE9ubHkgbWVhbmluZ2Z1bCBpZiBzdHJva2UgaXMgbm9uLW51bGxcbiAgICAgIHN0cm9rZTogbnVsbCxcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiAwLFxuICAgICAgbW91c2VBcmVhRGlsYXRpb246IDAsXG4gICAgICB0b3VjaEFyZWFYU2hpZnQ6IDAsXG4gICAgICB0b3VjaEFyZWFZU2hpZnQ6IDAsXG4gICAgICBtb3VzZUFyZWFYU2hpZnQ6IDAsXG4gICAgICBtb3VzZUFyZWFZU2hpZnQ6IDAsXG5cbiAgICAgIC8vIEJ1dHRvbk5vZGVPcHRpb25zXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcblxuICAgICAgLy8gSWYgdGhlc2UgYXJlIG5vdCB0aGUgc2FtZSwgdGhlIGxhcmdlciBvbmUgd2lsbCBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgc2l6ZSBvZiB0aGUgYnV0dG9uXG4gICAgICB4TWFyZ2luOiA1LCAvLyBNaW5pbXVtIG1hcmdpbiBpbiB4IGRpcmVjdGlvbiwgaS5lLiBvbiBsZWZ0IGFuZCByaWdodFxuICAgICAgeU1hcmdpbjogNSwgLy8gTWluaW11bSBtYXJnaW4gaW4geSBkaXJlY3Rpb24sIGkuZS4gb24gdG9wIGFuZCBib3R0b21cblxuICAgICAgLy8gQ2xhc3MgdGhhdCBkZXRlcm1pbmVzIHRoZSBidXR0b24ncyBhcHBlYXJhbmNlIGZvciB0aGUgdmFsdWVzIG9mIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5cbiAgICAgIC8vIFNlZSBSb3VuZEJ1dHRvbi5UaHJlZURBcHBlYXJhbmNlU3RyYXRlZ3kgZm9yIGFuIGV4YW1wbGUgb2YgdGhlIGludGVyZmFjZSByZXF1aXJlZC5cbiAgICAgIGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneTogUm91bmRCdXR0b24uVGhyZWVEQXBwZWFyYW5jZVN0cmF0ZWd5XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBpZiAoICFvcHRpb25zLmNvbnRlbnQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5yYWRpdXMgPT09ICdudW1iZXInLCBgaW52YWxpZCByYWRpdXM6ICR7b3B0aW9ucy5yYWRpdXN9YCApO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucy5yYWRpdXMgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnhNYXJnaW4gPCBvcHRpb25zLnJhZGl1cywgJ3hNYXJnaW4gY2Fubm90IGJlIGxhcmdlciB0aGFuIHJhZGl1cycgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueU1hcmdpbiA8IG9wdGlvbnMucmFkaXVzLCAneU1hcmdpbiBjYW5ub3QgYmUgbGFyZ2VyIHRoYW4gcmFkaXVzJyApO1xuICAgIH1cblxuICAgIC8vIElmIG5vIG9wdGlvbnMgd2VyZSBleHBsaWNpdGx5IHBhc3NlZCBpbiBmb3IgdGhlIGJ1dHRvbiBhcHBlYXJhbmNlIHN0cmF0ZWd5LCBwYXNzIHRocm91Z2ggdGhlIGdlbmVyYWwgYXBwZWFyYW5jZVxuICAgIC8vIG9wdGlvbnMuXG4gICAgaWYgKCAhb3B0aW9ucy5idXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zICkge1xuICAgICAgb3B0aW9ucy5idXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zID0ge1xuICAgICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlLFxuICAgICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgY2lyY3VsYXIgcGFydCBvZiB0aGUgYnV0dG9uLlxuICAgIGNvbnN0IGJ1dHRvbkJhY2tncm91bmQgPSBuZXcgQ2lyY2xlKCAxICk7XG5cbiAgICBjb25zdCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgPSBfLnBpY2soIG9wdGlvbnMsIE5vZGUuUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTICk7XG4gICAgb3B0aW9ucyA9IF8ub21pdCggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSBhcyB0eXBlb2Ygb3B0aW9ucztcblxuICAgIHN1cGVyKCBidXR0b25Nb2RlbCwgYnV0dG9uQmFja2dyb3VuZCwgaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LCBvcHRpb25zICk7XG5cblxuICAgIHRoaXMuYnV0dG9uTm9kZUNvbnN0cmFpbnQgPSBuZXcgUm91bmRCdXR0b25Ob2RlQ29uc3RyYWludCggdGhpcywgdGhpcy5sYXlvdXRTaXplUHJvcGVydHksIHtcbiAgICAgIGNvbnRlbnQ6IG9wdGlvbnMuY29udGVudCA/PyBudWxsLFxuICAgICAgcmFkaXVzOiBvcHRpb25zLnJhZGl1cyxcbiAgICAgIGJ1dHRvbkJhY2tncm91bmQ6IGJ1dHRvbkJhY2tncm91bmQsXG4gICAgICB4TWFyZ2luOiBvcHRpb25zLnhNYXJnaW4sXG4gICAgICB5TWFyZ2luOiBvcHRpb25zLnlNYXJnaW4sXG4gICAgICBtYXhMaW5lV2lkdGg6IHRoaXMubWF4TGluZVdpZHRoLFxuICAgICAgdG91Y2hBcmVhRGlsYXRpb246IG9wdGlvbnMudG91Y2hBcmVhRGlsYXRpb24sXG4gICAgICB0b3VjaEFyZWFYU2hpZnQ6IG9wdGlvbnMudG91Y2hBcmVhWFNoaWZ0LFxuICAgICAgdG91Y2hBcmVhWVNoaWZ0OiBvcHRpb25zLnRvdWNoQXJlYVlTaGlmdCxcbiAgICAgIG1vdXNlQXJlYURpbGF0aW9uOiBvcHRpb25zLm1vdXNlQXJlYURpbGF0aW9uLFxuICAgICAgbW91c2VBcmVhWFNoaWZ0OiBvcHRpb25zLm1vdXNlQXJlYVhTaGlmdCxcbiAgICAgIG1vdXNlQXJlYVlTaGlmdDogb3B0aW9ucy5tb3VzZUFyZWFZU2hpZnRcbiAgICB9ICk7XG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gdGhpcy5idXR0b25Ob2RlQ29uc3RyYWludC5kaXNwb3NlKCkgKTtcblxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocmVlREFwcGVhcmFuY2VTdHJhdGVneSBpcyBhIHZhbHVlIGZvciBSb3VuZEJ1dHRvbiBvcHRpb25zLmJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneS4gSXQgbWFrZXMgYSByb3VuZCBidXR0b25cbiAqIGxvb2sgM0QtaXNoIGJ5IHVzaW5nIGdyYWRpZW50cyB0aGF0IGNyZWF0ZSB0aGUgYXBwZWFyYW5jZSBvZiBoaWdobGlnaHRlZCBhbmQgc2hhZGVkIGVkZ2VzLiBUaGUgZ3JhZGllbnRzIGFyZVxuICogc2V0IHVwIHRvIG1ha2UgdGhlIGxpZ2h0IHNvdXJjZSBhcHBlYXIgdG8gYmUgaW4gdGhlIHVwcGVyIGxlZnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUaHJlZURBcHBlYXJhbmNlU3RyYXRlZ3kge1xuXG4gIHB1YmxpYyByZWFkb25seSBtYXhMaW5lV2lkdGg6IG51bWJlcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VUaHJlZURBcHBlYXJhbmNlU3RyYXRlZ3k6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBidXR0b25CYWNrZ3JvdW5kIC0gdGhlIE5vZGUgZm9yIHRoZSBidXR0b24ncyBiYWNrZ3JvdW5kLCBzYW5zIGNvbnRlbnRcbiAgICogQHBhcmFtIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gYmFzZUNvbG9yUHJvcGVydHlcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGJ1dHRvbkJhY2tncm91bmQ6IFBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCdXR0b25JbnRlcmFjdGlvblN0YXRlIHwgUmFkaW9CdXR0b25JbnRlcmFjdGlvblN0YXRlPixcbiAgICAgICAgICAgICAgICAgICAgICBiYXNlQ29sb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+LFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zICkge1xuXG4gICAgLy8gSWYgc3Ryb2tlIGFuZCBsaW5lV2lkdGggZXhpc3QgaW4gdGhlIHByb3ZpZGVkIG9wdGlvbnMsIHRoZXkgYmVjb21lIHRoZSBkZWZhdWx0IGZvciBhbGwgc3Ryb2tlcyBhbmQgbGluZSB3aWR0aHMuXG4gICAgLy8gSWYgbm90LCBkZWZhdWx0cyBhcmUgY3JlYXRlZC5cbiAgICBjb25zdCBkZWZhdWx0U3Ryb2tlID0gKCBwcm92aWRlZE9wdGlvbnMgJiYgcHJvdmlkZWRPcHRpb25zLnN0cm9rZSApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zLnN0cm9rZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNCB9ICk7XG4gICAgY29uc3QgZGVmYXVsdExpbmVXaWR0aCA9ICggcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5saW5lV2lkdGggIT09IHVuZGVmaW5lZCApID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zLmxpbmVXaWR0aCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAuMztcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnM+KCkoIHtcbiAgICAgIHN0cm9rZTogZGVmYXVsdFN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogZGVmYXVsdExpbmVXaWR0aCxcbiAgICAgIG92ZXJTdHJva2U6IGRlZmF1bHRTdHJva2UsXG4gICAgICBvdmVyTGluZVdpZHRoOiBkZWZhdWx0TGluZVdpZHRoLFxuICAgICAgb3ZlckJ1dHRvbk9wYWNpdHk6IDEsXG4gICAgICBzZWxlY3RlZFN0cm9rZTogZGVmYXVsdFN0cm9rZSxcbiAgICAgIHNlbGVjdGVkTGluZVdpZHRoOiBkZWZhdWx0TGluZVdpZHRoLFxuICAgICAgc2VsZWN0ZWRCdXR0b25PcGFjaXR5OiAxLFxuICAgICAgZGVzZWxlY3RlZEZpbGw6IG51bGwsXG4gICAgICBkZXNlbGVjdGVkU3Ryb2tlOiBkZWZhdWx0U3Ryb2tlLFxuICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogZGVmYXVsdExpbmVXaWR0aCxcbiAgICAgIGRlc2VsZWN0ZWRCdXR0b25PcGFjaXR5OiAxLFxuXG4gICAgICBvdmVyRmlsbDogYmFzZUNvbG9yUHJvcGVydHlcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIER5bmFtaWMgY29sb3JzXG4gICAgY29uc3QgYmFzZUJyaWdodGVyOFByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggYmFzZUNvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAwLjggfSApO1xuICAgIGNvbnN0IGJhc2VCcmlnaHRlcjdQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogMC43IH0gKTtcbiAgICBjb25zdCBiYXNlQnJpZ2h0ZXIzUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBiYXNlQ29sb3JQcm9wZXJ0eSwgeyBsdW1pbmFuY2VGYWN0b3I6IDAuMyB9ICk7XG4gICAgY29uc3QgYmFzZURhcmtlcjFQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMSB9ICk7XG4gICAgY29uc3QgYmFzZURhcmtlcjJQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMiB9ICk7XG4gICAgY29uc3QgYmFzZURhcmtlcjRQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNCB9ICk7XG4gICAgY29uc3QgYmFzZURhcmtlcjVQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJhc2VDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNSB9ICk7XG4gICAgY29uc3QgYmFzZVRyYW5zcGFyZW50UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGJhc2VDb2xvclByb3BlcnR5IF0sIGNvbG9yID0+IGNvbG9yLndpdGhBbHBoYSggMCApICk7XG5cbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgb3ZlcmxheSB0aGF0IGlzIHVzZWQgdG8gYWRkIHNoYWRpbmcuXG4gICAgY29uc3Qgc2hhZG93Tm9kZSA9IG5ldyBDaXJjbGUoIDEsIHtcbiAgICAgIHN0cm9rZTogIW9wdGlvbnMuc3Ryb2tlID8gYmFzZURhcmtlcjRQcm9wZXJ0eSA6IG9wdGlvbnMuc3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICBidXR0b25CYWNrZ3JvdW5kLmFkZENoaWxkKCBzaGFkb3dOb2RlICk7XG5cbiAgICB0aGlzLm1heExpbmVXaWR0aCA9IHNoYWRvd05vZGUuaGFzU3Ryb2tlKCkgJiYgb3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5saW5lV2lkdGggPT09ICdudW1iZXInID8gb3B0aW9ucy5saW5lV2lkdGggOiAwO1xuXG4gICAgbGV0IGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lcjogKCBpbnRlcmFjdGlvblN0YXRlOiBCdXR0b25JbnRlcmFjdGlvblN0YXRlICkgPT4gdm9pZDtcblxuICAgIC8vIFdlJ2xsIG5lZWQgdG8gbGlzdGVuIHRvIHRoZSBzaGFwZSBjaGFuZ2VzIGluIG9yZGVyIHRvIHVwZGF0ZSBvdXIgYXBwZWFyYW5jZS5cbiAgICBjb25zdCBsaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIC8vIFNldCB1cCB2YXJpYWJsZXMgbmVlZGVkIHRvIGNyZWF0ZSB0aGUgdmFyaW91cyBncmFkaWVudCBmaWxscyBhbmQgb3RoZXJ3aXNlIG1vZGlmeSB0aGUgYXBwZWFyYW5jZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYnV0dG9uQmFja2dyb3VuZCBpbnN0YW5jZW9mIENpcmNsZSApO1xuICAgICAgY29uc3QgYnV0dG9uUmFkaXVzID0gKCBidXR0b25CYWNrZ3JvdW5kIGFzIENpcmNsZSApLnJhZGl1cztcblxuICAgICAgY29uc3QgaW5uZXJHcmFkaWVudFJhZGl1cyA9IGJ1dHRvblJhZGl1cyAtIEhJR0hMSUdIVF9HUkFESUVOVF9MRU5HVEggLyAyO1xuICAgICAgY29uc3Qgb3V0ZXJHcmFkaWVudFJhZGl1cyA9IGJ1dHRvblJhZGl1cyArIEhJR0hMSUdIVF9HUkFESUVOVF9MRU5HVEggLyAyO1xuICAgICAgY29uc3QgZ3JhZGllbnRPZmZzZXQgPSBISUdITElHSFRfR1JBRElFTlRfTEVOR1RIIC8gMjtcblxuICAgICAgLy8gSWYgb3VyIGJ1dHRvbiBpcyBub3QgbGFyZ2UgZW5vdWdoIGZvciB0aGUgZ3JhZGllbnRzIHRvIGJlIHZpc2libGUsIGRvbid0IGJvdGhlciBzZXR0aW5nIHRoZW0gdXAuXG4gICAgICBpZiAoIGJ1dHRvblJhZGl1cyA8IGdyYWRpZW50T2Zmc2V0ICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVwRmlsbEhpZ2hsaWdodCA9IG5ldyBSYWRpYWxHcmFkaWVudCggZ3JhZGllbnRPZmZzZXQsIGdyYWRpZW50T2Zmc2V0LCBpbm5lckdyYWRpZW50UmFkaXVzLCBncmFkaWVudE9mZnNldCwgZ3JhZGllbnRPZmZzZXQsIG91dGVyR3JhZGllbnRSYWRpdXMgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBiYXNlQ29sb3JQcm9wZXJ0eSApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGJhc2VCcmlnaHRlcjdQcm9wZXJ0eSApO1xuXG4gICAgICBjb25zdCB1cEZpbGxTaGFkb3cgPSBuZXcgUmFkaWFsR3JhZGllbnQoIC1ncmFkaWVudE9mZnNldCwgLWdyYWRpZW50T2Zmc2V0LCBpbm5lckdyYWRpZW50UmFkaXVzLCAtZ3JhZGllbnRPZmZzZXQsIC1ncmFkaWVudE9mZnNldCwgb3V0ZXJHcmFkaWVudFJhZGl1cyApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VUcmFuc3BhcmVudFByb3BlcnR5IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMSwgYmFzZURhcmtlcjVQcm9wZXJ0eSApO1xuXG4gICAgICBjb25zdCBvdmVyRmlsbEhpZ2hsaWdodCA9IG5ldyBSYWRpYWxHcmFkaWVudCggZ3JhZGllbnRPZmZzZXQsIGdyYWRpZW50T2Zmc2V0LCBpbm5lckdyYWRpZW50UmFkaXVzLCBncmFkaWVudE9mZnNldCwgZ3JhZGllbnRPZmZzZXQsIG91dGVyR3JhZGllbnRSYWRpdXMgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBiYXNlQnJpZ2h0ZXIzUHJvcGVydHkgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLCBiYXNlQnJpZ2h0ZXI4UHJvcGVydHkgKTtcblxuICAgICAgY29uc3Qgb3ZlckZpbGxTaGFkb3cgPSBuZXcgUmFkaWFsR3JhZGllbnQoIC1ncmFkaWVudE9mZnNldCwgLWdyYWRpZW50T2Zmc2V0LCBpbm5lckdyYWRpZW50UmFkaXVzLCAtZ3JhZGllbnRPZmZzZXQsIC1ncmFkaWVudE9mZnNldCwgb3V0ZXJHcmFkaWVudFJhZGl1cyApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VUcmFuc3BhcmVudFByb3BlcnR5IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMSwgYmFzZURhcmtlcjVQcm9wZXJ0eSApO1xuXG4gICAgICBjb25zdCBwcmVzc2VkRmlsbCA9IG5ldyBSYWRpYWxHcmFkaWVudCggLWdyYWRpZW50T2Zmc2V0LCAtZ3JhZGllbnRPZmZzZXQsIDAsIDAsIDAsIG91dGVyR3JhZGllbnRSYWRpdXMgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBiYXNlRGFya2VyMVByb3BlcnR5IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC42LCBiYXNlRGFya2VyMlByb3BlcnR5IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC44LCBiYXNlQ29sb3JQcm9wZXJ0eSApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGJhc2VCcmlnaHRlcjhQcm9wZXJ0eSApO1xuXG4gICAgICBzaGFkb3dOb2RlLnJhZGl1cyA9IGJ1dHRvblJhZGl1cztcblxuICAgICAgLy8gQ2FjaGUgZ3JhZGllbnRzXG4gICAgICBidXR0b25CYWNrZ3JvdW5kLmNhY2hlZFBhaW50cyA9IFsgdXBGaWxsSGlnaGxpZ2h0LCBvdmVyRmlsbEhpZ2hsaWdodCwgcHJlc3NlZEZpbGwgXTtcbiAgICAgIHNoYWRvd05vZGUuY2FjaGVkUGFpbnRzID0gWyB1cEZpbGxTaGFkb3csIG92ZXJGaWxsU2hhZG93IF07XG5cbiAgICAgIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciAmJiBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudW5saW5rKCBpbnRlcmFjdGlvblN0YXRlTGlzdGVuZXIgKTtcblxuICAgICAgLy8gQ2hhbmdlIGNvbG9ycyB0byBtYXRjaCBpbnRlcmFjdGlvblN0YXRlXG4gICAgICBpbnRlcmFjdGlvblN0YXRlTGlzdGVuZXIgPSAoIGludGVyYWN0aW9uU3RhdGU6IEJ1dHRvbkludGVyYWN0aW9uU3RhdGUgKSA9PiB7XG4gICAgICAgIHN3aXRjaCggaW50ZXJhY3Rpb25TdGF0ZSApIHtcblxuICAgICAgICAgIGNhc2UgQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5JRExFOlxuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5maWxsID0gb3B0aW9ucy5kZXNlbGVjdGVkRmlsbCB8fCB1cEZpbGxIaWdobGlnaHQ7XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLnN0cm9rZSA9IG9wdGlvbnMuZGVzZWxlY3RlZFN0cm9rZTtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQubGluZVdpZHRoID0gb3B0aW9ucy5kZXNlbGVjdGVkTGluZVdpZHRoO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5vcGFjaXR5ID0gb3B0aW9ucy5kZXNlbGVjdGVkQnV0dG9uT3BhY2l0eTtcbiAgICAgICAgICAgIHNoYWRvd05vZGUuZmlsbCA9IHVwRmlsbFNoYWRvdztcbiAgICAgICAgICAgIHNoYWRvd05vZGUub3BhY2l0eSA9IG9wdGlvbnMuZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5PVkVSOlxuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5maWxsID0gb3ZlckZpbGxIaWdobGlnaHQ7XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLnN0cm9rZSA9IG9wdGlvbnMub3ZlclN0cm9rZTtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQubGluZVdpZHRoID0gb3B0aW9ucy5vdmVyTGluZVdpZHRoO1xuICAgICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5vcGFjaXR5ID0gb3B0aW9ucy5vdmVyQnV0dG9uT3BhY2l0eTtcbiAgICAgICAgICAgIHNoYWRvd05vZGUuZmlsbCA9IG92ZXJGaWxsU2hhZG93O1xuICAgICAgICAgICAgc2hhZG93Tm9kZS5vcGFjaXR5ID0gb3B0aW9ucy5vdmVyQnV0dG9uT3BhY2l0eTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBCdXR0b25JbnRlcmFjdGlvblN0YXRlLlBSRVNTRUQ6XG4gICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kLmZpbGwgPSBwcmVzc2VkRmlsbDtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQuc3Ryb2tlID0gb3B0aW9ucy5zZWxlY3RlZFN0cm9rZTtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQubGluZVdpZHRoID0gb3B0aW9ucy5zZWxlY3RlZExpbmVXaWR0aDtcbiAgICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQub3BhY2l0eSA9IG9wdGlvbnMuc2VsZWN0ZWRCdXR0b25PcGFjaXR5O1xuICAgICAgICAgICAgc2hhZG93Tm9kZS5maWxsID0gb3ZlckZpbGxTaGFkb3c7XG4gICAgICAgICAgICBzaGFkb3dOb2RlLm9wYWNpdHkgPSBvcHRpb25zLnNlbGVjdGVkQnV0dG9uT3BhY2l0eTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYHVuc3VwcG9ydGVkIGludGVyYWN0aW9uU3RhdGU6ICR7aW50ZXJhY3Rpb25TdGF0ZX1gICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkubGluayggaW50ZXJhY3Rpb25TdGF0ZUxpc3RlbmVyICk7XG4gICAgfTtcbiAgICBidXR0b25CYWNrZ3JvdW5kLnNlbGZCb3VuZHNQcm9wZXJ0eS5saW5rKCBsaXN0ZW5lciApO1xuXG4gICAgdGhpcy5kaXNwb3NlVGhyZWVEQXBwZWFyYW5jZVN0cmF0ZWd5ID0gKCkgPT4ge1xuICAgICAgYnV0dG9uQmFja2dyb3VuZC5zZWxmQm91bmRzUHJvcGVydHkudW5saW5rKCBsaXN0ZW5lciApO1xuICAgICAgaWYgKCBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkuaGFzTGlzdGVuZXIoIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciApICkge1xuICAgICAgICBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkudW5saW5rKCBpbnRlcmFjdGlvblN0YXRlTGlzdGVuZXIgKTtcbiAgICAgIH1cblxuICAgICAgYmFzZUJyaWdodGVyOFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGJhc2VCcmlnaHRlcjdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBiYXNlQnJpZ2h0ZXIzUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgYmFzZURhcmtlcjFQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBiYXNlRGFya2VyMlByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGJhc2VEYXJrZXI0UHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgYmFzZURhcmtlcjVQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBiYXNlVHJhbnNwYXJlbnRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVRocmVlREFwcGVhcmFuY2VTdHJhdGVneSgpO1xuICB9XG59XG5cblJvdW5kQnV0dG9uLlRocmVlREFwcGVhcmFuY2VTdHJhdGVneSA9IFRocmVlREFwcGVhcmFuY2VTdHJhdGVneTtcblxudHlwZSBSb3VuZEJ1dHRvbk5vZGVDb25zdHJhaW50T3B0aW9ucyA9IHtcbiAgYnV0dG9uQmFja2dyb3VuZDogQ2lyY2xlO1xuICBtYXhMaW5lV2lkdGg6IG51bWJlcjtcbn0gJiBSZXF1aXJlZDxQaWNrPFJvdW5kQnV0dG9uT3B0aW9ucyxcbiAgJ2NvbnRlbnQnIHwgJ3JhZGl1cycgfCAneE1hcmdpbicgfCAneU1hcmdpbicgfFxuICAndG91Y2hBcmVhRGlsYXRpb24nIHwgJ3RvdWNoQXJlYVhTaGlmdCcgfCAndG91Y2hBcmVhWVNoaWZ0JyB8ICdtb3VzZUFyZWFEaWxhdGlvbicgfCAnbW91c2VBcmVhWFNoaWZ0JyB8ICdtb3VzZUFyZWFZU2hpZnQnXG4+PjtcblxuY2xhc3MgUm91bmRCdXR0b25Ob2RlQ29uc3RyYWludCBleHRlbmRzIExheW91dENvbnN0cmFpbnQge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogUm91bmRCdXR0b25Ob2RlQ29uc3RyYWludE9wdGlvbnM7XG5cbiAgcHJpdmF0ZSBpc0ZpcnN0TGF5b3V0ID0gdHJ1ZTtcblxuICAvLyBTdG9yZWQgc28gdGhhdCB3ZSBjYW4gcHJldmVudCB1cGRhdGVzIGlmIHdlJ3JlIG5vdCBtYXJrZWQgc2l6YWJsZSBpbiBhIGNlcnRhaW4gZGlyZWN0aW9uXG4gIHByaXZhdGUgbGFzdExvY2FsV2lkdGggPSAwO1xuICBwcml2YXRlIGxhc3RMb2NhbEhlaWdodCA9IDA7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBidXR0b25Ob2RlOiBCdXR0b25Ob2RlLFxuICAgIHB1YmxpYyByZWFkb25seSBsYXlvdXRTaXplUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxEaW1lbnNpb24yPixcbiAgICBvcHRpb25zOiBSb3VuZEJ1dHRvbk5vZGVDb25zdHJhaW50T3B0aW9uc1xuICApIHtcblxuICAgIHN1cGVyKCBidXR0b25Ob2RlICk7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgdGhpcy5idXR0b25Ob2RlLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgICB0aGlzLmJ1dHRvbk5vZGUubG9jYWxQcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcblxuICAgIGlmICggdGhpcy5vcHRpb25zLmNvbnRlbnQgKSB7XG4gICAgICB0aGlzLmFkZE5vZGUoIHRoaXMub3B0aW9ucy5jb250ZW50ICk7XG4gICAgfVxuXG4gICAgdGhpcy5sYXlvdXQoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XG4gICAgc3VwZXIubGF5b3V0KCk7XG5cbiAgICBjb25zdCBidXR0b25Ob2RlID0gdGhpcy5idXR0b25Ob2RlO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLm9wdGlvbnMuY29udGVudDtcbiAgICBjb25zdCBjb250ZW50UHJveHkgPSBjb250ZW50ID8gdGhpcy5jcmVhdGVMYXlvdXRQcm94eSggY29udGVudCApISA6IG51bGw7XG5cbiAgICAvLyBTaG91bGQgb25seSBoYXBwZW4gd2hlbiB3ZSBhcmUgZGlzY29ubmVjdGVkIGR1cmluZyBkaXNwb3NhbFxuICAgIGlmICggISFjb250ZW50ICE9PSAhIWNvbnRlbnRQcm94eSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB3aWR0aFNpemFibGUgPSBidXR0b25Ob2RlLndpZHRoU2l6YWJsZTtcbiAgICBjb25zdCBoZWlnaHRTaXphYmxlID0gYnV0dG9uTm9kZS5oZWlnaHRTaXphYmxlO1xuXG4gICAgY29uc3QgY29udGVudE1pbmltdW1XaWR0aFdpdGhNYXJnaW5zID0gY29udGVudFByb3h5ID8gY29udGVudFByb3h5Lm1pbmltdW1XaWR0aCArIHRoaXMub3B0aW9ucy54TWFyZ2luICogMiA6IDA7XG4gICAgY29uc3QgY29udGVudE1pbmltdW1IZWlnaHRXaXRoTWFyZ2lucyA9IGNvbnRlbnRQcm94eSA/IGNvbnRlbnRQcm94eS5taW5pbXVtSGVpZ2h0ICsgdGhpcy5vcHRpb25zLnlNYXJnaW4gKiAyIDogMDtcblxuICAgIGxldCBjb250ZW50TWluaW11bVJhZGl1cyA9IE1hdGgubWF4KCBjb250ZW50TWluaW11bVdpZHRoV2l0aE1hcmdpbnMsIGNvbnRlbnRNaW5pbXVtSGVpZ2h0V2l0aE1hcmdpbnMgKSAvIDI7XG5cbiAgICAvLyBJZiBhIGluaXRpYWwgKG1pbmltdW0pIHJhZGl1cyBpcyBzcGVjaWZpZWQsIHVzZSB0aGlzIGFzIGFuIG92ZXJyaWRlIChhbmQgd2Ugd2lsbCBzY2FsZSB0aGUgY29udGVudCBkb3duIHRvIGZpdClcbiAgICBpZiAoIHRoaXMub3B0aW9ucy5yYWRpdXMgIT09IG51bGwgKSB7XG4gICAgICBjb250ZW50TWluaW11bVJhZGl1cyA9IHRoaXMub3B0aW9ucy5yYWRpdXM7XG4gICAgfVxuXG4gICAgLy8gT25seSBhbGxvdyBhbiBpbml0aWFsIHVwZGF0ZSBpZiB3ZSBhcmUgbm90IHNpemFibGUgaW4gdGhhdCBkaW1lbnNpb25cbiAgICBsZXQgbWluaW11bVdpZHRoID1cbiAgICAgICggdGhpcy5pc0ZpcnN0TGF5b3V0IHx8IHdpZHRoU2l6YWJsZSApXG4gICAgICA/IDIgKiBjb250ZW50TWluaW11bVJhZGl1c1xuICAgICAgOiBidXR0b25Ob2RlLmxvY2FsTWluaW11bVdpZHRoITtcbiAgICBsZXQgbWluaW11bUhlaWdodCA9ICggdGhpcy5pc0ZpcnN0TGF5b3V0IHx8IGhlaWdodFNpemFibGUgKVxuICAgICAgPyAyICogY29udGVudE1pbmltdW1SYWRpdXNcbiAgICAgIDogYnV0dG9uTm9kZS5sb2NhbE1pbmltdW1IZWlnaHQhO1xuXG4gICAgLy8gT3VyIHJlc3VsdGluZyBzaXplcyAoYWxsb3cgc2V0dGluZyBwcmVmZXJyZWQgd2lkdGgvaGVpZ2h0IG9uIHRoZSBidXR0b25Ob2RlKVxuICAgIHRoaXMubGFzdExvY2FsV2lkdGggPSB0aGlzLmlzRmlyc3RMYXlvdXQgfHwgd2lkdGhTaXphYmxlXG4gICAgICA/IE1hdGgubWF4KCBtaW5pbXVtV2lkdGgsIHdpZHRoU2l6YWJsZSA/IGJ1dHRvbk5vZGUubG9jYWxQcmVmZXJyZWRXaWR0aCA/PyAwIDogMCApXG4gICAgICA6IHRoaXMubGFzdExvY2FsV2lkdGg7XG4gICAgdGhpcy5sYXN0TG9jYWxIZWlnaHQgPSB0aGlzLmlzRmlyc3RMYXlvdXQgfHwgaGVpZ2h0U2l6YWJsZVxuICAgICAgPyBNYXRoLm1heCggbWluaW11bUhlaWdodCwgaGVpZ2h0U2l6YWJsZSA/IGJ1dHRvbk5vZGUubG9jYWxQcmVmZXJyZWRIZWlnaHQgPz8gMCA6IDAgKVxuICAgICAgOiB0aGlzLmxhc3RMb2NhbEhlaWdodDtcblxuICAgIGNvbnN0IGFjdHVhbFNpemUgPSBNYXRoLm1heCggdGhpcy5sYXN0TG9jYWxXaWR0aCwgdGhpcy5sYXN0TG9jYWxIZWlnaHQgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF3aWR0aFNpemFibGUgfHwgIWhlaWdodFNpemFibGUsICdSb3VuZEJ1dHRvbiBzaG91bGQgbm90IGJlIHNpemFibGUgaW4gYm90aCBkaW1lbnNpb25zJyApO1xuXG4gICAgLy8gSWYgd2UgaGF2ZSBhIHNpbmdsZSBzaXphYmxlIGRpcmVjdGlvbiwgd2Ugd2lsbCBhZGp1c3QgdGhlIG1pbmltdW0gd2lkdGggb2YgdGhlIE9USEVSIGRpcmVjdGlvbiB0byBtYXRjaC5cbiAgICAvLyBUaGlzIGRvZXMgbm90IHdvcmsgaWYgYm90aCBkaW1lbnNpb25zIGFyZSBzaXphYmxlLCBiZWNhdXNlIGl0IHdpbGwgcnVuIGludG8gY29uZmxpY3RzLlxuICAgIGlmICggIXdpZHRoU2l6YWJsZSAmJiBoZWlnaHRTaXphYmxlICkge1xuICAgICAgbWluaW11bVdpZHRoID0gYWN0dWFsU2l6ZTtcbiAgICB9XG4gICAgaWYgKCAhaGVpZ2h0U2l6YWJsZSAmJiB3aWR0aFNpemFibGUgKSB7XG4gICAgICBtaW5pbXVtSGVpZ2h0ID0gYWN0dWFsU2l6ZTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuaXNGaXJzdExheW91dCB8fCB3aWR0aFNpemFibGUgfHwgaGVpZ2h0U2l6YWJsZSApIHtcbiAgICAgIGNvbnN0IHByZWZlcnJlZFJhZGl1cyA9ICggYWN0dWFsU2l6ZSAtIHRoaXMub3B0aW9ucy5tYXhMaW5lV2lkdGggKSAvIDI7XG5cbiAgICAgIHRoaXMub3B0aW9ucy5idXR0b25CYWNrZ3JvdW5kLnJhZGl1cyA9IHByZWZlcnJlZFJhZGl1cztcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuaXNGaXJzdExheW91dCB8fCB3aWR0aFNpemFibGUgfHwgaGVpZ2h0U2l6YWJsZSApIHtcbiAgICAgICAgLy8gR2V0IHRoZSBhY3R1YWwgYnV0dG9uIHJhZGl1cyBhZnRlciBjYWxsaW5nIHN1cGVyLCBzbyB0aGF0IGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSBoYXMgYXBwbGllZCB0aGUgc3Ryb2tlLlxuICAgICAgICAvLyBUaGlzIGFjY291bnRzIGZvciBzdHJva2UgKyBsaW5lV2lkdGgsIHdoaWNoIGlzIGltcG9ydGFudCB3aGVuIHNldHRpbmcgcG9pbnRlciBhcmVhcyBhbmQgZm9jdXMgaGlnaGxpZ2h0LlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNjYwXG4gICAgICAgIGNvbnN0IGJ1dHRvbkJhY2tncm91bmRSYWRpdXMgPSB0aGlzLm9wdGlvbnMuYnV0dG9uQmFja2dyb3VuZC5sb2NhbEJvdW5kcy53aWR0aCAvIDI7XG5cbiAgICAgICAgLy8gU2V0IHBvaW50ZXIgYXJlYXMuXG4gICAgICAgIHRoaXMuYnV0dG9uTm9kZS50b3VjaEFyZWEgPSBTaGFwZS5jaXJjbGUoIHRoaXMub3B0aW9ucy50b3VjaEFyZWFYU2hpZnQsIHRoaXMub3B0aW9ucy50b3VjaEFyZWFZU2hpZnQsXG4gICAgICAgICAgYnV0dG9uQmFja2dyb3VuZFJhZGl1cyArIHRoaXMub3B0aW9ucy50b3VjaEFyZWFEaWxhdGlvbiApO1xuICAgICAgICB0aGlzLmJ1dHRvbk5vZGUubW91c2VBcmVhID0gU2hhcGUuY2lyY2xlKCB0aGlzLm9wdGlvbnMubW91c2VBcmVhWFNoaWZ0LCB0aGlzLm9wdGlvbnMubW91c2VBcmVhWVNoaWZ0LFxuICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmRSYWRpdXMgKyB0aGlzLm9wdGlvbnMubW91c2VBcmVhRGlsYXRpb24gKTtcblxuICAgICAgICAvLyBwZG9tIC0gZm9jdXMgaGlnaGxpZ2h0IGlzIGNpcmN1bGFyIGZvciByb3VuZCBidXR0b25zLCB3aXRoIGEgbGl0dGxlIGJpdCBvZiBwYWRkaW5nXG4gICAgICAgIC8vIGJldHdlZW4gYnV0dG9uIHNoYXBlIGFuZCBpbm5lciBlZGdlIG9mIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLmJ1dHRvbk5vZGUuZm9jdXNIaWdobGlnaHQgPSBTaGFwZS5jaXJjbGUoIDAsIDAsIGJ1dHRvbkJhY2tncm91bmRSYWRpdXMgKyA1ICk7XG4gICAgfVxuXG4gICAgaWYgKCBjb250ZW50UHJveHkgKSB7XG4gICAgICBjb25zdCBwcmVmZXJyZWRDb250ZW50V2lkdGggPSBhY3R1YWxTaXplIC0gdGhpcy5vcHRpb25zLnhNYXJnaW4gKiAyO1xuICAgICAgY29uc3QgcHJlZmVycmVkQ29udGVudEhlaWdodCA9IGFjdHVhbFNpemUgLSB0aGlzLm9wdGlvbnMueU1hcmdpbiAqIDI7XG5cbiAgICAgIGNvbnRlbnRQcm94eS5wcmVmZXJyZWRXaWR0aCA9IHByZWZlcnJlZENvbnRlbnRXaWR0aDtcbiAgICAgIGNvbnRlbnRQcm94eS5wcmVmZXJyZWRIZWlnaHQgPSBwcmVmZXJyZWRDb250ZW50SGVpZ2h0O1xuXG4gICAgICAvLyBPbmx5IGFwcGx5IG1heCBzaXplcyBpZiBhIHNpemUgaXMgc3BlY2lmaWVkIGluIHRoZSBidXR0b24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84ODlcbiAgICAgIGlmICggdGhpcy5vcHRpb25zLnJhZGl1cyAhPT0gbnVsbCApIHtcbiAgICAgICAgY29uc3QgY29udGVudENvbnRhaW5lciA9IHRoaXMuYnV0dG9uTm9kZS5jb250ZW50Q29udGFpbmVyITtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY29udGVudENvbnRhaW5lciApO1xuXG4gICAgICAgIGNvbnRlbnRDb250YWluZXIubWF4V2lkdGggPSBwcmVmZXJyZWRDb250ZW50V2lkdGg7XG4gICAgICAgIGNvbnRlbnRDb250YWluZXIubWF4SGVpZ2h0ID0gcHJlZmVycmVkQ29udGVudEhlaWdodDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmlzRmlyc3RMYXlvdXQgPSBmYWxzZTtcblxuICAgIHRoaXMubGF5b3V0U2l6ZVByb3BlcnR5LnZhbHVlID0gbmV3IERpbWVuc2lvbjIoIHRoaXMubGFzdExvY2FsV2lkdGgsIHRoaXMubGFzdExvY2FsSGVpZ2h0ICk7XG5cbiAgICAvLyBTZXQgbWluaW11bXMgYXQgdGhlIGVuZFxuICAgIGJ1dHRvbk5vZGUubG9jYWxNaW5pbXVtV2lkdGggPSBtaW5pbXVtV2lkdGg7XG4gICAgYnV0dG9uTm9kZS5sb2NhbE1pbmltdW1IZWlnaHQgPSBtaW5pbXVtSGVpZ2h0O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5idXR0b25Ob2RlLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS51bmxpbmsoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG4gICAgdGhpcy5idXR0b25Ob2RlLmxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkudW5saW5rKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ1JvdW5kQnV0dG9uJywgUm91bmRCdXR0b24gKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlNoYXBlIiwib3B0aW9uaXplIiwiQ2lyY2xlIiwiTGF5b3V0Q29uc3RyYWludCIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJSYWRpYWxHcmFkaWVudCIsInN1biIsIkJ1dHRvbkludGVyYWN0aW9uU3RhdGUiLCJCdXR0b25Ob2RlIiwiSElHSExJR0hUX0dSQURJRU5UX0xFTkdUSCIsIlJvdW5kQnV0dG9uIiwiYnV0dG9uTW9kZWwiLCJpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2l6YWJsZSIsInJhZGl1cyIsImNvbnRlbnQiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsIm1vdXNlQXJlYURpbGF0aW9uIiwidG91Y2hBcmVhWFNoaWZ0IiwidG91Y2hBcmVhWVNoaWZ0IiwibW91c2VBcmVhWFNoaWZ0IiwibW91c2VBcmVhWVNoaWZ0IiwiY3Vyc29yIiwieE1hcmdpbiIsInlNYXJnaW4iLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kiLCJUaHJlZURBcHBlYXJhbmNlU3RyYXRlZ3kiLCJhc3NlcnQiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIiwiYnV0dG9uQmFja2dyb3VuZCIsImJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyIsIl8iLCJwaWNrIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwib21pdCIsImJ1dHRvbk5vZGVDb25zdHJhaW50IiwiUm91bmRCdXR0b25Ob2RlQ29uc3RyYWludCIsImxheW91dFNpemVQcm9wZXJ0eSIsIm1heExpbmVXaWR0aCIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJkaXNwb3NlIiwibXV0YXRlIiwiZGlzcG9zZVRocmVlREFwcGVhcmFuY2VTdHJhdGVneSIsImJhc2VDb2xvclByb3BlcnR5IiwiZGVmYXVsdFN0cm9rZSIsImx1bWluYW5jZUZhY3RvciIsImRlZmF1bHRMaW5lV2lkdGgiLCJ1bmRlZmluZWQiLCJvdmVyU3Ryb2tlIiwib3ZlckxpbmVXaWR0aCIsIm92ZXJCdXR0b25PcGFjaXR5Iiwic2VsZWN0ZWRTdHJva2UiLCJzZWxlY3RlZExpbmVXaWR0aCIsInNlbGVjdGVkQnV0dG9uT3BhY2l0eSIsImRlc2VsZWN0ZWRGaWxsIiwiZGVzZWxlY3RlZFN0cm9rZSIsImRlc2VsZWN0ZWRMaW5lV2lkdGgiLCJkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eSIsIm92ZXJGaWxsIiwiYmFzZUJyaWdodGVyOFByb3BlcnR5IiwiYmFzZUJyaWdodGVyN1Byb3BlcnR5IiwiYmFzZUJyaWdodGVyM1Byb3BlcnR5IiwiYmFzZURhcmtlcjFQcm9wZXJ0eSIsImJhc2VEYXJrZXIyUHJvcGVydHkiLCJiYXNlRGFya2VyNFByb3BlcnR5IiwiYmFzZURhcmtlcjVQcm9wZXJ0eSIsImJhc2VUcmFuc3BhcmVudFByb3BlcnR5IiwiY29sb3IiLCJ3aXRoQWxwaGEiLCJzaGFkb3dOb2RlIiwicGlja2FibGUiLCJhZGRDaGlsZCIsImhhc1N0cm9rZSIsImludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciIsImxpc3RlbmVyIiwiYnV0dG9uUmFkaXVzIiwiaW5uZXJHcmFkaWVudFJhZGl1cyIsIm91dGVyR3JhZGllbnRSYWRpdXMiLCJncmFkaWVudE9mZnNldCIsInVwRmlsbEhpZ2hsaWdodCIsImFkZENvbG9yU3RvcCIsInVwRmlsbFNoYWRvdyIsIm92ZXJGaWxsSGlnaGxpZ2h0Iiwib3ZlckZpbGxTaGFkb3ciLCJwcmVzc2VkRmlsbCIsImNhY2hlZFBhaW50cyIsInVubGluayIsImludGVyYWN0aW9uU3RhdGUiLCJJRExFIiwiZmlsbCIsIm9wYWNpdHkiLCJPVkVSIiwiUFJFU1NFRCIsIkVycm9yIiwibGluayIsInNlbGZCb3VuZHNQcm9wZXJ0eSIsImhhc0xpc3RlbmVyIiwibGF5b3V0IiwiYnV0dG9uTm9kZSIsImNvbnRlbnRQcm94eSIsImNyZWF0ZUxheW91dFByb3h5Iiwid2lkdGhTaXphYmxlIiwiaGVpZ2h0U2l6YWJsZSIsImNvbnRlbnRNaW5pbXVtV2lkdGhXaXRoTWFyZ2lucyIsIm1pbmltdW1XaWR0aCIsImNvbnRlbnRNaW5pbXVtSGVpZ2h0V2l0aE1hcmdpbnMiLCJtaW5pbXVtSGVpZ2h0IiwiY29udGVudE1pbmltdW1SYWRpdXMiLCJNYXRoIiwibWF4IiwiaXNGaXJzdExheW91dCIsImxvY2FsTWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtSGVpZ2h0IiwibGFzdExvY2FsV2lkdGgiLCJsb2NhbFByZWZlcnJlZFdpZHRoIiwibGFzdExvY2FsSGVpZ2h0IiwibG9jYWxQcmVmZXJyZWRIZWlnaHQiLCJhY3R1YWxTaXplIiwicHJlZmVycmVkUmFkaXVzIiwiYnV0dG9uQmFja2dyb3VuZFJhZGl1cyIsImxvY2FsQm91bmRzIiwid2lkdGgiLCJ0b3VjaEFyZWEiLCJjaXJjbGUiLCJtb3VzZUFyZWEiLCJmb2N1c0hpZ2hsaWdodCIsInByZWZlcnJlZENvbnRlbnRXaWR0aCIsInByZWZlcnJlZENvbnRlbnRIZWlnaHQiLCJwcmVmZXJyZWRXaWR0aCIsInByZWZlcnJlZEhlaWdodCIsImNvbnRlbnRDb250YWluZXIiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsInZhbHVlIiwibG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwiX3VwZGF0ZUxheW91dExpc3RlbmVyIiwibG9jYWxQcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImxhenlMaW5rIiwiYWRkTm9kZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBR2xFLE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxTQUFTQyxNQUFNLEVBQVNDLGdCQUFnQixFQUFFQyxJQUFJLEVBQUVDLGtCQUFrQixFQUFRQyxjQUFjLFFBQWdCLGlDQUFpQztBQUN6SSxPQUFPQyxTQUFTLFlBQVk7QUFDNUIsT0FBT0MsNEJBQTRCLDhCQUE4QjtBQUVqRSxPQUFPQyxnQkFBdUMsa0JBQWtCO0FBSWhFLFlBQVk7QUFDWixNQUFNQyw0QkFBNEIsR0FBRyw4Q0FBOEM7QUFxQnBFLElBQUEsQUFBTUMsY0FBTixNQUFNQSxvQkFBb0JGO0lBTXZDLFlBQXVCRyxXQUF3QixFQUN4QkMsd0JBQW1FLEVBQ25FQyxlQUFvQyxDQUFHO1FBRTVELElBQUlDLFVBQVVkLFlBQWlFO1lBRTdFLGtIQUFrSDtZQUNsSCxnREFBZ0Q7WUFDaERlLFNBQVM7WUFFVCxjQUFjO1lBQ2RDLFFBQVEsQUFBRUgsbUJBQW1CQSxnQkFBZ0JJLE9BQU8sR0FBSyxPQUFPO1lBQ2hFQyxXQUFXO1lBQ1hDLFFBQVE7WUFDUkMsbUJBQW1CO1lBQ25CQyxtQkFBbUI7WUFDbkJDLGlCQUFpQjtZQUNqQkMsaUJBQWlCO1lBQ2pCQyxpQkFBaUI7WUFDakJDLGlCQUFpQjtZQUVqQixvQkFBb0I7WUFDcEJDLFFBQVE7WUFFUiw2RkFBNkY7WUFDN0ZDLFNBQVM7WUFDVEMsU0FBUztZQUVULDRGQUE0RjtZQUM1RixxRkFBcUY7WUFDckZDLDBC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