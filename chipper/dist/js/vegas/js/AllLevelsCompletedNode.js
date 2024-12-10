// Copyright 2018-2022, University of Colorado Boulder
/**
 * AllLevelsCompletedNode is a pseudo-dialog shown when all game levels have been completed.
 *
 * @author Jonathan Olson
 */ import optionize from '../../phet-core/js/optionize.js';
import FaceNode from '../../scenery-phet/js/FaceNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Node, RichText, Text, VBox } from '../../scenery/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Panel from '../../sun/js/Panel.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
let AllLevelsCompletedNode = class AllLevelsCompletedNode extends Node {
    /**
   * @param listener function that gets called when 'next' button is pressed
   * @param providedOptions
   */ constructor(listener, providedOptions){
        super();
        const options = optionize()({
            // SelfOptions
            faceDiameter: 160,
            maxTextWidth: 300
        }, providedOptions);
        // create the smiley face
        const faceNode = new FaceNode(options.faceDiameter);
        // create the dialog text
        const textMessage = new RichText(VegasStrings.youCompletedAllLevelsStringProperty, {
            font: new PhetFont(25),
            lineWrap: 300,
            maxWidth: options.maxTextWidth,
            maxHeight: 300
        });
        // create the button
        const button = new RectangularPushButton({
            content: new Text(VegasStrings.doneStringProperty, {
                font: new PhetFont(30),
                maxWidth: options.maxTextWidth
            }),
            listener: listener,
            baseColor: 'yellow'
        });
        // add the main background panel
        this.addChild(new Panel(new VBox({
            children: [
                faceNode,
                textMessage,
                button
            ],
            spacing: 20
        }), {
            xMargin: 50,
            yMargin: 20
        }));
        this.mutate(options);
    }
};
export { AllLevelsCompletedNode as default };
vegas.register('AllLevelsCompletedNode', AllLevelsCompletedNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0FsbExldmVsc0NvbXBsZXRlZE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQWxsTGV2ZWxzQ29tcGxldGVkTm9kZSBpcyBhIHBzZXVkby1kaWFsb2cgc2hvd24gd2hlbiBhbGwgZ2FtZSBsZXZlbHMgaGF2ZSBiZWVuIGNvbXBsZXRlZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmljaFRleHQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgUHVzaEJ1dHRvbkxpc3RlbmVyIH0gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUHVzaEJ1dHRvbk1vZGVsLmpzJztcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xuaW1wb3J0IFZlZ2FzU3RyaW5ncyBmcm9tICcuL1ZlZ2FzU3RyaW5ncy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8gZGlhbWV0ZXIgb2YgdGhlIHNtaWxleSBmYWNlXG4gIGZhY2VEaWFtZXRlcj86IG51bWJlcjtcblxuICAvLyBDb250cm9scyB0aGUgd2lkdGggb2YgdGhlIG1haW4gbWVzc2FnZSBhbmQgdGhlIHRleHQgaW4gdGhlIGJ1dHRvblxuICBtYXhUZXh0V2lkdGg/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgdHlwZSBBbGxMZXZlbHNDb21wbGV0ZWROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFsbExldmVsc0NvbXBsZXRlZE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgd2hlbiAnbmV4dCcgYnV0dG9uIGlzIHByZXNzZWRcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsaXN0ZW5lcjogUHVzaEJ1dHRvbkxpc3RlbmVyLCBwcm92aWRlZE9wdGlvbnM/OiBBbGxMZXZlbHNDb21wbGV0ZWROb2RlT3B0aW9ucyApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBbGxMZXZlbHNDb21wbGV0ZWROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBmYWNlRGlhbWV0ZXI6IDE2MCxcbiAgICAgIG1heFRleHRXaWR0aDogMzAwXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIHNtaWxleSBmYWNlXG4gICAgY29uc3QgZmFjZU5vZGUgPSBuZXcgRmFjZU5vZGUoIG9wdGlvbnMuZmFjZURpYW1ldGVyICk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGRpYWxvZyB0ZXh0XG4gICAgY29uc3QgdGV4dE1lc3NhZ2UgPSBuZXcgUmljaFRleHQoIFZlZ2FzU3RyaW5ncy55b3VDb21wbGV0ZWRBbGxMZXZlbHNTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyNSApLFxuICAgICAgbGluZVdyYXA6IDMwMCxcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heFRleHRXaWR0aCxcbiAgICAgIG1heEhlaWdodDogMzAwXG4gICAgfSApO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBidXR0b25cbiAgICBjb25zdCBidXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggVmVnYXNTdHJpbmdzLmRvbmVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDMwICksXG4gICAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heFRleHRXaWR0aFxuICAgICAgfSApLFxuICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgYmFzZUNvbG9yOiAneWVsbG93J1xuICAgIH0gKTtcblxuICAgIC8vIGFkZCB0aGUgbWFpbiBiYWNrZ3JvdW5kIHBhbmVsXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhbmVsKFxuICAgICAgbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgZmFjZU5vZGUsIHRleHRNZXNzYWdlLCBidXR0b24gXSwgc3BhY2luZzogMjAgfSApLFxuICAgICAgeyB4TWFyZ2luOiA1MCwgeU1hcmdpbjogMjAgfVxuICAgICkgKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cbn1cblxudmVnYXMucmVnaXN0ZXIoICdBbGxMZXZlbHNDb21wbGV0ZWROb2RlJywgQWxsTGV2ZWxzQ29tcGxldGVkTm9kZSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJGYWNlTm9kZSIsIlBoZXRGb250IiwiTm9kZSIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJQYW5lbCIsInZlZ2FzIiwiVmVnYXNTdHJpbmdzIiwiQWxsTGV2ZWxzQ29tcGxldGVkTm9kZSIsImxpc3RlbmVyIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZhY2VEaWFtZXRlciIsIm1heFRleHRXaWR0aCIsImZhY2VOb2RlIiwidGV4dE1lc3NhZ2UiLCJ5b3VDb21wbGV0ZWRBbGxMZXZlbHNTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJsaW5lV3JhcCIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiYnV0dG9uIiwiY29udGVudCIsImRvbmVTdHJpbmdQcm9wZXJ0eSIsImJhc2VDb2xvciIsImFkZENoaWxkIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwieE1hcmdpbiIsInlNYXJnaW4iLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxTQUFTQyxJQUFJLEVBQWVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsOEJBQThCO0FBRXRGLE9BQU9DLDJCQUEyQixnREFBZ0Q7QUFDbEYsT0FBT0MsV0FBVyx3QkFBd0I7QUFDMUMsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFhOUIsSUFBQSxBQUFNQyx5QkFBTixNQUFNQSwrQkFBK0JSO0lBRWxEOzs7R0FHQyxHQUNELFlBQW9CUyxRQUE0QixFQUFFQyxlQUErQyxDQUFHO1FBQ2xHLEtBQUs7UUFFTCxNQUFNQyxVQUFVZCxZQUFzRTtZQUVwRixjQUFjO1lBQ2RlLGNBQWM7WUFDZEMsY0FBYztRQUNoQixHQUFHSDtRQUVILHlCQUF5QjtRQUN6QixNQUFNSSxXQUFXLElBQUloQixTQUFVYSxRQUFRQyxZQUFZO1FBRW5ELHlCQUF5QjtRQUN6QixNQUFNRyxjQUFjLElBQUlkLFNBQVVNLGFBQWFTLG1DQUFtQyxFQUFFO1lBQ2xGQyxNQUFNLElBQUlsQixTQUFVO1lBQ3BCbUIsVUFBVTtZQUNWQyxVQUFVUixRQUFRRSxZQUFZO1lBQzlCTyxXQUFXO1FBQ2I7UUFFQSxvQkFBb0I7UUFDcEIsTUFBTUMsU0FBUyxJQUFJakIsc0JBQXVCO1lBQ3hDa0IsU0FBUyxJQUFJcEIsS0FBTUssYUFBYWdCLGtCQUFrQixFQUFFO2dCQUNsRE4sTUFBTSxJQUFJbEIsU0FBVTtnQkFDcEJvQixVQUFVUixRQUFRRSxZQUFZO1lBQ2hDO1lBQ0FKLFVBQVVBO1lBQ1ZlLFdBQVc7UUFDYjtRQUVBLGdDQUFnQztRQUNoQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxJQUFJcEIsTUFDakIsSUFBSUYsS0FBTTtZQUFFdUIsVUFBVTtnQkFBRVo7Z0JBQVVDO2dCQUFhTTthQUFRO1lBQUVNLFNBQVM7UUFBRyxJQUNyRTtZQUFFQyxTQUFTO1lBQUlDLFNBQVM7UUFBRztRQUc3QixJQUFJLENBQUNDLE1BQU0sQ0FBRW5CO0lBQ2Y7QUFDRjtBQTdDQSxTQUFxQkgsb0NBNkNwQjtBQUVERixNQUFNeUIsUUFBUSxDQUFFLDBCQUEwQnZCIn0=