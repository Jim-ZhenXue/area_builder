// Copyright 2015-2024, University of Colorado Boulder
/**
 * NumberControl is a control for changing a Property<number>, with flexible layout. It consists of a labeled value,
 * slider, and arrow buttons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { AlignBox, assertNoAdditionalChildren, extendsWidthSizable, HBox, isWidthSizable, Node, PaintColorProperty, ParallelDOM, Text, VBox, WidthSizable } from '../../scenery/js/imports.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import Slider from '../../sun/js/Slider.js';
import nullSoundPlayer from '../../tambo/js/nullSoundPlayer.js';
import ValueChangeSoundPlayer from '../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import NumberDisplay from './NumberDisplay.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const SPECIFIC_COMPONENT_CALLBACK_OPTIONS = [
    'startDrag',
    'endDrag',
    'leftStart',
    'leftEnd',
    'rightStart',
    'rightEnd'
];
// This is a marker to indicate that we should create the actual default sound player.
const DEFAULT_SOUND = new ValueChangeSoundPlayer(new Range(0, 1));
const DEFAULT_HSLIDER_TRACK_SIZE = new Dimension2(180, 3);
const DEFAULT_HSLIDER_THUMB_SIZE = new Dimension2(17, 34);
let NumberControl = class NumberControl extends WidthSizable(Node) {
    dispose() {
        this.disposeNumberControl();
        super.dispose();
    }
    /**
   * Creates a NumberControl with default tick marks for min and max values.
   */ static withMinMaxTicks(label, property, range, providedOptions) {
        const options = optionize()({
            tickLabelFont: new PhetFont(12)
        }, providedOptions);
        options.sliderOptions = combineOptions({
            majorTicks: [
                {
                    value: range.min,
                    label: new Text(range.min, {
                        font: options.tickLabelFont
                    })
                },
                {
                    value: range.max,
                    label: new Text(range.max, {
                        font: options.tickLabelFont
                    })
                }
            ]
        }, options.sliderOptions);
        return new NumberControl(label, property, range, options);
    }
    /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title number
   *  < ------|------ >
   *
   */ static createLayoutFunction1(providedOptions) {
        const options = optionize()({
            align: 'center',
            titleXSpacing: 5,
            arrowButtonsXSpacing: 15,
            ySpacing: 5
        }, providedOptions);
        return (titleNode, numberDisplay, slider, decrementButton, incrementButton)=>{
            assert && assert(decrementButton, 'There is no decrementButton!');
            assert && assert(incrementButton, 'There is no incrementButton!');
            slider.mutateLayoutOptions({
                grow: 1
            });
            return new VBox({
                align: options.align,
                spacing: options.ySpacing,
                children: [
                    new HBox({
                        spacing: options.titleXSpacing,
                        children: [
                            titleNode,
                            numberDisplay
                        ]
                    }),
                    new HBox({
                        layoutOptions: {
                            stretch: true
                        },
                        spacing: options.arrowButtonsXSpacing,
                        children: [
                            decrementButton,
                            slider,
                            incrementButton
                        ]
                    })
                ]
            });
        };
    }
    /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title < number >
   *  ------|------
   */ static createLayoutFunction2(providedOptions) {
        const options = optionize()({
            align: 'center',
            xSpacing: 5,
            ySpacing: 5
        }, providedOptions);
        return (titleNode, numberDisplay, slider, decrementButton, incrementButton)=>{
            assert && assert(decrementButton);
            assert && assert(incrementButton);
            slider.mutateLayoutOptions({
                stretch: true
            });
            return new VBox({
                align: options.align,
                spacing: options.ySpacing,
                children: [
                    new HBox({
                        spacing: options.xSpacing,
                        children: [
                            titleNode,
                            decrementButton,
                            numberDisplay,
                            incrementButton
                        ]
                    }),
                    slider
                ]
            });
        };
    }
    /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Arranges subcomponents like this:
   *
   *  title
   *  < number >
   *  -------|-------
   */ static createLayoutFunction3(providedOptions) {
        const options = optionize()({
            alignTitle: 'center',
            alignNumber: 'center',
            titleLeftIndent: 0,
            xSpacing: 5,
            ySpacing: 5
        }, providedOptions);
        return (titleNode, numberDisplay, slider, decrementButton, incrementButton)=>{
            assert && assert(decrementButton);
            assert && assert(incrementButton);
            slider.mutateLayoutOptions({
                stretch: true
            });
            const titleAndContentVBox = new VBox({
                spacing: options.ySpacing,
                align: options.alignTitle,
                children: [
                    new AlignBox(titleNode, {
                        leftMargin: options.titleLeftIndent
                    }),
                    new VBox({
                        layoutOptions: {
                            stretch: true
                        },
                        spacing: options.ySpacing,
                        align: options.alignNumber,
                        children: [
                            new HBox({
                                spacing: options.xSpacing,
                                children: [
                                    decrementButton,
                                    numberDisplay,
                                    incrementButton
                                ]
                            }),
                            slider
                        ]
                    })
                ]
            });
            // When the text of the title changes recompute the alignment between the title and content
            titleNode.boundsProperty.lazyLink(()=>{
                titleAndContentVBox.updateLayout();
            });
            return titleAndContentVBox;
        };
    }
    /**
   * Creates one of the pre-defined layout functions that can be used for options.layoutFunction.
   * Like createLayoutFunction1, but the title and value go all the way to the edges.
   */ static createLayoutFunction4(providedOptions) {
        const options = optionize()({
            // adds additional horizontal space between title and NumberDisplay
            sliderPadding: 0,
            // vertical spacing between slider and title/NumberDisplay
            verticalSpacing: 5,
            // spacing between slider and arrow buttons
            arrowButtonSpacing: 5,
            numberDisplayParentNodeOptions: {
                excludeInvisibleChildrenFromBounds: true
            },
            layoutInvisibleButtons: false,
            createBottomContent: null // Supports Pendulum Lab's questionText where a question is substituted for the slider
        }, providedOptions);
        return (titleNode, numberDisplay, slider, decrementButton, incrementButton)=>{
            slider.mutateLayoutOptions({
                grow: 1
            });
            const includeArrowButtons = !!decrementButton; // if there aren't arrow buttons, then exclude them
            const bottomBox = new HBox({
                spacing: options.arrowButtonSpacing,
                children: !includeArrowButtons ? [
                    slider
                ] : [
                    decrementButton,
                    slider,
                    incrementButton
                ],
                excludeInvisibleChildrenFromBounds: !options.layoutInvisibleButtons
            });
            const bottomContent = options.createBottomContent ? options.createBottomContent(bottomBox) : bottomBox;
            bottomContent.mutateLayoutOptions({
                stretch: true,
                xMargin: options.sliderPadding
            });
            // Dynamic layout supported
            return new VBox({
                spacing: options.verticalSpacing,
                children: [
                    new HBox({
                        spacing: options.sliderPadding,
                        children: [
                            titleNode,
                            new Node(combineOptions({
                                children: [
                                    numberDisplay
                                ]
                            }, options.numberDisplayParentNodeOptions))
                        ],
                        layoutOptions: {
                            stretch: true
                        }
                    }),
                    bottomContent
                ]
            });
        };
    }
    constructor(title, numberProperty, numberRange, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // Make sure that general callbacks (for all components) and specific callbacks (for a specific component) aren't
        // used in tandem. This must be called before defaults are set.
        validateCallbacks(providedOptions || {});
        // Extend NumberControl options before merging nested options because some nested defaults use these options.
        const initialOptions = optionize()({
            numberDisplayOptions: {},
            sliderOptions: {},
            arrowButtonOptions: {},
            titleNodeOptions: {},
            // General Callbacks
            startCallback: _.noop,
            endCallback: _.noop,
            delta: 1,
            disabledOpacity: 0.5,
            // A {function} that handles layout of subcomponents.
            // It has signature function( titleNode, numberDisplay, slider, decrementButton, incrementButton )
            // and returns a Node. If you want to customize the layout, use one of the predefined creators
            // (see createLayoutFunction*) or create your own function. Arrow buttons will be null if `includeArrowButtons:false`
            layoutFunction: NumberControl.createLayoutFunction1(),
            // {boolean} If set to true, then increment/decrement arrow buttons will be added to the NumberControl
            includeArrowButtons: true,
            soundGenerator: DEFAULT_SOUND,
            valueChangeSoundGeneratorOptions: {},
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Control',
            phetioType: NumberControl.NumberControlIO,
            phetioEnabledPropertyInstrumented: true,
            visiblePropertyOptions: {
                phetioFeatured: true
            }
        }, providedOptions);
        // A groupFocusHighlight is only included if using arrowButtons. When there are arrowButtons it is important
        // to indicate that the whole control is only one stop in the traversal order. This is set by NumberControl.
        assert && assert(initialOptions.groupFocusHighlight === undefined, 'NumberControl sets groupFocusHighlight');
        super();
        // If the arrow button scale is not provided, the arrow button height will match the number display height
        const arrowButtonScaleProvided = initialOptions.arrowButtonOptions && initialOptions.arrowButtonOptions.hasOwnProperty('scale');
        const getCurrentRange = ()=>{
            return options.enabledRangeProperty ? options.enabledRangeProperty.value : numberRange;
        };
        // Create a function that will be used to constrain the slider value to the provided range and the same delta as
        // the arrow buttons, see https://github.com/phetsims/scenery-phet/issues/384.
        const constrainValue = (value)=>{
            assert && assert(options.delta !== undefined);
            const newValue = Utils.roundToInterval(value, options.delta);
            return getCurrentRange().constrainValue(newValue);
        };
        assert && assert(initialOptions.soundGenerator === DEFAULT_SOUND || _.isEmpty(initialOptions.valueChangeSoundGeneratorOptions), 'options should only be supplied when using default sound generator');
        // If no sound generator was provided, create one using the default configuration.
        if (initialOptions.soundGenerator === DEFAULT_SOUND) {
            let valueChangeSoundGeneratorOptions = initialOptions.valueChangeSoundGeneratorOptions;
            if (_.isEmpty(initialOptions.valueChangeSoundGeneratorOptions)) {
                // If no options were provided for the ValueChangeSoundGenerator, use a default where a sound will be produced
                // for every valid value set by this control.
                valueChangeSoundGeneratorOptions = {
                    interThresholdDelta: initialOptions.delta,
                    constrainValue: constrainValue
                };
            }
            initialOptions.soundGenerator = new ValueChangeSoundPlayer(numberRange, valueChangeSoundGeneratorOptions);
        } else if (initialOptions.soundGenerator === null) {
            initialOptions.soundGenerator = ValueChangeSoundPlayer.NO_SOUND;
        }
        // Merge all nested options in one block.
        const options = combineOptions({
            // Options propagated to ArrowButton
            arrowButtonOptions: {
                // Values chosen to match previous behavior, see https://github.com/phetsims/scenery-phet/issues/489.
                // touchAreaXDilation is 1/2 of its original value because touchArea is shifted.
                touchAreaXDilation: 3.5,
                touchAreaYDilation: 7,
                mouseAreaXDilation: 0,
                mouseAreaYDilation: 0,
                // If the value is within this amount of the respective min/max, it will be treated as if it was at that value
                // (for determining whether the arrow button is enabled).
                enabledEpsilon: 0,
                // callbacks
                leftStart: initialOptions.startCallback,
                leftEnd: initialOptions.endCallback,
                rightStart: initialOptions.startCallback,
                rightEnd: initialOptions.endCallback,
                // phet-io
                enabledPropertyOptions: {
                    phetioReadOnly: true,
                    phetioFeatured: false
                }
            },
            // Options propagated to Slider
            sliderOptions: {
                orientation: Orientation.HORIZONTAL,
                startDrag: initialOptions.startCallback,
                endDrag: initialOptions.endCallback,
                // With the exception of startDrag and endDrag (use startCallback and endCallback respectively),
                // all HSlider options may be used. These are the ones that NumberControl overrides:
                majorTickLength: 20,
                minorTickStroke: 'rgba( 0, 0, 0, 0.3 )',
                // other slider options that are specific to NumberControl
                majorTicks: [],
                minorTickSpacing: 0,
                // constrain the slider value to the provided range and the same delta as the arrow buttons,
                // see https://github.com/phetsims/scenery-phet/issues/384
                constrainValue: constrainValue,
                soundGenerator: initialOptions.soundGenerator,
                // phet-io
                tandem: initialOptions.tandem.createTandem(NumberControl.SLIDER_TANDEM_NAME)
            },
            // Options propagated to NumberDisplay
            numberDisplayOptions: {
                textOptions: {
                    font: new PhetFont(12),
                    stringPropertyOptions: {
                        phetioFeatured: true
                    }
                },
                // phet-io
                tandem: initialOptions.tandem.createTandem('numberDisplay'),
                visiblePropertyOptions: {
                    phetioFeatured: true
                }
            },
            // Options propagated to the title Text Node
            titleNodeOptions: {
                font: new PhetFont(12),
                maxWidth: null,
                fill: 'black',
                tandem: initialOptions.tandem.createTandem('titleText')
            }
        }, initialOptions);
        // validate options
        assert && assert(!options.startDrag, 'use options.startCallback instead of options.startDrag');
        assert && assert(!options.endDrag, 'use options.endCallback instead of options.endDrag');
        if (options.enabledRangeProperty) {
            options.sliderOptions.enabledRangeProperty = options.enabledRangeProperty;
        }
        // pdom - for alternative input, the number control is accessed entirely through slider interaction and these
        // arrow buttons are not tab navigable
        assert && assert(options.arrowButtonOptions.tagName === undefined, 'NumberControl\'s accessible content uses AccessibleSlider, do not set accessible content on the buttons.');
        options.arrowButtonOptions.tagName = null;
        // pdom - if we include arrow buttons, use a groupFocusHighlight to surround the NumberControl to make it clear
        // that it is a composite component and there is only one stop in the traversal order.
        this.groupFocusHighlight = options.includeArrowButtons;
        const titleNode = new Text(title, options.titleNodeOptions);
        const numberDisplay = new NumberDisplay(numberProperty, numberRange, options.numberDisplayOptions);
        // Slider options for track (if not specified as trackNode)
        if (!options.sliderOptions.trackNode) {
            options.sliderOptions = combineOptions({
                trackSize: options.sliderOptions.orientation === Orientation.HORIZONTAL ? DEFAULT_HSLIDER_TRACK_SIZE : DEFAULT_HSLIDER_TRACK_SIZE.swapped()
            }, options.sliderOptions);
        }
        // Slider options for thumb (if n ot specified as thumbNode)
        if (!options.sliderOptions.thumbNode) {
            options.sliderOptions = combineOptions({
                thumbSize: options.sliderOptions.orientation === Orientation.HORIZONTAL ? DEFAULT_HSLIDER_THUMB_SIZE : DEFAULT_HSLIDER_THUMB_SIZE.swapped(),
                thumbTouchAreaXDilation: 6
            }, options.sliderOptions);
        }
        assert && assert(!options.sliderOptions.hasOwnProperty('phetioType'), 'NumberControl sets phetioType');
        // slider options set by NumberControl, note this may not be the long term pattern, see https://github.com/phetsims/phet-info/issues/96
        options.sliderOptions = combineOptions({
            // pdom - by default, shiftKeyboardStep should most likely be the same as clicking the arrow buttons.
            shiftKeyboardStep: options.delta,
            // pdom - The default aria-valuetext for the slider should read the value of the NumberDisplay.
            pdomCreateAriaValueText: ()=>numberDisplay.valueStringProperty.value,
            // Make sure Slider gets created with the right IOType
            phetioType: Slider.SliderIO
        }, options.sliderOptions);
        // highlight color for thumb defaults to a brighter version of the thumb color
        if (options.sliderOptions.thumbFill && !options.sliderOptions.thumbFillHighlighted) {
            this.thumbFillProperty = new PaintColorProperty(options.sliderOptions.thumbFill);
            // Reference to the DerivedProperty not needed, since we dispose what it listens to above.
            options.sliderOptions.thumbFillHighlighted = new DerivedProperty([
                this.thumbFillProperty
            ], (color)=>color.brighterColor());
        }
        this.slider = new Slider(numberProperty, numberRange, options.sliderOptions);
        // pdom - forward the accessibleName and help text set on this component to the slider
        ParallelDOM.forwardAccessibleName(this, this.slider);
        ParallelDOM.forwardHelpText(this, this.slider);
        // set below, see options.includeArrowButtons
        let decrementButton = null;
        let incrementButton = null;
        let arrowEnabledListener = null;
        if (options.includeArrowButtons) {
            const touchAreaXDilation = options.arrowButtonOptions.touchAreaXDilation;
            const mouseAreaXDilation = options.arrowButtonOptions.mouseAreaXDilation;
            assert && assert(touchAreaXDilation !== undefined && mouseAreaXDilation !== undefined, 'Should be defined, since we have defaults above');
            decrementButton = new ArrowButton('left', ()=>{
                const oldValue = numberProperty.get();
                let newValue = numberProperty.get() - options.delta;
                newValue = Utils.roundToInterval(newValue, options.delta); // constrain to multiples of delta, see #384
                newValue = Math.max(newValue, getCurrentRange().min); // constrain to range
                numberProperty.set(newValue);
                options.soundGenerator.playSoundForValueChange(newValue, oldValue);
                this.slider.voicingOnEndResponse(oldValue);
            }, combineOptions({
                soundPlayer: nullSoundPlayer,
                startCallback: options.arrowButtonOptions.leftStart,
                endCallback: options.arrowButtonOptions.leftEnd,
                tandem: options.tandem.createTandem('decrementButton'),
                touchAreaXShift: -touchAreaXDilation,
                mouseAreaXShift: -mouseAreaXDilation
            }, options.arrowButtonOptions));
            incrementButton = new ArrowButton('right', ()=>{
                const oldValue = numberProperty.get();
                let newValue = numberProperty.get() + options.delta;
                newValue = Utils.roundToInterval(newValue, options.delta); // constrain to multiples of delta, see #384
                newValue = Math.min(newValue, getCurrentRange().max); // constrain to range
                numberProperty.set(newValue);
                options.soundGenerator.playSoundForValueChange(newValue, oldValue);
                this.slider.voicingOnEndResponse(oldValue);
            }, combineOptions({
                soundPlayer: nullSoundPlayer,
                startCallback: options.arrowButtonOptions.rightStart,
                endCallback: options.arrowButtonOptions.rightEnd,
                tandem: options.tandem.createTandem('incrementButton'),
                touchAreaXShift: touchAreaXDilation,
                mouseAreaXShift: mouseAreaXDilation
            }, options.arrowButtonOptions));
            // By default, scale the ArrowButtons to have the same height as the NumberDisplay, but ignoring
            // the NumberDisplay's maxWidth (if any)
            if (!arrowButtonScaleProvided) {
                // Remove the current button scaling so we can determine the desired final scale factor
                decrementButton.setScaleMagnitude(1);
                // Set the tweaker button height to match the height of the numberDisplay. Lengthy text can shrink a numberDisplay
                // with maxWidth--if we match the scaled height of the numberDisplay the arrow buttons would shrink too, as
                // depicted in https://github.com/phetsims/scenery-phet/issues/513#issuecomment-517897850
                // Instead, to keep the tweaker buttons a uniform and reasonable size, we match their height to the unscaled
                // height of the numberDisplay (ignores maxWidth and scale).
                const numberDisplayHeight = numberDisplay.localBounds.height;
                const arrowButtonsScale = numberDisplayHeight / decrementButton.height;
                decrementButton.setScaleMagnitude(arrowButtonsScale);
                incrementButton.setScaleMagnitude(arrowButtonsScale);
            }
            // Disable the arrow buttons if the slider currently has focus
            arrowEnabledListener = ()=>{
                const value = numberProperty.value;
                assert && assert(options.arrowButtonOptions.enabledEpsilon !== undefined);
                decrementButton.enabled = value - options.arrowButtonOptions.enabledEpsilon > getCurrentRange().min && !this.slider.isFocused();
                incrementButton.enabled = value + options.arrowButtonOptions.enabledEpsilon < getCurrentRange().max && !this.slider.isFocused();
            };
            numberProperty.lazyLink(arrowEnabledListener);
            options.enabledRangeProperty && options.enabledRangeProperty.lazyLink(arrowEnabledListener);
            arrowEnabledListener();
            this.slider.addInputListener({
                focus: ()=>{
                    decrementButton.enabled = false;
                    incrementButton.enabled = false;
                },
                blur: ()=>arrowEnabledListener() // recompute if the arrow buttons should be enabled
            });
        }
        // major ticks for the slider
        const majorTicks = options.sliderOptions.majorTicks;
        assert && assert(majorTicks);
        for(let i = 0; i < majorTicks.length; i++){
            this.slider.addMajorTick(majorTicks[i].value, majorTicks[i].label);
        }
        // minor ticks, exclude values where we already have major ticks
        assert && assert(options.sliderOptions.minorTickSpacing !== undefined);
        if (options.sliderOptions.minorTickSpacing > 0) {
            for(let minorTickValue = numberRange.min; minorTickValue <= numberRange.max;){
                if (!_.find(majorTicks, (majorTick)=>majorTick.value === minorTickValue)) {
                    this.slider.addMinorTick(minorTickValue);
                }
                minorTickValue += options.sliderOptions.minorTickSpacing;
            }
        }
        const child = options.layoutFunction(titleNode, numberDisplay, this.slider, decrementButton, incrementButton);
        // Set up default sizability
        this.widthSizable = isWidthSizable(child);
        // Forward minimum/preferred width Properties to the child, so each layout is responsible for its dynamic layout
        if (extendsWidthSizable(child)) {
            const minimumListener = (minimumWidth)=>{
                this.localMinimumWidth = minimumWidth;
            };
            child.minimumWidthProperty.link(minimumListener);
            const preferredListener = (localPreferredWidth)=>{
                child.preferredWidth = localPreferredWidth;
            };
            this.localPreferredWidthProperty.link(preferredListener);
            this.disposeEmitter.addListener(()=>{
                child.minimumWidthProperty.unlink(minimumListener);
                this.localPreferredWidthProperty.unlink(preferredListener);
            });
        }
        options.children = [
            child
        ];
        this.mutate(options);
        this.numberDisplay = numberDisplay;
        this.disposeNumberControl = ()=>{
            titleNode.dispose(); // may be linked to a string Property
            numberDisplay.dispose();
            this.slider.dispose();
            this.thumbFillProperty && this.thumbFillProperty.dispose();
            // only defined if options.includeArrowButtons
            decrementButton && decrementButton.dispose();
            incrementButton && incrementButton.dispose();
            arrowEnabledListener && numberProperty.unlink(arrowEnabledListener);
            arrowEnabledListener && options.enabledRangeProperty && options.enabledRangeProperty.unlink(arrowEnabledListener);
        };
        // Decorating with additional content is an anti-pattern, see https://github.com/phetsims/sun/issues/860
        assert && assertNoAdditionalChildren(this);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'NumberControl', this);
    }
};
NumberControl.NumberControlIO = new IOType('NumberControlIO', {
    valueType: NumberControl,
    documentation: 'A number control with a title, slider and +/- buttons',
    supertype: Node.NodeIO
});
NumberControl.SLIDER_TANDEM_NAME = 'slider';
export { NumberControl as default };
/**
 * Validate all of the callback related options. There are two types of callbacks. The "start/endCallback" pair
 * are passed into all components in the NumberControl. The second set are start/end callbacks for each individual
 * component. This was added to support multitouch in Rutherford Scattering as part of
 * https://github.com/phetsims/rutherford-scattering/issues/128.
 *
 * This function mutates the options by initializing general callbacks from null (in the extend call) to a no-op
 * function.
 *
 * Only general or specific callbacks are allowed, but not both.
 */ function validateCallbacks(options) {
    const normalCallbacksPresent = !!(options.startCallback || options.endCallback);
    let arrowCallbacksPresent = false;
    let sliderCallbacksPresent = false;
    if (options.arrowButtonOptions) {
        arrowCallbacksPresent = specificCallbackKeysInOptions(options.arrowButtonOptions);
    }
    if (options.sliderOptions) {
        sliderCallbacksPresent = specificCallbackKeysInOptions(options.sliderOptions);
    }
    const specificCallbacksPresent = arrowCallbacksPresent || sliderCallbacksPresent;
    // only general or component specific callbacks are supported
    assert && assert(!(normalCallbacksPresent && specificCallbacksPresent), 'Use general callbacks like "startCallback" or specific callbacks like "sliderOptions.startDrag" but not both.');
}
/**
 * Check for an intersection between the array of callback option keys and those
 * passed in the options object. These callback options are only the specific component callbacks, not the general
 * start/end that are called for every component's interaction
 */ function specificCallbackKeysInOptions(options) {
    const optionKeys = Object.keys(options);
    const intersection = SPECIFIC_COMPONENT_CALLBACK_OPTIONS.filter((x)=>_.includes(optionKeys, x));
    return intersection.length > 0;
}
sceneryPhet.register('NumberControl', NumberControl);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE51bWJlckNvbnRyb2wgaXMgYSBjb250cm9sIGZvciBjaGFuZ2luZyBhIFByb3BlcnR5PG51bWJlcj4sIHdpdGggZmxleGlibGUgbGF5b3V0LiBJdCBjb25zaXN0cyBvZiBhIGxhYmVsZWQgdmFsdWUsXG4gKiBzbGlkZXIsIGFuZCBhcnJvdyBidXR0b25zLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUGhldGlvUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9QaGV0aW9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEFsaWduQm94LCBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiwgZXh0ZW5kc1dpZHRoU2l6YWJsZSwgRm9udCwgSEJveCwgaXNXaWR0aFNpemFibGUsIE5vZGUsIE5vZGVPcHRpb25zLCBQYWludENvbG9yUHJvcGVydHksIFBhcmFsbGVsRE9NLCBSZW1vdmVQYXJhbGxlbERPTU9wdGlvbnMsIFRleHQsIFRleHRPcHRpb25zLCBUcmltUGFyYWxsZWxET01PcHRpb25zLCBWQm94LCBXaWR0aFNpemFibGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFycm93QnV0dG9uLCB7IEFycm93QnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL0Fycm93QnV0dG9uLmpzJztcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcbmltcG9ydCBTbGlkZXIsIHsgU2xpZGVyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9TbGlkZXIuanMnO1xuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9udWxsU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXIsIHsgVmFsdWVDaGFuZ2VTb3VuZFBsYXllck9wdGlvbnMgfSBmcm9tICcuLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1ZhbHVlQ2hhbmdlU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVtYmVyRGlzcGxheSwgeyBOdW1iZXJEaXNwbGF5T3B0aW9ucyB9IGZyb20gJy4vTnVtYmVyRGlzcGxheS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgU1BFQ0lGSUNfQ09NUE9ORU5UX0NBTExCQUNLX09QVElPTlMgPSBbXG4gICdzdGFydERyYWcnLFxuICAnZW5kRHJhZycsXG4gICdsZWZ0U3RhcnQnLFxuICAnbGVmdEVuZCcsXG4gICdyaWdodFN0YXJ0JyxcbiAgJ3JpZ2h0RW5kJ1xuXTtcblxuLy8gVGhpcyBpcyBhIG1hcmtlciB0byBpbmRpY2F0ZSB0aGF0IHdlIHNob3VsZCBjcmVhdGUgdGhlIGFjdHVhbCBkZWZhdWx0IHNvdW5kIHBsYXllci5cbmNvbnN0IERFRkFVTFRfU09VTkQgPSBuZXcgVmFsdWVDaGFuZ2VTb3VuZFBsYXllciggbmV3IFJhbmdlKCAwLCAxICkgKTtcblxuY29uc3QgREVGQVVMVF9IU0xJREVSX1RSQUNLX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTgwLCAzICk7XG5jb25zdCBERUZBVUxUX0hTTElERVJfVEhVTUJfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxNywgMzQgKTtcblxuZXhwb3J0IHR5cGUgTGF5b3V0RnVuY3Rpb24gPSAoIHRpdGxlTm9kZTogTm9kZSwgbnVtYmVyRGlzcGxheTogTnVtYmVyRGlzcGxheSwgc2xpZGVyOiBTbGlkZXIsIGRlY3JlbWVudEJ1dHRvbjogQXJyb3dCdXR0b24gfCBudWxsLCBpbmNyZW1lbnRCdXR0b246IEFycm93QnV0dG9uIHwgbnVsbCApID0+IE5vZGU7XG5cbi8vIGRlc2NyaXB0aW9uIG9mIGEgbWFqb3IgdGlja1xudHlwZSBOdW1iZXJDb250cm9sTWFqb3JUaWNrID0ge1xuICB2YWx1ZTogbnVtYmVyOyAvLyB2YWx1ZSB0aGF0IHRoZSB0aWNrIGNvcnJlc3BvbmRzIHRvXG4gIGxhYmVsPzogTm9kZTsgLy8gb3B0aW9uYWwgbGFiZWwgdGhhdCBhcHBlYXJzIGF0IHRoZSB0aWNrIG1hcmtcbn07XG5cbi8vIE90aGVyIHNsaWRlciBvcHRpb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIE51bWJlckNvbnRyb2wuIEFjY2Vzc2liaWxpdHkgb3B0aW9ucyBzaG91bGQgYmUgc2V0IG9uIHRoZSBOdW1iZXJDb250cm9sLlxuZXhwb3J0IHR5cGUgTnVtYmVyQ29udHJvbFNsaWRlck9wdGlvbnMgPSBTdHJpY3RPbWl0PFJlbW92ZVBhcmFsbGVsRE9NT3B0aW9uczxTbGlkZXJPcHRpb25zPiwgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz4gJiB7XG5cbiAgLy8gZGVzY3JpcHRpb24gb2YgbWFqb3IgdGlja3NcbiAgbWFqb3JUaWNrcz86IE51bWJlckNvbnRyb2xNYWpvclRpY2tbXTtcblxuICAvLyB6ZXJvIGluZGljYXRlcyBubyBtaW5vciB0aWNrc1xuICBtaW5vclRpY2tTcGFjaW5nPzogbnVtYmVyO1xufTtcblxudHlwZSBXaXRoTWluTWF4U2VsZk9wdGlvbnMgPSB7XG4gIHRpY2tMYWJlbEZvbnQ/OiBGb250O1xufTtcbmV4cG9ydCB0eXBlIFdpdGhNaW5NYXhPcHRpb25zID0gTnVtYmVyQ29udHJvbE9wdGlvbnMgJiBXaXRoTWluTWF4U2VsZk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjFPcHRpb25zID0ge1xuICAvLyBob3Jpem9udGFsIGFsaWdubWVudCBvZiByb3dzLCAnbGVmdCd8J3JpZ2h0J3wnY2VudGVyJ1xuICBhbGlnbj86ICdjZW50ZXInIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxuICAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiB0aXRsZSBhbmQgbnVtYmVyXG4gIHRpdGxlWFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gaG9yaXpvbnRhbCBzcGFjaW5nIGJldHdlZW4gYXJyb3cgYnV0dG9ucyBhbmQgc2xpZGVyXG4gIGFycm93QnV0dG9uc1hTcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiByb3dzXG4gIHlTcGFjaW5nPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyQ29udHJvbExheW91dEZ1bmN0aW9uMk9wdGlvbnMgPSB7XG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHJvd3MsICdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXG4gIGFsaWduPzogJ2NlbnRlcicgfCAnbGVmdCcgfCAncmlnaHQnO1xuXG4gIC8vIGhvcml6b250YWwgc3BhY2luZyBpbiB0b3Agcm93XG4gIHhTcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiByb3dzXG4gIHlTcGFjaW5nPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyQ29udHJvbExheW91dEZ1bmN0aW9uM09wdGlvbnMgPSB7XG4gIC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHRpdGxlLCByZWxhdGl2ZSB0byBzbGlkZXIsICdsZWZ0J3wncmlnaHQnfCdjZW50ZXInXG4gIGFsaWduVGl0bGU/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbiAgLy8gaG9yaXpvbnRhbCBhbGlnbm1lbnQgb2YgbnVtYmVyIGRpc3BsYXksIHJlbGF0aXZlIHRvIHNsaWRlciwgJ2xlZnQnfCdyaWdodCd8J2NlbnRlcidcbiAgYWxpZ25OdW1iZXI/OiAnY2VudGVyJyB8ICdsZWZ0JyB8ICdyaWdodCc7XG5cbiAgLy8gaWYgcHJvdmlkZWQsIGluZGVudCB0aGUgdGl0bGUgb24gdGhlIGxlZnQgdG8gcHVzaCB0aGUgdGl0bGUgdG8gdGhlIHJpZ2h0XG4gIHRpdGxlTGVmdEluZGVudD86IG51bWJlcjtcblxuICAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiBhcnJvdyBidXR0b25zIGFuZCBzbGlkZXJcbiAgeFNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIHJvd3NcbiAgeVNwYWNpbmc/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb240T3B0aW9ucyA9IHtcbiAgLy8gYWRkcyBhZGRpdGlvbmFsIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiB0aXRsZSBhbmQgTnVtYmVyRGlzcGxheVxuICBzbGlkZXJQYWRkaW5nPzogbnVtYmVyO1xuXG4gIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiBzbGlkZXIgYW5kIHRpdGxlL051bWJlckRpc3BsYXlcbiAgdmVydGljYWxTcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIHNwYWNpbmcgYmV0d2VlbiBzbGlkZXIgYW5kIGFycm93IGJ1dHRvbnNcbiAgYXJyb3dCdXR0b25TcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIFByb3ZpZGVkIHRvIHRoZSBjb250YWluaW5nIE5vZGUgb2YgdGhlIE51bWJlckRpc3BsYXlcbiAgbnVtYmVyRGlzcGxheVBhcmVudE5vZGVPcHRpb25zPzogU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbiAgLy8gU3VwcG9ydHMgUGVuZHVsdW0gTGFiJ3MgcXVlc3Rpb25UZXh0IHdoZXJlIGEgcXVlc3Rpb24gaXMgc3Vic3RpdHV0ZWQgZm9yIHRoZSBzbGlkZXJcbiAgY3JlYXRlQm90dG9tQ29udGVudD86ICggKCBib3g6IEhCb3ggKSA9PiBOb2RlICkgfCBudWxsO1xuXG4gIC8vIFdoZXRoZXIgaW52aXNpYmxlIGluY3JlbWVudC9kZWNyZW1lbnQgYnV0dG9ucyAob3IgdGhlIHNsaWRlciBpdHNlbGYpIHNob3VsZCBiZSBsYWlkIG91dCBhcyBpZiB0aGV5IHdlcmUgdGhlcmVcbiAgbGF5b3V0SW52aXNpYmxlQnV0dG9ucz86IGJvb2xlYW47XG59O1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBjYWxsZWQgd2hlbiBpbnRlcmFjdGlvbiBiZWdpbnMsIGRlZmF1bHQgdmFsdWUgc2V0IGluIHZhbGlkYXRlQ2FsbGJhY2tzKClcbiAgc3RhcnRDYWxsYmFjaz86ICgpID0+IHZvaWQ7XG5cbiAgLy8gY2FsbGVkIHdoZW4gaW50ZXJhY3Rpb24gZW5kcywgZGVmYXVsdCB2YWx1ZSBzZXQgaW4gdmFsaWRhdGVDYWxsYmFja3MoKVxuICBlbmRDYWxsYmFjaz86ICgpID0+IHZvaWQ7XG5cbiAgZGVsdGE/OiBudW1iZXI7XG5cbiAgLy8gb3BhY2l0eSB1c2VkIHRvIG1ha2UgdGhlIGNvbnRyb2wgbG9vayBkaXNhYmxlZFxuICBkaXNhYmxlZE9wYWNpdHk/OiBudW1iZXI7XG5cbiAgLy8gSWYgc2V0IHRvIHRydWUsIHRoZW4gaW5jcmVtZW50L2RlY3JlbWVudCBhcnJvdyBidXR0b25zIHdpbGwgYmUgYWRkZWQgdG8gdGhlIE51bWJlckNvbnRyb2xcbiAgaW5jbHVkZUFycm93QnV0dG9ucz86IGJvb2xlYW47XG5cbiAgLy8gU3ViY29tcG9uZW50IG9wdGlvbnMgb2JqZWN0c1xuICBudW1iZXJEaXNwbGF5T3B0aW9ucz86IE51bWJlckRpc3BsYXlPcHRpb25zO1xuICBzbGlkZXJPcHRpb25zPzogTnVtYmVyQ29udHJvbFNsaWRlck9wdGlvbnM7XG5cbiAgLy8gZmlyZU9uRG93biBpcyBidWdneSwgc28gb21pdCBpdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzgyNVxuICBhcnJvd0J1dHRvbk9wdGlvbnM/OiBTdHJpY3RPbWl0PEFycm93QnV0dG9uT3B0aW9ucywgJ2ZpcmVPbkRvd24nPiAmIHtcbiAgICAvLyBXZSBzdHVmZmVkIGVuYWJsZWRFcHNpbG9uIGhlcmVcbiAgICBlbmFibGVkRXBzaWxvbj86IG51bWJlcjtcblxuICAgIGxlZnRTdGFydD86ICgpID0+IHZvaWQ7XG4gICAgbGVmdEVuZD86ICggb3ZlcjogYm9vbGVhbiApID0+IHZvaWQ7XG5cbiAgICByaWdodFN0YXJ0PzogKCkgPT4gdm9pZDtcbiAgICByaWdodEVuZD86ICggb3ZlcjogYm9vbGVhbiApID0+IHZvaWQ7XG4gIH07XG4gIHRpdGxlTm9kZU9wdGlvbnM/OiBUZXh0T3B0aW9ucztcblxuICAvLyBJZiBwcm92aWRlZCwgdGhpcyB3aWxsIGJlIHByb3ZpZGVkIHRvIHRoZSBzbGlkZXIgYW5kIGFycm93IGJ1dHRvbnMgaW4gb3JkZXIgdG9cbiAgLy8gY29uc3RyYWluIHRoZSByYW5nZSBvZiBhY3R1YWwgdmFsdWVzIHRvIHdpdGhpbiB0aGlzIHJhbmdlLlxuICBlbmFibGVkUmFuZ2VQcm9wZXJ0eT86IFNsaWRlck9wdGlvbnNbICdlbmFibGVkUmFuZ2VQcm9wZXJ0eScgXTtcblxuICAvLyBUaGlzIGlzIHVzZWQgdG8gZ2VuZXJhdGUgc291bmRzIGFzIHRoZSB2YWx1ZSBvZiB0aGUgbnVtYmVyIGlzIGNoYW5nZWQgdXNpbmcgdGhlIHNsaWRlciBvciB0aGUgYnV0dG9ucy4gIElmIG5vdFxuICAvLyBwcm92aWRlZCwgYSBkZWZhdWx0IHNvdW5kIGdlbmVyYXRvciB3aWxsIGJlIGNyZWF0ZWQuIElmIHNldCB0byBudWxsLCB0aGUgbnVtYmVyIGNvbnRyb2wgd2lsbCBnZW5lcmF0ZSBubyBzb3VuZC5cbiAgc291bmRHZW5lcmF0b3I/OiBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIHwgbnVsbDtcblxuICAvLyBPcHRpb25zIGZvciB0aGUgZGVmYXVsdCBzb3VuZCBnZW5lcmF0b3IuICBUaGVzZSBzaG91bGQgb25seSBiZSBwcm92aWRlZCB3aGVuIE5PVCBwcm92aWRpbmcgYSBjdXN0b20gc291bmQgcGxheWVyLlxuICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucz86IFZhbHVlQ2hhbmdlU291bmRQbGF5ZXJPcHRpb25zO1xuXG4gIC8vIEEge2Z1bmN0aW9ufSB0aGF0IGhhbmRsZXMgbGF5b3V0IG9mIHN1YmNvbXBvbmVudHMuXG4gIC8vIEl0IGhhcyBzaWduYXR1cmUgZnVuY3Rpb24oIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApXG4gIC8vIGFuZCByZXR1cm5zIGEgTm9kZS4gSWYgeW91IHdhbnQgdG8gY3VzdG9taXplIHRoZSBsYXlvdXQsIHVzZSBvbmUgb2YgdGhlIHByZWRlZmluZWQgY3JlYXRvcnNcbiAgLy8gKHNlZSBjcmVhdGVMYXlvdXRGdW5jdGlvbiopIG9yIGNyZWF0ZSB5b3VyIG93biBmdW5jdGlvbi4gQXJyb3cgYnV0dG9ucyB3aWxsIGJlIG51bGwgaWYgYGluY2x1ZGVBcnJvd0J1dHRvbnM6ZmFsc2VgXG4gIGxheW91dEZ1bmN0aW9uPzogTGF5b3V0RnVuY3Rpb247XG59O1xuXG5leHBvcnQgdHlwZSBOdW1iZXJDb250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxUcmltUGFyYWxsZWxET01PcHRpb25zPE5vZGVPcHRpb25zPiwgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51bWJlckNvbnRyb2wgZXh0ZW5kcyBXaWR0aFNpemFibGUoIE5vZGUgKSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IHNsaWRlcjogSFNsaWRlcjsgLy8gZm9yIGExMXkgQVBJXG5cbiAgcHJpdmF0ZSByZWFkb25seSB0aHVtYkZpbGxQcm9wZXJ0eT86IFBhaW50Q29sb3JQcm9wZXJ0eTtcbiAgcHJpdmF0ZSByZWFkb25seSBudW1iZXJEaXNwbGF5OiBOdW1iZXJEaXNwbGF5O1xuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VOdW1iZXJDb250cm9sOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGl0bGU6IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIG51bWJlclByb3BlcnR5OiBQaGV0aW9Qcm9wZXJ0eTxudW1iZXI+LCBudW1iZXJSYW5nZTogUmFuZ2UsIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xPcHRpb25zICkge1xuXG4gICAgLy8gTWFrZSBzdXJlIHRoYXQgZ2VuZXJhbCBjYWxsYmFja3MgKGZvciBhbGwgY29tcG9uZW50cykgYW5kIHNwZWNpZmljIGNhbGxiYWNrcyAoZm9yIGEgc3BlY2lmaWMgY29tcG9uZW50KSBhcmVuJ3RcbiAgICAvLyB1c2VkIGluIHRhbmRlbS4gVGhpcyBtdXN0IGJlIGNhbGxlZCBiZWZvcmUgZGVmYXVsdHMgYXJlIHNldC5cbiAgICB2YWxpZGF0ZUNhbGxiYWNrcyggcHJvdmlkZWRPcHRpb25zIHx8IHt9ICk7XG5cbiAgICAvLyBPbWl0IGVuYWJsZWRSYW5nZVByb3BlcnR5IGZyb20gdG9wLWxldmVsLCBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gcHJvdmlkZSBhIGRlZmF1bHQuXG4gICAgLy8gVGhlbiBhZGQgZW5hYmxlZFJhbmdlUHJvcGVydHkgdG8gc2xpZGVyT3B0aW9ucywgc28gdGhhdCBpZiB3ZSBhcmUgZ2l2ZW4gcHJvdmlkZWRPcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5LFxuICAgIC8vIHdlIGNhbiBwYXNzIGl0IHRvIHN1cGVyIHZpYSBvcHRpb25zLnNsaWRlck9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkuXG4gICAgdHlwZSBSZXZpc2VkU2VsZk9wdGlvbnMgPSBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnZW5hYmxlZFJhbmdlUHJvcGVydHknPiAmIHtcbiAgICAgIHNsaWRlck9wdGlvbnM/OiBQaWNrT3B0aW9uYWw8U2xpZGVyT3B0aW9ucywgJ2VuYWJsZWRSYW5nZVByb3BlcnR5Jz47XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZCBOdW1iZXJDb250cm9sIG9wdGlvbnMgYmVmb3JlIG1lcmdpbmcgbmVzdGVkIG9wdGlvbnMgYmVjYXVzZSBzb21lIG5lc3RlZCBkZWZhdWx0cyB1c2UgdGhlc2Ugb3B0aW9ucy5cbiAgICBjb25zdCBpbml0aWFsT3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJDb250cm9sT3B0aW9ucywgUmV2aXNlZFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge30sXG4gICAgICBzbGlkZXJPcHRpb25zOiB7fSxcbiAgICAgIGFycm93QnV0dG9uT3B0aW9uczoge30sXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7fSxcblxuICAgICAgLy8gR2VuZXJhbCBDYWxsYmFja3NcbiAgICAgIHN0YXJ0Q2FsbGJhY2s6IF8ubm9vcCwgLy8gY2FsbGVkIHdoZW4gaW50ZXJhY3Rpb24gYmVnaW5zLCBkZWZhdWx0IHZhbHVlIHNldCBpbiB2YWxpZGF0ZUNhbGxiYWNrcygpXG4gICAgICBlbmRDYWxsYmFjazogXy5ub29wLCAvLyBjYWxsZWQgd2hlbiBpbnRlcmFjdGlvbiBlbmRzLCBkZWZhdWx0IHZhbHVlIHNldCBpbiB2YWxpZGF0ZUNhbGxiYWNrcygpXG5cbiAgICAgIGRlbHRhOiAxLFxuXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IDAuNSwgLy8ge251bWJlcn0gb3BhY2l0eSB1c2VkIHRvIG1ha2UgdGhlIGNvbnRyb2wgbG9vayBkaXNhYmxlZFxuXG4gICAgICAvLyBBIHtmdW5jdGlvbn0gdGhhdCBoYW5kbGVzIGxheW91dCBvZiBzdWJjb21wb25lbnRzLlxuICAgICAgLy8gSXQgaGFzIHNpZ25hdHVyZSBmdW5jdGlvbiggdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBzbGlkZXIsIGRlY3JlbWVudEJ1dHRvbiwgaW5jcmVtZW50QnV0dG9uIClcbiAgICAgIC8vIGFuZCByZXR1cm5zIGEgTm9kZS4gSWYgeW91IHdhbnQgdG8gY3VzdG9taXplIHRoZSBsYXlvdXQsIHVzZSBvbmUgb2YgdGhlIHByZWRlZmluZWQgY3JlYXRvcnNcbiAgICAgIC8vIChzZWUgY3JlYXRlTGF5b3V0RnVuY3Rpb24qKSBvciBjcmVhdGUgeW91ciBvd24gZnVuY3Rpb24uIEFycm93IGJ1dHRvbnMgd2lsbCBiZSBudWxsIGlmIGBpbmNsdWRlQXJyb3dCdXR0b25zOmZhbHNlYFxuICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb24xKCksXG5cbiAgICAgIC8vIHtib29sZWFufSBJZiBzZXQgdG8gdHJ1ZSwgdGhlbiBpbmNyZW1lbnQvZGVjcmVtZW50IGFycm93IGJ1dHRvbnMgd2lsbCBiZSBhZGRlZCB0byB0aGUgTnVtYmVyQ29udHJvbFxuICAgICAgaW5jbHVkZUFycm93QnV0dG9uczogdHJ1ZSxcblxuICAgICAgc291bmRHZW5lcmF0b3I6IERFRkFVTFRfU09VTkQsXG4gICAgICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9uczoge30sXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0NvbnRyb2wnLFxuICAgICAgcGhldGlvVHlwZTogTnVtYmVyQ29udHJvbC5OdW1iZXJDb250cm9sSU8sXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUsIC8vIG9wdCBpbnRvIGRlZmF1bHQgUGhFVC1pTyBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5XG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiB0cnVlIH1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIEEgZ3JvdXBGb2N1c0hpZ2hsaWdodCBpcyBvbmx5IGluY2x1ZGVkIGlmIHVzaW5nIGFycm93QnV0dG9ucy4gV2hlbiB0aGVyZSBhcmUgYXJyb3dCdXR0b25zIGl0IGlzIGltcG9ydGFudFxuICAgIC8vIHRvIGluZGljYXRlIHRoYXQgdGhlIHdob2xlIGNvbnRyb2wgaXMgb25seSBvbmUgc3RvcCBpbiB0aGUgdHJhdmVyc2FsIG9yZGVyLiBUaGlzIGlzIHNldCBieSBOdW1iZXJDb250cm9sLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluaXRpYWxPcHRpb25zLmdyb3VwRm9jdXNIaWdobGlnaHQgPT09IHVuZGVmaW5lZCwgJ051bWJlckNvbnRyb2wgc2V0cyBncm91cEZvY3VzSGlnaGxpZ2h0JyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIElmIHRoZSBhcnJvdyBidXR0b24gc2NhbGUgaXMgbm90IHByb3ZpZGVkLCB0aGUgYXJyb3cgYnV0dG9uIGhlaWdodCB3aWxsIG1hdGNoIHRoZSBudW1iZXIgZGlzcGxheSBoZWlnaHRcbiAgICBjb25zdCBhcnJvd0J1dHRvblNjYWxlUHJvdmlkZWQgPSBpbml0aWFsT3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgJiYgaW5pdGlhbE9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLmhhc093blByb3BlcnR5KCAnc2NhbGUnICk7XG5cbiAgICBjb25zdCBnZXRDdXJyZW50UmFuZ2UgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSA/IG9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkudmFsdWUgOiBudW1iZXJSYW5nZTtcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gY29uc3RyYWluIHRoZSBzbGlkZXIgdmFsdWUgdG8gdGhlIHByb3ZpZGVkIHJhbmdlIGFuZCB0aGUgc2FtZSBkZWx0YSBhc1xuICAgIC8vIHRoZSBhcnJvdyBidXR0b25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvMzg0LlxuICAgIGNvbnN0IGNvbnN0cmFpblZhbHVlID0gKCB2YWx1ZTogbnVtYmVyICkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5kZWx0YSAhPT0gdW5kZWZpbmVkICk7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIG9wdGlvbnMuZGVsdGEgKTtcbiAgICAgIHJldHVybiBnZXRDdXJyZW50UmFuZ2UoKS5jb25zdHJhaW5WYWx1ZSggbmV3VmFsdWUgKTtcbiAgICB9O1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcbiAgICAgIGluaXRpYWxPcHRpb25zLnNvdW5kR2VuZXJhdG9yID09PSBERUZBVUxUX1NPVU5EIHx8IF8uaXNFbXB0eSggaW5pdGlhbE9wdGlvbnMudmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMgKSxcbiAgICAgICdvcHRpb25zIHNob3VsZCBvbmx5IGJlIHN1cHBsaWVkIHdoZW4gdXNpbmcgZGVmYXVsdCBzb3VuZCBnZW5lcmF0b3InXG4gICAgKTtcblxuICAgIC8vIElmIG5vIHNvdW5kIGdlbmVyYXRvciB3YXMgcHJvdmlkZWQsIGNyZWF0ZSBvbmUgdXNpbmcgdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbi5cbiAgICBpZiAoIGluaXRpYWxPcHRpb25zLnNvdW5kR2VuZXJhdG9yID09PSBERUZBVUxUX1NPVU5EICkge1xuICAgICAgbGV0IHZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zID0gaW5pdGlhbE9wdGlvbnMudmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnM7XG4gICAgICBpZiAoIF8uaXNFbXB0eSggaW5pdGlhbE9wdGlvbnMudmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMgKSApIHtcblxuICAgICAgICAvLyBJZiBubyBvcHRpb25zIHdlcmUgcHJvdmlkZWQgZm9yIHRoZSBWYWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yLCB1c2UgYSBkZWZhdWx0IHdoZXJlIGEgc291bmQgd2lsbCBiZSBwcm9kdWNlZFxuICAgICAgICAvLyBmb3IgZXZlcnkgdmFsaWQgdmFsdWUgc2V0IGJ5IHRoaXMgY29udHJvbC5cbiAgICAgICAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMgPSB7XG4gICAgICAgICAgaW50ZXJUaHJlc2hvbGREZWx0YTogaW5pdGlhbE9wdGlvbnMuZGVsdGEsXG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IGNvbnN0cmFpblZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpbml0aWFsT3B0aW9ucy5zb3VuZEdlbmVyYXRvciA9IG5ldyBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyKFxuICAgICAgICBudW1iZXJSYW5nZSxcbiAgICAgICAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnNcbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBpbml0aWFsT3B0aW9ucy5zb3VuZEdlbmVyYXRvciA9PT0gbnVsbCApIHtcbiAgICAgIGluaXRpYWxPcHRpb25zLnNvdW5kR2VuZXJhdG9yID0gVmFsdWVDaGFuZ2VTb3VuZFBsYXllci5OT19TT1VORDtcbiAgICB9XG5cbiAgICAvLyBNZXJnZSBhbGwgbmVzdGVkIG9wdGlvbnMgaW4gb25lIGJsb2NrLlxuICAgIGNvbnN0IG9wdGlvbnM6IHR5cGVvZiBpbml0aWFsT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPHR5cGVvZiBpbml0aWFsT3B0aW9ucz4oIHtcblxuICAgICAgLy8gT3B0aW9ucyBwcm9wYWdhdGVkIHRvIEFycm93QnV0dG9uXG4gICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcblxuICAgICAgICAvLyBWYWx1ZXMgY2hvc2VuIHRvIG1hdGNoIHByZXZpb3VzIGJlaGF2aW9yLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNDg5LlxuICAgICAgICAvLyB0b3VjaEFyZWFYRGlsYXRpb24gaXMgMS8yIG9mIGl0cyBvcmlnaW5hbCB2YWx1ZSBiZWNhdXNlIHRvdWNoQXJlYSBpcyBzaGlmdGVkLlxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDMuNSxcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA3LFxuICAgICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDAsXG4gICAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogMCxcblxuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgd2l0aGluIHRoaXMgYW1vdW50IG9mIHRoZSByZXNwZWN0aXZlIG1pbi9tYXgsIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBpZiBpdCB3YXMgYXQgdGhhdCB2YWx1ZVxuICAgICAgICAvLyAoZm9yIGRldGVybWluaW5nIHdoZXRoZXIgdGhlIGFycm93IGJ1dHRvbiBpcyBlbmFibGVkKS5cbiAgICAgICAgZW5hYmxlZEVwc2lsb246IDAsXG5cbiAgICAgICAgLy8gY2FsbGJhY2tzXG4gICAgICAgIGxlZnRTdGFydDogaW5pdGlhbE9wdGlvbnMuc3RhcnRDYWxsYmFjaywgLy8gY2FsbGVkIHdoZW4gbGVmdCBhcnJvdyBpcyBwcmVzc2VkXG4gICAgICAgIGxlZnRFbmQ6IGluaXRpYWxPcHRpb25zLmVuZENhbGxiYWNrLCAvLyBjYWxsZWQgd2hlbiBsZWZ0IGFycm93IGlzIHJlbGVhc2VkXG4gICAgICAgIHJpZ2h0U3RhcnQ6IGluaXRpYWxPcHRpb25zLnN0YXJ0Q2FsbGJhY2ssIC8vIGNhbGxlZCB3aGVuIHJpZ2h0IGFycm93IGlzIHByZXNzZWRcbiAgICAgICAgcmlnaHRFbmQ6IGluaXRpYWxPcHRpb25zLmVuZENhbGxiYWNrLCAvLyBjYWxsZWQgd2hlbiByaWdodCBhcnJvdyBpcyByZWxlYXNlZFxuXG4gICAgICAgIC8vIHBoZXQtaW9cbiAgICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBPcHRpb25zIHByb3BhZ2F0ZWQgdG8gU2xpZGVyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XG4gICAgICAgIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLFxuICAgICAgICBzdGFydERyYWc6IGluaXRpYWxPcHRpb25zLnN0YXJ0Q2FsbGJhY2ssIC8vIGNhbGxlZCB3aGVuIGRyYWdnaW5nIHN0YXJ0cyBvbiB0aGUgc2xpZGVyXG4gICAgICAgIGVuZERyYWc6IGluaXRpYWxPcHRpb25zLmVuZENhbGxiYWNrLCAvLyBjYWxsZWQgd2hlbiBkcmFnZ2luZyBlbmRzIG9uIHRoZSBzbGlkZXJcblxuICAgICAgICAvLyBXaXRoIHRoZSBleGNlcHRpb24gb2Ygc3RhcnREcmFnIGFuZCBlbmREcmFnICh1c2Ugc3RhcnRDYWxsYmFjayBhbmQgZW5kQ2FsbGJhY2sgcmVzcGVjdGl2ZWx5KSxcbiAgICAgICAgLy8gYWxsIEhTbGlkZXIgb3B0aW9ucyBtYXkgYmUgdXNlZC4gVGhlc2UgYXJlIHRoZSBvbmVzIHRoYXQgTnVtYmVyQ29udHJvbCBvdmVycmlkZXM6XG4gICAgICAgIG1ham9yVGlja0xlbmd0aDogMjAsXG4gICAgICAgIG1pbm9yVGlja1N0cm9rZTogJ3JnYmEoIDAsIDAsIDAsIDAuMyApJyxcblxuICAgICAgICAvLyBvdGhlciBzbGlkZXIgb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byBOdW1iZXJDb250cm9sXG4gICAgICAgIG1ham9yVGlja3M6IFtdLFxuICAgICAgICBtaW5vclRpY2tTcGFjaW5nOiAwLCAvLyB6ZXJvIGluZGljYXRlcyBubyBtaW5vciB0aWNrc1xuXG4gICAgICAgIC8vIGNvbnN0cmFpbiB0aGUgc2xpZGVyIHZhbHVlIHRvIHRoZSBwcm92aWRlZCByYW5nZSBhbmQgdGhlIHNhbWUgZGVsdGEgYXMgdGhlIGFycm93IGJ1dHRvbnMsXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zODRcbiAgICAgICAgY29uc3RyYWluVmFsdWU6IGNvbnN0cmFpblZhbHVlLFxuXG4gICAgICAgIHNvdW5kR2VuZXJhdG9yOiBpbml0aWFsT3B0aW9ucy5zb3VuZEdlbmVyYXRvcixcblxuICAgICAgICAvLyBwaGV0LWlvXG4gICAgICAgIHRhbmRlbTogaW5pdGlhbE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggTnVtYmVyQ29udHJvbC5TTElERVJfVEFOREVNX05BTUUgKVxuICAgICAgfSxcblxuICAgICAgLy8gT3B0aW9ucyBwcm9wYWdhdGVkIHRvIE51bWJlckRpc3BsYXlcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XG4gICAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxuICAgICAgICAgIHN0cmluZ1Byb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gcGhldC1pb1xuICAgICAgICB0YW5kZW06IGluaXRpYWxPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJEaXNwbGF5JyApLFxuICAgICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiB0cnVlIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIE9wdGlvbnMgcHJvcGFnYXRlZCB0byB0aGUgdGl0bGUgVGV4dCBOb2RlXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcbiAgICAgICAgbWF4V2lkdGg6IG51bGwsIC8vIHtudWxsfG51bWJlcn0gbWF4V2lkdGggdG8gdXNlIGZvciB0aXRsZSwgdG8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuXG4gICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgIHRhbmRlbTogaW5pdGlhbE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxuICAgICAgfVxuICAgIH0sIGluaXRpYWxPcHRpb25zICk7XG5cbiAgICAvLyB2YWxpZGF0ZSBvcHRpb25zXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISggb3B0aW9ucyBhcyBJbnRlbnRpb25hbEFueSApLnN0YXJ0RHJhZywgJ3VzZSBvcHRpb25zLnN0YXJ0Q2FsbGJhY2sgaW5zdGVhZCBvZiBvcHRpb25zLnN0YXJ0RHJhZycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhKCBvcHRpb25zIGFzIEludGVudGlvbmFsQW55ICkuZW5kRHJhZywgJ3VzZSBvcHRpb25zLmVuZENhbGxiYWNrIGluc3RlYWQgb2Ygb3B0aW9ucy5lbmREcmFnJyApO1xuXG4gICAgaWYgKCBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5ICkge1xuICAgICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5ID0gb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eTtcbiAgICB9XG5cbiAgICAvLyBwZG9tIC0gZm9yIGFsdGVybmF0aXZlIGlucHV0LCB0aGUgbnVtYmVyIGNvbnRyb2wgaXMgYWNjZXNzZWQgZW50aXJlbHkgdGhyb3VnaCBzbGlkZXIgaW50ZXJhY3Rpb24gYW5kIHRoZXNlXG4gICAgLy8gYXJyb3cgYnV0dG9ucyBhcmUgbm90IHRhYiBuYXZpZ2FibGVcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy50YWdOYW1lID09PSB1bmRlZmluZWQsXG4gICAgICAnTnVtYmVyQ29udHJvbFxcJ3MgYWNjZXNzaWJsZSBjb250ZW50IHVzZXMgQWNjZXNzaWJsZVNsaWRlciwgZG8gbm90IHNldCBhY2Nlc3NpYmxlIGNvbnRlbnQgb24gdGhlIGJ1dHRvbnMuJyApO1xuICAgIG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLnRhZ05hbWUgPSBudWxsO1xuXG4gICAgLy8gcGRvbSAtIGlmIHdlIGluY2x1ZGUgYXJyb3cgYnV0dG9ucywgdXNlIGEgZ3JvdXBGb2N1c0hpZ2hsaWdodCB0byBzdXJyb3VuZCB0aGUgTnVtYmVyQ29udHJvbCB0byBtYWtlIGl0IGNsZWFyXG4gICAgLy8gdGhhdCBpdCBpcyBhIGNvbXBvc2l0ZSBjb21wb25lbnQgYW5kIHRoZXJlIGlzIG9ubHkgb25lIHN0b3AgaW4gdGhlIHRyYXZlcnNhbCBvcmRlci5cbiAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHQgPSBvcHRpb25zLmluY2x1ZGVBcnJvd0J1dHRvbnM7XG5cbiAgICBjb25zdCB0aXRsZU5vZGUgPSBuZXcgVGV4dCggdGl0bGUsIG9wdGlvbnMudGl0bGVOb2RlT3B0aW9ucyApO1xuXG4gICAgY29uc3QgbnVtYmVyRGlzcGxheSA9IG5ldyBOdW1iZXJEaXNwbGF5KCBudW1iZXJQcm9wZXJ0eSwgbnVtYmVyUmFuZ2UsIG9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMgKTtcblxuICAgIC8vIFNsaWRlciBvcHRpb25zIGZvciB0cmFjayAoaWYgbm90IHNwZWNpZmllZCBhcyB0cmFja05vZGUpXG4gICAgaWYgKCAhb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRyYWNrTm9kZSApIHtcbiAgICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xuICAgICAgICB0cmFja1NpemU6ICggb3B0aW9ucy5zbGlkZXJPcHRpb25zLm9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICkgPyBERUZBVUxUX0hTTElERVJfVFJBQ0tfU0laRSA6IERFRkFVTFRfSFNMSURFUl9UUkFDS19TSVpFLnN3YXBwZWQoKVxuICAgICAgfSwgb3B0aW9ucy5zbGlkZXJPcHRpb25zICk7XG4gICAgfVxuXG4gICAgLy8gU2xpZGVyIG9wdGlvbnMgZm9yIHRodW1iIChpZiBuIG90IHNwZWNpZmllZCBhcyB0aHVtYk5vZGUpXG4gICAgaWYgKCAhb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRodW1iTm9kZSApIHtcbiAgICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xuICAgICAgICB0aHVtYlNpemU6ICggb3B0aW9ucy5zbGlkZXJPcHRpb25zLm9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICkgPyBERUZBVUxUX0hTTElERVJfVEhVTUJfU0laRSA6IERFRkFVTFRfSFNMSURFUl9USFVNQl9TSVpFLnN3YXBwZWQoKSxcbiAgICAgICAgdGh1bWJUb3VjaEFyZWFYRGlsYXRpb246IDZcbiAgICAgIH0sIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyApO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnNsaWRlck9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdwaGV0aW9UeXBlJyApLCAnTnVtYmVyQ29udHJvbCBzZXRzIHBoZXRpb1R5cGUnICk7XG5cbiAgICAvLyBzbGlkZXIgb3B0aW9ucyBzZXQgYnkgTnVtYmVyQ29udHJvbCwgbm90ZSB0aGlzIG1heSBub3QgYmUgdGhlIGxvbmcgdGVybSBwYXR0ZXJuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW5mby9pc3N1ZXMvOTZcbiAgICBvcHRpb25zLnNsaWRlck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTbGlkZXJPcHRpb25zPigge1xuXG4gICAgICAvLyBwZG9tIC0gYnkgZGVmYXVsdCwgc2hpZnRLZXlib2FyZFN0ZXAgc2hvdWxkIG1vc3QgbGlrZWx5IGJlIHRoZSBzYW1lIGFzIGNsaWNraW5nIHRoZSBhcnJvdyBidXR0b25zLlxuICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IG9wdGlvbnMuZGVsdGEsXG5cbiAgICAgIC8vIHBkb20gLSBUaGUgZGVmYXVsdCBhcmlhLXZhbHVldGV4dCBmb3IgdGhlIHNsaWRlciBzaG91bGQgcmVhZCB0aGUgdmFsdWUgb2YgdGhlIE51bWJlckRpc3BsYXkuXG4gICAgICBwZG9tQ3JlYXRlQXJpYVZhbHVlVGV4dDogKCkgPT4gbnVtYmVyRGlzcGxheS52YWx1ZVN0cmluZ1Byb3BlcnR5LnZhbHVlLFxuXG4gICAgICAvLyBNYWtlIHN1cmUgU2xpZGVyIGdldHMgY3JlYXRlZCB3aXRoIHRoZSByaWdodCBJT1R5cGVcbiAgICAgIHBoZXRpb1R5cGU6IFNsaWRlci5TbGlkZXJJT1xuICAgIH0sIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyApO1xuXG4gICAgLy8gaGlnaGxpZ2h0IGNvbG9yIGZvciB0aHVtYiBkZWZhdWx0cyB0byBhIGJyaWdodGVyIHZlcnNpb24gb2YgdGhlIHRodW1iIGNvbG9yXG4gICAgaWYgKCBvcHRpb25zLnNsaWRlck9wdGlvbnMudGh1bWJGaWxsICYmICFvcHRpb25zLnNsaWRlck9wdGlvbnMudGh1bWJGaWxsSGlnaGxpZ2h0ZWQgKSB7XG5cbiAgICAgIHRoaXMudGh1bWJGaWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLnNsaWRlck9wdGlvbnMudGh1bWJGaWxsICk7XG5cbiAgICAgIC8vIFJlZmVyZW5jZSB0byB0aGUgRGVyaXZlZFByb3BlcnR5IG5vdCBuZWVkZWQsIHNpbmNlIHdlIGRpc3Bvc2Ugd2hhdCBpdCBsaXN0ZW5zIHRvIGFib3ZlLlxuICAgICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zLnRodW1iRmlsbEhpZ2hsaWdodGVkID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnRodW1iRmlsbFByb3BlcnR5IF0sIGNvbG9yID0+IGNvbG9yLmJyaWdodGVyQ29sb3IoKSApO1xuICAgIH1cblxuICAgIHRoaXMuc2xpZGVyID0gbmV3IFNsaWRlciggbnVtYmVyUHJvcGVydHksIG51bWJlclJhbmdlLCBvcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcblxuICAgIC8vIHBkb20gLSBmb3J3YXJkIHRoZSBhY2Nlc3NpYmxlTmFtZSBhbmQgaGVscCB0ZXh0IHNldCBvbiB0aGlzIGNvbXBvbmVudCB0byB0aGUgc2xpZGVyXG4gICAgUGFyYWxsZWxET00uZm9yd2FyZEFjY2Vzc2libGVOYW1lKCB0aGlzLCB0aGlzLnNsaWRlciApO1xuICAgIFBhcmFsbGVsRE9NLmZvcndhcmRIZWxwVGV4dCggdGhpcywgdGhpcy5zbGlkZXIgKTtcblxuICAgIC8vIHNldCBiZWxvdywgc2VlIG9wdGlvbnMuaW5jbHVkZUFycm93QnV0dG9uc1xuICAgIGxldCBkZWNyZW1lbnRCdXR0b246IEFycm93QnV0dG9uIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IGluY3JlbWVudEJ1dHRvbjogQXJyb3dCdXR0b24gfCBudWxsID0gbnVsbDtcbiAgICBsZXQgYXJyb3dFbmFibGVkTGlzdGVuZXI6ICggKCkgPT4gdm9pZCApIHwgbnVsbCA9IG51bGw7XG5cbiAgICBpZiAoIG9wdGlvbnMuaW5jbHVkZUFycm93QnV0dG9ucyApIHtcblxuICAgICAgY29uc3QgdG91Y2hBcmVhWERpbGF0aW9uID0gb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uITtcbiAgICAgIGNvbnN0IG1vdXNlQXJlYVhEaWxhdGlvbiA9IG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLm1vdXNlQXJlYVhEaWxhdGlvbiE7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0b3VjaEFyZWFYRGlsYXRpb24gIT09IHVuZGVmaW5lZCAmJiBtb3VzZUFyZWFYRGlsYXRpb24gIT09IHVuZGVmaW5lZCxcbiAgICAgICAgJ1Nob3VsZCBiZSBkZWZpbmVkLCBzaW5jZSB3ZSBoYXZlIGRlZmF1bHRzIGFib3ZlJyApO1xuXG4gICAgICBkZWNyZW1lbnRCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdsZWZ0JywgKCkgPT4ge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG51bWJlclByb3BlcnR5LmdldCgpO1xuICAgICAgICBsZXQgbmV3VmFsdWUgPSBudW1iZXJQcm9wZXJ0eS5nZXQoKSAtIG9wdGlvbnMuZGVsdGE7XG4gICAgICAgIG5ld1ZhbHVlID0gVXRpbHMucm91bmRUb0ludGVydmFsKCBuZXdWYWx1ZSwgb3B0aW9ucy5kZWx0YSApOyAvLyBjb25zdHJhaW4gdG8gbXVsdGlwbGVzIG9mIGRlbHRhLCBzZWUgIzM4NFxuICAgICAgICBuZXdWYWx1ZSA9IE1hdGgubWF4KCBuZXdWYWx1ZSwgZ2V0Q3VycmVudFJhbmdlKCkubWluICk7IC8vIGNvbnN0cmFpbiB0byByYW5nZVxuICAgICAgICBudW1iZXJQcm9wZXJ0eS5zZXQoIG5ld1ZhbHVlICk7XG4gICAgICAgIG9wdGlvbnMuc291bmRHZW5lcmF0b3IhLnBsYXlTb3VuZEZvclZhbHVlQ2hhbmdlKCBuZXdWYWx1ZSwgb2xkVmFsdWUgKTtcbiAgICAgICAgdGhpcy5zbGlkZXIudm9pY2luZ09uRW5kUmVzcG9uc2UoIG9sZFZhbHVlICk7XG4gICAgICB9LCBjb21iaW5lT3B0aW9uczxBcnJvd0J1dHRvbk9wdGlvbnM+KCB7XG4gICAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsXG4gICAgICAgIHN0YXJ0Q2FsbGJhY2s6IG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLmxlZnRTdGFydCxcbiAgICAgICAgZW5kQ2FsbGJhY2s6IG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zLmxlZnRFbmQsXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVjcmVtZW50QnV0dG9uJyApLFxuICAgICAgICB0b3VjaEFyZWFYU2hpZnQ6IC10b3VjaEFyZWFYRGlsYXRpb24sXG4gICAgICAgIG1vdXNlQXJlYVhTaGlmdDogLW1vdXNlQXJlYVhEaWxhdGlvblxuICAgICAgfSwgb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgICBpbmNyZW1lbnRCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdyaWdodCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBudW1iZXJQcm9wZXJ0eS5nZXQoKTtcbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gbnVtYmVyUHJvcGVydHkuZ2V0KCkgKyBvcHRpb25zLmRlbHRhO1xuICAgICAgICBuZXdWYWx1ZSA9IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggbmV3VmFsdWUsIG9wdGlvbnMuZGVsdGEgKTsgLy8gY29uc3RyYWluIHRvIG11bHRpcGxlcyBvZiBkZWx0YSwgc2VlICMzODRcbiAgICAgICAgbmV3VmFsdWUgPSBNYXRoLm1pbiggbmV3VmFsdWUsIGdldEN1cnJlbnRSYW5nZSgpLm1heCApOyAvLyBjb25zdHJhaW4gdG8gcmFuZ2VcbiAgICAgICAgbnVtYmVyUHJvcGVydHkuc2V0KCBuZXdWYWx1ZSApO1xuICAgICAgICBvcHRpb25zLnNvdW5kR2VuZXJhdG9yIS5wbGF5U291bmRGb3JWYWx1ZUNoYW5nZSggbmV3VmFsdWUsIG9sZFZhbHVlICk7XG4gICAgICAgIHRoaXMuc2xpZGVyLnZvaWNpbmdPbkVuZFJlc3BvbnNlKCBvbGRWYWx1ZSApO1xuICAgICAgfSwgY29tYmluZU9wdGlvbnM8QXJyb3dCdXR0b25PcHRpb25zPigge1xuICAgICAgICBzb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyLFxuICAgICAgICBzdGFydENhbGxiYWNrOiBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5yaWdodFN0YXJ0LFxuICAgICAgICBlbmRDYWxsYmFjazogb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMucmlnaHRFbmQsXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5jcmVtZW50QnV0dG9uJyApLFxuICAgICAgICB0b3VjaEFyZWFYU2hpZnQ6IHRvdWNoQXJlYVhEaWxhdGlvbixcbiAgICAgICAgbW91c2VBcmVhWFNoaWZ0OiBtb3VzZUFyZWFYRGlsYXRpb25cbiAgICAgIH0sIG9wdGlvbnMuYXJyb3dCdXR0b25PcHRpb25zICkgKTtcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgc2NhbGUgdGhlIEFycm93QnV0dG9ucyB0byBoYXZlIHRoZSBzYW1lIGhlaWdodCBhcyB0aGUgTnVtYmVyRGlzcGxheSwgYnV0IGlnbm9yaW5nXG4gICAgICAvLyB0aGUgTnVtYmVyRGlzcGxheSdzIG1heFdpZHRoIChpZiBhbnkpXG4gICAgICBpZiAoICFhcnJvd0J1dHRvblNjYWxlUHJvdmlkZWQgKSB7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBjdXJyZW50IGJ1dHRvbiBzY2FsaW5nIHNvIHdlIGNhbiBkZXRlcm1pbmUgdGhlIGRlc2lyZWQgZmluYWwgc2NhbGUgZmFjdG9yXG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5zZXRTY2FsZU1hZ25pdHVkZSggMSApO1xuXG4gICAgICAgIC8vIFNldCB0aGUgdHdlYWtlciBidXR0b24gaGVpZ2h0IHRvIG1hdGNoIHRoZSBoZWlnaHQgb2YgdGhlIG51bWJlckRpc3BsYXkuIExlbmd0aHkgdGV4dCBjYW4gc2hyaW5rIGEgbnVtYmVyRGlzcGxheVxuICAgICAgICAvLyB3aXRoIG1heFdpZHRoLS1pZiB3ZSBtYXRjaCB0aGUgc2NhbGVkIGhlaWdodCBvZiB0aGUgbnVtYmVyRGlzcGxheSB0aGUgYXJyb3cgYnV0dG9ucyB3b3VsZCBzaHJpbmsgdG9vLCBhc1xuICAgICAgICAvLyBkZXBpY3RlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy81MTMjaXNzdWVjb21tZW50LTUxNzg5Nzg1MFxuICAgICAgICAvLyBJbnN0ZWFkLCB0byBrZWVwIHRoZSB0d2Vha2VyIGJ1dHRvbnMgYSB1bmlmb3JtIGFuZCByZWFzb25hYmxlIHNpemUsIHdlIG1hdGNoIHRoZWlyIGhlaWdodCB0byB0aGUgdW5zY2FsZWRcbiAgICAgICAgLy8gaGVpZ2h0IG9mIHRoZSBudW1iZXJEaXNwbGF5IChpZ25vcmVzIG1heFdpZHRoIGFuZCBzY2FsZSkuXG4gICAgICAgIGNvbnN0IG51bWJlckRpc3BsYXlIZWlnaHQgPSBudW1iZXJEaXNwbGF5LmxvY2FsQm91bmRzLmhlaWdodDtcbiAgICAgICAgY29uc3QgYXJyb3dCdXR0b25zU2NhbGUgPSBudW1iZXJEaXNwbGF5SGVpZ2h0IC8gZGVjcmVtZW50QnV0dG9uLmhlaWdodDtcblxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uc2V0U2NhbGVNYWduaXR1ZGUoIGFycm93QnV0dG9uc1NjYWxlICk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5zZXRTY2FsZU1hZ25pdHVkZSggYXJyb3dCdXR0b25zU2NhbGUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRGlzYWJsZSB0aGUgYXJyb3cgYnV0dG9ucyBpZiB0aGUgc2xpZGVyIGN1cnJlbnRseSBoYXMgZm9jdXNcbiAgICAgIGFycm93RW5hYmxlZExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IG51bWJlclByb3BlcnR5LnZhbHVlO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5lbmFibGVkRXBzaWxvbiAhPT0gdW5kZWZpbmVkICk7XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbiEuZW5hYmxlZCA9ICggdmFsdWUgLSBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5lbmFibGVkRXBzaWxvbiEgPiBnZXRDdXJyZW50UmFuZ2UoKS5taW4gJiYgIXRoaXMuc2xpZGVyLmlzRm9jdXNlZCgpICk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbiEuZW5hYmxlZCA9ICggdmFsdWUgKyBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucy5lbmFibGVkRXBzaWxvbiEgPCBnZXRDdXJyZW50UmFuZ2UoKS5tYXggJiYgIXRoaXMuc2xpZGVyLmlzRm9jdXNlZCgpICk7XG4gICAgICB9O1xuICAgICAgbnVtYmVyUHJvcGVydHkubGF6eUxpbmsoIGFycm93RW5hYmxlZExpc3RlbmVyICk7XG4gICAgICBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5ICYmIG9wdGlvbnMuZW5hYmxlZFJhbmdlUHJvcGVydHkubGF6eUxpbmsoIGFycm93RW5hYmxlZExpc3RlbmVyICk7XG4gICAgICBhcnJvd0VuYWJsZWRMaXN0ZW5lcigpO1xuXG4gICAgICB0aGlzLnNsaWRlci5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICAgIGZvY3VzOiAoKSA9PiB7XG4gICAgICAgICAgZGVjcmVtZW50QnV0dG9uIS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgaW5jcmVtZW50QnV0dG9uIS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGJsdXI6ICgpID0+IGFycm93RW5hYmxlZExpc3RlbmVyISgpIC8vIHJlY29tcHV0ZSBpZiB0aGUgYXJyb3cgYnV0dG9ucyBzaG91bGQgYmUgZW5hYmxlZFxuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIG1ham9yIHRpY2tzIGZvciB0aGUgc2xpZGVyXG4gICAgY29uc3QgbWFqb3JUaWNrcyA9IG9wdGlvbnMuc2xpZGVyT3B0aW9ucy5tYWpvclRpY2tzITtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYWpvclRpY2tzICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWFqb3JUaWNrcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuc2xpZGVyLmFkZE1ham9yVGljayggbWFqb3JUaWNrc1sgaSBdLnZhbHVlLCBtYWpvclRpY2tzWyBpIF0ubGFiZWwgKTtcbiAgICB9XG5cbiAgICAvLyBtaW5vciB0aWNrcywgZXhjbHVkZSB2YWx1ZXMgd2hlcmUgd2UgYWxyZWFkeSBoYXZlIG1ham9yIHRpY2tzXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zbGlkZXJPcHRpb25zLm1pbm9yVGlja1NwYWNpbmcgIT09IHVuZGVmaW5lZCApO1xuICAgIGlmICggb3B0aW9ucy5zbGlkZXJPcHRpb25zLm1pbm9yVGlja1NwYWNpbmchID4gMCApIHtcbiAgICAgIGZvciAoIGxldCBtaW5vclRpY2tWYWx1ZSA9IG51bWJlclJhbmdlLm1pbjsgbWlub3JUaWNrVmFsdWUgPD0gbnVtYmVyUmFuZ2UubWF4OyApIHtcbiAgICAgICAgaWYgKCAhXy5maW5kKCBtYWpvclRpY2tzLCBtYWpvclRpY2sgPT4gbWFqb3JUaWNrLnZhbHVlID09PSBtaW5vclRpY2tWYWx1ZSApICkge1xuICAgICAgICAgIHRoaXMuc2xpZGVyLmFkZE1pbm9yVGljayggbWlub3JUaWNrVmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgICBtaW5vclRpY2tWYWx1ZSArPSBvcHRpb25zLnNsaWRlck9wdGlvbnMubWlub3JUaWNrU3BhY2luZyE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGQgPSBvcHRpb25zLmxheW91dEZ1bmN0aW9uKCB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXksIHRoaXMuc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApO1xuXG4gICAgLy8gU2V0IHVwIGRlZmF1bHQgc2l6YWJpbGl0eVxuICAgIHRoaXMud2lkdGhTaXphYmxlID0gaXNXaWR0aFNpemFibGUoIGNoaWxkICk7XG5cbiAgICAvLyBGb3J3YXJkIG1pbmltdW0vcHJlZmVycmVkIHdpZHRoIFByb3BlcnRpZXMgdG8gdGhlIGNoaWxkLCBzbyBlYWNoIGxheW91dCBpcyByZXNwb25zaWJsZSBmb3IgaXRzIGR5bmFtaWMgbGF5b3V0XG4gICAgaWYgKCBleHRlbmRzV2lkdGhTaXphYmxlKCBjaGlsZCApICkge1xuICAgICAgY29uc3QgbWluaW11bUxpc3RlbmVyID0gKCBtaW5pbXVtV2lkdGg6IG51bWJlciB8IG51bGwgKSA9PiB7XG4gICAgICAgIHRoaXMubG9jYWxNaW5pbXVtV2lkdGggPSBtaW5pbXVtV2lkdGg7XG4gICAgICB9O1xuICAgICAgY2hpbGQubWluaW11bVdpZHRoUHJvcGVydHkubGluayggbWluaW11bUxpc3RlbmVyICk7XG5cbiAgICAgIGNvbnN0IHByZWZlcnJlZExpc3RlbmVyID0gKCBsb2NhbFByZWZlcnJlZFdpZHRoOiBudW1iZXIgfCBudWxsICkgPT4ge1xuICAgICAgICBjaGlsZC5wcmVmZXJyZWRXaWR0aCA9IGxvY2FsUHJlZmVycmVkV2lkdGg7XG4gICAgICB9O1xuICAgICAgdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkubGluayggcHJlZmVycmVkTGlzdGVuZXIgKTtcblxuICAgICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgICBjaGlsZC5taW5pbXVtV2lkdGhQcm9wZXJ0eS51bmxpbmsoIG1pbmltdW1MaXN0ZW5lciApO1xuICAgICAgICB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS51bmxpbmsoIHByZWZlcnJlZExpc3RlbmVyICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgY2hpbGQgXTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLm51bWJlckRpc3BsYXkgPSBudW1iZXJEaXNwbGF5O1xuXG4gICAgdGhpcy5kaXNwb3NlTnVtYmVyQ29udHJvbCA9ICgpID0+IHtcbiAgICAgIHRpdGxlTm9kZS5kaXNwb3NlKCk7IC8vIG1heSBiZSBsaW5rZWQgdG8gYSBzdHJpbmcgUHJvcGVydHlcbiAgICAgIG51bWJlckRpc3BsYXkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5zbGlkZXIuZGlzcG9zZSgpO1xuXG4gICAgICB0aGlzLnRodW1iRmlsbFByb3BlcnR5ICYmIHRoaXMudGh1bWJGaWxsUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgICAvLyBvbmx5IGRlZmluZWQgaWYgb3B0aW9ucy5pbmNsdWRlQXJyb3dCdXR0b25zXG4gICAgICBkZWNyZW1lbnRCdXR0b24gJiYgZGVjcmVtZW50QnV0dG9uLmRpc3Bvc2UoKTtcbiAgICAgIGluY3JlbWVudEJ1dHRvbiAmJiBpbmNyZW1lbnRCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgYXJyb3dFbmFibGVkTGlzdGVuZXIgJiYgbnVtYmVyUHJvcGVydHkudW5saW5rKCBhcnJvd0VuYWJsZWRMaXN0ZW5lciApO1xuICAgICAgYXJyb3dFbmFibGVkTGlzdGVuZXIgJiYgb3B0aW9ucy5lbmFibGVkUmFuZ2VQcm9wZXJ0eSAmJiBvcHRpb25zLmVuYWJsZWRSYW5nZVByb3BlcnR5LnVubGluayggYXJyb3dFbmFibGVkTGlzdGVuZXIgKTtcbiAgICB9O1xuXG4gICAgLy8gRGVjb3JhdGluZyB3aXRoIGFkZGl0aW9uYWwgY29udGVudCBpcyBhbiBhbnRpLXBhdHRlcm4sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84NjBcbiAgICBhc3NlcnQgJiYgYXNzZXJ0Tm9BZGRpdGlvbmFsQ2hpbGRyZW4oIHRoaXMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnTnVtYmVyQ29udHJvbCcsIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZU51bWJlckNvbnRyb2woKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIE51bWJlckNvbnRyb2wgd2l0aCBkZWZhdWx0IHRpY2sgbWFya3MgZm9yIG1pbiBhbmQgbWF4IHZhbHVlcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgd2l0aE1pbk1heFRpY2tzKCBsYWJlbDogc3RyaW5nLCBwcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPiwgcmFuZ2U6IFJhbmdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogV2l0aE1pbk1heE9wdGlvbnMgKTogTnVtYmVyQ29udHJvbCB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFdpdGhNaW5NYXhPcHRpb25zLCBXaXRoTWluTWF4U2VsZk9wdGlvbnMsIE51bWJlckNvbnRyb2xPcHRpb25zPigpKCB7XG4gICAgICB0aWNrTGFiZWxGb250OiBuZXcgUGhldEZvbnQoIDEyIClcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIG9wdGlvbnMuc2xpZGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xTbGlkZXJPcHRpb25zPigge1xuICAgICAgbWFqb3JUaWNrczogW1xuICAgICAgICB7IHZhbHVlOiByYW5nZS5taW4sIGxhYmVsOiBuZXcgVGV4dCggcmFuZ2UubWluLCB7IGZvbnQ6IG9wdGlvbnMudGlja0xhYmVsRm9udCB9ICkgfSxcbiAgICAgICAgeyB2YWx1ZTogcmFuZ2UubWF4LCBsYWJlbDogbmV3IFRleHQoIHJhbmdlLm1heCwgeyBmb250OiBvcHRpb25zLnRpY2tMYWJlbEZvbnQgfSApIH1cbiAgICAgIF1cbiAgICB9LCBvcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcblxuICAgIHJldHVybiBuZXcgTnVtYmVyQ29udHJvbCggbGFiZWwsIHByb3BlcnR5LCByYW5nZSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgb25lIG9mIHRoZSBwcmUtZGVmaW5lZCBsYXlvdXQgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIG9wdGlvbnMubGF5b3V0RnVuY3Rpb24uXG4gICAqIEFycmFuZ2VzIHN1YmNvbXBvbmVudHMgbGlrZSB0aGlzOlxuICAgKlxuICAgKiAgdGl0bGUgbnVtYmVyXG4gICAqICA8IC0tLS0tLXwtLS0tLS0gPlxuICAgKlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYXlvdXRGdW5jdGlvbjEoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjFPcHRpb25zICk6IExheW91dEZ1bmN0aW9uIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TnVtYmVyQ29udHJvbExheW91dEZ1bmN0aW9uMU9wdGlvbnM+KCkoIHtcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRpdGxlWFNwYWNpbmc6IDUsXG4gICAgICBhcnJvd0J1dHRvbnNYU3BhY2luZzogMTUsXG4gICAgICB5U3BhY2luZzogNVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgcmV0dXJuICggdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBzbGlkZXIsIGRlY3JlbWVudEJ1dHRvbiwgaW5jcmVtZW50QnV0dG9uICkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGVjcmVtZW50QnV0dG9uLCAnVGhlcmUgaXMgbm8gZGVjcmVtZW50QnV0dG9uIScgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGluY3JlbWVudEJ1dHRvbiwgJ1RoZXJlIGlzIG5vIGluY3JlbWVudEJ1dHRvbiEnICk7XG5cbiAgICAgIHNsaWRlci5tdXRhdGVMYXlvdXRPcHRpb25zKCB7XG4gICAgICAgIGdyb3c6IDFcbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduLFxuICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBIQm94KCB7XG4gICAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnRpdGxlWFNwYWNpbmcsXG4gICAgICAgICAgICBjaGlsZHJlbjogWyB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXkgXVxuICAgICAgICAgIH0gKSxcbiAgICAgICAgICBuZXcgSEJveCgge1xuICAgICAgICAgICAgbGF5b3V0T3B0aW9uczoge1xuICAgICAgICAgICAgICBzdHJldGNoOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3BhY2luZzogb3B0aW9ucy5hcnJvd0J1dHRvbnNYU3BhY2luZyxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbIGRlY3JlbWVudEJ1dHRvbiEsIHNsaWRlciwgaW5jcmVtZW50QnV0dG9uISBdXG4gICAgICAgICAgfSApXG4gICAgICAgIF1cbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgb25lIG9mIHRoZSBwcmUtZGVmaW5lZCBsYXlvdXQgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIG9wdGlvbnMubGF5b3V0RnVuY3Rpb24uXG4gICAqIEFycmFuZ2VzIHN1YmNvbXBvbmVudHMgbGlrZSB0aGlzOlxuICAgKlxuICAgKiAgdGl0bGUgPCBudW1iZXIgPlxuICAgKiAgLS0tLS0tfC0tLS0tLVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYXlvdXRGdW5jdGlvbjIoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjJPcHRpb25zICk6IExheW91dEZ1bmN0aW9uIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TnVtYmVyQ29udHJvbExheW91dEZ1bmN0aW9uMk9wdGlvbnM+KCkoIHtcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHhTcGFjaW5nOiA1LFxuICAgICAgeVNwYWNpbmc6IDVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHJldHVybiAoIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlY3JlbWVudEJ1dHRvbiApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5jcmVtZW50QnV0dG9uICk7XG5cbiAgICAgIHNsaWRlci5tdXRhdGVMYXlvdXRPcHRpb25zKCB7XG4gICAgICAgIHN0cmV0Y2g6IHRydWVcbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgICAgIGFsaWduOiBvcHRpb25zLmFsaWduLFxuICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBIQm94KCB7XG4gICAgICAgICAgICBzcGFjaW5nOiBvcHRpb25zLnhTcGFjaW5nLFxuICAgICAgICAgICAgY2hpbGRyZW46IFsgdGl0bGVOb2RlLCBkZWNyZW1lbnRCdXR0b24hLCBudW1iZXJEaXNwbGF5LCBpbmNyZW1lbnRCdXR0b24hIF1cbiAgICAgICAgICB9ICksXG4gICAgICAgICAgc2xpZGVyXG4gICAgICAgIF1cbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgb25lIG9mIHRoZSBwcmUtZGVmaW5lZCBsYXlvdXQgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIHVzZWQgZm9yIG9wdGlvbnMubGF5b3V0RnVuY3Rpb24uXG4gICAqIEFycmFuZ2VzIHN1YmNvbXBvbmVudHMgbGlrZSB0aGlzOlxuICAgKlxuICAgKiAgdGl0bGVcbiAgICogIDwgbnVtYmVyID5cbiAgICogIC0tLS0tLS18LS0tLS0tLVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVMYXlvdXRGdW5jdGlvbjMoIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjNPcHRpb25zICk6IExheW91dEZ1bmN0aW9uIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TnVtYmVyQ29udHJvbExheW91dEZ1bmN0aW9uM09wdGlvbnM+KCkoIHtcbiAgICAgIGFsaWduVGl0bGU6ICdjZW50ZXInLFxuICAgICAgYWxpZ25OdW1iZXI6ICdjZW50ZXInLFxuICAgICAgdGl0bGVMZWZ0SW5kZW50OiAwLFxuICAgICAgeFNwYWNpbmc6IDUsXG4gICAgICB5U3BhY2luZzogNVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgcmV0dXJuICggdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBzbGlkZXIsIGRlY3JlbWVudEJ1dHRvbiwgaW5jcmVtZW50QnV0dG9uICkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGVjcmVtZW50QnV0dG9uICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmNyZW1lbnRCdXR0b24gKTtcblxuICAgICAgc2xpZGVyLm11dGF0ZUxheW91dE9wdGlvbnMoIHtcbiAgICAgICAgc3RyZXRjaDogdHJ1ZVxuICAgICAgfSApO1xuXG4gICAgICBjb25zdCB0aXRsZUFuZENvbnRlbnRWQm94ID0gbmV3IFZCb3goIHtcbiAgICAgICAgc3BhY2luZzogb3B0aW9ucy55U3BhY2luZyxcbiAgICAgICAgYWxpZ246IG9wdGlvbnMuYWxpZ25UaXRsZSxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBuZXcgQWxpZ25Cb3goIHRpdGxlTm9kZSwgeyBsZWZ0TWFyZ2luOiBvcHRpb25zLnRpdGxlTGVmdEluZGVudCB9ICksXG4gICAgICAgICAgbmV3IFZCb3goIHtcbiAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgc3RyZXRjaDogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMueVNwYWNpbmcsXG4gICAgICAgICAgICBhbGlnbjogb3B0aW9ucy5hbGlnbk51bWJlcixcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgIG5ldyBIQm94KCB7XG4gICAgICAgICAgICAgICAgc3BhY2luZzogb3B0aW9ucy54U3BhY2luZyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogWyBkZWNyZW1lbnRCdXR0b24hLCBudW1iZXJEaXNwbGF5LCBpbmNyZW1lbnRCdXR0b24hIF1cbiAgICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgICBzbGlkZXJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9IClcbiAgICAgICAgXVxuICAgICAgfSApO1xuXG4gICAgICAvLyBXaGVuIHRoZSB0ZXh0IG9mIHRoZSB0aXRsZSBjaGFuZ2VzIHJlY29tcHV0ZSB0aGUgYWxpZ25tZW50IGJldHdlZW4gdGhlIHRpdGxlIGFuZCBjb250ZW50XG4gICAgICB0aXRsZU5vZGUuYm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICAgICAgdGl0bGVBbmRDb250ZW50VkJveC51cGRhdGVMYXlvdXQoKTtcbiAgICAgIH0gKTtcbiAgICAgIHJldHVybiB0aXRsZUFuZENvbnRlbnRWQm94O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBvbmUgb2YgdGhlIHByZS1kZWZpbmVkIGxheW91dCBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBmb3Igb3B0aW9ucy5sYXlvdXRGdW5jdGlvbi5cbiAgICogTGlrZSBjcmVhdGVMYXlvdXRGdW5jdGlvbjEsIGJ1dCB0aGUgdGl0bGUgYW5kIHZhbHVlIGdvIGFsbCB0aGUgd2F5IHRvIHRoZSBlZGdlcy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlTGF5b3V0RnVuY3Rpb240KCBwcm92aWRlZE9wdGlvbnM/OiBOdW1iZXJDb250cm9sTGF5b3V0RnVuY3Rpb240T3B0aW9ucyApOiBMYXlvdXRGdW5jdGlvbiB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE51bWJlckNvbnRyb2xMYXlvdXRGdW5jdGlvbjRPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIGFkZHMgYWRkaXRpb25hbCBob3Jpem9udGFsIHNwYWNlIGJldHdlZW4gdGl0bGUgYW5kIE51bWJlckRpc3BsYXlcbiAgICAgIHNsaWRlclBhZGRpbmc6IDAsXG5cbiAgICAgIC8vIHZlcnRpY2FsIHNwYWNpbmcgYmV0d2VlbiBzbGlkZXIgYW5kIHRpdGxlL051bWJlckRpc3BsYXlcbiAgICAgIHZlcnRpY2FsU3BhY2luZzogNSxcblxuICAgICAgLy8gc3BhY2luZyBiZXR3ZWVuIHNsaWRlciBhbmQgYXJyb3cgYnV0dG9uc1xuICAgICAgYXJyb3dCdXR0b25TcGFjaW5nOiA1LFxuXG4gICAgICBudW1iZXJEaXNwbGF5UGFyZW50Tm9kZU9wdGlvbnM6IHtcbiAgICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgbGF5b3V0SW52aXNpYmxlQnV0dG9uczogZmFsc2UsXG5cbiAgICAgIGNyZWF0ZUJvdHRvbUNvbnRlbnQ6IG51bGwgLy8gU3VwcG9ydHMgUGVuZHVsdW0gTGFiJ3MgcXVlc3Rpb25UZXh0IHdoZXJlIGEgcXVlc3Rpb24gaXMgc3Vic3RpdHV0ZWQgZm9yIHRoZSBzbGlkZXJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHJldHVybiAoIHRpdGxlTm9kZSwgbnVtYmVyRGlzcGxheSwgc2xpZGVyLCBkZWNyZW1lbnRCdXR0b24sIGluY3JlbWVudEJ1dHRvbiApID0+IHtcblxuICAgICAgc2xpZGVyLm11dGF0ZUxheW91dE9wdGlvbnMoIHtcbiAgICAgICAgZ3JvdzogMVxuICAgICAgfSApO1xuXG4gICAgICBjb25zdCBpbmNsdWRlQXJyb3dCdXR0b25zID0gISFkZWNyZW1lbnRCdXR0b247IC8vIGlmIHRoZXJlIGFyZW4ndCBhcnJvdyBidXR0b25zLCB0aGVuIGV4Y2x1ZGUgdGhlbVxuICAgICAgY29uc3QgYm90dG9tQm94ID0gbmV3IEhCb3goIHtcbiAgICAgICAgc3BhY2luZzogb3B0aW9ucy5hcnJvd0J1dHRvblNwYWNpbmcsXG4gICAgICAgIGNoaWxkcmVuOiAhaW5jbHVkZUFycm93QnV0dG9ucyA/IFsgc2xpZGVyIF0gOiBbXG4gICAgICAgICAgZGVjcmVtZW50QnV0dG9uLFxuICAgICAgICAgIHNsaWRlcixcbiAgICAgICAgICBpbmNyZW1lbnRCdXR0b24hXG4gICAgICAgIF0sXG4gICAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6ICFvcHRpb25zLmxheW91dEludmlzaWJsZUJ1dHRvbnNcbiAgICAgIH0gKTtcblxuICAgICAgY29uc3QgYm90dG9tQ29udGVudCA9IG9wdGlvbnMuY3JlYXRlQm90dG9tQ29udGVudCA/IG9wdGlvbnMuY3JlYXRlQm90dG9tQ29udGVudCggYm90dG9tQm94ICkgOiBib3R0b21Cb3g7XG5cbiAgICAgIGJvdHRvbUNvbnRlbnQubXV0YXRlTGF5b3V0T3B0aW9ucygge1xuICAgICAgICBzdHJldGNoOiB0cnVlLFxuICAgICAgICB4TWFyZ2luOiBvcHRpb25zLnNsaWRlclBhZGRpbmdcbiAgICAgIH0gKTtcblxuICAgICAgLy8gRHluYW1pYyBsYXlvdXQgc3VwcG9ydGVkXG4gICAgICByZXR1cm4gbmV3IFZCb3goIHtcbiAgICAgICAgc3BhY2luZzogb3B0aW9ucy52ZXJ0aWNhbFNwYWNpbmcsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuc2xpZGVyUGFkZGluZyxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgIHRpdGxlTm9kZSxcbiAgICAgICAgICAgICAgbmV3IE5vZGUoIGNvbWJpbmVPcHRpb25zPE5vZGVPcHRpb25zPigge1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbIG51bWJlckRpc3BsYXkgXVxuICAgICAgICAgICAgICB9LCBvcHRpb25zLm51bWJlckRpc3BsYXlQYXJlbnROb2RlT3B0aW9ucyApIClcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IHN0cmV0Y2g6IHRydWUgfVxuICAgICAgICAgIH0gKSxcbiAgICAgICAgICBib3R0b21Db250ZW50XG4gICAgICAgIF1cbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBOdW1iZXJDb250cm9sSU8gPSBuZXcgSU9UeXBlKCAnTnVtYmVyQ29udHJvbElPJywge1xuICAgIHZhbHVlVHlwZTogTnVtYmVyQ29udHJvbCxcbiAgICBkb2N1bWVudGF0aW9uOiAnQSBudW1iZXIgY29udHJvbCB3aXRoIGEgdGl0bGUsIHNsaWRlciBhbmQgKy8tIGJ1dHRvbnMnLFxuICAgIHN1cGVydHlwZTogTm9kZS5Ob2RlSU9cbiAgfSApO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNMSURFUl9UQU5ERU1fTkFNRSA9ICdzbGlkZXInIGFzIGNvbnN0O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIGFsbCBvZiB0aGUgY2FsbGJhY2sgcmVsYXRlZCBvcHRpb25zLiBUaGVyZSBhcmUgdHdvIHR5cGVzIG9mIGNhbGxiYWNrcy4gVGhlIFwic3RhcnQvZW5kQ2FsbGJhY2tcIiBwYWlyXG4gKiBhcmUgcGFzc2VkIGludG8gYWxsIGNvbXBvbmVudHMgaW4gdGhlIE51bWJlckNvbnRyb2wuIFRoZSBzZWNvbmQgc2V0IGFyZSBzdGFydC9lbmQgY2FsbGJhY2tzIGZvciBlYWNoIGluZGl2aWR1YWxcbiAqIGNvbXBvbmVudC4gVGhpcyB3YXMgYWRkZWQgdG8gc3VwcG9ydCBtdWx0aXRvdWNoIGluIFJ1dGhlcmZvcmQgU2NhdHRlcmluZyBhcyBwYXJ0IG9mXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcnV0aGVyZm9yZC1zY2F0dGVyaW5nL2lzc3Vlcy8xMjguXG4gKlxuICogVGhpcyBmdW5jdGlvbiBtdXRhdGVzIHRoZSBvcHRpb25zIGJ5IGluaXRpYWxpemluZyBnZW5lcmFsIGNhbGxiYWNrcyBmcm9tIG51bGwgKGluIHRoZSBleHRlbmQgY2FsbCkgdG8gYSBuby1vcFxuICogZnVuY3Rpb24uXG4gKlxuICogT25seSBnZW5lcmFsIG9yIHNwZWNpZmljIGNhbGxiYWNrcyBhcmUgYWxsb3dlZCwgYnV0IG5vdCBib3RoLlxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUNhbGxiYWNrcyggb3B0aW9uczogTnVtYmVyQ29udHJvbE9wdGlvbnMgKTogdm9pZCB7XG4gIGNvbnN0IG5vcm1hbENhbGxiYWNrc1ByZXNlbnQgPSAhISggb3B0aW9ucy5zdGFydENhbGxiYWNrIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lbmRDYWxsYmFjayApO1xuICBsZXQgYXJyb3dDYWxsYmFja3NQcmVzZW50ID0gZmFsc2U7XG4gIGxldCBzbGlkZXJDYWxsYmFja3NQcmVzZW50ID0gZmFsc2U7XG5cbiAgaWYgKCBvcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucyApIHtcbiAgICBhcnJvd0NhbGxiYWNrc1ByZXNlbnQgPSBzcGVjaWZpY0NhbGxiYWNrS2V5c0luT3B0aW9ucyggb3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgKTtcbiAgfVxuXG4gIGlmICggb3B0aW9ucy5zbGlkZXJPcHRpb25zICkge1xuICAgIHNsaWRlckNhbGxiYWNrc1ByZXNlbnQgPSBzcGVjaWZpY0NhbGxiYWNrS2V5c0luT3B0aW9ucyggb3B0aW9ucy5zbGlkZXJPcHRpb25zICk7XG4gIH1cblxuICBjb25zdCBzcGVjaWZpY0NhbGxiYWNrc1ByZXNlbnQgPSBhcnJvd0NhbGxiYWNrc1ByZXNlbnQgfHwgc2xpZGVyQ2FsbGJhY2tzUHJlc2VudDtcblxuICAvLyBvbmx5IGdlbmVyYWwgb3IgY29tcG9uZW50IHNwZWNpZmljIGNhbGxiYWNrcyBhcmUgc3VwcG9ydGVkXG4gIGFzc2VydCAmJiBhc3NlcnQoICEoIG5vcm1hbENhbGxiYWNrc1ByZXNlbnQgJiYgc3BlY2lmaWNDYWxsYmFja3NQcmVzZW50ICksXG4gICAgJ1VzZSBnZW5lcmFsIGNhbGxiYWNrcyBsaWtlIFwic3RhcnRDYWxsYmFja1wiIG9yIHNwZWNpZmljIGNhbGxiYWNrcyBsaWtlIFwic2xpZGVyT3B0aW9ucy5zdGFydERyYWdcIiBidXQgbm90IGJvdGguJyApO1xufVxuXG4vKipcbiAqIENoZWNrIGZvciBhbiBpbnRlcnNlY3Rpb24gYmV0d2VlbiB0aGUgYXJyYXkgb2YgY2FsbGJhY2sgb3B0aW9uIGtleXMgYW5kIHRob3NlXG4gKiBwYXNzZWQgaW4gdGhlIG9wdGlvbnMgb2JqZWN0LiBUaGVzZSBjYWxsYmFjayBvcHRpb25zIGFyZSBvbmx5IHRoZSBzcGVjaWZpYyBjb21wb25lbnQgY2FsbGJhY2tzLCBub3QgdGhlIGdlbmVyYWxcbiAqIHN0YXJ0L2VuZCB0aGF0IGFyZSBjYWxsZWQgZm9yIGV2ZXJ5IGNvbXBvbmVudCdzIGludGVyYWN0aW9uXG4gKi9cbmZ1bmN0aW9uIHNwZWNpZmljQ2FsbGJhY2tLZXlzSW5PcHRpb25zKCBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiApOiBib29sZWFuIHtcbiAgY29uc3Qgb3B0aW9uS2V5cyA9IE9iamVjdC5rZXlzKCBvcHRpb25zICk7XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IFNQRUNJRklDX0NPTVBPTkVOVF9DQUxMQkFDS19PUFRJT05TLmZpbHRlciggeCA9PiBfLmluY2x1ZGVzKCBvcHRpb25LZXlzLCB4ICkgKTtcbiAgcmV0dXJuIGludGVyc2VjdGlvbi5sZW5ndGggPiAwO1xufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ051bWJlckNvbnRyb2wnLCBOdW1iZXJDb250cm9sICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiT3JpZW50YXRpb24iLCJBbGlnbkJveCIsImFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuIiwiZXh0ZW5kc1dpZHRoU2l6YWJsZSIsIkhCb3giLCJpc1dpZHRoU2l6YWJsZSIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJQYXJhbGxlbERPTSIsIlRleHQiLCJWQm94IiwiV2lkdGhTaXphYmxlIiwiQXJyb3dCdXR0b24iLCJTbGlkZXIiLCJudWxsU291bmRQbGF5ZXIiLCJWYWx1ZUNoYW5nZVNvdW5kUGxheWVyIiwiVGFuZGVtIiwiSU9UeXBlIiwiTnVtYmVyRGlzcGxheSIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTUEVDSUZJQ19DT01QT05FTlRfQ0FMTEJBQ0tfT1BUSU9OUyIsIkRFRkFVTFRfU09VTkQiLCJERUZBVUxUX0hTTElERVJfVFJBQ0tfU0laRSIsIkRFRkFVTFRfSFNMSURFUl9USFVNQl9TSVpFIiwiTnVtYmVyQ29udHJvbCIsImRpc3Bvc2UiLCJkaXNwb3NlTnVtYmVyQ29udHJvbCIsIndpdGhNaW5NYXhUaWNrcyIsImxhYmVsIiwicHJvcGVydHkiLCJyYW5nZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0aWNrTGFiZWxGb250Iiwic2xpZGVyT3B0aW9ucyIsIm1ham9yVGlja3MiLCJ2YWx1ZSIsIm1pbiIsImZvbnQiLCJtYXgiLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjEiLCJhbGlnbiIsInRpdGxlWFNwYWNpbmciLCJhcnJvd0J1dHRvbnNYU3BhY2luZyIsInlTcGFjaW5nIiwidGl0bGVOb2RlIiwibnVtYmVyRGlzcGxheSIsInNsaWRlciIsImRlY3JlbWVudEJ1dHRvbiIsImluY3JlbWVudEJ1dHRvbiIsImFzc2VydCIsIm11dGF0ZUxheW91dE9wdGlvbnMiLCJncm93Iiwic3BhY2luZyIsImNoaWxkcmVuIiwibGF5b3V0T3B0aW9ucyIsInN0cmV0Y2giLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjIiLCJ4U3BhY2luZyIsImNyZWF0ZUxheW91dEZ1bmN0aW9uMyIsImFsaWduVGl0bGUiLCJhbGlnbk51bWJlciIsInRpdGxlTGVmdEluZGVudCIsInRpdGxlQW5kQ29udGVudFZCb3giLCJsZWZ0TWFyZ2luIiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsInVwZGF0ZUxheW91dCIsImNyZWF0ZUxheW91dEZ1bmN0aW9uNCIsInNsaWRlclBhZGRpbmciLCJ2ZXJ0aWNhbFNwYWNpbmciLCJhcnJvd0J1dHRvblNwYWNpbmciLCJudW1iZXJEaXNwbGF5UGFyZW50Tm9kZU9wdGlvbnMiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwibGF5b3V0SW52aXNpYmxlQnV0dG9ucyIsImNyZWF0ZUJvdHRvbUNvbnRlbnQiLCJpbmNsdWRlQXJyb3dCdXR0b25zIiwiYm90dG9tQm94IiwiYm90dG9tQ29udGVudCIsInhNYXJnaW4iLCJ0aXRsZSIsIm51bWJlclByb3BlcnR5IiwibnVtYmVyUmFuZ2UiLCJ3aW5kb3ciLCJ2YWxpZGF0ZUNhbGxiYWNrcyIsImluaXRpYWxPcHRpb25zIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJhcnJvd0J1dHRvbk9wdGlvbnMiLCJ0aXRsZU5vZGVPcHRpb25zIiwic3RhcnRDYWxsYmFjayIsIl8iLCJub29wIiwiZW5kQ2FsbGJhY2siLCJkZWx0YSIsImRpc2FibGVkT3BhY2l0eSIsImxheW91dEZ1bmN0aW9uIiwic291bmRHZW5lcmF0b3IiLCJ2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1R5cGUiLCJOdW1iZXJDb250cm9sSU8iLCJwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJncm91cEZvY3VzSGlnaGxpZ2h0IiwidW5kZWZpbmVkIiwiYXJyb3dCdXR0b25TY2FsZVByb3ZpZGVkIiwiaGFzT3duUHJvcGVydHkiLCJnZXRDdXJyZW50UmFuZ2UiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsImNvbnN0cmFpblZhbHVlIiwibmV3VmFsdWUiLCJyb3VuZFRvSW50ZXJ2YWwiLCJpc0VtcHR5IiwiaW50ZXJUaHJlc2hvbGREZWx0YSIsIk5PX1NPVU5EIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiZW5hYmxlZEVwc2lsb24iLCJsZWZ0U3RhcnQiLCJsZWZ0RW5kIiwicmlnaHRTdGFydCIsInJpZ2h0RW5kIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5Iiwib3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwic3RhcnREcmFnIiwiZW5kRHJhZyIsIm1ham9yVGlja0xlbmd0aCIsIm1pbm9yVGlja1N0cm9rZSIsIm1pbm9yVGlja1NwYWNpbmciLCJjcmVhdGVUYW5kZW0iLCJTTElERVJfVEFOREVNX05BTUUiLCJ0ZXh0T3B0aW9ucyIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsIm1heFdpZHRoIiwiZmlsbCIsInRhZ05hbWUiLCJ0cmFja05vZGUiLCJ0cmFja1NpemUiLCJzd2FwcGVkIiwidGh1bWJOb2RlIiwidGh1bWJTaXplIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJzaGlmdEtleWJvYXJkU3RlcCIsInBkb21DcmVhdGVBcmlhVmFsdWVUZXh0IiwidmFsdWVTdHJpbmdQcm9wZXJ0eSIsIlNsaWRlcklPIiwidGh1bWJGaWxsIiwidGh1bWJGaWxsSGlnaGxpZ2h0ZWQiLCJ0aHVtYkZpbGxQcm9wZXJ0eSIsImNvbG9yIiwiYnJpZ2h0ZXJDb2xvciIsImZvcndhcmRBY2Nlc3NpYmxlTmFtZSIsImZvcndhcmRIZWxwVGV4dCIsImFycm93RW5hYmxlZExpc3RlbmVyIiwib2xkVmFsdWUiLCJnZXQiLCJNYXRoIiwic2V0IiwicGxheVNvdW5kRm9yVmFsdWVDaGFuZ2UiLCJ2b2ljaW5nT25FbmRSZXNwb25zZSIsInNvdW5kUGxheWVyIiwidG91Y2hBcmVhWFNoaWZ0IiwibW91c2VBcmVhWFNoaWZ0Iiwic2V0U2NhbGVNYWduaXR1ZGUiLCJudW1iZXJEaXNwbGF5SGVpZ2h0IiwibG9jYWxCb3VuZHMiLCJoZWlnaHQiLCJhcnJvd0J1dHRvbnNTY2FsZSIsImVuYWJsZWQiLCJpc0ZvY3VzZWQiLCJhZGRJbnB1dExpc3RlbmVyIiwiZm9jdXMiLCJibHVyIiwiaSIsImxlbmd0aCIsImFkZE1ham9yVGljayIsIm1pbm9yVGlja1ZhbHVlIiwiZmluZCIsIm1ham9yVGljayIsImFkZE1pbm9yVGljayIsImNoaWxkIiwid2lkdGhTaXphYmxlIiwibWluaW11bUxpc3RlbmVyIiwibWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtV2lkdGgiLCJtaW5pbXVtV2lkdGhQcm9wZXJ0eSIsImxpbmsiLCJwcmVmZXJyZWRMaXN0ZW5lciIsImxvY2FsUHJlZmVycmVkV2lkdGgiLCJwcmVmZXJyZWRXaWR0aCIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ1bmxpbmsiLCJtdXRhdGUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdXBlcnR5cGUiLCJOb2RlSU8iLCJub3JtYWxDYWxsYmFja3NQcmVzZW50IiwiYXJyb3dDYWxsYmFja3NQcmVzZW50Iiwic2xpZGVyQ2FsbGJhY2tzUHJlc2VudCIsInNwZWNpZmljQ2FsbGJhY2tLZXlzSW5PcHRpb25zIiwic3BlY2lmaWNDYWxsYmFja3NQcmVzZW50Iiwib3B0aW9uS2V5cyIsIk9iamVjdCIsImtleXMiLCJpbnRlcnNlY3Rpb24iLCJmaWx0ZXIiLCJ4IiwiaW5jbHVkZXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUkvRCxPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLGtDQUFrQztBQUM1RSxPQUFPQyxpQkFBaUIsb0NBQW9DO0FBSTVELFNBQVNDLFFBQVEsRUFBRUMsMEJBQTBCLEVBQUVDLG1CQUFtQixFQUFRQyxJQUFJLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFlQyxrQkFBa0IsRUFBRUMsV0FBVyxFQUE0QkMsSUFBSSxFQUF1Q0MsSUFBSSxFQUFFQyxZQUFZLFFBQVEsOEJBQThCO0FBQ2pSLE9BQU9DLGlCQUF5QyxzQ0FBc0M7QUFFdEYsT0FBT0MsWUFBK0IseUJBQXlCO0FBQy9ELE9BQU9DLHFCQUFxQixvQ0FBb0M7QUFDaEUsT0FBT0MsNEJBQStELDREQUE0RDtBQUNsSSxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxPQUFPQyxtQkFBNkMscUJB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