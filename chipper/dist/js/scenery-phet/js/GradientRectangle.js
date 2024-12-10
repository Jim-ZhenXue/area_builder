// Copyright 2019-2024, University of Colorado Boulder
/**
 * Mostly like a normal Rectangle (Node), but instead of a hard transition from "in" to "out", it has a defined region
 * of gradients around the edges.
 *
 * Has options for controlling the margin amounts for each side. This will control the area that will be covered
 * by a gradient.
 *
 * You can control the margin amounts for each side individually with:
 * - leftMargin
 * - rightMargin
 * - topMargin
 * - bottomMargin
 *
 * Additionally, the horizontal/vertical margins can also be controlled together with:
 * - xMargin
 * - yMargin
 *
 * And all margins can be controlled together with:
 * - margin
 *
 * These options can be provided in the options object, or can be used with setters/getters (like normal Node
 * options). Note that the getters only work if all equivalent values are the same.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import { Shape } from '../../kite/js/imports.js';
import { ColorDef, LinearGradient, PaintColorProperty, Path, RadialGradient, Rectangle } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const GRADIENT_RECTANGLE_OPTION_KEYS = [
    'roundMargins',
    'border',
    'extension',
    'margin',
    'xMargin',
    'yMargin',
    'leftMargin',
    'rightMargin',
    'topMargin',
    'bottomMargin'
];
let GradientRectangle = class GradientRectangle extends Rectangle {
    /**
   * Updates the rounded-ness of the margins.
   */ invalidateRoundMargins() {
        if (this._roundMargins) {
            this.topLeftCorner.shape = this.roundedShape;
            this.topRightCorner.shape = this.roundedShape;
            this.bottomLeftCorner.shape = this.roundedShape;
            this.bottomRightCorner.shape = this.roundedShape;
        } else {
            this.topLeftCorner.shape = this.rectangularShape;
            this.topRightCorner.shape = this.rectangularShape;
            this.bottomLeftCorner.shape = this.rectangularShape;
            this.bottomRightCorner.shape = this.rectangularShape;
        }
    }
    /**
   * Updates the rounded-ness of the margins.
   */ invalidateGradients() {
        const linearGradient = new LinearGradient(0, 0, 1, 0).addColorStop(this._extension, this._fillProperty).addColorStop(1, this._borderProperty);
        const radialGradient = new RadialGradient(0, 0, 0, 0, 0, 1).addColorStop(this._extension, this._fillProperty).addColorStop(1, this._borderProperty);
        this.leftSide.fill = linearGradient;
        this.rightSide.fill = linearGradient;
        this.topSide.fill = linearGradient;
        this.bottomSide.fill = linearGradient;
        this.topLeftCorner.fill = radialGradient;
        this.topRightCorner.fill = radialGradient;
        this.bottomLeftCorner.fill = radialGradient;
        this.bottomRightCorner.fill = radialGradient;
    }
    /**
   * Custom behavior so we can see when the rectangle dimensions change.
   */ invalidateRectangle() {
        super.invalidateRectangle();
        // Update our margins
        this.invalidateMargin();
    }
    /**
   * Handles repositioning of the margins.
   */ invalidateMargin() {
        this.children = [
            ...this._leftMargin > 0 && this.rectHeight > 0 ? [
                this.leftSide
            ] : [],
            ...this._rightMargin > 0 && this.rectHeight > 0 ? [
                this.rightSide
            ] : [],
            ...this._topMargin > 0 && this.rectWidth > 0 ? [
                this.topSide
            ] : [],
            ...this._bottomMargin > 0 && this.rectWidth > 0 ? [
                this.bottomSide
            ] : [],
            ...this._topMargin > 0 && this._leftMargin > 0 ? [
                this.topLeftCorner
            ] : [],
            ...this._topMargin > 0 && this._rightMargin > 0 ? [
                this.topRightCorner
            ] : [],
            ...this._bottomMargin > 0 && this._leftMargin > 0 ? [
                this.bottomLeftCorner
            ] : [],
            ...this._bottomMargin > 0 && this._rightMargin > 0 ? [
                this.bottomRightCorner
            ] : []
        ];
        const width = this.rectWidth;
        const height = this.rectHeight;
        const left = this.rectX;
        const top = this.rectY;
        const right = this.rectX + width;
        const bottom = this._rectY + height;
        if (this.leftSide.hasParent()) {
            this.leftSide.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, height, top, 0, 0, 1);
        }
        if (this.rightSide.hasParent()) {
            this.rightSide.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, height, top, 0, 0, 1);
        }
        if (this.topSide.hasParent()) {
            this.topSide.matrix = new Matrix3().rowMajor(0, width, left, -this._topMargin, 0, top, 0, 0, 1);
        }
        if (this.bottomSide.hasParent()) {
            this.bottomSide.matrix = new Matrix3().rowMajor(0, width, left, this._bottomMargin, 0, bottom, 0, 0, 1);
        }
        if (this.topLeftCorner.hasParent()) {
            this.topLeftCorner.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, -this._topMargin, top, 0, 0, 1);
        }
        if (this.topRightCorner.hasParent()) {
            this.topRightCorner.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, -this._topMargin, top, 0, 0, 1);
        }
        if (this.bottomLeftCorner.hasParent()) {
            this.bottomLeftCorner.matrix = new Matrix3().rowMajor(-this._leftMargin, 0, left, 0, this._bottomMargin, bottom, 0, 0, 1);
        }
        if (this.bottomRightCorner.hasParent()) {
            this.bottomRightCorner.matrix = new Matrix3().rowMajor(this._rightMargin, 0, right, 0, this._bottomMargin, bottom, 0, 0, 1);
        }
    }
    /**
   * Overrides disposal to clean up some extra things.
   */ dispose() {
        this._fillProperty.dispose();
        this._borderOverrideProperty.dispose();
        super.dispose();
    }
    /**
   * We want to be notified of fill changes.
   */ setFill(fill) {
        assert && assert(ColorDef.isColorDef(fill), 'GradientRectangle only supports ColorDef as a fill');
        super.setFill(fill);
        this._fillProperty.paint = fill;
        return this;
    }
    /**
   * We don't want to allow strokes.
   */ setStroke(stroke) {
        assert && assert(stroke === null, 'GradientRectangle only supports a null stroke');
        super.setStroke(stroke);
        return this;
    }
    /*
   * NOTE TO THE READER:
   * This super-boilerplate-heavy style is made to conform to the guidelines. Sorry!
   */ /**
   * Sets the left-side margin amount (the amount in local-coordinate units from the left edge of the rectangle to
   * where the margin ends).
   */ set leftMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'leftMargin should be a finite non-negative number');
        if (this._leftMargin !== value) {
            this._leftMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the left-side margin amount.
   */ get leftMargin() {
        return this._leftMargin;
    }
    /**
   * Sets the right-side margin amount (the amount in local-coordinate units from the right edge of the rectangle to
   * where the margin ends).
   */ set rightMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'rightMargin should be a finite non-negative number');
        if (this._rightMargin !== value) {
            this._rightMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the right-side margin amount.
   */ get rightMargin() {
        return this._rightMargin;
    }
    /**
   * Sets the top-side margin amount (the amount in local-coordinate units from the top edge of the rectangle to
   * where the margin ends).
   */ set topMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'topMargin should be a finite non-negative number');
        if (this._topMargin !== value) {
            this._topMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the top-side margin amount.
   */ get topMargin() {
        return this._topMargin;
    }
    /**
   * Sets the bottom-side margin amount (the amount in local-coordinate units from the bottom edge of the rectangle to
   * where the margin ends).
   */ set bottomMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'bottomMargin should be a finite non-negative number');
        if (this._bottomMargin !== value) {
            this._bottomMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the bottom-side margin amount.
   */ get bottomMargin() {
        return this._bottomMargin;
    }
    /**
   * Sets the left and right margin amounts.
   */ set xMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'xMargin should be a finite non-negative number');
        if (this._leftMargin !== value || this._rightMargin !== value) {
            this._leftMargin = value;
            this._rightMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the left and right margin amounts.
   */ get xMargin() {
        assert && assert(this._leftMargin === this._rightMargin, 'leftMargin and rightMargin differ, so getting xMargin is not well-defined');
        return this._leftMargin;
    }
    /**
   * Sets the top and bottom margin amounts.
   */ set yMargin(value) {
        assert && assert(isFinite(value) && value >= 0, 'yMargin should be a finite non-negative number');
        if (this._topMargin !== value || this._bottomMargin !== value) {
            this._topMargin = value;
            this._bottomMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the top and bottom margin amounts.
   */ get yMargin() {
        assert && assert(this._topMargin === this._bottomMargin, 'leftMargin and rightMargin differ, so getting yMargin is not well-defined');
        return this._topMargin;
    }
    /**
   * Sets all of the margin amounts.
   */ set margin(value) {
        assert && assert(isFinite(value) && value >= 0, 'margin should be a finite non-negative number');
        if (this._leftMargin !== value || this._rightMargin !== value || this._topMargin !== value || this._bottomMargin !== value) {
            this._leftMargin = value;
            this._rightMargin = value;
            this._topMargin = value;
            this._bottomMargin = value;
            this.invalidateMargin();
        }
    }
    /**
   * Gets the top and bottom margin amounts.
   */ get margin() {
        assert && assert(this._leftMargin === this._rightMargin && this._rightMargin === this._topMargin && this._topMargin === this._bottomMargin, 'Some margins differ, so getting margin is not well-defined');
        return this._leftMargin;
    }
    /**
   * Sets whether the corners of the margin will be rounded or not.
   */ set roundMargins(value) {
        if (this._roundMargins !== value) {
            this._roundMargins = value;
            this.invalidateRoundMargins();
        }
    }
    /**
   * Returns whether the corners of the margin are rounded or not.
   */ get roundMargins() {
        return this._roundMargins;
    }
    /**
   * Sets the border "fade" color (that is on the other side of the gradient).
   */ set border(value) {
        assert && assert(ColorDef.isColorDef(value));
        if (this._borderOverrideProperty.paint !== value) {
            this._borderOverrideProperty.paint = value;
        }
    }
    /**
   * Returns the border color (see the setter)
   */ get border() {
        return this._borderOverrideProperty.paint;
    }
    /**
   * Sets the extension amount (from 0 to <1) of where the "starting" gradient amount should be.
   */ set extension(value) {
        assert && assert(isFinite(value) && value >= 0 && value < 1);
        if (this._extension !== value) {
            this._extension = value;
            this.invalidateGradients();
        }
    }
    /**
   * Returns the extension amount (see the setter).
   */ get extension() {
        return this._extension;
    }
    mutate(options) {
        return super.mutate(options);
    }
    constructor(providedOptions){
        super({});
        this._leftMargin = 0;
        this._rightMargin = 0;
        this._topMargin = 0;
        this._bottomMargin = 0;
        this._extension = 0;
        this._roundMargins = true;
        this._fillProperty = new PaintColorProperty(this.fill);
        this._borderOverrideProperty = new PaintColorProperty(null);
        this._borderProperty = new DerivedProperty([
            this._fillProperty,
            this._borderOverrideProperty
        ], (fill, borderOverride)=>{
            if (this._borderOverrideProperty.paint === null) {
                return fill.withAlpha(0);
            } else {
                return borderOverride;
            }
        });
        this.roundedShape = new Shape().moveTo(0, 0).arc(0, 0, 1, 0, Math.PI / 2, false).close().makeImmutable();
        this.rectangularShape = Shape.rectangle(0, 0, 1, 1).makeImmutable();
        this.leftSide = new Rectangle(0, 0, 1, 1);
        this.rightSide = new Rectangle(0, 0, 1, 1);
        this.topSide = new Rectangle(0, 0, 1, 1);
        this.bottomSide = new Rectangle(0, 0, 1, 1);
        this.topLeftCorner = new Path(null);
        this.topRightCorner = new Path(null);
        this.bottomLeftCorner = new Path(null);
        this.bottomRightCorner = new Path(null);
        this.invalidateGradients();
        this.invalidateRoundMargins();
        this.invalidateMargin();
        this.mutate(providedOptions);
    }
};
export { GradientRectangle as default };
// We use the Node system for mutator keys, so they get added here
GradientRectangle.prototype._mutatorKeys = [
    ...GRADIENT_RECTANGLE_OPTION_KEYS,
    ...Rectangle.prototype._mutatorKeys
];
sceneryPhet.register('GradientRectangle', GradientRectangle);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmFkaWVudFJlY3RhbmdsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNb3N0bHkgbGlrZSBhIG5vcm1hbCBSZWN0YW5nbGUgKE5vZGUpLCBidXQgaW5zdGVhZCBvZiBhIGhhcmQgdHJhbnNpdGlvbiBmcm9tIFwiaW5cIiB0byBcIm91dFwiLCBpdCBoYXMgYSBkZWZpbmVkIHJlZ2lvblxuICogb2YgZ3JhZGllbnRzIGFyb3VuZCB0aGUgZWRnZXMuXG4gKlxuICogSGFzIG9wdGlvbnMgZm9yIGNvbnRyb2xsaW5nIHRoZSBtYXJnaW4gYW1vdW50cyBmb3IgZWFjaCBzaWRlLiBUaGlzIHdpbGwgY29udHJvbCB0aGUgYXJlYSB0aGF0IHdpbGwgYmUgY292ZXJlZFxuICogYnkgYSBncmFkaWVudC5cbiAqXG4gKiBZb3UgY2FuIGNvbnRyb2wgdGhlIG1hcmdpbiBhbW91bnRzIGZvciBlYWNoIHNpZGUgaW5kaXZpZHVhbGx5IHdpdGg6XG4gKiAtIGxlZnRNYXJnaW5cbiAqIC0gcmlnaHRNYXJnaW5cbiAqIC0gdG9wTWFyZ2luXG4gKiAtIGJvdHRvbU1hcmdpblxuICpcbiAqIEFkZGl0aW9uYWxseSwgdGhlIGhvcml6b250YWwvdmVydGljYWwgbWFyZ2lucyBjYW4gYWxzbyBiZSBjb250cm9sbGVkIHRvZ2V0aGVyIHdpdGg6XG4gKiAtIHhNYXJnaW5cbiAqIC0geU1hcmdpblxuICpcbiAqIEFuZCBhbGwgbWFyZ2lucyBjYW4gYmUgY29udHJvbGxlZCB0b2dldGhlciB3aXRoOlxuICogLSBtYXJnaW5cbiAqXG4gKiBUaGVzZSBvcHRpb25zIGNhbiBiZSBwcm92aWRlZCBpbiB0aGUgb3B0aW9ucyBvYmplY3QsIG9yIGNhbiBiZSB1c2VkIHdpdGggc2V0dGVycy9nZXR0ZXJzIChsaWtlIG5vcm1hbCBOb2RlXG4gKiBvcHRpb25zKS4gTm90ZSB0aGF0IHRoZSBnZXR0ZXJzIG9ubHkgd29yayBpZiBhbGwgZXF1aXZhbGVudCB2YWx1ZXMgYXJlIHRoZSBzYW1lLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IENvbG9yRGVmLCBMaW5lYXJHcmFkaWVudCwgUGFpbnRDb2xvclByb3BlcnR5LCBQYXRoLCBSYWRpYWxHcmFkaWVudCwgUmVjdGFuZ2xlLCBSZWN0YW5nbGVPcHRpb25zLCBUQ29sb3IsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgR1JBRElFTlRfUkVDVEFOR0xFX09QVElPTl9LRVlTID0gW1xuICAncm91bmRNYXJnaW5zJyxcbiAgJ2JvcmRlcicsXG4gICdleHRlbnNpb24nLFxuICAnbWFyZ2luJyxcbiAgJ3hNYXJnaW4nLFxuICAneU1hcmdpbicsXG4gICdsZWZ0TWFyZ2luJyxcbiAgJ3JpZ2h0TWFyZ2luJyxcbiAgJ3RvcE1hcmdpbicsXG4gICdib3R0b21NYXJnaW4nXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgR3JhZGllbnRSZWN0YW5nbGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBSZWN0YW5nbGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFkaWVudFJlY3RhbmdsZSBleHRlbmRzIFJlY3RhbmdsZSB7XG5cbiAgLy8gTWFyZ2luIGFtb3VudHMgZm9yIGVhY2ggaW5kaXZpZHVhbCBzaWRlXG4gIHByaXZhdGUgX2xlZnRNYXJnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfcmlnaHRNYXJnaW46IG51bWJlcjtcbiAgcHJpdmF0ZSBfdG9wTWFyZ2luOiBudW1iZXI7XG4gIHByaXZhdGUgX2JvdHRvbU1hcmdpbjogbnVtYmVyO1xuXG4gIC8vIFRoZSBzdGFydGluZyBjb2xvciBzdG9wIHJhdGlvLlxuICBwcml2YXRlIF9leHRlbnNpb246IG51bWJlcjtcblxuICBwcml2YXRlIF9yb3VuZE1hcmdpbnM6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfZmlsbFByb3BlcnR5OiBQYWludENvbG9yUHJvcGVydHk7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2JvcmRlck92ZXJyaWRlUHJvcGVydHk6IFBhaW50Q29sb3JQcm9wZXJ0eTtcbiAgcHJpdmF0ZSByZWFkb25seSBfYm9yZGVyUHJvcGVydHk6IFRDb2xvcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IHJvdW5kZWRTaGFwZTogU2hhcGU7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVjdGFuZ3VsYXJTaGFwZTogU2hhcGU7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBsZWZ0U2lkZTogUmVjdGFuZ2xlO1xuICBwcml2YXRlIHJlYWRvbmx5IHJpZ2h0U2lkZTogUmVjdGFuZ2xlO1xuICBwcml2YXRlIHJlYWRvbmx5IHRvcFNpZGU6IFJlY3RhbmdsZTtcbiAgcHJpdmF0ZSByZWFkb25seSBib3R0b21TaWRlOiBSZWN0YW5nbGU7XG5cbiAgcHJpdmF0ZSByZWFkb25seSB0b3BMZWZ0Q29ybmVyOiBQYXRoO1xuICBwcml2YXRlIHJlYWRvbmx5IHRvcFJpZ2h0Q29ybmVyOiBQYXRoO1xuICBwcml2YXRlIHJlYWRvbmx5IGJvdHRvbUxlZnRDb3JuZXI6IFBhdGg7XG4gIHByaXZhdGUgcmVhZG9ubHkgYm90dG9tUmlnaHRDb3JuZXI6IFBhdGg7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBHcmFkaWVudFJlY3RhbmdsZU9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIHt9ICk7XG5cbiAgICB0aGlzLl9sZWZ0TWFyZ2luID0gMDtcbiAgICB0aGlzLl9yaWdodE1hcmdpbiA9IDA7XG4gICAgdGhpcy5fdG9wTWFyZ2luID0gMDtcbiAgICB0aGlzLl9ib3R0b21NYXJnaW4gPSAwO1xuICAgIHRoaXMuX2V4dGVuc2lvbiA9IDA7XG4gICAgdGhpcy5fcm91bmRNYXJnaW5zID0gdHJ1ZTtcbiAgICB0aGlzLl9maWxsUHJvcGVydHkgPSBuZXcgUGFpbnRDb2xvclByb3BlcnR5KCB0aGlzLmZpbGwgKTtcbiAgICB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggbnVsbCApO1xuXG4gICAgdGhpcy5fYm9yZGVyUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXG4gICAgICB0aGlzLl9maWxsUHJvcGVydHksIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHlcbiAgICBdLCAoIGZpbGwsIGJvcmRlck92ZXJyaWRlICkgPT4ge1xuICAgICAgaWYgKCB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5LnBhaW50ID09PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZmlsbC53aXRoQWxwaGEoIDAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9yZGVyT3ZlcnJpZGU7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5yb3VuZGVkU2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5hcmMoIDAsIDAsIDEsIDAsIE1hdGguUEkgLyAyLCBmYWxzZSApLmNsb3NlKCkubWFrZUltbXV0YWJsZSgpO1xuICAgIHRoaXMucmVjdGFuZ3VsYXJTaGFwZSA9IFNoYXBlLnJlY3RhbmdsZSggMCwgMCwgMSwgMSApLm1ha2VJbW11dGFibGUoKTtcblxuICAgIHRoaXMubGVmdFNpZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxICk7XG4gICAgdGhpcy5yaWdodFNpZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxICk7XG4gICAgdGhpcy50b3BTaWRlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMSwgMSApO1xuICAgIHRoaXMuYm90dG9tU2lkZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEsIDEgKTtcbiAgICB0aGlzLnRvcExlZnRDb3JuZXIgPSBuZXcgUGF0aCggbnVsbCApO1xuICAgIHRoaXMudG9wUmlnaHRDb3JuZXIgPSBuZXcgUGF0aCggbnVsbCApO1xuICAgIHRoaXMuYm90dG9tTGVmdENvcm5lciA9IG5ldyBQYXRoKCBudWxsICk7XG4gICAgdGhpcy5ib3R0b21SaWdodENvcm5lciA9IG5ldyBQYXRoKCBudWxsICk7XG5cbiAgICB0aGlzLmludmFsaWRhdGVHcmFkaWVudHMoKTtcbiAgICB0aGlzLmludmFsaWRhdGVSb3VuZE1hcmdpbnMoKTtcbiAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcblxuICAgIHRoaXMubXV0YXRlKCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSByb3VuZGVkLW5lc3Mgb2YgdGhlIG1hcmdpbnMuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVSb3VuZE1hcmdpbnMoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLl9yb3VuZE1hcmdpbnMgKSB7XG4gICAgICB0aGlzLnRvcExlZnRDb3JuZXIuc2hhcGUgPSB0aGlzLnJvdW5kZWRTaGFwZTtcbiAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIuc2hhcGUgPSB0aGlzLnJvdW5kZWRTaGFwZTtcbiAgICAgIHRoaXMuYm90dG9tTGVmdENvcm5lci5zaGFwZSA9IHRoaXMucm91bmRlZFNoYXBlO1xuICAgICAgdGhpcy5ib3R0b21SaWdodENvcm5lci5zaGFwZSA9IHRoaXMucm91bmRlZFNoYXBlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudG9wTGVmdENvcm5lci5zaGFwZSA9IHRoaXMucmVjdGFuZ3VsYXJTaGFwZTtcbiAgICAgIHRoaXMudG9wUmlnaHRDb3JuZXIuc2hhcGUgPSB0aGlzLnJlY3Rhbmd1bGFyU2hhcGU7XG4gICAgICB0aGlzLmJvdHRvbUxlZnRDb3JuZXIuc2hhcGUgPSB0aGlzLnJlY3Rhbmd1bGFyU2hhcGU7XG4gICAgICB0aGlzLmJvdHRvbVJpZ2h0Q29ybmVyLnNoYXBlID0gdGhpcy5yZWN0YW5ndWxhclNoYXBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSByb3VuZGVkLW5lc3Mgb2YgdGhlIG1hcmdpbnMuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVHcmFkaWVudHMoKTogdm9pZCB7XG4gICAgY29uc3QgbGluZWFyR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDEsIDAgKVxuICAgICAgLmFkZENvbG9yU3RvcCggdGhpcy5fZXh0ZW5zaW9uLCB0aGlzLl9maWxsUHJvcGVydHkgKVxuICAgICAgLmFkZENvbG9yU3RvcCggMSwgdGhpcy5fYm9yZGVyUHJvcGVydHkgKTtcblxuICAgIGNvbnN0IHJhZGlhbEdyYWRpZW50ID0gbmV3IFJhZGlhbEdyYWRpZW50KCAwLCAwLCAwLCAwLCAwLCAxIClcbiAgICAgIC5hZGRDb2xvclN0b3AoIHRoaXMuX2V4dGVuc2lvbiwgdGhpcy5fZmlsbFByb3BlcnR5IClcbiAgICAgIC5hZGRDb2xvclN0b3AoIDEsIHRoaXMuX2JvcmRlclByb3BlcnR5ICk7XG5cbiAgICB0aGlzLmxlZnRTaWRlLmZpbGwgPSBsaW5lYXJHcmFkaWVudDtcbiAgICB0aGlzLnJpZ2h0U2lkZS5maWxsID0gbGluZWFyR3JhZGllbnQ7XG4gICAgdGhpcy50b3BTaWRlLmZpbGwgPSBsaW5lYXJHcmFkaWVudDtcbiAgICB0aGlzLmJvdHRvbVNpZGUuZmlsbCA9IGxpbmVhckdyYWRpZW50O1xuICAgIHRoaXMudG9wTGVmdENvcm5lci5maWxsID0gcmFkaWFsR3JhZGllbnQ7XG4gICAgdGhpcy50b3BSaWdodENvcm5lci5maWxsID0gcmFkaWFsR3JhZGllbnQ7XG4gICAgdGhpcy5ib3R0b21MZWZ0Q29ybmVyLmZpbGwgPSByYWRpYWxHcmFkaWVudDtcbiAgICB0aGlzLmJvdHRvbVJpZ2h0Q29ybmVyLmZpbGwgPSByYWRpYWxHcmFkaWVudDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXN0b20gYmVoYXZpb3Igc28gd2UgY2FuIHNlZSB3aGVuIHRoZSByZWN0YW5nbGUgZGltZW5zaW9ucyBjaGFuZ2UuXG4gICAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW52YWxpZGF0ZVJlY3RhbmdsZSgpOiB2b2lkIHtcbiAgICBzdXBlci5pbnZhbGlkYXRlUmVjdGFuZ2xlKCk7XG5cbiAgICAvLyBVcGRhdGUgb3VyIG1hcmdpbnNcbiAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHJlcG9zaXRpb25pbmcgb2YgdGhlIG1hcmdpbnMuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVNYXJnaW4oKTogdm9pZCB7XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcbiAgICAgIC4uLiggdGhpcy5fbGVmdE1hcmdpbiA+IDAgJiYgdGhpcy5yZWN0SGVpZ2h0ID4gMCA/IFsgdGhpcy5sZWZ0U2lkZSBdIDogW10gKSxcbiAgICAgIC4uLiggdGhpcy5fcmlnaHRNYXJnaW4gPiAwICYmIHRoaXMucmVjdEhlaWdodCA+IDAgPyBbIHRoaXMucmlnaHRTaWRlIF0gOiBbXSApLFxuICAgICAgLi4uKCB0aGlzLl90b3BNYXJnaW4gPiAwICYmIHRoaXMucmVjdFdpZHRoID4gMCA/IFsgdGhpcy50b3BTaWRlIF0gOiBbXSApLFxuICAgICAgLi4uKCB0aGlzLl9ib3R0b21NYXJnaW4gPiAwICYmIHRoaXMucmVjdFdpZHRoID4gMCA/IFsgdGhpcy5ib3R0b21TaWRlIF0gOiBbXSApLFxuICAgICAgLi4uKCB0aGlzLl90b3BNYXJnaW4gPiAwICYmIHRoaXMuX2xlZnRNYXJnaW4gPiAwID8gWyB0aGlzLnRvcExlZnRDb3JuZXIgXSA6IFtdICksXG4gICAgICAuLi4oIHRoaXMuX3RvcE1hcmdpbiA+IDAgJiYgdGhpcy5fcmlnaHRNYXJnaW4gPiAwID8gWyB0aGlzLnRvcFJpZ2h0Q29ybmVyIF0gOiBbXSApLFxuICAgICAgLi4uKCB0aGlzLl9ib3R0b21NYXJnaW4gPiAwICYmIHRoaXMuX2xlZnRNYXJnaW4gPiAwID8gWyB0aGlzLmJvdHRvbUxlZnRDb3JuZXIgXSA6IFtdICksXG4gICAgICAuLi4oIHRoaXMuX2JvdHRvbU1hcmdpbiA+IDAgJiYgdGhpcy5fcmlnaHRNYXJnaW4gPiAwID8gWyB0aGlzLmJvdHRvbVJpZ2h0Q29ybmVyIF0gOiBbXSApXG4gICAgXTtcblxuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5yZWN0V2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5yZWN0SGVpZ2h0O1xuXG4gICAgY29uc3QgbGVmdCA9IHRoaXMucmVjdFg7XG4gICAgY29uc3QgdG9wID0gdGhpcy5yZWN0WTtcbiAgICBjb25zdCByaWdodCA9IHRoaXMucmVjdFggKyB3aWR0aDtcbiAgICBjb25zdCBib3R0b20gPSB0aGlzLl9yZWN0WSArIGhlaWdodDtcblxuICAgIGlmICggdGhpcy5sZWZ0U2lkZS5oYXNQYXJlbnQoKSApIHtcbiAgICAgIHRoaXMubGVmdFNpZGUubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcbiAgICAgICAgLXRoaXMuX2xlZnRNYXJnaW4sIDAsIGxlZnQsXG4gICAgICAgIDAsIGhlaWdodCwgdG9wLFxuICAgICAgICAwLCAwLCAxXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMucmlnaHRTaWRlLmhhc1BhcmVudCgpICkge1xuICAgICAgdGhpcy5yaWdodFNpZGUubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcbiAgICAgICAgdGhpcy5fcmlnaHRNYXJnaW4sIDAsIHJpZ2h0LFxuICAgICAgICAwLCBoZWlnaHQsIHRvcCxcbiAgICAgICAgMCwgMCwgMVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLnRvcFNpZGUuaGFzUGFyZW50KCkgKSB7XG4gICAgICB0aGlzLnRvcFNpZGUubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcbiAgICAgICAgMCwgd2lkdGgsIGxlZnQsXG4gICAgICAgIC10aGlzLl90b3BNYXJnaW4sIDAsIHRvcCxcbiAgICAgICAgMCwgMCwgMVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmJvdHRvbVNpZGUuaGFzUGFyZW50KCkgKSB7XG4gICAgICB0aGlzLmJvdHRvbVNpZGUubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcbiAgICAgICAgMCwgd2lkdGgsIGxlZnQsXG4gICAgICAgIHRoaXMuX2JvdHRvbU1hcmdpbiwgMCwgYm90dG9tLFxuICAgICAgICAwLCAwLCAxXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMudG9wTGVmdENvcm5lci5oYXNQYXJlbnQoKSApIHtcbiAgICAgIHRoaXMudG9wTGVmdENvcm5lci5tYXRyaXggPSBuZXcgTWF0cml4MygpLnJvd01ham9yKFxuICAgICAgICAtdGhpcy5fbGVmdE1hcmdpbiwgMCwgbGVmdCxcbiAgICAgICAgMCwgLXRoaXMuX3RvcE1hcmdpbiwgdG9wLFxuICAgICAgICAwLCAwLCAxXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMudG9wUmlnaHRDb3JuZXIuaGFzUGFyZW50KCkgKSB7XG4gICAgICB0aGlzLnRvcFJpZ2h0Q29ybmVyLm1hdHJpeCA9IG5ldyBNYXRyaXgzKCkucm93TWFqb3IoXG4gICAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luLCAwLCByaWdodCxcbiAgICAgICAgMCwgLXRoaXMuX3RvcE1hcmdpbiwgdG9wLFxuICAgICAgICAwLCAwLCAxXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuYm90dG9tTGVmdENvcm5lci5oYXNQYXJlbnQoKSApIHtcbiAgICAgIHRoaXMuYm90dG9tTGVmdENvcm5lci5tYXRyaXggPSBuZXcgTWF0cml4MygpLnJvd01ham9yKFxuICAgICAgICAtdGhpcy5fbGVmdE1hcmdpbiwgMCwgbGVmdCxcbiAgICAgICAgMCwgdGhpcy5fYm90dG9tTWFyZ2luLCBib3R0b20sXG4gICAgICAgIDAsIDAsIDFcbiAgICAgICk7XG4gICAgfVxuICAgIGlmICggdGhpcy5ib3R0b21SaWdodENvcm5lci5oYXNQYXJlbnQoKSApIHtcbiAgICAgIHRoaXMuYm90dG9tUmlnaHRDb3JuZXIubWF0cml4ID0gbmV3IE1hdHJpeDMoKS5yb3dNYWpvcihcbiAgICAgICAgdGhpcy5fcmlnaHRNYXJnaW4sIDAsIHJpZ2h0LFxuICAgICAgICAwLCB0aGlzLl9ib3R0b21NYXJnaW4sIGJvdHRvbSxcbiAgICAgICAgMCwgMCwgMVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIGRpc3Bvc2FsIHRvIGNsZWFuIHVwIHNvbWUgZXh0cmEgdGhpbmdzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsbFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSB3YW50IHRvIGJlIG5vdGlmaWVkIG9mIGZpbGwgY2hhbmdlcy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRGaWxsKCBmaWxsOiBUUGFpbnQgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQ29sb3JEZWYuaXNDb2xvckRlZiggZmlsbCApLCAnR3JhZGllbnRSZWN0YW5nbGUgb25seSBzdXBwb3J0cyBDb2xvckRlZiBhcyBhIGZpbGwnICk7XG5cbiAgICBzdXBlci5zZXRGaWxsKCBmaWxsICk7XG5cbiAgICB0aGlzLl9maWxsUHJvcGVydHkucGFpbnQgPSBmaWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogV2UgZG9uJ3Qgd2FudCB0byBhbGxvdyBzdHJva2VzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHNldFN0cm9rZSggc3Ryb2tlOiBUUGFpbnQgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3Ryb2tlID09PSBudWxsLCAnR3JhZGllbnRSZWN0YW5nbGUgb25seSBzdXBwb3J0cyBhIG51bGwgc3Ryb2tlJyApO1xuXG4gICAgc3VwZXIuc2V0U3Ryb2tlKCBzdHJva2UgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLypcbiAgICogTk9URSBUTyBUSEUgUkVBREVSOlxuICAgKiBUaGlzIHN1cGVyLWJvaWxlcnBsYXRlLWhlYXZ5IHN0eWxlIGlzIG1hZGUgdG8gY29uZm9ybSB0byB0aGUgZ3VpZGVsaW5lcy4gU29ycnkhXG4gICAqL1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBsZWZ0LXNpZGUgbWFyZ2luIGFtb3VudCAodGhlIGFtb3VudCBpbiBsb2NhbC1jb29yZGluYXRlIHVuaXRzIGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIHRvXG4gICAqIHdoZXJlIHRoZSBtYXJnaW4gZW5kcykuXG4gICAqL1xuICBwdWJsaWMgc2V0IGxlZnRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCxcbiAgICAgICdsZWZ0TWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9sZWZ0TWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX2xlZnRNYXJnaW4gPSB2YWx1ZTtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlTWFyZ2luKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGxlZnQtc2lkZSBtYXJnaW4gYW1vdW50LlxuICAgKi9cbiAgcHVibGljIGdldCBsZWZ0TWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2xlZnRNYXJnaW47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcmlnaHQtc2lkZSBtYXJnaW4gYW1vdW50ICh0aGUgYW1vdW50IGluIGxvY2FsLWNvb3JkaW5hdGUgdW5pdHMgZnJvbSB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIHRvXG4gICAqIHdoZXJlIHRoZSBtYXJnaW4gZW5kcykuXG4gICAqL1xuICBwdWJsaWMgc2V0IHJpZ2h0TWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAsXG4gICAgICAncmlnaHRNYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX3JpZ2h0TWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gdmFsdWU7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZU1hcmdpbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSByaWdodC1zaWRlIG1hcmdpbiBhbW91bnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHJpZ2h0TWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JpZ2h0TWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRvcC1zaWRlIG1hcmdpbiBhbW91bnQgKHRoZSBhbW91bnQgaW4gbG9jYWwtY29vcmRpbmF0ZSB1bml0cyBmcm9tIHRoZSB0b3AgZWRnZSBvZiB0aGUgcmVjdGFuZ2xlIHRvXG4gICAqIHdoZXJlIHRoZSBtYXJnaW4gZW5kcykuXG4gICAqL1xuICBwdWJsaWMgc2V0IHRvcE1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxuICAgICAgJ3RvcE1hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fdG9wTWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX3RvcE1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG9wLXNpZGUgbWFyZ2luIGFtb3VudC5cbiAgICovXG4gIHB1YmxpYyBnZXQgdG9wTWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RvcE1hcmdpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBib3R0b20tc2lkZSBtYXJnaW4gYW1vdW50ICh0aGUgYW1vdW50IGluIGxvY2FsLWNvb3JkaW5hdGUgdW5pdHMgZnJvbSB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHJlY3RhbmdsZSB0b1xuICAgKiB3aGVyZSB0aGUgbWFyZ2luIGVuZHMpLlxuICAgKi9cbiAgcHVibGljIHNldCBib3R0b21NYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCxcbiAgICAgICdib3R0b21NYXJnaW4gc2hvdWxkIGJlIGEgZmluaXRlIG5vbi1uZWdhdGl2ZSBudW1iZXInICk7XG5cbiAgICBpZiAoIHRoaXMuX2JvdHRvbU1hcmdpbiAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9ib3R0b21NYXJnaW4gPSB2YWx1ZTtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlTWFyZ2luKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJvdHRvbS1zaWRlIG1hcmdpbiBhbW91bnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGJvdHRvbU1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9ib3R0b21NYXJnaW47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbGVmdCBhbmQgcmlnaHQgbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0IHhNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCxcbiAgICAgICd4TWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9sZWZ0TWFyZ2luICE9PSB2YWx1ZSB8fCB0aGlzLl9yaWdodE1hcmdpbiAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9sZWZ0TWFyZ2luID0gdmFsdWU7XG4gICAgICB0aGlzLl9yaWdodE1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbGVmdCBhbmQgcmlnaHQgbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHhNYXJnaW4oKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9sZWZ0TWFyZ2luID09PSB0aGlzLl9yaWdodE1hcmdpbixcbiAgICAgICdsZWZ0TWFyZ2luIGFuZCByaWdodE1hcmdpbiBkaWZmZXIsIHNvIGdldHRpbmcgeE1hcmdpbiBpcyBub3Qgd2VsbC1kZWZpbmVkJyApO1xuXG4gICAgcmV0dXJuIHRoaXMuX2xlZnRNYXJnaW47XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdG9wIGFuZCBib3R0b20gbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0IHlNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHZhbHVlICkgJiYgdmFsdWUgPj0gMCxcbiAgICAgICd5TWFyZ2luIHNob3VsZCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl90b3BNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX2JvdHRvbU1hcmdpbiAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcbiAgICAgIHRoaXMuX2JvdHRvbU1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG9wIGFuZCBib3R0b20gbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHlNYXJnaW4oKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl90b3BNYXJnaW4gPT09IHRoaXMuX2JvdHRvbU1hcmdpbixcbiAgICAgICdsZWZ0TWFyZ2luIGFuZCByaWdodE1hcmdpbiBkaWZmZXIsIHNvIGdldHRpbmcgeU1hcmdpbiBpcyBub3Qgd2VsbC1kZWZpbmVkJyApO1xuXG4gICAgcmV0dXJuIHRoaXMuX3RvcE1hcmdpbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFsbCBvZiB0aGUgbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgc2V0IG1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwLFxuICAgICAgJ21hcmdpbiBzaG91bGQgYmUgYSBmaW5pdGUgbm9uLW5lZ2F0aXZlIG51bWJlcicgKTtcblxuICAgIGlmICggdGhpcy5fbGVmdE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fcmlnaHRNYXJnaW4gIT09IHZhbHVlIHx8IHRoaXMuX3RvcE1hcmdpbiAhPT0gdmFsdWUgfHwgdGhpcy5fYm90dG9tTWFyZ2luICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX2xlZnRNYXJnaW4gPSB2YWx1ZTtcbiAgICAgIHRoaXMuX3JpZ2h0TWFyZ2luID0gdmFsdWU7XG4gICAgICB0aGlzLl90b3BNYXJnaW4gPSB2YWx1ZTtcbiAgICAgIHRoaXMuX2JvdHRvbU1hcmdpbiA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVNYXJnaW4oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG9wIGFuZCBib3R0b20gbWFyZ2luIGFtb3VudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1hcmdpbigpOiBudW1iZXIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2xlZnRNYXJnaW4gPT09IHRoaXMuX3JpZ2h0TWFyZ2luICYmIHRoaXMuX3JpZ2h0TWFyZ2luID09PSB0aGlzLl90b3BNYXJnaW4gJiYgdGhpcy5fdG9wTWFyZ2luID09PSB0aGlzLl9ib3R0b21NYXJnaW4sXG4gICAgICAnU29tZSBtYXJnaW5zIGRpZmZlciwgc28gZ2V0dGluZyBtYXJnaW4gaXMgbm90IHdlbGwtZGVmaW5lZCcgKTtcblxuICAgIHJldHVybiB0aGlzLl9sZWZ0TWFyZ2luO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0aGUgY29ybmVycyBvZiB0aGUgbWFyZ2luIHdpbGwgYmUgcm91bmRlZCBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgc2V0IHJvdW5kTWFyZ2lucyggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgaWYgKCB0aGlzLl9yb3VuZE1hcmdpbnMgIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fcm91bmRNYXJnaW5zID0gdmFsdWU7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZVJvdW5kTWFyZ2lucygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGNvcm5lcnMgb2YgdGhlIG1hcmdpbiBhcmUgcm91bmRlZCBvciBub3QuXG4gICAqL1xuICBwdWJsaWMgZ2V0IHJvdW5kTWFyZ2lucygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcm91bmRNYXJnaW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGJvcmRlciBcImZhZGVcIiBjb2xvciAodGhhdCBpcyBvbiB0aGUgb3RoZXIgc2lkZSBvZiB0aGUgZ3JhZGllbnQpLlxuICAgKi9cbiAgcHVibGljIHNldCBib3JkZXIoIHZhbHVlOiBUUGFpbnQgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQ29sb3JEZWYuaXNDb2xvckRlZiggdmFsdWUgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9ib3JkZXJPdmVycmlkZVByb3BlcnR5LnBhaW50ICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHkucGFpbnQgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm9yZGVyIGNvbG9yIChzZWUgdGhlIHNldHRlcilcbiAgICovXG4gIHB1YmxpYyBnZXQgYm9yZGVyKCk6IFRQYWludCB7XG4gICAgcmV0dXJuIHRoaXMuX2JvcmRlck92ZXJyaWRlUHJvcGVydHkucGFpbnQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZXh0ZW5zaW9uIGFtb3VudCAoZnJvbSAwIHRvIDwxKSBvZiB3aGVyZSB0aGUgXCJzdGFydGluZ1wiIGdyYWRpZW50IGFtb3VudCBzaG91bGQgYmUuXG4gICAqL1xuICBwdWJsaWMgc2V0IGV4dGVuc2lvbiggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAwICYmIHZhbHVlIDwgMSApO1xuXG4gICAgaWYgKCB0aGlzLl9leHRlbnNpb24gIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fZXh0ZW5zaW9uID0gdmFsdWU7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUdyYWRpZW50cygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBleHRlbnNpb24gYW1vdW50IChzZWUgdGhlIHNldHRlcikuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGV4dGVuc2lvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9leHRlbnNpb247XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogR3JhZGllbnRSZWN0YW5nbGVPcHRpb25zICk6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG4vLyBXZSB1c2UgdGhlIE5vZGUgc3lzdGVtIGZvciBtdXRhdG9yIGtleXMsIHNvIHRoZXkgZ2V0IGFkZGVkIGhlcmVcbkdyYWRpZW50UmVjdGFuZ2xlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBbXG4gIC4uLkdSQURJRU5UX1JFQ1RBTkdMRV9PUFRJT05fS0VZUyxcbiAgLi4uUmVjdGFuZ2xlLnByb3RvdHlwZS5fbXV0YXRvcktleXNcbl07XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR3JhZGllbnRSZWN0YW5nbGUnLCBHcmFkaWVudFJlY3RhbmdsZSApOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNYXRyaXgzIiwiU2hhcGUiLCJDb2xvckRlZiIsIkxpbmVhckdyYWRpZW50IiwiUGFpbnRDb2xvclByb3BlcnR5IiwiUGF0aCIsIlJhZGlhbEdyYWRpZW50IiwiUmVjdGFuZ2xlIiwic2NlbmVyeVBoZXQiLCJHUkFESUVOVF9SRUNUQU5HTEVfT1BUSU9OX0tFWVMiLCJHcmFkaWVudFJlY3RhbmdsZSIsImludmFsaWRhdGVSb3VuZE1hcmdpbnMiLCJfcm91bmRNYXJnaW5zIiwidG9wTGVmdENvcm5lciIsInNoYXBlIiwicm91bmRlZFNoYXBlIiwidG9wUmlnaHRDb3JuZXIiLCJib3R0b21MZWZ0Q29ybmVyIiwiYm90dG9tUmlnaHRDb3JuZXIiLCJyZWN0YW5ndWxhclNoYXBlIiwiaW52YWxpZGF0ZUdyYWRpZW50cyIsImxpbmVhckdyYWRpZW50IiwiYWRkQ29sb3JTdG9wIiwiX2V4dGVuc2lvbiIsIl9maWxsUHJvcGVydHkiLCJfYm9yZGVyUHJvcGVydHkiLCJyYWRpYWxHcmFkaWVudCIsImxlZnRTaWRlIiwiZmlsbCIsInJpZ2h0U2lkZSIsInRvcFNpZGUiLCJib3R0b21TaWRlIiwiaW52YWxpZGF0ZVJlY3RhbmdsZSIsImludmFsaWRhdGVNYXJnaW4iLCJjaGlsZHJlbiIsIl9sZWZ0TWFyZ2luIiwicmVjdEhlaWdodCIsIl9yaWdodE1hcmdpbiIsIl90b3BNYXJnaW4iLCJyZWN0V2lkdGgiLCJfYm90dG9tTWFyZ2luIiwid2lkdGgiLCJoZWlnaHQiLCJsZWZ0IiwicmVjdFgiLCJ0b3AiLCJyZWN0WSIsInJpZ2h0IiwiYm90dG9tIiwiX3JlY3RZIiwiaGFzUGFyZW50IiwibWF0cml4Iiwicm93TWFqb3IiLCJkaXNwb3NlIiwiX2JvcmRlck92ZXJyaWRlUHJvcGVydHkiLCJzZXRGaWxsIiwiYXNzZXJ0IiwiaXNDb2xvckRlZiIsInBhaW50Iiwic2V0U3Ryb2tlIiwic3Ryb2tlIiwibGVmdE1hcmdpbiIsInZhbHVlIiwiaXNGaW5pdGUiLCJyaWdodE1hcmdpbiIsInRvcE1hcmdpbiIsImJvdHRvbU1hcmdpbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibWFyZ2luIiwicm91bmRNYXJnaW5zIiwiYm9yZGVyIiwiZXh0ZW5zaW9uIiwibXV0YXRlIiwib3B0aW9ucyIsInByb3ZpZGVkT3B0aW9ucyIsImJvcmRlck92ZXJyaWRlIiwid2l0aEFscGhhIiwibW92ZVRvIiwiYXJjIiwiTWF0aCIsIlBJIiwiY2xvc2UiLCJtYWtlSW1tdXRhYmxlIiwicmVjdGFuZ2xlIiwicHJvdG90eXBlIiwiX211dGF0b3JLZXlzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxP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