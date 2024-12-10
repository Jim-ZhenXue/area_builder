// Copyright 2019-2022, University of Colorado Boulder
/**
 * Base class for representation of plate charge.  Plate charge is represented
 * as an integer number of '+' or '-' symbols. These symbols are distributed
 * across some portion of the plate's top face.
 *
 * All model coordinates are relative to the capacitor's local coordinate frame.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import Multilink from '../../../axon/js/Multilink.js';
import validate from '../../../axon/js/validate.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { CanvasNode, Node } from '../../../scenery/js/imports.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import CapacitorConstants from './CapacitorConstants.js';
// constants
const POSITIVE_CHARGE_COLOR = PhetColorScheme.RED_COLORBLIND.toCSS(); // CSS passed into context fillStyle
const NEGATIVE_CHARGE_COLOR = 'blue';
const NUMBER_OF_PLATE_CHARGES = new Range(1, 625);
const NEGATIVE_CHARGE_SIZE = new Dimension2(7, 2);
let PlateChargeNode = class PlateChargeNode extends CanvasNode {
    /**
   * @param {number} numberOfObjects
   * @param {number} width
   * @param {number} height
   * @private
   *
   * @returns {Dimension2}
   */ getGridSize(numberOfObjects, width, height) {
        let columns = 0;
        let rows = 0;
        if (numberOfObjects > 0) {
            const alpha = Math.sqrt(numberOfObjects / width / height);
            columns = Utils.roundSymmetric(width * alpha);
            // compute rows 2 ways, choose the best fit
            const rows1 = Utils.roundSymmetric(height * alpha);
            const rows2 = Utils.roundSymmetric(numberOfObjects / columns);
            if (rows1 !== rows2) {
                const error1 = Math.abs(numberOfObjects - rows1 * columns);
                const error2 = Math.abs(numberOfObjects - rows2 * columns);
                rows = error1 < error2 ? rows1 : rows2;
            } else {
                rows = rows1;
            }
            // handle boundary cases
            if (columns === 0) {
                columns = 1;
                rows = numberOfObjects;
            } else if (rows === 0) {
                rows = 1;
                columns = numberOfObjects;
            }
        }
        assert && assert(columns >= 0 && rows >= 0, 'There must be at least 1 column or 1 row of charges.');
        return new Dimension2(columns, rows);
    }
    /**
   * Get plate charge from capacitor in the model
   * @public
   *
   * @returns {number} charge
   */ getPlateCharge() {
        return this.capacitor.plateChargeProperty.value;
    }
    /**
   * Gets the x offset (relative to the plate origin) of the portion of the plate that is facing the vacuum gap
   * @public
   *
   * @returns {number} offset
   */ getContactXOrigin() {
        return -this.capacitor.plateSizeProperty.value.width / 2;
    }
    /**
   * Gets the width of the portion of the plate that is in contact with air.
   * @public
   *
   * @returns {number}
   */ getContactWidth() {
        return this.capacitor.plateSizeProperty.value.width;
    }
    /**
   * Returns true if plate is positively charged
   *
   * @returns {Boolean}
   * @public
   */ isPositivelyCharged() {
        return this.getPlateCharge() >= 0 && this.polarity === CapacitorConstants.POLARITY.POSITIVE || this.getPlateCharge() < 0 && this.polarity === CapacitorConstants.POLARITY.NEGATIVE;
    }
    /**
   * Updates the view to match the model. Charges are arranged in a grid.
   *
   * @param {CanvasRenderingContext2D} context
   * @public
   */ paintCanvas(context) {
        const plateCharge = this.getPlateCharge();
        const numberOfCharges = this.getNumberOfCharges(plateCharge, this.maxPlateCharge);
        if (numberOfCharges > 0) {
            const zMargin = this.modelViewTransform.viewToModelDeltaXY(NEGATIVE_CHARGE_SIZE.width, 0).x;
            const gridWidth = this.getContactWidth(); // contact between plate and vacuum gap
            const gridDepth = this.capacitor.plateSizeProperty.value.depth - 2 * zMargin;
            // grid dimensions
            const gridSize = this.getGridSize(numberOfCharges, gridWidth, gridDepth);
            const rows = gridSize.height;
            const columns = gridSize.width;
            // distance between cells
            const dx = gridWidth / columns;
            const dz = gridDepth / rows;
            // offset to move us to the center of cells
            const xOffset = dx / 2;
            const zOffset = dz / 2;
            // populate the grid
            for(let row = 0; row < rows; row++){
                for(let column = 0; column < columns; column++){
                    // calculate center position for the charge in cell of the grid
                    const x = this.getContactXOrigin() + xOffset + column * dx;
                    const y = 0;
                    let z = -(gridDepth / 2) + zMargin / 2 + zOffset + row * dz;
                    // #2935, so that single charge is not obscured by wire connected to center of top plate
                    if (numberOfCharges === 1) {
                        z -= dz / 6;
                    }
                    const centerPosition = this.modelViewTransform.modelToViewXYZ(x, y, z);
                    // add the signed charge to the grid
                    if (this.isPositivelyCharged()) {
                        addPositiveCharge(centerPosition, context);
                    } else {
                        addNegativeCharge(centerPosition, context, this.orientation);
                    }
                }
            }
        }
    }
    /**
   * Computes number of charges, linearly proportional to plate charge.  If plate charge is less than half of an
   * electron charge, number of charges is zero.
   * @public
   *
   * @param {number} plateCharge
   * @param {number} maxPlateCharge
   * @returns {number}
   */ getNumberOfCharges(plateCharge, maxPlateCharge) {
        const absCharge = Math.abs(plateCharge);
        let numberOfCharges = Utils.toFixedNumber(NUMBER_OF_PLATE_CHARGES.max * (absCharge / maxPlateCharge), 0);
        if (absCharge > 0 && numberOfCharges < NUMBER_OF_PLATE_CHARGES.min) {
            numberOfCharges = NUMBER_OF_PLATE_CHARGES.min;
        }
        return Math.min(NUMBER_OF_PLATE_CHARGES.max, numberOfCharges);
    }
    /**
   * @param {Capacitor} capacitor
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Object} [options]
   */ constructor(capacitor, modelViewTransform, options){
        options = merge({
            // {string} - 'POSITIVE' or 'NEGATIVE'
            polarity: CapacitorConstants.POLARITY.POSITIVE,
            maxPlateCharge: Infinity,
            opacity: 1.0,
            orientation: Orientation.VERTICAL,
            canvasBounds: null // Bounds2|null
        }, options);
        validate(options.orientation, {
            validValues: Orientation.enumeration.values
        });
        super({
            canvasBounds: options.canvasBounds
        });
        const self = this; // extend scope for nested callbacks
        // @private {Capacitor}
        this.capacitor = capacitor;
        // @private {Orientation}
        this.orientation = options.orientation;
        // @private {YawPitchModelViewTransform3}
        this.modelViewTransform = modelViewTransform;
        // @private {string} - 'POSITIVE' or 'NEGATIVE'
        this.polarity = options.polarity;
        // @private {number}
        this.maxPlateCharge = options.maxPlateCharge;
        // @private {number}
        this.opacity = options.opacity;
        this.parentNode = new Node(); // @private parent node for charges
        this.addChild(this.parentNode);
        // No disposal required because the capacitor exists for the life of the sim
        Multilink.multilink([
            capacitor.plateSizeProperty,
            capacitor.plateChargeProperty
        ], ()=>self.isVisible() && self.invalidatePaint());
        // Update when this Node becomes visible.
        this.visibleProperty.link((visible)=>visible && this.invalidatePaint());
    }
};
/**
 * Draw a positive charge with canvas.  'Plus' sign is painted with two
 * overlapping rectangles around a center position.
 *
 * @param {Vector2} position - center position of the charge in view space
 * @param {CanvasRenderingContext2D} context - context for the canvas methods
 * @private
 */ const addPositiveCharge = (position, context)=>{
    const chargeWidth = NEGATIVE_CHARGE_SIZE.width;
    const chargeHeight = NEGATIVE_CHARGE_SIZE.height;
    context.fillStyle = POSITIVE_CHARGE_COLOR;
    context.fillRect(position.x - chargeWidth / 2, position.y - chargeHeight / 2, chargeWidth, chargeHeight);
    context.fillRect(position.x - chargeHeight / 2, position.y - chargeWidth / 2, chargeHeight, chargeWidth);
};
/**
 * Draw a negative charge with canvas.  'Minus' sign is painted with a single
 * rectangle around a center position.
 *
 * @param {Vector2} position
 * @param {CanvasRenderingContext2D} context
 * @param {string} orientation
 * @private
 */ const addNegativeCharge = (position, context, orientation)=>{
    const chargeWidth = NEGATIVE_CHARGE_SIZE.width;
    const chargeHeight = NEGATIVE_CHARGE_SIZE.height;
    context.fillStyle = NEGATIVE_CHARGE_COLOR;
    if (orientation === Orientation.VERTICAL) {
        context.fillRect(position.x - chargeWidth / 2, position.y, chargeWidth, chargeHeight);
    } else {
        context.fillRect(position.x - chargeHeight / 2, position.y - 2.5, chargeHeight, chargeWidth);
    }
};
sceneryPhet.register('PlateChargeNode', PlateChargeNode);
export default PlateChargeNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvUGxhdGVDaGFyZ2VOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIHJlcHJlc2VudGF0aW9uIG9mIHBsYXRlIGNoYXJnZS4gIFBsYXRlIGNoYXJnZSBpcyByZXByZXNlbnRlZFxuICogYXMgYW4gaW50ZWdlciBudW1iZXIgb2YgJysnIG9yICctJyBzeW1ib2xzLiBUaGVzZSBzeW1ib2xzIGFyZSBkaXN0cmlidXRlZFxuICogYWNyb3NzIHNvbWUgcG9ydGlvbiBvZiB0aGUgcGxhdGUncyB0b3AgZmFjZS5cbiAqXG4gKiBBbGwgbW9kZWwgY29vcmRpbmF0ZXMgYXJlIHJlbGF0aXZlIHRvIHRoZSBjYXBhY2l0b3IncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xuaW1wb3J0IHsgQ2FudmFzTm9kZSwgTm9kZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uL1BoZXRDb2xvclNjaGVtZS5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IENhcGFjaXRvckNvbnN0YW50cyBmcm9tICcuL0NhcGFjaXRvckNvbnN0YW50cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgUE9TSVRJVkVfQ0hBUkdFX0NPTE9SID0gUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELnRvQ1NTKCk7IC8vIENTUyBwYXNzZWQgaW50byBjb250ZXh0IGZpbGxTdHlsZVxuY29uc3QgTkVHQVRJVkVfQ0hBUkdFX0NPTE9SID0gJ2JsdWUnO1xuY29uc3QgTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMgPSBuZXcgUmFuZ2UoIDEsIDYyNSApO1xuY29uc3QgTkVHQVRJVkVfQ0hBUkdFX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggNywgMiApO1xuXG5jbGFzcyBQbGF0ZUNoYXJnZU5vZGUgZXh0ZW5kcyBDYW52YXNOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtDYXBhY2l0b3J9IGNhcGFjaXRvclxuICAgKiBAcGFyYW0ge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gbW9kZWxWaWV3VHJhbnNmb3JtXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBjYXBhY2l0b3IsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgLy8ge3N0cmluZ30gLSAnUE9TSVRJVkUnIG9yICdORUdBVElWRSdcbiAgICAgIHBvbGFyaXR5OiBDYXBhY2l0b3JDb25zdGFudHMuUE9MQVJJVFkuUE9TSVRJVkUsXG4gICAgICBtYXhQbGF0ZUNoYXJnZTogSW5maW5pdHksXG4gICAgICBvcGFjaXR5OiAxLjAsXG4gICAgICBvcmllbnRhdGlvbjogT3JpZW50YXRpb24uVkVSVElDQUwsXG4gICAgICBjYW52YXNCb3VuZHM6IG51bGwgLy8gQm91bmRzMnxudWxsXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgdmFsaWRhdGUoIG9wdGlvbnMub3JpZW50YXRpb24sIHsgdmFsaWRWYWx1ZXM6IE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcyB9ICk7XG5cbiAgICBzdXBlciggeyBjYW52YXNCb3VuZHM6IG9wdGlvbnMuY2FudmFzQm91bmRzIH0gKTtcbiAgICBjb25zdCBzZWxmID0gdGhpczsgLy8gZXh0ZW5kIHNjb3BlIGZvciBuZXN0ZWQgY2FsbGJhY2tzXG5cbiAgICAvLyBAcHJpdmF0ZSB7Q2FwYWNpdG9yfVxuICAgIHRoaXMuY2FwYWNpdG9yID0gY2FwYWNpdG9yO1xuXG4gICAgLy8gQHByaXZhdGUge09yaWVudGF0aW9ufVxuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcHRpb25zLm9yaWVudGF0aW9uO1xuXG4gICAgLy8gQHByaXZhdGUge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM31cbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcblxuICAgIC8vIEBwcml2YXRlIHtzdHJpbmd9IC0gJ1BPU0lUSVZFJyBvciAnTkVHQVRJVkUnXG4gICAgdGhpcy5wb2xhcml0eSA9IG9wdGlvbnMucG9sYXJpdHk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxuICAgIHRoaXMubWF4UGxhdGVDaGFyZ2UgPSBvcHRpb25zLm1heFBsYXRlQ2hhcmdlO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cbiAgICB0aGlzLm9wYWNpdHkgPSBvcHRpb25zLm9wYWNpdHk7XG5cbiAgICB0aGlzLnBhcmVudE5vZGUgPSBuZXcgTm9kZSgpOyAvLyBAcHJpdmF0ZSBwYXJlbnQgbm9kZSBmb3IgY2hhcmdlc1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGFyZW50Tm9kZSApO1xuXG4gICAgLy8gTm8gZGlzcG9zYWwgcmVxdWlyZWQgYmVjYXVzZSB0aGUgY2FwYWNpdG9yIGV4aXN0cyBmb3IgdGhlIGxpZmUgb2YgdGhlIHNpbVxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcbiAgICAgICAgY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LFxuICAgICAgICBjYXBhY2l0b3IucGxhdGVDaGFyZ2VQcm9wZXJ0eVxuICAgICAgXSwgKCkgPT4gc2VsZi5pc1Zpc2libGUoKSAmJiBzZWxmLmludmFsaWRhdGVQYWludCgpXG4gICAgKTtcblxuICAgIC8vIFVwZGF0ZSB3aGVuIHRoaXMgTm9kZSBiZWNvbWVzIHZpc2libGUuXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkubGluayggdmlzaWJsZSA9PiB2aXNpYmxlICYmIHRoaXMuaW52YWxpZGF0ZVBhaW50KCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZPYmplY3RzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtEaW1lbnNpb24yfVxuICAgKi9cbiAgZ2V0R3JpZFNpemUoIG51bWJlck9mT2JqZWN0cywgd2lkdGgsIGhlaWdodCApIHtcbiAgICBsZXQgY29sdW1ucyA9IDA7XG4gICAgbGV0IHJvd3MgPSAwO1xuICAgIGlmICggbnVtYmVyT2ZPYmplY3RzID4gMCApIHtcblxuICAgICAgY29uc3QgYWxwaGEgPSBNYXRoLnNxcnQoIG51bWJlck9mT2JqZWN0cyAvIHdpZHRoIC8gaGVpZ2h0ICk7XG4gICAgICBjb2x1bW5zID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHdpZHRoICogYWxwaGEgKTtcblxuICAgICAgLy8gY29tcHV0ZSByb3dzIDIgd2F5cywgY2hvb3NlIHRoZSBiZXN0IGZpdFxuICAgICAgY29uc3Qgcm93czEgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggaGVpZ2h0ICogYWxwaGEgKTtcbiAgICAgIGNvbnN0IHJvd3MyID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIG51bWJlck9mT2JqZWN0cyAvIGNvbHVtbnMgKTtcbiAgICAgIGlmICggcm93czEgIT09IHJvd3MyICkge1xuICAgICAgICBjb25zdCBlcnJvcjEgPSBNYXRoLmFicyggbnVtYmVyT2ZPYmplY3RzIC0gKCByb3dzMSAqIGNvbHVtbnMgKSApO1xuICAgICAgICBjb25zdCBlcnJvcjIgPSBNYXRoLmFicyggbnVtYmVyT2ZPYmplY3RzIC0gKCByb3dzMiAqIGNvbHVtbnMgKSApO1xuICAgICAgICByb3dzID0gKCBlcnJvcjEgPCBlcnJvcjIgKSA/IHJvd3MxIDogcm93czI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcm93cyA9IHJvd3MxO1xuICAgICAgfVxuXG4gICAgICAvLyBoYW5kbGUgYm91bmRhcnkgY2FzZXNcbiAgICAgIGlmICggY29sdW1ucyA9PT0gMCApIHtcbiAgICAgICAgY29sdW1ucyA9IDE7XG4gICAgICAgIHJvd3MgPSBudW1iZXJPZk9iamVjdHM7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggcm93cyA9PT0gMCApIHtcbiAgICAgICAgcm93cyA9IDE7XG4gICAgICAgIGNvbHVtbnMgPSBudW1iZXJPZk9iamVjdHM7XG4gICAgICB9XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbHVtbnMgPj0gMCAmJiByb3dzID49IDAsICdUaGVyZSBtdXN0IGJlIGF0IGxlYXN0IDEgY29sdW1uIG9yIDEgcm93IG9mIGNoYXJnZXMuJyApO1xuICAgIHJldHVybiBuZXcgRGltZW5zaW9uMiggY29sdW1ucywgcm93cyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwbGF0ZSBjaGFyZ2UgZnJvbSBjYXBhY2l0b3IgaW4gdGhlIG1vZGVsXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn0gY2hhcmdlXG4gICAqL1xuICBnZXRQbGF0ZUNoYXJnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jYXBhY2l0b3IucGxhdGVDaGFyZ2VQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB4IG9mZnNldCAocmVsYXRpdmUgdG8gdGhlIHBsYXRlIG9yaWdpbikgb2YgdGhlIHBvcnRpb24gb2YgdGhlIHBsYXRlIHRoYXQgaXMgZmFjaW5nIHRoZSB2YWN1dW0gZ2FwXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge251bWJlcn0gb2Zmc2V0XG4gICAqL1xuICBnZXRDb250YWN0WE9yaWdpbigpIHtcbiAgICByZXR1cm4gLXRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoIC8gMjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB3aWR0aCBvZiB0aGUgcG9ydGlvbiBvZiB0aGUgcGxhdGUgdGhhdCBpcyBpbiBjb250YWN0IHdpdGggYWlyLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXRDb250YWN0V2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBwbGF0ZSBpcyBwb3NpdGl2ZWx5IGNoYXJnZWRcbiAgICpcbiAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGlzUG9zaXRpdmVseUNoYXJnZWQoKSB7XG4gICAgcmV0dXJuICggdGhpcy5nZXRQbGF0ZUNoYXJnZSgpID49IDAgJiYgdGhpcy5wb2xhcml0eSA9PT0gQ2FwYWNpdG9yQ29uc3RhbnRzLlBPTEFSSVRZLlBPU0lUSVZFICkgfHxcbiAgICAgICAgICAgKCB0aGlzLmdldFBsYXRlQ2hhcmdlKCkgPCAwICYmIHRoaXMucG9sYXJpdHkgPT09IENhcGFjaXRvckNvbnN0YW50cy5QT0xBUklUWS5ORUdBVElWRSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHZpZXcgdG8gbWF0Y2ggdGhlIG1vZGVsLiBDaGFyZ2VzIGFyZSBhcnJhbmdlZCBpbiBhIGdyaWQuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xuXG4gICAgY29uc3QgcGxhdGVDaGFyZ2UgPSB0aGlzLmdldFBsYXRlQ2hhcmdlKCk7XG4gICAgY29uc3QgbnVtYmVyT2ZDaGFyZ2VzID0gdGhpcy5nZXROdW1iZXJPZkNoYXJnZXMoIHBsYXRlQ2hhcmdlLCB0aGlzLm1heFBsYXRlQ2hhcmdlICk7XG5cbiAgICBpZiAoIG51bWJlck9mQ2hhcmdlcyA+IDAgKSB7XG5cbiAgICAgIGNvbnN0IHpNYXJnaW4gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbERlbHRhWFkoIE5FR0FUSVZFX0NIQVJHRV9TSVpFLndpZHRoLCAwICkueDtcblxuICAgICAgY29uc3QgZ3JpZFdpZHRoID0gdGhpcy5nZXRDb250YWN0V2lkdGgoKTsgLy8gY29udGFjdCBiZXR3ZWVuIHBsYXRlIGFuZCB2YWN1dW0gZ2FwXG4gICAgICBjb25zdCBncmlkRGVwdGggPSB0aGlzLmNhcGFjaXRvci5wbGF0ZVNpemVQcm9wZXJ0eS52YWx1ZS5kZXB0aCAtICggMiAqIHpNYXJnaW4gKTtcblxuICAgICAgLy8gZ3JpZCBkaW1lbnNpb25zXG4gICAgICBjb25zdCBncmlkU2l6ZSA9IHRoaXMuZ2V0R3JpZFNpemUoIG51bWJlck9mQ2hhcmdlcywgZ3JpZFdpZHRoLCBncmlkRGVwdGggKTtcbiAgICAgIGNvbnN0IHJvd3MgPSBncmlkU2l6ZS5oZWlnaHQ7XG4gICAgICBjb25zdCBjb2x1bW5zID0gZ3JpZFNpemUud2lkdGg7XG5cbiAgICAgIC8vIGRpc3RhbmNlIGJldHdlZW4gY2VsbHNcbiAgICAgIGNvbnN0IGR4ID0gZ3JpZFdpZHRoIC8gY29sdW1ucztcbiAgICAgIGNvbnN0IGR6ID0gZ3JpZERlcHRoIC8gcm93cztcblxuICAgICAgLy8gb2Zmc2V0IHRvIG1vdmUgdXMgdG8gdGhlIGNlbnRlciBvZiBjZWxsc1xuICAgICAgY29uc3QgeE9mZnNldCA9IGR4IC8gMjtcbiAgICAgIGNvbnN0IHpPZmZzZXQgPSBkeiAvIDI7XG5cbiAgICAgIC8vIHBvcHVsYXRlIHRoZSBncmlkXG4gICAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgcm93czsgcm93KysgKSB7XG4gICAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBjb2x1bW5zOyBjb2x1bW4rKyApIHtcblxuICAgICAgICAgIC8vIGNhbGN1bGF0ZSBjZW50ZXIgcG9zaXRpb24gZm9yIHRoZSBjaGFyZ2UgaW4gY2VsbCBvZiB0aGUgZ3JpZFxuICAgICAgICAgIGNvbnN0IHggPSB0aGlzLmdldENvbnRhY3RYT3JpZ2luKCkgKyB4T2Zmc2V0ICsgKCBjb2x1bW4gKiBkeCApO1xuICAgICAgICAgIGNvbnN0IHkgPSAwO1xuICAgICAgICAgIGxldCB6ID0gLSggZ3JpZERlcHRoIC8gMiApICsgKCB6TWFyZ2luIC8gMiApICsgek9mZnNldCArICggcm93ICogZHogKTtcblxuICAgICAgICAgIC8vICMyOTM1LCBzbyB0aGF0IHNpbmdsZSBjaGFyZ2UgaXMgbm90IG9ic2N1cmVkIGJ5IHdpcmUgY29ubmVjdGVkIHRvIGNlbnRlciBvZiB0b3AgcGxhdGVcbiAgICAgICAgICBpZiAoIG51bWJlck9mQ2hhcmdlcyA9PT0gMSApIHtcbiAgICAgICAgICAgIHogLT0gZHogLyA2O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjZW50ZXJQb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFlaKCB4LCB5LCB6ICk7XG5cbiAgICAgICAgICAvLyBhZGQgdGhlIHNpZ25lZCBjaGFyZ2UgdG8gdGhlIGdyaWRcbiAgICAgICAgICBpZiAoIHRoaXMuaXNQb3NpdGl2ZWx5Q2hhcmdlZCgpICkge1xuICAgICAgICAgICAgYWRkUG9zaXRpdmVDaGFyZ2UoIGNlbnRlclBvc2l0aW9uLCBjb250ZXh0ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWRkTmVnYXRpdmVDaGFyZ2UoIGNlbnRlclBvc2l0aW9uLCBjb250ZXh0LCB0aGlzLm9yaWVudGF0aW9uICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIG51bWJlciBvZiBjaGFyZ2VzLCBsaW5lYXJseSBwcm9wb3J0aW9uYWwgdG8gcGxhdGUgY2hhcmdlLiAgSWYgcGxhdGUgY2hhcmdlIGlzIGxlc3MgdGhhbiBoYWxmIG9mIGFuXG4gICAqIGVsZWN0cm9uIGNoYXJnZSwgbnVtYmVyIG9mIGNoYXJnZXMgaXMgemVyby5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcGxhdGVDaGFyZ2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1heFBsYXRlQ2hhcmdlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBnZXROdW1iZXJPZkNoYXJnZXMoIHBsYXRlQ2hhcmdlLCBtYXhQbGF0ZUNoYXJnZSApIHtcbiAgICBjb25zdCBhYnNDaGFyZ2UgPSBNYXRoLmFicyggcGxhdGVDaGFyZ2UgKTtcbiAgICBsZXQgbnVtYmVyT2ZDaGFyZ2VzID0gVXRpbHMudG9GaXhlZE51bWJlciggTlVNQkVSX09GX1BMQVRFX0NIQVJHRVMubWF4ICogKCBhYnNDaGFyZ2UgLyBtYXhQbGF0ZUNoYXJnZSApLCAwICk7XG4gICAgaWYgKCBhYnNDaGFyZ2UgPiAwICYmIG51bWJlck9mQ2hhcmdlcyA8IE5VTUJFUl9PRl9QTEFURV9DSEFSR0VTLm1pbiApIHtcbiAgICAgIG51bWJlck9mQ2hhcmdlcyA9IE5VTUJFUl9PRl9QTEFURV9DSEFSR0VTLm1pbjtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGgubWluKCBOVU1CRVJfT0ZfUExBVEVfQ0hBUkdFUy5tYXgsIG51bWJlck9mQ2hhcmdlcyApO1xuICB9XG59XG5cbi8qKlxuICogRHJhdyBhIHBvc2l0aXZlIGNoYXJnZSB3aXRoIGNhbnZhcy4gICdQbHVzJyBzaWduIGlzIHBhaW50ZWQgd2l0aCB0d29cbiAqIG92ZXJsYXBwaW5nIHJlY3RhbmdsZXMgYXJvdW5kIGEgY2VudGVyIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb24gLSBjZW50ZXIgcG9zaXRpb24gb2YgdGhlIGNoYXJnZSBpbiB2aWV3IHNwYWNlXG4gKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dCAtIGNvbnRleHQgZm9yIHRoZSBjYW52YXMgbWV0aG9kc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgYWRkUG9zaXRpdmVDaGFyZ2UgPSAoIHBvc2l0aW9uLCBjb250ZXh0ICkgPT4ge1xuICBjb25zdCBjaGFyZ2VXaWR0aCA9IE5FR0FUSVZFX0NIQVJHRV9TSVpFLndpZHRoO1xuICBjb25zdCBjaGFyZ2VIZWlnaHQgPSBORUdBVElWRV9DSEFSR0VfU0laRS5oZWlnaHQ7XG5cbiAgY29udGV4dC5maWxsU3R5bGUgPSBQT1NJVElWRV9DSEFSR0VfQ09MT1I7XG4gIGNvbnRleHQuZmlsbFJlY3QoIHBvc2l0aW9uLnggLSBjaGFyZ2VXaWR0aCAvIDIsIHBvc2l0aW9uLnkgLSBjaGFyZ2VIZWlnaHQgLyAyLCBjaGFyZ2VXaWR0aCwgY2hhcmdlSGVpZ2h0ICk7XG4gIGNvbnRleHQuZmlsbFJlY3QoIHBvc2l0aW9uLnggLSBjaGFyZ2VIZWlnaHQgLyAyLCBwb3NpdGlvbi55IC0gY2hhcmdlV2lkdGggLyAyLCBjaGFyZ2VIZWlnaHQsIGNoYXJnZVdpZHRoICk7XG59O1xuXG4vKipcbiAqIERyYXcgYSBuZWdhdGl2ZSBjaGFyZ2Ugd2l0aCBjYW52YXMuICAnTWludXMnIHNpZ24gaXMgcGFpbnRlZCB3aXRoIGEgc2luZ2xlXG4gKiByZWN0YW5nbGUgYXJvdW5kIGEgY2VudGVyIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cbiAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZW50YXRpb25cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGFkZE5lZ2F0aXZlQ2hhcmdlID0gKCBwb3NpdGlvbiwgY29udGV4dCwgb3JpZW50YXRpb24gKSA9PiB7XG4gIGNvbnN0IGNoYXJnZVdpZHRoID0gTkVHQVRJVkVfQ0hBUkdFX1NJWkUud2lkdGg7XG4gIGNvbnN0IGNoYXJnZUhlaWdodCA9IE5FR0FUSVZFX0NIQVJHRV9TSVpFLmhlaWdodDtcblxuICBjb250ZXh0LmZpbGxTdHlsZSA9IE5FR0FUSVZFX0NIQVJHRV9DT0xPUjtcbiAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uVkVSVElDQUwgKSB7XG4gICAgY29udGV4dC5maWxsUmVjdCggcG9zaXRpb24ueCAtIGNoYXJnZVdpZHRoIC8gMiwgcG9zaXRpb24ueSwgY2hhcmdlV2lkdGgsIGNoYXJnZUhlaWdodCApO1xuICB9XG4gIGVsc2Uge1xuICAgIGNvbnRleHQuZmlsbFJlY3QoIHBvc2l0aW9uLnggLSBjaGFyZ2VIZWlnaHQgLyAyLCBwb3NpdGlvbi55IC0gMi41LCBjaGFyZ2VIZWlnaHQsIGNoYXJnZVdpZHRoICk7XG4gIH1cbn07XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnUGxhdGVDaGFyZ2VOb2RlJywgUGxhdGVDaGFyZ2VOb2RlICk7XG5leHBvcnQgZGVmYXVsdCBQbGF0ZUNoYXJnZU5vZGU7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsInZhbGlkYXRlIiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVXRpbHMiLCJtZXJnZSIsIk9yaWVudGF0aW9uIiwiQ2FudmFzTm9kZSIsIk5vZGUiLCJQaGV0Q29sb3JTY2hlbWUiLCJzY2VuZXJ5UGhldCIsIkNhcGFjaXRvckNvbnN0YW50cyIsIlBPU0lUSVZFX0NIQVJHRV9DT0xPUiIsIlJFRF9DT0xPUkJMSU5EIiwidG9DU1MiLCJORUdBVElWRV9DSEFSR0VfQ09MT1IiLCJOVU1CRVJfT0ZfUExBVEVfQ0hBUkdFUyIsIk5FR0FUSVZFX0NIQVJHRV9TSVpFIiwiUGxhdGVDaGFyZ2VOb2RlIiwiZ2V0R3JpZFNpemUiLCJudW1iZXJPZk9iamVjdHMiLCJ3aWR0aCIsImhlaWdodCIsImNvbHVtbnMiLCJyb3dzIiwiYWxwaGEiLCJNYXRoIiwic3FydCIsInJvdW5kU3ltbWV0cmljIiwicm93czEiLCJyb3dzMiIsImVycm9yMSIsImFicyIsImVycm9yMiIsImFzc2VydCIsImdldFBsYXRlQ2hhcmdlIiwiY2FwYWNpdG9yIiwicGxhdGVDaGFyZ2VQcm9wZXJ0eSIsInZhbHVlIiwiZ2V0Q29udGFjdFhPcmlnaW4iLCJwbGF0ZVNpemVQcm9wZXJ0eSIsImdldENvbnRhY3RXaWR0aCIsImlzUG9zaXRpdmVseUNoYXJnZWQiLCJwb2xhcml0eSIsIlBPTEFSSVRZIiwiUE9TSVRJVkUiLCJORUdBVElWRSIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsInBsYXRlQ2hhcmdlIiwibnVtYmVyT2ZDaGFyZ2VzIiwiZ2V0TnVtYmVyT2ZDaGFyZ2VzIiwibWF4UGxhdGVDaGFyZ2UiLCJ6TWFyZ2luIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidmlld1RvTW9kZWxEZWx0YVhZIiwieCIsImdyaWRXaWR0aCIsImdyaWREZXB0aCIsImRlcHRoIiwiZ3JpZFNpemUiLCJkeCIsImR6IiwieE9mZnNldCIsInpPZmZzZXQiLCJyb3ciLCJjb2x1bW4iLCJ5IiwieiIsImNlbnRlclBvc2l0aW9uIiwibW9kZWxUb1ZpZXdYWVoiLCJhZGRQb3NpdGl2ZUNoYXJnZSIsImFkZE5lZ2F0aXZlQ2hhcmdlIiwib3JpZW50YXRpb24iLCJhYnNDaGFyZ2UiLCJ0b0ZpeGVkTnVtYmVyIiwibWF4IiwibWluIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiSW5maW5pdHkiLCJvcGFjaXR5IiwiVkVSVElDQUwiLCJjYW52YXNCb3VuZHMiLCJ2YWxpZFZhbHVlcyIsImVudW1lcmF0aW9uIiwidmFsdWVzIiwic2VsZiIsInBhcmVudE5vZGUiLCJhZGRDaGlsZCIsIm11bHRpbGluayIsImlzVmlzaWJsZSIsImludmFsaWRhdGVQYWludCIsInZpc2libGVQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlIiwicG9zaXRpb24iLCJjaGFyZ2VXaWR0aCIsImNoYXJnZUhlaWdodCIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGVBQWUsZ0NBQWdDO0FBQ3RELE9BQU9DLGNBQWMsK0JBQStCO0FBQ3BELE9BQU9DLGdCQUFnQixnQ0FBZ0M7QUFDdkQsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsT0FBT0MsaUJBQWlCLHVDQUF1QztBQUMvRCxTQUFTQyxVQUFVLEVBQUVDLElBQUksUUFBUSxpQ0FBaUM7QUFDbEUsT0FBT0MscUJBQXFCLHdCQUF3QjtBQUNwRCxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBQzVDLE9BQU9DLHdCQUF3QiwwQkFBMEI7QUFFekQsWUFBWTtBQUNaLE1BQU1DLHdCQUF3QkgsZ0JBQWdCSSxjQUFjLENBQUNDLEtBQUssSUFBSSxvQ0FBb0M7QUFDMUcsTUFBTUMsd0JBQXdCO0FBQzlCLE1BQU1DLDBCQUEwQixJQUFJYixNQUFPLEdB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