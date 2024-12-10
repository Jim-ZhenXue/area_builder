// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ArrowNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import ArrowNode from '../../ArrowNode.js';
import PhetFont from '../../PhetFont.js';
export default function demoArrowNode(layoutBounds) {
    const arrowNode = new ArrowNode(0, 0, 200, 200, {
        headWidth: 30,
        headHeight: 30,
        center: layoutBounds.center
    });
    const checkedProperty = new Property(false);
    checkedProperty.link((checked)=>arrowNode.setDoubleHead(checked));
    const checkbox = new Checkbox(checkedProperty, new Text('Double head', {
        font: new PhetFont(20)
    }), {
        centerX: layoutBounds.centerX,
        top: arrowNode.bottom + 50
    });
    return new Node({
        children: [
            checkbox,
            arrowNode
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0Fycm93Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBBcnJvd05vZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uL0Fycm93Tm9kZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vQXJyb3dOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgYXJyb3dOb2RlID0gbmV3IEFycm93Tm9kZSggMCwgMCwgMjAwLCAyMDAsIHtcbiAgICBoZWFkV2lkdGg6IDMwLFxuICAgIGhlYWRIZWlnaHQ6IDMwLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG5cbiAgY29uc3QgY2hlY2tlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuICBjaGVja2VkUHJvcGVydHkubGluayggY2hlY2tlZCA9PiBhcnJvd05vZGUuc2V0RG91YmxlSGVhZCggY2hlY2tlZCApICk7XG5cbiAgY29uc3QgY2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGNoZWNrZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdEb3VibGUgaGVhZCcsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSwge1xuICAgIGNlbnRlclg6IGxheW91dEJvdW5kcy5jZW50ZXJYLFxuICAgIHRvcDogYXJyb3dOb2RlLmJvdHRvbSArIDUwXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogW1xuICAgICAgY2hlY2tib3gsXG4gICAgICBhcnJvd05vZGVcbiAgICBdXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiUHJvcGVydHkiLCJOb2RlIiwiVGV4dCIsIkNoZWNrYm94IiwiQXJyb3dOb2RlIiwiUGhldEZvbnQiLCJkZW1vQXJyb3dOb2RlIiwibGF5b3V0Qm91bmRzIiwiYXJyb3dOb2RlIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImNlbnRlciIsImNoZWNrZWRQcm9wZXJ0eSIsImxpbmsiLCJjaGVja2VkIiwic2V0RG91YmxlSGVhZCIsImNoZWNrYm94IiwiZm9udCIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJjaGlsZHJlbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLGtDQUFrQztBQUV2RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDL0QsT0FBT0MsY0FBYyxpQ0FBaUM7QUFDdEQsT0FBT0MsZUFBZSxxQkFBcUI7QUFDM0MsT0FBT0MsY0FBYyxvQkFBb0I7QUFFekMsZUFBZSxTQUFTQyxjQUFlQyxZQUFxQjtJQUUxRCxNQUFNQyxZQUFZLElBQUlKLFVBQVcsR0FBRyxHQUFHLEtBQUssS0FBSztRQUMvQ0ssV0FBVztRQUNYQyxZQUFZO1FBQ1pDLFFBQVFKLGFBQWFJLE1BQU07SUFDN0I7SUFFQSxNQUFNQyxrQkFBa0IsSUFBSVosU0FBVTtJQUN0Q1ksZ0JBQWdCQyxJQUFJLENBQUVDLENBQUFBLFVBQVdOLFVBQVVPLGFBQWEsQ0FBRUQ7SUFFMUQsTUFBTUUsV0FBVyxJQUFJYixTQUFVUyxpQkFBaUIsSUFBSVYsS0FBTSxlQUFlO1FBQUVlLE1BQU0sSUFBSVosU0FBVTtJQUFLLElBQUs7UUFDdkdhLFNBQVNYLGFBQWFXLE9BQU87UUFDN0JDLEtBQUtYLFVBQVVZLE1BQU0sR0FBRztJQUMxQjtJQUVBLE9BQU8sSUFBSW5CLEtBQU07UUFDZm9CLFVBQVU7WUFDUkw7WUFDQVI7U0FDRDtJQUNIO0FBQ0YifQ==