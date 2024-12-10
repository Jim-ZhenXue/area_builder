// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for Drawer
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Drawer from '../../Drawer.js';
import PhetFont from '../../PhetFont.js';
export default function demoDrawer(layoutBounds) {
    const rectangle = new Rectangle(0, 0, 400, 50, {
        fill: 'gray',
        stroke: 'black',
        cornerRadius: 10
    });
    const textNode = new Text('Hello Drawer!', {
        font: new PhetFont(40),
        fill: 'red'
    });
    const drawer = new Drawer(textNode, {
        handlePosition: 'bottom',
        open: false,
        xMargin: 30,
        yMargin: 20,
        centerX: rectangle.centerX,
        top: rectangle.bottom - 1
    });
    return new Node({
        children: [
            drawer,
            rectangle
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0RyYXdlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBEcmF3ZXJcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgRHJhd2VyIGZyb20gJy4uLy4uL0RyYXdlci5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vRHJhd2VyKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgcmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgNDAwLCA1MCwge1xuICAgIGZpbGw6ICdncmF5JyxcbiAgICBzdHJva2U6ICdibGFjaycsXG4gICAgY29ybmVyUmFkaXVzOiAxMFxuICB9ICk7XG5cbiAgY29uc3QgdGV4dE5vZGUgPSBuZXcgVGV4dCggJ0hlbGxvIERyYXdlciEnLCB7XG4gICAgZm9udDogbmV3IFBoZXRGb250KCA0MCApLFxuICAgIGZpbGw6ICdyZWQnXG4gIH0gKTtcblxuICBjb25zdCBkcmF3ZXIgPSBuZXcgRHJhd2VyKCB0ZXh0Tm9kZSwge1xuICAgIGhhbmRsZVBvc2l0aW9uOiAnYm90dG9tJyxcbiAgICBvcGVuOiBmYWxzZSxcbiAgICB4TWFyZ2luOiAzMCxcbiAgICB5TWFyZ2luOiAyMCxcbiAgICBjZW50ZXJYOiByZWN0YW5nbGUuY2VudGVyWCxcbiAgICB0b3A6IHJlY3RhbmdsZS5ib3R0b20gLSAxXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyBkcmF3ZXIsIHJlY3RhbmdsZSBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiRHJhd2VyIiwiUGhldEZvbnQiLCJkZW1vRHJhd2VyIiwibGF5b3V0Qm91bmRzIiwicmVjdGFuZ2xlIiwiZmlsbCIsInN0cm9rZSIsImNvcm5lclJhZGl1cyIsInRleHROb2RlIiwiZm9udCIsImRyYXdlciIsImhhbmRsZVBvc2l0aW9uIiwib3BlbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQzFFLE9BQU9DLFlBQVksa0JBQWtCO0FBQ3JDLE9BQU9DLGNBQWMsb0JBQW9CO0FBRXpDLGVBQWUsU0FBU0MsV0FBWUMsWUFBcUI7SUFFdkQsTUFBTUMsWUFBWSxJQUFJTixVQUFXLEdBQUcsR0FBRyxLQUFLLElBQUk7UUFDOUNPLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxjQUFjO0lBQ2hCO0lBRUEsTUFBTUMsV0FBVyxJQUFJVCxLQUFNLGlCQUFpQjtRQUMxQ1UsTUFBTSxJQUFJUixTQUFVO1FBQ3BCSSxNQUFNO0lBQ1I7SUFFQSxNQUFNSyxTQUFTLElBQUlWLE9BQVFRLFVBQVU7UUFDbkNHLGdCQUFnQjtRQUNoQkMsTUFBTTtRQUNOQyxTQUFTO1FBQ1RDLFNBQVM7UUFDVEMsU0FBU1gsVUFBVVcsT0FBTztRQUMxQkMsS0FBS1osVUFBVWEsTUFBTSxHQUFHO0lBQzFCO0lBRUEsT0FBTyxJQUFJcEIsS0FBTTtRQUNmcUIsVUFBVTtZQUFFUjtZQUFRTjtTQUFXO1FBQy9CZSxRQUFRaEIsYUFBYWdCLE1BQU07SUFDN0I7QUFDRiJ9