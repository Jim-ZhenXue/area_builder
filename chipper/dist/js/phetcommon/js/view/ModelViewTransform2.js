// Copyright 2013-2023, University of Colorado Boulder
/**
 * Transform between model and view coordinate frames, and provides convenience methods beyond phet.dot.Transform3
 *
 * Requires that the transform is "aligned", i.e., it can be built only from component-wise translation and scaling.
 * Equivalently, the output x coordinate should not depend on the input y, and the output y shouldn't depend on the
 * input x.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import phetcommon from '../phetcommon.js';
let ModelViewTransform2 = class ModelViewTransform2 extends Transform3 {
    //-------------------------------------------------------------------------------------------------------------
    //  convenience model => view
    //-------------------------------------------------------------------------------------------------------------
    modelToViewPosition(point) {
        return this.transformPosition2(point);
    }
    modelToViewXY(x, y) {
        return new Vector2(this.modelToViewX(x), this.modelToViewY(y));
    }
    modelToViewX(x) {
        return this.matrix.m00() * x + this.matrix.m02();
    }
    modelToViewY(y) {
        return this.matrix.m11() * y + this.matrix.m12();
    }
    modelToViewDelta(vector) {
        return this.transformDelta2(vector);
    }
    modelToViewNormal(normal) {
        return this.transformNormal2(normal);
    }
    modelToViewDeltaX(x) {
        return this.transformDeltaX(x);
    }
    modelToViewDeltaY(y) {
        return this.transformDeltaY(y);
    }
    modelToViewBounds(bounds) {
        return this.transformBounds2(bounds);
    }
    modelToViewShape(shape) {
        return this.transformShape(shape);
    }
    modelToViewRay(ray) {
        return this.transformRay2(ray);
    }
    //-------------------------------------------------------------------------------------------------------------
    //  convenience view => model
    //-------------------------------------------------------------------------------------------------------------
    viewToModelPosition(point) {
        return this.inversePosition2(point);
    }
    viewToModelXY(x, y) {
        return new Vector2(this.viewToModelX(x), this.viewToModelY(y));
    }
    viewToModelX(x) {
        const inverse = this.getInverse();
        return inverse.m00() * x + inverse.m02();
    }
    viewToModelY(y) {
        const inverse = this.getInverse();
        return inverse.m11() * y + inverse.m12();
    }
    viewToModelDelta(vector) {
        return this.inverseDelta2(vector);
    }
    viewToModelDeltaXY(x, y) {
        return new Vector2(this.viewToModelDeltaX(x), this.viewToModelDeltaY(y));
    }
    viewToModelNormal(normal) {
        return this.inverseNormal2(normal);
    }
    viewToModelDeltaX(x) {
        return this.inverseDeltaX(x);
    }
    viewToModelDeltaY(y) {
        return this.inverseDeltaY(y);
    }
    viewToModelBounds(bounds) {
        return this.inverseBounds2(bounds);
    }
    viewToModelShape(shape) {
        return this.inverseShape(shape);
    }
    viewToModelRay(ray) {
        return this.inverseRay2(ray);
    }
    validateMatrix(matrix) {
        super.validateMatrix(matrix);
        assert && assert(matrix.isAligned(), 'matrix must be aligned, ModelViewTransform2 does not support arbitrary rotations');
    }
    //-------------------------------------------------------------------------------------------------------------
    // Mutators.  Like its parent class, ModelViewTransform2 is mutable, and sends out notifications when changed.
    //-------------------------------------------------------------------------------------------------------------
    /**
   * See ModelViewTransform2.createRectangleMapping
   */ setToRectangleMapping(modelBounds, viewBounds) {
        const m00 = viewBounds.width / modelBounds.width;
        const m02 = viewBounds.x - m00 * modelBounds.x;
        const m11 = viewBounds.height / modelBounds.height;
        const m12 = viewBounds.y - m11 * modelBounds.y;
        this.setMatrix(Matrix3.affine(m00, 0, m02, 0, m11, m12));
        return this; // for chaining
    }
    /**
   * See ModelViewTransform2.createRectangleInvertedYMapping
   */ setToRectangleInvertedYMapping(modelBounds, viewBounds) {
        const m00 = viewBounds.width / modelBounds.width;
        const m02 = viewBounds.x - m00 * modelBounds.x;
        const m11 = -viewBounds.height / modelBounds.height;
        // vY == (mY + mHeight) * m11 + m12
        const m12 = viewBounds.y - m11 * modelBounds.getMaxY();
        this.setMatrix(Matrix3.affine(m00, 0, m02, 0, m11, m12));
        return this; // for chaining
    }
    /*---------------------------------------------------------------------------*
   * Factory methods
   *----------------------------------------------------------------------------*/ /**
   * Creates a ModelViewTransform2 that uses the identity transform (i.e. model coordinates are the same as view coordinates)
   */ static createIdentity() {
        return new ModelViewTransform2(Matrix3.IDENTITY);
    }
    /**
   * Creates a ModelViewTransform2 that has the specified scale and offset such that
   * view = model * scale + offset
   *
   * @param offset - the offset in view coordinates
   * @param scale - the scale to map model to view
   */ static createOffsetScaleMapping(offset, scale) {
        return new ModelViewTransform2(Matrix3.affine(scale, 0, offset.x, 0, scale, offset.y));
    }
    /**
   * Creates a shearless ModelViewTransform2 that has the specified scale and offset such that
   * view.x = model.x * xScale + offset.x
   * view.y = model.y * yScale + offset.y
   *
   * @param offset - the offset in view coordinates
   * @param xScale - the scale to map model to view in the x-dimension
   * @param yScale - the scale to map model to view in the y-dimension
   */ static createOffsetXYScaleMapping(offset, xScale, yScale) {
        return new ModelViewTransform2(Matrix3.affine(xScale, 0, offset.x, 0, yScale, offset.y));
    }
    /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given x and y scales.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param xScale - the amount to scale in the x direction
   * @param yScale - the amount to scale in the y direction
   */ static createSinglePointXYScaleMapping(modelPoint, viewPoint, xScale, yScale) {
        // mx * scale + ox = vx
        // my * scale + oy = vy
        const offsetX = viewPoint.x - modelPoint.x * xScale;
        const offsetY = viewPoint.y - modelPoint.y * yScale;
        return ModelViewTransform2.createOffsetXYScaleMapping(new Vector2(offsetX, offsetY), xScale, yScale);
    }
    /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given scale factor for both x and y dimensions.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param scale - the amount to scale in the x and y directions
   */ static createSinglePointScaleMapping(modelPoint, viewPoint, scale) {
        return ModelViewTransform2.createSinglePointXYScaleMapping(modelPoint, viewPoint, scale, scale);
    }
    /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given scale factor for both x and y dimensions, but inverting the y axis so that +y in the model
   * corresponds to -y in the view. Inverting the y axis is commonly necessary since +y is usually up in textbooks
   * and -y is down in pixel coordinates.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param scale - the amount to scale in the x and y directions
   */ static createSinglePointScaleInvertedYMapping(modelPoint, viewPoint, scale) {
        return ModelViewTransform2.createSinglePointXYScaleMapping(modelPoint, viewPoint, scale, -scale);
    }
    /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle
   * in the view, so that any point x% of the way across and y% down in the model rectangle will be mapped to the
   * corresponding point x% across and y% down in the view rectangle. Linear extrapolation is performed outside of
   * the rectangle bounds.
   *
   * @param modelBounds - the reference rectangle in the model, must have area > 0
   * @param viewBounds - the reference rectangle in the view, must have area > 0
   */ static createRectangleMapping(modelBounds, viewBounds) {
        return new ModelViewTransform2().setToRectangleMapping(modelBounds, viewBounds);
    }
    /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle
   * in the view, so that any point x% of the way across and y% down in the model rectangle will be mapped to the
   * corresponding point x% across and (100-y)% down in the view rectangle. Linear extrapolation is performed outside
   * of the rectangle bounds. Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y
   * is down in pixel coordinates.
   *
   * @param modelBounds - the reference rectangle in the model, must have area > 0
   * @param viewBounds - the reference rectangle in the view, must have area > 0
   */ static createRectangleInvertedYMapping(modelBounds, viewBounds) {
        return new ModelViewTransform2().setToRectangleInvertedYMapping(modelBounds, viewBounds);
    }
};
phetcommon.register('ModelViewTransform2', ModelViewTransform2);
export default ModelViewTransform2;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRyYW5zZm9ybSBiZXR3ZWVuIG1vZGVsIGFuZCB2aWV3IGNvb3JkaW5hdGUgZnJhbWVzLCBhbmQgcHJvdmlkZXMgY29udmVuaWVuY2UgbWV0aG9kcyBiZXlvbmQgcGhldC5kb3QuVHJhbnNmb3JtM1xuICpcbiAqIFJlcXVpcmVzIHRoYXQgdGhlIHRyYW5zZm9ybSBpcyBcImFsaWduZWRcIiwgaS5lLiwgaXQgY2FuIGJlIGJ1aWx0IG9ubHkgZnJvbSBjb21wb25lbnQtd2lzZSB0cmFuc2xhdGlvbiBhbmQgc2NhbGluZy5cbiAqIEVxdWl2YWxlbnRseSwgdGhlIG91dHB1dCB4IGNvb3JkaW5hdGUgc2hvdWxkIG5vdCBkZXBlbmQgb24gdGhlIGlucHV0IHksIGFuZCB0aGUgb3V0cHV0IHkgc2hvdWxkbid0IGRlcGVuZCBvbiB0aGVcbiAqIGlucHV0IHguXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgUmF5MiBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmF5Mi5qcyc7XG5pbXBvcnQgVHJhbnNmb3JtMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVHJhbnNmb3JtMy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgcGhldGNvbW1vbiBmcm9tICcuLi9waGV0Y29tbW9uLmpzJztcblxuY2xhc3MgTW9kZWxWaWV3VHJhbnNmb3JtMiBleHRlbmRzIFRyYW5zZm9ybTMge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgY29udmVuaWVuY2UgbW9kZWwgPT4gdmlld1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwdWJsaWMgbW9kZWxUb1ZpZXdQb3NpdGlvbiggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtUG9zaXRpb24yKCBwb2ludCApO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3WFkoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5tb2RlbFRvVmlld1goIHggKSwgdGhpcy5tb2RlbFRvVmlld1koIHkgKSApO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3WCggeDogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWF0cml4Lm0wMCgpICogeCArIHRoaXMubWF0cml4Lm0wMigpO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3WSggeTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubWF0cml4Lm0xMSgpICogeSArIHRoaXMubWF0cml4Lm0xMigpO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3RGVsdGEoIHZlY3RvcjogVmVjdG9yMiApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZWx0YTIoIHZlY3RvciApO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3Tm9ybWFsKCBub3JtYWw6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtTm9ybWFsMiggbm9ybWFsICk7XG4gIH1cblxuICBwdWJsaWMgbW9kZWxUb1ZpZXdEZWx0YVgoIHg6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybURlbHRhWCggeCApO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3RGVsdGFZKCB5OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1EZWx0YVkoIHkgKTtcbiAgfVxuXG4gIHB1YmxpYyBtb2RlbFRvVmlld0JvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybUJvdW5kczIoIGJvdW5kcyApO1xuICB9XG5cbiAgcHVibGljIG1vZGVsVG9WaWV3U2hhcGUoIHNoYXBlOiBTaGFwZSApOiBTaGFwZSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtU2hhcGUoIHNoYXBlICk7XG4gIH1cblxuICBwdWJsaWMgbW9kZWxUb1ZpZXdSYXkoIHJheTogUmF5MiApOiBSYXkyIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1SYXkyKCByYXkgKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgY29udmVuaWVuY2UgdmlldyA9PiBtb2RlbFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwdWJsaWMgdmlld1RvTW9kZWxQb3NpdGlvbiggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZVBvc2l0aW9uMiggcG9pbnQgKTtcbiAgfVxuXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbFhZKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHRoaXMudmlld1RvTW9kZWxYKCB4ICksIHRoaXMudmlld1RvTW9kZWxZKCB5ICkgKTtcbiAgfVxuXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbFgoIHg6IG51bWJlciApOiBudW1iZXIge1xuICAgIGNvbnN0IGludmVyc2UgPSB0aGlzLmdldEludmVyc2UoKTtcbiAgICByZXR1cm4gaW52ZXJzZS5tMDAoKSAqIHggKyBpbnZlcnNlLm0wMigpO1xuICB9XG5cbiAgcHVibGljIHZpZXdUb01vZGVsWSggeTogbnVtYmVyICk6IG51bWJlciB7XG4gICAgY29uc3QgaW52ZXJzZSA9IHRoaXMuZ2V0SW52ZXJzZSgpO1xuICAgIHJldHVybiBpbnZlcnNlLm0xMSgpICogeSArIGludmVyc2UubTEyKCk7XG4gIH1cblxuICBwdWJsaWMgdmlld1RvTW9kZWxEZWx0YSggdmVjdG9yOiBWZWN0b3IyICk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmludmVyc2VEZWx0YTIoIHZlY3RvciApO1xuICB9XG5cbiAgcHVibGljIHZpZXdUb01vZGVsRGVsdGFYWSggeDogbnVtYmVyLCB5OiBudW1iZXIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLnZpZXdUb01vZGVsRGVsdGFYKCB4ICksIHRoaXMudmlld1RvTW9kZWxEZWx0YVkoIHkgKSApO1xuICB9XG5cbiAgcHVibGljIHZpZXdUb01vZGVsTm9ybWFsKCBub3JtYWw6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZU5vcm1hbDIoIG5vcm1hbCApO1xuICB9XG5cbiAgcHVibGljIHZpZXdUb01vZGVsRGVsdGFYKCB4OiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbnZlcnNlRGVsdGFYKCB4ICk7XG4gIH1cblxuICBwdWJsaWMgdmlld1RvTW9kZWxEZWx0YVkoIHk6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmludmVyc2VEZWx0YVkoIHkgKTtcbiAgfVxuXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmludmVyc2VCb3VuZHMyKCBib3VuZHMgKTtcbiAgfVxuXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbFNoYXBlKCBzaGFwZTogU2hhcGUgKTogU2hhcGUge1xuICAgIHJldHVybiB0aGlzLmludmVyc2VTaGFwZSggc2hhcGUgKTtcbiAgfVxuXG4gIHB1YmxpYyB2aWV3VG9Nb2RlbFJheSggcmF5OiBSYXkyICk6IFJheTIge1xuICAgIHJldHVybiB0aGlzLmludmVyc2VSYXkyKCByYXkgKTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHZhbGlkYXRlTWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgc3VwZXIudmFsaWRhdGVNYXRyaXgoIG1hdHJpeCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5pc0FsaWduZWQoKSwgJ21hdHJpeCBtdXN0IGJlIGFsaWduZWQsIE1vZGVsVmlld1RyYW5zZm9ybTIgZG9lcyBub3Qgc3VwcG9ydCBhcmJpdHJhcnkgcm90YXRpb25zJyApO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE11dGF0b3JzLiAgTGlrZSBpdHMgcGFyZW50IGNsYXNzLCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGlzIG11dGFibGUsIGFuZCBzZW5kcyBvdXQgbm90aWZpY2F0aW9ucyB3aGVuIGNoYW5nZWQuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBTZWUgTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVSZWN0YW5nbGVNYXBwaW5nXG4gICAqL1xuICBwdWJsaWMgc2V0VG9SZWN0YW5nbGVNYXBwaW5nKCBtb2RlbEJvdW5kczogQm91bmRzMiwgdmlld0JvdW5kczogQm91bmRzMiApOiB0aGlzIHtcbiAgICBjb25zdCBtMDAgPSB2aWV3Qm91bmRzLndpZHRoIC8gbW9kZWxCb3VuZHMud2lkdGg7XG4gICAgY29uc3QgbTAyID0gdmlld0JvdW5kcy54IC0gbTAwICogbW9kZWxCb3VuZHMueDtcbiAgICBjb25zdCBtMTEgPSB2aWV3Qm91bmRzLmhlaWdodCAvIG1vZGVsQm91bmRzLmhlaWdodDtcbiAgICBjb25zdCBtMTIgPSB2aWV3Qm91bmRzLnkgLSBtMTEgKiBtb2RlbEJvdW5kcy55O1xuICAgIHRoaXMuc2V0TWF0cml4KCBNYXRyaXgzLmFmZmluZSggbTAwLCAwLCBtMDIsIDAsIG0xMSwgbTEyICkgKTtcbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogU2VlIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZ1xuICAgKi9cbiAgcHVibGljIHNldFRvUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyggbW9kZWxCb3VuZHM6IEJvdW5kczIsIHZpZXdCb3VuZHM6IEJvdW5kczIgKTogdGhpcyB7XG4gICAgY29uc3QgbTAwID0gdmlld0JvdW5kcy53aWR0aCAvIG1vZGVsQm91bmRzLndpZHRoO1xuICAgIGNvbnN0IG0wMiA9IHZpZXdCb3VuZHMueCAtIG0wMCAqIG1vZGVsQm91bmRzLng7XG4gICAgY29uc3QgbTExID0gLXZpZXdCb3VuZHMuaGVpZ2h0IC8gbW9kZWxCb3VuZHMuaGVpZ2h0O1xuXG4gICAgLy8gdlkgPT0gKG1ZICsgbUhlaWdodCkgKiBtMTEgKyBtMTJcbiAgICBjb25zdCBtMTIgPSB2aWV3Qm91bmRzLnkgLSBtMTEgKiBtb2RlbEJvdW5kcy5nZXRNYXhZKCk7XG4gICAgdGhpcy5zZXRNYXRyaXgoIE1hdHJpeDMuYWZmaW5lKCBtMDAsIDAsIG0wMiwgMCwgbTExLCBtMTIgKSApO1xuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBGYWN0b3J5IG1ldGhvZHNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIE1vZGVsVmlld1RyYW5zZm9ybTIgdGhhdCB1c2VzIHRoZSBpZGVudGl0eSB0cmFuc2Zvcm0gKGkuZS4gbW9kZWwgY29vcmRpbmF0ZXMgYXJlIHRoZSBzYW1lIGFzIHZpZXcgY29vcmRpbmF0ZXMpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUlkZW50aXR5KCk6IE1vZGVsVmlld1RyYW5zZm9ybTIge1xuICAgIHJldHVybiBuZXcgTW9kZWxWaWV3VHJhbnNmb3JtMiggTWF0cml4My5JREVOVElUWSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBNb2RlbFZpZXdUcmFuc2Zvcm0yIHRoYXQgaGFzIHRoZSBzcGVjaWZpZWQgc2NhbGUgYW5kIG9mZnNldCBzdWNoIHRoYXRcbiAgICogdmlldyA9IG1vZGVsICogc2NhbGUgKyBvZmZzZXRcbiAgICpcbiAgICogQHBhcmFtIG9mZnNldCAtIHRoZSBvZmZzZXQgaW4gdmlldyBjb29yZGluYXRlc1xuICAgKiBAcGFyYW0gc2NhbGUgLSB0aGUgc2NhbGUgdG8gbWFwIG1vZGVsIHRvIHZpZXdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlT2Zmc2V0U2NhbGVNYXBwaW5nKCBvZmZzZXQ6IFZlY3RvcjIsIHNjYWxlOiBudW1iZXIgKTogTW9kZWxWaWV3VHJhbnNmb3JtMiB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbFZpZXdUcmFuc2Zvcm0yKCBNYXRyaXgzLmFmZmluZSggc2NhbGUsIDAsIG9mZnNldC54LCAwLCBzY2FsZSwgb2Zmc2V0LnkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBzaGVhcmxlc3MgTW9kZWxWaWV3VHJhbnNmb3JtMiB0aGF0IGhhcyB0aGUgc3BlY2lmaWVkIHNjYWxlIGFuZCBvZmZzZXQgc3VjaCB0aGF0XG4gICAqIHZpZXcueCA9IG1vZGVsLnggKiB4U2NhbGUgKyBvZmZzZXQueFxuICAgKiB2aWV3LnkgPSBtb2RlbC55ICogeVNjYWxlICsgb2Zmc2V0LnlcbiAgICpcbiAgICogQHBhcmFtIG9mZnNldCAtIHRoZSBvZmZzZXQgaW4gdmlldyBjb29yZGluYXRlc1xuICAgKiBAcGFyYW0geFNjYWxlIC0gdGhlIHNjYWxlIHRvIG1hcCBtb2RlbCB0byB2aWV3IGluIHRoZSB4LWRpbWVuc2lvblxuICAgKiBAcGFyYW0geVNjYWxlIC0gdGhlIHNjYWxlIHRvIG1hcCBtb2RlbCB0byB2aWV3IGluIHRoZSB5LWRpbWVuc2lvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVPZmZzZXRYWVNjYWxlTWFwcGluZyggb2Zmc2V0OiBWZWN0b3IyLCB4U2NhbGU6IG51bWJlciwgeVNjYWxlOiBudW1iZXIgKTogTW9kZWxWaWV3VHJhbnNmb3JtMiB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbFZpZXdUcmFuc2Zvcm0yKCBNYXRyaXgzLmFmZmluZSggeFNjYWxlLCAwLCBvZmZzZXQueCwgMCwgeVNjYWxlLCBvZmZzZXQueSApICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNoZWFybGVzcyBNb2RlbFZpZXdUcmFuc2Zvcm0yIHRoYXQgbWFwcyB0aGUgc3BlY2lmaWVkIG1vZGVsIHBvaW50IHRvIHRoZSBzcGVjaWZpZWQgdmlldyBwb2ludCxcbiAgICogd2l0aCB0aGUgZ2l2ZW4geCBhbmQgeSBzY2FsZXMuXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbFBvaW50IC0gdGhlIHJlZmVyZW5jZSBwb2ludCBpbiB0aGUgbW9kZWwgd2hpY2ggbWFwcyB0byB0aGUgc3BlY2lmaWVkIHZpZXcgcG9pbnRcbiAgICogQHBhcmFtIHZpZXdQb2ludCAtIHRoZSByZWZlcmVuY2UgcG9pbnQgaW4gdGhlIHZpZXdcbiAgICogQHBhcmFtIHhTY2FsZSAtIHRoZSBhbW91bnQgdG8gc2NhbGUgaW4gdGhlIHggZGlyZWN0aW9uXG4gICAqIEBwYXJhbSB5U2NhbGUgLSB0aGUgYW1vdW50IHRvIHNjYWxlIGluIHRoZSB5IGRpcmVjdGlvblxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVTaW5nbGVQb2ludFhZU2NhbGVNYXBwaW5nKFxuICAgIG1vZGVsUG9pbnQ6IFZlY3RvcjIsIHZpZXdQb2ludDogVmVjdG9yMiwgeFNjYWxlOiBudW1iZXIsIHlTY2FsZTogbnVtYmVyICk6IE1vZGVsVmlld1RyYW5zZm9ybTIge1xuXG4gICAgLy8gbXggKiBzY2FsZSArIG94ID0gdnhcbiAgICAvLyBteSAqIHNjYWxlICsgb3kgPSB2eVxuICAgIGNvbnN0IG9mZnNldFggPSB2aWV3UG9pbnQueCAtIG1vZGVsUG9pbnQueCAqIHhTY2FsZTtcbiAgICBjb25zdCBvZmZzZXRZID0gdmlld1BvaW50LnkgLSBtb2RlbFBvaW50LnkgKiB5U2NhbGU7XG4gICAgcmV0dXJuIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlT2Zmc2V0WFlTY2FsZU1hcHBpbmcoIG5ldyBWZWN0b3IyKCBvZmZzZXRYLCBvZmZzZXRZICksIHhTY2FsZSwgeVNjYWxlICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNoZWFybGVzcyBNb2RlbFZpZXdUcmFuc2Zvcm0yIHRoYXQgbWFwcyB0aGUgc3BlY2lmaWVkIG1vZGVsIHBvaW50IHRvIHRoZSBzcGVjaWZpZWQgdmlldyBwb2ludCxcbiAgICogd2l0aCB0aGUgZ2l2ZW4gc2NhbGUgZmFjdG9yIGZvciBib3RoIHggYW5kIHkgZGltZW5zaW9ucy5cbiAgICpcbiAgICogQHBhcmFtIG1vZGVsUG9pbnQgLSB0aGUgcmVmZXJlbmNlIHBvaW50IGluIHRoZSBtb2RlbCB3aGljaCBtYXBzIHRvIHRoZSBzcGVjaWZpZWQgdmlldyBwb2ludFxuICAgKiBAcGFyYW0gdmlld1BvaW50IC0gdGhlIHJlZmVyZW5jZSBwb2ludCBpbiB0aGUgdmlld1xuICAgKiBAcGFyYW0gc2NhbGUgLSB0aGUgYW1vdW50IHRvIHNjYWxlIGluIHRoZSB4IGFuZCB5IGRpcmVjdGlvbnNcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlU2luZ2xlUG9pbnRTY2FsZU1hcHBpbmcoXG4gICAgbW9kZWxQb2ludDogVmVjdG9yMiwgdmlld1BvaW50OiBWZWN0b3IyLCBzY2FsZTogbnVtYmVyICk6IE1vZGVsVmlld1RyYW5zZm9ybTIge1xuICAgIHJldHVybiBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50WFlTY2FsZU1hcHBpbmcoIG1vZGVsUG9pbnQsIHZpZXdQb2ludCwgc2NhbGUsIHNjYWxlICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNoZWFybGVzcyBNb2RlbFZpZXdUcmFuc2Zvcm0yIHRoYXQgbWFwcyB0aGUgc3BlY2lmaWVkIG1vZGVsIHBvaW50IHRvIHRoZSBzcGVjaWZpZWQgdmlldyBwb2ludCxcbiAgICogd2l0aCB0aGUgZ2l2ZW4gc2NhbGUgZmFjdG9yIGZvciBib3RoIHggYW5kIHkgZGltZW5zaW9ucywgYnV0IGludmVydGluZyB0aGUgeSBheGlzIHNvIHRoYXQgK3kgaW4gdGhlIG1vZGVsXG4gICAqIGNvcnJlc3BvbmRzIHRvIC15IGluIHRoZSB2aWV3LiBJbnZlcnRpbmcgdGhlIHkgYXhpcyBpcyBjb21tb25seSBuZWNlc3Nhcnkgc2luY2UgK3kgaXMgdXN1YWxseSB1cCBpbiB0ZXh0Ym9va3NcbiAgICogYW5kIC15IGlzIGRvd24gaW4gcGl4ZWwgY29vcmRpbmF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBtb2RlbFBvaW50IC0gdGhlIHJlZmVyZW5jZSBwb2ludCBpbiB0aGUgbW9kZWwgd2hpY2ggbWFwcyB0byB0aGUgc3BlY2lmaWVkIHZpZXcgcG9pbnRcbiAgICogQHBhcmFtIHZpZXdQb2ludCAtIHRoZSByZWZlcmVuY2UgcG9pbnQgaW4gdGhlIHZpZXdcbiAgICogQHBhcmFtIHNjYWxlIC0gdGhlIGFtb3VudCB0byBzY2FsZSBpbiB0aGUgeCBhbmQgeSBkaXJlY3Rpb25zXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKFxuICAgIG1vZGVsUG9pbnQ6IFZlY3RvcjIsIHZpZXdQb2ludDogVmVjdG9yMiwgc2NhbGU6IG51bWJlciApOiBNb2RlbFZpZXdUcmFuc2Zvcm0yIHtcbiAgICByZXR1cm4gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFhZU2NhbGVNYXBwaW5nKCBtb2RlbFBvaW50LCB2aWV3UG9pbnQsIHNjYWxlLCAtc2NhbGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc2hlYXJsZXNzIE1vZGVsVmlld1RyYW5zZm9ybTIgdGhhdCBtYXBzIHRoZSBzcGVjaWZpZWQgcmVjdGFuZ2xlIGluIHRoZSBtb2RlbCB0byB0aGUgc3BlY2lmaWVkIHJlY3RhbmdsZVxuICAgKiBpbiB0aGUgdmlldywgc28gdGhhdCBhbnkgcG9pbnQgeCUgb2YgdGhlIHdheSBhY3Jvc3MgYW5kIHklIGRvd24gaW4gdGhlIG1vZGVsIHJlY3RhbmdsZSB3aWxsIGJlIG1hcHBlZCB0byB0aGVcbiAgICogY29ycmVzcG9uZGluZyBwb2ludCB4JSBhY3Jvc3MgYW5kIHklIGRvd24gaW4gdGhlIHZpZXcgcmVjdGFuZ2xlLiBMaW5lYXIgZXh0cmFwb2xhdGlvbiBpcyBwZXJmb3JtZWQgb3V0c2lkZSBvZlxuICAgKiB0aGUgcmVjdGFuZ2xlIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIG1vZGVsQm91bmRzIC0gdGhlIHJlZmVyZW5jZSByZWN0YW5nbGUgaW4gdGhlIG1vZGVsLCBtdXN0IGhhdmUgYXJlYSA+IDBcbiAgICogQHBhcmFtIHZpZXdCb3VuZHMgLSB0aGUgcmVmZXJlbmNlIHJlY3RhbmdsZSBpbiB0aGUgdmlldywgbXVzdCBoYXZlIGFyZWEgPiAwXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVJlY3RhbmdsZU1hcHBpbmcoIG1vZGVsQm91bmRzOiBCb3VuZHMyLCB2aWV3Qm91bmRzOiBCb3VuZHMyICk6IE1vZGVsVmlld1RyYW5zZm9ybTIge1xuICAgIHJldHVybiBuZXcgTW9kZWxWaWV3VHJhbnNmb3JtMigpLnNldFRvUmVjdGFuZ2xlTWFwcGluZyggbW9kZWxCb3VuZHMsIHZpZXdCb3VuZHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgc2hlYXJsZXNzIE1vZGVsVmlld1RyYW5zZm9ybTIgdGhhdCBtYXBzIHRoZSBzcGVjaWZpZWQgcmVjdGFuZ2xlIGluIHRoZSBtb2RlbCB0byB0aGUgc3BlY2lmaWVkIHJlY3RhbmdsZVxuICAgKiBpbiB0aGUgdmlldywgc28gdGhhdCBhbnkgcG9pbnQgeCUgb2YgdGhlIHdheSBhY3Jvc3MgYW5kIHklIGRvd24gaW4gdGhlIG1vZGVsIHJlY3RhbmdsZSB3aWxsIGJlIG1hcHBlZCB0byB0aGVcbiAgICogY29ycmVzcG9uZGluZyBwb2ludCB4JSBhY3Jvc3MgYW5kICgxMDAteSklIGRvd24gaW4gdGhlIHZpZXcgcmVjdGFuZ2xlLiBMaW5lYXIgZXh0cmFwb2xhdGlvbiBpcyBwZXJmb3JtZWQgb3V0c2lkZVxuICAgKiBvZiB0aGUgcmVjdGFuZ2xlIGJvdW5kcy4gSW52ZXJ0aW5nIHRoZSB5IGF4aXMgaXMgY29tbW9ubHkgbmVjZXNzYXJ5IHNpbmNlICt5IGlzIHVzdWFsbHkgdXAgaW4gdGV4dGJvb2tzIGFuZCAteVxuICAgKiBpcyBkb3duIGluIHBpeGVsIGNvb3JkaW5hdGVzLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kZWxCb3VuZHMgLSB0aGUgcmVmZXJlbmNlIHJlY3RhbmdsZSBpbiB0aGUgbW9kZWwsIG11c3QgaGF2ZSBhcmVhID4gMFxuICAgKiBAcGFyYW0gdmlld0JvdW5kcyAtIHRoZSByZWZlcmVuY2UgcmVjdGFuZ2xlIGluIHRoZSB2aWV3LCBtdXN0IGhhdmUgYXJlYSA+IDBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyggbW9kZWxCb3VuZHM6IEJvdW5kczIsIHZpZXdCb3VuZHM6IEJvdW5kczIgKTogTW9kZWxWaWV3VHJhbnNmb3JtMiB7XG4gICAgcmV0dXJuIG5ldyBNb2RlbFZpZXdUcmFuc2Zvcm0yKCkuc2V0VG9SZWN0YW5nbGVJbnZlcnRlZFlNYXBwaW5nKCBtb2RlbEJvdW5kcywgdmlld0JvdW5kcyApO1xuICB9XG59XG5cbnBoZXRjb21tb24ucmVnaXN0ZXIoICdNb2RlbFZpZXdUcmFuc2Zvcm0yJywgTW9kZWxWaWV3VHJhbnNmb3JtMiApO1xuZXhwb3J0IGRlZmF1bHQgTW9kZWxWaWV3VHJhbnNmb3JtMjsiXSwibmFtZXMiOlsiTWF0cml4MyIsIlRyYW5zZm9ybTMiLCJWZWN0b3IyIiwicGhldGNvbW1vbiIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwicG9pbnQiLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJtb2RlbFRvVmlld1hZIiwieCIsInkiLCJtb2RlbFRvVmlld1giLCJtb2RlbFRvVmlld1kiLCJtYXRyaXgiLCJtMDAiLCJtMDIiLCJtMTEiLCJtMTIiLCJtb2RlbFRvVmlld0RlbHRhIiwidmVjdG9yIiwidHJhbnNmb3JtRGVsdGEyIiwibW9kZWxUb1ZpZXdOb3JtYWwiLCJub3JtYWwiLCJ0cmFuc2Zvcm1Ob3JtYWwyIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJ0cmFuc2Zvcm1EZWx0YVgiLCJtb2RlbFRvVmlld0RlbHRhWSIsInRyYW5zZm9ybURlbHRhWSIsIm1vZGVsVG9WaWV3Qm91bmRzIiwiYm91bmRzIiwidHJhbnNmb3JtQm91bmRzMiIsIm1vZGVsVG9WaWV3U2hhcGUiLCJzaGFwZSIsInRyYW5zZm9ybVNoYXBlIiwibW9kZWxUb1ZpZXdSYXkiLCJyYXkiLCJ0cmFuc2Zvcm1SYXkyIiwidmlld1RvTW9kZWxQb3NpdGlvbiIsImludmVyc2VQb3NpdGlvbjIiLCJ2aWV3VG9Nb2RlbFhZIiwidmlld1RvTW9kZWxYIiwidmlld1RvTW9kZWxZIiwiaW52ZXJzZSIsImdldEludmVyc2UiLCJ2aWV3VG9Nb2RlbERlbHRhIiwiaW52ZXJzZURlbHRhMiIsInZpZXdUb01vZGVsRGVsdGFYWSIsInZpZXdUb01vZGVsRGVsdGFYIiwidmlld1RvTW9kZWxEZWx0YVkiLCJ2aWV3VG9Nb2RlbE5vcm1hbCIsImludmVyc2VOb3JtYWwyIiwiaW52ZXJzZURlbHRhWCIsImludmVyc2VEZWx0YVkiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImludmVyc2VCb3VuZHMyIiwidmlld1RvTW9kZWxTaGFwZSIsImludmVyc2VTaGFwZSIsInZpZXdUb01vZGVsUmF5IiwiaW52ZXJzZVJheTIiLCJ2YWxpZGF0ZU1hdHJpeCIsImFzc2VydCIsImlzQWxpZ25lZCIsInNldFRvUmVjdGFuZ2xlTWFwcGluZyIsIm1vZGVsQm91bmRzIiwidmlld0JvdW5kcyIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0TWF0cml4IiwiYWZmaW5lIiwic2V0VG9SZWN0YW5nbGVJbnZlcnRlZFlNYXBwaW5nIiwiZ2V0TWF4WSIsImNyZWF0ZUlkZW50aXR5IiwiSURFTlRJVFkiLCJjcmVhdGVPZmZzZXRTY2FsZU1hcHBpbmciLCJvZmZzZXQiLCJzY2FsZSIsImNyZWF0ZU9mZnNldFhZU2NhbGVNYXBwaW5nIiwieFNjYWxlIiwieVNjYWxlIiwiY3JlYXRlU2luZ2xlUG9pbnRYWVNjYWxlTWFwcGluZyIsIm1vZGVsUG9pbnQiLCJ2aWV3UG9pbnQiLCJvZmZzZXRYIiwib2Zmc2V0WSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVNYXBwaW5nIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJjcmVhdGVSZWN0YW5nbGVNYXBwaW5nIiwiY3JlYXRlUmVjdGFuZ2xlSW52ZXJ0ZWRZTWFwcGluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7OztDQVNDLEdBR0QsT0FBT0EsYUFBYSw2QkFBNkI7QUFFakQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUN2RCxPQUFPQyxhQUFhLDZCQUE2QjtBQUVqRCxPQUFPQyxnQkFBZ0IsbUJBQW1CO0FBRTFDLElBQUEsQUFBTUMsc0JBQU4sTUFBTUEsNEJBQTRCSDtJQUVoQywrR0FBK0c7SUFDL0csNkJBQTZCO0lBQzdCLCtHQUErRztJQUV4R0ksb0JBQXFCQyxLQUFjLEVBQVk7UUFDcEQsT0FBTyxJQUFJLENBQUNDLGtCQUFrQixDQUFFRDtJQUNsQztJQUVPRSxjQUFlQyxDQUFTLEVBQUVDLENBQVMsRUFBWTtRQUNwRCxPQUFPLElBQUlSLFFBQVMsSUFBSSxDQUFDUyxZQUFZLENBQUVGLElBQUssSUFBSSxDQUFDRyxZQUFZLENBQUVGO0lBQ2pFO0lBRU9DLGFBQWNGLENBQVMsRUFBVztRQUN2QyxPQUFPLElBQUksQ0FBQ0ksTUFBTSxDQUFDQyxHQUFHLEtBQUtMLElBQUksSUFBSSxDQUFDSSxNQUFNLENBQUNFLEdBQUc7SUFDaEQ7SUFFT0gsYUFBY0YsQ0FBUyxFQUFXO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDRyxNQUFNLENBQUNHLEdBQUcsS0FBS04sSUFBSSxJQUFJ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