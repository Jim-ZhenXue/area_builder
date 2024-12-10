// Copyright 2015-2024, University of Colorado Boulder
/**
 * Conductivity tester. Light bulb connected to a battery, with draggable probes.
 * When the probes are both immersed in solution, the circuit is completed, and the bulb glows.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, DragListener, Image, InteractiveHighlighting, KeyboardDragListener, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import batteryDCell_png from '../images/batteryDCell_png.js';
import LightBulbNode from './LightBulbNode.js';
import MinusNode from './MinusNode.js';
import PhetFont from './PhetFont.js';
import PlusNode from './PlusNode.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
// constants
const SHOW_TESTER_ORIGIN = false; // draws a red circle at the tester's origin, for debugging
const SHOW_PROBE_ORIGIN = false; // draws a red circle at the origin of probes, for debugging
const DEFAULT_SHORT_CIRCUIT_FONT = new PhetFont(14);
let ConductivityTesterNode = class ConductivityTesterNode extends Node {
    /**
   * Is 'Short circuit' shown above the light bulb?
   */ get shortCircuit() {
        return this.shortCircuitNode.visible;
    }
    /**
   * Determines whether 'Short circuit' is shown above the light bulb. Note that it is the client's responsibility
   * to ensure that the bulb's brightness (as set by brightnessProperty) is appropriate for a short circuit.
   */ set shortCircuit(value) {
        this.shortCircuitNode.visible = value;
    }
    /**
   * @param brightnessProperty brightness of bulb varies from 0 (off) to 1 (full on)
   * @param positionProperty position of the tester, at bottom-center of the bulb (model coordinate frame)
   * @param positiveProbePositionProperty position of bottom-center of the positive probe (model coordinate frame)
   * @param negativeProbePositionProperty position of bottom-center of the negative probe (model coordinate frame)
   * @param providedOptions
   */ constructor(brightnessProperty, positionProperty, positiveProbePositionProperty, negativeProbePositionProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // NOTE! Since positionProperty determines translation, avoid options related to translation!
        const options = optionize()({
            modelViewTransform: ModelViewTransform2.createIdentity(),
            bulbImageScale: 0.33,
            batteryDCell_pngScale: 0.6,
            // common to both probes
            probeSize: new Dimension2(20, 68),
            probeLineWidth: 0.5,
            probeDragYRange: null,
            probeCursor: 'pointer',
            // positive probe
            positiveProbeFill: 'red',
            positiveProbeStroke: 'black',
            positiveLabelFill: 'white',
            // negative probe
            negativeProbeFill: 'black',
            negativeProbeStroke: 'black',
            negativeLabelFill: 'white',
            // wires
            wireStroke: 'black',
            wireLineWidth: 1.5,
            bulbToBatteryWireLength: 40,
            // short-circuit indicator
            shortCircuitFont: DEFAULT_SHORT_CIRCUIT_FONT,
            shortCircuitFill: 'black',
            // NodeOptions
            isDisposable: false,
            phetioInputEnabledPropertyInstrumented: true
        }, providedOptions);
        // bulb, origin at bottom center of base
        const lightBulbNode = new LightBulbNode(brightnessProperty, {
            bulbImageScale: options.bulbImageScale
        });
        // short-circuit indicator, centered above the light bulb
        assert && assert(brightnessProperty.value === 0, 'layout will be incorrect if lightBulbNode has rays');
        const shortCircuitNode = new Text(SceneryPhetStrings.shortCircuitStringProperty, {
            font: options.shortCircuitFont,
            fill: options.shortCircuitFill,
            visible: false // initial state is no short circuit
        });
        shortCircuitNode.boundsProperty.link((bounds)=>{
            shortCircuitNode.centerX = lightBulbNode.centerX;
            shortCircuitNode.bottom = lightBulbNode.top;
        });
        // battery
        const battery = new Image(batteryDCell_png, {
            scale: options.batteryDCell_pngScale,
            left: options.bulbToBatteryWireLength,
            centerY: 0
        });
        // wire from bulb base to battery
        const bulbBatteryWire = new Path(new Shape().moveTo(0, 0).lineTo(options.bulbToBatteryWireLength, 0), {
            stroke: options.wireStroke,
            lineWidth: options.wireLineWidth
        });
        // apparatus (bulb + battery), origin at bottom center of bulb's base
        const apparatusNode = new Node({
            children: [
                bulbBatteryWire,
                battery,
                lightBulbNode,
                shortCircuitNode
            ]
        });
        if (SHOW_TESTER_ORIGIN) {
            apparatusNode.addChild(new Circle(2, {
                fill: 'red'
            }));
        }
        // wire from battery terminal to positive probe
        const positiveWire = new WireNode(battery.getGlobalBounds().right, battery.getGlobalBounds().centerY, options.modelViewTransform.modelToViewX(positiveProbePositionProperty.value.x) - options.modelViewTransform.modelToViewX(positionProperty.value.x), options.modelViewTransform.modelToViewY(positiveProbePositionProperty.value.y) - options.modelViewTransform.modelToViewY(positionProperty.value.y) - options.probeSize.height, {
            stroke: options.wireStroke,
            lineWidth: options.wireLineWidth
        });
        // wire from base of bulb (origin) to negative probe
        const negativeWire = new WireNode(-5, -5, options.modelViewTransform.modelToViewX(negativeProbePositionProperty.value.x) - options.modelViewTransform.modelToViewX(positionProperty.value.x), options.modelViewTransform.modelToViewY(negativeProbePositionProperty.value.y) - options.modelViewTransform.modelToViewY(positionProperty.value.y) - options.probeSize.height, {
            stroke: options.wireStroke,
            lineWidth: options.wireLineWidth
        });
        // probes
        const positiveProbe = new ProbeNode(new PlusNode({
            fill: options.positiveLabelFill
        }), {
            size: options.probeSize,
            fill: options.positiveProbeFill,
            stroke: options.positiveProbeStroke,
            lineWidth: options.probeLineWidth
        });
        const negativeProbe = new ProbeNode(new MinusNode({
            fill: options.negativeLabelFill
        }), {
            size: options.probeSize,
            fill: options.negativeProbeFill,
            stroke: options.negativeProbeStroke,
            lineWidth: options.probeLineWidth
        });
        // drag listener for probes
        let clickYOffset = 0;
        const probeDragListener = new DragListener({
            start: (event)=>{
                const currentTarget = event.currentTarget;
                clickYOffset = currentTarget.globalToParentPoint(event.pointer.point).y - currentTarget.y;
            },
            // probes move together
            drag: (event, listener)=>{
                // do dragging in view coordinate frame
                const positionView = options.modelViewTransform.modelToViewPosition(positionProperty.value);
                let yView = listener.currentTarget.globalToParentPoint(event.pointer.point).y + positionView.y - clickYOffset;
                if (options.probeDragYRange) {
                    yView = Utils.clamp(yView, positionView.y + options.probeDragYRange.min, positionView.y + options.probeDragYRange.max);
                }
                // convert to model coordinate frame
                const yModel = options.modelViewTransform.viewToModelY(yView);
                positiveProbePositionProperty.value = new Vector2(positiveProbePositionProperty.value.x, yModel);
                negativeProbePositionProperty.value = new Vector2(negativeProbePositionProperty.value.x, yModel);
            },
            tandem: options.tandem.createTandem('probeDragListener')
        });
        // Keyboard drag listener for probes, see https://github.com/phetsims/acid-base-solutions/issues/208
        const probeKeyboardDragListener = new KeyboardDragListener(combineOptions({
            transform: options.modelViewTransform,
            drag: (event, listener)=>{
                // probes move together
                const y = positionProperty.value.y;
                const yPositiveProbe = positiveProbePositionProperty.value.y + listener.modelDelta.y;
                const yPositiveProbeConstrained = options.probeDragYRange ? Utils.clamp(yPositiveProbe, y + options.probeDragYRange.min, y + options.probeDragYRange.max) : yPositiveProbe;
                positiveProbePositionProperty.value = new Vector2(positiveProbePositionProperty.value.x, yPositiveProbeConstrained);
                const yNegativeProbe = negativeProbePositionProperty.value.y + listener.modelDelta.y;
                const yNegativeProbeConstrained = options.probeDragYRange ? Utils.clamp(yNegativeProbe, y + options.probeDragYRange.min, y + options.probeDragYRange.max) : yNegativeProbe;
                negativeProbePositionProperty.value = new Vector2(negativeProbePositionProperty.value.x, yNegativeProbeConstrained);
            },
            tandem: options.tandem.createTandem('probeKeyboardDragListener')
        }, options.keyboardDragListenerOptions));
        positiveProbe.cursor = options.probeCursor;
        positiveProbe.addInputListener(probeDragListener);
        positiveProbe.addInputListener(probeKeyboardDragListener);
        negativeProbe.cursor = options.probeCursor;
        negativeProbe.addInputListener(probeDragListener);
        negativeProbe.addInputListener(probeKeyboardDragListener);
        options.children = [
            negativeWire,
            positiveWire,
            negativeProbe,
            positiveProbe,
            apparatusNode
        ];
        super(options);
        // when the position changes ...
        positionProperty.link((position, oldPosition)=>{
            // move the entire tester
            this.translation = options.modelViewTransform.modelToViewPosition(position);
            // probes move with the tester
            if (oldPosition) {
                const dx = position.x - oldPosition.x;
                const dy = position.y - oldPosition.y;
                positiveProbePositionProperty.value = new Vector2(positiveProbePositionProperty.value.x + dx, positiveProbePositionProperty.value.y + dy);
                negativeProbePositionProperty.value = new Vector2(negativeProbePositionProperty.value.x + dx, negativeProbePositionProperty.value.y + dy);
            }
        });
        // update positive wire if end point was changed
        const positiveProbeObserver = (positiveProbePosition)=>{
            positiveProbe.centerX = options.modelViewTransform.modelToViewX(positiveProbePosition.x) - options.modelViewTransform.modelToViewX(positionProperty.value.x);
            positiveProbe.bottom = options.modelViewTransform.modelToViewY(positiveProbePosition.y) - options.modelViewTransform.modelToViewY(positionProperty.value.y);
            positiveWire.setEndPoint(positiveProbe.x, positiveProbe.y - options.probeSize.height);
        };
        positiveProbePositionProperty.link(positiveProbeObserver);
        // update negative wire if end point was changed
        const negativeProbeObserver = (negativeProbePosition)=>{
            negativeProbe.centerX = options.modelViewTransform.modelToViewX(negativeProbePosition.x) - options.modelViewTransform.modelToViewX(positionProperty.value.x);
            negativeProbe.bottom = options.modelViewTransform.modelToViewY(negativeProbePosition.y) - options.modelViewTransform.modelToViewY(positionProperty.value.y);
            negativeWire.setEndPoint(negativeProbe.x, negativeProbe.y - options.probeSize.height);
        };
        negativeProbePositionProperty.link(negativeProbeObserver);
        this.shortCircuitNode = shortCircuitNode;
        // To prevent light from updating when invisible
        this.visibleProperty.link((visible)=>{
            lightBulbNode.visible = visible;
        });
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ConductivityTesterNode', this);
    }
};
export { ConductivityTesterNode as default };
/**
 * Conductivity probe, origin at bottom center.
 */ let ProbeNode = class ProbeNode extends InteractiveHighlighting(Node) {
    constructor(labelNode, providedOptions){
        const options = optionize()({
            size: new Dimension2(20, 60),
            fill: 'white',
            stroke: 'black',
            lineWidth: 1.5,
            tagName: 'div',
            focusable: true
        }, providedOptions);
        super();
        // plate
        const plateNode = new Rectangle(-options.size.width / 2, -options.size.height, options.size.width, options.size.height, {
            fill: options.fill,
            stroke: options.stroke,
            lineWidth: options.lineWidth
        });
        // scale the label to fit, place it towards bottom center
        labelNode.setScaleMagnitude(0.5 * options.size.width / labelNode.width);
        labelNode.centerX = plateNode.centerX;
        labelNode.bottom = plateNode.bottom - 10;
        // rendering order
        this.addChild(plateNode);
        this.addChild(labelNode);
        if (SHOW_PROBE_ORIGIN) {
            this.addChild(new Circle(2, {
                fill: 'red'
            }));
        }
        // expand touch area
        this.touchArea = this.localBounds.dilatedXY(10, 10);
        this.mutate(options);
    }
};
/**
 * Wires that connect to the probes.
 */ let WireNode = class WireNode extends Path {
    // Sets the end point coordinates, the point attached to the probe.
    setEndPoint(endX, endY) {
        const startX = this.startPoint.x;
        const startY = this.startPoint.y;
        const controlPointXOffset = this.controlPointOffset.x;
        const controlPointYOffset = this.controlPointOffset.y;
        this.setShape(new Shape().moveTo(startX, startY).cubicCurveTo(startX + controlPointXOffset, startY, endX, endY + controlPointYOffset, endX, endY));
    }
    constructor(startX, startY, endX, endY, providedOptions){
        super(null);
        this.startPoint = {
            x: startX,
            y: startY
        };
        // control point offsets for when probe is to left of light bulb
        this.controlPointOffset = {
            x: 30,
            y: -50
        };
        if (endX < startX) {
            // probe is to right of light bulb, flip sign on control point x-offset
            this.controlPointOffset.x = -this.controlPointOffset.x;
        }
        this.setEndPoint(endX, endY);
        this.mutate(providedOptions);
    }
};
sceneryPhet.register('ConductivityTesterNode', ConductivityTesterNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9Db25kdWN0aXZpdHlUZXN0ZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbmR1Y3Rpdml0eSB0ZXN0ZXIuIExpZ2h0IGJ1bGIgY29ubmVjdGVkIHRvIGEgYmF0dGVyeSwgd2l0aCBkcmFnZ2FibGUgcHJvYmVzLlxuICogV2hlbiB0aGUgcHJvYmVzIGFyZSBib3RoIGltbWVyc2VkIGluIHNvbHV0aW9uLCB0aGUgY2lyY3VpdCBpcyBjb21wbGV0ZWQsIGFuZCB0aGUgYnVsYiBnbG93cy5cbiAqXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBGb250LCBJbWFnZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIEtleWJvYXJkRHJhZ0xpc3RlbmVyLCBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMsIE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBQYXRoT3B0aW9ucywgUmVjdGFuZ2xlLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGJhdHRlcnlEQ2VsbF9wbmcgZnJvbSAnLi4vaW1hZ2VzL2JhdHRlcnlEQ2VsbF9wbmcuanMnO1xuaW1wb3J0IExpZ2h0QnVsYk5vZGUgZnJvbSAnLi9MaWdodEJ1bGJOb2RlLmpzJztcbmltcG9ydCBNaW51c05vZGUgZnJvbSAnLi9NaW51c05vZGUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFBsdXNOb2RlIGZyb20gJy4vUGx1c05vZGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuL1NjZW5lcnlQaGV0U3RyaW5ncy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgU0hPV19URVNURVJfT1JJR0lOID0gZmFsc2U7IC8vIGRyYXdzIGEgcmVkIGNpcmNsZSBhdCB0aGUgdGVzdGVyJ3Mgb3JpZ2luLCBmb3IgZGVidWdnaW5nXG5jb25zdCBTSE9XX1BST0JFX09SSUdJTiA9IGZhbHNlOyAvLyBkcmF3cyBhIHJlZCBjaXJjbGUgYXQgdGhlIG9yaWdpbiBvZiBwcm9iZXMsIGZvciBkZWJ1Z2dpbmdcbmNvbnN0IERFRkFVTFRfU0hPUlRfQ0lSQ1VJVF9GT05UID0gbmV3IFBoZXRGb250KCAxNCApO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIG1vZGVsVmlld1RyYW5zZm9ybT86IE1vZGVsVmlld1RyYW5zZm9ybTI7XG4gIGJ1bGJJbWFnZVNjYWxlPzogbnVtYmVyO1xuICBiYXR0ZXJ5RENlbGxfcG5nU2NhbGU/OiBudW1iZXI7XG5cbiAgLy8gY29tbW9uIHRvIGJvdGggcHJvYmVzXG4gIHByb2JlU2l6ZT86IERpbWVuc2lvbjI7IC8vIHByb2JlIGRpbWVuc2lvbnMsIGluIHZpZXcgY29vcmRpbmF0ZXNcbiAgcHJvYmVMaW5lV2lkdGg/OiBudW1iZXI7XG4gIHByb2JlRHJhZ1lSYW5nZT86IFJhbmdlIHwgbnVsbDsgLy8geS1heGlzIGRyYWcgcmFuZ2UsIHJlbGF0aXZlIHRvIHBvc2l0aW9uUHJvcGVydHksIGluIHZpZXcgY29vcmRpbmF0ZXMuIG51bGwgbWVhbnMgbm8gY29uc3RyYWludC5cbiAgcHJvYmVDdXJzb3I/OiBzdHJpbmc7XG5cbiAgLy8gcG9zaXRpdmUgcHJvYmVcbiAgcG9zaXRpdmVQcm9iZUZpbGw/OiBUQ29sb3I7XG4gIHBvc2l0aXZlUHJvYmVTdHJva2U/OiBUQ29sb3I7XG4gIHBvc2l0aXZlTGFiZWxGaWxsPzogVENvbG9yO1xuXG4gIC8vIG5lZ2F0aXZlIHByb2JlXG4gIG5lZ2F0aXZlUHJvYmVGaWxsPzogVENvbG9yO1xuICBuZWdhdGl2ZVByb2JlU3Ryb2tlPzogVENvbG9yO1xuICBuZWdhdGl2ZUxhYmVsRmlsbD86IFRDb2xvcjtcblxuICAvLyB3aXJlc1xuICB3aXJlU3Ryb2tlPzogVENvbG9yO1xuICB3aXJlTGluZVdpZHRoPzogbnVtYmVyO1xuICBidWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aD86IG51bWJlcjsgLy8gbGVuZ3RoIG9mIHRoZSB3aXJlIGJldHdlZW4gYnVsYiBhbmQgYmF0dGVyeSwgaW4gdmlldyBjb29yZGluYXRlc1xuXG4gIC8vIHNob3J0LWNpcmN1aXQgaW5kaWNhdG9yXG4gIHNob3J0Q2lyY3VpdEZvbnQ/OiBGb250O1xuICBzaG9ydENpcmN1aXRGaWxsPzogVENvbG9yO1xuXG4gIGtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz86IFN0cmljdE9taXQ8S2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zLCAndGFuZGVtJz47XG59O1xuXG5leHBvcnQgdHlwZSBDb25kdWN0aXZpdHlUZXN0ZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcbiAgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz4gJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZHVjdGl2aXR5VGVzdGVyTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hvcnRDaXJjdWl0Tm9kZTogTm9kZTtcblxuICAvKipcbiAgICogQHBhcmFtIGJyaWdodG5lc3NQcm9wZXJ0eSBicmlnaHRuZXNzIG9mIGJ1bGIgdmFyaWVzIGZyb20gMCAob2ZmKSB0byAxIChmdWxsIG9uKVxuICAgKiBAcGFyYW0gcG9zaXRpb25Qcm9wZXJ0eSBwb3NpdGlvbiBvZiB0aGUgdGVzdGVyLCBhdCBib3R0b20tY2VudGVyIG9mIHRoZSBidWxiIChtb2RlbCBjb29yZGluYXRlIGZyYW1lKVxuICAgKiBAcGFyYW0gcG9zaXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkgcG9zaXRpb24gb2YgYm90dG9tLWNlbnRlciBvZiB0aGUgcG9zaXRpdmUgcHJvYmUgKG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUpXG4gICAqIEBwYXJhbSBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSBwb3NpdGlvbiBvZiBib3R0b20tY2VudGVyIG9mIHRoZSBuZWdhdGl2ZSBwcm9iZSAobW9kZWwgY29vcmRpbmF0ZSBmcmFtZSlcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBicmlnaHRuZXNzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXG4gICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogVFByb3BlcnR5PFZlY3RvcjI+LFxuICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5OiBUUHJvcGVydHk8VmVjdG9yMj4sXG4gICAgICAgICAgICAgICAgICAgICAgbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBDb25kdWN0aXZpdHlUZXN0ZXJOb2RlT3B0aW9ucyApIHtcblxuICAgIC8vIE5PVEUhIFNpbmNlIHBvc2l0aW9uUHJvcGVydHkgZGV0ZXJtaW5lcyB0cmFuc2xhdGlvbiwgYXZvaWQgb3B0aW9ucyByZWxhdGVkIHRvIHRyYW5zbGF0aW9uIVxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q29uZHVjdGl2aXR5VGVzdGVyTm9kZU9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMnPiwgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCksXG4gICAgICBidWxiSW1hZ2VTY2FsZTogMC4zMyxcbiAgICAgIGJhdHRlcnlEQ2VsbF9wbmdTY2FsZTogMC42LFxuXG4gICAgICAvLyBjb21tb24gdG8gYm90aCBwcm9iZXNcbiAgICAgIHByb2JlU2l6ZTogbmV3IERpbWVuc2lvbjIoIDIwLCA2OCApLFxuICAgICAgcHJvYmVMaW5lV2lkdGg6IDAuNSxcbiAgICAgIHByb2JlRHJhZ1lSYW5nZTogbnVsbCxcbiAgICAgIHByb2JlQ3Vyc29yOiAncG9pbnRlcicsXG5cbiAgICAgIC8vIHBvc2l0aXZlIHByb2JlXG4gICAgICBwb3NpdGl2ZVByb2JlRmlsbDogJ3JlZCcsXG4gICAgICBwb3NpdGl2ZVByb2JlU3Ryb2tlOiAnYmxhY2snLFxuICAgICAgcG9zaXRpdmVMYWJlbEZpbGw6ICd3aGl0ZScsXG5cbiAgICAgIC8vIG5lZ2F0aXZlIHByb2JlXG4gICAgICBuZWdhdGl2ZVByb2JlRmlsbDogJ2JsYWNrJyxcbiAgICAgIG5lZ2F0aXZlUHJvYmVTdHJva2U6ICdibGFjaycsXG4gICAgICBuZWdhdGl2ZUxhYmVsRmlsbDogJ3doaXRlJyxcblxuICAgICAgLy8gd2lyZXNcbiAgICAgIHdpcmVTdHJva2U6ICdibGFjaycsXG4gICAgICB3aXJlTGluZVdpZHRoOiAxLjUsXG4gICAgICBidWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aDogNDAsXG5cbiAgICAgIC8vIHNob3J0LWNpcmN1aXQgaW5kaWNhdG9yXG4gICAgICBzaG9ydENpcmN1aXRGb250OiBERUZBVUxUX1NIT1JUX0NJUkNVSVRfRk9OVCxcbiAgICAgIHNob3J0Q2lyY3VpdEZpbGw6ICdibGFjaycsXG5cbiAgICAgIC8vIE5vZGVPcHRpb25zXG4gICAgICBpc0Rpc3Bvc2FibGU6IGZhbHNlLFxuICAgICAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIGJ1bGIsIG9yaWdpbiBhdCBib3R0b20gY2VudGVyIG9mIGJhc2VcbiAgICBjb25zdCBsaWdodEJ1bGJOb2RlID0gbmV3IExpZ2h0QnVsYk5vZGUoIGJyaWdodG5lc3NQcm9wZXJ0eSwge1xuICAgICAgYnVsYkltYWdlU2NhbGU6IG9wdGlvbnMuYnVsYkltYWdlU2NhbGVcbiAgICB9ICk7XG5cbiAgICAvLyBzaG9ydC1jaXJjdWl0IGluZGljYXRvciwgY2VudGVyZWQgYWJvdmUgdGhlIGxpZ2h0IGJ1bGJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBicmlnaHRuZXNzUHJvcGVydHkudmFsdWUgPT09IDAsICdsYXlvdXQgd2lsbCBiZSBpbmNvcnJlY3QgaWYgbGlnaHRCdWxiTm9kZSBoYXMgcmF5cycgKTtcbiAgICBjb25zdCBzaG9ydENpcmN1aXROb2RlID0gbmV3IFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy5zaG9ydENpcmN1aXRTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogb3B0aW9ucy5zaG9ydENpcmN1aXRGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy5zaG9ydENpcmN1aXRGaWxsLFxuICAgICAgdmlzaWJsZTogZmFsc2UgLy8gaW5pdGlhbCBzdGF0ZSBpcyBubyBzaG9ydCBjaXJjdWl0XG4gICAgfSApO1xuICAgIHNob3J0Q2lyY3VpdE5vZGUuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcbiAgICAgIHNob3J0Q2lyY3VpdE5vZGUuY2VudGVyWCA9IGxpZ2h0QnVsYk5vZGUuY2VudGVyWDtcbiAgICAgIHNob3J0Q2lyY3VpdE5vZGUuYm90dG9tID0gbGlnaHRCdWxiTm9kZS50b3A7XG4gICAgfSApO1xuXG4gICAgLy8gYmF0dGVyeVxuICAgIGNvbnN0IGJhdHRlcnkgPSBuZXcgSW1hZ2UoIGJhdHRlcnlEQ2VsbF9wbmcsIHtcbiAgICAgIHNjYWxlOiBvcHRpb25zLmJhdHRlcnlEQ2VsbF9wbmdTY2FsZSxcbiAgICAgIGxlZnQ6IG9wdGlvbnMuYnVsYlRvQmF0dGVyeVdpcmVMZW5ndGgsXG4gICAgICBjZW50ZXJZOiAwXG4gICAgfSApO1xuXG4gICAgLy8gd2lyZSBmcm9tIGJ1bGIgYmFzZSB0byBiYXR0ZXJ5XG4gICAgY29uc3QgYnVsYkJhdHRlcnlXaXJlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggMCwgMCApLmxpbmVUbyggb3B0aW9ucy5idWxiVG9CYXR0ZXJ5V2lyZUxlbmd0aCwgMCApLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMud2lyZVN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy53aXJlTGluZVdpZHRoXG4gICAgfSApO1xuXG4gICAgLy8gYXBwYXJhdHVzIChidWxiICsgYmF0dGVyeSksIG9yaWdpbiBhdCBib3R0b20gY2VudGVyIG9mIGJ1bGIncyBiYXNlXG4gICAgY29uc3QgYXBwYXJhdHVzTm9kZSA9IG5ldyBOb2RlKCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBidWxiQmF0dGVyeVdpcmUsXG4gICAgICAgIGJhdHRlcnksXG4gICAgICAgIGxpZ2h0QnVsYk5vZGUsXG4gICAgICAgIHNob3J0Q2lyY3VpdE5vZGVcbiAgICAgIF1cbiAgICB9ICk7XG4gICAgaWYgKCBTSE9XX1RFU1RFUl9PUklHSU4gKSB7XG4gICAgICBhcHBhcmF0dXNOb2RlLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCAyLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xuICAgIH1cblxuICAgIC8vIHdpcmUgZnJvbSBiYXR0ZXJ5IHRlcm1pbmFsIHRvIHBvc2l0aXZlIHByb2JlXG4gICAgY29uc3QgcG9zaXRpdmVXaXJlID0gbmV3IFdpcmVOb2RlKFxuICAgICAgYmF0dGVyeS5nZXRHbG9iYWxCb3VuZHMoKS5yaWdodCxcbiAgICAgIGJhdHRlcnkuZ2V0R2xvYmFsQm91bmRzKCkuY2VudGVyWSxcbiAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueCApIC0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKSxcbiAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueSApIC0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBwb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKSAtIG9wdGlvbnMucHJvYmVTaXplLmhlaWdodCxcbiAgICAgIHsgc3Ryb2tlOiBvcHRpb25zLndpcmVTdHJva2UsIGxpbmVXaWR0aDogb3B0aW9ucy53aXJlTGluZVdpZHRoIH1cbiAgICApO1xuXG4gICAgLy8gd2lyZSBmcm9tIGJhc2Ugb2YgYnVsYiAob3JpZ2luKSB0byBuZWdhdGl2ZSBwcm9iZVxuICAgIGNvbnN0IG5lZ2F0aXZlV2lyZSA9IG5ldyBXaXJlTm9kZShcbiAgICAgIC01LCAtNSwgLy8gc3BlY2lmaWMgdG8gYnVsYiBpbWFnZSBmaWxlXG4gICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKSAtIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICksXG4gICAgICBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKSAtIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICkgLSBvcHRpb25zLnByb2JlU2l6ZS5oZWlnaHQsXG4gICAgICB7IHN0cm9rZTogb3B0aW9ucy53aXJlU3Ryb2tlLCBsaW5lV2lkdGg6IG9wdGlvbnMud2lyZUxpbmVXaWR0aCB9XG4gICAgKTtcblxuICAgIC8vIHByb2Jlc1xuICAgIGNvbnN0IHBvc2l0aXZlUHJvYmUgPSBuZXcgUHJvYmVOb2RlKCBuZXcgUGx1c05vZGUoIHsgZmlsbDogb3B0aW9ucy5wb3NpdGl2ZUxhYmVsRmlsbCB9ICksIHtcbiAgICAgIHNpemU6IG9wdGlvbnMucHJvYmVTaXplLFxuICAgICAgZmlsbDogb3B0aW9ucy5wb3NpdGl2ZVByb2JlRmlsbCxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5wb3NpdGl2ZVByb2JlU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLnByb2JlTGluZVdpZHRoXG4gICAgfSApO1xuICAgIGNvbnN0IG5lZ2F0aXZlUHJvYmUgPSBuZXcgUHJvYmVOb2RlKCBuZXcgTWludXNOb2RlKCB7IGZpbGw6IG9wdGlvbnMubmVnYXRpdmVMYWJlbEZpbGwgfSApLCB7XG4gICAgICBzaXplOiBvcHRpb25zLnByb2JlU2l6ZSxcbiAgICAgIGZpbGw6IG9wdGlvbnMubmVnYXRpdmVQcm9iZUZpbGwsXG4gICAgICBzdHJva2U6IG9wdGlvbnMubmVnYXRpdmVQcm9iZVN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5wcm9iZUxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIC8vIGRyYWcgbGlzdGVuZXIgZm9yIHByb2Jlc1xuICAgIGxldCBjbGlja1lPZmZzZXQgPSAwO1xuICAgIGNvbnN0IHByb2JlRHJhZ0xpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xuXG4gICAgICBzdGFydDogZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0ID0gZXZlbnQuY3VycmVudFRhcmdldCE7XG4gICAgICAgIGNsaWNrWU9mZnNldCA9IGN1cnJlbnRUYXJnZXQuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLnkgLSBjdXJyZW50VGFyZ2V0Lnk7XG4gICAgICB9LFxuXG4gICAgICAvLyBwcm9iZXMgbW92ZSB0b2dldGhlclxuICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XG5cbiAgICAgICAgLy8gZG8gZHJhZ2dpbmcgaW4gdmlldyBjb29yZGluYXRlIGZyYW1lXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uVmlldyA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcbiAgICAgICAgbGV0IHlWaWV3ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldC5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueSArIHBvc2l0aW9uVmlldy55IC0gY2xpY2tZT2Zmc2V0O1xuICAgICAgICBpZiAoIG9wdGlvbnMucHJvYmVEcmFnWVJhbmdlICkge1xuICAgICAgICAgIHlWaWV3ID0gVXRpbHMuY2xhbXAoIHlWaWV3LCBwb3NpdGlvblZpZXcueSArIG9wdGlvbnMucHJvYmVEcmFnWVJhbmdlLm1pbiwgcG9zaXRpb25WaWV3LnkgKyBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZS5tYXggKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gbW9kZWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgICAgICBjb25zdCB5TW9kZWwgPSBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFkoIHlWaWV3ICk7XG4gICAgICAgIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIHlNb2RlbCApO1xuICAgICAgICBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54LCB5TW9kZWwgKTtcbiAgICAgIH0sXG5cbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVEcmFnTGlzdGVuZXInIClcbiAgICB9ICk7XG5cbiAgICAvLyBLZXlib2FyZCBkcmFnIGxpc3RlbmVyIGZvciBwcm9iZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYWNpZC1iYXNlLXNvbHV0aW9ucy9pc3N1ZXMvMjA4XG4gICAgY29uc3QgcHJvYmVLZXlib2FyZERyYWdMaXN0ZW5lciA9IG5ldyBLZXlib2FyZERyYWdMaXN0ZW5lciggY29tYmluZU9wdGlvbnM8S2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zPigge1xuICAgICAgdHJhbnNmb3JtOiBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybSxcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuXG4gICAgICAgIC8vIHByb2JlcyBtb3ZlIHRvZ2V0aGVyXG4gICAgICAgIGNvbnN0IHkgPSBwb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XG5cbiAgICAgICAgY29uc3QgeVBvc2l0aXZlUHJvYmUgPSBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgbGlzdGVuZXIubW9kZWxEZWx0YS55O1xuICAgICAgICBjb25zdCB5UG9zaXRpdmVQcm9iZUNvbnN0cmFpbmVkID0gb3B0aW9ucy5wcm9iZURyYWdZUmFuZ2UgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMuY2xhbXAoIHlQb3NpdGl2ZVByb2JlLCB5ICsgb3B0aW9ucy5wcm9iZURyYWdZUmFuZ2UubWluLCB5ICsgb3B0aW9ucy5wcm9iZURyYWdZUmFuZ2UubWF4ICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeVBvc2l0aXZlUHJvYmU7XG4gICAgICAgIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIHlQb3NpdGl2ZVByb2JlQ29uc3RyYWluZWQgKTtcblxuICAgICAgICBjb25zdCB5TmVnYXRpdmVQcm9iZSA9IG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyBsaXN0ZW5lci5tb2RlbERlbHRhLnk7XG4gICAgICAgIGNvbnN0IHlOZWdhdGl2ZVByb2JlQ29uc3RyYWluZWQgPSBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy5jbGFtcCggeU5lZ2F0aXZlUHJvYmUsIHkgKyBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZS5taW4sIHkgKyBvcHRpb25zLnByb2JlRHJhZ1lSYW5nZS5tYXggKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5TmVnYXRpdmVQcm9iZTtcbiAgICAgICAgbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueCwgeU5lZ2F0aXZlUHJvYmVDb25zdHJhaW5lZCApO1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvYmVLZXlib2FyZERyYWdMaXN0ZW5lcicgKVxuICAgIH0sIG9wdGlvbnMua2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zICkgKTtcblxuICAgIHBvc2l0aXZlUHJvYmUuY3Vyc29yID0gb3B0aW9ucy5wcm9iZUN1cnNvcjtcbiAgICBwb3NpdGl2ZVByb2JlLmFkZElucHV0TGlzdGVuZXIoIHByb2JlRHJhZ0xpc3RlbmVyICk7XG4gICAgcG9zaXRpdmVQcm9iZS5hZGRJbnB1dExpc3RlbmVyKCBwcm9iZUtleWJvYXJkRHJhZ0xpc3RlbmVyICk7XG5cbiAgICBuZWdhdGl2ZVByb2JlLmN1cnNvciA9IG9wdGlvbnMucHJvYmVDdXJzb3I7XG4gICAgbmVnYXRpdmVQcm9iZS5hZGRJbnB1dExpc3RlbmVyKCBwcm9iZURyYWdMaXN0ZW5lciApO1xuICAgIG5lZ2F0aXZlUHJvYmUuYWRkSW5wdXRMaXN0ZW5lciggcHJvYmVLZXlib2FyZERyYWdMaXN0ZW5lciApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgbmVnYXRpdmVXaXJlLCBwb3NpdGl2ZVdpcmUsIG5lZ2F0aXZlUHJvYmUsIHBvc2l0aXZlUHJvYmUsIGFwcGFyYXR1c05vZGUgXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyB3aGVuIHRoZSBwb3NpdGlvbiBjaGFuZ2VzIC4uLlxuICAgIHBvc2l0aW9uUHJvcGVydHkubGluayggKCBwb3NpdGlvbiwgb2xkUG9zaXRpb24gKSA9PiB7XG5cbiAgICAgIC8vIG1vdmUgdGhlIGVudGlyZSB0ZXN0ZXJcbiAgICAgIHRoaXMudHJhbnNsYXRpb24gPSBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xuXG4gICAgICAvLyBwcm9iZXMgbW92ZSB3aXRoIHRoZSB0ZXN0ZXJcbiAgICAgIGlmICggb2xkUG9zaXRpb24gKSB7XG4gICAgICAgIGNvbnN0IGR4ID0gcG9zaXRpb24ueCAtIG9sZFBvc2l0aW9uLng7XG4gICAgICAgIGNvbnN0IGR5ID0gcG9zaXRpb24ueSAtIG9sZFBvc2l0aW9uLnk7XG4gICAgICAgIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIHBvc2l0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnggKyBkeCxcbiAgICAgICAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICsgZHkgKTtcbiAgICAgICAgbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggbmVnYXRpdmVQcm9iZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueCArIGR4LFxuICAgICAgICAgIG5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgKyBkeSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIHVwZGF0ZSBwb3NpdGl2ZSB3aXJlIGlmIGVuZCBwb2ludCB3YXMgY2hhbmdlZFxuICAgIGNvbnN0IHBvc2l0aXZlUHJvYmVPYnNlcnZlciA9ICggcG9zaXRpdmVQcm9iZVBvc2l0aW9uOiBWZWN0b3IyICkgPT4ge1xuICAgICAgcG9zaXRpdmVQcm9iZS5jZW50ZXJYID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBwb3NpdGl2ZVByb2JlUG9zaXRpb24ueCApIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XG4gICAgICBwb3NpdGl2ZVByb2JlLmJvdHRvbSA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpdmVQcm9iZVBvc2l0aW9uLnkgKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XG4gICAgICBwb3NpdGl2ZVdpcmUuc2V0RW5kUG9pbnQoIHBvc2l0aXZlUHJvYmUueCwgcG9zaXRpdmVQcm9iZS55IC0gb3B0aW9ucy5wcm9iZVNpemUuaGVpZ2h0ICk7XG4gICAgfTtcbiAgICBwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGl2ZVByb2JlT2JzZXJ2ZXIgKTtcblxuICAgIC8vIHVwZGF0ZSBuZWdhdGl2ZSB3aXJlIGlmIGVuZCBwb2ludCB3YXMgY2hhbmdlZFxuICAgIGNvbnN0IG5lZ2F0aXZlUHJvYmVPYnNlcnZlciA9ICggbmVnYXRpdmVQcm9iZVBvc2l0aW9uOiBWZWN0b3IyICkgPT4ge1xuICAgICAgbmVnYXRpdmVQcm9iZS5jZW50ZXJYID0gb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBuZWdhdGl2ZVByb2JlUG9zaXRpb24ueCApIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XG4gICAgICBuZWdhdGl2ZVByb2JlLmJvdHRvbSA9IG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbmVnYXRpdmVQcm9iZVBvc2l0aW9uLnkgKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XG4gICAgICBuZWdhdGl2ZVdpcmUuc2V0RW5kUG9pbnQoIG5lZ2F0aXZlUHJvYmUueCwgbmVnYXRpdmVQcm9iZS55IC0gb3B0aW9ucy5wcm9iZVNpemUuaGVpZ2h0ICk7XG4gICAgfTtcbiAgICBuZWdhdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBuZWdhdGl2ZVByb2JlT2JzZXJ2ZXIgKTtcblxuICAgIHRoaXMuc2hvcnRDaXJjdWl0Tm9kZSA9IHNob3J0Q2lyY3VpdE5vZGU7XG5cbiAgICAvLyBUbyBwcmV2ZW50IGxpZ2h0IGZyb20gdXBkYXRpbmcgd2hlbiBpbnZpc2libGVcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICAgIGxpZ2h0QnVsYk5vZGUudmlzaWJsZSA9IHZpc2libGU7XG4gICAgfSApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdDb25kdWN0aXZpdHlUZXN0ZXJOb2RlJywgdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIElzICdTaG9ydCBjaXJjdWl0JyBzaG93biBhYm92ZSB0aGUgbGlnaHQgYnVsYj9cbiAgICovXG4gIHB1YmxpYyBnZXQgc2hvcnRDaXJjdWl0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5zaG9ydENpcmN1aXROb2RlLnZpc2libGU7IH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyICdTaG9ydCBjaXJjdWl0JyBpcyBzaG93biBhYm92ZSB0aGUgbGlnaHQgYnVsYi4gTm90ZSB0aGF0IGl0IGlzIHRoZSBjbGllbnQncyByZXNwb25zaWJpbGl0eVxuICAgKiB0byBlbnN1cmUgdGhhdCB0aGUgYnVsYidzIGJyaWdodG5lc3MgKGFzIHNldCBieSBicmlnaHRuZXNzUHJvcGVydHkpIGlzIGFwcHJvcHJpYXRlIGZvciBhIHNob3J0IGNpcmN1aXQuXG4gICAqL1xuICBwdWJsaWMgc2V0IHNob3J0Q2lyY3VpdCggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2hvcnRDaXJjdWl0Tm9kZS52aXNpYmxlID0gdmFsdWU7IH1cbn1cblxudHlwZSBQcm9iZU5vZGVTZWxmT3B0aW9ucyA9IHtcbiAgc2l6ZT86IERpbWVuc2lvbjI7XG4gIGZpbGw/OiBUQ29sb3I7XG4gIHN0cm9rZT86IFRDb2xvcjtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xufTtcblxudHlwZSBQcm9iZU5vZGVPcHRpb25zID0gUHJvYmVOb2RlU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuLyoqXG4gKiBDb25kdWN0aXZpdHkgcHJvYmUsIG9yaWdpbiBhdCBib3R0b20gY2VudGVyLlxuICovXG5jbGFzcyBQcm9iZU5vZGUgZXh0ZW5kcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggTm9kZSApIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhYmVsTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogUHJvYmVOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UHJvYmVOb2RlT3B0aW9ucywgUHJvYmVOb2RlU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG4gICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggMjAsIDYwICksXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgbGluZVdpZHRoOiAxLjUsXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgIGZvY3VzYWJsZTogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIHBsYXRlXG4gICAgY29uc3QgcGxhdGVOb2RlID0gbmV3IFJlY3RhbmdsZSggLW9wdGlvbnMuc2l6ZS53aWR0aCAvIDIsIC1vcHRpb25zLnNpemUuaGVpZ2h0LCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuZmlsbCxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoXG4gICAgfSApO1xuXG4gICAgLy8gc2NhbGUgdGhlIGxhYmVsIHRvIGZpdCwgcGxhY2UgaXQgdG93YXJkcyBib3R0b20gY2VudGVyXG4gICAgbGFiZWxOb2RlLnNldFNjYWxlTWFnbml0dWRlKCAwLjUgKiBvcHRpb25zLnNpemUud2lkdGggLyBsYWJlbE5vZGUud2lkdGggKTtcbiAgICBsYWJlbE5vZGUuY2VudGVyWCA9IHBsYXRlTm9kZS5jZW50ZXJYO1xuICAgIGxhYmVsTm9kZS5ib3R0b20gPSBwbGF0ZU5vZGUuYm90dG9tIC0gMTA7XG5cbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcbiAgICB0aGlzLmFkZENoaWxkKCBwbGF0ZU5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBsYWJlbE5vZGUgKTtcbiAgICBpZiAoIFNIT1dfUFJPQkVfT1JJR0lOICkge1xuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggMiwgeyBmaWxsOiAncmVkJyB9ICkgKTtcbiAgICB9XG5cbiAgICAvLyBleHBhbmQgdG91Y2ggYXJlYVxuICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIDEwLCAxMCApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG50eXBlIFdpcmVQb2ludCA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcblxuLyoqXG4gKiBXaXJlcyB0aGF0IGNvbm5lY3QgdG8gdGhlIHByb2Jlcy5cbiAqL1xuY2xhc3MgV2lyZU5vZGUgZXh0ZW5kcyBQYXRoIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IHN0YXJ0UG9pbnQ6IFdpcmVQb2ludDtcbiAgcHJpdmF0ZSByZWFkb25seSBjb250cm9sUG9pbnRPZmZzZXQ6IFdpcmVQb2ludDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN0YXJ0WDogbnVtYmVyLCBzdGFydFk6IG51bWJlciwgZW5kWDogbnVtYmVyLCBlbmRZOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IFBhdGhPcHRpb25zICkge1xuXG4gICAgc3VwZXIoIG51bGwgKTtcblxuICAgIHRoaXMuc3RhcnRQb2ludCA9IHsgeDogc3RhcnRYLCB5OiBzdGFydFkgfTtcblxuICAgIC8vIGNvbnRyb2wgcG9pbnQgb2Zmc2V0cyBmb3Igd2hlbiBwcm9iZSBpcyB0byBsZWZ0IG9mIGxpZ2h0IGJ1bGJcbiAgICB0aGlzLmNvbnRyb2xQb2ludE9mZnNldCA9IHsgeDogMzAsIHk6IC01MCB9O1xuICAgIGlmICggZW5kWCA8IHN0YXJ0WCApIHtcbiAgICAgIC8vIHByb2JlIGlzIHRvIHJpZ2h0IG9mIGxpZ2h0IGJ1bGIsIGZsaXAgc2lnbiBvbiBjb250cm9sIHBvaW50IHgtb2Zmc2V0XG4gICAgICB0aGlzLmNvbnRyb2xQb2ludE9mZnNldC54ID0gLXRoaXMuY29udHJvbFBvaW50T2Zmc2V0Lng7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRFbmRQb2ludCggZW5kWCwgZW5kWSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG5cbiAgLy8gU2V0cyB0aGUgZW5kIHBvaW50IGNvb3JkaW5hdGVzLCB0aGUgcG9pbnQgYXR0YWNoZWQgdG8gdGhlIHByb2JlLlxuICBwdWJsaWMgc2V0RW5kUG9pbnQoIGVuZFg6IG51bWJlciwgZW5kWTogbnVtYmVyICk6IHZvaWQge1xuXG4gICAgY29uc3Qgc3RhcnRYID0gdGhpcy5zdGFydFBvaW50Lng7XG4gICAgY29uc3Qgc3RhcnRZID0gdGhpcy5zdGFydFBvaW50Lnk7XG4gICAgY29uc3QgY29udHJvbFBvaW50WE9mZnNldCA9IHRoaXMuY29udHJvbFBvaW50T2Zmc2V0Lng7XG4gICAgY29uc3QgY29udHJvbFBvaW50WU9mZnNldCA9IHRoaXMuY29udHJvbFBvaW50T2Zmc2V0Lnk7XG5cbiAgICB0aGlzLnNldFNoYXBlKCBuZXcgU2hhcGUoKVxuICAgICAgLm1vdmVUbyggc3RhcnRYLCBzdGFydFkgKVxuICAgICAgLmN1YmljQ3VydmVUbyggc3RhcnRYICsgY29udHJvbFBvaW50WE9mZnNldCwgc3RhcnRZLCBlbmRYLCBlbmRZICsgY29udHJvbFBvaW50WU9mZnNldCwgZW5kWCwgZW5kWSApXG4gICAgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0NvbmR1Y3Rpdml0eVRlc3Rlck5vZGUnLCBDb25kdWN0aXZpdHlUZXN0ZXJOb2RlICk7Il0sIm5hbWVzIjpbIkRpbWVuc2lvbjIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJDaXJjbGUiLCJEcmFnTGlzdGVuZXIiLCJJbWFnZSIsIkludGVyYWN0aXZlSGlnaGxpZ2h0aW5nIiwiS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJiYXR0ZXJ5RENlbGxfcG5nIiwiTGlnaHRCdWxiTm9kZSIsIk1pbnVzTm9kZSIsIlBoZXRGb250IiwiUGx1c05vZGUiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIlNIT1dfVEVTVEVSX09SSUdJTiIsIlNIT1dfUFJPQkVfT1JJR0lOIiwiREVGQVVMVF9TSE9SVF9DSVJDVUlUX0ZPTlQiLCJDb25kdWN0aXZpdHlUZXN0ZXJOb2RlIiwic2hvcnRDaXJjdWl0Iiwic2hvcnRDaXJjdWl0Tm9kZSIsInZpc2libGUiLCJ2YWx1ZSIsImJyaWdodG5lc3NQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGl2ZVByb2JlUG9zaXRpb25Qcm9wZXJ0eSIsIm5lZ2F0aXZlUHJvYmVQb3NpdGlvblByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZUlkZW50aXR5IiwiYnVsYkltYWdlU2NhbGUiLCJiYXR0ZXJ5RENlbGxfcG5nU2NhbGUiLCJwcm9iZVNpemUiLCJwcm9iZUxpbmVXaWR0aCIsInByb2JlRHJhZ1lSYW5nZSIsInByb2JlQ3Vyc29yIiwicG9zaXRpdmVQcm9iZUZpbGwiLCJwb3NpdGl2ZVByb2JlU3Ryb2tlIiwicG9zaXRpdmVMYWJlbEZpbGwiLCJuZWdhdGl2ZVByb2JlRmlsbCIsIm5lZ2F0aXZlUHJvYmVTdHJva2UiLCJuZWdhdGl2ZUxhYmVsRmlsbCIsIndpcmVTdHJva2UiLCJ3aXJlTGluZVdpZHRoIiwiYnVsYlRvQmF0dGVyeVdpcmVMZW5ndGgiLCJzaG9ydENpcmN1aXRGb250Iiwic2hvcnRDaXJjdWl0RmlsbCIsImlzRGlzcG9zYWJsZSIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwibGlnaHRCdWxiTm9kZSIsImFzc2VydCIsInNob3J0Q2lyY3VpdFN0cmluZ1Byb3BlcnR5IiwiZm9udCIsImZpbGwiLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJjZW50ZXJYIiwiYm90dG9tIiwidG9wIiwiYmF0dGVyeSIsInNjYWxlIiwibGVmdCIsImNlbnRlclkiLCJidWxiQmF0dGVyeVdpcmUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhcHBhcmF0dXNOb2RlIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsInBvc2l0aXZlV2lyZSIsIldpcmVOb2RlIiwiZ2V0R2xvYmFsQm91bmRzIiwicmlnaHQiLCJtb2RlbFRvVmlld1giLCJ4IiwibW9kZWxUb1ZpZXdZIiwieSIsImhlaWdodCIsIm5lZ2F0aXZlV2lyZSIsInBvc2l0aXZlUHJvYmUiLCJQcm9iZU5vZGUiLCJzaXplIiwibmVnYXRpdmVQcm9iZSIsImNsaWNrWU9mZnNldCIsInByb2JlRHJhZ0xpc3RlbmVyIiwic3RhcnQiLCJldmVudCIsImN1cnJlbnRUYXJnZXQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwiZHJhZyIsImxpc3RlbmVyIiwicG9zaXRpb25WaWV3IiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInlWaWV3IiwiY2xhbXAiLCJtaW4iLCJtYXgiLCJ5TW9kZWwiLCJ2aWV3VG9Nb2RlbFkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwcm9iZUtleWJvYXJkRHJhZ0xpc3RlbmVyIiwidHJhbnNmb3JtIiwieVBvc2l0aXZlUHJvYmUiLCJtb2RlbERlbHRhIiwieVBvc2l0aXZlUHJvYmVDb25zdHJhaW5lZCIsInlOZWdhdGl2ZVByb2JlIiwieU5lZ2F0aXZlUHJvYmVDb25zdHJhaW5lZCIsImtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyIsImN1cnNvciIsImFkZElucHV0TGlzdGVuZXIiLCJwb3NpdGlvbiIsIm9sZFBvc2l0aW9uIiwidHJhbnNsYXRpb24iLCJkeCIsImR5IiwicG9zaXRpdmVQcm9iZU9ic2VydmVyIiwicG9zaXRpdmVQcm9iZVBvc2l0aW9uIiwic2V0RW5kUG9pbnQiLCJuZWdhdGl2ZVByb2JlT2JzZXJ2ZXIiLCJuZWdhdGl2ZVByb2JlUG9zaXRpb24iLCJ2aXNpYmxlUHJvcGVydHkiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImxhYmVsTm9kZSIsInRhZ05hbWUiLCJmb2N1c2FibGUiLCJwbGF0ZU5vZGUiLCJ3aWR0aCIsInNldFNjYWxlTWFnbml0dWRlIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWFkiLCJtdXRhdGUiLCJlbmRYIiwiZW5kWSIsInN0YXJ0WCIsInN0YXJ0UG9pbnQiLCJzdGFydFkiLCJjb250cm9sUG9pbnRYT2Zmc2V0IiwiY29udHJvbFBvaW50T2Zmc2V0IiwiY29udHJvbFBvaW50WU9mZnNldCIsInNldFNoYXBlIiwiY3ViaWNDdXJ2ZVRvIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FJRCxPQUFPQSxnQkFBZ0IsNkJBQTZCO0FBRXBELE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRzVFLE9BQU9DLHlCQUF5QixrREFBa0Q7QUFDbEYsU0FBU0MsTUFBTSxFQUFFQyxZQUFZLEVBQVFDLEtBQUssRUFBRUMsdUJBQXVCLEVBQUVDLG9CQUFvQixFQUErQkMsSUFBSSxFQUFlQyxJQUFJLEVBQWVDLFNBQVMsRUFBVUMsSUFBSSxRQUFRLDhCQUE4QjtBQUMzTixPQUFPQyxzQkFBc0IsZ0NBQWdDO0FBQzdELE9BQU9DLG1CQUFtQixxQkFBcUI7QUFDL0MsT0FBT0MsZUFBZSxpQkFBaUI7QUFDdkMsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyx3QkFBd0IsMEJBQTBCO0FBRXpELFlBQVk7QUFDWixNQUFNQyxxQkFBcUIsT0FBTywyREFBMkQ7QUFDN0YsTUFBTUMsb0JBQW9CLE9BQU8sNERBQTREO0FBQzdG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