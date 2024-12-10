// Copyright 2018-2023, University of Colorado Boulder
/**
 * Utilities for listener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector2 from '../../../dot/js/Vector2.js';
import Display from '../display/Display.js';
import { EventContext } from '../imports.js';
import Node from '../nodes/Node.js';
import Rectangle from '../nodes/Rectangle.js';
const ListenerTestUtils = {
    /**
   * Sends a synthesized mouseDown event at the given coordinates.
   * @public
   *
   * @param {Display} display
   * @param {number} x
   * @param {number} y
   */ mouseDown (display, x, y) {
        const domEvent = document.createEvent('MouseEvent');
        // technically deprecated, but DOM4 event constructors not out yet. people on #whatwg said to use it
        domEvent.initMouseEvent('mousedown', true, true, window, 1, x, y, x, y, false, false, false, false, 0, null);
        display._input.validatePointers();
        display._input.mouseDown(null, new Vector2(x, y), new EventContext(domEvent));
    },
    /**
   * Sends a synthesized mouseUp event at the given coordinates.
   * @public
   *
   * @param {Display} display
   * @param {number} x
   * @param {number} y
   */ mouseUp (display, x, y) {
        const domEvent = document.createEvent('MouseEvent');
        // technically deprecated, but DOM4 event constructors not out yet. people on #whatwg said to use it
        domEvent.initMouseEvent('mouseup', true, true, window, 1, x, y, x, y, false, false, false, false, 0, null);
        display._input.validatePointers();
        display._input.mouseUp(new Vector2(x, y), new EventContext(domEvent));
    },
    /**
   * Sends a synthesized mouseMove event at the given coordinates.
   * @public
   *
   * @param {Display} display
   * @param {number} x
   * @param {number} y
   */ mouseMove (display, x, y) {
        const domEvent = document.createEvent('MouseEvent');
        // technically deprecated, but DOM4 event constructors not out yet. people on #whatwg said to use it
        domEvent.initMouseEvent('mousemove', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
        display._input.validatePointers();
        display._input.mouseMove(new Vector2(x, y), new EventContext(domEvent));
    },
    /**
   * Runs a simple test with a 20x20 rectangle in a 640x480 display.
   * @public
   *
   * @param {Function} callback - Called with callback( {Display}, {Node}, {Node} ) - First node is the draggable rect
   */ simpleRectangleTest (callback) {
        const node = new Node();
        const display = new Display(node, {
            width: 640,
            height: 480
        });
        display.initializeEvents();
        display.updateDisplay();
        const rect = new Rectangle(0, 0, 20, 20, {
            fill: 'red'
        });
        node.addChild(rect);
        callback(display, rect, node);
        // Cleanup, so we don't leak listeners/memory
        display.dispose();
    }
};
export default ListenerTestUtils;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0xpc3RlbmVyVGVzdFV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgbGlzdGVuZXIgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IERpc3BsYXkgZnJvbSAnLi4vZGlzcGxheS9EaXNwbGF5LmpzJztcbmltcG9ydCB7IEV2ZW50Q29udGV4dCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuaW1wb3J0IE5vZGUgZnJvbSAnLi4vbm9kZXMvTm9kZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gJy4uL25vZGVzL1JlY3RhbmdsZS5qcyc7XG5cbmNvbnN0IExpc3RlbmVyVGVzdFV0aWxzID0ge1xuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHN5bnRoZXNpemVkIG1vdXNlRG93biBldmVudCBhdCB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqL1xuICBtb3VzZURvd24oIGRpc3BsYXksIHgsIHkgKSB7XG4gICAgY29uc3QgZG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ01vdXNlRXZlbnQnICk7XG5cbiAgICAvLyB0ZWNobmljYWxseSBkZXByZWNhdGVkLCBidXQgRE9NNCBldmVudCBjb25zdHJ1Y3RvcnMgbm90IG91dCB5ZXQuIHBlb3BsZSBvbiAjd2hhdHdnIHNhaWQgdG8gdXNlIGl0XG4gICAgZG9tRXZlbnQuaW5pdE1vdXNlRXZlbnQoICdtb3VzZWRvd24nLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIC8vIGNsaWNrIGNvdW50XG4gICAgICB4LCB5LCB4LCB5LFxuICAgICAgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsXG4gICAgICAwLCAvLyBidXR0b25cbiAgICAgIG51bGwgKTtcblxuICAgIGRpc3BsYXkuX2lucHV0LnZhbGlkYXRlUG9pbnRlcnMoKTtcbiAgICBkaXNwbGF5Ll9pbnB1dC5tb3VzZURvd24oIG51bGwsIG5ldyBWZWN0b3IyKCB4LCB5ICksIG5ldyBFdmVudENvbnRleHQoIGRvbUV2ZW50ICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogU2VuZHMgYSBzeW50aGVzaXplZCBtb3VzZVVwIGV2ZW50IGF0IHRoZSBnaXZlbiBjb29yZGluYXRlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Rpc3BsYXl9IGRpc3BsYXlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcbiAgICogQHBhcmFtIHtudW1iZXJ9IHlcbiAgICovXG4gIG1vdXNlVXAoIGRpc3BsYXksIHgsIHkgKSB7XG4gICAgY29uc3QgZG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ01vdXNlRXZlbnQnICk7XG5cbiAgICAvLyB0ZWNobmljYWxseSBkZXByZWNhdGVkLCBidXQgRE9NNCBldmVudCBjb25zdHJ1Y3RvcnMgbm90IG91dCB5ZXQuIHBlb3BsZSBvbiAjd2hhdHdnIHNhaWQgdG8gdXNlIGl0XG4gICAgZG9tRXZlbnQuaW5pdE1vdXNlRXZlbnQoICdtb3VzZXVwJywgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCAvLyBjbGljayBjb3VudFxuICAgICAgeCwgeSwgeCwgeSxcbiAgICAgIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLFxuICAgICAgMCwgLy8gYnV0dG9uXG4gICAgICBudWxsICk7XG5cbiAgICBkaXNwbGF5Ll9pbnB1dC52YWxpZGF0ZVBvaW50ZXJzKCk7XG4gICAgZGlzcGxheS5faW5wdXQubW91c2VVcCggbmV3IFZlY3RvcjIoIHgsIHkgKSwgbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHN5bnRoZXNpemVkIG1vdXNlTW92ZSBldmVudCBhdCB0aGUgZ2l2ZW4gY29vcmRpbmF0ZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gICAqL1xuICBtb3VzZU1vdmUoIGRpc3BsYXksIHgsIHkgKSB7XG4gICAgY29uc3QgZG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ01vdXNlRXZlbnQnICk7XG5cbiAgICAvLyB0ZWNobmljYWxseSBkZXByZWNhdGVkLCBidXQgRE9NNCBldmVudCBjb25zdHJ1Y3RvcnMgbm90IG91dCB5ZXQuIHBlb3BsZSBvbiAjd2hhdHdnIHNhaWQgdG8gdXNlIGl0XG4gICAgZG9tRXZlbnQuaW5pdE1vdXNlRXZlbnQoICdtb3VzZW1vdmUnLCB0cnVlLCB0cnVlLCB3aW5kb3csIDAsIC8vIGNsaWNrIGNvdW50XG4gICAgICB4LCB5LCB4LCB5LFxuICAgICAgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsXG4gICAgICAwLCAvLyBidXR0b25cbiAgICAgIG51bGwgKTtcblxuXG4gICAgZGlzcGxheS5faW5wdXQudmFsaWRhdGVQb2ludGVycygpO1xuICAgIGRpc3BsYXkuX2lucHV0Lm1vdXNlTW92ZSggbmV3IFZlY3RvcjIoIHgsIHkgKSwgbmV3IEV2ZW50Q29udGV4dCggZG9tRXZlbnQgKSApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSdW5zIGEgc2ltcGxlIHRlc3Qgd2l0aCBhIDIweDIwIHJlY3RhbmdsZSBpbiBhIDY0MHg0ODAgZGlzcGxheS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIENhbGxlZCB3aXRoIGNhbGxiYWNrKCB7RGlzcGxheX0sIHtOb2RlfSwge05vZGV9ICkgLSBGaXJzdCBub2RlIGlzIHRoZSBkcmFnZ2FibGUgcmVjdFxuICAgKi9cbiAgc2ltcGxlUmVjdGFuZ2xlVGVzdCggY2FsbGJhY2sgKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCBub2RlLCB7IHdpZHRoOiA2NDAsIGhlaWdodDogNDgwIH0gKTtcbiAgICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcbiAgICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcblxuICAgIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAsIHsgZmlsbDogJ3JlZCcgfSApO1xuICAgIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcblxuICAgIGNhbGxiYWNrKCBkaXNwbGF5LCByZWN0LCBub2RlICk7XG5cbiAgICAvLyBDbGVhbnVwLCBzbyB3ZSBkb24ndCBsZWFrIGxpc3RlbmVycy9tZW1vcnlcbiAgICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGlzdGVuZXJUZXN0VXRpbHM7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJEaXNwbGF5IiwiRXZlbnRDb250ZXh0IiwiTm9kZSIsIlJlY3RhbmdsZSIsIkxpc3RlbmVyVGVzdFV0aWxzIiwibW91c2VEb3duIiwiZGlzcGxheSIsIngiLCJ5IiwiZG9tRXZlbnQiLCJkb2N1bWVudCIsImNyZWF0ZUV2ZW50IiwiaW5pdE1vdXNlRXZlbnQiLCJ3aW5kb3ciLCJfaW5wdXQiLCJ2YWxpZGF0ZVBvaW50ZXJzIiwibW91c2VVcCIsIm1vdXNlTW92ZSIsInNpbXBsZVJlY3RhbmdsZVRlc3QiLCJjYWxsYmFjayIsIm5vZGUiLCJ3aWR0aCIsImhlaWdodCIsImluaXRpYWxpemVFdmVudHMiLCJ1cGRhdGVEaXNwbGF5IiwicmVjdCIsImZpbGwiLCJhZGRDaGlsZCIsImRpc3Bvc2UiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYSx3QkFBd0I7QUFDNUMsU0FBU0MsWUFBWSxRQUFRLGdCQUFnQjtBQUM3QyxPQUFPQyxVQUFVLG1CQUFtQjtBQUNwQyxPQUFPQyxlQUFlLHdCQUF3QjtBQUU5QyxNQUFNQyxvQkFBb0I7SUFFeEI7Ozs7Ozs7R0FPQyxHQUNEQyxXQUFXQyxPQUFPLEVBQUVDLENBQUMsRUFBRUMsQ0FBQztRQUN0QixNQUFNQyxXQUFXQyxTQUFTQyxXQUFXLENBQUU7UUFFdkMsb0dBQW9HO1FBQ3BHRixTQUFTRyxjQUFjLENBQUUsYUFBYSxNQUFNLE1BQU1DLFFBQVEsR0FDeEROLEdBQUdDLEdBQUdELEdBQUdDLEdBQ1QsT0FBTyxPQUFPLE9BQU8sT0FDckIsR0FDQTtRQUVGRixRQUFRUSxNQUFNLENBQUNDLGdCQUFnQjtRQUMvQlQsUUFBUVEsTUFBTSxDQUFDVCxTQUFTLENBQUUsTUFBTSxJQUFJTixRQUFTUSxHQUFHQyxJQUFLLElBQUlQLGFBQWNRO0lBQ3pFO0lBRUE7Ozs7Ozs7R0FPQyxHQUNETyxTQUFTVixPQUFPLEVBQUVDLENBQUMsRUFBRUMsQ0FBQztRQUNwQixNQUFNQyxXQUFXQyxTQUFTQyxXQUFXLENBQUU7UUFFdkMsb0dBQW9HO1FBQ3BHRixTQUFTRyxjQUFjLENBQUUsV0FBVyxNQUFNLE1BQU1DLFFBQVEsR0FDdEROLEdBQUdDLEdBQUdELEdBQUdDLEdBQ1QsT0FBTyxPQUFPLE9BQU8sT0FDckIsR0FDQTtRQUVGRixRQUFRUSxNQUFNLENBQUNDLGdCQUFnQjtRQUMvQlQsUUFBUVEsTUFBTSxDQUFDRSxPQUFPLENBQUUsSUFBSWpCLFFBQVNRLEdBQUdDLElBQUssSUFBSVAsYUFBY1E7SUFDakU7SUFFQTs7Ozs7OztHQU9DLEdBQ0RRLFdBQVdYLE9BQU8sRUFBRUMsQ0FBQyxFQUFFQyxDQUFDO1FBQ3RCLE1BQU1DLFdBQVdDLFNBQVNDLFdBQVcsQ0FBRTtRQUV2QyxvR0FBb0c7UUFDcEdGLFNBQVNHLGNBQWMsQ0FBRSxhQUFhLE1BQU0sTUFBTUMsUUFBUSxHQUN4RE4sR0FBR0MsR0FBR0QsR0FBR0MsR0FDVCxPQUFPLE9BQU8sT0FBTyxPQUNyQixHQUNBO1FBR0ZGLFFBQVFRLE1BQU0sQ0FBQ0MsZ0JBQWdCO1FBQy9CVCxRQUFRUSxNQUFNLENBQUNHLFNBQVMsQ0FBRSxJQUFJbEIsUUFBU1EsR0FBR0MsSUFBSyxJQUFJUCxhQUFjUTtJQUNuRTtJQUVBOzs7OztHQUtDLEdBQ0RTLHFCQUFxQkMsUUFBUTtRQUMzQixNQUFNQyxPQUFPLElBQUlsQjtRQUNqQixNQUFNSSxVQUFVLElBQUlOLFFBQVNvQixNQUFNO1lBQUVDLE9BQU87WUFBS0MsUUFBUTtRQUFJO1FBQzdEaEIsUUFBUWlCLGdCQUFnQjtRQUN4QmpCLFFBQVFrQixhQUFhO1FBRXJCLE1BQU1DLE9BQU8sSUFBSXRCLFVBQVcsR0FBRyxHQUFHLElBQUksSUFBSTtZQUFFdUIsTUFBTTtRQUFNO1FBQ3hETixLQUFLTyxRQUFRLENBQUVGO1FBRWZOLFNBQVViLFNBQVNtQixNQUFNTDtRQUV6Qiw2Q0FBNkM7UUFDN0NkLFFBQVFzQixPQUFPO0lBQ2pCO0FBQ0Y7QUFFQSxlQUFleEIsa0JBQWtCIn0=