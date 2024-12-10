// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for LineArrowNode
 *
 * @author Chris Malley (PixelZoom, Inc).
 */ import { VBox } from '../../../../scenery/js/imports.js';
import LineArrowNode from '../../LineArrowNode.js';
export default function demoLineArrowNode(layoutBounds) {
    const lineArrowNode = new LineArrowNode(0, 0, 200, 0, {
        headWidth: 30,
        headHeight: 30,
        headLineWidth: 3,
        tailLineWidth: 3
    });
    const smoothArrowNode = new LineArrowNode(0, 0, 200, 0, {
        lineJoin: 'round',
        lineCap: 'round',
        headWidth: 30,
        headHeight: 30,
        headLineWidth: 8,
        tailLineWidth: 8
    });
    return new VBox({
        spacing: 100,
        children: [
            lineArrowNode,
            smoothArrowNode
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0xpbmVBcnJvd05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTGluZUFycm93Tm9kZVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYykuXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgTGluZUFycm93Tm9kZSBmcm9tICcuLi8uLi9MaW5lQXJyb3dOb2RlLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0xpbmVBcnJvd05vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBsaW5lQXJyb3dOb2RlID0gbmV3IExpbmVBcnJvd05vZGUoIDAsIDAsIDIwMCwgMCwge1xuICAgIGhlYWRXaWR0aDogMzAsXG4gICAgaGVhZEhlaWdodDogMzAsXG4gICAgaGVhZExpbmVXaWR0aDogMyxcbiAgICB0YWlsTGluZVdpZHRoOiAzXG4gIH0gKTtcblxuICBjb25zdCBzbW9vdGhBcnJvd05vZGUgPSBuZXcgTGluZUFycm93Tm9kZSggMCwgMCwgMjAwLCAwLCB7XG4gICAgbGluZUpvaW46ICdyb3VuZCcsXG4gICAgbGluZUNhcDogJ3JvdW5kJyxcbiAgICBoZWFkV2lkdGg6IDMwLFxuICAgIGhlYWRIZWlnaHQ6IDMwLFxuICAgIGhlYWRMaW5lV2lkdGg6IDgsXG4gICAgdGFpbExpbmVXaWR0aDogOFxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgc3BhY2luZzogMTAwLFxuICAgIGNoaWxkcmVuOiBbIGxpbmVBcnJvd05vZGUsIHNtb290aEFycm93Tm9kZSBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlZCb3giLCJMaW5lQXJyb3dOb2RlIiwiZGVtb0xpbmVBcnJvd05vZGUiLCJsYXlvdXRCb3VuZHMiLCJsaW5lQXJyb3dOb2RlIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImhlYWRMaW5lV2lkdGgiLCJ0YWlsTGluZVdpZHRoIiwic21vb3RoQXJyb3dOb2RlIiwibGluZUpvaW4iLCJsaW5lQ2FwIiwic3BhY2luZyIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQWVBLElBQUksUUFBUSxvQ0FBb0M7QUFDL0QsT0FBT0MsbUJBQW1CLHlCQUF5QjtBQUVuRCxlQUFlLFNBQVNDLGtCQUFtQkMsWUFBcUI7SUFFOUQsTUFBTUMsZ0JBQWdCLElBQUlILGNBQWUsR0FBRyxHQUFHLEtBQUssR0FBRztRQUNyREksV0FBVztRQUNYQyxZQUFZO1FBQ1pDLGVBQWU7UUFDZkMsZUFBZTtJQUNqQjtJQUVBLE1BQU1DLGtCQUFrQixJQUFJUixjQUFlLEdBQUcsR0FBRyxLQUFLLEdBQUc7UUFDdkRTLFVBQVU7UUFDVkMsU0FBUztRQUNUTixXQUFXO1FBQ1hDLFlBQVk7UUFDWkMsZUFBZTtRQUNmQyxlQUFlO0lBQ2pCO0lBRUEsT0FBTyxJQUFJUixLQUFNO1FBQ2ZZLFNBQVM7UUFDVEMsVUFBVTtZQUFFVDtZQUFlSztTQUFpQjtRQUM1Q0ssUUFBUVgsYUFBYVcsTUFBTTtJQUM3QjtBQUNGIn0=