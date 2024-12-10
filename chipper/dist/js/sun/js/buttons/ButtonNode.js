// Copyright 2020-2024, University of Colorado Boulder
/**
 * ButtonNode is the base class for the sun button hierarchy.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { AlignBox, assertNoAdditionalChildren, Brightness, Contrast, Grayscale, Node, PaintColorProperty, SceneryConstants, Sizable, Voicing } from '../../../scenery/js/imports.js';
import ColorConstants from '../ColorConstants.js';
import sun from '../sun.js';
import ButtonInteractionState from './ButtonInteractionState.js';
// constants
const CONTRAST_FILTER = new Contrast(0.7);
const BRIGHTNESS_FILTER = new Brightness(1.2);
let ButtonNode = class ButtonNode extends Sizable(Voicing(Node)) {
    dispose() {
        this.disposeButtonNode();
        super.dispose();
    }
    /**
   * Sets the base color, which is the main background fill color used for the button.
   */ setBaseColor(baseColor) {
        this._settableBaseColorProperty.paint = baseColor;
    }
    set baseColor(baseColor) {
        this.setBaseColor(baseColor);
    }
    get baseColor() {
        return this.getBaseColor();
    }
    /**
   * Gets the base color for this button.
   */ getBaseColor() {
        return this._settableBaseColorProperty.paint;
    }
    /**
   * Manually click the button, as it would be clicked in response to alternative input. Recommended only for
   * accessibility usages. For the most part, PDOM button functionality should be managed by PressListener, this should
   * rarely be used.
   */ pdomClick() {
        this._pressListener.click(null);
    }
    /**
   * @param buttonModel
   * @param buttonBackground - the background of the button (like a circle or rectangle).
   * @param interactionStateProperty - a Property that is used to drive the visual appearance of the button
   * @param providedOptions - this type does not mutate its options, but relies on the subtype to
   */ constructor(buttonModel, buttonBackground, interactionStateProperty, providedOptions){
        var _options_tandem;
        const options = optionize()({
            content: null,
            xMargin: 10,
            yMargin: 5,
            xAlign: 'center',
            yAlign: 'center',
            xContentOffset: 0,
            yContentOffset: 0,
            baseColor: ColorConstants.LIGHT_BLUE,
            cursor: 'pointer',
            buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
            buttonAppearanceStrategyOptions: {},
            contentAppearanceStrategy: null,
            contentAppearanceStrategyOptions: {},
            enabledAppearanceStrategy: (enabled, button, background, content)=>{
                background.filters = enabled ? [] : [
                    CONTRAST_FILTER,
                    BRIGHTNESS_FILTER
                ];
                if (content) {
                    content.filters = enabled ? [] : [
                        Grayscale.FULL
                    ];
                    content.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
                }
            },
            disabledColor: ColorConstants.LIGHT_GRAY,
            // pdom
            tagName: 'button',
            // phet-io
            tandemNameSuffix: 'Button',
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true // opt into default PhET-iO instrumented enabledProperty
        }, providedOptions);
        options.listenerOptions = combineOptions({
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('pressListener')
        }, options.listenerOptions);
        assert && options.enabledProperty && assert(options.enabledProperty === buttonModel.enabledProperty, 'if options.enabledProperty is provided, it must === buttonModel.enabledProperty');
        options.enabledProperty = buttonModel.enabledProperty;
        super(), this.contentContainer = null // (sun-only)
        , this.layoutSizeProperty = new TinyProperty(new Dimension2(0, 0));
        this.content = options.content;
        this.buttonModel = buttonModel;
        this._settableBaseColorProperty = new PaintColorProperty(options.baseColor);
        this._disabledColorProperty = new PaintColorProperty(options.disabledColor);
        this.baseColorProperty = new DerivedProperty([
            this._settableBaseColorProperty,
            this.enabledProperty,
            this._disabledColorProperty
        ], (color, enabled, disabledColor)=>{
            return enabled ? color : disabledColor;
        });
        this._pressListener = buttonModel.createPressListener(options.listenerOptions);
        this.addInputListener(this._pressListener);
        assert && assert(buttonBackground.fill === null, 'ButtonNode controls the fill for the buttonBackground');
        buttonBackground.fill = this.baseColorProperty;
        this.addChild(buttonBackground);
        // Hook up the strategy that will control the button's appearance.
        const buttonAppearanceStrategy = new options.buttonAppearanceStrategy(buttonBackground, interactionStateProperty, this.baseColorProperty, options.buttonAppearanceStrategyOptions);
        // Optionally hook up the strategy that will control the content's appearance.
        let contentAppearanceStrategy;
        if (options.contentAppearanceStrategy && options.content) {
            contentAppearanceStrategy = new options.contentAppearanceStrategy(options.content, interactionStateProperty, options.contentAppearanceStrategyOptions);
        }
        // Get our maxLineWidth from the appearance strategy, as it's needed for layout (and in subtypes)
        this.maxLineWidth = buttonAppearanceStrategy.maxLineWidth;
        let alignBox = null;
        let updateAlignBounds = null;
        if (options.content) {
            // Container here that can get scaled/positioned/pickable-modified, without affecting the provided content.
            this.contentContainer = new Node({
                children: [
                    options.content
                ],
                // For performance, in case content is a complicated icon or shape.
                // See https://github.com/phetsims/sun/issues/654#issuecomment-718944669
                pickable: false
            });
            // Align content in the button rectangle. Must be disposed since it adds listener to content bounds.
            alignBox = new AlignBox(this.contentContainer, {
                xAlign: options.xAlign,
                yAlign: options.yAlign,
                // Apply offsets via margins, so that bounds of the AlignBox doesn't unnecessarily extend past the
                // buttonBackground. See https://github.com/phetsims/sun/issues/649
                leftMargin: options.xMargin + options.xContentOffset,
                rightMargin: options.xMargin - options.xContentOffset,
                topMargin: options.yMargin + options.yContentOffset,
                bottomMargin: options.yMargin - options.yContentOffset
            });
            // Dynamically adjust alignBounds.
            updateAlignBounds = Multilink.multilink([
                buttonBackground.boundsProperty,
                this.layoutSizeProperty
            ], (backgroundBounds, size)=>{
                if (size.width > 0 && size.height > 0) {
                    alignBox.alignBounds = Bounds2.point(backgroundBounds.center).dilatedXY(size.width / 2, size.height / 2);
                }
            });
            this.addChild(alignBox);
        }
        this.mutate(options);
        // No need to dispose because enabledProperty is disposed in Node
        this.enabledProperty.link((enabled)=>options.enabledAppearanceStrategy(enabled, this, buttonBackground, alignBox));
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
        this.disposeButtonNode = ()=>{
            alignBox && alignBox.dispose();
            updateAlignBounds && updateAlignBounds.dispose();
            buttonAppearanceStrategy.dispose && buttonAppearanceStrategy.dispose();
            contentAppearanceStrategy && contentAppearanceStrategy.dispose && contentAppearanceStrategy.dispose();
            this._pressListener.dispose();
            this.baseColorProperty.dispose();
            this._settableBaseColorProperty.dispose();
            this._disabledColorProperty.dispose();
        };
    }
};
export { ButtonNode as default };
/**
 * FlatAppearanceStrategy is a value for ButtonNode options.buttonAppearanceStrategy. It makes a
 * button look flat, i.e. no shading or highlighting, with color changes on mouseover, press, etc.
 */ export class FlatAppearanceStrategy {
    dispose() {
        this.disposeFlatAppearanceStrategy();
    }
    /**
   * @param buttonBackground - the Node for the button's background, sans content
   * @param interactionStateProperty - interaction state, used to trigger updates
   * @param baseColorProperty - base color from which other colors are derived
   * @param [providedOptions]
   */ constructor(buttonBackground, interactionStateProperty, baseColorProperty, providedOptions){
        // dynamic colors
        const baseBrighter4Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: 0.4
        });
        const baseDarker4Property = new PaintColorProperty(baseColorProperty, {
            luminanceFactor: -0.4
        });
        // various fills that are used to alter the button's appearance
        const upFillProperty = baseColorProperty;
        const overFillProperty = baseBrighter4Property;
        const downFillProperty = baseDarker4Property;
        const options = combineOptions({
            stroke: baseDarker4Property
        }, providedOptions);
        const lineWidth = typeof options.lineWidth === 'number' ? options.lineWidth : 1;
        // If the stroke wasn't provided, set a default.
        buttonBackground.stroke = options.stroke || baseDarker4Property;
        buttonBackground.lineWidth = lineWidth;
        this.maxLineWidth = buttonBackground.hasStroke() ? lineWidth : 0;
        // Cache colors
        buttonBackground.cachedPaints = [
            upFillProperty,
            overFillProperty,
            downFillProperty
        ];
        // Change colors to match interactionState
        function interactionStateListener(interactionState) {
            switch(interactionState){
                case ButtonInteractionState.IDLE:
                    buttonBackground.fill = upFillProperty;
                    break;
                case ButtonInteractionState.OVER:
                    buttonBackground.fill = overFillProperty;
                    break;
                case ButtonInteractionState.PRESSED:
                    buttonBackground.fill = downFillProperty;
                    break;
                default:
                    throw new Error(`unsupported interactionState: ${interactionState}`);
            }
        }
        // Do the initial update explicitly, then lazy link to the properties.  This keeps the number of initial updates to
        // a minimum and allows us to update some optimization flags the first time the base color is actually changed.
        interactionStateProperty.link(interactionStateListener);
        this.disposeFlatAppearanceStrategy = ()=>{
            if (interactionStateProperty.hasListener(interactionStateListener)) {
                interactionStateProperty.unlink(interactionStateListener);
            }
            baseBrighter4Property.dispose();
            baseDarker4Property.dispose();
        };
    }
}
ButtonNode.FlatAppearanceStrategy = FlatAppearanceStrategy;
sun.register('ButtonNode', ButtonNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0J1dHRvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQnV0dG9uTm9kZSBpcyB0aGUgYmFzZSBjbGFzcyBmb3IgdGhlIHN1biBidXR0b24gaGllcmFyY2h5LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE11bHRpbGluaywgeyBVbmtub3duTXVsdGlsaW5rIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Cb3hYQWxpZ24sIEFsaWduQm94WUFsaWduLCBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgQnJpZ2h0bmVzcywgQ29sb3IsIENvbnRyYXN0LCBHcmF5c2NhbGUsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludGFibGVOb2RlLCBQYWludENvbG9yUHJvcGVydHksIFBhdGgsIFByZXNzTGlzdGVuZXIsIFByZXNzTGlzdGVuZXJPcHRpb25zLCBTY2VuZXJ5Q29uc3RhbnRzLCBTaXphYmxlLCBTaXphYmxlT3B0aW9ucywgVENvbG9yLCBUUGFpbnQsIFZvaWNpbmcsIFZvaWNpbmdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBDb2xvckNvbnN0YW50cyBmcm9tICcuLi9Db2xvckNvbnN0YW50cy5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uL3N1bi5qcyc7XG5pbXBvcnQgQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZSBmcm9tICcuL0J1dHRvbkludGVyYWN0aW9uU3RhdGUuanMnO1xuaW1wb3J0IEJ1dHRvbk1vZGVsIGZyb20gJy4vQnV0dG9uTW9kZWwuanMnO1xuaW1wb3J0IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3ksIHsgVEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMgfSBmcm9tICcuL1RCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kuanMnO1xuaW1wb3J0IFRDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5LCB7IFRDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyB9IGZyb20gJy4vVENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IENPTlRSQVNUX0ZJTFRFUiA9IG5ldyBDb250cmFzdCggMC43ICk7XG5jb25zdCBCUklHSFRORVNTX0ZJTFRFUiA9IG5ldyBCcmlnaHRuZXNzKCAxLjIgKTtcblxuLy8gaWYgdGhlcmUgaXMgY29udGVudCwgc3R5bGUgY2FuIGJlIGFwcGxpZWQgdG8gYSBjb250YWluaW5nIE5vZGUgYXJvdW5kIGl0LlxudHlwZSBFbmFibGVkQXBwZWFyYW5jZVN0cmF0ZWd5ID0gKCBlbmFibGVkOiBib29sZWFuLCBidXR0b246IE5vZGUsIGJhY2tncm91bmQ6IE5vZGUsIGNvbnRlbnQ6IE5vZGUgfCBudWxsICkgPT4gdm9pZDtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyB3aGF0IGFwcGVhcnMgb24gdGhlIGJ1dHRvbiAoaWNvbiwgbGFiZWwsIGV0Yy4pXG4gIGNvbnRlbnQ/OiBOb2RlIHwgbnVsbDtcblxuICAvLyBtYXJnaW4gaW4geCBkaXJlY3Rpb24sIGkuZS4gb24gbGVmdCBhbmQgcmlnaHRcbiAgeE1hcmdpbj86IG51bWJlcjtcblxuICAvLyBtYXJnaW4gaW4geSBkaXJlY3Rpb24sIGkuZS4gb24gdG9wIGFuZCBib3R0b21cbiAgeU1hcmdpbj86IG51bWJlcjtcblxuICAvLyBBbGlnbm1lbnQsIHJlbGV2YW50IG9ubHkgd2hlbiBvcHRpb25zIG1pbldpZHRoIG9yIG1pbkhlaWdodCBhcmUgZ3JlYXRlciB0aGFuIHRoZSBzaXplIG9mIG9wdGlvbnMuY29udGVudFxuICB4QWxpZ24/OiBBbGlnbkJveFhBbGlnbjtcbiAgeUFsaWduPzogQWxpZ25Cb3hZQWxpZ247XG5cbiAgLy8gQnkgZGVmYXVsdCwgaWNvbnMgYXJlIGNlbnRlcmVkIGluIHRoZSBidXR0b24sIGJ1dCBpY29ucyB3aXRoIG9kZFxuICAvLyBzaGFwZXMgdGhhdCBhcmUgbm90IHdyYXBwZWQgaW4gYSBub3JtYWxpemluZyBwYXJlbnQgbm9kZSBtYXkgbmVlZCB0b1xuICAvLyBzcGVjaWZ5IG9mZnNldHMgdG8gbGluZSB0aGluZ3MgdXAgcHJvcGVybHlcbiAgeENvbnRlbnRPZmZzZXQ/OiBudW1iZXI7XG4gIHlDb250ZW50T2Zmc2V0PzogbnVtYmVyO1xuXG4gIC8vIE9wdGlvbnMgdGhhdCB3aWxsIGJlIHBhc3NlZCB0aHJvdWdoIHRvIHRoZSBtYWluIGlucHV0IGxpc3RlbmVyIChQcmVzc0xpc3RlbmVyKVxuICBsaXN0ZW5lck9wdGlvbnM/OiBQcmVzc0xpc3RlbmVyT3B0aW9ucztcblxuICAvLyBpbml0aWFsIGNvbG9yIG9mIHRoZSBidXR0b24ncyBiYWNrZ3JvdW5kXG4gIGJhc2VDb2xvcj86IFRQYWludDtcblxuICAvLyBDb2xvciB3aGVuIGRpc2FibGVkXG4gIGRpc2FibGVkQ29sb3I/OiBUUGFpbnQ7XG5cbiAgLy8gQ2xhc3MgYW5kIGFzc29jaWF0ZWQgb3B0aW9ucyB0aGF0IGRldGVybWluZSB0aGUgYnV0dG9uJ3MgYXBwZWFyYW5jZSBhbmQgdGhlIGNoYW5nZXMgdGhhdCBvY2N1ciB3aGVuIHRoZSBidXR0b24gaXNcbiAgLy8gcHJlc3NlZCwgaG92ZXJlZCBvdmVyLCBkaXNhYmxlZCwgYW5kIHNvIGZvcnRoLlxuICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k/OiBUQnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5O1xuICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zPzogVEJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnM7XG5cbiAgLy8gQ2xhc3MgYW5kIGFzc29jaWF0ZWQgb3B0aW9ucyB0aGF0IGRldGVybWluZSBob3cgdGhlIGNvbnRlbnQgbm9kZSBsb29rcyBhbmQgdGhlIGNoYW5nZXMgdGhhdCBvY2N1ciB3aGVuIHRoZSBidXR0b25cbiAgLy8gaXMgcHJlc3NlZCwgaG92ZXJlZCBvdmVyLCBkaXNhYmxlZCwgYW5kIHNvIGZvcnRoLlxuICBjb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5PzogVENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kgfCBudWxsO1xuICBjb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucz86IFRDb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucztcblxuICAvLyBBbHRlciB0aGUgYXBwZWFyYW5jZSB3aGVuIGNoYW5naW5nIHRoZSBlbmFibGVkIG9mIHRoZSBidXR0b24uXG4gIGVuYWJsZWRBcHBlYXJhbmNlU3RyYXRlZ3k/OiBFbmFibGVkQXBwZWFyYW5jZVN0cmF0ZWd5O1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFNpemFibGVPcHRpb25zICYgVm9pY2luZ09wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuLy8gTm9ybWFsIG9wdGlvbnMsIGZvciB1c2UgaW4gb3B0aW9uaXplXG5leHBvcnQgdHlwZSBCdXR0b25Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnV0dG9uTm9kZSBleHRlbmRzIFNpemFibGUoIFZvaWNpbmcoIE5vZGUgKSApIHtcblxuICBwcm90ZWN0ZWQgYnV0dG9uTW9kZWw6IEJ1dHRvbk1vZGVsO1xuICBwcml2YXRlIHJlYWRvbmx5IF9zZXR0YWJsZUJhc2VDb2xvclByb3BlcnR5OiBQYWludENvbG9yUHJvcGVydHk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2Rpc2FibGVkQ29sb3JQcm9wZXJ0eTogUGFpbnRDb2xvclByb3BlcnR5O1xuICBwcml2YXRlIHJlYWRvbmx5IGJhc2VDb2xvclByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxDb2xvcj47XG4gIHByaXZhdGUgcmVhZG9ubHkgX3ByZXNzTGlzdGVuZXI6IFByZXNzTGlzdGVuZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUJ1dHRvbk5vZGU6ICgpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCByZWFkb25seSBjb250ZW50OiBOb2RlIHwgbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRDb250YWluZXI6IE5vZGUgfCBudWxsID0gbnVsbDsgLy8gKHN1bi1vbmx5KVxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbGF5b3V0U2l6ZVByb3BlcnR5OiBUaW55UHJvcGVydHk8RGltZW5zaW9uMj4gPSBuZXcgVGlueVByb3BlcnR5PERpbWVuc2lvbjI+KCBuZXcgRGltZW5zaW9uMiggMCwgMCApICk7XG5cbiAgLy8gVGhlIG1heGltdW0gbGluZVdpZHRoIG91ciBidXR0b25CYWNrZ3JvdW5kIGNhbiBoYXZlLiBXZSdsbCBsYXkgdGhpbmdzIG91dCBzbyB0aGF0IGlmIHdlIGFkanVzdCBvdXIgbGluZVdpZHRoIGJlbG93XG4gIC8vIHRoaXMsIHRoZSBsYXlvdXQgd29uJ3QgY2hhbmdlXG4gIHByb3RlY3RlZCByZWFkb25seSBtYXhMaW5lV2lkdGg6IG51bWJlcjtcblxuICBwdWJsaWMgc3RhdGljIEZsYXRBcHBlYXJhbmNlU3RyYXRlZ3k6IFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBidXR0b25Nb2RlbFxuICAgKiBAcGFyYW0gYnV0dG9uQmFja2dyb3VuZCAtIHRoZSBiYWNrZ3JvdW5kIG9mIHRoZSBidXR0b24gKGxpa2UgYSBjaXJjbGUgb3IgcmVjdGFuZ2xlKS5cbiAgICogQHBhcmFtIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSAtIGEgUHJvcGVydHkgdGhhdCBpcyB1c2VkIHRvIGRyaXZlIHRoZSB2aXN1YWwgYXBwZWFyYW5jZSBvZiB0aGUgYnV0dG9uXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnMgLSB0aGlzIHR5cGUgZG9lcyBub3QgbXV0YXRlIGl0cyBvcHRpb25zLCBidXQgcmVsaWVzIG9uIHRoZSBzdWJ0eXBlIHRvXG4gICAqL1xuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIGJ1dHRvbk1vZGVsOiBCdXR0b25Nb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBidXR0b25CYWNrZ3JvdW5kOiBQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQnV0dG9uTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJ1dHRvbk5vZGVPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnbGlzdGVuZXJPcHRpb25zJz4sIFBhcmVudE9wdGlvbnM+KCkoIHtcblxuICAgICAgY29udGVudDogbnVsbCxcbiAgICAgIHhNYXJnaW46IDEwLFxuICAgICAgeU1hcmdpbjogNSxcbiAgICAgIHhBbGlnbjogJ2NlbnRlcicsXG4gICAgICB5QWxpZ246ICdjZW50ZXInLFxuICAgICAgeENvbnRlbnRPZmZzZXQ6IDAsXG4gICAgICB5Q29udGVudE9mZnNldDogMCxcbiAgICAgIGJhc2VDb2xvcjogQ29sb3JDb25zdGFudHMuTElHSFRfQkxVRSxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBCdXR0b25Ob2RlLkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3ksXG4gICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7fSxcbiAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k6IG51bGwsXG4gICAgICBjb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge30sXG4gICAgICBlbmFibGVkQXBwZWFyYW5jZVN0cmF0ZWd5OiAoIGVuYWJsZWQsIGJ1dHRvbiwgYmFja2dyb3VuZCwgY29udGVudCApID0+IHtcbiAgICAgICAgYmFja2dyb3VuZC5maWx0ZXJzID0gZW5hYmxlZCA/IFtdIDogWyBDT05UUkFTVF9GSUxURVIsIEJSSUdIVE5FU1NfRklMVEVSIF07XG5cbiAgICAgICAgaWYgKCBjb250ZW50ICkge1xuICAgICAgICAgIGNvbnRlbnQuZmlsdGVycyA9IGVuYWJsZWQgPyBbXSA6IFsgR3JheXNjYWxlLkZVTEwgXTtcbiAgICAgICAgICBjb250ZW50Lm9wYWNpdHkgPSBlbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRpc2FibGVkQ29sb3I6IENvbG9yQ29uc3RhbnRzLkxJR0hUX0dSQVksXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIHRhZ05hbWU6ICdidXR0b24nLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnQnV0dG9uJyxcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSxcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgb3B0aW9ucy5saXN0ZW5lck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxQcmVzc0xpc3RlbmVyT3B0aW9ucz4oIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3ByZXNzTGlzdGVuZXInIClcbiAgICB9LCBvcHRpb25zLmxpc3RlbmVyT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIG9wdGlvbnMuZW5hYmxlZFByb3BlcnR5ICYmIGFzc2VydCggb3B0aW9ucy5lbmFibGVkUHJvcGVydHkgPT09IGJ1dHRvbk1vZGVsLmVuYWJsZWRQcm9wZXJ0eSxcbiAgICAgICdpZiBvcHRpb25zLmVuYWJsZWRQcm9wZXJ0eSBpcyBwcm92aWRlZCwgaXQgbXVzdCA9PT0gYnV0dG9uTW9kZWwuZW5hYmxlZFByb3BlcnR5JyApO1xuICAgIG9wdGlvbnMuZW5hYmxlZFByb3BlcnR5ID0gYnV0dG9uTW9kZWwuZW5hYmxlZFByb3BlcnR5O1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcbiAgICB0aGlzLmJ1dHRvbk1vZGVsID0gYnV0dG9uTW9kZWw7XG5cbiAgICB0aGlzLl9zZXR0YWJsZUJhc2VDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3B0aW9ucy5iYXNlQ29sb3IgKTtcbiAgICB0aGlzLl9kaXNhYmxlZENvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmRpc2FibGVkQ29sb3IgKTtcblxuICAgIHRoaXMuYmFzZUNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXG4gICAgICB0aGlzLl9zZXR0YWJsZUJhc2VDb2xvclByb3BlcnR5LFxuICAgICAgdGhpcy5lbmFibGVkUHJvcGVydHksXG4gICAgICB0aGlzLl9kaXNhYmxlZENvbG9yUHJvcGVydHlcbiAgICBdLCAoIGNvbG9yLCBlbmFibGVkLCBkaXNhYmxlZENvbG9yICkgPT4ge1xuICAgICAgcmV0dXJuIGVuYWJsZWQgPyBjb2xvciA6IGRpc2FibGVkQ29sb3I7XG4gICAgfSApO1xuXG4gICAgdGhpcy5fcHJlc3NMaXN0ZW5lciA9IGJ1dHRvbk1vZGVsLmNyZWF0ZVByZXNzTGlzdGVuZXIoIG9wdGlvbnMubGlzdGVuZXJPcHRpb25zICk7XG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9wcmVzc0xpc3RlbmVyICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBidXR0b25CYWNrZ3JvdW5kLmZpbGwgPT09IG51bGwsICdCdXR0b25Ob2RlIGNvbnRyb2xzIHRoZSBmaWxsIGZvciB0aGUgYnV0dG9uQmFja2dyb3VuZCcgKTtcbiAgICBidXR0b25CYWNrZ3JvdW5kLmZpbGwgPSB0aGlzLmJhc2VDb2xvclByb3BlcnR5O1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJ1dHRvbkJhY2tncm91bmQgKTtcblxuICAgIC8vIEhvb2sgdXAgdGhlIHN0cmF0ZWd5IHRoYXQgd2lsbCBjb250cm9sIHRoZSBidXR0b24ncyBhcHBlYXJhbmNlLlxuICAgIGNvbnN0IGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSA9IG5ldyBvcHRpb25zLmJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneShcbiAgICAgIGJ1dHRvbkJhY2tncm91bmQsXG4gICAgICBpbnRlcmFjdGlvblN0YXRlUHJvcGVydHksXG4gICAgICB0aGlzLmJhc2VDb2xvclByb3BlcnR5LFxuICAgICAgb3B0aW9ucy5idXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zXG4gICAgKTtcblxuICAgIC8vIE9wdGlvbmFsbHkgaG9vayB1cCB0aGUgc3RyYXRlZ3kgdGhhdCB3aWxsIGNvbnRyb2wgdGhlIGNvbnRlbnQncyBhcHBlYXJhbmNlLlxuICAgIGxldCBjb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5OiBJbnN0YW5jZVR5cGU8VENvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3k+O1xuICAgIGlmICggb3B0aW9ucy5jb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5ICYmIG9wdGlvbnMuY29udGVudCApIHtcbiAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kgPSBuZXcgb3B0aW9ucy5jb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5KFxuICAgICAgICBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSwgb3B0aW9ucy5jb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uc1xuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgb3VyIG1heExpbmVXaWR0aCBmcm9tIHRoZSBhcHBlYXJhbmNlIHN0cmF0ZWd5LCBhcyBpdCdzIG5lZWRlZCBmb3IgbGF5b3V0IChhbmQgaW4gc3VidHlwZXMpXG4gICAgdGhpcy5tYXhMaW5lV2lkdGggPSBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kubWF4TGluZVdpZHRoO1xuXG4gICAgbGV0IGFsaWduQm94OiBBbGlnbkJveCB8IG51bGwgPSBudWxsO1xuICAgIGxldCB1cGRhdGVBbGlnbkJvdW5kczogVW5rbm93bk11bHRpbGluayB8IG51bGwgPSBudWxsO1xuXG4gICAgaWYgKCBvcHRpb25zLmNvbnRlbnQgKSB7XG4gICAgICAvLyBDb250YWluZXIgaGVyZSB0aGF0IGNhbiBnZXQgc2NhbGVkL3Bvc2l0aW9uZWQvcGlja2FibGUtbW9kaWZpZWQsIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBwcm92aWRlZCBjb250ZW50LlxuICAgICAgdGhpcy5jb250ZW50Q29udGFpbmVyID0gbmV3IE5vZGUoIHtcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBvcHRpb25zLmNvbnRlbnRcbiAgICAgICAgXSxcblxuICAgICAgICAvLyBGb3IgcGVyZm9ybWFuY2UsIGluIGNhc2UgY29udGVudCBpcyBhIGNvbXBsaWNhdGVkIGljb24gb3Igc2hhcGUuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NTQjaXNzdWVjb21tZW50LTcxODk0NDY2OVxuICAgICAgICBwaWNrYWJsZTogZmFsc2VcbiAgICAgIH0gKTtcblxuICAgICAgLy8gQWxpZ24gY29udGVudCBpbiB0aGUgYnV0dG9uIHJlY3RhbmdsZS4gTXVzdCBiZSBkaXNwb3NlZCBzaW5jZSBpdCBhZGRzIGxpc3RlbmVyIHRvIGNvbnRlbnQgYm91bmRzLlxuICAgICAgYWxpZ25Cb3ggPSBuZXcgQWxpZ25Cb3goIHRoaXMuY29udGVudENvbnRhaW5lciwge1xuICAgICAgICB4QWxpZ246IG9wdGlvbnMueEFsaWduLFxuICAgICAgICB5QWxpZ246IG9wdGlvbnMueUFsaWduLFxuXG4gICAgICAgIC8vIEFwcGx5IG9mZnNldHMgdmlhIG1hcmdpbnMsIHNvIHRoYXQgYm91bmRzIG9mIHRoZSBBbGlnbkJveCBkb2Vzbid0IHVubmVjZXNzYXJpbHkgZXh0ZW5kIHBhc3QgdGhlXG4gICAgICAgIC8vIGJ1dHRvbkJhY2tncm91bmQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NDlcbiAgICAgICAgbGVmdE1hcmdpbjogb3B0aW9ucy54TWFyZ2luICsgb3B0aW9ucy54Q29udGVudE9mZnNldCxcbiAgICAgICAgcmlnaHRNYXJnaW46IG9wdGlvbnMueE1hcmdpbiAtIG9wdGlvbnMueENvbnRlbnRPZmZzZXQsXG4gICAgICAgIHRvcE1hcmdpbjogb3B0aW9ucy55TWFyZ2luICsgb3B0aW9ucy55Q29udGVudE9mZnNldCxcbiAgICAgICAgYm90dG9tTWFyZ2luOiBvcHRpb25zLnlNYXJnaW4gLSBvcHRpb25zLnlDb250ZW50T2Zmc2V0XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIER5bmFtaWNhbGx5IGFkanVzdCBhbGlnbkJvdW5kcy5cbiAgICAgIHVwZGF0ZUFsaWduQm91bmRzID0gTXVsdGlsaW5rLm11bHRpbGluayhcbiAgICAgICAgWyBidXR0b25CYWNrZ3JvdW5kLmJvdW5kc1Byb3BlcnR5LCB0aGlzLmxheW91dFNpemVQcm9wZXJ0eSBdLFxuICAgICAgICAoIGJhY2tncm91bmRCb3VuZHMsIHNpemUgKSA9PiB7XG4gICAgICAgICAgaWYgKCBzaXplLndpZHRoID4gMCAmJiBzaXplLmhlaWdodCA+IDAgKSB7XG4gICAgICAgICAgICBhbGlnbkJveCEuYWxpZ25Cb3VuZHMgPSBCb3VuZHMyLnBvaW50KCBiYWNrZ3JvdW5kQm91bmRzLmNlbnRlciApLmRpbGF0ZWRYWSggc2l6ZS53aWR0aCAvIDIsIHNpemUuaGVpZ2h0IC8gMiApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGFsaWduQm94ICk7XG4gICAgfVxuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIE5vIG5lZWQgdG8gZGlzcG9zZSBiZWNhdXNlIGVuYWJsZWRQcm9wZXJ0eSBpcyBkaXNwb3NlZCBpbiBOb2RlXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZCA9PiBvcHRpb25zLmVuYWJsZWRBcHBlYXJhbmNlU3RyYXRlZ3koIGVuYWJsZWQsIHRoaXMsIGJ1dHRvbkJhY2tncm91bmQsIGFsaWduQm94ICkgKTtcblxuICAgIC8vIERlY29yYXRpbmcgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgaXMgYW4gYW50aS1wYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvODYwXG4gICAgYXNzZXJ0ICYmIGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuKCB0aGlzICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VCdXR0b25Ob2RlID0gKCkgPT4ge1xuICAgICAgYWxpZ25Cb3ggJiYgYWxpZ25Cb3guZGlzcG9zZSgpO1xuICAgICAgdXBkYXRlQWxpZ25Cb3VuZHMgJiYgdXBkYXRlQWxpZ25Cb3VuZHMuZGlzcG9zZSgpO1xuICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5LmRpc3Bvc2UgJiYgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5LmRpc3Bvc2UoKTtcbiAgICAgIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kgJiYgY29udGVudEFwcGVhcmFuY2VTdHJhdGVneS5kaXNwb3NlICYmIGNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fcHJlc3NMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmJhc2VDb2xvclByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3NldHRhYmxlQmFzZUNvbG9yUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzYWJsZWRDb2xvclByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQnV0dG9uTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBiYXNlIGNvbG9yLCB3aGljaCBpcyB0aGUgbWFpbiBiYWNrZ3JvdW5kIGZpbGwgY29sb3IgdXNlZCBmb3IgdGhlIGJ1dHRvbi5cbiAgICovXG4gIHB1YmxpYyBzZXRCYXNlQ29sb3IoIGJhc2VDb2xvcjogVENvbG9yICk6IHZvaWQgeyB0aGlzLl9zZXR0YWJsZUJhc2VDb2xvclByb3BlcnR5LnBhaW50ID0gYmFzZUNvbG9yOyB9XG5cbiAgcHVibGljIHNldCBiYXNlQ29sb3IoIGJhc2VDb2xvcjogVENvbG9yICkgeyB0aGlzLnNldEJhc2VDb2xvciggYmFzZUNvbG9yICk7IH1cblxuICBwdWJsaWMgZ2V0IGJhc2VDb2xvcigpOiBUQ29sb3IgeyByZXR1cm4gdGhpcy5nZXRCYXNlQ29sb3IoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBiYXNlIGNvbG9yIGZvciB0aGlzIGJ1dHRvbi5cbiAgICovXG4gIHB1YmxpYyBnZXRCYXNlQ29sb3IoKTogVENvbG9yIHsgcmV0dXJuIHRoaXMuX3NldHRhYmxlQmFzZUNvbG9yUHJvcGVydHkucGFpbnQgYXMgVENvbG9yOyB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbGx5IGNsaWNrIHRoZSBidXR0b24sIGFzIGl0IHdvdWxkIGJlIGNsaWNrZWQgaW4gcmVzcG9uc2UgdG8gYWx0ZXJuYXRpdmUgaW5wdXQuIFJlY29tbWVuZGVkIG9ubHkgZm9yXG4gICAqIGFjY2Vzc2liaWxpdHkgdXNhZ2VzLiBGb3IgdGhlIG1vc3QgcGFydCwgUERPTSBidXR0b24gZnVuY3Rpb25hbGl0eSBzaG91bGQgYmUgbWFuYWdlZCBieSBQcmVzc0xpc3RlbmVyLCB0aGlzIHNob3VsZFxuICAgKiByYXJlbHkgYmUgdXNlZC5cbiAgICovXG4gIHB1YmxpYyBwZG9tQ2xpY2soKTogdm9pZCB7XG4gICAgdGhpcy5fcHJlc3NMaXN0ZW5lci5jbGljayggbnVsbCApO1xuICB9XG59XG5cbi8qKlxuICogRmxhdEFwcGVhcmFuY2VTdHJhdGVneSBpcyBhIHZhbHVlIGZvciBCdXR0b25Ob2RlIG9wdGlvbnMuYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5LiBJdCBtYWtlcyBhXG4gKiBidXR0b24gbG9vayBmbGF0LCBpLmUuIG5vIHNoYWRpbmcgb3IgaGlnaGxpZ2h0aW5nLCB3aXRoIGNvbG9yIGNoYW5nZXMgb24gbW91c2VvdmVyLCBwcmVzcywgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgRmxhdEFwcGVhcmFuY2VTdHJhdGVneSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IG1heExpbmVXaWR0aDogbnVtYmVyO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUZsYXRBcHBlYXJhbmNlU3RyYXRlZ3k6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBidXR0b25CYWNrZ3JvdW5kIC0gdGhlIE5vZGUgZm9yIHRoZSBidXR0b24ncyBiYWNrZ3JvdW5kLCBzYW5zIGNvbnRlbnRcbiAgICogQHBhcmFtIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eSAtIGludGVyYWN0aW9uIHN0YXRlLCB1c2VkIHRvIHRyaWdnZXIgdXBkYXRlc1xuICAgKiBAcGFyYW0gYmFzZUNvbG9yUHJvcGVydHkgLSBiYXNlIGNvbG9yIGZyb20gd2hpY2ggb3RoZXIgY29sb3JzIGFyZSBkZXJpdmVkXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBidXR0b25CYWNrZ3JvdW5kOiBQYWludGFibGVOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8QnV0dG9uSW50ZXJhY3Rpb25TdGF0ZT4sXG4gICAgICAgICAgICAgICAgICAgICAgYmFzZUNvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBUQnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyApIHtcblxuICAgIC8vIGR5bmFtaWMgY29sb3JzXG4gICAgY29uc3QgYmFzZUJyaWdodGVyNFByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggYmFzZUNvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAwLjQgfSApO1xuICAgIGNvbnN0IGJhc2VEYXJrZXI0UHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBiYXNlQ29sb3JQcm9wZXJ0eSwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjQgfSApO1xuXG4gICAgLy8gdmFyaW91cyBmaWxscyB0aGF0IGFyZSB1c2VkIHRvIGFsdGVyIHRoZSBidXR0b24ncyBhcHBlYXJhbmNlXG4gICAgY29uc3QgdXBGaWxsUHJvcGVydHkgPSBiYXNlQ29sb3JQcm9wZXJ0eTtcbiAgICBjb25zdCBvdmVyRmlsbFByb3BlcnR5ID0gYmFzZUJyaWdodGVyNFByb3BlcnR5O1xuICAgIGNvbnN0IGRvd25GaWxsUHJvcGVydHkgPSBiYXNlRGFya2VyNFByb3BlcnR5O1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFRCdXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zPigge1xuICAgICAgc3Ryb2tlOiBiYXNlRGFya2VyNFByb3BlcnR5XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBsaW5lV2lkdGggPSB0eXBlb2Ygb3B0aW9ucy5saW5lV2lkdGggPT09ICdudW1iZXInID8gb3B0aW9ucy5saW5lV2lkdGggOiAxO1xuXG4gICAgLy8gSWYgdGhlIHN0cm9rZSB3YXNuJ3QgcHJvdmlkZWQsIHNldCBhIGRlZmF1bHQuXG4gICAgYnV0dG9uQmFja2dyb3VuZC5zdHJva2UgPSBvcHRpb25zLnN0cm9rZSB8fCBiYXNlRGFya2VyNFByb3BlcnR5O1xuICAgIGJ1dHRvbkJhY2tncm91bmQubGluZVdpZHRoID0gbGluZVdpZHRoO1xuXG4gICAgdGhpcy5tYXhMaW5lV2lkdGggPSBidXR0b25CYWNrZ3JvdW5kLmhhc1N0cm9rZSgpID8gbGluZVdpZHRoIDogMDtcblxuICAgIC8vIENhY2hlIGNvbG9yc1xuICAgIGJ1dHRvbkJhY2tncm91bmQuY2FjaGVkUGFpbnRzID0gWyB1cEZpbGxQcm9wZXJ0eSwgb3ZlckZpbGxQcm9wZXJ0eSwgZG93bkZpbGxQcm9wZXJ0eSBdO1xuXG4gICAgLy8gQ2hhbmdlIGNvbG9ycyB0byBtYXRjaCBpbnRlcmFjdGlvblN0YXRlXG4gICAgZnVuY3Rpb24gaW50ZXJhY3Rpb25TdGF0ZUxpc3RlbmVyKCBpbnRlcmFjdGlvblN0YXRlOiBCdXR0b25JbnRlcmFjdGlvblN0YXRlICk6IHZvaWQge1xuICAgICAgc3dpdGNoKCBpbnRlcmFjdGlvblN0YXRlICkge1xuXG4gICAgICAgIGNhc2UgQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5JRExFOlxuICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQuZmlsbCA9IHVwRmlsbFByb3BlcnR5O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5PVkVSOlxuICAgICAgICAgIGJ1dHRvbkJhY2tncm91bmQuZmlsbCA9IG92ZXJGaWxsUHJvcGVydHk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBCdXR0b25JbnRlcmFjdGlvblN0YXRlLlBSRVNTRUQ6XG4gICAgICAgICAgYnV0dG9uQmFja2dyb3VuZC5maWxsID0gZG93bkZpbGxQcm9wZXJ0eTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYHVuc3VwcG9ydGVkIGludGVyYWN0aW9uU3RhdGU6ICR7aW50ZXJhY3Rpb25TdGF0ZX1gICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRG8gdGhlIGluaXRpYWwgdXBkYXRlIGV4cGxpY2l0bHksIHRoZW4gbGF6eSBsaW5rIHRvIHRoZSBwcm9wZXJ0aWVzLiAgVGhpcyBrZWVwcyB0aGUgbnVtYmVyIG9mIGluaXRpYWwgdXBkYXRlcyB0b1xuICAgIC8vIGEgbWluaW11bSBhbmQgYWxsb3dzIHVzIHRvIHVwZGF0ZSBzb21lIG9wdGltaXphdGlvbiBmbGFncyB0aGUgZmlyc3QgdGltZSB0aGUgYmFzZSBjb2xvciBpcyBhY3R1YWxseSBjaGFuZ2VkLlxuICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5saW5rKCBpbnRlcmFjdGlvblN0YXRlTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZUZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kgPSAoKSA9PiB7XG4gICAgICBpZiAoIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggaW50ZXJhY3Rpb25TdGF0ZUxpc3RlbmVyICkgKSB7XG4gICAgICAgIGludGVyYWN0aW9uU3RhdGVQcm9wZXJ0eS51bmxpbmsoIGludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciApO1xuICAgICAgfVxuICAgICAgYmFzZUJyaWdodGVyNFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGJhc2VEYXJrZXI0UHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5KCk7XG4gIH1cbn1cblxuQnV0dG9uTm9kZS5GbGF0QXBwZWFyYW5jZVN0cmF0ZWd5ID0gRmxhdEFwcGVhcmFuY2VTdHJhdGVneTtcblxuc3VuLnJlZ2lzdGVyKCAnQnV0dG9uTm9kZScsIEJ1dHRvbk5vZGUgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwiVGlueVByb3BlcnR5IiwiQm91bmRzMiIsIkRpbWVuc2lvbjIiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkFsaWduQm94IiwiYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4iLCJCcmlnaHRuZXNzIiwiQ29udHJhc3QiLCJHcmF5c2NhbGUiLCJOb2RlIiwiUGFpbnRDb2xvclByb3BlcnR5IiwiU2NlbmVyeUNvbnN0YW50cyIsIlNpemFibGUiLCJWb2ljaW5nIiwiQ29sb3JDb25zdGFudHMiLCJzdW4iLCJCdXR0b25JbnRlcmFjdGlvblN0YXRlIiwiQ09OVFJBU1RfRklMVEVSIiwiQlJJR0hUTkVTU19GSUxURVIiLCJCdXR0b25Ob2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VCdXR0b25Ob2RlIiwic2V0QmFzZUNvbG9yIiwiYmFzZUNvbG9yIiwiX3NldHRhYmxlQmFzZUNvbG9yUHJvcGVydHkiLCJwYWludCIsImdldEJhc2VDb2xvciIsInBkb21DbGljayIsIl9wcmVzc0xpc3RlbmVyIiwiY2xpY2siLCJidXR0b25Nb2RlbCIsImJ1dHRvbkJhY2tncm91bmQiLCJpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY29udGVudCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwieEFsaWduIiwieUFsaWduIiwieENvbnRlbnRPZmZzZXQiLCJ5Q29udGVudE9mZnNldCIsIkxJR0hUX0JMVUUiLCJjdXJzb3IiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kiLCJGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5IiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsImNvbnRlbnRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJjb250ZW50QXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsImVuYWJsZWRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJlbmFibGVkIiwiYnV0dG9uIiwiYmFja2dyb3VuZCIsImZpbHRlcnMiLCJGVUxMIiwib3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJkaXNhYmxlZENvbG9yIiwiTElHSFRfR1JBWSIsInRhZ05hbWUiLCJ0YW5kZW1OYW1lU3VmZml4IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwibGlzdGVuZXJPcHRpb25zIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYXNzZXJ0IiwiZW5hYmxlZFByb3BlcnR5IiwiY29udGVudENvbnRhaW5lciIsImxheW91dFNpemVQcm9wZXJ0eSIsIl9kaXNhYmxlZENvbG9yUHJvcGVydHkiLCJiYXNlQ29sb3JQcm9wZXJ0eSIsImNvbG9yIiwiY3JlYXRlUHJlc3NMaXN0ZW5lciIsImFkZElucHV0TGlzdGVuZXIiLCJmaWxsIiwiYWRkQ2hpbGQiLCJtYXhMaW5lV2lkdGgiLCJhbGlnbkJveCIsInVwZGF0ZUFsaWduQm91bmRzIiwiY2hpbGRyZW4iLCJwaWNrYWJsZSIsImxlZnRNYXJnaW4iLCJyaWdodE1hcmdpbiIsInRvcE1hcmdpbiIsImJvdHRvbU1hcmdpbiIsIm11bHRpbGluayIsImJvdW5kc1Byb3BlcnR5IiwiYmFja2dyb3VuZEJvdW5kcyIsInNpemUiLCJ3aWR0aCIsImhlaWdodCIsImFsaWduQm91bmRzIiwicG9pbnQiLCJjZW50ZXIiLCJkaWxhdGVkWFkiLCJtdXRhdGUiLCJsaW5rIiwiZGlzcG9zZUZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJiYXNlQnJpZ2h0ZXI0UHJvcGVydHkiLCJsdW1pbmFuY2VGYWN0b3IiLCJiYXNlRGFya2VyNFByb3BlcnR5IiwidXBGaWxsUHJvcGVydHkiLCJvdmVyRmlsbFByb3BlcnR5IiwiZG93bkZpbGxQcm9wZXJ0eSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImhhc1N0cm9rZSIsImNhY2hlZFBhaW50cyIsImludGVyYWN0aW9uU3RhdGVMaXN0ZW5lciIsImludGVyYWN0aW9uU3RhdGUiLCJJRExFIiwiT1ZFUiIsIlBSRVNTRUQiLCJFcnJvciIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBQ2xFLE9BQU9DLGVBQXFDLGdDQUFnQztBQUM1RSxPQUFPQyxrQkFBa0IsbUNBQW1DO0FBRTVELE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLHFDQUFxQztBQUUvRSxTQUFTQyxRQUFRLEVBQWtDQywwQkFBMEIsRUFBRUMsVUFBVSxFQUFTQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUE4QkMsa0JBQWtCLEVBQTZDQyxnQkFBZ0IsRUFBRUMsT0FBTyxFQUFrQ0MsT0FB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