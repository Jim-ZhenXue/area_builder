// Copyright 2014-2022, University of Colorado Boulder
/**
 * Model element that describes a shape in terms of 'perimeter points', both exterior and interior.  The interior
 * perimeters allow holes to be defined.  The shape is defined by straight lines drawn from each point to the next.
 *
 * @author John Blanco
 */ import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import areaBuilder from '../../areaBuilder.js';
// constants
const FLOATING_POINT_ERR_TOLERANCE = 1e-6;
let PerimeterShape = class PerimeterShape {
    /**
   * Returns a linearly translated version of this perimeter shape.
   * @param {number} x
   * @param {number} y
   * @returns {PerimeterShape}
   * @public
   */ translated(x, y) {
        const exteriorPerimeters = [];
        const interiorPerimeters = [];
        this.exteriorPerimeters.forEach((exteriorPerimeter, index)=>{
            exteriorPerimeters.push([]);
            exteriorPerimeter.forEach((point)=>{
                exteriorPerimeters[index].push(point.plusXY(x, y));
            });
        });
        this.interiorPerimeters.forEach((interiorPerimeter, index)=>{
            interiorPerimeters.push([]);
            interiorPerimeter.forEach((point)=>{
                interiorPerimeters[index].push(point.plusXY(x, y));
            });
        });
        return new PerimeterShape(exteriorPerimeters, interiorPerimeters, this.unitLength, {
            fillColor: this.fillColor,
            edgeColor: this.edgeColor
        });
    }
    /**
   * @returns {number}
   * @public
   */ getWidth() {
        return this.kiteShape.bounds.width;
    }
    /**
   * @returns {number}
   * @public
   */ getHeight() {
        return this.kiteShape.bounds.height;
    }
    /**
   * @param {Array.<Array.<Vector2>>} exteriorPerimeters An array of perimeters, each of which is a sequential array of
   * points.
   * @param {Array.<Array.<Vector2>>} interiorPerimeters An array of perimeters, each of which is a sequential array of
   * points. Each interior perimeter must be fully contained within an exterior perimeter.
   * @param {number} unitLength The unit length (i.e. the width or height of a unit square) of the unit sizes that
   * this shape should be constructed from.
   * @param {Object} [options]
   */ constructor(exteriorPerimeters, interiorPerimeters, unitLength, options){
        let i;
        options = merge({
            fillColor: null,
            edgeColor: null
        }, options); // Make sure options is defined.
        // @public, read only
        this.fillColor = options.fillColor;
        // @public, read only
        this.edgeColor = options.edgeColor;
        // @public, read only
        this.exteriorPerimeters = exteriorPerimeters;
        // @public, read only
        this.interiorPerimeters = interiorPerimeters;
        // @private
        this.unitLength = unitLength;
        // @private - a shape created from the points, useful in various situations.
        this.kiteShape = new Shape();
        exteriorPerimeters.forEach((exteriorPerimeter)=>{
            this.kiteShape.moveToPoint(exteriorPerimeter[0]);
            for(i = 1; i < exteriorPerimeter.length; i++){
                this.kiteShape.lineToPoint(exteriorPerimeter[i]);
            }
            this.kiteShape.lineToPoint(exteriorPerimeter[0]);
            this.kiteShape.close();
        });
        // Only add interior spaces if there is a legitimate external perimeter.
        if (!this.kiteShape.bounds.isEmpty()) {
            interiorPerimeters.forEach((interiorPerimeter)=>{
                this.kiteShape.moveToPoint(interiorPerimeter[0]);
                for(i = 1; i < interiorPerimeter.length; i++){
                    this.kiteShape.lineToPoint(interiorPerimeter[i]);
                }
                this.kiteShape.lineToPoint(interiorPerimeter[0]);
                this.kiteShape.close();
            });
        }
        // @public, read only
        this.unitArea = calculateUnitArea(this.kiteShape, unitLength);
    }
};
// Utility function to compute the unit area of a perimeter shape.
function calculateUnitArea(shape, unitLength) {
    if (!shape.bounds.isFinite()) {
        return 0;
    }
    assert && assert(shape.bounds.width % unitLength < FLOATING_POINT_ERR_TOLERANCE && shape.bounds.height % unitLength < FLOATING_POINT_ERR_TOLERANCE, 'Error: This method will only work with shapes that have bounds of unit width and height.');
    // Compute the unit area by testing whether or not points on a sub-grid are contained in the shape.
    let unitArea = 0;
    const testPoint = new Vector2(0, 0);
    for(let row = 0; row * unitLength < shape.bounds.height; row++){
        for(let column = 0; column * unitLength < shape.bounds.width; column++){
            // Scan four points in the unit square.  This allows support for triangular 1/2 unit square shapes.  This is
            // in-lined rather than looped for the sake of efficiency, since this approach avoids vector allocations.
            testPoint.setXY(shape.bounds.minX + (column + 0.25) * unitLength, shape.bounds.minY + (row + 0.5) * unitLength);
            if (shape.containsPoint(testPoint)) {
                unitArea += 0.25;
            }
            testPoint.setXY(shape.bounds.minX + (column + 0.5) * unitLength, shape.bounds.minY + (row + 0.25) * unitLength);
            if (shape.containsPoint(testPoint)) {
                unitArea += 0.25;
            }
            testPoint.setXY(shape.bounds.minX + (column + 0.5) * unitLength, shape.bounds.minY + (row + 0.75) * unitLength);
            if (shape.containsPoint(testPoint)) {
                unitArea += 0.25;
            }
            testPoint.setXY(shape.bounds.minX + (column + 0.75) * unitLength, shape.bounds.minY + (row + 0.5) * unitLength);
            if (shape.containsPoint(testPoint)) {
                unitArea += 0.25;
            }
        }
    }
    return unitArea;
}
areaBuilder.register('PerimeterShape', PerimeterShape);
export default PerimeterShape;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vbW9kZWwvUGVyaW1ldGVyU2hhcGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTW9kZWwgZWxlbWVudCB0aGF0IGRlc2NyaWJlcyBhIHNoYXBlIGluIHRlcm1zIG9mICdwZXJpbWV0ZXIgcG9pbnRzJywgYm90aCBleHRlcmlvciBhbmQgaW50ZXJpb3IuICBUaGUgaW50ZXJpb3JcbiAqIHBlcmltZXRlcnMgYWxsb3cgaG9sZXMgdG8gYmUgZGVmaW5lZC4gIFRoZSBzaGFwZSBpcyBkZWZpbmVkIGJ5IHN0cmFpZ2h0IGxpbmVzIGRyYXduIGZyb20gZWFjaCBwb2ludCB0byB0aGUgbmV4dC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEZMT0FUSU5HX1BPSU5UX0VSUl9UT0xFUkFOQ0UgPSAxZS02O1xuXG5jbGFzcyBQZXJpbWV0ZXJTaGFwZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxWZWN0b3IyPj59IGV4dGVyaW9yUGVyaW1ldGVycyBBbiBhcnJheSBvZiBwZXJpbWV0ZXJzLCBlYWNoIG9mIHdoaWNoIGlzIGEgc2VxdWVudGlhbCBhcnJheSBvZlxuICAgKiBwb2ludHMuXG4gICAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxWZWN0b3IyPj59IGludGVyaW9yUGVyaW1ldGVycyBBbiBhcnJheSBvZiBwZXJpbWV0ZXJzLCBlYWNoIG9mIHdoaWNoIGlzIGEgc2VxdWVudGlhbCBhcnJheSBvZlxuICAgKiBwb2ludHMuIEVhY2ggaW50ZXJpb3IgcGVyaW1ldGVyIG11c3QgYmUgZnVsbHkgY29udGFpbmVkIHdpdGhpbiBhbiBleHRlcmlvciBwZXJpbWV0ZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB1bml0TGVuZ3RoIFRoZSB1bml0IGxlbmd0aCAoaS5lLiB0aGUgd2lkdGggb3IgaGVpZ2h0IG9mIGEgdW5pdCBzcXVhcmUpIG9mIHRoZSB1bml0IHNpemVzIHRoYXRcbiAgICogdGhpcyBzaGFwZSBzaG91bGQgYmUgY29uc3RydWN0ZWQgZnJvbS5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGV4dGVyaW9yUGVyaW1ldGVycywgaW50ZXJpb3JQZXJpbWV0ZXJzLCB1bml0TGVuZ3RoLCBvcHRpb25zICkge1xuICAgIGxldCBpO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBmaWxsQ29sb3I6IG51bGwsXG4gICAgICBlZGdlQ29sb3I6IG51bGxcbiAgICB9LCBvcHRpb25zICk7IC8vIE1ha2Ugc3VyZSBvcHRpb25zIGlzIGRlZmluZWQuXG5cbiAgICAvLyBAcHVibGljLCByZWFkIG9ubHlcbiAgICB0aGlzLmZpbGxDb2xvciA9IG9wdGlvbnMuZmlsbENvbG9yO1xuXG4gICAgLy8gQHB1YmxpYywgcmVhZCBvbmx5XG4gICAgdGhpcy5lZGdlQ29sb3IgPSBvcHRpb25zLmVkZ2VDb2xvcjtcblxuICAgIC8vIEBwdWJsaWMsIHJlYWQgb25seVxuICAgIHRoaXMuZXh0ZXJpb3JQZXJpbWV0ZXJzID0gZXh0ZXJpb3JQZXJpbWV0ZXJzO1xuXG4gICAgLy8gQHB1YmxpYywgcmVhZCBvbmx5XG4gICAgdGhpcy5pbnRlcmlvclBlcmltZXRlcnMgPSBpbnRlcmlvclBlcmltZXRlcnM7XG5cbiAgICAvLyBAcHJpdmF0ZVxuICAgIHRoaXMudW5pdExlbmd0aCA9IHVuaXRMZW5ndGg7XG5cbiAgICAvLyBAcHJpdmF0ZSAtIGEgc2hhcGUgY3JlYXRlZCBmcm9tIHRoZSBwb2ludHMsIHVzZWZ1bCBpbiB2YXJpb3VzIHNpdHVhdGlvbnMuXG4gICAgdGhpcy5raXRlU2hhcGUgPSBuZXcgU2hhcGUoKTtcbiAgICBleHRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggZXh0ZXJpb3JQZXJpbWV0ZXIgPT4ge1xuICAgICAgdGhpcy5raXRlU2hhcGUubW92ZVRvUG9pbnQoIGV4dGVyaW9yUGVyaW1ldGVyWyAwIF0gKTtcbiAgICAgIGZvciAoIGkgPSAxOyBpIDwgZXh0ZXJpb3JQZXJpbWV0ZXIubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHRoaXMua2l0ZVNoYXBlLmxpbmVUb1BvaW50KCBleHRlcmlvclBlcmltZXRlclsgaSBdICk7XG4gICAgICB9XG4gICAgICB0aGlzLmtpdGVTaGFwZS5saW5lVG9Qb2ludCggZXh0ZXJpb3JQZXJpbWV0ZXJbIDAgXSApO1xuICAgICAgdGhpcy5raXRlU2hhcGUuY2xvc2UoKTtcbiAgICB9ICk7XG5cbiAgICAvLyBPbmx5IGFkZCBpbnRlcmlvciBzcGFjZXMgaWYgdGhlcmUgaXMgYSBsZWdpdGltYXRlIGV4dGVybmFsIHBlcmltZXRlci5cbiAgICBpZiAoICF0aGlzLmtpdGVTaGFwZS5ib3VuZHMuaXNFbXB0eSgpICkge1xuICAgICAgaW50ZXJpb3JQZXJpbWV0ZXJzLmZvckVhY2goIGludGVyaW9yUGVyaW1ldGVyID0+IHtcbiAgICAgICAgdGhpcy5raXRlU2hhcGUubW92ZVRvUG9pbnQoIGludGVyaW9yUGVyaW1ldGVyWyAwIF0gKTtcbiAgICAgICAgZm9yICggaSA9IDE7IGkgPCBpbnRlcmlvclBlcmltZXRlci5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLmtpdGVTaGFwZS5saW5lVG9Qb2ludCggaW50ZXJpb3JQZXJpbWV0ZXJbIGkgXSApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMua2l0ZVNoYXBlLmxpbmVUb1BvaW50KCBpbnRlcmlvclBlcmltZXRlclsgMCBdICk7XG4gICAgICAgIHRoaXMua2l0ZVNoYXBlLmNsb3NlKCk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gQHB1YmxpYywgcmVhZCBvbmx5XG4gICAgdGhpcy51bml0QXJlYSA9IGNhbGN1bGF0ZVVuaXRBcmVhKCB0aGlzLmtpdGVTaGFwZSwgdW5pdExlbmd0aCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaW5lYXJseSB0cmFuc2xhdGVkIHZlcnNpb24gb2YgdGhpcyBwZXJpbWV0ZXIgc2hhcGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqIEByZXR1cm5zIHtQZXJpbWV0ZXJTaGFwZX1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdHJhbnNsYXRlZCggeCwgeSApIHtcbiAgICBjb25zdCBleHRlcmlvclBlcmltZXRlcnMgPSBbXTtcbiAgICBjb25zdCBpbnRlcmlvclBlcmltZXRlcnMgPSBbXTtcbiAgICB0aGlzLmV4dGVyaW9yUGVyaW1ldGVycy5mb3JFYWNoKCAoIGV4dGVyaW9yUGVyaW1ldGVyLCBpbmRleCApID0+IHtcbiAgICAgIGV4dGVyaW9yUGVyaW1ldGVycy5wdXNoKCBbXSApO1xuICAgICAgZXh0ZXJpb3JQZXJpbWV0ZXIuZm9yRWFjaCggcG9pbnQgPT4ge1xuICAgICAgICBleHRlcmlvclBlcmltZXRlcnNbIGluZGV4IF0ucHVzaCggcG9pbnQucGx1c1hZKCB4LCB5ICkgKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gICAgdGhpcy5pbnRlcmlvclBlcmltZXRlcnMuZm9yRWFjaCggKCBpbnRlcmlvclBlcmltZXRlciwgaW5kZXggKSA9PiB7XG4gICAgICBpbnRlcmlvclBlcmltZXRlcnMucHVzaCggW10gKTtcbiAgICAgIGludGVyaW9yUGVyaW1ldGVyLmZvckVhY2goIHBvaW50ID0+IHtcbiAgICAgICAgaW50ZXJpb3JQZXJpbWV0ZXJzWyBpbmRleCBdLnB1c2goIHBvaW50LnBsdXNYWSggeCwgeSApICk7XG4gICAgICB9ICk7XG4gICAgfSApO1xuICAgIHJldHVybiBuZXcgUGVyaW1ldGVyU2hhcGUoIGV4dGVyaW9yUGVyaW1ldGVycywgaW50ZXJpb3JQZXJpbWV0ZXJzLCB0aGlzLnVuaXRMZW5ndGgsIHtcbiAgICAgIGZpbGxDb2xvcjogdGhpcy5maWxsQ29sb3IsXG4gICAgICBlZGdlQ29sb3I6IHRoaXMuZWRnZUNvbG9yXG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGdldFdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLmtpdGVTaGFwZS5ib3VuZHMud2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZ2V0SGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLmtpdGVTaGFwZS5ib3VuZHMuaGVpZ2h0O1xuICB9XG59XG5cbi8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gY29tcHV0ZSB0aGUgdW5pdCBhcmVhIG9mIGEgcGVyaW1ldGVyIHNoYXBlLlxuZnVuY3Rpb24gY2FsY3VsYXRlVW5pdEFyZWEoIHNoYXBlLCB1bml0TGVuZ3RoICkge1xuXG4gIGlmICggIXNoYXBlLmJvdW5kcy5pc0Zpbml0ZSgpICkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGUuYm91bmRzLndpZHRoICUgdW5pdExlbmd0aCA8IEZMT0FUSU5HX1BPSU5UX0VSUl9UT0xFUkFOQ0UgJiZcbiAgc2hhcGUuYm91bmRzLmhlaWdodCAlIHVuaXRMZW5ndGggPCBGTE9BVElOR19QT0lOVF9FUlJfVE9MRVJBTkNFLFxuICAgICdFcnJvcjogVGhpcyBtZXRob2Qgd2lsbCBvbmx5IHdvcmsgd2l0aCBzaGFwZXMgdGhhdCBoYXZlIGJvdW5kcyBvZiB1bml0IHdpZHRoIGFuZCBoZWlnaHQuJ1xuICApO1xuXG4gIC8vIENvbXB1dGUgdGhlIHVuaXQgYXJlYSBieSB0ZXN0aW5nIHdoZXRoZXIgb3Igbm90IHBvaW50cyBvbiBhIHN1Yi1ncmlkIGFyZSBjb250YWluZWQgaW4gdGhlIHNoYXBlLlxuICBsZXQgdW5pdEFyZWEgPSAwO1xuICBjb25zdCB0ZXN0UG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuICBmb3IgKCBsZXQgcm93ID0gMDsgcm93ICogdW5pdExlbmd0aCA8IHNoYXBlLmJvdW5kcy5oZWlnaHQ7IHJvdysrICkge1xuICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gKiB1bml0TGVuZ3RoIDwgc2hhcGUuYm91bmRzLndpZHRoOyBjb2x1bW4rKyApIHtcbiAgICAgIC8vIFNjYW4gZm91ciBwb2ludHMgaW4gdGhlIHVuaXQgc3F1YXJlLiAgVGhpcyBhbGxvd3Mgc3VwcG9ydCBmb3IgdHJpYW5ndWxhciAxLzIgdW5pdCBzcXVhcmUgc2hhcGVzLiAgVGhpcyBpc1xuICAgICAgLy8gaW4tbGluZWQgcmF0aGVyIHRoYW4gbG9vcGVkIGZvciB0aGUgc2FrZSBvZiBlZmZpY2llbmN5LCBzaW5jZSB0aGlzIGFwcHJvYWNoIGF2b2lkcyB2ZWN0b3IgYWxsb2NhdGlvbnMuXG4gICAgICB0ZXN0UG9pbnQuc2V0WFkoIHNoYXBlLmJvdW5kcy5taW5YICsgKCBjb2x1bW4gKyAwLjI1ICkgKiB1bml0TGVuZ3RoLCBzaGFwZS5ib3VuZHMubWluWSArICggcm93ICsgMC41ICkgKiB1bml0TGVuZ3RoICk7XG4gICAgICBpZiAoIHNoYXBlLmNvbnRhaW5zUG9pbnQoIHRlc3RQb2ludCApICkge1xuICAgICAgICB1bml0QXJlYSArPSAwLjI1O1xuICAgICAgfVxuICAgICAgdGVzdFBvaW50LnNldFhZKCBzaGFwZS5ib3VuZHMubWluWCArICggY29sdW1uICsgMC41ICkgKiB1bml0TGVuZ3RoLCBzaGFwZS5ib3VuZHMubWluWSArICggcm93ICsgMC4yNSApICogdW5pdExlbmd0aCApO1xuICAgICAgaWYgKCBzaGFwZS5jb250YWluc1BvaW50KCB0ZXN0UG9pbnQgKSApIHtcbiAgICAgICAgdW5pdEFyZWEgKz0gMC4yNTtcbiAgICAgIH1cbiAgICAgIHRlc3RQb2ludC5zZXRYWSggc2hhcGUuYm91bmRzLm1pblggKyAoIGNvbHVtbiArIDAuNSApICogdW5pdExlbmd0aCwgc2hhcGUuYm91bmRzLm1pblkgKyAoIHJvdyArIDAuNzUgKSAqIHVuaXRMZW5ndGggKTtcbiAgICAgIGlmICggc2hhcGUuY29udGFpbnNQb2ludCggdGVzdFBvaW50ICkgKSB7XG4gICAgICAgIHVuaXRBcmVhICs9IDAuMjU7XG4gICAgICB9XG4gICAgICB0ZXN0UG9pbnQuc2V0WFkoIHNoYXBlLmJvdW5kcy5taW5YICsgKCBjb2x1bW4gKyAwLjc1ICkgKiB1bml0TGVuZ3RoLCBzaGFwZS5ib3VuZHMubWluWSArICggcm93ICsgMC41ICkgKiB1bml0TGVuZ3RoICk7XG4gICAgICBpZiAoIHNoYXBlLmNvbnRhaW5zUG9pbnQoIHRlc3RQb2ludCApICkge1xuICAgICAgICB1bml0QXJlYSArPSAwLjI1O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdW5pdEFyZWE7XG59XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnUGVyaW1ldGVyU2hhcGUnLCBQZXJpbWV0ZXJTaGFwZSApO1xuZXhwb3J0IGRlZmF1bHQgUGVyaW1ldGVyU2hhcGU7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJTaGFwZSIsIm1lcmdlIiwiYXJlYUJ1aWxkZXIiLCJGTE9BVElOR19QT0lOVF9FUlJfVE9MRVJBTkNFIiwiUGVyaW1ldGVyU2hhcGUiLCJ0cmFuc2xhdGVkIiwieCIsInkiLCJleHRlcmlvclBlcmltZXRlcnMiLCJpbnRlcmlvclBlcmltZXRlcnMiLCJmb3JFYWNoIiwiZXh0ZXJpb3JQZXJpbWV0ZXIiLCJpbmRleCIsInB1c2giLCJwb2ludCIsInBsdXNYWSIsImludGVyaW9yUGVyaW1ldGVyIiwidW5pdExlbmd0aCIsImZpbGxDb2xvciIsImVkZ2VDb2xvciIsImdldFdpZHRoIiwia2l0ZVNoYXBlIiwiYm91bmRzIiwid2lkdGgiLCJnZXRIZWlnaHQiLCJoZWlnaHQiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpIiwibW92ZVRvUG9pbnQiLCJsZW5ndGgiLCJsaW5lVG9Qb2ludCIsImNsb3NlIiwiaXNFbXB0eSIsInVuaXRBcmVhIiwiY2FsY3VsYXRlVW5pdEFyZWEiLCJzaGFwZSIsImlzRmluaXRlIiwiYXNzZXJ0IiwidGVzdFBvaW50Iiwicm93IiwiY29sdW1uIiwic2V0WFkiLCJtaW5YIiwibWluWSIsImNvbnRhaW5zUG9pbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsYUFBYSxnQ0FBZ0M7QUFDcEQsU0FBU0MsS0FBSyxRQUFRLGlDQUFpQztBQUN2RCxPQUFPQyxXQUFXLG9DQUFvQztBQUN0RCxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBRS9DLFlBQVk7QUFDWixNQUFNQywrQkFBK0I7QUFFckMsSUFBQSxBQUFNQyxpQkFBTixNQUFNQTtJQTZESjs7Ozs7O0dBTUMsR0FDREMsV0FBWUMsQ0FBQyxFQUFFQyxDQUFDLEVBQUc7UUFDakIsTUFBTUMscUJBQXFCLEVBQUU7UUFDN0IsTUFBTUMscUJBQXFCLEVBQUU7UUFDN0IsSUFBSSxDQUFDRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFFLENBQUVDLG1CQUFtQkM7WUFDcERKLG1CQUFtQkssSUFBSSxDQUFFLEVBQUU7WUFDM0JGLGtCQUFrQkQsT0FBTyxDQUFFSSxDQUFBQTtnQkFDekJOLGtCQUFrQixDQUFFSSxNQUFPLENBQUNDLElBQUksQ0FBRUMsTUFBTUMsTUFBTSxDQUFFVCxHQUFHQztZQUNyRDtRQUNGO1FBQ0EsSUFBSSxDQUFDRSxrQkFBa0IsQ0FBQ0MsT0FBTyxDQUFFLENBQUVNLG1CQUFtQko7WUFDcERILG1CQUFtQkksSUFB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