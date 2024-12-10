// Copyright 2014-2022, University of Colorado Boulder
/**
 * Defines a simple grid with horizontal and vertical lines, and no enclosing
 * lines on the outer edges.
 *
 * @author John Blanco
 */ import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
let Grid = class Grid extends Path {
    /**
   * @param {Bounds2} bounds
   * @param {number} spacing
   * @param {Object} [options]
   */ constructor(bounds, spacing, options){
        const gridShape = new Shape();
        // Add the vertical lines
        for(let i = bounds.minX + spacing; i < bounds.minX + bounds.width; i += spacing){
            gridShape.moveTo(i, bounds.minY);
            gridShape.lineTo(i, bounds.minY + bounds.height);
        }
        // Add the horizontal lines
        for(let i = bounds.minY + spacing; i < bounds.minY + bounds.height; i += spacing){
            gridShape.moveTo(bounds.minX, i);
            gridShape.lineTo(bounds.minX + bounds.width, i);
        }
        super(gridShape, options);
    }
};
areaBuilder.register('Grid', Grid);
export default Grid;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9HcmlkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlZmluZXMgYSBzaW1wbGUgZ3JpZCB3aXRoIGhvcml6b250YWwgYW5kIHZlcnRpY2FsIGxpbmVzLCBhbmQgbm8gZW5jbG9zaW5nXG4gKiBsaW5lcyBvbiB0aGUgb3V0ZXIgZWRnZXMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcblxuY2xhc3MgR3JpZCBleHRlbmRzIFBhdGgge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGJvdW5kc1xuICAgKiBAcGFyYW0ge251bWJlcn0gc3BhY2luZ1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3RvciggYm91bmRzLCBzcGFjaW5nLCBvcHRpb25zICkge1xuICAgIGNvbnN0IGdyaWRTaGFwZSA9IG5ldyBTaGFwZSgpO1xuXG4gICAgLy8gQWRkIHRoZSB2ZXJ0aWNhbCBsaW5lc1xuICAgIGZvciAoIGxldCBpID0gYm91bmRzLm1pblggKyBzcGFjaW5nOyBpIDwgYm91bmRzLm1pblggKyBib3VuZHMud2lkdGg7IGkgKz0gc3BhY2luZyApIHtcbiAgICAgIGdyaWRTaGFwZS5tb3ZlVG8oIGksIGJvdW5kcy5taW5ZICk7XG4gICAgICBncmlkU2hhcGUubGluZVRvKCBpLCBib3VuZHMubWluWSArIGJvdW5kcy5oZWlnaHQgKTtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGhvcml6b250YWwgbGluZXNcbiAgICBmb3IgKCBsZXQgaSA9IGJvdW5kcy5taW5ZICsgc3BhY2luZzsgaSA8IGJvdW5kcy5taW5ZICsgYm91bmRzLmhlaWdodDsgaSArPSBzcGFjaW5nICkge1xuICAgICAgZ3JpZFNoYXBlLm1vdmVUbyggYm91bmRzLm1pblgsIGkgKTtcbiAgICAgIGdyaWRTaGFwZS5saW5lVG8oIGJvdW5kcy5taW5YICsgYm91bmRzLndpZHRoLCBpICk7XG4gICAgfVxuXG4gICAgc3VwZXIoIGdyaWRTaGFwZSwgb3B0aW9ucyApO1xuICB9XG59XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnR3JpZCcsIEdyaWQgKTtcbmV4cG9ydCBkZWZhdWx0IEdyaWQ7Il0sIm5hbWVzIjpbIlNoYXBlIiwiUGF0aCIsImFyZWFCdWlsZGVyIiwiR3JpZCIsImNvbnN0cnVjdG9yIiwiYm91bmRzIiwic3BhY2luZyIsIm9wdGlvbnMiLCJncmlkU2hhcGUiLCJpIiwibWluWCIsIndpZHRoIiwibW92ZVRvIiwibWluWSIsImxpbmVUbyIsImhlaWdodCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxTQUFTQSxLQUFLLFFBQVEsaUNBQWlDO0FBQ3ZELFNBQVNDLElBQUksUUFBUSxvQ0FBb0M7QUFDekQsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUUvQyxJQUFBLEFBQU1DLE9BQU4sTUFBTUEsYUFBYUY7SUFFakI7Ozs7R0FJQyxHQUNERyxZQUFhQyxNQUFNLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxDQUFHO1FBQ3RDLE1BQU1DLFlBQVksSUFBSVI7UUFFdEIseUJBQXlCO1FBQ3pCLElBQU0sSUFBSVMsSUFBSUosT0FBT0ssSUFBSSxHQUFHSixTQUFTRyxJQUFJSixPQUFPSyxJQUFJLEdBQUdMLE9BQU9NLEtBQUssRUFBRUYsS0FBS0gsUUFBVTtZQUNsRkUsVUFBVUksTUFBTSxDQUFFSCxHQUFHSixPQUFPUSxJQUFJO1lBQ2hDTCxVQUFVTSxNQUFNLENBQUVMLEdBQUdKLE9BQU9RLElBQUksR0FBR1IsT0FBT1UsTUFBTTtRQUNsRDtRQUVBLDJCQUEyQjtRQUMzQixJQUFNLElBQUlOLElBQUlKLE9BQU9RLElBQUksR0FBR1AsU0FBU0csSUFBSUosT0FBT1EsSUFBSSxHQUFHUixPQUFPVSxNQUFNLEVBQUVOLEtBQUtILFFBQVU7WUFDbkZFLFVBQVVJLE1BQU0sQ0FBRVAsT0FBT0ssSUFBSSxFQUFFRDtZQUMvQkQsVUFBVU0sTUFBTSxDQUFFVCxPQUFPSyxJQUFJLEdBQUdMLE9BQU9NLEtBQUssRUFBRUY7UUFDaEQ7UUFFQSxLQUFLLENBQUVELFdBQVdEO0lBQ3BCO0FBQ0Y7QUFFQUwsWUFBWWMsUUFBUSxDQUFFLFFBQVFiO0FBQzlCLGVBQWVBLEtBQUsifQ==