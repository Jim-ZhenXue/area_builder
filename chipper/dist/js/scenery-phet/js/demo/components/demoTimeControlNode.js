// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for ThermometerNode
 *
 * @author Jesse Greenberg
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import PhetFont from '../../PhetFont.js';
import TimeControlNode from '../../TimeControlNode.js';
import TimeSpeed from '../../TimeSpeed.js';
export default function demoTimeControlNode(layoutBounds) {
    const defaultTimeControlNode = new TimeControlNode(new BooleanProperty(true));
    // a TimeControlNode with all push buttons
    const pushButtonTimeControlNode = new TimeControlNode(new BooleanProperty(true), {
        playPauseStepButtonOptions: {
            includeStepBackwardButton: true,
            playPauseButtonOptions: {
                scaleFactorWhenNotPlaying: 1.3
            }
        }
    });
    // a TimeControlNode with default speed radio buttons, with large font to show that radio button size changes
    // to match height of radio button labels.
    const speedTimeControlNode = new TimeControlNode(new BooleanProperty(true), {
        timeSpeedProperty: new EnumerationProperty(TimeSpeed.NORMAL),
        speedRadioButtonGroupOptions: {
            labelOptions: {
                font: new PhetFont(30)
            }
        }
    });
    const enabledProperty = new BooleanProperty(true);
    // a TimeControlNode with swapped layout for radio buttons with radio buttons wrapped in a panel
    const customTimeControlNode = new TimeControlNode(new BooleanProperty(true), {
        timeSpeedProperty: new EnumerationProperty(TimeSpeed.SLOW),
        timeSpeeds: [
            TimeSpeed.NORMAL,
            TimeSpeed.FAST,
            TimeSpeed.SLOW
        ],
        speedRadioButtonGroupOnLeft: true,
        speedRadioButtonGroupPanelOptions: {
            fill: 'rgb(239,239,195)'
        },
        buttonGroupXSpacing: 40,
        wrapSpeedRadioButtonGroupInPanel: true,
        enabledProperty: enabledProperty
    });
    const enabledLabelNode = new Text('enabled', {
        font: new PhetFont(20)
    });
    const enabledCheckbox = new Checkbox(enabledProperty, enabledLabelNode);
    return new VBox({
        children: [
            defaultTimeControlNode,
            pushButtonTimeControlNode,
            speedTimeControlNode,
            customTimeControlNode,
            enabledCheckbox
        ],
        spacing: 30,
        center: layoutBounds.center,
        resize: false
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1RpbWVDb250cm9sTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBUaGVybW9tZXRlck5vZGVcbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi9UaW1lQ29udHJvbE5vZGUuanMnO1xuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi9UaW1lU3BlZWQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vVGltZUNvbnRyb2xOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgZGVmYXVsdFRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKSApO1xuXG4gIC8vIGEgVGltZUNvbnRyb2xOb2RlIHdpdGggYWxsIHB1c2ggYnV0dG9uc1xuICBjb25zdCBwdXNoQnV0dG9uVGltZUNvbnRyb2xOb2RlID0gbmV3IFRpbWVDb250cm9sTm9kZSggbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLCB7XG4gICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgIGluY2x1ZGVTdGVwQmFja3dhcmRCdXR0b246IHRydWUsXG4gICAgICBwbGF5UGF1c2VCdXR0b25PcHRpb25zOiB7XG4gICAgICAgIHNjYWxlRmFjdG9yV2hlbk5vdFBsYXlpbmc6IDEuM1xuICAgICAgfVxuICAgIH1cbiAgfSApO1xuXG4gIC8vIGEgVGltZUNvbnRyb2xOb2RlIHdpdGggZGVmYXVsdCBzcGVlZCByYWRpbyBidXR0b25zLCB3aXRoIGxhcmdlIGZvbnQgdG8gc2hvdyB0aGF0IHJhZGlvIGJ1dHRvbiBzaXplIGNoYW5nZXNcbiAgLy8gdG8gbWF0Y2ggaGVpZ2h0IG9mIHJhZGlvIGJ1dHRvbiBsYWJlbHMuXG4gIGNvbnN0IHNwZWVkVGltZUNvbnRyb2xOb2RlID0gbmV3IFRpbWVDb250cm9sTm9kZSggbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLCB7XG4gICAgdGltZVNwZWVkUHJvcGVydHk6IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBUaW1lU3BlZWQuTk9STUFMICksXG4gICAgc3BlZWRSYWRpb0J1dHRvbkdyb3VwT3B0aW9uczoge1xuICAgICAgbGFiZWxPcHRpb25zOiB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKVxuICAgICAgfVxuICAgIH1cbiAgfSApO1xuXG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcblxuICAvLyBhIFRpbWVDb250cm9sTm9kZSB3aXRoIHN3YXBwZWQgbGF5b3V0IGZvciByYWRpbyBidXR0b25zIHdpdGggcmFkaW8gYnV0dG9ucyB3cmFwcGVkIGluIGEgcGFuZWxcbiAgY29uc3QgY3VzdG9tVGltZUNvbnRyb2xOb2RlID0gbmV3IFRpbWVDb250cm9sTm9kZSggbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApLCB7XG4gICAgdGltZVNwZWVkUHJvcGVydHk6IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBUaW1lU3BlZWQuU0xPVyApLFxuICAgIHRpbWVTcGVlZHM6IFsgVGltZVNwZWVkLk5PUk1BTCwgVGltZVNwZWVkLkZBU1QsIFRpbWVTcGVlZC5TTE9XIF0sXG4gICAgc3BlZWRSYWRpb0J1dHRvbkdyb3VwT25MZWZ0OiB0cnVlLFxuICAgIHNwZWVkUmFkaW9CdXR0b25Hcm91cFBhbmVsT3B0aW9uczoge1xuICAgICAgZmlsbDogJ3JnYigyMzksMjM5LDE5NSknXG4gICAgfSxcbiAgICBidXR0b25Hcm91cFhTcGFjaW5nOiA0MCxcbiAgICB3cmFwU3BlZWRSYWRpb0J1dHRvbkdyb3VwSW5QYW5lbDogdHJ1ZSxcbiAgICBlbmFibGVkUHJvcGVydHk6IGVuYWJsZWRQcm9wZXJ0eVxuICB9ICk7XG5cbiAgY29uc3QgZW5hYmxlZExhYmVsTm9kZSA9IG5ldyBUZXh0KCAnZW5hYmxlZCcsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKTtcbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksIGVuYWJsZWRMYWJlbE5vZGUgKTtcblxuICByZXR1cm4gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogW1xuICAgICAgZGVmYXVsdFRpbWVDb250cm9sTm9kZSxcbiAgICAgIHB1c2hCdXR0b25UaW1lQ29udHJvbE5vZGUsXG4gICAgICBzcGVlZFRpbWVDb250cm9sTm9kZSxcbiAgICAgIGN1c3RvbVRpbWVDb250cm9sTm9kZSxcbiAgICAgIGVuYWJsZWRDaGVja2JveFxuICAgIF0sXG4gICAgc3BhY2luZzogMzAsXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgIHJlc2l6ZTogZmFsc2VcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsIlBoZXRGb250IiwiVGltZUNvbnRyb2xOb2RlIiwiVGltZVNwZWVkIiwiZGVtb1RpbWVDb250cm9sTm9kZSIsImxheW91dEJvdW5kcyIsImRlZmF1bHRUaW1lQ29udHJvbE5vZGUiLCJwdXNoQnV0dG9uVGltZUNvbnRyb2xOb2RlIiwicGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnMiLCJpbmNsdWRlU3RlcEJhY2t3YXJkQnV0dG9uIiwicGxheVBhdXNlQnV0dG9uT3B0aW9ucyIsInNjYWxlRmFjdG9yV2hlbk5vdFBsYXlpbmciLCJzcGVlZFRpbWVDb250cm9sTm9kZSIsInRpbWVTcGVlZFByb3BlcnR5IiwiTk9STUFMIiwic3BlZWRSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyIsImxhYmVsT3B0aW9ucyIsImZvbnQiLCJlbmFibGVkUHJvcGVydHkiLCJjdXN0b21UaW1lQ29udHJvbE5vZGUiLCJTTE9XIiwidGltZVNwZWVkcyIsIkZBU1QiLCJzcGVlZFJhZGlvQnV0dG9uR3JvdXBPbkxlZnQiLCJzcGVlZFJhZGlvQnV0dG9uR3JvdXBQYW5lbE9wdGlvbnMiLCJmaWxsIiwiYnV0dG9uR3JvdXBYU3BhY2luZyIsIndyYXBTcGVlZFJhZGlvQnV0dG9uR3JvdXBJblBhbmVsIiwiZW5hYmxlZExhYmVsTm9kZSIsImVuYWJsZWRDaGVja2JveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImNlbnRlciIsInJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIseUNBQXlDO0FBQ3JFLE9BQU9DLHlCQUF5Qiw2Q0FBNkM7QUFFN0UsU0FBZUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3JFLE9BQU9DLGNBQWMsaUNBQWlDO0FBQ3RELE9BQU9DLGNBQWMsb0JBQW9CO0FBQ3pDLE9BQU9DLHFCQUFxQiwyQkFBMkI7QUFDdkQsT0FBT0MsZUFBZSxxQkFBcUI7QUFFM0MsZUFBZSxTQUFTQyxvQkFBcUJDLFlBQXFCO0lBRWhFLE1BQU1DLHlCQUF5QixJQUFJSixnQkFBaUIsSUFBSU4sZ0JBQWlCO0lBRXpFLDBDQUEwQztJQUMxQyxNQUFNVyw0QkFBNEIsSUFBSUwsZ0JBQWlCLElBQUlOLGdCQUFpQixPQUFRO1FBQ2xGWSw0QkFBNEI7WUFDMUJDLDJCQUEyQjtZQUMzQkMsd0JBQXdCO2dCQUN0QkMsMkJBQTJCO1lBQzdCO1FBQ0Y7SUFDRjtJQUVBLDZHQUE2RztJQUM3RywwQ0FBMEM7SUFDMUMsTUFBTUMsdUJBQXVCLElBQUlWLGdCQUFpQixJQUFJTixnQkFBaUIsT0FBUTtRQUM3RWlCLG1CQUFtQixJQUFJaEIsb0JBQXFCTSxVQUFVVyxNQUFNO1FBQzVEQyw4QkFBOEI7WUFDNUJDLGNBQWM7Z0JBQ1pDLE1BQU0sSUFBSWhCLFNBQVU7WUFDdEI7UUFDRjtJQUNGO0lBRUEsTUFBTWlCLGtCQUFrQixJQUFJdEIsZ0JBQWlCO0lBRTdDLGdHQUFnRztJQUNoRyxNQUFNdUIsd0JBQXdCLElBQUlqQixnQkFBaUIsSUFBSU4sZ0JBQWlCLE9BQVE7UUFDOUVpQixtQkFBbUIsSUFBSWhCLG9CQUFxQk0sVUFBVWlCLElBQUk7UUFDMURDLFlBQVk7WUFBRWxCLFVBQVVXLE1BQU07WUFBRVgsVUFBVW1CLElBQUk7WUFBRW5CLFVBQVVpQixJQUFJO1NBQUU7UUFDaEVHLDZCQUE2QjtRQUM3QkMsbUNBQW1DO1lBQ2pDQyxNQUFNO1FBQ1I7UUFDQUMscUJBQXFCO1FBQ3JCQyxrQ0FBa0M7UUFDbENULGlCQUFpQkE7SUFDbkI7SUFFQSxNQUFNVSxtQkFBbUIsSUFBSTlCLEtBQU0sV0FBVztRQUFFbUIsTUFBTSxJQUFJaEIsU0FBVTtJQUFLO0lBQ3pFLE1BQU00QixrQkFBa0IsSUFBSTdCLFNBQVVrQixpQkFBaUJVO0lBRXZELE9BQU8sSUFBSTdCLEtBQU07UUFDZitCLFVBQVU7WUFDUnhCO1lBQ0FDO1lBQ0FLO1lBQ0FPO1lBQ0FVO1NBQ0Q7UUFDREUsU0FBUztRQUNUQyxRQUFRM0IsYUFBYTJCLE1BQU07UUFDM0JDLFFBQVE7SUFDVjtBQUNGIn0=