// Copyright 2014-2024, University of Colorado Boulder
/**
 * Shows a readout of the elapsed time, with play and pause buttons.  By default there are no units (which could be used
 * if all of a simulations time units are in 'seconds'), or you can specify a selection of units to choose from.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Anton Ulyanov (Mlearner)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { Circle, HBox, InteractiveHighlighting, Node, Path, VBox } from '../../scenery/js/imports.js';
import BooleanRectangularToggleButton from '../../sun/js/buttons/BooleanRectangularToggleButton.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberDisplay from './NumberDisplay.js';
import PauseIconShape from './PauseIconShape.js';
import PhetFont from './PhetFont.js';
import PlayIconShape from './PlayIconShape.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
import ShadedRectangle from './ShadedRectangle.js';
import SoundDragListener from './SoundDragListener.js';
import SoundKeyboardDragListener from './SoundKeyboardDragListener.js';
import Stopwatch from './Stopwatch.js';
import UTurnArrowShape from './UTurnArrowShape.js';
let StopwatchNode = class StopwatchNode extends InteractiveHighlighting(Node) {
    dispose() {
        this.disposeStopwatchNode();
        super.dispose();
    }
    /**
   * Gets the centiseconds (hundredths-of-a-second) string for a time value.
   */ static getDecimalPlaces(time, numberDecimalPlaces) {
        const max = Math.pow(10, numberDecimalPlaces);
        // Round to the nearest centisecond, see https://github.com/phetsims/masses-and-springs/issues/156
        time = Utils.roundSymmetric(time * max) / max;
        // Rounding after mod, in case there is floating-point error
        let decimalValue = `${Utils.roundSymmetric(time % 1 * max)}`;
        while(decimalValue.length < numberDecimalPlaces){
            decimalValue = `0${decimalValue}`;
        }
        return `.${decimalValue}`;
    }
    /**
   * Creates a custom value for options.numberDisplayOptions.numberFormatter, passed to NumberDisplay. When using
   * this method, you will also need to use NumberDisplayOptions.numberFormatterDependencies, to tell NumberDisplay
   * about the dependencies herein. See https://github.com/phetsims/scenery-phet/issues/781.
   * This will typically be something like:
   *
   * numberFormatter: StopwatchNode.createRichTextNumberFormatter( {
   *   units: unitsProperty,
   *   ...
   * } ),
   * numberFormatterDependencies: [
   *   SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty,
   *   unitsProperty
   * ],
   */ static createRichTextNumberFormatter(providedOptions) {
        const options = optionize()({
            // If true, the time value is converted to minutes and seconds, and the format looks like 59:59.00.
            // If false, time is formatted as a decimal value, like 123.45
            showAsMinutesAndSeconds: true,
            numberOfDecimalPlaces: 2,
            bigNumberFont: 20,
            smallNumberFont: 14,
            unitsFont: 14,
            units: '',
            // Units cannot be baked into the i18n string because they can change independently
            valueUnitsPattern: SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty
        }, providedOptions);
        return (time)=>{
            const minutesAndSeconds = options.showAsMinutesAndSeconds ? toMinutesAndSeconds(time) : Math.floor(time);
            const centiseconds = StopwatchNode.getDecimalPlaces(time, options.numberOfDecimalPlaces);
            const units = typeof options.units === 'string' ? options.units : options.units.value;
            const fontSize = `${options.smallNumberFont}px`;
            // Single quotes around CSS style so the double-quotes in the CSS font family work. Himalaya doesn't like &quot;
            // See https://github.com/phetsims/collision-lab/issues/140.
            return StringUtils.fillIn(options.valueUnitsPattern, {
                value: `<span style='font-size: ${options.bigNumberFont}px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${minutesAndSeconds}</span><span style='font-size: ${fontSize};font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${centiseconds}</span>`,
                units: `<span style='font-size: ${options.unitsFont}px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${units}</span>`
            });
        };
    }
    constructor(stopwatch, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            cursor: 'pointer',
            numberDisplayRange: Stopwatch.ZERO_TO_ALMOST_SIXTY,
            iconHeight: 10,
            iconFill: 'black',
            iconLineWidth: 1,
            backgroundBaseColor: 'rgb( 80, 130, 230 )',
            buttonBaseColor: '#DFE0E1',
            resetButtonSoundPlayer: sharedSoundPlayers.get('pushButton'),
            xSpacing: 6,
            ySpacing: 6,
            xMargin: 8,
            yMargin: 8,
            numberDisplayOptions: {
                numberFormatter: StopwatchNode.RICH_TEXT_MINUTES_AND_SECONDS,
                numberFormatterDependencies: [
                    // Used in the numberFormatter above
                    SceneryPhetStrings.stopwatchValueUnitsPatternStringProperty
                ],
                useRichText: true,
                textOptions: {
                    font: StopwatchNode.DEFAULT_FONT
                },
                align: 'right',
                cornerRadius: 4,
                xMargin: 4,
                yMargin: 2,
                maxWidth: 150,
                pickable: false // allow dragging by the number display
            },
            dragBoundsProperty: null,
            dragListenerOptions: {
                start: _.noop
            },
            keyboardDragListenerOptions: {},
            // highlight will only be visible if the component is interactive (provide dragBoundsProperty)
            interactiveHighlightEnabled: false,
            otherControls: [],
            includePlayPauseResetButtons: true,
            visibleProperty: stopwatch.isVisibleProperty,
            // Tandem is required to make sure the buttons are instrumented
            tandem: Tandem.REQUIRED,
            phetioFeatured: true
        }, providedOptions);
        assert && assert(!options.hasOwnProperty('maxValue'), 'options.maxValue no longer supported');
        assert && assert(options.xSpacing >= 0, 'Buttons cannot overlap');
        assert && assert(options.ySpacing >= 0, 'Buttons cannot overlap the readout');
        const numberDisplay = new NumberDisplay(stopwatch.timeProperty, options.numberDisplayRange, options.numberDisplayOptions);
        let playPauseResetButtonContainer = null;
        let disposePlayPauseResetButtons = null;
        if (options.includePlayPauseResetButtons) {
            // Buttons ----------------------------------------------------------------------------
            const resetPath = new Path(new UTurnArrowShape(options.iconHeight), {
                fill: options.iconFill
            });
            const playIconHeight = resetPath.height;
            const playIconWidth = 0.8 * playIconHeight;
            const playPath = new Path(new PlayIconShape(playIconWidth, playIconHeight), {
                fill: options.iconFill
            });
            const pausePath = new Path(new PauseIconShape(0.75 * playIconWidth, playIconHeight), {
                fill: options.iconFill
            });
            const playPauseButton = new BooleanRectangularToggleButton(stopwatch.isRunningProperty, pausePath, playPath, combineOptions({
                baseColor: options.buttonBaseColor,
                touchAreaXDilation: 5,
                touchAreaXShift: 5,
                touchAreaYDilation: 8,
                tandem: options.tandem.createTandem('playPauseButton'),
                phetioVisiblePropertyInstrumented: false,
                phetioEnabledPropertyInstrumented: false
            }, options.playPauseButtonOptions));
            const resetButton = new RectangularPushButton(combineOptions({
                listener: ()=>{
                    stopwatch.isRunningProperty.set(false);
                    stopwatch.timeProperty.set(0);
                },
                touchAreaXDilation: 5,
                touchAreaXShift: -5,
                touchAreaYDilation: 8,
                content: resetPath,
                baseColor: options.buttonBaseColor,
                soundPlayer: options.resetButtonSoundPlayer,
                tandem: options.tandem.createTandem('resetButton'),
                phetioVisiblePropertyInstrumented: false,
                phetioEnabledPropertyInstrumented: false
            }, options.resetButtonOptions));
            playPauseResetButtonContainer = new HBox({
                spacing: options.xSpacing,
                children: [
                    resetButton,
                    playPauseButton
                ]
            });
            // Disable the reset button when time is zero, and enable the play/pause button when not at the max time
            const timeListener = (time)=>{
                resetButton.enabled = time > 0;
                playPauseButton.enabled = time < stopwatch.timeProperty.range.max;
            };
            stopwatch.timeProperty.link(timeListener);
            disposePlayPauseResetButtons = ()=>{
                stopwatch.timeProperty.unlink(timeListener);
                resetButton.dispose();
                playPauseButton.dispose();
            };
        }
        const contents = new VBox({
            spacing: options.ySpacing,
            children: [
                numberDisplay,
                // Include the play/pause and reset buttons if specified in the options
                ...playPauseResetButtonContainer ? [
                    playPauseResetButtonContainer
                ] : [],
                // Include any additional controls as specified
                ...options.otherControls
            ]
        });
        // Background panel ----------------------------------------------------------------------------
        const backgroundNode = new Node();
        contents.boundsProperty.link(()=>{
            const bounds = new Bounds2(-options.xMargin, -options.yMargin, contents.width + options.xMargin, contents.height + options.yMargin);
            backgroundNode.children = [
                new ShadedRectangle(bounds, {
                    baseColor: options.backgroundBaseColor,
                    tagName: 'div',
                    focusable: true
                })
            ];
        });
        options.children = [
            backgroundNode,
            contents
        ];
        super(options);
        // Put a red dot at the origin, for debugging layout.
        if (phet.chipper.queryParameters.dev) {
            this.addChild(new Circle(3, {
                fill: 'red'
            }));
        }
        const stopwatchVisibleListener = (visible)=>{
            if (visible) {
                this.moveToFront();
            } else {
                // interrupt user interactions when the stopwatch is made invisible
                this.interruptSubtreeInput();
            }
        };
        stopwatch.isVisibleProperty.link(stopwatchVisibleListener);
        // Move to the stopwatch's position
        const stopwatchPositionListener = (position)=>this.setTranslation(position);
        stopwatch.positionProperty.link(stopwatchPositionListener);
        this.dragListener = null;
        this.keyboardDragListener = null;
        let adjustedDragBoundsProperty = null;
        if (options.dragBoundsProperty) {
            // interactive highlights - adding a DragListener to make this interactive, enable highlights for mouse and touch
            this.interactiveHighlightEnabled = true;
            // Adjustment to keep the entire StopwatchNode inside the drag bounds.
            adjustedDragBoundsProperty = new DerivedProperty([
                this.boundsProperty,
                options.dragBoundsProperty
            ], (thisBounds, dragBounds)=>{
                // Get the origin in the parent coordinate frame, to determine our bounds offsets in that coordinate frame.
                // This way we'll properly handle scaling/rotation/etc.
                const targetOriginInParentCoordinates = this.localToParentPoint(Vector2.ZERO);
                return new Bounds2(dragBounds.minX - (thisBounds.minX - targetOriginInParentCoordinates.x), dragBounds.minY - (thisBounds.minY - targetOriginInParentCoordinates.y), dragBounds.maxX - (thisBounds.maxX - targetOriginInParentCoordinates.x), dragBounds.maxY - (thisBounds.maxY - targetOriginInParentCoordinates.y));
            }, {
                valueComparisonStrategy: 'equalsFunction' // Don't make spurious changes, we often won't be changing.
            });
            // interrupt user interactions when the visible bounds changes, such as a device orientation change or window resize
            options.dragBoundsProperty.link(()=>this.interruptSubtreeInput());
            // If the stopwatch is outside the drag bounds, move it inside.
            adjustedDragBoundsProperty.link((dragBounds)=>{
                if (!dragBounds.containsPoint(stopwatch.positionProperty.value)) {
                    stopwatch.positionProperty.value = dragBounds.closestPointTo(stopwatch.positionProperty.value);
                }
            });
            // dragging, added to background so that other UI components get input events on touch devices
            const dragListenerOptions = combineOptions({
                targetNode: this,
                positionProperty: stopwatch.positionProperty,
                dragBoundsProperty: adjustedDragBoundsProperty,
                tandem: options.tandem.createTandem('dragListener')
            }, options.dragListenerOptions);
            // Add moveToFront to any start function that the client provided.
            const optionsStart = dragListenerOptions.start;
            dragListenerOptions.start = (event, listener)=>{
                this.moveToFront();
                optionsStart(event, listener);
            };
            // Dragging, added to background so that other UI components get input events on touch devices.
            // If added to 'this', touchSnag will lock out listeners for other UI components.
            this.dragListener = new SoundDragListener(dragListenerOptions);
            backgroundNode.addInputListener(this.dragListener);
            const keyboardDragListenerOptions = combineOptions({
                positionProperty: stopwatch.positionProperty,
                dragBoundsProperty: adjustedDragBoundsProperty,
                tandem: options.tandem.createTandem('keyboardDragListener')
            }, options.keyboardDragListenerOptions);
            this.keyboardDragListener = new SoundKeyboardDragListener(keyboardDragListenerOptions);
            this.addInputListener(this.keyboardDragListener);
            // The group focus highlight makes it clear the stopwatch is highlighted even if the children are focused
            this.groupFocusHighlight = true;
            // Move to front on pointer down, anywhere on this Node, including interactive subcomponents.
            this.addInputListener({
                down: ()=>this.moveToFront()
            });
            backgroundNode.addInputListener({
                focus: ()=>this.moveToFront()
            });
        }
        this.addLinkedElement(stopwatch, {
            tandemName: 'stopwatch'
        });
        this.disposeStopwatchNode = ()=>{
            stopwatch.isVisibleProperty.unlink(stopwatchVisibleListener);
            stopwatch.positionProperty.unlink(stopwatchPositionListener);
            numberDisplay.dispose();
            if (this.dragListener) {
                backgroundNode.removeInputListener(this.dragListener);
                this.dragListener.dispose();
            }
            if (this.keyboardDragListener) {
                this.removeInputListener(this.keyboardDragListener);
                this.keyboardDragListener.dispose();
            }
            adjustedDragBoundsProperty && adjustedDragBoundsProperty.dispose();
            disposePlayPauseResetButtons && disposePlayPauseResetButtons();
        };
        this.numberDisplay = numberDisplay;
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'StopwatchNode', this);
    }
};
// We used to use Lucida Console, Arial, but Arial has smaller number width for "11" and hence was causing jitter.
// Neither Trebuchet MS and Lucida Grande is a monospace font, but the digits all appear to be monospace.
// Use Trebuchet first, since it has broader cross-platform support.
// Another advantage of using a non-monospace font (with monospace digits) is that the : and . symbols aren't as
// wide as the numerals. @ariel-phet and @samreid tested this combination of families on Mac/Chrome and Windows/Chrome
// and it seemed to work nicely, with no jitter.
StopwatchNode.NUMBER_FONT_FAMILY = '"Trebuchet MS", "Lucida Grande", monospace';
StopwatchNode.DEFAULT_FONT = new PhetFont({
    size: 20,
    family: StopwatchNode.NUMBER_FONT_FAMILY
});
/**
   * A value for options.numberDisplayOptions.numberFormatter where time is interpreted as minutes and seconds.
   * The format is MM:SS.CC, where M=minutes, S=seconds, C=centiseconds. The returned string is plain text, so all
   * digits will be the same size, and the client is responsible for setting the font size.
   */ StopwatchNode.PLAIN_TEXT_MINUTES_AND_SECONDS = (time)=>{
    const minutesAndSeconds = toMinutesAndSeconds(time);
    const centiseconds = StopwatchNode.getDecimalPlaces(time, 2);
    return minutesAndSeconds + centiseconds;
};
/**
   * A value for options.numberDisplayOptions.numberFormatter where time is interpreted as minutes and seconds.
   * The format is format MM:SS.cc, where M=minutes, S=seconds, c=centiseconds. The string returned is in RichText
   * format, with the 'c' digits in a smaller font.
   */ StopwatchNode.RICH_TEXT_MINUTES_AND_SECONDS = StopwatchNode.createRichTextNumberFormatter({
    showAsMinutesAndSeconds: true,
    numberOfDecimalPlaces: 2
});
export { StopwatchNode as default };
/**
 * Converts a time to a string in {{minutes}}:{{seconds}} format.
 */ function toMinutesAndSeconds(time) {
    // Round to the nearest centi-part (if time is in seconds, this would be centiseconds)
    // see https://github.com/phetsims/masses-and-springs/issues/156
    time = Utils.roundSymmetric(time * 100) / 100;
    // When showing units, don't show the "00:" prefix, see https://github.com/phetsims/scenery-phet/issues/378
    const timeInSeconds = time;
    // If no units are provided, then we assume the time is in seconds, and should be shown in mm:ss.cs
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds) % 60;
    const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutesString}:${secondsString}`;
}
sceneryPhet.register('StopwatchNode', StopwatchNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2hOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNob3dzIGEgcmVhZG91dCBvZiB0aGUgZWxhcHNlZCB0aW1lLCB3aXRoIHBsYXkgYW5kIHBhdXNlIGJ1dHRvbnMuICBCeSBkZWZhdWx0IHRoZXJlIGFyZSBubyB1bml0cyAod2hpY2ggY291bGQgYmUgdXNlZFxuICogaWYgYWxsIG9mIGEgc2ltdWxhdGlvbnMgdGltZSB1bml0cyBhcmUgaW4gJ3NlY29uZHMnKSwgb3IgeW91IGNhbiBzcGVjaWZ5IGEgc2VsZWN0aW9uIG9mIHVuaXRzIHRvIGNob29zZSBmcm9tLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIERyYWdMaXN0ZW5lciwgSEJveCwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nT3B0aW9ucywgS2V5Ym9hcmREcmFnTGlzdGVuZXIsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFRDb2xvciwgVkJveCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uLCB7IEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9Cb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24uanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBzaGFyZWRTb3VuZFBsYXllcnMgZnJvbSAnLi4vLi4vdGFtYm8vanMvc2hhcmVkU291bmRQbGF5ZXJzLmpzJztcbmltcG9ydCBUU291bmRQbGF5ZXIgZnJvbSAnLi4vLi4vdGFtYm8vanMvVFNvdW5kUGxheWVyLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgTnVtYmVyRGlzcGxheSwgeyBOdW1iZXJEaXNwbGF5T3B0aW9ucyB9IGZyb20gJy4vTnVtYmVyRGlzcGxheS5qcyc7XG5pbXBvcnQgUGF1c2VJY29uU2hhcGUgZnJvbSAnLi9QYXVzZUljb25TaGFwZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgUGxheUljb25TaGFwZSBmcm9tICcuL1BsYXlJY29uU2hhcGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5pbXBvcnQgU2hhZGVkUmVjdGFuZ2xlIGZyb20gJy4vU2hhZGVkUmVjdGFuZ2xlLmpzJztcbmltcG9ydCBTb3VuZERyYWdMaXN0ZW5lciwgeyBQcmVzc2VkU291bmREcmFnTGlzdGVuZXIsIFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucyB9IGZyb20gJy4vU291bmREcmFnTGlzdGVuZXIuanMnO1xuaW1wb3J0IFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIsIHsgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgfSBmcm9tICcuL1NvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIuanMnO1xuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuL1N0b3B3YXRjaC5qcyc7XG5pbXBvcnQgVVR1cm5BcnJvd1NoYXBlIGZyb20gJy4vVVR1cm5BcnJvd1NoYXBlLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICBjdXJzb3I/OiBzdHJpbmc7XG4gIG51bWJlckRpc3BsYXlSYW5nZT86IFJhbmdlOyAvLyB1c2VkIHRvIHNpemUgdGhlIE51bWJlckRpc3BsYXlcbiAgaWNvbkhlaWdodD86IG51bWJlcjtcbiAgaWNvbkZpbGw/OiBUQ29sb3I7XG4gIGljb25MaW5lV2lkdGg/OiBudW1iZXI7XG4gIGJhY2tncm91bmRCYXNlQ29sb3I/OiBUQ29sb3I7XG4gIGJ1dHRvbkJhc2VDb2xvcj86IFRDb2xvcjtcbiAgcmVzZXRCdXR0b25Tb3VuZFBsYXllcj86IFRTb3VuZFBsYXllcjtcbiAgeFNwYWNpbmc/OiBudW1iZXI7IC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiB0aGUgYnV0dG9uc1xuICB5U3BhY2luZz86IG51bWJlcjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiByZWFkb3V0IGFuZCBidXR0b25zXG4gIHhNYXJnaW4/OiBudW1iZXI7XG4gIHlNYXJnaW4/OiBudW1iZXI7XG5cbiAgbnVtYmVyRGlzcGxheU9wdGlvbnM/OiBOdW1iZXJEaXNwbGF5T3B0aW9ucztcblxuICAvLyBJZiBwcm92aWRlZCwgdGhlIHN0b3B3YXRjaCBpcyBkcmFnZ2FibGUgd2l0aGluIHRoZSBib3VuZHMuIElmIG51bGwsIHRoZSBzdG9wd2F0Y2ggaXMgbm90IGRyYWdnYWJsZS5cbiAgZHJhZ0JvdW5kc1Byb3BlcnR5PzogUHJvcGVydHk8Qm91bmRzMj4gfCBudWxsO1xuXG4gIC8vIG9wdGlvbnMgcHJvcGFnYXRlZCB0byB0aGUgZHJhZyBsaXN0ZW5lcnNcbiAgZHJhZ0xpc3RlbmVyT3B0aW9ucz86IFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucztcbiAga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zPzogU291bmRLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnM7XG5cbiAgLy8gUGFzc2VkIHRvIHRoZWlyIHJlc3BlY3RpdmUgYnV0dG9uc1xuICBwbGF5UGF1c2VCdXR0b25PcHRpb25zPzogQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucztcbiAgcmVzZXRCdXR0b25PcHRpb25zPzogUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucztcblxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvODQzXG4gIGluY2x1ZGVQbGF5UGF1c2VSZXNldEJ1dHRvbnM/OiBib29sZWFuO1xuXG4gIC8vIEFkZGl0aW9uYWwgY29udHJvbHMgdG8gc2hvdyBiZWxvdyB0aGUgcGxheS9wYXVzZS9yZXdpbmQgYnV0dG9ucyBpbiB0aGF0IFZCb3guXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy84NDNcbiAgb3RoZXJDb250cm9scz86IE5vZGVbXTtcbn07XG5cbnR5cGUgUGFyZW50T3B0aW9ucyA9IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xuZXhwb3J0IHR5cGUgU3RvcHdhdGNoTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8UGFyZW50T3B0aW9ucywgJ2NoaWxkcmVuJyB8ICdpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQnPjtcblxudHlwZSBGb3JtYXR0ZXJPcHRpb25zID0ge1xuXG4gIC8vIElmIHRydWUsIHRoZSB0aW1lIHZhbHVlIGlzIGNvbnZlcnRlZCB0byBtaW51dGVzIGFuZCBzZWNvbmRzLCBhbmQgdGhlIGZvcm1hdCBsb29rcyBsaWtlIDU5OjU5LjAwLlxuICAvLyBJZiBmYWxzZSwgdGltZSBpcyBmb3JtYXR0ZWQgYXMgYSBkZWNpbWFsIHZhbHVlLCBsaWtlIDEyMy40NVxuICBzaG93QXNNaW51dGVzQW5kU2Vjb25kcz86IGJvb2xlYW47XG4gIG51bWJlck9mRGVjaW1hbFBsYWNlcz86IG51bWJlcjtcbiAgYmlnTnVtYmVyRm9udD86IG51bWJlcjtcbiAgc21hbGxOdW1iZXJGb250PzogbnVtYmVyO1xuICB1bml0c0ZvbnQ/OiBudW1iZXI7XG4gIHVuaXRzPzogc3RyaW5nIHwgVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbiAgdmFsdWVVbml0c1BhdHRlcm4/OiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcHdhdGNoTm9kZSBleHRlbmRzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBOb2RlICkge1xuXG4gIC8vIG9wdGlvbnMgcHJvcGFnYXRlZCB0byB0aGUgTnVtYmVyRGlzcGxheVxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlckRpc3BsYXk6IE51bWJlckRpc3BsYXk7XG5cbiAgLy8gTm9uLW51bGwgaWYgZHJhZ2dhYmxlLiBDYW4gYmUgdXNlZCBmb3IgZm9yd2FyZGluZyBwcmVzcyBldmVudHMgd2hlbiBkcmFnZ2luZyBvdXQgb2YgYSB0b29sYm94LlxuICBwdWJsaWMgcmVhZG9ubHkgZHJhZ0xpc3RlbmVyOiBEcmFnTGlzdGVuZXIgfCBudWxsO1xuICBwdWJsaWMgcmVhZG9ubHkga2V5Ym9hcmREcmFnTGlzdGVuZXI6IEtleWJvYXJkRHJhZ0xpc3RlbmVyIHwgbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTdG9wd2F0Y2hOb2RlOiAoKSA9PiB2b2lkO1xuXG4gIC8vIFdlIHVzZWQgdG8gdXNlIEx1Y2lkYSBDb25zb2xlLCBBcmlhbCwgYnV0IEFyaWFsIGhhcyBzbWFsbGVyIG51bWJlciB3aWR0aCBmb3IgXCIxMVwiIGFuZCBoZW5jZSB3YXMgY2F1c2luZyBqaXR0ZXIuXG4gIC8vIE5laXRoZXIgVHJlYnVjaGV0IE1TIGFuZCBMdWNpZGEgR3JhbmRlIGlzIGEgbW9ub3NwYWNlIGZvbnQsIGJ1dCB0aGUgZGlnaXRzIGFsbCBhcHBlYXIgdG8gYmUgbW9ub3NwYWNlLlxuICAvLyBVc2UgVHJlYnVjaGV0IGZpcnN0LCBzaW5jZSBpdCBoYXMgYnJvYWRlciBjcm9zcy1wbGF0Zm9ybSBzdXBwb3J0LlxuICAvLyBBbm90aGVyIGFkdmFudGFnZSBvZiB1c2luZyBhIG5vbi1tb25vc3BhY2UgZm9udCAod2l0aCBtb25vc3BhY2UgZGlnaXRzKSBpcyB0aGF0IHRoZSA6IGFuZCAuIHN5bWJvbHMgYXJlbid0IGFzXG4gIC8vIHdpZGUgYXMgdGhlIG51bWVyYWxzLiBAYXJpZWwtcGhldCBhbmQgQHNhbXJlaWQgdGVzdGVkIHRoaXMgY29tYmluYXRpb24gb2YgZmFtaWxpZXMgb24gTWFjL0Nocm9tZSBhbmQgV2luZG93cy9DaHJvbWVcbiAgLy8gYW5kIGl0IHNlZW1lZCB0byB3b3JrIG5pY2VseSwgd2l0aCBubyBqaXR0ZXIuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTlVNQkVSX0ZPTlRfRkFNSUxZID0gJ1wiVHJlYnVjaGV0IE1TXCIsIFwiTHVjaWRhIEdyYW5kZVwiLCBtb25vc3BhY2UnO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDIwLCBmYW1pbHk6IFN0b3B3YXRjaE5vZGUuTlVNQkVSX0ZPTlRfRkFNSUxZIH0gKTtcblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3Igb3B0aW9ucy5udW1iZXJEaXNwbGF5T3B0aW9ucy5udW1iZXJGb3JtYXR0ZXIgd2hlcmUgdGltZSBpcyBpbnRlcnByZXRlZCBhcyBtaW51dGVzIGFuZCBzZWNvbmRzLlxuICAgKiBUaGUgZm9ybWF0IGlzIE1NOlNTLkNDLCB3aGVyZSBNPW1pbnV0ZXMsIFM9c2Vjb25kcywgQz1jZW50aXNlY29uZHMuIFRoZSByZXR1cm5lZCBzdHJpbmcgaXMgcGxhaW4gdGV4dCwgc28gYWxsXG4gICAqIGRpZ2l0cyB3aWxsIGJlIHRoZSBzYW1lIHNpemUsIGFuZCB0aGUgY2xpZW50IGlzIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nIHRoZSBmb250IHNpemUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBMQUlOX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyA9ICggdGltZTogbnVtYmVyICk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgbWludXRlc0FuZFNlY29uZHMgPSB0b01pbnV0ZXNBbmRTZWNvbmRzKCB0aW1lICk7XG4gICAgY29uc3QgY2VudGlzZWNvbmRzID0gU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCB0aW1lLCAyICk7XG4gICAgcmV0dXJuIG1pbnV0ZXNBbmRTZWNvbmRzICsgY2VudGlzZWNvbmRzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIHZhbHVlIGZvciBvcHRpb25zLm51bWJlckRpc3BsYXlPcHRpb25zLm51bWJlckZvcm1hdHRlciB3aGVyZSB0aW1lIGlzIGludGVycHJldGVkIGFzIG1pbnV0ZXMgYW5kIHNlY29uZHMuXG4gICAqIFRoZSBmb3JtYXQgaXMgZm9ybWF0IE1NOlNTLmNjLCB3aGVyZSBNPW1pbnV0ZXMsIFM9c2Vjb25kcywgYz1jZW50aXNlY29uZHMuIFRoZSBzdHJpbmcgcmV0dXJuZWQgaXMgaW4gUmljaFRleHRcbiAgICogZm9ybWF0LCB3aXRoIHRoZSAnYycgZGlnaXRzIGluIGEgc21hbGxlciBmb250LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBSSUNIX1RFWFRfTUlOVVRFU19BTkRfU0VDT05EUyA9IFN0b3B3YXRjaE5vZGUuY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHtcbiAgICBzaG93QXNNaW51dGVzQW5kU2Vjb25kczogdHJ1ZSxcbiAgICBudW1iZXJPZkRlY2ltYWxQbGFjZXM6IDJcbiAgfSApO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3RvcHdhdGNoOiBTdG9wd2F0Y2gsIHByb3ZpZGVkT3B0aW9ucz86IFN0b3B3YXRjaE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdG9wd2F0Y2hOb2RlT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3BsYXlQYXVzZUJ1dHRvbk9wdGlvbnMnIHwgJ3Jlc2V0QnV0dG9uT3B0aW9ucyc+LCBQYXJlbnRPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIG51bWJlckRpc3BsYXlSYW5nZTogU3RvcHdhdGNoLlpFUk9fVE9fQUxNT1NUX1NJWFRZLCAvLyBzaXplZCBmb3IgNTk6NTkuOTkgKG1tOnNzKSBvciAzNTk5Ljk5IChkZWNpbWFsKVxuICAgICAgaWNvbkhlaWdodDogMTAsXG4gICAgICBpY29uRmlsbDogJ2JsYWNrJyxcbiAgICAgIGljb25MaW5lV2lkdGg6IDEsXG4gICAgICBiYWNrZ3JvdW5kQmFzZUNvbG9yOiAncmdiKCA4MCwgMTMwLCAyMzAgKScsXG4gICAgICBidXR0b25CYXNlQ29sb3I6ICcjREZFMEUxJyxcbiAgICAgIHJlc2V0QnV0dG9uU291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdwdXNoQnV0dG9uJyApLFxuICAgICAgeFNwYWNpbmc6IDYsIC8vIGhvcml6b250YWwgc3BhY2UgYmV0d2VlbiB0aGUgYnV0dG9uc1xuICAgICAgeVNwYWNpbmc6IDYsIC8vIHZlcnRpY2FsIHNwYWNlIGJldHdlZW4gcmVhZG91dCBhbmQgYnV0dG9uc1xuICAgICAgeE1hcmdpbjogOCxcbiAgICAgIHlNYXJnaW46IDgsXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgICBudW1iZXJGb3JtYXR0ZXI6IFN0b3B3YXRjaE5vZGUuUklDSF9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMsXG4gICAgICAgIG51bWJlckZvcm1hdHRlckRlcGVuZGVuY2llczogW1xuXG4gICAgICAgICAgLy8gVXNlZCBpbiB0aGUgbnVtYmVyRm9ybWF0dGVyIGFib3ZlXG4gICAgICAgICAgU2NlbmVyeVBoZXRTdHJpbmdzLnN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHlcbiAgICAgICAgXSxcbiAgICAgICAgdXNlUmljaFRleHQ6IHRydWUsXG4gICAgICAgIHRleHRPcHRpb25zOiB7XG4gICAgICAgICAgZm9udDogU3RvcHdhdGNoTm9kZS5ERUZBVUxUX0ZPTlRcbiAgICAgICAgfSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGNvcm5lclJhZGl1czogNCxcbiAgICAgICAgeE1hcmdpbjogNCxcbiAgICAgICAgeU1hcmdpbjogMixcbiAgICAgICAgbWF4V2lkdGg6IDE1MCwgLy8gcGxlYXNlIG92ZXJyaWRlIGFzIG5lY2Vzc2FyeVxuICAgICAgICBwaWNrYWJsZTogZmFsc2UgLy8gYWxsb3cgZHJhZ2dpbmcgYnkgdGhlIG51bWJlciBkaXNwbGF5XG4gICAgICB9LFxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBudWxsLFxuICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9uczoge1xuICAgICAgICBzdGFydDogXy5ub29wXG4gICAgICB9LFxuICAgICAga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zOiB7fSxcblxuICAgICAgLy8gaGlnaGxpZ2h0IHdpbGwgb25seSBiZSB2aXNpYmxlIGlmIHRoZSBjb21wb25lbnQgaXMgaW50ZXJhY3RpdmUgKHByb3ZpZGUgZHJhZ0JvdW5kc1Byb3BlcnR5KVxuICAgICAgaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkOiBmYWxzZSxcblxuICAgICAgb3RoZXJDb250cm9sczogW10sXG5cbiAgICAgIGluY2x1ZGVQbGF5UGF1c2VSZXNldEJ1dHRvbnM6IHRydWUsXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHN0b3B3YXRjaC5pc1Zpc2libGVQcm9wZXJ0eSxcblxuICAgICAgLy8gVGFuZGVtIGlzIHJlcXVpcmVkIHRvIG1ha2Ugc3VyZSB0aGUgYnV0dG9ucyBhcmUgaW5zdHJ1bWVudGVkXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdtYXhWYWx1ZScgKSwgJ29wdGlvbnMubWF4VmFsdWUgbm8gbG9uZ2VyIHN1cHBvcnRlZCcgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMueFNwYWNpbmcgPj0gMCwgJ0J1dHRvbnMgY2Fubm90IG92ZXJsYXAnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy55U3BhY2luZyA+PSAwLCAnQnV0dG9ucyBjYW5ub3Qgb3ZlcmxhcCB0aGUgcmVhZG91dCcgKTtcblxuICAgIGNvbnN0IG51bWJlckRpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggc3RvcHdhdGNoLnRpbWVQcm9wZXJ0eSwgb3B0aW9ucy5udW1iZXJEaXNwbGF5UmFuZ2UsIG9wdGlvbnMubnVtYmVyRGlzcGxheU9wdGlvbnMgKTtcblxuICAgIGxldCBwbGF5UGF1c2VSZXNldEJ1dHRvbkNvbnRhaW5lcjogTm9kZSB8IG51bGwgPSBudWxsO1xuICAgIGxldCBkaXNwb3NlUGxheVBhdXNlUmVzZXRCdXR0b25zOiAoICgpID0+IHZvaWQgKSB8IG51bGwgPSBudWxsO1xuICAgIGlmICggb3B0aW9ucy5pbmNsdWRlUGxheVBhdXNlUmVzZXRCdXR0b25zICkge1xuXG4gICAgICAvLyBCdXR0b25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgICAgY29uc3QgcmVzZXRQYXRoID0gbmV3IFBhdGgoIG5ldyBVVHVybkFycm93U2hhcGUoIG9wdGlvbnMuaWNvbkhlaWdodCApLCB7XG4gICAgICAgIGZpbGw6IG9wdGlvbnMuaWNvbkZpbGxcbiAgICAgIH0gKTtcblxuICAgICAgY29uc3QgcGxheUljb25IZWlnaHQgPSByZXNldFBhdGguaGVpZ2h0O1xuICAgICAgY29uc3QgcGxheUljb25XaWR0aCA9IDAuOCAqIHBsYXlJY29uSGVpZ2h0O1xuICAgICAgY29uc3QgcGxheVBhdGggPSBuZXcgUGF0aCggbmV3IFBsYXlJY29uU2hhcGUoIHBsYXlJY29uV2lkdGgsIHBsYXlJY29uSGVpZ2h0ICksIHtcbiAgICAgICAgZmlsbDogb3B0aW9ucy5pY29uRmlsbFxuICAgICAgfSApO1xuXG4gICAgICBjb25zdCBwYXVzZVBhdGggPSBuZXcgUGF0aCggbmV3IFBhdXNlSWNvblNoYXBlKCAwLjc1ICogcGxheUljb25XaWR0aCwgcGxheUljb25IZWlnaHQgKSwge1xuICAgICAgICBmaWxsOiBvcHRpb25zLmljb25GaWxsXG4gICAgICB9ICk7XG5cbiAgICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b24oIHN0b3B3YXRjaC5pc1J1bm5pbmdQcm9wZXJ0eSwgcGF1c2VQYXRoLCBwbGF5UGF0aCxcbiAgICAgICAgY29tYmluZU9wdGlvbnM8Qm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucz4oIHtcbiAgICAgICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFzZUNvbG9yLFxuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcbiAgICAgICAgICB0b3VjaEFyZWFYU2hpZnQ6IDUsXG4gICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA4LFxuICAgICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncGxheVBhdXNlQnV0dG9uJyApLFxuICAgICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXG4gICAgICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxuICAgICAgICB9LCBvcHRpb25zLnBsYXlQYXVzZUJ1dHRvbk9wdGlvbnMgKSApO1xuXG4gICAgICBjb25zdCByZXNldEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIGNvbWJpbmVPcHRpb25zPFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgICAgc3RvcHdhdGNoLmlzUnVubmluZ1Byb3BlcnR5LnNldCggZmFsc2UgKTtcbiAgICAgICAgICBzdG9wd2F0Y2gudGltZVByb3BlcnR5LnNldCggMCApO1xuICAgICAgICB9LFxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXG4gICAgICAgIHRvdWNoQXJlYVhTaGlmdDogLTUsXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogOCxcbiAgICAgICAgY29udGVudDogcmVzZXRQYXRoLFxuICAgICAgICBiYXNlQ29sb3I6IG9wdGlvbnMuYnV0dG9uQmFzZUNvbG9yLFxuICAgICAgICBzb3VuZFBsYXllcjogb3B0aW9ucy5yZXNldEJ1dHRvblNvdW5kUGxheWVyLFxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QnV0dG9uJyApLFxuICAgICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlLFxuICAgICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlXG4gICAgICB9LCBvcHRpb25zLnJlc2V0QnV0dG9uT3B0aW9ucyApICk7XG5cbiAgICAgIHBsYXlQYXVzZVJlc2V0QnV0dG9uQ29udGFpbmVyID0gbmV3IEhCb3goIHtcbiAgICAgICAgc3BhY2luZzogb3B0aW9ucy54U3BhY2luZyxcbiAgICAgICAgY2hpbGRyZW46IFsgcmVzZXRCdXR0b24sIHBsYXlQYXVzZUJ1dHRvbiBdXG4gICAgICB9ICk7XG5cbiAgICAgIC8vIERpc2FibGUgdGhlIHJlc2V0IGJ1dHRvbiB3aGVuIHRpbWUgaXMgemVybywgYW5kIGVuYWJsZSB0aGUgcGxheS9wYXVzZSBidXR0b24gd2hlbiBub3QgYXQgdGhlIG1heCB0aW1lXG4gICAgICBjb25zdCB0aW1lTGlzdGVuZXIgPSAoIHRpbWU6IG51bWJlciApID0+IHtcbiAgICAgICAgcmVzZXRCdXR0b24uZW5hYmxlZCA9ICggdGltZSA+IDAgKTtcbiAgICAgICAgcGxheVBhdXNlQnV0dG9uLmVuYWJsZWQgPSAoIHRpbWUgPCBzdG9wd2F0Y2gudGltZVByb3BlcnR5LnJhbmdlLm1heCApO1xuICAgICAgfTtcbiAgICAgIHN0b3B3YXRjaC50aW1lUHJvcGVydHkubGluayggdGltZUxpc3RlbmVyICk7XG5cbiAgICAgIGRpc3Bvc2VQbGF5UGF1c2VSZXNldEJ1dHRvbnMgPSAoKSA9PiB7XG4gICAgICAgIHN0b3B3YXRjaC50aW1lUHJvcGVydHkudW5saW5rKCB0aW1lTGlzdGVuZXIgKTtcbiAgICAgICAgcmVzZXRCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgICBwbGF5UGF1c2VCdXR0b24uZGlzcG9zZSgpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50cyA9IG5ldyBWQm94KCB7XG4gICAgICBzcGFjaW5nOiBvcHRpb25zLnlTcGFjaW5nLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbnVtYmVyRGlzcGxheSxcblxuICAgICAgICAvLyBJbmNsdWRlIHRoZSBwbGF5L3BhdXNlIGFuZCByZXNldCBidXR0b25zIGlmIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9uc1xuICAgICAgICAuLi4oIHBsYXlQYXVzZVJlc2V0QnV0dG9uQ29udGFpbmVyID8gWyBwbGF5UGF1c2VSZXNldEJ1dHRvbkNvbnRhaW5lciBdIDogW10gKSxcblxuICAgICAgICAvLyBJbmNsdWRlIGFueSBhZGRpdGlvbmFsIGNvbnRyb2xzIGFzIHNwZWNpZmllZFxuICAgICAgICAuLi5vcHRpb25zLm90aGVyQ29udHJvbHNcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyBCYWNrZ3JvdW5kIHBhbmVsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IE5vZGUoKTtcblxuICAgIGNvbnRlbnRzLmJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIGNvbnN0IGJvdW5kcyA9IG5ldyBCb3VuZHMyKFxuICAgICAgICAtb3B0aW9ucy54TWFyZ2luLFxuICAgICAgICAtb3B0aW9ucy55TWFyZ2luLFxuICAgICAgICBjb250ZW50cy53aWR0aCArIG9wdGlvbnMueE1hcmdpbixcbiAgICAgICAgY29udGVudHMuaGVpZ2h0ICsgb3B0aW9ucy55TWFyZ2luXG4gICAgICApO1xuXG4gICAgICBiYWNrZ3JvdW5kTm9kZS5jaGlsZHJlbiA9IFtcbiAgICAgICAgbmV3IFNoYWRlZFJlY3RhbmdsZSggYm91bmRzLCB7XG4gICAgICAgICAgYmFzZUNvbG9yOiBvcHRpb25zLmJhY2tncm91bmRCYXNlQ29sb3IsXG4gICAgICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICAgICAgZm9jdXNhYmxlOiB0cnVlXG4gICAgICAgIH0gKVxuICAgICAgXTtcbiAgICB9ICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgY29udGVudHMgXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBQdXQgYSByZWQgZG90IGF0IHRoZSBvcmlnaW4sIGZvciBkZWJ1Z2dpbmcgbGF5b3V0LlxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCAzLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3B3YXRjaFZpc2libGVMaXN0ZW5lciA9ICggdmlzaWJsZTogYm9vbGVhbiApID0+IHtcbiAgICAgIGlmICggdmlzaWJsZSApIHtcbiAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gaW50ZXJydXB0IHVzZXIgaW50ZXJhY3Rpb25zIHdoZW4gdGhlIHN0b3B3YXRjaCBpcyBtYWRlIGludmlzaWJsZVxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgc3RvcHdhdGNoLmlzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHN0b3B3YXRjaFZpc2libGVMaXN0ZW5lciApO1xuXG4gICAgLy8gTW92ZSB0byB0aGUgc3RvcHdhdGNoJ3MgcG9zaXRpb25cbiAgICBjb25zdCBzdG9wd2F0Y2hQb3NpdGlvbkxpc3RlbmVyID0gKCBwb3NpdGlvbjogVmVjdG9yMiApID0+IHRoaXMuc2V0VHJhbnNsYXRpb24oIHBvc2l0aW9uICk7XG4gICAgc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHkubGluayggc3RvcHdhdGNoUG9zaXRpb25MaXN0ZW5lciApO1xuXG4gICAgdGhpcy5kcmFnTGlzdGVuZXIgPSBudWxsO1xuICAgIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBudWxsO1xuXG4gICAgbGV0IGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPiB8IG51bGwgPSBudWxsO1xuICAgIGlmICggb3B0aW9ucy5kcmFnQm91bmRzUHJvcGVydHkgKSB7XG5cbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodHMgLSBhZGRpbmcgYSBEcmFnTGlzdGVuZXIgdG8gbWFrZSB0aGlzIGludGVyYWN0aXZlLCBlbmFibGUgaGlnaGxpZ2h0cyBmb3IgbW91c2UgYW5kIHRvdWNoXG4gICAgICB0aGlzLmludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCA9IHRydWU7XG5cbiAgICAgIC8vIEFkanVzdG1lbnQgdG8ga2VlcCB0aGUgZW50aXJlIFN0b3B3YXRjaE5vZGUgaW5zaWRlIHRoZSBkcmFnIGJvdW5kcy5cbiAgICAgIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcbiAgICAgICAgWyB0aGlzLmJvdW5kc1Byb3BlcnR5LCBvcHRpb25zLmRyYWdCb3VuZHNQcm9wZXJ0eSBdLFxuICAgICAgICAoIHRoaXNCb3VuZHMsIGRyYWdCb3VuZHMgKSA9PiB7XG5cbiAgICAgICAgICAvLyBHZXQgdGhlIG9yaWdpbiBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUsIHRvIGRldGVybWluZSBvdXIgYm91bmRzIG9mZnNldHMgaW4gdGhhdCBjb29yZGluYXRlIGZyYW1lLlxuICAgICAgICAgIC8vIFRoaXMgd2F5IHdlJ2xsIHByb3Blcmx5IGhhbmRsZSBzY2FsaW5nL3JvdGF0aW9uL2V0Yy5cbiAgICAgICAgICBjb25zdCB0YXJnZXRPcmlnaW5JblBhcmVudENvb3JkaW5hdGVzID0gdGhpcy5sb2NhbFRvUGFyZW50UG9pbnQoIFZlY3RvcjIuWkVSTyApO1xuXG4gICAgICAgICAgcmV0dXJuIG5ldyBCb3VuZHMyKFxuICAgICAgICAgICAgZHJhZ0JvdW5kcy5taW5YIC0gKCB0aGlzQm91bmRzLm1pblggLSB0YXJnZXRPcmlnaW5JblBhcmVudENvb3JkaW5hdGVzLnggKSxcbiAgICAgICAgICAgIGRyYWdCb3VuZHMubWluWSAtICggdGhpc0JvdW5kcy5taW5ZIC0gdGFyZ2V0T3JpZ2luSW5QYXJlbnRDb29yZGluYXRlcy55ICksXG4gICAgICAgICAgICBkcmFnQm91bmRzLm1heFggLSAoIHRoaXNCb3VuZHMubWF4WCAtIHRhcmdldE9yaWdpbkluUGFyZW50Q29vcmRpbmF0ZXMueCApLFxuICAgICAgICAgICAgZHJhZ0JvdW5kcy5tYXhZIC0gKCB0aGlzQm91bmRzLm1heFkgLSB0YXJnZXRPcmlnaW5JblBhcmVudENvb3JkaW5hdGVzLnkgKVxuICAgICAgICAgICk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyAvLyBEb24ndCBtYWtlIHNwdXJpb3VzIGNoYW5nZXMsIHdlIG9mdGVuIHdvbid0IGJlIGNoYW5naW5nLlxuICAgICAgICB9ICk7XG5cbiAgICAgIC8vIGludGVycnVwdCB1c2VyIGludGVyYWN0aW9ucyB3aGVuIHRoZSB2aXNpYmxlIGJvdW5kcyBjaGFuZ2VzLCBzdWNoIGFzIGEgZGV2aWNlIG9yaWVudGF0aW9uIGNoYW5nZSBvciB3aW5kb3cgcmVzaXplXG4gICAgICBvcHRpb25zLmRyYWdCb3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpICk7XG5cbiAgICAgIC8vIElmIHRoZSBzdG9wd2F0Y2ggaXMgb3V0c2lkZSB0aGUgZHJhZyBib3VuZHMsIG1vdmUgaXQgaW5zaWRlLlxuICAgICAgYWRqdXN0ZWREcmFnQm91bmRzUHJvcGVydHkubGluayggZHJhZ0JvdW5kcyA9PiB7XG4gICAgICAgIGlmICggIWRyYWdCb3VuZHMuY29udGFpbnNQb2ludCggc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSApIHtcbiAgICAgICAgICBzdG9wd2F0Y2gucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGRyYWdCb3VuZHMuY2xvc2VzdFBvaW50VG8oIHN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgLy8gZHJhZ2dpbmcsIGFkZGVkIHRvIGJhY2tncm91bmQgc28gdGhhdCBvdGhlciBVSSBjb21wb25lbnRzIGdldCBpbnB1dCBldmVudHMgb24gdG91Y2ggZGV2aWNlc1xuICAgICAgY29uc3QgZHJhZ0xpc3RlbmVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucz4oIHtcbiAgICAgICAgdGFyZ2V0Tm9kZTogdGhpcyxcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHksXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogYWRqdXN0ZWREcmFnQm91bmRzUHJvcGVydHksXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXG4gICAgICB9LCBvcHRpb25zLmRyYWdMaXN0ZW5lck9wdGlvbnMgKTtcblxuICAgICAgLy8gQWRkIG1vdmVUb0Zyb250IHRvIGFueSBzdGFydCBmdW5jdGlvbiB0aGF0IHRoZSBjbGllbnQgcHJvdmlkZWQuXG4gICAgICBjb25zdCBvcHRpb25zU3RhcnQgPSBkcmFnTGlzdGVuZXJPcHRpb25zLnN0YXJ0ITtcbiAgICAgIGRyYWdMaXN0ZW5lck9wdGlvbnMuc3RhcnQgPSAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQsIGxpc3RlbmVyOiBQcmVzc2VkU291bmREcmFnTGlzdGVuZXIgKSA9PiB7XG4gICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcbiAgICAgICAgb3B0aW9uc1N0YXJ0KCBldmVudCwgbGlzdGVuZXIgKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIERyYWdnaW5nLCBhZGRlZCB0byBiYWNrZ3JvdW5kIHNvIHRoYXQgb3RoZXIgVUkgY29tcG9uZW50cyBnZXQgaW5wdXQgZXZlbnRzIG9uIHRvdWNoIGRldmljZXMuXG4gICAgICAvLyBJZiBhZGRlZCB0byAndGhpcycsIHRvdWNoU25hZyB3aWxsIGxvY2sgb3V0IGxpc3RlbmVycyBmb3Igb3RoZXIgVUkgY29tcG9uZW50cy5cbiAgICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbmV3IFNvdW5kRHJhZ0xpc3RlbmVyKCBkcmFnTGlzdGVuZXJPcHRpb25zICk7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmRyYWdMaXN0ZW5lciApO1xuXG4gICAgICBjb25zdCBrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz4oIHtcbiAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHksXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogYWRqdXN0ZWREcmFnQm91bmRzUHJvcGVydHksXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAna2V5Ym9hcmREcmFnTGlzdGVuZXInIClcbiAgICAgIH0sIG9wdGlvbnMua2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zICk7XG5cbiAgICAgIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lcigga2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zICk7XG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIgKTtcblxuICAgICAgLy8gVGhlIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCBtYWtlcyBpdCBjbGVhciB0aGUgc3RvcHdhdGNoIGlzIGhpZ2hsaWdodGVkIGV2ZW4gaWYgdGhlIGNoaWxkcmVuIGFyZSBmb2N1c2VkXG4gICAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHQgPSB0cnVlO1xuXG4gICAgICAvLyBNb3ZlIHRvIGZyb250IG9uIHBvaW50ZXIgZG93biwgYW55d2hlcmUgb24gdGhpcyBOb2RlLCBpbmNsdWRpbmcgaW50ZXJhY3RpdmUgc3ViY29tcG9uZW50cy5cbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgICBkb3duOiAoKSA9PiB0aGlzLm1vdmVUb0Zyb250KClcbiAgICAgIH0gKTtcbiAgICAgIGJhY2tncm91bmROb2RlLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgICAgZm9jdXM6ICgpID0+IHRoaXMubW92ZVRvRnJvbnQoKVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggc3RvcHdhdGNoLCB7XG4gICAgICB0YW5kZW1OYW1lOiAnc3RvcHdhdGNoJ1xuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZVN0b3B3YXRjaE5vZGUgPSAoKSA9PiB7XG4gICAgICBzdG9wd2F0Y2guaXNWaXNpYmxlUHJvcGVydHkudW5saW5rKCBzdG9wd2F0Y2hWaXNpYmxlTGlzdGVuZXIgKTtcbiAgICAgIHN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnVubGluayggc3RvcHdhdGNoUG9zaXRpb25MaXN0ZW5lciApO1xuXG4gICAgICBudW1iZXJEaXNwbGF5LmRpc3Bvc2UoKTtcblxuICAgICAgaWYgKCB0aGlzLmRyYWdMaXN0ZW5lciApIHtcbiAgICAgICAgYmFja2dyb3VuZE5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggdGhpcy5kcmFnTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLmtleWJvYXJkRHJhZ0xpc3RlbmVyICkge1xuICAgICAgICB0aGlzLnJlbW92ZUlucHV0TGlzdGVuZXIoIHRoaXMua2V5Ym9hcmREcmFnTGlzdGVuZXIgKTtcbiAgICAgICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5ICYmIGFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIGRpc3Bvc2VQbGF5UGF1c2VSZXNldEJ1dHRvbnMgJiYgZGlzcG9zZVBsYXlQYXVzZVJlc2V0QnV0dG9ucygpO1xuICAgIH07XG5cbiAgICB0aGlzLm51bWJlckRpc3BsYXkgPSBudW1iZXJEaXNwbGF5O1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdTdG9wd2F0Y2hOb2RlJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlU3RvcHdhdGNoTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjZW50aXNlY29uZHMgKGh1bmRyZWR0aHMtb2YtYS1zZWNvbmQpIHN0cmluZyBmb3IgYSB0aW1lIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBnZXREZWNpbWFsUGxhY2VzKCB0aW1lOiBudW1iZXIsIG51bWJlckRlY2ltYWxQbGFjZXM6IG51bWJlciApOiBzdHJpbmcge1xuXG4gICAgY29uc3QgbWF4ID0gTWF0aC5wb3coIDEwLCBudW1iZXJEZWNpbWFsUGxhY2VzICk7XG5cbiAgICAvLyBSb3VuZCB0byB0aGUgbmVhcmVzdCBjZW50aXNlY29uZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tYXNzZXMtYW5kLXNwcmluZ3MvaXNzdWVzLzE1NlxuICAgIHRpbWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGltZSAqIG1heCApIC8gbWF4O1xuXG4gICAgLy8gUm91bmRpbmcgYWZ0ZXIgbW9kLCBpbiBjYXNlIHRoZXJlIGlzIGZsb2F0aW5nLXBvaW50IGVycm9yXG4gICAgbGV0IGRlY2ltYWxWYWx1ZSA9IGAke1V0aWxzLnJvdW5kU3ltbWV0cmljKCB0aW1lICUgMSAqIG1heCApfWA7XG4gICAgd2hpbGUgKCBkZWNpbWFsVmFsdWUubGVuZ3RoIDwgbnVtYmVyRGVjaW1hbFBsYWNlcyApIHtcbiAgICAgIGRlY2ltYWxWYWx1ZSA9IGAwJHtkZWNpbWFsVmFsdWV9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAuJHtkZWNpbWFsVmFsdWV9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY3VzdG9tIHZhbHVlIGZvciBvcHRpb25zLm51bWJlckRpc3BsYXlPcHRpb25zLm51bWJlckZvcm1hdHRlciwgcGFzc2VkIHRvIE51bWJlckRpc3BsYXkuIFdoZW4gdXNpbmdcbiAgICogdGhpcyBtZXRob2QsIHlvdSB3aWxsIGFsc28gbmVlZCB0byB1c2UgTnVtYmVyRGlzcGxheU9wdGlvbnMubnVtYmVyRm9ybWF0dGVyRGVwZW5kZW5jaWVzLCB0byB0ZWxsIE51bWJlckRpc3BsYXlcbiAgICogYWJvdXQgdGhlIGRlcGVuZGVuY2llcyBoZXJlaW4uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy83ODEuXG4gICAqIFRoaXMgd2lsbCB0eXBpY2FsbHkgYmUgc29tZXRoaW5nIGxpa2U6XG4gICAqXG4gICAqIG51bWJlckZvcm1hdHRlcjogU3RvcHdhdGNoTm9kZS5jcmVhdGVSaWNoVGV4dE51bWJlckZvcm1hdHRlcigge1xuICAgKiAgIHVuaXRzOiB1bml0c1Byb3BlcnR5LFxuICAgKiAgIC4uLlxuICAgKiB9ICksXG4gICAqIG51bWJlckZvcm1hdHRlckRlcGVuZGVuY2llczogW1xuICAgKiAgIFNjZW5lcnlQaGV0U3RyaW5ncy5zdG9wd2F0Y2hWYWx1ZVVuaXRzUGF0dGVyblN0cmluZ1Byb3BlcnR5LFxuICAgKiAgIHVuaXRzUHJvcGVydHlcbiAgICogXSxcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHByb3ZpZGVkT3B0aW9ucz86IEZvcm1hdHRlck9wdGlvbnMgKTogKCB0aW1lOiBudW1iZXIgKSA9PiBzdHJpbmcge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGb3JtYXR0ZXJPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIElmIHRydWUsIHRoZSB0aW1lIHZhbHVlIGlzIGNvbnZlcnRlZCB0byBtaW51dGVzIGFuZCBzZWNvbmRzLCBhbmQgdGhlIGZvcm1hdCBsb29rcyBsaWtlIDU5OjU5LjAwLlxuICAgICAgLy8gSWYgZmFsc2UsIHRpbWUgaXMgZm9ybWF0dGVkIGFzIGEgZGVjaW1hbCB2YWx1ZSwgbGlrZSAxMjMuNDVcbiAgICAgIHNob3dBc01pbnV0ZXNBbmRTZWNvbmRzOiB0cnVlLFxuICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiAyLFxuICAgICAgYmlnTnVtYmVyRm9udDogMjAsXG4gICAgICBzbWFsbE51bWJlckZvbnQ6IDE0LFxuICAgICAgdW5pdHNGb250OiAxNCxcbiAgICAgIHVuaXRzOiAnJyxcblxuICAgICAgLy8gVW5pdHMgY2Fubm90IGJlIGJha2VkIGludG8gdGhlIGkxOG4gc3RyaW5nIGJlY2F1c2UgdGhleSBjYW4gY2hhbmdlIGluZGVwZW5kZW50bHlcbiAgICAgIHZhbHVlVW5pdHNQYXR0ZXJuOiBTY2VuZXJ5UGhldFN0cmluZ3Muc3RvcHdhdGNoVmFsdWVVbml0c1BhdHRlcm5TdHJpbmdQcm9wZXJ0eVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgcmV0dXJuICggdGltZTogbnVtYmVyICkgPT4ge1xuICAgICAgY29uc3QgbWludXRlc0FuZFNlY29uZHMgPSBvcHRpb25zLnNob3dBc01pbnV0ZXNBbmRTZWNvbmRzID8gdG9NaW51dGVzQW5kU2Vjb25kcyggdGltZSApIDogTWF0aC5mbG9vciggdGltZSApO1xuICAgICAgY29uc3QgY2VudGlzZWNvbmRzID0gU3RvcHdhdGNoTm9kZS5nZXREZWNpbWFsUGxhY2VzKCB0aW1lLCBvcHRpb25zLm51bWJlck9mRGVjaW1hbFBsYWNlcyApO1xuICAgICAgY29uc3QgdW5pdHMgPSAoIHR5cGVvZiBvcHRpb25zLnVuaXRzID09PSAnc3RyaW5nJyApID8gb3B0aW9ucy51bml0cyA6IG9wdGlvbnMudW5pdHMudmFsdWU7XG5cbiAgICAgIGNvbnN0IGZvbnRTaXplID0gYCR7b3B0aW9ucy5zbWFsbE51bWJlckZvbnR9cHhgO1xuXG4gICAgICAvLyBTaW5nbGUgcXVvdGVzIGFyb3VuZCBDU1Mgc3R5bGUgc28gdGhlIGRvdWJsZS1xdW90ZXMgaW4gdGhlIENTUyBmb250IGZhbWlseSB3b3JrLiBIaW1hbGF5YSBkb2Vzbid0IGxpa2UgJnF1b3Q7XG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NvbGxpc2lvbi1sYWIvaXNzdWVzLzE0MC5cbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIG9wdGlvbnMudmFsdWVVbml0c1BhdHRlcm4sIHtcbiAgICAgICAgdmFsdWU6IGA8c3BhbiBzdHlsZT0nZm9udC1zaXplOiAke29wdGlvbnMuYmlnTnVtYmVyRm9udH1weDsgZm9udC1mYW1pbHk6JHtTdG9wd2F0Y2hOb2RlLk5VTUJFUl9GT05UX0ZBTUlMWX07Jz4ke21pbnV0ZXNBbmRTZWNvbmRzfTwvc3Bhbj48c3BhbiBzdHlsZT0nZm9udC1zaXplOiAke2ZvbnRTaXplfTtmb250LWZhbWlseToke1N0b3B3YXRjaE5vZGUuTlVNQkVSX0ZPTlRfRkFNSUxZfTsnPiR7Y2VudGlzZWNvbmRzfTwvc3Bhbj5gLFxuICAgICAgICB1bml0czogYDxzcGFuIHN0eWxlPSdmb250LXNpemU6ICR7b3B0aW9ucy51bml0c0ZvbnR9cHg7IGZvbnQtZmFtaWx5OiR7U3RvcHdhdGNoTm9kZS5OVU1CRVJfRk9OVF9GQU1JTFl9Oyc+JHt1bml0c308L3NwYW4+YFxuICAgICAgfSApO1xuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHRpbWUgdG8gYSBzdHJpbmcgaW4ge3ttaW51dGVzfX06e3tzZWNvbmRzfX0gZm9ybWF0LlxuICovXG5mdW5jdGlvbiB0b01pbnV0ZXNBbmRTZWNvbmRzKCB0aW1lOiBudW1iZXIgKTogc3RyaW5nIHtcblxuICAvLyBSb3VuZCB0byB0aGUgbmVhcmVzdCBjZW50aS1wYXJ0IChpZiB0aW1lIGlzIGluIHNlY29uZHMsIHRoaXMgd291bGQgYmUgY2VudGlzZWNvbmRzKVxuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21hc3Nlcy1hbmQtc3ByaW5ncy9pc3N1ZXMvMTU2XG4gIHRpbWUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdGltZSAqIDEwMCApIC8gMTAwO1xuXG4gIC8vIFdoZW4gc2hvd2luZyB1bml0cywgZG9uJ3Qgc2hvdyB0aGUgXCIwMDpcIiBwcmVmaXgsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8zNzhcbiAgY29uc3QgdGltZUluU2Vjb25kcyA9IHRpbWU7XG5cbiAgLy8gSWYgbm8gdW5pdHMgYXJlIHByb3ZpZGVkLCB0aGVuIHdlIGFzc3VtZSB0aGUgdGltZSBpcyBpbiBzZWNvbmRzLCBhbmQgc2hvdWxkIGJlIHNob3duIGluIG1tOnNzLmNzXG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKCB0aW1lSW5TZWNvbmRzIC8gNjAgKTtcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IoIHRpbWVJblNlY29uZHMgKSAlIDYwO1xuXG4gIGNvbnN0IG1pbnV0ZXNTdHJpbmcgPSAoIG1pbnV0ZXMgPCAxMCApID8gYDAke21pbnV0ZXN9YCA6IGAke21pbnV0ZXN9YDtcbiAgY29uc3Qgc2Vjb25kc1N0cmluZyA9ICggc2Vjb25kcyA8IDEwICkgPyBgMCR7c2Vjb25kc31gIDogYCR7c2Vjb25kc31gO1xuICByZXR1cm4gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfWA7XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnU3RvcHdhdGNoTm9kZScsIFN0b3B3YXRjaE5vZGUgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwiQm91bmRzMiIsIlV0aWxzIiwiVmVjdG9yMiIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0cmluZ1V0aWxzIiwiQ2lyY2xlIiwiSEJveCIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiTm9kZSIsIlBhdGgiLCJWQm94IiwiQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwic2hhcmVkU291bmRQbGF5ZXJzIiwiVGFuZGVtIiwiTnVtYmVyRGlzcGxheSIsIlBhdXNlSWNvblNoYXBlIiwiUGhldEZvbnQiLCJQbGF5SWNvblNoYXBlIiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJTaGFkZWRSZWN0YW5nbGUiLCJTb3VuZERyYWdMaXN0ZW5lciIsIlNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJTdG9wd2F0Y2giLCJVVHVybkFycm93U2hhcGUiLCJTdG9wd2F0Y2hOb2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VTdG9wd2F0Y2hOb2RlIiwiZ2V0RGVjaW1hbFBsYWNlcyIsInRpbWUiLCJudW1iZXJEZWNpbWFsUGxhY2VzIiwibWF4IiwiTWF0aCIsInBvdyIsInJvdW5kU3ltbWV0cmljIiwiZGVjaW1hbFZhbHVlIiwibGVuZ3RoIiwiY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2hvd0FzTWludXRlc0FuZFNlY29uZHMiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJiaWdOdW1iZXJGb250Iiwic21hbGxOdW1iZXJGb250IiwidW5pdHNGb250IiwidW5pdHMiLCJ2YWx1ZVVuaXRzUGF0dGVybiIsInN0b3B3YXRjaFZhbHVlVW5pdHNQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJtaW51dGVzQW5kU2Vjb25kcyIsInRvTWludXRlc0FuZFNlY29uZHMiLCJmbG9vciIsImNlbnRpc2Vjb25kcyIsInZhbHVlIiwiZm9udFNpemUiLCJmaWxsSW4iLCJOVU1CRVJfRk9OVF9GQU1JTFkiLCJzdG9wd2F0Y2giLCJ3aW5kb3ciLCJjdXJzb3IiLCJudW1iZXJEaXNwbGF5UmFuZ2UiLCJaRVJPX1RPX0FMTU9TVF9TSVhUWSIsImljb25IZWlnaHQiLCJpY29uRmlsbCIsImljb25MaW5lV2lkdGgiLCJiYWNrZ3JvdW5kQmFzZUNvbG9yIiwiYnV0dG9uQmFzZUNvbG9yIiwicmVzZXRCdXR0b25Tb3VuZFBsYXllciIsImdldCIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJ4TWFyZ2luIiwieU1hcmdpbiIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwibnVtYmVyRm9ybWF0dGVyIiwiUklDSF9URVhUX01JTlVURVNfQU5EX1NFQ09ORFMiLCJudW1iZXJGb3JtYXR0ZXJEZXBlbmRlbmNpZXMiLCJ1c2VSaWNoVGV4dCIsInRleHRPcHRpb25zIiwiZm9udCIsIkRFRkFVTFRfRk9OVCIsImFsaWduIiwiY29ybmVyUmFkaXVzIiwibWF4V2lkdGgiLCJwaWNrYWJsZSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsImRyYWdMaXN0ZW5lck9wdGlvbnMiLCJzdGFydCIsIl8iLCJub29wIiwia2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwib3RoZXJDb250cm9scyIsImluY2x1ZGVQbGF5UGF1c2VSZXNldEJ1dHRvbnMiLCJ2aXNpYmxlUHJvcGVydHkiLCJpc1Zpc2libGVQcm9wZXJ0eSIsInRhbmRlbSIsIlJFUVVJUkVEIiwicGhldGlvRmVhdHVyZWQiLCJhc3NlcnQiLCJoYXNPd25Qcm9wZXJ0eSIsIm51bWJlckRpc3BsYXkiLCJ0aW1lUHJvcGVydHkiLCJwbGF5UGF1c2VSZXNldEJ1dHRvbkNvbnRhaW5lciIsImRpc3Bvc2VQbGF5UGF1c2VSZXNldEJ1dHRvbnMiLCJyZXNldFBhdGgiLCJmaWxsIiwicGxheUljb25IZWlnaHQiLCJoZWlnaHQiLCJwbGF5SWNvbldpZHRoIiwicGxheVBhdGgiLCJwYXVzZVBhdGgiLCJwbGF5UGF1c2VCdXR0b24iLCJpc1J1bm5pbmdQcm9wZXJ0eSIsImJhc2VDb2xvciIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVhTaGlmdCIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBsYXlQYXVzZUJ1dHRvbk9wdGlvbnMiLCJyZXNldEJ1dHRvbiIsImxpc3RlbmVyIiwic2V0IiwiY29udGVudCIsInNvdW5kUGxheWVyIiwicmVzZXRCdXR0b25PcHRpb25zIiwic3BhY2luZyIsImNoaWxkcmVuIiwidGltZUxpc3RlbmVyIiwiZW5hYmxlZCIsInJhbmdlIiwibGluayIsInVubGluayIsImNvbnRlbnRzIiwiYmFja2dyb3VuZE5vZGUiLCJib3VuZHNQcm9wZXJ0eSIsImJvdW5kcyIsIndpZHRoIiwidGFnTmFtZSIsImZvY3VzYWJsZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiYWRkQ2hpbGQiLCJzdG9wd2F0Y2hWaXNpYmxlTGlzdGVuZXIiLCJ2aXNpYmxlIiwibW92ZVRvRnJvbnQiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJzdG9wd2F0Y2hQb3NpdGlvbkxpc3RlbmVyIiwicG9zaXRpb24iLCJzZXRUcmFuc2xhdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJkcmFnTGlzdGVuZXIiLCJrZXlib2FyZERyYWdMaXN0ZW5lciIsImFkanVzdGVkRHJhZ0JvdW5kc1Byb3BlcnR5IiwidGhpc0JvdW5kcyIsImRyYWdCb3VuZHMiLCJ0YXJnZXRPcmlnaW5JblBhcmVudENvb3JkaW5hdGVzIiwibG9jYWxUb1BhcmVudFBvaW50IiwiWkVSTyIsIm1pblgiLCJ4IiwibWluWSIsInkiLCJtYXhYIiwibWF4WSIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwiY29udGFpbnNQb2ludCIsImNsb3Nlc3RQb2ludFRvIiwidGFyZ2V0Tm9kZSIsIm9wdGlvbnNTdGFydCIsImV2ZW50IiwiYWRkSW5wdXRMaXN0ZW5lciIsImdyb3VwRm9jdXNIaWdobGlnaHQiLCJkb3duIiwiZm9jdXMiLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtTmFtZSIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJzaXplIiwiZmFtaWx5IiwiUExBSU5fVEVYVF9NSU5VVEVTX0FORF9TRUNPTkRTIiwidGltZUluU2Vjb25kcyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwibWludXRlc1N0cmluZyIsInNlY29uZHNTdHJpbmciLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBRy9ELE9BQU9DLGFBQWEsMEJBQTBCO0FBRTlDLE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9D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