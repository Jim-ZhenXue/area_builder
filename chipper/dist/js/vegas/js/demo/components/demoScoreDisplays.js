// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for various score displays.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import ScoreDisplayLabeledNumber from '../../ScoreDisplayLabeledNumber.js';
import ScoreDisplayLabeledStars from '../../ScoreDisplayLabeledStars.js';
import ScoreDisplayNumberAndStar from '../../ScoreDisplayNumberAndStar.js';
import ScoreDisplayStars from '../../ScoreDisplayStars.js';
import VegasStrings from '../../VegasStrings.js';
const NUM_STARS = 5;
export default function demoScoreDisplays(layoutBounds) {
    const scoreProperty = new NumberProperty(0, {
        range: new Range(0, 1000)
    });
    // Various options for displaying score.
    const scoreDisplays = new VBox({
        resize: false,
        spacing: 50,
        align: 'left',
        centerX: layoutBounds.centerX,
        top: layoutBounds.top + 20,
        children: [
            new ScoreDisplayStars(scoreProperty, {
                numberOfStars: NUM_STARS,
                perfectScore: scoreProperty.range.max
            }),
            new ScoreDisplayLabeledStars(scoreProperty, {
                numberOfStars: NUM_STARS,
                perfectScore: scoreProperty.range.max
            }),
            new ScoreDisplayNumberAndStar(scoreProperty),
            new ScoreDisplayLabeledNumber(scoreProperty)
        ]
    });
    const scoreSlider = new HBox({
        spacing: 8,
        children: [
            new Text(VegasStrings.scoreStringProperty, {
                font: new PhetFont(20)
            }),
            new HSlider(scoreProperty, scoreProperty.range)
        ]
    });
    return new VBox({
        spacing: 50,
        align: 'left',
        children: [
            scoreDisplays,
            scoreSlider
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9kZW1vU2NvcmVEaXNwbGF5cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciB2YXJpb3VzIHNjb3JlIGRpc3BsYXlzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgZnJvbSAnLi4vLi4vU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlci5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5TGFiZWxlZFN0YXJzIGZyb20gJy4uLy4uL1Njb3JlRGlzcGxheUxhYmVsZWRTdGFycy5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhciBmcm9tICcuLi8uLi9TY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLmpzJztcbmltcG9ydCBTY29yZURpc3BsYXlTdGFycyBmcm9tICcuLi8uLi9TY29yZURpc3BsYXlTdGFycy5qcyc7XG5pbXBvcnQgVmVnYXNTdHJpbmdzIGZyb20gJy4uLy4uL1ZlZ2FzU3RyaW5ncy5qcyc7XG5cbmNvbnN0IE5VTV9TVEFSUyA9IDU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9TY29yZURpc3BsYXlzKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3Qgc2NvcmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEwMDAgKVxuICB9ICk7XG5cbiAgLy8gVmFyaW91cyBvcHRpb25zIGZvciBkaXNwbGF5aW5nIHNjb3JlLlxuICBjb25zdCBzY29yZURpc3BsYXlzID0gbmV3IFZCb3goIHtcbiAgICByZXNpemU6IGZhbHNlLFxuICAgIHNwYWNpbmc6IDUwLFxuICAgIGFsaWduOiAnbGVmdCcsXG4gICAgY2VudGVyWDogbGF5b3V0Qm91bmRzLmNlbnRlclgsXG4gICAgdG9wOiBsYXlvdXRCb3VuZHMudG9wICsgMjAsXG4gICAgY2hpbGRyZW46IFtcbiAgICAgIG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwgeyBudW1iZXJPZlN0YXJzOiBOVU1fU1RBUlMsIHBlcmZlY3RTY29yZTogc2NvcmVQcm9wZXJ0eS5yYW5nZS5tYXggfSApLFxuICAgICAgbmV3IFNjb3JlRGlzcGxheUxhYmVsZWRTdGFycyggc2NvcmVQcm9wZXJ0eSwgeyBudW1iZXJPZlN0YXJzOiBOVU1fU1RBUlMsIHBlcmZlY3RTY29yZTogc2NvcmVQcm9wZXJ0eS5yYW5nZS5tYXggfSApLFxuICAgICAgbmV3IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIoIHNjb3JlUHJvcGVydHkgKSxcbiAgICAgIG5ldyBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyKCBzY29yZVByb3BlcnR5IClcbiAgICBdXG4gIH0gKTtcblxuICBjb25zdCBzY29yZVNsaWRlciA9IG5ldyBIQm94KCB7XG4gICAgc3BhY2luZzogOCxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IFRleHQoIFZlZ2FzU3RyaW5ncy5zY29yZVN0cmluZ1Byb3BlcnR5LCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICksXG4gICAgICBuZXcgSFNsaWRlciggc2NvcmVQcm9wZXJ0eSwgc2NvcmVQcm9wZXJ0eS5yYW5nZSApXG4gICAgXVxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgc3BhY2luZzogNTAsXG4gICAgYWxpZ246ICdsZWZ0JyxcbiAgICBjaGlsZHJlbjogWyBzY29yZURpc3BsYXlzLCBzY29yZVNsaWRlciBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59Il0sIm5hbWVzIjpbIk51bWJlclByb3BlcnR5IiwiUmFuZ2UiLCJQaGV0Rm9udCIsIkhCb3giLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyIiwiU2NvcmVEaXNwbGF5TGFiZWxlZFN0YXJzIiwiU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhciIsIlNjb3JlRGlzcGxheVN0YXJzIiwiVmVnYXNTdHJpbmdzIiwiTlVNX1NUQVJTIiwiZGVtb1Njb3JlRGlzcGxheXMiLCJsYXlvdXRCb3VuZHMiLCJzY29yZVByb3BlcnR5IiwicmFuZ2UiLCJzY29yZURpc3BsYXlzIiwicmVzaXplIiwic3BhY2luZyIsImFsaWduIiwiY2VudGVyWCIsInRvcCIsImNoaWxkcmVuIiwibnVtYmVyT2ZTdGFycyIsInBlcmZlY3RTY29yZSIsIm1heCIsInNjb3JlU2xpZGVyIiwic2NvcmVTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUVuRSxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxjQUFjLDBDQUEwQztBQUMvRCxTQUFTQyxJQUFJLEVBQVFDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMzRSxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQywrQkFBK0IscUNBQXFDO0FBQzNFLE9BQU9DLDhCQUE4QixvQ0FBb0M7QUFDekUsT0FBT0MsK0JBQStCLHFDQUFxQztBQUMzRSxPQUFPQyx1QkFBdUIsNkJBQTZCO0FBQzNELE9BQU9DLGtCQUFrQix3QkFBd0I7QUFFakQsTUFBTUMsWUFBWTtBQUVsQixlQUFlLFNBQVNDLGtCQUFtQkMsWUFBcUI7SUFFOUQsTUFBTUMsZ0JBQWdCLElBQUlmLGVBQWdCLEdBQUc7UUFDM0NnQixPQUFPLElBQUlmLE1BQU8sR0FBRztJQUN2QjtJQUVBLHdDQUF3QztJQUN4QyxNQUFNZ0IsZ0JBQWdCLElBQUlaLEtBQU07UUFDOUJhLFFBQVE7UUFDUkMsU0FBUztRQUNUQyxPQUFPO1FBQ1BDLFNBQVNQLGFBQWFPLE9BQU87UUFDN0JDLEtBQUtSLGFBQWFRLEdBQUcsR0FBRztRQUN4QkMsVUFBVTtZQUNSLElBQUliLGtCQUFtQkssZUFBZTtnQkFBRVMsZUFBZVo7Z0JBQVdhLGNBQWNWLGNBQWNDLEtBQUssQ0FBQ1UsR0FBRztZQUFDO1lBQ3hHLElBQUlsQix5QkFBMEJPLGVBQWU7Z0JBQUVTLGVBQWVaO2dCQUFXYSxjQUFjVixjQUFjQyxLQUFLLENBQUNVLEdBQUc7WUFBQztZQUMvRyxJQUFJakIsMEJBQTJCTTtZQUMvQixJQUFJUiwwQkFBMkJRO1NBQ2hDO0lBQ0g7SUFFQSxNQUFNWSxjQUFjLElBQUl4QixLQUFNO1FBQzVCZ0IsU0FBUztRQUNUSSxVQUFVO1lBQ1IsSUFBSW5CLEtBQU1PLGFBQWFpQixtQkFBbUIsRUFBRTtnQkFBRUMsTUFBTSxJQUFJM0IsU0FBVTtZQUFLO1lBQ3ZFLElBQUlJLFFBQVNTLGVBQWVBLGNBQWNDLEtBQUs7U0FDaEQ7SUFDSDtJQUVBLE9BQU8sSUFBSVgsS0FBTTtRQUNmYyxTQUFTO1FBQ1RDLE9BQU87UUFDUEcsVUFBVTtZQUFFTjtZQUFlVTtTQUFhO1FBQ3hDRyxRQUFRaEIsYUFBYWdCLE1BQU07SUFDN0I7QUFDRiJ9