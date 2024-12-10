// Copyright 2019-2021, University of Colorado Boulder
/**
 * Provides the transforms between model and view 3D-coordinate systems. In both coordinate systems, +x is to the right,
 * +y is down, +z is away from the viewer. Sign of rotation angles is specified using the right-hand rule.
 *
 * +y
 * ^    +z
 * |   /
 * |  /
 * | /
 * +-------> +x
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector3 from '../../../dot/js/Vector3.js';
import merge from '../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import sceneryPhet from '../sceneryPhet.js';
// Scratch variable for performance
// @private
const scratchVector2 = new Vector2(0, 0);
const scratchVector3 = new Vector3(0, 0, 0);
let YawPitchModelViewTransform3 = class YawPitchModelViewTransform3 {
    //----------------------------------------------------------------------------
    // Model-to-view transforms
    //----------------------------------------------------------------------------
    /**
   * Maps a point from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {Vector3} modelPoint
   * @returns {Vector2}
   */ modelToViewPosition(modelPoint) {
        assert && assert(modelPoint instanceof Vector3, `modelPoint must be of type Vector3. Received ${modelPoint}`);
        scratchVector2.setPolar(modelPoint.z * Math.sin(this.pitch), this.yaw);
        scratchVector2.addXY(modelPoint.x, modelPoint.y);
        return this.modelToViewTransform2D.transformPosition2(scratchVector2);
    }
    /**
   * Maps a point from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Vector2}
   */ modelToViewXYZ(x, y, z) {
        return this.modelToViewPosition(scratchVector3.setXYZ(x, y, z));
    }
    /**
   * Maps a delta from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {Vector3} delta
   * @returns {Vector2}
   */ modelToViewDelta(delta) {
        const origin = this.modelToViewPosition(scratchVector3.setXYZ(0, 0, 0));
        return this.modelToViewPosition(delta).minus(origin);
    }
    /**
   * Maps a delta from 3D model coordinates to 2D view coordinates.
   * @public
   *
   * @param {number} xDelta
   * @param {number} yDelta
   * @param {number} zDelta
   * @returns {Vector2}
   */ modelToViewDeltaXYZ(xDelta, yDelta, zDelta) {
        return this.modelToViewDelta(new Vector3(xDelta, yDelta, zDelta));
    }
    /**
   * Model shapes are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param {Shape} modelShape
   * @returns {Shape}
   */ modelToViewShape(modelShape) {
        return this.modelToViewTransform2D.transformShape(modelShape);
    }
    /**
   * Bounds are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param  {Bounds2} modelBounds
   * @returns {Bounds2}
   */ modelToViewBounds(modelBounds) {
        return this.modelToViewTransform2D.transformBounds2(modelBounds);
    }
    //----------------------------------------------------------------------------
    // View-to-model transforms
    //----------------------------------------------------------------------------
    /**
   * Maps a point from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * This is different than the inverse of modelToViewPosition.
   * @public
   *
   * @param {Vector2} viewPoint
   * @returns {Vector3}
   */ viewToModelPosition(viewPoint) {
        return this.modelToViewTransform2D.inversePosition2(viewPoint).toVector3();
    }
    /**
   * Maps a point from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @returns {Vector3}
   */ viewToModelXY(x, y) {
        return this.viewToModelPosition(scratchVector2.setXY(x, y));
    }
    /**
   * Maps a delta from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {Vector2} delta
   * @returns {Vector3}
   */ viewToModelDelta(delta) {
        const origin = this.viewToModelPosition(scratchVector2.setXY(0, 0));
        return this.viewToModelPosition(delta).minus(origin);
    }
    /**
   * Maps a delta from 2D view coordinates to 3D model coordinates. The z coordinate will be zero.
   * @public
   *
   * @param {number} xDelta
   * @param {number} yDelta
   * @returns {Vector3}
   */ viewToModelDeltaXY(xDelta, yDelta) {
        return this.viewToModelDelta(new Vector2(xDelta, yDelta));
    }
    /**
   * Model shapes are all in the 2D xy plane, and have no depth.
   * @public
   *
   * @param {Shape} viewShape
   * @returns {Shape}
   */ viewToModelShape(viewShape) {
        return this.modelToViewTransform2D.inverseShape(viewShape);
    }
    /**
   * Transforms 2D view bounds to 2D model bounds since bounds have no depth.
   * @public
   *
   * @param {Bounds2} viewBounds
   * @returns {Bounds2}
   */ viewToModelBounds(viewBounds) {
        return this.modelToViewTransform2D.inverseBounds2(viewBounds);
    }
    /**
   * @param {Object} [options]
   */ constructor(options){
        options = merge({
            scale: 12000,
            pitch: 30 * Math.PI / 180,
            yaw: -45 * Math.PI / 180 // rotation about the vertical (y) axis, sign determined using the right-hand rule (radians)
        }, options);
        // @private {ModelViewTransform2}
        this.modelToViewTransform2D = new ModelViewTransform2(Matrix3.scaling(options.scale));
        // @private {number}
        this.pitch = options.pitch;
        // @public {number} (read-only)
        this.yaw = options.yaw;
    }
};
sceneryPhet.register('YawPitchModelViewTransform3', YawPitchModelViewTransform3);
export default YawPitchModelViewTransform3;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFByb3ZpZGVzIHRoZSB0cmFuc2Zvcm1zIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgM0QtY29vcmRpbmF0ZSBzeXN0ZW1zLiBJbiBib3RoIGNvb3JkaW5hdGUgc3lzdGVtcywgK3ggaXMgdG8gdGhlIHJpZ2h0LFxuICogK3kgaXMgZG93biwgK3ogaXMgYXdheSBmcm9tIHRoZSB2aWV3ZXIuIFNpZ24gb2Ygcm90YXRpb24gYW5nbGVzIGlzIHNwZWNpZmllZCB1c2luZyB0aGUgcmlnaHQtaGFuZCBydWxlLlxuICpcbiAqICt5XG4gKiBeICAgICt6XG4gKiB8ICAgL1xuICogfCAgL1xuICogfCAvXG4gKiArLS0tLS0tLT4gK3hcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi9zY2VuZXJ5UGhldC5qcyc7XG5cbi8vIFNjcmF0Y2ggdmFyaWFibGUgZm9yIHBlcmZvcm1hbmNlXG4vLyBAcHJpdmF0ZVxuY29uc3Qgc2NyYXRjaFZlY3RvcjIgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuY29uc3Qgc2NyYXRjaFZlY3RvcjMgPSBuZXcgVmVjdG9yMyggMCwgMCwgMCApO1xuXG5jbGFzcyBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgc2NhbGU6IDEyMDAwLCAvLyBzY2FsZSBmb3IgbWFwcGluZyBmcm9tIG1vZGVsIHRvIHZpZXcgKHggYW5kIHkgc2NhbGUgYXJlIGlkZW50aWNhbClcbiAgICAgIHBpdGNoOiAzMCAqIE1hdGguUEkgLyAxODAsIC8vIHJvdGF0aW9uIGFib3V0IHRoZSBob3Jpem9udGFsICh4KSBheGlzLCBzaWduIGRldGVybWluZWQgdXNpbmcgdGhlIHJpZ2h0LWhhbmQgcnVsZSAocmFkaWFucylcbiAgICAgIHlhdzogLTQ1ICogTWF0aC5QSSAvIDE4MCAvLyByb3RhdGlvbiBhYm91dCB0aGUgdmVydGljYWwgKHkpIGF4aXMsIHNpZ24gZGV0ZXJtaW5lZCB1c2luZyB0aGUgcmlnaHQtaGFuZCBydWxlIChyYWRpYW5zKVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIC8vIEBwcml2YXRlIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfVxuICAgIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRCA9IG5ldyBNb2RlbFZpZXdUcmFuc2Zvcm0yKCBNYXRyaXgzLnNjYWxpbmcoIG9wdGlvbnMuc2NhbGUgKSApO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cbiAgICB0aGlzLnBpdGNoID0gb3B0aW9ucy5waXRjaDtcblxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gKHJlYWQtb25seSlcbiAgICB0aGlzLnlhdyA9IG9wdGlvbnMueWF3O1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE1vZGVsLXRvLXZpZXcgdHJhbnNmb3Jtc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKipcbiAgICogTWFwcyBhIHBvaW50IGZyb20gM0QgbW9kZWwgY29vcmRpbmF0ZXMgdG8gMkQgdmlldyBjb29yZGluYXRlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlY3RvcjN9IG1vZGVsUG9pbnRcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICBtb2RlbFRvVmlld1Bvc2l0aW9uKCBtb2RlbFBvaW50ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1vZGVsUG9pbnQgaW5zdGFuY2VvZiBWZWN0b3IzLCBgbW9kZWxQb2ludCBtdXN0IGJlIG9mIHR5cGUgVmVjdG9yMy4gUmVjZWl2ZWQgJHttb2RlbFBvaW50fWAgKTtcbiAgICBzY3JhdGNoVmVjdG9yMi5zZXRQb2xhciggbW9kZWxQb2ludC56ICogTWF0aC5zaW4oIHRoaXMucGl0Y2ggKSwgdGhpcy55YXcgKTtcbiAgICBzY3JhdGNoVmVjdG9yMi5hZGRYWSggbW9kZWxQb2ludC54LCBtb2RlbFBvaW50LnkgKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbFRvVmlld1RyYW5zZm9ybTJELnRyYW5zZm9ybVBvc2l0aW9uMiggc2NyYXRjaFZlY3RvcjIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgcG9pbnQgZnJvbSAzRCBtb2RlbCBjb29yZGluYXRlcyB0byAyRCB2aWV3IGNvb3JkaW5hdGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxuICAgKi9cbiAgbW9kZWxUb1ZpZXdYWVooIHgsIHksIHogKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdQb3NpdGlvbiggc2NyYXRjaFZlY3RvcjMuc2V0WFlaKCB4LCB5LCB6ICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgZGVsdGEgZnJvbSAzRCBtb2RlbCBjb29yZGluYXRlcyB0byAyRCB2aWV3IGNvb3JkaW5hdGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yM30gZGVsdGFcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XG4gICAqL1xuICBtb2RlbFRvVmlld0RlbHRhKCBkZWx0YSApIHtcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLm1vZGVsVG9WaWV3UG9zaXRpb24oIHNjcmF0Y2hWZWN0b3IzLnNldFhZWiggMCwgMCwgMCApICk7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdQb3NpdGlvbiggZGVsdGEgKS5taW51cyggb3JpZ2luICk7XG4gIH1cblxuICAvKipcbiAgICogTWFwcyBhIGRlbHRhIGZyb20gM0QgbW9kZWwgY29vcmRpbmF0ZXMgdG8gMkQgdmlldyBjb29yZGluYXRlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geERlbHRhXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5RGVsdGFcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpEZWx0YVxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cbiAgICovXG4gIG1vZGVsVG9WaWV3RGVsdGFYWVooIHhEZWx0YSwgeURlbHRhLCB6RGVsdGEgKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdEZWx0YSggbmV3IFZlY3RvcjMoIHhEZWx0YSwgeURlbHRhLCB6RGVsdGEgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGVsIHNoYXBlcyBhcmUgYWxsIGluIHRoZSAyRCB4eSBwbGFuZSwgYW5kIGhhdmUgbm8gZGVwdGguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtTaGFwZX0gbW9kZWxTaGFwZVxuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBtb2RlbFRvVmlld1NoYXBlKCBtb2RlbFNoYXBlICkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsVG9WaWV3VHJhbnNmb3JtMkQudHJhbnNmb3JtU2hhcGUoIG1vZGVsU2hhcGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb3VuZHMgYXJlIGFsbCBpbiB0aGUgMkQgeHkgcGxhbmUsIGFuZCBoYXZlIG5vIGRlcHRoLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSAge0JvdW5kczJ9IG1vZGVsQm91bmRzXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxuICAgKi9cbiAgbW9kZWxUb1ZpZXdCb3VuZHMoIG1vZGVsQm91bmRzICkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsVG9WaWV3VHJhbnNmb3JtMkQudHJhbnNmb3JtQm91bmRzMiggbW9kZWxCb3VuZHMgKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBWaWV3LXRvLW1vZGVsIHRyYW5zZm9ybXNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIE1hcHMgYSBwb2ludCBmcm9tIDJEIHZpZXcgY29vcmRpbmF0ZXMgdG8gM0QgbW9kZWwgY29vcmRpbmF0ZXMuIFRoZSB6IGNvb3JkaW5hdGUgd2lsbCBiZSB6ZXJvLlxuICAgKiBUaGlzIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBpbnZlcnNlIG9mIG1vZGVsVG9WaWV3UG9zaXRpb24uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB2aWV3UG9pbnRcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XG4gICAqL1xuICB2aWV3VG9Nb2RlbFBvc2l0aW9uKCB2aWV3UG9pbnQgKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRC5pbnZlcnNlUG9zaXRpb24yKCB2aWV3UG9pbnQgKS50b1ZlY3RvcjMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXBzIGEgcG9pbnQgZnJvbSAyRCB2aWV3IGNvb3JkaW5hdGVzIHRvIDNEIG1vZGVsIGNvb3JkaW5hdGVzLiBUaGUgeiBjb29yZGluYXRlIHdpbGwgYmUgemVyby5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0geFxuICAgKiBAcGFyYW0ge251bWJlcn0geVxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cbiAgICovXG4gIHZpZXdUb01vZGVsWFkoIHgsIHkgKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld1RvTW9kZWxQb3NpdGlvbiggc2NyYXRjaFZlY3RvcjIuc2V0WFkoIHgsIHkgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcHMgYSBkZWx0YSBmcm9tIDJEIHZpZXcgY29vcmRpbmF0ZXMgdG8gM0QgbW9kZWwgY29vcmRpbmF0ZXMuIFRoZSB6IGNvb3JkaW5hdGUgd2lsbCBiZSB6ZXJvLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gZGVsdGFcbiAgICogQHJldHVybnMge1ZlY3RvcjN9XG4gICAqL1xuICB2aWV3VG9Nb2RlbERlbHRhKCBkZWx0YSApIHtcbiAgICBjb25zdCBvcmlnaW4gPSB0aGlzLnZpZXdUb01vZGVsUG9zaXRpb24oIHNjcmF0Y2hWZWN0b3IyLnNldFhZKCAwLCAwICkgKTtcblxuICAgIHJldHVybiB0aGlzLnZpZXdUb01vZGVsUG9zaXRpb24oIGRlbHRhICkubWludXMoIG9yaWdpbiApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcHMgYSBkZWx0YSBmcm9tIDJEIHZpZXcgY29vcmRpbmF0ZXMgdG8gM0QgbW9kZWwgY29vcmRpbmF0ZXMuIFRoZSB6IGNvb3JkaW5hdGUgd2lsbCBiZSB6ZXJvLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4RGVsdGFcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlEZWx0YVxuICAgKiBAcmV0dXJucyB7VmVjdG9yM31cbiAgICovXG4gIHZpZXdUb01vZGVsRGVsdGFYWSggeERlbHRhLCB5RGVsdGEgKSB7XG4gICAgcmV0dXJuIHRoaXMudmlld1RvTW9kZWxEZWx0YSggbmV3IFZlY3RvcjIoIHhEZWx0YSwgeURlbHRhICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RlbCBzaGFwZXMgYXJlIGFsbCBpbiB0aGUgMkQgeHkgcGxhbmUsIGFuZCBoYXZlIG5vIGRlcHRoLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U2hhcGV9IHZpZXdTaGFwZVxuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICB2aWV3VG9Nb2RlbFNoYXBlKCB2aWV3U2hhcGUgKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWxUb1ZpZXdUcmFuc2Zvcm0yRC5pbnZlcnNlU2hhcGUoIHZpZXdTaGFwZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgMkQgdmlldyBib3VuZHMgdG8gMkQgbW9kZWwgYm91bmRzIHNpbmNlIGJvdW5kcyBoYXZlIG5vIGRlcHRoLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gdmlld0JvdW5kc1xuICAgKiBAcmV0dXJucyB7Qm91bmRzMn1cbiAgICovXG4gIHZpZXdUb01vZGVsQm91bmRzKCB2aWV3Qm91bmRzICkge1xuICAgIHJldHVybiB0aGlzLm1vZGVsVG9WaWV3VHJhbnNmb3JtMkQuaW52ZXJzZUJvdW5kczIoIHZpZXdCb3VuZHMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMycsIFlhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMyApO1xuZXhwb3J0IGRlZmF1bHQgWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIlZlY3RvcjMiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJzY2VuZXJ5UGhldCIsInNjcmF0Y2hWZWN0b3IyIiwic2NyYXRjaFZlY3RvcjMiLCJZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwibW9kZWxQb2ludCIsImFzc2VydCIsInNldFBvbGFyIiwieiIsIk1hdGgiLCJzaW4iLCJwaXRjaCIsInlhdyIsImFkZFhZIiwieCIsInkiLCJtb2RlbFRvVmlld1RyYW5zZm9ybTJEIiwidHJhbnNmb3JtUG9zaXRpb24yIiwibW9kZWxUb1ZpZXdYWVoiLCJzZXRYWVoiLCJtb2RlbFRvVmlld0RlbHRhIiwiZGVsdGEiLCJvcmlnaW4iLCJtaW51cyIsIm1vZGVsVG9WaWV3RGVsdGFYWVoiLCJ4RGVsdGEiLCJ5RGVsdGEiLCJ6RGVsdGEiLCJtb2RlbFRvVmlld1NoYXBlIiwibW9kZWxTaGFwZSIsInRyYW5zZm9ybVNoYXBlIiwibW9kZWxUb1ZpZXdCb3VuZHMiLCJtb2RlbEJvdW5kcyIsInRyYW5zZm9ybUJvdW5kczIiLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwidmlld1BvaW50IiwiaW52ZXJzZVBvc2l0aW9uMiIsInRvVmVjdG9yMyIsInZpZXdUb01vZGVsWFkiLCJzZXRYWSIsInZpZXdUb01vZGVsRGVsdGEiLCJ2aWV3VG9Nb2RlbERlbHRhWFkiLCJ2aWV3VG9Nb2RlbFNoYXBlIiwidmlld1NoYXBlIiwiaW52ZXJzZVNoYXBlIiwidmlld1RvTW9kZWxCb3VuZHMiLCJ2aWV3Qm91bmRzIiwiaW52ZXJzZUJvdW5kczIiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJzY2FsZSIsIlBJIiwic2NhbGluZyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxXQUFXLGlDQUFpQztBQUNuRCxPQUFPQyx5QkFBeUIscURBQXFEO0FBQ3JGLE9BQU9DLGlCQUFpQixvQkFBb0I7QUFFNUMsbUNBQW1DO0FBQ25DLFdBQVc7QUFDWCxNQUFNQyxpQkFBaUIsSUFBSUwsUUFBUyxHQUFHO0FBQ3ZDLE1BQU1NLGlCQUFpQixJQUFJTCxRQUFTLEdBQUcsR0FBRztBQUUxQyxJQUFBLEFBQU1NLDhCQUFOLE1BQU1BO0lBdUJKLDhFQUE4RTtJQUM5RSwyQkFBMkI7SUFDM0IsOEVBQThFO0lBRTlFOzs7Ozs7R0FNQyxHQUNEQyxvQkFBcUJDLFVBQVUsRUFBRztRQUNoQ0MsVUFBVUEsT0FBUUQsc0JBQXNCUixTQUFTLENBQUMsNkNBQTZDLEVBQUVRLFlBQVk7UUFDN0dKLGVBQWVNLFFBQVEsQ0FBRUYsV0FBV0csQ0FBQyxHQUFHQyxLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxLQUFLLEdBQUksSUFBSSxDQUFDQyxHQUFHO1FBQ3hFWCxlQUFlWSxLQUFLLENBQUVSLFdBQVdTLENBQUMsRUFBRVQsV0FBV1UsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQ0Msc0JBQXNCLENBQUNDLGtCQUFrQixDQUFFaEI7SUFDekQ7SUFFQTs7Ozs7Ozs7R0FRQyxHQUNEaUIsZUFBZ0JKLENBQUMsRUFBRUMsQ0FBQyxFQUFFUCxDQUFDLEVBQUc7UUFDeEIsT0FBTyxJQUFJLENBQUNKLG1CQUFtQixDQUFFRixlQUFlaUIsTUFBTSxDQUFFTCxHQUFHQyxHQUFHUDtJQUNoRTtJQUVBOzs7Ozs7R0FNQyxHQUNEWSxpQkFBa0JDLEtBQUssRUFB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