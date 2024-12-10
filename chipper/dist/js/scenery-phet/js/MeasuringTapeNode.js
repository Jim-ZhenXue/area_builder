// Copyright 2014-2024, University of Colorado Boulder
/**
 * A scenery node that is used to represent a draggable Measuring Tape. It contains a tip and a base that can be dragged
 * separately, with a text indicating the measurement. The motion of the measuring tape can be confined by drag bounds.
 * The position of the measuring tape should be set via the basePosition and tipPosition rather than the scenery
 * coordinates
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (ActualConcepts)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Martin Veillette (Berea College)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../axon/js/DerivedStringProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector2Property from '../../dot/js/Vector2Property.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import { Circle, Image, InteractiveHighlightingNode, Line, Node, Path, Rectangle, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import measuringTape_png from '../images/measuringTape_png.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
import SoundDragListener from './SoundDragListener.js';
import SoundKeyboardDragListener from './SoundKeyboardDragListener.js';
// Drag speed with the keyboard, in view coordinates per second
const KEYBOARD_DRAG_SPEED = 600;
let MeasuringTapeNode = class MeasuringTapeNode extends Node {
    reset() {
        this.ownsBasePositionProperty && this.basePositionProperty.reset();
        this.ownsTipPositionProperty && this.tipPositionProperty.reset();
    }
    dispose() {
        this.disposeMeasuringTapeNode();
        super.dispose();
    }
    /**
   * Sets the dragBounds of the measuring tape.
   * In addition, it forces the tip and base of the measuring tape to be within the new bounds.
   */ setDragBounds(newDragBounds) {
        const dragBounds = newDragBounds.copy();
        this.dragBoundsProperty.value = dragBounds;
        // sets the base position of the measuring tape, which may have changed if it was outside of the dragBounds
        this.basePositionProperty.value = dragBounds.closestPointTo(this.basePositionProperty.value);
        // sets a new tip position if the tip of the measuring tape is subject to dragBounds
        if (this.isTipDragBounded) {
            this.tipPositionProperty.value = dragBounds.closestPointTo(this.tipPositionProperty.value);
        }
    }
    /**
   * Gets the dragBounds of the measuring tape.
   */ getDragBounds() {
        return this.dragBoundsProperty.value.copy();
    }
    /**
   * Returns the center of the base in the measuring tape's local coordinate frame.
   */ getLocalBaseCenter() {
        return new Vector2(-this.baseImage.imageWidth / 2, -this.baseImage.imageHeight / 2);
    }
    /**
   * Returns the bounding box of the measuring tape's base within its local coordinate frame
   */ getLocalBaseBounds() {
        return this.baseImage.bounds.copy();
    }
    /**
   * Initiates a drag of the base (whole measuring tape) from a Scenery event.
   */ startBaseDrag(event) {
        this.baseDragListener && this.baseDragListener.press(event);
    }
    /**
   * Creates an icon of the measuring tape.
   */ static createIcon(providedOptions) {
        // See documentation above!
        const options = optionize()({
            tapeLength: 30
        }, providedOptions);
        // Create an actual measuring tape.
        const measuringTapeNode = new MeasuringTapeNode(new Property({
            name: '',
            multiplier: 1
        }), {
            tipPositionProperty: new Vector2Property(new Vector2(options.tapeLength, 0)),
            hasValue: false,
            interactive: false
        });
        options.children = [
            measuringTapeNode
        ];
        // Create the icon, with measuringTape as its initial child.  This child will be replaced once the image becomes
        // available in the callback to toImage (see below). Since toImage happens asynchronously, this ensures that
        // the icon has initial bounds that will match the icon once the image is available.
        const measuringTapeIcon = new Node(options);
        // Convert measuringTapeNode to an image, and make it the child of measuringTapeIcon.
        measuringTapeNode.toImage((image)=>measuringTapeIcon.setChildren([
                new Image(image)
            ]));
        return measuringTapeIcon;
    }
    constructor(unitsProperty, providedOptions){
        var _options_tandem, _options_tandem1, _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const ownsBasePositionProperty = !(providedOptions == null ? void 0 : providedOptions.basePositionProperty);
        const ownsTipPositionProperty = !(providedOptions == null ? void 0 : providedOptions.tipPositionProperty);
        const options = optionize()({
            // base Position in model coordinate reference frame (rightBottom position of the measuring tape image)
            basePositionProperty: new Vector2Property(new Vector2(0, 0)),
            // tip Position in model coordinate reference frame (center position of the tip)
            tipPositionProperty: new Vector2Property(new Vector2(1, 0)),
            // use this to omit the value and units displayed below the tape measure, useful with createIcon
            hasValue: true,
            // bounds for the measuring tape (in model coordinate reference frame), default value is everything,
            // effectively no bounds
            dragBounds: Bounds2.EVERYTHING,
            textPosition: new Vector2(0, 30),
            modelViewTransform: ModelViewTransform2.createIdentity(),
            significantFigures: 1,
            textColor: 'white',
            textBackgroundColor: null,
            textBackgroundXMargin: 4,
            textBackgroundYMargin: 2,
            textBackgroundCornerRadius: 2,
            textMaxWidth: 200,
            textFont: new PhetFont({
                size: 16,
                weight: 'bold'
            }),
            baseScale: 0.8,
            lineColor: 'gray',
            tapeLineWidth: 2,
            tipCircleColor: 'rgba(0,0,0,0.1)',
            tipCircleRadius: 10,
            crosshairColor: 'rgb(224, 95, 32)',
            crosshairSize: 5,
            crosshairLineWidth: 2,
            isBaseCrosshairRotating: true,
            isTipCrosshairRotating: true,
            isTipDragBounded: true,
            interactive: true,
            baseDragStarted: _.noop,
            baseDragEnded: _.noop,
            phetioReadoutStringPropertyInstrumented: true,
            phetioFeaturedMeasuredDistanceProperty: false,
            baseKeyboardDragListenerOptions: {
                dragSpeed: KEYBOARD_DRAG_SPEED,
                shiftDragSpeed: KEYBOARD_DRAG_SPEED / 4
            },
            tipKeyboardDragListenerOptions: {
                dragSpeed: KEYBOARD_DRAG_SPEED,
                shiftDragSpeed: KEYBOARD_DRAG_SPEED / 4
            }
        }, providedOptions);
        super();
        assert && assert(Math.abs(options.modelViewTransform.modelToViewDeltaX(1)) === Math.abs(options.modelViewTransform.modelToViewDeltaY(1)), 'The y and x scale factor are not identical');
        this.unitsProperty = unitsProperty;
        this.significantFigures = options.significantFigures;
        this.dragBoundsProperty = new Property(options.dragBounds);
        this.modelViewTransformProperty = new Property(options.modelViewTransform);
        this.isTipDragBounded = options.isTipDragBounded;
        this.basePositionProperty = options.basePositionProperty;
        this.tipPositionProperty = options.tipPositionProperty;
        this.ownsBasePositionProperty = ownsBasePositionProperty;
        this.ownsTipPositionProperty = ownsTipPositionProperty;
        // private Property and its public read-only interface
        this._isTipUserControlledProperty = new Property(false);
        this.isTipUserControlledProperty = this._isTipUserControlledProperty;
        // private Property and its public read-only interface
        this._isBaseUserControlledProperty = new Property(false);
        this.isBaseUserControlledProperty = this._isBaseUserControlledProperty;
        assert && assert(this.basePositionProperty.units === this.tipPositionProperty.units, 'units should match');
        this.measuredDistanceProperty = new DerivedProperty([
            this.basePositionProperty,
            this.tipPositionProperty
        ], (basePosition, tipPosition)=>basePosition.distance(tipPosition), {
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('measuredDistanceProperty'),
            phetioDocumentation: 'The distance measured by the measuring tape',
            phetioValueType: NumberIO,
            phetioFeatured: options.phetioFeaturedMeasuredDistanceProperty,
            units: this.basePositionProperty.units
        });
        const crosshairShape = new Shape().moveTo(-options.crosshairSize, 0).moveTo(-options.crosshairSize, 0).lineTo(options.crosshairSize, 0).moveTo(0, -options.crosshairSize).lineTo(0, options.crosshairSize);
        const baseCrosshair = new Path(crosshairShape, {
            stroke: options.crosshairColor,
            lineWidth: options.crosshairLineWidth
        });
        const tipCrosshair = new Path(crosshairShape, {
            stroke: options.crosshairColor,
            lineWidth: options.crosshairLineWidth
        });
        const tipCircle = new Circle(options.tipCircleRadius, {
            fill: options.tipCircleColor
        });
        const baseImageParent = new InteractiveHighlightingNode({
            // will only be enabled if interactive
            interactiveHighlightEnabled: false
        });
        this.baseImage = new Image(measuringTape_png, {
            scale: options.baseScale,
            cursor: 'pointer',
            // pdom
            tagName: 'div',
            focusable: true,
            ariaRole: 'application',
            innerContent: SceneryPhetStrings.a11y.measuringTapeStringProperty,
            ariaLabel: SceneryPhetStrings.a11y.measuringTapeStringProperty
        });
        baseImageParent.addChild(this.baseImage);
        // create tapeline (running from one crosshair to the other)
        const tapeLine = new Line(this.basePositionProperty.value, this.tipPositionProperty.value, {
            stroke: options.lineColor,
            lineWidth: options.tapeLineWidth
        });
        // add tipCrosshair and tipCircle to the tip
        const tip = new InteractiveHighlightingNode({
            children: [
                tipCircle,
                tipCrosshair
            ],
            cursor: 'pointer',
            // interactive highlights - will only be enabled when interactive
            interactiveHighlightEnabled: false,
            // pdom
            tagName: 'div',
            focusable: true,
            ariaRole: 'application',
            innerContent: SceneryPhetStrings.a11y.measuringTapeTipStringProperty,
            ariaLabel: SceneryPhetStrings.a11y.measuringTapeTipStringProperty
        });
        const readoutStringProperty = new DerivedStringProperty([
            this.unitsProperty,
            this.measuredDistanceProperty,
            SceneryPhetStrings.measuringTapeReadoutPatternStringProperty
        ], (units, measuredDistance, measuringTapeReadoutPattern)=>{
            const distance = Utils.toFixed(units.multiplier * measuredDistance, this.significantFigures);
            return StringUtils.fillIn(measuringTapeReadoutPattern, {
                distance: distance,
                units: units.name
            });
        }, {
            tandem: options.phetioReadoutStringPropertyInstrumented ? (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('readoutStringProperty') : Tandem.OPT_OUT,
            phetioDocumentation: 'The text content of the readout on the measuring tape'
        });
        this.valueNode = new Text(readoutStringProperty, {
            font: options.textFont,
            fill: options.textColor,
            maxWidth: options.textMaxWidth
        });
        this.valueBackgroundNode = new Rectangle(0, 0, 1, 1, {
            cornerRadius: options.textBackgroundCornerRadius,
            fill: options.textBackgroundColor
        });
        // Resizes the value background and centers it on the value
        const updateValueBackgroundNode = ()=>{
            const valueBackgroundWidth = this.valueNode.width + 2 * options.textBackgroundXMargin;
            const valueBackgroundHeight = this.valueNode.height + 2 * options.textBackgroundYMargin;
            this.valueBackgroundNode.setRect(0, 0, valueBackgroundWidth, valueBackgroundHeight);
            this.valueBackgroundNode.center = this.valueNode.center;
        };
        this.valueNode.boundsProperty.lazyLink(updateValueBackgroundNode);
        updateValueBackgroundNode();
        // expand the area for touch
        tip.touchArea = tip.localBounds.dilated(15);
        this.baseImage.touchArea = this.baseImage.localBounds.dilated(20);
        this.baseImage.mouseArea = this.baseImage.localBounds.dilated(10);
        this.addChild(tapeLine); // tapeline going from one crosshair to the other
        this.addChild(baseCrosshair); // crosshair near the base, (set at basePosition)
        this.addChild(baseImageParent); // base of the measuring tape
        this.valueContainer = new Node({
            children: [
                this.valueBackgroundNode,
                this.valueNode
            ]
        });
        if (options.hasValue) {
            this.addChild(this.valueContainer);
        }
        this.addChild(tip); // crosshair and circle at the tip (set at tipPosition)
        let baseStartOffset;
        this.baseDragListener = null;
        if (options.interactive) {
            var _options_tandem2, _options_tandem3, _options_tandem4, _options_tandem5;
            // interactive highlights - highlights are enabled only when the component is interactive
            baseImageParent.interactiveHighlightEnabled = true;
            tip.interactiveHighlightEnabled = true;
            const baseStart = ()=>{
                this.moveToFront();
                options.baseDragStarted();
                this._isBaseUserControlledProperty.value = true;
            };
            const baseEnd = ()=>{
                this._isBaseUserControlledProperty.value = false;
                options.baseDragEnded();
            };
            const handleTipOnBaseDrag = (delta)=>{
                // translate the position of the tip if it is not being dragged
                // when the user is not holding onto the tip, dragging the body will also drag the tip
                if (!this.isTipUserControlledProperty.value) {
                    const unconstrainedTipPosition = delta.plus(this.tipPositionProperty.value);
                    if (options.isTipDragBounded) {
                        const constrainedTipPosition = this.dragBoundsProperty.value.closestPointTo(unconstrainedTipPosition);
                        // translation of the tipPosition (subject to the constraining drag bounds)
                        this.tipPositionProperty.set(constrainedTipPosition);
                    } else {
                        this.tipPositionProperty.set(unconstrainedTipPosition);
                    }
                }
            };
            // Drag listener for base
            this.baseDragListener = new SoundDragListener(combineOptions({
                tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('baseDragListener'),
                start: (event)=>{
                    baseStart();
                    const position = this.modelViewTransformProperty.value.modelToViewPosition(this.basePositionProperty.value);
                    baseStartOffset = event.currentTarget.globalToParentPoint(event.pointer.point).minus(position);
                },
                drag: (event, listener)=>{
                    const parentPoint = listener.currentTarget.globalToParentPoint(event.pointer.point).minus(baseStartOffset);
                    const unconstrainedBasePosition = this.modelViewTransformProperty.value.viewToModelPosition(parentPoint);
                    const constrainedBasePosition = this.dragBoundsProperty.value.closestPointTo(unconstrainedBasePosition);
                    // the basePosition value has not been updated yet, hence it is the old value of the basePosition;
                    const translationDelta = constrainedBasePosition.minus(this.basePositionProperty.value); // in model reference frame
                    // translation of the basePosition (subject to the constraining drag bounds)
                    this.basePositionProperty.set(constrainedBasePosition);
                    handleTipOnBaseDrag(translationDelta);
                },
                end: baseEnd
            }, options.baseDragListenerOptions));
            this.baseImage.addInputListener(this.baseDragListener);
            // Drag listener for base
            const baseKeyboardDragListener = new SoundKeyboardDragListener(combineOptions({
                tandem: (_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.createTandem('baseKeyboardDragListener'),
                positionProperty: this.basePositionProperty,
                transform: this.modelViewTransformProperty,
                dragBoundsProperty: this.dragBoundsProperty,
                start: baseStart,
                drag: (event, listener)=>{
                    handleTipOnBaseDrag(listener.modelDelta);
                },
                end: baseEnd
            }, options.baseKeyboardDragListenerOptions));
            this.baseImage.addInputListener(baseKeyboardDragListener);
            const tipEnd = ()=>{
                this._isTipUserControlledProperty.value = false;
            };
            let tipStartOffset;
            // Drag listener for tip
            const tipDragListener = new SoundDragListener(combineOptions({
                tandem: (_options_tandem4 = options.tandem) == null ? void 0 : _options_tandem4.createTandem('tipDragListener'),
                start: (event)=>{
                    this.moveToFront();
                    this._isTipUserControlledProperty.value = true;
                    const position = this.modelViewTransformProperty.value.modelToViewPosition(this.tipPositionProperty.value);
                    tipStartOffset = event.currentTarget.globalToParentPoint(event.pointer.point).minus(position);
                },
                drag: (event, listener)=>{
                    const parentPoint = listener.currentTarget.globalToParentPoint(event.pointer.point).minus(tipStartOffset);
                    const unconstrainedTipPosition = this.modelViewTransformProperty.value.viewToModelPosition(parentPoint);
                    if (options.isTipDragBounded) {
                        // translation of the tipPosition (subject to the constraining drag bounds)
                        this.tipPositionProperty.value = this.dragBoundsProperty.value.closestPointTo(unconstrainedTipPosition);
                    } else {
                        this.tipPositionProperty.value = unconstrainedTipPosition;
                    }
                },
                end: tipEnd
            }, options.tipDragListenerOptions));
            tip.addInputListener(tipDragListener);
            const tipKeyboardDragListener = new SoundKeyboardDragListener(combineOptions({
                tandem: (_options_tandem5 = options.tandem) == null ? void 0 : _options_tandem5.createTandem('tipKeyboardDragListener'),
                positionProperty: this.tipPositionProperty,
                dragBoundsProperty: options.isTipDragBounded ? this.dragBoundsProperty : null,
                transform: this.modelViewTransformProperty,
                start: ()=>{
                    this.moveToFront();
                    this._isTipUserControlledProperty.value = true;
                },
                end: tipEnd
            }, options.tipKeyboardDragListenerOptions));
            tip.addInputListener(tipKeyboardDragListener);
            // If this Node becomes invisible, interrupt user interaction.
            this.visibleProperty.lazyLink((visible)=>{
                if (!visible) {
                    this.interruptSubtreeInput();
                }
            });
        }
        const updateTextReadout = ()=>{
            this.valueNode.centerTop = this.baseImage.center.plus(options.textPosition.times(options.baseScale));
        };
        readoutStringProperty.link(updateTextReadout);
        // link the positions of base and tip to the measuring tape to the scenery update function.
        // Must be disposed.
        const multilink = Multilink.multilink([
            this.measuredDistanceProperty,
            unitsProperty,
            this.modelViewTransformProperty,
            this.tipPositionProperty,
            this.basePositionProperty
        ], (measuredDistance, units, modelViewTransform, tipPosition, basePosition)=>{
            const viewTipPosition = modelViewTransform.modelToViewPosition(tipPosition);
            const viewBasePosition = modelViewTransform.modelToViewPosition(basePosition);
            // calculate the orientation and change of orientation of the Measuring tape
            const oldAngle = this.baseImage.getRotation();
            const angle = Math.atan2(viewTipPosition.y - viewBasePosition.y, viewTipPosition.x - viewBasePosition.x);
            const deltaAngle = angle - oldAngle;
            // set position of the tip and the base crosshair
            baseCrosshair.center = viewBasePosition;
            tip.center = viewTipPosition;
            // in order to avoid all kind of geometrical issues with position,
            // let's reset the baseImage upright and then set its position and rotation
            this.baseImage.setRotation(0);
            this.baseImage.rightBottom = viewBasePosition;
            this.baseImage.rotateAround(this.baseImage.rightBottom, angle);
            // reposition the tapeline
            tapeLine.setLine(viewBasePosition.x, viewBasePosition.y, viewTipPosition.x, viewTipPosition.y);
            // rotate the crosshairs
            if (options.isTipCrosshairRotating) {
                tip.rotateAround(viewTipPosition, deltaAngle);
            }
            if (options.isBaseCrosshairRotating) {
                baseCrosshair.rotateAround(viewBasePosition, deltaAngle);
            }
            updateTextReadout();
        });
        this.disposeMeasuringTapeNode = ()=>{
            multilink.dispose();
            readoutStringProperty.dispose();
            this.ownsBasePositionProperty && this.basePositionProperty.dispose();
            this.ownsTipPositionProperty && this.tipPositionProperty.dispose();
            // interactive highlighting related listeners require disposal
            baseImageParent.dispose();
            tip.dispose();
        };
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'MeasuringTapeNode', this);
    }
};
sceneryPhet.register('MeasuringTapeNode', MeasuringTapeNode);
export default MeasuringTapeNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNjZW5lcnkgbm9kZSB0aGF0IGlzIHVzZWQgdG8gcmVwcmVzZW50IGEgZHJhZ2dhYmxlIE1lYXN1cmluZyBUYXBlLiBJdCBjb250YWlucyBhIHRpcCBhbmQgYSBiYXNlIHRoYXQgY2FuIGJlIGRyYWdnZWRcbiAqIHNlcGFyYXRlbHksIHdpdGggYSB0ZXh0IGluZGljYXRpbmcgdGhlIG1lYXN1cmVtZW50LiBUaGUgbW90aW9uIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBjYW4gYmUgY29uZmluZWQgYnkgZHJhZyBib3VuZHMuXG4gKiBUaGUgcG9zaXRpb24gb2YgdGhlIG1lYXN1cmluZyB0YXBlIHNob3VsZCBiZSBzZXQgdmlhIHRoZSBiYXNlUG9zaXRpb24gYW5kIHRpcFBvc2l0aW9uIHJhdGhlciB0aGFuIHRoZSBzY2VuZXJ5XG4gKiBjb29yZGluYXRlc1xuICpcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsQ29uY2VwdHMpXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxuICovXG5cbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IERlcml2ZWRTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRTdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcbmltcG9ydCB7IENpcmNsZSwgRHJhZ0xpc3RlbmVyLCBGb250LCBJbWFnZSwgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmdOb2RlLCBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUGF0aCwgUHJlc3NMaXN0ZW5lckV2ZW50LCBSZWN0YW5nbGUsIFRDb2xvciwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgbWVhc3VyaW5nVGFwZV9wbmcgZnJvbSAnLi4vaW1hZ2VzL21lYXN1cmluZ1RhcGVfcG5nLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IFNvdW5kRHJhZ0xpc3RlbmVyLCB7IFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucyB9IGZyb20gJy4vU291bmREcmFnTGlzdGVuZXIuanMnO1xuaW1wb3J0IFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIsIHsgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgfSBmcm9tICcuL1NvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIuanMnO1xuXG5leHBvcnQgdHlwZSBNZWFzdXJpbmdUYXBlVW5pdHMgPSB7XG4gIG5hbWU6IHN0cmluZztcbiAgbXVsdGlwbGllcjogbnVtYmVyO1xufTtcblxuLy8gRHJhZyBzcGVlZCB3aXRoIHRoZSBrZXlib2FyZCwgaW4gdmlldyBjb29yZGluYXRlcyBwZXIgc2Vjb25kXG5jb25zdCBLRVlCT0FSRF9EUkFHX1NQRUVEID0gNjAwO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGJhc2UgUG9zaXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZSByZWZlcmVuY2UgZnJhbWUgKHJpZ2h0Qm90dG9tIHBvc2l0aW9uIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBpbWFnZSlcbiAgYmFzZVBvc2l0aW9uUHJvcGVydHk/OiBQcm9wZXJ0eTxWZWN0b3IyPjtcblxuICAvLyB0aXAgUG9zaXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZSByZWZlcmVuY2UgZnJhbWUgKGNlbnRlciBwb3NpdGlvbiBvZiB0aGUgdGlwKVxuICB0aXBQb3NpdGlvblByb3BlcnR5PzogUHJvcGVydHk8VmVjdG9yMj47XG5cbiAgLy8gdXNlIHRoaXMgdG8gb21pdCB0aGUgdmFsdWUgYW5kIHVuaXRzIGRpc3BsYXllZCBiZWxvdyB0aGUgdGFwZSBtZWFzdXJlLCB1c2VmdWwgd2l0aCBjcmVhdGVJY29uXG4gIGhhc1ZhbHVlPzogYm9vbGVhbjtcblxuICAvLyBib3VuZHMgZm9yIHRoZSBtZWFzdXJpbmcgdGFwZSAoaW4gbW9kZWwgY29vcmRpbmF0ZSByZWZlcmVuY2UgZnJhbWUpLCBkZWZhdWx0IHZhbHVlIGlzIGV2ZXJ5dGhpbmcsXG4gIC8vIGVmZmVjdGl2ZWx5IG5vIGJvdW5kc1xuICBkcmFnQm91bmRzPzogQm91bmRzMjtcbiAgdGV4dFBvc2l0aW9uPzogVmVjdG9yMjsgLy8gcG9zaXRpb24gb2YgdGhlIHRleHQgcmVsYXRpdmUgdG8gY2VudGVyIG9mIHRoZSBiYXNlIGltYWdlIGluIHZpZXcgdW5pdHNcbiAgbW9kZWxWaWV3VHJhbnNmb3JtPzogTW9kZWxWaWV3VHJhbnNmb3JtMjtcbiAgc2lnbmlmaWNhbnRGaWd1cmVzPzogbnVtYmVyOyAvLyBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZmlndXJlcyBpbiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50XG4gIHRleHRDb2xvcj86IFRDb2xvcjsgLy8ge0NvbG9yRGVmfSBjb2xvciBvZiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50IGFuZCB1bml0XG4gIHRleHRCYWNrZ3JvdW5kQ29sb3I/OiBUQ29sb3I7IC8vIHtDb2xvckRlZn0gZmlsbCBjb2xvciBvZiB0aGUgdGV4dCBiYWNrZ3JvdW5kXG4gIHRleHRCYWNrZ3JvdW5kWE1hcmdpbj86IG51bWJlcjtcbiAgdGV4dEJhY2tncm91bmRZTWFyZ2luPzogbnVtYmVyO1xuICB0ZXh0QmFja2dyb3VuZENvcm5lclJhZGl1cz86IG51bWJlcjtcbiAgdGV4dE1heFdpZHRoPzogbnVtYmVyO1xuICB0ZXh0Rm9udD86IEZvbnQ7IC8vIGZvbnQgZm9yIHRoZSBtZWFzdXJlbWVudCB0ZXh0XG4gIGJhc2VTY2FsZT86IG51bWJlcjsgLy8gY29udHJvbCB0aGUgc2l6ZSBvZiB0aGUgbWVhc3VyaW5nIHRhcGUgSW1hZ2UgKHRoZSBiYXNlKVxuICBsaW5lQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIHRoZSB0YXBlbGluZSBpdHNlbGZcbiAgdGFwZUxpbmVXaWR0aD86IG51bWJlcjsgLy8gbGluZVdpZHRoIG9mIHRoZSB0YXBlIGxpbmVcbiAgdGlwQ2lyY2xlQ29sb3I/OiBUQ29sb3I7IC8vIGNvbG9yIG9mIHRoZSBjaXJjbGUgYXQgdGhlIHRpcFxuICB0aXBDaXJjbGVSYWRpdXM/OiBudW1iZXI7IC8vIHJhZGl1cyBvZiB0aGUgY2lyY2xlIG9uIHRoZSB0aXBcbiAgY3Jvc3NoYWlyQ29sb3I/OiBUQ29sb3I7IC8vIG9yYW5nZSwgY29sb3Igb2YgdGhlIHR3byBjcm9zc2hhaXJzXG4gIGNyb3NzaGFpclNpemU/OiBudW1iZXI7IC8vIHNpemUgb2YgdGhlIGNyb3NzaGFpcnMgaW4gc2NlbmVyeSBjb29yZGluYXRlcyAoIG1lYXN1cmVkIGZyb20gY2VudGVyKVxuICBjcm9zc2hhaXJMaW5lV2lkdGg/OiBudW1iZXI7IC8vIGxpbmVXaWR0aCBvZiB0aGUgY3Jvc3NoYWlyc1xuICBpc0Jhc2VDcm9zc2hhaXJSb3RhdGluZz86IGJvb2xlYW47IC8vIGRvIGNyb3NzaGFpcnMgcm90YXRlIGFyb3VuZCB0aGVpciBvd24gYXhpcyB0byBsaW5lIHVwIHdpdGggdGhlIHRhcGVsaW5lXG4gIGlzVGlwQ3Jvc3NoYWlyUm90YXRpbmc/OiBib29sZWFuOyAvLyBkbyBjcm9zc2hhaXJzIHJvdGF0ZSBhcm91bmQgdGhlaXIgb3duIGF4aXMgdG8gbGluZSB1cCB3aXRoIHRoZSB0YXBlbGluZVxuICBpc1RpcERyYWdCb3VuZGVkPzogYm9vbGVhbjsgLy8gaXMgdGhlIHRpcCBzdWJqZWN0IHRvIGRyYWdCb3VuZHNcbiAgaW50ZXJhY3RpdmU/OiBib29sZWFuOyAvLyBzcGVjaWZpZXMgd2hldGhlciB0aGUgbm9kZSBhZGRzIGl0cyBvd24gaW5wdXQgbGlzdGVuZXJzLiBTZXR0aW5nIHRoaXMgdG8gZmFsc2UgbWF5IGJlIGhlbHBmdWwgaW4gY3JlYXRpbmcgYW4gaWNvbi5cbiAgYmFzZURyYWdTdGFydGVkPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIHdoZW4gdGhlIGJhc2UgZHJhZyBzdGFydHNcbiAgYmFzZURyYWdFbmRlZD86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIHRoZSBiYXNlIGRyYWcgZW5kcywgZm9yIHRlc3Rpbmcgd2hldGhlciBpdCBoYXMgZHJvcHBlZCBpbnRvIHRoZSB0b29sYm94XG4gIHBoZXRpb1JlYWRvdXRTdHJpbmdQcm9wZXJ0eUluc3RydW1lbnRlZD86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gaW5zdHJ1bWVudCByZWFkb3V0U3RyaW5nUHJvcGVydHkgZm9yIFBoRVQtaU9cbiAgcGhldGlvRmVhdHVyZWRNZWFzdXJlZERpc3RhbmNlUHJvcGVydHk/OiBib29sZWFuOyAvLyBwaGV0aW9GZWF0dXJlZCB2YWx1ZSBmb3IgbWVhc3VyZWREaXN0YW5jZVByb3BlcnR5XG5cbiAgLy8gT3B0aW9ucyBwYXNzZWQgdG8gdGhlIGRyYWcgbGlzdGVuZXJzIGZvciB0aGUgYmFzZSBhbmQgdGlwLlxuICBiYXNlRHJhZ0xpc3RlbmVyT3B0aW9ucz86IFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucztcbiAgdGlwRHJhZ0xpc3RlbmVyT3B0aW9ucz86IFNvdW5kRHJhZ0xpc3RlbmVyT3B0aW9ucztcbiAgYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucz86IFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zO1xuICB0aXBLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnM/OiBTb3VuZEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucztcbn07XG5cbi8qKlxuICogTk9URTogTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyBhcmUgb21pdHRlZCBiZWNhdXNlIHlvdSBtdXN0IHVzZSBiYXNlUG9zaXRpb25Qcm9wZXJ0eSBhbmQgdGlwUG9zaXRpb25Qcm9wZXJ0eSB0b1xuICogcG9zaXRpb24gdGhpcyBOb2RlLlxuICovXG5leHBvcnQgdHlwZSBNZWFzdXJpbmdUYXBlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsIGtleW9mIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnM+O1xuXG50eXBlIE1lYXN1cmluZ1RhcGVJY29uU2VsZk9wdGlvbnMgPSB7XG4gIHRhcGVMZW5ndGg/OiBudW1iZXI7IC8vIGxlbmd0aCBvZiB0aGUgbWVhc3VyaW5nIHRhcGVcbn07XG5cbmV4cG9ydCB0eXBlIE1lYXN1cmluZ1RhcGVJY29uT3B0aW9ucyA9IE1lYXN1cmluZ1RhcGVJY29uU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuY2xhc3MgTWVhc3VyaW5nVGFwZU5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvLyB0aGUgZGlzdGFuY2UgbWVhc3VyZWQgYnkgdGhlIHRhcGVcbiAgcHVibGljIHJlYWRvbmx5IG1lYXN1cmVkRGlzdGFuY2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPjtcbiAgcHVibGljIHJlYWRvbmx5IGlzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XG4gIHB1YmxpYyByZWFkb25seSBpc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHVibGljIHJlYWRvbmx5IGJhc2VQb3NpdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcbiAgcHVibGljIHJlYWRvbmx5IHRpcFBvc2l0aW9uUHJvcGVydHk6IFByb3BlcnR5PFZlY3RvcjI+O1xuICBwdWJsaWMgcmVhZG9ubHkgbW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHk6IFByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+O1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgdW5pdHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8TWVhc3VyaW5nVGFwZVVuaXRzPjtcbiAgcHJpdmF0ZSByZWFkb25seSBzaWduaWZpY2FudEZpZ3VyZXM6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IF9pc1RpcFVzZXJDb250cm9sbGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgcmVhZG9ubHkgX2lzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwcml2YXRlIHJlYWRvbmx5IGRyYWdCb3VuZHNQcm9wZXJ0eTogVFByb3BlcnR5PEJvdW5kczI+O1xuICBwcml2YXRlIHJlYWRvbmx5IGlzVGlwRHJhZ0JvdW5kZWQ6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgYmFzZURyYWdMaXN0ZW5lcjogRHJhZ0xpc3RlbmVyIHwgbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlSW1hZ2U6IEltYWdlO1xuICBwcml2YXRlIHJlYWRvbmx5IHZhbHVlTm9kZTogVGV4dDtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZUJhY2tncm91bmROb2RlOiBSZWN0YW5nbGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgdmFsdWVDb250YWluZXI6IE5vZGU7IC8vIHBhcmVudCB0aGF0IGRpc3BsYXlzIHRoZSB0ZXh0IGFuZCBpdHMgYmFja2dyb3VuZFxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VNZWFzdXJpbmdUYXBlTm9kZTogKCkgPT4gdm9pZDtcblxuICAvLyBJZiB5b3UgcHJvdmlkZSBwb3NpdGlvbiBQcm9wZXJ0aWVzIGZvciB0aGUgYmFzZSBhbmQgdGlwLCB0aGVuIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIHJlc2V0dGluZyBhbmQgZGlzcG9zaW5nIHRoZW0uXG4gIHByaXZhdGUgcmVhZG9ubHkgb3duc0Jhc2VQb3NpdGlvblByb3BlcnR5OiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IG93bnNUaXBQb3NpdGlvblByb3BlcnR5OiBib29sZWFuO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdW5pdHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8TWVhc3VyaW5nVGFwZVVuaXRzPiwgcHJvdmlkZWRPcHRpb25zPzogTWVhc3VyaW5nVGFwZU5vZGVPcHRpb25zICkge1xuICAgIGNvbnN0IG93bnNCYXNlUG9zaXRpb25Qcm9wZXJ0eSA9ICFwcm92aWRlZE9wdGlvbnM/LmJhc2VQb3NpdGlvblByb3BlcnR5O1xuICAgIGNvbnN0IG93bnNUaXBQb3NpdGlvblByb3BlcnR5ID0gIXByb3ZpZGVkT3B0aW9ucz8udGlwUG9zaXRpb25Qcm9wZXJ0eTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWVhc3VyaW5nVGFwZU5vZGVPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnYmFzZURyYWdMaXN0ZW5lck9wdGlvbnMnIHwgJ3RpcERyYWdMaXN0ZW5lck9wdGlvbnMnPiwgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gYmFzZSBQb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlIHJlZmVyZW5jZSBmcmFtZSAocmlnaHRCb3R0b20gcG9zaXRpb24gb2YgdGhlIG1lYXN1cmluZyB0YXBlIGltYWdlKVxuICAgICAgYmFzZVBvc2l0aW9uUHJvcGVydHk6IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAwICkgKSxcblxuICAgICAgLy8gdGlwIFBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGUgcmVmZXJlbmNlIGZyYW1lIChjZW50ZXIgcG9zaXRpb24gb2YgdGhlIHRpcClcbiAgICAgIHRpcFBvc2l0aW9uUHJvcGVydHk6IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAxLCAwICkgKSxcblxuICAgICAgLy8gdXNlIHRoaXMgdG8gb21pdCB0aGUgdmFsdWUgYW5kIHVuaXRzIGRpc3BsYXllZCBiZWxvdyB0aGUgdGFwZSBtZWFzdXJlLCB1c2VmdWwgd2l0aCBjcmVhdGVJY29uXG4gICAgICBoYXNWYWx1ZTogdHJ1ZSxcblxuICAgICAgLy8gYm91bmRzIGZvciB0aGUgbWVhc3VyaW5nIHRhcGUgKGluIG1vZGVsIGNvb3JkaW5hdGUgcmVmZXJlbmNlIGZyYW1lKSwgZGVmYXVsdCB2YWx1ZSBpcyBldmVyeXRoaW5nLFxuICAgICAgLy8gZWZmZWN0aXZlbHkgbm8gYm91bmRzXG4gICAgICBkcmFnQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkcsXG4gICAgICB0ZXh0UG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAzMCApLCAvLyBwb3NpdGlvbiBvZiB0aGUgdGV4dCByZWxhdGl2ZSB0byBjZW50ZXIgb2YgdGhlIGJhc2UgaW1hZ2UgaW4gdmlldyB1bml0c1xuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCksXG4gICAgICBzaWduaWZpY2FudEZpZ3VyZXM6IDEsIC8vIG51bWJlciBvZiBzaWduaWZpY2FudCBmaWd1cmVzIGluIHRoZSBsZW5ndGggbWVhc3VyZW1lbnRcbiAgICAgIHRleHRDb2xvcjogJ3doaXRlJywgLy8ge0NvbG9yRGVmfSBjb2xvciBvZiB0aGUgbGVuZ3RoIG1lYXN1cmVtZW50IGFuZCB1bml0XG4gICAgICB0ZXh0QmFja2dyb3VuZENvbG9yOiBudWxsLCAvLyB7Q29sb3JEZWZ9IGZpbGwgY29sb3Igb2YgdGhlIHRleHQgYmFja2dyb3VuZFxuICAgICAgdGV4dEJhY2tncm91bmRYTWFyZ2luOiA0LFxuICAgICAgdGV4dEJhY2tncm91bmRZTWFyZ2luOiAyLFxuICAgICAgdGV4dEJhY2tncm91bmRDb3JuZXJSYWRpdXM6IDIsXG4gICAgICB0ZXh0TWF4V2lkdGg6IDIwMCxcbiAgICAgIHRleHRGb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSwgLy8gZm9udCBmb3IgdGhlIG1lYXN1cmVtZW50IHRleHRcbiAgICAgIGJhc2VTY2FsZTogMC44LCAvLyBjb250cm9sIHRoZSBzaXplIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSBJbWFnZSAodGhlIGJhc2UpXG4gICAgICBsaW5lQ29sb3I6ICdncmF5JywgLy8gY29sb3Igb2YgdGhlIHRhcGVsaW5lIGl0c2VsZlxuICAgICAgdGFwZUxpbmVXaWR0aDogMiwgLy8gbGluZVdpZHRoIG9mIHRoZSB0YXBlIGxpbmVcbiAgICAgIHRpcENpcmNsZUNvbG9yOiAncmdiYSgwLDAsMCwwLjEpJywgLy8gY29sb3Igb2YgdGhlIGNpcmNsZSBhdCB0aGUgdGlwXG4gICAgICB0aXBDaXJjbGVSYWRpdXM6IDEwLCAvLyByYWRpdXMgb2YgdGhlIGNpcmNsZSBvbiB0aGUgdGlwXG4gICAgICBjcm9zc2hhaXJDb2xvcjogJ3JnYigyMjQsIDk1LCAzMiknLCAvLyBvcmFuZ2UsIGNvbG9yIG9mIHRoZSB0d28gY3Jvc3NoYWlyc1xuICAgICAgY3Jvc3NoYWlyU2l6ZTogNSwgLy8gc2l6ZSBvZiB0aGUgY3Jvc3NoYWlycyBpbiBzY2VuZXJ5IGNvb3JkaW5hdGVzICggbWVhc3VyZWQgZnJvbSBjZW50ZXIpXG4gICAgICBjcm9zc2hhaXJMaW5lV2lkdGg6IDIsIC8vIGxpbmV3aWR0aCBvZiB0aGUgY3Jvc3NoYWlyc1xuICAgICAgaXNCYXNlQ3Jvc3NoYWlyUm90YXRpbmc6IHRydWUsIC8vIGRvIGNyb3NzaGFpcnMgcm90YXRlIGFyb3VuZCB0aGVpciBvd24gYXhpcyB0byBsaW5lIHVwIHdpdGggdGhlIHRhcGVsaW5lXG4gICAgICBpc1RpcENyb3NzaGFpclJvdGF0aW5nOiB0cnVlLCAvLyBkbyBjcm9zc2hhaXJzIHJvdGF0ZSBhcm91bmQgdGhlaXIgb3duIGF4aXMgdG8gbGluZSB1cCB3aXRoIHRoZSB0YXBlbGluZVxuICAgICAgaXNUaXBEcmFnQm91bmRlZDogdHJ1ZSwgLy8gaXMgdGhlIHRpcCBzdWJqZWN0IHRvIGRyYWdCb3VuZHNcbiAgICAgIGludGVyYWN0aXZlOiB0cnVlLCAvLyBzcGVjaWZpZXMgd2hldGhlciB0aGUgbm9kZSBhZGRzIGl0cyBvd24gaW5wdXQgbGlzdGVuZXJzLiBTZXR0aW5nIHRoaXMgdG8gZmFsc2UgbWF5IGJlIGhlbHBmdWwgaW4gY3JlYXRpbmcgYW4gaWNvbi5cbiAgICAgIGJhc2VEcmFnU3RhcnRlZDogXy5ub29wLCAvLyBjYWxsZWQgd2hlbiB0aGUgYmFzZSBkcmFnIHN0YXJ0c1xuICAgICAgYmFzZURyYWdFbmRlZDogXy5ub29wLCAvLyBjYWxsZWQgd2hlbiB0aGUgYmFzZSBkcmFnIGVuZHMsIGZvciB0ZXN0aW5nIHdoZXRoZXIgaXQgaGFzIGRyb3BwZWQgaW50byB0aGUgdG9vbGJveFxuICAgICAgcGhldGlvUmVhZG91dFN0cmluZ1Byb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLFxuICAgICAgcGhldGlvRmVhdHVyZWRNZWFzdXJlZERpc3RhbmNlUHJvcGVydHk6IGZhbHNlLFxuICAgICAgYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9uczoge1xuICAgICAgICBkcmFnU3BlZWQ6IEtFWUJPQVJEX0RSQUdfU1BFRUQsXG4gICAgICAgIHNoaWZ0RHJhZ1NwZWVkOiBLRVlCT0FSRF9EUkFHX1NQRUVEIC8gNFxuICAgICAgfSxcbiAgICAgIHRpcEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9uczoge1xuICAgICAgICBkcmFnU3BlZWQ6IEtFWUJPQVJEX0RSQUdfU1BFRUQsXG4gICAgICAgIHNoaWZ0RHJhZ1NwZWVkOiBLRVlCT0FSRF9EUkFHX1NQRUVEIC8gNFxuICAgICAgfVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE1hdGguYWJzKCBvcHRpb25zLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggMSApICkgPT09XG4gICAgICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoIG9wdGlvbnMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCAxICkgKSwgJ1RoZSB5IGFuZCB4IHNjYWxlIGZhY3RvciBhcmUgbm90IGlkZW50aWNhbCcgKTtcblxuICAgIHRoaXMudW5pdHNQcm9wZXJ0eSA9IHVuaXRzUHJvcGVydHk7XG4gICAgdGhpcy5zaWduaWZpY2FudEZpZ3VyZXMgPSBvcHRpb25zLnNpZ25pZmljYW50RmlndXJlcztcbiAgICB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5kcmFnQm91bmRzICk7XG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5tb2RlbFZpZXdUcmFuc2Zvcm0gKTtcbiAgICB0aGlzLmlzVGlwRHJhZ0JvdW5kZWQgPSBvcHRpb25zLmlzVGlwRHJhZ0JvdW5kZWQ7XG4gICAgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSA9IG9wdGlvbnMuYmFzZVBvc2l0aW9uUHJvcGVydHk7XG4gICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5ID0gb3B0aW9ucy50aXBQb3NpdGlvblByb3BlcnR5O1xuICAgIHRoaXMub3duc0Jhc2VQb3NpdGlvblByb3BlcnR5ID0gb3duc0Jhc2VQb3NpdGlvblByb3BlcnR5O1xuICAgIHRoaXMub3duc1RpcFBvc2l0aW9uUHJvcGVydHkgPSBvd25zVGlwUG9zaXRpb25Qcm9wZXJ0eTtcblxuICAgIC8vIHByaXZhdGUgUHJvcGVydHkgYW5kIGl0cyBwdWJsaWMgcmVhZC1vbmx5IGludGVyZmFjZVxuICAgIHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxib29sZWFuPiggZmFsc2UgKTtcbiAgICB0aGlzLmlzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTtcblxuICAgIC8vIHByaXZhdGUgUHJvcGVydHkgYW5kIGl0cyBwdWJsaWMgcmVhZC1vbmx5IGludGVyZmFjZVxuICAgIHRoaXMuX2lzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Ym9vbGVhbj4oIGZhbHNlICk7XG4gICAgdGhpcy5pc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5ID0gdGhpcy5faXNCYXNlVXNlckNvbnRyb2xsZWRQcm9wZXJ0eTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHkudW5pdHMgPT09IHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS51bml0cywgJ3VuaXRzIHNob3VsZCBtYXRjaCcgKTtcblxuICAgIHRoaXMubWVhc3VyZWREaXN0YW5jZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcbiAgICAgIFsgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSwgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5IF0sXG4gICAgICAoIGJhc2VQb3NpdGlvbiwgdGlwUG9zaXRpb24gKSA9PiBiYXNlUG9zaXRpb24uZGlzdGFuY2UoIHRpcFBvc2l0aW9uICksIHtcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnbWVhc3VyZWREaXN0YW5jZVByb3BlcnR5JyApLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGRpc3RhbmNlIG1lYXN1cmVkIGJ5IHRoZSBtZWFzdXJpbmcgdGFwZScsXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkTWVhc3VyZWREaXN0YW5jZVByb3BlcnR5LFxuICAgICAgICB1bml0czogdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS51bml0c1xuICAgICAgfSApO1xuXG4gICAgY29uc3QgY3Jvc3NoYWlyU2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgICAgLm1vdmVUbyggLW9wdGlvbnMuY3Jvc3NoYWlyU2l6ZSwgMCApXG4gICAgICAubW92ZVRvKCAtb3B0aW9ucy5jcm9zc2hhaXJTaXplLCAwIClcbiAgICAgIC5saW5lVG8oIG9wdGlvbnMuY3Jvc3NoYWlyU2l6ZSwgMCApXG4gICAgICAubW92ZVRvKCAwLCAtb3B0aW9ucy5jcm9zc2hhaXJTaXplIClcbiAgICAgIC5saW5lVG8oIDAsIG9wdGlvbnMuY3Jvc3NoYWlyU2l6ZSApO1xuXG4gICAgY29uc3QgYmFzZUNyb3NzaGFpciA9IG5ldyBQYXRoKCBjcm9zc2hhaXJTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNyb3NzaGFpckNvbG9yLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmNyb3NzaGFpckxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIGNvbnN0IHRpcENyb3NzaGFpciA9IG5ldyBQYXRoKCBjcm9zc2hhaXJTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmNyb3NzaGFpckNvbG9yLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmNyb3NzaGFpckxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIGNvbnN0IHRpcENpcmNsZSA9IG5ldyBDaXJjbGUoIG9wdGlvbnMudGlwQ2lyY2xlUmFkaXVzLCB7IGZpbGw6IG9wdGlvbnMudGlwQ2lyY2xlQ29sb3IgfSApO1xuXG4gICAgY29uc3QgYmFzZUltYWdlUGFyZW50ID0gbmV3IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSgge1xuXG4gICAgICAvLyB3aWxsIG9ubHkgYmUgZW5hYmxlZCBpZiBpbnRlcmFjdGl2ZVxuICAgICAgaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkOiBmYWxzZVxuICAgIH0gKTtcbiAgICB0aGlzLmJhc2VJbWFnZSA9IG5ldyBJbWFnZSggbWVhc3VyaW5nVGFwZV9wbmcsIHtcbiAgICAgIHNjYWxlOiBvcHRpb25zLmJhc2VTY2FsZSxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgIGZvY3VzYWJsZTogdHJ1ZSxcbiAgICAgIGFyaWFSb2xlOiAnYXBwbGljYXRpb24nLFxuICAgICAgaW5uZXJDb250ZW50OiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tZWFzdXJpbmdUYXBlU3RyaW5nUHJvcGVydHksXG4gICAgICBhcmlhTGFiZWw6IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lm1lYXN1cmluZ1RhcGVTdHJpbmdQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICBiYXNlSW1hZ2VQYXJlbnQuYWRkQ2hpbGQoIHRoaXMuYmFzZUltYWdlICk7XG5cbiAgICAvLyBjcmVhdGUgdGFwZWxpbmUgKHJ1bm5pbmcgZnJvbSBvbmUgY3Jvc3NoYWlyIHRvIHRoZSBvdGhlcilcbiAgICBjb25zdCB0YXBlTGluZSA9IG5ldyBMaW5lKCB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5saW5lQ29sb3IsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMudGFwZUxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIC8vIGFkZCB0aXBDcm9zc2hhaXIgYW5kIHRpcENpcmNsZSB0byB0aGUgdGlwXG4gICAgY29uc3QgdGlwID0gbmV3IEludGVyYWN0aXZlSGlnaGxpZ2h0aW5nTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFsgdGlwQ2lyY2xlLCB0aXBDcm9zc2hhaXIgXSxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuXG4gICAgICAvLyBpbnRlcmFjdGl2ZSBoaWdobGlnaHRzIC0gd2lsbCBvbmx5IGJlIGVuYWJsZWQgd2hlbiBpbnRlcmFjdGl2ZVxuICAgICAgaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkOiBmYWxzZSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBmb2N1c2FibGU6IHRydWUsXG4gICAgICBhcmlhUm9sZTogJ2FwcGxpY2F0aW9uJyxcbiAgICAgIGlubmVyQ29udGVudDogU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkubWVhc3VyaW5nVGFwZVRpcFN0cmluZ1Byb3BlcnR5LFxuICAgICAgYXJpYUxhYmVsOiBTY2VuZXJ5UGhldFN0cmluZ3MuYTExeS5tZWFzdXJpbmdUYXBlVGlwU3RyaW5nUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICBjb25zdCByZWFkb3V0U3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFN0cmluZ1Byb3BlcnR5KFxuICAgICAgWyB0aGlzLnVuaXRzUHJvcGVydHksIHRoaXMubWVhc3VyZWREaXN0YW5jZVByb3BlcnR5LCBTY2VuZXJ5UGhldFN0cmluZ3MubWVhc3VyaW5nVGFwZVJlYWRvdXRQYXR0ZXJuU3RyaW5nUHJvcGVydHkgXSxcbiAgICAgICggdW5pdHMsIG1lYXN1cmVkRGlzdGFuY2UsIG1lYXN1cmluZ1RhcGVSZWFkb3V0UGF0dGVybiApID0+IHtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBVdGlscy50b0ZpeGVkKCB1bml0cy5tdWx0aXBsaWVyICogbWVhc3VyZWREaXN0YW5jZSwgdGhpcy5zaWduaWZpY2FudEZpZ3VyZXMgKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZpbGxJbiggbWVhc3VyaW5nVGFwZVJlYWRvdXRQYXR0ZXJuLCB7XG4gICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlLFxuICAgICAgICAgIHVuaXRzOiB1bml0cy5uYW1lXG4gICAgICAgIH0gKTtcbiAgICAgIH0sIHtcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnBoZXRpb1JlYWRvdXRTdHJpbmdQcm9wZXJ0eUluc3RydW1lbnRlZCA/IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdyZWFkb3V0U3RyaW5nUHJvcGVydHknICkgOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSB0ZXh0IGNvbnRlbnQgb2YgdGhlIHJlYWRvdXQgb24gdGhlIG1lYXN1cmluZyB0YXBlJ1xuICAgICAgfSApO1xuXG4gICAgdGhpcy52YWx1ZU5vZGUgPSBuZXcgVGV4dCggcmVhZG91dFN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBvcHRpb25zLnRleHRGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy50ZXh0Q29sb3IsXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy50ZXh0TWF4V2lkdGhcbiAgICB9ICk7XG5cbiAgICB0aGlzLnZhbHVlQmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxLCB7XG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMudGV4dEJhY2tncm91bmRDb3JuZXJSYWRpdXMsXG4gICAgICBmaWxsOiBvcHRpb25zLnRleHRCYWNrZ3JvdW5kQ29sb3JcbiAgICB9ICk7XG5cbiAgICAvLyBSZXNpemVzIHRoZSB2YWx1ZSBiYWNrZ3JvdW5kIGFuZCBjZW50ZXJzIGl0IG9uIHRoZSB2YWx1ZVxuICAgIGNvbnN0IHVwZGF0ZVZhbHVlQmFja2dyb3VuZE5vZGUgPSAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZUJhY2tncm91bmRXaWR0aCA9IHRoaXMudmFsdWVOb2RlLndpZHRoICsgKCAyICogb3B0aW9ucy50ZXh0QmFja2dyb3VuZFhNYXJnaW4gKTtcbiAgICAgIGNvbnN0IHZhbHVlQmFja2dyb3VuZEhlaWdodCA9IHRoaXMudmFsdWVOb2RlLmhlaWdodCArICggMiAqIG9wdGlvbnMudGV4dEJhY2tncm91bmRZTWFyZ2luICk7XG4gICAgICB0aGlzLnZhbHVlQmFja2dyb3VuZE5vZGUuc2V0UmVjdCggMCwgMCwgdmFsdWVCYWNrZ3JvdW5kV2lkdGgsIHZhbHVlQmFja2dyb3VuZEhlaWdodCApO1xuICAgICAgdGhpcy52YWx1ZUJhY2tncm91bmROb2RlLmNlbnRlciA9IHRoaXMudmFsdWVOb2RlLmNlbnRlcjtcbiAgICB9O1xuICAgIHRoaXMudmFsdWVOb2RlLmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCB1cGRhdGVWYWx1ZUJhY2tncm91bmROb2RlICk7XG4gICAgdXBkYXRlVmFsdWVCYWNrZ3JvdW5kTm9kZSgpO1xuXG4gICAgLy8gZXhwYW5kIHRoZSBhcmVhIGZvciB0b3VjaFxuICAgIHRpcC50b3VjaEFyZWEgPSB0aXAubG9jYWxCb3VuZHMuZGlsYXRlZCggMTUgKTtcbiAgICB0aGlzLmJhc2VJbWFnZS50b3VjaEFyZWEgPSB0aGlzLmJhc2VJbWFnZS5sb2NhbEJvdW5kcy5kaWxhdGVkKCAyMCApO1xuICAgIHRoaXMuYmFzZUltYWdlLm1vdXNlQXJlYSA9IHRoaXMuYmFzZUltYWdlLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDEwICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCB0YXBlTGluZSApOyAvLyB0YXBlbGluZSBnb2luZyBmcm9tIG9uZSBjcm9zc2hhaXIgdG8gdGhlIG90aGVyXG4gICAgdGhpcy5hZGRDaGlsZCggYmFzZUNyb3NzaGFpciApOyAvLyBjcm9zc2hhaXIgbmVhciB0aGUgYmFzZSwgKHNldCBhdCBiYXNlUG9zaXRpb24pXG4gICAgdGhpcy5hZGRDaGlsZCggYmFzZUltYWdlUGFyZW50ICk7IC8vIGJhc2Ugb2YgdGhlIG1lYXN1cmluZyB0YXBlXG5cbiAgICB0aGlzLnZhbHVlQ29udGFpbmVyID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgdGhpcy52YWx1ZUJhY2tncm91bmROb2RlLCB0aGlzLnZhbHVlTm9kZSBdIH0gKTtcbiAgICBpZiAoIG9wdGlvbnMuaGFzVmFsdWUgKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnZhbHVlQ29udGFpbmVyICk7XG4gICAgfVxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpcCApOyAvLyBjcm9zc2hhaXIgYW5kIGNpcmNsZSBhdCB0aGUgdGlwIChzZXQgYXQgdGlwUG9zaXRpb24pXG5cbiAgICBsZXQgYmFzZVN0YXJ0T2Zmc2V0OiBWZWN0b3IyO1xuXG4gICAgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyID0gbnVsbDtcbiAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmUgKSB7XG5cbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodHMgLSBoaWdobGlnaHRzIGFyZSBlbmFibGVkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGlzIGludGVyYWN0aXZlXG4gICAgICBiYXNlSW1hZ2VQYXJlbnQuaW50ZXJhY3RpdmVIaWdobGlnaHRFbmFibGVkID0gdHJ1ZTtcbiAgICAgIHRpcC5pbnRlcmFjdGl2ZUhpZ2hsaWdodEVuYWJsZWQgPSB0cnVlO1xuXG4gICAgICBjb25zdCBiYXNlU3RhcnQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcbiAgICAgICAgb3B0aW9ucy5iYXNlRHJhZ1N0YXJ0ZWQoKTtcbiAgICAgICAgdGhpcy5faXNCYXNlVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBiYXNlRW5kID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9pc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgICAgIG9wdGlvbnMuYmFzZURyYWdFbmRlZCgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaGFuZGxlVGlwT25CYXNlRHJhZyA9ICggZGVsdGE6IFZlY3RvcjIgKSA9PiB7XG5cbiAgICAgICAgLy8gdHJhbnNsYXRlIHRoZSBwb3NpdGlvbiBvZiB0aGUgdGlwIGlmIGl0IGlzIG5vdCBiZWluZyBkcmFnZ2VkXG4gICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaXMgbm90IGhvbGRpbmcgb250byB0aGUgdGlwLCBkcmFnZ2luZyB0aGUgYm9keSB3aWxsIGFsc28gZHJhZyB0aGUgdGlwXG4gICAgICAgIGlmICggIXRoaXMuaXNUaXBVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICAgIGNvbnN0IHVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiA9IGRlbHRhLnBsdXMoIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xuICAgICAgICAgIGlmICggb3B0aW9ucy5pc1RpcERyYWdCb3VuZGVkICkge1xuICAgICAgICAgICAgY29uc3QgY29uc3RyYWluZWRUaXBQb3NpdGlvbiA9IHRoaXMuZHJhZ0JvdW5kc1Byb3BlcnR5LnZhbHVlLmNsb3Nlc3RQb2ludFRvKCB1bmNvbnN0cmFpbmVkVGlwUG9zaXRpb24gKTtcbiAgICAgICAgICAgIC8vIHRyYW5zbGF0aW9uIG9mIHRoZSB0aXBQb3NpdGlvbiAoc3ViamVjdCB0byB0aGUgY29uc3RyYWluaW5nIGRyYWcgYm91bmRzKVxuICAgICAgICAgICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnNldCggY29uc3RyYWluZWRUaXBQb3NpdGlvbiApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gRHJhZyBsaXN0ZW5lciBmb3IgYmFzZVxuICAgICAgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyID0gbmV3IFNvdW5kRHJhZ0xpc3RlbmVyKCBjb21iaW5lT3B0aW9uczxTb3VuZERyYWdMaXN0ZW5lck9wdGlvbnM+KCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2Jhc2VEcmFnTGlzdGVuZXInICksXG4gICAgICAgIHN0YXJ0OiBldmVudCA9PiB7XG4gICAgICAgICAgYmFzZVN0YXJ0KCk7XG4gICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLm1vZGVsVG9WaWV3UG9zaXRpb24oIHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcbiAgICAgICAgICBiYXNlU3RhcnRPZmZzZXQgPSBldmVudC5jdXJyZW50VGFyZ2V0IS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIHBvc2l0aW9uICk7XG4gICAgICAgIH0sXG4gICAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmVudFBvaW50ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldC5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkubWludXMoIGJhc2VTdGFydE9mZnNldCApO1xuICAgICAgICAgIGNvbnN0IHVuY29uc3RyYWluZWRCYXNlUG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLnZpZXdUb01vZGVsUG9zaXRpb24oIHBhcmVudFBvaW50ICk7XG4gICAgICAgICAgY29uc3QgY29uc3RyYWluZWRCYXNlUG9zaXRpb24gPSB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5jbG9zZXN0UG9pbnRUbyggdW5jb25zdHJhaW5lZEJhc2VQb3NpdGlvbiApO1xuXG4gICAgICAgICAgLy8gdGhlIGJhc2VQb3NpdGlvbiB2YWx1ZSBoYXMgbm90IGJlZW4gdXBkYXRlZCB5ZXQsIGhlbmNlIGl0IGlzIHRoZSBvbGQgdmFsdWUgb2YgdGhlIGJhc2VQb3NpdGlvbjtcbiAgICAgICAgICBjb25zdCB0cmFuc2xhdGlvbkRlbHRhID0gY29uc3RyYWluZWRCYXNlUG9zaXRpb24ubWludXMoIHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTsgLy8gaW4gbW9kZWwgcmVmZXJlbmNlIGZyYW1lXG5cbiAgICAgICAgICAvLyB0cmFuc2xhdGlvbiBvZiB0aGUgYmFzZVBvc2l0aW9uIChzdWJqZWN0IHRvIHRoZSBjb25zdHJhaW5pbmcgZHJhZyBib3VuZHMpXG4gICAgICAgICAgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGNvbnN0cmFpbmVkQmFzZVBvc2l0aW9uICk7XG5cbiAgICAgICAgICBoYW5kbGVUaXBPbkJhc2VEcmFnKCB0cmFuc2xhdGlvbkRlbHRhICk7XG4gICAgICAgIH0sXG4gICAgICAgIGVuZDogYmFzZUVuZFxuICAgICAgfSwgb3B0aW9ucy5iYXNlRHJhZ0xpc3RlbmVyT3B0aW9ucyApICk7XG4gICAgICB0aGlzLmJhc2VJbWFnZS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmJhc2VEcmFnTGlzdGVuZXIgKTtcblxuICAgICAgLy8gRHJhZyBsaXN0ZW5lciBmb3IgYmFzZVxuICAgICAgY29uc3QgYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyID0gbmV3IFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIoIGNvbWJpbmVPcHRpb25zPFNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXJPcHRpb25zPigge1xuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdiYXNlS2V5Ym9hcmREcmFnTGlzdGVuZXInICksXG4gICAgICAgIHBvc2l0aW9uUHJvcGVydHk6IHRoaXMuYmFzZVBvc2l0aW9uUHJvcGVydHksXG4gICAgICAgIHRyYW5zZm9ybTogdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSxcbiAgICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eSxcbiAgICAgICAgc3RhcnQ6IGJhc2VTdGFydCxcbiAgICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7IGhhbmRsZVRpcE9uQmFzZURyYWcoIGxpc3RlbmVyLm1vZGVsRGVsdGEgKTsgfSxcbiAgICAgICAgZW5kOiBiYXNlRW5kXG4gICAgICB9LCBvcHRpb25zLmJhc2VLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMgKSApO1xuICAgICAgdGhpcy5iYXNlSW1hZ2UuYWRkSW5wdXRMaXN0ZW5lciggYmFzZUtleWJvYXJkRHJhZ0xpc3RlbmVyICk7XG5cbiAgICAgIGNvbnN0IHRpcEVuZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5faXNUaXBVc2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICBsZXQgdGlwU3RhcnRPZmZzZXQ6IFZlY3RvcjI7XG5cbiAgICAgIC8vIERyYWcgbGlzdGVuZXIgZm9yIHRpcFxuICAgICAgY29uc3QgdGlwRHJhZ0xpc3RlbmVyID0gbmV3IFNvdW5kRHJhZ0xpc3RlbmVyKCBjb21iaW5lT3B0aW9uczxTb3VuZERyYWdMaXN0ZW5lck9wdGlvbnM+KCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3RpcERyYWdMaXN0ZW5lcicgKSxcblxuICAgICAgICBzdGFydDogZXZlbnQgPT4ge1xuICAgICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcbiAgICAgICAgICB0aGlzLl9pc1RpcFVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcbiAgICAgICAgICB0aXBTdGFydE9mZnNldCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQhLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51cyggcG9zaXRpb24gKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRQb2ludCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXQuZ2xvYmFsVG9QYXJlbnRQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApLm1pbnVzKCB0aXBTdGFydE9mZnNldCApO1xuICAgICAgICAgIGNvbnN0IHVuY29uc3RyYWluZWRUaXBQb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUudmlld1RvTW9kZWxQb3NpdGlvbiggcGFyZW50UG9pbnQgKTtcblxuICAgICAgICAgIGlmICggb3B0aW9ucy5pc1RpcERyYWdCb3VuZGVkICkge1xuICAgICAgICAgICAgLy8gdHJhbnNsYXRpb24gb2YgdGhlIHRpcFBvc2l0aW9uIChzdWJqZWN0IHRvIHRoZSBjb25zdHJhaW5pbmcgZHJhZyBib3VuZHMpXG4gICAgICAgICAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLmRyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5jbG9zZXN0UG9pbnRUbyggdW5jb25zdHJhaW5lZFRpcFBvc2l0aW9uICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdW5jb25zdHJhaW5lZFRpcFBvc2l0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlbmQ6IHRpcEVuZFxuICAgICAgfSwgb3B0aW9ucy50aXBEcmFnTGlzdGVuZXJPcHRpb25zICkgKTtcbiAgICAgIHRpcC5hZGRJbnB1dExpc3RlbmVyKCB0aXBEcmFnTGlzdGVuZXIgKTtcblxuICAgICAgY29uc3QgdGlwS2V5Ym9hcmREcmFnTGlzdGVuZXIgPSBuZXcgU291bmRLZXlib2FyZERyYWdMaXN0ZW5lciggY29tYmluZU9wdGlvbnM8U291bmRLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnM+KCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3RpcEtleWJvYXJkRHJhZ0xpc3RlbmVyJyApLFxuICAgICAgICBwb3NpdGlvblByb3BlcnR5OiB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHksXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogb3B0aW9ucy5pc1RpcERyYWdCb3VuZGVkID8gdGhpcy5kcmFnQm91bmRzUHJvcGVydHkgOiBudWxsLFxuICAgICAgICB0cmFuc2Zvcm06IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHksXG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xuICAgICAgICAgIHRoaXMuX2lzVGlwVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVuZDogdGlwRW5kXG4gICAgICB9LCBvcHRpb25zLnRpcEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyApICk7XG4gICAgICB0aXAuYWRkSW5wdXRMaXN0ZW5lciggdGlwS2V5Ym9hcmREcmFnTGlzdGVuZXIgKTtcblxuICAgICAgLy8gSWYgdGhpcyBOb2RlIGJlY29tZXMgaW52aXNpYmxlLCBpbnRlcnJ1cHQgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgIHRoaXMudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB2aXNpYmxlID0+IHtcbiAgICAgICAgaWYgKCAhdmlzaWJsZSApIHtcbiAgICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlVGV4dFJlYWRvdXQgPSAoKSA9PiB7XG4gICAgICB0aGlzLnZhbHVlTm9kZS5jZW50ZXJUb3AgPSB0aGlzLmJhc2VJbWFnZS5jZW50ZXIucGx1cyggb3B0aW9ucy50ZXh0UG9zaXRpb24udGltZXMoIG9wdGlvbnMuYmFzZVNjYWxlICkgKTtcbiAgICB9O1xuICAgIHJlYWRvdXRTdHJpbmdQcm9wZXJ0eS5saW5rKCB1cGRhdGVUZXh0UmVhZG91dCApO1xuXG4gICAgLy8gbGluayB0aGUgcG9zaXRpb25zIG9mIGJhc2UgYW5kIHRpcCB0byB0aGUgbWVhc3VyaW5nIHRhcGUgdG8gdGhlIHNjZW5lcnkgdXBkYXRlIGZ1bmN0aW9uLlxuICAgIC8vIE11c3QgYmUgZGlzcG9zZWQuXG4gICAgY29uc3QgbXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcbiAgICAgIFsgdGhpcy5tZWFzdXJlZERpc3RhbmNlUHJvcGVydHksIHVuaXRzUHJvcGVydHksIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHksIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eSwgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eSBdLCAoXG4gICAgICAgIG1lYXN1cmVkRGlzdGFuY2UsIHVuaXRzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRpcFBvc2l0aW9uLCBiYXNlUG9zaXRpb24gKSA9PiB7XG5cbiAgICAgICAgY29uc3Qgdmlld1RpcFBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHRpcFBvc2l0aW9uICk7XG4gICAgICAgIGNvbnN0IHZpZXdCYXNlUG9zaXRpb24gPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggYmFzZVBvc2l0aW9uICk7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvcmllbnRhdGlvbiBhbmQgY2hhbmdlIG9mIG9yaWVudGF0aW9uIG9mIHRoZSBNZWFzdXJpbmcgdGFwZVxuICAgICAgICBjb25zdCBvbGRBbmdsZSA9IHRoaXMuYmFzZUltYWdlLmdldFJvdGF0aW9uKCk7XG4gICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMiggdmlld1RpcFBvc2l0aW9uLnkgLSB2aWV3QmFzZVBvc2l0aW9uLnksIHZpZXdUaXBQb3NpdGlvbi54IC0gdmlld0Jhc2VQb3NpdGlvbi54ICk7XG4gICAgICAgIGNvbnN0IGRlbHRhQW5nbGUgPSBhbmdsZSAtIG9sZEFuZ2xlO1xuXG4gICAgICAgIC8vIHNldCBwb3NpdGlvbiBvZiB0aGUgdGlwIGFuZCB0aGUgYmFzZSBjcm9zc2hhaXJcbiAgICAgICAgYmFzZUNyb3NzaGFpci5jZW50ZXIgPSB2aWV3QmFzZVBvc2l0aW9uO1xuICAgICAgICB0aXAuY2VudGVyID0gdmlld1RpcFBvc2l0aW9uO1xuXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGF2b2lkIGFsbCBraW5kIG9mIGdlb21ldHJpY2FsIGlzc3VlcyB3aXRoIHBvc2l0aW9uLFxuICAgICAgICAvLyBsZXQncyByZXNldCB0aGUgYmFzZUltYWdlIHVwcmlnaHQgYW5kIHRoZW4gc2V0IGl0cyBwb3NpdGlvbiBhbmQgcm90YXRpb25cbiAgICAgICAgdGhpcy5iYXNlSW1hZ2Uuc2V0Um90YXRpb24oIDAgKTtcbiAgICAgICAgdGhpcy5iYXNlSW1hZ2UucmlnaHRCb3R0b20gPSB2aWV3QmFzZVBvc2l0aW9uO1xuICAgICAgICB0aGlzLmJhc2VJbWFnZS5yb3RhdGVBcm91bmQoIHRoaXMuYmFzZUltYWdlLnJpZ2h0Qm90dG9tLCBhbmdsZSApO1xuXG4gICAgICAgIC8vIHJlcG9zaXRpb24gdGhlIHRhcGVsaW5lXG4gICAgICAgIHRhcGVMaW5lLnNldExpbmUoIHZpZXdCYXNlUG9zaXRpb24ueCwgdmlld0Jhc2VQb3NpdGlvbi55LCB2aWV3VGlwUG9zaXRpb24ueCwgdmlld1RpcFBvc2l0aW9uLnkgKTtcblxuICAgICAgICAvLyByb3RhdGUgdGhlIGNyb3NzaGFpcnNcbiAgICAgICAgaWYgKCBvcHRpb25zLmlzVGlwQ3Jvc3NoYWlyUm90YXRpbmcgKSB7XG4gICAgICAgICAgdGlwLnJvdGF0ZUFyb3VuZCggdmlld1RpcFBvc2l0aW9uLCBkZWx0YUFuZ2xlICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBvcHRpb25zLmlzQmFzZUNyb3NzaGFpclJvdGF0aW5nICkge1xuICAgICAgICAgIGJhc2VDcm9zc2hhaXIucm90YXRlQXJvdW5kKCB2aWV3QmFzZVBvc2l0aW9uLCBkZWx0YUFuZ2xlICk7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVUZXh0UmVhZG91dCgpO1xuICAgICAgfSApO1xuXG4gICAgdGhpcy5kaXNwb3NlTWVhc3VyaW5nVGFwZU5vZGUgPSAoKSA9PiB7XG4gICAgICBtdWx0aWxpbmsuZGlzcG9zZSgpO1xuICAgICAgcmVhZG91dFN0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgICAgdGhpcy5vd25zQmFzZVBvc2l0aW9uUHJvcGVydHkgJiYgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLm93bnNUaXBQb3NpdGlvblByb3BlcnR5ICYmIHRoaXMudGlwUG9zaXRpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XG5cbiAgICAgIC8vIGludGVyYWN0aXZlIGhpZ2hsaWdodGluZyByZWxhdGVkIGxpc3RlbmVycyByZXF1aXJlIGRpc3Bvc2FsXG4gICAgICBiYXNlSW1hZ2VQYXJlbnQuZGlzcG9zZSgpO1xuICAgICAgdGlwLmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnTWVhc3VyaW5nVGFwZU5vZGUnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5vd25zQmFzZVBvc2l0aW9uUHJvcGVydHkgJiYgdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMub3duc1RpcFBvc2l0aW9uUHJvcGVydHkgJiYgdGhpcy50aXBQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VNZWFzdXJpbmdUYXBlTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkcmFnQm91bmRzIG9mIHRoZSBtZWFzdXJpbmcgdGFwZS5cbiAgICogSW4gYWRkaXRpb24sIGl0IGZvcmNlcyB0aGUgdGlwIGFuZCBiYXNlIG9mIHRoZSBtZWFzdXJpbmcgdGFwZSB0byBiZSB3aXRoaW4gdGhlIG5ldyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0RHJhZ0JvdW5kcyggbmV3RHJhZ0JvdW5kczogQm91bmRzMiApOiB2b2lkIHtcbiAgICBjb25zdCBkcmFnQm91bmRzID0gbmV3RHJhZ0JvdW5kcy5jb3B5KCk7XG4gICAgdGhpcy5kcmFnQm91bmRzUHJvcGVydHkudmFsdWUgPSBkcmFnQm91bmRzO1xuXG4gICAgLy8gc2V0cyB0aGUgYmFzZSBwb3NpdGlvbiBvZiB0aGUgbWVhc3VyaW5nIHRhcGUsIHdoaWNoIG1heSBoYXZlIGNoYW5nZWQgaWYgaXQgd2FzIG91dHNpZGUgb2YgdGhlIGRyYWdCb3VuZHNcbiAgICB0aGlzLmJhc2VQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gZHJhZ0JvdW5kcy5jbG9zZXN0UG9pbnRUbyggdGhpcy5iYXNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xuXG4gICAgLy8gc2V0cyBhIG5ldyB0aXAgcG9zaXRpb24gaWYgdGhlIHRpcCBvZiB0aGUgbWVhc3VyaW5nIHRhcGUgaXMgc3ViamVjdCB0byBkcmFnQm91bmRzXG4gICAgaWYgKCB0aGlzLmlzVGlwRHJhZ0JvdW5kZWQgKSB7XG4gICAgICB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBkcmFnQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB0aGlzLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZHJhZ0JvdW5kcyBvZiB0aGUgbWVhc3VyaW5nIHRhcGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0RHJhZ0JvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5kcmFnQm91bmRzUHJvcGVydHkudmFsdWUuY29weSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlciBvZiB0aGUgYmFzZSBpbiB0aGUgbWVhc3VyaW5nIHRhcGUncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsQmFzZUNlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIC10aGlzLmJhc2VJbWFnZS5pbWFnZVdpZHRoIC8gMiwgLXRoaXMuYmFzZUltYWdlLmltYWdlSGVpZ2h0IC8gMiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGUgbWVhc3VyaW5nIHRhcGUncyBiYXNlIHdpdGhpbiBpdHMgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKi9cbiAgcHVibGljIGdldExvY2FsQmFzZUJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5iYXNlSW1hZ2UuYm91bmRzLmNvcHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWF0ZXMgYSBkcmFnIG9mIHRoZSBiYXNlICh3aG9sZSBtZWFzdXJpbmcgdGFwZSkgZnJvbSBhIFNjZW5lcnkgZXZlbnQuXG4gICAqL1xuICBwdWJsaWMgc3RhcnRCYXNlRHJhZyggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApOiB2b2lkIHtcbiAgICB0aGlzLmJhc2VEcmFnTGlzdGVuZXIgJiYgdGhpcy5iYXNlRHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaWNvbiBvZiB0aGUgbWVhc3VyaW5nIHRhcGUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUljb24oIHByb3ZpZGVkT3B0aW9ucz86IE1lYXN1cmluZ1RhcGVJY29uT3B0aW9ucyApOiBOb2RlIHtcblxuICAgIC8vIFNlZSBkb2N1bWVudGF0aW9uIGFib3ZlIVxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWVhc3VyaW5nVGFwZUljb25PcHRpb25zLCBNZWFzdXJpbmdUYXBlSWNvblNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgdGFwZUxlbmd0aDogMzBcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIENyZWF0ZSBhbiBhY3R1YWwgbWVhc3VyaW5nIHRhcGUuXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIG5ldyBQcm9wZXJ0eSggeyBuYW1lOiAnJywgbXVsdGlwbGllcjogMSB9ICksIHtcbiAgICAgIHRpcFBvc2l0aW9uUHJvcGVydHk6IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCBvcHRpb25zLnRhcGVMZW5ndGgsIDAgKSApLFxuICAgICAgaGFzVmFsdWU6IGZhbHNlLCAvLyBubyB2YWx1ZSBiZWxvdyB0aGUgdGFwZVxuICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlXG4gICAgfSApO1xuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIG1lYXN1cmluZ1RhcGVOb2RlIF07XG5cbiAgICAvLyBDcmVhdGUgdGhlIGljb24sIHdpdGggbWVhc3VyaW5nVGFwZSBhcyBpdHMgaW5pdGlhbCBjaGlsZC4gIFRoaXMgY2hpbGQgd2lsbCBiZSByZXBsYWNlZCBvbmNlIHRoZSBpbWFnZSBiZWNvbWVzXG4gICAgLy8gYXZhaWxhYmxlIGluIHRoZSBjYWxsYmFjayB0byB0b0ltYWdlIChzZWUgYmVsb3cpLiBTaW5jZSB0b0ltYWdlIGhhcHBlbnMgYXN5bmNocm9ub3VzbHksIHRoaXMgZW5zdXJlcyB0aGF0XG4gICAgLy8gdGhlIGljb24gaGFzIGluaXRpYWwgYm91bmRzIHRoYXQgd2lsbCBtYXRjaCB0aGUgaWNvbiBvbmNlIHRoZSBpbWFnZSBpcyBhdmFpbGFibGUuXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZUljb24gPSBuZXcgTm9kZSggb3B0aW9ucyApO1xuXG4gICAgLy8gQ29udmVydCBtZWFzdXJpbmdUYXBlTm9kZSB0byBhbiBpbWFnZSwgYW5kIG1ha2UgaXQgdGhlIGNoaWxkIG9mIG1lYXN1cmluZ1RhcGVJY29uLlxuICAgIG1lYXN1cmluZ1RhcGVOb2RlLnRvSW1hZ2UoIGltYWdlID0+IG1lYXN1cmluZ1RhcGVJY29uLnNldENoaWxkcmVuKCBbIG5ldyBJbWFnZSggaW1hZ2UgKSBdICkgKTtcblxuICAgIHJldHVybiBtZWFzdXJpbmdUYXBlSWNvbjtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ01lYXN1cmluZ1RhcGVOb2RlJywgTWVhc3VyaW5nVGFwZU5vZGUgKTtcblxuZXhwb3J0IGRlZmF1bHQgTWVhc3VyaW5nVGFwZU5vZGU7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIkRlcml2ZWRTdHJpbmdQcm9wZXJ0eSIsIk11bHRpbGluayIsIlByb3BlcnR5IiwiQm91bmRzMiIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiU3RyaW5nVXRpbHMiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQ2lyY2xlIiwiSW1hZ2UiLCJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZ05vZGUiLCJMaW5lIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVGFuZGVtIiwiTnVtYmVySU8iLCJtZWFzdXJpbmdUYXBlX3BuZyIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldFN0cmluZ3MiLCJTb3VuZERyYWdMaXN0ZW5lciIsIlNvdW5kS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJLRVlCT0FSRF9EUkFHX1NQRUVEIiwiTWVhc3VyaW5nVGFwZU5vZGUiLCJyZXNldCIsIm93bnNCYXNlUG9zaXRpb25Qcm9wZXJ0eSIsImJhc2VQb3NpdGlvblByb3BlcnR5Iiwib3duc1RpcFBvc2l0aW9uUHJvcGVydHkiLCJ0aXBQb3NpdGlvblByb3BlcnR5IiwiZGlzcG9zZSIsImRpc3Bvc2VNZWFzdXJpbmdUYXBlTm9kZSIsInNldERyYWdCb3VuZHMiLCJuZXdEcmFnQm91bmRzIiwiZHJhZ0JvdW5kcyIsImNvcHkiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJ2YWx1ZSIsImNsb3Nlc3RQb2ludFRvIiwiaXNUaXBEcmFnQm91bmRlZCIsImdldERyYWdCb3VuZHMiLCJnZXRMb2NhbEJhc2VDZW50ZXIiLCJiYXNlSW1hZ2UiLCJpbWFnZVdpZHRoIiwiaW1hZ2VIZWlnaHQiLCJnZXRMb2NhbEJhc2VCb3VuZHMiLCJib3VuZHMiLCJzdGFydEJhc2VEcmFnIiwiZXZlbnQiLCJiYXNlRHJhZ0xpc3RlbmVyIiwicHJlc3MiLCJjcmVhdGVJY29uIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRhcGVMZW5ndGgiLCJtZWFzdXJpbmdUYXBlTm9kZSIsIm5hbWUiLCJtdWx0aXBsaWVyIiwiaGFzVmFsdWUiLCJpbnRlcmFjdGl2ZSIsImNoaWxkcmVuIiwibWVhc3VyaW5nVGFwZUljb24iLCJ0b0ltYWdlIiwiaW1hZ2UiLCJzZXRDaGlsZHJlbiIsInVuaXRzUHJvcGVydHkiLCJ3aW5kb3ciLCJFVkVSWVRISU5HIiwidGV4dFBvc2l0aW9uIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlSWRlbnRpdHkiLCJzaWduaWZpY2FudEZpZ3VyZXMiLCJ0ZXh0Q29sb3IiLCJ0ZXh0QmFja2dyb3VuZENvbG9yIiwidGV4dEJhY2tncm91bmRYTWFyZ2luIiwidGV4dEJhY2tncm91bmRZTWFyZ2luIiwidGV4dEJhY2tncm91bmRDb3JuZXJSYWRpdXMiLCJ0ZXh0TWF4V2lkdGgiLCJ0ZXh0Rm9udCIsInNpemUiLCJ3ZWlnaHQiLCJiYXNlU2NhbGUiLCJsaW5lQ29sb3IiLCJ0YXBlTGluZVdpZHRoIiwidGlwQ2lyY2xlQ29sb3IiLCJ0aXBDaXJjbGVSYWRpdXMiLCJjcm9zc2hhaXJDb2xvciIsImNyb3NzaGFpclNpemUiLCJjcm9zc2hhaXJMaW5lV2lkdGgiLCJpc0Jhc2VDcm9zc2hhaXJSb3RhdGluZyIsImlzVGlwQ3Jvc3NoYWlyUm90YXRpbmciLCJiYXNlRHJhZ1N0YXJ0ZWQiLCJfIiwibm9vcCIsImJhc2VEcmFnRW5kZWQiLCJwaGV0aW9SZWFkb3V0U3RyaW5nUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwaGV0aW9GZWF0dXJlZE1lYXN1cmVkRGlzdGFuY2VQcm9wZXJ0eSIsImJhc2VLZXlib2FyZERyYWdMaXN0ZW5lck9wdGlvbnMiLCJkcmFnU3BlZWQiLCJzaGlmdERyYWdTcGVlZCIsInRpcEtleWJvYXJkRHJhZ0xpc3RlbmVyT3B0aW9ucyIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWCIsIm1vZGVsVG9WaWV3RGVsdGFZIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJfaXNUaXBVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiaXNUaXBVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwiX2lzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJpc0Jhc2VVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwidW5pdHMiLCJtZWFzdXJlZERpc3RhbmNlUHJvcGVydHkiLCJiYXNlUG9zaXRpb24iLCJ0aXBQb3NpdGlvbiIsImRpc3RhbmNlIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb1ZhbHVlVHlwZSIsInBoZXRpb0ZlYXR1cmVkIiwiY3Jvc3NoYWlyU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJiYXNlQ3Jvc3NoYWlyIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidGlwQ3Jvc3NoYWlyIiwidGlwQ2lyY2xlIiwiZmlsbCIsImJhc2VJbWFnZVBhcmVudCIsImludGVyYWN0aXZlSGlnaGxpZ2h0RW5hYmxlZCIsInNjYWxlIiwiY3Vyc29yIiwidGFnTmFtZSIsImZvY3VzYWJsZSIsImFyaWFSb2xlIiwiaW5uZXJDb250ZW50IiwiYTExeSIsIm1lYXN1cmluZ1RhcGVTdHJpbmdQcm9wZXJ0eSIsImFyaWFMYWJlbCIsImFkZENoaWxkIiwidGFwZUxpbmUiLCJ0aXAiLCJtZWFzdXJpbmdUYXBlVGlwU3RyaW5nUHJvcGVydHkiLCJyZWFkb3V0U3RyaW5nUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIm1lYXN1cmVkRGlzdGFuY2UiLCJtZWFzdXJpbmdUYXBlUmVhZG91dFBhdHRlcm4iLCJ0b0ZpeGVkIiwiZmlsbEluIiwiT1BUX09VVCIsInZhbHVlTm9kZSIsImZvbnQiLCJtYXhXaWR0aCIsInZhbHVlQmFja2dyb3VuZE5vZGUiLCJjb3JuZXJSYWRpdXMiLCJ1cGRhdGVWYWx1ZUJhY2tncm91bmROb2RlIiwidmFsdWVCYWNrZ3JvdW5kV2lkdGgiLCJ3aWR0aCIsInZhbHVlQmFja2dyb3VuZEhlaWdodCIsImhlaWdodCIsInNldFJlY3QiLCJjZW50ZXIiLCJib3VuZHNQcm9wZXJ0eSIsImxhenlMaW5rIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkIiwibW91c2VBcmVhIiwidmFsdWVDb250YWluZXIiLCJiYXNlU3RhcnRPZmZzZXQiLCJiYXNlU3RhcnQiLCJtb3ZlVG9Gcm9udCIsImJhc2VFbmQiLCJoYW5kbGVUaXBPbkJhc2VEcmFnIiwiZGVsdGEiLCJ1bmNvbnN0cmFpbmVkVGlwUG9zaXRpb24iLCJwbHVzIiwiY29uc3RyYWluZWRUaXBQb3NpdGlvbiIsInNldCIsInN0YXJ0IiwicG9zaXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiY3VycmVudFRhcmdldCIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJtaW51cyIsImRyYWciLCJsaXN0ZW5lciIsInBhcmVudFBvaW50IiwidW5jb25zdHJhaW5lZEJhc2VQb3NpdGlvbiIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJjb25zdHJhaW5lZEJhc2VQb3NpdGlvbiIsInRyYW5zbGF0aW9uRGVsdGEiLCJlbmQiLCJiYXNlRHJhZ0xpc3RlbmVyT3B0aW9ucyIsImFkZElucHV0TGlzdGVuZXIiLCJiYXNlS2V5Ym9hcmREcmFnTGlzdGVuZXIiLCJwb3NpdGlvblByb3BlcnR5IiwidHJhbnNmb3JtIiwibW9kZWxEZWx0YSIsInRpcEVuZCIsInRpcFN0YXJ0T2Zmc2V0IiwidGlwRHJhZ0xpc3RlbmVyIiwidGlwRHJhZ0xpc3RlbmVyT3B0aW9ucyIsInRpcEtleWJvYXJkRHJhZ0xpc3RlbmVyIiwidmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZSIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInVwZGF0ZVRleHRSZWFkb3V0IiwiY2VudGVyVG9wIiwidGltZXMiLCJsaW5rIiwibXVsdGlsaW5rIiwidmlld1RpcFBvc2l0aW9uIiwidmlld0Jhc2VQb3NpdGlvbiIsIm9sZEFuZ2xlIiwiZ2V0Um90YXRpb24iLCJhbmdsZSIsImF0YW4yIiwieSIsIngiLCJkZWx0YUFuZ2xlIiwic2V0Um90YXRpb24iLCJyaWdodEJvdHRvbSIsInJvdGF0ZUFyb3VuZCIsInNldExpbmUiLCJtdXRhdGUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsMkJBQTJCLHlDQUF5QztBQUMzRSxPQUFPQyxlQUFlLDZCQUE2QjtBQUNuRCxPQUFPQyxjQUFjLDRCQUE0QjtBQUdqRCxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxxQkFBcUIsa0NBQWtDO0FBQzlELFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0Msc0JBQXNCLHVEQUF1RDtBQUNwRixPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtD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