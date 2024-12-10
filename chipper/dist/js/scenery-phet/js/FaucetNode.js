// Copyright 2013-2024, University of Colorado Boulder
/**
 * FaucetNode is a faucet with a pinball machine 'shooter' that behaves like a slider.
 * When the faucet is disabled, the flow rate is set to zero and the shooter is disabled.
 * The origin is at the bottom-center of the spout.
 *
 * The shooter is optionally interactive. When it's not interactive, the shooter and track are hidden.
 * When the shooter is interactive, it has the following features:
 *
 * (1) Close-on-release mode: When the user drags the slider, releasing it sets the flow to zero.
 * See options.closeToRelease: true.
 *
 * (2) Slider mode: When the user drags the slider, releasing it will leave the shooter wherever it is
 * released, and (if in the on position) the flow will continue. See options.closeToRelease: false.
 *
 * (3) Tap-to-dispense: When the user taps on the shooter without dragging, it's on/off state toggles.
 * If the shooter was in the off state when tapped, it opens and dispenses a configurable amount of fluid.
 * This feature can be enabled simultaneously with (1) and (2) above. See the various tapToDispense* options.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import LinearFunction from '../../dot/js/LinearFunction.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, DragListener, GroupHighlightPath, HighlightPath, HotkeyData, Image, InteractiveHighlighting, KeyboardListener, Node, Rectangle } from '../../scenery/js/imports.js';
import AccessibleSlider from '../../sun/js/accessibility/AccessibleSlider.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import faucetBody_png from '../images/faucetBody_png.js';
import faucetFlange_png from '../images/faucetFlange_png.js';
import faucetFlangeDisabled_png from '../images/faucetFlangeDisabled_png.js';
import faucetHorizontalPipe_png from '../images/faucetHorizontalPipe_png.js';
import faucetKnob_png from '../images/faucetKnob_png.js';
import faucetKnobDisabled_png from '../images/faucetKnobDisabled_png.js';
import faucetShaft_png from '../images/faucetShaft_png.js';
import faucetSpout_png from '../images/faucetSpout_png.js';
import faucetStop_png from '../images/faucetStop_png.js';
import faucetTrack_png from '../images/faucetTrack_png.js';
import faucetVerticalPipe_png from '../images/faucetVerticalPipe_png.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
// constants
const DEBUG_ORIGIN = false; // when true, draws a red dot at the origin (bottom-center of the spout)
const SPOUT_OUTPUT_CENTER_X = 112; // center of spout in faucetBody_png
const HORIZONTAL_PIPE_X_OVERLAP = 1; // overlap between horizontal pipe and faucet body, so vertical seam is not visible
const VERTICAL_PIPE_Y_OVERLAP = 1; // overlap between vertical pipe and faucet body/spout, so horizontal seam is not visible
const SHOOTER_MIN_X_OFFSET = 4; // x-offset of shooter's off position in faucetTrack_png
const SHOOTER_MAX_X_OFFSET = 66; // x-offset of shooter's full-on position in faucetTrack_png
const SHOOTER_Y_OFFSET = 16; // y-offset of shooter's centerY in faucetTrack_png
const SHOOTER_WINDOW_BOUNDS = new Bounds2(10, 10, 90, 25); // bounds of the window in faucetBody_png, through which you see the shooter handle
const TRACK_Y_OFFSET = 15; // offset of the track's bottom from the top of faucetBody_png
const HIGHLIGHT_DILATION = 5; // dilation of the highlight around the shooter components
let FaucetNode = class FaucetNode extends AccessibleSlider(Node, 0) {
    dispose() {
        this.disposeFaucetNode();
        super.dispose();
    }
    constructor(maxFlowRate, flowRateProperty, enabledProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            horizontalPipeLength: SPOUT_OUTPUT_CENTER_X,
            verticalPipeLength: 43,
            tapToDispenseEnabled: true,
            tapToDispenseAmount: 0.25 * maxFlowRate,
            tapToDispenseInterval: 500,
            closeOnRelease: true,
            interactiveProperty: new Property(true),
            rasterizeHorizontalPipeNode: false,
            // AccessibleSliderOptions
            enabledRangeProperty: new phet.axon.Property(new phet.dot.Range(0, maxFlowRate)),
            valueProperty: flowRateProperty,
            // ParentOptions
            scale: 1,
            enabledProperty: enabledProperty,
            // AccessibleSlider is composed with InteractiveHighlighting, but the InteractiveHighlight should surround
            // the shooter. It is disabled for the Slider and composed with the ShooterNode.
            interactiveHighlightEnabled: false,
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'FaucetNode',
            phetioType: FaucetNode.FaucetNodeIO,
            phetioFeatured: true,
            phetioEventType: EventType.USER
        }, providedOptions);
        assert && assert(1000 * options.tapToDispenseAmount / options.tapToDispenseInterval <= maxFlowRate);
        // shooter
        const shooterNode = new ShooterNode(enabledProperty, options.shooterOptions);
        // track that the shooter moves in
        const trackNode = new Image(faucetTrack_png);
        // horizontal pipe, tiled horizontally
        let horizontalPipeNode = new Image(faucetHorizontalPipe_png);
        const horizontalPipeWidth = options.horizontalPipeLength - SPOUT_OUTPUT_CENTER_X + HORIZONTAL_PIPE_X_OVERLAP;
        assert && assert(horizontalPipeWidth > 0);
        horizontalPipeNode.setScaleMagnitude(horizontalPipeWidth / faucetHorizontalPipe_png.width, 1);
        if (options.rasterizeHorizontalPipeNode) {
            horizontalPipeNode = horizontalPipeNode.rasterized();
        }
        // vertical pipe
        const verticalPipeNode = new Image(faucetVerticalPipe_png);
        const verticalPipeNodeHeight = options.verticalPipeLength + 2 * VERTICAL_PIPE_Y_OVERLAP;
        assert && assert(verticalPipeNodeHeight > 0);
        verticalPipeNode.setScaleMagnitude(1, verticalPipeNodeHeight / verticalPipeNode.height);
        // other nodes
        const spoutNode = new Image(faucetSpout_png);
        const bodyNode = new Image(faucetBody_png);
        const shooterWindowNode = new Rectangle(SHOOTER_WINDOW_BOUNDS.minX, SHOOTER_WINDOW_BOUNDS.minY, SHOOTER_WINDOW_BOUNDS.maxX - SHOOTER_WINDOW_BOUNDS.minX, SHOOTER_WINDOW_BOUNDS.maxY - SHOOTER_WINDOW_BOUNDS.minY, {
            fill: 'rgb(107,107,107)'
        });
        const boundsRequiredOptionKeys = _.pick(options, Node.REQUIRES_BOUNDS_OPTION_KEYS);
        super(_.omit(options, Node.REQUIRES_BOUNDS_OPTION_KEYS));
        // rendering order
        this.addChild(shooterWindowNode);
        this.addChild(horizontalPipeNode);
        this.addChild(verticalPipeNode);
        this.addChild(spoutNode);
        this.addChild(bodyNode);
        this.addChild(shooterNode);
        this.addChild(trackNode);
        // origin
        if (DEBUG_ORIGIN) {
            this.addChild(new Circle({
                radius: 3,
                fill: 'red'
            }));
        }
        // layout
        {
            // spout's origin is at bottom-center
            spoutNode.centerX = 0;
            spoutNode.bottom = 0;
            // vertical pipe above spout
            verticalPipeNode.centerX = spoutNode.centerX;
            verticalPipeNode.bottom = spoutNode.top + VERTICAL_PIPE_Y_OVERLAP;
            // body above vertical pipe
            bodyNode.right = verticalPipeNode.right;
            bodyNode.bottom = verticalPipeNode.top + VERTICAL_PIPE_Y_OVERLAP;
            // shooter window is in the body's coordinate frame
            shooterWindowNode.translation = bodyNode.translation;
            // horizontal pipe connects to left edge of body
            horizontalPipeNode.right = bodyNode.left + HORIZONTAL_PIPE_X_OVERLAP;
            horizontalPipeNode.top = bodyNode.top;
            // track at top of body
            trackNode.left = bodyNode.left;
            trackNode.bottom = bodyNode.top + TRACK_Y_OFFSET;
            // shooter at top of body
            shooterNode.left = trackNode.left + SHOOTER_MIN_X_OFFSET;
            shooterNode.centerY = trackNode.top + SHOOTER_Y_OFFSET;
        }
        // x-offset relative to left edge of bodyNode
        const offsetToFlowRate = new LinearFunction(SHOOTER_MIN_X_OFFSET, SHOOTER_MAX_X_OFFSET, 0, maxFlowRate, true);
        // tap-to-dispense feature
        let tapToDispenseIsArmed = false; // should we do tap-to-dispense when the pointer is released?
        let tapToDispenseIsRunning = false; // is tap-to-dispense in progress?
        let timeoutID;
        let intervalID;
        const startTapToDispense = ()=>{
            if (enabledProperty.get() && tapToDispenseIsArmed) {
                const flowRate = options.tapToDispenseAmount / options.tapToDispenseInterval * 1000; // L/ms -> L/sec
                this.phetioStartEvent('startTapToDispense', {
                    data: {
                        flowRate: flowRate
                    }
                });
                tapToDispenseIsArmed = false;
                tapToDispenseIsRunning = true;
                flowRateProperty.set(flowRate);
                timeoutID = stepTimer.setTimeout(()=>{
                    intervalID = stepTimer.setInterval(()=>endTapToDispense(), options.tapToDispenseInterval);
                }, 0);
                this.phetioEndEvent();
            }
        };
        const endTapToDispense = ()=>{
            this.phetioStartEvent('endTapToDispense', {
                data: {
                    flowRate: 0
                }
            });
            flowRateProperty.set(0);
            if (timeoutID !== null) {
                stepTimer.clearTimeout(timeoutID);
                timeoutID = null;
            }
            if (intervalID !== null) {
                stepTimer.clearInterval(intervalID);
                intervalID = null;
            }
            tapToDispenseIsRunning = false;
            this.phetioEndEvent();
        };
        let startXOffset = 0; // where the drag started, relative to the target node's origin, in parent view coordinates
        const dragListener = new DragListener({
            start: (event)=>{
                if (enabledProperty.get()) {
                    // prepare to do tap-to-dispense, will be canceled if the user drags before releasing the pointer
                    tapToDispenseIsArmed = options.tapToDispenseEnabled;
                    assert && assert(event.currentTarget);
                    startXOffset = event.currentTarget.globalToParentPoint(event.pointer.point).x - event.currentTarget.left;
                }
            },
            // adjust the flow
            drag: (event, listener)=>{
                // dragging is the cue that we're not doing tap-to-dispense
                tapToDispenseIsArmed = false;
                if (tapToDispenseIsRunning) {
                    endTapToDispense();
                }
                // compute the new flow rate
                if (enabledProperty.get()) {
                    // offsetToFlowRate is relative to bodyNode.left, so account for it
                    const xOffset = listener.currentTarget.globalToParentPoint(event.pointer.point).x - startXOffset - bodyNode.left;
                    const flowRate = offsetToFlowRate.evaluate(xOffset);
                    flowRateProperty.set(flowRate);
                }
            },
            end: ()=>{
                if (enabledProperty.get()) {
                    if (tapToDispenseIsArmed) {
                        // tapping toggles the tap-to-dispense state
                        tapToDispenseIsRunning || flowRateProperty.get() !== 0 ? endTapToDispense() : startTapToDispense();
                    } else if (options.closeOnRelease) {
                        // the shooter was dragged and released, so turn off the faucet
                        flowRateProperty.set(0);
                    }
                }
            },
            tandem: options.tandem.createTandem('dragListener')
        });
        shooterNode.addInputListener(dragListener);
        // Keyboard support for tap-to-dispense and setting the flow rate to zero.
        const keyboardListener = new KeyboardListener({
            keyStringProperties: HotkeyData.combineKeyStringProperties([
                FaucetNode.CLOSE_FAUCET_HOTKEY_DATA,
                FaucetNode.TAP_TO_DISPENSE_HOTKEY_DATA
            ]),
            fire: (event, keysPressed)=>{
                if (options.tapToDispenseEnabled && FaucetNode.TAP_TO_DISPENSE_HOTKEY_DATA.hasKeyStroke(keysPressed)) {
                    // stop the previous timeout before running a new dispense
                    if (tapToDispenseIsRunning) {
                        endTapToDispense();
                    }
                    tapToDispenseIsArmed = true;
                    startTapToDispense();
                }
                if (FaucetNode.CLOSE_FAUCET_HOTKEY_DATA.hasKeyStroke(keysPressed)) {
                    flowRateProperty.set(0);
                }
            }
        });
        this.addInputListener(keyboardListener);
        // if close on release is true, the faucet should turn off when focus moves somewhere else
        if (options.closeOnRelease) {
            this.addInputListener({
                blur: ()=>{
                    flowRateProperty.set(0);
                }
            });
        }
        // The highlights surround the interactive part of the ShooterNode.
        const localHighlightBounds = this.globalToLocalBounds(shooterNode.localToGlobalBounds(shooterNode.focusHighlightBounds));
        const localGroupHighlightBounds = this.globalToLocalBounds(shooterNode.localToGlobalBounds(shooterNode.groupFocusHighlightBounds));
        this.focusHighlight = new HighlightPath(Shape.bounds(localHighlightBounds));
        this.groupFocusHighlight = new GroupHighlightPath(Shape.bounds(localGroupHighlightBounds));
        const flowRateObserver = (flowRate)=>{
            shooterNode.left = bodyNode.left + offsetToFlowRate.inverse(flowRate);
            this.focusHighlight.right = shooterNode.right + HIGHLIGHT_DILATION;
        };
        flowRateProperty.link(flowRateObserver);
        const enabledObserver = (enabled)=>{
            if (!enabled && dragListener.isPressed) {
                dragListener.interrupt();
            }
            if (!enabled && tapToDispenseIsRunning) {
                endTapToDispense();
            }
        };
        enabledProperty.link(enabledObserver);
        this.mutate(boundsRequiredOptionKeys);
        // flow rate control is visible only when the faucet is interactive
        const interactiveObserver = (interactive)=>{
            shooterNode.visible = trackNode.visible = interactive;
        };
        options.interactiveProperty.link(interactiveObserver);
        // Add a link to flowRateProperty, to make it easier to find in Studio.
        // See https://github.com/phetsims/ph-scale/issues/123
        this.addLinkedElement(flowRateProperty, {
            tandemName: 'flowRateProperty'
        });
        this.disposeFaucetNode = ()=>{
            // Properties
            if (options.interactiveProperty.hasListener(interactiveObserver)) {
                options.interactiveProperty.unlink(interactiveObserver);
            }
            if (flowRateProperty.hasListener(flowRateObserver)) {
                flowRateProperty.unlink(flowRateObserver);
            }
            if (enabledProperty.hasListener(enabledObserver)) {
                enabledProperty.unlink(enabledObserver);
            }
            // Subcomponents
            dragListener.dispose();
            keyboardListener.dispose();
            shooterNode.dispose();
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'FaucetNode', this);
    }
};
FaucetNode.CLOSE_FAUCET_HOTKEY_DATA = new HotkeyData({
    keyStringProperties: [
        new Property('0'),
        new Property('home')
    ],
    repoName: sceneryPhet.name,
    keyboardHelpDialogLabelStringProperty: SceneryPhetStrings.keyboardHelpDialog.faucetControls.closeFaucetStringProperty
});
FaucetNode.TAP_TO_DISPENSE_HOTKEY_DATA = new HotkeyData({
    keyStringProperties: [
        new Property('enter'),
        new Property('space')
    ],
    repoName: sceneryPhet.name,
    binderName: 'Tap to dispense faucet'
});
FaucetNode.FaucetNodeIO = new IOType('FaucetNodeIO', {
    valueType: FaucetNode,
    documentation: 'Faucet that emits fluid, typically user-controllable',
    supertype: Node.NodeIO,
    events: [
        'startTapToDispense',
        'endTapToDispense'
    ]
});
export { FaucetNode as default };
/**
 * The 'shooter' is the interactive part of the faucet.
 */ let ShooterNode = class ShooterNode extends InteractiveHighlighting(Node) {
    dispose() {
        this.disposeShooterNode();
        super.dispose();
    }
    constructor(enabledProperty, providedOptions){
        const options = optionize()({
            knobScale: 0.6,
            touchAreaXDilation: 0,
            touchAreaYDilation: 0,
            mouseAreaXDilation: 0,
            mouseAreaYDilation: 0
        }, providedOptions);
        // knob
        const knobNode = new Image(faucetKnob_png);
        // set pointer areas before scaling
        knobNode.touchArea = knobNode.localBounds.dilatedXY(options.touchAreaXDilation, options.touchAreaYDilation);
        knobNode.mouseArea = knobNode.localBounds.dilatedXY(options.mouseAreaXDilation, options.mouseAreaYDilation);
        knobNode.scale(options.knobScale);
        const knobDisabledNode = new Image(faucetKnobDisabled_png);
        knobDisabledNode.scale(knobNode.getScaleVector());
        // shaft
        const shaftNode = new Image(faucetShaft_png);
        // flange
        const flangeNode = new Image(faucetFlange_png);
        const flangeDisabledNode = new Image(faucetFlangeDisabled_png);
        // stop
        const stopNode = new Image(faucetStop_png);
        super({
            children: [
                shaftNode,
                stopNode,
                flangeNode,
                flangeDisabledNode,
                knobNode,
                knobDisabledNode
            ]
        });
        // layout, relative to shaft
        stopNode.x = shaftNode.x + 13;
        stopNode.centerY = shaftNode.centerY;
        flangeNode.left = shaftNode.right - 1; // a bit of overlap
        flangeNode.centerY = shaftNode.centerY;
        flangeDisabledNode.translation = flangeNode.translation;
        knobNode.left = flangeNode.right - 8; // a bit of overlap makes this look better
        knobNode.centerY = flangeNode.centerY;
        knobDisabledNode.translation = knobNode.translation;
        // custom focus highlights that are relative to components of this Node
        this.focusHighlightBounds = new Bounds2(flangeNode.left, knobNode.top, knobNode.right, knobNode.bottom).dilated(HIGHLIGHT_DILATION);
        // the group focus highlight bounds surrounds the whole shooter and extends out to show the range of the knob
        this.groupFocusHighlightBounds = new Bounds2(shaftNode.left, knobNode.top - HIGHLIGHT_DILATION * 2, knobNode.right + shaftNode.width / 2 + 15, knobNode.bottom + HIGHLIGHT_DILATION * 2);
        // This ShooterNode receives input to activate the Interactive Highlight, so this highlight is set on the
        // ShooterNode even though focus highlights are set on the parent FaucetNode.
        this.interactiveHighlight = new HighlightPath(Shape.bounds(this.focusHighlightBounds));
        const enabledObserver = (enabled)=>{
            // the entire shooter is draggable, but encourage dragging by the knob by changing its cursor
            this.pickable = enabled;
            knobNode.cursor = flangeNode.cursor = enabled ? 'pointer' : 'default';
            knobNode.visible = enabled;
            knobDisabledNode.visible = !enabled;
            flangeNode.visible = enabled;
            flangeDisabledNode.visible = !enabled;
        };
        enabledProperty.link(enabledObserver);
        this.disposeShooterNode = ()=>{
            if (enabledProperty.hasListener(enabledObserver)) {
                enabledProperty.unlink(enabledObserver);
            }
        };
    }
};
sceneryPhet.register('FaucetNode', FaucetNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYXVjZXROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZhdWNldE5vZGUgaXMgYSBmYXVjZXQgd2l0aCBhIHBpbmJhbGwgbWFjaGluZSAnc2hvb3RlcicgdGhhdCBiZWhhdmVzIGxpa2UgYSBzbGlkZXIuXG4gKiBXaGVuIHRoZSBmYXVjZXQgaXMgZGlzYWJsZWQsIHRoZSBmbG93IHJhdGUgaXMgc2V0IHRvIHplcm8gYW5kIHRoZSBzaG9vdGVyIGlzIGRpc2FibGVkLlxuICogVGhlIG9yaWdpbiBpcyBhdCB0aGUgYm90dG9tLWNlbnRlciBvZiB0aGUgc3BvdXQuXG4gKlxuICogVGhlIHNob290ZXIgaXMgb3B0aW9uYWxseSBpbnRlcmFjdGl2ZS4gV2hlbiBpdCdzIG5vdCBpbnRlcmFjdGl2ZSwgdGhlIHNob290ZXIgYW5kIHRyYWNrIGFyZSBoaWRkZW4uXG4gKiBXaGVuIHRoZSBzaG9vdGVyIGlzIGludGVyYWN0aXZlLCBpdCBoYXMgdGhlIGZvbGxvd2luZyBmZWF0dXJlczpcbiAqXG4gKiAoMSkgQ2xvc2Utb24tcmVsZWFzZSBtb2RlOiBXaGVuIHRoZSB1c2VyIGRyYWdzIHRoZSBzbGlkZXIsIHJlbGVhc2luZyBpdCBzZXRzIHRoZSBmbG93IHRvIHplcm8uXG4gKiBTZWUgb3B0aW9ucy5jbG9zZVRvUmVsZWFzZTogdHJ1ZS5cbiAqXG4gKiAoMikgU2xpZGVyIG1vZGU6IFdoZW4gdGhlIHVzZXIgZHJhZ3MgdGhlIHNsaWRlciwgcmVsZWFzaW5nIGl0IHdpbGwgbGVhdmUgdGhlIHNob290ZXIgd2hlcmV2ZXIgaXQgaXNcbiAqIHJlbGVhc2VkLCBhbmQgKGlmIGluIHRoZSBvbiBwb3NpdGlvbikgdGhlIGZsb3cgd2lsbCBjb250aW51ZS4gU2VlIG9wdGlvbnMuY2xvc2VUb1JlbGVhc2U6IGZhbHNlLlxuICpcbiAqICgzKSBUYXAtdG8tZGlzcGVuc2U6IFdoZW4gdGhlIHVzZXIgdGFwcyBvbiB0aGUgc2hvb3RlciB3aXRob3V0IGRyYWdnaW5nLCBpdCdzIG9uL29mZiBzdGF0ZSB0b2dnbGVzLlxuICogSWYgdGhlIHNob290ZXIgd2FzIGluIHRoZSBvZmYgc3RhdGUgd2hlbiB0YXBwZWQsIGl0IG9wZW5zIGFuZCBkaXNwZW5zZXMgYSBjb25maWd1cmFibGUgYW1vdW50IG9mIGZsdWlkLlxuICogVGhpcyBmZWF0dXJlIGNhbiBiZSBlbmFibGVkIHNpbXVsdGFuZW91c2x5IHdpdGggKDEpIGFuZCAoMikgYWJvdmUuIFNlZSB0aGUgdmFyaW91cyB0YXBUb0Rpc3BlbnNlKiBvcHRpb25zLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgeyBUaW1lckxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW1lci5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBXaXRoT3B0aW9uYWwgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dpdGhPcHRpb25hbC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIERyYWdMaXN0ZW5lciwgR3JvdXBIaWdobGlnaHRQYXRoLCBIaWdobGlnaHRQYXRoLCBIb3RrZXlEYXRhLCBJbWFnZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIEtleWJvYXJkTGlzdGVuZXIsIE5vZGUsIE5vZGVPcHRpb25zLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFjY2Vzc2libGVTbGlkZXIsIHsgQWNjZXNzaWJsZVNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYWNjZXNzaWJpbGl0eS9BY2Nlc3NpYmxlU2xpZGVyLmpzJztcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL0V2ZW50VHlwZS5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBmYXVjZXRCb2R5X3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0Qm9keV9wbmcuanMnO1xuaW1wb3J0IGZhdWNldEZsYW5nZV9wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldEZsYW5nZV9wbmcuanMnO1xuaW1wb3J0IGZhdWNldEZsYW5nZURpc2FibGVkX3BuZyBmcm9tICcuLi9pbWFnZXMvZmF1Y2V0RmxhbmdlRGlzYWJsZWRfcG5nLmpzJztcbmltcG9ydCBmYXVjZXRIb3Jpem9udGFsUGlwZV9wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldEhvcml6b250YWxQaXBlX3BuZy5qcyc7XG5pbXBvcnQgZmF1Y2V0S25vYl9wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldEtub2JfcG5nLmpzJztcbmltcG9ydCBmYXVjZXRLbm9iRGlzYWJsZWRfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRLbm9iRGlzYWJsZWRfcG5nLmpzJztcbmltcG9ydCBmYXVjZXRTaGFmdF9wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldFNoYWZ0X3BuZy5qcyc7XG5pbXBvcnQgZmF1Y2V0U3BvdXRfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRTcG91dF9wbmcuanMnO1xuaW1wb3J0IGZhdWNldFN0b3BfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRTdG9wX3BuZy5qcyc7XG5pbXBvcnQgZmF1Y2V0VHJhY2tfcG5nIGZyb20gJy4uL2ltYWdlcy9mYXVjZXRUcmFja19wbmcuanMnO1xuaW1wb3J0IGZhdWNldFZlcnRpY2FsUGlwZV9wbmcgZnJvbSAnLi4vaW1hZ2VzL2ZhdWNldFZlcnRpY2FsUGlwZV9wbmcuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgREVCVUdfT1JJR0lOID0gZmFsc2U7IC8vIHdoZW4gdHJ1ZSwgZHJhd3MgYSByZWQgZG90IGF0IHRoZSBvcmlnaW4gKGJvdHRvbS1jZW50ZXIgb2YgdGhlIHNwb3V0KVxuY29uc3QgU1BPVVRfT1VUUFVUX0NFTlRFUl9YID0gMTEyOyAvLyBjZW50ZXIgb2Ygc3BvdXQgaW4gZmF1Y2V0Qm9keV9wbmdcbmNvbnN0IEhPUklaT05UQUxfUElQRV9YX09WRVJMQVAgPSAxOyAvLyBvdmVybGFwIGJldHdlZW4gaG9yaXpvbnRhbCBwaXBlIGFuZCBmYXVjZXQgYm9keSwgc28gdmVydGljYWwgc2VhbSBpcyBub3QgdmlzaWJsZVxuY29uc3QgVkVSVElDQUxfUElQRV9ZX09WRVJMQVAgPSAxOyAvLyBvdmVybGFwIGJldHdlZW4gdmVydGljYWwgcGlwZSBhbmQgZmF1Y2V0IGJvZHkvc3BvdXQsIHNvIGhvcml6b250YWwgc2VhbSBpcyBub3QgdmlzaWJsZVxuY29uc3QgU0hPT1RFUl9NSU5fWF9PRkZTRVQgPSA0OyAvLyB4LW9mZnNldCBvZiBzaG9vdGVyJ3Mgb2ZmIHBvc2l0aW9uIGluIGZhdWNldFRyYWNrX3BuZ1xuY29uc3QgU0hPT1RFUl9NQVhfWF9PRkZTRVQgPSA2NjsgLy8geC1vZmZzZXQgb2Ygc2hvb3RlcidzIGZ1bGwtb24gcG9zaXRpb24gaW4gZmF1Y2V0VHJhY2tfcG5nXG5jb25zdCBTSE9PVEVSX1lfT0ZGU0VUID0gMTY7IC8vIHktb2Zmc2V0IG9mIHNob290ZXIncyBjZW50ZXJZIGluIGZhdWNldFRyYWNrX3BuZ1xuY29uc3QgU0hPT1RFUl9XSU5ET1dfQk9VTkRTID0gbmV3IEJvdW5kczIoIDEwLCAxMCwgOTAsIDI1ICk7IC8vIGJvdW5kcyBvZiB0aGUgd2luZG93IGluIGZhdWNldEJvZHlfcG5nLCB0aHJvdWdoIHdoaWNoIHlvdSBzZWUgdGhlIHNob290ZXIgaGFuZGxlXG5jb25zdCBUUkFDS19ZX09GRlNFVCA9IDE1OyAvLyBvZmZzZXQgb2YgdGhlIHRyYWNrJ3MgYm90dG9tIGZyb20gdGhlIHRvcCBvZiBmYXVjZXRCb2R5X3BuZ1xuY29uc3QgSElHSExJR0hUX0RJTEFUSU9OID0gNTsgLy8gZGlsYXRpb24gb2YgdGhlIGhpZ2hsaWdodCBhcm91bmQgdGhlIHNob290ZXIgY29tcG9uZW50c1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBob3Jpem9udGFsUGlwZUxlbmd0aD86IG51bWJlcjsgLy8gZGlzdGFuY2UgYmV0d2VlbiBsZWZ0IGVkZ2Ugb2YgaG9yaXpvbnRhbCBwaXBlIGFuZCBzcG91dCdzIGNlbnRlclxuICB2ZXJ0aWNhbFBpcGVMZW5ndGg/OiBudW1iZXI7IC8vIGxlbmd0aCBvZiB0aGUgdmVydGljYWwgcGlwZSB0aGF0IGNvbm5lY3RzIHRoZSBmYXVjZXQgYm9keSB0byB0aGUgc3BvdXRcbiAgdGFwVG9EaXNwZW5zZUVuYWJsZWQ/OiBib29sZWFuOyAvLyB0YXAtdG8tZGlzcGVuc2UgZmVhdHVyZTogd2hlbiB0cnVlLCB0YXBwaW5nIHRoZSBzaG9vdGVyIGRpc3BlbnNlcyBzb21lIGZsdWlkXG4gIHRhcFRvRGlzcGVuc2VBbW91bnQ/OiBudW1iZXI7IC8vIHRhcC10by1kaXNwZW5zZSBmZWF0dXJlOiBhbW91bnQgdG8gZGlzcGVuc2UsIGluIExcbiAgdGFwVG9EaXNwZW5zZUludGVydmFsPzogbnVtYmVyOyAvLyB0YXAtdG8tZGlzcGVuc2UgZmVhdHVyZTogYW1vdW50IG9mIHRpbWUgdGhhdCBmbHVpZCBpcyBkaXNwZW5zZWQsIGluIG1pbGxpc2Vjb25kc1xuICBjbG9zZU9uUmVsZWFzZT86IGJvb2xlYW47IC8vIHdoZW4gdHJ1ZSwgcmVsZWFzaW5nIHRoZSBzaG9vdGVyIGNsb3NlcyB0aGUgZmF1Y2V0XG4gIGludGVyYWN0aXZlUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjsgLy8gd2hlbiB0aGUgZmF1Y2V0IGlzIGludGVyYWN0aXZlLCB0aGUgZmxvdyByYXRlIGNvbnRyb2wgaXMgdmlzaWJsZSwgc2VlIGlzc3VlICM2N1xuXG4gIC8vIE92ZXJjb21lIGEgZmxpY2tlcmluZyBwcm9ibGVtcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMTg3XG4gIHJhc3Rlcml6ZUhvcml6b250YWxQaXBlTm9kZT86IGJvb2xlYW47XG5cbiAgLy8gb3B0aW9ucyBmb3IgdGhlIG5lc3RlZCB0eXBlIFNob290ZXJOb2RlXG4gIHNob290ZXJPcHRpb25zPzogU2hvb3Rlck5vZGVPcHRpb25zO1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEFjY2Vzc2libGVTbGlkZXJPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIEZhdWNldE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhcmVudE9wdGlvbnMsICdpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQnIHwgJ2VuYWJsZWRSYW5nZVByb3BlcnR5JyB8ICd2YWx1ZVByb3BlcnR5Jz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZhdWNldE5vZGUgZXh0ZW5kcyBBY2Nlc3NpYmxlU2xpZGVyKCBOb2RlLCAwICkge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUZhdWNldE5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhGbG93UmF0ZTogbnVtYmVyLCBmbG93UmF0ZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LFxuICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9ucz86IEZhdWNldE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGYXVjZXROb2RlT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3Nob290ZXJPcHRpb25zJz4sIFdpdGhPcHRpb25hbDxQYXJlbnRPcHRpb25zLCAndmFsdWVQcm9wZXJ0eSc+PigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBob3Jpem9udGFsUGlwZUxlbmd0aDogU1BPVVRfT1VUUFVUX0NFTlRFUl9YLFxuICAgICAgdmVydGljYWxQaXBlTGVuZ3RoOiA0MyxcbiAgICAgIHRhcFRvRGlzcGVuc2VFbmFibGVkOiB0cnVlLFxuICAgICAgdGFwVG9EaXNwZW5zZUFtb3VudDogMC4yNSAqIG1heEZsb3dSYXRlLFxuICAgICAgdGFwVG9EaXNwZW5zZUludGVydmFsOiA1MDAsXG4gICAgICBjbG9zZU9uUmVsZWFzZTogdHJ1ZSxcbiAgICAgIGludGVyYWN0aXZlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggdHJ1ZSApLFxuICAgICAgcmFzdGVyaXplSG9yaXpvbnRhbFBpcGVOb2RlOiBmYWxzZSxcblxuICAgICAgLy8gQWNjZXNzaWJsZVNsaWRlck9wdGlvbnNcbiAgICAgIGVuYWJsZWRSYW5nZVByb3BlcnR5OiBuZXcgcGhldC5heG9uLlByb3BlcnR5KCBuZXcgcGhldC5kb3QuUmFuZ2UoIDAsIG1heEZsb3dSYXRlICkgKSxcbiAgICAgIHZhbHVlUHJvcGVydHk6IGZsb3dSYXRlUHJvcGVydHksXG5cbiAgICAgIC8vIFBhcmVudE9wdGlvbnNcbiAgICAgIHNjYWxlOiAxLFxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHksXG5cbiAgICAgIC8vIEFjY2Vzc2libGVTbGlkZXIgaXMgY29tcG9zZWQgd2l0aCBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZywgYnV0IHRoZSBJbnRlcmFjdGl2ZUhpZ2hsaWdodCBzaG91bGQgc3Vycm91bmRcbiAgICAgIC8vIHRoZSBzaG9vdGVyLiBJdCBpcyBkaXNhYmxlZCBmb3IgdGhlIFNsaWRlciBhbmQgY29tcG9zZWQgd2l0aCB0aGUgU2hvb3Rlck5vZGUuXG4gICAgICBpbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQ6IGZhbHNlLFxuXG4gICAgICAvLyBwaGV0LWlvXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdGYXVjZXROb2RlJyxcbiAgICAgIHBoZXRpb1R5cGU6IEZhdWNldE5vZGUuRmF1Y2V0Tm9kZUlPLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBwaGV0aW9FdmVudFR5cGU6IEV2ZW50VHlwZS5VU0VSXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIDEwMDAgKiBvcHRpb25zLnRhcFRvRGlzcGVuc2VBbW91bnQgLyBvcHRpb25zLnRhcFRvRGlzcGVuc2VJbnRlcnZhbCApIDw9IG1heEZsb3dSYXRlICk7XG5cbiAgICAvLyBzaG9vdGVyXG4gICAgY29uc3Qgc2hvb3Rlck5vZGUgPSBuZXcgU2hvb3Rlck5vZGUoIGVuYWJsZWRQcm9wZXJ0eSwgb3B0aW9ucy5zaG9vdGVyT3B0aW9ucyApO1xuXG4gICAgLy8gdHJhY2sgdGhhdCB0aGUgc2hvb3RlciBtb3ZlcyBpblxuICAgIGNvbnN0IHRyYWNrTm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0VHJhY2tfcG5nICk7XG5cbiAgICAvLyBob3Jpem9udGFsIHBpcGUsIHRpbGVkIGhvcml6b250YWxseVxuICAgIGxldCBob3Jpem9udGFsUGlwZU5vZGU6IE5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldEhvcml6b250YWxQaXBlX3BuZyApO1xuICAgIGNvbnN0IGhvcml6b250YWxQaXBlV2lkdGggPSBvcHRpb25zLmhvcml6b250YWxQaXBlTGVuZ3RoIC0gU1BPVVRfT1VUUFVUX0NFTlRFUl9YICsgSE9SSVpPTlRBTF9QSVBFX1hfT1ZFUkxBUDtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBob3Jpem9udGFsUGlwZVdpZHRoID4gMCApO1xuICAgIGhvcml6b250YWxQaXBlTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggaG9yaXpvbnRhbFBpcGVXaWR0aCAvIGZhdWNldEhvcml6b250YWxQaXBlX3BuZy53aWR0aCwgMSApO1xuICAgIGlmICggb3B0aW9ucy5yYXN0ZXJpemVIb3Jpem9udGFsUGlwZU5vZGUgKSB7XG4gICAgICBob3Jpem9udGFsUGlwZU5vZGUgPSBob3Jpem9udGFsUGlwZU5vZGUucmFzdGVyaXplZCgpO1xuICAgIH1cblxuICAgIC8vIHZlcnRpY2FsIHBpcGVcbiAgICBjb25zdCB2ZXJ0aWNhbFBpcGVOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRWZXJ0aWNhbFBpcGVfcG5nICk7XG4gICAgY29uc3QgdmVydGljYWxQaXBlTm9kZUhlaWdodCA9IG9wdGlvbnMudmVydGljYWxQaXBlTGVuZ3RoICsgKCAyICogVkVSVElDQUxfUElQRV9ZX09WRVJMQVAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0aWNhbFBpcGVOb2RlSGVpZ2h0ID4gMCApO1xuICAgIHZlcnRpY2FsUGlwZU5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIDEsIHZlcnRpY2FsUGlwZU5vZGVIZWlnaHQgLyB2ZXJ0aWNhbFBpcGVOb2RlLmhlaWdodCApO1xuXG4gICAgLy8gb3RoZXIgbm9kZXNcbiAgICBjb25zdCBzcG91dE5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldFNwb3V0X3BuZyApO1xuICAgIGNvbnN0IGJvZHlOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRCb2R5X3BuZyApO1xuXG4gICAgY29uc3Qgc2hvb3RlcldpbmRvd05vZGUgPSBuZXcgUmVjdGFuZ2xlKCBTSE9PVEVSX1dJTkRPV19CT1VORFMubWluWCwgU0hPT1RFUl9XSU5ET1dfQk9VTkRTLm1pblksXG4gICAgICBTSE9PVEVSX1dJTkRPV19CT1VORFMubWF4WCAtIFNIT09URVJfV0lORE9XX0JPVU5EUy5taW5YLCBTSE9PVEVSX1dJTkRPV19CT1VORFMubWF4WSAtIFNIT09URVJfV0lORE9XX0JPVU5EUy5taW5ZLFxuICAgICAgeyBmaWxsOiAncmdiKDEwNywxMDcsMTA3KScgfSApO1xuXG4gICAgY29uc3QgYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzID0gXy5waWNrKCBvcHRpb25zLCBOb2RlLlJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApO1xuXG4gICAgc3VwZXIoIF8ub21pdCggb3B0aW9ucywgTm9kZS5SRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSApO1xuXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXG4gICAgdGhpcy5hZGRDaGlsZCggc2hvb3RlcldpbmRvd05vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBob3Jpem9udGFsUGlwZU5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB2ZXJ0aWNhbFBpcGVOb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggc3BvdXROb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggYm9keU5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBzaG9vdGVyTm9kZSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRyYWNrTm9kZSApO1xuXG4gICAgLy8gb3JpZ2luXG4gICAgaWYgKCBERUJVR19PUklHSU4gKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCB7IHJhZGl1czogMywgZmlsbDogJ3JlZCcgfSApICk7XG4gICAgfVxuXG4gICAgLy8gbGF5b3V0XG4gICAge1xuICAgICAgLy8gc3BvdXQncyBvcmlnaW4gaXMgYXQgYm90dG9tLWNlbnRlclxuICAgICAgc3BvdXROb2RlLmNlbnRlclggPSAwO1xuICAgICAgc3BvdXROb2RlLmJvdHRvbSA9IDA7XG5cbiAgICAgIC8vIHZlcnRpY2FsIHBpcGUgYWJvdmUgc3BvdXRcbiAgICAgIHZlcnRpY2FsUGlwZU5vZGUuY2VudGVyWCA9IHNwb3V0Tm9kZS5jZW50ZXJYO1xuICAgICAgdmVydGljYWxQaXBlTm9kZS5ib3R0b20gPSBzcG91dE5vZGUudG9wICsgVkVSVElDQUxfUElQRV9ZX09WRVJMQVA7XG5cbiAgICAgIC8vIGJvZHkgYWJvdmUgdmVydGljYWwgcGlwZVxuICAgICAgYm9keU5vZGUucmlnaHQgPSB2ZXJ0aWNhbFBpcGVOb2RlLnJpZ2h0O1xuICAgICAgYm9keU5vZGUuYm90dG9tID0gdmVydGljYWxQaXBlTm9kZS50b3AgKyBWRVJUSUNBTF9QSVBFX1lfT1ZFUkxBUDtcblxuICAgICAgLy8gc2hvb3RlciB3aW5kb3cgaXMgaW4gdGhlIGJvZHkncyBjb29yZGluYXRlIGZyYW1lXG4gICAgICBzaG9vdGVyV2luZG93Tm9kZS50cmFuc2xhdGlvbiA9IGJvZHlOb2RlLnRyYW5zbGF0aW9uO1xuXG4gICAgICAvLyBob3Jpem9udGFsIHBpcGUgY29ubmVjdHMgdG8gbGVmdCBlZGdlIG9mIGJvZHlcbiAgICAgIGhvcml6b250YWxQaXBlTm9kZS5yaWdodCA9IGJvZHlOb2RlLmxlZnQgKyBIT1JJWk9OVEFMX1BJUEVfWF9PVkVSTEFQO1xuICAgICAgaG9yaXpvbnRhbFBpcGVOb2RlLnRvcCA9IGJvZHlOb2RlLnRvcDtcblxuICAgICAgLy8gdHJhY2sgYXQgdG9wIG9mIGJvZHlcbiAgICAgIHRyYWNrTm9kZS5sZWZ0ID0gYm9keU5vZGUubGVmdDtcbiAgICAgIHRyYWNrTm9kZS5ib3R0b20gPSBib2R5Tm9kZS50b3AgKyBUUkFDS19ZX09GRlNFVDtcblxuICAgICAgLy8gc2hvb3RlciBhdCB0b3Agb2YgYm9keVxuICAgICAgc2hvb3Rlck5vZGUubGVmdCA9IHRyYWNrTm9kZS5sZWZ0ICsgU0hPT1RFUl9NSU5fWF9PRkZTRVQ7XG4gICAgICBzaG9vdGVyTm9kZS5jZW50ZXJZID0gdHJhY2tOb2RlLnRvcCArIFNIT09URVJfWV9PRkZTRVQ7XG4gICAgfVxuXG4gICAgLy8geC1vZmZzZXQgcmVsYXRpdmUgdG8gbGVmdCBlZGdlIG9mIGJvZHlOb2RlXG4gICAgY29uc3Qgb2Zmc2V0VG9GbG93UmF0ZSA9IG5ldyBMaW5lYXJGdW5jdGlvbiggU0hPT1RFUl9NSU5fWF9PRkZTRVQsIFNIT09URVJfTUFYX1hfT0ZGU0VULCAwLCBtYXhGbG93UmF0ZSwgdHJ1ZSAvKiBjbGFtcCAqLyApO1xuXG4gICAgLy8gdGFwLXRvLWRpc3BlbnNlIGZlYXR1cmVcbiAgICBsZXQgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBmYWxzZTsgLy8gc2hvdWxkIHdlIGRvIHRhcC10by1kaXNwZW5zZSB3aGVuIHRoZSBwb2ludGVyIGlzIHJlbGVhc2VkP1xuICAgIGxldCB0YXBUb0Rpc3BlbnNlSXNSdW5uaW5nID0gZmFsc2U7IC8vIGlzIHRhcC10by1kaXNwZW5zZSBpbiBwcm9ncmVzcz9cbiAgICBsZXQgdGltZW91dElEOiBUaW1lckxpc3RlbmVyIHwgbnVsbDtcbiAgICBsZXQgaW50ZXJ2YWxJRDogVGltZXJMaXN0ZW5lciB8IG51bGw7XG4gICAgY29uc3Qgc3RhcnRUYXBUb0Rpc3BlbnNlID0gKCkgPT4ge1xuICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuZ2V0KCkgJiYgdGFwVG9EaXNwZW5zZUlzQXJtZWQgKSB7IC8vIHJlZHVuZGFudCBndWFyZFxuICAgICAgICBjb25zdCBmbG93UmF0ZSA9ICggb3B0aW9ucy50YXBUb0Rpc3BlbnNlQW1vdW50IC8gb3B0aW9ucy50YXBUb0Rpc3BlbnNlSW50ZXJ2YWwgKSAqIDEwMDA7IC8vIEwvbXMgLT4gTC9zZWNcbiAgICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnc3RhcnRUYXBUb0Rpc3BlbnNlJywgeyBkYXRhOiB7IGZsb3dSYXRlOiBmbG93UmF0ZSB9IH0gKTtcbiAgICAgICAgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBmYWxzZTtcbiAgICAgICAgdGFwVG9EaXNwZW5zZUlzUnVubmluZyA9IHRydWU7XG4gICAgICAgIGZsb3dSYXRlUHJvcGVydHkuc2V0KCBmbG93UmF0ZSApO1xuICAgICAgICB0aW1lb3V0SUQgPSBzdGVwVGltZXIuc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgIGludGVydmFsSUQgPSBzdGVwVGltZXIuc2V0SW50ZXJ2YWwoICgpID0+IGVuZFRhcFRvRGlzcGVuc2UoKSwgb3B0aW9ucy50YXBUb0Rpc3BlbnNlSW50ZXJ2YWwgKTtcbiAgICAgICAgfSwgMCApO1xuICAgICAgICB0aGlzLnBoZXRpb0VuZEV2ZW50KCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBlbmRUYXBUb0Rpc3BlbnNlID0gKCkgPT4ge1xuICAgICAgdGhpcy5waGV0aW9TdGFydEV2ZW50KCAnZW5kVGFwVG9EaXNwZW5zZScsIHsgZGF0YTogeyBmbG93UmF0ZTogMCB9IH0gKTtcbiAgICAgIGZsb3dSYXRlUHJvcGVydHkuc2V0KCAwICk7XG4gICAgICBpZiAoIHRpbWVvdXRJRCAhPT0gbnVsbCApIHtcbiAgICAgICAgc3RlcFRpbWVyLmNsZWFyVGltZW91dCggdGltZW91dElEICk7XG4gICAgICAgIHRpbWVvdXRJRCA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIGludGVydmFsSUQgIT09IG51bGwgKSB7XG4gICAgICAgIHN0ZXBUaW1lci5jbGVhckludGVydmFsKCBpbnRlcnZhbElEICk7XG4gICAgICAgIGludGVydmFsSUQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGFwVG9EaXNwZW5zZUlzUnVubmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xuICAgIH07XG5cbiAgICBsZXQgc3RhcnRYT2Zmc2V0ID0gMDsgLy8gd2hlcmUgdGhlIGRyYWcgc3RhcnRlZCwgcmVsYXRpdmUgdG8gdGhlIHRhcmdldCBub2RlJ3Mgb3JpZ2luLCBpbiBwYXJlbnQgdmlldyBjb29yZGluYXRlc1xuICAgIGNvbnN0IGRyYWdMaXN0ZW5lciA9IG5ldyBEcmFnTGlzdGVuZXIoIHtcblxuICAgICAgc3RhcnQ6IGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgICAgICAvLyBwcmVwYXJlIHRvIGRvIHRhcC10by1kaXNwZW5zZSwgd2lsbCBiZSBjYW5jZWxlZCBpZiB0aGUgdXNlciBkcmFncyBiZWZvcmUgcmVsZWFzaW5nIHRoZSBwb2ludGVyXG4gICAgICAgICAgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBvcHRpb25zLnRhcFRvRGlzcGVuc2VFbmFibGVkO1xuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKTtcbiAgICAgICAgICBzdGFydFhPZmZzZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0IS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueCAtIGV2ZW50LmN1cnJlbnRUYXJnZXQhLmxlZnQ7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIGFkanVzdCB0aGUgZmxvd1xuICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG5cbiAgICAgICAgLy8gZHJhZ2dpbmcgaXMgdGhlIGN1ZSB0aGF0IHdlJ3JlIG5vdCBkb2luZyB0YXAtdG8tZGlzcGVuc2VcbiAgICAgICAgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKCB0YXBUb0Rpc3BlbnNlSXNSdW5uaW5nICkge1xuICAgICAgICAgIGVuZFRhcFRvRGlzcGVuc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbXB1dGUgdGhlIG5ldyBmbG93IHJhdGVcbiAgICAgICAgaWYgKCBlbmFibGVkUHJvcGVydHkuZ2V0KCkgKSB7XG5cbiAgICAgICAgICAvLyBvZmZzZXRUb0Zsb3dSYXRlIGlzIHJlbGF0aXZlIHRvIGJvZHlOb2RlLmxlZnQsIHNvIGFjY291bnQgZm9yIGl0XG4gICAgICAgICAgY29uc3QgeE9mZnNldCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXQuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnggLSBzdGFydFhPZmZzZXQgLSBib2R5Tm9kZS5sZWZ0O1xuICAgICAgICAgIGNvbnN0IGZsb3dSYXRlID0gb2Zmc2V0VG9GbG93UmF0ZS5ldmFsdWF0ZSggeE9mZnNldCApO1xuXG4gICAgICAgICAgZmxvd1JhdGVQcm9wZXJ0eS5zZXQoIGZsb3dSYXRlICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGVuZDogKCkgPT4ge1xuICAgICAgICBpZiAoIGVuYWJsZWRQcm9wZXJ0eS5nZXQoKSApIHtcblxuICAgICAgICAgIGlmICggdGFwVG9EaXNwZW5zZUlzQXJtZWQgKSB7XG4gICAgICAgICAgICAvLyB0YXBwaW5nIHRvZ2dsZXMgdGhlIHRhcC10by1kaXNwZW5zZSBzdGF0ZVxuICAgICAgICAgICAgKCB0YXBUb0Rpc3BlbnNlSXNSdW5uaW5nIHx8IGZsb3dSYXRlUHJvcGVydHkuZ2V0KCkgIT09IDAgKSA/IGVuZFRhcFRvRGlzcGVuc2UoKSA6IHN0YXJ0VGFwVG9EaXNwZW5zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggb3B0aW9ucy5jbG9zZU9uUmVsZWFzZSApIHtcblxuICAgICAgICAgICAgLy8gdGhlIHNob290ZXIgd2FzIGRyYWdnZWQgYW5kIHJlbGVhc2VkLCBzbyB0dXJuIG9mZiB0aGUgZmF1Y2V0XG4gICAgICAgICAgICBmbG93UmF0ZVByb3BlcnR5LnNldCggMCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXG4gICAgfSApO1xuICAgIHNob290ZXJOb2RlLmFkZElucHV0TGlzdGVuZXIoIGRyYWdMaXN0ZW5lciApO1xuXG4gICAgLy8gS2V5Ym9hcmQgc3VwcG9ydCBmb3IgdGFwLXRvLWRpc3BlbnNlIGFuZCBzZXR0aW5nIHRoZSBmbG93IHJhdGUgdG8gemVyby5cbiAgICBjb25zdCBrZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgIGtleVN0cmluZ1Byb3BlcnRpZXM6IEhvdGtleURhdGEuY29tYmluZUtleVN0cmluZ1Byb3BlcnRpZXMoIFtcbiAgICAgICAgRmF1Y2V0Tm9kZS5DTE9TRV9GQVVDRVRfSE9US0VZX0RBVEEsXG4gICAgICAgIEZhdWNldE5vZGUuVEFQX1RPX0RJU1BFTlNFX0hPVEtFWV9EQVRBXG4gICAgICBdICksXG4gICAgICBmaXJlOiAoIGV2ZW50LCBrZXlzUHJlc3NlZCApID0+IHtcbiAgICAgICAgaWYgKCBvcHRpb25zLnRhcFRvRGlzcGVuc2VFbmFibGVkICYmIEZhdWNldE5vZGUuVEFQX1RPX0RJU1BFTlNFX0hPVEtFWV9EQVRBLmhhc0tleVN0cm9rZSgga2V5c1ByZXNzZWQgKSApIHtcblxuICAgICAgICAgIC8vIHN0b3AgdGhlIHByZXZpb3VzIHRpbWVvdXQgYmVmb3JlIHJ1bm5pbmcgYSBuZXcgZGlzcGVuc2VcbiAgICAgICAgICBpZiAoIHRhcFRvRGlzcGVuc2VJc1J1bm5pbmcgKSB7XG4gICAgICAgICAgICBlbmRUYXBUb0Rpc3BlbnNlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGFwVG9EaXNwZW5zZUlzQXJtZWQgPSB0cnVlO1xuICAgICAgICAgIHN0YXJ0VGFwVG9EaXNwZW5zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBGYXVjZXROb2RlLkNMT1NFX0ZBVUNFVF9IT1RLRVlfREFUQS5oYXNLZXlTdHJva2UoIGtleXNQcmVzc2VkICkgKSB7XG4gICAgICAgICAgZmxvd1JhdGVQcm9wZXJ0eS5zZXQoIDAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGtleWJvYXJkTGlzdGVuZXIgKTtcblxuICAgIC8vIGlmIGNsb3NlIG9uIHJlbGVhc2UgaXMgdHJ1ZSwgdGhlIGZhdWNldCBzaG91bGQgdHVybiBvZmYgd2hlbiBmb2N1cyBtb3ZlcyBzb21ld2hlcmUgZWxzZVxuICAgIGlmICggb3B0aW9ucy5jbG9zZU9uUmVsZWFzZSApIHtcbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgICBibHVyOiAoKSA9PiB7XG4gICAgICAgICAgZmxvd1JhdGVQcm9wZXJ0eS5zZXQoIDAgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIFRoZSBoaWdobGlnaHRzIHN1cnJvdW5kIHRoZSBpbnRlcmFjdGl2ZSBwYXJ0IG9mIHRoZSBTaG9vdGVyTm9kZS5cbiAgICBjb25zdCBsb2NhbEhpZ2hsaWdodEJvdW5kcyA9IHRoaXMuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggc2hvb3Rlck5vZGUubG9jYWxUb0dsb2JhbEJvdW5kcyggc2hvb3Rlck5vZGUuZm9jdXNIaWdobGlnaHRCb3VuZHMgKSApO1xuICAgIGNvbnN0IGxvY2FsR3JvdXBIaWdobGlnaHRCb3VuZHMgPSB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIHNob290ZXJOb2RlLmxvY2FsVG9HbG9iYWxCb3VuZHMoIHNob290ZXJOb2RlLmdyb3VwRm9jdXNIaWdobGlnaHRCb3VuZHMgKSApO1xuICAgIHRoaXMuZm9jdXNIaWdobGlnaHQgPSBuZXcgSGlnaGxpZ2h0UGF0aCggU2hhcGUuYm91bmRzKCBsb2NhbEhpZ2hsaWdodEJvdW5kcyApICk7XG4gICAgdGhpcy5ncm91cEZvY3VzSGlnaGxpZ2h0ID0gbmV3IEdyb3VwSGlnaGxpZ2h0UGF0aCggU2hhcGUuYm91bmRzKCBsb2NhbEdyb3VwSGlnaGxpZ2h0Qm91bmRzICkgKTtcblxuICAgIGNvbnN0IGZsb3dSYXRlT2JzZXJ2ZXIgPSAoIGZsb3dSYXRlOiBudW1iZXIgKSA9PiB7XG4gICAgICBzaG9vdGVyTm9kZS5sZWZ0ID0gYm9keU5vZGUubGVmdCArIG9mZnNldFRvRmxvd1JhdGUuaW52ZXJzZSggZmxvd1JhdGUgKTtcbiAgICAgICggdGhpcy5mb2N1c0hpZ2hsaWdodCBhcyBIaWdobGlnaHRQYXRoICkucmlnaHQgPSBzaG9vdGVyTm9kZS5yaWdodCArIEhJR0hMSUdIVF9ESUxBVElPTjtcbiAgICB9O1xuICAgIGZsb3dSYXRlUHJvcGVydHkubGluayggZmxvd1JhdGVPYnNlcnZlciApO1xuXG4gICAgY29uc3QgZW5hYmxlZE9ic2VydmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xuICAgICAgaWYgKCAhZW5hYmxlZCAmJiBkcmFnTGlzdGVuZXIuaXNQcmVzc2VkICkge1xuICAgICAgICBkcmFnTGlzdGVuZXIuaW50ZXJydXB0KCk7XG4gICAgICB9XG4gICAgICBpZiAoICFlbmFibGVkICYmIHRhcFRvRGlzcGVuc2VJc1J1bm5pbmcgKSB7XG4gICAgICAgIGVuZFRhcFRvRGlzcGVuc2UoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkT2JzZXJ2ZXIgKTtcblxuICAgIHRoaXMubXV0YXRlKCBib3VuZHNSZXF1aXJlZE9wdGlvbktleXMgKTtcblxuICAgIC8vIGZsb3cgcmF0ZSBjb250cm9sIGlzIHZpc2libGUgb25seSB3aGVuIHRoZSBmYXVjZXQgaXMgaW50ZXJhY3RpdmVcbiAgICBjb25zdCBpbnRlcmFjdGl2ZU9ic2VydmVyID0gKCBpbnRlcmFjdGl2ZTogYm9vbGVhbiApID0+IHtcbiAgICAgIHNob290ZXJOb2RlLnZpc2libGUgPSB0cmFja05vZGUudmlzaWJsZSA9IGludGVyYWN0aXZlO1xuICAgIH07XG4gICAgb3B0aW9ucy5pbnRlcmFjdGl2ZVByb3BlcnR5LmxpbmsoIGludGVyYWN0aXZlT2JzZXJ2ZXIgKTtcblxuICAgIC8vIEFkZCBhIGxpbmsgdG8gZmxvd1JhdGVQcm9wZXJ0eSwgdG8gbWFrZSBpdCBlYXNpZXIgdG8gZmluZCBpbiBTdHVkaW8uXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waC1zY2FsZS9pc3N1ZXMvMTIzXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBmbG93UmF0ZVByb3BlcnR5LCB7XG4gICAgICB0YW5kZW1OYW1lOiAnZmxvd1JhdGVQcm9wZXJ0eSdcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VGYXVjZXROb2RlID0gKCkgPT4ge1xuXG4gICAgICAvLyBQcm9wZXJ0aWVzXG4gICAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVQcm9wZXJ0eS5oYXNMaXN0ZW5lciggaW50ZXJhY3RpdmVPYnNlcnZlciApICkge1xuICAgICAgICBvcHRpb25zLmludGVyYWN0aXZlUHJvcGVydHkudW5saW5rKCBpbnRlcmFjdGl2ZU9ic2VydmVyICk7XG4gICAgICB9XG4gICAgICBpZiAoIGZsb3dSYXRlUHJvcGVydHkuaGFzTGlzdGVuZXIoIGZsb3dSYXRlT2JzZXJ2ZXIgKSApIHtcbiAgICAgICAgZmxvd1JhdGVQcm9wZXJ0eS51bmxpbmsoIGZsb3dSYXRlT2JzZXJ2ZXIgKTtcbiAgICAgIH1cbiAgICAgIGlmICggZW5hYmxlZFByb3BlcnR5Lmhhc0xpc3RlbmVyKCBlbmFibGVkT2JzZXJ2ZXIgKSApIHtcbiAgICAgICAgZW5hYmxlZFByb3BlcnR5LnVubGluayggZW5hYmxlZE9ic2VydmVyICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFN1YmNvbXBvbmVudHNcbiAgICAgIGRyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICBrZXlib2FyZExpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIHNob290ZXJOb2RlLmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdGYXVjZXROb2RlJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRmF1Y2V0Tm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQ0xPU0VfRkFVQ0VUX0hPVEtFWV9EQVRBID0gbmV3IEhvdGtleURhdGEoIHtcbiAgICBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBbIG5ldyBQcm9wZXJ0eSggJzAnICksIG5ldyBQcm9wZXJ0eSggJ2hvbWUnICkgXSxcbiAgICByZXBvTmFtZTogc2NlbmVyeVBoZXQubmFtZSxcbiAgICBrZXlib2FyZEhlbHBEaWFsb2dMYWJlbFN0cmluZ1Byb3BlcnR5OiBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLmZhdWNldENvbnRyb2xzLmNsb3NlRmF1Y2V0U3RyaW5nUHJvcGVydHlcbiAgfSApO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVEFQX1RPX0RJU1BFTlNFX0hPVEtFWV9EQVRBID0gbmV3IEhvdGtleURhdGEoIHtcbiAgICBrZXlTdHJpbmdQcm9wZXJ0aWVzOiBbIG5ldyBQcm9wZXJ0eSggJ2VudGVyJyApLCBuZXcgUHJvcGVydHkoICdzcGFjZScgKSBdLFxuICAgIHJlcG9OYW1lOiBzY2VuZXJ5UGhldC5uYW1lLFxuICAgIGJpbmRlck5hbWU6ICdUYXAgdG8gZGlzcGVuc2UgZmF1Y2V0J1xuICB9ICk7XG5cbiAgcHVibGljIHN0YXRpYyBGYXVjZXROb2RlSU8gPSBuZXcgSU9UeXBlKCAnRmF1Y2V0Tm9kZUlPJywge1xuICAgIHZhbHVlVHlwZTogRmF1Y2V0Tm9kZSxcbiAgICBkb2N1bWVudGF0aW9uOiAnRmF1Y2V0IHRoYXQgZW1pdHMgZmx1aWQsIHR5cGljYWxseSB1c2VyLWNvbnRyb2xsYWJsZScsXG4gICAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcbiAgICBldmVudHM6IFsgJ3N0YXJ0VGFwVG9EaXNwZW5zZScsICdlbmRUYXBUb0Rpc3BlbnNlJyBdXG4gIH0gKTtcbn1cblxudHlwZSBTaG9vdGVyTm9kZVNlbGZPcHRpb25zID0ge1xuICBrbm9iU2NhbGU/OiBudW1iZXI7IC8vIHZhbHVlcyBpbiB0aGUgcmFuZ2UgMC42IC0gMS4wIGxvb2sgZGVjZW50XG5cbiAgLy8gcG9pbnRlciBhcmVhc1xuICB0b3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XG4gIHRvdWNoQXJlYVlEaWxhdGlvbj86IG51bWJlcjtcbiAgbW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICBtb3VzZUFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG59O1xudHlwZSBTaG9vdGVyTm9kZU9wdGlvbnMgPSBTaG9vdGVyTm9kZVNlbGZPcHRpb25zOyAvLyBubyBOb2RlT3B0aW9ucyBhcmUgaW5jbHVkZWRcblxuLyoqXG4gKiBUaGUgJ3Nob290ZXInIGlzIHRoZSBpbnRlcmFjdGl2ZSBwYXJ0IG9mIHRoZSBmYXVjZXQuXG4gKi9cbmNsYXNzIFNob290ZXJOb2RlIGV4dGVuZHMgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcoIE5vZGUgKSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2hvb3Rlck5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgLy8gQ3VzdG9tIGJvdW5kcyB0aGF0IGRlZmluZSBoaWdobGlnaHQgc2hhcGVzIGZvciB0aGUgU2hvb3Rlck5vZGUuIFRoZSBGYXVjZXROb2RlIHVzZXMgdGhlc2UgYXMgaXRzIG93blxuICAvLyBoaWdobGlnaHQgdG8gaW5kaWNhdGUgdGhhdCB0aGUgU2hvb3RlciBpcyB0aGUgaW50ZXJhY3RpdmUgcGFydC4gQnV0IHRoZSBoaWdobGlnaHRzIHRoZW1zZWx2ZXMgYXJlIHNldFxuICAvLyBvbiB0aGUgRmF1Y2V0Tm9kZSBiZWNhdXNlIHRoYXQgaXMgdGhlIGNvbXBvbmVudCB0aGF0IGlzIGZvY3VzYWJsZS5cbiAgcHVibGljIHJlYWRvbmx5IGZvY3VzSGlnaGxpZ2h0Qm91bmRzOiBCb3VuZHMyO1xuICBwdWJsaWMgcmVhZG9ubHkgZ3JvdXBGb2N1c0hpZ2hsaWdodEJvdW5kczogQm91bmRzMjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVkT3B0aW9ucz86IFNob290ZXJOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2hvb3Rlck5vZGVPcHRpb25zLCBTaG9vdGVyTm9kZVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAga25vYlNjYWxlOiAwLjYsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDAsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDAsXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDAsXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDBcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGtub2JcbiAgICBjb25zdCBrbm9iTm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0S25vYl9wbmcgKTtcblxuICAgIC8vIHNldCBwb2ludGVyIGFyZWFzIGJlZm9yZSBzY2FsaW5nXG4gICAga25vYk5vZGUudG91Y2hBcmVhID0ga25vYk5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBvcHRpb25zLnRvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24gKTtcbiAgICBrbm9iTm9kZS5tb3VzZUFyZWEgPSBrbm9iTm9kZS5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMubW91c2VBcmVhWERpbGF0aW9uLCBvcHRpb25zLm1vdXNlQXJlYVlEaWxhdGlvbiApO1xuXG4gICAga25vYk5vZGUuc2NhbGUoIG9wdGlvbnMua25vYlNjYWxlICk7XG4gICAgY29uc3Qga25vYkRpc2FibGVkTm9kZSA9IG5ldyBJbWFnZSggZmF1Y2V0S25vYkRpc2FibGVkX3BuZyApO1xuICAgIGtub2JEaXNhYmxlZE5vZGUuc2NhbGUoIGtub2JOb2RlLmdldFNjYWxlVmVjdG9yKCkgKTtcblxuICAgIC8vIHNoYWZ0XG4gICAgY29uc3Qgc2hhZnROb2RlID0gbmV3IEltYWdlKCBmYXVjZXRTaGFmdF9wbmcgKTtcblxuICAgIC8vIGZsYW5nZVxuICAgIGNvbnN0IGZsYW5nZU5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldEZsYW5nZV9wbmcgKTtcbiAgICBjb25zdCBmbGFuZ2VEaXNhYmxlZE5vZGUgPSBuZXcgSW1hZ2UoIGZhdWNldEZsYW5nZURpc2FibGVkX3BuZyApO1xuXG4gICAgLy8gc3RvcFxuICAgIGNvbnN0IHN0b3BOb2RlID0gbmV3IEltYWdlKCBmYXVjZXRTdG9wX3BuZyApO1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHNoYWZ0Tm9kZSxcbiAgICAgICAgc3RvcE5vZGUsXG4gICAgICAgIGZsYW5nZU5vZGUsXG4gICAgICAgIGZsYW5nZURpc2FibGVkTm9kZSxcbiAgICAgICAga25vYk5vZGUsXG4gICAgICAgIGtub2JEaXNhYmxlZE5vZGVcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyBsYXlvdXQsIHJlbGF0aXZlIHRvIHNoYWZ0XG4gICAgc3RvcE5vZGUueCA9IHNoYWZ0Tm9kZS54ICsgMTM7XG4gICAgc3RvcE5vZGUuY2VudGVyWSA9IHNoYWZ0Tm9kZS5jZW50ZXJZO1xuICAgIGZsYW5nZU5vZGUubGVmdCA9IHNoYWZ0Tm9kZS5yaWdodCAtIDE7IC8vIGEgYml0IG9mIG92ZXJsYXBcbiAgICBmbGFuZ2VOb2RlLmNlbnRlclkgPSBzaGFmdE5vZGUuY2VudGVyWTtcbiAgICBmbGFuZ2VEaXNhYmxlZE5vZGUudHJhbnNsYXRpb24gPSBmbGFuZ2VOb2RlLnRyYW5zbGF0aW9uO1xuICAgIGtub2JOb2RlLmxlZnQgPSBmbGFuZ2VOb2RlLnJpZ2h0IC0gODsgLy8gYSBiaXQgb2Ygb3ZlcmxhcCBtYWtlcyB0aGlzIGxvb2sgYmV0dGVyXG4gICAga25vYk5vZGUuY2VudGVyWSA9IGZsYW5nZU5vZGUuY2VudGVyWTtcbiAgICBrbm9iRGlzYWJsZWROb2RlLnRyYW5zbGF0aW9uID0ga25vYk5vZGUudHJhbnNsYXRpb247XG5cbiAgICAvLyBjdXN0b20gZm9jdXMgaGlnaGxpZ2h0cyB0aGF0IGFyZSByZWxhdGl2ZSB0byBjb21wb25lbnRzIG9mIHRoaXMgTm9kZVxuICAgIHRoaXMuZm9jdXNIaWdobGlnaHRCb3VuZHMgPSBuZXcgQm91bmRzMiggZmxhbmdlTm9kZS5sZWZ0LCBrbm9iTm9kZS50b3AsIGtub2JOb2RlLnJpZ2h0LCBrbm9iTm9kZS5ib3R0b20gKS5kaWxhdGVkKCBISUdITElHSFRfRElMQVRJT04gKTtcblxuICAgIC8vIHRoZSBncm91cCBmb2N1cyBoaWdobGlnaHQgYm91bmRzIHN1cnJvdW5kcyB0aGUgd2hvbGUgc2hvb3RlciBhbmQgZXh0ZW5kcyBvdXQgdG8gc2hvdyB0aGUgcmFuZ2Ugb2YgdGhlIGtub2JcbiAgICB0aGlzLmdyb3VwRm9jdXNIaWdobGlnaHRCb3VuZHMgPSBuZXcgQm91bmRzMihcbiAgICAgIHNoYWZ0Tm9kZS5sZWZ0LFxuICAgICAga25vYk5vZGUudG9wIC0gSElHSExJR0hUX0RJTEFUSU9OICogMixcbiAgICAgIGtub2JOb2RlLnJpZ2h0ICsgc2hhZnROb2RlLndpZHRoIC8gMiArIDE1LFxuICAgICAga25vYk5vZGUuYm90dG9tICsgSElHSExJR0hUX0RJTEFUSU9OICogMlxuICAgICk7XG5cbiAgICAvLyBUaGlzIFNob290ZXJOb2RlIHJlY2VpdmVzIGlucHV0IHRvIGFjdGl2YXRlIHRoZSBJbnRlcmFjdGl2ZSBIaWdobGlnaHQsIHNvIHRoaXMgaGlnaGxpZ2h0IGlzIHNldCBvbiB0aGVcbiAgICAvLyBTaG9vdGVyTm9kZSBldmVuIHRob3VnaCBmb2N1cyBoaWdobGlnaHRzIGFyZSBzZXQgb24gdGhlIHBhcmVudCBGYXVjZXROb2RlLlxuICAgIHRoaXMuaW50ZXJhY3RpdmVIaWdobGlnaHQgPSBuZXcgSGlnaGxpZ2h0UGF0aCggU2hhcGUuYm91bmRzKCB0aGlzLmZvY3VzSGlnaGxpZ2h0Qm91bmRzICkgKTtcblxuICAgIGNvbnN0IGVuYWJsZWRPYnNlcnZlciA9ICggZW5hYmxlZDogYm9vbGVhbiApID0+IHtcbiAgICAgIC8vIHRoZSBlbnRpcmUgc2hvb3RlciBpcyBkcmFnZ2FibGUsIGJ1dCBlbmNvdXJhZ2UgZHJhZ2dpbmcgYnkgdGhlIGtub2IgYnkgY2hhbmdpbmcgaXRzIGN1cnNvclxuICAgICAgdGhpcy5waWNrYWJsZSA9IGVuYWJsZWQ7XG4gICAgICBrbm9iTm9kZS5jdXJzb3IgPSBmbGFuZ2VOb2RlLmN1cnNvciA9IGVuYWJsZWQgPyAncG9pbnRlcicgOiAnZGVmYXVsdCc7XG4gICAgICBrbm9iTm9kZS52aXNpYmxlID0gZW5hYmxlZDtcbiAgICAgIGtub2JEaXNhYmxlZE5vZGUudmlzaWJsZSA9ICFlbmFibGVkO1xuICAgICAgZmxhbmdlTm9kZS52aXNpYmxlID0gZW5hYmxlZDtcbiAgICAgIGZsYW5nZURpc2FibGVkTm9kZS52aXNpYmxlID0gIWVuYWJsZWQ7XG4gICAgfTtcbiAgICBlbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZE9ic2VydmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VTaG9vdGVyTm9kZSA9ICgpID0+IHtcbiAgICAgIGlmICggZW5hYmxlZFByb3BlcnR5Lmhhc0xpc3RlbmVyKCBlbmFibGVkT2JzZXJ2ZXIgKSApIHtcbiAgICAgICAgZW5hYmxlZFByb3BlcnR5LnVubGluayggZW5hYmxlZE9ic2VydmVyICk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVNob290ZXJOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnRmF1Y2V0Tm9kZScsIEZhdWNldE5vZGUgKTsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJzdGVwVGltZXIiLCJCb3VuZHMyIiwiTGluZWFyRnVuY3Rpb24iLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJHcm91cEhpZ2hsaWdodFBhdGgiLCJIaWdobGlnaHRQYXRoIiwiSG90a2V5RGF0YSIsIkltYWdlIiwiSW50ZXJhY3RpdmVIaWdobGlnaHRpbmciLCJLZXlib2FyZExpc3RlbmVyIiwiTm9kZSIsIlJlY3RhbmdsZSIsIkFjY2Vzc2libGVTbGlkZXIiLCJFdmVudFR5cGUiLCJUYW5kZW0iLCJJT1R5cGUiLCJmYXVjZXRCb2R5X3BuZyIsImZhdWNldEZsYW5nZV9wbmciLCJmYXVjZXRGbGFuZ2VEaXNhYmxlZF9wbmciLCJmYXVjZXRIb3Jpem9udGFsUGlwZV9wbmciLCJmYXVjZXRLbm9iX3BuZyIsImZhdWNldEtub2JEaXNhYmxlZF9wbmciLCJmYXVjZXRTaGFmdF9wbmciLCJmYXVjZXRTcG91dF9wbmciLCJmYXVjZXRTdG9wX3BuZyIsImZhdWNldFRyYWNrX3BuZyIsImZhdWNldFZlcnRpY2FsUGlwZV9wbmciLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkRFQlVHX09SSUdJTiIsIlNQT1VUX09VVFBVVF9DRU5URVJfWCIsIkhPUklaT05UQUxfUElQRV9YX09WRVJMQVAiLCJWRVJUSUNBTF9QSVBFX1lfT1ZFUkxBUCIsIlNIT09URVJfTUlOX1hfT0ZGU0VUIiwiU0hPT1RFUl9NQVhfWF9PRkZTRVQiLCJTSE9PVEVSX1lfT0ZGU0VUIiwiU0hPT1RFUl9XSU5ET1dfQk9VTkRTIiwiVFJBQ0tfWV9PRkZTRVQiLCJISUdITElHSFRfRElMQVRJT04iLCJGYXVjZXROb2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VGYXVjZXROb2RlIiwibWF4Rmxvd1JhdGUiLCJmbG93UmF0ZVByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsImhvcml6b250YWxQaXBlTGVuZ3RoIiwidmVydGljYWxQaXBlTGVuZ3RoIiwidGFwVG9EaXNwZW5zZUVuYWJsZWQiLCJ0YXBUb0Rpc3BlbnNlQW1vdW50IiwidGFwVG9EaXNwZW5zZUludGVydmFsIiwiY2xvc2VPblJlbGVhc2UiLCJpbnRlcmFjdGl2ZVByb3BlcnR5IiwicmFzdGVyaXplSG9yaXpvbnRhbFBpcGVOb2RlIiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJwaGV0IiwiYXhvbiIsImRvdCIsIlJhbmdlIiwidmFsdWVQcm9wZXJ0eSIsInNjYWxlIiwiaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwicGhldGlvVHlwZSIsIkZhdWNldE5vZGVJTyIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRXZlbnRUeXBlIiwiVVNFUiIsImFzc2VydCIsInNob290ZXJOb2RlIiwiU2hvb3Rlck5vZGUiLCJzaG9vdGVyT3B0aW9ucyIsInRyYWNrTm9kZSIsImhvcml6b250YWxQaXBlTm9kZSIsImhvcml6b250YWxQaXBlV2lkdGgiLCJzZXRTY2FsZU1hZ25pdHVkZSIsIndpZHRoIiwicmFzdGVyaXplZCIsInZlcnRpY2FsUGlwZU5vZGUiLCJ2ZXJ0aWNhbFBpcGVOb2RlSGVpZ2h0IiwiaGVpZ2h0Iiwic3BvdXROb2RlIiwiYm9keU5vZGUiLCJzaG9vdGVyV2luZG93Tm9kZSIsIm1pblgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJmaWxsIiwiYm91bmRzUmVxdWlyZWRPcHRpb25LZXlzIiwiXyIsInBpY2siLCJSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMiLCJvbWl0IiwiYWRkQ2hpbGQiLCJyYWRpdXMiLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwicmlnaHQiLCJ0cmFuc2xhdGlvbiIsImxlZnQiLCJjZW50ZXJZIiwib2Zmc2V0VG9GbG93UmF0ZSIsInRhcFRvRGlzcGVuc2VJc0FybWVkIiwidGFwVG9EaXNwZW5zZUlzUnVubmluZyIsInRpbWVvdXRJRCIsImludGVydmFsSUQiLCJzdGFydFRhcFRvRGlzcGVuc2UiLCJnZXQiLCJmbG93UmF0ZSIsInBoZXRpb1N0YXJ0RXZlbnQiLCJkYXRhIiwic2V0Iiwic2V0VGltZW91dCIsInNldEludGVydmFsIiwiZW5kVGFwVG9EaXNwZW5zZSIsInBoZXRpb0VuZEV2ZW50IiwiY2xlYXJUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsInN0YXJ0WE9mZnNldCIsImRyYWdMaXN0ZW5lciIsInN0YXJ0IiwiZXZlbnQiLCJjdXJyZW50VGFyZ2V0IiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsIngiLCJkcmFnIiwibGlzdGVuZXIiLCJ4T2Zmc2V0IiwiZXZhbHVhdGUiLCJlbmQiLCJjcmVhdGVUYW5kZW0iLCJhZGRJbnB1dExpc3RlbmVyIiwia2V5Ym9hcmRMaXN0ZW5lciIsImtleVN0cmluZ1Byb3BlcnRpZXMiLCJjb21iaW5lS2V5U3RyaW5nUHJvcGVydGllcyIsIkNMT1NFX0ZBVUNFVF9IT1RLRVlfREFUQSIsIlRBUF9UT19ESVNQRU5TRV9IT1RLRVlfREFUQSIsImZpcmUiLCJrZXlzUHJlc3NlZCIsImhhc0tleVN0cm9rZSIsImJsdXIiLCJsb2NhbEhpZ2hsaWdodEJvdW5kcyIsImdsb2JhbFRvTG9jYWxCb3VuZHMiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwiZm9jdXNIaWdobGlnaHRCb3VuZHMiLCJsb2NhbEdyb3VwSGlnaGxpZ2h0Qm91bmRzIiwiZ3JvdXBGb2N1c0hpZ2hsaWdodEJvdW5kcyIsImZvY3VzSGlnaGxpZ2h0IiwiYm91bmRzIiwiZ3JvdXBGb2N1c0hpZ2hsaWdodCIsImZsb3dSYXRlT2JzZXJ2ZXIiLCJpbnZlcnNlIiwibGluayIsImVuYWJsZWRPYnNlcnZlciIsImVuYWJsZWQiLCJpc1ByZXNzZWQiLCJpbnRlcnJ1cHQiLCJtdXRhdGUiLCJpbnRlcmFjdGl2ZU9ic2VydmVyIiwiaW50ZXJhY3RpdmUiLCJ2aXNpYmxlIiwiYWRkTGlua2VkRWxlbWVudCIsInRhbmRlbU5hbWUiLCJoYXNMaXN0ZW5lciIsInVubGluayIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZXBvTmFtZSIsIm5hbWUiLCJrZXlib2FyZEhlbHBEaWFsb2dMYWJlbFN0cmluZ1Byb3BlcnR5Iiwia2V5Ym9hcmRIZWxwRGlhbG9nIiwiZmF1Y2V0Q29udHJvbHMiLCJjbG9zZUZhdWNldFN0cmluZ1Byb3BlcnR5IiwiYmluZGVyTmFtZSIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdXBlcnR5cGUiLCJOb2RlSU8iLCJldmVudHMiLCJkaXNwb3NlU2hvb3Rlck5vZGUiLCJrbm9iU2NhbGUiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJrbm9iTm9kZSIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZFhZIiwibW91c2VBcmVhIiwia25vYkRpc2FibGVkTm9kZSIsImdldFNjYWxlVmVjdG9yIiwic2hhZnROb2RlIiwiZmxhbmdlTm9kZSIsImZsYW5nZURpc2FibGVkTm9kZSIsInN0b3BOb2RlIiwiY2hpbGRyZW4iLCJkaWxhdGVkIiwiaW50ZXJhY3RpdmVIaWdobGlnaHQiLCJwaWNrYWJsZSIsImN1cnNvciIsInJlZ2lzdGVyIl0sIm1h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