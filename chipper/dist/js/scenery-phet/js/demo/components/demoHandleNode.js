// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for HandleNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Node } from '../../../../scenery/js/imports.js';
import HandleNode from '../../HandleNode.js';
export default function demoHandleNode(layoutBounds) {
    const handleNode = new HandleNode({
        scale: 4.0
    });
    return new Node({
        children: [
            handleNode
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0hhbmRsZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgSGFuZGxlTm9kZVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSGFuZGxlTm9kZSBmcm9tICcuLi8uLi9IYW5kbGVOb2RlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0hhbmRsZU5vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcbiAgY29uc3QgaGFuZGxlTm9kZSA9IG5ldyBIYW5kbGVOb2RlKCB7IHNjYWxlOiA0LjAgfSApO1xuXG4gIHJldHVybiBuZXcgTm9kZSgge1xuICAgIGNoaWxkcmVuOiBbIGhhbmRsZU5vZGUgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJOb2RlIiwiSGFuZGxlTm9kZSIsImRlbW9IYW5kbGVOb2RlIiwibGF5b3V0Qm91bmRzIiwiaGFuZGxlTm9kZSIsInNjYWxlIiwiY2hpbGRyZW4iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsU0FBU0EsSUFBSSxRQUFRLG9DQUFvQztBQUN6RCxPQUFPQyxnQkFBZ0Isc0JBQXNCO0FBRTdDLGVBQWUsU0FBU0MsZUFBZ0JDLFlBQXFCO0lBQzNELE1BQU1DLGFBQWEsSUFBSUgsV0FBWTtRQUFFSSxPQUFPO0lBQUk7SUFFaEQsT0FBTyxJQUFJTCxLQUFNO1FBQ2ZNLFVBQVU7WUFBRUY7U0FBWTtRQUN4QkcsUUFBUUosYUFBYUksTUFBTTtJQUM3QjtBQUNGIn0=