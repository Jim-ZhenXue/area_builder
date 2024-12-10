// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for BracketNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Text } from '../../../../scenery/js/imports.js';
import BracketNode from '../../BracketNode.js';
import PhetFont from '../../PhetFont.js';
export default function demoBracketNode(layoutBounds) {
    return new BracketNode({
        orientation: 'left',
        bracketTipPosition: 0.75,
        labelNode: new Text('bracket', {
            font: new PhetFont(20)
        }),
        spacing: 10,
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0JyYWNrZXROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIEJyYWNrZXROb2RlXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBCcmFja2V0Tm9kZSBmcm9tICcuLi8uLi9CcmFja2V0Tm9kZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vQnJhY2tldE5vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcbiAgcmV0dXJuIG5ldyBCcmFja2V0Tm9kZSgge1xuICAgIG9yaWVudGF0aW9uOiAnbGVmdCcsXG4gICAgYnJhY2tldFRpcFBvc2l0aW9uOiAwLjc1LFxuICAgIGxhYmVsTm9kZTogbmV3IFRleHQoICdicmFja2V0JywgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApLFxuICAgIHNwYWNpbmc6IDEwLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIlRleHQiLCJCcmFja2V0Tm9kZSIsIlBoZXRGb250IiwiZGVtb0JyYWNrZXROb2RlIiwibGF5b3V0Qm91bmRzIiwib3JpZW50YXRpb24iLCJicmFja2V0VGlwUG9zaXRpb24iLCJsYWJlbE5vZGUiLCJmb250Iiwic3BhY2luZyIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxTQUFlQSxJQUFJLFFBQVEsb0NBQW9DO0FBQy9ELE9BQU9DLGlCQUFpQix1QkFBdUI7QUFDL0MsT0FBT0MsY0FBYyxvQkFBb0I7QUFFekMsZUFBZSxTQUFTQyxnQkFBaUJDLFlBQXFCO0lBQzVELE9BQU8sSUFBSUgsWUFBYTtRQUN0QkksYUFBYTtRQUNiQyxvQkFBb0I7UUFDcEJDLFdBQVcsSUFBSVAsS0FBTSxXQUFXO1lBQUVRLE1BQU0sSUFBSU4sU0FBVTtRQUFLO1FBQzNETyxTQUFTO1FBQ1RDLFFBQVFOLGFBQWFNLE1BQU07SUFDN0I7QUFDRiJ9