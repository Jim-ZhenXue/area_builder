// Copyright 2019-2022, University of Colorado Boulder
/**
 * Pseudo-3D representation of a box, using parallelograms.  Only the three visible faces are shown: top, front,
 * right side.  The top and right-side faces are foreshortened to give the illusion of distance between front and back
 * planes. Origin is at the center of the top face.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */ import merge from '../../../phet-core/js/merge.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
import BoxShapeCreator from './BoxShapeCreator.js';
// constants
const PATH_OPTIONS = {
    lineWidth: 1,
    stroke: 'black'
};
let BoxNode = class BoxNode extends Node {
    /**
   * @private - update the shapes after the size has been set
   */ updateShapes() {
        this.topNode.shape = this.shapeCreator.createTopFaceBounds3(this.size);
        this.frontNode.shape = this.shapeCreator.createFrontFaceBounds3(this.size);
        this.rightSideNode.shape = this.shapeCreator.createRightSideFaceBounds3(this.size);
    }
    /**
   * Set the size of this box.
   * @param {Bounds3} size
   * @public
   */ setBoxSize(size) {
        if (!size.equals(this.size)) {
            this.size = size;
            this.updateShapes();
        }
    }
    /**
   * @param {YawPitchModelViewTransform3} transform
   * @param {Color} color
   * @param {Bounds3} size
   * @param {Object} [options]
   */ constructor(transform, color, size, options){
        super();
        // @private {BoxShapeCreator}
        this.shapeCreator = new BoxShapeCreator(transform);
        // @public (read-only) {Path}
        this.topNode = new Path(null, merge({
            fill: color
        }, PATH_OPTIONS));
        // @public (read-only) {Path}
        this.frontNode = new Path(null, merge({
            fill: color.darkerColor()
        }, PATH_OPTIONS));
        // @private {Path}
        this.rightSideNode = new Path(null, merge({
            fill: color.darkerColor().darkerColor()
        }, PATH_OPTIONS));
        // @private {Bounds3}
        this.size = size;
        this.updateShapes();
        // rendering order
        this.addChild(this.topNode);
        this.addChild(this.frontNode);
        this.addChild(this.rightSideNode);
        // mark pickable so it can be hit tested for the voltmeter probe
        options = merge({
            pickable: true
        }, options);
        this.mutate(options);
    }
};
sceneryPhet.register('BoxNode', BoxNode);
export default BoxNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvQm94Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQc2V1ZG8tM0QgcmVwcmVzZW50YXRpb24gb2YgYSBib3gsIHVzaW5nIHBhcmFsbGVsb2dyYW1zLiAgT25seSB0aGUgdGhyZWUgdmlzaWJsZSBmYWNlcyBhcmUgc2hvd246IHRvcCwgZnJvbnQsXG4gKiByaWdodCBzaWRlLiAgVGhlIHRvcCBhbmQgcmlnaHQtc2lkZSBmYWNlcyBhcmUgZm9yZXNob3J0ZW5lZCB0byBnaXZlIHRoZSBpbGx1c2lvbiBvZiBkaXN0YW5jZSBiZXR3ZWVuIGZyb250IGFuZCBiYWNrXG4gKiBwbGFuZXMuIE9yaWdpbiBpcyBhdCB0aGUgY2VudGVyIG9mIHRoZSB0b3AgZmFjZS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCB7IE5vZGUsIFBhdGggfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBCb3hTaGFwZUNyZWF0b3IgZnJvbSAnLi9Cb3hTaGFwZUNyZWF0b3IuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFBBVEhfT1BUSU9OUyA9IHtcbiAgbGluZVdpZHRoOiAxLFxuICBzdHJva2U6ICdibGFjaydcbn07XG5cbmNsYXNzIEJveE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTN9IHRyYW5zZm9ybVxuICAgKiBAcGFyYW0ge0NvbG9yfSBjb2xvclxuICAgKiBAcGFyYW0ge0JvdW5kczN9IHNpemVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHRyYW5zZm9ybSwgY29sb3IsIHNpemUsIG9wdGlvbnMgKSB7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gQHByaXZhdGUge0JveFNoYXBlQ3JlYXRvcn1cbiAgICB0aGlzLnNoYXBlQ3JlYXRvciA9IG5ldyBCb3hTaGFwZUNyZWF0b3IoIHRyYW5zZm9ybSApO1xuXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UGF0aH1cbiAgICB0aGlzLnRvcE5vZGUgPSBuZXcgUGF0aCggbnVsbCwgbWVyZ2UoIHsgZmlsbDogY29sb3IgfSwgUEFUSF9PUFRJT05TICkgKTtcblxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1BhdGh9XG4gICAgdGhpcy5mcm9udE5vZGUgPSBuZXcgUGF0aCggbnVsbCwgbWVyZ2UoIHsgZmlsbDogY29sb3IuZGFya2VyQ29sb3IoKSB9LCBQQVRIX09QVElPTlMgKSApO1xuXG4gICAgLy8gQHByaXZhdGUge1BhdGh9XG4gICAgdGhpcy5yaWdodFNpZGVOb2RlID0gbmV3IFBhdGgoIG51bGwsIG1lcmdlKCB7IGZpbGw6IGNvbG9yLmRhcmtlckNvbG9yKCkuZGFya2VyQ29sb3IoKSB9LCBQQVRIX09QVElPTlMgKSApO1xuXG4gICAgLy8gQHByaXZhdGUge0JvdW5kczN9XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICB0aGlzLnVwZGF0ZVNoYXBlcygpO1xuXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50b3BOb2RlICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5mcm9udE5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJpZ2h0U2lkZU5vZGUgKTtcblxuICAgIC8vIG1hcmsgcGlja2FibGUgc28gaXQgY2FuIGJlIGhpdCB0ZXN0ZWQgZm9yIHRoZSB2b2x0bWV0ZXIgcHJvYmVcbiAgICBvcHRpb25zID0gbWVyZ2UoIHsgcGlja2FibGU6IHRydWUgfSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZSAtIHVwZGF0ZSB0aGUgc2hhcGVzIGFmdGVyIHRoZSBzaXplIGhhcyBiZWVuIHNldFxuICAgKi9cbiAgdXBkYXRlU2hhcGVzKCkge1xuICAgIHRoaXMudG9wTm9kZS5zaGFwZSA9IHRoaXMuc2hhcGVDcmVhdG9yLmNyZWF0ZVRvcEZhY2VCb3VuZHMzKCB0aGlzLnNpemUgKTtcbiAgICB0aGlzLmZyb250Tm9kZS5zaGFwZSA9IHRoaXMuc2hhcGVDcmVhdG9yLmNyZWF0ZUZyb250RmFjZUJvdW5kczMoIHRoaXMuc2l6ZSApO1xuICAgIHRoaXMucmlnaHRTaWRlTm9kZS5zaGFwZSA9IHRoaXMuc2hhcGVDcmVhdG9yLmNyZWF0ZVJpZ2h0U2lkZUZhY2VCb3VuZHMzKCB0aGlzLnNpemUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNpemUgb2YgdGhpcyBib3guXG4gICAqIEBwYXJhbSB7Qm91bmRzM30gc2l6ZVxuICAgKiBAcHVibGljXG4gICAqL1xuICBzZXRCb3hTaXplKCBzaXplICkge1xuICAgIGlmICggIXNpemUuZXF1YWxzKCB0aGlzLnNpemUgKSApIHtcbiAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICB0aGlzLnVwZGF0ZVNoYXBlcygpO1xuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0JveE5vZGUnLCBCb3hOb2RlICk7XG5leHBvcnQgZGVmYXVsdCBCb3hOb2RlOyJdLCJuYW1lcyI6WyJtZXJnZSIsIk5vZGUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJCb3hTaGFwZUNyZWF0b3IiLCJQQVRIX09QVElPTlMiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJCb3hOb2RlIiwidXBkYXRlU2hhcGVzIiwidG9wTm9kZSIsInNoYXBlIiwic2hhcGVDcmVhdG9yIiwiY3JlYXRlVG9wRmFjZUJvdW5kczMiLCJzaXplIiwiZnJvbnROb2RlIiwiY3JlYXRlRnJvbnRGYWNlQm91bmRzMyIsInJpZ2h0U2lkZU5vZGUiLCJjcmVhdGVSaWdodFNpZGVGYWNlQm91bmRzMyIsInNldEJveFNpemUiLCJlcXVhbHMiLCJjb25zdHJ1Y3RvciIsInRyYW5zZm9ybSIsImNvbG9yIiwib3B0aW9ucyIsImZpbGwiLCJkYXJrZXJDb2xvciIsImFkZENoaWxkIiwicGlja2FibGUiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsT0FBT0EsV0FBVyxpQ0FBaUM7QUFDbkQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsaUNBQWlDO0FBQzVELE9BQU9DLGlCQUFpQixvQkFBb0I7QUFDNUMsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUVuRCxZQUFZO0FBQ1osTUFBTUMsZUFBZTtJQUNuQkMsV0FBVztJQUNYQyxRQUFRO0FBQ1Y7QUFFQSxJQUFBLEFBQU1DLFVBQU4sTUFBTUEsZ0JBQWdCUDtJQXVDcEI7O0dBRUMsR0FDRFEsZUFBZTtRQUNiLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUNDLG9CQUFvQixDQUFFLElBQUksQ0FBQ0MsSUFBSTtRQUN0RSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0osS0FBSyxHQUFHLElBQUksQ0FBQ0MsWUFBWSxDQUFDSSxzQkFBc0IsQ0FBRSxJQUFJLENBQUNGLElBQUk7UUFDMUUsSUFBSSxDQUFDRyxhQUFhLENBQUNOLEtBQUssR0FBRyxJQUFJLENBQUNDLFlBQVksQ0FBQ00sMEJBQTBCLENBQUUsSUFBSSxDQUFDSixJQUFJO0lBQ3BGO0lBRUE7Ozs7R0FJQyxHQUNESyxXQUFZTCxJQUFJLEVBQUc7UUFDakIsSUFBSyxDQUFDQSxLQUFLTSxNQUFNLENBQUUsSUFBSSxDQUFDTixJQUFJLEdBQUs7WUFDL0IsSUFBSSxDQUFDQSxJQUFJLEdBQUdBO1lBQ1osSUFBSSxDQUFDTCxZQUFZO1FBQ25CO0lBQ0Y7SUF4REE7Ozs7O0dBS0MsR0FDRFksWUFBYUMsU0FBUyxFQUFFQyxLQUFLLEVBQUVULElBQUksRUFBRVUsT0FBTyxDQUFHO1FBRTdDLEtBQUs7UUFFTCw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDWixZQUFZLEdBQUcsSUFBSVIsZ0JBQWlCa0I7UUFFekMsNkJBQTZCO1FBQzdCLElBQUksQ0FBQ1osT0FBTyxHQUFHLElBQUlSLEtBQU0sTUFBTUYsTUFBTztZQUFFeUIsTUFBTUY7UUFBTSxHQUFHbEI7UUFFdkQsNkJBQTZCO1FBQzdCLElBQUksQ0FBQ1UsU0FBUyxHQUFHLElBQUliLEtBQU0sTUFBTUYsTUFBTztZQUFFeUIsTUFBTUYsTUFBTUcsV0FBVztRQUFHLEdBQUdyQjtRQUV2RSxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDWSxhQUFhLEdBQUcsSUFBSWYsS0FBTSxNQUFNRixNQUFPO1lBQUV5QixNQUFNRixNQUFNRyxXQUFXLEdBQUdBLFdBQVc7UUFBRyxHQUFHckI7UUFFekYscUJBQXFCO1FBQ3JCLElBQUksQ0FBQ1MsSUFBSSxHQUFHQTtRQUNaLElBQUksQ0FBQ0wsWUFBWTtRQUVqQixrQkFBa0I7UUFDbEIsSUFBSSxDQUFDa0IsUUFBUSxDQUFFLElBQUksQ0FBQ2pCLE9BQU87UUFDM0IsSUFBSSxDQUFDaUIsUUFBUSxDQUFFLElBQUksQ0FBQ1osU0FBUztRQUM3QixJQUFJLENBQUNZLFFBQVEsQ0FBRSxJQUFJLENBQUNWLGFBQWE7UUFFakMsZ0VBQWdFO1FBQ2hFTyxVQUFVeEIsTUFBTztZQUFFNEIsVUFBVTtRQUFLLEdBQUdKO1FBRXJDLElBQUksQ0FBQ0ssTUFBTSxDQUFFTDtJQUNmO0FBc0JGO0FBRUFyQixZQUFZMkIsUUFBUSxDQUFFLFdBQVd0QjtBQUNqQyxlQUFlQSxRQUFRIn0=