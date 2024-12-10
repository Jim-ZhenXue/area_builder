// Copyright 2014-2024, University of Colorado Boulder
/**
 * Demonstrates UI components that typically appear in a game level that has an infinite number of challenges.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import StatusBar from '../../../scenery-phet/js/StatusBar.js';
import { HBox, Text } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import InfiniteStatusBar from '../InfiniteStatusBar.js';
import RewardDialog from '../RewardDialog.js';
import vegas from '../vegas.js';
let InfiniteChallengesScreenView = class InfiniteChallengesScreenView extends ScreenView {
    constructor(){
        super({
            tandem: Tandem.OPT_OUT
        });
        const scoreProperty = new NumberProperty(0, {
            range: new Range(0, 1000)
        });
        // bar across the top
        const messageNode = new Text('Your message goes here', {
            font: StatusBar.DEFAULT_FONT
        });
        const statusBar = new InfiniteStatusBar(this.layoutBounds, this.visibleBoundsProperty, messageNode, scoreProperty, {
            backButtonListener: ()=>console.log('back'),
            tandem: Tandem.OPT_OUT
        });
        // slider for testing score changes
        const scoreSlider = new HBox({
            right: this.layoutBounds.right - 20,
            top: statusBar.bottom + 30,
            children: [
                new Text('Score: ', {
                    font: new PhetFont(20)
                }),
                new HSlider(scoreProperty, scoreProperty.range)
            ]
        });
        const openButton = new RectangularPushButton({
            content: new Text('open RewardDialog', {
                font: new PhetFont(20)
            }),
            listener: function() {
                const rewardDialog = new RewardDialog(10, {
                    keepGoingButtonListener: ()=>{
                        console.log('Keep Going button');
                        rewardDialog.dispose();
                    },
                    newLevelButtonListener: ()=>{
                        console.log('New Level button');
                        rewardDialog.dispose();
                    }
                });
                rewardDialog.show();
            },
            center: this.layoutBounds.center
        });
        this.children = [
            statusBar,
            scoreSlider,
            openButton
        ];
    }
};
export { InfiniteChallengesScreenView as default };
vegas.register('InfiniteChallengesScreenView', InfiniteChallengesScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vSW5maW5pdGVDaGFsbGVuZ2VzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vbnN0cmF0ZXMgVUkgY29tcG9uZW50cyB0aGF0IHR5cGljYWxseSBhcHBlYXIgaW4gYSBnYW1lIGxldmVsIHRoYXQgaGFzIGFuIGluZmluaXRlIG51bWJlciBvZiBjaGFsbGVuZ2VzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IFN0YXR1c0JhciBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RhdHVzQmFyLmpzJztcbmltcG9ydCB7IEhCb3gsIFRleHQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJbmZpbml0ZVN0YXR1c0JhciBmcm9tICcuLi9JbmZpbml0ZVN0YXR1c0Jhci5qcyc7XG5pbXBvcnQgUmV3YXJkRGlhbG9nIGZyb20gJy4uL1Jld2FyZERpYWxvZy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi4vdmVnYXMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmZpbml0ZUNoYWxsZW5nZXNTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzY29yZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAwIClcbiAgICB9ICk7XG5cbiAgICAvLyBiYXIgYWNyb3NzIHRoZSB0b3BcbiAgICBjb25zdCBtZXNzYWdlTm9kZSA9IG5ldyBUZXh0KCAnWW91ciBtZXNzYWdlIGdvZXMgaGVyZScsIHtcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlRcbiAgICB9ICk7XG4gICAgY29uc3Qgc3RhdHVzQmFyID0gbmV3IEluZmluaXRlU3RhdHVzQmFyKCB0aGlzLmxheW91dEJvdW5kcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIG1lc3NhZ2VOb2RlLCBzY29yZVByb3BlcnR5LCB7XG4gICAgICBiYWNrQnV0dG9uTGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYmFjaycgKSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG5cbiAgICAvLyBzbGlkZXIgZm9yIHRlc3Rpbmcgc2NvcmUgY2hhbmdlc1xuICAgIGNvbnN0IHNjb3JlU2xpZGVyID0gbmV3IEhCb3goIHtcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIDIwLFxuICAgICAgdG9wOiBzdGF0dXNCYXIuYm90dG9tICsgMzAsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgVGV4dCggJ1Njb3JlOiAnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICksXG4gICAgICAgIG5ldyBIU2xpZGVyKCBzY29yZVByb3BlcnR5LCBzY29yZVByb3BlcnR5LnJhbmdlIClcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBjb25zdCBvcGVuQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgICAgY29udGVudDogbmV3IFRleHQoICdvcGVuIFJld2FyZERpYWxvZycsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSxcbiAgICAgIGxpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcmV3YXJkRGlhbG9nID0gbmV3IFJld2FyZERpYWxvZyggMTAsIHtcbiAgICAgICAgICBrZWVwR29pbmdCdXR0b25MaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coICdLZWVwIEdvaW5nIGJ1dHRvbicgKTtcbiAgICAgICAgICAgIHJld2FyZERpYWxvZy5kaXNwb3NlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBuZXdMZXZlbEJ1dHRvbkxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ05ldyBMZXZlbCBidXR0b24nICk7XG4gICAgICAgICAgICByZXdhcmREaWFsb2cuZGlzcG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgICByZXdhcmREaWFsb2cuc2hvdygpO1xuICAgICAgfSxcbiAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApO1xuXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcbiAgICAgIHN0YXR1c0JhcixcbiAgICAgIHNjb3JlU2xpZGVyLFxuICAgICAgb3BlbkJ1dHRvblxuICAgIF07XG4gIH1cbn1cblxudmVnYXMucmVnaXN0ZXIoICdJbmZpbml0ZUNoYWxsZW5nZXNTY3JlZW5WaWV3JywgSW5maW5pdGVDaGFsbGVuZ2VzU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiU2NyZWVuVmlldyIsIlBoZXRGb250IiwiU3RhdHVzQmFyIiwiSEJveCIsIlRleHQiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJIU2xpZGVyIiwiVGFuZGVtIiwiSW5maW5pdGVTdGF0dXNCYXIiLCJSZXdhcmREaWFsb2ciLCJ2ZWdhcyIsIkluZmluaXRlQ2hhbGxlbmdlc1NjcmVlblZpZXciLCJ0YW5kZW0iLCJPUFRfT1VUIiwic2NvcmVQcm9wZXJ0eSIsInJhbmdlIiwibWVzc2FnZU5vZGUiLCJmb250IiwiREVGQVVMVF9GT05UIiwic3RhdHVzQmFyIiwibGF5b3V0Qm91bmRzIiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwiYmFja0J1dHRvbkxpc3RlbmVyIiwiY29uc29sZSIsImxvZyIsInNjb3JlU2xpZGVyIiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJjaGlsZHJlbiIsIm9wZW5CdXR0b24iLCJjb250ZW50IiwibGlzdGVuZXIiLCJyZXdhcmREaWFsb2ciLCJrZWVwR29pbmdCdXR0b25MaXN0ZW5lciIsImRpc3Bvc2UiLCJuZXdMZXZlbEJ1dHRvbkxpc3RlbmVyIiwic2hvdyIsImNlbnRlciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLG9CQUFvQixxQ0FBcUM7QUFDaEUsT0FBT0MsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsZ0JBQWdCLGtDQUFrQztBQUN6RCxPQUFPQyxjQUFjLHVDQUF1QztBQUM1RCxPQUFPQyxlQUFlLHdDQUF3QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxpQ0FBaUM7QUFDNUQsT0FBT0MsMkJBQTJCLG1EQUFtRDtBQUNyRixPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyx1QkFBdUIsMEJBQTBCO0FBQ3hELE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0MsV0FBVyxjQUFjO0FBRWpCLElBQUEsQUFBTUMsK0JBQU4sTUFBTUEscUNBQXFDWDtJQUV4RCxhQUFxQjtRQUVuQixLQUFLLENBQUU7WUFDTFksUUFBUUwsT0FBT00sT0FBTztRQUN4QjtRQUVBLE1BQU1DLGdCQUFnQixJQUFJaEIsZUFBZ0IsR0FBRztZQUMzQ2lCLE9BQU8sSUFBSWhCLE1BQU8sR0FBRztRQUN2QjtRQUVBLHFCQUFxQjtRQUNyQixNQUFNaUIsY0FBYyxJQUFJWixLQUFNLDBCQUEwQjtZQUN0RGEsTUFBTWYsVUFBVWdCLFlBQVk7UUFDOUI7UUFDQSxNQUFNQyxZQUFZLElBQUlYLGtCQUFtQixJQUFJLENBQUNZLFlBQVksRUFBRSxJQUFJLENBQUNDLHFCQUFxQixFQUFFTCxhQUFhRixlQUFlO1lBQ2xIUSxvQkFBb0IsSUFBTUMsUUFBUUMsR0FBRyxDQUFFO1lBQ3ZDWixRQUFRTCxPQUFPTSxPQUFPO1FBQ3hCO1FBRUEsbUNBQW1DO1FBQ25DLE1BQU1ZLGNBQWMsSUFBSXRCLEtBQU07WUFDNUJ1QixPQUFPLElBQUksQ0FBQ04sWUFBWSxDQUFDTSxLQUFLLEdBQUc7WUFDakNDLEtBQUtSLFVBQVVTLE1BQU0sR0FBRztZQUN4QkMsVUFBVTtnQkFDUixJQUFJekIsS0FBTSxXQUFXO29CQUFFYSxNQUFNLElBQUloQixTQUFVO2dCQUFLO2dCQUNoRCxJQUFJSyxRQUFTUSxlQUFlQSxjQUFjQyxLQUFLO2FBQ2hEO1FBQ0g7UUFFQSxNQUFNZSxhQUFhLElBQUl6QixzQkFBdUI7WUFDNUMwQixTQUFTLElBQUkzQixLQUFNLHFCQUFxQjtnQkFBRWEsTUFBTSxJQUFJaEIsU0FBVTtZQUFLO1lBQ25FK0IsVUFBVTtnQkFDUixNQUFNQyxlQUFlLElBQUl4QixhQUFjLElBQUk7b0JBQ3pDeUIseUJBQXlCO3dCQUN2QlgsUUFBUUMsR0FBRyxDQUFFO3dCQUNiUyxhQUFhRSxPQUFPO29CQUN0QjtvQkFDQUMsd0JBQXdCO3dCQUN0QmIsUUFBUUMsR0FBRyxDQUFFO3dCQUNiUyxhQUFhRSxPQUFPO29CQUN0QjtnQkFDRjtnQkFDQUYsYUFBYUksSUFBSTtZQUNuQjtZQUNBQyxRQUFRLElBQUksQ0FBQ2xCLFlBQVksQ0FBQ2tCLE1BQU07UUFDbEM7UUFFQSxJQUFJLENBQUNULFFBQVEsR0FBRztZQUNkVjtZQUNBTTtZQUNBSztTQUNEO0lBQ0g7QUFDRjtBQXZEQSxTQUFxQm5CLDBDQXVEcEI7QUFFREQsTUFBTTZCLFFBQVEsQ0FBRSxnQ0FBZ0M1QiJ9