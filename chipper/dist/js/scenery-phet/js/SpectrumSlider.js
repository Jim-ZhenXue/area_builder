// Copyright 2013-2024, University of Colorado Boulder
/**
 * SpectrumSlider is a slider-like control used for choosing a value that corresponds to a displayed color.
 * It is the base class for WavelengthSlider.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Color, DragListener, HighlightFromNode, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import AccessibleSlider from '../../sun/js/accessibility/AccessibleSlider.js';
import ArrowButton from '../../sun/js/buttons/ArrowButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SpectrumNode from './SpectrumNode.js';
const DEFAULT_MIN_VALUE = 0;
const DEFAULT_MAX_VALUE = 1;
let SpectrumSlider = class SpectrumSlider extends AccessibleSlider(Node, 0) {
    dispose() {
        this.disposeSpectrumSlider();
        super.dispose();
    }
    /**
   * @param valueProperty
   * @param providedOptions
   */ constructor(valueProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        assert && deprecationWarning('SpectrumSlider is deprecated, please use Slider with SpectrumSlideTrack/Thumb instead');
        var _providedOptions_minValue;
        const enabledRangeMin = (_providedOptions_minValue = providedOptions == null ? void 0 : providedOptions.minValue) != null ? _providedOptions_minValue : DEFAULT_MIN_VALUE;
        var _providedOptions_maxValue;
        const enabledRangeMax = (_providedOptions_maxValue = providedOptions == null ? void 0 : providedOptions.maxValue) != null ? _providedOptions_maxValue : DEFAULT_MAX_VALUE;
        const enabledRangeProperty = new Property(new Range(enabledRangeMin, enabledRangeMax));
        // options that are specific to this type
        const options = optionize()({
            // SelfOptions
            minValue: DEFAULT_MIN_VALUE,
            maxValue: DEFAULT_MAX_VALUE,
            valueToString: (value)=>`${value}`,
            valueToColor: (value)=>new Color(0, 0, 255 * value),
            // track
            trackWidth: 150,
            trackHeight: 30,
            trackOpacity: 1,
            trackBorderStroke: 'black',
            // thumb
            thumbWidth: 35,
            thumbHeight: 45,
            thumbTouchAreaXDilation: 12,
            thumbTouchAreaYDilation: 10,
            thumbMouseAreaXDilation: 0,
            thumbMouseAreaYDilation: 0,
            // value
            valueFont: new PhetFont(20),
            valueFill: 'black',
            valueVisible: true,
            valueYSpacing: 2,
            // tweakers
            tweakersVisible: true,
            tweakerValueDelta: 1,
            tweakersXSpacing: 8,
            maxTweakersHeight: 30,
            tweakersTouchAreaXDilation: 7,
            tweakersTouchAreaYDilation: 7,
            tweakersMouseAreaXDilation: 0,
            tweakersMouseAreaYDilation: 0,
            // cursor, the rectangle than follows the thumb in the track
            cursorVisible: true,
            cursorStroke: 'black',
            // ParentOptions
            valueProperty: valueProperty,
            enabledRangeProperty: enabledRangeProperty,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Slider'
        }, providedOptions);
        // validate values
        assert && assert(options.minValue < options.maxValue);
        // These options require valid Bounds, and will be applied later via mutate.
        const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
        super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));
        const track = new SpectrumNode({
            valueToColor: options.valueToColor,
            size: new Dimension2(options.trackWidth, options.trackHeight),
            minValue: options.minValue,
            maxValue: options.maxValue,
            opacity: options.trackOpacity,
            cursor: 'pointer'
        });
        /*
     * Put a border around the track.
     * We don't stroke the track itself because stroking the track will affect its bounds,
     * and will thus affect the drag handle behavior.
     * Having a separate border also gives subclasses a place to add markings (eg, tick marks)
     * without affecting the track's bounds.
     */ const trackBorder = new Rectangle(0, 0, track.width, track.height, {
            stroke: options.trackBorderStroke,
            lineWidth: 1,
            pickable: false
        });
        let valueDisplay = null;
        if (options.valueVisible) {
            valueDisplay = new ValueDisplay(valueProperty, options.valueToString, {
                font: options.valueFont,
                fill: options.valueFill,
                bottom: track.top - options.valueYSpacing
            });
        }
        let cursor = null;
        if (options.cursorVisible) {
            cursor = new Cursor(3, track.height, {
                stroke: options.cursorStroke,
                top: track.top
            });
        }
        const thumb = new Thumb(options.thumbWidth, options.thumbHeight, {
            cursor: 'pointer',
            top: track.bottom
        });
        // thumb touchArea
        if (options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation) {
            thumb.touchArea = thumb.localBounds.dilatedXY(options.thumbTouchAreaXDilation, options.thumbTouchAreaYDilation).shiftedY(options.thumbTouchAreaYDilation);
        }
        // thumb mouseArea
        if (options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation) {
            thumb.mouseArea = thumb.localBounds.dilatedXY(options.thumbMouseAreaXDilation, options.thumbMouseAreaYDilation).shiftedY(options.thumbMouseAreaYDilation);
        }
        // tweaker buttons for single-unit increments
        let plusButton = null;
        let minusButton = null;
        if (options.tweakersVisible) {
            plusButton = new ArrowButton('right', ()=>{
                // Increase the value, but keep it in range
                valueProperty.set(Math.min(options.maxValue, valueProperty.get() + options.tweakerValueDelta));
            }, {
                left: track.right + options.tweakersXSpacing,
                centerY: track.centerY,
                maxHeight: options.maxTweakersHeight,
                tandem: options.tandem.createTandem('plusButton')
            });
            minusButton = new ArrowButton('left', ()=>{
                // Decrease the value, but keep it in range
                valueProperty.set(Math.max(options.minValue, valueProperty.get() - options.tweakerValueDelta));
            }, {
                right: track.left - options.tweakersXSpacing,
                centerY: track.centerY,
                maxHeight: options.maxTweakersHeight,
                tandem: options.tandem.createTandem('minusButton')
            });
            // tweakers touchArea
            plusButton.touchArea = plusButton.localBounds.dilatedXY(options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation).shiftedX(options.tweakersTouchAreaXDilation);
            minusButton.touchArea = minusButton.localBounds.dilatedXY(options.tweakersTouchAreaXDilation, options.tweakersTouchAreaYDilation).shiftedX(-options.tweakersTouchAreaXDilation);
            // tweakers mouseArea
            plusButton.mouseArea = plusButton.localBounds.dilatedXY(options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation).shiftedX(options.tweakersMouseAreaXDilation);
            minusButton.mouseArea = minusButton.localBounds.dilatedXY(options.tweakersMouseAreaXDilation, options.tweakersMouseAreaYDilation).shiftedX(-options.tweakersMouseAreaXDilation);
        }
        // rendering order
        this.addChild(track);
        this.addChild(trackBorder);
        this.addChild(thumb);
        valueDisplay && this.addChild(valueDisplay);
        cursor && this.addChild(cursor);
        plusButton && this.addChild(plusButton);
        minusButton && this.addChild(minusButton);
        // transforms between position and value
        const positionToValue = (x)=>Utils.clamp(Utils.linear(0, track.width, options.minValue, options.maxValue, x), options.minValue, options.maxValue);
        const valueToPosition = (value)=>Utils.clamp(Utils.linear(options.minValue, options.maxValue, 0, track.width, value), 0, track.width);
        // click in the track to change the value, continue dragging if desired
        const handleTrackEvent = (event)=>{
            const x = thumb.globalToParentPoint(event.pointer.point).x;
            const value = positionToValue(x);
            valueProperty.set(value);
        };
        track.addInputListener(new DragListener({
            allowTouchSnag: false,
            start: (event)=>handleTrackEvent(event),
            drag: (event)=>handleTrackEvent(event),
            tandem: options.tandem.createTandem('dragListener')
        }));
        // thumb drag handler
        let clickXOffset = 0; // x-offset between initial click and thumb's origin
        thumb.addInputListener(new DragListener({
            tandem: options.tandem.createTandem('thumbInputListener'),
            start: (event)=>{
                clickXOffset = thumb.globalToParentPoint(event.pointer.point).x - thumb.x;
            },
            drag: (event)=>{
                const x = thumb.globalToParentPoint(event.pointer.point).x - clickXOffset;
                const value = positionToValue(x);
                valueProperty.set(value);
            }
        }));
        // custom focus highlight that surrounds and moves with the thumb
        this.focusHighlight = new HighlightFromNode(thumb);
        // sync with model
        const updateUI = (value)=>{
            // positions
            const x = valueToPosition(value);
            thumb.centerX = x;
            if (cursor) {
                cursor.centerX = x;
            }
            if (valueDisplay) {
                valueDisplay.centerX = x;
            }
            // thumb color
            thumb.fill = options.valueToColor(value);
            // tweaker buttons
            if (plusButton) {
                plusButton.enabled = value < options.maxValue;
            }
            if (minusButton) {
                minusButton.enabled = value > options.minValue;
            }
        };
        const valueListener = (value)=>updateUI(value);
        valueProperty.link(valueListener);
        /*
     * The horizontal bounds of the value control changes as the slider knob is dragged.
     * To prevent this, we determine the extents of the control's bounds at min and max values,
     * then add an invisible horizontal strut.
     */ // determine bounds at min and max values
        updateUI(options.minValue);
        const minX = this.left;
        updateUI(options.maxValue);
        const maxX = this.right;
        // restore the initial value
        updateUI(valueProperty.get());
        // add a horizontal strut
        const strut = new Rectangle(minX, 0, maxX - minX, 1, {
            pickable: false
        });
        this.addChild(strut);
        strut.moveToBack();
        this.disposeSpectrumSlider = ()=>{
            valueDisplay && valueDisplay.dispose();
            plusButton && plusButton.dispose();
            minusButton && minusButton.dispose();
            valueProperty.unlink(valueListener);
        };
        // We already set other options via super(). Now that we have valid Bounds, apply these options.
        this.mutate(boundsRequiredOptionKeys);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'SpectrumSlider', this);
    }
};
/**
 * @deprecated use WavelengthNumberControl, or Slider.js with SpectrumSliderTrack and SpectrumSliderTrack,
 *   see https://github.com/phetsims/scenery-phet/issues/729
 */ export { SpectrumSlider as default };
/**
 * The slider thumb, origin at top center.
 */ let Thumb = class Thumb extends Path {
    constructor(width, height, providedOptions){
        const options = combineOptions({
            fill: 'black',
            stroke: 'black',
            lineWidth: 1
        }, providedOptions);
        // Set the radius of the arcs based on the height or width, whichever is smaller.
        const radiusScale = 0.15;
        const radius = width < height ? radiusScale * width : radiusScale * height;
        // Calculate some parameters of the upper triangles of the thumb for getting arc offsets.
        const hypotenuse = Math.sqrt(Math.pow(0.5 * width, 2) + Math.pow(0.3 * height, 2));
        const angle = Math.acos(width * 0.5 / hypotenuse);
        const heightOffset = radius * Math.sin(angle);
        // Draw the thumb shape starting at the right upper corner of the pentagon below the arc,
        // this way we can get the arc coordinates for the arc in this corner from the other side,
        // which will be easier to calculate arcing from bottom to top.
        const shape = new Shape().moveTo(0.5 * width, 0.3 * height + heightOffset).lineTo(0.5 * width, height - radius).arc(0.5 * width - radius, height - radius, radius, 0, Math.PI / 2).lineTo(-0.5 * width + radius, height).arc(-0.5 * width + radius, height - radius, radius, Math.PI / 2, Math.PI).lineTo(-0.5 * width, 0.3 * height + heightOffset).arc(-0.5 * width + radius, 0.3 * height + heightOffset, radius, Math.PI, Math.PI + angle);
        // Save the coordinates for the point above the left side arc, for use on the other side.
        const sideArcPoint = shape.getLastPoint();
        assert && assert(sideArcPoint);
        shape.lineTo(0, 0).lineTo(-sideArcPoint.x, sideArcPoint.y).arc(0.5 * width - radius, 0.3 * height + heightOffset, radius, -angle, 0).close();
        super(shape, options);
    }
};
/**
 * Displays the value and units.
 */ let ValueDisplay = class ValueDisplay extends Text {
    dispose() {
        this.disposeValueDisplay();
        super.dispose();
    }
    /**
   * @param valueProperty
   * @param valueToString - converts value {number} to text {string} for display
   * @param providedOptions
   */ constructor(valueProperty, valueToString, providedOptions){
        super('?', providedOptions);
        const valueObserver = (value)=>{
            this.string = valueToString(value);
        };
        valueProperty.link(valueObserver);
        this.disposeValueDisplay = ()=>valueProperty.unlink(valueObserver);
    }
};
/**
 * Rectangular 'cursor' that appears in the track directly above the thumb. Origin is at top center.
 */ let Cursor = class Cursor extends Rectangle {
    constructor(width, height, providedOptions){
        super(-width / 2, 0, width, height, providedOptions);
    }
};
sceneryPhet.register('SpectrumSlider', SpectrumSlider);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TcGVjdHJ1bVNsaWRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTcGVjdHJ1bVNsaWRlciBpcyBhIHNsaWRlci1saWtlIGNvbnRyb2wgdXNlZCBmb3IgY2hvb3NpbmcgYSB2YWx1ZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgZGlzcGxheWVkIGNvbG9yLlxuICogSXQgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIFdhdmVsZW5ndGhTbGlkZXIuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgQ29sb3IsIERyYWdMaXN0ZW5lciwgRm9udCwgSGlnaGxpZ2h0RnJvbU5vZGUsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQYXRoT3B0aW9ucywgUmVjdGFuZ2xlLCBSZWN0YW5nbGVPcHRpb25zLCBTY2VuZXJ5RXZlbnQsIFRDb2xvciwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFjY2Vzc2libGVTbGlkZXIsIHsgQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlU2xpZGVyLmpzJztcbmltcG9ydCBBcnJvd0J1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9BcnJvd0J1dHRvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNwZWN0cnVtTm9kZSBmcm9tICcuL1NwZWN0cnVtTm9kZS5qcyc7XG5cbmNvbnN0IERFRkFVTFRfTUlOX1ZBTFVFID0gMDtcbmNvbnN0IERFRkFVTFRfTUFYX1ZBTFVFID0gMTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBUaGUgbWluaW11bSB2YWx1ZSB0byBiZSBkaXNwbGF5ZWRcbiAgbWluVmFsdWU/OiBudW1iZXI7XG5cbiAgLy8gVGhlIG1heGltdW0gdmFsdWUgdG8gYmUgZGlzcGxheWVkXG4gIG1heFZhbHVlPzogbnVtYmVyO1xuXG4gIC8vIE1hcHMgdmFsdWUgdG8gc3RyaW5nIHRoYXQgaXMgb3B0aW9uYWxseSBkaXNwbGF5ZWQgYnkgdGhlIHNsaWRlclxuICB2YWx1ZVRvU3RyaW5nPzogKCB2YWx1ZTogbnVtYmVyICkgPT4gc3RyaW5nO1xuXG4gIC8vIE1hcHMgdmFsdWUgdG8gQ29sb3IgdGhhdCBpcyByZW5kZXJlZCBpbiB0aGUgc3BlY3RydW0gYW5kIGluIHRoZSB0aHVtYlxuICB2YWx1ZVRvQ29sb3I/OiAoIHZhbHVlOiBudW1iZXIgKSA9PiBDb2xvcjtcblxuICAvLyB0cmFjayBwcm9wZXJ0aWVzXG4gIHRyYWNrV2lkdGg/OiBudW1iZXI7XG4gIHRyYWNrSGVpZ2h0PzogbnVtYmVyO1xuICB0cmFja09wYWNpdHk/OiBudW1iZXI7IC8vIFswLDFdXG4gIHRyYWNrQm9yZGVyU3Ryb2tlPzogVENvbG9yO1xuXG4gIC8vIHRodW1iXG4gIHRodW1iV2lkdGg/OiBudW1iZXI7XG4gIHRodW1iSGVpZ2h0PzogbnVtYmVyO1xuICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIHRodW1iTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICB0aHVtYk1vdXNlQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcblxuICAvLyB2YWx1ZVxuICB2YWx1ZUZvbnQ/OiBGb250O1xuICB2YWx1ZUZpbGw/OiBUQ29sb3I7XG4gIHZhbHVlVmlzaWJsZT86IGJvb2xlYW47XG4gIHZhbHVlWVNwYWNpbmc/OiBudW1iZXI7IC8vIHNwYWNlIGJldHdlZW4gdmFsdWUgYW5kIHRvcCBvZiB0cmFja1xuXG4gIC8vIHR3ZWFrZXJzXG4gIHR3ZWFrZXJzVmlzaWJsZT86IGJvb2xlYW47XG4gIHR3ZWFrZXJWYWx1ZURlbHRhPzogbnVtYmVyOyAvLyB0aGUgYW1vdW50IHRoYXQgdmFsdWUgY2hhbmdlcyB3aGVuIGEgdHdlYWtlciBidXR0b24gaXMgcHJlc3NlZFxuICB0d2Vha2Vyc1hTcGFjaW5nPzogbnVtYmVyOyAvLyBzcGFjZSBiZXR3ZWVuIHR3ZWFrZXJzIGFuZCB0cmFja1xuICBtYXhUd2Vha2Vyc0hlaWdodD86IG51bWJlcjtcbiAgdHdlYWtlcnNUb3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIHR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuICB0d2Vha2Vyc01vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgdHdlYWtlcnNNb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG5cbiAgLy8gY3Vyc29yLCB0aGUgcmVjdGFuZ2xlIHRoYW4gZm9sbG93cyB0aGUgdGh1bWIgaW4gdGhlIHRyYWNrXG4gIGN1cnNvclZpc2libGU/OiBib29sZWFuO1xuICBjdXJzb3JTdHJva2U/OiBUQ29sb3I7XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgJiBOb2RlT3B0aW9ucztcbmV4cG9ydCB0eXBlIFNwZWN0cnVtU2xpZGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQYXJlbnRPcHRpb25zLCAndmFsdWVQcm9wZXJ0eScgfCAnZW5hYmxlZFJhbmdlUHJvcGVydHknPjtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCB1c2UgV2F2ZWxlbmd0aE51bWJlckNvbnRyb2wsIG9yIFNsaWRlci5qcyB3aXRoIFNwZWN0cnVtU2xpZGVyVHJhY2sgYW5kIFNwZWN0cnVtU2xpZGVyVHJhY2ssXG4gKiAgIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy83MjlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlY3RydW1TbGlkZXIgZXh0ZW5kcyBBY2Nlc3NpYmxlU2xpZGVyKCBOb2RlLCAwICkge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVNwZWN0cnVtU2xpZGVyOiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBTcGVjdHJ1bVNsaWRlck9wdGlvbnMgKSB7XG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ1NwZWN0cnVtU2xpZGVyIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgU2xpZGVyIHdpdGggU3BlY3RydW1TbGlkZVRyYWNrL1RodW1iIGluc3RlYWQnICk7XG5cbiAgICBjb25zdCBlbmFibGVkUmFuZ2VNaW4gPSBwcm92aWRlZE9wdGlvbnM/Lm1pblZhbHVlID8/IERFRkFVTFRfTUlOX1ZBTFVFO1xuICAgIGNvbnN0IGVuYWJsZWRSYW5nZU1heCA9IHByb3ZpZGVkT3B0aW9ucz8ubWF4VmFsdWUgPz8gREVGQVVMVF9NQVhfVkFMVUU7XG4gICAgY29uc3QgZW5hYmxlZFJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggZW5hYmxlZFJhbmdlTWluLCBlbmFibGVkUmFuZ2VNYXggKSApO1xuXG4gICAgLy8gb3B0aW9ucyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHR5cGVcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNwZWN0cnVtU2xpZGVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIG1pblZhbHVlOiBERUZBVUxUX01JTl9WQUxVRSxcbiAgICAgIG1heFZhbHVlOiBERUZBVUxUX01BWF9WQUxVRSxcbiAgICAgIHZhbHVlVG9TdHJpbmc6ICggdmFsdWU6IG51bWJlciApID0+IGAke3ZhbHVlfWAsXG4gICAgICB2YWx1ZVRvQ29sb3I6ICggdmFsdWU6IG51bWJlciApID0+IG5ldyBDb2xvciggMCwgMCwgMjU1ICogdmFsdWUgKSxcblxuICAgICAgLy8gdHJhY2tcbiAgICAgIHRyYWNrV2lkdGg6IDE1MCxcbiAgICAgIHRyYWNrSGVpZ2h0OiAzMCxcbiAgICAgIHRyYWNrT3BhY2l0eTogMSxcbiAgICAgIHRyYWNrQm9yZGVyU3Ryb2tlOiAnYmxhY2snLFxuXG4gICAgICAvLyB0aHVtYlxuICAgICAgdGh1bWJXaWR0aDogMzUsXG4gICAgICB0aHVtYkhlaWdodDogNDUsXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogMTIsXG4gICAgICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbjogMTAsXG4gICAgICB0aHVtYk1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIHRodW1iTW91c2VBcmVhWURpbGF0aW9uOiAwLFxuXG4gICAgICAvLyB2YWx1ZVxuICAgICAgdmFsdWVGb250OiBuZXcgUGhldEZvbnQoIDIwICksXG4gICAgICB2YWx1ZUZpbGw6ICdibGFjaycsXG4gICAgICB2YWx1ZVZpc2libGU6IHRydWUsXG4gICAgICB2YWx1ZVlTcGFjaW5nOiAyLCAvLyB7bnVtYmVyfSBzcGFjZSBiZXR3ZWVuIHZhbHVlIGFuZCB0b3Agb2YgdHJhY2tcblxuICAgICAgLy8gdHdlYWtlcnNcbiAgICAgIHR3ZWFrZXJzVmlzaWJsZTogdHJ1ZSxcbiAgICAgIHR3ZWFrZXJWYWx1ZURlbHRhOiAxLCAvLyB7bnVtYmVyfSB0aGUgYW1vdW50IHRoYXQgdmFsdWUgY2hhbmdlcyB3aGVuIGEgdHdlYWtlciBidXR0b24gaXMgcHJlc3NlZFxuICAgICAgdHdlYWtlcnNYU3BhY2luZzogOCwgLy8ge251bWJlcn0gc3BhY2UgYmV0d2VlbiB0d2Vha2VycyBhbmQgdHJhY2tcbiAgICAgIG1heFR3ZWFrZXJzSGVpZ2h0OiAzMCxcbiAgICAgIHR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uOiA3LFxuICAgICAgdHdlYWtlcnNUb3VjaEFyZWFZRGlsYXRpb246IDcsXG4gICAgICB0d2Vha2Vyc01vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIHR3ZWFrZXJzTW91c2VBcmVhWURpbGF0aW9uOiAwLFxuXG4gICAgICAvLyBjdXJzb3IsIHRoZSByZWN0YW5nbGUgdGhhbiBmb2xsb3dzIHRoZSB0aHVtYiBpbiB0aGUgdHJhY2tcbiAgICAgIGN1cnNvclZpc2libGU6IHRydWUsXG4gICAgICBjdXJzb3JTdHJva2U6ICdibGFjaycsXG5cbiAgICAgIC8vIFBhcmVudE9wdGlvbnNcbiAgICAgIHZhbHVlUHJvcGVydHk6IHZhbHVlUHJvcGVydHksXG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogZW5hYmxlZFJhbmdlUHJvcGVydHksXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdTbGlkZXInXG5cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIHZhbGlkYXRlIHZhbHVlc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWluVmFsdWUgPCBvcHRpb25zLm1heFZhbHVlICk7XG5cbiAgICAvLyBUaGVzZSBvcHRpb25zIHJlcXVpcmUgdmFsaWQgQm91bmRzLCBhbmQgd2lsbCBiZSBhcHBsaWVkIGxhdGVyIHZpYSBtdXRhdGUuXG4gICAgY29uc3QgYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzID0gXy5waWNrKCBvcHRpb25zLCBOb2RlLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApO1xuXG4gICAgc3VwZXIoIF8ub21pdCggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSApO1xuXG4gICAgY29uc3QgdHJhY2sgPSBuZXcgU3BlY3RydW1Ob2RlKCB7XG4gICAgICB2YWx1ZVRvQ29sb3I6IG9wdGlvbnMudmFsdWVUb0NvbG9yLFxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIG9wdGlvbnMudHJhY2tXaWR0aCwgb3B0aW9ucy50cmFja0hlaWdodCApLFxuICAgICAgbWluVmFsdWU6IG9wdGlvbnMubWluVmFsdWUsXG4gICAgICBtYXhWYWx1ZTogb3B0aW9ucy5tYXhWYWx1ZSxcbiAgICAgIG9wYWNpdHk6IG9wdGlvbnMudHJhY2tPcGFjaXR5LFxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICB9ICk7XG5cbiAgICAvKlxuICAgICAqIFB1dCBhIGJvcmRlciBhcm91bmQgdGhlIHRyYWNrLlxuICAgICAqIFdlIGRvbid0IHN0cm9rZSB0aGUgdHJhY2sgaXRzZWxmIGJlY2F1c2Ugc3Ryb2tpbmcgdGhlIHRyYWNrIHdpbGwgYWZmZWN0IGl0cyBib3VuZHMsXG4gICAgICogYW5kIHdpbGwgdGh1cyBhZmZlY3QgdGhlIGRyYWcgaGFuZGxlIGJlaGF2aW9yLlxuICAgICAqIEhhdmluZyBhIHNlcGFyYXRlIGJvcmRlciBhbHNvIGdpdmVzIHN1YmNsYXNzZXMgYSBwbGFjZSB0byBhZGQgbWFya2luZ3MgKGVnLCB0aWNrIG1hcmtzKVxuICAgICAqIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSB0cmFjaydzIGJvdW5kcy5cbiAgICAgKi9cbiAgICBjb25zdCB0cmFja0JvcmRlciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHRyYWNrLndpZHRoLCB0cmFjay5oZWlnaHQsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy50cmFja0JvcmRlclN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcblxuICAgIGxldCB2YWx1ZURpc3BsYXk6IE5vZGUgfCBudWxsID0gbnVsbDtcbiAgICBpZiAoIG9wdGlvbnMudmFsdWVWaXNpYmxlICkge1xuICAgICAgdmFsdWVEaXNwbGF5ID0gbmV3IFZhbHVlRGlzcGxheSggdmFsdWVQcm9wZXJ0eSwgb3B0aW9ucy52YWx1ZVRvU3RyaW5nLCB7XG4gICAgICAgIGZvbnQ6IG9wdGlvbnMudmFsdWVGb250LFxuICAgICAgICBmaWxsOiBvcHRpb25zLnZhbHVlRmlsbCxcbiAgICAgICAgYm90dG9tOiB0cmFjay50b3AgLSBvcHRpb25zLnZhbHVlWVNwYWNpbmdcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBsZXQgY3Vyc29yOiBDdXJzb3IgfCBudWxsID0gbnVsbDtcbiAgICBpZiAoIG9wdGlvbnMuY3Vyc29yVmlzaWJsZSApIHtcbiAgICAgIGN1cnNvciA9IG5ldyBDdXJzb3IoIDMsIHRyYWNrLmhlaWdodCwge1xuICAgICAgICBzdHJva2U6IG9wdGlvbnMuY3Vyc29yU3Ryb2tlLFxuICAgICAgICB0b3A6IHRyYWNrLnRvcFxuICAgICAgfSApO1xuICAgIH1cblxuICAgIGNvbnN0IHRodW1iID0gbmV3IFRodW1iKCBvcHRpb25zLnRodW1iV2lkdGgsIG9wdGlvbnMudGh1bWJIZWlnaHQsIHtcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgdG9wOiB0cmFjay5ib3R0b21cbiAgICB9ICk7XG5cbiAgICAvLyB0aHVtYiB0b3VjaEFyZWFcbiAgICBpZiAoIG9wdGlvbnMudGh1bWJUb3VjaEFyZWFYRGlsYXRpb24gfHwgb3B0aW9ucy50aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiApIHtcbiAgICAgIHRodW1iLnRvdWNoQXJlYSA9IHRodW1iLmxvY2FsQm91bmRzXG4gICAgICAgIC5kaWxhdGVkWFkoIG9wdGlvbnMudGh1bWJUb3VjaEFyZWFYRGlsYXRpb24sIG9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24gKVxuICAgICAgICAuc2hpZnRlZFkoIG9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24gKTtcbiAgICB9XG5cbiAgICAvLyB0aHVtYiBtb3VzZUFyZWFcbiAgICBpZiAoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24gfHwgb3B0aW9ucy50aHVtYk1vdXNlQXJlYVlEaWxhdGlvbiApIHtcbiAgICAgIHRodW1iLm1vdXNlQXJlYSA9IHRodW1iLmxvY2FsQm91bmRzXG4gICAgICAgIC5kaWxhdGVkWFkoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24gKVxuICAgICAgICAuc2hpZnRlZFkoIG9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24gKTtcbiAgICB9XG5cbiAgICAvLyB0d2Vha2VyIGJ1dHRvbnMgZm9yIHNpbmdsZS11bml0IGluY3JlbWVudHNcbiAgICBsZXQgcGx1c0J1dHRvbjogTm9kZSB8IG51bGwgPSBudWxsO1xuICAgIGxldCBtaW51c0J1dHRvbjogTm9kZSB8IG51bGwgPSBudWxsO1xuICAgIGlmICggb3B0aW9ucy50d2Vha2Vyc1Zpc2libGUgKSB7XG5cbiAgICAgIHBsdXNCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdyaWdodCcsICggKCkgPT4ge1xuXG4gICAgICAgIC8vIEluY3JlYXNlIHRoZSB2YWx1ZSwgYnV0IGtlZXAgaXQgaW4gcmFuZ2VcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIE1hdGgubWluKCBvcHRpb25zLm1heFZhbHVlLCB2YWx1ZVByb3BlcnR5LmdldCgpICsgb3B0aW9ucy50d2Vha2VyVmFsdWVEZWx0YSApICk7XG4gICAgICB9ICksIHtcbiAgICAgICAgbGVmdDogdHJhY2sucmlnaHQgKyBvcHRpb25zLnR3ZWFrZXJzWFNwYWNpbmcsXG4gICAgICAgIGNlbnRlclk6IHRyYWNrLmNlbnRlclksXG4gICAgICAgIG1heEhlaWdodDogb3B0aW9ucy5tYXhUd2Vha2Vyc0hlaWdodCxcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbHVzQnV0dG9uJyApXG4gICAgICB9ICk7XG5cbiAgICAgIG1pbnVzQnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAnbGVmdCcsICggKCkgPT4ge1xuXG4gICAgICAgIC8vIERlY3JlYXNlIHRoZSB2YWx1ZSwgYnV0IGtlZXAgaXQgaW4gcmFuZ2VcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIE1hdGgubWF4KCBvcHRpb25zLm1pblZhbHVlLCB2YWx1ZVByb3BlcnR5LmdldCgpIC0gb3B0aW9ucy50d2Vha2VyVmFsdWVEZWx0YSApICk7XG4gICAgICB9ICksIHtcbiAgICAgICAgcmlnaHQ6IHRyYWNrLmxlZnQgLSBvcHRpb25zLnR3ZWFrZXJzWFNwYWNpbmcsXG4gICAgICAgIGNlbnRlclk6IHRyYWNrLmNlbnRlclksXG4gICAgICAgIG1heEhlaWdodDogb3B0aW9ucy5tYXhUd2Vha2Vyc0hlaWdodCxcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtaW51c0J1dHRvbicgKVxuICAgICAgfSApO1xuXG4gICAgICAvLyB0d2Vha2VycyB0b3VjaEFyZWFcbiAgICAgIHBsdXNCdXR0b24udG91Y2hBcmVhID0gcGx1c0J1dHRvbi5sb2NhbEJvdW5kc1xuICAgICAgICAuZGlsYXRlZFhZKCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uLCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uIClcbiAgICAgICAgLnNoaWZ0ZWRYKCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uICk7XG4gICAgICBtaW51c0J1dHRvbi50b3VjaEFyZWEgPSBtaW51c0J1dHRvbi5sb2NhbEJvdW5kc1xuICAgICAgICAuZGlsYXRlZFhZKCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWERpbGF0aW9uLCBvcHRpb25zLnR3ZWFrZXJzVG91Y2hBcmVhWURpbGF0aW9uIClcbiAgICAgICAgLnNoaWZ0ZWRYKCAtb3B0aW9ucy50d2Vha2Vyc1RvdWNoQXJlYVhEaWxhdGlvbiApO1xuXG4gICAgICAvLyB0d2Vha2VycyBtb3VzZUFyZWFcbiAgICAgIHBsdXNCdXR0b24ubW91c2VBcmVhID0gcGx1c0J1dHRvbi5sb2NhbEJvdW5kc1xuICAgICAgICAuZGlsYXRlZFhZKCBvcHRpb25zLnR3ZWFrZXJzTW91c2VBcmVhWERpbGF0aW9uLCBvcHRpb25zLnR3ZWFrZXJzTW91c2VBcmVhWURpbGF0aW9uIClcbiAgICAgICAgLnNoaWZ0ZWRYKCBvcHRpb25zLnR3ZWFrZXJzTW91c2VBcmVhWERpbGF0aW9uICk7XG4gICAgICBtaW51c0J1dHRvbi5tb3VzZUFyZWEgPSBtaW51c0J1dHRvbi5sb2NhbEJvdW5kc1xuICAgICAgICAuZGlsYXRlZFhZKCBvcHRpb25zLnR3ZWFrZXJzTW91c2VBcmVhWERpbGF0aW9uLCBvcHRpb25zLnR3ZWFrZXJzTW91c2VBcmVhWURpbGF0aW9uIClcbiAgICAgICAgLnNoaWZ0ZWRYKCAtb3B0aW9ucy50d2Vha2Vyc01vdXNlQXJlYVhEaWxhdGlvbiApO1xuICAgIH1cblxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRyYWNrICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdHJhY2tCb3JkZXIgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aHVtYiApO1xuICAgIHZhbHVlRGlzcGxheSAmJiB0aGlzLmFkZENoaWxkKCB2YWx1ZURpc3BsYXkgKTtcbiAgICBjdXJzb3IgJiYgdGhpcy5hZGRDaGlsZCggY3Vyc29yICk7XG4gICAgcGx1c0J1dHRvbiAmJiB0aGlzLmFkZENoaWxkKCBwbHVzQnV0dG9uICk7XG4gICAgbWludXNCdXR0b24gJiYgdGhpcy5hZGRDaGlsZCggbWludXNCdXR0b24gKTtcblxuICAgIC8vIHRyYW5zZm9ybXMgYmV0d2VlbiBwb3NpdGlvbiBhbmQgdmFsdWVcbiAgICBjb25zdCBwb3NpdGlvblRvVmFsdWUgPSAoIHg6IG51bWJlciApID0+XG4gICAgICBVdGlscy5jbGFtcCggVXRpbHMubGluZWFyKCAwLCB0cmFjay53aWR0aCwgb3B0aW9ucy5taW5WYWx1ZSwgb3B0aW9ucy5tYXhWYWx1ZSwgeCApLCBvcHRpb25zLm1pblZhbHVlLCBvcHRpb25zLm1heFZhbHVlICk7XG4gICAgY29uc3QgdmFsdWVUb1Bvc2l0aW9uID0gKCB2YWx1ZTogbnVtYmVyICkgPT5cbiAgICAgIFV0aWxzLmNsYW1wKCBVdGlscy5saW5lYXIoIG9wdGlvbnMubWluVmFsdWUsIG9wdGlvbnMubWF4VmFsdWUsIDAsIHRyYWNrLndpZHRoLCB2YWx1ZSApLCAwLCB0cmFjay53aWR0aCApO1xuXG4gICAgLy8gY2xpY2sgaW4gdGhlIHRyYWNrIHRvIGNoYW5nZSB0aGUgdmFsdWUsIGNvbnRpbnVlIGRyYWdnaW5nIGlmIGRlc2lyZWRcbiAgICBjb25zdCBoYW5kbGVUcmFja0V2ZW50ID0gKCBldmVudDogU2NlbmVyeUV2ZW50ICkgPT4ge1xuICAgICAgY29uc3QgeCA9IHRodW1iLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS54O1xuICAgICAgY29uc3QgdmFsdWUgPSBwb3NpdGlvblRvVmFsdWUoIHggKTtcbiAgICAgIHZhbHVlUHJvcGVydHkuc2V0KCB2YWx1ZSApO1xuICAgIH07XG5cbiAgICB0cmFjay5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XG4gICAgICBhbGxvd1RvdWNoU25hZzogZmFsc2UsXG4gICAgICBzdGFydDogZXZlbnQgPT4gaGFuZGxlVHJhY2tFdmVudCggZXZlbnQgKSxcbiAgICAgIGRyYWc6IGV2ZW50ID0+IGhhbmRsZVRyYWNrRXZlbnQoIGV2ZW50ICksXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdMaXN0ZW5lcicgKVxuICAgIH0gKSApO1xuXG4gICAgLy8gdGh1bWIgZHJhZyBoYW5kbGVyXG4gICAgbGV0IGNsaWNrWE9mZnNldCA9IDA7IC8vIHgtb2Zmc2V0IGJldHdlZW4gaW5pdGlhbCBjbGljayBhbmQgdGh1bWIncyBvcmlnaW5cbiAgICB0aHVtYi5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRHJhZ0xpc3RlbmVyKCB7XG5cbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGh1bWJJbnB1dExpc3RlbmVyJyApLFxuXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xuICAgICAgICBjbGlja1hPZmZzZXQgPSB0aHVtYi5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueCAtIHRodW1iLng7XG4gICAgICB9LFxuXG4gICAgICBkcmFnOiBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IHggPSB0aHVtYi5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueCAtIGNsaWNrWE9mZnNldDtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwb3NpdGlvblRvVmFsdWUoIHggKTtcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIHZhbHVlICk7XG4gICAgICB9XG4gICAgfSApICk7XG5cbiAgICAvLyBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0IHRoYXQgc3Vycm91bmRzIGFuZCBtb3ZlcyB3aXRoIHRoZSB0aHVtYlxuICAgIHRoaXMuZm9jdXNIaWdobGlnaHQgPSBuZXcgSGlnaGxpZ2h0RnJvbU5vZGUoIHRodW1iICk7XG5cbiAgICAvLyBzeW5jIHdpdGggbW9kZWxcbiAgICBjb25zdCB1cGRhdGVVSSA9ICggdmFsdWU6IG51bWJlciApID0+IHtcblxuICAgICAgLy8gcG9zaXRpb25zXG4gICAgICBjb25zdCB4ID0gdmFsdWVUb1Bvc2l0aW9uKCB2YWx1ZSApO1xuICAgICAgdGh1bWIuY2VudGVyWCA9IHg7XG4gICAgICBpZiAoIGN1cnNvciApIHsgY3Vyc29yLmNlbnRlclggPSB4OyB9XG4gICAgICBpZiAoIHZhbHVlRGlzcGxheSApIHsgdmFsdWVEaXNwbGF5LmNlbnRlclggPSB4OyB9XG5cbiAgICAgIC8vIHRodW1iIGNvbG9yXG4gICAgICB0aHVtYi5maWxsID0gb3B0aW9ucy52YWx1ZVRvQ29sb3IoIHZhbHVlICk7XG5cbiAgICAgIC8vIHR3ZWFrZXIgYnV0dG9uc1xuICAgICAgaWYgKCBwbHVzQnV0dG9uICkge1xuICAgICAgICBwbHVzQnV0dG9uLmVuYWJsZWQgPSAoIHZhbHVlIDwgb3B0aW9ucy5tYXhWYWx1ZSApO1xuICAgICAgfVxuICAgICAgaWYgKCBtaW51c0J1dHRvbiApIHtcbiAgICAgICAgbWludXNCdXR0b24uZW5hYmxlZCA9ICggdmFsdWUgPiBvcHRpb25zLm1pblZhbHVlICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB2YWx1ZUxpc3RlbmVyID0gKCB2YWx1ZTogbnVtYmVyICkgPT4gdXBkYXRlVUkoIHZhbHVlICk7XG4gICAgdmFsdWVQcm9wZXJ0eS5saW5rKCB2YWx1ZUxpc3RlbmVyICk7XG5cbiAgICAvKlxuICAgICAqIFRoZSBob3Jpem9udGFsIGJvdW5kcyBvZiB0aGUgdmFsdWUgY29udHJvbCBjaGFuZ2VzIGFzIHRoZSBzbGlkZXIga25vYiBpcyBkcmFnZ2VkLlxuICAgICAqIFRvIHByZXZlbnQgdGhpcywgd2UgZGV0ZXJtaW5lIHRoZSBleHRlbnRzIG9mIHRoZSBjb250cm9sJ3MgYm91bmRzIGF0IG1pbiBhbmQgbWF4IHZhbHVlcyxcbiAgICAgKiB0aGVuIGFkZCBhbiBpbnZpc2libGUgaG9yaXpvbnRhbCBzdHJ1dC5cbiAgICAgKi9cbiAgICAvLyBkZXRlcm1pbmUgYm91bmRzIGF0IG1pbiBhbmQgbWF4IHZhbHVlc1xuICAgIHVwZGF0ZVVJKCBvcHRpb25zLm1pblZhbHVlICk7XG4gICAgY29uc3QgbWluWCA9IHRoaXMubGVmdDtcbiAgICB1cGRhdGVVSSggb3B0aW9ucy5tYXhWYWx1ZSApO1xuICAgIGNvbnN0IG1heFggPSB0aGlzLnJpZ2h0O1xuXG4gICAgLy8gcmVzdG9yZSB0aGUgaW5pdGlhbCB2YWx1ZVxuICAgIHVwZGF0ZVVJKCB2YWx1ZVByb3BlcnR5LmdldCgpICk7XG5cbiAgICAvLyBhZGQgYSBob3Jpem9udGFsIHN0cnV0XG4gICAgY29uc3Qgc3RydXQgPSBuZXcgUmVjdGFuZ2xlKCBtaW5YLCAwLCBtYXhYIC0gbWluWCwgMSwgeyBwaWNrYWJsZTogZmFsc2UgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHN0cnV0ICk7XG4gICAgc3RydXQubW92ZVRvQmFjaygpO1xuXG4gICAgdGhpcy5kaXNwb3NlU3BlY3RydW1TbGlkZXIgPSAoKSA9PiB7XG4gICAgICB2YWx1ZURpc3BsYXkgJiYgdmFsdWVEaXNwbGF5LmRpc3Bvc2UoKTtcbiAgICAgIHBsdXNCdXR0b24gJiYgcGx1c0J1dHRvbi5kaXNwb3NlKCk7XG4gICAgICBtaW51c0J1dHRvbiAmJiBtaW51c0J1dHRvbi5kaXNwb3NlKCk7XG4gICAgICB2YWx1ZVByb3BlcnR5LnVubGluayggdmFsdWVMaXN0ZW5lciApO1xuICAgIH07XG5cbiAgICAvLyBXZSBhbHJlYWR5IHNldCBvdGhlciBvcHRpb25zIHZpYSBzdXBlcigpLiBOb3cgdGhhdCB3ZSBoYXZlIHZhbGlkIEJvdW5kcywgYXBwbHkgdGhlc2Ugb3B0aW9ucy5cbiAgICB0aGlzLm11dGF0ZSggYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ1NwZWN0cnVtU2xpZGVyJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlU3BlY3RydW1TbGlkZXIoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgc2xpZGVyIHRodW1iLCBvcmlnaW4gYXQgdG9wIGNlbnRlci5cbiAqL1xuY2xhc3MgVGh1bWIgZXh0ZW5kcyBQYXRoIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBQYXRoT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxQYXRoT3B0aW9ucz4oIHtcbiAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIFNldCB0aGUgcmFkaXVzIG9mIHRoZSBhcmNzIGJhc2VkIG9uIHRoZSBoZWlnaHQgb3Igd2lkdGgsIHdoaWNoZXZlciBpcyBzbWFsbGVyLlxuICAgIGNvbnN0IHJhZGl1c1NjYWxlID0gMC4xNTtcbiAgICBjb25zdCByYWRpdXMgPSAoIHdpZHRoIDwgaGVpZ2h0ICkgPyByYWRpdXNTY2FsZSAqIHdpZHRoIDogcmFkaXVzU2NhbGUgKiBoZWlnaHQ7XG5cbiAgICAvLyBDYWxjdWxhdGUgc29tZSBwYXJhbWV0ZXJzIG9mIHRoZSB1cHBlciB0cmlhbmdsZXMgb2YgdGhlIHRodW1iIGZvciBnZXR0aW5nIGFyYyBvZmZzZXRzLlxuICAgIGNvbnN0IGh5cG90ZW51c2UgPSBNYXRoLnNxcnQoIE1hdGgucG93KCAwLjUgKiB3aWR0aCwgMiApICsgTWF0aC5wb3coIDAuMyAqIGhlaWdodCwgMiApICk7XG4gICAgY29uc3QgYW5nbGUgPSBNYXRoLmFjb3MoIHdpZHRoICogMC41IC8gaHlwb3RlbnVzZSApO1xuICAgIGNvbnN0IGhlaWdodE9mZnNldCA9IHJhZGl1cyAqIE1hdGguc2luKCBhbmdsZSApO1xuXG4gICAgLy8gRHJhdyB0aGUgdGh1bWIgc2hhcGUgc3RhcnRpbmcgYXQgdGhlIHJpZ2h0IHVwcGVyIGNvcm5lciBvZiB0aGUgcGVudGFnb24gYmVsb3cgdGhlIGFyYyxcbiAgICAvLyB0aGlzIHdheSB3ZSBjYW4gZ2V0IHRoZSBhcmMgY29vcmRpbmF0ZXMgZm9yIHRoZSBhcmMgaW4gdGhpcyBjb3JuZXIgZnJvbSB0aGUgb3RoZXIgc2lkZSxcbiAgICAvLyB3aGljaCB3aWxsIGJlIGVhc2llciB0byBjYWxjdWxhdGUgYXJjaW5nIGZyb20gYm90dG9tIHRvIHRvcC5cbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAubW92ZVRvKCAwLjUgKiB3aWR0aCwgMC4zICogaGVpZ2h0ICsgaGVpZ2h0T2Zmc2V0IClcbiAgICAgIC5saW5lVG8oIDAuNSAqIHdpZHRoLCBoZWlnaHQgLSByYWRpdXMgKVxuICAgICAgLmFyYyggMC41ICogd2lkdGggLSByYWRpdXMsIGhlaWdodCAtIHJhZGl1cywgcmFkaXVzLCAwLCBNYXRoLlBJIC8gMiApXG4gICAgICAubGluZVRvKCAtMC41ICogd2lkdGggKyByYWRpdXMsIGhlaWdodCApXG4gICAgICAuYXJjKCAtMC41ICogd2lkdGggKyByYWRpdXMsIGhlaWdodCAtIHJhZGl1cywgcmFkaXVzLCBNYXRoLlBJIC8gMiwgTWF0aC5QSSApXG4gICAgICAubGluZVRvKCAtMC41ICogd2lkdGgsIDAuMyAqIGhlaWdodCArIGhlaWdodE9mZnNldCApXG4gICAgICAuYXJjKCAtMC41ICogd2lkdGggKyByYWRpdXMsIDAuMyAqIGhlaWdodCArIGhlaWdodE9mZnNldCwgcmFkaXVzLCBNYXRoLlBJLCBNYXRoLlBJICsgYW5nbGUgKTtcblxuICAgIC8vIFNhdmUgdGhlIGNvb3JkaW5hdGVzIGZvciB0aGUgcG9pbnQgYWJvdmUgdGhlIGxlZnQgc2lkZSBhcmMsIGZvciB1c2Ugb24gdGhlIG90aGVyIHNpZGUuXG4gICAgY29uc3Qgc2lkZUFyY1BvaW50ID0gc2hhcGUuZ2V0TGFzdFBvaW50KCk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2lkZUFyY1BvaW50ICk7XG5cbiAgICBzaGFwZS5saW5lVG8oIDAsIDAgKVxuICAgICAgLmxpbmVUbyggLXNpZGVBcmNQb2ludC54LCBzaWRlQXJjUG9pbnQueSApXG4gICAgICAuYXJjKCAwLjUgKiB3aWR0aCAtIHJhZGl1cywgMC4zICogaGVpZ2h0ICsgaGVpZ2h0T2Zmc2V0LCByYWRpdXMsIC1hbmdsZSwgMCApXG4gICAgICAuY2xvc2UoKTtcblxuICAgIHN1cGVyKCBzaGFwZSwgb3B0aW9ucyApO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGxheXMgdGhlIHZhbHVlIGFuZCB1bml0cy5cbiAqL1xuY2xhc3MgVmFsdWVEaXNwbGF5IGV4dGVuZHMgVGV4dCB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlVmFsdWVEaXNwbGF5OiAoKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdmFsdWVQcm9wZXJ0eVxuICAgKiBAcGFyYW0gdmFsdWVUb1N0cmluZyAtIGNvbnZlcnRzIHZhbHVlIHtudW1iZXJ9IHRvIHRleHQge3N0cmluZ30gZm9yIGRpc3BsYXlcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlVG9TdHJpbmc6ICggdmFsdWU6IG51bWJlciApID0+IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBUZXh0T3B0aW9ucyApIHtcblxuICAgIHN1cGVyKCAnPycsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgdmFsdWVPYnNlcnZlciA9ICggdmFsdWU6IG51bWJlciApID0+IHtcbiAgICAgIHRoaXMuc3RyaW5nID0gdmFsdWVUb1N0cmluZyggdmFsdWUgKTtcbiAgICB9O1xuICAgIHZhbHVlUHJvcGVydHkubGluayggdmFsdWVPYnNlcnZlciApO1xuXG4gICAgdGhpcy5kaXNwb3NlVmFsdWVEaXNwbGF5ID0gKCkgPT4gdmFsdWVQcm9wZXJ0eS51bmxpbmsoIHZhbHVlT2JzZXJ2ZXIgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVZhbHVlRGlzcGxheSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlY3Rhbmd1bGFyICdjdXJzb3InIHRoYXQgYXBwZWFycyBpbiB0aGUgdHJhY2sgZGlyZWN0bHkgYWJvdmUgdGhlIHRodW1iLiBPcmlnaW4gaXMgYXQgdG9wIGNlbnRlci5cbiAqL1xuY2xhc3MgQ3Vyc29yIGV4dGVuZHMgUmVjdGFuZ2xlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zOiBSZWN0YW5nbGVPcHRpb25zICkge1xuICAgIHN1cGVyKCAtd2lkdGggLyAyLCAwLCB3aWR0aCwgaGVpZ2h0LCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1NwZWN0cnVtU2xpZGVyJywgU3BlY3RydW1TbGlkZXIgKTsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIlNoYXBlIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJIaWdobGlnaHRGcm9tTm9kZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkFjY2Vzc2libGVTbGlkZXIiLCJBcnJvd0J1dHRvbiIsIlRhbmRlbSIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTcGVjdHJ1bU5vZGUiLCJERUZBVUxUX01JTl9WQUxVRSIsIkRFRkFVTFRfTUFYX1ZBTFVFIiwiU3BlY3RydW1TbGlkZXIiLCJkaXNwb3NlIiwiZGlzcG9zZVNwZWN0cnVtU2xpZGVyIiwidmFsdWVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsImFzc2VydCIsImVuYWJsZWRSYW5nZU1pbiIsIm1pblZhbHVlIiwiZW5hYmxlZFJhbmdlTWF4IiwibWF4VmFsdWUiLCJlbmFibGVkUmFuZ2VQcm9wZXJ0eSIsIm9wdGlvbnMiLCJ2YWx1ZVRvU3RyaW5nIiwidmFsdWUiLCJ2YWx1ZVRvQ29sb3IiLCJ0cmFja1dpZHRoIiwidHJhY2tIZWlnaHQiLCJ0cmFja09wYWNpdHkiLCJ0cmFja0JvcmRlclN0cm9rZSIsInRodW1iV2lkdGgiLCJ0aHVtYkhlaWdodCIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJ0aHVtYk1vdXNlQXJlYVhEaWxhdGlvbiIsInRodW1iTW91c2VBcmVhWURpbGF0aW9uIiwidmFsdWVGb250IiwidmFsdWVGaWxsIiwidmFsdWVWaXNpYmxlIiwidmFsdWVZU3BhY2luZyIsInR3ZWFrZXJzVmlzaWJsZSIsInR3ZWFrZXJWYWx1ZURlbHRhIiwidHdlYWtlcnNYU3BhY2luZyIsIm1heFR3ZWFrZXJzSGVpZ2h0IiwidHdlYWtlcnNUb3VjaEFyZWFYRGlsYXRpb24iLCJ0d2Vha2Vyc1RvdWNoQXJlYVlEaWxhdGlvbiIsInR3ZWFrZXJzTW91c2VBcmVhWERpbGF0aW9uIiwidHdlYWtlcnNNb3VzZUFyZWFZRGlsYXRpb24iLCJjdXJzb3JWaXNpYmxlIiwiY3Vyc29yU3Ryb2tlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwiYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzIiwiXyIsInBpY2siLCJSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMiLCJvbWl0IiwidHJhY2siLCJzaXplIiwib3BhY2l0eSIsImN1cnNvciIsInRyYWNrQm9yZGVyIiwid2lkdGgiLCJoZWlnaHQiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJwaWNrYWJsZSIsInZhbHVlRGlzcGxheSIsIlZhbHVlRGlzcGxheSIsImZvbnQiLCJmaWxsIiwiYm90dG9tIiwidG9wIiwiQ3Vyc29yIiwidGh1bWIiLCJUaHVtYiIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwic2hpZnRlZFkiLCJtb3VzZUFyZWEiLCJwbHVzQnV0dG9uIiwibWludXNCdXR0b24iLCJzZXQiLCJNYXRoIiwibWluIiwiZ2V0IiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWSIsIm1heEhlaWdodCIsImNyZWF0ZVRhbmRlbSIsIm1heCIsInNoaWZ0ZWRYIiwiYWRkQ2hpbGQiLCJwb3NpdGlvblRvVmFsdWUiLCJ4IiwiY2xhbXAiLCJsaW5lYXIiLCJ2YWx1ZVRvUG9zaXRpb24iLCJoYW5kbGVUcmFja0V2ZW50IiwiZXZlbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwiYWRkSW5wdXRMaXN0ZW5lciIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJkcmFnIiwiY2xpY2tYT2Zmc2V0IiwiZm9jdXNIaWdobGlnaHQiLCJ1cGRhdGVVSSIsImNlbnRlclgiLCJlbmFibGVkIiwidmFsdWVMaXN0ZW5lciIsImxpbmsiLCJtaW5YIiwibWF4WCIsInN0cnV0IiwibW92ZVRvQmFjayIsInVubGluayIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwicmFkaXVzU2NhbGUiLCJyYWRpdXMiLCJoeXBvdGVudXNlIiwic3FydCIsInBvdyIsImFuZ2xlIiwiYWNvcyIsImhlaWdodE9mZnNldCIsInNpbiIsInNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiYXJjIiwiUEkiLCJzaWRlQXJjUG9pbnQiLCJnZXRMYXN0UG9pbnQiLCJ5IiwiY2xvc2UiLCJkaXNwb3NlVmFsdWVEaXNwbGF5IiwidmFsdWVPYnNlcnZlciIsInN0cmluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsY0FBYyw0QkFBNEI7QUFHakQsT0FBT0MsZ0JBQWdCLDZCQUE2QjtBQUNwRCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHdCQUF3QiwyQ0FBMkM7QUFDMUUsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLFNBQVNDLEtBQUssRUFBRUMsWUFBWSxF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