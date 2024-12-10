// Copyright 2014-2024, University of Colorado Boulder
/**
 * ToggleSwitch is a switch for toggling between 2 values, similar to iOS' UISwitch, used in iOS `'Settings' app.
 *
 * Interaction behavior is as follows:
 * Drag the thumb to change the value, or click anywhere to toggle the value.
 * If you click without dragging, it's a toggle.
 * If you drag but don't cross the midpoint of the track, then it's a toggle.
 * If you drag past the midpoint of the track, releasing the thumb snaps to whichever end the thumb is closest to.
 * If you drag the thumb far enough to the side (outside of the switch), it will immediately toggle the model behavior.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ import Emitter from '../../axon/js/Emitter.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { DragListener, LinearGradient, Node, Rectangle, SceneryConstants, Voicing } from '../../scenery/js/imports.js';
import sharedSoundPlayers from '../../tambo/js/sharedSoundPlayers.js';
import EventType from '../../tandem/js/EventType.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import sun from './sun.js';
// constants
const DEFAULT_SIZE = new Dimension2(60, 30);
let ToggleSwitch = class ToggleSwitch extends Voicing(Node) {
    dispose() {
        this.disposeToggleSwitch();
        super.dispose();
    }
    /**
   * @param property
   * @param leftValue - value when the switch is in the left position
   * @param rightValue - value when the switch is in the right position
   * @param providedOptions
   */ constructor(property, leftValue, rightValue, providedOptions){
        assert && assert(property.valueComparisonStrategy === 'reference', 'ToggleSwitch depends on "===" equality for value comparison');
        const options = optionize()({
            size: DEFAULT_SIZE,
            toggleWhileDragging: null,
            dragThreshold: 3,
            toggleThreshold: 1,
            thumbFill: null,
            thumbStroke: 'black',
            thumbTouchAreaXDilation: 8,
            thumbTouchAreaYDilation: 8,
            thumbMouseAreaXDilation: 0,
            thumbMouseAreaYDilation: 0,
            trackFillLeft: null,
            trackFillRight: null,
            trackStroke: 'black',
            // VoicingOptions
            cursor: 'pointer',
            disabledOpacity: SceneryConstants.DISABLED_OPACITY,
            // sound generation
            switchToLeftSoundPlayer: sharedSoundPlayers.get('switchToLeft'),
            switchToRightSoundPlayer: sharedSoundPlayers.get('switchToRight'),
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Switch',
            phetioEventType: EventType.USER,
            phetioReadOnly: PhetioObject.DEFAULT_OPTIONS.phetioReadOnly,
            visiblePropertyOptions: {
                phetioFeatured: true
            },
            phetioEnabledPropertyInstrumented: true,
            phetioFeatured: true,
            // pdom
            tagName: 'button',
            accessibleSwitch: true,
            leftValueContextResponse: null,
            rightValueContextResponse: null
        }, providedOptions);
        // Default track fills
        let defaultTrackFill = null;
        if (!options.trackFillLeft || !options.trackFillRight) {
            defaultTrackFill = new LinearGradient(0, 0, 0, options.size.height).addColorStop(0, 'rgb( 40, 40, 40 )').addColorStop(1, 'rgb( 200, 200, 200 )');
        }
        options.trackFillLeft = options.trackFillLeft || defaultTrackFill;
        options.trackFillRight = options.trackFillRight || defaultTrackFill;
        // Default thumb fill
        options.thumbFill = options.thumbFill || new LinearGradient(0, 0, 0, options.size.height).addColorStop(0, 'white').addColorStop(1, 'rgb( 200, 200, 200 )');
        // If an accessibleName is provided, use it as the voicingNameResponse for this component
        if (options.accessibleName) {
            options.voicingNameResponse = options.accessibleName;
        }
        super(), // Emits on input that results in a change to the Property value, after the Property has changed.
        this.onInputEmitter = new Emitter();
        const cornerRadius = options.size.height / 2;
        // track that the thumb slides in
        const trackNode = new Rectangle(0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
            stroke: options.trackStroke,
            fill: options.trackFillLeft
        });
        this.addChild(trackNode);
        // track that covers the background track when the thumbNode is in the right position
        const rightTrackFillRectangle = new Rectangle(0, 0, options.size.width, options.size.height, cornerRadius, cornerRadius, {
            stroke: options.trackStroke,
            fill: options.trackFillRight
        });
        this.addChild(rightTrackFillRectangle);
        // thumb (aka knob)
        const thumbNode = new Rectangle(0, 0, 0.5 * options.size.width, options.size.height, cornerRadius, cornerRadius, {
            fill: options.thumbFill,
            stroke: options.thumbStroke
        });
        this.addChild(thumbNode);
        // thumb touchArea
        if (options.thumbTouchAreaXDilation || options.thumbTouchAreaYDilation) {
            thumbNode.touchArea = Shape.roundRect(-options.thumbTouchAreaXDilation, -options.thumbTouchAreaYDilation, 0.5 * options.size.width + 2 * options.thumbTouchAreaXDilation, options.size.height + 2 * options.thumbTouchAreaYDilation, cornerRadius, cornerRadius);
        }
        // thumb mouseArea
        if (options.thumbMouseAreaXDilation || options.thumbMouseAreaYDilation) {
            thumbNode.mouseArea = Shape.roundRect(-options.thumbMouseAreaXDilation, -options.thumbMouseAreaYDilation, 0.5 * options.size.width + 2 * options.thumbMouseAreaXDilation, options.size.height + 2 * options.thumbMouseAreaYDilation, cornerRadius, cornerRadius);
        }
        // move thumb and fill track
        const update = (value)=>{
            // adjust by half a line width so the thumbNode's stroke is directly on top of the trackNode's stroke when at
            // each end of the track
            const halfLineWidth = trackNode.lineWidth / 2;
            if (value === leftValue) {
                thumbNode.left = -halfLineWidth;
            } else {
                thumbNode.right = options.size.width + halfLineWidth;
            }
            rightTrackFillRectangle.rectWidth = thumbNode.right - halfLineWidth;
            if (options.accessibleSwitch) {
                // pdom - Signify to screen readers that the toggle is pressed. Both aria-pressed and aria-checked
                // are used because using both sounds best with NVDA.
                this.setPDOMAttribute('aria-pressed', value !== leftValue);
                this.setPDOMAttribute('aria-checked', value !== leftValue);
            }
        };
        if (options.accessibleSwitch) {
            this.ariaRole = 'switch';
        }
        // sync with property, must be unlinked in dispose
        property.link(update);
        // thumb interactivity
        const dragThresholdSquared = options.dragThreshold * options.dragThreshold; // comparing squared magnitudes is a bit faster
        const accumulatedDelta = new Vector2(0, 0); // stores how far we are from where our drag started, in our local coordinate frame
        let passedDragThreshold = false; // whether we have dragged far enough to be considered for "drag" behavior (pick closest side), or "tap" behavior (toggle)
        // Action that is performed when the switch is toggled.
        // Toggles the Property value and sends a phet-io message with the old and new values.
        const toggleAction = new PhetioAction((value)=>{
            property.value = value;
            this.onInputEmitter.emit();
        }, {
            parameters: [
                {
                    validValues: [
                        leftValue,
                        rightValue
                    ],
                    phetioPrivate: true
                }
            ],
            tandem: options.tandem.createTandem('toggleAction'),
            phetioDocumentation: 'Occurs when the switch is toggled via user interaction',
            phetioReadOnly: options.phetioReadOnly,
            phetioEventType: EventType.USER
        });
        this.onInputEmitter.addListener(()=>{
            // sound
            property.value === leftValue ? options.switchToLeftSoundPlayer.play() : options.switchToRightSoundPlayer.play();
            // voicing/interactive description
            const alert = property.value === rightValue ? options.rightValueContextResponse : options.leftValueContextResponse;
            if (alert) {
                this.alertDescriptionUtterance(alert);
                this.voicingSpeakResponse({
                    contextResponse: Utterance.alertableToText(alert)
                });
            }
        });
        // Gets the value that corresponds to the current thumb position.
        const thumbPositionToValue = ()=>thumbNode.centerX < trackNode.centerX ? leftValue : rightValue;
        const dragListener = new DragListener({
            tandem: options.tandem.createTandem('dragListener'),
            // Only touch to snag when moving the thumb (don't snag on the track itself),
            // but still support presses in the track to toggle the value.
            canStartPress: (event)=>{
                if (event && (event.type === 'move' || event.type === 'enter')) {
                    return _.includes(event.trail.nodes, thumbNode);
                } else {
                    return true;
                }
            },
            start: ()=>{
                // resets our state
                accumulatedDelta.setXY(0, 0); // reset it mutably (less allocation)
                passedDragThreshold = false;
            },
            drag: (event, listener)=>{
                accumulatedDelta.add(listener.modelDelta);
                passedDragThreshold = passedDragThreshold || accumulatedDelta.magnitudeSquared > dragThresholdSquared;
                // center the thumb on the pointer's x-coordinate if possible (but clamp to left and right ends)
                const viewPoint = listener.getCurrentTarget().globalToLocalPoint(event.pointer.point);
                const halfThumbWidth = thumbNode.width / 2;
                const halfLineWidth = trackNode.lineWidth / 2;
                thumbNode.centerX = Utils.clamp(viewPoint.x, halfThumbWidth - halfLineWidth, options.size.width - halfThumbWidth + halfLineWidth);
                rightTrackFillRectangle.rectWidth = thumbNode.right - halfLineWidth;
                // whether the thumb is dragged outside of the possible range far enough beyond our threshold to potentially
                // trigger an immediate model change
                const isDraggedOutside = viewPoint.x < (1 - 2 * options.toggleThreshold) * halfThumbWidth || viewPoint.x > (-1 + 2 * options.toggleThreshold) * halfThumbWidth + options.size.width;
                // value that corresponds to the current thumb position
                const value = thumbPositionToValue();
                if (options.toggleWhileDragging === true || isDraggedOutside && options.toggleWhileDragging === null) {
                    // Only signify a change if the value actually changed to avoid duplicate messages in the PhET-iO Event
                    // stream, see https://github.com/phetsims/phet-io/issues/369
                    if (property.value !== value) {
                        toggleAction.execute(value);
                    }
                }
            },
            end: ()=>{
                // if moved past the threshold, choose value based on the side, otherwise just toggle
                const toggleValue = property.value === leftValue ? rightValue : leftValue;
                const value = passedDragThreshold ? thumbPositionToValue() : toggleValue;
                if (property.value !== value) {
                    toggleAction.execute(value);
                }
                // update the thumb position (sanity check that it's here, only needs to be run if passedDragThreshold===true)
                update(value);
            },
            // pdom - allow click events to toggle the ToggleSwitch, even though it uses DragListener
            canClick: true
        });
        this.addInputListener(dragListener);
        this.mutate(options);
        // Add a link to the Property that this switch controls
        this.addLinkedElement(property, {
            tandemName: 'property'
        });
        // Make the sound players available to external clients that directly set the Property and thus should play the
        // corresponding sound.
        this.switchToLeftSoundPlayer = options.switchToLeftSoundPlayer;
        this.switchToRightSoundPlayer = options.switchToRightSoundPlayer;
        this.disposeToggleSwitch = ()=>{
            trackNode.dispose();
            rightTrackFillRectangle.dispose();
            property.unlink(update);
            toggleAction.dispose();
            dragListener.dispose();
            this.onInputEmitter.dispose();
        };
    }
};
export { ToggleSwitch as default };
sun.register('ToggleSwitch', ToggleSwitch);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Ub2dnbGVTd2l0Y2gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVG9nZ2xlU3dpdGNoIGlzIGEgc3dpdGNoIGZvciB0b2dnbGluZyBiZXR3ZWVuIDIgdmFsdWVzLCBzaW1pbGFyIHRvIGlPUycgVUlTd2l0Y2gsIHVzZWQgaW4gaU9TIGAnU2V0dGluZ3MnIGFwcC5cbiAqXG4gKiBJbnRlcmFjdGlvbiBiZWhhdmlvciBpcyBhcyBmb2xsb3dzOlxuICogRHJhZyB0aGUgdGh1bWIgdG8gY2hhbmdlIHRoZSB2YWx1ZSwgb3IgY2xpY2sgYW55d2hlcmUgdG8gdG9nZ2xlIHRoZSB2YWx1ZS5cbiAqIElmIHlvdSBjbGljayB3aXRob3V0IGRyYWdnaW5nLCBpdCdzIGEgdG9nZ2xlLlxuICogSWYgeW91IGRyYWcgYnV0IGRvbid0IGNyb3NzIHRoZSBtaWRwb2ludCBvZiB0aGUgdHJhY2ssIHRoZW4gaXQncyBhIHRvZ2dsZS5cbiAqIElmIHlvdSBkcmFnIHBhc3QgdGhlIG1pZHBvaW50IG9mIHRoZSB0cmFjaywgcmVsZWFzaW5nIHRoZSB0aHVtYiBzbmFwcyB0byB3aGljaGV2ZXIgZW5kIHRoZSB0aHVtYiBpcyBjbG9zZXN0IHRvLlxuICogSWYgeW91IGRyYWcgdGhlIHRodW1iIGZhciBlbm91Z2ggdG8gdGhlIHNpZGUgKG91dHNpZGUgb2YgdGhlIHN3aXRjaCksIGl0IHdpbGwgaW1tZWRpYXRlbHkgdG9nZ2xlIHRoZSBtb2RlbCBiZWhhdmlvci5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgU2NlbmVyeUNvbnN0YW50cywgVFBhaW50LCBUcmltUGFyYWxsZWxET01PcHRpb25zLCBWb2ljaW5nLCBWb2ljaW5nT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2hhcmVkU291bmRQbGF5ZXJzIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NoYXJlZFNvdW5kUGxheWVycy5qcyc7XG5pbXBvcnQgVFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1RTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgRXZlbnRUeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9FdmVudFR5cGUuanMnO1xuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFV0dGVyYW5jZSwgeyBUQWxlcnRhYmxlIH0gZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1V0dGVyYW5jZS5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBERUZBVUxUX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggNjAsIDMwICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gaWYgeW91IHdhbnQgdGhlIHRodW1iIHRvIGJlIGEgY2lyY2xlLCB1c2Ugd2lkdGggdGhhdCBpcyAyeCBoZWlnaHRcbiAgc2l6ZT86IERpbWVuc2lvbjI7XG5cbiAgLy8gY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIHdoZW4gbW9kZWwgdmFsdWUgY2hhbmdlcyBvY2N1ciBkdXJpbmcgZHJhZ2dpbmcgKGlmIGFueSlcbiAgLy8gbnVsbDogdHJpZ2dlcnMgbW9kZWwgY2hhbmdlcyB3aGVuIHRodW1iIGlzIGRyYWdnZWQgZmFyIGVub3VnaCB0byB0aGUgc2lkZSwgc2ltaWxhciB0byBpT1NcbiAgLy8gdHJ1ZTogdHJpZ2dlcnMgbW9kZWwgY2hhbmdlcyB3aGVuZXZlciB0aGUgdGh1bWIgY3Jvc3NlcyBzaWRlc1xuICAvLyBmYWxzZTogb25seSB0cmlnZ2VyIG1vZGVsIGNoYW5nZXMgdW50aWwgcmVsZWFzZVxuICB0b2dnbGVXaGlsZURyYWdnaW5nPzogbnVsbCB8IGJvb2xlYW47XG5cbiAgLy8gbnVtYmVyIG9mIHZpZXctc3BhY2UgdW5pdHMgdGhlIGRyYWcgbmVlZHMgdG8gY292ZXIgdG8gYmUgY29uc2lkZXJlZCBhIFwiZHJhZ1wiIGluc3RlYWQgb2YgYSBcImNsaWNrL3RhcFwiXG4gIGRyYWdUaHJlc2hvbGQ/OiBudW1iZXI7XG5cbiAgLy8gbnVtYmVyIG9mIHRodW1iLXdpZHRocyBvdXRzaWRlIHRoZSBub3JtYWwgcmFuZ2UgcGFzdCB3aGVyZSB0aGUgbW9kZWwgdmFsdWUgd2lsbCBjaGFuZ2VcbiAgdG9nZ2xlVGhyZXNob2xkPzogbnVtYmVyO1xuXG4gIC8vIHRodW1iXG4gIHRodW1iRmlsbD86IFRQYWludDtcbiAgdGh1bWJTdHJva2U/OiBUUGFpbnQ7XG4gIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcbiAgdGh1bWJNb3VzZUFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIHRodW1iTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIC8vIHRyYWNrXG4gIHRyYWNrRmlsbExlZnQ/OiBUUGFpbnQ7IC8vIHRyYWNrIGZpbGwgd2hlbiBwcm9wZXJ0eS52YWx1ZSA9PSBsZWZ0VmFsdWUsIGRlZmF1bHQgY29tcHV0ZWQgYmVsb3dcbiAgdHJhY2tGaWxsUmlnaHQ/OiBUUGFpbnQ7IC8vIHRyYWNrIGZpbGwgd2hlbiBwcm9wZXJ0eS52YWx1ZSA9PSByaWdodFZhbHVlLCBkZWZhdWx0IGNvbXB1dGVkIGJlbG93XG4gIHRyYWNrU3Ryb2tlPzogVFBhaW50O1xuXG4gIC8vIHNvdW5kXG4gIHN3aXRjaFRvTGVmdFNvdW5kUGxheWVyPzogVFNvdW5kUGxheWVyO1xuICBzd2l0Y2hUb1JpZ2h0U291bmRQbGF5ZXI/OiBUU291bmRQbGF5ZXI7XG5cbiAgLy8gSWYgcHJvdmlkZWQsIHRoZXNlIHJlc3BvbnNlcyB3aWxsIGJlIHNwb2tlbiB0byBkZXNjcmliZSB0aGUgY2hhbmdlIGluIGNvbnRleHQgZm9yIGJvdGggVm9pY2luZ1xuICAvLyBhbmQgSW50ZXJhY3RpdmUgRGVzY3JpcHRpb24gZmVhdHVyZXMgd2hlbiB2YWx1ZSBjaGFuZ2VzIHRvIGVpdGhlciBsZWZ0IG9yIHJpZ2h0IHZhbHVlLlxuICBsZWZ0VmFsdWVDb250ZXh0UmVzcG9uc2U/OiBUQWxlcnRhYmxlO1xuICByaWdodFZhbHVlQ29udGV4dFJlc3BvbnNlPzogVEFsZXJ0YWJsZTtcblxuICAvLyBwZG9tIC0gSWYgdHJ1ZSwgYXJpYSBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byB0aGlzIE5vZGUgdG8gaW5kaWNhdGUgdGhhdCBpdCBpcyBhIHN3aXRjaC5cbiAgLy8gQXJpYSBzd2l0Y2hlcyBkbyBub3Qgd29yayB3ZWxsIHdoZW4gc2VsZWN0aW5nIGJldHdlZW4gbm9uLWJvb2xlYW4gdmFsdWVzLCBzbyB5b3UgY2FuIGRpc2FibGUgdGhpcyBpZiBuZWVkZWQuXG4gIGFjY2Vzc2libGVTd2l0Y2g/OiBib29sZWFuO1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IFZvaWNpbmdPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5leHBvcnQgdHlwZSBUb2dnbGVTd2l0Y2hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBUcmltUGFyYWxsZWxET01PcHRpb25zPFBhcmVudE9wdGlvbnM+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2dnbGVTd2l0Y2g8VD4gZXh0ZW5kcyBWb2ljaW5nKCBOb2RlICkge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVRvZ2dsZVN3aXRjaDogKCkgPT4gdm9pZDtcbiAgcHVibGljIHJlYWRvbmx5IHN3aXRjaFRvTGVmdFNvdW5kUGxheWVyOiBUU291bmRQbGF5ZXI7XG4gIHB1YmxpYyByZWFkb25seSBzd2l0Y2hUb1JpZ2h0U291bmRQbGF5ZXI6IFRTb3VuZFBsYXllcjtcblxuICAvLyBFbWl0cyBvbiBpbnB1dCB0aGF0IHJlc3VsdHMgaW4gYSBjaGFuZ2UgdG8gdGhlIFByb3BlcnR5IHZhbHVlLCBhZnRlciB0aGUgUHJvcGVydHkgaGFzIGNoYW5nZWQuXG4gIHB1YmxpYyByZWFkb25seSBvbklucHV0RW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gcHJvcGVydHlcbiAgICogQHBhcmFtIGxlZnRWYWx1ZSAtIHZhbHVlIHdoZW4gdGhlIHN3aXRjaCBpcyBpbiB0aGUgbGVmdCBwb3NpdGlvblxuICAgKiBAcGFyYW0gcmlnaHRWYWx1ZSAtIHZhbHVlIHdoZW4gdGhlIHN3aXRjaCBpcyBpbiB0aGUgcmlnaHQgcG9zaXRpb25cbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogUHJvcGVydHk8VD4sIGxlZnRWYWx1ZTogVCwgcmlnaHRWYWx1ZTogVCwgcHJvdmlkZWRPcHRpb25zPzogVG9nZ2xlU3dpdGNoT3B0aW9ucyApIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3BlcnR5LnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID09PSAncmVmZXJlbmNlJyxcbiAgICAgICdUb2dnbGVTd2l0Y2ggZGVwZW5kcyBvbiBcIj09PVwiIGVxdWFsaXR5IGZvciB2YWx1ZSBjb21wYXJpc29uJyApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUb2dnbGVTd2l0Y2hPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuXG4gICAgICBzaXplOiBERUZBVUxUX1NJWkUsXG4gICAgICB0b2dnbGVXaGlsZURyYWdnaW5nOiBudWxsLFxuICAgICAgZHJhZ1RocmVzaG9sZDogMyxcbiAgICAgIHRvZ2dsZVRocmVzaG9sZDogMSxcbiAgICAgIHRodW1iRmlsbDogbnVsbCwgLy8ge0NvbG9yfHN0cmluZ30gdGh1bWIgZmlsbCwgZGVmYXVsdCBjb21wdXRlZCBiZWxvd1xuICAgICAgdGh1bWJTdHJva2U6ICdibGFjaycsXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogOCxcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiA4LFxuICAgICAgdGh1bWJNb3VzZUFyZWFYRGlsYXRpb246IDAsXG4gICAgICB0aHVtYk1vdXNlQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIHRyYWNrRmlsbExlZnQ6IG51bGwsXG4gICAgICB0cmFja0ZpbGxSaWdodDogbnVsbCxcbiAgICAgIHRyYWNrU3Ryb2tlOiAnYmxhY2snLFxuXG4gICAgICAvLyBWb2ljaW5nT3B0aW9uc1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICBkaXNhYmxlZE9wYWNpdHk6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWSxcblxuICAgICAgLy8gc291bmQgZ2VuZXJhdGlvblxuICAgICAgc3dpdGNoVG9MZWZ0U291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdzd2l0Y2hUb0xlZnQnICksXG4gICAgICBzd2l0Y2hUb1JpZ2h0U291bmRQbGF5ZXI6IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdzd2l0Y2hUb1JpZ2h0JyApLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdTd2l0Y2gnLFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUixcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxuICAgICAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLCAvLyBvcHQgaW50byBkZWZhdWx0IFBoRVQtaU8gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eVxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG5cbiAgICAgIC8vIHBkb21cbiAgICAgIHRhZ05hbWU6ICdidXR0b24nLFxuICAgICAgYWNjZXNzaWJsZVN3aXRjaDogdHJ1ZSxcblxuICAgICAgbGVmdFZhbHVlQ29udGV4dFJlc3BvbnNlOiBudWxsLFxuICAgICAgcmlnaHRWYWx1ZUNvbnRleHRSZXNwb25zZTogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gRGVmYXVsdCB0cmFjayBmaWxsc1xuICAgIGxldCBkZWZhdWx0VHJhY2tGaWxsID0gbnVsbDtcbiAgICBpZiAoICFvcHRpb25zLnRyYWNrRmlsbExlZnQgfHwgIW9wdGlvbnMudHJhY2tGaWxsUmlnaHQgKSB7XG4gICAgICBkZWZhdWx0VHJhY2tGaWxsID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBvcHRpb25zLnNpemUuaGVpZ2h0IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgJ3JnYiggNDAsIDQwLCA0MCApJyApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsICdyZ2IoIDIwMCwgMjAwLCAyMDAgKScgKTtcbiAgICB9XG4gICAgb3B0aW9ucy50cmFja0ZpbGxMZWZ0ID0gb3B0aW9ucy50cmFja0ZpbGxMZWZ0IHx8IGRlZmF1bHRUcmFja0ZpbGw7XG4gICAgb3B0aW9ucy50cmFja0ZpbGxSaWdodCA9IG9wdGlvbnMudHJhY2tGaWxsUmlnaHQgfHwgZGVmYXVsdFRyYWNrRmlsbDtcblxuICAgIC8vIERlZmF1bHQgdGh1bWIgZmlsbFxuICAgIG9wdGlvbnMudGh1bWJGaWxsID0gb3B0aW9ucy50aHVtYkZpbGwgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgMCwgb3B0aW9ucy5zaXplLmhlaWdodCApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDAsICd3aGl0ZScgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLCAncmdiKCAyMDAsIDIwMCwgMjAwICknICk7XG5cbiAgICAvLyBJZiBhbiBhY2Nlc3NpYmxlTmFtZSBpcyBwcm92aWRlZCwgdXNlIGl0IGFzIHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlIGZvciB0aGlzIGNvbXBvbmVudFxuICAgIGlmICggb3B0aW9ucy5hY2Nlc3NpYmxlTmFtZSApIHtcbiAgICAgIG9wdGlvbnMudm9pY2luZ05hbWVSZXNwb25zZSA9IG9wdGlvbnMuYWNjZXNzaWJsZU5hbWU7XG4gICAgfVxuXG4gICAgc3VwZXIoKTtcblxuICAgIGNvbnN0IGNvcm5lclJhZGl1cyA9IG9wdGlvbnMuc2l6ZS5oZWlnaHQgLyAyO1xuXG4gICAgLy8gdHJhY2sgdGhhdCB0aGUgdGh1bWIgc2xpZGVzIGluXG4gICAgY29uc3QgdHJhY2tOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy5zaXplLndpZHRoLCBvcHRpb25zLnNpemUuaGVpZ2h0LCBjb3JuZXJSYWRpdXMsIGNvcm5lclJhZGl1cywge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLnRyYWNrU3Ryb2tlLFxuICAgICAgZmlsbDogb3B0aW9ucy50cmFja0ZpbGxMZWZ0XG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRyYWNrTm9kZSApO1xuXG4gICAgLy8gdHJhY2sgdGhhdCBjb3ZlcnMgdGhlIGJhY2tncm91bmQgdHJhY2sgd2hlbiB0aGUgdGh1bWJOb2RlIGlzIGluIHRoZSByaWdodCBwb3NpdGlvblxuICAgIGNvbnN0IHJpZ2h0VHJhY2tGaWxsUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy5zaXplLndpZHRoLCBvcHRpb25zLnNpemUuaGVpZ2h0LCBjb3JuZXJSYWRpdXMsIGNvcm5lclJhZGl1cywge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLnRyYWNrU3Ryb2tlLFxuICAgICAgZmlsbDogb3B0aW9ucy50cmFja0ZpbGxSaWdodFxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCByaWdodFRyYWNrRmlsbFJlY3RhbmdsZSApO1xuXG4gICAgLy8gdGh1bWIgKGFrYSBrbm9iKVxuICAgIGNvbnN0IHRodW1iTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDAuNSAqIG9wdGlvbnMuc2l6ZS53aWR0aCwgb3B0aW9ucy5zaXplLmhlaWdodCwgY29ybmVyUmFkaXVzLCBjb3JuZXJSYWRpdXMsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMudGh1bWJGaWxsLFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnRodW1iU3Ryb2tlXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRodW1iTm9kZSApO1xuXG4gICAgLy8gdGh1bWIgdG91Y2hBcmVhXG4gICAgaWYgKCBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uIHx8IG9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24gKSB7XG4gICAgICB0aHVtYk5vZGUudG91Y2hBcmVhID0gU2hhcGUucm91bmRSZWN0KFxuICAgICAgICAtb3B0aW9ucy50aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiwgLW9wdGlvbnMudGh1bWJUb3VjaEFyZWFZRGlsYXRpb24sXG4gICAgICAgICggMC41ICogb3B0aW9ucy5zaXplLndpZHRoICkgKyAoIDIgKiBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uICksXG4gICAgICAgIG9wdGlvbnMuc2l6ZS5oZWlnaHQgKyAoIDIgKiBvcHRpb25zLnRodW1iVG91Y2hBcmVhWURpbGF0aW9uICksIGNvcm5lclJhZGl1cywgY29ybmVyUmFkaXVzICk7XG4gICAgfVxuXG4gICAgLy8gdGh1bWIgbW91c2VBcmVhXG4gICAgaWYgKCBvcHRpb25zLnRodW1iTW91c2VBcmVhWERpbGF0aW9uIHx8IG9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24gKSB7XG4gICAgICB0aHVtYk5vZGUubW91c2VBcmVhID0gU2hhcGUucm91bmRSZWN0KFxuICAgICAgICAtb3B0aW9ucy50aHVtYk1vdXNlQXJlYVhEaWxhdGlvbiwgLW9wdGlvbnMudGh1bWJNb3VzZUFyZWFZRGlsYXRpb24sXG4gICAgICAgICggMC41ICogb3B0aW9ucy5zaXplLndpZHRoICkgKyAoIDIgKiBvcHRpb25zLnRodW1iTW91c2VBcmVhWERpbGF0aW9uICksXG4gICAgICAgIG9wdGlvbnMuc2l6ZS5oZWlnaHQgKyAoIDIgKiBvcHRpb25zLnRodW1iTW91c2VBcmVhWURpbGF0aW9uICksIGNvcm5lclJhZGl1cywgY29ybmVyUmFkaXVzICk7XG4gICAgfVxuXG4gICAgLy8gbW92ZSB0aHVtYiBhbmQgZmlsbCB0cmFja1xuICAgIGNvbnN0IHVwZGF0ZSA9ICggdmFsdWU6IFQgKSA9PiB7XG5cbiAgICAgIC8vIGFkanVzdCBieSBoYWxmIGEgbGluZSB3aWR0aCBzbyB0aGUgdGh1bWJOb2RlJ3Mgc3Ryb2tlIGlzIGRpcmVjdGx5IG9uIHRvcCBvZiB0aGUgdHJhY2tOb2RlJ3Mgc3Ryb2tlIHdoZW4gYXRcbiAgICAgIC8vIGVhY2ggZW5kIG9mIHRoZSB0cmFja1xuICAgICAgY29uc3QgaGFsZkxpbmVXaWR0aCA9IHRyYWNrTm9kZS5saW5lV2lkdGggLyAyO1xuICAgICAgaWYgKCB2YWx1ZSA9PT0gbGVmdFZhbHVlICkge1xuICAgICAgICB0aHVtYk5vZGUubGVmdCA9IC1oYWxmTGluZVdpZHRoO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRodW1iTm9kZS5yaWdodCA9IG9wdGlvbnMuc2l6ZS53aWR0aCArIGhhbGZMaW5lV2lkdGg7XG4gICAgICB9XG4gICAgICByaWdodFRyYWNrRmlsbFJlY3RhbmdsZS5yZWN0V2lkdGggPSB0aHVtYk5vZGUucmlnaHQgLSBoYWxmTGluZVdpZHRoO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuYWNjZXNzaWJsZVN3aXRjaCApIHtcblxuICAgICAgICAvLyBwZG9tIC0gU2lnbmlmeSB0byBzY3JlZW4gcmVhZGVycyB0aGF0IHRoZSB0b2dnbGUgaXMgcHJlc3NlZC4gQm90aCBhcmlhLXByZXNzZWQgYW5kIGFyaWEtY2hlY2tlZFxuICAgICAgICAvLyBhcmUgdXNlZCBiZWNhdXNlIHVzaW5nIGJvdGggc291bmRzIGJlc3Qgd2l0aCBOVkRBLlxuICAgICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICdhcmlhLXByZXNzZWQnLCB2YWx1ZSAhPT0gbGVmdFZhbHVlICk7XG4gICAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtY2hlY2tlZCcsIHZhbHVlICE9PSBsZWZ0VmFsdWUgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCBvcHRpb25zLmFjY2Vzc2libGVTd2l0Y2ggKSB7XG4gICAgICB0aGlzLmFyaWFSb2xlID0gJ3N3aXRjaCc7XG4gICAgfVxuXG4gICAgLy8gc3luYyB3aXRoIHByb3BlcnR5LCBtdXN0IGJlIHVubGlua2VkIGluIGRpc3Bvc2VcbiAgICBwcm9wZXJ0eS5saW5rKCB1cGRhdGUgKTtcblxuICAgIC8vIHRodW1iIGludGVyYWN0aXZpdHlcbiAgICBjb25zdCBkcmFnVGhyZXNob2xkU3F1YXJlZCA9IG9wdGlvbnMuZHJhZ1RocmVzaG9sZCAqIG9wdGlvbnMuZHJhZ1RocmVzaG9sZDsgLy8gY29tcGFyaW5nIHNxdWFyZWQgbWFnbml0dWRlcyBpcyBhIGJpdCBmYXN0ZXJcbiAgICBjb25zdCBhY2N1bXVsYXRlZERlbHRhID0gbmV3IFZlY3RvcjIoIDAsIDAgKTsgLy8gc3RvcmVzIGhvdyBmYXIgd2UgYXJlIGZyb20gd2hlcmUgb3VyIGRyYWcgc3RhcnRlZCwgaW4gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcbiAgICBsZXQgcGFzc2VkRHJhZ1RocmVzaG9sZCA9IGZhbHNlOyAvLyB3aGV0aGVyIHdlIGhhdmUgZHJhZ2dlZCBmYXIgZW5vdWdoIHRvIGJlIGNvbnNpZGVyZWQgZm9yIFwiZHJhZ1wiIGJlaGF2aW9yIChwaWNrIGNsb3Nlc3Qgc2lkZSksIG9yIFwidGFwXCIgYmVoYXZpb3IgKHRvZ2dsZSlcblxuICAgIC8vIEFjdGlvbiB0aGF0IGlzIHBlcmZvcm1lZCB3aGVuIHRoZSBzd2l0Y2ggaXMgdG9nZ2xlZC5cbiAgICAvLyBUb2dnbGVzIHRoZSBQcm9wZXJ0eSB2YWx1ZSBhbmQgc2VuZHMgYSBwaGV0LWlvIG1lc3NhZ2Ugd2l0aCB0aGUgb2xkIGFuZCBuZXcgdmFsdWVzLlxuICAgIGNvbnN0IHRvZ2dsZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb248WyBUIF0+KCB2YWx1ZSA9PiB7XG4gICAgICBwcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xuXG4gICAgICB0aGlzLm9uSW5wdXRFbWl0dGVyLmVtaXQoKTtcbiAgICB9LCB7XG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsaWRWYWx1ZXM6IFsgbGVmdFZhbHVlLCByaWdodFZhbHVlIF0sIHBoZXRpb1ByaXZhdGU6IHRydWUgfSBdLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b2dnbGVBY3Rpb24nICksXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnT2NjdXJzIHdoZW4gdGhlIHN3aXRjaCBpcyB0b2dnbGVkIHZpYSB1c2VyIGludGVyYWN0aW9uJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiBvcHRpb25zLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuVVNFUlxuICAgIH0gKTtcblxuICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcblxuICAgICAgLy8gc291bmRcbiAgICAgIHByb3BlcnR5LnZhbHVlID09PSBsZWZ0VmFsdWUgPyBvcHRpb25zLnN3aXRjaFRvTGVmdFNvdW5kUGxheWVyLnBsYXkoKSA6IG9wdGlvbnMuc3dpdGNoVG9SaWdodFNvdW5kUGxheWVyLnBsYXkoKTtcblxuICAgICAgLy8gdm9pY2luZy9pbnRlcmFjdGl2ZSBkZXNjcmlwdGlvblxuICAgICAgY29uc3QgYWxlcnQgPSBwcm9wZXJ0eS52YWx1ZSA9PT0gcmlnaHRWYWx1ZSA/IG9wdGlvbnMucmlnaHRWYWx1ZUNvbnRleHRSZXNwb25zZSA6IG9wdGlvbnMubGVmdFZhbHVlQ29udGV4dFJlc3BvbnNlO1xuICAgICAgaWYgKCBhbGVydCApIHtcbiAgICAgICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBhbGVydCApO1xuICAgICAgICB0aGlzLnZvaWNpbmdTcGVha1Jlc3BvbnNlKCB7XG4gICAgICAgICAgY29udGV4dFJlc3BvbnNlOiBVdHRlcmFuY2UuYWxlcnRhYmxlVG9UZXh0KCBhbGVydCApXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBHZXRzIHRoZSB2YWx1ZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IHRodW1iIHBvc2l0aW9uLlxuICAgIGNvbnN0IHRodW1iUG9zaXRpb25Ub1ZhbHVlID0gKCkgPT4gKCB0aHVtYk5vZGUuY2VudGVyWCA8IHRyYWNrTm9kZS5jZW50ZXJYICkgPyBsZWZ0VmFsdWUgOiByaWdodFZhbHVlO1xuXG4gICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkcmFnTGlzdGVuZXInICksXG5cbiAgICAgIC8vIE9ubHkgdG91Y2ggdG8gc25hZyB3aGVuIG1vdmluZyB0aGUgdGh1bWIgKGRvbid0IHNuYWcgb24gdGhlIHRyYWNrIGl0c2VsZiksXG4gICAgICAvLyBidXQgc3RpbGwgc3VwcG9ydCBwcmVzc2VzIGluIHRoZSB0cmFjayB0byB0b2dnbGUgdGhlIHZhbHVlLlxuICAgICAgY2FuU3RhcnRQcmVzczogZXZlbnQgPT4ge1xuICAgICAgICBpZiAoIGV2ZW50ICYmICggZXZlbnQudHlwZSA9PT0gJ21vdmUnIHx8IGV2ZW50LnR5cGUgPT09ICdlbnRlcicgKSApIHtcbiAgICAgICAgICByZXR1cm4gXy5pbmNsdWRlcyggZXZlbnQudHJhaWwubm9kZXMsIHRodW1iTm9kZSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBzdGFydDogKCkgPT4ge1xuICAgICAgICAvLyByZXNldHMgb3VyIHN0YXRlXG4gICAgICAgIGFjY3VtdWxhdGVkRGVsdGEuc2V0WFkoIDAsIDAgKTsgLy8gcmVzZXQgaXQgbXV0YWJseSAobGVzcyBhbGxvY2F0aW9uKVxuICAgICAgICBwYXNzZWREcmFnVGhyZXNob2xkID0gZmFsc2U7XG4gICAgICB9LFxuXG4gICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcblxuICAgICAgICBhY2N1bXVsYXRlZERlbHRhLmFkZCggbGlzdGVuZXIubW9kZWxEZWx0YSApO1xuICAgICAgICBwYXNzZWREcmFnVGhyZXNob2xkID0gcGFzc2VkRHJhZ1RocmVzaG9sZCB8fCAoIGFjY3VtdWxhdGVkRGVsdGEubWFnbml0dWRlU3F1YXJlZCA+IGRyYWdUaHJlc2hvbGRTcXVhcmVkICk7XG5cbiAgICAgICAgLy8gY2VudGVyIHRoZSB0aHVtYiBvbiB0aGUgcG9pbnRlcidzIHgtY29vcmRpbmF0ZSBpZiBwb3NzaWJsZSAoYnV0IGNsYW1wIHRvIGxlZnQgYW5kIHJpZ2h0IGVuZHMpXG4gICAgICAgIGNvbnN0IHZpZXdQb2ludCA9IGxpc3RlbmVyLmdldEN1cnJlbnRUYXJnZXQoKS5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKTtcbiAgICAgICAgY29uc3QgaGFsZlRodW1iV2lkdGggPSB0aHVtYk5vZGUud2lkdGggLyAyO1xuICAgICAgICBjb25zdCBoYWxmTGluZVdpZHRoID0gdHJhY2tOb2RlLmxpbmVXaWR0aCAvIDI7XG4gICAgICAgIHRodW1iTm9kZS5jZW50ZXJYID0gVXRpbHMuY2xhbXAoIHZpZXdQb2ludC54LCBoYWxmVGh1bWJXaWR0aCAtIGhhbGZMaW5lV2lkdGgsIG9wdGlvbnMuc2l6ZS53aWR0aCAtIGhhbGZUaHVtYldpZHRoICsgaGFsZkxpbmVXaWR0aCApO1xuICAgICAgICByaWdodFRyYWNrRmlsbFJlY3RhbmdsZS5yZWN0V2lkdGggPSB0aHVtYk5vZGUucmlnaHQgLSBoYWxmTGluZVdpZHRoO1xuXG4gICAgICAgIC8vIHdoZXRoZXIgdGhlIHRodW1iIGlzIGRyYWdnZWQgb3V0c2lkZSBvZiB0aGUgcG9zc2libGUgcmFuZ2UgZmFyIGVub3VnaCBiZXlvbmQgb3VyIHRocmVzaG9sZCB0byBwb3RlbnRpYWxseVxuICAgICAgICAvLyB0cmlnZ2VyIGFuIGltbWVkaWF0ZSBtb2RlbCBjaGFuZ2VcbiAgICAgICAgY29uc3QgaXNEcmFnZ2VkT3V0c2lkZSA9IHZpZXdQb2ludC54IDwgKCAxIC0gMiAqIG9wdGlvbnMudG9nZ2xlVGhyZXNob2xkICkgKiBoYWxmVGh1bWJXaWR0aCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlld1BvaW50LnggPiAoIC0xICsgMiAqIG9wdGlvbnMudG9nZ2xlVGhyZXNob2xkICkgKiBoYWxmVGh1bWJXaWR0aCArIG9wdGlvbnMuc2l6ZS53aWR0aDtcblxuICAgICAgICAvLyB2YWx1ZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IHRodW1iIHBvc2l0aW9uXG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGh1bWJQb3NpdGlvblRvVmFsdWUoKTtcblxuXG4gICAgICAgIGlmICggb3B0aW9ucy50b2dnbGVXaGlsZURyYWdnaW5nID09PSB0cnVlIHx8ICggaXNEcmFnZ2VkT3V0c2lkZSAmJiBvcHRpb25zLnRvZ2dsZVdoaWxlRHJhZ2dpbmcgPT09IG51bGwgKSApIHtcblxuICAgICAgICAgIC8vIE9ubHkgc2lnbmlmeSBhIGNoYW5nZSBpZiB0aGUgdmFsdWUgYWN0dWFsbHkgY2hhbmdlZCB0byBhdm9pZCBkdXBsaWNhdGUgbWVzc2FnZXMgaW4gdGhlIFBoRVQtaU8gRXZlbnRcbiAgICAgICAgICAvLyBzdHJlYW0sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMzY5XG4gICAgICAgICAgaWYgKCBwcm9wZXJ0eS52YWx1ZSAhPT0gdmFsdWUgKSB7XG4gICAgICAgICAgICB0b2dnbGVBY3Rpb24uZXhlY3V0ZSggdmFsdWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGVuZDogKCkgPT4ge1xuXG4gICAgICAgIC8vIGlmIG1vdmVkIHBhc3QgdGhlIHRocmVzaG9sZCwgY2hvb3NlIHZhbHVlIGJhc2VkIG9uIHRoZSBzaWRlLCBvdGhlcndpc2UganVzdCB0b2dnbGVcbiAgICAgICAgY29uc3QgdG9nZ2xlVmFsdWUgPSAoIHByb3BlcnR5LnZhbHVlID09PSBsZWZ0VmFsdWUgPyByaWdodFZhbHVlIDogbGVmdFZhbHVlICk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcGFzc2VkRHJhZ1RocmVzaG9sZCA/IHRodW1iUG9zaXRpb25Ub1ZhbHVlKCkgOiB0b2dnbGVWYWx1ZTtcblxuICAgICAgICBpZiAoIHByb3BlcnR5LnZhbHVlICE9PSB2YWx1ZSApIHtcbiAgICAgICAgICB0b2dnbGVBY3Rpb24uZXhlY3V0ZSggdmFsdWUgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgdGh1bWIgcG9zaXRpb24gKHNhbml0eSBjaGVjayB0aGF0IGl0J3MgaGVyZSwgb25seSBuZWVkcyB0byBiZSBydW4gaWYgcGFzc2VkRHJhZ1RocmVzaG9sZD09PXRydWUpXG4gICAgICAgIHVwZGF0ZSggdmFsdWUgKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIHBkb20gLSBhbGxvdyBjbGljayBldmVudHMgdG8gdG9nZ2xlIHRoZSBUb2dnbGVTd2l0Y2gsIGV2ZW4gdGhvdWdoIGl0IHVzZXMgRHJhZ0xpc3RlbmVyXG4gICAgICBjYW5DbGljazogdHJ1ZVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIEFkZCBhIGxpbmsgdG8gdGhlIFByb3BlcnR5IHRoYXQgdGhpcyBzd2l0Y2ggY29udHJvbHNcbiAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIHByb3BlcnR5LCB7XG4gICAgICB0YW5kZW1OYW1lOiAncHJvcGVydHknXG4gICAgfSApO1xuXG4gICAgLy8gTWFrZSB0aGUgc291bmQgcGxheWVycyBhdmFpbGFibGUgdG8gZXh0ZXJuYWwgY2xpZW50cyB0aGF0IGRpcmVjdGx5IHNldCB0aGUgUHJvcGVydHkgYW5kIHRodXMgc2hvdWxkIHBsYXkgdGhlXG4gICAgLy8gY29ycmVzcG9uZGluZyBzb3VuZC5cbiAgICB0aGlzLnN3aXRjaFRvTGVmdFNvdW5kUGxheWVyID0gb3B0aW9ucy5zd2l0Y2hUb0xlZnRTb3VuZFBsYXllcjtcbiAgICB0aGlzLnN3aXRjaFRvUmlnaHRTb3VuZFBsYXllciA9IG9wdGlvbnMuc3dpdGNoVG9SaWdodFNvdW5kUGxheWVyO1xuXG4gICAgdGhpcy5kaXNwb3NlVG9nZ2xlU3dpdGNoID0gKCkgPT4ge1xuICAgICAgdHJhY2tOb2RlLmRpc3Bvc2UoKTtcbiAgICAgIHJpZ2h0VHJhY2tGaWxsUmVjdGFuZ2xlLmRpc3Bvc2UoKTtcbiAgICAgIHByb3BlcnR5LnVubGluayggdXBkYXRlICk7XG4gICAgICB0b2dnbGVBY3Rpb24uZGlzcG9zZSgpO1xuICAgICAgZHJhZ0xpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMub25JbnB1dEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VUb2dnbGVTd2l0Y2goKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnVG9nZ2xlU3dpdGNoJywgVG9nZ2xlU3dpdGNoICk7Il0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJvcHRpb25pemUiLCJEcmFnTGlzdGVuZXIiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVm9pY2luZyIsInNoYXJlZFNvdW5kUGxheWVycyIsIkV2ZW50VHlwZSIsIlBoZXRpb0FjdGlvbiIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIlV0dGVyYW5jZSIsInN1biIsIkRFRkFVTFRfU0laRSIsIlRvZ2dsZVN3aXRjaCIsImRpc3Bvc2UiLCJkaXNwb3NlVG9nZ2xlU3dpdGNoIiwicHJvcGVydHkiLCJsZWZ0VmFsdWUiLCJyaWdodFZhbHVlIiwicHJvdmlkZWRPcHRpb25zIiwiYXNzZXJ0IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJvcHRpb25zIiwic2l6ZSIsInRvZ2dsZVdoaWxlRHJhZ2dpbmciLCJkcmFnVGhyZXNob2xkIiwidG9nZ2xlVGhyZXNob2xkIiwidGh1bWJGaWxsIiwidGh1bWJTdHJva2UiLCJ0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwidGh1bWJNb3VzZUFyZWFYRGlsYXRpb24iLCJ0aHVtYk1vdXNlQXJlYVlEaWxhdGlvbiIsInRyYWNrRmlsbExlZnQiLCJ0cmFja0ZpbGxSaWdodCIsInRyYWNrU3Ryb2tlIiwiY3Vyc29yIiwiZGlzYWJsZWRPcGFjaXR5IiwiRElTQUJMRURfT1BBQ0lUWSIsInN3aXRjaFRvTGVmdFNvdW5kUGxheWVyIiwiZ2V0Iiwic3dpdGNoVG9SaWdodFNvdW5kUGxheWVyIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsInBoZXRpb1JlYWRPbmx5IiwiREVGQVVMVF9PUFRJT05TIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFnTmFtZSIsImFjY2Vzc2libGVTd2l0Y2giLCJsZWZ0VmFsdWVDb250ZXh0UmVzcG9uc2UiLCJyaWdodFZhbHVlQ29udGV4dFJlc3BvbnNlIiwiZGVmYXVsdFRyYWNrRmlsbCIsImhlaWdodCIsImFkZENvbG9yU3RvcCIsImFjY2Vzc2libGVOYW1lIiwidm9pY2luZ05hbWVSZXNwb25zZSIsIm9uSW5wdXRFbWl0dGVyIiwiY29ybmVyUmFkaXVzIiwidHJhY2tOb2RlIiwid2lkdGgiLCJzdHJva2UiLCJmaWxsIiwiYWRkQ2hpbGQiLCJyaWdodFRyYWNrRmlsbFJlY3RhbmdsZSIsInRodW1iTm9kZSIsInRvdWNoQXJlYSIsInJvdW5kUmVjdCIsIm1vdXNlQXJlYSIsInVwZGF0ZSIsInZhbHVlIiwiaGFsZkxpbmVXaWR0aCIsImxpbmVXaWR0aCIsImxlZnQiLCJyaWdodCIsInJlY3RXaWR0aCIsInNldFBET01BdHRyaWJ1dGUiLCJhcmlhUm9sZSIsImxpbmsiLCJkcmFnVGhyZXNob2xkU3F1YXJlZCIsImFjY3VtdWxhdGVkRGVsdGEiLCJwYXNzZWREcmFnVGhyZXNob2xkIiwidG9nZ2xlQWN0aW9uIiwiZW1pdCIsInBhcmFtZXRlcnMiLCJ2YWxpZFZhbHVlcyIsInBoZXRpb1ByaXZhdGUiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYWRkTGlzdGVuZXIiLCJwbGF5IiwiYWxlcnQiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwidm9pY2luZ1NwZWFrUmVzcG9uc2UiLCJjb250ZXh0UmVzcG9uc2UiLCJhbGVydGFibGVUb1RleHQiLCJ0aHVtYlBvc2l0aW9uVG9WYWx1ZSIsImNlbnRlclgiLCJkcmFnTGlzdGVuZXIiLCJjYW5TdGFydFByZXNzIiwiZXZlbnQiLCJ0eXBlIiwiXyIsImluY2x1ZGVzIiwidHJhaWwiLCJub2RlcyIsInN0YXJ0Iiwic2V0WFkiLCJkcmFnIiwibGlzdGVuZXIiLCJhZGQiLCJtb2RlbERlbHRhIiwibWFnbml0dWRlU3F1YXJlZCIsInZpZXdQb2ludCIsImdldEN1cnJlbnRUYXJnZXQiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJoYWxmVGh1bWJXaWR0aCIsImNsYW1wIiwieCIsImlzRHJhZ2dlZE91dHNpZGUiLCJleGVjdXRlIiwiZW5kIiwidG9nZ2xlVmFsdWUiLCJjYW5DbGljayIsImFkZElucHV0TGlzdGVuZXIiLCJtdXRhdGUiLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtTmFtZSIsInVubGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7OztDQVlDLEdBRUQsT0FBT0EsYUFBYSwyQkFBMkI7QUFHL0MsT0FBT0MsZ0JBQWdCLDZCQUE2QjtBQUNwRCxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxhQUFhLDBCQUEw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