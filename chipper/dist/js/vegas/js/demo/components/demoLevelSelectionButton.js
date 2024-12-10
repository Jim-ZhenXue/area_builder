// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for LevelSelectionButton
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import LevelSelectionButton from '../../LevelSelectionButton.js';
import ScoreDisplayLabeledNumber from '../../ScoreDisplayLabeledNumber.js';
import ScoreDisplayLabeledStars from '../../ScoreDisplayLabeledStars.js';
import ScoreDisplayNumberAndStar from '../../ScoreDisplayNumberAndStar.js';
import ScoreDisplayStars from '../../ScoreDisplayStars.js';
const NUM_STARS = 5;
export default function demoLevelSelectionButton(layoutBounds) {
    const scoreRange = new Range(0, 1000);
    const scoreProperty = new NumberProperty(0, {
        range: scoreRange
    });
    // Simple icon used on all buttons
    const buttonIcon = new RichText('Level<br>1', {
        align: 'center',
        font: new PhetFont(14)
    });
    // Examples of LevelSelectionButton with various 'score display' options
    const buttonWithStars = new LevelSelectionButton(buttonIcon, scoreProperty, {
        createScoreDisplay: (scoreProperty)=>new ScoreDisplayStars(scoreProperty, {
                numberOfStars: NUM_STARS,
                perfectScore: scoreRange.max
            }),
        listener: ()=>console.log('level start')
    });
    const buttonWithLabeledStars = new LevelSelectionButton(buttonIcon, scoreProperty, {
        createScoreDisplay: (scoreProperty)=>new ScoreDisplayLabeledStars(scoreProperty, {
                numberOfStars: NUM_STARS,
                perfectScore: scoreRange.max
            }),
        listener: ()=>console.log('level start'),
        soundPlayerIndex: 1
    });
    const buttonWithNumberAndStar = new LevelSelectionButton(buttonIcon, scoreProperty, {
        createScoreDisplay: (scoreProperty)=>new ScoreDisplayNumberAndStar(scoreProperty),
        listener: ()=>console.log('level start'),
        soundPlayerIndex: 2
    });
    const buttonWithLabeledNumber = new LevelSelectionButton(buttonIcon, scoreProperty, {
        createScoreDisplay: (scoreProperty)=>new ScoreDisplayLabeledNumber(scoreProperty),
        listener: ()=>console.log('level start'),
        soundPlayerIndex: 3
    });
    const levelSelectionButtons = new HBox({
        spacing: 20,
        align: 'top',
        children: [
            buttonWithStars,
            buttonWithLabeledStars,
            buttonWithNumberAndStar,
            buttonWithLabeledNumber
        ]
    });
    const scoreSlider = new HBox({
        spacing: 10,
        children: [
            new Text('Score: ', {
                font: new PhetFont(20)
            }),
            new HSlider(scoreProperty, scoreProperty.range)
        ]
    });
    return new VBox({
        spacing: 50,
        children: [
            levelSelectionButtons,
            scoreSlider
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9kZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTGV2ZWxTZWxlY3Rpb25CdXR0b25cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBIQm94LCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XG5pbXBvcnQgTGV2ZWxTZWxlY3Rpb25CdXR0b24gZnJvbSAnLi4vLi4vTGV2ZWxTZWxlY3Rpb25CdXR0b24uanMnO1xuaW1wb3J0IFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgZnJvbSAnLi4vLi4vU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlci5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5TGFiZWxlZFN0YXJzIGZyb20gJy4uLy4uL1Njb3JlRGlzcGxheUxhYmVsZWRTdGFycy5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhciBmcm9tICcuLi8uLi9TY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyLmpzJztcbmltcG9ydCBTY29yZURpc3BsYXlTdGFycyBmcm9tICcuLi8uLi9TY29yZURpc3BsYXlTdGFycy5qcyc7XG5cbmNvbnN0IE5VTV9TVEFSUyA9IDU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbiggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGNvbnN0IHNjb3JlUmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMDAgKTtcbiAgY29uc3Qgc2NvcmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHJhbmdlOiBzY29yZVJhbmdlXG4gIH0gKTtcblxuICAvLyBTaW1wbGUgaWNvbiB1c2VkIG9uIGFsbCBidXR0b25zXG4gIGNvbnN0IGJ1dHRvbkljb24gPSBuZXcgUmljaFRleHQoICdMZXZlbDxicj4xJywge1xuICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0IClcbiAgfSApO1xuXG4gIC8vIEV4YW1wbGVzIG9mIExldmVsU2VsZWN0aW9uQnV0dG9uIHdpdGggdmFyaW91cyAnc2NvcmUgZGlzcGxheScgb3B0aW9uc1xuICBjb25zdCBidXR0b25XaXRoU3RhcnMgPSBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oIGJ1dHRvbkljb24sIHNjb3JlUHJvcGVydHksIHtcbiAgICBjcmVhdGVTY29yZURpc3BsYXk6IHNjb3JlUHJvcGVydHkgPT4gbmV3IFNjb3JlRGlzcGxheVN0YXJzKCBzY29yZVByb3BlcnR5LCB7XG4gICAgICBudW1iZXJPZlN0YXJzOiBOVU1fU1RBUlMsXG4gICAgICBwZXJmZWN0U2NvcmU6IHNjb3JlUmFuZ2UubWF4XG4gICAgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2xldmVsIHN0YXJ0JyApXG4gIH0gKTtcblxuICBjb25zdCBidXR0b25XaXRoTGFiZWxlZFN0YXJzID0gbmV3IExldmVsU2VsZWN0aW9uQnV0dG9uKCBidXR0b25JY29uLCBzY29yZVByb3BlcnR5LCB7XG4gICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlMYWJlbGVkU3RhcnMoIHNjb3JlUHJvcGVydHksIHtcbiAgICAgIG51bWJlck9mU3RhcnM6IE5VTV9TVEFSUyxcbiAgICAgIHBlcmZlY3RTY29yZTogc2NvcmVSYW5nZS5tYXhcbiAgICB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnbGV2ZWwgc3RhcnQnICksXG4gICAgc291bmRQbGF5ZXJJbmRleDogMVxuICB9ICk7XG5cbiAgY29uc3QgYnV0dG9uV2l0aE51bWJlckFuZFN0YXIgPSBuZXcgTGV2ZWxTZWxlY3Rpb25CdXR0b24oIGJ1dHRvbkljb24sIHNjb3JlUHJvcGVydHksIHtcbiAgICBjcmVhdGVTY29yZURpc3BsYXk6IHNjb3JlUHJvcGVydHkgPT4gbmV3IFNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIoIHNjb3JlUHJvcGVydHkgKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdsZXZlbCBzdGFydCcgKSxcbiAgICBzb3VuZFBsYXllckluZGV4OiAyXG4gIH0gKTtcblxuICBjb25zdCBidXR0b25XaXRoTGFiZWxlZE51bWJlciA9IG5ldyBMZXZlbFNlbGVjdGlvbkJ1dHRvbiggYnV0dG9uSWNvbiwgc2NvcmVQcm9wZXJ0eSwge1xuICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlciggc2NvcmVQcm9wZXJ0eSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2xldmVsIHN0YXJ0JyApLFxuICAgIHNvdW5kUGxheWVySW5kZXg6IDNcbiAgfSApO1xuXG4gIGNvbnN0IGxldmVsU2VsZWN0aW9uQnV0dG9ucyA9IG5ldyBIQm94KCB7XG4gICAgc3BhY2luZzogMjAsXG4gICAgYWxpZ246ICd0b3AnLFxuICAgIGNoaWxkcmVuOiBbIGJ1dHRvbldpdGhTdGFycywgYnV0dG9uV2l0aExhYmVsZWRTdGFycywgYnV0dG9uV2l0aE51bWJlckFuZFN0YXIsIGJ1dHRvbldpdGhMYWJlbGVkTnVtYmVyIF1cbiAgfSApO1xuXG4gIGNvbnN0IHNjb3JlU2xpZGVyID0gbmV3IEhCb3goIHtcbiAgICBzcGFjaW5nOiAxMCxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IFRleHQoICdTY29yZTogJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApLFxuICAgICAgbmV3IEhTbGlkZXIoIHNjb3JlUHJvcGVydHksIHNjb3JlUHJvcGVydHkucmFuZ2UgKVxuICAgIF1cbiAgfSApO1xuXG4gIHJldHVybiBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDUwLFxuICAgIGNoaWxkcmVuOiBbIGxldmVsU2VsZWN0aW9uQnV0dG9ucywgc2NvcmVTbGlkZXIgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiUGhldEZvbnQiLCJIQm94IiwiUmljaFRleHQiLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJMZXZlbFNlbGVjdGlvbkJ1dHRvbiIsIlNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIiLCJTY29yZURpc3BsYXlMYWJlbGVkU3RhcnMiLCJTY29yZURpc3BsYXlOdW1iZXJBbmRTdGFyIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJOVU1fU1RBUlMiLCJkZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b24iLCJsYXlvdXRCb3VuZHMiLCJzY29yZVJhbmdlIiwic2NvcmVQcm9wZXJ0eSIsInJhbmdlIiwiYnV0dG9uSWNvbiIsImFsaWduIiwiZm9udCIsImJ1dHRvbldpdGhTdGFycyIsImNyZWF0ZVNjb3JlRGlzcGxheSIsIm51bWJlck9mU3RhcnMiLCJwZXJmZWN0U2NvcmUiLCJtYXgiLCJsaXN0ZW5lciIsImNvbnNvbGUiLCJsb2ciLCJidXR0b25XaXRoTGFiZWxlZFN0YXJzIiwic291bmRQbGF5ZXJJbmRleCIsImJ1dHRvbldpdGhOdW1iZXJBbmRTdGFyIiwiYnV0dG9uV2l0aExhYmVsZWROdW1iZXIiLCJsZXZlbFNlbGVjdGlvbkJ1dHRvbnMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJzY29yZVNsaWRlciIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxvQkFBb0Isd0NBQXdDO0FBRW5FLE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGNBQWMsMENBQTBDO0FBQy9ELFNBQVNDLElBQUksRUFBUUMsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDckYsT0FBT0MsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsMEJBQTBCLGdDQUFnQztBQUNqRSxPQUFPQywrQkFBK0IscUNBQXFDO0FBQzNFLE9BQU9DLDhCQUE4QixvQ0FBb0M7QUFDekUsT0FBT0MsK0JBQStCLHFDQUFxQztBQUMzRSxPQUFPQyx1QkFBdUIsNkJBQTZCO0FBRTNELE1BQU1DLFlBQVk7QUFFbEIsZUFBZSxTQUFTQyx5QkFBMEJDLFlBQXFCO0lBRXJFLE1BQU1DLGFBQWEsSUFBSWYsTUFBTyxHQUFHO0lBQ2pDLE1BQU1nQixnQkFBZ0IsSUFBSWpCLGVBQWdCLEdBQUc7UUFDM0NrQixPQUFPRjtJQUNUO0lBRUEsa0NBQWtDO0lBQ2xDLE1BQU1HLGFBQWEsSUFBSWYsU0FBVSxjQUFjO1FBQzdDZ0IsT0FBTztRQUNQQyxNQUFNLElBQUluQixTQUFVO0lBQ3RCO0lBRUEsd0VBQXdFO0lBQ3hFLE1BQU1vQixrQkFBa0IsSUFBSWQscUJBQXNCVyxZQUFZRixlQUFlO1FBQzNFTSxvQkFBb0JOLENBQUFBLGdCQUFpQixJQUFJTCxrQkFBbUJLLGVBQWU7Z0JBQ3pFTyxlQUFlWDtnQkFDZlksY0FBY1QsV0FBV1UsR0FBRztZQUM5QjtRQUNBQyxVQUFVLElBQU1DLFFBQVFDLEdBQUcsQ0FBRTtJQUMvQjtJQUVBLE1BQU1DLHlCQUF5QixJQUFJdEIscUJBQXNCVyxZQUFZRixlQUFlO1FBQ2xGTSxvQkFBb0JOLENBQUFBLGdCQUFpQixJQUFJUCx5QkFBMEJPLGVBQWU7Z0JBQ2hGTyxlQUFlWDtnQkFDZlksY0FBY1QsV0FBV1UsR0FBRztZQUM5QjtRQUNBQyxVQUFVLElBQU1DLFFBQVFDLEdBQUcsQ0FBRTtRQUM3QkUsa0JBQWtCO0lBQ3BCO0lBRUEsTUFBTUMsMEJBQTBCLElBQUl4QixxQkFBc0JXLFlBQVlGLGVBQWU7UUFDbkZNLG9CQUFvQk4sQ0FBQUEsZ0JBQWlCLElBQUlOLDBCQUEyQk07UUFDcEVVLFVBQVUsSUFBTUMsUUFBUUMsR0FBRyxDQUFFO1FBQzdCRSxrQkFBa0I7SUFDcEI7SUFFQSxNQUFNRSwwQkFBMEIsSUFBSXpCLHFCQUFzQlcsWUFBWUYsZUFBZTtRQUNuRk0sb0JBQW9CTixDQUFBQSxnQkFBaUIsSUFBSVIsMEJBQTJCUTtRQUNwRVUsVUFBVSxJQUFNQyxRQUFRQyxHQUFHLENBQUU7UUFDN0JFLGtCQUFrQjtJQUNwQjtJQUVBLE1BQU1HLHdCQUF3QixJQUFJL0IsS0FBTTtRQUN0Q2dDLFNBQVM7UUFDVGYsT0FBTztRQUNQZ0IsVUFBVTtZQUFFZDtZQUFpQlE7WUFBd0JFO1lBQXlCQztTQUF5QjtJQUN6RztJQUVBLE1BQU1JLGNBQWMsSUFBSWxDLEtBQU07UUFDNUJnQyxTQUFTO1FBQ1RDLFVBQVU7WUFDUixJQUFJL0IsS0FBTSxXQUFXO2dCQUFFZ0IsTUFBTSxJQUFJbkIsU0FBVTtZQUFLO1lBQ2hELElBQUlLLFFBQVNVLGVBQWVBLGNBQWNDLEtBQUs7U0FDaEQ7SUFDSDtJQUVBLE9BQU8sSUFBSVosS0FBTTtRQUNmNkIsU0FBUztRQUNUQyxVQUFVO1lBQUVGO1lBQXVCRztTQUFhO1FBQ2hEQyxRQUFRdkIsYUFBYXVCLE1BQU07SUFDN0I7QUFDRiJ9