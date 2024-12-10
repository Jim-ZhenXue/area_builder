// Copyright 2019-2022, University of Colorado Boulder
/**
 * Creates 2D projections of shapes that are related to the 3D boxes.
 * Shapes are in the view coordinate frame, everything else is in model coordinates.
 * Shapes for all faces corresponds to a box with its origin in the center of the top face.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import { Shape } from '../../../kite/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
import YawPitchModelViewTransform3 from './YawPitchModelViewTransform3.js';
let BoxShapeCreator = class BoxShapeCreator {
    /**
   * Top face is a parallelogram.
   * @public
   *
   *    p0 -------------- p1
   *   /                /
   *  /                /
   * p3 --------------p2
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */ createTopFace(x, y, z, width, height, depth) {
        // points
        const p0 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z + depth / 2);
        const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z + depth / 2);
        const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
        const p3 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z - depth / 2);
        // shape
        return this.createFace(p0, p1, p2, p3);
    }
    /**
   * Create the top face of the Box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */ createTopFaceBounds3(bounds) {
        return this.createTopFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
    }
    /**
   * Front face is a rectangle.
   * @public
   *
   * p0 --------------- p1
   * |                 |
   * |                 |
   * p3 --------------- p2
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */ createFrontFace(x, y, z, width, height, depth) {
        // points
        const p0 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y, z - depth / 2);
        const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
        const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z - depth / 2);
        const p3 = this.modelViewTransform.modelToViewXYZ(x - width / 2, y + height, z - depth / 2);
        // shape
        return this.createFace(p0, p1, p2, p3);
    }
    /**
   * Create the front face of the box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */ createFrontFaceBounds3(bounds) {
        return this.createFrontFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
    }
    /**
   * Right-side face is a parallelogram.
   * @public
   *
   *      p1
   *     / |
   *    /  |
   *   /   |
   *  /    p2
   * p0   /
   * |   /
   * |  /
   * | /
   * p3
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */ createRightSideFace(x, y, z, width, height, depth) {
        // points
        const p0 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z - depth / 2);
        const p1 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y, z + depth / 2);
        const p2 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z + depth / 2);
        const p3 = this.modelViewTransform.modelToViewXYZ(x + width / 2, y + height, z - depth / 2);
        // path
        return this.createFace(p0, p1, p2, p3);
    }
    /**
   * Create the right face of the box with a Bounds3 object.
   * @public
   *
   * @param {Bounds3} bounds
   * @returns {Shape}
   */ createRightSideFaceBounds3(bounds) {
        return this.createRightSideFace(bounds.minX, bounds.minY, bounds.minZ, bounds.width, bounds.height, bounds.depth);
    }
    /**
   * A complete box, relative to a specific origin.
   * @public
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} width
   * @param {number} height
   * @param {number} depth
   * @returns {Shape}
   */ createBoxShape(x, y, z, width, height, depth) {
        const topShape = this.createTopFace(x, y, z, width, height, depth);
        const frontShape = this.createFrontFace(x, y, z, width, height, depth);
        const sideShape = this.createRightSideFace(x, y, z, width, height, depth);
        return Shape.union([
            topShape,
            frontShape,
            sideShape
        ]);
    }
    /**
   * A face is defined by 4 points, specified in view coordinates.
   * @public
   *
   * @returns {Shape}
   */ createFace(p0, p1, p2, p3) {
        return new Shape().moveToPoint(p0).lineToPoint(p1).lineToPoint(p2).lineToPoint(p3).close();
    }
    /**
   * @param {YawPitchModelViewTransform3} transform
   */ constructor(transform){
        assert && assert(transform instanceof YawPitchModelViewTransform3);
        // @public {YawPitchModelViewTransform3}
        this.modelViewTransform = transform;
    }
};
sceneryPhet.register('BoxShapeCreator', BoxShapeCreator);
export default BoxShapeCreator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvQm94U2hhcGVDcmVhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENyZWF0ZXMgMkQgcHJvamVjdGlvbnMgb2Ygc2hhcGVzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gdGhlIDNEIGJveGVzLlxuICogU2hhcGVzIGFyZSBpbiB0aGUgdmlldyBjb29yZGluYXRlIGZyYW1lLCBldmVyeXRoaW5nIGVsc2UgaXMgaW4gbW9kZWwgY29vcmRpbmF0ZXMuXG4gKiBTaGFwZXMgZm9yIGFsbCBmYWNlcyBjb3JyZXNwb25kcyB0byBhIGJveCB3aXRoIGl0cyBvcmlnaW4gaW4gdGhlIGNlbnRlciBvZiB0aGUgdG9wIGZhY2UuXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMgZnJvbSAnLi9ZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTMuanMnO1xuXG5jbGFzcyBCb3hTaGFwZUNyZWF0b3Ige1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gdHJhbnNmb3JtXG4gICAqL1xuICBjb25zdHJ1Y3RvciggdHJhbnNmb3JtICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyYW5zZm9ybSBpbnN0YW5jZW9mIFlhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtMyApO1xuXG4gICAgLy8gQHB1YmxpYyB7WWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zfVxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvcCBmYWNlIGlzIGEgcGFyYWxsZWxvZ3JhbS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiAgICBwMCAtLS0tLS0tLS0tLS0tLSBwMVxuICAgKiAgIC8gICAgICAgICAgICAgICAgL1xuICAgKiAgLyAgICAgICAgICAgICAgICAvXG4gICAqIHAzIC0tLS0tLS0tLS0tLS0tcDJcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIGNyZWF0ZVRvcEZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICkge1xuICAgIC8vIHBvaW50c1xuICAgIGNvbnN0IHAwID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggLSAoIHdpZHRoIC8gMiApLCB5LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAxID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAyID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAzID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggLSAoIHdpZHRoIC8gMiApLCB5LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xuXG4gICAgLy8gc2hhcGVcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVGYWNlKCBwMCwgcDEsIHAyLCBwMyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgdG9wIGZhY2Ugb2YgdGhlIEJveCB3aXRoIGEgQm91bmRzMyBvYmplY3QuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtCb3VuZHMzfSBib3VuZHNcbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgY3JlYXRlVG9wRmFjZUJvdW5kczMoIGJvdW5kcyApIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUb3BGYWNlKCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy5taW5aLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGJvdW5kcy5kZXB0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZyb250IGZhY2UgaXMgYSByZWN0YW5nbGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogcDAgLS0tLS0tLS0tLS0tLS0tIHAxXG4gICAqIHwgICAgICAgICAgICAgICAgIHxcbiAgICogfCAgICAgICAgICAgICAgICAgfFxuICAgKiBwMyAtLS0tLS0tLS0tLS0tLS0gcDJcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIGNyZWF0ZUZyb250RmFjZSggeCwgeSwgeiwgd2lkdGgsIGhlaWdodCwgZGVwdGggKSB7XG4gICAgLy8gcG9pbnRzXG4gICAgY29uc3QgcDAgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCAtICggd2lkdGggLyAyICksIHksIHogLSAoIGRlcHRoIC8gMiApICk7XG4gICAgY29uc3QgcDEgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHksIHogLSAoIGRlcHRoIC8gMiApICk7XG4gICAgY29uc3QgcDIgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCArICggd2lkdGggLyAyICksIHkgKyBoZWlnaHQsIHogLSAoIGRlcHRoIC8gMiApICk7XG4gICAgY29uc3QgcDMgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1hZWiggeCAtICggd2lkdGggLyAyICksIHkgKyBoZWlnaHQsIHogLSAoIGRlcHRoIC8gMiApICk7XG4gICAgLy8gc2hhcGVcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVGYWNlKCBwMCwgcDEsIHAyLCBwMyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgZnJvbnQgZmFjZSBvZiB0aGUgYm94IHdpdGggYSBCb3VuZHMzIG9iamVjdC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0JvdW5kczN9IGJvdW5kc1xuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBjcmVhdGVGcm9udEZhY2VCb3VuZHMzKCBib3VuZHMgKSB7XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlRnJvbnRGYWNlKCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy5taW5aLCBib3VuZHMud2lkdGgsIGJvdW5kcy5oZWlnaHQsIGJvdW5kcy5kZXB0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJpZ2h0LXNpZGUgZmFjZSBpcyBhIHBhcmFsbGVsb2dyYW0uXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogICAgICBwMVxuICAgKiAgICAgLyB8XG4gICAqICAgIC8gIHxcbiAgICogICAvICAgfFxuICAgKiAgLyAgICBwMlxuICAgKiBwMCAgIC9cbiAgICogfCAgIC9cbiAgICogfCAgL1xuICAgKiB8IC9cbiAgICogcDNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlcHRoXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIGNyZWF0ZVJpZ2h0U2lkZUZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICkge1xuICAgIC8vIHBvaW50c1xuICAgIGNvbnN0IHAwID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAxID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAyID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5ICsgaGVpZ2h0LCB6ICsgKCBkZXB0aCAvIDIgKSApO1xuICAgIGNvbnN0IHAzID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWVooIHggKyAoIHdpZHRoIC8gMiApLCB5ICsgaGVpZ2h0LCB6IC0gKCBkZXB0aCAvIDIgKSApO1xuICAgIC8vIHBhdGhcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVGYWNlKCBwMCwgcDEsIHAyLCBwMyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgcmlnaHQgZmFjZSBvZiB0aGUgYm94IHdpdGggYSBCb3VuZHMzIG9iamVjdC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0JvdW5kczN9IGJvdW5kc1xuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBjcmVhdGVSaWdodFNpZGVGYWNlQm91bmRzMyggYm91bmRzICkge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZVJpZ2h0U2lkZUZhY2UoIGJvdW5kcy5taW5YLCBib3VuZHMubWluWSwgYm91bmRzLm1pblosIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCwgYm91bmRzLmRlcHRoICk7XG4gIH1cblxuICAvKipcbiAgICogQSBjb21wbGV0ZSBib3gsIHJlbGF0aXZlIHRvIGEgc3BlY2lmaWMgb3JpZ2luLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZXB0aFxuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBjcmVhdGVCb3hTaGFwZSggeCwgeSwgeiwgd2lkdGgsIGhlaWdodCwgZGVwdGggKSB7XG4gICAgY29uc3QgdG9wU2hhcGUgPSB0aGlzLmNyZWF0ZVRvcEZhY2UoIHgsIHksIHosIHdpZHRoLCBoZWlnaHQsIGRlcHRoICk7XG4gICAgY29uc3QgZnJvbnRTaGFwZSA9IHRoaXMuY3JlYXRlRnJvbnRGYWNlKCB4LCB5LCB6LCB3aWR0aCwgaGVpZ2h0LCBkZXB0aCApO1xuICAgIGNvbnN0IHNpZGVTaGFwZSA9IHRoaXMuY3JlYXRlUmlnaHRTaWRlRmFjZSggeCwgeSwgeiwgd2lkdGgsIGhlaWdodCwgZGVwdGggKTtcbiAgICByZXR1cm4gU2hhcGUudW5pb24oIFsgdG9wU2hhcGUsIGZyb250U2hhcGUsIHNpZGVTaGFwZSBdICk7XG4gIH1cblxuICAvKipcbiAgICogQSBmYWNlIGlzIGRlZmluZWQgYnkgNCBwb2ludHMsIHNwZWNpZmllZCBpbiB2aWV3IGNvb3JkaW5hdGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIGNyZWF0ZUZhY2UoIHAwLCBwMSwgcDIsIHAzICkge1xuICAgIHJldHVybiBuZXcgU2hhcGUoKVxuICAgICAgLm1vdmVUb1BvaW50KCBwMCApXG4gICAgICAubGluZVRvUG9pbnQoIHAxIClcbiAgICAgIC5saW5lVG9Qb2ludCggcDIgKVxuICAgICAgLmxpbmVUb1BvaW50KCBwMyApXG4gICAgICAuY2xvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0JveFNoYXBlQ3JlYXRvcicsIEJveFNoYXBlQ3JlYXRvciApO1xuZXhwb3J0IGRlZmF1bHQgQm94U2hhcGVDcmVhdG9yOyJdLCJuYW1lcyI6WyJTaGFwZSIsInNjZW5lcnlQaGV0IiwiWWF3UGl0Y2hNb2RlbFZpZXdUcmFuc2Zvcm0zIiwiQm94U2hhcGVDcmVhdG9yIiwiY3JlYXRlVG9wRmFjZSIsIngiLCJ5IiwieiIsIndpZHRoIiwiaGVpZ2h0IiwiZGVwdGgiLCJwMCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm1vZGVsVG9WaWV3WFlaIiwicDEiLCJwMiIsInAzIiwiY3JlYXRlRmFjZSIsImNyZWF0ZVRvcEZhY2VCb3VuZHMzIiwiYm91bmRzIiwibWluWCIsIm1pblkiLCJtaW5aIiwiY3JlYXRlRnJvbnRGYWNlIiwiY3JlYXRlRnJvbnRGYWNlQm91bmRzMyIsImNyZWF0ZVJpZ2h0U2lkZUZhY2UiLCJjcmVhdGVSaWdodFNpZGVGYWNlQm91bmRzMyIsImNyZWF0ZUJveFNoYXBlIiwidG9wU2hhcGUiLCJmcm9udFNoYXBlIiwic2lkZVNoYXBlIiwidW5pb24iLCJtb3ZlVG9Qb2ludCIsImxpbmVUb1BvaW50IiwiY2xvc2UiLCJjb25zdHJ1Y3RvciIsInRyYW5zZm9ybSIsImFzc2VydCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FFRCxTQUFTQSxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFDNUMsT0FBT0MsaUNBQWlDLG1DQUFtQztBQUUzRSxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BO0lBWUo7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkMsR0FDREMsY0FBZUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRztRQUM3QyxTQUFTO1FBQ1QsTUFBTUMsS0FBSyxJQUFJLENBQUNDLGtCQUFrQixDQUFDQyxjQUFjLENBQUVSLElBQU1HLFFBQVEsR0FBS0YsR0FBR0MsSUFBTUcsUUFBUTtRQUN2RixNQUFNSSxLQUFLLElBQUksQ0FBQ0Ysa0JBQWtCLENBQUNDLGNBQWMsQ0FBRVIsSUFBTUcsUUFBUSxHQUFLRixHQUFHQyxJQUFNRyxRQUFRO1FBQ3ZGLE1BQU1LLEtBQUssSUFBSSxDQUFDSCxrQkFBa0IsQ0FBQ0MsY0FBYyxDQUFFUixJQUFNRyxRQUFRLEdBQUtGLEdBQUdDLElBQU1HLFFBQVE7UUFDdkYsTUFBTU0sS0FBSyxJQUFJLENBQUNKLGtCQUFrQixDQUFDQyxjQUFjLENBQUVSLElBQU1HLFFBQVEsR0FBS0YsR0FBR0MsSUFBTUcsUUFBUTtRQUV2RixRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUNPLFVBQVUsQ0FBRU4sSUFBSUcsSUFBSUMsSUFBSUM7SUFDdEM7SUFFQTs7Ozs7O0dBTUMsR0FDREUscUJBQXNCQyxNQUFNLEVBQUc7UUFDN0IsT0FBTyxJQUFJLENBQUNmLGFBQWEsQ0FBRWUsT0FBT0MsSUFBSSxFQUFFRCxPQUFPRSxJQUFJLEVBQUVGLE9BQU9HLElBQUksRUFBRUgsT0FBT1gsS0FBSyxFQUFFVyxPQUFPVixNQUFNLEVBQUVVLE9BQU9ULEtBQUs7SUFDN0c7SUFFQTs7Ozs7Ozs7Ozs7Ozs7OztHQWdCQyxHQUNEYSxnQkFBaUJsQixDQUFDLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFHO1FBQy9DLFNBQVM7UUFDVCxNQUFNQyxLQUFLLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLGNBQWMsQ0FBRVIsSUFBTUcsUUFBUSxHQUFLRixHQUFHQyxJQUFNRyxRQUFRO1FBQ3ZGLE1BQU1JLEtBQUssSUFBSSxDQUFDRixrQkFBa0IsQ0FBQ0MsY0FBYyxDQUFFUixJQUFNRyxRQUFRLEdBQUtGLEdBQUdDLElBQU1HLFFBQVE7UUFDdkYsTUFBTUssS0FBSyxJQUFJLENBQUNILGtCQUFrQixDQUFDQyxjQUFjLENBQUVSLElBQU1HLFFBQVEsR0FBS0YsSUFBSUcsUUFBUUYsSUFBTUcsUUFBUTtRQUNoRyxNQUFNTSxLQUFLLElBQUksQ0FBQ0osa0JBQWtCLENBQUNDLGNBQWMsQ0FBRVIsSUFBTUcsUUFBUSxHQUFLRixJQUFJRyxRQUFRRixJQUFNRyxRQUFRO1FBQ2hHLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQ08sVUFBVSxDQUFFTixJQUFJRyxJQUFJQyxJQUFJQztJQUN0QztJQUVBOzs7Ozs7R0FNQyxHQUNEUSx1QkFBd0JMLE1BQU0sRUFBRztRQUMvQixPQUFPLElBQUksQ0FBQ0ksZUFBZSxDQUFFSixPQUFPQyxJQUFJLEVBQUVELE9BQU9FLElBQUksRUFBRUYsT0FBT0csSUFBSSxFQUFFSCxPQUFPWCxLQUFLLEVBQUVXLE9BQU9WLE1BQU0sRUFBRVUsT0FBT1QsS0FBSztJQUMvRztJQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JDLEdBQ0RlLG9CQUFxQnBCLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxLQUFLLEVBQUc7UUFDbkQsU0FBUztRQUNULE1BQU1DLEtBQUssSUFBSSxDQUFDQyxrQkFBa0IsQ0FBQ0MsY0FBYyxDQUFFUixJQUFNRyxRQUFRLEdBQUtGLEdBQUdDLElBQU1HLFFBQVE7UUFDdkYsTUFBTUksS0FBSyxJQUFJLENBQUNGLGtCQUFrQixDQUFDQyxjQUFjLENBQUVSLElBQU1HLFFBQVEsR0FBS0YsR0FBR0MsSUFBTUcsUUFBUTtRQUN2RixNQUFNSyxLQUFLLElBQUksQ0FBQ0gsa0JBQWtCLENBQUNDLGNBQWMsQ0FBRVIsSUFBTUcsUUFBUSxHQUFLRixJQUFJRyxRQUFRRixJQUFNRyxRQUFRO1FBQ2hHLE1BQU1NLEtBQUssSUFBSSxDQUFDSixrQkFBa0IsQ0FBQ0MsY0FBYyxDQUFFUixJQUFNRyxRQUFRLEdBQUtGLElBQUlHLFFBQVFGLElBQU1HLFFBQVE7UUFDaEcsT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDTyxVQUFVLENBQUVOLElBQUlHLElBQUlDLElBQUlDO0lBQ3RDO0lBRUE7Ozs7OztHQU1DLEdBQ0RVLDJCQUE0QlAsTUFBTSxFQUFHO1FBQ25DLE9BQU8sSUFBSSxDQUFDTSxtQkFBbUIsQ0FBRU4sT0FBT0MsSUFBSSxFQUFFRCxPQUFPRSxJQUFJLEVBQUVGLE9BQU9HLElBQUksRUFBRUgsT0FBT1gsS0FBSyxFQUFFVyxPQUFPVixNQUFNLEVBQUVVLE9BQU9ULEtBQUs7SUFDbkg7SUFFQTs7Ozs7Ozs7Ozs7R0FXQyxHQUNEaUIsZUFBZ0J0QixDQUFDLEVBQUVDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFHO1FBQzlDLE1BQU1rQixXQUFXLElBQUksQ0FBQ3hCLGFBQWEsQ0FBRUMsR0FBR0MsR0FBR0MsR0FBR0MsT0FBT0MsUUFBUUM7UUFDN0QsTUFBTW1CLGFBQWEsSUFBSSxDQUFDTixlQUFlLENBQUVsQixHQUFHQyxHQUFHQyxHQUFHQyxPQUFPQyxRQUFRQztRQUNqRSxNQUFNb0IsWUFBWSxJQUFJLENBQUNMLG1CQUFtQixDQUFFcEIsR0FBR0MsR0FBR0MsR0FBR0MsT0FBT0MsUUFBUUM7UUFDcEUsT0FBT1YsTUFBTStCLEtBQUssQ0FBRTtZQUFFSDtZQUFVQztZQUFZQztTQUFXO0lBQ3pEO0lBRUE7Ozs7O0dBS0MsR0FDRGIsV0FBWU4sRUFBRSxFQUFFRyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFHO1FBQzNCLE9BQU8sSUFBSWhCLFFBQ1JnQyxXQUFXLENBQUVyQixJQUNic0IsV0FBVyxDQUFFbkIsSUFDYm1CLFdBQVcsQ0FBRWxCLElBQ2JrQixXQUFXLENBQUVqQixJQUNia0IsS0FBSztJQUNWO0lBbktBOztHQUVDLEdBQ0RDLFlBQWFDLFNBQVMsQ0FBRztRQUN2QkMsVUFBVUEsT0FBUUQscUJBQXFCbEM7UUFFdkMsd0NBQXdDO1FBQ3hDLElBQUksQ0FBQ1Usa0JBQWtCLEdBQUd3QjtJQUM1QjtBQTRKRjtBQUVBbkMsWUFBWXFDLFFBQVEsQ0FBRSxtQkFBbUJuQztBQUN6QyxlQUFlQSxnQkFBZ0IifQ==