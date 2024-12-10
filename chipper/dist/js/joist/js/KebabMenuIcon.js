// Copyright 2018-2022, University of Colorado Boulder
/**
 * The "kebab" menu icon, 3 dots stacked vertically that look like a shish kebab.
 * See https://github.com/phetsims/joist/issues/544
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../kite/js/imports.js';
import { Path } from '../../scenery/js/imports.js';
import joist from './joist.js';
// constants
const CIRCLE_RADIUS = 2.5;
let KebabMenuIcon = class KebabMenuIcon extends Path {
    constructor(options){
        const shape = new Shape();
        for(let i = 0; i < 3; i++){
            shape.circle(0, i * 3.543 * CIRCLE_RADIUS, CIRCLE_RADIUS); // args are: x, y, radius
        }
        super(shape, options);
    }
};
joist.register('KebabMenuIcon', KebabMenuIcon);
export default KebabMenuIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0tlYmFiTWVudUljb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIFwia2ViYWJcIiBtZW51IGljb24sIDMgZG90cyBzdGFja2VkIHZlcnRpY2FsbHkgdGhhdCBsb29rIGxpa2UgYSBzaGlzaCBrZWJhYi5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzU0NFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgUGF0aCwgUGF0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IENJUkNMRV9SQURJVVMgPSAyLjU7XG5cbmNsYXNzIEtlYmFiTWVudUljb24gZXh0ZW5kcyBQYXRoIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBQYXRoT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgMzsgaSsrICkge1xuICAgICAgc2hhcGUuY2lyY2xlKCAwLCBpICogMy41NDMgKiBDSVJDTEVfUkFESVVTLCBDSVJDTEVfUkFESVVTICk7IC8vIGFyZ3MgYXJlOiB4LCB5LCByYWRpdXNcbiAgICB9XG5cbiAgICBzdXBlciggc2hhcGUsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0tlYmFiTWVudUljb24nLCBLZWJhYk1lbnVJY29uICk7XG5leHBvcnQgZGVmYXVsdCBLZWJhYk1lbnVJY29uOyJdLCJuYW1lcyI6WyJTaGFwZSIsIlBhdGgiLCJqb2lzdCIsIkNJUkNMRV9SQURJVVMiLCJLZWJhYk1lbnVJY29uIiwib3B0aW9ucyIsInNoYXBlIiwiaSIsImNpcmNsZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELFNBQVNDLElBQUksUUFBcUIsOEJBQThCO0FBQ2hFLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixZQUFZO0FBQ1osTUFBTUMsZ0JBQWdCO0FBRXRCLElBQUEsQUFBTUMsZ0JBQU4sTUFBTUEsc0JBQXNCSDtJQUUxQixZQUFvQkksT0FBcUIsQ0FBRztRQUUxQyxNQUFNQyxRQUFRLElBQUlOO1FBQ2xCLElBQU0sSUFBSU8sSUFBSSxHQUFHQSxJQUFJLEdBQUdBLElBQU07WUFDNUJELE1BQU1FLE1BQU0sQ0FBRSxHQUFHRCxJQUFJLFFBQVFKLGVBQWVBLGdCQUFpQix5QkFBeUI7UUFDeEY7UUFFQSxLQUFLLENBQUVHLE9BQU9EO0lBQ2hCO0FBQ0Y7QUFFQUgsTUFBTU8sUUFBUSxDQUFFLGlCQUFpQkw7QUFDakMsZUFBZUEsY0FBYyJ9