// Copyright 2022-2024, University of Colorado Boulder
/**
 * NumberPicker is a UI component for picking a number value from a range.
 * This is actually a number spinner, but PhET refers to it as a 'picker', so that's what this class is named.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import StringUnionProperty from '../../axon/js/StringUnionProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Color, FireListener, HighlightPath, LinearGradient, Node, PaintColorProperty, Path, Rectangle, SceneryConstants, Text } from '../../scenery/js/imports.js';
import AccessibleNumberSpinner from '../../sun/js/accessibility/AccessibleNumberSpinner.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
const ButtonStateValues = [
    'up',
    'down',
    'over',
    'out'
];
let NumberPicker = class NumberPicker extends AccessibleNumberSpinner(Node, 0) {
    static createIcon(value, providedOptions) {
        const options = optionize()({
            // Highlight the increment button
            highlightIncrement: false,
            // Highlight the decrement button
            highlightDecrement: false,
            range: new Range(value - 1, value + 1),
            numberPickerOptions: {
                pickable: false,
                // phet-io
                tandem: Tandem.OPT_OUT // by default, icons don't need instrumentation
            }
        }, providedOptions);
        const numberPicker = new NumberPicker(new NumberProperty(value), new Property(options.range), options.numberPickerOptions);
        // we don't want this icon to have keyboard navigation, or description in the PDOM.
        numberPicker.removeFromPDOM();
        if (options.highlightDecrement) {
            numberPicker.decrementInputListener.isOverProperty.value = true;
        }
        if (options.highlightIncrement) {
            numberPicker.incrementInputListener.isOverProperty.value = true;
        }
        return numberPicker;
    }
    dispose() {
        this.disposeNumberPicker();
        super.dispose();
    }
    /**
   * Sets visibility of the arrows.
   */ setArrowsVisible(visible) {
        if (!visible) {
            this.incrementInputListener.interrupt();
            this.decrementInputListener.interrupt();
        }
        this.incrementArrow.visible = visible;
        this.decrementArrow.visible = visible;
    }
    /**
   * @param valueProperty
   * @param rangeProperty - If the range is anticipated to change, it's best to have the range Property contain the
   * (maximum) union of all potential changes, so that NumberPicker can iterate through all possible values and compute
   * the bounds of the labels.
   * @param [providedOptions]
   */ constructor(valueProperty, rangeProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            color: new Color(0, 0, 255),
            backgroundColor: 'white',
            cornerRadius: 6,
            xMargin: 3,
            yMargin: 3,
            decimalPlaces: 0,
            font: new PhetFont(24),
            incrementFunction: (value)=>value + 1,
            decrementFunction: (value)=>value - 1,
            timerDelay: 400,
            timerInterval: 100,
            noValueString: MathSymbols.NO_VALUE,
            align: 'center',
            touchAreaXDilation: 10,
            touchAreaYDilation: 10,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 5,
            backgroundStroke: 'gray',
            backgroundLineWidth: 0.5,
            backgroundDisabledOpacity: 1,
            arrowHeight: 6,
            arrowYSpacing: 3,
            arrowStroke: 'black',
            arrowLineWidth: 0.25,
            arrowDisabledOpacity: 1,
            valueMaxWidth: null,
            onInput: _.noop,
            incrementEnabledFunction: (value, range)=>value !== null && value !== undefined && value < range.max,
            decrementEnabledFunction: (value, range)=>value !== null && value !== undefined && value > range.min,
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            valueChangedSoundPlayer: sharedSoundPlayers.get('generalSoftClick'),
            boundarySoundPlayer: sharedSoundPlayers.get('generalBoundaryBoop'),
            // ParentOptions
            cursor: 'pointer',
            valueProperty: valueProperty,
            enabledRangeProperty: rangeProperty,
            pageKeyboardStep: 2,
            voicingObjectResponse: ()=>valueProperty.value,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Picker',
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true,
            phetioFeatured: true
        }, providedOptions);
        if (!options.formatValue) {
            options.formatValue = (value)=>Utils.toFixed(value, options.decimalPlaces);
        }
        // Color of arrows and top/bottom gradient when pressed
        let colorProperty = null;
        if (options.pressedColor === undefined) {
            colorProperty = new PaintColorProperty(options.color); // dispose required!
            // No reference needs to be kept, since we dispose its dependency.
            options.pressedColor = new DerivedProperty([
                colorProperty
            ], (color)=>color.darkerColor());
        }
        let previousValue = valueProperty.value;
        // Overwrite the passed-in onInput listener to make sure that sound implementation can't be blown away in the
        // defaults.
        const providedOnInputListener = options.onInput;
        options.onInput = ()=>{
            providedOnInputListener();
            // The onInput listener may be called when no change to the value has actually happened, see
            // https://github.com/phetsims/sun/issues/760.  We do some checks here to make sure the sound is only generated
            // when a change occurs.
            if (valueProperty.value !== previousValue) {
                // Play the boundary sound If the value is at min or max, otherwise play the default sound.
                if (valueProperty.value === rangeProperty.get().max || valueProperty.value === rangeProperty.get().min) {
                    options.boundarySoundPlayer.play();
                } else {
                    options.valueChangedSoundPlayer.play();
                }
            }
            previousValue = valueProperty.value;
        };
        assert && assert(!options.keyboardStep, 'NumberPicker sets its own keyboardStep');
        assert && assert(!options.shiftKeyboardStep, 'NumberPicker sets its own shiftKeyboardStep');
        // AccessibleNumberSpinner options that depend on other options.
        // Initialize accessibility features. This must reach into incrementFunction to get the delta.
        // Both normal arrow and shift arrow keys use the delta computed with incrementFunction.
        const keyboardStep = options.incrementFunction(valueProperty.get()) - valueProperty.get();
        options.keyboardStep = keyboardStep;
        options.shiftKeyboardStep = keyboardStep;
        options.pdomTimerDelay = options.timerDelay;
        options.pdomTimerInterval = options.timerInterval;
        const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
        super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));
        //------------------------------------------------------------
        // Properties
        const incrementButtonStateProperty = new StringUnionProperty('up', {
            validValues: ButtonStateValues
        });
        const decrementButtonStateProperty = new StringUnionProperty('down', {
            validValues: ButtonStateValues
        });
        // must be disposed
        const incrementEnabledProperty = new DerivedProperty([
            valueProperty,
            rangeProperty
        ], options.incrementEnabledFunction);
        // must be disposed
        const decrementEnabledProperty = new DerivedProperty([
            valueProperty,
            rangeProperty
        ], options.decrementEnabledFunction);
        //------------------------------------------------------------
        // Nodes
        // displays the value
        const valueNode = new Text('', {
            font: options.font,
            pickable: false
        });
        // compute max width of text based on the width of all possible values.
        // See https://github.com/phetsims/area-model-common/issues/5
        let currentSampleValue = rangeProperty.get().min;
        const sampleValues = [];
        while(currentSampleValue <= rangeProperty.get().max){
            sampleValues.push(currentSampleValue);
            currentSampleValue = options.incrementFunction(currentSampleValue);
            assert && assert(sampleValues.length < 500000, 'Don\'t infinite loop here');
        }
        let maxWidth = Math.max.apply(null, sampleValues.map((value)=>{
            valueNode.string = options.formatValue(value);
            return valueNode.width;
        }));
        // Cap the maxWidth if valueMaxWidth is provided, see https://github.com/phetsims/scenery-phet/issues/297
        if (options.valueMaxWidth !== null) {
            maxWidth = Math.min(maxWidth, options.valueMaxWidth);
        }
        // compute shape of the background behind the numeric value
        const backgroundWidth = maxWidth + 2 * options.xMargin;
        const backgroundHeight = valueNode.height + 2 * options.yMargin;
        const backgroundOverlap = 1;
        const backgroundCornerRadius = options.cornerRadius;
        // Apply the max-width AFTER computing the backgroundHeight, so it doesn't shrink vertically
        valueNode.maxWidth = maxWidth;
        // Top half of the background. Pressing here will increment the value.
        // Shape computed starting at upper-left, going clockwise.
        const incrementBackgroundNode = new Path(new Shape().arc(backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, Math.PI, Math.PI * 3 / 2, false).arc(backgroundWidth - backgroundCornerRadius, backgroundCornerRadius, backgroundCornerRadius, -Math.PI / 2, 0, false).lineTo(backgroundWidth, backgroundHeight / 2 + backgroundOverlap).lineTo(0, backgroundHeight / 2 + backgroundOverlap).close(), {
            pickable: false
        });
        // Bottom half of the background. Pressing here will decrement the value.
        // Shape computed starting at bottom-right, going clockwise.
        const decrementBackgroundNode = new Path(new Shape().arc(backgroundWidth - backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, 0, Math.PI / 2, false).arc(backgroundCornerRadius, backgroundHeight - backgroundCornerRadius, backgroundCornerRadius, Math.PI / 2, Math.PI, false).lineTo(0, backgroundHeight / 2).lineTo(backgroundWidth, backgroundHeight / 2).close(), {
            pickable: false
        });
        // separate rectangle for stroke around value background
        const strokedBackground = new Rectangle(0, 0, backgroundWidth, backgroundHeight, backgroundCornerRadius, backgroundCornerRadius, {
            pickable: false,
            stroke: options.backgroundStroke,
            lineWidth: options.backgroundLineWidth,
            disabledOpacity: options.backgroundDisabledOpacity,
            enabledProperty: this.enabledProperty
        });
        // compute size of arrows
        const arrowButtonSize = new Dimension2(0.5 * backgroundWidth, options.arrowHeight);
        const arrowOptions = {
            stroke: options.arrowStroke,
            lineWidth: options.arrowLineWidth,
            disabledOpacity: options.arrowDisabledOpacity,
            enabledProperty: this.enabledProperty,
            pickable: false
        };
        // increment arrow, pointing up, described clockwise from tip
        this.incrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, 0).lineTo(arrowButtonSize.width, arrowButtonSize.height).lineTo(0, arrowButtonSize.height).close(), arrowOptions);
        this.incrementArrow.centerX = incrementBackgroundNode.centerX;
        this.incrementArrow.bottom = incrementBackgroundNode.top - options.arrowYSpacing;
        // decrement arrow, pointing down, described clockwise from the tip
        this.decrementArrow = new Path(new Shape().moveTo(arrowButtonSize.width / 2, arrowButtonSize.height).lineTo(0, 0).lineTo(arrowButtonSize.width, 0).close(), arrowOptions);
        this.decrementArrow.centerX = decrementBackgroundNode.centerX;
        this.decrementArrow.top = decrementBackgroundNode.bottom + options.arrowYSpacing;
        // parents for increment and decrement components
        const incrementParent = new Node({
            children: [
                incrementBackgroundNode,
                this.incrementArrow
            ]
        });
        incrementParent.addChild(new Rectangle(incrementParent.localBounds)); // invisible overlay
        const decrementParent = new Node({
            children: [
                decrementBackgroundNode,
                this.decrementArrow
            ]
        });
        decrementParent.addChild(new Rectangle(decrementParent.localBounds)); // invisible overlay
        // rendering order
        this.addChild(incrementParent);
        this.addChild(decrementParent);
        this.addChild(strokedBackground);
        this.addChild(valueNode);
        //------------------------------------------------------------
        // Pointer areas
        // touch areas
        incrementParent.touchArea = Shape.rectangle(incrementParent.left - options.touchAreaXDilation / 2, incrementParent.top - options.touchAreaYDilation, incrementParent.width + options.touchAreaXDilation, incrementParent.height + options.touchAreaYDilation);
        decrementParent.touchArea = Shape.rectangle(decrementParent.left - options.touchAreaXDilation / 2, decrementParent.top, decrementParent.width + options.touchAreaXDilation, decrementParent.height + options.touchAreaYDilation);
        // mouse areas
        incrementParent.mouseArea = Shape.rectangle(incrementParent.left - options.mouseAreaXDilation / 2, incrementParent.top - options.mouseAreaYDilation, incrementParent.width + options.mouseAreaXDilation, incrementParent.height + options.mouseAreaYDilation);
        decrementParent.mouseArea = Shape.rectangle(decrementParent.left - options.mouseAreaXDilation / 2, decrementParent.top, decrementParent.width + options.mouseAreaXDilation, decrementParent.height + options.mouseAreaYDilation);
        //------------------------------------------------------------
        // Colors
        // arrow colors, corresponding to ButtonState and incrementEnabledProperty/decrementEnabledProperty
        const arrowColors = {
            up: options.color,
            over: options.color,
            down: options.pressedColor,
            out: options.color,
            disabled: 'rgb(176,176,176)'
        };
        // background colors, corresponding to ButtonState and enabledProperty.value
        const highlightGradient = createVerticalGradient(options.color, options.backgroundColor, options.color, backgroundHeight);
        const pressedGradient = createVerticalGradient(options.pressedColor, options.backgroundColor, options.pressedColor, backgroundHeight);
        const backgroundColors = {
            up: options.backgroundColor,
            over: highlightGradient,
            down: pressedGradient,
            out: pressedGradient,
            disabled: options.backgroundColor
        };
        //------------------------------------------------------------
        // Observers and InputListeners
        const inputListenerOptions = {
            fireOnHold: true,
            fireOnHoldDelay: options.timerDelay,
            fireOnHoldInterval: options.timerInterval
        };
        this.incrementInputListener = new NumberPickerInputListener(incrementButtonStateProperty, combineOptions({
            tandem: options.tandem.createTandem('incrementInputListener'),
            fire: (event)=>{
                const oldValue = valueProperty.value;
                valueProperty.set(Math.min(options.incrementFunction(valueProperty.get()), rangeProperty.get().max));
                options.onInput(event, oldValue);
                // voicing - speak the object/context responses on value change from user input
                this.voicingSpeakFullResponse({
                    nameResponse: null,
                    hintResponse: null
                });
            }
        }, inputListenerOptions));
        incrementParent.addInputListener(this.incrementInputListener);
        this.decrementInputListener = new NumberPickerInputListener(decrementButtonStateProperty, combineOptions({
            tandem: options.tandem.createTandem('decrementInputListener'),
            fire: (event)=>{
                const oldValue = valueProperty.value;
                valueProperty.set(Math.max(options.decrementFunction(valueProperty.get()), rangeProperty.get().min));
                options.onInput(event, oldValue);
                // voicing - speak the object/context responses on value change from user input
                this.voicingSpeakFullResponse({
                    nameResponse: null,
                    hintResponse: null
                });
            }
        }, inputListenerOptions));
        decrementParent.addInputListener(this.decrementInputListener);
        // enable/disable listeners and interaction: unlink unnecessary, Properties are owned by this instance
        incrementEnabledProperty.link((enabled)=>{
            !enabled && this.incrementInputListener.interrupt();
            incrementParent.pickable = enabled;
        });
        decrementEnabledProperty.link((enabled)=>{
            !enabled && this.decrementInputListener.interrupt();
            decrementParent.pickable = enabled;
        });
        // Update text to match the value
        const valueObserver = (value)=>{
            if (value === null || value === undefined) {
                valueNode.string = options.noValueString;
                valueNode.x = (backgroundWidth - valueNode.width) / 2; // horizontally centered
            } else {
                valueNode.string = options.formatValue(value);
                if (options.align === 'center') {
                    valueNode.centerX = incrementBackgroundNode.centerX;
                } else if (options.align === 'right') {
                    valueNode.right = incrementBackgroundNode.right - options.xMargin;
                } else if (options.align === 'left') {
                    valueNode.left = incrementBackgroundNode.left + options.xMargin;
                } else {
                    throw new Error(`unsupported value for options.align: ${options.align}`);
                }
            }
            valueNode.centerY = backgroundHeight / 2;
        };
        valueProperty.link(valueObserver); // must be unlinked in dispose
        // Update colors for increment components.  No dispose is needed since dependencies are locally owned.
        Multilink.multilink([
            incrementButtonStateProperty,
            incrementEnabledProperty
        ], (state, enabled)=>{
            updateColors(state, enabled, incrementBackgroundNode, this.incrementArrow, backgroundColors, arrowColors);
        });
        // Update colors for decrement components.  No dispose is needed since dependencies are locally owned.
        Multilink.multilink([
            decrementButtonStateProperty,
            decrementEnabledProperty
        ], (state, enabled)=>{
            updateColors(state, enabled, decrementBackgroundNode, this.decrementArrow, backgroundColors, arrowColors);
        });
        // pdom - custom focus highlight that matches rounded background behind the numeric value
        const focusBounds = this.localBounds.dilated(HighlightPath.getDefaultDilationCoefficient());
        this.focusHighlight = new HighlightPath(Shape.roundedRectangleWithRadii(focusBounds.minX, focusBounds.minY, focusBounds.width, focusBounds.height, {
            topLeft: options.cornerRadius,
            topRight: options.cornerRadius,
            bottomLeft: options.cornerRadius,
            bottomRight: options.cornerRadius
        }));
        // update style with keyboard input, Emitters owned by this instance and disposed in AccessibleNumberSpinner
        this.pdomIncrementDownEmitter.addListener((isDown)=>{
            incrementButtonStateProperty.value = isDown ? 'down' : 'up';
        });
        this.pdomDecrementDownEmitter.addListener((isDown)=>{
            decrementButtonStateProperty.value = isDown ? 'down' : 'up';
        });
        this.addLinkedElement(valueProperty, {
            tandemName: 'valueProperty'
        });
        // Mutate options that require bounds after we have children
        this.mutate(boundsRequiredOptionKeys);
        this.disposeNumberPicker = ()=>{
            colorProperty && colorProperty.dispose();
            incrementEnabledProperty.dispose();
            decrementEnabledProperty.dispose();
            this.incrementArrow.dispose();
            this.decrementArrow.dispose();
            strokedBackground.dispose();
            if (valueProperty.hasListener(valueObserver)) {
                valueProperty.unlink(valueObserver);
            }
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'NumberPicker', this);
    }
};
export { NumberPicker as default };
/**
 * Converts FireListener events to state changes.
 */ let NumberPickerInputListener = class NumberPickerInputListener extends FireListener {
    constructor(buttonStateProperty, options){
        super(options);
        // Update the button state.  No dispose is needed because the parent class disposes the dependencies.
        Multilink.multilink([
            this.isOverProperty,
            this.isPressedProperty
        ], (isOver, isPressed)=>{
            buttonStateProperty.set(isOver && !isPressed ? 'over' : isOver && isPressed ? 'down' : !isOver && !isPressed ? 'up' : 'out');
        });
    }
};
/**
 * Creates a vertical gradient.
 */ function createVerticalGradient(topColor, centerColor, bottomColor, height) {
    return new LinearGradient(0, 0, 0, height).addColorStop(0, topColor).addColorStop(0.5, centerColor).addColorStop(1, bottomColor);
}
/**
 * Updates arrow and background colors
 */ function updateColors(buttonState, enabled, backgroundNode, arrowNode, backgroundColors, arrowColors) {
    if (enabled) {
        arrowNode.stroke = 'black';
        if (buttonState === 'up') {
            backgroundNode.fill = backgroundColors.up;
            arrowNode.fill = arrowColors.up;
        } else if (buttonState === 'over') {
            backgroundNode.fill = backgroundColors.over;
            arrowNode.fill = arrowColors.over;
        } else if (buttonState === 'down') {
            backgroundNode.fill = backgroundColors.down;
            arrowNode.fill = arrowColors.down;
        } else if (buttonState === 'out') {
            backgroundNode.fill = backgroundColors.out;
            arrowNode.fill = arrowColors.out;
        } else {
            throw new Error(`unsupported buttonState: ${buttonState}`);
        }
    } else {
        backgroundNode.fill = backgroundColors.disabled;
        arrowNode.fill = arrowColors.disabled;
        arrowNode.stroke = arrowColors.disabled; // stroke so that arrow size will look the same when it's enabled/disabled
    }
}
sun.register('NumberPicker', NumberPicker);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJQaWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTnVtYmVyUGlja2VyIGlzIGEgVUkgY29tcG9uZW50IGZvciBwaWNraW5nIGEgbnVtYmVyIHZhbHVlIGZyb20gYSByYW5nZS5cbiAqIFRoaXMgaXMgYWN0dWFsbHkgYSBudW1iZXIgc3Bpbm5lciwgYnV0IFBoRVQgcmVmZXJzIHRvIGl0IGFzIGEgJ3BpY2tlcicsIHNvIHRoYXQncyB3aGF0IHRoaXMgY2xhc3MgaXMgbmFtZWQuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFN0cmluZ1VuaW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9TdHJpbmdVbmlvblByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBDb2xvciwgRmlyZUxpc3RlbmVyLCBGaXJlTGlzdGVuZXJPcHRpb25zLCBGb250LCBIaWdobGlnaHRQYXRoLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50Q29sb3JQcm9wZXJ0eSwgUGF0aCwgUmVjdGFuZ2xlLCBTY2VuZXJ5Q29uc3RhbnRzLCBTY2VuZXJ5RXZlbnQsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQWNjZXNzaWJsZU51bWJlclNwaW5uZXIsIHsgQWNjZXNzaWJsZU51bWJlclNwaW5uZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2FjY2Vzc2liaWxpdHkvQWNjZXNzaWJsZU51bWJlclNwaW5uZXIuanMnO1xuaW1wb3J0IHNoYXJlZFNvdW5kUGxheWVycyBmcm9tICcuLi8uLi90YW1iby9qcy9zaGFyZWRTb3VuZFBsYXllcnMuanMnO1xuaW1wb3J0IFRTb3VuZFBsYXllciBmcm9tICcuLi8uLi90YW1iby9qcy9UU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxuY29uc3QgQnV0dG9uU3RhdGVWYWx1ZXMgPSBbICd1cCcsICdkb3duJywgJ292ZXInLCAnb3V0JyBdIGFzIGNvbnN0O1xudHlwZSBCdXR0b25TdGF0ZSA9ICggdHlwZW9mIEJ1dHRvblN0YXRlVmFsdWVzIClbbnVtYmVyXTtcblxudHlwZSBBbGlnbiA9ICdjZW50ZXInIHwgJ2xlZnQnIHwgJ3JpZ2h0JztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgY29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIGFycm93cyBhbmQgdG9wL2JvdHRvbSBncmFkaWVudCBvbiBwb2ludGVyIG92ZXJcbiAgcHJlc3NlZENvbG9yPzogVENvbG9yOyAvLyBjb2xvciBvZiBhcnJvd3MgYW5kIHRvcC9ib3R0b20gZ3JhZGllbnQgd2hlbiBwcmVzc2VkLCBkZXJpdmVkIGlmIG5vdCBwcm92aWRlZFxuICBiYWNrZ3JvdW5kQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIHRoZSBiYWNrZ3JvdW5kIHdoZW4gcG9pbnRlciBpcyBub3Qgb3ZlciBpdFxuICBjb3JuZXJSYWRpdXM/OiBudW1iZXI7XG4gIHhNYXJnaW4/OiBudW1iZXI7XG4gIHlNYXJnaW4/OiBudW1iZXI7XG4gIGRlY2ltYWxQbGFjZXM/OiBudW1iZXI7XG4gIGZvbnQ/OiBGb250O1xuICBpbmNyZW1lbnRGdW5jdGlvbj86ICggdmFsdWU6IG51bWJlciApID0+IG51bWJlcjtcbiAgZGVjcmVtZW50RnVuY3Rpb24/OiAoIHZhbHVlOiBudW1iZXIgKSA9PiBudW1iZXI7XG4gIHRpbWVyRGVsYXk/OiBudW1iZXI7IC8vIHN0YXJ0IHRvIGZpcmUgY29udGludW91c2x5IGFmdGVyIHByZXNzaW5nIGZvciB0aGlzIGxvbmcgKG1pbGxpc2Vjb25kcylcbiAgdGltZXJJbnRlcnZhbD86IG51bWJlcjsgLy8gZmlyZSBjb250aW51b3VzbHkgYXQgdGhpcyBmcmVxdWVuY3kgKG1pbGxpc2Vjb25kcyksXG4gIG5vVmFsdWVTdHJpbmc/OiBzdHJpbmc7IC8vIHN0cmluZyB0byBkaXNwbGF5IGlmIHZhbHVlUHJvcGVydHkuZ2V0IGlzIG51bGwgb3IgdW5kZWZpbmVkXG4gIGFsaWduPzogQWxpZ247IC8vIGhvcml6b250YWwgYWxpZ25tZW50IG9mIHRoZSB2YWx1ZVxuICB0b3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIHRvdWNoQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcbiAgbW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICBtb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIGJhY2tncm91bmRTdHJva2U/OiBUQ29sb3I7XG4gIGJhY2tncm91bmRMaW5lV2lkdGg/OiBudW1iZXI7XG4gIGJhY2tncm91bmREaXNhYmxlZE9wYWNpdHk/OiBudW1iZXI7XG4gIGFycm93SGVpZ2h0PzogbnVtYmVyO1xuICBhcnJvd1lTcGFjaW5nPzogbnVtYmVyO1xuICBhcnJvd1N0cm9rZT86IFRDb2xvcjtcbiAgYXJyb3dMaW5lV2lkdGg/OiBudW1iZXI7XG4gIGFycm93RGlzYWJsZWRPcGFjaXR5PzogbnVtYmVyO1xuICB2YWx1ZU1heFdpZHRoPzogbnVtYmVyIHwgbnVsbDsgLy8gSWYgbm9uLW51bGwsIGl0IHdpbGwgY2FwIHRoZSB2YWx1ZSdzIG1heFdpZHRoIHRvIHRoaXMgdmFsdWVcblxuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgaW4gYSBUZXh0IG5vZGUuIE5PVEU6IElmIHRoaXMgZnVuY3Rpb24gY2FuIGdpdmUgZGlmZmVyZW50IHN0cmluZ3NcbiAgICogdG8gdGhlIHNhbWUgdmFsdWUgZGVwZW5kaW5nIG9uIGV4dGVybmFsIHN0YXRlLCBpdCBpcyByZWNvbW1lbmRlZCB0byByZWJ1aWxkIHRoZSBOdW1iZXJQaWNrZXIgd2hlbiB0aGF0IHN0YXRlXG4gICAqIGNoYW5nZXMgKGFzIGl0IHVzZXMgZm9ybWF0VmFsdWUgb3ZlciB0aGUgaW5pdGlhbCByYW5nZSB0byBkZXRlcm1pbmUgdGhlIGJvdW5kcyB0aGF0IGxhYmVscyBjYW4gdGFrZSkuXG4gICAqL1xuICBmb3JtYXRWYWx1ZT86ICggdmFsdWU6IG51bWJlciApID0+IHN0cmluZztcblxuICAvLyBMaXN0ZW5lciB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBOdW1iZXJQaWNrZXIgaGFzIGlucHV0IG9uIGl0IGR1ZSB0byB1c2VyIGludGVyYWN0aW9uLlxuICBvbklucHV0PzogKCkgPT4gdm9pZDtcblxuICAvLyBEZXRlcm1pbmVzIHdoZW4gdGhlIGluY3JlbWVudCBhcnJvdyBpcyBlbmFibGVkLlxuICBpbmNyZW1lbnRFbmFibGVkRnVuY3Rpb24/OiAoIHZhbHVlOiBudW1iZXIsIHJhbmdlOiBSYW5nZSApID0+IGJvb2xlYW47XG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGVuIHRoZSBkZWNyZW1lbnQgYXJyb3cgaXMgZW5hYmxlZC5cbiAgZGVjcmVtZW50RW5hYmxlZEZ1bmN0aW9uPzogKCB2YWx1ZTogbnVtYmVyLCByYW5nZTogUmFuZ2UgKSA9PiBib29sZWFuO1xuXG4gIC8vIE9wYWNpdHkgdXNlZCB0byBpbmRpY2F0ZSBkaXNhYmxlZCwgWzAsMV0gZXhjbHVzaXZlXG4gIGRpc2FibGVkT3BhY2l0eT86IG51bWJlcjtcblxuICAvLyBTb3VuZCBnZW5lcmF0b3JzIGZvciB3aGVuIHRoZSBOdW1iZXJQaWNrZXIncyB2YWx1ZSBjaGFuZ2VzLCBhbmQgd2hlbiBpdCBoaXRzIHJhbmdlIGV4dHJlbWl0aWVzLlxuICAvLyBVc2UgbnVsbFNvdW5kUGxheWVyIHRvIGRpc2FibGUuXG4gIHZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuICBib3VuZGFyeVNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xufTtcblxudHlwZSBQYXJlbnRPcHRpb25zID0gQWNjZXNzaWJsZU51bWJlclNwaW5uZXJPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIE51bWJlclBpY2tlck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UGFyZW50T3B0aW9ucywgJ3ZhbHVlUHJvcGVydHknIHwgJ2VuYWJsZWRSYW5nZVByb3BlcnR5JyB8ICdwZG9tVGltZXJEZWxheScgfCAncGRvbVRpbWVySW50ZXJ2YWwnPjtcblxuLy8gb3B0aW9ucyB0byBOdW1iZXJQaWNrZXIuY3JlYXRlSWNvblxudHlwZSBDcmVhdGVJY29uT3B0aW9ucyA9IHtcbiAgaGlnaGxpZ2h0SW5jcmVtZW50PzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBoaWdobGlnaHQgdGhlIGluY3JlbWVudCBidXR0b25cbiAgaGlnaGxpZ2h0RGVjcmVtZW50PzogZmFsc2U7IC8vIHdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBkZWNyZW1lbnQgYnV0dG9uXG4gIHJhbmdlPzogUmFuZ2U7IC8vIHJhbmdlIHNob3duIG9uIHRoZSBpY29uXG4gIG51bWJlclBpY2tlck9wdGlvbnM/OiBOdW1iZXJQaWNrZXJPcHRpb25zO1xufTtcblxudHlwZSBBcnJvd0NvbG9ycyA9IHtcbiAgdXA6IFRDb2xvcjtcbiAgb3ZlcjogVENvbG9yO1xuICBkb3duOiBUQ29sb3I7XG4gIG91dDogVENvbG9yO1xuICBkaXNhYmxlZDogVENvbG9yO1xufTtcblxudHlwZSBCYWNrZ3JvdW5kQ29sb3JzID0ge1xuICB1cDogVENvbG9yO1xuICBvdmVyOiBMaW5lYXJHcmFkaWVudDtcbiAgZG93bjogTGluZWFyR3JhZGllbnQ7XG4gIG91dDogTGluZWFyR3JhZGllbnQ7XG4gIGRpc2FibGVkOiBUQ29sb3I7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOdW1iZXJQaWNrZXIgZXh0ZW5kcyBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lciggTm9kZSwgMCApIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGluY3JlbWVudEFycm93OiBQYXRoO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlY3JlbWVudEFycm93OiBQYXRoO1xuICBwcml2YXRlIHJlYWRvbmx5IGluY3JlbWVudElucHV0TGlzdGVuZXI6IE51bWJlclBpY2tlcklucHV0TGlzdGVuZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGVjcmVtZW50SW5wdXRMaXN0ZW5lcjogTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lcjtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTnVtYmVyUGlja2VyOiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gcmFuZ2VQcm9wZXJ0eSAtIElmIHRoZSByYW5nZSBpcyBhbnRpY2lwYXRlZCB0byBjaGFuZ2UsIGl0J3MgYmVzdCB0byBoYXZlIHRoZSByYW5nZSBQcm9wZXJ0eSBjb250YWluIHRoZVxuICAgKiAobWF4aW11bSkgdW5pb24gb2YgYWxsIHBvdGVudGlhbCBjaGFuZ2VzLCBzbyB0aGF0IE51bWJlclBpY2tlciBjYW4gaXRlcmF0ZSB0aHJvdWdoIGFsbCBwb3NzaWJsZSB2YWx1ZXMgYW5kIGNvbXB1dGVcbiAgICogdGhlIGJvdW5kcyBvZiB0aGUgbGFiZWxzLlxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFsdWVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPiwgcmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+LFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IE51bWJlclBpY2tlck9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE51bWJlclBpY2tlck9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdwcmVzc2VkQ29sb3InIHwgJ2Zvcm1hdFZhbHVlJz4sIFBhcmVudE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGNvbG9yOiBuZXcgQ29sb3IoIDAsIDAsIDI1NSApLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnd2hpdGUnLFxuICAgICAgY29ybmVyUmFkaXVzOiA2LFxuICAgICAgeE1hcmdpbjogMyxcbiAgICAgIHlNYXJnaW46IDMsXG4gICAgICBkZWNpbWFsUGxhY2VzOiAwLFxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyNCApLFxuICAgICAgaW5jcmVtZW50RnVuY3Rpb246ICggdmFsdWU6IG51bWJlciApID0+IHZhbHVlICsgMSxcbiAgICAgIGRlY3JlbWVudEZ1bmN0aW9uOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSAtIDEsXG4gICAgICB0aW1lckRlbGF5OiA0MDAsXG4gICAgICB0aW1lckludGVydmFsOiAxMDAsXG4gICAgICBub1ZhbHVlU3RyaW5nOiBNYXRoU3ltYm9scy5OT19WQUxVRSxcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTAsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDEwLFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiAwLFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiA1LFxuICAgICAgYmFja2dyb3VuZFN0cm9rZTogJ2dyYXknLFxuICAgICAgYmFja2dyb3VuZExpbmVXaWR0aDogMC41LFxuICAgICAgYmFja2dyb3VuZERpc2FibGVkT3BhY2l0eTogMSxcbiAgICAgIGFycm93SGVpZ2h0OiA2LFxuICAgICAgYXJyb3dZU3BhY2luZzogMyxcbiAgICAgIGFycm93U3Ryb2tlOiAnYmxhY2snLFxuICAgICAgYXJyb3dMaW5lV2lkdGg6IDAuMjUsXG4gICAgICBhcnJvd0Rpc2FibGVkT3BhY2l0eTogMSxcbiAgICAgIHZhbHVlTWF4V2lkdGg6IG51bGwsXG4gICAgICBvbklucHV0OiBfLm5vb3AsXG4gICAgICBpbmNyZW1lbnRFbmFibGVkRnVuY3Rpb246ICggdmFsdWU6IG51bWJlciwgcmFuZ2U6IFJhbmdlICkgPT4gKCB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlIDwgcmFuZ2UubWF4ICksXG4gICAgICBkZWNyZW1lbnRFbmFibGVkRnVuY3Rpb246ICggdmFsdWU6IG51bWJlciwgcmFuZ2U6IFJhbmdlICkgPT4gKCB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlID4gcmFuZ2UubWluICksXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcbiAgICAgIHZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyOiBzaGFyZWRTb3VuZFBsYXllcnMuZ2V0KCAnZ2VuZXJhbFNvZnRDbGljaycgKSxcbiAgICAgIGJvdW5kYXJ5U291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdnZW5lcmFsQm91bmRhcnlCb29wJyApLFxuXG4gICAgICAvLyBQYXJlbnRPcHRpb25zXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIHZhbHVlUHJvcGVydHk6IHZhbHVlUHJvcGVydHksXG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogcmFuZ2VQcm9wZXJ0eSxcbiAgICAgIHBhZ2VLZXlib2FyZFN0ZXA6IDIsXG4gICAgICB2b2ljaW5nT2JqZWN0UmVzcG9uc2U6ICgpID0+IHZhbHVlUHJvcGVydHkudmFsdWUsIC8vIGJ5IGRlZmF1bHQsIGp1c3Qgc3BlYWsgdGhlIHZhbHVlXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1BpY2tlcicsXG4gICAgICBwaGV0aW9SZWFkT25seTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9SZWFkT25seSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvRmVhdHVyZWQ6IHRydWUgfSxcbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBpZiAoICFvcHRpb25zLmZvcm1hdFZhbHVlICkge1xuICAgICAgb3B0aW9ucy5mb3JtYXRWYWx1ZSA9ICggdmFsdWU6IG51bWJlciApID0+IFV0aWxzLnRvRml4ZWQoIHZhbHVlLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKTtcbiAgICB9XG5cbiAgICAvLyBDb2xvciBvZiBhcnJvd3MgYW5kIHRvcC9ib3R0b20gZ3JhZGllbnQgd2hlbiBwcmVzc2VkXG4gICAgbGV0IGNvbG9yUHJvcGVydHk6IFBhaW50Q29sb3JQcm9wZXJ0eSB8IG51bGwgPSBudWxsO1xuICAgIGlmICggb3B0aW9ucy5wcmVzc2VkQ29sb3IgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmNvbG9yICk7IC8vIGRpc3Bvc2UgcmVxdWlyZWQhXG5cbiAgICAgIC8vIE5vIHJlZmVyZW5jZSBuZWVkcyB0byBiZSBrZXB0LCBzaW5jZSB3ZSBkaXNwb3NlIGl0cyBkZXBlbmRlbmN5LlxuICAgICAgb3B0aW9ucy5wcmVzc2VkQ29sb3IgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGNvbG9yUHJvcGVydHkgXSwgY29sb3IgPT4gY29sb3IuZGFya2VyQ29sb3IoKSApO1xuICAgIH1cblxuICAgIGxldCBwcmV2aW91c1ZhbHVlID0gdmFsdWVQcm9wZXJ0eS52YWx1ZTtcblxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgcGFzc2VkLWluIG9uSW5wdXQgbGlzdGVuZXIgdG8gbWFrZSBzdXJlIHRoYXQgc291bmQgaW1wbGVtZW50YXRpb24gY2FuJ3QgYmUgYmxvd24gYXdheSBpbiB0aGVcbiAgICAvLyBkZWZhdWx0cy5cbiAgICBjb25zdCBwcm92aWRlZE9uSW5wdXRMaXN0ZW5lciA9IG9wdGlvbnMub25JbnB1dDtcbiAgICBvcHRpb25zLm9uSW5wdXQgPSAoKSA9PiB7XG4gICAgICBwcm92aWRlZE9uSW5wdXRMaXN0ZW5lcigpO1xuXG4gICAgICAvLyBUaGUgb25JbnB1dCBsaXN0ZW5lciBtYXkgYmUgY2FsbGVkIHdoZW4gbm8gY2hhbmdlIHRvIHRoZSB2YWx1ZSBoYXMgYWN0dWFsbHkgaGFwcGVuZWQsIHNlZVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNzYwLiAgV2UgZG8gc29tZSBjaGVja3MgaGVyZSB0byBtYWtlIHN1cmUgdGhlIHNvdW5kIGlzIG9ubHkgZ2VuZXJhdGVkXG4gICAgICAvLyB3aGVuIGEgY2hhbmdlIG9jY3Vycy5cbiAgICAgIGlmICggdmFsdWVQcm9wZXJ0eS52YWx1ZSAhPT0gcHJldmlvdXNWYWx1ZSApIHtcblxuICAgICAgICAvLyBQbGF5IHRoZSBib3VuZGFyeSBzb3VuZCBJZiB0aGUgdmFsdWUgaXMgYXQgbWluIG9yIG1heCwgb3RoZXJ3aXNlIHBsYXkgdGhlIGRlZmF1bHQgc291bmQuXG4gICAgICAgIGlmICggdmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gcmFuZ2VQcm9wZXJ0eS5nZXQoKS5tYXggfHwgdmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gcmFuZ2VQcm9wZXJ0eS5nZXQoKS5taW4gKSB7XG4gICAgICAgICAgb3B0aW9ucy5ib3VuZGFyeVNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBvcHRpb25zLnZhbHVlQ2hhbmdlZFNvdW5kUGxheWVyLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcmV2aW91c1ZhbHVlID0gdmFsdWVQcm9wZXJ0eS52YWx1ZTtcbiAgICB9O1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMua2V5Ym9hcmRTdGVwLCAnTnVtYmVyUGlja2VyIHNldHMgaXRzIG93biBrZXlib2FyZFN0ZXAnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc2hpZnRLZXlib2FyZFN0ZXAsICdOdW1iZXJQaWNrZXIgc2V0cyBpdHMgb3duIHNoaWZ0S2V5Ym9hcmRTdGVwJyApO1xuXG4gICAgLy8gQWNjZXNzaWJsZU51bWJlclNwaW5uZXIgb3B0aW9ucyB0aGF0IGRlcGVuZCBvbiBvdGhlciBvcHRpb25zLlxuICAgIC8vIEluaXRpYWxpemUgYWNjZXNzaWJpbGl0eSBmZWF0dXJlcy4gVGhpcyBtdXN0IHJlYWNoIGludG8gaW5jcmVtZW50RnVuY3Rpb24gdG8gZ2V0IHRoZSBkZWx0YS5cbiAgICAvLyBCb3RoIG5vcm1hbCBhcnJvdyBhbmQgc2hpZnQgYXJyb3cga2V5cyB1c2UgdGhlIGRlbHRhIGNvbXB1dGVkIHdpdGggaW5jcmVtZW50RnVuY3Rpb24uXG4gICAgY29uc3Qga2V5Ym9hcmRTdGVwID0gb3B0aW9ucy5pbmNyZW1lbnRGdW5jdGlvbiggdmFsdWVQcm9wZXJ0eS5nZXQoKSApIC0gdmFsdWVQcm9wZXJ0eS5nZXQoKTtcbiAgICBvcHRpb25zLmtleWJvYXJkU3RlcCA9IGtleWJvYXJkU3RlcDtcbiAgICBvcHRpb25zLnNoaWZ0S2V5Ym9hcmRTdGVwID0ga2V5Ym9hcmRTdGVwO1xuICAgIG9wdGlvbnMucGRvbVRpbWVyRGVsYXkgPSBvcHRpb25zLnRpbWVyRGVsYXk7XG4gICAgb3B0aW9ucy5wZG9tVGltZXJJbnRlcnZhbCA9IG9wdGlvbnMudGltZXJJbnRlcnZhbDtcblxuICAgIGNvbnN0IGJvdW5kc1JlcXVpcmVkT3B0aW9uS2V5cyA9IF8ucGljayggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKTtcbiAgICBzdXBlciggXy5vbWl0KCBvcHRpb25zLCBOb2RlLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFByb3BlcnRpZXNcblxuICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ3VwJywge1xuICAgICAgdmFsaWRWYWx1ZXM6IEJ1dHRvblN0YXRlVmFsdWVzXG4gICAgfSApO1xuICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggJ2Rvd24nLCB7XG4gICAgICB2YWxpZFZhbHVlczogQnV0dG9uU3RhdGVWYWx1ZXNcbiAgICB9ICk7XG5cbiAgICAvLyBtdXN0IGJlIGRpc3Bvc2VkXG4gICAgY29uc3QgaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiA9XG4gICAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHZhbHVlUHJvcGVydHksIHJhbmdlUHJvcGVydHkgXSwgb3B0aW9ucy5pbmNyZW1lbnRFbmFibGVkRnVuY3Rpb24gKTtcblxuICAgIC8vIG11c3QgYmUgZGlzcG9zZWRcbiAgICBjb25zdCBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+ID1cbiAgICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdmFsdWVQcm9wZXJ0eSwgcmFuZ2VQcm9wZXJ0eSBdLCBvcHRpb25zLmRlY3JlbWVudEVuYWJsZWRGdW5jdGlvbiApO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOb2Rlc1xuXG4gICAgLy8gZGlzcGxheXMgdGhlIHZhbHVlXG4gICAgY29uc3QgdmFsdWVOb2RlID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IG9wdGlvbnMuZm9udCwgcGlja2FibGU6IGZhbHNlIH0gKTtcblxuICAgIC8vIGNvbXB1dGUgbWF4IHdpZHRoIG9mIHRleHQgYmFzZWQgb24gdGhlIHdpZHRoIG9mIGFsbCBwb3NzaWJsZSB2YWx1ZXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvNVxuICAgIGxldCBjdXJyZW50U2FtcGxlVmFsdWUgPSByYW5nZVByb3BlcnR5LmdldCgpLm1pbjtcbiAgICBjb25zdCBzYW1wbGVWYWx1ZXMgPSBbXTtcbiAgICB3aGlsZSAoIGN1cnJlbnRTYW1wbGVWYWx1ZSA8PSByYW5nZVByb3BlcnR5LmdldCgpLm1heCApIHtcbiAgICAgIHNhbXBsZVZhbHVlcy5wdXNoKCBjdXJyZW50U2FtcGxlVmFsdWUgKTtcbiAgICAgIGN1cnJlbnRTYW1wbGVWYWx1ZSA9IG9wdGlvbnMuaW5jcmVtZW50RnVuY3Rpb24oIGN1cnJlbnRTYW1wbGVWYWx1ZSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2FtcGxlVmFsdWVzLmxlbmd0aCA8IDUwMDAwMCwgJ0RvblxcJ3QgaW5maW5pdGUgbG9vcCBoZXJlJyApO1xuICAgIH1cbiAgICBsZXQgbWF4V2lkdGggPSBNYXRoLm1heC5hcHBseSggbnVsbCwgc2FtcGxlVmFsdWVzLm1hcCggdmFsdWUgPT4ge1xuICAgICAgdmFsdWVOb2RlLnN0cmluZyA9IG9wdGlvbnMuZm9ybWF0VmFsdWUhKCB2YWx1ZSApO1xuICAgICAgcmV0dXJuIHZhbHVlTm9kZS53aWR0aDtcbiAgICB9ICkgKTtcbiAgICAvLyBDYXAgdGhlIG1heFdpZHRoIGlmIHZhbHVlTWF4V2lkdGggaXMgcHJvdmlkZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8yOTdcbiAgICBpZiAoIG9wdGlvbnMudmFsdWVNYXhXaWR0aCAhPT0gbnVsbCApIHtcbiAgICAgIG1heFdpZHRoID0gTWF0aC5taW4oIG1heFdpZHRoLCBvcHRpb25zLnZhbHVlTWF4V2lkdGggKTtcbiAgICB9XG5cbiAgICAvLyBjb21wdXRlIHNoYXBlIG9mIHRoZSBiYWNrZ3JvdW5kIGJlaGluZCB0aGUgbnVtZXJpYyB2YWx1ZVxuICAgIGNvbnN0IGJhY2tncm91bmRXaWR0aCA9IG1heFdpZHRoICsgKCAyICogb3B0aW9ucy54TWFyZ2luICk7XG4gICAgY29uc3QgYmFja2dyb3VuZEhlaWdodCA9IHZhbHVlTm9kZS5oZWlnaHQgKyAoIDIgKiBvcHRpb25zLnlNYXJnaW4gKTtcbiAgICBjb25zdCBiYWNrZ3JvdW5kT3ZlcmxhcCA9IDE7XG4gICAgY29uc3QgYmFja2dyb3VuZENvcm5lclJhZGl1cyA9IG9wdGlvbnMuY29ybmVyUmFkaXVzO1xuXG4gICAgLy8gQXBwbHkgdGhlIG1heC13aWR0aCBBRlRFUiBjb21wdXRpbmcgdGhlIGJhY2tncm91bmRIZWlnaHQsIHNvIGl0IGRvZXNuJ3Qgc2hyaW5rIHZlcnRpY2FsbHlcbiAgICB2YWx1ZU5vZGUubWF4V2lkdGggPSBtYXhXaWR0aDtcblxuICAgIC8vIFRvcCBoYWxmIG9mIHRoZSBiYWNrZ3JvdW5kLiBQcmVzc2luZyBoZXJlIHdpbGwgaW5jcmVtZW50IHRoZSB2YWx1ZS5cbiAgICAvLyBTaGFwZSBjb21wdXRlZCBzdGFydGluZyBhdCB1cHBlci1sZWZ0LCBnb2luZyBjbG9ja3dpc2UuXG4gICAgY29uc3QgaW5jcmVtZW50QmFja2dyb3VuZE5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcbiAgICAgICAgLmFyYyggYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgTWF0aC5QSSwgTWF0aC5QSSAqIDMgLyAyLCBmYWxzZSApXG4gICAgICAgIC5hcmMoIGJhY2tncm91bmRXaWR0aCAtIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIC1NYXRoLlBJIC8gMiwgMCwgZmFsc2UgKVxuICAgICAgICAubGluZVRvKCBiYWNrZ3JvdW5kV2lkdGgsICggYmFja2dyb3VuZEhlaWdodCAvIDIgKSArIGJhY2tncm91bmRPdmVybGFwIClcbiAgICAgICAgLmxpbmVUbyggMCwgKCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApICsgYmFja2dyb3VuZE92ZXJsYXAgKVxuICAgICAgICAuY2xvc2UoKSxcbiAgICAgIHsgcGlja2FibGU6IGZhbHNlIH0gKTtcblxuICAgIC8vIEJvdHRvbSBoYWxmIG9mIHRoZSBiYWNrZ3JvdW5kLiBQcmVzc2luZyBoZXJlIHdpbGwgZGVjcmVtZW50IHRoZSB2YWx1ZS5cbiAgICAvLyBTaGFwZSBjb21wdXRlZCBzdGFydGluZyBhdCBib3R0b20tcmlnaHQsIGdvaW5nIGNsb2Nrd2lzZS5cbiAgICBjb25zdCBkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZSA9IG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxuICAgICAgICAuYXJjKCBiYWNrZ3JvdW5kV2lkdGggLSBiYWNrZ3JvdW5kQ29ybmVyUmFkaXVzLCBiYWNrZ3JvdW5kSGVpZ2h0IC0gYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywgMCwgTWF0aC5QSSAvIDIsIGZhbHNlIClcbiAgICAgICAgLmFyYyggYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZEhlaWdodCAtIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIGJhY2tncm91bmRDb3JuZXJSYWRpdXMsIE1hdGguUEkgLyAyLCBNYXRoLlBJLCBmYWxzZSApXG4gICAgICAgIC5saW5lVG8oIDAsIGJhY2tncm91bmRIZWlnaHQgLyAyIClcbiAgICAgICAgLmxpbmVUbyggYmFja2dyb3VuZFdpZHRoLCBiYWNrZ3JvdW5kSGVpZ2h0IC8gMiApXG4gICAgICAgIC5jbG9zZSgpLFxuICAgICAgeyBwaWNrYWJsZTogZmFsc2UgfSApO1xuXG4gICAgLy8gc2VwYXJhdGUgcmVjdGFuZ2xlIGZvciBzdHJva2UgYXJvdW5kIHZhbHVlIGJhY2tncm91bmRcbiAgICBjb25zdCBzdHJva2VkQmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGJhY2tncm91bmRXaWR0aCwgYmFja2dyb3VuZEhlaWdodCwgYmFja2dyb3VuZENvcm5lclJhZGl1cywgYmFja2dyb3VuZENvcm5lclJhZGl1cywge1xuICAgICAgcGlja2FibGU6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmJhY2tncm91bmRTdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuYmFja2dyb3VuZExpbmVXaWR0aCxcbiAgICAgIGRpc2FibGVkT3BhY2l0eTogb3B0aW9ucy5iYWNrZ3JvdW5kRGlzYWJsZWRPcGFjaXR5LFxuICAgICAgZW5hYmxlZFByb3BlcnR5OiB0aGlzLmVuYWJsZWRQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIC8vIGNvbXB1dGUgc2l6ZSBvZiBhcnJvd3NcbiAgICBjb25zdCBhcnJvd0J1dHRvblNpemUgPSBuZXcgRGltZW5zaW9uMiggMC41ICogYmFja2dyb3VuZFdpZHRoLCBvcHRpb25zLmFycm93SGVpZ2h0ICk7XG5cbiAgICBjb25zdCBhcnJvd09wdGlvbnMgPSB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMuYXJyb3dTdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMuYXJyb3dMaW5lV2lkdGgsXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IG9wdGlvbnMuYXJyb3dEaXNhYmxlZE9wYWNpdHksXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMuZW5hYmxlZFByb3BlcnR5LFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8vIGluY3JlbWVudCBhcnJvdywgcG9pbnRpbmcgdXAsIGRlc2NyaWJlZCBjbG9ja3dpc2UgZnJvbSB0aXBcbiAgICB0aGlzLmluY3JlbWVudEFycm93ID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXG4gICAgICAgIC5tb3ZlVG8oIGFycm93QnV0dG9uU2l6ZS53aWR0aCAvIDIsIDAgKVxuICAgICAgICAubGluZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGgsIGFycm93QnV0dG9uU2l6ZS5oZWlnaHQgKVxuICAgICAgICAubGluZVRvKCAwLCBhcnJvd0J1dHRvblNpemUuaGVpZ2h0IClcbiAgICAgICAgLmNsb3NlKCksXG4gICAgICBhcnJvd09wdGlvbnMgKTtcbiAgICB0aGlzLmluY3JlbWVudEFycm93LmNlbnRlclggPSBpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZS5jZW50ZXJYO1xuICAgIHRoaXMuaW5jcmVtZW50QXJyb3cuYm90dG9tID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUudG9wIC0gb3B0aW9ucy5hcnJvd1lTcGFjaW5nO1xuXG4gICAgLy8gZGVjcmVtZW50IGFycm93LCBwb2ludGluZyBkb3duLCBkZXNjcmliZWQgY2xvY2t3aXNlIGZyb20gdGhlIHRpcFxuICAgIHRoaXMuZGVjcmVtZW50QXJyb3cgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcbiAgICAgICAgLm1vdmVUbyggYXJyb3dCdXR0b25TaXplLndpZHRoIC8gMiwgYXJyb3dCdXR0b25TaXplLmhlaWdodCApXG4gICAgICAgIC5saW5lVG8oIDAsIDAgKVxuICAgICAgICAubGluZVRvKCBhcnJvd0J1dHRvblNpemUud2lkdGgsIDAgKVxuICAgICAgICAuY2xvc2UoKSxcbiAgICAgIGFycm93T3B0aW9ucyApO1xuICAgIHRoaXMuZGVjcmVtZW50QXJyb3cuY2VudGVyWCA9IGRlY3JlbWVudEJhY2tncm91bmROb2RlLmNlbnRlclg7XG4gICAgdGhpcy5kZWNyZW1lbnRBcnJvdy50b3AgPSBkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZS5ib3R0b20gKyBvcHRpb25zLmFycm93WVNwYWNpbmc7XG5cbiAgICAvLyBwYXJlbnRzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudCBjb21wb25lbnRzXG4gICAgY29uc3QgaW5jcmVtZW50UGFyZW50ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaW5jcmVtZW50QmFja2dyb3VuZE5vZGUsIHRoaXMuaW5jcmVtZW50QXJyb3cgXSB9ICk7XG4gICAgaW5jcmVtZW50UGFyZW50LmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCBpbmNyZW1lbnRQYXJlbnQubG9jYWxCb3VuZHMgKSApOyAvLyBpbnZpc2libGUgb3ZlcmxheVxuICAgIGNvbnN0IGRlY3JlbWVudFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCB0aGlzLmRlY3JlbWVudEFycm93IF0gfSApO1xuICAgIGRlY3JlbWVudFBhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggZGVjcmVtZW50UGFyZW50LmxvY2FsQm91bmRzICkgKTsgLy8gaW52aXNpYmxlIG92ZXJsYXlcblxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxuICAgIHRoaXMuYWRkQ2hpbGQoIGluY3JlbWVudFBhcmVudCApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGRlY3JlbWVudFBhcmVudCApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHN0cm9rZWRCYWNrZ3JvdW5kICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdmFsdWVOb2RlICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFBvaW50ZXIgYXJlYXNcblxuICAgIC8vIHRvdWNoIGFyZWFzXG4gICAgaW5jcmVtZW50UGFyZW50LnRvdWNoQXJlYSA9IFNoYXBlLnJlY3RhbmdsZShcbiAgICAgIGluY3JlbWVudFBhcmVudC5sZWZ0IC0gKCBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiAvIDIgKSwgaW5jcmVtZW50UGFyZW50LnRvcCAtIG9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uLFxuICAgICAgaW5jcmVtZW50UGFyZW50LndpZHRoICsgb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24sIGluY3JlbWVudFBhcmVudC5oZWlnaHQgKyBvcHRpb25zLnRvdWNoQXJlYVlEaWxhdGlvbiApO1xuICAgIGRlY3JlbWVudFBhcmVudC50b3VjaEFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoXG4gICAgICBkZWNyZW1lbnRQYXJlbnQubGVmdCAtICggb3B0aW9ucy50b3VjaEFyZWFYRGlsYXRpb24gLyAyICksIGRlY3JlbWVudFBhcmVudC50b3AsXG4gICAgICBkZWNyZW1lbnRQYXJlbnQud2lkdGggKyBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiwgZGVjcmVtZW50UGFyZW50LmhlaWdodCArIG9wdGlvbnMudG91Y2hBcmVhWURpbGF0aW9uICk7XG5cbiAgICAvLyBtb3VzZSBhcmVhc1xuICAgIGluY3JlbWVudFBhcmVudC5tb3VzZUFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoXG4gICAgICBpbmNyZW1lbnRQYXJlbnQubGVmdCAtICggb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24gLyAyICksIGluY3JlbWVudFBhcmVudC50b3AgLSBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbixcbiAgICAgIGluY3JlbWVudFBhcmVudC53aWR0aCArIG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uLCBpbmNyZW1lbnRQYXJlbnQuaGVpZ2h0ICsgb3B0aW9ucy5tb3VzZUFyZWFZRGlsYXRpb24gKTtcbiAgICBkZWNyZW1lbnRQYXJlbnQubW91c2VBcmVhID0gU2hhcGUucmVjdGFuZ2xlKFxuICAgICAgZGVjcmVtZW50UGFyZW50LmxlZnQgLSAoIG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uIC8gMiApLCBkZWNyZW1lbnRQYXJlbnQudG9wLFxuICAgICAgZGVjcmVtZW50UGFyZW50LndpZHRoICsgb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sIGRlY3JlbWVudFBhcmVudC5oZWlnaHQgKyBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbiApO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBDb2xvcnNcblxuICAgIC8vIGFycm93IGNvbG9ycywgY29ycmVzcG9uZGluZyB0byBCdXR0b25TdGF0ZSBhbmQgaW5jcmVtZW50RW5hYmxlZFByb3BlcnR5L2RlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eVxuICAgIGNvbnN0IGFycm93Q29sb3JzOiBBcnJvd0NvbG9ycyA9IHtcbiAgICAgIHVwOiBvcHRpb25zLmNvbG9yLFxuICAgICAgb3Zlcjogb3B0aW9ucy5jb2xvcixcbiAgICAgIGRvd246IG9wdGlvbnMucHJlc3NlZENvbG9yLFxuICAgICAgb3V0OiBvcHRpb25zLmNvbG9yLFxuICAgICAgZGlzYWJsZWQ6ICdyZ2IoMTc2LDE3NiwxNzYpJ1xuICAgIH07XG5cbiAgICAvLyBiYWNrZ3JvdW5kIGNvbG9ycywgY29ycmVzcG9uZGluZyB0byBCdXR0b25TdGF0ZSBhbmQgZW5hYmxlZFByb3BlcnR5LnZhbHVlXG4gICAgY29uc3QgaGlnaGxpZ2h0R3JhZGllbnQgPSBjcmVhdGVWZXJ0aWNhbEdyYWRpZW50KCBvcHRpb25zLmNvbG9yLCBvcHRpb25zLmJhY2tncm91bmRDb2xvciwgb3B0aW9ucy5jb2xvciwgYmFja2dyb3VuZEhlaWdodCApO1xuICAgIGNvbnN0IHByZXNzZWRHcmFkaWVudCA9IGNyZWF0ZVZlcnRpY2FsR3JhZGllbnQoIG9wdGlvbnMucHJlc3NlZENvbG9yLCBvcHRpb25zLmJhY2tncm91bmRDb2xvciwgb3B0aW9ucy5wcmVzc2VkQ29sb3IsIGJhY2tncm91bmRIZWlnaHQgKTtcbiAgICBjb25zdCBiYWNrZ3JvdW5kQ29sb3JzOiBCYWNrZ3JvdW5kQ29sb3JzID0ge1xuICAgICAgdXA6IG9wdGlvbnMuYmFja2dyb3VuZENvbG9yLFxuICAgICAgb3ZlcjogaGlnaGxpZ2h0R3JhZGllbnQsXG4gICAgICBkb3duOiBwcmVzc2VkR3JhZGllbnQsXG4gICAgICBvdXQ6IHByZXNzZWRHcmFkaWVudCxcbiAgICAgIGRpc2FibGVkOiBvcHRpb25zLmJhY2tncm91bmRDb2xvclxuICAgIH07XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIE9ic2VydmVycyBhbmQgSW5wdXRMaXN0ZW5lcnNcblxuICAgIGNvbnN0IGlucHV0TGlzdGVuZXJPcHRpb25zID0ge1xuICAgICAgZmlyZU9uSG9sZDogdHJ1ZSxcbiAgICAgIGZpcmVPbkhvbGREZWxheTogb3B0aW9ucy50aW1lckRlbGF5LFxuICAgICAgZmlyZU9uSG9sZEludGVydmFsOiBvcHRpb25zLnRpbWVySW50ZXJ2YWxcbiAgICB9O1xuXG4gICAgdGhpcy5pbmNyZW1lbnRJbnB1dExpc3RlbmVyID0gbmV3IE51bWJlclBpY2tlcklucHV0TGlzdGVuZXIoIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksXG4gICAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyT3B0aW9ucz4oIHtcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmNyZW1lbnRJbnB1dExpc3RlbmVyJyApLFxuICAgICAgICBmaXJlOiAoIGV2ZW50OiBTY2VuZXJ5RXZlbnQgKSA9PiB7XG4gICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSB2YWx1ZVByb3BlcnR5LnZhbHVlO1xuICAgICAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCBNYXRoLm1pbiggb3B0aW9ucy5pbmNyZW1lbnRGdW5jdGlvbiggdmFsdWVQcm9wZXJ0eS5nZXQoKSApLCByYW5nZVByb3BlcnR5LmdldCgpLm1heCApICk7XG4gICAgICAgICAgb3B0aW9ucy5vbklucHV0KCBldmVudCwgb2xkVmFsdWUgKTtcblxuICAgICAgICAgIC8vIHZvaWNpbmcgLSBzcGVhayB0aGUgb2JqZWN0L2NvbnRleHQgcmVzcG9uc2VzIG9uIHZhbHVlIGNoYW5nZSBmcm9tIHVzZXIgaW5wdXRcbiAgICAgICAgICB0aGlzLnZvaWNpbmdTcGVha0Z1bGxSZXNwb25zZSggeyBuYW1lUmVzcG9uc2U6IG51bGwsIGhpbnRSZXNwb25zZTogbnVsbCB9ICk7XG4gICAgICAgIH1cbiAgICAgIH0sIGlucHV0TGlzdGVuZXJPcHRpb25zICkgKTtcbiAgICBpbmNyZW1lbnRQYXJlbnQuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5pbmNyZW1lbnRJbnB1dExpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRlY3JlbWVudElucHV0TGlzdGVuZXIgPSBuZXcgTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lciggZGVjcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eSxcbiAgICAgIGNvbWJpbmVPcHRpb25zPE51bWJlclBpY2tlcklucHV0TGlzdGVuZXJPcHRpb25zPigge1xuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RlY3JlbWVudElucHV0TGlzdGVuZXInICksXG4gICAgICAgIGZpcmU6ICggZXZlbnQ6IFNjZW5lcnlFdmVudCApID0+IHtcbiAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHZhbHVlUHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIE1hdGgubWF4KCBvcHRpb25zLmRlY3JlbWVudEZ1bmN0aW9uKCB2YWx1ZVByb3BlcnR5LmdldCgpICksIHJhbmdlUHJvcGVydHkuZ2V0KCkubWluICkgKTtcbiAgICAgICAgICBvcHRpb25zLm9uSW5wdXQoIGV2ZW50LCBvbGRWYWx1ZSApO1xuXG4gICAgICAgICAgLy8gdm9pY2luZyAtIHNwZWFrIHRoZSBvYmplY3QvY29udGV4dCByZXNwb25zZXMgb24gdmFsdWUgY2hhbmdlIGZyb20gdXNlciBpbnB1dFxuICAgICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7IG5hbWVSZXNwb25zZTogbnVsbCwgaGludFJlc3BvbnNlOiBudWxsIH0gKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW5wdXRMaXN0ZW5lck9wdGlvbnMgKSApO1xuICAgIGRlY3JlbWVudFBhcmVudC5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmRlY3JlbWVudElucHV0TGlzdGVuZXIgKTtcblxuICAgIC8vIGVuYWJsZS9kaXNhYmxlIGxpc3RlbmVycyBhbmQgaW50ZXJhY3Rpb246IHVubGluayB1bm5lY2Vzc2FyeSwgUHJvcGVydGllcyBhcmUgb3duZWQgYnkgdGhpcyBpbnN0YW5jZVxuICAgIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcbiAgICAgICFlbmFibGVkICYmIHRoaXMuaW5jcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICAgIGluY3JlbWVudFBhcmVudC5waWNrYWJsZSA9IGVuYWJsZWQ7XG4gICAgfSApO1xuICAgIGRlY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcbiAgICAgICFlbmFibGVkICYmIHRoaXMuZGVjcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICAgIGRlY3JlbWVudFBhcmVudC5waWNrYWJsZSA9IGVuYWJsZWQ7XG4gICAgfSApO1xuXG4gICAgLy8gVXBkYXRlIHRleHQgdG8gbWF0Y2ggdGhlIHZhbHVlXG4gICAgY29uc3QgdmFsdWVPYnNlcnZlciA9ICggdmFsdWU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQgKSA9PiB7XG4gICAgICBpZiAoIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIHZhbHVlTm9kZS5zdHJpbmcgPSBvcHRpb25zLm5vVmFsdWVTdHJpbmc7XG4gICAgICAgIHZhbHVlTm9kZS54ID0gKCBiYWNrZ3JvdW5kV2lkdGggLSB2YWx1ZU5vZGUud2lkdGggKSAvIDI7IC8vIGhvcml6b250YWxseSBjZW50ZXJlZFxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhbHVlTm9kZS5zdHJpbmcgPSBvcHRpb25zLmZvcm1hdFZhbHVlISggdmFsdWUgKTtcbiAgICAgICAgaWYgKCBvcHRpb25zLmFsaWduID09PSAnY2VudGVyJyApIHtcbiAgICAgICAgICB2YWx1ZU5vZGUuY2VudGVyWCA9IGluY3JlbWVudEJhY2tncm91bmROb2RlLmNlbnRlclg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuYWxpZ24gPT09ICdyaWdodCcgKSB7XG4gICAgICAgICAgdmFsdWVOb2RlLnJpZ2h0ID0gaW5jcmVtZW50QmFja2dyb3VuZE5vZGUucmlnaHQgLSBvcHRpb25zLnhNYXJnaW47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIG9wdGlvbnMuYWxpZ24gPT09ICdsZWZ0JyApIHtcbiAgICAgICAgICB2YWx1ZU5vZGUubGVmdCA9IGluY3JlbWVudEJhY2tncm91bmROb2RlLmxlZnQgKyBvcHRpb25zLnhNYXJnaW47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgdmFsdWUgZm9yIG9wdGlvbnMuYWxpZ246ICR7b3B0aW9ucy5hbGlnbn1gICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhbHVlTm9kZS5jZW50ZXJZID0gYmFja2dyb3VuZEhlaWdodCAvIDI7XG4gICAgfTtcbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTsgLy8gbXVzdCBiZSB1bmxpbmtlZCBpbiBkaXNwb3NlXG5cbiAgICAvLyBVcGRhdGUgY29sb3JzIGZvciBpbmNyZW1lbnQgY29tcG9uZW50cy4gIE5vIGRpc3Bvc2UgaXMgbmVlZGVkIHNpbmNlIGRlcGVuZGVuY2llcyBhcmUgbG9jYWxseSBvd25lZC5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHksIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eSBdLCAoIHN0YXRlLCBlbmFibGVkICkgPT4ge1xuICAgICAgdXBkYXRlQ29sb3JzKCBzdGF0ZSwgZW5hYmxlZCwgaW5jcmVtZW50QmFja2dyb3VuZE5vZGUsIHRoaXMuaW5jcmVtZW50QXJyb3csIGJhY2tncm91bmRDb2xvcnMsIGFycm93Q29sb3JzICk7XG4gICAgfSApO1xuXG4gICAgLy8gVXBkYXRlIGNvbG9ycyBmb3IgZGVjcmVtZW50IGNvbXBvbmVudHMuICBObyBkaXNwb3NlIGlzIG5lZWRlZCBzaW5jZSBkZXBlbmRlbmNpZXMgYXJlIGxvY2FsbHkgb3duZWQuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBkZWNyZW1lbnRCdXR0b25TdGF0ZVByb3BlcnR5LCBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkgXSwgKCBzdGF0ZSwgZW5hYmxlZCApID0+IHtcbiAgICAgIHVwZGF0ZUNvbG9ycyggc3RhdGUsIGVuYWJsZWQsIGRlY3JlbWVudEJhY2tncm91bmROb2RlLCB0aGlzLmRlY3JlbWVudEFycm93LCBiYWNrZ3JvdW5kQ29sb3JzLCBhcnJvd0NvbG9ycyApO1xuICAgIH0gKTtcblxuICAgIC8vIHBkb20gLSBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHRoYXQgbWF0Y2hlcyByb3VuZGVkIGJhY2tncm91bmQgYmVoaW5kIHRoZSBudW1lcmljIHZhbHVlXG4gICAgY29uc3QgZm9jdXNCb3VuZHMgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWQoIEhpZ2hsaWdodFBhdGguZ2V0RGVmYXVsdERpbGF0aW9uQ29lZmZpY2llbnQoKSApO1xuICAgIHRoaXMuZm9jdXNIaWdobGlnaHQgPSBuZXcgSGlnaGxpZ2h0UGF0aCggU2hhcGUucm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaShcbiAgICAgIGZvY3VzQm91bmRzLm1pblgsXG4gICAgICBmb2N1c0JvdW5kcy5taW5ZLFxuICAgICAgZm9jdXNCb3VuZHMud2lkdGgsXG4gICAgICBmb2N1c0JvdW5kcy5oZWlnaHQsIHtcbiAgICAgICAgdG9wTGVmdDogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXG4gICAgICAgIHRvcFJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1cyxcbiAgICAgICAgYm90dG9tTGVmdDogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXG4gICAgICAgIGJvdHRvbVJpZ2h0OiBvcHRpb25zLmNvcm5lclJhZGl1c1xuICAgICAgfSApXG4gICAgKTtcblxuICAgIC8vIHVwZGF0ZSBzdHlsZSB3aXRoIGtleWJvYXJkIGlucHV0LCBFbWl0dGVycyBvd25lZCBieSB0aGlzIGluc3RhbmNlIGFuZCBkaXNwb3NlZCBpbiBBY2Nlc3NpYmxlTnVtYmVyU3Bpbm5lclxuICAgIHRoaXMucGRvbUluY3JlbWVudERvd25FbWl0dGVyLmFkZExpc3RlbmVyKCBpc0Rvd24gPT4ge1xuICAgICAgaW5jcmVtZW50QnV0dG9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9ICggaXNEb3duID8gJ2Rvd24nIDogJ3VwJyApO1xuICAgIH0gKTtcbiAgICB0aGlzLnBkb21EZWNyZW1lbnREb3duRW1pdHRlci5hZGRMaXN0ZW5lciggaXNEb3duID0+IHtcbiAgICAgIGRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkudmFsdWUgPSAoIGlzRG93biA/ICdkb3duJyA6ICd1cCcgKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIHZhbHVlUHJvcGVydHksIHtcbiAgICAgIHRhbmRlbU5hbWU6ICd2YWx1ZVByb3BlcnR5J1xuICAgIH0gKTtcblxuICAgIC8vIE11dGF0ZSBvcHRpb25zIHRoYXQgcmVxdWlyZSBib3VuZHMgYWZ0ZXIgd2UgaGF2ZSBjaGlsZHJlblxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgKTtcblxuICAgIHRoaXMuZGlzcG9zZU51bWJlclBpY2tlciA9ICgpID0+IHtcblxuICAgICAgY29sb3JQcm9wZXJ0eSAmJiBjb2xvclByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGluY3JlbWVudEVuYWJsZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5pbmNyZW1lbnRBcnJvdy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmRlY3JlbWVudEFycm93LmRpc3Bvc2UoKTtcbiAgICAgIHN0cm9rZWRCYWNrZ3JvdW5kLmRpc3Bvc2UoKTtcblxuICAgICAgaWYgKCB2YWx1ZVByb3BlcnR5Lmhhc0xpc3RlbmVyKCB2YWx1ZU9ic2VydmVyICkgKSB7XG4gICAgICAgIHZhbHVlUHJvcGVydHkudW5saW5rKCB2YWx1ZU9ic2VydmVyICk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnTnVtYmVyUGlja2VyJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVJY29uKCB2YWx1ZTogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBDcmVhdGVJY29uT3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q3JlYXRlSWNvbk9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIENyZWF0ZUljb25PcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIEhpZ2hsaWdodCB0aGUgaW5jcmVtZW50IGJ1dHRvblxuICAgICAgaGlnaGxpZ2h0SW5jcmVtZW50OiBmYWxzZSxcblxuICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBkZWNyZW1lbnQgYnV0dG9uXG4gICAgICBoaWdobGlnaHREZWNyZW1lbnQ6IGZhbHNlLFxuXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCB2YWx1ZSAtIDEsIHZhbHVlICsgMSApLFxuICAgICAgbnVtYmVyUGlja2VyT3B0aW9uczoge1xuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXG5cbiAgICAgICAgLy8gcGhldC1pb1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIGJ5IGRlZmF1bHQsIGljb25zIGRvbid0IG5lZWQgaW5zdHJ1bWVudGF0aW9uXG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBudW1iZXJQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBuZXcgTnVtYmVyUHJvcGVydHkoIHZhbHVlICksIG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5yYW5nZSApLCBvcHRpb25zLm51bWJlclBpY2tlck9wdGlvbnMgKTtcblxuICAgIC8vIHdlIGRvbid0IHdhbnQgdGhpcyBpY29uIHRvIGhhdmUga2V5Ym9hcmQgbmF2aWdhdGlvbiwgb3IgZGVzY3JpcHRpb24gaW4gdGhlIFBET00uXG4gICAgbnVtYmVyUGlja2VyLnJlbW92ZUZyb21QRE9NKCk7XG5cbiAgICBpZiAoIG9wdGlvbnMuaGlnaGxpZ2h0RGVjcmVtZW50ICkge1xuICAgICAgbnVtYmVyUGlja2VyLmRlY3JlbWVudElucHV0TGlzdGVuZXIuaXNPdmVyUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoIG9wdGlvbnMuaGlnaGxpZ2h0SW5jcmVtZW50ICkge1xuICAgICAgbnVtYmVyUGlja2VyLmluY3JlbWVudElucHV0TGlzdGVuZXIuaXNPdmVyUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gbnVtYmVyUGlja2VyO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlTnVtYmVyUGlja2VyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdmlzaWJpbGl0eSBvZiB0aGUgYXJyb3dzLlxuICAgKi9cbiAgcHVibGljIHNldEFycm93c1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgaWYgKCAhdmlzaWJsZSApIHtcbiAgICAgIHRoaXMuaW5jcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICAgIHRoaXMuZGVjcmVtZW50SW5wdXRMaXN0ZW5lci5pbnRlcnJ1cHQoKTtcbiAgICB9XG4gICAgdGhpcy5pbmNyZW1lbnRBcnJvdy52aXNpYmxlID0gdmlzaWJsZTtcbiAgICB0aGlzLmRlY3JlbWVudEFycm93LnZpc2libGUgPSB2aXNpYmxlO1xuICB9XG59XG5cbnR5cGUgTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lclNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcbnR5cGUgTnVtYmVyUGlja2VySW5wdXRMaXN0ZW5lck9wdGlvbnMgPSBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyU2VsZk9wdGlvbnMgJiBGaXJlTGlzdGVuZXJPcHRpb25zPEZpcmVMaXN0ZW5lcj47XG5cbi8qKlxuICogQ29udmVydHMgRmlyZUxpc3RlbmVyIGV2ZW50cyB0byBzdGF0ZSBjaGFuZ2VzLlxuICovXG5jbGFzcyBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyIGV4dGVuZHMgRmlyZUxpc3RlbmVyIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJ1dHRvblN0YXRlUHJvcGVydHk6IFN0cmluZ1VuaW9uUHJvcGVydHk8QnV0dG9uU3RhdGU+LCBvcHRpb25zOiBOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyT3B0aW9ucyApIHtcbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBidXR0b24gc3RhdGUuICBObyBkaXNwb3NlIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBwYXJlbnQgY2xhc3MgZGlzcG9zZXMgdGhlIGRlcGVuZGVuY2llcy5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxuICAgICAgWyB0aGlzLmlzT3ZlclByb3BlcnR5LCB0aGlzLmlzUHJlc3NlZFByb3BlcnR5IF0sXG4gICAgICAoIGlzT3ZlciwgaXNQcmVzc2VkICkgPT4ge1xuICAgICAgICBidXR0b25TdGF0ZVByb3BlcnR5LnNldChcbiAgICAgICAgICBpc092ZXIgJiYgIWlzUHJlc3NlZCA/ICdvdmVyJyA6XG4gICAgICAgICAgaXNPdmVyICYmIGlzUHJlc3NlZCA/ICdkb3duJyA6XG4gICAgICAgICAgIWlzT3ZlciAmJiAhaXNQcmVzc2VkID8gJ3VwJyA6XG4gICAgICAgICAgJ291dCdcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHZlcnRpY2FsIGdyYWRpZW50LlxuICovXG5mdW5jdGlvbiBjcmVhdGVWZXJ0aWNhbEdyYWRpZW50KCB0b3BDb2xvcjogVENvbG9yLCBjZW50ZXJDb2xvcjogVENvbG9yLCBib3R0b21Db2xvcjogVENvbG9yLCBoZWlnaHQ6IG51bWJlciApOiBMaW5lYXJHcmFkaWVudCB7XG4gIHJldHVybiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDAsIGhlaWdodCApXG4gICAgLmFkZENvbG9yU3RvcCggMCwgdG9wQ29sb3IgKVxuICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgY2VudGVyQ29sb3IgKVxuICAgIC5hZGRDb2xvclN0b3AoIDEsIGJvdHRvbUNvbG9yICk7XG59XG5cbi8qKlxuICogVXBkYXRlcyBhcnJvdyBhbmQgYmFja2dyb3VuZCBjb2xvcnNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlQ29sb3JzKCBidXR0b25TdGF0ZTogQnV0dG9uU3RhdGUsIGVuYWJsZWQ6IGJvb2xlYW4sIGJhY2tncm91bmROb2RlOiBQYXRoLCBhcnJvd05vZGU6IFBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcnM6IEJhY2tncm91bmRDb2xvcnMsIGFycm93Q29sb3JzOiBBcnJvd0NvbG9ycyApOiB2b2lkIHtcbiAgaWYgKCBlbmFibGVkICkge1xuICAgIGFycm93Tm9kZS5zdHJva2UgPSAnYmxhY2snO1xuICAgIGlmICggYnV0dG9uU3RhdGUgPT09ICd1cCcgKSB7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gYmFja2dyb3VuZENvbG9ycy51cDtcbiAgICAgIGFycm93Tm9kZS5maWxsID0gYXJyb3dDb2xvcnMudXA7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBidXR0b25TdGF0ZSA9PT0gJ292ZXInICkge1xuICAgICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMub3ZlcjtcbiAgICAgIGFycm93Tm9kZS5maWxsID0gYXJyb3dDb2xvcnMub3ZlcjtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGJ1dHRvblN0YXRlID09PSAnZG93bicgKSB7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gYmFja2dyb3VuZENvbG9ycy5kb3duO1xuICAgICAgYXJyb3dOb2RlLmZpbGwgPSBhcnJvd0NvbG9ycy5kb3duO1xuICAgIH1cbiAgICBlbHNlIGlmICggYnV0dG9uU3RhdGUgPT09ICdvdXQnICkge1xuICAgICAgYmFja2dyb3VuZE5vZGUuZmlsbCA9IGJhY2tncm91bmRDb2xvcnMub3V0O1xuICAgICAgYXJyb3dOb2RlLmZpbGwgPSBhcnJvd0NvbG9ycy5vdXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgYnV0dG9uU3RhdGU6ICR7YnV0dG9uU3RhdGV9YCApO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICBiYWNrZ3JvdW5kTm9kZS5maWxsID0gYmFja2dyb3VuZENvbG9ycy5kaXNhYmxlZDtcbiAgICBhcnJvd05vZGUuZmlsbCA9IGFycm93Q29sb3JzLmRpc2FibGVkO1xuICAgIGFycm93Tm9kZS5zdHJva2UgPSBhcnJvd0NvbG9ycy5kaXNhYmxlZDsgLy8gc3Ryb2tlIHNvIHRoYXQgYXJyb3cgc2l6ZSB3aWxsIGxvb2sgdGhlIHNhbWUgd2hlbiBpdCdzIGVuYWJsZWQvZGlzYWJsZWRcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdOdW1iZXJQaWNrZXInLCBOdW1iZXJQaWNrZXIgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlN0cmluZ1VuaW9uUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiTWF0aFN5bWJvbHMiLCJQaGV0Rm9udCIsIkNvbG9yIiwiRmlyZUxpc3RlbmVyIiwiSGlnaGxpZ2h0UGF0aCIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVGV4dCIsIkFjY2Vzc2libGVOdW1iZXJTcGlubmVyIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwic3VuIiwiQnV0dG9uU3RhdGVWYWx1ZXMiLCJOdW1iZXJQaWNrZXIiLCJjcmVhdGVJY29uIiwidmFsdWUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGlnaGxpZ2h0SW5jcmVtZW50IiwiaGlnaGxpZ2h0RGVjcmVtZW50IiwicmFuZ2UiLCJudW1iZXJQaWNrZXJPcHRpb25zIiwicGlja2FibGUiLCJ0YW5kZW0iLCJPUFRfT1VUIiwibnVtYmVyUGlja2VyIiwicmVtb3ZlRnJvbVBET00iLCJkZWNyZW1lbnRJbnB1dExpc3RlbmVyIiwiaXNPdmVyUHJvcGVydHkiLCJpbmNyZW1lbnRJbnB1dExpc3RlbmVyIiwiZGlzcG9zZSIsImRpc3Bvc2VOdW1iZXJQaWNrZXIiLCJzZXRBcnJvd3NWaXNpYmxlIiwidmlzaWJsZSIsImludGVycnVwdCIsImluY3JlbWVudEFycm93IiwiZGVjcmVtZW50QXJyb3ciLCJ2YWx1ZVByb3BlcnR5IiwicmFuZ2VQcm9wZXJ0eSIsIndpbmRvdyIsImNvbG9yIiwiYmFja2dyb3VuZENvbG9yIiwiY29ybmVyUmFkaXVzIiwieE1hcmdpbiIsInlNYXJnaW4iLCJkZWNpbWFsUGxhY2VzIiwiZm9udCIsImluY3JlbWVudEZ1bmN0aW9uIiwiZGVjcmVtZW50RnVuY3Rpb24iLCJ0aW1lckRlbGF5IiwidGltZXJJbnRlcnZhbCIsIm5vVmFsdWVTdHJpbmciLCJOT19WQUxVRSIsImFsaWduIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiYmFja2dyb3VuZFN0cm9rZSIsImJhY2tncm91bmRMaW5lV2lkdGgiLCJiYWNrZ3JvdW5kRGlzYWJsZWRPcGFjaXR5IiwiYXJyb3dIZWlnaHQiLCJhcnJvd1lTcGFjaW5nIiwiYXJyb3dTdHJva2UiLCJhcnJvd0xpbmVXaWR0aCIsImFycm93RGlzYWJsZWRPcGFjaXR5IiwidmFsdWVNYXhXaWR0aCIsIm9uSW5wdXQiLCJfIiwibm9vcCIsImluY3JlbWVudEVuYWJsZWRGdW5jdGlvbiIsInVuZGVmaW5lZCIsIm1heCIsImRlY3JlbWVudEVuYWJsZWRGdW5jdGlvbiIsIm1pbiIsImRpc2FibGVkT3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJ2YWx1ZUNoYW5nZWRTb3VuZFBsYXllciIsImdldCIsImJvdW5kYXJ5U291bmRQbGF5ZXIiLCJjdXJzb3IiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsInBhZ2VLZXlib2FyZFN0ZXAiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9SZWFkT25seSIsIkRFRkFVTFRfT1BUSU9OUyIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImZvcm1hdFZhbHVlIiwidG9GaXhlZCIsImNvbG9yUHJvcGVydHkiLCJwcmVzc2VkQ29sb3IiLCJkYXJrZXJDb2xvciIsInByZXZpb3VzVmFsdWUiLCJwcm92aWRlZE9uSW5wdXRMaXN0ZW5lciIsInBsYXkiLCJhc3NlcnQiLCJrZXlib2FyZFN0ZXAiLCJzaGlmdEtleWJvYXJkU3RlcCIsInBkb21UaW1lckRlbGF5IiwicGRvbVRpbWVySW50ZXJ2YWwiLCJib3VuZHNSZXF1aXJlZE9wdGlvbktleXMiLCJwaWNrIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwib21pdCIsImluY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImRlY3JlbWVudEJ1dHRvblN0YXRlUHJvcGVydHkiLCJpbmNyZW1lbnRFbmFibGVkUHJvcGVydHkiLCJkZWNyZW1lbnRFbmFibGVkUHJvcGVydHkiLCJ2YWx1ZU5vZGUiLCJjdXJyZW50U2FtcGxlVmFsdWUiLCJzYW1wbGVWYWx1ZXMiLCJwdXNoIiwibGVuZ3RoIiwibWF4V2lkdGgiLCJNYXRoIiwiYXBwbHkiLCJtYXAiLCJzdHJpbmciLCJ3aWR0aCIsImJhY2tncm91bmRXaWR0aCIsImJhY2tncm91bmRIZWlnaHQiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kT3ZlcmxhcCIsImJhY2tncm91bmRDb3JuZXJSYWRpdXMiLCJpbmNyZW1lbnRCYWNrZ3JvdW5kTm9kZSIsImFyYyIsIlBJIiwibGluZVRvIiwiY2xvc2UiLCJkZWNyZW1lbnRCYWNrZ3JvdW5kTm9kZSIsInN0cm9rZWRCYWNrZ3JvdW5kIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiZW5hYmxlZFByb3BlcnR5IiwiYXJyb3dCdXR0b25TaXplIiwiYXJyb3dPcHRpb25zIiwibW92ZVRvIiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsImluY3JlbWVudFBhcmVudCIsImNoaWxkcmVuIiwiYWRkQ2hpbGQiLCJsb2NhbEJvdW5kcyIsImRlY3JlbWVudFBhcmVudCIsInRvdWNoQXJlYSIsInJlY3RhbmdsZSIsImxlZnQiLCJtb3VzZUFyZWEiLCJhcnJvd0NvbG9ycyIsInVwIiwib3ZlciIsImRvd24iLCJvdXQiLCJkaXNhYmxlZCIsImhpZ2hsaWdodEdyYWRpZW50IiwiY3JlYXRlVmVydGljYWxHcmFkaWVudCIsInByZXNzZWRHcmFkaWVudCIsImJhY2tncm91bmRDb2xvcnMiLCJpbnB1dExpc3RlbmVyT3B0aW9ucyIsImZpcmVPbkhvbGQiLCJmaXJlT25Ib2xkRGVsYXkiLCJmaXJlT25Ib2xkSW50ZXJ2YWwiLCJOdW1iZXJQaWNrZXJJbnB1dExpc3RlbmVyIiwiY3JlYXRlVGFuZGVtIiwiZmlyZSIsImV2ZW50Iiwib2xkVmFsdWUiLCJzZXQiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJuYW1lUmVzcG9uc2UiLCJoaW50UmVzcG9uc2UiLCJhZGRJbnB1dExpc3RlbmVyIiwibGluayIsImVuYWJsZWQiLCJ2YWx1ZU9ic2VydmVyIiwieCIsInJpZ2h0IiwiRXJyb3IiLCJjZW50ZXJZIiwibXVsdGlsaW5rIiwic3RhdGUiLCJ1cGRhdGVDb2xvcnMiLCJmb2N1c0JvdW5kcyIsImRpbGF0ZWQiLCJnZXREZWZhdWx0RGlsYXRpb25Db2VmZmljaWVudCIsImZvY3VzSGlnaGxpZ2h0Iiwicm91bmRlZFJlY3RhbmdsZVdpdGhSYWRpaSIsIm1pblgiLCJtaW5ZIiwidG9wTGVmdCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwicGRvbUluY3JlbWVudERvd25FbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJpc0Rvd24iLCJwZG9tRGVjcmVtZW50RG93bkVtaXR0ZXIiLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtTmFtZSIsIm11dGF0ZSIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJidXR0b25TdGF0ZVByb3BlcnR5IiwiaXNQcmVzc2VkUHJvcGVydHkiLCJpc092ZXIiLCJpc1ByZXNzZWQiLCJ0b3BDb2xvciIsImNlbnRlckNvbG9yIiwiYm90dG9tQ29sb3IiLCJhZGRDb2xvclN0b3AiLCJidXR0b25TdGF0ZSIsImJhY2tncm91bmROb2RlIiwiYXJyb3dOb2RlIiwiZmlsbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNB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