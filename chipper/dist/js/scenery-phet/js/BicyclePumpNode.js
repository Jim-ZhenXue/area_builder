// Copyright 2019-2024, University of Colorado Boulder
/**
 * This is a graphical representation of a bicycle pump. A user can move the handle up and down.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Saurabh Totey
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Circle, InteractiveHighlighting, LinearGradient, Node, PaintColorProperty, Path, Rectangle, SceneryConstants } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sceneryPhet from './sceneryPhet.js';
import SegmentedBarGraphNode from './SegmentedBarGraphNode.js';
import SoundDragListener from './SoundDragListener.js';
import SoundKeyboardDragListener from './SoundKeyboardDragListener.js';
// The follow constants define the size and positions of the various components of the pump as proportions of the
// overall width and height of the node.
const PUMP_BASE_WIDTH_PROPORTION = 0.35;
const PUMP_BASE_HEIGHT_PROPORTION = 0.075;
const PUMP_BODY_HEIGHT_PROPORTION = 0.7;
const PUMP_BODY_WIDTH_PROPORTION = 0.07;
const PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
const PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
const PUMP_HANDLE_HEIGHT_PROPORTION = 0.05;
const CONE_HEIGHT_PROPORTION = 0.09;
const HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
const HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
const SHAFT_OPENING_TILT_FACTOR = 0.33;
const BODY_TO_HOSE_ATTACH_POINT_X = 13;
const BODY_TO_HOSE_ATTACH_POINT_Y = -26;
let BicyclePumpNode = class BicyclePumpNode extends Node {
    /**
   * Sets handle and shaft to their initial position.
   */ setPumpHandleToInitialPosition() {
        this.pumpHandleNode.bottom = this.pumpBodyNode.top - 18; // empirically determined
        this.pumpShaftNode.top = this.pumpHandleNode.bottom;
    }
    reset() {
        this.setPumpHandleToInitialPosition();
        this.dragDelegate.reset();
    }
    dispose() {
        this.disposeBicyclePumpNode();
        super.dispose();
    }
    /**
   * @param numberProperty - number of particles in the simulation
   * @param rangeProperty - allowed range
   * @param [providedOptions]
   */ constructor(numberProperty, rangeProperty, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            width: 200,
            height: 250,
            handleFill: '#adafb1',
            shaftFill: '#cacaca',
            bodyFill: '#d50000',
            bodyTopFill: '#997677',
            indicatorBackgroundFill: '#443333',
            indicatorRemainingFill: '#999999',
            hoseFill: '#b3b3b3',
            baseFill: '#aaaaaa',
            hoseCurviness: 1,
            hoseAttachmentOffset: new Vector2(100, 100),
            nodeEnabledProperty: null,
            injectionEnabledProperty: new BooleanProperty(true),
            handleTouchAreaXDilation: 15,
            handleTouchAreaYDilation: 15,
            handleMouseAreaXDilation: 0,
            handleMouseAreaYDilation: 0,
            handleCursor: 'ns-resize',
            numberOfParticlesPerPumpAction: 10,
            addParticlesOneAtATime: true,
            // NodeOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'PumpNode',
            phetioInputEnabledPropertyInstrumented: true
        }, providedOptions);
        const width = options.width;
        const height = options.height;
        super(options);
        // does this instance own nodeEnabledProperty?
        const ownsEnabledProperty = !options.nodeEnabledProperty;
        this.nodeEnabledProperty = options.nodeEnabledProperty || new BooleanProperty(true);
        this.hoseAttachmentOffset = options.hoseAttachmentOffset;
        // create the base of the pump
        const baseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
        const baseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;
        const baseFillColorProperty = new PaintColorProperty(options.baseFill);
        const pumpBaseNode = createPumpBaseNode(baseWidth, baseHeight, baseFillColorProperty);
        // sizing for the body of the pump
        const pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
        const pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
        // create the cone
        const coneHeight = height * CONE_HEIGHT_PROPORTION;
        const coneNode = createConeNode(pumpBodyWidth, coneHeight, baseFillColorProperty);
        coneNode.bottom = pumpBaseNode.top + 8;
        // use PaintColorProperty so that colors can be updated dynamically
        const bodyFillColorProperty = new PaintColorProperty(options.bodyFill);
        const bodyFillBrighterColorProperty = new PaintColorProperty(bodyFillColorProperty, {
            luminanceFactor: 0.2
        });
        const bodyFillDarkerColorProperty = new PaintColorProperty(bodyFillColorProperty, {
            luminanceFactor: -0.2
        });
        this.pumpBodyNode = new Rectangle(0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
            fill: new LinearGradient(0, 0, pumpBodyWidth, 0).addColorStop(0, bodyFillBrighterColorProperty).addColorStop(0.4, bodyFillColorProperty).addColorStop(0.7, bodyFillDarkerColorProperty)
        });
        this.pumpBodyNode.centerX = coneNode.centerX;
        this.pumpBodyNode.bottom = coneNode.top + 18;
        // use PaintColorProperty so that colors can be updated dynamically
        const bodyTopFillColorProperty = new PaintColorProperty(options.bodyTopFill);
        const bodyTopStrokeColorProperty = new PaintColorProperty(bodyTopFillColorProperty, {
            luminanceFactor: -0.3
        });
        // create the back part of the top of the body
        const bodyTopBackNode = createBodyTopHalfNode(pumpBodyWidth, -1, bodyTopFillColorProperty, bodyTopStrokeColorProperty);
        bodyTopBackNode.centerX = this.pumpBodyNode.centerX;
        bodyTopBackNode.bottom = this.pumpBodyNode.top;
        // create the front part of the top of the body
        const bodyTopFrontNode = createBodyTopHalfNode(pumpBodyWidth, 1, bodyTopFillColorProperty, bodyTopStrokeColorProperty);
        bodyTopFrontNode.centerX = this.pumpBodyNode.centerX;
        bodyTopFrontNode.top = bodyTopBackNode.bottom - 0.4; // tweak slightly to prevent pump body from showing through
        // create the bottom cap on the body
        const bodyBottomCapNode = new Path(new Shape().ellipse(0, 0, bodyTopFrontNode.width * 0.55, 3, 0), {
            fill: new PaintColorProperty(baseFillColorProperty, {
                luminanceFactor: -0.3
            }),
            centerX: bodyTopFrontNode.centerX,
            bottom: coneNode.top + 4
        });
        // create the node that will be used to indicate the remaining capacity
        const remainingCapacityIndicator = new SegmentedBarGraphNode(numberProperty, rangeProperty, {
            width: pumpBodyWidth * 0.6,
            height: pumpBodyHeight * 0.7,
            centerX: this.pumpBodyNode.centerX,
            centerY: (this.pumpBodyNode.top + coneNode.top) / 2,
            numSegments: 36,
            backgroundColor: options.indicatorBackgroundFill,
            fullyLitIndicatorColor: options.indicatorRemainingFill,
            indicatorHeightProportion: 0.7
        });
        // whether the hose should be attached to the left or right side of the pump cone
        const hoseAttachedOnRight = options.hoseAttachmentOffset.x > 0;
        const hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
        const hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
        // create the hose
        const hoseNode = new Path(new Shape().moveTo(hoseAttachedOnRight ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X, BODY_TO_HOSE_ATTACH_POINT_Y).cubicCurveTo(options.hoseCurviness * (options.hoseAttachmentOffset.x - BODY_TO_HOSE_ATTACH_POINT_X), BODY_TO_HOSE_ATTACH_POINT_Y, 0, options.hoseAttachmentOffset.y, options.hoseAttachmentOffset.x - (hoseAttachedOnRight ? hoseConnectorWidth : -hoseConnectorWidth), options.hoseAttachmentOffset.y), {
            lineWidth: 4,
            stroke: options.hoseFill
        });
        // create the external hose connector, which connects the hose to an external point
        const externalHoseConnector = createHoseConnectorNode(hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty);
        externalHoseConnector.setTranslation(hoseAttachedOnRight ? options.hoseAttachmentOffset.x - externalHoseConnector.width : options.hoseAttachmentOffset.x, options.hoseAttachmentOffset.y - externalHoseConnector.height / 2);
        // create the local hose connector, which connects the hose to the cone
        const localHoseConnector = createHoseConnectorNode(hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty);
        const localHoseOffsetX = hoseAttachedOnRight ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X;
        localHoseConnector.setTranslation(localHoseOffsetX - hoseConnectorWidth / 2, BODY_TO_HOSE_ATTACH_POINT_Y - localHoseConnector.height / 2);
        // sizing for the pump shaft
        const pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
        const pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;
        // use PaintColorProperty so that colors can be updated dynamically
        const shaftFillColorProperty = new PaintColorProperty(options.shaftFill);
        const shaftStrokeColorProperty = new PaintColorProperty(shaftFillColorProperty, {
            luminanceFactor: -0.38
        });
        // create the pump shaft, which is the part below the handle and inside the body
        this.pumpShaftNode = new Rectangle(0, 0, pumpShaftWidth, pumpShaftHeight, {
            fill: shaftFillColorProperty,
            stroke: shaftStrokeColorProperty,
            pickable: false
        });
        this.pumpShaftNode.x = -pumpShaftWidth / 2;
        // create the handle of the pump
        this.pumpHandleNode = new PumpHandleNode(options.handleFill);
        const pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
        this.pumpHandleNode.touchArea = this.pumpHandleNode.localBounds.dilatedXY(options.handleTouchAreaXDilation, options.handleTouchAreaYDilation);
        this.pumpHandleNode.mouseArea = this.pumpHandleNode.localBounds.dilatedXY(options.handleMouseAreaXDilation, options.handleMouseAreaYDilation);
        this.pumpHandleNode.scale(pumpHandleHeight / this.pumpHandleNode.height);
        this.setPumpHandleToInitialPosition();
        // enable/disable behavior and appearance for the handle
        const enabledListener = (enabled)=>{
            this.pumpHandleNode.interruptSubtreeInput();
            this.pumpHandleNode.pickable = enabled;
            this.pumpHandleNode.cursor = enabled ? options.handleCursor : 'default';
            this.pumpHandleNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
            this.pumpShaftNode.opacity = enabled ? 1 : SceneryConstants.DISABLED_OPACITY;
        };
        this.nodeEnabledProperty.link(enabledListener);
        // define the allowed range for the pump handle's movement
        const maxHandleYOffset = this.pumpHandleNode.centerY;
        const minHandleYOffset = maxHandleYOffset + -PUMP_SHAFT_HEIGHT_PROPORTION * pumpBodyHeight;
        this.dragDelegate = new DragDelegate(numberProperty, rangeProperty, this.nodeEnabledProperty, options.injectionEnabledProperty, minHandleYOffset, maxHandleYOffset, this.pumpHandleNode, this.pumpShaftNode, {
            numberOfParticlesPerPumpAction: options.numberOfParticlesPerPumpAction,
            addParticlesOneAtATime: options.addParticlesOneAtATime
        });
        // Drag the pump handle using mouse/touch.
        this.dragListener = new SoundDragListener(combineOptions({
            drag: (event)=>{
                // Update the handle position based on the user's pointer position.
                const dragPositionY = this.pumpHandleNode.globalToParentPoint(event.pointer.point).y;
                const handlePosition = Utils.clamp(dragPositionY, minHandleYOffset, maxHandleYOffset);
                this.dragDelegate.handleDrag(handlePosition);
            },
            tandem: options.tandem.createTandem('dragListener')
        }, options.dragListenerOptions));
        this.pumpHandleNode.addInputListener(this.dragListener);
        // Drag the pump handle using the keyboard.
        this.keyboardDragListener = new SoundKeyboardDragListener(combineOptions({
            keyboardDragDirection: 'upDown',
            dragSpeed: 200,
            shiftDragSpeed: 50,
            drag: (event, listener)=>{
                const handlePosition = Utils.clamp(this.pumpHandleNode.centerY + listener.modelDelta.y, minHandleYOffset, maxHandleYOffset);
                this.dragDelegate.handleDrag(handlePosition);
            },
            tandem: options.tandem.createTandem('keyboardDragListener')
        }, options.keyboardDragListenerOptions));
        this.pumpHandleNode.addInputListener(this.keyboardDragListener);
        // add the pieces with the correct layering
        this.addChild(pumpBaseNode);
        this.addChild(bodyTopBackNode);
        this.addChild(bodyBottomCapNode);
        this.addChild(this.pumpShaftNode);
        this.addChild(this.pumpHandleNode);
        this.addChild(this.pumpBodyNode);
        this.addChild(remainingCapacityIndicator);
        this.addChild(bodyTopFrontNode);
        this.addChild(coneNode);
        this.addChild(hoseNode);
        this.addChild(externalHoseConnector);
        this.addChild(localHoseConnector);
        // With ?dev query parameter, place a red dot at the origin.
        if (phet.chipper.queryParameters.dev) {
            this.addChild(new Circle(2, {
                fill: 'red'
            }));
        }
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'BicyclePumpNode', this);
        this.disposeBicyclePumpNode = ()=>{
            // Drag listeners are registered with PhET-iO, so they need to be disposed.
            this.dragListener.dispose();
            this.keyboardDragListener.dispose();
            // Clean up nodeEnabledProperty appropriately, depending on whether we created it, or it was provided to us.
            if (ownsEnabledProperty) {
                this.nodeEnabledProperty.dispose();
            } else if (this.nodeEnabledProperty.hasListener(enabledListener)) {
                this.nodeEnabledProperty.unlink(enabledListener);
            }
        };
    }
};
export { BicyclePumpNode as default };
/**
 * Draws the base of the pump. Many of the multipliers and point positions were arrived at empirically.
 *
 * @param width - the width of the base
 * @param height - the height of the base
 * @param fill
 */ function createPumpBaseNode(width, height, fill) {
    // 3D effect is being used, so most of the height makes up the surface
    const topOfBaseHeight = height * 0.7;
    const halfOfBaseWidth = width / 2;
    // use PaintColorProperty so that colors can be updated dynamically
    const baseFillBrighterColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: 0.05
    });
    const baseFillDarkerColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.2
    });
    const baseFillDarkestColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.4
    });
    // rounded rectangle that is the top of the base
    const topOfBaseNode = new Rectangle(-halfOfBaseWidth, -topOfBaseHeight / 2, width, topOfBaseHeight, 20, 20, {
        fill: new LinearGradient(-halfOfBaseWidth, 0, halfOfBaseWidth, 0).addColorStop(0, baseFillBrighterColorProperty).addColorStop(0.5, fill).addColorStop(1, baseFillDarkerColorProperty)
    });
    const pumpBaseEdgeHeight = height * 0.65;
    const pumpBaseSideEdgeYControlPoint = pumpBaseEdgeHeight * 1.05;
    const pumpBaseBottomEdgeXCurveStart = width * 0.35;
    // the front edge of the pump base, draw counter-clockwise starting at left edge
    const pumpEdgeShape = new Shape().lineTo(-halfOfBaseWidth, 0).lineTo(-halfOfBaseWidth, pumpBaseEdgeHeight / 2).quadraticCurveTo(-halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, -pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight).lineTo(pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight).quadraticCurveTo(halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, halfOfBaseWidth, pumpBaseEdgeHeight / 2).lineTo(halfOfBaseWidth, 0).close();
    // color the front edge of the pump base
    const pumpEdgeNode = new Path(pumpEdgeShape, {
        fill: new LinearGradient(-halfOfBaseWidth, 0, halfOfBaseWidth, 0).addColorStop(0, baseFillDarkestColorProperty).addColorStop(0.15, baseFillDarkerColorProperty).addColorStop(1, baseFillDarkestColorProperty)
    });
    pumpEdgeNode.centerY = -pumpEdgeNode.height / 2;
    // 0.6 determined empirically for best positioning
    topOfBaseNode.bottom = pumpEdgeNode.bottom - pumpBaseEdgeHeight / 2 + 0.6;
    return new Node({
        children: [
            pumpEdgeNode,
            topOfBaseNode
        ]
    });
}
/**
 * Creates half of the opening at the top of the pump body. Passing in -1 for the sign creates the back half, and
 * passing in 1 creates the front.
 */ function createBodyTopHalfNode(width, sign, fill, stroke) {
    const bodyTopShape = new Shape().moveTo(0, 0).cubicCurveTo(0, sign * width * SHAFT_OPENING_TILT_FACTOR, width, sign * width * SHAFT_OPENING_TILT_FACTOR, width, 0);
    return new Path(bodyTopShape, {
        fill: fill,
        stroke: stroke
    });
}
/**
 * Creates a hose connector. The hose has one on each of its ends.
 */ function createHoseConnectorNode(width, height, fill) {
    // use PaintColorProperty so that colors can be updated dynamically
    const fillBrighterColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: 0.1
    });
    const fillDarkerColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.2
    });
    const fillDarkestColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.4
    });
    return new Rectangle(0, 0, width, height, 2, 2, {
        fill: new LinearGradient(0, 0, 0, height).addColorStop(0, fillDarkerColorProperty).addColorStop(0.3, fill).addColorStop(0.35, fillBrighterColorProperty).addColorStop(0.4, fillBrighterColorProperty).addColorStop(1, fillDarkestColorProperty)
    });
}
/**
 * Creates the cone, which connects the pump base to the pump body.
 * @param pumpBodyWidth - the width of the pump body (not quite as wide as the top of the cone)
 * @param height
 * @param fill
 */ function createConeNode(pumpBodyWidth, height, fill) {
    const coneTopWidth = pumpBodyWidth * 1.2;
    const coneTopRadiusY = 3;
    const coneTopRadiusX = coneTopWidth / 2;
    const coneBottomWidth = pumpBodyWidth * 2;
    const coneBottomRadiusY = 4;
    const coneBottomRadiusX = coneBottomWidth / 2;
    const coneShape = new Shape()// start in upper right corner of shape, draw top ellipse right to left
    .ellipticalArc(0, 0, coneTopRadiusX, coneTopRadiusY, 0, 0, Math.PI, false).lineTo(-coneBottomRadiusX, height) // line to bottom left corner of shape
    // draw bottom ellipse left to right
    .ellipticalArc(0, height, coneBottomRadiusX, coneBottomRadiusY, 0, Math.PI, 0, true).lineTo(coneTopRadiusX, 0); // line to upper right corner of shape
    // use PaintColorProperty so that colors can be updated dynamically
    const fillBrighterColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: 0.1
    });
    const fillDarkerColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.4
    });
    const fillDarkestColorProperty = new PaintColorProperty(fill, {
        luminanceFactor: -0.5
    });
    const coneGradient = new LinearGradient(-coneBottomWidth / 2, 0, coneBottomWidth / 2, 0).addColorStop(0, fillDarkerColorProperty).addColorStop(0.3, fill).addColorStop(0.35, fillBrighterColorProperty).addColorStop(0.45, fillBrighterColorProperty).addColorStop(0.5, fill).addColorStop(1, fillDarkestColorProperty);
    return new Path(coneShape, {
        fill: coneGradient
    });
}
/**
 * PumpHandleNode is the pump's handle.
 */ let PumpHandleNode = class PumpHandleNode extends InteractiveHighlighting(Path) {
    constructor(fill){
        // empirically determined constants
        const centerSectionWidth = 35;
        const centerCurveWidth = 14;
        const centerCurveHeight = 8;
        const numberOfGripBumps = 4;
        const gripSingleBumpWidth = 16;
        const gripSingleBumpHalfWidth = gripSingleBumpWidth / 2;
        const gripInterBumpWidth = gripSingleBumpWidth * 0.31;
        const gripEndHeight = 23;
        // start the handle from the center bottom, drawing around counterclockwise
        const pumpHandleShape = new Shape().moveTo(0, 0);
        /**
     * Add a "bump" to the top or bottom of the grip
     * @param shape - the shape to append to
     * @param sign - +1 for bottom side of grip, -1 for top side of grip
     */ const addGripBump = (shape, sign)=>{
            // control points for quadratic curve shape on grip
            const controlPointX = gripSingleBumpWidth / 2;
            const controlPointY = gripSingleBumpWidth / 2;
            // this is a grip bump
            shape.quadraticCurveToRelative(sign * controlPointX, sign * controlPointY, sign * gripSingleBumpWidth, 0);
        };
        // this is the lower right part of the handle, including half of the middle section and the grip bumps
        pumpHandleShape.lineToRelative(centerSectionWidth / 2, 0);
        pumpHandleShape.quadraticCurveToRelative(centerCurveWidth / 2, 0, centerCurveWidth, -centerCurveHeight);
        pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
        for(let i = 0; i < numberOfGripBumps - 1; i++){
            addGripBump(pumpHandleShape, 1);
            pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
        }
        addGripBump(pumpHandleShape, 1);
        // this is the right edge of the handle
        pumpHandleShape.lineToRelative(0, -gripEndHeight);
        // this is the upper right part of the handle, including only the grip bumps
        for(let i = 0; i < numberOfGripBumps; i++){
            addGripBump(pumpHandleShape, -1);
            pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);
        }
        // this is the upper middle section of the handle
        pumpHandleShape.quadraticCurveToRelative(-centerCurveWidth / 2, -centerCurveHeight, -centerCurveWidth, -centerCurveHeight);
        pumpHandleShape.lineToRelative(-centerSectionWidth, 0);
        pumpHandleShape.quadraticCurveToRelative(-centerCurveWidth / 2, 0, -centerCurveWidth, centerCurveHeight);
        pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);
        // this is the upper left part of the handle, including only the grip bumps
        for(let i = 0; i < numberOfGripBumps - 1; i++){
            addGripBump(pumpHandleShape, -1);
            pumpHandleShape.lineToRelative(-gripInterBumpWidth, 0);
        }
        addGripBump(pumpHandleShape, -1);
        // this is the left edge of the handle
        pumpHandleShape.lineToRelative(0, gripEndHeight);
        // this is the lower left part of the handle, including the grip bumps and half of the middle section
        for(let i = 0; i < numberOfGripBumps; i++){
            addGripBump(pumpHandleShape, 1);
            pumpHandleShape.lineToRelative(gripInterBumpWidth, 0);
        }
        pumpHandleShape.quadraticCurveToRelative(centerCurveWidth / 2, centerCurveHeight, centerCurveWidth, centerCurveHeight);
        pumpHandleShape.lineToRelative(centerSectionWidth / 2, 0);
        pumpHandleShape.close();
        // used to track where the current position is on the handle when drawing its gradient
        let handleGradientPosition = 0;
        /**
     * Adds a color stop to the given gradient at
     * @param gradient - the gradient being appended to
     * @param deltaDistance - the distance of this added color stop
     * @param totalDistance - the total width of the gradient
     * @param color - the color of this color stop
     */ const addRelativeColorStop = (gradient, deltaDistance, totalDistance, color)=>{
            const newPosition = handleGradientPosition + deltaDistance;
            let ratio = newPosition / totalDistance;
            ratio = ratio > 1 ? 1 : ratio;
            gradient.addColorStop(ratio, color);
            handleGradientPosition = newPosition;
        };
        // set up the gradient for the handle
        const pumpHandleWidth = pumpHandleShape.bounds.width;
        const pumpHandleGradient = new LinearGradient(-pumpHandleWidth / 2, 0, pumpHandleWidth / 2, 0);
        // use PaintColorProperty so that colors can be updated dynamically
        const handleFillColorProperty = new PaintColorProperty(fill);
        const handleFillDarkerColorProperty = new PaintColorProperty(handleFillColorProperty, {
            luminanceFactor: -0.35
        });
        // fill the left side handle gradient
        for(let i = 0; i < numberOfGripBumps; i++){
            addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty);
            addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty);
        }
        // fill the center section handle gradient
        addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
        addRelativeColorStop(pumpHandleGradient, centerCurveWidth + centerSectionWidth, pumpHandleWidth, handleFillColorProperty);
        addRelativeColorStop(pumpHandleGradient, centerCurveWidth, pumpHandleWidth, handleFillDarkerColorProperty);
        // fill the right side handle gradient
        for(let i = 0; i < numberOfGripBumps; i++){
            addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty);
            addRelativeColorStop(pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty);
            addRelativeColorStop(pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty);
        }
        super(pumpHandleShape, {
            lineWidth: 2,
            stroke: 'black',
            fill: pumpHandleGradient,
            tagName: 'div',
            focusable: true
        });
    }
};
let DragDelegate = class DragDelegate {
    reset() {
        this.pumpingDistanceAccumulation = 0;
        this.lastHandlePosition = null;
    }
    /**
   * Handles a drag of the pump handle. SoundDragListener and SoundKeyboardDragListener instances in
   * BicyclePumpNode should call this method from their options.drag function.
   */ handleDrag(newHandlePosition) {
        this.pumpHandleNode.centerY = newHandlePosition;
        this.pumpShaftNode.top = this.pumpHandleNode.bottom;
        let numberOfBatchParticles = 0; // number of particles to add all at once
        if (this.lastHandlePosition !== null) {
            const travelDistance = newHandlePosition - this.lastHandlePosition;
            if (travelDistance > 0) {
                // This motion is in the downward direction, so add its distance to the pumping distance.
                this.pumpingDistanceAccumulation += travelDistance;
                while(this.pumpingDistanceAccumulation >= this.pumpingDistanceRequiredToAddParticle){
                    // add a particle
                    if (this.nodeEnabledProperty.value && this.injectionEnabledProperty.value && this.numberProperty.value + numberOfBatchParticles < this.rangeProperty.value.max) {
                        if (this.addParticlesOneAtATime) {
                            this.numberProperty.value++;
                        } else {
                            numberOfBatchParticles++;
                        }
                    }
                    this.pumpingDistanceAccumulation -= this.pumpingDistanceRequiredToAddParticle;
                }
            } else {
                this.pumpingDistanceAccumulation = 0;
            }
        }
        // Add particles in one batch.
        if (!this.addParticlesOneAtATime) {
            this.numberProperty.value += numberOfBatchParticles;
        } else {
            assert && assert(numberOfBatchParticles === 0, 'unexpected batched particles');
        }
        this.lastHandlePosition = newHandlePosition;
    }
    constructor(numberProperty, rangeProperty, nodeEnabledProperty, injectionEnabledProperty, minHandleYOffset, maxHandleYOffset, pumpHandleNode, pumpShaftNode, providedOptions){
        assert && assert(maxHandleYOffset > minHandleYOffset, 'bogus offsets');
        const options = providedOptions;
        this.numberProperty = numberProperty;
        this.rangeProperty = rangeProperty;
        this.nodeEnabledProperty = nodeEnabledProperty;
        this.injectionEnabledProperty = injectionEnabledProperty;
        this.pumpHandleNode = pumpHandleNode;
        this.pumpShaftNode = pumpShaftNode;
        this.addParticlesOneAtATime = options.addParticlesOneAtATime;
        this.pumpingDistanceAccumulation = 0;
        this.lastHandlePosition = null;
        // How far the pump shaft needs to travel before the pump releases a particle.
        // The subtracted constant was empirically determined to ensure that numberOfParticlesPerPumpAction is correct.
        this.pumpingDistanceRequiredToAddParticle = (maxHandleYOffset - minHandleYOffset) / options.numberOfParticlesPerPumpAction - 0.01;
    }
};
sceneryPhet.register('BicyclePumpNode', BicyclePumpNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CaWN5Y2xlUHVtcE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhpcyBpcyBhIGdyYXBoaWNhbCByZXByZXNlbnRhdGlvbiBvZiBhIGJpY3ljbGUgcHVtcC4gQSB1c2VyIGNhbiBtb3ZlIHRoZSBoYW5kbGUgdXAgYW5kIGRvd24uXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50Q29sb3JQcm9wZXJ0eSwgUGF0aCwgUHJlc3NMaXN0ZW5lckV2ZW50LCBSZWN0YW5nbGUsIFNjZW5lcnlDb25zdGFudHMsIFRDb2xvciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNlZ21lbnRlZEJhckdyYXBoTm9kZSBmcm9tICcuL1NlZ21lbnRlZEJhckdyYXBoTm9kZS5qcyc7XG5pbXBvcnQgU291bmREcmFnTGlzdGVuZXIsIHsgU291bmREcmFnTGlzdGVuZXJPcHRpb25zIH0gZnJvbSAnLi9Tb3VuZERyYWdMaXN0ZW5lci5qcyc7XG5pbXBvcnQgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lciwgeyBTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyB9IGZyb20gJy4vU291bmRLZXlib2FyZERyYWdMaXN0ZW5lci5qcyc7XG5cbi8vIFRoZSBmb2xsb3cgY29uc3RhbnRzIGRlZmluZSB0aGUgc2l6ZSBhbmQgcG9zaXRpb25zIG9mIHRoZSB2YXJpb3VzIGNvbXBvbmVudHMgb2YgdGhlIHB1bXAgYXMgcHJvcG9ydGlvbnMgb2YgdGhlXG4vLyBvdmVyYWxsIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIG5vZGUuXG5jb25zdCBQVU1QX0JBU0VfV0lEVEhfUFJPUE9SVElPTiA9IDAuMzU7XG5jb25zdCBQVU1QX0JBU0VfSEVJR0hUX1BST1BPUlRJT04gPSAwLjA3NTtcbmNvbnN0IFBVTVBfQk9EWV9IRUlHSFRfUFJPUE9SVElPTiA9IDAuNztcbmNvbnN0IFBVTVBfQk9EWV9XSURUSF9QUk9QT1JUSU9OID0gMC4wNztcbmNvbnN0IFBVTVBfU0hBRlRfV0lEVEhfUFJPUE9SVElPTiA9IFBVTVBfQk9EWV9XSURUSF9QUk9QT1JUSU9OICogMC4yNTtcbmNvbnN0IFBVTVBfU0hBRlRfSEVJR0hUX1BST1BPUlRJT04gPSBQVU1QX0JPRFlfSEVJR0hUX1BST1BPUlRJT047XG5jb25zdCBQVU1QX0hBTkRMRV9IRUlHSFRfUFJPUE9SVElPTiA9IDAuMDU7XG5jb25zdCBDT05FX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4wOTtcbmNvbnN0IEhPU0VfQ09OTkVDVE9SX0hFSUdIVF9QUk9QT1JUSU9OID0gMC4wNDtcbmNvbnN0IEhPU0VfQ09OTkVDVE9SX1dJRFRIX1BST1BPUlRJT04gPSAwLjA1O1xuY29uc3QgU0hBRlRfT1BFTklOR19USUxUX0ZBQ1RPUiA9IDAuMzM7XG5jb25zdCBCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1ggPSAxMztcbmNvbnN0IEJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWSA9IC0yNjtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICB3aWR0aD86IG51bWJlcjtcbiAgaGVpZ2h0PzogbnVtYmVyO1xuXG4gIC8vIHZhcmlvdXMgY29sb3JzIHVzZWQgYnkgdGhlIHB1bXBcbiAgaGFuZGxlRmlsbD86IFRDb2xvcjtcbiAgc2hhZnRGaWxsPzogVENvbG9yO1xuICBib2R5RmlsbD86IFRDb2xvcjtcbiAgYm9keVRvcEZpbGw/OiBUQ29sb3I7XG4gIGluZGljYXRvckJhY2tncm91bmRGaWxsPzogVENvbG9yO1xuICBpbmRpY2F0b3JSZW1haW5pbmdGaWxsPzogVENvbG9yO1xuICBob3NlRmlsbD86IFRDb2xvcjtcbiAgYmFzZUZpbGw/OiBUQ29sb3I7IC8vIHRoaXMgY29sb3IgaXMgYWxzbyB1c2VkIGZvciB0aGUgY29uZSBzaGFwZSBhbmQgaG9zZSBjb25uZWN0b3JzXG5cbiAgLy8gZ3JlYXRlciB2YWx1ZSA9IGN1cnZ5IGhvc2UsIHNtYWxsZXIgdmFsdWUgPSBzdHJhaWdodGVyIGhvc2VcbiAgaG9zZUN1cnZpbmVzcz86IG51bWJlcjtcblxuICAvLyB3aGVyZSB0aGUgaG9zZSB3aWxsIGF0dGFjaCBleHRlcm5hbGx5IHJlbGF0aXZlIHRvIHRoZSBvcmlnaW4gb2YgdGhlIHB1bXBcbiAgaG9zZUF0dGFjaG1lbnRPZmZzZXQ/OiBWZWN0b3IyO1xuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0aGUgcHVtcCB3aWxsIGludGVyYWN0aXZlLiBJZiB0aGUgcHVtcCdzIHJhbmdlIGNoYW5nZXMsIHRoZSBwdW1wc1xuICAvLyBpbmRpY2F0b3Igd2lsbCB1cGRhdGUgcmVnYXJkbGVzcyBvZiBlbmFibGVkUHJvcGVydHkuIElmIG51bGwsIHRoaXMgUHJvcGVydHkgd2lsbCBiZSBjcmVhdGVkLlxuICBub2RlRW5hYmxlZFByb3BlcnR5PzogVFByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbDtcblxuICAvLyB7Qm9vbGVhblByb3BlcnR5fSAtIGRldGVybWluZXMgd2hldGhlciB0aGUgcHVtcCBpcyBhYmxlIHRvIGluamVjdCBwYXJ0aWNsZXMgd2hlbiB0aGUgcHVtcCBpcyBzdGlsbCBpbnRlcmFjdGl2ZS5cbiAgLy8gVGhpcyBpcyBuZWVkZWQgZm9yIHdoZW4gYSB1c2VyIGlzIHB1bXBpbmcgaW4gcGFydGljbGVzIHRvbyBxdWlja2x5IGZvciBhIG1vZGVsIHRvIGhhbmRsZSAoc28gdGhlIGluamVjdGlvblxuICAvLyBuZWVkcyB0aHJvdHRsaW5nKSwgYnV0IHRoZSBwdW1wIHNob3VsZCBub3QgYmVjb21lIG5vbi1pbnRlcmFjdGl2ZSBhcyBhIHJlc3VsdCxcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdGF0ZXMtb2YtbWF0dGVyL2lzc3Vlcy8yNzZcbiAgaW5qZWN0aW9uRW5hYmxlZFByb3BlcnR5PzogVFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIHBvaW50ZXIgYXJlYXNcbiAgaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICBoYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIGhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIC8vIE9wdGlvbnMgcGFzc2VkIHRvIHRoZSBkcmFnIGxpc3RlbmVycy5cbiAgZHJhZ0xpc3RlbmVyT3B0aW9ucz86IFN0cmljdE9taXQ8U291bmREcmFnTGlzdGVuZXJPcHRpb25zLCAnZHJhZycgfCAndGFuZGVtJz47XG4gIGtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz86IFN0cmljdE9taXQ8U291bmRLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMsICdkcmFnJyB8ICdrZXlib2FyZERyYWdEaXJlY3Rpb24nIHwgJ3RhbmRlbSc+O1xuXG4gIC8vIGN1cnNvciBmb3IgdGhlIHB1bXAgaGFuZGxlIHdoZW4gaXQncyBlbmFibGVkXG4gIGhhbmRsZUN1cnNvcj86ICducy1yZXNpemUnO1xuXG4gIC8vIE51bWJlciBvZiBwYXJ0aWNsZXMgcmVsZWFzZWQgYnkgdGhlIHB1bXAgZHVyaW5nIG9uZSBwdW1waW5nIGFjdGlvbi5cbiAgbnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uPzogbnVtYmVyO1xuXG4gIC8vIElmIGZhbHNlLCBwYXJ0aWNsZXMgYXJlIGFkZGVkIGFzIGEgYmF0Y2ggYXQgdGhlIGVuZCBvZiBlYWNoIHB1bXBpbmcgbW90aW9uLlxuICBhZGRQYXJ0aWNsZXNPbmVBdEFUaW1lPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEJpY3ljbGVQdW1wTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCaWN5Y2xlUHVtcE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICBwdWJsaWMgcmVhZG9ubHkgbm9kZUVuYWJsZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgcmVhZG9ubHkgaG9zZUF0dGFjaG1lbnRPZmZzZXQ6IFZlY3RvcjI7XG5cbiAgLy8gcGFydHMgb2YgdGhlIHB1bXAgbmVlZGVkIGJ5IHNldFB1bXBIYW5kbGVUb0luaXRpYWxQb3NpdGlvblxuICBwcml2YXRlIHJlYWRvbmx5IHB1bXBCb2R5Tm9kZTogTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSBwdW1wU2hhZnROb2RlOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IHB1bXBIYW5kbGVOb2RlOiBOb2RlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZHJhZ0xpc3RlbmVyOiBTb3VuZERyYWdMaXN0ZW5lcjtcbiAgcHJpdmF0ZSByZWFkb25seSBrZXlib2FyZERyYWdMaXN0ZW5lcjogU291bmRLZXlib2FyZERyYWdMaXN0ZW5lcjtcblxuICAvLyBkcmFnTGlzdGVuZXIgYW5kIGtleWJvYXJkRHJhZ0xpc3RlbmVyIGRlbGVnYXRlIGhhbmRsaW5nIG9mIHRoZSBkcmFnIHRvIGRyYWdEZWxlZ2F0ZS5cbiAgcHJpdmF0ZSByZWFkb25seSBkcmFnRGVsZWdhdGU6IERyYWdEZWxlZ2F0ZTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VCaWN5Y2xlUHVtcE5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBudW1iZXJQcm9wZXJ0eSAtIG51bWJlciBvZiBwYXJ0aWNsZXMgaW4gdGhlIHNpbXVsYXRpb25cbiAgICogQHBhcmFtIHJhbmdlUHJvcGVydHkgLSBhbGxvd2VkIHJhbmdlXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBudW1iZXJQcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj4sXG4gICAgICAgICAgICAgICAgICAgICAgcmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+LFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IEJpY3ljbGVQdW1wTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJpY3ljbGVQdW1wTm9kZU9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdkcmFnTGlzdGVuZXJPcHRpb25zJyB8ICdrZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMnPiwgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDI1MCxcbiAgICAgIGhhbmRsZUZpbGw6ICcjYWRhZmIxJyxcbiAgICAgIHNoYWZ0RmlsbDogJyNjYWNhY2EnLFxuICAgICAgYm9keUZpbGw6ICcjZDUwMDAwJyxcbiAgICAgIGJvZHlUb3BGaWxsOiAnIzk5NzY3NycsXG4gICAgICBpbmRpY2F0b3JCYWNrZ3JvdW5kRmlsbDogJyM0NDMzMzMnLFxuICAgICAgaW5kaWNhdG9yUmVtYWluaW5nRmlsbDogJyM5OTk5OTknLFxuICAgICAgaG9zZUZpbGw6ICcjYjNiM2IzJyxcbiAgICAgIGJhc2VGaWxsOiAnI2FhYWFhYScsXG4gICAgICBob3NlQ3VydmluZXNzOiAxLFxuICAgICAgaG9zZUF0dGFjaG1lbnRPZmZzZXQ6IG5ldyBWZWN0b3IyKCAxMDAsIDEwMCApLFxuICAgICAgbm9kZUVuYWJsZWRQcm9wZXJ0eTogbnVsbCxcbiAgICAgIGluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLFxuICAgICAgaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uOiAxNSxcbiAgICAgIGhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbjogMTUsXG4gICAgICBoYW5kbGVNb3VzZUFyZWFYRGlsYXRpb246IDAsXG4gICAgICBoYW5kbGVNb3VzZUFyZWFZRGlsYXRpb246IDAsXG4gICAgICBoYW5kbGVDdXJzb3I6ICducy1yZXNpemUnLFxuICAgICAgbnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uOiAxMCxcbiAgICAgIGFkZFBhcnRpY2xlc09uZUF0QVRpbWU6IHRydWUsXG5cbiAgICAgIC8vIE5vZGVPcHRpb25zXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdQdW1wTm9kZScsXG4gICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIGRvZXMgdGhpcyBpbnN0YW5jZSBvd24gbm9kZUVuYWJsZWRQcm9wZXJ0eT9cbiAgICBjb25zdCBvd25zRW5hYmxlZFByb3BlcnR5ID0gIW9wdGlvbnMubm9kZUVuYWJsZWRQcm9wZXJ0eTtcblxuICAgIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eSA9IG9wdGlvbnMubm9kZUVuYWJsZWRQcm9wZXJ0eSB8fCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG5cbiAgICB0aGlzLmhvc2VBdHRhY2htZW50T2Zmc2V0ID0gb3B0aW9ucy5ob3NlQXR0YWNobWVudE9mZnNldDtcblxuICAgIC8vIGNyZWF0ZSB0aGUgYmFzZSBvZiB0aGUgcHVtcFxuICAgIGNvbnN0IGJhc2VXaWR0aCA9IHdpZHRoICogUFVNUF9CQVNFX1dJRFRIX1BST1BPUlRJT047XG4gICAgY29uc3QgYmFzZUhlaWdodCA9IGhlaWdodCAqIFBVTVBfQkFTRV9IRUlHSFRfUFJPUE9SVElPTjtcbiAgICBjb25zdCBiYXNlRmlsbENvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBvcHRpb25zLmJhc2VGaWxsICk7XG4gICAgY29uc3QgcHVtcEJhc2VOb2RlID0gY3JlYXRlUHVtcEJhc2VOb2RlKCBiYXNlV2lkdGgsIGJhc2VIZWlnaHQsIGJhc2VGaWxsQ29sb3JQcm9wZXJ0eSApO1xuXG4gICAgLy8gc2l6aW5nIGZvciB0aGUgYm9keSBvZiB0aGUgcHVtcFxuICAgIGNvbnN0IHB1bXBCb2R5V2lkdGggPSB3aWR0aCAqIFBVTVBfQk9EWV9XSURUSF9QUk9QT1JUSU9OO1xuICAgIGNvbnN0IHB1bXBCb2R5SGVpZ2h0ID0gaGVpZ2h0ICogUFVNUF9CT0RZX0hFSUdIVF9QUk9QT1JUSU9OO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBjb25lXG4gICAgY29uc3QgY29uZUhlaWdodCA9IGhlaWdodCAqIENPTkVfSEVJR0hUX1BST1BPUlRJT047XG4gICAgY29uc3QgY29uZU5vZGUgPSBjcmVhdGVDb25lTm9kZSggcHVtcEJvZHlXaWR0aCwgY29uZUhlaWdodCwgYmFzZUZpbGxDb2xvclByb3BlcnR5ICk7XG4gICAgY29uZU5vZGUuYm90dG9tID0gcHVtcEJhc2VOb2RlLnRvcCArIDg7XG5cbiAgICAvLyB1c2UgUGFpbnRDb2xvclByb3BlcnR5IHNvIHRoYXQgY29sb3JzIGNhbiBiZSB1cGRhdGVkIGR5bmFtaWNhbGx5XG4gICAgY29uc3QgYm9keUZpbGxDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3B0aW9ucy5ib2R5RmlsbCApO1xuICAgIGNvbnN0IGJvZHlGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggYm9keUZpbGxDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogMC4yIH0gKTtcbiAgICBjb25zdCBib2R5RmlsbERhcmtlckNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBib2R5RmlsbENvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC4yIH0gKTtcblxuICAgIHRoaXMucHVtcEJvZHlOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgcHVtcEJvZHlXaWR0aCwgcHVtcEJvZHlIZWlnaHQsIDAsIDAsIHtcbiAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgcHVtcEJvZHlXaWR0aCwgMCApXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJvZHlGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IClcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC40LCBib2R5RmlsbENvbG9yUHJvcGVydHkgKVxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjcsIGJvZHlGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApXG4gICAgfSApO1xuICAgIHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclggPSBjb25lTm9kZS5jZW50ZXJYO1xuICAgIHRoaXMucHVtcEJvZHlOb2RlLmJvdHRvbSA9IGNvbmVOb2RlLnRvcCArIDE4O1xuXG4gICAgLy8gdXNlIFBhaW50Q29sb3JQcm9wZXJ0eSBzbyB0aGF0IGNvbG9ycyBjYW4gYmUgdXBkYXRlZCBkeW5hbWljYWxseVxuICAgIGNvbnN0IGJvZHlUb3BGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuYm9keVRvcEZpbGwgKTtcbiAgICBjb25zdCBib2R5VG9wU3Ryb2tlQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGJvZHlUb3BGaWxsQ29sb3JQcm9wZXJ0eSwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjMgfSApO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBiYWNrIHBhcnQgb2YgdGhlIHRvcCBvZiB0aGUgYm9keVxuICAgIGNvbnN0IGJvZHlUb3BCYWNrTm9kZSA9IGNyZWF0ZUJvZHlUb3BIYWxmTm9kZSggcHVtcEJvZHlXaWR0aCwgLTEsIGJvZHlUb3BGaWxsQ29sb3JQcm9wZXJ0eSwgYm9keVRvcFN0cm9rZUNvbG9yUHJvcGVydHkgKTtcbiAgICBib2R5VG9wQmFja05vZGUuY2VudGVyWCA9IHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclg7XG4gICAgYm9keVRvcEJhY2tOb2RlLmJvdHRvbSA9IHRoaXMucHVtcEJvZHlOb2RlLnRvcDtcblxuICAgIC8vIGNyZWF0ZSB0aGUgZnJvbnQgcGFydCBvZiB0aGUgdG9wIG9mIHRoZSBib2R5XG4gICAgY29uc3QgYm9keVRvcEZyb250Tm9kZSA9IGNyZWF0ZUJvZHlUb3BIYWxmTm9kZSggcHVtcEJvZHlXaWR0aCwgMSwgYm9keVRvcEZpbGxDb2xvclByb3BlcnR5LCBib2R5VG9wU3Ryb2tlQ29sb3JQcm9wZXJ0eSApO1xuICAgIGJvZHlUb3BGcm9udE5vZGUuY2VudGVyWCA9IHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclg7XG4gICAgYm9keVRvcEZyb250Tm9kZS50b3AgPSBib2R5VG9wQmFja05vZGUuYm90dG9tIC0gMC40OyAvLyB0d2VhayBzbGlnaHRseSB0byBwcmV2ZW50IHB1bXAgYm9keSBmcm9tIHNob3dpbmcgdGhyb3VnaFxuXG4gICAgLy8gY3JlYXRlIHRoZSBib3R0b20gY2FwIG9uIHRoZSBib2R5XG4gICAgY29uc3QgYm9keUJvdHRvbUNhcE5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkuZWxsaXBzZSggMCwgMCwgYm9keVRvcEZyb250Tm9kZS53aWR0aCAqIDAuNTUsIDMsIDAgKSwge1xuICAgICAgZmlsbDogbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggYmFzZUZpbGxDb2xvclByb3BlcnR5LCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMyB9ICksXG4gICAgICBjZW50ZXJYOiBib2R5VG9wRnJvbnROb2RlLmNlbnRlclgsXG4gICAgICBib3R0b206IGNvbmVOb2RlLnRvcCArIDRcbiAgICB9ICk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIG5vZGUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaW5kaWNhdGUgdGhlIHJlbWFpbmluZyBjYXBhY2l0eVxuICAgIGNvbnN0IHJlbWFpbmluZ0NhcGFjaXR5SW5kaWNhdG9yID0gbmV3IFNlZ21lbnRlZEJhckdyYXBoTm9kZSggbnVtYmVyUHJvcGVydHksIHJhbmdlUHJvcGVydHksIHtcbiAgICAgICAgd2lkdGg6IHB1bXBCb2R5V2lkdGggKiAwLjYsXG4gICAgICAgIGhlaWdodDogcHVtcEJvZHlIZWlnaHQgKiAwLjcsXG4gICAgICAgIGNlbnRlclg6IHRoaXMucHVtcEJvZHlOb2RlLmNlbnRlclgsXG4gICAgICAgIGNlbnRlclk6ICggdGhpcy5wdW1wQm9keU5vZGUudG9wICsgY29uZU5vZGUudG9wICkgLyAyLFxuICAgICAgICBudW1TZWdtZW50czogMzYsXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogb3B0aW9ucy5pbmRpY2F0b3JCYWNrZ3JvdW5kRmlsbCxcbiAgICAgICAgZnVsbHlMaXRJbmRpY2F0b3JDb2xvcjogb3B0aW9ucy5pbmRpY2F0b3JSZW1haW5pbmdGaWxsLFxuICAgICAgICBpbmRpY2F0b3JIZWlnaHRQcm9wb3J0aW9uOiAwLjdcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gd2hldGhlciB0aGUgaG9zZSBzaG91bGQgYmUgYXR0YWNoZWQgdG8gdGhlIGxlZnQgb3IgcmlnaHQgc2lkZSBvZiB0aGUgcHVtcCBjb25lXG4gICAgY29uc3QgaG9zZUF0dGFjaGVkT25SaWdodCA9IG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQueCA+IDA7XG4gICAgY29uc3QgaG9zZUNvbm5lY3RvcldpZHRoID0gd2lkdGggKiBIT1NFX0NPTk5FQ1RPUl9XSURUSF9QUk9QT1JUSU9OO1xuICAgIGNvbnN0IGhvc2VDb25uZWN0b3JIZWlnaHQgPSBoZWlnaHQgKiBIT1NFX0NPTk5FQ1RPUl9IRUlHSFRfUFJPUE9SVElPTjtcblxuICAgIC8vIGNyZWF0ZSB0aGUgaG9zZVxuICAgIGNvbnN0IGhvc2VOb2RlID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXG4gICAgICAubW92ZVRvKCBob3NlQXR0YWNoZWRPblJpZ2h0ID8gQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9YIDogLUJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWCxcbiAgICAgICAgQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9ZIClcbiAgICAgIC5jdWJpY0N1cnZlVG8oIG9wdGlvbnMuaG9zZUN1cnZpbmVzcyAqICggb3B0aW9ucy5ob3NlQXR0YWNobWVudE9mZnNldC54IC0gQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9YICksXG4gICAgICAgIEJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWSxcbiAgICAgICAgMCwgb3B0aW9ucy5ob3NlQXR0YWNobWVudE9mZnNldC55LFxuICAgICAgICBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnggLSAoIGhvc2VBdHRhY2hlZE9uUmlnaHQgPyBob3NlQ29ubmVjdG9yV2lkdGggOiAtaG9zZUNvbm5lY3RvcldpZHRoICksXG4gICAgICAgIG9wdGlvbnMuaG9zZUF0dGFjaG1lbnRPZmZzZXQueSApLCB7XG4gICAgICBsaW5lV2lkdGg6IDQsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuaG9zZUZpbGxcbiAgICB9ICk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGV4dGVybmFsIGhvc2UgY29ubmVjdG9yLCB3aGljaCBjb25uZWN0cyB0aGUgaG9zZSB0byBhbiBleHRlcm5hbCBwb2ludFxuICAgIGNvbnN0IGV4dGVybmFsSG9zZUNvbm5lY3RvciA9IGNyZWF0ZUhvc2VDb25uZWN0b3JOb2RlKCBob3NlQ29ubmVjdG9yV2lkdGgsIGhvc2VDb25uZWN0b3JIZWlnaHQsIGJhc2VGaWxsQ29sb3JQcm9wZXJ0eSApO1xuICAgIGV4dGVybmFsSG9zZUNvbm5lY3Rvci5zZXRUcmFuc2xhdGlvbihcbiAgICAgIGhvc2VBdHRhY2hlZE9uUmlnaHQgPyBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnggLSBleHRlcm5hbEhvc2VDb25uZWN0b3Iud2lkdGggOiBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LngsXG4gICAgICBvcHRpb25zLmhvc2VBdHRhY2htZW50T2Zmc2V0LnkgLSBleHRlcm5hbEhvc2VDb25uZWN0b3IuaGVpZ2h0IC8gMlxuICAgICk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGxvY2FsIGhvc2UgY29ubmVjdG9yLCB3aGljaCBjb25uZWN0cyB0aGUgaG9zZSB0byB0aGUgY29uZVxuICAgIGNvbnN0IGxvY2FsSG9zZUNvbm5lY3RvciA9IGNyZWF0ZUhvc2VDb25uZWN0b3JOb2RlKCBob3NlQ29ubmVjdG9yV2lkdGgsIGhvc2VDb25uZWN0b3JIZWlnaHQsIGJhc2VGaWxsQ29sb3JQcm9wZXJ0eSApO1xuICAgIGNvbnN0IGxvY2FsSG9zZU9mZnNldFggPSBob3NlQXR0YWNoZWRPblJpZ2h0ID8gQk9EWV9UT19IT1NFX0FUVEFDSF9QT0lOVF9YIDogLUJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWDtcbiAgICBsb2NhbEhvc2VDb25uZWN0b3Iuc2V0VHJhbnNsYXRpb24oXG4gICAgICBsb2NhbEhvc2VPZmZzZXRYIC0gaG9zZUNvbm5lY3RvcldpZHRoIC8gMixcbiAgICAgIEJPRFlfVE9fSE9TRV9BVFRBQ0hfUE9JTlRfWSAtIGxvY2FsSG9zZUNvbm5lY3Rvci5oZWlnaHQgLyAyXG4gICAgKTtcblxuICAgIC8vIHNpemluZyBmb3IgdGhlIHB1bXAgc2hhZnRcbiAgICBjb25zdCBwdW1wU2hhZnRXaWR0aCA9IHdpZHRoICogUFVNUF9TSEFGVF9XSURUSF9QUk9QT1JUSU9OO1xuICAgIGNvbnN0IHB1bXBTaGFmdEhlaWdodCA9IGhlaWdodCAqIFBVTVBfU0hBRlRfSEVJR0hUX1BST1BPUlRJT047XG5cbiAgICAvLyB1c2UgUGFpbnRDb2xvclByb3BlcnR5IHNvIHRoYXQgY29sb3JzIGNhbiBiZSB1cGRhdGVkIGR5bmFtaWNhbGx5XG4gICAgY29uc3Qgc2hhZnRGaWxsQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIG9wdGlvbnMuc2hhZnRGaWxsICk7XG4gICAgY29uc3Qgc2hhZnRTdHJva2VDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggc2hhZnRGaWxsQ29sb3JQcm9wZXJ0eSwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjM4IH0gKTtcblxuICAgIC8vIGNyZWF0ZSB0aGUgcHVtcCBzaGFmdCwgd2hpY2ggaXMgdGhlIHBhcnQgYmVsb3cgdGhlIGhhbmRsZSBhbmQgaW5zaWRlIHRoZSBib2R5XG4gICAgdGhpcy5wdW1wU2hhZnROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgcHVtcFNoYWZ0V2lkdGgsIHB1bXBTaGFmdEhlaWdodCwge1xuICAgICAgZmlsbDogc2hhZnRGaWxsQ29sb3JQcm9wZXJ0eSxcbiAgICAgIHN0cm9rZTogc2hhZnRTdHJva2VDb2xvclByb3BlcnR5LFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuICAgIHRoaXMucHVtcFNoYWZ0Tm9kZS54ID0gLXB1bXBTaGFmdFdpZHRoIC8gMjtcblxuICAgIC8vIGNyZWF0ZSB0aGUgaGFuZGxlIG9mIHRoZSBwdW1wXG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZSA9IG5ldyBQdW1wSGFuZGxlTm9kZSggb3B0aW9ucy5oYW5kbGVGaWxsICk7XG4gICAgY29uc3QgcHVtcEhhbmRsZUhlaWdodCA9IGhlaWdodCAqIFBVTVBfSEFORExFX0hFSUdIVF9QUk9QT1JUSU9OO1xuICAgIHRoaXMucHVtcEhhbmRsZU5vZGUudG91Y2hBcmVhID1cbiAgICAgIHRoaXMucHVtcEhhbmRsZU5vZGUubG9jYWxCb3VuZHMuZGlsYXRlZFhZKCBvcHRpb25zLmhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbiwgb3B0aW9ucy5oYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24gKTtcbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLm1vdXNlQXJlYSA9XG4gICAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggb3B0aW9ucy5oYW5kbGVNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMuaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uICk7XG4gICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5zY2FsZSggcHVtcEhhbmRsZUhlaWdodCAvIHRoaXMucHVtcEhhbmRsZU5vZGUuaGVpZ2h0ICk7XG4gICAgdGhpcy5zZXRQdW1wSGFuZGxlVG9Jbml0aWFsUG9zaXRpb24oKTtcblxuICAgIC8vIGVuYWJsZS9kaXNhYmxlIGJlaGF2aW9yIGFuZCBhcHBlYXJhbmNlIGZvciB0aGUgaGFuZGxlXG4gICAgY29uc3QgZW5hYmxlZExpc3RlbmVyID0gKCBlbmFibGVkOiBib29sZWFuICkgPT4ge1xuICAgICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcbiAgICAgIHRoaXMucHVtcEhhbmRsZU5vZGUucGlja2FibGUgPSBlbmFibGVkO1xuICAgICAgdGhpcy5wdW1wSGFuZGxlTm9kZS5jdXJzb3IgPSBlbmFibGVkID8gb3B0aW9ucy5oYW5kbGVDdXJzb3IgOiAnZGVmYXVsdCc7XG4gICAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLm9wYWNpdHkgPSBlbmFibGVkID8gMSA6IFNjZW5lcnlDb25zdGFudHMuRElTQUJMRURfT1BBQ0lUWTtcbiAgICAgIHRoaXMucHVtcFNoYWZ0Tm9kZS5vcGFjaXR5ID0gZW5hYmxlZCA/IDEgOiBTY2VuZXJ5Q29uc3RhbnRzLkRJU0FCTEVEX09QQUNJVFk7XG4gICAgfTtcbiAgICB0aGlzLm5vZGVFbmFibGVkUHJvcGVydHkubGluayggZW5hYmxlZExpc3RlbmVyICk7XG5cbiAgICAvLyBkZWZpbmUgdGhlIGFsbG93ZWQgcmFuZ2UgZm9yIHRoZSBwdW1wIGhhbmRsZSdzIG1vdmVtZW50XG4gICAgY29uc3QgbWF4SGFuZGxlWU9mZnNldCA9IHRoaXMucHVtcEhhbmRsZU5vZGUuY2VudGVyWTtcbiAgICBjb25zdCBtaW5IYW5kbGVZT2Zmc2V0ID0gbWF4SGFuZGxlWU9mZnNldCArICggLVBVTVBfU0hBRlRfSEVJR0hUX1BST1BPUlRJT04gKiBwdW1wQm9keUhlaWdodCApO1xuXG4gICAgdGhpcy5kcmFnRGVsZWdhdGUgPSBuZXcgRHJhZ0RlbGVnYXRlKCBudW1iZXJQcm9wZXJ0eSwgcmFuZ2VQcm9wZXJ0eSwgdGhpcy5ub2RlRW5hYmxlZFByb3BlcnR5LFxuICAgICAgb3B0aW9ucy5pbmplY3Rpb25FbmFibGVkUHJvcGVydHksIG1pbkhhbmRsZVlPZmZzZXQsIG1heEhhbmRsZVlPZmZzZXQsIHRoaXMucHVtcEhhbmRsZU5vZGUsIHRoaXMucHVtcFNoYWZ0Tm9kZSwge1xuICAgICAgICBudW1iZXJPZlBhcnRpY2xlc1BlclB1bXBBY3Rpb246IG9wdGlvbnMubnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uLFxuICAgICAgICBhZGRQYXJ0aWNsZXNPbmVBdEFUaW1lOiBvcHRpb25zLmFkZFBhcnRpY2xlc09uZUF0QVRpbWVcbiAgICAgIH0gKTtcblxuICAgIC8vIERyYWcgdGhlIHB1bXAgaGFuZGxlIHVzaW5nIG1vdXNlL3RvdWNoLlxuICAgIHRoaXMuZHJhZ0xpc3RlbmVyID0gbmV3IFNvdW5kRHJhZ0xpc3RlbmVyKCBjb21iaW5lT3B0aW9uczxTb3VuZERyYWdMaXN0ZW5lck9wdGlvbnM+KCB7XG4gICAgICBkcmFnOiAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKSA9PiB7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBoYW5kbGUgcG9zaXRpb24gYmFzZWQgb24gdGhlIHVzZXIncyBwb2ludGVyIHBvc2l0aW9uLlxuICAgICAgICBjb25zdCBkcmFnUG9zaXRpb25ZID0gdGhpcy5wdW1wSGFuZGxlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkueTtcbiAgICAgICAgY29uc3QgaGFuZGxlUG9zaXRpb24gPSBVdGlscy5jbGFtcCggZHJhZ1Bvc2l0aW9uWSwgbWluSGFuZGxlWU9mZnNldCwgbWF4SGFuZGxlWU9mZnNldCApO1xuICAgICAgICB0aGlzLmRyYWdEZWxlZ2F0ZS5oYW5kbGVEcmFnKCBoYW5kbGVQb3NpdGlvbiApO1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXG4gICAgfSwgb3B0aW9ucy5kcmFnTGlzdGVuZXJPcHRpb25zICkgKTtcbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0xpc3RlbmVyICk7XG5cbiAgICAvLyBEcmFnIHRoZSBwdW1wIGhhbmRsZSB1c2luZyB0aGUga2V5Ym9hcmQuXG4gICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lciA9IG5ldyBTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyKCBjb21iaW5lT3B0aW9uczxTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz4oIHtcbiAgICAgIGtleWJvYXJkRHJhZ0RpcmVjdGlvbjogJ3VwRG93bicsXG4gICAgICBkcmFnU3BlZWQ6IDIwMCxcbiAgICAgIHNoaWZ0RHJhZ1NwZWVkOiA1MCxcbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVQb3NpdGlvbiA9IFV0aWxzLmNsYW1wKCB0aGlzLnB1bXBIYW5kbGVOb2RlLmNlbnRlclkgKyBsaXN0ZW5lci5tb2RlbERlbHRhLnksIG1pbkhhbmRsZVlPZmZzZXQsIG1heEhhbmRsZVlPZmZzZXQgKTtcbiAgICAgICAgdGhpcy5kcmFnRGVsZWdhdGUuaGFuZGxlRHJhZyggaGFuZGxlUG9zaXRpb24gKTtcbiAgICAgIH0sXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2tleWJvYXJkRHJhZ0xpc3RlbmVyJyApXG4gICAgfSwgb3B0aW9ucy5rZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgKSApO1xuICAgIHRoaXMucHVtcEhhbmRsZU5vZGUuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lciApO1xuXG4gICAgLy8gYWRkIHRoZSBwaWVjZXMgd2l0aCB0aGUgY29ycmVjdCBsYXllcmluZ1xuICAgIHRoaXMuYWRkQ2hpbGQoIHB1bXBCYXNlTm9kZSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHlUb3BCYWNrTm9kZSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJvZHlCb3R0b21DYXBOb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wdW1wU2hhZnROb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wdW1wSGFuZGxlTm9kZSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucHVtcEJvZHlOb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcmVtYWluaW5nQ2FwYWNpdHlJbmRpY2F0b3IgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBib2R5VG9wRnJvbnROb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggY29uZU5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCBob3NlTm9kZSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGV4dGVybmFsSG9zZUNvbm5lY3RvciApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGxvY2FsSG9zZUNvbm5lY3RvciApO1xuXG4gICAgLy8gV2l0aCA/ZGV2IHF1ZXJ5IHBhcmFtZXRlciwgcGxhY2UgYSByZWQgZG90IGF0IHRoZSBvcmlnaW4uXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRldiApIHtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIDIsIHsgZmlsbDogJ3JlZCcgfSApICk7XG4gICAgfVxuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3NjZW5lcnktcGhldCcsICdCaWN5Y2xlUHVtcE5vZGUnLCB0aGlzICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VCaWN5Y2xlUHVtcE5vZGUgPSAoKSA9PiB7XG5cbiAgICAgIC8vIERyYWcgbGlzdGVuZXJzIGFyZSByZWdpc3RlcmVkIHdpdGggUGhFVC1pTywgc28gdGhleSBuZWVkIHRvIGJlIGRpc3Bvc2VkLlxuICAgICAgdGhpcy5kcmFnTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5rZXlib2FyZERyYWdMaXN0ZW5lci5kaXNwb3NlKCk7XG5cbiAgICAgIC8vIENsZWFuIHVwIG5vZGVFbmFibGVkUHJvcGVydHkgYXBwcm9wcmlhdGVseSwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgd2UgY3JlYXRlZCBpdCwgb3IgaXQgd2FzIHByb3ZpZGVkIHRvIHVzLlxuICAgICAgaWYgKCBvd25zRW5hYmxlZFByb3BlcnR5ICkge1xuICAgICAgICB0aGlzLm5vZGVFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggZW5hYmxlZExpc3RlbmVyICkgKSB7XG4gICAgICAgIHRoaXMubm9kZUVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGVuYWJsZWRMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBoYW5kbGUgYW5kIHNoYWZ0IHRvIHRoZWlyIGluaXRpYWwgcG9zaXRpb24uXG4gICAqL1xuICBwcml2YXRlIHNldFB1bXBIYW5kbGVUb0luaXRpYWxQb3NpdGlvbigpOiB2b2lkIHtcbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLmJvdHRvbSA9IHRoaXMucHVtcEJvZHlOb2RlLnRvcCAtIDE4OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXG4gICAgdGhpcy5wdW1wU2hhZnROb2RlLnRvcCA9IHRoaXMucHVtcEhhbmRsZU5vZGUuYm90dG9tO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuc2V0UHVtcEhhbmRsZVRvSW5pdGlhbFBvc2l0aW9uKCk7XG4gICAgdGhpcy5kcmFnRGVsZWdhdGUucmVzZXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUJpY3ljbGVQdW1wTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIERyYXdzIHRoZSBiYXNlIG9mIHRoZSBwdW1wLiBNYW55IG9mIHRoZSBtdWx0aXBsaWVycyBhbmQgcG9pbnQgcG9zaXRpb25zIHdlcmUgYXJyaXZlZCBhdCBlbXBpcmljYWxseS5cbiAqXG4gKiBAcGFyYW0gd2lkdGggLSB0aGUgd2lkdGggb2YgdGhlIGJhc2VcbiAqIEBwYXJhbSBoZWlnaHQgLSB0aGUgaGVpZ2h0IG9mIHRoZSBiYXNlXG4gKiBAcGFyYW0gZmlsbFxuICovXG5mdW5jdGlvbiBjcmVhdGVQdW1wQmFzZU5vZGUoIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmaWxsOiBUQ29sb3IgKTogTm9kZSB7XG5cbiAgLy8gM0QgZWZmZWN0IGlzIGJlaW5nIHVzZWQsIHNvIG1vc3Qgb2YgdGhlIGhlaWdodCBtYWtlcyB1cCB0aGUgc3VyZmFjZVxuICBjb25zdCB0b3BPZkJhc2VIZWlnaHQgPSBoZWlnaHQgKiAwLjc7XG4gIGNvbnN0IGhhbGZPZkJhc2VXaWR0aCA9IHdpZHRoIC8gMjtcblxuICAvLyB1c2UgUGFpbnRDb2xvclByb3BlcnR5IHNvIHRoYXQgY29sb3JzIGNhbiBiZSB1cGRhdGVkIGR5bmFtaWNhbGx5XG4gIGNvbnN0IGJhc2VGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IDAuMDUgfSApO1xuICBjb25zdCBiYXNlRmlsbERhcmtlckNvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMiB9ICk7XG4gIGNvbnN0IGJhc2VGaWxsRGFya2VzdENvbG9yUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCBmaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuNCB9ICk7XG5cbiAgLy8gcm91bmRlZCByZWN0YW5nbGUgdGhhdCBpcyB0aGUgdG9wIG9mIHRoZSBiYXNlXG4gIGNvbnN0IHRvcE9mQmFzZU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAtaGFsZk9mQmFzZVdpZHRoLCAtdG9wT2ZCYXNlSGVpZ2h0IC8gMiwgd2lkdGgsIHRvcE9mQmFzZUhlaWdodCwgMjAsIDIwLCB7XG4gICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAtaGFsZk9mQmFzZVdpZHRoLCAwLCBoYWxmT2ZCYXNlV2lkdGgsIDAgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMCwgYmFzZUZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMC41LCBmaWxsIClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGJhc2VGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApXG4gIH0gKTtcblxuICBjb25zdCBwdW1wQmFzZUVkZ2VIZWlnaHQgPSBoZWlnaHQgKiAwLjY1O1xuICBjb25zdCBwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCA9IHB1bXBCYXNlRWRnZUhlaWdodCAqIDEuMDU7XG4gIGNvbnN0IHB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0ID0gd2lkdGggKiAwLjM1O1xuXG4gIC8vIHRoZSBmcm9udCBlZGdlIG9mIHRoZSBwdW1wIGJhc2UsIGRyYXcgY291bnRlci1jbG9ja3dpc2Ugc3RhcnRpbmcgYXQgbGVmdCBlZGdlXG4gIGNvbnN0IHB1bXBFZGdlU2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgIC5saW5lVG8oIC1oYWxmT2ZCYXNlV2lkdGgsIDAgKVxuICAgIC5saW5lVG8oIC1oYWxmT2ZCYXNlV2lkdGgsIHB1bXBCYXNlRWRnZUhlaWdodCAvIDIgKVxuICAgIC5xdWFkcmF0aWNDdXJ2ZVRvKCAtaGFsZk9mQmFzZVdpZHRoLCBwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCwgLXB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0LCBwdW1wQmFzZUVkZ2VIZWlnaHQgKVxuICAgIC5saW5lVG8oIHB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0LCBwdW1wQmFzZUVkZ2VIZWlnaHQgKVxuICAgIC5xdWFkcmF0aWNDdXJ2ZVRvKCBoYWxmT2ZCYXNlV2lkdGgsIHB1bXBCYXNlU2lkZUVkZ2VZQ29udHJvbFBvaW50LCBoYWxmT2ZCYXNlV2lkdGgsIHB1bXBCYXNlRWRnZUhlaWdodCAvIDIgKVxuICAgIC5saW5lVG8oIGhhbGZPZkJhc2VXaWR0aCwgMCApXG4gICAgLmNsb3NlKCk7XG5cbiAgLy8gY29sb3IgdGhlIGZyb250IGVkZ2Ugb2YgdGhlIHB1bXAgYmFzZVxuICBjb25zdCBwdW1wRWRnZU5vZGUgPSBuZXcgUGF0aCggcHVtcEVkZ2VTaGFwZSwge1xuICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggLWhhbGZPZkJhc2VXaWR0aCwgMCwgaGFsZk9mQmFzZVdpZHRoLCAwIClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VGaWxsRGFya2VzdENvbG9yUHJvcGVydHkgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMC4xNSwgYmFzZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGJhc2VGaWxsRGFya2VzdENvbG9yUHJvcGVydHkgKVxuICB9ICk7XG5cbiAgcHVtcEVkZ2VOb2RlLmNlbnRlclkgPSAtcHVtcEVkZ2VOb2RlLmhlaWdodCAvIDI7XG5cbiAgLy8gMC42IGRldGVybWluZWQgZW1waXJpY2FsbHkgZm9yIGJlc3QgcG9zaXRpb25pbmdcbiAgdG9wT2ZCYXNlTm9kZS5ib3R0b20gPSBwdW1wRWRnZU5vZGUuYm90dG9tIC0gcHVtcEJhc2VFZGdlSGVpZ2h0IC8gMiArIDAuNjtcbiAgcmV0dXJuIG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHB1bXBFZGdlTm9kZSwgdG9wT2ZCYXNlTm9kZSBdIH0gKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGhhbGYgb2YgdGhlIG9wZW5pbmcgYXQgdGhlIHRvcCBvZiB0aGUgcHVtcCBib2R5LiBQYXNzaW5nIGluIC0xIGZvciB0aGUgc2lnbiBjcmVhdGVzIHRoZSBiYWNrIGhhbGYsIGFuZFxuICogcGFzc2luZyBpbiAxIGNyZWF0ZXMgdGhlIGZyb250LlxuICovXG5mdW5jdGlvbiBjcmVhdGVCb2R5VG9wSGFsZk5vZGUoIHdpZHRoOiBudW1iZXIsIHNpZ246IDEgfCAtMSwgZmlsbDogVENvbG9yLCBzdHJva2U6IFRDb2xvciApOiBOb2RlIHtcbiAgY29uc3QgYm9keVRvcFNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAubW92ZVRvKCAwLCAwIClcbiAgICAuY3ViaWNDdXJ2ZVRvKFxuICAgICAgMCxcbiAgICAgIHNpZ24gKiB3aWR0aCAqIFNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IsXG4gICAgICB3aWR0aCxcbiAgICAgIHNpZ24gKiB3aWR0aCAqIFNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IsXG4gICAgICB3aWR0aCxcbiAgICAgIDBcbiAgICApO1xuXG4gIHJldHVybiBuZXcgUGF0aCggYm9keVRvcFNoYXBlLCB7XG4gICAgZmlsbDogZmlsbCxcbiAgICBzdHJva2U6IHN0cm9rZVxuICB9ICk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhvc2UgY29ubmVjdG9yLiBUaGUgaG9zZSBoYXMgb25lIG9uIGVhY2ggb2YgaXRzIGVuZHMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUhvc2VDb25uZWN0b3JOb2RlKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgZmlsbDogVENvbG9yICk6IE5vZGUge1xuXG4gIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcbiAgY29uc3QgZmlsbEJyaWdodGVyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGZpbGwsIHsgbHVtaW5hbmNlRmFjdG9yOiAwLjEgfSApO1xuICBjb25zdCBmaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGZpbGwsIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC4yIH0gKTtcbiAgY29uc3QgZmlsbERhcmtlc3RDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjQgfSApO1xuXG4gIHJldHVybiBuZXcgUmVjdGFuZ2xlKCAwLCAwLCB3aWR0aCwgaGVpZ2h0LCAyLCAyLCB7XG4gICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBoZWlnaHQgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMCwgZmlsbERhcmtlckNvbG9yUHJvcGVydHkgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMC4zLCBmaWxsIClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAuMzUsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMC40LCBmaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsIGZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSApXG4gIH0gKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBjb25lLCB3aGljaCBjb25uZWN0cyB0aGUgcHVtcCBiYXNlIHRvIHRoZSBwdW1wIGJvZHkuXG4gKiBAcGFyYW0gcHVtcEJvZHlXaWR0aCAtIHRoZSB3aWR0aCBvZiB0aGUgcHVtcCBib2R5IChub3QgcXVpdGUgYXMgd2lkZSBhcyB0aGUgdG9wIG9mIHRoZSBjb25lKVxuICogQHBhcmFtIGhlaWdodFxuICogQHBhcmFtIGZpbGxcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29uZU5vZGUoIHB1bXBCb2R5V2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGZpbGw6IFRDb2xvciApOiBOb2RlIHtcbiAgY29uc3QgY29uZVRvcFdpZHRoID0gcHVtcEJvZHlXaWR0aCAqIDEuMjtcbiAgY29uc3QgY29uZVRvcFJhZGl1c1kgPSAzO1xuICBjb25zdCBjb25lVG9wUmFkaXVzWCA9IGNvbmVUb3BXaWR0aCAvIDI7XG4gIGNvbnN0IGNvbmVCb3R0b21XaWR0aCA9IHB1bXBCb2R5V2lkdGggKiAyO1xuICBjb25zdCBjb25lQm90dG9tUmFkaXVzWSA9IDQ7XG4gIGNvbnN0IGNvbmVCb3R0b21SYWRpdXNYID0gY29uZUJvdHRvbVdpZHRoIC8gMjtcblxuICBjb25zdCBjb25lU2hhcGUgPSBuZXcgU2hhcGUoKVxuXG4gICAgLy8gc3RhcnQgaW4gdXBwZXIgcmlnaHQgY29ybmVyIG9mIHNoYXBlLCBkcmF3IHRvcCBlbGxpcHNlIHJpZ2h0IHRvIGxlZnRcbiAgICAuZWxsaXB0aWNhbEFyYyggMCwgMCwgY29uZVRvcFJhZGl1c1gsIGNvbmVUb3BSYWRpdXNZLCAwLCAwLCBNYXRoLlBJLCBmYWxzZSApXG4gICAgLmxpbmVUbyggLWNvbmVCb3R0b21SYWRpdXNYLCBoZWlnaHQgKSAvLyBsaW5lIHRvIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiBzaGFwZVxuXG4gICAgLy8gZHJhdyBib3R0b20gZWxsaXBzZSBsZWZ0IHRvIHJpZ2h0XG4gICAgLmVsbGlwdGljYWxBcmMoIDAsIGhlaWdodCwgY29uZUJvdHRvbVJhZGl1c1gsIGNvbmVCb3R0b21SYWRpdXNZLCAwLCBNYXRoLlBJLCAwLCB0cnVlIClcbiAgICAubGluZVRvKCBjb25lVG9wUmFkaXVzWCwgMCApOyAvLyBsaW5lIHRvIHVwcGVyIHJpZ2h0IGNvcm5lciBvZiBzaGFwZVxuXG4gIC8vIHVzZSBQYWludENvbG9yUHJvcGVydHkgc28gdGhhdCBjb2xvcnMgY2FuIGJlIHVwZGF0ZWQgZHluYW1pY2FsbHlcbiAgY29uc3QgZmlsbEJyaWdodGVyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGZpbGwsIHsgbHVtaW5hbmNlRmFjdG9yOiAwLjEgfSApO1xuICBjb25zdCBmaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSA9IG5ldyBQYWludENvbG9yUHJvcGVydHkoIGZpbGwsIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC40IH0gKTtcbiAgY29uc3QgZmlsbERhcmtlc3RDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCwgeyBsdW1pbmFuY2VGYWN0b3I6IC0wLjUgfSApO1xuXG4gIGNvbnN0IGNvbmVHcmFkaWVudCA9IG5ldyBMaW5lYXJHcmFkaWVudCggLWNvbmVCb3R0b21XaWR0aCAvIDIsIDAsIGNvbmVCb3R0b21XaWR0aCAvIDIsIDAgKVxuICAgIC5hZGRDb2xvclN0b3AoIDAsIGZpbGxEYXJrZXJDb2xvclByb3BlcnR5IClcbiAgICAuYWRkQ29sb3JTdG9wKCAwLjMsIGZpbGwgKVxuICAgIC5hZGRDb2xvclN0b3AoIDAuMzUsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxuICAgIC5hZGRDb2xvclN0b3AoIDAuNDUsIGZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkgKVxuICAgIC5hZGRDb2xvclN0b3AoIDAuNSwgZmlsbCApXG4gICAgLmFkZENvbG9yU3RvcCggMSwgZmlsbERhcmtlc3RDb2xvclByb3BlcnR5ICk7XG5cbiAgcmV0dXJuIG5ldyBQYXRoKCBjb25lU2hhcGUsIHtcbiAgICBmaWxsOiBjb25lR3JhZGllbnRcbiAgfSApO1xufVxuXG4vKipcbiAqIFB1bXBIYW5kbGVOb2RlIGlzIHRoZSBwdW1wJ3MgaGFuZGxlLlxuICovXG5jbGFzcyBQdW1wSGFuZGxlTm9kZSBleHRlbmRzIEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nKCBQYXRoICkge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGZpbGw6IFRDb2xvciApIHtcblxuICAgIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgY29uc3RhbnRzXG4gICAgY29uc3QgY2VudGVyU2VjdGlvbldpZHRoID0gMzU7XG4gICAgY29uc3QgY2VudGVyQ3VydmVXaWR0aCA9IDE0O1xuICAgIGNvbnN0IGNlbnRlckN1cnZlSGVpZ2h0ID0gODtcbiAgICBjb25zdCBudW1iZXJPZkdyaXBCdW1wcyA9IDQ7XG4gICAgY29uc3QgZ3JpcFNpbmdsZUJ1bXBXaWR0aCA9IDE2O1xuICAgIGNvbnN0IGdyaXBTaW5nbGVCdW1wSGFsZldpZHRoID0gZ3JpcFNpbmdsZUJ1bXBXaWR0aCAvIDI7XG4gICAgY29uc3QgZ3JpcEludGVyQnVtcFdpZHRoID0gZ3JpcFNpbmdsZUJ1bXBXaWR0aCAqIDAuMzE7XG4gICAgY29uc3QgZ3JpcEVuZEhlaWdodCA9IDIzO1xuXG4gICAgLy8gc3RhcnQgdGhlIGhhbmRsZSBmcm9tIHRoZSBjZW50ZXIgYm90dG9tLCBkcmF3aW5nIGFyb3VuZCBjb3VudGVyY2xvY2t3aXNlXG4gICAgY29uc3QgcHVtcEhhbmRsZVNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICk7XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBcImJ1bXBcIiB0byB0aGUgdG9wIG9yIGJvdHRvbSBvZiB0aGUgZ3JpcFxuICAgICAqIEBwYXJhbSBzaGFwZSAtIHRoZSBzaGFwZSB0byBhcHBlbmQgdG9cbiAgICAgKiBAcGFyYW0gc2lnbiAtICsxIGZvciBib3R0b20gc2lkZSBvZiBncmlwLCAtMSBmb3IgdG9wIHNpZGUgb2YgZ3JpcFxuICAgICAqL1xuICAgIGNvbnN0IGFkZEdyaXBCdW1wID0gKCBzaGFwZTogU2hhcGUsIHNpZ246IDEgfCAtMSApID0+IHtcblxuICAgICAgLy8gY29udHJvbCBwb2ludHMgZm9yIHF1YWRyYXRpYyBjdXJ2ZSBzaGFwZSBvbiBncmlwXG4gICAgICBjb25zdCBjb250cm9sUG9pbnRYID0gZ3JpcFNpbmdsZUJ1bXBXaWR0aCAvIDI7XG4gICAgICBjb25zdCBjb250cm9sUG9pbnRZID0gZ3JpcFNpbmdsZUJ1bXBXaWR0aCAvIDI7XG5cbiAgICAgIC8vIHRoaXMgaXMgYSBncmlwIGJ1bXBcbiAgICAgIHNoYXBlLnF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZShcbiAgICAgICAgc2lnbiAqIGNvbnRyb2xQb2ludFgsXG4gICAgICAgIHNpZ24gKiBjb250cm9sUG9pbnRZLFxuICAgICAgICBzaWduICogZ3JpcFNpbmdsZUJ1bXBXaWR0aCxcbiAgICAgICAgMCApO1xuICAgIH07XG5cbiAgICAvLyB0aGlzIGlzIHRoZSBsb3dlciByaWdodCBwYXJ0IG9mIHRoZSBoYW5kbGUsIGluY2x1ZGluZyBoYWxmIG9mIHRoZSBtaWRkbGUgc2VjdGlvbiBhbmQgdGhlIGdyaXAgYnVtcHNcbiAgICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIGNlbnRlclNlY3Rpb25XaWR0aCAvIDIsIDAgKTtcbiAgICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCBjZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgMCwgY2VudGVyQ3VydmVXaWR0aCwgLWNlbnRlckN1cnZlSGVpZ2h0ICk7XG4gICAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCBncmlwSW50ZXJCdW1wV2lkdGgsIDAgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkdyaXBCdW1wcyAtIDE7IGkrKyApIHtcbiAgICAgIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIDEgKTtcbiAgICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggZ3JpcEludGVyQnVtcFdpZHRoLCAwICk7XG4gICAgfVxuICAgIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIDEgKTtcblxuICAgIC8vIHRoaXMgaXMgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGhhbmRsZVxuICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggMCwgLWdyaXBFbmRIZWlnaHQgKTtcblxuICAgIC8vIHRoaXMgaXMgdGhlIHVwcGVyIHJpZ2h0IHBhcnQgb2YgdGhlIGhhbmRsZSwgaW5jbHVkaW5nIG9ubHkgdGhlIGdyaXAgYnVtcHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkdyaXBCdW1wczsgaSsrICkge1xuICAgICAgYWRkR3JpcEJ1bXAoIHB1bXBIYW5kbGVTaGFwZSwgLTEgKTtcbiAgICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggLWdyaXBJbnRlckJ1bXBXaWR0aCwgMCApO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgdGhlIHVwcGVyIG1pZGRsZSBzZWN0aW9uIG9mIHRoZSBoYW5kbGVcbiAgICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCAtY2VudGVyQ3VydmVXaWR0aCAvIDIsIC1jZW50ZXJDdXJ2ZUhlaWdodCwgLWNlbnRlckN1cnZlV2lkdGgsIC1jZW50ZXJDdXJ2ZUhlaWdodCApO1xuICAgIHB1bXBIYW5kbGVTaGFwZS5saW5lVG9SZWxhdGl2ZSggLWNlbnRlclNlY3Rpb25XaWR0aCwgMCApO1xuICAgIHB1bXBIYW5kbGVTaGFwZS5xdWFkcmF0aWNDdXJ2ZVRvUmVsYXRpdmUoIC1jZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgMCwgLWNlbnRlckN1cnZlV2lkdGgsIGNlbnRlckN1cnZlSGVpZ2h0ICk7XG4gICAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCAtZ3JpcEludGVyQnVtcFdpZHRoLCAwICk7XG5cbiAgICAvLyB0aGlzIGlzIHRoZSB1cHBlciBsZWZ0IHBhcnQgb2YgdGhlIGhhbmRsZSwgaW5jbHVkaW5nIG9ubHkgdGhlIGdyaXAgYnVtcHNcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkdyaXBCdW1wcyAtIDE7IGkrKyApIHtcbiAgICAgIGFkZEdyaXBCdW1wKCBwdW1wSGFuZGxlU2hhcGUsIC0xICk7XG4gICAgICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIC1ncmlwSW50ZXJCdW1wV2lkdGgsIDAgKTtcbiAgICB9XG4gICAgYWRkR3JpcEJ1bXAoIHB1bXBIYW5kbGVTaGFwZSwgLTEgKTtcblxuICAgIC8vIHRoaXMgaXMgdGhlIGxlZnQgZWRnZSBvZiB0aGUgaGFuZGxlXG4gICAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCAwLCBncmlwRW5kSGVpZ2h0ICk7XG5cbiAgICAvLyB0aGlzIGlzIHRoZSBsb3dlciBsZWZ0IHBhcnQgb2YgdGhlIGhhbmRsZSwgaW5jbHVkaW5nIHRoZSBncmlwIGJ1bXBzIGFuZCBoYWxmIG9mIHRoZSBtaWRkbGUgc2VjdGlvblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mR3JpcEJ1bXBzOyBpKysgKSB7XG4gICAgICBhZGRHcmlwQnVtcCggcHVtcEhhbmRsZVNoYXBlLCAxICk7XG4gICAgICBwdW1wSGFuZGxlU2hhcGUubGluZVRvUmVsYXRpdmUoIGdyaXBJbnRlckJ1bXBXaWR0aCwgMCApO1xuICAgIH1cbiAgICBwdW1wSGFuZGxlU2hhcGUucXVhZHJhdGljQ3VydmVUb1JlbGF0aXZlKCBjZW50ZXJDdXJ2ZVdpZHRoIC8gMiwgY2VudGVyQ3VydmVIZWlnaHQsIGNlbnRlckN1cnZlV2lkdGgsIGNlbnRlckN1cnZlSGVpZ2h0ICk7XG4gICAgcHVtcEhhbmRsZVNoYXBlLmxpbmVUb1JlbGF0aXZlKCBjZW50ZXJTZWN0aW9uV2lkdGggLyAyLCAwICk7XG4gICAgcHVtcEhhbmRsZVNoYXBlLmNsb3NlKCk7XG5cbiAgICAvLyB1c2VkIHRvIHRyYWNrIHdoZXJlIHRoZSBjdXJyZW50IHBvc2l0aW9uIGlzIG9uIHRoZSBoYW5kbGUgd2hlbiBkcmF3aW5nIGl0cyBncmFkaWVudFxuICAgIGxldCBoYW5kbGVHcmFkaWVudFBvc2l0aW9uID0gMDtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBjb2xvciBzdG9wIHRvIHRoZSBnaXZlbiBncmFkaWVudCBhdFxuICAgICAqIEBwYXJhbSBncmFkaWVudCAtIHRoZSBncmFkaWVudCBiZWluZyBhcHBlbmRlZCB0b1xuICAgICAqIEBwYXJhbSBkZWx0YURpc3RhbmNlIC0gdGhlIGRpc3RhbmNlIG9mIHRoaXMgYWRkZWQgY29sb3Igc3RvcFxuICAgICAqIEBwYXJhbSB0b3RhbERpc3RhbmNlIC0gdGhlIHRvdGFsIHdpZHRoIG9mIHRoZSBncmFkaWVudFxuICAgICAqIEBwYXJhbSBjb2xvciAtIHRoZSBjb2xvciBvZiB0aGlzIGNvbG9yIHN0b3BcbiAgICAgKi9cbiAgICBjb25zdCBhZGRSZWxhdGl2ZUNvbG9yU3RvcCA9ICggZ3JhZGllbnQ6IExpbmVhckdyYWRpZW50LCBkZWx0YURpc3RhbmNlOiBudW1iZXIsIHRvdGFsRGlzdGFuY2U6IG51bWJlciwgY29sb3I6IFRDb2xvciApID0+IHtcbiAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gaGFuZGxlR3JhZGllbnRQb3NpdGlvbiArIGRlbHRhRGlzdGFuY2U7XG4gICAgICBsZXQgcmF0aW8gPSBuZXdQb3NpdGlvbiAvIHRvdGFsRGlzdGFuY2U7XG4gICAgICByYXRpbyA9IHJhdGlvID4gMSA/IDEgOiByYXRpbztcblxuICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKCByYXRpbywgY29sb3IgKTtcbiAgICAgIGhhbmRsZUdyYWRpZW50UG9zaXRpb24gPSBuZXdQb3NpdGlvbjtcbiAgICB9O1xuXG4gICAgLy8gc2V0IHVwIHRoZSBncmFkaWVudCBmb3IgdGhlIGhhbmRsZVxuICAgIGNvbnN0IHB1bXBIYW5kbGVXaWR0aCA9IHB1bXBIYW5kbGVTaGFwZS5ib3VuZHMud2lkdGg7XG4gICAgY29uc3QgcHVtcEhhbmRsZUdyYWRpZW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAtcHVtcEhhbmRsZVdpZHRoIC8gMiwgMCwgcHVtcEhhbmRsZVdpZHRoIC8gMiwgMCApO1xuXG4gICAgLy8gdXNlIFBhaW50Q29sb3JQcm9wZXJ0eSBzbyB0aGF0IGNvbG9ycyBjYW4gYmUgdXBkYXRlZCBkeW5hbWljYWxseVxuICAgIGNvbnN0IGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggZmlsbCApO1xuICAgIGNvbnN0IGhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggaGFuZGxlRmlsbENvbG9yUHJvcGVydHksIHsgbHVtaW5hbmNlRmFjdG9yOiAtMC4zNSB9ICk7XG5cbiAgICAvLyBmaWxsIHRoZSBsZWZ0IHNpZGUgaGFuZGxlIGdyYWRpZW50XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZHcmlwQnVtcHM7IGkrKyApIHtcbiAgICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIDAsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbENvbG9yUHJvcGVydHkgKTtcbiAgICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIGdyaXBTaW5nbGVCdW1wSGFsZldpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XG4gICAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBncmlwU2luZ2xlQnVtcEhhbGZXaWR0aCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApO1xuICAgICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgMCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xuICAgICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgZ3JpcEludGVyQnVtcFdpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ICk7XG4gICAgfVxuXG4gICAgLy8gZmlsbCB0aGUgY2VudGVyIHNlY3Rpb24gaGFuZGxlIGdyYWRpZW50XG4gICAgYWRkUmVsYXRpdmVDb2xvclN0b3AoIHB1bXBIYW5kbGVHcmFkaWVudCwgMCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSApO1xuICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIGNlbnRlckN1cnZlV2lkdGggKyBjZW50ZXJTZWN0aW9uV2lkdGgsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbENvbG9yUHJvcGVydHkgKTtcbiAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBjZW50ZXJDdXJ2ZVdpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5ICk7XG5cbiAgICAvLyBmaWxsIHRoZSByaWdodCBzaWRlIGhhbmRsZSBncmFkaWVudFxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlck9mR3JpcEJ1bXBzOyBpKysgKSB7XG4gICAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCAwLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XG4gICAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBncmlwSW50ZXJCdW1wV2lkdGgsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbERhcmtlckNvbG9yUHJvcGVydHkgKTtcbiAgICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIDAsIHB1bXBIYW5kbGVXaWR0aCwgaGFuZGxlRmlsbENvbG9yUHJvcGVydHkgKTtcbiAgICAgIGFkZFJlbGF0aXZlQ29sb3JTdG9wKCBwdW1wSGFuZGxlR3JhZGllbnQsIGdyaXBTaW5nbGVCdW1wSGFsZldpZHRoLCBwdW1wSGFuZGxlV2lkdGgsIGhhbmRsZUZpbGxDb2xvclByb3BlcnR5ICk7XG4gICAgICBhZGRSZWxhdGl2ZUNvbG9yU3RvcCggcHVtcEhhbmRsZUdyYWRpZW50LCBncmlwU2luZ2xlQnVtcEhhbGZXaWR0aCwgcHVtcEhhbmRsZVdpZHRoLCBoYW5kbGVGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSApO1xuICAgIH1cblxuICAgIHN1cGVyKCBwdW1wSGFuZGxlU2hhcGUsIHtcbiAgICAgIGxpbmVXaWR0aDogMixcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGZpbGw6IHB1bXBIYW5kbGVHcmFkaWVudCxcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgZm9jdXNhYmxlOiB0cnVlXG4gICAgfSApO1xuICB9XG59XG5cbi8qKlxuICogRHJhZ0RlbGVnYXRlIGhhbmRsZXMgdGhlIGRyYWcgYWN0aW9uIGZvciB0aGUgcHVtcCBoYW5kbGUuIFRoZSBTb3VuZERyYWdMaXN0ZW5lciBhbmQgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lclxuICogaW5zdGFuY2VzIGluIEJpY3ljbGVQdW1wTm9kZSBkZWxlZ2F0ZSB0byBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICovXG5cbnR5cGUgRHJhZ0RlbGVnYXRlU2VsZk9wdGlvbnMgPSBQaWNrUmVxdWlyZWQ8QmljeWNsZVB1bXBOb2RlT3B0aW9ucywgJ251bWJlck9mUGFydGljbGVzUGVyUHVtcEFjdGlvbicgfCAnYWRkUGFydGljbGVzT25lQXRBVGltZSc+O1xuXG50eXBlIERyYWdEZWxlZ2F0ZU9wdGlvbnMgPSBEcmFnRGVsZWdhdGVTZWxmT3B0aW9ucztcblxuY2xhc3MgRHJhZ0RlbGVnYXRlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlclByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcbiAgcHJpdmF0ZSByZWFkb25seSByYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT47XG4gIHByaXZhdGUgcmVhZG9ubHkgbm9kZUVuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XG4gIHByaXZhdGUgcmVhZG9ubHkgaW5qZWN0aW9uRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHJpdmF0ZSByZWFkb25seSBwdW1wSGFuZGxlTm9kZTogTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSBwdW1wU2hhZnROb2RlOiBOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IGFkZFBhcnRpY2xlc09uZUF0QVRpbWU6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgcHVtcGluZ0Rpc3RhbmNlUmVxdWlyZWRUb0FkZFBhcnRpY2xlOiBudW1iZXI7XG4gIHByaXZhdGUgcHVtcGluZ0Rpc3RhbmNlQWNjdW11bGF0aW9uOiBudW1iZXI7XG4gIHByaXZhdGUgbGFzdEhhbmRsZVBvc2l0aW9uOiBudW1iZXIgfCBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbnVtYmVyUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+LFxuICAgICAgICAgICAgICAgICAgICAgIHJhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPixcbiAgICAgICAgICAgICAgICAgICAgICBub2RlRW5hYmxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPixcbiAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25FbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxuICAgICAgICAgICAgICAgICAgICAgIG1pbkhhbmRsZVlPZmZzZXQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICBtYXhIYW5kbGVZT2Zmc2V0OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgcHVtcEhhbmRsZU5vZGU6IE5vZGUsXG4gICAgICAgICAgICAgICAgICAgICAgcHVtcFNoYWZ0Tm9kZTogTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IERyYWdEZWxlZ2F0ZU9wdGlvbnNcbiAgKSB7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhIYW5kbGVZT2Zmc2V0ID4gbWluSGFuZGxlWU9mZnNldCwgJ2JvZ3VzIG9mZnNldHMnICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xuXG4gICAgdGhpcy5udW1iZXJQcm9wZXJ0eSA9IG51bWJlclByb3BlcnR5O1xuICAgIHRoaXMucmFuZ2VQcm9wZXJ0eSA9IHJhbmdlUHJvcGVydHk7XG4gICAgdGhpcy5ub2RlRW5hYmxlZFByb3BlcnR5ID0gbm9kZUVuYWJsZWRQcm9wZXJ0eTtcbiAgICB0aGlzLmluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eSA9IGluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eTtcbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlID0gcHVtcEhhbmRsZU5vZGU7XG4gICAgdGhpcy5wdW1wU2hhZnROb2RlID0gcHVtcFNoYWZ0Tm9kZTtcbiAgICB0aGlzLmFkZFBhcnRpY2xlc09uZUF0QVRpbWUgPSBvcHRpb25zLmFkZFBhcnRpY2xlc09uZUF0QVRpbWU7XG5cbiAgICB0aGlzLnB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiA9IDA7XG4gICAgdGhpcy5sYXN0SGFuZGxlUG9zaXRpb24gPSBudWxsO1xuXG4gICAgLy8gSG93IGZhciB0aGUgcHVtcCBzaGFmdCBuZWVkcyB0byB0cmF2ZWwgYmVmb3JlIHRoZSBwdW1wIHJlbGVhc2VzIGEgcGFydGljbGUuXG4gICAgLy8gVGhlIHN1YnRyYWN0ZWQgY29uc3RhbnQgd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gZW5zdXJlIHRoYXQgbnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uIGlzIGNvcnJlY3QuXG4gICAgdGhpcy5wdW1waW5nRGlzdGFuY2VSZXF1aXJlZFRvQWRkUGFydGljbGUgPVxuICAgICAgKCBtYXhIYW5kbGVZT2Zmc2V0IC0gbWluSGFuZGxlWU9mZnNldCApIC8gb3B0aW9ucy5udW1iZXJPZlBhcnRpY2xlc1BlclB1bXBBY3Rpb24gLSAwLjAxO1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMucHVtcGluZ0Rpc3RhbmNlQWNjdW11bGF0aW9uID0gMDtcbiAgICB0aGlzLmxhc3RIYW5kbGVQb3NpdGlvbiA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGRyYWcgb2YgdGhlIHB1bXAgaGFuZGxlLiBTb3VuZERyYWdMaXN0ZW5lciBhbmQgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lciBpbnN0YW5jZXMgaW5cbiAgICogQmljeWNsZVB1bXBOb2RlIHNob3VsZCBjYWxsIHRoaXMgbWV0aG9kIGZyb20gdGhlaXIgb3B0aW9ucy5kcmFnIGZ1bmN0aW9uLlxuICAgKi9cbiAgcHVibGljIGhhbmRsZURyYWcoIG5ld0hhbmRsZVBvc2l0aW9uOiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICB0aGlzLnB1bXBIYW5kbGVOb2RlLmNlbnRlclkgPSBuZXdIYW5kbGVQb3NpdGlvbjtcbiAgICB0aGlzLnB1bXBTaGFmdE5vZGUudG9wID0gdGhpcy5wdW1wSGFuZGxlTm9kZS5ib3R0b207XG5cbiAgICBsZXQgbnVtYmVyT2ZCYXRjaFBhcnRpY2xlcyA9IDA7IC8vIG51bWJlciBvZiBwYXJ0aWNsZXMgdG8gYWRkIGFsbCBhdCBvbmNlXG5cbiAgICBpZiAoIHRoaXMubGFzdEhhbmRsZVBvc2l0aW9uICE9PSBudWxsICkge1xuICAgICAgY29uc3QgdHJhdmVsRGlzdGFuY2UgPSBuZXdIYW5kbGVQb3NpdGlvbiAtIHRoaXMubGFzdEhhbmRsZVBvc2l0aW9uO1xuICAgICAgaWYgKCB0cmF2ZWxEaXN0YW5jZSA+IDAgKSB7XG5cbiAgICAgICAgLy8gVGhpcyBtb3Rpb24gaXMgaW4gdGhlIGRvd253YXJkIGRpcmVjdGlvbiwgc28gYWRkIGl0cyBkaXN0YW5jZSB0byB0aGUgcHVtcGluZyBkaXN0YW5jZS5cbiAgICAgICAgdGhpcy5wdW1waW5nRGlzdGFuY2VBY2N1bXVsYXRpb24gKz0gdHJhdmVsRGlzdGFuY2U7XG4gICAgICAgIHdoaWxlICggdGhpcy5wdW1waW5nRGlzdGFuY2VBY2N1bXVsYXRpb24gPj0gdGhpcy5wdW1waW5nRGlzdGFuY2VSZXF1aXJlZFRvQWRkUGFydGljbGUgKSB7XG5cbiAgICAgICAgICAvLyBhZGQgYSBwYXJ0aWNsZVxuICAgICAgICAgIGlmICggdGhpcy5ub2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICYmIHRoaXMuaW5qZWN0aW9uRW5hYmxlZFByb3BlcnR5LnZhbHVlICYmXG4gICAgICAgICAgICAgICB0aGlzLm51bWJlclByb3BlcnR5LnZhbHVlICsgbnVtYmVyT2ZCYXRjaFBhcnRpY2xlcyA8IHRoaXMucmFuZ2VQcm9wZXJ0eS52YWx1ZS5tYXggKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMuYWRkUGFydGljbGVzT25lQXRBVGltZSApIHtcbiAgICAgICAgICAgICAgdGhpcy5udW1iZXJQcm9wZXJ0eS52YWx1ZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIG51bWJlck9mQmF0Y2hQYXJ0aWNsZXMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wdW1waW5nRGlzdGFuY2VBY2N1bXVsYXRpb24gLT0gdGhpcy5wdW1waW5nRGlzdGFuY2VSZXF1aXJlZFRvQWRkUGFydGljbGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIHBhcnRpY2xlcyBpbiBvbmUgYmF0Y2guXG4gICAgaWYgKCAhdGhpcy5hZGRQYXJ0aWNsZXNPbmVBdEFUaW1lICkge1xuICAgICAgdGhpcy5udW1iZXJQcm9wZXJ0eS52YWx1ZSArPSBudW1iZXJPZkJhdGNoUGFydGljbGVzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlck9mQmF0Y2hQYXJ0aWNsZXMgPT09IDAsICd1bmV4cGVjdGVkIGJhdGNoZWQgcGFydGljbGVzJyApO1xuICAgIH1cblxuICAgIHRoaXMubGFzdEhhbmRsZVBvc2l0aW9uID0gbmV3SGFuZGxlUG9zaXRpb247XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCaWN5Y2xlUHVtcE5vZGUnLCBCaWN5Y2xlUHVtcE5vZGUgKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDaXJjbGUiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIlBhaW50Q29sb3JQcm9wZXJ0eSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJTY2VuZXJ5Q29uc3RhbnRzIiwiVGFuZGVtIiwic2NlbmVyeVBoZXQiLCJTZWdtZW50ZWRCYXJHcmFwaE5vZGUiLCJTb3VuZERyYWdMaXN0ZW5lciIsIlNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJQVU1QX0JBU0VfV0lEVEhfUFJPUE9SVElPTiIsIlBVTVBfQkFTRV9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfQk9EWV9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfQk9EWV9XSURUSF9QUk9QT1JUSU9OIiwiUFVNUF9TSEFGVF9XSURUSF9QUk9QT1JUSU9OIiwiUFVNUF9TSEFGVF9IRUlHSFRfUFJPUE9SVElPTiIsIlBVTVBfSEFORExFX0hFSUdIVF9QUk9QT1JUSU9OIiwiQ09ORV9IRUlHSFRfUFJPUE9SVElPTiIsIkhPU0VfQ09OTkVDVE9SX0hFSUdIVF9QUk9QT1JUSU9OIiwiSE9TRV9DT05ORUNUT1JfV0lEVEhfUFJPUE9SVElPTiIsIlNIQUZUX09QRU5JTkdfVElMVF9GQUNUT1IiLCJCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1giLCJCT0RZX1RPX0hPU0VfQVRUQUNIX1BPSU5UX1kiLCJCaWN5Y2xlUHVtcE5vZGUiLCJzZXRQdW1wSGFuZGxlVG9Jbml0aWFsUG9zaXRpb24iLCJwdW1wSGFuZGxlTm9kZSIsImJvdHRvbSIsInB1bXBCb2R5Tm9kZSIsInRvcCIsInB1bXBTaGFmdE5vZGUiLCJyZXNldCIsImRyYWdEZWxlZ2F0ZSIsImRpc3Bvc2UiLCJkaXNwb3NlQmljeWNsZVB1bXBOb2RlIiwibnVtYmVyUHJvcGVydHkiLCJyYW5nZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsIndpZHRoIiwiaGVpZ2h0IiwiaGFuZGxlRmlsbCIsInNoYWZ0RmlsbCIsImJvZHlGaWxsIiwiYm9keVRvcEZpbGwiLCJpbmRpY2F0b3JCYWNrZ3JvdW5kRmlsbCIsImluZGljYXRvclJlbWFpbmluZ0ZpbGwiLCJob3NlRmlsbCIsImJhc2VGaWxsIiwiaG9zZUN1cnZpbmVzcyIsImhvc2VBdHRhY2htZW50T2Zmc2V0Iiwibm9kZUVuYWJsZWRQcm9wZXJ0eSIsImluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eSIsImhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbiIsImhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbiIsImhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbiIsImhhbmRsZU1vdXNlQXJlYVlEaWxhdGlvbiIsImhhbmRsZUN1cnNvciIsIm51bWJlck9mUGFydGljbGVzUGVyUHVtcEFjdGlvbiIsImFkZFBhcnRpY2xlc09uZUF0QVRpbWUiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsIm93bnNFbmFibGVkUHJvcGVydHkiLCJiYXNlV2lkdGgiLCJiYXNlSGVpZ2h0IiwiYmFzZUZpbGxDb2xvclByb3BlcnR5IiwicHVtcEJhc2VOb2RlIiwiY3JlYXRlUHVtcEJhc2VOb2RlIiwicHVtcEJvZHlXaWR0aCIsInB1bXBCb2R5SGVpZ2h0IiwiY29uZUhlaWdodCIsImNvbmVOb2RlIiwiY3JlYXRlQ29uZU5vZGUiLCJib2R5RmlsbENvbG9yUHJvcGVydHkiLCJib2R5RmlsbEJyaWdodGVyQ29sb3JQcm9wZXJ0eSIsImx1bWluYW5jZUZhY3RvciIsImJvZHlGaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSIsImZpbGwiLCJhZGRDb2xvclN0b3AiLCJjZW50ZXJYIiwiYm9keVRvcEZpbGxDb2xvclByb3BlcnR5IiwiYm9keVRvcFN0cm9rZUNvbG9yUHJvcGVydHkiLCJib2R5VG9wQmFja05vZGUiLCJjcmVhdGVCb2R5VG9wSGFsZk5vZGUiLCJib2R5VG9wRnJvbnROb2RlIiwiYm9keUJvdHRvbUNhcE5vZGUiLCJlbGxpcHNlIiwicmVtYWluaW5nQ2FwYWNpdHlJbmRpY2F0b3IiLCJjZW50ZXJZIiwibnVtU2VnbWVudHMiLCJiYWNrZ3JvdW5kQ29sb3IiLCJmdWxseUxpdEluZGljYXRvckNvbG9yIiwiaW5kaWNhdG9ySGVpZ2h0UHJvcG9ydGlvbiIsImhvc2VBdHRhY2hlZE9uUmlnaHQiLCJ4IiwiaG9zZUNvbm5lY3RvcldpZHRoIiwiaG9zZUNvbm5lY3RvckhlaWdodCIsImhvc2VOb2RlIiwibW92ZVRvIiwiY3ViaWNDdXJ2ZVRvIiwieSIsImxpbmVXaWR0aCIsInN0cm9rZSIsImV4dGVybmFsSG9zZUNvbm5lY3RvciIsImNyZWF0ZUhvc2VDb25uZWN0b3JOb2RlIiwic2V0VHJhbnNsYXRpb24iLCJsb2NhbEhvc2VDb25uZWN0b3IiLCJsb2NhbEhvc2VPZmZzZXRYIiwicHVtcFNoYWZ0V2lkdGgiLCJwdW1wU2hhZnRIZWlnaHQiLCJzaGFmdEZpbGxDb2xvclByb3BlcnR5Iiwic2hhZnRTdHJva2VDb2xvclByb3BlcnR5IiwicGlja2FibGUiLCJQdW1wSGFuZGxlTm9kZSIsInB1bXBIYW5kbGVIZWlnaHQiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsIm1vdXNlQXJlYSIsInNjYWxlIiwiZW5hYmxlZExpc3RlbmVyIiwiZW5hYmxlZCIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsImN1cnNvciIsIm9wYWNpdHkiLCJESVNBQkxFRF9PUEFDSVRZIiwibGluayIsIm1heEhhbmRsZVlPZmZzZXQiLCJtaW5IYW5kbGVZT2Zmc2V0IiwiRHJhZ0RlbGVnYXRlIiwiZHJhZ0xpc3RlbmVyIiwiZHJhZyIsImV2ZW50IiwiZHJhZ1Bvc2l0aW9uWSIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJoYW5kbGVQb3NpdGlvbiIsImNsYW1wIiwiaGFuZGxlRHJhZyIsImNyZWF0ZVRhbmRlbSIsImRyYWdMaXN0ZW5lck9wdGlvbnMiLCJhZGRJbnB1dExpc3RlbmVyIiwia2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJrZXlib2FyZERyYWdEaXJlY3Rpb24iLCJkcmFnU3BlZWQiLCJzaGlmdERyYWdTcGVlZCIsImxpc3RlbmVyIiwibW9kZWxEZWx0YSIsImtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyIsImFkZENoaWxkIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJhc3NlcnQiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJoYXNMaXN0ZW5lciIsInVubGluayIsInRvcE9mQmFzZUhlaWdodCIsImhhbGZPZkJhc2VXaWR0aCIsImJhc2VGaWxsQnJpZ2h0ZXJDb2xvclByb3BlcnR5IiwiYmFzZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IiwiYmFzZUZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSIsInRvcE9mQmFzZU5vZGUiLCJwdW1wQmFzZUVkZ2VIZWlnaHQiLCJwdW1wQmFzZVNpZGVFZGdlWUNvbnRyb2xQb2ludCIsInB1bXBCYXNlQm90dG9tRWRnZVhDdXJ2ZVN0YXJ0IiwicHVtcEVkZ2VTaGFwZSIsImxpbmVUbyIsInF1YWRyYXRpY0N1cnZlVG8iLCJjbG9zZSIsInB1bXBFZGdlTm9kZSIsImNoaWxkcmVuIiwic2lnbiIsImJvZHlUb3BTaGFwZSIsImZpbGxCcmlnaHRlckNvbG9yUHJvcGVydHkiLCJmaWxsRGFya2VyQ29sb3JQcm9wZXJ0eSIsImZpbGxEYXJrZXN0Q29sb3JQcm9wZXJ0eSIsImNvbmVUb3BXaWR0aCIsImNvbmVUb3BSYWRpdXNZIiwiY29uZVRvcFJhZGl1c1giLCJjb25lQm90dG9tV2lkdGgiLCJjb25lQm90dG9tUmFkaXVzWSIsImNvbmVCb3R0b21SYWRpdXNYIiwiY29uZVNoYXBlIiwiZWxsaXB0aWNhbEFyYyIsIk1hdGgiLCJQSSIsImNvbmVHcmFkaWVudCIsImNlbnRlclNlY3Rpb25XaWR0aCIsImNlbnRlckN1cnZlV2lkdGgiLCJjZW50ZXJDdXJ2ZUhlaWdodCIsIm51bWJlck9mR3JpcEJ1bXBzIiwiZ3JpcFNpbmdsZUJ1bXBXaWR0aCIsImdyaXBTaW5nbGVCdW1wSGFsZldpZHRoIiwiZ3JpcEludGVyQnVtcFdpZHRoIiwiZ3JpcEVuZEhlaWdodCIsInB1bXBIYW5kbGVTaGFwZSIsImFkZEdyaXBCdW1wIiwic2hhcGUiLCJjb250cm9sUG9pbnRYIiwiY29udHJvbFBvaW50WSIsInF1YWRyYXRpY0N1cnZlVG9SZWxhdGl2ZSIsImxpbmVUb1JlbGF0aXZlIiwiaSIsImhhbmRsZUdyYWRpZW50UG9zaXRpb24iLCJhZGRSZWxhdGl2ZUNvbG9yU3RvcCIsImdyYWRpZW50IiwiZGVsdGFEaXN0YW5jZSIsInRvdGFsRGlzdGFuY2UiLCJjb2xvciIsIm5ld1Bvc2l0aW9uIiwicmF0aW8iLCJwdW1wSGFuZGxlV2lkdGgiLCJib3VuZHMiLCJwdW1wSGFuZGxlR3JhZGllbnQiLCJoYW5kbGVGaWxsQ29sb3JQcm9wZXJ0eSIsImhhbmRsZUZpbGxEYXJrZXJDb2xvclByb3BlcnR5IiwidGFnTmFtZSIsImZvY3VzYWJsZSIsInB1bXBpbmdEaXN0YW5jZUFjY3VtdWxhdGlvbiIsImxhc3RIYW5kbGVQb3NpdGlvbiIsIm5ld0hhbmRsZVBvc2l0aW9uIiwibnVtYmVyT2ZCYXRjaFBhcnRpY2xlcyIsInRyYXZlbERpc3RhbmNlIiwicHVtcGluZ0Rpc3RhbmNlUmVxdWlyZWRUb0FkZFBhcnRpY2xlIiwidmFsdWUiLCJtYXgiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBSS9ELE9BQU9DLFdBQVcsd0JBQXdCO0FBQzFDLE9BQU9DLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRzVFLFNBQVNDLE1BQU0sRUFBRUMsdUJBQXVCLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFlQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFzQkMsU0FBUyxFQUFFQyxnQkFBZ0IsUUFBZ0IsOEJBQThCO0FBQ3BNLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsMkJBQTJCLDZCQUE2QjtBQUMvRCxPQUFPQyx1QkFBcUQseUJBQXlCO0FBQ3JGLE9BQU9DLCtCQUFxRSxpQ0FBaUM7QUFFN0csaUhBQWlIO0FBQ2pILHdDQUF3QztBQUN4QyxNQUFNQyw2QkFBNkI7QUFDbkMsTUFBTUMsOEJBQThCO0FBQ3BDLE1BQU1DLDhCQUE4QjtBQUNwQyxNQUFNQyw2QkFBNkI7QUFDbkMsTUFBTUMsOEJBQThCRCw2QkFBNkI7QUFDakUsTUFBTUUsK0JBQStCSDtBQUNyQyxNQUFNSSxnQ0FBZ0M7QUFDdEMsTUFBTUMseUJBQXlCO0FBQy9CLE1BQU1DLG1DQUFtQztBQUN6QyxNQUFNQyxrQ0FBa0M7QUFDeEMsTUFBTUMsNEJBQTRCO0FBQ2xDLE1BQU1DLDhCQUE4QjtBQUNwQyxNQUFNQyw4QkFBOEIsQ0FBQztBQXVEdEIsSUFBQSxBQUFNQyxrQkFBTixNQUFNQSx3QkFBd0J2QjtJQW9SM0M7O0dBRUMsR0FDRCxBQUFRd0IsaUNBQXVDO1FBQzdDLElBQUksQ0FBQ0MsY0FBYyxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUNDLEdBQUcsR0FBRyxJQUFJLHlCQUF5QjtRQUNsRixJQUFJLENBQUNDLGFBQWEsQ0FBQ0QsR0FBRyxHQUFHLElBQUksQ0FBQ0gsY0FBYyxDQUFDQyxNQUFNO0lBQ3JEO0lBRU9JLFFBQWM7UUFDbkIsSUFBSSxDQUFDTiw4QkFBOEI7UUFDbkMsSUFBSSxDQUFDTyxZQUFZLENBQUNELEtBQUs7SUFDekI7SUFFZ0JFLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msc0JBQXNCO1FBQzNCLEtBQUssQ0FBQ0Q7SUFDUjtJQWxSQTs7OztHQUlDLEdBQ0QsWUFBb0JFLGNBQWlDLEVBQ2pDQyxhQUF1QyxFQUN2Q0MsZUFBd0MsQ0FBRztZQXlPbkRDLHNDQUFBQSxzQkFBQUE7UUF2T1YsTUFBTUMsVUFBVTNDLFlBQWtJO1lBRWhKLGNBQWM7WUFDZDRDLE9BQU87WUFDUEMsUUFBUTtZQUNSQyxZQUFZO1lBQ1pDLFdBQVc7WUFDWEMsVUFBVTtZQUNWQyxhQUFhO1lBQ2JDLHlCQUF5QjtZQUN6QkMsd0JBQXdCO1lBQ3hCQyxVQUFVO1lBQ1ZDLFVBQVU7WUFDVkMsZUFBZTtZQUNmQyxzQkFBc0IsSUFBSTFELFFBQVMsS0FBSztZQUN4QzJELHFCQUFxQjtZQUNyQkMsMEJBQTBCLElBQUk5RCxnQkFBaUI7WUFDL0MrRCwwQkFBMEI7WUFDMUJDLDBCQUEwQjtZQUMxQkMsMEJBQTBCO1lBQzFCQywwQkFBMEI7WUFDMUJDLGNBQWM7WUFDZEMsZ0NBQWdDO1lBQ2hDQyx3QkFBd0I7WUFFeEIsY0FBYztZQUNkQyxRQUFRdkQsT0FBT3dELFFBQVE7WUFDdkJDLGtCQUFrQjtZQUNsQkMsd0NBQXdDO1FBQzFDLEdBQUczQjtRQUVILE1BQU1HLFFBQVFELFFBQVFDLEtBQUs7UUFDM0IsTUFBTUMsU0FBU0YsUUFBUUUsTUFBTTtRQUU3QixLQUFLLENBQUVGO1FBRVAsOENBQThDO1FBQzlDLE1BQU0wQixzQkFBc0IsQ0FBQzFCLFFBQVFhLG1CQUFtQjtRQUV4RCxJQUFJLENBQUNBLG1CQUFtQixHQUFHYixRQUFRYSxtQkFBbUIsSUFBSSxJQUFJN0QsZ0JBQWlCO1FBRS9FLElBQUksQ0FBQzRELG9CQUFvQixHQUFHWixRQUFRWSxvQkFBb0I7UUFFeEQsOEJBQThCO1FBQzlCLE1BQU1lLFlBQVkxQixRQUFRN0I7UUFDMUIsTUFBTXdELGFBQWExQixTQUFTN0I7UUFDNUIsTUFBTXdELHdCQUF3QixJQUFJbEUsbUJBQW9CcUMsUUFBUVUsUUFBUTtRQUN0RSxNQUFNb0IsZUFBZUMsbUJBQW9CSixXQUFXQyxZQUFZQztRQUVoRSxrQ0FBa0M7UUFDbEMsTUFBTUcsZ0JBQWdCL0IsUUFBUTFCO1FBQzlCLE1BQU0wRCxpQkFBaUIvQixTQUFTNUI7UUFFaEMsa0JBQWtCO1FBQ2xCLE1BQU00RCxhQUFhaEMsU0FBU3ZCO1FBQzVCLE1BQU13RCxXQUFXQyxlQUFnQkosZUFBZUUsWUFBWUw7UUFDNURNLFNBQVMvQyxNQUFNLEdBQUcwQyxhQUFheEMsR0FBRyxHQUFHO1FBRXJDLG1FQUFtRTtRQUNuRSxNQUFNK0Msd0JBQXdCLElBQUkxRSxtQkFBb0JxQyxRQUFRSyxRQUFRO1FBQ3RFLE1BQU1pQyxnQ0FBZ0MsSUFBSTNFLG1CQUFvQjBFLHVCQUF1QjtZQUFFRSxpQkFBaUI7UUFBSTtRQUM1RyxNQUFNQyw4QkFBOEIsSUFBSTdFLG1CQUFvQjBFLHVCQUF1QjtZQUFFRSxpQkFBaUIsQ0FBQztRQUFJO1FBRTNHLElBQUksQ0FBQ2xELFlBQVksR0FBRyxJQUFJeEIsVUFBVyxHQUFHLEdBQUdtRSxlQUFlQyxnQkFBZ0IsR0FBRyxHQUFHO1lBQzVFUSxNQUFNLElBQUloRixlQUFnQixHQUFHLEdBQUd1RSxlQUFlLEdBQzVDVSxZQUFZLENBQUUsR0FBR0osK0JBQ2pCSSxZQUFZLENBQUUsS0FBS0wsdUJBQ25CSyxZQUFZLENBQUUsS0FBS0Y7UUFDeEI7UUFDQSxJQUFJLENBQUNuRCxZQUFZLENBQUNzRCxPQUFPLEdBQUdSLFNBQVNRLE9BQU87UUFDNUMsSUFBSSxDQUFDdEQsWUFBWSxDQUFDRCxNQUFNLEdBQUcrQyxTQUFTN0MsR0FBRyxHQUFHO1FBRTFDLG1FQUFtRTtRQUNuRSxNQUFNc0QsMkJBQTJCLElBQUlqRixtQkFBb0JxQyxRQUFRTSxXQUFXO1FBQzVFLE1BQU11Qyw2QkFBNkIsSUFBSWxGLG1CQUFvQmlGLDBCQUEwQjtZQUFFTCxpQkFBaUIsQ0FBQztRQUFJO1FBRTdHLDhDQUE4QztRQUM5QyxNQUFNTyxrQkFBa0JDLHNCQUF1QmYsZUFBZSxDQUFDLEdBQUdZLDBCQUEwQkM7UUFDNUZDLGdCQUFnQkgsT0FBTyxHQUFHLElBQUksQ0FBQ3RELFlBQVksQ0FBQ3NELE9BQU87UUFDbkRHLGdCQUFnQjFELE1BQU0sR0FBRyxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsR0FBRztRQUU5QywrQ0FBK0M7UUFDL0MsTUFBTTBELG1CQUFtQkQsc0JBQXVCZixlQUFlLEdBQUdZLDBCQUEwQkM7UUFDNUZHLGlCQUFpQkwsT0FBTyxHQUFHLElBQUksQ0FBQ3RELFlBQVksQ0FBQ3NELE9BQU87UUFDcERLLGlCQUFpQjFELEdBQUcsR0FBR3dELGdCQUFnQjFELE1BQU0sR0FBRyxLQUFLLDJEQUEyRDtRQUVoSCxvQ0FBb0M7UUFDcEMsTUFBTTZELG9CQUFvQixJQUFJckYsS0FBTSxJQUFJVCxRQUFRK0YsT0FBTyxDQUFFLEdBQUcsR0FBR0YsaUJBQWlCL0MsS0FBSyxHQUFHLE1BQU0sR0FBRyxJQUFLO1lBQ3BHd0MsTUFBTSxJQUFJOUUsbUJBQW9Ca0UsdUJBQXVCO2dCQUFFVSxpQkFBaUIsQ0FBQztZQUFJO1lBQzdFSSxTQUFTSyxpQkFBaUJMLE9BQU87WUFDakN2RCxRQUFRK0MsU0FBUzdDLEdBQUcsR0FBRztRQUN6QjtRQUVBLHVFQUF1RTtRQUN2RSxNQUFNNkQsNkJBQTZCLElBQUlsRixzQkFBdUIyQixnQkFBZ0JDLGVBQWU7WUFDekZJLE9BQU8rQixnQkFBZ0I7WUFDdkI5QixRQUFRK0IsaUJBQWlCO1lBQ3pCVSxTQUFTLElBQUksQ0FBQ3RELFlBQVksQ0FBQ3NELE9BQU87WUFDbENTLFNBQVMsQUFBRSxDQUFBLElBQUksQ0FBQy9ELFlBQVksQ0FBQ0MsR0FBRyxHQUFHNkMsU0FBUzdDLEdBQUcsQUFBRCxJQUFNO1lBQ3BEK0QsYUFBYTtZQUNiQyxpQkFBaUJ0RCxRQUFRTyx1QkFBdUI7WUFDaERnRCx3QkFBd0J2RCxRQUFRUSxzQkFBc0I7WUFDdERnRCwyQkFBMkI7UUFDN0I7UUFHRixpRkFBaUY7UUFDakYsTUFBTUMsc0JBQXNCekQsUUFBUVksb0JBQW9CLENBQUM4QyxDQUFDLEdBQUc7UUFDN0QsTUFBTUMscUJBQXFCMUQsUUFBUXBCO1FBQ25DLE1BQU0rRSxzQkFBc0IxRCxTQUFTdEI7UUFFckMsa0JBQWtCO1FBQ2xCLE1BQU1pRixXQUFXLElBQUlqRyxLQUFNLElBQUlULFFBQzVCMkcsTUFBTSxDQUFFTCxzQkFBc0IxRSw4QkFBOEIsQ0FBQ0EsNkJBQzVEQyw2QkFDRCtFLFlBQVksQ0FBRS9ELFFBQVFXLGFBQWEsR0FBS1gsQ0FBQUEsUUFBUVksb0JBQW9CLENBQUM4QyxDQUFDLEdBQUczRSwyQkFBMEIsR0FDbEdDLDZCQUNBLEdBQUdnQixRQUFRWSxvQkFBb0IsQ0FBQ29ELENBQUMsRUFDakNoRSxRQUFRWSxvQkFBb0IsQ0FBQzhDLENBQUMsR0FBS0QsQ0FBQUEsc0JBQXNCRSxxQkFBcUIsQ0FBQ0Esa0JBQWlCLEdBQ2hHM0QsUUFBUVksb0JBQW9CLENBQUNvRCxDQUFDLEdBQUk7WUFDcENDLFdBQVc7WUFDWEMsUUFBUWxFLFFBQVFTLFFBQVE7UUFDMUI7UUFFQSxtRkFBbUY7UUFDbkYsTUFBTTBELHdCQUF3QkMsd0JBQXlCVCxvQkFBb0JDLHFCQUFxQi9CO1FBQ2hHc0Msc0JBQXNCRSxjQUFjLENBQ2xDWixzQkFBc0J6RCxRQUFRWSxvQkFBb0IsQ0FBQzhDLENBQUMsR0FBR1Msc0JBQXNCbEUsS0FBSyxHQUFHRCxRQUFRWSxvQkFBb0IsQ0FBQzhDLENBQUMsRUFDbkgxRCxRQUFRWSxvQkFBb0IsQ0FBQ29ELENBQUMsR0FBR0csc0JBQXNCakUsTUFBTSxHQUFHO1FBR2xFLHVFQUF1RTtRQUN2RSxNQUFNb0UscUJBQXFCRix3QkFBeUJULG9CQUFvQkMscUJBQXFCL0I7UUFDN0YsTUFBTTBDLG1CQUFtQmQsc0JBQXNCMUUsOEJBQThCLENBQUNBO1FBQzlFdUYsbUJBQW1CRCxjQUFjLENBQy9CRSxtQkFBbUJaLHFCQUFxQixHQUN4QzNFLDhCQUE4QnNGLG1CQUFtQnBFLE1BQU0sR0FBRztRQUc1RCw0QkFBNEI7UUFDNUIsTUFBTXNFLGlCQUFpQnZFLFFBQVF6QjtRQUMvQixNQUFNaUcsa0JBQWtCdkUsU0FBU3pCO1FBRWpDLG1FQUFtRTtRQUNuRSxNQUFNaUcseUJBQXlCLElBQUkvRyxtQkFBb0JxQyxRQUFRSSxTQUFTO1FBQ3hFLE1BQU11RSwyQkFBMkIsSUFBSWhILG1CQUFvQitHLHdCQUF3QjtZQUFFbkMsaUJBQWlCLENBQUM7UUFBSztRQUUxRyxnRkFBZ0Y7UUFDaEYsSUFBSSxDQUFDaEQsYUFBYSxHQUFHLElBQUkxQixVQUFXLEdBQUcsR0FBRzJHLGdCQUFnQkMsaUJBQWlCO1lBQ3pFaEMsTUFBTWlDO1lBQ05SLFFBQVFTO1lBQ1JDLFVBQVU7UUFDWjtRQUNBLElBQUksQ0FBQ3JGLGFBQWEsQ0FBQ21FLENBQUMsR0FBRyxDQUFDYyxpQkFBaUI7UUFFekMsZ0NBQWdDO1FBQ2hDLElBQUksQ0FBQ3JGLGNBQWMsR0FBRyxJQUFJMEYsZUFBZ0I3RSxRQUFRRyxVQUFVO1FBQzVELE1BQU0yRSxtQkFBbUI1RSxTQUFTeEI7UUFDbEMsSUFBSSxDQUFDUyxjQUFjLENBQUM0RixTQUFTLEdBQzNCLElBQUksQ0FBQzVGLGNBQWMsQ0FBQzZGLFdBQVcsQ0FBQ0MsU0FBUyxDQUFFakYsUUFBUWUsd0JBQXdCLEVBQUVmLFFBQVFnQix3QkFBd0I7UUFDL0csSUFBSSxDQUFDN0IsY0FBYyxDQUFDK0YsU0FBUyxHQUMzQixJQUFJLENBQUMvRixjQUFjLENBQUM2RixXQUFXLENBQUNDLFNBQVMsQ0FBRWpGLFFBQVFpQix3QkFBd0IsRUFBRWpCLFFBQVFrQix3QkFBd0I7UUFDL0csSUFBSSxDQUFDL0IsY0FBYyxDQUFDZ0csS0FBSyxDQUFFTCxtQkFBbUIsSUFBSSxDQUFDM0YsY0FBYyxDQUFDZSxNQUFNO1FBQ3hFLElBQUksQ0FBQ2hCLDhCQUE4QjtRQUVuQyx3REFBd0Q7UUFDeEQsTUFBTWtHLGtCQUFrQixDQUFFQztZQUN4QixJQUFJLENBQUNsRyxjQUFjLENBQUNtRyxxQkFBcUI7WUFDekMsSUFBSSxDQUFDbkcsY0FBYyxDQUFDeUYsUUFBUSxHQUFHUztZQUMvQixJQUFJLENBQUNsRyxjQUFjLENBQUNvRyxNQUFNLEdBQUdGLFVBQVVyRixRQUFRbUIsWUFBWSxHQUFHO1lBQzlELElBQUksQ0FBQ2hDLGNBQWMsQ0FBQ3FHLE9BQU8sR0FBR0gsVUFBVSxJQUFJdkgsaUJBQWlCMkgsZ0JBQWdCO1lBQzdFLElBQUksQ0FBQ2xHLGFBQWEsQ0FBQ2lHLE9BQU8sR0FBR0gsVUFBVSxJQUFJdkgsaUJBQWlCMkgsZ0JBQWdCO1FBQzlFO1FBQ0EsSUFBSSxDQUFDNUUsbUJBQW1CLENBQUM2RSxJQUFJLENBQUVOO1FBRS9CLDBEQUEwRDtRQUMxRCxNQUFNTyxtQkFBbUIsSUFBSSxDQUFDeEcsY0FBYyxDQUFDaUUsT0FBTztRQUNwRCxNQUFNd0MsbUJBQW1CRCxtQkFBcUIsQ0FBQ2xILCtCQUErQndEO1FBRTlFLElBQUksQ0FBQ3hDLFlBQVksR0FBRyxJQUFJb0csYUFBY2pHLGdCQUFnQkMsZUFBZSxJQUFJLENBQUNnQixtQkFBbUIsRUFDM0ZiLFFBQVFjLHdCQUF3QixFQUFFOEUsa0JBQWtCRCxrQkFBa0IsSUFBSSxDQUFDeEcsY0FBYyxFQUFFLElBQUksQ0FBQ0ksYUFBYSxFQUFFO1lBQzdHNkIsZ0NBQWdDcEIsUUFBUW9CLDhCQUE4QjtZQUN0RUMsd0JBQXdCckIsUUFBUXFCLHNCQUFzQjtRQUN4RDtRQUVGLDBDQUEwQztRQUMxQyxJQUFJLENBQUN5RSxZQUFZLEdBQUcsSUFBSTVILGtCQUFtQlosZUFBMEM7WUFDbkZ5SSxNQUFNLENBQUVDO2dCQUVOLG1FQUFtRTtnQkFDbkUsTUFBTUMsZ0JBQWdCLElBQUksQ0FBQzlHLGNBQWMsQ0FBQytHLG1CQUFtQixDQUFFRixNQUFNRyxPQUFPLENBQUNDLEtBQUssRUFBR3BDLENBQUM7Z0JBQ3RGLE1BQU1xQyxpQkFBaUJwSixNQUFNcUosS0FBSyxDQUFFTCxlQUFlTCxrQkFBa0JEO2dCQUNyRSxJQUFJLENBQUNsRyxZQUFZLENBQUM4RyxVQUFVLENBQUVGO1lBQ2hDO1lBQ0EvRSxRQUFRdEIsUUFBUXNCLE1BQU0sQ0FBQ2tGLFlBQVksQ0FBRTtRQUN2QyxHQUFHeEcsUUFBUXlHLG1CQUFtQjtRQUM5QixJQUFJLENBQUN0SCxjQUFjLENBQUN1SCxnQkFBZ0IsQ0FBRSxJQUFJLENBQUNaLFlBQVk7UUFFdkQsMkNBQTJDO1FBQzNDLElBQUksQ0FBQ2Esb0JBQW9CLEdBQUcsSUFBSXhJLDBCQUEyQmIsZUFBa0Q7WUFDM0dzSix1QkFBdUI7WUFDdkJDLFdBQVc7WUFDWEMsZ0JBQWdCO1lBQ2hCZixNQUFNLENBQUVDLE9BQU9lO2dCQUNiLE1BQU1WLGlCQUFpQnBKLE1BQU1xSixLQUFLLENBQUUsSUFBSSxDQUFDbkgsY0FBYyxDQUFDaUUsT0FBTyxHQUFHMkQsU0FBU0MsVUFBVSxDQUFDaEQsQ0FBQyxFQUFFNEIsa0JBQWtCRDtnQkFDM0csSUFBSSxDQUFDbEcsWUFBWSxDQUFDOEcsVUFBVSxDQUFFRjtZQUNoQztZQUNBL0UsUUFBUXRCLFFBQVFzQixNQUFNLENBQUNrRixZQUFZLENBQUU7UUFDdkMsR0FBR3hHLFFBQVFpSCwyQkFBMkI7UUFDdEMsSUFBSSxDQUFDOUgsY0FBYyxDQUFDdUgsZ0JBQWdCLENBQUUsSUFBSSxDQUFDQyxvQkFBb0I7UUFFL0QsMkNBQTJDO1FBQzNDLElBQUksQ0FBQ08sUUFBUSxDQUFFcEY7UUFDZixJQUFJLENBQUNvRixRQUFRLENBQUVwRTtRQUNmLElBQUksQ0FBQ29FLFFBQVEsQ0FBRWpFO1FBQ2YsSUFBSSxDQUFDaUUsUUFBUSxDQUFFLElBQUksQ0FBQzNILGFBQWE7UUFDakMsSUFBSSxDQUFDMkgsUUFBUSxDQUFFLElBQUksQ0FBQy9ILGNBQWM7UUFDbEMsSUFBSSxDQUFDK0gsUUFBUSxDQUFFLElBQUksQ0FBQzdILFlBQVk7UUFDaEMsSUFBSSxDQUFDNkgsUUFBUSxDQUFFL0Q7UUFDZixJQUFJLENBQUMrRCxRQUFRLENBQUVsRTtRQUNmLElBQUksQ0FBQ2tFLFFBQVEsQ0FBRS9FO1FBQ2YsSUFBSSxDQUFDK0UsUUFBUSxDQUFFckQ7UUFDZixJQUFJLENBQUNxRCxRQUFRLENBQUUvQztRQUNmLElBQUksQ0FBQytDLFFBQVEsQ0FBRTVDO1FBRWYsNERBQTREO1FBQzVELElBQUs2QyxLQUFLQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsR0FBRyxFQUFHO1lBQ3RDLElBQUksQ0FBQ0osUUFBUSxDQUFFLElBQUkzSixPQUFRLEdBQUc7Z0JBQUVrRixNQUFNO1lBQU07UUFDOUM7UUFFQSxtR0FBbUc7UUFDbkc4RSxZQUFVeEgsZUFBQUEsT0FBT29ILElBQUksc0JBQVhwSCx1QkFBQUEsYUFBYXFILE9BQU8sc0JBQXBCckgsdUNBQUFBLHFCQUFzQnNILGVBQWUscUJBQXJDdEgscUNBQXVDeUgsTUFBTSxLQUFJcEssaUJBQWlCcUssZUFBZSxDQUFFLGdCQUFnQixtQkFBbUIsSUFBSTtRQUVwSSxJQUFJLENBQUM5SCxzQkFBc0IsR0FBRztZQUU1QiwyRUFBMkU7WUFDM0UsSUFBSSxDQUFDbUcsWUFBWSxDQUFDcEcsT0FBTztZQUN6QixJQUFJLENBQUNpSCxvQkFBb0IsQ0FBQ2pILE9BQU87WUFFakMsNEdBQTRHO1lBQzVHLElBQUtnQyxxQkFBc0I7Z0JBQ3pCLElBQUksQ0FBQ2IsbUJBQW1CLENBQUNuQixPQUFPO1lBQ2xDLE9BQ0ssSUFBSyxJQUFJLENBQUNtQixtQkFBbUIsQ0FBQzZHLFdBQVcsQ0FBRXRDLGtCQUFvQjtnQkFDbEUsSUFBSSxDQUFDdkUsbUJBQW1CLENBQUM4RyxNQUFNLENBQUV2QztZQUNuQztRQUNGO0lBQ0Y7QUFtQkY7QUFyU0EsU0FBcUJuRyw2QkFxU3BCO0FBRUQ7Ozs7OztDQU1DLEdBQ0QsU0FBUzhDLG1CQUFvQjlCLEtBQWEsRUFBRUMsTUFBYyxFQUFFdUMsSUFBWTtJQUV0RSxzRUFBc0U7SUFDdEUsTUFBTW1GLGtCQUFrQjFILFNBQVM7SUFDakMsTUFBTTJILGtCQUFrQjVILFFBQVE7SUFFaEMsbUVBQW1FO0lBQ25FLE1BQU02SCxnQ0FBZ0MsSUFBSW5LLG1CQUFvQjhFLE1BQU07UUFBRUYsaUJBQWlCO0lBQUs7SUFDNUYsTUFBTXdGLDhCQUE4QixJQUFJcEssbUJBQW9COEUsTUFBTTtRQUFFRixpQkFBaUIsQ0FBQztJQUFJO0lBQzFGLE1BQU15RiwrQkFBK0IsSUFBSXJLLG1CQUFvQjhFLE1BQU07UUFBRUYsaUJBQWlCLENBQUM7SUFBSTtJQUUzRixnREFBZ0Q7SUFDaEQsTUFBTTBGLGdCQUFnQixJQUFJcEssVUFBVyxDQUFDZ0ssaUJBQWlCLENBQUNELGtCQUFrQixHQUFHM0gsT0FBTzJILGlCQUFpQixJQUFJLElBQUk7UUFDM0duRixNQUFNLElBQUloRixlQUFnQixDQUFDb0ssaUJBQWlCLEdBQUdBLGlCQUFpQixHQUM3RG5GLFlBQVksQ0FBRSxHQUFHb0YsK0JBQ2pCcEYsWUFBWSxDQUFFLEtBQUtELE1BQ25CQyxZQUFZLENBQUUsR0FBR3FGO0lBQ3RCO0lBRUEsTUFBTUcscUJBQXFCaEksU0FBUztJQUNwQyxNQUFNaUksZ0NBQWdDRCxxQkFBcUI7SUFDM0QsTUFBTUUsZ0NBQWdDbkksUUFBUTtJQUU5QyxnRkFBZ0Y7SUFDaEYsTUFBTW9JLGdCQUFnQixJQUFJbEwsUUFDdkJtTCxNQUFNLENBQUUsQ0FBQ1QsaUJBQWlCLEdBQzFCUyxNQUFNLENBQUUsQ0FBQ1QsaUJBQWlCSyxxQkFBcUIsR0FDL0NLLGdCQUFnQixDQUFFLENBQUNWLGlCQUFpQk0sK0JBQStCLENBQUNDLCtCQUErQkYsb0JBQ25HSSxNQUFNLENBQUVGLCtCQUErQkYsb0JBQ3ZDSyxnQkFBZ0IsQ0FBRVYsaUJBQWlCTSwrQkFBK0JOLGlCQUFpQksscUJBQXFCLEdBQ3hHSSxNQUFNLENBQUVULGlCQUFpQixHQUN6QlcsS0FBSztJQUVSLHdDQUF3QztJQUN4QyxNQUFNQyxlQUFlLElBQUk3SyxLQUFNeUssZUFBZTtRQUM1QzVGLE1BQU0sSUFBSWhGLGVBQWdCLENBQUNvSyxpQkFBaUIsR0FBR0EsaUJBQWlCLEdBQzdEbkYsWUFBWSxDQUFFLEdBQUdzRiw4QkFDakJ0RixZQUFZLENBQUUsTUFBTXFGLDZCQUNwQnJGLFlBQVksQ0FBRSxHQUFHc0Y7SUFDdEI7SUFFQVMsYUFBYXJGLE9BQU8sR0FBRyxDQUFDcUYsYUFBYXZJLE1BQU0sR0FBRztJQUU5QyxrREFBa0Q7SUFDbEQrSCxjQUFjN0ksTUFBTSxHQUFHcUosYUFBYXJKLE1BQU0sR0FBRzhJLHFCQUFxQixJQUFJO0lBQ3RFLE9BQU8sSUFBSXhLLEtBQU07UUFBRWdMLFVBQVU7WUFBRUQ7WUFBY1I7U0FBZTtJQUFDO0FBQy9EO0FBRUE7OztDQUdDLEdBQ0QsU0FBU2xGLHNCQUF1QjlDLEtBQWEsRUFBRTBJLElBQVksRUFBRWxHLElBQVksRUFBRXlCLE1BQWM7SUFDdkYsTUFBTTBFLGVBQWUsSUFBSXpMLFFBQ3RCMkcsTUFBTSxDQUFFLEdBQUcsR0FDWEMsWUFBWSxDQUNYLEdBQ0E0RSxPQUFPMUksUUFBUW5CLDJCQUNmbUIsT0FDQTBJLE9BQU8xSSxRQUFRbkIsMkJBQ2ZtQixPQUNBO0lBR0osT0FBTyxJQUFJckMsS0FBTWdMLGNBQWM7UUFDN0JuRyxNQUFNQTtRQUNOeUIsUUFBUUE7SUFDVjtBQUNGO0FBRUE7O0NBRUMsR0FDRCxTQUFTRSx3QkFBeUJuRSxLQUFhLEVBQUVDLE1BQWMsRUFBRXVDLElBQVk7SUFFM0UsbUVBQW1FO0lBQ25FLE1BQU1vRyw0QkFBNEIsSUFBSWxMLG1CQUFvQjhFLE1BQU07UUFBRUYsaUJBQWlCO0lBQUk7SUFDdkYsTUFBTXVHLDBCQUEwQixJQUFJbkwsbUJBQW9COEUsTUFBTTtRQUFFRixpQkFBaUIsQ0FBQztJQUFJO0lBQ3RGLE1BQU13RywyQkFBMkIsSUFBSXBMLG1CQUFvQjhFLE1BQU07UUFBRUYsaUJBQWlCLENBQUM7SUFBSTtJQUV2RixPQUFPLElBQUkxRSxVQUFXLEdBQUcsR0FBR29DLE9BQU9DLFFBQVEsR0FBRyxHQUFHO1FBQy9DdUMsTUFBTSxJQUFJaEYsZUFBZ0IsR0FBRyxHQUFHLEdBQUd5QyxRQUNoQ3dDLFlBQVksQ0FBRSxHQUFHb0cseUJBQ2pCcEcsWUFBWSxDQUFFLEtBQUtELE1BQ25CQyxZQUFZLENBQUUsTUFBTW1HLDJCQUNwQm5HLFlBQVksQ0FBRSxLQUFLbUcsMkJBQ25CbkcsWUFBWSxDQUFFLEdBQUdxRztJQUN0QjtBQUNGO0FBRUE7Ozs7O0NBS0MsR0FDRCxTQUFTM0csZUFBZ0JKLGFBQXFCLEVBQUU5QixNQUFjLEVBQUV1QyxJQUFZO0lBQzFFLE1BQU11RyxlQUFlaEgsZ0JBQWdCO0lBQ3JDLE1BQU1pSCxpQkFBaUI7SUFDdkIsTUFBTUMsaUJBQWlCRixlQUFlO0lBQ3RDLE1BQU1HLGtCQUFrQm5ILGdCQUFnQjtJQUN4QyxNQUFNb0gsb0JBQW9CO0lBQzFCLE1BQU1DLG9CQUFvQkYsa0JBQWtCO0lBRTVDLE1BQU1HLFlBQVksSUFBSW5NLE9BRXBCLHVFQUF1RTtLQUN0RW9NLGFBQWEsQ0FBRSxHQUFHLEdBQUdMLGdCQUFnQkQsZ0JBQWdCLEdBQUcsR0FBR08sS0FBS0MsRUFBRSxFQUFFLE9BQ3BFbkIsTUFBTSxDQUFFLENBQUNlLG1CQUFtQm5KLFFBQVMsc0NBQXNDO0lBRTVFLG9DQUFvQztLQUNuQ3FKLGFBQWEsQ0FBRSxHQUFHckosUUFBUW1KLG1CQUFtQkQsbUJBQW1CLEdBQUdJLEtBQUtDLEVBQUUsRUFBRSxHQUFHLE1BQy9FbkIsTUFBTSxDQUFFWSxnQkFBZ0IsSUFBSyxzQ0FBc0M7SUFFdEUsbUVBQW1FO0lBQ25FLE1BQU1MLDRCQUE0QixJQUFJbEwsbUJBQW9COEUsTUFBTTtRQUFFRixpQkFBaUI7SUFBSTtJQUN2RixNQUFNdUcsMEJBQTBCLElBQUluTCxtQkFBb0I4RSxNQUFNO1FBQUVGLGlCQUFpQixDQUFDO0lBQUk7SUFDdEYsTUFBTXdHLDJCQUEyQixJQUFJcEwsbUJBQW9COEUsTUFBTTtRQUFFRixpQkFBaUIsQ0FBQztJQUFJO0lBRXZGLE1BQU1tSCxlQUFlLElBQUlqTSxlQUFnQixDQUFDMEwsa0JBQWtCLEdBQUcsR0FBR0Esa0JBQWtCLEdBQUcsR0FDcEZ6RyxZQUFZLENBQUUsR0FBR29HLHlCQUNqQnBHLFlBQVksQ0FBRSxLQUFLRCxNQUNuQkMsWUFBWSxDQUFFLE1BQU1tRywyQkFDcEJuRyxZQUFZLENBQUUsTUFBTW1HLDJCQUNwQm5HLFlBQVksQ0FBRSxLQUFLRCxNQUNuQkMsWUFBWSxDQUFFLEdBQUdxRztJQUVwQixPQUFPLElBQUluTCxLQUFNMEwsV0FBVztRQUMxQjdHLE1BQU1pSDtJQUNSO0FBQ0Y7QUFFQTs7Q0FFQyxHQUNELElBQUEsQUFBTTdFLGlCQUFOLE1BQU1BLHVCQUF1QnJILHdCQUF5Qkk7SUFDcEQsWUFBb0I2RSxJQUFZLENBQUc7UUFFakMsbUNBQW1DO1FBQ25DLE1BQU1rSCxxQkFBcUI7UUFDM0IsTUFBTUMsbUJBQW1CO1FBQ3pCLE1BQU1DLG9CQUFvQjtRQUMxQixNQUFNQyxvQkFBb0I7UUFDMUIsTUFBTUMsc0JBQXNCO1FBQzVCLE1BQU1DLDBCQUEwQkQsc0JBQXNCO1FBQ3RELE1BQU1FLHFCQUFxQkYsc0JBQXNCO1FBQ2pELE1BQU1HLGdCQUFnQjtRQUV0QiwyRUFBMkU7UUFDM0UsTUFBTUMsa0JBQWtCLElBQUloTixRQUFRMkcsTUFBTSxDQUFFLEdBQUc7UUFFL0M7Ozs7S0FJQyxHQUNELE1BQU1zRyxjQUFjLENBQUVDLE9BQWMxQjtZQUVsQyxtREFBbUQ7WUFDbkQsTUFBTTJCLGdCQUFnQlAsc0JBQXNCO1lBQzVDLE1BQU1RLGdCQUFnQlIsc0JBQXNCO1lBRTVDLHNCQUFzQjtZQUN0Qk0sTUFBTUcsd0JBQXdCLENBQzVCN0IsT0FBTzJCLGVBQ1AzQixPQUFPNEIsZUFDUDVCLE9BQU9vQixxQkFDUDtRQUNKO1FBRUEsc0dBQXNHO1FBQ3RHSSxnQkFBZ0JNLGNBQWMsQ0FBRWQscUJBQXFCLEdBQUc7UUFDeERRLGdCQUFnQkssd0JBQXdCLENBQUVaLG1CQUFtQixHQUFHLEdBQUdBLGtCQUFrQixDQUFDQztRQUN0Rk0sZ0JBQWdCTSxjQUFjLENBQUVSLG9CQUFvQjtRQUNwRCxJQUFNLElBQUlTLElBQUksR0FBR0EsSUFBSVosb0JBQW9CLEdBQUdZLElBQU07WUFDaEROLFlBQWFELGlCQUFpQjtZQUM5QkEsZ0JBQWdCTSxjQUFjLENBQUVSLG9CQUFvQjtRQUN0RDtRQUNBRyxZQUFhRCxpQkFBaUI7UUFFOUIsdUNBQXVDO1FBQ3ZDQSxnQkFBZ0JNLGNBQWMsQ0FBRSxHQUFHLENBQUNQO1FBRXBDLDRFQUE0RTtRQUM1RSxJQUFNLElBQUlRLElBQUksR0FBR0EsSUFBSVosbUJBQW1CWSxJQUFNO1lBQzVDTixZQUFhRCxpQkFBaUIsQ0FBQztZQUMvQkEsZ0JBQWdCTSxjQUFjLENBQUUsQ0FBQ1Isb0JBQW9CO1FBQ3ZEO1FBRUEsaURBQWlEO1FBQ2pERSxnQkFBZ0JLLHdCQUF3QixDQUFFLENBQUNaLG1CQUFtQixHQUFHLENBQUNDLG1CQUFtQixDQUFDRCxrQkFBa0IsQ0FBQ0M7UUFDekdNLGdCQUFnQk0sY0FBYyxDQUFFLENBQUNkLG9CQUFvQjtRQUNyRFEsZ0JBQWdCSyx3QkFBd0IsQ0FBRSxDQUFDWixtQkFBbUIsR0FBRyxHQUFHLENBQUNBLGtCQUFrQkM7UUFDdkZNLGdCQUFnQk0sY0FBYyxDQUFFLENBQUNSLG9CQUFvQjtRQUVyRCwyRUFBMkU7UUFDM0UsSUFBTSxJQUFJUyxJQUFJLEdBQUdBLElBQUlaLG9CQUFvQixHQUFHWSxJQUFNO1lBQ2hETixZQUFhRCxpQkFBaUIsQ0FBQztZQUMvQkEsZ0JBQWdCTSxjQUFjLENBQUUsQ0FBQ1Isb0JBQW9CO1FBQ3ZEO1FBQ0FHLFlBQWFELGlCQUFpQixDQUFDO1FBRS9CLHNDQUFzQztRQUN0Q0EsZ0JBQWdCTSxjQUFjLENBQUUsR0FBR1A7UUFFbkMscUdBQXFHO1FBQ3JHLElBQU0sSUFBSVEsSUFBSSxHQUFHQSxJQUFJWixtQkFBbUJZLElBQU07WUFDNUNOLFlBQWFELGlCQUFpQjtZQUM5QkEsZ0JBQWdCTSxjQUFjLENBQUVSLG9CQUFvQjtRQUN0RDtRQUNBRSxnQkFBZ0JLLHdCQUF3QixDQUFFWixtQkFBbUIsR0FBR0MsbUJBQW1CRCxrQkFBa0JDO1FBQ3JHTSxnQkFBZ0JNLGNBQWMsQ0FBRWQscUJBQXFCLEdBQUc7UUFDeERRLGdCQUFnQjNCLEtBQUs7UUFFckIsc0ZBQXNGO1FBQ3RGLElBQUltQyx5QkFBeUI7UUFFN0I7Ozs7OztLQU1DLEdBQ0QsTUFBTUMsdUJBQXVCLENBQUVDLFVBQTBCQyxlQUF1QkMsZUFBdUJDO1lBQ3JHLE1BQU1DLGNBQWNOLHlCQUF5Qkc7WUFDN0MsSUFBSUksUUFBUUQsY0FBY0Y7WUFDMUJHLFFBQVFBLFFBQVEsSUFBSSxJQUFJQTtZQUV4QkwsU0FBU25JLFlBQVksQ0FBRXdJLE9BQU9GO1lBQzlCTCx5QkFBeUJNO1FBQzNCO1FBRUEscUNBQXFDO1FBQ3JDLE1BQU1FLGtCQUFrQmhCLGdCQUFnQmlCLE1BQU0sQ0FBQ25MLEtBQUs7UUFDcEQsTUFBTW9MLHFCQUFxQixJQUFJNU4sZUFBZ0IsQ0FBQzBOLGtCQUFrQixHQUFHLEdBQUdBLGtCQUFrQixHQUFHO1FBRTdGLG1FQUFtRTtRQUNuRSxNQUFNRywwQkFBMEIsSUFBSTNOLG1CQUFvQjhFO1FBQ3hELE1BQU04SSxnQ0FBZ0MsSUFBSTVOLG1CQUFvQjJOLHlCQUF5QjtZQUFFL0ksaUJBQWlCLENBQUM7UUFBSztRQUVoSCxxQ0FBcUM7UUFDckMsSUFBTSxJQUFJbUksSUFBSSxHQUFHQSxJQUFJWixtQkFBbUJZLElBQU07WUFDNUNFLHFCQUFzQlMsb0JBQW9CLEdBQUdGLGlCQUFpQkc7WUFDOURWLHFCQUFzQlMsb0JBQW9CckIseUJBQXlCbUIsaUJBQWlCRztZQUNwRlYscUJBQXNCUyxvQkFBb0JyQix5QkFBeUJtQixpQkFBaUJJO1lBQ3BGWCxxQkFBc0JTLG9CQUFvQixHQUFHRixpQkFBaUJHO1lBQzlEVixxQkFBc0JTLG9CQUFvQnBCLG9CQUFvQmtCLGlCQUFpQkk7UUFDakY7UUFFQSwwQ0FBMEM7UUFDMUNYLHFCQUFzQlMsb0JBQW9CLEdBQUdGLGlCQUFpQkc7UUFDOURWLHFCQUFzQlMsb0JBQW9CekIsbUJBQW1CRCxvQkFBb0J3QixpQkFBaUJHO1FBQ2xHVixxQkFBc0JTLG9CQUFvQnpCLGtCQUFrQnVCLGlCQUFpQkk7UUFFN0Usc0NBQXNDO1FBQ3RDLElBQU0sSUFBSWIsSUFBSSxHQUFHQSxJQUFJWixtQkFBbUJZLElBQU07WUFDNUNFLHFCQUFzQlMsb0JBQW9CLEdBQUdGLGlCQUFpQkc7WUFDOURWLHFCQUFzQlMsb0JBQW9CcEIsb0JBQW9Ca0IsaUJBQWlCSTtZQUMvRVgscUJBQXNCUyxvQkFBb0IsR0FBR0YsaUJBQWlCRztZQUM5RFYscUJBQXNCUyxvQkFBb0JyQix5QkFBeUJtQixpQkFBaUJHO1lBQ3BGVixxQkFBc0JTLG9CQUFvQnJCLHlCQUF5Qm1CLGlCQUFpQkk7UUFDdEY7UUFFQSxLQUFLLENBQUVwQixpQkFBaUI7WUFDdEJsRyxXQUFXO1lBQ1hDLFFBQVE7WUFDUnpCLE1BQU00STtZQUNORyxTQUFTO1lBQ1RDLFdBQVc7UUFDYjtJQUNGO0FBQ0Y7QUFXQSxJQUFBLEFBQU01RixlQUFOLE1BQU1BO0lBNkNHckcsUUFBYztRQUNuQixJQUFJLENBQUNrTSwyQkFBMkIsR0FBRztRQUNuQyxJQUFJLENBQUNDLGtCQUFrQixHQUFHO0lBQzVCO0lBRUE7OztHQUdDLEdBQ0QsQUFBT3BGLFdBQVlxRixpQkFBeUIsRUFBUztRQUVuRCxJQUFJLENBQUN6TSxjQUFjLENBQUNpRSxPQUFPLEdBQUd3STtRQUM5QixJQUFJLENBQUNyTSxhQUFhLENBQUNELEdBQUcsR0FBRyxJQUFJLENBQUNILGNBQWMsQ0FBQ0MsTUFBTTtRQUVuRCxJQUFJeU0seUJBQXlCLEdBQUcseUNBQXlDO1FBRXpFLElBQUssSUFBSSxDQUFDRixrQkFBa0IsS0FBSyxNQUFPO1lBQ3RDLE1BQU1HLGlCQUFpQkYsb0JBQW9CLElBQUksQ0FBQ0Qsa0JBQWtCO1lBQ2xFLElBQUtHLGlCQUFpQixHQUFJO2dCQUV4Qix5RkFBeUY7Z0JBQ3pGLElBQUksQ0FBQ0osMkJBQTJCLElBQUlJO2dCQUNwQyxNQUFRLElBQUksQ0FBQ0osMkJBQTJCLElBQUksSUFBSSxDQUFDSyxvQ0FBb0MsQ0FBRztvQkFFdEYsaUJBQWlCO29CQUNqQixJQUFLLElBQUksQ0FBQ2xMLG1CQUFtQixDQUFDbUwsS0FBSyxJQUFJLElBQUksQ0FBQ2xMLHdCQUF3QixDQUFDa0wsS0FBSyxJQUNyRSxJQUFJLENBQUNwTSxjQUFjLENBQUNvTSxLQUFLLEdBQUdILHlCQUF5QixJQUFJLENBQUNoTSxhQUFhLENBQUNtTSxLQUFLLENBQUNDLEdBQUcsRUFBRzt3QkFDdkYsSUFBSyxJQUFJLENBQUM1SyxzQkFBc0IsRUFBRzs0QkFDakMsSUFBSSxDQUFDekIsY0FBYyxDQUFDb00sS0FBSzt3QkFDM0IsT0FDSzs0QkFDSEg7d0JBQ0Y7b0JBQ0Y7b0JBQ0EsSUFBSSxDQUFDSCwyQkFBMkIsSUFBSSxJQUFJLENBQUNLLG9DQUFvQztnQkFDL0U7WUFDRixPQUNLO2dCQUNILElBQUksQ0FBQ0wsMkJBQTJCLEdBQUc7WUFDckM7UUFDRjtRQUVBLDhCQUE4QjtRQUM5QixJQUFLLENBQUMsSUFBSSxDQUFDckssc0JBQXNCLEVBQUc7WUFDbEMsSUFBSSxDQUFDekIsY0FBYyxDQUFDb00sS0FBSyxJQUFJSDtRQUMvQixPQUNLO1lBQ0h0RSxVQUFVQSxPQUFRc0UsMkJBQTJCLEdBQUc7UUFDbEQ7UUFFQSxJQUFJLENBQUNGLGtCQUFrQixHQUFHQztJQUM1QjtJQW5GQSxZQUFvQmhNLGNBQWlDLEVBQ2pDQyxhQUF1QyxFQUN2Q2dCLG1CQUErQyxFQUMvQ0Msd0JBQW9ELEVBQ3BEOEUsZ0JBQXdCLEVBQ3hCRCxnQkFBd0IsRUFDeEJ4RyxjQUFvQixFQUNwQkksYUFBbUIsRUFDbkJPLGVBQW9DLENBQ3REO1FBRUF5SCxVQUFVQSxPQUFRNUIsbUJBQW1CQyxrQkFBa0I7UUFFdkQsTUFBTTVGLFVBQVVGO1FBRWhCLElBQUksQ0FBQ0YsY0FBYyxHQUFHQTtRQUN0QixJQUFJLENBQUNDLGFBQWEsR0FBR0E7UUFDckIsSUFBSSxDQUFDZ0IsbUJBQW1CLEdBQUdBO1FBQzNCLElBQUksQ0FBQ0Msd0JBQXdCLEdBQUdBO1FBQ2hDLElBQUksQ0FBQzNCLGNBQWMsR0FBR0E7UUFDdEIsSUFBSSxDQUFDSSxhQUFhLEdBQUdBO1FBQ3JCLElBQUksQ0FBQzhCLHNCQUFzQixHQUFHckIsUUFBUXFCLHNCQUFzQjtRQUU1RCxJQUFJLENBQUNxSywyQkFBMkIsR0FBRztRQUNuQyxJQUFJLENBQUNDLGtCQUFrQixHQUFHO1FBRTFCLDhFQUE4RTtRQUM5RSwrR0FBK0c7UUFDL0csSUFBSSxDQUFDSSxvQ0FBb0MsR0FDdkMsQUFBRXBHLENBQUFBLG1CQUFtQkMsZ0JBQWUsSUFBTTVGLFFBQVFvQiw4QkFBOEIsR0FBRztJQUN2RjtBQXNERjtBQUVBcEQsWUFBWWtPLFFBQVEsQ0FBRSxtQkFBbUJqTiJ9