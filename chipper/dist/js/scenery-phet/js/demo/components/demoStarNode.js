// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for StarNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { Node } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import StarNode from '../../StarNode.js';
export default function demoStarNode(layoutBounds) {
    const starValueProperty = new Property(1);
    const starSlider = new HSlider(starValueProperty, new Range(0, 1), {
        thumbSize: new Dimension2(25, 50),
        thumbFillHighlighted: 'yellow',
        thumbFill: 'rgb(220,220,0)',
        thumbCenterLineStroke: 'black'
    });
    const starNodeContainer = new Node({
        children: [
            new StarNode()
        ],
        top: starSlider.bottom + 30,
        right: starSlider.right
    });
    /*
   * Fill up a star by creating new StarNodes dynamically.
   * Shouldn't be a problem for sims since stars are relatively static.
   * Stars should be rewritten if they need to support smooth dynamic filling (may require mutable kite paths).
   */ starValueProperty.link((value)=>{
        starNodeContainer.children = [
            new StarNode({
                value: value,
                starShapeOptions: {
                    outerRadius: 30,
                    innerRadius: 15
                }
            })
        ];
    });
    return new Node({
        children: [
            starNodeContainer,
            starSlider
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1N0YXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIFN0YXJOb2RlXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFN0YXJOb2RlIGZyb20gJy4uLy4uL1N0YXJOb2RlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1N0YXJOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3Qgc3RhclZhbHVlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTtcblxuICBjb25zdCBzdGFyU2xpZGVyID0gbmV3IEhTbGlkZXIoIHN0YXJWYWx1ZVByb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIDEgKSwge1xuICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDI1LCA1MCApLFxuICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAneWVsbG93JyxcbiAgICB0aHVtYkZpbGw6ICdyZ2IoMjIwLDIyMCwwKScsXG4gICAgdGh1bWJDZW50ZXJMaW5lU3Ryb2tlOiAnYmxhY2snXG4gIH0gKTtcblxuICBjb25zdCBzdGFyTm9kZUNvbnRhaW5lciA9IG5ldyBOb2RlKCB7XG4gICAgY2hpbGRyZW46IFsgbmV3IFN0YXJOb2RlKCkgXSxcbiAgICB0b3A6IHN0YXJTbGlkZXIuYm90dG9tICsgMzAsXG4gICAgcmlnaHQ6IHN0YXJTbGlkZXIucmlnaHRcbiAgfSApO1xuXG4gIC8qXG4gICAqIEZpbGwgdXAgYSBzdGFyIGJ5IGNyZWF0aW5nIG5ldyBTdGFyTm9kZXMgZHluYW1pY2FsbHkuXG4gICAqIFNob3VsZG4ndCBiZSBhIHByb2JsZW0gZm9yIHNpbXMgc2luY2Ugc3RhcnMgYXJlIHJlbGF0aXZlbHkgc3RhdGljLlxuICAgKiBTdGFycyBzaG91bGQgYmUgcmV3cml0dGVuIGlmIHRoZXkgbmVlZCB0byBzdXBwb3J0IHNtb290aCBkeW5hbWljIGZpbGxpbmcgKG1heSByZXF1aXJlIG11dGFibGUga2l0ZSBwYXRocykuXG4gICAqL1xuICBzdGFyVmFsdWVQcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XG4gICAgc3Rhck5vZGVDb250YWluZXIuY2hpbGRyZW4gPSBbXG4gICAgICBuZXcgU3Rhck5vZGUoIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBzdGFyU2hhcGVPcHRpb25zOiB7XG4gICAgICAgICAgb3V0ZXJSYWRpdXM6IDMwLFxuICAgICAgICAgIGlubmVyUmFkaXVzOiAxNVxuICAgICAgICB9XG4gICAgICB9IClcbiAgICBdO1xuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBOb2RlKCB7XG4gICAgY2hpbGRyZW46IFsgc3Rhck5vZGVDb250YWluZXIsIHN0YXJTbGlkZXIgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIk5vZGUiLCJIU2xpZGVyIiwiU3Rhck5vZGUiLCJkZW1vU3Rhck5vZGUiLCJsYXlvdXRCb3VuZHMiLCJzdGFyVmFsdWVQcm9wZXJ0eSIsInN0YXJTbGlkZXIiLCJ0aHVtYlNpemUiLCJ0aHVtYkZpbGxIaWdobGlnaHRlZCIsInRodW1iRmlsbCIsInRodW1iQ2VudGVyTGluZVN0cm9rZSIsInN0YXJOb2RlQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJ0b3AiLCJib3R0b20iLCJyaWdodCIsImxpbmsiLCJ2YWx1ZSIsInN0YXJTaGFwZU9wdGlvbnMiLCJvdXRlclJhZGl1cyIsImlubmVyUmFkaXVzIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBRXZELE9BQU9DLGdCQUFnQixtQ0FBbUM7QUFDMUQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsSUFBSSxRQUFRLG9DQUFvQztBQUN6RCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxjQUFjLG9CQUFvQjtBQUV6QyxlQUFlLFNBQVNDLGFBQWNDLFlBQXFCO0lBRXpELE1BQU1DLG9CQUFvQixJQUFJUixTQUFVO0lBRXhDLE1BQU1TLGFBQWEsSUFBSUwsUUFBU0ksbUJBQW1CLElBQUlOLE1BQU8sR0FBRyxJQUFLO1FBQ3BFUSxXQUFXLElBQUlULFdBQVksSUFBSTtRQUMvQlUsc0JBQXNCO1FBQ3RCQyxXQUFXO1FBQ1hDLHVCQUF1QjtJQUN6QjtJQUVBLE1BQU1DLG9CQUFvQixJQUFJWCxLQUFNO1FBQ2xDWSxVQUFVO1lBQUUsSUFBSVY7U0FBWTtRQUM1QlcsS0FBS1AsV0FBV1EsTUFBTSxHQUFHO1FBQ3pCQyxPQUFPVCxXQUFXUyxLQUFLO0lBQ3pCO0lBRUE7Ozs7R0FJQyxHQUNEVixrQkFBa0JXLElBQUksQ0FBRUMsQ0FBQUE7UUFDdEJOLGtCQUFrQkMsUUFBUSxHQUFHO1lBQzNCLElBQUlWLFNBQVU7Z0JBQ1plLE9BQU9BO2dCQUNQQyxrQkFBa0I7b0JBQ2hCQyxhQUFhO29CQUNiQyxhQUFhO2dCQUNmO1lBQ0Y7U0FDRDtJQUNIO0lBRUEsT0FBTyxJQUFJcEIsS0FBTTtRQUNmWSxVQUFVO1lBQUVEO1lBQW1CTDtTQUFZO1FBQzNDZSxRQUFRakIsYUFBYWlCLE1BQU07SUFDN0I7QUFDRiJ9