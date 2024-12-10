// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for BicyclePumpNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import BicyclePumpNode from '../../BicyclePumpNode.js';
import ResetButton from '../../buttons/ResetButton.js';
import PhetFont from '../../PhetFont.js';
export default function demoBicyclePumpNode(layoutBounds) {
    const numberOfParticlesProperty = new NumberProperty(0, {
        numberType: 'Integer',
        range: new Range(0, 100)
    });
    const rangeProperty = new Property(numberOfParticlesProperty.range);
    const bicyclePumpNode = new BicyclePumpNode(numberOfParticlesProperty, rangeProperty, {
        hoseAttachmentOffset: new Vector2(100, -100)
    });
    // Displays the number of particles, positioned next to the hose output
    const displayNode = new Text(numberOfParticlesProperty.value, {
        font: new PhetFont(24),
        left: bicyclePumpNode.x + bicyclePumpNode.hoseAttachmentOffset.x + 20,
        centerY: bicyclePumpNode.y + bicyclePumpNode.hoseAttachmentOffset.y
    });
    numberOfParticlesProperty.link((numberOfParticles)=>{
        displayNode.string = numberOfParticles;
    });
    const resetButton = new ResetButton({
        listener: ()=>{
            numberOfParticlesProperty.reset();
            bicyclePumpNode.reset();
        },
        scale: 0.75,
        centerX: bicyclePumpNode.x,
        top: bicyclePumpNode.bottom + 20
    });
    return new Node({
        children: [
            bicyclePumpNode,
            displayNode,
            resetButton
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0JpY3ljbGVQdW1wTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBCaWN5Y2xlUHVtcE5vZGVcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQmljeWNsZVB1bXBOb2RlIGZyb20gJy4uLy4uL0JpY3ljbGVQdW1wTm9kZS5qcyc7XG5pbXBvcnQgUmVzZXRCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9SZXNldEJ1dHRvbi5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vQmljeWNsZVB1bXBOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcbiAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAgKVxuICB9ICk7XG5cbiAgY29uc3QgcmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVtYmVyT2ZQYXJ0aWNsZXNQcm9wZXJ0eS5yYW5nZSApO1xuXG4gIGNvbnN0IGJpY3ljbGVQdW1wTm9kZSA9IG5ldyBCaWN5Y2xlUHVtcE5vZGUoIG51bWJlck9mUGFydGljbGVzUHJvcGVydHksIHJhbmdlUHJvcGVydHksIHtcbiAgICBob3NlQXR0YWNobWVudE9mZnNldDogbmV3IFZlY3RvcjIoIDEwMCwgLTEwMCApXG4gIH0gKTtcblxuICAvLyBEaXNwbGF5cyB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcywgcG9zaXRpb25lZCBuZXh0IHRvIHRoZSBob3NlIG91dHB1dFxuICBjb25zdCBkaXNwbGF5Tm9kZSA9IG5ldyBUZXh0KCBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LnZhbHVlLCB7XG4gICAgZm9udDogbmV3IFBoZXRGb250KCAyNCApLFxuICAgIGxlZnQ6IGJpY3ljbGVQdW1wTm9kZS54ICsgYmljeWNsZVB1bXBOb2RlLmhvc2VBdHRhY2htZW50T2Zmc2V0LnggKyAyMCxcbiAgICBjZW50ZXJZOiBiaWN5Y2xlUHVtcE5vZGUueSArIGJpY3ljbGVQdW1wTm9kZS5ob3NlQXR0YWNobWVudE9mZnNldC55XG4gIH0gKTtcblxuICBudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5LmxpbmsoIG51bWJlck9mUGFydGljbGVzID0+IHtcbiAgICBkaXNwbGF5Tm9kZS5zdHJpbmcgPSBudW1iZXJPZlBhcnRpY2xlcztcbiAgfSApO1xuXG4gIGNvbnN0IHJlc2V0QnV0dG9uID0gbmV3IFJlc2V0QnV0dG9uKCB7XG4gICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgIG51bWJlck9mUGFydGljbGVzUHJvcGVydHkucmVzZXQoKTtcbiAgICAgIGJpY3ljbGVQdW1wTm9kZS5yZXNldCgpO1xuICAgIH0sXG4gICAgc2NhbGU6IDAuNzUsXG4gICAgY2VudGVyWDogYmljeWNsZVB1bXBOb2RlLngsXG4gICAgdG9wOiBiaWN5Y2xlUHVtcE5vZGUuYm90dG9tICsgMjBcbiAgfSApO1xuXG4gIHJldHVybiBuZXcgTm9kZSgge1xuICAgIGNoaWxkcmVuOiBbIGJpY3ljbGVQdW1wTm9kZSwgZGlzcGxheU5vZGUsIHJlc2V0QnV0dG9uIF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIk5vZGUiLCJUZXh0IiwiQmljeWNsZVB1bXBOb2RlIiwiUmVzZXRCdXR0b24iLCJQaGV0Rm9udCIsImRlbW9CaWN5Y2xlUHVtcE5vZGUiLCJsYXlvdXRCb3VuZHMiLCJudW1iZXJPZlBhcnRpY2xlc1Byb3BlcnR5IiwibnVtYmVyVHlwZSIsInJhbmdlIiwicmFuZ2VQcm9wZXJ0eSIsImJpY3ljbGVQdW1wTm9kZSIsImhvc2VBdHRhY2htZW50T2Zmc2V0IiwiZGlzcGxheU5vZGUiLCJ2YWx1ZSIsImZvbnQiLCJsZWZ0IiwieCIsImNlbnRlclkiLCJ5IiwibGluayIsIm51bWJlck9mUGFydGljbGVzIiwic3RyaW5nIiwicmVzZXRCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0Iiwic2NhbGUiLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwiY2hpbGRyZW4iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUNuRSxPQUFPQyxjQUFjLGtDQUFrQztBQUV2RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDL0QsT0FBT0MscUJBQXFCLDJCQUEyQjtBQUN2RCxPQUFPQyxpQkFBaUIsK0JBQStCO0FBQ3ZELE9BQU9DLGNBQWMsb0JBQW9CO0FBRXpDLGVBQWUsU0FBU0Msb0JBQXFCQyxZQUFxQjtJQUVoRSxNQUFNQyw0QkFBNEIsSUFBSVgsZUFBZ0IsR0FBRztRQUN2RFksWUFBWTtRQUNaQyxPQUFPLElBQUlYLE1BQU8sR0FBRztJQUN2QjtJQUVBLE1BQU1ZLGdCQUFnQixJQUFJYixTQUFVVSwwQkFBMEJFLEtBQUs7SUFFbkUsTUFBTUUsa0JBQWtCLElBQUlULGdCQUFpQkssMkJBQTJCRyxlQUFlO1FBQ3JGRSxzQkFBc0IsSUFBSWIsUUFBUyxLQUFLLENBQUM7SUFDM0M7SUFFQSx1RUFBdUU7SUFDdkUsTUFBTWMsY0FBYyxJQUFJWixLQUFNTSwwQkFBMEJPLEtBQUssRUFBRTtRQUM3REMsTUFBTSxJQUFJWCxTQUFVO1FBQ3BCWSxNQUFNTCxnQkFBZ0JNLENBQUMsR0FBR04sZ0JBQWdCQyxvQkFBb0IsQ0FBQ0ssQ0FBQyxHQUFHO1FBQ25FQyxTQUFTUCxnQkFBZ0JRLENBQUMsR0FBR1IsZ0JBQWdCQyxvQkFBb0IsQ0FBQ08sQ0FBQztJQUNyRTtJQUVBWiwwQkFBMEJhLElBQUksQ0FBRUMsQ0FBQUE7UUFDOUJSLFlBQVlTLE1BQU0sR0FBR0Q7SUFDdkI7SUFFQSxNQUFNRSxjQUFjLElBQUlwQixZQUFhO1FBQ25DcUIsVUFBVTtZQUNSakIsMEJBQTBCa0IsS0FBSztZQUMvQmQsZ0JBQWdCYyxLQUFLO1FBQ3ZCO1FBQ0FDLE9BQU87UUFDUEMsU0FBU2hCLGdCQUFnQk0sQ0FBQztRQUMxQlcsS0FBS2pCLGdCQUFnQmtCLE1BQU0sR0FBRztJQUNoQztJQUVBLE9BQU8sSUFBSTdCLEtBQU07UUFDZjhCLFVBQVU7WUFBRW5CO1lBQWlCRTtZQUFhVTtTQUFhO1FBQ3ZEUSxRQUFRekIsYUFBYXlCLE1BQU07SUFDN0I7QUFDRiJ9